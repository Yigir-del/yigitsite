import { useEffect, useSyncExternalStore } from 'react';

/** Existing beggar donation storage key — MUST NOT be renamed or reset (§4.1) */
export const ALMS_KEY = 'yigit_beggar_alms';

/** Persistent discovery flag for OYUK (§4.4) */
export const OYUK_UNLOCKED_KEY = 'yigit_oyuk_unlocked_v1';

/** Tracks whether the introductory 5-donation cinematic has already played */
export const OYUK_INTRO_SEEN_KEY = 'yigit_oyuk_intro_seen_v1';

/** Required donation threshold to unlock OYUK (§4.2) */
export const OYUK_DONATION_THRESHOLD = 5;

/** Custom event dispatched once when OYUK unlocks after the 5th donation completes (§7) */
export const OYUK_UNLOCK_EVENT = 'oyuk:unlocked';

export type CinematicPhase =
  | 'idle'
  | 'invitation'
  | 'focus'
  | 'escort'
  | 'threshold'
  | 'entering'
  | 'exiting'
  | 'arrived'
  | 'cancelled';

/**
 * Step durations (ms) for the deterministic OYUK state machine (§3.3 & §9).
 * Each phase owns and cleans up only its own single transition timer,
 * preventing phase updates from cancelling downstream steps.
 */
export const CINEMATIC_STEP_MS = {
  invitation: 1450,
  invitationReduced: 1250,
  focus: 1300,
  escort: 1800,
  threshold: 1700,
  thresholdReduced: 1300,
  entering: 520,
  enteringReduced: 300,
  exiting: 240,
  exitingReduced: 80,
  arrived: 460,
  failsafeMax: 9200,
} as const;

export interface ActorRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface CoinPoint {
  x: number;
  y: number;
}

/**
 * Authoritative coordinate converter for the OYUK exploration light (§5.3).
 * Maps viewport pointer coordinates `(vpX, vpY)` (`clientX`, `clientY`) and the
 * cave container's live bounding client rect `(rect.left, rect.top)` into:
 * - `vpX, vpY`: viewport-space coordinates for the fixed cursor orb & halo
 * - `localX, localY`: cave-surface coordinates for the CSS `mask-image` radial gradient
 *
 * Because `rect.top` shifts by `-scrollY` as the document scrolls, `localY = vpY - rect.top`
 * guarantees that `rect.top + localY === vpY` at all scroll depths (0%–100%).
 */
export function computeOyukLightCoordinates(
  vpX: number,
  vpY: number,
  rect: { left: number; top: number },
): {
  vpX: number;
  vpY: number;
  localX: number;
  localY: number;
} {
  return {
    vpX,
    vpY,
    localX: vpX - rect.left,
    localY: vpY - rect.top,
  };
}

/**
 * Compute upward-pop and curved return trajectory + 3D horizontal spin state
 * for normalized flight time t in [0, 1] (§7.1–§7.4).
 */
export function computeCoinTrajectoryFrame(params: {
  t: number;
  startPoint: CoinPoint;
  targetPoint: CoinPoint;
  riseHeight: number;
}) {
  const t = Math.max(0, Math.min(1, params.t));
  const { startPoint, targetPoint, riseHeight } = params;

  // Launch (0 -> 0.36), Apex hang (0.36 -> 0.46), Gravity fall (0.46 -> 1.0)
  const apexT = 0.42;
  const apexY = Math.min(startPoint.y, targetPoint.y) - riseHeight;

  // Curved horizontal path from interaction point into container center
  const easeX = 1 - Math.pow(1 - t, 2.1);
  const x = startPoint.x + (targetPoint.x - startPoint.x) * easeX;

  let y: number;
  if (t <= apexT) {
    const u = t / apexT;
    // Snappy upward pop deceleration
    const riseEase = 1 - Math.pow(1 - u, 2.5);
    y = startPoint.y + (apexY - startPoint.y) * riseEase;
  } else {
    const v = (t - apexT) / (1 - apexT);
    // Gravity-accelerated return into the beggar's container
    const fallEase = v * v;
    y = apexY + (targetPoint.y - apexY) * fallEase;
  }

  // Crisp 3D horizontal Y-axis spin (classic gold coin spin around vertical axis)
  const rawCos = Math.cos(t * Math.PI * 6);
  const sign = rawCos >= 0 ? 1 : -1;
  const scaleX = sign * Math.max(0.26, Math.abs(rawCos));

  const dir = startPoint.x <= targetPoint.x ? 1 : -1;
  const rotateZ = dir * (-6 + t * 14);

  // Specular metallic reflection peak at the apex
  const apexLight = Math.max(0, 1 - Math.abs(t - apexT) / 0.16);

  // Tucks cleanly inside the container mouth in the final 12% of the fall
  const rimTuck = t > 0.88 ? (t - 0.88) / 0.12 : 0;
  const scale = (1 + apexLight * 0.12) * (1 - rimTuck * 0.26);
  const opacity = t < 0.04 ? t / 0.04 : 1 - rimTuck * 0.78;

  return {
    x,
    y,
    scale,
    scaleX,
    scaleY: scaleX, // alias kept for backwards compatibility
    rotateZ,
    apexLight,
    opacity,
  };
}

