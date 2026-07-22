import { createPool } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Create Notes Table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS notes (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        text TEXT NOT NULL,
        author VARCHAR(255) NOT NULL,
        date VARCHAR(255),
        "isAdmin" BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

    // Create Studio Photos Table
    await pool.sql`
      CREATE TABLE IF NOT EXISTS studio_photos (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        url TEXT NOT NULL,
        size VARCHAR(50) DEFAULT 'medium',
        date VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (visitor_key, day_key)
      );
    `;

    return res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

