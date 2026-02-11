/**
 * @module lib/utils/rate-limiter
 * Provides a Supabase-backed rate limiter with in-memory fallback.
 *
 * **Serverless caveat:** The in-memory fallback (`fallbackStore`) will NOT
 * share state across serverless function invocations (e.g. Vercel). Each
 * cold start gets a fresh map. For production deployments on serverless
 * platforms, replace the fallback with Upstash Redis:
 *   `UPSTASH_REDIS_URL` + `UPSTASH_REDIS_TOKEN`
 *
 * @see https://upstash.com/docs/redis/sdks/ratelimit-ts/overview
 */

type MemoryBucket = {
  count: number;
  expiresAt: number;
};

const fallbackStore = new Map<string, MemoryBucket>();

/**
 * Applies request quotas using persistent buckets with graceful fallback.
 */
export class RateLimiter {
  /**
   * Checks whether a request key can proceed within the configured window.
   * @param key - The request identity key.
   * @param scope - The logical rate-limit scope.
   * @param limit - Maximum number of allowed requests in the window.
   * @param windowSeconds - Window duration in seconds.
   * @returns `true` when request is allowed, otherwise `false`.
   */
  async check(
    key: string | null,
    scope: string,
    limit: number,
    windowSeconds: number
  ): Promise<boolean> {
    if (!key) return true;

    const bucketKey = `${scope}:${key}`;
    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAtIso = new Date(
      now.getTime() + windowSeconds * 1000
    ).toISOString();

    try {
      // Dynamic import avoids circular dependency issues at module load.
      const { supabaseAdmin } = await import("@/lib/supabase/admin");
      const admin = supabaseAdmin;

      // Best-effort cleanup of expired buckets.
      const { error: cleanupError } = await admin
        .from("rate_limits")
        .delete()
        .lt("expires_at", nowIso);
      if (cleanupError) {
        throw cleanupError;
      }

      // Ensure the bucket exists for this scope/key pair.
      const { error: upsertError } = await admin.from("rate_limits").upsert(
        {
          bucket_key: bucketKey,
          count: 0,
          expires_at: expiresAtIso,
        },
        {
          onConflict: "bucket_key",
          ignoreDuplicates: true,
        }
      );
      if (upsertError) {
        throw upsertError;
      }

      const { data: bucket, error: selectError } = await admin
        .from("rate_limits")
        .select("count, expires_at")
        .eq("bucket_key", bucketKey)
        .single();
      if (selectError || !bucket) {
        throw selectError ?? new Error("Missing rate limit bucket");
      }

      const expiresAtMs = new Date(bucket.expires_at).getTime();
      if (!Number.isFinite(expiresAtMs) || expiresAtMs <= now.getTime()) {
        const { error: resetError } = await admin
          .from("rate_limits")
          .update({
            count: 0,
            expires_at: expiresAtIso,
          })
          .eq("bucket_key", bucketKey);
        if (resetError) {
          throw resetError;
        }
        bucket.count = 0;
      }

      const nextCount = bucket.count + 1;

      const { error: incrementError } = await admin
        .from("rate_limits")
        .update({ count: nextCount })
        .eq("bucket_key", bucketKey);
      if (incrementError) {
        throw incrementError;
      }

      return nextCount <= limit;
    } catch (error) {
      console.error(
        "[RateLimiter] Supabase rate limit failed, using in-memory fallback:",
        error
      );
      return this.checkInMemory(bucketKey, limit, windowSeconds);
    }
  }

  private checkInMemory(
    bucketKey: string,
    limit: number,
    windowSeconds: number
  ): boolean {
    const now = Date.now();
    const existing = fallbackStore.get(bucketKey);

    if (!existing || existing.expiresAt <= now) {
      fallbackStore.set(bucketKey, {
        count: 1,
        expiresAt: now + windowSeconds * 1000,
      });
      return true;
    }

    if (existing.count >= limit) {
      return false;
    }

    existing.count += 1;
    fallbackStore.set(bucketKey, existing);
    return true;
  }
}
