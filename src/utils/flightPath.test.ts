import { describe, expect, it } from 'vitest';
import { pointOnEdge } from './flightPath';

describe('pointOnEdge', () => {
  it('spawns outside the viewport', () => {
    const w = 1280;
    const h = 720;
    const left = pointOnEdge('left', w, h, 160);
    const right = pointOnEdge('right', w, h, 160);
    const top = pointOnEdge('top', w, h, 160);
    const bottom = pointOnEdge('bottom', w, h, 160);

    expect(left.x).toBeLessThan(0);
    expect(right.x).toBeGreaterThan(w);
    expect(top.y).toBeLessThan(0);
    expect(bottom.y).toBeGreaterThan(h);
  });
});
