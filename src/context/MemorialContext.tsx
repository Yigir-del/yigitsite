import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useTransition,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Canonical quiet-room path */
export const MEMORIAL_PATH = '/miras';
/** Legacy alias kept for old links */
export const MEMORIAL_LEGACY_PATH = '/atam';

interface MemorialContextValue {
  /** On memorial route (or legacy alias) */
  isQuiet: boolean;
  isMemorial: boolean;
  enterMemorial: () => void;
  exitMemorial: (to: string) => void;
  navigateRespectfully: (to: string) => void;
  prefetchMemorial: () => void;
}

const MemorialContext = createContext<MemorialContextValue | null>(null);

function isMemorialPath(pathname: string) {
  return pathname === MEMORIAL_PATH || pathname === MEMORIAL_LEGACY_PATH;
}

let memorialPrefetch: Promise<unknown> | null = null;

export function prefetchMemorialChunk() {
  if (!memorialPrefetch) {
    memorialPrefetch = Promise.all([
      import('../components/sections/Memorial'),
      // Warm portrait so first paint after click isn’t waiting on the JPEG
      new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => resolve();
        img.onerror = () => resolve();
        img.src = '/Ataturk1930s.jpg';
      }),
    ]);
  }
  return memorialPrefetch;
}

export function MemorialProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [, startTransition] = useTransition();

  const onMemorial = isMemorialPath(location.pathname);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('scene-quiet', onMemorial);
    root.classList.toggle('scene-memorial', onMemorial);
    return () => {
      root.classList.remove('scene-quiet', 'scene-memorial');
    };
  }, [onMemorial]);

  useEffect(() => {
    if (location.pathname === MEMORIAL_LEGACY_PATH) {
      navigate(MEMORIAL_PATH, { replace: true });
    }
  }, [location.pathname, navigate]);

  // Warm memorial chunk so Anıtkabir click feels instant
  useEffect(() => {
    let idleId: number | undefined;
    let timeoutId: number | undefined;

    if (typeof window.requestIdleCallback === 'function') {
      idleId = window.requestIdleCallback(() => {
        void prefetchMemorialChunk();
      }, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(() => {
        void prefetchMemorialChunk();
      }, 600);
    }

    return () => {
      if (idleId !== undefined && typeof window.cancelIdleCallback === 'function') {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  const enterMemorial = useCallback(() => {
    if (isMemorialPath(location.pathname)) return;
    void prefetchMemorialChunk();
    startTransition(() => {
      navigate(MEMORIAL_PATH);
    });
  }, [location.pathname, navigate, startTransition]);

  const exitMemorial = useCallback(
    (to: string) => {
      startTransition(() => navigate(to));
    },
    [navigate, startTransition],
  );

  const navigateRespectfully = useCallback(
    (to: string) => {
      if (to === MEMORIAL_PATH || to === MEMORIAL_LEGACY_PATH) {
        enterMemorial();
        return;
      }
      if (isMemorialPath(location.pathname)) {
        exitMemorial(to);
        return;
      }
      startTransition(() => navigate(to));
    },
    [enterMemorial, exitMemorial, location.pathname, navigate, startTransition],
  );

  const prefetchMemorial = useCallback(() => {
    void prefetchMemorialChunk();
  }, []);

  const value = useMemo<MemorialContextValue>(
    () => ({
      isQuiet: onMemorial,
      isMemorial: onMemorial,
      enterMemorial,
      exitMemorial,
      navigateRespectfully,
      prefetchMemorial,
    }),
    [onMemorial, enterMemorial, exitMemorial, navigateRespectfully, prefetchMemorial],
  );

  return <MemorialContext.Provider value={value}>{children}</MemorialContext.Provider>;
}

export function useMemorial() {
  const ctx = useContext(MemorialContext);
  if (!ctx) {
    throw new Error('useMemorial must be used within MemorialProvider');
  }
  return ctx;
}
