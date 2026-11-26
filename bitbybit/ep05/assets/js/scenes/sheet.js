/* EP5 Builder B: collaborative filtering. big_sheet, twin_row, blind_clerk, strangers, sparse, no_twin.
   Documentary palette PX.D only; every shade derived with mix(). Cool nocturnal look, one warm accent: the YOU dot. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, A = PX.alpha, P = PX.p, clamp = PX.clamp, lerp = PX.lerp;

  // ---------- colour helpers ----------
  const H2 = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const X = H2(a), Y = H2(b); k = clamp(k, 0, 1); return "#" + X.map((v, i) => Math.round(v + (Y[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const dk = (c, k) => mix(c, D.n0, k);
  const lt = (c, k) => mix(c, D.cream, k);
  const SH = (a) => `rgba(0,0,0,${a})`;
  const label = (g, s, x, y, a, col, size, font) => { if (a <= 0) return; A(g, a, () => PX.otext(g, s, x, y, { col: col || D.cream, align: "center", outline: D.n0, size: size || 8, font })); };
  const dust = (g, t, box, seed, n, col) => PX.particles(g, seed || 5, n || 20, t, box, { vy: -2.2, vx: 1.2, col: col || D.lamp, a: 0.4, tw: 1.3 });
  const poly = (g, pts, col) => {
    let y0 = Infinity, y1 = -Infinity; for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    g.fillStyle = col;
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = [], yc = y + 0.5;
      for (let i = 0; i < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length]; if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax)); }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
    }
  };
  const ell = (g, cx, cy, rx, ry, col) => { g.fillStyle = col; for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
  const wrap = (i, n) => ((i % n) + n) % n;
  // beat time: explicit option as given, else default scaled by d / typical d
  const bt = (o, key, def, d, typ) => (o[key] ?? def * d / typ);

  // ---------- recurring materials ----------
  const SKIN = {
    L: [mix(D.rose[0], D.cream, 0.3), mix(D.rose[0], D.amber[1], 0.3), mix(D.rose[1], D.amber[2], 0.45)],
    M: [mix(D.rose[1], D.amber[1], 0.45), mix(D.rose[2], D.amber[2], 0.5), mix(D.rose[2], D.n2, 0.45)],   // You: medium brown
    T: [mix(D.paper, D.amber[1], 0.35), mix(D.paperD, D.amber[2], 0.4), mix(D.amber[2], D.n2, 0.4)],
    Dk: [mix(D.rose[2], D.amber[2], 0.4), mix(D.rose[2], D.n2, 0.4), mix(D.rose[2], D.n1, 0.65)],
  };
  const SKINS = [SKIN.L, SKIN.T, SKIN.M, SKIN.Dk];
  const HAIRS = [mix(D.n1, D.ink, 0.5), mix(D.rust[2], D.n1, 0.4), mix(D.rust[1], D.amber[1], 0.35), D.n6, mix(D.paper, D.amber[1], 0.4)];
  const SHIRTS = [D.steel[1], D.moss[2], D.n5, D.rust[2], D.teal[2], D.plum[2], D.paperD, D.steel[2]];
  const HOOD = [D.amber[0], D.amber[1], D.amber[2]];                       // You: mustard-amber hoodie
  const YOUHAIR = [mix(D.n3, D.ink, 0.3), mix(D.n1, D.ink, 0.5), D.n0];      // dark wavy

  // the YOU dot: warm amber dot, soft 1-px cream ring, faint pulse
  const youDot = (g, x, y, t, a, big) => {
    a = a === undefined ? 1 : a; if (a <= 0) return;
    A(g, a, () => {
      const rr = big ? 3 : 2;
      PX.glow(g, x, y, rr * 5, D.amber[1], 0.16);
      const ph = ((t % 2.2) + 2.2) % 2.2 / 2.2;
      A(g, 0.35 * (1 - ph), () => { const pr = Math.round(rr + 3 + ph * 6); ringPx(g, x, y, pr, D.amber[0]); });
      A(g, 0.55, () => ringPx(g, x, y, rr + 2, D.cream));
      PX.circle(g, x, y, rr, D.amber[1]); R(g, x - 1, y - rr + 1, 1, 1, D.amber[0]);
    });
  };
  const ringPx = (g, cx, cy, r, col) => { g.fillStyle = col; const n = Math.max(12, r * 7); for (let i = 0; i < n; i++) { const a = (i / n) * Math.PI * 2; g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1); } };
  // other people's dot: cool cream / steel
  const otherDot = (g, x, y, a, col) => A(g, a === undefined ? 1 : a, () => { R(g, x - 1, y - 1, 3, 3, col || mix(D.cream, D.steel[0], 0.5)); R(g, x - 1, y - 1, 1, 1, D.cream); });

  // tiny avatar bust 9x10 (for spreadsheet rows / people cards). who: index or "you"
  const AV = ["..hhhhh..", ".hhhhhhh.", ".hsssssh.", ".sesssess", ".sssssss.", "..sssss..", "...sns...", ".ccccccc.", "ccccccccc", "ccccccccc"];
  const AVW = ["..hhhhh..", ".hhhhhhhh", "hhsssshh.", "h.esssesh", ".sssssss.", "..sssss..", "...sns...", ".ccccccc.", "ccccccccc", "ccccccccc"];  // wavy (You)
  const AVL = ["..hhhhh..", ".hhhhhhh.", "hhsssssh.", "hsesssesh", "hsssssssh", "h.sssss.h", "h..sns..h", ".ccccccc.", "ccccccccc", "ccccccccc"];  // long hair
  const avatar = (g, x, y, who, tint, k) => {
    k = k || 0; let rows, pal;
    if (who === "you") { rows = AVW; pal = { h: YOUHAIR[1], s: SKIN.M[1], e: D.n0, n: SKIN.M[2], c: HOOD[1] }; }
    else { const i = wrap(who, 997); rows = i % 3 === 1 ? AVL : AV; const sk = SKINS[wrap(i * 7 + 1, 4)];
      pal = { h: HAIRS[wrap(i * 5 + 2, 5)], s: sk[1], e: D.n0, n: sk[2], c: SHIRTS[wrap(i * 3, 8)] }; }
    if (tint && k > 0) for (const key of Object.keys(pal)) pal[key] = mix(pal[key], tint, k);
    PX.sprite(g, rows, x, y, pal);
  };
  // video thumbnail: small teal square with a tiny picture (horizon / sun / figure), w x h
  const thumb = (g, x, y, w, h, i, k) => {
    k = k === undefined ? 0 : k;   // 0 normal, >0 brighter (highlight)
    const base = mix(D.teal[2], D.teal[1], 0.55 + 0.45 * k), hi = mix(D.teal[1], D.teal[0], 0.4 + 0.6 * k), lo = dk(D.teal[2], 0.25);
    R(g, x, y, w, h, base); R(g, x, y, w, 1, hi); R(g, x, y + h - 1, w, 1, lo);
    const v = wrap(i, 5);
    if (v === 0) { R(g, x + 1, y + h - 4, w - 2, 1, hi); R(g, x + 2, y + h - 5, 3, 1, hi); }
    else if (v === 1) { R(g, x + w - 4, y + 2, 2, 2, lt(D.teal[0], 0.3)); R(g, x + 1, y + h - 3, w - 2, 1, lo); }
    else if (v === 2) { R(g, x + (w >> 1) - 1, y + 2, 2, 2, hi); R(g, x + (w >> 1) - 1, y + 4, 2, h - 6, hi); }
    else if (v === 3) { for (let j = 0; j < w - 3; j += 2) R(g, x + 1 + j, y + h - 3 - (j % 4 ? 1 : 2), 2, 1, hi); }
    else { R(g, x + 2, y + 2, w - 4, 1, lo); R(g, x + 2, y + 4, w - 6, 1, lo); }
  };

  // ---------- the night office (shared by big_sheet) ----------
  const CITY = (() => { const r = PX.rnd(31), b = []; let x = -30; while (x < 700) { const w = 14 + Math.floor(r() * 26), h = 40 + Math.floor(r() * 110); b.push([x, w, h, r()]); x += w + 2; } return b; })();
  const city = (g, t, x0, x1, top, bot) => {
    PX.vgrad(g, x0, top, x1 - x0, bot - top, dk(D.steel[2], 0.55), mix(D.steel[2], D.n2, 0.45), 6);
    for (const [bx, bw, bh, s] of CITY) {
      if (bx + bw < x0 || bx > x1) continue;
      const y = bot - bh * 0.8, col = s > 0.5 ? mix(D.n1, D.steel[2], 0.25) : mix(D.n1, D.steel[2], 0.12);
      R(g, Math.max(bx, x0), y, Math.min(bx + bw, x1) - Math.max(bx, x0), bot - y, col);
      for (let wy = y + 4; wy < bot - 2; wy += 5) for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) {
        if (wx < x0 || wx > x1 - 2) continue;
        const h = Math.sin(wx * 12.9898 + wy * 78.233) * 43758.5453, f = h - Math.floor(h);
        if (f < 0.13) R(g, wx, wy, 2, 2, f < 0.03 && Math.sin(t * 0.4 + wx) > 0.6 ? dk(D.lamp, 0.55) : mix(dk(D.lamp, 0.62), D.steel[2], 0.3));
      }
    }
    // a slow aircraft light
    const ax = x0 + (((t * 6) % (x1 - x0 + 40)) + (x1 - x0 + 40)) % (x1 - x0 + 40) - 20; if (PX.blink(t, 1.6, 0.15)) R(g, ax, top + 14, 1, 1, D.rust[0]);
  };

  // desk island seen from behind its monitors: x centre, y = desk top, w width, s scale
  const deskRow = (g, t, x, y, w, s, lightK, seed) => {
    const top = mix(D.n3, D.n2, 0.4), edge = mix(D.n4, D.teal[2], 0.3 * lightK), front = D.n1;
    R(g, x - w / 2, y, w, Math.round(5 * s), top); R(g, x - w / 2, y, w, 1, edge); R(g, x - w / 2, y + Math.round(5 * s), w, Math.round(18 * s), front);
    R(g, x - w / 2 + 2, y + Math.round(5 * s), Math.round(2 * s), Math.round(18 * s), D.n2); R(g, x + w / 2 - 4, y + Math.round(5 * s), Math.round(2 * s), Math.round(18 * s), D.n2);
    const n = Math.max(2, Math.round(w / (46 * s)));
    for (let i = 0; i < n; i++) {
      const mx = x - w / 2 + (i + 0.5) * (w / n), mw = Math.round(30 * s), mh = Math.round(20 * s);
      R(g, mx - 2 * s, y - 6 * s, 4 * s, 6 * s, D.n2);
      R(g, mx - mw / 2, y - 6 * s - mh, mw, mh, mix(D.n1, D.n2, 0.5)); R(g, mx - mw / 2, y - 6 * s - mh, mw, 1, edge);
      if (PX.blink(t + i * 0.7 + seed, 3.1 + (i % 3) * 0.7, 0.12)) R(g, mx + mw / 2 - 3 * s, y - 8 * s, 1, 1, D.moss[1]);
      // chair back
      const cx = mx + ((i * 7 + seed) % 5 - 2) * s, cy = y + 4 * s;
      R(g, cx - 9 * s, cy, 18 * s, 16 * s, D.n0); R(g, cx - 9 * s, cy, 18 * s, 1, mix(D.n3, D.teal[2], 0.3 * lightK)); R(g, cx - 1, cy + 16 * s, 2, 6 * s, D.n0);
    }
  };

  // standing analyst seen from behind (~84 px), rim-lit by the wall screen. look = head offset px
  const analyst = (g, x, y, t, look) => {
    const coat = [mix(D.steel[2], D.n3, 0.2), mix(D.steel[2], D.n1, 0.45), mix(D.n1, D.n0, 0.4)];
    const rim = mix(D.teal[0], D.steel[0], 0.5), hair = [mix(D.n3, D.ink, 0.4), mix(D.n1, D.ink, 0.4), D.n0];
    const br = Math.round(Math.sin(t * 1.3) * 0.6 + 0.5), lk = Math.round(look || 0);
    A(g, 0.5, () => ell(g, x, y + 1, 22, 3, SH(1)));
    // legs
    R(g, x - 10, y - 30, 8, 30, coat[2]); R(g, x + 2, y - 30, 8, 30, coat[2]); R(g, x - 11, y - 2, 10, 2, D.n0); R(g, x + 1, y - 2, 10, 2, D.n0);
    // coat body
    for (let r = 0; r < 44; r++) { const w = Math.round(r < 4 ? 24 + r * 2 : r < 22 ? 32 - (r - 4) * 0.22 : 28 + (r - 22) * 0.25), yy = y - 74 + r + br;
      R(g, x - w / 2, yy, w, 1, coat[1]); R(g, x - w / 2, yy, 2, 1, rim); R(g, x + w / 2 - 4, yy, 4, 1, coat[2]); }
    R(g, x - 1, y - 60 + br, 2, 30, coat[2]);
    R(g, x - 20, y - 68 + br, 6, 30, coat[1]); R(g, x - 20, y - 68 + br, 1, 30, rim); R(g, x + 14, y - 68 + br, 6, 30, coat[2]);   // arms
    R(g, x - 19, y - 38 + br, 4, 5, SKIN.T[1]); R(g, x + 15, y - 38 + br, 4, 5, SKIN.T[2]);
    R(g, x - 13, y - 74 + br, 26, 2, mix(coat[0], rim, 0.4)); R(g, x - 5, y - 76 + br, 10, 3, coat[0]);   // lit shoulders + collar
    // neck + head (back)
    R(g, x - 3 + lk, y - 78 + br, 7, 5, SKIN.T[2]);
    PX.circle(g, x + lk, y - 86 + br, 8, hair[1]); R(g, x - 6 + lk, y - 93 + br, 10, 2, hair[0]);
    for (let r = -6; r < 6; r++) R(g, x - 8 + lk + (r < -3 ? 1 : 0), y - 86 + r + br, 1, 1, rim);
    R(g, x - 9 + lk, y - 86 + br, 2, 4, SKIN.T[2]); R(g, x + 8 + lk, y - 86 + br, 2, 4, dk(SKIN.T[2], 0.3));
  };

  // office around a wall screen; screen rect [x, y, w, h]; returns nothing. lightK = how bright the screen is (0..1)
  const office = (g, t, c, scr, lightK) => {
    const [sx, sy, sw, sh] = scr, FY = 252;
    // far: back wall, side windows with the city
    PX.par(g, c, 0.4, () => {
      PX.vgrad(g, -20, -20, 680, FY + 20, D.n1, mix(D.n2, D.steel[2], 0.15), 8);
      for (const [wx, ww] of [[-24, 102], [562, 102]]) {
        city(g, t, wx, wx + ww, 40, 214);
        for (let k = 0; k < 4; k++) R(g, wx + k * (ww / 3), 40, 3, 174, D.n1);
        R(g, wx, 38, ww, 4, D.n2); R(g, wx, 212, ww, 6, D.n2); R(g, wx, 117, ww, 2, D.n1);
        A(g, 0.06, () => { for (let yy = 42; yy < 212; yy++) R(g, wx + 12 + (yy - 42) * 0.25, yy, 8, 1, D.glass); });
      }
      // wall columns
      for (const px of [92, 532]) { R(g, px, -20, 16, FY + 20, mix(D.n2, D.n1, 0.3)); R(g, px, -20, 1, FY + 20, D.n3); }
    });
    // ceiling with dim recessed strips
    PX.par(g, c, 0.55, () => {
      R(g, -20, -20, 680, 30, D.n0);
      for (let i = 0; i < 4; i++) { const y = 2 + i * 4, w = 260 + i * 120; R(g, 320 - w / 2, y, w, 1, mix(D.n2, D.steel[2], 0.2)); for (let k = -3; k <= 3; k++) R(g, 320 + k * w / 7 - 6, y, 12, 1, mix(D.n3, D.lamp, 0.12)); }
      // pendant lamps (off) hanging in front of the windows
      for (const [lx, ly] of [[40, 26], [600, 26]]) { R(g, lx, 0, 1, ly, D.n2); poly(g, [[lx - 9, ly + 8], [lx - 4, ly], [lx + 5, ly], [lx + 10, ly + 8]], D.n1); R(g, lx - 9, ly + 8, 20, 1, mix(D.n3, D.teal[2], 0.4)); }
    });
    // floor (screen reflection)
    PX.par(g, c, 0.7, () => {
      PX.vgrad(g, -20, FY, 680, 130, mix(D.n2, D.steel[2], 0.15), D.n0, 6);
      A(g, 0.13 * lightK, () => { for (let r = 0; r < 70; r++) A(g, (1 - r / 70) * (r % 3 === 0 ? 0.6 : 1), () => R(g, sx + 20 - r * 0.6, FY + r, sw - 40 + r * 1.2, 1, D.teal[1])); });
      // floor seams in perspective
      for (let k = -6; k <= 6; k++) if (k) PX.line(g, 320 + k * 40, FY + 1, 320 + k * 130, 380, mix(D.n2, D.n1, 0.45));
      R(g, -20, FY, 680, 1, D.n3);
      deskRow(g, t, 168, 262, 180, 0.8, lightK, 1); deskRow(g, t, 478, 262, 180, 0.8, lightK, 4);
    });
    // wall screen: bezel + mount
    A(g, 0.6, () => R(g, sx - 2, sy + sh + 6, sw + 4, 5, SH(1)));
    R(g, sx - 6, sy - 6, sw + 12, sh + 12, D.n0); R(g, sx - 6, sy - 6, sw + 12, 1, D.n3); R(g, sx - 6, sy + sh + 5, sw + 12, 1, D.n2);
    R(g, sx + sw - 14, sy + sh + 2, 2, 2, PX.blink(t, 4, 0.9) ? D.moss[1] : D.moss[2]);
  };

  // near foreground: a desk corner with the one warm lamp (left) and an empty chair back (right)
  const nearDesk = (g, t) => {
    const WOOD = [mix(D.paperD, D.n3, 0.55), mix(D.paperD, D.n2, 0.72), mix(D.n1, D.n0, 0.3)];
    PX.glow(g, 58, 300, 90, D.lampD, 0.32);
    poly(g, [[-10, 318], [150, 318], [176, 360], [-10, 360]], WOOD[1]); R(g, -10, 318, 160, 1, mix(WOOD[0], D.lamp, 0.35));
    poly(g, [[-10, 319], [140, 319], [146, 326], [-10, 326]], WOOD[0]);
    A(g, 0.35, () => ell(g, 60, 324, 46, 5, D.lamp));
    // lamp: base, arm, shade
    R(g, 44, 320, 22, 4, D.n3); R(g, 44, 320, 22, 1, D.n5); PX.line(g, 52, 320, 44, 296, D.n4); PX.line(g, 53, 320, 45, 296, D.n3); PX.line(g, 44, 296, 62, 284, D.n4);
    poly(g, [[56, 280], [70, 286], [74, 296], [60, 296]], D.n3); R(g, 61, 295, 13, 1, D.lamp); R(g, 63, 296, 9, 1, lt(D.lamp, 0.4));
    // papers + pencil + mug
    poly(g, [[86, 322], [118, 320], [122, 328], [90, 330]], mix(D.paper, D.n3, 0.35)); poly(g, [[90, 321], [120, 319], [123, 325], [93, 327]], mix(D.paper, D.lampD, 0.2));
    for (let l = 0; l < 3; l++) R(g, 96, 322 + l * 2, 18, 1, mix(D.paperD, D.n4, 0.4)); PX.line(g, 98, 331, 118, 329, D.amber[2]);
    R(g, 18, 310, 10, 11, mix(D.cream, D.n4, 0.4)); R(g, 18, 310, 10, 1, lt(D.cream, 0.1)); R(g, 28, 312, 3, 6, mix(D.cream, D.n4, 0.5)); R(g, 19, 311, 8, 2, mix(D.rust[2], D.n1, 0.5));
    for (let i = 0; i < 3; i++) { const k = (t * 0.45 + i / 3) % 1; A(g, 0.3 * (1 - k), () => R(g, 21 + Math.round(Math.sin(k * 6 + i) * 2), 306 - k * 16, 1, 3, D.cream)); }
    // tall potted plant, right foreground (silhouette, teal rim from the screen; leaves breathe)
    const px = 594, py = 344;
    R(g, px - 14, py - 26, 28, 30, mix(D.n2, D.n1, 0.4)); R(g, px - 15, py - 28, 30, 3, D.n3); R(g, px - 14, py - 26, 1, 28, mix(D.n3, D.teal[2], 0.5));
    const LEAVES = [[-0.9, 40, 16], [-0.4, 58, 18], [0.2, 52, 17], [0.75, 36, 15], [-1.4, 26, 13], [1.25, 24, 13], [-0.15, 74, 15], [0.5, 70, 14], [-0.7, 84, 13]];
    LEAVES.forEach(([ang, len, sz], i) => {
      const sw = Math.sin(t * 0.7 + i * 1.7) * 0.04, a = ang + sw - Math.PI / 2;
      const bx = px + Math.cos(a) * len * 0.55, by = py - 28 + Math.sin(a) * len * 0.55, tx = px + Math.cos(a) * len, ty = py - 28 + Math.sin(a) * len;
      PX.line(g, px, py - 28, Math.round(bx), Math.round(by), D.n0);
      const dx = Math.cos(a + 0.5), dy = Math.sin(a + 0.5), nx = -dy, ny = dx, ex = tx + dx * sz, ey = ty + dy * sz + 4;
      const pts = [[bx, by], [lerp(bx, ex, 0.4) + nx * sz * 0.38, lerp(by, ey, 0.4) + ny * sz * 0.38], [ex, ey], [lerp(bx, ex, 0.5) - nx * sz * 0.3, lerp(by, ey, 0.5) - ny * sz * 0.3]];
      poly(g, pts, i % 2 ? D.n0 : mix(D.n0, D.moss[2], 0.18));
      PX.line(g, Math.round(bx), Math.round(by), Math.round(ex), Math.round(ey), mix(D.n0, D.moss[2], 0.35));
      if (Math.cos(a) < 0.1) PX.line(g, Math.round(pts[1][0]), Math.round(pts[1][1]), Math.round(ex), Math.round(ey), mix(D.moss[2], D.teal[1], 0.3));
    });
  };

  // ===================================================================================================
  // big_sheet (9): dark open-plan office at night; a huge wall screen shows a spreadsheet: rows = people (avatars),
  // columns = videos (teal squares). o.rows (1.0) rows highlight + PERSON, o.cols (3.0) columns highlight + VIDEO,
  // o.ones (5.0) "1"s pop into cells.
  K.big_sheet = (o) => {
    const SX = 112, SY = 42, SW = 416, SH2 = 184;
    const GX = 152, GY = 78, CW = 22, CH = 15, NC = 16, NR = 9;
    const r = PX.rnd(17), ONES = [];
    for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) { const v = r(); if (v < 0.34) ONES.push([i, j, (i + j * 1.7) / (NC + NR * 1.7) * 0.75 + r() * 0.25]); }
    const ROWAV = [3, 8, 1, 12, 5, 9, 2, 14, 6];
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const TR = bt(o, "rows", 1.0, d, 9), TC = bt(o, "cols", 3.0, d, 9), TO = bt(o, "ones", 5.0, d, 9), FILL = 2.6 * Math.min(1, d / 9);
      const on = P(t, 0, 0.6);
      office(g, t, c, [SX, SY, SW, SH2], 1);
      // screen light on the room
      PX.glow(g, 320, 140, 300, D.teal[2], 0.28);
      // ---- screen content ----
      const BG = mix(D.n1, D.teal[2], 0.22), GRID = mix(BG, D.teal[1], 0.22), GRID2 = mix(BG, D.teal[1], 0.1);
      R(g, SX, SY, SW, SH2, BG);
      R(g, SX, SY, SW, 10, mix(BG, D.n0, 0.3)); for (let i = 0; i < 3; i++) R(g, SX + 5 + i * 5, SY + 4, 3, 2, mix(BG, D.teal[0], 0.25));
      R(g, SX + SW - 60, SY + 4, 50, 2, mix(BG, D.teal[0], 0.15));
      // grid
      for (let i = 0; i <= NC; i++) R(g, GX + i * CW, GY - 16, 1, NR * CH + 16, i % 4 === 0 ? GRID : GRID2);
      for (let j = 0; j <= NR; j++) R(g, GX - 18, GY + j * CH, NC * CW + 18, 1, GRID);
      R(g, GX - 18, GY - 16, NC * CW + 18, 1, GRID2);
      // row highlight sweep
      const rowK = (j) => { if (t < TR) return 0; const tj = TR + j * 0.13, a = P(t, tj, 0.25), b = PX.clamp((t - tj - 0.35) / 0.6, 0, 1); return Math.max(0.28, a * (1 - b * 0.72)) * (t >= tj ? 1 : 0); };
      const colK = (i) => { if (t < TC) return 0; const ti = TC + i * 0.075, a = P(t, ti, 0.2), b = PX.clamp((t - ti - 0.3) / 0.6, 0, 1); return Math.max(0.25, a * (1 - b * 0.75)) * (t >= ti ? 1 : 0); };
      for (let j = 0; j < NR; j++) { const k = rowK(j); if (k > 0) A(g, k * 0.42, () => { R(g, GX - 17, GY + j * CH + 1, NC * CW + 17, CH - 1, D.steel[1]); R(g, GX - 17, GY + j * CH + 1, NC * CW + 17, 1, D.steel[0]); }); }
      for (let i = 0; i < NC; i++) { const k = colK(i); if (k > 0) A(g, k * 0.4, () => { R(g, GX + i * CW + 1, GY - 15, CW - 1, NR * CH + 15, D.teal[1]); R(g, GX + i * CW + 1, GY - 15, 1, NR * CH + 15, D.teal[0]); }); }
      // header thumbnails + row avatars
      for (let i = 0; i < NC; i++) thumb(g, GX + i * CW + 5, GY - 13, 12, 10, i * 3 + 1, colK(i));
      for (let j = 0; j < NR; j++) { const k = rowK(j); avatar(g, GX - 14, GY + j * CH + 3, ROWAV[j], D.cream, 0.08 + 0.3 * (k > 0.5 ? k - 0.5 : 0)); }
      // the "1"s
      for (const [i, j, f] of ONES) {
        const t0 = TO + f * FILL; if (t < t0) continue;
        const age = t - t0, cx = GX + i * CW, cy = GY + j * CH;
        if (age < 0.35) A(g, 1 - age / 0.35, () => R(g, cx + 1, cy + 1, CW - 1, CH - 1, D.teal[1]));
        const lift = age < 0.12 ? 2 : age < 0.22 ? 1 : 0;
        PX.text(g, "1", cx + CW / 2, cy + 1 - lift, { font: "v", size: 14, col: age < 0.3 ? D.cream : mix(D.cream, D.teal[0], 0.35), align: "center" });
      }
      // a selection box wanders over filled cells once full
      if (t > TO + FILL + 0.5 && ONES.length) {
        const s = ONES[wrap(Math.floor((t - TO - FILL) / 0.8) * 7, ONES.length)];
        PX.box(g, GX + s[0] * CW, GY + s[1] * CH, CW + 1, CH + 1, D.cream);
      }
      // margin labels: PERSON stacked vertically on the left, VIDEO over the columns
      const pa = P(t, TR, 0.4), va = P(t, TC, 0.4);
      if (pa > 0) A(g, pa, () => { "PERSON".split("").forEach((ch, k) => PX.text(g, ch, SX + 8, GY + 18 + k * 11, { size: 8, col: D.cream, align: "center" }));
        R(g, SX + 15, GY + 2, 1, NR * CH - 4, mix(D.cream, BG, 0.5)); R(g, SX + 15, GY + 2, 3, 1, mix(D.cream, BG, 0.5)); R(g, SX + 15, GY + NR * CH - 3, 3, 1, mix(D.cream, BG, 0.5)); });
      if (va > 0) A(g, va, () => { PX.text(g, "VIDEO", GX + NC * CW / 2, SY + 12, { size: 8, col: D.cream, align: "center" });
        const bc = mix(D.cream, BG, 0.5), tw = 46, mx = GX + NC * CW / 2;
        R(g, GX + 2, SY + 16, mx - tw / 2 - GX - 2, 1, bc); R(g, mx + tw / 2, SY + 16, GX + NC * CW - 2 - mx - tw / 2, 1, bc); R(g, GX + 2, SY + 16, 1, 4, bc); R(g, GX + NC * CW - 3, SY + 16, 1, 4, bc); });
      // scrollbar + status strip
      R(g, SX + SW - 10, GY, 3, NR * CH, mix(BG, D.n0, 0.3)); R(g, SX + SW - 10, GY + 4, 3, 26, mix(BG, D.teal[1], 0.4));
      R(g, SX, SY + SH2 - 8, SW, 8, mix(BG, D.n0, 0.25)); if (PX.blink(t, 1.1, 0.55)) R(g, SX + 6, SY + SH2 - 6, 4, 4, mix(BG, D.teal[0], 0.5));
      // screen sheen + power-on
      A(g, 0.05, () => { for (let yy = 0; yy < SH2; yy++) R(g, SX + 40 + yy * 0.5, SY + yy, 30, 1, D.cream); });
      A(g, 1 - on, () => R(g, SX, SY, SW, SH2, D.n0));
      // the lone analyst in front of the screen
      const focus = t >= TC ? (clamp((t - TC) / (NC * 0.075), 0, 1) - 0.5) * 3 : t >= TR ? -1 : 0;
      analyst(g, 470, 342, t, focus);
      nearDesk(g, t);
      dust(g, t, [140, 60, 360, 200], 41, 22, mix(D.teal[0], D.cream, 0.4));
      PX.vignette(g, 0.55);
    };
  };
  // ===================================================================================================
  // twin_row (16): close on the wall screen. o.you (0.5) your row lights amber; scanning beams compare rows; o.twin (4.0)
  // a stranger's row lights cream, tag "BRAZIL?" -> "POLAND?"; o.same (7.0) "SAME 40 VIDEOS", matching cells joined by
  // thin lines; o.extra (10.0) one extra cell in the twin's row glows and slides up into your row as "NEXT".
  K.twin_row = (o) => {
    const SX = 26, SY = 24, SW = 588, SHh = 300;
    const GX = 114, GY = 66, CW = 24, CH = 30, NC = 15, NR = 8, YOU = 1, TWIN = 5, XC = 11;
    const MINE = [0, 2, 3, 5, 7, 8, 10, 13];
    const r = PX.rnd(29), FILL = [];
    for (let j = 0; j < NR; j++) { const row = []; for (let i = 0; i < NC; i++) row.push(j === YOU ? MINE.includes(i) : j === TWIN ? MINE.includes(i) || i === XC : r() < 0.3); FILL.push(row); }
    const AVS = [4, "you", 7, 10, 2, 13, 6, 11];
    const SCAN = [2, 3, 4, 6, 7, 0, 3, 6];
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const TY = bt(o, "you", 0.5, d, 16), TT = bt(o, "twin", 4.0, d, 16), TS = bt(o, "same", 7.0, d, 16), TE = bt(o, "extra", 10.0, d, 16);
      const rowY = (j) => GY + j * CH;
      // ---- wall + bezel (the screen fills the frame) ----
      PX.par(g, c, 0.5, () => { PX.vgrad(g, -20, -20, 680, 400, D.n1, D.n0, 6); });
      R(g, SX - 8, SY - 8, SW + 16, SHh + 16, D.n0); R(g, SX - 8, SY - 8, SW + 16, 1, D.n3); R(g, SX - 8, SY - 8, 1, SHh + 16, D.n2);
      const BG = mix(D.n1, D.teal[2], 0.22), GRID = mix(BG, D.teal[1], 0.2), GRID2 = mix(BG, D.teal[1], 0.09);
      R(g, SX, SY, SW, SHh, BG);
      PX.glow(g, 320, 170, 320, D.teal[2], 0.12);
      // grid + header
      for (let i = 0; i <= NC; i++) R(g, GX + i * CW, GY - 20, 1, NR * CH + 20, GRID2);
      for (let j = 0; j <= NR; j++) R(g, GX - 24, rowY(j), NC * CW + 24, 1, GRID);
      for (let i = 0; i < NC; i++) thumb(g, GX + i * CW + 5, GY - 16, 14, 12, i * 3 + 2, i === XC && t >= TE ? 0.6 : 0);
      // row bands
      const youK = P(t, TY, 0.5), twinK = P(t, TT, 0.4), sameK = P(t, TS, 0.6);
      if (youK > 0) A(g, youK, () => { A(g, 0.22, () => R(g, GX - 23, rowY(YOU) + 1, NC * CW + 23, CH - 1, D.amber[2])); R(g, GX - 23, rowY(YOU) + 1, NC * CW + 23, 1, D.amber[1]); R(g, GX - 23, rowY(YOU) + CH - 1, NC * CW + 23, 1, D.amber[2]); });
      if (twinK > 0) A(g, twinK, () => { A(g, 0.16, () => R(g, GX - 23, rowY(TWIN) + 1, NC * CW + 23, CH - 1, D.cream)); R(g, GX - 23, rowY(TWIN) + 1, NC * CW + 23, 1, mix(D.cream, BG, 0.3)); R(g, GX - 23, rowY(TWIN) + CH - 1, NC * CW + 23, 1, mix(D.cream, BG, 0.5)); });
      // avatars
      for (let j = 0; j < NR; j++) avatar(g, GX - 17, rowY(j) + 10, AVS[j], j === YOU || j === TWIN ? null : BG, 0.25);
      if (youK > 0) youDot(g, GX - 30, rowY(YOU) + 15, t, youK);
      // chips
      const chip = (i, j, col, top, a) => A(g, a, () => { const x = GX + i * CW + 5, y = rowY(j) + 9; R(g, x, y, CW - 9, CH - 17, col); R(g, x, y, CW - 9, 1, top); R(g, x, y + CH - 18, CW - 9, 1, dk(col, 0.35)); });
      const dimMid = sameK * 0.55;
      for (let j = 0; j < NR; j++) for (let i = 0; i < NC; i++) {
        if (!FILL[j][i]) continue;
        if (j === YOU) { if (youK > 0) { const k = P(t, TY + i * 0.04, 0.3); chip(i, j, mix(D.steel[2], mix(D.amber[1], D.amber[2], 0.55), k), mix(D.steel[1], D.amber[1], k), 1); } else chip(i, j, D.steel[2], D.steel[1], 1); }
        else if (j === TWIN) { if (i === XC && t >= TE + 0.8) continue; chip(i, j, mix(D.steel[2], D.paper, twinK), mix(D.steel[1], D.cream, twinK), 1); }
        else chip(i, j, mix(D.steel[2], BG, 0.25), mix(D.steel[1], BG, 0.35), 1 - dimMid * (j > YOU && j < TWIN ? 1 : 0.6));
      }
      // ---- scanning beam: compares your pattern against each row until the twin is found ----
      const s0 = TY + 0.8;
      if (t >= s0 && youK > 0) {
        const scanY = (u) => { const f = Math.max(0, u - s0) / 0.42, k = Math.floor(f), fr = f - k, a = SCAN[wrap(k, SCAN.length)], b = SCAN[wrap(k + 1, SCAN.length)];
          return lerp(rowY(a), rowY(b), PX.ease(clamp(fr * 2.2, 0, 1), "io")); };
        // before the twin: scanning; at the twin: glide from wherever the beam was; after NEXT lands: a slow, dim second pass
        const again = TE + 3.0;
        let by = t < TT ? scanY(t) : lerp(scanY(TT), rowY(TWIN), P(t, TT, 0.35, "io"));
        let fade = t < TT ? 1 : 1 - clamp((t - TT - 0.6) / 0.8, 0, 1);
        if (t >= again) { by = scanY(s0 + (t - again) * 0.55); fade = 0.45 * P(t, again, 0.8); }
        if (fade > 0) A(g, fade, () => {
          A(g, 0.18, () => R(g, GX - 23, by + 1, NC * CW + 23, CH - 1, D.teal[0]));
          R(g, GX - 23, by, NC * CW + 23, 1, D.teal[0]); R(g, GX - 23, by + CH, NC * CW + 23, 1, mix(D.teal[0], BG, 0.4));
          const jr = Math.round((by - GY) / CH);
          for (const i of MINE) { const x = GX + i * CW + 4, y = by + 8; A(g, 0.7, () => PX.box(g, x, y, CW - 7, CH - 15, D.amber[0]));
            if (jr >= 0 && jr < NR && FILL[jr][i] && Math.abs(by - rowY(jr)) < 3) R(g, x + (CW - 7) / 2 - 1, y - 4, 3, 2, D.cream); }
          R(g, GX - 23, by + 1, 3, CH - 1, D.amber[1]);
        });
      }
      // ---- the twin's tag: BRAZIL? -> POLAND? ----
      if (t >= TT + 0.3) {
        const swap = TT + 1.8, k = P(t, TT + 0.3, 0.3, "back"), ty = rowY(TWIN) + 7, tx = GX + NC * CW + 10;
        const str = t < swap ? "BRAZIL?" : "POLAND?", flick = t >= swap - 0.12 && t < swap + 0.1 && PX.blink(t, 0.06);
        PX.line(g, GX + NC * CW, ty + 8, tx, ty + 8, mix(D.cream, BG, 0.4));
        A(g, k, () => { PX.panel(g, tx, ty, 72, 17, mix(D.cream, BG, 0.3), mix(D.n1, BG, 0.4)); if (!flick) PX.text(g, str, tx + 36, ty + 1, { font: "v", size: 16, col: D.cream, align: "center" }); });
      }
      // ---- same videos: thin lines join the matching cells ----
      if (sameK > 0) {
        MINE.forEach((i, n) => { const k = P(t, TS + n * 0.12, 0.6, "io"), x = GX + i * CW + (CW >> 1), y0 = rowY(YOU) + CH - 8, y1 = rowY(TWIN) + 9;
          if (k > 0) { A(g, 0.85, () => R(g, x, y0, 1, Math.round((y1 - y0) * k), mix(D.cream, D.amber[0], 0.4))); if (k >= 1) { R(g, x - 1, y0, 3, 1, D.amber[0]); R(g, x - 1, y1 - 1, 3, 1, D.cream); } } });
        label(g, "SAME 40 VIDEOS", GX + NC * CW / 2, rowY(3) + 8, P(t, TS + 0.5, 0.5), D.cream, 8);
      }
      // ---- the extra cell: glows in the twin's row, slides up into yours as NEXT ----
      if (t >= TE) {
        const x = GX + XC * CW + 5, yT = rowY(TWIN) + 9, yY = rowY(YOU) + 9, mv = P(t, TE + 0.8, 1.0, "io"), y = Math.round(lerp(yT, yY, mv));
        const pulse = 0.5 + 0.5 * Math.sin((t - TE) * 6);
        if (mv > 0 && mv < 1) for (let yy = y + CH - 14; yy < yT + CH - 17; yy += 3) A(g, 0.4, () => R(g, x + (CW - 9) / 2, yy, 1, 1, D.amber[0]));
        PX.glow(g, x + (CW - 9) / 2, y + 6, 18 + pulse * 4, D.amber[1], 0.18 + 0.12 * pulse * (1 - mv));
        const col = mix(D.paper, mix(D.amber[1], D.amber[2], 0.3), mv), top = mix(D.cream, D.amber[0], mv * 0.8);
        R(g, x - 1, y - 1, CW - 7, CH - 15, top); R(g, x, y, CW - 9, CH - 17, col); R(g, x, y + CH - 18, CW - 9, 1, dk(col, 0.35));
        if (mv >= 1) { A(g, 0.6 + 0.35 * Math.sin((t - TE) * 2.4), () => PX.box(g, x - 3, y - 3, CW - 3, CH - 11, D.amber[0])); label(g, "NEXT", x + (CW - 9) / 2, y - 16, P(t, TE + 1.8, 0.4), D.amber[0], 8); }
      }
      // status strip + sheen
      R(g, SX, SY + SHh - 10, SW, 10, mix(BG, D.n0, 0.25)); if (PX.blink(t, 1.1, 0.55)) R(g, SX + 8, SY + SHh - 7, 4, 4, mix(BG, D.teal[0], 0.5));
      A(g, 0.04, () => { for (let yy = 0; yy < SHh; yy++) R(g, SX + 300 + yy * 0.45, SY + yy, 44, 1, D.cream); });
      // foreground corners: a desk monitor back (right) and plant leaves (left) in silhouette against the screen
      const rim = mix(D.teal[1], D.steel[1], 0.4);
      R(g, 550, 290, 100, 58, D.n0); R(g, 552, 288, 96, 2, D.n0); R(g, 552, 288, 96, 1, rim); R(g, 550, 290, 1, 56, rim); R(g, 551, 289, 1, 1, rim);
      for (let k = 0; k < 6; k++) R(g, 566 + k * 6, 300, 3, 14, mix(D.n0, D.n2, 0.6));
      R(g, 592, 348, 16, 14, D.n0); R(g, 592, 348, 1, 14, mix(D.n0, rim, 0.5));
      if (PX.blink(t, 3.4, 0.1)) R(g, 558, 342, 1, 1, D.moss[1]);
      for (const [dx, dy, wd] of [[58, -92, 7], [82, -64, 8], [40, -110, 6], [96, -36, 7], [22, -80, 6]]) {
        const sw = Math.round(Math.sin(t * 0.7 + dx) * 1.5), x0 = -4, y0 = 364, ex = x0 + dx + sw, ey = y0 + dy, mx = x0 + dx * 0.55, my = y0 + dy * 0.55;
        const nx = -dy / Math.hypot(dx, dy) * wd, ny = dx / Math.hypot(dx, dy) * wd;
        poly(g, [[x0 + dx * 0.15, y0 + dy * 0.15], [mx + nx, my + ny], [ex, ey], [mx - nx, my - ny]], D.n0);
        PX.line(g, Math.round(mx - nx), Math.round(my - ny), ex, ey, rim);
      }
      dust(g, t, [40, 40, 560, 260], 53, 16, mix(D.teal[0], D.cream, 0.4));
      PX.vignette(g, 0.5);
    };
  };
  // ===================================================================================================
  // blind_clerk (9.5): a dim video-rental archive, endless shelves of blank tapes; a blindfolded clerk sorts tapes only by
  // the little borrower tags (strings run from people cards to the piles). Labels: "COOKING?" (o.q1 3.0),
  // "FOOTBALL?" (o.q2 4.5), "SADNESS?" (o.q3 6.0).
  const WOODS = [mix(D.paperD, D.rust[2], 0.45), mix(D.rust[2], D.n2, 0.35), mix(D.rust[2], D.n1, 0.62), mix(D.n1, D.n0, 0.3)];
  const TAPES = [mix(D.n3, D.n2, 0.3), mix(D.n4, D.n2, 0.4), mix(D.steel[2], D.n2, 0.4), mix(D.n3, D.paperD, 0.15)];
  const limb = (g, x1, y1, x2, y2, w, col) => { const dx = x2 - x1, dy = y2 - y1, l = Math.hypot(dx, dy) || 1, nx = -dy / l * w / 2, ny = dx / l * w / 2;
    poly(g, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], col); };
  // flat tape lying on the counter (side view) with a borrower tag; tagCol tints the tag
  const tapeFlat = (g, x, y, i, tag) => {
    const c = TAPES[wrap(i, 4)];
    R(g, x, y, 24, 5, c); R(g, x, y, 24, 1, lt(c, 0.25)); R(g, x, y + 4, 24, 1, dk(c, 0.4)); R(g, x + 4, y + 1, 12, 3, mix(D.paper, c, 0.45));
    if (tag) { PX.line(g, x + 22, y + 2, x + 26, y + 6, D.n6); R(g, x + 25, y + 5, 5, 6, D.paper); R(g, x + 25, y + 5, 5, 1, lt(D.paper, 0.4)); R(g, x + 27, y + 7, 1, 2, D.ink); }
  };
  const tapeHeld = (g, x, y) => { R(g, x - 12, y - 4, 24, 8, TAPES[1]); R(g, x - 12, y - 4, 24, 1, lt(TAPES[1], 0.3)); R(g, x - 7, y - 2, 12, 4, mix(D.paper, TAPES[1], 0.35));
    PX.line(g, x + 11, y + 2, x + 14, y + 8, D.n6); R(g, x + 12, y + 7, 5, 6, D.paper); R(g, x + 14, y + 9, 1, 2, D.ink); };

  K.blind_clerk = (o) => {
    const VPX = 330, VPY = 116, CY = 262, CX = 330;
    const PILES = [[CX - 104, CY], [CX - 12, CY], [CX + 80, CY]], CRATE = [CX + 46, CY];
    const r = PX.rnd(83);
    const CARDS = []; for (let j = 0; j < 3; j++) for (let i = 0; i < 3; i++) CARDS.push([24 + i * 40 + (j % 2) * 5, 70 + j * 40, wrap(i + j * 2, 3), Math.floor(r() * 20)]);
    const SPINES = [...Array(400)].map(() => [r(), r()]);
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const Q = [bt(o, "q1", 3.0, d, 9.5), bt(o, "q2", 4.5, d, 9.5), bt(o, "q3", 6.0, d, 9.5)];
      // beats drive the sorting; if no beat lands in this shot the clerk just keeps sorting on a steady rhythm
      // one sort takes EVD (scaled down in short shots so sorts never overlap); landing at 1.4 of it
      const ks = Math.min(1, d / 9.5), EVD = 1.55;
      const EV = Q.every((q) => q > d) ? [0.3, 2.1, 3.9, 5.7, 7.5, 9.3].map((x, k) => [x * d / 9.5, wrap(k + 1, 3)])
        : [[Q[0] - 3.1 * ks, 1], [Q[0] - 1.55 * ks, 0], [Q[1] - 1.55 * ks, 1], [Q[2] - 1.55 * ks, 2], [Q[2] + 0.4 * ks, 0], [Q[2] + 2.1 * ks, 2], [Q[2] + 3.8 * ks, 1]];
      // ---- far: the endless aisle of tape shelves (one-point perspective into the dark) ----
      PX.par(g, c, 0.45, () => {
        R(g, -20, -20, 680, 300, D.n0);
        const FOG = D.n0;
        for (const side of [-1, 1]) for (let i = 30; i >= 0; i--) {
          const z0 = 1 + i * 0.32, z1 = z0 + 0.32, x0 = VPX + side * 230 / z0, x1 = VPX + side * 230 / z1;
          const top0 = VPY - 150 / z0, bot0 = VPY + 150 / z0, top1 = VPY - 150 / z1, bot1 = VPY + 150 / z1;
          const f = clamp(0.45 + 0.55 * (1 - 1.3 / Math.pow(z0, 0.9)), 0.45, 1), xa = Math.min(x0, x1), w = Math.abs(x0 - x1);
          if (w < 0.5) continue;
          const back = mix(D.n1, FOG, f);
          for (let xx = 0; xx < w; xx++) {
            const k = side > 0 ? 1 - xx / w : xx / w, tp = lerp(top1, top0, k), bt2 = lerp(bot1, bot0, k), hh = bt2 - tp;
            R(g, xa + xx, tp, 1, hh, back);
            for (let s2 = 0; s2 < 7; s2++) {   // shelf rows of blank tape spines
              const sy = tp + hh * (s2 / 7), sh2 = hh / 7, [a] = SPINES[wrap(i * 37 + s2 * 11 + Math.floor(xx / Math.max(1, 3 / z0)), 400)];
              if (a < 0.08) continue;   // a gap where a tape is out
              R(g, xa + xx, sy + sh2 * 0.16, 1, sh2 * 0.8, mix(TAPES[Math.floor(a * 4)], FOG, f));
              if (a > 0.5) R(g, xa + xx, sy + sh2 * 0.36, 1, Math.max(1, sh2 * 0.22), mix(mix(D.paperD, D.n3, 0.45), FOG, Math.min(1, f + 0.08)));
              R(g, xa + xx, sy + sh2 - 1, 1, 1, mix(WOODS[1], FOG, f));
            }
          }
          R(g, side < 0 ? xa : xa + w - 1, top0, 1, bot0 - top0, mix(WOODS[1], FOG, f));
        }
        poly(g, [[VPX - 6, VPY + 4], [VPX + 6, VPY + 4], [VPX + 250, 300], [VPX - 250, 300]], mix(D.n1, D.n0, 0.4));
        for (let k = -3; k <= 3; k++) PX.line(g, VPX + k * 2, VPY + 6, VPX + k * 70, 300, mix(D.n1, D.n2, 0.3));
        for (let z = 12; z >= 1.2; z -= 1.1) { const y = VPY - 150 / z, w = 30 / z; A(g, 0.4 / z + 0.06, () => R(g, VPX - w, y, w * 2, 1, mix(D.n3, D.lamp, 0.2))); }
      });
      // ---- mid: corkboard of borrower cards (left wall; same layer as the strings) ----
      {
        const CORK = [mix(D.paperD, D.rust[2], 0.4), mix(D.paperD, D.rust[2], 0.6), mix(D.rust[2], D.n2, 0.5)];
        R(g, 8, 52, 142, 140, WOODS[2]); R(g, 12, 56, 134, 132, dk(CORK[1], 0.5)); R(g, 8, 52, 142, 1, WOODS[0]);
        for (let i = 0; i < 50; i++) R(g, 14 + ((i * 53) % 130), 58 + ((i * 29) % 128), 1, 1, dk(CORK[0], 0.45));
        CARDS.forEach(([x, y, grp, who]) => {
          const lit = t >= Q[grp] ? P(t, Q[grp], 0.5) : 0;
          R(g, x + 1, y + 1, 30, 24, SH(0.4)); R(g, x, y, 30, 24, mix(dk(D.paper, 0.4), dk(D.paper, 0.1), lit)); R(g, x, y, 30, 1, dk(D.paper, 0.2));
          avatar(g, x + 3, y + 5, who + 3, D.n2, 0.4 - lit * 0.3);
          R(g, x + 15, y + 7, 12, 1, dk(D.paperD, 0.45)); R(g, x + 15, y + 10, 9, 1, dk(D.paperD, 0.45)); R(g, x + 15, y + 13, 11, 1, dk(D.paperD, 0.45));
          R(g, x + 14, y - 1, 3, 3, [D.rust[2], D.moss[2], D.steel[2]][grp]); R(g, x + 14, y - 1, 1, 1, [D.rust[1], D.moss[1], D.steel[1]][grp]);
        });
      }
      // ---- the hanging lamp (the only warm light) ----
      PX.glow(g, CX, 220, 200, D.lampD, 0.3);
      R(g, CX, 0, 1, 40, D.n3);
      poly(g, [[CX - 16, 54], [CX - 8, 40], [CX + 9, 40], [CX + 17, 54]], mix(D.moss[2], D.n2, 0.55)); R(g, CX - 8, 40, 17, 1, mix(D.moss[1], D.n3, 0.5)); R(g, CX - 16, 54, 34, 2, mix(D.moss[2], D.n1, 0.45));
      R(g, CX - 12, 56, 25, 1, D.lamp); R(g, CX - 6, 57, 13, 1, lt(D.lamp, 0.5));
      for (let rr = 0; rr < 200; rr++) { const w = 28 + rr * 1.5; A(g, 0.06 * (1 - rr / 200), () => R(g, CX - w / 2, 57 + rr, w, 1, D.lamp)); }
      // ---- strings from cards to piles (behind the clerk) ----
      CARDS.forEach(([x, y, grp], n) => {
        const [px, py] = PILES[grp], tx = px + 8 + (n % 3) * 4, ty = py - 14;
        const lit = t >= Q[grp] ? P(t, Q[grp], 0.5) : 0, col = mix(mix(D.n5, D.paperD, 0.3), D.cream, lit), x0 = x + 15, y0 = y + 24;
        A(g, 0.32 + 0.4 * lit, () => { let lx = x0, ly = y0; for (let s2 = 1; s2 <= 18; s2++) { const k = s2 / 18, sx = lerp(x0, tx, k), sy = lerp(y0, ty, k) + Math.sin(k * Math.PI) * (14 + (n % 4) * 5); PX.line(g, Math.round(lx), Math.round(ly), Math.round(sx), Math.round(sy), col); lx = sx; ly = sy; } });
      });
      // event state: which tapes have landed on which pile; the active event
      const piles = [2, 1, 2];
      let act = null;
      for (const [t0, p] of EV) { const e = (t - t0) / ks; if (e >= 1.4) piles[p]++; if (e >= 0 && e < EVD && !act) act = [t0, p, e >= 1.4]; }
      // ---- the clerk (drawn before the counter top so the counter hides the waist) ----
      const SK = SKIN.T, HAIR = [mix(D.n7, D.paper, 0.35), mix(D.n6, D.paperD, 0.3), mix(D.n5, D.n4, 0.4)], CARD = [mix(D.moss[1], D.n4, 0.55), mix(D.moss[2], D.n3, 0.5), mix(D.moss[2], D.n1, 0.62)];
      const BAND = [D.rust[1], D.rust[2], dk(D.rust[2], 0.35)];
      const SY0 = CY - 70, LR = [CX - 25, CY - 3], RR = [CX + 25, CY - 3], CHEST = [CX + 8, CY - 44];
      let lh = LR.slice(), rh = RR.slice(), held = null, tilt = Math.sin(t * 0.6) * 1.2, feel = 0, lean = 0;
      const L2 = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
      if (act) {
        const [t0, p, landed] = act, e = (t - t0) / ks, dst = [PILES[p][0] + 12, PILES[p][1] - 10 - (piles[p] - (landed ? 1 : 0)) * 5], crate = [CRATE[0] + 10, CRATE[1] - 26];
        if (e < 0.4) rh = L2(RR, crate, PX.ease(e / 0.4, "io"));
        else if (e < 0.85) { rh = L2(crate, CHEST, PX.ease((e - 0.4) / 0.45, "io")); held = rh; }
        else if (e < 1.05) { rh = CHEST.slice(); held = rh; feel = 1; }
        else if (e < 1.4) { const k = PX.ease((e - 1.05) / 0.35, "io");
          if (p > 0) { rh = L2(CHEST, dst, k); held = rh; } else { lh = L2(L2(LR, CHEST, clamp(k * 3, 0, 1)), dst, clamp(k * 1.5 - 0.5, 0, 1)); rh = k < 1 / 3 ? CHEST.slice() : L2(CHEST, RR, (k - 1 / 3) * 1.5); held = k < 1 / 3 ? CHEST : lh; } }
        else { const k = PX.ease((e - 1.4) / 0.15, "io"); if (p > 0) rh = L2(dst, RR, k); else lh = L2(dst, LR, k); }
        if (e >= 0.6 && e < 1.2) tilt = 3.5 * Math.sin(clamp((e - 0.6) / 0.6, 0, 1) * Math.PI);
        lean = (rh[0] - RR[0]) * 0.08 + (lh[0] - LR[0]) * 0.08;
      } else { rh = [RR[0] - 4, RR[1] - Math.max(0, Math.sin(t * 2.2)) * 3]; feel = Math.max(0, Math.sin(t * 2.2)) * 0.6; }
      const ln = Math.round(lean), bx = CX + ln, tl = Math.round(tilt), hx = bx + tl, hy = SY0 - 44;
      // torso
      for (let rr = 0; rr < 76; rr++) { const w = Math.round(rr < 6 ? 40 + rr * 2 : 52), yy = SY0 - 2 + rr, x = bx - w / 2 + Math.round(-ln * rr / 76);
        R(g, x, yy, w, 1, CARD[1]); R(g, x, yy, 3, 1, CARD[0]); R(g, x + w - 7, yy, 7, 1, CARD[2]); }
      for (let rr = 0; rr < 34; rr++) { const w = Math.max(2, 16 - Math.round(rr * 0.42)); R(g, bx - w / 2, SY0 - 2 + rr, w, 1, mix(D.paper, D.n4, 0.3)); }
      R(g, bx - 1, SY0 + 32, 2, 42, CARD[2]); for (let k = 0; k < 3; k++) R(g, bx + 3, SY0 + 38 + k * 11, 2, 2, D.n6);
      R(g, bx - 20, SY0 + 12, 11, 7, mix(D.paper, D.n4, 0.35)); R(g, bx - 20, SY0 + 12, 11, 1, D.paper);   // blank name badge
      R(g, bx - 20, SY0 - 2, 40, 2, mix(CARD[0], D.lamp, 0.35));
      // neck + head
      R(g, bx - 5, hy + 32, 10, 12, SK[1]); R(g, bx - 5, hy + 32, 10, 3, SK[2]);
      const face = (y0) => { for (let rr = y0; rr < 34; rr++) { const w = rr < 24 ? 28 : 28 - Math.round((rr - 24) * 1.7); R(g, hx - w / 2, hy + rr, w, 1, SK[1]); R(g, hx + w / 2 - 5, hy + rr, 5, 1, SK[2]); R(g, hx - w / 2, hy + rr, 2, 1, SK[0]); } };
      face(0);
      R(g, hx - 16, hy + 14, 3, 9, SK[1]); R(g, hx + 13, hy + 14, 3, 9, SK[2]); R(g, hx - 15, hy + 16, 1, 5, SK[2]);   // ears
      // hair: short grey cap with a side part, lamp light on top
      PX.circle(g, hx, hy + 1, 15, HAIR[1]); face(6);
      R(g, hx - 15, hy + 1, 3, 13, HAIR[1]); R(g, hx + 12, hy + 1, 3, 11, HAIR[2]); R(g, hx - 13, hy + 5, 10, 2, HAIR[1]); R(g, hx - 6, hy + 5, 4, 1, HAIR[1]); R(g, hx + 5, hy + 5, 8, 1, HAIR[2]);
      R(g, hx - 8, hy - 13, 13, 2, HAIR[0]); R(g, hx - 11, hy - 10, 7, 1, HAIR[0]); R(g, hx + 3, hy - 12, 1, 12, HAIR[2]); R(g, hx + 6, hy - 6, 6, 1, HAIR[2]);
      // brows (raise when a label lands), blindfold, nose, mouth
      let lastQ = -1; for (let k = 0; k < 3; k++) if (t >= Q[k]) lastQ = k;
      const raise = Q.reduce((m, q) => Math.max(m, t >= q && t < q + 1.0 ? Math.sin(((t - q) / 1.0) * Math.PI) : 0), 0);
      const bu = Math.round(raise * 2.5);
      R(g, hx - 11, hy + 12 - bu, 8, 2, HAIR[2]); R(g, hx + 3, hy + 12 - bu, 8, 2, HAIR[2]);
      if (lastQ === 2 && !raise) { R(g, hx - 4, hy + 11, 1, 1, HAIR[2]); R(g, hx + 3, hy + 11, 1, 1, HAIR[2]); }   // worried inner brows
      R(g, hx - 15, hy + 15, 30, 7, BAND[1]); R(g, hx - 15, hy + 15, 30, 1, BAND[0]); R(g, hx - 15, hy + 21, 30, 1, BAND[2]);
      for (let k = 0; k < 5; k++) R(g, hx - 12 + k * 6, hy + 18, 3, 1, dk(BAND[1], 0.15));
      const sw = Math.round(Math.sin(t * 1.4) * 1.5);
      R(g, hx + 13, hy + 16, 4, 5, BAND[1]); limb(g, hx + 16, hy + 19, hx + 21 + sw, hy + 32, 3, BAND[1]); limb(g, hx + 15, hy + 20, hx + 17 + sw, hy + 35, 3, BAND[2]);
      R(g, hx - 1, hy + 22, 3, 4, SK[2]); R(g, hx - 1, hy + 25, 4, 1, dk(SK[2], 0.2));
      const my = hy + 28, MC = dk(SK[2], 0.45);
      if (lastQ === 2) { R(g, hx - 3, my, 6, 1, MC); R(g, hx - 4, my + 1, 1, 1, MC); R(g, hx + 3, my + 1, 1, 1, MC); }
      else if (lastQ === 0) { R(g, hx - 3, my + 1, 6, 1, MC); R(g, hx - 4, my, 1, 1, MC); R(g, hx + 3, my, 1, 1, MC); }
      else if (lastQ === 1) R(g, hx - 2, my, 4, 2, dk(SK[2], 0.55));
      else R(g, hx - 3, my, 6, 1, MC);
      // ---- counter ----
      R(g, -10, CY, 660, 9, WOODS[0]); R(g, -10, CY, 660, 1, lt(WOODS[0], 0.3)); R(g, -10, CY + 9, 660, 2, WOODS[3]);
      PX.vgrad(g, -10, CY + 11, 660, 100, WOODS[2], WOODS[3], 5);
      for (let x = -10; x < 650; x += 92) { PX.box(g, x + 8, CY + 22, 78, 100, mix(WOODS[1], WOODS[2], 0.4)); R(g, x + 9, CY + 23, 76, 1, mix(WOODS[1], D.lampD, 0.2)); }
      A(g, 0.22, () => ell(g, CX, CY + 4, 160, 5, D.lamp));
      // arms over the counter (shoulder -> elbow -> hand)
      const arm = (sx, sy, h, out) => {
        const dx = h[0] - sx, dy = h[1] - sy, dist = Math.hypot(dx, dy), L = dist / 2 + 2.5, b = Math.sqrt(Math.max(0, L * L - (dist / 2) * (dist / 2)));
        const ex = sx + dx / 2 + (-dy / (dist || 1)) * b * out, ey = sy + dy / 2 + (dx / (dist || 1)) * b * out;
        limb(g, sx, sy, ex, ey, 11, CARD[1]); limb(g, ex, ey, h[0], h[1], 9, CARD[1]); limb(g, sx - 3, sy, ex - 3, ey, 2, CARD[0]);
        R(g, h[0] - 6, h[1] - 3, 8, 4, mix(D.paper, CARD[1], 0.4));   // shirt cuff
        R(g, h[0] - 3, h[1] - 3, 7, 6, SK[1]); R(g, h[0] - 3, h[1] - 3, 7, 1, SK[0]); R(g, h[0] + 2, h[1] - 2, 2, 4, SK[2]);
      };
      // piles + crate + the idle tape
      PILES.forEach(([px, py], k) => { A(g, 0.5, () => R(g, px - 2, py - 1, 32, 2, SH(1)));
        const n0 = Math.min(piles[k], 7); for (let n = 0; n < n0; n++) tapeFlat(g, px + ((n * 5) % 3) - 1, py - 5 - n * 5, k * 3 + n, n === n0 - 1); });
      const [kx, ky] = CRATE;
      R(g, kx - 2, ky - 18, 30, 18, WOODS[1]); R(g, kx - 2, ky - 18, 30, 1, WOODS[0]); R(g, kx - 2, ky - 9, 30, 1, WOODS[2]);
      for (let n = 0; n < 4; n++) { const c2 = TAPES[wrap(n, 4)]; R(g, kx + 1 + n * 6, ky - 28 + (n % 2) * 2, 5, 12, c2); R(g, kx + 1 + n * 6, ky - 28 + (n % 2) * 2, 5, 1, lt(c2, 0.3)); R(g, kx + 2 + n * 6, ky - 25 + (n % 2) * 2, 3, 4, mix(D.paper, c2, 0.4)); }
      tapeFlat(g, CX + 12, CY - 5, 7, true);
      arm(bx - 22, SY0 + 2, lh, 1); arm(bx + 22, SY0 + 2, rh, -1);
      if (held) tapeHeld(g, held[0], held[1] - 6);
      if (feel > 0) R(g, rh[0] + 3, rh[1] - 8 - Math.round(feel * 2), 2, 3, SK[1]);
      // ---- labels: little paper cards pinned on the counter front under each pile ----
      const LAB = ["COOKING?", "FOOTBALL?", "SADNESS?"];
      PILES.forEach(([px], k) => { if (t < Q[k]) return; const a = P(t, Q[k], 0.4), w = LAB[k].length * 8 + 10, x = px + 13 - w / 2, y = CY + 22 - Math.round((1 - a) * 6);
        A(g, a, () => { R(g, x + 2, y + 2, w, 15, SH(0.5)); R(g, x, y, w, 15, D.paper); R(g, x, y, w, 1, lt(D.paper, 0.5)); R(g, x, y + 14, w, 1, D.paperD); R(g, x + w / 2 - 1, y + 1, 3, 2, D.rust[2]);
          PX.text(g, LAB[k], px + 13, y + 4, { size: 8, col: D.ink, align: "center" }); }); });
      dust(g, t, [250, 70, 160, 170], 61, 22);
      PX.vignette(g, 0.58);
    };
  };
  // ===================================================================================================
  // strangers (8.5): a night city plaza seen from straight above. Faint strangers walk their own curving routes; at
  // o.converge (3.0) the routes light up and show they all end at the same few lit doorways, where You also arrives.
  K.strangers = (o) => {
    const DOORS = [[176, 60], [330, 60], [486, 60]];
    const r = PX.rnd(97), W = [];
    for (let i = 0; i < 24; i++) {
      const side = r(); let sx, sy;
      if (side < 0.3) { sx = -12; sy = 120 + r() * 230; } else if (side < 0.6) { sx = 652; sy = 120 + r() * 230; } else { sx = 30 + r() * 580; sy = 372; }
      const dI = i % 3, [dx, dy] = DOORS[dI];
      W.push({ sx, sy, cx: 90 + r() * 460, cy: 130 + r() * 170, dx: dx + (r() - 0.5) * 8, dy: dy + 6, sp: 0.05 + r() * 0.03, ph: r(), tone: r(), dI });
    }
    const bez = (w, p) => { const q = 1 - p; return [q * q * w.sx + 2 * q * p * w.cx + p * p * w.dx, q * q * w.sy + 2 * q * p * w.cy + p * p * w.dy]; };
    const YW = { sx: 300, sy: 372, cx: 250, cy: 190, dx: 330, dy: 70 };
    const TREES = [[70, 150, 22], [96, 300, 26], [572, 170, 24], [548, 316, 22], [250, 330, 16], [418, 126, 14]];
    const LAMPS = [[150, 200], [500, 220], [330, 290], [40, 236], [610, 260]];
    const ROOF = (() => { const rr = PX.rnd(5), a = []; for (let i = 0; i < 18; i++) a.push([rr() * 640, 6 + rr() * 36, 8 + rr() * 18, 5 + rr() * 9, rr()]); return a; })();
    // top-down walker: x, y, heading angle, step phase, colours
    const walker = (g, x, y, ang, ph, body, head, a, big) => A(g, a, () => {
      const s = big ? 1.25 : 1, cs = Math.cos(ang), sn = Math.sin(ang), step = Math.sin(ph) * 2.2 * s;
      A(g, 0.45, () => ell(g, x + 2, y + 2, Math.round(4 * s), Math.round(3 * s), SH(1)));
      for (const sg of [-1, 1]) { const fx = x + cs * step * sg + (-sn) * 2 * sg * s, fy = y + sn * step * sg + cs * 2 * sg * s; R(g, fx - 1, fy - 1, 2, 2, dk(body, 0.45)); }
      // shoulders as an ellipse across the heading
      for (let k = -3; k <= 3; k++) { const px = x + (-sn) * k * s * 1.1, py = y + cs * k * s * 1.1; PX.circle(g, Math.round(px - cs * 0.5), Math.round(py - sn * 0.5), Math.round(2 * s), Math.abs(k) === 3 ? dk(body, 0.2) : body); }
      R(g, Math.round(x - sn * -3 * s - cs * 2), Math.round(y + cs * -3 * s - sn * 2), 2, 1, lt(body, 0.25));
      PX.circle(g, Math.round(x + cs * 0.8), Math.round(y + sn * 0.8), Math.round(2.4 * s), head); R(g, Math.round(x + cs * 0.8) - 1, Math.round(y + sn * 0.8) - 2, 2, 1, lt(head, 0.3));
    });
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const TC = bt(o, "converge", 3.0, d, 8.5), cv = P(t, TC, 1.2, "io");
      // ---- ground: wet paving at night ----
      PX.par(g, c, 0.85, () => {
        const T0 = mix(D.n2, D.steel[2], 0.14), T1 = mix(T0, D.n1, 0.25), LN = mix(D.n1, T0, 0.3);
        R(g, -20, -20, 680, 400, T0);
        for (let y = 50; y < 380; y += 22) for (let x = -20; x < 680; x += 22) { const h = Math.sin(x * 3.1 + y * 7.7) * 999, f = h - Math.floor(h); if (f < 0.3) R(g, x + 1, y + 1, 21, 21, T1); }
        for (let y = 50; y < 380; y += 22) R(g, -20, y, 680, 1, LN); for (let x = -20; x < 680; x += 22) R(g, x, 50, 1, 330, LN);
        // wet sheen patches
        for (const [x, y, w] of [[214, 236, 60], [420, 300, 70], [90, 210, 40]]) A(g, 0.045, () => ell(g, x, y, w, Math.round(w * 0.3), D.steel[0]));
        // lamp pools (cool white)
        for (const [lx, ly] of LAMPS) { PX.glow(g, lx, ly, 46, mix(D.cream, D.steel[0], 0.5), 0.16); }
        // fountain
        const FX = 430, FY = 210;
        PX.circle(g, FX, FY, 30, mix(D.n3, D.n4, 0.4)); PX.circle(g, FX, FY, 27, mix(D.teal[2], D.n1, 0.45));
        for (let k = 0; k < 3; k++) { const rr = ((t * 6 + k * 9) % 26); A(g, 0.35 * (1 - rr / 26), () => ringPx(g, FX, FY, Math.round(rr), D.teal[0])); }
        PX.circle(g, FX, FY, 5, mix(D.n4, D.n5, 0.5)); R(g, FX - 1, FY - 1, 2, 2, D.teal[0]);
        // benches
        for (const [bx, by, v] of [[250, 140, 0], [120, 262, 1], [520, 270, 0]]) { if (v) { R(g, bx, by, 6, 24, WOODS[2]); R(g, bx, by, 6, 1, WOODS[0]); } else { R(g, bx, by, 26, 6, WOODS[2]); R(g, bx, by, 26, 1, WOODS[0]); } }
      });
      // ---- buildings along the top (roofs) with three doorways spilling warm light ----
      PX.par(g, c, 0.95, () => {
        R(g, -20, -20, 680, 78, mix(D.n1, D.n0, 0.3)); R(g, -20, 56, 680, 2, D.n3); R(g, -20, 58, 680, 2, D.n0);
        for (const [x, y, w, h, k] of ROOF) { R(g, x, y, w, h, mix(D.n2, D.n1, k * 0.5)); R(g, x, y, w, 1, D.n3); if (k > 0.7) R(g, x + 2, y + 2, w - 4, h - 4, mix(D.teal[2], D.n1, 0.6)); }
        for (const x of [100, 254, 410, 566]) R(g, x, -20, 2, 78, D.n0);   // party walls
        DOORS.forEach(([dx, dy], k) => {
          const on = 0.35 + 0.65 * cv + 0.05 * Math.sin(t * 1.3 + k);
          for (let rr = 0; rr < 56; rr++) { const w = 14 + rr * 0.9; A(g, 0.22 * on * (1 - rr / 56), () => R(g, dx - w / 2, dy + rr, w, 1, D.lamp)); }
          R(g, dx - 8, dy - 4, 16, 5, mix(D.lampD, D.lamp, on)); R(g, dx - 8, dy - 4, 16, 1, lt(D.lamp, 0.4 * on)); R(g, dx - 10, dy - 5, 2, 7, D.n3); R(g, dx + 8, dy - 5, 2, 7, D.n3);
          PX.glow(g, dx, dy, 26, D.lamp, 0.16 + 0.22 * on);
        });
      });
      // ---- the routes: hidden until converge, then faint threads all running into the doors ----
      if (cv > 0) for (const w of W) for (let s2 = 0; s2 <= 90; s2++) { const k = s2 / 90, [x, y] = bez(w, k); if (k > cv * 1.3) break; A(g, cv * (0.06 + 0.34 * k * k), () => R(g, x, y, 1, 1, mix(D.cream, D.lamp, 0.4 * k))); }
      // ---- the strangers ----
      for (const w of W) {
        const p = (((t * w.sp + w.ph) % 1) + 1) % 1, [x, y] = bez(w, p), [x2, y2] = bez(w, Math.min(1, p + 0.01));
        const a = clamp(p / 0.06, 0, 1) * clamp((1 - p) / 0.06, 0, 1) * (0.75 + 0.25 * cv);
        // footstep trail
        for (let k = 1; k <= 8; k++) { const pp = p - k * 0.012; if (pp < 0) break; const [tx, ty] = bez(w, pp); A(g, a * 0.18 * (1 - k / 9), () => R(g, tx, ty, 1, 1, D.cream)); }
        const body = mix([D.n5, D.steel[2], mix(D.rust[2], D.n3, 0.5), mix(D.moss[2], D.n3, 0.5), D.n4, mix(D.paperD, D.n3, 0.5)][Math.floor(w.tone * 6)], D.n2, 0.15), head = [mix(D.n1, D.ink, 0.5), mix(D.rust[2], D.n1, 0.4), D.n5][Math.floor(w.tone * 17) % 3];
        walker(g, x, y, Math.atan2(y2 - y, x2 - x), t * 7 + w.ph * 20, body, head, a * 0.8);
      }
      // ---- You: arrives at the middle door at the converge beat ----
      const yp = TC <= d ? clamp((t - (TC - 3)) / 3, 0, 1) : clamp(t / 14, 0, 0.6);
      const ye = 0.2 + 0.8 * PX.ease(yp, "io"), [yx, yy] = bez(YW, ye), [yx2, yy2] = bez(YW, Math.min(1, ye + 0.01));
      for (let k = 1; k <= 14; k++) { const pp = ye - k * 0.012; if (pp < 0.12) break; const [tx, ty] = bez(YW, pp); A(g, 0.35 * (1 - k / 15), () => R(g, tx, ty, 1, 1, D.amber[0])); }
      A(g, 0.5, () => ringPx(g, yx, yy, 8, D.cream));
      const ph = (((t % 2.2) + 2.2) % 2.2) / 2.2; A(g, 0.3 * (1 - ph), () => ringPx(g, yx, yy, Math.round(9 + ph * 7), D.amber[0]));
      walker(g, yx, yy, yp >= 1 ? -Math.PI / 2 : Math.atan2(yy2 - yy, yx2 - yx), yp >= 1 ? 0 : t * 8, D.amber[1], YOUHAIR[1], 1, true);
      PX.glow(g, yx, yy, 18, D.amber[1], 0.12);
      // ---- near layer: tree canopies and lamp heads (closest to the camera) ----
      PX.par(g, c, 1.0, () => {
        for (const [tx, ty, tr] of TREES) {
          A(g, 0.4, () => PX.circle(g, tx + 6, ty + 6, tr, SH(1)));
          const sw = Math.round(Math.sin(t * 0.6 + tx) * 1);
          PX.circle(g, tx + sw, ty, tr, mix(D.moss[2], D.n1, 0.72)); PX.circle(g, tx - 3 + sw, ty - 3, tr - 5, mix(D.moss[2], D.n1, 0.62));
          for (let k = 0; k < 9; k++) { const an = k * 2.4, rr = tr * 0.6; PX.circle(g, Math.round(tx + Math.cos(an) * rr + sw), Math.round(ty + Math.sin(an) * rr), 4, k % 2 ? mix(D.moss[2], D.n1, 0.55) : mix(D.moss[2], D.n1, 0.8)); }
          R(g, tx - tr * 0.5 + sw, ty - tr * 0.6, 6, 1, mix(D.moss[1], D.steel[1], 0.4));
        }
        for (const [lx, ly] of LAMPS) { PX.circle(g, lx, ly, 3, D.n3); R(g, lx - 1, ly - 1, 2, 2, lt(D.steel[0], 0.6)); PX.glow(g, lx, ly, 10, mix(D.cream, D.steel[0], 0.5), 0.35); }
      });
      PX.particles(g, 71, 14, t, [0, 60, 640, 300], { vx: 9, vy: 3, col: mix(D.moss[2], D.paperD, 0.4), a: 0.5, tw: 2, size: 2 });   // drifting leaves
      PX.vignette(g, 0.6);
    };
  };
  // ===================================================================================================
  // sparse (16): the spreadsheet on a wall-sized display pulls back (o.zoom 0.4, 2 s) until it is a vast dark grid with
  // a few lit cells, like stars; a lone analyst stands under it. "100 MILLION RATINGS" (o.c1 2.5), "480,000 CUSTOMERS"
  // (o.c2 4.5), "18,000 MOVIES" (o.c3 6.5); o.empty (10.0) "99% EMPTY" as most lit cells dim further.
  const hsh = (i, j, a, b) => { const h = Math.sin(i * a + j * b) * 43758.5453; return h - Math.floor(h); };
  K.sparse = (o) => {
    const AX = 320, AY = 150, FLOOR = 318;
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const k16 = d / 16, TZ = o.zoom ?? 0.4 * k16, ZD = 2.0 * Math.min(1, k16 * 1.5);
      const T1 = bt(o, "c1", 2.5, d, 16), T2 = bt(o, "c2", 4.5, d, 16), T3 = bt(o, "c3", 6.5, d, 16), TE = bt(o, "empty", 10.0, d, 16);
      const zk = PX.ease(clamp((t - TZ) / ZD, 0, 1), "io");
      const s = Math.max(3, Math.round(22 * Math.pow(3 / 22, zk)));
      const drift = Math.max(0, t - TZ - ZD) * 1.6, ax = Math.round(AX - drift * 0.6), ay = Math.round(AY - drift * 0.25);
      const em = P(t, TE, 2.0, "io");
      // ---- the wall-sized display ----
      R(g, -20, -20, 680, FLOOR + 20, mix(D.n1, D.teal[2], 0.1));
      PX.glow(g, 320, 160, 330, D.teal[2], 0.12);
      const i0 = Math.floor((-10 - ax) / s) - 1, i1 = Math.ceil((650 - ax) / s) + 1, j0 = Math.floor((-10 - ay) / s) - 1, j1 = Math.ceil((FLOOR - ay) / s) + 1;
      // grid lines: every cell while close, only every 10th cell once far
      const gA = clamp((s - 4) / 10, 0, 1);
      for (let i = i0; i <= i1; i++) { const x = ax + i * s - 1, major = wrap(i, 10) === 0; const a = major ? Math.max(gA, 0.5) * 0.5 : gA * 0.6; if (a > 0.02) A(g, a, () => R(g, x, -20, 1, FLOOR + 20, mix(D.teal[2], D.n2, 0.3))); }
      for (let j = j0; j <= j1; j++) { const y = ay + j * s - 1, major = wrap(j, 10) === 0; const a = major ? Math.max(gA, 0.5) * 0.5 : gA * 0.6; if (a > 0.02 && y < FLOOR) A(g, a, () => R(g, -20, y, 680, 1, mix(D.teal[2], D.n2, 0.3))); }
      // lit cells (ratings): identity fixed per cell, so the grid can shrink around them
      for (let j = j0; j <= j1; j++) { const y = ay + j * s; if (y >= FLOOR - 1) continue;
        for (let i = i0; i <= i1; i++) {
          if (i === 0 && j === 0) continue;
          const h = hsh(i, j, 127.1, 311.7); if (h > 0.06) continue;
          const keep = h < 0.015, tw = 0.75 + 0.25 * Math.sin(t * (1 + h * 30) + i * 1.7 + j);
          const a = (keep ? 1 : 1 - em * 0.82) * tw, cream = hsh(i, j, 269.5, 183.3) > 0.6;
          const col = cream ? mix(D.cream, D.steel[0], 0.35) : D.teal[0], x = ax + i * s;
          A(g, a, () => {
            if (s >= 6) { const p = Math.max(1, Math.round(s * 0.18)); R(g, x + p, y + p, s - 2 * p - 1, s - 2 * p - 1, cream ? mix(D.steel[1], D.cream, 0.4) : D.teal[1]); R(g, x + p, y + p, s - 2 * p - 1, 1, col); }
            else { R(g, x + 1, y + 1, 1, 1, col); if (keep && s >= 3) { R(g, x, y + 1, 3, 1, mix(col, D.n1, 0.5)); R(g, x + 1, y, 1, 3, mix(col, D.n1, 0.5)); R(g, x + 1, y + 1, 1, 1, col); } }
          });
        } }
      // the YOU cell at the anchor
      youDot(g, ax + Math.floor(s / 2), ay + Math.floor(s / 2), t, 1, s > 8);
      // ---- labels ----
      const dimOld = 1 - em * 0.6;
      if (t >= T1) label(g, "100 MILLION RATINGS", 320, 52, P(t, T1, 0.5) * dimOld, D.cream, 8);
      if (t >= T2) { const a = P(t, T2, 0.6) * dimOld, ex = P(t, T2, 0.8, "io");
        A(g, a * 0.8, () => { const y0 = 150 - 110 * ex, y1 = 150 + 110 * ex; R(g, 96, y0, 1, y1 - y0, D.cream); R(g, 96, y0, 5, 1, D.cream); R(g, 96, y1, 5, 1, D.cream); });
        label(g, "480,000", 150, 132, a, D.cream, 8); label(g, "CUSTOMERS", 150, 144, a, D.cream, 8); }
      if (t >= T3) { const a = P(t, T3, 0.6) * dimOld, ex = P(t, T3, 0.8, "io");
        A(g, a * 0.8, () => { const x0 = 320 - 210 * ex, x1 = 320 + 210 * ex; R(g, x0, 302, x1 - x0, 1, D.cream); R(g, x0, 297, 1, 5, D.cream); R(g, x1, 297, 1, 5, D.cream); });
        label(g, "18,000 MOVIES", 320, 286, a, D.cream, 8); }
      if (t >= TE) label(g, "99% EMPTY", 320, 196, P(t, TE + 0.6, 0.6), D.amber[0], 16);
      // ---- floor + the lone analyst under the grid ----
      R(g, -20, FLOOR, 680, 60, D.n0); R(g, -20, FLOOR, 680, 1, mix(D.n3, D.teal[2], 0.5));
      A(g, 0.12, () => { for (let rr = 0; rr < 30; rr++) A(g, 1 - rr / 30, () => R(g, -20, FLOOR + 1 + rr, 680, 1, D.teal[2])); });
      analyst(g, 556, 354, t, -1);
      PX.vignette(g, 0.55);
    };
  };
  // ===================================================================================================
  // no_twin (6): top-down on a light table in a dark room: your film strip and a would-be twin's strip share almost no
  // cells; a postcard of a beach city waits beside them. Thin lines try to join the rows and fail (o.fail 2.5); a "?"
  // stamp lands on the postcard just after.
  K.no_twin = (o) => {
    const TX = 64, TY = 44, TW = 512, TH = 262;
    const SX0 = 128, CWd = 26, NCc = 15, YR = 98, WR = 196;
    const MINE = [0, 2, 3, 6, 9, 11, 13], THEIRS = [1, 4, 6, 8, 12, 14];   // one shared column (6)
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const TF = bt(o, "fail", 2.5, d, 6), TA = TF - 1.4;
      // ---- dark desk (far) ----
      PX.par(g, c, 0.6, () => {
        PX.vgrad(g, -20, -20, 680, 400, mix(WOODS[2], D.n1, 0.55), mix(WOODS[3], D.n0, 0.4), 6);
        for (let y = -20; y < 380; y += 7) A(g, 0.25, () => R(g, -20, y + Math.round(Math.sin(y * 0.13) * 2), 680, 1, mix(WOODS[2], D.n1, 0.4)));
        // coffee mug from above + a pencil + sticky note
        A(g, 0.5, () => PX.circle(g, 606, 330, 17, SH(1))); PX.circle(g, 602, 326, 16, mix(D.cream, D.n4, 0.45)); PX.circle(g, 602, 326, 12, mix(D.rust[2], D.n0, 0.55)); R(g, 617, 322, 7, 7, mix(D.cream, D.n4, 0.5));
        A(g, 0.2, () => R(g, 597, 321, 4, 2, D.cream));
        PX.line(g, 20, 330, 60, 316, D.amber[2]); PX.line(g, 20, 331, 60, 317, dk(D.amber[2], 0.3)); R(g, 58, 315, 3, 2, D.paper); R(g, 18, 330, 3, 2, D.rust[2]);
        // index cards and an unrelated strip lying on the desk
        for (let k = 0; k < 3; k++) { R(g, 6 + k * 3, 30 + k * 4, 46, 30, mix(D.paper, D.n3, 0.5 + k * 0.1)); R(g, 6 + k * 3, 30 + k * 4, 46, 1, mix(D.paper, D.n3, 0.35)); }
        poly(g, [[-10, 250], [40, 236], [44, 250], [-6, 264]], mix(D.n2, D.steel[2], 0.3));
        R(g, 600, 30, 30, 28, mix(D.amber[0], D.n3, 0.55)); R(g, 600, 30, 30, 1, mix(D.amber[0], D.n3, 0.4)); for (let l = 0; l < 3; l++) R(g, 604, 38 + l * 5, 20, 1, mix(D.amber[2], D.n3, 0.5));
      });
      // ---- light table ----
      const flick = 0.97 + 0.03 * Math.sin(t * 13) * Math.sin(t * 3.1);
      PX.glow(g, TX + TW / 2, TY + TH / 2, 360, mix(D.glass, D.steel[1], 0.4), 0.14 * flick);
      A(g, 0.6, () => R(g, TX - 4, TY + TH + 6, TW + 14, 6, SH(1)));
      R(g, TX - 8, TY - 8, TW + 16, TH + 16, D.n3); R(g, TX - 8, TY - 8, TW + 16, 1, D.n5); R(g, TX - 8, TY + TH + 7, TW + 16, 1, D.n1);
      PX.vgrad(g, TX, TY, TW, TH, mix(D.glass, D.steel[2], 0.2), mix(D.glass, D.steel[2], 0.55), 7);
      A(g, 0.25, () => PX.glow(g, TX + TW * 0.45, TY + TH * 0.4, 220, D.cream, 0.5));
      A(g, 0.12, () => { for (let x = TX + 16; x < TX + TW; x += 32) R(g, x, TY, 1, TH, D.steel[2]); for (let y = TY + 16; y < TY + TH; y += 32) R(g, TX, y, TW, 1, D.steel[2]); });
      // tools on the table: a steel ruler along the top edge and a grease pencil
      A(g, 0.4, () => R(g, TX + 42, TY + 14, 300, 12, SH(1))); R(g, TX + 40, TY + 10, 300, 12, D.n6); R(g, TX + 40, TY + 10, 300, 1, D.n7); R(g, TX + 40, TY + 21, 300, 1, D.n4);
      for (let k = 0; k < 60; k++) R(g, TX + 44 + k * 5, TY + 11, 1, k % 5 ? 3 : 6, D.n3);
      A(g, 0.4, () => limb(g, TX + 392, TY + 32, TX + 452, TY + 18, 5, SH(1))); limb(g, TX + 390, TY + 28, TX + 450, TY + 14, 5, D.rust[2]); limb(g, TX + 390, TY + 27, TX + 450, TY + 13, 1, D.rust[1]); R(g, TX + 450, TY + 12, 4, 3, D.paper);
      // film strips
      const strip = (y, cols, fill, top, who) => {
        A(g, 0.35, () => R(g, SX0 - 26 + 3, y + 3, NCc * CWd + 30, 38, SH(1)));
        R(g, SX0 - 26, y, NCc * CWd + 30, 38, mix(D.n2, D.steel[2], 0.3)); R(g, SX0 - 26, y, NCc * CWd + 30, 1, mix(D.n4, D.glass, 0.3));
        for (let x = SX0 - 22; x < SX0 + NCc * CWd; x += 8) { R(g, x, y + 3, 4, 3, mix(D.glass, D.cream, 0.4)); R(g, x, y + 32, 4, 3, mix(D.glass, D.cream, 0.4)); }
        for (let i = 0; i < NCc; i++) { const x = SX0 + i * CWd; R(g, x, y + 9, CWd - 3, 20, mix(D.n3, D.glass, 0.18)); if (cols.includes(i)) { R(g, x + 2, y + 11, CWd - 7, 16, fill); R(g, x + 2, y + 11, CWd - 7, 1, top); } }
        avatar(g, SX0 - 20, y + 14, who);
      };
      strip(YR, MINE, mix(D.amber[1], D.amber[2], 0.55), D.amber[1], "you");
      strip(WR, THEIRS, mix(D.paper, D.cream, 0.4), D.cream, 9);
      youDot(g, SX0 - 36, YR + 19, t);
      // ---- the attempt: lines reach down from your cells and give up ----
      if (t >= TA) {
        const brk = P(t, TF, 0.7, "out");
        MINE.forEach((i, n) => {
          const x = SX0 + i * CWd + (CWd >> 1) - 2, y0 = YR + 38, full = WR - y0, shared = THEIRS.includes(i);
          const reach = shared ? 1 : 0.25 + 0.35 * ((n * 37) % 10) / 10, gp = P(t, TA + n * 0.08, 0.9, "io") * reach;
          const len = Math.round(full * gp);
          if (t < TF) { const jit = t > TF - 0.35 && PX.blink(t + n * 0.05, 0.1, 0.6); if (!jit && len > 0) { R(g, x, y0, 1, len, D.amber[1]); R(g, x - 1, y0 + len - 1, 3, 2, D.amber[0]); } }
          else if (brk < 1) for (let yy = 0; yy < len; yy += 4) { const fall = brk * (6 + ((yy * 7 + n * 13) % 9)); A(g, 1 - brk, () => R(g, x + ((yy + n) % 3) - 1, y0 + yy + fall, 1, 3, D.amber[1])); }
        });
        // a small rust cross where the join should have been
        if (t >= TF) { const a = P(t, TF, 0.25) * (1 - clamp((t - TF - 1.6) / 0.8, 0, 1)), cx = SX0 + 6 * CWd + (CWd >> 1) - 2, cy = (YR + 38 + WR) / 2;
          A(g, a, () => { for (let k = -5; k <= 5; k++) { R(g, cx + k, cy + k, 2, 2, D.rust[1]); R(g, cx + k, cy - k, 2, 2, D.rust[1]); } }); }
      }
      // ---- the postcard: a beach city ----
      const PXc = 446, PYc = 244 + Math.round((1 - P(t, 0, 0.6)) * 12);
      A(g, 0.5, () => R(g, PXc + 3, PYc + 4, 104, 66, SH(1)));
      R(g, PXc, PYc, 104, 66, D.paper); R(g, PXc, PYc, 104, 1, lt(D.paper, 0.5));
      const ix = PXc + 4, iy = PYc + 4, iw = 96, ih = 58;
      PX.vgrad(g, ix, iy, iw, 26, mix(D.teal[1], D.steel[1], 0.4), mix(D.rose[0], D.amber[0], 0.4), 4);
      PX.circle(g, ix + 70, iy + 22, 6, lt(D.amber[0], 0.3));
      R(g, ix, iy + 26, iw, 14, D.teal[1]); for (let k = 0; k < 5; k++) R(g, ix + 6 + k * 18, iy + 29 + (k % 2) * 4, 8, 1, D.teal[0]);
      R(g, ix, iy + 40, iw, 18, mix(D.paper, D.amber[0], 0.3)); R(g, ix, iy + 40, iw, 1, D.cream);
      for (const [bx, bw, bh] of [[6, 10, 14], [18, 8, 20], [28, 12, 10], [42, 7, 16]]) { R(g, ix + bx, iy + 26 - bh, bw, bh, D.cream); R(g, ix + bx + bw - 2, iy + 26 - bh, 2, bh, D.paperD); for (let wy = 3; wy < bh - 2; wy += 4) R(g, ix + bx + 2, iy + 26 - bh + wy, 2, 2, mix(D.teal[2], D.n3, 0.3)); }
      PX.line(g, ix + 82, iy + 50, ix + 86, iy + 30, WOODS[2]); for (const [dx, dy] of [[-8, 2], [7, 1], [-5, -3], [5, -4]]) PX.line(g, ix + 86, iy + 30, ix + 86 + dx, iy + 30 + dy + 3, mix(D.moss[2], D.n2, 0.3));
      // the "?" stamp
      const TS2 = TF + 0.7;
      if (t >= TS2) {
        const k = P(t, TS2, 0.18, "out"), sx = PXc + 78, sy = PYc + 6, sh = t < TS2 + 0.15 ? 1 : 0;
        A(g, 0.85 * k, () => { ringPx(g, sx + 12, sy + 12, 12, D.rust[1]); ringPx(g, sx + 12, sy + 12, 11, D.rust[1]); ringPx(g, sx + 12, sy + 12, 9, mix(D.rust[1], D.paper, 0.4));
          PX.text(g, "?", sx + 13, sy + 4 + sh, { size: 16, col: D.rust[1], align: "center" });
          const rr = PX.rnd(9); for (let i = 0; i < 14; i++) R(g, sx + rr() * 24, sy + rr() * 24, 1, 1, D.paper); });
      }
      // ---- the loupe drifting over the twin's strip (always alive) ----
      const lx = Math.round(170 + 260 * (0.5 + 0.5 * Math.sin(t * 0.35 + 0.8))), ly = WR + 19;
      A(g, 0.35, () => { ringPx(g, lx + 4, ly + 5, 16, SH(1)); ringPx(g, lx + 4, ly + 5, 15, SH(1)); limb(g, lx + 15, ly + 16, lx + 30, ly + 35, 5, SH(1)); });
      A(g, 0.14, () => PX.circle(g, lx, ly, 14, D.cream));
      ringPx(g, lx, ly, 16, D.n2); ringPx(g, lx, ly, 15, D.n4); ringPx(g, lx, ly, 14, D.n2);
      limb(g, lx + 11, ly + 11, lx + 26, ly + 30, 5, D.n2); limb(g, lx + 11, ly + 11, lx + 26, ly + 30, 2, D.n4);
      R(g, lx - 8, ly - 9, 4, 1, D.cream); R(g, lx - 10, ly - 7, 1, 3, D.cream);
      dust(g, t, [80, 40, 480, 260], 77, 16, D.cream);
      PX.vignette(g, 0.55);
    };
  };
})();
