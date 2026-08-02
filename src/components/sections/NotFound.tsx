import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../../seo/SEOHead';
import { Home, FolderGit2, RotateCcw } from 'lucide-react';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
import './NotFound.css';

// ── SVG Avatar Components ──

function BeggarAvatar({ panic = false }: { panic?: boolean }) {
  return (
    <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="30" r="22" fill="#2a2030" stroke="var(--accent-pale-gray)" strokeWidth="2" />
      {/* Eyebrows */}
      <path d="M18 22 L28 25" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 22 L36 25" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      
      {panic ? (
        /* Wide Panicking Eyes */
        <>
          <circle cx="24" cy="30" r="4.5" fill="#fff" />
          <circle cx="40" cy="30" r="4.5" fill="#fff" />
          <circle cx="24" cy="30" r="2" fill="#000" />
          <circle cx="40" cy="30" r="2" fill="#000" />
          {/* Panicking Open Mouth */}
          <ellipse cx="32" cy="42" rx="6" ry="7" fill="#f8fafc" stroke="#8a7a60" strokeWidth="1.5" />
        </>
      ) : (
        /* Normal Expressive Eyes */
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

function SageAvatar({ eyesClosed = false }: { eyesClosed?: boolean }) {
  return (
    <svg width="44" height="44" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="28" r="20" fill="#1e2a32" stroke="var(--accent-pale-gray)" strokeWidth="2" />
      <path d="M18 24 L28 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 24 L36 22" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      
      {eyesClosed ? (
        /* Calm Closed Eyes Lines (- -) */
        <>
          <path d="M20 28 Q24 31 28 28" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          <path d="M36 28 Q40 31 44 28" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        </>
      ) : (
        /* Normal Eyes */
        <>
          <circle cx="24" cy="28" r="2.5" fill="#e2e8f0" />
          <circle cx="40" cy="28" r="2.5" fill="#e2e8f0" />
        </>
      )}

      <path d="M26 37 H38" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
      <path d="M22 40 Q32 54 42 40" fill="#64748b" opacity="0.85" />
      <rect x="48" y="44" width="10" height="14" rx="1.5" fill="#c4b8a0" stroke="#8a7a60" strokeWidth="1" />
      <line x1="50" y1="48" x2="56" y2="48" stroke="#8a7a60" strokeWidth="0.8" />
      <line x1="50" y1="51" x2="56" y2="51" stroke="#8a7a60" strokeWidth="0.8" />
    </svg>
  );
}

// ── Random Dialogue Variants ──
const BEGGAR_INITIAL_QUOTES = [
  "Nereye geldin sen?",
  "Google bile seni buraya göndermemeliydi.",
  "Bu URL biraz fazla yaratıcı olmuş.",
  "Burada hiçbir şey yok.",
  "Yıldızlara bile sorsak bu adresi bilmiyorlar.",
  "Sunucu bile şaşırdı.",
  "Bunu bilerek yaptıysan saygı duydum.",
  "404 değil. Merak fazlası.",
  "Evren seni yanlış koordinatlara ışınladı.",
  "Bazı yollar hiçbir yere çıkmaz.",
];

export default function NotFound() {
  const isMobilePerf = useIsMobilePerf();
  const navigate = useNavigate();

  // 1% Rare Event check (or ?rare=1 query parameter for developer testing)
  const [isRare] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.has('rare')) return true;
    return Math.random() < 0.01;
  });

  // Stage Machine State
  const [stage, setStage] = useState<
    | 'INITIAL'
    | 'CHARACTERS_TALK'
    | 'SYSTEM_CONTROL'
    | 'THE_WARNING'
    | 'COUNTDOWN'
    | 'COLLAPSED'
    | 'FINAL_VOID'
    | 'USER_SAVED'
    | 'RARE_EVENT'
  >('INITIAL');

  // Random Beggar quote selection
  const [beggarQuote] = useState(() => {
    return BEGGAR_INITIAL_QUOTES[Math.floor(Math.random() * BEGGAR_INITIAL_QUOTES.length)];
  });

  const [beggarSpeech, setBeggarSpeech] = useState<string | null>(null);
  const [sageSpeech, setSageSpeech] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [warningStep, setWarningStep] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(5);
  const [shakeKey, setShakeKey] = useState<number>(0);
  const [sageEyesClosed, setSageEyesClosed] = useState<boolean>(false);
  const [finalTextVisible, setFinalTextVisible] = useState<boolean>(false);
  const [finalButtonVisible, setFinalButtonVisible] = useState<boolean>(false);

  // Rare Event Steps: 'DOTS' -> 'APPROACHING' -> 'ARRIVED' -> 'LEAVING' -> 'DONE'
  const [rareStep, setRareStep] = useState<'DOTS' | 'APPROACHING' | 'ARRIVED' | 'LEAVING' | 'DONE'>('DOTS');

  // Store active timer IDs for cleanup
  const timersRef = useRef<number[]>([]);

  const addTimer = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
    return id;
  };

  const clearAllTimers = () => {
    timersRef.current.forEach((id) => window.clearTimeout(id));
    timersRef.current = [];
  };

  // Helper to remove reality collapse DOM classes
  const cleanupDOMClasses = () => {
    document.querySelector('.site-nav')?.classList.remove('reality-disabled-nav', 'reality-collapsed-nav');
    document.querySelector('.site-footer')?.classList.remove('reality-collapsed-footer');
    document.querySelector('.wireframe-pyramid-container')?.classList.remove('reality-collapsed-pyramid');
    document.body.classList.remove('cinema-shake');
  };

  // ── Desktop Timeline Sequence ──
  useEffect(() => {
    // If mobile, do nothing (keep mobile static 404)
    if (isMobilePerf) return;

    if (isRare) {
      setStage('RARE_EVENT');
      setRareStep('DOTS');

      // 1% Rare Event Timeline
      addTimer(() => setRareStep('APPROACHING'), 5000);
      addTimer(() => setRareStep('ARRIVED'), 20000);
      addTimer(() => setRareStep('LEAVING'), 23500);
      addTimer(() => {
        setRareStep('DONE');
        cleanupDOMClasses();
        navigate('/', { replace: true });
      }, 29000);

      return () => clearAllTimers();
    }

    // Normal Cinematic 404 Experience Timeline:
    // 0s - 2.5s: INITIAL
    // 2.5s: Beggar speaks
    addTimer(() => {
      setStage('CHARACTERS_TALK');
      setBeggarSpeech(beggarQuote);
    }, 2500);

    // 3.5s: Sage speaks
    addTimer(() => {
      setSageSpeech('Sanırım yine yolu kaybetmiş.');
    }, 3600);

    // 5.5s: SYSTEM_CONTROL
    addTimer(() => {
      setStage('SYSTEM_CONTROL');
      document.querySelector('.site-nav')?.classList.add('reality-disabled-nav');

      // Add terminal logs sequentially
      addTimer(() => setTerminalLogs(['> Koordinatlar taranıyor...']), 100);
      addTimer(() => setTerminalLogs((prev) => [...prev, '> Konum doğrulanamadı.']), 800);
      addTimer(() => setTerminalLogs((prev) => [...prev, '> Bu adres mevcut değil.']), 1500);
      addTimer(() => setTerminalLogs((prev) => [...prev, '> Gerçeklik hatası tespit edildi.']), 2200);
    }, 5500);

    // 8.5s: THE_WARNING
    addTimer(() => {
      setStage('THE_WARNING');
      setWarningStep(1); // "Yanlış yere geldin. Şimdi sessizce geri dön."
    }, 8500);

    // 9.5s: Warning second line
    addTimer(() => {
      setWarningStep(2); // "Yoksa gerçeklik seni fark edecek."
    }, 9600);

    // 11.0s: COUNTDOWN
    addTimer(() => {
      setStage('COUNTDOWN');
      setCountdown(5);

      // Countdown Ticks: 5 -> 4 -> 3 -> 2 -> 1 -> 0
      let current = 5;
      const countInterval = window.setInterval(() => {
        current -= 1;
        if (current >= 0) {
          setCountdown(current);
          setShakeKey((k) => k + 1);

          // Camera shake effect
          document.body.classList.add('cinema-shake');
          setTimeout(() => document.body.classList.remove('cinema-shake'), 450);
        }

        if (current <= 0) {
          window.clearInterval(countInterval);
          // 16.0s: COLLAPSED
          setStage('COLLAPSED');
          setBeggarSpeech('BEN DEMİŞTİM!');
          setSageSpeech(null);
          setSageEyesClosed(true);

          // Apply DOM collapse classes
          document.querySelector('.site-nav')?.classList.add('reality-collapsed-nav');
          document.querySelector('.site-footer')?.classList.add('reality-collapsed-footer');
          document.querySelector('.wireframe-pyramid-container')?.classList.add('reality-collapsed-pyramid');

          // 20.0s (4s after collapse): FINAL_VOID
          addTimer(() => {
            setStage('FINAL_VOID');

            // Wait 3.5s in total emptiness, then fade in sentence and button
            addTimer(() => setFinalTextVisible(true), 3500);
            addTimer(() => setFinalButtonVisible(true), 5000);
          }, 4000);
        }
      }, 1000);

      timersRef.current.push(countInterval);
    }, 11000);

    return () => {
      clearAllTimers();
      cleanupDOMClasses();
    };
  }, [isMobilePerf, isRare, beggarQuote, navigate]);

  // Handle User Clicking "Ana Sayfaya Dön" before countdown ends
  const handleUserSaved = () => {
    clearAllTimers();
    setStage('USER_SAVED');
    setBeggarSpeech('Bunu beklemiyordum.');
    setSageSpeech('Hatalar bazen doğru yolu gösterir.');
    cleanupDOMClasses();

    addTimer(() => {
      navigate('/', { replace: true });
    }, 1600);
  };

  // Handle Restore Reality Button click in Final Void
  const handleRestoreReality = () => {
    cleanupDOMClasses();
    navigate('/', { replace: true });
  };

  // ── MOBILE FALLBACK ──
  if (isMobilePerf) {
    return (
      <section
        className="not-found-section"
        aria-label="Sayfa Bulunamadı"
        style={{
          minHeight: '75vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4rem 2rem',
        }}
      >
        <SEOHead page="notFound" />
        <h1
          className="glitch"
          data-text="404"
          style={{
            fontSize: 'clamp(5rem, 15vw, 9rem)',
            fontWeight: 800,
            lineHeight: 1,
            margin: 0,
            color: 'var(--text-primary)',
            letterSpacing: '4px',
          }}
        >
          404
        </h1>

        <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.2rem)', marginBottom: '1rem', color: 'var(--text-primary)' }}>
          Sayfa Bulunamadı
        </h2>

        <p style={{ color: 'var(--text-muted)', maxWidth: '480px', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2.5rem' }}>
          Aradığınız adres silinmiş, değiştirilmiş veya hiç var olmamış olabilir.
        </p>

        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              background: 'var(--accent-muted-blue, #3b82f6)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <Home size={18} aria-hidden="true" />
            Ana Sayfaya Dön
          </Link>

          <Link
            to="/projeler"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.5rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.15))',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 500,
            }}
          >
            <FolderGit2 size={18} aria-hidden="true" />
            Projelerim
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
            <div
              className={`rare-beggar-figure ${
                rareStep === 'APPROACHING'
                  ? 'rare-approaching'
                  : rareStep === 'LEAVING'
                  ? 'rare-leaving'
                  : ''
              }`}
            >

              <BeggarAvatar />

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

  // ── FINAL VOID STAGE (Interface Collapse Complete) ──
  if (stage === 'FINAL_VOID') {
    return (
      <section
        className="final-void-section"
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4rem 2rem',
          color: 'var(--text-primary)',
        }}
      >
        <SEOHead page="notFound" />
        
        {!finalTextVisible && (
          <div style={{ opacity: 0.5, fontSize: '1.2rem' }}>
            <span className="blinking-cursor" />
          </div>
        )}

        {finalTextVisible && (
          <div
            style={{
              opacity: 1,
              transition: 'opacity 2s ease',
              maxWidth: '600px',
              marginBottom: '3rem',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-title, serif)',
                fontSize: 'clamp(1.4rem, 3.5vw, 2.2rem)',
                lineHeight: 1.5,
                color: 'var(--text-main, #f8fafc)',
              }}
            >
              Evren seni geri göndermeyi uygun gördü.
            </p>
          </div>
        )}

        {finalButtonVisible && (
          <button
            onClick={handleRestoreReality}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.9rem 2rem',
              borderRadius: '8px',
              background: 'var(--accent-muted-blue, #4b6b8b)',
              color: '#fff',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(75, 107, 139, 0.4)',
              transition: 'transform 0.2s, background 0.2s',
              animation: 'speechPop 0.5s ease forwards',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.03)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          >
            <RotateCcw size={18} aria-hidden="true" />
            Gerçekliğe Dön
          </button>
        )}
      </section>
    );
  }

  // ── DESKTOP FULL CINEMATIC INTERACTIVE EXPERIENCE ──
  const isVibrating = stage === 'COUNTDOWN' || stage === 'THE_WARNING';

  return (
    <section
      key={shakeKey}
      className={`not-found-section ${stage === 'COUNTDOWN' ? 'panel-vibrating' : ''}`}
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
        transition: 'opacity 1s ease',
        opacity: stage === 'COLLAPSED' ? 0.3 : 1,
      }}
    >
      <SEOHead page="notFound" />

      {/* ── Normal 404 Title ── */}
      <div style={{ position: 'relative', marginBottom: '1rem' }}>
        <h1
          className={`glitch-vibrate ${isVibrating ? 'is-vibrating' : ''}`}
          data-text="404"
          style={{
            fontSize: 'clamp(5.5rem, 16vw, 10rem)',
            fontWeight: 800,
            lineHeight: 1,
            margin: 0,
            color: stage === 'COUNTDOWN' ? '#f43f5e' : 'var(--text-primary)',
            letterSpacing: '4px',
            transition: 'color 0.5s ease',
          }}
        >
          404
        </h1>
      </div>

      {/* ── Subtitle ── */}
      {stage !== 'THE_WARNING' && stage !== 'COUNTDOWN' && (
        <h2
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
          }}
        >
          Sayfa Bulunamadı
        </h2>
      )}

      {/* ── Interactive Characters Duo (The Beggar & The Sage) ── */}
      <div className="character-duo">
        {/* The Beggar */}
        <div className="character-card">
          {beggarSpeech && <div className="speech-bubble">{beggarSpeech}</div>}
          <BeggarAvatar panic={stage === 'COLLAPSED'} />
        </div>

        {/* The Sage */}
        <div className="character-card">
          {sageSpeech && <div className="speech-bubble">{sageSpeech}</div>}
          <SageAvatar eyesClosed={sageEyesClosed} />
        </div>
      </div>

      {/* ── Stage: SYSTEM_CONTROL (Terminal HUD) ── */}
      {stage === 'SYSTEM_CONTROL' && (
        <div className="terminal-hud">
          {terminalLogs.map((log, index) => (
            <div key={index} className="terminal-hud__line">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* ── Stage: THE_WARNING ── */}
      {stage === 'THE_WARNING' && (
        <div style={{ marginBlock: '1.5rem', animation: 'speechPop 0.4s ease forwards' }}>
          <h2
            style={{
              fontFamily: 'var(--font-title, serif)',
              fontSize: 'clamp(2rem, 5vw, 3.2rem)',
              color: '#f43f5e',
              marginBottom: '0.8rem',
              letterSpacing: '1px',
              textShadow: '0 0 25px rgba(244, 63, 94, 0.4)',
            }}
          >
            Yanlış yere geldin.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', marginBottom: '0.8rem' }}>
            Şimdi sessizce geri dön.
          </p>
          {warningStep >= 2 && (
            <p
              style={{
                color: '#f8fafc',
                fontSize: '1.1rem',
                fontStyle: 'italic',
                animation: 'speechPop 0.4s ease forwards',
              }}
            >
              Yoksa gerçeklik seni fark edecek.
            </p>
          )}
        </div>
      )}

      {/* ── Stage: COUNTDOWN ── */}
      {stage === 'COUNTDOWN' && (
        <div style={{ marginBlock: '1rem' }}>
          <div className="countdown-display">{countdown}</div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', letterSpacing: '1px' }}>
            GERÇEKLİK ÇÖKÜYOR...
          </p>
        </div>
      )}

      {/* ── Action Buttons ── */}
      {stage !== 'COLLAPSED' && (
        <div
          style={{
            display: 'flex',
            gap: '1rem',
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginTop: '2rem',
          }}
        >
          <Link
            to="/"
            onClick={(e) => {
              // If in interactive sequence before collapse, intercept click to trigger saved reaction
              if (stage !== 'INITIAL') {
                e.preventDefault();
                handleUserSaved();
              }
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.6rem',
              borderRadius: '8px',
              background: 'var(--accent-muted-blue, #4b6b8b)',
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 500,
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
              transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <Home size={18} aria-hidden="true" />
            Ana Sayfaya Dön
          </Link>

          <Link
            to="/projeler"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.8rem 1.6rem',
              borderRadius: '8px',
              border: '1px solid var(--glass-border, rgba(255, 255, 255, 0.15))',
              background: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontWeight: 500,
              transition: 'transform 0.2s, background 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
            }}
          >
            <FolderGit2 size={18} aria-hidden="true" />
            Projelerim
          </Link>
        </div>
      )}
    </section>
  );
}
