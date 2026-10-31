import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import {
  type DomainId,
  DEFAULT_DOMAIN,
  DOMAIN_MAP,
  applyDomainCss,
} from '../themes/domains';
import { recordDomainThemeInteraction } from '../features/achievements/achievementStore';

interface ThemeContextProps {
  theme: DomainId;
  nextTheme: DomainId | null;
  setTheme: (theme: DomainId) => void;
  isTransitioning: boolean;
  transitionProgress: number;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

/** Total cinematic transition window (ms) */
const TRANSITION_MS = 2000;
/** When during transition the new domain actually swaps */
const SWAP_AT_MS = 900;

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<DomainId>(DEFAULT_DOMAIN);
  const [nextTheme, setNextTheme] = useState<DomainId | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [transitionProgress, setTransitionProgress] = useState(0);
  const busyRef = useRef(false);
  const swapTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const endTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    applyDomainCss(DEFAULT_DOMAIN);
    recordDomainThemeInteraction(DEFAULT_DOMAIN, false);
    return () => {
      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);
    };
  }, []);

  const setTheme = useCallback(
    (newTheme: DomainId) => {
      if (newTheme === theme || busyRef.current) return;
      if (!DOMAIN_MAP[newTheme]) return;

      recordDomainThemeInteraction(newTheme, true);

      busyRef.current = true;
      setIsTransitioning(true);
      setNextTheme(newTheme);
      setTransitionProgress(0.01);

      if (swapTimerRef.current) clearTimeout(swapTimerRef.current);
      if (endTimerRef.current) clearTimeout(endTimerRef.current);

      swapTimerRef.current = setTimeout(() => {
        setThemeState(newTheme);
        applyDomainCss(newTheme);
        setTransitionProgress(0.5);
      }, SWAP_AT_MS);

      endTimerRef.current = setTimeout(() => {
        setIsTransitioning(false);
        setNextTheme(null);
        setTransitionProgress(0);
        busyRef.current = false;
        swapTimerRef.current = null;
        endTimerRef.current = null;
      }, TRANSITION_MS);
    },
    [theme],
  );

  const value = useMemo<ThemeContextProps>(
    () => ({
      theme,
      nextTheme,
      setTheme,
      isTransitioning,
      transitionProgress,
    }),
    [theme, nextTheme, setTheme, isTransitioning, transitionProgress],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

// oxlint-disable-next-line react/only-export-components
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { DomainId as DomainTheme };
