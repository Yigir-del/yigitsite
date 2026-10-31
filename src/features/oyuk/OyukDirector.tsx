import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
import BeggarActorSvg from './BeggarActorSvg';
import {
  advanceCinematicPhase,
  CINEMATIC_STEP_MS,
  finishCinematicArrival,
  isCinematicActive,
  resetCinematicToIdle,
  useOyukState,
} from './oyukState';
import './oyuk.css';

export const OYUK_OPENING_LINE =
  'Beş oldu kral. Cömertliğin başımıza iş açacak... Gel, sana bir yer göstereceğim.';

export const OYUK_THRESHOLD_LINE =
  'Benden bir şey bekleme kral. Buradan sonrasını kendin bulacaksın.';

/**
 * OYUK Cinematic Director (§3, §9, §10).
 * Orchestrates the deterministic 6-shot camera-tracking journey from the beggar's
 * live screen coordinates into the subterranean cave at `/oyuk`.
 */
export default function OyukDirector() {
  const oyuk = useOyukState();
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const isMobilePerf = useIsMobilePerf();
  const stepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Stable refs so route changes (which re-create `navigate`) never reset in-flight step timers.
  const navigateRef = useRef(navigate);
  const returnPathRef = useRef(oyuk.returnPath);
  const phaseRef = useRef(oyuk.phase);
  navigateRef.current = navigate;
  returnPathRef.current = oyuk.returnPath;
  phaseRef.current = oyuk.phase;

  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  const clearStepTimer = useCallback(() => {
    if (stepTimerRef.current !== null) {
      clearTimeout(stepTimerRef.current);
      stepTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isCinematicActive(oyuk.phase) && oyuk.phase !== 'arrived') return;
    setViewport({ w: window.innerWidth, h: window.innerHeight });
    const onResize = () => {
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, [oyuk.phase]);

  // Preload OyukScene chunk immediately when invitation begins so /oyuk never flashes a fallback
  useEffect(() => {
    if (oyuk.phase === 'invitation') {
      void import('./OyukScene');
    }
  }, [oyuk.phase]);

  // Lock body scroll during active cinematic and restore cleanly on exit/unmount (§10.3)
  useEffect(() => {
    const active = isCinematicActive(oyuk.phase);
    if (!active) return;
    const prevOverflow = document.body.style.overflow;
    const prevTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    return () => {
      document.body.style.overflow = prevOverflow;
      document.body.style.touchAction = prevTouchAction;
    };
  }, [oyuk.phase]);

  const navigateToCave = useCallback(() => {
    if (window.location.pathname !== '/oyuk') {
      navigateRef.current('/oyuk', {
        state: {
          fromOyukCinematic: true,
          returnTo: returnPathRef.current || '/',
        },
      });
    }
  }, []);

  /** Leaves the cave for the stored return path (idempotent; never re-enters the cave). */
  const navigateToReturnTarget = useCallback(() => {
    const raw = returnPathRef.current;
    const target = raw && raw !== '/oyuk' ? raw : '/';
    if (window.location.pathname === '/oyuk') {
      navigateRef.current(target);
    }
  }, []);

  const skipToCave = useCallback(() => {
    // An exit in progress must never be converted into a cave entrance.
    if (phaseRef.current === 'exiting') return;
    clearStepTimer();
    advanceCinematicPhase('entering');
    navigateToCave();
    stepTimerRef.current = setTimeout(() => {
      finishCinematicArrival();
      stepTimerRef.current = setTimeout(() => {
        resetCinematicToIdle();
      }, 320);
    }, 120);
  }, [clearStepTimer, navigateToCave]);

  // Keyboard Escape skip support (§10.4) — entrance only. Exit is owned by the cave scene.
  useEffect(() => {
    if (!isCinematicActive(oyuk.phase) || oyuk.phase === 'exiting') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipToCave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [oyuk.phase, skipToCave]);

  // Deterministic per-phase state machine (§3.3 & §9)
  // Each state schedules ONLY its immediate successor so phase changes never cancel future phases.
  useEffect(() => {
    clearStepTimer();

    switch (oyuk.phase) {
      case 'invitation': {
        const delay = reducedMotion
          ? CINEMATIC_STEP_MS.invitationReduced
          : CINEMATIC_STEP_MS.invitation;
        stepTimerRef.current = setTimeout(() => {
          advanceCinematicPhase(reducedMotion ? 'threshold' : 'focus');
        }, delay);
        break;
      }

      case 'focus': {
        stepTimerRef.current = setTimeout(() => {
          advanceCinematicPhase('escort');
        }, CINEMATIC_STEP_MS.focus);
        break;
      }

      case 'escort': {
        stepTimerRef.current = setTimeout(() => {
          advanceCinematicPhase('threshold');
        }, CINEMATIC_STEP_MS.escort);
        break;
      }

      case 'threshold': {
        const delay = reducedMotion
          ? CINEMATIC_STEP_MS.thresholdReduced
          : CINEMATIC_STEP_MS.threshold;
        stepTimerRef.current = setTimeout(() => {
          advanceCinematicPhase('entering');
        }, delay);
        break;
      }

      case 'entering': {
        navigateToCave();
        const delay = reducedMotion
          ? CINEMATIC_STEP_MS.enteringReduced
          : CINEMATIC_STEP_MS.entering;
        stepTimerRef.current = setTimeout(() => {
          finishCinematicArrival();
        }, delay);
        break;
      }

      case 'exiting': {
        // exit click → flashlight fade → dark passage → navigate(returnTarget)
        //   → destination ready → passage dissolve ('arrived') → idle
        const fadeDelay = reducedMotion
          ? CINEMATIC_STEP_MS.exitingReduced
          : CINEMATIC_STEP_MS.exiting;
        const settleDelay = reducedMotion
          ? CINEMATIC_STEP_MS.exitSettleReduced
          : CINEMATIC_STEP_MS.exitSettle;
        stepTimerRef.current = setTimeout(() => {
          navigateToReturnTarget();
          stepTimerRef.current = setTimeout(() => {
            finishCinematicArrival();
          }, settleDelay);
        }, fadeDelay);
        break;
      }

      case 'arrived': {
        stepTimerRef.current = setTimeout(() => {
          resetCinematicToIdle();
        }, CINEMATIC_STEP_MS.arrived);
        break;
      }

      default:
        break;
    }

    return () => clearStepTimer();
  }, [oyuk.phase, reducedMotion, clearStepTimer, navigateToCave, navigateToReturnTarget]);

  // Master failsafe watchdog (§3.4): guarantees the user can never remain trapped on a dark overlay.
  // The watchdog resolves toward the direction the journey was heading — an exit must never be
  // converted into a cave entrance.
  const cinematicActive = isCinematicActive(oyuk.phase);
  const isExitingPhase = oyuk.phase === 'exiting';
  useEffect(() => {
    if (!cinematicActive) return;
    const watchdog = setTimeout(() => {
      if (isExitingPhase) {
        navigateToReturnTarget();
      } else {
        navigateToCave();
      }
      finishCinematicArrival();
      setTimeout(() => {
        resetCinematicToIdle();
      }, 280);
    }, CINEMATIC_STEP_MS.failsafeMax);

    return () => clearTimeout(watchdog);
  }, [cinematicActive, isExitingPhase, navigateToCave, navigateToReturnTarget]);

  // If user navigated to /oyuk via browser history while director was mid-transition, finish cleanly.
  // `exiting` is deliberately excluded: the exit owns its own navigation and must not be treated as an
  // interrupted entrance (which previously cancelled the exit and stranded the visitor in the cave).
  useEffect(() => {
    if (
      location.pathname === '/oyuk' &&
      oyuk.phase !== 'entering' &&
      oyuk.phase !== 'exiting' &&
      oyuk.phase !== 'arrived' &&
      oyuk.phase !== 'idle'
    ) {
      finishCinematicArrival();
    }
  }, [location.pathname, oyuk.phase]);

  const startPos = useMemo(() => {
    if (oyuk.originRect) {
      return {
        x: Math.min(Math.max(24, oyuk.originRect.left), viewport.w - 80),
        y: Math.min(Math.max(40, oyuk.originRect.top), viewport.h - 90),
      };
    }
    return {
      x: isMobilePerf ? 24 : viewport.w * 0.58,
      y: isMobilePerf ? viewport.h - 110 : viewport.h * 0.52,
    };
  }, [oyuk.originRect, viewport.w, viewport.h, isMobilePerf]);

  const actorPose = useMemo(() => {
    const { w, h } = viewport;
    switch (oyuk.phase) {
      case 'invitation':
        return {
          x: startPos.x,
          y: startPos.y,
          scale: 1.06,
          opacity: 1,
        };
      case 'focus':
        return {
          x: isMobilePerf ? w * 0.52 - 27 : w * 0.56 - 27,
          y: h * 0.52 - 32,
          scale: isMobilePerf ? 1.2 : 1.36,
          opacity: 1,
        };
      case 'escort':
        return {
          x: isMobilePerf ? w * 0.34 - 27 : w * 0.36 - 27,
          y: h * 0.53 - 32,
          scale: isMobilePerf ? 1.18 : 1.3,
          opacity: 1,
        };
      case 'threshold':
        return {
          x: isMobilePerf ? w * 0.21 - 27 : w * 0.22 - 27,
          y: h * 0.54 - 32,
          scale: 1.15,
          opacity: 0.94,
        };
      case 'entering':
      case 'arrived':
      default:
        return {
          x: w * 0.12 - 27,
          y: h * 0.55 - 32,
          scale: 0.82,
          opacity: 0,
        };
    }
  }, [oyuk.phase, startPos.x, startPos.y, viewport, isMobilePerf]);

  if (oyuk.phase === 'idle' || oyuk.phase === 'cancelled') {
    return null;
  }

  const dialogueLine =
    oyuk.phase === 'invitation' || oyuk.phase === 'focus' || oyuk.phase === 'escort'
      ? OYUK_OPENING_LINE
      : oyuk.phase === 'threshold'
        ? OYUK_THRESHOLD_LINE
        : '';

  const isWalking = oyuk.phase === 'escort' || oyuk.phase === 'threshold';
  const showCavernPassage =
    oyuk.phase === 'escort' ||
    oyuk.phase === 'threshold' ||
    oyuk.phase === 'entering' ||
    oyuk.phase === 'arrived';

  return (
    <div
      className={`oyuk-director oyuk-director--${oyuk.phase}`}
      role="region"
      aria-label="Oyuk geçiş sahnesi"
      aria-live="polite"
    >
      {/* Atmospheric camera vignette & darkening backdrop */}
      <div className="oyuk-director__backdrop" />

      {/* Parallax tracking-camera layers during leftward walk (Shots 3 & 4) */}
      {!reducedMotion && (
        <div
          className={`oyuk-director__parallax${
            isWalking || oyuk.phase === 'entering' ? ' is-tracking' : ''
          }`}
          aria-hidden
        >
          <div className="oyuk-director__drift-stars" />
          <div className="oyuk-director__ridge oyuk-director__ridge--far" />
          <div className="oyuk-director__ridge oyuk-director__ridge--near" />
          <div className="oyuk-director__stone-arch" />
        </div>
      )}

      {/* Dark subterranean passage mouth emerging from the left (Shots 3–5) */}
      <div
        className={`oyuk-director__cavern-mouth${showCavernPassage ? ' is-visible' : ''}${
          oyuk.phase === 'entering' || oyuk.phase === 'arrived' ? ' is-engulfing' : ''
        }`}
        aria-hidden
      />

      {/* Guided Beggar Actor */}
      {oyuk.phase !== 'arrived' && oyuk.phase !== 'exiting' && (
        <motion.div
          className={`oyuk-director__actor${isWalking && !reducedMotion ? ' is-walking' : ''}`}
          initial={{
            x: startPos.x,
            y: startPos.y,
            scale: 1,
            opacity: 1,
          }}
          animate={actorPose}
          transition={{
            duration:
              oyuk.phase === 'invitation'
                ? 0.35
                : oyuk.phase === 'focus'
                  ? 1.15
                  : oyuk.phase === 'escort'
                    ? 1.65
                    : oyuk.phase === 'threshold'
                      ? 1.25
                      : 0.48,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <div className="oyuk-director__bubble-wrap">
            <AnimatePresence mode="wait">
              {dialogueLine && (
                <motion.div
                  key={dialogueLine}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.22 }}
                  className="flyer-bubble oyuk-director__bubble"
                >
                  {dialogueLine}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="oyuk-director__actor-body">
            <BeggarActorSvg lookingLeft={isWalking || oyuk.phase === 'entering'} />
          </div>
        </motion.div>
      )}

      {/* Discreet keyboard-accessible skip control (§10.4) */}
      {isCinematicActive(oyuk.phase) && oyuk.phase !== 'exiting' && (
        <button
          type="button"
          className="oyuk-director__skip"
          onClick={skipToCave}
          aria-label="Sinematik geçişi atla ve mağaraya gir"
        >
          geç →
        </button>
      )}
    </div>
  );
}
