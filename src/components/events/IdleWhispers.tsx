import { useEffect, useState } from 'react';
import { getIsMobilePerf } from '../../hooks/useIsMobilePerf';
import { getPrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { releaseAmbient, takeAmbient } from '../../utils/ambientSlot';

const WHISPERS = [
  'hâlâ buradasın',
  'iz bırak',
  'boşluk bakıyor',
  'kral bekliyor',
  'defter açık',
  'hiçlikten merhaba',
];

const EDGES = ['whisper--left', 'whisper--right', 'whisper--bottom'] as const;
const IDLE_MS = 45_000;
const HOLD_MS = 7000;

export default function IdleWhispers() {
  const [line, setLine] = useState<string | null>(null);
  const [edge, setEdge] = useState<(typeof EDGES)[number]>('whisper--left');

  useEffect(() => {
    const mobile = getIsMobilePerf();
    let idleTimer: ReturnType<typeof setTimeout>;
    let holdTimer: ReturnType<typeof setTimeout>;
    let idleRaf = 0;

    const hide = () => {
      setLine(null);
      releaseAmbient('whisper');
    };

    const speak = () => {
      if (!takeAmbient('whisper')) return;
      setEdge(EDGES[Math.floor(Math.random() * (mobile ? 1 : EDGES.length))]);
      setLine(WHISPERS[Math.floor(Math.random() * WHISPERS.length)]);
      holdTimer = setTimeout(hide, HOLD_MS);
    };

    const schedule = () => {
      clearTimeout(idleTimer);
      hide();
      idleTimer = setTimeout(speak, mobile ? 90_000 : IDLE_MS);
    };

    const reset = () => {
      if (idleRaf) return;
      idleRaf = requestAnimationFrame(() => {
        idleRaf = 0;
        schedule();
      });
    };

    if (mobile) {
      window.addEventListener('touchstart', reset, { passive: true });
    } else {
      window.addEventListener('mousemove', reset, { passive: true });
      window.addEventListener('keydown', reset);
      window.addEventListener('scroll', reset, { passive: true });
    }
    schedule();

    return () => {
      clearTimeout(idleTimer);
      clearTimeout(holdTimer);
      cancelAnimationFrame(idleRaf);
      hide();
      window.removeEventListener('touchstart', reset);
      window.removeEventListener('mousemove', reset);
      window.removeEventListener('keydown', reset);
      window.removeEventListener('scroll', reset);
    };
  }, []);

  if (!line) return null;

  return (
    <p
      className={`idle-whisper ${edge}${getPrefersReducedMotion() ? ' idle-whisper--still' : ''}`}
      aria-hidden
    >
      {line}
    </p>
  );
}
