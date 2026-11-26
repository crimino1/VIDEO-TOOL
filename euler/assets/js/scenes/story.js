/* Euler film, Builder A: the beauty study, Feynman, galleries. Documentary palette PX.D only, no mascot.
   Kinds: rating, gallery, notebook, magazine.
   Own kit: colour mix, scanline shapes, 2-bone IK, front + profile heads at any scale, seated/standing side figure,
   front bust, scribble "maths" (no real symbols), stroke handwriting for e^(iπ) + 1 = 0, rain glass. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, E = PX.ease;
  const rad = (a) => (a * Math.PI) / 180;

  // ---------- colour + shapes ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A1 = hx(a), B1 = hx(b); k = clamp(k, 0, 1); return "#" + A1.map((v, i) => Math.round(v + (B1[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const tri = (b, l, s) => [mix(b, D.cream, l === undefined ? 0.26 : l), b, mix(b, D.n0, s === undefined ? 0.4 : s)];
  const ell = (g, cx, cy, rx, ry, col) => { rx = Math.max(0, rx); ry = Math.max(0.5, ry); g.fillStyle = col; const r0 = Math.round(ry);
    for (let y = -r0; y <= r0; y++) { const w = rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2)); g.fillRect(Math.round(cx - w), Math.round(cy + y), Math.max(0, Math.round(cx + w) - Math.round(cx - w)) + 1, 1); } };
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
  const A = (g, a, fn) => { if (a <= 0) return; const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const clipPoly = (g, pts, fn) => { g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip(); fn(); g.restore(); };
  const seg = (g, x1, y1, x2, y2, w, col) => { const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = (-(y2 - y1) / L) * w / 2, ny = ((x2 - x1) / L) * w / 2; poly(g, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], col); };
  const limb = (g, x1, y1, x2, y2, w, col) => { seg(g, x1, y1, x2, y2, w, col); ell(g, x1, y1, w / 2 - 0.3, w / 2 - 0.3, col); ell(g, x2, y2, w / 2 - 0.3, w / 2 - 0.3, col); };
  const shadow = (g, cx, cy, rx, ry, a) => A(g, a === undefined ? 0.35 : a, () => ell(g, cx, cy, rx, ry, "#000000"));
  const label = (g, s, x, y, t, t0, o) => { o = o || {}; if (t < t0) return; const a = PX.p(t, t0, 0.4, "out");
    A(g, a, () => PX.otext(g, s, x, y + Math.round(3 * (1 - a)), { align: o.align || "center", col: o.col || D.cream, outline: o.outline || D.n0, size: o.size || 8, font: o.font })); };
  // panel vignette (radial, centred on the box)
  const vig = (g, x, y, w, h, a) => { const gr = g.createRadialGradient(x + w / 2, y + h / 2, Math.min(w, h) * 0.38, x + w / 2, y + h / 2, Math.max(w, h) * 0.78);
    gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, `rgba(0,0,0,${a})`); g.fillStyle = gr; g.fillRect(x, y, w, h); };
  // option time: o[k] if a number, else the default scaled to the shot length (typ = typical d)
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  // 2-bone IK: shoulder (sx, sy) to target (tx, ty), bone lengths a, b, bend +-1 -> elbow + hand
  const ik = (sx, sy, tx, ty, a, b, bend) => {
    const dx = tx - sx, dy = ty - sy, dd = clamp(Math.hypot(dx, dy), Math.abs(a - b) + 0.01, a + b - 0.01), an = Math.atan2(dy, dx);
    const ea = an + bend * Math.acos(clamp((a * a + dd * dd - b * b) / (2 * a * dd), -1, 1)), ex = sx + a * Math.cos(ea), ey = sy + a * Math.sin(ea);
    const ha = Math.atan2(ty - ey, tx - ex); return { ex, ey, hx: ex + b * Math.cos(ha), hy: ey + b * Math.sin(ha) };
  };
  // pixel line with optional width
  const pline = (g, x1, y1, x2, y2, col, w) => { if (!w || w <= 1) return PX.line(g, x1, y1, x2, y2, col);
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1))); g.fillStyle = col; for (let i = 0; i <= n; i++) g.fillRect(Math.round(lerp(x1, x2, i / n) - w / 2), Math.round(lerp(y1, y2, i / n) - w / 2), w, w); };

  // ---------- people ----------
  const SK = {
    fair: tri(mix(D.paper, D.rose[1], 0.42), 0.32, 0.3),
    warm: tri(mix(D.paperD, D.rust[1], 0.32), 0.3, 0.33),
    med: tri(mix(D.rust[2], D.paperD, 0.55), 0.28, 0.36),
    deep: tri(mix(D.rust[2], D.n2, 0.32), 0.24, 0.38),
  };
  const HR = {
    black: [mix(D.n3, D.steel[2], 0.35), mix(D.n1, D.rust[2], 0.14)],
    dark: [mix(D.rust[2], D.n4, 0.4), mix(D.n1, D.rust[2], 0.3)],
    brown: [mix(D.rust[2], D.paperD, 0.3), mix(D.rust[2], D.n0, 0.42)],
    grey: [mix(D.n7, D.cream, 0.35), D.n6],
    auburn: [mix(D.rust[1], D.paperD, 0.25), mix(D.rust[2], D.n1, 0.22)],
  };
  const INK = D.n0;

  // face features shared by both views. f: eye open|closed|happy|down|wide|half, mouth flat|smile|grin|o|open|bite,
  // brow 0|1 (raised)|-1 (focused), look/lookY (pupil shift, -1..1). (ex, ey) = eye centre, s = px per unit
  const eyeAt = (g, ex, ey, s, P, f, t, side) => {
    const sd = P.skin[2], blink = PX.blink(t + (f.ph || 0), f.bper || 3.7, 0.05), e = blink && f.eye !== "happy" ? "closed" : f.eye || "open";
    const w = Math.max(1, Math.round(s * 1.1)), h = Math.max(1, Math.round(s * 1.4)), lk = Math.round((f.look || 0) * s * 0.6), lky = Math.round((f.lookY || 0) * s * 0.5);
    if (e === "closed") R(g, ex - w, ey + h * 0.4, w * 2, Math.max(1, Math.round(s * 0.6)), mix(sd, INK, 0.3));
    else if (e === "happy") { R(g, ex - w, ey, Math.max(1, Math.round(s * 0.7)), Math.max(1, Math.round(s * 0.7)), INK); R(g, ex - w + 1, ey - Math.max(1, Math.round(s * 0.6)), w * 2 - 2, Math.max(1, Math.round(s * 0.7)), INK); R(g, ex + w - Math.max(1, Math.round(s * 0.7)), ey, Math.max(1, Math.round(s * 0.7)), Math.max(1, Math.round(s * 0.7)), INK); }
    else if (e === "down") { R(g, ex - w + lk, ey + Math.round(h * 0.35), w * 2 - (side ? 1 : 0), Math.max(1, Math.round(h * 0.6)), INK); R(g, ex - w, ey - Math.round(h * 0.2), w * 2, Math.max(1, Math.round(s * 0.6)), sd); }
    else if (e === "half") { R(g, ex - w + lk, ey + Math.round(h * 0.2), w * 2 - (side ? 1 : 0), Math.max(1, Math.round(h * 0.7)), INK); R(g, ex - w, ey - Math.round(h * 0.25), w * 2, Math.max(1, Math.round(s * 0.7)), sd); }
    else if (e === "wide") { R(g, ex - w, ey - h * 0.5, w * 2, h + 1, D.cream); R(g, ex - Math.round(w * 0.5) + lk, ey - h * 0.3 + lky, Math.max(1, w), h, INK); }
    else { R(g, ex - Math.round(w * 0.5) + lk, ey - Math.round(h * 0.5) + lky, Math.max(1, w), h, INK); if (s >= 2) R(g, ex - Math.round(w * 0.5) + lk, ey - Math.round(h * 0.5) + lky, 1, 1, mix(INK, D.cream, 0.5)); }
  };
  const mouthAt = (g, mx, my, s, P, f, side) => {
    const lip = mix(mix(P.skin[2], D.rust[2], 0.4), INK, 0.2), m = f.mouth || "flat", u = Math.max(1, Math.round(s * 0.7)), w = Math.round(s * (side ? 1.6 : 2.2));
    if (m === "smile") { R(g, mx - w, my - u, u, u, lip); R(g, mx - w + u, my, 2 * w - 2 * u + (side ? u : 0), u, lip); if (!side) R(g, mx + w - u, my - u, u, u, lip); }
    else if (m === "grin" && side) { const h = Math.max(2, Math.round(s * 1.6)), dk = mix(INK, D.rust[2], 0.35);
      poly(g, [[mx - w - u, my - 2 * u], [mx + w * 0.7, my - u * 0.5], [mx + w * 0.4, my + h], [mx - w * 0.2, my + h * 0.6]], dk);
      R(g, mx - w * 0.4, my - u * 0.9, w * 1.1, Math.max(1, u * 0.8), D.cream); R(g, mx - w - u, my - 3 * u, u, u, lip); }
    else if (m === "grin") { const h = Math.max(2, Math.round(s * 1.5)); R(g, mx - w, my - u, 2 * w, h, INK); R(g, mx - w + 1, my - u, 2 * w - 2, Math.max(1, Math.round(h * 0.4)), D.cream); R(g, mx - w - (side ? 0 : u), my - 2 * u, u, u, lip); if (!side) R(g, mx + w, my - 2 * u, u, u, lip); }
    else if (m === "o") R(g, mx - u, my - u, 2 * u, 2 * u, INK);
    else if (m === "open") R(g, mx - w * 0.7, my - u, w * 1.4, Math.max(2, Math.round(s * 1.4)), INK);
    else if (m === "bite") { R(g, mx - w, my, 2 * w, u, lip); R(g, mx - w * 0.4, my + u, w * 0.8, u, mix(P.skin[1], P.skin[2], 0.5)); }
    else R(g, mx - w, my, 2 * w, u, lip);
  };
  // front head, centre (cx, cy), s = px per unit (head is 12 x 14 units). f.turn -1..1 turns the face (3/4 view)
  // P.hs: short | bun | long | curly | crop ; P.glasses ; light: -1 lit from the left, +1 from the right
  const fHead = (g, cx, cy, s, P, f, t, light) => {
    const [sl, sb, sd] = P.skin, [hl, hb] = P.hair, tn = f.turn || 0, lt = light || -1, hs = P.hs || "short";
    if (hs === "long") { ell(g, cx, cy + 2 * s, 7.4 * s, 9.6 * s, hb); R(g, cx - 7.4 * s, cy + 2 * s, 14.8 * s, 8 * s, hb); }
    if (hs === "bun") ell(g, cx - tn * 2 * s, cy - 7.6 * s, 3.4 * s, 2.8 * s, hb);
    for (const sx of [-1, 1]) { ell(g, cx + sx * 6 * s - tn * 1.2 * s, cy + 0.6 * s, 1.3 * s, 1.9 * s, sd); }
    ell(g, cx, cy, 6 * s, 7 * s, sb);
    ell(g, cx - lt * 3.9 * s, cy + 1.2 * s, 2.2 * s, 5.4 * s, mix(sb, sd, 0.6));                   // shadow side
    ell(g, cx + lt * 2.4 * s, cy - 3.6 * s, 1.8 * s, 1.1 * s, sl); ell(g, cx + lt * 4.2 * s, cy + 1.6 * s, 0.9 * s, 1.2 * s, mix(sb, sl, 0.5));   // lit brow + cheekbone
    R(g, cx - 3 * s, cy + 6.2 * s, 6 * s, Math.max(1, s * 0.8), mix(sb, sd, 0.5));                  // under chin
    const fx = cx + tn * 1.8 * s, ey = cy + 0.4 * s;
    // hair (front)
    const cap = (dy, ry) => { ell(g, cx - tn * 0.6 * s, cy - dy * s, 6.6 * s, ry * s, hb); };
    if (hs === "short" || hs === "crop") { cap(4.2, 3.6); R(g, cx - 6.6 * s, cy - 4.4 * s, 1.6 * s, 4.4 * s, hb); R(g, cx + 5 * s, cy - 4.4 * s, 1.6 * s, 4.4 * s, hb);
      if (hs === "short") { poly(g, [[cx - 5 * s, cy - 4 * s], [cx + 2 * s, cy - 5.6 * s], [cx + 5.6 * s, cy - 2.6 * s], [cx + 5.6 * s, cy - 5 * s], [cx - 5 * s, cy - 6 * s]], hb); }
      R(g, cx - 3 * s, cy - 7.4 * s, 5 * s, Math.max(1, s * 0.7), hl); }
    else if (hs === "bun" || hs === "long") { cap(4.4, 3.4); R(g, cx - 6.6 * s, cy - 4.4 * s, 1.8 * s, (hs === "long" ? 9 : 5) * s, hb); R(g, cx + 4.8 * s, cy - 4.4 * s, 1.8 * s, (hs === "long" ? 9 : 5) * s, hb);
      poly(g, [[cx - 6 * s, cy - 3 * s], [cx - 1 * s, cy - 5.8 * s], [cx + 6 * s, cy - 2.4 * s], [cx + 6 * s, cy - 5 * s], [cx - 6 * s, cy - 5.4 * s]], hb);
      R(g, cx + 0 * s, cy - 7.4 * s, 4 * s, Math.max(1, s * 0.7), hl); }
    else if (hs === "curly") { cap(4.6, 3.6); for (let i = 0; i < 7; i++) { const a = Math.PI * (0.06 + 0.88 * i / 6); ell(g, cx - Math.cos(a) * 6.4 * s, cy - 4.4 * s - Math.sin(a) * 3.4 * s, 1.8 * s, 1.6 * s, hb); }
      for (let i = 0; i < 4; i++) ell(g, cx - 4 * s + i * 2.6 * s, cy - 4.2 * s + (i % 2) * 0.6 * s, 1.5 * s, 1.3 * s, hb); for (let i = 0; i < 3; i++) R(g, cx - 3 * s + i * 2.6 * s, cy - 7.6 * s + (i % 2) * s, Math.max(1, s * 0.8), Math.max(1, s * 0.6), hl); }
    // brows, eyes, nose, mouth
    const bw = f.brow || 0, bc = mix(hb, INK, 0.2);
    for (const sx of [-1, 1]) {
      const ex = fx + sx * 2.5 * s, sq = 1 - Math.abs(tn) * 0.3 * (sx === Math.sign(tn) ? 0 : 1);
      const by = ey - 2.4 * s - (bw === 1 ? 0.8 * s : 0) + (bw === -1 ? 0.3 * s : 0);
      R(g, ex - 1.4 * s * sq, by + (bw === -1 && sx < 0 ? 0 : 0), 2.8 * s * sq, Math.max(1, s * 0.7), bc);
      if (bw === -1) R(g, ex + (sx < 0 ? 0.8 : -1.6) * s, by + Math.max(1, s * 0.6), 0.8 * s, Math.max(1, s * 0.5), bc);
      eyeAt(g, Math.round(ex), Math.round(ey), s, P, f, t, false);
    }
    R(g, fx + tn * 0.8 * s - 0.4 * s, cy + 1.8 * s, Math.max(1, s * 0.9), 1.8 * s, mix(sb, sd, 0.85));
    if (f.blush) A(g, f.blush * 0.5, () => { for (const sx of [-1, 1]) ell(g, fx + sx * 3.4 * s, cy + 3 * s, 1.3 * s, 0.7 * s, D.rose[1]); });
    if (P.mus) poly(g, [[fx - 3 * s, cy + 4 * s], [fx - 1.6 * s, cy + 3 * s], [fx + 1.6 * s, cy + 3 * s], [fx + 3 * s, cy + 4 * s], [fx + 2.4 * s, cy + 4.2 * s], [fx - 2.4 * s, cy + 4.2 * s]], mix(P.hair[1], INK, 0.1));
    mouthAt(g, Math.round(fx), Math.round(cy + 4.6 * s + (P.mus ? 0.9 * s : 0)), s, P, f, false);
    if (P.glasses) { const gc = mix(INK, D.amber[2], 0.25); for (const sx of [-1, 1]) PX.box(g, Math.round(fx + sx * 2.5 * s - 2 * s), Math.round(ey - 1.6 * s), Math.round(4 * s), Math.round(3.4 * s), gc); R(g, fx - 0.6 * s, ey - 1 * s, 1.2 * s, 1, gc);
      A(g, 0.25, () => R(g, Math.round(fx - 2.5 * s - 1.4 * s), Math.round(ey - 1 * s), Math.max(1, s * 0.8), Math.max(1, s * 0.8), D.cream)); }
  };
  // profile head facing +x, centre (cx, cy), s px per unit
  const sHead = (g, cx, cy, s, P, f, t) => {
    const [sl, sb, sd] = P.skin, [hl, hb] = P.hair, hs = P.hs || "short";
    if (hs === "long") { poly(g, [[cx - 6.8 * s, cy - 2 * s], [cx + 1 * s, cy - 2 * s], [cx + 0 * s, cy + 9.5 * s], [cx - 7.6 * s, cy + 9.5 * s]], hb); }
    ell(g, cx, cy, 6 * s, 7 * s, sb);
    ell(g, cx + 2.2 * s, cy + 3.2 * s, 4.2 * s, 3.8 * s, sb);                       // jaw + chin forward
    poly(g, [[cx + 5.4 * s, cy - 0.8 * s], [cx + 7.4 * s, cy + 2.2 * s], [cx + 7 * s, cy + 2.6 * s], [cx + 5.4 * s, cy + 2.6 * s]], sb);   // nose
    R(g, cx + 6 * s, cy + 2.2 * s, Math.max(1, s * 0.7), Math.max(1, s * 0.6), sd);
    ell(g, cx - 2.6 * s, cy + 2.4 * s, 2.4 * s, 3.6 * s, mix(sb, sd, 0.45));        // cheek-to-back shade
    R(g, cx - 1 * s, cy + 6.4 * s, 4 * s, Math.max(1, s * 0.8), sd);                 // under jaw
    ell(g, cx + 4.2 * s, cy - 2.4 * s, 0.9 * s, 0.7 * s, sl);                        // brow light
    // ear
    ell(g, cx - 1 * s, cy + 0.8 * s, 1.4 * s, 2 * s, sd); ell(g, cx - 0.8 * s, cy + 0.8 * s, 0.7 * s, 1.3 * s, mix(sb, sd, 0.3));
    // hair
    if (hs === "short" || hs === "crop") {
      poly(g, [[cx - 6.4 * s, cy + 2.4 * s], [cx - 6.6 * s, cy - 3 * s], [cx - 3.6 * s, cy - 6.8 * s], [cx + 1.6 * s, cy - 7.6 * s], [cx + 5 * s, cy - 5.8 * s], [cx + 6.2 * s, cy - 3.6 * s],
        [cx + 3.8 * s, cy - 4.4 * s], [cx + 1 * s, cy - 4.6 * s], [cx - 0.6 * s, cy - 2.6 * s], [cx - 2.6 * s, cy - 1 * s], [cx - 3 * s, cy + 1.6 * s], [cx - 4.6 * s, cy + 4 * s]], hb);
      R(g, cx - 1.4 * s, cy - 2.6 * s, Math.max(1, s * 0.9), 2.6 * s, hb);            // sideburn
      R(g, cx - 2 * s, cy - 6.8 * s, 5 * s, Math.max(1, s * 0.7), hl);
    } else if (hs === "bun" || hs === "long") {
      poly(g, [[cx - 6.6 * s, cy + 3 * s], [cx - 6.6 * s, cy - 3 * s], [cx - 3.6 * s, cy - 6.8 * s], [cx + 1.6 * s, cy - 7.6 * s], [cx + 5 * s, cy - 5.8 * s], [cx + 6 * s, cy - 3.2 * s],
        [cx + 3 * s, cy - 4.6 * s], [cx + 0.4 * s, cy - 3.4 * s], [cx - 2.4 * s, cy - 0.8 * s], [cx - 3 * s, cy + 3 * s]], hb);
      if (hs === "bun") ell(g, cx - 6.4 * s, cy - 3.6 * s, 2.8 * s, 2.6 * s, hb);
      R(g, cx - 2.4 * s, cy - 6.8 * s, 5 * s, Math.max(1, s * 0.7), hl);
    } else if (hs === "curly") {
      ell(g, cx - 1.4 * s, cy - 3.2 * s, 6.4 * s, 4.8 * s, hb); for (let i = 0; i < 6; i++) ell(g, cx - 6 * s + i * 2.2 * s, cy - 7 * s + Math.abs(i - 2.5) * 0.6 * s, 1.7 * s, 1.5 * s, hb);
      ell(g, cx - 5.8 * s, cy + 0.6 * s, 1.8 * s, 2.4 * s, hb); ell(g, cx + 4 * s, cy - 4.4 * s, 1.8 * s, 1.4 * s, hb);
      for (let i = 0; i < 3; i++) R(g, cx - 4 * s + i * 2.4 * s, cy - 7.4 * s, Math.max(1, s * 0.8), Math.max(1, s * 0.6), hl);
    }
    const bw = f.brow || 0, bc = mix(hb, INK, 0.2), by = cy - 2.3 * s - (bw === 1 ? 0.8 * s : 0) + (bw === -1 ? 0.3 * s : 0);
    R(g, cx + 2.6 * s, by + (bw === -1 ? 0.5 * s : 0), 2.6 * s, Math.max(1, s * 0.7), bc);
    eyeAt(g, Math.round(cx + 3.7 * s), Math.round(cy - 0.2 * s), s * 0.9, P, f, t, true);
    if (f.blush) A(g, f.blush * 0.5, () => ell(g, cx + 3.4 * s, cy + 2.6 * s, 1.3 * s, 0.8 * s, D.rose[1]));
    mouthAt(g, Math.round(cx + 5 * s), Math.round(cy + 4.4 * s), s * 0.9, P, f, true);
    if (P.glasses) { const gc = mix(INK, D.amber[2], 0.25); PX.box(g, Math.round(cx + 2.4 * s), Math.round(cy - 1.8 * s), Math.round(3.6 * s), Math.round(3.2 * s), gc); R(g, cx - 0.6 * s, cy - 1 * s, 3 * s, 1, gc); }
  };

  // side figure facing +x (o.dir -1 flips). Hip at (o.x, o.y), o.k scale (1 = ~96 px standing).
  // lean deg (+ forward), legN/legF [thigh, shin] deg from straight down (+ forward), handN/handF world targets,
  // head {tilt deg (+ down), dx, dy}, face, P {skin, hair, hs, top [l,b,d], pants, shoe, collar, sleeve}, under(fn) draws
  // between far and near limbs (e.g. the chair). Returns world hand points + head centre.
  const sFig = (g, o) => {
    const P = o.P, k = o.k || 1, dir = o.dir || 1, X = Math.round(o.x), Y = Math.round(o.y);
    const [cl, cb, cd] = P.top, [pl, pb, pd] = P.pants, sb = P.skin[1], sd = P.skin[2];
    const br = Math.sin((o.t || 0) * 1.6 + (o.ph || 0)) * 0.5 * k;            // breathing
    g.save(); g.translate(X, Y); if (dir < 0) g.scale(-1, 1);
    const ln = rad(o.lean || 0), TL = 29 * k, shx = Math.sin(ln) * TL, shy = -Math.cos(ln) * TL + br;
    const Lt = 21 * k, Ls = 21 * k, Lu = 14 * k, Lf = 13 * k;
    const legPts = (l) => { const kx = Lt * Math.sin(rad(l[0])), ky = Lt * Math.cos(rad(l[0])); return [kx, ky, kx + Ls * Math.sin(rad(l[1])), ky + Ls * Math.cos(rad(l[1]))]; };
    const leg = (l, col, colD, shoe) => { const [kx, ky, ax, ay] = legPts(l); limb(g, 0, 0, kx, ky, 8.5 * k, col); limb(g, kx, ky, ax, ay, 6.6 * k, col); seg(g, kx + 1.5 * k, ky + 2 * k, ax + 1.6 * k, ay - 2 * k, Math.max(1, 0.9 * k), colD);
      R(g, ax - 3 * k, ay - 1 * k, 9.5 * k, 3.4 * k, shoe); R(g, ax - 2 * k, ay - 1.4 * k, 7 * k, Math.max(1, 0.8 * k), mix(shoe, D.n6, 0.35)); };
    const SH = [shx + 0.5 * k, shy + 4 * k];
    const loc = (T) => [(T[0] - X) * dir, T[1] - Y];
    const arm = (T, ang, col, colD, near, bend) => {
      let e, h;
      if (T) { const q = loc(T), r = ik(SH[0], SH[1], q[0], q[1], Lu, Lf, bend || 1); e = [r.ex, r.ey]; h = [r.hx, r.hy]; }
      else { const a = ang || [10, 30]; e = [SH[0] + Lu * Math.sin(rad(a[0])), SH[1] + Lu * Math.cos(rad(a[0]))]; h = [e[0] + Lf * Math.sin(rad(a[1])), e[1] + Lf * Math.cos(rad(a[1]))]; }
      if (near) { limb(g, SH[0], SH[1], e[0], e[1], 7.6 * k, colD); limb(g, e[0], e[1], h[0], h[1], 6.8 * k, colD); }
      limb(g, SH[0], SH[1], e[0], e[1], 6.2 * k, col); limb(g, e[0], e[1], h[0], h[1], 5.4 * k, col);
      if (near) seg(g, SH[0] - 1.6 * k, SH[1] - 1.6 * k, e[0] - 1.8 * k, e[1] - 1, Math.max(1, 0.8 * k), o.rim || cl);
      if (P.cuff) { const ux = (h[0] - e[0]) / Lf, uy = (h[1] - e[1]) / Lf; seg(g, h[0] - ux * 2.4 * k, h[1] - uy * 2.4 * k, h[0] - ux * 0.6 * k, h[1] - uy * 0.6 * k, 5.6 * k, P.cuff); }
      ell(g, h[0], h[1], 2.5 * k, 2.4 * k, near ? sb : sd); if (near) R(g, h[0] - 1 * k, h[1] - 2 * k, Math.max(1, 1.4 * k), Math.max(1, 0.7 * k), P.skin[0]);
      return [X + h[0] * dir, Y + h[1]];
    };
    const hF = arm(o.handF, o.armF, cd, cd, false, o.bendF);
    if (!o.noLegs) leg(o.legF || [0, 0], pd, mix(pd, D.n0, 0.3), mix(P.shoe, D.n0, 0.3));
    if (o.under) { g.save(); if (dir < 0) g.scale(-1, 1); g.translate(-X, -Y); o.under(); g.restore(); }
    // torso: back curve, chest
    const hw = 6.4 * k, sw = 7.4 * k;
    const tp = [[-hw, 2 * k], [-hw - 0.6 * k + shx * 0.5, shy * 0.5], [shx - sw, shy + 2 * k], [shx - sw + 2 * k, shy - 0.6 * k], [shx + sw - 2 * k, shy - 0.6 * k], [shx + sw, shy + 3 * k], [shx * 0.5 + hw + 0.6 * k, shy * 0.45], [hw + 0.4 * k, 2 * k]];
    poly(g, tp, cb);
    poly(g, [[-hw, 2 * k], [-hw - 0.6 * k + shx * 0.5, shy * 0.5], [shx - sw, shy + 2 * k], [shx - sw + 3.6 * k, shy + 2 * k], [-hw + 3.4 * k + shx * 0.5, shy * 0.5], [-hw + 3 * k, 2 * k]], cd);
    poly(g, [[shx + sw - 1.6 * k, shy + 0.6 * k], [shx + sw, shy + 3 * k], [shx * 0.5 + hw + 0.6 * k, shy * 0.45], [hw + 0.4 * k, 2 * k], [hw - 1.2 * k, 2 * k], [shx * 0.5 + hw - 1 * k, shy * 0.45], [shx + sw - 1.4 * k, shy + 3 * k]], o.rim || cl);
    if (P.rib) R(g, -hw - 0.4 * k, -0.4 * k, 2 * hw + 1 * k, 2.4 * k, cd);
    if (!o.noLegs) leg(o.legN || [0, 0], pb, pd, P.shoe);
    if (P.coatLen) { const L = P.coatLen * k; poly(g, [[-hw - 0.2 * k, -5 * k], [hw + 0.4 * k, -5 * k], [hw + 2.4 * k, L], [-hw - 1.6 * k, L]], cb); poly(g, [[-hw - 0.2 * k, -5 * k], [-hw + 2.8 * k, -5 * k], [-hw + 1.6 * k, L], [-hw - 1.6 * k, L]], cd);
      R(g, hw - 0.6 * k, -5 * k, Math.max(1, 0.8 * k), L + 4 * k, o.rim || cl); R(g, -hw - 1.6 * k, L - 1, 2 * hw + 4 * k, 1, cd); }
    // neck + head
    const ht = o.head || {}, hcx = shx + 2.2 * k + (ht.dx || 0) * k, hcy = shy - 9.6 * k + (ht.dy || 0) * k;
    R(g, shx - 0.4 * k, shy - 4.6 * k, 4.6 * k, 6 * k, sd); R(g, shx + 1.6 * k, shy - 4.6 * k, 2.4 * k, 5 * k, sb);
    if (P.collar) { poly(g, [[shx - 1.6 * k, shy - 0.6 * k], [shx + 5.6 * k, shy - 0.6 * k], [shx + 6.4 * k, shy + 2.2 * k], [shx + 2 * k, shy + 1 * k]], P.collar); }
    if (P.scarf) { const [fl, fb, fd] = P.scarf; R(g, shx - 2.6 * k, shy - 3 * k, 9.4 * k, 4.4 * k, fb); R(g, shx - 2.6 * k, shy - 3 * k, 9.4 * k, Math.max(1, 0.9 * k), fl);
      poly(g, [[shx + 3.6 * k, shy], [shx + 6.6 * k, shy], [shx + 7.2 * k, shy + 12 * k], [shx + 4.6 * k, shy + 12.4 * k]], fd); R(g, shx + 4.6 * k, shy + 11 * k, 2.6 * k, Math.max(1, 0.8 * k), fl); }
    g.save(); g.translate(Math.round(hcx), Math.round(hcy + 6 * k)); g.rotate(rad(ht.tilt || 0)); g.translate(0, -6 * k);
    sHead(g, 0, 0, k * 1.08, P, o.face || {}, o.t || 0);
    if (o.hat) o.hat(g, k);
    g.restore();
    const hN = arm(o.handN, o.armN, cb, cd, true, o.bendN);
    g.restore();
    return { hN, hF, head: [X + hcx * dir, Y + hcy], sh: [X + SH[0] * dir, Y + SH[1]] };
  };

  // front arms from a bust at shoulder centre (x, sy): IK to world targets hL / hR (null = hanging); elbows bend outward
  const fArms = (g, x, sy, k, P, hL, hR, t) => {
    const [cl, cb, cd] = P.top, sw = 11 * k, Lu = 14.5 * k, Lf = 13.5 * k, out = [];
    x = Math.round(x); sy = Math.round(sy + Math.sin((t || 0) * 1.6) * 0.5 * k);
    for (const sx of [-1, 1]) {
      const T = sx < 0 ? hL : hR, S = [x + sx * (sw - 0.5 * k), sy + 3.5 * k];
      const r = T ? [ik(S[0], S[1], T[0], T[1], Lu, Lf, 1), ik(S[0], S[1], T[0], T[1], Lu, Lf, -1)].sort((a, b) => b.ey - a.ey)[0] : { ex: S[0] + sx * 2 * k, ey: S[1] + Lu, hx: S[0] + sx * 3 * k, hy: S[1] + Lu + Lf };
      const col = sx < 0 ? cb : mix(cb, cd, 0.5);
      limb(g, S[0], S[1], r.ex, r.ey, 6 * k, col); limb(g, r.ex, r.ey, r.hx, r.hy, 5.4 * k, col);
      seg(g, S[0] - sx * 0.5 * k, S[1] - 1.4 * k, r.ex - sx * 1 * k, r.ey - 1.4 * k, Math.max(1, 0.8 * k), sx < 0 ? cl : cb);
      if (P.cuff) { const L = Math.hypot(r.hx - r.ex, r.hy - r.ey) || 1, ux = (r.hx - r.ex) / L, uy = (r.hy - r.ey) / L; seg(g, r.hx - ux * 2.6 * k, r.hy - uy * 2.6 * k, r.hx - ux * 0.8 * k, r.hy - uy * 0.8 * k, 5.8 * k, P.cuff); }
      ell(g, r.hx, r.hy + 0.6 * k, 2.7 * k, 2.3 * k, P.skin[1]); R(g, r.hx - 1.4 * k, r.hy - 1 * k, 2.4 * k, Math.max(1, 0.7 * k), P.skin[0]);
      out.push([r.hx, r.hy]);
    }
    return out;
  };
  // front bust: shoulder centre (x, sy), k scale. hL/hR world targets (screen-left / screen-right hand), face, P.
  // torso ends at sy + 34k (hide the rest behind furniture). headDx/headDy/tilt for life.
  const fBust = (g, x, sy, k, P, o) => {
    const [cl, cb, cd] = P.top, sb = P.skin[1], sd = P.skin[2], br = Math.sin((o.t || 0) * 1.6) * 0.5 * k;
    x = Math.round(x); sy = Math.round(sy + br);
    const bot = o.bot || sy + 40 * k, sw = 11 * k;
    // neck
    R(g, x - 2.6 * k, sy - 5 * k, 5.2 * k, 6 * k, sd); R(g, x - (o.light > 0 ? -0.4 : 2.6) * k, sy - 3 * k, 2.2 * k, 4 * k, mix(sb, sd, 0.4));
    // torso
    poly(g, [[x - sw + 1.5 * k, sy], [x + sw - 1.5 * k, sy], [x + sw + 1 * k, sy + 4 * k], [x + sw, bot], [x - sw, bot], [x - sw - 1 * k, sy + 4 * k]], cb);
    poly(g, [[x + sw - 4 * k, sy + 1 * k], [x + sw - 1.5 * k, sy], [x + sw + 1 * k, sy + 4 * k], [x + sw, bot], [x + sw - 4 * k, bot]], cd);
    poly(g, [[x - sw + 1.5 * k, sy], [x - 2 * k, sy], [x - sw - 0.4 * k, sy + 3.4 * k], [x - sw - 1 * k, sy + 4 * k]], cl);
    if (P.collar) { poly(g, [[x - 3.6 * k, sy - 0.4 * k], [x, sy + 5 * k], [x + 3.6 * k, sy - 0.4 * k], [x + 2.4 * k, sy - 1.2 * k], [x, sy + 2 * k], [x - 2.4 * k, sy - 1.2 * k]], P.collar); }
    if (P.cardigan) { seg(g, x - 2.6 * k, sy + 1 * k, x - 1 * k, bot, Math.max(1, 0.9 * k), cd); seg(g, x + 2.6 * k, sy + 1 * k, x + 1 * k, bot, Math.max(1, 0.9 * k), cd);
      poly(g, [[x - 2.2 * k, sy + 1 * k], [x + 2.2 * k, sy + 1 * k], [x + 0.8 * k, bot], [x - 0.8 * k, bot]], P.cardigan);
      for (let i = 0; i < 3; i++) R(g, x + 1.6 * k, sy + 10 * k + i * 7 * k, Math.max(1, k * 0.8), Math.max(1, k * 0.8), mix(cd, D.n0, 0.3)); }
    // head
    const hcx = x + (o.headDx || 0) * k, hcy = sy - 10.2 * k + (o.headDy || 0) * k;
    fHead(g, hcx, hcy, k, P, o.face || {}, o.t || 0, o.light);
    const hands = o.noArms ? [null, null] : fArms(g, x, sy - br, k, P, o.hL, o.hR, o.t);
    return { hL: hands[0], hR: hands[1], head: [hcx, hcy] };
  };

  // ---------- scribble "maths" (texture only, no real symbols) ----------
  // a line of tiny handwriting w px wide at (x, y), 3 px tall; dense = 0..1 extra marks
  const scribble = (g, x, y, w, seed, col, dense) => {
    let i = 0; for (let xx = 0; xx < w - 1; i++) {
      const gw = 2 + Math.floor(hash(seed, i) * 2.2);
      for (let a = 0; a < gw; a++) for (let b = 0; b < 3; b++) if (hash(seed * 3 + i * 7 + a, b * 5 + 1) > 0.42) R(g, x + xx + a, y + b, 1, 1, col);
      if (hash(i, seed) < 0.18 * (dense || 0)) R(g, x + xx, y - 2, 1, 1, col);           // superscript blips
      xx += gw + (hash(seed, i * 3 + 1) < 0.2 ? 2 : 1);
    }
  };

  // ---------- stroke handwriting: e^(iπ) + 1 = 0 ----------
  // glyphs on a unit box (x 0..1, y 0..1 = cap height, baseline y = 1); smooth curves as dense points
  const arc = (cx, cy, rx, ry, a0, a1, n) => [...Array(n + 1)].map((_, i) => { const a = a0 + (a1 - a0) * (i / n); return [cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]; });
  const EQ = (() => {
    const out = [], P2 = Math.PI;
    const put = (strokes, x0, y0, sc) => strokes.forEach((st) => out.push(st.map(([x, y]) => [x0 + x * sc, y0 + y * sc])));
    // e (x-height 0.62 of cap): start mid-left, bar right, loop over the top and round the bottom
    put([[[0.05, 0.67], [0.52, 0.65], ...arc(0.28, 0.67, 0.25, 0.31, -0.06, -P2 * 1.78, 22).slice(1)]], 0, 0, 1);
    // superscript i (small, raised)
    put([[[0.66, 0.02], [0.66, 0.36], [0.72, 0.4]], [[0.65, -0.12], [0.67, -0.1]]], 0, 0, 1);
    // superscript pi
    put([[[0.82, 0.06], [0.88, 0.0], [1.22, -0.01]], [[0.94, 0.0], [0.92, 0.22], [0.88, 0.38]], [[1.1, 0.0], [1.1, 0.3], [1.16, 0.38], [1.22, 0.34]]], 0, 0, 1);
    // +
    put([[[1.58, 0.38], [1.58, 0.92]], [[1.32, 0.66], [1.86, 0.64]]], 0, 0, 1);
    // 1
    put([[[2.18, 0.26], [2.36, 0.08], [2.36, 1.0]], [[2.22, 1.0], [2.5, 0.99]]], 0, 0, 1);
    // =
    put([[[2.78, 0.52], [3.28, 0.5]], [[2.8, 0.78], [3.3, 0.76]]], 0, 0, 1);
    // 0
    put([arc(3.78, 0.53, 0.25, 0.47, -P2 / 2 - 0.2, P2 * 1.5 + 0.1, 18)], 0, 0, 1);
    return out;
  })();
  const sLen = (st) => { let L = 0; for (let i = 1; i < st.length; i++) L += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); return L; };
  // draw strokes scaled by u at (x, y) with progress p (by length); w = pen width; returns pen tip
  const drawStrokes = (g, strokes, x, y, u, p, col, w, jit) => {
    const lens = strokes.map(sLen), tot = lens.reduce((a, b) => a + b, 0) + strokes.length * 0.25; let left = clamp(p, 0, 1) * tot, tip = null;
    for (let s = 0; s < strokes.length && left > 0; s++) {
      const st = strokes[s];
      for (let i = 1; i < st.length && left > 0; i++) {
        const [ax, ay] = st[i - 1], [bx, by] = st[i], L = Math.hypot(bx - ax, by - ay), kk = Math.min(1, left / (L || 1));
        const ex = ax + (bx - ax) * kk, ey = ay + (by - ay) * kk;
        pline(g, x + ax * u, y + ay * u, x + ex * u, y + ey * u, col, w); tip = [x + ex * u, y + ey * u]; left -= L;
      }
      left -= 0.25;
    }
    return tip;
  };

  // ---------- rain on glass, inside a clip ----------
  const rainGlass = (g, x, y, w, h, t, seed, col) => {
    // falling streaks outside
    for (let i = 0; i < Math.round(w * h / 260); i++) {
      const sx = x + hash(seed, i) * (w + 30) - 10, sp = 150 + hash(i, seed) * 90, yy = y + frac(hash(seed + 1, i) + t * sp / (h + 20)) * (h + 20) - 10;
      A(g, 0.22 + hash(i, 3) * 0.2, () => PX.line(g, sx, yy, sx - 1, yy + 5, col));
    }
    // drops sliding down the pane, each with a faint trail
    for (let i = 0; i < Math.round(w * h / 700); i++) {
      const dx = x + 2 + hash(i, seed + 9) * (w - 4), per = 2.6 + hash(seed, i + 4) * 3, ph = frac(t / per + hash(i, 7));
      const fall = ph < 0.55 ? 0 : E((ph - 0.55) / 0.45, "in"), dy = y + 4 + hash(i, seed + 3) * h * 0.55 + fall * h * 0.6;
      if (dy > y + h - 2) continue;
      A(g, 0.18, () => R(g, dx, dy - 10 * fall - 2, 1, 10 * fall + 2, col));
      A(g, 0.55, () => { R(g, dx, dy, 2, 2, mix(col, D.n2, 0.4)); R(g, dx, dy, 1, 1, D.cream); });
    }
  };

  // ======================= rating =======================
  // A quiet modern research room in London: rain on a tall sash window, grey daylight, a warm desk lamp. A mathematician
  // sorts a row of small equation cards along a kraft-paper strip with tent cards "UGLY" (left) and "BEAUTIFUL" (right).
  // o.sort (0.5) cards leave the pile one by one: picked up, carried, released, they glide to their place.
  // o.n cards (8). The most beautiful card (one short line) is placed last, at the right, with a small smile.
  K.rating = (o) => {
    const N = clamp(Math.round(o.n || 8), 3, 12);
    const ORDER = (() => { const r = PX.rnd(14 + N), a = [...Array(N - 1).keys()]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } a.push(N - 1); return a; })();
    const MATH = { skin: SK.warm, hair: HR.dark, hs: "bun", glasses: true, top: tri(mix(D.moss[2], D.n3, 0.2), 0.24, 0.42), cardigan: mix(D.cream, D.paperD, 0.3), collar: D.cream, cuff: mix(D.cream, D.paperD, 0.25) };
    const WALL = mix(mix(D.n3, D.paperD, 0.22), D.steel[2], 0.12), WOOD = tri(mix(D.amber[2], D.n3, 0.45), 0.22, 0.45);
    const OAK = tri(mix(mix(D.amber[2], D.rust[2], 0.35), D.n2, 0.38), 0.18, 0.45), KRAFT = mix(mix(D.paper, D.amber[1], 0.3), D.paperD, 0.3);
    const BOOKS = []; { const r = PX.rnd(51); const cols = [D.rust[2], D.steel[2], D.moss[2], D.paperD, D.n5, D.amber[2], D.teal[2], D.plum[2]];
      for (let s = 0; s < 4; s++) { let x = 472; while (x < 612) { const w = 4 + Math.floor(r() * 5), h = 22 + Math.floor(r() * 10); if (r() < 0.08) { x += 6; continue; } BOOKS.push([x, s, w, h, mix(cols[Math.floor(r() * cols.length)], D.n2, 0.3 + r() * 0.2), r() < 0.1]); x += w + (r() < 0.15 ? 2 : 0); } } }
    const ROOF = []; { const r = PX.rnd(8); let x = 18; while (x < 170) { const w = 16 + r() * 22, h = 18 + r() * 26; ROOF.push([x, w, h, r()]); x += w + 1; } }
    const k = 2.6, SX = 320, SY = 196;
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 6.0), tS = T("sort", 0.5), per = Math.max(0.25, (d * 4.6 / 6) / N);   // pace from the shot length, not the beat
      const SL = 168, SRt = 446, slotX = (s) => lerp(SL, SRt, s / (N - 1)), stripY = 270, pileX = 320, pileY = 306;
      const cards = ORDER.map((slot, i) => {
        const t0 = tS + i * per, pk = t0 + per * 0.3, rel = t0 + per * 0.62, gl = rel + per * 0.9;
        const relX = pileX + clamp(slotX(slot) - pileX, -50, 50), py = pileY - (N - 1 - i) * 1.3;
        let x = pileX, y = py, lift = 0, state = 0;
        if (t >= pk && t < rel) { const p = E((t - pk) / (rel - pk), "io"); x = lerp(pileX, relX, p); y = lerp(py, stripY, p); lift = Math.sin(p * Math.PI) * 6 + 1.5; state = 1; }
        else if (t >= rel) { const p = E((t - rel) / (gl - rel), "out"); x = lerp(relX, slotX(slot), p); y = stripY; state = p < 1 ? 2 : 3; }
        return { slot, i, x, y, lift, state, t0, pk, rel, gl, relX, py };
      });
      const active = cards.find((cd) => t >= cd.t0 && t < cd.rel + per * 0.3);
      const done = t >= cards[N - 1].gl;
      const lampF = 1 + Math.sin(t * 7.3) * 0.015 + Math.sin(t * 2.1) * 0.01;

      // ---- far: wall, rainy London through the sash window, whiteboard, bookshelf ----
      PX.par(g, c, 0.4, () => {
        R(g, -20, -20, 680, 400, WALL);
        PX.vgrad(g, -20, -20, 680, 260, mix(WALL, D.n2, 0.3), WALL, 6);
        R(g, -20, 226, 680, 6, mix(WALL, D.n1, 0.3));
        A(g, 0.1, () => poly(g, [[158, 20], [250, 36], [292, 236], [158, 236]], D.steel[0]));   // window light on the wall
        const wx = 26, wy = 14, ww = 128, wh = 200;
        R(g, wx - 7, wy - 7, ww + 14, wh + 12, mix(D.cream, D.n6, 0.4)); R(g, wx - 7, wy - 7, ww + 14, 2, mix(D.cream, D.n7, 0.3)); R(g, wx + ww + 5, wy - 5, 2, wh + 10, mix(D.cream, D.n4, 0.5));
        clip(g, wx, wy, ww, wh, () => {
          PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[0], D.n6, 0.4), mix(D.steel[1], D.n5, 0.45), 7);
          A(g, 0.45, () => { R(g, wx + 74, wy + 40, 14, 140, mix(D.steel[1], D.n6, 0.4)); R(g, wx + 92, wy + 66, 10, 120, mix(D.steel[1], D.n6, 0.45)); poly(g, [[wx + 22, wy + 170], [wx + 38, wy + 34], [wx + 54, wy + 170]], mix(D.steel[1], D.n6, 0.5)); });
          for (let i = 0; i < 6; i++) { const ly = wy + 48 + i * 9; if (PX.blink(t + i * 0.7, 9 + i, 0.92)) R(g, wx + 76 + (i % 2) * 6, ly, 2, 2, mix(D.lamp, D.n6, 0.35)); }
          for (const [x, w, h, rr] of ROOF) { const top = wy + wh - 40 - h, col = mix(D.steel[2], D.n4, 0.35);
            R(g, x, top, w, h + 60, col); poly(g, [[x - 2, top], [x + w * 0.5, top - 9], [x + w + 2, top]], mix(col, D.n3, 0.3));
            R(g, x + w * 0.3, top - 15, 5, 9, mix(D.rust[2], D.n4, 0.45)); R(g, x + w * 0.3 + 1, top - 17, 1, 2, D.n4); R(g, x + w * 0.3 + 3, top - 17, 1, 2, D.n4);
            for (let j = 0; j < 2; j++) R(g, x + 4 + j * (w - 10) * 0.7, top + 8, 4, 6, rr > 0.45 && j === 0 ? mix(D.lamp, D.n5, 0.25) : mix(col, D.n1, 0.25)); }
          rainGlass(g, wx, wy, ww, wh, t, 3, mix(D.steel[0], D.cream, 0.4));
          A(g, 0.12, () => R(g, wx, wy, ww, wh, D.steel[0]));
        });
        const fc = mix(D.cream, D.n6, 0.3), fd = mix(fc, D.n3, 0.35);
        for (const fx of [wx + 42, wx + 85]) R(g, fx, wy, 2, wh, fc);
        for (const fy of [wy + 49, wy + 150]) R(g, wx, fy, ww, 2, fc);
        R(g, wx - 2, wy + 98, ww + 4, 5, fc); R(g, wx - 2, wy + 102, ww + 4, 1, fd);
        R(g, wx - 10, wy + wh + 3, ww + 20, 5, mix(D.cream, D.n6, 0.35)); R(g, wx - 10, wy + wh + 3, ww + 20, 1, D.cream);
        // whiteboard in the room's shade: dim, old marker ghosts, one tidy line
        const bc = mix(mix(D.cream, D.n5, 0.62), D.steel[1], 0.1);
        R(g, 206, 36, 190, 104, mix(D.n5, D.n3, 0.3)); R(g, 208, 38, 186, 100, bc); PX.vgrad(g, 208, 38, 186, 100, mix(bc, D.cream, 0.08), mix(bc, D.n4, 0.25), 4);
        A(g, 0.16, () => { for (let i = 0; i < 5; i++) scribble(g, 222 + (i % 2) * 18, 50 + i * 16, 100 + hash(i, 2) * 40, 40 + i, D.steel[2], 1); });
        A(g, 0.55, () => { scribble(g, 226, 56, 64, 71, D.steel[2], 1); R(g, 224, 64, 70, 1, D.steel[2]); scribble(g, 234, 68, 46, 72, D.steel[2], 1); scribble(g, 300, 62, 40, 73, D.rust[2], 1); });
        R(g, 206, 140, 190, 3, mix(D.n5, D.n3, 0.4)); R(g, 222, 137, 9, 3, D.rust[1]); R(g, 234, 137, 9, 3, D.steel[1]);
        // bookshelf
        R(g, 464, 30, 156, 206, WOOD[2]); R(g, 468, 34, 148, 202, mix(WOOD[2], D.n0, 0.4));
        for (let s = 0; s < 4; s++) { const sy2 = 68 + s * 46; R(g, 468, sy2, 148, 4, WOOD[1]); R(g, 468, sy2, 148, 1, WOOD[0]); }
        for (const [bx, s, w, h, col, lean] of BOOKS) { const by = 68 + s * 46 - h; if (lean) { poly(g, [[bx, by + 4], [bx + w, by + 2], [bx + w + 3, by + h], [bx + 3, by + h]], col); continue; }
          R(g, bx, by, w, h, col); R(g, bx, by, 1, h, mix(col, D.cream, 0.15)); R(g, bx, by + 4, w, 1, mix(col, D.paper, 0.3)); R(g, bx, by + h - 5, w, 1, mix(col, D.paper, 0.25)); }
        R(g, 520, 20, 12, 10, mix(D.rust[2], D.n3, 0.3)); for (let i = 0; i < 5; i++) ell(g, 522 + i * 2, 14 - (i % 2) * 3 + Math.sin(t * 0.8 + i) * 0.5, 3, 4, i % 2 ? D.moss[2] : mix(D.moss[1], D.n3, 0.3));
        PX.glow(g, 548, 176, 150, D.lamp, 0.26 * lampF);
      });
      // ---- mid: the mathematician behind the long oak table ----
      PX.par(g, c, 0.85, () => {
        const rest = { L: [282, 296], R: [358, 296] };
        let hL = rest.L, hR = rest.R, look = -0.2, mouth = "flat", eye = "down", brow = -1, hd = 0, lean = 0;
        if (active) {
          const left = slotX(active.slot) < pileX, key = left ? "L" : "R", off = left ? 6 : -6;
          const grab = [pileX + off, active.py + 1];
          let h;
          if (t < active.pk) { const p = E((t - active.t0) / (active.pk - active.t0), "io"); h = [lerp(rest[key][0], grab[0], p), lerp(rest[key][1], grab[1], p)]; }
          else if (t < active.rel) h = [active.x + off, active.y - active.lift + 2];
          else { const p = E((t - active.rel) / (per * 0.3), "io"); h = [lerp(active.relX + off, rest[key][0], p), lerp(stripY + 1, rest[key][1], p)]; }
          if (left) hL = h; else hR = h;
          const tx = t < active.rel ? lerp(pileX, active.relX, E((t - active.t0) / (active.rel - active.t0), "io")) : active.x;
          look = clamp((tx - pileX) / 90, -1, 1); hd = look * 1.4; lean = 1.6;
          if (active.i === N - 1 && t > active.pk) { mouth = "smile"; brow = 0; }
        }
        if (done) { const p = E((t - cards[N - 1].gl) / 0.5, "out"); mouth = "smile"; brow = p > 0.4 ? 1 : 0; look = 0.9; hd = lerp(1.4, 2, p); eye = p > 0.5 ? "open" : "down"; }
        const bx = SX + hd * 0.4, by = SY + lean;
        // her shadow on the wall (lamp from the right, so it falls left)
        A(g, 0.07, () => { for (const gr of [0, 3]) { ell(g, bx - 44, by - 34, 19 + gr, 22 + gr, "#000000"); poly(g, [[bx - 80 - gr, by - 2], [bx - 14 + gr, by - 6], [bx - 4 + gr, by + 40], [bx - 86 - gr, by + 40]], "#000000"); } });
        // chair back behind her
        R(g, bx - 26, by - 4, 52, 34, mix(D.n2, D.steel[2], 0.25)); R(g, bx - 26, by - 4, 52, 2, mix(D.n4, D.steel[2], 0.3));
        fBust(g, bx, by, k, MATH, { t, noArms: true, headDx: hd, headDy: lean * 0.5, light: 1, face: { eye, look, lookY: 0.7, mouth, brow, ph: 0.4 } });
        // table top (hides the torso below the back edge), oak with grain
        const TB = 238, TF = 330;
        poly(g, [[46, TB], [594, TB], [636, TF], [4, TF]], OAK[1]);
        for (let i = 0; i < 14; i++) { const gy = TB + 3 + i * 6.4, kk = (gy - TB) / (TF - TB); A(g, 0.35, () => { const x0 = lerp(46, 4, kk), x1 = lerp(594, 636, kk); for (let x = x0; x < x1; x += 14 + hash(i, x) * 30) R(g, x, gy + Math.round(hash(x, i) * 2), 6 + hash(i, x) * 18, 1, i % 3 ? OAK[2] : OAK[0]); }); }
        R(g, 46, TB, 548, 1, OAK[0]);
        A(g, 0.16, () => poly(g, [[46, TB], [210, TB], [160, TF], [4, TF]], D.steel[0]));
        A(g, 0.22 * lampF, () => ell(g, 520, 280, 120, 40, D.lamp)); A(g, 0.14 * lampF, () => ell(g, 520, 276, 66, 22, D.lamp));
        R(g, 4, TF, 632, 8, OAK[2]); R(g, 4, TF, 632, 1, OAK[0]); R(g, 4, TF + 8, 632, 40, mix(D.n1, OAK[2], 0.25)); A(g, 0.4, () => R(g, 4, TF + 8, 632, 3, "#000000"));
        // kraft strip with slot ticks + the two tent cards
        const sy0 = stripY - 13, sy1 = stripY + 13;
        poly(g, [[90, sy0], [550, sy0], [553, sy1], [87, sy1]], KRAFT); R(g, 87, sy1, 466, 1, mix(KRAFT, D.n1, 0.45)); R(g, 90, sy0, 460, 1, mix(KRAFT, D.cream, 0.25));
        A(g, 0.3, () => { for (let x = 92; x < 548; x += 7) R(g, x + Math.round(hash(x, 1) * 3), stripY - 6 + Math.round(hash(x, 2) * 12), 2, 1, mix(KRAFT, D.n2, 0.4)); });
        for (let s = 0; s < N; s++) R(g, slotX(s), sy1 - 4, 1, 3, mix(KRAFT, D.n1, 0.5));
        pline(g, 150, sy1 - 2, 462, sy1 - 2, mix(KRAFT, D.n1, 0.35)); poly(g, [[462, sy1 - 5], [468, sy1 - 2], [462, sy1 + 1]], mix(KRAFT, D.n1, 0.35));
        const tent = (x, w, txt, col) => {
          A(g, 0.3, () => R(g, x + 2, stripY + 6, w, 3, "#000000"));
          poly(g, [[x, stripY - 16], [x + w, stripY - 16], [x + w + 1, stripY + 6], [x - 1, stripY + 6]], mix(D.cream, D.paper, 0.15));
          R(g, x - 1, stripY + 4, w + 2, 2, mix(D.paperD, D.n3, 0.3)); R(g, x, stripY - 16, w, 1, D.cream);
          PX.text(g, txt, x + w / 2, stripY - 10, { align: "center", col, size: 8 });
        };
        tent(96, 46, "UGLY", mix(D.rust[2], D.n2, 0.15));
        tent(470, 80, "BEAUTIFUL", mix(D.moss[2], D.n2, 0.3));
        const drawCard = (cd) => {
          const cx = Math.round(cd.x), cy = Math.round(cd.y - cd.lift), cplx = 1 - cd.slot / (N - 1), W2 = 17, H2 = 10;
          if (cd.lift > 0.5) shadow(g, cd.x + 3, cd.y + 4, 17, 6, 0.28); else A(g, 0.32, () => R(g, cx - W2 + 1, cy + H2, 2 * W2, 2, "#000000"));
          R(g, cx - W2, cy - H2, 2 * W2, 2 * H2, mix(D.cream, D.paper, 0.1)); R(g, cx - W2, cy + H2 - 1, 2 * W2, 1, D.paperD); R(g, cx - W2, cy - H2, 2 * W2, 1, D.cream);
          if (done && cd.slot === N - 1) A(g, 0.25, () => R(g, cx - W2, cy - H2, 2 * W2, 2 * H2, D.lamp));
          const ink = mix(D.ink, D.steel[2], 0.25), lines = 1 + Math.round(cplx * 3);
          if (cplx < 0.05) { scribble(g, cx - 7, cy - 1, 14, 900, ink, 0); }
          else for (let l = 0; l < lines; l++) { const lw = Math.round(lerp(14, 30, cplx) * (l === lines - 1 ? 0.65 : 1)); scribble(g, cx - W2 + 3, cy - H2 + 3 + l * 4 + (lines <= 2 ? 3 : 0), lw, cd.slot * 17 + l, ink, cplx); }
          if (cplx > 0.55) { R(g, cx - 12, cy + 1, 16, 1, ink); scribble(g, cx - 10, cy + 3, 10, cd.slot + 300, ink, 0); }
        };
        const pile = cards.filter((cd) => cd.state === 0);
        if (pile.length) shadow(g, pileX + 2, pileY + 11, 20, 4, 0.32);
        for (const cd of pile) drawCard({ ...cd, lift: 0 });
        for (const cd of cards) if (cd.state >= 2) drawCard(cd);
        // arms over the table, then the carried card under the fingers
        fArms(g, bx, by, k, MATH, hL, hR, t);
        for (const cd of cards) if (cd.state === 1) { drawCard(cd); const hh = slotX(cd.slot) < pileX ? hL : hR; ell(g, hh[0], hh[1] - 1, 2.5 * k, 1.7 * k, MATH.skin[1]); R(g, hh[0] - 3, hh[1] - 4, 5, 1, MATH.skin[0]); }
        // desk lamp (right), anglepoise
        const lc = mix(D.n2, D.steel[2], 0.3), ll = mix(lc, D.n6, 0.4);
        ell(g, 570, 258, 14, 4, lc); R(g, 557, 254, 26, 3, lc); R(g, 559, 254, 22, 1, ll);
        pline(g, 572, 254, 586, 198, lc, 2); pline(g, 586, 198, 546, 172, lc, 2); ell(g, 586, 198, 2, 2, ll);
        poly(g, [[532, 170], [552, 165], [559, 182], [527, 189]], lc); R(g, 532, 170, 18, 1, ll);
        PX.glow(g, 542, 188, 80, D.lamp, 0.42 * lampF); PX.glow(g, 542, 186, 14, D.cream, 0.5);
        A(g, 0.06 * lampF, () => poly(g, [[527, 189], [559, 182], [626, 300], [440, 310]], D.lamp));
        clipPoly(g, [[527, 189], [559, 182], [626, 300], [440, 310]], () => PX.particles(g, 21, 18, t, [440, 180, 190, 130], { vy: -2, vx: 1, col: D.lamp, a: 0.55, tw: 1.4 }));
      });
      // ---- foreground: mug with steam (left), notebook + pencil (right) ----
      PX.par(g, c, 1.1, () => {
        const mx = 66, my = 314, mc = mix(D.teal[2], D.n3, 0.3);
        shadow(g, mx + 3, my + 12, 16, 4, 0.38);
        R(g, mx - 11, my - 12, 22, 24, mc); R(g, mx - 11, my - 12, 4, 24, mix(mc, D.steel[0], 0.35)); R(g, mx + 6, my - 12, 5, 24, mix(mc, D.n0, 0.3));
        ell(g, mx, my - 12, 11, 3, mix(mc, D.cream, 0.2)); ell(g, mx, my - 12, 9, 2, mix(D.rust[2], D.n0, 0.5));
        R(g, mx + 11, my - 7, 5, 2, mc); R(g, mx + 14, my - 7, 2, 11, mc); R(g, mx + 11, my + 3, 5, 2, mc);
        for (let i = 0; i < 3; i++) { const ph = frac(t * 0.35 + i / 3), sy2 = my - 16 - ph * 30, sx2 = mx - 3 + i * 3 + Math.sin(ph * 6 + i) * 3; A(g, 0.25 * Math.sin(ph * Math.PI), () => R(g, sx2, sy2, 2, 5, D.cream)); }
        const ny = 334;
        poly(g, [[546, ny - 20], [620, ny - 24], [636, ny + 24], [556, ny + 30]], mix(D.rust[2], D.n2, 0.35)); poly(g, [[548, ny - 18], [618, ny - 22], [620, ny - 19], [550, ny - 15]], mix(D.rust[1], D.n3, 0.4));
        pline(g, 560, ny - 7, 606, ny - 15, D.amber[1], 2); R(g, 604, ny - 16, 3, 2, D.n2);
      });
      PX.vignette(g, 0.5);
    };
  };

  // ======================= gallery =======================
  // Split warm scene, two kinds of delight. Left: a visitor in a quiet gallery stands before a large landscape painting;
  // at o.paint (0.5) the picture light warms, she lifts her head, smiles and her hand comes to her chest.
  // Right: a teenager on a bed at dusk, headphones on; at o.song (2.5) she taps her phone, closes her eyes and nods to
  // the beat (small notes drift from the headphones, the lamp light warms her face). No brain imagery.
  K.gallery = (o) => {
    const VIS = { skin: SK.fair, hair: HR.auburn, hs: "long", top: tri(mix(mix(D.amber[2], D.paperD, 0.35), D.rust[2], 0.2), 0.24, 0.45), pants: tri(mix(D.n3, D.steel[2], 0.2), 0.2, 0.4), shoe: D.n1, coatLen: 24, scarf: tri(mix(D.teal[1], D.n3, 0.2), 0.28, 0.38) };
    const TEEN = { skin: SK.deep, hair: HR.black, hs: "curly", top: tri(mix(D.amber[2], D.paperD, 0.25), 0.25, 0.4), cuff: null };
    const GW = mix(mix(D.teal[2], D.moss[2], 0.35), D.n2, 0.3), FLOOR = tri(mix(D.amber[2], D.n2, 0.5), 0.2, 0.45), GILT = tri(mix(D.amber[1], D.paperD, 0.2), 0.35, 0.5);
    const FAR = { skin: SK.warm, hair: HR.grey, hs: "crop", top: tri(mix(D.n4, D.steel[2], 0.3)), pants: tri(D.n3), shoe: D.n1 };
    const DABS = []; { const r = PX.rnd(311); for (let i = 0; i < 520; i++) DABS.push([r(), r(), r(), r()]); }
    const NOTE = ["..#.", "..##", "..#.#", "..#..", "###..", "###.."];
    const PW = 318;   // panel width (left), right panel starts at 322
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 6.0), tP = T("paint", 0.5), tG = T("song", 2.5);
      const lit = E((t - tP) / 1.2, "io"), joy = E((t - tP - 0.4) / 0.8, "io"), hand = E((t - tP - 1.3) / 0.9, "io");
      const tap = t >= tG && t < tG + 0.35, play = t >= tG + 0.3, pl = E((t - tG - 0.3) / 0.8, "io"), bt = Math.max(0, t - tG - 0.3);

      // ================= LEFT: the gallery =================
      clip(g, 0, 0, PW, 360, () => {
        PX.par(g, c, 0.5, () => {
          PX.vgrad(g, -20, -20, PW + 40, 284, mix(GW, D.n1, 0.45), GW, 6);
          // ceiling track with two spots
          R(g, -20, -20, PW + 40, 34, mix(D.n1, GW, 0.25)); R(g, -20, 14, PW + 40, 2, mix(D.n2, GW, 0.3)); R(g, -20, 16, PW + 40, 1, mix(GW, D.n5, 0.3));
          for (const sx of [60, 212]) { R(g, sx - 3, 14, 6, 4, D.n1); poly(g, [[sx - 4, 18], [sx + 4, 18], [sx + 6, 26], [sx - 6, 26]], mix(D.n2, D.steel[2], 0.3)); R(g, sx - 5, 25, 10, 1, mix(D.cream, D.lamp, 0.5)); }
          // doorway into the next room (warmer, brighter), a far visitor drifts across it
          const dx0 = 262, dx1 = 306, dy0 = 92, dy1 = 262;
          R(g, dx0 - 4, dy0 - 4, dx1 - dx0 + 8, dy1 - dy0 + 4, mix(GW, D.n1, 0.35));
          PX.vgrad(g, dx0, dy0, dx1 - dx0, dy1 - dy0, mix(mix(D.paperD, D.lamp, 0.2), D.n4, 0.3), mix(D.paperD, D.n3, 0.5), 5);
          R(g, dx0, 226, dx1 - dx0, 36, mix(FLOOR[1], D.lamp, 0.2)); R(g, dx0 + 14, 130, 18, 14, mix(D.amber[2], D.n3, 0.3)); R(g, dx0 + 16, 132, 14, 10, mix(D.steel[1], D.paper, 0.4));
          const fv = frac(t / 12 + 0.25), fvx = lerp(dx0 - 16, dx1 + 16, fv);
          clip(g, dx0, dy0, dx1 - dx0, dy1 - dy0, () => A(g, 0.75, () => { const ph = t * 4.2, sw = Math.sin(ph);
            sFig(g, { P: FAR, x: fvx, y: 240 - 21 * 0.5 * 2, k: 0.5, dir: 1, t, legN: [sw * 20, sw * 20 - Math.max(0, Math.cos(ph)) * 20], legF: [-sw * 20, -sw * 20 - Math.max(0, -Math.cos(ph)) * 20], armN: [-sw * 14, -sw * 8], armF: [sw * 14, sw * 8], face: { eye: "open" } }); }));
          // skirting + floor (polished planks converging, painting reflected)
          R(g, -20, 256, PW + 40, 6, mix(GW, D.n1, 0.5)); R(g, -20, 256, PW + 40, 1, mix(GW, D.n5, 0.25));
          R(g, -20, 262, PW + 40, 120, FLOOR[1]);
          for (let i = -6; i < 16; i++) { const bx = i * 34; PX.line(g, 150 + (bx - 150) * 0.28, 262, bx, 380, FLOOR[2]); }
          for (let j = 0; j < 6; j++) { const yy = 262 + Math.round(4 * Math.pow(1.5, j)); A(g, 0.5, () => R(g, -20, yy, PW + 40, 1, FLOOR[2])); }
          for (let j = 0; j < 5; j++) A(g, (0.07 + 0.04 * lit) * (1 - j / 5), () => R(g, 46 + j * 6, 264 + j * 5, 170 - j * 12, 5, mix(D.lamp, FLOOR[1], 0.3)));
          A(g, 0.1, () => R(g, dx0, 264, dx1 - dx0, 20, D.lamp));
          // the painting: gilt frame, a calm landscape at golden hour
          const fx0 = 40, fy0 = 54, fw = 184, fh = 124, cx0 = fx0 + 8, cy0 = fy0 + 8, cw = fw - 16, ch = fh - 16;
          A(g, 0.4, () => R(g, fx0 + 3, fy0 + 4, fw, fh, "#000000"));
          R(g, fx0, fy0, fw, fh, GILT[2]); R(g, fx0 + 1, fy0 + 1, fw - 2, fh - 2, GILT[1]); R(g, fx0 + 1, fy0 + 1, fw - 2, 2, GILT[0]); R(g, fx0 + 1, fy0 + 1, 2, fh - 2, GILT[0]);
          for (let i = 0; i < 18; i++) { R(g, fx0 + 6 + i * 10, fy0 + 3, 4, 1, GILT[2]); R(g, fx0 + 6 + i * 10, fy0 + fh - 4, 4, 1, GILT[2]); }
          R(g, cx0 - 2, cy0 - 2, cw + 4, ch + 4, mix(GILT[2], D.n0, 0.4));
          clip(g, cx0, cy0, cw, ch, () => {
            const hz = cy0 + 60;
            PX.vgrad(g, cx0, cy0, cw, hz - cy0, mix(D.steel[1], D.steel[0], 0.4), mix(D.lamp, D.rose[1], 0.3), 7);
            ell(g, cx0 + 124, hz - 6, 9, 8, mix(D.lamp, D.cream, 0.4)); ell(g, cx0 + 124, hz - 6, 6, 5, mix(D.cream, D.lamp, 0.2));
            for (let i = 0; i < 5; i++) A(g, 0.6, () => { ell(g, cx0 + 20 + i * 34 + hash(i, 1) * 10, cy0 + 12 + hash(i, 2) * 26, 14 + hash(i, 3) * 8, 2, mix(D.rose[0], D.lamp, 0.4)); });
            poly(g, [[cx0 - 2, hz + 2], [cx0 + 20, hz - 20], [cx0 + 46, hz - 30], [cx0 + 70, hz - 14], [cx0 + 96, hz - 24], [cx0 + 130, hz - 8], [cx0 + 170, hz - 18], [cx0 + 172, hz + 2]], mix(mix(D.steel[1], D.plum[1], 0.35), D.rose[0], 0.25));
            poly(g, [[cx0 - 2, hz + 4], [cx0 + 30, hz - 8], [cx0 + 60, hz - 2], [cx0 + 100, hz - 10], [cx0 + 150, hz - 2], [cx0 + 172, hz - 6], [cx0 + 172, hz + 6]], mix(D.moss[1], D.steel[1], 0.4));
            PX.vgrad(g, cx0, hz + 4, cw, 24, mix(D.lamp, D.teal[1], 0.5), mix(D.teal[2], D.steel[2], 0.3), 4);
            for (let i = 0; i < 6; i++) R(g, cx0 + 118 - i * 1.5 + hash(i, 4) * 6, hz + 6 + i * 3, 12 - i, 1, mix(D.cream, D.lamp, 0.3));
            poly(g, [[cx0 - 2, hz + 26], [cx0 + 70, hz + 22], [cx0 + 172, hz + 30], [cx0 + 172, cy0 + ch + 2], [cx0 - 2, cy0 + ch + 2]], mix(D.moss[1], D.amber[2], 0.35));
            poly(g, [[cx0 + 60, cy0 + ch + 2], [cx0 + 84, hz + 26], [cx0 + 90, hz + 26], [cx0 + 96, cy0 + ch + 2]], mix(D.paperD, D.lamp, 0.25));
            for (let i = 0; i < 7; i++) { const tx = cx0 + 4 + i * 7, ty = hz + 18 - hash(i, 5) * 20; ell(g, tx, ty, 7, 14, i % 2 ? D.moss[2] : mix(D.moss[2], D.n1, 0.3)); }
            R(g, cx0 + 24, hz + 14, 2, 16, mix(D.rust[2], D.n1, 0.4)); ell(g, cx0 + 150, hz + 16, 9, 12, mix(D.moss[2], D.n1, 0.2)); R(g, cx0 + 150, hz + 22, 2, 10, D.n2);
            for (const [a, b, e, f] of DABS) A(g, 0.14, () => R(g, cx0 + a * cw, cy0 + b * ch, 1 + Math.round(e), 1, f < 0.5 ? D.cream : D.n1));
          });
          // picture light (brass) and its warm wash
          R(g, 96, 44, 72, 4, mix(D.amber[2], D.n2, 0.2)); R(g, 96, 44, 72, 1, GILT[0]); R(g, 130, 38, 2, 6, mix(D.amber[2], D.n2, 0.3)); R(g, 128, 36, 6, 3, mix(D.amber[2], D.n2, 0.3));
          clip(g, fx0, 48, fw, fh + 6, () => { A(g, 0.04 + 0.08 * lit, () => poly(g, [[96, 48], [168, 48], [236, 186], [28, 186]], D.lamp)); A(g, 0.04 + 0.06 * lit, () => poly(g, [[106, 48], [158, 48], [200, 120], [64, 120]], D.lamp)); });
          PX.glow(g, 132, 50, 40 + 20 * lit, D.lamp, 0.16 + 0.16 * lit);
          clipPoly(g, [[96, 48], [168, 48], [236, 186], [28, 186]], () => PX.particles(g, 61, 22, t, [20, 40, 230, 160], { vy: -1.5, vx: 0.8, col: D.lamp, a: 0.3 + 0.35 * lit, tw: 1.2 }));
          // small wall label (lines only)
          R(g, 234, 118, 16, 12, mix(D.cream, D.paper, 0.2)); for (let i = 0; i < 3; i++) R(g, 236, 121 + i * 3, 10 - i * 2, 1, D.n5);
          // bench
          const bc = mix(D.rust[2], D.n1, 0.45);
          shadow(g, 130, 300, 64, 5, 0.3);
          R(g, 74, 268, 116, 9, bc); R(g, 74, 268, 116, 2, mix(bc, D.lamp, 0.25)); R(g, 74, 277, 116, 3, mix(bc, D.n0, 0.4));
          for (const lx of [82, 178]) { R(g, lx, 280, 4, 18, D.n1); R(g, lx, 280, 1, 18, mix(D.n3, D.lamp, 0.3)); }
        });
        // the visitor (nearest layer)
        PX.par(g, c, 0.9, () => {
          const x = 248, y = 350, k = 1.75, sway = Math.sin(t * 0.9) * 0.8;
          shadow(g, x + 2, y + 1, 16, 3, 0.4);
          const chest = [x - 7 * k, y - 44 * k - 18 * k];
          sFig(g, { P: VIS, x: x + sway * 0.3, y: y - 44 * k, k, dir: -1, t, ph: 1, lean: lerp(2, -3, joy) + sway * 0.4, legN: [2, 0], legF: [-3, 0],
            handN: [lerp(x - 3 * k, chest[0], hand), lerp(y - 44 * k + 1 * k, chest[1], hand)], armF: [-6, -2], bendN: 1,
            head: { tilt: lerp(4, -9, joy), dy: 0 }, rim: mix(D.lamp, VIS.top[0], 0.4 + 0.3 * lit),
            face: { eye: "open", mouth: joy > 0.5 ? "smile" : "flat", brow: joy > 0.5 ? 1 : 0, blush: joy * 0.8, ph: 0.7 } });
        });
        vig(g, 0, 0, PW, 360, 0.5);
      });

      // ================= RIGHT: the bedroom at dusk =================
      const X0 = 322;
      clip(g, X0, 0, 640 - X0, 360, () => {
        const WARM = mix(mix(D.paperD, D.rust[2], 0.22), D.n3, 0.52), lampA = 0.35 + 0.2 * pl;
        PX.par(g, c, 0.5, () => {
          PX.vgrad(g, X0 - 10, -20, 340, 260, mix(WARM, D.n1, 0.4), WARM, 6);
          // window at dusk with curtains
          const wx = 548, wy = 40, ww = 78, wh = 116;
          R(g, wx - 5, wy - 5, ww + 10, wh + 10, mix(D.cream, D.n5, 0.45));
          clip(g, wx, wy, ww, wh, () => {
            PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[2], D.n2, 0.2), mix(D.lamp, D.rose[0], 0.4), 7);
            R(g, wx + 52, wy + 18, 1, 1, D.cream); R(g, wx + 20, wy + 10, 1, 1, mix(D.cream, D.steel[0], 0.4));
            for (let i = 0; i < 6; i++) { const bx = wx - 4 + i * 16, bh = 16 + hash(i, 9) * 26; R(g, bx, wy + wh - bh, 15, bh, mix(D.n2, D.steel[2], 0.3)); if (hash(i, 3) > 0.4) R(g, bx + 5, wy + wh - bh + 6, 3, 3, mix(D.lamp, D.n4, 0.2)); }
            ell(g, wx + 12, wy + wh - 30, 14, 18, mix(D.n1, D.moss[2], 0.3));
          });
          R(g, wx + ww / 2 - 1, wy, 2, wh, mix(D.cream, D.n5, 0.45)); R(g, wx, wy + wh / 2, ww, 2, mix(D.cream, D.n5, 0.45));
          R(g, wx - 8, wy + wh + 4, ww + 16, 4, mix(D.cream, D.n5, 0.4));
          const cur = mix(D.moss[2], D.n3, 0.35);
          for (const sx of [wx - 12, wx + ww + 2]) { R(g, sx, wy - 8, 10, wh + 24, cur); for (let i = 0; i < 3; i++) R(g, sx + 2 + i * 3, wy - 8, 1, wh + 24, mix(cur, D.n0, 0.3)); }
          R(g, wx - 16, wy - 10, ww + 32, 2, D.n2);
          // record on the wall + a print, a shelf with a speaker and books
          PX.circle(g, 404, 82, 22, mix(D.n1, D.n2, 0.5)); for (const r of [18, 14, 10]) PX.circle(g, 404, 82, r, r % 8 ? mix(D.n1, D.n3, 0.35) : mix(D.n1, D.n2, 0.6)); PX.circle(g, 404, 82, 6, mix(D.rust[1], D.paperD, 0.3)); R(g, 404, 82, 1, 1, D.n0);
          A(g, 0.3, () => R(g, 394, 66, 6, 2, D.cream));
          R(g, 444, 48, 56, 70, mix(D.paper, D.n4, 0.4)); PX.vgrad(g, 448, 52, 48, 62, mix(D.teal[1], D.n4, 0.3), mix(D.amber[1], D.rose[1], 0.5), 4); PX.circle(g, 472, 86, 10, mix(D.rust[1], D.amber[2], 0.4)); poly(g, [[448, 114], [462, 96], [478, 106], [496, 92], [496, 114]], mix(D.teal[2], D.n2, 0.2));
          for (const [px, py] of [[446, 49], [496, 49]]) R(g, px, py, 3, 2, mix(D.paper, D.amber[0], 0.3));
          R(g, 508, 132, 34, 3, mix(D.amber[2], D.n2, 0.4)); R(g, 512, 116, 10, 16, D.n2); PX.circle(g, 517, 121, 2, D.n4); PX.circle(g, 517, 127, 3, D.n4); for (let i = 0; i < 4; i++) R(g, 526 + i * 4, 120 + (i % 2) * 2, 3, 12 - (i % 2) * 2, [D.rust[2], D.steel[2], D.moss[2], D.paperD][i]);
          // bedside table + lamp
          R(g, 326, 226, 38, 70, mix(D.amber[2], D.n2, 0.45)); R(g, 326, 226, 38, 3, mix(D.amber[1], D.n3, 0.35)); R(g, 330, 244, 30, 1, mix(D.amber[2], D.n1, 0.6));
          R(g, 342, 204, 4, 22, D.n2); poly(g, [[334, 186], [354, 186], [358, 206], [330, 206]], mix(D.cream, D.lamp, 0.35)); R(g, 330, 205, 28, 1, mix(D.lampD, D.n3, 0.3));
          PX.glow(g, 344, 200, 90, D.lamp, lampA * 0.75); PX.glow(g, 344, 198, 18, D.cream, 0.3);
          // headboard + bed
          R(g, 364, 176, 290, 58, mix(D.amber[2], D.n2, 0.5)); R(g, 364, 176, 290, 3, mix(D.amber[1], D.n3, 0.4)); for (let i = 0; i < 8; i++) R(g, 372 + i * 34, 182, 1, 52, mix(D.amber[2], D.n1, 0.6));
          const duv = tri(mix(D.steel[2], D.teal[2], 0.4), 0.2, 0.42);
          R(g, 356, 232, 300, 18, mix(D.paperD, D.n4, 0.3)); R(g, 356, 232, 300, 1, mix(D.paper, D.lamp, 0.3));
          poly(g, [[352, 246], [660, 246], [660, 334], [348, 334]], duv[1]); R(g, 352, 246, 308, 2, duv[0]);
          for (let i = 0; i < 9; i++) { const sx = 360 + i * 32; A(g, 0.35, () => { R(g, sx, 256, 12, 2, duv[0]); R(g, sx + 14, 276, 12, 2, duv[0]); R(g, sx + 4, 298, 12, 2, duv[0]); }); }
          R(g, 348, 334, 312, 4, duv[2]); R(g, -20 + X0, 338, 340, 30, mix(D.n1, D.rust[2], 0.15));
          A(g, 0.25 * lampA, () => ell(g, 380, 260, 70, 26, D.lamp));
          // pillows behind her
          ell(g, 426, 222, 26, 14, mix(D.paperD, D.n3, 0.5)); ell(g, 498, 224, 24, 13, mix(D.rose[2], D.n3, 0.4)); ell(g, 426, 219, 22, 10, mix(D.paperD, D.n4, 0.4)); ell(g, 498, 221, 19, 9, mix(D.rose[2], D.paperD, 0.3));
        });
        PX.par(g, c, 0.9, () => {
          const x = 462, beat = play ? 0.5 - 0.5 * Math.cos(bt * Math.PI * 4) : 0, sway = play ? Math.sin(bt * Math.PI * 2) * pl : 0;
          const k = 2.1, sy = 206 + beat * 1.4 * pl;
          // hood behind the neck
          ell(g, x, sy - 3, 16, 8, TEEN.top[2]); ell(g, x, sy - 4, 12, 5, mix(TEEN.top[2], D.n0, 0.3));
          const B = fBust(g, x, sy, k, TEEN, { t, noArms: true, bot: 266, headDx: sway * 1.4, headDy: beat * 1.6 * pl, light: -1,
            face: { eye: play ? "happy" : "down", look: play ? 0 : 0.1, lookY: 0.8, mouth: play ? (pl > 0.6 ? "smile" : "flat") : "flat", brow: play ? 1 : 0, blush: pl * 0.4, turn: sway * 0.35, ph: 1.3 } });
          // headphones: band over the head, cups on the ears
          const [hcx, hcy] = B.head, hc = mix(D.n2, D.steel[2], 0.25), hl = mix(hc, D.n6, 0.4), cupC = mix(D.n6, D.n4, 0.45);
          for (let i = 0; i <= 16; i++) { const a = Math.PI * (1 + i / 16), px2 = hcx + Math.cos(a) * 7.4 * k, py2 = hcy - 1 * k + Math.sin(a) * 8.6 * k; R(g, px2 - 1, py2 - 1, 3, 3, hc); if (i > 3 && i < 13) R(g, px2, py2 - 1, 1, 1, hl); }
          for (const sx of [-1, 1]) { const ux = hcx + sx * 7.6 * k; ell(g, ux, hcy + 1 * k, 2.2 * k, 3.2 * k, cupC); R(g, ux - 1.2 * k, hcy - 1.4 * k, 2.4 * k, 1, mix(cupC, D.cream, 0.3)); R(g, ux + (sx < 0 ? -2.4 * k : 1.4 * k), hcy - 0.6 * k, k, 3.6 * k, hc); }
          // drawstrings
          poly(g, [[x - 8, sy], [x + 8, sy], [x + 4, sy + 6], [x - 4, sy + 6]], TEEN.top[0]);
          R(g, x - 4, sy + 6, 1, 11, mix(D.cream, D.paperD, 0.3)); R(g, x + 3, sy + 6, 1, 10, mix(D.cream, D.paperD, 0.3));
          // crossed legs (jeans) on the bed, socks
          const jean = tri(mix(D.steel[1], D.n3, 0.25), 0.2, 0.4), lap = 270;
          const tapY = play && beat > 0.6 ? -1 : 0, sock = mix(D.paper, D.n5, 0.25);
          ell(g, x, lap - 2, 22, 7, jean[2]);                                                      // hips
          limb(g, x + 10, lap - 4, x + 34, lap + 1, 13, jean[2]); limb(g, x + 34, lap + 2, x - 6, lap + 9, 10, mix(jean[1], jean[2], 0.5));   // right leg (behind)
          ell(g, x - 12, lap + 10 + tapY, 6, 3, sock);
          limb(g, x - 10, lap - 4, x - 34, lap + 1, 13, jean[1]); limb(g, x - 34, lap + 3, x + 8, lap + 9, 10, jean[1]);                     // left leg (front)
          seg(g, x - 30, lap - 3, x - 14, lap - 6, 2, jean[0]); seg(g, x - 28, lap + 1, x + 4, lap + 6, 1, jean[0]);
          ell(g, x + 12, lap + 9, 6, 3, sock); R(g, x + 8, lap + 7, 6, 1, mix(sock, D.cream, 0.3));
          shadow(g, x, lap + 13, 40, 3, 0.3);
          // arms to the phone in her lap
          const ph = [x + 2, 254], thumb = tap ? -2 : 0;
          fArms(g, x, sy, k, TEEN, [ph[0] - 6, ph[1] + 2], [ph[0] + 6, ph[1] + 1 + thumb], t);
          R(g, ph[0] - 4, ph[1] - 8, 8, 12, D.n1); R(g, ph[0] - 3, ph[1] - 7, 6, 9, mix(D.teal[0], D.n3, play ? 0.55 : 0.35));
          if (tap) A(g, 0.6, () => R(g, ph[0] - 1, ph[1] - 4, 2, 2, D.cream));
          // notes drifting from the headphones
          if (play) for (let i = 0; i < 3; i++) { const ph2 = frac(bt / 2.4 + i / 3), nx = hcx + 14 * k + ph2 * 26 + Math.sin(ph2 * 5 + i) * 3, ny = hcy - 4 - ph2 * 40;
            A(g, Math.sin(ph2 * Math.PI) * 0.75 * pl, () => PX.sprite(g, NOTE, nx, ny, { "#": mix(D.cream, D.lamp, 0.4) }, 1)); }
        });
        vig(g, X0, 0, 640 - X0, 360, 0.5);
      });
      // divider
      R(g, PW, 0, X0 - PW, 360, D.n0); R(g, PW + 1, 0, 1, 360, mix(D.n0, D.n3, 0.4));
    };
  };

  // ======================= notebook =======================
  // 1930s New York apartment at night: a 14-year-old boy (short dark hair, knit sweater) at a small desk by the window
  // (city lights, water towers, a far elevated train, fire escape), radiator, gooseneck lamp, cathedral radio.
  // o.write (0.5) he writes in his notebook; o.big (3.5) a close insert of the page opens beside him: big bold
  // handwritten e^(iπ) + 1 = 0 is written stroke by stroke, then underlined twice, and he grins.
  K.notebook = (o) => {
    const BOY = { skin: SK.fair, hair: HR.black, hs: "short", top: tri(mix(D.steel[2], D.teal[2], 0.35), 0.24, 0.42), collar: D.cream, cuff: null, pants: tri(mix(D.n4, D.paperD, 0.2), 0.2, 0.4), shoe: mix(D.n1, D.rust[2], 0.2), rib: true };
    const WALLP = mix(mix(D.paperD, D.moss[2], 0.3), D.n2, 0.55), WOOD = tri(mix(D.amber[2], D.rust[2], 0.3), 0.22, 0.48);
    const CITY = []; { const r = PX.rnd(1932); let x = 336; while (x < 504) { const w = 12 + r() * 20, h = 30 + r() * 80; CITY.push([x, w, h, r(), r() < 0.35]); x += w + (r() < 0.3 ? 3 : 0); } }
    const FAR = []; { const r = PX.rnd(77); let x = 336; while (x < 504) { const w = 8 + r() * 14, h = 50 + r() * 80; FAR.push([x, w, h]); x += w; } }
    const WIN = []; { const r = PX.rnd(5); for (const [bx, w, h] of CITY) for (let wy = 0; wy < h - 6; wy += 6) for (let wx = 3; wx < w - 3; wx += 5) if (r() < 0.33) WIN.push([bx + wx, h - wy, r()]); }
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8.0), tW = T("write", 0.5), tB = T("big", 3.5), sd = d / 8;
      const ins = E((t - tB) / (0.45 * sd), "out");                                   // insert open
      const wr0 = tB + 0.45 * sd, wr1 = wr0 + 2.2 * sd, u1 = wr1 + 0.15 * sd, u2 = u1 + 0.45 * sd, uEnd = u2 + 0.35 * sd;
      const pEq = clamp((t - wr0) / (wr1 - wr0), 0, 1), pU1 = clamp((t - u1) / (0.3 * sd), 0, 1), pU2 = clamp((t - u2) / (0.3 * sd), 0, 1);
      const grin = E((t - u1 - 0.1 * sd) / (0.4 * sd), "out");
      const writing = (t >= tW && t < tB) || (t >= wr0 && t < uEnd);
      const lampF = 1 + Math.sin(t * 6.1) * 0.012 + Math.sin(t * 1.7) * 0.01;
      const deskY = 258, hipX = 172, hipY = 292;

      // ---- far: the window onto the city at night ----
      PX.par(g, c, 0.35, () => {
        const wx = 340, wy = 26, ww = 160, wh = 180;
        clip(g, wx, wy, ww, wh, () => {
          PX.vgrad(g, wx, wy, ww, wh, mix(D.n1, D.steel[2], 0.35), mix(D.steel[2], D.rust[2], 0.25), 7);
          PX.circle(g, wx + 104, wy + 26, 7, mix(D.cream, D.steel[0], 0.25)); PX.circle(g, wx + 107, wy + 24, 6, mix(D.steel[2], D.n1, 0.2));
          for (let i = 0; i < 9; i++) R(g, wx + hash(i, 4) * ww, wy + hash(i, 5) * 60, 1, 1, mix(D.cream, D.steel[1], 0.4 + 0.3 * Math.sin(t * 1.3 + i)));
          for (const [x, w, h] of FAR) R(g, x, wy + wh - h - 30, w, h + 40, mix(D.n2, D.steel[2], 0.35));
          // elevated train far off, crossing now and then
          const tr = frac((t - 1.5) / 7), trx = lerp(wx - 120, wx + ww + 20, tr);
          R(g, wx, wy + wh - 52, ww, 2, mix(D.n1, D.steel[2], 0.3));
          for (let i = 0; i < 4; i++) { const cx2 = trx + i * 26; R(g, cx2, wy + wh - 60, 24, 8, mix(D.n1, D.steel[2], 0.25)); for (let j = 0; j < 5; j++) R(g, cx2 + 2 + j * 4.4, wy + wh - 58, 2, 2, mix(D.lamp, D.amber[1], 0.4)); }
          for (const [x, w, h, rr, tower] of CITY) {
            const top = wy + wh - h, col = mix(D.n1, D.steel[2], 0.18);
            R(g, x, top, w, h + 10, col); R(g, x, top, w, 1, mix(col, D.steel[1], 0.35));
            if (tower) { const tx = x + w * 0.3; R(g, tx, top - 8, 1, 8, col); R(g, tx + 7, top - 8, 1, 8, col); R(g, tx - 1, top - 16, 10, 9, col); poly(g, [[tx - 2, top - 16], [tx + 4, top - 21], [tx + 10, top - 16]], col); R(g, tx - 1, top - 13, 10, 1, mix(col, D.steel[1], 0.3)); }
          }
          for (const [x, yy, rr] of WIN) { const on = Math.sin(t * 0.4 + rr * 40) > -0.85; R(g, x, wy + wh - yy, 2, 2, on ? mix(D.lamp, D.amber[1], rr * 0.5) : mix(D.n2, D.amber[2], 0.2)); }
          // fire escape outside: rail, balusters, ladder
          const fe = mix(D.n0, D.n2, 0.4), fy = wy + wh - 34;
          R(g, wx, fy, ww, 2, fe); R(g, wx, fy + 14, ww, 2, fe); for (let x = wx + 4; x < wx + ww; x += 7) R(g, x, fy, 1, 16, fe);
          pline(g, wx + 90, fy + 16, wx + 120, wy + wh, fe); pline(g, wx + 98, fy + 16, wx + 128, wy + wh, fe);
          A(g, 0.1, () => R(g, wx, wy, ww, wh, D.steel[0]));
        });
      });
      // ---- room: wallpaper, window frame, shelf with radio, radiator, floor ----
      PX.par(g, c, 0.6, () => {
        clipPoly(g, [[-30, -30], [670, -30], [670, 300], [-30, 300]], () => {
          // wall around the window (the window hole stays open)
          const wx = 340, wy = 26, ww = 160, wh = 180;
          const wall = (x, y, w, h) => { R(g, x, y, w, h, WALLP); for (let sx = x - (x % 14); sx < x + w; sx += 14) { R(g, Math.max(x, sx), y, 2, h, mix(WALLP, D.paper, 0.12)); for (let sy = y - (y % 18) + ((sx / 14) % 2) * 9; sy < y + h; sy += 18) R(g, sx + 7, sy, 2, 2, mix(WALLP, D.rose[1], 0.25)); } };
          wall(-30, -30, wx + 30, 330); wall(wx + ww, -30, 670 - wx - ww, 330); wall(wx, -30, ww, wy + 30); wall(wx, wy + wh, ww, 300 - wy - wh);
          PX.vgrad(g, -30, -30, 700, 40, mix(D.n0, WALLP, 0.4), mix(D.n0, WALLP, 0.85), 3);
          R(g, -30, 286, 700, 14, mix(WOOD[2], D.n0, 0.3)); R(g, -30, 286, 700, 1, WOOD[1]);
          // window frame + sill + curtains
          const fc = mix(D.cream, D.n5, 0.45);
          R(g, wx - 6, wy - 6, ww + 12, 6, fc); R(g, wx - 6, wy, 6, wh, fc); R(g, wx + ww, wy, 6, wh, fc); R(g, wx - 10, wy + wh, ww + 20, 6, fc); R(g, wx - 10, wy + wh, ww + 20, 1, mix(fc, D.lamp, 0.4));
          R(g, wx, wy + wh / 2 - 2, ww, 4, fc); R(g, wx + ww / 2 - 1, wy, 2, wh, fc);
          const cu = mix(D.rust[2], D.n2, 0.35);
          for (const [cx2, w] of [[wx - 22, 18], [wx + ww + 4, 18]]) { R(g, cx2, wy - 14, w, wh + 40, cu); for (let i = 0; i < 4; i++) R(g, cx2 + 2 + i * 4, wy - 14, 1, wh + 40, mix(cu, D.n0, 0.35)); R(g, cx2, wy - 14, w, 2, mix(cu, D.n0, 0.5)); }
          R(g, wx - 26, wy - 16, ww + 52, 3, mix(D.amber[2], D.n2, 0.3));
          // radiator under the window, heat shimmer above it
          const rx = 356, ry = 222, rc = mix(D.n5, D.paperD, 0.25);
          R(g, rx, ry, 108, 4, rc); for (let i = 0; i < 12; i++) { R(g, rx + 2 + i * 9, ry + 2, 7, 58, mix(rc, D.n3, 0.25)); R(g, rx + 2 + i * 9, ry + 2, 2, 58, mix(rc, D.cream, 0.15)); R(g, rx + 7 + i * 9, ry + 2, 2, 58, mix(rc, D.n1, 0.4)); }
          R(g, rx, ry + 58, 108, 3, mix(rc, D.n1, 0.4)); R(g, rx + 112, ry + 40, 6, 6, mix(rc, D.n2, 0.3));
          for (let i = 0; i < 6; i++) { const ph = frac(t * 0.5 + i / 6); A(g, 0.12 * Math.sin(ph * Math.PI), () => R(g, rx + 8 + i * 18 + Math.sin(t * 3 + i) * 2, ry - 4 - ph * 22, 1, 6, D.cream)); }
          // shelf (left) with books and a cathedral radio, a framed photo
          R(g, 20, 120, 110, 4, WOOD[1]); R(g, 20, 120, 110, 1, WOOD[0]); R(g, 28, 124, 3, 8, WOOD[2]); R(g, 118, 124, 3, 8, WOOD[2]);
          for (let i = 0; i < 7; i++) R(g, 24 + i * 6, 96 + (i % 3), 5, 24 - (i % 3), [mix(D.rust[2], D.n2, 0.3), mix(D.moss[2], D.n2, 0.3), mix(D.steel[2], D.n2, 0.2), mix(D.paperD, D.n3, 0.4)][i % 4]);
          const rcx = 98; poly(g, [[rcx - 14, 120], [rcx - 14, 98], [rcx - 10, 90], [rcx, 86], [rcx + 10, 90], [rcx + 14, 98], [rcx + 14, 120]], WOOD[1]);
          poly(g, [[rcx - 9, 114], [rcx - 9, 100], [rcx - 6, 94], [rcx, 92], [rcx + 6, 94], [rcx + 9, 100], [rcx + 9, 114]], mix(D.paperD, D.n3, 0.45));
          for (let i = 0; i < 4; i++) R(g, rcx - 6 + i * 4, 96, 1, 18, mix(WOOD[2], D.n0, 0.2));
          R(g, rcx - 4, 116, 8, 2, mix(D.amber[1], D.lampD, 0.5)); PX.glow(g, rcx, 117, 6, D.amber[1], 0.25);
          R(g, 52, 54, 26, 32, WOOD[2]); R(g, 55, 57, 20, 26, mix(D.paperD, D.n3, 0.35)); ell(g, 65, 66, 4, 5, mix(D.paperD, D.n2, 0.5)); R(g, 59, 72, 12, 10, mix(D.paperD, D.n2, 0.5));
          // the gooseneck lamp's warm pool on the wall
          PX.glow(g, 368, 214, 150, D.lamp, 0.26 * lampF);
        });
        // floor + rug
        R(g, -30, 300, 700, 80, mix(WOOD[2], D.n1, 0.45)); for (let i = 0; i < 5; i++) R(g, -30, 304 + i * 12, 700, 1, mix(WOOD[2], D.n0, 0.55));
        ell(g, 200, 326, 140, 18, mix(D.rust[2], D.n2, 0.45)); ell(g, 200, 326, 128, 14, mix(D.rust[2], D.n2, 0.55)); A(g, 0.4, () => ell(g, 200, 326, 128, 1, D.amber[2]));
        A(g, 0.12 * lampF, () => ell(g, 270, 320, 120, 16, D.lamp));
      });
      // ---- near: desk, lamp, chair, the boy ----
      PX.par(g, c, 0.9, () => {
        // desk (side-on, top surface seen a little from above)
        const dx0 = 204, dx1 = 412;
        shadow(g, (dx0 + dx1) / 2, 318, 80, 6, 0.35);
        poly(g, [[dx0 + 4, deskY - 8], [dx1 - 2, deskY - 8], [dx1, deskY], [dx0, deskY]], WOOD[1]); R(g, dx0, deskY, dx1 - dx0, 6, WOOD[2]); R(g, dx0, deskY - 8, dx1 - dx0, 1, WOOD[0]);
        R(g, dx0 + 4, deskY + 6, 4, 72, WOOD[2]); R(g, dx1 - 8, deskY + 6, 4, 72, WOOD[2]); R(g, dx0 + 4, deskY + 6, 1, 72, WOOD[1]);
        R(g, dx0 + 40, deskY + 6, 70, 16, mix(WOOD[2], D.n1, 0.2)); R(g, dx0 + 70, deskY + 12, 10, 2, D.amber[2]);
        // things on the desk: inkwell, books, the notebook (open)
        R(g, 330, deskY - 18, 22, 12, mix(D.rust[2], D.n2, 0.3)); R(g, 328, deskY - 23, 24, 5, mix(D.moss[2], D.n2, 0.3)); R(g, 328, deskY - 23, 24, 1, mix(D.moss[1], D.n3, 0.3));
        R(g, 300, deskY - 10, 7, 7, mix(D.n1, D.steel[2], 0.3)); R(g, 301, deskY - 11, 5, 1, mix(D.steel[1], D.n3, 0.3)); pline(g, 304, deskY - 11, 310, deskY - 22, mix(D.cream, D.n6, 0.3));
        poly(g, [[208, deskY - 4], [232, deskY - 7], [258, deskY - 4], [258, deskY - 1], [208, deskY - 1]], D.cream);
        R(g, 231, deskY - 7, 2, 6, mix(D.paperD, D.n3, 0.3));
        const wp = clamp((t - tW) / (tB - tW), 0, 1);
        for (let l = 0; l < 3; l++) { const lp = clamp(wp * 3 - l, 0, 1); if (lp > 0) R(g, 236, deskY - 6 + l * 2, Math.round(18 * lp), 1, mix(D.ink, D.paperD, 0.3)); }
        // gooseneck lamp: round base, stem, curved neck, dome shade facing down-left at the page
        const lc = mix(D.amber[2], D.n2, 0.3), ll = mix(D.amber[1], D.paperD, 0.35), lx = 398;
        ell(g, lx, deskY - 9, 10, 3, lc); R(g, lx - 8, deskY - 11, 16, 2, ll);
        R(g, lx - 1, deskY - 52, 2, 42, lc); R(g, lx - 1, deskY - 52, 1, 42, ll);
        for (let i = 0; i <= 10; i++) { const a = i / 10, px2 = lx - Math.sin(a * Math.PI / 2) * 22, py2 = deskY - 52 - Math.sin(a * Math.PI) * 10 + a * 2; R(g, px2 - 1, py2 - 1, 2, 2, lc); }
        poly(g, [[364, deskY - 58], [380, deskY - 64], [388, deskY - 52], [370, deskY - 42], [362, deskY - 46]], lc); R(g, 366, deskY - 60, 12, 1, ll);
        PX.glow(g, 368, deskY - 46, 80, D.lamp, 0.3 * lampF); PX.glow(g, 368, deskY - 46, 9, D.cream, 0.4);
        A(g, 0.07 * lampF, () => poly(g, [[362, deskY - 46], [372, deskY - 42], [300, deskY - 8], [200, deskY - 8]], D.lamp));
        PX.particles(g, 33, 12, t, [220, 190, 140, 56], { vy: -1.5, vx: 0.8, col: D.lamp, a: 0.45, tw: 1.3 });
        // chair (behind the boy)
        const ch = mix(D.amber[2], D.n2, 0.5), chL = mix(ch, D.lamp, 0.2);
        R(g, hipX - 24, hipY - 64, 5, 116, ch); R(g, hipX - 24, hipY - 64, 1, 116, chL); R(g, hipX - 25, hipY - 66, 12, 5, ch); R(g, hipX - 24, hipY - 40, 5, 3, mix(ch, D.n1, 0.3));
        // the boy, side view, writing
        const wq = writing ? t * 5.3 : 0, wx2 = Math.sin(wq) * 2.2 + (writing ? ((t * 2.1) % 1) * 4 : 0), wy2 = Math.cos(wq * 1.7) * 0.9;
        const lean = 22 + Math.sin(t * 0.7) * 0.6 - grin * 6, tilt = lerp(12, -4, grin);
        const F = sFig(g, { P: BOY, x: hipX, y: hipY, k: 2.0, dir: 1, t, ph: 0.6, lean, legN: [86, 4], legF: [82, -4],
          handN: [238 + wx2, deskY - 5 + wy2], handF: [214, deskY - 4], bendN: 1, bendF: 1, rim: mix(BOY.top[0], D.lamp, 0.5),
          head: { tilt, dx: lerp(0.5, -0.5, grin) },
          under: () => { R(g, hipX - 24, hipY + 3, 46, 6, ch); R(g, hipX - 24, hipY + 3, 46, 1, chL); R(g, hipX - 19, hipY + 9, 4, 48, ch); R(g, hipX + 16, hipY + 9, 4, 48, mix(ch, D.n1, 0.3)); },
          face: { eye: grin > 0.3 ? "happy" : "down", brow: grin > 0.3 ? 1 : -1, mouth: grin > 0.3 ? "grin" : writing ? "bite" : "flat", blush: grin * 0.5, ph: 0.2 } });
        // pencil in his hand
        const hn = F.hN; pline(g, hn[0] + 2, hn[1], hn[0] - 4, hn[1] - 10, D.amber[1], 2); R(g, hn[0] + 2, hn[1] + 1, 1, 1, D.n1);
      });

      // ---- the close insert of the page ----
      if (ins > 0) {
        const fx = lerp(250, 292, ins), fy = lerp(deskY - 8, 30, ins), fw = lerp(20, 312, ins), fh = lerp(6, 252, ins);
        A(g, 0.22 * ins, () => R(g, 0, 0, 640, 360, D.n0));
        A(g, 0.5 * ins, () => R(g, fx + 5, fy + 6, fw, fh, "#000000"));
        R(g, fx - 3, fy - 3, fw + 6, fh + 6, D.n0); R(g, fx - 2, fy - 2, fw + 4, fh + 4, mix(D.cream, D.paperD, 0.3));
        clip(g, fx, fy, fw, fh, () => {
          const s = fw / 330, X = (v) => fx + v * s, Y = (v) => fy + v * s;
          // page: warm lamp gradient, ruled lines, red margin, the left page + gutter
          PX.vgrad(g, fx, fy, fw, fh, mix(D.cream, D.lamp, 0.35), mix(D.paper, D.paperD, 0.4), 6);
          A(g, 0.25, () => { for (let i = 0; i < 400; i++) R(g, X(hash(i, 1) * 330), Y(hash(i, 2) * 272), 1, 1, D.paperD); });
          for (let ly = 30; ly < 272; ly += 22) R(g, fx, Y(ly), fw, 1, mix(D.steel[0], D.paper, 0.45));
          R(g, X(52), fy, 1, fh, mix(D.rust[1], D.paper, 0.35)); R(g, X(54), fy, 1, fh, mix(D.rust[1], D.paper, 0.6));
          R(g, fx, fy, X(12) - fx, fh, mix(D.paperD, D.n3, 0.25)); R(g, X(12), fy, 2, fh, mix(D.paperD, D.n2, 0.4)); A(g, 0.3, () => R(g, X(14), fy, 8 * s, fh, D.paperD));
          // a few lines of his earlier work above (small, faint)
          A(g, 0.55, () => { for (let l = 0; l < 2; l++) scribble(g, X(66), Y(14 + l * 22), 160 - l * 50, 700 + l, mix(D.ink, D.steel[2], 0.3), 0.6); });
          // the big handwriting
          const u = 54 * s, ox = X(60), oy = Y(92), pen = mix(D.ink, D.n0, 0.2);
          const tip = drawStrokes(g, EQ, ox, oy, u, pEq, pen, Math.max(2, Math.round(3 * s)));
          drawStrokes(g, EQ, ox + 1, oy, u, pEq, mix(pen, D.paperD, 0.35), 1);
          // two underlines, a little uneven
          const ul = (yy, p, sl, sd2) => { if (p <= 0) return null; const x0 = ox - 6 * s, x1 = ox + 216 * s, xe = lerp(x0, x1, E(p, "out")), Yu = (x) => yy + sl * (x - x0) / (x1 - x0) + Math.sin((x - x0) * 0.05 + sd2) * 1.2 * s;
            for (let x = x0; x < xe; x += 2) pline(g, x, Yu(x), Math.min(xe, x + 2), Yu(Math.min(xe, x + 2)), pen, Math.max(2, Math.round(2.6 * s))); return [xe, Yu(xe)]; };
          const t1 = ul(oy + 68 * s, pU1, -3 * s, 0), t2 = ul(oy + 78 * s, pU2, 2 * s, 2);
          let pt = pEq < 1 && pEq > 0 ? tip : pU2 > 0 && pU2 < 1 ? t2 : pU1 > 0 && pU1 < 1 ? t1 : null;
          if (!pt) { const restP = pEq <= 0 ? [ox - 12 * s, oy + 44 * s] : [ox + 196 * s, oy + 100 * s]; pt = restP; }
          // pencil + hand + sweater sleeve coming in from the bottom right
          const [px2, py2] = pt;
          const along = (dd) => [px2 + dd * s * 0.52, py2 + dd * s * 0.85];
          shadow(g, px2 + 14 * s, py2 + 18 * s, 18 * s, 6 * s, 0.18);
          const [a0x, a0y] = along(6), [a1x, a1y] = along(70);
          pline(g, px2, py2, a0x, a0y, mix(D.paperD, D.amber[2], 0.3), Math.max(2, Math.round(3 * s))); pline(g, px2, py2, px2 + 1, py2 + 1, D.n1, Math.max(1, Math.round(2 * s)));
          seg(g, a0x, a0y, a1x, a1y, 6 * s, D.amber[1]); seg(g, a0x - 1.5 * s, a0y, a1x - 1.5 * s, a1y, 2 * s, D.amber[0]); seg(g, a0x + 2 * s, a0y + 1, a1x + 2 * s, a1y + 1, 1.6 * s, D.amber[2]);
          const [hx2, hy2] = along(44), sk = BOY.skin;
          ell(g, hx2 + 8 * s, hy2 + 6 * s, 15 * s, 12 * s, sk[1]); ell(g, hx2 + 2 * s, hy2 - 2 * s, 6 * s, 5 * s, sk[1]); ell(g, hx2 + 4 * s, hy2 + 10 * s, 7 * s, 4 * s, sk[2]);
          R(g, hx2 - 2 * s, hy2 - 5 * s, 8 * s, 2 * s, sk[0]); ell(g, hx2 + 14 * s, hy2 + 2 * s, 5 * s, 3 * s, sk[0]);
          const [sx2, sy2] = along(80);
          seg(g, sx2, sy2, sx2 + 60 * s, sy2 + 90 * s, 34 * s, BOY.top[1]); seg(g, sx2 - 10 * s, sy2 + 2 * s, sx2 + 50 * s, sy2 + 92 * s, 4 * s, BOY.top[0]);
          seg(g, sx2 - 2 * s, sy2 - 4 * s, sx2 + 16 * s, sy2 - 10 * s, 10 * s, mix(BOY.top[1], D.n0, 0.2));
          for (let i = 0; i < 5; i++) seg(g, sx2 + (-8 + i * 5) * s, sy2 - 6 * s, sx2 + (-4 + i * 5) * s, sy2 + 6 * s, 1.2 * s, BOY.top[2]);
          // soft lamp shadow vignette inside the insert
          vig(g, fx, fy, fw, fh, 0.35);
        });
      }
      PX.vignette(g, 0.5);
    };
  };

  // ======================= magazine =======================
  // Late-1980s living room, afternoon sun through a tall window: a reader in a wingback chair by the window, a math
  // magazine open on the low table in front of him (generic: text columns, a circle diagram, no title), a ballot card
  // and an envelope beside it, tea steaming, a cat asleep on the rug. He turns a page (early); at o.vote (1.5) he ticks a
  // box on the card, slides it into the envelope, folds the flap down, pats it and leans back, pleased.
  K.magazine = (o) => {
    const RD = { skin: SK.warm, hair: HR.brown, hs: "short", glasses: true, mus: true, top: tri(mix(D.rust[2], D.amber[2], 0.45), 0.24, 0.42), collar: mix(D.steel[0], D.cream, 0.5), cuff: null };
    const WALLC = mix(mix(D.paper, D.amber[1], 0.12), D.n4, 0.45), WOOD = tri(mix(mix(D.amber[2], D.rust[2], 0.35), D.n4, 0.25), 0.22, 0.48), CHAIR = tri(mix(D.moss[2], D.teal[2], 0.3), 0.22, 0.45);
    const TREES = []; { const r = PX.rnd(88); for (let i = 0; i < 9; i++) TREES.push([r(), r(), r()]); }
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 5.0), tV = T("vote", 1.5), sd = d / 5;
      // beats after the vote
      const k1 = tV, k2 = tV + 0.5 * sd, k3 = tV + 1.0 * sd, k4 = tV + 1.4 * sd, k5 = tV + 1.8 * sd, k6 = tV + 2.2 * sd;
      const tickP = clamp((t - (k1 + 0.15 * sd)) / (0.3 * sd), 0, 1);
      const slideP = E((t - k2) / (k3 - k2), "io"), inP = E((t - k3) / (k4 - k3), "io"), flapP = E((t - k4) / (k5 - k4), "io"), patP = clamp((t - k5) / (k6 - k5), 0, 1);
      const settle = E((t - k6) / (0.5 * sd), "io");
      const pageP = E((t - 0.35 * sd) / (0.6 * sd), "io");                                          // early page turn
      const sun = 1 + Math.sin(t * 0.6) * 0.03;
      // table-top positions (front view, foreshortened)
      const CARD0 = [368, 264], ENV = [318, 288], MOUTH = 277;
      const card = slideP < 1 ? [lerp(CARD0[0], ENV[0], slideP), lerp(CARD0[1], MOUTH - 8, slideP)] : [ENV[0], lerp(MOUTH - 8, MOUTH + 12, inP)];

      // ---- far: the room in perspective, window on the right wall, sun pouring in ----
      PX.par(g, c, 0.35, () => {
        const top = (f) => lerp(-20, -80, f), flo = (f) => lerp(240, 330, f), WX = (f) => lerp(470, 680, f), WY = (f, v) => lerp(top(f), flo(f), v);
        R(g, -20, -20, 500, 270, WALLC); PX.vgrad(g, -20, -20, 500, 120, mix(WALLC, D.n2, 0.3), WALLC, 5);
        poly(g, [[470, -20], [680, -80], [680, 330], [470, 240]], mix(WALLC, D.n2, 0.28));
        R(g, -20, 232, 490, 8, mix(WALLC, D.n1, 0.4)); poly(g, [[470, 232], [680, 318], [680, 330], [470, 240]], mix(WALLC, D.n1, 0.45));
        // floor boards converging
        poly(g, [[-20, 240], [470, 240], [680, 330], [680, 380], [-20, 380]], mix(WOOD[2], D.n1, 0.25));
        for (let i = -8; i < 14; i++) { const bx = 360 + i * 60; PX.line(g, 360 + (bx - 360) * 0.18, 240, bx, 380, mix(WOOD[2], D.n0, 0.45)); }
        // the window (right wall): sky, trees, a house across the road
        const f0 = 0.2, f1 = 0.62, v0 = 0.24, v1 = 0.66, Q = [[WX(f0), WY(f0, v0)], [WX(f1), WY(f1, v0)], [WX(f1), WY(f1, v1)], [WX(f0), WY(f0, v1)]];
        poly(g, [[Q[0][0] - 5, Q[0][1] - 5], [Q[1][0] + 4, Q[1][1] - 6], [Q[2][0] + 4, Q[2][1] + 6], [Q[3][0] - 5, Q[3][1] + 5]], mix(D.cream, D.paperD, 0.3));
        clipPoly(g, Q, () => {
          PX.vgrad(g, 500, -10, 110, 180, mix(D.steel[0], D.cream, 0.3), mix(D.cream, D.lamp, 0.45), 6);
          R(g, 500, 124, 110, 50, mix(D.moss[1], D.paperD, 0.3));
          R(g, 548, 82, 40, 44, mix(D.cream, D.paperD, 0.4)); poly(g, [[544, 84], [568, 64], [592, 84]], mix(D.rust[1], D.paperD, 0.3)); R(g, 556, 96, 8, 9, mix(D.steel[1], D.cream, 0.35));
          for (const [a, b, e] of TREES) { const tx = 500 + a * 110, ty = 30 + b * 80, sw = Math.sin(t * 0.9 + a * 7) * 1.2; ell(g, tx + sw, ty, 14 + e * 8, 12 + e * 7, mix(D.moss[1], D.cream, 0.15 + b * 0.25)); ell(g, tx + sw - 4, ty - 4, 7, 5, mix(D.moss[0], D.cream, 0.3)); ell(g, tx + sw + 5, ty + 5, 7, 5, mix(D.moss[1], D.moss[2], 0.3)); }
        });
        const fc = mix(D.cream, D.paperD, 0.2), mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        pline(g, ...mid(Q[0], Q[1]), ...mid(Q[3], Q[2]), fc, 3); pline(g, ...mid(Q[0], Q[3]), ...mid(Q[1], Q[2]), fc, 3);
        poly(g, [[Q[3][0] - 8, Q[3][1] + 4], [Q[2][0] + 6, Q[2][1] + 6], [Q[2][0] + 6, Q[2][1] + 11], [Q[3][0] - 8, Q[3][1] + 9]], D.cream);
        // sheer curtain on the near side, moving
        A(g, 0.45, () => { const sw = Math.sin(t * 0.8) * 3; poly(g, [[Q[1][0] - 2, Q[1][1] - 8], [Q[1][0] + 20, Q[1][1] - 14], [Q[2][0] + 22 + sw, Q[2][1] + 14], [Q[2][0] + sw, Q[2][1] + 8]], D.cream); });
        // bookcase, floor lamp, a print
        R(g, 22, 70, 92, 168, WOOD[2]); R(g, 26, 74, 84, 164, mix(WOOD[2], D.n0, 0.4));
        for (let sh = 0; sh < 3; sh++) { const sy = 112 + sh * 44; R(g, 26, sy, 84, 4, WOOD[1]); for (let i = 0; i < 12; i++) { const bh = 24 + hash(i, sh) * 12; R(g, 28 + i * 7, sy - bh, 6, bh, mix([D.rust[2], D.steel[2], D.moss[2], D.paperD, D.amber[2]][(i + sh) % 5], D.n2, 0.3)); } }
        R(g, 26, 238 - 2, 84, 2, WOOD[1]);
        R(g, 158, 74, 2, 162, mix(D.amber[2], D.n2, 0.2)); R(g, 158, 74, 1, 162, D.amber[1]); ell(g, 159, 236, 9, 3, mix(D.amber[2], D.n2, 0.3)); poly(g, [[146, 70], [172, 70], [178, 92], [140, 92]], mix(D.cream, D.paperD, 0.35)); R(g, 140, 91, 38, 1, mix(D.paperD, D.n4, 0.3));
        R(g, 404, 54, 50, 40, WOOD[2]); R(g, 407, 57, 44, 34, mix(D.cream, D.paperD, 0.3)); for (let i = 0; i < 3; i++) ell(g, 416 + i * 13, 78 - i * 3, 6, 6, mix([D.teal[1], D.amber[1], D.rust[1]][i], D.paper, 0.4));
        // rug, then the sun: a shaft through the air and its patch on the floor
        ell(g, 300, 334, 214, 28, mix(D.rust[2], D.n2, 0.35)); ell(g, 300, 334, 198, 23, mix(D.rust[2], D.n3, 0.4)); A(g, 0.5, () => ell(g, 300, 334, 186, 1, D.amber[2]));
        A(g, 0.2 * sun, () => poly(g, [[250, 306], [420, 286], [500, 372], [270, 372]], D.lamp));
        A(g, 0.07 * sun, () => { pline(g, 336, 296, 380, 372, "#000000", 3); pline(g, 258, 336, 470, 330, "#000000", 3); });
        const SH = [Q[0], Q[1], Q[2], [500, 372], [270, 372], [250, 306]];
        A(g, 0.06 * sun, () => poly(g, SH, D.lamp)); A(g, 0.04 * sun, () => poly(g, [Q[0], Q[1], [420, 286], [250, 306]], D.lamp));
        PX.glow(g, 560, 80, 140, D.lamp, 0.18 * sun);
      });
      // ---- mid: the wingback chair and the reader ----
      PX.par(g, c, 0.8, () => {
        const into = E((t - k1 + 0.3 * sd) / (0.3 * sd), "io") * (1 - settle), lean = into, shift = into * 4;
        const back = settle * -3;
        const bx = 300 + shift, by = 200 + lean * 12 + back;
        // chair: back, wings, rolled arms
        const [ccl, ccb, ccd] = CHAIR;
        poly(g, [[222, 236], [222, 118], [236, 104], [364, 104], [378, 118], [378, 236]], ccb); R(g, 236, 104, 128, 2, ccl);
        for (let i = 0; i < 5; i++) R(g, 240 + i * 26, 112, 1, 120, ccd);
        poly(g, [[204, 250], [204, 140], [222, 126], [232, 140], [232, 250]], ccd); poly(g, [[368, 250], [368, 140], [378, 126], [396, 140], [396, 250]], ccl);
        
        R(g, 196, 250, 208, 12, ccd); for (const lx of [206, 386]) R(g, lx, 262, 6, 20, WOOD[2]);
        // reader (front view, turned a touch toward the work)
        const lookAt = t < k1 ? [-0.6, 0.9] : t < k6 ? [0.5, 1] : [0.2, 0];
        const eye = t >= k6 + 0.2 * sd ? "happy" : t < k1 ? "down" : "down", mouth = t >= k5 ? "smile" : "flat";
        fBust(g, bx, by, 2.6, RD, { t, noArms: true, headDx: lookAt[0] * 2, headDy: t < k6 ? 1 : 0, light: 1, bot: 262,
          face: { eye, look: lookAt[0], lookY: lookAt[1], mouth, brow: t >= k6 ? 1 : t >= k1 ? -1 : 0, turn: lookAt[0] * 0.25, ph: 0.9 } });
        R(g, 194, 236, 40, 16, ccb); ell(g, 214, 236, 20, 6, ccl); R(g, 366, 236, 40, 16, mix(ccb, ccl, 0.4)); ell(g, 386, 236, 20, 6, mix(ccl, D.lamp, 0.3));
        // the low table (hides his lap), oak top in the sun
        const TB = 246, TF = 302;
        poly(g, [[190, TB], [488, TB], [510, TF], [168, TF]], WOOD[1]); R(g, 190, TB, 298, 1, WOOD[0]);
        for (let i = 0; i < 8; i++) A(g, 0.3, () => { const yy = TB + 4 + i * 7; for (let x = 192 - i * 3; x < 480 + i * 3; x += 20 + hash(i, x) * 30) R(g, x, yy, 8 + hash(x, i) * 16, 1, i % 3 ? WOOD[2] : WOOD[0]); });
        A(g, 0.2 * sun, () => poly(g, [[372, TB], [470, TB], [500, TF], [400, TF]], D.lamp)); A(g, 0.08 * sun, () => { pline(g, 420, TB, 450, TF, "#000000", 2); pline(g, 382, TB + 26, 486, TB + 26, "#000000", 2); });
        R(g, 168, TF, 342, 8, WOOD[2]); R(g, 168, TF, 342, 1, WOOD[0]); A(g, 0.4, () => R(g, 168, TF + 8, 342, 3, "#000000"));
        for (const lx of [180, 494]) { R(g, lx, TF + 8, 6, 30, WOOD[2]); R(g, lx, TF + 8, 1, 30, WOOD[1]); }
        // the magazine (open, generic), the page turning early
        const mx = 254, my = 272, pg = mix(D.cream, D.paper, 0.25), pgD = mix(D.paper, D.paperD, 0.4), tx = mix(D.n5, D.paperD, 0.3);
        shadow(g, mx + 3, my + 15, 54, 4, 0.3);
        poly(g, [[mx - 52, my - 12], [mx, my - 14], [mx, my + 14], [mx - 56, my + 12]], pg); poly(g, [[mx, my - 14], [mx + 52, my - 12], [mx + 56, my + 12], [mx, my + 14]], pg);
        R(g, mx - 1, my - 14, 2, 28, pgD);
        const cols = (x0, x1, seed) => { for (let l = 0; l < 6; l++) { const yy = my - 9 + l * 4; R(g, x0, yy, (x1 - x0) * (0.7 + 0.3 * hash(seed, l)), 1, tx); } };
        cols(mx - 48, mx - 28, 1); cols(mx - 24, mx - 4, 2);
        PX.circle(g, mx + 26, my - 3, 7, mix(D.paper, D.n6, 0.2)); PX.circle(g, mx + 26, my - 3, 6, pg); PX.line(g, mx + 20, my - 3, mx + 32, my - 3, tx); PX.line(g, mx + 26, my - 9, mx + 26, my + 3, tx); PX.line(g, mx + 26, my - 3, mx + 30, my - 7, D.rust[1]);
        for (let l = 0; l < 2; l++) R(g, mx + 8, my + 6 + l * 4, 40, 1, tx);
        if (pageP > 0 && pageP < 1) { const ex = lerp(mx + 54, mx - 54, pageP), lift = Math.sin(pageP * Math.PI) * 10; poly(g, [[mx, my - 14], [ex, my - 12 - lift], [ex + (pageP < 0.5 ? 2 : -2), my + 12 - lift], [mx, my + 14]], pageP < 0.5 ? mix(pg, D.lamp, 0.15) : pgD); }
        // ballot card (3 rows: box + line), ticked in row one
        const drawCard = (cx2, cy2, clipY) => {
          const draw = () => { shadow(g, cx2 + 2, cy2 + 10, 16, 2, 0.3); R(g, cx2 - 16, cy2 - 9, 32, 18, D.cream); R(g, cx2 - 16, cy2 + 8, 32, 1, D.paperD); R(g, cx2 - 16, cy2 - 9, 32, 2, mix(D.teal[1], D.paper, 0.35));
            for (let rr = 0; rr < 3; rr++) { PX.box(g, cx2 - 13, cy2 - 5 + rr * 5, 4, 4, mix(D.ink, D.paperD, 0.3)); R(g, cx2 - 7, cy2 - 3 + rr * 5, 18 - rr * 3, 1, tx); }
            if (tickP > 0) { const pts = [[cx2 - 13, cy2 - 4], [cx2 - 11, cy2 - 1], [cx2 - 7, cy2 - 8]]; const L1 = 0.35; const p1 = clamp(tickP / L1, 0, 1), p2 = clamp((tickP - L1) / (1 - L1), 0, 1);
              pline(g, pts[0][0], pts[0][1], lerp(pts[0][0], pts[1][0], p1), lerp(pts[0][1], pts[1][1], p1), mix(D.steel[2], D.n1, 0.4), 1); if (p2 > 0) pline(g, pts[1][0], pts[1][1], lerp(pts[1][0], pts[2][0], p2), lerp(pts[1][1], pts[2][1], p2), mix(D.steel[2], D.n1, 0.4), 1); } };
          if (clipY !== undefined) clip(g, cx2 - 20, cy2 - 20, 40, clipY - (cy2 - 20), draw); else draw();
        };
        // envelope: open flap (behind), card sliding in under the front, then the flap folds down
        const ew = 46, eh = 24, el = ENV[0] - ew / 2, flapTip = lerp(MOUTH - 13, MOUTH + 13, flapP), ec = mix(D.cream, D.paperD, 0.15), ecD = mix(D.paperD, D.n4, 0.25);
        shadow(g, ENV[0] + 2, ENV[1] + 13, 25, 3, 0.32);
        if (flapTip < MOUTH) poly(g, [[el, MOUTH], [el + ew, MOUTH], [ENV[0], flapTip]], ecD);
        if (inP < 1) drawCard(card[0], card[1], slideP >= 1 ? MOUTH : undefined);
        R(g, el, MOUTH, ew, eh, ec); poly(g, [[el, MOUTH + eh], [ENV[0], MOUTH + 10], [el + ew, MOUTH + eh]], mix(ec, D.paperD, 0.3)); PX.line(g, el, MOUTH, ENV[0], MOUTH + 10, mix(ec, D.paperD, 0.5)); PX.line(g, el + ew, MOUTH, ENV[0], MOUTH + 10, mix(ec, D.paperD, 0.5));
        R(g, el + ew - 8, MOUTH + 3, 5, 6, mix(D.rust[1], D.paper, 0.3));                              // stamp
        if (flapTip >= MOUTH) { poly(g, [[el, MOUTH], [el + ew, MOUTH], [ENV[0], flapTip]], mix(ec, D.cream, 0.2)); PX.line(g, el, MOUTH, ENV[0], flapTip, mix(ec, D.paperD, 0.6)); PX.line(g, el + ew, MOUTH, ENV[0], flapTip, mix(ec, D.paperD, 0.6)); }
        // tea with steam
        const tcx = 446, tcy = 258;
        ell(g, tcx, tcy + 6, 14, 4, mix(D.cream, D.n6, 0.2)); R(g, tcx - 8, tcy - 6, 16, 12, mix(D.cream, D.steel[0], 0.2)); ell(g, tcx, tcy - 6, 8, 2, mix(D.rust[2], D.n1, 0.4)); R(g, tcx + 8, tcy - 4, 4, 6, mix(D.cream, D.steel[0], 0.2));
        for (let i = 0; i < 3; i++) { const ph = frac(t * 0.4 + i / 3); A(g, 0.22 * Math.sin(ph * Math.PI), () => R(g, tcx - 3 + i * 3 + Math.sin(ph * 6 + i) * 2, tcy - 12 - ph * 26, 1, 5, D.cream)); }
        // pen
        // hands: left on the magazine (turns the page early), right with the pen / card / flap
        let hL = [lerp(mx + 40, mx - 30, pageP), my - (pageP > 0 && pageP < 1 ? 6 : 0) + 2], hR = [CARD0[0] + 10, CARD0[1] + 14];
        if (t >= k1 && t < k2) { const p = E((t - k1) / (0.18 * sd), "io"); const tick = tickP > 0 ? [lerp(-13, -7, tickP), Math.sin(tickP * Math.PI) * -3] : [-13, -4]; hR = [lerp(hR[0], CARD0[0] + tick[0] + 3, p), lerp(hR[1], CARD0[1] + tick[1] + 4, p)]; }
        else if (t >= k2 && t < k4) hR = [card[0] + 2, Math.min(card[1], MOUTH - 4) - 2];
        else if (t >= k4 && t < k5) hR = [ENV[0], flapTip - 1];
        else if (t >= k5 && t < k6) hR = [ENV[0] + 2, MOUTH + 10 - Math.sin(patP * Math.PI * 2) * 2];
        else if (t >= k6) hR = [lerp(ENV[0] + 2, 372, settle), lerp(MOUTH + 10, 282, settle)];
        const hands = fArms(g, bx, by, 2.6, RD, hL, hR, t);
        // pen in the right hand (dark, short) until the card is done; then laid on the table
        if (t < k2) { const [px2, py2] = hands[1]; pline(g, px2 - 1, py2 + 1, px2 + 7, py2 - 9, mix(D.n1, D.steel[2], 0.3), 2); R(g, px2 - 2, py2 + 2, 1, 1, D.amber[1]); }
        else { pline(g, 384, 290, 400, 284, mix(D.n1, D.steel[2], 0.3), 2); }
        // sun dust over the table
        PX.particles(g, 71, 22, t, [360, 120, 220, 170], { vy: -1.2, vx: -1, col: D.lamp, a: 0.45, tw: 1.1 });
      });
      // ---- foreground: the cat asleep on the rug, a big-leaf plant backlit at the right ----
      PX.par(g, c, 1.05, () => {
        const cx2 = 100, cy2 = 334, br = Math.sin(t * 2.1) * 0.7, cat = tri(mix(D.amber[2], D.rust[2], 0.25), 0.3, 0.45);
        shadow(g, cx2 + 2, cy2 + 9, 32, 4, 0.4);
        // curled body, darker back, stripes as short arcs
        ell(g, cx2, cy2, 28, 11 + br, cat[1]); ell(g, cx2 - 2, cy2 - 4 - br * 0.5, 22, 6, cat[0]);
        for (let i = 0; i < 5; i++) { const sx = cx2 - 18 + i * 8; R(g, sx, cy2 - 9 - br * 0.5 + Math.abs(i - 2), 2, 4, cat[2]); }
        // tail wraps round the front
        for (let i = 0; i < 9; i++) { const a = Math.PI * (0.15 + i * 0.09), tw = i === 8 ? Math.sin(t * 1.9) * 1.5 : 0; ell(g, cx2 + Math.cos(a) * 27 + tw, cy2 + 2 + Math.sin(a) * 9, 3.2, 3, i > 6 ? cat[2] : cat[1]); }
        // head resting on the paws (front-left), ears, closed eyes
        const hx2 = cx2 + 22, hy2 = cy2 + 1, ear = Math.max(0, Math.sin(t * 1.3 + 0.5) - 0.94) * 30;
        ell(g, hx2 - 4, hy2 + 7, 9, 3, mix(cat[0], D.cream, 0.35));
        ell(g, hx2, hy2, 10, 8, cat[2]); ell(g, hx2, hy2, 9, 7, cat[1]); ell(g, hx2 - 2, hy2 - 3, 6, 3, cat[0]); ell(g, hx2, hy2 + 3, 4, 2.5, mix(D.cream, cat[0], 0.4));
        poly(g, [[hx2 - 8, hy2 - 3], [hx2 - 6, hy2 - 11 - ear], [hx2 - 2, hy2 - 5]], cat[1]); poly(g, [[hx2 + 2, hy2 - 5], [hx2 + 6, hy2 - 11], [hx2 + 8, hy2 - 2]], cat[2]); R(g, hx2 - 6, hy2 - 8 - ear, 1, 2, mix(D.rose[1], cat[1], 0.4));
        R(g, hx2 - 5, hy2 + 1, 3, 1, cat[2]); R(g, hx2 + 1, hy2 + 1, 3, 1, cat[2]); R(g, hx2 - 1, hy2 + 3, 2, 1, mix(D.rose[2], cat[2], 0.3));
        A(g, 0.35 * sun, () => ell(g, cx2 + 6, cy2 - 8, 16, 2, D.lamp));
        // plant
        const pc = mix(D.rust[2], D.n2, 0.25);
        poly(g, [[590, 300], [632, 300], [626, 346], [596, 346]], pc); R(g, 588, 298, 46, 4, mix(pc, D.paperD, 0.3));
        const leaf = (x0, y0, ang, L, sh) => { const ex = x0 + Math.cos(ang) * L, ey = y0 + Math.sin(ang) * L, mx2 = (x0 + ex) / 2, my2 = (y0 + ey) / 2, nx = -Math.sin(ang) * L * 0.28, ny = Math.cos(ang) * L * 0.28;
          poly(g, [[x0, y0], [mx2 + nx, my2 + ny], [ex, ey], [mx2 - nx, my2 - ny]], sh ? mix(D.moss[2], D.n1, 0.45) : mix(D.moss[2], D.n1, 0.2)); pline(g, x0, y0, ex, ey, mix(D.moss[1], D.lamp, 0.25)); };
        for (let i = 0; i < 7; i++) { const sw = Math.sin(t * 0.7 + i) * 0.04; pline(g, 610, 300, 610 + Math.cos(-1.2 - i * 0.32 + sw) * 30, 300 + Math.sin(-1.2 - i * 0.32 + sw) * 30, mix(D.moss[2], D.n1, 0.3)); leaf(610 + Math.cos(-1.2 - i * 0.32 + sw) * 30, 300 + Math.sin(-1.2 - i * 0.32 + sw) * 30, -1.4 - i * 0.3 + sw, 34 + (i % 3) * 6, i % 2); }
      });
      PX.vignette(g, 0.45);
    };
  };

})();
