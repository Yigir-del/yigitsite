import { createHash } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ensureSchema, pool } from '../server/db.js';
import { clientIp, noStore, sendError } from '../server/http.js';
import { WINDOW, rateLimit } from '../server/rateLimit.js';

function istanbulDayKey(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function visitorKey(req: VercelRequest): string {
  const ua = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '';
  return createHash('sha256').update(`${clientIp(req)}|${ua.slice(0, 120)}`).digest('hex').slice(0, 64);
}

async function readTotal(): Promise<number> {
  const { rows } = await pool.sql`SELECT total FROM wreath_meta WHERE id = 1`;
  return Number(rows[0]?.total ?? 0);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  noStore(res);

  try {
    await ensureSchema();
  } catch (error) {
    console.error('wreaths schema error:', error);
    return sendError(res, 500, 'Database unavailable');
  }

  const key = visitorKey(req);
  const day = istanbulDayKey();

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.sql`
        SELECT 1 FROM wreath_daily
        WHERE visitor_key = ${key} AND day_key = ${day}::date
        LIMIT 1
      `;
      const count = await readTotal();
      return res.status(200).json({ count, alreadyLeft: rows.length > 0, day });
    } catch (error) {
      console.error('wreaths GET error:', error);
      return sendError(res, 500, 'Failed to fetch wreaths');
    }
  }

  if (req.method === 'POST') {
    if (!rateLimit(`wreath:${clientIp(req)}`, 12, WINDOW.hour)) {
      return sendError(res, 429, 'Too many attempts');
    }

    try {
      const { rows } = await pool.sql`
        WITH claim AS (
          INSERT INTO wreath_daily (visitor_key, day_key)
          VALUES (${key}, ${day}::date)
          ON CONFLICT (visitor_key, day_key) DO NOTHING
          RETURNING visitor_key
        ),
        bump AS (
          UPDATE wreath_meta
          SET total = total + 1
          WHERE id = 1 AND EXISTS (SELECT 1 FROM claim)
          RETURNING total
        )
        SELECT
          (SELECT COUNT(*)::int FROM claim) AS claimed,
          COALESCE(
            (SELECT total FROM bump),
            (SELECT total FROM wreath_meta WHERE id = 1),
            0
          ) AS total
      `;

      const claimed = Number(rows[0]?.claimed ?? 0);
      const count = Number(rows[0]?.total ?? 0);

      if (claimed === 0) {
        return res.status(409).json({
          count,
          alreadyLeft: true,
          day,
          error: 'Already left a wreath today',
        });
      }

      return res.status(201).json({
        count,
        alreadyLeft: true,
        day,
      });
    } catch (error) {
      console.error('wreaths POST error:', error);
      return sendError(res, 500, 'Failed to leave wreath');
    }
  }

  return sendError(res, 405, 'Method Not Allowed');
}
