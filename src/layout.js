import { SITE, PRICING, NAV } from './data/site.js';

// Cache-busting: /site.css?v=<hash of file>. Pages caches assets for hours; the hash changes whenever the file does.
import { readFileSync as __rf } from 'node:fs';
import { createHash as __ch } from 'node:crypto';
const __ROOT = new URL('../', import.meta.url).pathname;
const __hashes = {};
export function asset(path) {
  if (!__hashes[path]) { try { __hashes[path] = __ch('md5').update(__rf(__ROOT + path.replace(/^\//, ''))).digest('hex').slice(0, 8); } catch { __hashes[path] = String(Date.now()); } }
  return `${path}?v=${__hashes[path]}`;
}

export const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const money = (n) => '$' + Number(n).toLocaleString('en-US');
export const clean = (path) => path.replace(/\/index\.html$/, '/').replace(/\.html(?=$|[?#])/, '');
export const url = (path) => SITE.domain + clean(path.startsWith('/') ? path : '/' + path);

// ---------------------------------------------------------------------------
// Inline SVG illustrations (also used by the animated booking step)
// ---------------------------------------------------------------------------
// A cross-section house. `exit` = 'roof' | 'ground'. Lint puffs animate along the duct path with SMIL.
export function houseSvg(exit, { id = exit, animate = true, compact = false } = {}) {
  const roof = exit === 'roof';
  // duct path from dryer (x=150,y=248) → exit
  const ductPath = roof
    ? 'M150 248 L150 222 L205 222 L205 62'
    : 'M150 248 L150 238 L316 238';
  // small irregular lint flecks riding the airflow (varied size, speed, timing)
  const FLECKS = [[0, 3.1, 2.2], [0.7, 3.6, 1.5], [1.3, 2.9, 1.9], [2.0, 3.4, 1.2], [2.6, 3.0, 2.5]];
  const fleck = ([delay, dur, size]) => animate ? `
      <path class="lint-fleck" d="M0 ${-size} L${size * .9} ${-size * .3} L${size * .6} ${size * .8} L${-size * .5} ${size} L${-size} ${size * .1} Z" fill="#d9d1c0" opacity="0">
        <animateMotion dur="${dur}s" begin="${delay}s" repeatCount="indefinite" path="${ductPath}" rotate="auto" calcMode="spline" keyTimes="0;1" keySplines=".3 0 .7 1"/>
        <animate attributeName="opacity" values="0;.85;.85;0" keyTimes="0;.1;.88;1" dur="${dur}s" begin="${delay}s" repeatCount="indefinite"/>
      </path>` : '';
  // soft, blurred warm-air plume leaving the cap
  const plume = (cx, cy, dir) => animate ? `
      <g class="exhaust" transform="translate(${cx} ${cy})" filter="url(#${id}-soft)">
        ${[0, .55, 1.1, 1.65].map((d, i) => `<ellipse rx="3" ry="2.4" fill="#ffffff" opacity="0">
          <animate attributeName="opacity" values="0;.55;.35;0" keyTimes="0;.15;.6;1" dur="2.2s" begin="${d}s" repeatCount="indefinite"/>
          <animate attributeName="rx" values="3;${dir === 'up' ? 11 : 14}" dur="2.2s" begin="${d}s" repeatCount="indefinite"/>
          <animate attributeName="ry" values="2.4;${dir === 'up' ? 8 : 9}" dur="2.2s" begin="${d}s" repeatCount="indefinite"/>
          <animate attributeName="${dir === 'up' ? 'cy' : 'cx'}" values="0;${dir === 'up' ? -46 : 44}" dur="2.2s" begin="${d}s" repeatCount="indefinite" calcMode="spline" keyTimes="0;1" keySplines=".2 .6 .4 1"/>
          <animate attributeName="${dir === 'up' ? 'cx' : 'cy'}" values="0;${dir === 'up' ? (i % 2 ? 9 : 4) : -(i % 2 ? 11 : 6)}" dur="2.2s" begin="${d}s" repeatCount="indefinite"/>
        </ellipse>`).join('')}
        <path d="M0 -1.5 L2 -.5 L1.2 1.6 L-1 1.4 L-1.8 0 Z" fill="#d9d1c0" opacity="0">
          <animate attributeName="opacity" values="0;.8;0" keyTimes="0;.2;1" dur="3.6s" begin="1.2s" repeatCount="indefinite"/>
          <animateTransform attributeName="transform" type="translate" values="0 0;${dir === 'up' ? '14 -52' : '48 -18'}" dur="3.6s" begin="1.2s" repeatCount="indefinite"/>
        </path>
      </g>` : '';
  return `
<svg class="house-svg house-${exit}${compact ? ' house-compact' : ''}" viewBox="0 0 360 340" role="img" aria-labelledby="${id}-title" xmlns="http://www.w3.org/2000/svg">
  <title id="${id}-title">${roof ? 'Dryer vent exiting through the roof' : 'Dryer vent exiting through a side wall near the ground'}</title>
  <defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ill-sky-1)"/><stop offset="1" stop-color="var(--ill-sky-2)"/></linearGradient>
    <linearGradient id="${id}-wall" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="var(--ill-wall-1)"/><stop offset="1" stop-color="var(--ill-wall-2)"/></linearGradient>
    <linearGradient id="${id}-duct" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#dfe7ec"/><stop offset=".5" stop-color="#b9c7d0"/><stop offset="1" stop-color="#93a6b2"/></linearGradient>
    <radialGradient id="${id}-glow"><stop offset="0" stop-color="var(--accent)" stop-opacity=".42"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></radialGradient>
    <filter id="${id}-soft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="1.6"/></filter>
    <filter id="${id}-fuzz" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5"/></filter>
  </defs>
  <rect width="360" height="340" rx="18" fill="url(#${id}-sky)"/>
  <!-- ground -->
  <rect y="312" width="360" height="28" fill="var(--ill-ground)"/>
  <!-- shrubs -->
  <ellipse cx="46" cy="312" rx="20" ry="12" fill="var(--ill-shrub)"/><ellipse cx="68" cy="314" rx="14" ry="9" fill="var(--ill-shrub-2)"/>
  <!-- house -->
  <path d="M40 150 L180 48 L320 150 Z" fill="var(--ill-roof)"/>
  <rect x="60" y="150" width="240" height="162" fill="url(#${id}-wall)"/>
  <rect x="60" y="150" width="240" height="162" fill="none" stroke="var(--ill-line)" stroke-width="2"/>
  <!-- floors -->
  <line x1="60" y1="232" x2="300" y2="232" stroke="var(--ill-line)" stroke-width="2" stroke-dasharray="4 5"/>
  <!-- window -->
  <rect x="236" y="170" width="40" height="40" rx="3" fill="var(--ill-window)" stroke="var(--ill-line)" stroke-width="2"/>
  <!-- dryer -->
  <g class="dryer">
    <rect x="120" y="248" width="60" height="58" rx="5" fill="var(--ill-dryer)" stroke="var(--ill-line)" stroke-width="2"/>
    <circle cx="150" cy="280" r="17" fill="var(--ill-drum)" stroke="var(--ill-line)" stroke-width="2"/>
    <g class="tumble">
      <rect x="140" y="270" width="10" height="5" rx="2.5" fill="#9fb3c2"/>
      <rect x="152" y="283" width="8" height="5" rx="2.5" fill="#c1cfd9"/>
      <circle cx="150" cy="280" r="9" fill="none" stroke="var(--ill-line)" stroke-width="1.5" opacity=".45"/>
      ${animate ? '<animateTransform attributeName="transform" type="rotate" from="0 150 280" to="360 150 280" dur="1.3s" repeatCount="indefinite"/>' : ''}
    </g>
    <circle cx="150" cy="280" r="17" fill="none" stroke="var(--ill-line)" stroke-width="2"/>
    <rect x="128" y="254" width="26" height="5" rx="2" fill="var(--ill-line)" opacity=".5"/>
    <circle cx="170" cy="256" r="2" fill="var(--teal)"/>
    <text x="112" y="300" text-anchor="end" class="ill-label">Dryer</text>
  </g>
  <!-- duct -->
  <path d="${ductPath}" fill="none" stroke="var(--ill-duct-outline)" stroke-width="14" stroke-linejoin="round" stroke-linecap="butt"/>
  <path d="${ductPath}" fill="none" stroke="url(#${id}-duct)" stroke-width="10" stroke-linejoin="round"/>
  <!-- fuzzy lint lining -->
  <path d="${ductPath}" fill="none" stroke="#e2dacb" stroke-width="3.5" stroke-linejoin="round" opacity=".7" stroke-dasharray="9 3 5 7 12 2 6 4" filter="url(#${id}-fuzz)"/>
  <!-- warm air stream -->
  <path d="${ductPath}" fill="none" stroke="#ffffff" stroke-width="4" stroke-linejoin="round" stroke-linecap="round" opacity=".32" stroke-dasharray="9 15" class="air-stream">
    ${animate ? '<animate attributeName="stroke-dashoffset" from="0" to="-24" dur=".8s" repeatCount="indefinite"/>' : ''}
  </path>
  ${FLECKS.map(fleck).join('')}
  ${roof ? `
  <!-- roof cap -->
  <circle cx="205" cy="46" r="34" class="exit-glow" fill="url(#${id}-glow)"/>
  <g class="vent-exit">
    <rect x="196" y="48" width="18" height="18" fill="var(--ill-duct)" stroke="var(--ill-line)" stroke-width="2"/>
    <path d="M190 48 L205 36 L220 48 Z" fill="var(--ill-cap)" stroke="var(--ill-line)" stroke-width="2"/>
    <text x="205" y="24" text-anchor="middle" class="ill-label ill-label-strong">Roof vent</text>
  </g>
  ${plume(205, 40, 'up')}` : `
  <!-- wall cap -->
  <circle cx="318" cy="238" r="34" class="exit-glow" fill="url(#${id}-glow)"/>
  <g class="vent-exit">
    <rect x="300" y="229" width="14" height="18" fill="var(--ill-cap)" stroke="var(--ill-line)" stroke-width="2"/>
    <path d="M314 229 L326 233 L326 243 L314 247 Z" fill="var(--ill-cap)" stroke="var(--ill-line)" stroke-width="2"/>
    <!-- damper flap: hinged at the top, blown open by the exhaust -->
    <path d="M314 230 L314 246" stroke="var(--ill-line)" stroke-width="2.5" stroke-linecap="round" class="flap">
      ${animate ? '<animateTransform attributeName="transform" type="rotate" values="-16 314 230;-30 314 230;-22 314 230;-32 314 230;-16 314 230" dur="1.7s" repeatCount="indefinite" calcMode="spline" keyTimes="0;.3;.55;.8;1" keySplines=".4 0 .6 1;.4 0 .6 1;.4 0 .6 1;.4 0 .6 1"/>' : ''}
    </path>
    <text x="350" y="275" text-anchor="end" class="ill-label ill-label-strong">Wall vent</text>
  </g>
  ${plume(327, 238, 'right')}`}
</svg>`;
}

// ---------------------------------------------------------------------------
// Schema helpers
// ---------------------------------------------------------------------------
export function businessSchema(extra = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'HomeAndConstructionBusiness'],
    '@id': url('/#business'),
    name: SITE.name,
    description: `Professional dryer vent cleaning for Minneapolis, Saint Paul and the Twin Cities suburbs. Flat-rate pricing: ${money(PRICING.base.ground.price)} wall vents, ${money(PRICING.base.roof.price)} roof vents. Online booking, no trip charge.`,
    slogan: SITE.tagline,
    url: SITE.domain,
    telephone: SITE.phoneE164,
    email: SITE.email,
    foundingDate: SITE.foundingYear,
    priceRange: '$139–$199',
    currenciesAccepted: 'USD',
    paymentAccepted: ['Cash', 'Credit Card', 'Debit Card', 'Zelle', 'Venmo'],
    image: url('/images/og.png'),
    logo: url('/images/logo.svg'),
    address: { '@type': 'PostalAddress', addressLocality: SITE.city, addressRegion: SITE.region, addressCountry: 'US' },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHoursSpecification: [
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'], opens: '07:00', closes: '20:00' },
      { '@type': 'OpeningHoursSpecification', dayOfWeek: ['Sunday'], opens: '09:00', closes: '18:00' }
    ],
    areaServed: [
      { '@type': 'City', name: 'Minneapolis' }, { '@type': 'City', name: 'Saint Paul' },
      { '@type': 'AdministrativeArea', name: 'Hennepin County' }, { '@type': 'AdministrativeArea', name: 'Ramsey County' },
      { '@type': 'AdministrativeArea', name: 'Dakota County' }, { '@type': 'AdministrativeArea', name: 'Washington County' },
      { '@type': 'AdministrativeArea', name: 'Anoka County' }, { '@type': 'AdministrativeArea', name: 'Scott County' },
      { '@type': 'AdministrativeArea', name: 'Carver County' }
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog', name: 'Dryer Vent Services',
      itemListElement: [
        { '@type': 'Offer', price: PRICING.base.ground.price, priceCurrency: 'USD', itemOffered: { '@type': 'Service', name: 'Dryer Vent Cleaning (wall / ground-level vent)' } },
        { '@type': 'Offer', price: PRICING.base.roof.price, priceCurrency: 'USD', itemOffered: { '@type': 'Service', name: 'Roof Dryer Vent Cleaning' } },
        ...PRICING.addons.map(a => ({ '@type': 'Offer', price: a.price, priceCurrency: 'USD', itemOffered: { '@type': 'Service', name: a.label } }))
      ]
    },
    potentialAction: {
      '@type': 'ReserveAction', name: 'Book Dryer Vent Cleaning',
      target: { '@type': 'EntryPoint', urlTemplate: url('/book.html'), actionPlatform: ['http://schema.org/DesktopWebPlatform', 'http://schema.org/MobileWebPlatform'] },
      result: { '@type': 'Reservation', name: 'Dryer Vent Cleaning Appointment' }
    },
    ...extra
  };
}

export const faqSchema = (faqs) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } }))
});

