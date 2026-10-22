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
    const list = $('#admin-list'), tokenInput = $('#admin-token');
    try { const t = sessionStorage.getItem('dv_admin'); if (t) tokenInput.value = t; } catch {}
    const token = () => tokenInput.value.trim();
    const api = async (path, opts = {}) => {
      const r = await fetch(path, { ...opts, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token(), ...(opts.headers || {}) } });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || ('HTTP ' + r.status));
      return d;
    };
    const esc = (v) => String(v ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
    const badge = (b) => {
      const st = b.status || 'new';
      const label = st === 'paid' ? `Paid ${money(b.paidAmount ?? b.finalTotal ?? b.total)}${b.paymentMethod ? ' · ' + b.paymentMethod.replace('-', ' ') : ''}` : st === 'cancelled' ? 'Cancelled' : st === 'done' ? 'Done · unpaid' : 'Booked';
      return `<span class="badge badge-${st}">${esc(label)}</span>`;
    };
    const card = (b) => {
      const due = b.finalTotal ?? b.total;
      const payUrl = location.origin + '/pay?c=' + encodeURIComponent(b.confirmationNumber);
      return `<div class="admin-item${b.status === 'cancelled' ? ' is-cancelled' : ''}" data-conf="${esc(b.confirmationNumber)}">
        <div class="admin-head"><div><strong>${esc(b.confirmationNumber)}</strong> ${badge(b)}</div><div class="muted small">${b.createdAt ? new Date(b.createdAt).toLocaleString() : ''}</div></div>
        <div class="admin-grid">
          <div><div class="k">Customer</div>${esc(b.name)}<br><a href="tel:${esc(String(b.phone || '').replace(/\D/g, ''))}">${esc(b.phone)}</a><br><a href="mailto:${esc(b.email)}">${esc(b.email)}</a></div>
          <div><div class="k">When / where</div><strong>${esc(b.dateLabel || b.date)}</strong>, ${esc(b.window)}${b.flexible ? ' <span class="muted">(flexible)</span>' : ''}<br><a href="https://maps.google.com/?q=${encodeURIComponent((b.address || '') + ', ' + (b.city || '') + ' MN ' + (b.zip || ''))}" target="_blank" rel="noopener">${esc(b.address)}, ${esc(b.city)} ${esc(b.zip)}</a></div>
          <div><div class="k">Job</div>${esc(b.ventLabel)}${b.ventLocation === 'unsure' ? ' <span class="muted">(confirm on site)</span>' : ''}${b.addonLabels && b.addonLabels.length ? '<br>+ ' + b.addonLabels.map(esc).join('<br>+ ') : ''}${b.access ? `<br><span class="muted">Access: ${esc(b.access)}</span>` : ''}${b.notes ? `<br><span class="muted">Notes: ${esc(b.notes)}</span>` : ''}</div>
          <div><div class="k">Money</div>Booked ${money(b.total)}${b.finalTotal != null && b.finalTotal !== b.total ? ` · final <strong>${money(b.finalTotal)}</strong>` : ''}
            ${b.status === 'paid' ? '' : `<label class="admin-amount">Final amount <span class="prefix">$</span><input type="number" min="0" max="5000" step="1" value="${esc(due)}" data-act="amount"></label><button class="btn btn-ghost btn-sm" data-act="save-amount">Save</button>`}
          </div>
        </div>
        <div class="admin-actions">
          ${b.status === 'paid' ? '' : `<select data-act="method"><option value="cash">Cash</option><option value="zelle">Zelle</option><option value="venmo">Venmo</option><option value="card-in-person">Card in person</option></select><button class="btn btn-primary btn-sm" data-act="mark-paid">Mark paid</button>`}
          <button class="btn btn-ghost btn-sm" data-act="copy-link" data-url="${esc(payUrl)}">Copy pay link</button>
          <a class="btn btn-ghost btn-sm" href="sms:${esc(String(b.phone || '').replace(/\D/g, ''))}?&body=${encodeURIComponent(`Hi ${(b.name || '').split(' ')[0]}, here's your Clear Vent payment link for ${money(due)}: ${payUrl} — or pay cash/Zelle/Venmo. Thanks!`)}">Text pay link</a>
          ${b.status === 'cancelled' ? `<button class="btn btn-ghost btn-sm" data-act="status" data-status="new">Restore</button>` : b.status === 'paid' && b.paymentMethod !== 'stripe' ? `<button class="btn btn-ghost btn-sm" data-act="status" data-status="done">Undo paid</button>` : b.status !== 'paid' ? `<button class="btn btn-ghost btn-sm danger" data-act="status" data-status="cancelled">Cancel booking</button>` : ''}
          <span class="admin-msg muted small" aria-live="polite"></span>
        </div>
      </div>`;
    };
    let bookings = [];
    const render = () => {
      const show = $('#admin-show') ? $('#admin-show').value : 'open';
      const rows = bookings.filter(b => show === 'all' ? true : show === 'paid' ? b.status === 'paid' : (b.status !== 'paid' && b.status !== 'cancelled'));
      list.innerHTML = rows.length ? rows.map(card).join('') : '<p class="muted">Nothing here.</p>';
    };
    const load = async () => {
      list.textContent = 'Loading…';
      try { ({ bookings } = await api('/api/list-bookings')); try { sessionStorage.setItem('dv_admin', token()); } catch {} render(); }
      catch (err) { list.textContent = 'Could not load (' + err.message + '). Check the token.'; }
    };
    adminForm.addEventListener('submit', (e) => { e.preventDefault(); load(); });
    if ($('#admin-show')) $('#admin-show').addEventListener('change', render);
    if (token()) load();
    list.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-act]'); if (!btn || btn.tagName === 'INPUT' || btn.tagName === 'SELECT') return;
      const item = btn.closest('.admin-item'), conf = item.dataset.conf, msg = $('.admin-msg', item);
      const update = async (payload) => {
        btn.disabled = true; msg.textContent = 'Saving…';
        try { const { booking } = await api('/api/update-booking', { method: 'POST', body: JSON.stringify({ confirmationNumber: conf, ...payload }) }); bookings = bookings.map(b => b.confirmationNumber === conf ? booking : b); render(); }
        catch (err) { msg.textContent = err.message; btn.disabled = false; }
      };
      const act = btn.dataset.act;
      if (act === 'save-amount') { const v = $('[data-act=amount]', item).value; await update({ finalTotal: v === '' ? null : Number(v) }); }
      else if (act === 'mark-paid') { const v = $('[data-act=amount]', item)?.value; await update({ status: 'paid', paymentMethod: $('[data-act=method]', item).value, ...(v !== undefined && v !== '' ? { finalTotal: Number(v) } : {}) }); }
      else if (act === 'status') { if (btn.dataset.status === 'cancelled' && !confirm('Cancel booking ' + conf + '?')) return; await update({ status: btn.dataset.status }); }
      else if (act === 'copy-link') { try { await navigator.clipboard.writeText(btn.dataset.url); msg.textContent = 'Link copied'; } catch { msg.textContent = btn.dataset.url; } }
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
    let step = 1, maxStep = 1; const LAST = steps.length;

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
      if (n === 2) {
        ok = show('date', !d.date || d.date < dateEl.min) && ok;
        ok = show('window', !d.window) && ok;
        ok = show('address', !d.address || d.address.trim().length < 5) && ok;
        ok = show('city', !d.city || d.city.trim().length < 2) && ok;
        ok = show('zip', !/^\d{5}$/.test(d.zip || '')) && ok;
      }
      if (n === 3) {
        ok = show('name', !d.name || d.name.trim().length < 2) && ok;
        ok = show('phone', digits(d.phone).replace(/^1/, '').length !== 10) && ok;
        ok = show('email', !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email || '')) && ok;
      }
      if (!ok) { const first = $('.field-error:not([hidden])', form); if (first) first.closest('.field, fieldset').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
      return ok;
    }

    function review() {
      const d = data(); const t = total(d);
      $('#review-card').innerHTML = `
        <div class="row"><span>Vent</span><span>${ventLabel(d.ventLocation)} — ${money(P.base[d.ventLocation].price)} <button type="button" class="edit" data-go="1">edit</button></span></div>
        <div class="row"><span>When</span><span>${fmtDate(d.date)}, ${d.window} <button type="button" class="edit" data-go="2">edit</button></span></div>
        <div class="row"><span>Where</span><span>${d.address}, ${d.city} ${d.zip}</span></div>
        <div class="row total"><span>Total${d.ventLocation === 'unsure' ? ' (from)' : ''}</span><span>${money(t)}</span></div>`;
      $$('.edit', $('#review-card')).forEach(b => b.addEventListener('click', () => go(+b.dataset.go)));
    }

    let initialised = false;
    function go(n) {
      step = n; maxStep = Math.max(maxStep, n);
      steps.forEach(s => s.hidden = +s.dataset.step !== n);
      progs.forEach(p => { const k = +p.dataset.step; p.classList.toggle('current', k === n); p.classList.toggle('done', k < n); p.classList.toggle('reached', k !== n && k <= maxStep); });
      prevBtn.hidden = n === 1;
      nextBtn.hidden = n === LAST; submitBtn.hidden = n !== LAST;
      if (mobileNext) mobileNext.textContent = n === LAST ? 'Confirm booking' : 'Continue';
      if (n === LAST) review();
      save();
      if (initialised) { const anchor = $('#bk-progress') || form; window.scrollTo({ top: Math.max(0, anchor.getBoundingClientRect().top + window.scrollY - 96), behavior: reduced ? 'auto' : 'smooth' }); }
      initialised = true;
    }
    const next = () => { if (step < LAST && valid(step)) go(step + 1); else if (step === LAST) form.requestSubmit(); };
    nextBtn.addEventListener('click', next);
    if (mobileNext) mobileNext.addEventListener('click', next);
    prevBtn.addEventListener('click', () => go(step - 1));
    // Progress tabs: any step already visited is clickable; jumping forward re-checks the steps in between.
    progs.forEach(p => p.addEventListener('click', () => { const k = +p.dataset.step; if (k === step || k > maxStep) return; if (k < step) return go(k); for (let i = step; i < k; i++) if (!valid(i)) return; go(k); }));
    // auto-advance after choosing vent type (feels fast on mobile)
    $$('input[name=ventLocation]', form).forEach(r => r.addEventListener('change', () => { show('ventLocation', false); if (step === 1) setTimeout(() => go(2), 350); }));
    // Enter key = next, not submit (except final step)
    form.addEventListener('keydown', (e) => { if (e.key === 'Enter' && e.target.tagName !== 'TEXTAREA' && step < LAST) { e.preventDefault(); next(); } });
    if (mobileToggle && side) mobileToggle.addEventListener('click', () => { const o = side.classList.toggle('open'); mobileToggle.setAttribute('aria-expanded', String(o)); });

    // Submit
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!valid(1) || !valid(2) || !valid(3)) return;
      const d = data();
      const err = $('#submit-error'); err.hidden = true;
      submitBtn.disabled = true; if (mobileNext) mobileNext.disabled = true; submitBtn.textContent = 'Booking…';
      const confirmationNumber = 'DV-' + Math.random().toString(36).slice(2, 7).toUpperCase();
      const payload = {
        type: 'booking', confirmationNumber,
        ...d, phone: formatPhone(d.phone),
        ventLabel: ventLabel(d.ventLocation), basePrice: P.base[d.ventLocation].price,
        addonLabels: d.addons.map(id => (P.addons.find(a => a.id === id) || {}).label).filter(Boolean),
        addonItems: d.addons.map(id => P.addons.find(a => a.id === id)).filter(Boolean).map(a => ({ id: a.id, label: a.label, price: a.price })),
        total: total(d), dateLabel: fmtDate(d.date),
        source: location.href, createdAt: new Date().toISOString()
      };
      try {
        const r = await fetch('/api/process-booking', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
        const out = await r.json().catch(() => ({}));
        if (!r.ok) {
          if (r.status === 400 && Array.isArray(out.fields)) { out.fields.forEach(f => show(f, true)); go(f2step(out.fields[0])); submitBtn.disabled = false; if (mobileNext) mobileNext.disabled = false; submitBtn.textContent = 'Confirm booking'; return; }
          if (r.status === 429) { err.hidden = false; err.textContent = out.error || 'Too many requests. Please call or text us.'; submitBtn.disabled = false; if (mobileNext) mobileNext.disabled = false; submitBtn.textContent = 'Confirm booking'; return; }
          throw new Error('Server responded ' + r.status);
        }
        const saved = { ...payload, ...(out.booking || {}), confirmationNumber: out.confirmationNumber || confirmationNumber };
        sessionStorage.setItem('dvp_last_booking', JSON.stringify(saved));
        localStorage.removeItem(KEY);
        location.href = '/confirmation?c=' + encodeURIComponent(saved.confirmationNumber);
      } catch (ex) {
        // Fallback: still show confirmation page but flag that we'll call to confirm, and open an email draft
        sessionStorage.setItem('dvp_last_booking', JSON.stringify({ ...payload, offline: true }));
        err.hidden = false; err.innerHTML = `We couldn't reach our booking server. Please call or text <a href="tel:${P.phone.replace(/\D/g, '')}">${P.phone}</a>, or <a href="${mailto(payload)}">email the request</a>. Your details are saved.`;
        submitBtn.disabled = false; if (mobileNext) mobileNext.disabled = false; submitBtn.textContent = 'Confirm booking';
      }
    });
    function f2step(f) { return f === 'ventLocation' ? 1 : ['date', 'window', 'address', 'city', 'zip'].includes(f) ? 2 : 3; }
    function formatPhone(p) { const d = digits(p).replace(/^1(?=\d{10}$)/, ''); return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : p; }
    function mailto(b) { const body = `Booking request ${b.confirmationNumber}%0A${b.ventLabel}%0A${b.dateLabel} ${b.window}%0A${b.address}, ${b.city} ${b.zip}%0A${b.name} ${b.phone}%0ATotal ${money(b.total)}`; return `mailto:?subject=Dryer vent cleaning request&body=${body}`; }

    update(); go(step);
  }

  // ---------- Confirmation page ----------
  // ---- Pay online page ----
  const payForm = $('#pay-form');
  if (payForm) {
    const input = $('#pay-conf'), err = $('#pay-error'), sum = $('#pay-summary'), btn = $('#pay-lookup');
    const qc = new URLSearchParams(location.search).get('c'); if (qc) input.value = qc.toUpperCase();
    const showErr = (m) => { err.textContent = m; err.hidden = false; sum.hidden = true; };
    const lookup = async () => {
      const conf = input.value.trim().toUpperCase(); err.hidden = true;
      if (!conf) return showErr('Enter your confirmation number.');
      btn.disabled = true; btn.textContent = 'Looking up…';
      try {
        const r = await fetch('/api/booking-lookup?c=' + encodeURIComponent(conf)); const d = await r.json();
        if (!r.ok) return showErr(d.error || 'Could not find that booking.');
        const paid = d.status === 'paid';
        sum.innerHTML = `
          <div class="row"><span>Booking</span><span>${d.confirmationNumber}${d.firstName ? ' · ' + d.firstName : ''}</span></div>
          <div class="row"><span>Service</span><span>${d.ventLabel}${d.addonLabels.length ? '<br>+ ' + d.addonLabels.join('<br>+ ') : ''}</span></div>
          ${d.dateLabel ? `<div class="row"><span>When</span><span>${d.dateLabel}${d.window ? ', ' + d.window : ''}</span></div>` : ''}
          <div class="row total"><span>${paid ? 'Paid' : 'Amount due'}</span><span>${money(paid ? d.paidAmount : d.amount)}</span></div>
          ${paid ? '<p class="muted small">This booking is already paid. Thank you!</p>' : d.fromPrice ? '<p class="muted small">Roof-vs-wall pricing is confirmed on site. If the final amount differs, we\'ll adjust it before you pay.</p>' : ''}
          ${paid ? '' : `<button type="button" class="btn btn-primary" id="pay-now">Pay ${money(d.amount)} by card</button><p class="muted small">Secure checkout by Stripe. Apple Pay and Google Pay supported.</p>`}`;
        sum.hidden = false;
        const payBtn = $('#pay-now');
        if (payBtn) payBtn.addEventListener('click', async () => {
          payBtn.disabled = true; payBtn.textContent = 'Opening secure checkout…';
          try {
            const r2 = await fetch('/api/create-checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ confirmationNumber: conf }) });
            const d2 = await r2.json();
            if (!r2.ok || !d2.url) throw new Error(d2.error || 'Could not start checkout');
            location.href = d2.url;
          } catch (e) { showErr(e.message); payBtn.disabled = false; payBtn.textContent = 'Pay by card'; }
        });
      } catch { showErr('Something went wrong. Please try again or call us.'); }
      finally { btn.disabled = false; btn.textContent = 'Find my booking'; }
    };
    payForm.addEventListener('submit', (e) => { e.preventDefault(); lookup(); });
    if (qc) lookup();
  }
  const paySuccessConf = $('#pay-success-conf');
  if (paySuccessConf) paySuccessConf.textContent = new URLSearchParams(location.search).get('c') || '—';

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
      const payLink = $('#conf-pay'); if (payLink && b.confirmationNumber) payLink.href = '/pay?c=' + encodeURIComponent(b.confirmationNumber);
      const ics = $('#conf-ics'); if (ics) { if (b.confirmationNumber && !b.offline) ics.href = '/api/calendar?c=' + encodeURIComponent(b.confirmationNumber); else ics.hidden = true; }
      const cal = $('#conf-cal');
      if (cal && b.date) {
        const [y, m, d] = b.date.split('-');
        const parts = String(b.window).split(/[–-]/).map(s => s.trim()); const parse = (s) => { const m2 = s.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i); return m2 ? { h: +m2[1], mer: m2[3] ? m2[3].toUpperCase() : null } : null; };
        const pa = parse(parts[0] || '') || { h: 8, mer: 'AM' }, pb = parse(parts[1] || ''); const merA = pa.mer || (pb && pb.mer) || 'AM', merB = (pb && pb.mer) || merA;
        const to24 = (h, mer) => mer === 'PM' ? (h % 12) + 12 : h % 12; const h24 = to24(pa.h, merA); const e24 = pb ? to24(pb.h, merB) : h24 + 2;
        const start = `${y}${m}${d}T${String(h24).padStart(2, '0')}0000`, end = `${y}${m}${d}T${String(e24 > h24 ? e24 : h24 + 2).padStart(2, '0')}0000`;
        cal.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Dryer vent cleaning – ' + (window.DVP_PRICING || {}).name)}&dates=${start}/${end}&details=${encodeURIComponent('Confirmation ' + b.confirmationNumber + '. Arrival window ' + b.window)}&location=${encodeURIComponent(b.address + ', ' + b.city + ' MN ' + b.zip)}&ctz=America/Chicago`;
      }
    } else if (det) det.innerHTML = '<p class="muted">Details were sent to your email.</p>';
  }
})();
