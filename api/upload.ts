import { handleUpload } from '@vercel/blob/client';
import { createPool } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const pool = createPool({
  connectionString: process.env.DATABASE_URL || process.env.POSTGRES_URL,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Return a token that allows the client to upload
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/gif',
            'image/webp',
            'image/avif',
            'image/heic',
            'image/heif',
          ],
          tokenPayload: JSON.stringify({ size: clientPayload || 'medium' }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This runs on the server after the upload completes
        try {
          const { size } = JSON.parse(tokenPayload || '{}');
          const date = new Date().toLocaleDateString('tr-TR');
          
          await pool.sql`
            INSERT INTO studio_photos (url, size, date)
            VALUES (${blob.url}, ${size || 'medium'}, ${date})
          `;
        } catch (error) {
          console.error('Database update failed:', error);
          throw new Error('Could not update database');
        }
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(400).json({ error: (error as Error).message });
  }
}
