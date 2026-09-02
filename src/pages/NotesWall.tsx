import { useState, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { type Note } from '../data/notes';
import { useAdminSession } from '../hooks/useAdminSession';
import { useIsMobilePerf } from '../hooks/useIsMobilePerf';
import { istanbulMonthKey } from '../utils/samsunTime';
import { publishNoteTraces } from '../utils/noteTraces';

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

function relativeIz(ts: number, now = Date.now()) {
  if (!ts) return '';
  const diff = Math.max(0, now - ts);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return 'az önce';
  if (minutes < 60) return `${minutes} dakika önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  if (hours < 48) return 'dün';
  const days = Math.floor(hours / 24);
  return `${days} gün önce`;
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
  isFresh,
  onDelete,
}: {
  note: PositionedNote;
  isAdmin: boolean;
  isFresh: boolean;
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
          aria-label="Notu sil"
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
        {isFresh ? (
          <div className="note-card__when" style={{ fontSize: '0.75rem', marginTop: '0.3rem', opacity: 0.75, fontStyle: 'italic' }}>
            {relativeIz(noteTimestamp(note))}
          </div>
        ) : (
          note.date && (
            <div style={{ fontSize: '0.75rem', marginTop: '0.3rem', opacity: 0.6, fontStyle: 'italic' }}>
              {note.date}
            </div>
          )
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
  isFresh,
  onDelete,
  onDragFront,
}: {
  note: PositionedNote;
  style: CSSProperties;
  isAdmin: boolean;
  isFresh: boolean;
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
      className={`note-card${note.isAdmin ? ' admin-note' : ''}${isFresh ? ' note-card--fresh' : ''}`}
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
      <NoteBody note={note} isAdmin={isAdmin} isFresh={isFresh} onDelete={onDelete} />
    </motion.div>
  );
}

export default function NotesWall() {
  const isMobilePerf = useIsMobilePerf();
  const isAdmin = useAdminSession();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [dragFrontId, setDragFrontId] = useState<string | null>(null);
  const notesRef = useRef(notes);
  notesRef.current = notes;
  const postingRef = useRef(false);

  useEffect(() => {
    const ctrl = new AbortController();
    fetch('/api/notes', { signal: ctrl.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (Array.isArray(data)) setNotes(sortNewestFirst(data));
        else setNotes([]);
      })
      .catch((err: unknown) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setNotes([]);
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoaded(true);
      });
    return () => ctrl.abort();
  }, []);

  useEffect(() => {
    const handleAddNote = async (e: Event) => {
      if (postingRef.current) return;
      postingRef.current = true;

      const customEvent = e as CustomEvent<Note>;
      const newNote: Note = {
        ...customEvent.detail,
        created_at: customEvent.detail.created_at || new Date().toISOString(),
      };

      setNotes((prev) => sortNewestFirst([newNote, ...prev]));

      try {
        const res = await fetch('/api/notes', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: newNote.text,
            author: newNote.author,
            date: newNote.date,
          }),
        });

        if (!res.ok) {
          setNotes((prev) => prev.filter((n) => n.id !== newNote.id));
          return;
        }

        const saved = (await res.json()) as Note;
        setNotes((prev) =>
          sortNewestFirst([
            saved,
            ...prev.filter((n) => n.id !== newNote.id && n.id !== saved.id),
          ]),
        );
      } catch {
        setNotes((prev) => prev.filter((n) => n.id !== newNote.id));
      } finally {
        postingRef.current = false;
      }
    };

    window.addEventListener('add-note', handleAddNote);
    return () => window.removeEventListener('add-note', handleAddNote);
  }, []);

  const positionedNotes = useMemo(() => {
    return sortNewestFirst(notes).map((note, index) => {
      const r1 = frac(index * 12.9898 + 78.233);
      const r2 = frac(index * 43.758 + 19.141);
      const r3 = frac(index * 91.532 + 7.617);
      const r4 = frac(index * 27.413 + 53.029);

      if (isMobilePerf) {
        // Mobile: 2-column stagger with tight, controlled offsets
        // Each note gets a column (left/right) + small random jitter
        // Y advances in even steps so cards never fully overlap
        const isLeftCol = index % 2 === 0;
        // X: left col = 2..10%, right col = 50..58%  → max card width ~44vw, safe
        const x = isLeftCol ? 2 + r1 * 8 : 50 + r1 * 8;
        // Y: ~22vh base, then 28vh per note + small ±4vh jitter so there's breathing room
        const y = 22 + index * 28 + (r2 - 0.5) * 8;
        // Rotation: very subtle ±8° — readable but still "dağınık"
        const rotation = (r3 - 0.5) * 16 * (r4 > 0.5 ? 1 : -1);

        return {
          ...note,
          computedX: x,
          computedY: y,
          computedRotation: rotation,
        };
      }

      // Desktop: original wide scatter algorithm — unchanged
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
  }, [notes, isMobilePerf]);

  const freshId = positionedNotes[0]?.id ?? null;
  const monthCount = useMemo(() => {
    const month = istanbulMonthKey();
    return notes.filter((n) => {
      const t = noteTimestamp(n);
      return t > 0 && istanbulMonthKey(t) === month;
    }).length;
  }, [notes]);

  useEffect(() => {
    publishNoteTraces(notes.slice(0, 48).map((n) => ({ id: n.id, t: noteTimestamp(n) })));
  }, [notes]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const previous = notesRef.current;
    setNotes((prev) => sortNewestFirst(prev.filter((n) => n.id !== id)));
    try {
      const res = await fetch(`/api/notes?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('delete failed');
    } catch {
      setNotes(previous);
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

      {isMobilePerf && loaded && (
        <p className="notes-month-badge" aria-live="polite">
          Bu ay bırakılan iz: {monthCount}
        </p>
      )}

      {loaded && positionedNotes.length === 0 && (
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
          const isFresh = note.id === freshId;
          const baseZ = positionedNotes.length - index;
          const zIndex = dragFrontId === note.id ? 80 : baseZ;

          // Mobile cards are narrower so two columns don't collide
          const mobileMaxW = 'min(44vw, 200px)';
          const desktopMaxW = 'min(300px, calc(100vw - 1.5rem))';
          const mobileLeft = `clamp(0.25rem, ${note.computedX}%, calc(50% - min(44vw, 200px) - 0.25rem))`;
          const desktopLeft = `clamp(0.5rem, ${note.computedX}%, calc(100% - min(300px, calc(100vw - 1rem)) - 0.5rem))`;

          const commonStyle: CSSProperties = {
            position: 'absolute',
            left: isMobilePerf ? mobileLeft : desktopLeft,
            top: `${note.computedY}vh`,
            padding: isMobilePerf ? '0.9rem' : '2rem',
            background: note.isAdmin ? 'rgba(255, 215, 0, 0.04)' : 'var(--card-bg)',
            border: note.isAdmin
              ? '1px solid rgba(255, 215, 0, 0.15)'
              : '1px solid var(--card-border)',
            borderRadius: '8px',
            maxWidth: isMobilePerf ? mobileMaxW : desktopMaxW,
            width: isMobilePerf ? mobileMaxW : undefined,
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
                className={`note-card${note.isAdmin ? ' admin-note' : ''}${isFresh ? ' note-card--fresh' : ''}`}
                style={{
                  ...commonStyle,
                  transform: `rotate(${note.computedRotation}deg)`,
                  cursor: 'default',
                }}
              >
                <NoteBody note={note} isAdmin={isAdmin} isFresh={isFresh} onDelete={handleDelete} />
              </div>
            );
          }

          return (
            <DraggableNoteCard
              key={note.id}
              note={note}
              style={commonStyle}
              isAdmin={isAdmin}
              isFresh={isFresh}
              onDelete={handleDelete}
              onDragFront={setDragFrontId}
            />
          );
        })}
      </div>
    </div>
  );
}
