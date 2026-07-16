import { put } from '@vercel/blob';
import { createPool } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Readable } from 'node:stream';

export const config = {
  api: {
    bodyParser: false,
  },
};

const pool = createPool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

const MAX_BYTES = 4.5 * 1024 * 1024;

function readRequestBody(req: VercelRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    const stream = req as unknown as Readable;

    stream.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

function sanitizeFilename(name: string): string {
  const cleaned = name.replace(/[^\w.\-]+/g, '_').replace(/_+/g, '_');
  const base = cleaned || 'photo.jpg';
  return `studio/${Date.now()}-${base}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const contentTypeHeader = String(req.headers['content-type'] || '');
    const filenameHeader = String(req.headers['x-filename'] || 'photo.jpg');
    const size = String(req.headers['x-size'] || 'medium');
    const altHeader = String(req.headers['x-alt'] || '');
    const alt = decodeURIComponent(altHeader).trim() || 'İsimsiz Eser';
    const filename = decodeURIComponent(filenameHeader);

    const body = await readRequestBody(req);
    if (!body.length) {
      return res.status(400).json({ error: 'Boş dosya' });
    }
    if (body.length > MAX_BYTES) {
      return res.status(413).json({
        error: 'Fotoğraf 4.5MB sınırını aşıyor. Daha küçük bir görsel dene.',
      });
    }

    const contentType = contentTypeHeader.startsWith('image/')
      ? contentTypeHeader
      : 'image/jpeg';

    const blob = await put(sanitizeFilename(filename), body, {
      access: 'private',
      contentType,
      addRandomSuffix: true,
    });

    const date = new Date().toLocaleDateString('tr-TR');
    const { rows } = await pool.sql`
      INSERT INTO studio_photos (url, size, date)
      VALUES (${blob.url}, ${size || 'medium'}, ${date})
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
    console.error('Upload Error:', error);
    return res.status(400).json({ error: (error as Error).message || 'Yükleme başarısız' });
  }
}
