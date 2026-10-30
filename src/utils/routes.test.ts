import { describe, expect, it } from 'vitest';
import { isKnownRoute, isOyukRoute, OYUK_PATH } from './routes';

describe('isKnownRoute & isOyukRoute', () => {
  it('knows live, hidden (/oyuk), and alias routes', () => {
    expect(isKnownRoute('/')).toBe(true);
    expect(isKnownRoute('/miras')).toBe(true);
    expect(isKnownRoute('/about')).toBe(true);
    expect(isKnownRoute(OYUK_PATH)).toBe(true);
    expect(isOyukRoute('/oyuk')).toBe(true);
    expect(isOyukRoute('/miras')).toBe(false);
  });

  it('404s unknown and removed league', () => {
    expect(isKnownRoute('/league')).toBe(false);
    expect(isKnownRoute('/nope')).toBe(false);
  });
});
