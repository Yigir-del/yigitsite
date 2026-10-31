import { useSyncExternalStore } from 'react';
import { recordWorldMemoryMoonSecret } from '../worldMemory/worldMemoryStore';

export const LUNAR_HOLD_DURATION_MS = 750;
export const LUNAR_REVEAL_AUTO_DISMISS_MS = 6800;

export const LUNAR_SECRET_INSCRIPTIONS = [
  'Gökyüzünün de sakladığı şeyler var.',
  'Buradan bakınca her şey küçük.',
  'Ayın karanlık yüzü yalnızca bekleyene döner.',
] as const;

export interface ProjectedMoon {
  x: number;
  y: number;
  radiusPx: number;
  visible: boolean;
}

export interface LunarSecretSnapshot {
  clickCount: number;
  holding: boolean;
  holdProgress: number;
  secretRevealed: boolean;
  secretCount: number;
  activeInscription: string;
  projectedMoon: ProjectedMoon;
}

let snapshot: LunarSecretSnapshot = {
  clickCount: 0,
  holding: false,
  holdProgress: 0,
  secretRevealed: false,
  secretCount: 0,
  activeInscription: LUNAR_SECRET_INSCRIPTIONS[0],
  projectedMoon: {
    x: 0,
    y: 0,
    radiusPx: 42,
    visible: false,
  },
};

const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function getLunarSecretSnapshot(): LunarSecretSnapshot {
  return snapshot;
}

export function subscribeLunarSecret(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useLunarSecret(): LunarSecretSnapshot {
  return useSyncExternalStore(
    subscribeLunarSecret,
    getLunarSecretSnapshot,
    getLunarSecretSnapshot,
  );
}

/**
 * Normal short click on the Moon — preserves original clickCount (> 5 turns blood red).
 */
export function triggerLunarClick(): number {
  const nextCount = snapshot.clickCount + 1;
  snapshot = {
    ...snapshot,
    clickCount: nextCount,
  };
  emitChange();
  return nextCount;
}

export function startLunarHold(): void {
  if (snapshot.holding && snapshot.holdProgress === 0) return;
  snapshot = {
    ...snapshot,
    holding: true,
    holdProgress: 0,
  };
  emitChange();
}

export function updateLunarHoldProgress(progress: number): void {
  const clamped = Math.max(0, Math.min(1, progress));
  if (Math.abs(snapshot.holdProgress - clamped) < 0.01 && snapshot.holding) return;
  snapshot = {
    ...snapshot,
    holding: true,
    holdProgress: clamped,
  };
  emitChange();
}

export function cancelLunarHold(): void {
  if (!snapshot.holding && snapshot.holdProgress === 0) return;
  snapshot = {
    ...snapshot,
    holding: false,
    holdProgress: 0,
  };
  emitChange();
}

/**
 * Completes the deliberate press-and-hold gesture on the Moon (§6.2 & §6.3).
 * Does NOT increment ordinary clickCount; reveals the hidden side and records world memory.
 */
export function completeLunarHold(): LunarSecretSnapshot {
  const nextSecretCount = snapshot.secretCount + 1;
  const inscription =
    LUNAR_SECRET_INSCRIPTIONS[
      (nextSecretCount - 1) % LUNAR_SECRET_INSCRIPTIONS.length
    ];

  snapshot = {
    ...snapshot,
    holding: false,
    holdProgress: 1,
    secretRevealed: true,
    secretCount: nextSecretCount,
    activeInscription: inscription,
  };
  recordWorldMemoryMoonSecret();
  emitChange();
  return snapshot;
}

export function dismissLunarSecret(): void {
  if (!snapshot.secretRevealed && snapshot.holdProgress === 0 && !snapshot.holding) {
    return;
  }
  snapshot = {
    ...snapshot,
    holding: false,
    holdProgress: 0,
    secretRevealed: false,
  };
  emitChange();
}

export function setProjectedMoon(next: ProjectedMoon): void {
  const prev = snapshot.projectedMoon;
  if (
    prev.visible === next.visible &&
    Math.abs(prev.x - next.x) < 0.6 &&
    Math.abs(prev.y - next.y) < 0.6 &&
    Math.abs(prev.radiusPx - next.radiusPx) < 0.6
  ) {
    return;
  }
  snapshot = {
    ...snapshot,
    projectedMoon: next,
  };
  emitChange();
}

export function resetLunarSecretForTests(): void {
  snapshot = {
    clickCount: 0,
    holding: false,
    holdProgress: 0,
    secretRevealed: false,
    secretCount: 0,
    activeInscription: LUNAR_SECRET_INSCRIPTIONS[0],
    projectedMoon: {
      x: 0,
      y: 0,
      radiusPx: 42,
      visible: false,
    },
  };
  emitChange();
}
