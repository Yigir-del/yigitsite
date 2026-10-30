import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { Note } from '../data/notes';
import {
  computePositionedNotes,
  computeWallHeightVh,
  deleteNoteById,
  getNotesState,
  noteTimestamp,
  relativeIz,
  resetNotesStoreForTests,
  sortNewestFirst,
  submitNote,
} from './notesStore';
import { isEditableTarget } from './events';

describe('notesStore layout & time helpers', () => {
  it('sorts notes newest first using created_at or numeric id fallback', () => {
    const items: Note[] = [
      { id: '1', text: 'Eski', author: 'A', isAdmin: false, x: 0, y: 0, rotation: 0, date: '01/01/2025', created_at: '2025-01-01T10:00:00Z' },
      { id: '2', text: 'Yeni', author: 'B', isAdmin: false, x: 0, y: 0, rotation: 0, date: '02/01/2026', created_at: '2026-01-02T10:00:00Z' },
    ];
    expect(noteTimestamp(items[1])).toBeGreaterThan(noteTimestamp(items[0]));
    const sorted = sortNewestFirst(items);
    expect(sorted[0].id).toBe('2');
    expect(sorted[1].id).toBe('1');
  });

  it('formats relativeIz labels in Turkish', () => {
    const now = Date.UTC(2026, 3, 20, 12, 0, 0);
    expect(relativeIz(now - 20_000, now)).toBe('az önce');
    expect(relativeIz(now - 5 * 60_000, now)).toBe('5 dakika önce');
    expect(relativeIz(now - 3 * 3_600_000, now)).toBe('3 saat önce');
    expect(relativeIz(now - 26 * 3_600_000, now)).toBe('dün');
    expect(relativeIz(now - 72 * 3_600_000, now)).toBe('3 gün önce');
  });

  it('scales wall height past 240vh so large note counts are never clipped', () => {
    const manyNotes: Note[] = Array.from({ length: 24 }, (_, idx) => ({
      id: String(idx + 1),
      text: `Not ${idx + 1}`,
      author: 'Gezgin',
      isAdmin: false,
      x: 0,
      y: 0,
      rotation: 0,
      date: '20/04/2026',
      created_at: new Date(Date.UTC(2026, 3, 20, 12, idx)).toISOString(),
    }));

    const desktopPositioned = computePositionedNotes(manyNotes, false);
    const mobilePositioned = computePositionedNotes(manyNotes, true);

    expect(desktopPositioned).toHaveLength(24);
    expect(mobilePositioned).toHaveLength(24);

    const desktopHeight = computeWallHeightVh(desktopPositioned, false);
    const mobileHeight = computeWallHeightVh(mobilePositioned, true);

    expect(desktopHeight).toBeGreaterThan(240);
    expect(mobileHeight).toBeGreaterThan(240);
  });
});

describe('notesStore cross-route persistence & rollback', () => {
  beforeEach(() => {
    resetNotesStoreForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    resetNotesStoreForTests();
  });

  it('persists a note even when NotesWall is not mounted and reconciles server response', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'srv-101',
          text: 'Hakkımda sayfasından bırakılan iz',
          author: 'Gezgin',
          isAdmin: false,
          x: 0,
          y: 0,
          rotation: 0,
          date: '20/04/2026',
          created_at: '2026-04-20T12:00:00.000Z',
        }),
        { status: 201, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const res = await submitNote({
      text: 'Hakkımda sayfasından bırakılan iz',
      author: 'Gezgin',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      '/api/notes',
      expect.objectContaining({ method: 'POST' }),
    );
    expect(res.ok).toBe(true);
    expect(res.note?.id).toBe('srv-101');
    const snap = getNotesState();
    expect(snap.notes).toHaveLength(1);
    expect(snap.notes[0].id).toBe('srv-101');
    expect(snap.notes[0].text).toBe('Hakkımda sayfasından bırakılan iz');
  });

  it('rolls back optimistic note when POST /api/notes fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Too Many Requests' }), { status: 429 }),
    );

    const res = await submitNote({ text: 'Başarısız olacak iz', author: 'Anonim' });
    expect(res.ok).toBe(false);
    expect(getNotesState().notes).toHaveLength(0);
  });

  it('rolls back optimistic delete when DELETE /api/notes fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          id: 'srv-202',
          text: 'Silinmeye çalışılan iz',
          author: 'Gezgin',
          isAdmin: false,
          x: 0,
          y: 0,
          rotation: 0,
          date: '20/04/2026',
        }),
        { status: 201 },
      ),
    );
    await submitNote({ text: 'Silinmeye çalışılan iz', author: 'Gezgin' });
    expect(getNotesState().notes).toHaveLength(1);

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Yetkisiz' }), { status: 401 }),
    );

    const deleted = await deleteNoteById('srv-202');
    expect(deleted).toBe(false);
    expect(getNotesState().notes).toHaveLength(1);
    expect(getNotesState().notes[0].id).toBe('srv-202');
  });
});

describe('isEditableTarget', () => {
  it('identifies form controls and contenteditable targets safely', () => {
    expect(isEditableTarget(null)).toBe(false);
    expect(isEditableTarget({ tagName: 'DIV' } as unknown as EventTarget)).toBe(false);
    expect(isEditableTarget({ tagName: 'INPUT' } as unknown as EventTarget)).toBe(true);
    expect(isEditableTarget({ tagName: 'TEXTAREA' } as unknown as EventTarget)).toBe(true);
    expect(
      isEditableTarget({ tagName: 'DIV', isContentEditable: true } as unknown as EventTarget),
    ).toBe(true);
  });
});
