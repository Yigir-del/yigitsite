export type DomainId = 'Muryokusho' | 'FukumaMizushi' | 'KangoAneitei';

export type DomainConfig = {
  id: DomainId;
  label: string;
  fogHint: string;
  particleHint: string;
  pyramidStroke: string;
  pyramidGlow: string;
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
    css: {
      '--bg-deep-charcoal': '#0a0a14',
      '--bg-dark-navy': '#0d131f',
      '--bg-soft-gray': '#1e2024',
      '--text-main': '#e2e8f0',
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
    particleHint: '#ff8888',
    pyramidStroke: '#ff5555',
    pyramidGlow: 'rgba(255, 40, 40, 0.45)',
    css: {
      '--bg-deep-charcoal': '#140505',
      '--bg-dark-navy': '#1a0808',
      '--bg-soft-gray': '#2a1212',
      '--text-main': '#fecaca',
      '--text-muted': '#f87171',
      '--accent-muted-blue': '#991b1b',
      '--accent-desaturated-cyan': '#7f1d1d',
      '--accent-pale-gray': '#fca5a5',
      '--accent-soft-white': '#fef2f2',
      '--glow': 'rgba(239, 68, 68, 0.3)',
      '--glow-strong': 'rgba(248, 113, 113, 0.5)',
      '--glass-bg': 'rgba(26, 8, 8, 0.55)',
      '--glass-border': 'rgba(239, 68, 68, 0.25)',
      '--card-bg': 'rgba(36, 12, 12, 0.6)',
      '--card-border': 'rgba(239, 68, 68, 0.18)',
      '--card-hover': 'rgba(239, 68, 68, 0.15)',
      '--input-bg': 'rgba(20, 5, 5, 0.6)',
      '--button-bg': '#991b1b',
      '--button-hover': '#b91c1c',
      '--tag-bg': 'rgba(153, 27, 27, 0.25)',
      '--tag-border': 'rgba(239, 68, 68, 0.3)',
      '--selection-bg': 'rgba(185, 28, 28, 0.5)',
      '--selection-text': '#fff5f5',
      '--scrollbar-thumb': '#991b1b',
      '--scrollbar-track': '#1a0808',
      '--link-hover': '#fca5a5',
      '--cursor-glow': 'rgba(239, 68, 68, 0.5)',
      '--timeline': '#991b1b',
      '--shadow': 'rgba(0, 0, 0, 0.6)',
      '--gradient-a': 'rgba(26, 8, 8, 0.85)',
      '--gradient-b': 'rgba(42, 18, 18, 0.6)',
      '--blur-amount': '12px',
      '--noise-opacity': '0.08',
      '--hover-scale-glow': '0 0 24px rgba(239, 68, 68, 0.45)',
    },
  },
  {
    id: 'KangoAneitei',
    label: "KANGO AN'EITEI",
    fogHint: '#12091c',
    particleHint: '#d8b4fe',
    pyramidStroke: '#b866ff',
    pyramidGlow: 'rgba(160, 60, 240, 0.45)',
    css: {
      '--bg-deep-charcoal': '#0a0512',
      '--bg-dark-navy': '#12091c',
      '--bg-soft-gray': '#1d122b',
      '--text-main': '#e9d5ff',
      '--text-muted': '#c084fc',
      '--accent-muted-blue': '#6b21a8',
      '--accent-desaturated-cyan': '#581c87',
      '--accent-pale-gray': '#e9d5ff',
      '--accent-soft-white': '#faf5ff',
      '--glow': 'rgba(168, 85, 247, 0.3)',
      '--glow-strong': 'rgba(192, 132, 252, 0.5)',
      '--glass-bg': 'rgba(18, 9, 28, 0.55)',
      '--glass-border': 'rgba(168, 85, 247, 0.25)',
      '--card-bg': 'rgba(27, 14, 40, 0.6)',
      '--card-border': 'rgba(168, 85, 247, 0.18)',
      '--card-hover': 'rgba(168, 85, 247, 0.15)',
      '--input-bg': 'rgba(14, 6, 22, 0.6)',
      '--button-bg': '#6b21a8',
      '--button-hover': '#7e22ce',
      '--tag-bg': 'rgba(107, 33, 168, 0.25)',
      '--tag-border': 'rgba(168, 85, 247, 0.3)',
      '--selection-bg': 'rgba(126, 34, 206, 0.5)',
      '--selection-text': '#faf5ff',
      '--scrollbar-thumb': '#6b21a8',
      '--scrollbar-track': '#12091c',
      '--link-hover': '#e9d5ff',
      '--cursor-glow': 'rgba(168, 85, 247, 0.5)',
      '--timeline': '#6b21a8',
      '--shadow': 'rgba(0, 0, 0, 0.65)',
      '--gradient-a': 'rgba(18, 9, 28, 0.85)',
      '--gradient-b': 'rgba(29, 18, 43, 0.6)',
      '--blur-amount': '12px',
      '--noise-opacity': '0.08',
      '--hover-scale-glow': '0 0 24px rgba(168, 85, 247, 0.45)',
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
  if (!styles) return;
  const root = document.documentElement;
  root.setAttribute('data-domain', id);
  for (const [key, value] of Object.entries(styles)) {
    root.style.setProperty(key, value);
  }
}

