import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export type DomainTheme = 'Muryokusho' | 'FukumaMizushi' | 'KangoAneitei' | 'GaikanTecchisen' | 'ShinganSoai';

interface ThemeContextProps {
  theme: DomainTheme;
  setTheme: (theme: DomainTheme) => void;
  isTransitioning: boolean;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

const themeStyles: Record<DomainTheme, Record<string, string>> = {
  Muryokusho: {
    '--bg-deep-charcoal': '#0a0a14',
    '--bg-dark-navy': '#0d131f',
    '--bg-soft-gray': '#1e2024',
    '--text-main': '#e2e8f0',
    '--text-muted': '#94a3b8',
    '--accent-muted-blue': '#4b6b8b',
    '--accent-desaturated-cyan': '#395c6b',
    '--accent-pale-gray': '#cbd5e1',
    '--accent-soft-white': '#f8fafc',
  },
  FukumaMizushi: {
    '--bg-deep-charcoal': '#0d0000',
    '--bg-dark-navy': '#1a0505',
    '--bg-soft-gray': '#2b1010',
    '--text-main': '#ffcccc',
    '--text-muted': '#a36666',
    '--accent-muted-blue': '#990000',
    '--accent-desaturated-cyan': '#660000',
    '--accent-pale-gray': '#ff9999',
    '--accent-soft-white': '#ff3333',
  },
  KangoAneitei: {
    '--bg-deep-charcoal': '#050505',
    '--bg-dark-navy': '#000000',
    '--bg-soft-gray': '#111111',
    '--text-main': '#cccccc',
    '--text-muted': '#666666',
    '--accent-muted-blue': '#333333',
    '--accent-desaturated-cyan': '#1a1a1a',
    '--accent-pale-gray': '#999999',
    '--accent-soft-white': '#ffffff',
  },
  GaikanTecchisen: {
    '--bg-deep-charcoal': '#1a0a00',
    '--bg-dark-navy': '#331400',
    '--bg-soft-gray': '#4d1f00',
    '--text-main': '#ffcc99',
    '--text-muted': '#cc8855',
    '--accent-muted-blue': '#ff5500',
    '--accent-desaturated-cyan': '#cc4400',
    '--accent-pale-gray': '#ffaa66',
    '--accent-soft-white': '#ffffcc',
  },
  ShinganSoai: {
    '--bg-deep-charcoal': '#f0f5fa',
    '--bg-dark-navy': '#e0eaf5',
    '--bg-soft-gray': '#d0e0f0',
    '--text-main': '#1a334d',
    '--text-muted': '#4d6680',
    '--accent-muted-blue': '#99ccff',
    '--accent-desaturated-cyan': '#66a3e0',
    '--accent-pale-gray': '#b3d9ff',
    '--accent-soft-white': '#ffffff',
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<DomainTheme>('Muryokusho');
  const [isTransitioning, setIsTransitioning] = useState(false);

  const setTheme = (newTheme: DomainTheme) => {
    if (newTheme === theme) return;
    setIsTransitioning(true);
    
    // Simulate cinematic transition delay (halfway through the fade/shake)
    setTimeout(() => {
      setThemeState(newTheme);
      
      const styles = themeStyles[newTheme];
      for (const [key, value] of Object.entries(styles)) {
        document.documentElement.style.setProperty(key, value);
      }
      
      // End transition state after the fade in
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1500); // 1.5s fade in
      
    }, 1000); // 1s fade out/shake
  };

  // Initialize CSS vars on mount
  useEffect(() => {
    const styles = themeStyles[theme];
    for (const [key, value] of Object.entries(styles)) {
      document.documentElement.style.setProperty(key, value);
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isTransitioning }}>
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