export const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: url(it.href) }))
});

export const serviceSchema = ({ name, description, path, price }) => ({
  '@context': 'https://schema.org', '@type': 'Service',
  name, description, url: url(path), serviceType: 'Dryer vent cleaning',
  provider: { '@id': url('/#business') },
  areaServed: { '@type': 'AdministrativeArea', name: 'Minneapolis–Saint Paul metro' },
  offers: { '@type': 'Offer', price, priceCurrency: 'USD', availability: 'https://schema.org/InStock', url: url('/book.html') }
});

export const articleSchema = (a) => ({
  '@context': 'https://schema.org', '@type': 'Article',
  headline: a.title, description: a.description, datePublished: a.date, dateModified: a.date,
  author: { '@type': 'Organization', name: SITE.name }, publisher: { '@id': url('/#business') },
  mainEntityOfPage: url('/blog/' + a.slug), image: url('/images/og.png')
});

export const speakable = (selectors) => ({ '@context': 'https://schema.org', '@type': 'WebPage', speakable: { '@type': 'SpeakableSpecification', cssSelector: selectors } });

// ---------------------------------------------------------------------------
// UI partials
// ---------------------------------------------------------------------------
export const phoneLink = (cls = '') => `<a href="tel:${SITE.phoneE164}" class="${cls}">${SITE.phone}</a>`;

