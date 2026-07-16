import { useEffect, useState, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';

const QUOTES = [
  "Burada demokrasi yok. Ben ne istersem o çalar. 🛑",
  "DJ benim, istek parça almıyorum. 🎧✋",
  "Spotify Premium'umu sen mi ödüyorsun? Hayır. 💸😒",
  "Senin müzik zevkine güvenmiyorum. 🗑️😷",
  "Mekan benim, kurallar benim. 👑😎",
];

const MESSAGE_DURATION = 2500;

export default function FlyingMusic() {
  const [position, setPosition] = useState({
    x: typeof window !== 'undefined' ? window.innerWidth * 0.8 : 0,
    y: typeof window !== 'undefined' ? window.innerHeight * 0.2 : 0,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageIdRef = useRef(0);
  const searchAttemptsRef = useRef(0);

  useEffect(() => {
    const updatePosition = () => {
      const newX = window.innerWidth * 0.1 + Math.random() * (window.innerWidth * 0.8);
      const newY = window.innerHeight * 0.1 + Math.random() * (window.innerHeight * 0.8);
      setPosition({ x: newX, y: newY });
    };

    updatePosition();
    const interval = setInterval(updatePosition, 12000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    };
  }, []);

  const scheduleMessageHide = useCallback((messageId: number, onHide: () => void) => {
    if (messageTimeoutRef.current) clearTimeout(messageTimeoutRef.current);
    messageTimeoutRef.current = setTimeout(() => {
      if (messageIdRef.current === messageId) onHide();
    }, MESSAGE_DURATION);
  }, []);

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
      setSearchMessage("Çok zorladın. Müzik falan yok sana! 💥🚪");

      const messageId = ++messageIdRef.current;
      scheduleMessageHide(messageId, () => {
        setIsOpen(false);
        searchAttemptsRef.current = 0;
        setSearchAttempts(0);
        setSearchMessage('');
        setSearchValue('');
        setIframeKey((prev) => prev + 1);
      });
    }
  }, [scheduleMessageHide]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;
    showSassyQuote();
  };

  return (
    <>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        title="Müzik Kutusu"
        drag
        dragMomentum={true}
        whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
        animate={!isOpen ? { x: position.x, y: position.y } : undefined}
        transition={{ duration: 12, ease: 'easeInOut' }}
        style={{
          position: 'fixed',
          left: isOpen ? undefined : 0,
          top: isOpen ? undefined : 0,
          right: isOpen ? '2rem' : undefined,
          bottom: isOpen ? '2rem' : undefined,
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-main)',
          cursor: isOpen ? 'pointer' : 'grab',
          zIndex: 100,
          boxShadow: '0 0 15px var(--glow)',
        }}
        whileHover={{ scale: 1.1 }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </motion.button>

      <motion.div
        drag
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
          y: isOpen ? 0 : 20,
          scale: isOpen ? 1 : 0.9,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25 }}
        style={{
          position: 'fixed',
          right: '2rem',
          bottom: '6rem',
          width: '320px',
          background: 'var(--glass-bg)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '1rem',
          zIndex: 99,
          boxShadow: '0 10px 40px var(--shadow)',
          pointerEvents: isOpen ? 'auto' : 'none',
          cursor: isOpen ? 'grab' : 'default',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h4 style={{ margin: 0, color: 'var(--accent-pale-gray)', fontSize: '0.9rem' }}>Senin Frekansın</h4>
          <button
            onClick={() => setIsOpen(false)}
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
          >
            ✕
          </button>
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
            <button
              type="submit"
              className="btn-domain"
              style={{ padding: '0 1rem', borderRadius: '8px', fontWeight: 600 }}
            >
              Ara
            </button>
          </div>
        </form>

        <iframe
          key={iframeKey}
          style={{ borderRadius: '12px', background: 'transparent' }}
          src="https://open.spotify.com/embed/playlist/37i9dQZF1DX8Uebhn9wzrS?utm_source=generator&theme=0"
          width="100%"
          height="152"
          frameBorder="0"
          allowFullScreen={false}
          allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
          loading="lazy"
        />
      </motion.div>

      {/* Lightweight CSS overlay — no Framer scale (was causing jank with WebGL) */}
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
