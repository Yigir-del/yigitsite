import { useEffect, useSyncExternalStore } from 'react';

/** Existing beggar donation storage key — MUST NOT be renamed or reset (§4.1) */
export const ALMS_KEY = 'yigit_beggar_alms';

/** Persistent discovery flag for OYUK (§4.4) */
export const OYUK_UNLOCKED_KEY = 'yigit_oyuk_unlocked_v1';

/** Tracks whether the introductory 5-donation cinematic has already played */
export const OYUK_INTRO_SEEN_KEY = 'yigit_oyuk_intro_seen_v1';

/** Required donation threshold to unlock OYUK (§4.2) */
export const OYUK_DONATION_THRESHOLD = 5;

export type CinematicPhase =
  | 'idle'
  | 'invitation'
  | 'focus'
  | 'escort'
  | 'threshold'
  | 'entering'
  | 'arrived'
  | 'cancelled';

export interface ActorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface OyukRuntimeState {
  alms: number;
  unlocked: boolean;
  introSeen: boolean;
  phase: CinematicPhase;
  originRect: ActorRect | null;
  returnPath: string;
  lastPointer: { x: number; y: number } | null;
}

export function readAlms(): number {
  try {
    const raw = localStorage.getItem(ALMS_KEY);
    if (raw === null) return 0;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? Math.min(Math.floor(n), 99999) : 0;
  } catch {
    return 0;
  }
}

export function writeAlms(n: number): void {
  try {
    const clamped = Number.isFinite(n) && n >= 0 ? Math.min(Math.floor(n), 99999) : 0;
    localStorage.setItem(ALMS_KEY, String(clamped));
  } catch {
    /* private / quota mode */
  }
}

