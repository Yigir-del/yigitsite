import { useCallback, useSyncExternalStore } from 'react';

/** LocalStorage key to mute/unmute only the beggar coin sound effect (§5) */
export const COIN_SOUND_MUTED_KEY = 'yigit_beggar_coin_mute_v1';

type WebkitWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
  };

let sharedAudioContext: AudioContext | null = null;
let mutedState: boolean = typeof window !== 'undefined' ? readCoinSoundMuted() : false;
const muteListeners = new Set<() => void>();

export function readCoinSoundMuted(): boolean {
  try {
    return localStorage.getItem(COIN_SOUND_MUTED_KEY) === '1';
  } catch {
    return false;
  }
}

export function setCoinSoundMuted(muted: boolean): void {
  mutedState = Boolean(muted);
  try {
    if (mutedState) {
      localStorage.setItem(COIN_SOUND_MUTED_KEY, '1');
    } else {
      localStorage.removeItem(COIN_SOUND_MUTED_KEY);
    }
  } catch {
    /* private mode */
  }
  muteListeners.forEach((fn) => fn());
}

export function toggleCoinSoundMuted(): boolean {
  const next = !mutedState;
  setCoinSoundMuted(next);
  return next;
}

export function isCoinSoundMuted(): boolean {
  return mutedState;
}

function subscribeMute(listener: () => void): () => void {
  muteListeners.add(listener);
  return () => {
    muteListeners.delete(listener);
  };
}

function getAudioContextConstructor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const w = window as WebkitWindow;
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function getOrCreateAudioContext(): AudioContext | null {
  if (sharedAudioContext && sharedAudioContext.state !== 'closed') {
    return sharedAudioContext;
  }
  const Ctor = getAudioContextConstructor();
  if (!Ctor) return null;
  try {
    sharedAudioContext = new Ctor();
    return sharedAudioContext;
  } catch {
    return null;
  }
}

/**
 * Call synchronously inside a deliberate user click/keydown gesture
 * so the shared AudioContext is unlocked before the coin lands ~780ms later.
 */
export function primeCoinAudio(): void {
  if (mutedState) return;
  const ctx = getOrCreateAudioContext();
  if (!ctx) return;
  if (ctx.state === 'suspended') {
    void ctx.resume().catch(() => {
      /* ignore autoplay restriction errors */
    });
  }
}

/**
 * Synthesizes a short, restrained antique-brass coin "çınk!" on container impact (~190ms).
 * Uses inharmonic circular-disc modal partials + a subtle cup-rim micro-bounce
 * passed through a warm lowpass filter to avoid harshness or clipping.
 */
export function playCoinImpactSound(): boolean {
  if (mutedState) return false;
  const ctx = getOrCreateAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    // Slight natural pitch variation (±2.5%) so consecutive coins feel organic
    const detuneFactor = 0.975 + Math.random() * 0.05;

    // Warmth filter to prevent piercing highs and clicks
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(6800, now);
    filter.Q.setValueAtTime(0.7, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.11, now + 0.0025);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.21);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    // 1. Primary metallic disc modes ("çınk" attack at t = 0)
    const primaryPartials: Array<{
      freq: number;
      gain: number;
      decay: number;
      type: OscillatorType;
    }> = [
      { freq: 1180 * detuneFactor, gain: 0.22, decay: 0.045, type: 'triangle' }, // cup rim body thud
      { freq: 2460 * detuneFactor, gain: 0.52, decay: 0.165, type: 'sine' }, // fundamental coin ring
      { freq: 3790 * detuneFactor, gain: 0.34, decay: 0.125, type: 'sine' }, // Chladni mode (1.54x)
      { freq: 5580 * detuneFactor, gain: 0.16, decay: 0.075, type: 'sine' }, // metallic shimmer (2.27x)
    ];

    // 2. Secondary micro-settle tap against the container bottom (+26ms)
    const settlePartials: Array<{
      freq: number;
      gain: number;
      decay: number;
    }> = [
      { freq: 2890 * detuneFactor, gain: 0.22, decay: 0.095 },
      { freq: 4420 * detuneFactor, gain: 0.14, decay: 0.065 },
    ];

    const activeOscillators: OscillatorNode[] = [];
    const activeGains: GainNode[] = [];

    for (const p of primaryPartials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq, now);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(p.gain, now + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(g);
      g.connect(filter);
      osc.start(now);
      osc.stop(now + p.decay + 0.01);

      activeOscillators.push(osc);
      activeGains.push(g);
    }

    const settleStart = now + 0.026;
    for (const s of settlePartials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(s.freq, settleStart);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.setValueAtTime(0.0001, settleStart);
      g.gain.linearRampToValueAtTime(s.gain, settleStart + 0.002);
      g.gain.exponentialRampToValueAtTime(0.0001, settleStart + s.decay);

      osc.connect(g);
      g.connect(filter);
      osc.start(settleStart);
      osc.stop(settleStart + s.decay + 0.01);

      activeOscillators.push(osc);
      activeGains.push(g);
    }

    // Release all audio graph resources after final decay finishes
    setTimeout(() => {
      for (const osc of activeOscillators) {
        try {
          osc.disconnect();
        } catch {
          /* ignore */
        }
      }
      for (const g of activeGains) {
        try {
          g.disconnect();
        } catch {
          /* ignore */
        }
      }
      try {
        filter.disconnect();
        masterGain.disconnect();
      } catch {
        /* ignore */
      }
    }, 260);

    return true;
  } catch {
    return false;
  }
}

