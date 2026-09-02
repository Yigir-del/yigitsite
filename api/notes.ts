import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readSession, requireAdmin } from '../server/auth.js';
import { ensureSchema, pool } from '../server/db.js';
import { clientIp, noStore, sendError } from '../server/http.js';
import { WINDOW, rateLimit } from '../server/rateLimit.js';
import { isUuid, parseNoteInput } from '../server/validate.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  noStore(res);

  try {
    await ensureSchema();
  } catch (error) {
    console.error('notes schema error:', error);
    return sendError(res, 500, 'Database unavailable');
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.sql`
        SELECT id, text, author, date, "isAdmin", created_at
        FROM notes
        ORDER BY created_at DESC
        LIMIT 200
      `;
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching notes:', error);
      return sendError(res, 500, 'Failed to fetch notes');
    }
  }

  if (req.method === 'POST') {
    const ip = clientIp(req);
    if (!rateLimit(`notes:${ip}`, 8, WINDOW.hour)) {
      return sendError(res, 429, 'Too many notes');
    }

    const parsed = parseNoteInput(req.body);
    if (!parsed) return sendError(res, 400, 'Invalid note');

    const isAdmin = readSession(req);

    try {
      const { rows } = await pool.sql`
        INSERT INTO notes (text, author, date, "isAdmin")
        VALUES (${parsed.text}, ${parsed.author}, ${parsed.date}, ${isAdmin})
        RETURNING id, text, author, date, "isAdmin", created_at
      `;
      return res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating note:', error);
      return sendError(res, 500, 'Failed to create note');
    }
  }

  if (req.method === 'DELETE') {
    if (!requireAdmin(req, res)) return;
    const id = typeof req.query.id === 'string' ? req.query.id : '';
    if (!isUuid(id)) return sendError(res, 400, 'Invalid id');

    try {
      const { rowCount } = await pool.sql`DELETE FROM notes WHERE id = ${id}`;
      if (!rowCount) return sendError(res, 404, 'Not found');
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('Error deleting note:', error);
      return sendError(res, 500, 'Failed to delete note');
    }
  }

  return sendError(res, 405, 'Method Not Allowed');
}
