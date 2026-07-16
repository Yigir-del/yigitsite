import { useEffect, useState, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ReactLenis } from '@studio-freight/react-lenis';
import Background from './components/canvas/Background';
import ChaosManager from './components/events/ChaosManager';
import EasterEggs from './components/events/EasterEggs';
import FlyingPen from './components/events/FlyingPen';
import FlyingMusic from './components/events/FlyingMusic';
import FlyingBeggar from './components/events/FlyingBeggar';
import FlyingSage from './components/events/FlyingSage';
import SocialDrifters from './components/events/SocialDrifters';
import CustomCursor from './components/ui/CustomCursor';
import FakeMenu from './components/ui/FakeMenu';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';

import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Thoughts from './components/sections/Thoughts';
import NotesWall from './pages/NotesWall';
import Studio from './components/sections/Studio';
import Contact from './components/sections/Contact';

import { ThemeProvider } from './context/ThemeContext';
import ThemeSelector from './components/ui/ThemeSelector';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const [upsideDown, setUpsideDown] = useState(false);

  const toggleWorld = useCallback(() => {
    setUpsideDown((v) => !v);
  }, []);

  useEffect(() => {
    window.addEventListener('world-flip', toggleWorld);
    return () => window.removeEventListener('world-flip', toggleWorld);
  }, [toggleWorld]);

  // Flip only the content stage — keep starfield/atmosphere fixed so the theme never tears
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

  return (
    <ThemeProvider>
      <div className="atmosphere-fill" aria-hidden />
      <Background />
      <ThemeSelector />

      <ReactLenis root>
        <ScrollToTop />
        <div className="app-container">
          <ChaosManager />
          <EasterEggs />
          <FlyingBeggar />
          <FlyingSage />
          <FlyingPen />
          <FlyingMusic />
          <SocialDrifters />
          <CustomCursor />
          <FakeMenu />
          <Navigation />

          <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh', transition: 'color 1.5s ease' }}>
            <Routes>
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
            </Routes>
          </main>

          <Footer />
        </div>
      </ReactLenis>
      <div className="noise-overlay" style={{ mixBlendMode: 'overlay', pointerEvents: 'none' }} />
    </ThemeProvider>
  );
}

export default App;
