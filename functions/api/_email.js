// Branded transactional emails (customer confirmation, owner alert, contact message).
// Table-based layout with inline styles so it renders in Gmail, Apple Mail and Outlook.

const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const money = (n) => '$' + Number(n || 0).toLocaleString('en-US');

const C = { paper: '#f6f1ea', card: '#ffffff', navy: '#0f2a3d', ink: '#1d3447', muted: '#6b7f8c', line: '#e8e0d4', orange: '#e2602b', teal: '#1f8a8a', soft: '#fbf7f1' };
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif";

// ---------- building blocks ----------
const card = (inner, extra = '') => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.card};border:1px solid ${C.line};border-radius:14px;margin:0 0 16px;${extra}"><tr><td style="padding:20px 22px">${inner}</td></tr></table>`;
const eyebrow = (t) => `<p style="margin:0 0 6px;font:700 11px/1.4 ${FONT};letter-spacing:.12em;text-transform:uppercase;color:${C.orange}">${esc(t)}</p>`;
const h = (t, size = 20) => `<p style="margin:0 0 10px;font:700 ${size}px/1.25 ${FONT};color:${C.navy}">${esc(t)}</p>`;
const p = (t, color = C.ink) => `<p style="margin:0 0 12px;font:400 15px/1.55 ${FONT};color:${color}">${t}</p>`;

// Key/value rows; rows with an empty value are dropped so nothing renders as "undefined".
function kv(rows) {
  const keep = rows.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');
  if (!keep.length) return '';
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font:400 15px/1.45 ${FONT};color:${C.ink}">${keep.map(([k, v, bold]) =>
    `<tr><td style="padding:7px 14px 7px 0;color:${C.muted};vertical-align:top;white-space:nowrap;width:1%">${esc(k)}</td><td style="padding:7px 0;font-weight:${bold ? 700 : 500};vertical-align:top">${v}</td></tr>`).join('')}</table>`;
}

const button = (href, label, color = C.orange) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 2px"><tr><td style="background:${color};border-radius:999px"><a href="${esc(href)}" style="display:inline-block;padding:12px 22px;font:700 15px/1 ${FONT};color:#fff;text-decoration:none">${esc(label)}</a></td></tr></table>`;

function steps(items) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">${items.map(([title, body], i) =>
    `<tr><td style="padding:0 12px 14px 0;vertical-align:top;width:34px"><div style="width:28px;height:28px;border-radius:999px;background:${C.soft};border:1px solid ${C.line};text-align:center;font:700 13px/28px ${FONT};color:${C.navy}">${i + 1}</div></td><td style="padding:0 0 14px;vertical-align:top"><p style="margin:0 0 2px;font:700 15px/1.4 ${FONT};color:${C.navy}">${esc(title)}</p><p style="margin:0;font:400 14px/1.5 ${FONT};color:${C.muted}">${esc(body)}</p></td></tr>`).join('')}</table>`;
}

// Outer frame: paper background, brand bar, content, footer.
function layout({ brand, phone, siteUrl, email, preheader, body }) {
  const host = siteUrl.replace(/^https?:\/\//, '');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(brand)}</title></head>
<body style="margin:0;padding:0;background:${C.paper}">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.paper}"><tr><td align="center" style="padding:28px 14px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%">
  <tr><td style="padding:0 6px 16px">
    <table role="presentation" cellpadding="0" cellspacing="0"><tr>
      <td style="width:38px;height:38px;border-radius:10px;background:${C.navy};text-align:center;vertical-align:middle">
        <span style="display:inline-block;width:18px;height:18px;border:3px solid #fff;border-radius:4px 4px 2px 2px;border-top-width:6px"></span>
      </td>
      <td style="padding-left:10px;font:800 20px/1.1 ${FONT};color:${C.navy}">${esc(brand)}<br><span style="font:600 11px/1.4 ${FONT};letter-spacing:.14em;text-transform:uppercase;color:${C.muted}">Dryer vent cleaning · Twin Cities</span></td>
    </tr></table>
  </td></tr>
  <tr><td>${body}</td></tr>
  <tr><td style="padding:10px 6px 0;font:400 13px/1.6 ${FONT};color:${C.muted}">
    ${esc(brand)} · <a href="tel:${esc(phone.replace(/\D/g, ''))}" style="color:${C.muted};text-decoration:none">${esc(phone)}</a> · <a href="mailto:${esc(email)}" style="color:${C.muted};text-decoration:none">${esc(email)}</a><br>
    <a href="${esc(siteUrl)}" style="color:${C.muted}">${esc(host)}</a> · Minneapolis–St. Paul
  </td></tr>
</table></td></tr></table></body></html>`;
}

