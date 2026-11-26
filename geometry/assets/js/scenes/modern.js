/* Geometry film, Builder B: modern-world story scenes. Documentary palette PX.D only (no hex literals except black for
   shadows), no mascot, no neon. Kinds: string_circle, pizza_order, giant_ant, bolyai_letter, gps_street, builder_corner.
   Kit: colour mix, shapes, pixel ring arcs, 2-bone IK, a side-view person (profile face) and a front-view person. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, E = PX.ease, P = PX.p;
  const TAU = Math.PI * 2, BLK = "#000000", rad = (a) => (a * Math.PI) / 180;

  // ---------- colour + shape kit ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const MC = new Map();
  const mix = (a, b, k) => {
    k = Math.round(clamp(k, 0, 1) * 255) / 255; const key = a + b + k; let v = MC.get(key);
    if (!v) { const A0 = hx(a), B0 = hx(b); v = "#" + A0.map((x, i) => Math.round(x + (B0[i] - x) * k).toString(16).padStart(2, "0")).join(""); MC.set(key, v); }
    return v;
  };
  const tri = (b, l, s) => [mix(b, D.cream, l === undefined ? 0.26 : l), b, mix(b, D.n0, s === undefined ? 0.42 : s)];
  const ell = (g, cx, cy, rx, ry, col) => {
    if (rx <= 0 || ry <= 0) return; g.fillStyle = col; const RY = Math.round(ry);
    for (let y = -RY; y <= RY; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
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
  const seg = (g, x1, y1, x2, y2, w, col) => {
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = (-(y2 - y1) / L) * w / 2, ny = ((x2 - x1) / L) * w / 2;
    poly(g, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], col);
  };
  const limb = (g, x1, y1, x2, y2, w, col) => { seg(g, x1, y1, x2, y2, w, col); ell(g, x1, y1, w / 2 - 0.3, w / 2 - 0.3, col); ell(g, x2, y2, w / 2 - 0.3, w / 2 - 0.3, col); };
  const A = (g, a, fn) => { if (a <= 0) return; const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const shadow = (g, cx, cy, rx, ry, a) => A(g, a === undefined ? 0.35 : a, () => ell(g, cx, cy, rx, ry, BLK));
  // option time: o[k] if a number, else the default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  const wood = (k, base) => tri(mix(base || mix(D.rust[2], D.amber[2], 0.45), D.n2, k === undefined ? 0.3 : k), 0.22, 0.4);
  const ring = (g, cx, cy, rx, ry, col, a0, a1, dash) => {
    a0 = a0 === undefined ? 0 : a0; a1 = a1 === undefined ? TAU : a1; if (rx < 0.5) return;
    const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) * 1.5)); g.fillStyle = col; let lx = 1e9, ly = 1e9, c = 0;
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n, x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * ry);
      if (x === lx && y === ly) continue; lx = x; ly = y;
      if (!dash || c % (dash[0] + dash[1]) < dash[0]) g.fillRect(x, y, 1, 1); c++;
    }
  };
  const dots = (g, x1, y1, x2, y2, col, gap, ph) => {
    const L = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(L / gap), o = (((ph || 0) % gap) + gap) % gap;
    for (let i = 0; i <= n; i++) { const k = (i * gap + o) / (L || 1); if (k > 1) break; R(g, lerp(x1, x2, k), lerp(y1, y2, k), 1, 1, col); }
  };
  const label = (g, s, x, y, t, t0, o) => {
    o = o || {}; if (t < t0) return; const a = P(t, t0, 0.45, "out");
    A(g, a, () => PX.otext(g, s, x, y + Math.round(3 * (1 - a)), { align: o.align || "center", col: o.col || D.cream, outline: o.outline || D.n0, size: o.size || 8, font: o.font }));
  };
  // 2-bone IK: shoulder (sx,sy) -> target, bend +1 = elbow below/behind. Returns [ex, ey, hx, hy]
  const ik2 = (sx, sy, tx, ty, L1, L2, bend) => {
    const dd = clamp(Math.hypot(tx - sx, ty - sy), 0.01, L1 + L2 - 0.01), base = Math.atan2(ty - sy, tx - sx);
    const a = Math.acos(clamp((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1)), an = base + (bend === undefined ? 1 : bend) * a;
    const ex = sx + Math.cos(an) * L1, ey = sy + Math.sin(an) * L1, b2 = Math.atan2(ty - ey, tx - ex);
    return [ex, ey, ex + Math.cos(b2) * L2, ey + Math.sin(b2) * L2];
  };
  // small flame (candle / lamp): base at (x, y), height h
  const flame = (g, x, y, h, t, ph) => {
    const fl = Math.sin(t * 9 + (ph || 0)) * 0.6 + Math.sin(t * 23 + (ph || 0) * 2) * 0.4, hh = h * (0.9 + 0.1 * fl);
    ell(g, x + fl * 0.4, y - hh * 0.5, h * 0.32, hh * 0.55, mix(D.amber[1], D.rust[1], 0.3));
    ell(g, x + fl * 0.3, y - hh * 0.45, h * 0.2, hh * 0.38, D.amber[0]);
    ell(g, x, y - hh * 0.3, h * 0.1, hh * 0.18, D.cream);
  };
  // walking leg angles [thigh, shin] at stride phase ph, amount m
  const wl = (ph, m) => { const s = Math.sin(ph) * 22; return [s * m, (s - 30 * Math.max(0, Math.cos(ph))) * m]; };

  // ---------- people ----------
  const SK = {
    fair: tri(mix(D.paper, D.rose[1], 0.4), 0.3, 0.32),
    warm: tri(mix(D.paperD, D.rust[1], 0.3), 0.3, 0.35),
    med: tri(mix(D.rust[2], D.paperD, 0.55), 0.28, 0.38),
    deep: tri(mix(D.rust[2], D.n2, 0.35), 0.25, 0.4),
  };
  const HR = {
    black: [mix(D.n2, D.steel[2], 0.35), mix(D.n0, D.rust[2], 0.12)],
    brown: [mix(D.rust[2], D.paperD, 0.3), mix(D.rust[2], D.n0, 0.45)],
    auburn: [mix(D.rust[1], D.paperD, 0.25), mix(D.rust[2], D.n1, 0.25)],
    blond: [mix(D.paper, D.amber[0], 0.3), mix(D.paperD, D.amber[2], 0.4)],
    grey: [mix(D.cream, D.n7, 0.2), mix(D.n7, D.n5, 0.35)],
  };
  // profile head facing +x, centre (x, y). f: {eye: fwd|up|down|closed|happy, mouth: flat|smile|grin|o|frown|press, brow: 0|up|worry|firm}
  const headS = (g, P0, x, y, f, t, ph) => {
    x = Math.round(x); y = Math.round(y);
    const [sl, sb, sd] = P0.skin, [hl, hb] = P0.hair, hd = mix(hb, D.n0, 0.4), sdd = mix(sd, D.n0, 0.25), ink = D.n0;
    R(g, x - 3, y + 5, 6, 8, sd); R(g, x, y + 5, 3, 7, sb);
    ell(g, x - 1, y - 1, 8, 8.5, sb); R(g, x + 3, y - 6, 5, 10, sb); R(g, x + 2, y + 4, 5, 3, sb); R(g, x + 2, y + 7, 4, 1, sb);
    R(g, x + 8, y - 4, 1, 2, sb); R(g, x + 8, y - 1, 2, 3, sb); R(g, x + 9, y - 1, 1, 1, sl); R(g, x + 8, y + 2, 1, 1, sd);
    R(g, x - 4, y + 3, 5, 3, sd); R(g, x + 1, y + 7, 1, 1, sd); R(g, x + 2, y + 8, 4, 1, sdd);
    R(g, x + 7, y - 6, 1, 4, sl); R(g, x + 3, y + 1, 3, 2, mix(sb, D.rose[1], 0.25));
    R(g, x - 3, y - 2, 3, 5, sd); R(g, x - 2, y - 1, 1, 3, sb); R(g, x - 3, y + 3, 2, 1, sdd);
    const st = P0.style || "short";
    if (st === "bald") {
      R(g, x - 9, y - 4, 6, 8, hb); R(g, x - 1, y - 4, 2, 3, hb); R(g, x - 8, y - 5, 4, 1, hl); R(g, x - 9, y + 2, 2, 2, hd);
      R(g, x - 5, y - 9, 6, 1, sl); R(g, x + 3, y - 7, 3, 1, sd);
    } else {
      ell(g, x - 2, y - 6, 8.5, 5, hb); R(g, x - 9, y - 6, 5, 9, hb); R(g, x + 1, y - 10, 6, 3, hb); R(g, x + 5, y - 9, 3, 3, hb); R(g, x - 1, y - 4, 2, 4, hb);
      if (st === "long" || st === "pony") { R(g, x - 11, y - 6, 6, st === "long" ? 15 : 9, hb); R(g, x - 10, y + 3, 4, 2, hd); if (st === "pony") ell(g, x - 12, y + 2, 2.5, 5, hb); }
      if (st === "kid" || st === "curly") for (const [dx, dy] of [[-7, -10], [-3, -12], [2, -12], [6, -10]]) ell(g, x + dx, y + dy, 2, 1.5, hb);
      R(g, x - 5, y - 11, 7, 1, hl); R(g, x - 7, y - 9, 4, 1, hl); R(g, x + 2, y - 10, 3, 1, hl); R(g, x - 9, y - 2, 1, 5, hd); R(g, x - 6, y - 3, 1, 4, hd);
    }
    if (P0.beard) { R(g, x - 1, y + 1, 3, 6, hb); R(g, x + 1, y + 5, 6, 4, hb); R(g, x + 3, y + 8, 4, 1, hd); }
    // eye + brow
    const e = f.eye || "fwd", blink = PX.blink(t + (ph || 0), 3.7, 0.045), wh = mix(D.cream, sb, 0.2);
    if (e === "happy") { R(g, x + 4, y - 1, 1, 1, ink); R(g, x + 5, y - 2, 1, 1, ink); R(g, x + 6, y - 1, 1, 1, ink); }
    else if (e === "closed" || (blink && e !== "wide")) R(g, x + 4, y - 1, 3, 1, sdd);
    else if (e === "up") { R(g, x + 4, y - 2, 1, 2, wh); R(g, x + 5, y - 3, 2, 2, ink); R(g, x + 5, y - 1, 2, 1, wh); }
    else if (e === "down") { R(g, x + 4, y - 2, 3, 1, sd); R(g, x + 5, y - 1, 2, 1, ink); }
    else if (e === "wide") { R(g, x + 4, y - 3, 3, 3, wh); R(g, x + 5, y - 2, 2, 2, ink); }
    else { R(g, x + 4, y - 2, 1, 2, wh); R(g, x + 5, y - 2, 2, 2, ink); R(g, x + 6, y - 2, 1, 1, wh); }
    const bc = P0.brow || hd, b = f.brow || 0;
    if (b === "up") R(g, x + 3, y - 6, 4, 1, bc);
    else if (b === "worry") { R(g, x + 3, y - 4, 2, 1, bc); R(g, x + 5, y - 5, 2, 1, bc); }
    else if (b === "firm") { R(g, x + 3, y - 5, 2, 1, bc); R(g, x + 5, y - 4, 3, 1, bc); }
    else R(g, x + 3, y - 4, 4, 1, bc);
    if (P0.old) { R(g, x + 3, y + 1, 1, 2, sd); R(g, x + 3, y - 1, 1, 1, sd); R(g, x + 4, y - 8, 3, 1, sd); }
    const mc = mix(sd, D.rust[2], 0.5), m = f.mouth || "flat";
    if (m === "smile") { R(g, x + 5, y + 4, 2, 1, mc); R(g, x + 7, y + 3, 1, 1, mc); R(g, x + 3, y + 1, 3, 2, mix(sb, D.rose[1], 0.45)); }
    else if (m === "grin") { R(g, x + 4, y + 4, 4, 2, mc); R(g, x + 5, y + 4, 3, 1, D.cream); R(g, x + 3, y + 1, 3, 2, mix(sb, D.rose[1], 0.5)); }
    else if (m === "o") R(g, x + 6, y + 3, 2, 2, mc);
    else if (m === "frown") { R(g, x + 5, y + 4, 2, 1, mc); R(g, x + 7, y + 5, 1, 1, mc); }
    else if (m === "press") R(g, x + 5, y + 4, 3, 1, mix(sd, D.n0, 0.35));
    else R(g, x + 5, y + 4, 3, 1, mc);
    if (P0.mous) { R(g, x + 4, y + 2, 5, 2, hb); R(g, x + 8, y + 3, 1, 2, hb); }
    if (P0.hat === "hard") {
      const hc = P0.hatCol || tri(mix(D.amber[1], D.paperD, 0.2));
      clip(g, x - 14, y - 22, 30, 16, () => { ell(g, x, y - 6, 10, 8, hc[1]); ell(g, x - 2, y - 9, 6, 4, hc[0]); R(g, x - 1, y - 14, 2, 8, hc[2]); });
      R(g, x - 10, y - 6, 21, 2, hc[1]); R(g, x + 9, y - 5, 5, 1, hc[2]); R(g, x - 10, y - 5, 21, 1, hc[2]);
    }
  };
  // side-view person facing +x (dir -1 flips), feet at (x, y). o: h, pal, legN/legF [thigh, shin] deg (+ forward), bend (deg),
  // reachN/reachF world points (IK) or armN/armF [upper, fore] deg, head {dx, dy, f}, t, ph, hipY (seated), thumbN.
  const figS = (g, x, y, o) => {
    const P0 = o.pal, k = (o.h || 100) / 100, dir = o.dir < 0 ? -1 : 1, X0 = Math.round(x);
    const [tl, tb, td] = P0.top, [pl, pb, pd] = P0.pants, [sl, sb, sd] = P0.skin;
    g.save(); g.translate(X0, 0); if (dir < 0) g.scale(-1, 1);
    const Lt = 24 * k, Ls = 23 * k, Lu = 16 * k, Lf = 15 * k, TL = 30 * k;
    const br = Math.sin((o.t || 0) * 1.7 + (o.ph || 0)) * 0.6;
    const lN = o.legN || [0, 0], lF = o.legF || [0, 0];
    const low = (l) => Lt * Math.cos(rad(l[0])) + Ls * Math.cos(rad(l[1]));
    const hipY = o.hipY !== undefined ? o.hipY : y - 3 * k - Math.max(low(lN), low(lF)) + (o.bob || 0);
    const bd = rad(o.bend || 0), ux = Math.sin(bd), uy = -Math.cos(bd), nx = -uy, ny = ux;
    const at = (a, b) => [ux * a + nx * b, hipY + uy * a + ny * b + br * clamp(a / TL, 0, 1)];
    const leg = (l, col, colD, shoe) => {
      const kx = Lt * Math.sin(rad(l[0])), ky = hipY + Lt * Math.cos(rad(l[0])), ax = kx + Ls * Math.sin(rad(l[1])), ay = ky + Ls * Math.cos(rad(l[1]));
      limb(g, 0, hipY, kx, ky, 9 * k, col); limb(g, kx, ky, ax, ay, 7.5 * k, col);
      seg(g, kx + 2.4 * k * Math.cos(rad(l[1])), ky - 2.4 * k * Math.sin(rad(l[1])), ax + 2.2 * k, ay - 2, Math.max(1, k), colD);
      const back = l[1] < -45, fx = back ? Math.sin(rad(l[1])) : 1, fy = back ? Math.cos(rad(l[1])) : 0;
      limb(g, ax - fx * 2 * k, ay - fy * 2 * k, ax + fx * 7 * k, ay + fy * 7 * k, 4.4 * k, shoe);
      R(g, ax - 1 * k, ay - 2 * k, 6 * k, 1, mix(shoe, D.n6, 0.3));
    };
    const sh = at(TL - 3 * k, 0);
    const arm = (spec, reach, col, colD, near) => {
      const [sx, sy] = sh; let ex, ey, h2x, h2y;
      if (reach) { [ex, ey, h2x, h2y] = ik2(sx, sy, (reach[0] - X0) * dir, reach[1], Lu, Lf + 2 * k, 1); }
      else { const a = spec || [6, 4]; ex = sx + Lu * Math.sin(rad(a[0])); ey = sy + Lu * Math.cos(rad(a[0])); h2x = ex + (Lf + 2 * k) * Math.sin(rad(a[1])); h2y = ey + (Lf + 2 * k) * Math.cos(rad(a[1])); }
      const fl = Math.hypot(h2x - ex, h2y - ey) || 1, cx = ex + ((h2x - ex) / fl) * Lf, cy = ey + ((h2y - ey) / fl) * Lf;
      if (near) { limb(g, sx, sy, ex, ey, 8.4 * k, colD); limb(g, ex, ey, cx, cy, 7.6 * k, colD); }
      limb(g, sx, sy, ex, ey, 7 * k, col); limb(g, ex, ey, cx, cy, 6.2 * k, col);
      if (near) seg(g, sx + 1.5, sy - 1, ex + 1.5, ey - 1, Math.max(1, 0.8 * k), tl);
      if (P0.cuff) limb(g, cx - ((h2x - ex) / fl) * 2 * k, cy - ((h2y - ey) / fl) * 2 * k, cx, cy, 6.6 * k, P0.cuff);
      ell(g, h2x, h2y, 2.8 * k, 3 * k, near ? sb : sd); if (near) R(g, h2x - 1, h2y - 2, 2, 1, sl);
      if (near && o.thumbN) { R(g, h2x - 1, h2y - 4 * k - 2, 2, 4 * k, sb); R(g, h2x - 1, h2y - 4 * k - 2, 1, 1, sl); }
      return [X0 + dir * h2x, h2y];
    };
    const hF = arm(o.armF, o.reachF, td, td, false);
    leg(lF, pd, mix(pd, D.n0, 0.3), mix(P0.shoe, D.n0, 0.3));
    const hem = 6 * k + (o.coat ? 10 * k : 0), cw = o.coat ? 1.5 * k : 0;
    const back = [at(TL - 1 * k, -7 * k), at(TL - 9 * k, -8.5 * k), at(6 * k, -7.5 * k), at(-hem, -7.5 * k - cw)];
    const front = [at(-hem, 7.5 * k + cw), at(6 * k, 7 * k), at(TL - 10 * k, 8 * k), at(TL - 1 * k, 6.5 * k)];
    poly(g, [...back, ...front], tb);
    poly(g, [...back, at(-hem, -3.5 * k), at(TL - 9 * k, -4 * k), at(TL - 1 * k, -3.5 * k)], td);
    seg(g, ...at(TL - 3 * k, 7 * k), ...at(-hem + 2 * k, 6.8 * k), Math.max(1, 1.2 * k), tl);
    if (P0.apron) { poly(g, [at(TL - 9 * k, 1 * k), at(TL - 9 * k, 8.3 * k), at(-hem - 8 * k, 8.3 * k), at(-hem - 8 * k, 1 * k)], P0.apron); }
    if (P0.vest) { const [vl, vb, vd] = P0.vest; poly(g, [at(TL - 2 * k, -6 * k), at(TL - 2 * k, 6 * k), at(TL - 9 * k, 7.6 * k), at(3 * k, 7.2 * k), at(3 * k, -7.2 * k), at(TL - 9 * k, -8 * k)], vb); poly(g, [at(TL - 2 * k, -6 * k), at(TL - 9 * k, -8 * k), at(3 * k, -7.2 * k), at(3 * k, -3 * k), at(TL - 2 * k, -2.5 * k)], vd); seg(g, ...at(11 * k, -7 * k), ...at(11 * k, 7.4 * k), 2 * k, D.cream); }
    if (P0.belt) seg(g, ...at(1 * k, -7.5 * k), ...at(1 * k, 7.5 * k), 2 * k, P0.belt);
    if (P0.collar) poly(g, [at(TL, 1 * k), at(TL + 1 * k, 6.5 * k), at(TL - 7 * k, 5 * k)], P0.collar);
    if (P0.btn) for (let i = 0; i < 4; i++) R(g, ...at(TL - 7 * k - i * 5 * k, 5.5 * k), 1, 1, P0.btn);
    leg(lN, pb, pd, P0.shoe);
    const hd = o.head || {}, [hcx, hcy] = at(TL + 10 * k, 2 * k);
    headS(g, P0, hcx + (hd.dx || 0), hcy + (hd.dy || 0), hd.f || {}, o.t || 0, o.ph || 0);
    const hN = arm(o.armN, o.reachN, tb, td, true);
    g.restore();
    return { hand: hN, handF: hF, head: [X0 + dir * hcx, hcy] };
  };
  // front-view person, feet at (x, y). o: k, pal {skin, hair, top, pants, shoe, style}, adult, armL/armR [upper, fore] deg (outward +)
  // or reachL/reachR world points, look [-1..1, -1..1], f {mouth, brow, eye}, bob, t, ph
  const figF = (g, x, y, o) => {
    const P0 = o.pal, k = o.k || 1, X = x, Y = y + (o.bob || 0) * k, ad = !!o.adult;
    const [sl, sb, sd] = P0.skin, [tl, tb, td] = P0.top, [pl, pb, pd] = P0.pants, [hl, hb] = P0.hair, hd = mix(hb, D.n0, 0.4);
    const LL = ad ? 34 : 15, TL = ad ? 28 : 16, HR0 = ad ? 8.5 : 10, yS = -LL - 4 - TL, hy = yS - HR0 + 1, AL = ad ? 13 : 9;
    const r = (a, b, w, h, col) => R(g, X + a * k, Y + b * k, Math.max(1, w * k), Math.max(1, h * k), col);
    const e = (a, b, rx, ry, col) => ell(g, X + a * k, Y + b * k, rx * k, ry * k, col);
    const br = Math.sin((o.t || 0) * 1.7 + (o.ph || 0)) * 0.4;
    // legs + shoes
    const legC = ad ? [pb, pd] : [sb, sd];
    r(-6, -LL, 5, LL - 1, legC[1]); r(1, -LL, 5, LL - 1, legC[0]); r(-1, -LL, 1, LL - 1, mix(legC[1], D.n0, 0.2));
    e(-4, -1, 4, 2, P0.shoe); e(4, -1, 4, 2, P0.shoe); r(-7, 0, 6, 1, mix(P0.shoe, D.n0, 0.4)); r(1, 0, 6, 1, mix(P0.shoe, D.n0, 0.4));
    // hips / shorts
    r(-8, -LL - 6, 16, ad ? 8 : 10, pb); r(-8, -LL - 6, 16, 1, pl); r(5, -LL - 6, 3, ad ? 8 : 10, pd); if (!ad) r(-0.5, -LL - 1, 1, 5, pd);
    // torso
    const T0 = yS + br;
    poly(g, [[X - 10 * k, Y + T0 * k], [X + 10 * k, Y + T0 * k], [X + 9 * k, Y + (-LL - 4) * k], [X - 9 * k, Y + (-LL - 4) * k]], tb);
    poly(g, [[X - 10 * k, Y + T0 * k], [X - 7 * k, Y + T0 * k], [X - 6.5 * k, Y + (-LL - 4) * k], [X - 9 * k, Y + (-LL - 4) * k]], tl);
    poly(g, [[X + 6 * k, Y + T0 * k], [X + 10 * k, Y + T0 * k], [X + 9 * k, Y + (-LL - 4) * k], [X + 6 * k, Y + (-LL - 4) * k]], td);
    if (P0.apron) { r(-7, T0 + 6, 14, TL - 2 + 10, P0.apron); r(-7, T0 + 6, 14, 1, mix(P0.apron, D.n0, 0.15)); r(-1, T0 + 12, 6, 4, mix(P0.apron, D.paperD, 0.5)); }
    e(0, T0, 4, 2, sd);
    // arms
    const arm = (side, spec, reach) => {
      const sx = X + side * 9 * k, sy = Y + (T0 + 3) * k; let ex, ey, h2x, h2y;
      if (reach) [ex, ey, h2x, h2y] = ik2(sx, sy, reach[0], reach[1], AL * k, AL * k, side > 0 ? -1 : 1);
      else { const a = spec || [8, 4]; ex = sx + side * Math.sin(rad(a[0])) * AL * k; ey = sy + Math.cos(rad(a[0])) * AL * k; h2x = ex + side * Math.sin(rad(a[1])) * AL * k; h2y = ey + Math.cos(rad(a[1])) * AL * k; }
      limb(g, sx, sy, ex, ey, 4.6 * k, side < 0 ? tl : tb); limb(g, ex, ey, h2x, h2y, 3.8 * k, ad ? (side < 0 ? tl : tb) : sb);
      ell(g, h2x, h2y, 2.4 * k, 2.4 * k, sb); R(g, h2x - 1, h2y - 1, 1, 1, sl);
      return [h2x, h2y];
    };
    const up = (o.armL && o.armL[0] > 90) || (o.armR && o.armR[0] > 90);
    let hL, hR; if (!up) { hL = arm(-1, o.armL, o.reachL); hR = arm(1, o.armR, o.reachR); }
    // head
    r(-2, T0 - 3, 5, 3, sd);
    e(0, hy, HR0, HR0, sb); r(HR0 - 4, hy - 2, 3, 9, sd); r(-HR0 + 1, hy + 1, 2, 4, sl);
    e(-HR0, hy + 1, 2, 3, sb); e(HR0, hy + 1, 2, 3, sd);
    const st = P0.style || "kid";
    if (st === "pony" || st === "long") { r(-HR0 - 2, hy - 4, 4, 14, hb); r(HR0 - 2, hy - 4, 4, 14, hb); if (st === "pony") e(HR0 + 3, hy - 4, 3, 6, hb); }
    e(0, hy - 6, HR0 + 0.5, 6, hb);
    if (st === "kid" || st === "pony") for (const [dx, dy, rr] of [[-7, -4, 3.5], [7, -4, 3.5], [-3, -9, 4], [3, -9, 4], [0, -10, 3]]) e(dx, hy + dy, rr, rr, hb);
    for (const [dx, dy] of [[-6, -10], [-1, -12], [4, -10]]) r(dx, hy + dy, 3, 1, hl);
    r(-6, hy - 2, 4, 1, hd); r(1, hy - 2, 5, 1, hd);
    if (P0.band) { r(-HR0 - 0.5, hy - 7, 2 * HR0 + 1, 3, P0.band); r(-HR0 - 0.5, hy - 7, 2 * HR0 + 1, 1, mix(P0.band, D.cream, 0.4)); }
    const f = o.f || {}, lk = o.look || [0, 0], lx = Math.round(clamp(lk[0], -1, 1)), ly = Math.round(clamp(lk[1], -1, 1));
    const blink = PX.blink((o.t || 0) + (o.ph || 0), 3.3, 0.045);
    for (const ex2 of [-3.5, 3.5]) {
      if (f.eye === "happy") { r(ex2 - 1.5, hy + 2, 1, 1, D.n0); r(ex2 - 0.5, hy + 1, 1, 1, D.n0); r(ex2 + 0.5, hy + 2, 1, 1, D.n0); continue; }
      if (blink) { r(ex2 - 1.5, hy + 2, 3, 1, mix(sd, D.n0, 0.3)); continue; }
      r(ex2 - 1.5, hy + 0.5, 3, 3, D.cream); R(g, X + (ex2 - 1 + lx * 0.6) * k, Y + (hy + 1 + ly * 0.6) * k, 2, 2, D.n0);
      r(ex2 - 1.5, hy - 1.5 - (f.brow === "up" ? 1 : 0), 3, 1, hd);
    }
    r(-6.5, hy + 4, 2, 1, mix(sb, D.rose[1], 0.5)); r(4.5, hy + 4, 2, 1, mix(sb, D.rose[1], 0.5));
    const mc = mix(sd, D.rust[2], 0.55), m = f.mouth || "smile";
    if (m === "grin") { r(-2.5, hy + 5, 5, 2, mc); r(-1.5, hy + 5, 3, 1, D.cream); r(-3.5, hy + 4, 1, 1, mc); r(2.5, hy + 4, 1, 1, mc); }
    else if (m === "o") r(-1, hy + 5, 2, 2, mc);
    else if (m === "flat") r(-1.5, hy + 5, 3, 1, mc);
    else { r(-2, hy + 6, 4, 1, mc); r(-3, hy + 5, 1, 1, mc); r(2, hy + 5, 1, 1, mc); }
    if (up) { hL = arm(-1, o.armL, o.reachL); hR = arm(1, o.armR, o.reachR); }
    return { hL, hR, head: [X, Y + hy * k] };
  };

  // =====================================================================================================
  // string_circle: a sunny sandy schoolyard, seen from slightly above. A child has pinned a string to a peg in the sand and
  // tied a stick to the other end; o.walk (0.5) they start walking around, the stick scratching a circle that closes at
  // about d*0.75. Two friends watch from the back, one points, both cheer when it closes. Footprints follow the child.
  K.string_circle = (o) => {
    const KY = 0.42, RS = 128, CX = 336, CY = 254, TH0 = -Math.PI / 2;
    const KID = { skin: SK.warm, hair: HR.brown, style: "kid", top: tri(mix(D.rust[1], D.paperD, 0.3)), pants: tri(mix(D.steel[2], D.n3, 0.15), 0.22, 0.4), shoe: mix(D.cream, D.paperD, 0.35) };
    const F1 = { skin: SK.deep, hair: HR.black, style: "kid", top: tri(mix(D.moss[1], D.paperD, 0.3)), pants: tri(mix(D.teal[2], D.n2, 0.2)), shoe: D.cream };
    const F2 = { skin: SK.fair, hair: HR.auburn, style: "pony", top: tri(mix(D.amber[1], D.paperD, 0.35)), pants: tri(mix(D.steel[1], D.n3, 0.3)), shoe: mix(D.rose[1], D.n3, 0.3) };
    const SAND = mix(D.paper, D.amber[1], 0.25), SAND2 = mix(SAND, D.rust[2], 0.2), SANDL = mix(SAND, D.cream, 0.4);
    const SPK = []; { const r = PX.rnd(11); for (let i = 0; i < 260; i++) SPK.push([r() * 700 - 30, 128 + r() * 240, r()]); }
    const SCUF = []; { const r = PX.rnd(12); for (let i = 0; i < 14; i++) SCUF.push([r() * 640, 150 + r() * 200, r()]); }
    const NST = 18;
    const gp = (th, rr) => [CX + Math.cos(th) * rr, CY + Math.sin(th) * rr * KY];
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 6), tW = T("walk", 0.5), dur = d * (0.75 - 0.5 / 6), tEnd = tW + dur;
      const pe = E((t - tW) / dur, "io"), th = TH0 - TAU * pe;
      const mv = t > tW && t < tEnd ? clamp(Math.min((t - tW) / 0.35, (tEnd - t) / 0.35), 0, 1) : 0;
      const done = t >= tEnd ? P(t, tEnd, 0.5) : 0, phS = pe * NST * Math.PI;
      // ---- far: sky + school building ----
      PX.par(g, c, 0.5, () => {
        PX.vgrad(g, -40, -40, 720, 70, mix(D.steel[0], D.cream, 0.4), mix(D.cream, D.lamp, 0.3), 5);
        const WL = mix(D.paper, D.paperD, 0.25), WD = mix(D.paperD, D.n4, 0.3), RF = tri(mix(D.rust[2], D.paperD, 0.25), 0.25, 0.35);
        R(g, -40, 22, 720, 96, WL);
        R(g, -40, 12, 720, 11, RF[1]); R(g, -40, 12, 720, 2, RF[0]); for (let x = -40; x < 680; x += 6) R(g, x, 14, 1, 8, RF[2]);
        R(g, -40, 23, 720, 3, mix(WL, D.n4, 0.35));
        for (let i = 0; i < 11; i++) {
          const x = -24 + i * 64; if (i === 5) continue;
          for (const y of [34, 72]) {
            R(g, x, y, 36, 26, mix(D.n6, D.paperD, 0.5)); R(g, x + 2, y + 2, 32, 22, mix(D.teal[2], D.n3, 0.35));
            A(g, 0.35, () => poly(g, [[x + 6, y + 24], [x + 16, y + 2], [x + 22, y + 2], [x + 12, y + 24]], mix(D.teal[0], D.cream, 0.4)));
            R(g, x + 17, y + 2, 1, 22, mix(D.n6, D.paperD, 0.5)); R(g, x + 2, y + 12, 32, 1, mix(D.n6, D.paperD, 0.5)); R(g, x - 2, y + 26, 40, 2, mix(WL, D.cream, 0.5)); R(g, x - 2, y + 28, 40, 1, mix(WL, D.n4, 0.3));
          }
        }
        const dw = wood(0.15, mix(D.teal[2], D.n3, 0.2)); R(g, 296, 62, 34, 56, mix(WL, D.n5, 0.3)); R(g, 299, 65, 28, 53, dw[1]); R(g, 312, 65, 1, 53, dw[2]); R(g, 299, 65, 28, 1, dw[0]); R(g, 308, 92, 2, 3, D.amber[1]); R(g, 316, 92, 2, 3, D.amber[1]);
        R(g, 286, 56, 54, 4, mix(RF[1], D.n3, 0.2));
        R(g, -40, 106, 720, 12, WD); R(g, -40, 106, 720, 1, mix(WD, D.cream, 0.3));
        A(g, 0.12, () => { for (let i = 0; i < 6; i++) poly(g, [[i * 130 - 40, 26], [i * 130 + 10, 26], [i * 130 + 60, 118], [i * 130 + 10, 118]], D.lamp); });
      });
      // ---- mid: kerb, swings, tree ----
      PX.par(g, c, 0.75, () => {
        R(g, -40, 116, 720, 12, mix(D.moss[2], D.n3, 0.2)); for (let x = -40; x < 680; x += 3) R(g, x, 114 + ((x * 7) % 4), 2, 4, mix(D.moss[1], D.n3, 0.25));
        R(g, -40, 125, 720, 4, mix(D.paperD, D.n5, 0.3)); R(g, -40, 125, 720, 1, mix(D.paper, D.cream, 0.3));
        // swing frame + swinging kid (right back)
        const sc = mix(D.steel[2], D.n3, 0.3);
        seg(g, 506, 134, 520, 62, 3, sc); seg(g, 534, 134, 520, 62, 3, sc); seg(g, 596, 134, 610, 62, 3, sc); seg(g, 624, 134, 610, 62, 3, sc); R(g, 518, 60, 94, 3, sc); R(g, 518, 60, 94, 1, mix(sc, D.cream, 0.3));
        const sa = Math.sin(t * 2.2) * 0.55, px2 = 565 + Math.sin(sa) * 44, py2 = 62 + Math.cos(sa) * 44;
        PX.line(g, 560, 62, px2 - 4, py2, mix(D.n5, D.paperD, 0.3)); PX.line(g, 570, 62, px2 + 4, py2, mix(D.n5, D.paperD, 0.3));
        R(g, px2 - 6, py2, 12, 2, mix(D.rust[2], D.n2, 0.3));
        const kc = tri(mix(D.steel[1], D.paperD, 0.25)), ks = SK.med;
        R(g, px2 - 3, py2 - 12, 7, 12, kc[1]); R(g, px2 - 3, py2 - 12, 2, 12, kc[0]); ell(g, px2, py2 - 16, 4, 4, ks[1]); ell(g, px2 - 1, py2 - 19, 4, 2.5, HR.black[1]);
        seg(g, px2, py2 + 1, px2 + 8 * Math.cos(sa + 0.4), py2 + 9, 3, mix(D.n3, D.steel[2], 0.3));
        A(g, 0.25, () => ell(g, px2 + 6, 136, 8, 2, BLK));
        // tree (right) with swaying canopy
        const tk = wood(0.3); R(g, 586, 30, 12, 104, tk[1]); R(g, 586, 30, 3, 104, tk[0]); R(g, 595, 30, 3, 104, tk[2]); ell(g, 592, 133, 12, 3, mix(tk[2], D.n0, 0.3));
        const lc = [mix(D.moss[2], D.n2, 0.35), mix(D.moss[2], D.n3, 0.1), mix(D.moss[1], D.lamp, 0.25)];
        const blobs = [[560, 8, 34], [610, -4, 40], [650, 22, 30], [585, 34, 24], [530, 22, 22], [640, 50, 20]];
        for (let j = 0; j < 3; j++) for (const [bx, by, rr] of blobs) { const sw = Math.sin(t * 0.9 + bx * 0.05) * 1.5; ell(g, bx + sw - j * rr * 0.18, by - j * rr * 0.22, rr * (1 - j * 0.32), rr * (0.8 - j * 0.25), lc[j]); }
        // sparrow on the kerb: pecks, hops twice
        const hop = t > d * 0.45 ? Math.max(0, Math.sin(clamp((t - d * 0.45) / 0.5, 0, 2) * Math.PI)) * 5 : 0, bxp = 70 + (t > d * 0.45 ? Math.min(1, (t - d * 0.45) / 1) * 12 : 0), pk = PX.blink(t, 0.8, 0.3) && !hop;
        const bc = mix(D.rust[2], D.paperD, 0.4);
        R(g, bxp, 118 - hop, 7, 4, bc); R(g, bxp + 1, 119 - hop, 4, 2, mix(bc, D.cream, 0.3)); R(g, bxp - 2, 118 - hop, 2, 2, mix(bc, D.n1, 0.3));
        R(g, bxp + 6, 116 - hop + (pk ? 3 : 0), 3, 3, mix(bc, D.n2, 0.4)); R(g, bxp + 9, 117 - hop + (pk ? 3 : 0), 1, 1, D.amber[2]); R(g, bxp + 3, 122 - hop, 1, 2, D.n3);
      });
      // ---- sand yard ----
      R(g, -40, 128, 720, 280, SAND);
      A(g, 0.35, () => PX.vgrad(g, -40, 128, 720, 240, mix(SAND, D.n4, 0.25), mix(SAND, D.cream, 0.15), 6));
      for (const [x, y, k] of SPK) R(g, x, y, k > 0.85 ? 2 : 1, 1, k > 0.5 ? SANDL : SAND2);
      for (const [x, y, k] of SCUF) A(g, 0.35, () => { ell(g, x, y, 6 + k * 8, 1.5, SAND2); R(g, x - 4, y - 2, 8, 1, SANDL); });
      // dappled tree shadow (sways)
      A(g, 0.09, () => { for (let i = 0; i < 14; i++) { const sw = Math.sin(t * 0.9 + i) * 2; ell(g, 500 + hash(i, 3) * 150 + sw, 136 + hash(i, 4) * 34, 8 + hash(i, 5) * 14, 3 + hash(i, 6) * 3, BLK); } });
      // ---- circle: groove, footprints ----
      const grooveC = mix(SAND2, D.n3, 0.35);
      if (pe > 0) {
        const a0 = th, a1 = TH0;
        ring(g, CX, CY + 2, RS, RS * KY, SANDL, a0, a1); ring(g, CX, CY + 1, RS + 1, RS * KY, SANDL, a0, a1); ring(g, CX, CY, RS, RS * KY, grooveC, a0, a1); ring(g, CX, CY + 1, RS, RS * KY, grooveC, a0, a1); ring(g, CX, CY, RS + 1, RS * KY, mix(grooveC, SAND2, 0.4), a0, a1); ring(g, CX, CY - 1, RS, RS * KY, mix(grooveC, SAND2, 0.5), a0, a1);
      }
      for (let i = 0; i < NST; i++) {
        const ta = TH0 - (TAU * (i + 0.6)) / NST; if (ta < th) break;
        const [fx, fy] = gp(ta, RS + 17 + (i % 2 ? 4 : -4)); R(g, fx - 2, fy, 4, 1, SAND2); R(g, fx - 1, fy - 1, 2, 1, SAND2); R(g, fx - 2, fy + 1, 4, 1, SANDL);
      }
      // ---- people (depth sorted) ----
      const tip = gp(th, RS), feet = gp(th, RS + 17), dir = Math.sin(th) >= 0 ? 1 : -1;
      const hand = [tip[0] + Math.cos(th) * 9 + dir * 3, tip[1] + Math.sin(th) * 9 * KY - 33];
      const jmp = done > 0 ? Math.abs(Math.sin((t - tEnd) * 7)) * 3 * Math.max(0, 1 - (t - tEnd) / 1.2) * (84 / 100) : 0;
      const tp = done > 0 ? [lerp(tip[0], feet[0] + dir * 22, done), lerp(tip[1], feet[1] - 112, done) - jmp] : tip;
      const hh = done > 0 ? [lerp(hand[0], feet[0] + dir * 12, done), lerp(hand[1], feet[1] - 86, done) - jmp] : hand;
      const tie = [tp[0] + (hh[0] - tp[0]) * 0.22, tp[1] + (hh[1] - tp[1]) * 0.22];
      const peg = () => {
        shadow(g, CX + 4, CY + 2, 5, 2, 0.3);
        const pw = wood(0.1); R(g, CX - 2, CY - 12, 4, 13, pw[1]); R(g, CX - 2, CY - 12, 1, 13, pw[0]); R(g, CX - 3, CY - 14, 6, 3, pw[2]); R(g, CX - 3, CY - 14, 6, 1, pw[0]); ring(g, CX, CY - 7, 3, 1, mix(D.cream, D.paperD, 0.2));
        PX.line(g, CX, CY - 7, tie[0], tie[1], mix(D.cream, D.paperD, 0.15)); A(g, 0.5, () => PX.line(g, CX, CY - 6, tie[0], tie[1] + 1, D.paperD));
        A(g, 0.25, () => PX.line(g, CX + 3, CY - 2, tie[0] + 6, tie[1] + 9, BLK));
      };
      const friends = () => {
        const look = (fx) => [clamp((feet[0] - fx) / 70, -1, 1), clamp((feet[1] - 170) / 60, -1, 1)];
        const pt = t > d * 0.3 && t < tEnd + 0.2 ? P(t, d * 0.3, 0.4) * (1 - P(t, tEnd, 0.3)) : 0;
        const cheer = done > 0 ? done : 0, jump1 = cheer > 0 ? Math.abs(Math.sin((t - tEnd) * 8)) * 3 * Math.max(0, 1 - (t - tEnd) / 1.5) : 0;
        for (const [fx, fy] of [[78, 210], [128, 202]]) { shadow(g, fx + 9, fy + 1, 14, 3, 0.25); A(g, 0.18, () => poly(g, [[fx - 6, fy], [fx + 8, fy + 1], [fx + 44, fy + 18], [fx + 32, fy + 16]], BLK)); }
        { const bp = tri(mix(D.steel[2], D.paperD, 0.3), 0.25, 0.4); shadow(g, 46, 226, 12, 3, 0.3); R(g, 34, 208, 20, 18, bp[1]); R(g, 34, 208, 4, 18, bp[0]); R(g, 50, 208, 4, 18, bp[2]); R(g, 36, 216, 16, 6, mix(bp[1], D.n2, 0.25)); R(g, 36, 216, 16, 1, bp[0]); ring(g, 44, 208, 5, 4, bp[2], Math.PI, TAU); R(g, 43, 218, 2, 2, D.amber[1]); }
        figF(g, 78, 210, { pal: F2, k: 1.25, t, ph: 1.7, look: look(78), bob: -jump1 * 0.8, f: { mouth: cheer ? "grin" : "smile" },
          armL: cheer ? [135, 165] : [15, 60 + Math.sin(t * 3) * 3], armR: cheer ? [135, 165] : [15, 60] });
        figF(g, 128, 202, { pal: F1, k: 1.32, t, ph: 0, look: look(128), bob: -jump1, f: { mouth: cheer ? "grin" : pt > 0.5 ? "o" : "smile", eye: cheer > 0.6 ? "happy" : undefined },
          armL: cheer ? [135, 165] : [8, 4], armR: cheer ? [135, 165] : [lerp(8, 70, pt), lerp(4, 85, pt)] });
      };
      const kid = () => {
        const [lN, lF] = [wl(phS, mv), wl(phS + Math.PI, mv)];
        const bob = -Math.abs(Math.cos(phS)) * 1.5 * mv;
        const sx = 0.55, sy = 0.25;
        A(g, 0.28, () => { poly(g, [[feet[0] - 7, feet[1]], [feet[0] + 7, feet[1] + 1], [feet[0] + 9 + 80 * sx, feet[1] + 80 * sy + 2], [feet[0] - 4 + 80 * sx, feet[1] + 80 * sy - 1]], BLK); ell(g, feet[0], feet[1] + 1, 11, 3, BLK); });
        figS(g, feet[0], feet[1], { pal: KID, h: 84, dir, t, ph: 0.4, legN: lN, legF: lF, bob: bob - (done > 0 ? Math.abs(Math.sin((t - tEnd) * 7)) * 3 * Math.max(0, 1 - (t - tEnd) / 1.2) : 0), bend: 10 * (1 - done), reachN: done > 0 ? [lerp(hand[0], feet[0] + dir * 12, done), lerp(hand[1], feet[1] - 86, done)] : hand,
          armF: done > 0 ? [lerp(10, 165, done), lerp(10, 175, done)] : [-wl(phS, mv)[0] * 0.8 - 4, -wl(phS, mv)[0] * 0.8 - 14],
          head: { f: done > 0.3 ? { eye: "happy", mouth: "grin" } : t < tW ? { eye: "down", mouth: "smile" } : { eye: "down", mouth: "press", brow: "firm" } } });
        // the stick: from the hand to the tip (stays in the hand after closing, tip lifts)
        seg(g, hh[0], hh[1] - 4, tp[0], tp[1], 2.5, wood(0.05)[1]); PX.line(g, hh[0] - 1, hh[1] - 4, tp[0] - 1, tp[1], wood(0.05)[0]);
        ell(g, hh[0], hh[1], 2.6, 2.8, KID.skin[1]); R(g, hh[0] - 1, hh[1] - 2, 2, 1, KID.skin[0]);
      };
      friends();
      if (Math.sin(th) < 0) { kid(); peg(); } else { peg(); kid(); }
      // sand flicks from the scratching tip
      if (mv > 0) for (let i = 0; i < 6; i++) { const k = frac(t * 2.6 + i / 6), vx = -dir * (4 + i), x = tip[0] + vx * k * 3, y = tip[1] - Math.sin(k * Math.PI) * (4 + i % 3 * 2); A(g, (1 - k) * mv, () => R(g, x, y, 1, 1, i % 2 ? SANDL : SAND2)); }
      // closing puff of dust
      if (t > tEnd && t < tEnd + 1.2) { const k = (t - tEnd) / 1.2; for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU; A(g, (1 - k) * 0.5, () => ell(g, tip[0] + Math.cos(a) * k * 14, tip[1] + Math.sin(a) * k * 5 - k * 4, 2 + k * 3, 1 + k * 2, SANDL)); } }
      // ---- foreground: bucket + spade, grass edge ----
      PX.par(g, c, 1.15, () => {
        const bk = tri(mix(D.teal[1], D.paperD, 0.25), 0.25, 0.4);
        shadow(g, 86, 342, 22, 5, 0.3);
        poly(g, [[48, 312], [82, 312], [78, 342], [52, 342]], bk[1]); poly(g, [[48, 312], [56, 312], [57, 342], [52, 342]], bk[0]); poly(g, [[74, 312], [82, 312], [78, 342], [74, 342]], bk[2]);
        ell(g, 65, 312, 17, 4, bk[2]); ell(g, 65, 312, 15, 3, mix(SAND2, D.n2, 0.3)); ring(g, 65, 304, 16, 10, mix(D.n5, D.paperD, 0.3), Math.PI, TAU);
        const sp = tri(mix(D.rust[1], D.paperD, 0.2)); seg(g, 100, 300, 112, 344, 3, wood(0.1)[1]); poly(g, [[106, 336], [120, 334], [124, 352], [110, 356]], sp[1]); R(g, 108, 338, 3, 12, sp[0]);
        for (const [cx0, n] of [[520, 14], [600, 18], [-10, 10]]) for (let i = 0; i < n; i++) { const x0 = cx0 + i * 3, a = -1.57 + (i - n / 2) * 0.09 + Math.sin(t * 1.3 + i * 0.6) * 0.06, L = 16 + ((i * 7) % 11) + (n / 2 - Math.abs(i - n / 2)) * 1.5; seg(g, x0, 366, x0 + Math.cos(a) * L, 366 + Math.sin(a) * L, 2, i % 3 ? mix(D.moss[2], D.n2, 0.25) : mix(D.moss[1], D.lamp, 0.3)); }
      });
      PX.particles(g, 21, 26, t, [0, 30, 640, 300], { vx: 2, vy: -1, col: D.lamp, a: 0.45, tw: 1.4 });
      A(g, 0.1, () => poly(g, [[-40, -40], [300, -40], [-40, 280]], D.lamp));
      PX.vignette(g, 0.4);
    };
  };

  // =====================================================================================================
  // pizza_order: a warm pizza shop at evening. A customer (left) looks up at a chalk menu board showing one large pizza and
  // two medium ones as simple circles. Two medium boxes and one big box sit on the counter; o.open (2.5) their lids swing open
  // one after another (medium, medium, big) and the customer looks down at them. Box sides read "12 IN", "12 IN", "18 IN".
  // The cook at the oven end of the counter presents them; the customer stands by the counter end.
  K.pizza_order = (o) => {
    const KY = 0.42, KV = 0.72, PHI = rad(80);
    const BX = [{ x: 150, w: 96, lab: "12 IN", dl: 0 }, { x: 258, w: 96, lab: "12 IN", dl: 0.35 }, { x: 368, w: 144, lab: "18 IN", dl: 0.75 }];
    const YF = 287, FH = 12, CT = 226, CF = 300, FL = 342, CE = 120;
    const CUS = { skin: SK.fair, hair: HR.brown, style: "short", top: tri(mix(D.steel[2], D.paperD, 0.3), 0.24, 0.42), pants: tri(mix(D.n3, D.steel[2], 0.25), 0.2, 0.4), shoe: mix(D.n2, D.rust[2], 0.3), collar: mix(D.cream, D.paperD, 0.3) };
    const COOK = { skin: SK.med, hair: HR.black, style: "short", top: tri(mix(D.cream, D.paperD, 0.2), 0.3, 0.3), pants: tri(D.n3), shoe: D.n2, apron: mix(D.rust[1], D.paperD, 0.35), band: mix(D.rust[2], D.n2, 0.2) };
    const KR = tri(mix(D.paperD, D.amber[2], 0.3), 0.25, 0.35);
    const PEP = []; { const r = PX.rnd(41); for (let i = 0; i < 12; i++) PEP.push([0.15 + r() * 0.7, r() * TAU]); }
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 7), tO = T("open", 2.5);
      const fire = 0.85 + 0.15 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1);
      const opened = BX.map((b) => E((t - tO - b.dl) / 0.55, "back"));
      // ---- back wall ----
      PX.par(g, c, 0.7, () => {
        const PL = mix(D.paperD, D.rust[2], 0.3);
        PX.vgrad(g, -40, -40, 720, 200, mix(PL, D.n1, 0.55), mix(PL, D.lampD, 0.2), 7);
        R(g, -40, -40, 720, 46, mix(D.n1, D.rust[2], 0.3)); for (let x = -40; x < 680; x += 80) { R(g, x, -40, 14, 50, mix(D.n1, D.rust[2], 0.2)); R(g, x, 4, 14, 2, mix(D.n0, D.rust[2], 0.2)); }
        R(g, -40, 6, 720, 3, mix(D.n0, D.rust[2], 0.25));
        const TI = mix(D.cream, D.paperD, 0.4);
        R(g, -40, 152, 720, 140, TI);
        for (let y = 152; y < 292; y += 7) { R(g, -40, y, 720, 1, mix(TI, D.n5, 0.35)); for (let x = -40 + ((y / 7) % 2) * 7; x < 680; x += 14) R(g, x, y, 1, 7, mix(TI, D.n5, 0.3)); }
        R(g, -40, 150, 720, 3, mix(D.teal[2], D.n2, 0.2));
        A(g, 0.4, () => PX.vgrad(g, -40, 152, 720, 140, mix(D.lamp, TI, 0.5), mix(D.n2, TI, 0.3), 6));
        R(g, -40, 286, 720, 6, mix(D.teal[2], D.n2, 0.35));
        // floor (seen at the left, beside the counter end)
        for (let i = 0, y = 292; y < 380; i++) { const h = 4 + i * 2; for (let x = -40, j = 0; x < 680; x += 16, j++) R(g, x, y, 16, h, (i + j) % 2 ? mix(D.cream, D.paperD, 0.45) : mix(D.teal[2], D.n2, 0.35)); y += h; }
        A(g, 0.35, () => PX.vgrad(g, -40, 292, 720, 70, D.n1, mix(D.n3, D.lampD, 0.3), 4));
        // window (left) with dusk street and passing car light
        R(g, 12, 26, 96, 110, mix(D.n2, D.rust[2], 0.3));
        PX.vgrad(g, 16, 30, 88, 102, mix(D.steel[2], D.n2, 0.3), mix(D.lampD, D.steel[2], 0.5), 5);
        for (const [bx, bw, bh] of [[16, 22, 50], [40, 18, 64], [60, 26, 44], [88, 16, 58]]) { R(g, bx, 132 - bh, bw, bh, mix(D.n2, D.steel[2], 0.25)); for (let wy = 136 - bh; wy < 128; wy += 6) for (let wx = bx + 3; wx < bx + bw - 3; wx += 5) if (hash(wx, wy) > 0.55) R(g, wx, wy, 2, 2, mix(D.lamp, D.amber[1], 0.3)); }
        const cp = frac(t / 3.4); if (cp < 0.5) { const cx2 = 10 + cp * 2 * 110; R(g, cx2 - 12, 124, 18, 6, mix(D.n1, D.steel[2], 0.3)); R(g, cx2 + 5, 126, 2, 2, D.lamp); PX.glow(g, cx2 + 8, 127, 12, D.lamp, 0.3); }
        R(g, 59, 30, 2, 102, mix(D.n2, D.rust[2], 0.3)); R(g, 16, 80, 88, 2, mix(D.n2, D.rust[2], 0.3)); R(g, 8, 134, 104, 4, mix(D.paperD, D.n3, 0.2));
        // shelf with jars + basil
        const sh = wood(0.2); R(g, 120, 118, 80, 4, sh[1]); R(g, 120, 118, 80, 1, sh[0]); R(g, 124, 122, 3, 6, sh[2]); R(g, 193, 122, 3, 6, sh[2]);
        for (const [jx, jh, col] of [[124, 16, D.rust[1]], [138, 12, D.amber[1]], [150, 20, D.moss[1]], [164, 14, D.paperD]]) { R(g, jx, 118 - jh, 10, jh, mix(D.glass, D.n4, 0.35)); R(g, jx + 1, 118 - jh + 4, 8, jh - 5, mix(col, D.n3, 0.25)); R(g, jx, 118 - jh - 2, 10, 2, mix(D.n5, D.paperD, 0.3)); R(g, jx + 1, 118 - jh + 3, 1, jh - 5, mix(D.cream, D.glass, 0.4)); }
        R(g, 180, 108, 12, 10, mix(D.rust[2], D.paperD, 0.3)); for (let i = 0; i < 7; i++) ell(g, 182 + (i % 4) * 3, 103 - Math.floor(i / 4) * 4 + Math.sin(t + i) * 0.5, 3, 2, i % 2 ? D.moss[1] : D.moss[2]);
        // chalk menu board: one big pizza | two medium pizzas
        const fr = wood(0.15); R(g, 214, 16, 236, 100, fr[2]); R(g, 216, 18, 232, 96, fr[1]); R(g, 216, 18, 232, 1, fr[0]);
        const SL = mix(D.n2, D.moss[2], 0.25); R(g, 221, 23, 222, 86, SL);
        A(g, 0.1, () => { ell(g, 300, 60, 60, 26, D.cream); ell(g, 400, 80, 40, 18, D.cream); });
        const CH = mix(D.cream, SL, 0.12), CHd = mix(D.cream, SL, 0.45);
        for (let i = 0; i < 9; i++) { const x0 = 280 + i * 12; for (let j = 0; j < 9; j++) R(g, x0 + j, 31 + Math.round(Math.sin(j * 0.9 + i * 1.7) * 1.5), 1, 1, CHd); }
        const chalkPizza = (cx, cy, rr) => { ring(g, cx, cy, rr, rr, CH); ring(g, cx, cy, rr - 1, rr - 1, CH); ring(g, cx, cy, rr - 4, rr - 4, CHd, 0, TAU, [3, 2]);
          for (let i = 0; i < 3; i++) { const a = (i / 3) * Math.PI + 0.3; PX.line(g, cx - Math.cos(a) * (rr - 2), cy - Math.sin(a) * (rr - 2), cx + Math.cos(a) * (rr - 2), cy + Math.sin(a) * (rr - 2), CHd); }
          for (const [rf, af] of [[0.5, 0.6], [0.6, 2.4], [0.45, 4.1], [0.3, 5.3], [0.65, 3.4]]) ring(g, cx + Math.cos(af) * rr * rf, cy + Math.sin(af) * rr * rf, rr * 0.12 + 1, rr * 0.12 + 1, CH); };
        chalkPizza(266, 68, 30);
        for (let y = 40; y < 100; y += 4) R(g, 321, y, 1, 2, CHd);
        chalkPizza(360, 70, 20); chalkPizza(412, 70, 20);
        R(g, 240, 102, 52, 1, CHd); R(g, 344, 98, 86, 1, CHd);
        R(g, 230, 104, 6, 2, D.cream); R(g, 432, 104, 4, 2, mix(D.rust[0], D.cream, 0.4));
        // wall clock (no numbers)
        PX.circle(g, 474, 52, 12, mix(D.n2, D.rust[2], 0.3)); PX.circle(g, 474, 52, 10, mix(D.cream, D.paperD, 0.2));
        for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; R(g, 474 + Math.cos(a) * 8, 52 + Math.sin(a) * 8, 1, 1, D.n4); }
        const ma = (t / 60) * TAU - Math.PI / 2 + 2.2; PX.line(g, 474, 52, 474 + Math.cos(ma) * 7, 52 + Math.sin(ma) * 7, D.n1); PX.line(g, 474, 52, 474 + Math.cos(-0.6) * 4, 52 + Math.sin(-0.6) * 4, D.n1);
        PX.line(g, 474, 52, 474 + Math.cos(t * 1.05) * 8, 52 + Math.sin(t * 1.05) * 8, D.rust[1]);
        // brick oven (right) with fire
        const BR = tri(mix(D.rust[2], D.paperD, 0.3), 0.2, 0.4), OX = 572;
        for (let y = 90; y < 238; y += 6) {
          const hw = y < 150 ? 80 * Math.sqrt(Math.max(0, 1 - ((y + 3 - 150) / 60) ** 2)) : 80; if (hw < 2) continue;
          R(g, OX - hw, y, hw * 2, 6, BR[1]); R(g, OX - hw, y + 5, hw * 2, 1, mix(BR[1], D.n0, 0.25));
          for (let x = OX - 80 + ((y / 6) % 2) * 7; x < OX + 80; x += 14) if (Math.abs(x - OX) < hw - 1) R(g, x, y, 1, 5, BR[2]);
        }
        ring(g, OX, 150, 80, 60, BR[0], Math.PI * 1.05, Math.PI * 1.5);
        ell(g, OX, 182, 36, 30, BR[2]); R(g, OX - 36, 182, 72, 40, BR[2]);
        ell(g, OX, 184, 32, 27, mix(D.n0, D.rust[2], 0.3)); R(g, OX - 32, 184, 64, 36, mix(D.n0, D.rust[2], 0.3));
        clip(g, OX - 32, 150, 64, 70, () => {
          PX.glow(g, OX, 214, 40 * fire, mix(D.rust[1], D.amber[1], 0.4), 0.6);
          for (let i = 0; i < 7; i++) { const fx = OX - 22 + i * 7, fh = 14 + Math.sin(t * 6 + i * 1.7) * 5 + (i % 3) * 4; ell(g, fx, 218 - fh / 2, 4, fh / 2, mix(D.rust[1], D.amber[1], 0.5)); ell(g, fx, 218 - fh / 3, 2.5, fh / 3, D.amber[0]); }
          R(g, OX - 24, 214, 48, 6, mix(D.n1, D.rust[2], 0.3)); R(g, OX - 20, 213, 20, 3, wood(0.2)[2]); R(g, OX + 2, 214, 18, 3, wood(0.25)[2]);
        });
        PX.glow(g, OX, 200, 90 * fire, mix(D.amber[1], D.rust[1], 0.3), 0.3);
        R(g, OX - 48, 222, 96, 6, mix(D.paperD, D.n4, 0.25)); R(g, OX - 48, 222, 96, 1, mix(D.paper, D.cream, 0.3));
        // pizza peel leaning on the oven
        seg(g, 644, 120, 628, 222, 2, wood(0.1)[1]); ell(g, 644, 112, 9, 12, wood(0.05)[1]); ell(g, 642, 110, 6, 9, wood(0.05)[0]);
      });
      // pendant lamps (in front of the wall)
      for (const lx of [178, 488]) { const sw = Math.sin(t * 0.8 + lx) * 1.2; PX.line(g, lx, -40, lx + sw, 50, mix(D.n1, D.rust[2], 0.2)); poly(g, [[lx + sw - 5, 50], [lx + sw + 5, 50], [lx + sw + 14, 64], [lx + sw - 14, 64]], mix(D.moss[2], D.n2, 0.3)); R(g, lx + sw - 14, 63, 28, 1, mix(D.moss[1], D.n3, 0.2)); R(g, lx + sw - 4, 51, 3, 12, mix(D.moss[1], D.n3, 0.1)); ell(g, lx + sw, 65, 6, 2, D.lamp); PX.glow(g, lx + sw, 70, 64, D.lamp, 0.26); }
      // ---- cook (behind the counter at the oven end; the counter hides his legs) ----
      {
        const gest = P(t, tO + 0.2, 0.6, "out");
        figF(g, 562, 272, { pal: COOK, adult: true, k: 1.32, t, ph: 0.9, look: [t > tO ? -1 : -0.4, t > tO ? 1 : 0], f: { mouth: t > tO + 0.4 ? "grin" : "smile" },
          armL: [lerp(16, 64, gest) + Math.sin(t * 1.2) * 2, lerp(10, 105, gest)], armR: [14, 24] });
      }
      // ---- counter top (from the counter end at CE) ----
      const WT = wood(0.0, mix(D.amber[2], D.paperD, 0.35));
      R(g, CE, CT, 720, CF - CT, WT[1]);
      for (let i = 0; i < 7; i++) { R(g, CE, CT + i * 11, 720, 1, mix(WT[1], WT[2], 0.4)); for (let x = CE + i * 37; x < 680; x += 120) R(g, x, CT + 1 + i * 11, 40, 1, mix(WT[1], WT[0], 0.3)); }
      R(g, CE, CT, 720, 2, mix(WT[2], D.n0, 0.3));
      A(g, 0.22, () => { ell(g, 178, 262, 80, 22, D.lamp); ell(g, 488, 262, 90, 22, D.lamp); });
      R(g, CE, CF - 3, 720, 3, WT[0]); R(g, CE, CT, 2, CF - CT, WT[0]);
      // salt + chilli shakers, an order spike with tickets
      for (const [sx, col] of [[128, D.cream], [137, D.rust[1]]]) { A(g, 0.3, () => ell(g, sx + 5, 297, 4, 1, BLK)); R(g, sx, 284, 7, 12, mix(D.glass, D.n4, 0.2)); R(g, sx + 1, 288, 5, 8, mix(col, D.n3, 0.15)); R(g, sx, 282, 7, 2, D.n6); R(g, sx + 1, 285, 1, 10, D.cream); }
      R(g, 530, 266, 8, 3, D.n3); R(g, 533, 244, 1, 22, D.n6); for (let i = 0; i < 3; i++) R(g, 527 + i, 248 + i * 5, 12, 4, mix(D.cream, D.paperD, i * 0.2));
      // ---- boxes ----
      BX.forEach((b, i) => {
        const p = opened[i], dz = b.w * KY, yb = YF - dz, cx = b.x + b.w / 2;
        A(g, 0.3, () => poly(g, [[b.x + 4, YF + FH], [b.x + b.w + 4, YF + FH], [b.x + b.w + 12, yb + 6], [b.x + 12, yb + 6]], BLK));
        R(g, b.x, YF, b.w, FH, KR[1]); R(g, b.x, YF, b.w, 1, KR[0]); R(g, b.x, YF + FH - 1, b.w, 1, KR[2]); R(g, b.x + b.w - 3, YF, 3, FH, mix(KR[1], KR[2], 0.5));
        PX.text(g, b.lab, cx, YF + 3, { align: "center", col: mix(D.ink, D.rust[2], 0.35), size: 8 });
        // interior + pizza
        R(g, b.x, yb, b.w, dz, KR[0]); R(g, b.x + 3, yb + 2, b.w - 6, dz - 3, mix(KR[1], D.n3, 0.3)); R(g, b.x + 4, yb + 3, b.w - 8, dz - 5, mix(D.paper, KR[0], 0.5));
        const rx = b.w * 0.42, ry = rx * KY, py = yb + dz / 2 + 0.5;
        ell(g, cx + 2, py + 2, rx, ry, mix(KR[1], D.n3, 0.35));
        ell(g, cx, py, rx, ry, mix(D.amber[2], D.rust[2], 0.3)); ell(g, cx, py - 0.5, rx - 1, ry - 0.8, mix(D.amber[1], D.rust[2], 0.2));
        ring(g, cx, py - 1, rx - 2, ry - 1.4, mix(D.amber[0], D.paperD, 0.3), Math.PI * 1.05, Math.PI * 1.9);
        ell(g, cx, py, rx - 4, ry - 2.2, mix(D.rust[1], D.amber[2], 0.15)); ell(g, cx, py, rx - 5.5, ry - 3, mix(D.amber[0], D.cream, 0.2));
        for (let j = 0; j < 9; j++) { const a = hash(i, j) * TAU, rr = 0.15 + hash(j, i) * 0.7; ell(g, cx + Math.cos(a) * rr * (rx - 7), py + Math.sin(a) * rr * (ry - 3), 3, 1, j % 2 ? mix(D.amber[0], D.cream, 0.55) : mix(D.amber[1], D.amber[0], 0.5)); }
        for (const [rr, a] of PEP.slice(0, b.w > 100 ? 12 : 7)) { const ppx = cx + Math.cos(a) * rr * (rx - 7), ppy = py + Math.sin(a) * rr * (ry - 3); ell(g, ppx, ppy, 3, 1.6, D.rust[1]); R(g, ppx - 1, ppy - 1, 2, 1, D.rust[0]); R(g, ppx + 1, ppy + 1, 2, 1, D.rust[2]); }
        for (let j = 0; j < 4; j++) { const a = (j / 4) * Math.PI + 0.4; PX.line(g, cx - Math.cos(a) * (rx - 5), py - Math.sin(a) * (ry - 2.4), cx + Math.cos(a) * (rx - 5), py + Math.sin(a) * (ry - 2.4), mix(D.amber[1], D.rust[2], 0.35)); }
        for (let j = 0; j < 4; j++) { const a = hash(j + 5, i) * TAU; R(g, cx + Math.cos(a) * rx * 0.45, py + Math.sin(a) * ry * 0.45, 3, 1, D.moss[1]); R(g, cx + Math.cos(a) * rx * 0.45 + 1, py + Math.sin(a) * ry * 0.45 - 1, 1, 1, D.moss[0]); }
        // lid: hinged at the back edge
        const ph = PHI * p, ye = yb + b.w * (Math.cos(ph) * KY - Math.sin(ph) * KV);
        if (ye >= yb + 0.5) {
          poly(g, [[b.x - 1, yb], [b.x + b.w + 1, yb], [b.x + b.w + 1, ye + 1], [b.x - 1, ye + 1]], KR[1]);
          R(g, b.x - 1, Math.round(ye), b.w + 2, 1, KR[0]); R(g, b.x + b.w - 2, yb, 3, ye - yb, mix(KR[1], KR[2], 0.4));
          const lh = ye - yb; ring(g, cx, yb + lh / 2, b.w * 0.18, lh * 0.3, mix(D.rust[1], KR[1], 0.25)); ring(g, cx, yb + lh / 2, b.w * 0.18 - 1, lh * 0.3 - 0.6, mix(D.rust[1], KR[1], 0.25));
        } else {
          const yt = Math.round(ye), hh = Math.round(yb - ye);
          PX.vgrad(g, b.x, yt, b.w, hh, mix(KR[0], D.paperD, 0.3), mix(KR[1], D.n3, 0.25), 5);
          R(g, b.x, yt, b.w, 5, mix(KR[1], D.paperD, 0.3)); R(g, b.x, yt + 5, b.w, 1, KR[2]); R(g, b.x, yt, b.w, 1, KR[0]);
          R(g, b.x, yt, 2, hh, mix(KR[1], KR[2], 0.3)); R(g, b.x + b.w - 3, yt, 3, hh, mix(KR[1], KR[2], 0.5));
          A(g, 0.4, () => ell(g, b.x + b.w * 0.32, ye + (yb - ye) * 0.62, 7, 3, mix(KR[2], D.amber[2], 0.4)));
          A(g, 0.5, () => R(g, b.x + 2, yb - 4, b.w - 5, 4, mix(KR[2], D.n1, 0.3)));
        }
        R(g, b.x, yb, b.w, 1, KR[2]);
        if (p > 0.5) for (let j = 0; j < 4; j++) { const k = frac(t * 0.35 + j / 4 + i * 0.13), sx = cx - rx * 0.4 + j * rx * 0.27 + Math.sin(k * 5 + j) * 4, sy = py - k * 46; A(g, Math.sin(k * Math.PI) * 0.22 * Math.min(1, p), () => ell(g, sx, sy, 2 + k * 5, 1.5 + k * 3, D.cream)); }
      });
      // ---- counter front + end ----
      const PN = tri(mix(D.teal[2], D.n2, 0.25), 0.18, 0.4);
      R(g, CE, CF, 720, FL - CF, PN[1]); for (let x = CE; x < 680; x += 52) { R(g, x + 4, CF + 6, 44, FL - CF - 12, PN[2]); R(g, x + 6, CF + 8, 40, FL - CF - 16, PN[1]); R(g, x + 6, CF + 8, 40, 1, PN[0]); }
      R(g, CE, CF, 3, FL - CF, PN[0]); R(g, CE, FL - 4, 720, 4, mix(D.amber[2], D.paperD, 0.3)); R(g, CE, FL - 4, 720, 1, D.amber[0]);
      A(g, 0.3, () => R(g, CE, CF, 720, 6, BLK));
      A(g, 0.3, () => poly(g, [[CE - 2, FL], [CE + 6, FL], [CE - 30, FL + 12], [CE - 40, FL + 12]], BLK));
      // ---- customer (left, beside the counter end) ----
      {
        const down = P(t, tO + 0.5, 0.4), look = down > 0.5 ? (t > tO + 2.2 ? { eye: "down", mouth: "smile", brow: "up" } : { eye: "down", mouth: "o", brow: "up" }) : { eye: "up", mouth: "flat" };
        shadow(g, 86, FL + 1, 22, 3, 0.35);
        const r = figS(g, 80, FL, { pal: CUS, h: 110, dir: 1, t, ph: 0.2, head: { f: look, dy: lerp(-1, 2, down), dx: lerp(-1, 1, down) + (t > d * 0.17 && down < 0.5 ? 1 : 0) }, bend: lerp(-3, 7, down),
          armN: [lerp(20, 34, down), lerp(70, 80, down)], armF: [-4, -6] });
        const [wx, wy] = r.hand; R(g, wx - 1, wy - 5, 7, 5, mix(D.rust[2], D.n2, 0.35)); R(g, wx - 1, wy - 5, 7, 1, mix(D.rust[1], D.n3, 0.2)); ell(g, wx, wy, 2.8, 3, CUS.skin[1]);
      }
      PX.particles(g, 44, 20, t, [80, 40, 500, 200], { vx: 1, vy: -2, col: D.lamp, a: 0.35, tw: 1.2 });
      PX.vignette(g, 0.5);
    };
  };

  // =====================================================================================================
  // giant_ant: a savanna at golden hour, side view. An elephant walks slowly in on tree-trunk legs; a spider runs along a
  // thorny branch in the foreground on thread-thin legs. A normal ant stands on the ground; o.grow (1.0) it swells until it is
  // as tall as the elephant; its thin legs start to tremble and o.collapse (4.0) they buckle and it flops onto its belly
  // (a puff of dust, a sheepish look). The elephant stops and lifts its trunk in surprise.
  K.giant_ant = (o) => {
    const GY = 296;
    const GR = []; { const r = PX.rnd(51); for (let i = 0; i < 220; i++) GR.push([r() * 700 - 30, GY - 40 + r() * 110, r()]); }
    const ACC = [[70, 210, 1.0], [250, 200, 0.7], [600, 214, 1.2], [420, 206, 0.6]];
    const ANT = tri(mix(D.rust[2], D.n1, 0.45), 0.18, 0.45), ANTL = mix(D.rust[1], D.amber[2], 0.4);
    const EL = tri(mix(D.n5, D.paperD, 0.25), 0.22, 0.4);
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 7), tG = T("grow", 1.0), tC = T("collapse", 4.0);
      const gp = E((t - tG) / 1.6, "out"), s = lerp(0.06, 1.14, gp);
      const cp = t >= tC ? clamp((t - tC) / 0.7, 0, 1) : 0, cE = E(cp, "back");
      const shake = t > tG + 1.2 && t < tC ? clamp((t - (tG + 1.2)) / Math.max(0.3, tC - tG - 1.2), 0, 1) : 0;
      // ---- sky + sun + hills ----
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -40, -40, 720, 250, mix(D.steel[0], D.lampD, 0.35), mix(D.lamp, D.amber[0], 0.4), 8);
        PX.glow(g, 326, 180, 150, D.lamp, 0.45); PX.circle(g, 326, 184, 20, mix(D.cream, D.lamp, 0.4)); PX.circle(g, 326, 184, 17, mix(D.cream, D.lamp, 0.15));
        A(g, 0.5, () => { R(g, 256, 178, 140, 2, mix(D.lamp, D.amber[1], 0.4)); R(g, 290, 170, 72, 1, mix(D.lamp, D.amber[1], 0.4)); });
        A(g, 0.35, () => { for (const [cx2, cy2, w] of [[120, 60, 90], [480, 44, 120], [600, 90, 70]]) { ell(g, cx2 + Math.sin(t * 0.05) * 4, cy2, w / 2, 3, mix(D.cream, D.lamp, 0.4)); ell(g, cx2 + 16, cy2 + 3, w / 3, 2, mix(D.rose[0], D.lamp, 0.5)); } });
        for (let i = 0; i < 3; i++) { const bx = ((t * 9 + i * 14) % 760) - 60, by = 70 + i * 6 + Math.sin(t * 2 + i) * 2, w = PX.blink(t + i * 0.2, 0.5) ? 1 : 0; R(g, bx - 3, by - w, 3, 1, mix(D.n3, D.rust[2], 0.3)); R(g, bx, by, 1, 1, mix(D.n3, D.rust[2], 0.3)); R(g, bx + 1, by - w, 3, 1, mix(D.n3, D.rust[2], 0.3)); }
        const H1 = mix(D.lampD, D.rust[2], 0.35), H2 = mix(H1, D.n3, 0.25);
        poly(g, [[-40, 210], [60, 186], [150, 196], [260, 178], [380, 194], [520, 184], [680, 200], [680, 240], [-40, 240]], mix(H1, D.lamp, 0.35));
        poly(g, [[-40, 222], [90, 206], [200, 214], [330, 202], [470, 216], [600, 204], [680, 212], [680, 250], [-40, 250]], mix(H2, D.lamp, 0.15));
        for (const [gx2, gs, ph] of [[100, 1, 0], [122, 0.8, 1.3]]) { const gc = mix(D.n2, D.rust[2], 0.35), gy2 = 217, nb = Math.sin(t * 0.6 + ph) * 1.5; for (const lx of [-4, -2, 3, 5]) R(g, gx2 + lx * gs, gy2 - 11 * gs, 1, 11 * gs, gc); poly(g, [[gx2 - 6 * gs, gy2 - 11 * gs], [gx2 + 6 * gs, gy2 - 14 * gs], [gx2 + 7 * gs, gy2 - 11 * gs], [gx2 - 6 * gs, gy2 - 9 * gs]], gc); seg(g, gx2 + 5 * gs, gy2 - 13 * gs, gx2 + (10 + nb) * gs, gy2 - 28 * gs, 2, gc); ell(g, gx2 + (12 + nb) * gs, gy2 - 28 * gs, 2.5 * gs, 1.2, gc); R(g, gx2 + (10 + nb) * gs, gy2 - 31 * gs, 1, 2, gc); }
        for (const [ax, ay, sc] of ACC) { const tc = mix(D.n2, D.rust[2], 0.3); seg(g, ax, ay + 16 * sc, ax + 2, ay, 2 * sc, tc); seg(g, ax + 2, ay + 4 * sc, ax + 12 * sc, ay - 4 * sc, 1.5, tc); ell(g, ax, ay - 2 * sc, 22 * sc, 4 * sc, tc); ell(g, ax + 10 * sc, ay - 5 * sc, 12 * sc, 3 * sc, tc); }
      });
      // ---- plain ----
      PX.par(g, c, 0.8, () => {
        const G1 = mix(D.amber[2], D.paperD, 0.45), G2 = mix(D.amber[1], D.lamp, 0.35);
        R(g, -40, 236, 720, 140, G1);
        A(g, 0.5, () => PX.vgrad(g, -40, 236, 720, 140, mix(G2, D.lamp, 0.3), mix(D.amber[2], D.rust[2], 0.35), 7));
        for (const [x, y, k] of GR) { const col = k > 0.6 ? mix(G2, D.cream, 0.3) : mix(G1, D.rust[2], 0.3); const sw = Math.sin(t * 1.4 + x * 0.05) * 1; PX.line(g, x, y, x + sw + (k - 0.5) * 2, y - 3 - k * 3, col); }
        A(g, 0.25, () => R(g, -40, GY - 2, 720, 3, mix(D.rust[2], D.n2, 0.3)));
      });
      // ---- elephant (walks in from the right, facing left; stops at the collapse) ----
      const walkEnd = Math.min(tC + 0.2, d), wk = walkEnd <= 0 ? 1 : clamp(t / walkEnd, 0, 1), ex = lerp(522, 454, wk), stride = t < walkEnd ? 1 : 0, eph = wk * walkEnd * 2.4;
      const surprise = t > tC + 0.25 ? P(t, tC + 0.25, 0.5) * clamp((E((t - tG) / 1.6, "out") - 0.3) / 0.5, 0, 1) : 0;
      {
        const X = Math.round(ex), Y = GY, bb = Math.sin(eph * 2) * 0.8 * stride;
        const p = (x, y) => [X + x, Y + y + bb];
        shadow(g, X + 6, Y + 2, 64, 5, 0.32);
        const leg = (lx, ph, col) => {
          const sw = Math.sin(eph + ph) * 8 * stride, lift = Math.max(0, Math.cos(eph + ph)) * 4 * stride;
          const top = p(lx, -58), fx = X + lx + sw, fy = Y - lift;
          poly(g, [[top[0] - 9, top[1]], [top[0] + 9, top[1]], [fx + 8, fy - 3], [fx - 8, fy - 3]], col);
          ell(g, fx, fy - 3, 9, 3, col); R(g, fx - 9, fy - 3, 18, 2, mix(col, D.n0, 0.2));
          for (let n = 0; n < 3; n++) R(g, fx - 6 + n * 5, fy - 2, 3, 2, mix(D.cream, col, 0.3));
          for (let n = 0; n < 4; n++) R(g, lerp(top[0], fx, 0.45 + n * 0.08) - 5, lerp(top[1], fy, 0.45 + n * 0.08), 8, 1, mix(col, D.n0, 0.18));
          R(g, lerp(top[0], fx, 0.3) + 6, lerp(top[1], fy, 0.3), 2, 26, mix(col, D.n0, 0.15));
        };
        leg(-24, 0, mix(EL[1], EL[2], 0.55)); leg(34, Math.PI, mix(EL[1], EL[2], 0.55));
        // tail
        const tsw = Math.sin(t * 2.4) * 4; seg(g, ...p(58, -84), ...p(64 + tsw * 0.3, -46), 2, EL[2]); ell(g, ...p(64 + tsw * 0.3, -44), 2, 4, D.n2);
        // body: rump, back, shoulder hump, belly
        ell(g, ...p(10, -76), 52, 34, EL[1]); ell(g, ...p(40, -80), 22, 28, EL[1]); ell(g, ...p(-16, -88), 34, 24, EL[1]);
        ell(g, ...p(-6, -96), 36, 12, EL[0]); ell(g, ...p(34, -94), 16, 10, EL[0]);
        ell(g, ...p(8, -50), 40, 7, mix(EL[1], EL[2], 0.6));
        for (let i = 0; i < 7; i++) R(g, ...p(-20 + i * 11, -62 + (i % 2) * 5), 6, 1, mix(EL[1], EL[2], 0.5));
        leg(-34, Math.PI, EL[1]); leg(24, 0, EL[1]);
        // head + trunk + tusk
        ell(g, ...p(-52, -90), 22, 25, EL[1]); ell(g, ...p(-60, -100), 13, 13, EL[0]); ell(g, ...p(-46, -72), 18, 12, EL[1]);
        const tr = Math.sin(t * 1.5) * 5 * (1 - surprise);
        const T0 = [[-64, -80], [-72, -60], [-74 + tr * 0.3, -40], [-72 + tr, -20], [-66 + tr, -10]];
        const T1 = [[-64, -80], [-80, -84], [-90, -98], [-92, -114], [-84, -120]];
        const tp = T0.map(([x, y], i) => p(lerp(x, T1[i][0], surprise), lerp(y, T1[i][1], surprise)));
        for (let i = 0; i < 4; i++) limb(g, tp[i][0], tp[i][1], tp[i + 1][0], tp[i + 1][1], 13 - i * 2.4, EL[1]);
        for (let i = 1; i < 4; i++) { R(g, tp[i][0] - 3, tp[i][1], 6, 1, EL[2]); R(g, tp[i][0] - 2, tp[i][1] + 3, 4, 1, EL[2]); }
        R(g, tp[4][0] - 3, tp[4][1] + 2, 5, 2, mix(EL[2], D.n0, 0.3));
        seg(g, ...p(-62, -70), ...p(-74, -62), 4, D.cream); seg(g, ...p(-74, -62), ...p(-80, -56), 3, D.cream); R(g, ...p(-80, -57), 2, 2, D.paper);
        R(g, ...p(-56, -66), 5, 1, EL[2]);
        // ear: a big flap over the neck; spreads on surprise
        const fl = (Math.sin(t * 1.2) * 0.5 + 0.5) * (1 - surprise) + surprise * 1.4;
        const ear = [p(-42, -110), p(-16 - fl * 3, -108), p(-8 - fl * 6, -86), p(-12 - fl * 5, -62), p(-26, -54), p(-38, -64), p(-44, -86)];
        poly(g, ear, EL[2]); poly(g, ear.map(([x, y]) => [lerp(x, X - 28, 0.12), lerp(y, Y - 84 + bb, 0.12)]), mix(EL[1], D.rose[1], 0.12));
        PX.line(g, ...ear[1], ...ear[2], EL[0]); for (let i = 0; i < 3; i++) PX.line(g, ...p(-40, -96 + i * 8), ...p(-20 - fl * 3, -94 + i * 12), mix(EL[1], EL[2], 0.4));
        // eye
        const ey = -94 - surprise * 2; R(g, ...p(-62, ey), 4, 3, D.n0); R(g, ...p(-61, ey), 1, 1, D.cream); R(g, ...p(-64, ey - 3 - surprise * 2), 7, 1, EL[2]);
        A(g, 0.55, () => { ring(g, ...p(-16, -88), 34, 24, D.lamp, Math.PI * 1.15, Math.PI * 1.7); ring(g, ...p(-60, -100), 13, 13, D.lamp, Math.PI * 1.1, Math.PI * 1.6); });
      }
      // ---- the ant ----
      {
        const X = 196, sink = cE * 33, tr = shake * Math.sin(t * 38) * 1.6;
        A(g, 0.32, () => ell(g, X + 6, GY + 2, 80 * s, 5 * s + 1, BLK));
        const S = (x, y) => [X + x * s, GY + (y + sink) * s];
        const bodyY = -62, wob = Math.sin(t * 2) * 1;
        // legs: hips on the thorax, feet on the ground; they splay out on collapse
        const legsDef = [[-10, -52, 1], [-2, -52, 1], [7, -52, 1]];
        const legDraw = (hx2, hy2, fx, near) => {
          const [hX, hY] = S(hx2, hy2 + wob * 0.3), spread = cE * 22 * Math.sign(fx || 1);
          const [fX, fY] = [X + (fx + spread) * s, GY];
          const kx = hX + (fX - hX) * 0.4 + tr * s, ky = hY - (30 + cE * 2) * s + tr * s * 0.5;
          const col = near ? ANT[1] : mix(ANT[2], D.n0, 0.2), w = s > 0.4 ? (near ? 2 : 1) : 1;
          seg(g, hX, hY, kx, ky, w, col); seg(g, kx, ky, fX, fY, w, col); if (s > 0.4) { R(g, kx - 1, ky - 1, 2, 2, col); R(g, fX - 2, fY - 1, 4, 1, col); }
        };
        for (const [i, fx] of [[0, -54], [1, 10], [2, 62]]) legDraw(legsDef[i][0] + 3, legsDef[i][1] - 2, fx + 10, false);
        // abdomen, petiole, thorax, head
        const [ax, ay] = S(-52, bodyY - 4 + wob), [px3, py3] = S(-24, bodyY), [tx, ty] = S(0, bodyY + wob * 0.5), [hx3, hy3] = S(32, bodyY - 12 + wob * 0.6 + cE * 6);
        ell(g, ax, ay, 32 * s, 24 * s, ANT[1]); ell(g, ax - 4 * s, ay - 8 * s, 18 * s, 9 * s, ANT[0]); if (s > 0.3) for (let i = 0; i < 3; i++) ring(g, ax + (i - 0.5) * 12 * s + 4 * s, ay + 2 * s, 4 * s, 21 * s, mix(ANT[1], ANT[2], 0.6), -Math.PI / 2, Math.PI / 2);
        ell(g, px3, py3, 6 * s, 5 * s, ANT[1]);
        ell(g, tx, ty, 20 * s, 12 * s, ANT[1]); ell(g, tx - 2 * s, ty - 5 * s, 12 * s, 5 * s, ANT[0]);
        ell(g, hx3, hy3, 16 * s, 14 * s, ANT[1]); ell(g, hx3 - 2 * s, hy3 - 6 * s, 10 * s, 6 * s, ANT[0]);
        if (s > 0.25) {
          // mandibles, eye, antennae
          seg(g, hx3 + 12 * s, hy3 + 6 * s, hx3 + 20 * s, hy3 + 10 * s, Math.max(1, 3 * s), ANT[2]); seg(g, hx3 + 18 * s, hy3 + 10 * s, hx3 + 15 * s, hy3 + 13 * s, Math.max(1, 2 * s), ANT[2]);
          const er = 6 * s; ell(g, hx3 + 5 * s, hy3 - 2 * s, er, er, D.cream); const pupX = cE > 0.3 ? -1 : 1, pupY = cE > 0.3 ? -1 : 0;
          ell(g, hx3 + 5 * s + pupX * er * 0.3, hy3 - 2 * s + pupY * er * 0.3, er * 0.5, er * 0.55, D.n0); R(g, hx3 + 5 * s + pupX * er * 0.3 - 1, hy3 - 2 * s - er * 0.3, 2, 2, D.cream);
          if (cE > 0.3) { A(g, cE, () => R(g, hx3 + 5 * s - er, hy3 - 2 * s - er, er * 2 + 1, er * 0.9, ANT[1])); R(g, hx3 + 5 * s - er, hy3 - 2 * s - er * 0.1, er * 2 + 1, 1, ANT[2]); }
          if (shake > 0.3 && cE < 0.3) { R(g, hx3, hy3 - 9 * s, 6 * s, 1, ANT[2]); }
          const droop = cE * 30;
          for (const [bx, ph] of [[2, 0], [8, 1.3]]) {
            const [rx0, ry0] = [hx3 + bx * s, hy3 - 12 * s], ang = rad(-70 + bx * 2 + droop) + Math.sin(t * 2.2 + ph) * 0.08;
            const mx = rx0 + Math.cos(ang) * 22 * s, my = ry0 + Math.sin(ang) * 22 * s, ang2 = ang + rad(70 + droop * 0.6) + Math.sin(t * 3 + ph) * 0.1;
            const ex2 = mx + Math.cos(ang2) * 18 * s, ey2 = my + Math.sin(ang2) * 18 * s;
            seg(g, rx0, ry0, mx, my, Math.max(1, 2 * s), ANT[2]); seg(g, mx, my, ex2, ey2, Math.max(1, 1.6 * s), ANT[2]); ell(g, ex2, ey2, 2 * s, 2 * s, ANT[2]);
          }
          // sweat drop when the legs strain, then after the flop
          if (shake > 0.5 || cE > 0.5) { const sd = frac(t * 0.9); A(g, 1 - sd, () => { ell(g, hx3 - 10 * s, hy3 - 12 * s + sd * 10, 2, 3, D.teal[0]); R(g, hx3 - 11 * s, hy3 - 13 * s + sd * 10, 1, 1, D.cream); }); }
          A(g, 0.55, () => { ring(g, ax, ay, 32 * s, 24 * s, D.lamp, Math.PI * 1.45, Math.PI * 1.85); ring(g, hx3, hy3, 16 * s, 14 * s, D.lamp, Math.PI * 1.5, Math.PI * 1.95); });
        }
        for (const [i, fx] of [[0, -60], [1, 4], [2, 56]]) legDraw(legsDef[i][0], legsDef[i][1], fx, true);
        // dust puff on the flop
        if (cp > 0 && cp < 1) for (let i = 0; i < 10; i++) { const k = cp, a = Math.PI + (i / 9) * Math.PI, rr = 30 + k * 60; A(g, (1 - k) * 0.6, () => ell(g, X - 10 * s + Math.cos(a) * rr * s * (i % 2 ? 1 : 0.7), GY - 4 * s + Math.sin(a) * 10 * k * s, (5 + k * 6) * s + 0.5, (3 + k * 3) * s + 0.5, mix(D.paperD, D.lamp, 0.3))); }
      }
      // ---- foreground: thorny acacia branch with a running spider, grass ----
      PX.par(g, c, 1.2, () => {
        const bw = mix(D.rust[2], D.n1, 0.5), bl = mix(D.rust[2], D.lampD, 0.35), bd = mix(D.n0, D.rust[2], 0.2);
        const by = (x) => 50 + (x + 40) * 0.1 + Math.sin(x * 0.025) * 5, th = (x) => Math.max(2, 7 - (x + 40) * 0.016);
        for (let x = -40; x < 320; x++) { const w = th(x), y = by(x); R(g, x, y - w / 2, 1, w, bw); R(g, x, y - w / 2, 1, 1, bl); R(g, x, y + w / 2 - 1, 1, 1, bd); }
        // a side twig + knots
        for (let i = 0; i < 18; i++) { const k = i / 18; R(g, lerp(120, 170, k), lerp(by(120), by(120) - 26, k) + Math.sin(k * 4) * 1.5, 2, 2, bw); }
        for (const kx of [20, 96, 210]) { ell(g, kx, by(kx), 3, 2, bd); R(g, kx - 1, by(kx) - 1, 2, 1, bl); }
        // paired pale thorns
        for (let x = -30; x < 300; x += 18) { const y = by(x), w = th(x) / 2; PX.line(g, x, y - w, x - 3, y - w - 6, mix(D.paper, D.n6, 0.3)); PX.line(g, x + 2, y + w, x + 5, y + w + 6, mix(D.paper, D.n6, 0.35)); }
        // small leaf clusters
        for (let i = 0; i < 26; i++) {
          const lx = 150 + (i % 13) * 13 + (i > 12 ? 6 : 0), base = i > 12 ? by(lx) + 3 : by(lx) - 4, sw = Math.sin(t * 1.4 + i) * 1;
          ell(g, lx + sw, base + (i > 12 ? 4 : -4), 4, 2, i % 3 ? mix(D.moss[2], D.n1, 0.25) : mix(D.moss[1], D.lampD, 0.45));
        }
        // spider: runs right along the top of the branch, pauses, runs back
        const cyc = frac(t / 4.2), run = cyc < 0.4 ? cyc / 0.4 : cyc < 0.5 ? 1 : cyc < 0.9 ? 1 - (cyc - 0.5) / 0.4 : 0, moving = (cyc < 0.4 || (cyc > 0.5 && cyc < 0.9)) ? 1 : 0;
        const sx = lerp(72, 170, E(run, "io")), sy = by(sx) - th(sx) / 2 - 7, lp = t * 24, SPC = mix(D.n0, D.rust[2], 0.25);
        for (let i = 0; i < 4; i++) for (const side of [-1, 1]) {
          const ph = lp + i * 1.6 + (side > 0 ? Math.PI : 0), sw = Math.sin(ph) * 3.5 * moving, hx2 = sx + (i - 1.5) * 1.6, lift = Math.max(0, Math.cos(ph)) * 2.5 * moving;
          const fx2 = sx + (i - 1.5) * 9 + sw, kx = (hx2 + fx2) / 2 + (i - 1.5) * 1.5, ky = sy - 7 - lift;
          PX.line(g, hx2, sy, kx, ky, SPC); PX.line(g, kx, ky, fx2, by(fx2) - th(fx2) / 2 - lift * 0.6, SPC);
        }
        ell(g, sx - 4, sy, 5, 4, mix(D.n1, D.rust[2], 0.3)); R(g, sx - 6, sy - 2, 3, 1, mix(D.amber[2], D.n2, 0.3)); R(g, sx - 5, sy - 3, 1, 1, mix(D.lamp, D.n2, 0.4));
        ell(g, sx + 3, sy, 3, 2.5, mix(D.n1, D.rust[2], 0.2)); R(g, sx + 5, sy - 1, 1, 1, D.cream);
        // a silk thread drifting below the branch
        const tx = 70; PX.line(g, tx, by(tx) + 3, tx + Math.sin(t * 0.8) * 3, 132, mix(D.cream, D.lamp, 0.35));
        for (let i = 0; i < 30; i++) { const x0 = -10 + i * 6 + (i % 3) * 2, a = -1.65 + (i % 5) * 0.12 + Math.sin(t * 1.3 + i * 0.6) * 0.07, L = 22 + (i * 7) % 24; seg(g, x0, 366, x0 + Math.cos(a) * L, 366 + Math.sin(a) * L, 2, i % 3 ? mix(D.amber[2], D.n1, 0.4) : mix(D.amber[1], D.lampD, 0.35)); }
        for (let i = 0; i < 20; i++) { const x0 = 520 + i * 6, a = -1.5 - (i % 4) * 0.1 + Math.sin(t * 1.2 + i) * 0.07, L = 18 + (i * 5) % 20; seg(g, x0, 366, x0 + Math.cos(a) * L, 366 + Math.sin(a) * L, 2, i % 2 ? mix(D.amber[2], D.n1, 0.4) : mix(D.amber[1], D.lampD, 0.35)); }
      });
      PX.particles(g, 57, 30, t, [0, 60, 640, 260], { vx: 3, vy: -1.2, col: D.lamp, a: 0.5, tw: 1.6 });
      A(g, 0.12, () => poly(g, [[680, -40], [300, -40], [680, 300]], D.lamp));
      PX.vignette(g, 0.42);
    };
  };

  // =====================================================================================================
  // bolyai_letter: about 1820, a split frame. Left: a candlelit study; an old father writes a worried letter with a quill
  // (o.write 0.5), folds it and seals it with red wax. Right: his son, a young officer in a military coat, works on geometry
  // diagrams at a camp table in a tent by lamplight; o.read (4.0) he picks up the letter, reads it, sets it down and goes back
  // to his diagrams, determined. The panel not in focus dims a little.
  K.bolyai_letter = (o) => {
    const FAR = { skin: SK.fair, hair: HR.grey, style: "bald", old: 1, brow: mix(D.n7, D.n5, 0.2), top: tri(mix(D.n3, D.rust[2], 0.3), 0.18, 0.4), pants: tri(mix(D.n2, D.rust[2], 0.2)), shoe: D.n1, collar: D.cream };
    const JAN = { skin: SK.warm, hair: HR.black, style: "curly", mous: 1, top: tri(mix(D.steel[2], D.teal[2], 0.3), 0.22, 0.45), pants: tri(mix(D.cream, D.paperD, 0.3), 0.2, 0.3), shoe: D.n1, collar: mix(D.rust[1], D.n3, 0.25), btn: D.amber[0], cuff: mix(D.rust[1], D.n3, 0.25) };
    const BOOKS = []; { const r = PX.rnd(61); for (let s = 0; s < 4; s++) { let x = 14; while (x < 84) { const w = 3 + Math.floor(r() * 4); BOOKS.push([s, x, w, 14 + Math.floor(r() * 9), Math.floor(r() * 5)]); x += w + (r() < 0.15 ? 3 : 0); } } }
    const BC = [D.rust[2], D.moss[2], D.steel[2], D.paperD, D.amber[2]];
    const SCR = []; { const r = PX.rnd(62); for (let i = 0; i < 5; i++) { const pts = []; for (let j = 0; j < 22; j++) if (r() > 0.18) pts.push(j); SCR.push(pts); } }
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8), tW = T("write", 0.5), wD = 0.28 * d, tF = tW + wD + 0.15 * d / 8, tS = tF + 0.6 * d / 8, tR = T("read", 4.0);
      const focusR = P(t, tR - 0.6, 0.6, "io");
      // ================= left: the study =================
      clip(g, 0, 0, 319, 360, () => {
        const WL = mix(D.rust[2], D.n2, 0.45);
        PX.vgrad(g, -20, -20, 360, 360, mix(WL, D.n0, 0.4), mix(WL, D.lampD, 0.2), 7);
        for (let x = -20; x < 340; x += 22) R(g, x, -20, 1, 360, mix(WL, D.n1, 0.3));
        // window: night, moon, hills
        R(g, 196, 36, 98, 118, mix(D.n1, D.rust[2], 0.3));
        PX.vgrad(g, 200, 40, 90, 110, mix(D.n1, D.steel[2], 0.35), mix(D.steel[2], D.n3, 0.4), 5);
        PX.circle(g, 262, 66, 8, mix(D.cream, D.steel[0], 0.25)); PX.glow(g, 262, 66, 30, D.steel[0], 0.25);
        poly(g, [[200, 130], [230, 112], [252, 122], [276, 104], [290, 112], [290, 150], [200, 150]], mix(D.n1, D.steel[2], 0.2));
        for (let i = 0; i < 9; i++) A(g, 0.5 + 0.5 * Math.sin(t * 1.5 + i * 2), () => R(g, 204 + hash(i, 1) * 82, 44 + hash(i, 2) * 50, 1, 1, D.cream));
        R(g, 244, 40, 2, 110, mix(D.n1, D.rust[2], 0.35)); R(g, 200, 94, 90, 2, mix(D.n1, D.rust[2], 0.35)); R(g, 192, 152, 106, 5, mix(D.paperD, D.n3, 0.35));
        // bookshelf
        const SW = wood(0.45); R(g, 8, 30, 82, 214, SW[2]); R(g, 10, 32, 78, 210, mix(SW[2], D.n0, 0.3));
        for (let s = 0; s < 4; s++) R(g, 10, 60 + s * 46, 78, 4, SW[1]);
        for (const [s, x, w, h, ci] of BOOKS) { const by = 60 + s * 46, col = mix(BC[ci], D.n2, 0.35); R(g, x, by - h, w, h, col); R(g, x, by - h, 1, h, mix(col, D.paper, 0.25)); R(g, x, by - h + 3, w, 1, mix(col, D.amber[1], 0.3)); }
        g.save(); g.translate(0, -20);
        // chair back + desk
        const DW = wood(0.25); R(g, 64, 230, 5, 102, DW[2]); R(g, 64, 230, 2, 102, DW[1]); R(g, 62, 226, 9, 4, DW[1]);
        R(g, 72, 300, 34, 4, DW[1]); R(g, 74, 304, 3, 28, DW[2]); R(g, 100, 304, 3, 28, DW[2]);
        R(g, -20, 332, 360, 70, mix(D.n1, D.rust[2], 0.3)); for (let x = -20; x < 340; x += 30) R(g, x, 332, 1, 70, mix(D.n0, D.rust[2], 0.2));
        poly(g, [[118, 290], [306, 290], [300, 272], [124, 272]], DW[1]); for (let i = 0; i < 3; i++) R(g, 122, 276 + i * 5, 180, 1, mix(DW[1], DW[2], 0.35));
        R(g, 116, 290, 192, 7, DW[2]); R(g, 116, 290, 192, 1, DW[0]); R(g, 124, 297, 5, 35, DW[2]); R(g, 296, 297, 5, 35, DW[2]); R(g, 180, 299, 60, 9, mix(DW[2], D.n0, 0.2)); R(g, 207, 302, 6, 2, D.amber[2]);
        g.restore();
      });
      // left candlelight + desk props + Farkas (drawn without the panel clip for clean arms, then clipped)
      clip(g, 0, 0, 319, 360, () => {
        g.save(); g.translate(0, -20);
        const CXc = 270, fl = 0.9 + 0.1 * Math.sin(t * 9) * Math.sin(t * 4.3);
        PX.glow(g, CXc, 254, 170 * fl, D.lamp, 0.3); PX.glow(g, CXc, 254, 60, D.amber[0], 0.25);
        // candle
        R(g, CXc - 8, 280, 16, 3, D.amber[2]); R(g, CXc - 8, 280, 16, 1, D.amber[0]); R(g, CXc - 3, 256, 6, 24, D.cream); R(g, CXc - 3, 256, 2, 24, mix(D.cream, D.lamp, 0.5)); R(g, CXc + 2, 258, 1, 8, mix(D.cream, D.paperD, 0.3));
        flame(g, CXc, 256, 12, t, 0); R(g, CXc, 254, 1, 2, D.n1);
        for (let i = 0; i < 3; i++) { const k = frac(t * 0.3 + i / 3); A(g, Math.sin(k * Math.PI) * 0.15, () => ell(g, CXc + Math.sin(k * 6 + i) * 3, 240 - k * 40, 1 + k * 2, 2 + k * 3, D.n6)); }
        // inkwell
        R(g, 230, 276, 10, 7, mix(D.n1, D.steel[2], 0.3)); R(g, 232, 274, 6, 2, mix(D.n2, D.steel[2], 0.3)); R(g, 231, 277, 2, 4, mix(D.steel[0], D.n4, 0.4));
        // paper / folded letter / seal
        const fp = P(t, tF, 0.45, "io"), sealed = t >= tS + 0.35, wax = t >= tS + 0.15;
        const pR = lerp(196, 168, fp);
        poly(g, [[140, 287], [pR, 287], [pR + 3, 276], [143, 276]], D.cream); R(g, 140, 287, pR - 140, 1, D.paperD);
        if (fp < 0.99) for (let i = 0; i < SCR.length; i++) {
          const lw = clamp(((t - tW) / wD) * SCR.length - i, 0, 1), y = 278 + i * 2;
          for (const j of SCR[i]) if (j / 22 < lw) { const x = 145 + j * 2.1 + (4 - i) * 0.3; if (x < pR - 2) R(g, x, y + ((j * 7) % 3 === 0 ? -1 : 0), 2, 1, mix(D.ink, D.paperD, 0.25)); }
        }
        if (fp > 0 && fp < 1) poly(g, [[pR, 287], [lerp(196, 140, fp), 287 - Math.sin(fp * Math.PI) * 10], [lerp(199, 143, fp), 276 - Math.sin(fp * Math.PI) * 10], [pR + 3, 276]], mix(D.cream, D.paper, 0.4));
        if (fp >= 1) { R(g, 150, 276, 1, 11, mix(D.paper, D.paperD, 0.5)); }
        if (wax) { ell(g, 155, 281, 3, 2, D.rust[1]); R(g, 154, 280, 1, 1, D.rust[0]); if (sealed) ring(g, 155, 281, 2, 1, D.rust[2]); }
        // Farkas: seated, facing the desk
        const writing = t >= tW && t < tW + wD, li = clamp(((t - tW) / wD) * SCR.length, 0, SCR.length - 0.01), lf = frac(li);
        let pen = [lerp(147, 188, lf) + Math.sin(t * 30) * 0.6, 278 + Math.floor(li) * 2 + Math.sin(t * 41) * 0.5];
        if (!writing) pen = t < tW ? [150, 276] : [178, 270];
        let reachN = [pen[0] - 2, pen[1] - 4], head = { f: { eye: "down", brow: "worry", mouth: "frown" } }, bend = 24;
        if (t >= tF - 0.1 && t < tS) reachN = [lerp(196, 168, fp), 280];
        if (t >= tS && t < tS + 0.6) { const pr = P(t, tS, 0.3); reachN = [155, lerp(270, 278, Math.sin(pr * Math.PI))]; }
        if (t >= tS + 0.6) { const rl = P(t, tS + 0.6, 0.8); reachN = [lerp(155, 132, rl), lerp(276, 284, rl)]; bend = lerp(24, 10, rl); head = { f: { eye: PX.blink(t, 2.8, 0.25) ? "closed" : "down", brow: "worry", mouth: "frown" }, dy: rl }; }
        const r = figS(g, 92, 332, { pal: FAR, h: 120, dir: 1, t, ph: 0.3, hipY: 302, legN: [84, 2], legF: [80, 0], bend, reachN, reachF: [142, 284], head });
        // quill (until sealing), then a stick of wax
        if (t < tF - 0.1) { const [qx, qy] = r.hand, tipX = pen[0], tipY = pen[1], ex2 = qx - 7, ey2 = qy - 14; PX.line(g, tipX, tipY, ex2, ey2, mix(D.cream, D.paperD, 0.3)); for (let i = 2; i < 9; i++) { const kx = lerp(tipX, ex2, i / 9), ky = lerp(tipY, ey2, i / 9); R(g, kx - 2, ky, 2, 1, mix(D.cream, D.paper, 0.3)); } }
        else if (t >= tS - 0.2 && t < tS + 0.4) { const [qx, qy] = r.hand; seg(g, qx, qy, qx + 2, qy + 7, 2, D.rust[1]); }
        g.restore();
        A(g, 0.18, () => PX.vgrad(g, 0, 300, 319, 60, mix(D.n0, D.rust[2], 0.2), D.n0, 4));
        PX.particles(g, 63, 12, t, [120, 160, 190, 120], { vx: 0.5, vy: -1.5, col: D.lamp, a: 0.35, tw: 1.2 });
        A(g, 0.32 * focusR, () => R(g, 0, 0, 319, 360, BLK));
      });
      // ================= right: the army tent =================
      g.save(); g.translate(321, 0);
      clip(g, 0, 0, 319, 360, () => {
        const CV = mix(mix(D.paperD, D.moss[2], 0.3), D.n2, 0.25);
        PX.vgrad(g, -20, -20, 360, 360, mix(CV, D.n0, 0.72), mix(CV, D.n1, 0.3), 7);
        poly(g, [[-20, -20], [340, -20], [340, 20], [160, 60], [-20, 24]], mix(CV, D.n1, 0.45));
        PX.line(g, -20, 24, 160, 60, mix(CV, D.n0, 0.4)); PX.line(g, 160, 60, 340, 20, mix(CV, D.n0, 0.4));
        for (let x = 0; x < 320; x += 46) PX.line(g, x, 24 + x * 0.2 - (x > 160 ? (x - 160) * 0.42 : 0), x + 4, 300, mix(CV, D.n1, 0.25));
        R(g, 156, 58, 7, 260, wood(0.3)[2]); R(g, 156, 58, 2, 260, wood(0.3)[1]);
        // tent flap (right) open to the night camp with a campfire and a sentry
        poly(g, [[250, 70], [320, 50], [320, 300], [260, 300]], mix(D.n1, D.steel[2], 0.25));
        PX.vgrad(g, 262, 80, 58, 120, mix(D.n0, D.steel[2], 0.3), mix(D.n1, D.steel[2], 0.3), 4);
        R(g, 262, 200, 58, 100, mix(D.n1, D.moss[2], 0.2));
        poly(g, [[270, 200], [286, 182], [302, 200]], mix(D.n2, D.paperD, 0.2)); poly(g, [[298, 200], [312, 186], [326, 200]], mix(D.n2, D.paperD, 0.15));
        flame(g, 290, 214, 8, t, 2); PX.glow(g, 290, 210, 24, D.amber[1], 0.4);
        const sx2 = 306 + Math.sin(t * 0.4) * 3; R(g, sx2, 196, 4, 14, D.n1); ell(g, sx2 + 2, 194, 2, 2, D.n1); PX.line(g, sx2 + 4, 186, sx2 + 4, 206, D.n2);
        for (let i = 0; i < 6; i++) A(g, 0.6, () => R(g, 266 + hash(i, 4) * 50, 86 + hash(i, 5) * 60, 1, 1, D.cream));
        poly(g, [[244, 64], [262, 60], [266, 300], [250, 300]], mix(CV, D.n1, 0.3)); PX.line(g, 262, 60, 266, 300, mix(CV, D.n0, 0.4));
        // pinned diagrams on the canvas: a line, a point and many lines through it that never meet it; curved triangle
        const DP = mix(D.paper, D.paperD, 0.35);
        R(g, 30, 96, 74, 56, DP); R(g, 30, 96, 74, 1, D.cream); R(g, 66, 94, 2, 3, D.rust[1]);
        const IK = mix(D.ink, D.paperD, 0.15); PX.line(g, 36, 140, 98, 140, IK); R(g, 66, 112, 2, 2, IK);
        for (const s2 of [-0.32, -0.15, 0, 0.15, 0.32]) PX.line(g, 40, 113 - s2 * 26, 94, 113 + s2 * 26, mix(IK, DP, 0.35));
        R(g, 112, 104, 34, 30, DP); R(g, 128, 102, 2, 3, D.rust[1]);
        ring(g, 129, 128, 12, 18, IK, -Math.PI * 0.8, -Math.PI * 0.2); ring(g, 116, 110, 12, 18, IK, Math.PI * 0.05, Math.PI * 0.45); ring(g, 142, 110, 12, 18, IK, Math.PI * 0.55, Math.PI * 0.95);
        // sabre + shako on a peg
        seg(g, 196, 120, 216, 170, 2, mix(D.steel[0], D.n5, 0.4)); R(g, 192, 114, 8, 6, D.amber[2]); PX.line(g, 194, 120, 200, 126, D.amber[1]);
        R(g, 210, 86, 18, 14, mix(D.n1, D.steel[2], 0.3)); R(g, 208, 98, 22, 3, mix(D.n0, D.steel[2], 0.2)); R(g, 216, 88, 6, 3, D.amber[1]);
        g.save(); g.translate(0, -20);
        // floor, crumpled papers
        R(g, -20, 332, 360, 70, mix(D.n1, D.moss[2], 0.25));
        for (const [cx2, cy2] of [[30, 338], [70, 346], [124, 340]]) { ell(g, cx2, cy2, 5, 3, mix(D.cream, D.paperD, 0.4)); R(g, cx2 - 2, cy2 - 1, 3, 1, D.paperD); }
        // camp table (left) with lamp; János seated on the right facing left
        const TW = wood(0.3); poly(g, [[14, 290], [204, 290], [198, 272], [20, 272]], TW[1]); R(g, 12, 290, 194, 6, TW[2]); R(g, 12, 290, 194, 1, TW[0]);
        seg(g, 30, 296, 60, 332, 3, TW[2]); seg(g, 60, 296, 30, 332, 3, TW[2]); seg(g, 160, 296, 190, 332, 3, TW[2]); seg(g, 190, 296, 160, 332, 3, TW[2]);
        R(g, 232, 300, 34, 4, TW[1]); R(g, 236, 304, 3, 28, TW[2]); R(g, 260, 304, 3, 28, TW[2]); R(g, 262, 236, 5, 70, TW[2]);
        // oil lamp
        const LX = 44, fl = 0.92 + 0.08 * Math.sin(t * 7.7);
        PX.glow(g, LX, 248, 150 * fl, D.lamp, 0.24); PX.glow(g, LX, 250, 50, D.amber[0], 0.2);
        R(g, LX - 8, 280, 16, 3, D.amber[2]); ell(g, LX, 276, 7, 5, mix(D.amber[2], D.n2, 0.2)); R(g, LX - 4, 268, 8, 4, D.amber[2]);
        A(g, 0.5, () => ell(g, LX, 254, 6, 12, D.glass)); ell(g, LX, 254, 5, 11, mix(D.glass, D.lamp, 0.4)); flame(g, LX, 262, 11, t, 1);
        R(g, LX - 6, 241, 12, 2, mix(D.n3, D.amber[2], 0.3));
        // diagram sheet on the table: progress lines (drawing before reading, again after)
        poly(g, [[78, 288], [164, 288], [160, 274], [82, 274]], D.cream);
        const back = tR + 3.3, drawA = clamp(t / Math.max(0.1, Math.min(tR, d * 0.5)), 0, 1), drawB = t > back ? clamp((t - back) / 1.6, 0, 1) : 0;
        PX.line(g, 88, 285, lerp(88, 154, Math.min(1, drawA * 1.4)), 285, IK);
        if (drawA > 0.6) { R(g, 120, 278, 2, 1, IK); PX.line(g, 92, 280, lerp(92, 150, (drawA - 0.6) / 0.4), 280 - lerp(0, 2, (drawA - 0.6) / 0.4), mix(IK, D.cream, 0.3)); }
        if (drawB > 0) PX.line(g, 94, 277, lerp(94, 148, drawB), 277 + lerp(0, 6, drawB), mix(IK, D.cream, 0.1));
        // the letter: sealed on the table -> in his hands -> set down open
        const pick = P(t, tR, 0.45, "io"), down0 = tR + 2.2, put = P(t, down0, 0.5, "io");
        const readT = t > tR + 0.45 && t < down0;
        let reachN = [lerp(150, 118, drawA) + Math.sin(t * 9) * 2, 281 + Math.sin(t * 13) * 1], reachF = [100, 284], head = { f: { eye: "down", brow: "firm", mouth: "press" } }, bend = 22;
        const letterPos = [196, 284];
        if (t >= tR && t < down0) {
          const hold = [lerp(196, 206, pick), lerp(282, 266, pick)];
          reachN = hold; reachF = [hold[0] - 4, hold[1] + 2]; bend = lerp(22, 6, pick);
          head = { f: { eye: readT && PX.blink(t, 0.7, 0.5) ? "down" : "fwd", brow: readT ? "worry" : 0, mouth: readT ? "frown" : "flat" }, dy: readT ? 1 : 0 };
        } else if (t >= down0) {
          const back2 = P(t, back - 0.4, 0.5, "io"), nod = t > back - 0.4 && t < back + 0.4 ? Math.sin(((t - back + 0.4) / 0.8) * Math.PI) * 2 : 0;
          reachN = t < back - 0.4 ? [lerp(206, 196, put), lerp(266, 282, put)] : [lerp(196, 120 + drawB * 26, back2) + (drawB > 0 && drawB < 1 ? Math.sin(t * 9) * 2 : 0), lerp(282, 278 + drawB * 5, back2)];
          reachF = [lerp(202, 100, back2), lerp(268, 284, Math.max(put, back2))]; bend = lerp(6, 24, back2);
          head = { f: { eye: t > back - 0.4 ? "down" : "fwd", brow: t > back - 0.6 ? "firm" : "worry", mouth: t > back - 0.4 ? "press" : "flat" }, dy: nod };
        }
        const rr = figS(g, 228, 332, { pal: JAN, h: 120, dir: -1, t, ph: 1.1, hipY: 302, legN: [82, 4], legF: [86, 0], bend, reachN, reachF, head, coat: 1 });
        if (t < tR) { R(g, letterPos[0] - 7, letterPos[1] - 4, 14, 6, D.cream); ell(g, letterPos[0], letterPos[1] - 1, 2, 1, D.rust[1]); }
        else if (t < down0 + 0.5 && !(t >= down0 && put >= 1)) {
          const [lx, ly] = rr.hand, w = lerp(14, 12, pick), h = lerp(6, 18, pick);
          poly(g, [[lx - w / 2 - 2, ly - h + 2], [lx + w / 2 - 2, ly - h], [lx + w / 2, ly + 2], [lx - w / 2, ly + 3]], D.cream);
          if (pick > 0.6) for (let i = 0; i < 5; i++) R(g, lx - w / 2 + 1, ly - h + 4 + i * 3, w - 3, 1, mix(D.ink, D.cream, 0.55));
          ell(g, rr.hand[0], rr.hand[1], 2.6, 2.8, JAN.skin[1]);
        } else { poly(g, [[184, 287], [206, 287], [204, 281], [186, 281]], D.cream); for (let i = 0; i < 3; i++) R(g, 188, 282 + i * 2, 14, 1, mix(D.ink, D.cream, 0.55)); R(g, 202, 283, 2, 1, D.rust[1]); }
        // pencil in the near hand while drawing
        if (t < tR || t > back - 0.4) { const [px2, py2] = rr.hand; PX.line(g, px2, py2, px2 + 5, py2 - 6, mix(D.amber[2], D.n2, 0.2)); }
        g.restore();
        A(g, 0.18, () => PX.vgrad(g, 0, 300, 319, 60, mix(D.n0, D.moss[2], 0.2), D.n0, 4));
        PX.particles(g, 64, 12, t, [10, 160, 120, 120], { vx: 0.5, vy: -1.5, col: D.lamp, a: 0.35, tw: 1.2 });
        A(g, 0.32 * (1 - focusR), () => R(g, 0, 0, 319, 360, BLK));
      });
      g.restore();
      R(g, 319, 0, 2, 360, D.n0);
      PX.vignette(g, 0.5);
    };
  };

  // =====================================================================================================
  // gps_street: a busy city street at dusk. People and cars pass; a person walks in, stops and looks at their phone. o.sats
  // (0.5, then every 0.8 s) four small satellites appear one by one in the darkening sky, each joined to the phone by a faint
  // dotted line. o.pin (4.0) a map pin drops on the phone screen (shown large in a close-up card at the right).
  K.gps_street = (o) => {
    const ME = { skin: SK.med, hair: HR.black, style: "short", top: tri(mix(D.moss[2], D.paperD, 0.25), 0.22, 0.42), pants: tri(mix(D.n3, D.steel[2], 0.3), 0.2, 0.4), shoe: mix(D.cream, D.paperD, 0.3) };
    const WALK = [
      { pal: { skin: SK.fair, hair: HR.blond, style: "long", top: tri(mix(D.rust[1], D.paperD, 0.35)), pants: tri(D.n3), shoe: D.n2 }, y: 314, h: 84, v: -26, x0: 700, ph: 0.3 },
      { pal: { skin: SK.deep, hair: HR.black, style: "short", top: tri(mix(D.steel[1], D.paperD, 0.3)), pants: tri(mix(D.n3, D.paperD, 0.2)), shoe: D.n1 }, y: 318, h: 88, v: 22, x0: -120, ph: 1.4 },
      { pal: { skin: SK.warm, hair: HR.auburn, style: "pony", top: tri(mix(D.amber[2], D.paperD, 0.4)), pants: tri(mix(D.teal[2], D.n3, 0.3)), shoe: D.n2 }, y: 302, h: 78, v: 24, x0: -30, ph: 2.1 },
      { pal: { skin: SK.med, hair: HR.grey, style: "short", top: tri(mix(D.plum[2], D.paperD, 0.35)), pants: tri(D.n3), shoe: D.n1 }, y: 298, h: 76, v: -18, x0: 430, ph: 0.8 },
    ];
    const SAT = [[96, 64], [236, 46], [394, 54], [536, 78]];
    const FARB = []; { const r = PX.rnd(71); let x = -40; while (x < 700) { const w = 20 + r() * 34, h = 34 + r() * 56; FARB.push([x, w, h, r()]); x += w + 2; } }
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 7), tS = T("sats", 0.5), tP = T("pin", 4.0), st = (i) => tS + i * 0.8 * Math.min(1, d / 7);
      const dark = clamp(t / d, 0, 1);
      const stopT = 0.14 * d, walkP = clamp(t / stopT, 0, 1), meX = lerp(150, 214, E(walkP, "out")), meMv = t < stopT ? 1 - walkP * 0.5 : 0;
      const phone = P(t, stopT + 0.05, 0.5, "io");
      // ---- sky ----
      PX.par(g, c, 0.2, () => {
        PX.vgrad(g, -40, -40, 720, 230, mix(mix(D.n1, D.steel[2], 0.4), D.n0, dark * 0.35), mix(D.lampD, D.rust[2], 0.3), 8);
        for (let i = 0; i < 28; i++) A(g, (0.2 + dark * 0.6) * (0.6 + 0.4 * Math.sin(t * 1.3 + i)), () => R(g, hash(i, 7) * 640, hash(i, 8) * 90, 1, 1, D.cream));
      });
      // ---- far skyline ----
      PX.par(g, c, 0.4, () => {
        for (const [x, w, h, k] of FARB) { const top = 196 - h, col = mix(D.n2, D.steel[2], 0.2 + k * 0.15); R(g, x, top, w, h + 20, col); for (let wy = top + 4; wy < 200; wy += 6) for (let wx = x + 3; wx < x + w - 3; wx += 5) if (hash(wx, wy) > 0.62) A(g, 0.7 + 0.3 * Math.sin(t * 0.5 + wx), () => R(g, wx, wy, 2, 2, mix(D.lamp, D.amber[1], hash(wy, wx) * 0.6))); }
        A(g, 0.25, () => PX.vgrad(g, -40, 150, 720, 60, mix(D.lampD, D.n3, 0.5), mix(D.lampD, D.rust[2], 0.4), 4));
      });
      // ---- satellites + dotted lines (behind the street buildings? no: in the sky above them) ----
      const hand = [meX + 13, 262];
      // ---- mid: shopfronts ----
      PX.par(g, c, 0.7, () => {
        const FA = [mix(D.rust[2], D.n2, 0.4), mix(D.paperD, D.n3, 0.45), mix(D.teal[2], D.n2, 0.4), mix(D.amber[2], D.n2, 0.5)];
        const fronts = [[-40, 120, 0], [80, 140, 1], [220, 110, 2], [330, 150, 3], [480, 200, 0]];
        for (const [x, w, ci] of fronts) {
          const col = FA[ci], top = 146 + (ci * 13) % 26; R(g, x, top, w, 150, col); R(g, x, top, w, 3, mix(col, D.cream, 0.15));
          for (let wy = top + 10; wy < 190; wy += 22) for (let wx = x + 10; wx < x + w - 16; wx += 26) { R(g, wx, wy, 14, 14, mix(D.n1, col, 0.3)); if (hash(wx, wy + ci) > 0.4) { R(g, wx + 1, wy + 1, 12, 12, mix(D.lamp, D.amber[2], 0.4 + hash(wy, wx) * 0.3)); R(g, wx + 1, wy + 8, 12, 5, mix(D.lampD, D.rust[2], 0.3)); } R(g, wx - 1, wy + 14, 16, 1, mix(col, D.cream, 0.2)); }
          const lit = ci !== 1, sx0 = x + 6, sw0 = w - 12;
          R(g, sx0, 204, sw0, 46, lit ? mix(D.lampD, D.n2, 0.35) : mix(D.n2, col, 0.3));
          if (lit) { A(g, 0.8, () => PX.vgrad(g, sx0, 204, sw0, 46, mix(D.lamp, D.lampD, 0.5), mix(D.lampD, D.rust[2], 0.45), 4)); for (let i = 0; i < 3; i++) { const bx = sx0 + 10 + i * (sw0 - 20) / 3; R(g, bx, 228, 12, 12, mix(D.rust[2], D.n2, 0.4)); ell(g, bx + 6, 223, 4, 4, mix(D.n3, D.rust[2], 0.35)); R(g, bx - 2, 240, 16, 2, mix(D.n2, D.rust[2], 0.3)); } R(g, sx0 + sw0 / 2 - 1, 204, 2, 46, mix(col, D.n0, 0.3)); }
          else { for (let yy = 206; yy < 250; yy += 3) R(g, sx0, yy, sw0, 1, mix(D.n3, col, 0.35)); }
          R(g, sx0 - 2, 248, sw0 + 4, 2, mix(col, D.n0, 0.35));
          R(g, x + 4, 200, w - 8, 4, mix(col, D.n0, 0.3));
          const aw = [mix(D.rust[1], D.n2, 0.3), mix(D.moss[2], D.n2, 0.3), mix(D.teal[2], D.n2, 0.2), mix(D.amber[2], D.n2, 0.3)][ci];
          poly(g, [[x + 2, 192], [x + w - 2, 192], [x + w + 4, 204], [x - 4, 204]], aw); for (let sx = x; sx < x + w; sx += 10) poly(g, [[sx, 192], [sx + 5, 192], [sx + 6, 204], [sx + 1, 204]], mix(aw, D.cream, 0.25));
          if (ci !== 1) PX.glow(g, x + w / 2, 236, w * 0.5, D.lamp, 0.16);
        }
        // street lamps
        for (const lx of [60, 340, 600]) { R(g, lx, 150, 3, 110, D.n1); R(g, lx - 6, 146, 15, 6, D.n2); ell(g, lx + 1, 152, 5, 2, D.lamp); PX.glow(g, lx + 1, 156, 70, D.lamp, 0.35); A(g, 0.14, () => poly(g, [[lx - 6, 152], [lx + 9, 152], [lx + 40, 330], [lx - 36, 330]], D.lamp)); }
        R(g, -40, 250, 720, 4, mix(D.n3, D.paperD, 0.25));
      });
      // ---- road with cars ----
      R(g, -40, 254, 720, 26, mix(D.n2, D.steel[2], 0.2)); for (let x = -40; x < 680; x += 40) R(g, x + ((t * 0) | 0), 266, 18, 1, mix(D.n5, D.paperD, 0.3));
      for (const [sp, off, col, dirc] of [[120, 0, D.rust[2], 1], [90, 0.45, D.steel[2], -1], [140, 0.7, D.moss[2], 1]]) {
        const span = 900, x = dirc > 0 ? ((t * sp + off * span) % span) - 120 : 680 - ((t * sp + off * span) % span);
        const y = dirc > 0 ? 266 : 258, cc = mix(col, D.n2, 0.3);
        R(g, x, y - 8, 46, 10, cc); poly(g, [[x + 10, y - 8], [x + 16, y - 15], [x + 32, y - 15], [x + 38, y - 8]], cc); R(g, x + 17, y - 14, 7, 5, mix(D.lamp, D.n3, 0.5)); R(g, x + 26, y - 14, 6, 5, mix(D.lamp, D.n3, 0.5));
        ell(g, x + 10, y + 2, 4, 3, D.n0); ell(g, x + 36, y + 2, 4, 3, D.n0);
        const fx = dirc > 0 ? x + 45 : x, bx = dirc > 0 ? x : x + 45; R(g, fx - 1, y - 6, 2, 2, D.cream); PX.glow(g, fx, y - 5, 14, D.lamp, 0.4); R(g, bx - 1, y - 6, 2, 2, D.rust[1]); PX.glow(g, bx, y - 5, 8, D.rust[1], 0.3);
      }
      // ---- sidewalk ----
      R(g, -40, 280, 720, 90, mix(D.n3, D.paperD, 0.18)); R(g, -40, 280, 720, 3, mix(D.n5, D.paperD, 0.3));
      for (let y = 290; y < 370; y += 14) { R(g, -40, y, 720, 1, mix(D.n2, D.paperD, 0.15)); for (let x = -40 + ((y / 14) % 2) * 20; x < 680; x += 40) R(g, x, y, 1, 14, mix(D.n2, D.paperD, 0.15)); }
      A(g, 0.12, () => { for (const lx of [60, 340, 600]) ell(g, lx, 330, 40, 10, D.lamp); });
      // ---- satellites + dotted lines from the phone ----
      for (let i = 0; i < 4; i++) {
        const t0 = st(i); if (t < t0) continue;
        const a = P(t, t0, 0.4), [bx, by] = SAT[i], sx = bx + (t - t0) * 2.2, sy = by;
        // line grows from the phone up to the satellite
        const ln = P(t, t0 + 0.1, 0.45, "io"), ex2 = lerp(hand[0], sx, ln), ey2 = lerp(hand[1] - 2, sy + 2, ln);
        A(g, 0.8 * a * phone, () => dots(g, hand[0], hand[1] - 2, ex2, ey2, mix(D.cream, D.steel[0], 0.25), 3, -t * 10));
        A(g, a, () => {
          const sc = mix(D.n7, D.cream, 0.3), pn = mix(D.steel[2], D.teal[2], 0.4);
          R(g, sx - 16, sy - 3, 11, 7, pn); R(g, sx + 6, sy - 3, 11, 7, pn); for (let j = 0; j < 4; j++) { R(g, sx - 16 + j * 3, sy - 3, 1, 7, mix(pn, D.steel[0], 0.45)); R(g, sx + 6 + j * 3, sy - 3, 1, 7, mix(pn, D.steel[0], 0.45)); } R(g, sx - 16, sy, 11, 1, mix(pn, D.steel[0], 0.3)); R(g, sx + 6, sy, 11, 1, mix(pn, D.steel[0], 0.3));
          R(g, sx - 5, sy, 2, 1, sc); R(g, sx + 4, sy, 2, 1, sc); R(g, sx - 3, sy - 5, 7, 10, sc); R(g, sx - 3, sy - 5, 7, 1, D.cream); R(g, sx + 2, sy - 5, 2, 10, D.n6); R(g, sx - 2, sy + 2, 5, 2, mix(D.amber[1], D.n4, 0.3)); R(g, sx, sy - 8, 1, 3, sc); ell(g, sx, sy + 7, 2, 1, sc);
          if (PX.blink(t + i * 0.37, 1.1, 0.25)) R(g, sx, sy - 9, 1, 1, D.amber[0]);
          const pop = 1 - P(t, t0, 0.6); if (pop > 0) A(g, pop * 0.6, () => ring(g, sx, sy, 6 + (1 - pop) * 10, 6 + (1 - pop) * 10, mix(D.cream, D.steel[0], 0.4)));
        });
      }
      // ---- people: two passers-by behind, me, one in front on the right ----
      const walker = (w, front) => {
        const x = w.x0 + w.v * t, dir = w.v > 0 ? 1 : -1, ph = (Math.abs(w.v) * t) / 9 + w.ph;
        if (x < -60 || x > 700) return;
        shadow(g, x + 2, w.y + 1, 12, 2.5, 0.3);
        figS(g, x, w.y, { pal: w.pal, h: w.h, dir, t, ph: w.ph, legN: wl(ph, 1), legF: wl(ph + Math.PI, 1), bob: -Math.abs(Math.cos(ph)) * 1.2, armN: [-wl(ph, 1)[0] * 0.8, -wl(ph, 1)[0] * 0.8 - 12], armF: [wl(ph, 1)[0] * 0.8, wl(ph, 1)[0] * 0.8 - 12], head: { f: { eye: "fwd", mouth: "flat" } } });
      };
      walker(WALK[3]); walker(WALK[2]);
      // bench + planter on the pavement
      { const bw = wood(0.2); A(g, 0.3, () => R(g, 352, 316, 70, 4, BLK)); R(g, 350, 296, 66, 4, bw[1]); R(g, 350, 296, 66, 1, bw[0]); R(g, 350, 304, 66, 4, bw[1]); R(g, 350, 304, 66, 1, bw[0]); for (const lx of [354, 408]) R(g, lx, 300, 3, 16, D.n1);
        R(g, 300, 294, 26, 20, mix(D.n3, D.paperD, 0.25)); R(g, 300, 294, 26, 2, mix(D.n5, D.paperD, 0.3)); for (let i = 0; i < 9; i++) ell(g, 304 + (i % 5) * 4.5, 290 - Math.floor(i / 5) * 5 + Math.sin(t + i) * 0.5, 4, 3, i % 2 ? mix(D.moss[2], D.n2, 0.3) : mix(D.moss[1], D.n3, 0.3)); }
      walker(WALK[0]); walker(WALK[1]);
      {
        const ph = meX / 9, mv = meMv;
        shadow(g, meX + 3, 341, 14, 3, 0.35);
        const lookDown = phone > 0.5;
        const r = figS(g, meX, 340, { pal: ME, h: 104, dir: 1, t, ph: 0.6, legN: wl(ph, mv), legF: wl(ph + Math.PI, mv), bob: -Math.abs(Math.cos(ph)) * mv,
          reachN: phone > 0 ? [lerp(meX + 6, meX + 13, phone), lerp(292, 262, phone)] : undefined, armN: [-wl(ph, mv)[0] * 0.8, -wl(ph, mv)[0] * 0.8 - 10], armF: [wl(ph, mv)[0] * 0.6 - 4, 0],
          head: { f: lookDown ? { eye: "down", mouth: t > tP + 0.3 ? "smile" : "flat", brow: t > tP + 0.3 ? "up" : 0 } : { eye: "fwd" }, dy: lookDown ? 1 : 0 } });
        if (phone > 0.3) {
          const [px2, py2] = r.hand; R(g, px2 - 1, py2 - 7, 5, 8, D.n0); R(g, px2, py2 - 6, 3, 6, mix(D.teal[0], D.cream, 0.4)); PX.glow(g, px2 + 1, py2 - 6, 18, mix(D.teal[0], D.cream, 0.5), 0.35);
          if (t > tP) R(g, px2 + 1, py2 - 4, 1, 1, D.rust[1]);
          ell(g, px2, py2, 2.6, 2.8, ME.skin[1]);
        }
      }
      // ---- close-up card of the phone screen ----
      const cA = P(t, stopT + 0.6, 0.5, "out");
      if (cA > 0) A(g, cA, () => {
        const X = 480, Y = 116 + Math.round((1 - cA) * 10), W = 86, H = 162;
        A(g, 0.6, () => { dots(g, hand[0] + 6, hand[1] - 6, X - 2, Y + H * 0.42, mix(D.cream, D.steel[0], 0.3), 3, 0); ring(g, hand[0] + 1, hand[1] - 3, 9, 9, mix(D.cream, D.steel[0], 0.3)); });
        A(g, 0.35, () => R(g, X + 5, Y + 6, W, H, BLK));
        R(g, X + 2, Y, W - 4, H, D.n0); R(g, X, Y + 2, W, H - 4, D.n0); R(g, X + 2, Y + 1, W - 4, H - 2, mix(D.n1, D.steel[2], 0.3)); R(g, X + 4, Y + 4, W - 8, 1, mix(D.n5, D.steel[0], 0.3));
        const sx = X + 6, sy = Y + 12, sw = W - 12, sh = H - 24;
        clip(g, sx, sy, sw, sh, () => {
          R(g, sx, sy, sw, sh, mix(D.n2, D.steel[2], 0.25));
          R(g, sx + 50, sy, 18, sh, mix(D.teal[2], D.n2, 0.25));
          poly(g, [[sx - 4, sy + 20], [sx + 40, sy + 30], [sx + 36, sy + 62], [sx - 4, sy + 56]], mix(D.moss[2], D.n2, 0.35));
          const RD = mix(D.n5, D.paperD, 0.2);
          for (let y = sy + 12; y < sy + sh; y += 26) R(g, sx, y, sw, 3, RD);
          for (let x = sx + 8; x < sx + sw; x += 30) R(g, x, sy, 3, sh, RD);
          seg(g, sx - 10, sy + sh - 10, sx + sw + 10, sy + 40, 4, mix(D.amber[2], D.n4, 0.35));
          for (let y = sy + 4; y < sy + sh; y += 13) for (let x = sx + 14; x < sx + sw; x += 30) if (hash(x, y) > 0.3) R(g, x, y, 10, 6, mix(D.n3, D.steel[2], 0.25));
          // me (pulsing dot) + the pin
          const mx = sx + Math.round(sw * 0.42), my = sy + Math.round(sh * 0.72), pul = frac(t / 1.6);
          A(g, (1 - pul) * 0.5, () => ring(g, mx, my, 4 + pul * 10, 4 + pul * 10, D.teal[0])); PX.circle(g, mx, my, 4, D.cream); PX.circle(g, mx, my, 3, D.teal[1]);
          if (t >= tP - 0.35) {
            const k = clamp((t - (tP - 0.35)) / 0.35, 0, 1), land = t >= tP, bnc = land ? Math.abs(Math.sin(clamp((t - tP) / 0.35, 0, 1) * Math.PI)) * 4 * Math.max(0, 1 - (t - tP) / 0.35) : 0;
            const gy2 = sy + Math.round(sh * 0.46), pX = sx + Math.round(sw * 0.64), pY = lerp(sy - 20, gy2 - 2, E(k, "in")) - bnc;
            A(g, 0.4 * k, () => ell(g, pX, gy2, 5 * k + 1, 2, BLK));
            if (land) { const rp = clamp((t - tP) / 0.8, 0, 1); A(g, (1 - rp) * 0.7, () => ring(g, pX, gy2, 4 + rp * 16, 2 + rp * 6, D.rust[0])); }
            poly(g, [[pX - 6, pY - 14], [pX + 6, pY - 14], [pX, pY]], D.rust[1]); PX.circle(g, pX, pY - 15, 7, D.rust[1]); PX.circle(g, pX - 1, pY - 16, 5, mix(D.rust[1], D.rust[0], 0.5)); PX.circle(g, pX, pY - 15, 3, D.cream);
          }
          A(g, 0.06, () => poly(g, [[sx, sy], [sx + 30, sy], [sx, sy + 60]], D.cream));
        });
        R(g, X + W / 2 - 8, Y + 5, 16, 2, D.n0); R(g, X + W / 2 - 10, Y + H - 8, 20, 2, mix(D.n5, D.steel[0], 0.2));
      });
      PX.particles(g, 72, 14, t, [0, 140, 640, 200], { vx: 1, vy: -0.8, col: D.lamp, a: 0.3, tw: 1.4 });
      PX.vignette(g, 0.5);
    };
  };

  // =====================================================================================================
  // builder_corner: a building site in morning sun, seen from above at an angle. Two builders check a new brick corner with
  // tape measures: o.three (0.5) one hooks a tape on the corner and pulls it 3 units along one wall and marks it ("3");
  // o.four (2.0) the other measures 4 units along the other wall ("4"); o.five (3.5) they stretch the tape across between
  // the marks, read "5" and give a thumbs up. The tape has a tick at every unit.
  K.builder_corner = (o) => {
    const CX = 366, CY = 178, U = 48, H = 24, SKW = -0.3, KZ = 0.6;
    const sp = (gx, gz, h) => [CX + gx - gz * SKW, CY + gz * KZ - (h || 0)];
    const B1 = { skin: SK.warm, hair: HR.brown, style: "short", hat: "hard", top: tri(mix(D.steel[2], D.paperD, 0.25), 0.24, 0.42), pants: tri(mix(D.n3, D.steel[2], 0.3), 0.2, 0.4), shoe: mix(D.rust[2], D.n2, 0.4), vest: tri(mix(D.amber[1], D.paperD, 0.25), 0.25, 0.3) };
    const B2 = { skin: SK.deep, hair: HR.black, style: "short", hat: "hard", hatCol: tri(mix(D.cream, D.paperD, 0.2), 0.3, 0.3), top: tri(mix(D.moss[2], D.paperD, 0.25), 0.24, 0.42), pants: tri(mix(D.n3, D.paperD, 0.15), 0.2, 0.4), shoe: mix(D.rust[2], D.n2, 0.4), vest: tri(mix(D.rust[1], D.amber[1], 0.4), 0.25, 0.3) };
    const BRK = (s, i, j) => mix(mix(D.rust[1], D.rust[2], hash(i + s, j) * 0.6), D.paperD, 0.15 + hash(j, i + s) * 0.12);
    const MOR = mix(D.paper, D.n6, 0.35);
    const DIRT = []; { const r = PX.rnd(81); for (let i = 0; i < 240; i++) DIRT.push([r() * 700 - 30, 120 + r() * 250, r()]); }
    // brick face: bottom edge p0 -> p1 (screen), height H
    const face = (g, p0, p1, s, shade) => {
      poly(g, [[p0[0], p0[1]], [p1[0], p1[1]], [p1[0], p1[1] - H], [p0[0], p0[1] - H]], MOR);
      const L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]), n = Math.round(L / 12), at = (u, h) => [lerp(p0[0], p1[0], u), lerp(p0[1], p1[1], u) - h];
      for (let j = 0; j < Math.round(H / 4); j++) for (let i = -1; i < n + 1; i++) {
        const u0 = clamp((i + (j % 2) * 0.5) / n, 0, 1), u1 = clamp((i + 1 + (j % 2) * 0.5) / n - 0.9 / L, 0, 1); if (u1 <= u0) continue;
        const col = mix(BRK(s, i, j), D.n0, shade || 0);
        poly(g, [at(u0, j * 4), at(u1, j * 4), at(u1, j * 4 + 3), at(u0, j * 4 + 3)], col);
        poly(g, [at(u0, j * 4 + 2.4), at(u1, j * 4 + 2.4), at(u1, j * 4 + 3), at(u0, j * 4 + 3)], mix(col, D.cream, 0.18));
      }
    };
    const topF = (g, a, b, c2, d2) => { poly(g, [a, b, c2, d2], mix(mix(D.rust[1], D.paperD, 0.45), D.cream, 0.15)); PX.line(g, a[0], a[1], b[0], b[1], mix(MOR, D.cream, 0.3)); PX.line(g, d2[0], d2[1], c2[0], c2[1], mix(D.rust[0], D.cream, 0.3)); };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 6), t3 = T("three", 0.5), t4 = T("four", 2.0), t5 = T("five", 3.5);
      const pA = P(t, t3, 0.8, "io"), pB = P(t, t4, 0.8, "io"), p5 = P(t, t5, 0.8, "io");
      const rA = P(t, t5 - 0.35, 0.3, "in"), rB = rA, ok = t > t5 + 1.0 ? P(t, t5 + 1.0, 0.35, "back") : 0;
      // ---- far: sky, sun, crane, house frame ----
      PX.par(g, c, 0.35, () => {
        PX.vgrad(g, -40, -40, 720, 150, mix(D.steel[0], D.cream, 0.35), mix(D.lamp, D.cream, 0.45), 6);
        PX.glow(g, 60, 30, 170, D.lamp, 0.45); PX.circle(g, 60, 30, 13, mix(D.cream, D.lamp, 0.3));
        for (let i = 0; i < 26; i++) { const x = -40 + i * 29 + hash(i, 1) * 14, r0 = 12 + hash(i, 2) * 18, y0 = 104 - r0 * 0.5; ell(g, x, y0, r0, r0 * 0.8, mix(D.moss[2], D.steel[2], 0.35 + hash(i, 3) * 0.15)); }
        for (let i = 0; i < 26; i++) { const x = -40 + i * 29 + hash(i, 1) * 14, r0 = 12 + hash(i, 2) * 18, y0 = 104 - r0 * 0.5; A(g, 0.7, () => ell(g, x - r0 * 0.3, y0 - r0 * 0.3, r0 * 0.45, r0 * 0.3, mix(D.moss[1], D.lamp, 0.25))); }
        R(g, -40, 104, 720, 14, mix(D.moss[2], D.n3, 0.3));
        // crane
        const CR = mix(D.amber[1], D.paperD, 0.25), CRd = mix(CR, D.n2, 0.4);
        R(g, 556, 10, 8, 120, CRd); for (let y = 12; y < 128; y += 8) { PX.line(g, 556, y, 563, y + 8, CR); PX.line(g, 563, y, 556, y + 8, CR); }
        const jw = Math.sin(t * 0.15) * 0.04; seg(g, 470, 12 - jw * 100, 640, 12 + jw * 100, 3, CR); R(g, 600, 10, 16, 8, CRd); R(g, 554, 2, 12, 10, CRd); R(g, 556, 4, 8, 4, mix(D.glass, D.n4, 0.3));
        const hx2 = 500 + Math.sin(t * 0.7) * 2; PX.line(g, 500, 13, hx2, 64, D.n3); R(g, hx2 - 2, 64, 5, 3, D.n2); R(g, hx2 - 10, 67, 20, 4, wood(0.1)[1]);
        // timber house frame + scaffold (left back)
        const TB = wood(0.15, mix(D.amber[2], D.paperD, 0.4));
        for (let x = 30; x <= 190; x += 16) R(g, x, 50, 3, 70, TB[1]); R(g, 28, 48, 166, 4, TB[0]); R(g, 28, 84, 166, 3, TB[1]); R(g, 28, 118, 166, 3, TB[2]);
        PX.line(g, 28, 48, 111, 14, TB[1]); PX.line(g, 194, 48, 111, 14, TB[1]); PX.line(g, 29, 48, 111, 15, TB[0]); for (let x = 46; x < 180; x += 16) PX.line(g, x, 48, x, 48 - Math.min(x - 28, 194 - x) * 0.41, TB[2]);
        const SC = mix(D.n5, D.steel[2], 0.3); for (const x of [16, 206]) R(g, x, 40, 2, 82, SC); for (const y of [60, 90]) R(g, 14, y, 196, 2, SC); R(g, 14, 88, 196, 3, wood(0.2)[1]);
      });
      // ---- site ground + props ----
      PX.par(g, c, 0.85, () => {
        const DG = mix(D.paperD, D.rust[2], 0.3), DL = mix(DG, D.cream, 0.25), DD = mix(DG, D.n2, 0.3);
        R(g, -40, 116, 720, 260, DG); A(g, 0.35, () => PX.vgrad(g, -40, 116, 720, 250, mix(DG, D.n3, 0.3), mix(DG, D.lamp, 0.25), 6));
        for (const [x, y, k] of DIRT) R(g, x, y, k > 0.8 ? 2 : 1, 1, k > 0.5 ? DL : DD);
        for (let i = 0; i < 2; i++) for (let x = -40; x < 680; x += 4) R(g, x, 330 + i * 10 + Math.sin(x * 0.02) * 3, 2, 1, DD);
        // sand pile with shovel
        ell(g, 110, 168, 46, 18, mix(D.paper, D.amber[1], 0.3)); ell(g, 100, 162, 30, 12, mix(D.paper, D.cream, 0.3)); A(g, 0.25, () => ell(g, 140, 176, 30, 6, BLK));
        seg(g, 120, 160, 132, 128, 2, wood(0.1)[1]); R(g, 128, 124, 9, 3, wood(0.1)[0]); poly(g, [[116, 158], [124, 160], [122, 170], [114, 168]], D.n5);
        // cement mixer: drum turns
        const MX = 586, MY = 150, rot = t * 2.2;
        A(g, 0.25, () => ell(g, MX + 16, MY + 26, 26, 5, BLK));
        R(g, MX - 14, MY + 8, 32, 4, mix(D.rust[1], D.n3, 0.3)); ell(g, MX - 12, MY + 20, 5, 5, D.n1); ell(g, MX + 14, MY + 20, 5, 5, D.n1); R(g, MX - 1, MY + 8, 3, 12, D.n3);
        const MC1 = mix(D.rust[1], D.paperD, 0.3);
        poly(g, [[MX - 16, MY - 12], [MX + 10, MY - 22], [MX + 20, MY - 2], [MX - 6, MY + 8]], MC1);
        for (let i = 0; i < 3; i++) { const k = frac(rot / TAU + i / 3); const a = [lerp(MX - 16, MX + 10, k), lerp(MY - 12, MY - 22, k)], b = [lerp(MX - 6, MX + 20, k), lerp(MY + 8, MY - 2, k)]; PX.line(g, a[0], a[1], b[0], b[1], mix(MC1, D.n2, 0.35)); }
        ell(g, MX + 15, MY - 12, 5, 10, mix(MC1, D.n1, 0.4)); ell(g, MX + 15, MY - 12, 3, 7, D.n1);
        // brick pallet + wheelbarrow (right)
        const PX0 = 530, PY0 = 222; A(g, 0.28, () => poly(g, [[PX0, PY0 + 4], [PX0 + 48, PY0 + 4], [PX0 + 68, PY0 + 16], [PX0 + 20, PY0 + 16]], BLK));
        R(g, PX0, PY0, 48, 4, wood(0.1)[1]);
        for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const col = BRK(9, i, j); R(g, PX0 + 1 + i * 12 - (j % 2) * 3, PY0 - 5 - j * 5, 11, 4, col); R(g, PX0 + 1 + i * 12 - (j % 2) * 3, PY0 - 5 - j * 5, 11, 1, mix(col, D.cream, 0.25)); }
        const WB = tri(mix(D.teal[2], D.paperD, 0.25)); poly(g, [[540, 290], [588, 286], [580, 306], [548, 308]], WB[1]); poly(g, [[540, 290], [588, 286], [586, 290], [542, 294]], WB[0]); ell(g, 552, 312, 6, 6, D.n1); ell(g, 552, 312, 2, 2, D.n5); seg(g, 580, 300, 620, 314, 2, wood(0.1)[1]);
        // far worker carrying a plank, walking left to right
        const wx = ((t * 18) % 820) - 90, ph = t * 4;
        figS(g, wx, 132, { pal: B2, h: 42, dir: 1, t, legN: wl(ph, 1), legF: wl(ph + Math.PI, 1), armN: [-150, -150], armF: [-150, -150], head: { f: {} } });
        R(g, wx - 20, 86, 46, 3, wood(0.05)[1]); R(g, wx - 20, 86, 46, 1, wood(0.05)[0]);
      });
      // ---- the brick corner: wall A runs left from the inner corner O, wall B comes toward the camera ----
      const AL = -4.3 * U, BL = 4.45 * U, TW = 0.3 * U;
      A(g, 0.26, () => {
        poly(g, [sp(AL, 0), sp(TW, 0), [sp(TW, 0)[0] + 30, sp(TW, 0)[1] + 5], [sp(AL, 0)[0] + 30, sp(AL, 0)[1] + 5]], BLK);
        const b0 = sp(TW, -TW), b1 = sp(TW, BL); poly(g, [b0, b1, [b1[0] + 34, b1[1] + 6], [b0[0] + 34, b0[1] + 6]], BLK);
      });
      const mA = sp(-3 * U, 0, H), mB = sp(0, 4 * U, H), O = sp(0, 0, H);
      topF(g, sp(AL, -TW, H), sp(TW, -TW, H), sp(TW, 0, H), sp(AL, 0, H));
      face(g, sp(AL, 0), sp(0, 0), 1, 0.12);
      // mortar tub + trowel by builder 1, loose bricks by builder 2
      { const [mx, my] = sp(-4.9 * U, 1.7 * U); A(g, 0.3, () => ell(g, mx + 6, my + 3, 15, 4, BLK)); ell(g, mx, my, 13, 5, mix(D.n3, D.steel[2], 0.3)); ell(g, mx, my - 1, 11, 3.5, mix(D.paper, D.n6, 0.4)); poly(g, [[mx + 4, my - 3], [mx + 14, my - 6], [mx + 12, my - 1]], D.n6); seg(g, mx + 13, my - 6, mx + 18, my - 11, 2, wood(0.1)[1]);
        const [bx, by] = sp(1.6 * U, 5.6 * U); for (const [dx, dy] of [[0, 0], [14, 2], [6, -5]]) { const col = BRK(5, dx, dy); A(g, 0.3, () => R(g, bx + dx + 3, by + dy + 2, 12, 3, BLK)); R(g, bx + dx, by + dy - 4, 12, 5, col); R(g, bx + dx, by + dy - 4, 12, 1, mix(col, D.cream, 0.3)); } }
      const fB1 = { eye: ok > 0.2 ? "happy" : "down", mouth: ok > 0.2 ? "grin" : "press", brow: ok > 0.2 ? 0 : "firm" };
      // wall B: top, outer face, end face
      topF(g, sp(0, 0, H), sp(TW, -TW, H), sp(TW, BL, H), sp(0, BL, H));
      face(g, sp(0, 0), sp(0, BL), 2, 0.0);
      face(g, sp(0, BL), sp(TW, BL), 3, 0.22);
      A(g, 0.3, () => PX.line(g, ...sp(0, 0, H), ...sp(0, BL, H), D.cream));
      // builder 1: kneels inside the corner, facing wall-A's mark
      const [f1x, f1y] = sp(-3.9 * U, 0.9 * U);
      A(g, 0.3, () => { ell(g, f1x + 6, f1y + 2, 16, 3, BLK); poly(g, [[f1x - 8, f1y], [f1x + 8, f1y + 1], [f1x + 60, f1y + 12], [f1x + 48, f1y + 14]], BLK); });
      const rb1 = figS(g, f1x, f1y, { pal: B1, h: 92, dir: 1, t, ph: 0.2, legN: [80, 0], legF: [-4, -92], bend: 16,
        reachN: ok > 0 ? undefined : (t >= t3 ? [mA[0] + 1, mA[1] - 1] : [mA[0] - 8, mA[1] + 2]), armN: ok > 0 ? [lerp(40, 160, ok), lerp(40, 172, ok)] : undefined, thumbN: ok > 0.5,
        reachF: ok > 0 ? [mA[0] + 1, mA[1] - 1] : [f1x + 16, f1y - 22], head: { f: fB1 } });
      // ---- tapes (case in a builder's hand, blade run out to the other end), marks, labels ----
      const TC = D.amber[0], TD = D.amber[2];
      const tape = (a, b, units) => {
        seg(g, a[0], a[1], b[0], b[1], 2, TC); PX.line(g, a[0], a[1] + 1, b[0], b[1] + 1, TD);
        for (let i = 1; i <= units; i++) { const p0 = [lerp(a[0], b[0], i / units), lerp(a[1], b[1], i / units)]; R(g, p0[0], p0[1] - 1, 1, 3, D.n1); }
      };
      const run = (a, b, frac0, total) => { const k = clamp(frac0, 0, 1); if (k <= 0) return; tape(a, [lerp(a[0], b[0], k), lerp(a[1], b[1], k)], Math.floor(total * k + 1e-6)); };
      const tick = (p, t0) => { if (t < t0) return; R(g, p[0], p[1] - 2, 1, 6, D.n0); R(g, p[0] + 1, p[1] - 2, 1, 6, mix(D.cream, MOR, 0.3)); };
      tick(mA, t3 + 0.85); tick(mB, t4 + 0.85);
      run([mA[0], mA[1] - 1], [O[0], O[1] - 1], pA * (1 - rA), 3);
      run([mB[0], mB[1] - 1], [O[0], O[1] - 1], pB * (1 - rB), 4);
      run([mA[0], mA[1] - 1], [mB[0], mB[1] - 1], p5, 5);
      // builder 2: kneels outside wall B near its end, facing back up the wall
      const [f2x, f2y] = sp(0.5 * U, 4.9 * U);
      A(g, 0.3, () => { ell(g, f2x + 4, f2y + 2, 16, 3, BLK); poly(g, [[f2x - 8, f2y], [f2x + 8, f2y + 1], [f2x + 60, f2y + 12], [f2x + 48, f2y + 14]], BLK); });
      const rb2 = figS(g, f2x, f2y, { pal: B2, h: 94, dir: -1, t, ph: 1.3, legN: [80, 0], legF: [-4, -92], bend: 18,
        reachN: ok > 0 ? undefined : (t >= t4 ? [mB[0] - 1, mB[1] - 1] : [mB[0] + 10, mB[1] + 4]), armN: ok > 0 ? [lerp(40, 160, ok), lerp(40, 172, ok)] : undefined, thumbN: ok > 0.5,
        reachF: ok > 0 ? [mB[0] - 1, mB[1] - 1] : [f2x - 16, f2y - 22], head: { f: fB1 } });
      // tape cases in the hands (hidden during the thumbs up)
      const caseAt = (p) => { R(g, p[0] - 3, p[1] - 3, 7, 6, D.amber[1]); R(g, p[0] - 3, p[1] - 3, 7, 1, D.amber[0]); R(g, p[0] - 1, p[1] - 1, 3, 2, D.n2); };
      if ((pA > 0 && rA < 1) || p5 > 0) caseAt([mA[0], mA[1] - 1]); if (pB > 0 && rB < 1) caseAt([mB[0], mB[1] - 1]);
      label(g, "3", (O[0] + mA[0]) / 2, mA[1] - 30, t, t3 + 0.95, { size: 16 });
      label(g, "4", (O[0] + mB[0]) / 2 + 34, (O[1] + mB[1]) / 2 - 12, t, t4 + 0.95, { size: 16 });
      label(g, "5", (mA[0] + mB[0]) / 2 - 22, (mA[1] + mB[1]) / 2 + 8, t, t5 + 0.85, { size: 16, col: D.amber[0] });
      // ---- foreground: rebar + gravel, dust in the sun ----
      PX.par(g, c, 1.2, () => {
        for (let i = 0; i < 5; i++) seg(g, 20 + i * 9, 370, 30 + i * 9, 300 - i * 4, 2, mix(D.rust[2], D.n2, 0.4));
        for (let i = 0; i < 40; i++) { const x = 600 + hash(i, 1) * 60, y = 330 + hash(i, 2) * 40; ell(g, x, y, 2 + hash(i, 3) * 2, 1.5, hash(i, 4) > 0.5 ? D.n6 : D.n5); }
      });
      PX.particles(g, 85, 30, t, [0, 30, 640, 300], { vx: 2.5, vy: -1, col: D.lamp, a: 0.45, tw: 1.4 });
      A(g, 0.1, () => poly(g, [[-40, -40], [320, -40], [-40, 260]], D.lamp));
      PX.vignette(g, 0.4);
    };
  };
})();
