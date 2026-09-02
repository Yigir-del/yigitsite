const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const LIMITS = {
  noteText: 500,
  noteAuthor: 40,
  noteDate: 32,
  altText: 120,
  filename: 120,
} as const;

export const PHOTO_SIZES = ['small', 'medium', 'large'] as const;
export type PhotoSize = (typeof PHOTO_SIZES)[number];

export function isUuid(value: string): boolean {
  return UUID_RE.test(value);
}

export function clip(value: unknown, max: number): string {
  if (typeof value !== 'string') return '';
  return value.trim().slice(0, max);
}

export function parsePhotoSize(value: unknown): PhotoSize {
  if (value === 'small' || value === 'medium' || value === 'large') return value;
  return 'medium';
}

export function parseNoteInput(body: unknown): {
  text: string;
  author: string;
  date: string;
} | null {
  if (!body || typeof body !== 'object') return null;
  const record = body as Record<string, unknown>;
  const text = clip(record.text, LIMITS.noteText);
  if (text.length < 1) return null;
  const author = clip(record.author, LIMITS.noteAuthor) || 'Gizemli Yabancı';
  const date = clip(record.date, LIMITS.noteDate);
  return { text, author, date };
}
