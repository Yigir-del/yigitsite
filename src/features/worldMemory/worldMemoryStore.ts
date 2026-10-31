import { useEffect, useSyncExternalStore } from 'react';
import { readOyukUnlocked } from '../oyuk/oyukState';

export const WORLD_MEMORY_STORAGE_KEY = 'yigit_world_memory_v1';
export const WORLD_MEMORY_SCHEMA_VERSION = 1;

/** Minimum interval (ms) between memory-aware character lines so they stay occasional (§4.5) */
export const MEMORY_LINE_COOLDOWN_MS = 35_000;

export type MemoryMilestoneKind =
  | 'oyuk'
  | 'moon'
  | 'anomaly'
  | 'encounter'
  | 'note_star';

export interface StoredWorldMemory {
  version: number;
  oyukEnteredAt: number | null;
  oyukExitedAt: number | null;
  moonSecretDiscoveredAt: number | null;
  anomalyDiscoveredAt: number | null;
  encounterExperiencedAt: number | null;
  noteStarDiscoveredAt: number | null;
  pendingAcknowledgement: MemoryMilestoneKind | null;
}

export interface WorldMemoryRuntimeState extends StoredWorldMemory {
  hasEnteredOyuk: boolean;
  hasReturnedFromOyuk: boolean;
  hasDiscoveredMoonSecret: boolean;
  hasDiscoveredAnomaly: boolean;
  hasExperiencedEncounter: boolean;
  hasDiscoveredNoteStar: boolean;
}

/** Canonical post-OYUK Beggar dialogue lines (§4.2) */
export const BEGGAR_MEMORY_OYUK_LINES = [
  'Oraya girdiğini kimseye anlatma kral.',
  'Ben sana yolu gösterdim. Gerisini bilmiyorum.',
  'Taşları kurcalamadın umarım kral.',
] as const;

/** Post-encounter Beggar memory line */
export const BEGGAR_MEMORY_ENCOUNTER_LINES = [
  'O sakallının yanına bir daha yaklaştırma beni kral.',
] as const;

/** Canonical post-OYUK Sage dialogue lines — final line implies even the sage does not know everything (§4.2) */
export const SAGE_MEMORY_OYUK_LINES = [
  'Karanlığın içinde ne buldun?',
  'Bazı soruların cevabı yerin altındadır.',
  'Orada ne gördüğünü ben de bilmiyorum.',
] as const;

/** Contextual Sage memory lines for Moon, Anomaly & Note Star discoveries (§4.5, §6.8, §7.9) */
export const SAGE_MEMORY_COSMIC_LINES = {
  moon: 'Ayın öteki yüzüne bakanlar geceleri biraz daha sessiz yürür.',
  anomaly: 'Boşluğun çatlağını sen de gördün demek.',
  note_star: 'Bıraktığın iz gökyüzüne karışmış.',
} as const;

function createDefaultStoredMemory(): StoredWorldMemory {
  return {
    version: WORLD_MEMORY_SCHEMA_VERSION,
    oyukEnteredAt: null,
    oyukExitedAt: null,
    moonSecretDiscoveredAt: null,
    anomalyDiscoveredAt: null,
    encounterExperiencedAt: null,
    noteStarDiscoveredAt: null,
    pendingAcknowledgement: null,
  };
}

function parseTimestamp(val: unknown): number | null {
  if (typeof val === 'number' && Number.isFinite(val) && val > 0) {
    return Math.floor(val);
  }
  return null;
}

function isValidMilestoneKind(val: unknown): val is MemoryMilestoneKind {
  return (
    val === 'oyuk' ||
    val === 'moon' ||
    val === 'anomaly' ||
    val === 'encounter' ||
    val === 'note_star'
  );
}

