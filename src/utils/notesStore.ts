import { useEffect, useSyncExternalStore } from 'react';
import type { Note } from '../data/notes';
import { APP_EVENTS } from './events';
import { publishNoteTraces } from './noteTraces';

export type PositionedNote = Note & {
  computedX: number;
  computedY: number;
  computedRotation: number;
};

export interface NotesStoreState {
  notes: Note[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

export function noteTimestamp(note: Note): number {
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

export function sortNewestFirst(list: Note[]): Note[] {
  return [...list].sort((a, b) => noteTimestamp(b) - noteTimestamp(a));
}

export function relativeIz(ts: number, now = Date.now()): string {
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

function frac(seed: number): number {
  const n = Math.sin(seed) * 10000;
  return n - Math.floor(n);
}

export function computePositionedNotes(notes: Note[], isMobilePerf: boolean): PositionedNote[] {
  return sortNewestFirst(notes).map((note, index) => {
    const r1 = frac(index * 12.9898 + 78.233);
    const r2 = frac(index * 43.758 + 19.141);
    const r3 = frac(index * 91.532 + 7.617);
    const r4 = frac(index * 27.413 + 53.029);

    if (isMobilePerf) {
      const isLeftCol = index % 2 === 0;
      const x = isLeftCol ? 2 + r1 * 8 : 50 + r1 * 8;
      const y = 22 + index * 28 + (r2 - 0.5) * 8;
      const rotation = (r3 - 0.5) * 16 * (r4 > 0.5 ? 1 : -1);

      return {
        ...note,
        computedX: x,
        computedY: y,
        computedRotation: rotation,
      };
    }

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
}

/**
 * Dynamic container height in vh without artificial 240vh truncation,
 * ensuring large note counts remain scrollable and unclipped.
 */
export function computeWallHeightVh(
  positionedNotes: Pick<PositionedNote, 'computedY'>[],
  isMobilePerf = false,
): number {
  if (positionedNotes.length === 0) return 100;
  const lastY = Math.max(...positionedNotes.map((n) => n.computedY));
  const tailPadding = isMobilePerf ? 44 : 48;
  return Math.max(Math.ceil(lastY + tailPadding), 100);
}

// ── Shared In-Memory Store ──
let state: NotesStoreState = {
  notes: [],
  loaded: false,
  loading: false,
  error: null,
};

const listeners = new Set<() => void>();
let inFlightFetch: Promise<void> | null = null;
let posting = false;
let globalListenerAttached = false;

function syncTraces(notes: Note[]) {
  publishNoteTraces(notes.slice(0, 48).map((n) => ({ id: n.id, t: noteTimestamp(n) })));
}

function setState(partial: Partial<NotesStoreState>) {
  state = { ...state, ...partial };
  if (partial.notes !== undefined) {
    syncTraces(state.notes);
  }
  listeners.forEach((l) => l());
}

export function getNotesState(): NotesStoreState {
  return state;
}

export function subscribeNotes(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function resetNotesStoreForTests(initial?: Partial<NotesStoreState>) {
  state = {
    notes: [],
    loaded: false,
    loading: false,
    error: null,
    ...initial,
  };
  inFlightFetch = null;
  posting = false;
}

export async function fetchNotes(force = false): Promise<void> {
  if (state.loaded && !force && !state.error) return;
  if (inFlightFetch && !force) return inFlightFetch;

  setState({ loading: true, error: null });

  const task = (async () => {
    try {
      const res = await fetch('/api/notes');
      if (!res.ok) {
        throw new Error(`Notlar alınamadı (${res.status})`);
      }
      const data: unknown = await res.json();
      const fetched = Array.isArray(data) ? (data as Note[]) : [];
      // Preserve any optimistic notes currently in flight
      const optimistic = state.notes.filter((n) => n.id.startsWith('optimistic-'));
      const fetchedIds = new Set(fetched.map((n) => n.id));
      const merged = [
        ...optimistic.filter((n) => !fetchedIds.has(n.id)),
        ...fetched,
      ];
      setState({
        notes: sortNewestFirst(merged),
        loaded: true,
        loading: false,
        error: null,
      });
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        setState({ loading: false });
        return;
      }
      setState({
        loaded: true,
        loading: false,
        error: 'Defterin sayfalarına şu an ulaşılamıyor.',
      });
    } finally {
      inFlightFetch = null;
    }
  })();

  inFlightFetch = task;
  return task;
}

export interface SubmitNoteInput {
  id?: string;
  text: string;
  author?: string;
  date?: string;
  created_at?: string;
}

export interface SubmitNoteResult {
  ok: boolean;
  note?: Note;
  error?: string;
}

export async function submitNote(input: SubmitNoteInput): Promise<SubmitNoteResult> {
  if (posting) {
    return { ok: false, error: 'Not gönderiliyor, lütfen bekle.' };
  }

  const trimmedText = input.text.trim();
  if (!trimmedText || trimmedText.length > 500) {
    return { ok: false, error: 'Geçersiz not metni.' };
  }

  posting = true;
  const now = new Date();
  const formattedDate =
    input.date ||
    `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()}`;
  const optimisticId = input.id
    ? input.id.startsWith('optimistic-')
      ? input.id
      : `optimistic-${input.id}`
    : `optimistic-${Date.now()}`;

  const optimisticNote: Note = {
    id: optimisticId,
    text: trimmedText,
    author: (input.author ?? '').trim().slice(0, 40) || 'Gizemli Yabancı',
    isAdmin: false,
    x: 0,
    y: 0,
    rotation: 0,
    date: formattedDate,
    created_at: input.created_at || now.toISOString(),
  };

  setState({
    notes: sortNewestFirst([optimisticNote, ...state.notes]),
  });

  try {
    const res = await fetch('/api/notes', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: optimisticNote.text,
        author: optimisticNote.author,
        date: optimisticNote.date,
      }),
    });

    if (!res.ok) {
      const errBody = (await res.json().catch(() => ({}))) as { error?: string };
      setState({
        notes: state.notes.filter((n) => n.id !== optimisticId),
      });
      const msg =
        res.status === 429
          ? 'Çok hızlı iz bırakıyorsun. Biraz soluklan.'
          : errBody.error || 'İz bırakılamadı. Tekrar dene.';
      return { ok: false, error: msg };
    }

    const saved = (await res.json()) as Note;
    setState({
      notes: sortNewestFirst([
        saved,
        ...state.notes.filter((n) => n.id !== optimisticId && n.id !== saved.id),
      ]),
    });
    return { ok: true, note: saved };
  } catch {
    setState({
      notes: state.notes.filter((n) => n.id !== optimisticId),
    });
    return { ok: false, error: 'Bağlantı hatası. İzin kaydedilemedi.' };
  } finally {
    posting = false;
  }
}

export async function deleteNoteById(id: string): Promise<boolean> {
  const previous = state.notes;
  setState({
    notes: sortNewestFirst(previous.filter((n) => n.id !== id)),
  });

  try {
    const res = await fetch(`/api/notes?id=${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('delete failed');
    return true;
  } catch {
    setState({ notes: previous });
    return false;
  }
}

/**
 * Ensure global `add-note` custom events work even when NotesWall is not mounted.
 */
export function ensureGlobalNoteEventListener(): void {
  if (globalListenerAttached || typeof window === 'undefined') return;
  globalListenerAttached = true;

  window.addEventListener(APP_EVENTS.ADD_NOTE, (e: Event) => {
    const detail = (e as CustomEvent<Note | undefined>).detail;
    if (!detail || typeof detail.text !== 'string') return;
    void submitNote(detail);
  });
}

export function useNotesStore(): NotesStoreState {
  const snapshot = useSyncExternalStore(subscribeNotes, getNotesState, getNotesState);

  useEffect(() => {
    ensureGlobalNoteEventListener();
    void fetchNotes();
  }, []);

  return snapshot;
}
