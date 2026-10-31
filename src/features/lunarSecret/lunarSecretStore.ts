import { useSyncExternalStore } from 'react';

export const LUNAR_HOLD_DURATION_MS = 0;
export const LUNAR_REVEAL_AUTO_DISMISS_MS = 0;

export const LUNAR_SECRET_INSCRIPTIONS = [
  'Gökyüzünün de sakladığı şeyler var.',
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
 * Normal short click on the Moon — disabled (§4).
 * Clicking the moon does absolutely nothing.
 */
export function triggerLunarClick(): number {
  return 0;
}

export function startLunarHold(): void {}

export function updateLunarHoldProgress(_progress: number): void {}

export function cancelLunarHold(): void {}

export function completeLunarHold(): LunarSecretSnapshot {
  return snapshot;
}

export function dismissLunarSecret(): void {}

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