export function readOyukUnlocked(): boolean {
  try {
    return localStorage.getItem(OYUK_UNLOCKED_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeOyukUnlocked(unlocked = true): void {
  try {
    if (unlocked) {
      localStorage.setItem(OYUK_UNLOCKED_KEY, '1');
    } else {
      localStorage.removeItem(OYUK_UNLOCKED_KEY);
    }
  } catch {
    /* private mode */
  }
}

export function readOyukIntroSeen(): boolean {
  try {
    return localStorage.getItem(OYUK_INTRO_SEEN_KEY) === '1';
  } catch {
    return false;
  }
}

export function writeOyukIntroSeen(seen = true): void {
  try {
    if (seen) {
      localStorage.setItem(OYUK_INTRO_SEEN_KEY, '1');
    } else {
      localStorage.removeItem(OYUK_INTRO_SEEN_KEY);
    }
  } catch {
    /* private mode */
  }
}

let state: OyukRuntimeState = {
  alms: typeof window !== 'undefined' ? readAlms() : 0,
  unlocked: typeof window !== 'undefined' ? readOyukUnlocked() : false,
  introSeen: typeof window !== 'undefined' ? readOyukIntroSeen() : false,
  phase: 'idle',
  originRect: null,
  returnPath: '/',
  lastPointer: null,
};

const listeners = new Set<() => void>();

function emitChange() {
  listeners.forEach((fn) => fn());
}

function setState(partial: Partial<OyukRuntimeState>) {
  state = { ...state, ...partial };
  emitChange();
}

export function getOyukState(): OyukRuntimeState {
  return state;
}

export function subscribeOyukState(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function syncOyukFromStorage(): OyukRuntimeState {
  const nextAlms = readAlms();
  const nextUnlocked = readOyukUnlocked();
  const nextIntroSeen = readOyukIntroSeen();
  if (
    state.alms !== nextAlms ||
    state.unlocked !== nextUnlocked ||
    state.introSeen !== nextIntroSeen
  ) {
    setState({
      alms: nextAlms,
      unlocked: nextUnlocked,
      introSeen: nextIntroSeen,
    });
  }
  return state;
}

export function isCinematicActive(phase: CinematicPhase = state.phase): boolean {
  return (
    phase === 'invitation' ||
    phase === 'focus' ||
    phase === 'escort' ||
    phase === 'threshold' ||
    phase === 'entering'
  );
}

export function recordLastPointer(x: number, y: number): void {
  state = { ...state, lastPointer: { x, y } };
}

export interface DonationOutcome {
  accepted: boolean;
  alms: number;
  triggeredCinematic: boolean;
  unlocked: boolean;
  alreadyUnlockedBefore: boolean;
}

/**
 * Process a deliberate beggar donation click/keypress (§4.1–§4.4).
 * - Always increments and persists `yigit_beggar_alms` when accepted.
 * - Rejects if the cinematic sequence is currently running or if `isDragging` is true.
 * - Unlocks OYUK and triggers the cinematic on the 5th donation (or the next
 *   deliberate donation for existing visitors who already have >= 5 donations
 *   but have never unlocked OYUK).
 */
export function recordBeggarDonation(opts?: {
  isDragging?: boolean;
  originRect?: ActorRect | null;
  returnPath?: string;
}): DonationOutcome {
  if (opts?.isDragging) {
    return {
      accepted: false,
      alms: state.alms,
      triggeredCinematic: false,
      unlocked: state.unlocked,
      alreadyUnlockedBefore: state.unlocked,
    };
  }

  if (isCinematicActive(state.phase)) {
    return {
      accepted: false,
      alms: state.alms,
      triggeredCinematic: false,
      unlocked: state.unlocked,
      alreadyUnlockedBefore: state.unlocked,
    };
  }

  const currentAlms = Math.max(state.alms, readAlms());
  const alreadyUnlocked = state.unlocked || readOyukUnlocked();
  const alreadySawIntro = state.introSeen || readOyukIntroSeen();

  const nextAlms = Math.min(currentAlms + 1, 99999);
  writeAlms(nextAlms);

  // Trigger the secret journey exactly once when reaching >= 5 donations
  if (nextAlms >= OYUK_DONATION_THRESHOLD && (!alreadyUnlocked || !alreadySawIntro)) {
    writeOyukUnlocked(true);
    writeOyukIntroSeen(true);
    setState({
      alms: nextAlms,
      unlocked: true,
      introSeen: true,
      phase: 'invitation',
      originRect: opts?.originRect ?? null,
      returnPath: opts?.returnPath && opts.returnPath !== '/oyuk' ? opts.returnPath : '/',
    });
    return {
      accepted: true,
      alms: nextAlms,
      triggeredCinematic: true,
      unlocked: true,
      alreadyUnlockedBefore: false,
    };
  }

  setState({
    alms: nextAlms,
    unlocked: alreadyUnlocked,
    introSeen: alreadySawIntro,
  });

  return {
    accepted: true,
    alms: nextAlms,
    triggeredCinematic: false,
    unlocked: alreadyUnlocked,
    alreadyUnlockedBefore: alreadyUnlocked,
  };
}

export function advanceCinematicPhase(next: CinematicPhase): void {
  setState({ phase: next });
}

export function finishCinematicArrival(): void {
  setState({ phase: 'arrived' });
}

export function resetCinematicToIdle(): void {
  if (state.phase !== 'idle' || state.originRect !== null) {
    setState({ phase: 'idle', originRect: null });
  }
}

export function setOyukReturnPath(path: string): void {
  if (path && path !== '/oyuk') {
    setState({ returnPath: path });
  }
}

/** Test-only helper to reset in-memory and storage state cleanly */
export function resetOyukStateForTests(initial?: Partial<OyukRuntimeState>): void {
  try {
    localStorage.removeItem(ALMS_KEY);
    localStorage.removeItem(OYUK_UNLOCKED_KEY);
    localStorage.removeItem(OYUK_INTRO_SEEN_KEY);
  } catch {
    /* ignore */
  }
  if (typeof initial?.alms === 'number') writeAlms(initial.alms);
  if (initial?.unlocked) writeOyukUnlocked(true);
  if (initial?.introSeen) writeOyukIntroSeen(true);

  state = {
    alms: initial?.alms ?? 0,
    unlocked: initial?.unlocked ?? false,
    introSeen: initial?.introSeen ?? false,
    phase: initial?.phase ?? 'idle',
    originRect: initial?.originRect ?? null,
    returnPath: initial?.returnPath ?? '/',
    lastPointer: initial?.lastPointer ?? null,
  };
  emitChange();
}

export function useOyukState(): OyukRuntimeState {
  const snapshot = useSyncExternalStore(subscribeOyukState, getOyukState, getOyukState);

  useEffect(() => {
    syncOyukFromStorage();
  }, []);

  return snapshot;
}
