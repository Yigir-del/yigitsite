import { getOyukState, isCinematicActive } from '../oyuk/oyukState';
import { recordWorldMemoryEncounter } from '../worldMemory/worldMemoryStore';

export type EncounterActorId = 'beggar' | 'sage';
export type ActorFacing = 'left' | 'right' | null;

export interface ActorPoint {
  x: number;
  y: number;
}

export interface EncounterStep {
  actor: EncounterActorId;
  text: string;
  holdMs: number;
}

export interface EncounterActorHandle {
  getCenter: () => ActorPoint | null;
  isReady: () => boolean;
  hold: (facing: ActorFacing) => void;
  sayLine: (text: string, holdMs: number) => void;
  clearSpeech: () => void;
  resume: () => void;
}

export const ENCOUNTER_RADIUS_PX = 145;
export const ENCOUNTER_COOLDOWN_MS = 28_000;

/**
 * Curated Beggar & Sage physical encounter exchanges (§5.2).
 * Primary exchange is always used first and stays prominent.
 */
export const ENCOUNTER_EXCHANGES: readonly (readonly EncounterStep[])[] = [
  [
    {
      actor: 'beggar',
      text: 'Kral beni bunun yanına niye getirdin?',
      holdMs: 1900,
    },
    {
      actor: 'sage',
      text: 'Demek sonunda bilgeliğe geldin.',
      holdMs: 1900,
    },
    {
      actor: 'beggar',
      text: 'Yanlışlıkla geldim.',
      holdMs: 2100,
    },
  ],
  [
    {
      actor: 'beggar',
      text: 'Bunun cebinde özlü söz var kral, altın yok.',
      holdMs: 1900,
    },
    {
      actor: 'sage',
      text: 'Altın ağırlıktır; boş kâse ise hafiflik.',
      holdMs: 1900,
    },
    {
      actor: 'beggar',
      text: 'Hafiflik karın doyurmuyor dede.',
      holdMs: 2100,
    },
  ],
  [
    {
      actor: 'sage',
      text: 'Yollarımız yine kesişti.',
      holdMs: 1850,
    },
    {
      actor: 'beggar',
      text: 'Kesişmedi, kral tutup üstüme bıraktı.',
      holdMs: 1950,
    },
    {
      actor: 'sage',
      text: 'Kader bazen bir imleç ucundadır.',
      holdMs: 2100,
    },
  ],
] as const;

const actors = new Map<EncounterActorId, EncounterActorHandle>();
let activeEncounter = false;
let lastEncounterAt = 0;
let encounterSeq = 0;
let stepTimers: ReturnType<typeof setTimeout>[] = [];

export function computeActorDistance(a: ActorPoint, b: ActorPoint): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function isEncounterActive(): boolean {
  return activeEncounter;
}

export function getEncounterLastTriggeredAt(): number {
  return lastEncounterAt;
}

export function registerEncounterActor(
  id: EncounterActorId,
  handle: EncounterActorHandle,
): () => void {
  actors.set(id, handle);
  return () => {
    if (actors.get(id) === handle) {
      actors.delete(id);
    }
  };
}

function clearStepTimers() {
  for (const timer of stepTimers) {
    clearTimeout(timer);
  }
  stepTimers = [];
}

/**
 * Cancels any running encounter immediately (e.g., if OYUK 5th-donation cinematic starts).
 */
export function cancelActiveEncounter(): void {
  clearStepTimers();
  if (!activeEncounter) return;
  activeEncounter = false;
  const beggar = actors.get('beggar');
  const sage = actors.get('sage');
  beggar?.clearSpeech();
  sage?.clearSpeech();
}

export interface TriggerEncounterOptions {
  /** Must be true — automatic flight pass-bys never trigger physical encounters (§5.3) */
  wasDragged: boolean;
  now?: number;
  stepIntervalMs?: number;
}

