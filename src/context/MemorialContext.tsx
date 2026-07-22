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

export const MEMORIAL_PATH = '/atam';

export type MemorialPhase = 'alive' | 'freezing' | 'memorial' | 'thawing';

interface MemorialContextValue {
  phase: MemorialPhase;
  /** Chaos, jokes, motion layers should be silent */
  isQuiet: boolean;
  /** Fully inside the memorial (route content visible) */
  isMemorial: boolean;
  enterMemorial: () => void;
  exitMemorial: (to: string) => void;
  navigateRespectfully: (to: string) => void;
}

const MemorialContext = createContext<MemorialContextValue | null>(null);

const FREEZE_MS = 1600;
const THAW_MS = 1100;

function wait(ms: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function syncHtmlPhase(phase: MemorialPhase) {
  const root = document.documentElement;
  root.classList.toggle('scene-freezing', phase === 'freezing');
  root.classList.toggle('scene-memorial', phase === 'memorial');
  root.classList.toggle('scene-thawing', phase === 'thawing');
  root.classList.toggle(
    'scene-quiet',
    phase === 'freezing' || phase === 'memorial' || phase === 'thawing',
  );
}

export function MemorialProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [phase, setPhase] = useState<MemorialPhase>(() =>
    location.pathname === MEMORIAL_PATH ? 'memorial' : 'alive',
  );
  const lockRef = useRef(false);

  useEffect(() => {
    syncHtmlPhase(phase);
    return () => {
      syncHtmlPhase('alive');
    };
  }, [phase]);

  // Browser back/forward without our choreographed transition
  useEffect(() => {
    if (lockRef.current) return;
    if (location.pathname === MEMORIAL_PATH) {
      setPhase('memorial');
    } else if (phase !== 'alive' && phase !== 'thawing') {
      setPhase('alive');
    }
  }, [location.pathname, phase]);

  const enterMemorial = useCallback(() => {
    if (lockRef.current) return;
    if (location.pathname === MEMORIAL_PATH) return;

    lockRef.current = true;
    setPhase('freezing');

    void (async () => {
      await wait(FREEZE_MS);
      navigate(MEMORIAL_PATH);
      window.scrollTo(0, 0);
      setPhase('memorial');
      lockRef.current = false;
    })();
  }, [location.pathname, navigate]);

  const exitMemorial = useCallback(
    (to: string) => {
      if (lockRef.current) return;

      if (location.pathname !== MEMORIAL_PATH) {
        navigate(to);
        return;
      }

      lockRef.current = true;
      setPhase('thawing');

      void (async () => {
        await wait(THAW_MS);
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
      if (to === MEMORIAL_PATH) {
        enterMemorial();
        return;
      }
      if (location.pathname === MEMORIAL_PATH || phase === 'memorial') {
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
      isQuiet: phase === 'freezing' || phase === 'memorial' || phase === 'thawing',
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
