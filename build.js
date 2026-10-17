// Static site generator: node build.js  →  writes *.html, blog/*.html, sitemap.xml, robots.txt, llms.txt
import { mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from 'node:fs';
import { SITE, PRICING, NAV } from './src/data/site.js';
import { CITIES } from './src/data/cities.js';
import { SERVICES } from './src/data/services.js';
import { FAQS, FAQ_CATEGORIES, faqsByTag } from './src/data/faqs.js';
import { ARTICLES } from './src/data/articles.js';
import { page, esc, money, url, clean, houseSvg, faqBlock, faqSchema, breadcrumbs, breadcrumbSchema, serviceSchema, articleSchema, speakable, ctaBand, priceCards, addonTable, trustRow, phoneLink } from './src/layout.js';

const OUT = new URL('.', import.meta.url).pathname;
const pages = []; // for sitemap
const common = { cities: CITIES, services: SERVICES };

function emit(path, html, { priority = 0.6, changefreq = 'monthly', sitemap = true } = {}) {
  const file = OUT + path.replace(/^\//, '');
  const dir = file.slice(0, file.lastIndexOf('/'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(file, html);
  if (sitemap) pages.push({ path, priority, changefreq });
}

const pick = (arr, n, offset = 0) => arr.slice(offset, offset + n);
const G = PRICING.base.ground.price, R = PRICING.base.roof.price;

// ============================================================================
// HOME
// ============================================================================
function home() {
  const faqs = [...faqsByTag('general').slice(0, 3), ...faqsByTag('pricing').slice(0, 2), ...faqsByTag('roof').slice(0, 1), ...faqsByTag('booking').slice(0, 2)];
  const body = `
<section class="hero">
  <div class="container hero-grid">
    <div class="hero-copy">
      <p class="eyebrow reveal">Minneapolis · Saint Paul · All suburbs</p>
      <h1 class="h1 reveal">Your dryer shouldn't need <em>two cycles.</em></h1>
      <p class="lead reveal">Professional dryer vent cleaning for Twin Cities homes. Full duct cleaned, cap cleared, airflow tested. Flat <strong>${money(G)}</strong> for wall vents, <strong>${money(R)}</strong> for roof vents. Book online in about a minute.</p>
      <div class="hero-actions reveal">
        <a href="/book.html" class="btn btn-primary btn-lg">Book online</a>
        <a href="/pricing.html" class="btn btn-ghost btn-lg">See pricing</a>
      </div>
      <ul class="hero-points reveal">
        <li>No trip charge, no hourly billing</li>
        <li>Usually within 2–4 days, Saturdays available</li>
        <li>Pay after, when you're happy</li>
      </ul>
    </div>
    <div class="hero-art reveal">
      <div class="hero-house" id="hero-house">
        ${houseSvg('roof', { id: 'hero-roof' })}
        ${houseSvg('ground', { id: 'hero-ground' })}
      </div>
      <div class="hero-toggle" role="group" aria-label="Vent type">
        <button type="button" class="active" data-hero-vent="roof">Roof vent</button>
        <button type="button" data-hero-vent="ground">Wall vent</button>
      </div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">${trustRow()}</div>
</section>

<!-- Apple-style scroll story: sticky scene + steps -->
<section class="story" id="scroll-story" aria-label="How lint builds up and how we fix it">
  <div class="story-sticky">
    <div class="story-scene" id="story-scene" data-state="1">
      <svg viewBox="0 0 600 360" class="story-svg" aria-hidden="true">
        <defs>
          <linearGradient id="s-heat" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ff6a3d" stop-opacity="0"/><stop offset="1" stop-color="#ff6a3d" stop-opacity=".55"/></linearGradient>
          <clipPath id="s-duct-clip"><path d="M150 270 L150 200 Q150 180 170 180 L400 180 Q420 180 420 160 L420 60" fill="none" stroke="#000" stroke-width="30"/></clipPath>
        </defs>
        <!-- dryer -->
        <rect x="90" y="250" width="120" height="100" rx="10" class="s-dryer"/>
        <circle cx="150" cy="300" r="32" class="s-drum"/>
        <circle cx="150" cy="300" r="18" class="s-drum-inner"/>
        <!-- heat glow -->
        <rect x="90" y="250" width="120" height="100" rx="10" class="s-heat" fill="url(#s-heat)"/>
        <!-- duct -->
        <path d="M150 270 L150 200 Q150 180 170 180 L400 180 Q420 180 420 160 L420 60" class="s-duct"/>
        <!-- lint layers (progressively visible) -->
        <path d="M150 270 L150 200 Q150 180 170 180 L400 180 Q420 180 420 160 L420 60" class="s-lint s-lint-1"/>
        <path d="M150 270 L150 200 Q150 180 170 180 L400 180 Q420 180 420 160 L420 60" class="s-lint s-lint-2"/>
        <path d="M150 270 L150 200 Q150 180 170 180 L400 180 Q420 180 420 160 L420 60" class="s-lint s-lint-3"/>
        <!-- elbow clumps -->
        <g class="s-clumps">
          <ellipse cx="160" cy="186" rx="16" ry="10"/><ellipse cx="412" cy="176" rx="18" ry="11"/><ellipse cx="420" cy="80" rx="12" ry="18"/>
        </g>
        <!-- cap -->
        <path d="M400 62 L420 40 L440 62 Z" class="s-cap"/>
        <!-- brush -->
        <g class="s-brush">
          <line x1="150" y1="420" x2="150" y2="300" class="s-rod"/>
          <circle cx="150" cy="300" r="15" class="s-brushhead"/>
        </g>
        <!-- airflow arrows -->
        <g class="s-air">
          <path d="M420 48 L420 18" marker-end="url(#s-arrow)"/><path d="M405 44 L398 16"/><path d="M435 44 L442 16"/>
        </g>
      </svg>
      <div class="story-badge" id="story-badge">Lint gets past the screen</div>
    </div>
  </div>
  <div class="story-steps">
    <div class="story-step" data-step="1">
      <p class="eyebrow">01 · The problem</p>
      <h2 class="h2">Your lint screen catches about 75%.</h2>
      <p>The rest rides the hot, wet exhaust into the duct. It sticks to the walls and settles at every elbow.</p>
    </div>
    <div class="story-step" data-step="2">
      <p class="eyebrow">02 · The buildup</p>
      <h2 class="h2">A year later there's a gallon of it.</h2>
      <p>Roof vents are worst: lint falls back down the run and mats against the cap. Nobody ever looks up there.</p>
    </div>
    <div class="story-step" data-step="3">
      <p class="eyebrow">03 · The symptoms</p>
      <h2 class="h2">Two cycles. Hot cabinet. Burning smell.</h2>
      <p>Restricted airflow traps heat where the lint is. That is how most of the 2,900 dryer fires a year start.</p>
    </div>
    <div class="story-step" data-step="4">
      <p class="eyebrow">04 · The fix</p>
      <h2 class="h2">We clear the whole run in about an hour.</h2>
      <p>Rotary brush, HEPA vacuum, cap cleared, airflow measured before and after. You see the lint. Your dryer runs like new.</p>
      <a href="/book.html" class="btn btn-primary">Book a cleaning</a>
    </div>
  </div>
</section>

<section class="section" id="pricing">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Flat-rate pricing</p>
      <h2 class="h2">Price depends on one thing: where the vent exits.</h2>
      <p class="muted">That's the question we ask when you book. Everything else is included.</p>
    </div>
    ${priceCards()}
    <p class="center muted small reveal">Optional add-ons like nest removal or a pest-proof cap are always quoted before we do them. <a href="/pricing.html">Full price list →</a></p>
  </div>
</section>

<section class="section alt">
  <div class="container split">
    <div class="reveal">
      <p class="eyebrow">What's included</p>
      <h2 class="h2">Every job, every time.</h2>
      <ul class="check-list">
        <li>Full-length rotary brush cleaning, dryer to exterior cap</li>
        <li>HEPA vacuum capture, drop cloth, cleanup</li>
        <li>Exterior cap cleared, flapper freed, screens removed</li>
        <li>Transition hose inspected, reconnected and sealed</li>
        <li>Before &amp; after airflow reading on your receipt</li>
        <li>Photos of the cap before and after</li>
        <li>Honest notes on duct condition, no pressure upsells</li>
      </ul>
      <a href="/how-it-works.html" class="link-arrow">See the step-by-step →</a>
    </div>
    <div class="reveal stat-grid">
      <div class="stat"><div class="stat-n">2,900</div><div class="stat-l">U.S. home dryer fires every year</div></div>
      <div class="stat"><div class="stat-n">34%</div><div class="stat-l">caused by failure to clean</div></div>
      <div class="stat"><div class="stat-n">~30%</div><div class="stat-l">energy wasted by a restricted vent</div></div>
      <div class="stat"><div class="stat-n">1 hr</div><div class="stat-l">typical appointment</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Services</p>
      <h2 class="h2">One specialty, done properly.</h2>
    </div>
    <div class="card-grid">
      ${SERVICES.map(s => `<a href="/${s.slug}.html" class="card reveal"><h3>${esc(s.name)}</h3><p>${esc(s.short)}</p><span class="link-arrow">Learn more →</span></a>`).join('')}
    </div>
  </div>
</section>

<section class="section alt">
  <div class="container">
    <div class="section-head reveal">
      <p class="eyebrow">Service area</p>
      <h2 class="h2">The whole metro, no trip charge.</h2>
      <p class="muted">Hennepin, Ramsey, Dakota, Washington, Anoka, Scott and Carver counties.</p>
    </div>
    <ul class="city-cloud reveal">${CITIES.map(c => `<li><a href="/dryer-vent-cleaning-${c.slug}.html">${esc(c.name)}</a></li>`).join('')}</ul>
  </div>
</section>

${faqBlock(faqs, { heading: 'Quick answers', intro: `Have a different question? <a href="/faq.html">Browse all ${FAQS.length} questions</a> or ${phoneLink()}.` })}
${ctaBand()}`;

  emit('/index.html', page({
    ...common, path: '/index.html', active: '/',
    title: `Dryer Vent Cleaning Minneapolis–St. Paul | $${G} Flat Rate`,
    description: `Twin Cities dryer vent cleaning with flat-rate pricing: $${G} wall vents, $${R} roof vents. Full duct cleaned, cap cleared, airflow tested. Book online in 60 seconds. No trip charge.`,
    keywords: 'dryer vent cleaning minneapolis, dryer vent cleaning st paul, dryer vent cleaning near me, dryer vent cleaning twin cities, roof dryer vent cleaning, dryer lint removal service',
    bodyClass: 'home', body,
    schema: [faqSchema(faqs), speakable(['.hero .lead', '#faq .faq[open] .faq-a'])]
  }), { priority: 1.0, changefreq: 'weekly' });
}

// ============================================================================
// BOOKING
// ============================================================================
function booking() {
  const addons = PRICING.addons;
  const body = `
<section class="book-page">
  <div class="container book-grid">
    <div class="book-main">
      <div class="book-head">
        <h1 class="h2">Book dryer vent cleaning</h1>
        <p class="muted">About a minute. No deposit. You'll get a confirmation by email and text.</p>
      </div>
      <div class="restore-banner" id="restore-banner" hidden>
        <span>Pick up where you left off?</span>
        <button type="button" class="btn btn-sm btn-primary" id="restore-yes">Restore</button>
        <button type="button" class="btn btn-sm btn-ghost" id="restore-no">Start over</button>
      </div>
      <ol class="bk-progress" id="bk-progress" aria-label="Booking steps">
        <li class="bk-prog current" data-step="1"><span>1</span>Vent</li>
        <li class="bk-prog" data-step="2"><span>2</span>Details</li>
        <li class="bk-prog" data-step="3"><span>3</span>Schedule</li>
        <li class="bk-prog" data-step="4"><span>4</span>Contact</li>
        <li class="bk-prog" data-step="5"><span>5</span>Confirm</li>
      </ol>

      <form id="booking-form" novalidate autocomplete="on">
        <!-- STEP 1: vent location -->
        <fieldset class="bk-step" data-step="1">
          <legend class="h3">Where does your dryer vent exit the house?</legend>
          <p class="muted">This is the only thing that changes the price. Watch the lint travel and pick the one that matches your home.</p>
          <div class="vent-options">
            <label class="vent-option">
              <input type="radio" name="ventLocation" value="ground" required>
              <span class="vent-card">
                <span class="vent-ill">${houseSvg('ground', { id: 'bk-ground' })}</span>
                <span class="vent-body">
                  <span class="vent-title">Wall / ground-level <b>${money(G)}</b></span>
                  <span class="vent-desc">Basement or main-floor laundry. A hooded cap on the side of the house, usually 1–4 ft off the ground. Also pick this for soffit vents.</span>
                </span>
              </span>
            </label>
            <label class="vent-option">
              <input type="radio" name="ventLocation" value="roof">
              <span class="vent-card">
                <span class="vent-ill">${houseSvg('roof', { id: 'bk-roof' })}</span>
                <span class="vent-body">
                  <span class="vent-title">Roof vent <b>${money(R)}</b></span>
                  <span class="vent-desc">Second-floor or interior laundry room. A small hooded cap on the roof. Cleared from the roof and inside. Clogs twice as fast.</span>
                </span>
              </span>
            </label>
            <label class="vent-option unsure">
              <input type="radio" name="ventLocation" value="unsure">
              <span class="vent-card">
                <span class="vent-ill unsure-ill"><span class="q-mark">?</span></span>
                <span class="vent-body">
                  <span class="vent-title">Not sure <b>from ${money(G)}</b></span>
                  <span class="vent-desc">${esc(PRICING.base.unsure.note)}</span>
                </span>
              </span>
            </label>
          </div>
          <details class="help-box">
            <summary>How do I find my vent?</summary>
            <p>Walk around the outside of the house on the laundry-room side and look for a 4-inch hooded cap with a flap. Run the dryer: the flap should move and you'll feel warm air. If there is no cap on any wall and your laundry is upstairs, look at the roof for a small gray or black hood about the size of a coffee can. <a href="/blog/roof-vs-wall-dryer-vent.html" target="_blank" rel="noopener">Full guide with pictures →</a></p>
          </details>
          <p class="field-error" data-error-for="ventLocation" hidden>Please choose where your vent exits, or pick "Not sure".</p>
        </fieldset>

        <!-- STEP 2: details + add-ons -->
        <fieldset class="bk-step" data-step="2" hidden>
          <legend class="h3">A few details about the dryer</legend>
          <div class="field-row">
            <div class="field">
              <label for="dryerType">Dryer type</label>
              <select id="dryerType" name="dryerType">
                <option value="electric">Electric</option>
                <option value="gas">Gas</option>
                <option value="unknown">Not sure</option>
              </select>
            </div>
            <div class="field">
              <label for="homeType">Home type</label>
              <select id="homeType" name="homeType">
                <option value="single">Single-family house</option>
                <option value="townhome">Townhome</option>
                <option value="condo">Condo / apartment</option>
                <option value="duplex">Duplex / multi-unit</option>
              </select>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="laundryFloor">Where is the laundry room?</label>
              <select id="laundryFloor" name="laundryFloor">
                <option value="basement">Basement</option>
                <option value="main">Main floor</option>
                <option value="upper">Second floor or higher</option>
              </select>
            </div>
            <div class="field">
              <label for="lastCleaned">Last cleaned</label>
              <select id="lastCleaned" name="lastCleaned">
                <option value="never">Never / don't know</option>
                <option value="1-2">1–2 years ago</option>
                <option value="<1">Less than a year ago</option>
                <option value="3+">3+ years ago</option>
              </select>
            </div>
          </div>
          <div class="field">
            <span class="label">Anything you've noticed? <span class="muted">(optional)</span></span>
            <div class="chip-group">
              ${['Takes 2 cycles to dry','Dryer runs hot','Burning smell','Lint around outside vent','Flapper doesn\'t open','Hear birds / chirping','Just maintenance'].map(s => `<label class="chip"><input type="checkbox" name="symptoms" value="${esc(s)}"><span>${esc(s)}</span></label>`).join('')}
            </div>
          </div>
          <div class="field">
            <span class="label">Optional add-ons <span class="muted">(you can also decide on site)</span></span>
            <div class="addon-list">
              ${addons.map(a => `
              <label class="addon">
                <input type="checkbox" name="addons" value="${a.id}" data-price="${a.price}">
                <span class="addon-body"><span class="addon-title">${esc(a.label)}</span><span class="addon-desc">${esc(a.desc)}</span></span>
                <span class="addon-price">+${money(a.price)}</span>
              </label>`).join('')}
            </div>
          </div>
        </fieldset>

        <!-- STEP 3: schedule -->
        <fieldset class="bk-step" data-step="3" hidden>
          <legend class="h3">Where and when</legend>
          <div class="field">
            <label for="address">Street address</label>
            <input type="text" id="address" name="address" placeholder="1234 Main St" autocomplete="street-address" required>
            <p class="field-error" data-error-for="address" hidden>Please enter the service address.</p>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="city">City</label>
              <input type="text" id="city" name="city" list="city-list" placeholder="Minneapolis" autocomplete="address-level2" required>
              <datalist id="city-list">${CITIES.map(c => `<option value="${esc(c.name)}">`).join('')}</datalist>
              <p class="field-error" data-error-for="city" hidden>Please enter the city.</p>
            </div>
            <div class="field short">
              <label for="zip">ZIP</label>
              <input type="text" id="zip" name="zip" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" placeholder="55401" autocomplete="postal-code" required>
              <p class="field-error" data-error-for="zip" hidden>5-digit ZIP.</p>
            </div>
          </div>
          <div class="field-row">
            <div class="field">
              <label for="date">Preferred date</label>
              <input type="date" id="date" name="date" required>
              <p class="field-error" data-error-for="date" hidden>Pick a date from tomorrow onward.</p>
            </div>
            <div class="field">
              <label for="window">Arrival window</label>
              <select id="window" name="window" required>
                <option value="">Choose a window…</option>
                ${PRICING.windows.map(w => `<option value="${esc(w)}">${esc(w)}</option>`).join('')}
              </select>
              <p class="field-error" data-error-for="window" hidden>Pick an arrival window.</p>
            </div>
          </div>
          <label class="check-inline"><input type="checkbox" name="flexible" value="yes"> I'm flexible, text me if an earlier slot opens up</label>
          <div class="field">
            <label for="access">Access notes <span class="muted">(gate code, dogs, parking, where the dryer is)</span></label>
            <textarea id="access" name="access" rows="2" placeholder="Side door, friendly dog, dryer is in the basement"></textarea>
          </div>
        </fieldset>

        <!-- STEP 4: contact -->
        <fieldset class="bk-step" data-step="4" hidden>
          <legend class="h3">How do we reach you?</legend>
          <div class="field-row">
            <div class="field">
              <label for="name">Full name</label>
              <input type="text" id="name" name="name" autocomplete="name" required>
              <p class="field-error" data-error-for="name" hidden>Please enter your name.</p>
            </div>
            <div class="field">
              <label for="phone">Mobile phone</label>
              <input type="tel" id="phone" name="phone" autocomplete="tel" placeholder="(612) 555-0123" required>
              <p class="field-error" data-error-for="phone" hidden>Enter a 10-digit phone number.</p>
            </div>
          </div>
          <div class="field">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" autocomplete="email" required>
            <p class="field-error" data-error-for="email" hidden>Enter a valid email for your confirmation.</p>
          </div>
          <label class="check-inline"><input type="checkbox" name="smsOk" value="yes"> Text me updates about my appointment: the confirmation, a reminder the night before, and when the tech is on the way. <span class="muted">Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.</span></label>
          <div class="field">
            <label for="notes">Anything else? <span class="muted">(optional)</span></label>
            <textarea id="notes" name="notes" rows="2"></textarea>
          </div>
          <div class="field">
            <label for="heard">How did you hear about us? <span class="muted">(optional)</span></label>
            <select id="heard" name="heard"><option value="">Choose…</option><option>Google search</option><option>Google Maps</option><option>Nextdoor</option><option>Facebook</option><option>Friend or neighbor</option><option>Realtor</option><option>Flyer / door hanger</option><option>Other</option></select>
          </div>
        </fieldset>

        <!-- STEP 5: review -->
        <fieldset class="bk-step" data-step="5" hidden>
          <legend class="h3">Review and confirm</legend>
          <div class="review-card" id="review-card"></div>
          <p class="muted small">${esc(PRICING.payment)} Free rescheduling with 12 hours notice. By booking you agree to our <a href="/terms.html" target="_blank" rel="noopener">terms</a>.</p>
          <p class="field-error" id="submit-error" hidden></p>
        </fieldset>

        <div class="bk-nav">
          <button type="button" class="btn btn-ghost" id="bk-prev" hidden>Back</button>
          <button type="button" class="btn btn-primary btn-lg" id="bk-next">Continue</button>
          <button type="submit" class="btn btn-primary btn-lg" id="bk-submit" hidden>Confirm booking</button>
        </div>
      </form>
    </div>

    <aside class="book-side">
      <div class="summary" id="summary">
        <h2 class="h4">Your booking</h2>
        <dl>
          <div><dt>Service</dt><dd id="sum-service">Dryer vent cleaning</dd></div>
          <div><dt>Vent exit</dt><dd id="sum-location">—</dd></div>
          <div id="sum-addons-row" hidden><dt>Add-ons</dt><dd id="sum-addons"></dd></div>
          <div><dt>When</dt><dd id="sum-when">—</dd></div>
          <div><dt>Where</dt><dd id="sum-address">—</dd></div>
        </dl>
        <div class="sum-total"><span>Total</span><strong id="sum-total">${money(G)}</strong></div>
        <p class="muted small" id="sum-note">${esc(PRICING.payment)}</p>
        <ul class="sum-trust">
          <li>No deposit, no trip charge</li>
          <li>Free reschedule with 12 hrs notice</li>
          <li>Insured, airflow tested, photos included</li>
        </ul>
        <p class="small">Prefer to talk? ${phoneLink()}</p>
      </div>
    </aside>
  </div>
</section>
<div class="mobile-bar" id="mobile-bar">
  <button type="button" id="mobile-toggle" aria-expanded="false" aria-controls="summary"><span class="muted small">Total</span><strong id="mobile-total">${money(G)}</strong></button>
  <button type="button" class="btn btn-primary" id="mobile-next">Continue</button>
</div>`;

  const pricingJson = JSON.stringify({ base: PRICING.base, addons: PRICING.addons, windows: PRICING.windows, phone: SITE.phone, name: SITE.name });
  emit('/book.html', page({
    ...common, path: '/book.html', bodyClass: 'booking', hideStickyBook: true,
    title: `Book Dryer Vent Cleaning Online | Twin Cities | $${G}`,
    description: `Book dryer vent cleaning online in 60 seconds. Pick roof or wall vent, choose a 2-hour window, done. Flat $${G} wall / $${R} roof. No deposit, confirmation by text and email.`,
    body, scripts: `<script>window.DVP_PRICING=${pricingJson};</script>`
  }), { priority: 0.9, changefreq: 'monthly' });

  // Confirmation
  emit('/pay.html', page({
    ...common, path: '/pay.html', noindex: true, hideStickyBook: true,
    title: `Pay Online | ${SITE.shortName}`, description: 'Pay for your dryer vent cleaning securely by card.',
    body: `
<section class="section confirm">
  <div class="container narrow center">
    <h1 class="h2">Pay online</h1>
    <p class="lead">Enter your confirmation number and we'll take you to a secure card payment. You can also pay on completion — card, cash, Zelle or Venmo.</p>
    <form id="pay-form" class="review-card left" novalidate>
      <div class="field">
        <label for="pay-conf">Confirmation number</label>
        <input type="text" id="pay-conf" name="conf" placeholder="DV-7K2QX" autocomplete="off" autocapitalize="characters" required>
      </div>
      <p class="field-error" id="pay-error" hidden></p>
      <button type="submit" class="btn btn-primary" id="pay-lookup">Find my booking</button>
    </form>
    <div class="review-card left" id="pay-summary" hidden></div>
    <p class="muted small">Can't find your number? It's in your confirmation email, or ${phoneLink()} and we'll sort it out.</p>
  </div>
</section>`,
    scripts: '<script src="/app.js" defer></script>'
  }), { sitemap: false });

  emit('/pay-success.html', page({
    ...common, path: '/pay-success.html', noindex: true, hideStickyBook: true,
    title: `Payment Received | ${SITE.shortName}`, description: 'Thanks — your payment went through.',
    body: `
<section class="section confirm">
  <div class="container narrow center">
    <div class="confirm-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg></div>
    <h1 class="h2">Payment received.</h1>
    <p class="lead">Thanks! Stripe is emailing you a receipt for booking <strong id="pay-success-conf">—</strong>. Nothing else to do.</p>
    <div class="confirm-actions"><a href="/" class="btn btn-primary">Back to home</a></div>
    <p class="muted small">Questions about your visit? Reply to your confirmation email or ${phoneLink()}.</p>
  </div>
</section>`,
    scripts: '<script src="/app.js" defer></script>'
  }), { sitemap: false });

  emit('/confirmation.html', page({
    ...common, path: '/confirmation.html', noindex: true, hideStickyBook: true,
    title: `Booking Confirmed | ${SITE.shortName}`, description: 'Your dryer vent cleaning is booked.',
    body: `
<section class="section confirm">
  <div class="container narrow center">
    <div class="confirm-mark" aria-hidden="true"><svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M20 6L9 17l-5-5"/></svg></div>
    <h1 class="h2">You're booked.</h1>
    <p class="lead">Confirmation <strong id="conf-number">—</strong>. We've emailed the details and will text you a reminder the evening before.</p>
    <div class="review-card left" id="conf-details"></div>
    <div class="confirm-actions">
      <a href="/" class="btn btn-ghost">Back to home</a>
      <a id="conf-cal" class="btn btn-primary" href="#" target="_blank" rel="noopener">Add to Google Calendar</a>
    </div>
    <p class="muted small" id="conf-pay-note">Pay when the job is done — card, cash, Zelle or Venmo. Prefer to pay online? <a id="conf-pay" href="/pay">Pay securely by card</a> any time before or after your visit.</p>
    <h2 class="h4">Before we arrive</h2>
    <ul class="check-list left">
      <li>Clear the top of and the space in front of the dryer</li>
      <li>Let us know about gates or dogs (reply to the confirmation text)</li>
      <li>Roof vents: keep the ladder side of the house clear of cars</li>
    </ul>
    <p class="muted small">Need to change anything? Reply to your confirmation email or ${phoneLink()}.</p>
  </div>
</section>`,
    scripts: `<script>window.DVP_PRICING=${pricingJson};</script>`
  }), { sitemap: false });
}

// ============================================================================
// SERVICES
// ============================================================================
function services() {
  // Hub
  emit('/services.html', page({
    ...common, path: '/services.html', active: '/services.html',
    title: `Dryer Vent Services | Cleaning, Roof Vents, Nests | Twin Cities`,
    description: `All dryer vent services for Minneapolis–St. Paul: full cleaning ($${G}), roof vents ($${R}), bird nest removal, inspection, multi-family and real estate. Flat-rate, insured.`,
    keywords: 'dryer vent services minneapolis, dryer vent cleaning services, dryer vent company twin cities',
    body: `
<section class="page-hero"><div class="container">${breadcrumbs([{name:'Home',href:'/'},{name:'Services',href:'/services.html'}])}<h1 class="h1">Dryer vent services</h1><p class="lead">One specialty. We don't clean air ducts, carpets or gutters, so your vent gets a technician who does this all day.</p></div></section>
<section class="section"><div class="container card-grid">
${SERVICES.map(s => `<a href="/${s.slug}.html" class="card reveal"><h3>${esc(s.name)}</h3><p>${esc(s.lead.split('. ')[0])}.</p><span class="price-tag">${s.priceKey === 'roof' ? money(R) : (s.slug === 'multi-family-dryer-vent-cleaning' ? 'from ' + money(PRICING.multiUnitFrom) + '/unit' : money(G))}</span><span class="link-arrow">Details →</span></a>`).join('')}
</div></section>
<section class="section alt"><div class="container narrow"><h2 class="h2">Optional add-ons</h2><p class="muted">Always quoted before we do them. Decline any of them and we still complete the standard cleaning.</p>${addonTable()}</div></section>
${faqBlock(faqsByTag('process'), { heading: 'How the service works' })}
${ctaBand()}`,
    schema: [breadcrumbSchema([{name:'Home',href:'/'},{name:'Services',href:'/services.html'}]), faqSchema(faqsByTag('process'))]
  }), { priority: 0.8 });

  for (const s of SERVICES) {
    const price = s.priceKey === 'roof' ? R : G;
    const faqs = faqsByTag(...s.faqTags).slice(0, 12);
    const crumbs = [{name:'Home',href:'/'},{name:'Services',href:'/services.html'},{name:s.name,href:'/'+s.slug+'.html'}];
    const related = (s.related || []).map(r => SERVICES.find(x => x.slug === r)).filter(Boolean);
    const ventQ = s.priceKey === 'roof' ? '?vent=roof' : (s.slug === 'wall-dryer-vent-cleaning' ? '?vent=ground' : '');
    const body = `
<section class="page-hero">
  <div class="container hero-grid">
    <div>
      ${breadcrumbs(crumbs)}
      <h1 class="h1">${esc(s.h1)}</h1>
      <p class="lead">${esc(s.lead)}</p>
      <div class="hero-actions"><a href="/book.html${ventQ}" class="btn btn-primary btn-lg">Book online · ${s.slug === 'multi-family-dryer-vent-cleaning' ? 'from ' + money(PRICING.multiUnitFrom) + '/unit' : money(price)}</a>${phoneLink('btn btn-ghost btn-lg')}</div>
    </div>
    <div class="hero-art small">${houseSvg(s.priceKey === 'roof' ? 'roof' : 'ground', { id: 'svc-' + s.slug })}</div>
  </div>
</section>
<section class="section">
  <div class="container narrow">
    <div class="answer-box reveal" id="answer">
      <p class="eyebrow">Quick answer</p>
      <p>${esc(s.answer)}</p>
    </div>
    ${s.sections.map(sec => `
    <div class="content-block reveal">
      <h2 class="h2">${esc(sec.h)}</h2>
      ${sec.p ? `<p>${esc(sec.p)}</p>` : ''}
      ${sec.items ? `<ul class="check-list">${sec.items.map(i => `<li>${esc(i)}</li>`).join('')}</ul>` : ''}
    </div>`).join('')}
    ${s.addonHighlight ? `<div class="content-block reveal"><h2 class="h2">Related add-ons</h2><table class="addon-table">${PRICING.addons.filter(a => s.addonHighlight.includes(a.id)).map(a => `<tr><td><strong>${esc(a.label)}</strong><br><span class="muted">${esc(a.desc)}</span></td><td class="num">${money(a.price)}</td></tr>`).join('')}</table></div>` : ''}
  </div>
</section>
${faqBlock(faqs, { heading: `${s.name}: your questions` })}
<section class="section alt"><div class="container"><h2 class="h3">Related services</h2><div class="card-grid">${related.map(r => `<a href="/${r.slug}.html" class="card"><h3>${esc(r.name)}</h3><p>${esc(r.short)}</p><span class="link-arrow">Learn more →</span></a>`).join('')}</div></div></section>
${ctaBand({ q: ventQ })}`;
    emit('/' + s.slug + '.html', page({
      ...common, path: '/' + s.slug + '.html', active: '/services.html',
      title: s.title, description: s.description, keywords: s.keywords, body,
      schema: [serviceSchema({ name: s.name, description: s.description, path: '/' + s.slug + '.html', price }), faqSchema(faqs), breadcrumbSchema(crumbs), speakable(['#answer p:last-child'])]
    }), { priority: 0.8 });
  }
}

// ============================================================================
// PRICING / HOW IT WORKS / ABOUT / CONTACT / LEGAL
// ============================================================================
function staticPages() {
  const pfaqs = faqsByTag('pricing');
  emit('/pricing.html', page({
    ...common, path: '/pricing.html', active: '/pricing.html',
    title: `Dryer Vent Cleaning Prices | $${G} Wall, $${R} Roof | Twin Cities`,
    description: `Transparent dryer vent cleaning prices for Minneapolis–St. Paul: $${G} wall/ground vents, $${R} roof vents, add-ons from $29. No trip charge, pay after the job.`,
    keywords: 'dryer vent cleaning price, dryer vent cleaning cost minneapolis, how much is dryer vent cleaning, flat rate dryer vent cleaning',
    body: `
<section class="page-hero"><div class="container">${breadcrumbs([{name:'Home',href:'/'},{name:'Pricing',href:'/pricing.html'}])}<h1 class="h1">Pricing</h1><p class="lead">Two flat rates, decided by where your vent exits. No trip charge, no hourly billing, no surprise on the invoice.</p></div></section>
<section class="section"><div class="container">${priceCards()}</div></section>
<section class="section alt"><div class="container narrow">
  <h2 class="h2">Optional add-ons</h2>
  <p class="muted">We quote these on site before doing anything extra. Most jobs need none of them.</p>
  ${addonTable()}
  <h2 class="h2" style="margin-top:3rem">Apartments, condos &amp; townhomes</h2>
  <p>Whole-building cleaning days start at <strong>${money(PRICING.multiUnitFrom)} per unit</strong> with one invoice, a certificate of insurance and a per-unit report. <a href="/multi-family-dryer-vent-cleaning.html">Details for property managers →</a></p>
  <h2 class="h2" style="margin-top:3rem">Payment</h2>
  <p>${esc(PRICING.payment)} You'll get an emailed receipt with before/after airflow numbers and cap photos.</p>
</div></section>
${faqBlock(pfaqs, { heading: 'Pricing questions' })}
${ctaBand()}`,
    schema: [faqSchema(pfaqs), breadcrumbSchema([{name:'Home',href:'/'},{name:'Pricing',href:'/pricing.html'}])]
  }), { priority: 0.9 });

  const steps = [
    ['Book online', 'Pick roof or wall vent, a date and a two-hour window. Confirmation by email and text in seconds.'],
    ['We arrive and test', 'Text when we\'re on the way. We confirm the vent exit, lay a drop cloth and take a baseline airflow reading at the cap.'],
    ['Disconnect and inspect', 'The dryer comes out, the transition hose comes off, and we check it for crushing, lint and improper material.'],
    ['Rotary brush + HEPA vacuum', 'Flexible rods and a nylon brush scrub the full duct while the vacuum captures the lint. We work from both ends on roof vents.'],
    ['Clear the exterior cap', 'Matted lint, screens and nests removed. Flapper freed. Photos before and after.'],
    ['Reconnect, test, show you', 'Hose sealed, dryer back in place, after reading taken. We show you the lint and anything you should know about.'],
    ['Pay when done', 'Card, cash, Zelle or Venmo. Receipt with airflow numbers and photos lands in your inbox.']
  ];
  const howFaqs = faqsByTag('process', 'booking').slice(0, 12);
  emit('/how-it-works.html', page({
    ...common, path: '/how-it-works.html',
    title: 'How Dryer Vent Cleaning Works | Step by Step | Twin Cities',
    description: 'From online booking to the after airflow test: the 7 steps of a professional dryer vent cleaning appointment, how long it takes, and what you\'ll see at the end.',
    keywords: 'how dryer vent cleaning works, dryer vent cleaning process, what to expect dryer vent cleaning',
    body: `
<section class="page-hero"><div class="container">${breadcrumbs([{name:'Home',href:'/'},{name:'How it works',href:'/how-it-works.html'}])}<h1 class="h1">How it works</h1><p class="lead">Wall vents take about 45–60 minutes, roof vents 60–90. Here's the whole appointment.</p></div></section>
<section class="section"><div class="container narrow"><ol class="steps">${steps.map(([h, p], i) => `<li class="reveal"><span class="step-n">${i + 1}</span><div><h2 class="h3">${esc(h)}</h2><p>${esc(p)}</p></div></li>`).join('')}</ol></div></section>
${faqBlock(howFaqs, { heading: 'Common questions about the visit' })}
${ctaBand()}`,
    schema: [{ '@context': 'https://schema.org', '@type': 'HowTo', name: 'How professional dryer vent cleaning works', totalTime: 'PT1H', estimatedCost: { '@type': 'MonetaryAmount', currency: 'USD', value: G }, step: steps.map(([h, p], i) => ({ '@type': 'HowToStep', position: i + 1, name: h, text: p })) }, faqSchema(howFaqs), breadcrumbSchema([{name:'Home',href:'/'},{name:'How it works',href:'/how-it-works.html'}])]
  }), { priority: 0.7 });

  emit('/about.html', page({
    ...common, path: '/about.html', active: '/about.html',
    title: `About ${SITE.name} | Local, Insured, One Specialty`,
    description: `${SITE.name} is a locally owned dryer vent cleaning company serving Minneapolis, Saint Paul and the suburbs. Flat-rate pricing, airflow-tested results, no upsells.`,
    body: `
<section class="page-hero"><div class="container">${breadcrumbs([{name:'Home',href:'/'},{name:'About',href:'/about.html'}])}<h1 class="h1">A small company that does one thing well.</h1><p class="lead">We clean dryer vents. Not air ducts, not carpets, not gutters. Just the one 4-inch duct that causes two-cycle dry times and 2,900 house fires a year.</p></div></section>
<section class="section"><div class="container narrow">
<div class="content-block reveal"><h2 class="h2">Why we started</h2><p>Every Twin Cities home has a dryer vent and almost none of them have ever been cleaned. The companies that do offer it usually bolt it onto air duct cleaning as a 20-minute add-on, or quote a teaser price and add trip fees on the invoice. We wanted a service that was straightforward: published flat rates, a technician who specializes in it, an airflow number that proves it worked, and a booking form that takes a minute.</p></div>
<div class="content-block reveal"><h2 class="h2">How we work</h2><ul class="check-list"><li><strong>Published prices.</strong> ${money(G)} wall vents, ${money(R)} roof vents. That's it.</li><li><strong>Measured results.</strong> Airflow before and after, on your receipt.</li><li><strong>No pressure.</strong> Add-ons are quoted on site and you can always say no.</li><li><strong>Insured.</strong> Certificate of insurance available for associations and property managers.</li><li><strong>Local.</strong> Based in ${esc(SITE.city)}, serving all seven metro counties with no trip charge.</li></ul></div>
<div class="content-block reveal"><h2 class="h2">Our guarantee</h2><p>${esc(SITE.guarantee)}. If your dryer isn't drying noticeably faster after a cleaning, call us and we'll come back and find out why at no charge.</p></div>
<div class="content-block reveal"><h2 class="h2">Contact</h2><p>${phoneLink()} · <a href="mailto:${SITE.email}">${SITE.email}</a><br>${esc(SITE.hours)}</p></div>
</div></section>
${ctaBand()}`,
    schema: [breadcrumbSchema([{name:'Home',href:'/'},{name:'About',href:'/about.html'}])]
  }), { priority: 0.5 });

  emit('/contact.html', page({
    ...common, path: '/contact.html',
    title: `Contact ${SITE.name} | Call, Text or Book Online`,
    description: `Reach ${SITE.name} by phone, text or email, or book dryer vent cleaning online. Serving Minneapolis–St. Paul.`,
    body: `
<section class="page-hero"><div class="container">${breadcrumbs([{name:'Home',href:'/'},{name:'Contact',href:'/contact.html'}])}<h1 class="h1">Contact us</h1><p class="lead">Fastest way to get on the schedule is the online form. Questions? Call or text.</p></div></section>
<section class="section"><div class="container split">
<div class="reveal">
  <div class="contact-card"><h2 class="h3">Call or text</h2><p class="big">${phoneLink()}</p><p class="muted">${esc(SITE.hours)}</p></div>
  <div class="contact-card"><h2 class="h3">Email</h2><p class="big"><a href="mailto:${SITE.email}">${SITE.email}</a></p><p class="muted">Property managers: send unit counts for a building quote.</p></div>
  <div class="contact-card"><h2 class="h3">Book online</h2><p>Pick your vent type, date and window. Done in a minute.</p><a href="/book.html" class="btn btn-primary">Book now</a></div>
</div>
<div class="reveal">
  <form class="contact-form" id="contact-form" action="/api/process-booking" method="post" data-contact>
    <h2 class="h3">Send a message</h2>
    <div class="field"><label for="c-name">Name</label><input id="c-name" name="name" required></div>
    <div class="field-row"><div class="field"><label for="c-phone">Phone</label><input id="c-phone" name="phone" type="tel" required></div><div class="field"><label for="c-email">Email</label><input id="c-email" name="email" type="email" required></div></div>
    <div class="field"><label for="c-msg">Message</label><textarea id="c-msg" name="message" rows="4" required></textarea></div>
    <button class="btn btn-primary" type="submit">Send</button>
    <p class="small muted" id="contact-status"></p>
  </form>
</div>
</div></section>`,
    schema: [breadcrumbSchema([{name:'Home',href:'/'},{name:'Contact',href:'/contact.html'}])]
  }), { priority: 0.5 });

  emit('/privacy.html', page({ ...common, path: '/privacy.html', title: `Privacy Policy | ${SITE.name}`, description: 'How we handle the information you give us when booking.', body: `
<section class="page-hero"><div class="container"><h1 class="h1">Privacy policy</h1></div></section>
<section class="section"><div class="container narrow content-block">
<p>We collect only what we need to do the job: your name, phone, email, service address and the details you enter in the booking form. We use it to schedule and perform your service, send confirmations and reminders by email and text, and follow up about the job. We don't sell or share your information with anyone except the services that send our emails and texts on our behalf.</p>
<p>Text messages: by checking the SMS box when booking you agree to receive appointment-related texts. Reply STOP to opt out at any time. Message and data rates may apply.</p>
<p>The site uses no advertising cookies. Your booking draft is saved in your browser's local storage so you can finish later; clear it with "Start over" on the booking page.</p>
<p>Questions: <a href="mailto:${SITE.email}">${SITE.email}</a>.</p>
</div></section>` }), { priority: 0.2 });

  emit('/terms.html', page({ ...common, path: '/terms.html', title: `Terms of Service | ${SITE.name}`, description: 'Service terms for dryer vent cleaning appointments.', body: `
<section class="page-hero"><div class="container"><h1 class="h1">Terms of service</h1></div></section>
<section class="section"><div class="container narrow content-block">
<h2 class="h3">Pricing</h2><p>Base pricing is ${money(G)} for wall/ground-level vents and ${money(R)} for roof vents. If a vent booked as "wall" or "not sure" exits through the roof, roof pricing applies and is confirmed with you before work begins. Optional add-ons are quoted on site and performed only with your approval.</p>
<h2 class="h3">Scheduling</h2><p>Appointments are two-hour arrival windows. Reschedule or cancel free with at least 12 hours notice. Same-day cancellations or no-shows may be charged a $49 fee. Weather may delay roof access; we will complete interior cleaning and return at no charge to finish the cap.</p>
<h2 class="h3">Payment</h2><p>Due on completion by card, cash, Zelle or Venmo.</p>
<h2 class="h3">Scope and limitations</h2><p>We clean the exhaust duct from the dryer to its exterior termination. We do not disconnect gas lines, perform electrical work, or repair ductwork inside walls. If a duct is collapsed or disconnected inside a wall and cannot be fully cleared, no cleaning charge applies and we provide a written description for a contractor.</p>
<h2 class="h3">Guarantee</h2><p>${esc(SITE.guarantee)}. If dry times don't improve noticeably after cleaning, we return to diagnose at no charge.</p>
</div></section>` }), { priority: 0.2 });

  emit('/404.html', page({ ...common, path: '/404.html', noindex: true, title: 'Page not found', description: '', body: `
<section class="section center"><div class="container narrow"><h1 class="h1">That page went out the vent.</h1><p class="lead">Try the <a href="/">home page</a>, <a href="/faq.html">FAQ</a>, or just <a href="/book.html">book a cleaning</a>.</p></div></section>` }), { sitemap: false });

  // Admin (noindex) — lists bookings via function w/ token
  emit('/admin.html', page({ ...common, path: '/admin.html', noindex: true, hideStickyBook: true, title: 'Bookings admin', description: '', body: `
<section class="section"><div class="container">
<h1 class="h2">Bookings</h1>
<form id="admin-form" class="admin-form"><input type="password" id="admin-token" placeholder="Admin token" autocomplete="current-password"><button class="btn btn-primary" type="submit">Load</button><select id="admin-show" aria-label="Show"><option value="open">Open jobs</option><option value="paid">Paid</option><option value="all">All</option></select></form>
<p class="muted small">Set the final amount after you confirm roof vs wall on site; the pay link and Stripe checkout use it. Mark cash, Zelle or Venmo payments here. Card payments through the pay link mark themselves.</p>
<div id="admin-list" class="admin-list"></div>
</div></section>` }), { sitemap: false });
}

// ============================================================================
// SERVICE AREA + CITY PAGES
// ============================================================================
function cities() {
  const byCounty = {};
  for (const c of CITIES) (byCounty[c.county] ||= []).push(c);
  const saFaqs = faqsByTag('minnesota');
  emit('/service-area.html', page({
    ...common, path: '/service-area.html', active: '/service-area.html',
    title: 'Service Area | Dryer Vent Cleaning Minneapolis, St. Paul & Suburbs',
    description: `${SITE.name} serves all seven Twin Cities metro counties with no trip charge: Minneapolis, Saint Paul, Bloomington, Edina, Eden Prairie, Plymouth, Maple Grove, Woodbury, Eagan, Lakeville and more.`,
    keywords: 'dryer vent cleaning near me, dryer vent cleaning twin cities suburbs, dryer vent cleaning hennepin county, dryer vent cleaning dakota county',
    body: `
<section class="page-hero"><div class="container">${breadcrumbs([{name:'Home',href:'/'},{name:'Service area',href:'/service-area.html'}])}<h1 class="h1">Service area</h1><p class="lead">All of Hennepin, Ramsey, Dakota, Washington, Anoka, Scott and Carver counties. Same flat rate everywhere, no trip charge.</p></div></section>
<section class="section"><div class="container">
${Object.entries(byCounty).map(([county, list]) => `<div class="county reveal"><h2 class="h3">${esc(county)} County</h2><ul class="city-cloud">${list.map(c => `<li><a href="/dryer-vent-cleaning-${c.slug}.html">${esc(c.name)}</a></li>`).join('')}</ul></div>`).join('')}
<p class="muted">Don't see your city? If you're within about 35 miles of downtown Minneapolis, we almost certainly serve you. ${phoneLink()} or just book and we'll confirm.</p>
</div></section>
${faqBlock(saFaqs, { heading: 'Local questions' })}
${ctaBand()}`,
    schema: [faqSchema(saFaqs), breadcrumbSchema([{name:'Home',href:'/'},{name:'Service area',href:'/service-area.html'}])]
  }), { priority: 0.7 });

  CITIES.forEach((c, idx) => {
    const path = `/dryer-vent-cleaning-${c.slug}.html`;
    const crumbs = [{name:'Home',href:'/'},{name:'Service area',href:'/service-area.html'},{name:c.name,href:path}];
    const roofHeavy = /roof vents (dominate|are)/i.test(c.vent);
    // rotate FAQ selection so pages differ
    const pool = [...faqsByTag(roofHeavy ? 'roof' : 'ground'), ...faqsByTag('general'), ...faqsByTag('pricing'), ...faqsByTag('minnesota')];
    const faqs = Array.from({ length: 8 }, (_, i) => pool[(idx * 3 + i * 2) % pool.length]).filter((f, i, a) => a.indexOf(f) === i);
    const nearby = CITIES.filter(x => x.county === c.county && x.slug !== c.slug).slice(0, 6);
    const body = `
<section class="page-hero">
  <div class="container hero-grid">
    <div>
      ${breadcrumbs(crumbs)}
      <h1 class="h1">Dryer vent cleaning in ${esc(c.name)}, MN</h1>
      <p class="lead">Flat ${money(G)} for wall vents, ${money(R)} for roof vents, no trip charge to ${esc(c.name)}. Full duct cleaned, cap cleared, airflow tested, usually within 2–4 days.</p>
      <div class="hero-actions"><a href="/book.html?city=${encodeURIComponent(c.name)}" class="btn btn-primary btn-lg">Book in ${esc(c.name)}</a>${phoneLink('btn btn-ghost btn-lg')}</div>
    </div>
    <div class="hero-art small">${houseSvg(roofHeavy ? 'roof' : 'ground', { id: 'city-' + c.slug })}</div>
  </div>
</section>
<section class="section"><div class="container narrow">
  <div class="answer-box reveal" id="answer"><p class="eyebrow">Quick answer</p><p>${esc(SITE.name)} provides dryer vent cleaning in ${esc(c.name)}, Minnesota for a flat ${money(G)} (wall or ground-level vent) or ${money(R)} (roof vent), with no trip charge. The service includes full-length rotary brush cleaning, exterior cap clearing, transition hose check and a before/after airflow reading. Most ${esc(c.name)} homes need it once a year; roof-vented homes every 6–12 months.</p></div>
  <div class="content-block reveal"><h2 class="h2">What we see in ${esc(c.name)} homes</h2><p>${esc(c.housing)}</p><p><strong>Vent types:</strong> ${esc(c.vent)}</p></div>
  <div class="content-block reveal"><h2 class="h2">${esc(c.name)} neighborhoods we serve</h2><p>${c.neighborhoods.map(esc).join(' · ')} and everywhere else in ${esc(c.name)}. ZIP codes ${c.zips.join(', ')}.</p></div>
  <div class="content-block reveal"><h2 class="h2">Pricing in ${esc(c.name)}</h2>${priceCards({ compact: true })}</div>
  <div class="content-block reveal"><h2 class="h2">Signs your ${esc(c.name)} home needs it</h2><ul class="check-list"><li>Clothes take more than one cycle</li><li>Dryer or laundry room runs hot</li><li>Lint around the outside cap${roofHeavy ? ' or on the roof' : ' or behind shrubs'}</li><li>Burning smell when the dryer runs</li><li>It's been more than a year${roofHeavy ? ', or 6 months for a roof vent' : ''}</li></ul><p><a href="/blog/signs-your-dryer-vent-is-clogged.html" class="link-arrow">All 9 warning signs →</a></p></div>
</div></section>
${faqBlock(faqs, { heading: `Dryer vent questions from ${c.name}` })}
<section class="section alt"><div class="container"><h2 class="h3">Nearby in ${esc(c.county)} County</h2><ul class="city-cloud">${nearby.map(n => `<li><a href="/dryer-vent-cleaning-${n.slug}.html">${esc(n.name)}</a></li>`).join('')}<li><a href="/service-area.html">Full service area</a></li></ul></div></section>
${ctaBand({ title: `Book dryer vent cleaning in ${c.name}`, q: `?city=${encodeURIComponent(c.name)}` })}`;
    emit(path, page({
      ...common, path, active: '/service-area.html',
      title: `Dryer Vent Cleaning ${c.name} MN | $${G} Flat Rate, No Trip Fee`,
      description: `Dryer vent cleaning in ${c.name}, MN. Flat $${G} wall vents / $${R} roof vents, no trip charge. Full duct cleaned, cap cleared, airflow tested. Book online, usually within 2–4 days.`,
      keywords: `dryer vent cleaning ${c.name.toLowerCase()}, dryer vent cleaning ${c.name.toLowerCase()} mn, dryer vent cleaning near ${c.name.toLowerCase()}, ${c.name.toLowerCase()} dryer vent service`,
      body,
      schema: [
        serviceSchema({ name: `Dryer Vent Cleaning in ${c.name}`, description: `Dryer vent cleaning for homes in ${c.name}, Minnesota.`, path, price: G }),
        { '@context': 'https://schema.org', '@type': 'LocalBusiness', '@id': url(path + '#local'), name: `${SITE.name} – ${c.name}`, parentOrganization: { '@id': url('/#business') }, url: url(path), telephone: SITE.phoneE164, areaServed: { '@type': 'City', name: c.name, containedInPlace: { '@type': 'AdministrativeArea', name: `${c.county} County` } }, priceRange: `$${G}–$${R}` },
        faqSchema(faqs), breadcrumbSchema(crumbs), speakable(['#answer p:last-child'])
      ]
    }), { priority: 0.7 });
  });
}

// ============================================================================
// FAQ (hub + per-category)
// ============================================================================
function faqPages() {
  const crumbs = [{name:'Home',href:'/'},{name:'FAQ',href:'/faq.html'}];
  emit('/faq.html', page({
    ...common, path: '/faq.html', active: '/faq.html',
    title: `Dryer Vent Cleaning FAQ | ${FAQS.length} Questions Answered | Twin Cities`,
    description: `${FAQS.length} plain-English answers about dryer vent cleaning: cost, how often, roof vs wall vents, fire safety, bird nests, DIY, apartments, Minnesota winters and booking.`,
    keywords: 'dryer vent cleaning faq, dryer vent questions, how often clean dryer vent, dryer vent cleaning cost, dryer vent fire',
    body: `
<section class="page-hero"><div class="container">${breadcrumbs(crumbs)}<h1 class="h1">Every dryer vent question we've been asked</h1><p class="lead">${FAQS.length} answers, grouped by topic. Use the search box or jump to a section.</p>
<input type="search" id="faq-search" class="faq-search" placeholder="Search questions, e.g. roof, bird, cost, two cycles…" aria-label="Search FAQs">
<nav class="faq-jump" aria-label="FAQ sections">${FAQ_CATEGORIES.map(cat => `<a href="#${cat.id}">${esc(cat.title)}</a>`).join('')}</nav></div></section>
${FAQ_CATEGORIES.map(cat => faqBlock(faqsByTag(cat.id), { heading: cat.title, id: cat.id, open: 0, intro: `<a href="/faq-${cat.id}.html" class="small">Open this section as its own page →</a>` })).join('')}
<p class="center muted" id="faq-empty" hidden>No matches. Try a different word, or ${phoneLink()}.</p>
${ctaBand()}`,
    schema: [faqSchema(FAQS), breadcrumbSchema(crumbs)]
  }), { priority: 0.8, changefreq: 'weekly' });

  for (const cat of FAQ_CATEGORIES) {
    const list = faqsByTag(cat.id);
    const path = `/faq-${cat.id}.html`;
    const c2 = [...crumbs, { name: cat.title, href: path }];
    emit(path, page({
      ...common, path, active: '/faq.html',
      title: `${cat.title} | Dryer Vent FAQ`,
      description: `${list.length} answers about ${cat.title.toLowerCase()} from Twin Cities dryer vent cleaning specialists. ${esc(list[0].q)}`,
      keywords: `${cat.title.toLowerCase()} dryer vent, dryer vent ${cat.id} faq`,
      body: `
<section class="page-hero"><div class="container">${breadcrumbs(c2)}<h1 class="h1">${esc(cat.title)}</h1><p class="lead">${list.length} questions, answered plainly. <a href="/faq.html">See all topics</a>.</p></div></section>
${faqBlock(list, { heading: cat.title, open: list.length })}
<section class="section alt"><div class="container"><h2 class="h3">More topics</h2><ul class="city-cloud">${FAQ_CATEGORIES.filter(x => x.id !== cat.id).map(x => `<li><a href="/faq-${x.id}.html">${esc(x.title)}</a></li>`).join('')}</ul></div></section>
${ctaBand()}`,
      schema: [faqSchema(list), breadcrumbSchema(c2)]
    }), { priority: 0.6 });
  }
}

// ============================================================================
// BLOG
// ============================================================================
function blog() {
  const sorted = [...ARTICLES].sort((a, b) => b.date.localeCompare(a.date));
  const crumbs = [{name:'Home',href:'/'},{name:'Blog',href:'/blog.html'}];
  emit('/blog.html', page({
    ...common, path: '/blog.html', active: '/blog.html',
    title: 'Dryer Vent Guides & Tips | Clear Vent Blog',
    description: 'Plain-English guides on dryer vent cleaning: warning signs, costs, roof vs wall vents, fire prevention, bird nests, DIY limits and Minnesota winter tips.',
    keywords: 'dryer vent blog, dryer vent tips, dryer vent guide, dryer maintenance tips',
    body: `
<section class="page-hero"><div class="container">${breadcrumbs(crumbs)}<h1 class="h1">Guides &amp; tips</h1><p class="lead">Everything we wish homeowners knew before the dryer started taking two cycles.</p></div></section>
<section class="section"><div class="container card-grid">
${sorted.map(a => `<a href="/blog/${a.slug}.html" class="card article-card reveal"><span class="muted small">${fmtDate(a.date)} · ${a.readTime} min read</span><h3>${esc(a.title)}</h3><p>${esc(a.description)}</p><span class="link-arrow">Read →</span></a>`).join('')}
</div></section>
${ctaBand()}`,
    schema: [breadcrumbSchema(crumbs), { '@context': 'https://schema.org', '@type': 'Blog', name: `${SITE.name} Blog`, url: url('/blog.html'), blogPost: sorted.map(a => ({ '@type': 'BlogPosting', headline: a.title, url: url('/blog/' + a.slug), datePublished: a.date })) }]
  }), { priority: 0.7, changefreq: 'weekly' });

  sorted.forEach((a, i) => {
    const path = `/blog/${a.slug}.html`;
    const faqs = faqsByTag(...a.faqTags).slice(0, 6);
    const c2 = [...crumbs, { name: a.title, href: path }];
    const next = sorted[(i + 1) % sorted.length], prev = sorted[(i + 2) % sorted.length];
    emit(path, page({
      ...common, path, active: '/blog.html', ogType: 'article',
      title: a.title.length > 50 ? a.title : `${a.title} | ${SITE.shortName}`, description: a.description, keywords: a.keywords,
      body: `
<article class="article">
<section class="page-hero"><div class="container narrow">${breadcrumbs(crumbs)}<p class="eyebrow">${fmtDate(a.date)} · ${a.readTime} min read</p><h1 class="h1">${esc(a.title)}</h1></div></section>
<section class="section"><div class="container narrow article-body">${a.body}</div></section>
${faqBlock(faqs, { heading: 'Related questions' })}
<section class="section alt"><div class="container"><h2 class="h3">Keep reading</h2><div class="card-grid two">${[next, prev].map(n => `<a href="/blog/${n.slug}.html" class="card"><h3>${esc(n.title)}</h3><span class="link-arrow">Read →</span></a>`).join('')}</div></div></section>
</article>
${ctaBand()}`,
      schema: [articleSchema(a), faqSchema(faqs), breadcrumbSchema(c2), speakable(['.article-body .lead'])]
    }), { priority: 0.6 });
  });
}

function fmtDate(iso) { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }

// ============================================================================
// SEO files
// ============================================================================
function seoFiles() {
  const today = new Date().toISOString().slice(0, 10);
  const sm = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map(p => `  <url><loc>${url(p.path)}</loc><lastmod>${today}</lastmod><changefreq>${p.changefreq}</changefreq><priority>${p.priority.toFixed(1)}</priority></url>`).join('\n')}\n</urlset>\n`;
  writeFileSync(OUT + 'sitemap.xml', sm);
  writeFileSync(OUT + 'robots.txt', `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /confirmation\nDisallow: /pay-success\n\nSitemap: ${url('/sitemap.xml')}\n`);
  // llms.txt — answer-engine friendly summary
  const llms = `# ${SITE.name}

> Dryer vent cleaning company serving Minneapolis, Saint Paul and the Twin Cities suburbs (Hennepin, Ramsey, Dakota, Washington, Anoka, Scott, Carver counties). Flat-rate pricing: $${G} for wall/ground-level vents, $${R} for roof vents. No trip charge. Online booking at ${url('/book.html')}. Phone ${SITE.phone}.

## Key facts
- Service: full-length rotary brush + HEPA vacuum dryer vent cleaning, exterior cap cleared, transition hose checked, before/after airflow reading, photos.
- Pricing: wall/ground vent $${G}; roof vent $${R}; add-ons: ${PRICING.addons.map(a => `${a.label} $${a.price}`).join('; ')}. Multi-unit from $${PRICING.multiUnitFrom}/unit.
- Scheduling: usually within 2–4 days; Saturdays available; 2-hour arrival windows; free reschedule with 12 hours notice; pay on completion (card, cash, Zelle, Venmo).
- Recommended frequency: every 12 months; every 6 months for roof vents, heavy use, pets or gas dryers.

## Pages
${pages.filter(p => p.priority >= 0.7).map(p => `- ${url(p.path)}`).join('\n')}

## FAQ (${FAQS.length} questions)
${url('/faq.html')}
${FAQS.slice(0, 40).map(f => `- Q: ${f.q}\n  A: ${f.a}`).join('\n')}
`;
  writeFileSync(OUT + 'llms.txt', llms);
}

// ============================================================================
// RUN
// ============================================================================
// Clean previously generated html (keep hand-written assets)
for (const f of readdirSync(OUT)) if (f.endsWith('.html')) rmSync(OUT + f);
if (existsSync(OUT + 'blog')) rmSync(OUT + 'blog', { recursive: true });

home(); booking(); services(); staticPages(); cities(); faqPages(); blog(); seoFiles();
console.log(`Built ${pages.length + 4} pages → ${OUT}`);
