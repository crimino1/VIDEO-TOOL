// Flat vector cartoon rig: bright solid shapes, soft sky and water gradients, light rays, layered hills, rounded cartoon people.
// Every scene is a pure function of time t (seconds from the scene start), so any frame renders on its own.
const FL = (() => {
  const W = 1920, H = 1080;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let x = Math.imul(seed ^ (seed >>> 15), 1 | seed); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; };

  // ---------- paths written like SVG (M L C Q Z, absolute), traced through an optional point warp ----------
  const cache = {};
  function parse(d) {
    if (cache[d]) return cache[d];
    const tk = d.match(/[MLCQZ]|-?[\d.]+/g), out = []; let i = 0;
    while (i < tk.length) { const c = tk[i++], n = { M: 2, L: 2, C: 6, Q: 4, Z: 0 }[c], a = []; for (let j = 0; j < n; j++) a.push(+tk[i++]); out.push([c, a]); }
    return (cache[d] = out);
  }
  const ID = (x, y) => [x, y];
  function trace(ctx, d, f = ID, begin = true) {
    if (begin) ctx.beginPath();
    for (const [c, a] of parse(d)) {
      if (c === "M") { const p = f(a[0], a[1]); ctx.moveTo(p[0], p[1]); }
      else if (c === "L") { const p = f(a[0], a[1]); ctx.lineTo(p[0], p[1]); }
      else if (c === "C") { const p = f(a[0], a[1]), q = f(a[2], a[3]), r = f(a[4], a[5]); ctx.bezierCurveTo(p[0], p[1], q[0], q[1], r[0], r[1]); }
      else if (c === "Q") { const p = f(a[0], a[1]), q = f(a[2], a[3]); ctx.quadraticCurveTo(p[0], p[1], q[0], q[1]); }
      else ctx.closePath();
    }
  }
  const fill = (ctx, d, col, f) => { trace(ctx, d, f); ctx.fillStyle = col; ctx.fill(); };
  function vgrad(ctx, y0, y1, stops) { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
  function ell(ctx, x, y, rx, ry, rot, col) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot || 0, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); }
  function circ(ctx, x, y, r, col) { ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = col; ctx.fill(); }
  function line(ctx, pts, w, col, cap = "round") { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); ctx.lineWidth = w; ctx.strokeStyle = col; ctx.lineCap = cap; ctx.lineJoin = "round"; ctx.stroke(); }
  // a wavy silhouette band: top edge y(x) from a few sines, filled down to y1
  function band(ctx, y, amp, waves, phase, y1, col, x0 = -300, x1 = W + 300) {
    ctx.beginPath(); ctx.moveTo(x0, y1);
    for (let x = x0; x <= x1; x += 16) {
      let yy = y; waves.forEach(([f, a], i) => { yy += Math.sin(x * f + phase * (i + 1) + i * 1.7) * amp * a; });
      ctx.lineTo(x, yy);
    }
    ctx.lineTo(x1, y1); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
  }

  // ================= ORCA (flat cartoon, side view; drawn facing left in a 1000-unit body, mirrored for dir=+1) =================
  const O = {
    body: "M 0 20 C 0 -50 60 -105 160 -118 C 300 -135 450 -122 580 -92 C 700 -66 790 -44 860 -34 L 905 -32 C 940 -80 990 -112 1035 -106 C 1005 -62 968 -22 948 0 C 968 22 1005 62 1035 106 C 990 112 940 80 905 32 L 860 34 C 780 50 660 86 520 102 C 380 116 220 112 120 88 C 50 72 0 52 0 20 Z",
    fin: "M 380 -122 C 420 -200 470 -292 528 -338 C 514 -262 530 -166 588 -90 Z",
    belly: "M 6 36 C 120 78 250 90 360 86 C 450 82 520 62 585 46 C 645 32 700 34 750 54 L 760 220 L -20 220 Z",
    flank: "M 560 58 C 600 18 655 -8 712 -6 C 700 26 664 52 620 72 Z",
    pec: "M 196 70 C 210 122 240 162 296 176 C 306 136 286 96 262 70 Z",
    mouth: "M 6 30 Q 60 46 128 38",
  };
  // o: {x, y, len, dir (+1 faces right), ang, beat (strokes/s), amp, ph, clipY (hide below this world y), pec}
  function orca(ctx, t, o) {
    const k = (o.len ?? 600) / 1000, dir = o.dir ?? 1, ph = t * Math.PI * 2 * (o.beat ?? 0.7) + (o.ph ?? 0), amp = o.amp ?? 0.05;
    const wv = (x, y) => { const u = clamp(x / 1000, 0, 1.05); return [x, y + amp * 1000 * Math.sin(ph - u * 4.2) * u * u - amp * 300 * Math.sin(ph) * 0.4]; };
    ctx.save();
    ctx.translate(o.x, o.y); ctx.rotate(o.ang ?? 0); ctx.scale(-dir * k, k); ctx.translate(-460, 0);
    const pa = Math.sin(ph + 0.8) * 0.12 + (o.pec ?? 0);
    const pecF = (side) => (x, y) => { const cx = 225, cy = 74, a = pa * side, dx = x - cx, dy = y - cy; return wv(cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)); };
    // far pectoral (behind)
    ctx.save(); ctx.translate(30, -6); fill(ctx, O.pec, "#121821", pecF(-1)); ctx.restore();
    // body: light rim on the back, darker below (shift trick)
    fill(ctx, O.fin, "#2b3a4e", wv); fill(ctx, O.body, "#2b3a4e", wv);
    ctx.save(); trace(ctx, O.body, wv); trace(ctx, O.fin, wv, false); ctx.clip();
    ctx.save(); ctx.translate(-6, 16); fill(ctx, O.body, "#1b2433", wv); fill(ctx, O.fin, "#1b2433", wv); ctx.restore();
    ctx.restore();
    ctx.save(); trace(ctx, O.body, wv); ctx.clip();
    fill(ctx, O.belly, "#f4f8fb", wv);
    ctx.save(); ctx.translate(0, 26); fill(ctx, O.belly, "#d3e2ec", wv); ctx.restore();
    fill(ctx, O.flank, "#f4f8fb", wv);
    trace(ctx, "M 520 -98 C 560 -116 640 -104 680 -78 C 640 -70 570 -72 520 -98 Z", wv); ctx.fillStyle = "rgba(170,186,204,0.55)"; ctx.fill();
    ctx.restore();
    // eye patch, eye, mouth
    { const [ex, ey] = wv(150, -40); ell(ctx, ex, ey, 54, 19, -0.14, "#f4f8fb"); }
    { const [ex, ey] = wv(104, -14); circ(ctx, ex, ey, 9, "#0b0f15"); circ(ctx, ex - 3, ey - 3, 3, "#ffffff"); }
    trace(ctx, O.mouth, wv); ctx.lineWidth = 5; ctx.strokeStyle = "#0e131b"; ctx.lineCap = "round"; ctx.stroke();
    fill(ctx, O.pec, "#1e2838", pecF(1));
    ctx.restore();
  }
  // world point of a body coordinate (to place splashes at the head or tail)
  function orcaPt(o, bx, by = 0) { const k = (o.len ?? 600) / 1000, dir = o.dir ?? 1, a = o.ang ?? 0; const lx = -dir * k * (bx - 460), ly = k * by; return [o.x + lx * Math.cos(a) - ly * Math.sin(a), o.y + lx * Math.sin(a) + ly * Math.cos(a)]; }

  // ================= small sea life =================
  function fish(ctx, t, x, y, s, col, col2, dir, seed) {
    ctx.save(); ctx.translate(x, y); ctx.scale(dir * s, s);
    const w = Math.sin(t * 9 + seed) * 0.35;
    ctx.save(); ctx.translate(-26, 0); ctx.rotate(w);
    trace(ctx, "M 4 0 L -22 -16 Q -16 0 -22 16 Z"); ctx.fillStyle = col2; ctx.fill(); ctx.restore();
    ell(ctx, 0, 0, 30, 16, 0, col);
    trace(ctx, "M -6 -15 Q 0 0 -6 15 L 2 15 Q 8 0 2 -15 Z"); ctx.fillStyle = col2; ctx.fill();
    circ(ctx, 16, -4, 4.5, "#ffffff"); circ(ctx, 17, -4, 2.4, "#14202a");
    ctx.restore();
  }
  function starfish(ctx, x, y, r, rot, col, dot) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.42 : r; const px = Math.cos(a) * rr, py = Math.sin(a) * rr; i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); }
    ctx.closePath(); ctx.lineJoin = "round"; ctx.lineWidth = r * 0.28; ctx.strokeStyle = col; ctx.fillStyle = col; ctx.stroke(); ctx.fill();
    for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * Math.PI * 2 / 5; circ(ctx, Math.cos(a) * r * 0.55, Math.sin(a) * r * 0.55, r * 0.07, dot); }
    circ(ctx, 0, 0, r * 0.09, dot); ctx.restore();
  }
  function shell(ctx, x, y, s, col, col2, rot = 0) {   // scallop
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    trace(ctx, "M 0 10 L -34 -14 C -30 -40 30 -40 34 -14 Z"); ctx.fillStyle = col; ctx.fill();
    for (let i = -3; i <= 3; i++) line(ctx, [[0, 8], [i * 10, -30 + Math.abs(i) * 3]], 2.4, col2);
    trace(ctx, "M -8 6 L 8 6 L 6 14 L -6 14 Z"); ctx.fillStyle = col2; ctx.fill(); ctx.restore();
  }
  function conch(ctx, x, y, s, rot = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot); ctx.scale(s, s);
    trace(ctx, "M -40 10 C -40 -14 -10 -30 20 -26 C 40 -22 50 -6 46 8 C 30 22 -20 26 -40 10 Z"); ctx.fillStyle = "#f8b9c4"; ctx.fill();
    trace(ctx, "M -40 10 C -20 0 10 -2 46 8 C 30 22 -20 26 -40 10 Z"); ctx.fillStyle = "#ef8fa3"; ctx.fill();
    for (let i = 0; i < 3; i++) line(ctx, [[-14 + i * 16, -24 + i * 2], [-6 + i * 16, 10]], 3, "#e98399");
    ctx.restore();
  }
  function rock(ctx, x, y, w, h, col, hi) {
    ell(ctx, x, y, w, h, 0, col); ell(ctx, x - w * 0.25, y - h * 0.35, w * 0.45, h * 0.3, -0.2, hi);
  }
  // branching coral made of round strokes, swaying a little
  function coral(ctx, t, x, y, s, col, shade, seed) {
    const r = rng(seed);
    const br = [];
    (function grow(px, py, a, len, w, d) {
      const sw = Math.sin(t * 1.1 + seed + d) * 0.05 * d;
      const ex = px + Math.sin(a + sw) * len, ey = py - Math.cos(a + sw) * len;
      br.push([px, py, ex, ey, w]);
      if (d < 3) { const n = d === 0 ? 3 : 2; for (let i = 0; i < n; i++) grow(ex, ey, a + (i - (n - 1) / 2) * (0.75 + r() * 0.3), len * (0.7 + r() * 0.15), w * 0.78, d + 1); }
    })(0, 0, 0, 70, 26, 0);
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (const [a, b, c, d, w] of br) line(ctx, [[a + 5, b + 3], [c + 5, d + 3]], w, shade);
    for (const [a, b, c, d, w] of br) line(ctx, [[a, b], [c, d]], w, col);
    for (const [a, b, c, d, w] of br) circ(ctx, c - w * 0.15, d - w * 0.15, w * 0.18, "rgba(255,255,255,0.35)");
    ctx.restore();
  }
  // fan coral (red, forked, flat)
  function fan(ctx, t, x, y, s, col, seed) {
    const r = rng(seed); ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    (function grow(px, py, a, len, w, d) {
      const sw = Math.sin(t * 0.9 + seed + d * 0.7) * 0.04 * d;
      const ex = px + Math.sin(a + sw) * len, ey = py - Math.cos(a + sw) * len;
      line(ctx, [[px, py], [ex, ey]], w, col);
      if (d < 4) { grow(ex, ey, a - 0.35 - r() * 0.2, len * 0.78, w * 0.75, d + 1); grow(ex, ey, a + 0.35 + r() * 0.2, len * 0.78, w * 0.75, d + 1); }
    })(0, 0, 0, 60, 16, 0);
    ctx.restore();
  }
  // tube sponges
  function tubes(ctx, x, y, s, col, inner, shade) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    for (const [dx, h, w] of [[-34, 90, 30], [0, 130, 34], [36, 70, 28]]) {
      trace(ctx, `M ${dx - w / 2} 0 L ${dx - w / 2} ${-h} L ${dx + w / 2} ${-h} L ${dx + w / 2} 0 Z`); ctx.fillStyle = col; ctx.fill();
      trace(ctx, `M ${dx + w * 0.15} 0 L ${dx + w * 0.15} ${-h} L ${dx + w / 2} ${-h} L ${dx + w / 2} 0 Z`); ctx.fillStyle = shade; ctx.fill();
      ell(ctx, dx, -h, w / 2 + 3, 9, 0, col); ell(ctx, dx, -h, w / 2 - 4, 6, 0, inner);
      for (let k = 1; k < 3; k++) ell(ctx, dx, -h * k / 3, w / 2 + 2, 5, 0, shade);
    }
    ctx.restore();
  }
  // kelp blade swaying from the bed
  function kelp(ctx, t, x, y, h, wd, col, shade, seed, n = 10) {
    const pts = []; let px = x, py = y, a = 0;
    for (let i = 0; i <= n; i++) { pts.push([px, py, a]); a = Math.sin(t * 1.3 + seed + i * 0.45) * 0.16 * (i / n + 0.2); px += Math.sin(a) * h / n; py -= Math.cos(a) * h / n; }
    const L = [], R = [];
    pts.forEach(([px, py, a], i) => { const w = wd * (1 - i / (n + 2)) * (0.8 + 0.2 * Math.sin(i * 1.3)); L.push([px - Math.cos(a) * w, py - Math.sin(a) * w]); R.push([px + Math.cos(a) * w, py + Math.sin(a) * w]); });
    ctx.beginPath(); ctx.moveTo(L[0][0], L[0][1]); L.forEach((p) => ctx.lineTo(p[0], p[1])); const tp = pts[n]; ctx.lineTo(tp[0], tp[1] - 10); R.reverse().forEach((p) => ctx.lineTo(p[0], p[1])); ctx.closePath();
    ctx.fillStyle = col; ctx.fill();
    line(ctx, pts.map((p) => [p[0], p[1]]), 3, shade);
  }
  function bubbles(ctx, t, n, seed, x0 = 0, x1 = W, sz = 1) {
    const r = rng(seed);
    for (let i = 0; i < n; i++) {
      const bx = lerp(x0, x1, r()), sp = 50 + r() * 70, off = r() * 2000, s = (4 + r() * 12) * sz;
      const y = H + 40 - ((t * sp + off) % (H + 120)), x = bx + Math.sin(t * 1.6 + i) * 10;
      ctx.beginPath(); ctx.arc(x, y, s, 0, Math.PI * 2); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,0.6)"; ctx.stroke();
      ctx.fillStyle = "rgba(255,255,255,0.12)"; ctx.fill();
      ctx.beginPath(); ctx.arc(x, y, s * 0.6, -2.4, -1.5); ctx.lineWidth = 2; ctx.strokeStyle = "rgba(255,255,255,0.85)"; ctx.stroke();
    }
  }
  function rays(ctx, t, n, x0, spread, tilt, alpha = 0.22, yEnd = H) {
    for (let i = 0; i < n; i++) {
      const xt = x0 + i * spread + Math.sin(t * 0.35 + i * 2.1) * 30, w1 = 18 + (i % 3) * 22, w2 = 70 + (i % 4) * 50, xb = xt + tilt;
      const g = ctx.createLinearGradient(0, -40, 0, yEnd);
      const a = alpha * (0.6 + 0.4 * Math.sin(t * 0.8 + i * 1.3));
      g.addColorStop(0, `rgba(255,255,255,${a})`); g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.beginPath(); ctx.moveTo(xt - w1, -40); ctx.lineTo(xt + w1, -40); ctx.lineTo(xb + w2, yEnd); ctx.lineTo(xb - w2, yEnd); ctx.closePath(); ctx.fillStyle = g; ctx.fill();
    }
  }
  function cloud(ctx, x, y, s, col = "#ffffff") {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = col; ctx.beginPath();
    ctx.arc(-60, 0, 38, Math.PI, 0); ctx.arc(-10, -16, 52, Math.PI, 0); ctx.arc(50, 0, 40, Math.PI, 0); ctx.closePath(); ctx.fill();
    ctx.fillRect(-98, -1, 188, 16); ctx.restore();
  }
  function gull(ctx, t, x, y, s, seed) {
    const f = Math.sin(t * 7 + seed) * 0.5;
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    line(ctx, [[-30, -10 + f * 30], [-12, 0], [0, 2], [12, 0], [30, -10 + f * 30]], 6, "#ffffff");
    ctx.restore();
  }

  // ================= CARTOON PEOPLE (side / three-quarter view, facing right; flip for left) =================
  // o: {x, y (feet), h (height px), kid, skin, hair, hairStyle: "short"|"long"|"pony", shirt, shirt2, pants, skirt, shoe, walk (cycles/s), w (0..1 walking), ph,
  //     point (0..1 near arm points forward-up), wave, flip, look (0..1 head turns up)}
  function person(ctx, t, o) {
    const Hh = o.h ?? 330, kid = !!o.kid, r = Hh * (kid ? 0.105 : 0.078);
    const w = o.w ?? 0, ph = t * Math.PI * 2 * (o.walk ?? 0.9) + (o.ph ?? 0);
    const bob = -w * Hh * 0.012 * Math.abs(Math.cos(ph)) + Math.sin(t * 1.6 + (o.ph ?? 0)) * Hh * 0.002;
    const hipY = -Hh * (kid ? 0.44 : 0.48) + bob, shY = -Hh * (kid ? 0.70 : 0.79) + bob;
    const thigh = Hh * (kid ? 0.21 : 0.245), shin = Hh * (kid ? 0.2 : 0.225), up = Hh * (kid ? 0.15 : 0.165), fore = Hh * (kid ? 0.14 : 0.15);
    const legW = Hh * (kid ? 0.075 : 0.07), armW = Hh * (kid ? 0.055 : 0.05);
    const dk = (c) => shade(c, -0.18);
    ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.flip ? -1 : 1, 1);
    const leg = (side, col, shoeC) => {
      const s = side ? Math.PI : 0;
      const a = w * 0.42 * Math.sin(ph + s), kb = w * 0.7 * Math.max(0, Math.sin(ph + s + 1.6));
      const hx = side ? -Hh * 0.01 : Hh * 0.012, kx = hx + Math.sin(a) * thigh, ky = hipY + Math.cos(a) * thigh;
      const ax = kx + Math.sin(a - kb) * shin, ay = Math.min(-Hh * 0.02, ky + Math.cos(a - kb) * shin);
      line(ctx, [[hx, hipY], [kx, ky], [ax, ay]], legW, col);
      const fa = (a - kb) * 0.6;
      ctx.save(); ctx.translate(ax, ay); ctx.rotate(fa); trace(ctx, `M ${-legW * 0.5} ${-legW * 0.3} L ${legW * 1.25} ${-legW * 0.1} C ${legW * 1.6} 0 ${legW * 1.6} ${legW * 0.55} ${legW * 1.2} ${legW * 0.55} L ${-legW * 0.55} ${legW * 0.55} Z`); ctx.fillStyle = shoeC; ctx.fill(); ctx.restore();
    };
    const arm = (side, col, sleeve, pointK) => {
      const s = side ? Math.PI : 0;
      let a = -w * 0.38 * Math.sin(ph + s) + 0.06, eb = 0.25 + w * 0.2 * (1 + Math.sin(ph + s));
      if (o.wave && side === 0) { a = lerp(a, 2.7, o.wave); eb = lerp(eb, 0.5 + Math.sin(t * 9) * 0.35, o.wave); }
      if (pointK) { a = lerp(a, 2.15, pointK); eb = lerp(eb, 0.08, pointK); }
      if (o.reach) { a = lerp(a, 0.95 + (side ? 0.15 : 0), o.reach); eb = lerp(eb, 0.15, o.reach); }
      if (o.binoc && !pointK) { a = lerp(a, 2.6, o.binoc); eb = lerp(eb, 1.9, o.binoc); }
      const sx = side ? -Hh * 0.025 : Hh * 0.02, ex = sx + Math.sin(a) * up, ey = shY + Hh * 0.02 + Math.cos(a) * up;
      const wx = ex + Math.sin(a + eb) * fore, wy = ey + Math.cos(a + eb) * fore;
      line(ctx, [[ex, ey], [wx, wy]], armW * 0.92, side ? dk(o.skin) : o.skin);
      circ(ctx, wx + Math.sin(a + eb) * armW * 0.3, wy + Math.cos(a + eb) * armW * 0.3, armW * 0.62, side ? dk(o.skin) : o.skin);
      if (pointK > 0.6) { const fx = wx + Math.sin(a + eb) * armW * 1.3, fy = wy + Math.cos(a + eb) * armW * 1.3; line(ctx, [[wx, wy], [fx, fy]], armW * 0.32, o.skin); }
      line(ctx, [[sx, shY + Hh * 0.02], [ex, ey]], armW * 1.15, sleeve);
    };
    // far side first
    arm(1, dk(o.shirt), dk(o.shirt), 0);
    leg(1, o.skirt ? dk(o.skin) : dk(o.pants), dk(o.shoe));
    // torso
    const tw = Hh * (kid ? 0.16 : 0.17);
    if (!o.skirt) leg(0, o.pants, o.shoe);
    trace(ctx, `M ${-tw * 0.5} ${shY + Hh * 0.01} C ${-tw * 0.62} ${shY + Hh * 0.12} ${-tw * 0.55} ${hipY - Hh * 0.04} ${-tw * 0.5} ${hipY + Hh * 0.025} L ${tw * 0.52} ${hipY + Hh * 0.025} C ${tw * 0.6} ${hipY - Hh * 0.06} ${tw * 0.62} ${shY + Hh * 0.1} ${tw * 0.45} ${shY} Z`);
    ctx.fillStyle = o.shirt; ctx.fill();
    trace(ctx, `M ${-tw * 0.5} ${shY + Hh * 0.01} C ${-tw * 0.62} ${shY + Hh * 0.12} ${-tw * 0.55} ${hipY - Hh * 0.04} ${-tw * 0.5} ${hipY + Hh * 0.025} L ${-tw * 0.18} ${hipY + Hh * 0.025} C ${-tw * 0.25} ${hipY - Hh * 0.08} ${-tw * 0.25} ${shY + Hh * 0.1} ${-tw * 0.12} ${shY} Z`);
    ctx.fillStyle = o.shirt2 || dk(o.shirt); ctx.fill();
    if (o.skirt) {   // skirt or dress below the waist
      const sw = Math.sin(ph) * w * Hh * 0.02;
      trace(ctx, `M ${-tw * 0.52} ${hipY} L ${tw * 0.54} ${hipY} L ${tw * 0.78 + sw} ${hipY + Hh * 0.2} L ${-tw * 0.8 + sw} ${hipY + Hh * 0.2} Z`); ctx.fillStyle = o.skirt; ctx.fill();
      trace(ctx, `M ${-tw * 0.52} ${hipY} L ${-tw * 0.1} ${hipY} L ${-tw * 0.18 + sw} ${hipY + Hh * 0.2} L ${-tw * 0.8 + sw} ${hipY + Hh * 0.2} Z`); ctx.fillStyle = dk(o.skirt); ctx.fill();
      ctx.save(); ctx.translate(0, 0); leg(0, o.skin, o.shoe); ctx.restore();
      trace(ctx, `M ${-tw * 0.52} ${hipY} L ${tw * 0.54} ${hipY} L ${tw * 0.7 + sw} ${hipY + Hh * 0.14} L ${-tw * 0.7 + sw} ${hipY + Hh * 0.14} Z`); ctx.fillStyle = o.skirt; ctx.fill();
    }
    // neck and head
    const look = o.look ?? 0, hx = Hh * 0.012, hy = shY - r * 1.05;
    line(ctx, [[0, shY + 4], [hx * 0.6, shY - r * 0.4]], r * 0.55, dk(o.skin));
    ctx.save(); ctx.translate(hx, hy); ctx.rotate(-look * 0.35);
    // back hair
    if (o.hairStyle === "long") { trace(ctx, `M ${-r * 0.95} ${-r * 0.3} C ${-r * 1.25} ${r * 0.8} ${-r * 1.1} ${r * 1.9} ${-r * 0.55} ${r * 2.0} L ${r * 0.1} ${r * 1.4} L ${r * 0.2} ${-r * 0.2} Z`); ctx.fillStyle = o.hair; ctx.fill(); }
    if (o.hairStyle === "pony") { const sw = Math.sin(ph * 1 + 0.5) * w * 0.25 + Math.sin(t * 2) * 0.05; ctx.save(); ctx.translate(-r * 0.85, -r * 0.35); ctx.rotate(0.5 + sw); trace(ctx, `M 0 0 C ${-r * 0.5} ${r * 0.2} ${-r * 0.6} ${r * 1.0} ${-r * 0.2} ${r * 1.3} C ${r * 0.1} ${r * 0.9} ${r * 0.2} ${r * 0.3} ${r * 0.1} 0 Z`); ctx.fillStyle = o.hair; ctx.fill(); ctx.restore(); circ(ctx, -r * 0.85, -r * 0.35, r * 0.17, o.tie || "#ff6b8b"); }
    // face
    circ(ctx, 0, 0, r, o.skin);
    trace(ctx, `M ${r * 0.2} ${r * 0.55} C ${r * 0.55} ${r * 1.02} ${r * 1.0} ${r * 0.62} ${r * 0.98} ${r * 0.12} L ${r * 0.4} 0 Z`); ctx.fillStyle = o.skin; ctx.fill();
    ell(ctx, -r * 0.18, r * 0.08, r * 0.17, r * 0.22, 0, dk(o.skin));   // ear
    // front hair cap
    if (o.hairStyle === "short") trace(ctx, `M ${-r * 1.0} ${r * 0.15} C ${-r * 1.15} ${-r * 0.9} ${-r * 0.2} ${-r * 1.35} ${r * 0.55} ${-r * 0.95} C ${r * 0.95} ${-r * 0.75} ${r * 1.05} ${-r * 0.45} ${r * 0.95} ${-r * 0.35} C ${r * 0.55} ${-r * 0.5} ${r * 0.2} ${-r * 0.5} ${-r * 0.02} ${-r * 0.32} C ${-r * 0.25} ${-r * 0.1} ${-r * 0.5} ${r * 0.1} ${-r * 0.62} ${r * 0.32} Z`);
    else trace(ctx, `M ${-r * 1.02} ${r * 0.35} C ${-r * 1.2} ${-r * 0.9} ${-r * 0.2} ${-r * 1.4} ${r * 0.6} ${-r * 0.95} C ${r * 1.0} ${-r * 0.7} ${r * 1.08} ${-r * 0.3} ${r * 1.0} ${-r * 0.1} C ${r * 0.7} ${-r * 0.5} ${r * 0.3} ${-r * 0.55} ${r * 0.05} ${-r * 0.4} C ${-r * 0.2} ${-r * 0.2} ${-r * 0.45} ${r * 0.05} ${-r * 0.55} ${r * 0.4} Z`);
    ctx.fillStyle = o.hair; ctx.fill();
    // eye, brow, nose, smile, blush
    const blink = ((t + (o.ph ?? 0)) % 3.7) < 0.12 ? 0.15 : 1;
    ell(ctx, r * 0.52, -r * 0.06, r * 0.11, r * 0.15 * blink, 0, "#2a1a14");
    if (blink > 0.5) circ(ctx, r * 0.55, -r * 0.12, r * 0.04, "#ffffff");
    line(ctx, [[r * 0.38, -r * 0.34], [r * 0.68, -r * 0.36]], r * 0.07, shade(o.hair, -0.1));
    trace(ctx, `M ${r * 0.95} ${-r * 0.05} Q ${r * 1.14} ${r * 0.16} ${r * 0.94} ${r * 0.24}`); ctx.lineWidth = r * 0.06; ctx.strokeStyle = dk(o.skin); ctx.stroke();
    trace(ctx, `M ${r * 0.52} ${r * 0.42} Q ${r * 0.72} ${r * 0.58} ${r * 0.88} ${r * 0.4}`); ctx.lineWidth = r * 0.07; ctx.strokeStyle = "#7a2e22"; ctx.lineCap = "round"; ctx.stroke();
    circ(ctx, r * 0.3, r * 0.3, r * 0.14, "rgba(255,120,110,0.28)");
    ctx.restore();
    // near arm on top
    arm(0, o.shirt, o.shirt, o.point || 0);
    ctx.restore();
  }
  // lighten (+) or darken (-) a hex colour
  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = (c) => Math.round(k < 0 ? c * (1 + k) : c + (255 - c) * k);
    return `rgb(${f(r)},${f(g)},${f(b)})`;
  }

  // ================= SCENES =================
  const SC = {};

  // 1. Sunlit seabed: gradient water, rays, layered blue hills, a sunken boat, corals and kelp; an orca and a fish school cross.
  SC.seabed = (ctx, t, o = {}) => {
    const cam = (o.cam0 ?? 0) + t * (o.camV ?? 18);
    ctx.fillStyle = vgrad(ctx, 0, H, ["#1592d8", "#2fb3e8", "#73d6f3"]); ctx.fillRect(0, 0, W, H);
    // surface band with darker dashes
    ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(0, 0, W, 70);
    { const r = rng(4); for (let i = 0; i < 26; i++) { const x = ((r() * 2400 - cam * 0.3 + t * 25) % 2400) - 240, y = 20 + r() * 110; line(ctx, [[x, y], [x + 30, y - 6], [x + 60, y]], 5, "rgba(10,90,150,0.35)"); } }
    rays(ctx, t, 7, 260 - cam * 0.1, 260, -260, 0.24);
    ctx.save(); ctx.translate(-cam * 0.15, 0);
    band(ctx, 610, 60, [[0.0021, 1], [0.0053, 0.4]], 0.0, H, "#8bd9f1");
    ctx.restore();
    // sunken boat on the far ridge
    ctx.save(); ctx.translate(1180 - cam * 0.25, 640); ctx.rotate(-0.12); ctx.fillStyle = "#5fb7df";
    trace(ctx, "M -170 0 L 170 0 L 130 50 L -140 50 Z"); ctx.fill();
    ctx.fillRect(-60, -160, 8, 160); ctx.fillRect(40, -120, 7, 120); line(ctx, [[-56, -160], [44, -120]], 3, "#5fb7df"); line(ctx, [[-56, -150], [-160, 0]], 3, "#5fb7df");
    ctx.restore();
    ctx.save(); ctx.translate(-cam * 0.25, 0);
    band(ctx, 700, 50, [[0.0027, 1], [0.0071, 0.35]], 1.0, H, "#5ec0e8");
    ctx.restore();
    ctx.save(); ctx.translate(-cam * 0.4, 0);
    band(ctx, 790, 40, [[0.0031, 1], [0.009, 0.3]], 2.0, H, "#3ea7dc");
    ctx.restore();
    // fish school far
    for (let i = 0; i < 14; i++) { const r = rng(100 + i); const fx = ((r() * 600 + t * 90) % 2600) - 300 - cam * 0.5, fy = 420 + Math.sin(t * 1.2 + i * 0.6) * 30 + r() * 120; fish(ctx, t, fx, fy, 0.55, "#ffcf3f", "#ff8f2e", 1, i); }
    // the orca
    if (o.orca !== false) {
      const p = clamp(t / (o.orcaT ?? 9)); const ox = lerp(-500, W + 500, p) - cam * 0.6;
      orca(ctx, t, { x: ox, y: 560 + Math.sin(t * 0.9) * 18, len: o.orcaLen ?? 700, dir: 1, ang: Math.cos(t * 0.9) * 0.04, beat: 0.75, amp: 0.045 });
    }
    // sand
    ctx.save(); ctx.translate(-cam, 0);
    band(ctx, 900, 22, [[0.004, 1], [0.011, 0.4]], 0.5, H + 10, "#e8bf7c", -400, 4800);
    band(ctx, 920, 22, [[0.004, 1], [0.011, 0.4]], 0.5, H + 10, "#f5d9a2", -400, 4800);
    { const r = rng(9); for (let i = 0; i < 40; i++) { const x = r() * 4400 - 200, y = 950 + r() * 110; line(ctx, [[x, y], [x + 26, y - 4], [x + 52, y]], 4, "rgba(214,170,104,0.6)"); } }
    // bed life (drawn 1.35x, anchored at the sand line)
    ctx.save(); ctx.translate(0, 960); ctx.scale(1.35, 1.35); ctx.translate(0, -960);
    kelp(ctx, t, 120, 940, 330, 26, "#4fbf63", "#3a9c4c", 1); kelp(ctx, t, 170, 950, 250, 20, "#62cf6e", "#3a9c4c", 2);
    coral(ctx, t, 420, 960, 1.0, "#ff5f8f", "#d63c6c", 3);
    fan(ctx, t, 700, 950, 1.3, "#ef4b3c", 5);
    tubes(ctx, 980, 965, 1.0, "#f6b93f", "#b8701b", "#e19b2a");
    rock(ctx, 1200, 975, 80, 42, "#3f5466", "#5b7387");
    coral(ctx, t, 1420, 965, 0.85, "#a76bf0", "#7e47c9", 11);
    kelp(ctx, t, 1640, 950, 300, 24, "#4fbf63", "#3a9c4c", 4); kelp(ctx, t, 1700, 960, 210, 18, "#7ad97a", "#3a9c4c", 6);
    fan(ctx, t, 1900, 955, 1.1, "#ff7a4a", 8);
    tubes(ctx, 2180, 965, 0.9, "#ff8fb0", "#c2466e", "#ec6f95");
    coral(ctx, t, 2420, 965, 1.0, "#ff5f8f", "#d63c6c", 13);
    kelp(ctx, t, 2650, 950, 340, 26, "#4fbf63", "#3a9c4c", 7);
    starfish(ctx, 560, 1010, 30, 0.3, "#ff7b3d", "#ffd2a8"); starfish(ctx, 1320, 1040, 24, -0.4, "#ff9a3d", "#ffe1b8"); starfish(ctx, 2050, 1020, 28, 0.1, "#ff7b3d", "#ffd2a8");
    shell(ctx, 860, 1035, 0.9, "#ffe0b0", "#e2a965", -0.2); conch(ctx, 1560, 1025, 1.0, 0.1); shell(ctx, 2300, 1040, 0.8, "#ffc6d0", "#e48ca0", 0.3);
    rock(ctx, 300, 1030, 40, 22, "#3f5466", "#5b7387"); rock(ctx, 1800, 1040, 34, 18, "#3f5466", "#5b7387");
    ctx.restore();
    ctx.restore();
    // near fish pass in front
    for (let i = 0; i < 5; i++) { const r = rng(300 + i); const fx = W + 200 - ((r() * 500 + t * 160) % 2600), fy = 760 + r() * 80 + Math.sin(t * 2 + i) * 10; fish(ctx, t, fx, fy, 1.0, "#ff6b6b", "#ffd166", -1, i); }
    bubbles(ctx, t, 26, 21);
  };

  // 2. Flat sea under a bright sky: a fishing boat bobs, gulls circle, orca backs and fins roll through the swell with blows.
  SC.boat = (ctx, t, o = {}) => {
    const hz = 560;
    ctx.fillStyle = vgrad(ctx, 0, hz, ["#7fd8f2", "#b7ecf8", "#e2f8fc"]); ctx.fillRect(0, 0, W, hz);
    cloud(ctx, ((300 + t * 12) % 2300) - 200, 170, 1.2); cloud(ctx, ((1300 + t * 8) % 2300) - 200, 110, 0.8, "rgba(255,255,255,0.85)"); cloud(ctx, ((1900 + t * 10) % 2300) - 200, 260, 0.9);
    ctx.fillStyle = "#c9f2fa"; ctx.fillRect(0, hz - 6, W, 8);
    ctx.fillStyle = vgrad(ctx, hz, H, ["#56cbe0", "#35b2d2", "#1e95bf"]); ctx.fillRect(0, hz, W, H - hz);
    const sea = (y, amp, col, sp, ph) => band(ctx, y, amp, [[0.006, 1], [0.013, 0.3]], ph + t * sp, H, col);
    sea(650, 8, "rgba(40,170,205,0.55)", 0.6, 0);
    // orcas: each one rolls up through the surface on an arc, blows, and sinks again
    const rollers = o.orcas ?? [[1.0, 1330, 520], [2.9, 1640, 440], [4.6, 1250, 480]];
    const wl = 700;
    for (const [t0, x0, len] of rollers) {
      const u = (t - t0) / 3.2; if (u < -0.05 || u > 1.05) continue;
      const lift = Math.sin(clamp(u) * Math.PI);
      const oo = { x: x0 + u * 260, y: wl + 75 - lift * 45, len, dir: 1, ang: lerp(-0.18, 0.2, clamp(u)), beat: 0.35, amp: 0.02 };
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, wl + 4); ctx.clip(); orca(ctx, t, oo); ctx.restore();
      // foam where the back meets the water
      const fw = len * 0.55 * lift; ell(ctx, oo.x, wl + 4, fw, 9, 0, "rgba(255,255,255,0.85)");
      // blow: a puff of spray from the blowhole early in the roll
      const bu = (u - 0.12) / 0.35;
      if (bu > 0 && bu < 1) { const [bx, by] = orcaPt(oo, 210, -120); const r = rng(Math.floor(t0 * 10)); for (let i = 0; i < 14; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 0.8, d = bu * (80 + r() * 90); circ(ctx, bx + Math.cos(a) * d, by + Math.sin(a) * d * 1.4, (8 + r() * 10) * (1 - bu * 0.6), `rgba(255,255,255,${0.85 * (1 - bu)})`); } }
    }
    sea(wl, 10, "#2fadd0", 0.8, 1.3);
    // the boat
    const bx = 620 + (o.boatV ?? 10) * t, by = 740 + Math.sin(t * 1.4) * 8, br = Math.sin(t * 1.1) * 0.025;
    ctx.save(); ctx.translate(bx, by); ctx.rotate(br);
    // wheelhouse, mast, rigging
    line(ctx, [[60, -100], [60, -420]], 9, "#7a8794"); line(ctx, [[60, -400], [330, -230]], 4, "#7a8794"); line(ctx, [[60, -380], [-300, -60]], 3, "#9aa6b1");
    { const f = Math.sin(t * 6); trace(ctx, `M 64 -420 C 90 ${-430 + f * 6} 110 ${-410 - f * 6} 136 -416 L 128 -398 L 136 -380 C 110 ${-376 - f * 5} 90 ${-392 + f * 5} 64 -384 Z`); ctx.fillStyle = "#ffb02e"; ctx.fill(); }
    ctx.fillStyle = "#e9eef2"; ctx.fillRect(-10, -190, 190, 120); ctx.fillStyle = "#c7d0d8"; ctx.fillRect(110, -190, 70, 120);
    ctx.fillStyle = "#2e7fa6"; ctx.fillRect(-14, -206, 200, 20);
    for (let i = 0; i < 3; i++) { ctx.fillStyle = "#3a5466"; ctx.fillRect(4 + i * 46, -168, 34, 30); ctx.fillStyle = "rgba(255,255,255,0.35)"; ctx.fillRect(4 + i * 46, -168, 12, 30); }
    ctx.fillStyle = "#59636d"; ctx.fillRect(-60, -150, 16, 80);
    // fishermen on deck
    person(ctx, t, { x: -220, y: -72, h: 150, skin: "#c98b5e", hair: "#2a1b12", hairStyle: "short", shirt: "#e05252", pants: "#3b4a63", shoe: "#2a2a2a", w: 0, ph: 1 });
    person(ctx, t, { x: -120, y: -72, h: 156, skin: "#a86d45", hair: "#1c120c", hairStyle: "short", shirt: "#f2c23a", pants: "#4a5a70", shoe: "#2a2a2a", w: 0, ph: 2, point: smooth(1.4, 2.0, t), look: smooth(1.4, 2.0, t) * 0.4 });
    person(ctx, t, { x: 250, y: -72, h: 150, skin: "#d9a074", hair: "#4a2c1a", hairStyle: "short", shirt: "#4fae6d", pants: "#33435a", shoe: "#2a2a2a", w: 0, ph: 3, wave: smooth(3.0, 3.4, t) * (1 - smooth(5.5, 6.0, t)) });
    // hull
    trace(ctx, "M -470 -110 L 420 -80 C 440 -60 430 -20 400 30 L -360 40 C -420 0 -460 -60 -470 -110 Z"); ctx.fillStyle = "#f4f6f8"; ctx.fill();
    trace(ctx, "M -470 -110 L 420 -80 L 420 -60 L -462 -88 Z"); ctx.fillStyle = "#e4574a"; ctx.fill();
    trace(ctx, "M -400 0 L 418 -6 C 412 10 406 20 400 30 L -360 40 C -376 30 -390 16 -400 0 Z"); ctx.fillStyle = "#1f4f7a"; ctx.fill();
    trace(ctx, "M -470 -110 L 420 -80 C 440 -60 430 -20 400 30 L 360 30 C 390 -20 396 -54 380 -78 Z"); ctx.fillStyle = "rgba(0,40,70,0.12)"; ctx.fill();
    for (const lx of [-280, -60, 170]) { ctx.beginPath(); ctx.arc(lx, -50, 22, 0, Math.PI * 2); ctx.lineWidth = 12; ctx.strokeStyle = "#ff8a2a"; ctx.stroke(); for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(lx, -50, 22, k * Math.PI / 2, k * Math.PI / 2 + 0.35); ctx.strokeStyle = "#fff"; ctx.stroke(); } }
    ctx.restore();
    // water over the hull bottom and near swell
    ell(ctx, bx, by + 38, 470, 14, 0, "rgba(255,255,255,0.55)");
    sea(800, 12, "#2aa6cb", 1.0, 2.1);
    sea(900, 14, "#2399c2", 1.2, 3.0);
    { const r = rng(7); for (let i = 0; i < 22; i++) { const x = ((r() * 2200 + t * (30 + r() * 30)) % 2200) - 140, y = 720 + r() * 340; line(ctx, [[x, y], [x + 40, y - 5], [x + 80, y]], 4, "rgba(255,255,255,0.45)"); } }
    for (let i = 0; i < 4; i++) { const r = rng(50 + i); gull(ctx, t, ((r() * 1800 + t * (40 + r() * 30)) % 2200) - 150, 140 + r() * 220 + Math.sin(t + i) * 20, 0.9 + r() * 0.5, i * 3); }
  };

  // 3. Sunset shore: big sun, warm hills, a wooden house, a family walks the boardwalk and stops to point as an orca breaches.
  SC.shore = (ctx, t, o = {}) => {
    const hz = 600;
    ctx.fillStyle = vgrad(ctx, 0, hz, ["#f2843a", "#f8ad44", "#ffd977"]); ctx.fillRect(0, 0, W, hz);
    const sx = 1330, sy = 470;
    for (let k = 4; k > 0; k--) circ(ctx, sx, sy, 120 + k * 46, `rgba(255,236,160,${0.12})`);
    circ(ctx, sx, sy, 120, "#fff1c2");
    cloud(ctx, 520 + t * 6, 190, 1.4, "rgba(255,226,170,0.7)"); cloud(ctx, 1650 - t * 5, 260, 1.0, "rgba(255,214,150,0.6)");
    band(ctx, 545, 30, [[0.004, 1], [0.009, 0.4]], 0.4, hz + 2, "#e79a5c", -100, 1000);
    band(ctx, 575, 22, [[0.005, 1], [0.012, 0.4]], 1.4, hz + 2, "#c87a4e", -100, 760);
    // sea with the sun's glitter path
    ctx.fillStyle = vgrad(ctx, hz, 860, ["#f3b65e", "#d99a62", "#4e8fae"]); ctx.fillRect(0, hz, W, 260);
    { const r = rng(12); for (let i = 0; i < 30; i++) { const y = hz + 8 + r() * 200, wd = 30 + r() * 120 * (1 - (y - hz) / 300), x = sx + (r() - 0.5) * 260 * (0.6 + (y - hz) / 200) + Math.sin(t * 2 + i) * 8; ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 3 + i * 1.7); line(ctx, [[x - wd / 2, y], [x + wd / 2, y]], 4, "#fff2c0"); } ctx.globalAlpha = 1; }
    // the breach
    const bt = o.breach ?? 3.6, u = (t - bt) / 1.9, wl = 760;
    if (u > -0.1 && u < 1.3) {
      const uu = clamp(u), x = lerp(1380, 1760, uu), y = wl + 120 - Math.sin(uu * Math.PI) * 330, ang = lerp(-1.0, 1.1, uu);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, W, wl + 2); ctx.clip(); orca(ctx, t, { x, y, len: 420, dir: 1, ang, beat: 0.9, amp: 0.03 }); ctx.restore();
      const sp = (cx, age) => { if (age < 0 || age > 1) return; const r = rng(Math.floor(cx)); for (let i = 0; i < 18; i++) { const a = -Math.PI / 2 + (r() - 0.5) * 1.8, v = 140 + r() * 160; const px = cx + Math.cos(a) * v * age, py = wl - Math.sin(-a) * v * age * 1.4 + 300 * age * age; circ(ctx, px, py, (6 + r() * 8) * (1 - age * 0.5), `rgba(255,255,255,${0.9 * (1 - age)})`); } ell(ctx, cx, wl + 2, 90 + age * 120, 10 + age * 6, 0, `rgba(255,255,255,${0.8 * (1 - age)})`); };
      sp(1400, (t - bt - 0.15) / 1.2); sp(1745, (t - bt - 1.75) / 1.3);
    }
    // beach and boardwalk
    band(ctx, 850, 10, [[0.004, 1]], 0.3, H, "#f2c98a");
    band(ctx, 870, 10, [[0.004, 1]], 1.3, H, "#e6b676");
    // tree silhouette at left
    ctx.save(); ctx.translate(150, 900);
    (function br(x, y, a, len, wd, d) { const ex = x + Math.sin(a) * len, ey = y - Math.cos(a) * len; line(ctx, [[x, y], [ex, ey]], wd, "#3b261a"); if (d < 5) { br(ex, ey, a - 0.45 + Math.sin(d * 3) * 0.1, len * 0.74, wd * 0.68, d + 1); br(ex, ey, a + 0.4 + Math.cos(d * 2) * 0.1, len * 0.7, wd * 0.66, d + 1); } })(0, 0, 0.22, 260, 38, 0);
    ctx.restore();
    // house on the left bank
    ctx.save(); ctx.translate(420, 860);
    trace(ctx, "M -150 0 L -150 -190 L 0 -300 L 150 -190 L 150 0 Z"); ctx.fillStyle = "#c99a6b"; ctx.fill();
    trace(ctx, "M 20 0 L 20 -285 L 150 -190 L 150 0 Z"); ctx.fillStyle = "#b5865a"; ctx.fill();
    for (let k = -140; k < 150; k += 22) line(ctx, [[k, -6], [k, -190 + Math.max(0, 0)]], 2, "rgba(90,58,32,0.25)");
    trace(ctx, "M -175 -180 L 0 -318 L 175 -180 L 160 -168 L 0 -296 L -160 -168 Z"); ctx.fillStyle = "#6e4630"; ctx.fill();
    ctx.fillStyle = "#4b3326"; ctx.fillRect(-40, -110, 64, 110);
    for (const wx of [-120, 70]) { ctx.fillStyle = "#ffdf8a"; ctx.fillRect(wx, -150, 52, 46); ctx.fillStyle = "#6e4630"; ctx.fillRect(wx + 24, -150, 4, 46); ctx.fillRect(wx, -129, 52, 4); }
    ctx.restore();
    // family walks in from the left, stops, points at the breach
    const stop = bt - 0.6, walkX = (x0, x1) => lerp(x0, x1, clamp(t / stop)) + 0 * t, wk = 1 - smooth(stop - 0.4, stop, t);
    const pt = smooth(bt + 0.1, bt + 0.5, t), lk = smooth(bt, bt + 0.4, t);
    person(ctx, t, { x: walkX(560, 900), y: 980, h: 360, skin: "#f1c7a0", hair: "#3a2416", hairStyle: "long", shirt: "#f4f0e6", pants: "#7a4fa0", skirt: "#8a56b8", shoe: "#5a3a8a", w: wk, walk: 0.85, ph: 0.6, look: lk * 0.5 });
    person(ctx, t, { x: walkX(470, 820), y: 990, h: 230, kid: true, skin: "#f3cba6", hair: "#2c1a10", hairStyle: "pony", shirt: "#ff9a4d", pants: "#6a4632", skirt: "#7b4a35", shoe: "#c2405a", w: wk, walk: 1.1, ph: 2.2, point: pt, look: lk });
    person(ctx, t, { x: walkX(680, 1020), y: 975, h: 385, skin: "#e9b98f", hair: "#22160e", hairStyle: "short", shirt: "#3a8fd6", pants: "#5b5f6a", shoe: "#3a2a20", w: wk, walk: 0.8, ph: 1.4, point: smooth(bt + 0.4, bt + 0.8, t) * 0.9, look: lk * 0.6 });
    // fence posts and rope in front
    ctx.fillStyle = "#a8703f"; ctx.fillRect(0, 1000, W, 80); for (let x = -40; x < W; x += 90) line(ctx, [[x, 1000], [x, 1080]], 3, "rgba(80,48,24,0.4)");
    for (let i = 0; i < 6; i++) { const x = 80 + i * 360; trace(ctx, `M ${x - 18} 1080 L ${x - 18} 900 Q ${x} 880 ${x + 18} 900 L ${x + 18} 1080 Z`); ctx.fillStyle = "#6b4426"; ctx.fill(); ctx.fillStyle = "#57361e"; ctx.fillRect(x + 4, 900, 14, 180); if (i < 5) { trace(ctx, `M ${x} 930 Q ${x + 180} 980 ${x + 360} 930`); ctx.lineWidth = 6; ctx.strokeStyle = "#d9b77a"; ctx.stroke(); } }
  };

  return { W, H, SC, orca, orcaPt, person, fish, smooth, clamp, lerp, rng, parse, trace, fill, vgrad, ell, circ, line, band, starfish, shell, conch, rock, coral, fan, tubes, kelp, bubbles, rays, cloud, gull, shade };
})();
