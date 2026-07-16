import { get } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const url = typeof req.query.url === 'string' ? req.query.url : '';
  if (!url || !url.includes('blob.vercel-storage.com')) {
    return res.status(400).json({ error: 'Invalid blob url' });
  }

  try {
    const result = await get(url, { access: 'private' });
    if (!result?.stream) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
    res.setHeader('Content-Type', result.blob.contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Photo proxy error:', error);
    return res.status(500).json({ error: 'Failed to load photo' });
  }
}
