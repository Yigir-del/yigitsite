import { describe, expect, it } from 'vitest';
import { isKnownRoute } from './routes';

describe('isKnownRoute', () => {
  it('knows live and alias routes', () => {
    expect(isKnownRoute('/')).toBe(true);
    expect(isKnownRoute('/miras')).toBe(true);
    expect(isKnownRoute('/about')).toBe(true);
  });

  it('404s unknown and removed league', () => {
    expect(isKnownRoute('/league')).toBe(false);
    expect(isKnownRoute('/nope')).toBe(false);
  });
});
