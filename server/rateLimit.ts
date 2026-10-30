const buckets = new Map<string, number[]>();
const MAX_BUCKETS = 2048;

export const WINDOW = {
  hour: 60 * 60 * 1000,
  minute: 60 * 1000,
} as const;

function pruneBuckets(now: number, maxWindowMs: number) {
  for (const [k, timestamps] of buckets.entries()) {
    const active = timestamps.filter((t) => now - t < maxWindowMs);
    if (active.length === 0) {
      buckets.delete(k);
    } else {
      buckets.set(k, active);
    }
  }
  while (buckets.size > MAX_BUCKETS) {
    const oldestKey = buckets.keys().next().value;
    if (oldestKey === undefined) break;
    buckets.delete(oldestKey);
  }
}

/** In-memory limiter. Resets per serverless isolate — still blocks burst spam. */
export function rateLimit(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) {
    pruneBuckets(now, Math.max(windowMs, WINDOW.hour));
  }

  const hits = (buckets.get(key) ?? []).filter((t) => now - t < windowMs);
  if (hits.length >= max) {
    buckets.set(key, hits);
    return false;
  }
  hits.push(now);
  buckets.set(key, hits);
  return true;
}