export interface TriggerEncounterResult {
  triggered: boolean;
  reason?:
    | 'not_dragged'
    | 'already_active'
    | 'cinematic_active'
    | 'cooldown'
    | 'actors_unavailable'
    | 'out_of_range';
  distance?: number;
  exchange?: readonly EncounterStep[];
}

/**
 * Checks proximity after a user drag gesture and starts the Beggar–Sage encounter if within range (§5.3).
 */
export function checkAndTriggerEncounter(
  _draggedActor: EncounterActorId,
  opts: TriggerEncounterOptions,
): TriggerEncounterResult {
  if (!opts.wasDragged) {
    return { triggered: false, reason: 'not_dragged' };
  }

  if (activeEncounter) {
    return { triggered: false, reason: 'already_active' };
  }

  const oyukState = getOyukState();
  if (isCinematicActive(oyukState.phase) || oyukState.pendingCinematic) {
    return { triggered: false, reason: 'cinematic_active' };
  }

  const now = opts.now ?? Date.now();
  if (lastEncounterAt > 0 && now - lastEncounterAt < ENCOUNTER_COOLDOWN_MS) {
    return { triggered: false, reason: 'cooldown' };
  }

  const beggar = actors.get('beggar');
  const sage = actors.get('sage');
  if (!beggar || !sage || !beggar.isReady() || !sage.isReady()) {
    return { triggered: false, reason: 'actors_unavailable' };
  }

  const beggarPos = beggar.getCenter();
  const sagePos = sage.getCenter();
  if (!beggarPos || !sagePos) {
    return { triggered: false, reason: 'actors_unavailable' };
  }

  const distance = computeActorDistance(beggarPos, sagePos);
  if (distance > ENCOUNTER_RADIUS_PX) {
    return { triggered: false, reason: 'out_of_range', distance };
  }

  // Trigger encounter!
  activeEncounter = true;
  lastEncounterAt = now;

  // Primary exchange is always first; subsequent encounters cycle cleanly
  const exchangeIndex =
    encounterSeq === 0
      ? 0
      : encounterSeq % ENCOUNTER_EXCHANGES.length === 0
        ? 0
        : encounterSeq % ENCOUNTER_EXCHANGES.length;
  const exchange = ENCOUNTER_EXCHANGES[exchangeIndex];
  encounterSeq += 1;

  // Orient both characters toward one another (§5.1)
  const beggarOnLeft = beggarPos.x <= sagePos.x;
  beggar.hold(beggarOnLeft ? 'right' : 'left');
  sage.hold(beggarOnLeft ? 'left' : 'right');

  // Record in persistent world memory (§4)
  recordWorldMemoryEncounter();

  const stepInterval = opts.stepIntervalMs ?? 1950;

  exchange.forEach((step, idx) => {
    const delay = idx * stepInterval;
    const executeStep = () => {
      const currentOyuk = getOyukState();
      if (isCinematicActive(currentOyuk.phase) || currentOyuk.pendingCinematic) {
        cancelActiveEncounter();
        return;
      }
      const speaker = actors.get(step.actor);
      const listener = actors.get(step.actor === 'beggar' ? 'sage' : 'beggar');
      listener?.clearSpeech();
      speaker?.sayLine(step.text, step.holdMs);
    };

    if (delay === 0) {
      executeStep();
    } else {
      const t = setTimeout(executeStep, delay);
      stepTimers.push(t);
    }
  });

  const finishDelay = exchange.length * stepInterval + 220;
  const finishTimer = setTimeout(() => {
    clearStepTimers();
    activeEncounter = false;
    const currentOyuk = getOyukState();
    if (isCinematicActive(currentOyuk.phase) || currentOyuk.pendingCinematic) {
      return;
    }
    actors.get('beggar')?.resume();
    actors.get('sage')?.resume();
  }, finishDelay);
  stepTimers.push(finishTimer);

  return {
    triggered: true,
    distance,
    exchange,
  };
}

export function resetEncounterManagerForTests(): void {
  clearStepTimers();
  actors.clear();
  activeEncounter = false;
  lastEncounterAt = 0;
  encounterSeq = 0;
}
