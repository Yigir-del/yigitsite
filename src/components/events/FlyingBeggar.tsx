import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useThrowableEdgeFlight } from '../../hooks/useThrowableEdgeFlight';
import {
  BEGGAR_OWN,
  BEGGAR_TO_SAGE,
  BEGGAR_REPLY_TO_SAGE,
  FLYER_SPEAK,
  pickRandom,
  shouldJab,
  type FlyerSpeakDetail,
} from '../../utils/flyerDialogue';

/** Angry beggar — mostly heckles the king; rarely jabs the sage with a mapped reply */
export default function FlyingBeggar() {
  const { x, y, visible, dragging, onDragStart, onDragEnd } = useThrowableEdgeFlight({
    durationMin: 16,
    durationMax: 24,
  });
  const [line, setLine] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const replyRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busyRef = useRef(false);

  const say = (text: string, holdMs = 5000) => {
    busyRef.current = true;
    setLine(text);
    setShowBubble(true);
    if (hideRef.current) clearTimeout(hideRef.current);
    hideRef.current = setTimeout(() => {
      setShowBubble(false);
      busyRef.current = false;
    }, holdMs);
  };

  useEffect(() => {
    const emit = (detail: FlyerSpeakDetail) => {
      window.dispatchEvent(new CustomEvent(FLYER_SPEAK, { detail }));
    };

    const speak = () => {
      if (busyRef.current) return;

      if (shouldJab(0.15)) {
        const jab = pickRandom(BEGGAR_TO_SAGE);
        say(jab, 5000);
        emit({ from: 'beggar', kind: 'jab', line: jab });
        return;
      }

      const own = pickRandom(BEGGAR_OWN);
      say(own);
      emit({ from: 'beggar', kind: 'own', line: own });
    };

    const firstSpeak = setTimeout(speak, 2500);
    const speakLoop = setInterval(speak, 10000 + Math.random() * 4000);

    const onFlyerSpeak = (e: Event) => {
      const detail = (e as CustomEvent<FlyerSpeakDetail>).detail;
      if (!detail || detail.from !== 'sage' || detail.kind !== 'jab') return;

      const reply = BEGGAR_REPLY_TO_SAGE[detail.line];
      if (!reply) return;

      if (replyRef.current) clearTimeout(replyRef.current);
      busyRef.current = true;
      replyRef.current = setTimeout(() => {
        say(reply, 5000);
      }, 1500);
    };

    window.addEventListener(FLYER_SPEAK, onFlyerSpeak);

    return () => {
      clearTimeout(firstSpeak);
      clearInterval(speakLoop);
      if (hideRef.current) clearTimeout(hideRef.current);
      if (replyRef.current) clearTimeout(replyRef.current);
      window.removeEventListener(FLYER_SPEAK, onFlyerSpeak);
    };
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      style={{
        x,
        y,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: dragging ? 200 : 40,
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
      whileDrag={{ scale: 1.15, cursor: 'grabbing', zIndex: 200 }}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      title="Sinirli dilenci"
    >
      <div
        style={{
          position: 'absolute',
          bottom: '100%',
          left: '50%',
          transform: 'translateX(-50%)',
          marginBottom: '0.4rem',
          pointerEvents: 'none',
          zIndex: 0,
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
                maxWidth: '180px',
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
          position: 'relative',
          zIndex: 0,
        }}
        aria-hidden
      >
        <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="30" r="22" fill="#2a2030" stroke="var(--accent-pale-gray)" strokeWidth="2" />
          <path d="M18 22 L28 26" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46 22 L36 26" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="30" r="3" fill="#f8fafc" />
          <circle cx="40" cy="30" r="3" fill="#f8fafc" />
          <path d="M24 42 Q32 36 40 42" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M22 52 H42 L40 58 H24 Z" fill="#8a7a60" stroke="#c4b8a0" strokeWidth="1" />
          <ellipse cx="32" cy="52" rx="10" ry="2.5" fill="#a89870" />
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
        dilenci
      </span>
    </motion.div>
  );
}
