export type PlayerStateKind =
  | 'ON_FIRE'
  | 'AGGRESSIVE'
  | 'CALM'
  | 'LOCKED_IN'
  | 'TILTED'
  | 'STRUGGLING';

export type AggressionBand =
  | 'VERY_CALM'
  | 'CALM'
  | 'BALANCED'
  | 'AGGRESSIVE'
  | 'VERY_AGGRESSIVE';

export type PlaystyleTrend =
  | 'MORE_AGGRESSIVE'
  | 'MORE_CONTROLLED'
  | 'STABLE';

export interface MatchWindowMetrics {
  sampleSize: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKills: number;
  avgDeaths: number;
  avgAssists: number;
  avgKda: number;
  avgKillParticipation: number | null;
  avgTakedownsPerMin: number;
  winStreak: number;
  lossStreak: number;
}

export interface PlayerStateAnalysis {
  state: PlayerStateKind;
  secondaryTendency: string | null;
  confidence: number;
  aggressionScore: number;
  aggressionBand: AggressionBand;
  momentumScore: number;
  consistencyScore: number;
  playstyleTrend: PlaystyleTrend;
  trendLabel: string;
  trendDetail: string;
  observation: string;
  reasons: string[];
  analyzedGames: number;
  windows: {
    short: MatchWindowMetrics;
    mid: MatchWindowMetrics;
  };
}

export function stateDisplayMeta(state: PlayerStateKind): {
  emoji: string;
  label: string;
} {
  switch (state) {
    case 'ON_FIRE':
      return { emoji: '🔥', label: 'ON FIRE' };
    case 'AGGRESSIVE':
      return { emoji: '⚔️', label: 'AGGRESSIVE' };
    case 'CALM':
      return { emoji: '🌙', label: 'CALM' };
    case 'LOCKED_IN':
      return { emoji: '🎯', label: 'LOCKED IN' };
    case 'TILTED':
      return { emoji: '🌊', label: 'TILTED' };
    case 'STRUGGLING':
      return { emoji: '⛰️', label: 'STRUGGLING' };
  }
}

export function aggressionBandLabel(band: AggressionBand): string {
  switch (band) {
    case 'VERY_CALM':
      return 'Very Calm';
    case 'CALM':
      return 'Calm';
    case 'BALANCED':
      return 'Balanced';
    case 'AGGRESSIVE':
      return 'Aggressive';
    case 'VERY_AGGRESSIVE':
      return 'Very Aggressive';
  }
}
