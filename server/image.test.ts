import { describe, expect, it } from 'vitest';
import { sanitizeFilename, sniffImage } from './image.js';

describe('sniffImage', () => {
  it('detects jpeg / png and rejects random bytes', () => {
    expect(sniffImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0]))).toBe('image/jpeg');
    expect(sniffImage(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]))).toBe('image/png');
    expect(sniffImage(Buffer.from('not-an-image'))).toBeNull();
    expect(sniffImage(Buffer.from([]))).toBeNull();
  });

  it('detects gif, webp, and avif magic bytes', () => {
    expect(sniffImage(Buffer.from('GIF89a\x01\x00'))).toBe('image/gif');
    expect(sniffImage(Buffer.from('RIFF\x00\x00\x00\x00WEBP'))).toBe('image/webp');
    expect(sniffImage(Buffer.from('\x00\x00\x00\x1cftypavif\x00\x00\x00\x00'))).toBe('image/avif');
  });

  it('sanitizes filenames safely', () => {
    expect(sanitizeFilename('../../etc/passwd.png')).toMatch(/^studio\/\d+-etc_passwd\.png$/);
    expect(sanitizeFilename('...')).toMatch(/^studio\/\d+-photo$/);
  });
});
