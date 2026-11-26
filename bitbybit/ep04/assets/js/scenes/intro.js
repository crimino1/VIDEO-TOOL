/* EP4 Builder A (cold open, index, finale): two_worlds, def_machine, alive_reveal, cabinet, textbook, weird_hw.
   Documentary look: dark neutral night, warm cream lamp light, one or two natural accents per scene. PX.D only. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, P = PX.p, clamp = PX.clamp, lerp = PX.lerp;
  const TAU = Math.PI * 2;

  // ---------- colour (all derived from PX.D) ----------
  const hex = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { k = clamp(k, 0, 1); const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const WB = mix(mix(D.rust[2], D.amber[2], 0.35), D.n3, 0.3);                       // warm brown wood
  const WOOD = [mix(WB, D.lamp, 0.32), WB, mix(WB, D.n0, 0.45), mix(WB, D.n0, 0.72)];
  const WALN = [mix(WB, D.lamp, 0.12), mix(WB, D.n1, 0.38), mix(WB, D.n0, 0.62), mix(WB, D.n0, 0.82)];   // dark museum walnut
  const BRASS = [mix(D.amber[0], D.lamp, 0.5), mix(D.amber[1], D.amber[2], 0.55), D.amber[2], mix(D.amber[2], D.n0, 0.5)];
  const SKIN = [mix(D.rose[0], D.lamp, 0.3), mix(D.rose[1], D.lampD, 0.45), mix(D.rose[2], D.lampD, 0.25)];
  const GLASS = D.glass;
  const BLK = "#000";   // shadows only

  // ---------- geometry ----------
  const poly = (g, pts, col) => {
    let y0 = Infinity, y1 = -Infinity;
    for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (col) g.fillStyle = col;
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = [], yc = y + 0.5;
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
    }
  };
  const ell = (g, cx, cy, rx, ry, col) => {
    if (col) g.fillStyle = col; const n = Math.max(0, Math.round(ry));
    if (n === 0) { g.fillRect(Math.round(cx - rx), Math.round(cy), Math.round(2 * rx) + 1, 1); return; }
    for (let y = -n; y <= n; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / (ry + 0.3)) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
  };
  // filled disc with the current fillStyle (float radius)
  const disc = (g, cx, cy, r) => {
    cx = Math.round(cx); cy = Math.round(cy);
    if (r < 0.75) { g.fillRect(cx, cy, 1, 1); return; }
    const n = Math.round(r);
    for (let y = -n; y <= n; y++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - y * y))); g.fillRect(cx - w, cy + y, 2 * w + 1, 1); }
  };
  const dot = (g, x, y, col) => { if (col) g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  // 1px ring of an ellipse (for glass rims)
  const ering = (g, cx, cy, rx, ry, col, a0, a1) => {
    g.fillStyle = col; const n = Math.max(12, Math.round((rx + ry) * 3));
    for (let i = 0; i <= n; i++) { const a = lerp(a0 === undefined ? 0 : a0, a1 === undefined ? TAU : a1, i / n); g.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 1, 1); }
  };
  const thick = (g, x1, y1, x2, y2, w, col) => { g.fillStyle = col; const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1)); for (let i = 0; i <= n; i++) disc(g, x1 + ((x2 - x1) * i) / Math.max(n, 1), y1 + ((y2 - y1) * i) / Math.max(n, 1), w / 2); };

  // ---------- light ----------
  const alpha = (g, a, fn) => PX.alpha(g, a, fn);
  const dim = (g, a, x, y, w, h) => { if (a <= 0.003) return; g.fillStyle = `rgba(0,0,0,${a.toFixed(3)})`; g.fillRect(x || 0, y || 0, w === undefined ? 640 : w, h === undefined ? 360 : h); };
  // darkness outside a light pool (r0 fully lit, r1 fully dark at strength a)
  const pool = (g, x, y, r0, r1, a) => { if (a <= 0.003) return; const gr = g.createRadialGradient(x, y, r0, x, y, r1); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, `rgba(0,0,0,${a.toFixed(3)})`); g.fillStyle = gr; g.fillRect(0, 0, 640, 360); };
  const lab = (g, s, x, y, col, size) => PX.otext(g, s, x, y, { align: "center", col: col || D.cream, outline: D.n0, size: size || 8 });

  // ---------- organic pieces ----------
  // branching slime-mould network (absolute coords) inside an ellipse; tips get fan-shaped feeding fronts
  const slimeNet = (seed, cx, cy, rx, ry, o) => {
    o = o || {}; const r = PX.rnd(seed), segs = [], step = o.step || 3, maxDep = o.depth || 4;
    const inside = (x, y) => ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
    // bounded dendritic tree: each branch walks a while, then splits in two (sometimes three), thinner each time
    const grow = (x, y, ang, w, dist, depth) => {
      const len = (o.len || Math.max(rx, ry) * 0.42) * (0.75 + r() * 0.5) * Math.pow(0.78, depth), n = Math.max(2, Math.round(len / step));
      for (let k = 0; k < n; k++) {
        ang += (r() - 0.5) * (o.curl || 0.45);
        const nx = x + Math.cos(ang) * step, ny = y + Math.sin(ang) * step;
        if (!inside(nx, ny)) { segs.push({ tip: 1, x, y, ang, w, d: dist }); return; }
        segs.push({ x1: x, y1: y, x2: nx, y2: ny, w, d: dist, ph: r() * TAU });
        x = nx; y = ny; dist += step; w = Math.max(o.min || 0.5, w * (o.taper || 0.97));
      }
      if (depth >= maxDep) { segs.push({ tip: 1, x, y, ang, w, d: dist }); return; }
      const kids = r() < (o.tri || 0.2) ? 3 : 2, sp = o.spread || 0.55;
      for (let i = 0; i < kids; i++) grow(x, y, ang + (kids === 2 ? (i ? 1 : -1) * sp * (0.6 + r() * 0.6) : (i - 1) * sp), w * (o.split || 0.72), dist, depth + 1);
    };
    const n = o.arms || 6;
    for (let i = 0; i < n; i++) grow(cx, cy, (i / n) * TAU + r() * 0.6 + (o.rot || 0), o.w || 3, 0, 0);
    // a few cross-links make loops, like a real network
    const ends = segs.filter((s) => !s.tip && s.w < 2.2);
    for (let i = 0, made = 0; i < 400 && made < (o.links || 0); i++) {
      const a = ends[Math.floor(r() * ends.length)], b = ends[Math.floor(r() * ends.length)];
      if (!a || !b || a === b) continue;
      const dd = Math.hypot(a.x2 - b.x2, a.y2 - b.y2);
      if (dd > 4 && dd < (o.linkR || 16) && Math.abs(a.d - b.d) > 10) { segs.push({ x1: a.x2, y1: a.y2, x2: b.x2, y2: b.y2, w: Math.min(a.w, b.w) * 0.8, d: Math.max(a.d, b.d), ph: r() * TAU }); made++; }
    }
    segs.maxD = segs.reduce((m, s) => Math.max(m, s.d), 1);
    return segs;
  };
  const drawSlime = (g, net, t, o) => {
    o = o || {}; const C = o.cols || D.amber, lim = (o.grow === undefined ? 1 : o.grow) * net.maxD, sc = o.sc || 1, pr = o.pulse === undefined ? 1 : o.pulse;
    const stamp = (s, rad, dx, dy) => { const n = Math.max(1, Math.ceil(Math.hypot(s.x2 - s.x1, s.y2 - s.y1))); for (let i = 0; i <= n; i++) disc(g, s.x1 + ((s.x2 - s.x1) * i) / n + dx, s.y1 + ((s.y2 - s.y1) * i) / n + dy, rad); };
    const wob = (s) => Math.sin(t * 1.9 + s.ph + s.d * 0.12) * 0.35;
    if (o.shadow !== false) { g.fillStyle = C[2]; for (const s of net) if (!s.tip && s.d <= lim) stamp(s, s.w * sc + 0.8 + wob(s), 0, 0.7); }
    g.fillStyle = C[1]; for (const s of net) if (!s.tip && s.d <= lim) stamp(s, s.w * sc + wob(s), 0, 0);
    g.fillStyle = C[0];
    for (const s of net) if (!s.tip && s.d <= lim && s.w * sc > 1.0) { const pu = Math.sin(s.d * 0.16 - t * 3.0 * pr + s.ph * 0.2); if (pu > 0.3) stamp(s, s.w * sc * 0.38, -0.4, -0.6); }
    if (o.fans !== false) for (const s of net) if (s.tip && s.d <= lim && s.d > 6) {
      const f = (o.fan || 2.6) * sc + Math.sin(t * 1.4 + s.d) * 0.45, fx = s.x + Math.cos(s.ang) * f * 0.5, fy = s.y + Math.sin(s.ang) * f * 0.5;
      alpha(g, 0.5, () => { g.fillStyle = C[1]; disc(g, fx, fy, f); });
      g.fillStyle = C[0];
      for (let k = -3; k <= 3; k++) { const a = s.ang + k * 0.38; g.fillRect(Math.round(fx + Math.cos(a) * f), Math.round(fy + Math.sin(a) * f), 1, 1); }
    }
  };
  // translucent cell
  const cellBlob = (g, x, y, r, C, t, ph) => {
    alpha(g, 0.26, () => { g.fillStyle = C[1]; disc(g, x, y, r); });
    alpha(g, 0.7, () => { g.fillStyle = C[0]; const n = Math.max(10, Math.round(r * 6.5)); for (let i = 0; i < n; i++) { const a = (i / n) * TAU, rr = r + Math.sin(a * 3 + ph + t * 1.3) * 0.45; g.fillRect(Math.round(x + Math.cos(a) * rr), Math.round(y + Math.sin(a) * rr), 1, 1); } });
    alpha(g, 0.8, () => { g.fillStyle = C[2]; disc(g, x + r * 0.2, y + r * 0.1, Math.max(0.8, r * 0.28)); });
    g.fillStyle = C[0]; g.fillRect(Math.round(x - r * 0.45), Math.round(y - r * 0.5), 1, 1);
  };
  // brass gear, lit from upper right
  const gear = (g, cx, cy, r, n, a, C) => {
    const ts = Math.max(2, Math.round(r / 4.2));
    for (let i = 0; i < n; i++) {
      const b = a + (i * TAU) / n, tx = cx + Math.cos(b) * (r + ts * 0.45), ty = cy + Math.sin(b) * (r + ts * 0.45);
      g.fillStyle = Math.cos(b) - Math.sin(b) > 0.9 ? C[0] : C[1]; g.fillRect(Math.round(tx - ts / 2), Math.round(ty - ts / 2), ts, ts);
    }
    g.fillStyle = C[2]; disc(g, cx, cy, r);
    g.fillStyle = C[0]; disc(g, cx, cy, r - 1);
    g.fillStyle = C[1]; disc(g, cx - 1, cy + 1, r - 1);
    if (r >= 7) {
      g.fillStyle = C[3]; disc(g, cx, cy, r * 0.62);
      for (let k = 0; k < 4; k++) { const b = a + (k * TAU) / 4; thick(g, cx, cy, cx + Math.cos(b) * r * 0.62, cy + Math.sin(b) * r * 0.62, Math.max(2, r * 0.18), C[1]); }
    }
    g.fillStyle = C[2]; disc(g, cx, cy, Math.max(1, r * 0.2)); dot(g, cx, cy - 1, C[0]);
  };
  // punched card: paper, corner cut, rows of holes, optional check mark
  const card = (g, x, y, w, h, seed, chk) => {
    x = Math.round(x); y = Math.round(y);
    R(g, x, y, w, h, D.paper); R(g, x, y + h - 1, w, 1, D.paperD); R(g, x + w - 1, y, 1, h, D.paperD); R(g, x, y, w, 1, D.cream);
    R(g, x, y, 3, 1, BLK); R(g, x, y + 1, 2, 1, BLK); R(g, x, y + 2, 1, 1, BLK);   // corner cut (shadow-dark)
    const r = PX.rnd(seed);
    for (let yy = y + 3; yy < y + h - 3; yy += 3) for (let xx = x + 3; xx < x + w - 3; xx += 2) if (r() < 0.22) R(g, xx, yy, 1, 2, D.ink);
    if (chk) {   // pen check
      const cx = x + w / 2, cy = y + h / 2, k = clamp(chk, 0, 1);
      R(g, x + 3, y + 3, w - 6, h - 6, D.paper);
      const pts = [[cx - 7, cy], [cx - 2, cy + 5], [cx + 8, cy - 6]];
      const seg1 = clamp(k * 2, 0, 1), seg2 = clamp(k * 2 - 1, 0, 1);
      thick(g, pts[0][0], pts[0][1], lerp(pts[0][0], pts[1][0], seg1), lerp(pts[0][1], pts[1][1], seg1), 2.2, D.moss[2]);
      if (seg2 > 0) thick(g, pts[1][0], pts[1][1], lerp(pts[1][0], pts[2][0], seg2), lerp(pts[1][1], pts[2][1], seg2), 2.2, D.moss[2]);
    }
  };
  // petri dish seen from slightly above. contents(g) drawn clipped to the agar
  const dish = (g, cx, cy, rx, ry, agar, contents) => {
    alpha(g, 0.4, () => ell(g, cx + 2, cy + 3, rx + 1, ry + 1, BLK));
    ell(g, cx, cy + 2, rx, ry, mix(GLASS, D.n2, 0.55));                 // glass wall
    ell(g, cx, cy, rx - 1, ry - 1, agar);
    if (contents) { g.save(); g.beginPath(); g.ellipse(cx, cy, rx - 1.5, ry - 1.2, 0, 0, TAU); g.clip(); contents(g); g.restore(); }
    alpha(g, 0.85, () => ering(g, cx, cy, rx, ry, GLASS, Math.PI * 1.05, Math.PI * 1.95));
    alpha(g, 0.45, () => ering(g, cx, cy, rx, ry, GLASS, 0, Math.PI));
    alpha(g, 0.9, () => ering(g, cx, cy, rx - 2, ry - 1.5, D.cream, Math.PI * 1.25, Math.PI * 1.45));   // glint
  };

  // ======================= two_worlds =======================
  // one wide scene split by a seam: left a chip clean room, right a wet forest floor at dusk.
  // o.left (1.0) left side brightens, o.right (3.0) right side brightens (left settles back a little)
  K.two_worlds = (o) => {
    const r = PX.rnd(41);
    const net = slimeNet(9, 500, 236, 52, 12, { arms: 6, w: 2.0, step: 2, depth: 4, spread: 0.6, len: 13, links: 3, linkR: 10 });
    const mossH = [...Array(280)].map((_, i) => 2.5 + Math.sin(i * 0.21) * 1.2 + Math.sin(i * 0.57 + 2) * 1.0 + Math.sin(i * 1.7) * 0.6);
    const cracks = [...Array(26)].map(() => [388 + r() * 250, r(), 6 + r() * 26]);
    const litter = [...Array(140)].map(() => [322 + r() * 320, 288 + r() * 74, r(), r()]);
    const farT = [...Array(24)].map((_, i) => [262 + i * 19 + r() * 10, 108 + r() * 40, 8 + r() * 10]);
    const dies = [];
    for (let j = -3; j <= 3; j++) for (let i = -6; i <= 6; i++) if ((i / 6.4) ** 2 + (j / 3.4) ** 2 < 1) dies.push([i, j, r()]);
    const SUIT = [D.cream, mix(D.cream, D.n6, 0.38), mix(D.cream, D.n5, 0.72)];
    // clean-room worker, side view facing right. (x, y) feet centre, h height
    const worker = (g, x, y, h, t, ph) => {
      const s = h / 96, U = (v) => Math.round(v * s);
      const Q = (dx, dy, w, hh, col) => R(g, x + U(dx), y - h + U(dy), Math.max(1, U(w)), Math.max(1, U(hh)), col);
      const br = Math.round(Math.sin(t * 1.6 + ph) * 0.6);   // breathing
      alpha(g, 0.35, () => ell(g, x + U(2), y + 1, U(16), Math.max(1, U(2)), BLK));
      Q(-8, 86, 9, 10, SUIT[2]); Q(-1, 86, 10, 10, SUIT[1]); Q(-9, 94, 10, 2, D.n5); Q(-1, 94, 11, 2, D.n5);     // boot covers
      Q(-8, 56, 8, 32, SUIT[2]); Q(-2, 56, 9, 32, SUIT[1]); Q(5, 58, 1, 28, SUIT[2]);                         // legs
      Q(-11, 26 + br, 21, 34, SUIT[1]); Q(-11, 26 + br, 4, 34, SUIT[2]); Q(-7, 26 + br, 15, 1, SUIT[0]);        // torso
      Q(7, 30 + br, 1, 26, SUIT[2]); Q(-11, 50 + br, 21, 1, SUIT[2]);                                            // zip, belt crease
      Q(-9, 30 + br, 5, 20, SUIT[2]);                                                                           // back arm
      Q(-2, 30 + br, 6, 6, SUIT[0]); Q(2, 33 + br, 14, 6, SUIT[1]); Q(2, 33 + br, 14, 1, SUIT[0]); Q(15, 34 + br, 5, 5, D.steel[0]);   // reaching arm + glove
      Q(-10, 22 + br, 19, 6, SUIT[1]);                                                                          // hood flare on shoulders
      Q(-9, 4 + br, 17, 22, SUIT[1]); Q(-8, 2 + br, 15, 3, SUIT[1]); Q(-6, 2 + br, 12, 1, SUIT[0]); Q(-9, 6 + br, 3, 18, SUIT[2]);   // hood
      Q(2, 12 + br, 7, 5, D.teal[2]); Q(3, 12 + br, 5, 1, D.teal[0]); Q(2, 17 + br, 7, 6, SUIT[0]);             // goggles + mask
    };
    return (g, t, d, c) => {
      const k = d / 5.4, tl = o.left === undefined ? 1.0 * k : o.left, tr = o.right === undefined ? 3.0 * k : o.right;
      const bL = 0.3 + 0.7 * P(t, tl, 0.9, "io") - 0.22 * P(t, tr, 0.9, "io"), bR = 0.3 + 0.7 * P(t, tr, 1.1, "io");
      // ---------------- LEFT: clean room ----------------
      g.save(); g.beginPath(); g.rect(0, 0, 320, 360); g.clip();
      const WALL = mix(D.steel[1], D.n5, 0.45), WALLd = mix(WALL, D.n2, 0.4), WALLl = mix(WALL, D.steel[0], 0.35);
      PX.vgrad(g, 0, 30, 320, 222, mix(WALL, D.steel[0], 0.15), WALLd, 8);
      // far bay through the observation window
      g.save(); g.beginPath(); g.rect(20, 58, 116, 86); g.clip();
      PX.par(g, c, 0.45, () => {
        R(g, -40, 40, 240, 120, mix(D.steel[2], D.n2, 0.3));
        R(g, 20, 58, 116, 6, mix(D.steel[2], D.n4, 0.4)); R(g, 30, 61, 40, 2, mix(D.cream, D.steel[1], 0.4)); R(g, 84, 61, 40, 2, mix(D.cream, D.steel[1], 0.4));
        for (let i = 0; i < 4; i++) R(g, 26 + i * 28, 96, 20, 48, mix(D.steel[2], D.n3, 0.25 + 0.1 * (i % 2)));
        for (let i = 0; i < 4; i++) R(g, 26 + i * 28, 96, 20, 1, mix(D.steel[1], D.n6, 0.3));
        R(g, 20, 134, 116, 10, mix(D.steel[2], D.n4, 0.2));
        for (let i = -2; i < 7; i++) if (i < 0 || i > 3) R(g, 26 + i * 28, 96, 20, 48, mix(D.steel[2], D.n3, 0.3));
        worker(g, 52 + t * 5, 140, 40, t, 2);
      });
      g.restore();
      R(g, 16, 54, 124, 4, D.n6); R(g, 16, 144, 124, 4, D.n6); R(g, 16, 54, 4, 94, D.n6); R(g, 136, 54, 4, 94, D.n6); R(g, 16, 54, 124, 1, D.n7);
      alpha(g, 0.1, () => { poly(g, [[40, 58], [60, 58], [24, 144], [20, 144], [20, 120]], D.cream); poly(g, [[96, 58], [104, 58], [64, 144], [56, 144]], D.cream); });
      // wall panels with seams
      for (let x = 0; x < 320; x += 46) { if (x > 14 && x < 140) continue; R(g, x, 30, 1, 222, WALLd); R(g, x + 1, 30, 1, 222, WALLl); }
      // equipment rack on the right
      R(g, 270, 88, 44, 164, mix(D.n4, D.steel[2], 0.3)); R(g, 270, 88, 44, 1, D.n6); R(g, 313, 88, 1, 164, D.n3);
      for (let i = 0; i < 7; i++) { R(g, 274, 96 + i * 20, 36, 14, mix(D.n3, D.steel[2], 0.3)); R(g, 274, 96 + i * 20, 36, 1, D.n5);
        dot(g, 278, 101 + i * 20, PX.blink(t + i * 0.37, 1.7 + i * 0.2, 0.7) ? D.moss[0] : D.moss[2]); for (let k = 0; k < 6; k++) R(g, 286 + k * 4, 100 + i * 20, 2, 6, D.n2); }
      // ceiling + strip lights
      R(g, 0, 0, 320, 30, mix(D.n4, D.steel[2], 0.3)); for (let x = 0; x < 320; x += 40) R(g, x, 0, 1, 30, D.n3); R(g, 0, 29, 320, 1, D.n3);
      const SL = mix(D.n6, D.cream, bL);
      for (const [x0, x1] of [[16, 146], [176, 306]]) { R(g, x0 - 2, 10, x1 - x0 + 4, 8, D.n5); R(g, x0, 12, x1 - x0, 4, SL); R(g, x0, 16, x1 - x0, 1, mix(SL, D.n5, 0.5)); }
      // lithography tool
      const T0 = mix(D.cream, D.n6, 0.3), T1 = mix(D.cream, D.n5, 0.6), T2 = mix(D.cream, D.n4, 0.8);
      alpha(g, 0.35, () => R(g, 140, 250, 128, 8, BLK));
      R(g, 140, 110, 124, 142, T1); R(g, 140, 110, 124, 4, T0); R(g, 140, 110, 3, 142, T0); R(g, 261, 110, 3, 142, T2);
      R(g, 140, 210, 124, 1, T2); R(g, 144, 216, 116, 32, mix(T1, T2, 0.3));
      for (let i = 0; i < 3; i++) { R(g, 152 + i * 38, 222, 28, 20, T1); R(g, 152 + i * 38, 222, 28, 1, T0); R(g, 162 + i * 38, 238, 8, 2, T2); }
      // chamber window with stage + wafer
      R(g, 160, 128, 88, 72, T2); R(g, 162, 130, 84, 68, mix(D.n2, D.steel[2], 0.45));
      R(g, 196, 130, 16, 30, D.n4); R(g, 196, 130, 2, 30, D.n5); R(g, 192, 158, 24, 6, D.n4); R(g, 192, 158, 24, 1, D.n6);   // lens column
      R(g, 170, 184, 68, 8, D.n4); R(g, 170, 184, 68, 1, D.n6);                                                            // stage
      const wx = 204, wy = 180, WF = [mix(D.steel[0], D.cream, 0.25), mix(D.steel[1], D.steel[0], 0.5), D.steel[2]];
      ell(g, wx, wy + 1, 28, 7, D.n3); ell(g, wx, wy, 28, 7, WF[1]);
      for (const [i, j, v] of dies) R(g, wx + i * 4 - 1, wy + j * 2, 3, 1, v < 0.5 ? WF[2] : mix(WF[1], WF[2], 0.5));
      const sw = ((t * 0.35) % 1.4) * 80 - 30;   // light sheen sliding across the wafer
      alpha(g, 0.55, () => { g.save(); g.beginPath(); g.ellipse(wx, wy, 27.5, 6.5, 0, 0, TAU); g.clip(); poly(g, [[wx - 28 + sw, wy - 8], [wx - 20 + sw, wy - 8], [wx - 30 + sw, wy + 8], [wx - 38 + sw, wy + 8]], WF[0]); g.restore(); });
      alpha(g, 0.2, () => poly(g, [[166, 132], [180, 132], [168, 196], [164, 196]], D.cream));
      // control panel on the tool side
      poly(g, [[124, 150], [142, 146], [142, 176], [124, 172]], T2); R(g, 128, 154, 10, 10, mix(D.steel[2], D.steel[1], 0.4 + 0.4 * bL)); R(g, 128, 154, 10, 1, D.steel[0]);
      // raised floor
      const FL = mix(D.steel[0], D.n6, 0.55);
      R(g, 0, 252, 320, 108, FL); R(g, 0, 252, 320, 2, mix(FL, D.cream, 0.4));
      for (let k = 0, y = 256; y < 360; k++) { R(g, 0, Math.round(y), 320, 1, mix(FL, D.n4, 0.5)); y += 8 + k * 5; }
      for (let i = -8; i <= 14; i++) PX.line(g, 160 + i * 18, 254, 160 + i * 60, 360, mix(FL, D.n4, 0.5));
      for (let y = 262; y < 360; y += 6) for (let x = (y % 12) / 2; x < 320; x += 6) dot(g, x, y, mix(FL, D.n5, 0.4));
      alpha(g, 0.16 * bL, () => { R(g, 40, 254, 90, 106, D.cream); R(g, 200, 254, 90, 106, D.cream); });   // strip lights reflected
      alpha(g, 0.16, () => poly(g, [[140, 252], [264, 252], [284, 276], [146, 276]], BLK));
      worker(g, 112, 262, 96, t, 0);
      // laminar air: very faint motes falling straight down
      PX.particles(g, 21, 26, t, [0, 30, 320, 222], { vy: 9, vx: 0, col: D.cream, a: 0.22 * bL });
      PX.glow(g, 80, 30, 120, D.cream, 0.16 * bL); PX.glow(g, 240, 30, 120, D.cream, 0.16 * bL);
      dim(g, 0.55 * (1 - bL), 0, 0, 320, 360);
      g.restore();

      // ---------------- RIGHT: forest floor at dusk ----------------
      g.save(); g.beginPath(); g.rect(320, 0, 320, 360); g.clip();
      const SK0 = mix(D.n1, D.steel[2], 0.35), SK1 = mix(mix(D.amber[2], D.rust[2], 0.35), D.n2, 0.35);
      PX.vgrad(g, 320, 0, 320, 200, SK0, SK1, 10);
      // far treeline
      PX.par(g, c, 0.4, () => {
        const F = mix(D.n2, D.moss[2], 0.3);
        R(g, 260, 150, 440, 70, F);
        for (const [x, y, w] of farT) { poly(g, [[x, y], [x + w, y + 46], [x - w, y + 46]], F); poly(g, [[x, y + 18], [x + w + 3, y + 60], [x - w - 3, y + 60]], F); }
      });
      // mid trunks
      PX.par(g, c, 0.65, () => {
        const TK = mix(D.n1, WB, 0.25), TKl = mix(TK, SK1, 0.45);
        for (const [x, w] of [[372, 18], [560, 26], [618, 12]]) { R(g, x, 0, w, 236, TK); R(g, x + w - 2, 0, 2, 236, TKl); R(g, x - 3, 220, w + 6, 16, TK);
          for (let y = 10; y < 230; y += 23) R(g, x + 3, y + (x % 7), 1, 9, mix(TK, D.n0, 0.4)); }
        R(g, 560, 120, 34, 3, TK); poly(g, [[594, 118], [612, 104], [614, 108], [596, 123]], TK);
        for (let y = 140; y < 236; y += 3) R(g, 560, y, 2 + Math.round(2 + Math.sin(y * 0.37) * 2), 3, mix(D.moss[2], TK, 0.45));
      });
      // ground
      const SOIL = mix(D.n1, WB, 0.32);
      PX.vgrad(g, 320, 214, 320, 146, mix(SOIL, D.moss[2], 0.35), SOIL, 6);
      for (let i = 0; i < 90; i++) { const x = 322 + ((i * 53) % 318), y = 220 + ((i * 37) % 70); R(g, x, y, 3 + (i % 4), 1, mix(D.moss[2], SOIL, 0.3 + 0.2 * (i % 3))); }
      // rotting log
      const lt = (x) => 202 + (x - 384) * 0.07, lb = (x) => 262 + (x - 384) * 0.05;
      const BK = mix(WB, D.n1, 0.5), BKl = mix(WB, D.n2, 0.2), BKd = mix(WB, D.n0, 0.75);
      alpha(g, 0.45, () => poly(g, [[380, lb(380) - 2], [650, lb(650) - 2], [650, lb(650) + 8], [384, lb(384) + 6]], BLK));
      poly(g, [[384, lt(384)], [650, lt(650)], [650, lb(650)], [384, lb(384)]], BK);
      poly(g, [[384, lt(384)], [650, lt(650)], [650, lt(650) + 10], [384, lt(384) + 10]], BKl);
      poly(g, [[384, lb(384) - 12], [650, lb(650) - 12], [650, lb(650)], [384, lb(384)]], BKd);
      for (const [x, k, l] of cracks) { const y0 = lt(x) + 6 + k * 20; PX.line(g, x, y0, x + 2, y0 + l * 0.6, BKd); dot(g, x + 1, y0, BKl); }
      ell(g, 384, (lt(384) + lb(384)) / 2, 10, 30, BKl);   // cut end with rings
      ell(g, 385, (lt(384) + lb(384)) / 2, 8, 26, mix(WB, D.amber[2], 0.3));
      ell(g, 386, (lt(384) + lb(384)) / 2, 5, 18, mix(WB, D.n1, 0.25)); ell(g, 386, (lt(384) + lb(384)) / 2 + 2, 3, 9, BKd);
      for (let x = 384; x < 640; x++) { const hm = mossH[x - 384] * (x < 400 ? (x - 384) / 16 : 1), y = lt(x); R(g, x, Math.round(y - hm + 2), 1, Math.round(hm + 3), D.moss[2]); dot(g, x, y - hm + 2, x % 3 ? D.moss[1] : D.moss[0]); }
      // slime mould on the log front
      drawSlime(g, net, t, { fan: 2.2 });
      // mushrooms
      for (const [mx, sc] of [[590, 1], [602, 0.7], [436, 0.8]]) { const my = lt(mx) - 1; R(g, mx - 1, my - 5 * sc, 2, 5 * sc, D.paperD); ell(g, mx, my - 6 * sc, 5 * sc, 2 * sc, mix(D.paper, D.rust[2], 0.25)); R(g, mx - 3 * sc, my - 8 * sc, 3, 1, D.paper); }
      // moss mounds + stones on the floor
      const MS = [D.moss[0], D.moss[1], D.moss[2], mix(D.moss[2], D.n1, 0.4)];
      for (const [x, y, w, h] of [[330, 286, 40, 10], [420, 300, 60, 12], [540, 290, 50, 9], [600, 312, 50, 12], [470, 340, 70, 14]]) {
        const pts = []; for (let a = 0; a < TAU; a += 0.2) { const rr = 1 + 0.18 * Math.sin(3 * a + x) + 0.1 * Math.sin(7 * a + y); pts.push([x + Math.cos(a) * w * 0.5 * rr, y + Math.sin(a) * h * 0.5 * rr]); }
        poly(g, pts.map(([px, py]) => [px, py + 1]), MS[3]); poly(g, pts, mix(MS[2], D.n1, 0.2));
        for (let yy = -h / 2; yy < h / 2; yy += 2) for (let xx = -w / 2; xx < w / 2; xx += 2) { const hsh = Math.abs(Math.sin(xx * 12.9898 + yy * 78.233 + x) * 43758.5) % 1;
          if ((xx / (w * 0.45)) ** 2 + (yy / (h * 0.45)) ** 2 < 1 && hsh < 0.5 - yy / h * 0.6) dot(g, x + xx + (yy % 4 ? 1 : 0), y + yy, hsh < 0.12 ? MS[1] : mix(MS[1], MS[2], 0.6)); }
      }
      for (const [x, y, w] of [[392, 276, 12], [566, 322, 9], [356, 330, 7]]) { ell(g, x, y, w, w * 0.5, D.n3); ell(g, x - 1, y - 1, w - 2, w * 0.35, D.n4); R(g, x - w * 0.5, y - w * 0.4, w * 0.5, 1, D.n6); }
      // fern clumps (back to front) + droplets
      const FC = [D.moss[1], mix(D.moss[1], D.moss[2], 0.5), D.moss[2]];
      const FCd = [mix(D.moss[1], D.n1, 0.35), mix(D.moss[2], D.n1, 0.2), mix(D.moss[2], D.n0, 0.4)];
      clump(g, 628, 300, 5, 46, t, 0.5, FCd);
      const tips = clump(g, 350, 318, 7, 66, t, 0, FC);
      clump(g, 600, 350, 6, 60, t, 2.0, FC);
      clump(g, 468, 356, 4, 34, t, 3.0, FC);
      for (const [ti, ph] of [[1, 0], [5, 0.9], [3, 1.7]]) {
        const [tx, ty] = tips[ti], kk = ((t + ph) % 2.4) / 2.4;
        if (kk < 0.7) dot(g, tx, ty + 1, mix(GLASS, D.cream, kk / 0.7));
        else { const f = (kk - 0.7) / 0.3; alpha(g, 1 - f, () => R(g, tx, ty + 2 + f * f * 50, 1, 2, GLASS)); }
      }
      for (let i = 0; i < 22; i++) { const x = 330 + ((i * 97) % 300), y = 270 + ((i * 41) % 80); if (PX.blink(t + i * 0.31, 2.3, 0.35)) dot(g, x, y, mix(GLASS, D.cream, 0.5)); }
      // low dusk light shaft through the trees
      alpha(g, 0.09 * bR, () => poly(g, [[528, 0], [586, 0], [520, 300], [420, 300]], D.lamp));
      PX.glow(g, 500, 230, 120, D.lampD, 0.18 * bR);
      PX.particles(g, 33, 18, t, [440, 40, 140, 240], { vy: -2, vx: 1.5, col: D.lamp, a: 0.5 * bR });
      dim(g, 0.55 * (1 - bR), 320, 0, 320, 360);
      g.restore();

      // seam
      R(g, 319, 0, 2, 360, D.n0); alpha(g, 0.3, () => { R(g, 316, 0, 3, 360, BLK); R(g, 321, 0, 3, 360, BLK); });
      PX.vignette(g, 0.5);
    };
  };
  // fern frond: curved spine with alternating leaflets shrinking to the tip; returns the tip point
  function fern(g, x, y, len, ang, bend, t, ph, C) {
    let px = x, py = y, a = ang + Math.sin(t * 0.8 + ph) * 0.035;
    const n = Math.round(len / 3), pts = [];
    for (let i = 0; i <= n; i++) { pts.push([px, py, a]); px += Math.cos(a) * 3; py += Math.sin(a) * 3; a += bend; }
    for (let i = 2; i < pts.length; i++) {
      const [sx, sy, sa] = pts[i], k = 1 - i / pts.length, ll = 1.5 + k * len * 0.2;
      for (const side of [-1, 1]) {
        const la = sa + side * 1.2 + (bend > 0 ? 0.25 : -0.25), ex = sx + Math.cos(la) * ll, ey = sy + Math.sin(la) * ll + k * 2;
        PX.line(g, sx, sy + 1, ex, ey + 1, C[2]); PX.line(g, sx, sy, ex, ey, side < 0 ? C[0] : C[1]);
      }
    }
    for (let i = 1; i < pts.length; i++) PX.line(g, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], C[2]);
    return pts[pts.length - 1];
  }

  // fern clump: n fronds fanning up from one base; returns the frond tips
  function clump(g, x, y, n, len, t, ph, C) {
    const tips = [], order = [...Array(n).keys()].sort((a, b) => Math.abs(b - (n - 1) / 2) - Math.abs(a - (n - 1) / 2));
    for (const i of order) {
      const u = n > 1 ? i / (n - 1) - 0.5 : 0, a = -Math.PI / 2 + u * 2.3;
      tips[i] = fern(g, x + u * 10, y, len * (0.7 + 0.3 * Math.cos(u * 2.6)), a, (u < 0 ? -1 : 1) * (0.03 + Math.abs(u) * 0.05), t, ph + i * 0.7, C);
    }
    return tips;
  }

  // ======================= workbench room (def_machine, alive_reveal) =======================
  // drawn in "design space" (the wide shot) mapped by scale S and offset (ox, oy) so the close shot is redrawn natively
  const bench = (g, t, c, S, ox, oy) => {
    const X = (x) => Math.round(ox + x * S), Y = (y) => Math.round(oy + y * S), L = (v) => (v === 1 ? 1 : Math.max(1, Math.round(v * S)));
    const RR = (x, y, w, h, col) => R(g, X(x), Y(y), L(w), L(h), col);
    // wall: dark vertical boards
    const WL = mix(D.n2, WB, 0.18);
    PX.vgrad(g, 0, 0, 640, 360, mix(WL, D.n3, 0.3), mix(WL, D.n1, 0.5), 8);
    for (let i = -4; i < 24; i++) { const x = i * 34; RR(x, -40, 1, 320, mix(WL, D.n0, 0.4)); RR(x + 1, -40, 1, 320, mix(WL, D.n4, 0.25)); RR(x + 9 + (i % 3) * 7, 20 + ((i * 37) % 150), 1, 3, mix(WL, D.n0, 0.5)); }
    // window at night
    PX.par(g, c, 0.45, () => {
      RR(30, 34, 124, 110, WOOD[3]); RR(36, 40, 112, 98, mix(D.n1, D.steel[2], 0.3));
      g.save(); g.beginPath(); g.rect(X(36), Y(40), L(112), L(98)); g.clip();
      PX.vgrad(g, X(36), Y(40), L(112), L(98), mix(D.n1, D.steel[2], 0.25), mix(D.n2, D.steel[2], 0.45), 6);
      g.fillStyle = mix(D.cream, D.n6, 0.3); disc(g, X(122), Y(60), 6 * S); g.fillStyle = mix(D.n1, D.steel[2], 0.35); disc(g, X(125), Y(58), 5 * S);
      const TR = mix(D.n1, D.moss[2], 0.15);
      for (let i = 0; i < 9; i++) { const x = 30 + i * 15, h = 22 + ((i * 13) % 20); poly(g, [[X(x), Y(138 - h)], [X(x + 9), Y(138)], [X(x - 9), Y(138)]], TR); }
      for (let i = 0; i < 12; i++) dot(g, X(40 + ((i * 41) % 104)), Y(44 + ((i * 23) % 40)), PX.blink(t + i, 3 + (i % 3), 0.8) ? D.n6 : D.n4);
      g.restore();
      RR(90, 40, 4, 98, WOOD[3]); RR(36, 86, 112, 4, WOOD[3]); RR(26, 142, 132, 6, WOOD[2]); RR(26, 142, 132, 1, WOOD[1]);
    });
    // shelf with jars
    PX.par(g, c, 0.7, () => {
      RR(166, 78, 168, 5, WOOD[2]); RR(166, 78, 168, 1, WOOD[1]); RR(176, 83, 4, 8, WOOD[3]); RR(320, 83, 4, 8, WOOD[3]);
      const jar = (x, w, h, fill) => { RR(x, 78 - h, w, h, mix(GLASS, D.n2, 0.7)); RR(x + 1, 78 - h * 0.6, w - 2, h * 0.6, fill); RR(x, 78 - h - 3, w, 3, WOOD[3]); RR(x + 1, 78 - h + 1, 1, h - 2, mix(GLASS, D.n3, 0.3)); };
      jar(176, 14, 18, mix(D.n5, D.n3, 0.4)); jar(194, 12, 14, mix(BRASS[2], D.n2, 0.4)); jar(210, 16, 20, mix(D.n6, D.n3, 0.5));
      RR(236, 64, 26, 14, mix(D.rust[2], D.n2, 0.5)); RR(236, 64, 26, 1, mix(D.rust[1], D.n3, 0.4));
      for (let i = 0; i < 5; i++) RR(276 + i * 8, 56 + (i % 2) * 3, 7, 22 - (i % 2) * 3, mix([D.teal[2], WOOD[2], D.n4, D.plum[2], WOOD[3]][i], D.n2, 0.35));
    });
    // pegboard with tools
    PX.par(g, c, 0.6, () => {
      const PB = mix(D.paperD, D.n2, 0.62), PBd = mix(PB, D.n0, 0.4);
      RR(372, 36, 236, 168, WOOD[3]); RR(376, 40, 228, 160, PB);
      for (let y = 46; y < 196; y += 8) for (let x = 382; x < 600; x += 8) R(g, X(x), Y(y), L(1), L(1), PBd);
      const T = mix(D.n6, D.n5, 0.3), Tl = D.n7, Td = D.n4;
      // hammer
      RR(394, 62, 3, 40, WOOD[1]); RR(394, 62, 1, 40, WOOD[0]); RR(386, 54, 18, 8, Td); RR(386, 54, 18, 1, Tl); RR(404, 55, 4, 3, Td);
      // wrench
      RR(424, 60, 3, 46, T); RR(424, 60, 1, 46, Tl); g.fillStyle = T; disc(g, X(425.5), Y(58), 5 * S); disc(g, X(425.5), Y(108), 4 * S); g.fillStyle = PB; RR(424, 50, 3, 7, PB); RR(424, 109, 3, 5, PB);
      // screwdrivers
      for (const [x, hc, l] of [[446, mix(D.teal[2], D.n3, 0.3), 30], [458, WOOD[1], 26], [470, mix(D.rust[2], D.n3, 0.3), 22]]) { RR(x, 56, 5, 14, hc); RR(x, 56, 1, 14, mix(hc, D.cream, 0.3)); RR(x + 2, 70, 1, l, T); }
      // saw
      poly(g, [[X(490), Y(56)], [X(560), Y(60)], [X(560), Y(74)], [X(490), Y(76)]], T); RR(490, 56, 70, 1, Tl);
      for (let x = 492; x < 560; x += 3) RR(x, 76 - (x - 490) * 0.03, 1, 2, Td);
      RR(560, 54, 18, 24, WOOD[1]); RR(565, 60, 8, 12, PB); RR(560, 54, 18, 1, WOOD[0]);
      // pliers
      PX.line(g, X(398), Y(124), X(392), Y(168), mix(D.rust[2], D.n3, 0.2)); PX.line(g, X(400), Y(124), X(408), Y(168), mix(D.rust[2], D.n3, 0.2));
      RR(395, 112, 6, 13, Td); RR(395, 112, 1, 13, Tl);
      // coil of copper wire
      const CU = [mix(mix(D.rust[0], D.amber[0], 0.4), D.n4, 0.5), mix(mix(D.rust[1], D.amber[1], 0.4), D.n3, 0.6), mix(mix(D.rust[2], D.amber[2], 0.4), D.n2, 0.55)];
      g.fillStyle = CU[2]; disc(g, X(470), Y(178), 15 * S); g.fillStyle = CU[1]; disc(g, X(470), Y(178), 14 * S); g.fillStyle = PB; disc(g, X(470), Y(178), 8 * S);
      for (let k = 0; k < 4; k++) ering(g, X(470), Y(178), (9.5 + k * 1.3) * S, (9.5 + k * 1.3) * S, k % 2 ? CU[0] : CU[2], -1.6, 0.2);
      // calipers + ruler
      RR(500, 112, 3, 50, Td); RR(500, 112, 1, 50, Tl); RR(492, 112, 20, 4, Td); RR(496, 136, 14, 4, T);
      RR(520, 100, 6, 92, mix(D.paperD, D.n4, 0.35)); for (let y = 102; y < 190; y += 4) RR(520, y, 3, 1, D.n3);
      // sketch pinned up (a gear doodle)
      RR(540, 104, 52, 40, mix(D.paper, D.n4, 0.45)); RR(540, 104, 52, 1, mix(D.paper, D.n4, 0.25)); RR(564, 102, 3, 3, mix(D.rust[1], D.n3, 0.3));
      ering(g, X(556), Y(124), 9 * S, 9 * S, mix(D.ink, D.paper, 0.35)); ering(g, X(576), Y(130), 6 * S, 6 * S, mix(D.ink, D.paper, 0.35));
      for (let i = 0; i < 4; i++) RR(546, 152 + i * 8, 40 - i * 6, 1, mix(D.ink, PB, 0.6));
    });
    // bench
    const BT = 246, BF = 262;
    RR(-20, BT, 700, 16, WOOD[1]); RR(-20, BT, 700, 1, WOOD[0]);
    for (let i = 0; i < 9; i++) RR(-20 + ((i * 113) % 700), BT + 3 + (i % 4) * 3, 60 + (i % 3) * 30, 1, mix(WOOD[1], WOOD[2], 0.5));
    RR(-20, BF, 700, 14, WOOD[2]); RR(-20, BF, 700, 1, WOOD[0]); RR(-20, BF + 13, 700, 1, WOOD[3]);
    RR(-20, BF + 14, 700, 140, mix(WOOD[3], D.n0, 0.4));
    for (const x of [40, 220, 400]) { RR(x, BF + 22, 160, 60, WOOD[3]); RR(x, BF + 22, 160, 1, WOOD[2]); RR(x + 70, BF + 40, 20, 4, BRASS[3]); RR(x + 70, BF + 40, 20, 1, BRASS[2]); }
    return { X, Y, L, RR };
  };
  // anglepoise lamp clamped to the bench (design coords through T); returns bulb point
  const benchLamp = (g, T, flick) => {
    const { X, Y, RR } = T, M = D.n4, Ml = D.n6, Md = D.n2;
    RR(536, 238, 30, 8, M); RR(536, 238, 30, 1, Ml);
    thick(g, X(551), Y(238), X(574), Y(150), 3, Md); thick(g, X(550), Y(238), X(573), Y(150), 2, M);
    thick(g, X(574), Y(150), X(520), Y(98), 3, Md); thick(g, X(573), Y(149), X(519), Y(97), 2, M);
    g.fillStyle = Ml; disc(g, X(574), Y(150), 2.5);
    PX.line(g, X(556), Y(232), X(578), Y(158), Md);   // spring
    const hp = [[X(500), Y(86)], [X(526), Y(92)], [X(522), Y(118)], [X(486), Y(108)]];
    poly(g, hp, Md); poly(g, [[X(502), Y(87)], [X(525), Y(93)], [X(524), Y(100)], [X(500), Y(94)]], M);
    RR(500, 86, 24, 1, Ml);
    const bx = X(504), by = Y(114);
    alpha(g, 0.85 * flick, () => poly(g, [[X(486), Y(108)], [X(522), Y(118)], [X(520), Y(120)], [X(486), Y(111)]], D.lamp));
    return [bx, by];
  };

  const OFF = {};
  // the wooden-and-brass box machine. screen rect (x, y, w, h). s: {inLit, rulesLit, outLit, gearA, cardIn, cardOut, chk, door, inside}
  const machine = (g, x, y, w, h, t, s) => {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    const ht = Math.round(h * 0.075), fr = Math.max(5, Math.round(w * 0.036));
    alpha(g, 0.5, () => ell(g, x + w / 2 + 6, y + h + 1, w * 0.56, 3, BLK));
    // IN slot on the top face, with the card going in (card drawn before the top so it disappears into it)
    const sx = x + Math.round(w * 0.12), sw = Math.round(w * 0.22), cw = sw - 8, ch = Math.round(cw * 0.62);
    if (s.cardIn !== undefined && s.cardIn < 1) { g.save(); g.beginPath(); g.rect(0, 0, 640, y + 1); g.clip(); card(g, sx + 4, y - ch - 2 + s.cardIn * (ch + 6), cw, ch, 5); g.restore(); }
    // top face
    R(g, x - 3, y, w + 6, ht, WOOD[1]); R(g, x - 3, y, w + 6, 1, WOOD[0]); alpha(g, 0.4, () => R(g, x + w * 0.45, y + 1, w * 0.55 + 3, ht - 3, WOOD[0]));
    R(g, sx - 2, y + 1, sw + 4, 4, BRASS[2]); R(g, sx - 2, y + 1, sw + 4, 1, BRASS[0]); R(g, sx, y + 2, sw, 2, D.n0);
    R(g, x - 3, y + ht - 2, w + 6, 2, BRASS[2]); R(g, x - 3, y + ht - 2, w + 6, 1, BRASS[1]);
    // body
    R(g, x, y + ht, w, h - ht, WOOD[1]);
    const gr = PX.rnd(77); for (let i = 0; i < 34; i++) alpha(g, 0.55, () => R(g, x + gr() * w * 0.9, y + ht + 2 + gr() * (h - ht - 4), 6 + gr() * w * 0.25, 1, WOOD[2]));
    R(g, x + w - 1, y + ht, 1, h - ht, WOOD[0]); R(g, x, y + ht, 1, h - ht, WOOD[2]);
    // front panel / door region
    const px0 = x + fr, py0 = y + ht + fr, pw = w - 2 * fr, ph = h - ht - 2 * fr;
    R(g, px0 - 1, py0 - 1, pw + 2, ph + 2, WOOD[3]); R(g, px0 - 1, py0 + ph + 1, pw + 2, 1, WOOD[0]);
    const face = (g) => {
      // raised panel
      R(g, px0, py0, pw, ph, mix(WOOD[1], WOOD[2], 0.2)); R(g, px0, py0, pw, 1, WOOD[0]); R(g, px0 + pw - 1, py0, 1, ph, WOOD[0]); R(g, px0, py0 + ph - 1, pw, 1, WOOD[3]);
      for (let i = 0; i < 26; i++) alpha(g, 0.5, () => R(g, px0 + 6 + gr() * (pw - 40), py0 + 6 + gr() * (ph - 12), 8 + gr() * pw * 0.3, 1, WOOD[2]));
      R(g, px0 + 4, py0 + 4, pw - 8, 1, WOOD[3]); R(g, px0 + 4, py0 + 4, 1, ph - 8, WOOD[3]); R(g, px0 + 4, py0 + ph - 5, pw - 8, 1, WOOD[0]); R(g, px0 + pw - 5, py0 + 4, 1, ph - 8, WOOD[0]);
      // porthole with gears
      const pcx = Math.round(px0 + pw * 0.5), pcy = Math.round(py0 + ph * 0.43), rp = Math.round(Math.min(pw, ph) * 0.3);
      g.fillStyle = BRASS[3]; disc(g, pcx, pcy + 1, rp + 6); g.fillStyle = BRASS[0]; disc(g, pcx, pcy, rp + 5); g.fillStyle = BRASS[1]; disc(g, pcx - 1, pcy + 1, rp + 4);
      g.fillStyle = BRASS[2]; disc(g, pcx, pcy, rp + 1);
      g.fillStyle = mix(D.n1, D.teal[2], 0.2); disc(g, pcx, pcy, rp);
      g.save(); g.beginPath(); g.arc(pcx + 0.5, pcy + 0.5, rp, 0, TAU); g.clip();
      const GA = s.gearA || 0, rb = rp * 0.5, rs = rp * 0.3, rt = rp * 0.24;
      const bxg = pcx - rp * 0.2, byg = pcy + rp * 0.18;
      const sxg = bxg + (rb + rs + 2.5) * Math.cos(-0.5), syg = byg + (rb + rs + 2.5) * Math.sin(-0.5);
      const txg = bxg + (rb + rt + 2.5) * Math.cos(-2.3), tyg = byg + (rb + rt + 2.5) * Math.sin(-2.3);
      const GC = s.rulesLit > 0 ? [mix(BRASS[1], BRASS[0], s.rulesLit), mix(BRASS[2], BRASS[1], s.rulesLit), mix(BRASS[3], BRASS[2], s.rulesLit * 0.6), BRASS[3]] : [BRASS[1], BRASS[2], BRASS[3], mix(BRASS[3], D.n0, 0.4)];
      gear(g, txg, tyg, rt, 8, -GA * rb / rt + 0.2, GC);
      gear(g, sxg, syg, rs, 9, -GA * rb / rs + 0.17, GC);
      gear(g, bxg, byg, rb, 14, GA, GC);
      if (s.rulesLit > 0) PX.glow(g, pcx + rp * 0.3, pcy - rp * 0.4, rp * 1.3, D.lamp, 0.22 * s.rulesLit);
      dim(g, 0.25, pcx - rp, pcy - rp, rp * 2 + 1, rp * 0.5);
      g.restore();
      alpha(g, 0.2, () => { thick(g, pcx - rp * 0.62, pcy - rp * 0.12, pcx - rp * 0.12, pcy - rp * 0.62, 2, GLASS); PX.line(g, pcx - rp * 0.5, pcy + rp * 0.12, pcx + rp * 0.12, pcy - rp * 0.5, GLASS); });
      for (let k = 0; k < 10; k++) { const b = (k / 10) * TAU + 0.3; dot(g, pcx + Math.cos(b) * (rp + 3), pcy + Math.sin(b) * (rp + 3), BRASS[3]); dot(g, pcx + Math.cos(b) * (rp + 3), pcy + Math.sin(b) * (rp + 3) - 1, BRASS[0]); }
      plate(g, pcx, pcy + rp + 9, "RULES", s.rulesLit || 0);
      // IN plate + indicator lamp
      const inx = px0 + Math.round(pw * 0.14), iny = py0 + Math.round(ph * 0.1);
      plate(g, inx, iny, "IN", s.inLit || 0);
      lampDot(g, inx + 18, iny + 6, s.inLit || 0);
      // gauge
      const gx = px0 + Math.round(pw * 0.86), gy = py0 + Math.round(ph * 0.16), gr2 = Math.max(6, Math.round(pw * 0.035));
      g.fillStyle = BRASS[2]; disc(g, gx, gy, gr2 + 2); g.fillStyle = mix(D.paper, D.n4, 0.25); disc(g, gx, gy, gr2);
      for (let k = 0; k < 7; k++) { const b = Math.PI * (0.8 + k * 0.233); dot(g, gx + Math.cos(b) * (gr2 - 1), gy + Math.sin(b) * (gr2 - 1), D.ink); }
      const na = Math.PI * (1.0 + 0.5 * (s.rulesLit || 0)) + Math.sin(t * 9) * 0.06 * (s.rulesLit || 0);
      PX.line(g, gx, gy, gx + Math.cos(na) * (gr2 - 1), gy + Math.sin(na) * (gr2 - 1), D.rust[2]); dot(g, gx, gy, D.ink);
      // OUT slot + ANSWER plate
      const ox0 = px0 + Math.round(pw * 0.7), osw = Math.round(pw * 0.24), oy0 = py0 + Math.round(ph * 0.84);
      plate(g, ox0 + osw / 2, oy0 - 18, "ANSWER", s.outLit || 0);
      R(g, ox0 - 2, oy0 - 1, osw + 4, 5, BRASS[2]); R(g, ox0 - 2, oy0 - 1, osw + 4, 1, BRASS[0]); R(g, ox0, oy0 + 1, osw, 2, D.n0);
      // answer card: slides out of the slot and drops into the tray
      if (s.cardOut > 0) {
        const ocw = osw - 6, och = Math.round(ocw * 0.62), drop = clamp(s.cardOut, 0, 1) * (y + h + 2 - (oy0 + 3));
        g.save(); g.beginPath(); g.rect(0, oy0 + 3, 640, 360); g.clip();
        card(g, ox0 + 3, oy0 + 3 - och + drop, ocw, och, 9, s.chk);
        g.restore();
      }
    };
    const open = s.door || 0;
    if (open > 0) {
      // cavity
      g.save(); g.beginPath(); g.rect(px0, py0, pw, ph); g.clip();
      s.inside(g, px0, py0, pw, ph);
      g.restore();
      // the door swings toward the camera on its left hinge
      const a = open * 1.78, ca = Math.cos(a), sa = Math.sin(a), fx = px0 + pw * ca, e = ph * 0.13 * sa;
      const quad = [[px0, py0], [fx, py0 - e], [fx, py0 + ph + e], [px0, py0 + ph]];
      alpha(g, 0.4, () => poly(g, [[px0, py0 + ph], [fx, py0 + ph + e], [fx + 10, py0 + ph + e + 6], [px0 + 6, py0 + ph + 4]], BLK));
      if (ca > 0) {
        // the face is rendered once off-screen and squashed to the door width (columns drop out, nothing is enlarged)
        const oc = OFF.c || (OFF.c = document.createElement("canvas"));
        if (oc.width !== pw || oc.height !== ph) { oc.width = pw; oc.height = ph; }
        const og = oc.getContext("2d"); og.setTransform(1, 0, 0, 1, 0, 0); og.clearRect(0, 0, pw, ph); og.translate(-px0, -py0); face(og);
        poly(g, quad, mix(WOOD[1], WOOD[2], 0.3));
        g.imageSmoothingEnabled = false; g.drawImage(oc, 0, 0, pw, ph, px0, Math.round(py0 - e * 0.5), Math.max(1, Math.round(pw * ca)), Math.round(ph + e));
        dim(g, 0.35 * (1 - ca), px0, py0 - e, pw * ca, ph + 2 * e);
      } else {
        poly(g, quad, WOOD[2]);
        const inner = [[px0 + (fx - px0) * 0.08, py0 + 6], [fx - (fx - px0) * 0.08, py0 - e + 6], [fx - (fx - px0) * 0.08, py0 + ph + e - 6], [px0 + (fx - px0) * 0.08, py0 + ph - 6]];
        poly(g, inner, WOOD[3]);
        for (let k = 1; k < 4; k++) { const u = k / 4; PX.line(g, lerp(px0, fx, u), lerp(py0, py0 - e, u) + 6, lerp(px0, fx, u), lerp(py0 + ph, py0 + ph + e, u) - 6, WOOD[2]); }
      }
      R(g, Math.round(fx) - (ca > 0 ? 0 : 3), Math.round(py0 - e), 3, Math.round(ph + 2 * e), WOOD[0]);   // door edge catches the light
      for (const hy of [py0 + 8, py0 + ph - 16]) { R(g, px0 - 3, hy, 4, 9, BRASS[2]); R(g, px0 - 3, hy, 4, 1, BRASS[0]); }
    } else face(g);
    { // answer tray on the body, in front
      const ox0 = px0 + Math.round(pw * 0.7), osw = Math.round(pw * 0.24), tx0 = ox0 - 6, tw = osw + 12, ty = y + h - 6;
      R(g, tx0, ty, tw, 9, BRASS[2]); R(g, tx0, ty, tw, 1, BRASS[0]); R(g, tx0, ty + 8, tw, 1, BRASS[3]); R(g, tx0 + 2, ty + 3, tw - 4, 1, BRASS[1]);
    }
    // brass corner brackets + rivets
    for (const [cx, cy, dx, dy] of [[x, y + ht, 1, 1], [x + w - 1, y + ht, -1, 1], [x, y + h - 1, 1, -1], [x + w - 1, y + h - 1, -1, -1]]) {
      const l = fr + 6;
      R(g, dx > 0 ? cx : cx - l + 1, dy > 0 ? cy : cy - 2, l, 3, BRASS[2]); R(g, dx > 0 ? cx : cx - 2, dy > 0 ? cy : cy - l + 1, 3, l, BRASS[2]);
      R(g, dx > 0 ? cx : cx - l + 1, dy > 0 ? cy : cy - 2, l, 1, BRASS[0]); dot(g, cx + dx * (l - 3), cy + dy, BRASS[0]); dot(g, cx + dx, cy + dy * (l - 3), BRASS[0]);
    }
    R(g, x + 6, y + h, 12, 3, BRASS[3]); R(g, x + w - 18, y + h, 12, 3, BRASS[3]);
    return { pcx: x + w / 2, pcy: y + ht + fr + ph * 0.43, px0, py0, pw, ph };
  };
  function plate(g, cx, y, txt, lit) {
    const tw = PX.tw(g, txt, { size: 8 }), w = Math.round(tw + 10), x = Math.round(cx - w / 2);
    R(g, x, y, w, 13, BRASS[3]); R(g, x + 1, y + 1, w - 2, 11, mix(BRASS[2], BRASS[1], lit * 0.7)); R(g, x + 1, y + 1, w - 2, 1, BRASS[0]);
    dot(g, x + 2, y + 6, BRASS[3]); dot(g, x + w - 3, y + 6, BRASS[3]);
    if (lit > 0) PX.glow(g, cx, y + 6, w * 0.8, D.lamp, 0.22 * lit);
    PX.text(g, txt, cx + 1, y + 3, { align: "center", size: 8, col: BRASS[3] });
    PX.text(g, txt, cx, y + 3, { align: "center", size: 8, col: lit > 0 ? mix(D.ink, D.cream, lit) : D.ink });
  }
  function lampDot(g, x, y, lit) {
    g.fillStyle = BRASS[3]; disc(g, x, y, 3); g.fillStyle = lit > 0 ? mix(D.amber[2], D.amber[0], lit) : mix(D.amber[2], D.n1, 0.6); disc(g, x, y, 2); dot(g, x - 1, y - 1, lit > 0 ? D.cream : BRASS[2]);
    if (lit > 0) PX.glow(g, x, y, 14, D.amber[1], 0.4 * lit);
  }

  // ======================= def_machine =======================
  // tinkerer's bench at night: card IN (o.in 1.0), gears turn in the RULES window (o.rules 3.0), card drops into the tray with a check (o.out 5.2)
  K.def_machine = (o) => {
    return (g, t, d, c) => {
      const k = d / 8.8, tin = o.in === undefined ? 1.0 * k : o.in, tru = o.rules === undefined ? 3.0 * k : o.rules, tout = o.out === undefined ? 5.2 * k : o.out;
      const T = bench(g, t, c, 1, 0, 0);
      const flick = 0.96 + 0.04 * Math.sin(t * 13) * Math.sin(t * 3.1);
      // bench clutter behind the machine
      const { RR, X, Y } = T;
      RR(150, 236, 30, 10, mix(D.n4, D.n3, 0.5)); RR(150, 236, 30, 1, D.n6); for (let i = 0; i < 4; i++) { g.fillStyle = BRASS[2]; disc(g, 156 + i * 6, 240, 2); }
      // machine
      const ga = t < tru ? 0 : (t - tru < 0.6 ? 1.4 * (t - tru) ** 2 / 1.2 : 1.4 * (t - tru - 0.3));
      const s = {
        cardIn: t < tin ? undefined : P(t, tin, 0.55, "io"), inLit: P(t, tin + 0.35, 0.3, "out"),
        rulesLit: P(t, tru, 0.5, "out"), gearA: ga,
        cardOut: P(t, tout, 0.7, "io"), chk: P(t, tout + 0.75, 0.45, "out"), outLit: P(t, tout + 0.6, 0.4, "out"),
      };
      const M = machine(g, 196, 112, 248, 146, t, s);
      // the tinkerer's hand lowers the card from above, pushes it into the slot, then withdraws
      {
        const cwid = Math.round(248 * 0.22) - 8, chh = Math.round(cwid * 0.62), hx = 196 + Math.round(248 * 0.12) + 4 + cwid / 2;
        const rest = 112 - chh - 2, down = P(t, tin - 0.8, 0.8, "out");
        if (t < tin && down > 0) { const cy = lerp(-chh - 40, rest, down); card(g, hx - cwid / 2, cy, cwid, chh, 5); hand(g, hx, cy + 3); }
        else if (t >= tin) { const cy = rest + s.cardIn * (chh + 6), hy = Math.min(cy, 112 - 10) + 3, up = P(t, tin + 0.35, 0.8, "io"); if (up < 1) hand(g, hx, lerp(hy, -40, up)); }
      }
      // foreground clutter
      RR(70, 240, 64, 8, mix(D.paper, D.n4, 0.3)); RR(70, 240, 64, 1, mix(D.paper, D.cream, 0.3)); for (let i = 0; i < 3; i++) RR(76, 243 + i * 2, 40 - i * 9, 1, mix(D.ink, D.paper, 0.5));   // notebook
      thick(g, 92, 252, 132, 249, 2, D.amber[2]); dot(g, 133, 249, D.ink);   // pencil
      thick(g, 470, 252, 500, 254, 3, mix(D.teal[2], D.n3, 0.3)); thick(g, 500, 254, 516, 255, 1, D.n6);   // screwdriver
      gear(g, 160, 252, 4, 7, 0.3, BRASS); gear(g, 172, 254, 3, 6, 0.1, BRASS);
      // oil can
      RR(560, 226, 18, 20, mix(D.rust[2], D.n2, 0.4)); RR(560, 226, 18, 1, mix(D.rust[1], D.n3, 0.3)); RR(577, 226, 1, 20, mix(D.rust[1], D.n3, 0.2)); thick(g, 568, 226, 584, 210, 2, D.n5);
      // lamp light: darkness away from the lamp, warm pool
      const [lx, ly] = benchLamp(g, T, flick);
      pool(g, lx - 70, ly + 70, 60, 420, 0.62);
      PX.glow(g, lx - 80, ly + 90, 220, D.lamp, 0.13 * flick);
      PX.glow(g, lx - 40, 250, 120, D.lampD, 0.12 * flick);
      benchLamp(g, T, flick);
      PX.glow(g, lx, ly, 26, D.lamp, 0.5 * flick);
      PX.particles(g, 11, 30, t, [300, 100, 220, 150], { vy: -2.5, vx: -1.5, col: D.lamp, a: 0.45 });
      PX.vignette(g, 0.55);
    };
  };
  // hand reaching down from above, pinching at (x, y)
  function hand(g, x, y) {
    x = Math.round(x); y = Math.round(y);
    const SL = mix(D.teal[2], D.n3, 0.55), SLl = mix(SL, D.cream, 0.15), SLd = mix(SL, D.n0, 0.4);
    R(g, x - 8, -10, 16, y - 12 + 10, SL); R(g, x - 8, -10, 3, y - 2, SLd); R(g, x + 6, -10, 2, y - 2, SLl);
    R(g, x - 9, y - 16, 18, 4, SLd); R(g, x - 9, y - 16, 18, 1, SLl);   // cuff
    R(g, x - 7, y - 12, 14, 10, SKIN[1]); R(g, x - 7, y - 12, 3, 10, SKIN[2]); R(g, x + 5, y - 12, 2, 9, SKIN[0]);
    R(g, x - 6, y - 3, 12, 2, SKIN[2]);
    R(g, x - 2, y - 4, 5, 8, SKIN[1]); R(g, x - 2, y - 4, 1, 8, SKIN[2]); R(g, x + 2, y - 4, 1, 7, SKIN[0]); R(g, x - 1, y + 3, 3, 1, SKIN[2]);   // thumb on the card
  }

  // ======================= alive_reveal =======================
  // same bench, closer: at o.open (1.2) the front panel swings open: inside, living tissue (amber slime network, drifting cells)
  K.alive_reveal = (o) => {
    const S = 1.5, OX = 320 - 320 * S, OY = 196 - 185 * S;
    const mx = Math.round(OX + 196 * S), my = Math.round(OY + 112 * S), mw = Math.round(248 * S), mh = Math.round(146 * S);
    const ht = Math.round(mh * 0.075), fr = Math.max(5, Math.round(mw * 0.036));
    const px0 = mx + fr, py0 = my + ht + fr, pw = mw - 2 * fr, ph = mh - ht - 2 * fr;
    const ccx = px0 + pw / 2, ccy = py0 + ph / 2;
    const net = slimeNet(23, ccx, ccy + 4, pw * 0.5, ph * 0.5, { arms: 7, w: 3.6, step: 3, depth: 5, spread: 0.5, links: 10, linkR: 18 });
    const r = PX.rnd(5);
    const cells = [...Array(22)].map(() => [px0 + r() * pw, py0 + r() * ph, 2 + r() * 3.2, r() * TAU, r() < 0.55]);
    const lumps = [...Array(9)].map((_, i) => [px0 + (i % 2 ? pw - 6 - r() * 24 : 6 + r() * 24), py0 + r() * ph, 14 + r() * 14]);
    const inside = (t, glow) => (g, x0, y0, w, h) => {
      R(g, x0, y0, w, h, mix(D.n0, D.rust[2], 0.22));
      // soft tissue folds at the walls
      for (const [lx, ly, lr] of lumps) { alpha(g, 0.4, () => { g.fillStyle = mix(D.rose[2], D.n1, 0.55); disc(g, lx, ly, lr + Math.sin(t * 1.1 + ly) * 0.8); }); alpha(g, 0.18, () => { g.fillStyle = mix(D.rose[1], D.n2, 0.4); disc(g, lx - lr * 0.2, ly - lr * 0.25, lr * 0.6); }); }
      for (let i = 0; i < 40; i++) dot(g, x0 + ((i * 71) % w), y0 + ((i * 43) % h), mix(D.rose[2], D.n1, 0.2));
      drawSlime(g, net, t, { fan: 3.4, pulse: 1 });
      for (const [cx0, cy0, cr, ph2, amb] of cells) {
        const cx = cx0 + Math.sin(t * 0.35 + ph2) * 6 + t * 1.2, cy = cy0 + Math.cos(t * 0.29 + ph2 * 1.3) * 4 - t * 0.8;
        cellBlob(g, x0 + ((((cx - x0) % w) + w) % w), y0 + ((((cy - y0) % h) + h) % h), cr, amb ? D.amber : D.rose, t, ph2);
      }
      PX.glow(g, ccx, ccy, Math.max(w, h) * 0.6, D.amber[1], (0.13 + 0.04 * Math.sin(t * 2.2)) * glow);
      dim(g, 0.55 * (1 - glow), x0, y0, w, h);
      dim(g, 0.35, x0, y0, w, 6); dim(g, 0.2, x0, y0 + 6, w, 6); dim(g, 0.3, x0, y0, 5, h);   // depth at the cavity edges
    };
    return (g, t, d, c) => {
      const T = bench(g, t, c, S, OX, OY);
      const flick = 0.96 + 0.04 * Math.sin(t * 13) * Math.sin(t * 3.1);
      const top = o.open === undefined ? 1.2 * d / 5.3 : o.open, op = P(t, top, 1.0, "io"), glow = P(t, top + 0.2, 1.6, "out");
      machine(g, mx, my, mw, mh, t, { door: op, inside: inside(t, glow), gearA: t * 1.4, rulesLit: 0.4, inLit: 0, outLit: 0 });
      const [lx, ly] = benchLamp(g, T, flick);
      pool(g, lx - 120, ly + 120, 80, 460, 0.55);
      PX.glow(g, lx - 120, ly + 120, 260, D.lamp, 0.12 * flick);
      benchLamp(g, T, flick);
      PX.glow(g, lx, ly, 30, D.lamp, 0.5 * flick);
      // warm living light spills out onto the bench
      PX.glow(g, ccx, py0 + ph, 200, D.amber[1], 0.12 * glow);
      PX.particles(g, 12, 34, t, [120, 60, 420, 240], { vy: -2.5, vx: -1.2, col: D.lamp, a: 0.4 });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= cabinet =======================
  // natural-history specimen cabinet at night, five displays numbered 1-5.
  // o.lit: times jar k's lamp turns on ([0.5,1.2,1.9,2.6,3.3]); o.focus 1..5 / 0; o.focusAt (0) when the focus fades in; o.check [[jar, time], ...]
  K.cabinet = (o) => {
    const focus = o.focus || 0, fat = o.focusAt || 0, checks = o.check || [];
    const JARS = [[204, 140], [320, 140], [436, 140], [262, 278], [378, 278]];   // plinth-top centre
    const r = PX.rnd(17);
    const n1 = slimeNet(31, 204, 114, 16, 6, { arms: 5, w: 1.4, step: 2, depth: 3, spread: 0.6, len: 7, links: 2, linkR: 7 });
    const cols4 = [...Array(12)].map(() => { const a = r() * TAU, rr = 3 + Math.sqrt(r()) * 11; return [Math.cos(a) * rr, Math.sin(a) * rr * 0.4, 0.7 + r() * 1.1]; });
    const item = (k, x, y, t, L) => {
      if (k === 0) { R(g0, x - 2, y - 14, 4, 14, BRASS[2]); dish(g0, x, y - 26, 19, 8, mix(D.n2, D.amber[2], 0.25), (g) => drawSlime(g, n1, t, { fan: 1.6, sc: 1 })); }
      if (k === 1) { const g = g0; R(g, x - 12, y - 10, 24, 10, WOOD[2]); R(g, x - 12, y - 10, 24, 1, WOOD[0]); R(g, x - 4, y - 50, 8, 42, mix(GLASS, D.n2, 0.6));
        R(g, x - 3, y - 30, 6, 21, mix(D.teal[0], D.n3, 0.45)); R(g, x - 3, y - 30, 6, 1, D.teal[0]); R(g, x - 3, y - 50, 1, 40, mix(GLASS, D.cream, 0.4)); R(g, x - 5, y - 52, 10, 2, GLASS);
        alpha(g, 0.6, () => dot(g, x + 1, y - 22 + Math.round(Math.sin(t * 1.5) * 2), D.teal[0])); }
      if (k === 2) { const g = g0; R(g, x - 7, y - 4, 14, 4, BRASS[2]); R(g, x - 7, y - 4, 14, 1, BRASS[0]); R(g, x - 2, y - 15, 5, 11, mix(GLASS, D.n2, 0.55)); R(g, x - 2, y - 18, 5, 3, WOOD[1]); R(g, x - 2, y - 18, 5, 1, WOOD[0]);
        R(g, x - 2, y - 15, 1, 10, mix(GLASS, D.cream, 0.35)); dot(g, x + 1, y - 6, D.ink); dot(g, x + 1, y - 7, mix(D.ink, GLASS, 0.5)); }
      if (k === 3) { R(g0, x - 2, y - 14, 4, 14, BRASS[2]); dish(g0, x, y - 26, 19, 8, mix(D.n3, D.paperD, 0.25), (g) => { for (const [cx, cy, cr] of cols4) { g.fillStyle = mix(D.paperD, D.n3, 0.35); disc(g, x + cx, y - 25.5 + cy, cr + 0.6); g.fillStyle = mix(D.paperD, D.moss[0], 0.25); disc(g, x + cx, y - 26 + cy, cr); dot(g, x + cx - 0.5, y - 26.5 + cy, D.paper); } }); }
      if (k === 4) { const g = g0; R(g, x - 12, y - 8, 24, 8, WOOD[2]); R(g, x - 12, y - 8, 24, 1, WOOD[0]);
        for (let i = 0; i < 6; i++) { R(g, x - 12 + i * 5, y - 12, 2, 4, BRASS[1]); dot(g, x - 12 + i * 5, y - 12, BRASS[0]); }
        R(g, x - 15, y - 22, 30, 10, D.n2); R(g, x - 15, y - 22, 30, 1, D.n5); R(g, x - 9, y - 21, 18, 7, mix(D.steel[1], D.steel[2], 0.5)); R(g, x - 9, y - 21, 18, 1, D.steel[0]);
        g.fillStyle = D.rose[2]; disc(g, x, y - 18, 3.4); g.fillStyle = D.rose[1]; disc(g, x, y - 19, 2.7 + Math.sin(t * 2) * 0.3); dot(g, x - 1, y - 20, D.rose[0]); }
    };
    let g0 = null;
    return (g, t, d, c) => {
      g0 = g;
      const lit = o.lit || [0.5, 1.2, 1.9, 2.6, 3.3].map((v) => (v * d) / 5);
      const fk = focus ? P(t, fat, 0.7, "io") : 0;
      // museum hall
      PX.vgrad(g, 0, 0, 640, 300, mix(D.n2, D.steel[2], 0.15), D.n1, 8);
      PX.par(g, c, 0.4, () => {
        // tall arched window with moonlight
        R(g, 24, 40, 78, 220, D.n2); g.fillStyle = D.n2; disc(g, 63, 40, 39);
        g.fillStyle = mix(D.n1, D.steel[2], 0.45); R(g, 30, 44, 66, 210, g.fillStyle); disc(g, 63, 44, 33);
        R(g, 61, 10, 4, 244, D.n2); for (let y = 70; y < 250; y += 46) R(g, 30, y, 66, 3, D.n2);
        alpha(g, 0.05, () => poly(g, [[30, 40], [96, 40], [210, 330], [110, 330]], D.steel[0]));
        // whale skeleton hanging high in the hall
        const SK = mix(D.n4, D.steel[2], 0.3);
        for (let i = 0; i < 28; i++) { const x = 420 + i * 7, y = 36 + Math.sin(i * 0.2) * 6 + i * 0.4; R(g, x, y, 5, 3, SK); if (i > 3 && i < 22) PX.line(g, x + 2, y + 3, x + 2 - 3, y + 14 + Math.sin(i * 0.3) * 4 - Math.abs(i - 12) * 0.5, SK); }
        poly(g, [[392, 30], [420, 34], [420, 42], [396, 44]], SK); PX.line(g, 430, 0, 430, 36, D.n2); PX.line(g, 560, 0, 560, 46, D.n2);
        // other cases far away
        R(g, 560, 180, 80, 120, mix(D.n2, WALN[3], 0.4)); R(g, 566, 186, 68, 60, mix(D.n1, D.teal[2], 0.15)); R(g, 0, 200, 22, 100, mix(D.n2, WALN[3], 0.4));
      });
      // floor
      R(g, 0, 300, 640, 60, mix(WALN[3], D.n1, 0.3));
      for (let y = 302, k = 0; y < 360; k++) { R(g, 0, y, 640, 1, mix(WALN[3], D.n0, 0.4)); y += 5 + k * 3; }
      for (let i = -10; i <= 10; i++) PX.line(g, 320 + i * 30, 300, 320 + i * 70, 360, mix(WALN[3], D.n0, 0.3));
      // cabinet
      alpha(g, 0.5, () => R(g, 126, 312, 392, 10, BLK));
      R(g, 128, 22, 384, 296, WALN[1]);
      R(g, 122, 18, 396, 10, WALN[1]); R(g, 122, 18, 396, 1, WALN[0]); R(g, 126, 28, 388, 3, WALN[2]); R(g, 128, 31, 384, 1, WALN[0]);   // crown
      R(g, 124, 300, 392, 18, WALN[1]); R(g, 124, 300, 392, 1, WALN[0]); R(g, 124, 316, 392, 2, WALN[3]);                               // base
      R(g, 128, 31, 12, 270, WALN[1]); R(g, 500, 31, 12, 270, WALN[1]); R(g, 511, 31, 1, 270, WALN[0]);
      for (const px of [131, 135, 503, 507]) R(g, px, 40, 1, 252, WALN[2]);   // fluted posts
      for (let x = 126; x < 514; x += 6) R(g, x, 31, 3, 3, WALN[2]);           // dentils under the crown
      for (const bx of [150, 330]) { R(g, bx, 303, 160, 11, WALN[2]); R(g, bx, 313, 160, 1, WALN[0]); R(g, bx + 74, 307, 12, 2, BRASS[2]); }
      // interior
      const IN = mix(D.n1, D.teal[2], 0.22);
      R(g, 140, 36, 360, 264, IN); R(g, 140, 36, 360, 6, mix(IN, D.n0, 0.5));
      for (let x = 150; x < 500; x += 22) R(g, x, 42, 1, 258, mix(IN, D.n0, 0.25));
      R(g, 140, 150, 360, 8, WALN[1]); R(g, 140, 150, 360, 1, WALN[0]); R(g, 140, 157, 360, 2, WALN[3]);   // shelf
      alpha(g, 0.4, () => R(g, 140, 159, 360, 6, BLK));
      R(g, 140, 288, 360, 12, WALN[2]); R(g, 140, 288, 360, 1, WALN[0]);
      // displays
      JARS.forEach(([x, y], k) => {
        const L = P(t, lit[k] === undefined ? 0 : lit[k], 0.45, "out") * (focus && focus !== k + 1 ? 1 - 0.6 * fk : 1);
        const ly = k < 3 ? 44 : 164;
        // little brass spot lamp
        R(g, x - 4, ly - 2, 8, 2, BRASS[3]); R(g, x - 3, ly, 6, 4, BRASS[2]); R(g, x - 3, ly, 6, 1, BRASS[0]);
        R(g, x - 2, ly + 4, 4, 1, L > 0.05 ? mix(D.lampD, D.cream, L) : D.n3);
        if (L > 0) { alpha(g, 0.07 * L, () => poly(g, [[x - 3, ly + 5], [x + 3, ly + 5], [x + 30, y], [x - 30, y]], D.lamp)); PX.glow(g, x, y - 26, 46, D.lamp, 0.24 * L); }
        // plinth
        R(g, x - 30, y, 60, 10, WALN[0]); R(g, x - 30, y, 60, 1, mix(WALN[0], D.lamp, 0.3)); R(g, x - 30, y + 9, 60, 1, WALN[2]);
        item(k, x, y, t, L);
        // bell jar
        const jh = 58, jw = 26;
        alpha(g, 0.1, () => { R(g, x - jw, y - jh + 8, jw * 2, jh - 8, GLASS); g.fillStyle = GLASS; disc(g, x, y - jh + 9, jw - 2); });
        alpha(g, 0.5, () => { R(g, x - jw, y - jh + 9, 1, jh - 10, GLASS); R(g, x + jw - 1, y - jh + 9, 1, jh - 10, GLASS); ering(g, x, y - jh + 9, jw - 1, jw - 6, GLASS, Math.PI, TAU); ering(g, x, y - 1, jw - 1, 2, GLASS, 0, Math.PI); });
        alpha(g, 0.55 + 0.3 * L, () => { R(g, x - jw + 4, y - jh + 14, 1, jh - 22, D.cream); R(g, x - jw + 6, y - jh + 18, 1, 10, D.cream); });
        R(g, x - 3, y - jh - 1, 6, 4, mix(GLASS, D.n3, 0.4)); R(g, x - 2, y - jh - 1, 4, 1, GLASS);
        // brass number plate (+ tick)
        const chk = checks.find((cc) => cc[0] === k + 1), ck = chk ? P(t, chk[1], 0.25, "out") : 0;
        const pw2 = ck > 0 ? 24 : 14, px2 = x - pw2 / 2;
        R(g, px2, y + 1, pw2, 9, BRASS[3]); R(g, px2 + 1, y + 1, pw2 - 2, 8, mix(BRASS[2], BRASS[1], 0.3 + 0.5 * L)); R(g, px2 + 1, y + 1, pw2 - 2, 1, BRASS[0]);
        PX.text(g, String(k + 1), ck > 0 ? x - 5 : x, y + 2, { align: "center", size: 8, col: D.ink });
        if (ck > 0) alpha(g, ck, () => { const tx = x + 3, ty = y + 5; R(g, tx, ty, 1, 1, D.cream); R(g, tx + 1, ty + 1, 1, 1, D.cream); R(g, tx + 2, ty + 2, 1, 1, D.cream); R(g, tx + 3, ty + 1, 1, 1, D.cream); R(g, tx + 4, ty, 1, 1, D.cream); R(g, tx + 5, ty - 1, 1, 1, D.cream); R(g, tx + 6, ty - 2, 1, 1, D.cream); });
        if (L < 1) { const gr = g.createRadialGradient(x, y - 26, 6, x, y - 26, 46); gr.addColorStop(0, `rgba(0,0,0,${(0.6 * (1 - L)).toFixed(3)})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - 46, y - 72, 92, 92); }
      });
      // glass doors: frames, mullion, reflections
      const FR = WALN[1];
      R(g, 140, 36, 360, 4, FR); R(g, 140, 296, 360, 4, FR); R(g, 140, 36, 4, 264, FR); R(g, 496, 36, 4, 264, FR); R(g, 499, 36, 1, 264, WALN[0]);
      alpha(g, 0.06, () => { poly(g, [[170, 40], [196, 40], [150, 296], [144, 296], [144, 200]], D.cream); poly(g, [[352, 40], [360, 40], [296, 296], [288, 296]], D.cream); poly(g, [[462, 40], [490, 40], [446, 296], [420, 296]], D.cream); });
      R(g, 316, 293, 8, 5, BRASS[2]); R(g, 316, 293, 8, 1, BRASS[0]); dot(g, 320, 295, D.n0);   // lock
      // reading lamp on a side table
      R(g, 536, 252, 92, 6, WALN[1]); R(g, 536, 252, 92, 1, WALN[0]); R(g, 544, 258, 5, 60, WALN[2]); R(g, 616, 258, 5, 60, WALN[2]);
      R(g, 548, 240, 40, 12, mix(D.rust[2], D.n2, 0.45)); R(g, 548, 240, 40, 1, mix(D.rust[1], D.n3, 0.4)); R(g, 550, 244, 36, 1, D.paperD);   // book
      R(g, 594, 248, 18, 4, BRASS[2]); R(g, 602, 220, 2, 28, BRASS[2]);
      poly(g, [[586, 206], [620, 206], [624, 222], [582, 222]], mix(D.moss[2], D.n1, 0.25)); R(g, 586, 206, 34, 1, D.moss[1]);
      R(g, 584, 222, 38, 2, D.lamp);
      pool(g, 420, 200, 150, 470, 0.5);
      PX.glow(g, 603, 236, 70, D.lamp, 0.45); PX.glow(g, 560, 250, 150, D.lampD, 0.12);
      // focus: spotlight on one display, others dim
      if (fk > 0) { const [fx, fy] = JARS[focus - 1]; pool(g, fx, fy - 26, 34, 190, 0.6 * fk); PX.glow(g, fx, fy - 26, 50, D.lamp, 0.16 * fk); }
      PX.particles(g, 14, 26, t, [140, 40, 360, 250], { vy: -1.5, vx: 1, col: D.lamp, a: 0.3 });
      // velvet rope on brass stanchions (nearest layer)
      PX.par(g, c, 1.15, () => {
        const RP = [mix(D.rust[1], D.n3, 0.35), mix(D.rust[2], D.n1, 0.3)];
        for (let x = 40; x <= 600; x++) { const u = (x - 40) / 560, y = 322 + Math.sin(u * Math.PI) * 18; R(g, x, y, 1, 4, RP[1]); R(g, x, y, 1, 2, RP[0]); }
        for (const x of [40, 600]) { R(g, x - 2, 316, 5, 60, BRASS[2]); R(g, x - 2, 316, 1, 60, BRASS[0]); g.fillStyle = BRASS[1]; disc(g, x, 314, 4); dot(g, x - 1, 312, BRASS[0]); }
      });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= textbook =======================
  // open CS textbook under a lamp; contents write themselves at o.items, each with a tiny drawing of its living computer;
  // o.same (11.0): right page "THE HARDWARE GOT WEIRD" + a pencil underlines "THE IDEAS STAYED THE SAME"
  K.textbook = (o) => {
    const LINES = ["SHORTEST PATHS", "PARALLEL SEARCH", "ERROR CORRECTION", "LOGIC GATES", "LEARNING FROM FEEDBACK"];
    const r = PX.rnd(3);
    const body = [...Array(9)].map((_, i) => [336, 58 + i * 8, i === 8 ? 90 : 170 + r() * 30]);
    const grain = [...Array(60)].map(() => [r() * 640, r() * 360, 20 + r() * 80, r()]);
    const iconNet = slimeNet(12, 120, 99, 10, 8, { arms: 5, w: 1.5, step: 2, depth: 2, len: 6 });
    const INK = D.ink, INKf = mix(D.ink, D.paper, 0.45);
    // tiny printed illustrations, 24x24 box at (x, y): ink outline + a soft wash of the accent
    const icon = (g, k, x, y, t) => {
      const wash = (c) => mix(c, D.paper, 0.3);
      if (k === 0) { g.fillStyle = mix(D.amber[2], D.paper, 0.5); disc(g, x + 12, y + 13, 9); drawSlime(g, iconNet, t, { fan: 1.5, cols: [D.amber[0], wash(D.amber[1]), mix(D.amber[2], D.paper, 0.15)] }); }
      if (k === 1) {   // test tube, tilted
        thick(g, x + 7, y + 3, x + 17, y + 20, 7, INK); thick(g, x + 7, y + 3, x + 17, y + 20, 5, D.paper);
        thick(g, x + 11, y + 10, x + 17, y + 20, 5, wash(D.teal[1])); thick(g, x + 11, y + 10, x + 13, y + 13, 5, wash(D.teal[0]));
        thick(g, x + 4, y + 4, x + 10, y + 1, 2, INK); PX.line(g, x + 8, y + 6, x + 13, y + 14, D.cream);
      }
      if (k === 2) {   // vial with a speck
        R(g, x + 8, y + 7, 9, 15, INK); R(g, x + 9, y + 8, 7, 13, D.paper); R(g, x + 9, y + 14, 7, 7, wash(GLASS)); R(g, x + 9, y + 14, 7, 1, mix(GLASS, D.ink, 0.3));
        R(g, x + 8, y + 2, 9, 5, WOOD[1]); R(g, x + 8, y + 2, 9, 1, WOOD[0]); R(g, x + 8, y + 6, 9, 1, INK); R(g, x + 10, y + 9, 1, 10, D.cream); dot(g, x + 13, y + 19, INK);
      }
      if (k === 3) {   // rod bacterium with flagella
        const BC = wash(D.moss[1]);
        thick(g, x + 6, y + 15, x + 17, y + 9, 9, INK); thick(g, x + 6, y + 15, x + 17, y + 9, 7, BC);
        thick(g, x + 7, y + 13, x + 15, y + 9, 2, mix(BC, D.cream, 0.4)); dot(g, x + 10, y + 14, mix(D.moss[2], D.paper, 0.2)); dot(g, x + 14, y + 12, mix(D.moss[2], D.paper, 0.2));
        const w = Math.sin(t * 5) * 1.5;
        PX.line(g, x + 21, y + 7, x + 23, y + 3 + w, INK); PX.line(g, x + 2, y + 18, x + 0, y + 22 - w, INK); PX.line(g, x + 3, y + 19, x + 3, y + 23 + w, INK);
      }
      if (k === 4) {   // neuron dish
        ell(g, x + 12, y + 14, 11, 7, INK); ell(g, x + 12, y + 14, 10, 6, D.paper); ell(g, x + 12, y + 14, 8, 5, mix(D.paper, D.paperD, 0.5));
        for (const [dx, dy] of [[-7, -2], [6, -3], [-5, 4], [6, 3], [0, -5]]) PX.line(g, x + 12, y + 14, x + 12 + dx, y + 14 + dy, mix(D.rose[2], D.paper, 0.2));
        g.fillStyle = wash(D.rose[1]); disc(g, x + 12, y + 14, 2.2); dot(g, x + 11, y + 13, D.cream);
        if (PX.blink(t, 1.3, 0.25)) dot(g, x + 16, y + 12, D.amber[0]);
      }
    };
    return (g, t, d, c) => {
      const items = o.items || [1, 2.5, 4, 5.5, 7].map((v) => (v * d) / 16), tsame = o.same === undefined ? (11.0 * d) / 16 : o.same;
      // desk (top-down planks)
      R(g, 0, 0, 640, 360, WOOD[2]);
      for (let y = 0; y < 360; y += 30) { R(g, 0, y, 640, 1, WOOD[3]); R(g, 0, y + 1, 640, 1, mix(WOOD[2], WOOD[1], 0.4)); }
      for (const [x, y, l, v] of grain) R(g, x, Math.floor(y / 3) * 3, l, 1, v < 0.5 ? mix(WOOD[2], WOOD[3], 0.5) : mix(WOOD[2], WOOD[1], 0.35));
      // desk things: sticky note, eraser, mug
      PX.par(g, c, 0.85, () => {
        alpha(g, 0.35, () => R(g, 578, 46, 46, 44, BLK)); R(g, 574, 42, 46, 44, mix(D.amber[0], D.paper, 0.45)); R(g, 574, 42, 46, 6, mix(D.amber[1], D.paper, 0.4));
        for (let i = 0; i < 3; i++) R(g, 580, 56 + i * 8, 30 - i * 7, 1, mix(D.ink, D.paper, 0.4));
        R(g, 30, 300, 26, 12, mix(D.rose[1], D.paper, 0.3)); R(g, 30, 300, 26, 4, mix(D.steel[1], D.n4, 0.3)); R(g, 30, 300, 26, 1, mix(D.steel[0], D.n5, 0.2));
      });
      // book shadow, cover, page blocks
      alpha(g, 0.45, () => R(g, 86, 42, 478, 300, BLK));
      const CV = mix(D.rust[2], D.n1, 0.4);
      R(g, 80, 34, 480, 300, CV); R(g, 80, 34, 480, 1, mix(CV, D.cream, 0.15));
      for (let i = 0; i < 4; i++) { R(g, 86 + i, 38 + i, 232 - i, 292 - i * 2, i % 2 ? D.paperD : mix(D.paper, D.paperD, 0.5)); R(g, 322, 38 + i, 232 - i, 292 - i * 2, i % 2 ? D.paperD : mix(D.paper, D.paperD, 0.5)); }
      const PG = mix(D.paper, D.paperD, 0.15);
      R(g, 92, 42, 228, 284, PG); R(g, 320, 42, 228, 284, PG);
      for (let i = 0; i < 12; i++) alpha(g, 0.08 + i * 0.02, () => { R(g, 308 + i, 42, 1, 284, D.paperD); R(g, 332 - i, 42, 1, 284, D.paperD); });   // gutter
      R(g, 319, 42, 2, 284, mix(D.paperD, D.ink, 0.3));
      R(g, 92, 42, 228, 1, D.cream); R(g, 320, 42, 228, 1, D.cream);
      // left page: contents
      PX.text(g, "CONTENTS", 206, 56, { align: "center", size: 8, col: INK });
      R(g, 132, 70, 148, 1, INKf);
      items.forEach((ti, i) => {
        if (t < ti) return;
        const y = 92 + i * 44, s = LINES[i], shown = PX.typed(s, t, ti, 20);
        const ik = P(t, ti, 0.6, "out");
        g.save(); g.beginPath(); g.rect(106, y - 7, 28, 28 * ik); g.clip();
        icon(g, i, 108, y - 6, t);
        g.restore();
        const w = PX.text(g, shown, 140, y, { font: "v", size: 16, col: INK });
        if (shown.length < s.length) R(g, 140 + w + 1, y + 2, 2, 11, INK);
        else { const sw = PX.tw(g, s, { font: "v", size: 16 }); const lk = P(t, ti + s.length / 20, 0.6, "out"); for (let x = 144 + sw; x < lerp(144 + sw, 306, lk); x += 4) dot(g, x, y + 11, INKf); }
      });
      // right page: printed body text + a small graph figure
      for (const [x, y, w] of body) { R(g, x, y, w, 2, mix(D.paper, D.ink, 0.22)); }
      R(g, 352, 138, 166, 52, mix(D.paper, D.paperD, 0.3));
      const NODES = [[372, 162], [400, 148], [404, 178], [436, 158], [468, 146], [470, 176], [498, 162]];
      for (const [a, b] of [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [1, 4]]) PX.line(g, NODES[a][0], NODES[a][1], NODES[b][0], NODES[b][1], INKf);
      for (const [x, y] of NODES) { g.fillStyle = INKf; disc(g, x, y, 2.5); g.fillStyle = D.paper; disc(g, x, y, 1.2); }
      const ks = P(t, tsame, 0.8, "out"), ks2 = P(t, tsame + 0.5, 0.8, "out");
      if (ks > 0) alpha(g, ks, () => PX.text(g, "THE HARDWARE GOT WEIRD", 434, 210, { font: "v", size: 16, align: "center", col: mix(D.ink, D.paper, 0.4) }));
      if (ks2 > 0) alpha(g, ks2, () => PX.text(g, "THE IDEAS STAYED THE SAME", 434, 234, { align: "center", size: 8, col: INK }));
      // pencil underline
      const u0 = tsame + 1.3, uk = P(t, u0, 1.3, "io");
      const ux = (k) => 336 + k * 198, uy = (k) => 247 + Math.sin(k * 9) * 0.8 + k * 1.2;
      if (uk > 0) { const n = Math.round(uk * 198); for (let i = 0; i <= n; i++) { const k = i / 198; R(g, ux(k), uy(k), 1, 1, mix(D.n3, D.paper, 0.2)); if (i % 7 < 4) R(g, ux(k), uy(k) + 1, 1, 1, mix(D.n4, D.paper, 0.45)); } }
      // the pencil itself: slides in, draws, then rests on the page
      const pin = P(t, tsame + 0.6, 0.7, "out"), pout = P(t, u0 + 1.5, 1.0, "io");
      if (pin > 0) {
        let tx = lerp(640, ux(0), pin), ty = lerp(380, uy(0), pin);
        if (uk > 0) { tx = ux(uk); ty = uy(uk); }
        if (pout > 0) { tx = lerp(ux(1), 452, pout); ty = lerp(uy(1), 296, pout); }
        pencil(g, tx, ty, -0.6 - 0.08 * pout, pout);
      }
      // a draught lifts the page corner a little
      const cl = Math.sin(clamp((t - (items[4] + tsame) / 2) / 1.6, 0, 1) * Math.PI) * 7;
      if (cl > 0.5) { poly(g, [[548 - cl, 326], [548, 326], [548, 326 - cl]], WOOD[2]); poly(g, [[548 - cl, 326], [548 - cl * 0.9, 326 - cl * 0.9], [548, 326 - cl]], mix(D.paper, D.paperD, 0.4)); }
      // mug (top-down) with steam
      const mx = 600, my = 304;
      alpha(g, 0.4, () => { g.fillStyle = BLK; disc(g, mx + 4, my + 5, 22); });
      g.fillStyle = mix(D.n6, D.cream, 0.4); disc(g, mx, my, 21); R(g, mx - 30, my - 4, 12, 8, mix(D.n6, D.cream, 0.4));
      g.fillStyle = mix(D.n5, D.cream, 0.3); disc(g, mx + 1, my + 1, 17); g.fillStyle = mix(D.rust[2], D.n0, 0.55); disc(g, mx + 1, my + 1, 16);
      alpha(g, 0.5, () => ering(g, mx + 1, my + 1, 12, 12, mix(D.rust[2], D.lampD, 0.4), 3.6, 4.6));
      for (let i = 0; i < 4; i++) { const k = (t * 0.35 + i / 4) % 1; alpha(g, 0.22 * Math.sin(k * Math.PI), () => R(g, mx - 6 + Math.sin(k * 7 + i) * 6 - k * 18, my - 6 - k * 50, 3, 4, D.cream)); }
      // lamp light from top-left
      pool(g, 220, 120, 80, 520, 0.68);
      PX.glow(g, 210, 110, 300, D.lamp, 0.05);
      PX.particles(g, 18, 22, t, [100, 40, 300, 220], { vy: -1.5, vx: 1.5, col: D.lamp, a: 0.35 });
      PX.vignette(g, 0.5);
    };
  };
  // pencil seen from above: tip at (x, y), body along angle a (pointing up-right from the tip)
  function pencil(g, x, y, a, lift) {
    const L = 84, dx = Math.cos(a), dy = Math.sin(a), nx = -dy, ny = dx, sh = 3 + lift * 6;
    const at = (k, s) => [x + dx * k + nx * s, y + dy * k + ny * s];
    alpha(g, 0.3, () => poly(g, [at(0, 0), at(12, -3), at(L, -3), at(L, 3), at(12, 3)].map(([px, py]) => [px + sh, py + sh]), BLK));
    poly(g, [at(L - 10, -3), at(L, -3), at(L, 3), at(L - 10, 3)], mix(D.rose[1], D.paper, 0.15));
    poly(g, [at(L - 16, -3), at(L - 10, -3), at(L - 10, 3), at(L - 16, 3)], D.n6);
    poly(g, [at(12, -3), at(L - 16, -3), at(L - 16, 3), at(12, 3)], D.amber[1]);
    poly(g, [at(12, -3), at(L - 16, -3), at(L - 16, -1), at(12, -1)], D.amber[0]);
    poly(g, [at(12, 1.5), at(L - 16, 1.5), at(L - 16, 3), at(12, 3)], D.amber[2]);
    poly(g, [at(0, 0), at(12, -3), at(12, 3)], D.paperD);
    poly(g, [at(0, 0), at(4, -1), at(4, 1)], D.n2);
  }

  // ======================= weird_hw =======================
  // lab bench conveyor: hardware swaps in the same socket (chip, slime dish, test tube, DNA vial, bacteria dish, neuron chip)
  // while one calm cream "idea" bulb above stays constant. o.step (d/6) seconds per item, o.swap (0.4) transition length
  K.weird_hw = (o) => {
    const r = PX.rnd(8);
    const net = slimeNet(44, 0, 0, 34, 10, { arms: 6, w: 2.0, step: 2, depth: 4, spread: 0.6, len: 11, links: 3, linkR: 10 });
    const cols = [...Array(16)].map(() => { const a = r() * TAU, rr = 4 + Math.sqrt(r()) * 28; return [Math.cos(a) * rr, Math.sin(a) * rr * 0.3, 1 + r() * 1.6]; });
    const neur = [...Array(7)].map(() => [(r() - 0.5) * 36, (r() - 0.5) * 8, r() * TAU, r() * TAU]);
    const shelfG = [...Array(16)].map((_, i) => [-40 + i * 46 + r() * 20, r(), r()]);
    const G = mix(GLASS, D.n2, 0.55), Gl = mix(GLASS, D.cream, 0.4);
    // all items drawn natively at bench scale; (x, y) = bottom centre on the socket
    const chip = (g, x, y, top) => {
      alpha(g, 0.4, () => R(g, x - 34, y - 2, 72, 3, BLK));
      for (let i = 0; i < 10; i++) { R(g, x - 29 + i * 6, y - 7, 3, 7, D.n6); R(g, x - 29 + i * 6, y - 7, 1, 7, D.n7); }
      R(g, x - 33, y - 16, 66, 9, D.n2); R(g, x - 33, y - 8, 66, 1, D.n1);
      R(g, x - 33, y - 26, 66, 10, D.n3); R(g, x - 33, y - 26, 66, 1, D.n5); R(g, x + 32, y - 26, 1, 10, D.n4);
      dot(g, x - 29, y - 23, D.n5);
      if (top) top(); else { R(g, x - 13, y - 25, 26, 7, mix(D.steel[2], D.n3, 0.3)); R(g, x - 12, y - 24, 24, 5, mix(D.steel[1], D.steel[2], 0.5)); R(g, x - 12, y - 24, 24, 1, D.steel[0]);
        for (let i = 0; i < 5; i++) R(g, x - 10 + i * 5, y - 22, 3, 2, mix(D.steel[0], D.steel[1], 0.5)); }
    };
    const petri = (g, x, y, agar, fill) => { R(g, x - 6, y - 8, 12, 8, D.n4); R(g, x - 6, y - 8, 12, 1, D.n6); dish(g, x, y - 18, 40, 12, agar, fill); };
    const ITEMS = [
      (g, x, y, t) => chip(g, x, y),
      (g, x, y, t) => petri(g, x, y, mix(D.n2, D.amber[2], 0.22), (gg) => { gg.save(); gg.translate(x, y - 18); drawSlime(gg, net, t, { fan: 2 }); gg.restore(); }),
      (g, x, y, t) => {   // test tube in a wooden holder
        alpha(g, 0.4, () => R(g, x - 24, y - 2, 50, 3, BLK));
        R(g, x - 24, y - 14, 48, 14, WOOD[1]); R(g, x - 24, y - 14, 48, 1, WOOD[0]); R(g, x - 24, y - 1, 48, 1, WOOD[3]); R(g, x - 8, y - 14, 16, 3, WOOD[3]);
        R(g, x - 7, y - 80, 14, 70, G); g.fillStyle = G; disc(g, x, y - 11, 7);
        R(g, x - 6, y - 44, 12, 33, mix(D.teal[0], D.n3, 0.4)); g.fillStyle = mix(D.teal[0], D.n3, 0.4); disc(g, x, y - 12, 6);
        R(g, x - 6, y - 44 + Math.round(Math.sin(t * 2.5) * 0.6), 12, 1, D.teal[0]);
        R(g, x - 5, y - 78, 1, 64, Gl); R(g, x + 4, y - 70, 1, 40, mix(GLASS, D.n3, 0.2)); R(g, x - 9, y - 82, 18, 3, GLASS); R(g, x - 9, y - 82, 18, 1, D.cream);
      },
      (g, x, y, t) => {   // DNA vial with a helix label
        alpha(g, 0.4, () => R(g, x - 14, y - 2, 30, 3, BLK));
        R(g, x - 11, y - 46, 22, 46, G); R(g, x - 11, y - 1, 22, 1, mix(GLASS, D.n3, 0.4));
        R(g, x - 10, y - 14, 20, 13, mix(GLASS, D.n2, 0.3));
        R(g, x - 12, y - 58, 24, 12, WOOD[1]); R(g, x - 12, y - 58, 24, 1, WOOD[0]); R(g, x - 12, y - 47, 24, 1, WOOD[3]);
        R(g, x - 10, y - 40, 20, 22, D.paper); R(g, x - 10, y - 40, 20, 1, D.cream); R(g, x - 10, y - 19, 20, 1, D.paperD);
        const B = [D.dna.A, D.dna.C, D.dna.G, D.dna.T];
        for (let i = 0; i < 18; i++) { const s = Math.sin(i * 0.62 + t * 1.6), a = Math.round(s * 6), b2 = -a;
          if (i % 3 === 0) PX.line(g, x + Math.min(a, b2), y - 38 + i, x + Math.max(a, b2), y - 38 + i, mix(D.ink, D.paper, 0.5));
          dot(g, x + a, y - 38 + i, B[i % 4]); dot(g, x + b2, y - 38 + i, B[(i + 2) % 4]); }
        R(g, x - 10, y - 46, 1, 44, Gl); R(g, x + 9, y - 44, 1, 40, mix(GLASS, D.n3, 0.2));
      },
      (g, x, y, t) => petri(g, x, y, mix(D.n3, D.paperD, 0.22), (gg) => { for (const [cx, cy, cr] of cols) { gg.fillStyle = mix(D.paperD, D.n3, 0.35); disc(gg, x + cx, y - 17.5 + cy, cr + 0.6); gg.fillStyle = mix(D.paperD, D.moss[0], 0.25); disc(gg, x + cx, y - 18 + cy, cr); dot(gg, x + cx - 0.5, y - 18.5 + cy, D.paper); } }),
      (g, x, y, t) => chip(g, x, y, () => {   // neuron chip: a glass well of living cells on top
        ell(g, x, y - 27, 25, 7, mix(GLASS, D.n3, 0.45)); ell(g, x, y - 27, 23, 6, mix(D.rose[2], D.n1, 0.45));
        for (const [nx, ny, a1, a2] of neur) { const cx = x + nx, cy = y - 27 + ny * 0.6;
          PX.line(g, cx, cy, cx + 6 * Math.cos(a1), cy + 2 * Math.sin(a1), D.rose[2]); PX.line(g, cx, cy, cx + 5 * Math.cos(a2), cy + 2 * Math.sin(a2), D.rose[2]);
          g.fillStyle = D.rose[1]; disc(g, cx, cy, 1.4); dot(g, cx - 1, cy - 1, D.rose[0]); }
        for (let k = 0; k < 3; k++) if (PX.blink(t + k * 0.29, 0.8 + k * 0.17, 0.25)) dot(g, x + neur[k][0] + 3, y - 27 + neur[k][1] * 0.6, D.amber[0]);
        ering(g, x, y - 27, 25, 7, GLASS, Math.PI * 1.1, Math.PI * 1.9); ering(g, x, y - 27, 25, 7, mix(GLASS, D.n3, 0.3), 0, Math.PI);
      }),
    ];
    return (g, t, d, c) => {
      const step = o.step || d / 6, sw = o.swap || 0.4;
      const BX = 320, BY = 92;
      // tiled lab wall
      PX.vgrad(g, 0, 0, 640, 262, mix(D.n2, D.teal[2], 0.15), mix(D.n1, D.teal[2], 0.05), 8);
      PX.par(g, c, 0.5, () => {
        for (let y = -60; y < 262; y += 14) { R(g, -60, y, 760, 1, mix(D.n1, D.n0, 0.35)); for (let x = (y / 14) % 2 ? -60 : -49; x < 700; x += 22) R(g, x, y, 1, 14, mix(D.n1, D.n0, 0.35)); }
        // night window with blinds
        R(g, 36, 30, 140, 150, mix(D.n3, D.n2, 0.5)); R(g, 42, 36, 128, 138, mix(D.n1, D.steel[2], 0.35));
        for (let y = 38; y < 172; y += 6) { R(g, 42, y, 128, 4, mix(D.n3, D.steel[2], 0.25)); R(g, 42, y, 128, 1, mix(D.n4, D.steel[1], 0.25)); }
        R(g, 104, 36, 1, 138, D.n4); R(g, 34, 178, 144, 4, D.n4); R(g, 34, 178, 144, 1, D.n5);
        // shelf of glassware, gap around the lamp
        R(g, -60, 132, 760, 4, mix(D.n3, WB, 0.25)); R(g, -60, 132, 760, 1, D.n5);
        for (const [x, k, v] of shelfG) {
          if (x > 240 && x < 390) continue;
          const GL = mix(GLASS, D.n2, 0.68);
          if (k < 0.4) { poly(g, [[x + 6, 100], [x + 11, 100], [x + 11, 112], [x + 18, 132], [x - 1, 132], [x + 6, 112]], GL); R(g, x + 2, 122, 14, 10, mix(v < 0.5 ? D.moss[2] : D.teal[2], D.n2, 0.45)); R(g, x + 6, 100, 1, 14, mix(GLASS, D.n4, 0.3)); }
          else if (k < 0.75) { R(g, x, 108, 16, 24, GL); R(g, x + 1, 120, 14, 12, mix(v < 0.5 ? D.amber[2] : D.teal[2], D.n2, 0.55)); R(g, x, 108, 1, 24, mix(GLASS, D.n4, 0.3)); R(g, x, 108, 16, 1, mix(GLASS, D.n4, 0.3)); }
          else { R(g, x, 116, 24, 16, mix(D.paperD, D.n2, 0.62)); R(g, x + 2, 120, 20, 1, D.n3); }
        }
        // clipboard + outlet
        R(g, 520, 150, 44, 58, mix(WB, D.n2, 0.35)); R(g, 524, 156, 36, 48, mix(D.paper, D.n3, 0.5)); R(g, 536, 147, 12, 6, D.n5);
        for (let i = 0; i < 5; i++) R(g, 528, 162 + i * 8, 26 - (i % 2) * 8, 1, mix(D.ink, D.n3, 0.4));
        R(g, 590, 212, 14, 20, D.n4); R(g, 590, 212, 14, 1, D.n6); R(g, 594, 218, 2, 3, D.n1); R(g, 598, 218, 2, 3, D.n1);
      });
      // bulb cord
      R(g, BX, 0, 1, BY - 18, D.n4);
      // bench
      const BT = 252;
      R(g, 0, BT, 640, 14, mix(D.n2, D.n3, 0.5)); R(g, 0, BT, 640, 1, D.n5);
      R(g, 0, BT + 14, 640, 10, D.n2); R(g, 0, BT + 14, 640, 1, D.n4);
      R(g, 0, BT + 24, 640, 90, D.n1);
      for (const x of [16, 176, 336, 496]) { R(g, x, BT + 32, 140, 80, mix(D.n1, D.n2, 0.6)); R(g, x, BT + 32, 140, 1, D.n3); R(g, x + 60, BT + 48, 20, 3, D.n4); R(g, x + 60, BT + 48, 20, 1, D.n5); }
      // bench props behind the belt: a microscope, a tube rack, a beaker
      PX.par(g, c, 0.9, () => {
        const mx = 128, my = 240, M0 = D.n3, M1 = D.n4, Mh = mix(D.steel[0], D.n5, 0.4);
        R(g, mx - 18, my - 6, 38, 6, M0); R(g, mx - 18, my - 6, 38, 1, Mh);
        thick(g, mx + 12, my - 6, mx + 14, my - 30, 6, M0); thick(g, mx + 14, my - 30, mx + 6, my - 52, 6, M0); PX.line(g, mx + 15, my - 30, mx + 9, my - 50, Mh);
        R(g, mx - 14, my - 28, 26, 3, M1); R(g, mx - 14, my - 28, 26, 1, Mh);
        thick(g, mx - 6, my - 66, mx + 4, my - 44, 8, M1); thick(g, mx - 6, my - 66, mx + 4, my - 44, 2, Mh); R(g, mx - 11, my - 72, 10, 5, M0); R(g, mx - 11, my - 72, 10, 1, Mh);
        R(g, mx + 2, my - 44, 4, 10, M0); g.fillStyle = M1; disc(g, mx + 16, my - 36, 4); dot(g, mx + 15, my - 38, Mh);
        const rx = 478, ry = 240; R(g, rx - 28, ry - 16, 58, 3, mix(D.n4, WB, 0.3)); R(g, rx - 28, ry - 16, 58, 1, D.n6); R(g, rx - 28, ry - 3, 58, 3, mix(D.n4, WB, 0.3)); R(g, rx - 28, ry - 16, 2, 16, D.n4); R(g, rx + 28, ry - 16, 2, 16, D.n4);
        [D.teal[1], D.moss[1], D.amber[1], D.rose[1], D.teal[1]].forEach((lc, i) => { const tx = rx - 22 + i * 11; R(g, tx, ry - 34, 6, 32, mix(GLASS, D.n2, 0.6)); R(g, tx + 1, ry - 18, 4, 15, mix(lc, D.n2, 0.45)); R(g, tx, ry - 35, 6, 1, GLASS); R(g, tx, ry - 33, 1, 28, mix(GLASS, D.n4, 0.2)); });
        const bx = 540, by = 240; R(g, bx - 10, by - 26, 22, 26, mix(GLASS, D.n2, 0.62)); R(g, bx - 9, by - 12, 20, 11, mix(D.teal[2], D.n2, 0.35)); R(g, bx - 10, by - 26, 1, 25, mix(GLASS, D.n4, 0.3)); R(g, bx - 12, by - 27, 26, 1, GLASS);
        for (let i = 0; i < 3; i++) R(g, bx + 8, by - 22 + i * 5, 3, 1, D.n5);
      });
      // cable from the socket to the outlet
      PX.line(g, 384, 248, 470, 249, D.n1); PX.line(g, 470, 249, 597, 226, D.n1); PX.line(g, 384, 247, 470, 248, D.n3);
      // conveyor
      const moves = (tt) => { let m = 0; for (let i = 1; i < 6; i++) m += P(tt, i * step - sw, sw, "io"); return m; };
      const belt = moves(t) * 300;
      R(g, 0, 238, 640, 12, D.n1); R(g, 0, 238, 640, 1, D.n3);
      for (let x = -((belt % 8) + 8); x < 650; x += 8) R(g, Math.round(x), 239, 2, 10, mix(D.n1, D.n3, 0.5));
      R(g, 0, 249, 640, 4, D.n5); R(g, 0, 249, 640, 1, D.n6);
      for (let x = 30; x < 640; x += 90) { g.fillStyle = D.n6; disc(g, x + 3, 251, 1); }
      // socket station
      R(g, 270, 244, 100, 8, D.n4); R(g, 270, 244, 100, 1, D.n6); R(g, 270, 251, 100, 1, D.n2);
      for (const px of [262, 370]) { R(g, px, 222, 8, 30, D.n4); R(g, px, 222, 8, 1, D.n6); R(g, px + 7, 222, 1, 30, D.n3); R(g, px + 2, 226, 4, 4, D.n2); }
      // items
      let seated = 0;
      for (let i = 0; i < 6; i++) {
        const arrive = i === 0 ? 1 : P(t, i * step - sw, sw, "io"), leave = i === 5 ? 0 : P(t, (i + 1) * step - sw, sw, "io");
        if (arrive <= 0 || leave >= 1) continue;
        const x = 320 + (1 - arrive) * 300 - leave * 300;
        if (arrive >= 1 && leave <= 0) seated = 1;
        ITEMS[i](g, Math.round(x), 244, t);
      }
      for (let i = 0; i < 8; i++) { const on = seated && PX.blink(t + i * 0.11, 1.1, 0.85); R(g, 280 + i * 11, 245, 5, 2, on ? BRASS[0] : BRASS[3]); }
      // the idea lamp: constant, calm cream
      pool(g, BX, BY + 80, 80, 440, 0.6);
      PX.glow(g, BX, BY, 240, D.lamp, 0.1); PX.glow(g, BX, BY, 60, D.lamp, 0.22);
      R(g, BX - 6, BY - 20, 13, 7, D.n4); R(g, BX - 6, BY - 20, 13, 1, D.n6); for (let i = 0; i < 3; i++) R(g, BX - 5, BY - 13 + i * 2, 11, 1, i % 2 ? D.n4 : D.n6);
      g.fillStyle = mix(D.lampD, D.lamp, 0.5); disc(g, BX, BY + 2, 13); g.fillStyle = D.lamp; disc(g, BX, BY + 1, 12); g.fillStyle = mix(D.lamp, D.cream, 0.6); disc(g, BX - 2, BY - 1, 8);
      dot(g, BX - 6, BY - 5, D.cream); dot(g, BX - 5, BY - 6, D.cream);
      PX.glow(g, BX, 244, 170, D.lamp, 0.09);
      PX.particles(g, 19, 24, t, [180, 40, 280, 190], { vy: -2, vx: 1, col: D.lamp, a: 0.3 });
      PX.vignette(g, 0.55);
    };
  };
})();
