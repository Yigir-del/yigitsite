import { Navigate } from 'react-router-dom';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
import type { ReactNode } from 'react';

/** League dashboard is desktop-only — mobile users go home */
export default function LeagueMobileGuard({ children }: { children: ReactNode }) {
  const isMobile = useIsMobilePerf();
  if (isMobile) return <Navigate to="/" replace />;
  return children;
}
