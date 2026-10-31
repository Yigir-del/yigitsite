import { useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion';
import { hashOwnedStarScreenRatio } from '../../utils/noteTraces';
import {
  noteTimestamp,
  relativeIz,
  useNotesStore,
} from '../../utils/notesStore';
import { isCinematicActive, useOyukState } from '../oyuk/oyukState';
import {
  clearActiveStarBirth,
  selectOwnedStar,
  STAR_BIRTH_DURATION_MS,
  useNoteStars,
} from './noteStarsStore';

/**
 * NoteStarsOverlay (§8):
 * Renders narrowly-scoped interactive star nodes for visitor-owned notes,
 * a poetic Star Birth light arc when a new note is saved, and a read-only
 * Note Star Reveal card when the visitor clicks their star in the sky.
 */
export default function NoteStarsOverlay({
  isNotFoundPage = false,
}: {
  isNotFoundPage?: boolean;
}) {
  const location = useLocation();
  const reducedMotion = usePrefersReducedMotion();
  const oyuk = useOyukState();
  const { notes } = useNotesStore();
  const {
    ownedNoteIds,
    selectedStarNoteId,
    activeStarBirth,
    projectedStars,
  } = useNoteStars();

  const suppressed =
    isNotFoundPage ||
    location.pathname === '/oyuk' ||
    location.pathname === '/miras' ||
    isCinematicActive(oyuk.phase);

  // Map live notes by ID — deleted or missing notes are never interactive (§8.7)
  const liveNotesById = useMemo(() => {
    const map = new Map(notes.map((n) => [n.id, n]));
    return map;
  }, [notes]);

  const activeOwnedNotes = useMemo(
    () =>
      ownedNoteIds
        .map((id) => liveNotesById.get(id))
        .filter((n): n is NonNullable<typeof n> => Boolean(n)),
    [ownedNoteIds, liveNotesById],
  );

  const selectedNote = selectedStarNoteId
    ? liveNotesById.get(selectedStarNoteId) ?? null
    : null;

  // Clear star-birth animation after duration
  useEffect(() => {
    if (!activeStarBirth) return;
    const timer = window.setTimeout(
      () => {
        clearActiveStarBirth();
      },
      reducedMotion ? 500 : STAR_BIRTH_DURATION_MS,
    );
    return () => window.clearTimeout(timer);
  }, [activeStarBirth, reducedMotion]);

  // Close reveal card on Escape or route suppression
  useEffect(() => {
    if (suppressed && selectedStarNoteId) {
      selectOwnedStar(null);
    }
  }, [suppressed, selectedStarNoteId]);

  useEffect(() => {
    if (!selectedStarNoteId) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectOwnedStar(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedStarNoteId]);

  if (suppressed) return null;
  if (activeOwnedNotes.length === 0 && !activeStarBirth) return null;

  const vpWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const vpHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const resolveStarScreenPoint = (id: string): { x: number; y: number } => {
    const projected = projectedStars[id];
    if (projected && projected.visible) {
      return { x: projected.x, y: projected.y };
    }
    const ratio = hashOwnedStarScreenRatio(id);
    return {
      x: Math.round(ratio.u * vpWidth),
      y: Math.round(ratio.v * vpHeight),
    };
  };

  const birthTarget = activeStarBirth
    ? resolveStarScreenPoint(activeStarBirth.noteId)
    : null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 27,
      }}
    >
      {/* Poetic Star-Birth Feedback when a new note is saved (§8.3) */}
      {activeStarBirth && birthTarget && (
        <div
          aria-live="polite"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
          }}
        >
          {!reducedMotion && (
            <svg
              width={vpWidth}
              height={vpHeight}
              viewBox={`0 0 ${vpWidth} ${vpHeight}`}
              fill="none"
              aria-hidden
              style={{
                position: 'fixed',
                inset: 0,
                pointerEvents: 'none',
              }}
            >
              <path
                d={`M ${Math.round(vpWidth * 0.5)} ${Math.round(vpHeight * 0.78)} Q ${Math.round(
                  (vpWidth * 0.5 + birthTarget.x) * 0.5,
                )} ${Math.round(birthTarget.y - 60)} ${Math.round(birthTarget.x)} ${Math.round(
                  birthTarget.y,
                )}`}
                stroke="rgba(253, 230, 138, 0.55)"
                strokeWidth="1.5"
                strokeDasharray="4 5"
                fill="none"
              />
              <circle
                cx={birthTarget.x}
                cy={birthTarget.y}
                r="14"
                stroke="rgba(253, 230, 138, 0.72)"
                strokeWidth="1.2"
                fill="rgba(254, 243, 199, 0.14)"
              />
            </svg>
          )}
          <div
            style={{
              position: 'fixed',
              left: `${Math.min(Math.max(150, birthTarget.x), vpWidth - 150)}px`,
              top: `${Math.max(54, birthTarget.y - 34)}px`,
              transform: 'translateX(-50%)',
              background: 'rgba(8, 11, 20, 0.88)',
              border: '1px solid rgba(253, 230, 138, 0.35)',
              borderRadius: '999px',
              padding: '0.32rem 0.78rem',
              color: 'rgba(254, 243, 199, 0.94)',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '0.73rem',
              letterSpacing: '0.025em',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 22px rgba(0, 0, 0, 0.5)',
            }}
          >
            ✦ İzin gökyüzünde bir yıldıza dönüştü.
          </div>
        </div>
      )}

      {/* Narrowly-scoped interactive star nodes for visitor-owned notes (§8.5 & §8.11) */}
      {activeOwnedNotes.map((note) => {
        const pt = resolveStarScreenPoint(note.id);
        const isSelected = selectedStarNoteId === note.id;
        return (
          <button
            key={note.id}
            type="button"
            aria-label={`Bıraktığın yıldız notu: ${note.text.slice(0, 36)}`}
            title="Senin yıldızın — bıraktığın izi gör"
            onClick={() => selectOwnedStar(isSelected ? null : note.id)}
            style={{
              position: 'fixed',
              left: `${pt.x}px`,
              top: `${pt.y}px`,
              width: '28px',
              height: '28px',
              transform: `translate(-50%, -50%) scale(${isSelected ? 1.22 : 1})`,
              borderRadius: '50%',
              background: 'transparent',
              border: 'none',
              padding: 0,
              margin: 0,
              cursor: 'pointer',
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.25s ease',
              outline: 'none',
            }}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden
              style={{
                filter: isSelected
                  ? 'drop-shadow(0 0 10px rgba(253, 230, 138, 0.9))'
                  : 'drop-shadow(0 0 6px rgba(254, 243, 199, 0.65))',
              }}
            >
              <circle
                cx="12"
                cy="12"
                r={isSelected ? '8' : '6'}
                fill="rgba(253, 230, 138, 0.14)"
              />
              <path
                d="M12 3 L13.9 9.8 L21 12 L13.9 14.2 L12 21 L10.1 14.2 L3 12 L10.1 9.8 Z"
                fill={isSelected ? '#fde68a' : '#fef3c7'}
                stroke="rgba(251, 191, 36, 0.65)"
                strokeWidth="0.6"
              />
            </svg>
          </button>
        );
      })}

      {/* Read-Only Note Star Reveal Card (§8.5 & §8.6) */}
      {selectedNote && (
        <div
          role="dialog"
          aria-modal="false"
          aria-label="Yıldızdaki notun"
          style={{
            position: 'fixed',
            right: '1.5rem',
            top: '5.2rem',
            width: 'min(320px, calc(100vw - 2.4rem))',
            background: 'rgba(8, 12, 20, 0.92)',
            border: '1px solid rgba(253, 230, 138, 0.28)',
            borderRadius: '14px',
            padding: '1rem 1.15rem',
            color: 'var(--text-main)',
            boxShadow: '0 16px 40px rgba(0, 0, 0, 0.62), 0 0 24px rgba(253, 230, 138, 0.1)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            pointerEvents: 'auto',
            zIndex: 130,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.55rem',
            }}
          >
            <span
              style={{
                fontFamily: 'var(--font-body)',
                fontSize: '0.62rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(253, 230, 138, 0.88)',
              }}
            >
              ✦ Senin Yıldızın
            </span>
            <button
              type="button"
              onClick={() => selectOwnedStar(null)}
              aria-label="Yıldız notunu kapat"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                padding: '0.1rem 0.3rem',
                lineHeight: 1,
              }}
            >
              ✕
            </button>
          </div>

          <p
            style={{
              margin: '0 0 0.7rem 0',
              fontFamily: 'var(--font-display)',
              fontStyle: 'italic',
              fontSize: '0.92rem',
              lineHeight: 1.5,
              color: 'rgba(248, 250, 252, 0.95)',
              wordBreak: 'break-word',
            }}
          >
            “{selectedNote.text}”
          </p>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.68rem',
              color: 'var(--text-muted)',
              borderTop: '1px solid rgba(148, 163, 184, 0.14)',
              paddingTop: '0.48rem',
            }}
          >
            <span>— {selectedNote.author || 'Gizemli Yabancı'}</span>
            <span>
              {relativeIz(noteTimestamp(selectedNote)) || selectedNote.date}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
