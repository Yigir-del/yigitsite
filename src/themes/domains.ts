export type DomainId = 'Muryokusho';

export type DomainConfig = {
  id: DomainId;
  label: string;
  fogHint: string;
  particleHint: string;
  css: Record<string, string>;
};

export const DOMAINS: DomainConfig[] = [
  {
    id: 'Muryokusho',
    label: 'MURYOKUSHO',
    fogHint: '#0d131f',
    particleHint: '#c8d8f0',
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
];

export const DOMAIN_MAP = Object.fromEntries(DOMAINS.map((d) => [d.id, d])) as Record<
  DomainId,
  DomainConfig
>;

export const DEFAULT_DOMAIN: DomainId = 'Muryokusho';

export function applyDomainCss(id: DomainId) {
  const styles = DOMAIN_MAP[id].css;
  const root = document.documentElement;
  root.setAttribute('data-domain', id);
  for (const [key, value] of Object.entries(styles)) {
    root.style.setProperty(key, value);
  }
}
