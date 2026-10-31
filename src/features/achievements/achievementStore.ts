import { useEffect, useSyncExternalStore } from 'react';
import {
  ACHIEVEMENT_MAP,
  REQUIRED_ACHIEVEMENT_IDS,
  isValidAchievementId,
  type AchievementDefinition,
  type AchievementId,
} from './definitions';

export const ACHIEVEMENTS_STORAGE_KEY = 'yigit_achievements_v1';
export const ACHIEVEMENTS_SCHEMA_VERSION = 2;

export interface StoredAchievementData {
  version: number;
  unlocked: Partial<Record<AchievementId, number>>;
  seenDomains: string[];
  discoveredInscriptions: string[];
  oyukCompletedVisits: number;
  goldenTrophyAwarded: boolean;
}

export interface AchievementToastItem {
  id: AchievementId;
  definition: AchievementDefinition;
  unlockedAt: number;
  isGoldenTrophy: boolean;
}

export interface AchievementRuntimeState extends StoredAchievementData {
  unlockedCount: number;
  totalRequired: number;
  toastQueue: AchievementToastItem[];
}

function createDefaultStoredData(): StoredAchievementData {
  return {
    version: ACHIEVEMENTS_SCHEMA_VERSION,
    unlocked: {},
    seenDomains: ['Muryokusho'],
    discoveredInscriptions: [],
    oyukCompletedVisits: 0,
    goldenTrophyAwarded: false,
  };
}

function sanitizeStringList(input: unknown, maxLen = 64): string[] {
  if (!Array.isArray(input)) return [];
  const seen = new Set<string>();
  for (const item of input) {
    if (typeof item === 'string' && item.trim().length > 0 && item.length <= 64) {
      seen.add(item.trim());
      if (seen.size >= maxLen) break;
    }
  }
  return Array.from(seen);
}

/**
 * Defensive parser & backward-compatible migrator for stored achievement state (§9).
 * - Preserves valid unlocked timestamps for the 10 canonical required achievements.
 * - Strips removed/unknown achievement IDs without crashing.
 * - Recalculates `goldenTrophyAwarded` strictly against the 10 current required IDs.
 */
export function parseStoredAchievements(raw: string | null): StoredAchievementData {
  const fallback = createDefaultStoredData();
  if (!raw || typeof raw !== 'string') return fallback;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') return fallback;

    const unlocked: Partial<Record<AchievementId, number>> = {};
    const rawUnlocked = parsed.unlocked;

    if (rawUnlocked && typeof rawUnlocked === 'object' && !Array.isArray(rawUnlocked)) {
      for (const [key, val] of Object.entries(rawUnlocked as Record<string, unknown>)) {
        if (!isValidAchievementId(key)) continue;
        if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
          unlocked[key] = Math.floor(val);
        } else if (
          val &&
          typeof val === 'object' &&
          typeof (val as { unlockedAt?: unknown }).unlockedAt === 'number' &&
          Number.isFinite((val as { unlockedAt: number }).unlockedAt) &&
          (val as { unlockedAt: number }).unlockedAt > 0
        ) {
          unlocked[key] = Math.floor((val as { unlockedAt: number }).unlockedAt);
        }
      }
    } else if (Array.isArray(rawUnlocked)) {
      const now = Date.now();
      for (const id of rawUnlocked) {
        if (isValidAchievementId(id) && !unlocked[id]) {
          unlocked[id] = now;
        }
      }
    }

    const seenDomains = sanitizeStringList(parsed.seenDomains, 10);
    if (!seenDomains.includes('Muryokusho')) {
      seenDomains.unshift('Muryokusho');
    }

    const discoveredInscriptions = sanitizeStringList(parsed.discoveredInscriptions, 50);

    const rawVisits = Number(parsed.oyukCompletedVisits);
    const oyukCompletedVisits =
      Number.isFinite(rawVisits) && rawVisits >= 0 ? Math.min(Math.floor(rawVisits), 9999) : 0;

    // Recalculate Golden Trophy strictly against the 10 canonical required achievements (§8 & §9.2)
    const allRequiredDone = REQUIRED_ACHIEVEMENT_IDS.every((reqId) => Boolean(unlocked[reqId]));
    const goldenTrophyAwarded = allRequiredDone;
    if (allRequiredDone) {
      if (!unlocked.golden_trophy) {
        unlocked.golden_trophy = Date.now();
      }
    } else {
      delete unlocked.golden_trophy;
    }

    return {
      version: ACHIEVEMENTS_SCHEMA_VERSION,
      unlocked,
      seenDomains,
      discoveredInscriptions,
      oyukCompletedVisits,
      goldenTrophyAwarded,
    };
  } catch {
    return fallback;
  }
}

