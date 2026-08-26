import { OPGG_URL, PLAYER, TIER_ORDER } from './constants.js';
import type {
  ChampionStat,
  LeagueMatch,
  LeagueRank,
  PlayerSummary,
} from './types.js';
import type { OpggAiJson } from './opgg.js';
import { profileIconIdFromUrl } from './opgg.js';

const DIVISION_ROMAN: Record<number, string> = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
};

function parseOpggTier(tier: string | null, division: number | null): {
  tier: string;
  rank: string;
} {
  if (!tier) return { tier: 'UNRANKED', rank: '' };

  const parts = tier.trim().split(/\s+/);
  const base = parts[0]?.toUpperCase() ?? 'UNRANKED';
  const divFromTier = parts[1] ? Number(parts[1]) : null;
  const div = division ?? divFromTier ?? 0;
  const rank = DIVISION_ROMAN[div] ?? '';

  return { tier: base, rank };
}

function transformRank(
  entry: OpggAiJson['rank']['entries'][number] | undefined,
  queueType: string,
): LeagueRank | null {
  if (!entry || entry.tier == null || entry.lp == null) return null;
  const { tier, rank } = parseOpggTier(entry.tier, entry.division);
  const wins = entry.wins ?? 0;
  const losses = entry.losses ?? 0;
  return {
    queueType,
    tier,
    rank,
    lp: entry.lp,
    wins,
    losses,
    winRate: wins + losses > 0 ? wins / (wins + losses) : entry.winRate / 100,
  };
}

function queueIdFromType(queueType: string): number {
  if (queueType === 'SOLORANKED') return 420;
  if (queueType === 'FLEXRANKED') return 440;
  return 0;
}

export function transformOpggToSummary(params: {
  data: OpggAiJson;
  durations: Map<string, number>;
  ddragonVersion: string;
  fetchedAt: number;
  playerPuuid: string;
}): PlayerSummary {
  const { data, durations, ddragonVersion, fetchedAt, playerPuuid } = params;

  const soloEntry = data.rank.entries.find((e) => e.queueType === 'SOLORANKED');
  const flexEntry = data.rank.entries.find((e) => e.queueType === 'FLEXRANKED');
  const soloRank = transformRank(soloEntry, 'RANKED_SOLO_5x5');
  const flexRank = transformRank(flexEntry, 'RANKED_FLEX_SR');

  const currentTier = soloRank?.tier ?? 'UNRANKED';
  const tierIndex = TIER_ORDER.indexOf(
    currentTier as (typeof TIER_ORDER)[number],
  );

  const matches: LeagueMatch[] = data.recentGames.map((g) => ({
    matchId: g.id,
    win: g.result === 'WIN',
    championId: 0,
    championName: g.champion,
    kills: g.kills,
    deaths: g.deaths,
    assists: g.assists,
    cs: g.cs,
    champLevel: 0,
    durationSeconds: durations.get(g.id) ?? 0,
    gameCreation: Date.parse(g.playedAt),
    queueId: queueIdFromType(g.queueType),
    summonerSpell1: 0,
    summonerSpell2: 0,
    items: [],
    primaryRune: null,
    killParticipation: null,
    visionScore: null,
    laneOpponentChampion: null,
    laneOpponentCs: null,
    participants: [],
    insights: { sage: [], beggar: [] },
  }));

  const championStats: ChampionStat[] = data.recentChampions.map((c) => {
    const gamesForChamp = matches.filter((m) => m.championName === c.name);
    const duration = gamesForChamp.reduce((s, m) => s + m.durationSeconds, 0);
    const cs = gamesForChamp.reduce((s, m) => s + m.cs, 0);
    const k = gamesForChamp.reduce((s, m) => s + m.kills, 0);
    const d = gamesForChamp.reduce((s, m) => s + m.deaths, 0);
    const a = gamesForChamp.reduce((s, m) => s + m.assists, 0);
    const lastPlayed = gamesForChamp.reduce(
      (max, m) => Math.max(max, m.gameCreation),
      0,
    );

    return {
      championId: 0,
      championName: c.name,
      games: c.wins + c.losses,
      wins: c.wins,
      losses: c.losses,
      winRate: c.winRate / 100,
      avgKda: d === 0 ? k + a : Math.round(((k + a) / d) * 100) / 100,
      csPerMin:
        duration > 0 ? Math.round((cs / (duration / 60)) * 10) / 10 : 0,
      lastPlayed,
    };
  });

  return {
    riotId: `${PLAYER.gameName}#${PLAYER.tagLine}`,
    gameName: PLAYER.gameName,
    tagLine: PLAYER.tagLine,
    region: PLAYER.region,
    puuid: playerPuuid,
    summonerLevel: data.identity.level,
    profileIconId: profileIconIdFromUrl(data.identity.profileImageUrl),
    soloRank,
    flexRank,
    totalChampionMastery: 0,
    rankProgression: {
      tiers: [...TIER_ORDER],
      currentTierIndex: tierIndex >= 0 ? tierIndex : -1,
      currentTier,
    },
    matches,
    championStats,
    recentForm: {
      sampleSize: 0,
      wins: 0,
      losses: 0,
      winRate: 0,
      avgKda: 0,
      avgCs: 0,
      avgDurationSeconds: 0,
      mostPlayedChampion: '',
      bestChampion: '',
      streak: 0,
      streakType: 'none',
      last5Form: [],
    },
    vexVsQiyana: {
      vex: null,
      qiyana: null,
      verdict: null,
      minGames: 5,
    },
    ddragonVersion,
    opggUrl: OPGG_URL,
    fetchedAt,
  };
}
