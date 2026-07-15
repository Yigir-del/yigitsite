import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { rows } = await sql`SELECT * FROM notes ORDER BY created_at ASC`;
      return res.status(200).json(rows);
    } catch (error) {
      console.error('Error fetching notes:', error);
      return res.status(500).json({ error: 'Failed to fetch notes' });
    }
  }

  if (req.method === 'POST') {
    try {
      const { text, author, date, isAdmin } = req.body;
      const { rows } = await sql`
        INSERT INTO notes (text, author, date, "isAdmin")
        VALUES (${text}, ${author}, ${date}, ${isAdmin || false})
        RETURNING *;
      `;
      return res.status(201).json(rows[0]);
    } catch (error) {
      console.error('Error creating note:', error);
      return res.status(500).json({ error: 'Failed to create note' });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      await sql`DELETE FROM notes WHERE id = ${id as string}`;
      return res.status(200).json({ message: 'Note deleted' });
    } catch (error) {
      console.error('Error deleting note:', error);
      return res.status(500).json({ error: 'Failed to delete note' });
    }
  }

  return res.status(405).json({ error: 'Method Not Allowed' });
}
