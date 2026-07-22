import { lazy, Suspense, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ReactLenis } from '@studio-freight/react-lenis';
import Background from './components/canvas/Background';
import ChaosManager from './components/events/ChaosManager';
import EasterEggs from './components/events/EasterEggs';
import FlyingPen from './components/events/FlyingPen';
import FlyingMusic from './components/events/FlyingMusic';
import FakeMenu from './components/ui/FakeMenu';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import NotesWall from './pages/NotesWall';
import { ThemeProvider } from './context/ThemeContext';
import { MemorialProvider, useMemorial } from './context/MemorialContext';
import ThemeSelector from './components/ui/ThemeSelector';
import MemorialVeil from './components/memorial/MemorialVeil';
import SilentGuardians from './components/events/SilentGuardians';
import { useIsMobilePerf } from './hooks/useIsMobilePerf';
import PageTransition, { PageTransitionFallback } from './components/ui/PageTransition';
import { trackPageView } from './utils/analytics';

const About = lazy(() => import('./components/sections/About'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Thoughts = lazy(() => import('./components/sections/Thoughts'));
const Studio = lazy(() => import('./components/sections/Studio'));
const Contact = lazy(() => import('./components/sections/Contact'));
const Memorial = lazy(() => import('./components/sections/Memorial'));

const FlyingBeggar = lazy(() => import('./components/events/FlyingBeggar'));
const FlyingSage = lazy(() => import('./components/events/FlyingSage'));
const SocialDrifters = lazy(() => import('./components/events/SocialDrifters'));
const CustomCursor = lazy(() => import('./components/ui/CustomCursor'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/**
 * GA4 SPA sayfa takibi — her route değişiminde
 * requestIdleCallback ile ana thread boştayken gönderir.
 */
function Analytics() {
  const location = useLocation();

  useEffect(() => {
    const send = () => trackPageView(location.pathname + location.search);

    if (typeof window.requestIdleCallback === 'function') {
      const id = window.requestIdleCallback(send, { timeout: 300 });
      return () => window.cancelIdleCallback(id);
    }

    const id = window.setTimeout(send, 300);
    return () => window.clearTimeout(id);
  }, [location.pathname, location.search]);

  return null;
}

function Shell({ children }: { children: ReactNode }) {
  const isMobilePerf = useIsMobilePerf();
  if (isMobilePerf) return <>{children}</>;
  return <ReactLenis root>{children as never}</ReactLenis>;
}

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <Suspense fallback={<PageTransitionFallback />}>
      <AnimatePresence mode="wait" initial={false}>
        <PageTransition key={location.pathname}>
          <Routes location={location}>
            <Route
              path="/"
              element={
                <>
                  <Hero />
                  <NotesWall />
                </>
              }
            />
            <Route path="/hakkimda" element={<About />} />
            <Route path="/projeler" element={<Projects />} />
            <Route path="/dusunceler" element={<Thoughts />} />
            <Route path="/studyom" element={<Studio />} />
            <Route path="/iletisim" element={<Contact />} />
            <Route path="/atam" element={<Memorial />} />
          </Routes>
        </PageTransition>
      </AnimatePresence>
    </Suspense>
  );
}

function AppShell() {
  const [upsideDown, setUpsideDown] = useState(false);
  const isMobilePerf = useIsMobilePerf();
  const { isQuiet, phase } = useMemorial();

  const toggleWorld = useCallback(() => {
    if (isQuiet) return;
    setUpsideDown((v) => !v);
  }, [isQuiet]);

  useEffect(() => {
    window.addEventListener('world-flip', toggleWorld);
    return () => window.removeEventListener('world-flip', toggleWorld);
  }, [toggleWorld]);

  // Memorial silence cancels any upside-down chaos
  useEffect(() => {
    if (isQuiet && upsideDown) setUpsideDown(false);
  }, [isQuiet, upsideDown]);

  useEffect(() => {
    const stage = document.querySelector('.app-container') as HTMLElement | null;
    if (!stage) return;

    const syncOrigin = () => {
      const midY = window.scrollY + window.innerHeight / 2;
      stage.style.transformOrigin = `50% ${midY}px`;
    };

    syncOrigin();
    stage.classList.toggle('world-flipped', upsideDown);
    document.documentElement.classList.toggle('world-flipped', upsideDown);

    if (!upsideDown) {
      stage.style.transformOrigin = '';
      return;
    }

    window.addEventListener('scroll', syncOrigin, { passive: true });
    window.addEventListener('resize', syncOrigin);
    return () => {
      stage.classList.remove('world-flipped');
      document.documentElement.classList.remove('world-flipped');
      stage.style.transformOrigin = '';
      window.removeEventListener('scroll', syncOrigin);
      window.removeEventListener('resize', syncOrigin);
    };
  }, [upsideDown]);

  const showBackground = phase === 'alive' || phase === 'freezing' || phase === 'thawing';
  const showLivingChaos = phase === 'alive';
  const showFlyers = phase === 'alive' || phase === 'freezing';
  const showGuardians = phase === 'memorial';
  const freezing = phase === 'freezing';

  return (
    <>
      <div
        className={`atmosphere-fill${isQuiet ? ' atmosphere-fill--memorial' : ''}`}
        aria-hidden
      />
      {showBackground ? <Background frozen={freezing} /> : null}
      {!isQuiet && <ThemeSelector />}

      <Shell>
        <ScrollToTop />
        <Analytics />
        <div className={`app-container${freezing ? ' is-freezing' : ''}`}>
          {showLivingChaos && (
            <>
              <ChaosManager />
              <EasterEggs />
              <FakeMenu />
            </>
          )}

          {showFlyers && (
            <>
              {!isMobilePerf && (
                <Suspense fallback={null}>
                  <FlyingBeggar />
                  <FlyingSage />
                  <SocialDrifters />
                </Suspense>
              )}
              <FlyingPen />
            </>
          )}
          {showLivingChaos && <FlyingMusic />}

          {showGuardians && <SilentGuardians />}

          <Navigation />

          <main
            style={{
              position: 'relative',
              zIndex: 10,
              minHeight: '100vh',
              transition: 'color 1.5s ease',
            }}
          >
            <AnimatedRoutes />
          </main>

          {!isQuiet && <Footer />}
        </div>
      </Shell>

      <MemorialVeil />

      {!isMobilePerf && !isQuiet && (
        <Suspense fallback={null}>
          <CustomCursor />
        </Suspense>
      )}
      {!isMobilePerf && !isQuiet && (
        <div className="noise-overlay" style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
      )}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <MemorialProvider>
        <AppShell />
      </MemorialProvider>
    </ThemeProvider>
  );
}

export default App;
