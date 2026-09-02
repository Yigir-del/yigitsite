import { describe, expect, it } from 'vitest';
import { rateLimit } from './rateLimit.js';

describe('rateLimit', () => {
  it('allows up to max then blocks within the window', () => {
    const key = `test-${Math.random()}`;
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(true);
    expect(rateLimit(key, 2, 60_000)).toBe(false);
  });
});
