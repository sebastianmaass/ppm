/* PPM – Live-3D-Druck-Demo
 * Eigenständige 3D-Engine auf Canvas 2D (keine Abhängigkeiten, keine externen Requests).
 * Feines Schichtraster (0,4-Einheiten-Zellen, 0,2–0,33 Schichthöhe), Teile frei wählbar. */
(function (root) {
  'use strict';

  var CS = 0.4;                         // Zellgröße in x/y (Einheiten ~ mm, stark vergrößert)
  var TOTAL_TIME = 26;                  // Sekunden für einen kompletten Druck bei 1×

  var MATERIALS = [
    { name: 'Klar',      rgb: [176, 208, 234] },
    { name: 'Weiß',      rgb: [236, 240, 245] },
    { name: 'Bernstein', rgb: [228, 176, 62] },
    { name: 'PPM-Blau',  rgb: [29, 112, 184] },
    { name: 'Graphit',   rgb: [66, 74, 90] }
  ];
  var FIXED = { 2: [135, 135, 135], 3: [29, 112, 184], 4: [0, 84, 140], 5: [226, 178, 78] };  // Logo-Grau, PPM-Blau, PPM-Dunkelblau, Gold

  /* ====================================================================== Teile */
  function rr(x, y, cx, cy, hw, hh, r) { var dx = Math.max(Math.abs(x - cx) - (hw - r), 0), dy = Math.max(Math.abs(y - cy) - (hh - r), 0); return dx * dx + dy * dy <= r * r; }

  /* 1) Crimpkontakt (Flachsteckhülse mit Trägerstreifen, Leiter- und Isolationscrimp) */
  function fCrimp(x, y, z) {
    var u = x + 36.5, ay = Math.abs(y), t = 0.8;
    if (u < 0) return 0;
    if (u < 6.2) {                                           // Trägerstreifen
      if (ay > 14.4 || z > t) return 0;
      var d = (u - 3.1) * (u - 3.1) + (ay - 9.4) * (ay - 9.4);
      if (d < 1.9 * 1.9) return 0;
      if (Math.abs(u - 3.1) < 0.9 && ay < 2.8) return 0;
      return 1;
    }
    if (u < 12) return (ay < 4.4 && z < t) ? 1 : 0;           // Steg
    if (u < 27) {                                            // Leiter-Crimp (offene U-Form)
      var hz = 5.2 - 0.16 * z;
      if (z < t && ay < 5.2) return 1;
      return (ay > hz - t && ay < hz && z < 6.4) ? 1 : 0;
    }
    if (u < 30) return (ay < 4.4 && z < t) ? 1 : 0;
    if (u < 43) {                                            // Isolations-Crimp
      var hz2 = 7.6 - 0.15 * z;
      if (z < t && ay < 7.6) return 1;
      return (ay > hz2 - t && ay < hz2 && z < 8.3) ? 1 : 0;
    }
    if (u < 50) {                                            // Übergang
      var ramp = (u - 43) / 7 * 8.2;
      if (z < t && ay < 6.7) return 1;
      return (ay > 6.7 - t && ay < 6.7 && z < ramp) ? 1 : 0;
    }
    if (u < 73) {                                            // Kontaktbuchse (Box mit Fenster)
      if (z < t && ay < 6.7) return 1;
      if (ay > 6.7 - t && ay < 6.7 && z < 8.2) return 1;
      if (z > 8.2 - t && z < 8.2 && ay < 6.7) { return (Math.abs(u - 62) < 5 && ay < 3.0) ? 0 : 1; }
      if (u > 55 && u < 70 && ay < 1.2 && z < t + 1.7) return 1;   // Kontaktfeder
      return 0;
    }
    return 0;
  }

  /* 2) OBD-II-Stecker (16 Pins, D-förmiger Schutzkragen, Gehäuse, Knickschutz) – liegend gedruckt, Achse in x */
  function hwO(v) { return 19.4 + 1.3 * (v / 9); }
  function fObd(x, y, z) {
    var u = x + 30.5, v = z - 10.5, ay = Math.abs(y), av = Math.abs(v);
    if (u < 0 || u > 62) return 0;
    if (u < 20.5) {                                          // Schutzkragen + Pins
      if (av > 9) return 0;
      var cham = Math.max(0, av - 6.0) * 1.5, hw = hwO(v) - cham;
      var inner = av < 7.6 && ay < hw - 1.4 - Math.max(0, av - 6.0) * 0.2;
      if (ay < hw && !inner) return 1;
      if (inner && u > 2.4) {
        var yc = (Math.round(y / 3.6 - 0.5) + 0.5) * 3.6; if (Math.abs(yc) > 12.7) return 0;
        var dv = av - 2.9, d = Math.sqrt((y - yc) * (y - yc) + dv * dv), rr_ = 0.9 - (u < 5.0 ? (5.0 - u) * 0.16 : 0);
        if (d < rr_) return 5;
      }
      return 0;
    }
    if (u < 24.5) { var hf = hwO(v) + 2.2 - Math.max(0, av - 8.2) * 1.8; return (av < 10.5 && ay < hf) ? 1 : 0; }
    if (u < 46) {                                            // Gehäusekörper mit Griffrillen
      var hb = 21.0 - Math.max(0, av - 7.6) * 1.7;
      if (u > 28 && u < 44 && ay > hb - 1.0 && ((u - 28) % 4) < 1.3) hb -= 0.9;
      return (av < 10.5 && ay < hb) ? 1 : 0;
    }
    var rad = 9.6 - (u - 46) * 0.22 + (((u - 46) % 3.4) < 1.3 ? 0.55 : 0);   // Knickschutz mit Ringen
    var ey = y / (rad * 1.6), ev = v / rad;
    return (ey * ey + ev * ev < 1) ? 1 : 0;
  }

  /* 3) Schlüsselanhänger mit PPM-Logo (mehrfarbig) */
  function fKey(x, y, z) {
    var LB = root.PPM_LOGO;
    var inPlate = rr(x, y, 6, 0, 32, 11.5, 5) || ((x + 30) * (x + 30) + y * y < 81);
    if (!inPlate) return 0;
    var hole = ((x + 30) * (x + 30) + y * y) < 3.3 * 3.3;
    if (hole) return 0;
    if (z < 3.0) return 1;
    // erhabener Rand
    var edge = !(rr(x, y, 6, 0, 30.6, 10.1, 4) || ((x + 30) * (x + 30) + y * y < 7.6 * 7.6));
    if (edge && z < 3.7) return 1;
    // Logo-Buchstaben (Inlay + erhaben)
    if (LB && x > -22 && x < 34 && y > -4.4 && y < 4.4) {
      var c = Math.floor((x + 22) / 56 * LB.w), r = Math.floor((4.4 - y) / 8.8 * LB.h);
      var ch = LB.d.charCodeAt(r * LB.w + c) - 48;
      if (ch > 0 && z < 4.2) return 1 + ch;
    }
    // Unterstreichung
    if (x > -22 && x < 28 && y > -8.3 && y < -7.4 && z < 3.8) return 2;
    return 0;
  }

  /* 4) Platinen-Clip (Rasthaken mit ovalem Fenster) */
  function fClip(x, y, z) {
    var u = x + 37, ay = Math.abs(y);
    if (u < 0 || u > 75) return 0;
    if (u < 3.4) return (ay < 6.3 && z < 4.6 && !(Math.abs(u - 1.7) < 0.6 && ay < 1.8)) ? 1 : 0;      // Kopfflansch
    if (u < 14) {
      var ring = (u - 9.2) * (u - 9.2) + y * y;
      if (ring < 4.3 * 4.3 && ring > 2.1 * 2.1 && z < 3.4) return 1;                                   // Ring
      if (u < 9.2 && ay > 2.4 && ay < 4.0 && z < 3.4) return 1;                                         // Gabel
      return 0;
    }
    if (u < 60) {                                             // Schaft mit Vertiefung
      if (ay > 4.0) return 0;
      var zt = (u > 18 && u < 56 && ay < 2.6) ? 1.3 : 2.4;
      return z < zt ? 1 : 0;
    }
    var w = u < 64 ? 4.0 + (u - 60) * 0.25 : Math.max(0.9, 5.0 - (u - 64) * 0.38);                       // Widerhaken
    if (ay > w || z > 2.4) return 0;
    var wx = (u - 67.4) / 4.4, wy = y / 1.5; if (wx * wx + wy * wy < 1) return 0;
    return 1;
  }

  var PARTS = [
    { id: 'crimp', name: 'Crimpkontakt', info: 'Flachsteckhülse mit Trägerstreifen, Leiter- und Isolationscrimp', nx: 190, ny: 76, nz: 34, H: 8.6, defMat: 2, f: fCrimp, view: { yaw: -0.55, pitch: 0.5, dist: 150, tz: 5 } },
    { id: 'obd', name: 'OBD-Stecker', info: 'OBD-II-Stecker mit 16 Pins, Schutzkragen und Knickschutz', nx: 156, ny: 108, nz: 64, H: 21, defMat: 4, f: fObd, view: { yaw: -0.75, pitch: 0.42, dist: 165, tz: 9 } },
    { id: 'key', name: 'Schlüsselanhänger', info: 'Schlüsselanhänger mit PPM-Logo – mehrfarbig gedruckt', nx: 200, ny: 62, nz: 22, H: 4.4, defMat: 1, f: fKey, view: { yaw: -0.35, pitch: 0.6, dist: 135, tz: 3 } },
    { id: 'clip', name: 'Platinen-Clip', info: 'Rasthaken-Clip mit ovalem Fenster und Kopfflansch', nx: 190, ny: 44, nz: 25, H: 5.0, defMat: 0, f: fClip, view: { yaw: -0.5, pitch: 0.55, dist: 145, tz: 3 } }
  ];

  function buildPart(def) {
    var nx = def.nx, ny = def.ny, nz = def.nz, n2 = nx * ny, ch = def.H / nz;
    var x0 = -(nx * CS) / 2, y0 = -(ny * CS) / 2, keys = [], rowCnt = [], rowStart = [], cnt = [], total = 0;
    var bb = { i0: nx, i1: -1, j0: ny, j1: -1 };
    for (var k = 0; k < nz; k++) {
      var key = new Uint8Array(n2), rc = new Int32Array(ny), rs = new Int32Array(ny + 1), z = (k + 0.5) * ch, c = 0;
      for (var j = 0; j < ny; j++) {
        var y = y0 + (j + 0.5) * CS; rs[j] = c;
        for (var i = 0; i < nx; i++) {
          var v = def.f(x0 + (i + 0.5) * CS, y, z);
          if (v) { key[j * nx + i] = v << 3; rc[j]++; c++; if (i < bb.i0) bb.i0 = i; if (i > bb.i1) bb.i1 = i; if (j < bb.j0) bb.j0 = j; if (j > bb.j1) bb.j1 = j; }
        }
      }
      rs[ny] = c; keys.push(key); rowCnt.push(rc); rowStart.push(rs); cnt.push(c); total += c;
    }
    if (bb.i1 < 0) { bb.i0 = 0; bb.i1 = 0; bb.j0 = 0; bb.j1 = 0; }
    return { def: def, nx: nx, ny: ny, nz: nz, n2: n2, ch: ch, x0: x0, y0: y0, keys: keys, rowCnt: rowCnt, rowStart: rowStart, cnt: cnt, total: total, bb: bb,
             zero: new Uint8Array(n2), cur: new Uint8Array(n2), runs: [], runs0: [] };
  }

  /* ---- Flächen-Läufe (zusammengefasste Rechtecke) aus einer Schicht ---- */
  function buildRuns(part, cur, up, jmax) {
    var nx = part.nx, ny = part.ny, bb = part.bb, i0 = bb.i0, i1 = bb.i1, j0 = bb.j0, j1 = jmax === undefined ? bb.j1 : Math.min(jmax, bb.j1);
    var top = [], xm = [], xp = [], ym = [], yp = [];
    var oxm = new Int32Array(nx + 2).fill(-1), oxp = new Int32Array(nx + 2).fill(-1);
    for (var j = j0; j <= j1; j++) {
      var row = j * nx, rs = 0, rk = 0, ymS = 0, ymK = 0, ypS = 0, ypK = 0;
      for (var i = i0; i <= i1 + 1; i++) {
        var k = i <= i1 ? cur[row + i] : 0, tk = 0, ek = 0, fk = 0;
        if (k) {
          if (!up[row + i]) tk = k;
          if (i === 0 || !cur[row + i - 1]) {                                   // -x Wand
            var a = oxm[i]; if (a >= 0 && xm[a + 2] === j && xm[a + 3] === k) xm[a + 2] = j + 1; else { oxm[i] = xm.length; xm.push(i, j, j + 1, k); }
          }
          if (i === nx - 1 || !cur[row + i + 1]) {                              // +x Wand
            var b = oxp[i + 1]; if (b >= 0 && xp[b + 2] === j && xp[b + 3] === k) xp[b + 2] = j + 1; else { oxp[i + 1] = xp.length; xp.push(i + 1, j, j + 1, k); }
          }
          if (j === 0 || !cur[row - nx + i]) ek = k;                              // -y Wand
          if (j === ny - 1 || !cur[row + nx + i]) fk = k;                         // +y Wand
        }
        if (tk !== rk) { if (rk) top.push(j, rs, i, rk); rs = i; rk = tk; }
        if (ek !== ymK) { if (ymK) ym.push(j, ymS, i, ymK); ymS = i; ymK = ek; }
        if (fk !== ypK) { if (ypK) yp.push(j + 1, ypS, i, ypK); ypS = i; ypK = fk; }
      }
    }
    return { top: top, xm: xm, xp: xp, ym: ym, yp: yp };
  }

  /* ====================================================================== Vektor-Helfer */
  function norm(a) { var l = Math.sqrt(a[0] * a[0] + a[1] * a[1] + a[2] * a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
  function mix(a, b, t) { return a + (b - a) * t; }
  var LIGHT = norm([-0.45, -0.6, 0.8]);
  function shadeOf(n) { var d = n[0] * LIGHT[0] + n[1] * LIGHT[1] + n[2] * LIGHT[2]; return 0.42 + 0.58 * Math.max(0, d); }
  function rgbStr(c, s) { return 'rgb(' + Math.min(255, (c[0] * s) | 0) + ',' + Math.min(255, (c[1] * s) | 0) + ',' + Math.min(255, (c[2] * s) | 0) + ')'; }
  var FACE_N = [[0, 0, 1], [1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0]];   // top, +x, -x, +y, -y
  var HOT = [214, 242, 255];

  /* ---- Maschinen-Quader ---- */
  var BOXN = [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]];
  function boxNode(mn, mx, color, flat) {
    var x0 = mn[0], y0 = mn[1], z0 = mn[2], x1 = mx[0], y1 = mx[1], z1 = mx[2];
    return { min: mn, max: mx, color: color, flat: flat, faces: [
      { n: BOXN[0], p: [[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]] },
      { n: BOXN[1], p: [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]] },
      { n: BOXN[2], p: [[x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0]] },
      { n: BOXN[3], p: [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]] },
      { n: BOXN[4], p: [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]] },
      { n: BOXN[5], p: [[x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [x1, y0, z0]] }] };
  }
  function sepOrder(a, b, eye) {
    for (var ax = 0; ax < 3; ax++) {
      if (a.max[ax] <= b.min[ax] + 1e-6) { if (eye[ax] >= b.min[ax]) return -1; if (eye[ax] <= a.max[ax]) return 1; }
      else if (b.max[ax] <= a.min[ax] + 1e-6) { if (eye[ax] >= a.min[ax]) return 1; if (eye[ax] <= b.max[ax]) return -1; }
    }
    return 0;
  }
  function sortNodes(nodes, eye) {
    var n = nodes.length, indeg = new Array(n), adj = [], i, j, r;
    for (i = 0; i < n; i++) { indeg[i] = 0; adj.push([]); }
    for (i = 0; i < n; i++) for (j = i + 1; j < n; j++) {
      r = sepOrder(nodes[i], nodes[j], eye);
      if (r < 0) { adj[i].push(j); indeg[j]++; } else if (r > 0) { adj[j].push(i); indeg[i]++; }
    }
    var dist = nodes.map(function (nd) { var cx = (nd.min[0] + nd.max[0]) / 2 - eye[0], cy = (nd.min[1] + nd.max[1]) / 2 - eye[1], cz = (nd.min[2] + nd.max[2]) / 2 - eye[2]; return cx * cx + cy * cy + cz * cz; });
    var done = new Array(n), out = [], c;
    for (c = 0; c < n; c++) {
      var best = -1;
      for (i = 0; i < n; i++) if (!done[i] && indeg[i] === 0 && (best < 0 || dist[i] > dist[best])) best = i;
      if (best < 0) {                                           // Zyklus: Knoten mit den wenigsten offenen Vorgängern, dann der entfernteste
        root.PPM_CYCLES = (root.PPM_CYCLES || 0) + 1;
        for (i = 0; i < n; i++) if (!done[i] && (best < 0 || indeg[i] < indeg[best] || (indeg[i] === indeg[best] && dist[i] > dist[best]))) best = i;
      }
      done[best] = true; out.push(nodes[best]);
      for (i = 0; i < adj[best].length; i++) indeg[adj[best][i]]--;
    }
    return out;
  }

  /* ====================================================================== Szene */
  function Scene(opts) {
    this.makeCanvas = opts.makeCanvas; this.P2D = opts.Path2D || root.Path2D;
    this.parts = {}; this.matIdx = 0; this.speed = 1; this.state = 'idle';
    this.layer = 0; this.p = 0; this.lift = 0; this.time = 0;
    this.cam = { yaw: -0.5, pitch: 0.42, dist: 270, tx: 0, ty: 0, tz: 8 };
    this.goal = null; this.cache = null; this.cacheKey = ''; this.cacheLayers = 0; this.onchange = null;
    this.h = 6; this.xn = -44; this.yn = 24; this.colTab = {};
    this.setPart('crimp', true);
  }
  Scene.prototype.getPart = function (id) {
    if (!this.parts[id]) { var d = PARTS.filter(function (q) { return q.id === id; })[0] || PARTS[0]; this.parts[id] = buildPart(d); }
    return this.parts[id];
  };
  Scene.prototype.setPart = function (id, quiet) {
    this.part = this.getPart(id); this.def = this.part.def; this.matIdx = this.def.defMat; this.colTab = {};
    this.layer = 0; this.p = 0; this.lift = 0; this.state = 'idle'; this.cacheKey = ''; this.cacheLayers = 0;
    this.xn = -44; this.yn = 24; this.h = 6;
    if (!quiet) this.emit();
  };
  Scene.prototype.setMaterial = function (m) { this.matIdx = m; this.colTab = {}; this.cacheKey = ''; };
  Scene.prototype.start = function () { if (this.state === 'done') this.reset(true); this.state = 'printing'; this.emit(); };
  Scene.prototype.pause = function () { if (this.state === 'printing') { this.state = 'paused'; this.emit(); } };
  Scene.prototype.reset = function (quiet) { this.layer = 0; this.p = 0; this.lift = 0; this.state = 'idle'; this.cacheLayers = 0; this.cacheKey = ''; if (!quiet) this.emit(); };
  Scene.prototype.scrub = function (L) {
    var nz = this.part.nz; L = clamp(Math.round(L), 0, nz);
    this.layer = L; this.p = 0; this.lift = 0; this.cacheKey = '';
    this.state = L >= nz ? 'done' : (L === 0 ? 'idle' : 'paused'); this.emit();
  };
  Scene.prototype.emit = function () { if (this.onchange) this.onchange(this.info()); };
  Scene.prototype.info = function () {
    var pt = this.part, nz = pt.nz, done = 0, k;
    for (k = 0; k < this.layer && k < nz; k++) done += pt.cnt[k];
    if (this.layer < nz) done += Math.floor(this.p);
    var shown = this.state === 'idle' ? 0 : (this.state === 'done' ? nz : (this.state === 'printing' || this.p > 0 ? this.layer + 1 : this.layer));
    return { state: this.state, layer: Math.min(shown, nz), completed: Math.min(this.layer, nz), layers: nz, pct: Math.round(100 * done / pt.total), done: this.layer >= nz, part: this.def.id, partName: this.def.name, material: MATERIALS[this.matIdx].name };
  };
  Scene.prototype.setView = function (v, instant) {
    var g = { yaw: v.yaw, pitch: v.pitch, dist: v.dist, tx: v.tx || 0, ty: v.ty || 0, tz: v.tz === undefined ? 8 : v.tz };
    if (instant) { this.cam = g; this.goal = null; } else this.goal = g;
  };
  Scene.prototype.orbit = function (dyaw, dpitch) { this.goal = null; this.cam.yaw = clamp(this.cam.yaw + dyaw, -2.1, 2.1); this.cam.pitch = clamp(this.cam.pitch + dpitch, 0.09, 1.45); };
  Scene.prototype.zoom = function (f) { this.goal = null; this.cam.dist = clamp(this.cam.dist * f, 55, 420); };

  Scene.prototype.layerDur = function (k) { var pt = this.part; return Math.max(0.1, TOTAL_TIME * (0.3 / pt.nz + 0.7 * pt.cnt[k] / pt.total)) / this.speed; };

  Scene.prototype.update = function (dt) {
    dt = Math.min(dt, 0.05); this.time += dt;
    var c = this.cam, g = this.goal, pt = this.part, nz = pt.nz;
    if (g) {
      var kk = 1 - Math.exp(-dt * 6), dy = g.yaw - c.yaw;
      while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI;
      c.yaw += dy * kk; c.pitch += (g.pitch - c.pitch) * kk; c.dist += (g.dist - c.dist) * kk;
      c.tx += (g.tx - c.tx) * kk; c.ty += (g.ty - c.ty) * kk; c.tz += (g.tz - c.tz) * kk;
      if (Math.abs(dy) + Math.abs(g.pitch - c.pitch) + Math.abs(g.dist - c.dist) < 0.004) { this.cam = g; this.goal = null; }
    }
    if (this.state === 'printing') {
      if (this.lift > 0) this.lift -= dt;
      else {
        var n = pt.cnt[this.layer];
        this.p += n / this.layerDur(this.layer) * dt;
        if (this.p >= n) {
          this.layer++; this.p = 0;
          if (this.layer >= nz) this.state = 'done'; else this.lift = 0.03 / this.speed;
          this.emit();
        } else if ((this.frame = (this.frame || 0) + 1) % 5 === 0) this.emit();
      }
    }
    var zTop = this.state === 'idle' && this.layer === 0 ? 0 : Math.min(this.layer + (this.state === 'done' ? 0 : (this.p > 0 || this.state === 'printing' ? 1 : 0)), nz) * pt.ch;
    var hT, tx = null, ty = null;
    if (this.state === 'done') { hT = this.def.H + 15; tx = 42; ty = 26; }
    else if (this.state === 'idle') { hT = this.def.H + 9; tx = -42; ty = 24; }
    else hT = zTop + 1.6;
    this.h += (hT - this.h) * Math.min(1, dt * 8);
    if ((this.state === 'printing' && this.lift <= 0) || (this.state === 'paused' && this.layer < nz)) {
      var pos = this.nozzlePos();
      this.xn += (pos[0] - this.xn) * Math.min(1, dt * 30); this.yn += (pos[1] - this.yn) * Math.min(1, dt * 30);
    } else if (tx !== null) { this.xn += (tx - this.xn) * Math.min(1, dt * 3.5); this.yn += (ty - this.yn) * Math.min(1, dt * 3.5); }
    if (this.autoRotate && !this.goal) { this.swayT = (this.swayT || 0) + dt; this.cam.yaw = -0.45 + 0.95 * Math.sin(this.swayT * 0.45); }
  };

  Scene.prototype.nozzlePos = function () {
    var pt = this.part, L = Math.min(this.layer, pt.nz - 1), nx = pt.nx, pc = Math.floor(this.p), rs = pt.rowStart[L], j = 0;
    while (j < pt.ny - 1 && rs[j + 1] <= pc) j++;
    var want = pc - rs[j], key = pt.keys[L], row = j * nx, r = 0, ii = pt.bb.i0, dir = (j & 1) ? -1 : 1, i = dir > 0 ? pt.bb.i0 : pt.bb.i1;
    for (; i >= pt.bb.i0 && i <= pt.bb.i1; i += dir) { if (key[row + i]) { if (r >= want) { ii = i; break; } r++; ii = i; } }
    return [pt.x0 + (ii + 0.5) * CS, pt.y0 + (j + 0.5) * CS];
  };

  /* ---- Kamera / Projektion ---- */
  Scene.prototype.setupProj = function (W, H) {
    var c = this.cam, cp = Math.cos(c.pitch), sp = Math.sin(c.pitch);
    var eye = [c.tx + c.dist * Math.sin(c.yaw) * cp, c.ty - c.dist * Math.cos(c.yaw) * cp, c.tz + c.dist * sp];
    var f = norm([c.tx - eye[0], c.ty - eye[1], c.tz - eye[2]]), r = norm([f[1], -f[0], 0]);
    var u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
    var view = Math.min(H, W * 0.82), focal = 0.5 * view / Math.tan(0.28);
    this.eye = eye; this.fw = f; this.rt = r; this.up = u; this.focal = focal; this.cx = W / 2; this.cy = H * 0.5;
  };
  var PXs = 0, PYs = 0;
  Scene.prototype.pj = function (x, y, z) {
    var e = this.eye, f = this.fw, r = this.rt, u = this.up, dx = x - e[0], dy = y - e[1], dz = z - e[2];
    var zc = dx * f[0] + dy * f[1] + dz * f[2], s = this.focal / zc;
    PXs = this.cx + (dx * r[0] + dy * r[1] + dz * r[2]) * s; PYs = this.cy - (dx * u[0] + dy * u[1] + dz * u[2]) * s;
  };
  Scene.prototype.P = function (x, y, z) { this.pj(x, y, z); return [PXs, PYs]; };

  Scene.prototype.colorStr = function (type, key, par) {
    var id = (type * 2 + par) * 64 + key, c = this.colTab[id]; if (c) return c;
    var cid = key >> 3, b = key & 7, base = cid === 1 ? MATERIALS[this.matIdx].rgb : (FIXED[cid] || [200, 200, 200]);
    var t = b ? (7 - b) / 7 * 0.92 : 0, rgb = [mix(base[0], HOT[0], t), mix(base[1], HOT[1], t), mix(base[2], HOT[2], t)];
    c = this.colTab[id] = rgbStr(rgb, shadeOf(FACE_N[type]) * (par ? 0.955 : 1) * (b ? 1.08 : 1)); return c;
  };

  Scene.prototype.drawRuns = function (ctx, k, R) {
    var pt = this.part, ch = pt.ch, z0 = k * ch, z1 = z0 + ch, X0 = pt.x0, Y0 = pt.y0, ex = this.eye[0], ey = this.eye[1], par = k & 1;
    var B = {}, used = [], P2 = this.P2D, n, L, x, y, xa, xb, ya, yb, key, id, p, self = this;
    function bucket(type, kk) { var q = type * 64 + kk, o = B[q]; if (!o) { o = B[q] = new P2(); used.push(q); } return o; }
    function poly(p_, ax, ay, az, bx, by, bz, cx, cy, cz, dx, dy, dz) {
      self.pj(ax, ay, az); p_.moveTo(PXs, PYs); self.pj(bx, by, bz); p_.lineTo(PXs, PYs); self.pj(cx, cy, cz); p_.lineTo(PXs, PYs); self.pj(dx, dy, dz); p_.lineTo(PXs, PYs); p_.closePath();
    }
    L = R.xm; for (n = 0; n < L.length; n += 4) { x = X0 + L[n] * CS; if (ex >= x) continue; ya = Y0 + L[n + 1] * CS; yb = Y0 + L[n + 2] * CS; poly(bucket(2, L[n + 3]), x, ya, z0, x, ya, z1, x, yb, z1, x, yb, z0); }
    L = R.xp; for (n = 0; n < L.length; n += 4) { x = X0 + L[n] * CS; if (ex <= x) continue; ya = Y0 + L[n + 1] * CS; yb = Y0 + L[n + 2] * CS; poly(bucket(1, L[n + 3]), x, ya, z0, x, yb, z0, x, yb, z1, x, ya, z1); }
    L = R.ym; for (n = 0; n < L.length; n += 4) { y = Y0 + L[n] * CS; if (ey >= y) continue; xa = X0 + L[n + 1] * CS; xb = X0 + L[n + 2] * CS; poly(bucket(4, L[n + 3]), xa, y, z0, xb, y, z0, xb, y, z1, xa, y, z1); }
    L = R.yp; for (n = 0; n < L.length; n += 4) { y = Y0 + L[n] * CS; if (ey <= y) continue; xa = X0 + L[n + 1] * CS; xb = X0 + L[n + 2] * CS; poly(bucket(3, L[n + 3]), xa, y, z0, xa, y, z1, xb, y, z1, xb, y, z0); }
    L = R.top; for (n = 0; n < L.length; n += 4) { y = Y0 + L[n] * CS; xa = X0 + L[n + 1] * CS; xb = X0 + L[n + 2] * CS; poly(bucket(0, L[n + 3]), xa, y, z1, xb, y, z1, xb, y + CS, z1, xa, y + CS, z1); }
    ctx.lineWidth = 0.7; ctx.lineJoin = 'round';
    // Wände zuerst, dann Oberseiten
    for (var pass = 0; pass < 2; pass++) for (n = 0; n < used.length; n++) {
      id = used[n]; var type = (id / 64) | 0; if ((pass === 0) === (type === 0)) continue;
      key = id % 64; var col = this.colorStr(type, key, par);
      ctx.fillStyle = col; ctx.strokeStyle = col; ctx.fill(B[id]); ctx.stroke(B[id]);
    }
  };

  Scene.prototype.dynKeys = function (L, pc) {
    var pt = this.part, cur = pt.cur, nx = pt.nx, bb = pt.bb; cur.fill(0);
    if (pc <= 0) return cur;
    this.dynJ = bb.j0; var keys = pt.keys[L], rc = pt.rowCnt[L], rsT = pt.rowStart[L], heat = Math.max(110, (pt.cnt[L] * 0.035) | 0), rem = pc, j, i, base, n, r, dir, row, kv, age, b;
    for (j = bb.j0; j <= bb.j1 && rem > 0; j++) {
      if (!rc[j]) continue;
      n = Math.min(rem, rc[j]); base = rsT[j]; row = j * nx; dir = (j & 1) ? -1 : 1; r = 0; this.dynJ = j;
      for (i = dir > 0 ? bb.i0 : bb.i1; i >= bb.i0 && i <= bb.i1 && r < n; i += dir) {
        kv = keys[row + i]; if (!kv) continue;
        age = pc - (base + r); b = age < heat ? 1 + Math.min(5, (age / heat * 6) | 0) : 0;
        cur[row + i] = kv | b; r++;
      }
      rem -= rc[j];
    }
    return cur;
  };

  Scene.prototype.machineNodes = function () {
    var h = this.h, xn = this.xn, yn = this.yn, N = [], B = boxNode, printing = this.state === 'printing';
    var BODY = [30, 34, 44], PANEL = [44, 50, 62], SILVER = [172, 179, 190], SILVER2 = [128, 136, 148], BEDC = [122, 136, 156], TRAY = [38, 44, 56],
        ACC = [29, 112, 184], SCR = [150, 200, 245], CAR = [24, 27, 34], YEL = [240, 198, 40], RAIL = [196, 203, 213], BEAM = [214, 220, 228];
    N.push(B([-64, -52, -44], [64, 40, -6], BODY));
    var front = B([-64, -58, -44], [64, -52, -6], SILVER2);
    front.children = [B([-64, -58.8, -10], [64, -58, -8], ACC, true), B([-17, -60, -30], [17, -58, -12], CAR), B([-14, -60.6, -27], [14, -60, -15], SCR, true)];
    N.push(front);
    N.push(B([-64, -52, -6], [-58, 40, 12], PANEL));
    N.push(B([58, -52, -6], [64, 40, 12], PANEL));
    N.push(B([-58, 34, -6], [58, 40, 34], PANEL));
    N.push(B([-70, -58, -44], [-64, -14, 22], SILVER));
    N.push(B([64, -58, -44], [70, -14, 22], SILVER));
    N.push(B([-58, -46, -6], [58, 34, -4], TRAY));
    var bed = B([-52, -36, -4], [52, 30, 0], BEDC); bed.kind = 'bed'; N.push(bed);
    var r1 = B([-57, -48, h + 14], [-52, 32, h + 17], RAIL), r2 = B([52, -48, h + 14], [57, 32, h + 17], RAIL), bm = B([-52, yn - 2, h + 14], [52, yn + 2, h + 17], BEAM);
    r1.alpha = r2.alpha = bm.alpha = 0.55; N.push(r1, r2, bm);
    var car = B([xn - 10.5, yn - 7.1, h], [xn + 10.5, yn + 7, h + 14], CAR); car.invisible = true;
    car.children = [B([xn - 10.5, yn - 1.2, h], [xn + 10.5, yn + 1.2, h + 1], printing ? [205, 242, 255] : [120, 150, 175], true), B([xn - 10, yn - 7, h + 1], [xn + 10, yn + 7, h + 3], SILVER),
      B([xn - 9, yn - 6.5, h + 3], [xn + 9, yn + 6.5, h + 12], CAR), B([xn - 5, yn - 7.1, h + 5], [xn + 5, yn - 6.5, h + 10], YEL, true), B([xn - 4, yn - 3, h + 12], [xn + 4, yn + 3, h + 14], SILVER2)];
    N.push(car);
    var pt = this.part, zTop = Math.min(this.layer + (this.state === 'done' ? 0 : 1), pt.nz) * pt.ch;
    N.push({ min: [pt.x0, pt.y0, 0], max: [pt.x0 + pt.nx * CS, pt.y0 + pt.ny * CS, Math.max(zTop, 0.001)], isPart: true });
    return N;
  };

  Scene.prototype.drawMesh = function (ctx, node) {
    var fs = node.faces, q, v, pts, n, vis, e = this.eye;
    for (q = 0; q < fs.length; q++) {
      n = fs[q].n; pts = fs[q].p;
      vis = n[0] * (e[0] - pts[0][0]) + n[1] * (e[1] - pts[0][1]) + n[2] * (e[2] - pts[0][2]); if (vis <= 0) continue;
      ctx.beginPath();
      for (v = 0; v < pts.length; v++) { this.pj(pts[v][0], pts[v][1], pts[v][2]); if (v) ctx.lineTo(PXs, PYs); else ctx.moveTo(PXs, PYs); }
      ctx.closePath(); ctx.globalAlpha = node.alpha || 1; ctx.fillStyle = rgbStr(node.color, node.flat ? 1 : shadeOf(n)); ctx.fill();
      ctx.strokeStyle = 'rgba(6,14,24,0.38)'; ctx.lineWidth = 0.8; ctx.stroke(); ctx.globalAlpha = 1;
    }
  };

  Scene.prototype.render = function (ctx, W, H) {
    var pt = this.part, nz = pt.nz, cam = this.cam, k, a;
    this.setupProj(W, H); var eye = this.eye;
    ctx.clearRect(0, 0, W, H);
    // weicher Schatten
    var cc = this.P(0, -4, -44);
    for (var ring = 0; ring < 3; ring++) {
      ctx.beginPath();
      for (a = 0; a < 32; a++) { var t = a / 32 * Math.PI * 2, s = this.P(Math.cos(t) * (88 - ring * 9), -4 + Math.sin(t) * (72 - ring * 8), -44); if (a) ctx.lineTo(s[0], s[1]); else ctx.moveTo(s[0], s[1]); }
      ctx.closePath(); ctx.fillStyle = 'rgba(0,0,0,0.12)'; ctx.fill();
    }
    var key = [this.def.id, this.matIdx, cam.yaw.toFixed(4), cam.pitch.toFixed(4), cam.dist.toFixed(2), cam.tx.toFixed(2), cam.ty.toFixed(2), cam.tz.toFixed(2), W, H].join('|');
    if (!this.cache || this.cache.width !== W || this.cache.height !== H) { this.cache = this.makeCanvas(W, H); this.cacheKey = ''; }
    var sCount = this.layer >= nz ? nz : Math.max(0, this.layer - 1);
    var cctx = this.cache.getContext('2d');
    if (this.cacheKey !== key || this.cacheLayers > sCount) { cctx.clearRect(0, 0, W, H); this.cacheKey = key; this.cacheLayers = 0; }
    for (k = this.cacheLayers; k < sCount; k++) {
      var R = pt.runs[k]; if (!R) R = pt.runs[k] = buildRuns(pt, pt.keys[k], k + 1 < nz ? pt.keys[k + 1] : pt.zero);
      this.drawRuns(cctx, k, R);
    }
    this.cacheLayers = Math.max(this.cacheLayers, sCount);

    var nodes = this.machineNodes(), sorted = sortNodes(nodes, eye), q, nd;
    for (q = 0; q < sorted.length; q++) {
      nd = sorted[q];
      if (nd.isPart) {
        ctx.drawImage(this.cache, 0, 0);
        if (this.layer < nz) {
          var L = this.layer, pc = Math.floor(this.p), curL = this.dynKeys(L, pc);
          if (L > 0) { var R1 = pt.runs0[L - 1]; if (!R1) R1 = pt.runs0[L - 1] = buildRuns(pt, pt.keys[L - 1], pt.zero); this.drawRuns(ctx, L - 1, R1); }
          if (pc > 0) this.drawRuns(ctx, L, buildRuns(pt, curL, pt.zero, this.dynJ + 1));
        }
      } else {
        if (!nd.invisible) this.drawMesh(ctx, nd);
        if (nd.kind === 'bed') this.drawBedGrid(ctx);
        if (nd.children) for (var ci = 0; ci < nd.children.length; ci++) this.drawMesh(ctx, nd.children[ci]);
      }
    }
    if (this.state === 'printing') {
      var tp = this.P(this.xn, this.yn, this.h), rad = 22 * this.focal / 520;
      var gr = ctx.createRadialGradient(tp[0], tp[1], 0, tp[0], tp[1], rad);
      gr.addColorStop(0, 'rgba(210,244,255,0.9)'); gr.addColorStop(0.4, 'rgba(120,200,255,0.35)'); gr.addColorStop(1, 'rgba(60,150,255,0)');
      ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(tp[0], tp[1], rad, 0, Math.PI * 2); ctx.fill();
    }
  };

  Scene.prototype.drawBedGrid = function (ctx) {
    var x, y, a, b;
    ctx.strokeStyle = 'rgba(190,215,240,0.10)'; ctx.lineWidth = 1; ctx.beginPath();
    for (x = -40; x <= 40; x += 10) { a = this.P(x, -36, 0); b = this.P(x, 30, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    for (y = -30; y <= 30; y += 10) { a = this.P(-52, y, 0); b = this.P(52, y, 0); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); }
    ctx.stroke();
  };

  root.PPMPrinter = { Scene: Scene, MATERIALS: MATERIALS, PARTS: PARTS.map(function (p) { return { id: p.id, name: p.name, info: p.info, defMat: p.defMat, view: p.view, nz: p.nz }; }) };
})(typeof window !== 'undefined' ? window : globalThis);
