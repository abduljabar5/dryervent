// POST /api/stripe-webhook — Stripe calls this when a Checkout payment completes.
// Marks the booking paid in KV and alerts the owner. Signature is verified with STRIPE_WEBHOOK_SECRET.
import { verifyWebhook, json } from './_stripe.js';

export async function onRequestPost({ request, env }) {
  const raw = await request.text();
  const ok = await verifyWebhook(raw, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET);
  if (!ok) return json(400, { error: 'Bad signature' });

  let event; try { event = JSON.parse(raw); } catch { return json(400, { error: 'Bad JSON' }); }
  if (event.type !== 'checkout.session.completed' && event.type !== 'checkout.session.async_payment_succeeded') return json(200, { ignored: event.type });

  const s = event.data.object;
  if (s.payment_status !== 'paid') return json(200, { pending: true });
  const conf = s.client_reference_id || s.metadata?.confirmationNumber;
  if (!conf) return json(200, { noConf: true });

  const key = 'booking:' + conf;
  const rawB = await env.BOOKINGS.get(key);
  if (!rawB) return json(200, { unknownBooking: conf });
  const b = JSON.parse(rawB);
  if (b.status === 'paid' && b.stripeSessionId === s.id) return json(200, { duplicate: true }); // Stripe retries; stay idempotent

  const amount = (s.amount_total || 0) / 100;
  const updated = { ...b, status: 'paid', paidAt: new Date().toISOString(), paidAmount: amount, paymentMethod: 'stripe', stripeSessionId: s.id, stripePaymentIntent: s.payment_intent || null };
  await env.BOOKINGS.put(key, JSON.stringify(updated));

  // Owner alert (email + text). Best effort; the 200 to Stripe matters more.
  const brand = env.BRAND_NAME || 'Clear Vent';
  const line = `PAID ${money(amount)} · ${conf} · ${b.name || ''} · ${b.dateLabel || b.date || ''} ${b.window || ''} · ${b.city || ''}`;
  const jobs = [];
  if (env.OWNER_EMAIL && env.RESEND_API_KEY && env.RESEND_FROM_EMAIL) {
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `${brand} <${env.RESEND_FROM_EMAIL}>`, to: [env.OWNER_EMAIL], subject: `Paid ${money(amount)} — ${conf} ${b.name || ''}`, text: `${line}\n\nStripe payment ${s.payment_intent || s.id}. The customer gets a receipt from Stripe automatically.` })
    }).catch(() => {}));
  }
  if (env.OWNER_PHONE && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER) {
    jobs.push(fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST', headers: { Authorization: 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: env.TWILIO_FROM_NUMBER, To: env.OWNER_PHONE, Body: line })
    }).catch(() => {}));
  }
  await Promise.all(jobs);
  return json(200, { received: true, conf });
}

const money = (n) => '$' + Number(n || 0).toLocaleString('en-US');
