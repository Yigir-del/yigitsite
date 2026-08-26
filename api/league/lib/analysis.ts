import type { LeagueMatch, MatchInsight, PlayerSummary } from './types';
import { MIN_COMPARE_GAMES } from './constants';

function kdaRatio(k: number, d: number, a: number): number {
  if (d === 0) return k + a;
  return (k + a) / d;
}

function formatKda(k: number, d: number, a: number): string {
  return `${k} / ${d} / ${a}`;
}

/** Per-match insights — only when data supports the claim */
export function analyzeMatch(
  match: LeagueMatch,
  playerPuuid: string,
): MatchInsight {
  const sage: string[] = [];
  const beggar: string[] = [];

  const me = match.participants.find((p) => p.puuid === playerPuuid);
  if (!me) return { sage, beggar };

  const durationMin = match.durationSeconds / 60;
  const myCsMin = me.cs / Math.max(durationMin, 1);
  const kda = kdaRatio(me.kills, me.deaths, me.assists);

  if (me.killParticipation != null && me.killParticipation >= 0.65) {
    sage.push(
      `${me.championName} ile takım savaşlarına yüksek katılım gösterdin (%${Math.round(me.killParticipation * 100)} KP).`,
    );
    beggar.push(
      `Takıma yardım etmişsin, ${me.kills}/${me.deaths}/${me.assists} — en azından birine faydan dokunmuş.`,
    );
  }

  if (me.killParticipation != null && me.killParticipation < 0.35 && durationMin > 20) {
    sage.push(
      'Takım savaşlarına katılımın düşük kalmış; harita baskısı solo lane\'de kalmış olabilir.',
    );
    beggar.push(
      `${Math.round(me.killParticipation * 100)}% KP mi? Takım oyunu başka kanalda mı?`,
    );
  }

  if (me.laneOpponentChampion && me.laneOpponentCs != null) {
    const oppCsMin = me.laneOpponentCs / Math.max(durationMin, 1);
    if (myCsMin - oppCsMin >= 1.5) {
      sage.push(
        `${me.laneOpponentChampion} karşısında CS/min avantajı elde ettin (${myCsMin.toFixed(1)} vs ${oppCsMin.toFixed(1)}).`,
      );
      beggar.push(
        `Lane'i yemişsin ${me.laneOpponentChampion}'dan — CS farkı konuşuyor.`,
      );
    } else if (oppCsMin - myCsMin >= 1.5) {
      sage.push(
        `${me.laneOpponentChampion} karşısında CS/min dezavantajındasın (${myCsMin.toFixed(1)} vs ${oppCsMin.toFixed(1)}).`,
      );
      beggar.push(
        `${me.laneOpponentChampion} seni farmlamış resmen, CS'e bak.`,
      );
    }
  }

  if (kda >= 4 && me.deaths <= 3) {
    sage.push(
      `${formatKda(me.kills, me.deaths, me.assists)} KDA ile temiz bir performans.`,
    );
    beggar.push(
      `${me.kills} kill, ${me.deaths} ölüm — bugün adamların can barını bulmuşsun.`,
    );
  }

  if (me.deaths >= 8) {
    sage.push(
      `${me.deaths} ölüm yüksek; risk aldığın anlarda pozisyon hatası maliyeti artmış.`,
    );
    beggar.push(
      `${me.deaths} kez ölmüşsün kardeşim, respawn noktası ev gibi olmuş 😭`,
    );
  }

  if (match.win && durationMin >= 35) {
    sage.push(
      `Maç ${Math.floor(match.durationSeconds / 60)}:${String(match.durationSeconds % 60).padStart(2, '0')} sürdü; erken avantajı kapatmak zaman almış.`,
    );
    if (me.kills >= 8) {
      beggar.push(
        `Lane'i kazanmışsın da ${Math.floor(durationMin)} dakikaya kadar ne bekledin?`,
      );
    }
  }

  if (!match.win && durationMin >= 35 && me.kills >= 6) {
    sage.push(
      'Kişisel istatistikler güçlü olsa da maç geç kapanmış ve kaybedilmiş.',
    );
    beggar.push(
      `${me.kills} kill alıp kaybetmek — klasik "ben carry'dim takım..." senaryosu.`,
    );
  }

  if (me.visionScore != null && me.visionScore >= 25) {
    sage.push(`Vision skoru ${me.visionScore} — harita kontrolüne yatırım yapmışsın.`);
  }

  return { sage: sage.slice(0, 2), beggar: beggar.slice(0, 2) };
}

