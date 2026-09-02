import { describe, expect, it } from 'vitest';
import { isAllowedBlobUrl } from './blobUrl.js';

describe('isAllowedBlobUrl', () => {
  it('allows vercel blob https hosts', () => {
    expect(isAllowedBlobUrl('https://abc.blob.vercel-storage.com/file.jpg')).toBe(true);
    expect(isAllowedBlobUrl('https://blob.vercel-storage.com/x')).toBe(true);
  });

  it('rejects ssrf and junk', () => {
    expect(isAllowedBlobUrl('http://blob.vercel-storage.com/x')).toBe(false);
    expect(isAllowedBlobUrl('https://evil.com/?u=blob.vercel-storage.com')).toBe(false);
    expect(isAllowedBlobUrl('https://blob.vercel-storage.com.evil.com/x')).toBe(false);
    expect(isAllowedBlobUrl('https://user:pass@blob.vercel-storage.com/x')).toBe(false);
    expect(isAllowedBlobUrl('not a url')).toBe(false);
    expect(isAllowedBlobUrl('')).toBe(false);
  });
});
