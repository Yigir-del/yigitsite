export type DomainId = 'Muryokusho' | 'FukumaMizushi' | 'KangoAneitei';

export type DomainConfig = {
  id: DomainId;
  label: string;
  fogHint: string;
  particleHint: string;
  css: Record<string, string>;
};

const baseTokens = (t: Record<string, string>) => t;

export const DOMAINS: DomainConfig[] = [
  {
    id: 'Muryokusho',
    label: 'MURYOKUSHO',
    fogHint: '#0c0a18',
    particleHint: '#a78bfa',
    css: baseTokens({
      '--bg-deep-charcoal': '#08061a',
      '--bg-dark-navy': '#0c0a1e',
      '--bg-soft-gray': '#1a1630',
      '--text-main': '#e8e4f5',
      '--text-muted': '#9b93b8',
      '--accent-muted-blue': '#6b5b9a',
      '--accent-desaturated-cyan': '#4a3d72',
      '--accent-pale-gray': '#c4b8e0',
      '--accent-soft-white': '#f3efff',
      '--glow': 'rgba(139, 92, 246, 0.35)',
      '--glow-strong': 'rgba(167, 139, 250, 0.55)',
      '--glass-bg': 'rgba(20, 16, 40, 0.45)',
      '--glass-border': 'rgba(167, 139, 250, 0.18)',
      '--card-bg': 'rgba(18, 14, 36, 0.55)',
      '--card-border': 'rgba(139, 92, 246, 0.12)',
      '--card-hover': 'rgba(139, 92, 246, 0.1)',
      '--input-bg': 'rgba(10, 8, 28, 0.5)',
      '--button-bg': '#5b4a8a',
      '--button-hover': '#7c6aad',
      '--tag-bg': 'rgba(139, 92, 246, 0.1)',
      '--tag-border': 'rgba(167, 139, 250, 0.22)',
      '--selection-bg': 'rgba(139, 92, 246, 0.45)',
      '--selection-text': '#f3efff',
      '--scrollbar-thumb': '#5b4a8a',
      '--scrollbar-track': '#0c0a1e',
      '--link-hover': '#c4b8e0',
      '--cursor-glow': 'rgba(167, 139, 250, 0.5)',
      '--timeline': '#6b5b9a',
      '--shadow': 'rgba(40, 20, 80, 0.45)',
      '--gradient-a': 'rgba(60, 30, 120, 0.45)',
      '--gradient-b': 'rgba(20, 40, 90, 0.35)',
      '--blur-amount': '14px',
      '--noise-opacity': '0.08',
      '--hover-scale-glow': '0 0 28px rgba(167, 139, 250, 0.45)',
    }),
  },
  {
    id: 'FukumaMizushi',
    label: 'FUKUMA MIZUSHI',
    fogHint: '#1a0505',
    particleHint: '#ff3333',
    css: baseTokens({
      '--bg-deep-charcoal': '#0a0000',
      '--bg-dark-navy': '#140202',
      '--bg-soft-gray': '#2a0a0a',
      '--text-main': '#ffd6d6',
      '--text-muted': '#b36b6b',
      '--accent-muted-blue': '#b00000',
      '--accent-desaturated-cyan': '#700000',
      '--accent-pale-gray': '#ff9a9a',
      '--accent-soft-white': '#ff4444',
      '--glow': 'rgba(255, 30, 30, 0.4)',
      '--glow-strong': 'rgba(255, 60, 40, 0.65)',
      '--glass-bg': 'rgba(30, 4, 4, 0.55)',
      '--glass-border': 'rgba(255, 50, 50, 0.28)',
      '--card-bg': 'rgba(25, 2, 2, 0.65)',
      '--card-border': 'rgba(180, 0, 0, 0.25)',
      '--card-hover': 'rgba(255, 40, 40, 0.14)',
      '--input-bg': 'rgba(20, 0, 0, 0.55)',
      '--button-bg': '#990000',
      '--button-hover': '#cc1111',
      '--tag-bg': 'rgba(255, 40, 40, 0.12)',
      '--tag-border': 'rgba(255, 80, 80, 0.3)',
      '--selection-bg': 'rgba(180, 0, 0, 0.55)',
      '--selection-text': '#ffeaea',
      '--scrollbar-thumb': '#990000',
      '--scrollbar-track': '#140202',
      '--link-hover': '#ff7777',
      '--cursor-glow': 'rgba(255, 40, 40, 0.55)',
      '--timeline': '#cc0000',
      '--shadow': 'rgba(80, 0, 0, 0.55)',
      '--gradient-a': 'rgba(120, 0, 0, 0.5)',
      '--gradient-b': 'rgba(40, 0, 0, 0.4)',
      '--blur-amount': '10px',
      '--noise-opacity': '0.12',
      '--hover-scale-glow': '0 0 30px rgba(255, 40, 40, 0.55)',
    }),
  },
  {
    id: 'KangoAneitei',
    label: "KANGO AN'EITEI",
    fogHint: '#050308',
    particleHint: '#6b4a8a',
    css: baseTokens({
      '--bg-deep-charcoal': '#030205',
      '--bg-dark-navy': '#07050c',
      '--bg-soft-gray': '#14101c',
      '--text-main': '#d4cce0',
      '--text-muted': '#6e6480',
      '--accent-muted-blue': '#4a3560',
      '--accent-desaturated-cyan': '#2e2040',
      '--accent-pale-gray': '#9a8bb0',
      '--accent-soft-white': '#e8e0f0',
      '--glow': 'rgba(80, 50, 120, 0.3)',
      '--glow-strong': 'rgba(100, 60, 140, 0.45)',
      '--glass-bg': 'rgba(12, 8, 20, 0.6)',
      '--glass-border': 'rgba(90, 60, 130, 0.2)',
      '--card-bg': 'rgba(10, 6, 16, 0.7)',
      '--card-border': 'rgba(70, 45, 100, 0.2)',
      '--card-hover': 'rgba(80, 50, 120, 0.12)',
      '--input-bg': 'rgba(8, 5, 14, 0.6)',
      '--button-bg': '#3a2850',
      '--button-hover': '#523870',
      '--tag-bg': 'rgba(70, 45, 100, 0.15)',
      '--tag-border': 'rgba(100, 70, 140, 0.25)',
      '--selection-bg': 'rgba(70, 45, 110, 0.5)',
      '--selection-text': '#e8e0f0',
      '--scrollbar-thumb': '#3a2850',
      '--scrollbar-track': '#07050c',
      '--link-hover': '#b0a0c8',
      '--cursor-glow': 'rgba(100, 70, 140, 0.4)',
      '--timeline': '#4a3560',
      '--shadow': 'rgba(20, 10, 40, 0.6)',
      '--gradient-a': 'rgba(40, 20, 70, 0.4)',
      '--gradient-b': 'rgba(10, 5, 20, 0.5)',
      '--blur-amount': '16px',
      '--noise-opacity': '0.14',
      '--hover-scale-glow': '0 0 22px rgba(100, 70, 140, 0.35)',
    }),
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
