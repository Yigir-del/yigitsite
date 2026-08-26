import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildChampionStats,
  buildRecentSummary,
  compareChampions,
  enrichMatchesWithInsights,
} from '../../server/league/analysis.js';
import { cacheDelete, cacheGet, cacheGetStale, cacheSet } from '../../server/league/cache.js';
import { CACHE_TTL, MATCH_COUNT, PLAYER } from '../../server/league/constants.js';
import {
  fetchAccount,
  fetchChampionMasteries,
  fetchDdragonVersion,
  fetchLeagueEntries,
  fetchMatch,
  fetchMatchIds,
  fetchSummoner,
  RiotApiError,
} from '../../server/league/riot.js';
import { buildPlayerSummary, transformMatch } from '../../server/league/transform.js';
import type { PlayerSummary } from '../../server/league/types.js';

const CACHE_KEY = `league-dashboard-${PLAYER.gameName}-${PLAYER.tagLine}`;

async function loadDashboard(): Promise<PlayerSummary> {
  const cachedVersion = cacheGet<string>('ddragon-version');
  const ddragonVersion =
    cachedVersion ?? (await fetchDdragonVersion());
  if (!cachedVersion) {
    cacheSet('ddragon-version', ddragonVersion, CACHE_TTL.ddragon);
  }

  const account = await fetchAccount();
  const [summoner, entries, masteries, matchIds] = await Promise.all([
    fetchSummoner(account.puuid),
    fetchLeagueEntries(account.puuid),
    fetchChampionMasteries(account.puuid),
    fetchMatchIds(account.puuid, MATCH_COUNT),
  ]);

  const totalMastery = masteries.reduce((s, m) => s + m.championPoints, 0);

  const rawMatches = await Promise.all(
    matchIds.map((id) => fetchMatch(id)),
  );

  const matches = rawMatches
    .map((m) => transformMatch(m, account.puuid))
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => b.gameCreation - a.gameCreation);

  const withInsights = enrichMatchesWithInsights(matches, account.puuid);

  const summary = buildPlayerSummary({
    puuid: account.puuid,
    summonerLevel: summoner.summonerLevel,
    profileIconId: summoner.profileIconId,
    entries,
    totalMastery,
    matches: withInsights,
    ddragonVersion,
    fetchedAt: Date.now(),
  });

  summary.championStats = buildChampionStats(withInsights);
  summary.recentForm = buildRecentSummary(withInsights);
  summary.vexVsQiyana = compareChampions(withInsights, 'Vex', 'Qiyana');

  return summary;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  const refresh = req.query.refresh === 'true';

  if (refresh) {
    cacheDelete(CACHE_KEY);
  }

  try {
    const cached = refresh ? null : cacheGet<PlayerSummary>(CACHE_KEY);
    if (cached) {
      return res.status(200).json({
        ok: true,
        data: cached,
        stale: false,
      });
    }

    const data = await loadDashboard();
    cacheSet(CACHE_KEY, data, CACHE_TTL.dashboard);

    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({ ok: true, data, stale: false });
  } catch (err) {
    console.error('League dashboard error:', err);

    const stale = cacheGetStale<PlayerSummary>(CACHE_KEY);
    if (stale) {
      return res.status(200).json({
        ok: true,
        data: { ...stale, stale: true },
        stale: true,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    const message =
      err instanceof RiotApiError
        ? err.message
        : 'League of Legends verileri şu anda alınamıyor.';

    const status = err instanceof RiotApiError ? err.status : 500;
    return res.status(status === 429 ? 429 : 503).json({
      ok: false,
      error: message,
    });
  }
}
