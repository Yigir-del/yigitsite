import type { VercelRequest, VercelResponse } from '@vercel/node';

export function clientIp(req: VercelRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0]?.trim() || 'unknown';
  }
  if (Array.isArray(forwarded) && forwarded[0]) {
    return forwarded[0].split(',')[0]?.trim() || 'unknown';
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string' && realIp.length > 0) return realIp;
  return req.socket?.remoteAddress || 'unknown';
}

export function sendError(
  res: VercelResponse,
  status: number,
  error: string,
  extra?: Record<string, unknown>,
) {
  res.setHeader('Cache-Control', 'no-store');
  return res.status(status).json({ error, ...extra });
}

export function noStore(res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
}
