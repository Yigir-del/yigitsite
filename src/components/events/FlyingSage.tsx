import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { randomOffscreenStart, randomOnScreen } from '../../utils/flightPath';

const ADVICE = [
  "Dilenci, açlık zihin açar — seninki hâlâ kapalı.",
  "Öğüt: dilenmeden önce gururu bir kenara bırak… seninkisi çok yer kaplıyor.",
  "Ey dilenci, krala bağırıyorsun; aynaya bir bak derim.",
  "Bilgelik der ki: teneke kutu dolmazsa, dil de dinlensin.",
  "Öğüt veriyorum çünkü acıyorum — biraz da can sıkıyorsun.",
  "Dilenci, merhamet dilenirsin; nezaket ise unutulmuş.",
  "Taht istemiyorsun, tamam — ama en azından fısılda.",
  "Açlık geçici, lafın kalıcı… daha az kalıcı konuş.",
  "Ey dilenci: önce kendini doyur, sonra kralı yargıla.",
  "Bilge sözü: bağış almak için yüzünü düzelt. O kaşlar korkutuyor.",
  "Öğüt: kral kör değil — sen biraz fazla görünürsün.",
  "Dilenci kardeşim, gururla aç kalmak da bir sanat… sen acemisin.",
];

/** Wise face that drifts around and sasses advice at the beggar */
export default function FlyingSage() {
  const [position, setPosition] = useState(randomOffscreenStart);
  const [line, setLine] = useState('');
  const [showBubble, setShowBubble] = useState(false);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const enter = setTimeout(() => setPosition(randomOnScreen(0.18)), 900);
    const move = setInterval(() => setPosition(randomOnScreen(0.18)), 11000);

    const advise = () => {
      const next = ADVICE[Math.floor(Math.random() * ADVICE.length)];
      setLine(next);
      setShowBubble(true);
      if (hideRef.current) clearTimeout(hideRef.current);
      hideRef.current = setTimeout(() => setShowBubble(false), 3600);
      window.dispatchEvent(new CustomEvent('sage-advice', { detail: { line: next } }));
    };

    const first = setTimeout(advise, 5500);
    const loop = setInterval(advise, 11000 + Math.random() * 5000);

    return () => {
      clearTimeout(enter);
      clearTimeout(first);
      clearInterval(move);
      clearInterval(loop);
      if (hideRef.current) clearTimeout(hideRef.current);
    };
  }, []);

  return (
    <motion.div
      initial={false}
      animate={{ x: position.x, y: position.y }}
      transition={{ duration: 10, ease: 'easeInOut' }}
      drag
      dragMomentum
      whileDrag={{ scale: 1.12, cursor: 'grabbing' }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 45,
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.35rem',
        pointerEvents: 'auto',
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
        }}
        aria-hidden
      >
        <svg width="34" height="34" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="32" cy="28" r="20" fill="#1e2a32" stroke="var(--accent-pale-gray)" strokeWidth="2" />
          {/* calm brows */}
          <path d="M18 24 L28 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          <path d="M46 24 L36 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
          {/* knowing eyes */}
          <circle cx="24" cy="28" r="2.5" fill="#e2e8f0" />
          <circle cx="40" cy="28" r="2.5" fill="#e2e8f0" />
          {/* slight smirk */}
          <path d="M24 36 Q32 42 42 35" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" fill="none" />
          {/* beard */}
          <path d="M22 40 Q32 54 42 40" fill="#64748b" opacity="0.85" />
          {/* tiny scroll */}
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
