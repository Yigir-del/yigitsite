import { PLAYER, OPGG_URL } from './constants.js';

export class OpggApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

/** OP.GG summoner ai.json — public snapshot used by OP.GG */
export interface OpggAiJson {
  identity: {
    puuid: string;
    gameName: string;
    tagline: string;
    riotId: string;
    level: number;
    profileImageUrl: string;
  };
  freshness: {
    summonerUpdatedAt: string;
    latestGamePlayedAt: string;
  };
  rank: {
    entries: Array<{
      queueType: string;
      tier: string | null;
      division: number | null;
      lp: number | null;
      wins: number | null;
      losses: number | null;
      winRate: number;
    }>;
  };
  recentChampions: Array<{
    name: string;
    key: string;
    wins: number;
    losses: number;
    winRate: number;
  }>;
  recentGames: Array<{
    id: string;
    playedAt: string;
    queueType: string;
    queueName: string;
    result: 'WIN' | 'LOSE' | string;
    champion: string;
    championKey: string;
    position: string;
    role: string;
    kills: number;
    deaths: number;
    assists: number;
    kda: string;
    cs: number;
    opScore: number;
    opScoreRank: number;
  }>;
}

const SUMMONER_PATH = `/lol/summoners/${PLAYER.region.toLowerCase()}/${encodeURIComponent(PLAYER.gameName)}-${encodeURIComponent(PLAYER.tagLine)}`;

export function opggSummonerUrl(): string {
  return `https://op.gg${SUMMONER_PATH}`;
}

export async function fetchOpggAiJson(): Promise<OpggAiJson> {
  const url = `${opggSummonerUrl()}/ai.json`;

  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'yigitsite-league-dashboard/1.0',
    },
  });

  if (res.status === 404) {
    throw new OpggApiError('Summoner not found on OP.GG', 404);
  }

  if (res.status === 429) {
    throw new OpggApiError('OP.GG rate limit — try again shortly', 429);
  }

  if (!res.ok) {
    throw new OpggApiError(`OP.GG error: ${res.status}`, res.status);
  }

  return res.json() as Promise<OpggAiJson>;
}

/** Pull game durations from OP.GG MCP match list (ai.json omits duration). */
export async function fetchOpggMatchDurations(): Promise<Map<string, number>> {
  const body = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/call',
    params: {
      name: 'lol_list_summoner_matches',
      arguments: {
        game_name: PLAYER.gameName,
        tag_line: PLAYER.tagLine,
        region: PLAYER.region,
        lang: 'en',
      },
    },
  };

  try {
    const res = await fetch('https://mcp-api.op.gg/mcp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) return new Map();

    const json = (await res.json()) as {
      result?: { content?: Array<{ text?: string }> };
    };
    const text = json.result?.content?.[0]?.text ?? '';
    return parseMcpDurations(text);
  } catch {
    return new Map();
  }
}

/** GameHistory("id",...,game_length_second,...) */
function parseMcpDurations(text: string): Map<string, number> {
  const map = new Map<string, number>();
  const re =
    /GameHistory\("([^"]+)","[^"]*","[^"]*","[^"]*",(\d+)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    map.set(m[1], Number(m[2]));
  }
  return map;
}

export async function fetchDdragonVersion(): Promise<string> {
  const versions = await fetch(
    'https://ddragon.leagueoflegends.com/api/versions.json',
  ).then((r) => r.json() as Promise<string[]>);
  return versions[0] ?? '14.24.1';
}

export function profileIconIdFromUrl(url: string): number {
  const m = url.match(/profileIcon(\d+)/i);
  return m ? Number(m[1]) : 0;
}
