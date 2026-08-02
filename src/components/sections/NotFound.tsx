import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../../seo/SEOHead';
import { Home, FolderGit2, RotateCcw } from 'lucide-react';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
import './NotFound.css';

// ── CUSTOM EVENTS (signals to existing world components) ──
const UNIVERSE_EVENTS = {
  COLLAPSE:  'universe-404-collapse',
  RESTORE:   'universe-404-restore',
  PAUSE:     'universe-404-pause',
} as const;

function fireEvent(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

// ── STAGE TYPES ──
type Stage =
  | 'PAGE_LOAD'
  | 'CHARACTERS_TALK'
  | 'SYSTEM_INTERRUPTION'
  | 'MAIN_WARNING'
  | 'COUNTDOWN'
  | 'WORLD_COLLAPSE'
  | 'FINAL_VOID'
  | 'USER_SAVED'
  | 'RARE_EVENT';

type RareStep = 'DOTS' | 'APPROACHING' | 'ARRIVED' | 'LEAVING';

// ── STAR-FALL CANVAS OVERLAY ──
// Paints individual falling / exploding / shooting stars on top of the
// Three.js scene without replacing its background.
interface StarParticle {
  x: number; y: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  decay: number;
  behavior: 'fall' | 'shoot' | 'explode' | 'fade';
  explodeParticles?: Array<{ x: number; y: number; vx: number; vy: number; a: number; size: number }>;
}

function spawnCollapseStar(w: number, h: number): StarParticle {
  const x = Math.random() * w;
  const y = Math.random() * h * 0.6;
  const behavior = (['fall', 'shoot', 'explode', 'fade'] as const)[Math.floor(Math.random() * 4)];
  return {
    x, y,
    vx: behavior === 'shoot' ? (Math.random() - 0.5) * 18 : (Math.random() - 0.5) * 0.5,
    vy: behavior === 'fall'  ? Math.random() * 3 + 1.5
      : behavior === 'shoot' ? (Math.random() - 0.5) * 8
      : 0,
    size: Math.random() * 2.5 + 1,
    alpha: 1,
    decay: behavior === 'fade' ? 0.008 : 0.015,
    behavior,
    explodeParticles: behavior === 'explode'
      ? Array.from({ length: 10 }, () => ({
          x: 0, y: 0,
          vx: (Math.random() - 0.5) * 4,
          vy: (Math.random() - 0.5) * 4,
          a: 1,
          size: Math.random() * 1.2 + 0.3,
        }))
      : undefined,
  };
}

function useCollapseCanvas(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef  = useRef<StarParticle[]>([]);
  const rafRef    = useRef<number>(0);
  const tickCountRef = useRef<number>(0);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(rafRef.current);
      starsRef.current = [];
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize, { passive: true });

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);

      tickCountRef.current += 1;

      // Spawn new collapse star every ~6 frames for first 4 seconds
      if (tickCountRef.current < 240 && Math.random() < 0.4) {
        starsRef.current.push(spawnCollapseStar(w, h));
      }

      starsRef.current = starsRef.current.filter((s) => s.alpha > 0.01);

      for (const s of starsRef.current) {
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.behavior === 'explode' && s.explodeParticles && s.alpha < 0.7) {
          // Trigger radial explosion
          ctx.save();
          for (const p of s.explodeParticles) {
            p.x += p.vx;
            p.y += p.vy;
            p.a -= 0.025;
            if (p.a <= 0) continue;
            ctx.globalAlpha = Math.max(0, p.a);
            ctx.fillStyle = '#d8e6ff';
            ctx.beginPath();
            ctx.arc(s.x + p.x, s.y + p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        } else {
          // Draw the star itself
          ctx.globalAlpha = Math.max(0, s.alpha);
          const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(1, 'rgba(180, 210, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();

          // Tail for shooting stars
          if (s.behavior === 'shoot') {
            ctx.globalAlpha = Math.max(0, s.alpha * 0.4);
            ctx.strokeStyle = '#d8e6ff';
            ctx.lineWidth   = s.size * 0.5;
            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x - s.vx * 8, s.y - s.vy * 8);
            ctx.stroke();
          }
        }
      }

      ctx.globalAlpha = 1;
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  return canvasRef;
}

