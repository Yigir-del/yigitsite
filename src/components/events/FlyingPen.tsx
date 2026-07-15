import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import type { Note } from '../../data/notes';

export default function FlyingPen() {
  const [position, setPosition] = useState({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [authorName, setAuthorName] = useState('');

  useEffect(() => {
    // Make the pen float around randomly but smoothly
    const updatePosition = () => {
      // Generate a new random position on the screen
      const newX = window.innerWidth * 0.1 + Math.random() * (window.innerWidth * 0.8);
      const newY = window.innerHeight * 0.1 + Math.random() * (window.innerHeight * 0.8);
      setPosition({ x: newX, y: newY });
    };

    updatePosition();
    const interval = setInterval(updatePosition, 10000); // Move every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;

    const now = new Date();
    const formattedDate = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth()+1).toString().padStart(2, '0')}/${now.getFullYear()}`;

    const newNote: Note = {
      id: Date.now().toString(),
      text: noteText,
      author: authorName.trim() || 'Gizemli Yabancı',
      x: 0, y: 0, rotation: 0, isAdmin: false,
      date: formattedDate
    };

    window.dispatchEvent(new CustomEvent('add-note', { detail: newNote }));
    
    setNoteText('');
    setAuthorName('');
    setIsModalOpen(false);
  };

  return (
    <>
      {/* Floating Pen Button */}
      <motion.button
        onClick={() => setIsModalOpen(true)}
        title="Bırakmak istediğin bir iz var mı?"
        drag
        dragMomentum={true}
        whileDrag={{ scale: 1.2, cursor: 'grabbing' }}
        animate={{ x: position.x, y: position.y }}
        transition={{ duration: 10, ease: "easeInOut" }}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(5px)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-primary)',
          cursor: 'grab',
          zIndex: 90,
          boxShadow: '0 0 15px rgba(255,255,255,0.2)'
        }}
        whileHover={{ scale: 1.1, boxShadow: '0 0 25px rgba(255,255,255,0.6)' }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
          <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
          <path d="M2 2l7.586 7.586"></path>
          <circle cx="11" cy="11" r="2"></circle>
        </svg>
      </motion.button>

      {/* Note Input Modal */}
      {isModalOpen && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <div className="fade-in" style={{
            background: 'var(--bg-main)',
            border: '1px solid var(--accent-muted-blue)',
            borderRadius: '12px',
            padding: '3rem',
            width: '90%',
            maxWidth: '500px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}>
            <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>Bir Not Bırak</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Aklından geçenleri dök..."
                  required
                  style={{
                    width: '100%',
                    height: '150px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    fontSize: '1rem',
                    resize: 'none',
                    outline: 'none',
                  }}
                />
              </div>
              <div>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  placeholder="İsmin (İsteğe bağlı)"
                  style={{
                    width: '100%',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    padding: '1rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit',
                    outline: 'none',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    cursor: 'pointer'
                  }}
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.8rem 1.5rem',
                    background: 'var(--accent-muted-blue)',
                    border: 'none',
                    color: 'var(--text-primary)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .fade-in {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </>
  );
}
