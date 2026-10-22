// Calendar helpers shared by the confirmation email and /api/calendar (.ics download).
// Times are "floating" local times (no timezone): every customer is in Minnesota, and floating
// times import cleanly into Apple Calendar, Google Calendar and Outlook without a VTIMEZONE block.

// "2:00–4:00 PM" -> { start: 14, end: 16 }. A half without AM/PM borrows it from the other half.
export function windowHours(win) {
  const parts = String(win || '').split(/[–-]/).map((s) => s.trim());
  const parse = (s) => { const m = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i); return m ? { h: +m[1], min: +(m[2] || 0), mer: m[3] ? m[3].toUpperCase() : null } : null; };
  const a = parse(parts[0] || ''), b = parse(parts[1] || '');
  if (!a) return null;
  const merA = a.mer || (b && b.mer) || 'AM', merB = (b && b.mer) || merA;
  const to24 = (h, mer) => (mer === 'PM' ? (h % 12) + 12 : h % 12);
  const start = to24(a.h, merA) + a.min / 60;
  const end = b ? to24(b.h, merB) + b.min / 60 : start + 2;
  return { start, end: end > start ? end : start + 2 };
}

const pad = (n) => String(n).padStart(2, '0');
const stamp = (date, hours) => { const [y, m, d] = String(date).split('-'); const h = Math.floor(hours), min = Math.round((hours - h) * 60); return `${y}${m}${d}T${pad(h)}${pad(min)}00`; };

export function googleCalendarLink(b, brand) {
  const w = windowHours(b.window); if (!b.date || !w) return '';
  const q = new URLSearchParams({ action: 'TEMPLATE', text: `Dryer vent cleaning – ${brand}`, dates: `${stamp(b.date, w.start)}/${stamp(b.date, w.end)}`, details: `Confirmation ${b.confirmationNumber}. Arrival window ${b.window}.`, location: `${b.address}, ${b.city} MN ${b.zip}`, ctz: 'America/Chicago' });
  return 'https://calendar.google.com/calendar/render?' + q.toString();
}

const icsText = (s) => String(s || '').replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/[,;]/g, (c) => '\\' + c);

export function buildIcs(b, { brand = 'Clear Vent', phone = '', siteUrl = 'https://clearventmn.com' } = {}) {
  const w = windowHours(b.window); if (!b.date || !w) return '';
  const host = siteUrl.replace(/^https?:\/\//, '');
  const now = new Date().toISOString().replace(/[-:]/g, '').slice(0, 15) + 'Z';
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${brand}//Booking//EN`, 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${b.confirmationNumber}@${host}`, `DTSTAMP:${now}`,
    `DTSTART:${stamp(b.date, w.start)}`, `DTEND:${stamp(b.date, w.end)}`,
    `SUMMARY:${icsText(`Dryer vent cleaning – ${brand}`)}`,
    `LOCATION:${icsText(`${b.address}, ${b.city} MN ${b.zip}`)}`,
    `DESCRIPTION:${icsText(`Confirmation ${b.confirmationNumber}. Arrival window ${b.window}. Clear the top of the dryer and the space in front of it.${phone ? ` Questions? Call or text ${phone}.` : ''}`)}`,
    `URL:${siteUrl}/pay?c=${encodeURIComponent(b.confirmationNumber || '')}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-P1D', `DESCRIPTION:${icsText(`Dryer vent cleaning tomorrow, ${b.window}`)}`, 'END:VALARM',
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'TRIGGER:-PT1H', `DESCRIPTION:${icsText(`${brand} arrives in the next hour or so`)}`, 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR'
  ];
  // RFC 5545: CRLF line endings, fold lines longer than 75 octets.
  return lines.map((l) => { const out = []; while (l.length > 73) { out.push(l.slice(0, 73)); l = ' ' + l.slice(73); } out.push(l); return out.join('\r\n'); }).join('\r\n') + '\r\n';
}
