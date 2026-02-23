import { beforeEach, describe, expect, it, vi } from "vitest";

const {
  buckets,
  failures,
  mockFrom,
} = vi.hoisted(() => {
  type Bucket = { count: number; expires_at: string };
  const state = new Map<string, Bucket>();
  const failureState = {
    upsert: false,
    select: false,
    update: false,
    delete: false,
  };

  const makeError = (kind: keyof typeof failureState) =>
    failureState[kind] ? new Error(`forced_${kind}_error`) : null;

  const from = vi.fn((table: string) => {
    if (table !== "rate_limits") {
      throw new Error(`unexpected table: ${table}`);
    }

    return {
      upsert: async (
        values: Record<string, unknown>,
        options?: { ignoreDuplicates?: boolean },
      ) => {
        const error = makeError("upsert");
        if (error) return { error };

        const bucketKey = String(values.bucket_key ?? "");
        if (!bucketKey) {
          return { error: new Error("missing bucket key") };
        }

        const existing = state.get(bucketKey);
        if (!existing) {
          state.set(bucketKey, {
            count: Number(values.count ?? 0),
            expires_at: String(values.expires_at ?? new Date().toISOString()),
          });
          return { error: null };
        }

        if (!options?.ignoreDuplicates) {
          state.set(bucketKey, {
            count:
              typeof values.count === "number" ? values.count : existing.count,
            expires_at:
              typeof values.expires_at === "string"
                ? values.expires_at
                : existing.expires_at,
          });
        }

        return { error: null };
      },

      select: (columns: string) => {
        void columns;
        return {
          eq: (column: string, value: string) => ({
            maybeSingle: async () => {
              const error = makeError("select");
              if (error) return { data: null, error };
              if (column !== "bucket_key") {
                return { data: null, error: new Error(`unexpected column: ${column}`) };
              }

              const bucket = state.get(value);
              if (!bucket) {
                return { data: null, error: null };
              }

              return {
                data: {
                  count: bucket.count,
                  expires_at: bucket.expires_at,
                },
                error: null,
              };
            },
          }),
        };
      },

      update: (values: Record<string, unknown>) => ({
        eq: (column: string, value: string) => {
          if (column !== "bucket_key") {
            throw new Error(`unexpected eq column: ${column}`);
          }

          return {
            eq: (compareColumn: string, compareValue: number) => ({
              select: (columns: string) => {
                void columns;
                return {
                  maybeSingle: async () => {
                    const error = makeError("update");
                    if (error) return { data: null, error };

                    if (compareColumn !== "count") {
                      return {
                        data: null,
                        error: new Error(`unexpected compare column: ${compareColumn}`),
                      };
                    }

                    const existing = state.get(value);
                    if (!existing || existing.count !== compareValue) {
                      return { data: null, error: null };
                    }

                    if (typeof values.count === "number") {
                      existing.count = values.count;
                    }
                    if (typeof values.expires_at === "string") {
                      existing.expires_at = values.expires_at;
                    }
                    state.set(value, existing);

                    return {
                      data: { count: existing.count },
                      error: null,
                    };
                  },
                };
              },
            }),

            select: (columns: string) => {
              void columns;
              return {
                maybeSingle: async () => {
                  const error = makeError("update");
                  if (error) return { data: null, error };

                  const existing = state.get(value);
                  if (!existing) {
                    return { data: null, error: null };
                  }

                  if (typeof values.count === "number") {
                    existing.count = values.count;
                  }
                  if (typeof values.expires_at === "string") {
                    existing.expires_at = values.expires_at;
                  }
                  state.set(value, existing);

                  return {
                    data: {
                      count: existing.count,
                      expires_at: existing.expires_at,
                    },
                    error: null,
                  };
                },
              };
            },
          };
        },
      }),

      delete: () => ({
        lt: async (column: string, iso: string) => {
          const error = makeError("delete");
          if (error) return { error };
          if (column !== "expires_at") {
            return { error: new Error(`unexpected delete column: ${column}`) };
          }

          const cutoff = new Date(iso).getTime();
          for (const [key, bucket] of state.entries()) {
            const expiresAt = new Date(bucket.expires_at).getTime();
            if (Number.isFinite(expiresAt) && expiresAt < cutoff) {
              state.delete(key);
            }
          }

          return { error: null };
        },
      }),
    };
  });

  return {
    buckets: state,
    failures: failureState,
    mockFrom: from,
  };
});

vi.mock("@/lib/supabase/admin", () => ({
  supabaseAdmin: {
    from: mockFrom,
  },
}));

import { DistributedRateLimiter } from "@/lib/utils/distributed-rate-limiter";

describe("DistributedRateLimiter", () => {
  beforeEach(() => {
    buckets.clear();
    failures.upsert = false;
    failures.select = false;
    failures.update = false;
    failures.delete = false;
    vi.clearAllMocks();
  });

  it("enforces limits using distributed storage", async () => {
    const limiter = new DistributedRateLimiter({ failOpenOnError: false });

    const first = await limiter.check("key-1", "pixel.v1.facts", 2, 60);
    const second = await limiter.check("key-1", "pixel.v1.facts", 2, 60);
    const third = await limiter.check("key-1", "pixel.v1.facts", 2, 60);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(1);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(0);
    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("resets expired distributed buckets", async () => {
    const limiter = new DistributedRateLimiter({ failOpenOnError: false });
    const bucketKey = "pixel.v1.sanitize:key-2";

    buckets.set(bucketKey, {
      count: 999,
      expires_at: new Date(Date.now() - 5_000).toISOString(),
    });

    const result = await limiter.check("key-2", "pixel.v1.sanitize", 5, 60);

    expect(result.allowed).toBe(true);
    expect(buckets.get(bucketKey)?.count).toBe(1);
  });

  it("falls back to in-memory limits when distributed checks fail", async () => {
    const limiter = new DistributedRateLimiter({ failOpenOnError: false });
    failures.select = true;

    const first = await limiter.check("key-3", "pixel.v1.crawl-log", 1, 60);
    const second = await limiter.check("key-3", "pixel.v1.crawl-log", 1, 60);

    expect(first.allowed).toBe(true);
    expect(second.allowed).toBe(false);
  });

  it("fails open only when explicitly configured and fallback also fails", async () => {
    const limiter = new DistributedRateLimiter({ failOpenOnError: true }) as unknown as {
      check: (
        key: string,
        scope: string,
        limit: number,
        windowSeconds: number,
      ) => Promise<{ allowed: boolean; remaining: number; resetAt: number }>;
      checkInMemory: () => never;
    };

    failures.select = true;
    limiter.checkInMemory = () => {
      throw new Error("forced_fallback_error");
    };

    const result = await limiter.check("key-4", "pixel.v1.facts", 1, 60);
    expect(result.allowed).toBe(true);
  });

  it("fails closed when configured and fallback fails", async () => {
    const limiter = new DistributedRateLimiter({ failOpenOnError: false }) as unknown as {
      check: (
        key: string,
        scope: string,
        limit: number,
        windowSeconds: number,
      ) => Promise<{ allowed: boolean; remaining: number; resetAt: number }>;
      checkInMemory: () => never;
    };

    failures.select = true;
    limiter.checkInMemory = () => {
      throw new Error("forced_fallback_error");
    };

    await expect(
      limiter.check("key-5", "pixel.v1.facts", 1, 60),
    ).rejects.toThrow("forced_fallback_error");
  });
});
