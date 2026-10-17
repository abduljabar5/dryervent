// Incoming calls to the business number: ring the owner's cell, showing the
// business number as caller ID. If unanswered, play a short message.
import { xml, escXml, verifyTwilio, readParams } from './_twilio.js';

export async function onRequest({ request, env }) {
  const p = await readParams(request);
  if (!(await verifyTwilio(request, p, env))) return new Response('Forbidden', { status: 403 });
  const owner = env.OWNER_PHONE, biz = env.TWILIO_FROM_NUMBER, brand = env.BRAND_NAME || 'Clear Vent';
  const status = p.get('DialCallStatus');
  if (status) {
    if (status === 'completed') return xml('<Hangup/>');
    return xml(`<Say voice="Polly.Joanna">Thanks for calling ${escXml(brand)}. We can't pick up right now. Please text this number or book online at clear vent m n dot com, and we'll get right back to you.</Say><Hangup/>`);
  }
  if (!owner) return xml(`<Say>Sorry, this number is not configured yet.</Say><Hangup/>`);
  return xml(`<Dial callerId="${escXml(biz)}" timeout="25" action="/api/voice" method="POST">${escXml(owner)}</Dial>`);
}
