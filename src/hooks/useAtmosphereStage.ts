import { useEffect, useState } from 'react';

export type AtmosphereStage = 'critical' | 'atmosphere' | 'characters' | 'chaos';

const STAGE_ORDER: AtmosphereStage[] = ['critical', 'atmosphere', 'characters', 'chaos'];

/**
 * Progressive atmosphere boot — same visuals, deferred init.
 * critical → atmosphere (~0ms after paint) → characters (~450ms) → chaos (~1100ms)
 */
export function useAtmosphereStage() {
  const [stage, setStage] = useState<AtmosphereStage>('critical');

  useEffect(() => {
    let cancelled = false;
    const timers: number[] = [];

    const advance = (next: AtmosphereStage, delay: number) => {
      const id = window.setTimeout(() => {
        if (!cancelled) setStage(next);
      }, delay);
      timers.push(id);
    };

    // After first paint: stars/canvas already requested via Suspense; mark atmosphere
    const idle =
      typeof window.requestIdleCallback === 'function'
        ? window.requestIdleCallback(
            () => {
              if (!cancelled) setStage('atmosphere');
              advance('characters', 450);
              advance('chaos', 1100);
            },
            { timeout: 200 },
          )
        : null;

    if (idle === null) {
      advance('atmosphere', 50);
      advance('characters', 500);
      advance('chaos', 1200);
    }

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      if (idle !== null && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idle);
      }
    };
  }, []);

  const ready = (min: AtmosphereStage) =>
    STAGE_ORDER.indexOf(stage) >= STAGE_ORDER.indexOf(min);

  return { stage, ready };
}