export function breadcrumbs(items) {
  return `<nav class="crumbs" aria-label="Breadcrumb"><ol>${items.map((it, i) => i === items.length - 1
    ? `<li aria-current="page">${esc(it.name)}</li>`
    : `<li><a href="${it.href}">${esc(it.name)}</a></li>`).join('')}</ol></nav>`;
}

export function faqBlock(faqs, { heading = 'Frequently asked questions', intro = '', open = 1, id = 'faq' } = {}) {
  if (!faqs.length) return '';
  return `
<section class="section faq-section" id="${id}">
  <div class="container narrow">
    <h2 class="h2">${esc(heading)}</h2>
    ${intro ? `<p class="muted">${intro}</p>` : ''}
    <div class="faq-list">
      ${faqs.map((f, i) => `
      <details class="faq"${i < open ? ' open' : ''}>
        <summary><span>${esc(f.q)}</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg></summary>
        <div class="faq-a"><p>${esc(f.a)}</p></div>
      </details>`).join('')}
    </div>
  </div>
</section>`;
}

export function ctaBand({ title = 'Book your dryer vent cleaning in 60 seconds', sub = `Flat ${money(PRICING.base.ground.price)} for wall vents, ${money(PRICING.base.roof.price)} for roof vents. No trip charge. Pay when it's done.`, q = '' } = {}) {
  return `
<section class="cta-band reveal">
  <div class="container cta-inner">
    <div>
      <h2 class="h2">${esc(title)}</h2>
      <p>${esc(sub)}</p>
    </div>
    <div class="cta-actions">
      <a href="/book.html${q}" class="btn btn-primary btn-lg">Book online</a>
      ${phoneLink('btn btn-ghost btn-lg')}
    </div>
  </div>
</section>`;
}

