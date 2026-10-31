/**
 * anomalyStore.ts (Inert / Disabled §2).
 * All anomaly spawning and background fractures have been disabled.
 */
export const ANOMALY_INITIAL_DELAY_MS = 0;
export const ANOMALY_COOLDOWN_MS = 0;
export const ANOMALY_LIFETIME_MS = 0;
export const ANOMALY_REVEAL_HOLD_MS = 0;
export const MAX_ANOMALIES_PER_SESSION = 0;

export const ANOMALY_MESSAGES = [
  'Bunu görmemen gerekiyordu.',
] as const;

export type AnomalyPhase = 'emergent' | 'active' | 'activated' | 'closing';

export interface ActiveAnomaly {
  id: number;
  xPct: number;
  yPct: number;
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

const emptySnapshot: AnomalySnapshot = {
  current: null,
  spawnCountThisSession: 0,
  lastClosedAt: 0,
};

export function getAnomalySnapshot(): AnomalySnapshot {
  return emptySnapshot;
}

export function subscribeAnomaly(_listener: () => void): () => void {
  return () => {};
}

export function useAnomalyState(): AnomalySnapshot {
  return emptySnapshot;
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
  _pathname: string,
  _isNotFoundPage = false,
): boolean {
  return true;
}

export function trySpawnAnomaly(_opts: SpawnAnomalyOptions = {}): SpawnAnomalyResult {
  return { spawned: false, reason: 'session_cap_reached' };
}

export function activateCurrentAnomaly(): ActiveAnomaly | null {
  return null;
}

export function beginClosingCurrentAnomaly(): void {}

export function closeCurrentAnomaly(_now = Date.now()): void {}

export function resetAnomalyStoreForTests(): void {}
