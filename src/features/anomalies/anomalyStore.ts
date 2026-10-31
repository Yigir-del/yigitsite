import { useSyncExternalStore } from 'react';
import { releaseAmbient, takeAmbient } from '../../utils/ambientSlot';
import { getOyukState, isCinematicActive } from '../oyuk/oyukState';
import { recordWorldMemoryAnomaly } from '../worldMemory/worldMemoryStore';

export const ANOMALY_INITIAL_DELAY_MS = 42_000;
export const ANOMALY_COOLDOWN_MS = 75_000;
export const ANOMALY_LIFETIME_MS = 14_000;
export const ANOMALY_REVEAL_HOLD_MS = 3_600;
export const MAX_ANOMALIES_PER_SESSION = 3;

export const ANOMALY_MESSAGES = [
  'Bunu görmemen gerekiyordu.',
  'Burada bir şey yanlış.',
  'Gerçeklik kısa bir süreliğine cevap vermedi.',
  'Bazen boşluk da çatlar.',
] as const;

export type AnomalyPhase = 'emergent' | 'active' | 'activated' | 'closing';

export interface ActiveAnomaly {
  id: number;
  /** Viewport percentage X (18..82) */
  xPct: number;
  /** Viewport percentage Y (20..74) */
  yPct: number;
  /** Rotation angle in degrees (-28..28) */
  angleDeg: number;
  phase: AnomalyPhase;
  message: string;
  spawnedAt: number;
}

export interface AnomalySnapshot {
  current: ActiveAnomaly | null;
  spawnCountThisSession: number;
  lastClosedAt: number;
}

let snapshot: AnomalySnapshot = {
  current: null,
  spawnCountThisSession: 0,
  lastClosedAt: 0,
};

let seq = 0;
const listeners = new Set<() => void>();

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

export function getAnomalySnapshot(): AnomalySnapshot {
  return snapshot;
}

export function subscribeAnomaly(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useAnomalyState(): AnomalySnapshot {
  return useSyncExternalStore(
    subscribeAnomaly,
    getAnomalySnapshot,
    getAnomalySnapshot,
  );
}

export interface SpawnAnomalyOptions {
  pathname?: string;
  isNotFoundPage?: boolean;
  now?: number;
  bypassCooldown?: boolean;
  xPct?: number;
  yPct?: number;
}

export interface SpawnAnomalyResult {
  spawned: boolean;
  reason?:
    | 'already_active'
    | 'session_cap_reached'
    | 'suppressed_route_or_cinematic'
    | 'cooldown'
    | 'ambient_slot_busy';
  anomaly?: ActiveAnomaly;
}

export function isAnomalyRouteSuppressed(
  pathname: string,
  isNotFoundPage = false,
): boolean {
  if (isNotFoundPage) return true;
  if (pathname === '/oyuk' || pathname === '/miras') return true;
  const oyuk = getOyukState();
  if (isCinematicActive(oyuk.phase) || oyuk.pendingCinematic) return true;
  return false;
}

/**
 * Attempts to spawn a single subtle Reality Anomaly (§7.4).
 */
export function trySpawnAnomaly(opts: SpawnAnomalyOptions = {}): SpawnAnomalyResult {
  if (snapshot.current !== null) {
    return { spawned: false, reason: 'already_active' };
  }

  if (snapshot.spawnCountThisSession >= MAX_ANOMALIES_PER_SESSION) {
    return { spawned: false, reason: 'session_cap_reached' };
  }

  const pathname = opts.pathname ?? '/';
  if (isAnomalyRouteSuppressed(pathname, opts.isNotFoundPage)) {
    return { spawned: false, reason: 'suppressed_route_or_cinematic' };
  }

  const now = opts.now ?? Date.now();
  if (
    !opts.bypassCooldown &&
    snapshot.lastClosedAt > 0 &&
    now - snapshot.lastClosedAt < ANOMALY_COOLDOWN_MS
  ) {
    return { spawned: false, reason: 'cooldown' };
  }

  if (!takeAmbient('anomaly')) {
    return { spawned: false, reason: 'ambient_slot_busy' };
  }

  seq += 1;
  const msgIndex = (seq - 1) % ANOMALY_MESSAGES.length;
  // Deterministic-feeling spread across safe background regions (avoiding edges & center nav)
  const defaultXPct = seq % 2 === 1 ? 24 + ((seq * 13) % 18) : 64 + ((seq * 11) % 16);
  const defaultYPct = 24 + ((seq * 17) % 44);

  const anomaly: ActiveAnomaly = {
    id: seq,
    xPct: opts.xPct ?? defaultXPct,
    yPct: opts.yPct ?? defaultYPct,
    angleDeg: ((seq * 19) % 44) - 22,
    phase: 'active',
    message: ANOMALY_MESSAGES[msgIndex],
    spawnedAt: now,
  };

  snapshot = {
    ...snapshot,
    current: anomaly,
    spawnCountThisSession: snapshot.spawnCountThisSession + 1,
  };
  emitChange();

  return {
    spawned: true,
    anomaly,
  };
}

/**
 * Activates the currently visible anomaly when the user clicks/taps it (§7.3).
 */
export function activateCurrentAnomaly(): ActiveAnomaly | null {
  if (!snapshot.current) return null;
  if (snapshot.current.phase === 'activated' || snapshot.current.phase === 'closing') {
    return snapshot.current;
  }

  const updated: ActiveAnomaly = {
    ...snapshot.current,
    phase: 'activated',
  };

  snapshot = {
    ...snapshot,
    current: updated,
  };

  recordWorldMemoryAnomaly();
  emitChange();
  return updated;
}

export function beginClosingCurrentAnomaly(): void {
  if (!snapshot.current || snapshot.current.phase === 'closing') return;
  snapshot = {
    ...snapshot,
    current: {
      ...snapshot.current,
      phase: 'closing',
    },
  };
  emitChange();
}

export function closeCurrentAnomaly(now = Date.now()): void {
  if (!snapshot.current) return;
  releaseAmbient('anomaly');
  snapshot = {
    ...snapshot,
    current: null,
    lastClosedAt: now,
  };
  emitChange();
}

export function resetAnomalyStoreForTests(): void {
  releaseAmbient('anomaly');
  seq = 0;
  snapshot = {
    current: null,
    spawnCountThisSession: 0,
    lastClosedAt: 0,
  };
  emitChange();
}
