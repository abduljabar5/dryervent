// Shared helpers for Twilio webhooks (voice forwarding + inbound SMS) and outbound SMS.
import { timingSafeEqual } from './_guard.js';
export const xml = (body) => new Response(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`, { headers: { 'Content-Type': 'text/xml' } });
export const escXml = (s) => String(s || '').replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]));

// Inbound webhooks (/api/voice, /api/sms-inbound) are authenticated with our own secret carried in the
// webhook URL as ?k=... (set the same value in the Twilio console). No Twilio auth token is stored anywhere.
// Fails closed: if TWILIO_WEBHOOK_SECRET is unset, every webhook is rejected.
export function verifyWebhook(request, env) {
  const secret = env.TWILIO_WEBHOOK_SECRET;
  if (!secret) return false;
  const k = new URL(request.url).searchParams.get('k') || '';
  return timingSafeEqual(k, secret);
}

// Path + query of the current webhook, so TwiML action/callback URLs keep the ?k= secret.
export function webhookPath(request) {
  const u = new URL(request.url);
  return u.pathname + u.search;
}

// Send an SMS with a restricted API key (TWILIO_API_KEY_SID + TWILIO_API_KEY_SECRET, scoped to Messages: Create only).
// The account auth token is deliberately never used or stored by this site.
export async function sendSms(env, to, body) {
  const sid = env.TWILIO_ACCOUNT_SID, from = env.TWILIO_FROM_NUMBER, user = env.TWILIO_API_KEY_SID, pass = env.TWILIO_API_KEY_SECRET;
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
