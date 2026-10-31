/** One ambient voice at a time — idle whispers and ChaosManager idle quotes. */

export type Slot = 'chaos' | 'whisper';

let current: Slot | null = null;

export function takeAmbient(slot: Slot): boolean {
  if (current && current !== slot) return false;
  current = slot;
  return true;
}

export function releaseAmbient(slot: Slot) {
  if (current === slot) current = null;
}

export function getActiveAmbientSlot(): Slot | null {
  return current;
}

export function resetAmbientSlotForTests() {
  current = null;
}
