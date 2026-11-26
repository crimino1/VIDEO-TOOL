/* Euler film, Builder C: everyday metaphors and the modern world. Documentary palette PX.D only (no hex literals
   except black for shadows), no mascot, no neon.
   Kinds: phone_turn, ball_string, outlet, waves, mri_room, particles, wall_frame.
   Kit: colour mix, shapes, rotated polys, pixel ring arcs, a hand-pixelled formula font (e, superscript i pi, + 1 = 0, x),
   a side-view person with a profile face and 2-bone IK arms. */
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
  const clipPoly = (g, pts, fn) => { g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip(); fn(); g.restore(); };
  const shadow = (g, cx, cy, rx, ry, a) => A(g, a === undefined ? 0.35 : a, () => ell(g, cx, cy, rx, ry, BLK));
  // option time: o[k] if a number, else the default scaled to the shot length; dur scales a duration with d
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  const dust = (g, seed, n, t, box, col, a) => PX.particles(g, seed, n, t, box, { vy: -1.5, vx: 1.2, col: col || D.lamp, a: a === undefined ? 0.4 : a, tw: 1.3 });
  const wood = (k, base) => tri(mix(base || mix(D.rust[2], D.amber[2], 0.45), D.n2, k === undefined ? 0.3 : k), 0.22, 0.4);
  // pixel outline ellipse arc a0..a1 (radians, y down); dash = [on, off] in pixels
  const ring = (g, cx, cy, rx, ry, col, a0, a1, dash) => {
    a0 = a0 === undefined ? 0 : a0; a1 = a1 === undefined ? TAU : a1; if (rx < 0.5) return;
    const n = Math.max(8, Math.ceil(Math.abs(a1 - a0) * Math.max(rx, ry) * 1.5)); g.fillStyle = col; let lx = 1e9, ly = 1e9, c = 0;
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n, x = Math.round(cx + Math.cos(a) * rx), y = Math.round(cy + Math.sin(a) * ry);
      if (x === lx && y === ly) continue; lx = x; ly = y;
      if (!dash || c % (dash[0] + dash[1]) < dash[0]) g.fillRect(x, y, 1, 1); c++;
    }
  };
  // dotted straight line
  const dots = (g, x1, y1, x2, y2, col, gap, ph) => {
    const L = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(L / gap);
    for (let i = 0; i <= n; i++) { const k = (i * gap + (ph || 0) % gap) / (L || 1); if (k > 1) break; R(g, lerp(x1, x2, k), lerp(y1, y2, k), 1, 1, col); }
  };
  // fading pixel-font label (ASCII only), palette colours
  const label = (g, s, x, y, t, t0, o) => {
    o = o || {}; if (t < t0) return; const a = P(t, t0, 0.45, "out");
    A(g, a, () => PX.otext(g, s, x, y + Math.round(3 * (1 - a)), { align: o.align || "center", col: o.col || D.cream, outline: o.outline || D.n0, size: o.size || 8, font: o.font }));
  };

  // ---------- hand-pixelled formula glyphs (7-row cell; superscripts raised) ----------
  const GLY = {
    e: [".....", ".....", ".###.", "#...#", "#####", "#....", ".####"],
    "+": [".....", "..#..", "..#..", "#####", "..#..", "..#..", "....."],
    "=": [".....", ".....", "#####", ".....", "#####", ".....", "....."],
    1: [".#.", "##.", ".#.", ".#.", ".#.", ".#.", "###"],
    0: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    x: [".....", ".....", "#...#", ".#.#.", "..#..", ".#.#.", "#...#"],
    "*": [".....", ".....", ".#.#.", "..#..", ".#.#.", ".....", "....."],
    i: [".#.", "...", "##.", ".#.", ".#.", ".#.", ".##"],
    I: ["#", ".", "#", "#", "#"],                    // superscript i
    p: ["#####", ".#.#.", ".#.#.", ".#..#"],          // superscript pi
    " ": ["..."],
  };
  const GOFF = { I: -3, p: -2 };
  // draw a glyph string ("eIp + 1 = 0", "xi") at (x, y) = top of the 7-row cell; returns width
  const glyphs = (g, s, x, y, col, o) => {
    o = o || {}; const sc = o.sc || 1;
    const run = (c2, dx, dy) => {
      let cx = x;
      for (const ch of s) {
        const gl = GLY[ch]; if (!gl) { cx += 4 * sc; continue; }
        const oy = (GOFF[ch] || 0) * sc;
        for (let r = 0; r < gl.length; r++) for (let q = 0; q < gl[r].length; q++) if (gl[r][q] === "#") R(g, cx + q * sc + dx, y + oy + r * sc + dy, sc, sc, c2);
        cx += (gl[0].length + (ch === "I" ? 1 : 1)) * sc;
      }
      return cx - x - sc;
    };
    if (o.outline) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, 1], [-1, 1], [1, -1]]) run(o.outline, dx, dy);
    return run(col, 0, 0);
  };
  const gw = (s, sc) => { sc = sc || 1; let w = 0; for (const ch of s) w += ((GLY[ch] ? GLY[ch][0].length : 3) + 1) * sc; return w - sc; };
  const glyphLabel = (g, s, cx, y, t, t0, col, sc) => {
    if (t < t0) return; const a = P(t, t0, 0.45, "out"), w = gw(s, sc);
    A(g, a, () => glyphs(g, s, Math.round(cx - w / 2), y + Math.round(3 * (1 - a)), col || D.cream, { outline: D.n0, sc }));
  };

  // ---------- people ----------
  const SK = {
    fair: tri(mix(D.paper, D.rose[1], 0.4), 0.3, 0.32),
    warm: tri(mix(D.paperD, D.rust[1], 0.3), 0.3, 0.35),
    med: tri(mix(D.rust[2], D.paperD, 0.55), 0.28, 0.38),
    deep: tri(mix(D.rust[2], D.n2, 0.35), 0.25, 0.4),
  };
  const HR = {
    black: [mix(D.n2, D.steel[2], 0.3), mix(D.n0, D.rust[2], 0.12)],
    brown: [mix(D.rust[2], D.paperD, 0.25), mix(D.rust[2], D.n0, 0.45)],
    auburn: [mix(D.rust[1], D.paperD, 0.25), mix(D.rust[2], D.n1, 0.25)],
    blond: [mix(D.paper, D.amber[0], 0.3), mix(D.paperD, D.amber[2], 0.4)],
  };
  // profile head facing +x, head centre (x, y) (about 20 x 20 px). f: {eye: open|closed|happy|up, mouth: flat|smile|grin|o, brow: 0|1}
  const sideHead = (g, pal, x, y, f, t, ph) => {
    x = Math.round(x); y = Math.round(y);
    const [sl, sb, sd] = pal.skin, [hl, hb] = pal.hair, hd = mix(hb, D.n0, 0.4), ink = D.n0, sdd = mix(sd, D.n0, 0.25);
    // neck
    R(g, x - 3, y + 5, 7, 8, sd); R(g, x + 1, y + 5, 3, 7, sb);
    // cranium, face plane, chin, jaw shade
    ell(g, x - 1, y - 2, 8, 8, sb); R(g, x + 3, y - 6, 5, 11, sb); R(g, x + 2, y + 5, 5, 2, sb); R(g, x + 1, y + 7, 4, 1, sb);
    R(g, x + 8, y - 4, 1, 2, sb);                                              // brow ridge
    R(g, x + 8, y - 1, 2, 3, sb); R(g, x + 9, y, 1, 1, sl); R(g, x + 8, y + 2, 1, 1, sd);   // nose
    R(g, x + 7, y + 3, 1, 1, sb);                                              // upper lip
    R(g, x - 4, y + 3, 4, 3, sd); R(g, x, y + 6, 2, 2, sd); R(g, x + 2, y + 8, 3, 1, sdd); R(g, x + 6, y + 6, 1, 1, sd);
    R(g, x + 7, y - 6, 1, 4, sl); R(g, x + 3, y - 8, 4, 1, sl); R(g, x + 4, y + 1, 2, 2, mix(sb, D.rose[1], 0.25));
    // ear
    R(g, x - 3, y - 2, 3, 5, sd); R(g, x - 2, y - 1, 1, 3, sb); R(g, x - 3, y + 3, 2, 1, sdd);
    // hair: crown, fringe, back, nape
    ell(g, x - 2, y - 6, 8.5, 5, hb); R(g, x - 9, y - 6, 5, 9, hb); R(g, x - 8, y + 3, 4, 2, hb); R(g, x - 8, y + 5, 3, 1, hd);
    R(g, x + 1, y - 10, 6, 3, hb); R(g, x + 5, y - 9, 3, 3, hb); R(g, x + 7, y - 8, 1, 2, hd); R(g, x - 1, y - 4, 2, 4, hb); R(g, x - 1, y, 1, 1, hd);
    R(g, x - 5, y - 11, 7, 1, hl); R(g, x - 7, y - 9, 4, 1, hl); R(g, x + 2, y - 10, 3, 1, hl); R(g, x - 9, y - 2, 1, 5, hd); R(g, x - 6, y - 3, 1, 4, hd);
    // eye, brow, mouth
    const blink = PX.blink(t + (ph || 0), 3.7, 0.045), e = f.eye || "open", by = y - 4 - (f.brow ? 1 : 0);
    R(g, x + 3, by, 4, 1, hd); R(g, x + 6, by + 1, 1, 1, hd);
    if (e === "happy") { R(g, x + 4, y - 1, 1, 1, ink); R(g, x + 5, y - 2, 1, 1, ink); R(g, x + 6, y - 1, 1, 1, ink); }
    else if (blink || e === "closed") R(g, x + 4, y - 1, 3, 1, sdd);
    else if (e === "up") { R(g, x + 4, y - 2, 1, 2, mix(D.cream, sb, 0.2)); R(g, x + 5, y - 3, 2, 2, ink); R(g, x + 5, y - 3, 1, 1, D.cream); }
    else { R(g, x + 4, y - 2, 1, 2, mix(D.cream, sb, 0.2)); R(g, x + 5, y - 2, 2, 2, ink); R(g, x + 6, y - 2, 1, 1, mix(D.cream, sb, 0.2)); }
    const mc = mix(sd, D.rust[2], 0.5), m = f.mouth || "flat";
    if (m === "smile") { R(g, x + 4, y + 4, 3, 1, mc); R(g, x + 7, y + 3, 1, 1, mc); R(g, x + 3, y + 1, 3, 2, mix(sb, D.rose[1], 0.45)); }
    else if (m === "grin") { R(g, x + 4, y + 5, 3, 1, mc); R(g, x + 4, y + 4, 3, 1, D.cream); R(g, x + 7, y + 3, 1, 2, mc); R(g, x + 3, y + 3, 1, 1, mc); R(g, x + 3, y + 1, 3, 2, mix(sb, D.rose[1], 0.5)); }
    else if (m === "o") R(g, x + 6, y + 3, 2, 2, mc);
    else R(g, x + 4, y + 4, 4, 1, mc);
    if (pal.glasses) { const gc = mix(D.n1, D.amber[2], 0.35); PX.box(g, x + 3, y - 4, 5, 4, gc); R(g, x - 2, y - 3, 5, 1, gc); }
  };
  // side-view person facing +x (dir -1 flips), feet at (x, y). o: h (~100), pal {skin, hair, top, top2, pants, shoe, collar},
  // legN/legF [thigh, shin] deg (+ forward), reachN/reachF world points (IK) or armN/armF [upper, fore] deg,
  // lean (px, torso top forward), head {dx, dy, f}, t, ph. Returns hand + head positions in world coords.
  const sideP = (g, x, y, o) => {
    const pal = o.pal, k = (o.h || 100) / 100, dir = o.dir < 0 ? -1 : 1;
    const [tl, tb, td] = pal.top, [pl, pb, pd] = pal.pants, [sl, sb, sd] = pal.skin;
    const X0 = Math.round(x), wx = (lx) => X0 + dir * lx;
    g.save(); g.translate(X0, 0); if (dir < 0) g.scale(-1, 1);
    const Lt = 23 * k, Ls = 22 * k, Lu = 16 * k, Lf = 15 * k, br = Math.sin((o.t || 0) * 1.6 + (o.ph || 0)) * 0.6 * (o.breath === undefined ? 1 : o.breath);
    const lN = o.legN || [0, 0], lF = o.legF || [0, 0];
    const drop = (l) => Lt * Math.cos(rad(l[0])) + Ls * Math.cos(rad(l[1]));
    const hipY = y - 3 * k - Math.max(drop(lN), drop(lF)), hipX = 0, shX = (o.lean || 0) * k, shY = hipY - 31 * k + br;
    const leg = (l, col, colD, shoe) => {
      const kx = hipX + Lt * Math.sin(rad(l[0])), ky = hipY + Lt * Math.cos(rad(l[0])), ax = kx + Ls * Math.sin(rad(l[1])), ay = ky + Ls * Math.cos(rad(l[1]));
      limb(g, hipX, hipY, kx, ky, 9 * k, col); limb(g, kx, ky, ax, ay, 7.5 * k, col);
      seg(g, kx + 2.6 * k, ky + 1, ax + 2.4 * k, ay - 2, Math.max(1, k), colD);
      R(g, ax - 3.5 * k, ay - 1.5 * k, 10.5 * k, 4 * k, shoe); R(g, ax - 2 * k, ay - 2 * k, 8 * k, 1, mix(shoe, D.n6, 0.3)); R(g, ax - 3.5 * k, ay + 2 * k, 10.5 * k, 1, mix(shoe, D.n0, 0.5));
    };
    const sh = () => [shX + 0.5 * k, shY + 4 * k];
    const ik = (T) => {
      const [sx, sy] = sh(), lx = (T[0] - X0) * dir - sx, ly = T[1] - sy, L2 = Lf + 2 * k;
      const dd = clamp(Math.hypot(lx, ly), 1, Lu + L2 - 0.01), base = Math.atan2(lx, ly), a1 = Math.acos(clamp((Lu * Lu + dd * dd - L2 * L2) / (2 * Lu * dd), -1, 1));
      const ua = base - a1, ex = sx + Lu * Math.sin(ua), ey = sy + Lu * Math.cos(ua);
      return [(ua * 180) / Math.PI, (Math.atan2(sx + lx - ex, sy + ly - ey) * 180) / Math.PI];
    };
    const arm = (a, col, colD, near) => {
      const [sx, sy] = sh(), ex = sx + Lu * Math.sin(rad(a[0])), ey = sy + Lu * Math.cos(rad(a[0])), hx2 = ex + Lf * Math.sin(rad(a[1])), hy2 = ey + Lf * Math.cos(rad(a[1]));
      if (near) { limb(g, sx, sy, ex, ey, 8.4 * k, colD); limb(g, ex, ey, hx2, hy2, 7.6 * k, colD); }
      limb(g, sx, sy, ex, ey, 7 * k, col); limb(g, ex, ey, hx2, hy2, 6.2 * k, col);
      if (near) seg(g, sx + 1.5, sy - 1, ex + 1.5, ey - 1, Math.max(1, 0.8 * k), tl);
      R(g, hx2 - 3 * k, hy2 - 2 * k, 6 * k, 2 * k, near ? mix(col, D.n0, 0.25) : col);                  // cuff
      const hx3 = hx2 + 2.2 * k * Math.sin(rad(a[1])), hy3 = hy2 + 2.2 * k * Math.cos(rad(a[1]));
      ell(g, hx3, hy3, 2.8 * k, 3 * k, near ? sb : sd); if (near) R(g, hx3 - 1, hy3 - 2, 2, 1, sl);
      return [hx3, hy3];
    };
    const aF = o.reachF ? ik(o.reachF) : o.armF || [-6, -2], aN = o.reachN ? ik(o.reachN) : o.armN || [6, 4];
    // far arm + far leg
    const hF = arm(aF, td, td, false);
    leg(lF, pd, mix(pd, D.n0, 0.3), mix(pal.shoe, D.n0, 0.3));
    // torso (cardigan / sweater), chest + back curves
    const low = hipY + 6 * k;
    const back = [[shX - 7 * k, shY + 1 * k], [shX - 8.5 * k, shY + 9 * k], [hipX - 7.5 * k, hipY - 6 * k], [hipX - 7.5 * k, low]];
    const front = [[hipX + 7.5 * k, low], [hipX + 7 * k, hipY - 6 * k], [shX + 8 * k, shY + 10 * k], [shX + 6.5 * k, shY + 1 * k]];
    poly(g, [...back, ...front], tb);
    poly(g, [...back, [hipX - 4 * k, low], [shX - 4 * k, shY + 9 * k], [shX - 3.5 * k, shY + 1 * k]], td);
    seg(g, shX + 6.8 * k, shY + 3 * k, hipX + 6.6 * k, low - 2 * k, Math.max(1, 1.2 * k), o.light || tl);
    R(g, shX - 6 * k, shY + 0.5 * k, 12 * k, Math.max(1, 0.8 * k), tl);
    if (pal.collar) poly(g, [[shX + 2 * k, shY - 1 * k], [shX + 6.5 * k, shY + 0.5 * k], [shX + 5 * k, shY + 6 * k]], pal.collar);
    if (pal.top2) { seg(g, shX + 4 * k, shY + 2 * k, hipX + 6 * k, low, Math.max(1, 1.6 * k), pal.top2); for (let i = 0; i < 3; i++) R(g, shX + 4.6 * k + i * 0.4 * k, shY + (10 + i * 7) * k, 1, 1, D.paperD); }
    R(g, hipX - 7.5 * k, low - 2 * k, 15 * k, 2 * k, td); R(g, hipX - 7 * k, low - 2 * k, 14 * k, 1, mix(tb, td, 0.5));
    // near leg
    leg(lN, pb, pd, pal.shoe);
    // head
    const hd = o.head || {}, hcx = shX + 2 * k + (hd.dx || 0), hcy = shY - 12 * k + (hd.dy || 0);
    sideHead(g, pal, hcx, hcy, hd.f || {}, o.t || 0, o.ph || 0);
    // near arm on top
    const hN = arm(aN, tb, td, true);
    g.restore();
    return { hand: [wx(hN[0]), hN[1]], handF: [wx(hF[0]), hF[1]], head: [wx(hcx), hcy], shY, hipY };
  };

  // rotation helpers: local -> world about (cx, cy) by th (canvas radians, + = clockwise on screen)
  const rotF = (cx, cy, th) => { const c2 = Math.cos(th), s2 = Math.sin(th); return (x, y) => [cx + x * c2 - y * s2, cy + x * s2 + y * c2]; };
  const rrPts = (w, h, r, n) => { n = n || 4; const pts = [], cs = [[w / 2 - r, -h / 2 + r, -Math.PI / 2], [w / 2 - r, h / 2 - r, 0], [-w / 2 + r, h / 2 - r, Math.PI / 2], [-w / 2 + r, -h / 2 + r, Math.PI]];
    for (const [x, y, a0] of cs) for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * (Math.PI / 2); pts.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } return pts; };
  const rpoly = (g, f, pts, col) => poly(g, pts.map(([x, y]) => f(x, y)), col);
  const rbox = (g, f, x, y, w, h, col) => rpoly(g, f, [[x, y], [x + w, y], [x + w, y + h], [x, y + h]], col);

  // =====================================================================================================
  // phone_turn: top-down on a sunlit wooden table. Two hands hold a phone flat, screen up, pointing up the frame
  // (o.start 0.3: they settle on it). o.q1 (2.5): a quarter turn to the left (now pointing left), label "x i";
  // o.q2 (6.0): another quarter turn (now pointing at the viewer), label "x i x i". A small arrow on the screen shows
  // the way the phone points; a faint dotted arc traces each turn. o.labels:false hides the labels, o.arcs:false the arcs.
  K.phone_turn = (o) => {
    const TB = wood(0.05, mix(mix(D.amber[2], D.rust[2], 0.3), D.paperD, 0.25));
    const SLV = tri(mix(D.steel[2], D.n3, 0.25), 0.2, 0.45), SKN = SK.warm;
    const C = [320, 186], PW = 64, PH = 124, HS = 1.4;
    const GR = [{ r: [32, 24], l: [-32, -24] }, { r: [62, 12], l: [-62, -12] }, { r: [32, -24], l: [-32, 24] }];   // fingertip contacts on the edges   // canonical grips per orientation
    const EL = { r: [610, 410], l: [30, 410] };
    const GRAIN = []; { const r = PX.rnd(5); for (let i = 0; i < 70; i++) GRAIN.push([r() * 760 - 60, r() * 380 - 10, 40 + r() * 160, r() * 6.28, r()]); }
    const rotV = (v, a) => [v[0] * Math.cos(a) - v[1] * Math.sin(a), v[0] * Math.sin(a) + v[1] * Math.cos(a)];
    // back-of-hand from above: wrist w, hand centre h (fingers continue along w -> h)
    const hand = (g, wx, wy, hx2, hy2, side, t, tip) => {
      const [sl, sb, sd] = SKN, a = Math.atan2(hy2 - wy, hx2 - wx), f0 = rotF(hx2, hy2, a), f = (x, y) => f0(x * HS, y * HS);
      for (let i = 0; i < 4; i++) { const v = (i - 1.5) * 3.6, L = 12 + (i === 1 || i === 2 ? 2 : 0) - (tip || 0); const [x1, y1] = f(5, v * 0.9), [x2, y2] = f(5 + L, v * 1.15); limb(g, x1, y1, x2, y2, 3.6 * HS, sd); limb(g, x1, y1 - 0.5, x2, y2 - 0.5, 3 * HS, sb); }
      for (let i = 0; i < 4; i++) { const v = (i - 1.5) * 3.6, L = 12 + (i === 1 || i === 2 ? 2 : 0) - (tip || 0); const [x2, y2] = f(4 + L, v * 1.15); R(g, x2 - 1, y2 - 1, 2, 1, mix(sl, D.rose[0], 0.4)); }
      const ts = side > 0 ? -1 : 1, [t1x, t1y] = f(-3, 8.5 * ts), [t2x, t2y] = f(9, 10 * ts);
      limb(g, t1x, t1y, t2x, t2y, 5 * HS, sd); limb(g, t1x, t1y - 0.5, t2x, t2y - 0.5, 4 * HS, sb);
      rpoly(g, f, [[-12, -7.5], [2, -9.5], [8, -7.5], [9, 0], [8, 7.5], [2, 9.5], [-12, 7.5]], sd);
      rpoly(g, f, [[-12, -6.5], [2, -8.5], [7, -6.5], [8, 0], [7, 6.5], [2, 8.5], [-12, 6.5]], sb);
      rpoly(g, f, [[-10, -5], [1, -6.5], [5, -5], [5, -2], [-10, -2]], sl);
      for (let i = 0; i < 4; i++) { const [kx, ky] = f(6, (i - 1.5) * 3.4); R(g, kx, ky, 1, 1, sl); }
      for (let i = 0; i < 3; i++) { const [x1, y1] = f(-6, (i - 1) * 3.4), [x2, y2] = f(3, (i - 1) * 3.6); PX.line(g, x1, y1, x2, y2, mix(sb, sd, 0.45)); }
    };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 10), tS = T("start", 0.3), tQ1 = T("q1", 2.5), tQ2 = T("q2", 6.0), sc = Math.min(1, d / 10) * 0.4 + 0.6;
      const turnD = 1.0 * sc, regD = 0.55 * sc;
      const p1 = E((t - tQ1) / turnD, "io"), p2 = E((t - tQ2) / turnD, "io");
      const th = -(Math.PI / 2) * (p1 + p2);
      // hands: settle in, then ride the turn, then slide to the next grip
      const gripAt = (side) => {
        const key = side > 0 ? "r" : "l";
        const seg2 = (k, tq, p) => { const att = rotV(GR[k][key], -(Math.PI / 2) * p), rg = E((t - tq - turnD) / regD, "io"); const nx = GR[k + 1][key]; return [lerp(att[0], nx[0], rg), lerp(att[1], nx[1], rg), rg]; };
        const [x, y, rg] = t < tQ2 ? seg2(0, tQ1, p1) : seg2(1, tQ2, p2);
        const lift = Math.sin(clamp(rg, 0, 1) * Math.PI), inP = E((t - tS) / (0.7 * sc), "out"), away = side > 0 ? [90, 120] : [-90, 120];
        // the hand sits behind its fingertip contact, along the forearm
        const El = EL[key], cx2 = C[0] + lerp(x + away[0], x, inP), cy2 = C[1] + lerp(y + away[1], y, inP), L = Math.hypot(cx2 - El[0], cy2 - El[1]), tip = 17 * HS + lift * 3;
        return [cx2 - ((cx2 - El[0]) / L) * tip, cy2 - ((cy2 - El[1]) / L) * tip, lift + (1 - inP) * 1.5];
      };
      const HR2 = gripAt(1), HL2 = gripAt(-1);
      const br = Math.sin(t * 1.4) * 0.6;
      const sunK = 0.85 + 0.15 * Math.sin(t * 0.35) - 0.25 * Math.max(0, Math.sin(t * 0.21 + 2.2)) ** 6;

      // ---- table ----
      R(g, -40, -40, 720, 440, TB[1]);
      for (let i = 0; i < 9; i++) { const y0 = -30 + i * 46; R(g, -40, y0, 720, 1, mix(TB[2], D.n0, 0.25)); R(g, -40, y0 + 1, 720, 1, mix(TB[1], TB[0], 0.35)); if (i % 2) R(g, -40, y0 + 2, 720, 43, mix(TB[1], TB[2], 0.08)); }
      for (const [x, y, L, ph, k] of GRAIN) { const col = k > 0.5 ? mix(TB[1], TB[2], 0.35) : mix(TB[1], TB[0], 0.3); for (let i = 0; i < L; i += 2) R(g, x + i, y + Math.round(Math.sin(i * 0.05 + ph) * 2), 2, 1, col); }
      for (const [kx, ky] of [[118, 300], [520, 70]]) { ell(g, kx, ky, 6, 3, mix(TB[2], D.n0, 0.2)); ring(g, kx, ky, 9, 4.5, mix(TB[1], TB[2], 0.5)); ring(g, kx, ky, 13, 6, mix(TB[1], TB[2], 0.3)); }
      // window light falling across the table, with the window-bar shadows
      A(g, 0.13 * sunK, () => poly(g, [[-40, -40], [430, -40], [250, 400], [-40, 400]], D.lamp));
      A(g, 0.07 * sunK, () => poly(g, [[-40, -40], [300, -40], [120, 400], [-40, 400]], D.cream));
      A(g, 0.16, () => { poly(g, [[200, -40], [214, -40], [64, 400], [50, 400]], BLK); poly(g, [[-40, 150], [430, 120], [430, 128], [-40, 159]], BLK); });

      // ---- objects on the table (with shadows to the lower right) ----
      // notebook + pencil (upper right)
      const nb = rotF(520, 92, 0.12);
      A(g, 0.3, () => rbox(g, (x, y) => nb(x + 5, y + 6), -60, -42, 120, 84, BLK));
      rbox(g, nb, -60, -42, 120, 84, mix(D.steel[2], D.n2, 0.2)); rbox(g, nb, -57, -40, 56, 80, D.cream); rbox(g, nb, 1, -40, 56, 80, mix(D.cream, D.paper, 0.3));
      rbox(g, nb, -2, -40, 4, 80, mix(D.paperD, D.n4, 0.3));
      for (let i = 0; i < 9; i++) { rbox(g, nb, -52, -32 + i * 8, 46, 1, mix(D.steel[0], D.cream, 0.55)); rbox(g, nb, 6, -32 + i * 8, 46, 1, mix(D.steel[0], D.cream, 0.6)); }
      for (let i = 0; i < 5; i++) { const w = 18 + ((i * 13) % 20); rbox(g, nb, -50, -34 + i * 8, w, 1, mix(D.ink, D.paper, 0.35)); }
      const pc = rotF(462, 150, -0.5); A(g, 0.3, () => rbox(g, (x, y) => pc(x + 3, y + 4), -34, -2, 68, 4, BLK));
      rbox(g, pc, -30, -2, 60, 4, D.amber[1]); rbox(g, pc, -30, -2, 60, 1, D.amber[0]); rbox(g, pc, 30, -2, 6, 4, D.paper); rbox(g, pc, 36, -1, 3, 2, D.ink); rbox(g, pc, -36, -2, 6, 4, D.rose[1]);
      // mug of tea (lower right) with steam
      shadow(g, 548, 302, 30, 26, 0.3);
      PX.circle(g, 540, 292, 26, mix(D.teal[1], D.n3, 0.35)); PX.circle(g, 540, 292, 24, mix(D.teal[1], D.n4, 0.15)); PX.circle(g, 540, 292, 20, mix(D.teal[2], D.n1, 0.4));
      PX.circle(g, 540, 293, 19, mix(D.rust[2], D.amber[2], 0.4)); PX.circle(g, 538, 291, 15, mix(D.rust[2], D.amber[2], 0.55)); ring(g, 540, 292, 24, 24, mix(D.teal[0], D.n6, 0.3), Math.PI * 1.05, Math.PI * 1.6);
      A(g, 0.5, () => ell(g, 532, 285, 5, 2, mix(D.lamp, D.cream, 0.5)));
      seg(g, 564, 300, 580, 312, 7, mix(D.teal[1], D.n3, 0.35)); seg(g, 566, 299, 578, 309, 3, mix(D.teal[2], D.n1, 0.2));
      for (let i = 0; i < 5; i++) { const k = frac(t * 0.28 + i / 5), sx = 540 + Math.sin(k * 5 + i * 2) * 6 + k * 14, sy = 290 - k * 34; A(g, Math.sin(k * Math.PI) * 0.22, () => ell(g, sx, sy, 3 + k * 6, 2 + k * 3, D.cream)); }
      // a potted plant seen from above (upper left), leaves sway
      shadow(g, 96, 82, 52, 44, 0.25);
      PX.circle(g, 88, 74, 26, mix(D.rust[2], D.paperD, 0.3)); PX.circle(g, 88, 74, 22, mix(D.rust[2], D.n2, 0.35)); PX.circle(g, 88, 74, 20, mix(D.n2, D.rust[2], 0.3));
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * TAU + Math.sin(t * 0.7 + i) * 0.04, L = 34 + (i % 3) * 7, ex = 88 + Math.cos(a) * L, ey = 74 + Math.sin(a) * L;
        const f = rotF((88 + ex) / 2, (74 + ey) / 2, a), col = i % 2 ? mix(D.moss[2], D.n2, 0.15) : mix(D.moss[1], D.n3, 0.3);
        const lf = [[-L / 2, 0], [-L / 4, -6], [L / 4, -6], [L / 2, 0], [L / 4, 6], [-L / 4, 6]];
        rpoly(g, (x, y) => f(x + 2, y + 3), lf, mix(TB[2], D.n0, 0.3));
        rpoly(g, f, lf, col);
        PX.line(g, ...f(-L / 2, 0), ...f(L / 2 - 2, 0), mix(col, D.n0, 0.3)); PX.line(g, ...f(-L / 4, -4), ...f(L / 4, -4), mix(col, D.moss[0], 0.35));
      }

      // ---- turn arcs (faint dotted quarter circles traced by the arrow) ----
      if (o.arcs !== false) {
        const ar = 92;
        const arc = (pa, a0) => { if (pa <= 0) return; const a1 = a0 - (Math.PI / 2) * pa; ring(g, C[0], C[1], ar, ar, mix(D.cream, TB[1], 0.25), a1, a0, [2, 3]);
          const hx2 = C[0] + Math.cos(a1) * ar, hy2 = C[1] + Math.sin(a1) * ar, f = rotF(hx2, hy2, a1 - Math.PI / 2); if (pa > 0.05) rpoly(g, f, [[4, 0], [-3, -4], [-3, 4]], mix(D.cream, TB[1], 0.2)); };
        A(g, 0.75, () => { arc(p1, -Math.PI / 2); arc(p2, -Math.PI); });
      }

      // ---- shadows of the phone + hands ----
      const ph = rotF(C[0], C[1], th), body = rrPts(PW, PH, 8, 5);
      const handShadow = (H2, side) => { const El = EL[side > 0 ? "r" : "l"], ox = 9 + H2[2] * 4, oy = 11 + H2[2] * 5;
        A(g, 0.22, () => { limb(g, H2[0] + ox, H2[1] + oy, El[0] + ox, El[1] + oy, 28, BLK); ell(g, H2[0] + ox, H2[1] + oy, 17, 17, BLK); }); };
      A(g, 0.28, () => rpoly(g, (x, y) => { const v = ph(x, y); return [v[0] + 5, v[1] + 6]; }, body, BLK));
      A(g, 0.12, () => rpoly(g, (x, y) => { const v = ph(x * 1.08, y * 1.06); return [v[0] + 7, v[1] + 9]; }, body, BLK));
      handShadow(HR2, 1); handShadow(HL2, -1);

      // ---- the phone ----
      rpoly(g, ph, body, mix(D.n1, D.steel[2], 0.25));
      rpoly(g, ph, rrPts(PW - 2, PH - 2, 7, 5), mix(D.n0, D.steel[2], 0.15));
      const scr = rrPts(PW - 8, PH - 10, 4, 3);
      rpoly(g, ph, scr, mix(D.n2, D.teal[2], 0.45));
      for (let i = 0; i < 6; i++) { const y0 = -(PH - 10) / 2 + 3 + i * ((PH - 16) / 6); rbox(g, ph, -(PW - 8) / 2 + 1, y0, PW - 10, (PH - 16) / 6 + 1, mix(mix(D.n2, D.teal[2], 0.45), mix(D.teal[1], D.n3, 0.5), (i / 5) * 0.55)); }
      rbox(g, ph, -6, -PH / 2 + 2, 12, 2, mix(D.n0, D.steel[2], 0.1)); rbox(g, ph, -1, -PH / 2 + 2, 2, 2, mix(D.steel[1], D.n4, 0.4));   // earpiece + camera at the top
      rbox(g, ph, -8, PH / 2 - 9, 16, 1, mix(D.n6, D.teal[1], 0.3));                                                                    // home bar at the bottom
      for (let i = 0; i < 3; i++) rbox(g, ph, (PW - 8) / 2 - 10 + i * 3, -(PH - 10) / 2 + 3, 2, 2 - (i === 2 ? 1 : 0), mix(D.cream, D.teal[1], 0.4));
      // the arrow: points to the top of the phone; a slow ring pulses out of it
      const pk = frac(t / 2.2);
      A(g, (1 - pk) * 0.45, () => ring(g, C[0], C[1], 8 + pk * 16, 8 + pk * 16, mix(D.teal[0], D.cream, 0.4)));
      PX.circle(g, C[0], C[1], 18, mix(D.teal[2], D.n1, 0.15)); ring(g, C[0], C[1], 18, 18, mix(D.teal[1], D.n5, 0.2));
      rpoly(g, ph, [[0, -15], [9, -4], [3.5, -4], [3.5, 12], [-3.5, 12], [-3.5, -4], [-9, -4]], D.cream);
      rpoly(g, ph, [[0, -15], [9, -4], [7, -4], [0, -12]], mix(D.cream, D.amber[0], 0.4));
      // screen sheen (fixed light from the upper left) + bezel highlight on the lit edges
      clipPoly(g, scr.map(([x, y]) => ph(x, y)), () => A(g, 0.07, () => poly(g, [[C[0] - 60, C[1] - 70], [C[0] - 30, C[1] - 70], [C[0] - 70, C[1] + 70], [C[0] - 100, C[1] + 70]], D.cream)));
      const bz = body.map(([x, y]) => ph(x, y));
      for (let i = 0; i < bz.length; i++) { const [ax, ay] = bz[i], [bx, by] = bz[(i + 1) % bz.length], nx = by - ay, ny = -(bx - ax); if (nx * -0.7 + ny * -0.7 > 0) PX.line(g, ax, ay, bx, by, mix(D.n5, D.steel[0], 0.35)); }

      // ---- forearms + hands (on top) ----
      const arm = (H2, side) => {
        const El = EL[side > 0 ? "r" : "l"], dx = El[0] - H2[0], dy = El[1] - H2[1], L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
        const wx = H2[0] + ux * 17, wy = H2[1] + uy * 17 + br * 0.3, cx2 = H2[0] + ux * 70, cy2 = H2[1] + uy * 70;
        const [sl, sb, sd] = SKN;
        limb(g, wx, wy, cx2, cy2, 21, sd); limb(g, wx - 0.5, wy - 1, cx2 - 0.5, cy2 - 1, 19, sb); seg(g, wx - uy * 5, wy + ux * 5 - 2, cx2 - uy * 7, cy2 + ux * 7 - 2, 2, sl);
        seg(g, cx2, cy2, El[0] + ux * 40, El[1] + uy * 40, 33, SLV[2]); seg(g, cx2, cy2 - 1, El[0] + ux * 40, El[1] + uy * 40 - 1, 31, SLV[1]);
        seg(g, cx2 - uy * side * 7, cy2 + ux * side * 7 - 2, El[0], El[1], 6, SLV[0]);
        for (let i = 0; i < 4; i++) { const k = 9 + i * 4; seg(g, cx2 + ux * k - uy * 15, cy2 + uy * k + ux * 15, cx2 + ux * k + uy * 15, cy2 + uy * k - ux * 15, 1, mix(SLV[1], SLV[2], 0.35)); }
        seg(g, cx2 - ux * 3, cy2 - uy * 3, cx2 + ux * 6, cy2 + uy * 6, 34, SLV[2]); seg(g, cx2 - ux * 3, cy2 - uy * 3 - 1, cx2 + ux * 5, cy2 + uy * 5 - 1, 32, mix(SLV[1], SLV[0], 0.3));
        hand(g, wx, wy, H2[0] + ux * 1, H2[1] + uy * 1, side, t, H2[2] * 3);
      };
      arm(HL2, -1); arm(HR2, 1);

      // ---- labels ----
      if (o.labels !== false) {
        const a2 = P(t, tQ2, 0.45, "out");
        if (t >= tQ1) A(g, 1 - a2, () => glyphLabel(g, "*i", 320, 48, t, tQ1 + 0.15 * sc, D.cream, 2));
        glyphLabel(g, "*i *i", 320, 48, t, tQ2 + 0.15 * sc, D.cream, 2);
      }
      // floating dust in the window light
      clipPoly(g, [[-40, -40], [430, -40], [250, 400], [-40, 400]], () => dust(g, 31, 26, t, [0, 0, 640, 360], D.lamp, 0.45));
      PX.vignette(g, 0.42);
    };
  };

  // =====================================================================================================
  // ball_string: a park at golden hour, seen from above at a slight angle. A child swings a ball on a string around
  // their head; the ball circles steadily (o.swing 0.5 it winds up to speed). o.arrows (3.0, false = never): faint
  // dotted arrows, one along the string (centre to ball) and one at right angles to it (the ball's motion), with a
  // small right-angle mark. Long low-sun shadows: the ball's shadow circles on the grass too.
  K.ball_string = (o) => {
    const KY = 0.6, RS = 84, KS = 1.45;                                     // orbit squash (view tilt) and string length
    const KID = { skin: SK.med, hair: HR.black, top: tri(mix(D.amber[2], D.paperD, 0.25), 0.25, 0.42), shorts: tri(mix(D.teal[2], D.n2, 0.25), 0.2, 0.4), shoe: D.cream };
    const MUM = { skin: SK.fair, hair: HR.auburn, top: tri(mix(D.steel[2], D.paperD, 0.3), 0.22, 0.42) };
    const G1 = mix(mix(D.moss[1], D.amber[1], 0.3), D.n3, 0.08), G2 = mix(G1, mix(D.moss[2], D.amber[2], 0.2), 0.32);
    const TUFT = []; { const r = PX.rnd(77); for (let i = 0; i < 160; i++) TUFT.push([r() * 700 - 30, 60 + r() * 320, r()]); }
    const FLW = []; { const r = PX.rnd(78); for (let i = 0; i < 26; i++) FLW.push([500 + r() * 140, 250 + r() * 100, r()]); }
    const SUN = [1.0, 0.38];                                     // shadow direction per unit height (sun low, upper left)
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8), tW = T("swing", 0.5), tA = o.arrows === false ? 1e9 : T("arrows", 3.0);
      // angle: winds up from a slow start to a steady ~0.95 rev/s (analytic, continuous)
      const w = TAU * 0.95, ramp = 0.9;
      const u = t - tW, phi = -Math.PI / 2 + (u <= 0 ? 0 : u < ramp ? (w * u * u) / (2 * ramp) : w * (u - ramp / 2));
      const spin = u <= 0 ? 0 : Math.min(1, u / ramp);
      R(g, -40, -40, 720, 440, mix(D.moss[2], D.amber[2], 0.3));
      const FX = 318, FY = 286, HX = FX + 14, HY = FY - 98;       // child's feet, hand (orbit centre)
      const bx = (a) => HX + Math.cos(a) * RS, by = (a) => HY + Math.sin(a) * RS * KY;
      const sway = Math.sin(phi) * spin;

      // ---- far: low sun, tree line, haze ----
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 110, mix(D.lamp, D.cream, 0.35), mix(D.amber[0], D.lampD, 0.4), 6);
        PX.glow(g, 120, 10, 160, D.lamp, 0.5);
        const tc = [mix(D.moss[2], D.n2, 0.5), mix(D.moss[2], D.n2, 0.3), mix(D.moss[1], D.lampD, 0.45)];
        for (let i = 0; i < 26; i++) { const x = -40 + i * 29 + (i * 17) % 13, y = 40 + (i % 3) * 5, rr = 18 + (i * 7) % 14; ell(g, x, y, rr, rr * 0.85, tc[0]); }
        for (let i = 0; i < 26; i++) { const x = -40 + i * 29 + (i * 17) % 13, y = 40 + (i % 3) * 5, rr = 18 + (i * 7) % 14; ell(g, x - rr * 0.25, y - rr * 0.3, rr * 0.55, rr * 0.4, tc[1]); A(g, 0.6, () => ell(g, x - rr * 0.4, y - rr * 0.5, rr * 0.3, rr * 0.18, tc[2])); }
        for (let i = 0; i < 9; i++) { const x = 10 + i * 78; R(g, x, 50, 3, 18, mix(D.rust[2], D.n1, 0.5)); }
        A(g, 0.4, () => PX.vgrad(g, -40, 30, 720, 44, mix(D.lamp, D.amber[1], 0.25), mix(D.moss[2], D.lampD, 0.4), 4));
      });
      // ---- lawn: mowing stripes, tree shadows, path, bench ----
      PX.par(g, c, 0.8, () => {
        R(g, -40, 62, 720, 340, G1);
        for (let i = -14; i < 16; i += 2) poly(g, [[320 + i * 22 + 60, 62], [320 + (i + 1) * 22 + 60, 62], [320 + (i + 1) * 58 - 30, 400], [320 + i * 58 - 30, 400]], G2);
        A(g, 0.22, () => PX.vgrad(g, -40, 62, 720, 340, mix(D.lamp, D.amber[1], 0.2), mix(D.moss[2], D.n2, 0.5), 7));
        A(g, 0.5, () => R(g, -40, 62, 720, 3, mix(G2, D.n1, 0.3)));
        for (const [x, y, k] of TUFT) { const col = k > 0.6 ? mix(G1, D.lamp, 0.25) : mix(G2, D.n1, 0.25); R(g, x, y, 1, 2, col); R(g, x + 1, y - 1, 1, 2, col); }
        // long shadows of the trees behind, falling to the lower right
        A(g, 0.16, () => { for (const [x0, w2] of [[-30, 70], [150, 50], [380, 90], [560, 60]]) poly(g, [[x0, 62], [x0 + w2, 62], [x0 + w2 + 200, 132], [x0 + 170, 132]], BLK); });
        // gravel path sweeping across the lower left
        const pth = [[-40, 236], [60, 214], [170, 196], [250, 170], [330, 140], [430, 108], [680, 78]];
        const edge = (off) => pth.map(([x, y]) => [x, y + off]);
        poly(g, [...edge(-12), ...edge(14).reverse()], mix(D.paper, D.paperD, 0.55));
        poly(g, [...edge(-12), ...edge(-9).reverse()], mix(D.paperD, D.n4, 0.25)); poly(g, [...edge(12), ...edge(14).reverse()], mix(D.paperD, D.moss[2], 0.35));
        { const r = PX.rnd(3); for (let i = 0; i < 140; i++) { const k = r(), j = Math.min(pth.length - 2, Math.floor(k * (pth.length - 1))), f = k * (pth.length - 1) - j, x = lerp(pth[j][0], pth[j + 1][0], f), y = lerp(pth[j][1], pth[j + 1][1], f) + (r() - 0.5) * 22; R(g, x, y, 1, 1, r() < 0.5 ? D.paperD : D.cream); } }
        // bench beside the path, a parent reading on it
        const BX = 120, BY = 176;
        A(g, 0.3, () => poly(g, [[BX - 26, BY + 10], [BX + 26, BY + 10], [BX + 70, BY + 26], [BX + 18, BY + 26]], BLK));
        const bw = wood(0.25);
        R(g, BX - 26, BY - 16, 52, 4, bw[1]); R(g, BX - 26, BY - 16, 52, 1, bw[0]); R(g, BX - 26, BY - 10, 52, 3, bw[1]);
        R(g, BX - 28, BY - 2, 56, 6, bw[1]); R(g, BX - 28, BY - 2, 56, 1, bw[0]); R(g, BX - 28, BY + 4, 56, 2, bw[2]);
        for (const lx of [BX - 24, BX + 21]) { R(g, lx, BY + 4, 3, 8, D.n2); R(g, lx, BY - 16, 3, 14, D.n2); }
        // the parent: seated, head bowed over a book, turns a page now and then
        const [sl, sb, sd] = MUM.skin, [tl, tb, td] = MUM.top, [hl, hb] = MUM.hair, pg = frac(t / 3.3);
        R(g, BX + 2, BY - 4, 7, 8, mix(D.n3, D.steel[2], 0.3)); R(g, BX + 2, BY + 4, 3, 9, mix(D.n3, D.steel[2], 0.3)); R(g, BX + 6, BY + 4, 3, 9, mix(D.n3, D.steel[2], 0.2)); R(g, BX + 1, BY + 12, 5, 2, D.n1); R(g, BX + 6, BY + 12, 5, 2, D.n1);
        R(g, BX - 4, BY - 20, 14, 18, tb); R(g, BX - 4, BY - 20, 3, 18, tl); R(g, BX + 8, BY - 20, 2, 18, td);
        PX.circle(g, BX + 3, BY - 26, 6, sb); R(g, BX + 6, BY - 28, 2, 6, sd);
        PX.circle(g, BX + 2, BY - 29, 6, hb); R(g, BX - 4, BY - 29, 4, 10, hb); R(g, BX - 1, BY - 35, 5, 1, hl); R(g, BX + 4, BY - 25, 1, 1, D.n0);
        R(g, BX + 6, BY - 14, 12, 8, D.cream); R(g, BX + 11, BY - 14, 1, 8, D.paperD);
        if (pg < 0.12) { const k2 = pg / 0.12; R(g, BX + 12 - Math.round(6 * k2), BY - 15, 6, 8, mix(D.cream, D.paper, 0.4)); }
        R(g, BX + 5, BY - 9, 3, 3, sb); R(g, BX + 16, BY - 9, 3, 3, sb);
        // a pigeon pecking on the path
        const pk = PX.blink(t, 0.9, 0.3), px3 = 214 + Math.round(Math.sin(t * 0.4) * 6), py3 = 190;
        R(g, px3, py3, 7, 4, D.n5); R(g, px3 + 1, py3 + 1, 5, 2, D.n6); R(g, px3 - 2, py3 + 1, 2, 2, D.n4);
        R(g, px3 + 6, py3 - (pk ? -2 : 2), 3, 3, D.n4); R(g, px3 + 8, py3 - (pk ? -3 : 1), 1, 1, D.lampD); R(g, px3 + 3, py3 + 4, 1, 2, D.rose[1]);
        A(g, 0.3, () => ell(g, px3 + 8, py3 + 6, 6, 1, BLK));
        // flower bed and bush (lower right)
        ell(g, 584, 286, 70, 34, mix(D.moss[2], D.n2, 0.3)); ell(g, 578, 280, 62, 28, mix(D.moss[2], D.n3, 0.1));
        for (const [x, y, k] of FLW) { const col = k < 0.35 ? D.cream : k < 0.7 ? mix(D.amber[0], D.cream, 0.3) : mix(D.rose[0], D.cream, 0.2); R(g, x, y - 20, 2, 2, col); R(g, x, y - 18, 1, 2, mix(D.moss[2], D.n1, 0.2)); }
        // lamp post (just lit) by the path
        A(g, 0.25, () => seg(g, 472, 120, 560, 152, 3, BLK));
        R(g, 470, 52, 3, 70, D.n2); R(g, 470, 52, 1, 70, D.n4); R(g, 466, 120, 11, 3, D.n2);
        R(g, 464, 42, 15, 10, D.n2); R(g, 466, 44, 11, 7, mix(D.lamp, D.cream, 0.3)); R(g, 463, 40, 17, 2, D.n2);
        PX.glow(g, 471, 47, 26, D.lamp, 0.22);
      });

      // ---- the child + ball (depth sorted by orbit phase) ----
      const far = Math.sin(phi) < 0 && spin > 0.5, drop = (1 - spin) * 46;
      const ballX = HX + Math.cos(phi) * RS * spin + (1 - spin) * 8, gY = HY + Math.sin(phi) * RS * KY * spin, ballY = gY + drop, hmx = HX + Math.round(Math.cos(phi - 0.5) * 2 * spin), hmy = HY + Math.round(Math.sin(phi - 0.5) * 1.5 * spin);
      // shadows on the grass: child (long, to the lower right), string, ball
      const sh2 = (x, y, hgt) => [x + SUN[0] * hgt, y + SUN[1] * hgt];
      A(g, 0.28, () => {
        const [sx0, sy0] = [FX, FY], [sx1, sy1] = sh2(FX, FY, 76);
        poly(g, [[sx0 - 11, sy0 - 1], [sx0 + 11, sy0 + 3], [sx1 + 8, sy1 + 8], [sx1 - 8, sy1 - 5]], BLK);
        ell(g, ...sh2(FX, FY, 86), 13, 8, BLK);
        const hs = sh2(hmx, FY, FY - hmy), bs = sh2(ballX, gY + (FY - HY), FY - HY - drop);
        PX.line(g, hs[0], hs[1], bs[0], bs[1], BLK); ell(g, bs[0], bs[1], 5, 3, BLK);
        ell(g, FX, FY + 1, 15, 4, BLK);
      });
      const ball = () => {
        // motion trail: two fading ghosts + a short arc smear
        if (spin > 0.3) {
          A(g, 0.22 * spin, () => ring(g, HX, HY, RS, RS * KY, mix(D.rust[1], D.paper, 0.4), phi - 0.55, phi - 0.08));
          for (let k = 2; k >= 1; k--) { const a = phi - k * 0.16; A(g, (0.3 / k) * spin, () => PX.circle(g, bx(a), by(a), 4, mix(D.rust[1], D.paper, 0.3))); }
        }
        PX.line(g, hmx, hmy, ballX, ballY, mix(D.cream, D.paperD, 0.3));
        const r = far ? 5 : 6;
        PX.circle(g, ballX, ballY, r + 1, mix(D.rust[2], D.n0, 0.3)); PX.circle(g, ballX, ballY, r, D.rust[1]);
        PX.circle(g, ballX - 1, ballY - 1, r - 2, mix(D.rust[1], D.rust[0], 0.5)); R(g, ballX - 2, ballY - 3, 2, 1, D.cream);
        PX.line(g, ballX - r, ballY, ballX + r, ballY, mix(D.rust[1], D.cream, 0.35));
      };
      if (far) ball();
      // child: front-high view, drawn natively at scale KS (rects on a KS grid)
      {
        const [sl, sb, sd] = KID.skin, [tl, tb, td] = KID.top, [ol, ob, od] = KID.shorts, [hl, hb] = KID.hair, hd = mix(hb, D.n0, 0.4);
        const bob = Math.abs(Math.sin(phi)) * 0.5 * spin, X = FX + Math.round(sway * 1.2), Y = FY;
        const r = (x, y, w, h, col) => R(g, Math.round(X + x * KS), Math.round(Y + (y + bob) * KS), Math.max(1, Math.round(w * KS)), Math.max(1, Math.round(h * KS)), col);
        const P2 = (x, y) => [X + x * KS, Y + (y + bob) * KS];
        const el = (x, y, rx, ry, col) => ell(g, ...P2(x, y), rx * KS, ry * KS, col);
        const lm = (x1, y1, x2, y2, w2, col) => limb(g, ...P2(x1, y1), ...P2(x2, y2), w2 * KS, col);
        // legs + shoes (the feet do not bob)
        R(g, X - 6 * KS, Y - 15 * KS, 5 * KS, 13 * KS, sd); R(g, X + 1 * KS, Y - 15 * KS, 5 * KS, 13 * KS, sb); R(g, X - 6 * KS, Y - 15 * KS, 1, 13 * KS, mix(sd, D.n0, 0.2));
        ell(g, X - 4 * KS, Y - 1 * KS, 4 * KS, 2 * KS, KID.shoe); ell(g, X + 4 * KS, Y - 1 * KS, 4 * KS, 2 * KS, KID.shoe); R(g, X - 7 * KS, Y + 1, 6 * KS, 1, D.paperD); R(g, X + 1 * KS, Y + 1, 6 * KS, 1, D.paperD);
        // shorts
        r(-8, -22, 16, 9, ob); r(-8, -22, 16, 1, ol); r(-0.5, -18, 1, 5, od); r(5, -22, 3, 9, od);
        // t-shirt
        poly(g, [P2(-10, -37), P2(10, -37), P2(9, -21), P2(-9, -21)], tb);
        poly(g, [P2(-10, -37), P2(-7, -37), P2(-6.5, -21), P2(-9, -21)], tl); poly(g, [P2(6, -37), P2(10, -37), P2(9, -21), P2(6, -21)], td); r(-8.5, -23, 17, 2, td);
        el(0, -37, 4, 2, sd); r(-5, -31, 10, 1, mix(tb, D.cream, 0.35)); r(-4, -29, 8, 1, mix(tb, D.rust[1], 0.3));
        // free arm (left of the picture), out for balance
        const sw2 = sway * 0.8;
        lm(-9, -34, -16, -25 + sw2, 4.4, tb); lm(-16, -25 + sw2, -19, -16, 3.6, sb); el(-19, -15, 2.4, 2.4, sb);
        // raised arm (right of the picture) up to the circling hand
        const hxL = (hmx - X) / KS, hyL = (hmy - Y) / KS - bob, exL = 14, eyL = -48;
        lm(9, -35, exL, eyL, 5, tb); lm(exL, eyL, hxL, hyL + 3, 4, sb); r(7, -37, 5, 4, tb);
        // head: hair seen from above, face turned up to the ball
        const hy2 = -47;
        r(-2, -40, 5, 3, sd);
        el(0, hy2, 10, 10, sb); r(6, hy2 - 2, 3, 9, sd); r(-9, hy2 + 1, 2, 4, sl);
        el(-10, hy2 + 1, 2, 3, sb); el(10, hy2 + 1, 2, 3, sd);
        el(0, hy2 - 6, 10.5, 6, hb);
        for (const [dx, dy, rr] of [[-8, -4, 3.5], [8, -4, 3.5], [-4, -9, 4], [4, -9, 4], [0, -11, 3], [-9, -1, 2], [9, -1, 2]]) el(dx, hy2 + dy, rr, rr, hb);
        for (const [dx, dy] of [[-6, -11], [-1, -13], [4, -11], [-9, -7]]) r(dx, hy2 + dy, 3, 1, hl);
        for (const [dx, dy] of [[-3, -6], [2, -7], [6, -5]]) r(dx, hy2 + dy, 2, 1, hd);
        r(-6, hy2 - 2, 4, 1, hd); r(1, hy2 - 2, 5, 1, hd); r(-1, hy2 - 1, 2, 1, hb);
        // eyes follow the ball
        const lx = clamp(Math.round(Math.cos(phi) * 1.4), -1, 1), ly = Math.sin(phi) < -0.3 ? -1 : 0, blink = PX.blink(t + 0.4, 3.3, 0.04);
        for (const ex2 of [-4, 4]) {
          if (blink) { r(ex2 - 1.5, hy2 + 3, 3, 1, mix(sd, D.n0, 0.3)); continue; }
          r(ex2 - 1.5, hy2 + 1.5, 3, 3, D.cream); r(ex2 - 1 + lx * 0.5, hy2 + 2 + (ly < 0 ? 0 : 0.7), 2, 2, D.n0); r(ex2 - 0.5 + lx * 0.5, hy2 + 2, 1, 1, D.cream);
          r(ex2 - 1.5, hy2 - 0.5, 3, 1, hd);
        }
        r(-8, hy2 + 5, 2, 1, mix(sb, D.rose[1], 0.5)); r(6, hy2 + 5, 2, 1, mix(sb, D.rose[1], 0.5));
        // open delighted smile
        r(-2.5, hy2 + 6, 5, 2, mix(sd, D.rust[2], 0.55)); r(-1.5, hy2 + 6, 3, 1, D.cream); r(-3.5, hy2 + 5, 1, 1, mix(sd, D.rust[2], 0.45)); r(2.5, hy2 + 5, 1, 1, mix(sd, D.rust[2], 0.45));
        // warm sun rim on the hair and shoulder (light from the upper left)
        ring(g, ...P2(0, hy2 - 6), 10.5 * KS, 6 * KS, mix(D.lamp, hl, 0.35), Math.PI * 1.02, Math.PI * 1.42);
        r(-10, -37, 1, 6, mix(D.lamp, tl, 0.4));
        // the hand on top
        ell(g, hmx, hmy + 1, 3 * KS, 3 * KS, sb); R(g, hmx - 2, hmy - 2, 3, 1, sl);
      }
      if (!far) ball();

      // ---- arrows: string direction (centre -> ball) and motion (perpendicular), drawn in the ground plane ----
      if (t >= tA) {
        const a2 = P(t, tA, 0.6, "out");
        A(g, a2, () => {
          const cR = mix(D.cream, D.paper, 0.2), cV = mix(D.amber[0], D.cream, 0.25);
          const pr = (gx, gy) => [HX + gx, HY + gy * KY];
          const ux = Math.cos(phi), uy = Math.sin(phi), vx = -uy, vy = ux;          // radial + tangent (direction of travel)
          const head = (x1, y1, x2, y2, col) => { const an = Math.atan2(y2 - y1, x2 - x1), f = rotF(x2, y2, an); poly(g, [f(2, 1), f(-6, -3), f(-6, 5)].map(([x, y]) => [x, y]), D.n1); poly(g, [f(2, 0), f(-6, -4.5), f(-6, 4.5)], col); };
          const [r0x, r0y] = pr(ux * 8, uy * 8), [r1x, r1y] = pr(ux * (RS + 22), uy * (RS + 22));
          const dd = (x1, y1, x2, y2, col) => { A(g, 0.45, () => dots(g, x1 + 1, y1 + 1, x2 + 1, y2 + 1, D.n1, 3, t * 6)); dots(g, x1, y1, x2, y2, col, 3, t * 6); dots(g, x1 + 1, y1, x2 + 1, y2, col, 3, t * 6); };
          dd(r0x, r0y, r1x, r1y, cR); head(r0x, r0y, r1x, r1y, cR);
          const [t1x, t1y] = pr(ux * RS + vx * 46, uy * RS + vy * 46);
          dd(ballX, ballY, t1x, t1y, cV); head(ballX, ballY, t1x, t1y, cV);
          // right-angle mark at the ball, in the ground plane
          const m = 9, q = [pr(ux * (RS - m), uy * (RS - m)), pr(ux * (RS - m) + vx * m, uy * (RS - m) + vy * m), pr(ux * RS + vx * m, uy * RS + vy * m)];
          PX.line(g, q[0][0], q[0][1], q[1][0], q[1][1], cR); PX.line(g, q[1][0], q[1][1], q[2][0], q[2][1], cR);
        });
      }

      // ---- foreground: an overhanging branch (upper right) and tall grass (lower left), soft in the golden light ----
      PX.par(g, c, 1.2, () => {
        const lc = [mix(D.moss[2], D.n1, 0.45), mix(D.moss[2], D.n2, 0.3), mix(D.moss[1], D.lampD, 0.35)];
        seg(g, 700, -20, 560, 30, 5, mix(D.rust[2], D.n1, 0.5));
        for (let i = 0; i < 16; i++) {
          const k = i / 15, bxx = lerp(690, 548, k) + Math.sin(t * 0.9 + i) * 2, byy = lerp(-16, 34, k) + (i % 2 ? 9 : -5) + Math.sin(t * 1.1 + i * 0.7) * 1.5;
          const f = rotF(bxx, byy, 0.6 + (i % 3) * 0.5 + Math.sin(t * 0.8 + i) * 0.06);
          poly(g, [f(-9, 0), f(-3, -5), f(6, -4), f(10, 0), f(5, 4), f(-3, 5)], lc[i % 3]); PX.line(g, ...f(-8, 0), ...f(8, 0), mix(lc[i % 3], D.n0, 0.3));
        }
        for (let i = 0; i < 22; i++) { const x0 = -10 + i * 5, a = -1.75 + (i % 5) * 0.09 + Math.sin(t * 1.2 + i * 0.5) * 0.06, L = 36 + (i * 7) % 26;
          seg(g, x0, 372, x0 + Math.cos(a) * L, 372 + Math.sin(a) * L, 2, i % 3 ? mix(D.moss[2], D.n1, 0.35) : mix(D.moss[1], D.lampD, 0.4)); }
      });
      // pollen drifting in the low sun
      PX.particles(g, 61, 34, t, [0, 40, 640, 300], { vx: 3, vy: -1.2, col: D.lamp, a: 0.55, tw: 1.6 });
      A(g, 0.1, () => poly(g, [[-40, -40], [260, -40], [-40, 300]], D.lamp));
      PX.vignette(g, 0.45);
    };
  };

  // =====================================================================================================
  // outlet: a living room at evening. A table lamp is plugged into a wall socket; a faint cutaway shows the cable
  // inside the wall, where a small glowing dot shakes back and forth fast (o.flow 0.5) - alternating current.
  // o.label (2.5): "50 TIMES A SECOND". A cat sleeps in the armchair; the city lights up outside.
  K.outlet = (o) => {
    const WL = mix(mix(D.paper, D.rose[1], 0.3), D.n3, 0.58), WD = wood(0.35), FL = wood(0.3);
    const CITY = []; { const r = PX.rnd(50); for (let i = 0; i < 40; i++) CITY.push([r(), r(), r()]); }
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 6), tF = T("flow", 0.5), tL = T("label", 2.5);
      const flow = P(t, tF, 0.5, "out");
      R(g, -40, -40, 720, 440, D.n1);
      const SX = 440, SY = 262;                                   // socket centre
      // ---- far: dusk outside the window ----
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -20, 280, 230, mix(D.steel[2], D.n2, 0.45), mix(D.steel[1], D.rose[2], 0.35), 7); R(g, -40, 190, 280, 60, mix(D.n2, D.steel[2], 0.3));
        A(g, 0.5, () => PX.vgrad(g, 0, 140, 200, 50, mix(D.steel[1], D.rose[2], 0.3), mix(D.lampD, D.rose[1], 0.4), 4));
        const bc = mix(D.n2, D.steel[2], 0.3);
        for (const [x, w, h] of [[0, 34, 70], [30, 26, 96], [54, 40, 60], [92, 22, 110], [112, 46, 76], [156, 30, 92], [184, 40, 66]]) {
          R(g, x, 190 - h, w, h, bc); R(g, x, 190 - h, w, 1, mix(bc, D.steel[1], 0.4));
        }
        for (const [u, v, k] of CITY) { const x = Math.floor(u * 196), y = 100 + Math.floor(v * 84), on = k < 0.55 && (k > 0.1 || t > 2.0 + k * 20); if (on) R(g, x, y, 2, 2, k < 0.3 ? mix(D.lamp, D.amber[1], 0.4) : mix(D.lamp, D.cream, 0.5)); }
        R(g, 112, 108, 1, 6, D.n1); if (PX.blink(t, 1.4, 0.5)) R(g, 112, 107, 1, 1, D.rust[1]);
      });
      // ---- the room wall ----
      PX.par(g, c, 0.85, () => {
        g.save(); g.beginPath(); g.rect(-40, -40, 720, 340); g.rect(24, 40, 136, 150); g.clip("evenodd");
        R(g, -40, -40, 720, 340, WL);
        for (let y = -36; y < 296; y += 3) for (let x = -40 + ((y / 3) % 2) * 3; x < 680; x += 9) R(g, x, y, 1, 1, mix(WL, D.n1, 0.06));
        g.restore();
        // lamp light pool on the wall, warm, falling off
        PX.glow(g, 515, 150, 260, D.lamp, 0.34); PX.glow(g, 515, 150, 100, D.lamp, 0.2);
        A(g, 0.1, () => poly(g, [[488, 172], [542, 172], [600, 300], [430, 300]], D.lamp));
        A(g, 0.08, () => poly(g, [[490, 132], [540, 132], [600, -40], [430, -40]], D.lamp));
        // window frame, sill, curtain
        const wf = mix(D.cream, D.paper, 0.4);
        R(g, 20, 36, 144, 4, wf); R(g, 20, 36, 4, 158, wf); R(g, 160, 36, 4, 158, wf); R(g, 90, 40, 3, 150, wf); R(g, 24, 112, 136, 3, wf);
        R(g, 14, 190, 156, 6, wf); R(g, 14, 196, 156, 2, mix(D.paperD, D.n4, 0.3));
        const cur = tri(mix(D.moss[2], D.paperD, 0.35), 0.2, 0.42), sw = Math.sin(t * 0.8) * 1.2;
        poly(g, [[146, 26], [182, 26], [184 + sw, 214], [140 + sw, 214]], cur[1]);
        for (let f = 0; f < 4; f++) PX.line(g, 150 + f * 8, 28, 146 + f * 9 + sw, 212, f % 2 ? cur[2] : cur[0]);
        R(g, 6, 24, 186, 3, D.n2); R(g, 6, 24, 186, 1, D.n5);
        // a wall clock with ticks only
        const CX = 320, CY = 78;
        A(g, 0.3, () => PX.circle(g, CX + 2, CY + 3, 17, BLK));
        PX.circle(g, CX, CY, 17, WD[1]); PX.circle(g, CX, CY, 15, mix(D.cream, D.paper, 0.3));
        for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU, r0 = i % 3 ? 12 : 10; PX.line(g, CX + Math.cos(a) * r0, CY + Math.sin(a) * r0, CX + Math.cos(a) * 13, CY + Math.sin(a) * 13, D.ink); }
        const hand = (a, l, col) => PX.line(g, CX, CY, CX + Math.cos(a - Math.PI / 2) * l, CY + Math.sin(a - Math.PI / 2) * l, col);
        hand(TAU * 0.6, 7, D.ink); hand(TAU * (0.12 + t / 3600), 11, D.ink); hand(TAU * (Math.floor(t) / 60 + 0.3), 12, D.rust[1]); R(g, CX, CY, 1, 1, D.rust[2]);
        // a small framed print
        R(g, 220, 112, 40, 52, WD[2]); R(g, 223, 115, 34, 46, D.paper); PX.circle(g, 240, 132, 8, mix(D.amber[1], D.paper, 0.4)); R(g, 223, 146, 34, 15, mix(D.steel[1], D.paper, 0.45));
        // skirting board
        R(g, -40, 292, 720, 10, mix(D.cream, D.paper, 0.45)); R(g, -40, 292, 720, 1, D.cream); R(g, -40, 301, 720, 1, mix(D.paperD, D.n3, 0.4));
        // ---- the cutaway into the wall: plaster opened, brick behind, the cable runs from the socket box ----
        const CX0 = 246, CY0 = 214, CW = 182, CH = 70;
        const cut = [[CX0, CY0 + 6], [CX0 + 30, CY0], [CX0 + 90, CY0 + 4], [CX0 + CW, CY0 + 2], [CX0 + CW + 4, CY0 + CH - 6], [CX0 + 120, CY0 + CH], [CX0 + 40, CY0 + CH - 3], [CX0 - 3, CY0 + CH - 8]];
        A(g, 0.8, () => {
          poly(g, cut.map(([x, y]) => [x - 2, y + 2]), mix(D.paper, D.cream, 0.4));
          clipPoly(g, cut, () => {
            R(g, CX0 - 10, CY0 - 10, CW + 20, CH + 20, mix(D.n2, D.rust[2], 0.3));
            for (let row = 0; row < 8; row++) for (let col = -1; col < 10; col++) { const bx = CX0 + col * 22 + (row % 2) * 11, by = CY0 + row * 10;
              R(g, bx + 1, by + 1, 20, 8, mix(mix(D.rust[2], D.n3, 0.35), D.n1, hash(row, col) * 0.25)); R(g, bx + 1, by + 1, 20, 1, mix(D.rust[2], D.paperD, 0.25)); }
            A(g, 0.5, () => R(g, CX0 - 10, CY0 - 10, CW + 20, CH + 20, D.n1));
            // conduit from the socket box running left, then up into the ceiling
            const y0 = 248, xb = 276;
            R(g, xb - 4, CY0 - 10, 12, y0 - CY0 + 16, mix(D.n5, D.paperD, 0.3)); R(g, xb - 4, CY0 - 10, 2, y0 - CY0 + 16, mix(D.n6, D.cream, 0.2));
            R(g, xb - 4, y0 - 6, CW, 12, mix(D.n5, D.paperD, 0.3)); R(g, xb - 4, y0 - 6, CW, 1, mix(D.n6, D.cream, 0.25)); R(g, xb - 4, y0 + 5, CW, 1, mix(D.n4, D.n2, 0.5));
            // the two conductors inside (live = rust, neutral = steel)
            R(g, xb + 2, y0 - 3, CW - 10, 2, mix(D.rust[1], D.amber[2], 0.3)); R(g, xb - 1, CY0 - 10, 2, y0 - CY0 + 7, mix(D.rust[1], D.amber[2], 0.3));
            R(g, xb + 2, y0 + 1, CW - 10, 2, mix(D.steel[1], D.n5, 0.2)); R(g, xb + 3, CY0 - 10, 2, y0 - CY0 + 13, mix(D.steel[1], D.n5, 0.2));
            // the charge: shakes left/right along the live wire; a short trail; faint end ticks show the swing
            if (flow > 0) {
              const mid = 352, amp = 26 * flow, f = 3.1, xAt = (tt) => mid + Math.sin((tt - tF) * TAU * f) * amp;
              A(g, 0.5 * flow, () => { R(g, mid - 26, y0 - 7, 1, 3, D.amber[0]); R(g, mid + 26, y0 - 7, 1, 3, D.amber[0]); });
              for (let k = 4; k >= 1; k--) A(g, (0.5 - k * 0.1) * flow, () => R(g, xAt(t - k * 0.018) - 1, y0 - 3, 3, 2, D.amber[1]));
              const x = xAt(t);
              PX.glow(g, x, y0 - 2, 10, D.amber[1], 0.5 * flow);
              A(g, flow, () => { R(g, x - 1, y0 - 4, 3, 4, D.amber[0]); R(g, x, y0 - 3, 1, 2, D.cream); });
            }
          });
          // broken plaster rim
          for (let i = 0; i < cut.length; i++) { const [ax, ay] = cut[i], [bx, by] = cut[(i + 1) % cut.length]; PX.line(g, ax, ay, bx, by, mix(D.paperD, D.n3, 0.3)); PX.line(g, ax + 1, ay + 1, bx + 1, by + 1, mix(D.cream, WL, 0.4)); }
        });
        // socket plate + plug
        A(g, 0.3, () => R(g, SX - 15, SY - 13, 34, 28, BLK));
        R(g, SX - 17, SY - 15, 34, 28, mix(D.cream, D.paper, 0.2)); R(g, SX - 17, SY - 15, 34, 1, D.cream); R(g, SX - 17, SY + 12, 34, 1, D.paperD); R(g, SX + 16, SY - 15, 1, 28, D.paperD);
        R(g, SX - 12, SY - 8, 9, 14, mix(D.paper, D.n6, 0.3)); R(g, SX - 9, SY - 6, 1, 3, D.n2); R(g, SX - 6, SY - 6, 1, 3, D.n2); R(g, SX - 8, SY + 1, 1, 2, D.n2);   // empty outlet
        R(g, SX + 3, SY - 10, 11, 18, mix(D.n6, D.paperD, 0.3)); R(g, SX + 3, SY - 10, 11, 1, D.cream); R(g, SX + 12, SY - 10, 2, 18, mix(D.n5, D.n3, 0.4));     // plug
        R(g, SX + 6, SY + 8, 5, 4, mix(D.n5, D.n3, 0.3));
        R(g, SX - 11, SY - 13, 2, 2, D.n6); R(g, SX + 10, SY - 13, 2, 2, D.n6);
      });
      // ---- floor ----
      PX.par(g, c, 0.95, () => {
        R(g, -40, 302, 720, 100, FL[1]);
        for (let i = 0; i < 5; i++) { const y = 302 + Math.round(i * i * 3.4); R(g, -40, y, 720, 1, mix(FL[2], D.n0, 0.3)); }
        for (let i = -12; i <= 12; i++) PX.line(g, 320 + i * 38, 302, 320 + i * 80, 400, mix(FL[1], FL[2], 0.5));
        A(g, 0.14, () => ell(g, 515, 320, 120, 22, D.lamp));
        poly(g, [[60, 318], [330, 318], [360, 372], [20, 372]], mix(D.moss[2], D.n2, 0.35)); poly(g, [[70, 322], [322, 322], [348, 368], [32, 368]], mix(D.moss[2], D.paperD, 0.2));
      });
      // ---- side table + lamp (lit) + the cord to the socket ----
      PX.par(g, c, 1.0, () => {
        const tw = wood(0.2);
        A(g, 0.3, () => ell(g, 518, 312, 56, 6, BLK));
        R(g, 466, 198, 104, 7, tw[1]); R(g, 466, 198, 104, 1, tw[0]); R(g, 466, 205, 104, 2, tw[2]);
        R(g, 474, 207, 6, 104, tw[2]); R(g, 556, 207, 6, 104, tw[2]); R(g, 474, 207, 1, 104, tw[1]); R(g, 478, 258, 82, 4, tw[2]);
        R(g, 484, 262, 70, 6, D.paperD); R(g, 486, 256, 30, 6, mix(D.rust[2], D.n3, 0.2)); R(g, 486, 256, 30, 1, mix(D.rust[1], D.n3, 0.3));
        // cord: lamp base -> behind the table leg -> along the floor -> up into the plug
        const cord = mix(D.n2, D.n3, 0.5);
        PX.line(g, 510, 196, 500, 207, cord); PX.line(g, 500, 207, 482, 300, cord); PX.line(g, 482, 300, 458, 306, cord); PX.line(g, 458, 306, SX + 8, SY + 12, cord);
        // lamp: ceramic base, linen shade lit from inside
        ell(g, 516, 190, 12, 8, mix(D.teal[1], D.n3, 0.25)); ell(g, 514, 188, 9, 6, mix(D.teal[0], D.n5, 0.25)); R(g, 504, 194, 24, 4, mix(D.teal[2], D.n2, 0.2));
        R(g, 515, 162, 2, 20, D.n4);
        poly(g, [[496, 128], [536, 128], [548, 166], [484, 166]], mix(D.lamp, D.cream, 0.4)); poly(g, [[528, 128], [536, 128], [548, 166], [538, 166]], mix(D.lamp, D.lampD, 0.4));
        R(g, 484, 165, 64, 2, mix(D.lampD, D.n4, 0.2)); R(g, 496, 127, 40, 2, mix(D.lampD, D.n4, 0.2));
        PX.glow(g, 516, 150, 40, D.lamp, 0.3);
        // a book and glasses on the table
        R(g, 538, 192, 24, 6, mix(D.steel[2], D.n3, 0.2)); R(g, 538, 192, 24, 1, mix(D.steel[1], D.n4, 0.2)); R(g, 539, 194, 22, 3, D.paper);
      });
      // ---- armchair with a sleeping cat ----
      PX.par(g, c, 1.0, () => {
        const ch = tri(mix(D.rust[2], D.paperD, 0.25), 0.2, 0.42);
        A(g, 0.3, () => ell(g, 140, 308, 80, 8, BLK));
        R(g, 74, 296, 8, 12, D.n1); R(g, 202, 296, 8, 12, D.n1);
        poly(g, [[78, 150], [206, 150], [212, 230], [72, 230]], ch[1]); R(g, 78, 150, 128, 2, ch[0]); poly(g, [[184, 150], [206, 150], [212, 230], [192, 230]], ch[2]);
        for (let i = 0; i < 4; i++) R(g, 96 + i * 28, 160 + (i % 2) * 20, 2, 2, ch[2]);
        R(g, 66, 222, 152, 30, ch[1]); R(g, 66, 222, 152, 2, ch[0]);
        ell(g, 70, 236, 14, 44, ch[1]); ell(g, 214, 236, 14, 44, ch[2]); ell(g, 70, 196, 13, 8, ch[0]); ell(g, 214, 196, 13, 8, ch[1]);
        R(g, 62, 252, 162, 46, ch[1]); R(g, 62, 252, 162, 2, ch[0]); R(g, 62, 290, 162, 6, ch[2]);
        // the cat, curled, breathing; an ear twitch and a tail flick now and then
        const br = Math.sin(t * 1.7) * 0.8, cc = tri(mix(D.n4, D.paperD, 0.25), 0.22, 0.4), cx = 140, cy = 236;
        ell(g, cx, cy + 1, 32, 13 + br, cc[2]); ell(g, cx - 1, cy - 1, 30, 12 + br, cc[1]); ell(g, cx - 6, cy - 5 - br * 0.5, 18, 5, cc[0]);
        for (let i = 0; i < 4; i++) R(g, cx - 14 + i * 9, cy - 8 - Math.round(br * 0.5), 3, 1, cc[2]);
        const flick = Math.max(0, Math.sin(clamp((t - 3.9 * d / 6) / 0.6, 0, 1) * Math.PI)) * 6;
        seg(g, cx + 22, cy + 8, cx + 4, cy + 12 + flick * 0.3, 5, cc[1]); seg(g, cx + 4, cy + 12 + flick * 0.3, cx - 18 - flick, cy + 9 - flick, 5, cc[1]); R(g, cx - 22 - flick, cy + 6 - flick, 5, 4, cc[0]);
        const hxx = cx - 26, hyy = cy - 2 - Math.round(br * 0.3);
        ell(g, hxx, hyy, 11, 9, cc[1]); ell(g, hxx - 2, hyy - 3, 7, 4, cc[0]);
        const tw2 = PX.blink(t - 3.0, 4.2, 0.06) && t > 2.6 ? 2 : 0;
        poly(g, [[hxx - 9, hyy - 5], [hxx - 6, hyy - 14 + tw2], [hxx - 2, hyy - 7]], cc[1]); poly(g, [[hxx + 2, hyy - 7], [hxx + 6, hyy - 14], [hxx + 9, hyy - 4]], cc[1]); R(g, hxx - 6, hyy - 10 + tw2, 1, 3, D.rose[1]); R(g, hxx + 5, hyy - 10, 1, 3, D.rose[1]);
        R(g, hxx - 6, hyy, 4, 1, D.n1); R(g, hxx + 2, hyy, 4, 1, D.n1); R(g, hxx - 1, hyy + 3, 2, 1, D.rose[2]);
        R(g, hxx - 12, hyy + 3, 4, 1, cc[0]); R(g, hxx + 9, hyy + 3, 4, 1, cc[0]);
        ell(g, hxx + 6, hyy + 8, 6, 3, cc[0]);
        // lamp rim light on the chair back
        PX.line(g, 206, 152, 212, 228, mix(D.lamp, ch[0], 0.4));
      });
      // label
      label(g, "50 TIMES A SECOND", 337, 194, t, tL, { col: D.amber[0], size: 8 });
      // ---- foreground: plant leaves (lower right), out of focus ----
      PX.par(g, c, 1.18, () => {
        const lv = [mix(D.moss[2], D.n1, 0.5), mix(D.moss[2], D.n1, 0.35)];
        for (let i = 0; i < 6; i++) { const a = -2.1 + i * 0.32 + Math.sin(t * 0.6 + i) * 0.03, L = 60 + (i % 3) * 14, ex = 640 + Math.cos(a) * L, ey = 380 + Math.sin(a) * L, f = rotF(ex, ey, a);
          poly(g, [f(-18, 0), f(-6, -9), f(10, -8), f(20, 0), f(8, 8), f(-8, 8)], lv[i % 2]); PX.line(g, 640, 380, ex, ey, lv[0]); }
      });
      // dust in the lamp light
      clipPoly(g, [[430, 120], [600, 120], [640, 330], [400, 330]], () => dust(g, 9, 18, t, [400, 100, 240, 230], D.lamp, 0.45));
      PX.vignette(g, 0.55);
    };
  };

  // =====================================================================================================
  // waves: a city rooftop at dusk. Gentle rings spread from a speaker on a balcony (o.sound 0.5, moss), from a rooftop
  // lamp (o.light 2.5, amber) and from a radio / wifi mast (o.wifi 4.5, teal, dashed). Labels "SOUND", "LIGHT", "WIFI".
  K.waves = (o) => {
    const STAR = []; { const r = PX.rnd(31); for (let i = 0; i < 40; i++) STAR.push([r() * 680 - 20, r() * 90, r()]); }
    const WIN = []; { const r = PX.rnd(32); for (let i = 0; i < 160; i++) WIN.push([r(), r(), r()]); }
    const SKY = [[-20, 60, 150], [40, 44, 120], [96, 70, 170], [150, 36, 110], [200, 58, 140], [262, 50, 200], [300, 80, 130], [372, 40, 160], [420, 66, 120], [480, 46, 150], [540, 72, 116], [600, 50, 140]];
    // spreading rings: src [x, y], start, speed px/s, period s, max radius, colour, arc [a0, a1], dash
    const rings = (g, t, x, y, t0, sp, per, rmax, col, a0, a1, dash) => {
      if (t < t0) return;
      const n = Math.ceil(rmax / (sp * per)) + 1, age0 = t - t0;
      for (let k = 0; k < n; k++) {
        const age = age0 - k * per; if (age < 0) continue;
        const r = (age % (n * per)) * sp; if (r > rmax || r < 3) continue;
        const a = Math.pow(1 - r / rmax, 1.2) * Math.min(1, (age0 - k * per) / 0.3);
        A(g, a, () => ring(g, x, y, r, r, col, a0, a1, dash));
      }
    };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8), tS = T("sound", 0.5), tLi = T("light", 2.5), tW = T("wifi", 4.5);
      R(g, -40, -40, 720, 440, D.n2);
      const SPK = [196, 196], LMP = [336, 150], MST = [478, 62];
      // ---- sky + far city ----
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -40, -40, 720, 160, mix(D.n2, D.steel[2], 0.5), mix(D.steel[2], D.plum[2], 0.3), 7);
        PX.vgrad(g, -40, 120, 720, 120, mix(D.steel[2], D.plum[2], 0.3), mix(mix(D.rose[2], D.lampD, 0.5), D.n4, 0.25), 7); R(g, -40, 240, 720, 160, mix(D.n2, D.steel[2], 0.25));
        for (const [x, y, k] of STAR) if (y < 70) A(g, (0.3 + 0.5 * k) * (0.7 + 0.3 * Math.sin(t * 1.3 + k * 9)), () => R(g, x, y, 1, 1, D.cream));
        for (const [x, w, y] of [[60, 120, 92], [300, 160, 104], [470, 110, 84]]) { A(g, 0.35, () => { R(g, x, y, w, 2, mix(D.rose[1], D.lampD, 0.4)); R(g, x + 20, y + 3, w - 50, 1, mix(D.rose[1], D.lampD, 0.3)); }); }
        const bc = mix(D.n2, D.steel[2], 0.25), bcL = mix(D.n3, D.steel[2], 0.3);
        for (const [x, w, top] of SKY) { R(g, x, top + 60, w > 140 ? 54 : 44, 300, bc); R(g, x, top + 60, 2, 300, bcL); }
        WIN.forEach(([u, v, k], i) => { const b = SKY[i % SKY.length], x = b[0] + 4 + Math.floor(u * ((b[2] > 140 ? 54 : 44) - 8) / 4) * 4, y = b[1] + 66 + Math.floor(v * 140 / 5) * 5;
          if (k < 0.45 && y > b[1] + 64) R(g, x, y, 2, 2, k < 0.15 ? mix(D.lamp, D.amber[1], 0.3) : mix(D.lamp, D.n5, 0.4)); });
        A(g, 0.25, () => R(g, -40, 200, 720, 60, mix(D.lampD, D.rose[2], 0.4)));
      });
      // ---- the neighbouring building with a balcony and a speaker (left) ----
      PX.par(g, c, 0.75, () => {
        const wc = tri(mix(D.paperD, D.n3, 0.55), 0.18, 0.4);
        R(g, -40, 70, 266, 330, wc[1]); R(g, 222, 70, 4, 330, wc[2]); R(g, -40, 70, 266, 3, wc[0]);
        for (let y = 80; y < 360; y += 6) R(g, -40, y, 262, 1, mix(wc[1], wc[2], 0.25));
        // lit flat behind the balcony door
        R(g, 40, 112, 120, 84, mix(D.n2, D.rust[2], 0.2)); PX.vgrad(g, 44, 116, 52, 80, mix(D.lamp, D.amber[1], 0.25), mix(D.lampD, D.rust[2], 0.4), 5);
        R(g, 100, 116, 56, 80, mix(D.n2, D.steel[2], 0.25)); R(g, 96, 116, 4, 80, wc[2]); R(g, 40, 112, 120, 4, wc[2]);
        R(g, 56, 128, 22, 30, mix(D.rust[1], D.lampD, 0.4)); R(g, 66, 158, 2, 30, D.n2);                // a floor lamp inside
        PX.glow(g, 70, 140, 50, D.lamp, 0.2);
        // balcony slab + rail
        R(g, -40, 196, 270, 8, wc[0]); R(g, -40, 204, 270, 3, wc[2]);
        A(g, 0.3, () => R(g, -40, 207, 270, 6, BLK));
        R(g, -40, 166, 268, 2, D.n2); for (let x = -36; x < 228; x += 8) R(g, x, 168, 1, 28, D.n2); R(g, 226, 166, 2, 30, D.n2);
        // plant + table + the speaker (woofer cone pulses with the sound)
        R(g, 20, 178, 14, 18, mix(D.rust[2], D.paperD, 0.3)); for (let i = 0; i < 5; i++) { const a = -2.4 + i * 0.3 + Math.sin(t + i) * 0.04; seg(g, 27, 178, 27 + Math.cos(a) * 18, 178 + Math.sin(a) * 18, 3, mix(D.moss[2], D.n2, 0.2)); }
        R(g, 168, 186, 44, 3, wood(0.3)[1]); R(g, 172, 189, 2, 7, D.n2); R(g, 206, 189, 2, 7, D.n2);
        const pump = t >= tS ? Math.round(Math.max(0, Math.sin((t - tS) * TAU * 1.4)) * 1) : 0;
        R(g, SPK[0] - 14, 160, 22, 26, mix(D.n2, D.rust[2], 0.2)); R(g, SPK[0] - 14, 160, 22, 1, mix(D.n4, D.paperD, 0.3)); R(g, SPK[0] + 6, 160, 2, 26, D.n1);
        PX.circle(g, SPK[0] - 3, 177, 6 + pump * 0, D.n1); PX.circle(g, SPK[0] - 3, 177, 4 + pump, mix(D.n3, D.steel[2], 0.3)); R(g, SPK[0] - 4, 176, 2, 2, D.n5);
        PX.circle(g, SPK[0] - 3, 166, 2, D.n1); R(g, SPK[0] - 4, 165, 1, 1, D.n6);
      });
      // ---- the main rooftop (right) ----
      PX.par(g, c, 1.0, () => {
        const rf = tri(mix(D.n4, D.paperD, 0.25), 0.15, 0.4);
        // far parapet, then the roof deck coming toward us (gravel, seams, puddle of lamp light)
        R(g, 226, 244, 460, 14, rf[1]); R(g, 226, 244, 460, 2, rf[0]); for (let x = 230; x < 680; x += 26) R(g, x, 247, 1, 11, mix(rf[1], rf[2], 0.5));
        PX.vgrad(g, 176, 258, 510, 110, mix(rf[2], D.n2, 0.2), mix(rf[2], D.n1, 0.5), 6);
        for (let i = 0; i < 7; i++) R(g, 226, 262 + Math.round(i * i * 2.2), 460, 1, mix(rf[2], D.n0, 0.3));
        for (let i = -6; i <= 8; i++) PX.line(g, 440 + i * 26, 258, 440 + i * 70, 400, mix(rf[2], D.n0, 0.2));
        { const r = PX.rnd(9); for (let i = 0; i < 120; i++) R(g, 226 + r() * 460, 262 + r() * 100, 1, 1, r() < 0.5 ? mix(rf[1], D.n5, 0.4) : mix(rf[2], D.n0, 0.4)); }
        // water tank on legs (far right)
        R(g, 572, 150, 70, 92, mix(D.rust[2], D.n2, 0.35)); for (let i = 0; i < 6; i++) R(g, 572, 154 + i * 15, 70, 1, mix(D.rust[2], D.n1, 0.5)); R(g, 572, 150, 3, 92, mix(D.rust[1], D.n3, 0.3));
        poly(g, [[566, 150], [648, 150], [607, 128]], mix(D.rust[2], D.n1, 0.45)); poly(g, [[566, 150], [607, 128], [600, 150]], mix(D.rust[1], D.n3, 0.35));
        for (const lx of [578, 630]) R(g, lx, 242, 3, 46, D.n2); PX.line(g, 580, 250, 632, 284, D.n2); PX.line(g, 632, 250, 580, 284, D.n2);
        // AC unit with a turning fan + a vent with soft steam
        R(g, 252, 248, 56, 40, mix(D.n5, D.steel[2], 0.25)); R(g, 252, 248, 56, 1, mix(D.n6, D.steel[0], 0.3)); PX.circle(g, 272, 268, 13, D.n2);
        const fa = t * 9; for (let k = 0; k < 3; k++) { const a = fa + (k * TAU) / 3; seg(g, 272, 268, 272 + Math.cos(a) * 11, 268 + Math.sin(a) * 11, 4, mix(D.n4, D.steel[2], 0.3)); }
        R(g, 271, 267, 3, 3, D.n5); for (let i = 0; i < 5; i++) R(g, 290, 254 + i * 6, 14, 2, D.n3);
        R(g, 404, 230, 10, 58, mix(D.n4, D.steel[2], 0.2)); R(g, 400, 226, 18, 6, mix(D.n5, D.steel[2], 0.2));
        for (let i = 0; i < 4; i++) { const k = frac(t * 0.3 + i / 4); A(g, Math.sin(k * Math.PI) * 0.25, () => ell(g, 409 + Math.sin(k * 6 + i) * 4 + k * 10, 222 - k * 40, 4 + k * 7, 3 + k * 4, D.n7)); }
        // the mast: lattice tower with antenna panels and a blinking warning light
        const MX = MST[0], top = 52, base = 288;
        A(g, 0.3, () => poly(g, [[MX - 16, base], [MX + 16, base], [MX + 70, base + 14], [MX + 40, base + 14]], BLK));
        const mc = mix(D.n2, D.steel[2], 0.35);
        PX.line(g, MX - 14, base, MX - 3, top, mc); PX.line(g, MX + 14, base, MX + 3, top, mc); PX.line(g, MX - 13, base, MX - 2, top, mc); PX.line(g, MX + 13, base, MX + 2, top, mc);
        for (let i = 0; i < 14; i++) { const y1 = base - i * 17, y2 = y1 - 17, w1 = lerp(14, 3, (base - y1) / (base - top)), w2 = lerp(14, 3, (base - y2) / (base - top)); if (y2 < top) break;
          PX.line(g, MX - w1, y1, MX + w2, y2, mc); PX.line(g, MX + w1, y1, MX - w2, y2, mc); R(g, MX - w2, y2, w2 * 2 + 1, 1, mc); }
        for (const [dx, y] of [[-9, 96], [7, 96], [-8, 134], [6, 134]]) { R(g, MX + dx, y, 3, 16, mix(D.n5, D.paperD, 0.3)); R(g, MX + dx, y, 1, 16, mix(D.n6, D.cream, 0.3)); }
        R(g, MX - 1, top - 14, 2, 14, mc); PX.circle(g, MX + 10, 116, 5, mix(D.n5, D.paperD, 0.3)); R(g, MX + 8, 114, 2, 2, mix(D.n6, D.cream, 0.3));
        if (PX.blink(t, 1.5, 0.45)) { R(g, MX - 1, top - 17, 3, 3, D.rust[1]); PX.glow(g, MX, top - 16, 10, D.rust[1], 0.5); } else R(g, MX - 1, top - 17, 3, 3, mix(D.rust[2], D.n2, 0.4));
        // rooftop lamp post
        R(g, LMP[0] - 1, LMP[1] + 4, 3, 136, D.n2); R(g, LMP[0] - 6, 284, 13, 4, D.n2);
        seg(g, LMP[0], LMP[1] + 6, LMP[0] - 10, LMP[1] - 2, 2, D.n2);
        R(g, LMP[0] - 8, LMP[1] - 6, 16, 4, D.n2); R(g, LMP[0] - 6, LMP[1] - 2, 12, 4, mix(D.lamp, D.cream, 0.4));
        PX.glow(g, LMP[0], LMP[1], 40, D.lamp, 0.3);
        A(g, 0.12, () => poly(g, [[LMP[0] - 6, LMP[1] + 2], [LMP[0] + 6, LMP[1] + 2], [LMP[0] + 50, 288], [LMP[0] - 50, 288]], D.lamp));
        A(g, 0.16, () => ell(g, LMP[0], 290, 52, 6, D.lamp));
      });
      // ---- waves (drawn over the scene, thin and fading) ----
      rings(g, t, SPK[0] + 6, 175, tS, 42, 0.62, 160, mix(D.moss[0], D.cream, 0.25), -0.95, 0.7);
      rings(g, t, LMP[0], LMP[1], tLi, 50, 0.7, 170, mix(D.amber[0], D.cream, 0.2));
      rings(g, t, MST[0], MST[1], tW, 46, 0.66, 200, D.teal[0], -Math.PI + 0.35, -0.35, [3, 2]);
      label(g, "SOUND", 160, 222, t, tS + 0.2, { col: D.moss[0] });
      label(g, "LIGHT", LMP[0] - 34, LMP[1] - 22, t, tLi + 0.2, { col: D.amber[0] });
      label(g, "WIFI", MST[0] + 44, 50, t, tW + 0.2, { col: D.teal[0] });
      // ---- foreground: a cable and pot plant at the near corner ----
      PX.par(g, c, 1.15, () => {
        R(g, 40, 296, 30, 34, mix(D.rust[2], D.n1, 0.35)); R(g, 37, 294, 36, 4, mix(D.rust[2], D.n2, 0.25));
        for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.25 + Math.sin(t * 0.8 + i) * 0.04; seg(g, 55, 296, 55 + Math.cos(a) * 34, 296 + Math.sin(a) * 34, 4, i % 2 ? mix(D.moss[2], D.n1, 0.5) : mix(D.moss[2], D.n1, 0.35)); }
      });
      PX.vignette(g, 0.5);
    };
  };

  // =====================================================================================================
  // mri_room: inside a hospital imaging room, one-point view straight down the MRI table: the patient lies under a
  // blanket, head in the bore. On the operator's monitor beside the scanner a body slice (axial, at the belly) builds
  // up line by line (o.build 1.0). A technician in scrubs points at it; a backlit sky panel lights the ceiling.
  K.mri_room = (o) => {
    const SW = 92, SH = 60, MASK = [];
    const inE = (u, v, cx, cy, rx, ry) => ((u - cx) / rx) ** 2 + ((v - cy) / ry) ** 2 <= 1;
    for (let j = 0; j < SH; j++) for (let i = 0; i < SW; i++) {
      const u = i - SW / 2 + 0.5, v = j - SH / 2 + 0.5;
      let m = 0;
      if (inE(u, v, 0, 1, 43, 27)) {
        m = 2;                                                            // fat (bright)
        if (inE(u, v, 0, 1, 39, 23.5)) m = 3;                              // muscle wall
        if (inE(u, v, 0, 0, 35, 20)) {
          m = 4;                                                          // abdomen: bowel texture
          const s = Math.sin(u * 0.55 + 2 * Math.sin(v * 0.4)) * Math.cos(v * 0.7 + Math.sin(u * 0.3) * 1.5);
          if (s > 0.45) m = 5; else if (s < -0.55) m = 3;
          if (inE(u, v, -17, -4, 17, 13)) m = 6;                           // liver (patient's right = image left)
          if (inE(u, v, 15, -6, 9, 7)) m = 7;                              // stomach (dark)
          if (inE(u, v, -12, 10, 6, 4.5) || inE(u, v, 12, 10, 6, 4.5)) m = inE(u, v, -12, 10, 3, 2) || inE(u, v, 12, 10, 3, 2) ? 3 : 6;   // kidneys
          if (inE(u, v, -3, 8, 2, 2)) m = 8;                               // aorta
          if (inE(u, v, 0, 15, 6, 5)) m = inE(u, v, 0, 15, 3, 2.5) ? 1 : 8; // vertebra
          if (inE(u, v, 0, 21, 3, 2.5)) m = 8;
        }
      }
      MASK.push(m);
    }
    const TECH = { skin: SK.deep, hair: HR.black, top: tri(mix(D.teal[1], D.steel[1], 0.3), 0.25, 0.42), pants: tri(mix(D.teal[2], D.steel[2], 0.3), 0.2, 0.4), shoe: D.cream, collar: mix(D.teal[2], D.n2, 0.2) };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 6), tB = T("build", 1.0), bp = clamp((t - tB) / (3.4 * d / 6), 0, 1);
      const VP = [250, 150], WL0 = 30, WL1 = 470, WT = 44, WB = 236;
      const wallL = mix(D.n6, D.steel[0], 0.25), wallD = mix(D.n5, D.steel[1], 0.25), flo = mix(D.n5, D.teal[2], 0.2);
      // ---- room shell: back wall, side walls, ceiling with a backlit sky panel, glossy floor ----
      PX.par(g, c, 0.6, () => {
        R(g, -40, -40, 720, 440, wallL);
        poly(g, [[-40, -40], [680, -40], [WL1, WT], [WL0, WT]], mix(D.n6, D.cream, 0.15));
        // sky panel: daylight photo in the ceiling, clouds drifting, a branch at the edge
        clip(g, 126, 4, 250, 34, () => {
          PX.vgrad(g, 126, 4, 250, 34, mix(D.steel[0], D.cream, 0.15), mix(D.cream, D.lamp, 0.25), 5);
          for (let i = 0; i < 6; i++) { const cx = 106 + ((i * 61 + t * 4) % 300), cy = 12 + (i % 3) * 8; ell(g, cx, cy, 16, 4, D.cream); ell(g, cx + 8, cy - 2, 9, 3, D.cream); }
          A(g, 0.5, () => { seg(g, 336, 40, 386, 0, 2, mix(D.moss[2], D.n5, 0.2)); for (let i = 0; i < 6; i++) ell(g, 340 + i * 6, 34 - i * 6, 5, 3, mix(D.moss[1], D.n6, 0.3)); });
        });
        for (let x = 126; x <= 376; x += 50) R(g, x, 4, 2, 34, mix(D.n6, D.n7, 0.5)); R(g, 124, 2, 254, 2, mix(D.n6, D.n7, 0.5)); R(g, 124, 38, 254, 2, mix(D.n5, D.n6, 0.5));
        PX.glow(g, 251, 30, 170, D.cream, 0.18);
        // back wall + side walls in one-point perspective
        R(g, WL0, WT, WL1 - WL0, WB - WT, mix(wallL, D.cream, 0.08));
        poly(g, [[-40, -40], [WL0, WT], [WL0, WB], [-40, 330]], wallD);
        poly(g, [[680, -40], [WL1, WT], [WL1, WB], [680, 400]], mix(wallD, D.n4, 0.25));
        R(g, WL0, WB - 28, WL1 - WL0, 28, mix(D.teal[1], D.n6, 0.55)); R(g, WL0, WB - 28, WL1 - WL0, 1, mix(D.teal[0], D.n7, 0.4));
        poly(g, [[-40, 290], [WL0, WB - 28], [WL0, WB], [-40, 330]], mix(D.teal[1], D.n5, 0.5));
        poly(g, [[680, 330], [WL1, WB - 28], [WL1, WB], [680, 390]], mix(D.teal[1], D.n5, 0.55));
        // floor (glossy vinyl) with the ceiling light reflected
        poly(g, [[WL0, WB], [WL1, WB], [680, 400], [-40, 400]], flo);
        for (let i = -9; i <= 9; i++) PX.line(g, VP[0] + i * 26, WB, VP[0] + i * 86, 400, mix(flo, D.n4, 0.25));
        for (let k = 1; k < 5; k++) { const y = WB + k * k * 8; PX.line(g, -40, y, 680, y, mix(flo, D.n4, 0.2)); }
        A(g, 0.12, () => poly(g, [[160, WB + 4], [340, WB + 4], [380, 400], [120, 400]], D.cream));
        // left wall: door with a small window; back wall: cabinet with coils, a warning sign (no text)
        poly(g, [[-6, 74], [20, 88], [20, 240], [-6, 268]], mix(D.n5, D.steel[2], 0.25)); poly(g, [[0, 98], [14, 104], [14, 138], [0, 134]], mix(D.steel[0], D.cream, 0.3));
        R(g, 44, 120, 74, 88, mix(D.n6, D.paper, 0.3)); R(g, 44, 120, 74, 1, D.cream); R(g, 44, 158, 74, 2, mix(D.n5, D.steel[2], 0.3));
        for (const cx of [62, 92]) { ell(g, cx, 142, 10, 8, mix(D.n6, D.cream, 0.3)); ell(g, cx, 143, 6, 5, mix(D.n4, D.steel[2], 0.3)); }
        for (let k = 0; k < 3; k++) { R(g, 48 + k * 23, 166, 20, 40, mix(D.n6, D.steel[0], 0.2 + k * 0.05)); R(g, 63 + k * 23, 182, 2, 6, D.n4); }
        poly(g, [[132, 96], [152, 96], [142, 78]], D.amber[1]); poly(g, [[135, 94], [149, 94], [142, 82]], D.amber[0]); R(g, 141, 85, 2, 5, D.ink); R(g, 141, 91, 2, 1, D.ink);
        // right side of the back wall: oxygen panel + status lights; a shelf with folded linen
        R(g, 380, 96, 50, 34, mix(D.n6, D.paper, 0.25)); R(g, 386, 104, 5, 5, D.moss[1]); R(g, 396, 104, 5, 5, PX.blink(t, 1.6, 0.5) ? D.amber[1] : mix(D.n5, D.n4, 0.5)); R(g, 408, 104, 16, 3, mix(D.n5, D.steel[2], 0.3));
        R(g, 380, 150, 70, 3, mix(D.n5, D.steel[2], 0.3)); for (let k = 0; k < 3; k++) { R(g, 384 + k * 22, 140, 18, 10, mix(D.cream, D.steel[0], 0.2 + k * 0.08)); R(g, 384 + k * 22, 140, 18, 1, D.cream); }
      });
      // ---- the scanner, seen straight on (stands just in front of the back wall) ----
      PX.par(g, c, 0.85, () => {
        const SX = VP[0], SY = 172;
        const body = mix(D.cream, D.n7, 0.35), bodyL = D.cream, bodyD = mix(D.n6, D.steel[1], 0.25);
        A(g, 0.3, () => ell(g, SX, 250, 96, 9, BLK));
        poly(g, rrPts(160, 148, 22, 6).map(([x, y]) => [SX + x, SY + 3 + y]), bodyD);
        poly(g, rrPts(156, 144, 21, 6).map(([x, y]) => [SX + x, SY + 1 + y]), body);
        poly(g, rrPts(156, 144, 21, 6).filter(([, y]) => y < 0).map(([x, y]) => [SX + x, SY + 1 + y]).concat([[SX + 78, SY - 38], [SX - 78, SY - 38]]), mix(body, bodyL, 0.5));
        R(g, SX - 78, SY + 34, 156, 3, mix(D.teal[1], D.n6, 0.3)); R(g, SX - 78, SY + 34, 156, 1, mix(D.teal[0], D.cream, 0.3));
        // bore: lit tunnel narrowing toward the far opening
        PX.circle(g, SX, SY, 40, bodyD); PX.circle(g, SX, SY, 38, mix(D.cream, D.steel[0], 0.25));
        PX.circle(g, SX, SY, 35, mix(D.n6, D.steel[0], 0.2)); PX.circle(g, SX, SY - 1, 26, mix(D.n5, D.steel[1], 0.2)); PX.circle(g, SX, SY - 2, 18, mix(D.n4, D.steel[2], 0.3)); PX.circle(g, SX, SY - 3, 11, mix(D.n3, D.steel[2], 0.3));
        for (let k = 0; k < 9; k++) { const a = -Math.PI * 0.9 + k * 0.2; R(g, SX + Math.cos(a) * 30, SY + Math.sin(a) * 30 - 1, 1, 1, mix(D.cream, D.steel[0], 0.4)); }
        PX.glow(g, SX, SY - 12, 32, D.steel[0], 0.18);
        R(g, SX + 46, SY - 44, 18, 9, mix(D.n3, D.steel[2], 0.3)); R(g, SX + 48, SY - 42, 3, 2, D.moss[1]); R(g, SX + 53, SY - 42, 3, 2, PX.blink(t + 0.3, 1.1, 0.5) ? D.amber[1] : D.n4); R(g, SX + 58, SY - 42, 4, 2, mix(D.teal[1], D.n4, 0.3));
        // the head + shoulders inside the bore, softly lit
        const br = Math.sin(t * 1.5) * 1.2;
        ell(g, SX, SY + 12 - br * 0.3, 12, 5, mix(D.teal[0], D.n5, 0.35)); PX.circle(g, SX, SY + 2, 6, mix(D.rose[0], D.lampD, 0.45)); R(g, SX - 6, SY - 5, 12, 4, mix(D.n6, D.cream, 0.4));
        R(g, SX - 8, SY - 1, 3, 7, mix(D.n6, D.cream, 0.3)); R(g, SX + 5, SY - 1, 3, 7, mix(D.n6, D.cream, 0.3));
        // table pedestal + cradle coming toward us, patient under a blanket (knees, feet nearest)
        poly(g, [[SX - 22, 236], [SX + 22, 236], [SX + 40, 322], [SX - 40, 322]], mix(D.n5, D.steel[2], 0.3)); poly(g, [[SX + 15, 236], [SX + 22, 236], [SX + 40, 322], [SX + 29, 322]], mix(D.n4, D.steel[2], 0.3));
        poly(g, [[SX - 18, SY + 18], [SX + 18, SY + 18], [SX + 70, 304], [SX - 70, 304]], mix(D.n6, D.steel[1], 0.2));
        poly(g, [[SX - 18, SY + 18], [SX + 18, SY + 18], [SX + 70, 304], [SX + 62, 304], [SX + 13, SY + 20], [SX - 13, SY + 20], [SX - 62, 304], [SX - 70, 304]], mix(D.n7, D.cream, 0.3));
        R(g, SX - 72, 304, 144, 7, mix(D.n5, D.steel[2], 0.3)); R(g, SX - 72, 304, 144, 1, mix(D.n7, D.cream, 0.4));
        const bl = tri(mix(D.steel[1], D.teal[1], 0.35), 0.25, 0.42);
        poly(g, [[SX - 13, SY + 15 - br * 0.5], [SX + 13, SY + 15 - br * 0.5], [SX + 52, 296], [SX - 52, 296]], bl[1]);
        poly(g, [[SX - 13, SY + 15 - br * 0.5], [SX - 8, SY + 15 - br * 0.5], [SX - 31, 296], [SX - 52, 296]], bl[0]);
        poly(g, [[SX + 9, SY + 15 - br * 0.5], [SX + 13, SY + 15 - br * 0.5], [SX + 52, 296], [SX + 37, 296]], bl[2]);
        // the body under the blanket: hips, a valley between the legs, the left leg catching the light
        poly(g, [[SX - 3, 214], [SX + 3, 214], [SX + 6, 298], [SX - 6, 298]], mix(bl[1], bl[2], 0.45));
        poly(g, [[SX - 22, 222], [SX - 6, 222], [SX - 10, 292], [SX - 34, 292]], mix(bl[1], bl[0], 0.45));
        ell(g, SX, 208, 26, 6, mix(bl[1], bl[0], 0.25)); PX.line(g, SX - 24, 212, SX + 24, 212, mix(bl[1], bl[2], 0.3));
        PX.line(g, SX - 13, SY + 15, SX - 30, 296, bl[2]); PX.line(g, SX + 13, SY + 15, SX + 30, 296, bl[2]);
        for (let k = 0; k < 3; k++) { const y = SY + 22 + k * 9; PX.line(g, SX - 12 - k * 3, y, SX + 12 + k * 3, y + 1, mix(bl[1], bl[2], 0.3)); }
        // the arms resting on top, along the sides
        seg(g, SX - 16, SY + 22, SX - 40, 258, 5, mix(D.teal[0], D.n5, 0.35)); seg(g, SX + 16, SY + 22, SX + 40, 258, 5, mix(D.teal[0], D.n6, 0.25));
        for (const s of [-1, 1]) { ell(g, SX + s * 14, 250, 11, 6, bl[1]); ell(g, SX + s * 14 - 2, 248, 7, 3, bl[0]); }           // knees
        for (const s of [-1, 1]) { ell(g, SX + s * 18, 288, 13, 10, bl[1]); ell(g, SX + s * 18 - 3, 284, 8, 5, bl[0]); }           // feet
        PX.line(g, SX, 282, SX, 298, bl[2]);
        ell(g, SX - 42, 262, 5, 4, mix(D.rose[0], D.lampD, 0.4)); R(g, SX - 45, 260, 3, 1, mix(D.rose[0], D.cream, 0.4)); ell(g, SX + 42, 262, 5, 4, mix(D.rose[0], D.lampD, 0.5));
      });
      // ---- operator's monitor on a cart + technician (right) ----
      PX.par(g, c, 1.0, () => {
        const MX = 410, MY = 180, MW = 112, MH = 80;
        A(g, 0.3, () => ell(g, MX + MW / 2, 334, 34, 4, BLK));
        R(g, MX + MW / 2 - 2, MY + MH, 4, 326 - MY - MH, D.n4); R(g, MX + MW / 2 - 1, MY + MH, 1, 326 - MY - MH, D.n6);
        R(g, MX + 20, 326, MW - 40, 4, D.n3); for (const wx of [MX + 22, MX + MW - 26]) PX.circle(g, wx, 332, 3, D.n2);
        R(g, MX + 16, MY + MH + 18, MW - 10, 5, mix(D.n5, D.steel[2], 0.3)); R(g, MX + 16, MY + MH + 18, MW - 10, 1, mix(D.n6, D.cream, 0.3));      // keyboard tray
        for (let k = 0; k < 10; k++) R(g, MX + 20 + k * 9, MY + MH + 19, 7, 2, mix(D.n4, D.steel[2], 0.3));
        A(g, 0.3, () => R(g, MX + 4, MY + 5, MW, MH, BLK));
        R(g, MX - 3, MY - 3, MW + 6, MH + 6, mix(D.n2, D.steel[2], 0.3)); R(g, MX - 3, MY - 3, MW + 6, 1, mix(D.n5, D.steel[0], 0.3));
        R(g, MX, MY, MW, MH, mix(D.n0, D.steel[2], 0.25));
        R(g, MX + 3, MY + 3, MW - 6, 4, mix(D.n2, D.steel[2], 0.4)); R(g, MX + 5, MY + 4, 20, 2, mix(D.steel[0], D.n5, 0.4)); R(g, MX + MW - 14, MY + 4, 8, 2, PX.blink(t, 1, 0.5) && bp > 0 && bp < 1 ? D.rust[1] : mix(D.n4, D.steel[2], 0.4));
        for (let k = 0; k < 6; k++) R(g, MX + MW - 12, MY + 12 + k * 7, 8, 3, mix(D.n3, D.steel[2], 0.3 + (k % 2) * 0.1));
        const IX = MX + 6, IY = MY + 10;
        const G = [null, mix(D.n1, D.n2, 0.5), D.n7, mix(D.n5, D.n4, 0.4), mix(D.n5, D.n6, 0.4), D.n6, mix(D.n6, D.n7, 0.4), mix(D.n3, D.n2, 0.4), mix(D.cream, D.n7, 0.4)];
        const rows = Math.floor(bp * SH);
        for (let j = 0; j < rows; j++) { let run = null, rx = 0;
          for (let i = 0; i <= SW; i++) { const col = i < SW ? G[MASK[j * SW + i]] : null; if (col !== run) { if (run) R(g, IX + rx, IY + j, i - rx, 1, run); run = col; rx = i; } } }
        if (bp > 0 && bp < 1) { R(g, IX, IY + rows, SW, 1, mix(D.teal[0], D.cream, 0.4)); A(g, 0.35, () => R(g, IX, IY + rows + 1, SW, 2, D.teal[1])); }
        R(g, MX + 6, MY + MH - 6, MW - 22, 2, mix(D.n2, D.steel[2], 0.4)); R(g, MX + 6, MY + MH - 6, Math.round((MW - 22) * bp), 2, mix(D.teal[0], D.n6, 0.3));
        PX.glow(g, MX + MW / 2, MY + MH / 2, 70, D.steel[0], 0.1 + 0.08 * bp);
        // technician: scrubs, standing at the cart; hand on the keyboard, then points at the finished slice
        const pt = E((t - tB - 3.4 * d / 6 + 0.2) / 0.6, "io");
        const hand = [lerp(MX + MW - 4, MX + MW + 2, pt), lerp(MY + MH + 18, MY + MH / 2 + 28, pt) + Math.round(Math.sin(t * 2.2) * (1 - pt))];
        sideP(g, 540, 334, { pal: TECH, dir: -1, h: 104, t, ph: 1.2, lean: 2 + pt, reachN: hand, armF: [-6, -4],
          head: { dx: 0, dy: bp > 0.05 && bp < 1 ? 1 : 0, f: { eye: "open", mouth: bp >= 1 ? "smile" : "flat", brow: bp >= 1 ? 1 : 0 } } });
        A(g, 0.3, () => ell(g, 542, 335, 18, 3, BLK));
      });
      PX.vignette(g, 0.45);
    };
  };

  // =====================================================================================================
  // particles: a quiet physics lab at night. An old blackboard (chalk scribbles only), moonlight through a tall
  // window, and on the bench under a magnifier a small glass dish holding a soft glowing cloud of tiny particles that
  // drift and flicker; the lens shows them enlarged. o.zoom (2.0, false = never): the view leans in to the lens.
  K.particles = (o) => {
    const PT = []; { const r = PX.rnd(1905); for (let i = 0; i < 70; i++) PT.push({ rx: 4 + r() * 18, ry: 2 + r() * 5, w: (0.3 + r() * 0.9) * (r() < 0.5 ? -1 : 1), ph: r() * TAU, bob: r() * TAU, k: r(), f: 2 + r() * 5 }); }
    const CHALK = []; { const r = PX.rnd(1897);
      for (let l = 0; l < 5; l++) { let x = 62, y = 70 + l * 18; const pts = [[x, y]]; while (x < 150 + (l % 2) * 30) { x += 2 + r() * 4; pts.push([x, y + (r() - 0.5) * 4]); } CHALK.push(pts); } }
    const pos = (p, t) => { const a = p.ph + t * p.w; return [Math.cos(a) * p.rx + Math.sin(t * 0.7 + p.bob) * 2, Math.sin(a) * p.ry - 3 + Math.sin(t * 1.3 + p.bob) * 2.5]; };
    const pcol = (p) => (p.k < 0.45 ? D.amber[0] : p.k < 0.8 ? D.cream : D.teal[0]);
    return (g, t, d, c) => {
      t = Math.max(0, t);
      R(g, -40, -40, 720, 440, D.n1);
      const T = tm(o, d, 6), tZ = o.zoom === false ? 1e9 : T("zoom", 2.0);
      const DX = 330, DY = 270, LX = 330, LY = 226, LR = 36;
      const c0 = { x: c.x, y: c.y, z: c.z };
      const zp = E((t - tZ) / Math.max(0.6, 1.6 * d / 6), "io");
      if (zp > 0) { c.z *= lerp(1, 1.55, zp); c.x = lerp(c.x, LX, zp); c.y = lerp(c.y, LY + 14, zp);
        c.x = clamp(c.x, 320 / c.z, 640 - 320 / c.z); c.y = clamp(c.y, 180 / c.z, 360 - 180 / c.z); }
      const glowK = 0.85 + 0.15 * Math.sin(t * 2.3) * Math.sin(t * 0.9 + 1);
      // ---- far: night sky + moon through the tall window ----
      PX.par(g, c0, 0.35, () => {
        PX.vgrad(g, 440, 0, 220, 240, mix(D.n1, D.steel[2], 0.4), mix(D.n2, D.steel[2], 0.55), 6);
        PX.circle(g, 540, 64, 13, mix(D.cream, D.steel[0], 0.25)); PX.circle(g, 544, 61, 11, mix(D.cream, D.steel[0], 0.12)); PX.glow(g, 540, 64, 60, D.steel[0], 0.25);
        for (let i = 0; i < 3; i++) { const cx = 430 + ((i * 90 + t * 5) % 260), cy = 50 + i * 26; A(g, 0.5, () => { ell(g, cx, cy, 30, 5, mix(D.n4, D.steel[1], 0.3)); ell(g, cx + 12, cy - 3, 14, 4, mix(D.n5, D.steel[0], 0.25)); }); }
        R(g, 440, 150, 220, 90, mix(D.n1, D.steel[2], 0.3)); for (let i = 0; i < 8; i++) R(g, 450 + i * 26, 140 + (i * 7) % 18, 16, 100, mix(D.n1, D.n2, 0.5));
        for (let i = 0; i < 6; i++) if ((i * 7 + 3) % 5 < 3) R(g, 455 + i * 26, 160 + (i * 13) % 30, 2, 2, mix(D.lamp, D.n5, 0.5));
      });
      // ---- the lab wall: blackboard, shelves of glassware, window frame ----
      PX.par(g, c0, 0.75, () => {
        const wl = mix(D.n2, D.steel[2], 0.22);
        g.save(); g.beginPath(); g.rect(-40, -40, 720, 300); g.rect(470, 26, 130, 196); g.clip("evenodd"); R(g, -40, -40, 720, 300, wl);
        for (let y = -36; y < 250; y += 12) R(g, -40, y, 720, 1, mix(wl, D.n1, 0.25));
        g.restore();
        // moonlight shaft from the window onto the bench
        A(g, 0.1, () => poly(g, [[470, 26], [600, 26], [420, 300], [250, 300]], D.steel[0]));
        const wf = mix(D.n3, D.steel[2], 0.3);
        R(g, 466, 22, 138, 4, wf); R(g, 466, 22, 4, 204, wf); R(g, 600, 22, 4, 204, wf); R(g, 533, 26, 3, 196, wf); for (const y of [90, 156]) R(g, 470, y, 130, 3, wf); R(g, 462, 222, 146, 5, mix(D.n4, D.steel[2], 0.3));
        // blackboard with chalk scribbles (no real maths, no digits)
        const bw = wood(0.45);
        R(g, 34, 44, 272, 132, bw[1]); R(g, 34, 44, 272, 2, bw[0]); R(g, 40, 50, 260, 120, mix(D.moss[2], D.n1, 0.62)); R(g, 30, 174, 280, 5, bw[1]); R(g, 30, 174, 280, 1, bw[0]);
        A(g, 0.12, () => { for (let i = 0; i < 6; i++) R(g, 50 + i * 40, 60 + (i % 3) * 30, 34, 10, D.n7); });
        const ch = mix(D.cream, D.n7, 0.35);
        for (const pts of CHALK) for (let i = 1; i < pts.length; i++) if (hash(i, pts[0][1]) > 0.18) PX.line(g, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], ch);
        ring(g, 236, 106, 34, 34, ch, 0, TAU, [4, 2]); ring(g, 236, 106, 20, 9, ch); ring(g, 236, 106, 9, 22, ch); PX.circle(g, 236, 106, 2, ch);
        for (let k = 0; k < 8; k++) { const a = k * 0.8; R(g, 236 + Math.cos(a) * 46, 106 + Math.sin(a) * 40, 1, 1, ch); }
        PX.line(g, 196, 150, 280, 150, ch); PX.line(g, 276, 147, 280, 150, ch); PX.line(g, 276, 153, 280, 150, ch);
        R(g, 80, 172, 12, 2, D.cream); R(g, 110, 172, 7, 2, mix(D.cream, D.amber[0], 0.3)); R(g, 250, 171, 18, 3, mix(D.n5, D.paperD, 0.3));
        // shelf of glassware glinting in the moonlight
        R(g, 330, 112, 120, 3, bw[1]); R(g, 330, 112, 120, 1, bw[0]);
        for (const [x, w, h] of [[336, 10, 22], [352, 14, 16], [372, 8, 26], [386, 16, 12], [408, 10, 20], [424, 14, 18]]) {
          A(g, 0.55, () => R(g, x, 112 - h, w, h, mix(D.glass, D.n3, 0.55))); R(g, x, 112 - h, 1, h, mix(D.glass, D.steel[0], 0.4)); R(g, x + w - 2, 112 - h + 3, 1, h - 5, mix(D.cream, D.glass, 0.4));
        }
        R(g, 330, 160, 120, 3, bw[1]); for (let i = 0; i < 9; i++) R(g, 334 + i * 12, 136, 10, 24, mix([D.rust[2], D.steel[2], D.moss[2], D.paperD][i % 4], D.n1, 0.4));
      });
      // ---- the bench: top in perspective, equipment, the dish + particle cloud, the magnifier ----
      PX.par(g, c0, 1.0, () => {
        const top = mix(D.n2, D.n1, 0.4), topL = mix(D.n3, D.steel[2], 0.3);
        poly(g, [[-40, 244], [680, 244], [680, 304], [-40, 304]], top);
        for (let i = 0; i < 4; i++) R(g, -40, 250 + i * i * 4, 720, 1, mix(top, D.n4, 0.15));
        R(g, -40, 244, 720, 1, topL); R(g, -40, 304, 720, 4, topL); R(g, -40, 308, 720, 60, mix(D.n1, wood(0.5)[2], 0.5));
        for (let x = 20; x < 680; x += 160) { R(g, x, 312, 120, 44, mix(D.n1, wood(0.5)[2], 0.35)); R(g, x + 56, 330, 8, 2, D.n4); }
        A(g, 0.1, () => poly(g, [[250, 244], [420, 244], [400, 304], [210, 304]], D.steel[0]));
        // the particles' glow lighting the bench
        PX.glow(g, DX, DY - 4, 70 * glowK, D.amber[1], 0.22); A(g, 0.12 * glowK, () => ell(g, DX, DY + 4, 54, 9, D.lamp));
        // an old oscilloscope (left): calm trace, knobs
        const OX = 70, OY = 198;
        A(g, 0.35, () => R(g, OX + 4, OY + 50, 92, 6, BLK));
        R(g, OX, OY, 92, 52, mix(D.n3, D.paperD, 0.25)); R(g, OX, OY, 92, 1, mix(D.n5, D.paperD, 0.3)); R(g, OX + 86, OY, 6, 52, mix(D.n2, D.paperD, 0.2));
        R(g, OX + 6, OY + 6, 50, 38, mix(D.n0, D.teal[2], 0.35));
        for (let i = 0; i < 5; i++) { R(g, OX + 6 + i * 12, OY + 6, 1, 38, mix(D.n1, D.teal[2], 0.45)); } for (let j = 0; j < 4; j++) R(g, OX + 6, OY + 6 + j * 12, 50, 1, mix(D.n1, D.teal[2], 0.45));
        let py = null; for (let i = 0; i < 50; i++) { const y = OY + 25 + Math.round(Math.sin(i * 0.38 - t * 5) * 8 * Math.exp(-((i - 25) ** 2) / 400)); if (py !== null) PX.line(g, OX + 5 + i, py, OX + 6 + i, y, D.teal[0]); py = y; }
        PX.glow(g, OX + 31, OY + 25, 30, D.teal[1], 0.15);
        for (let k = 0; k < 3; k++) { PX.circle(g, OX + 66, OY + 12 + k * 13, 4, D.n1); R(g, OX + 66, OY + 9 + k * 13, 1, 3, D.n6); } R(g, OX + 76, OY + 8, 4, 3, PX.blink(t, 1.3, 0.5) ? D.rust[1] : D.n2);
        // books + a notebook, a dark desk lamp, a coil of wire (right)
        R(g, 470, 226, 60, 8, mix(D.rust[2], D.n2, 0.3)); R(g, 474, 218, 52, 8, mix(D.steel[2], D.n2, 0.3)); R(g, 470, 226, 60, 1, mix(D.rust[1], D.n3, 0.3));
        R(g, 540, 238, 46, 10, mix(D.paper, D.n4, 0.4)); R(g, 540, 238, 46, 1, mix(D.paper, D.n5, 0.2));
        for (let k = 0; k < 4; k++) ring(g, 600, 250 - k * 2, 14, 5, mix(D.amber[2], D.rust[2], 0.4));
        // the dish: a small glass petri dish, the cloud inside
        ell(g, DX, DY + 3, 30, 8, mix(D.n1, D.n0, 0.5));
        A(g, 0.55, () => ell(g, DX, DY, 28, 7, mix(D.glass, D.n3, 0.6)));
        clip(g, DX - 30, DY - 30, 60, 38, () => {
          for (const p of PT) { const [x, y] = pos(p, t), fl = 0.45 + 0.55 * Math.abs(Math.sin(t * p.f + p.ph)); A(g, fl, () => R(g, DX + x, DY + y, 1, 1, pcol(p))); }
        });
        PX.glow(g, DX, DY - 3, 22 * glowK, D.amber[0], 0.3);
        ring(g, DX, DY, 28, 7, mix(D.glass, D.cream, 0.3), Math.PI, TAU); ring(g, DX, DY + 1, 28, 7, mix(D.glass, D.n4, 0.3), 0, Math.PI);
        R(g, DX - 18, DY - 6, 6, 1, D.cream);
        // the magnifier: weighted base, articulated arm, brass ring with the enlarged cloud inside the lens
        const brass = tri(mix(D.amber[2], D.paperD, 0.3), 0.3, 0.45);
        A(g, 0.35, () => ell(g, 432, 300, 26, 4, BLK));
        R(g, 412, 288, 40, 12, D.n2); R(g, 412, 288, 40, 1, D.n4); R(g, 428, 270, 6, 18, D.n3);
        seg(g, 431, 272, 452, 168, 4, D.n3); PX.circle(g, 452, 168, 4, D.n4); seg(g, 452, 168, LX + LR - 2, LY - 6, 4, D.n3); PX.circle(g, LX + LR - 2, LY - 6, 3, D.n4);
        PX.line(g, 433, 272, 454, 168, D.n5);
        clip(g, LX - LR, LY - LR, LR * 2, LR * 2, () => {
          g.save(); g.beginPath(); g.ellipse(LX, LY, LR - 3, LR - 5, 0, 0, TAU); g.clip();
          R(g, LX - LR, LY - LR, LR * 2, LR * 2, mix(D.n1, D.amber[2], 0.15));
          PX.glow(g, LX, LY + 6, 40, D.amber[1], 0.3 * glowK);
          const M = 2.3, MY2 = LY + 10;
          ring(g, LX, MY2, 28 * M, 7 * M, mix(D.glass, D.cream, 0.25)); ring(g, LX, MY2 + 2, 28 * M, 7 * M, mix(D.glass, D.n4, 0.3));
          for (const p of PT) { const [x, y] = pos(p, t), fl = 0.4 + 0.6 * Math.abs(Math.sin(t * p.f + p.ph)), sz = p.k > 0.85 ? 3 : 2;
            A(g, fl, () => { R(g, LX + x * M - 1, MY2 + y * M - 1, sz, sz, pcol(p)); if (sz === 3) A(g, 0.35, () => R(g, LX + x * M - 2, MY2 + y * M - 2, 5, 5, pcol(p))); }); }
          A(g, 0.12, () => poly(g, [[LX - 30, LY - 30], [LX - 14, LY - 30], [LX - 34, LY + 10], [LX - 40, LY + 10]], D.cream));
          g.restore();
        });
        ring(g, LX, LY, LR - 1, LR - 3, brass[2]); ring(g, LX, LY, LR - 2, LR - 4, brass[1]); ring(g, LX, LY, LR - 3, LR - 5, brass[0], Math.PI * 0.95, Math.PI * 1.6); ring(g, LX, LY, LR, LR - 2, mix(brass[2], D.n0, 0.3));
        R(g, LX - LR - 6, LY - 1, 7, 3, brass[2]); R(g, LX - LR - 10, LY - 2, 5, 5, D.n2);
      });
      // ---- foreground: stool back + cable, out of focus ----
      PX.par(g, c0, 1.2, () => {
        R(g, 560, 330, 100, 8, mix(D.n1, D.n2, 0.4)); R(g, 590, 338, 6, 40, D.n1); R(g, 640, 338, 6, 40, D.n1);
        A(g, 0.8, () => { for (let i = 0; i < 40; i++) R(g, i * 6 - 20, 352 + Math.round(Math.sin(i * 0.5) * 3), 6, 3, mix(D.n0, D.n2, 0.5)); });
      });
      // dust in the moonlight
      clipPoly(g, [[470, 26], [600, 26], [420, 300], [250, 300]], () => dust(g, 17, 26, t, [240, 20, 380, 290], D.steel[0], 0.4));
      PX.vignette(g, 0.6);
    };
  };

  // =====================================================================================================
  // wall_frame: a cosy study at golden hour. o.hang (1.0): the person lifts a small framed card onto the nail; it shows
  // e^(i pi) + 1 = 0 in neat print. They step back, look up at it and smile. o.push (default on): the camera eases in
  // on the frame while they admire it.
  K.wall_frame = (o) => {
    const PAL = { skin: SK.warm, hair: HR.brown, top: tri(mix(D.moss[2], D.n3, 0.35), 0.22, 0.42), top2: mix(D.moss[2], D.n1, 0.35), collar: D.cream, pants: tri(mix(D.n3, D.steel[2], 0.3), 0.2, 0.4), shoe: mix(D.n1, D.rust[2], 0.25), glasses: true };
    const WD = wood(0.25), WL = mix(mix(D.paper, D.moss[1], 0.22), D.n4, 0.42), WLd = mix(WL, D.n1, 0.25);
    const FR = { x: 362, y: 146, w: 72, h: 50 }, NAIL = [FR.x + FR.w / 2, FR.y - 9];
    const BOOKS = []; { const r = PX.rnd(271), cols = [D.rust[2], D.moss[2], D.steel[2], D.paperD, D.amber[2], D.teal[2], D.rose[2], D.n4];
      for (let sh = 0; sh < 4; sh++) { let x = 0; while (x < 92) { const w = 4 + Math.floor(r() * 5), h = 20 + Math.floor(r() * 9); if (r() < 0.1 && x > 4) { x += 6; continue; }
        BOOKS.push({ sh, x, w, h, c: mix(cols[Math.floor(r() * cols.length)], D.n2, 0.25 + r() * 0.25), lean: r() < 0.08 }); x += w; } } }
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 5), tH = T("hang", 1.0), sc = d / 5;
      // timeline: lift (0.9 s) -> settle -> hands down -> two steps back -> admire
      const tLift = tH, tSet = tH + 0.9 * sc, tFree = tSet + 0.35 * sc, tBack0 = tFree + 0.25 * sc, tBack1 = tBack0 + 1.0 * sc, tAdm = tBack1 + 0.15 * sc;
      const c0 = { x: c.x, y: c.y, z: c.z };
      if (o.push !== false) { const p = E((t - tBack0) / Math.max(0.8, 2.2 * sc), "io"); if (p > 0) {
        c.z *= lerp(1, 1.22, p); c.x = lerp(c.x, 352, p); c.y = lerp(c.y, 186, p);
        c.x = clamp(c.x, 320 / c.z, 640 - 320 / c.z); c.y = clamp(c.y, 180 / c.z, 360 - 180 / c.z); } }

      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: the view through the window ----
      PX.par(g, c0, 0.35, () => {
        PX.vgrad(g, -30, -10, 270, 280, mix(D.steel[0], D.n5, 0.35), mix(D.lamp, D.paper, 0.35), 7);
        ell(g, 150, 168, 30, 14, mix(D.lamp, D.cream, 0.4)); PX.glow(g, 150, 168, 70, D.lamp, 0.25);
        const roof = mix(D.n4, D.plum[2], 0.25), roofL = mix(D.n5, D.lampD, 0.3);
        poly(g, [[20, 190], [60, 162], [100, 190]], roof); R(g, 30, 190, 62, 40, roof); R(g, 44, 196, 8, 9, mix(D.lamp, D.amber[1], 0.4)); R(g, 66, 196, 8, 9, mix(D.n3, D.lampD, 0.3));
        poly(g, [[96, 194], [128, 170], [170, 194]], roofL); R(g, 104, 194, 60, 40, mix(roof, D.n3, 0.3));
        for (const [tx, ty, r] of [[170, 150, 16], [184, 162, 13], [160, 170, 12]]) { ell(g, tx, ty, r, r * 0.9, mix(D.moss[2], D.n2, 0.35)); ell(g, tx - 3, ty - 4, r * 0.6, r * 0.5, mix(D.moss[1], D.lampD, 0.35)); }
        for (let i = 0; i < 3; i++) { const bx = 40 + ((t * 7 + i * 31) % 150), by = 80 + i * 9 + Math.sin(t * 2 + i) * 2; R(g, bx, by, 2, 1, D.n4); R(g, bx + (PX.blink(t + i * 0.3, 0.5) ? -1 : 2), by - 1, 1, 1, D.n4); }
      });
      // ---- room wall ----
      PX.par(g, c0, 0.85, () => {
        // wallpaper with a soft stripe + diamond motif
        g.save(); g.beginPath(); g.rect(-40, -40, 720, 302); g.rect(20, 40, 170, 180); g.clip("evenodd");
        R(g, -40, -40, 720, 302, WL);
        for (let x = -36; x < 680; x += 14) { R(g, x, -40, 1, 302, mix(WL, D.n1, 0.1)); R(g, x + 7, -40, 1, 302, mix(WL, D.cream, 0.05)); }
        for (let y = 10; y < 210; y += 16) for (let x = -32 + ((y / 16) % 2) * 7; x < 680; x += 14) R(g, x, y, 1, 1, mix(WL, D.paper, 0.22));
        g.restore();
        A(g, 0.08, () => { poly(g, [[34, 44], [60, 44], [40, 126], [22, 126]], D.cream); poly(g, [[120, 134], [150, 134], [128, 218], [108, 218]], D.cream); });
        // picture rail + cornice
        R(g, -40, -40, 720, 26, mix(D.paper, D.n4, 0.5)); R(g, -40, -14, 720, 2, mix(D.cream, D.n5, 0.3)); R(g, -40, -12, 720, 1, WLd);
        R(g, -40, 34, 720, 3, WD[1]); R(g, -40, 34, 720, 1, WD[0]); R(g, -40, 37, 720, 1, mix(WL, D.n0, 0.3));
        // wainscot panels
        R(g, -40, 206, 720, 56, WD[2]); R(g, -40, 206, 720, 3, WD[1]); R(g, -40, 206, 720, 1, WD[0]);
        for (let x = -30; x < 680; x += 42) { R(g, x, 214, 34, 40, mix(WD[2], D.n1, 0.18)); R(g, x, 214, 34, 1, mix(WD[2], D.n0, 0.3)); R(g, x, 253, 34, 1, WD[1]); }
        R(g, -40, 258, 720, 4, mix(WD[2], D.n0, 0.3));
        // window frame + sill + curtains
        R(g, 14, 34, 182, 6, WD[1]); R(g, 16, 40, 4, 182, WD[1]); R(g, 190, 40, 4, 182, WD[1]); R(g, 103, 40, 3, 182, WD[1]); R(g, 18, 128, 174, 3, WD[1]);
        R(g, 16, 40, 1, 182, WD[0]); R(g, 103, 40, 1, 182, WD[0]); R(g, 18, 128, 174, 1, WD[0]);
        R(g, 8, 220, 196, 6, D.paper); R(g, 8, 220, 196, 1, D.cream); R(g, 8, 226, 196, 2, D.paperD);
        const cur = tri(mix(D.rust[2], D.paperD, 0.35), 0.2, 0.4), sway = Math.sin(t * 0.9) * 1.5;
        for (const [cx0, s] of [[-4, 1], [198, -1]]) {
          poly(g, [[cx0, 26], [cx0 + 26 * s, 26], [cx0 + (22 + sway) * s, 232], [cx0, 232]].map(([a, b]) => [a, b]), cur[1]);
          for (let f = 1; f < 4; f++) PX.line(g, cx0 + f * 6 * s, 30, cx0 + (f * 5.5 + sway * f / 4) * s, 230, f % 2 ? cur[2] : cur[0]);
        }
        R(g, -6, 24, 218, 3, mix(D.n2, D.amber[2], 0.3)); R(g, -6, 24, 218, 1, mix(D.amber[1], D.n4, 0.3));
        // desk under the window: lamp, books, mug
        R(g, 22, 226, 176, 8, WD[1]); R(g, 22, 226, 176, 1, WD[0]); R(g, 26, 234, 6, 28, WD[2]); R(g, 188, 234, 6, 28, WD[2]); R(g, 120, 234, 68, 18, mix(WD[2], D.n1, 0.2)); R(g, 150, 241, 8, 2, D.amber[2]);
        for (let i = 0; i < 4; i++) R(g, 40 + i * 2, 226 - 14 + i, 2, 14 - i, [D.steel[2], D.rust[2], D.moss[2], D.paperD][i]);
        R(g, 52, 222, 28, 4, D.paper); R(g, 54, 221, 24, 1, D.cream);
        R(g, 92, 218, 7, 8, mix(D.teal[1], D.n3, 0.3)); R(g, 99, 220, 2, 4, mix(D.teal[1], D.n3, 0.3)); R(g, 92, 218, 7, 1, mix(D.teal[0], D.n5, 0.2));
        for (let i = 0; i < 2; i++) { const k2 = frac(t * 0.35 + i * 0.5); A(g, (1 - k2) * 0.35, () => R(g, 95 + Math.sin(k2 * 7 + i) * 2, 216 - k2 * 16, 1, 2, D.cream)); }
        // desk lamp (lit)
        R(g, 136, 222, 16, 4, D.n2); seg(g, 144, 222, 134, 200, 2, D.n3); seg(g, 134, 200, 146, 186, 2, D.n3);
        poly(g, [[139, 182], [155, 182], [160, 194], [134, 194]], mix(D.moss[2], D.n2, 0.3)); R(g, 136, 194, 22, 1, D.lamp);
        A(g, 0.12, () => poly(g, [[136, 195], [158, 195], [172, 226], [122, 226]], D.lamp)); PX.glow(g, 147, 200, 30, D.lamp, 0.15);
        // a second, small framed landscape + a wall sconce
        R(g, 238, 112, 46, 34, WD[2]); R(g, 241, 115, 40, 28, mix(D.paper, D.lamp, 0.25));
        PX.vgrad(g, 241, 115, 40, 16, mix(D.steel[0], D.cream, 0.4), mix(D.lamp, D.paper, 0.4), 4);
        poly(g, [[241, 134], [256, 124], [270, 132], [281, 127], [281, 143], [241, 143]], mix(D.moss[1], D.n4, 0.3)); poly(g, [[241, 138], [281, 136], [281, 143], [241, 143]], mix(D.moss[2], D.n3, 0.2));
        PX.line(g, 261, 104, 248, 112, D.n3); PX.line(g, 261, 104, 274, 112, D.n3); R(g, 260, 103, 2, 2, D.n6);
        // the empty nail (the hero frame goes here)
        R(g, NAIL[0], NAIL[1], 2, 2, D.n6); R(g, NAIL[0], NAIL[1], 1, 1, D.cream); A(g, 0.3, () => R(g, NAIL[0] + 1, NAIL[1] + 2, 2, 1, BLK));
        // bookshelf (right)
        const SX = 516, SY = 40;
        R(g, SX - 4, SY - 4, 108, 222, WD[2]); R(g, SX - 4, SY - 4, 108, 2, WD[0]); R(g, SX, SY, 100, 214, mix(WD[2], D.n0, 0.35));
        for (let sh = 0; sh < 4; sh++) {
          const by = SY + 4 + sh * 52 + 46;
          for (const b of BOOKS) if (b.sh === sh) {
            if (b.lean) { poly(g, [[SX + 4 + b.x, by], [SX + 4 + b.x + b.w, by], [SX + 4 + b.x + b.w + 6, by - b.h + 2], [SX + 4 + b.x + 6 - 0, by - b.h + 1]], b.c); continue; }
            R(g, SX + 4 + b.x, by - b.h, b.w, b.h, b.c); R(g, SX + 4 + b.x, by - b.h, 1, b.h, mix(b.c, D.cream, 0.18)); R(g, SX + 4 + b.x, by - b.h + 4, b.w, 1, mix(b.c, D.amber[0], 0.3)); R(g, SX + 4 + b.x + b.w - 1, by - b.h, 1, b.h, mix(b.c, D.n0, 0.3));
          }
          R(g, SX, by, 100, 4, WD[1]); R(g, SX, by, 100, 1, WD[0]);
        }
        // plant on top of the shelf
        R(g, SX + 70, SY - 18, 14, 14, mix(D.rust[2], D.paperD, 0.3)); R(g, SX + 70, SY - 18, 14, 2, mix(D.rust[1], D.paper, 0.3));
        for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.36 + Math.sin(t * 0.8 + i) * 0.04; seg(g, SX + 77, SY - 18, SX + 77 + Math.cos(a) * 20, SY - 18 + Math.sin(a) * 18, 3, i % 2 ? mix(D.moss[1], D.n4, 0.2) : mix(D.moss[2], D.n3, 0.2)); }
        // standing lamp between frame and shelf (lit)
        R(g, 474, 256, 18, 4, D.n2); R(g, 482, 96, 2, 160, D.n3); R(g, 482, 96, 1, 160, D.n5);
        poly(g, [[470, 76], [496, 76], [502, 98], [464, 98]], mix(D.paper, D.lamp, 0.5)); R(g, 466, 97, 34, 1, mix(D.lampD, D.n3, 0.3));
        for (let i = 0; i < 4; i++) PX.line(g, 474 + i * 6, 77, 470 + i * 8, 97, mix(D.paper, D.lampD, 0.3));
        A(g, 0.14, () => poly(g, [[466, 98], [500, 98], [530, 206], [436, 206]], D.lamp));
        PX.glow(g, 483, 88, 60, D.lamp, 0.18);
      });
      // ---- floor ----
      PX.par(g, c0, 0.95, () => {
        R(g, -40, 262, 720, 140, WD[2]);
        for (let i = -14; i <= 14; i++) PX.line(g, 320 + i * 30, 262, 320 + i * 62, 400, mix(WD[2], D.n0, 0.3));
        for (const [yy, s] of [[270, 1], [284, 2], [303, 3], [330, 4]]) for (let i = -12; i <= 12; i += 2) { const xx = 320 + (i + (s % 2)) * (30 + s * 8); R(g, xx, yy, 1, 4 + s, mix(WD[2], D.n0, 0.35)); }
        R(g, -40, 262, 720, 1, mix(WD[2], D.n0, 0.5));
        // rug
        poly(g, [[228, 288], [520, 288], [570, 352], [178, 352]], mix(D.rust[2], D.n2, 0.3));
        poly(g, [[236, 292], [512, 292], [556, 347], [192, 347]], mix(D.rust[2], D.paperD, 0.15));
        poly(g, [[246, 297], [502, 297], [540, 342], [208, 342]], mix(D.rust[2], D.n2, 0.15));
        for (let i = 0; i < 9; i++) { const u = 0.1 + i * 0.1; R(g, lerp(250, 206, 0.5) + u * 300, 318, 3, 3, mix(D.amber[2], D.paperD, 0.3)); }
        // window light on the floor
        A(g, 0.1, () => poly(g, [[18, 262], [192, 262], [300, 360], [60, 360]], D.lamp));
        A(g, 0.06, () => poly(g, [[60, 262], [150, 262], [230, 360], [110, 360]], D.cream));
      });
      // ---- the person + the frame ----
      PX.par(g, c0, 1.0, () => {
        // walk: stands at x 356 while hanging, then two steps back to 292
        const bp = clamp((t - tBack0) / (tBack1 - tBack0), 0, 1), px2 = lerp(350, 290, E(bp, "io")), walking = bp > 0 && bp < 1;
        const ph = bp * TAU * 2, sw = walking ? Math.sin(ph) : 0;
        const FY = 304;
        shadow(g, px2 + 2, FY + 1, 16, 3, 0.3);
        // frame position: carried at chest -> lifted onto the nail
        const lift = E((t - tLift) / (tSet - tLift), "io"), settle = t > tSet ? Math.round(Math.max(0, 1 - (t - tSet) / 0.12)) : 0;
        const hold = { x: 368, y: 216 };
        const fx = Math.round(lerp(hold.x, FR.x, lift)), fy = Math.round(lerp(hold.y, FR.y - 1, lift)) + (t > tSet ? 1 - settle : 0);
        const onWall = t >= tSet;
        // hanging wire behind the frame once it is on the nail
        if (onWall) { PX.line(g, NAIL[0], NAIL[1] + 1, fx + 10, fy + 4, D.n5); PX.line(g, NAIL[0] + 1, NAIL[1] + 1, fx + FR.w - 10, fy + 4, D.n5); }
        const frame = () => {
          shadow(g, fx + FR.w / 2 + 3, fy + FR.h / 2 + 3, FR.w / 2 + 2, FR.h / 2 + 1, onWall ? 0.28 : 0);
          if (onWall) A(g, 0.3, () => R(g, fx + 3, fy + 3, FR.w, FR.h, BLK));
          const fw = wood(0.05, mix(D.amber[2], D.rust[2], 0.3));
          R(g, fx, fy, FR.w, FR.h, fw[1]); R(g, fx, fy, FR.w, 1, fw[0]); R(g, fx, fy, 1, FR.h, fw[0]); R(g, fx, fy + FR.h - 1, FR.w, 1, fw[2]); R(g, fx + FR.w - 1, fy, 1, FR.h, fw[2]);
          R(g, fx + 3, fy + 3, FR.w - 6, FR.h - 6, fw[2]); R(g, fx + 4, fy + 4, FR.w - 8, FR.h - 8, mix(D.cream, D.paper, 0.15));      // mat
          R(g, fx + 8, fy + 8, FR.w - 16, FR.h - 16, D.cream); R(g, fx + 8, fy + 8, FR.w - 16, 1, mix(D.paper, D.n6, 0.2));
          const w = gw("eIp + 1 = 0", 1);
          glyphs(g, "eIp + 1 = 0", Math.round(fx + FR.w / 2 - w / 2), fy + Math.round(FR.h / 2 - 3), D.ink);
          R(g, fx + 20, fy + FR.h - 13, FR.w - 40, 1, mix(D.paperD, D.cream, 0.4));
          // glass glint sliding across once it is up
          const gl = P(t, tSet + 0.3 * sc, 1.2 * sc, "io");
          if (gl > 0 && gl < 1) clip(g, fx + 4, fy + 4, FR.w - 8, FR.h - 8, () => A(g, 0.35, () => seg(g, fx - 10 + gl * (FR.w + 30), fy, fx - 26 + gl * (FR.w + 30), fy + FR.h, 4, D.cream)));
          A(g, 0.12, () => poly(g, [[fx + 6, fy + 5], [fx + 16, fy + 5], [fx + 8, fy + 20], [fx + 6, fy + 20]], D.cream));
        };
        if (onWall) frame();
        // pose
        let reachN, reachF, head, armN = null, armF = null, f;
        if (!onWall || t < tFree) {
          const hy = lerp(hold.y + 30, FR.y + FR.h - 4, lift);
          reachN = [fx + 6, Math.round(hy)]; reachF = [fx + 14, Math.round(lerp(hold.y + 4, FR.y + 10, lift))];
          if (onWall) { const rel = E((t - tSet) / (tFree - tSet), "io"); reachN = [fx + 6 - rel * 8, reachN[1] + rel * 22]; reachF = [fx + 12 - rel * 10, reachF[1] + rel * 30]; }
          head = { dx: 1, dy: lift > 0.3 ? -1 : 0, f: { eye: lift > 0.3 ? "up" : "open", mouth: "flat", brow: lift > 0.5 ? 1 : 0 } };
        } else if (t < tAdm) {
          const p = E((t - tFree) / Math.max(0.1, tBack0 - tFree), "out");
          armN = [lerp(30, 4, p), lerp(-40, 6, p)]; armF = [lerp(30, -6, p), lerp(-30, 0, p)];
          head = { dx: 0, dy: 0, f: { eye: "up", mouth: "flat" } };
        } else {
          // admire: near hand on the hip, a slow satisfied nod, a smile that grows
          const a = E((t - tAdm) / 0.5, "out"), nod = Math.sin(clamp((t - tAdm - 0.6 * sc) / (0.9 * sc), 0, 1) * Math.PI) * 1.4;
          armN = [lerp(4, -16, a), lerp(6, -34, a)]; armF = [lerp(-6, -14, a), lerp(0, -30, a)];
          const big = t > tAdm + 0.5 * sc;
          head = { dx: 0, dy: Math.round(nod) - 1, f: { eye: big && Math.sin(t * 0.7) > -0.6 ? "happy" : "up", mouth: big ? "grin" : "smile", brow: 1 } };
        }
        sideP(g, px2, FY, { pal: PAL, t, ph: 0.3, h: 102, legN: [sw * 18, sw * 18 + Math.max(0, -Math.cos(ph)) * 18], legF: [-sw * 18, -sw * 18 + Math.max(0, Math.cos(ph)) * 18],
          reachN, reachF, armN, armF, lean: walking ? -1 : t < tSet && lift > 0 ? 2 : 0, head });
        if (!onWall) frame();
        // the person's soft shadow on the floor
      });
      // ---- foreground: armchair back + a fern (out of focus, dark) ----
      PX.par(g, c0, 1.18, () => {
        // a tall leafy house plant in a pot (lower right) and a side table edge (lower left), soft and dark
        const lv = [mix(D.moss[2], D.n1, 0.35), mix(D.moss[2], D.n2, 0.15), mix(D.moss[1], D.n3, 0.35)];
        R(g, 572, 322, 46, 44, mix(D.rust[2], D.n2, 0.3)); R(g, 568, 318, 54, 6, mix(D.rust[2], D.paperD, 0.2)); R(g, 568, 318, 54, 1, mix(D.paperD, D.lamp, 0.3)); R(g, 612, 324, 6, 42, mix(D.rust[2], D.n0, 0.4));
        const LEAF = [[-1.9, 70, 0], [-1.55, 92, 1], [-1.25, 80, 2], [-2.3, 56, 1], [-1.05, 58, 0], [-1.75, 46, 2], [-2.05, 84, 0], [-1.4, 40, 1]];
        LEAF.forEach(([a0, L, ci], i) => {
          const a = a0 + Math.sin(t * 0.6 + i * 1.3) * 0.025, bx = 595, by = 320, ex = bx + Math.cos(a) * L, ey = by + Math.sin(a) * L;
          PX.line(g, bx, by, ex, ey, lv[0]);
          const la = a + (i % 2 ? 0.5 : -0.5), cx2 = ex + Math.cos(la) * 9, cy2 = ey + Math.sin(la) * 9;
          const pts = []; for (let j = 0; j < 14; j++) { const u = (j / 14) * TAU, rr = j < 7 ? 1 : 1; pts.push([cx2 + Math.cos(la) * Math.cos(u) * 13 - Math.sin(la) * Math.sin(u) * 6 * rr, cy2 + Math.sin(la) * Math.cos(u) * 13 + Math.cos(la) * Math.sin(u) * 6 * rr]); }
          poly(g, pts, lv[ci === 2 ? 1 : ci]); PX.line(g, ex, ey, cx2 + Math.cos(la) * 11, cy2 + Math.sin(la) * 11, mix(lv[ci], D.n0, 0.3));
          if (ci === 2 || i === 1) PX.line(g, cx2 - Math.cos(la) * 8 - 1, cy2 - Math.sin(la) * 8 - 2, cx2 + Math.cos(la) * 6 - 1, cy2 + Math.sin(la) * 6 - 2, lv[2]);
        });
        const st = wood(0.45);
        R(g, -40, 318, 92, 6, st[0]); R(g, -40, 324, 92, 4, st[2]); R(g, 40, 328, 6, 40, st[2]);
        R(g, 6, 300, 16, 18, mix(D.paper, D.n4, 0.2)); R(g, 6, 300, 16, 2, D.paper); R(g, 22, 304, 4, 8, mix(D.paper, D.n4, 0.3));
        R(g, -20, 314, 26, 4, mix(D.steel[2], D.n2, 0.3)); R(g, -20, 310, 24, 4, mix(D.rust[2], D.n2, 0.3)); R(g, -20, 310, 24, 1, mix(D.rust[1], D.n3, 0.3));
      });
      // sun dust in the window light
      clipPoly(g, [[18, 40], [192, 40], [300, 360], [60, 360]], () => dust(g, 7, 30, t, [0, 30, 320, 330], D.lamp, 0.5));
      PX.vignette(g, 0.5);
    };
  };
})();
