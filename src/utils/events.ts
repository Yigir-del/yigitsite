import type { Note } from '../data/notes';
import type { NoteTrace } from './noteTraces';
import type { FlyerSpeakDetail } from './flyerDialogue';

/**
 * Centralized custom event names and typed helpers.
 * Preserves exact event string names used across the universe.
 */
export const APP_EVENTS = {
  ADD_NOTE: 'add-note',
  WORLD_FLIP: 'world-flip',
  NOTE_TRACES: 'note-traces',
  FLYER_SPEAK: 'flyer-speak',
  UNIVERSE_COLLAPSE: 'universe-404-collapse',
  UNIVERSE_RESTORE: 'universe-404-restore',
  UNIVERSE_PAUSE: 'universe-404-pause',
  SUDO_TERMINAL: 'sudo-terminal',
  MEANING_42: 'meaning-42',
} as const;

export interface AppEventPayloads {
  [APP_EVENTS.ADD_NOTE]: Note;
  [APP_EVENTS.WORLD_FLIP]: undefined;
  [APP_EVENTS.NOTE_TRACES]: NoteTrace[];
  [APP_EVENTS.FLYER_SPEAK]: FlyerSpeakDetail;
  [APP_EVENTS.UNIVERSE_COLLAPSE]: undefined;
  [APP_EVENTS.UNIVERSE_RESTORE]: undefined;
  [APP_EVENTS.UNIVERSE_PAUSE]: undefined;
  [APP_EVENTS.SUDO_TERMINAL]: undefined;
  [APP_EVENTS.MEANING_42]: undefined;
}

export function dispatchAppEvent<K extends keyof AppEventPayloads>(
  type: K,
  ...args: AppEventPayloads[K] extends undefined ? [] : [detail: AppEventPayloads[K]]
): void {
  if (typeof window === 'undefined') return;
  const detail = args[0];
  if (detail === undefined) {
    window.dispatchEvent(new Event(type));
  } else {
    window.dispatchEvent(new CustomEvent(type, { detail }));
  }
}

/** Check whether a keyboard event originated inside an editable input/textarea. */
export function isEditableTarget(target: EventTarget | null): boolean {
  if (!target || typeof target !== 'object') return false;
  const candidate = target as {
    tagName?: unknown;
    isContentEditable?: unknown;
    closest?: (selector: string) => unknown;
  };
  const tag = typeof candidate.tagName === 'string' ? candidate.tagName.toUpperCase() : '';
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (candidate.isContentEditable === true) return true;
  if (typeof candidate.closest === 'function') {
    return Boolean(candidate.closest('input, textarea, select, [contenteditable="true"]'));
  }
  return false;
}
