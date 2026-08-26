/** Fixed player config — server-side only */
export const PLAYER = {
  gameName: 'Qiyana My Queen',
  tagLine: 'AMIK',
  region: 'TR',
  platform: 'tr1',
  regional: 'europe',
} as const;

export const MATCH_COUNT = 20;
export const MIN_COMPARE_GAMES = 5;

export const CACHE_TTL = {
  dashboard: 5 * 60 * 1000,
  ddragon: 24 * 60 * 60 * 1000,
} as const;

export const TIER_ORDER = [
  'IRON',
  'BRONZE',
  'SILVER',
  'GOLD',
  'PLATINUM',
  'EMERALD',
  'DIAMOND',
  'MASTER',
  'GRANDMASTER',
  'CHALLENGER',
] as const;

export const OPGG_URL =
  'https://op.gg/lol/summoners/tr/Qiyana%20My%20Queen-AMIK';

export function rankEmblemUrl(tier: string): string {
  const slug = tier.toLowerCase();
  return `https://raw.communitydragon.org/latest/plugins/rcp-fe-lol-static-assets/global/default/images/ranked-emblem/emblem-${slug}.png`;
}
