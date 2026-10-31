import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import {
  type DomainId,
  DEFAULT_DOMAIN,
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

/**
 * Stable, single-identity ThemeProvider (§3).
 * Permanently locks visual identity to MURYOKUSHO.
 * Theme switching is completely disabled.
 */
export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    applyDomainCss(DEFAULT_DOMAIN);
  }, []);

  const value = useMemo<ThemeContextProps>(
    () => ({
      theme: DEFAULT_DOMAIN,
      nextTheme: null,
      setTheme: () => {
        /* Theme switching disabled (§3) */
      },
      isTransitioning: false,
      transitionProgress: 0,
    }),
    [],
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
