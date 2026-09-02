import { get } from '@vercel/blob';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { isAllowedBlobUrl } from '../server/blobUrl.js';
import { sendError } from '../server/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return sendError(res, 405, 'Method Not Allowed');

  const url = typeof req.query.url === 'string' ? req.query.url : '';
  if (!isAllowedBlobUrl(url)) return sendError(res, 400, 'Invalid blob url');

  try {
    const result = await get(url, { access: 'private' });
    if (!result?.stream) return sendError(res, 404, 'Photo not found');

    const buffer = Buffer.from(await new Response(result.stream).arrayBuffer());
    res.setHeader('Content-Type', result.blob.contentType || 'image/jpeg');
    res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Content-Length', buffer.length);
    return res.status(200).send(buffer);
  } catch (error) {
    console.error('Photo proxy error:', error);
    return sendError(res, 500, 'Failed to load photo');
  }
}
