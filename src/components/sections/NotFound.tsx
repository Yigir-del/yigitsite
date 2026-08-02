import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SEOHead from '../../seo/SEOHead';
import { Home, FolderGit2, RotateCcw } from 'lucide-react';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';
import './NotFound.css';

// ── WORLD MANAGER LIFECYCLE INTERFACE ──
interface WorldObject {
  id: string;
  spawn: () => void;
  idle: () => void;
  pause: () => void;
  destroy: () => void;
  restore: () => void;
}

class UniverseWorldManager {
  private objects: Map<string, WorldObject> = new Map();

  register(obj: WorldObject) {
    this.objects.set(obj.id, obj);
  }

  unregister(id: string) {
    this.objects.delete(id);
  }

  destroyAll() {
    this.objects.forEach((obj) => obj.destroy());
  }

  restoreAll() {
    this.objects.forEach((obj) => obj.restore());
  }

  pauseAll() {
    this.objects.forEach((obj) => obj.pause());
  }
}

const worldManager = new UniverseWorldManager();

// ── SVG Avatar Components ──

function BeggarAvatar({ panic = false, shrug = false }: { panic?: boolean; shrug?: boolean }) {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="30" r="22" fill="#2a2030" stroke="var(--accent-pale-gray)" strokeWidth="2" />
      {/* Eyebrows */}
      <path d="M18 22 L28 25" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <path d="M46 22 L36 25" stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />

      {shrug ? (
        /* Shrugging Arms */
        <>
          <path d="M10 44 L20 38" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M54 44 L44 38" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
        </>
      ) : null}

      {panic ? (
        /* Wide Panicking Eyes & Open Mouth */
        <>
          <circle cx="24" cy="30" r="4.5" fill="#fff" />
          <circle cx="40" cy="30" r="4.5" fill="#fff" />
          <circle cx="24" cy="30" r="2" fill="#000" />
          <circle cx="40" cy="30" r="2" fill="#000" />
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

function SageAvatar({ eyesClosed = false, smile = false }: { eyesClosed?: boolean; smile?: boolean }) {
  return (
    <svg width="48" height="48" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
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

// ── SYSTEM TERMINAL LOG SEQUENCE ──
const TERMINAL_MESSAGES = [
  '> Koordinatlar doğrulanıyor...',
  '> ...',
  '> Hata.',
  '> ...',
  '> Bu adres mevcut değil.',
  '> ...',
  '> Gerçeklik bütünlüğü bozuldu.',
  '> ...',
  '> Kaçış öneriliyor.',
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
    | 'PAGE_LOAD'
    | 'CHARACTERS_TALK'
    | 'SYSTEM_INTERRUPTION'
    | 'MAIN_WARNING'
    | 'COUNTDOWN'
    | 'WORLD_COLLAPSE'
    | 'FINAL_VOID'
    | 'RETURN_SEQUENCE'
    | 'USER_SAVED'
    | 'RARE_EVENT'
  >('PAGE_LOAD');

  const [beggarSpeech, setBeggarSpeech] = useState<string | null>(null);
  const [sageSpeech, setSageSpeech] = useState<string | null>(null);
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);
  const [warningStep, setWarningStep] = useState<number>(0);
  const [countdown, setCountdown] = useState<number>(5);
  const [shakeKey, setShakeKey] = useState<number>(0);
  const [sageEyesClosed, setSageEyesClosed] = useState<boolean>(false);
  const [sageSmile, setSageSmile] = useState<boolean>(false);

  // Final Void typing state
  const [showCursor, setShowCursor] = useState<boolean>(false);
  const [typedText, setTypedText] = useState<string>('');
  const [showReturnBtn, setShowReturnBtn] = useState<boolean>(false);

  // Return sequence character states
  const [rebuildStep, setRebuildStep] = useState<number>(0);

  // Rare Event Steps: 'DOTS' -> 'APPROACHING' -> 'ARRIVED' -> 'LEAVING' -> 'DONE'
  const [rareStep, setRareStep] = useState<'DOTS' | 'APPROACHING' | 'ARRIVED' | 'LEAVING' | 'DONE'>('DOTS');

  // Active timers reference for cleanup
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

  // Helper to clear DOM collapse classes
  const cleanupDOMClasses = () => {
    document.querySelector('.site-nav')?.classList.remove('reality-disabled-nav', 'reality-collapsed-nav');
    document.querySelector('.site-footer')?.classList.remove('reality-collapsed-footer');
    document.querySelector('.wireframe-pyramid-container')?.classList.remove('reality-collapsed-pyramid');
    document.body.classList.remove('cinema-shake');
  };

  // ── Register Universe Objects in World Manager ──
  useEffect(() => {
    worldManager.register({
      id: 'navigation',
      spawn: () => {},
      idle: () => {},
      pause: () => document.querySelector('.site-nav')?.classList.add('reality-disabled-nav'),
      destroy: () => document.querySelector('.site-nav')?.classList.add('reality-collapsed-nav'),
      restore: () => document.querySelector('.site-nav')?.classList.remove('reality-disabled-nav', 'reality-collapsed-nav'),
    });

    worldManager.register({
      id: 'footer',
      spawn: () => {},
      idle: () => {},
      pause: () => {},
      destroy: () => document.querySelector('.site-footer')?.classList.add('reality-collapsed-footer'),
      restore: () => document.querySelector('.site-footer')?.classList.remove('reality-collapsed-footer'),
    });

    worldManager.register({
      id: 'moon',
      spawn: () => {},
      idle: () => {},
      pause: () => {},
      destroy: () => document.querySelector('.wireframe-pyramid-container')?.classList.add('reality-collapsed-pyramid'),
      restore: () => document.querySelector('.wireframe-pyramid-container')?.classList.remove('reality-collapsed-pyramid'),
    });

    return () => {
      worldManager.restoreAll();
    };
  }, []);

  // ── Desktop Scripted Cinematic Timeline Sequence ──
  useEffect(() => {
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
      }, 28500);

      return () => clearAllTimers();
    }

    // ── NORMAL SCRIPTED CINEMATIC TIMELINE ──
    // 0s - 2s: PAGE_LOAD (Normal 404 look)

    // At 2.0s: Bilge speaks
    addTimer(() => {
      setStage('CHARACTERS_TALK');
      setSageSpeech('Sanırım yine yolu kaybetmiş.');
    }, 2000);

    // At 3.0s (1s later): Dilenci speaks nervously
    addTimer(() => {
      setBeggarSpeech('Abi... burası normal görünmüyor.');
    }, 3000);

    // At 4.0s: SYSTEM_INTERRUPTION
    addTimer(() => {
      setStage('SYSTEM_INTERRUPTION');
      worldManager.pauseAll();

      // Type out terminal logs sequentially every 300ms
      TERMINAL_MESSAGES.forEach((msg, idx) => {
        addTimer(() => {
          setTerminalLogs((prev) => [...prev, msg]);
        }, idx * 300);
      });
    }, 4000);

    // At 7.0s: MAIN_WARNING
    addTimer(() => {
      setStage('MAIN_WARNING');
      setWarningStep(1); // "Yanlış yere geldin. Şimdi sessizce geri dön."
    }, 7000);

    // At 8.0s (1s later): Warning 3rd line
    addTimer(() => {
      setWarningStep(2); // "Yoksa gerçeklik seni fark edecek."
    }, 8000);

    // At 9.0s: COUNTDOWN (5..4..3..2..1)
    addTimer(() => {
      setStage('COUNTDOWN');
      setCountdown(5);

      let current = 5;
      const countInterval = window.setInterval(() => {
        current -= 1;
        if (current >= 0) {
          setCountdown(current);
          setShakeKey((k) => k + 1);

          // Camera shake & vibration
          document.body.classList.add('cinema-shake');
          setTimeout(() => document.body.classList.remove('cinema-shake'), 450);
        }

        // Countdown hits 0 (At 14.0s) -> WORLD_COLLAPSE!
        if (current <= 0) {
          window.clearInterval(countInterval);
          setStage('WORLD_COLLAPSE');
          setBeggarSpeech('BEN DEMİŞTİM!');
          setSageSpeech(null);
          setSageEyesClosed(true);

          // World Manager triggers physical collapse destruction
          worldManager.destroyAll();

          // After collapse completes (4s later at 18.0s) -> FINAL_VOID
          addTimer(() => {
            setStage('FINAL_VOID');

            // Wait 5s in absolute black void, then show blinking cursor
            addTimer(() => setShowCursor(true), 5000);

            // Another 5s later (10s total), type single sentence out slowly
            addTimer(() => {
              const fullText = 'Evren seni geri göndermeyi uygun gördü.';
              let charIdx = 0;
              const typeInterval = window.setInterval(() => {
                charIdx += 1;
                setTypedText(fullText.slice(0, charIdx));
                if (charIdx >= fullText.length) {
                  window.clearInterval(typeInterval);
                  setShowReturnBtn(true);
                }
              }, 70);
              timersRef.current.push(typeInterval);
            }, 10000);
          }, 4000);
        }
      }, 1000);

      timersRef.current.push(countInterval);
    }, 9000);

    return () => {
      clearAllTimers();
      cleanupDOMClasses();
    };
  }, [isMobilePerf, isRare, navigate]);

  // Handle User Clicking "Ana Sayfaya Dön" before countdown ends
  const handleUserSaved = () => {
    clearAllTimers();
    setStage('USER_SAVED');
    setBeggarSpeech('Bu seferlik kurtuldun.');
    setSageSpeech('Hatalar bazen doğru yolu gösterir.');
    setSageSmile(true);
    cleanupDOMClasses();

    addTimer(() => {
      navigate('/', { replace: true });
    }, 1800);
  };

  // Handle Return Sequence when clicking "Gerçekliğe Dön" in Final Void
  const handleReturnSequence = () => {
    clearAllTimers();
    setStage('RETURN_SEQUENCE');
    setRebuildStep(1);

    // Reconstruct reality step by step
    addTimer(() => setRebuildStep(2), 600); // Moon & Navigation reform
    addTimer(() => {
      worldManager.restoreAll();
      setRebuildStep(3); // Bilge appears, smiles
      setSageEyesClosed(false);
      setSageSmile(true);
      setSageSpeech(null);
    }, 1400);

    addTimer(() => {
      setRebuildStep(4); // Dilenci appears LAST, confused
      setBeggarSpeech('Heh... Toparlamışlar.');
    }, 2200);

    addTimer(() => {
      cleanupDOMClasses();
      navigate('/', { replace: true });
    }, 4200);
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

  // ── RETURN SEQUENCE STAGE ──
  if (stage === 'RETURN_SEQUENCE') {
    return (
      <section
        className="not-found-section reconstruct-in"
        style={{
          minHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          padding: '4rem 2rem',
        }}
      >
        <SEOHead page="notFound" />
        <h1 style={{ fontSize: 'clamp(4rem, 10vw, 7rem)', color: 'var(--text-primary)', marginBottom: '1rem' }}>
          404
        </h1>

        <div className="character-duo">
          {rebuildStep >= 3 && (
            <div className="character-card reconstruct-in">
              {sageSpeech && <div className="speech-bubble">{sageSpeech}</div>}
              <SageAvatar smile={sageSmile} />
            </div>
          )}

          {rebuildStep >= 4 && (
            <div className="character-card reconstruct-in">
              {beggarSpeech && <div className="speech-bubble">{beggarSpeech}</div>}
              <BeggarAvatar />
            </div>
          )}
        </div>

        <p style={{ color: 'var(--text-muted)', marginTop: '2rem' }}>
          Gerçeklik yeniden inşa ediliyor...
        </p>
      </section>
    );
  }

  // ── FINAL VOID STAGE (Total Void & Silence) ──
  if (stage === 'FINAL_VOID') {
    return (
      <section
        className="final-void-section"
        style={{
          position: 'fixed',
          inset: 0,
          background: '#000',
          zIndex: 9999,
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

        {/* At most 5 tiny distant static stars */}
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.25 }}>
          <div style={{ position: 'absolute', top: '15%', left: '20%', width: 2, height: 2, background: '#fff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '75%', left: '80%', width: 2, height: 2, background: '#fff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '35%', left: '85%', width: 1.5, height: 1.5, background: '#fff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '80%', left: '15%', width: 2, height: 2, background: '#fff', borderRadius: '50%' }} />
          <div style={{ position: 'absolute', top: '50%', left: '50%', width: 1, height: 1, background: '#fff', borderRadius: '50%' }} />
        </div>

        {showCursor && typedText === '' && (
          <div style={{ opacity: 0.7, fontSize: '1.4rem' }}>
            <span className="blinking-cursor" />
          </div>
        )}

        {typedText !== '' && (
          <div
            style={{
              maxWidth: '650px',
              marginBottom: '3.5rem',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-title, serif)',
                fontSize: 'clamp(1.4rem, 3.8vw, 2.4rem)',
                lineHeight: 1.5,
                color: 'var(--text-main, #f8fafc)',
              }}
            >
              {typedText}
              {showReturnBtn ? null : <span className="blinking-cursor" />}
            </p>
          </div>
        )}

        {showReturnBtn && (
          <button
            onClick={handleReturnSequence}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.95rem 2.2rem',
              borderRadius: '8px',
              background: 'var(--accent-muted-blue, #4b6b8b)',
              color: '#fff',
              border: 'none',
              fontSize: '1.05rem',
              fontWeight: 500,
              cursor: 'pointer',
              boxShadow: '0 0 30px rgba(75, 107, 139, 0.45)',
              transition: 'transform 0.2s, background 0.2s',
              animation: 'speechPop 0.6s ease forwards',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = 'translateY(-2px) scale(1.04)')}
            onMouseLeave={(e) => (e.currentTarget.style.transform = 'translateY(0) scale(1)')}
          >
            <RotateCcw size={19} aria-hidden="true" />
            Gerçekliğe Dön
          </button>
        )}
      </section>
    );
  }

  // ── DESKTOP FULL SCRIPTED CINEMATIC INTERACTIVE EXPERIENCE ──
  const isVibrating = stage === 'COUNTDOWN' || stage === 'MAIN_WARNING';
  const isCollapsing = stage === 'WORLD_COLLAPSE';

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
        transition: 'opacity 1.2s ease',
      }}
    >
      <SEOHead page="notFound" />

      {/* ── 404 Title ── */}
      <div className={isCollapsing ? 'shatter-piece-1' : ''} style={{ position: 'relative', marginBottom: '1rem' }}>
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
      {stage !== 'MAIN_WARNING' && stage !== 'COUNTDOWN' && (
        <h2
          className={isCollapsing ? 'shatter-piece-2' : ''}
          style={{
            fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
            marginBottom: '1.5rem',
            color: 'var(--text-primary)',
          }}
        >
          Sayfa Bulunamadı
        </h2>
      )}

      {/* ── Interactive Characters Duo (The Sage & The Beggar) ── */}
      <div className={`character-duo ${isCollapsing ? 'shatter-piece-3' : ''}`}>
        {/* The Sage */}
        <div className="character-card">
          {sageSpeech && <div className="speech-bubble">{sageSpeech}</div>}
          <SageAvatar eyesClosed={sageEyesClosed} smile={sageSmile} />
        </div>

        {/* The Beggar */}
        <div className="character-card">
          {beggarSpeech && <div className="speech-bubble">{beggarSpeech}</div>}
          <BeggarAvatar panic={isCollapsing} />
        </div>
      </div>

      {/* ── Stage: SYSTEM_INTERRUPTION (Terminal HUD) ── */}
      {stage === 'SYSTEM_INTERRUPTION' && (
        <div className="terminal-hud">
          {terminalLogs.map((log, index) => (
            <div key={index} className="terminal-hud__line">
              {log}
            </div>
          ))}
        </div>
      )}

      {/* ── Stage: MAIN_WARNING ── */}
      {stage === 'MAIN_WARNING' && (
        <div style={{ marginBlock: '1.5rem', animation: 'speechPop 0.4s ease forwards' }}>
          <h2
            style={{
              fontFamily: 'var(--font-title, serif)',
              fontSize: 'clamp(2.2rem, 5.5vw, 3.5rem)',
              color: '#f43f5e',
              marginBottom: '0.8rem',
              letterSpacing: '1px',
              textShadow: '0 0 25px rgba(244, 63, 94, 0.45)',
            }}
          >
            Yanlış yere geldin.
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.25rem', marginBottom: '0.8rem' }}>
            Şimdi sessizce geri dön.
          </p>
          {warningStep >= 2 && (
            <p
              style={{
                color: '#f8fafc',
                fontSize: '1.15rem',
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
      {stage !== 'WORLD_COLLAPSE' && (
        <div
          className={isCollapsing ? 'shatter-piece-2' : ''}
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
              if (stage !== 'PAGE_LOAD') {
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
