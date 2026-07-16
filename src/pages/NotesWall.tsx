import { useState, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { type Note } from '../data/notes';
import { useIsMobilePerf } from '../hooks/useIsMobilePerf';

function noteTimestamp(note: Note) {
  if (note.created_at) {
    const t = Date.parse(note.created_at);
    if (!Number.isNaN(t)) return t;
  }

  const idNum = Number(note.id);
  if (!Number.isNaN(idNum) && idNum > 1e11) return idNum;

  if (note.date) {
    const parts = note.date.split('/').map(Number);
    if (parts.length === 3 && parts.every((n) => !Number.isNaN(n))) {
      const [d, m, y] = parts;
      return new Date(y, m - 1, d).getTime();
    }
  }

  return 0;
}

function sortNewestFirst(list: Note[]) {
  return [...list].sort((a, b) => noteTimestamp(b) - noteTimestamp(a));
}

function frac(seed: number) {
  const n = Math.sin(seed) * 10000;
  return n - Math.floor(n);
}

type PositionedNote = Note & {
  computedX: number;
  computedY: number;
  computedRotation: number;
};

const HOME_DELAY_MS = 4500;
const HOME_DURATION_S = 2.6;
const HOME_EASE = [0.22, 1, 0.36, 1] as const;

function NoteBody({
  note,
  isAdmin,
  onDelete,
}: {
  note: PositionedNote;
  isAdmin: boolean;
  onDelete: (e: React.MouseEvent, id: string) => void;
}) {
  return (
    <>
      {note.isAdmin && (
        <div style={{ position: 'absolute', top: '-10px', right: '10px', fontSize: '20px' }}>📌</div>
      )}

      {isAdmin && (
        <button
          onClick={(e) => onDelete(e, note.id)}
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
            zIndex: 2,
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
          <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', opacity: 0.6, fontStyle: 'italic' }}>
            {note.date}
          </div>
        )}
      </div>
    </>
  );
}

/** Desktop-only: drag/throw, then slowly glide home after a pause */
function DraggableNoteCard({
  note,
  style,
  isAdmin,
  onDelete,
  onDragFront,
}: {
  note: PositionedNote;
  style: CSSProperties;
  isAdmin: boolean;
  onDelete: (e: React.MouseEvent, id: string) => void;
  onDragFront: (id: string | null) => void;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const homeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (homeTimer.current) clearTimeout(homeTimer.current);
    };
  }, []);

  const flyHome = () => {
    animate(x, 0, { duration: HOME_DURATION_S, ease: HOME_EASE });
    animate(y, 0, { duration: HOME_DURATION_S, ease: HOME_EASE });
  };

  const scheduleHome = () => {
    if (homeTimer.current) clearTimeout(homeTimer.current);
    homeTimer.current = setTimeout(flyHome, HOME_DELAY_MS);
  };

  return (
    <motion.div
      className={`note-card ${note.isAdmin ? 'admin-note' : ''}`}
      drag
      dragMomentum
      dragElastic={0.35}
      dragTransition={{ bounceStiffness: 180, bounceDamping: 18, power: 0.25, timeConstant: 280 }}
      whileDrag={{ scale: 1.06, cursor: 'grabbing', zIndex: 80 }}
      whileHover={{ scale: 1.04 }}
      onDragStart={() => {
        if (homeTimer.current) clearTimeout(homeTimer.current);
        onDragFront(note.id);
      }}
      onDragEnd={() => {
        onDragFront(null);
        scheduleHome();
      }}
      initial={false}
      style={{
        ...style,
        x,
        y,
        rotate: note.computedRotation,
        cursor: 'grab',
      }}
    >
      <NoteBody note={note} isAdmin={isAdmin} onDelete={onDelete} />
    </motion.div>
  );
}

export default function NotesWall() {
  const isMobilePerf = useIsMobilePerf();
  const [notes, setNotes] = useState<Note[]>([]);
  const [dragFrontId, setDragFrontId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

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

  useEffect(() => {
    setIsAdmin(localStorage.getItem('yigit_admin') === 'true');
  }, []);

  const positionedNotes = useMemo(() => {
    return sortNewestFirst(notes).map((note, index) => {
      const r1 = frac(index * 12.9898 + 78.233);
      const r2 = frac(index * 43.758 + 19.141);
      const r3 = frac(index * 91.532 + 7.617);
      const r4 = frac(index * 27.413 + 53.029);

      const preferLeft = index % 2 === 0;
      const x = preferLeft ? 4 + r1 * 36 : 48 + r1 * 28;
      const y = 16 + index * 18 + r2 * 10;
      const rotation = (r3 - 0.5) * 36;
      const signedRotation = (preferLeft ? 1 : -1) * Math.abs(rotation) * (r4 > 0.35 ? 1 : -1);

      return {
        ...note,
        computedX: x,
        computedY: y,
        computedRotation: signedRotation,
      };
    });
  }, [notes]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setNotes((prev) => sortNewestFirst(prev.filter((n) => n.id !== id)));
    try {
      await fetch(`/api/notes?id=${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete note', err);
    }
  };

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
        {positionedNotes.map((note, index) => {
          const baseZ = positionedNotes.length - index;
          const zIndex = dragFrontId === note.id ? 80 : baseZ;
          const commonStyle: CSSProperties = {
            position: 'absolute',
            left: `clamp(0.5rem, ${note.computedX}%, calc(100% - min(300px, calc(100vw - 1rem)) - 0.5rem))`,
            top: `${note.computedY}vh`,
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
            zIndex,
            touchAction: isMobilePerf ? 'pan-y' : 'none',
          };

          if (isMobilePerf) {
            return (
              <div
                key={note.id}
                className={`note-card ${note.isAdmin ? 'admin-note' : ''}`}
                style={{
                  ...commonStyle,
                  transform: `rotate(${note.computedRotation}deg)`,
                  cursor: 'default',
                }}
              >
                <NoteBody note={note} isAdmin={isAdmin} onDelete={handleDelete} />
              </div>
            );
          }

          return (
            <DraggableNoteCard
              key={note.id}
              note={note}
              style={commonStyle}
              isAdmin={isAdmin}
              onDelete={handleDelete}
              onDragFront={setDragFrontId}
            />
          );
        })}
      </div>
    </div>
  );
}
