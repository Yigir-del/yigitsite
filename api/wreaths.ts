import { createHash } from 'crypto';
import { createPool } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

let schemaReady: Promise<void> | null = null;

function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.sql`
        CREATE TABLE IF NOT EXISTS wreath_meta (
          id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
          total BIGINT NOT NULL DEFAULT 0
        );
      `;
      await pool.sql`
        INSERT INTO wreath_meta (id, total)
        VALUES (1, 0)
        ON CONFLICT (id) DO NOTHING;
      `;
      await pool.sql`
        CREATE TABLE IF NOT EXISTS wreath_daily (
          visitor_key VARCHAR(64) NOT NULL,
          day_key DATE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (visitor_key, day_key)
        );
      `;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}

/** Calendar day in Turkey — memorial day boundary */
function istanbulDayKey(): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || 'unknown';
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) return realIp;
  return req.socket?.remoteAddress || 'unknown';
}

function visitorKey(req: VercelRequest): string {
  const ua = typeof req.headers['user-agent'] === 'string' ? req.headers['user-agent'] : '';
  return createHash('sha256').update(`${clientIp(req)}|${ua.slice(0, 120)}`).digest('hex').slice(0, 64);
}

async function readTotal(): Promise<number> {
  const { rows } = await pool.sql`SELECT total FROM wreath_meta WHERE id = 1`;
  return Number(rows[0]?.total ?? 0);
}

async function hasLeftToday(key: string, day: string): Promise<boolean> {
  const { rows } = await pool.sql`
    SELECT 1 FROM wreath_daily
    WHERE visitor_key = ${key} AND day_key = ${day}::date
    LIMIT 1
  `;
  return rows.length > 0;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');

  try {
    await ensureSchema();
  } catch (error) {
    console.error('wreaths schema error:', error);
    return res.status(500).json({ error: 'Database unavailable' });
  }

  const key = visitorKey(req);
  const day = istanbulDayKey();

  if (req.method === 'GET') {
    try {
      const [count, alreadyLeft] = await Promise.all([readTotal(), hasLeftToday(key, day)]);
      return res.status(200).json({ count, alreadyLeft, day });
    } catch (error) {
      console.error('wreaths GET error:', error);
      return res.status(500).json({ error: 'Failed to fetch wreaths' });
    }
  }

  if (req.method === 'POST') {
    try {
      const claim = await pool.sql`
        INSERT INTO wreath_daily (visitor_key, day_key)
        VALUES (${key}, ${day}::date)
        ON CONFLICT (visitor_key, day_key) DO NOTHING
        RETURNING visitor_key
      `;

      if (claim.rows.length === 0) {
        const count = await readTotal();
        return res.status(409).json({
          count,
          alreadyLeft: true,
          day,
          error: 'Already left a wreath today',
        });
      }

      const { rows } = await pool.sql`
        UPDATE wreath_meta
        SET total = total + 1
        WHERE id = 1
        RETURNING total
      `;

      return res.status(201).json({
        count: Number(rows[0]?.total ?? 0),
        alreadyLeft: true,
        day,
      });
    } catch (error) {
      console.error('wreaths POST error:', error);
      return res.status(500).json({ error: 'Failed to leave wreath' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
