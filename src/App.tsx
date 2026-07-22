import { lazy, Suspense, useEffect, useState, useCallback, type ReactNode } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ReactLenis } from '@studio-freight/react-lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Background from './components/canvas/Background';
import FakeMenu from './components/ui/FakeMenu';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';
import Hero from './components/sections/Hero';
import NotesWall from './pages/NotesWall';
import { ThemeProvider } from './context/ThemeContext';
import { MemorialProvider, useMemorial } from './context/MemorialContext';
import ThemeSelector from './components/ui/ThemeSelector';
import { useIsMobilePerf } from './hooks/useIsMobilePerf';
import { useAtmosphereStage } from './hooks/useAtmosphereStage';
import PageTransition, { PageTransitionFallback } from './components/ui/PageTransition';
import { trackPageView } from './utils/analytics';

gsap.registerPlugin(ScrollTrigger);

const About = lazy(() => import('./components/sections/About'));
const Projects = lazy(() => import('./components/sections/Projects'));
const Thoughts = lazy(() => import('./components/sections/Thoughts'));
const Studio = lazy(() => import('./components/sections/Studio'));
const Contact = lazy(() => import('./components/sections/Contact'));
const Memorial = lazy(() => import('./components/sections/Memorial'));

const ChaosManager = lazy(() => import('./components/events/ChaosManager'));
const EasterEggs = lazy(() => import('./components/events/EasterEggs'));
const FlyingPen = lazy(() => import('./components/events/FlyingPen'));
const FlyingMusic = lazy(() => import('./components/events/FlyingMusic'));
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

/** Sync ScrollTrigger to smooth scroll without blocking the scroll thread. */
function ScrollTriggerSync() {
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        ScrollTrigger.update();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);
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
            <Route path="/miras" element={<Memorial />} />
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
  const { isQuiet } = useMemorial();
  const { ready } = useAtmosphereStage();

  const toggleWorld = useCallback(() => {
    if (isQuiet) return;
    setUpsideDown((v) => !v);
  }, [isQuiet]);

  useEffect(() => {
    window.addEventListener('world-flip', toggleWorld);
    return () => window.removeEventListener('world-flip', toggleWorld);
  }, [toggleWorld]);

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

  const showCharacters = !isQuiet && ready('characters');
  const showChaos = !isQuiet && ready('chaos');

  return (
    <>
      <div className="atmosphere-fill" aria-hidden />
      <Background hushed={isQuiet} />
      <ThemeSelector />

      <Shell>
        <ScrollToTop />
        <Analytics />
        {!isMobilePerf && <ScrollTriggerSync />}
        <div className={`app-container${isQuiet ? ' is-quiet' : ''}`}>
          {showChaos && (
            <Suspense fallback={null}>
              <ChaosManager />
              <EasterEggs />
            </Suspense>
          )}
          {!isQuiet && <FakeMenu />}

          {showCharacters && (
            <Suspense fallback={null}>
              <FlyingPen />
              <FlyingMusic />
              {!isMobilePerf && (
                <>
                  <FlyingBeggar />
                  <FlyingSage />
                  <SocialDrifters />
                </>
              )}
            </Suspense>
          )}

          {isQuiet && !isMobilePerf && (
            <Suspense fallback={null}>
              <SocialDrifters />
            </Suspense>
          )}

          <Navigation />

          <main
            style={{
              position: 'relative',
              zIndex: 10,
              minHeight: '100vh',
            }}
          >
            <AnimatedRoutes />
          </main>

          <Footer />
        </div>
      </Shell>

      {!isMobilePerf && !isQuiet && ready('characters') && (
        <Suspense fallback={null}>
          <CustomCursor />
        </Suspense>
      )}
      {!isMobilePerf && (
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
