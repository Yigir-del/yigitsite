import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUOTES = [
  "Burada demokrasi yok. Ben ne istersem o çalar. 🛑",
  "DJ benim, istek parça almıyorum. 🎧✋",
  "Spotify Premium'umu sen mi ödüyorsun? Hayır. 💸😒",
  "Senin müzik zevkine güvenmiyorum. 🗑️😷",
  "Mekan benim, kurallar benim. 👑😎",
];

const MESSAGE_DURATION = 2500;

export default function FlyingMusic() {
  const [position, setPosition] = useState({ x: typeof window !== 'undefined' ? window.innerWidth * 0.8 : 0, y: typeof window !== 'undefined' ? window.innerHeight * 0.2 : 0 });
  const [isOpen, setIsOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchMessage, setSearchMessage] = useState('');
  const [searchAttempts, setSearchAttempts] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageIdRef = useRef(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchAttemptsRef = useRef(0);

  useEffect(() => {
    // Gentle floating movement
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
      if (debounceRef.current) clearTimeout(debounceRef.current);
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
        setIframeKey(prev => prev + 1);
      });
    }
  }, [scheduleMessageHide]);

  const handleSearchChange = (value: string) => {
    setSearchValue(value);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      return;
    }

    debounceRef.current = setTimeout(() => {
      showSassyQuote();
    }, 400);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchValue.trim()) return;

    if (debounceRef.current) clearTimeout(debounceRef.current);
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
        transition={{ duration: 12, ease: "easeInOut" }}
        style={{
          position: 'fixed',
          left: isOpen ? undefined : 0,
          top: isOpen ? undefined : 0,
          right: isOpen ? '2rem' : undefined,
          bottom: isOpen ? '2rem' : undefined,
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(var(--blur-amount))',
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
          boxShadow: '0 0 15px var(--glow)'
        }}
        whileHover={{ scale: 1.1, boxShadow: 'var(--hover-scale-glow)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18V5l12-2v13"></path>
          <circle cx="6" cy="18" r="3"></circle>
          <circle cx="18" cy="16" r="3"></circle>
        </svg>
      </motion.button>

      {/* Music Player Modal/Window */}
      <motion.div 
        drag
        dragConstraints={{ left: -(typeof window !== 'undefined' ? window.innerWidth - 350 : 1000), right: 50, top: -(typeof window !== 'undefined' ? window.innerHeight - 250 : 800), bottom: 50 }}
        dragMomentum={true}
        dragElastic={0.2}
        whileDrag={{ scale: 1.02, cursor: 'grabbing' }}
        initial={false}
        animate={{
          y: isOpen ? 0 : 20,
          scale: isOpen ? 1 : 0.9,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        style={{
        position: 'fixed',
        right: '2rem',
        bottom: '6rem',
        width: '320px',
        background: 'var(--glass-bg)',
        backdropFilter: 'blur(var(--blur-amount))',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '1rem',
        zIndex: 99,
        boxShadow: '0 10px 40px var(--shadow)',
        pointerEvents: isOpen ? 'auto' : 'none',
        cursor: isOpen ? 'grab' : 'default',
      }}>
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
              onChange={(e) => handleSearchChange(e.target.value)}
              style={{
                flex: 1,
                background: 'var(--input-bg)',
                border: '1px solid var(--glass-border)',
                padding: '0.5rem 0.8rem',
                borderRadius: '8px',
                color: 'var(--text-main)',
                outline: 'none',
                fontSize: '0.9rem'
              }}
            />
            <button 
              type="submit"
              className="btn-domain"
              style={{
                padding: '0 1rem',
                borderRadius: '8px',
                fontWeight: 600
              }}
            >
              Ara
            </button>
          </div>
        </form>
        
        {/* We keep the iframe mounted but hide the container so it doesn't reload and stops playing if we used conditional rendering */}
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
        ></iframe>
      </motion.div>

      {/* Sassy Screen Overlay */}
      <AnimatePresence>
        {searchMessage && (
          <motion.div
            key={searchMessage}
            initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
            exit={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              zIndex: 9999,
              pointerEvents: 'none',
              fontFamily: 'var(--font-title)',
              fontSize: '3rem',
              fontWeight: 700,
              color: searchAttempts >= 3 ? '#ef4444' : 'var(--text-main)',
              textAlign: 'center',
              textShadow: '0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.3)',
              whiteSpace: 'nowrap'
            }}
          >
            {searchMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
