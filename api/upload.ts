import { handleUpload } from '@vercel/blob/client';
import { sql } from '@vercel/postgres';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const jsonResponse = await handleUpload({
      body: req.body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Return a token that allows the client to upload
        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          tokenPayload: JSON.stringify({ size: clientPayload || 'medium' }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // This runs on the server after the upload completes
        try {
          const { size } = JSON.parse(tokenPayload || '{}');
          const date = new Date().toLocaleDateString('tr-TR');
          
          await sql`
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
