import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { randomOffscreenStart, randomOnScreen } from '../../utils/flightPath';

const TAUNTS = [
  "Kral, biraz bağış?",
  "Hey kral, cebin dolu mu?",
  "Dilenci aç, kral kör mü?",
  "Bir kuruşluk merhamet, kralım!",
  "Zengin kral, fakir dilenci — klasik.",
  "Kral bak buraya! Görmezden gelme.",
  "Tahtın güzel, cüzdanın da öyle midir?",
  "Kral, bugün lütuf günü mü?",
  "Dilenciyim ama gururum var… azıcık.",
  "Kral! Kral! Bakıyorum sana!",
  "Bir kahve parası, ey yüce kral.",
  "Sen kral, ben dilenci — sen ver, ben alırım.",
];

/** Angry beggar face that drifts around and heckles the king */
export default function FlyingBeggar() {
  const [position, setPosition] = useState(randomOffscreenStart);
  const [line, setLine] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const enter = setTimeout(() => setPosition(randomOnScreen(0.15)), 200);
    const move = setInterval(() => setPosition(randomOnScreen(0.15)), 9000);

    const speak = () => {
      setLine(TAUNTS[Math.floor(Math.random() * TAUNTS.length)]);
      setShowBubble(true);
      if (hideRef.current) clearTimeout(hideRef.current);
      hideRef.current = setTimeout(() => setShowBubble(false), 3200);
    };

    const firstSpeak = setTimeout(speak, 2500);
    const speakLoop = setInterval(speak, 7000 + Math.random() * 4000);

    return () => {
      clearTimeout(enter);
      clearTimeout(firstSpeak);
      clearInterval(move);
      clearInterval(speakLoop);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ x: position.x, y: position.y }}
      transition={{ duration: 8.5, ease: 'easeInOut' }}
      drag
      dragMomentum
      whileDrag={{ scale: 1.15, cursor: 'grabbing' }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 88,
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.35rem',
        pointerEvents: 'auto',
      }}
      title="Sinirli dilenci"
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
              textAlign: 'center',
              boxShadow: '0 8px 24px var(--shadow)',
              whiteSpace: 'normal',
              lineHeight: 1.35,
              pointerEvents: 'none',
            }}
          >
            {line}
          </motion.div>
        )}
      </AnimatePresence>

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
        }}
        aria-hidden
      >
        <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="30" r="22" fill="#2a2030" stroke="var(--accent-pale-gray)" strokeWidth="2" />
          {/* angry brows */}
          <path d="M18 22 L28 26" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M46 22 L36 26" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          {/* eyes */}
          <circle cx="24" cy="30" r="3" fill="#f8fafc" />
          <circle cx="40" cy="30" r="3" fill="#f8fafc" />
          {/* frown */}
          <path d="M24 42 Q32 36 40 42" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          {/* tiny tin cup */}
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
