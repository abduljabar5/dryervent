// GET /api/calendar?c=DV-XXXXX -> .ics file for the booking (opens in Apple Calendar, Google Calendar, Outlook).
import { json, normConf } from './_stripe.js';
import { clientIp, rateLimit } from './_guard.js';
import { buildIcs } from './_calendar.js';

export async function onRequestGet({ request, env }) {
  if (!(await rateLimit(env, `cal:${clientIp(request)}`, 30, 3600))) return json(429, { error: 'Too many requests. Please try again later.' });
  const conf = normConf(new URL(request.url).searchParams.get('c'));
  if (!/^DV-[A-Z0-9]{4,8}$/.test(conf)) return json(400, { error: 'Bad confirmation number' });
  const raw = await env.BOOKINGS.get('booking:' + conf);
  if (!raw) return json(404, { error: 'Booking not found' });
  const b = JSON.parse(raw);
  const ics = buildIcs(b, { brand: env.BRAND_NAME || 'Clear Vent', phone: env.BRAND_PHONE || '(612) 682-1616', siteUrl: env.SITE_URL || 'https://clearventmn.com' });
  if (!ics) return json(404, { error: 'No date on this booking' });
  return new Response(ics, { headers: { 'Content-Type': 'text/calendar; charset=utf-8; method=PUBLISH', 'Content-Disposition': `attachment; filename="clear-vent-${conf}.ics"`, 'Cache-Control': 'private, no-store' } });
}
