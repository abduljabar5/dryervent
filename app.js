/* Twin Cities Dryer Vent Pros — shared front-end
   Nav, reveal animations, homepage scroll story, FAQ search, booking engine, confirmation, contact, admin. */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const money = (n) => '$' + Number(n).toLocaleString('en-US');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ---------- Header / nav ----------
  const header = $('#site-header');
  const toggle = $('[data-nav-toggle]');
  const nav = $('#site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    // on mobile, tap a parent menu item toggles its submenu instead of navigating the first time
    $$('.has-menu > a', nav).forEach(a => a.addEventListener('click', (e) => {
      if (window.innerWidth <= 980 && !a.dataset.tapped) { e.preventDefault(); a.dataset.tapped = '1'; a.parentElement.classList.add('open'); }
    }));
  }
  const onScroll = () => header && header.classList.toggle('scrolled', window.scrollY > 8);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  // ---------- Reveal on scroll ----------
  const reveals = $$('.reveal');
  if (reveals.length) {
    if (reduced || !('IntersectionObserver' in window)) reveals.forEach(el => el.classList.add('in'));
    else {
      const io = new IntersectionObserver((entries) => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
      reveals.forEach(el => io.observe(el));
    }
  }

  // ---------- Hero vent toggle (auto-cycles until user interacts) ----------
  const heroHouse = $('#hero-house');
  if (heroHouse) {
    const btns = $$('[data-hero-vent]');
    let auto = true, state = 'roof';
    const set = (v) => { state = v; heroHouse.dataset.vent = v; btns.forEach(b => b.classList.toggle('active', b.dataset.heroVent === v)); };
    btns.forEach(b => b.addEventListener('click', () => { auto = false; set(b.dataset.heroVent); }));
    if (!reduced) setInterval(() => { if (auto) set(state === 'roof' ? 'ground' : 'roof'); }, 4500);
  }

  // ---------- Scroll story (homepage) ----------
  const scene = $('#story-scene');
  if (scene) {
    const steps = $$('.story-step');
    const badge = $('#story-badge');
    const labels = { 1: 'Lint gets past the screen', 2: 'A gallon a year', 3: 'Heat has nowhere to go', 4: 'Cleared. Airflow restored.' };
    const activate = (n) => { scene.dataset.state = n; if (badge) badge.textContent = labels[n]; steps.forEach(s => s.classList.toggle('active', s.dataset.step === String(n))); };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach(en => { if (en.isIntersecting) activate(en.target.dataset.step); });
      }, { rootMargin: '-40% 0px -40% 0px', threshold: 0 });
      steps.forEach(s => io.observe(s));
    } else activate(4);
    activate(1);
  }

  // ---------- FAQ search ----------
  const faqSearch = $('#faq-search');
  if (faqSearch) {
    const items = $$('.faq');
    const sections = $$('.faq-section');
    const empty = $('#faq-empty');
    const run = () => {
      const q = faqSearch.value.trim().toLowerCase();
      let shown = 0;
      items.forEach(it => { const hit = !q || it.textContent.toLowerCase().includes(q); it.classList.toggle('hidden', !hit); if (hit) shown++; if (q && hit) it.open = true; });
      sections.forEach(sec => sec.style.display = $$('.faq:not(.hidden)', sec).length ? '' : 'none');
      if (empty) empty.hidden = shown > 0;
    };
    faqSearch.addEventListener('input', run);
    const qs = new URLSearchParams(location.search).get('q'); if (qs) { faqSearch.value = qs; run(); }
  }

  // ---------- Contact form ----------
  const contact = $('#contact-form');
  if (contact) {
    contact.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = $('#contact-status'); const btn = $('button[type=submit]', contact);
      btn.disabled = true; status.textContent = 'Sending…';
      const data = Object.fromEntries(new FormData(contact).entries());
      try {
        const r = await fetch('/api/process-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'contact', ...data }) });
        if (!r.ok) throw new Error('bad');
        status.textContent = 'Thanks! We\'ll get back to you shortly.'; contact.reset();
      } catch { status.textContent = 'Could not send. Please call or text us instead.'; }
      btn.disabled = false;
    });
  }

  // ---------- Admin ----------
  const adminForm = $('#admin-form');
  if (adminForm) {
    adminForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const list = $('#admin-list'); list.textContent = 'Loading…';
      try {
        const r = await fetch('/api/list-bookings', { headers: { Authorization: 'Bearer ' + $('#admin-token').value } });
        if (!r.ok) throw new Error(r.status);
        const { bookings } = await r.json();
        list.innerHTML = bookings.length ? bookings.map(b => `<div class="admin-item"><div><strong>${b.confirmationNumber}</strong><br>${b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</div><div>${b.name}<br><a href="tel:${b.phone}">${b.phone}</a><br>${b.email}</div><div>${b.date} ${b.window}<br>${b.address}, ${b.city} ${b.zip}</div><div>${b.ventLabel} ${b.addonLabels && b.addonLabels.length ? '<br>+ ' + b.addonLabels.join(', ') : ''}<br><strong>${money(b.total)}</strong>${b.status ? '<br>' + b.status : ''}</div></div>`).join('') : 'No bookings yet.';
      } catch (err) { list.textContent = 'Could not load (' + err.message + '). Check the token.'; }
    });
  }

  // ---------- Booking engine ----------
  const form = $('#booking-form');
  if (form && window.DVP_PRICING) {
    const P = window.DVP_PRICING;
    const KEY = 'dvp_booking_draft_v1';
    const steps = $$('.bk-step', form);
    const progs = $$('.bk-prog');
    const prevBtn = $('#bk-prev'), nextBtn = $('#bk-next'), submitBtn = $('#bk-submit');
    const mobileNext = $('#mobile-next'), mobileTotal = $('#mobile-total'), mobileToggle = $('#mobile-toggle');
    const side = $('.book-side');
    let step = 1; const LAST = steps.length;

    const ventLabel = (v) => v ? P.base[v].label : '—';
    const data = () => {
      const fd = new FormData(form);
      const o = {};
      for (const [k, v] of fd.entries()) { if (k === 'addons' || k === 'symptoms') (o[k] ||= []).push(v); else o[k] = v; }
      o.addons ||= []; o.symptoms ||= [];
      return o;
    };
    const total = (d) => {
      const base = d.ventLocation ? P.base[d.ventLocation].price : P.base.ground.price;
      return base + d.addons.reduce((s, id) => s + ((P.addons.find(a => a.id === id) || {}).price || 0), 0);
    };
    const fmtDate = (iso) => { if (!iso) return ''; const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); };

    // date min = tomorrow, max = +60 days
    const dateEl = $('#date');
    if (dateEl) {
      const t = new Date(); t.setDate(t.getDate() + 1);
      const mx = new Date(); mx.setDate(mx.getDate() + 60);
      dateEl.min = t.toISOString().slice(0, 10); dateEl.max = mx.toISOString().slice(0, 10);
    }

    // Prefill from URL (?vent=roof&city=Edina)
    const qs = new URLSearchParams(location.search);
    const qv = qs.get('vent'); if (qv && P.base[qv]) { const r = $(`input[name=ventLocation][value=${qv}]`); if (r) r.checked = true; }
    const qc = qs.get('city'); if (qc && $('#city')) $('#city').value = qc;

    // Draft restore
    const banner = $('#restore-banner');
    let draft = null; try { draft = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}
    const meaningful = (v) => v && ['ventLocation','address','name','email','phone','date'].some(k => v[k] && String(v[k]).trim());
    if (draft && meaningful(draft.values) && banner) {
      banner.hidden = false;
      $('#restore-yes').onclick = () => { applyValues(draft.values); banner.hidden = true; go(Math.min(draft.step || 1, LAST)); };
      $('#restore-no').onclick = () => { localStorage.removeItem(KEY); banner.hidden = true; };
    }
    function applyValues(v) {
      for (const [k, val] of Object.entries(v)) {
        const els = $$(`[name="${k}"]`, form);
        if (!els.length) continue;
        if (els[0].type === 'radio') els.forEach(e => e.checked = e.value === val);
        else if (els[0].type === 'checkbox') els.forEach(e => e.checked = Array.isArray(val) ? val.includes(e.value) : val === e.value || val === 'yes');
        else els[0].value = val;
      }
      update();
    }
    let dirty = false;
    const save = () => { if (!dirty) return; try { localStorage.setItem(KEY, JSON.stringify({ step, values: data(), ts: Date.now() })); } catch {} };

    // Summary
    function update() {
      const d = data(); const t = total(d);
      $('#sum-location').textContent = ventLabel(d.ventLocation);
      const addonNames = d.addons.map(id => (P.addons.find(a => a.id === id) || {}).label).filter(Boolean);
      $('#sum-addons-row').hidden = !addonNames.length; $('#sum-addons').textContent = addonNames.join(', ');
      $('#sum-when').innerHTML = d.date ? `${fmtDate(d.date)}${d.window ? '<br>' + d.window : ''}` : '—';
      $('#sum-address').textContent = d.address ? `${d.address}, ${d.city || ''} ${d.zip || ''}`.trim() : '—';
      const label = (d.ventLocation === 'unsure' ? 'from ' : '') + money(t);
      $('#sum-total').textContent = label; if (mobileTotal) mobileTotal.textContent = label;
      $('#sum-note').textContent = d.ventLocation === 'unsure' ? P.base.unsure.note : (P.base.ground.price && 'Pay when the job is done. Card, cash, Zelle or Venmo. No deposit.');
    }
    form.addEventListener('input', () => { dirty = true; update(); save(); });
    const phoneEl = $('#phone'); if (phoneEl) phoneEl.addEventListener('blur', () => { phoneEl.value = formatPhone(phoneEl.value); });
    form.addEventListener('change', () => { dirty = true; update(); save(); });

    // Validation per step
    const show = (name, bad) => {
      const err = $(`[data-error-for="${name}"]`, form); const el = $(`[name="${name}"]`, form);
      if (err) err.hidden = !bad; if (el && el.type !== 'radio') el.classList.toggle('invalid', bad);
      return !bad;
    };
    const digits = (s) => (s || '').replace(/\D/g, '');
    function valid(n) {
      const d = data(); let ok = true;
      if (n === 1) ok = show('ventLocation', !d.ventLocation);
      if (n === 3) {
        ok = show('address', !d.address || d.address.trim().length < 5) && ok;
        ok = show('city', !d.city || d.city.trim().length < 2) && ok;
        ok = show('zip', !/^\d{5}$/.test(d.zip || '')) && ok;
        ok = show('date', !d.date || d.date < dateEl.min) && ok;
        ok = show('window', !d.window) && ok;
      }
      if (n === 4) {
        ok = show('name', !d.name || d.name.trim().length < 2) && ok;
        ok = show('phone', digits(d.phone).replace(/^1/, '').length !== 10) && ok;
        ok = show('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) && ok;
      }
      if (!ok) { const first = $('.field-error:not([hidden])', form); if (first) first.closest('.field, fieldset').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return ok;
    }

    const optLabel = (id) => { const el = $('#' + id); return el && el.selectedOptions[0] ? el.selectedOptions[0].textContent : ''; };
    function review() {
      const d = data(); const t = total(d);
      const addonRows = d.addons.map(id => P.addons.find(a => a.id === id)).filter(Boolean).map(a => `<div class="row"><span>${a.label}</span><span>+${money(a.price)}</span></div>`).join('');
      $('#review-card').innerHTML = `
        <div class="row"><span>Service</span><span>Dryer vent cleaning <button type="button" class="edit" data-go="1">edit</button></span></div>
        <div class="row"><span>Vent exit</span><span>${ventLabel(d.ventLocation)} — ${money(P.base[d.ventLocation].price)}</span></div>
        ${addonRows}
        <div class="row"><span>Dryer</span><span>${optLabel('dryerType')} · ${optLabel('homeType')} · ${optLabel('laundryFloor')} laundry <button type="button" class="edit" data-go="2">edit</button></span></div>
        ${d.symptoms.length ? `<div class="row"><span>Noticed</span><span>${d.symptoms.join(', ')}</span></div>` : ''}
        <div class="row"><span>When</span><span>${fmtDate(d.date)}, ${d.window}${d.flexible ? ' (flexible)' : ''} <button type="button" class="edit" data-go="3">edit</button></span></div>
        <div class="row"><span>Where</span><span>${d.address}, ${d.city} ${d.zip}</span></div>
        <div class="row"><span>Contact</span><span>${d.name} · ${formatPhone(d.phone)} · ${d.email} <button type="button" class="edit" data-go="4">edit</button></span></div>
        <div class="row total"><span>Total${d.ventLocation === 'unsure' ? ' (from)' : ''}</span><span>${money(t)}</span></div>`;
      $$('.edit', $('#review-card')).forEach(b => b.addEventListener('click', () => go(+b.dataset.go)));
    }

    let initialised = false;
    function go(n) {
      step = n;
      steps.forEach(s => s.hidden = +s.dataset.step !== n);
      progs.forEach(p => { const k = +p.dataset.step; p.classList.toggle('current', k === n); p.classList.toggle('done', k < n); });
      prevBtn.hidden = n === 1;
      nextBtn.hidden = n === LAST; submitBtn.hidden = n !== LAST;
      if (mobileNext) mobileNext.textContent = n === LAST ? 'Confirm booking' : 'Continue';
      if (n === LAST) review();
      save();
      if (initialised) { const anchor = $('#bk-progress') || form; window.scrollTo({ top: Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - 96), behavior: reduced ? 'auto' : 'smooth' }); }
      initialised = true;
      if (n === 2) setTimeout(() => { const f = $('#dryerType'); f && f.focus({ preventScroll: true }); }, 350);
    }
    const next = () => { if (step < LAST && valid(step)) go(step + 1); else if (step === LAST) form.requestSubmit(); };
    nextBtn.addEventListener('click', next);
    if (mobileNext) mobileNext.addEventListener('click', next);
    prevBtn.addEventListener('click', () => go(step - 1));
    progs.forEach(p => p.addEventListener('click', () => { const k = +p.dataset.step; if (k < step) go(k); }));
    // auto-advance after choosing vent type (feels fast on mobile)
    $$('input[name=ventLocation]', form).forEach(r => r.addEventListener('change', () => { show('ventLocation', false); if (step === 1) setTimeout(() => go(2), 350); }));
    // Enter key = next, not submit (except final step)
    form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && step < LAST) { e.preventDefault(); next(); } });
    if (mobileToggle && side) mobileToggle.addEventListener('click', () => { const o = side.classList.toggle('open'); mobileToggle.setAttribute('aria-expanded', String(o)); });

    // Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!valid(1) || !valid(3) || !valid(4)) return;
      const d = data();
      const err = $('#submit-error'); err.hidden = true;
      submitBtn.disabled = true; if (mobileNext) mobileNext.disabled = true; submitBtn.textContent = 'Booking…';
      const confirmationNumber = 'DV-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      const payload = {
        type: 'booking', confirmationNumber,
        ...d, phone: formatPhone(d.phone),
        ventLabel: ventLabel(d.ventLocation), basePrice: P.base[d.ventLocation].price,
        addonLabels: d.addons.map(id => (P.addons.find(a => a.id === id) || {}).label).filter(Boolean),
        total: total(d), dateLabel: fmtDate(d.date), smsOk: d.smsOk === 'yes', flexible: d.flexible === 'yes',
        source: location.href, createdAt: new Date().toISOString()
      };
      try {
        const r = await fetch('/api/process-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        if (!r.ok) throw new Error('Server responded ' + r.status);
        sessionStorage.setItem('dvp_last_booking', JSON.stringify(payload));
        localStorage.removeItem(KEY);
        location.href = '/confirmation.html?c=' + encodeURIComponent(confirmationNumber);
      } catch (ex) {
        // Fallback: still show confirmation page but flag that we'll call to confirm, and open an email draft
        sessionStorage.setItem('dvp_last_booking', JSON.stringify({ ...payload, offline: true }));
        err.hidden = false; err.innerHTML = `We couldn't reach our booking server. Please call or text <a href="tel:${P.phone.replace(/\D/g, '')}">${P.phone}</a>, or <a href="${mailto(payload)}">email the request</a>. Your details are saved.`;
        submitBtn.disabled = false; if (mobileNext) mobileNext.disabled = false; submitBtn.textContent = 'Confirm booking';
      }
    });
    function formatPhone(p) { const d = digits(p).replace(/^1(?=\d{10}$)/, ''); return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p; }
    function mailto(b) { const body = `Booking request ${b.confirmationNumber}%0A${b.ventLabel}%0A${b.dateLabel} ${b.window}%0A${b.address}, ${b.city} ${b.zip}%0A${b.name} ${b.phone}%0ATotal ${money(b.total)}`; return `mailto:?subject=Dryer vent cleaning request&body=${body}`; }

    update(); go(step);
  }

  // ---------- Confirmation page ----------
  const confNum = $('#conf-number');
  if (confNum) {
    let b = null; try { b = JSON.parse(sessionStorage.getItem('dvp_last_booking') || 'null'); } catch {}
    const c = new URLSearchParams(location.search).get('c');
    confNum.textContent = c || (b && b.confirmationNumber) || '—';
    const det = $('#conf-details');
    if (b && det) {
      det.innerHTML = `
        ${b.offline ? '<p class="field-error">We could not reach our server, so this is not confirmed yet. Please call or text us to lock it in.</p>' : ''}
        <div class="row"><span>Vent</span><span>${b.ventLabel}</span></div>
        ${b.addonLabels && b.addonLabels.length ? `<div class="row"><span>Add-ons</span><span>${b.addonLabels.join(', ')}</span></div>` : ''}
        <div class="row"><span>When</span><span>${b.dateLabel}, ${b.window}</span></div>
        <div class="row"><span>Where</span><span>${b.address}, ${b.city} ${b.zip}</span></div>
        <div class="row"><span>Contact</span><span>${b.name} · ${b.phone}</span></div>
        <div class="row total"><span>Total${b.ventLocation === 'unsure' ? ' (from)' : ''}</span><span>${money(b.total)}</span></div>`;
      const cal = $('#conf-cal');
      if (cal && b.date) {
        const [y, m, d] = b.date.split('-'); const hh = (b.window.match(/^(\d+)/) || [])[1] || '8';
        const h24 = (/PM/.test(b.window.split('–')[0]) && +hh !== 12) ? +hh + 12 : +hh;
        const start = `${y}${m}${d}T${String(h24).padStart(2, '0')}0000`, end = `${y}${m}${d}T${String(h24 + 2).padStart(2, '0')}0000`;
        cal.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Dryer vent cleaning – ' + (window.DVP_PRICING || {}).name)}&dates=${start}/${end}&details=${encodeURIComponent('Confirmation ' + b.confirmationNumber + '. Arrival window ' + b.window)}&location=${encodeURIComponent(b.address + ', ' + b.city + ' MN ' + b.zip)}&ctz=America/Chicago`;
      }
    } else if (det) det.innerHTML = '<p class="muted">Details were sent to your email.</p>';
  }
})();
