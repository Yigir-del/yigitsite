export const NOTE_TRACES_EVENT = 'note-traces';

export type NoteTrace = {
  id: string;
  t: number;
};

let lastTraces: NoteTrace[] = [];

export function getNoteTraces() {
  return lastTraces;
}

export function publishNoteTraces(traces: NoteTrace[]) {
  lastTraces = traces;
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(NOTE_TRACES_EVENT, { detail: traces }));
}

export function hashStarPos(id: string, radius = 26): [number, number, number] {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const u = ((h >>> 0) & 0xffff) / 0xffff;
  const v = ((h >>> 16) & 0xffff) / 0xffff;
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi) * 0.55,
    radius * Math.sin(phi) * Math.sin(theta) - 6,
  ];
}