// ---------- helpers ----------
function calendarLink(b, brand) {
  if (!b.date || !b.window) return '';
  const [y, m, d] = String(b.date).split('-'); if (!y || !m || !d) return '';
  const hh = (String(b.window).match(/^(\d+)/) || [])[1] || '8';
  const firstPart = String(b.window).split(/[–-]/)[0];
  const h24 = (/PM/.test(firstPart) && +hh !== 12) ? +hh + 12 : +hh;
  const t = (x) => `${y}${m}${d}T${String(x).padStart(2, '0')}0000`;
  const q = new URLSearchParams({ action: 'TEMPLATE', text: `Dryer vent cleaning – ${brand}`, dates: `${t(h24)}/${t(h24 + 2)}`, details: `Confirmation ${b.confirmationNumber}. Arrival window ${b.window}.`, location: `${b.address}, ${b.city} MN ${b.zip}`, ctz: 'America/Chicago' });
  return 'https://calendar.google.com/calendar/render?' + q.toString();
}

function addonLines(b) {
  if (Array.isArray(b.addonItems) && b.addonItems.length) return b.addonItems.map((a) => a.price ? `${esc(a.label)} <span style="color:${C.muted}">· ${money(a.price)}</span>` : esc(a.label));
  return (b.addonLabels || []).filter(Boolean).map(esc);
}

function dryerSummary(b) {
  const bits = [b.dryerType, b.homeType, b.laundryFloor && `laundry on ${b.laundryFloor}`, b.lastCleaned && `last cleaned ${b.lastCleaned}`].filter(Boolean);
  return bits.length ? bits.map(esc).join(' · ') : '';
}

const whenText = (b) => [b.dateLabel, b.window].filter(Boolean).join(', ') + (b.flexible ? ' (flexible for earlier)' : '');
const whereText = (b) => [b.address, [b.city, b.zip].filter(Boolean).join(' ')].filter(Boolean).join(', ');
const totalText = (b) => `${b.ventLocation === 'unsure' ? 'from ' : ''}${money(b.total)}`;

function plainRows(rows) { return rows.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '').map(([k, v]) => `${k}: ${String(v).replace(/<[^>]+>/g, '')}`).join('\n'); }

// ---------- emails ----------
export function customerBookingEmail(b, ctx) {
  const first = (b.name || '').trim().split(' ')[0] || 'there';
  const addons = addonLines(b);
  const cal = calendarLink(b, ctx.brand);
  const serviceRows = [
    ['Service', `${esc(b.ventLabel || 'Dryer vent cleaning')}${b.basePrice ? ` <span style="color:${C.muted}">· ${money(b.basePrice)}</span>` : ''}`],
    ...(addons.length ? [['Add-ons', addons.join('<br>')]] : []),
    ['Total', `${esc(totalText(b))} <span style="color:${C.muted};font-weight:400">· pay when the job is done</span>`, true]
  ];
  const body = `
    ${card(`${eyebrow('Booking confirmed')}${h(`You're booked, ${first}.`, 26)}${p(`Your dryer vent cleaning is on the calendar. We'll text you the evening before and again when the technician is on the way.`)}
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft};border-radius:12px;margin:6px 0 14px"><tr>
        <td style="padding:16px 18px;vertical-align:top"><p style="margin:0 0 2px;font:600 11px/1.4 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:${C.muted}">When</p><p style="margin:0;font:700 17px/1.35 ${FONT};color:${C.navy}">${esc(whenText(b))}</p></td>
        <td style="padding:16px 18px;vertical-align:top"><p style="margin:0 0 2px;font:600 11px/1.4 ${FONT};letter-spacing:.1em;text-transform:uppercase;color:${C.muted}">Where</p><p style="margin:0;font:700 17px/1.35 ${FONT};color:${C.navy}">${esc(whereText(b))}</p></td>
      </tr></table>
      ${cal ? button(cal, 'Add to Google Calendar', C.navy) : ''}
      <p style="margin:14px 0 0;font:400 13px/1.5 ${FONT};color:${C.muted}">Confirmation <strong style="color:${C.navy}">${esc(b.confirmationNumber)}</strong></p>`)}
    ${card(`${h('What you booked')}${kv(serviceRows)}`)}
    ${card(`${h('What happens next')}${steps([
      ['Reminder the night before', 'A quick text so the time is fresh.'],
      ['Tech on the way', 'A heads-up text about 20 minutes out.'],
      ['Clean, test, done', `Vent cleared end to end, airflow checked, lint hauled away. Usually ${/roof/i.test(b.ventLabel || '') ? '60–90' : '45–60'} minutes.`]
    ])}`)}
    ${card(`${h('Before we arrive')}${p(`Clear the top of the dryer and a little space in front of it.${/roof/i.test(b.ventLabel || '') ? ' Keep the ladder side of the house clear of cars.' : ' Make sure we can reach the outside vent cap.'}`)}${p(`Need to change anything? Reply to this email or call/text <a href="tel:${esc(ctx.phone.replace(/\D/g, ''))}" style="color:${C.orange};font-weight:600;text-decoration:none">${esc(ctx.phone)}</a>. Free rescheduling with 12 hours notice.`, C.muted)}`)}`;
  const html = layout({ ...ctx, preheader: `Confirmed for ${whenText(b)} at ${whereText(b)}. Total ${totalText(b)}, pay on completion.`, body });
  const text = `Hi ${first},\n\nYour dryer vent cleaning with ${ctx.brand} is booked.\n\n${plainRows([['When', whenText(b)], ['Where', whereText(b)], ['Service', b.ventLabel], ...(addons.length ? [['Add-ons', (b.addonLabels || []).join(', ')]] : []), ['Total', totalText(b) + ' (pay on completion)'], ['Confirmation', b.confirmationNumber]])}\n\nBefore we arrive: clear the top of the dryer and some space in front of it.\nChanges? Reply to this email or call/text ${ctx.phone}.\n\n— ${ctx.brand}\n${ctx.siteUrl}`;
  return { subject: `Booked: dryer vent cleaning ${b.dateLabel} (${b.confirmationNumber})`, html, text };
}