export function readStoredAchievements(): StoredAchievementData {
  try {
    if (typeof localStorage === 'undefined') return createDefaultStoredData();
    return parseStoredAchievements(localStorage.getItem(ACHIEVEMENTS_STORAGE_KEY));
  } catch {
    return createDefaultStoredData();
  }
}

export function writeStoredAchievements(data: StoredAchievementData): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const payload: StoredAchievementData = {
      version: ACHIEVEMENTS_SCHEMA_VERSION,
      unlocked: data.unlocked,
      seenDomains: data.seenDomains,
      discoveredInscriptions: data.discoveredInscriptions,
      oyukCompletedVisits: data.oyukCompletedVisits,
      goldenTrophyAwarded: data.goldenTrophyAwarded,
    };
    localStorage.setItem(ACHIEVEMENTS_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* private / quota mode */
  }
}

function countRequiredUnlocked(unlocked: Partial<Record<AchievementId, number>>): number {
  let count = 0;
  for (const id of REQUIRED_ACHIEVEMENT_IDS) {
    if (unlocked[id]) count += 1;
  }
  return count;
}

const initialStored = readStoredAchievements();

let state: AchievementRuntimeState = {
  ...initialStored,
  unlockedCount: countRequiredUnlocked(initialStored.unlocked),
  totalRequired: REQUIRED_ACHIEVEMENT_IDS.length,
  toastQueue: [],
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((fn) => fn());
}

function updateState(next: StoredAchievementData, nextQueue: AchievementToastItem[] = state.toastQueue) {
  state = {
    ...next,
    unlockedCount: countRequiredUnlocked(next.unlocked),
    totalRequired: REQUIRED_ACHIEVEMENT_IDS.length,
    toastQueue: nextQueue,
  };
  writeStoredAchievements(next);
  emitChange();
}

export function getAchievementState(): AchievementRuntimeState {
  return state;
}

