/** Sample windows for recent-form analysis (newest matches first). */
export const WINDOW_SHORT = 5;
export const WINDOW_MID = 10;
export const WINDOW_LONG = 20;

/** Minimum matches required before emitting a confident state. */
export const MIN_MATCHES_FOR_ANALYSIS = 3;
export const MIN_MATCHES_FOR_TREND = 6;

/** Win rate thresholds (0–1). */
export const WIN_RATE_ON_FIRE = 0.65;
export const WIN_RATE_STRONG = 0.55; // used by LOCKED_IN gate
export const WIN_RATE_WEAK = 0.4;
export const WIN_RATE_STRUGGLING = 0.35;

/** Streak thresholds. */
export const WIN_STREAK_ON_FIRE = 3;
export const LOSS_STREAK_CONCERN = 3;
export const LOSS_STREAK_STRUGGLING = 4;

/** Score bands (0–100). */
export const AGGRESSION_VERY_CALM_MAX = 30;
export const AGGRESSION_CALM_MAX = 45;
export const AGGRESSION_BALANCED_MAX = 60;
export const AGGRESSION_AGGRESSIVE_MAX = 75;

export const MOMENTUM_ON_FIRE_MIN = 75;
export const MOMENTUM_STRONG_MIN = 60;
export const MOMENTUM_WEAK_MAX = 40;

export const CONSISTENCY_LOCKED_IN_MIN = 72;
export const CONSISTENCY_STABLE_MIN = 55;

/** Relative change vs baseline considered meaningful (ratio). */
export const TREND_KILL_DELTA_RATIO = 0.15;
export const TREND_DEATH_DELTA_RATIO = 0.12;
export const TREND_WR_DELTA = 0.12;

/** State selection confidence floors. */
export const STATE_CONFIDENCE_MIN = 0.45;

/** Weights for aggression score (must sum to 1). */
export const AGGRESSION_WEIGHTS = {
  killRateVsBaseline: 0.28,
  deathRateVsBaseline: 0.22,
  takedownTempo: 0.2,
  killParticipation: 0.18,
  recentSpike: 0.12,
} as const;

/** Weights for momentum score. */
export const MOMENTUM_WEIGHTS = {
  recentWinRate: 0.35,
  winStreak: 0.25,
  kdaTrend: 0.25,
  killContributionTrend: 0.15,
} as const;

/** Weights for consistency score. */
export const CONSISTENCY_WEIGHTS = {
  kdaVariance: 0.35,
  deathStability: 0.3,
  winRateStability: 0.2,
  performanceSpread: 0.15,
} as const;
