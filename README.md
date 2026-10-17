# Twin Cities Dryer Vent Pros

Static marketing + booking site for a dryer vent cleaning business serving Minneapolis–Saint Paul. Hosted on Cloudflare Pages; booking processing runs in Pages Functions with a KV namespace.

## Stack

- `build.js` — tiny static-site generator. Templates in `src/layout.js`, content in `src/data/*.js`. Run `node build.js` to regenerate every `*.html`, `blog/*.html`, `sitemap.xml`, `robots.txt`, `llms.txt`.
- `site.css` — design system (Fraunces + Manrope, warm paper / slate navy / ember orange).
- `app.js` — nav, reveal animations, homepage scroll story, FAQ search, 5-step booking engine (draft autosave, validation, live price summary, mobile price bar), confirmation page, contact form, admin.
- `functions/api/process-booking.js` — `POST /api/process-booking`. Stores booking in KV (`BOOKINGS`), emails customer + owner (Resend), texts owner + customer (Twilio). Every integration is optional; missing keys are skipped, the booking still succeeds.
- `functions/api/list-bookings.js` — `GET /api/list-bookings`, powers `/admin.html` (Bearer `ADMIN_TOKEN`).
- `wrangler.toml` — Pages config + KV binding. `_headers` — security/cache headers.

## Edit content

| What | Where |
|---|---|
| Business name, phone, email, domain, hours, prices, add-ons, time windows | `src/data/site.js` |
| City pages (37) | `src/data/cities.js` |
| Service pages (7) | `src/data/services.js` |
| FAQ bank (119 Q&As, tagged by topic) | `src/data/faqs.js` |
| Blog articles (12) | `src/data/articles.js` |
| Page templates, nav, footer, schema, SVG house illustration | `src/layout.js`, `build.js` |

After any change: `node build.js` (Cloudflare Pages runs it automatically on every push when the repo is connected; build command `node build.js`, output directory `.`).

## Before launch (TODO)

1. Replace the placeholder phone `(612) 555-0147` and email in `src/data/site.js`.
2. Set the real domain in `src/data/site.js` → `domain`.
3. Add real job photos to `images/` and reference them on the home/about pages.
4. Fill `.dev.vars` (copy `.dev.vars.example`) locally and set the same names as **Secrets** in Cloudflare → Workers & Pages → twin-cities-dryer-vent → Settings → Variables.
5. Create a Google Business Profile and paste the link into `SITE.social.google`.

## Local dev

```bash
npm install
cp .dev.vars.example .dev.vars
npx wrangler login   # once
npm run dev          # builds, then wrangler pages dev on http://localhost:8788 (local KV)
npm run deploy       # manual production deploy (or just git push if the repo is connected)
```

Or without wrangler: `node build.js && python3 -m http.server 8899` (booking submit will fail without functions, the form shows the call/text fallback).

## Pages (86)

Home · Book · Confirmation · Services hub + 7 service pages · Pricing · How it works · Service area + 37 city pages · FAQ hub + 14 topic FAQ pages · Blog + 12 articles · About · Contact · Privacy · Terms · 404 · Admin
