import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { MEMORIAL_PATH } from '../../context/MemorialContext';

const ease = [0.22, 1, 0.36, 1] as const;

/** Soft bottom→up page enter — quiet fade for the memorial */
export default function PageTransition({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const memorial = pathname === MEMORIAL_PATH;

  return (
    <motion.div
      className="page-transition"
      initial={memorial ? { opacity: 0 } : { opacity: 0, y: 40 }}
      animate={
        memorial
          ? { opacity: 1, transition: { duration: 0.9, ease } }
          : { opacity: 1, y: 0, transition: { duration: 0.6, ease } }
      }
      exit={
        memorial
          ? { opacity: 0, transition: { duration: 0.45, ease } }
          : { opacity: 0, y: -12, transition: { duration: 0.22, ease } }
      }
    >
      {children}
    </motion.div>
  );
}

/** Soft loader while lazy routes resolve — same motion language */
export function PageTransitionFallback() {
  return (
    <motion.div
      className="page-transition-fallback"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25, ease }}
      style={{
        minHeight: '50vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-hidden
    >
      <div
        style={{
          width: '1px',
          height: '40px',
          background: 'linear-gradient(to top, transparent, var(--text-muted), transparent)',
          opacity: 0.45,
        }}
      />
    </motion.div>
  );
}
