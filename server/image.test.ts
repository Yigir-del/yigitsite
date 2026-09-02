import { describe, expect, it } from 'vitest';
import { sniffImage } from './image.js';

describe('sniffImage', () => {
  it('detects jpeg / png and rejects random bytes', () => {
    expect(sniffImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]))).toBe('image/png');
    expect(sniffImage(Buffer.from('not-an-image'))).toBeNull();
    expect(sniffImage(Buffer.from([]))).toBeNull();
  });
});
