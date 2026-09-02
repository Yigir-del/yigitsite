export type ThoughtKind =
  | 'idea'
  | 'philosophy'
  | 'code'
  | 'midnight'
  | 'funny'
  | 'observation'
  | 'nonsense'
  | 'GÜNLÜK'
  | string;

export interface Thought {
  id: string;
  text: string;
  date: string;
  type: ThoughtKind;
  rotation: number;
}

export function parseStoredThoughts(raw: string): Thought[] {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isThought);
  } catch {
    return [];
  }
}

function isThought(value: unknown): value is Thought {
  if (!value || typeof value !== 'object') return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.id === 'string' &&
    typeof row.text === 'string' &&
    typeof row.date === 'string' &&
    typeof row.type === 'string' &&
    typeof row.rotation === 'number'
  );
}