export function priceCards({ compact = false } = {}) {
  const b = PRICING.base;
  return `
<div class="price-grid${compact ? ' compact' : ''}">
  <article class="price-card reveal">
    <div class="price-ill">${houseSvg('ground', { id: 'pc-ground', animate: true, compact: true })}</div>
    <h3>${esc(b.ground.label)}</h3>
    <div class="price">${money(b.ground.price)}</div>
    <p class="muted">Basement or main-floor laundry. Vent exits a side wall. ${b.ground.duration}.</p>
    <a href="/book.html?vent=ground" class="btn btn-primary">Book wall vent</a>
  </article>
  <article class="price-card featured reveal">
    <div class="price-ill">${houseSvg('roof', { id: 'pc-roof', animate: true, compact: true })}</div>
    <h3>${esc(b.roof.label)}</h3>
    <div class="price">${money(b.roof.price)}</div>
    <p class="muted">Second-floor laundry. Vent exits the roof. Cap cleared from above. ${b.roof.duration}.</p>
    <a href="/book.html?vent=roof" class="btn btn-primary">Book roof vent</a>
  </article>
  <article class="price-card reveal">
    <div class="price-ill unsure-ill"><span class="q-mark">?</span></div>
    <h3>${esc(b.unsure.label)}</h3>
    <div class="price">from ${money(b.unsure.price)}</div>
    <p class="muted">${esc(b.unsure.note)}</p>
    <a href="/book.html?vent=unsure" class="btn btn-outline">Book &amp; we'll check</a>
  </article>
</div>`;
}

