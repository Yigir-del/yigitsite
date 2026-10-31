import { useSyncExternalStore } from 'react';
import type { Note } from '../../data/notes';
import { recordWorldMemoryNoteStar } from '../worldMemory/worldMemoryStore';

export const MY_NOTE_STARS_STORAGE_KEY = 'yigit_my_note_stars_v1';
export const MAX_OWNED_STARS = 12;
export const STAR_BIRTH_DURATION_MS = 1350;

export interface ProjectedStarPoint {
  x: number;
  y: number;
  visible: boolean;
}

export interface ActiveStarBirth {
  noteId: string;
  startedAt: number;
}

export interface NoteStarsSnapshot {
  ownedNoteIds: string[];
  selectedStarNoteId: string | null;
  activeStarBirth: ActiveStarBirth | null;
  projectedStars: Record<string, ProjectedStarPoint>;
}

interface StoredNoteStarsPayload {
  version: 1;
  ownedNoteIds: string[];
}

export function isValidServerNoteId(id: unknown): id is string {
  return (
    typeof id === 'string' &&
    id.trim().length > 0 &&
    !id.trim().startsWith('optimistic-')
  );
}

function readOwnedIdsFromStorage(): string[] {
  try {
    if (typeof localStorage === 'undefined') return [];
    const raw = localStorage.getItem(MY_NOTE_STARS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<StoredNoteStarsPayload> | string[];
    const list = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.ownedNoteIds)
        ? parsed.ownedNoteIds
        : [];
    const seen = new Set<string>();
    const clean: string[] = [];
    for (const item of list) {
      if (isValidServerNoteId(item) && !seen.has(item)) {
        seen.add(item);
        clean.push(item);
      }
      if (clean.length >= MAX_OWNED_STARS) break;
    }
    return clean;
  } catch {
    return [];
  }
}

function writeOwnedIdsToStorage(ids: string[]): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const payload: StoredNoteStarsPayload = {
      version: 1,
      ownedNoteIds: ids.slice(0, MAX_OWNED_STARS),
    };
    localStorage.setItem(MY_NOTE_STARS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignore storage errors
  }
}

let snapshot: NoteStarsSnapshot = {
  ownedNoteIds: readOwnedIdsFromStorage(),
  selectedStarNoteId: null,
  activeStarBirth: null,
  projectedStars: {},
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function getNoteStarsSnapshot(): NoteStarsSnapshot {
  return snapshot;
}

export function subscribeNoteStars(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useNoteStars(): NoteStarsSnapshot {
  return useSyncExternalStore(
    subscribeNoteStars,
    getNoteStarsSnapshot,
    getNoteStarsSnapshot,
  );
}

/**
 * Records a server-confirmed visitor note as an owned star and triggers star-birth feedback (§8.2 & §8.3).
 * Never accepts optimistic-* IDs or empty IDs.
 */
export function recordOwnedNoteSaved(
  note: Pick<Note, 'id'>,
  now = Date.now(),
): boolean {
  if (!note || !isValidServerNoteId(note.id)) {
    return false;
  }

  const nextIds = [
    note.id,
    ...snapshot.ownedNoteIds.filter((existing) => existing !== note.id),
  ].slice(0, MAX_OWNED_STARS);

  writeOwnedIdsToStorage(nextIds);
  snapshot = {
    ...snapshot,
    ownedNoteIds: nextIds,
    activeStarBirth: {
      noteId: note.id,
      startedAt: now,
    },
  };
  emitChange();
  return true;
}

export function clearActiveStarBirth(): void {
  if (!snapshot.activeStarBirth) return;
  snapshot = {
    ...snapshot,
    activeStarBirth: null,
  };
  emitChange();
}

/**
 * Removes a deleted note ID from visitor-owned stars (§8.7).
 */
export function removeOwnedNoteId(id: string): void {
  if (!snapshot.ownedNoteIds.includes(id) && snapshot.selectedStarNoteId !== id) {
    return;
  }
  const nextIds = snapshot.ownedNoteIds.filter((item) => item !== id);
  const nextProjected = { ...snapshot.projectedStars };
  delete nextProjected[id];

  writeOwnedIdsToStorage(nextIds);
  snapshot = {
    ...snapshot,
    ownedNoteIds: nextIds,
    selectedStarNoteId:
      snapshot.selectedStarNoteId === id ? null : snapshot.selectedStarNoteId,
    activeStarBirth:
      snapshot.activeStarBirth?.noteId === id ? null : snapshot.activeStarBirth,
    projectedStars: nextProjected,
  };
  emitChange();
}

/**
 * Prunes any stored owned note IDs that no longer exist in the authoritative server note list (§8.7).
 */
export function pruneDeletedOwnedNotes(liveNotes: readonly Pick<Note, 'id'>[]): void {
  if (snapshot.ownedNoteIds.length === 0) return;
  const liveSet = new Set(
    liveNotes.map((n) => n.id).filter((id) => isValidServerNoteId(id)),
  );
  const nextIds = snapshot.ownedNoteIds.filter((id) => liveSet.has(id));
  if (nextIds.length === snapshot.ownedNoteIds.length) return;

  writeOwnedIdsToStorage(nextIds);
  const nextSelected =
    snapshot.selectedStarNoteId && liveSet.has(snapshot.selectedStarNoteId)
      ? snapshot.selectedStarNoteId
      : null;

  snapshot = {
    ...snapshot,
    ownedNoteIds: nextIds,
    selectedStarNoteId: nextSelected,
  };
  emitChange();
}

/**
 * Opens the read-only Note Star Reveal card and records world memory (§8.5 & §8.10).
 */
export function selectOwnedStar(noteId: string | null): void {
  if (noteId !== null && !snapshot.ownedNoteIds.includes(noteId)) {
    return;
  }
  snapshot = {
    ...snapshot,
    selectedStarNoteId: noteId,
  };
  if (noteId !== null) {
    recordWorldMemoryNoteStar();
  }
  emitChange();
}

export function setProjectedOwnedStars(
  nextMap: Record<string, ProjectedStarPoint>,
): void {
  const prevMap = snapshot.projectedStars;
  const prevKeys = Object.keys(prevMap);
  const nextKeys = Object.keys(nextMap);

  let changed = prevKeys.length !== nextKeys.length;
  if (!changed) {
    for (const key of nextKeys) {
      const a = prevMap[key];
      const b = nextMap[key];
      if (
        !a ||
        a.visible !== b.visible ||
        Math.abs(a.x - b.x) > 0.6 ||
        Math.abs(a.y - b.y) > 0.6
      ) {
        changed = true;
        break;
      }
    }
  }

  if (!changed) return;
  snapshot = {
    ...snapshot,
    projectedStars: nextMap,
  };
  emitChange();
}

export function syncNoteStarsFromStorage(): NoteStarsSnapshot {
  snapshot = {
    ...snapshot,
    ownedNoteIds: readOwnedIdsFromStorage(),
  };
  emitChange();
  return snapshot;
}

export function resetNoteStarsForTests(): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(MY_NOTE_STARS_STORAGE_KEY);
    }
  } catch {
    // Ignore
  }
  snapshot = {
    ownedNoteIds: [],
    selectedStarNoteId: null,
    activeStarBirth: null,
    projectedStars: {},
  };
  emitChange();
}
