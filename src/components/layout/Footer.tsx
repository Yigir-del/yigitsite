import { useState, useEffect, useRef } from 'react';
import { APP_EVENTS, dispatchAppEvent } from '../../utils/events';
import { unlockAchievement } from '../../features/achievements/achievementStore';

const sentences = [
  "Şu an CSS biliyormuş gibi yapıyorum.",
  "Kahve ve kötü kararlarla çalışıyor.",
  "404 uyku bulunamadı.",
  "Terapi çok pahalı olduğu için kod yazıyorum.",
  "Çalışıyorsa dokunma.",
  "Hiçlikten merhabalar."
];

const FLIP_THRESHOLD = 18;

export default function Footer() {
  const [quote, setQuote] = useState('');
  const clicksRef = useRef(0);
  const [endMessage, setEndMessage] = useState("Gerçekten sonuna kadar geldin mi?");

  useEffect(() => {
    setQuote(sentences[Math.floor(Math.random() * sentences.length)]);
  }, []);

  const handleClick = () => {
    const next = clicksRef.current + 1;
    clicksRef.current = next;

    if (next === 1) setEndMessage("Hayır, ciddiyim.");
    else if (next === 2) setEndMessage("Aşağıda başka hiçbir şey yok.");
    else if (next === 3) setEndMessage("Tıklamayı bırak.");
    else if (next === 8) setEndMessage("Hâlâ mı?");
    else if (next === 14) setEndMessage("Son uyarı.");
    else if (next >= FLIP_THRESHOLD) {
      unlockAchievement('world_flip');
      dispatchAppEvent(APP_EVENTS.WORLD_FLIP);
      setEndMessage("...tamam.");
      clicksRef.current = 0;
    }
  };

  return (
    <footer
      className="site-footer"
      style={{
        padding: '4rem 2rem',
        textAlign: 'center',
        borderTop: '1px solid var(--glass-border)',
        position: 'relative',
        zIndex: 10,
        transition: 'border-color 1.2s ease',
      }}
    >
      <p style={{ opacity: 0.7, marginBottom: '2rem', paddingInline: '0.5rem' }}>{quote}</p>

      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick();
          }
        }}
        style={{ marginTop: '4rem', cursor: 'pointer', padding: '2rem' }}
      >
        <span
          style={{
            fontSize: '0.8rem',
            letterSpacing: '2px',
            opacity: 0.5,
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}
        >
          {endMessage}
        </span>
      </div>

      {/* Subtle bottom-of-void whispers so touch/mobile explorers can also reach terminal & 42 (§20.1) */}
      <div
        style={{
          marginTop: '1.25rem',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '0.85rem',
          opacity: 0.24,
          fontSize: '0.62rem',
          fontFamily: 'monospace',
          letterSpacing: '0.14em',
        }}
      >
        <button
          type="button"
          onClick={() => dispatchAppEvent(APP_EVENTS.SUDO_TERMINAL)}
          aria-label="Gizli oda terminali"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            letterSpacing: 'inherit',
            cursor: 'pointer',
            padding: '0.2rem 0.35rem',
          }}
        >
          root@oda:~#
        </button>
        <span aria-hidden="true">·</span>
        <button
          type="button"
          onClick={() => dispatchAppEvent(APP_EVENTS.MEANING_42)}
          aria-label="Evrenin cevabı 42"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            letterSpacing: 'inherit',
            cursor: 'pointer',
            padding: '0.2rem 0.35rem',
          }}
        >
          42
        </button>
      </div>
    </footer>
  );
}
