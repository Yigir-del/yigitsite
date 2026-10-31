export type DomainId = 'Muryokusho' | 'FukumaMizushi' | 'KangoAneitei';

/** Lunar surface palette for the procedural Moon — lit surface, night side tint and atmospheric rim. */
export type DomainMoonPalette = {
  lit: string;
  shade: string;
  rim: string;
};

export type DomainConfig = {
  id: DomainId;
  label: string;
  fogHint: string;
  particleHint: string;
  pyramidStroke: string;
  pyramidGlow: string;
  moon: DomainMoonPalette;
  css: Record<string, string>;
};

export const DOMAINS: DomainConfig[] = [
  {
    id: 'Muryokusho',
    label: 'MURYOKUSHO',
    fogHint: '#0d131f',
    particleHint: '#c8d8f0',
    pyramidStroke: '#d8e6ff',
    pyramidGlow: 'rgba(100, 170, 255, 0.4)',
    moon: { lit: '#c9d2de', shade: '#1b2433', rim: '#9fb4d0' },
    css: {
      '--bg-deep-charcoal': '#0a0a14',
      '--bg-dark-navy': '#0d131f',
      '--bg-main': '#0d131f',
      '--bg-soft-gray': '#1e2024',
      '--text-main': '#e2e8f0',
      '--text-primary': '#e2e8f0',
      '--text-muted': '#94a3b8',
      '--accent-muted-blue': '#4b6b8b',
      '--accent-desaturated-cyan': '#395c6b',
      '--accent-pale-gray': '#cbd5e1',
      '--accent-soft-white': '#f8fafc',
      '--glow': 'rgba(148, 163, 184, 0.3)',
      '--glow-strong': 'rgba(203, 213, 225, 0.45)',
      '--glass-bg': 'rgba(13, 19, 31, 0.5)',
      '--glass-border': 'rgba(148, 163, 184, 0.2)',
      '--card-bg': 'rgba(20, 24, 36, 0.55)',
      '--card-border': 'rgba(148, 163, 184, 0.12)',
      '--card-hover': 'rgba(148, 163, 184, 0.1)',
      '--input-bg': 'rgba(10, 14, 24, 0.55)',
      '--button-bg': '#4b6b8b',
      '--button-hover': '#5a7d9e',
      '--tag-bg': 'rgba(75, 107, 139, 0.15)',
      '--tag-border': 'rgba(148, 163, 184, 0.22)',
      '--selection-bg': 'rgba(75, 107, 139, 0.45)',
      '--selection-text': '#f8fafc',
      '--scrollbar-thumb': '#4b6b8b',
      '--scrollbar-track': '#0d131f',
      '--link-hover': '#cbd5e1',
      '--cursor-glow': 'rgba(203, 213, 225, 0.4)',
      '--timeline': '#4b6b8b',
      '--shadow': 'rgba(0, 0, 0, 0.45)',
      '--gradient-a': 'rgba(13, 19, 31, 0.8)',
      '--gradient-b': 'rgba(30, 32, 36, 0.5)',
      '--blur-amount': '12px',
      '--noise-opacity': '0.06',
      '--hover-scale-glow': '0 0 24px rgba(203, 213, 225, 0.35)',
    },
  },
  {
    id: 'FukumaMizushi',
    label: 'FUKUMA MIZUSHI',
    fogHint: '#1a0808',
    particleHint: '#d98c8c',
    pyramidStroke: '#d4706f',
    pyramidGlow: 'rgba(186, 76, 76, 0.38)',
    moon: { lit: '#bf9391', shade: '#2b0e13', rim: '#b04d4d' },
    css: {
      '--bg-deep-charcoal': '#140505',
      '--bg-dark-navy': '#1a0808',
      '--bg-main': '#1a0808',
      '--bg-soft-gray': '#2a1114',
      '--text-main': '#ecd8d6',
      '--text-primary': '#ecd8d6',
      '--text-muted': '#b58c8b',
      '--accent-muted-blue': '#82262c',
      '--accent-desaturated-cyan': '#5c1a20',
      '--accent-pale-gray': '#d9b5b3',
      '--accent-soft-white': '#f6ecea',
      '--glow': 'rgba(186, 76, 76, 0.22)',
      '--glow-strong': 'rgba(204, 120, 118, 0.34)',
      '--glass-bg': 'rgba(26, 8, 8, 0.55)',
      '--glass-border': 'rgba(186, 76, 76, 0.2)',
      '--card-bg': 'rgba(36, 12, 12, 0.6)',
      '--card-border': 'rgba(186, 76, 76, 0.14)',
      '--card-hover': 'rgba(186, 76, 76, 0.1)',
      '--input-bg': 'rgba(20, 5, 5, 0.6)',
      '--button-bg': '#82262c',
      '--button-hover': '#9b3037',
      '--tag-bg': 'rgba(130, 38, 44, 0.25)',
      '--tag-border': 'rgba(186, 76, 76, 0.26)',
      '--selection-bg': 'rgba(130, 38, 44, 0.5)',
      '--selection-text': '#fff5f5',
      '--scrollbar-thumb': '#82262c',
      '--scrollbar-track': '#1a0808',
      '--link-hover': '#d9b5b3',
      '--cursor-glow': 'rgba(186, 76, 76, 0.38)',
      '--timeline': '#82262c',
      '--shadow': 'rgba(0, 0, 0, 0.6)',
      '--gradient-a': 'rgba(26, 8, 8, 0.85)',
      '--gradient-b': 'rgba(42, 18, 18, 0.6)',
      '--blur-amount': '12px',
      '--noise-opacity': '0.07',
      '--hover-scale-glow': '0 0 24px rgba(186, 76, 76, 0.32)',
    },
  },
  {
    id: 'KangoAneitei',
    label: "KANGO AN'EITEI",
    fogHint: '#12091c',
    particleHint: '#b9a2d6',
    pyramidStroke: '#9d7bc3',
    pyramidGlow: 'rgba(157, 123, 195, 0.36)',
    moon: { lit: '#bdb2d0', shade: '#1a1028', rim: '#8d72b8' },
    css: {
      '--bg-deep-charcoal': '#0a0512',
      '--bg-dark-navy': '#12091c',
      '--bg-main': '#12091c',
      '--bg-soft-gray': '#1c1229',
      '--text-main': '#e4dcf0',
      '--text-primary': '#e4dcf0',
      '--text-muted': '#a597bd',
      '--accent-muted-blue': '#5e3a80',
      '--accent-desaturated-cyan': '#42285a',
      '--accent-pale-gray': '#cfc2e0',
      '--accent-soft-white': '#f4f0fa',
      '--glow': 'rgba(157, 123, 195, 0.22)',
      '--glow-strong': 'rgba(176, 148, 212, 0.34)',
      '--glass-bg': 'rgba(18, 9, 28, 0.55)',
      '--glass-border': 'rgba(157, 123, 195, 0.2)',
      '--card-bg': 'rgba(27, 14, 40, 0.6)',
      '--card-border': 'rgba(157, 123, 195, 0.14)',
      '--card-hover': 'rgba(157, 123, 195, 0.1)',
      '--input-bg': 'rgba(14, 6, 22, 0.6)',
      '--button-bg': '#5e3a80',
      '--button-hover': '#744b9a',
      '--tag-bg': 'rgba(94, 58, 128, 0.25)',
      '--tag-border': 'rgba(157, 123, 195, 0.26)',
      '--selection-bg': 'rgba(94, 58, 128, 0.5)',
      '--selection-text': '#faf5ff',
      '--scrollbar-thumb': '#5e3a80',
      '--scrollbar-track': '#12091c',
      '--link-hover': '#cfc2e0',
      '--cursor-glow': 'rgba(157, 123, 195, 0.38)',
      '--timeline': '#5e3a80',
      '--shadow': 'rgba(0, 0, 0, 0.65)',
      '--gradient-a': 'rgba(18, 9, 28, 0.85)',
      '--gradient-b': 'rgba(29, 18, 43, 0.6)',
      '--blur-amount': '12px',
      '--noise-opacity': '0.07',
      '--hover-scale-glow': '0 0 24px rgba(157, 123, 195, 0.32)',
    },
  },
];

export const DOMAIN_MAP = Object.fromEntries(DOMAINS.map((d) => [d.id, d])) as Record<
  DomainId,
  DomainConfig
>;

export const DEFAULT_DOMAIN: DomainId = 'Muryokusho';

export function applyDomainCss(id: DomainId) {
  const styles = DOMAIN_MAP[id]?.css;
  if (!styles || typeof document === 'undefined') return;
  const root = document.documentElement;
  root.setAttribute('data-domain', id);
  for (const [key, value] of Object.entries(styles)) {
    root.style.setProperty(key, value);
  }
}
