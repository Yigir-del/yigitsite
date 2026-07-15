import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { ReactLenis } from '@studio-freight/react-lenis';
import Background from './components/canvas/Background';
import ChaosManager from './components/events/ChaosManager';
import EasterEggs from './components/events/EasterEggs';
import FlyingPen from './components/events/FlyingPen';
import FlyingMusic from './components/events/FlyingMusic';
import SocialDrifters from './components/events/SocialDrifters';
import CustomCursor from './components/ui/CustomCursor';
import FakeMenu from './components/ui/FakeMenu';
import Navigation from './components/layout/Navigation';
import Footer from './components/layout/Footer';

// Sections & Pages
import Hero from './components/sections/Hero';
import About from './components/sections/About';
import Projects from './components/sections/Projects';
import Thoughts from './components/sections/Thoughts';
import NotesWall from './pages/NotesWall';
import Studio from './components/sections/Studio';
import Contact from './components/sections/Contact';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  return (
    <>
      <Background />
      <ReactLenis root>
        <ScrollToTop />
        <div className="app-container">
          <ChaosManager />
          <EasterEggs />
          <FlyingPen />
          <FlyingMusic />
          <SocialDrifters />
          <CustomCursor />
          <FakeMenu />
          <Navigation />
          
          <main style={{ position: 'relative', zIndex: 10, minHeight: '100vh' }}>
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <NotesWall />
                </>
              } />
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
      <div className="noise-overlay"></div>
    </>
  );
}

export default App;