export function parseStoredWorldMemory(raw: string | null): StoredWorldMemory {
  const fallback = createDefaultStoredMemory();
  if (!raw || typeof raw !== 'string') return fallback;

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown> | null;
    if (!parsed || typeof parsed !== 'object') return fallback;

    return {
      version: WORLD_MEMORY_SCHEMA_VERSION,
      oyukEnteredAt: parseTimestamp(parsed.oyukEnteredAt),
      oyukExitedAt: parseTimestamp(parsed.oyukExitedAt),
      moonSecretDiscoveredAt: parseTimestamp(parsed.moonSecretDiscoveredAt),
      anomalyDiscoveredAt: parseTimestamp(parsed.anomalyDiscoveredAt),
      encounterExperiencedAt: parseTimestamp(parsed.encounterExperiencedAt),
      noteStarDiscoveredAt: parseTimestamp(parsed.noteStarDiscoveredAt),
      pendingAcknowledgement: isValidMilestoneKind(parsed.pendingAcknowledgement)
        ? parsed.pendingAcknowledgement
        : null,
    };
  } catch {
    return fallback;
  }
}

export function readStoredWorldMemory(): StoredWorldMemory {
  try {
    if (typeof localStorage === 'undefined') return createDefaultStoredMemory();
    return parseStoredWorldMemory(localStorage.getItem(WORLD_MEMORY_STORAGE_KEY));
  } catch {
    return createDefaultStoredMemory();
  }
}

export function writeStoredWorldMemory(data: StoredWorldMemory): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(WORLD_MEMORY_STORAGE_KEY, JSON.stringify(data));
  } catch {
    /* private / quota mode */
  }
}

function deriveRuntimeState(stored: StoredWorldMemory): WorldMemoryRuntimeState {
  // Reuse authoritative OYUK unlock flag as a source of truth alongside explicit entry/exit (§4.4)
  const oyukUnlocked = readOyukUnlocked();
  const hasEnteredOyuk = Boolean(stored.oyukEnteredAt || oyukUnlocked);
  const hasReturnedFromOyuk = Boolean(stored.oyukExitedAt);

  return {
    ...stored,
    hasEnteredOyuk,
    hasReturnedFromOyuk,
    hasDiscoveredMoonSecret: Boolean(stored.moonSecretDiscoveredAt),
    hasDiscoveredAnomaly: Boolean(stored.anomalyDiscoveredAt),
    hasExperiencedEncounter: Boolean(stored.encounterExperiencedAt),
    hasDiscoveredNoteStar: Boolean(stored.noteStarDiscoveredAt),
  };
}

let state: WorldMemoryRuntimeState = deriveRuntimeState(readStoredWorldMemory());
let lastMemoryLineAt = 0;
let lastBeggarMemoryLine = '';
let lastSageMemoryLine = '';

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((fn) => fn());
}

function updateStoredMemory(partial: Partial<StoredWorldMemory>) {
  const nextStored: StoredWorldMemory = {
    version: WORLD_MEMORY_SCHEMA_VERSION,
    oyukEnteredAt: partial.oyukEnteredAt !== undefined ? partial.oyukEnteredAt : state.oyukEnteredAt,
    oyukExitedAt: partial.oyukExitedAt !== undefined ? partial.oyukExitedAt : state.oyukExitedAt,
    moonSecretDiscoveredAt:
      partial.moonSecretDiscoveredAt !== undefined
        ? partial.moonSecretDiscoveredAt
        : state.moonSecretDiscoveredAt,
    anomalyDiscoveredAt:
      partial.anomalyDiscoveredAt !== undefined
        ? partial.anomalyDiscoveredAt
        : state.anomalyDiscoveredAt,
    encounterExperiencedAt:
      partial.encounterExperiencedAt !== undefined
        ? partial.encounterExperiencedAt
        : state.encounterExperiencedAt,
    noteStarDiscoveredAt:
      partial.noteStarDiscoveredAt !== undefined
        ? partial.noteStarDiscoveredAt
        : state.noteStarDiscoveredAt,
    pendingAcknowledgement:
      partial.pendingAcknowledgement !== undefined
        ? partial.pendingAcknowledgement
        : state.pendingAcknowledgement,
  };

  writeStoredWorldMemory(nextStored);
  state = deriveRuntimeState(nextStored);
  emitChange();
}

