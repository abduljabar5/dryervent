// Cloudflare Pages Function: POST /api/process-booking — receives bookings + contact messages.
// Stores in KV (binding BOOKINGS), emails customer + owner via Resend, texts via Twilio (all optional — degrade gracefully).

const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US');
let ENV = {};
const cfg = (k, d = '') => ENV[k] || d;
const BRAND = () => cfg('BRAND_NAME', 'Clear Vent');
const PHONE = () => cfg('BRAND_PHONE', '(612) 555-0147');
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

function bookingRows(b) {
  return [
    ['Confirmation', b.confirmationNumber],
    ['Vent exit', `${b.ventLabel} — ${money(b.basePrice)}`],
    ...(b.addonLabels || []).map((l, i) => [i === 0 ? 'Add-ons' : '', l]),
    ['When', `${b.dateLabel}, ${b.window}${b.flexible ? ' (flexible for earlier)' : ''}`],
    ['Address', `${b.address}, ${b.city} MN ${b.zip}`],
    ['Dryer', `${b.dryerType} · ${b.homeType} · laundry: ${b.laundryFloor} · last cleaned: ${b.lastCleaned}`],
    ...(b.symptoms && b.symptoms.length ? [['Noticed', b.symptoms.join(', ')]] : []),
    ...(b.access ? [['Access notes', b.access]] : []),
    ...(b.notes ? [['Notes', b.notes]] : []),
    ['Total', `${b.ventLocation === 'unsure' ? 'from ' : ''}${money(b.total)} — pay on completion`]
  ];
}
const rowsHtml = (rows) => `<table style="border-collapse:collapse;width:100%;font-size:15px">${rows.map(([k, v]) => `<tr><td style="padding:7px 10px 7px 0;color:#6b7f8c;vertical-align:top;white-space:nowrap">${esc(k)}</td><td style="padding:7px 0;font-weight:600">${esc(v)}</td></tr>`).join('')}</table>`;
const rowsText = (rows) => rows.map(([k, v]) => (k ? k + ': ' : '  ') + v).join('\n');
const shell = (title, inner) => `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#0f2a3d"><h2 style="margin:0 0 6px;font-size:22px">${esc(title)}</h2>${inner}<p style="margin-top:28px;font-size:13px;color:#6b7f8c">${esc(BRAND())} · ${esc(PHONE())} · <a href="${SITE_URL()}" style="color:#6b7f8c">${SITE_URL().replace(/^https?:\/\//, '')}</a></p></div>`;

async function handleBooking(b) {
  const results = {};
  // 1. Store
  try {
    if (!ENV.BOOKINGS) throw new Error('KV binding BOOKINGS not configured');
    await ENV.BOOKINGS.put('booking:' + b.confirmationNumber, JSON.stringify({ ...b, status: 'new', receivedAt: new Date().toISOString() }));
    results.store = 'saved';
  } catch (e) { results.store = 'failed: ' + e.message; }

  const rows = bookingRows(b);
  // 2. Customer email
  const custHtml = shell(`You're booked, ${b.name.split(' ')[0]}.`, `
    <p style="margin:0 0 16px;color:#35505f">Your dryer vent cleaning is scheduled. We'll text you the evening before and when the technician is on the way.</p>
    ${rowsHtml(rows)}
    <p style="margin:18px 0 0;color:#35505f"><strong>Before we arrive:</strong> clear the top of and space in front of the dryer. For roof vents, keep the ladder side of the house clear of cars.</p>
    <p style="color:#35505f">Need to change anything? Reply to this email or call/text ${esc(PHONE())}. Free rescheduling with 12 hours notice.</p>`);
  const custText = `Hi ${b.name},\n\nYour dryer vent cleaning with ${BRAND()} is booked.\n\n${rowsText(rows)}\n\nBefore we arrive: clear the top of and space in front of the dryer.\nChanges? Reply to this email or call/text ${PHONE()}.\n\n— ${BRAND()}\n${SITE_URL()}`;
  results.customerEmail = await sendEmail({ to: b.email, subject: `Booked: dryer vent cleaning ${b.dateLabel} (${b.confirmationNumber})`, html: custHtml, text: custText });

  // 3. Owner email
  if (cfg('OWNER_EMAIL')) {
    const ownerRows = [['Customer', `${b.name} · ${b.phone} · ${b.email}`], ...rows, ['Heard about us', b.heard || '—'], ['SMS ok', b.smsOk ? 'yes' : 'no'], ['Source', b.source || '']];
    results.ownerEmail = await sendEmail({ to: cfg('OWNER_EMAIL'), replyTo: b.email, subject: `NEW BOOKING ${money(b.total)} — ${b.city} ${b.dateLabel} ${b.window} (${b.ventLabel})`, html: shell('New booking', rowsHtml(ownerRows)), text: rowsText(ownerRows) });
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
  if (cfg('OWNER_EMAIL')) results.ownerEmail = await sendEmail({ to: cfg('OWNER_EMAIL'), replyTo: m.email, subject: `Website message from ${m.name}`, html: shell('New message', `<p>${esc(m.message)}</p>${rowsHtml([['Name', m.name], ['Phone', m.phone], ['Email', m.email]])}`), text: `${m.message}\n\n${m.name}\n${m.phone}\n${m.email}` });
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
