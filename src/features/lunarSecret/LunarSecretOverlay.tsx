import { useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { isCinematicActive, useOyukState } from '../oyuk/oyukState';
import {
  cancelLunarHold,
  completeLunarHold,
  dismissLunarSecret,
  LUNAR_HOLD_DURATION_MS,
  LUNAR_REVEAL_AUTO_DISMISS_MS,
  startLunarHold,
  triggerLunarClick,
  updateLunarHoldProgress,
  useLunarSecret,
} from './lunarSecretStore';

/**
 * LunarSecretOverlay (§6):
 * Projects a narrowly-scoped circular DOM hit target over the 3D Moon (preserving
 * `#canvas-container { pointer-events: none; }`), distinguishes short clicks from
 * deliberate 750ms press-and-hold gestures, renders a crisp SVG orbital ring, and
 * reveals the Moon's hidden-side inscription.
 */
export default function LunarSecretOverlay({
  isNotFoundPage = false,
}: {
  isNotFoundPage?: boolean;
}) {
  const location = useLocation();
  const isMobilePerf = useIsMobilePerf();
  const reducedMotion = usePrefersReducedMotion();
  const oyuk = useOyukState();
  const lunar = useLunarSecret();

  const holdRafRef = useRef<number>(0);
  const holdStartRef = useRef<number>(0);
  const holdCompletedRef = useRef<boolean>(false);
  const pointerDownRef = useRef<boolean>(false);

  const isSuppressed =
    isNotFoundPage ||
    location.pathname === '/oyuk' ||
    location.pathname === '/miras' ||
    isCinematicActive(oyuk.phase);

  const stopHoldLoop = useCallback(() => {
    if (holdRafRef.current) {
      cancelAnimationFrame(holdRafRef.current);
      holdRafRef.current = 0;
    }
    pointerDownRef.current = false;
  }, []);

  useEffect(() => {
    if (!lunar.secretRevealed) return;
    const timer = window.setTimeout(() => {
      dismissLunarSecret();
    }, LUNAR_REVEAL_AUTO_DISMISS_MS);
    return () => window.clearTimeout(timer);
  }, [lunar.secretRevealed, lunar.secretCount]);

  useEffect(() => {
    if (isSuppressed) {
      stopHoldLoop();
      cancelLunarHold();
      dismissLunarSecret();
    }
  }, [isSuppressed, stopHoldLoop]);

  useEffect(() => {
    return () => {
      stopHoldLoop();
    };
  }, [stopHoldLoop]);

  const beginHold = useCallback(() => {
    if (isSuppressed) return;
    stopHoldLoop();
    pointerDownRef.current = true;
    holdCompletedRef.current = false;
    holdStartRef.current = performance.now();
    startLunarHold();

    const duration = reducedMotion ? 220 : LUNAR_HOLD_DURATION_MS;

    const step = (now: number) => {
      if (!pointerDownRef.current) return;
      const elapsed = now - holdStartRef.current;
      const progress = Math.min(1, elapsed / duration);
      updateLunarHoldProgress(progress);

      if (progress >= 1) {
        holdCompletedRef.current = true;
        pointerDownRef.current = false;
        holdRafRef.current = 0;
        completeLunarHold();
        return;
      }

      holdRafRef.current = requestAnimationFrame(step);
    };

    holdRafRef.current = requestAnimationFrame(step);
  }, [isSuppressed, reducedMotion, stopHoldLoop]);

  const endHold = useCallback(() => {
    if (!pointerDownRef.current) return;
    stopHoldLoop();
    if (!holdCompletedRef.current) {
      cancelLunarHold();
    }
  }, [stopHoldLoop]);

  const handleClick = useCallback(() => {
    if (holdCompletedRef.current) {
      holdCompletedRef.current = false;
      return;
    }
    triggerLunarClick();
  }, []);

  if (isSuppressed) return null;

  // Desktop uses projected 3D Moon coordinates; Mobile uses upper-right sky coordinates
  const hasDesktopProjection = !isMobilePerf && lunar.projectedMoon.visible;
  if (!isMobilePerf && !hasDesktopProjection) return null;

  const centerX = isMobilePerf
    ? typeof window !== 'undefined'
      ? window.innerWidth - 52
      : 320
    : lunar.projectedMoon.x;
  const centerY = isMobilePerf ? 92 : lunar.projectedMoon.y;
  const radiusPx = isMobilePerf ? 24 : Math.max(30, lunar.projectedMoon.radiusPx);
  const hitDiameter = Math.round(radiusPx * 2.35);
  const ringRadius = radiusPx + 8;
  const ringSize = (ringRadius + 10) * 2;
  const circumference = 2 * Math.PI * ringRadius;
  const activeProgress = lunar.secretRevealed ? 1 : lunar.holdProgress;
  const strokeDashoffset = circumference * (1 - activeProgress);
  const isBloodMoon = lunar.clickCount > 5;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 28,
      }}
    >
      {/* Narrowly-scoped circular hit target aligned with the Moon (§6.6) */}
      <button
        type="button"
        aria-label="Ay — basılı tutarak gizli yüzünü çevir"
        title="Ay (gizli yüzü için basılı tut)"
        onPointerDown={(e) => {
          if (e.button !== 0 && e.pointerType === 'mouse') return;
          beginHold();
        }}
        onPointerUp={endHold}
        onPointerCancel={endHold}
        onPointerLeave={endHold}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.repeat) return;
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            holdCompletedRef.current = true;
            completeLunarHold();
          }
        }}
        style={{
          position: 'fixed',
          left: `${centerX}px`,
          top: `${centerY}px`,
          width: `${hitDiameter}px`,
          height: `${hitDiameter}px`,
          transform: 'translate(-50%, -50%)',
          borderRadius: '50%',
          background: 'transparent',
          border: 'none',
          padding: 0,
          margin: 0,
          cursor: 'pointer',
          pointerEvents: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
      >
        {/* Mobile crisp vector Moon (since WebGL canvas is desktop-only) */}
        {isMobilePerf && (
          <svg
            width={radiusPx * 2}
            height={radiusPx * 2}
            viewBox="0 0 64 64"
            fill="none"
            aria-hidden
            style={{
              transform: lunar.secretRevealed ? 'rotateY(180deg)' : 'none',
              transition: 'transform 0.65s cubic-bezier(0.22, 1, 0.36, 1)',
              filter: lunar.secretRevealed
                ? 'drop-shadow(0 0 12px rgba(147, 197, 253, 0.55))'
                : 'drop-shadow(0 0 10px rgba(226, 232, 240, 0.32))',
            }}
          >
            <circle
              cx="32"
              cy="32"
              r="22"
              fill={
                isBloodMoon
                  ? '#ef4444'
                  : lunar.secretRevealed
                    ? '#cbd5e1'
                    : '#f1f5f9'
              }
              fillOpacity={0.9}
            />
            <circle cx="24" cy="25" r="3.5" fill="rgba(71, 85, 105, 0.25)" />
            <circle cx="39" cy="36" r="4.8" fill="rgba(71, 85, 105, 0.22)" />
            {lunar.secretRevealed && (
              <path
                d="M25 32 L32 23 L39 32 L32 41 Z"
                stroke="rgba(30, 58, 138, 0.65)"
                strokeWidth="1.3"
                fill="none"
              />
            )}
          </svg>
        )}

        {/* Orbital progress halo & hidden-side sigil */}
        {(lunar.holding || lunar.secretRevealed) && (
          <svg
            width={ringSize}
            height={ringSize}
            viewBox={`0 0 ${ringSize} ${ringSize}`}
            fill="none"
            aria-hidden
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%) rotate(-90deg)',
              pointerEvents: 'none',
              overflow: 'visible',
            }}
          >
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke="rgba(148, 163, 184, 0.22)"
              strokeWidth="1.2"
              strokeDasharray="3 4"
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              stroke={lunar.secretRevealed ? 'rgba(186, 230, 253, 0.92)' : 'rgba(226, 232, 240, 0.85)'}
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{
                filter: 'drop-shadow(0 0 8px rgba(147, 197, 253, 0.55))',
              }}
            />
          </svg>
        )}
      </button>

      {/* Enigmatic Lunar Secret Inscription (§6.3 & §6.4) */}
      {lunar.secretRevealed && (
        <div
          role="status"
          aria-live="polite"
          onClick={() => dismissLunarSecret()}
          style={{
            position: 'fixed',
            left: `${Math.min(
              Math.max(150, centerX),
              (typeof window !== 'undefined' ? window.innerWidth : 1200) - 150,
            )}px`,
            top: `${centerY + radiusPx + 18}px`,
            transform: 'translateX(-50%)',
            background: 'rgba(6, 10, 18, 0.88)',
            border: '1px solid rgba(186, 230, 253, 0.28)',
            borderRadius: '999px',
            padding: '0.42rem 0.95rem',
            color: 'rgba(241, 245, 249, 0.94)',
            fontFamily: 'var(--font-display)',
            fontStyle: 'italic',
            fontSize: '0.78rem',
            letterSpacing: '0.03em',
            boxShadow: '0 10px 28px rgba(0, 0, 0, 0.55), 0 0 18px rgba(147, 197, 253, 0.14)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            pointerEvents: 'auto',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            userSelect: 'none',
          }}
        >
          <span
            aria-hidden
            style={{
              color: 'rgba(186, 230, 253, 0.85)',
              marginRight: '0.45rem',
              fontStyle: 'normal',
            }}
          >
            ☾
          </span>
          {lunar.activeInscription}
        </div>
      )}
    </div>
  );
}
