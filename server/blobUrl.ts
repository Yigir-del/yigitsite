/** Strict allowlist for the photo proxy — no arbitrary remote fetch. */
export function isAllowedBlobUrl(raw: string): boolean {
  if (typeof raw !== 'string' || raw.length < 12 || raw.length > 2048) return false;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return false;
    if (url.username || url.password) return false;
    const host = url.hostname.toLowerCase();
    return host === 'blob.vercel-storage.com' || host.endsWith('.blob.vercel-storage.com');
  } catch {
    return false;
  }
}
