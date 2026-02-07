const store = new Map<string, { count: number; expiresAt: number }>();

export class RateLimiter {
  async check(key: string | null, scope: string, limit: number, windowSeconds: number) {
    if (!key) return true;

    const now = Date.now();
    const bucketKey = `${scope}:${key}`;
    const existing = store.get(bucketKey);

    if (!existing || existing.expiresAt < now) {
      store.set(bucketKey, { count: 1, expiresAt: now + windowSeconds * 1000 });
      return true;
    }

    if (existing.count >= limit) {
      return false;
    }

    existing.count += 1;
    store.set(bucketKey, existing);
    return true;
  }
}
