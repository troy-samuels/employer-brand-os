/**
 * @module lib/utils/rate-limiter
 * Provides a Supabase-backed rate limiter with in-memory fallback.
 *
 * The Supabase path is best-effort and time-bounded so audit requests do not
 * hang on database/network issues.
 */

type MemoryBucket = {
  count: number;
  expiresAt: number;
};

type SupabaseAdminLike = {
  from: (table: string) => {
    delete: () => {
      lt: (column: string, value: string) => Promise<{ error: unknown }>;
    };
    upsert: (
      values: Record<string, unknown>,
      options: { onConflict: string; ignoreDuplicates: boolean },
    ) => Promise<{ error: unknown }>;
    select: (columns: string) => {
      eq: (column: string, value: string) => {
        single: () => Promise<{
          data: { count: number; expires_at: string } | null;
          error: unknown;
        }>;
      };
    };
    update: (values: Record<string, unknown>) => {
      eq: (column: string, value: string) => {
        eq: (compareColumn: string, compareValue: number) => {
          select: (columns: string) => {
            maybeSingle: () => Promise<{
              data: { count: number } | null;
              error: unknown;
            }>;
          };
        };
        select: (columns: string) => {
          maybeSingle: () => Promise<{
            data: { count: number } | null;
            error: unknown;
          }>;
        };
      };
    };
  };
};

const fallbackStore = new Map<string, MemoryBucket>();
const FALLBACK_STORE_MAX_BUCKETS = 5_000;
const SUPABASE_CHECK_TIMEOUT_MS = 1_500;
const SUPABASE_CLEANUP_INTERVAL_MS = 5 * 60 * 1_000;
const SUPABASE_UPDATE_RETRY_LIMIT = 3;

let supabaseAdminPromise: Promise<SupabaseAdminLike> | null = null;

function withTimeout<T>(operation: Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("rate_limiter_timeout"));
    }, timeoutMs);

    operation.then(
      (result) => {
        clearTimeout(timer);
        resolve(result);
      },
      (error) => {
        clearTimeout(timer);
        reject(error);
      },
    );
  });
}

async function getSupabaseAdmin(): Promise<SupabaseAdminLike> {
  if (!supabaseAdminPromise) {
    supabaseAdminPromise = import("@/lib/supabase/admin").then(
      (module) => module.supabaseAdmin as unknown as SupabaseAdminLike,
    );
  }

  return supabaseAdminPromise;
}

/**
 * Applies request quotas using persistent buckets with graceful fallback.
 */
export class RateLimiter {
  private lastCleanupAt = 0;
  private cleanupInFlight: Promise<void> | null = null;

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
    windowSeconds: number,
  ): Promise<boolean> {
    if (!key) return true;

    const bucketKey = `${scope}:${key}`;

    try {
      return await withTimeout(
        this.checkWithSupabase(bucketKey, limit, windowSeconds),
        SUPABASE_CHECK_TIMEOUT_MS,
      );
    } catch (error) {
      console.error(
        "[RateLimiter] Supabase rate limit failed, using in-memory fallback:",
        error,
      );
      return this.checkInMemory(bucketKey, limit, windowSeconds);
    }
  }

  private async checkWithSupabase(
    bucketKey: string,
    limit: number,
    windowSeconds: number,
  ): Promise<boolean> {
    const admin = await getSupabaseAdmin();
    const now = new Date();
    const nowIso = now.toISOString();
    const expiresAtIso = new Date(now.getTime() + windowSeconds * 1000).toISOString();

    await this.ensureBucketExists(admin, bucketKey, expiresAtIso);
    this.maybeCleanupExpiredBuckets(admin, nowIso);

    for (let attempt = 0; attempt < SUPABASE_UPDATE_RETRY_LIMIT; attempt += 1) {
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
        const { data: resetData, error: resetError } = await admin
          .from("rate_limits")
          .update({
            count: 1,
            expires_at: expiresAtIso,
          })
          .eq("bucket_key", bucketKey)
          .select("count")
          .maybeSingle();

        if (!resetError && resetData) {
          return true;
        }

        if (attempt === SUPABASE_UPDATE_RETRY_LIMIT - 1) {
          throw resetError ?? new Error("Failed to reset expired rate limit bucket");
        }
        continue;
      }

      if (bucket.count >= limit) {
        return false;
      }

      const nextCount = bucket.count + 1;
      const { data: incrementData, error: incrementError } = await admin
        .from("rate_limits")
        .update({ count: nextCount })
        .eq("bucket_key", bucketKey)
        .eq("count", bucket.count)
        .select("count")
        .maybeSingle();

      if (!incrementError && incrementData) {
        return true;
      }

      if (attempt === SUPABASE_UPDATE_RETRY_LIMIT - 1) {
        throw incrementError ?? new Error("Failed to increment rate limit bucket");
      }
    }

    throw new Error("Exceeded rate limiter retries");
  }

  private async ensureBucketExists(
    admin: SupabaseAdminLike,
    bucketKey: string,
    expiresAtIso: string,
  ): Promise<void> {
    const { error } = await admin.from("rate_limits").upsert(
      {
        bucket_key: bucketKey,
        count: 0,
        expires_at: expiresAtIso,
      },
      {
        onConflict: "bucket_key",
        ignoreDuplicates: true,
      },
    );

    if (error) {
      throw error;
    }
  }

  private maybeCleanupExpiredBuckets(admin: SupabaseAdminLike, nowIso: string): void {
    const nowMs = Date.now();
    if (nowMs - this.lastCleanupAt < SUPABASE_CLEANUP_INTERVAL_MS) {
      return;
    }

    if (this.cleanupInFlight) {
      return;
    }

    this.lastCleanupAt = nowMs;
    this.cleanupInFlight = admin
      .from("rate_limits")
      .delete()
      .lt("expires_at", nowIso)
      .then(({ error }) => {
        if (error) {
          throw error;
        }
      })
      .catch((error) => {
        console.warn("[RateLimiter] Failed to cleanup expired buckets:", error);
      })
      .finally(() => {
        this.cleanupInFlight = null;
      });
  }

  private checkInMemory(
    bucketKey: string,
    limit: number,
    windowSeconds: number,
  ): boolean {
    const now = Date.now();
    this.pruneInMemoryBuckets(now);

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

  private pruneInMemoryBuckets(now: number): void {
    if (fallbackStore.size < FALLBACK_STORE_MAX_BUCKETS) {
      return;
    }

    for (const [key, bucket] of fallbackStore) {
      if (bucket.expiresAt <= now) {
        fallbackStore.delete(key);
      }
    }

    while (fallbackStore.size > FALLBACK_STORE_MAX_BUCKETS) {
      const oldestKey = fallbackStore.keys().next().value;
      if (!oldestKey) {
        break;
      }
      fallbackStore.delete(oldestKey);
    }
  }
}
