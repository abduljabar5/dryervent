# Twin Cities Dryer Vent Pros

Static marketing + booking site for a dryer vent cleaning business serving Minneapolis–Saint Paul. Same deploy model as `limosite`: static HTML on Netlify, Netlify Functions for booking processing.

## Stack

- `build.js` — tiny static-site generator. Templates in `src/layout.js`, content in `src/data/*.js`. Run `node build.js` to regenerate every `*.html`, `blog/*.html`, `sitemap.xml`, `robots.txt`, `llms.txt`.
- `site.css` — design system (Fraunces + Manrope, warm paper / slate navy / ember orange).
- `app.js` — nav, reveal animations, homepage scroll story, FAQ search, 5-step booking engine (draft autosave, validation, live price summary, mobile price bar), confirmation page, contact form, admin.
- `functions/process-booking.js` — stores booking in Netlify Blobs, emails customer + owner (Resend), texts owner + customer (Twilio). Every integration is optional; missing keys are skipped, the booking still succeeds.
- `functions/list-bookings.js` — powers `/admin.html` (Bearer `ADMIN_TOKEN`).

## Edit content

| What | Where |
|---|---|
| Business name, phone, email, domain, hours, prices, add-ons, time windows | `src/data/site.js` |
| City pages (37) | `src/data/cities.js` |
| Service pages (7) | `src/data/services.js` |
| FAQ bank (119 Q&As, tagged by topic) | `src/data/faqs.js` |
| Blog articles (12) | `src/data/articles.js` |
| Page templates, nav, footer, schema, SVG house illustration | `src/layout.js`, `build.js` |

After any change: `node build.js` (Netlify runs it automatically on deploy via `netlify.toml`).

## Before launch (TODO)

1. Replace the placeholder phone `(612) 555-0147` and email in `src/data/site.js`.
2. Set the real domain in `src/data/site.js` → `domain`.
3. Add real job photos to `images/` and reference them on the home/about pages.
4. Fill `.env` (copy `.env.example`) locally and set the same vars in Netlify → Site settings → Environment variables.
5. Create a Google Business Profile and paste the link into `SITE.social.google`.

## Local dev

```bash
npm install
cp .env.example .env
npm run dev          # builds, then netlify dev on http://localhost:8899
```

Or without Netlify CLI: `node build.js && python3 -m http.server 8899` (booking submit will fail without functions, the form shows the call/text fallback).

## Pages (86)

Home · Book · Confirmation · Services hub + 7 service pages · Pricing · How it works · Service area + 37 city pages · FAQ hub + 14 topic FAQ pages · Blog + 12 articles · About · Contact · Privacy · Terms · 404 · Admin
