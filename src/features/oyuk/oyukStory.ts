export type OyukWritingKind = 'whisper' | 'engraving' | 'trace';

export type OyukChamber = 'entrance' | 'central' | 'recess' | 'lower' | 'secluded';

export interface OyukInscription {
  id: string;
  text: string;
  kind: OyukWritingKind;
  chamber: OyukChamber;
  /** Horizontal position in % of cave wall width (kept within [8, 86] so text never clips) */
  x: number;
  /** Vertical position in % of total cave wall height (kept within [8, 92]) */
  y: number;
  /** Subtle rotation in degrees */
  rotate: number;
  /** Weathering / opacity weight when illuminated */
  weathered?: boolean;
}

/**
 * Curated cave inscriptions (§13.1 & §13.2).
 * Separated from rendering logic and arranged across five subterranean chambers:
 * - entrance (top 8%–24%)
 * - central (26%–48%)
 * - recess (right/left side alcoves 34%–66%)
 * - lower (52%–76%)
 * - secluded (78%–92%)
 */
export const OYUK_INSCRIPTIONS: readonly OyukInscription[] = [
  // ── Chamber 1: Entrance Wall (Giriş Duvarı) ──
  {
    id: 'w-1',
    text: 'buraya kadar geldiysen, biraz oyalan.',
    kind: 'whisper',
    chamber: 'entrance',
    x: 18,
    y: 11,
    rotate: -1.5,
  },
  {
    id: 't-1',
    text: 'iz',
    kind: 'trace',
    chamber: 'entrance',
    x: 74,
    y: 9,
    rotate: 4,
    weathered: true,
  },
  {
    id: 'e-1',
    text: 'dilenci buradan geçti.',
    kind: 'engraving',
    chamber: 'entrance',
    x: 56,
    y: 17,
    rotate: 1.2,
  },
  {
    id: 't-2',
    text: 'bak',
    kind: 'trace',
    chamber: 'entrance',
    x: 12,
    y: 22,
    rotate: -3.5,
    weathered: true,
  },
  {
    id: 'w-2',
    text: 'ışığı nereye tutacağını sen seçiyorsun.',
    kind: 'whisper',
    chamber: 'entrance',
    x: 36,
    y: 24,
    rotate: -0.8,
  },

  // ── Chamber 2: Central Chamber (Orta Kubbe) ──
  {
    id: 'w-3',
    text: 'her şey görünmek için yapılmadı.',
    kind: 'whisper',
    chamber: 'central',
    x: 15,
    y: 33,
    rotate: -2,
  },
  {
    id: 'e-2',
    text: 'bilge burada da fazla konuştu.',
    kind: 'engraving',
    chamber: 'central',
    x: 62,
    y: 31,
    rotate: 2.2,
  },
  {
    id: 't-3',
    text: '?',
    kind: 'trace',
    chamber: 'central',
    x: 46,
    y: 37,
    rotate: -6,
    weathered: true,
  },
  {
    id: 'e-3',
    text: 'bu duvar seni senden önce gördü.',
    kind: 'engraving',
    chamber: 'central',
    x: 26,
    y: 43,
    rotate: 0.9,
  },
  {
    id: 't-4',
    text: 'sessiz',
    kind: 'trace',
    chamber: 'central',
    x: 80,
    y: 41,
    rotate: -2.5,
    weathered: true,
  },
  {
    id: 'w-4',
    text: 'her karanlık boş değildir.',
    kind: 'whisper',
    chamber: 'central',
    x: 52,
    y: 48,
    rotate: -1.4,
  },

  // ── Chamber 3: Narrow Side Recess (Yan Oyuk) ──
  {
    id: 't-5',
    text: 'buradaydım.',
    kind: 'trace',
    chamber: 'recess',
    x: 10,
    y: 53,
    rotate: 3.2,
    weathered: true,
  },
  {
    id: 'w-5',
    text: 'bazı izler saklanmak ister.',
    kind: 'whisper',
    chamber: 'recess',
    x: 66,
    y: 56,
    rotate: -2.1,
  },
  {
    id: 'e-4',
    text: 'ikisine de inanma.',
    kind: 'engraving',
    chamber: 'recess',
    x: 34,
    y: 59,
    rotate: -1.1,
  },

  // ── Chamber 4: Lower Inscriptions (Alt Yazıtlar) ──
  {
    id: 'e-5',
    text: 'taşlar bazı sırları daha iyi saklar.',
    kind: 'engraving',
    chamber: 'lower',
    x: 16,
    y: 66,
    rotate: 1.6,
  },
  {
    id: 't-6',
    text: 'hatırla',
    kind: 'trace',
    chamber: 'lower',
    x: 78,
    y: 65,
    rotate: -4,
    weathered: true,
  },
  {
    id: 'w-6',
    text: 'bazı şeyler ancak arayınca bulunur.',
    kind: 'whisper',
    chamber: 'lower',
    x: 44,
    y: 71,
    rotate: -0.7,
  },
  {
    id: 'e-6',
    text: 'hiçlik de bir oda olabilir.',
    kind: 'engraving',
    chamber: 'lower',
    x: 22,
    y: 76,
    rotate: -1.8,
  },
  {
    id: 't-7',
    text: 'hiçlik',
    kind: 'trace',
    chamber: 'lower',
    x: 68,
    y: 75,
    rotate: 2.8,
    weathered: true,
  },

  // ── Chamber 5: Secluded Final Inscription (Dip Köşe) ──
  {
    id: 'w-7',
    text: 'saklanan her şey kaybolmuş değildir.',
    kind: 'whisper',
    chamber: 'secluded',
    x: 18,
    y: 84,
    rotate: -1.2,
  },
  {
    id: 't-8',
    text: 'gördün mü?',
    kind: 'trace',
    chamber: 'secluded',
    x: 50,
    y: 83,
    rotate: 3.5,
    weathered: true,
  },
  {
    id: 'e-7',
    text: 'giriş yok. çıkış belirsiz.',
    kind: 'engraving',
    chamber: 'secluded',
    x: 28,
    y: 91,
    rotate: 0.6,
  },
] as const;

/** Optional secondary deeper discovery (§13.3) */
export const OYUK_DEEPER_SECRET = {
  x: 72,
  y: 89,
  symbolLabel: 'Kazınmış taş mührü incele',
  revealedText: 'beşinci sadaka kapıyı açtı; altıncısı kimin için?',
} as const;
