import { lazy, Suspense } from 'react';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';

const DesktopBackground = lazy(() => import('./DesktopBackground'));

/**
 * Mobile: CSS starfield (no WebGL).
 * Desktop: identical Canvas path as before (lazy-chunked).
 */
export default function Background() {
  const isMobilePerf = useIsMobilePerf();

  if (isMobilePerf) {
    return <div id="canvas-container" className="mobile-starfield" aria-hidden />;
  }

  return (
    <Suspense
      fallback={
        <div
          id="canvas-container"
          style={{ backgroundColor: '#0d131f' }}
          aria-hidden
        />
      }
    >
      <DesktopBackground />
    </Suspense>
  );
}
