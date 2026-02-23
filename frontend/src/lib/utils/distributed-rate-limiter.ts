/**
 * @module lib/utils/distributed-rate-limiter
 * Distributed rate limiter using Supabase as the backend.
 *
 * SECURITY CRITICAL: This prevents abuse of the pixel API.
 *
 * Architecture:
 * - Primary: Supabase-backed persistent buckets (shared across all instances)
 * - Fallback: In-memory buckets (per-instance, for when DB is unavailable)
 * - Graceful degradation: Falls back to memory if DB path fails
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
const SUPABASE_CLEANUP_INTERVAL_MS = 5 * 60_000;
const DISTRIBUTED_RETRY_LIMIT = 3;
const FALLBACK_MAX_BUCKETS = 5_000;
let lastCleanup = Date.now();
let lastSupabaseCleanup = 0;

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

      try {
        // Fallback to in-memory (per-instance) rate limiting
        return this.checkInMemory(
          bucketKey,
          limit,
          windowSeconds
        );
      } catch (fallbackError) {
        console.error('[RateLimiter] In-memory fallback check failed:', fallbackError);
        if (this.failOpenOnError) {
          return {
            allowed: true,
            remaining: Math.max(0, limit - 1),
            resetAt: expiresAt.getTime(),
          };
        }
        throw fallbackError;
      }
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

    this.maybeCleanupExpiredBuckets(nowIso);

    await this.ensureBucketExists(bucketKey, expiresAtIso);

    for (let attempt = 0; attempt < DISTRIBUTED_RETRY_LIMIT; attempt += 1) {
      const { data: bucket, error: selectError } = await supabaseAdmin
        .from('rate_limits')
        .select('count, expires_at')
        .eq('bucket_key', bucketKey)
        .maybeSingle();

      if (selectError || !bucket) {
        throw selectError ?? new Error('Missing distributed rate limit bucket');
      }

      const resetAt = this.parseResetAt(bucket.expires_at, expiresAt.getTime());
      const currentCount = bucket.count ?? 0;

      if (resetAt <= now.getTime()) {
        const { data: resetBucket, error: resetError } = await supabaseAdmin
          .from('rate_limits')
          .update({
            count: 1,
            expires_at: expiresAtIso,
          })
          .eq('bucket_key', bucketKey)
          .select('count, expires_at')
          .maybeSingle();

        if (!resetError && resetBucket) {
          return {
            allowed: true,
            remaining: Math.max(0, limit - 1),
            resetAt: this.parseResetAt(resetBucket.expires_at, expiresAt.getTime()),
          };
        }

        if (attempt === DISTRIBUTED_RETRY_LIMIT - 1) {
          throw resetError ?? new Error('Failed to reset expired rate limit bucket');
        }
        continue;
      }

      if (currentCount >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetAt,
        };
      }

      const nextCount = currentCount + 1;
      const { data: incremented, error: incrementError } = await supabaseAdmin
        .from('rate_limits')
        .update({ count: nextCount })
        .eq('bucket_key', bucketKey)
        .eq('count', currentCount)
        .select('count')
        .maybeSingle();

      if (!incrementError && incremented) {
        return {
          allowed: true,
          remaining: Math.max(0, limit - nextCount),
          resetAt,
        };
      }

      if (attempt === DISTRIBUTED_RETRY_LIMIT - 1) {
        throw incrementError ?? new Error('Failed to increment distributed rate limit bucket');
      }
    }

    throw new Error('Exceeded distributed rate limiter retry attempts');
  }

  private async ensureBucketExists(bucketKey: string, expiresAtIso: string): Promise<void> {
    const { error } = await supabaseAdmin
      .from('rate_limits')
      .upsert(
        {
          bucket_key: bucketKey,
          count: 0,
          expires_at: expiresAtIso,
        },
        {
          onConflict: 'bucket_key',
          ignoreDuplicates: true,
        },
      );

    if (error) {
      throw error;
    }
  }

  private parseResetAt(value: string | null, fallback: number): number {
    if (!value) {
      return fallback;
    }

    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  private maybeCleanupExpiredBuckets(nowIso: string): void {
    const nowMs = Date.now();
    if (nowMs - lastSupabaseCleanup < SUPABASE_CLEANUP_INTERVAL_MS) {
      return;
    }

    lastSupabaseCleanup = nowMs;
    void this.cleanupExpiredBuckets(nowIso);
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

    if (fallbackStore.size <= FALLBACK_MAX_BUCKETS) {
      return;
    }

    const entriesByExpiry = Array.from(fallbackStore.entries()).sort(
      (left, right) => left[1].expiresAt - right[1].expiresAt
    );
    const overflow = fallbackStore.size - FALLBACK_MAX_BUCKETS;

    for (let index = 0; index < overflow; index += 1) {
      const entry = entriesByExpiry[index];
      if (!entry) {
        break;
      }
      fallbackStore.delete(entry[0]);
    }
  }
}

/**
 * Singleton instance for pixel API rate limiting
 */
export const pixelRateLimiter = new DistributedRateLimiter({
  failOpenOnError: false, // Fail closed for pixel API (security over availability)
});
