import { sql } from '@vercel/postgres';
import { del } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM studio_photos ORDER BY created_at DESC`;
      
      // Map to frontend interface format
      const formatted = rows.map(row => ({
        id: row.id,
        type: 'photo',
        src: row.url,
        size: row.size,
        date: row.date
      }));
      
      return res.status(200).json(formatted);
    } catch (error) {
      console.error('Error fetching photos:', error);
      return res.status(500).json({ error: 'Failed to fetch photos' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id, url } = req.query;
      
      // Delete from Vercel Blob
      if (url && typeof url === 'string') {
        await del(url);
      }
      
      // Delete from Postgres
      if (id && typeof id === 'string') {
        await sql`DELETE FROM studio_photos WHERE id = ${id}`;
      }
      
      return res.status(200).json({ message: 'Photo deleted successfully' });
    } catch (error) {
      console.error('Error deleting photo:', error);
      return res.status(500).json({ error: 'Failed to delete photo' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
