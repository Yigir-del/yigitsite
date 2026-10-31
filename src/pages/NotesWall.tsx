import { useState, useEffect, useMemo, useRef, type CSSProperties } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { useAdminSession } from '../hooks/useAdminSession';
import { useIsMobilePerf } from '../hooks/useIsMobilePerf';
import { istanbulMonthKey } from '../utils/samsunTime';
import {
  computePositionedNotes,
  computeWallHeightVh,
  deleteNoteById,
  fetchNotes,
  noteTimestamp,
  relativeIz,
  useNotesStore,
  type PositionedNote,
} from '../utils/notesStore';

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
        <div className="note-card__pin" aria-hidden="true">
          📌
        </div>
      )}

      {isAdmin && (
        <button
          type="button"
          onClick={(e) => onDelete(e, note.id)}
          className="note-card__delete"
          title="Sil"
          aria-label="Notu sil"
        >
          ✕
        </button>
      )}

      <p
        className="note-card__text"
        style={{
          marginTop: isAdmin ? '1rem' : '0',
        }}
      >
        "{note.text}"
      </p>
      <div className="note-card__meta">
        — {note.author}
        {isFresh ? (
          <div className="note-card__when">{relativeIz(noteTimestamp(note))}</div>
        ) : (
          note.date && <div className="note-card__date">{note.date}</div>
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
  const { notes, loaded, error } = useNotesStore();
  const [dragFrontId, setDragFrontId] = useState<string | null>(null);
  const wallRef = useRef<HTMLDivElement | null>(null);

  const positionedNotes = useMemo(
    () => computePositionedNotes(notes, isMobilePerf),
    [notes, isMobilePerf],
  );

  const freshId = positionedNotes[0]?.id ?? null;
  const monthCount = useMemo(() => {
    const month = istanbulMonthKey();
    return notes.filter((n) => {
      const t = noteTimestamp(n);
      return t > 0 && istanbulMonthKey(t) === month;
    }).length;
  }, [notes]);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    await deleteNoteById(id);
  };

  const containerHeightVh = useMemo(
    () => computeWallHeightVh(positionedNotes, isMobilePerf),
    [positionedNotes, isMobilePerf],
  );

  return (
    <div
      ref={wallRef}
      className="page-container notes-wall-container"
      style={{
        height: `${containerHeightVh}vh`,
        minHeight: '100vh',
      }}
    >
      <h1
        className="glitch notes-wall-title"
        data-text="Not Defterim"
      >
        Not Defterim
      </h1>

      {isMobilePerf && loaded && !error && (
        <p className="notes-month-badge" aria-live="polite">
          Bu ay bırakılan iz: {monthCount}
        </p>
      )}

      {loaded && !error && positionedNotes.length === 0 && (
        <p className="notes-wall-empty">Henüz iz yok.</p>
      )}

      {loaded && error && positionedNotes.length === 0 && (
        <div className="notes-wall-error" role="status">
          <p>{error}</p>
          <button
            type="button"
            className="btn-domain notes-wall-retry"
            onClick={() => void fetchNotes(true)}
          >
            Tekrar Dene
          </button>
        </div>
      )}

      <div className="notes-wall-canvas">
        {positionedNotes.map((note, index) => {
          const isFresh = note.id === freshId;
          const baseZ = positionedNotes.length - index;
          const zIndex = dragFrontId === note.id ? 80 : baseZ;

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
