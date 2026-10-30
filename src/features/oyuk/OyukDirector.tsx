import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
import BeggarActorSvg from './BeggarActorSvg';
import {
  advanceCinematicPhase,
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
 * OYUK Cinematic Director (§6–§8, §16–§17).
 * Orchestrates the 6-shot camera-tracking illusion from the beggar's live screen
 * coordinates into the subterranean cave at `/oyuk`.
 */
export default function OyukDirector() {
  const oyuk = useOyukState();
  const navigate = useNavigate();
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const isMobilePerf = useIsMobilePerf();
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const [viewport, setViewport] = useState(() => ({
    w: typeof window !== 'undefined' ? window.innerWidth : 1280,
    h: typeof window !== 'undefined' ? window.innerHeight : 800,
  }));

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
    return id;
  }, []);

  useEffect(() => {
    if (!isCinematicActive(oyuk.phase) && oyuk.phase !== 'arrived') return;
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

  // Lock body scroll during active cinematic and restore cleanly on exit/unmount (§16.4)
  useEffect(() => {
    if (!isCinematicActive(oyuk.phase)) return;
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
    if (location.pathname !== '/oyuk') {
      navigate('/oyuk', {
        state: {
          fromOyukCinematic: true,
          returnTo: oyuk.returnPath || '/',
        },
      });
    }
  }, [location.pathname, navigate, oyuk.returnPath]);

  const skipToCave = useCallback(() => {
    clearTimers();
    advanceCinematicPhase('entering');
    navigateToCave();
    schedule(() => {
      finishCinematicArrival();
      schedule(() => {
        resetCinematicToIdle();
      }, 380);
    }, 120);
  }, [clearTimers, navigateToCave, schedule]);

  // Keyboard Escape skip support (§17.1)
  useEffect(() => {
    if (!isCinematicActive(oyuk.phase)) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        skipToCave();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [oyuk.phase, skipToCave]);

  // Main finite-state timeline (§6.2 & §8)
  useEffect(() => {
    if (oyuk.phase !== 'invitation') return;
    clearTimers();

    setViewport({ w: window.innerWidth, h: window.innerHeight });

    if (reducedMotion) {
      // Reduced-motion path (§17.2): keep invitation dialogue, skip zoom/parallax, crossfade to cave
      schedule(() => {
        advanceCinematicPhase('threshold');
      }, 1400);
      schedule(() => {
        advanceCinematicPhase('entering');
        navigateToCave();
      }, 2600);
      schedule(() => {
        finishCinematicArrival();
      }, 2950);
      schedule(() => {
        resetCinematicToIdle();
      }, 3400);

      return () => clearTimers();
    }

    // Standard 6-shot cinematic sequence (~5.7s total before cave interaction)
    // Shot 1 (0ms - 950ms): Interruption at originRect with opening dialogue
    // Shot 2 (950ms - 2200ms): Camera Lock & Focus zoom on beggar
    schedule(() => {
      advanceCinematicPhase('focus');
    }, 950);

    // Shot 3 (2200ms - 4000ms): Walk Left with parallax camera tracking
    schedule(() => {
      advanceCinematicPhase('escort');
    }, 2200);

    // Shot 4 (4000ms - 5350ms): The Passage — dark cavern mouth & threshold line
    schedule(() => {
      advanceCinematicPhase('threshold');
    }, 4000);

    // Shot 5 (5350ms - 5950ms): The Threshold — beggar enters darkness + route handoff
    schedule(() => {
      advanceCinematicPhase('entering');
      navigateToCave();
    }, 5350);

    // Shot 6 (5950ms - 6500ms): The Light Returns — curtain dissolves into OyukScene
    schedule(() => {
      finishCinematicArrival();
    }, 5950);

    schedule(() => {
      resetCinematicToIdle();
    }, 6500);

    return () => clearTimers();
  }, [oyuk.phase, reducedMotion, clearTimers, schedule, navigateToCave]);

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
          scale: isMobilePerf ? 1.18 : 1.32,
          opacity: 1,
        };
      case 'escort':
        return {
          x: isMobilePerf ? w * 0.34 - 27 : w * 0.36 - 27,
          y: h * 0.53 - 32,
          scale: isMobilePerf ? 1.16 : 1.28,
          opacity: 1,
        };
      case 'threshold':
        return {
          x: isMobilePerf ? w * 0.22 - 27 : w * 0.23 - 27,
          y: h * 0.54 - 32,
          scale: 1.14,
          opacity: 0.92,
        };
      case 'entering':
      case 'arrived':
      default:
        return {
          x: w * 0.14 - 27,
          y: h * 0.55 - 32,
          scale: 0.84,
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
      {oyuk.phase !== 'arrived' && (
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
                      : 0.55,
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

      {/* Discreet keyboard-accessible skip control (§17.1) */}
      {isCinematicActive(oyuk.phase) && (
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
