// Cloudflare Pages Function: GET /api/list-bookings — lists stored bookings for /admin.html. Requires Authorization: Bearer <ADMIN_TOKEN>.
export async function onRequestGet({ request, env }) {
  const token = (request.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!env.ADMIN_TOKEN || token !== env.ADMIN_TOKEN) return new Response('Unauthorized', { status: 401 });
  if (!env.BOOKINGS) return new Response(JSON.stringify({ bookings: [], error: 'KV binding BOOKINGS not configured' }), { headers: { 'Content-Type': 'application/json' } });
  const { keys } = await env.BOOKINGS.list({ prefix: 'booking:' });
  const bookings = (await Promise.all(keys.map(k => env.BOOKINGS.get(k.name, { type: 'json' })))).filter(Boolean)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return new Response(JSON.stringify({ bookings }), { headers: { 'Content-Type': 'application/json' } });
}
