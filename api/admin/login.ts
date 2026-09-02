import type { VercelRequest, VercelResponse } from '@vercel/node';
import { loginCredentialsOk, setSessionCookie } from '../../server/auth.js';
import { clientIp, noStore, sendError } from '../../server/http.js';
import { WINDOW, rateLimit } from '../../server/rateLimit.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  noStore(res);
  if (req.method !== 'POST') return sendError(res, 405, 'Method Not Allowed');

  const ip = clientIp(req);
  if (!rateLimit(`login:${ip}`, 8, WINDOW.hour)) {
    return sendError(res, 429, 'Too many attempts');
  }

  const body = req.body && typeof req.body === 'object' ? req.body : {};
  const identity = typeof body.identity === 'string' ? body.identity.slice(0, 80) : '';
  const passphrase = typeof body.passphrase === 'string' ? body.passphrase.slice(0, 200) : '';

  if (!loginCredentialsOk(identity, passphrase)) {
    return sendError(res, 401, 'Unauthorized');
  }

  setSessionCookie(res);
  return res.status(200).json({ ok: true });
}