export interface OyukRuntimeState {
  alms: number;
  unlocked: boolean;
  introSeen: boolean;
  phase: CinematicPhase;
  pendingCinematic: boolean;
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
  pendingCinematic: false,
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

function dispatchOyukUnlockEvent(almsCount: number) {
  if (typeof window === 'undefined' || typeof window.dispatchEvent !== 'function') return;
  try {
    window.dispatchEvent(
      new CustomEvent(OYUK_UNLOCK_EVENT, {
        detail: { alms: almsCount },
      }),
    );
  } catch {
    /* ignore in non-DOM test environments */
  }
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
    phase === 'entering' ||
    phase === 'exiting'
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
 * - Rejects if the cinematic sequence is currently running, if a 5th-coin cinematic
 *   handoff is pending (`pendingCinematic`), or if `isDragging` is true.
 * - Unlocks OYUK and triggers the cinematic on the 5th donation (or the next
 *   deliberate donation for existing visitors who already have >= 5 donations
 *   but have never unlocked OYUK).
 * - When `deferCinematicStart: true` is passed, increments the count and locks
 *   `pendingCinematic: true` while the 5th coin is in the air, deferring the
 *   actual OYUK unlock event and `invitation` phase until `commitPendingOyukCinematic()`
 *   is called upon coin landing completion (§7).
 */
export function recordBeggarDonation(opts?: {
  isDragging?: boolean;
  originRect?: ActorRect | null;
  returnPath?: string;
  deferCinematicStart?: boolean;
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

  if (isCinematicActive(state.phase) || state.pendingCinematic) {
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
    const safeReturnPath =
      opts?.returnPath && opts.returnPath !== '/oyuk' ? opts.returnPath : '/';

    if (opts?.deferCinematicStart) {
      setState({
        alms: nextAlms,
        pendingCinematic: true,
        originRect: opts?.originRect ?? null,
        returnPath: safeReturnPath,
      });
      return {
        accepted: true,
        alms: nextAlms,
        triggeredCinematic: true,
        unlocked: false,
        alreadyUnlockedBefore: false,
      };
    }

    writeOyukUnlocked(true);
    writeOyukIntroSeen(true);
    setState({
      alms: nextAlms,
      unlocked: true,
      introSeen: true,
      pendingCinematic: false,
      phase: 'invitation',
      originRect: opts?.originRect ?? null,
      returnPath: safeReturnPath,
    });
    dispatchOyukUnlockEvent(nextAlms);
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

/**
 * Called by the 5th coin's completion callback once the coin has landed in the
 * beggar's container, played its impact sound, and finished its impact glint (§7).
 */
export function commitPendingOyukCinematic(freshOriginRect?: ActorRect | null): boolean {
  if (!state.pendingCinematic || isCinematicActive(state.phase)) {
    return false;
  }

  writeOyukUnlocked(true);
  writeOyukIntroSeen(true);
  setState({
    unlocked: true,
    introSeen: true,
    pendingCinematic: false,
    phase: 'invitation',
    originRect: freshOriginRect ?? state.originRect,
  });
  dispatchOyukUnlockEvent(state.alms);
  return true;
}

export function advanceCinematicPhase(next: CinematicPhase): void {
  setState({ phase: next });
}

export function finishCinematicArrival(): void {
  setState({ phase: 'arrived', pendingCinematic: false });
}

/**
 * Begins the smooth subterranean exit passage from `/oyuk` back to the cosmic surface (§11).
 */
export function startOyukExit(returnPath?: string): void {
  const safeReturn =
    returnPath && returnPath !== '/oyuk'
      ? returnPath
      : state.returnPath && state.returnPath !== '/oyuk'
        ? state.returnPath
        : '/';
  setState({
    phase: 'exiting',
    pendingCinematic: false,
    originRect: null,
    returnPath: safeReturn,
  });
}

export function resetCinematicToIdle(): void {
  if (state.phase !== 'idle' || state.originRect !== null || state.pendingCinematic) {
    setState({ phase: 'idle', originRect: null, pendingCinematic: false });
  }
}

export function setOyukReturnPath(path: string): void {
  if (path && path !== '/oyuk') {
    setState({ returnPath: path });
  }
}

/** Dev/testing helper to set personal beggar donation count directly (§32) */
export function setBeggarDonationsForDev(count: number): void {
  const safeCount = Math.max(0, Math.min(Math.floor(count), 99999));
  writeAlms(safeCount);
  setState({ alms: safeCount });
}

/** Dev/testing helper to trigger the OYUK escort cinematic immediately (§32) */
export function triggerOyukCinematicForDev(returnPath = '/'): void {
  const nextAlms = Math.max(state.alms, OYUK_DONATION_THRESHOLD);
  writeAlms(nextAlms);
  writeOyukUnlocked(true);
  writeOyukIntroSeen(true);
  setState({
    alms: nextAlms,
    unlocked: true,
    introSeen: true,
    pendingCinematic: false,
    phase: 'invitation',
    originRect: null,
    returnPath: returnPath !== '/oyuk' ? returnPath : '/',
  });
  dispatchOyukUnlockEvent(nextAlms);
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
    pendingCinematic: initial?.pendingCinematic ?? false,
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
