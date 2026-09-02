import { del, put } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'node:stream';
import { requireAdmin } from '../server/auth.js';
import { ensureSchema, pool } from '../server/db.js';
import { clientIp, sendError } from '../server/http.js';
import { sanitizeFilename, sniffImage } from '../server/image.js';
import { WINDOW, rateLimit } from '../server/rateLimit.js';
import { LIMITS, clip, parsePhotoSize } from '../server/validate.js';

export const config = {
  api: {
    bodyParser: false,
  },
};

const MAX_BYTES = 4.5 * 1024 * 1024;

function readRequestBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = req as unknown as Readable;
    let total = 0;

    stream.on('data', (chunk: Buffer) => {
      total += chunk.length;
      if (total > MAX_BYTES) {
        stream.destroy();
        reject(Object.assign(new Error('too large'), { code: 'TOO_LARGE' }));
        return;
      }
      chunks.push(Buffer.from(chunk));
    });
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return sendError(res, 405, 'Method Not Allowed');
  if (!requireAdmin(req, res)) return;

  const ip = clientIp(req);
  if (!rateLimit(`upload:${ip}`, 12, WINDOW.hour)) {
    return sendError(res, 429, 'Too many uploads');
  }

  try {
    await ensureSchema();
    const filenameHeader = String(req.headers['x-filename'] || 'photo.jpg').slice(0, LIMITS.filename);
    const size = parsePhotoSize(req.headers['x-size']);
    const altHeader = String(req.headers['x-alt'] || '');
    let alt = 'İsimsiz Eser';
    try {
      alt = clip(decodeURIComponent(altHeader), LIMITS.altText) || 'İsimsiz Eser';
    } catch {
      alt = 'İsimsiz Eser';
    }

    const body = await readRequestBody(req);
    if (!body.length) return sendError(res, 400, 'Boş dosya');

    const kind = sniffImage(body);
    if (!kind) return sendError(res, 400, 'Desteklenmeyen görsel');

    const blob = await put(sanitizeFilename(filenameHeader), body, {
      access: 'private',
      contentType: kind,
      addRandomSuffix: true,
    });

    const date = new Date().toLocaleDateString('tr-TR');
    try {
      const { rows } = await pool.sql`
        INSERT INTO studio_photos (url, size, date)
        VALUES (${blob.url}, ${size}, ${date})
        RETURNING id, url, size, date
      `;
      const row = rows[0];
      return res.status(200).json({
        id: String(row.id),
        type: 'photo',
        src: `/api/photo?url=${encodeURIComponent(row.url)}`,
        url: row.url,
        alt,
        size: row.size,
        date: row.date,
      });
    } catch (error) {
      try {
        await del(blob.url);
      } catch {
        console.error('Upload rollback blob delete failed');
      }
      throw error;
    }
  } catch (error) {
    const code = (error as { code?: string }).code;
    if (code === 'TOO_LARGE') {
      return sendError(res, 413, 'Fotoğraf 4.5MB sınırını aşıyor. Daha küçük bir görsel dene.');
    }
    console.error('Upload Error:', error);
    return sendError(res, 400, 'Yükleme başarısız');
  }
}