// ── SVG AVATAR COMPONENTS ──
function BeggarAvatar({ panic = false, shrug = false }: { panic?: boolean; shrug?: boolean }) {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="30" r="22" fill="#2a2030" stroke="var(--accent-pale-gray)" strokeWidth="2" />
      <path d="M18 22 L28 25" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 22 L36 25" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      {shrug && (
        <>
          <path d="M10 44 L20 38" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M54 44 L44 38" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        </>
      )}
      {panic ? (
        <>
          <circle cx="24" cy="30" r="4.5" fill="#fff" />
          <circle cx="40" cy="30" r="4.5" fill="#fff" />
          <circle cx="24" cy="30" r="2"   fill="#000" />
          <circle cx="40" cy="30" r="2"   fill="#000" />
          <ellipse cx="32" cy="42" rx="6" ry="7" fill="#f8fafc" stroke="#8a7a60" strokeWidth="1.5" />
        </>
      ) : (
        <>
          <circle cx="24" cy="30" r="3" fill="#f8fafc" />
          <circle cx="40" cy="30" r="3" fill="#f8fafc" />
          <path d="M26 42 H40" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      <path d="M22 52 H42 L40 58 H24 Z" fill="#8a7a60" stroke="#c4b8a0" strokeWidth="1" />
      <ellipse cx="32" cy="52" rx="10" ry="2.5" fill="#a89870" />
    </svg>
  );
}

function SageAvatar({ eyesClosed = false, smile = false }: { eyesClosed?: boolean; smile?: boolean }) {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="28" r="20" fill="#1e2a32" stroke="var(--accent-pale-gray)" strokeWidth="2" />
      <path d="M18 24 L28 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 24 L36 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      {eyesClosed ? (
        <>
          <path d="M20 28 Q24 31 28 28" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          <path d="M36 28 Q40 31 44 28" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx="24" cy="28" r="2.5" fill="#e2e8f0" />
          <circle cx="40" cy="28" r="2.5" fill="#e2e8f0" />
        </>
      )}
      {smile ? (
        <path d="M24 36 Q32 42 40 36" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" fill="none" />
      ) : (
        <path d="M26 37 H38" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      )}
      <path d="M22 40 Q32 54 42 40" fill="#64748b" opacity="0.85" />
      <rect x="48" y="44" width="10" height="14" rx="1.5" fill="#c4b8a0" stroke="#8a7a60" strokeWidth="1" />
      <line x1="50" y1="48" x2="56" y2="48" stroke="#8a7a60" strokeWidth="0.8" />
      <line x1="50" y1="51" x2="56" y2="51" stroke="#8a7a60" strokeWidth="0.8" />
    </svg>
  );
}

// ── DOM HELPER: apply/remove classes to universe elements ──
const selectors = {
  nav:      '.site-nav',
  footer:   '.site-footer',
  pyramid:  '.sacred-pyramid-wrapper',
};

function universeCollapseNav() { document.querySelector(selectors.nav)?.classList.add('reality-collapsed-nav'); }
function universeCollapseFooter() { document.querySelector(selectors.footer)?.classList.add('reality-collapsed-footer'); }
function universeCollapsePyramid() { document.querySelector(selectors.pyramid)?.classList.add('reality-collapsed-pyramid'); }

function universeRestoreAll() {
  document.querySelector(selectors.nav)?.classList.remove(
    'reality-disabled-nav', 'reality-collapsed-nav',
  );
  document.querySelector(selectors.footer)?.classList.remove('reality-collapsed-footer');
  document.querySelector(selectors.pyramid)?.classList.remove('reality-collapsed-pyramid');
  document.body.classList.remove('cinema-shake');
}

