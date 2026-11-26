/* EP4 Builder F: DishBrain (2022) and power. Documentary palette PX.D only.
   Kinds: mea_chip, two_sources, dish_pong, feedback, rally, kid_wins, power.
   Shared kit: lab wall + bench, petri dish, electrode chip, neuron network (growth, sparks, rewiring), CRT TV, pong. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, E = PX.ease;
  const TAU = Math.PI * 2;

  // ---------- colour + shape helpers ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A = hx(a), B = hx(b); k = clamp(k, 0, 1); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const ell = (g, cx, cy, rx, ry, col) => { g.fillStyle = col; for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
  // 1px ellipse outline; colf(angle) -> colour or null (angle 0 = right, PI/2 = down)
  const ring = (g, cx, cy, rx, ry, colf) => {
    const n = Math.ceil((rx + ry) * 4);
    for (let i = 0; i < n; i++) { const a = (i / n) * TAU, col = colf(a); if (!col) continue; g.fillStyle = col; g.fillRect(Math.round(cx + Math.cos(a) * rx), Math.round(cy + Math.sin(a) * ry), 1, 1); }
  };
  const poly = (g, pts, col) => {
    let y0 = Infinity, y1 = -Infinity;
    for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    g.fillStyle = col;
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = [], yc = y + 0.5;
      for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax)); }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
    }
  };
  const A = (g, a, fn) => { const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  // option time resolver: o[k] if given, else default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (o[k] !== undefined && o[k] !== null ? o[k] : (def * d) / typ);
  // label: cream outlined Press Start 8, centred, fades in over 0.4 s
  const label = (g, s, x, y, t, t0, o) => {
    o = o || {}; if (t < t0) return;
    A(g, PX.p(t, t0, 0.4, "out"), () => PX.otext(g, s, x, y + Math.round(3 * (1 - PX.p(t, t0, 0.4, "out"))), { align: "center", col: o.col || D.cream, outline: D.n0, size: o.size || 8, font: o.font }));
  };
  // dense 1px path along a quadratic curve (a -> b, bending by `bend` px)
  const curve = (ax, ay, bx, by, bend) => {
    const mx = (ax + bx) / 2 - (by - ay) * bend, my = (ay + by) / 2 + (bx - ax) * bend, out = [];
    const len = Math.hypot(bx - ax, by - ay) * 1.2 + 2, n = Math.ceil(len);
    let lx = null, ly = null;
    for (let i = 0; i <= n; i++) { const u = i / n, x = Math.round((1 - u) * (1 - u) * ax + 2 * (1 - u) * u * mx + u * u * bx), y = Math.round((1 - u) * (1 - u) * ay + 2 * (1 - u) * u * my + u * u * by); if (x !== lx || y !== ly) { out.push([x, y]); lx = x; ly = y; } }
    return out;
  };
  const drawPath = (g, pts, m, col) => { g.fillStyle = col; const n = Math.min(pts.length, Math.floor(m)); for (let k = 0; k < n; k++) g.fillRect(pts[k][0], pts[k][1], 1, 1); };

  // ---------- neuron network ----------
  // cells in an ellipse; dendrites (random-walk pixel paths with branches); links between cells.
  // o.n cells, o.sp min spacing, o.dl dendrite length, o.tangled: also build long random links (for rewiring)
  const makeNet = (seed, cx, cy, rx, ry, o) => {
    o = o || {}; const r = PX.rnd(seed), cells = [], n = o.n || 40, sp = o.sp || 14;
    for (let tries = 0; cells.length < n && tries < n * 60; tries++) {
      const a = r() * TAU, k = Math.sqrt(r()) * 0.94, x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
      if (cells.some((q) => Math.hypot(q.x - x, (q.y - y) * 1.3) < sp)) continue;
      cells.push({ x: Math.round(x), y: Math.round(y), rad: r() < 0.3 ? 3 : 2, birth: r(), ph: r() * TAU, rate: 0.35 + r() * 0.5, lean: r() * TAU });
    }
    const dend = [];
    cells.forEach((q, ci) => {
      const nb = 3 + Math.floor(r() * 3);
      for (let b = 0; b < nb; b++) {
        let a = q.lean + (b / nb) * TAU + (r() - 0.5) * 0.8, x = q.x + Math.cos(a) * q.rad, y = q.y + Math.sin(a) * q.rad;
        const pts = [], L = Math.round((o.dl || 12) * (0.5 + r()));
        for (let s = 0; s < L; s++) {
          a += (r() - 0.5) * 0.7; x += Math.cos(a); y += Math.sin(a) * 0.8;
          pts.push([Math.round(x), Math.round(y)]);
          if (s > 3 && r() < 0.12) { // side twig
            let a2 = a + (r() < 0.5 ? 0.9 : -0.9), x2 = x, y2 = y; const tw = [];
            for (let u = 0; u < 3 + r() * 5; u++) { a2 += (r() - 0.5) * 0.6; x2 += Math.cos(a2); y2 += Math.sin(a2) * 0.8; tw.push([Math.round(x2), Math.round(y2)]); }
            dend.push({ ci, pts: tw, off: s / L });
          }
        }
        dend.push({ ci, pts, off: 0 });
      }
    });
    // links: nearest neighbours (tidy) and random long ones (tangled)
    const links = [], tang = [];
    cells.forEach((q, i) => {
      const near = cells.map((p, j) => [Math.hypot(p.x - q.x, p.y - q.y), j]).filter(([dd, j]) => j !== i).sort((a, b) => a[0] - b[0]);
      for (let k = 0; k < Math.min(2, near.length); k++) { const j = near[k][1]; if (j < i && links.some((l) => l.a === j && l.b === i)) continue; links.push({ a: i, b: j, pts: curve(q.x, q.y, cells[j].x, cells[j].y, (r() - 0.5) * 0.35), ph: r(), per: 1.6 + r() * 2.4 }); }
      if (o.tangled) { const j = near[2 + Math.floor(r() * Math.min(6, near.length - 2))]; if (j) tang.push({ a: i, b: j[1], pts: curve(q.x, q.y, cells[j[1]].x, cells[j[1]].y, (r() - 0.5) * 0.9), ph: r(), per: 1.3 + r() * 2.8 }); }
    });
    return { cells, dend, links, tang };
  };
  // draw the network. s: { grow 0..1, spark 0..1 (density), order 0..1 (tangled -> tidy, sync firing), dim, fire(i,t) }
  const drawNet = (g, net, t, s) => {
    s = s || {}; const grow = s.grow === undefined ? 1 : s.grow, ord = s.order || 0, act = s.spark === undefined ? 1 : s.spark;
    const born = (q) => clamp((grow * 1.25 - q.birth * 0.85) / 0.4, 0, 1);
    const cDen = D.rose[2], cLink = mix(D.rose[2], D.rose[1], 0.35);
    // links (tidy ones grow in with order when tangled set exists)
    const linkSet = (L, w) => { if (w <= 0.01) return; for (const l of L) { const ga = Math.min(born(net.cells[l.a]), born(net.cells[l.b])); if (ga <= 0) continue; A(g, 0.85, () => drawPath(g, l.pts, l.pts.length * Math.min(ga, w), cLink)); } };
    if (net.tang.length) { linkSet(net.tang, 1 - ord); linkSet(net.links, ord); } else linkSet(net.links, 1);
    // dendrites
    for (const dd of net.dend) { const q = net.cells[dd.ci], b = born(q); if (b <= 0) continue; const m = dd.pts.length * clamp((b - dd.off) / (1 - dd.off + 1e-6), 0, 1); A(g, 0.75, () => drawPath(g, dd.pts, m, cDen)); }
    // firing: per cell flash amount
    const fire = (i) => {
      const q = net.cells[i];
      if (ord > 0.01) { // synchronised wave from the left, regular period
        const w = frac(t / 1.4 - (q.x - 200) / 260); const reg = w < 0.12 ? 1 - w / 0.12 : 0;
        const rnd = frac(t * q.rate + q.ph) < 0.08 && hash(i, Math.floor(t * q.rate + q.ph)) < act * 0.6 ? 1 : 0;
        return lerp(rnd, reg, ord) * (act > 0 ? 1 : 0);
      }
      const ph = t * q.rate + q.ph, k = Math.floor(ph), u = ph - k;
      return u < 0.12 && hash(i, k) < act * 0.55 ? 1 - u / 0.12 : 0;
    };
    // cell bodies: translucent, slightly irregular, lit from the upper left
    net.cells.forEach((q, i) => {
      const b = born(q); if (b <= 0) return;
      const rad = q.rad, f = fire(i) * b;
      A(g, 0.55 + 0.45 * b, () => {
        PX.circle(g, q.x, q.y, rad, D.rose[2]);
        PX.circle(g, q.x - (rad > 2 ? 1 : 0), q.y - (rad > 2 ? 1 : 0), rad - 1, mix(D.rose[1], D.rose[0], f));
        R(g, q.x - 1, q.y - rad + 1, 1, 1, mix(D.rose[0], D.cream, f));
        if (rad > 2) R(g, q.x + 1, q.y + 1, 1, 1, D.rose[2]);
      });
      if (f > 0.05) PX.glow(g, q.x, q.y, 7, D.rose[0], 0.35 * f);
      if (s.onFire && f > 0.3) s.onFire(q, f);
    });
    // sparks travelling along links
    if (act > 0) {
      const L = net.tang.length ? (ord < 0.5 ? net.tang : net.links) : net.links, fade = net.tang.length ? Math.abs(ord - 0.5) * 2 : 1;
      L.forEach((l, li) => {
        const ga = Math.min(born(net.cells[l.a]), born(net.cells[l.b])); if (ga < 1) return;
        let per = l.per, ph = l.ph;
        if (ord > 0.5) { per = 1.4; ph = -(net.cells[l.a].x - 200) / 260; }
        const v = t / per + ph, k = Math.floor(v), u = v - k;
        if (ord <= 0.5 && hash(li + 7, k) > act * 0.7) return;
        if (u > 0.55) return;
        const pi = Math.floor((u / 0.55) * (l.pts.length - 1)), p = l.pts[pi]; if (!p) return;
        A(g, fade, () => {
          for (let tr = 1; tr <= 3; tr++) { const pp = l.pts[pi - tr]; if (pp) A(g, 0.6 - tr * 0.15, () => R(g, pp[0], pp[1], 1, 1, D.rose[0])); }
          R(g, p[0], p[1], 1, 1, D.cream);
        });
      });
    }
  };

  // ---------- lab environment ----------
  // night lab wall: window with a dim city, shelves with reagent bottles, bench. o.y = bench top, o.soft = blur-ish (lower contrast)
  const lab = (g, c, t, o) => {
    o = o || {}; const by = o.y || 250, soft = o.soft || 0;
    const fog = (col) => mix(col, D.n2, soft);
    PX.vgrad(g, -40, -40, 720, by + 40, D.n2, D.n1, 9);
    // far: window (night, distant buildings)
    PX.par(g, c, 0.4, () => {
      const wx = o.winX === undefined ? 40 : o.winX, wy = 34, ww = 150, wh = 112;
      R(g, wx - 5, wy - 5, ww + 10, wh + 10, fog(D.n3));
      PX.vgrad(g, wx, wy, ww, wh, fog(mix(D.steel[2], D.n1, 0.55)), fog(mix(D.steel[2], D.n2, 0.25)), 6);
      const rr = PX.rnd(41);
      let bx = wx;
      while (bx < wx + ww) { const bw = 10 + Math.floor(rr() * 18), bh = 20 + rr() * 50; R(g, bx, wy + wh - bh, Math.min(bw, wx + ww - bx), bh, fog(mix(D.n1, D.steel[2], 0.2)));
        for (let yy = wy + wh - bh + 4; yy < wy + wh - 3; yy += 6) for (let xx = bx + 2; xx < Math.min(bx + bw - 2, wx + ww - 2); xx += 4) if (rr() < 0.22) A(g, 0.35 + 0.25 * Math.sin(t * 0.4 + xx + yy), () => R(g, xx, yy, 2, 2, fog(D.lampD)));
        bx += bw + 1; }
      R(g, wx + ww / 2 - 2, wy, 4, wh, fog(D.n3)); R(g, wx, wy + wh / 2 - 2, ww, 3, fog(D.n3));
      R(g, wx - 8, wy + wh + 5, ww + 16, 4, fog(D.n4)); R(g, wx - 8, wy + wh + 5, ww + 16, 1, fog(D.n5));
    });
    // mid: shelves with bottles + binders
    PX.par(g, c, 0.65, () => {
      const sx = o.shelfX === undefined ? 400 : o.shelfX, rr = PX.rnd(77);
      for (const sy of [70, 128]) {
        R(g, sx, sy, 220, 4, fog(D.n4)); R(g, sx, sy, 220, 1, fog(D.n5)); R(g, sx, sy + 4, 220, 2, fog(D.n1));
        let bx = sx + 6;
        while (bx < sx + 210) {
          const kind = rr(), bw = 7 + Math.floor(rr() * 6), bh = 14 + Math.floor(rr() * 18);
          if (kind < 0.35) { // brown reagent bottle
            const col = fog(mix(D.amber[2], D.n1, 0.5)); R(g, bx, sy - bh, bw, bh, col); R(g, bx + 2, sy - bh - 4, bw - 4, 4, fog(D.n4)); R(g, bx + 1, sy - bh + 2, 1, bh - 4, fog(mix(D.amber[2], D.lamp, 0.15))); R(g, bx + 1, sy - bh + 6, bw - 2, 5, fog(D.paperD));
          } else if (kind < 0.6) { // clear glass flask
            const col = fog(mix(D.glass, D.n2, 0.7)); R(g, bx + 2, sy - bh, bw - 4, bh * 0.4, col); R(g, bx, sy - bh * 0.6, bw, bh * 0.6, col); R(g, bx + 1, sy - bh * 0.6 + 1, 1, bh * 0.5, fog(mix(D.glass, D.n2, 0.35)));
            R(g, bx + 1, sy - bh * 0.3, bw - 2, bh * 0.3 - 1, fog(mix(D.teal[2], D.n2, 0.4)));
          } else { // binders
            const cols = [D.n4, mix(D.steel[2], D.n2, 0.3), mix(D.rust[2], D.n2, 0.45), mix(D.moss[2], D.n2, 0.4)];
            const col = fog(cols[Math.floor(rr() * cols.length)]); R(g, bx, sy - bh - 4, bw, bh + 4, col); R(g, bx, sy - bh - 4, 1, bh + 4, fog(mix(col.length === 7 ? col : D.n4, D.n6, 0.2))); R(g, bx + 2, sy - bh + 2, bw - 4, 3, fog(D.paperD));
          }
          bx += bw + 2 + Math.floor(rr() * 3);
        }
      }
    });
    // bench
    PX.par(g, c, 0.9, () => {
      R(g, -40, by, 720, 8, D.n4); R(g, -40, by, 720, 1, D.n6); R(g, -40, by + 8, 720, 2, D.n1);
      PX.vgrad(g, -40, by + 10, 720, 370 - by, D.n2, D.n0, 5);
      for (let x = -20; x < 680; x += 120) { R(g, x, by + 18, 110, 1, D.n3); R(g, x + 50, by + 40, 12, 2, D.n4); }
    });
  };

  // ---------- petri dish (seen from above at an angle) ----------
  // inner(g) draws the bottom contents (clipped to the medium). o.wall px, o.lit = light direction angle
  const dish = (g, cx, cy, rx, ry, o, inner) => {
    o = o || {}; const h = o.wall === undefined ? Math.round(ry * 0.14) + 2 : o.wall, la = o.lit === undefined ? -2.3 : o.lit;
    A(g, 0.45, () => ell(g, cx + 6, cy + h + 4, rx + 4, ry + 2, "#000000"));       // contact shadow
    // glass wall (front band) + base
    ell(g, cx, cy + h, rx, ry, mix(D.glass, D.n2, 0.72));
    R(g, cx - rx, cy, 2 * rx + 1, h, mix(D.glass, D.n2, 0.72));
    ell(g, cx, cy + h - 1, rx - 1, ry - 1, mix(D.glass, D.n2, 0.82));
    // medium
    ell(g, cx, cy, rx - 2, ry - 2, o.medium || mix(D.teal[2], D.n1, 0.62));
    if (inner) { g.save(); g.beginPath(); g.ellipse(cx, cy, rx - 3, ry - 3, 0, 0, TAU); g.clip(); inner(g); g.restore(); }
    // meniscus + rim highlights facing the light
    ring(g, cx, cy, rx - 3, ry - 3, (a) => (Math.cos(a - la) > 0.3 ? mix(D.glass, D.n2, 0.45) : null));
    ring(g, cx, cy, rx, ry, (a) => { const k = Math.cos(a - la); return k > 0.75 ? D.cream : k > 0.1 ? mix(D.glass, D.n3, 0.25) : mix(D.glass, D.n2, 0.55); });
    ring(g, cx, cy, rx - 1, ry - 1, (a) => (Math.cos(a - la) > 0.92 ? mix(D.glass, D.cream, 0.5) : null));
    // front wall: lit band on the lamp side, dark on the far side
    for (let x = -rx + 2; x <= rx - 2; x++) {
      const k = x / rx, yb = cy + Math.round(Math.sqrt(Math.max(0, 1 - k * k)) * ry), lit = clamp(-Math.cos(Math.acos(k) - 0.6) * 0.9 + 0.2, 0, 1);
      if (lit > 0.05) A(g, lit * 0.5, () => R(g, cx + x, yb + 1, 1, h - 2, mix(D.glass, D.n3, 0.35)));
    }
    ring(g, cx, cy + h, rx, ry, (a) => (Math.sin(a) > 0.1 ? mix(D.glass, D.n2, 0.4) : null));
  };

  // ---------- electrode chip (micro-electrode array) ----------
  // grid nx x ny; lit(i, j) -> 0..1 glow for an electrode
  const chip = (g, x, y, w, h, nx, ny, lit) => {
    const gold = mix(D.amber[2], D.n2, 0.25), goldD = mix(D.amber[2], D.n1, 0.55), goldL = mix(D.amber[1], D.amber[2], 0.35);
    // glass carrier with bevel (lit top-left edge)
    R(g, x - 4, y - 4, w + 8, h + 8, mix(D.n3, D.steel[2], 0.3)); R(g, x - 4, y - 4, w + 8, 1, mix(D.n6, D.glass, 0.3)); R(g, x - 4, y - 4, 1, h + 8, mix(D.n5, D.glass, 0.2));
    R(g, x - 4, y + h + 3, w + 8, 1, D.n1); R(g, x + w + 3, y - 4, 1, h + 8, D.n1);
    R(g, x, y, w, h, mix(D.n2, D.steel[2], 0.35));
    // contact pads along top and bottom, fanned gold traces into the central grid
    const gx0 = x + w * 0.22, gx1 = x + w * 0.78, gy0 = y + h * 0.24, gy1 = y + h * 0.76;
    const np = nx + 4;
    for (let i = 0; i < np; i++) {
      const px = Math.round(lerp(x + 5, x + w - 8, i / (np - 1))), ex = Math.round(lerp(gx0, gx1, clamp((i - 2) / (nx - 1), 0, 1)));
      for (const [py, ey] of [[y + 2, gy0 - 3], [y + h - 6, gy1 + 3]]) {
        R(g, px, py, 4, 4, gold); R(g, px, py, 4, 1, goldL);
        PX.line(g, px + 2, py < y + h / 2 ? py + 4 : py - 1, ex, ey, goldD);
      }
    }
    // sensor area (dark) + electrode grid
    R(g, gx0 - 6, gy0 - 5, gx1 - gx0 + 13, gy1 - gy0 + 11, mix(D.n1, D.steel[2], 0.2));
    R(g, gx0 - 6, gy0 - 5, gx1 - gx0 + 13, 1, mix(D.n3, D.steel[2], 0.3));
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
      const ex = Math.round(lerp(gx0, gx1, i / (nx - 1))), ey = Math.round(lerp(gy0, gy1, j / Math.max(1, ny - 1)));
      const k = lit ? lit(i, j) : 0;
      R(g, ex - 1, ey - 1, 3, 3, mix(gold, D.amber[0], k)); R(g, ex - 1, ey - 1, 1, 1, mix(goldL, D.amber[0], k)); R(g, ex + 1, ey + 1, 1, 1, goldD);
      if (k > 0.05) PX.glow(g, ex, ey, 6, D.amber[0], 0.28 * k);
    }
    return { gx0, gx1, gy0, gy1 };
  };

  // ---------- pong (closed form in t) ----------
  // legs of length P: even legs travel right -> left, odd legs left -> right; the receiving paddle hits or misses.
  // side = { lag, track(t) 0..1, wob }. state(t) -> { bx, by, show, pl, pr, sL, sR, lastHitL, lastMissL, lastMissR }
  const PH = 0.13;   // paddle half height (game units)
  const makeGame = (o) => {
    const P = o.P || 1.1, P2 = o.P2 || 1.73, t0 = o.t0 || 0, yph = o.yph || 0.3;
    const tri = (x) => { x = frac(x); return x < 0.5 ? x * 2 : 2 - x * 2; };
    const by = (t) => 0.08 + 0.84 * tri((t - t0) / P2 + yph);
    const pad = (S, t, k) => { const idle = S.still ? 0.5 : 0.5 + 0.12 * Math.sin(t * 0.9 + k), tr = S.track(t); return clamp(lerp(idle, by(t - S.lag), tr) + (S.still ? 0 : S.wob || 0) * Math.sin(t * 2.3 + k * 3) * (1 - tr), PH, 1 - PH); };
    return (t) => {
      const jt = Math.floor((t - t0) / P), u = (t - t0) / P - jt;
      let sL = 0, sR = 0, out = false, lastHitL = -99, lastMissL = -99, lastMissR = -99;
      for (let j = 0; j < jt; j++) {
        if (out) { out = false; continue; }
        const te = t0 + (j + 1) * P, left = j % 2 === 0, S = left ? o.L : o.R, py = pad(S, te, left ? 1 : 2);
        const hit = Math.abs(py - by(te)) < PH + 0.03;
        if (left) { if (hit) lastHitL = te; else lastMissL = te; } else if (!hit) lastMissR = te;
        if (!hit) { out = true; if (left) sR++; else sL++; }
      }
      let bx, show = true;
      const left = jt % 2 === 0;
      if (out) { bx = left ? 1 + u : -u; if (u > 0.18) show = false; }   // ball flies out past the paddle that missed
      else bx = left ? 1 - u : u;
      if (t < t0) { bx = 0.5; show = false; }
      return { bx, by: by(t), show, pl: pad(o.L, t, 1), pr: pad(o.R, t, 2), sL, sR, lastHitL, lastMissL, lastMissR };
    };
  };
  // pong picture inside (x, y, w, h): white blocks on dark, score as tally blocks (no digits)
  const pongScreen = (g, x, y, w, h, st, o) => {
    o = o || {}; const ink = mix(D.cream, D.n6, 0.12), dim = mix(D.n1, D.cream, 0.18);
    for (let yy = y + 2; yy < y + h - 2; yy += 6) R(g, x + Math.floor(w / 2), yy, 1, 3, dim);
    const ph = Math.max(4, Math.round(h * PH * 2)), mx = Math.max(3, Math.round(w * 0.06)), pw = Math.max(1, Math.round(w / 70));
    const sy = (v) => y + 2 + Math.round(v * (h - 4));
    R(g, x + mx, sy(st.pl) - ph / 2, pw + 1, ph, ink); R(g, x + w - mx - pw - 1, sy(st.pr) - ph / 2, pw + 1, ph, ink);
    if (st.show) {
      const bx = x + mx + pw + 1 + Math.round(st.bx * (w - 2 * mx - 2 * pw - 4)), byy = sy(st.by), bs = Math.max(2, Math.round(w / 60));
      if (bx > x - 4 && bx < x + w) R(g, bx, byy - 1, bs, bs, ink);
    }
    const tally = (n, cx, dir, pop) => { for (let i = 0; i < n; i++) { const r0 = Math.floor(i / 5), c0 = i % 5, bx = cx + dir * c0 * 4 - (dir < 0 ? 3 : 0), byy = y + 4 + r0 * 4;
      if (i === n - 1 && pop > 0) { R(g, bx - 1, byy - 1, 5, 5, mix(ink, D.amber[0], pop)); PX.glow(g, bx + 1, byy + 1, 7, D.cream, 0.35 * pop); } else R(g, bx, byy, 3, 3, ink); } };
    tally(Math.min(st.sL, o.max || 40), x + Math.floor(w / 2) - 6, -1, o.popL || 0); tally(Math.min(st.sR, o.max || 40), x + Math.floor(w / 2) + 6, 1);
  };
  // old CRT TV in a wood cabinet; screen(g, sx, sy, sw, sh) draws the picture
  const woodCols = () => { const w = mix(mix(D.rust[2], D.amber[2], 0.4), D.n2, 0.58); return [w, mix(w, D.n1, 0.45), mix(w, D.lamp, 0.25)]; };
  const tv = (g, x, y, w, h, t, screen) => {
    const [wd, wdD, wdL] = woodCols();
    A(g, 0.4, () => R(g, x + 6, y + h, w, 6, "#000000"));
    R(g, x + 12, y + h, 4, 10, D.n2); R(g, x + w - 16, y + h, 4, 10, D.n2);
    PX.line(g, x + w * 0.45, y, x + w * 0.3, y - 34, D.n5); PX.line(g, x + w * 0.47, y, x + w * 0.62, y - 38, D.n5);
    R(g, x + w * 0.3 - 1, y - 36, 3, 3, D.n6); R(g, x + w * 0.62 - 1, y - 40, 3, 3, D.n6); R(g, x + w * 0.4, y - 4, 16, 5, D.n3);
    R(g, x, y, w, h, wd); R(g, x + 1, y, w - 2, 1, wdL); R(g, x, y + 1, 1, h - 2, wdL); R(g, x + w - 2, y + 1, 2, h - 1, wdD); R(g, x, y + h - 2, w, 2, wdD);
    const rr = PX.rnd(5); for (let i = 0; i < 18; i++) { const yy = y + 3 + Math.floor(rr() * (h - 6)); R(g, x + 2 + rr() * 20, yy, 10 + rr() * (w * 0.5), 1, wdD); }
    const sw = Math.round(w * 0.7), sh = h - 16, sx = x + 8, sy = y + 8;
    R(g, sx - 3, sy - 3, sw + 6, sh + 6, D.n2); R(g, sx - 3, sy - 3, sw + 6, 1, D.n4);
    R(g, sx, sy, sw, sh, mix(D.n0, D.teal[2], 0.18));
    g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip(); screen(g, sx, sy, sw, sh);
    for (let yy = sy; yy < sy + sh; yy += 2) A(g, 0.12, () => R(g, sx, yy, sw, 1, "#000000"));
    A(g, 0.07, () => { for (let k = 0; k < 10; k++) R(g, sx + 4, sy + 3 + k, 26 - k * 2, 1, D.cream); });
    g.restore();
    for (const [cx, cy] of [[sx, sy], [sx + sw - 2, sy], [sx, sy + sh - 2], [sx + sw - 2, sy + sh - 2]]) R(g, cx, cy, 2, 2, D.n2);
    const px = sx + sw + 8, pw = x + w - px - 6;
    R(g, px, sy, pw, sh, wdD);
    for (const ky of [sy + 8, sy + 30]) { PX.circle(g, px + pw / 2, ky + 6, 6, D.n2); PX.circle(g, px + pw / 2, ky + 6, 4, D.n4); R(g, px + pw / 2 - 1, ky + 1, 2, 4, D.n6); }
    for (let yy = sy + 52; yy < sy + sh - 4; yy += 4) R(g, px + 3, yy, pw - 6, 2, mix(wdD, D.n0, 0.5));
    return { sx, sy, sw, sh };
  };
  // drooping cable with a 1px highlight; returns its pixel path
  const cable = (g, ax, ay, bx, by, sag, col) => {
    const pts = [], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 1.3);
    for (let i = 0; i <= n; i++) { const u = i / n; pts.push([Math.round(lerp(ax, bx, u)), Math.round(lerp(ay, by, u) + Math.sin(u * Math.PI) * sag)]); }
    for (const [x, y] of pts) R(g, x, y, 1, 2, col || D.n0);
    for (const [x, y] of pts) R(g, x, y, 1, 1, D.n4);
    return pts;
  };
  // signal pulses travelling along a path (dir 1 = a -> b)
  const pulses = (g, pts, t, rate, dir, col, n) => {
    n = n || 3;
    for (let i = 0; i < n; i++) { let u = frac(t * rate + i / n); if (dir < 0) u = 1 - u; const p = pts[Math.floor(u * (pts.length - 1))]; if (p) { R(g, p[0] - 1, p[1] - 1, 3, 2, col); PX.glow(g, p[0], p[1], 5, col, 0.22); } }
  };
  // amplifier stage under a dish: steel box with vents and a status LED
  const stage = (g, x, y, w, h, t) => {
    R(g, x, y, w, h, mix(D.steel[2], D.n2, 0.5)); R(g, x, y, w, 1, mix(D.steel[1], D.n4, 0.3)); R(g, x, y + 1, 1, h - 1, mix(D.steel[2], D.n4, 0.4));
    R(g, x + w - 1, y, 1, h, D.n1); R(g, x, y + h - 1, w, 1, D.n1);
    for (let i = 0; i < 6; i++) R(g, x + 10 + i * 6, y + h - 9, 4, 3, D.n1);
    const on = PX.blink(t, 1.6, 0.55); R(g, x + w - 14, y + h - 9, 3, 3, on ? D.moss[0] : D.moss[2]); if (on) PX.glow(g, x + w - 13, y + h - 8, 6, D.moss[0], 0.22);
  };
  // hanging lab lamp (shade at the top of frame, centred on x)
  const hangLamp = (g, c, x) => PX.par(g, c, 0.8, () => {
    R(g, x - 1, -40, 2, 44, D.n3);
    poly(g, [[x - 27, 22], [x + 27, 22], [x + 17, 4], [x - 17, 4]], D.n3); R(g, x - 17, 4, 34, 1, D.n4); R(g, x - 26, 21, 52, 2, D.lampD); R(g, x - 21, 23, 42, 1, D.lamp);
  });
  // glass beaker on the bench (base at y), liquid colour liq
  const beaker = (g, x, y, w, h, liq, t) => {
    const gl = mix(D.glass, D.n2, 0.6), lv = Math.round(h * 0.45);
    A(g, 0.5, () => R(g, x, y - h, w, h, gl));
    R(g, x + 1, y - lv, w - 2, lv - 1, liq); R(g, x + 1, y - lv, w - 2, 1, mix(liq, D.cream, 0.35));
    R(g, x, y - h, 1, h, mix(D.glass, D.n3, 0.2)); R(g, x + w - 1, y - h, 1, h, mix(D.glass, D.n2, 0.5)); R(g, x - 1, y - h, w + 2, 1, mix(D.glass, D.n3, 0.1)); R(g, x, y - 1, w, 1, mix(D.glass, D.n2, 0.4));
    R(g, x + 2, y - h + 3, 1, h - 6, mix(D.glass, D.cream, 0.4));
    for (let k = 1; k < 4; k++) R(g, x + w - 4, y - h + k * Math.round(h / 4), 3, 1, mix(D.glass, D.n3, 0.3));
    if (t !== undefined) { const b = frac(t * 0.4); A(g, 0.6 * (1 - b), () => R(g, x + 3 + Math.round(w * 0.4), y - 3 - Math.round(b * (lv - 4)), 1, 1, D.cream)); }
  };
  // ======================= mea_chip =======================
  // macro: a petri dish on the bench with an electrode chip at the bottom; neurons grow over it, spikes flicker.
  // o.grow [0.5, 5.0], o.label 5.5 ("800,000 BRAIN CELLS")
  K.mea_chip = (o) => {
    const CX = 320, CY = 178, RX = 196, RY = 100;
    const CHX = 214, CHY = 128, CHW = 212, CHH = 104, NX = 14, NY = 7;
    const net = makeNet(404, CX, CY + 2, 150, 76, { n: 74, sp: 12, dl: 11 });
    const r = PX.rnd(9), specks = [];
    for (let i = 0; i < 520; i++) { const a = r() * TAU, k = Math.sqrt(r()), x = CX + Math.cos(a) * (RX - 8) * k, y = CY + Math.sin(a) * (RY - 6) * k; specks.push([Math.round(x), Math.round(y), r(), r()]); }
    return (g, t, d, c) => {
      const T = tm(o, d, 9.0), g0 = o.grow ? o.grow[0] : T("g0", 0.5), g1 = o.grow ? o.grow[1] : T("g1", 5.0);
      const grow = clamp((t - g0) / (g1 - g0), 0, 1), gE = E(grow, "io");
      R(g, 0, 0, 640, 360, D.n1);
      lab(g, c, t, { y: 236, soft: 0.55, winX: 26, shelfX: 430 });
      // soft bokeh of distant lab lights (small, dim)
      PX.par(g, c, 0.3, () => { [[90, 60, D.lampD], [560, 52, D.steel[0]], [606, 140, D.lampD]].forEach(([x, y, col], i) => PX.glow(g, x, y, 14, col, 0.12 + 0.03 * Math.sin(t * 0.8 + i))); });
      // hanging lamp, top left, out of focus; warm pool on the bench and dish
      hangLamp(g, c, 177);
      PX.glow(g, 178, 40, 120, D.lamp, 0.22); PX.glow(g, 250, 190, 230, D.lampD, 0.16);
      const gx0 = CHX + CHW * 0.22, gx1 = CHX + CHW * 0.78, gy0 = CHY + CHH * 0.24, gy1 = CHY + CHH * 0.76;
      dish(g, CX, CY, RX, RY, { wall: 16 }, (g) => {
        // lamp reflection drifting slowly on the wet surface
        A(g, 0.07, () => ell(g, CX - 70 + Math.round(Math.sin(t * 0.3) * 4), CY - 46, 70, 22, D.cream));
        chip(g, CHX, CHY, CHW, CHH, NX, NY, (i, j) => {
          // electrode lights if a nearby cell is firing right now (pure function of t)
          const ex = lerp(gx0, gx1, i / (NX - 1)), ey = lerp(gy0, gy1, j / (NY - 1));
          let k = 0;
          if (grow > 0.2) net.cells.forEach((q, ci) => { if (Math.abs(q.x - ex) < 7 && Math.abs(q.y - ey) < 7) { const ph = t * q.rate + q.ph, kk = Math.floor(ph), u = ph - kk; if (u < 0.12 && hash(ci, kk) < 0.55) k = Math.max(k, 1 - u / 0.12); } });
          return k * clamp((grow - 0.2) * 3, 0, 1);
        });
        // density: many tiny cells (the 800,000) as dim specks
        for (const [x, y, b, s] of specks) { if (b > gE * 1.1) continue; A(g, 0.35 + 0.3 * s, () => R(g, x, y, 1, 1, s < 0.5 ? D.rose[2] : mix(D.rose[1], D.rose[2], 0.5))); }
        drawNet(g, net, t, { grow: gE, spark: clamp((grow - 0.3) * 2, 0, 1) });
      });
      // lamp reflection across the dish lid
      A(g, 0.18, () => { for (let k = 0; k < 26; k++) R(g, 170 + k * 2, 112 - k, 12, 1, D.cream); });
      PX.particles(g, 31, 24, t, [120, 40, 260, 200], { vy: -2, vx: 1.5, col: D.lamp, a: 0.45 });
      PX.vignette(g, 0.55);
      label(g, "800,000 BRAIN CELLS", 320, 306, t, T("label", 5.5));
    };
  };

  // ======================= dish_pong =======================
  // lab at night: the dish on an amplifier stage, cabled to an old CRT TV playing a two-paddle ball game.
  // o.sense 2.0 electrodes light where the ball is ("BALL POSITION"); o.move 5.5 neurons fire, the left paddle moves
  K.dish_pong = (o) => {
    const DX = 176, DY = 192, DRX = 128, DRY = 58;
    const CHX = 106, CHY = 166, CHW = 140, CHH = 54, NX = 11, NY = 5;
    const net = makeNet(77, DX, DY, 104, 44, { n: 46, sp: 12, dl: 9 });
    return (g, t, d, c) => {
      const T = tm(o, d, 12.0), tS = T("sense", 2.0), tM = T("move", 5.5);
      const game = makeGame({ P: 1.15, P2: 1.9, L: { lag: 0.32, track: (tt) => 0.82 * clamp((tt - tM) / 1.2, 0, 1), still: true }, R: { lag: 0.05, track: () => 1 } });
      const st = game(t);
      const sense = clamp((t - tS) / 0.5, 0, 1), move = clamp((t - tM) / 0.6, 0, 1);
      R(g, 0, 0, 640, 360, D.n1);
      lab(g, c, t, { y: 236, soft: 0.3, winX: 30, shelfX: 470 });
      hangLamp(g, c, 176);
      PX.glow(g, 176, 30, 110, D.lamp, 0.2); PX.glow(g, 176, 190, 190, D.lampD, 0.16);
      PX.glow(g, 470, 150, 120, D.cream, 0.07);                       // TV light on the wall
      tv(g, 372, 92, 226, 140, t, (g, sx, sy, sw, sh) => pongScreen(g, sx, sy, sw, sh, st));
      beaker(g, 318, 236, 16, 22, mix(D.teal[1], D.n2, 0.4), t); beaker(g, 338, 236, 11, 15, mix(D.amber[2], D.n2, 0.3));
      const c1 = cable(g, 284, 240, 420, 236, 34), c2 = cable(g, 284, 244, 440, 236, 40, D.n1);
      if (sense > 0) A(g, sense, () => pulses(g, c1, t, 0.9, -1, D.amber[0], 3));
      if (move > 0) A(g, move, () => pulses(g, c2, t, 1.1, 1, D.rose[0], 3));
      stage(g, 44, 236, 264, 50, t);
      dish(g, DX, DY, DRX, DRY, { wall: 12, lit: -2.6 }, (g) => {
        chip(g, CHX, CHY, CHW, CHH, NX, NY, (i, j) => {
          if (sense <= 0 || !st.show) return 0;
          const ex = i / (NX - 1), ey = j / (NY - 1), dd = Math.hypot((ex - clamp(st.bx, 0, 1)) * 2.2, ey - st.by);
          return sense * clamp(1.15 - dd / 0.34, 0, 1);
        });
        drawNet(g, net, t, { grow: 1, spark: lerp(0.3, 1, move) });
        // motor cluster: after o.move the cells at the left edge flash with the paddle
        if (move > 0) net.cells.forEach((q, i) => { if (q.x < DX - 50) { const f = frac(t * 1.7 + i * 0.37); if (f < 0.15) PX.glow(g, q.x, q.y, 8, D.rose[0], 0.4 * move * (1 - f / 0.15)); } });
      });
      label(g, "BALL POSITION", DX, 110, t, tS);
      label(g, "NEURONS MOVE THE PADDLE", 320, 306, t, tM);
      PX.particles(g, 12, 22, t, [10, 150, 200, 90], { vy: -2, vx: 1, col: D.lamp, a: 0.4 });
      PX.vignette(g, 0.55);
    };
  };

  // ---------- oscilloscope ----------
  // body (x, y, w, h); wave(i, n) -> -1..1 sample for screen column i (null = blank); grows/plays in t
  const scope = (g, x, y, w, h, t, wave, on) => {
    const body = mix(mix(D.n6, D.paperD, 0.35), D.n2, 0.64), bodyD = mix(body, D.n0, 0.4), bodyL = mix(body, D.cream, 0.25);
    A(g, 0.4, () => R(g, x + 5, y + h, w, 5, "#000000"));
    R(g, x + 20, y - 7, w - 40, 3, D.n4); R(g, x + 20, y - 7, 3, 7, D.n4); R(g, x + w - 23, y - 7, 3, 7, D.n4);   // carry handle
    R(g, x, y, w, h, body); R(g, x, y, w, 1, bodyL); R(g, x, y, 1, h, bodyL); R(g, x + w - 2, y, 2, h, bodyD); R(g, x, y + h - 2, w, 2, bodyD);
    const sw = Math.round(w * 0.6), sh = h - 22, sx = x + 8, sy = y + 8;
    R(g, sx - 3, sy - 3, sw + 6, sh + 6, D.n1);
    const scr = mix(D.n0, D.moss[2], 0.16 + (on ? 0.06 : 0));
    R(g, sx, sy, sw, sh, scr);
    const grat = mix(scr, D.moss[1], 0.22);
    for (let i = 1; i < 8; i++) for (let yy = sy + 1; yy < sy + sh; yy += 2) R(g, sx + Math.round((sw * i) / 8), yy, 1, 1, grat);
    for (let j = 1; j < 6; j++) for (let xx = sx + 1; xx < sx + sw; xx += 2) R(g, xx, sy + Math.round((sh * j) / 6), 1, 1, grat);
    R(g, sx, sy + Math.round(sh / 2), sw, 1, mix(scr, D.moss[1], 0.3));
    // trace with a faint phosphor bloom
    let py = null; const mid = sy + Math.round(sh / 2), amp = sh * 0.4;
    for (let i = 0; i < sw; i++) {
      const v = wave(i, sw); if (v === null) { py = null; continue; }
      const yy = Math.round(mid - clamp(v, -1.1, 1.1) * amp);
      const y0 = py === null ? yy : Math.min(py, yy), y1 = py === null ? yy : Math.max(py, yy);
      A(g, 0.25, () => R(g, sx + i, y0 - 1, 1, y1 - y0 + 3, D.moss[1]));
      R(g, sx + i, y0, 1, y1 - y0 + 1, D.moss[0]); py = yy;
    }
    if (on) PX.glow(g, sx + sw / 2, sy + sh / 2, sw * 0.55, D.moss[1], 0.08);
    A(g, 0.08, () => { for (let k = 0; k < 6; k++) R(g, sx + 3, sy + 2 + k, 16 - k * 2, 1, D.cream); });
    // controls: knobs + connectors
    const kx = sx + sw + 8, kw = x + w - kx - 6;
    for (let j = 0; j < 3; j++) for (let i = 0; i < 2; i++) { const cx = kx + 6 + i * Math.max(12, kw - 12), cy = sy + 6 + j * 16; PX.circle(g, cx, cy, 4, D.n2); PX.circle(g, cx, cy, 3, D.n4); R(g, cx, cy - 3, 1, 3, D.n7); }
    for (let i = 0; i < 2; i++) { PX.circle(g, kx + 6 + i * 14, y + h - 10, 3, D.n6); R(g, kx + 6 + i * 14, y + h - 10, 1, 1, D.n1); }
    R(g, sx, y + h - 11, 4, 3, on ? D.moss[0] : D.moss[2]);
    return { sx, sy, sw, sh };
  };

  // ======================= feedback =======================
  // two oscilloscopes on a bench, the dish between them. o.hit 1.5: left scope shows a neat regular pulse train
  // ("HIT = PREDICTABLE"); o.miss 5.5: right scope shows noisy static ("MISS = NOISE"); o.adapt 9.0: the network in
  // the dish rewires itself (tangled -> tidy), firing becomes regular, and the noise on the right scope settles down.
  K.feedback = (o) => {
    const DX = 320, DY = 262, DRX = 112, DRY = 46;
    const net = makeNet(2022, DX, DY, 96, 36, { n: 34, sp: 13, dl: 8, tangled: true });
    return (g, t, d, c) => {
      const T = tm(o, d, 16.0), tH = T("hit", 1.5), tMi = T("miss", 5.5), tA = T("adapt", 9.0);
      const ord = E(clamp((t - tA) / 3.2, 0, 1), "io");
      R(g, 0, 0, 640, 360, D.n1);
      lab(g, c, t, { y: 236, soft: 0.35, winX: 245, shelfX: 450 });
      hangLamp(g, c, 320);
      PX.glow(g, 320, 30, 110, D.lamp, 0.2); PX.glow(g, 320, 250, 200, D.lampD, 0.15);
      // left scope: flat line, then a regular pulse train scrolling
      const hitOn = t >= tH, hk = clamp((t - tH) / 0.4, 0, 1);
      scope(g, 34, 120, 180, 116, t, (i, n) => {
        const ph = i + t * 30, u = ((ph % 18) + 18) % 18;
        const pulse = u < 2 ? 1 : u < 3 ? -0.35 : 0;
        return pulse * hk;
      }, hitOn);
      // right scope: flat, then noise; after adapt the noise amplitude falls
      const missOn = t >= tMi, mk = clamp((t - tMi) / 0.3, 0, 1) * lerp(1, 0.32, E(clamp((t - tA - 1) / 5, 0, 1), "io"));
      scope(g, 426, 120, 180, 116, t, (i, n) => {
        const f = Math.floor(t * 20), a = hash(i, f) - 0.5, b = hash(Math.floor(i / 3), f + 99) - 0.5;
        return (a * 0.9 + b * 1.1) * mk;
      }, missOn);
      // cables from the stage to both scopes
      stage(g, 200, 268, 240, 56, t);
      const cl = cable(g, 204, 288, 120, 236, 22), cr = cable(g, 436, 288, 520, 236, 22);
      if (hitOn) pulses(g, cl, t, 0.8, 1, D.moss[0], 2);
      if (missOn) A(g, mk, () => pulses(g, cr, t, 0.8, 1, D.moss[0], 2));
      dish(g, DX, DY, DRX, DRY, { wall: 10, lit: -1.9 }, (g) => {
        drawNet(g, net, t, { grow: 1, spark: 0.9, order: ord });
      });
      label(g, "HIT = PREDICTABLE", 136, 92, t, tH);
      label(g, "MISS = NOISE", 516, 92, t, tMi);
      PX.particles(g, 14, 22, t, [220, 40, 200, 180], { vy: -2, vx: 1, col: D.lamp, a: 0.4 });
      PX.vignette(g, 0.55);
    };
  };

  // wall clock (no numerals): minute hand angle am, second hand angle as (radians, 0 = 12 o'clock)
  const clock = (g, cx, cy, r, am, as) => {
    PX.circle(g, cx + 2, cy + 2, r + 2, "#000000");
    PX.circle(g, cx, cy, r + 2, D.n4); PX.circle(g, cx, cy, r, mix(D.paper, D.n3, 0.35));
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; R(g, Math.round(cx + Math.sin(a) * (r - 2)), Math.round(cy - Math.cos(a) * (r - 2)), 1, 1, D.ink); }
    PX.line(g, cx, cy, cx + Math.sin(am) * (r - 4), cy - Math.cos(am) * (r - 4), D.ink);
    PX.line(g, cx, cy, cx + Math.sin(am * 0.08 + 2) * (r - 7), cy - Math.cos(am * 0.08 + 2) * (r - 7), D.ink);
    PX.line(g, cx, cy, cx + Math.sin(as) * (r - 3), cy - Math.cos(as) * (r - 3), D.rust[1]);
    R(g, cx, cy, 1, 1, D.n1);
    ring(g, cx, cy, r + 1, r + 1, (a) => (Math.cos(a + 2.3) > 0.5 ? D.n6 : null));
  };
  // lab monitor on a stand; returns screen rect
  const monitor = (g, x, y, w, h) => {
    A(g, 0.4, () => R(g, x + 5, y + h + 16, w - 4, 4, "#000000"));
    R(g, x + w / 2 - 5, y + h, 10, 14, D.n3); R(g, x + w / 2 - 22, y + h + 13, 44, 4, D.n3); R(g, x + w / 2 - 22, y + h + 13, 44, 1, D.n5);
    R(g, x - 5, y - 5, w + 10, h + 10, D.n3); R(g, x - 5, y - 5, w + 10, 1, D.n5); R(g, x - 5, y - 5, 1, h + 10, D.n4);
    R(g, x, y, w, h, mix(D.n0, D.steel[2], 0.15));
    R(g, x + w - 4, y + h + 2, 2, 1, D.moss[1]);
    return { sx: x, sy: y, sw: w, sh: h };
  };

  // ======================= rally =======================
  // the TV game plus a lab monitor plotting hits over time; the curve's tip crosses a dashed "CHANCE" line at
  // o.cross (3.0); a wall clock with the label "5 MIN". The neurons' paddle slowly gets better (never good).
  K.rally = (o) => {
    const net = makeNet(51, 334, 292, 40, 13, { n: 12, sp: 9, dl: 6 });
    return (g, t, d, c) => {
      const T = tm(o, d, 8.0), tC = T("cross", 3.0);
      const skill = (tt) => lerp(0.35, 0.86, PX.smooth(tt / (tC + 2.5)));
      const game = makeGame({ P: 1.0, P2: 1.62, yph: 0.1, L: { lag: 0.22, track: skill, wob: 0.1 }, R: { lag: 0.04, track: () => 1 } });
      const st = game(t);
      R(g, 0, 0, 640, 360, D.n1);
      lab(g, c, t, { y: 240, soft: 0.35, winX: 440, shelfX: 1000 });
      hangLamp(g, c, 334);
      PX.glow(g, 334, 30, 110, D.lamp, 0.18); PX.glow(g, 180, 160, 130, D.cream, 0.06);
      // clock + label
      PX.par(g, c, 0.7, () => clock(g, 330, 70, 15, (t / d) * (TAU / 12) - 0.4, (t / d) * TAU * 5));
      label(g, "5 MIN", 330, 92, t, 0.2);
      tv(g, 66, 92, 226, 144, t, (g, sx, sy, sw, sh) => pongScreen(g, sx, sy, sw, sh, st));
      // monitor with the plot
      const m = monitor(g, 384, 112, 178, 100);
      const px0 = m.sx + 12, px1 = m.sx + m.sw - 10, py0 = m.sy + 12, py1 = m.sy + m.sh - 12;
      const axis = mix(D.cream, D.n3, 0.5);
      for (let k = 1; k < 4; k++) for (let x = px0 + 2; x < px1; x += 2) R(g, x, Math.round(lerp(py1, py0, k / 4)), 1, 1, mix(D.n0, D.steel[2], 0.45));
      R(g, px0, py0, 1, py1 - py0, axis); R(g, px0, py1, px1 - px0, 1, axis);
      const chance = 0.5, yv = (v) => Math.round(py1 - v * (py1 - py0));
      for (let x = px0 + 2; x < px1; x += 6) R(g, x, yv(chance), 3, 1, mix(D.cream, D.n3, 0.25));
      PX.text(g, "CHANCE", px1 - 2, yv(chance) - 11, { font: "v", size: 12, col: mix(D.cream, D.n3, 0.2), align: "right" });
      const f = (tt) => chance + 0.2 * Math.tanh((tt - tC) / 1.6) + 0.035 * Math.sin(tt * 7.3) * Math.min(1, Math.abs(tt - tC));
      const tx = (tt) => Math.round(lerp(px0 + 2, px1 - 4, tt / d));
      let lx = null, ly = null;
      for (let tt = 0; tt <= Math.min(t, d); tt += d / 240) { const x = tx(tt), y = yv(f(tt)); if (lx !== null) { PX.line(g, lx, ly, x, y, D.moss[0]); A(g, 0.25, () => PX.line(g, lx, ly + 1, x, y + 1, D.moss[1])); } lx = x; ly = y; }
      if (lx !== null) { R(g, lx - 1, ly - 1, 3, 3, D.moss[0]); const pk = clamp(1 - Math.abs(t - tC) / 0.5, 0, 1); PX.glow(g, lx, ly, 8 + 6 * pk, D.moss[0], 0.25 + 0.3 * pk); }
      // the dish in front, cabled to the TV
      stage(g, 284, 300, 100, 26, t);
      const cb = cable(g, 286, 312, 230, 244, 14);
      pulses(g, cb, t, 1.0, 1, D.rose[0], 2);
      dish(g, 334, 292, 50, 18, { wall: 6, lit: -2.0 }, (g) => drawNet(g, net, t, { grow: 1, spark: 1 }));
      beaker(g, 610, 240, 14, 20, mix(D.teal[1], D.n2, 0.4), t);
      PX.particles(g, 15, 18, t, [250, 40, 170, 200], { vy: -2, vx: 1, col: D.lamp, a: 0.4 });
      PX.vignette(g, 0.55);
    };
  };

  // ten-year-old kid, side view facing right, feet at (x, y), ~104 px tall. o.mash = hands mashing the controls
  const kid = (g, x, y, t, o) => {
    o = o || {};
    const skin = mix(D.rose[0], D.lampD, 0.35), skinD = mix(skin, D.rose[2], 0.5), skinL = mix(skin, D.cream, 0.35);
    const hair = mix(D.rust[2], D.n0, 0.5), cap = D.rust[1], capD = D.rust[2], capL = mix(D.rust[1], D.rust[0], 0.5);
    const shirt = D.teal[1], shirtD = D.teal[2], shirtL = mix(D.teal[1], D.teal[0], 0.5);
    const pants = D.n4, pantsD = D.n3, shoe = D.paper, shoeD = D.paperD;
    const bob = Math.round(Math.sin(t * 9) * 0.6), tp = o.mash ? Math.round(Math.sin(t * 26)) : 0, tq = o.mash ? Math.round(Math.sin(t * 23 + 1.4)) : 0;
    // legs + socks + sneakers
    R(g, x - 7, y - 30, 6, 22, skinD); R(g, x + 1, y - 30, 6, 22, skin); R(g, x + 6, y - 30, 1, 22, skinL);
    R(g, x - 7, y - 9, 6, 4, D.cream); R(g, x + 1, y - 9, 6, 4, D.cream);
    for (const [fx, sh] of [[x - 9, shoeD], [x - 1, shoe]]) { R(g, fx, y - 5, 13, 4, sh); R(g, fx + 9, y - 4, 4, 3, sh); R(g, fx, y - 1, 14, 1, D.n2); R(g, fx + 3, y - 4, 6, 1, D.steel[1]); R(g, fx + 1, y - 5, 4, 1, D.cream); }
    // shorts
    R(g, x - 10, y - 46 + bob, 20, 17 - bob, pants); R(g, x - 10, y - 46 + bob, 4, 17 - bob, pantsD); R(g, x - 1, y - 36, 1, 6, pantsD);
    // back arm (behind the body)
    for (let k = 0; k < 3; k++) PX.line(g, x + 2, y - 64 + bob + k, x + 20, y - 60 + tq + k, skinD);
    // torso (t-shirt) with screen light on the front edge
    R(g, x - 11, y - 76 + bob, 22, 31, shirt); R(g, x - 11, y - 76 + bob, 5, 31, shirtD); R(g, x + 9, y - 74 + bob, 2, 28, shirtL); R(g, x - 11, y - 47 + bob, 22, 2, shirtD);
    R(g, x - 6, y - 64 + bob, 15, 2, shirtL);
    // neck + head
    const hx0 = x + 1, hy = y - 89 + bob;
    R(g, x - 3, y - 79 + bob, 6, 4, skinD);
    PX.circle(g, hx0, hy, 11, skin); R(g, hx0 + 8, hy - 4, 3, 10, skinL);
    // hair at the back, ear
    PX.circle(g, hx0 - 6, hy, 7, hair); R(g, hx0 - 11, hy - 2, 5, 9, hair); R(g, hx0 - 3, hy, 4, 5, skinD); R(g, hx0 - 2, hy + 1, 2, 3, skin);
    // face: eye, focused brow, nose, small grin
    R(g, hx0 + 6, hy - 1, 2, 2, D.n0); R(g, hx0 + 5, hy - 3, 4, 1, hair); R(g, hx0 + 11, hy + 1, 1, 2, skin); R(g, hx0 + 5, hy + 5, 4, 1, skinD); R(g, hx0 + 9, hy + 4, 1, 1, skinD);
    // backwards cap: crown over the top of the head, brim pointing back
    g.save(); g.beginPath(); g.rect(hx0 - 14, hy - 14, 30, 10); g.clip(); PX.circle(g, hx0, hy - 2, 12, cap); g.restore();
    R(g, hx0 - 11, hy - 5, 22, 2, capD); R(g, hx0 - 5, hy - 13, 9, 1, capL); R(g, hx0 + 6, hy - 11, 3, 3, capL);
    R(g, hx0 - 21, hy - 5, 11, 3, capD); R(g, hx0 - 21, hy - 5, 11, 1, cap);
    // front arm reaching the controls, hand mashing
    R(g, x + 3, y - 74 + bob, 7, 9, shirt); R(g, x + 9, y - 72 + bob, 1, 6, shirtL);
    for (let k = 0; k < 4; k++) PX.line(g, x + 6, y - 66 + bob + k, x + 24, y - 62 + tp + Math.round(k * 0.5), k < 1 ? skinL : skin);
    R(g, x + 23, y - 64 + tp, 5, 4, skin); R(g, x + 26, y - 64 + tp, 2, 1, skinL);
  };
  // arcade cabinet, front view, top-left (x, y), w x h; screen(g, sx, sy, sw, sh); returns screen + panel info
  const cabinet = (g, x, y, w, h, t, screen) => {
    const body = mix(D.n2, D.plum[2], 0.35), bodyD = mix(body, D.n0, 0.45), bodyL = mix(body, D.n6, 0.25);
    A(g, 0.45, () => ell(g, x + w / 2 + 6, y + h + 2, w / 2 + 16, 6, "#000000"));
    R(g, x - 8, y + 8, 8, h - 8, bodyD); R(g, x + w, y + 8, 8, h - 8, bodyD);
    R(g, x - 8, y + 8, 1, h - 8, mix(D.plum[1], D.n2, 0.4)); R(g, x + w + 7, y + 8, 1, h - 8, mix(D.plum[1], D.n2, 0.5));
    R(g, x, y, w, h, body); R(g, x, y, w, 1, bodyL);
    // marquee: soft amber backlight, no text, a row of muted squares
    const my = y + 4, mh = 18, mq = mix(D.amber[2], D.n1, 0.66);
    R(g, x + 4, my, w - 8, mh, mq); R(g, x + 4, my, w - 8, 1, mix(D.amber[1], D.amber[2], 0.4));
    for (let i = 0; i < 5; i++) R(g, x + 12 + i * ((w - 30) / 4), my + 6, 6, 6, mix(D.amber[1], mq, 0.6 + 0.1 * Math.sin(t * 2 + i)));
    PX.glow(g, x + w / 2, my + mh / 2, w * 0.5, D.amber[1], 0.1);
    // screen in a bezel
    const sx = x + 12, sy = my + mh + 8, sw = w - 24, sh = Math.round(sw * 0.75);
    R(g, sx - 6, sy - 5, sw + 12, sh + 10, D.n1); R(g, sx - 6, sy - 5, sw + 12, 1, D.n3);
    R(g, sx, sy, sw, sh, mix(D.n0, D.teal[2], 0.18));
    g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip(); screen(g, sx, sy, sw, sh);
    for (let yy = sy; yy < sy + sh; yy += 2) A(g, 0.12, () => R(g, sx, yy, sw, 1, "#000000"));
    A(g, 0.07, () => { for (let k = 0; k < 8; k++) R(g, sx + 3, sy + 2 + k, 20 - k * 2, 1, D.cream); });
    g.restore();
    PX.glow(g, sx + sw / 2, sy + sh / 2, sw * 0.9, D.cream, 0.06);
    // control panel (sloped): the kid's knob, buttons, and the socket where the dish's paddle cord plugs in
    const py = sy + sh + 10;
    poly(g, [[x - 6, py], [x + w + 6, py], [x + w + 12, py + 14], [x - 12, py + 14]], mix(body, D.n5, 0.25));
    R(g, x - 6, py, w + 12, 1, mix(body, D.cream, 0.3)); R(g, x - 12, py + 14, w + 24, 4, bodyD);
    PX.circle(g, x + 22, py + 6, 4, D.n1); PX.circle(g, x + 22, py + 5, 3, D.n5); R(g, x + 21, py + 2, 2, 2, D.n7);
    R(g, x + w - 26, py + 4, 6, 4, D.n1);
    R(g, x + w / 2 - 8, py + 4, 4, 3, D.rust[2]); R(g, x + w / 2 + 2, py + 4, 4, 3, D.amber[2]);
    // coin door
    const cy = py + 30;
    R(g, x + w / 2 - 16, cy, 32, 30, bodyD); R(g, x + w / 2 - 16, cy, 32, 1, bodyL);
    for (const cx of [x + w / 2 - 10, x + w / 2 + 4]) { R(g, cx, cy + 6, 6, 9, D.n1); R(g, cx + 2, cy + 8, 2, 5, mix(D.rust[1], D.n1, 0.2 + 0.15 * Math.sin(t * 3 + cx))); }
    return { sx, sy, sw, sh, py, plug: [x + w - 23, py + 6] };
  };

  // ======================= kid_wins =======================
  // gag: an arcade at night; a ten-year-old (backwards cap, sneakers) on a crate at the same game, utterly destroying
  // the dish, which sits on a stool with a tiny sad paddle dangling on its cord. Score blocks pile up on the kid's side.
  // o.pre = blocks already on the kid's side (12)
  K.kid_wins = (o) => {
    const net = makeNet(8, 487, 232, 19, 5, { n: 8, sp: 6, dl: 4 });
    const game = makeGame({ P: 0.3, P2: 0.53, yph: 0.2, L: { lag: 0.0, track: () => 1 }, R: { lag: 0.3, track: () => 0.15, wob: 0.25 } });
    return (g, t, d, c) => {
      const st = game(t), pre = o.pre === undefined ? 12 : o.pre;
      R(g, 0, 0, 640, 360, D.n0);
      PX.vgrad(g, -40, -40, 720, 340, D.n1, D.n0, 8);
      // a row of dim cabinets along the far wall (parallax)
      PX.par(g, c, 0.4, () => {
        for (let i = 0; i < 9; i++) {
          if (i === 4) continue;
          const bx = -20 + i * 80, bw = 50, bt = 120, col = mix(D.n1, D.plum[2], 0.2);
          R(g, bx, bt, bw, 210, col); R(g, bx, bt, bw, 1, mix(col, D.n5, 0.3));
          R(g, bx + 4, bt + 4, bw - 8, 8, mix(D.amber[2], D.n1, 0.65));
          const scol = [D.teal[2], D.steel[2]][i % 2];
          R(g, bx + 5, bt + 15, bw - 10, 36, D.n0); R(g, bx + 7, bt + 18, bw - 14, 30, mix(scol, D.n0, 0.62));
          R(g, bx - 3, bt + 58, bw + 6, 5, mix(col, D.n5, 0.2)); R(g, bx - 3, bt + 58, bw + 6, 1, mix(col, D.n6, 0.3)); R(g, bx, bt + 63, bw, 147, mix(col, D.n0, 0.3));
          R(g, bx + 10, bt + 59, 3, 2, mix(D.rust[2], D.n1, 0.3)); R(g, bx + bw - 14, bt + 59, 3, 2, mix(D.amber[2], D.n1, 0.3));
          A(g, 0.5, () => { for (let k = 0; k < 4; k++) R(g, bx + 10 + ((k * 13 + Math.floor(t * 3 + i)) % (bw - 22)), bt + 24 + k * 6, 3, 2, mix(scol, D.cream, 0.3)); });
          PX.glow(g, bx + bw / 2, bt + 33, 28, scol, 0.12);
        }
      });
      PX.par(g, c, 0.6, () => { for (let i = 0; i < 4; i++) { R(g, 60 + i * 170, 0, 12, 4, D.n3); PX.glow(g, 66 + i * 170, 4, 40, D.lampD, 0.14); } });
      // carpet: dark with a muted repeating pattern
      PX.vgrad(g, -40, 290, 720, 110, mix(D.n1, D.plum[2], 0.3), D.n0, 5);
      for (let yy = 296; yy < 370; yy += 10) for (let xx = -40 + ((yy / 10) % 2) * 9; xx < 680; xx += 18) { R(g, xx, yy, 2, 2, mix(D.plum[2], D.n1, 0.4)); R(g, xx + 5, yy + 3, 1, 1, mix(D.teal[2], D.n1, 0.4)); }
      const cab = cabinet(g, 262, 92, 124, 208, t, (g, sx, sy, sw, sh) => pongScreen(g, sx, sy, sw, sh, { ...st, sL: st.sL + pre }, { popL: clamp(1 - (t - st.lastMissR) / 0.35, 0, 1) }));
      PX.glow(g, 324, 300, 120, D.cream, 0.06);
      // crate + kid
      const [wd, wdD, wdL] = woodCols();
      R(g, 196, 284, 52, 16, wd); R(g, 196, 284, 52, 1, wdL); R(g, 196, 291, 52, 1, wdD); R(g, 196, 299, 52, 1, wdD); R(g, 200, 284, 2, 16, wdD); R(g, 242, 284, 2, 16, wdD);
      kid(g, 224, 284, t, { mash: true });
      // stool with the dish
      R(g, 474, 246, 3, 54, D.n4); R(g, 498, 246, 3, 54, D.n4); R(g, 486, 248, 3, 52, D.n3); R(g, 476, 280, 24, 2, D.n4);
      ell(g, 487, 243, 26, 7, D.n4); ell(g, 487, 242, 25, 6, D.n5); R(g, 468, 238, 16, 1, D.n6);
      dish(g, 487, 232, 22, 7, { wall: 4, lit: -2.4 }, (g) => drawNet(g, net, t, { grow: 1, spark: 0.4 }));
      // cord from the cabinet socket over the stool edge to the tiny dangling paddle (slow sad swing)
      const swg = Math.sin(t * 1.6) * 3, kx = Math.round(512 + swg), ky = 272;
      cable(g, cab.plug[0], cab.plug[1], 506, 244, 16);
      PX.line(g, 506, 244, kx, ky - 4, D.n0); PX.line(g, 507, 244, kx + 1, ky - 4, D.n4);
      R(g, kx - 4, ky - 4, 9, 6, D.n3); R(g, kx - 4, ky - 4, 9, 1, D.n5); PX.circle(g, kx, ky + 3, 2, D.n5); R(g, kx, ky + 2, 1, 1, D.n7);
      PX.particles(g, 16, 20, t, [150, 60, 360, 200], { vy: -2, vx: 1, col: D.lamp, a: 0.3 });
      PX.vignette(g, 0.6);
    };
  };

  // ======================= two_sources =======================
  // a cork board over the bench: a paper card with a mouse silhouette "MOUSE NEURONS" (o.mouse 0.3) and one with a
  // human silhouette "HUMAN NEURONS" (o.human 1.8); each sends a stream of cells down into the dish below.
  K.two_sources = (o) => {
    const DX = 320, DY = 286, DRX = 120, DRY = 36;
    const net = makeNet(14, DX, DY, 104, 28, { n: 30, sp: 12, dl: 7 });
    const C1 = [200, 152], C2 = [440, 152];
    const pathL = curve(C1[0], C1[1], DX - 40, DY - 4, -0.25), pathR = curve(C2[0], C2[1], DX + 40, DY - 4, 0.25);
    const card = (g, x, y, w, h, t, t0, art, txt) => {
      if (t < t0) return;
      const k = PX.p(t, t0, 0.45, "out"), dy = Math.round((1 - k) * -8);
      A(g, k, () => {
        A(g, 0.5, () => R(g, x + 4, y + dy + 4, w, h, "#000000"));
        R(g, x, y + dy, w, h, D.paper); R(g, x, y + dy, w, 1, mix(D.paper, D.cream, 0.6)); R(g, x + w - 1, y + dy, 1, h, D.paperD); R(g, x, y + dy + h - 1, w, 1, D.paperD);
        for (let yy = y + dy + 14; yy < y + dy + h - 22; yy += 9) R(g, x + 6, yy, w - 12, 1, mix(D.paper, D.teal[1], 0.15));   // faint index-card rules
        R(g, x + 6, y + dy + 8, w - 12, 1, mix(D.paper, D.rust[1], 0.35));
        art(g, x + w / 2, y + dy + 50);
        PX.text(g, txt, x + w / 2, y + dy + h - 15, { col: D.ink, align: "center" });
        PX.circle(g, x + w / 2, y + dy + 4, 3, D.rust[2]); PX.circle(g, x + w / 2 - 1, y + dy + 3, 2, D.rust[1]); R(g, x + w / 2 - 1, y + dy + 2, 1, 1, D.rust[0]);
      });
    };
    const mouse = (g, cx, cy) => {
      const k = D.ink;
      ell(g, cx - 2, cy + 6, 22, 13, k); ell(g, cx + 20, cy + 2, 11, 9, k); ell(g, cx + 28, cy + 5, 6, 4, k);
      PX.circle(g, cx + 14, cy - 8, 6, k); PX.circle(g, cx + 14, cy - 8, 3, mix(D.paper, D.ink, 0.35));
      R(g, cx + 22, cy - 1, 2, 2, D.paper);
      for (let i = 0; i < 30; i++) { const u = i / 29; R(g, Math.round(cx - 22 - u * 22), Math.round(cy + 12 - Math.sin(u * 3.1) * 10 + u * 4), 2, 1, k); }
      R(g, cx - 10, cy + 18, 4, 3, k); R(g, cx + 10, cy + 18, 4, 3, k);
      PX.line(g, cx + 33, cy + 4, cx + 42, cy + 1, k); PX.line(g, cx + 33, cy + 6, cx + 42, cy + 8, k);
    };
    const human = (g, cx, cy) => {
      const k = D.ink;
      PX.circle(g, cx, cy - 18, 9, k);
      poly(g, [[cx - 6, cy - 8], [cx + 6, cy - 8], [cx + 22, cy - 2], [cx + 24, cy + 22], [cx - 24, cy + 22], [cx - 22, cy - 2]], k);
    };
    return (g, t, d, c) => {
      const T = tm(o, d, 3.6), tMo = T("mouse", 0.3), tHu = T("human", 1.8);
      R(g, 0, 0, 640, 360, D.n1);
      lab(g, c, t, { y: 250, soft: 0.45, winX: -300, shelfX: 900 });
      // cork board (mid layer)
      PX.par(g, c, 0.8, () => {
        const cork = mix(mix(D.amber[2], D.rust[2], 0.4), D.n2, 0.62), frame = woodCols();
        R(g, 96, 26, 448, 168, frame[1]); R(g, 96, 26, 448, 1, frame[2]);
        R(g, 102, 32, 436, 156, cork);
        const rr = PX.rnd(3); for (let i = 0; i < 420; i++) R(g, 102 + rr() * 435, 32 + rr() * 155, 1, 1, rr() < 0.5 ? mix(cork, D.n0, 0.25) : mix(cork, D.lamp, 0.12));
        // old pinned notes (blank) for texture
        R(g, 292, 44, 54, 38, mix(D.paperD, D.n2, 0.35)); R(g, 300, 52, 36, 1, mix(D.paperD, D.n1, 0.5)); R(g, 300, 58, 30, 1, mix(D.paperD, D.n1, 0.5));
        R(g, 306, 128, 34, 46, mix(D.paper, D.n2, 0.5)); PX.circle(g, 322, 131, 2, D.steel[2]);
      });
      hangLamp(g, c, 320);
      PX.glow(g, 320, 40, 140, D.lamp, 0.2); PX.glow(g, 320, 150, 240, D.lampD, 0.12);
      card(g, 126, 46, 148, 114, t, tMo, mouse, "MOUSE NEURONS");
      card(g, 366, 46, 148, 114, t, tHu, human, "HUMAN NEURONS");
      // dish on the bench
      const arrived = clamp((t - tMo - 0.9) / (d - tMo - 0.9), 0, 1);
      dish(g, DX, DY, DRX, DRY, { wall: 9, lit: -1.9 }, (g) => drawNet(g, net, t, { grow: 0.15 + 0.85 * arrived, spark: 0.6 }));
      // cell streams: one cell every 0.14 s, 1.3 s along the path, gently wobbling
      const stream = (path, t0, seed) => {
        if (t < t0 + 0.3) return;
        for (let i = 0; ; i++) {
          const em = t0 + 0.3 + i * 0.14; if (em > t) break;
          const u = (t - em) / 1.3; if (u >= 1) continue;
          const p = path[Math.floor(u * (path.length - 1))], w = Math.sin(t * 3 + i * 1.7) * 3 * Math.sin(u * Math.PI);
          const rad = hash(i, seed) < 0.4 ? 3 : 2, a = Math.min(1, u * 6, (1 - u) * 5);
          A(g, a * 0.9, () => {
            PX.circle(g, p[0] + w, p[1], rad, D.rose[2]); PX.circle(g, p[0] + w - 1, p[1] - 1, rad - 1, D.rose[1]); R(g, p[0] + w - 1, p[1] - rad + 1, 1, 1, D.rose[0]);
          });
        }
      };
      stream(pathL, tMo, 1); stream(pathR, tHu, 2);
      PX.particles(g, 17, 22, t, [200, 40, 240, 200], { vy: -2, vx: 1, col: D.lamp, a: 0.4 });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= power =======================
  // night, balance of power: left a human head silhouette with a soft brain glow next to a bare light bulb,
  // "20 WATTS" (o.brain 1.0). At o.dc (4.5) the dark right side lights up: a huge data center humming with lights,
  // rooftop fans spinning, steam rising, fed by power lines; "A WHOLE DATA CENTER".
  K.power = (o) => {
    const HEAD = [[100, 124], [130, 118], [156, 128], [166, 146], [168, 162], [178, 182], [168, 189], [171, 197], [165, 203], [167, 214], [158, 224], [142, 228], [144, 244], [150, 262], [196, 280], [214, 300], [26, 300], [36, 282], [80, 266], [96, 244], [84, 226], [76, 200], [74, 166], [82, 142]];
    const brainNet = makeNet(20, 120, 166, 34, 24, { n: 16, sp: 9, dl: 5 });
    const r = PX.rnd(61), stars = [];
    for (let i = 0; i < 90; i++) stars.push([r() * 680 - 20, r() * 170, r(), r() * TAU]);
    const BX = 330, BY = 170, BW = 360, BH = 104;   // data center block
    return (g, t, d, c) => {
      const T = tm(o, d, 8.5), tB = T("brain", 1.0), tD = T("dc", 4.5);
      const on = PX.p(t, tB, 0.8, "io"), dc = clamp((t - tD) / 1.4, 0, 1);
      // sky + stars
      PX.vgrad(g, -40, -40, 720, 300, D.n0, mix(D.steel[2], D.n1, 0.55), 9);
      for (const [x, y, b, ph] of stars) A(g, (0.25 + 0.35 * b) * (0.7 + 0.3 * Math.sin(t * 1.2 + ph)), () => R(g, x, y, 1, 1, D.cream));
      // far hills
      PX.par(g, c, 0.3, () => {
        g.fillStyle = mix(D.n1, D.steel[2], 0.25);
        for (let x = -40; x < 680; x++) { const h = 30 + Math.sin(x * 0.012) * 14 + Math.sin(x * 0.041 + 1) * 6; g.fillRect(x, 262 - h, 1, h + 50); }
      });
      // data center glow on the sky (small, after reveal)
      if (dc > 0) PX.glow(g, 510, 200, 220, D.steel[1], 0.1 * dc);
      // mid: pylons + power lines into the data center
      PX.par(g, c, 0.6, () => {
        const pyl = (x, y, h) => { const col = mix(D.n2, D.steel[2], 0.25 + 0.2 * dc); PX.line(g, x - 9, y + 24, x, y - h, col); PX.line(g, x + 9, y + 24, x, y - h, col); R(g, x - 10, y - h + 8, 21, 1, col); R(g, x - 7, y - h + 16, 15, 1, col); PX.line(g, x - 4, y - h * 0.5, x + 4, y - h * 0.3, col); PX.line(g, x + 4, y - h * 0.5, x - 4, y - h * 0.3, col); return [x - 10, y - h + 8]; };
        const a = pyl(262, 262, 60), b = pyl(300, 258, 52);
        const wc = mix(D.n2, D.steel[2], 0.2 + 0.2 * dc);
        for (const dx of [0, 20]) { PX.line(g, a[0] + dx, a[1], b[0] + dx * 0.8, b[1], wc); PX.line(g, b[0] + dx * 0.8, b[1], BX + 10 + dx, BY + 4, wc); }
      });
      // ground
      PX.vgrad(g, -40, 258, 720, 120, mix(D.n1, D.steel[2], 0.15), D.n0, 6);
      // data center: a dark silhouette until o.dc, then its lights sweep on from left to right
      const sweep = (x) => clamp((dc * 1.7 - ((x - BX) / BW) * 0.9) / 0.35, 0, 1);
      PX.par(g, c, 0.8, () => {
        const wall = mix(mix(D.n0, D.n1, 0.6), D.steel[2], 0.3 * dc), wallL = mix(wall, D.steel[1], 0.15 + 0.2 * dc), wallD = mix(wall, D.n0, 0.35);
        R(g, BX, BY, BW, BH, wall); R(g, BX, BY, BW, 1, wallL);
        for (let x = BX + 4; x < BX + BW; x += 6) R(g, x, BY + 2, 1, BH - 4, wallD);   // cladding ribs
        // rooftop chillers with fans (spin up at o.dc) + soft steam
        for (let i = 0; i < 9; i++) {
          const ux = BX + 14 + i * 38, uy = BY - 14, lk = sweep(ux);
          R(g, ux, uy, 30, 14, wallD); R(g, ux, uy, 30, 1, wallL);
          for (let f = 0; f < 2; f++) {
            const fx = ux + 8 + f * 14, fy = uy + 5, ang = t * (0.3 + 9 * lk) + i + f * 0.7;
            PX.circle(g, fx, fy, 5, D.n0);
            for (let bl = 0; bl < 3; bl++) { const a = ang + (bl * TAU) / 3; PX.line(g, fx, fy, fx + Math.round(Math.cos(a) * 4), fy + Math.round(Math.sin(a) * 2), mix(D.n3, D.steel[0], 0.45 * lk)); }
          }
          if (lk > 0) for (let k = 0; k < 7; k++) {
            const u = frac(t * 0.2 + k / 7 + i * 0.13), sx = ux + 15 + Math.sin(u * 4 + i) * 5 + u * 16, sy = uy - 2 - u * 74;
            PX.glow(g, sx, sy, 6 + u * 14, D.n6, lk * 0.13 * Math.sin(u * Math.PI));
          }
        }
        // two long light bands along the facade
        for (const yy of [BY + 14, BY + 46]) for (let x = BX + 6; x < BX + BW - 4; x++) { const lk = sweep(x); if (lk > 0) A(g, lk, () => R(g, x, yy, 1, 2, mix(D.steel[0], D.n3, 0.35 + 0.1 * Math.sin(x * 0.3 + t * 2)))); }
        // a glass hall showing rows of server racks with blinking status lights
        const gx = BX + 36, gy = BY + 22, gw = 170, gh = 50, lkG = sweep(gx + 40);
        R(g, gx - 2, gy - 2, gw + 4, gh + 4, wallD); R(g, gx, gy, gw, gh, mix(D.n0, D.steel[2], 0.15 + 0.3 * lkG));
        for (let rk = 0; rk < 14; rk++) {
          const rx = gx + 4 + rk * 12, lk = sweep(rx);
          R(g, rx, gy + 6, 9, gh - 8, mix(D.n0, D.n2, 0.5 + 0.3 * lk));
          for (let j = 0; j < 9; j++) for (let i2 = 0; i2 < 2; i2++) {
            const hsh = hash(rk * 9 + j, i2), on2 = lk > 0 && frac(t * (0.6 + hsh * 2) + hsh * 7) < 0.7;
            if (on2) R(g, rx + 2 + i2 * 4, gy + 9 + j * 4, 1, 1, hsh < 0.12 ? D.amber[1] : hsh < 0.5 ? D.moss[0] : D.steel[0]);
          }
        }
        for (let x = gx; x < gx + gw; x += 34) R(g, x, gy, 1, gh, wallD);   // mullions
        A(g, 0.1 * lkG, () => { for (let k = 0; k < 10; k++) R(g, gx + 20 + k * 2, gy + 2 + k * 4, 6, 1, D.cream); });
        // small security lights + loading bays
        for (let i = 0; i < 4; i++) {
          const lx = BX + 230 + i * 30; R(g, lx, BY + BH - 16, 22, 16, wallD); R(g, lx, BY + BH - 16, 22, 1, wallL);
          const lk = sweep(lx); if (lk > 0) { R(g, lx + 10, BY + BH - 22, 2, 2, D.lamp); PX.glow(g, lx + 11, BY + BH - 20, 14, D.lampD, 0.25 * lk); }
        }
      });
      // light spill on the ground in front of the building
      if (dc > 0) A(g, 0.08 * dc, () => R(g, BX - 10, BY + BH, BW, 8, D.steel[0]));
      // foreground fence (parallax)
      PX.par(g, c, 1.15, () => {
        const fc = mix(D.n2, D.steel[2], 0.15);
        for (let x = 300; x < 700; x += 22) R(g, x, 288, 2, 30, fc);
        R(g, 300, 292, 400, 1, fc); R(g, 300, 306, 400, 1, fc);
        for (let x = 300; x < 700; x += 4) { R(g, x, 292 + ((x / 4) % 4), 1, 1, mix(fc, D.n0, 0.3)); }
      });
      // the head (left foreground), brain glow inside, rim light from the bulb
      const headCol = mix(D.n0, D.n1, 0.5), rim = mix(D.lampD, D.n1, lerp(0.85, 0.35, on));
      poly(g, HEAD, headCol);
      HEAD.forEach(([x1, y1], i) => { const [x2, y2] = HEAD[(i + 1) % HEAD.length], nx = (y2 - y1) / (Math.hypot(x2 - x1, y2 - y1) || 1); if (nx > 0.2) PX.line(g, x1 + 1, y1, x2 + 1, y2, rim); });
      g.save(); g.beginPath(); HEAD.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
      PX.glow(g, 120, 166, 56, D.rose[1], 0.12 + 0.22 * on * (0.9 + 0.1 * Math.sin(t * 1.4)));
      A(g, 0.25 + 0.6 * on, () => drawNet(g, brainNet, t, { grow: 1, spark: on }));
      g.restore();
      // the bulb on its cord
      const bx = 236, by = 196;
      R(g, bx, -10, 1, by - 22, D.n3);
      R(g, bx - 4, by - 22, 9, 10, D.n4); R(g, bx - 4, by - 22, 9, 1, D.n6); for (let k = 0; k < 3; k++) R(g, bx - 4, by - 19 + k * 3, 9, 1, D.n3);
      PX.circle(g, bx, by, 9, mix(D.n4, D.lamp, on)); PX.circle(g, bx - 2, by - 2, 4, mix(D.n5, D.cream, on));
      R(g, bx - 3, by - 2, 7, 1, mix(D.n3, D.amber[0], on)); PX.line(g, bx - 3, by - 2, bx - 1, by - 12, mix(D.n3, D.amber[1], on)); PX.line(g, bx + 3, by - 2, bx + 1, by - 12, mix(D.n3, D.amber[1], on));
      if (on > 0) { PX.glow(g, bx, by, 70, D.lamp, 0.3 * on); PX.glow(g, bx, by, 16, D.cream, 0.25 * on); }
      label(g, "20 WATTS", 170, 304, t, tB + 0.2);
      label(g, "A WHOLE DATA CENTER", 466, 306, t, tD + 0.7);
      PX.vignette(g, 0.55);
    };
  };
})();
