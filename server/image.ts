const JPEG = [0xff, 0xd8, 0xff];
const PNG = [0x89, 0x50, 0x4e, 0x47];
const GIF = [0x47, 0x49, 0x46, 0x38];
const WEBP_RIFF = [0x52, 0x49, 0x46, 0x46];
const FTYP = [0x66, 0x74, 0x79, 0x70];

export type ImageKind =
  | 'image/jpeg'
  | 'image/png'
  | 'image/gif'
  | 'image/webp'
  | 'image/avif';

function startsWith(buf: Buffer, sig: number[], offset = 0): boolean {
  if (buf.length < offset + sig.length) return false;
  return sig.every((byte, i) => buf[offset + i] === byte);
}

/** Sniff magic bytes — do not trust Content-Type / extension. */
export function sniffImage(buf: Buffer): ImageKind | null {
  if (startsWith(buf, JPEG)) return 'image/jpeg';
  if (startsWith(buf, PNG)) return 'image/png';
  if (startsWith(buf, GIF)) return 'image/gif';
  if (startsWith(buf, WEBP_RIFF) && buf.length >= 12) {
    const tag = buf.subarray(8, 12).toString('ascii');
    if (tag === 'WEBP') return 'image/webp';
  }
  if (startsWith(buf, FTYP, 4) && buf.length >= 12) {
    const majorBrand = buf.subarray(8, 12).toString('ascii');
    if (majorBrand === 'avif' || majorBrand === 'avis') return 'image/avif';
    if (majorBrand === 'mif1' && buf.length >= 24) {
      const compat = buf.subarray(16, Math.min(buf.length, 32)).toString('ascii');
      if (compat.includes('avif') || compat.includes('avis')) return 'image/avif';
    }
  }
  return null;
}

export function sanitizeFilename(name: string): string {
  const cleaned = name
    .replace(/\.{2,}/g, '_')
    .replace(/[^\w.-]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^[_.-]+/, '');
  const base = cleaned || 'photo';
  return `studio/${Date.now()}-${base.slice(0, 80)}`;
}