// ── MAIN COMPONENT ──
export default function NotFound() {
  const isMobilePerf = useIsMobilePerf();
  const navigate     = useNavigate();

  const [isRare] = useState(() => {
    if (typeof window === 'undefined') return false;
    return new URLSearchParams(window.location.search).has('rare') || Math.random() < 0.01;
  });

  const [stage,        setStage]        = useState<Stage>('PAGE_LOAD');
  const [rareStep,     setRareStep]     = useState<RareStep>('DOTS');
  const [beggarSpeech, setBeggarSpeech] = useState<string | null>(null);
  const [sageSpeech,   setSageSpeech]   = useState<string | null>(null);
  const [sageEyesClosed, setSageEyesClosed] = useState(false);
  const [sageSmile,       setSageSmile]     = useState(false);

  // Final-void text typewriter
  const [showCursor,    setShowCursor]    = useState(false);
  const [typedText,     setTypedText]     = useState('');
  const [showReturnBtn, setShowReturnBtn] = useState(false);

  // Collapse canvas active flag
  const collapseCanvasRef = useCollapseCanvas(stage === 'WORLD_COLLAPSE');

  const timersRef = useRef<(number | ReturnType<typeof setInterval>)[]>([]);
  const addTimer = useCallback((fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  }, []);
  const clearAllTimers = useCallback(() => {
    timersRef.current.forEach((id) => clearTimeout(id as number));
    timersRef.current = [];
  }, []);

  // ── DESKTOP SCRIPTED SEQUENCE ──
  useEffect(() => {
    if (isMobilePerf) return;
    if (isRare) {
      setStage('RARE_EVENT');
      addTimer(() => setRareStep('APPROACHING'), 5000);
      addTimer(() => setRareStep('ARRIVED'),     20000);
      addTimer(() => setRareStep('LEAVING'),     23500);
      addTimer(() => { universeRestoreAll(); navigate('/', { replace: true }); }, 28500);
      return () => clearAllTimers();
    }

    // Cinematic Timeline:
    // T = 2.0s – Bilge speaks
    addTimer(() => {
      setStage('CHARACTERS_TALK');
      setSageSpeech('Sanırım yine yolu kaybetmiş.');
    }, 2000);

    // T = 3.0s – Bilge chatbox closes, Dilenci speaks immediately after
    addTimer(() => {
      setSageSpeech(null);
      setBeggarSpeech('Abi... burası normal görünmüyor.');
    }, 3000);

    // T = 5.0s – Dilenci chatbox closes
    addTimer(() => {
      setBeggarSpeech(null);
    }, 5000);

    // T = 5.5s – Pause duration before collapse (preserves original timeskip timing)
    addTimer(() => {
      setStage('MAIN_WARNING');
    }, 5500);

    // T = 9.5s – WORLD COLLAPSE
    addTimer(() => {
      setStage('WORLD_COLLAPSE');
      setBeggarSpeech(null);
      setSageSpeech(null);

      // DOM objects collapse physically
      universeCollapseNav();
      universeCollapseFooter();
      universeCollapsePyramid();

      // Signal existing floating components to destroy themselves
      fireEvent(UNIVERSE_EVENTS.COLLAPSE);

      // 3s later: FINAL VOID
      addTimer(() => {
        setStage('FINAL_VOID');
        window.scrollTo({ top: 0, behavior: 'instant' });
        // 5s of total silence
        addTimer(() => setShowCursor(true), 5000);
        // 10s total: typewriter
        addTimer(() => {
          const full = 'Evren seni geri göndermeyi uygun gördü.';
          let idx = 0;
          const ti = window.setInterval(() => {
            idx += 1;
            setTypedText(full.slice(0, idx));
            if (idx >= full.length) {
              clearInterval(ti);
              addTimer(() => setShowReturnBtn(true), 600);
            }
          }, 60);
          timersRef.current.push(ti);
        }, 10000);
      }, 4000);
    }, 9500);

    return () => {
      clearAllTimers();
      universeRestoreAll();
      fireEvent(UNIVERSE_EVENTS.RESTORE);
    };
  }, [isMobilePerf, isRare, navigate, addTimer, clearAllTimers]);

  // ── USER CLICK: RETURN BEFORE COLLAPSE ──
  const handleUserSaved = useCallback(() => {
    clearAllTimers();
    setStage('USER_SAVED');
    setBeggarSpeech('Bu seferlik kurtuldun.');
    setSageSpeech('Hatalar bazen doğru yolu gösterir.');
    setSageSmile(true);
    universeRestoreAll();
    fireEvent(UNIVERSE_EVENTS.RESTORE);
    addTimer(() => navigate('/', { replace: true }), 1800);
  }, [clearAllTimers, navigate, addTimer]);

  // ── RETURN SEQUENCE (rebuild universe in-place) ──
  const handleReturnSequence = useCallback(() => {
    clearAllTimers();
    setShowReturnBtn(false);
    setTypedText('');
    setShowCursor(false);
    setStage('PAGE_LOAD');

    // Signal components to restore themselves
    universeRestoreAll();
    fireEvent(UNIVERSE_EVENTS.RESTORE);
    setSageEyesClosed(false);
    setSageSmile(true);
    setSageSpeech(null);
    addTimer(() => {
      setBeggarSpeech('Heh... Toparlamışlar.');
    }, 900);
    addTimer(() => navigate('/', { replace: true }), 3000);
  }, [clearAllTimers, navigate, addTimer]);

  // ── MOBILE FALLBACK ──
  if (isMobilePerf) {
    return (
      <section className="not-found-section" aria-label="Sayfa Bulunamadı"
        style={{ minHeight: '75vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '4rem 2rem' }}>
        <SEOHead page="notFound" />
        <h1 className="glitch" data-text="404"
          style={{ fontSize: 'clamp(5rem, 15vw, 9rem)', fontWeight: 800, lineHeight: 1, margin: 0, letterSpacing: '4px' }}>
          404
        </h1>
        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '1rem' }}>Sayfa Bulunamadı</h2>
        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Aradığınız adres silinmiş, değiştirilmiş veya hiç var olmamış olabilir.
        </p>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.8rem 1.5rem', borderRadius: '8px', background: 'var(--accent-muted-blue)', color: '#fff', textDecoration: 'none', fontWeight: 500 }}>
            <Home size={18} aria-hidden />Ana Sayfaya Dön
          </Link>
          <Link to="/projeler" style={{ display: 'inline-flex', alignItems: 'center', gap: '.5rem', padding: '.8rem 1.5rem', borderRadius: '8px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,.05)', color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500 }}>
            <FolderGit2 size={18} aria-hidden />Projelerim
          </Link>
        </div>
      </section>
    );
  }

  // ── 1% RARE EVENT OVERLAY ──
  if (isRare && stage === 'RARE_EVENT') {
    return (
      <div className="rare-overlay">
        <SEOHead page="notFound" />
        {rareStep === 'DOTS' && (
          <div style={{ fontSize: '2rem', letterSpacing: '8px', opacity: 0.8 }}>...</div>
        )}
        {(rareStep === 'APPROACHING' || rareStep === 'ARRIVED' || rareStep === 'LEAVING') && (
          <div className="rare-beggar-container">
            <div className={`rare-beggar-figure ${rareStep === 'APPROACHING' ? 'rare-approaching' : rareStep === 'LEAVING' ? 'rare-leaving' : ''}`}>
              <BeggarAvatar shrug={rareStep === 'LEAVING'} />
              {rareStep === 'ARRIVED' && (
                <div className="speech-bubble" style={{ bottom: '115%', left: '50%', transform: 'translateX(-50%)' }}>
                  Adresi ben de bulamadım.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── FINAL VOID: text floats IN the existing space scene ──
  // Using 100dvh transparent section (document flow) instead of position:fixed
  // because Lenis smooth scroll uses CSS transforms which break fixed positioning.
  if (stage === 'FINAL_VOID') {
    return (
      <section
        style={{
          minHeight: '100dvh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '2rem',
          background: 'transparent', // ← universe stays visible behind
          position: 'relative',
          zIndex: 10,
        }}
      >
        <SEOHead page="notFound" />

        {showCursor && typedText === '' && (
          <span className="blinking-cursor" />
        )}

        {typedText !== '' && (
          <p
            style={{
              fontFamily: 'var(--font-title, serif)',
              fontSize: 'clamp(1.4rem, 3.8vw, 2.6rem)',
              lineHeight: 1.5,
              color: 'rgba(248, 250, 252, 0.92)',
              textShadow: '0 0 40px rgba(148, 163, 184, 0.5)',
              maxWidth: '700px',
              textAlign: 'center',
              padding: '0 2rem',
              margin: 0,
              animation: 'voidTextFadeIn 2s ease forwards',
            }}
          >
            {typedText}
            {!showReturnBtn && <span className="blinking-cursor" />}
          </p>
        )}

        {showReturnBtn && (
          <button
            onClick={handleReturnSequence}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.95rem 2.4rem',
              borderRadius: '8px',
              background: 'rgba(75, 107, 139, 0.85)',
              backdropFilter: 'blur(8px)',
              color: '#fff',
              border: '1px solid rgba(148, 163, 184, 0.3)',
              fontSize: '1.05rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(75, 107, 139, 0.45)',
              marginTop: '2.5rem',
              transition: 'transform 0.2s, background 0.2s',
              animation: 'speechPop 0.6s ease forwards',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          >
            <RotateCcw size={19} aria-hidden />
            Gerçekliğe Dön
          </button>
        )}
      </section>
    );
  }

  // ── DESKTOP FULL SCRIPTED CINEMATIC EXPERIENCE ──
  const isCollapsing = stage === 'WORLD_COLLAPSE';

  return (
    <>
      <SEOHead page="notFound" />

      {/* Star-fall canvas overlay — transparent background, only draws falling particles */}
      <canvas
        ref={collapseCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          pointerEvents: 'none',
          opacity: isCollapsing ? 1 : 0,
          transition: 'opacity 0.6s ease',
        }}
      />

      {/* ── MAIN 404 SECTION ── */}
      <section
        className="not-found-section"
        aria-label="Sayfa Bulunamadı"
        style={{
          minHeight: '78vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '3rem 2rem',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* 404 TITLE */}
        <div
          className={isCollapsing ? 'shatter-piece-1' : ''}
          style={{ position: 'relative', marginBottom: '1rem' }}
        >
          <h1
            className="glitch-vibrate"
            data-text="404"
            style={{
              fontSize: 'clamp(5.5rem, 16vw, 10rem)',
              fontWeight: 800,
              lineHeight: 1,
              margin: 0,
              color: 'var(--text-primary)',
              letterSpacing: '4px',
              transition: 'color 0.5s ease',
            }}
          >
            404
          </h1>
        </div>

        {/* SUBTITLE */}
        <h2
          className={isCollapsing ? 'shatter-piece-2' : ''}
          style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '1.5rem' }}
        >
          Sayfa Bulunamadı
        </h2>

        {/* CHARACTERS DUO */}
        <div className={`character-duo${isCollapsing ? ' shatter-piece-3' : ''}`}>
          {/* Bilge */}
          <div className="character-card">
            {sageSpeech && <div className="speech-bubble">{sageSpeech}</div>}
            <SageAvatar eyesClosed={sageEyesClosed} smile={sageSmile} />
          </div>

          {/* Dilenci */}
          <div className="character-card">
            {beggarSpeech && <div className="speech-bubble">{beggarSpeech}</div>}
            <BeggarAvatar panic={isCollapsing} />
          </div>
        </div>

        {/* ACTION BUTTONS */}
        {!isCollapsing && (
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2rem' }}>
            <Link
              to="/"
              onClick={(e) => {
                if (stage !== 'PAGE_LOAD') { e.preventDefault(); handleUserSaved(); }
              }}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                padding: '.8rem 1.6rem', borderRadius: '8px',
                background: 'var(--accent-muted-blue, #4b6b8b)', color: '#fff',
                textDecoration: 'none', fontWeight: 500,
                transition: 'transform 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <Home size={18} aria-hidden />
              Ana Sayfaya Dön
            </Link>

            <Link
              to="/projeler"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '.5rem',
                padding: '.8rem 1.6rem', borderRadius: '8px',
                border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,.05)',
                color: 'var(--text-primary)', textDecoration: 'none', fontWeight: 500,
                transition: 'transform 0.2s, background 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = 'rgba(255,255,255,.1)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = 'rgba(255,255,255,.05)'; }}
            >
              <FolderGit2 size={18} aria-hidden />
              Projelerim
            </Link>
          </div>
        )}
      </section>
    </>
  );
}