export function addonTable() {
  return `
<table class="addon-table">
  <thead><tr><th>Optional add-on</th><th>What it covers</th><th>Price</th></tr></thead>
  <tbody>
  ${PRICING.addons.map(a => `<tr><td><strong>${esc(a.label)}</strong></td><td>${esc(a.desc)}</td><td class="num">${money(a.price)}</td></tr>`).join('')}
  </tbody>
</table>`;
}

export function trustRow() {
  return `
<ul class="trust-row reveal">
  <li><strong>Flat rate</strong><span>No trip charge, no hourly billing</span></li>
  <li><strong>Insured</strong><span>COI available for associations</span></li>
  <li><strong>Airflow tested</strong><span>Before &amp; after numbers on your receipt</span></li>
  <li><strong>Pay after</strong><span>Card, cash, Zelle or Venmo</span></li>
</ul>`;
}

// Google tag (Ads + GA4). Nothing is emitted when no ids are configured or on the admin page.
function trackingHead(path) {
  const t = SITE.tracking || {}; const ids = [t.ga4, t.gads].filter(Boolean);
  if (/^\/admin/.test(path)) return '';
  const clarity = t.clarity ? `<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${t.clarity}");</script>` : '';
  if (!ids.length) return clarity;
  return clarity + `<script async src="https://www.googletagmanager.com/gtag/js?id=${ids[0]}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());${ids.map(id => `gtag('config','${id}');`).join('')}window.DVP_TRACK=${JSON.stringify({ gads: t.gads || '', label: t.gadsBookingLabel || '' })};</script>`;
}

