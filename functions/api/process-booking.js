// Cloudflare Pages Function: POST /api/process-booking — receives bookings + contact messages.
// Stores in KV (binding BOOKINGS), emails customer + owner via Resend, texts via Twilio (all optional — degrade gracefully).

import { customerBookingEmail, ownerBookingEmail, contactEmail } from './_email.js';

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US');
let ENV = {};
const cfg = (k, d = '') => ENV[k] || d;
const BRAND = () => cfg('BRAND_NAME', 'Clear Vent');
const PHONE = () => cfg('BRAND_PHONE', '(612) 682-1616');
const SITE_URL = () => cfg('SITE_URL', 'https://clearventmn.com');

async function sendEmail({ to, subject, html, text, replyTo }) {
  const key = cfg('RESEND_API_KEY'), from = cfg('RESEND_FROM_EMAIL');
  if (!key || !from) return { status: 'skipped', reason: 'RESEND not configured' };
  const r = await fetch('https://api.resend.com/emails', {
    method: 'POST', headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: `${BRAND()} <${from}>`, to: [to], subject, html, text, reply_to: replyTo || cfg('OWNER_EMAIL') || undefined })
  });
  return { status: r.ok ? 'sent' : 'failed', code: r.status };
}

async function sendSms(to, body) {
  const sid = cfg('TWILIO_ACCOUNT_SID'), tok = cfg('TWILIO_AUTH_TOKEN'), from = cfg('TWILIO_FROM_NUMBER');
  if (!sid || !tok || !from || !to) return { status: 'skipped' };
  const auth = btoa(`${sid}:${tok}`);
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ From: from, To: to, Body: body })
  });
  return { status: r.ok ? 'sent' : 'failed', code: r.status };
}

const e164 = (p) => { const d = String(p || '').replace(/\D/g, '').replace(/^1(?=\d{10}$)/, ''); return d.length === 10 ? '+1' + d : null; };

const emailCtx = () => ({ brand: BRAND(), phone: PHONE(), siteUrl: SITE_URL(), email: cfg('BRAND_EMAIL', 'hello@clearventmn.com') });

async function handleBooking(b) {
  const results = {};
  // 1. Store
  try {
    if (!ENV.BOOKINGS) throw new Error('KV binding BOOKINGS not configured');
    await ENV.BOOKINGS.put('booking:' + b.confirmationNumber, JSON.stringify({ ...b, status: 'new', receivedAt: new Date().toISOString() }));
    results.store = 'saved';
  } catch (e) { results.store = 'failed: ' + e.message; }

  // 2. Customer email
  const cust = customerBookingEmail(b, emailCtx());
  results.customerEmail = await sendEmail({ to: b.email, subject: cust.subject, html: cust.html, text: cust.text });

  // 3. Owner email
  if (cfg('OWNER_EMAIL')) {
    const own = ownerBookingEmail(b, emailCtx());
    results.ownerEmail = await sendEmail({ to: cfg('OWNER_EMAIL'), replyTo: b.email, subject: own.subject, html: own.html, text: own.text });
  }

  // 4. SMS
  const ownerPhone = e164(cfg('OWNER_PHONE'));
  if (ownerPhone) results.ownerSms = await sendSms(ownerPhone, `NEW BOOKING ${b.confirmationNumber}: ${b.ventLabel} ${money(b.total)} · ${b.dateLabel} ${b.window} · ${b.address}, ${b.city} · ${b.name} ${b.phone}`);
  const custPhone = e164(b.phone);
  if (b.smsOk && custPhone) results.customerSms = await sendSms(custPhone, `${BRAND()}: you're booked for dryer vent cleaning ${b.dateLabel}, ${b.window}. Conf ${b.confirmationNumber}. Total ${b.ventLocation === 'unsure' ? 'from ' : ''}${money(b.total)}, pay on completion. Details and how to make changes are in your confirmation email. Reply STOP to opt out.`);
  return results;
}

async function handleContact(m) {
  const results = {};
  try { await ENV.BOOKINGS.put('message:' + Date.now() + '-' + Math.random().toString(36).slice(2, 6), JSON.stringify(m)); results.store = 'saved'; } catch (e) { results.store = 'failed'; }
  if (cfg('OWNER_EMAIL')) { const ce = contactEmail(m, emailCtx()); results.ownerEmail = await sendEmail({ to: cfg('OWNER_EMAIL'), replyTo: m.email, subject: ce.subject, html: ce.html, text: ce.text }); }
  const ownerPhone = e164(cfg('OWNER_PHONE'));
  if (ownerPhone) results.ownerSms = await sendSms(ownerPhone, `Website message from ${m.name} ${m.phone}: ${String(m.message).slice(0, 120)}`);
  return results;
}

export async function onRequestPost({ request, env }) {
  ENV = env || {};
  const req = request;
  let body; try { body = await req.json(); } catch { return json(400, { error: 'Invalid JSON' }); }
  try {
    if (body.type === 'contact') {
      if (!body.name || !body.message || (!body.email && !body.phone)) return json(400, { error: 'Missing fields' });
      return json(200, { success: true, results: await handleContact(body) });
    }
    const required = ['confirmationNumber', 'ventLocation', 'date', 'window', 'address', 'city', 'zip', 'name', 'phone', 'email'];
    const missing = required.filter(k => !body[k]);
    if (missing.length) return json(400, { error: 'Missing required fields', missing });
    const results = await handleBooking(body);
    return json(200, { success: true, confirmationNumber: body.confirmationNumber, results });
  } catch (err) {
    console.error('process-booking error', err);
    return json(500, { error: err.message });
  }
}
