/* PPM Website – Navigation, Kontaktformular und Steuerung der 3D-Drucker-Demo */
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };

  /* Mobile Navigation */
  var burger = document.querySelector('.burger'), nav = $('mainnav');
  if (burger && nav) {
    burger.addEventListener('click', function () { var o = nav.classList.toggle('open'); burger.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); } });
  }

  /* Kontaktformular -> mailto */
  var form = $('cform');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var f = e.target, g = function (n) { return (f.elements[n].value || '').trim(); };
      var body = 'Name: ' + g('name') + '\nFirma: ' + g('firma') + '\nE-Mail: ' + g('mail') + '\nTelefon: ' + g('tel') + '\n\n' + g('msg');
      window.location.href = 'mailto:info@ppm-pforzheim.com?subject=' + encodeURIComponent('Anfrage: ' + g('thema')) + '&body=' + encodeURIComponent(body);
    });
  }

  /* ================= 3D-Drucker-Demo ================= */
  var canvas = $('printer-canvas');
  if (!canvas || !canvas.getContext || !window.PPMPrinter) return;
  var P = window.PPMPrinter;
  var scene = new P.Scene({ makeCanvas: function (w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }, Path2D: window.Path2D });
  var ctx = canvas.getContext('2d');
  var W = 0, H = 0, awake = 200, visible = false, started = false, userMoved = false, last = 0;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var HOME = { yaw: -0.5, pitch: 0.42, dist: 270, tz: 8 };
  var VIEWS = {
    iso: HOME,
    front: { yaw: 0, pitch: 0.2, dist: 170, tz: 6 },
    side: { yaw: 1.25, pitch: 0.28, dist: 170, tz: 6 },
    top: { yaw: 0, pitch: 1.35, dist: 190, tz: 4 }
  };
  var partDef = function () { return P.PARTS.filter(function (p) { return p.id === scene.def.id; })[0]; };

  function resize() {
    var r = canvas.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = Math.max(320, Math.round(r.width * dpr)), h = Math.max(240, Math.round(r.height * dpr));
    if (w !== W || h !== H) { W = canvas.width = w; H = canvas.height = h; }
    awake = 200;
  }
  window.addEventListener('resize', resize);
  resize();

  var bPlay = $('b-play'), hudStatus = $('hud-status'), hudBar = $('hud-bar'), hudLayer = $('hud-layer'), hudLayers = $('hud-layers'), hudPct = $('hud-pct'), hudMat = $('hud-mat'), hudPart = $('hud-part'), rLayer = $('r-layer'), doneCard = $('done-card'), doneText = $('done-text');
  var STATUS = { idle: 'Bereit', printing: 'Druckt …', paused: 'Pausiert', done: 'Fertig' };

  function sync(info) {
    hudStatus.textContent = STATUS[info.state];
    hudBar.style.width = info.pct + '%';
    hudLayer.textContent = info.layer; hudLayers.textContent = info.layers; hudPct.textContent = info.pct;
    hudMat.textContent = 'Material: ' + info.material; hudPart.textContent = info.partName;
    rLayer.max = info.layers;
    bPlay.textContent = info.state === 'printing' ? '❚❚ Pause' : (info.state === 'done' ? '↻ Nochmal drucken' : (info.state === 'paused' ? '▶ Weiter' : '▶ Druck starten'));
    if (document.activeElement !== rLayer) rLayer.value = info.completed;
    doneText.textContent = info.partName + ' fertig gedruckt.';
    doneCard.classList.toggle('show', info.state === 'done');
    awake = 200;
  }
  scene.onchange = sync;

  function markMat() {
    var i = P.MATERIALS.map(function (m) { return m.name; }).indexOf(scene.info().material);
    Array.prototype.forEach.call($('sw-mat').children, function (c, k) { c.setAttribute('aria-pressed', k === i ? 'true' : 'false'); });
  }
  function startPrint() {
    if (!userMoved && scene.state === 'idle') scene.setView(partDef().view);
    scene.start(); started = true;
  }
  bPlay.addEventListener('click', function () { if (scene.state === 'printing') scene.pause(); else startPrint(); });
  $('b-reset').addEventListener('click', function () { scene.reset(); scene.setView(HOME); userMoved = false; markView(null); });

  /* Teile wählen */
  var partBox = $('part-sel');
  function markPart(id) { Array.prototype.forEach.call(partBox.querySelectorAll('button'), function (b) { b.setAttribute('aria-pressed', b.dataset.part === id ? 'true' : 'false'); }); }
  partBox.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    scene.setPart(b.dataset.part); markPart(b.dataset.part); markMat(); userMoved = false; markView(null);
    scene.setView(partDef().view); scene.start(); started = true; awake = 200;
  });

  var segSpeed = $('seg-speed');
  segSpeed.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    scene.speed = parseFloat(b.dataset.v);
    Array.prototype.forEach.call(segSpeed.children, function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
  });

  var segView = $('seg-view');
  function markView(v) { Array.prototype.forEach.call(segView.children, function (c) { c.setAttribute('aria-pressed', c.dataset.v === v ? 'true' : 'false'); }); }
  segView.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var v = b.dataset.v === 'detail' ? partDef().view : VIEWS[b.dataset.v];
    scene.setView(v); userMoved = true; markView(b.dataset.v); awake = 200;
  });
  $('z-in').addEventListener('click', function () { scene.zoom(0.82); userMoved = true; awake = 200; });
  $('z-out').addEventListener('click', function () { scene.zoom(1.22); userMoved = true; awake = 200; });

  var swBox = $('sw-mat');
  P.MATERIALS.forEach(function (m, i) {
    var b = document.createElement('button'); b.type = 'button';
    b.style.background = 'rgb(' + m.rgb.join(',') + ')'; b.title = m.name; b.setAttribute('aria-label', 'Material ' + m.name);
    b.addEventListener('click', function () { scene.setMaterial(i); sync(scene.info()); markMat(); });
    swBox.appendChild(b);
  });

  rLayer.addEventListener('input', function () { scene.scrub(parseInt(rLayer.value, 10)); });
  $('c-rot').addEventListener('change', function (e) { scene.autoRotate = e.target.checked; awake = 200; });

  var drag = null, hint = $('hint');
  canvas.addEventListener('pointerdown', function (e) {
    drag = { x: e.clientX, y: e.clientY, touch: e.pointerType === 'touch' };
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    hint.style.display = 'none'; scene.autoRotate = false; $('c-rot').checked = false;
  });
  canvas.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY;
    scene.orbit(-dx * 0.008, drag.touch ? 0 : dy * 0.006); userMoved = true; markView(null); awake = 200;
  });
  var endDrag = function () { drag = null; };
  canvas.addEventListener('pointerup', endDrag); canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('keydown', function (e) {
    var k = e.key, m = true;
    if (k === 'ArrowLeft') scene.orbit(0.12, 0); else if (k === 'ArrowRight') scene.orbit(-0.12, 0);
    else if (k === 'ArrowUp') scene.orbit(0, 0.08); else if (k === 'ArrowDown') scene.orbit(0, -0.08);
    else if (k === '+') scene.zoom(0.85); else if (k === '-') scene.zoom(1.18);
    else if (k === ' ') { if (scene.state === 'printing') scene.pause(); else startPrint(); }
    else m = false;
    if (m) { e.preventDefault(); userMoved = true; awake = 200; }
  });

  /* Hauptschleife: nur rendern, wenn sichtbar und etwas passiert */
  function loop(t) {
    if (!visible || document.hidden) { last = 0; return; }
    var dt = last ? (t - last) / 1000 : 0.016; last = t;
    var active = scene.state === 'printing' || scene.goal || scene.autoRotate || drag;
    if (active) awake = 200;
    if (awake > 0) { scene.update(dt); scene.render(ctx, W, H); awake--; }
    requestAnimationFrame(loop);
  }
  function wake() { if (visible && !document.hidden) { last = 0; requestAnimationFrame(loop); } }
  document.addEventListener('visibilitychange', wake);

  scene.setView(HOME, true); sync(scene.info()); markMat();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var was = visible; visible = en.isIntersecting; if (visible && !was) { resize(); wake(); }
        if (en.isIntersecting && en.intersectionRatio > 0.45 && !started && !reduce) { startPrint(); }
      });
    }, { threshold: [0, 0.2, 0.45, 0.7] }).observe($('stage'));
  } else { visible = true; wake(); }
})();
