// GET /api/booking-lookup?c=DV-XXXXX -> a minimal, non-sensitive summary for the pay page.
import { json, normConf, amountDue } from './_stripe.js';
import { clientIp, rateLimit } from './_guard.js';

export async function onRequestGet({ request, env }) {
  if (!(await rateLimit(env, `lookup:${clientIp(request)}`, 30, 3600))) return json(429, { error: 'Too many lookups. Please try again later or call us.' });
  const conf = normConf(new URL(request.url).searchParams.get('c'));
  if (!/^DV-[A-Z0-9]{4,8}$/.test(conf)) return json(400, { error: 'Enter a confirmation number like DV-7K2QX.' });
  const raw = await env.BOOKINGS.get('booking:' + conf);
  if (!raw) return json(404, { error: "We couldn't find that confirmation number. Check your confirmation email, or call us." });
  const b = JSON.parse(raw);
  return json(200, {
    confirmationNumber: conf,
    firstName: String(b.name || '').trim().split(' ')[0],
    ventLabel: b.ventLabel || 'Dryer vent cleaning',
    addonLabels: b.addonLabels || [],
    dateLabel: b.dateLabel || b.date || '',
    window: b.window || '',
    amount: amountDue(b) / 100,
    fromPrice: b.ventLocation === 'unsure' && !b.finalTotal,
    status: b.status || 'new',
    paidAmount: b.paidAmount || null
  });
}
