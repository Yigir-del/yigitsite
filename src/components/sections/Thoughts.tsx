import { useRef, useEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface Thought {
  id: string;
  text: string;
  type: string;
  date: string;
  rotation: number;
}

export default function Thoughts() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [myThoughts, setMyThoughts] = useState<Thought[]>([]);
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState('GÜNLÜK');

  useEffect(() => {
    setIsAdmin(localStorage.getItem('yigit_admin') === 'true');
    const saved = localStorage.getItem('yigit_thoughts');
    if (saved) {
      setMyThoughts(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    if (containerRef.current && myThoughts.length > 0) {
      const cards = containerRef.current.querySelectorAll('.thought-paper');
      gsap.fromTo(cards, 
        { y: 50, opacity: 0, scale: 0.9 },
        { 
          y: 0, opacity: 1, scale: 1, stagger: 0.15, duration: 1.2, ease: 'power2.out',
          scrollTrigger: {
            trigger: containerRef.current,
            start: 'top 80%',
          }
        }
      );
    }
  }, [myThoughts.length]);

  const addThought = () => {
    if (!newText.trim()) return;
    const now = new Date();
    const thought: Thought = {
      id: Date.now().toString(),
      text: newText,
      type: newType,
      date: `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`,
      rotation: Math.random() * 6 - 3
    };
    
    const updated = [thought, ...myThoughts];
    setMyThoughts(updated);
    localStorage.setItem('yigit_thoughts', JSON.stringify(updated));
    setNewText('');
  };

  return (
    <section ref={containerRef} style={{ padding: '6rem 2rem', minHeight: '100vh', maxWidth: '1200px', margin: '0 auto', overflowX: 'hidden', position: 'relative' }}>
      <h1 className="glitch" data-text="Düşünceler" style={{ textAlign: 'center', marginBottom: '2rem', fontSize: '3rem' }}>Düşünceler</h1>
      <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: '5rem', fontStyle: 'italic', fontFamily: 'serif' }}>
        "Bazen bir şeyler yazarım, genelde mantıklı olmazlar."
      </p>

      {isAdmin && (
        <div style={{ 
          position: 'fixed', 
          top: '100px', 
          right: '20px', 
          background: 'var(--glass-bg)', 
          backdropFilter: 'blur(var(--blur-amount))',
          padding: '1.5rem', 
          borderRadius: '12px', 
          width: '280px', 
          border: '1px solid var(--glass-border)',
          zIndex: 100,
          boxShadow: '0 10px 30px var(--shadow)'
        }}>
          <h3 style={{ color: 'var(--text-main)', marginBottom: '1rem', fontSize: '1rem' }}>Admin: Düşünce Ekle</h3>
          <input 
            type="text" 
            value={newType} 
            onChange={e => setNewType(e.target.value)} 
            placeholder="Kategori"
            className="input-domain"
            style={{ width: '100%', padding: '0.6rem', marginBottom: '1rem', fontSize: '0.85rem' }}
          />
          <textarea 
            value={newText}
            onChange={e => setNewText(e.target.value)}
            placeholder="Ne düşünüyorsun?"
            className="input-domain"
            style={{ width: '100%', padding: '0.6rem', minHeight: '80px', marginBottom: '1rem', fontSize: '0.85rem', resize: 'vertical' }}
          />
          <button 
            onClick={addThought}
            className="btn-domain"
            style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem' }}
          >
            Gönder
          </button>
        </div>
      )}

      {myThoughts.length === 0 && !isAdmin && (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Şu an buralar sessiz...</p>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '3rem', justifyContent: 'center', padding: '2rem' }}>
        {myThoughts.map((t, i) => {
          const mt = i % 2 === 0 ? '0' : '4rem';
          return (
            <div key={t.id} className="thought-paper" style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '2.5rem',
              width: '350px',
              borderRadius: '2px', // paper-like
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              transform: `rotate(${t.rotation}deg)`,
              marginTop: mt,
              position: 'relative',
              transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `rotate(0deg) scale(1.05) translateY(-10px)`;
              e.currentTarget.style.zIndex = '10';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${t.rotation}deg)`;
              e.currentTarget.style.zIndex = '1';
            }}
            >
              {/* Paper tape effect */}
              <div style={{ position: 'absolute', top: '-10px', left: '50%', transform: 'translateX(-50%) rotate(-2deg)', width: '60px', height: '20px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(2px)' }}></div>
              
              <div style={{ fontSize: '0.8rem', color: 'var(--accent-muted-blue)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                {t.type}
              </div>
              <p className="handwriting" style={{ fontSize: '1.4rem', lineHeight: '1.6', color: 'var(--text-primary)', marginBottom: '2rem' }}>
                {t.text}
              </p>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textAlign: 'right', fontStyle: 'italic' }}>
                {t.date}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
