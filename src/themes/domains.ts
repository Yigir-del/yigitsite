export type DomainId = 'Muryokusho' | 'GaikanTecchisen' | 'ShinganSoai';

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
    fogHint: '#0c0a18',
    particleHint: '#a78bfa',
    css: {
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
    },
  },
  {
    id: 'GaikanTecchisen',
    label: 'GAIKAN TECCHISEN',
    fogHint: '#2a0a00',
    particleHint: '#ff8800',
    css: {
      '--bg-deep-charcoal': '#1a0a00',
      '--bg-dark-navy': '#331400',
      '--bg-soft-gray': '#4d1f00',
      '--text-main': '#ffcc99',
      '--text-muted': '#cc8855',
      '--accent-muted-blue': '#ff5500',
      '--accent-desaturated-cyan': '#cc4400',
      '--accent-pale-gray': '#ffaa66',
      '--accent-soft-white': '#ffffcc',
      '--glow': 'rgba(255, 100, 20, 0.4)',
      '--glow-strong': 'rgba(255, 140, 40, 0.6)',
      '--glass-bg': 'rgba(40, 12, 0, 0.55)',
      '--glass-border': 'rgba(255, 100, 30, 0.28)',
      '--card-bg': 'rgba(35, 10, 0, 0.65)',
      '--card-border': 'rgba(255, 80, 0, 0.22)',
      '--card-hover': 'rgba(255, 100, 20, 0.14)',
      '--input-bg': 'rgba(25, 8, 0, 0.55)',
      '--button-bg': '#cc4400',
      '--button-hover': '#ff5500',
      '--tag-bg': 'rgba(255, 100, 20, 0.12)',
      '--tag-border': 'rgba(255, 140, 40, 0.3)',
      '--selection-bg': 'rgba(204, 68, 0, 0.5)',
      '--selection-text': '#fff5e6',
      '--scrollbar-thumb': '#cc4400',
      '--scrollbar-track': '#331400',
      '--link-hover': '#ffaa66',
      '--cursor-glow': 'rgba(255, 120, 30, 0.55)',
      '--timeline': '#ff5500',
      '--shadow': 'rgba(80, 20, 0, 0.5)',
      '--gradient-a': 'rgba(180, 50, 0, 0.45)',
      '--gradient-b': 'rgba(60, 15, 0, 0.4)',
      '--blur-amount': '10px',
      '--noise-opacity': '0.1',
      '--hover-scale-glow': '0 0 30px rgba(255, 100, 20, 0.5)',
    },
  },
  {
    id: 'ShinganSoai',
    label: 'SHINGAN SOAI',
    fogHint: '#d0e0f0',
    particleHint: '#ffffff',
    css: {
      '--bg-deep-charcoal': '#e8eef5',
      '--bg-dark-navy': '#d5e2f0',
      '--bg-soft-gray': '#c8d8e8',
      '--text-main': '#1a334d',
      '--text-muted': '#4d6680',
      '--accent-muted-blue': '#6a9fd4',
      '--accent-desaturated-cyan': '#66a3e0',
      '--accent-pale-gray': '#3a5a7a',
      '--accent-soft-white': '#ffffff',
      '--glow': 'rgba(120, 180, 255, 0.35)',
      '--glow-strong': 'rgba(160, 210, 255, 0.55)',
      '--glass-bg': 'rgba(255, 255, 255, 0.45)',
      '--glass-border': 'rgba(100, 150, 200, 0.35)',
      '--card-bg': 'rgba(255, 255, 255, 0.55)',
      '--card-border': 'rgba(120, 170, 220, 0.3)',
      '--card-hover': 'rgba(180, 210, 240, 0.45)',
      '--input-bg': 'rgba(255, 255, 255, 0.65)',
      '--button-bg': '#6a9fd4',
      '--button-hover': '#4a88c4',
      '--tag-bg': 'rgba(120, 180, 255, 0.15)',
      '--tag-border': 'rgba(100, 160, 220, 0.35)',
      '--selection-bg': 'rgba(106, 159, 212, 0.45)',
      '--selection-text': '#0a1a2a',
      '--scrollbar-thumb': '#6a9fd4',
      '--scrollbar-track': '#d5e2f0',
      '--link-hover': '#2a5a8a',
      '--cursor-glow': 'rgba(120, 180, 255, 0.45)',
      '--timeline': '#6a9fd4',
      '--shadow': 'rgba(80, 120, 160, 0.25)',
      '--gradient-a': 'rgba(180, 210, 240, 0.55)',
      '--gradient-b': 'rgba(220, 235, 250, 0.45)',
      '--blur-amount': '16px',
      '--noise-opacity': '0.04',
      '--hover-scale-glow': '0 0 28px rgba(120, 180, 255, 0.4)',
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
