import { useEffect, useState } from 'react';
import { Ghost } from 'lucide-react';
import { motion } from 'framer-motion';

type EventType = 'ufo' | 'popup' | 'achievement' | 'gravity' | 'none';

export default function ChaosManager() {
  const [activeEvent, setActiveEvent] = useState<EventType>('none');
  const [showPopup, setShowPopup] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [idleQuote, setIdleQuote] = useState<string | null>(null);

  useEffect(() => {
    // Standard random chaos
    const triggerChaos = () => {
      const events: EventType[] = ['ufo', 'popup', 'achievement'];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      
      setActiveEvent(randomEvent);

      if (randomEvent === 'popup') {
        setShowPopup(true);
        setTimeout(() => setShowPopup(false), 3000);
      } else if (randomEvent === 'achievement') {
        setShowAchievement(true);
        setTimeout(() => setShowAchievement(false), 4000);
      } else if (randomEvent === 'gravity') {
        window.dispatchEvent(new Event('world-flip'));
        setTimeout(() => {
          window.dispatchEvent(new Event('world-flip'));
        }, 5000);
      } else {
        setTimeout(() => {
          setActiveEvent('none');
        }, 8000);
      }

      const nextTime = Math.random() * (90000 - 30000) + 30000;
      setTimeout(triggerChaos, nextTime);
    };

    const initialTimeout = setTimeout(triggerChaos, 20000);

    // Idle Timer Logic
    let idleTimer: ReturnType<typeof setTimeout>;
    const resetIdleTimer = () => {
      clearTimeout(idleTimer);
      setIdleQuote(null);
      // Reveal hidden quote after 2 minutes of idle time
      idleTimer = setTimeout(() => {
        const quotes = [
          "Bazen hiçbir şey yapmamak, yapabileceğin en iyi şeydir.",
          "Burada çok sessizleştin... İyi misin?",
          "Zaman geçiyor. Kodlar eskiyor. Sen nasılsın?",
          "Boşluğa ne kadar uzun süre bakarsan, boşluk da sana o kadar bakar."
        ];
        setIdleQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      }, 120000); 
    };

    window.addEventListener('mousemove', resetIdleTimer);
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('scroll', resetIdleTimer);
    resetIdleTimer();

    return () => {
      clearTimeout(initialTimeout);
      clearTimeout(idleTimer);
      window.removeEventListener('mousemove', resetIdleTimer);
      window.removeEventListener('keydown', resetIdleTimer);
      window.removeEventListener('scroll', resetIdleTimer);
    };
  }, []);

  return (
    <>
      {activeEvent === 'ufo' && (
        <div style={{
          position: 'fixed', top: '20%', left: '-100px', 
          animation: 'flyAcross 8s linear forwards', zIndex: 9999
        }}>
          <Ghost size={48} color="#cbd5e1" />
        </div>
      )}

      {showPopup && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, x: '-50%', y: '-50%' }}
          animate={{ opacity: 1, scale: 1, x: '-50%', y: '-50%' }}
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            zIndex: 99999,
            pointerEvents: 'none',
            fontFamily: 'var(--font-title)',
            fontSize: '4rem',
            fontWeight: 700,
            color: '#ef4444',
            textAlign: 'center',
            textShadow: '0 10px 40px rgba(0,0,0,0.9), 0 0 20px rgba(255,255,255,0.3)',
            whiteSpace: 'nowrap'
          }}
        >
          Neye bakıyorsun? 👀
        </motion.div>
      )}

      {showAchievement && (
        <div style={{
          position: 'fixed', bottom: '20px', right: '20px',
          background: 'rgba(0,0,0,0.8)', color: '#fff', padding: '1rem', border: '1px solid rgba(255,255,255,0.2)',
          fontFamily: 'monospace', zIndex: 9999, display: 'flex', alignItems: 'center', gap: '1rem',
          borderRadius: '8px', backdropFilter: 'blur(5px)'
        }}>
          <div style={{ fontSize: '24px' }}>🏆</div>
          <div>
            <strong>Başarım kazanıldı:</strong><br/>
            Hala bu sitedesin.
          </div>
        </div>
      )}

      {idleQuote && (
        <div className="fade-in" style={{
          position: 'fixed', bottom: '10%', left: '50%', transform: 'translateX(-50%)',
          color: 'var(--text-muted)', fontStyle: 'italic', zIndex: 9000,
          pointerEvents: 'none', textShadow: '0 2px 10px rgba(0,0,0,0.5)',
          fontSize: '1.2rem'
        }}>
          "{idleQuote}"
        </div>
      )}
      
      <style>{`
        @keyframes flyAcross {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(50vw) translateY(-50px) rotate(15deg); }
          100% { transform: translateX(110vw) translateY(0) rotate(-10deg); }
        }
        .fade-in {
          animation: fadeIn 2s forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}