export function subscribeAchievements(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function isAchievementUnlocked(id: AchievementId): boolean {
  return Boolean(state.unlocked[id]);
}

function isMemorialQuietRoute(): boolean {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname;
  return p === '/miras' || p === '/atam';
}

/**
 * Central idempotent unlock function (§8 & §9).
 * - Validates ID against the 10 canonical required IDs + `golden_trophy`.
 * - Checks if already unlocked.
 * - Persists new unlock & timestamp.
 * - Enqueues notification once (suppresses ordinary toasts inside `/miras` quiet mode;
 *   404 route toasts are queued and deferred by `AchievementToast` until leaving the 404 scene).
 * - Automatically evaluates and awards `golden_trophy` when all 10 required achievements are complete (§8).
 */
export function unlockAchievement(
  id: AchievementId,
  opts?: { silent?: boolean; timestamp?: number },
): boolean {
  if (!isValidAchievementId(id)) return false;

  // Golden trophy cannot be unlocked directly before all 10 prerequisites are met
  if (id === 'golden_trophy') {
    const allDone = REQUIRED_ACHIEVEMENT_IDS.every((reqId) => Boolean(state.unlocked[reqId]));
    if (!allDone) return false;
  }

  if (state.unlocked[id]) {
    return false;
  }

  const now =
    typeof opts?.timestamp === 'number' && Number.isFinite(opts.timestamp) && opts.timestamp > 0
      ? Math.floor(opts.timestamp)
      : Date.now();

  const nextUnlocked: Partial<Record<AchievementId, number>> = {
    ...state.unlocked,
    [id]: now,
  };

  const nextQueue = [...state.toastQueue];
  const quietMemorial = isMemorialQuietRoute();
  const shouldSuppressOrdinaryToast = Boolean(opts?.silent || quietMemorial);

  if (!shouldSuppressOrdinaryToast && !nextQueue.some((t) => t.id === id)) {
    nextQueue.push({
      id,
      definition: ACHIEVEMENT_MAP[id],
      unlockedAt: now,
      isGoldenTrophy: id === 'golden_trophy',
    });
  }

  // Evaluate Golden Trophy completion across the 10 required IDs (§8)
  let goldenTrophyAwarded = state.goldenTrophyAwarded;
  const allRequiredComplete = REQUIRED_ACHIEVEMENT_IDS.every((reqId) =>
    Boolean(nextUnlocked[reqId]),
  );

  if (allRequiredComplete && !nextUnlocked.golden_trophy) {
    const trophyTime = now + 1;
    nextUnlocked.golden_trophy = trophyTime;
    goldenTrophyAwarded = true;

    // Even if earned on /miras or 404, queue the Golden Trophy reveal; AchievementToast
    // defers displaying it until the visitor returns to a standard route.
    if (!opts?.silent && !nextQueue.some((t) => t.id === 'golden_trophy')) {
      nextQueue.push({
        id: 'golden_trophy',
        definition: ACHIEVEMENT_MAP.golden_trophy,
        unlockedAt: trophyTime,
        isGoldenTrophy: true,
      });
    }
  }

  updateState(
    {
      version: ACHIEVEMENTS_SCHEMA_VERSION,
      unlocked: nextUnlocked,
      seenDomains: state.seenDomains,
      discoveredInscriptions: state.discoveredInscriptions,
      oyukCompletedVisits: state.oyukCompletedVisits,
      goldenTrophyAwarded,
    },
    nextQueue,
  );

  return true;
}

export function dismissToastById(id: AchievementId): void {
  const filtered = state.toastQueue.filter((item) => item.id !== id);
  if (filtered.length !== state.toastQueue.length) {
    state = {
      ...state,
      toastQueue: filtered,
    };
    emitChange();
  }
}

export function getAchievementProgress(): {
  unlockedCount: number;
  totalRequired: number;
  goldenTrophyAwarded: boolean;
} {
  return {
    unlockedCount: state.unlockedCount,
    totalRequired: state.totalRequired,
    goldenTrophyAwarded: state.goldenTrophyAwarded,
  };
}

export function getAchievementToastQueue(): AchievementToastItem[] {
  return state.toastQueue;
}

export function shiftAchievementToast(): void {
  if (state.toastQueue.length === 0) return;
  state = {
    ...state,
    toastQueue: state.toastQueue.slice(1),
  };
  emitChange();
}

export function clearAchievementToastQueue(): void {
  if (state.toastQueue.length === 0) return;
  state = {
    ...state,
    toastQueue: [],
  };
  emitChange();
}

/**
 * Track domain switches and unlock `all_domains` ("Üç Yüzlü Boşluk") once all three
 * domain themes (`Muryokusho`, `FukumaMizushi`, `KangoAneitei`) have been experienced (§7.2 #6).
 */
export function recordDomainThemeInteraction(
  _domainId: string,
  _isExplicitSwitch = false,
): void {
  // Theme switching disabled (§3) — single MURYOKUSHO identity
}

/**
 * Called when the visitor arrives inside the unlocked `/oyuk` cave (§7.2 #1).
 */
export function recordOyukEntered(): void {
  unlockAchievement('oyuk_entered');
}

/**
 * Called when the visitor leaves `/oyuk` after an unlocked visit.
 */
export function recordOyukExited(): void {
  const nextVisits = Math.min(state.oyukCompletedVisits + 1, 9999);
  updateState(
    {
      version: ACHIEVEMENTS_SCHEMA_VERSION,
      unlocked: state.unlocked,
      seenDomains: state.seenDomains,
      discoveredInscriptions: state.discoveredInscriptions,
      oyukCompletedVisits: nextVisits,
      goldenTrophyAwarded: state.goldenTrophyAwarded,
    },
    state.toastQueue,
  );
}

/**
 * Called when the visitor's flashlight genuinely illuminates a cave inscription (§7.2 #2).
 * Unlocks `five_inscriptions` ("Duvarların Hafızası") once at least 5 distinct inscriptions are illuminated.
 */
export function recordCaveInscriptionDiscovered(inscriptionId: string): boolean {
  if (!inscriptionId || typeof inscriptionId !== 'string') return false;

  if (!state.discoveredInscriptions.includes(inscriptionId)) {
    const nextList = [...state.discoveredInscriptions, inscriptionId];
    updateState(
      {
        version: ACHIEVEMENTS_SCHEMA_VERSION,
        unlocked: state.unlocked,
        seenDomains: state.seenDomains,
        discoveredInscriptions: nextList,
        oyukCompletedVisits: state.oyukCompletedVisits,
        goldenTrophyAwarded: state.goldenTrophyAwarded,
      },
      state.toastQueue,
    );
  }

  const count = state.discoveredInscriptions.length;
  if (count >= 5) {
    unlockAchievement('five_inscriptions');
  }
  return true;
}

/**
 * Called when the visitor discovers and activates the hidden cave symbol (§7.2 #3).
 */
export function recordCaveSecretSymbolDiscovered(): void {
  unlockAchievement('hidden_cave_symbol');
}

/**
 * Reconcile and migrate existing storage on initial app boot (§9).
 */
export function syncAchievementsOnBoot(): void {
  const stored = readStoredAchievements();
  writeStoredAchievements(stored);
  state = {
    ...stored,
    unlockedCount: countRequiredUnlocked(stored.unlocked),
    totalRequired: REQUIRED_ACHIEVEMENT_IDS.length,
    toastQueue: state.toastQueue,
  };
  emitChange();
}

/**
 * Test and development-only helper to reset or seed achievement state cleanly.
 */
export function resetAchievementsForTests(initial?: Partial<StoredAchievementData>): void {
  try {
    localStorage.removeItem(ACHIEVEMENTS_STORAGE_KEY);
  } catch {
    /* ignore */
  }

  const base = createDefaultStoredData();
  const merged: StoredAchievementData = {
    version: ACHIEVEMENTS_SCHEMA_VERSION,
    unlocked: initial?.unlocked ? { ...initial.unlocked } : base.unlocked,
    seenDomains: initial?.seenDomains ? [...initial.seenDomains] : base.seenDomains,
    discoveredInscriptions: initial?.discoveredInscriptions
      ? [...initial.discoveredInscriptions]
      : base.discoveredInscriptions,
    oyukCompletedVisits: initial?.oyukCompletedVisits ?? base.oyukCompletedVisits,
    goldenTrophyAwarded: initial?.goldenTrophyAwarded ?? base.goldenTrophyAwarded,
  };

  writeStoredAchievements(merged);
  state = {
    ...merged,
    unlockedCount: countRequiredUnlocked(merged.unlocked),
    totalRequired: REQUIRED_ACHIEVEMENT_IDS.length,
    toastQueue: [],
  };
  emitChange();
}

export function syncAchievementsFromStorage(): void {
  syncAchievementsOnBoot();
}

export function useAchievements(): AchievementRuntimeState {
  const snapshot = useSyncExternalStore(
    subscribeAchievements,
    getAchievementState,
    getAchievementState,
  );

  useEffect(() => {
    syncAchievementsOnBoot();
  }, []);

  return snapshot;
}

export function useAchievementState(): AchievementRuntimeState {
  return useAchievements();
}

export function useAchievementProgress(): {
  unlockedCount: number;
  totalRequired: number;
  goldenTrophyAwarded: boolean;
} {
  const snap = useAchievements();
  return {
    unlockedCount: snap.unlockedCount,
    totalRequired: snap.totalRequired,
    goldenTrophyAwarded: snap.goldenTrophyAwarded,
  };
}

export function useAchievementToastQueue(): AchievementToastItem[] {
  const snap = useAchievements();
  return snap.toastQueue;
}
