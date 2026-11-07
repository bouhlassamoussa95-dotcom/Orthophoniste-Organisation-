/* ==========================================================================
   SpeechCare UX layer (non-destructive).
   - Light haptics (Capacitor Haptics, navigator.vibrate fallback)
   - Immediate press states (pointerdown, <50ms)
   - Native <select> -> bottom sheet / anchored dropdown overlays
   - Two-stage confirmation for destructive actions
   - Drawer easing, AI panel drag handle, momentum/snap centering
   Loaded after the main script; wraps globals instead of rewriting them.
   ========================================================================== */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var q = function (s, r) { return (r || doc).querySelector(s); };
  var qa = function (s, r) { return Array.prototype.slice.call((r || doc).querySelectorAll(s)); };
  var lang = function () { try { return (PR && PR.lang) || 'en'; } catch (e) { return 'en'; } };
  var tr = function (en, fr, ar) { var l = lang(); return l === 'fr' ? fr : l === 'ar' ? ar : en; };
  var isRTL = function () { return root.dir === 'rtl'; };
  var escH = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var icon = function (n, s) { try { return ic(n, s); } catch (e) { return ''; } };

  /* ------------------------------------------------------------------ haptics */
  var lastH = 0;
  function plug() { var c = window.Capacitor; return c && c.Plugins && c.Plugins.Haptics; }
  function haptic(kind) {
    var now = Date.now(); if (now - lastH < 35) return; lastH = now;
    try { var h = plug(); if (h && h.impact) { h.impact({ style: kind || 'LIGHT' }); return; } } catch (e) {}
    try { if (navigator.vibrate) navigator.vibrate(kind === 'MEDIUM' ? 18 : 10); } catch (e) {}
  }
  function warnHaptic() {
    try { var h = plug(); if (h && h.notification) { h.notification({ type: 'WARNING' }); return; } } catch (e) {}
    try { if (navigator.vibrate) navigator.vibrate([14, 50, 14]); } catch (e) {}
  }

  /* ----------------------------------------------------------- press feedback */
  var PRESS = 'button,a[href],summary,[onclick],[role=button],.ck label,.ovopt';
  var SKIP = '.sheet,.bk,.ovb,.ovd-bk,#agp,.dr,input,textarea,select,.grab,.ux-grab,.ovgrab';
  var pEl = null, pX = 0, pY = 0, pT = 0, pMoved = false, lastTap = { x: 0, y: 0, t: 0 };
  function pressable(t) {
    if (!t || !t.closest) return null;
    var el = t.closest(PRESS);
    if (!el || el.matches(SKIP) || el.disabled) return null;
    if (el.getAttribute('onclick') === '') return null;           // inert tiles: no false affordance
    return el;
  }
  function clearPress(now) {
    var el = pEl; pEl = null; if (!el) return;
    var wait = now ? 0 : Math.max(0, 70 - (Date.now() - pT));       // keep state visible long enough to be seen
    if (wait) setTimeout(function () { el.classList.remove('ux-pressed'); }, wait); else el.classList.remove('ux-pressed');
  }
  doc.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    lastTap = { x: e.clientX, y: e.clientY, t: Date.now() };
    var el = pressable(e.target); if (!el) return;
    clearPress(true); pEl = el; pX = e.clientX; pY = e.clientY; pT = Date.now(); pMoved = false;
    el.classList.add('ux-pressed');
  }, true);
  doc.addEventListener('pointermove', function (e) {
    if (!pEl) return;
    if (Math.abs(e.clientX - pX) > 10 || Math.abs(e.clientY - pY) > 10) { pMoved = true; clearPress(true); }
  }, true);
  doc.addEventListener('pointerup', function () {
    if (!pEl) return;
    if (!pMoved && !pEl.matches('.ovopt,[data-danger]')) haptic('LIGHT');          // confirmed tap (never on scroll gestures)
    clearPress(false);
  }, true);
  doc.addEventListener('pointercancel', function () { clearPress(true); }, true);

  /* -------------------------------------------------- overlay infrastructure */
  var cur = null;                                                    // {kind, close()}
  function closeOverlay() { if (!cur) return false; cur.close(); return true; }

  function listItems(box, items, value, query) {
    var z = (query || '').toLowerCase().trim(), shown = 0, h = '';
    items.forEach(function (it, i) {
      if (z && String(it.t).toLowerCase().indexOf(z) < 0) return;
      shown++;
      h += '<button type="button" class="ovopt' + (String(it.v) === String(value) ? ' on' : '') + '" role="option" aria-selected="' + (String(it.v) === String(value)) + '" data-i="' + i + '"><span>' + escH(it.t) + '</span>' + icon('check', 18) + '</button>';
    });
    box.innerHTML = h || '<div class="ovempty">' + tr('No results', 'Aucun résultat', 'لا توجد نتائج') + '</div>';
    return shown;
  }

  /* Modal bottom sheet: slide-up, drag handle, blur backdrop, optional search */
  function sheetPicker(o) {
    closeOverlay();
    var el = doc.createElement('div'); el.className = 'ovb';
    el.innerHTML = '<div class="ovs" role="dialog" aria-modal="true" aria-label="' + escH(o.title || '') + '"><div class="ovgrab" aria-hidden="true"></div>' +
      (o.title ? '<div class="ovh">' + escH(o.title) + '</div>' : '') +
      (o.search ? '<div class="ovsearch"><input type="search" autocomplete="off" enterkeyhint="search" placeholder="' + escH(tr('Search…', 'Rechercher…', 'بحث…')) + '"></div>' : '') +
      '<div class="ovlist" role="listbox"></div></div>';
    doc.body.appendChild(el);
    var sh = q('.ovs', el), list = q('.ovlist', el), inp = q('input', el), closed = false;
    listItems(list, o.items, o.value, '');
    if (inp) inp.addEventListener('input', function () { listItems(list, o.items, o.value, inp.value); });
    function close(cb) {
      if (closed) return; closed = true; cur = null;
      el.classList.add('out'); el.classList.remove('in'); sh.style.transform = '';
      setTimeout(function () { el.remove(); if (o.onClose) o.onClose(); if (typeof cb === 'function') cb(); }, 210);
    }
    list.addEventListener('click', function (e) {
      var b = e.target.closest('.ovopt'); if (!b) return;
      var it = o.items[+b.dataset.i]; haptic('LIGHT');
      if (o.onPick) o.onPick(it.v, it); close();
    });
    el.addEventListener('click', function (e) { if (e.target === el) close(); });
    /* drag-down on handle / title */
    var y0 = 0, dy = 0, drag = false, t0 = 0;
    function ds(e) { if (!e.target.closest('.ovgrab,.ovh')) return; drag = true; y0 = e.touches[0].clientY; t0 = Date.now(); dy = 0; sh.style.transition = 'none'; }
    function dm(e) { if (!drag) return; dy = Math.max(0, e.touches[0].clientY - y0); sh.style.transform = 'translateY(' + dy + 'px)'; }
    function de() { if (!drag) return; drag = false; sh.style.transition = ''; var v = dy / Math.max(1, Date.now() - t0); if (dy > 90 || v > .6) close(); else sh.style.transform = ''; dy = 0; }
    sh.addEventListener('touchstart', ds, { passive: true }); sh.addEventListener('touchmove', dm, { passive: true });
    sh.addEventListener('touchend', de); sh.addEventListener('touchcancel', de);
    void el.offsetWidth; requestAnimationFrame(function () { el.classList.add('in'); var on = q('.ovopt.on', list); if (on) list.scrollTop = Math.max(0, on.offsetTop - list.clientHeight / 2 + on.offsetHeight / 2); });
    cur = { kind: 'sheet', close: close };
    return cur;
  }

  /* Anchored dropdown: scales in from the tap origin */
  function dropPicker(o) {
    closeOverlay();
    var wrap = doc.createElement('div'), bk = doc.createElement('div'), m = doc.createElement('div'), closed = false;
    bk.className = 'ovd-bk'; m.className = 'ovd'; m.setAttribute('role', 'listbox');
    listItems(m, o.items, o.value, '');
    wrap.appendChild(bk); wrap.appendChild(m); doc.body.appendChild(wrap);
    var r = o.anchor.getBoundingClientRect(), vw = root.clientWidth || innerWidth, vh = innerHeight, M = 8;
    var w = Math.min(Math.max(r.width, 190), vw - 2 * M);
    m.style.width = w + 'px'; m.style.maxHeight = Math.round(vh * .5) + 'px';
    var h = Math.min(m.scrollHeight, vh * .5), below = vh - r.bottom - M - 6, above = r.top - M - 6, top;
    if (h <= below || below >= above) { top = r.bottom + 6; h = Math.min(h, Math.max(120, below)); }
    else { h = Math.min(h, above); top = r.top - 6 - h; }
    var left = isRTL() ? r.right - w : r.left; left = Math.max(M, Math.min(left, vw - w - M));
    m.style.left = left + 'px'; m.style.top = Math.max(M, top) + 'px'; m.style.maxHeight = Math.round(h) + 'px';
    var fresh = Date.now() - lastTap.t < 1200, ox = fresh ? lastTap.x : r.left + r.width / 2, oy = fresh ? lastTap.y : r.top + r.height / 2;
    ox = Math.max(0, Math.min(w, ox - left)); oy = Math.max(0, Math.min(h, oy - Math.max(M, top)));
    m.style.transformOrigin = ox + 'px ' + oy + 'px';                  // scale-in from the finger
    function close(cb) {
      if (closed) return; closed = true; cur = null; m.classList.add('out'); m.classList.remove('in');
      setTimeout(function () { wrap.remove(); if (o.onClose) o.onClose(); if (typeof cb === 'function') cb(); }, 115);
    }
    m.addEventListener('click', function (e) {
      var b = e.target.closest('.ovopt'); if (!b) return; var it = o.items[+b.dataset.i]; haptic('LIGHT');
      if (o.onPick) o.onPick(it.v, it); close();
    });
    bk.addEventListener('click', function (e) { e.preventDefault(); close(); });
    void m.offsetWidth; requestAnimationFrame(function () { m.classList.add('in'); var on = q('.ovopt.on', m); if (on) m.scrollTop = Math.max(0, on.offsetTop - 40); });
    cur = { kind: 'drop', close: close };
    return cur;
  }
  window.addEventListener('resize', function () { if (cur && cur.kind === 'drop') cur.close(); });

  /* -------------------------------------------- native <select> replacement */
  var CHEV = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 9l7 7 7-7"/></svg>';
  var valDesc = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value');
  function titleOf(s) {
    var p = s.previousElementSibling;
    while (p && p.tagName !== 'LABEL') p = p.previousElementSibling;
    if (!p && s.parentElement) { var l = q('label', s.parentElement); if (l) p = l; }
    return p ? p.textContent.trim() : '';
  }
  function enhanceSelect(s) {
    if (s.dataset.ov) return; s.dataset.ov = '1';
    var b = doc.createElement('button'); b.type = 'button'; b.className = 'ovsel'; b.setAttribute('aria-haspopup', 'listbox'); b.setAttribute('aria-expanded', 'false');
    b.innerHTML = '<span class="ovsel-t"></span>' + CHEV;
    s.classList.add('ux-native'); s.tabIndex = -1; s.setAttribute('aria-hidden', 'true');
    s.after(b);
    function refresh() {
      var o = s.options[s.selectedIndex]; q('.ovsel-t', b).textContent = o ? o.text : '';
      var t = titleOf(s); if (t) b.setAttribute('aria-label', t + ': ' + (o ? o.text : ''));
    }
    Object.defineProperty(s, 'value', { configurable: true, get: function () { return valDesc.get.call(this); }, set: function (v) { valDesc.set.call(this, v); refresh(); } });
    s.addEventListener('change', refresh);
    refresh();
    b.addEventListener('click', function () {
      var items = qa('option', s).map(function (o) { return { v: o.value, t: o.text }; });
      var asSheet = s.dataset.ovMode === 'sheet' || items.length > 7;
      b.setAttribute('aria-expanded', 'true');
      var pick = function (v) { if (valDesc.get.call(s) !== String(v)) { s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); } };
      var base = { items: items, value: s.value, onPick: pick, onClose: function () { b.setAttribute('aria-expanded', 'false'); } };
      if (asSheet) sheetPicker(Object.assign({ title: titleOf(s), search: s.dataset.ovMode === 'sheet' || items.length > 7 }, base));
      else dropPicker(Object.assign({ anchor: b }, base));
    });
  }
  function scan() {
    qa('select:not([data-ov])').forEach(enhanceSelect);
    qa('[onclick]:not(button):not(a):not(input):not(select):not(textarea):not([role])').forEach(function (n) {
      if (n.matches(SKIP) || n.getAttribute('onclick') === '') return; n.setAttribute('role', 'button'); n.tabIndex = 0;
    });
  }
  new MutationObserver(scan).observe(doc.body, { childList: true, subtree: true });
  scan();

  /* AI panel: patient context uses a bottom sheet instead of an inline menu */
  var _agTog = window.agPatientToggle;
  if (typeof _agTog === 'function') window.agPatientToggle = function () {
    var items = [{ v: '', t: agU('general') }].concat(S.p.map(function (p) { return { v: p.id, t: rn(p) }; }));
    var btn = q('#agPatientBtn'); if (btn) btn.setAttribute('aria-expanded', 'true');
    sheetPicker({ title: agU('choose'), items: items, value: AG.pid || '', search: true,
      onPick: function (v) { agPatientPick(v); }, onClose: function () { if (btn) btn.setAttribute('aria-expanded', 'false'); } });
  };

  /* AI panel: grow from the AI button (transform-origin = button centre) */
  var _agOpen = window.agOpen;
  if (typeof _agOpen === 'function') window.agOpen = function () {
    var orb = q('#agent .orb'), r = orb && orb.getBoundingClientRect(), res = _agOpen.apply(this, arguments);
    var box = q('.agbox'), host = q('#agp');
    if (box && host && r && r.width) {
      var x = r.left + r.width / 2 - box.offsetLeft - host.offsetLeft, y = r.top + r.height / 2 - box.offsetTop - host.offsetTop;
      box.style.transformOrigin = Math.round(x) + 'px ' + Math.round(y) + 'px';
    }
    if (box) void box.offsetWidth;                                  // commit the shrunken start state so the pop always animates
    haptic('LIGHT');
    return res;
  };

  /* AI panel: drag handle + swipe-down to close (blur backdrop is CSS) */
  var _agEns = window.agEnsure;
  if (typeof _agEns === 'function') window.agEnsure = function () {
    _agEns.apply(this, arguments);
    var box = q('.agbox'); if (!box || q('.ux-grab', box)) return;
    box.insertAdjacentHTML('afterbegin', '<div class="ux-grab" aria-hidden="true"></div>');
    var y0 = 0, dy = 0, drag = false, t0 = 0;
    box.addEventListener('touchstart', function (e) {
      if (!e.target.closest('.ux-grab,.agh') || e.target.closest('button')) return;
      drag = true; y0 = e.touches[0].clientY; t0 = Date.now(); dy = 0; box.style.transition = 'none';
    }, { passive: true });
    box.addEventListener('touchmove', function (e) { if (!drag) return; dy = Math.max(0, e.touches[0].clientY - y0); box.style.transform = 'translate3d(0,' + dy + 'px,0)'; }, { passive: true });
    function end() {
      if (!drag) return; drag = false; var v = dy / Math.max(1, Date.now() - t0);
      box.style.transition = ''; box.style.transform = '';
      if (dy > 110 || v > .65) agClose();
      dy = 0;
    }
    box.addEventListener('touchend', end); box.addEventListener('touchcancel', end);
  };

  /* ------------------------------------------------------- side drawer easing */
  var _od = window.od;
  if (typeof _od === 'function') window.od = function () {
    var r = _od.apply(this, arguments);
    var a = q('#dr aside'); if (a) void a.offsetWidth;               // commit closed state so the 220ms slide always runs
    return r;
  };

  /* ---------------------------------------------- tab-switch haptics on swipe */
  var _nav = window.nav;
  if (typeof _nav === 'function') window.nav = function (t) {
    try { if (typeof MAIN !== 'undefined' && MAIN.indexOf(t) >= 0 && t !== V.t && Date.now() - lastH > 400) haptic('LIGHT'); } catch (e) {}
    return _nav.apply(this, arguments);
  };

  /* -------------------------------------- momentum scrollers: keep active centred */
  function centre(box, el) {
    var b = box.getBoundingClientRect(), r = el.getBoundingClientRect();
    box.scrollLeft += (r.left + r.width / 2) - (b.left + b.width / 2);   // horizontal only: never moves the page
  }
  function post() {
    qa('.sg').forEach(function (sg) { var s = q('.dc.sel', sg) || q('.dc.tod', sg); if (s) centre(sg, s); });
    qa('.fltr,.act-filter').forEach(function (f) { var on = q('.on', f); if (on) centre(f, on); });
  }
  var _go = window.go;
  if (typeof _go === 'function') window.go = function () { var r = _go.apply(this, arguments); post(); return r; };

  /* --------------------------------------- two-stage destructive confirmation */
  var armed = null, armT = 0;
  function disarm() {
    if (!armed) return; var b = armed; armed = null; clearTimeout(armT);
    b.classList.remove('armed'); b.removeAttribute('aria-live'); if (b._ux != null) { b.innerHTML = b._ux; b._ux = null; }
  }
  function arm(b) {
    disarm(); armed = b; b.classList.add('armed'); b.setAttribute('aria-live', 'polite');
    if (!b.classList.contains('ib')) {
      b._ux = b.innerHTML;
      b.innerHTML = icon('x2', 16) + ' ' + escH(tr('Tap again to confirm', 'Appuyez encore pour confirmer', 'اضغط مرة أخرى للتأكيد'));
    }
    warnHaptic(); armT = setTimeout(disarm, 3600);
  }
  doc.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('[data-danger]');
    if (!b) { disarm(); return; }
    if (b.classList.contains('armed')) { armed = null; clearTimeout(armT); haptic('MEDIUM'); return; }   // 2nd tap: let the real action run
    e.stopImmediatePropagation(); e.preventDefault(); arm(b);
  }, true);

  /* ----------------------------------------------- row helpers used by cards */
  window.aptGo = function (e, pid, aid, inPatient) {
    if (e && e.target && e.target.closest('a,button')) return;
    if (inPatient) apForm(aid); else openPt(pid);
  };
  window.coRow = function (e, id) { if (e && e.target && e.target.closest('a,button')) return; coForm(id); };

  window.UX = { haptic: haptic, closeOverlay: closeOverlay, sheetPicker: sheetPicker, dropPicker: dropPicker };
})();
