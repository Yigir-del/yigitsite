import { useTheme } from '../../context/ThemeContext';
import { DOMAIN_MAP } from '../../themes/domains';

/**
 * Decorative Domain Watermark (§3.1).
 * Completely non-interactive: clicking does nothing, no theme switching, no cycling.
 * Displays canonical "RYOIKI TENKAI / MURYOKUSHO".
 */
export default function ThemeSelector() {
  const { theme } = useTheme();
  const currentConfig = DOMAIN_MAP[theme] || DOMAIN_MAP.Muryokusho;

  return (
    <div
      className="domain-watermark"
      aria-hidden="true"
      data-domain={theme}
      style={{
        pointerEvents: 'none',
        cursor: 'default',
        userSelect: 'none',
      }}
    >
      <div className="domain-watermark__eyebrow">RYOIKI TENKAI</div>
      <div className="domain-watermark__name">{currentConfig.label}</div>
    </div>
  );
}
