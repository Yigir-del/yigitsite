import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { DOMAINS } from '../../themes/domains';

const cinematic = [0.22, 1, 0.36, 1] as const;

export default function ThemeSelector() {
  const { theme, setTheme, isTransitioning } = useTheme();
  const [open, setOpen] = useState(false);
  const active = DOMAINS.find((d) => d.id === theme);

  return (
    <>
      {/* Active domain — top right */}
      <div
        style={{
          position: 'fixed',
          top: '1.75rem',
          right: '1.75rem',
          zIndex: 50,
          pointerEvents: 'none',
          textAlign: 'right',
        }}
      >
        <div
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.55rem',
            letterSpacing: '0.35em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            opacity: 0.55,
            marginBottom: '0.25rem',
          }}
        >
          RYOIKI TENKAI
        </div>
        <motion.div
          key={theme}
          initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
          animate={{ opacity: 0.9, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.6, ease: cinematic }}
          style={{
            fontFamily: 'var(--font-body)',
            fontSize: '0.95rem',
            fontWeight: 300,
            color: 'var(--text-main)',
            letterSpacing: '0.18em',
          }}
        >
          {active?.label}
        </motion.div>
      </div>

      {/* Glass selector — bottom right */}
      <div
        style={{
          position: 'fixed',
          bottom: '1.75rem',
          right: '1.75rem',
          zIndex: 55,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: '0.6rem',
        }}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 12, filter: 'blur(8px)', scale: 0.96 }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
              exit={{ opacity: 0, y: 8, filter: 'blur(6px)', scale: 0.98 }}
              transition={{ duration: 0.45, ease: cinematic }}
              style={{
                background: 'rgba(10, 12, 18, 0.45)',
                backdropFilter: 'blur(16px)',
                WebkitBackdropFilter: 'blur(16px)',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '0.75rem',
                minWidth: '200px',
                maxHeight: 'min(50vh, 360px)',
                overflowY: 'auto',
                boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
              }}
            >
              <div
                style={{
                  fontSize: '0.55rem',
                  letterSpacing: '0.3em',
                  color: 'var(--text-muted)',
                  marginBottom: '0.6rem',
                  paddingLeft: '0.5rem',
                }}
              >
                DOMAIN
              </div>
              {DOMAINS.map((d, i) => {
                const isActive = d.id === theme;
                return (
                  <motion.button
                    key={d.id}
                    type="button"
                    disabled={isTransitioning}
                    onClick={() => {
                      setTheme(d.id);
                      setOpen(false);
                    }}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.35, ease: cinematic }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      background: isActive ? 'rgba(255,255,255,0.08)' : 'transparent',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.55rem 0.65rem',
                      color: isActive ? 'var(--text-main)' : 'var(--text-muted)',
                      fontFamily: 'var(--font-body)',
                      fontSize: '0.72rem',
                      fontWeight: 300,
                      letterSpacing: '0.12em',
                      cursor: isTransitioning ? 'wait' : 'pointer',
                      transition: 'background 0.25s ease, color 0.25s ease',
                    }}
                    whileHover={
                      isTransitioning
                        ? undefined
                        : { backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-main)' }
                    }
                  >
                    {d.label}
                  </motion.button>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          type="button"
          onClick={() => setOpen((v) => !v)}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          style={{
            background: 'rgba(10, 12, 18, 0.4)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            border: '1px solid rgba(255,255,255,0.14)',
            borderRadius: '999px',
            padding: '0.65rem 1.1rem',
            color: 'var(--text-main)',
            fontFamily: 'var(--font-body)',
            fontSize: '0.65rem',
            fontWeight: 300,
            letterSpacing: '0.28em',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
          }}
        >
          {open ? 'KAPAT' : 'DOMAIN'}
        </motion.button>
      </div>
    </>
  );
}
