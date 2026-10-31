import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isCinematicActive, useOyukState } from '../oyuk/oyukState';
import { useWorldMemory } from './worldMemoryStore';

const STONE_WHISPERS = [
  'taşlar seni hatırlıyor.',
  'aşağıdaki karanlık kapanmadı.',
  'oyuktan çıkanlar aynı gökyüzüne bakmaz.',
] as const;

/**
 * Subtle persistent environmental memory marker (§4.2 & §4.6).
 * Appears quietly on the homepage only after the visitor has entered and exited OYUK.
 * Reacts gently to cursor proximity and click/focus without obstructing any content.
 */
export default function WorldMemoryTrace() {
  const memory = useWorldMemory();
  const oyuk = useOyukState();
  const location = useLocation();
  const nodeRef = useRef<HTMLButtonElement | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [proximity, setProximity] = useState(0);
  const [whisperIndex, setWhisperIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);

  const visible =
    memory.hasReturnedFromOyuk &&
    location.pathname === '/' &&
    !isCinematicActive(oyuk.phase) &&
    oyuk.phase !== 'exiting';

  useEffect(() => {
    if (!visible) return;
    let raf = 0;

    const onPointerMove = (e: PointerEvent) => {
      if (raf) return;
      const cx = e.clientX;
      const cy = e.clientY;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const el = nodeRef.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const mx = rect.left + rect.width * 0.5;
        const my = rect.top + rect.height * 0.5;
        const dist = Math.hypot(cx - mx, cy - my);
        const nextProx = dist < 180 ? Math.max(0, 1 - dist / 180) : 0;
        setProximity((prev) => (Math.abs(prev - nextProx) > 0.04 ? nextProx : prev));
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onPointerMove);
    };
  }, [visible]);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  const handleActivate = () => {
    setRevealed(true);
    setWhisperIndex((prev) => (prev + 1) % STONE_WHISPERS.length);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      setRevealed(false);
    }, 3800);
  };

  const glowAlpha = (0.28 + proximity * 0.52).toFixed(2);

  return (
    <div
      className="world-memory-trace"
      style={{
        position: 'fixed',
        left: '1.65rem',
        bottom: '5.6rem',
        zIndex: 28,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.55rem',
      }}
    >
      <button
        ref={nodeRef}
        type="button"
        onClick={handleActivate}
        aria-label="Oyuktan kalan taş izi"
        title="Oyuktan kalan taş izi"
        className="world-memory-trace__btn"
        style={{
          pointerEvents: 'auto',
          width: '32px',
          height: '32px',
          padding: 0,
          borderRadius: '50%',
          background: 'rgba(8, 12, 20, 0.55)',
          border: `1px solid rgba(203, 213, 225, ${(0.14 + proximity * 0.28).toFixed(2)})`,
          color: `rgba(226, 232, 240, ${glowAlpha})`,
          cursor: 'pointer',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow:
            proximity > 0.1 || revealed
              ? `0 0 ${Math.round(10 + proximity * 14)}px rgba(226, 192, 125, ${(0.12 + proximity * 0.22).toFixed(2)})`
              : 'none',
          transform: `scale(${(1 + proximity * 0.08).toFixed(3)})`,
          transition: 'border-color 0.25s ease, color 0.25s ease, box-shadow 0.25s ease',
        }}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          shapeRendering="geometricPrecision"
          aria-hidden="true"
        >
          {/* Irregular carved subterranean stone shard */}
          <polygon
            points="16,3 27,10 24,25 11,28 5,15"
            fill="rgba(15, 23, 42, 0.72)"
            stroke="currentColor"
            strokeWidth="1.25"
            strokeLinejoin="round"
          />
          {/* Engraved cave triangle & eye mark echoing OYUK */}
          <polygon
            points="16,8.5 22.5,21 9.5,21"
            stroke="#e2c07d"
            strokeWidth="1.1"
            strokeOpacity={0.55 + proximity * 0.4}
            fill="none"
          />
          <circle
            cx="16"
            cy="16.8"
            r="1.4"
            fill="#e2c07d"
            fillOpacity={0.65 + proximity * 0.35}
          />
        </svg>
      </button>

      {(revealed || proximity > 0.55) && (
        <span
          className="world-memory-trace__whisper"
          role="status"
          aria-live="polite"
          style={{
            fontFamily: 'var(--font-handwriting)',
            fontSize: '0.96rem',
            letterSpacing: '0.04em',
            color: 'rgba(226, 232, 240, 0.78)',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.9)',
            whiteSpace: 'nowrap',
          }}
        >
          {STONE_WHISPERS[whisperIndex]}
        </span>
      )}
    </div>
  );
}
