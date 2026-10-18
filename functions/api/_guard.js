// Shared abuse guards for the public API: client IP, KV-backed rate limits, timing-safe admin auth, input cleaning.

export const clientIp = (request) => request.headers.get('CF-Connecting-IP') || request.headers.get('X-Forwarded-For') || 'unknown';

// Fixed-window counter in KV. Returns true if the request is allowed. Fails open if KV is missing.
export async function rateLimit(env, bucket, limit, ttlSec) {
  if (!env.BOOKINGS) return true;
  const key = `rl:${bucket}`;
  try {
    const n = Number(await env.BOOKINGS.get(key)) || 0;
    if (n >= limit) return false;
    await env.BOOKINGS.put(key, String(n + 1), { expirationTtl: Math.max(60, ttlSec) });
  } catch { /* fail open */ }
  return true;
}

export function timingSafeEqual(a, b) {
  a = String(a || ''); b = String(b || '');
  const len = Math.max(a.length, b.length);
  let diff = a.length ^ b.length;
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}

// Bearer-token admin check with a brute-force limit: 10 bad tokens per IP per 15 minutes.
// Returns null when authorized, otherwise a Response to send back.
export async function adminAuth(request, env) {
  const ip = clientIp(request);
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  const tooMany = env.BOOKINGS ? Number(await env.BOOKINGS.get(`rl:adminfail:${ip}`).catch(() => 0)) >= 10 : false;
  if (tooMany) return new Response(JSON.stringify({ error: 'Too many attempts. Try again in 15 minutes.' }), { status: 429, headers: { 'Content-Type': 'application/json' } });
  if (!env.ADMIN_TOKEN || !timingSafeEqual(token, env.ADMIN_TOKEN)) {
    await rateLimit(env, `adminfail:${ip}`, 10, 900);
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  return null;
}

// Strip control characters, collapse whitespace, cap length.
export const clean = (v, max = 300) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
export const cleanMultiline = (v, max = 1000) => String(v ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').replace(/\r\n?/g, '\n').trim().slice(0, max);
export const isEmail = (s) => /^[^\s@]{1,64}@[^\s@]{1,190}\.[A-Za-z]{2,}$/.test(String(s || ''));

// US-only E.164. Rejects non-US NANP countries (Caribbean premium destinations) so the form can't be used for SMS pumping.
const NON_US_NANP = new Set(['242','246','264','268','284','345','441','473','649','658','664','721','758','767','784','809','829','849','868','869','876']);
export function usE164(p) {
  const d = String(p || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, '');
  if (d.length !== 10) return null;
  const area = d.slice(0, 3);
  if (NON_US_NANP.has(area) || /^[01]/.test(area) || /^[01]/.test(d.slice(3, 6))) return null;
  return '+1' + d;
}
