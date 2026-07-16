import { useTheme, type DomainTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

export default function ThemeSelector() {
  const { theme, setTheme, isTransitioning } = useTheme();

  const themes: { id: DomainTheme; name: string; startX: string; startY: string; duration: number }[] = [
    { id: 'Muryokusho', name: 'Muryokusho', startX: '10vw', startY: '20vh', duration: 40 },
    { id: 'FukumaMizushi', name: 'Fukuma Mizushi', startX: '70vw', startY: '15vh', duration: 35 },
    { id: 'KangoAneitei', name: 'Kango Aneitei', startX: '80vw', startY: '80vh', duration: 45 },
    { id: 'GaikanTecchisen', name: 'Gaikan Tecchisen', startX: '15vw', startY: '75vh', duration: 38 },
    { id: 'ShinganSoai', name: 'Shingan Soai', startX: '45vw', startY: '50vh', duration: 50 },
  ];

  return (
    <>
      {/* Small Top Left Active Theme Indicator */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        zIndex: 50,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.2rem'
      }}>
        <div style={{
          fontSize: '0.6rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          opacity: 0.6
        }}>
          Ryōiki Tenkai
        </div>
        <div style={{
          fontFamily: 'var(--font-title)',
          fontSize: '1.2rem',
          color: 'var(--text-main)',
          letterSpacing: '0.1em',
          opacity: 0.9,
          textShadow: '0 0 10px rgba(255,255,255,0.2)'
        }}>
          {themes.find(t => t.id === theme)?.name}
        </div>
      </div>

      {/* Floating Theme Modifiers in the Background */}
      <div style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: isTransitioning ? 'none' : 'auto',
        zIndex: 1, // very low z-index so it's in the background, behind the main content (which is z-index 10)
        overflow: 'hidden'
      }}>
        {themes.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => setTheme(t.id)}
            drag
            dragMomentum={true}
            whileDrag={{ scale: 1.1, cursor: 'grabbing' }}
            initial={{ x: `calc(${t.startX} - 50px)`, y: `calc(${t.startY} - 50px)` }}
            animate={{ 
              x: [
                `calc(${t.startX} - 50px)`, 
                `calc(${t.startX} + 50px)`, 
                `calc(${t.startX} - 20px)`,
                `calc(${t.startX} - 50px)`
              ], 
              y: [
                `calc(${t.startY} - 50px)`, 
                `calc(${t.startY} + 30px)`, 
                `calc(${t.startY} - 60px)`,
                `calc(${t.startY} - 50px)`
              ] 
            }}
            transition={{ 
              duration: t.duration, 
              ease: "linear", 
              repeat: Infinity 
            }}
            style={{
              position: 'absolute',
              background: 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(2px)',
              border: theme === t.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
              color: theme === t.id ? 'var(--accent-soft-white)' : 'var(--text-muted)',
              fontSize: '0.85rem',
              fontFamily: 'var(--font-body)',
              letterSpacing: '0.1em',
              cursor: 'grab',
              opacity: theme === t.id ? 1 : 0.4,
              textShadow: theme === t.id ? '0 0 8px var(--accent-muted-blue)' : 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '30px',
              whiteSpace: 'nowrap',
              boxShadow: theme === t.id ? '0 0 15px rgba(255,255,255,0.05)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (theme !== t.id) {
                e.currentTarget.style.opacity = '0.8';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (theme !== t.id) {
                e.currentTarget.style.opacity = '0.4';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
              }
            }}
          >
            {t.name}
          </motion.button>
        ))}
      </div>
    </>
  );
}
