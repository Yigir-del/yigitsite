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

function fnv1aHash(id: string): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function hashStarPos(id: string, radius = 26): [number, number, number] {
  const h = fnv1aHash(id);
  const u = (h & 0xffff) / 0xffff;
  const v = ((h >>> 16) & 0xffff) / 0xffff;
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi) * 0.55,
    radius * Math.sin(phi) * Math.sin(theta) - 6,
  ];
}

/**
 * Deterministic forward-frustum 3D position for visitor-owned Note Stars (§8.8).
 * Guaranteed to sit in front of the camera (`[0, 0, 1]` looking toward `-Z`)
 * and clear of the Moon (`[5, 3, -10]`).
 */
export function hashOwnedStarPos(id: string): [number, number, number] {
  const h1 = fnv1aHash(id);
  const h2 = fnv1aHash(`${id}:owned`);
  const u = (h1 & 0xffff) / 0xffff;
  const v = ((h1 >>> 16) & 0xffff) / 0xffff;
  const w = (h2 & 0xffff) / 0xffff;

  // Keep within visible forward sky frustum (camera at z=1, fov=60)
  // Avoid upper-right Moon region (x > 3.2 && y > 1.6)
  let x = -5.4 + u * 9.2; // [-5.4, +3.8]
  let y = -2.1 + v * 5.1; // [-2.1, +3.0]
  const z = -11.2 + w * 2.8; // [-11.2, -8.4]

  if (x > 2.6 && y > 1.4) {
    x -= 3.4;
  }

  return [Number(x.toFixed(3)), Number(y.toFixed(3)), Number(z.toFixed(3))];
}

/**
 * Deterministic normalized viewport coordinates `(u, v)` for visitor-owned Note Stars.
 */
export function hashOwnedStarScreenRatio(id: string): { u: number; v: number } {
  const [x, y] = hashOwnedStarPos(id);
  const u = Math.min(0.82, Math.max(0.16, (x + 6.2) / 11.2));
  const v = Math.min(0.68, Math.max(0.18, 1 - (y + 2.6) / 6.2));
  return { u, v };
}
