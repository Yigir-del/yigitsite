import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  buildRecentSummary,
  compareChampions,
  enrichMatchesWithInsights,
} from '../../server/league/analysis.js';
import { cacheDelete, cacheGet, cacheGetStale, cacheSet } from '../../server/league/cache.js';
import { CACHE_TTL, PLAYER } from '../../server/league/constants.js';
import {
  fetchDdragonVersion,
  fetchOpggAiJson,
  fetchOpggMatchDurations,
  OpggApiError,
} from '../../server/league/opgg.js';
import { transformOpggToSummary } from '../../server/league/opggTransform.js';
import type { PlayerSummary } from '../../server/league/types.js';

const CACHE_KEY = `league-dashboard-${PLAYER.gameName}-${PLAYER.tagLine}`;

async function loadDashboard(): Promise<PlayerSummary> {
  const cachedVersion = cacheGet<string>('ddragon-version');
  const ddragonVersion =
    cachedVersion ?? (await fetchDdragonVersion());
  if (!cachedVersion) {
    cacheSet('ddragon-version', ddragonVersion, CACHE_TTL.ddragon);
  }

  const [data, durations] = await Promise.all([
    fetchOpggAiJson(),
    fetchOpggMatchDurations(),
  ]);

  let summary = transformOpggToSummary({
    data,
    durations,
    ddragonVersion,
    fetchedAt: Date.now(),
    playerPuuid: data.identity.puuid,
  });

  const withInsights = enrichMatchesWithInsights(
    summary.matches,
    summary.puuid,
  );

  summary = {
    ...summary,
    matches: withInsights,
    recentForm: buildRecentSummary(withInsights),
    vexVsQiyana: compareChampions(withInsights, 'Vex', 'Qiyana'),
  };

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
      err instanceof OpggApiError
        ? err.message
        : 'League of Legends verileri şu anda alınamıyor.';

    const status = err instanceof OpggApiError ? err.status : 500;
    return res.status(status === 429 ? 429 : 503).json({
      ok: false,
      error: message,
    });
  }
}
