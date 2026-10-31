/** One ambient voice at a time — idle whispers, ChaosManager idle quotes, and Reality Anomalies. */

export type Slot = 'chaos' | 'whisper' | 'anomaly';

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