function landingHeader() {
  return `<header class="site-header landing-header" id="site-header">
  <div class="container nav-inner">
    <a href="/" class="brand" aria-label="${esc(SITE.name)} home">
      <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="currentColor"/><path d="M12 28V15l8-6 8 6v13" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/><path d="M20 28v-7" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/></svg>
      <span class="brand-text"><span class="brand-name">${esc(SITE.shortName)}</span><span class="brand-sub">Dryer vent cleaning · Twin Cities</span></span>
    </a>
    <div class="nav-actions"><a href="/book.html" class="btn btn-primary btn-sm">Book online</a></div>
  </div>
</header>`;
}

function navHtml(active = '') {
  return `
<header class="site-header" id="site-header">
  <div class="container nav-inner">
    <a href="/" class="brand" aria-label="${esc(SITE.name)} home">
      <svg class="brand-mark" viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="10" fill="currentColor"/><path d="M12 28V15l8-6 8 6v13" fill="none" stroke="#fff" stroke-width="2.6" stroke-linejoin="round"/><path d="M20 28v-7" stroke="#fff" stroke-width="2.6"/><circle cx="20" cy="17" r="2.2" fill="#fff"/></svg>
      <span class="brand-text"><span class="brand-name">${esc(SITE.shortName)}</span><span class="brand-sub">Dryer vent cleaning · Twin Cities</span></span>
    </a>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      <ul>
        ${NAV.map(n => n.children ? `
        <li class="has-menu${active === n.href ? ' active' : ''}">
          <a href="${n.href}">${n.label}</a>
          <ul class="submenu">${n.children.map(c => `<li><a href="${c.href}">${c.label}</a></li>`).join('')}</ul>
        </li>` : `<li${active === n.href ? ' class="active"' : ''}><a href="${n.href}">${n.label}</a></li>`).join('')}
        <li class="nav-tel"><a href="tel:${SITE.phoneE164}" class="btn btn-ghost">Call or text ${esc(SITE.phone)}</a><span class="muted small">${esc(SITE.hours)}</span></li>
      </ul>
    </nav>
    <div class="nav-actions">
      ${phoneLink('nav-phone')}
      <a href="/book.html" class="btn btn-primary btn-sm">Book now</a>
      <button class="nav-toggle" data-nav-toggle aria-expanded="false" aria-controls="site-nav" aria-label="Menu"><span></span><span></span><span></span></button>
    </div>
  </div>
</header>`;
}

