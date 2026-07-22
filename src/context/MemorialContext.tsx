import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

/** Canonical quiet-room path */
export const MEMORIAL_PATH = '/miras';
/** Legacy alias kept for old links */
export const MEMORIAL_LEGACY_PATH = '/atam';

export type MemorialPhase = 'alive' | 'entering' | 'memorial' | 'leaving';

interface MemorialContextValue {
  phase: MemorialPhase;
  /** Chaos / jokes / loud motion should hush */
  isQuiet: boolean;
  isMemorial: boolean;
  enterMemorial: () => void;
  exitMemorial: (to: string) => void;
  navigateRespectfully: (to: string) => void;
}

const MemorialContext = createContext<MemorialContextValue | null>(null);

const ENTER_MS = 700;
const LEAVE_MS = 550;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function isMemorialPath(pathname: string) {
  return pathname === MEMORIAL_PATH || pathname === MEMORIAL_LEGACY_PATH;
}

function syncHtmlPhase(phase: MemorialPhase) {
  const root = document.documentElement;
  root.classList.toggle('scene-entering', phase === 'entering');
  root.classList.toggle('scene-memorial', phase === 'memorial');
  root.classList.toggle('scene-leaving', phase === 'leaving');
  root.classList.toggle(
    'scene-quiet',
    phase === 'entering' || phase === 'memorial' || phase === 'leaving',
  );
}

export function MemorialProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<MemorialPhase>(() =>
    isMemorialPath(location.pathname) ? 'memorial' : 'alive',
  );
  const lockRef = useRef(false);

  useEffect(() => {
    syncHtmlPhase(phase);
    return () => {
      syncHtmlPhase('alive');
    };
  }, [phase]);

  // Normalize legacy /atam → /miras
  useEffect(() => {
    if (location.pathname === MEMORIAL_LEGACY_PATH) {
      navigate(MEMORIAL_PATH, { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    if (lockRef.current) return;
    if (isMemorialPath(location.pathname)) {
      setPhase('memorial');
    } else if (phase !== 'alive' && phase !== 'leaving') {
      setPhase('alive');
    }
  }, [location.pathname, phase]);

  const enterMemorial = useCallback(() => {
    if (lockRef.current) return;
    if (isMemorialPath(location.pathname)) return;

    lockRef.current = true;
    setPhase('entering');

    void (async () => {
      await wait(ENTER_MS);
      navigate(MEMORIAL_PATH);
      window.scrollTo(0, 0);
      setPhase('memorial');
      lockRef.current = false;
    })();
  }, [location.pathname, navigate]);

  const exitMemorial = useCallback(
    (to: string) => {
      if (lockRef.current) return;

      if (!isMemorialPath(location.pathname)) {
        navigate(to);
        return;
      }

      lockRef.current = true;
      setPhase('leaving');

      void (async () => {
        await wait(LEAVE_MS);
        navigate(to);
        window.scrollTo(0, 0);
        setPhase('alive');
        lockRef.current = false;
      })();
    },
    [location.pathname, navigate],
  );

  const navigateRespectfully = useCallback(
    (to: string) => {
      if (to === MEMORIAL_PATH || to === MEMORIAL_LEGACY_PATH) {
        enterMemorial();
        return;
      }
      if (isMemorialPath(location.pathname) || phase === 'memorial') {
        exitMemorial(to);
        return;
      }
      navigate(to);
    },
    [enterMemorial, exitMemorial, location.pathname, navigate, phase],
  );

  const value = useMemo<MemorialContextValue>(
    () => ({
      phase,
      isQuiet: phase === 'entering' || phase === 'memorial' || phase === 'leaving',
      isMemorial: phase === 'memorial',
      enterMemorial,
      exitMemorial,
      navigateRespectfully,
    }),
    [phase, enterMemorial, exitMemorial, navigateRespectfully],
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