export function ownerBookingEmail(b, ctx) {
  const addons = addonLines(b);
  const tel = String(b.phone || '').replace(/\D/g, '');
  const rows = [
    ['Customer', `<strong>${esc(b.name)}</strong><br><a href="tel:${tel}" style="color:${C.orange};text-decoration:none">${esc(b.phone)}</a> · <a href="mailto:${esc(b.email)}" style="color:${C.orange};text-decoration:none">${esc(b.email)}</a>`],
    ['When', `<strong>${esc(whenText(b))}</strong>`],
    ['Where', `<a href="https://maps.google.com/?q=${encodeURIComponent(whereText(b) + ' MN')}" style="color:${C.navy};text-decoration:underline">${esc(whereText(b))}</a>`],
    ['Service', `${esc(b.ventLabel)}${b.basePrice ? ` · ${money(b.basePrice)}` : ''}`],
    ...(addons.length ? [['Add-ons', addons.join('<br>')]] : []),
    ['Total', totalText(b), true],
    ['Dryer', dryerSummary(b)],
    ['Noticed', Array.isArray(b.symptoms) && b.symptoms.length ? esc(b.symptoms.join(', ')) : ''],
    ['Access', b.access ? esc(b.access) : ''],
    ['Notes', b.notes ? esc(b.notes) : ''],
    ['Texts', b.smsOk ? 'opted in' : 'no texts'],
    ['Heard via', b.heard ? esc(b.heard) : '']
  ];
  const body = `${card(`${eyebrow('New booking')}${h(`${totalText(b)} · ${b.city || ''} · ${b.dateLabel || ''}`, 22)}${kv(rows)}<div style="height:10px"></div>${button(`tel:${tel}`, 'Call customer')}`)}
    ${p(`Reply to this email to reach the customer directly. Confirmation ${esc(b.confirmationNumber)}.`, C.muted)}`;
  const html = layout({ ...ctx, preheader: `${b.name} · ${whenText(b)} · ${whereText(b)}`, body });
  const text = plainRows([['Customer', `${b.name} · ${b.phone} · ${b.email}`], ['When', whenText(b)], ['Where', whereText(b)], ['Service', b.ventLabel], ['Add-ons', (b.addonLabels || []).join(', ')], ['Total', totalText(b)], ['Dryer', dryerSummary(b)], ['Noticed', (b.symptoms || []).join(', ')], ['Access', b.access], ['Notes', b.notes], ['Texts', b.smsOk ? 'opted in' : 'no'], ['Heard via', b.heard], ['Confirmation', b.confirmationNumber]]);
  return { subject: `NEW BOOKING ${totalText(b)} — ${b.city} ${b.dateLabel} ${b.window} (${b.ventLabel})`, html, text };
}

export function contactEmail(m, ctx) {
  const tel = String(m.phone || '').replace(/\D/g, '');
  const body = card(`${eyebrow('Website message')}${h(`From ${m.name}`, 22)}
    <div style="padding:14px 16px;background:${C.soft};border-radius:12px;font:400 15px/1.6 ${FONT};color:${C.ink};white-space:pre-wrap">${esc(m.message)}</div><div style="height:12px"></div>
    ${kv([['Phone', m.phone ? `<a href="tel:${tel}" style="color:${C.orange};text-decoration:none">${esc(m.phone)}</a>` : ''], ['Email', m.email ? `<a href="mailto:${esc(m.email)}" style="color:${C.orange};text-decoration:none">${esc(m.email)}</a>` : '']])}
    ${tel ? button(`tel:${tel}`, 'Call back') : ''}`);
  const html = layout({ ...ctx, preheader: String(m.message || '').slice(0, 120), body });
  const text = `${m.message}\n\n${m.name}\n${m.phone || ''}\n${m.email || ''}`;
  return { subject: `Website message from ${m.name}`, html, text };
}
