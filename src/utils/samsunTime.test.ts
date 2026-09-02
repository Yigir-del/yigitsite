import { describe, expect, it } from 'vitest';
import { istanbulDayKey, istanbulMonthKey } from './samsunTime';
import { hashStarPos } from './noteTraces';

describe('samsunTime', () => {
  it('formats a stable Istanbul day key', () => {
    expect(istanbulDayKey(Date.UTC(2026, 8, 2, 21, 0, 0))).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(istanbulMonthKey(Date.UTC(2026, 8, 2, 21, 0, 0))).toBe('2026-09');
  });
});

describe('hashStarPos', () => {
  it('is stable for the same id', () => {
    expect(hashStarPos('abc')).toEqual(hashStarPos('abc'));
    expect(hashStarPos('abc')).not.toEqual(hashStarPos('xyz'));
  });
});
