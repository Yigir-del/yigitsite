export interface LeagueRank {
  queueType: string;
  tier: string;
  rank: string;
  lp: number;
  wins: number;
  losses: number;
  winRate: number;
}

export interface MatchInsight {
  sage: string[];
  beggar: string[];
}

export interface LeagueParticipant {
  puuid: string;
  summonerName: string;
  championId: number;
  championName: string;
  teamId: number;
  position: string;
  win: boolean;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  champLevel: number;
  summonerSpell1: number;
  summonerSpell2: number;
  items: number[];
  primaryRune: number | null;
  killParticipation: number | null;
  visionScore: number | null;
}

export interface LeagueMatch {
  matchId: string;
  win: boolean;
  championId: number;
  championName: string;
  kills: number;
  deaths: number;
  assists: number;
  cs: number;
  champLevel: number;
  durationSeconds: number;
  gameCreation: number;
  queueId: number;
  summonerSpell1: number;
  summonerSpell2: number;
  items: number[];
  primaryRune: number | null;
  killParticipation: number | null;
  visionScore: number | null;
  laneOpponentChampion: string | null;
  laneOpponentCs: number | null;
  participants: LeagueParticipant[];
  insights: MatchInsight;
}

export interface ChampionStat {
  championId: number;
  championName: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKda: number;
  csPerMin: number;
  lastPlayed: number;
}

export interface ChampionCompare {
  champion: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  avgKda: number;
  avgKills: number;
  avgDeaths: number;
}

export interface PlayerSummary {
  riotId: string;
  gameName: string;
  tagLine: string;
  region: string;
  puuid: string;
  summonerLevel: number;
  profileIconId: number;
  soloRank: LeagueRank | null;
  flexRank: LeagueRank | null;
  totalChampionMastery: number;
  rankProgression: {
    tiers: readonly string[];
    currentTierIndex: number;
    currentTier: string;
  };
  matches: LeagueMatch[];
  championStats: ChampionStat[];
  recentForm: {
    sampleSize: number;
    wins: number;
    losses: number;
    winRate: number;
    avgKda: number;
    avgCs: number;
    avgDurationSeconds: number;
    mostPlayedChampion: string;
    bestChampion: string;
    streak: number;
    streakType: 'win' | 'loss' | 'none';
    last5Form: Array<'W' | 'L'>;
  };
  vexVsQiyana: {
    vex: ChampionCompare | null;
    qiyana: ChampionCompare | null;
    verdict: string | null;
    minGames: number;
  };
  ddragonVersion: string;
  opggUrl: string;
  fetchedAt: number;
  stale?: boolean;
}

export interface LeagueApiResponse {
  ok: boolean;
  data?: PlayerSummary;
  error?: string;
  stale?: boolean;
}
