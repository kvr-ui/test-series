import crypto from 'node:crypto';
import { env } from '../config/env.js';

const COOKIE_NAME = 'vi_admin';
const SESSION_MS = 12 * 60 * 60 * 1000;

// Without ADMIN_SESSION_SECRET, sessions are signed with a per-boot key and end when the server restarts
const secret = env.admin.sessionSecret || crypto.randomBytes(32).toString('hex');

export const adminLoginEnabled = () => Boolean(env.admin.email && env.admin.password);

const sign = (payload) => crypto.createHmac('sha256', secret).update(payload).digest('base64url');

// Compares hashes so neither the length nor the content of the secret leaks through timing
const safeEqual = (a, b) =>
  crypto.timingSafeEqual(crypto.createHash('sha256').update(String(a)).digest(), crypto.createHash('sha256').update(String(b)).digest());

export const credentialsMatch = (email, password) =>
  adminLoginEnabled() &&
  // Both checks always run so a wrong email and a wrong password take the same time
  [safeEqual(String(email ?? '').trim().toLowerCase(), env.admin.email), safeEqual(password ?? '', env.admin.password)].every(Boolean);

function readCookie(req, name) {
  for (const part of (req.get('cookie') || '').split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) return decodeURIComponent(rest.join('='));
  }
  return '';
}

const cookieOptions = () => ['Path=/api/admin', 'HttpOnly', 'SameSite=Strict', ...(env.isProduction ? ['Secure'] : [])];

export function startAdminSession(res) {
  const payload = Buffer.from(JSON.stringify({ email: env.admin.email, exp: Date.now() + SESSION_MS })).toString('base64url');
  const token = `${payload}.${sign(payload)}`;
  res.append('Set-Cookie', [`${COOKIE_NAME}=${token}`, `Max-Age=${SESSION_MS / 1000}`, ...cookieOptions()].join('; '));
}

export function endAdminSession(res) {
  res.append('Set-Cookie', [`${COOKIE_NAME}=`, 'Max-Age=0', ...cookieOptions()].join('; '));
}

export function readAdminSession(req) {
  const [payload, signature] = readCookie(req, COOKIE_NAME).split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return null;
  try {
    const session = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    // A changed ADMIN_EMAIL invalidates existing sessions
    return session.exp > Date.now() && session.email === env.admin.email ? session : null;
  } catch {
    return null;
  }
}

export function requireAdminSession(req, res, next) {
  if (!adminLoginEnabled()) return res.status(403).json({ message: 'Dashboard login is disabled' });
  if (!readAdminSession(req)) return res.status(401).json({ message: 'Please log in' });
  next();
}
