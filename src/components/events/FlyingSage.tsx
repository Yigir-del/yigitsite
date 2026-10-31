import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThrowableEdgeFlight } from '../../hooks/useThrowableEdgeFlight';
import {
  SAGE_OWN,
  SAGE_TO_BEGGAR,
  SAGE_REPLY_TO_BEGGAR,
  FLYER_SPEAK,
  pickRandom,
  shouldJab,
  type FlyerSpeakDetail,
} from '../../utils/flyerDialogue';
import { isCinematicActive } from '../../features/oyuk/oyukState';
import { selectContextualMemoryLine } from '../../features/worldMemory/worldMemoryStore';
import {
  checkAndTriggerEncounter,
  isEncounterActive,
  registerEncounterActor,
  type ActorFacing,
} from '../../features/characterEncounters/encounterManager';

/** Wise face — mostly proverbial lines; rarely jabs the beggar with a mapped reply */
export default function FlyingSage() {
  const {
    x,
    y,
    visible,
    dragging,
    onDragStart,
    onDragEnd,
    holdFlight,
    resumeFlight,
  } = useThrowableEdgeFlight({
    startDelay: 2500,
    durationMin: 18,
    durationMax: 28,
  });
  const [line, setLine] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const [encounterFacing, setEncounterFacing] = useState<ActorFacing>(null);
  const actorRef = useRef<HTMLDivElement | null>(null);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busyRef = useRef(false);

  const clearSpeechTimers = useCallback(() => {
    if (hideRef.current) {
      clearTimeout(hideRef.current);
      hideRef.current = null;
    }
    if (replyRef.current) {
      clearTimeout(replyRef.current);
      replyRef.current = null;
    }
    busyRef.current = false;
  }, []);

  const say = useCallback((text: string, holdMs = 5000) => {
    if (isCinematicActive()) return;
    if (replyRef.current) {
      clearTimeout(replyRef.current);
      replyRef.current = null;
    }
    busyRef.current = true;
    setLine(text);
    setShowBubble(true);
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => {
      setShowBubble(false);
      busyRef.current = false;
    }, holdMs);
  }, []);

  // Register Sage actor with character encounter manager (§5)
  useEffect(() => {
    return registerEncounterActor('sage', {
      getCenter: () => {
        const el = actorRef.current;
        if (!el) return null;
        const rect = el.getBoundingClientRect();
        return {
          x: rect.left + (rect.width || 54) * 0.5,
          y: rect.top + (rect.height || 70) * 0.5,
        };
      },
      isReady: () => visible && !isCinematicActive(),
      hold: (facing) => {
        clearSpeechTimers();
        setShowBubble(false);
        setEncounterFacing(facing);
        holdFlight();
      },
      sayLine: (text, holdMs) => {
        say(text, holdMs);
      },
      clearSpeech: () => {
        clearSpeechTimers();
        setShowBubble(false);
      },
      resume: () => {
        setEncounterFacing(null);
        resumeFlight(240);
      },
    });
  }, [visible, clearSpeechTimers, holdFlight, say, resumeFlight]);

  useEffect(() => {
    const emit = (detail: FlyerSpeakDetail) => {
      window.dispatchEvent(new CustomEvent(FLYER_SPEAK, { detail }));
    };

    const speak = () => {
      if (busyRef.current || isEncounterActive() || document.hidden || isCinematicActive()) {
        return;
      }

      // Living Universe (§4.4): Occasionally acknowledge visitor's past discoveries
      const memoryLine = selectContextualMemoryLine('sage');
      if (memoryLine) {
        say(memoryLine, 4800);
        emit({ from: 'sage', kind: 'own', line: memoryLine });
        return;
      }

      if (shouldJab(0.15)) {
        const jab = pickRandom(SAGE_TO_BEGGAR);
        say(jab, 5000);
        emit({ from: 'sage', kind: 'jab', line: jab });
        return;
      }

      const own = pickRandom(SAGE_OWN);
      say(own);
      emit({ from: 'sage', kind: 'own', line: own });
    };

    const first = setTimeout(speak, 5500);
    const loop = setInterval(speak, 12000 + Math.random() * 5000);

    const onFlyerSpeak = (e: Event) => {
      if (isCinematicActive() || isEncounterActive()) return;
      const detail = (e as CustomEvent<FlyerSpeakDetail>).detail;
      if (!detail || detail.from !== 'beggar' || detail.kind !== 'jab') return;

      const reply = SAGE_REPLY_TO_BEGGAR[detail.line];
      if (!reply) return;

      if (replyRef.current) clearTimeout(replyRef.current);
      busyRef.current = true;
      replyRef.current = setTimeout(() => {
        replyRef.current = null;
        say(reply, 5000);
      }, 1500);
    };

    window.addEventListener(FLYER_SPEAK, onFlyerSpeak);

    return () => {
      clearTimeout(first);
      clearInterval(loop);
      clearSpeechTimers();
      window.removeEventListener(FLYER_SPEAK, onFlyerSpeak);
    };
  }, [say, clearSpeechTimers]);

  if (!visible) return null;

  return (
    <motion.div
      ref={actorRef}
      style={{
        x,
        y,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: dragging ? 200 : 45,
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.35rem',
        pointerEvents: 'auto',
      }}
      drag
      dragMomentum
      dragElastic={0.2}
      whileDrag={{ scale: 1.12, cursor: 'grabbing', zIndex: 200 }}
      onDragStart={() => {
        setEncounterFacing(null);
        onDragStart();
      }}
      onDrag={() => {
        checkAndTriggerEncounter('sage', { wasDragged: true });
      }}
      onDragEnd={() => {
        onDragEnd();
        checkAndTriggerEncounter('sage', { wasDragged: true });
      }}
      title="Bilge"
    >
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '0.4rem',
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence mode="wait">
          {showBubble && line && (
            <motion.div
              key={line}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              style={{
                background: 'var(--glass-bg)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-main)',
                fontFamily: 'var(--font-body)',
                fontSize: '0.72rem',
                fontWeight: 500,
                letterSpacing: '0.02em',
                padding: '0.45rem 0.7rem',
                borderRadius: '10px',
                maxWidth: '200px',
                width: 'max-content',
                textAlign: 'center',
                boxShadow: '0 8px 24px var(--shadow)',
                whiteSpace: 'normal',
                lineHeight: 1.35,
              }}
              className="flyer-bubble"
            >
              {line}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 14px var(--glow)',
          userSelect: 'none',
          transform:
            encounterFacing === 'right'
              ? 'rotate(4deg) translateX(2px)'
              : encounterFacing === 'left'
                ? 'rotate(-4deg) translateX(-2px)'
                : undefined,
          transition: 'transform 0.28s ease',
        }}
        aria-hidden
      >
        <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="28" r="20" fill="#1e2a32" stroke="var(--accent-pale-gray)" strokeWidth="2" />
          <path d="M18 24 L28 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <path d="M46 24 L36 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <circle cx="24" cy="28" r="2.5" fill="#e2e8f0" />
          <circle cx="40" cy="28" r="2.5" fill="#e2e8f0" />
          <path d="M24 36 Q32 42 42 35" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M22 40 Q32 54 42 40" fill="#64748b" opacity="0.85" />
          <rect x="48" y="44" width="10" height="14" rx="1.5" fill="#c4b8a0" stroke="#8a7a60" strokeWidth="1" />
          <line x1="50" y1="48" x2="56" y2="48" stroke="#8a7a60" strokeWidth="0.8" />
          <line x1="50" y1="51" x2="56" y2="51" stroke="#8a7a60" strokeWidth="0.8" />
        </svg>
      </div>

      <span
        style={{
          fontSize: '0.55rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      >
        bilge
      </span>
    </motion.div>
  );
}
