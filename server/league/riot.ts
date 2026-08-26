import { PLAYER } from './constants.js';

const RIOT_KEY = process.env.RIOT_API_KEY ?? '';

export class RiotApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function riotFetch<T>(url: string): Promise<T> {
  if (!RIOT_KEY) {
    throw new RiotApiError('RIOT_API_KEY is not configured', 503);
  }

  const res = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_KEY },
  });

  if (res.status === 429) {
    const retry = res.headers.get('Retry-After') ?? '10';
    throw new RiotApiError(`Rate limited — retry after ${retry}s`, 429);
  }

  if (res.status === 404) {
    throw new RiotApiError('Resource not found', 404);
  }

  if (!res.ok) {
    throw new RiotApiError(`Riot API error: ${res.status}`, res.status);
  }

  return res.json() as Promise<T>;
}

export interface RiotAccount {
  puuid: string;
  gameName: string;
  tagLine: string;
}

export interface RiotSummoner {
  id: string;
  accountId: string;
  puuid: string;
  profileIconId: number;
  summonerLevel: number;
}

export interface RiotLeagueEntry {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
}

export interface RiotChampionMastery {
  championId: number;
  championPoints: number;
}

export async function fetchAccount(): Promise<RiotAccount> {
  const name = encodeURIComponent(PLAYER.gameName);
  const tag = encodeURIComponent(PLAYER.tagLine);
  return riotFetch(
    `https://${PLAYER.regional}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${name}/${tag}`,
  );
}

export async function fetchSummoner(puuid: string): Promise<RiotSummoner> {
  return riotFetch(
    `https://${PLAYER.platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`,
  );
}

export async function fetchLeagueEntries(puuid: string): Promise<RiotLeagueEntry[]> {
  return riotFetch(
    `https://${PLAYER.platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`,
  );
}

export async function fetchChampionMasteries(
  puuid: string,
): Promise<RiotChampionMastery[]> {
  return riotFetch(
    `https://${PLAYER.platform}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}`,
  );
}

export async function fetchMatchIds(puuid: string, count: number): Promise<string[]> {
  return riotFetch(
    `https://${PLAYER.regional}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}`,
  );
}

export async function fetchMatch(matchId: string): Promise<RiotMatch> {
  return riotFetch(
    `https://${PLAYER.regional}.api.riotgames.com/lol/match/v5/matches/${matchId}`,
  );
}

export async function fetchDdragonVersion(): Promise<string> {
  const versions = await fetch(
    'https://ddragon.leagueoflegends.com/api/versions.json',
  ).then((r) => r.json() as Promise<string[]>);
  return versions[0] ?? '14.24.1';
}

/** Minimal match-v5 shape used by transform */
export interface RiotMatch {
  metadata: { matchId: string; participants: string[] };
  info: {
    gameDuration: number;
    gameCreation: number;
    queueId: number;
    participants: RiotParticipant[];
  };
}

export interface RiotParticipant {
  puuid: string;
  summonerName: string;
  championId: number;
  championName: string;
  teamId: number;
  teamPosition: string;
  individualPosition: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  totalMinionsKilled: number;
  neutralMinionsKilled: number;
  champLevel: number;
  summoner1Id: number;
  summoner2Id: number;
  item0: number;
  item1: number;
  item2: number;
  item3: number;
  item4: number;
  item5: number;
  item6: number;
  perks: {
    styles: Array<{
      description: string;
      selections: Array<{ perk: number; var1: number; var2: number; var3: number }>;
    }>;
  };
  challenges?: { killParticipation?: number };
  totalDamageDealtToChampions?: number;
  visionScore?: number;
}
