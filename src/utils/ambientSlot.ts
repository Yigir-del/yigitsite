/** One ambient voice at a time — idle whispers vs ChaosManager idle quotes. */

type Slot = 'chaos' | 'whisper';

let current: Slot | null = null;

export function takeAmbient(slot: Slot): boolean {
  if (current && current !== slot) return false;
  current = slot;
  return true;
}

export function releaseAmbient(slot: Slot) {
  if (current === slot) current = null;
}
