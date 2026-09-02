import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readSession } from '../../server/auth.js';
import { noStore, sendError } from '../../server/http.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  noStore(res);
  if (req.method !== 'GET') return sendError(res, 405, 'Method Not Allowed');
  return res.status(200).json({ admin: readSession(req) });
}
