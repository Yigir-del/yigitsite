import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../context/ThemeContext';

export default function ThemeTransition() {
  const { isTransitioning, theme } = useTheme();

  // Different overlay colors depending on the incoming theme to make it feel specific
  const overlayColors = {
    Muryokusho: '#0a0a14',
    FukumaMizushi: '#1a0505',
    KangoAneitei: '#000000',
    GaikanTecchisen: '#ff3300', // A bright flash for lava
    ShinganSoai: '#ffffff', // A white flash for crystal
  };

  return (
    <AnimatePresence>
      {isTransitioning && (
        <motion.div
          initial={{ opacity: 0, scale: 1 }}
          animate={{ opacity: 1, scale: 1.05 }}
          exit={{ opacity: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 9999,
            backgroundColor: overlayColors[theme],
            pointerEvents: 'none',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mixBlendMode: theme === 'ShinganSoai' ? 'screen' : 'normal',
          }}
        >
          {/* Subtle energy wave / radial gradient in the center */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 2, 4], opacity: [0, 1, 0] }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{
              width: '50vw',
              height: '50vw',
              borderRadius: '50%',
              background: `radial-gradient(circle, ${
                theme === 'GaikanTecchisen' ? 'rgba(255,200,0,0.8)' : 
                theme === 'ShinganSoai' ? 'rgba(200,230,255,0.8)' :
                theme === 'FukumaMizushi' ? 'rgba(255,0,0,0.5)' :
                'rgba(255,255,255,0.1)'
              } 0%, transparent 70%)`,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
