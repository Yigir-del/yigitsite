import { createHmac, timingSafeEqual } from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { sendError } from './http.js';

export const SESSION_COOKIE = 'yigit_session';
const MAX_AGE_SEC = 60 * 60 * 24 * 30;

function sessionSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 16 ? secret : null;
}

function sha256Hmac(value: string, secret: string): string {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function safeEqualHex(a: string, b: string): boolean {
  try {
    const ba = Buffer.from(a, 'hex');
    const bb = Buffer.from(b, 'hex');
    if (ba.length === 0 || ba.length !== bb.length) return false;
    return timingSafeEqual(ba, bb);
  } catch {
    return false;
  }
}

function digestCredential(value: string, secret: string): Buffer {
  return createHmac('sha256', secret).update(value).digest();
}

export function loginCredentialsOk(identity: string, passphrase: string): boolean {
  const secret = sessionSecret();
  const expectedId = process.env.ADMIN_IDENTITY ?? '';
  const expectedPass = process.env.ADMIN_PASSPHRASE ?? '';
  if (!secret || !expectedId || !expectedPass) return false;

  const idOk = timingSafeEqual(
    digestCredential(identity, secret),
    digestCredential(expectedId, secret),
  );
  const passOk = timingSafeEqual(
    digestCredential(passphrase, secret),
    digestCredential(expectedPass, secret),
  );
  return idOk && passOk;
}

export function signSession(expiresAt: number, secret: string): string {
  const payload = String(expiresAt);
  return `${payload}.${sha256Hmac(payload, secret)}`;
}

export function verifySessionToken(token: string, now = Date.now()): boolean {
  const secret = sessionSecret();
  if (!secret) return false;
  const dot = token.lastIndexOf('.');
  if (dot <= 0) return false;
  const payload = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = sha256Hmac(payload, secret);
  if (!safeEqualHex(sig, expected)) return false;
  const exp = Number(payload);
  if (!Number.isFinite(exp) || exp < now) return false;
  return true;
}

function parseCookieHeader(header: string | undefined, name: string): string | null {
  if (!header) return null;
  for (const part of header.split(';')) {
    const [rawKey, ...rest] = part.trim().split('=');
    if (rawKey === name) return decodeURIComponent(rest.join('='));
  }
  return null;
}

export function readSession(req: VercelRequest): boolean {
  const token = parseCookieHeader(req.headers.cookie, SESSION_COOKIE);
  if (!token) return false;
  return verifySessionToken(token);
}

export function setSessionCookie(res: VercelResponse): void {
  const secret = sessionSecret();
  if (!secret) return;
  const expiresAt = Date.now() + MAX_AGE_SEC * 1000;
  const token = signSession(expiresAt, secret);
  const secure = process.env.VERCEL ? '; Secure' : '';
  res.setHeader(
    'Set-Cookie',
    `${SESSION_COOKIE}=${encodeURIComponent(token)}; HttpOnly; Path=/; Max-Age=${MAX_AGE_SEC}; SameSite=Lax${secure}`,
  );
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  if (readSession(req)) return true;
  sendError(res, 401, 'Unauthorized');
  return false;
}
