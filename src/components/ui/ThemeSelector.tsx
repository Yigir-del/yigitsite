import { useTheme } from '../../context/ThemeContext';
import { DOMAINS, DOMAIN_MAP } from '../../themes/domains';

export default function ThemeSelector() {
  const { theme, nextTheme, setTheme, isTransitioning } = useTheme();

  const cycleTheme = () => {
    if (isTransitioning) return;
    const currentIndex = DOMAINS.findIndex((d) => d.id === theme);
    const nextIndex = (currentIndex + 1) % DOMAINS.length;
    setTheme(DOMAINS[nextIndex].id);
  };

  const activeThemeId = nextTheme ?? theme;
  const currentConfig = DOMAIN_MAP[activeThemeId] || DOMAINS[0];

  return (
    <button
      type="button"
      className="domain-watermark"
      onClick={cycleTheme}
      aria-label={`Domain Expansion: ${currentConfig.label}. Click to switch theme.`}
      title="Ryōiki Tenkai — Click to switch domain"
      data-domain={activeThemeId}
      data-transitioning={isTransitioning ? 'true' : 'false'}
    >
      <div className="domain-watermark__eyebrow">RYOIKI TENKAI</div>
      <div className="domain-watermark__name">{currentConfig.label}</div>
    </button>
  );
}
