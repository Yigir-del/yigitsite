import { useTheme, DomainTheme } from '../../context/ThemeContext';

export default function ThemeSelector() {
  const { theme, setTheme, isTransitioning } = useTheme();

  const themes: { id: DomainTheme; name: string }[] = [
    { id: 'Muryokusho', name: 'Muryokusho' },
    { id: 'FukumaMizushi', name: 'Fukuma Mizushi' },
    { id: 'KangoAneitei', name: 'Kango Aneitei' },
    { id: 'GaikanTecchisen', name: 'Gaikan Tecchisen' },
    { id: 'ShinganSoai', name: 'Shingan Soai' },
  ];

  return (
    <>
      <div style={{
        position: 'fixed',
        bottom: '2rem',
        right: '2rem',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-end',
        pointerEvents: isTransitioning ? 'none' : 'auto',
      }}>
        <div style={{
          fontSize: '0.8rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          marginBottom: '1rem',
          opacity: 0.7
        }}>
          Ryōiki Tenkai
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
          {themes.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              style={{
                background: 'transparent',
                border: 'none',
                color: theme === t.id ? 'var(--accent-soft-white)' : 'var(--text-muted)',
                fontSize: '1rem',
                fontFamily: 'var(--font-title)',
                cursor: 'pointer',
                opacity: theme === t.id ? 1 : 0.5,
                transition: 'all 0.3s ease',
                textShadow: theme === t.id ? '0 0 10px var(--accent-muted-blue)' : 'none',
                transform: theme === t.id ? 'scale(1.05)' : 'scale(1)',
                transformOrigin: 'right center',
              }}
              onMouseEnter={(e) => {
                if (theme !== t.id) e.currentTarget.style.opacity = '0.8';
              }}
              onMouseLeave={(e) => {
                if (theme !== t.id) e.currentTarget.style.opacity = '0.5';
              }}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Watermark */}
      <div style={{
        position: 'fixed',
        top: '2rem',
        left: '2rem',
        zIndex: 50,
        pointerEvents: 'none',
        opacity: 0.1,
        fontFamily: 'var(--font-title)',
        fontSize: 'clamp(3rem, 5vw, 6rem)',
        color: 'var(--text-main)',
        whiteSpace: 'nowrap',
        writingMode: 'vertical-rl',
        textOrientation: 'mixed',
        letterSpacing: '0.5em',
      }}>
        {themes.find(t => t.id === theme)?.name}
      </div>
    </>
  );
}
