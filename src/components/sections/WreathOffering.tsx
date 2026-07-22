import { useCallback, useEffect, useState } from 'react';

const STORAGE_DAY_KEY = 'yigit_wreath_day';

type WreathState = {
  count: number;
  alreadyLeft: boolean;
  loading: boolean;
  submitting: boolean;
  error: string | null;
};

function istanbulDayKey(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function readLocalLeftToday(): boolean {
  try {
    return localStorage.getItem(STORAGE_DAY_KEY) === istanbulDayKey();
  } catch {
    return false;
  }
}

function markLocalLeftToday() {
  try {
    localStorage.setItem(STORAGE_DAY_KEY, istanbulDayKey());
  } catch {
    /* ignore */
  }
}

function WreathIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="28"
      height="28"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M32 8c-6 7-16 10-20 18 5 2 10 1 14-2-1 6-5 12-4 18 6-3 11-8 14-14 3 6 8 11 14 14 1-6-3-12-4-18 4 3 9 4 14 2-4-8-14-11-20-18Z"
        fill="currentColor"
        opacity="0.92"
      />
      <path
        d="M20 44c4 6 9 10 12 12 3-2 8-6 12-12-5 1-9 1-12 0-3 1-7 1-12 0Z"
        fill="currentColor"
        opacity="0.55"
      />
      <circle cx="32" cy="36" r="3.2" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

export default function WreathOffering() {
  const [state, setState] = useState<WreathState>({
    count: 0,
    alreadyLeft: readLocalLeftToday(),
    loading: true,
    submitting: false,
    error: null,
  });
  const [justLeft, setJustLeft] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const res = await fetch('/api/wreaths');
        if (!res.ok) throw new Error('fetch failed');
        const data = (await res.json()) as { count: number; alreadyLeft: boolean };
        if (cancelled) return;
        if (data.alreadyLeft) markLocalLeftToday();
        setState((s) => ({
          ...s,
          count: data.count,
          alreadyLeft: data.alreadyLeft || readLocalLeftToday(),
          loading: false,
          error: null,
        }));
      } catch {
        if (cancelled) return;
        setState((s) => ({
          ...s,
          loading: false,
          error: 'Çelenkler şu an yüklenemedi.',
        }));
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const leaveWreath = useCallback(async () => {
    if (state.alreadyLeft || state.submitting || state.loading) return;

    setState((s) => ({ ...s, submitting: true, error: null }));

    try {
      const res = await fetch('/api/wreaths', { method: 'POST' });
      const data = (await res.json()) as {
        count?: number;
        alreadyLeft?: boolean;
        error?: string;
      };

      if (res.status === 409 || data.alreadyLeft) {
        markLocalLeftToday();
        setState((s) => ({
          ...s,
          count: typeof data.count === 'number' ? data.count : s.count,
          alreadyLeft: true,
          submitting: false,
        }));
        return;
      }

      if (!res.ok || typeof data.count !== 'number') {
        throw new Error(data.error || 'post failed');
      }

      markLocalLeftToday();
      setJustLeft(true);
      setState((s) => ({
        ...s,
        count: data.count as number,
        alreadyLeft: true,
        submitting: false,
      }));
    } catch {
      setState((s) => ({
        ...s,
        submitting: false,
        error: 'Çelenk bırakılamadı. Biraz sonra yeniden dene.',
      }));
    }
  }, [state.alreadyLeft, state.submitting, state.loading]);

  const countLabel = state.loading
    ? '…'
    : `${state.count.toLocaleString('tr-TR')} çelenk bırakıldı`;

  return (
    <div className={`wreath-offering${justLeft ? ' is-placed' : ''}`}>
      <button
        type="button"
        className="wreath-offering__btn"
        onClick={leaveWreath}
        disabled={state.alreadyLeft || state.submitting || state.loading}
        aria-label={
          state.alreadyLeft
            ? 'Bugün çelenk bıraktın'
            : 'Saygıyla bir çelenk bırak'
        }
      >
        <span className="wreath-offering__icon" aria-hidden>
          <WreathIcon />
        </span>
        <span className="wreath-offering__label">
          {state.submitting
            ? 'Bırakılıyor…'
            : state.alreadyLeft
              ? 'Bugün bıraktın'
              : 'Çelenk bırak'}
        </span>
      </button>

      <p className="wreath-offering__count" aria-live="polite">
        {countLabel}
      </p>

      {state.alreadyLeft && !state.loading && (
        <p className="wreath-offering__hint">Günde bir çelenk. Yarın yine gelebilirsin.</p>
      )}

      {state.error && <p className="wreath-offering__error">{state.error}</p>}
    </div>
  );
}
