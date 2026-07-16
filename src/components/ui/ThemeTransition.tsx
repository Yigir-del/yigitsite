import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';
import { DOMAIN_MAP } from '../../themes/domains';

const cinematic = [0.22, 1, 0.36, 1] as const;

export default function ThemeTransition() {
  const { isTransitioning, theme, nextTheme, transitionProgress } = useTheme();
  const incoming = nextTheme ? DOMAIN_MAP[nextTheme] : DOMAIN_MAP[theme];
  const showTitle = transitionProgress > 0.15 && transitionProgress < 0.85;
  const showDomain = transitionProgress > 0.4 && transitionProgress < 0.9;

  // Soft dissolve — never opaque, never solid color fill
  const veil = isTransitioning
    ? Math.sin(Math.min(1, transitionProgress) * Math.PI) * 0.45
    : 0;
  const blurPx = isTransitioning
    ? Math.sin(Math.min(1, transitionProgress) * Math.PI) * 10
    : 0;
  const fog = incoming.fogHint;
  const spark = incoming.particleHint;

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          key="domain-transition"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: cinematic }}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9000,
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            // Atmosphere dissolve — vignette + soft wash, NOT a solid flash
            background: `
              radial-gradient(
                ellipse at center,
                transparent 20%,
                ${fog}55 70%,
                ${fog}99 100%
              )
            `,
            opacity: Math.max(0.15, veil),
            backdropFilter: `blur(${blurPx}px) saturate(${1 + veil * 0.4})`,
            WebkitBackdropFilter: `blur(${blurPx}px) saturate(${1 + veil * 0.4})`,
          }}
        >
          <div style={{ textAlign: 'center', transform: 'translateZ(0)' }}>
            <AnimatePresence>
              {showTitle && (
                <motion.div
                  key="ryoiki"
                  initial={{ opacity: 0, letterSpacing: '0.6em', filter: 'blur(8px)' }}
                  animate={{ opacity: 0.85, letterSpacing: '0.35em', filter: 'blur(0px)' }}
                  exit={{ opacity: 0, filter: 'blur(6px)', letterSpacing: '0.5em' }}
                  transition={{ duration: 0.7, ease: cinematic }}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(0.7rem, 1.5vw, 0.85rem)',
                    fontWeight: 300,
                    color: 'var(--text-main)',
                    textTransform: 'uppercase',
                    marginBottom: '1rem',
                  }}
                >
                  RYOIKI TENKAI
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {showDomain && (
                <motion.div
                  key={incoming.id}
                  initial={{ opacity: 0, y: 12, filter: 'blur(10px)', scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)', scale: 1 }}
                  exit={{ opacity: 0, y: -8, filter: 'blur(8px)' }}
                  transition={{ duration: 0.8, ease: cinematic }}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 'clamp(1.4rem, 4vw, 2.4rem)',
                    fontWeight: 300,
                    color: 'var(--text-main)',
                    letterSpacing: '0.2em',
                    textShadow: `0 0 40px ${spark}66`,
                  }}
                >
                  {incoming.label}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <motion.div
            initial={{ x: '-120%', opacity: 0 }}
            animate={{ x: '120%', opacity: [0, 0.25, 0] }}
            transition={{ duration: 1.6, ease: cinematic, delay: 0.2 }}
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '35%',
              background: `linear-gradient(90deg, transparent, ${spark}33, transparent)`,
              mixBlendMode: 'screen',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
