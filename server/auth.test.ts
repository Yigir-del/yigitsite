import { afterEach, describe, expect, it } from 'vitest';
import { loginCredentialsOk, signSession, verifySessionToken } from './auth.js';

const SECRET = 'a'.repeat(32);

describe('session tokens', () => {
  afterEach(() => {
    delete process.env.ADMIN_SESSION_SECRET;
    delete process.env.ADMIN_IDENTITY;
    delete process.env.ADMIN_PASSPHRASE;
  });

  it('signs and verifies an unexpired token', () => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    const token = signSession(Date.now() + 60_000, SECRET);
    expect(verifySessionToken(token)).toBe(true);
  });

  it('rejects expired or tampered tokens', () => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    expect(verifySessionToken(signSession(Date.now() - 1000, SECRET))).toBe(false);
    const token = signSession(Date.now() + 60_000, SECRET);
    expect(verifySessionToken(token.slice(0, -2) + 'ff')).toBe(false);
  });

  it('accepts matching credentials', () => {
    process.env.ADMIN_SESSION_SECRET = SECRET;
    process.env.ADMIN_IDENTITY = 'kral';
    process.env.ADMIN_PASSPHRASE = 'sifre';
    expect(loginCredentialsOk('kral', 'sifre')).toBe(true);
    expect(loginCredentialsOk('kral', 'yanlis')).toBe(false);
    expect(loginCredentialsOk('', '')).toBe(false);
  });
});
