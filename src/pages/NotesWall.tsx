import { useState, useEffect, useMemo } from 'react';
import { initialNotes, type Note } from '../data/notes';

export default function NotesWall() {
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetch('/api/notes')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNotes(data);
        } else {
          setNotes([]);
        }
      })
      .catch(() => setNotes([]));
  }, []);

  useEffect(() => {
    const handleAddNote = async (e: Event) => {
      const customEvent = e as CustomEvent<Note>;
      const newNote = customEvent.detail;
      
      // Optimistic update
      setNotes(prev => [...prev, newNote]);
      
      try {
        await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: newNote.text,
            author: newNote.author,
            date: newNote.date,
            isAdmin: newNote.isAdmin
          })
        });
      } catch (err) {
        console.error('Failed to save note to DB', err);
      }
    };

    window.addEventListener('add-note', handleAddNote);
    return () => window.removeEventListener('add-note', handleAddNote);
  }, []);

  // Calculate stable random positions for notes
  const positionedNotes = useMemo(() => {
    return notes.map((note, index) => {
      // Use index to generate a pseudo-random but stable position
      const pseudoRandom = Math.sin(index * 12345) * 10000;
      const randomValue = pseudoRandom - Math.floor(pseudoRandom);
      
      const pseudoRandom2 = Math.cos(index * 67890) * 10000;
      const randomValue2 = pseudoRandom2 - Math.floor(pseudoRandom2);

      const pseudoRandom3 = Math.sin(index * 54321) * 10000;
      const randomValue3 = pseudoRandom3 - Math.floor(pseudoRandom3);

      const x = 10 + randomValue * 60; // 10% to 70%
      // Distribute vertically: each note gets about 30vh of space, scattered
      const y = (index * 25) + (randomValue2 * 15); // index * 25vh + 0-15vh variance
      const rotation = (randomValue3 - 0.5) * 20; // -10 to +10 degrees

      return { ...note, computedX: x, computedY: y, computedRotation: rotation };
    });
  }, [notes]);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('yigit_admin') === 'true');
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // prevent card hover effects or clicks
    
    // Optimistic update
    setNotes(prev => prev.filter(n => n.id !== id));
    
    try {
      await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  // Container height grows with the number of notes (roughly 30vh per note + some padding)
  const containerHeight = Math.max(100, positionedNotes.length * 30 + 50);

  return (
    <div className="page-container" style={{ height: `${containerHeight}vh`, position: 'relative', overflow: 'hidden' }}>
      <h1 className="glitch" data-text="Not Defterim" style={{ position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)', zIndex: 10, fontSize: '3rem' }}>
        Not Defterim
      </h1>
      
      <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
        {positionedNotes.map((note) => (
          <div
            key={note.id}
            className={`note-card ${note.isAdmin ? 'admin-note' : ''}`}
            style={{
              position: 'absolute',
              left: `${note.computedX}%`,
              top: `${note.computedY}vh`,
              transform: `rotate(${note.computedRotation}deg)`,
              padding: '2rem',
              // EXTREMELY transparent card
              background: note.isAdmin ? 'rgba(255, 215, 0, 0.02)' : 'rgba(255, 255, 255, 0.01)',
              border: note.isAdmin ? '1px solid rgba(255, 215, 0, 0.1)' : '1px solid rgba(255, 255, 255, 0.03)',
              borderRadius: '8px',
              maxWidth: '300px',
              backdropFilter: 'blur(2px)',
              cursor: 'pointer',
              transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), z-index 0.3s, background 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `rotate(0deg) scale(1.05)`;
              e.currentTarget.style.zIndex = '50';
              e.currentTarget.style.background = note.isAdmin ? 'rgba(255, 215, 0, 0.05)' : 'rgba(255, 255, 255, 0.05)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${note.computedRotation}deg) scale(1)`;
              e.currentTarget.style.zIndex = '1';
              e.currentTarget.style.background = note.isAdmin ? 'rgba(255, 215, 0, 0.02)' : 'rgba(255, 255, 255, 0.01)';
            }}
          >
            {note.isAdmin && <div style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '20px' }}>📌</div>}
            
            {isAdmin && (
              <button 
                onClick={(e) => handleDelete(e, note.id)}
                style={{
                  position: 'absolute', top: '10px', right: '10px',
                  background: 'rgba(255,0,0,0.2)', border: 'none', color: 'red',
                  borderRadius: '50%', width: '24px', height: '24px',
                  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px'
                }}
                title="Sil"
              >
                ✕
              </button>
            )}

            <p style={{ margin: 0, fontSize: '1.1rem', lineHeight: '1.6', color: 'rgba(255, 255, 255, 0.8)', fontStyle: 'italic', marginTop: isAdmin ? '1rem' : '0' }}>
              "{note.text}"
            </p>
            <div style={{ marginTop: '1.5rem', fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.4)', textAlign: 'right' }}>
              — {note.author}
              {note.date && (
                <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', opacity: 0.6, fontStyle: 'italic' }}>
                  {note.date}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
