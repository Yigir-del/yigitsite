const buckets = new Map<string, number[]>();

/** In-memory limiter. Resets per serverless isolate — still blocks burst spam. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}

export const WINDOW = {
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
} as const;
