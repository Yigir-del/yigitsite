import type { LeagueMatch } from './types.js';
import {
  AGGRESSION_AGGRESSIVE_MAX,
  AGGRESSION_BALANCED_MAX,
  AGGRESSION_CALM_MAX,
  AGGRESSION_VERY_CALM_MAX,
  AGGRESSION_WEIGHTS,
  CONSISTENCY_LOCKED_IN_MIN,
  CONSISTENCY_STABLE_MIN,
  CONSISTENCY_WEIGHTS,
  LOSS_STREAK_CONCERN,
  LOSS_STREAK_STRUGGLING,
  MIN_MATCHES_FOR_ANALYSIS,
  MIN_MATCHES_FOR_TREND,
  MOMENTUM_ON_FIRE_MIN,
  MOMENTUM_STRONG_MIN,
  MOMENTUM_WEAK_MAX,
  MOMENTUM_WEIGHTS,
  STATE_CONFIDENCE_MIN,
  TREND_DEATH_DELTA_RATIO,
  TREND_KILL_DELTA_RATIO,
  TREND_WR_DELTA,
  WIN_RATE_ON_FIRE,
  WIN_RATE_STRONG,
  WIN_RATE_STRUGGLING,
  WIN_STREAK_ON_FIRE,
  WINDOW_MID,
  WINDOW_SHORT,
} from './playerStateConstants.js';

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

function kdaRatio(k: number, d: number, a: number): number {
  if (d === 0) return k + a;
  return (k + a) / d;
}

