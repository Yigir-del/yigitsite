import { useState, useEffect, useRef } from 'react';

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
      window.dispatchEvent(new Event('world-flip'));
      setEndMessage("...tamam.");
      clicksRef.current = 0;
    }
  };

  return (
    <footer style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      borderTop: '1px solid var(--glass-border)',
      position: 'relative',
      zIndex: 10,
      transition: 'border-color 1.2s ease',
    }}>
      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>{quote}</p>

      <div
        onClick={handleClick}
        style={{ marginTop: '4rem', cursor: 'pointer', padding: '2rem' }}
      >
        <span style={{
          fontSize: '0.8rem',
          letterSpacing: '2px',
          opacity: 0.5,
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}>
          {endMessage}
        </span>
      </div>
    </footer>
  );
}
