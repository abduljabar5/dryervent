// Minimal Stripe helpers for Pages Functions (no SDK needed: form-encoded REST + WebCrypto).

// Flatten a nested object into Stripe's bracket form encoding: { a: { b: 1 }, c: [x] } -> a[b]=1&c[0]=x
export function encode(obj, prefix = '', out = new URLSearchParams()) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((item, i) => (typeof item === 'object' ? encode(item, `${key}[${i}]`, out) : out.append(`${key}[${i}]`, String(item))));
    else if (typeof v === 'object') encode(v, key, out);
    else out.append(key, String(v));
  }
  return out;
}

export async function stripe(env, path, params, { method = 'POST', idempotencyKey } = {}) {
  const headers = { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Stripe-Version': '2025-08-27.basil' };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  let url = `https://api.stripe.com/v1${path}`, body;
  if (method === 'GET') { const q = params ? encode(params).toString() : ''; if (q) url += `?${q}`; }
  else { headers['Content-Type'] = 'application/x-www-form-urlencoded'; body = encode(params || {}).toString(); }
  const r = await fetch(url, { method, headers, body });
  const data = await r.json();
  if (!r.ok) { const e = new Error(data.error?.message || `Stripe ${r.status}`); e.status = r.status; e.stripe = data.error; throw e; }
  return data;
}

// Verify a Stripe webhook: Stripe-Signature "t=...,v1=..." over `${t}.${rawBody}` with HMAC-SHA256.
export async function verifyWebhook(rawBody, sigHeader, secret, toleranceSec = 300) {
  if (!sigHeader || !secret) return false;
  const parts = Object.fromEntries(sigHeader.split(',').map((p) => p.split('=').map((s) => s.trim())).filter((p) => p.length === 2).map(([k, v]) => [k, k === 'v1' ? v : v]));
  const v1s = sigHeader.split(',').map((p) => p.trim()).filter((p) => p.startsWith('v1=')).map((p) => p.slice(3));
  const t = parts.t;
  if (!t || !v1s.length) return false;
  if (Math.abs(Date.now() / 1000 - Number(t)) > toleranceSec) return false;
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${rawBody}`));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, '0')).join('');
  return v1s.some((v) => timingSafeEqual(v, expected));
}

function timingSafeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0; for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
export const normConf = (c) => String(c || '').trim().toUpperCase().replace(/[^A-Z0-9-]/g, '');
export const amountDue = (b) => Math.round(Number(b.finalTotal || b.total || 0) * 100); // cents
