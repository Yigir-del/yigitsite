import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import SEOHead from '../../seo/SEOHead';
import { Home, FolderGit2 } from 'lucide-react';
import './NotFound.css';

// ── CUSTOM EVENTS (signals to background 3D universe scene) ──
const UNIVERSE_EVENTS = {
  COLLAPSE: 'universe-404-collapse',
  RESTORE:  'universe-404-restore',
} as const;

function fireEvent(name: string, detail?: unknown) {
  window.dispatchEvent(new CustomEvent(name, { detail }));
}

// ── STAR-FALL CANVAS OVERLAY ──
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

function useCollapseCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef  = useRef<StarParticle[]>([]);
  const rafRef    = useRef<number>(0);

  useEffect(() => {
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

      if (Math.random() < 0.35) {
        starsRef.current.push(spawnCollapseStar(w, h));
      }

      starsRef.current = starsRef.current.filter((s) => s.alpha > 0.01);

      for (const s of starsRef.current) {
        s.x += s.vx;
        s.y += s.vy;
        s.alpha -= s.decay;

        if (s.behavior === 'explode' && s.explodeParticles && s.alpha < 0.7) {
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
          ctx.globalAlpha = Math.max(0, s.alpha);
          const gradient = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 2);
          gradient.addColorStop(0, '#ffffff');
          gradient.addColorStop(1, 'rgba(180, 210, 255, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();

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
  }, []);

  return canvasRef;
}

// ── SVG AVATAR COMPONENTS ──
function BeggarAvatar() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="30" r="22" fill="#2a2030" stroke="var(--accent-pale-gray, #94a3b8)" strokeWidth="2" />
      <path d="M18 22 L28 25" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 22 L36 25" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="30" r="3" fill="#f8fafc" />
      <circle cx="40" cy="30" r="3" fill="#f8fafc" />
      <path d="M26 42 H40" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 52 H42 L40 58 H24 Z" fill="#8a7a60" stroke="#c4b8a0" strokeWidth="1" />
      <ellipse cx="32" cy="52" rx="10" ry="2.5" fill="#a89870" />
    </svg>
  );
}

function SageAvatar() {
  return (
    <svg width="52" height="52" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="28" r="20" fill="#1e2a32" stroke="var(--accent-pale-gray, #94a3b8)" strokeWidth="2" />
      <path d="M18 24 L28 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 24 L36 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <circle cx="24" cy="28" r="2.5" fill="#e2e8f0" />
      <circle cx="40" cy="28" r="2.5" fill="#e2e8f0" />
      <path d="M24 36 Q32 42 40 36" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M22 40 Q32 54 42 40" fill="#64748b" opacity="0.85" />
      <rect x="48" y="44" width="10" height="14" rx="1.5" fill="#c4b8a0" stroke="#8a7a60" strokeWidth="1" />
      <line x1="50" y1="48" x2="56" y2="48" stroke="#8a7a60" strokeWidth="0.8" />
      <line x1="50" y1="51" x2="56" y2="51" stroke="#8a7a60" strokeWidth="0.8" />
    </svg>
  );
}

// ── MAIN COMPONENT ──
export default function NotFound() {
  const collapseCanvasRef = useCollapseCanvas();

  useEffect(() => {
    // Fire 404 universe collapse so background moon splits and stars stream down
    fireEvent(UNIVERSE_EVENTS.COLLAPSE);

    return () => {
      fireEvent(UNIVERSE_EVENTS.RESTORE);
    };
  }, []);

  return (
    <>
      <SEOHead page="notFound" />

      {/* Falling stars background canvas overlay */}
      <canvas
        ref={collapseCanvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 40,
          pointerEvents: 'none',
          opacity: 1,
        }}
      />

      <section
        className="not-found-section"
        aria-label="Sayfa Bulunamadı"
        style={{
          minHeight: '82vh',
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
        <h1
          className="not-found-title"
          style={{
            fontSize: 'clamp(5.5rem, 16vw, 10rem)',
            fontWeight: 800,
            lineHeight: 1,
            margin: 0,
            color: 'var(--text-primary, #f8fafc)',
            letterSpacing: '4px',
            textShadow: '0 0 40px rgba(255, 255, 255, 0.15)',
          }}
        >
          404
        </h1>

        {/* MAIN HEADING */}
        <h2
          style={{
            fontFamily: 'var(--font-title, serif)',
            fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
            color: '#f43f5e',
            marginTop: '0.5rem',
            marginBottom: '0.8rem',
            textShadow: '0 0 25px rgba(244, 63, 94, 0.35)',
          }}
        >
          Yanlış Yere Geldin.
        </h2>

        {/* SUBTITLE */}
        <p style={{ color: 'var(--text-muted, #94a3b8)', maxWidth: '520px', fontSize: '1.1rem', lineHeight: 1.6, marginBottom: '2rem' }}>
          Aradığınız sayfa bu evrende mevcut değil ya da silinmiş olabilir.
        </p>

        {/* CHARACTERS DUO (BILGE & DILENCI) */}
        <div className="character-duo">
          {/* Bilge */}
          <div className="character-card">
            <div className="speech-bubble">Sanırım yine yolu kaybettin...</div>
            <SageAvatar />
            <span className="character-name">Bilge</span>
          </div>

          {/* Dilenci */}
          <div className="character-card">
            <div className="speech-bubble">Abi... Burası yanlış yer, ay bile ikiye yarıldı!</div>
            <BeggarAvatar />
            <span className="character-name">Dilenci</span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center', marginTop: '2.5rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.5rem',
              padding: '.85rem 1.8rem',
              borderRadius: '8px',
              background: 'var(--accent-muted-blue, #4b6b8b)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 20px rgba(75, 107, 139, 0.35)',
              transition: 'transform 0.2s, background 0.2s',
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
              display: 'inline-flex',
              alignItems: 'center',
              gap: '.5rem',
              padding: '.85rem 1.8rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border, rgba(255,255,255,0.15))',
              background: 'rgba(255,255,255,.05)',
              color: 'var(--text-primary, #f8fafc)',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'rgba(255,255,255,.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255,255,255,.05)';
            }}
          >
            <FolderGit2 size={18} aria-hidden />
            Projelerim
          </Link>
        </div>
      </section>
    </>
  );
}
