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
      width="30"
      height="30"
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Outer ring */}
      <circle cx="32" cy="32" r="22" stroke="currentColor" strokeWidth="2.2" opacity="0.35" />
      <circle cx="32" cy="32" r="14.5" stroke="currentColor" strokeWidth="1.4" opacity="0.22" />

      {/* Leaf clusters around the circle */}
      <g fill="currentColor">
        {/* top */}
        <ellipse cx="32" cy="8.5" rx="4.2" ry="6.2" opacity="0.9" />
        <ellipse cx="25.5" cy="10.5" rx="3.4" ry="5.2" transform="rotate(-28 25.5 10.5)" opacity="0.75" />
        <ellipse cx="38.5" cy="10.5" rx="3.4" ry="5.2" transform="rotate(28 38.5 10.5)" opacity="0.75" />

        {/* top-right */}
        <ellipse cx="48" cy="16" rx="3.5" ry="5.4" transform="rotate(48 48 16)" opacity="0.88" />
        <ellipse cx="52.5" cy="22.5" rx="3.2" ry="5" transform="rotate(68 52.5 22.5)" opacity="0.72" />

        {/* right */}
        <ellipse cx="55.5" cy="32" rx="4.2" ry="6.2" transform="rotate(90 55.5 32)" opacity="0.9" />
        <ellipse cx="53" cy="39.5" rx="3.3" ry="5.1" transform="rotate(112 53 39.5)" opacity="0.74" />

        {/* bottom-right */}
        <ellipse cx="48" cy="48" rx="3.5" ry="5.4" transform="rotate(138 48 48)" opacity="0.86" />
        <ellipse cx="41" cy="52.5" rx="3.2" ry="5" transform="rotate(158 41 52.5)" opacity="0.7" />

        {/* bottom */}
        <ellipse cx="32" cy="55.5" rx="4.2" ry="6.2" opacity="0.9" />
        <ellipse cx="25.5" cy="53.5" rx="3.4" ry="5.2" transform="rotate(28 25.5 53.5)" opacity="0.75" />
        <ellipse cx="38.5" cy="53.5" rx="3.4" ry="5.2" transform="rotate(-28 38.5 53.5)" opacity="0.75" />

        {/* bottom-left */}
        <ellipse cx="16" cy="48" rx="3.5" ry="5.4" transform="rotate(-138 16 48)" opacity="0.86" />
        <ellipse cx="11.5" cy="41" rx="3.2" ry="5" transform="rotate(-112 11.5 41)" opacity="0.7" />

        {/* left */}
        <ellipse cx="8.5" cy="32" rx="4.2" ry="6.2" transform="rotate(-90 8.5 32)" opacity="0.9" />
        <ellipse cx="11" cy="24.5" rx="3.3" ry="5.1" transform="rotate(-68 11 24.5)" opacity="0.74" />

        {/* top-left */}
        <ellipse cx="16" cy="16" rx="3.5" ry="5.4" transform="rotate(-48 16 16)" opacity="0.88" />
        <ellipse cx="11.5" cy="22.5" rx="3.2" ry="5" transform="rotate(-68 11.5 22.5)" opacity="0.72" />
      </g>

      {/* Small flower buds on the ring */}
      <g fill="currentColor">
        <circle cx="32" cy="12" r="2.1" opacity="0.95" />
        <circle cx="47.5" cy="18.5" r="1.8" opacity="0.85" />
        <circle cx="52" cy="32" r="2.1" opacity="0.95" />
        <circle cx="47.5" cy="45.5" r="1.8" opacity="0.85" />
        <circle cx="32" cy="52" r="2.1" opacity="0.95" />
        <circle cx="16.5" cy="45.5" r="1.8" opacity="0.85" />
        <circle cx="12" cy="32" r="2.1" opacity="0.95" />
        <circle cx="16.5" cy="18.5" r="1.8" opacity="0.85" />
      </g>

      {/* Center flower */}
      <g fill="currentColor" opacity="0.88">
        <circle cx="32" cy="28.5" r="2.4" />
        <circle cx="35.6" cy="30.8" r="2.4" />
        <circle cx="34.2" cy="34.8" r="2.4" />
        <circle cx="29.8" cy="34.8" r="2.4" />
        <circle cx="28.4" cy="30.8" r="2.4" />
        <circle cx="32" cy="32" r="2" opacity="1" />
      </g>
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
