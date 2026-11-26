/* Math film, Builder D: the Gauss story. Documentary palette PX.D only: whitewashed plaster, dark oak, slate, warm
   morning light from small leaded windows on the left. No mascot, no labels.
   Kinds: old_school, slow_add, quick_slate, pattern_eyes. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, P = PX.p;

  // ---------- colour + shape helpers ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A0 = hx(a), B0 = hx(b); k = clamp(k, 0, 1); return "#" + A0.map((v, i) => Math.round(v + (B0[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const sh3 = (c) => [mix(c, D.lamp, 0.3), c, mix(c, D.n0, 0.45)];
  const ell = (g, cx, cy, rx, ry, col) => { g.fillStyle = col; for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
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
  // convex hull (monotone chain) for light shafts
  const hull = (pts) => {
    const p = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lo = [], up = [];
    for (const q of p) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
    for (const q of p.reverse()) { while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
    return lo.slice(0, -1).concat(up.slice(0, -1));
  };
  const A = (g, a, fn) => { if (a <= 0) return; const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const clipPoly = (g, pts, fn) => { g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip(); fn(); g.restore(); };
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  // extra parallax inside an already-parallaxed layer (dd = depth difference)
  const parIn = (g, c, dd, fn) => { g.save(); g.translate(Math.round((c.x - PX.LW / 2) * dd), Math.round((c.y - PX.LH / 2) * dd)); fn(); g.restore(); };
  // option time resolver: o[k] if a number, else the default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  const dust = (g, seed, n, t, box, col, a) => PX.particles(g, seed, n, t, box, { vy: -1.4, vx: 1.6, col: col || D.lamp, a: a === undefined ? 0.45 : a, tw: 1.2 });

  // ---------- materials ----------
  const OAK = () => { const w = mix(mix(D.rust[2], D.amber[2], 0.35), D.n1, 0.42); return [mix(w, D.lamp, 0.22), w, mix(w, D.n0, 0.45)]; };
  const PLASTER = () => mix(mix(D.paper, D.paperD, 0.45), mix(D.n3, D.rust[2], 0.3), 0.42);
  const SLATE = () => mix(D.n1, D.moss[2], 0.18);
  const CHALK = () => mix(D.cream, D.n6, 0.08);
  const SUN = () => D.lamp;

  // ---------- hand-written chalk glyphs (9 rows, slanted when drawn) ----------
  const GL = {
    "1": ["..#..", ".##..", "#.#..", "..#..", "..#..", "..#..", "..#..", "..#..", ".###."],
    "2": [".###.", "#...#", "....#", "...#.", "..#..", ".#...", "#....", "#....", "#####"],
    "3": [".###.", "#...#", "....#", "..##.", "....#", "....#", "....#", "#...#", ".###."],
    "0": [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
    "+": [".....", ".....", "..#..", "..#..", "#####", "..#..", "..#..", ".....", "....."],
    "=": [".....", ".....", ".....", "####.", ".....", ".####", ".....", ".....", "....."],
    "…": [".......", ".......", ".......", ".......", ".......", ".......", ".......", "#..#..#", "#..#..#"],
  };
  const glW = (ch) => (GL[ch] ? GL[ch][0].length + 2 : 3);
  const chalkW = (str) => [...str].reduce((s, ch) => s + glW(ch), 0) - 2;
  // draw str with k characters revealed (float: the current one fills top to bottom). Returns the pen tip [x, y].
  const chalkText = (g, str, x, y, k, col, seed) => {
    let cx = x, pen = [x, y + 6];
    [...str].forEach((ch, i) => {
      const gl = GL[ch], p = clamp(k - i, 0, 1);
      if (gl && p > 0) {
        const jy = Math.round((hash(i, seed || 1) - 0.5) * 2), rows = Math.ceil(p * gl.length);
        for (let r = 0; r < rows; r++) for (let q = 0; q < gl[r].length; q++) if (gl[r][q] === "#") {
          const sl = Math.floor((gl.length - 1 - r) / 4), px = cx + q + sl, py = y + r + jy, h = hash(px * 3 + i, py + (seed || 1));
          A(g, h < 0.14 ? 0.5 : 0.95, () => R(g, px, py, 1, 1, col));
          if (h > 0.6) A(g, 0.3, () => R(g, px + 1, py, 1, 1, col));
        }
        pen = [cx + gl[0].length / 2 + 1, y + rows + jy];
      } else if (p > 0) pen = [cx + 1, y + 6];
      cx += glW(ch);
    });
    return pen;
  };

  // ---------- people ----------
  const SKIN = () => { const s = mix(D.rose[0], D.lampD, 0.35); return [mix(s, D.cream, 0.3), s, mix(s, D.rust[2], 0.45)]; };
  const SKINS = () => [mix(D.rose[0], D.lampD, 0.35), mix(D.rose[0], D.paper, 0.45), mix(D.lampD, D.rust[2], 0.35), mix(D.rose[1], D.lampD, 0.4)];
  const HAIRS = () => [mix(D.rust[2], D.n1, 0.4), mix(D.n0, D.rust[2], 0.3), mix(D.paperD, D.amber[2], 0.5), mix(mix(D.rust[2], D.amber[2], 0.3), D.n1, 0.3), mix(D.n1, D.n3, 0.4), mix(mix(D.amber[2], D.rust[2], 0.6), D.n1, 0.35)];
  const COATS = () => [mix(D.steel[2], D.n2, 0.4), mix(D.moss[2], D.n2, 0.45), mix(D.rust[2], D.n2, 0.5), mix(D.paperD, D.n3, 0.62), mix(D.n3, D.amber[2], 0.18), mix(D.teal[2], D.n2, 0.45), mix(D.amber[2], D.n2, 0.55)];
  const SHIRT = () => mix(D.paper, D.n5, 0.42);
  // light-haired small boy (young Gauss) colours, shared by quick_slate, pattern_eyes and old_school
  const GAUSS = () => ({ hair: mix(D.paperD, D.amber[1], 0.38), coat: mix(D.amber[2], D.n2, 0.48), shirt: SHIRT(), skin: mix(D.rose[0], D.lampD, 0.25) });

  // boy seen from behind on a bench. x = centre, y = shoulder line, m = px per metre. v = look.
  // bend 0..1 (over the slate), turn -1..1 (head turn, cheek shows), write 0..1 (right arm moving)
  const backBoy = (g, x, y, m, t, v, bend, turn, write) => {
    const u = m / 100, rr = (n) => Math.max(1, Math.round(n * u));
    const [cL, c, cD] = sh3(v.coat), [hL, h, hD] = sh3(v.hair), sk = v.skin, skD = mix(sk, D.n0, 0.3);
    const tw = Math.round(30 * u * v.w), th = Math.round(38 * u), ys = Math.round(y + bend * 3 * u), rc = rr(4);
    const jx = write > 0 ? Math.round(Math.sin(t * 11 + v.ph) * 1.2 * u * write) : 0, jy = write > 0 ? Math.round(Math.abs(Math.sin(t * 15 + v.ph)) * u * write) : 0;
    const sl = v.vest ? v.shirt : c, slD = v.vest ? mix(v.shirt, D.n0, 0.35) : cD, slL = v.vest ? mix(v.shirt, D.lamp, 0.35) : cL;
    // right arm (writing): elbow out to the right, sleeve
    const ax = Math.round(x + tw / 2 - rr(3) + jx + bend * 2 * u), ay = ys + rr(4) + jy;
    R(g, ax, ay, rr(7), rr(20), sl); R(g, ax + rr(5), ay + 1, rr(2), rr(18), slD);
    // left arm, resting forward (shadow side is the right; light from the left)
    R(g, x - Math.round(tw / 2) - rr(2), ys + rr(4), rr(6), rr(19), sl); R(g, x - Math.round(tw / 2) - rr(2), ys + rr(4), rr(1), rr(19), slL);
    // torso, slightly tapered to the waist
    R(g, x - tw / 2, ys + rc, tw, th - rc, c); R(g, x - tw / 2 + rc, ys, tw - 2 * rc, rc, c); R(g, x - tw / 2 + 1, ys + 1, tw - 2, rc, c);
    R(g, x - tw / 2, ys + rc, rr(2), th - rc, cL); R(g, x - tw / 2 + rc, ys, Math.round(tw / 2), 1, cL);
    R(g, x + tw / 2 - rr(5), ys + rc, rr(5), th - rc, cD); R(g, x - tw / 2, ys + th - rr(3), tw, rr(3), cD);
    if (u > 0.6) R(g, x + rr(1), ys + rr(7), 1, rr(24), cD);   // back seam
    if (v.braces && u > 0.6) { R(g, x - rr(8), ys, rr(3), th, mix(D.n1, D.rust[2], 0.3)); R(g, x + rr(5), ys, rr(3), th, mix(D.n1, D.rust[2], 0.3)); }
    if (v.vest && u > 0.6) { R(g, x - tw / 2, ys + rr(1), rr(4), rr(10), slL); R(g, x + tw / 2 - rr(4), ys + rr(1), rr(4), rr(10), sl); }   // shirt shoulders around the waistcoat
    // collar (shirt) + neck
    const hr = Math.max(3, Math.round(10.5 * u * v.hs)), hy = Math.round(ys - hr * 0.85 + bend * hr * 0.75);
    R(g, x - rr(6), ys - rr(2), rr(12), rr(3), v.shirt); R(g, x - rr(6), ys - rr(2), rr(5), 1, mix(v.shirt, D.lamp, 0.4));
    if (bend < 0.7) R(g, x - rr(3), ys - rr(5), rr(6), rr(4), skD);
    // ears
    const tx = Math.round(turn * hr * 0.35);
    R(g, x - hr - 1 + tx, hy - 1, rr(2), rr(4), turn < -0.3 ? sk : mix(sk, D.lamp, 0.15)); R(g, x + hr - rr(1) + tx, hy - 1, rr(2), rr(4), skD);
    // head
    ell(g, x + tx, hy, hr, hr + (u > 0.7 ? 1 : 0), h);
    // cheek + nose when the head turns (looking to a neighbour or at the master)
    if (Math.abs(turn) > 0.3) {
      const sgn = turn > 0 ? 1 : -1, ex = x + tx + sgn * (hr - rr(2));
      R(g, Math.min(ex, ex + sgn * rr(2)), hy - rr(1), rr(3), rr(6), sgn > 0 ? skD : sk);
      R(g, ex + sgn * rr(3) - (sgn < 0 ? rr(1) : 0), hy + rr(1), rr(1), rr(2), sgn > 0 ? skD : sk);
    }
    // shaggy hair: highlight on the lit (left) crown, darker nape strands, cowlick
    R(g, x + tx - hr + 2, hy - hr + 2, Math.max(1, hr - 2), 1, hL); R(g, x + tx - hr + 1, hy - hr + 3, Math.max(1, Math.round(hr * 0.5)), 1, hL);
    R(g, x + tx + 2, hy + hr - 2, Math.max(1, hr - 3), 1, hD); R(g, x + tx + hr - 2, hy - 2, 2, Math.max(1, hr), hD);
    if (u > 0.5) for (let k = 0; k < 5; k++) { const sx = x + tx - hr + 2 + Math.floor(hash(v.ph, k) * (2 * hr - 3)); R(g, sx, hy + hr - 1, 1, rr(2) + (k % 2), k % 2 ? hD : h); }
    R(g, x + tx - 1, hy - hr - (u > 0.8 ? 1 : 0), rr(2), 1, h);
  };

  // schoolmaster, about 104 px, feet at (x, y). pose "front" | "back". o: brow 0 stern..1 raised, walk frame, cane mode,
  // hand [x, y] (back pose: chalk hand on the board), hidden below yCut (lectern in front)
  const master = (g, x, y, t, o) => {
    x = Math.round(x); y = Math.round(y);
    const coat = mix(D.rust[2], D.n2, 0.4), [cL, c, cD] = sh3(coat), vest = mix(D.amber[2], D.paperD, 0.25), [vL, vv, vD] = sh3(vest);
    const breech = mix(D.rust[2], D.n1, 0.55), stock = mix(D.paper, D.n6, 0.3), stockL = D.paper;
    const [sL, sk, sD] = SKIN(), wig = mix(D.n6, D.paper, 0.4), [wL, wg, wD] = [mix(wig, D.cream, 0.35), wig, mix(wig, D.n3, 0.45)];
    const cane = mix(D.amber[2], D.rust[2], 0.3), wf = o.walk || 0;
    A(g, 0.4, () => ell(g, x, y, 14, 2, "#000000"));
    // legs: stockings + buckled shoes, breeches
    const l1 = wf === 1 ? -1 : 0, l2 = wf === 2 ? -1 : 0;
    R(g, x - 7, y - 21 + l1, 5, 18, stock); R(g, x - 7, y - 21 + l1, 1, 18, stockL); R(g, x + 2, y - 21 + l2, 5, 18, mix(stock, D.n2, 0.25));
    R(g, x - 9, y - 3 + l1, 8, 3, D.n1); R(g, x + 1, y - 3 + l2, 8, 3, D.n1); R(g, x - 6, y - 3 + l1, 2, 1, D.amber[2]); R(g, x + 4, y - 3 + l2, 2, 1, D.amber[2]);
    R(g, x - 8, y - 36, 16, 16, breech); R(g, x - 1, y - 30, 1, 10, mix(breech, D.n0, 0.4)); R(g, x - 8, y - 22, 6, 2, mix(breech, D.n0, 0.3)); R(g, x + 2, y - 22, 6, 2, mix(breech, D.n0, 0.3));
    const back = o.pose === "back";
    // coat: shoulders at y-84, skirts flare to the knee
    const body = [[x - 12, y - 84], [x + 12, y - 84], [x + 14, y - 56], [x + 17, y - 30], [x - 17, y - 30], [x - 14, y - 56]];
    poly(g, body, c);
    poly(g, [[x - 12, y - 84], [x - 9, y - 84], [x - 12, y - 56], [x - 15, y - 31], [x - 17, y - 31], [x - 14, y - 56]], cL);
    poly(g, [[x + 9, y - 84], [x + 12, y - 84], [x + 14, y - 56], [x + 17, y - 31], [x + 13, y - 31], [x + 11, y - 56]], cD);
    R(g, x - 17, y - 31, 34, 1, cD);
    if (!back) {
      // open front: ochre waistcoat with buttons, coat facings
      poly(g, [[x - 5, y - 82], [x + 5, y - 82], [x + 6, y - 46], [x + 1, y - 42], [x - 1, y - 42], [x - 6, y - 46]], vv);
      R(g, x - 5, y - 82, 2, 36, vL); R(g, x + 4, y - 80, 2, 34, vD);
      for (let k = 0; k < 6; k++) R(g, x, y - 79 + k * 6, 1, 1, D.amber[0]);
      PX.line(g, x - 6, y - 82, x - 9, y - 31, cD); PX.line(g, x + 6, y - 82, x + 9, y - 31, cD);
      for (let k = 0; k < 5; k++) { R(g, x - 9, y - 76 + k * 8, 1, 1, D.amber[1]); R(g, x + 8, y - 76 + k * 8, 1, 1, D.amber[2]); }
      R(g, x - 13, y - 56, 6, 2, cD); R(g, x + 7, y - 56, 6, 2, cD);   // pocket flaps
    } else {
      // back: centre vent, two waist buttons, pleats
      R(g, x, y - 52, 1, 22, cD); R(g, x - 3, y - 54, 1, 1, D.amber[2]); R(g, x + 3, y - 54, 1, 1, D.amber[2]);
      PX.line(g, x - 4, y - 52, x - 8, y - 32, cD); PX.line(g, x + 4, y - 52, x + 8, y - 32, cD);
    }
    // arms
    const sleeve = (ax, ay, bx, by, lit) => { const n = Math.ceil(Math.hypot(bx - ax, by - ay)); for (let i = 0; i <= n; i++) { const q = i / n; R(g, Math.round(lerp(ax, bx, q)) - 2, Math.round(lerp(ay, by, q)) - 2, 5, 5, c); if (lit) R(g, Math.round(lerp(ax, bx, q)) - 2, Math.round(lerp(ay, by, q)) - 2, 1, 4, cL); } };
    const cuff = (hx2, hy2) => { R(g, hx2 - 3, hy2 - 4, 7, 3, mix(c, D.lamp, 0.2)); R(g, hx2 - 3, hy2 - 1, 7, 1, stock); R(g, hx2 - 2, hy2, 4, 4, sk); R(g, hx2 - 2, hy2 + 3, 4, 1, sD); };
    if (!back) {
      // his right arm (our left) holds the cane; tap = hand rises and the cane taps his left palm
      const tap = o.cane === "tap" ? Math.max(0, Math.sin(t * 7.5)) : 0;
      const rhx = x - 14 + Math.round(tap * 4), rhy = y - 50 - Math.round(o.cane === "tap" ? 10 + tap * 3 : 0);
      sleeve(x - 13, y - 80, rhx, rhy - 4, true); cuff(rhx, rhy);
      const lhx = x + 13 - (o.cane === "tap" ? 6 : 0), lhy = y - 50 - (o.cane === "tap" ? 8 : 0);
      sleeve(x + 13, y - 80, lhx, lhy - 4, false); cuff(lhx, lhy);
      if (o.cane === "tap") { const ex = lhx + 3, ey = lhy - 2 - Math.round((1 - tap) * 6); PX.line(g, rhx, rhy + 2, ex + (ex - rhx) * 0.25, ey + (ey - rhy) * 0.25, cane); PX.line(g, rhx + 1, rhy + 2, ex + 1 + (ex - rhx) * 0.25, ey + (ey - rhy) * 0.25, mix(cane, D.n0, 0.35)); }
      else if (o.cane !== "none") { PX.line(g, rhx - 1, rhy + 2, rhx - 5, y, cane); PX.line(g, rhx, rhy + 2, rhx - 4, y, mix(cane, D.n0, 0.35)); }
    } else {
      const hd = o.hand || [x + 24, y - 92];
      sleeve(x + 11, y - 80, hd[0] - 2, hd[1] + 5, false); cuff(hd[0] - 1, hd[1] + 1); R(g, hd[0], hd[1] - 1, 2, 2, CHALK());
      sleeve(x - 12, y - 80, x - 8, y - 50, true); cuff(x - 8, y - 48);   // left hand behind, holding the cane
      PX.line(g, x - 8, y - 46, x - 18, y - 6, cane);
    }
    // neck stock
    if (!back) { R(g, x - 4, y - 89, 9, 6, stock); R(g, x - 4, y - 89, 9, 1, stockL); R(g, x - 2, y - 83, 5, 6, stockL); R(g, x - 1, y - 78, 3, 2, stock); }
    else { R(g, x - 5, y - 88, 11, 4, c); R(g, x - 4, y - 88, 9, 1, mix(stock, D.n3, 0.3)); }   // coat collar
    // head
    const hx0 = x - 6, hy0 = y - 106;
    if (!back) {
      R(g, hx0, hy0 + 2, 13, 16, sk); R(g, hx0 + 1, hy0 + 1, 11, 1, sk); R(g, hx0 + 1, hy0 + 18, 11, 1, sk);
      R(g, hx0, hy0 + 2, 1, 14, sL); R(g, hx0 + 11, hy0 + 4, 2, 14, sD); R(g, hx0 + 1, hy0 + 16, 3, 2, sD); R(g, hx0 + 9, hy0 + 16, 3, 2, sD);   // jowls
      // brows: stern (inner ends low); raised = his left brow (our right) arches up
      const br = mix(D.n4, D.n2, 0.4), rb = Math.round((o.brow || 0) * 3);
      R(g, hx0 + 1, hy0 + 7, 2, 1, br); R(g, hx0 + 3, hy0 + 8, 2, 1, br);
      if (rb === 0) { R(g, hx0 + 8, hy0 + 8, 2, 1, br); R(g, hx0 + 10, hy0 + 7, 2, 1, br); }
      else { R(g, hx0 + 8, hy0 + 7 - rb, 4, 1, br); R(g, hx0 + 8, hy0 + 8 - rb, 1, 1, br); R(g, hx0 + 11, hy0 + 8 - rb, 1, 1, br); }
      // eyes (whites + pupils); the raised side opens wider
      const blink = PX.blink(t + 0.7, 3.9, 0.05), lk = 1 + clamp(Math.round(o.look || 0), -1, 1);
      if (blink || o.down) { R(g, hx0 + 2, hy0 + 10, 3, 1, sD); R(g, hx0 + 8, hy0 + 10, 3, 1, sD); if (o.down) { R(g, hx0 + 2, hy0 + 11, 3, 1, mix(sD, D.n0, 0.3)); R(g, hx0 + 8, hy0 + 11, 3, 1, mix(sD, D.n0, 0.3)); } }
      else {
        R(g, hx0 + 2, hy0 + 10, 3, 1, D.cream); R(g, hx0 + 2 + lk, hy0 + 10, 1, 1, D.n0); R(g, hx0 + 2, hy0 + 9, 3, 1, sD);
        R(g, hx0 + 8, hy0 + 10, 3, 1 + (rb > 0 ? 1 : 0), D.cream); R(g, hx0 + 8 + lk, hy0 + 10, 1, 1 + (rb > 0 ? 1 : 0), D.n0); if (rb === 0) R(g, hx0 + 8, hy0 + 9, 3, 1, sD);
      }
      // long nose, frown
      R(g, hx0 + 6, hy0 + 9, 1, 5, sD); R(g, hx0 + 5, hy0 + 13, 3, 1, sD); R(g, hx0 + 7, hy0 + 10, 1, 3, sL);
      R(g, hx0 + 4, hy0 + 16, 5, 1, mix(sD, D.rust[2], 0.4)); R(g, hx0 + 3, hy0 + 17, 1, 1, sD); R(g, hx0 + 9, hy0 + 17, 1, 1, sD);
      // powdered wig: crown, side rolls over the ears
      R(g, hx0 - 1, hy0 - 1, 15, 4, wg); R(g, hx0 + 1, hy0 - 2, 11, 1, wg); R(g, hx0 + 2, hy0 - 2, 6, 1, wL); R(g, hx0, hy0, 6, 1, wL);
      for (const [rx, sg] of [[hx0 - 3, -1], [hx0 + 13, 1]]) for (let k = 0; k < 2; k++) {
        const ry = hy0 + 6 + k * 5; R(g, rx, ry, 4, 4, wg); R(g, rx, ry + 3, 4, 1, wD); R(g, rx + (sg < 0 ? 0 : 1), ry, 2, 1, wL);
      }
      R(g, hx0 - 2, hy0 + 2, 2, 5, wg); R(g, hx0 + 13, hy0 + 2, 2, 5, wD);
    } else {
      // from behind: wig mass, rolls, the queue tied with a dark ribbon
      R(g, hx0 - 1, hy0 + 14, 15, 4, sD); R(g, hx0 + 1, hy0 + 16, 11, 3, sk);   // nape
      ell(g, x, hy0 + 7, 7, 9, wg); R(g, hx0 + 1, hy0 - 1, 5, 1, wL); R(g, hx0, hy0 + 1, 2, 9, wL); ell(g, x + 4, hy0 + 9, 3, 6, wD); ell(g, x, hy0 + 8, 5, 6, wg);
      for (const rx of [hx0 - 3, hx0 + 13]) for (let k = 0; k < 2; k++) { const ry = hy0 + 6 + k * 5; R(g, rx, ry, 4, 4, wg); R(g, rx, ry + 3, 4, 1, wD); R(g, rx + 1, ry, 2, 1, wL); }
      for (let k = 0; k < 3; k++) R(g, hx0 + 3 + k * 3, hy0 + 2 + k, 1, 5, mix(wg, wD, 0.6));   // combed lines
      R(g, x - 1, hy0 + 17, 3, 2, D.n1); R(g, x - 3, hy0 + 17, 2, 1, D.n1); R(g, x + 2, hy0 + 17, 2, 1, D.n1);   // small dark bow at the collar
    }
  };

  // hourglass (8 x 14) at (x, y) top-left; flip 0..1 (turned over at 0.5); sand: fraction in the top bulb
  const hourglass = (g, x, y, t, flip, sand) => {
    const wd = OAK(), ang = flip > 0 && flip < 1 ? (flip < 0.5 ? 1 : 2) : 0;
    if (ang) { // mid-turn: lying on its side
      R(g, x - 3, y + 6, 14, 2, wd[1]); R(g, x - 3, y + 12, 14, 2, wd[1]); ell(g, x + 1, y + 10, 3, 2, D.glass); ell(g, x + 7, y + 10, 3, 2, D.glass); return;
    }
    R(g, x, y, 9, 2, wd[1]); R(g, x, y, 9, 1, wd[0]); R(g, x, y + 13, 9, 2, wd[1]); R(g, x, y + 14, 9, 1, wd[2]);
    R(g, x, y + 2, 1, 11, wd[2]); R(g, x + 8, y + 2, 1, 11, wd[2]);
    A(g, 0.55, () => { for (let r = 0; r < 5; r++) { const w = 5 - Math.floor(r * 0.8); R(g, x + 4.5 - w / 2, y + 2 + r, w, 1, D.glass); R(g, x + 4.5 - w / 2, y + 12 - r, w, 1, D.glass); } R(g, x + 4, y + 7, 1, 1, D.glass); });
    const sc = mix(D.paper, D.amber[1], 0.35), top = Math.round(clamp(sand, 0, 1) * 4), bot = 4 - top;
    for (let r = 0; r < top; r++) { const w = Math.max(1, 3 - r); R(g, x + 4.5 - w / 2, y + 6 - r, w, 1, sc); }
    for (let r = 0; r < bot; r++) { const w = 5 - r; R(g, x + 4.5 - w / 2, y + 12 - r, w, 1, sc); }
    if (sand > 0.01 && sand < 0.99 && PX.blink(t, 0.2, 0.7)) R(g, x + 4, y + 7, 1, 4, sc);
    R(g, x + 1, y + 3, 1, 3, D.cream);
  };

  // ======================= old_school =======================
  // a 1780s village schoolroom seen from the back: low oak beams, small leaded windows on the left throwing morning
  // light, a tiled stove, the stern schoolmaster at his lectern by the blackboard, boys on benches with slates.
  // o.task (1.0): he goes to the board and writes "1 + 2 + 3 + … + 100", then steps back to the lectern.
  // o.quiet (4.0): the boys bend over their slates (the small light-haired one in the front row keeps looking at the
  // board); at quiet + 2 the master turns the hourglass over, at quiet + 2.9 he strolls out from behind the lectern.
  // Fixed: the writing takes 2.1 s whatever d is.
  K.old_school = (o) => {
    const HZ = 124, KK = 160, HC = 1.6, VX = 330, RW = 2.8, ZF = 2.9;
    const X = (xm, z) => VX + (xm * KK) / z, Y = (hm, z) => HZ + ((HC - hm) * KK) / z;
    const TXT = "1 + 2 + 3 + … + 100", NCH = TXT.length, TW = chalkW(TXT);
    const BX0 = X(-0.45, ZF), BX1 = X(1.95, ZF), BY0 = Y(2.3, ZF), BY1 = Y(1.0, ZF);
    const TX = Math.round((BX0 + BX1) / 2 - TW / 2 - 4), TY = Math.round(BY0 + 7);
    const MZ = 2.7, MY = Math.round(Y(0.12, MZ)), XH = Math.round(X(-1.42, MZ)), LECX = Math.round(X(-1.42, 2.62));
    // pupils: rows of boys (z), left and right of the aisle
    const ROWS = [2.2, 1.8, 1.4, 1.0], rows = [];
    ROWS.forEach((z, k) => {
      const people = [];
      for (const sg of [-1, 1]) for (let i = 0; i < 4; i++) {
        const xm = sg * (0.52 + i * 0.64 + (k % 2 ? 0.12 : 0)); if (Math.abs(xm) > RW - 0.25) continue;
        const r = PX.rnd(300 + k * 41 + i * 7 + (sg > 0 ? 100 : 0));
        const v = { skin: SKINS()[Math.floor(r() * 4)], hair: HAIRS()[Math.floor(r() * 6)], coat: COATS()[Math.floor(r() * 7)], shirt: SHIRT(), vest: r() < 0.3, braces: r() < 0.25,
          w: 0.88 + r() * 0.25, hs: 0.95 + r() * 0.15, ph: r() * 9, lag: r() * 0.7, fid: r(), size: 0.92 + r() * 0.12 };
        if (v.vest && v.braces) v.vest = false;
        const gauss = k === 0 && sg > 0 && i === 0;
        if (gauss) Object.assign(v, GAUSS(), { vest: true, braces: false, size: 0.86, w: 0.85, hs: 0.98 });
        people.push({ xm, v, gauss });
      }
      rows.push({ z, people });
    });
    // left-wall windows (z ranges) and the floor patches their sun throws (sun from the left, slightly from behind us)
    const WINS = [[1.45, 1.8], [2.15, 2.5]], WH0 = 1.0, WH1 = 1.85;
    const SX = 1.35, SZ = -0.22;
    const proj = (xm, hm, z) => [X(xm + hm * SX, z + hm * SZ), Y(0, z + hm * SZ)];
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 9.0), tT = T("task", 1.0), tQ = T("quiet", 4.0);
      const WR = 2.1;
      const go = P(t, tT - 0.75, 0.7, "io"), ret = P(t, tT + WR + 0.35, 0.9, "io");
      const kk = clamp((t - tT) / WR, 0, 1) * NCH;
      const flipT = tQ + 2.0, flip = clamp((t - flipT) / 0.5, 0, 1);
      R(g, 0, 0, 640, 360, D.n1);
      const pl = PLASTER(), wd = OAK(), dk = mix(D.n2, D.rust[2], 0.22);
      // ======== room shell (far layer) ========
      PX.par(g, c, 0.6, () => {
        const fl = [X(-RW, ZF), Y(0, ZF)], fr = [X(RW, ZF), Y(0, ZF)], cl = [X(-RW, ZF), Y(2.6, ZF)], cr = [X(RW, ZF), Y(2.6, ZF)];
        // front wall: plaster above dark wainscot
        PX.vgrad(g, cl[0], cl[1], cr[0] - cl[0], fl[1] - cl[1], mix(pl, dk, 0.35), mix(pl, D.lamp, 0.06), 6);
        const wy = Y(0.95, ZF);
        R(g, cl[0], wy, cr[0] - cl[0], fl[1] - wy, wd[2]); R(g, cl[0], wy, cr[0] - cl[0], 2, wd[1]); R(g, cl[0], wy, cr[0] - cl[0], 1, wd[0]);
        for (let x = cl[0] + 8; x < cr[0]; x += 14) R(g, x, wy + 3, 1, fl[1] - wy - 3, mix(wd[2], D.n0, 0.3));
        // plaster stains + hairline cracks
        A(g, 0.12, () => { ell(g, X(2.2, ZF), Y(2.3, ZF), 14, 6, D.paperD); ell(g, X(-2.3, ZF), Y(1.4, ZF), 9, 12, D.n2); });
        PX.line(g, X(2.4, ZF), Y(2.55, ZF), X(2.25, ZF), Y(2.2, ZF), mix(pl, dk, 0.4)); PX.line(g, X(2.25, ZF), Y(2.2, ZF), X(2.3, ZF), Y(2.0, ZF), mix(pl, dk, 0.4));
        // left wall (receding) with deep-set windows
        const lw = [[X(-RW, 1.0), Y(2.6, 1.0)], cl, fl, [X(-RW, 1.0), Y(0, 1.0)]];
        poly(g, lw, mix(pl, dk, 0.45));
        poly(g, [[X(-RW, 1.0), Y(0.95, 1.0)], [fl[0], wy], fl, [X(-RW, 1.0), Y(0, 1.0)]], mix(wd[2], D.n1, 0.25));
        PX.line(g, X(-RW, 1.0), Y(0.95, 1.0), fl[0], wy, wd[1]);
        // right wall
        const rw = [[X(RW, 1.0), Y(2.6, 1.0)], cr, fr, [X(RW, 1.0), Y(0, 1.0)]];
        poly(g, rw, mix(pl, dk, 0.62));
        poly(g, [[X(RW, 1.0), Y(0.95, 1.0)], [fr[0], wy], fr, [X(RW, 1.0), Y(0, 1.0)]], mix(wd[2], D.n1, 0.45));
        PX.line(g, X(RW, 1.0), Y(0.95, 1.0), fr[0], wy, mix(wd[1], D.n1, 0.4));
        // windows: reveal (deep sill), outside view with its own parallax, leaded panes
        WINS.forEach(([z1, z2], wi) => {
          const q = [[X(-RW, z1), Y(WH1, z1)], [X(-RW, z2), Y(WH1, z2)], [X(-RW, z2), Y(WH0, z2)], [X(-RW, z1), Y(WH0, z1)]];
          const qi = [[X(-RW - 0.25, z1 + 0.04), Y(WH1 - 0.04, z1 + 0.04)], [X(-RW - 0.25, z2 - 0.02), Y(WH1 - 0.04, z2 - 0.02)], [X(-RW - 0.25, z2 - 0.02), Y(WH0 + 0.04, z2 - 0.02)], [X(-RW - 0.25, z1 + 0.04), Y(WH0 + 0.04, z1 + 0.04)]];
          poly(g, q, mix(pl, D.lamp, 0.12));
          clipPoly(g, qi, () => parIn(g, c, 0.3, () => {
            const bx = qi[0][0] - 20, by = qi[0][1] - 30;
            PX.vgrad(g, bx, by, 90, 150, mix(D.steel[0], D.paper, 0.45), mix(D.paper, D.lamp, 0.35), 6);
            // across the lane: a half-timbered house and a lime tree in morning sun
            const hxx = bx + 4 + wi * 14, beam = mix(D.rust[2], D.n3, 0.25), wallC = mix(D.paper, D.paperD, 0.35);
            R(g, hxx, by + 54, 62, 100, wallC); R(g, hxx, by + 54, 62, 2, mix(wallC, D.n3, 0.3));
            for (let k = 0; k < 4; k++) R(g, hxx + k * 20, by + 54, 2, 100, beam);
            R(g, hxx, by + 78, 62, 2, beam); PX.line(g, hxx + 2, by + 56, hxx + 20, by + 78, beam); PX.line(g, hxx + 60, by + 56, hxx + 42, by + 78, beam);
            R(g, hxx + 25, by + 86, 10, 12, mix(D.steel[2], D.n2, 0.3)); R(g, hxx + 25, by + 86, 10, 1, beam);
            poly(g, [[hxx - 6, by + 56], [hxx + 31, by + 22], [hxx + 68, by + 56]], mix(D.rust[2], D.n3, 0.5));
            for (let k = 0; k < 4; k++) PX.line(g, hxx + 31 - k * 8, by + 24 + k * 8, hxx + 31 + k * 8, by + 24 + k * 8, mix(D.rust[2], D.n2, 0.6));
            const tx2 = hxx + (wi ? -6 : 56);
            R(g, tx2 - 1, by + 50, 3, 60, mix(D.n2, D.rust[2], 0.3));
            ell(g, tx2, by + 40, 17, 15, mix(D.moss[2], D.moss[1], 0.5)); ell(g, tx2 - 4, by + 34, 11, 9, mix(D.moss[1], D.lamp, 0.25)); ell(g, tx2 + 6, by + 46, 7, 5, D.moss[2]);
          }));
          // leaded panes
          const mz = (z1 + z2) / 2;
          PX.line(g, X(-RW - 0.25, mz), Y(WH1, mz), X(-RW - 0.25, mz), Y(WH0, mz), mix(D.n2, D.n0, 0.3));
          for (let hk = 1; hk < 4; hk++) { const hm = lerp(WH0, WH1, hk / 4); PX.line(g, X(-RW - 0.25, z1), Y(hm, z1), X(-RW - 0.25, z2), Y(hm, z2), mix(D.n3, D.n0, 0.3)); }
          for (let vk = 1; vk < 4; vk++) { if (vk === 2) continue; const zz = lerp(z1, z2, vk / 4); PX.line(g, X(-RW - 0.25, zz), Y(WH1, zz), X(-RW - 0.25, zz), Y(WH0, zz), mix(D.n3, D.n0, 0.2)); }
          // sill
          poly(g, [[X(-RW, z1), Y(WH0, z1)], [X(-RW, z2), Y(WH0, z2)], [X(-RW + 0.12, z2), Y(WH0 - 0.02, z2)], [X(-RW + 0.12, z1), Y(WH0 - 0.02, z1)]], mix(pl, D.lamp, 0.35));
          PX.glow(g, (q[0][0] + q[2][0]) / 2, (q[0][1] + q[2][1]) / 2, 34, D.lamp, 0.08);
        });
        // ceiling: planks converging to the front wall, then heavy cross beams (drawn later, nearer)
        poly(g, [[-80, -80], [720, -80], cr, cl], mix(wd[1], D.n2, 0.4));
        for (let k = -9; k <= 9; k++) { const xm = k * 0.32; PX.line(g, X(xm, ZF), Y(2.6, ZF), X(xm, 0.6), Y(2.6, 0.6), mix(wd[2], D.n1, 0.3)); }
        A(g, 0.12, () => poly(g, [[-80, -80], [200, -80], [X(-0.6, ZF), cl[1]], cl], D.lamp));
        // floor: broad planks, worn path down the aisle
        poly(g, [fl, fr, [X(RW, 0.8), Y(0, 0.8)], [X(-RW, 0.8), Y(0, 0.8)]], mix(wd[1], D.n2, 0.45));
        for (let k = -9; k <= 9; k++) { const xm = k * 0.31; PX.line(g, X(xm, ZF), Y(0, ZF), X(xm, 0.8), Y(0, 0.8), mix(wd[2], D.n1, 0.3)); }
        A(g, 0.18, () => poly(g, [[X(-0.4, ZF), Y(0, ZF)], [X(0.4, ZF), Y(0, ZF)], [X(0.4, 0.9), Y(0, 0.9)], [X(-0.4, 0.9), Y(0, 0.9)]], mix(wd[0], D.paperD, 0.3)));
        // sun patches on the floor
        WINS.forEach(([z1, z2]) => {
          const pts = [proj(-RW, WH0, z1), proj(-RW, WH0, z2), proj(-RW, WH1, z2), proj(-RW, WH1, z1)];
          A(g, 0.2, () => poly(g, pts, mix(D.lamp, D.paper, 0.2)));
        });
        // ---- the blackboard ----
        R(g, BX0 - 4, BY0 - 4, BX1 - BX0 + 8, BY1 - BY0 + 8, wd[1]); R(g, BX0 - 4, BY0 - 4, BX1 - BX0 + 8, 1, wd[0]); R(g, BX1 + 3, BY0 - 3, 1, BY1 - BY0 + 7, wd[2]);
        R(g, BX0, BY0, BX1 - BX0, BY1 - BY0, SLATE());
        A(g, 0.06, () => { R(g, BX0 + 10, BY0 + 30, 50, 12, D.cream); R(g, BX0 + 90, BY0 + 8, 40, 30, D.cream); R(g, BX0 + 30, BY0 + 6, 30, 5, D.cream); });   // old erasures
        A(g, 0.12, () => R(g, BX0, BY0, 6, BY1 - BY0, D.lamp));
        R(g, BX0 - 6, BY1 + 4, BX1 - BX0 + 12, 3, wd[1]); R(g, BX0 - 6, BY1 + 4, BX1 - BX0 + 12, 1, wd[0]);
        R(g, BX0 + 14, BY1 + 2, 6, 2, CHALK()); R(g, BX1 - 34, BY1 + 2, 4, 2, CHALK()); R(g, BX1 - 22, BY1 + 1, 12, 3, mix(D.paperD, D.n4, 0.4));   // chalk, rag
        // the sum, in chalk
        const pen = chalkText(g, TXT, TX, TY, kk, CHALK(), 3);
        // birch rods on a nail, a shelf with books + inkpot left of the lectern
        const rx = X(2.15, ZF), ry = Y(1.7, ZF);
        R(g, rx, ry - 2, 2, 2, D.n4); for (let k = 0; k < 6; k++) PX.line(g, rx + 1, ry, rx - 6 + k * 3, ry + 34, mix(D.amber[2], D.n2, 0.3 + (k % 2) * 0.2)); R(g, rx - 2, ry + 6, 6, 3, mix(D.rust[2], D.n2, 0.3));
        const sx = X(-2.55, ZF), sy = Y(1.55, ZF);
        R(g, sx, sy, 40, 3, wd[1]); R(g, sx, sy, 40, 1, wd[0]); R(g, sx + 4, sy + 3, 2, 5, wd[2]); R(g, sx + 34, sy + 3, 2, 5, wd[2]);
        [[0, 12, 0], [5, 14, 1], [10, 11, 2], [14, 13, 0]].forEach(([bx, h, ci]) => { const bc = mix([D.rust[2], D.moss[2], D.steel[2]][ci], D.n2, 0.35); R(g, sx + 3 + bx, sy - h, 4, h, bc); R(g, sx + 3 + bx, sy - h, 1, h, mix(bc, D.lamp, 0.3)); });
        R(g, sx + 26, sy - 5, 6, 5, D.n1); R(g, sx + 27, sy - 7, 4, 2, D.n2);
        // ---- tiled stove in the front right corner ----
        const tile = mix(D.moss[2], D.teal[2], 0.3);
        // glazed tiles on a front face (constant z) and a receding side face (constant x)
        const tileFace = (xa, xb, z, h0, h1, nx, ny, base) => {
          const x0 = X(xa, z), x1 = X(xb, z), y0 = Y(h1, z), y1 = Y(h0, z), tw2 = (x1 - x0) / nx, th2 = (y1 - y0) / ny;
          R(g, x0, y0, x1 - x0, y1 - y0, base);
          for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
            const tx2 = Math.round(x0 + i * tw2), ty2 = Math.round(y0 + j * th2), w2 = Math.round(x0 + (i + 1) * tw2) - tx2, h2 = Math.round(y0 + (j + 1) * th2) - ty2;
            R(g, tx2, ty2, w2, 1, mix(base, D.lamp, 0.32)); R(g, tx2, ty2, 1, h2, mix(base, D.lamp, 0.18)); R(g, tx2, ty2 + h2 - 1, w2, 1, mix(base, D.n0, 0.5)); R(g, tx2 + w2 - 1, ty2, 1, h2, mix(base, D.n0, 0.4));
            R(g, tx2 + Math.floor(w2 / 2) - 1, ty2 + Math.floor(h2 / 2) - 1, 2, 2, mix(base, D.lamp, 0.22)); R(g, tx2 + 2, ty2 + 2, 1, 1, mix(base, D.cream, 0.45));
          }
        };
        const sideFace = (xm, za, zb, h0, h1, ny, base) => {
          poly(g, [[X(xm, zb), Y(h1, zb)], [X(xm, za), Y(h1, za)], [X(xm, za), Y(h0, za)], [X(xm, zb), Y(h0, zb)]], base);
          for (let j = 0; j <= ny; j++) { const hm = lerp(h0, h1, j / ny); PX.line(g, X(xm, zb), Y(hm, zb), X(xm, za), Y(hm, za), mix(base, D.n0, 0.45)); }
          for (let i = 1; i < 3; i++) { const zz = lerp(za, zb, i / 3); PX.line(g, X(xm, zz), Y(h1, zz), X(xm, zz), Y(h0, zz), mix(base, D.n0, 0.4)); }
        };
        const s0 = ZF - 0.42, s1 = ZF - 0.02;
        R(g, X(1.98, s0), Y(0.1, s0), X(RW, s0) - X(1.98, s0), Y(0, s0) - Y(0.1, s0), D.n1);   // plinth
        sideFace(2.0, s0, s1, 0.1, 0.92, 4, mix(tile, D.n1, 0.5)); tileFace(2.0, RW, s0, 0.1, 0.92, 4, 4, mix(tile, D.n1, 0.1));
        R(g, X(1.96, s0 - 0.03), Y(0.98, s0), X(RW, s0) - X(1.96, s0 - 0.03), Y(0.92, s0) - Y(0.98, s0), mix(tile, D.n0, 0.3)); R(g, X(1.96, s0 - 0.03), Y(0.98, s0), X(RW, s0) - X(1.96, s0), 1, mix(tile, D.lamp, 0.3));
        sideFace(2.22, s0 + 0.1, s1, 0.98, 1.72, 4, mix(tile, D.n1, 0.5)); tileFace(2.22, RW, s0 + 0.1, 0.98, 1.72, 3, 4, mix(tile, D.n1, 0.14));
        const cz = s0 + 0.07;   // crown cornice
        R(g, X(2.17, cz), Y(1.84, cz), X(RW, cz) - X(2.17, cz), Y(1.72, cz) - Y(1.84, cz), mix(tile, D.n0, 0.25)); R(g, X(2.17, cz), Y(1.84, cz), X(RW, cz) - X(2.17, cz), 1, mix(tile, D.lamp, 0.35));
        R(g, X(2.17, cz), Y(1.76, cz), X(RW, cz) - X(2.17, cz), 1, mix(tile, D.n0, 0.5));
        const dx0 = X(2.2, s0), dy0 = Y(0.5, s0);
        R(g, dx0, dy0, 11, 9, mix(D.amber[2], D.n1, 0.3)); R(g, dx0, dy0, 11, 1, D.amber[1]); R(g, dx0 + 9, dy0 + 4, 1, 2, D.amber[0]);   // brass door
        const flk = 0.5 + 0.5 * Math.sin(t * 9) * Math.sin(t * 3.7);
        A(g, 0.45 + 0.3 * flk, () => { R(g, dx0 + 2, dy0 + 5, 6, 1, D.amber[0]); R(g, dx0 + 2, dy0 + 7, 6, 1, D.rust[0]); });
        PX.glow(g, dx0 + 5, dy0 + 6, 22, D.lampD, 0.1 + 0.05 * flk);
        // stovepipe up into the ceiling
        const spx = X(2.5, ZF - 0.2), spy0 = Y(2.6, ZF - 0.2), spy1 = Y(1.84, ZF - 0.2);
        R(g, spx - 3, spy0, 7, spy1 - spy0, mix(D.n2, D.n0, 0.3)); R(g, spx - 3, spy0, 1, spy1 - spy0, D.n4); R(g, spx - 4, spy0 + 18, 9, 2, D.n2);
        // coat pegs on the right wall with caps and a jacket
        for (let k = 0; k < 4; k++) { const z = 1.3 + k * 0.22, px = X(RW, z), py = Y(1.62, z); R(g, px - 2, py, 3, 2, wd[0]);
          if (k % 2 === 0) { const cc = COATS()[k + 1]; R(g, px - 6, py + 2, 8, 6, mix(cc, D.n1, 0.3)); R(g, px - 7, py + 6, 10, 2, mix(cc, D.n1, 0.5)); }
          else { const cc = COATS()[k + 2]; poly(g, [[px - 3, py + 2], [px + 1, py + 2], [px + 4, py + 34], [px - 9, py + 34]], mix(cc, D.n1, 0.45)); } }
        // ---- the master: lectern, hourglass, figure ----
        const writing = go >= 0.98 && ret <= 0.02 && t >= tT - 0.05 && t < tT + WR + 0.35;
        const penX = kk > 0 ? pen[0] : TX + 2;
        const xw = Math.min(penX - 27, BX1 - 34), mx = lerp(lerp(XH, Math.max(TX - 12, Math.min(xw, TX - 4 + kk * 3.4)), go), XH, ret);
        const pace = P(t, flipT + 0.9, 1.8, "io");   // after turning the hourglass he strolls out from behind the lectern
        const mx2 = mx + pace * 34 * (1 - go * (1 - ret));   // only while he is at home by the lectern
        const walking = (go > 0.02 && go < 0.98) || (ret > 0.02 && ret < 0.98) || (writing && Math.abs(xw - mx) > 2) || (pace > 0.02 && pace < 0.98 && go * (1 - ret) < 0.5);
        const wf = walking ? 1 + (Math.floor(t * 7) % 2) : 0;
        const tap = !writing && !walking && (t < tT - 0.9 || (t > tT + WR + 1.3 && t < tQ + 0.2));
        const reach = flip > 0 && flip < 1;
        master(g, mx2, MY, t, { pose: writing ? "back" : "front", walk: wf, cane: tap || pace >= 1 ? "tap" : "rest", hand: writing ? [Math.round(pen[0] + 1), Math.round(pen[1])] : null, brow: 0 });
        // lectern (in front of him when he is home): panelled box, lip, ledger, hourglass
        const lw2 = 34, lx = LECX - lw2 / 2, ly = Math.round(Y(1.15, 2.62));
        R(g, lx, ly, lw2, MY - ly + 2, wd[1]); R(g, lx, ly, 2, MY - ly + 2, mix(wd[1], D.lamp, 0.25)); R(g, lx + lw2 - 4, ly, 4, MY - ly + 2, wd[2]);
        for (const [py, ph] of [[ly + 6, 22], [ly + 33, 26]]) { R(g, lx + 5, py, lw2 - 12, 1, wd[2]); R(g, lx + 5, py + 1, 1, ph, wd[2]); R(g, lx + 5, py + ph, lw2 - 11, 1, mix(wd[1], D.lamp, 0.2)); R(g, lx + lw2 - 7, py + 1, 1, ph, mix(wd[1], D.lamp, 0.15)); }
        R(g, lx - 3, ly - 3, lw2 + 6, 3, wd[0]); R(g, lx - 3, ly, lw2 + 6, 1, wd[2]); R(g, lx - 3, MY - 2, lw2 + 6, 4, wd[2]);
        R(g, lx + 2, ly - 6, 13, 3, mix(D.paper, D.n4, 0.25)); R(g, lx + 2, ly - 6, 13, 1, D.paper); R(g, lx + 8, ly - 6, 1, 3, mix(D.paper, D.n4, 0.5));   // ledger
        const sand = flip >= 1 ? 1 - clamp((t - flipT - 0.5) / 80, 0, 1) : 0.0;
        hourglass(g, lx + lw2 - 13, ly - 18, t, reach ? flip : 0, sand);
        if (reach) { const [, skH] = SKIN(); R(g, lx + lw2 - 12, ly - 13, 7, 4, mix(D.rust[2], D.n2, 0.4)); R(g, lx + lw2 - 6, ly - 13, 4, 4, skH); }
        // platform step
        R(g, X(-RW, 2.82), MY, X(0.1, 2.82) - X(-RW, 2.82), 3, wd[0]); R(g, X(-RW, 2.82), MY + 3, X(0.1, 2.82) - X(-RW, 2.82), 4, wd[2]);
      });
      // ======== ceiling beams (mid layer) ========
      PX.par(g, c, 0.75, () => {
        for (const z of [2.55, 1.95, 1.4, 1.0]) {
          const yf = Math.round(Y(2.6, z)), yb = Math.round(Y(2.44, z)), yu = Math.round(Y(2.44, z + 0.2));
          // near face (away from the windows, dim), then the underside catching bounce light
          R(g, -60, yf, 760, yb - yf, mix(wd[2], D.n0, 0.15)); R(g, -60, yf, 760, 1, mix(wd[2], D.n0, 0.5));
          for (let k = 0; k < 9; k++) { const px = 10 + k * 80 + Math.round(hash(k, z) * 40); R(g, px, yf + 2, Math.round(20 + hash(z, k) * 30), 1, mix(wd[2], D.n0, 0.4)); }
          R(g, -60, yb, 760, yu - yb, mix(wd[1], D.n2, 0.2)); R(g, -60, yb, 760, 1, mix(wd[0], D.lamp, 0.2));
          A(g, 0.3, () => poly(g, [[-60, yb], [240 - z * 30, yb], [200 - z * 30, yu], [-60, yu]], D.lamp));   // sun bounce on the window side
          R(g, -60, yu, 760, 1, mix(wd[2], D.n0, 0.35));
        }
      });
      // ======== the boys: rows far to near ========
      rows.forEach((row, k) => {
        const z = row.z, m = KK / z, dep = [0.8, 0.86, 0.93, 1.0][k], near = k === 3;
        PX.par(g, c, dep, () => {
          // desk board in front of the row (further than the boys)
          const dz = z + 0.1, dTop = Y(0.74, dz), dTop2 = Y(0.74, dz + 0.22), dFr = Y(0.6, dz);
          for (const sg of [-1, 1]) {
            const a = X(sg * 0.38, dz), b = X(sg * (RW - 0.12), dz), xa = Math.min(a, b), xb = Math.max(a, b);
            const a2 = X(sg * 0.38, dz + 0.22), b2 = X(sg * (RW - 0.12), dz + 0.22);
            poly(g, [[Math.min(a2, b2), dTop2], [Math.max(a2, b2), dTop2], [xb, dTop], [xa, dTop]], mix(wd[1], D.n1, 0.1 * (2 - k)));
            R(g, xa, dTop, xb - xa, dFr - dTop, wd[2]); R(g, xa, dTop, xb - xa, 1, wd[0]);
          }
          row.people.forEach((p, idx) => {
            const v0 = p.v, v = near ? { ...v0, coat: mix(v0.coat, D.n0, 0.3), hair: mix(v0.hair, D.n0, 0.25), skin: mix(v0.skin, D.n1, 0.3), shirt: mix(v0.shirt, D.n1, 0.35) } : v0;
            const x = Math.round(X(p.xm, z)), ys = Math.round(Y(0.8 * v.size, z)), mm = m * v.size;
            // slate on the desk at his right hand
            const sa = p.xm + 0.08, sb = p.xm + 0.3, zn = dz + 0.02, zf = dz + 0.19, hh2 = 0.745;
            poly(g, [[X(sa, zf), Y(hh2, zf)], [X(sb, zf), Y(hh2, zf)], [X(sb, zn), Y(hh2, zn)], [X(sa, zn), Y(hh2, zn)]], mix(wd[0], D.paperD, 0.2));
            poly(g, [[X(sa + 0.02, zf - 0.02), Y(hh2, zf - 0.02)], [X(sb - 0.02, zf - 0.02), Y(hh2, zf - 0.02)], [X(sb - 0.02, zn + 0.02), Y(hh2, zn + 0.02)], [X(sa + 0.02, zn + 0.02), Y(hh2, zn + 0.02)]], SLATE());
            const slx = Math.round(X(sa + 0.03, zn)), sly = Math.round(Y(hh2, zn)) + 1, sw = Math.round(X(sb, zn) - X(sa, zn)), shh = Math.max(3, Math.round(Y(hh2, zn) - Y(hh2, zf)));
            // boys' heads track the master while he writes, then bend to the slates
            const lag = p.gauss ? 1.6 : v.lag;
            let bend = P(t, tQ + lag, 0.6, "io");
            if (p.gauss) bend = 0;   // the small one keeps looking at the board while the others bend
            const scr = clamp((t - tQ - lag - 0.3) / 6, 0, 1);
            if (scr > 0 && m > 90) for (let l = 0; l < 2; l++) { const lw = Math.round((sw - 6) * clamp(scr * 2 - l * 0.6, 0, 1) * (p.gauss ? 0.4 : 1)); if (lw > 0) R(g, slx + 1, sly - shh + 2 + l * 2, lw, 1, mix(CHALK(), SLATE(), 0.4)); }
            const look = ((go > 0 && ret < 1 ? (TX + kk * 4) : XH) - x) / 220;
            const fid = Math.sin(t * 0.9 + v.ph * 2) > 0.82 - v.fid * 0.25 ? (v.fid > 0.5 ? 1 : -1) : clamp(look, -0.6, 0.6) * 0.7;
            const turn = p.gauss && t >= tQ ? clamp(((BX0 + BX1) / 2 - x) / 220, -0.6, 0.6) * 0.8 : lerp(fid, 0, bend);   // the small one keeps his eyes on the board
            const write = p.gauss ? bend * (1 - P(t, tQ + 2.4, 0.2)) : bend;
            backBoy(g, x, ys, mm, t, v, bend, turn, write);
          });
          // bench (nearer than the boys)
          const bz = z - 0.06, bt = Y(0.42, bz), bf = Y(0.3, bz);
          for (const sg of [-1, 1]) {
            const a = X(sg * 0.35, bz), b = X(sg * (RW - 0.15), bz), xa = Math.min(a, b), xb = Math.max(a, b);
            R(g, xa, bt, xb - xa, bf - bt, wd[1]); R(g, xa, bt, xb - xa, 1, wd[0]); R(g, xa, bf, xb - xa, 2, wd[2]);
            for (const lx of [xa + 6, xb - 10]) R(g, lx, bf, Math.max(2, Math.round(m / 40)), Y(0, bz) - bf, wd[2]);
          }
        });
      });
      // ======== light: sun shafts from the windows, dust in them ========
      WINS.forEach(([z1, z2], wi) => {
        const pts = [];
        for (const z of [z1, z2]) for (const hm of [WH0, WH1]) { pts.push([X(-RW, z), Y(hm, z)]); pts.push(proj(-RW, hm, z)); }
        const hp = hull(pts);
        A(g, 0.075, () => poly(g, hp, SUN()));
        A(g, 0.04, () => poly(g, hp, D.cream));
        clipPoly(g, hp, () => dust(g, 40 + wi, 40, t, [0, 60, 400, 260], D.cream, 0.6));
      });
      PX.glow(g, 60, 150, 200, D.lampD, 0.12);
      PX.glow(g, (BX0 + BX1) / 2, (BY0 + BY1) / 2, 120, D.lamp, 0.05);
      PX.vignette(g, 0.55);
    };
  };

  // ---------- side-view children (face right) ----------
  // child head in profile, centre (cx, cy), r ~ 9. o: up 0..1 (chin lifts), down (eyes lowered), mouth "o"
  const headSide = (g, cx, cy, v, t, o) => {
    o = o || {}; cx = Math.round(cx); cy = Math.round(cy);
    const [hL, h, hD] = sh3(v.hair), sk = v.skin, sL = mix(sk, D.cream, 0.25), sD = mix(sk, D.rust[2], 0.45), up = o.up ? 1 : 0;
    // skull + hair mass (back of the head on the left)
    ell(g, cx, cy, 9, 10, h);
    // face plane (right side)
    R(g, cx - 1, cy - 4 - up, 9, 12, sk); R(g, cx + 8, cy - 2 - up, 1, 6, sk); R(g, cx, cy + 8 - up, 6, 2, sk); R(g, cx + 6, cy + 7 - up, 2, 1, sk);
    R(g, cx, cy + 8 - up, 5, 1, sD); R(g, cx - 1, cy + 6 - up, 1, 2, sD); R(g, cx + 7, cy - 3 - up, 1, 3, sL);
    R(g, cx + 9, cy + 1 - up, 1, 3, sk); R(g, cx + 9, cy + 3 - up, 1, 1, sD);   // small nose
    // eye, brow, mouth
    const blink = PX.blink(t + (v.ph || 0), 3.3, 0.05);
    if (o.down || blink) R(g, cx + 4, cy + 1 - up, 3, 1, mix(sD, D.n0, 0.35));
    else { R(g, cx + 4, cy - up, 3, 2, D.cream); R(g, cx + 5 + (o.look || 0), cy - up, 2, 2, D.n0); R(g, cx + 6 + (o.look || 0), cy - up, 1, 1, mix(D.n0, D.n4, 0.6)); }
    R(g, cx + 3, cy - 3 - up - (o.brow ? 1 : 0), 5, 1, hD);
    if (o.mouth === "o") R(g, cx + 6, cy + 5 - up, 2, 2, mix(D.rust[2], D.n0, 0.3));
    else R(g, cx + 5, cy + 5 - up, 3, 1, mix(sD, D.rust[2], 0.4));
    // ear
    R(g, cx - 2, cy, 3, 4, sk); R(g, cx - 1, cy + 1, 1, 2, sD);
    // hair: crown, shaggy fringe over the brow, nape at the back, rim light from the window behind
    R(g, cx - 7, cy - 9, 15, 4, h); R(g, cx - 3, cy - 10, 9, 1, h); R(g, cx, cy - 5, 8, 2, h); R(g, cx + 6, cy - 4, 2, 2, h);
    for (let k = 0; k < 4; k++) R(g, cx + 1 + k * 2, cy - 4 + (k % 2), 1, 2, k % 2 ? hD : h);
    R(g, cx - 9, cy - 4, 6, 12, h); R(g, cx - 8, cy + 7, 4, 2, hD); R(g, cx - 4, cy + 4, 2, 3, hD);
    R(g, cx - 5, cy - 10, 8, 1, hL); R(g, cx - 8, cy - 8, 3, 1, hL); R(g, cx - 9, cy - 5, 1, 7, hL);
  };
  // standing child, feet at (x, y), ~84 px. o: ph walk phase (or null), arms "carry" | "reach" | "back" | "side",
  // reachK 0..1, up (looks up), rock (heel rock px)
  const kidStand = (g, x, y, v, t, o) => {
    x = Math.round(x); y = Math.round(y);
    const [cL, c, cD] = sh3(v.coat), br = mix(D.rust[2], D.n1, 0.5), st = mix(D.paper, D.n5, 0.35), shoe = D.n1;
    const walking = o.ph !== null && o.ph !== undefined, ph = o.ph || 0;
    const bob = walking ? Math.round(Math.abs(Math.sin(ph)) * 1.5) : 0, yy = y - bob - (o.rock || 0);
    A(g, 0.4, () => ell(g, x, y, 10, 2, "#000000"));
    // legs: hip -> knee -> foot, far leg first (darker)
    const leg = (fx, lift, col, sc) => {
      const hx2 = x, hy2 = yy - 36, ax = x + fx, ay = y - 2 - lift, kx = (hx2 + ax) / 2 + 2, ky = (hy2 + ay) / 2;
      for (let i = 0; i <= 8; i++) { const q = i / 8; R(g, Math.round(lerp(hx2, kx, q)) - 2, Math.round(lerp(hy2, ky, q)), 5, 2, br); }
      for (let i = 0; i <= 10; i++) { const q = i / 10; R(g, Math.round(lerp(kx, ax, q)) - 2, Math.round(lerp(ky, ay, q)), 4, 2, col); }
      R(g, Math.round(ax) - 2, Math.round(ay), 7, 3, sc); R(g, Math.round(ax) + 1, Math.round(ay), 2, 1, D.amber[2]);
    };
    const fa = walking ? Math.sin(ph) * 8 : -2, fb = walking ? -Math.sin(ph) * 8 : 3;
    const la = walking && Math.cos(ph) > 0 ? 2 : 0, lb = walking && Math.cos(ph) < 0 ? 2 : 0;
    leg(fb, lb, mix(st, D.n2, 0.3), mix(shoe, D.n0, 0.3)); leg(fa, la, st, shoe);
    // back arm (behind body)
    if (o.arms === "side" || o.arms === "back") { const sw = walking ? Math.round(-Math.sin(ph) * 4) : 0; R(g, x - 3 + sw, yy - 62, 4, 18, cD); R(g, x - 3 + sw, yy - 45, 4, 3, mix(v.skin, D.n0, 0.3)); }
    // torso: jacket with short tails, shirt collar
    R(g, x - 6, yy - 64, 13, 26, c); R(g, x - 7, yy - 44, 6, 6, c); R(g, x - 6, yy - 64, 2, 24, cL); R(g, x + 5, yy - 62, 2, 22, cD);
    R(g, x - 6, yy - 40, 13, 2, cD); R(g, x + 6, yy - 56, 1, 1, D.amber[1]); R(g, x + 6, yy - 50, 1, 1, D.amber[1]);
    R(g, x - 5, yy - 65, 11, 2, cL); R(g, x + 2, yy - 66, 5, 3, v.shirt); R(g, x + 4, yy - 64, 3, 4, v.shirt);
    R(g, x - 1, yy - 68, 5, 4, mix(v.skin, D.rust[2], 0.3));   // neck
    // head
    headSide(g, x + 1, yy - 77 - (o.up ? 1 : 0), v, t, { up: o.up, look: o.up ? 0 : 0, brow: o.brow });
    // front arm
    const sk = v.skin;
    if (o.arms === "carry" || o.arms === "reach") {
      const k = o.arms === "reach" ? o.reachK : 0;
      const hx2 = Math.round(lerp(x + 9, x + 15, k)), hy2 = Math.round(lerp(yy - 50, yy - 64, k));
      for (let i = 0; i <= 8; i++) { const q = i / 8; R(g, Math.round(lerp(x + 1, hx2, q)) - 2, Math.round(lerp(yy - 61, hy2, q)) - 2, 5, 5, c); }
      R(g, hx2 - 1, hy2 - 2, 4, 4, sk); R(g, hx2 - 1, hy2 + 1, 4, 1, mix(sk, D.n0, 0.3));
    } else if (o.arms === "back") { R(g, x - 4, yy - 62, 5, 16, c); R(g, x - 4, yy - 62, 1, 15, cL); R(g, x - 5, yy - 47, 4, 3, sk); }
    else { const sw = walking ? Math.round(Math.sin(ph) * 4) : 0; for (let i = 0; i <= 8; i++) { const q = i / 8; R(g, Math.round(x + lerp(0, sw, q)) - 2, Math.round(yy - 62 + q * 16), 5, 3, c); } R(g, x + sw - 1, yy - 45, 4, 3, sk); }
  };
  // seated child at a desk (desk to the right), hip at (x, y = seat top). bend 0..1, write 0..1 (hand jitter), look up
  const kidSit = (g, x, y, v, t, bend, write, o) => {
    o = o || {}; x = Math.round(x); y = Math.round(y);
    const [cL, c, cD] = sh3(v.coat), sk = v.skin;
    const sx = Math.round(x + bend * 6), sy = Math.round(y - 30 + bend * 4);
    // torso as a leaning stack of rows
    for (let r = 0; r <= 30; r++) { const q = r / 30, xx = Math.round(lerp(x, sx, q)); R(g, xx - 6, y - r, 13, 1, c); R(g, xx - 6, y - r, 2, 1, cL); R(g, xx + 5, y - r, 2, 1, cD); }
    R(g, sx - 5, sy - 1, 11, 2, cL); R(g, sx + 2, sy - 2, 4, 2, v.shirt);
    R(g, sx, sy - 4, 4, 4, mix(sk, D.rust[2], 0.3));
    const look = o.look || 0, up = look > 0.5;
    headSide(g, sx + 2 + bend * 3, sy - 12 + bend * 3, v, t, { down: bend > 0.5 && !up, up, look: up ? 0 : 0 });
    // arm to the desk
    const jx = write > 0 ? Math.round(Math.sin(t * 13 + (v.ph || 0)) * 2 * write) : 0, jy = write > 0 ? Math.round(Math.abs(Math.sin(t * 17 + (v.ph || 0))) * 1.5 * write) : 0;
    const hx2 = x + 19 + jx, hy2 = y - 21 - jy;
    for (let i = 0; i <= 8; i++) { const q = i / 8; R(g, Math.round(lerp(sx + 1, hx2 - 3, q)) - 2, Math.round(lerp(sy + 4, hy2, q)) - 2, 5, 5, c); }
    R(g, hx2 - 2, hy2 - 2, 4, 3, sk);
    if (write > 0) R(g, hx2 + 1, hy2 - 3, 1, 2, CHALK());
  };
  // school desk seen from the side (front edge at x, top y), w wide, down to the floor fy; slate lying on it
  const sideDesk = (g, x, y, w, fy, wd, slate) => {
    poly(g, [[x, y - 3], [x + w, y], [x + w, y + 3], [x, y + 1]], wd[0]); R(g, x, y + 1, w, 2, wd[1]);
    R(g, x + 2, y + 3, w - 4, fy - y - 3, wd[1]); R(g, x + 2, y + 3, w - 4, 2, wd[2]); R(g, x + w - 5, y + 3, 3, fy - y - 3, wd[2]); R(g, x + 2, y + 3, 1, fy - y - 3, mix(wd[1], D.lamp, 0.15));
    for (let k = 0; k < 2; k++) R(g, x + 6, y + 10 + k * 12, w - 14, 1, wd[2]);
    if (slate) { poly(g, [[x + 3, y - 4], [x + 18, y - 2], [x + 18, y], [x + 3, y - 2]], mix(wd[0], D.paperD, 0.25)); poly(g, [[x + 4, y - 4], [x + 17, y - 2], [x + 17, y - 1], [x + 4, y - 3]], SLATE()); }
  };

  // back wall of the schoolroom seen straight on (windows behind the figures). wb = wall base y, ppm = px per metre on the wall
  const sideRoom = (g, t, c, wb, ppm, wins) => {
    const pl = PLASTER(), wd = OAK(), dk = mix(D.n2, D.rust[2], 0.22), VXs = 320, VYs = wb - 1.5 * ppm;
    const wy = (hm) => wb - hm * ppm, top = wy(2.6);
    // ceiling with beams coming toward us
    poly(g, [[-80, -60], [720, -60], [720, top], [-80, top]], mix(wd[1], D.n2, 0.45));
    for (let k = -8; k <= 8; k++) { const bx = VXs + k * 70, dx = (bx - VXs) * 1.9, ex = bx + dx;
      poly(g, [[bx - 6, top], [bx + 6, top], [ex + 14, -60], [ex - 14, -60]], mix(wd[2], D.n1, 0.2));
      PX.line(g, bx + 6, top, ex + 14, -60, mix(wd[1], D.lamp, 0.1)); }
    R(g, -80, top - 4, 800, 5, mix(wd[2], D.n0, 0.2)); R(g, -80, top - 4, 800, 1, mix(wd[1], D.lamp, 0.15));
    // plaster wall + wainscot
    PX.vgrad(g, -80, top + 1, 800, wb - top, mix(pl, dk, 0.4), mix(pl, D.lamp, 0.04), 6);
    R(g, -80, wy(0.92), 800, wb - wy(0.92), wd[2]); R(g, -80, wy(0.92), 800, 2, wd[1]); R(g, -80, wy(0.92), 800, 1, wd[0]);
    for (let x = -76; x < 720; x += 15) R(g, x, wy(0.92) + 3, 1, wb - wy(0.92) - 3, mix(wd[2], D.n0, 0.3));
    // windows: deep reveal, lane outside, leaded panes, sill
    wins.forEach(([x0, x1], wi) => {
      const y0 = wy(2.05), y1 = wy(1.0);
      R(g, x0 - 4, y0 - 4, x1 - x0 + 8, y1 - y0 + 8, mix(pl, D.lamp, 0.15));
      clip(g, x0, y0, x1 - x0, y1 - y0, () => parIn(g, c, 0.25, () => {
        PX.vgrad(g, x0 - 30, y0 - 20, x1 - x0 + 60, y1 - y0 + 40, mix(D.steel[0], D.paper, 0.45), mix(D.paper, D.lamp, 0.35), 6);
        const beam = mix(D.rust[2], D.n3, 0.25), hx3 = x0 - 6 + wi * 9;
        R(g, hx3, y0 + 22, 80, 80, mix(D.paper, D.paperD, 0.35)); for (let k = 0; k < 5; k++) R(g, hx3 + k * 18, y0 + 22, 2, 80, beam);
        R(g, hx3, y0 + 44, 80, 2, beam); PX.line(g, hx3 + 2, y0 + 24, hx3 + 18, y0 + 44, beam); PX.line(g, hx3 + 54, y0 + 44, hx3 + 70, y0 + 24, beam);
        poly(g, [[hx3 - 6, y0 + 24], [hx3 + 40, y0 - 10], [hx3 + 86, y0 + 24]], mix(D.rust[2], D.n3, 0.5));
        const tx3 = x0 + (wi ? 8 : (x1 - x0) - 10);
        R(g, tx3 - 1, y0 + 20, 3, 70, mix(D.n2, D.rust[2], 0.3)); ell(g, tx3, y0 + 14, 16, 14, mix(D.moss[2], D.moss[1], 0.5)); ell(g, tx3 - 4, y0 + 9, 10, 8, mix(D.moss[1], D.lamp, 0.25));
      }));
      const lead = mix(D.n2, D.n0, 0.3);
      R(g, Math.round((x0 + x1) / 2) - 1, y0, 2, y1 - y0, lead); R(g, x0, Math.round((y0 + y1) / 2), x1 - x0, 2, lead);
      for (let k = 1; k < 4; k++) { if (k === 2) continue; R(g, x0 + Math.round(((x1 - x0) * k) / 4), y0, 1, y1 - y0, mix(lead, D.paper, 0.2)); R(g, x0, y0 + Math.round(((y1 - y0) * k) / 4), x1 - x0, 1, mix(lead, D.paper, 0.2)); }
      R(g, x0 - 6, y1 + 3, x1 - x0 + 12, 3, mix(pl, D.lamp, 0.3)); R(g, x0 - 6, y1 + 6, x1 - x0 + 12, 1, dk);
      PX.glow(g, (x0 + x1) / 2, (y0 + y1) / 2, 50, D.lamp, 0.1);
    });
    return { pl, wd, dk, wy };
  };

  // ======================= quick_slate =======================
  // the front of the schoolroom seen from the side: boys at their desks, writing. The small light-haired boy (young
  // Gauss) scribbles something short in seconds (o.write 0.5), gets up, walks to the master's tall desk and, reaching up,
  // places his slate face-down on it (o.place 3.0). The master looks up from his ledger and raises an eyebrow (kept).
  // He stands clamp(place - write - 0.7, 0.9, 1.85) s before place, so the walk shortens when the beats are close.
  K.quick_slate = (o) => {
    const WB = 176, PPM = 42, FY = 226, PFY = 219, GX0 = 214, GX1 = 382, DX = 404, DW = 64, DTOP = PFY - 64, MXP = 456;
    const WINS = [[52, 128], [252, 318]];
    const others = [
      { x: 52, v: { skin: SKINS()[0], hair: HAIRS()[1], coat: COATS()[0], shirt: SHIRT(), ph: 1.3 }, lag: 0.0 },
      { x: 132, v: { skin: SKINS()[2], hair: HAIRS()[3], coat: COATS()[2], shirt: SHIRT(), ph: 2.1 }, lag: 0.4 },
    ];
    const gv = { ...GAUSS(), ph: 0.4 };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 6.0), tW = T("write", 0.5), tP = T("place", 3.0);
      const lead = clamp(tP - tW - 0.7, 0.9, 1.85), tStand = tP - lead, ws = tStand + 0.15, we = tP - 0.3;   // he stands only after writing
      const stood = t >= tStand, wp = PX.ease((t - ws) / (we - ws), "io"), placeK = clamp((t - we) / 0.3, 0, 1), placed = t >= tP;
      const back = P(t, tP + 0.25, 0.4, "io");
      R(g, 0, 0, 640, 360, D.n1);
      let room;
      // ---- far: wall, windows, shelf ----
      PX.par(g, c, 0.45, () => {
        room = sideRoom(g, t, c, WB, PPM, WINS);
        const { wd, wy } = room;
        // shelf with books + birch rods by the master's corner, a pegged map-less notice board
        const sx = 470, sy = wy(1.62);
        R(g, sx, sy, 80, 3, wd[1]); R(g, sx, sy, 80, 1, wd[0]); R(g, sx + 6, sy + 3, 2, 6, wd[2]); R(g, sx + 70, sy + 3, 2, 6, wd[2]);
        [[0, 14, 0], [5, 16, 1], [11, 12, 2], [15, 15, 0], [21, 13, 1]].forEach(([bx, h, ci]) => { const bc = mix([D.rust[2], D.moss[2], D.steel[2]][ci], D.n2, 0.35); R(g, sx + 4 + bx, sy - h, 5, h, bc); R(g, sx + 4 + bx, sy - h, 1, h, mix(bc, D.lamp, 0.3)); });
        poly(g, [[sx + 34, sy], [sx + 46, sy - 13], [sx + 49, sy - 10], [sx + 38, sy]], mix(D.rust[2], D.n2, 0.3));
        R(g, sx + 58, sy - 7, 7, 7, D.n1); R(g, sx + 59, sy - 9, 5, 2, D.n2);
        const rx = 560, ry = wy(1.95); R(g, rx, ry - 2, 2, 2, D.n4); for (let k = 0; k < 6; k++) PX.line(g, rx + 1, ry, rx - 6 + k * 3, ry + 36, mix(D.amber[2], D.n2, 0.3 + (k % 2) * 0.2)); R(g, rx - 2, ry + 6, 6, 3, mix(D.rust[2], D.n2, 0.3));
      });
      const wd = room.wd;
      // ---- floor ----
      PX.par(g, c, 0.7, () => {
        poly(g, [[-80, WB], [720, WB], [720, 400], [-80, 400]], mix(wd[1], D.n2, 0.45));
        for (let k = -12; k <= 12; k++) { const bx = 320 + k * 36; PX.line(g, bx, WB, 320 + (bx - 320) * 3.2, 400, mix(wd[2], D.n1, 0.3)); }
        for (const yy of [196, 222, 262, 318]) A(g, 0.25, () => R(g, -80, yy, 800, 1, mix(wd[2], D.n1, 0.4)));
        // sun on the floor from the windows (falling toward us)
        WINS.forEach(([x0, x1]) => A(g, 0.16, () => poly(g, [[x0 + 6, WB + 2], [x1 + 6, WB + 2], [x1 + 70, 380], [x0 + 40, 380]], mix(D.lamp, D.paper, 0.2))));
        // master's platform
        R(g, 368, PFY - 24, 300, 24, mix(wd[1], D.n2, 0.25)); R(g, 368, PFY, 300, 2, wd[0]); R(g, 368, PFY + 2, 300, FY - PFY - 1, wd[2]);
      });
      // ---- mid: boys at desks, the master at his tall desk, the small boy ----
      PX.par(g, c, 0.85, () => {
        // tiled stove in the corner behind the master (glazed tiles, brass door, fire flicker)
        const tile = mix(D.moss[2], D.teal[2], 0.3), stx = 578;
        const tiles = (x0, y0, w, h, nx, ny, base) => {
          R(g, x0, y0, w, h, base);
          for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
            const tx2 = Math.round(x0 + (i * w) / nx), ty2 = Math.round(y0 + (j * h) / ny), w2 = Math.round(x0 + ((i + 1) * w) / nx) - tx2, h2 = Math.round(y0 + ((j + 1) * h) / ny) - ty2;
            R(g, tx2, ty2, w2, 1, mix(base, D.lamp, 0.3)); R(g, tx2, ty2, 1, h2, mix(base, D.lamp, 0.16)); R(g, tx2, ty2 + h2 - 1, w2, 1, mix(base, D.n0, 0.5)); R(g, tx2 + w2 - 1, ty2, 1, h2, mix(base, D.n0, 0.4));
            R(g, tx2 + Math.floor(w2 / 2) - 1, ty2 + Math.floor(h2 / 2) - 1, 2, 2, mix(base, D.lamp, 0.2)); R(g, tx2 + 2, ty2 + 2, 1, 1, mix(base, D.cream, 0.4));
          }
        };
        R(g, stx - 2, PFY - 4, 70, 4, D.n1);
        tiles(stx, PFY - 46, 66, 42, 5, 3, mix(tile, D.n1, 0.12));
        R(g, stx - 3, PFY - 50, 72, 4, mix(tile, D.n0, 0.25)); R(g, stx - 3, PFY - 50, 72, 1, mix(tile, D.lamp, 0.3));
        tiles(stx + 8, PFY - 96, 54, 46, 4, 3, mix(tile, D.n1, 0.16));
        R(g, stx + 5, PFY - 102, 60, 6, mix(tile, D.n0, 0.25)); R(g, stx + 5, PFY - 102, 60, 1, mix(tile, D.lamp, 0.35)); R(g, stx + 7, PFY - 98, 56, 1, mix(tile, D.n0, 0.5));
        const flk = 0.5 + 0.5 * Math.sin(t * 9) * Math.sin(t * 3.7), dxs = stx + 12, dys = PFY - 30;
        R(g, dxs, dys, 14, 12, mix(D.amber[2], D.n1, 0.3)); R(g, dxs, dys, 14, 1, D.amber[1]); R(g, dxs + 11, dys + 5, 2, 2, D.amber[0]);
        A(g, 0.45 + 0.3 * flk, () => { R(g, dxs + 2, dys + 7, 8, 1, D.amber[0]); R(g, dxs + 2, dys + 9, 8, 1, D.rust[0]); });
        PX.glow(g, dxs + 7, dys + 8, 26, D.lampD, 0.1 + 0.05 * flk);
        R(g, stx + 30, 0, 7, PFY - 102, mix(D.n2, D.n0, 0.3)); R(g, stx + 30, 0, 1, PFY - 102, D.n4); R(g, stx + 29, 40, 9, 2, D.n2);
        // benches
        for (const bx of [36, 116, 196]) { R(g, bx - 10, FY - 30, 26, 4, wd[1]); R(g, bx - 10, FY - 30, 26, 1, wd[0]); R(g, bx - 8, FY - 26, 3, 26, wd[2]); R(g, bx + 11, FY - 26, 3, 26, wd[2]); }
        others.forEach((b, i) => {
          const watch = clamp(P(t, ws + 0.3 + i * 0.3, 0.4) - P(t, tP + 1.4 + i * 0.6, 0.5), 0, 1);
          kidSit(g, b.x, FY - 30, b.v, t, 0.85 * (1 - watch * 0.7), 1 - watch, { look: watch });
          sideDesk(g, b.x + 14, FY - 51, 30, FY, wd, true);
        });
        // Gauss at his desk, then up and away
        const wr = t >= tW && t < tW + 0.6 ? 1 : 0;
        const doneW = t >= tW + 0.6;
        if (!stood) kidSit(g, GX0, FY - 30, gv, t, wr ? 0.8 : 0.15, wr * 1.6, { look: doneW ? 1 : 0 });
        sideDesk(g, GX0 + 14, FY - 51, 30, FY, wd, !stood);
        // the master's tall desk (Katheder) on the platform, ledger, inkwell + quill, the master behind it
        const writingM = !placed && t < tP + 0.2 && !(t > tP - 0.6);
        const look = t > tP - 0.6 ? -1 : 0;
        const brow = P(t, tP + 0.55, 0.25, "out");
        const glance = t > tP + 1.9 && t < tP + 2.5;
        master(g, MXP, PFY, t, { pose: "front", cane: "none", look: glance ? -1 : look, down: (writingM && t < tP - 0.6) || glance, brow });
        // desk: slanted top facing the master, front panel toward us
        R(g, DX, DTOP, DW, PFY - DTOP, wd[1]); R(g, DX, DTOP, 2, PFY - DTOP, mix(wd[1], D.lamp, 0.2)); R(g, DX + DW - 4, DTOP, 4, PFY - DTOP, wd[2]);
        for (const [py, ph] of [[DTOP + 7, 22], [DTOP + 34, 22]]) { R(g, DX + 5, py, DW - 12, 1, wd[2]); R(g, DX + 5, py + 1, 1, ph, wd[2]); R(g, DX + 5, py + ph, DW - 11, 1, mix(wd[1], D.lamp, 0.2)); }
        poly(g, [[DX - 3, DTOP - 3], [DX + DW + 3, DTOP - 7], [DX + DW + 3, DTOP - 4], [DX - 3, DTOP + 1]], wd[0]); R(g, DX - 3, DTOP + 1, DW + 6, 1, wd[2]);
        R(g, DX + 30, DTOP - 9, 24, 3, mix(D.paper, D.n4, 0.2)); R(g, DX + 30, DTOP - 9, 24, 1, D.paper); R(g, DX + 41, DTOP - 10, 2, 4, mix(D.paper, D.n4, 0.5)); R(g, DX + 30, DTOP - 6, 24, 1, mix(D.rust[2], D.n1, 0.4));   // open ledger
        R(g, DX + 57, DTOP - 13, 5, 6, D.n1); R(g, DX + 58, DTOP - 14, 3, 1, D.n3); R(g, DX + 57, DTOP - 13, 1, 5, D.n4);   // inkwell
        // quill: scratching in the ledger, then laid down
        if (t < tP + 1.2) { const qx = DX + 42 + (writingM ? Math.round(Math.sin(t * 9) * 3) : 0), qy = DTOP - 9; PX.line(g, qx, qy, qx + 7, qy - 13, D.paper); PX.line(g, qx + 4, qy - 7, qx + 9, qy - 14, D.cream); R(g, qx - 1, qy - 1, 3, 2, mix(SKIN()[1], D.n0, 0.1)); }
        else { PX.line(g, DX + 44, DTOP - 11, DX + 56, DTOP - 13, D.paper); }
        // the small boy: stands, walks, reaches up, places the slate, steps back
        if (stood) {
          const gx = lerp(GX0 + 6, GX1, wp) - back * 6, walking = wp > 0 && wp < 1;
          const arms = placed ? (back > 0.5 ? "back" : "reach") : placeK > 0 ? "reach" : "carry";
          kidStand(g, gx, FY, gv, t, { ph: walking ? wp * 11 : null, arms, reachK: placed ? 1 - back : placeK, up: placeK > 0 || placed, rock: placed && back >= 1 ? (Math.sin(t * 3) > 0.6 ? 1 : 0) : 0 });
          // slate: carried upright against the chest (writing toward him), then tipped flat onto the desk face-down
          if (!placed) {
            const ang = placeK * Math.PI / 2, px0 = gx + 11 + placeK * 10, py0 = lerp(FY - 46 - (walking ? Math.round(Math.abs(Math.sin(wp * 11)) * 1.5) : 0), DTOP - 4, placeK);
            const ca = Math.cos(ang), sa = Math.sin(ang), L = 26;
            poly(g, [[px0, py0], [px0 + 4 * ca, py0 + 4 * sa], [px0 + 4 * ca + L * sa, py0 + 4 * sa - L * ca], [px0 + L * sa, py0 - L * ca]], mix(wd[0], D.paperD, 0.25));
            poly(g, [[px0 + 1, py0 - 1], [px0 + 3 * ca + 1, py0 + 3 * sa - 1], [px0 + 3 * ca + (L - 2) * sa, py0 + 3 * sa - (L - 2) * ca], [px0 + (L - 2) * sa, py0 - (L - 2) * ca]], mix(wd[1], D.n1, 0.3));
          }
        }
        if (placed) {
          // lying face-down on the desk: wooden frame + plain back, nothing to read
          const sx2 = DX + 4, sy2 = DTOP - 6;
          poly(g, [[sx2, sy2 - 2], [sx2 + 26, sy2 - 4], [sx2 + 26, sy2], [sx2, sy2 + 2]], mix(wd[0], D.paperD, 0.25));
          poly(g, [[sx2 + 2, sy2 - 1], [sx2 + 24, sy2 - 3], [sx2 + 24, sy2 - 1], [sx2 + 2, sy2 + 1]], mix(SLATE(), D.n3, 0.3));
          // a little chalk dust puff from the clack
          const pk = clamp((t - tP) / 0.7, 0, 1);
          if (pk < 1) for (let k = 0; k < 6; k++) A(g, 0.6 * (1 - pk), () => R(g, sx2 + 4 + k * 4 + Math.round((k - 2.5) * pk * 4), sy2 - 3 - Math.round(pk * (4 + (k % 3) * 2)), 1, 1, D.cream));
        }
      });
      // ---- light + foreground: the nearest row of desks with slates, pupils' heads and shoulders in shadow ----
      WINS.forEach(([x0, x1]) => A(g, 0.06, () => poly(g, [[x0, WB - 76], [x1, WB - 76], [x1 + 80, 370], [x0 + 46, 370]], D.lamp)));
      dust(g, 71, 34, t, [40, 90, 340, 240], D.cream, 0.5);
      PX.par(g, c, 1.12, () => {
        const fw = mix(wd[1], D.n0, 0.5), fwL = mix(wd[0], D.n0, 0.4), fwD = mix(wd[2], D.n0, 0.5);
        const near = [{ x: 70, v: { skin: SKINS()[3], hair: HAIRS()[0], coat: COATS()[5], shirt: SHIRT(), w: 1, hs: 1, ph: 3 } },
                      { x: 236, v: { skin: SKINS()[1], hair: HAIRS()[4], coat: COATS()[3], shirt: SHIRT(), w: 1, hs: 1, ph: 5, vest: true } },
                      { x: 588, v: { skin: SKINS()[2], hair: HAIRS()[5], coat: COATS()[1], shirt: SHIRT(), w: 1, hs: 1, ph: 7 } }];
        // desk tops (seen from above, close) with slates, then the heads in front of them
        for (const [x0, x1] of [[-30, 300], [500, 680]]) {
          R(g, x0, 274, x1 - x0, 10, fw); R(g, x0, 274, x1 - x0, 1, fwL); R(g, x0, 284, x1 - x0, 3, fwD); R(g, x0, 287, x1 - x0, 80, mix(fwD, D.n0, 0.3));
        }
        for (const sx3 of [20, 168, 530]) { R(g, sx3, 270, 40, 7, mix(wd[0], D.n0, 0.35)); R(g, sx3 + 2, 271, 36, 5, mix(SLATE(), D.n0, 0.25)); A(g, 0.35, () => { R(g, sx3 + 5, 272, 20, 1, CHALK()); R(g, sx3 + 5, 274, 13, 1, CHALK()); }); }
        near.forEach((p) => { const v = { ...p.v, coat: mix(p.v.coat, D.n0, 0.45), hair: mix(p.v.hair, D.n0, 0.4), skin: mix(p.v.skin, D.n0, 0.45), shirt: mix(p.v.shirt, D.n0, 0.5) };
          backBoy(g, p.x, 312, 210, t, v, 0.9, 0, 0.8); });
      });
      PX.vignette(g, 0.55);
    };
  };


  // ---------- top-down helpers ----------
  const capsule = (g, ax, ay, bx, by, r, col) => { const n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / Math.max(1, r * 0.5))); for (let i = 0; i <= n; i++) { const u = i / n; PX.circle(g, Math.round(lerp(ax, bx, u)), Math.round(lerp(ay, by, u)), r, col); } };
  // two-bone arm: elbow from shoulder S, hand H, lengths l1, l2, bend side sg
  const elbow = (sx, sy, hx2, hy2, l1, l2, sg) => {
    let dx = hx2 - sx, dy = hy2 - sy; const d = Math.hypot(dx, dy) || 1, dd = clamp(d, Math.abs(l1 - l2) + 1, l1 + l2 - 0.5);
    const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd), h = Math.sqrt(Math.max(0, l1 * l1 - a * a)); dx /= d; dy /= d;
    return [sx + a * dx - sg * h * dy, sy + a * dy + sg * h * dx];
  };
  // a single chalk glyph revealed top to bottom (p 0..1); returns the pen tip
  const glyph = (g, ch, x, y, p, col, seed) => {
    const gl = GL[ch]; if (!gl || p <= 0) return [x, y];
    const rows = Math.ceil(clamp(p, 0, 1) * gl.length);
    for (let r = 0; r < rows; r++) for (let q = 0; q < gl[r].length; q++) if (gl[r][q] === "#") {
      const sl = Math.floor((gl.length - 1 - r) / 4), px = x + q + sl, py = y + r, h = hash(px * 3 + seed, py);
      A(g, h < 0.14 ? 0.5 : 0.95, () => R(g, px, py, 1, 1, col)); if (h > 0.6) A(g, 0.3, () => R(g, px + 1, py, 1, 1, col));
    }
    return [x + gl[0].length / 2 + 1, y + rows];
  };

  // ======================= slow_add =======================
  // looking straight down over a pupil's desk (about 5.5 px per cm): his slate, his head and arms. He adds one number at
  // a time: chalk "1 + 2 + 3 +", then hurried, illegible number scrawls with "+" signs; running totals in the margin get
  // crossed out, rubbed and redone; the writing slows as it goes. At o.giveup (5.0) he slumps forward onto his folded
  // arms, face turned to us, and the chalk rolls away. Only "1", "2", "3" are legible digits; no total is readable.
  K.slow_add = (o) => {
    const SL = { x: 232, y: 26, w: 176, h: 128, f: 7 }, SX0 = SL.x + SL.f + 6, SX1 = SL.x + SL.w - SL.f - 4, SY0 = SL.y + SL.f + 6;
    // ---- the writing, laid out once ----
    const items = [];
    let x = SX0, y = SY0, row = 0, k = 0;
    // a hurried cursive scrawl: soft waves, no hooks, so no digit can be read in it
    const scrib = (x0, y0, w, h, seed, mess) => {
      const humps = 1.5 + Math.floor(hash(seed, 1) * 3) * 0.5 + w / 14, n = Math.max(6, Math.round(w * 1.4)), pts = [];
      for (let i = 0; i < n; i++) {
        const u = i / (n - 1), amp = h * (0.18 + 0.1 * hash(seed, 2)) * (0.8 + 0.2 * Math.sin(u * 5 + seed));
        pts.push([x0 + u * w, y0 + h * 0.55 + Math.sin(u * humps * Math.PI * 2 + seed) * amp + u * mess * 1.5 + (hash(seed, i) - 0.5) * 0.6 * mess]);
      }
      return pts;
    };
    // the opening addends: rule 8 lists no numbers for this kind, so they are scrawls too
    // (set LEGIBLE_START = true for a legible "1 + 2 + 3")
    const LEGIBLE_START = false;
    if (LEGIBLE_START) [["1", 0], ["+", 1], ["2", 0], ["+", 1], ["3", 0]].forEach(([ch, pl]) => { items.push({ t: "g", ch, x, y, d: pl ? 0.16 : 0.2 }); x += glW(ch) + 3; });
    else { items.push({ t: "s", pts: scrib(x, y, 6, 8, 91, 0), d: 0.2 }); x += 9; }
    while (items.length < 110) {
      const mess = clamp(k / 18, 0, 1), yd = Math.round(k * 0.25 * mess);
      const w = Math.round(9 + hash(k, 3) * 6 + mess * 5), h = Math.round(7 + mess * 3 * hash(k, 5));
      if (x + 9 + w > SX1 - 40) {
        // running total in the right margin; odd rows get crossed out and redone just below
        const tx = SX1 - 32 + Math.round((hash(row, 9) - 0.5) * 4 * mess), ty = y - 1 + yd, tw = Math.round(16 + hash(row, 4) * 10);
        items.push({ t: "g", ch: "=", x: tx - 9, y: ty, d: 0.12 });
        items.push({ t: "s", pts: scrib(tx, ty, tw, 8 + mess * 2, row * 7 + 3, mess), d: 0.5 + tw * 0.01 });
        if (row % 2 === 1) { items.push({ t: "x", a: [tx - 2, ty + 7], b: [tx + tw + 2, ty + 1], d: 0.16 }); items.push({ t: "s", pts: scrib(tx + 2, ty + 9, tw - 3, 7, row * 5 + 1, mess), d: 0.45 }); }
        if (row === 2 || row === 4) items.push({ t: "m", cx: tx + 8, cy: ty - 6, rx: 16, ry: 5, d: 0.45 });   // thumb rubs out a total above
        items.push({ t: "p", d: 0.25 });
        row++; y += 15 + Math.round(mess * 2); x = SX0 + Math.round(hash(row, 2) * 5 * mess);
        if (y > SL.y + SL.h - SL.f - 14) break;
        continue;
      }
      items.push({ t: "g", ch: "+", x, y: y + yd + Math.round((hash(k, 8) - 0.5) * 2 * mess), d: 0.12 });
      x += 9;
      items.push({ t: "s", pts: scrib(x, y + yd, w, h, k + 11, mess), d: 0.24 + w * 0.012 });
      x += w + 3;
      k++;
    }
    // start times with fatigue: each item a little slower than the last
    let acc = 0; items.forEach((it, i) => { it.st = acc; it.dd = it.d * (0.62 + i * 0.014); acc += it.dd + 0.03; });
    const END = acc;
    const boy = { hair: mix(D.n0, D.rust[2], 0.35), coat: mix(D.steel[2], D.n2, 0.3), skin: mix(D.rose[0], D.lampD, 0.4), shirt: SHIRT() };
    const startPt = (it, prev) => (it.t === "g" ? [it.x + 2, it.y + 4] : it.t === "s" ? it.pts[0] : it.t === "x" ? it.a : it.t === "m" ? [it.cx, it.cy] : prev);
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8.0), tG = T("giveup", 5.0);
      const tau = 5.0 + (tG <= 0 ? (5.0 * d) / 8 : Math.min(t, tG));   // writing clock (stops when he gives up)
      const slump = tG <= 0 ? 1 : P(t, tG, 0.75, "io"), wd = OAK(), chalkC = CHALK();
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: floor between the desks, the next row's backs from above ----
      PX.par(g, c, 0.45, () => {
        R(g, -40, -40, 720, 80, mix(wd[2], D.n1, 0.55));
        for (let k2 = 0; k2 < 7; k2++) R(g, -40, -36 + k2 * 8, 720, 1, mix(wd[2], D.n0, 0.5));
        for (const [hx3, ci] of [[120, 2], [330, 4], [540, 0]]) {
          const cc = mix(COATS()[ci], D.n1, 0.5), hh = mix(HAIRS()[ci], D.n1, 0.45);
          R(g, hx3 - 80, -40, 160, 36, cc); R(g, hx3 - 80, -40, 3, 36, mix(cc, D.lamp, 0.15));
          ell(g, hx3 + (ci - 2) * 3, -26, 34, 26, hh); R(g, hx3 - 20, -4, 40, 1, mix(hh, D.n0, 0.4));
        }
      });
      let pen = [SX0, SY0 + 4], rubbing = false;
      // ---- the desk, slate, writing, chalk ----
      PX.par(g, c, 0.8, () => {
        const dT = 14, plank = [wd[1], mix(wd[1], wd[2], 0.25), mix(wd[1], wd[0], 0.12), mix(wd[1], wd[2], 0.12)];
        for (let pk = 0; pk < 4; pk++) {
          const py = dT + pk * 92; R(g, -40, py, 720, 92, plank[pk]); R(g, -40, py, 720, 1, mix(plank[pk], D.n0, 0.45)); R(g, -40, py + 1, 720, 1, mix(plank[pk], D.lamp, 0.12));
          for (let gl2 = 0; gl2 < 7; gl2++) {
            const gy = py + 8 + gl2 * 12 + Math.round(hash(pk, gl2) * 6); let gx = -40;
            while (gx < 700) { const len = 20 + Math.round(hash(gx, gy) * 70); R(g, gx, gy + Math.round(Math.sin(gx * 0.02 + gl2) * 1.5), len, 1, mix(plank[pk], D.n0, 0.18 + 0.1 * hash(gy, gx))); gx += len + 6 + Math.round(hash(gy, gx) * 30); }
          }
        }
        A(g, 0.6, () => R(g, -40, dT - 3, 720, 4, "#000000"));
        for (const [kx, ky] of [[120, 200], [520, 250], [600, 90]]) { ell(g, kx, ky, 5, 3, mix(wd[2], D.n0, 0.3)); ell(g, kx, ky, 3, 1, mix(wd[2], D.n0, 0.5)); }
        PX.line(g, 150, 150, 196, 146, mix(wd[0], D.paperD, 0.3)); PX.line(g, 470, 210, 500, 222, mix(wd[0], D.paperD, 0.25));   // old scratches
        // inkwell hole with a brass lid
        PX.circle(g, 470, 50, 9, mix(D.amber[2], D.n1, 0.3)); PX.circle(g, 470, 50, 7, mix(D.amber[1], D.n2, 0.3)); R(g, 466, 46, 4, 1, D.amber[0]); R(g, 465, 47, 1, 2, D.amber[0]);
        // pencil box, and the sponge tied to the slate with a string
        A(g, 0.4, () => R(g, 108, 52, 104, 26, "#000000"));
        R(g, 102, 46, 104, 24, mix(wd[2], D.n0, 0.1)); R(g, 102, 46, 104, 1, wd[0]); R(g, 105, 49, 98, 7, mix(wd[0], D.paperD, 0.2)); R(g, 150, 56, 6, 9, D.amber[2]); R(g, 151, 57, 2, 2, D.amber[0]);
        PX.line(g, SL.x + 3, SL.y + 4, 196, 96, mix(D.paper, D.n4, 0.3)); PX.line(g, 196, 96, 188, 112, mix(D.paper, D.n4, 0.3));
        A(g, 0.4, () => ell(g, 192, 128, 18, 9, "#000000"));
        ell(g, 186, 120, 18, 13, mix(D.paperD, D.amber[2], 0.3)); ell(g, 182, 116, 10, 6, mix(D.paper, D.amber[1], 0.25));
        for (let k2 = 0; k2 < 18; k2++) R(g, 172 + Math.round(hash(k2, 1) * 28), 110 + Math.round(hash(1, k2) * 20), 1, 1, mix(D.paperD, D.n2, 0.45));
        // neighbours' slates at the frame edges, the left one with a hand still writing
        const nb = (x0, y0, wr) => {
          A(g, 0.5, () => R(g, x0 + 6, y0 + 6, SL.w, SL.h, "#000000"));
          R(g, x0, y0, SL.w, SL.h, mix(wd[0], D.paperD, 0.18)); R(g, x0 + SL.f, y0 + SL.f, SL.w - 2 * SL.f, SL.h - 2 * SL.f, SLATE());
          for (let l = 0; l < 6; l++) A(g, 0.5, () => R(g, x0 + 14, y0 + 16 + l * 15, 50 + Math.round(hash(l, x0) * 70), 1, chalkC));
          if (wr) { const nx = x0 + 140 + Math.round(Math.sin(t * 8) * 2), ny = y0 + 92 + Math.round(Math.abs(Math.sin(t * 11)) * 2);
            capsule(g, x0 + 60, y0 + 300, nx + 12, ny + 14, 13, mix(COATS()[1], D.n1, 0.3)); ell(g, nx, ny, 16, 13, mix(SKINS()[2], D.n1, 0.2)); ell(g, nx - 4, ny - 4, 8, 5, mix(SKINS()[2], D.lamp, 0.1)); }
        };
        nb(-120, 70, true); nb(590, 86, false);
        // ---- the slate: oak frame, dark stone, ghosts of old lessons ----
        A(g, 0.55, () => R(g, SL.x + 5, SL.y + 6, SL.w, SL.h, "#000000"));
        R(g, SL.x, SL.y, SL.w, SL.h, mix(wd[0], D.paperD, 0.25)); R(g, SL.x, SL.y, SL.w, 1, mix(wd[0], D.cream, 0.3)); R(g, SL.x, SL.y, 1, SL.h, mix(wd[0], D.cream, 0.2));
        R(g, SL.x + SL.w - 1, SL.y, 1, SL.h, wd[2]); R(g, SL.x, SL.y + SL.h - 1, SL.w, 1, wd[2]);
        for (const [jx, jy] of [[SL.x, SL.y], [SL.x + SL.w - SL.f, SL.y], [SL.x, SL.y + SL.h - SL.f], [SL.x + SL.w - SL.f, SL.y + SL.h - SL.f]]) R(g, jx + 3, jy + 3, 1, 1, wd[2]);   // corner pegs
        R(g, SL.x + 2, SL.y + 3, 2, 2, mix(wd[2], D.n0, 0.4));   // string hole
        const ix = SL.x + SL.f, iy = SL.y + SL.f, iw = SL.w - 2 * SL.f, ih = SL.h - 2 * SL.f;
        R(g, ix - 1, iy - 1, iw + 2, ih + 2, mix(wd[2], D.n0, 0.3)); R(g, ix, iy, iw, ih, SLATE());
        for (let k2 = 0; k2 < 160; k2++) { const sx4 = ix + Math.floor(hash(k2, 21) * iw), sy4 = iy + Math.floor(hash(21, k2) * ih); R(g, sx4, sy4, 1, 1, hash(k2, k2) < 0.5 ? mix(SLATE(), D.n4, 0.35) : mix(SLATE(), D.n0, 0.4)); }
        for (let k2 = 0; k2 < 9; k2++) A(g, 0.03 + 0.025 * hash(k2, 4), () => ell(g, ix + 14 + Math.round(hash(k2, 1) * (iw - 28)), iy + 12 + Math.round(hash(1, k2) * (ih - 24)), 6 + Math.round(hash(k2, 2) * 16), 2 + Math.round(hash(2, k2) * 5), chalkC));
        // ---- the chalk writing up to now ----
        let prevEnd = null, moved = false;
        for (let i = 0; i < items.length; i++) {
          const it = items[i], f = clamp((tau - it.st) / it.dd, 0, 1);
          if (f <= 0) {
            if (!moved && prevEnd) { const nxt = startPt(it, prevEnd), gp = clamp((tau - (it.st - 0.04)) / 0.04, 0, 1); pen = [lerp(prevEnd[0], nxt[0], gp), lerp(prevEnd[1], nxt[1], gp)]; moved = true; }
            continue;
          }
          if (it.t === "g") pen = glyph(g, it.ch, it.x, it.y, f, chalkC, i);
          else if (it.t === "s") {
            const n = Math.max(1, Math.ceil(f * (it.pts.length - 1)));
            for (let j = 0; j < n; j++) { const [ax, ay] = it.pts[j], [bx, by] = it.pts[j + 1]; A(g, 0.9, () => PX.line(g, ax, ay, bx, by, chalkC)); if (hash(i, j) > 0.55) A(g, 0.3, () => PX.line(g, ax + 1, ay, bx + 1, by, chalkC)); }
            pen = it.pts[n];
          } else if (it.t === "x") { const e = [lerp(it.a[0], it.b[0], f), lerp(it.a[1], it.b[1], f)]; PX.line(g, it.a[0], it.a[1], e[0], e[1], chalkC); PX.line(g, it.a[0], it.a[1] + 1, e[0], e[1] + 1, chalkC); pen = e; }
          else if (it.t === "m") {
            A(g, 0.55 * f, () => { ell(g, it.cx, it.cy, it.rx, it.ry, mix(SLATE(), chalkC, 0.25)); ell(g, it.cx + 2, it.cy + 1, it.rx - 5, it.ry - 2, mix(SLATE(), chalkC, 0.38)); });
            if (f < 1) { pen = [it.cx + Math.cos(tau * 14) * it.rx * 0.6, it.cy + Math.sin(tau * 14) * it.ry * 0.6]; rubbing = true; }
          }
          if (f < 1) moved = true;
          prevEnd = pen;
        }
        // ---- the chalk: rolls away across the slate and the desk once he lets go ----
        if (slump > 0.02 || tG <= 0) {
          const roll = tG <= 0 ? 1 : clamp((t - tG - 0.1) / 1.6, 0, 1), rk = PX.ease(roll, "out");
          const c0 = [pen[0] + 2, pen[1] + 2], c1 = [SL.x + SL.w + 58, 190];
          const cx2 = Math.round(lerp(c0[0], c1[0], rk)), bump = Math.abs(lerp(c0[0], c1[0], rk) - (SL.x + SL.w)) < 5 && roll < 1 ? 2 : 0, cy2 = Math.round(lerp(c0[1], c1[1], rk)) - bump;
          const spin = roll >= 1 ? 0 : Math.floor(rk * 22) % 4, ccD = mix(chalkC, D.n5, 0.4);
          A(g, 0.4, () => R(g, cx2 + 2, cy2 + 3, 8, 2, "#000000"));
          if (spin === 0) { R(g, cx2 - 4, cy2, 8, 2, chalkC); R(g, cx2 - 4, cy2 + 1, 8, 1, ccD); }
          else if (spin === 2) { R(g, cx2, cy2 - 4, 2, 8, chalkC); R(g, cx2 + 1, cy2 - 4, 1, 8, ccD); }
          else { PX.line(g, cx2 - 3, cy2 - 3, cx2 + 3, cy2 + 3, chalkC); PX.line(g, cx2 - 2, cy2 - 3, cx2 + 4, cy2 + 3, ccD); }
        }
      });
      // ---- the pupil from above: shoulders, head, arms (5.5 px per cm) ----
      PX.par(g, c, 1.0, () => {
        const [cL, cc, cD] = sh3(boy.coat), [hL, hh, hD] = sh3(boy.hair), sk = boy.skin, skL = mix(sk, D.cream, 0.28), skD = mix(sk, D.rust[2], 0.42), shirt = boy.shirt;
        const ox = Math.round((c.x - PX.LW / 2) * 0.2), oy = Math.round((c.y - PX.LH / 2) * 0.2), penB = [pen[0] + ox, pen[1] + oy];   // slate layer -> this layer
        const br = Math.round(Math.sin(t * 1.5) * 1.2 * slump);   // slow breathing once he has slumped
        const writing = slump < 0.02 && tG > 0;
        const jit = writing && !rubbing && tau < END ? [Math.round(Math.sin(t * 15) * 0.7), Math.round(Math.sin(t * 19) * 0.7)] : [0, 0];
        const SLs = [262, 322 + br], SRs = [380, 322 + br];
        // hands: writing / holding the slate corner -> folded on the desk under the head
        const RHw = [penB[0] + 15 + jit[0], penB[1] + 16 + jit[1]], LHw = [SL.x + 18 + ox, SL.y + SL.h + 6 + oy];
        const RH = [lerp(RHw[0], 270, slump), lerp(RHw[1], 236 + br, slump)], LH = [lerp(LHw[0], 368, slump), lerp(LHw[1], 226 + br, slump)];
        const LE = elbow(SLs[0], SLs[1], LH[0], LH[1], 120, 128, -1), RE = elbow(SRs[0], SRs[1], RH[0], RH[1], 120, 128, 1);
        const head = [lerp(322 + Math.round((penB[0] - 320) * 0.08), 318, slump), lerp(258 - Math.round((150 - penB[1]) * 0.06), 236 + br, slump)];
        // shadows on the desk (light from the upper left)
        A(g, 0.28, () => {
          for (const [S, E, Hh] of [[SLs, LE, LH], [SRs, RE, RH]]) { capsule(g, S[0] + 10, S[1] + 10, E[0] + 10, E[1] + 10, 18, "#000000"); capsule(g, E[0] + 10, E[1] + 10, Hh[0] + 9, Hh[1] + 9, 15, "#000000"); }
          ell(g, head[0] + 14, head[1] + 14, 44, 46, "#000000");
        });
        // shoulders and back, cropped by the frame
        const bw = 156, by0 = 300 + br;
        ell(g, 320, by0 + 34, bw / 2 + 8, 44, cD); ell(g, 320, by0 + 32, bw / 2 + 4, 42, cc); R(g, 320 - bw / 2 - 4, by0 + 34, bw + 8, 60, cc);
        ell(g, 300, by0 + 22, 50, 14, mix(cc, cL, 0.5)); R(g, 320, by0 + 20, 1, 60, cD);
        // arms: upper arm, forearm (jacket sleeves), shirt cuffs
        const arm = (S, E, Hh, lit) => {
          capsule(g, S[0], S[1], E[0], E[1], 18, cD); capsule(g, S[0] - 1, S[1] - 2, E[0] - 1, E[1] - 2, 16, cc);
          const L = Math.hypot(Hh[0] - E[0], Hh[1] - E[1]) || 1, ux = (Hh[0] - E[0]) / L, uy = (Hh[1] - E[1]) / L, wx = Hh[0] - ux * 18, wy = Hh[1] - uy * 18;
          capsule(g, E[0], E[1], wx, wy, 15, cD); capsule(g, E[0] - 1, E[1] - 2, wx - 1, wy - 2, 13, cc);
          if (lit) { capsule(g, S[0] - 10, S[1] - 8, E[0] - 10, E[1] - 8, 2, cL); capsule(g, E[0] - 9, E[1] - 7, wx - 9, wy - 7, 2, cL); }
          else { capsule(g, S[0] - 6, S[1] - 13, E[0] - 4, E[1] - 13, 1, cL); capsule(g, E[0] - 6, E[1] - 11, wx - 6, wy - 11, 1, cL); }
          for (let k2 = 1; k2 < 3; k2++) { const q = 0.3 + k2 * 0.2, fx = lerp(E[0], wx, q), fy = lerp(E[1], wy, q); PX.line(g, fx - uy * 11, fy + ux * 11, fx - uy * 4 + ux * 5, fy + ux * 4 + uy * 5, cD); }   // folds
          capsule(g, wx, wy, Hh[0] - ux * 9, Hh[1] - uy * 9, 11, mix(shirt, D.n2, 0.25)); capsule(g, wx - 1, wy - 1, Hh[0] - ux * 9 - 1, Hh[1] - uy * 9 - 1, 10, shirt);
        };
        // hands from above
        const hand = (x2, y2, grip, flat) => {
          x2 = Math.round(x2); y2 = Math.round(y2);
          ell(g, x2, y2, 15, 12, skD); ell(g, x2 - 1, y2 - 1, 14, 11, sk); ell(g, x2 - 5, y2 - 5, 7, 4, skL);
          for (let k2 = 0; k2 < 4; k2++) { const kx = x2 - 12 + k2 * 6, ky = y2 - 10 + k2 * 2; R(g, kx, ky, 4, 2, skL); R(g, kx + 1, ky + 2, 3, 1, skD); }   // knuckles
          if (grip) {
            capsule(g, x2 - 11, y2 - 8, x2 - 16, y2 - 14, 4, sk); R(g, x2 - 19, y2 - 17, 4, 3, skL); R(g, x2 - 15, y2 - 12, 3, 1, skD);   // index finger on the chalk
            capsule(g, x2 - 13, y2 + 2, x2 - 17, y2 - 8, 4, skD); capsule(g, x2 - 13, y2 + 1, x2 - 17, y2 - 8, 3, sk); R(g, x2 - 18, y2 - 9, 2, 2, skL);   // thumb
          } else if (flat) {
            for (let k2 = 0; k2 < 4; k2++) capsule(g, x2 - 10 + k2 * 6, y2 - 8 + k2 * 2, x2 - 16 + k2 * 5, y2 - 18 + k2 * 3, 3, k2 % 2 ? sk : skL);
          } else {
            for (let k2 = 0; k2 < 4; k2++) { R(g, x2 - 12 + k2 * 6, y2 - 16, 4, 7, k2 % 2 ? sk : skL); R(g, x2 - 12 + k2 * 6, y2 - 10, 4, 1, skD); }   // fingers over the slate frame
          }
        };
        // when slumped the forearms fold under the head: draw arms first, then the head on top
        const drawArms = () => { arm(SLs, LE, LH, true); hand(LH[0], LH[1], false, slump > 0.5); arm(SRs, RE, RH, false); hand(RH[0], RH[1], writing, slump > 0.5); };
        const drawHead = () => {
          const [hx4, hy4] = [Math.round(head[0]), Math.round(head[1])];
          if (slump < 0.5) {
            // the top of his head bent over the slate: ears, crown whorl, light from the left
            ell(g, hx4 - 41, hy4 + 6, 6, 10, sk); ell(g, hx4 + 41, hy4 + 6, 6, 10, skD); R(g, hx4 - 43, hy4 + 3, 2, 6, skL);
            ell(g, hx4, hy4, 40, 44, hD); ell(g, hx4 - 1, hy4 - 1, 38, 42, hh); ell(g, hx4 - 8, hy4 - 10, 24, 22, mix(hh, hL, 0.32));
            for (let k2 = 0; k2 < 16; k2++) { const a = (k2 / 16) * Math.PI * 2, r1 = 14 + (k2 % 3) * 8; PX.line(g, hx4 + 4 + Math.cos(a) * 4, hy4 + 8 + Math.sin(a) * 4, hx4 + 4 + Math.cos(a + 0.5) * r1, hy4 + 8 + Math.sin(a + 0.5) * r1 * 1.1, k2 % 2 ? hD : mix(hh, hL, 0.5)); }
            R(g, hx4 - 22, hy4 - 36, 24, 1, hL); R(g, hx4 - 32, hy4 - 24, 1, 22, hL);
            for (let k2 = 0; k2 < 6; k2++) R(g, hx4 - 30 + k2 * 11, hy4 + 38 + (k2 % 2) * 2, 4, 5, hD);   // nape tufts
          } else {
            // forehead down on the folded arms: back of the head, both ears, the nape stretched above the collar
            R(g, hx4 - 12, hy4 + 30, 24, 22, skD); R(g, hx4 - 10, hy4 + 30, 8, 22, sk);   // nape
            ell(g, hx4 - 38, hy4 + 2, 6, 10, sk); ell(g, hx4 + 38, hy4 + 2, 6, 10, skD); R(g, hx4 - 40, hy4 - 1, 2, 6, skL);
            ell(g, hx4, hy4, 37, 39, hD); ell(g, hx4 - 1, hy4 - 1, 35, 37, hh); ell(g, hx4 - 8, hy4 - 8, 22, 18, mix(hh, hL, 0.3));
            for (let k2 = 0; k2 < 16; k2++) { const a = (k2 / 16) * Math.PI * 2, r1 = 12 + (k2 % 3) * 8; PX.line(g, hx4 + 3 + Math.cos(a) * 3, hy4 + 10 + Math.sin(a) * 3, hx4 + 3 + Math.cos(a + 0.5) * r1, hy4 + 10 + Math.sin(a + 0.5) * r1 * 1.1, k2 % 2 ? hD : mix(hh, hL, 0.5)); }
            R(g, hx4 - 20, hy4 - 33, 22, 1, hL); R(g, hx4 - 30, hy4 - 22, 1, 20, hL);
            for (let k2 = 0; k2 < 6; k2++) R(g, hx4 - 27 + k2 * 10, hy4 + 33 + (k2 % 2) * 2, 4, 5, hD);   // nape tufts
          }
        };
        if (slump < 0.5) { drawArms(); drawHead(); }
        else { drawArms(); drawHead(); }
        if (writing) { PX.line(g, penB[0], penB[1], RH[0] - 19, RH[1] - 17, chalkC); PX.line(g, penB[0] + 1, penB[1], RH[0] - 18, RH[1] - 17, mix(chalkC, D.n5, 0.35)); }
      });
      // ---- window light across everything, with the leaded window's bars in it; dust ----
      clipPoly(g, [[-40, -40], [430, -40], [230, 400], [-40, 400]], () => {
        A(g, 0.09, () => R(g, -40, -40, 720, 440, D.lamp));
        for (let k2 = 0; k2 < 3; k2++) A(g, 0.07, () => poly(g, [[110 + k2 * 105, -40], [118 + k2 * 105, -40], [-58 + k2 * 105, 400], [-66 + k2 * 105, 400]], "#000000"));
        A(g, 0.06, () => R(g, -40, 140, 720, 6, "#000000"));
      });
      PX.glow(g, 120, 60, 260, D.lamp, 0.1);
      dust(g, 81, 40, t, [0, 0, 380, 360], D.cream, 0.45);
      PX.vignette(g, 0.5);
    };
  };

  // ======================= pattern_eyes =======================
  // close on the small light-haired boy (young Gauss) in the front row, looking along a long row of blank wooden number
  // tiles hung on the blackboard, which runs away from us and leads to his eyes. His eyes travel along the row, brows
  // knit; at o.idea (2.5) a small warm spark of insight pops over his head, his eyes widen and a little smile stays.
  K.pattern_eyes = (o) => {
    const VPX = 404, VPY = 205, X0 = -60, YT = 36, YB = 232, KF = 3.6, NT = 40;
    const sAt = (u) => 1 / (1 + u * KF);
    const bx = (u) => VPX + (X0 - VPX) * sAt(u), by = (u, v) => VPY + (lerp(YT, YB, v) - VPY) * sAt(u);
    const gv = { ...GAUSS() };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 5.0), tI = T("idea", 2.5);
      const wd = OAK(), pl = PLASTER(), dk = mix(D.n2, D.rust[2], 0.22);
      const idea = P(t, tI, 0.35, "back"), after = t >= tI;
      const CX = Math.round(bx(1.02)), WV = 1.2, wy = Math.round(by(1.02, WV));
      R(g, 0, 0, 640, 360, D.n1);
      // ---- the room in one-point perspective: we look along the front wall to the far corner (stove, coat pegs) ----
      const UF = 1.02, CE0 = -46, FL0 = 378, XR0 = X0 + 1140;
      const cyy = (u) => VPY + (CE0 - VPY) * sAt(u), fyy = (u) => VPY + (FL0 - VPY) * sAt(u), xr = (u) => VPX + (XR0 - VPX) * sAt(u);
      const at = (xn, u) => VPX + (xn - VPX) * sAt(u);   // a near-plane x carried to depth u
      PX.par(g, c, 0.65, () => {
        poly(g, [[xr(UF), cyy(UF) - 4], [XR0 + 40, cyy(0) - 60], [XR0 + 40, fyy(0) + 40], [xr(UF), fyy(UF)]], mix(pl, dk, 0.6));   // the room's back wall on the right
        // ceiling: planks across, oak beams running away from us
        const ceil = [[X0 - 40, cyy(0) - 60], [XR0, cyy(0) - 60], [xr(UF), cyy(UF)], [bx(UF), cyy(UF)]];
        poly(g, ceil, mix(wd[1], D.n1, 0.6));
        clipPoly(g, ceil, () => { for (let k = 0; k < 12; k++) { const u = (k / 12) ** 1.6 * UF; R(g, X0 - 40, Math.round(cyy(u)), 800, 1, mix(wd[2], D.n1, 0.4)); } });
        for (let k = 1; k < 7; k++) { const xn = X0 + (k * (XR0 - X0)) / 7; poly(g, [[xn - 16, cyy(0)], [xn + 16, cyy(0)], [at(xn + 16, UF), cyy(UF)], [at(xn - 16, UF), cyy(UF)]], mix(wd[2], D.n1, 0.25)); PX.line(g, xn - 16, cyy(0), at(xn - 16, UF), cyy(UF), mix(wd[2], wd[1], 0.35)); }
        // the room's back wall on the right (plain plaster, a door far off) and the floor
        poly(g, [[bx(UF), fyy(UF)], [xr(UF), fyy(UF)], [XR0, fyy(0) + 40], [X0 - 40, fyy(0) + 40]], mix(wd[1], D.n2, 0.5));
        for (let k = 0; k < 14; k++) { const xn = X0 + (k * (XR0 - X0)) / 14; PX.line(g, xn, fyy(0), at(xn, UF), fyy(UF), mix(wd[2], D.n1, 0.35)); }
        // far wall: plaster over wainscot, coat pegs, the tiled stove in the corner
        const fx0 = bx(UF), fx1 = xr(UF), fy0 = cyy(UF), fy1 = fyy(UF), fh = fy1 - fy0, mm = fh / 2.6;
        R(g, fx0, fy0, fx1 - fx0, fh, mix(pl, dk, 0.45)); R(g, fx0, fy1 - 0.92 * mm, fx1 - fx0, 0.92 * mm, mix(wd[2], D.n1, 0.2)); R(g, fx0, Math.round(fy1 - 0.92 * mm), fx1 - fx0, 1, wd[1]);
        const tile = mix(D.moss[2], D.teal[2], 0.3), sw2 = Math.round(0.75 * mm);
        R(g, fx0 + 1, Math.round(fy1 - 1.7 * mm), sw2, Math.round(1.7 * mm), mix(tile, D.n1, 0.2));
        for (let j = 0; j < 6; j++) R(g, fx0 + 1, Math.round(fy1 - (j * 0.28 + 0.3) * mm), sw2, 1, mix(tile, D.n0, 0.45));
        R(g, fx0 + 1, Math.round(fy1 - 1.7 * mm), sw2, 1, mix(tile, D.lamp, 0.3)); R(g, fx0 + Math.round(sw2 / 2), fy0, 2, Math.round(fy1 - 1.7 * mm - fy0), mix(D.n2, D.n0, 0.3));
        const flk = 0.5 + 0.5 * Math.sin(t * 9) * Math.sin(t * 3.7); A(g, 0.5 + 0.3 * flk, () => R(g, fx0 + 3, Math.round(fy1 - 0.45 * mm), Math.max(2, sw2 - 5), 2, D.amber[0])); PX.glow(g, fx0 + sw2 / 2, fy1 - 0.4 * mm, 14, D.lampD, 0.1 + 0.05 * flk);
        for (let k = 0; k < 5; k++) { const px2 = Math.round(fx0 + sw2 + 10 + k * ((fx1 - fx0 - sw2 - 16) / 5)), py2 = Math.round(fy1 - 1.6 * mm); R(g, px2, py2, 2, 1, wd[0]); if (k % 2 === 0) R(g, px2 - 2, py2 + 1, 5, Math.round(0.7 * mm), mix(COATS()[k], D.n1, 0.45)); }
        R(g, fx1 - 1, fy0, 1, fh, mix(pl, dk, 0.75));
        // light from the windows behind us falling on the floor and the back wall
        A(g, 0.1, () => poly(g, [[at(200, 0.25), fyy(0.25)], [at(420, 0.25), fyy(0.25)], [at(420, 0.6), fyy(0.6)], [at(200, 0.6), fyy(0.6)]], D.lamp));
        A(g, 0.07, () => poly(g, [[xr(0.15), cyy(0.15) + 40], [xr(0.45), cyy(0.45) + 18], [xr(0.45), fyy(0.45) - 10], [xr(0.15), fyy(0.15) - 30]], D.lamp));
        // the other pupils in the rows behind him, facing the board (left), quiet silhouettes bent over slates
        for (const [xn, rowShade] of [[300, 0], [640, 1]]) for (const u of [0.85, 0.6, 0.38]) {
          const s = sAt(u), x2 = at(xn, u), yb = fyy(u), m2 = 163 * s, seat = yb - 0.42 * m2;
          const fog = (col) => mix(col, mix(pl, dk, 0.55), 0.35 + (u - 0.38) * 0.6 + rowShade * 0.1);
          const ci = Math.floor(hash(xn, u * 10) * 7), coat = fog(COATS()[ci]), hair = fog(HAIRS()[ci % 6]), desk = fog(wd[1]);
          // long desk in front of them (to the left) and the bench
          R(g, x2 - 0.55 * m2, seat - 0.32 * m2, 0.32 * m2, 0.05 * m2 + 1, desk); R(g, x2 - 0.5 * m2, seat - 0.27 * m2, 0.06 * m2 + 1, 0.69 * m2, fog(wd[2]));
          R(g, x2 - 0.2 * m2, seat, 0.42 * m2, 0.05 * m2 + 1, desk);
          // torso leaning toward the desk, head bent, writing arm
          const tw2 = Math.max(3, Math.round(0.24 * m2)), th2 = Math.round(0.42 * m2), lean = Math.round(0.08 * m2);
          poly(g, [[x2 - tw2 / 2, seat], [x2 + tw2 / 2, seat], [x2 + tw2 / 2 - lean, seat - th2], [x2 - tw2 / 2 - lean, seat - th2]], coat);
          R(g, x2 - tw2 / 2 - lean - 0.18 * m2, seat - th2 + 0.12 * m2, 0.2 * m2, Math.max(2, 0.07 * m2), coat);
          const hr2 = Math.max(2, Math.round(0.1 * m2)); PX.circle(g, Math.round(x2 - lean - 0.06 * m2), Math.round(seat - th2 - hr2 * 0.6), hr2, hair);
          R(g, Math.round(x2 - lean - 0.06 * m2 - hr2), Math.round(seat - th2 - hr2 * 0.4), Math.max(1, Math.round(hr2 * 0.5)), Math.max(1, hr2), fog(SKINS()[ci % 4]));
        }
      });
      // ---- the front wall running away from us (plaster over dark wainscot), the board on it ----
      PX.par(g, c, 0.65, () => {
        const vC = (CE0 - YT) / (YB - YT), vF = (FL0 - YT) / (YB - YT);
        const wq = (v0, v1) => [[X0 - 2, by(0, v0)], [bx(UF), by(UF, v0)], [bx(UF), by(UF, v1)], [X0 - 2, by(0, v1)]];
        poly(g, wq(vC - 0.3, WV), mix(pl, dk, 0.32));
        A(g, 0.1, () => poly(g, wq(vC - 0.3, -0.2), dk));
        poly(g, wq(WV, vF + 0.2), mix(wd[2], D.n1, 0.15)); PX.line(g, X0, by(0, WV), bx(UF), by(UF, WV), wd[1]);
        for (let k = 0; k < 26; k++) { const u = (k / 26) ** 1.3; PX.line(g, bx(u), by(u, WV + 0.02), bx(u), by(u, vF), mix(wd[2], D.n0, 0.35)); }
        // a framed print high on the wall near us, and the corner line
        const pa = 0.02, pb = 0.12;
        poly(g, [[bx(pa), by(pa, -0.36)], [bx(pb), by(pb, -0.36)], [bx(pb), by(pb, -0.06)], [bx(pa), by(pa, -0.06)]], mix(wd[2], D.n0, 0.2));
        poly(g, [[bx(pa + 0.01), by(pa + 0.01, -0.32)], [bx(pb - 0.01), by(pb - 0.01, -0.32)], [bx(pb - 0.01), by(pb - 0.01, -0.1)], [bx(pa + 0.01), by(pa + 0.01, -0.1)]], mix(D.paperD, D.paper, 0.3));
        PX.line(g, bx(pa + 0.015), by(pa + 0.015, -0.15), bx(pb - 0.015), by(pb - 0.015, -0.2), mix(D.moss[2], D.paperD, 0.3)); PX.line(g, bx(pa + 0.015), by(pa + 0.015, -0.18), bx(0.07), by(0.07, -0.26), mix(D.moss[2], D.paperD, 0.4)); PX.line(g, bx(0.07), by(0.07, -0.26), bx(pb - 0.015), by(pb - 0.015, -0.16), mix(D.moss[2], D.paperD, 0.4));
        R(g, CX, Math.round(cyy(UF)), 1, Math.round(fyy(UF) - cyy(UF)), mix(pl, dk, 0.75));

        const U1 = 1.0, fr = 0.035;
        // frame + slate surface
        poly(g, [[bx(0), by(0, -fr)], [bx(U1), by(U1, -fr)], [bx(U1), by(U1, 1 + fr)], [bx(0), by(0, 1 + fr)]], wd[1]);
        poly(g, [[bx(0), by(0, 0)], [bx(U1 - 0.01), by(U1 - 0.01, 0)], [bx(U1 - 0.01), by(U1 - 0.01, 1)], [bx(0), by(0, 1)]], SLATE());
        PX.line(g, bx(0), by(0, -fr), bx(U1), by(U1, -fr), wd[0]);
        // old erasures on the slate, then the chalk ledge with chalk + rag
        for (let k = 0; k < 6; k++) { const u0 = hash(k, 3) * 0.6, u1 = u0 + 0.05 + hash(3, k) * 0.12, v0 = 0.55 + hash(k, 5) * 0.3; A(g, 0.05, () => poly(g, [[bx(u0), by(u0, v0)], [bx(u1), by(u1, v0)], [bx(u1), by(u1, v0 + 0.12)], [bx(u0), by(u0, v0 + 0.12)]], D.cream)); }
        poly(g, [[bx(0), by(0, 1.03)], [bx(U1), by(U1, 1.03)], [bx(U1), by(U1, 1.1)], [bx(0), by(0, 1.1)]], wd[0]);
        poly(g, [[bx(0.05), by(0.05, 1.01)], [bx(0.058), by(0.058, 1.01)], [bx(0.058), by(0.058, 1.04)], [bx(0.05), by(0.05, 1.04)]], CHALK());
        poly(g, [[bx(0.2), by(0.2, 0.99)], [bx(0.23), by(0.23, 0.99)], [bx(0.23), by(0.23, 1.04)], [bx(0.2), by(0.2, 1.04)]], mix(D.paperD, D.n4, 0.4));
        // the tiles: wooden plaques with a pale blank face, each hung on a nail
        const v0 = 0.2, v1 = 0.56;
        for (let i = NT - 1; i >= 0; i--) {
          const ua = (i / NT) * 0.985, ub = ua + (0.985 / NT) * 0.72, s = sAt(ua);
          const q = [[bx(ua), by(ua, v0)], [bx(ub), by(ub, v0)], [bx(ub), by(ub, v1)], [bx(ua), by(ua, v1)]];
          A(g, 0.45, () => poly(g, q.map(([x, y]) => [x + Math.max(1, 4 * s), y + Math.max(1, 5 * s)]), "#000000"));
          poly(g, q, mix(wd[0], D.paperD, 0.3));
          if (s > 0.25) {
            const ins = 0.12, qa = ua + (ub - ua) * ins, qb = ub - (ub - ua) * ins, w0 = v0 + (v1 - v0) * 0.1, w1 = v1 - (v1 - v0) * 0.1;
            poly(g, [[bx(qa), by(qa, w0)], [bx(qb), by(qb, w0)], [bx(qb), by(qb, w1)], [bx(qa), by(qa, w1)]], mix(D.paper, D.paperD, 0.25 + 0.2 * (1 - s)));
            PX.line(g, bx(qa), by(qa, w0), bx(qb), by(qb, w0), mix(D.paper, D.cream, 0.5));
          }
          PX.line(g, bx(ub), by(ub, v0), bx(ub), by(ub, v1), mix(wd[2], D.n0, 0.2));
          if (s > 0.18) { const nx = (bx(ua) + bx(ub)) / 2, ny = by((ua + ub) / 2, v0) - Math.max(1, 3 * s); R(g, nx, ny, Math.max(1, Math.round(2 * s)), Math.max(1, Math.round(2 * s)), D.n4); }
        }
        // daylight raking along the board from the side window
        A(g, 0.07, () => poly(g, [[bx(0), by(0, -0.05)], [bx(0.5), by(0.5, -0.05)], [bx(0.5), by(0.5, 0.7)], [bx(0), by(0, 1.1)]], D.lamp));
      });
      dust(g, 91, 36, t, [0, 0, 640, 300], D.cream, 0.4);
      // ---- the boy, close: head and shoulders, 3/4 view facing up-left ----
      PX.par(g, c, 1.0, () => {
        g.translate(0, -42 - Math.round(3 * P(t, tI, 0.3, "out")));   // above his desk; he sits up a little at the idea
        const sk = gv.skin, skL = mix(sk, D.cream, 0.3), skD = mix(sk, D.rust[2], 0.42), skDD = mix(skD, D.n0, 0.3);
        const [hL, h, hD] = sh3(gv.hair), [cL, cc, cD] = sh3(gv.coat), sh = gv.shirt, shD = mix(sh, D.n3, 0.35);
        const brt = Math.round(Math.sin(t * 1.4) * 0.8);
        const HX = 480, HY = 274 + brt;
        // shoulders + jacket (cropped by the frame), shirt collar
        poly(g, [[HX - 58, 372], [HX - 46, 318 + brt], [HX - 18, 304 + brt], [HX + 26, 306 + brt], [HX + 52, 320 + brt], [HX + 66, 372]], cc);
        poly(g, [[HX - 58, 372], [HX - 46, 318 + brt], [HX - 40, 316 + brt], [HX - 50, 372]], cL);
        poly(g, [[HX + 40, 316 + brt], [HX + 52, 320 + brt], [HX + 66, 372], [HX + 48, 372]], cD);
        poly(g, [[HX - 16, 304 + brt], [HX - 4, 332 + brt], [HX - 10, 372], [HX - 22, 372], [HX - 26, 312 + brt]], cD);   // lapel shadow
        poly(g, [[HX - 18, 302 + brt], [HX + 14, 302 + brt], [HX + 6, 322 + brt], [HX - 2, 316 + brt], [HX - 10, 322 + brt]], sh);
        PX.line(g, HX - 18, 302 + brt, HX - 10, 322 + brt, shD); PX.line(g, HX + 14, 302 + brt, HX + 6, 322 + brt, shD);
        R(g, HX - 5, 330 + brt, 2, 2, D.amber[1]); R(g, HX - 7, 346 + brt, 2, 2, D.amber[1]);
        // neck
        poly(g, [[HX - 10, 292 + brt], [HX + 10, 290 + brt], [HX + 8, 306 + brt], [HX - 8, 308 + brt]], skD); R(g, HX - 9, 293 + brt, 5, 12, sk);
        // back hair mass + ear (right side of the head, toward us)
        ell(g, HX + 6, HY - 6, 24, 26, hD); ell(g, HX + 5, HY - 7, 23, 25, h);
        ell(g, HX + 19, HY + 4, 5, 7, skD); ell(g, HX + 18, HY + 3, 4, 6, sk); R(g, HX + 17, HY + 1, 1, 5, skD);
        // face (3/4 to the left, chin lifted)
        const FX = HX - 6, FY = HY + 2;
        ell(g, FX, FY, 17, 21, skD); ell(g, FX - 1, FY - 1, 16, 20, sk); ell(g, FX - 7, FY - 6, 8, 9, skL);
        ell(g, FX + 8, FY + 10, 6, 5, mix(sk, D.rose[1], 0.25));   // cheek
        R(g, FX - 16, FY + 2, 3, 6, sk);   // jaw line toward the far side
        // eyes: pupils travel along the row, dart to its ends before the idea, widen after
        const scan = Math.sin(t * 1.3), dart = t > tI - 0.9 && t < tI ? (Math.floor((t - (tI - 0.9)) / 0.3) % 2 ? 1 : -1) : null;
        const px = after ? -1 : dart !== null ? dart : Math.round(scan);
        const wide = after ? 1 : 0, blink = PX.blink(t + 0.4, 3.1, 0.05) && !(t > tI - 0.1 && t < tI + 0.6);
        const eye = (ex, ey, w, near) => {
          if (blink) { R(g, ex, ey + 2, w, 1, skDD); return; }
          R(g, ex, ey - wide, w, 4 + wide, D.cream); R(g, ex, ey - 1 - wide, w, 1, skDD);
          const ix = ex + Math.round((w - 3) / 2) + px, iy = ey - 1 - wide + (near ? 0 : 0);
          R(g, ix, iy + 1, 3, 3, mix(D.steel[2], D.n1, 0.25)); R(g, ix + 1, iy + 1, 1, 2, D.n0); R(g, ix, iy + 1, 1, 1, D.cream);
          R(g, ex, ey + 3, w, 1, mix(sk, D.n0, 0.12));
        };
        eye(FX - 12, FY - 3, 5, false);   // far eye
        eye(FX + 1, FY - 3, 6, true);     // near eye
        // brows: knit while thinking, lifted after the idea
        const bu = after ? -2 : 0, knit = after ? 0 : 1;
        R(g, FX - 13, FY - 7 + bu, 5, 1, hD); R(g, FX - 9, FY - 8 + bu + knit, 1, 1, hD);
        R(g, FX + 1, FY - 8 + bu + knit, 3, 1, hD); R(g, FX + 4, FY - 8 + bu, 4, 1, hD); R(g, FX + 1, FY - 7 + bu + knit, 1, 1, hD);
        // nose toward the left, mouth: pressed in thought, then a small smile
        R(g, FX - 8, FY + 1, 2, 6, skD); R(g, FX - 10, FY + 6, 4, 2, skD); R(g, FX - 7, FY + 2, 1, 4, skL);
        if (after) { R(g, FX - 8, FY + 12, 9, 1, mix(skD, D.rust[2], 0.45)); R(g, FX + 1, FY + 11, 2, 1, mix(skD, D.rust[2], 0.45)); R(g, FX - 9, FY + 11, 1, 1, mix(skD, D.rust[2], 0.4)); R(g, FX - 6, FY + 13, 5, 1, mix(sk, D.rust[1], 0.25)); }
        else { R(g, FX - 7, FY + 12, 7, 1, mix(skD, D.rust[2], 0.4)); R(g, FX - 7, FY + 13, 3, 1, skD); }
        // hair: shaggy fringe over the forehead, crown, strands, rim light from the window side
        ell(g, HX + 2, HY - 20, 22, 12, h);
        R(g, FX - 17, FY - 19, 30, 5, h);
        for (let k = 0; k < 7; k++) {   // tapered locks of the fringe, lighter toward the window side
          const lx = FX - 18 + k * 5, len = 6 + Math.round(hash(k, 4) * 5) - (k > 4 ? 2 : 0), col = k < 3 ? mix(h, hL, 0.35) : h;
          poly(g, [[lx, FY - 15], [lx + 6, FY - 15], [lx + 3 + (k % 2), FY - 15 + len]], col);
          PX.line(g, lx + 5, FY - 15, lx + 3 + (k % 2), FY - 15 + len - 1, hD);
        }
        for (let k = 0; k < 7; k++) PX.line(g, HX - 10 + k * 5, HY - 30 + (k % 2), HX - 14 + k * 6, HY - 20 + (k % 3), k % 2 ? hD : mix(h, hL, 0.5));
        R(g, HX - 14, HY - 32, 18, 1, hL); R(g, HX - 18, HY - 28, 6, 1, hL); R(g, HX - 22, HY - 22, 1, 10, hL);
        R(g, HX + 24, HY - 8, 3, 14, hD); R(g, HX + 18, HY + 14, 6, 4, hD);   // back of the hair, nape
        // the spark of insight: a small warm star that pops, twinkles and settles away
        if (after) {
          const life = t - tI, k2 = clamp(idea, 0, 1.2), fade = 1 - P(t, tI + 1.4, 0.6, "io");
          if (fade > 0) {
            const sx2 = HX - 16, sy2 = HY - 42 - Math.round(life * 2), r1 = Math.round(2 + 7 * k2), tw = 0.75 + 0.25 * Math.sin(life * 18);
            A(g, fade, () => {
              R(g, sx2 - r1, sy2, 2 * r1 + 1, 1, D.amber[0]); R(g, sx2, sy2 - r1, 1, 2 * r1 + 1, D.amber[0]);
              const r2 = Math.round(r1 * 0.45); PX.line(g, sx2 - r2, sy2 - r2, sx2 + r2, sy2 + r2, D.amber[1]); PX.line(g, sx2 - r2, sy2 + r2, sx2 + r2, sy2 - r2, D.amber[1]);
              R(g, sx2 - 1, sy2 - 1, 3, 3, D.cream);
              for (let k3 = 0; k3 < 4; k3++) { const a = k3 * 1.57 + 0.8, rr2 = 6 + life * 14; if (life < 0.8) R(g, sx2 + Math.round(Math.cos(a) * rr2), sy2 + Math.round(Math.sin(a) * rr2), 1, 1, D.amber[0]); }
            });
          }
        }
      });
      // foreground: the edge of his desk, out of the light
      PX.par(g, c, 1.1, () => {
        // his desk across the front of the frame: lit top edge, his blank slate, his hands resting on it
        const dTop = 304, sk = gv.skin, skL = mix(sk, D.cream, 0.28), skD = mix(sk, D.rust[2], 0.42), [, cc, cD] = sh3(gv.coat);
        R(g, -40, dTop, 720, 12, mix(wd[1], D.n1, 0.2)); R(g, -40, dTop, 720, 1, mix(wd[0], D.lamp, 0.2)); R(g, -40, dTop + 12, 720, 60, mix(wd[2], D.n0, 0.4)); R(g, -40, dTop + 12, 720, 1, mix(wd[2], D.n0, 0.6));
        for (let k = 0; k < 6; k++) R(g, Math.round(hash(k, 7) * 600), dTop + 3 + (k % 3) * 3, 30 + Math.round(hash(7, k) * 60), 1, mix(wd[1], D.n0, 0.3));
        R(g, 360, dTop - 3, 70, 9, mix(wd[0], D.paperD, 0.2)); R(g, 363, dTop - 2, 64, 6, SLATE()); R(g, 360, dTop - 3, 70, 1, mix(wd[0], D.cream, 0.3));
        capsule(g, 436, dTop + 3, 468, dTop + 1, 7, cD); capsule(g, 437, dTop + 1, 468, dTop - 1, 6, cc); R(g, 432, dTop - 4, 8, 3, mix(cc, D.lamp, 0.25));
        ell(g, 462, dTop + 1, 9, 5, skD); ell(g, 461, dTop, 8, 4, sk); R(g, 455, dTop - 3, 8, 1, skL);
        capsule(g, 548, dTop + 5, 500, dTop + 4, 7, cD); capsule(g, 547, dTop + 3, 500, dTop + 3, 6, cc);
        ell(g, 492, dTop + 3, 9, 5, skD); ell(g, 491, dTop + 2, 8, 4, sk); for (let k = 0; k < 3; k++) R(g, 484 + k * 4, dTop - 1, 2, 3, skL);
        A(g, 0.35, () => R(g, 300, dTop + 12, 300, 3, "#000000"));
      });
      A(g, 0.25, () => { const gr = g.createLinearGradient(0, 0, 0, 160); gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 640, 160); });   // keep the ceiling quiet
      PX.vignette(g, 0.55);
    };
  };
})();
