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

// Send an SMS. Prefers a restricted API key (TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET, scoped to Messages)
// so the account auth token never has to be used for outbound traffic; falls back to SID:token if no key is set.
export async function sendSms(env, to, body) {
  const sid = env.TWILIO_ACCOUNT_SID, from = env.TWILIO_FROM_NUMBER;
  const user = env.TWILIO_API_KEY_SID || sid, pass = env.TWILIO_API_KEY_SID ? env.TWILIO_API_KEY_SECRET : env.TWILIO_AUTH_TOKEN;
  if (!sid || !user || !pass || !from || !to) return { status: 'skipped' };
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST', headers: { Authorization: 'Basic ' + btoa(`${user}:${pass}`), 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ From: from, To: to, Body: String(body).slice(0, 1500) })
  });
  return { status: r.ok ? 'sent' : 'failed', code: r.status };
}

export async function readParams(request) {
  if (request.method === 'POST') return new URLSearchParams(await request.text());
  return new URL(request.url).searchParams;
}