export function buildRecentSummary(matches: LeagueMatch[]): PlayerSummary['recentForm'] {
  const recent = matches.slice(0, 10);
  const wins = recent.filter((m) => m.win).length;
  const losses = recent.length - wins;
  const avgKda =
    recent.reduce((s, m) => s + kdaRatio(m.kills, m.deaths, m.assists), 0) /
    Math.max(recent.length, 1);
  const avgCs =
    recent.reduce((s, m) => s + m.cs, 0) / Math.max(recent.length, 1);
  const avgDuration =
    recent.reduce((s, m) => s + m.durationSeconds, 0) /
    Math.max(recent.length, 1);

  const champCounts = new Map<string, { games: number; wins: number }>();
  for (const m of recent) {
    const c = champCounts.get(m.championName) ?? { games: 0, wins: 0 };
    c.games += 1;
    if (m.win) c.wins += 1;
    champCounts.set(m.championName, c);
  }

  let mostPlayed = '';
  let mostPlayedGames = 0;
  let bestChamp = '';
  let bestWinRate = 0;

  for (const [name, { games, wins: w }] of champCounts) {
    if (games > mostPlayedGames) {
      mostPlayed = name;
      mostPlayedGames = games;
    }
    const wr = w / games;
    if (games >= 2 && wr > bestWinRate) {
      bestWinRate = wr;
      bestChamp = name;
    }
  }

  let streak = 0;
  let streakType: 'win' | 'loss' | 'none' = 'none';
  if (recent.length > 0) {
    streakType = recent[0].win ? 'win' : 'loss';
    for (const m of recent) {
      if ((m.win && streakType === 'win') || (!m.win && streakType === 'loss')) {
        streak += 1;
      } else break;
    }
  }

  const last5 = recent.slice(0, 5).map((m) => (m.win ? 'W' : 'L') as 'W' | 'L');

  return {
    sampleSize: recent.length,
    wins,
    losses,
    winRate: recent.length ? wins / recent.length : 0,
    avgKda: Math.round(avgKda * 100) / 100,
    avgCs: Math.round(avgCs),
    avgDurationSeconds: Math.round(avgDuration),
    mostPlayedChampion: mostPlayed,
    bestChampion: bestChamp,
    streak,
    streakType,
    last5Form: last5,
  };
}

export function compareChampions(
  matches: LeagueMatch[],
  a: string,
  b: string,
): PlayerSummary['vexVsQiyana'] {
  const statsFor = (name: string) => {
    const filtered = matches.filter((m) => m.championName === name);
    if (filtered.length === 0) return null;
    const wins = filtered.filter((m) => m.win).length;
    const avgKills =
      filtered.reduce((s, m) => s + m.kills, 0) / filtered.length;
    const avgDeaths =
      filtered.reduce((s, m) => s + m.deaths, 0) / filtered.length;
    const avgKda =
      filtered.reduce(
        (s, m) => s + kdaRatio(m.kills, m.deaths, m.assists),
        0,
      ) / filtered.length;
    return {
      champion: name,
      games: filtered.length,
      wins,
      losses: filtered.length - wins,
      winRate: wins / filtered.length,
      avgKda: Math.round(avgKda * 100) / 100,
      avgKills: Math.round(avgKills * 10) / 10,
      avgDeaths: Math.round(avgDeaths * 10) / 10,
    };
  };

  const vex = statsFor(a);
  const qiyana = statsFor(b);

  let verdict: string | null = null;
  if (
    vex &&
    qiyana &&
    vex.games >= MIN_COMPARE_GAMES &&
    qiyana.games >= MIN_COMPARE_GAMES
  ) {
    if (vex.winRate > qiyana.winRate + 0.1) {
      verdict = `${a} ile daha başarılı görünüyorsun (WR %${Math.round(vex.winRate * 100)} vs %${Math.round(qiyana.winRate * 100)}).`;
    } else if (qiyana.winRate > vex.winRate + 0.1) {
      verdict = `${b} ile daha başarılı görünüyorsun (WR %${Math.round(qiyana.winRate * 100)} vs %${Math.round(vex.winRate * 100)}).`;
    } else {
      verdict = 'İki champion arasında belirgin bir fark yok — sample yakın.';
    }
  }

  return { vex, qiyana, verdict, minGames: MIN_COMPARE_GAMES };
}

export function buildChampionStats(matches: LeagueMatch[]) {
  const map = new Map<
    string,
    {
      championId: number;
      championName: string;
      games: number;
      wins: number;
      kills: number;
      deaths: number;
      assists: number;
      cs: number;
      durationSeconds: number;
      lastPlayed: number;
    }
  >();

  for (const m of matches) {
    const cur = map.get(m.championName) ?? {
      championId: m.championId,
      championName: m.championName,
      games: 0,
      wins: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      cs: 0,
      durationSeconds: 0,
      lastPlayed: 0,
    };
    cur.games += 1;
    if (m.win) cur.wins += 1;
    cur.kills += m.kills;
    cur.deaths += m.deaths;
    cur.assists += m.assists;
    cur.cs += m.cs;
    cur.durationSeconds += m.durationSeconds;
    cur.lastPlayed = Math.max(cur.lastPlayed, m.gameCreation);
    map.set(m.championName, cur);
  }

  return [...map.values()]
    .map((c) => ({
      championId: c.championId,
      championName: c.championName,
      games: c.games,
      wins: c.wins,
      losses: c.games - c.wins,
      winRate: c.wins / c.games,
      avgKda: Math.round(kdaRatio(c.kills, c.deaths, c.assists) * 100) / 100,
      csPerMin:
        c.durationSeconds > 0
          ? c.cs / (c.durationSeconds / 60) / c.games
          : 0,
      lastPlayed: c.lastPlayed,
    }))
    .sort((a, b) => b.lastPlayed - a.lastPlayed);
}

export function enrichMatchesWithInsights(
  matches: LeagueMatch[],
  puuid: string,
): LeagueMatch[] {
  return matches.map((m) => ({
    ...m,
    insights: analyzeMatch(m, puuid),
  }));
}
