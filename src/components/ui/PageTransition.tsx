import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { MEMORIAL_PATH, MEMORIAL_LEGACY_PATH } from '../../context/MemorialContext';

const ease = [0.22, 1, 0.36, 1] as const;

/**
 * GPU-only page transition — opacity + translate3d.
 * Never animates layout properties (top/left/width/height/margin).
 */
export default function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const memorial = pathname === MEMORIAL_PATH || pathname === MEMORIAL_LEGACY_PATH;

  return (
    <motion.div
      className="page-transition"
      initial={
        memorial
          ? { opacity: 0, transform: 'translate3d(0, 0, 0)' }
          : { opacity: 0, transform: 'translate3d(0, 28px, 0)' }
      }
      animate={{
        opacity: 1,
        transform: 'translate3d(0, 0, 0)',
        transition: { duration: memorial ? 0.55 : 0.42, ease },
      }}
      exit={{
        opacity: 0,
        transform: memorial ? 'translate3d(0, 0, 0)' : 'translate3d(0, -8px, 0)',
        transition: { duration: memorial ? 0.28 : 0.16, ease },
      }}
      style={{
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden',
      }}
    >
      {children}
    </motion.div>
  );
}

export function PageTransitionFallback() {
  return (
    <div
      className="page-transition-fallback"
      style={{
        minHeight: '40vh',
        pointerEvents: 'none',
      }}
      aria-hidden
    />
  );
}
