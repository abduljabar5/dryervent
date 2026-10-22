// Customer texts to the business number: forward to the owner by SMS and email.
import { xml, verifyWebhook, readParams, sendSms } from './_twilio.js';
import { rateLimit } from './_guard.js';

export async function onRequest({ request, env }) {
  if (!verifyWebhook(request, env)) return new Response('Forbidden', { status: 403 });
  const p = await readParams(request);
  const from = p.get('From') || '', body = (p.get('Body') || '').trim();
  if (/^(stop|stopall|unsubscribe|cancel|end|quit|start|yes|unstop|help|info)$/i.test(body)) return xml(''); // Twilio handles these
  // Cap forwarded texts so a leaked webhook secret can't turn the site into an SMS cannon.
  if (!(await rateLimit(env, 'smsin', 60, 3600))) return xml('');
  const note = `Text from ${from}: ${body.slice(0, 1200)}`;
  const jobs = [];
  if (env.OWNER_PHONE) jobs.push(sendSms(env, env.OWNER_PHONE, note).catch(() => {}));
  if (env.OWNER_EMAIL && env.RESEND_API_KEY && env.RESEND_FROM_EMAIL) {
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `${env.BRAND_NAME || 'Clear Vent'} <${env.RESEND_FROM_EMAIL}>`, to: [env.OWNER_EMAIL], subject: `Text from ${from}`, text: `${body}\n\nFrom: ${from}\nReply by texting them from ${env.TWILIO_FROM_NUMBER} or calling back.` })
    }).catch(() => {}));
  }
  await Promise.all(jobs);
  return xml(''); // no auto-reply to the customer
}
