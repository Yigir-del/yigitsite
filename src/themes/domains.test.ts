import { describe, expect, it } from 'vitest';
import { DOMAINS, DOMAIN_MAP } from './domains';
import { resolveSceneAtmosphere } from '../components/canvas/domains/Muryokusho';

describe('DOMAINS token consistency & 3D scene atmosphere', () => {
  it('defines the exact same CSS variable keys across all 3 domains', () => {
    const baseKeys = Object.keys(DOMAIN_MAP.Muryokusho.css).sort();
    expect(baseKeys).toContain('--text-main');
    expect(baseKeys).toContain('--text-primary');
    expect(baseKeys).toContain('--bg-dark-navy');
    expect(baseKeys).toContain('--bg-main');

    for (const domain of DOMAINS) {
      expect(Object.keys(domain.css).sort()).toEqual(baseKeys);
    }
  });

  it('maps domain themes and quiet memorial state to 3D scene atmosphere colors', () => {
    const muryo = resolveSceneAtmosphere('Muryokusho', false);
    const fukuma = resolveSceneAtmosphere('FukumaMizushi', false);
    const kango = resolveSceneAtmosphere('KangoAneitei', false);
    const hushed = resolveSceneAtmosphere('FukumaMizushi', true);

    expect(muryo.bgColor).not.toBe(fukuma.bgColor);
    expect(fukuma.bgColor).toBe(DOMAIN_MAP.FukumaMizushi.fogHint);
    expect(kango.bgColor).toBe(DOMAIN_MAP.KangoAneitei.fogHint);
    expect(hushed.ambient).toBe(0.42);
    expect(hushed.dir).toBe(0.85);
  });
});
