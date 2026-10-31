import { describe, expect, it } from 'vitest';
import {
  ACHIEVEMENTS_PATH,
  isAchievementsRoute,
  isKnownRoute,
  isMemorialRoute,
  isOyukRoute,
  OYUK_PATH,
} from './routes';

describe('isKnownRoute, isOyukRoute & isAchievementsRoute', () => {
  it('knows live, hidden (/oyuk, /basarimlar), and alias routes', () => {
    expect(isKnownRoute('/')).toBe(true);
    expect(isKnownRoute('/miras')).toBe(true);
    expect(isKnownRoute('/about')).toBe(true);
    expect(isKnownRoute(OYUK_PATH)).toBe(true);
    expect(isKnownRoute(ACHIEVEMENTS_PATH)).toBe(true);
    expect(isOyukRoute('/oyuk')).toBe(true);
    expect(isOyukRoute('/miras')).toBe(false);
    expect(isAchievementsRoute('/basarimlar')).toBe(true);
    expect(isAchievementsRoute('/oyuk')).toBe(false);
    expect(isMemorialRoute('/miras')).toBe(true);
    expect(isMemorialRoute('/atam')).toBe(true);
    expect(isMemorialRoute('/hakkimda')).toBe(false);
  });

  it('404s unknown and removed league', () => {
    expect(isKnownRoute('/league')).toBe(false);
    expect(isKnownRoute('/nope')).toBe(false);
    expect(isKnownRoute('/kayip-iz')).toBe(false);
  });
});