/**
 * Synthesizes a subtle, solemn golden chime when the ultimate Golden Trophy ("Hiçliğin Kralı")
 * is unlocked (§15.2). Respects the existing audio mute preference and safely no-ops if suspended.
 */
export function playGoldenTrophySound(): boolean {
  if (mutedState) return false;
  const ctx = getOrCreateAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(5200, now);
    filter.Q.setValueAtTime(0.6, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.09, now + 0.015);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    const chordNotes = [
      { freq: 587.33, delay: 0, gain: 0.34, decay: 0.45 }, // D5
      { freq: 880.0, delay: 0.07, gain: 0.38, decay: 0.48 }, // A5
      { freq: 1174.66, delay: 0.14, gain: 0.42, decay: 0.52 }, // D6
    ];

    const activeOscillators: OscillatorNode[] = [];
    const activeGains: GainNode[] = [];

    for (const note of chordNotes) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const startAt = now + note.delay;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(note.freq, startAt);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.setValueAtTime(0.0001, startAt);
      g.gain.linearRampToValueAtTime(note.gain, startAt + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0001, startAt + note.decay);

      osc.connect(g);
      g.connect(filter);
      osc.start(startAt);
      osc.stop(startAt + note.decay + 0.02);

      activeOscillators.push(osc);
      activeGains.push(g);
    }

    setTimeout(() => {
      for (const osc of activeOscillators) {
        try {
          osc.disconnect();
        } catch {
          /* ignore */
        }
      }
      for (const g of activeGains) {
        try {
          g.disconnect();
        } catch {
          /* ignore */
        }
      }
      try {
        filter.disconnect();
        masterGain.disconnect();
      } catch {
        /* ignore */
      }
    }, 750);

    return true;
  } catch {
    return false;
  }
}

/**
 * Plays an unlock chime at most once per achievement toast.
 * Pure bookkeeping (no audio) so the de-duplication rule is unit-testable and shared by every caller.
 */
const claimedAchievementSounds = new Set<string>();

export function claimAchievementSound(key: string): boolean {
  if (!key || claimedAchievementSounds.has(key)) return false;
  claimedAchievementSounds.add(key);
  // Bounded memory: only the most recent claims matter for de-duplication.
  if (claimedAchievementSounds.size > 64) {
    const oldest = claimedAchievementSounds.values().next().value;
    if (oldest !== undefined) claimedAchievementSounds.delete(oldest);
  }
  return true;
}

export function resetAchievementSoundClaimsForTests(): void {
  claimedAchievementSounds.clear();
}

/**
 * Short (~380ms), crystalline and slightly mysterious unlock cue for ordinary achievements.
 * Two glassy partials (G6 → D7, a fifth apart) with a barely detuned shimmer twin and a soft
 * low body, through a gentle lowpass. Reuses the shared AudioContext and respects the sound
 * preference; safely no-ops when audio is unavailable or still locked by the browser.
 */
export function playAchievementUnlockSound(): boolean {
  if (mutedState) return false;
  const ctx = getOrCreateAudioContext();
  if (!ctx) return false;

  try {
    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(6200, now);
    filter.Q.setValueAtTime(0.5, now);

    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0001, now);
    masterGain.gain.linearRampToValueAtTime(0.075, now + 0.008);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.42);

    filter.connect(masterGain);
    masterGain.connect(ctx.destination);

    const partials = [
      { freq: 1567.98, delay: 0, gain: 0.5, decay: 0.3, type: 'sine' as const }, // G6
      { freq: 1571.4, delay: 0, gain: 0.18, decay: 0.26, type: 'sine' as const }, // shimmer twin
      { freq: 2349.32, delay: 0.058, gain: 0.42, decay: 0.32, type: 'sine' as const }, // D7
      { freq: 783.99, delay: 0, gain: 0.16, decay: 0.2, type: 'triangle' as const }, // soft body
    ];

    const nodes: AudioNode[] = [filter, masterGain];
    for (const p of partials) {
      const osc = ctx.createOscillator();
      const g = ctx.createGain();
      const startAt = now + p.delay;
      osc.type = p.type;
      osc.frequency.setValueAtTime(p.freq, startAt);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.setValueAtTime(0.0001, startAt);
      g.gain.linearRampToValueAtTime(p.gain, startAt + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, startAt + p.decay);

      osc.connect(g);
      g.connect(filter);
      osc.start(startAt);
      osc.stop(startAt + p.decay + 0.02);
      nodes.push(osc, g);
    }

    setTimeout(() => {
      for (const node of nodes) {
        try {
          node.disconnect();
        } catch {
          /* ignore */
        }
      }
    }, 520);

    return true;
  } catch {
    return false;
  }
}

export function useCoinSound() {
  const muted = useSyncExternalStore(subscribeMute, isCoinSoundMuted, isCoinSoundMuted);

  const prime = useCallback(() => {
    primeCoinAudio();
  }, []);

  const playImpact = useCallback(() => {
    return playCoinImpactSound();
  }, []);

  const toggleMute = useCallback(() => {
    return toggleCoinSoundMuted();
  }, []);

  return {
    muted,
    prime,
    playImpact,
    toggleMute,
    setMuted: setCoinSoundMuted,
  };
}
