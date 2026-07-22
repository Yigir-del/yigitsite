import { useEffect, useState } from 'react';
import { Ghost } from 'lucide-react';
import { motion } from 'framer-motion';
import { getIsMobilePerf } from '../../hooks/useIsMobilePerf';

type EventType = 'ufo' | 'popup' | 'achievement' | 'gravity' | 'none';

export default function ChaosManager() {
  const [activeEvent, setActiveEvent] = useState<EventType>('none');
  const [showPopup, setShowPopup] = useState(false);
  const [showAchievement, setShowAchievement] = useState(false);
  const [idleQuote, setIdleQuote] = useState<string | null>(null);

  useEffect(() => {
    const mobile = getIsMobilePerf();
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const track = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    if (mobile) {
      let idleTimer: ReturnType<typeof setTimeout>;
      const resetIdleTimer = () => {
        clearTimeout(idleTimer);
        setIdleQuote(null);
        idleTimer = setTimeout(() => {
          setIdleQuote('Burada çok sessizleştin... İyi misin?');
        }, 180000);
      };
      window.addEventListener('touchstart', resetIdleTimer, { passive: true });
      resetIdleTimer();
      return () => {
        clearTimeout(idleTimer);
        window.removeEventListener('touchstart', resetIdleTimer);
      };
    }

    const triggerChaos = () => {
      const events: EventType[] = ['ufo', 'popup', 'achievement'];
      const randomEvent = events[Math.floor(Math.random() * events.length)];

      setActiveEvent(randomEvent);

      if (randomEvent === 'popup') {
        setShowPopup(true);
        track(() => setShowPopup(false), 3000);
      } else if (randomEvent === 'achievement') {
        setShowAchievement(true);
        track(() => setShowAchievement(false), 4000);
      } else if (randomEvent === 'gravity') {
        window.dispatchEvent(new Event('world-flip'));
        track(() => window.dispatchEvent(new Event('world-flip')), 5000);
      } else {
        track(() => setActiveEvent('none'), 8000);
      }

      const nextTime = Math.random() * (90000 - 30000) + 30000;
      track(triggerChaos, nextTime);
    };

    track(triggerChaos, 20000);

    let idleTimer: ReturnType<typeof setTimeout>;
    let idleRaf = 0;
    const scheduleIdle = () => {
      clearTimeout(idleTimer);
      setIdleQuote(null);
      idleTimer = setTimeout(() => {
        const quotes = [
          'Bazen hiçbir şey yapmamak, yapabileceğin en iyi şeydir.',
          'Burada çok sessizleştin... İyi misin?',
          'Zaman geçiyor. Kodlar eskiyor. Sen nasılsın?',
          'Boşluğa ne kadar uzun süre bakarsan, boşluk da sana o kadar bakar.',
        ];
        setIdleQuote(quotes[Math.floor(Math.random() * quotes.length)]);
      }, 120000);
    };

    const resetIdleTimer = () => {
      if (idleRaf) return;
      idleRaf = requestAnimationFrame(() => {
        idleRaf = 0;
        scheduleIdle();
      });
    };

    window.addEventListener('mousemove', resetIdleTimer, { passive: true });
    window.addEventListener('keydown', resetIdleTimer);
    window.addEventListener('scroll', resetIdleTimer, { passive: true });
    scheduleIdle();

    return () => {
      timers.forEach(clearTimeout);
      timers.clear();
      clearTimeout(idleTimer);
      cancelAnimationFrame(idleRaf);
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
          className="chaos-popup"
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
        <div
          className="chaos-achievement"
          style={{
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
        <div className="fade-in chaos-idle-quote" style={{
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
