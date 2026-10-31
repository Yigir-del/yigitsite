import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { isCinematicActive, useOyukState } from '../oyuk/oyukState';
import {
  activateCurrentAnomaly,
  ANOMALY_INITIAL_DELAY_MS,
  ANOMALY_LIFETIME_MS,
  ANOMALY_REVEAL_HOLD_MS,
  beginClosingCurrentAnomaly,
  closeCurrentAnomaly,
  isAnomalyRouteSuppressed,
  trySpawnAnomaly,
  useAnomalyState,
} from './anomalyStore';

/**
 * RealityAnomalyOverlay (§7):
 * Renders rare, high-definition SVG cosmic fractures in background space,
 * coordinated with `ambientSlot.ts` so they never collide with ChaosManager or IdleWhispers.
 */
export default function RealityAnomalyOverlay({
  isNotFoundPage = false,
}: {
  isNotFoundPage?: boolean;
}) {
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const oyuk = useOyukState();
  const { current } = useAnomalyState();

  const suppressed =
    isAnomalyRouteSuppressed(location.pathname, isNotFoundPage) ||
    isCinematicActive(oyuk.phase);

  // Immediately close any active anomaly if route/cinematic becomes suppressed (§7.4)
  useEffect(() => {
    if (suppressed && current) {
      closeCurrentAnomaly();
    }
  }, [suppressed, current]);

  // Controlled rare scheduler (§7.4)
  useEffect(() => {
    if (suppressed) return;

    const attemptSpawn = () => {
      if (typeof document !== 'undefined' && document.hidden) return;
      trySpawnAnomaly({
        pathname: location.pathname,
        isNotFoundPage,
      });
    };

    const initialTimer = window.setTimeout(attemptSpawn, ANOMALY_INITIAL_DELAY_MS);
    const intervalTimer = window.setInterval(attemptSpawn, 28_000);

    return () => {
      window.clearTimeout(initialTimer);
      window.clearInterval(intervalTimer);
    };
  }, [suppressed, location.pathname, isNotFoundPage]);

  // Manage lifetime of unclicked anomaly -> graceful fade out
  useEffect(() => {
    if (!current || current.phase !== 'active') return;
    const expireTimer = window.setTimeout(() => {
      beginClosingCurrentAnomaly();
    }, ANOMALY_LIFETIME_MS);
    return () => window.clearTimeout(expireTimer);
  }, [current]);

  // Manage closing phase -> full cleanup and ambientSlot release
  useEffect(() => {
    if (!current || current.phase !== 'closing') return;
    const closeTimer = window.setTimeout(() => {
      closeCurrentAnomaly();
    }, 520);
    return () => window.clearTimeout(closeTimer);
  }, [current]);

  // Manage activated message display -> graceful closure
  useEffect(() => {
    if (!current || current.phase !== 'activated') return;
    const holdTimer = window.setTimeout(() => {
      beginClosingCurrentAnomaly();
    }, ANOMALY_REVEAL_HOLD_MS);
    return () => window.clearTimeout(holdTimer);
  }, [current]);

  if (suppressed || !current) return null;

  const isActivated = current.phase === 'activated';
  const isClosing = current.phase === 'closing';

  return (
    <div
      style={{
        position: 'fixed',
        left: `${current.xPct}%`,
        top: `${current.yPct}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: 29,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.45rem',
        opacity: isClosing ? 0 : 1,
        transition: 'opacity 0.48s cubic-bezier(0.22, 1, 0.36, 1)',
      }}
    >
      <button
        type="button"
        aria-label="Gerçeklik çatlağı — incele"
        title="Uzayda ince bir çatlak..."
        onClick={() => activateCurrentAnomaly()}
        style={{
          background: 'transparent',
          border: 'none',
          padding: '0.35rem',
          margin: 0,
          cursor: 'pointer',
          pointerEvents: isClosing ? 'none' : 'auto',
          outline: 'none',
          transform: `rotate(${current.angleDeg}deg) scale(${
            isActivated ? 1.12 : isClosing ? 0.86 : 1
          })`,
          transition: reducedMotion
            ? 'opacity 0.25s ease'
            : 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <svg
          width="84"
          height="84"
          viewBox="0 0 120 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden
          style={{
            overflow: 'visible',
            filter: isActivated
              ? 'drop-shadow(0 0 14px rgba(186, 230, 253, 0.72))'
              : 'drop-shadow(0 0 9px rgba(148, 163, 184, 0.45))',
          }}
        >
          {/* Subtle vacuum distortion halo */}
          <ellipse
            cx="60"
            cy="60"
            rx={isActivated ? '42' : '34'}
            ry={isActivated ? '13' : '9'}
            fill="rgba(2, 6, 23, 0.58)"
            stroke="rgba(148, 163, 184, 0.18)"
            strokeWidth="0.8"
          />

          {/* Cyan chromatic offset hairline */}
          <path
            d="M12 61 L33 55 L49 63 L64 52 L83 64 L108 58"
            stroke="rgba(125, 211, 252, 0.68)"
            strokeWidth="1.15"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(-1.3, -1)"
          />

          {/* Rose-violet chromatic offset hairline */}
          <path
            d="M12 61 L33 55 L49 63 L64 52 L83 64 L108 58"
            stroke="rgba(244, 114, 182, 0.45)"
            strokeWidth="1.1"
            strokeLinecap="round"
            strokeLinejoin="round"
            transform="translate(1.3, 1.1)"
          />

          {/* Secondary branching micro-fissures */}
          <path
            d="M49 63 L42 76 M64 52 L71 39 M83 64 L89 74"
            stroke="rgba(203, 213, 225, 0.48)"
            strokeWidth="0.95"
            strokeLinecap="round"
          />

          {/* Primary high-definition spatial fracture */}
          <path
            d="M10 60 L33 55 L49 63 L64 52 L83 64 L110 58"
            stroke="rgba(248, 250, 252, 0.95)"
            strokeWidth={isActivated ? '2.1' : '1.55'}
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Displaced starlight nodes along the tear */}
          <circle cx="33" cy="55" r="1.4" fill="#e0f2fe" />
          <circle cx="64" cy="52" r={isActivated ? '2.3' : '1.7'} fill="#ffffff" />
          <circle cx="83" cy="64" r="1.3" fill="#bae6fd" />
        </svg>
      </button>

      {isActivated && (
        <div
          role="status"
          aria-live="polite"
          style={{
            transform: 'rotate(0deg)',
            background: 'rgba(5, 8, 15, 0.9)',
            border: '1px solid rgba(186, 230, 253, 0.28)',
            borderRadius: '999px',
            padding: '0.38rem 0.88rem',
            color: 'rgba(241, 245, 249, 0.95)',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '0.76rem',
            letterSpacing: '0.025em',
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.58)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            pointerEvents: 'none',
          }}
        >
          {current.message}
        </div>
      )}
    </div>
  );
}