function footerHtml(cities, services) {
  const year = new Date().getFullYear();
  return `
<footer class="site-footer">
  <div class="container footer-grid">
    <div class="footer-brand">
      <div class="brand-name">${esc(SITE.name)}</div>
      <p>Dryer vent cleaning for Minneapolis, Saint Paul and every suburb in between. Flat-rate, insured, airflow-tested.</p>
      <p>${phoneLink()}<br><a href="mailto:${SITE.email}">${SITE.email}</a><br>${esc(SITE.hours)}</p>
      <a href="/book.html" class="btn btn-primary">Book online</a>
    </div>
    <div>
      <h4>Services</h4>
      <ul>${services.map(s => `<li><a href="/${s.slug}.html">${esc(s.name)}</a></li>`).join('')}<li><a href="/pricing.html">Pricing</a></li><li><a href="/how-it-works.html">How it works</a></li></ul>
    </div>
    <div>
      <h4>Learn</h4>
      <ul>
        <li><a href="/faq.html">All FAQs</a></li>
        <li><a href="/blog.html">Blog &amp; guides</a></li>
        <li><a href="/blog/signs-your-dryer-vent-is-clogged.html">Signs of a clogged vent</a></li>
        <li><a href="/blog/roof-vs-wall-dryer-vent.html">Roof vs wall vents</a></li>
        <li><a href="/blog/dryer-fire-statistics-and-prevention.html">Dryer fire prevention</a></li>
        <li><a href="/about.html">About us</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </div>
    <div class="footer-cities">
      <h4>Service area</h4>
      <ul class="city-links">${cities.map(c => `<li><a href="/dryer-vent-cleaning-${c.slug}.html">${esc(c.name)}</a></li>`).join('')}</ul>
      <a href="/service-area.html" class="more">Full service area →</a>
    </div>
  </div>
  <div class="container footer-bottom">
    <span>© ${year} ${esc(SITE.name)}. Locally owned in the Twin Cities.</span>
    <span><a href="/privacy.html">Privacy</a> · <a href="/terms.html">Terms</a> · <a href="/sitemap.xml">Sitemap</a></span>
  </div>
</footer>
<a href="/book.html" class="sticky-book" id="sticky-book">Book now · from ${money(PRICING.base.ground.price)}</a>`;
}

// ---------------------------------------------------------------------------
// Page shell
// ---------------------------------------------------------------------------
export function page({ path, title, description, keywords = '', body, schema = [], bodyClass = '', active = '', extraHead = '', scripts = '', landing = false, noindex = false, cities = [], services = [], ogType = 'website', hideStickyBook = false }) {
  const canonical = url(path);
  const schemas = [businessSchema(), ...schema].map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`).join('\n');
  const out = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
${keywords ? `<meta name="keywords" content="${esc(keywords)}">` : ''}
<meta name="author" content="${esc(SITE.name)}">
<meta name="robots" content="${noindex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large'}">
<link rel="canonical" href="${canonical}">
<meta name="theme-color" content="#0f2a3d">
<meta property="og:type" content="${ogType}">
<meta property="og:site_name" content="${esc(SITE.name)}">
<meta property="og:url" content="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:image" content="${url('/images/og.png')}">
<meta property="og:locale" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${url('/images/og.png')}">
<meta name="geo.region" content="US-MN"><meta name="geo.placename" content="Minneapolis–Saint Paul">
<link rel="icon" href="/images/favicon.svg" type="image/svg+xml">
<link rel="icon" href="/images/favicon.png" type="image/png" sizes="64x64">
<link rel="apple-touch-icon" href="/images/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${asset('/site.css')}">
${trackingHead(path)}
${extraHead}
${schemas}
</head>
<body class="${bodyClass}${hideStickyBook ? ' no-sticky' : ''}">
<a href="#main" class="skip">Skip to content</a>
${landing ? landingHeader() : navHtml(active)}
<main id="main">
${body}
</main>
${landing ? footerHtml(cities, services).replace(/<a href="tel:[^"]*"[^>]*>([^<]*)<\/a>/g, '<span>$1</span>') : footerHtml(cities, services)}
<script src="${asset('/app.js')}" defer></script>
${scripts}
</body>
</html>`;
  return out.replace(/href="(\/[^"]*?)\.html(?=["?#])/g, 'href="$1').replace(/href="\/index"/g, 'href="/"').replace(/href="\/index(?=[?#])/g, 'href="/');
}
