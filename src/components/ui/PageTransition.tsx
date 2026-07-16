import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

const ease = [0.22, 1, 0.36, 1] as const;

/** Soft bottom→up page enter — snappy, starts immediately (no wait-for-exit) */
export default function PageTransition({ children }: { children: ReactNode }) {
  return (
    <motion.div
      className="page-transition"
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.38, ease }}
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
