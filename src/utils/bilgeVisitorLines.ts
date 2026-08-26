import type { PlayerStateKind } from '../types/league';

/** Ziyaretçilere yönelik kısa, troll uyarılar — state'e göre. */
const LINES: Record<PlayerStateKind, readonly string[]> = {
  ON_FIRE: [
    'Formda ama egosu tavan. Arama, duo iste.',
    'Kazanıyor, kafa buharı çıkıyor. Uzak dur.',
    'Bugün dokunma. Herkesi carry sanıyor.',
  ],
  AGGRESSIVE: [
    'Savaş arıyor. Sen arama, o bulur seni.',
    'Agresif modda. Ping atma, kaçarsın.',
    'Risk sever. Sen risk etme, uzak dur.',
  ],
  CALM: [
    'Sakin görünüyor. Yine de rahatsız etme.',
    'Kontrollü oynuyor. Boş boş yazma.',
    'Sessiz mod. Mesaj atma.',
  ],
  LOCKED_IN: [
    'Odaklanmış. Duo teklif etme.',
    'Kilitlenmiş modda. Bu adamı arama.',
    'Ciddi oynuyor. Distraction sevmez.',
  ],
  TILTED: [
    'Şu an sinirlidir. Uzak dur.',
    'Mağlubiyet serisi var. Arama.',
    'Tilt modunda. Dokunursan patlar.',
  ],
  STRUGGLING: [
    'Kötü gününde. Bu adamı arama.',
    'Son maçlar kötü. Moralini bozma, uzak dur.',
    'Zorlanıyor. Şimdi yazma.',
  ],
};

const FALLBACK = [
  'Bu profili okuyorsan zaten cesursun.',
  'Sahibi bilinmez. Uzak dur.',
] as const;

export function pickBilgeVisitorLine(state: PlayerStateKind): string {
  const pool = LINES[state];
  const idx = Math.floor(Date.now() / 86_400_000) % pool.length;
  return pool[idx] ?? pool[0];
}

export function pickRandomBilgeVisitorLine(state: PlayerStateKind): string {
  const pool = LINES[state];
  return pool[Math.floor(Math.random() * pool.length)] ?? pool[0];
}

export function pickBilgeFallbackLine(): string {
  const idx = Math.floor(Date.now() / 86_400_000) % FALLBACK.length;
  return FALLBACK[idx];
}
