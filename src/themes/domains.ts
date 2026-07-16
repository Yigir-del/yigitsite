export type DomainId =
  | 'Muryokusho'
  | 'FukumaMizushi'
  | 'KangoAneitei'
  | 'GaikanTecchisen'
  | 'ShinganSoai';

export type DomainConfig = {
  id: DomainId;
  label: string;
  css: Record<string, string>;
  fogHint: string;
  particleHint: string;
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
    },
  },
  {
    id: 'FukumaMizushi',
    label: 'FUKUMA MIZUSHI',
    fogHint: '#1a0505',
    particleHint: '#ff4422',
    css: {
      '--bg-deep-charcoal': '#0d0000',
      '--bg-dark-navy': '#1a0505',
      '--bg-soft-gray': '#2b1010',
      '--text-main': '#ffcccc',
      '--text-muted': '#a36666',
      '--accent-muted-blue': '#990000',
      '--accent-desaturated-cyan': '#660000',
      '--accent-pale-gray': '#ff9999',
      '--accent-soft-white': '#ff3333',
    },
  },
  {
    id: 'KangoAneitei',
    label: "KANGO AN'EITEI",
    fogHint: '#000000',
    particleHint: '#888888',
    css: {
      '--bg-deep-charcoal': '#050505',
      '--bg-dark-navy': '#000000',
      '--bg-soft-gray': '#111111',
      '--text-main': '#cccccc',
      '--text-muted': '#666666',
      '--accent-muted-blue': '#333333',
      '--accent-desaturated-cyan': '#1a1a1a',
      '--accent-pale-gray': '#999999',
      '--accent-soft-white': '#ffffff',
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
      '--accent-pale-gray': '#b3d9ff',
      '--accent-soft-white': '#ffffff',
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
  for (const [key, value] of Object.entries(styles)) {
    document.documentElement.style.setProperty(key, value);
  }
}
