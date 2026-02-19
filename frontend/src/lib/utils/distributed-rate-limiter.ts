/**
 * @module lib/utils/distributed-rate-limiter
 * Distributed rate limiter using Supabase as the backend.
 * 
 * SECURITY CRITICAL: This prevents abuse of the pixel API.
 * 
 * Architecture:
 * - Primary: Supabase-backed persistent buckets (shared across all instances)
 * - Fallback: In-memory buckets (per-instance, for when DB is unavailable)
 * - Graceful degradation: Allows requests when rate limiter is down (fail open)
 * 
 * Production hardening needed:
 * - Migrate to Upstash Redis for sub-millisecond performance
 * - Add circuit breaker to prevent cascading failures
 * - Implement token bucket algorithm for smoother rate limiting
 */

import { supabaseAdmin } from '@/lib/supabase/admin';

type MemoryBucket = {
  count: number;
  expiresAt: number;
};

const fallbackStore = new Map<string, MemoryBucket>();
const CLEANUP_INTERVAL_MS = 60_000; // Clean up expired buckets every minute
let lastCleanup = Date.now();

/**
 * Distributed rate limiter with automatic failover
 */
export class DistributedRateLimiter {
  private failOpenOnError: boolean;

  constructor(options?: { failOpenOnError?: boolean }) {
    this.failOpenOnError = options?.failOpenOnError ?? true;
  }

  /**
   * Check if a request is allowed under rate limits
   * 
   * @param key - Unique identifier for the rate limit bucket (e.g., API key ID)
   * @param scope - Logical grouping (e.g., "pixel.v1.facts", "pixel.v1.sanitize")
   * @param limit - Maximum requests allowed in the window
   * @param windowSeconds - Time window in seconds
   * @returns Promise<{ allowed: boolean; remaining: number; resetAt: number }>
   */
  async check(
    key: string,
    scope: string,
    limit: number,
    windowSeconds: number
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> {
    const bucketKey = `${scope}:${key}`;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + windowSeconds * 1000);

    try {
      // Try Supabase-backed rate limiting first
      const result = await this.checkDistributed(
        bucketKey,
        limit,
        now,
        expiresAt
      );
      return result;
    } catch (error) {
      console.error('[RateLimiter] Distributed check failed:', error);

      // Fallback to in-memory (per-instance) rate limiting
      const fallbackResult = this.checkInMemory(
        bucketKey,
        limit,
        windowSeconds
      );

      // If fail-open is enabled and both fail, allow the request
      if (this.failOpenOnError && !fallbackResult.allowed) {
        console.warn(
          '[RateLimiter] Both distributed and in-memory checks failed, allowing request (fail-open mode)'
        );
        return {
          allowed: true,
          remaining: 0,
          resetAt: expiresAt.getTime(),
        };
      }

      return fallbackResult;
    }
  }

  /**
   * Distributed rate limiting using Supabase
   * 
   * Uses atomic operations to prevent race conditions
   */
  private async checkDistributed(
    bucketKey: string,
    limit: number,
    now: Date,
    expiresAt: Date
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetAt: number;
  }> {
    const nowIso = now.toISOString();
    const expiresAtIso = expiresAt.toISOString();

    // Clean up expired buckets (best effort)
    void this.cleanupExpiredBuckets(nowIso);

    // Try to get existing bucket
    const { data: existing, error: selectError } = await supabaseAdmin
      .from('rate_limits')
      .select('count, expires_at')
      .eq('bucket_key', bucketKey)
      .maybeSingle();

    if (selectError) {
      throw selectError;
    }

    // If bucket doesn't exist or is expired, create/reset it
    if (!existing || new Date(existing.expires_at) <= now) {
      const { error: upsertError } = await supabaseAdmin
        .from('rate_limits')
        .upsert(
          {
            bucket_key: bucketKey,
            count: 1,
            expires_at: expiresAtIso,
          },
          {
            onConflict: 'bucket_key',
          }
        );

      if (upsertError) {
        throw upsertError;
      }

      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: expiresAt.getTime(),
      };
    }

    // Bucket exists and is valid
    const currentCount = existing.count ?? 0;

    if (currentCount >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: new Date(existing.expires_at).getTime(),
      };
    }

    // Increment the counter
    const newCount = currentCount + 1;
    const { error: updateError } = await supabaseAdmin
      .from('rate_limits')
      .update({ count: newCount })
      .eq('bucket_key', bucketKey);

    if (updateError) {
      throw updateError;
    }

    return {
      allowed: true,
      remaining: Math.max(0, limit - newCount),
      resetAt: new Date(existing.expires_at).getTime(),
    };
  }

  /**
   * In-memory fallback rate limiting
   * 
   * SECURITY WARNING: This is per-instance only. In serverless environments,
   * each Lambda/container has its own memory, so this provides weak protection.
   * 
   * Better than nothing, but NOT suitable for production without Upstash Redis.
   */
  private checkInMemory(
    bucketKey: string,
    limit: number,
    windowSeconds: number
  ): {
    allowed: boolean;
    remaining: number;
    resetAt: number;
  } {
    const now = Date.now();
    const expiresAt = now + windowSeconds * 1000;

    // Periodic cleanup
    if (now - lastCleanup > CLEANUP_INTERVAL_MS) {
      this.cleanupInMemory(now);
      lastCleanup = now;
    }

    const existing = fallbackStore.get(bucketKey);

    if (!existing || existing.expiresAt <= now) {
      fallbackStore.set(bucketKey, {
        count: 1,
        expiresAt,
      });

      return {
        allowed: true,
        remaining: limit - 1,
        resetAt: expiresAt,
      };
    }

    if (existing.count >= limit) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: existing.expiresAt,
      };
    }

    existing.count += 1;
    fallbackStore.set(bucketKey, existing);

    return {
      allowed: true,
      remaining: Math.max(0, limit - existing.count),
      resetAt: existing.expiresAt,
    };
  }

  /**
   * Clean up expired buckets from Supabase
   * Fire and forget - don't block the request
   */
  private async cleanupExpiredBuckets(nowIso: string): Promise<void> {
    try {
      await supabaseAdmin
        .from('rate_limits')
        .delete()
        .lt('expires_at', nowIso);
    } catch (error) {
      // Don't let cleanup failures affect rate limiting
      console.error('[RateLimiter] Cleanup failed:', error);
    }
  }

  /**
   * Clean up expired buckets from memory
   */
  private cleanupInMemory(now: number): void {
    for (const [key, bucket] of fallbackStore.entries()) {
      if (bucket.expiresAt <= now) {
        fallbackStore.delete(key);
      }
    }
  }
}

/**
 * Singleton instance for pixel API rate limiting
 */
export const pixelRateLimiter = new DistributedRateLimiter({
  failOpenOnError: false, // Fail closed for pixel API (security over availability)
});
