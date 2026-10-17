// Customer texts to the business number: forward to the owner by SMS and email.
import { xml, verifyTwilio, readParams } from './_twilio.js';

export async function onRequest({ request, env }) {
  const p = await readParams(request);
  if (!(await verifyTwilio(request, p, env))) return new Response('Forbidden', { status: 403 });
  const from = p.get('From') || '', body = (p.get('Body') || '').trim();
  if (/^(stop|stopall|unsubscribe|cancel|end|quit|start|yes|unstop|help|info)$/i.test(body)) return xml(''); // Twilio handles these
  const note = `Text from ${from}: ${body.slice(0, 1200)}`;
  const jobs = [];
  if (env.OWNER_PHONE && env.TWILIO_ACCOUNT_SID && env.TWILIO_AUTH_TOKEN && env.TWILIO_FROM_NUMBER) {
    jobs.push(fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: 'POST', headers: { Authorization: 'Basic ' + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`), 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ From: env.TWILIO_FROM_NUMBER, To: env.OWNER_PHONE, Body: note.slice(0, 1500) })
    }).catch(() => {}));
  }
  if (env.OWNER_EMAIL && env.RESEND_API_KEY && env.RESEND_FROM_EMAIL) {
    jobs.push(fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: `${env.BRAND_NAME || 'Clear Vent'} <${env.RESEND_FROM_EMAIL}>`, to: [env.OWNER_EMAIL], subject: `Text from ${from}`, text: `${body}\n\nFrom: ${from}\nReply by texting them from ${env.TWILIO_FROM_NUMBER} or calling back.` })
    }).catch(() => {}));
  }
  await Promise.all(jobs);
  return xml(''); // no auto-reply to the customer
}
