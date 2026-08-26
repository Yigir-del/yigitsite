import { useCallback, useEffect, useState } from 'react';
import type { LeagueApiResponse, PlayerSummary } from '../types/league';

interface UseLeagueDataResult {
  data: PlayerSummary | null;
  loading: boolean;
  error: string | null;
  stale: boolean;
  refresh: () => void;
}

export function useLeagueData(): UseLeagueDataResult {
  const [data, setData] = useState<PlayerSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stale, setStale] = useState(false);
  const [refreshToken, setRefreshToken] = useState(0);

  const refresh = useCallback(() => {
    setRefreshToken((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    const isRefresh = refreshToken > 0;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const qs = isRefresh ? '?refresh=true' : '';
        const res = await fetch(`/api/league/dashboard${qs}`);
        const json = (await res.json()) as LeagueApiResponse;

        if (cancelled) return;

        if (!json.ok || !json.data) {
          setError(json.error ?? 'League of Legends verileri şu anda alınamıyor.');
          if (!json.data) setData(null);
          return;
        }

        setData(json.data);
        setStale(json.stale ?? json.data.stale ?? false);
      } catch {
        if (!cancelled) {
          setError('League of Legends verileri şu anda alınamıyor.');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [refreshToken]);

  return { data, loading, error, stale, refresh };
}
