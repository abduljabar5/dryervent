// POST /api/update-booking — owner-only edits from /admin: final amount, status, payment method.
// Requires Authorization: Bearer <ADMIN_TOKEN>.
import { json, normConf } from './_stripe.js';

const STATUSES = new Set(['new', 'done', 'paid', 'cancelled']);
const METHODS = new Set(['cash', 'zelle', 'venmo', 'card-in-person', 'stripe', '']);

export async function onRequestPost({ request, env }) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) return json(401, { error: 'Unauthorized' });
  let body; try { body = await request.json(); } catch { return json(400, { error: 'Invalid JSON' }); }
  const conf = normConf(body.confirmationNumber);
  const key = 'booking:' + conf;
  const raw = await env.BOOKINGS.get(key);
  if (!raw) return json(404, { error: 'Booking not found' });
  const b = JSON.parse(raw);
  const changes = {};

  if ('finalTotal' in body) {
    if (body.finalTotal === null || body.finalTotal === '') changes.finalTotal = null; // back to booked total
    else {
      const n = Number(body.finalTotal);
      if (!Number.isFinite(n) || n < 0 || n > 5000) return json(400, { error: 'Final amount must be between $0 and $5,000.' });
      changes.finalTotal = Math.round(n * 100) / 100;
    }
  }
  if ('status' in body) {
    if (!STATUSES.has(body.status)) return json(400, { error: 'Bad status' });
    if (b.status === 'paid' && b.paymentMethod === 'stripe' && body.status !== 'paid') return json(409, { error: 'This booking was paid through Stripe; refund it in Stripe instead of changing the status.' });
    changes.status = body.status;
    if (body.status === 'paid') {
      const method = METHODS.has(body.paymentMethod) ? body.paymentMethod : 'cash';
      changes.paymentMethod = method;
      changes.paidAt = new Date().toISOString();
      changes.paidAmount = changes.finalTotal ?? b.finalTotal ?? b.total;
    }
    if (body.status !== 'paid') { changes.paidAt = null; changes.paidAmount = null; changes.paymentMethod = null; }
  }
  if (!Object.keys(changes).length) return json(400, { error: 'Nothing to change' });

  const updated = { ...b, ...changes, updatedAt: new Date().toISOString() };
  await env.BOOKINGS.put(key, JSON.stringify(updated));
  return json(200, { ok: true, booking: updated });
}
