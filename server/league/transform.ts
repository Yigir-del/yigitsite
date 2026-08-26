import type {
  LeagueMatch,
  LeagueParticipant,
  LeagueRank,
  PlayerSummary,
} from './types.js';
import type {
  RiotLeagueEntry,
  RiotMatch,
  RiotParticipant,
} from './riot.js';
import { PLAYER, OPGG_URL, TIER_ORDER } from './constants.js';

const POSITION_MAP: Record<string, string> = {
  TOP: 'TOP',
  JUNGLE: 'JUNGLE',
  MIDDLE: 'MIDDLE',
  BOTTOM: 'BOTTOM',
  UTILITY: 'UTILITY',
};

function normalizePosition(p: RiotParticipant): string {
  const pos = p.teamPosition || p.individualPosition || '';
  return POSITION_MAP[pos] ?? pos;
}

function transformRank(entry: RiotLeagueEntry | undefined): LeagueRank | null {
  if (!entry) return null;
  return {
    queueType: entry.queueType,
    tier: entry.tier,
    rank: entry.rank,
    lp: entry.leaguePoints,
    wins: entry.wins,
    losses: entry.losses,
    winRate:
      entry.wins + entry.losses > 0
        ? entry.wins / (entry.wins + entry.losses)
        : 0,
  };
}

function transformParticipant(p: RiotParticipant): LeagueParticipant {
  return {
    puuid: p.puuid,
    summonerName: p.summonerName,
    championId: p.championId,
    championName: p.championName,
    teamId: p.teamId,
    position: normalizePosition(p),
    win: p.win,
    kills: p.kills,
    deaths: p.deaths,
    assists: p.assists,
    cs: p.totalMinionsKilled + p.neutralMinionsKilled,
    champLevel: p.champLevel,
    summonerSpell1: p.summoner1Id,
    summonerSpell2: p.summoner2Id,
    items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6].filter(
      (i) => i > 0,
    ),
    primaryRune: p.perks?.styles?.[0]?.selections?.[0]?.perk ?? null,
    killParticipation: p.challenges?.killParticipation ?? null,
    visionScore: p.visionScore ?? null,
  };
}

function findLaneOpponent(
  me: RiotParticipant,
  all: RiotParticipant[],
): RiotParticipant | undefined {
  const myPos = normalizePosition(me);
  if (!myPos) return undefined;
  return all.find(
    (p) =>
      p.teamId !== me.teamId &&
      normalizePosition(p) === myPos,
  );
}

export function transformMatch(
  raw: RiotMatch,
  playerPuuid: string,
): LeagueMatch | null {
  const meRaw = raw.info.participants.find((p) => p.puuid === playerPuuid);
  if (!meRaw) return null;

  const opponent = findLaneOpponent(meRaw, raw.info.participants);
  const participants = raw.info.participants.map(transformParticipant);

  return {
    matchId: raw.metadata.matchId,
    win: meRaw.win,
    championId: meRaw.championId,
    championName: meRaw.championName,
    kills: meRaw.kills,
    deaths: meRaw.deaths,
    assists: meRaw.assists,
    cs: meRaw.totalMinionsKilled + meRaw.neutralMinionsKilled,
    champLevel: meRaw.champLevel,
    durationSeconds: raw.info.gameDuration,
    gameCreation: raw.info.gameCreation,
    queueId: raw.info.queueId,
    summonerSpell1: meRaw.summoner1Id,
    summonerSpell2: meRaw.summoner2Id,
    items: [
      meRaw.item0,
      meRaw.item1,
      meRaw.item2,
      meRaw.item3,
      meRaw.item4,
      meRaw.item5,
      meRaw.item6,
    ].filter((i) => i > 0),
    primaryRune: meRaw.perks?.styles?.[0]?.selections?.[0]?.perk ?? null,
    killParticipation: meRaw.challenges?.killParticipation ?? null,
    visionScore: meRaw.visionScore ?? null,
    laneOpponentChampion: opponent?.championName ?? null,
    laneOpponentCs: opponent
      ? opponent.totalMinionsKilled + opponent.neutralMinionsKilled
      : null,
    participants,
    insights: { sage: [], beggar: [] },
  };
}

export function buildPlayerSummary(params: {
  puuid: string;
  summonerLevel: number;
  profileIconId: number;
  entries: RiotLeagueEntry[];
  totalMastery: number;
  matches: LeagueMatch[];
  ddragonVersion: string;
  fetchedAt: number;
  stale?: boolean;
}): PlayerSummary {
  const solo = params.entries.find((e) => e.queueType === 'RANKED_SOLO_5x5');
  const flex = params.entries.find((e) => e.queueType === 'RANKED_FLEX_SR');

  const soloRank = transformRank(solo);
  const currentTier = soloRank?.tier ?? 'UNRANKED';
  const tierIndex = TIER_ORDER.indexOf(
    currentTier as (typeof TIER_ORDER)[number],
  );

  return {
    riotId: `${PLAYER.gameName}#${PLAYER.tagLine}`,
    gameName: PLAYER.gameName,
    tagLine: PLAYER.tagLine,
    region: PLAYER.region,
    puuid: params.puuid,
    summonerLevel: params.summonerLevel,
    profileIconId: params.profileIconId,
    soloRank,
    flexRank: transformRank(flex),
    totalChampionMastery: params.totalMastery,
    rankProgression: {
      tiers: [...TIER_ORDER],
      currentTierIndex: tierIndex >= 0 ? tierIndex : -1,
      currentTier,
    },
    matches: params.matches,
    championStats: [],
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
    ddragonVersion: params.ddragonVersion,
    opggUrl: OPGG_URL,
    fetchedAt: params.fetchedAt,
    stale: params.stale ?? false,
  };
}
