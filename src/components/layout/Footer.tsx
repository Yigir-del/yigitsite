import { useState, useEffect } from 'react';

const sentences = [
  "Şu an CSS biliyormuş gibi yapıyorum.",
  "Kahve ve kötü kararlarla çalışıyor.",
  "404 uyku bulunamadı.",
  "Terapi çok pahalı olduğu için kod yazıyorum.",
  "Çalışıyorsa dokunma.",
  "Hiçlikten merhabalar."
];

export default function Footer() {
  const [quote, setQuote] = useState('');
  const [clicks, setClicks] = useState(0);
  const [endMessage, setEndMessage] = useState("Gerçekten sonuna kadar geldin mi?");

  useEffect(() => {
    setQuote(sentences[Math.floor(Math.random() * sentences.length)]);
  }, []);

  const handleClick = () => {
    setClicks(c => c + 1);
    if (clicks === 0) setEndMessage("Hayır, ciddiyim.");
    if (clicks === 1) setEndMessage("Aşağıda başka hiçbir şey yok.");
    if (clicks === 2) setEndMessage("Tıklamayı bırak.");
    if (clicks > 2) {
      const target = document.querySelector('.app-container');
      if (target) target.classList.add('flipped');
    }
  };

  return (
    <footer style={{
      padding: '4rem 2rem',
      textAlign: 'center',
      borderTop: '1px solid var(--bg-soft-gray)',
      position: 'relative',
      zIndex: 10
    }}>
      <p style={{ opacity: 0.7, marginBottom: '2rem' }}>{quote}</p>
      
      <div 
        onClick={handleClick}
        style={{ marginTop: '4rem', cursor: 'pointer', padding: '2rem' }}
      >
        <span style={{ fontSize: '0.8rem', letterSpacing: '2px', opacity: 0.5, textTransform: 'uppercase' }}>
          {endMessage}
        </span>
      </div>
    </footer>
  );
}
