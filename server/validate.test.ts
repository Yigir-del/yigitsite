import { describe, expect, it } from 'vitest';
import { isUuid, parseNoteInput, parsePhotoSize } from './validate.js';

describe('parseNoteInput', () => {
  it('accepts a normal note', () => {
    expect(parseNoteInput({ text: '  merhaba  ', author: 'Kral', date: '01/01/2026' })).toEqual({
      text: 'merhaba',
      author: 'Kral',
      date: '01/01/2026',
    });
  });

  it('rejects empty / oversized junk', () => {
    expect(parseNoteInput({})).toBeNull();
    expect(parseNoteInput({ text: '   ' })).toBeNull();
    expect(parseNoteInput(null)).toBeNull();
    const long = parseNoteInput({ text: 'x'.repeat(800), author: 'a'.repeat(80) });
    expect(long?.text).toHaveLength(500);
    expect(long?.author).toHaveLength(40);
  });

  it('defaults anonymous author', () => {
    expect(parseNoteInput({ text: 'iz' })?.author).toBe('Gizemli Yabancı');
  });
});

describe('isUuid / parsePhotoSize', () => {
  it('validates uuid', () => {
    expect(isUuid('3b8c0d2e-1f4a-4c9b-9d2e-7a6b5c4d3e2f')).toBe(true);
    expect(isUuid('nope')).toBe(false);
    expect(isUuid("3b8c0d2e-1f4a-4c9b-9d2e-7a6b5c4d3e2f'; drop table notes;--")).toBe(false);
  });

  it('clamps photo size', () => {
    expect(parsePhotoSize('large')).toBe('large');
    expect(parsePhotoSize('huge')).toBe('medium');
  });
});
