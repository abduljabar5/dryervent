// Cloudflare Pages Function: POST /api/process-booking — receives bookings + contact messages.
// Stores in KV (binding BOOKINGS), emails customer + owner via Resend, texts via Twilio (all optional — degrade gracefully).

import { customerBookingEmail, ownerBookingEmail, contactEmail } from './_email.js';
import { PRICING } from '../../src/data/site.js';
import { clientIp, rateLimit, clean, cleanMultiline, isEmail, usE164 } from './_guard.js';

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

const e164 = usE164;

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

// ---- Validation: the server is the source of truth for prices, labels and the confirmation number. ----
const WINDOWS = new Set(PRICING.windows);
const ADDONS = new Map(PRICING.addons.map((a) => [a.id, a]));
const SYMPTOMS = new Set(['Takes 2 cycles to dry', 'Dryer runs hot', 'Burning smell', 'Lint around outside vent', "Flapper doesn't open", 'Hear birds / chirping', 'Just maintenance']);
const fmtDate = (iso) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const isIsoDate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(s) && !Number.isNaN(Date.parse(`${s}T12:00:00Z`));

async function newConfirmation() {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  for (let tries = 0; tries < 5; tries++) {
    const bytes = crypto.getRandomValues(new Uint8Array(5));
    const conf = 'DV-' + [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
    if (!ENV.BOOKINGS || !(await ENV.BOOKINGS.get('booking:' + conf))) return conf;
  }
  throw new Error('Could not allocate a confirmation number');
}

function validateBooking(body) {
  const errors = [];
  const ventLocation = clean(body.ventLocation, 20);
  if (!PRICING.base[ventLocation]) errors.push('ventLocation');
  const window = clean(body.window, 40);
  if (!WINDOWS.has(window)) errors.push('window');
  const date = clean(body.date, 10);
  const today = new Date(); today.setUTCHours(0, 0, 0, 0);
  const max = new Date(today); max.setUTCDate(max.getUTCDate() + 90);
  if (!isIsoDate(date) || Date.parse(`${date}T12:00:00Z`) < today.getTime() - 86400000 || Date.parse(`${date}T12:00:00Z`) > max.getTime()) errors.push('date');
  const name = clean(body.name, 80); if (name.length < 2) errors.push('name');
  const email = clean(body.email, 254).toLowerCase(); if (!isEmail(email)) errors.push('email');
  const phoneE164 = usE164(body.phone); if (!phoneE164) errors.push('phone');
  const address = clean(body.address, 120); if (address.length < 4) errors.push('address');
  const city = clean(body.city, 60); if (city.length < 2) errors.push('city');
  const zip = clean(body.zip, 10); if (!/^\d{5}(-\d{4})?$/.test(zip)) errors.push('zip');
  if (errors.length) return { errors };

  const addonIds = [...new Set((Array.isArray(body.addons) ? body.addons : []).map((a) => clean(a, 20)).filter((id) => ADDONS.has(id)))];
  const addonItems = addonIds.map((id) => ({ id, label: ADDONS.get(id).label, price: ADDONS.get(id).price }));
  const basePrice = PRICING.base[ventLocation].price;
  const total = basePrice + addonItems.reduce((s, a) => s + a.price, 0);
  const d = phoneE164.slice(2);
  const booking = {
    type: 'booking', ventLocation, ventLabel: PRICING.base[ventLocation].label, basePrice,
    addons: addonIds, addonItems, addonLabels: addonItems.map((a) => a.label), total,
    date, dateLabel: fmtDate(date), window, flexible: body.flexible === true || body.flexible === 'yes',
    name, email, phone: `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`, address, city, zip,
    unit: clean(body.unit, 20), dryerType: clean(body.dryerType, 40), dryerAge: clean(body.dryerAge, 40), homeType: clean(body.homeType, 40),
    symptoms: (Array.isArray(body.symptoms) ? body.symptoms : []).map((x) => clean(x, 60)).filter((x) => SYMPTOMS.has(x)).slice(0, 10),
    access: cleanMultiline(body.access, 500), notes: cleanMultiline(body.notes, 1000), heard: clean(body.heard, 40),
    smsOk: body.smsOk === true || body.smsOk === 'yes', source: clean(body.source, 200), createdAt: new Date().toISOString()
  };
  return { booking };
}

export async function onRequestPost({ request, env }) {
  ENV = env || {};
  const req = request;
  const ip = clientIp(req);
  let body; try { body = await req.json(); } catch { return json(400, { error: 'Invalid JSON' }); }
  if (!body || typeof body !== 'object') return json(400, { error: 'Invalid JSON' });
  // Honeypot: real browsers leave this hidden field empty. Bots get a quiet "success".
  if (body.website) return json(200, { success: true, confirmationNumber: 'DV-' + Math.random().toString(36).slice(2, 7).toUpperCase() });
  if (!(await rateLimit(env, `ip:${ip}`, 20, 3600))) return json(429, { error: 'Too many requests from your network. Please call or text us instead.' });
  try {
    if (body.type === 'contact') {
      const m = { type: 'contact', name: clean(body.name, 80), email: clean(body.email, 254).toLowerCase(), phone: clean(body.phone, 30), message: cleanMultiline(body.message, 2000), receivedAt: new Date().toISOString() };
      if (m.email && !isEmail(m.email)) return json(400, { error: 'Please enter a valid email.' });
      if (!m.name || !m.message || (!m.email && !m.phone)) return json(400, { error: 'Missing fields' });
      return json(200, { success: true, results: await handleContact(m) });
    }
    const { booking, errors } = validateBooking(body);
    if (errors) return json(400, { error: 'Please check the highlighted fields.', fields: errors });
    const phoneKey = usE164(booking.phone);
    if (!(await rateLimit(env, `phone:${phoneKey}`, 3, 86400))) return json(429, { error: 'This phone number has already booked several times today. Please call or text us.' });
    booking.confirmationNumber = await newConfirmation();
    const results = await handleBooking(booking);
    return json(200, { success: true, confirmationNumber: booking.confirmationNumber, booking, results });
  } catch (err) {
    console.error('process-booking error', err);
    return json(500, { error: 'Something went wrong on our side. Please call or text us.' });
  }
}
