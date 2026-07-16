import { useState, useEffect, useMemo } from 'react';
import { type Note } from '../data/notes';
import { useIsMobilePerf } from '../hooks/useIsMobilePerf';

function noteTimestamp(note: Note) {
  if (note.created_at) {
    const t = Date.parse(note.created_at);
    if (!Number.isNaN(t)) return t;
  }

  // Optimistic client ids use Date.now()
  const idNum = Number(note.id);
  if (!Number.isNaN(idNum) && idNum > 1e11) return idNum;

  // Fallback: DD/MM/YYYY
  if (note.date) {
    const parts = note.date.split('/').map(Number);
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
      const [d, m, y] = parts;
      return new Date(y, m - 1, d).getTime();
    }
  }

  return 0;
}

/** Newest first — latest written note is always index 0 (top of wall). */
function sortNewestFirst(list: Note[]) {
  return [...list].sort((a, b) => noteTimestamp(b) - noteTimestamp(a));
}

export default function NotesWall() {
  const isMobilePerf = useIsMobilePerf();
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    fetch('/api/notes')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setNotes(sortNewestFirst(data));
        else setNotes([]);
      })
      .catch(() => setNotes([]));
  }, []);

  useEffect(() => {
    const handleAddNote = async (e: Event) => {
      const customEvent = e as CustomEvent<Note>;
      const newNote: Note = {
        ...customEvent.detail,
        created_at: customEvent.detail.created_at || new Date().toISOString(),
      };

      // Immediately put newest on top
      setNotes((prev) => sortNewestFirst([newNote, ...prev]));

      try {
        const res = await fetch('/api/notes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: newNote.text,
            author: newNote.author,
            date: newNote.date,
            isAdmin: newNote.isAdmin,
          }),
        });

        if (res.ok) {
          const saved = (await res.json()) as Note;
          setNotes((prev) =>
            sortNewestFirst([
              saved,
              ...prev.filter((n) => n.id !== newNote.id && n.id !== saved.id),
            ])
          );
        }
      } catch (err) {
        console.error('Failed to save note to DB', err);
      }
    };

    window.addEventListener('add-note', handleAddNote);
    return () => window.removeEventListener('add-note', handleAddNote);
  }, []);

  // Index 0 = newest = highest on the wall (stack)
  const positionedNotes = useMemo(() => {
    return sortNewestFirst(notes).map((note, index) => {
      const pseudoRandom = Math.sin(index * 12345) * 10000;
      const randomValue = pseudoRandom - Math.floor(pseudoRandom);

      const pseudoRandom2 = Math.cos(index * 67890) * 10000;
      const randomValue2 = pseudoRandom2 - Math.floor(pseudoRandom2);

      const pseudoRandom3 = Math.sin(index * 54321) * 10000;
      const randomValue3 = pseudoRandom3 - Math.floor(pseudoRandom3);

      const x = 6 + randomValue * 38;
      // Newest (index 0) sits just under the title; older notes stack downward
      const y = 16 + index * 20 + randomValue2 * 8;
      const rotation = (randomValue3 - 0.5) * 16;

      return { ...note, computedX: x, computedY: y, computedRotation: rotation };
    });
  }, [notes]);

  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    setIsAdmin(localStorage.getItem('yigit_admin') === 'true');
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotes((prev) => sortNewestFirst(prev.filter((n) => n.id !== id)));
    try {
      await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

  // Title stays at top; only the wall height stretches downward
  const containerHeightVh = useMemo(() => {
    if (positionedNotes.length === 0) return 100;
    const lastY = Math.max(...positionedNotes.map((n) => n.computedY));
    return Math.min(Math.max(lastY + 40, 100), 240);
  }, [positionedNotes]);

  return (
    <div
      className="page-container"
      style={{
        height: `${containerHeightVh}vh`,
        position: 'relative',
        overflow: 'hidden',
        marginBottom: 0,
      }}
    >
      <h1
        className="glitch notes-wall-title"
        data-text="Not Defterim"
        style={{
          position: 'absolute',
          top: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          fontSize: 'clamp(1.75rem, 6vw, 3rem)',
          whiteSpace: 'nowrap',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        Not Defterim
      </h1>

      {positionedNotes.length === 0 && (
        <p
          style={{
            position: 'absolute',
            top: '22%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            color: 'var(--text-muted)',
            opacity: 0.45,
            fontSize: '0.95rem',
            letterSpacing: '0.08em',
          }}
        >
          Henüz iz yok.
        </p>
      )}

      <div style={{ position: 'absolute', width: '100%', height: '100%', top: 0, left: 0 }}>
        {positionedNotes.map((note, index) => (
          <div
            key={note.id}
            className={`note-card ${note.isAdmin ? 'admin-note' : ''}`}
            style={{
              position: 'absolute',
              left: `clamp(0.5rem, ${note.computedX}%, calc(100% - min(300px, calc(100vw - 1rem)) - 0.5rem))`,
              top: `${note.computedY}vh`,
              transform: `rotate(${note.computedRotation}deg)`,
              padding: '2rem',
              background: note.isAdmin ? 'rgba(255, 215, 0, 0.04)' : 'var(--card-bg)',
              border: note.isAdmin
                ? '1px solid rgba(255, 215, 0, 0.15)'
                : '1px solid var(--card-border)',
              borderRadius: '8px',
              maxWidth: 'min(300px, calc(100vw - 1.5rem))',
              boxSizing: 'border-box',
              backdropFilter: isMobilePerf ? undefined : 'blur(var(--blur-amount))',
              WebkitBackdropFilter: isMobilePerf ? undefined : 'blur(var(--blur-amount))',
              cursor: 'pointer',
              zIndex: positionedNotes.length - index,
              transition:
                'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), z-index 0.3s, background 0.3s, border-color 1.2s ease, box-shadow 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = `rotate(0deg) scale(1.05)`;
              e.currentTarget.style.zIndex = '50';
              e.currentTarget.style.background = note.isAdmin
                ? 'rgba(255, 215, 0, 0.08)'
                : 'var(--card-hover)';
              e.currentTarget.style.boxShadow = 'var(--hover-scale-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = `rotate(${note.computedRotation}deg) scale(1)`;
              e.currentTarget.style.zIndex = String(positionedNotes.length - index);
              e.currentTarget.style.background = note.isAdmin
                ? 'rgba(255, 215, 0, 0.04)'
                : 'var(--card-bg)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {note.isAdmin && (
              <div style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '20px' }}>
                📌
              </div>
            )}

            {isAdmin && (
              <button
                onClick={(e) => handleDelete(e, note.id)}
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  background: 'rgba(255,0,0,0.2)',
                  border: 'none',
                  color: 'red',
                  borderRadius: '50%',
                  width: '24px',
                  height: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                }}
                title="Sil"
              >
                ✕
              </button>
            )}

            <p
              style={{
                margin: 0,
                fontSize: '1.1rem',
                lineHeight: '1.6',
                color: 'var(--text-main)',
                fontStyle: 'italic',
                marginTop: isAdmin ? '1rem' : '0',
                opacity: 0.85,
              }}
            >
              "{note.text}"
            </p>
            <div
              style={{
                marginTop: '1.5rem',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                textAlign: 'right',
              }}
            >
              — {note.author}
              {note.date && (
                <div
                  style={{
                    fontSize: '0.75rem',
                    marginTop: '0.3rem',
                    opacity: 0.6,
                    fontStyle: 'italic',
                  }}
                >
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
