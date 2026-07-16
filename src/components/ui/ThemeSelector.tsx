import { useEffect, useState } from 'react';
import { useTheme, type DomainTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';
import { Infinity as InfinityIcon, Skull, Moon, Flame, Gem } from 'lucide-react';

type ThemeConfig = {
  id: DomainTheme;
  name: string;
  icon: JSX.Element;
  startX: string;
  startY: string;
  duration: number;
};

const themes: ThemeConfig[] = [
  { id: 'Muryokusho', name: 'Muryokusho', icon: <InfinityIcon size={24} />, startX: '15vw', startY: '25vh', duration: 40 },
  { id: 'FukumaMizushi', name: 'Fukuma Mizushi', icon: <Skull size={24} />, startX: '75vw', startY: '20vh', duration: 35 },
  { id: 'KangoAneitei', name: 'Kango Aneitei', icon: <Moon size={24} />, startX: '85vw', startY: '75vh', duration: 45 },
  { id: 'GaikanTecchisen', name: 'Gaikan Tecchisen', icon: <Flame size={24} />, startX: '20vw', startY: '70vh', duration: 38 },
  { id: 'ShinganSoai', name: 'Shingan Soai', icon: <Gem size={24} />, startX: '50vw', startY: '85vh', duration: 50 },
];

function parsePosition(startX: string, startY: string) {
  const x = (parseFloat(startX) / 100) * window.innerWidth;
  const y = (parseFloat(startY) / 100) * window.innerHeight;
  return { x, y };
}

function FloatingThemeIcon({
  t,
  isActive,
  onSelect,
}: {
  t: ThemeConfig;
  isActive: boolean;
  onSelect: () => void;
}) {
  const [position, setPosition] = useState(() =>
    typeof window !== 'undefined' ? parsePosition(t.startX, t.startY) : { x: 0, y: 0 }
  );
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const updatePosition = () => {
      const newX = window.innerWidth * 0.05 + Math.random() * (window.innerWidth * 0.85);
      const newY = window.innerHeight * 0.05 + Math.random() * (window.innerHeight * 0.85);
      setPosition({ x: newX, y: newY });
      setRotation(prev => prev + 90 + Math.random() * 180);
    };

    const interval = setInterval(updatePosition, t.duration * 250);
    return () => clearInterval(interval);
  }, [t.duration]);

  return (
    <motion.button
      onClick={onSelect}
      title={t.name}
      animate={{ x: position.x, y: position.y, rotate: rotation }}
      transition={{ duration: t.duration * 0.25, ease: 'easeInOut' }}
      style={{
        position: 'fixed',
        left: 0,
        top: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isActive ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)',
        backdropFilter: 'blur(4px)',
        border: isActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.05)',
        color: isActive ? 'var(--accent-soft-white)' : 'var(--text-muted)',
        cursor: 'pointer',
        opacity: isActive ? 1 : 0.5,
        padding: '1rem',
        borderRadius: '50%',
        boxShadow: isActive ? '0 0 20px rgba(255,255,255,0.1)' : 'none',
        zIndex: 1,
      }}
      whileHover={{ scale: 1.15, opacity: 0.9 }}
    >
      {t.icon}
    </motion.button>
  );
}

export default function ThemeSelector() {
  const { theme, setTheme, isTransitioning } = useTheme();

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
          <FloatingThemeIcon
            key={t.id}
            t={t}
            isActive={theme === t.id}
            onSelect={() => setTheme(t.id)}
          />
        ))}
      </div>
    </>
  );
}
