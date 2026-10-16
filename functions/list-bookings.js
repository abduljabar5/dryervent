// Netlify Function: list stored bookings for /admin.html. Requires Authorization: Bearer <ADMIN_TOKEN>.
import { getStore } from '@netlify/blobs';
export default async (req) => {
  const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) return new Response('Unauthorized', { status: 401 });
  const store = getStore('bookings');
  const { blobs } = await store.list();
  const bookings = (await Promise.all(blobs.map(b => store.get(b.key, { type: 'json' })))).filter(Boolean)
    .sort((a, b) => String(b.createdAt || '').localeCompare(String(a.createdAt || '')));
  return new Response(JSON.stringify({ bookings }), { headers: { 'Content-Type': 'application/json' } });
};