function clamp(n: number, min = 0, max = 100): number {
  return Math.min(max, Math.max(min, n));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function computeStreaks(matches: LeagueMatch[]): {
  winStreak: number;
  lossStreak: number;
} {
  let winStreak = 0;
  let lossStreak = 0;

  for (const m of matches) {
    if (m.win) {
      if (lossStreak > 0) break;
      winStreak += 1;
    } else {
      if (winStreak > 0) break;
      lossStreak += 1;
    }
  }

  return { winStreak, lossStreak };
}

function windowMetrics(matches: LeagueMatch[]): MatchWindowMetrics {
  if (matches.length === 0) {
    return {
      sampleSize: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgKills: 0,
      avgDeaths: 0,
      avgAssists: 0,
      avgKda: 0,
      avgKillParticipation: null,
      avgTakedownsPerMin: 0,
      winStreak: 0,
      lossStreak: 0,
    };
  }

  const wins = matches.filter((m) => m.win).length;
  const kills = matches.reduce((s, m) => s + m.kills, 0);
  const deaths = matches.reduce((s, m) => s + m.deaths, 0);
  const assists = matches.reduce((s, m) => s + m.assists, 0);
  const kpValues = matches
    .map((m) => m.killParticipation)
    .filter((v): v is number => v != null);
  const takedownsPerMin = matches.reduce((s, m) => {
    const min = Math.max(m.durationSeconds / 60, 1);
    return s + (m.kills + m.assists) / min;
  }, 0);

  const { winStreak, lossStreak } = computeStreaks(matches);

  return {
    sampleSize: matches.length,
    wins,
    losses: matches.length - wins,
    winRate: wins / matches.length,
    avgKills: round1(kills / matches.length),
    avgDeaths: round1(deaths / matches.length),
    avgAssists: round1(assists / matches.length),
    avgKda: round2(kdaRatio(kills, deaths, assists)),
    avgKillParticipation:
      kpValues.length > 0
        ? round2(kpValues.reduce((a, b) => a + b, 0) / kpValues.length)
        : null,
    avgTakedownsPerMin: round1(takedownsPerMin / matches.length),
    winStreak,
    lossStreak,
  };
}

function variance(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return (
    values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
  );
}

function ratioDelta(recent: number, baseline: number): number {
  if (baseline <= 0) return recent > 0 ? 1 : 0;
  return (recent - baseline) / baseline;
}

function aggressionBand(score: number): AggressionBand {
  if (score <= AGGRESSION_VERY_CALM_MAX) return 'VERY_CALM';
  if (score <= AGGRESSION_CALM_MAX) return 'CALM';
  if (score <= AGGRESSION_BALANCED_MAX) return 'BALANCED';
  if (score <= AGGRESSION_AGGRESSIVE_MAX) return 'AGGRESSIVE';
  return 'VERY_AGGRESSIVE';
}

function aggressionBandLabel(band: AggressionBand): string {
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

function computeAggressionScore(
  recent: MatchWindowMetrics,
  baseline: MatchWindowMetrics,
): number {
  const killDelta = ratioDelta(recent.avgKills, baseline.avgKills);
  const deathDelta = ratioDelta(recent.avgDeaths, baseline.avgDeaths);
  const takedownDelta = ratioDelta(
    recent.avgTakedownsPerMin,
    baseline.avgTakedownsPerMin,
  );

  const killNorm = clamp(50 + killDelta * 100);
  const deathNorm = clamp(50 + deathDelta * 85);
  const takedownNorm = clamp(50 + takedownDelta * 90);

  const kpRecent = recent.avgKillParticipation ?? 0.5;
  const kpBaseline = baseline.avgKillParticipation ?? 0.5;
  const kpNorm = clamp(40 + kpRecent * 60 + ratioDelta(kpRecent, kpBaseline) * 30);

  const spikeNorm = clamp(
    50 +
      (killDelta + deathDelta + takedownDelta) * 35,
  );

  const raw =
    killNorm * AGGRESSION_WEIGHTS.killRateVsBaseline +
    deathNorm * AGGRESSION_WEIGHTS.deathRateVsBaseline +
    takedownNorm * AGGRESSION_WEIGHTS.takedownTempo +
    kpNorm * AGGRESSION_WEIGHTS.killParticipation +
    spikeNorm * AGGRESSION_WEIGHTS.recentSpike;

  return Math.round(clamp(raw));
}

function computeMomentumScore(
  recent: MatchWindowMetrics,
  baseline: MatchWindowMetrics,
): number {
  const wrScore = clamp(recent.winRate * 100);
  const streakScore =
    recent.winStreak >= WIN_STREAK_ON_FIRE
      ? 95
      : recent.lossStreak >= LOSS_STREAK_CONCERN
        ? 25
        : clamp(50 + recent.winStreak * 12 - recent.lossStreak * 14);

  const kdaDelta = ratioDelta(recent.avgKda, Math.max(baseline.avgKda, 0.5));
  const kdaScore = clamp(50 + kdaDelta * 55);

  const kpRecent = recent.avgKillParticipation ?? baseline.avgKillParticipation ?? 0.5;
  const kpBaseline = baseline.avgKillParticipation ?? kpRecent;
  const kpDelta = ratioDelta(kpRecent, kpBaseline);
  const kpScore = clamp(50 + kpDelta * 45);

  const raw =
    wrScore * MOMENTUM_WEIGHTS.recentWinRate +
    streakScore * MOMENTUM_WEIGHTS.winStreak +
    kdaScore * MOMENTUM_WEIGHTS.kdaTrend +
    kpScore * MOMENTUM_WEIGHTS.killContributionTrend;

  return Math.round(clamp(raw));
}

function computeConsistencyScore(matches: LeagueMatch[]): number {
  if (matches.length < 2) return 50;

  const kdas = matches.map((m) =>
    kdaRatio(m.kills, m.deaths, m.assists),
  );
  const deaths = matches.map((m) => m.deaths);
  const wins = matches.map((m) => (m.win ? 1 : 0));

  const kdaVar = variance(kdas);
  const deathVar = variance(deaths);
  const wrVar = variance(wins);

  const kdaScore = clamp(100 - kdaVar * 18);
  const deathScore = clamp(100 - deathVar * 14);
  const wrScore = clamp(100 - wrVar * 120);

  const spreads = matches.map((m) => m.kills + m.assists - m.deaths);
  const spreadScore = clamp(100 - variance(spreads) * 2.5);

  const raw =
    kdaScore * CONSISTENCY_WEIGHTS.kdaVariance +
    deathScore * CONSISTENCY_WEIGHTS.deathStability +
    wrScore * CONSISTENCY_WEIGHTS.winRateStability +
    spreadScore * CONSISTENCY_WEIGHTS.performanceSpread;

  return Math.round(clamp(raw));
}

function computePlaystyleTrend(
  recent: MatchWindowMetrics,
  baseline: MatchWindowMetrics,
): { trend: PlaystyleTrend; label: string; detail: string } {
  const killUp = ratioDelta(recent.avgKills, baseline.avgKills) >= TREND_KILL_DELTA_RATIO;
  const deathUp =
    ratioDelta(recent.avgDeaths, baseline.avgDeaths) >= TREND_DEATH_DELTA_RATIO;
  const wrUp = recent.winRate - baseline.winRate >= TREND_WR_DELTA;
  const deathDown =
    ratioDelta(recent.avgDeaths, baseline.avgDeaths) <= -TREND_DEATH_DELTA_RATIO;

  if (killUp && deathUp) {
    return {
      trend: 'MORE_AGGRESSIVE',
      label: 'More Aggressive Than Usual ↑',
      detail: `Son ${recent.sampleSize} maçta kill ve death ortalamaların önceki maçlarına göre yükselmiş.`,
    };
  }

  if (deathDown && (wrUp || recent.avgKda >= baseline.avgKda)) {
    return {
      trend: 'MORE_CONTROLLED',
      label: 'More Controlled Than Usual ↓',
      detail: `Son maçlarda ölüm sayın azalırken sonuç kaliten ${wrUp ? 'yükselmiş' : 'daha dengeli'}.`,
    };
  }

  if (killUp && !deathUp) {
    return {
      trend: 'MORE_AGGRESSIVE',
      label: 'Higher Kill Tempo ↑',
      detail: `Kill ortalaman baseline'a göre yükselmiş; ölüm tarafı henüz aynı seviyede.`,
    };
  }

  return {
    trend: 'STABLE',
    label: 'Stable Playstyle',
    detail: 'Son maçların genel tempo ve risk profili önceki örnekleme yakın.',
  };
}

interface StateCandidate {
  state: PlayerStateKind;
  score: number;
  reasons: string[];
}

function pickState(
  recent: MatchWindowMetrics,
  baseline: MatchWindowMetrics,
  aggressionScore: number,
  momentumScore: number,
  consistencyScore: number,
): { state: PlayerStateKind; confidence: number; reasons: string[] } {
  const candidates: StateCandidate[] = [];

  if (
    recent.winRate >= WIN_RATE_ON_FIRE &&
    (recent.winStreak >= WIN_STREAK_ON_FIRE || momentumScore >= MOMENTUM_ON_FIRE_MIN)
  ) {
    candidates.push({
      state: 'ON_FIRE',
      score: 0.85 + recent.winStreak * 0.03,
      reasons: [
        `Son ${recent.sampleSize} maçta %${Math.round(recent.winRate * 100)} kazanma oranı`,
        recent.winStreak >= 2
          ? `${recent.winStreak} galibiyetlik aktif seri`
          : `Momentum skoru ${momentumScore}/100`,
      ],
    });
  }

  if (
    consistencyScore >= CONSISTENCY_LOCKED_IN_MIN &&
    recent.winRate >= WIN_RATE_STRONG &&
    recent.avgDeaths <= baseline.avgDeaths + 1
  ) {
    candidates.push({
      state: 'LOCKED_IN',
      score: 0.78 + consistencyScore / 500,
      reasons: [
        `Tutarlılık skoru ${consistencyScore}/100`,
        `KDA ortalaması ${recent.avgKda} ile stabil`,
        `Son ${recent.sampleSize} maçta %${Math.round(recent.winRate * 100)} WR`,
      ],
    });
  }

  if (
    recent.lossStreak >= LOSS_STREAK_STRUGGLING ||
    (recent.winRate <= WIN_RATE_STRUGGLING && recent.sampleSize >= 5)
  ) {
    candidates.push({
      state: 'STRUGGLING',
      score: 0.8 + recent.lossStreak * 0.04,
      reasons: [
        recent.lossStreak >= 2
          ? `${recent.lossStreak} mağlubiyetlik seri`
          : `Son ${recent.sampleSize} maçta düşük WR (%${Math.round(recent.winRate * 100)})`,
        `Ortalama KDA ${recent.avgKda}`,
      ],
    });
  }

  if (
    recent.lossStreak >= LOSS_STREAK_CONCERN &&
    recent.avgDeaths > baseline.avgDeaths * 1.1
  ) {
    candidates.push({
      state: 'TILTED',
      score: 0.72 + recent.lossStreak * 0.05,
      reasons: [
        `${recent.lossStreak} arka arkaya mağlubiyet`,
        `Ölüm ortalaması ${recent.avgDeaths} (baseline ${baseline.avgDeaths})`,
        `Performans dalgalanması artmış görünüyor`,
      ],
    });
  }

  if (aggressionScore >= AGGRESSION_BALANCED_MAX + 1) {
    candidates.push({
      state: 'AGGRESSIVE',
      score: 0.65 + (aggressionScore - 60) / 100,
      reasons: [
        `Agresiflik skoru ${aggressionScore}/100`,
        `Kill/death ortalaması: ${recent.avgKills}/${recent.avgDeaths}`,
        recent.avgKillParticipation != null
          ? `KP ortalaması %${Math.round(recent.avgKillParticipation * 100)}`
          : 'Yüksek takedown temposu',
      ],
    });
  }

  if (
    aggressionScore <= AGGRESSION_CALM_MAX &&
    recent.avgDeaths <= baseline.avgDeaths &&
    momentumScore >= MOMENTUM_WEAK_MAX
  ) {
    candidates.push({
      state: 'CALM',
      score: 0.68 + (AGGRESSION_CALM_MAX - aggressionScore) / 80,
      reasons: [
        `Agresiflik skoru ${aggressionScore}/100 — kontrollü profil`,
        `Ölüm ortalaması ${recent.avgDeaths}`,
        `KDA ${recent.avgKda}`,
      ],
    });
  }

  if (candidates.length === 0) {
    if (momentumScore >= MOMENTUM_STRONG_MIN) {
      return {
        state: 'LOCKED_IN',
        confidence: 0.55,
        reasons: ['Genel performans dengeli ve momentum pozitif'],
      };
    }
    return {
      state: 'CALM',
      confidence: STATE_CONFIDENCE_MIN,
      reasons: ['Yeterli ayırt edici sinyal yok; nötr profil'],
    };
  }

  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0];
  return {
    state: top.state,
    confidence: round2(Math.min(0.95, top.score)),
    reasons: top.reasons,
  };
}

function secondaryTendency(
  state: PlayerStateKind,
  aggressionBand: AggressionBand,
  momentumScore: number,
): string | null {
  if (state === 'ON_FIRE' && aggressionBand === 'AGGRESSIVE') {
    return 'Controlled Aggression';
  }
  if (state === 'ON_FIRE') return 'High Momentum';
  if (state === 'LOCKED_IN' && aggressionBand === 'AGGRESSIVE') {
    return 'Controlled Aggression';
  }
  if (state === 'AGGRESSIVE' && momentumScore >= MOMENTUM_STRONG_MIN) {
    return 'High Risk · High Tempo';
  }
  if (state === 'CALM' && momentumScore >= MOMENTUM_STRONG_MIN) {
    return 'Efficient · Stable';
  }
  if (state === 'TILTED') return 'Performance Volatility';
  if (state === 'STRUGGLING') return 'Results Under Pressure';
  return null;
}

function buildObservation(
  state: PlayerStateKind,
  recent: MatchWindowMetrics,
  baseline: MatchWindowMetrics,
  aggressionScore: number,
  trend: PlaystyleTrend,
): string {
  const wrPct = Math.round(recent.winRate * 100);
  const kpText =
    recent.avgKillParticipation != null
      ? `%${Math.round(recent.avgKillParticipation * 100)} kill participation`
      : 'kill contribution';

  switch (state) {
    case 'ON_FIRE':
      return `Son ${recent.sampleSize} maçında %${wrPct} kazanma oranıyla oynuyorsun. Özellikle ${recent.winStreak >= 2 ? 'galibiyet serisinde' : 'son maçlarda'} ölüm sayın ${recent.avgDeaths <= baseline.avgDeaths ? 'düşerken' : 'kontrol altında kalırken'} ${kpText} yükselmiş. Şu an saldırganlığın ${aggressionScore >= 61 ? 'tempo kazandırıyor' : 'sonuç veriyor'}.`;

    case 'AGGRESSIVE':
      return `Son oyunlarında savaş arama eğilimin belirgin şekilde artmış (${recent.avgKills}/${recent.avgDeaths}/${recent.avgAssists} ort.). Bu sana tempo kazandırıyor; agresiflik skorun ${aggressionScore}/100. ${recent.avgDeaths > baseline.avgDeaths ? 'Yüksek ölüm sayısı riskin kontrolden çıkabildiğini gösteriyor.' : 'Ölüm tarafı henüz baseline seviyesinde.'}`;

    case 'CALM':
      return `Son ${recent.sampleSize} maçta daha az gereksiz risk ve daha stabil sonuçlar var (${recent.avgDeaths} ort. ölüm, KDA ${recent.avgKda}). Savaşları seçerek oynuyorsun; agresiflik ${aggressionScore}/100 bandında.`;

    case 'LOCKED_IN':
      return `Son maçların tek bir patlamadan ibaret değil. %${wrPct} WR ve ${recent.avgKda} KDA ile performansın istikrarlı; oyunlar arasında karar kaliten korunmuş görünüyor.`;

    case 'TILTED':
      return `Son mağlubiyet serisiyle birlikte ölüm ortalaman ${recent.avgDeaths}'e çıkmış (baseline ${baseline.avgDeaths}). Performans dalgalanman artmış — birkaç maç ara vermek oyun kaliteni korumana yardımcı olabilir.`;

    case 'STRUGGLING':
      return `Son ${recent.sampleSize} maçta sonuçlar istediğin gibi gitmiyor (%${wrPct} WR). Sorun tek bir maç değil; KDA ${recent.avgKda} ve ${recent.lossStreak >= 2 ? `${recent.lossStreak}L seri` : 'genel düşüş'} performansın örneklemin genelinde zayıfladığını gösteriyor.`;

    default:
      return `Son ${recent.sampleSize} maçlık örnekleme göre ${trend === 'MORE_AGGRESSIVE' ? 'daha agresif' : trend === 'MORE_CONTROLLED' ? 'daha kontrollü' : 'benzer'} bir profil çiziyorsun.`;
  }
}

export function analyzePlayerState(matches: LeagueMatch[]): PlayerStateAnalysis {
  const sorted = [...matches].sort(
    (a, b) => b.gameCreation - a.gameCreation,
  );

  const shortSlice = sorted.slice(0, WINDOW_SHORT);
  const midSlice = sorted.slice(0, WINDOW_MID);
  const baselineSlice =
    sorted.length >= MIN_MATCHES_FOR_TREND
      ? sorted.slice(Math.floor(sorted.length / 2))
      : sorted.slice(Math.ceil(sorted.length / 2));

  const short = windowMetrics(shortSlice);
  const mid = windowMetrics(midSlice);
  const baseline = windowMetrics(
    baselineSlice.length > 0 ? baselineSlice : sorted,
  );

  const recent = mid.sampleSize >= MIN_MATCHES_FOR_ANALYSIS ? mid : short;
  const analyzedGames = recent.sampleSize;

  const aggressionScore = computeAggressionScore(recent, baseline);
  const momentumScore = computeMomentumScore(recent, baseline);
  const consistencyScore = computeConsistencyScore(midSlice.length > 0 ? midSlice : shortSlice);
  const band = aggressionBand(aggressionScore);

  const { state, confidence, reasons } = pickState(
    recent,
    baseline,
    aggressionScore,
    momentumScore,
    consistencyScore,
  );

  const { trend, label: trendLabel, detail: trendDetail } =
    sorted.length >= MIN_MATCHES_FOR_TREND
      ? computePlaystyleTrend(recent, baseline)
      : {
          trend: 'STABLE' as PlaystyleTrend,
          label: 'Limited Sample',
          detail: `Trend için en az ${MIN_MATCHES_FOR_TREND} maç gerekli; ${sorted.length} maç analiz edildi.`,
        };

  return {
    state,
    secondaryTendency: secondaryTendency(state, band, momentumScore),
    confidence,
    aggressionScore,
    aggressionBand: band,
    momentumScore,
    consistencyScore,
    playstyleTrend: trend,
    trendLabel,
    trendDetail,
    observation: buildObservation(state, recent, baseline, aggressionScore, trend),
    reasons,
    analyzedGames,
    windows: { short, mid },
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

export { aggressionBandLabel };
