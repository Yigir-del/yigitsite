import { useRef } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { useThrowableEdgeFlight } from '../../hooks/useThrowableEdgeFlight';
import { useMemorial } from '../../context/MemorialContext';

/** League mark — flies on desktop; click opens /league */
export default function FlyingLoL() {
  const { pathname } = useLocation();
  const { navigateRespectfully, isQuiet } = useMemorial();
  const draggedRef = useRef(false);

  const { x, y, visible, dragging, onDragStart, onDragEnd } = useThrowableEdgeFlight({
    startDelay: 3200,
    durationMin: 14,
    durationMax: 22,
    preferHorizontal: false,
  });

  if (!visible || isQuiet || pathname === '/league') return null;

  const handleOpen = () => {
    if (draggedRef.current) return;
    navigateRespectfully('/league');
  };

  return (
    <motion.div
      role="button"
      tabIndex={0}
      aria-label="League of Legends profilini aç"
      title="LoL profilim"
      onClick={handleOpen}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleOpen();
        }
      }}
      style={{
        x,
        y,
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: dragging ? 200 : 38,
        cursor: 'grab',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.35rem',
        pointerEvents: 'auto',
        background: 'none',
        border: 'none',
        padding: 0,
        font: 'inherit',
        color: 'inherit',
        outline: 'none',
      }}
      drag
      dragMomentum
      dragElastic={0.2}
      whileDrag={{ scale: 1.12, cursor: 'grabbing', zIndex: 200 }}
      onDragStart={() => {
        draggedRef.current = false;
        onDragStart();
      }}
      onDrag={() => {
        draggedRef.current = true;
      }}
      onDragEnd={onDragEnd}
      onPointerEnter={() => {
        void import('../sections/League');
      }}
    >
      <div
        style={{
          width: '54px',
          height: '54px',
          borderRadius: '50%',
          background: 'var(--glass-bg)',
          border: '1px solid rgba(200, 155, 60, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 18px rgba(200, 155, 60, 0.25)',
          userSelect: 'none',
        }}
      >
        <LoLMark />
      </div>
      <span
        style={{
          fontSize: '0.55rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          opacity: 0.75,
          pointerEvents: 'none',
        }}
      >
        lol
      </span>
    </motion.div>
  );
}

function LoLMark() {
  return (
    <svg width="30" height="30" viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M8 8 L28 8 L28 14 L16 14 L16 40 L8 40 Z"
        fill="#c89b3c"
      />
      <path
        d="M32 8 L40 8 L40 40 L32 40 L32 28 L24 28 L24 20 L32 20 Z"
        fill="#c89b3c"
        opacity="0.85"
      />
    </svg>
  );
}
