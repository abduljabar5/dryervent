// Shared helpers for Twilio webhooks (voice forwarding + inbound SMS).
export const xml = (body) => new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, { headers: { 'Content-Type': 'text/xml' } });
export const escXml = (s) => String(s || '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

// Verify X-Twilio-Signature: HMAC-SHA1(authToken, url + sorted POST params), base64.
export async function verifyTwilio(request, params, env) {
  const token = env.TWILIO_AUTH_TOKEN;
  if (!token) return true; // not configured: allow (local dev)
  const sig = request.headers.get('X-Twilio-Signature') || '';
  const u = new URL(request.url);
  const url = `https://${u.host}${u.pathname}${u.search}`;
  const data = url + [...params.keys()].sort().map((k) => k + params.get(k)).join('');
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(token), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign']);
  const mac = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(data));
  const expected = btoa(String.fromCharCode(...new Uint8Array(mac)));
  return expected === sig;
}

export async function readParams(request) {
  if (request.method === 'POST') return new URLSearchParams(await request.text());
  return new URL(request.url).searchParams;
}
