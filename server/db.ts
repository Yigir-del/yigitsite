import { createPool } from '@vercel/postgres';

export const pool = createPool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

let schemaReady: Promise<void> | null = null;

/** Idempotent schema — replaces the public /api/initDb endpoint. */
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      await pool.sql`
        CREATE TABLE IF NOT EXISTS notes (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          text TEXT NOT NULL,
          author VARCHAR(255) NOT NULL,
          date VARCHAR(255),
          "isAdmin" BOOLEAN DEFAULT false,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await pool.sql`
        CREATE INDEX IF NOT EXISTS notes_created_at_idx ON notes (created_at DESC)
      `;
      await pool.sql`
        CREATE TABLE IF NOT EXISTS studio_photos (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          url TEXT NOT NULL,
          size VARCHAR(50) DEFAULT 'medium',
          date VARCHAR(255),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        )
      `;
      await pool.sql`
        CREATE TABLE IF NOT EXISTS wreath_meta (
          id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
          total BIGINT NOT NULL DEFAULT 0
        )
      `;
      await pool.sql`
        INSERT INTO wreath_meta (id, total)
        VALUES (1, 0)
        ON CONFLICT (id) DO NOTHING
      `;
      await pool.sql`
        CREATE TABLE IF NOT EXISTS wreath_daily (
          visitor_key VARCHAR(64) NOT NULL,
          day_key DATE NOT NULL,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (visitor_key, day_key)
        )
      `;
    })().catch((err) => {
      schemaReady = null;
      throw err;
    });
  }
  return schemaReady;
}
