import { del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { requireAdmin } from '../server/auth.js';
import { isAllowedBlobUrl } from '../server/blobUrl.js';
import { ensureSchema, pool } from '../server/db.js';
import { noStore, sendError } from '../server/http.js';
import { isUuid } from '../server/validate.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  noStore(res);

  try {
    await ensureSchema();
  } catch (error) {
    console.error('photos schema error:', error);
    return sendError(res, 500, 'Database unavailable');
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.sql`
        SELECT id, url, size, date FROM studio_photos ORDER BY created_at DESC LIMIT 100
      `;
      const formatted = rows.map((row) => ({
        id: row.id,
        type: 'photo',
        src: `/api/photo?url=${encodeURIComponent(row.url)}`,
        size: row.size,
        date: row.date,
      }));
      return res.status(200).json(formatted);
    } catch (error) {
      console.error('Error fetching photos:', error);
      return sendError(res, 500, 'Failed to fetch photos');
    }
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return;
    const id = typeof req.query.id === 'string' ? req.query.id : '';
    if (!isUuid(id)) return sendError(res, 400, 'Invalid id');

    try {
      const { rows } = await pool.sql`
        DELETE FROM studio_photos WHERE id = ${id} RETURNING url
      `;
      if (!rows[0]) return sendError(res, 404, 'Not found');

      const blobUrl = rows[0].url as string;
      if (isAllowedBlobUrl(blobUrl)) {
        try {
          await del(blobUrl);
        } catch (error) {
          console.error('Blob delete failed after DB delete:', error);
        }
      }

      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error deleting photo:', error);
      return sendError(res, 500, 'Failed to delete photo');
    }
  }

  return sendError(res, 405, 'Method Not Allowed');
}