export function getWorldMemoryState(): WorldMemoryRuntimeState {
  return state;
}

export function subscribeWorldMemory(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function recordWorldMemoryOyukEntered(now = Date.now()): void {
  if (state.oyukEnteredAt) return;
  updateStoredMemory({
    oyukEnteredAt: now,
  });
}

export function recordWorldMemoryOyukExited(now = Date.now()): void {
  const firstExit = !state.oyukExitedAt;
  updateStoredMemory({
    oyukEnteredAt: state.oyukEnteredAt ?? now,
    oyukExitedAt: state.oyukExitedAt ?? now,
    pendingAcknowledgement: firstExit ? 'oyuk' : state.pendingAcknowledgement,
  });
}

export function recordWorldMemoryMoonSecret(now = Date.now()): void {
  const isFirst = !state.moonSecretDiscoveredAt;
  updateStoredMemory({
    moonSecretDiscoveredAt: state.moonSecretDiscoveredAt ?? now,
    pendingAcknowledgement: isFirst ? 'moon' : state.pendingAcknowledgement,
  });
}

export function recordWorldMemoryAnomaly(now = Date.now()): void {
  const isFirst = !state.anomalyDiscoveredAt;
  updateStoredMemory({
    anomalyDiscoveredAt: state.anomalyDiscoveredAt ?? now,
    pendingAcknowledgement: isFirst ? 'anomaly' : state.pendingAcknowledgement,
  });
}

export function recordWorldMemoryEncounter(now = Date.now()): void {
  const isFirst = !state.encounterExperiencedAt;
  updateStoredMemory({
    encounterExperiencedAt: state.encounterExperiencedAt ?? now,
    pendingAcknowledgement: isFirst ? 'encounter' : state.pendingAcknowledgement,
  });
}

export function recordWorldMemoryNoteStar(now = Date.now()): void {
  const isFirst = !state.noteStarDiscoveredAt;
  updateStoredMemory({
    noteStarDiscoveredAt: state.noteStarDiscoveredAt ?? now,
    pendingAcknowledgement: isFirst ? 'note_star' : state.pendingAcknowledgement,
  });
}

/**
 * Selects an eligible memory-aware line for `beggar` or `sage` when appropriate,
 * or returns `null` so ordinary character dialogue remains dominant (§4.5).
 *
 * Rules:
 * - Never returns a line before the corresponding discovery has actually occurred.
 * - Honors a one-time `pendingAcknowledgement` shortly after a fresh discovery.
 * - Enforces `MEMORY_LINE_COOLDOWN_MS` and deduplicates back-to-back lines.
 */
export function selectContextualMemoryLine(
  actor: 'beggar' | 'sage',
  opts?: { now?: number; forceRoll?: number },
): string | null {
  const now = opts?.now ?? Date.now();
  const pending = state.pendingAcknowledgement;

  // 1. Priority one-shot acknowledgement after a fresh discovery
  if (pending) {
    if (actor === 'beggar' && pending === 'oyuk' && state.hasReturnedFromOyuk) {
      const line = BEGGAR_MEMORY_OYUK_LINES[0];
      lastMemoryLineAt = now;
      lastBeggarMemoryLine = line;
      updateStoredMemory({ pendingAcknowledgement: null });
      return line;
    }
    if (actor === 'beggar' && pending === 'encounter' && state.hasExperiencedEncounter) {
      const line = BEGGAR_MEMORY_ENCOUNTER_LINES[0];
      lastMemoryLineAt = now;
      lastBeggarMemoryLine = line;
      updateStoredMemory({ pendingAcknowledgement: null });
      return line;
    }
    if (actor === 'sage' && pending === 'oyuk' && state.hasReturnedFromOyuk) {
      const line = SAGE_MEMORY_OYUK_LINES[0];
      lastMemoryLineAt = now;
      lastSageMemoryLine = line;
      updateStoredMemory({ pendingAcknowledgement: null });
      return line;
    }
    if (actor === 'sage' && pending === 'moon' && state.hasDiscoveredMoonSecret) {
      const line = SAGE_MEMORY_COSMIC_LINES.moon;
      lastMemoryLineAt = now;
      lastSageMemoryLine = line;
      updateStoredMemory({ pendingAcknowledgement: null });
      return line;
    }
    if (actor === 'sage' && pending === 'anomaly' && state.hasDiscoveredAnomaly) {
      const line = SAGE_MEMORY_COSMIC_LINES.anomaly;
      lastMemoryLineAt = now;
      lastSageMemoryLine = line;
      updateStoredMemory({ pendingAcknowledgement: null });
      return line;
    }
    if (actor === 'sage' && pending === 'note_star' && state.hasDiscoveredNoteStar) {
      const line = SAGE_MEMORY_COSMIC_LINES.note_star;
      lastMemoryLineAt = now;
      lastSageMemoryLine = line;
      updateStoredMemory({ pendingAcknowledgement: null });
      return line;
    }
  }

  // 2. Enforce cooldown so memory dialogue is occasional, never constant (§4.5)
  if (lastMemoryLineAt > 0 && now - lastMemoryLineAt < MEMORY_LINE_COOLDOWN_MS) {
    return null;
  }

  // 3. Build eligible pool based on actual visitor discoveries
  const pool: string[] = [];
  if (actor === 'beggar') {
    if (state.hasReturnedFromOyuk) {
      pool.push(...BEGGAR_MEMORY_OYUK_LINES);
    }
    if (state.hasExperiencedEncounter) {
      pool.push(...BEGGAR_MEMORY_ENCOUNTER_LINES);
    }
  } else {
    if (state.hasReturnedFromOyuk) {
      pool.push(...SAGE_MEMORY_OYUK_LINES);
    }
    if (state.hasDiscoveredMoonSecret) {
      pool.push(SAGE_MEMORY_COSMIC_LINES.moon);
    }
    if (state.hasDiscoveredAnomaly) {
      pool.push(SAGE_MEMORY_COSMIC_LINES.anomaly);
    }
    if (state.hasDiscoveredNoteStar) {
      pool.push(SAGE_MEMORY_COSMIC_LINES.note_star);
    }
  }

  if (pool.length === 0) return null;

  // ~22% chance to speak a memory line when off cooldown; ordinary lines remain dominant
  const roll = opts?.forceRoll !== undefined ? opts.forceRoll : Math.random();
  if (roll > 0.22) return null;

  const lastForActor = actor === 'beggar' ? lastBeggarMemoryLine : lastSageMemoryLine;
  const nonRepeating = pool.filter((l) => l !== lastForActor);
  const candidates = nonRepeating.length > 0 ? nonRepeating : pool;
  const chosen = candidates[Math.floor(Math.random() * candidates.length)];

  lastMemoryLineAt = now;
  if (actor === 'beggar') {
    lastBeggarMemoryLine = chosen;
  } else {
    lastSageMemoryLine = chosen;
  }
  return chosen;
}

export function syncWorldMemoryFromStorage(): WorldMemoryRuntimeState {
  const stored = readStoredWorldMemory();
  state = deriveRuntimeState(stored);
  emitChange();
  return state;
}

export function resetWorldMemoryForTests(initial?: Partial<StoredWorldMemory>): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(WORLD_MEMORY_STORAGE_KEY);
    }
  } catch {
    /* ignore */
  }
  const merged: StoredWorldMemory = {
    ...createDefaultStoredMemory(),
    ...initial,
    version: WORLD_MEMORY_SCHEMA_VERSION,
  };
  writeStoredWorldMemory(merged);
  state = deriveRuntimeState(merged);
  lastMemoryLineAt = 0;
  lastBeggarMemoryLine = '';
  lastSageMemoryLine = '';
  emitChange();
}

export function useWorldMemory(): WorldMemoryRuntimeState {
  const snapshot = useSyncExternalStore(
    subscribeWorldMemory,
    getWorldMemoryState,
    getWorldMemoryState,
  );

  useEffect(() => {
    syncWorldMemoryFromStorage();
  }, []);

  return snapshot;
}
