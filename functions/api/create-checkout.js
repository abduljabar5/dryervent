// POST /api/create-checkout { confirmationNumber } -> { url } (Stripe Checkout, hosted page)
// Customers pay the booked total online, any time before or after the visit. No deposit is required.
import { stripe, json, normConf, amountDue } from './_stripe.js';

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json(503, { error: 'Online payment is not set up yet. Please pay on completion.' });
  let body; try { body = await request.json(); } catch { return json(400, { error: 'Invalid JSON' }); }
  const conf = normConf(body.confirmationNumber);
  if (!/^DV-[A-Z0-9]{4,8}$/.test(conf)) return json(400, { error: 'Enter a confirmation number like DV-7K2QX.' });

  const raw = await env.BOOKINGS.get('booking:' + conf);
  if (!raw) return json(404, { error: "We couldn't find that confirmation number. Check your confirmation email, or call us." });
  const b = JSON.parse(raw);
  if (b.status === 'paid') return json(409, { error: 'This booking is already paid. Thank you!', paid: true });
  if (b.status === 'cancelled') return json(409, { error: 'This booking was cancelled.' });

  const cents = amountDue(b);
  if (cents < 50) return json(400, { error: 'Nothing is due on this booking yet.' });

  const site = env.SITE_URL || new URL(request.url).origin;
  const brand = env.BRAND_NAME || 'Clear Vent';
  // One line per thing they booked, so the Checkout page and receipt itemize it.
  const items = [];
  const base = Number(b.basePrice || 0), addons = Array.isArray(b.addonItems) ? b.addonItems : [];
  const addonSum = addons.reduce((s, a) => s + Number(a.price || 0), 0);
  if (base && base * 100 + addonSum * 100 === cents) {
    items.push({ quantity: 1, price_data: { currency: 'usd', unit_amount: Math.round(base * 100), product_data: { name: `Dryer vent cleaning — ${b.ventLabel || 'standard'}` } } });
    for (const a of addons) items.push({ quantity: 1, price_data: { currency: 'usd', unit_amount: Math.round(Number(a.price) * 100), product_data: { name: a.label } } });
  } else {
    items.push({ quantity: 1, price_data: { currency: 'usd', unit_amount: cents, product_data: { name: `Dryer vent cleaning — ${b.ventLabel || 'service'}`, description: (b.addonLabels || []).join(', ') || undefined } } });
  }

  try {
    const session = await stripe(env, '/checkout/sessions', {
      mode: 'payment',
      client_reference_id: conf,
      customer_email: b.email || undefined,
      line_items: items,
      success_url: `${site}/pay-success?c=${conf}`,
      cancel_url: `${site}/pay?c=${conf}`,
      metadata: { confirmationNumber: conf, name: b.name || '', city: b.city || '' },
      payment_intent_data: { description: `${brand} dryer vent cleaning ${conf}`, metadata: { confirmationNumber: conf } },
      billing_address_collection: 'auto',
      submit_type: 'pay'
    }, { idempotencyKey: `checkout-${conf}-${cents}-${Math.floor(Date.now() / 600000)}` });
    return json(200, { url: session.url, amount: cents / 100 });
  } catch (e) {
    return json(502, { error: 'Could not start the payment. Please try again or pay on completion.', detail: e.message });
  }
}
