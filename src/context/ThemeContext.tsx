import { createContext, useContext, useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import {
  type DomainId,
  DEFAULT_DOMAIN,
  DOMAIN_MAP,
  applyDomainCss,
} from '../themes/domains';

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
  const rafRef = useRef<number | null>(null);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    applyDomainCss(theme);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      timersRef.current.forEach(clearTimeout);
    };
  }, []);

  const setTheme = useCallback((newTheme: DomainId) => {
    if (newTheme === theme || busyRef.current) return;
    if (!DOMAIN_MAP[newTheme]) return;

    busyRef.current = true;
    setIsTransitioning(true);
    setNextTheme(newTheme);
    setTransitionProgress(0);

    const start = performance.now();
    let swapped = false;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / TRANSITION_MS);
      setTransitionProgress(t);

      if (!swapped && now - start >= SWAP_AT_MS) {
        swapped = true;
        setThemeState(newTheme);
        applyDomainCss(newTheme);
      }

      if (t < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setIsTransitioning(false);
        setNextTheme(null);
        setTransitionProgress(0);
        busyRef.current = false;
        rafRef.current = null;
      }
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{ theme, nextTheme, setTheme, isTransitioning, transitionProgress }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export type { DomainId as DomainTheme };
