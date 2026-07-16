import { useTheme, type DomainTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Infinity, Skull, Moon, Flame, Gem } from 'lucide-react';

export default function ThemeSelector() {
  const { theme, setTheme, isTransitioning } = useTheme();

  const themes: { id: DomainTheme; name: string; icon: JSX.Element; startX: string; startY: string; duration: number }[] = [
    { id: 'Muryokusho', name: 'Muryokusho', icon: <Infinity size={24} />, startX: '15vw', startY: '25vh', duration: 40 },
    { id: 'FukumaMizushi', name: 'Fukuma Mizushi', icon: <Skull size={24} />, startX: '75vw', startY: '20vh', duration: 35 },
    { id: 'KangoAneitei', name: 'Kango Aneitei', icon: <Moon size={24} />, startX: '85vw', startY: '75vh', duration: 45 },
    { id: 'GaikanTecchisen', name: 'Gaikan Tecchisen', icon: <Flame size={24} />, startX: '20vw', startY: '70vh', duration: 38 },
    { id: 'ShinganSoai', name: 'Shingan Soai', icon: <Gem size={24} />, startX: '50vw', startY: '85vh', duration: 50 },
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
        zIndex: 1, 
        overflow: 'hidden'
      }}>
        {themes.map((t) => (
          <motion.button
            key={t.id}
            onClick={() => setTheme(t.id)}
            title={t.name}
            drag
            dragMomentum={true}
            whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
            initial={{ x: `calc(${t.startX} - 25px)`, y: `calc(${t.startY} - 25px)`, rotate: 0 }}
            animate={{ 
              x: [
                `calc(${t.startX} - 25px)`, 
                `calc(${t.startX} + 50px)`, 
                `calc(${t.startX} - 20px)`,
                `calc(${t.startX} - 25px)`
              ], 
              y: [
                `calc(${t.startY} - 25px)`, 
                `calc(${t.startY} + 40px)`, 
                `calc(${t.startY} - 50px)`,
                `calc(${t.startY} - 25px)`
              ],
              rotate: [0, 90, 180, 360]
            }}
            transition={{ 
              duration: t.duration, 
              ease: "linear", 
              repeat: Infinity 
            }}
            style={{
              position: 'absolute',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: theme === t.id ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
              backdropFilter: 'blur(4px)',
              border: theme === t.id ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
              color: theme === t.id ? 'var(--accent-soft-white)' : 'var(--text-muted)',
              cursor: 'grab',
              opacity: theme === t.id ? 1 : 0.5,
              padding: '1rem',
              borderRadius: '50%',
              boxShadow: theme === t.id ? '0 0 20px rgba(255,255,255,0.1)' : 'none'
            }}
            onMouseEnter={(e) => {
              if (theme !== t.id) {
                e.currentTarget.style.opacity = '0.9';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.2)';
                e.currentTarget.style.color = 'var(--text-main)';
              }
            }}
            onMouseLeave={(e) => {
              if (theme !== t.id) {
                e.currentTarget.style.opacity = '0.5';
                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.05)';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            {t.icon}
          </motion.button>
        ))}
      </div>
    </>
  );
}
