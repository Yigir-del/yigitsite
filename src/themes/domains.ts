export type DomainId =
  | 'Muryokusho'
  | 'FukumaMizushi'
  | 'KangoAneitei'
  | 'GaikanTecchisen'
  | 'ShinganSoai'
  | 'Jiheientonka'
  | 'YukaiSukanda'
  | 'KanshiBakuchi'
  | 'TaizoHenya'
  | 'JihenSatsuryu';

export type SpawnBias = 'center' | 'topLeft' | 'bottom' | 'edges' | 'scatter' | 'rise';

export type DomainConfig = {
  id: DomainId;
  /** Romaji display name */
  label: string;
  css: Record<string, string>;
  webglBg: string;
  fog: { color: string; near: number; far: number };
  ambient: { color: string; intensity: number };
  lights: { color: string; intensity: number; position: [number, number, number] }[];
  particle: {
    count: number;
    color: string;
    size: number;
    speed: number;
  };
  symbol: {
    count: number;
    color: string;
    scale: number;
    shape: 'octa' | 'tetra' | 'box' | 'sphere' | 'ring';
  };
  spawn: SpawnBias;
  camera: { breath: number; parallax: number };
  energy: number;
};

export const DOMAINS: DomainConfig[] = [
  {
    id: 'Muryokusho',
    label: 'MURYOKUSHO',
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
    webglBg: '#0d131f',
    fog: { color: '#0d131f', near: 6, far: 22 },
    ambient: { color: '#6a7a9a', intensity: 0.45 },
    lights: [{ color: '#a8c4e8', intensity: 0.7, position: [-4, 3, 2] }],
    particle: { count: 90, color: '#c8d8f0', size: 0.018, speed: 0.08 },
    symbol: { count: 4, color: '#9eb6d4', scale: 0.22, shape: 'ring' },
    spawn: 'scatter',
    camera: { breath: 0.035, parallax: 0.04 },
    energy: 0.35,
  },
  {
    id: 'FukumaMizushi',
    label: 'FUKUMA MIZUSHI',
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
    webglBg: '#0a0000',
    fog: { color: '#1a0505', near: 4, far: 16 },
    ambient: { color: '#4a1010', intensity: 0.35 },
    lights: [{ color: '#ff2200', intensity: 1.1, position: [0, 2, 1] }],
    particle: { count: 70, color: '#ff4422', size: 0.02, speed: 0.12 },
    symbol: { count: 4, color: '#cc2200', scale: 0.28, shape: 'box' },
    spawn: 'bottom',
    camera: { breath: 0.02, parallax: 0.03 },
    energy: 0.7,
  },
  {
    id: 'KangoAneitei',
    label: "KANGO AN'EITEI",
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
    webglBg: '#000000',
    fog: { color: '#000000', near: 3, far: 14 },
    ambient: { color: '#222222', intensity: 0.3 },
    lights: [{ color: '#888888', intensity: 0.5, position: [-2, 1, 3] }],
    particle: { count: 60, color: '#666666', size: 0.025, speed: 0.06 },
    symbol: { count: 5, color: '#444444', scale: 0.3, shape: 'octa' },
    spawn: 'edges',
    camera: { breath: 0.05, parallax: 0.06 },
    energy: 0.45,
  },
  {
    id: 'GaikanTecchisen',
    label: 'KANGO TEPPOZAN',
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
    webglBg: '#1a0800',
    fog: { color: '#2a1000', near: 5, far: 18 },
    ambient: { color: '#442200', intensity: 0.4 },
    lights: [{ color: '#ff6600', intensity: 1.4, position: [0, -1, 2] }],
    particle: { count: 75, color: '#ff8800', size: 0.022, speed: 0.15 },
    symbol: { count: 4, color: '#ff4400', scale: 0.25, shape: 'tetra' },
    spawn: 'rise',
    camera: { breath: 0.04, parallax: 0.035 },
    energy: 0.85,
  },
  {
    id: 'ShinganSoai',
    label: 'SHINGAN SOAI',
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
    webglBg: '#d8e6f4',
    fog: { color: '#d8e6f4', near: 8, far: 24 },
    ambient: { color: '#ffffff', intensity: 0.7 },
    lights: [{ color: '#a8d0ff', intensity: 0.9, position: [3, 4, 2] }],
    particle: { count: 80, color: '#ffffff', size: 0.016, speed: 0.05 },
    symbol: { count: 5, color: '#88bbff', scale: 0.2, shape: 'octa' },
    spawn: 'scatter',
    camera: { breath: 0.03, parallax: 0.045 },
    energy: 0.4,
  },
  {
    id: 'Jiheientonka',
    label: 'JIHEIENTONKA',
    css: {
      '--bg-deep-charcoal': '#120818',
      '--bg-dark-navy': '#1a0f22',
      '--bg-soft-gray': '#2a1835',
      '--text-main': '#e8d4f0',
      '--text-muted': '#9a7aaa',
      '--accent-muted-blue': '#8b4b9b',
      '--accent-desaturated-cyan': '#6b3a7b',
      '--accent-pale-gray': '#d4b8e0',
      '--accent-soft-white': '#f5e8ff',
    },
    webglBg: '#100816',
    fog: { color: '#180a20', near: 4, far: 15 },
    ambient: { color: '#3a2040', intensity: 0.4 },
    lights: [{ color: '#cc66ff', intensity: 0.85, position: [2, 2, 1] }],
    particle: { count: 65, color: '#dd88ff', size: 0.02, speed: 0.1 },
    symbol: { count: 4, color: '#aa55cc', scale: 0.26, shape: 'sphere' },
    spawn: 'center',
    camera: { breath: 0.045, parallax: 0.05 },
    energy: 0.6,
  },
  {
    id: 'YukaiSukanda',
    label: 'YUKAI SUKANDA',
    css: {
      '--bg-deep-charcoal': '#021018',
      '--bg-dark-navy': '#041820',
      '--bg-soft-gray': '#0a2830',
      '--text-main': '#c8e8f0',
      '--text-muted': '#5a8a98',
      '--accent-muted-blue': '#2a8898',
      '--accent-desaturated-cyan': '#1a6878',
      '--accent-pale-gray': '#a0d0d8',
      '--accent-soft-white': '#e0f8ff',
    },
    webglBg: '#021018',
    fog: { color: '#041820', near: 5, far: 20 },
    ambient: { color: '#104050', intensity: 0.4 },
    lights: [{ color: '#40c8e0', intensity: 0.8, position: [0, 3, 2] }],
    particle: { count: 85, color: '#60d0e8', size: 0.017, speed: 0.07 },
    symbol: { count: 4, color: '#38a8c0', scale: 0.24, shape: 'ring' },
    spawn: 'topLeft',
    camera: { breath: 0.04, parallax: 0.05 },
    energy: 0.5,
  },
  {
    id: 'KanshiBakuchi',
    label: 'KANSHI BAKUCHI',
    css: {
      '--bg-deep-charcoal': '#0c0a14',
      '--bg-dark-navy': '#12101c',
      '--bg-soft-gray': '#221e30',
      '--text-main': '#f0e8c8',
      '--text-muted': '#988870',
      '--accent-muted-blue': '#c8a040',
      '--accent-desaturated-cyan': '#8a6820',
      '--accent-pale-gray': '#e0d0a0',
      '--accent-soft-white': '#fff8e0',
    },
    webglBg: '#0c0a14',
    fog: { color: '#12101c', near: 5, far: 17 },
    ambient: { color: '#2a2438', intensity: 0.4 },
    lights: [{ color: '#ffcc44', intensity: 0.9, position: [1, 2, 2] }],
    particle: { count: 55, color: '#ffdd66', size: 0.019, speed: 0.09 },
    symbol: { count: 4, color: '#ddaa33', scale: 0.23, shape: 'box' },
    spawn: 'scatter',
    camera: { breath: 0.025, parallax: 0.04 },
    energy: 0.55,
  },
  {
    id: 'TaizoHenya',
    label: 'TAIZO HENYA',
    css: {
      '--bg-deep-charcoal': '#0a1008',
      '--bg-dark-navy': '#101808',
      '--bg-soft-gray': '#1a2810',
      '--text-main': '#d8e8c8',
      '--text-muted': '#789068',
      '--accent-muted-blue': '#68a040',
      '--accent-desaturated-cyan': '#487028',
      '--accent-pale-gray': '#b8d098',
      '--accent-soft-white': '#e8f8d0',
    },
    webglBg: '#0a1008',
    fog: { color: '#101808', near: 4, far: 16 },
    ambient: { color: '#1a2810', intensity: 0.35 },
    lights: [{ color: '#88cc44', intensity: 0.75, position: [-2, 2, 1] }],
    particle: { count: 70, color: '#88bb55', size: 0.021, speed: 0.08 },
    symbol: { count: 5, color: '#66aa33', scale: 0.27, shape: 'tetra' },
    spawn: 'edges',
    camera: { breath: 0.038, parallax: 0.04 },
    energy: 0.65,
  },
  {
    id: 'JihenSatsuryu',
    label: 'JIHEN SATSURYU',
    css: {
      '--bg-deep-charcoal': '#0e0e12',
      '--bg-dark-navy': '#14141a',
      '--bg-soft-gray': '#24242e',
      '--text-main': '#e0e0e8',
      '--text-muted': '#787890',
      '--accent-muted-blue': '#5a5a8a',
      '--accent-desaturated-cyan': '#3a3a6a',
      '--accent-pale-gray': '#b0b0c8',
      '--accent-soft-white': '#f0f0f8',
    },
    webglBg: '#0e0e12',
    fog: { color: '#14141a', near: 5, far: 18 },
    ambient: { color: '#282830', intensity: 0.4 },
    lights: [{ color: '#8890c0', intensity: 0.7, position: [0, 4, 1] }],
    particle: { count: 50, color: '#a0a8d0', size: 0.015, speed: 0.04 },
    symbol: { count: 4, color: '#7078a8', scale: 0.21, shape: 'sphere' },
    spawn: 'topLeft',
    camera: { breath: 0.02, parallax: 0.03 },
    energy: 0.3,
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
