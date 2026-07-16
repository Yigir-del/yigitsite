import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { randomOffscreenStart, randomOnScreen } from '../../utils/flightPath';
import { useIsMobilePerf } from '../../hooks/useIsMobilePerf';

const QUOTES = [
  "Burada demokrasi yok. Ben ne istersem o çalar. 🛑",
  "DJ benim, istek parça almıyorum. 🎧✋",
  "Spotify Premium'umu sen mi ödüyorsun? Hayır. 💸😒",
  "Senin müzik zevkine güvenmiyorum. 🗑️😷",
  "Mekan benim, kurallar benim. 👑😎",
];

const MESSAGE_DURATION = 2500;
const SPOTIFY_SRC =
  'https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0';

export default function FlyingMusic() {
  const isMobilePerf = useIsMobilePerf();
  const [position, setPosition] = useState(randomOffscreenStart);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldMountPlayer, setShouldMountPlayer] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageIdRef = useRef(0);
  const searchAttemptsRef = useRef(0);

  useEffect(() => {
    if (isMobilePerf) return;
    const enter = setTimeout(() => setPosition(randomOnScreen()), 120);
    const interval = setInterval(() => setPosition(randomOnScreen()), 12000);
    return () => {
      clearTimeout(enter);
      clearInterval(interval);
    };
  }, [isMobilePerf]);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const preloadPlayer = () => setShouldMountPlayer(true);
    const idleId = window.requestIdleCallback?.(preloadPlayer, { timeout: 1200 });
    const timeoutId = idleId === undefined ? window.setTimeout(preloadPlayer, 500) : undefined;

    return () => {
      if (idleId !== undefined) window.cancelIdleCallback?.(idleId);
      if (timeoutId !== undefined) window.clearTimeout(timeoutId);
    };
  }, []);

  const scheduleMessageHide = useCallback((messageId: number, onHide: () => void) => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      if (messageIdRef.current === messageId) onHide();
    }, MESSAGE_DURATION);
  }, []);

  const stopMusic = useCallback(() => {
    setIsExpanded(false);
    setIsPlaying(false);
    searchAttemptsRef.current = 0;
    setSearchAttempts(0);
    setSearchMessage('');
    setSearchValue('');
    // Remount iframe so Spotify actually stops
    setIframeKey((prev) => prev + 1);
  }, []);

  const minimizePanel = useCallback(() => {
    setIsExpanded(false);
  }, []);

  const openPanel = useCallback(() => {
    setShouldMountPlayer(true);
    setIsPlaying(true);
    setIsExpanded(true);
  }, []);

  const togglePanel = useCallback(() => {
    if (isExpanded) {
      minimizePanel();
      return;
    }
    openPanel();
  }, [isExpanded, minimizePanel, openPanel]);

  const showSassyQuote = useCallback(() => {
    const attempts = searchAttemptsRef.current;

    if (attempts < 3) {
      const quote = QUOTES[Math.floor(Math.random() * QUOTES.length)];
      searchAttemptsRef.current = attempts + 1;
      setSearchAttempts(attempts + 1);
      setSearchMessage(quote);

      const messageId = ++messageIdRef.current;
      scheduleMessageHide(messageId, () => setSearchMessage(''));
    } else {
      setSearchMessage('Çok zorladın. Müzik falan yok sana! 💥🚪');

      const messageId = ++messageIdRef.current;
      scheduleMessageHide(messageId, () => {
        stopMusic();
      });
    }
  }, [scheduleMessageHide, stopMusic]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    showSassyQuote();
  };

  const musicIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13"></path>
      <circle cx="6" cy="18" r="3"></circle>
      <circle cx="18" cy="16" r="3"></circle>
    </svg>
  );

  const showPlayer = shouldMountPlayer && isPlaying;

  return (
    <>
      {isMobilePerf ? (
        <button
          type="button"
          onClick={togglePanel}
          title={isPlaying ? 'Müzik çalıyor — aç/küçült' : 'Müzik Kutusu'}
          style={{
            position: 'fixed',
            right: '1rem',
            bottom: '4.25rem',
            background: 'var(--glass-bg)',
            border: isPlaying && !isExpanded ? '1px solid var(--accent-pale-gray)' : '1px solid var(--glass-border)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            cursor: 'pointer',
            zIndex: 100,
            boxShadow: '0 0 15px var(--glow)',
          }}
        >
          {musicIcon}
        </button>
      ) : (
        <motion.button
          onClick={togglePanel}
          title={isPlaying ? 'Müzik çalıyor — aç/küçült' : 'Müzik Kutusu'}
          drag={!isExpanded}
          dragMomentum={true}
          whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
          initial={false}
          animate={!isExpanded ? { x: position.x, y: position.y } : { x: 0, y: 0 }}
          transition={{ duration: isExpanded ? 0.2 : 12, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            left: isExpanded ? undefined : 0,
            top: isExpanded ? undefined : 0,
            right: isExpanded ? '2rem' : undefined,
            bottom: isExpanded ? '2rem' : undefined,
            background: 'var(--glass-bg)',
            border: isPlaying && !isExpanded ? '1px solid var(--accent-pale-gray)' : '1px solid var(--glass-border)',
            borderRadius: '50%',
            width: '50px',
            height: '50px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-main)',
            cursor: isExpanded ? 'pointer' : 'grab',
            zIndex: 100,
            boxShadow: '0 0 15px var(--glow)',
          }}
          whileHover={{ scale: 1.1 }}
        >
          {musicIcon}
        </motion.button>
      )}

      <motion.div
        drag={!isMobilePerf && isExpanded}
        dragConstraints={{
          left: -(typeof window !== 'undefined' ? window.innerWidth - 350 : 1000),
          right: 50,
          top: -(typeof window !== 'undefined' ? window.innerHeight - 250 : 800),
          bottom: 50,
        }}
        dragMomentum={true}
        dragElastic={0.2}
        whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
        initial={false}
        animate={{
          // Off-screen keep-alive when minimized+playing — never display:none / opacity:0 on iframe
          x: isExpanded ? 0 : 480,
          y: isExpanded ? 0 : 0,
          scale: 1,
          opacity: 1,
        }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed',
          right: '1rem',
          bottom: '6rem',
          width: 'min(320px, calc(100vw - 2rem))',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '1rem',
          zIndex: 99,
          boxShadow: '0 10px 40px var(--shadow)',
          pointerEvents: isExpanded ? 'auto' : 'none',
          cursor: isExpanded ? 'grab' : 'default',
          visibility: showPlayer || isExpanded ? 'visible' : 'hidden',
        }}
        aria-hidden={!isExpanded}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', gap: '0.5rem' }}>
          <h4 style={{ margin: 0, color: 'var(--accent-pale-gray)', fontSize: '0.9rem' }}>Senin Frekansın</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <button
              type="button"
              onClick={minimizePanel}
              title="Küçült — müzik çalmaya devam eder"
              style={{
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '1rem',
                lineHeight: 1,
                width: '28px',
                height: '28px',
                borderRadius: '8px',
              }}
            >
              –
            </button>
            <button
              type="button"
              onClick={stopMusic}
              title="Durdur ve kapat"
              style={{
                background: 'transparent',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.95rem',
                lineHeight: 1,
                width: '28px',
                height: '28px',
                borderRadius: '8px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        <form onSubmit={handleSearch} style={{ marginBottom: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              placeholder="Şarkı ara..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--input-bg)',
                border: '1px solid var(--glass-border)',
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.9rem',
              }}
            />
            <button type="submit" className="btn-domain" style={{ padding: '0 1rem', borderRadius: '8px', fontWeight: 600 }}>
              Ara
            </button>
          </div>
        </form>

        {showPlayer && (
          <iframe
            key={iframeKey}
            style={{ borderRadius: '12px', background: 'transparent', border: 'none' }}
            src={SPOTIFY_SRC}
            width="100%"
            height="152"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="eager"
            title="Spotify çalma listesi"
          />
        )}
      </motion.div>

      {searchMessage && (
        <div
          key={searchMessage}
          className="music-quote-toast"
          style={{
            color: searchAttempts >= 3 ? '#ef4444' : 'var(--text-main)',
          }}
        >
          {searchMessage}
        </div>
      )}

      <style>{`
        .music-quote-toast {
          position: fixed;
          top: 50%;
          left: 50%;
          z-index: 9999;
          pointer-events: none;
          font-family: var(--font-title);
          font-size: clamp(1.25rem, 4vw, 2.25rem);
          font-weight: 700;
          text-align: center;
          max-width: min(90vw, 900px);
          white-space: normal;
          line-height: 1.25;
          text-shadow: 0 4px 16px rgba(0,0,0,0.85);
          transform: translate3d(-50%, -50%, 0);
          animation: musicQuoteIn 0.18s ease-out both;
          will-change: opacity, transform;
        }
        @keyframes musicQuoteIn {
          from { opacity: 0; transform: translate3d(-50%, calc(-50% + 8px), 0); }
          to { opacity: 1; transform: translate3d(-50%, -50%, 0); }
        }
      `}</style>
    </>
  );
}
