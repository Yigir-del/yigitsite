import { describe, expect, it } from 'vitest';
import { DOMAINS, DOMAIN_MAP, applyDomainCss } from './domains';
import { resolveSceneAtmosphere } from '../components/canvas/domains/Muryokusho';

describe('DOMAINS token consistency, cycling & 3D scene atmosphere', () => {
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

  it('cycles deterministically through Muryokusho -> FukumaMizushi -> KangoAneitei -> Muryokusho (§2.3)', () => {
    expect(DOMAINS.map((d) => d.id)).toEqual([
      'Muryokusho',
      'FukumaMizushi',
      'KangoAneitei',
    ]);

    let currentIndex = 0;
    const visited: string[] = [DOMAINS[currentIndex].id];
    for (let step = 0; step < 3; step++) {
      currentIndex = (currentIndex + 1) % DOMAINS.length;
      visited.push(DOMAINS[currentIndex].id);
    }

    expect(visited).toEqual([
      'Muryokusho',
      'FukumaMizushi',
      'KangoAneitei',
      'Muryokusho',
    ]);

    // Safe no-op in non-DOM test environment
    expect(() => applyDomainCss('FukumaMizushi')).not.toThrow();
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
