/* EP5 Builder F: personality, the catch, what you can do, exploring. Documentary palette PX.D only (cool nocturnal,
   warm cream lamps, the amber YOU dot as the one warm accent).
   Kinds: volunteers, judge_ladder, neighborhood, inside_machine, two_lists, sad_feed, controls, explore. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, E = PX.ease, P = PX.p;
  const TAU = Math.PI * 2;

  // ---------- colour + shape helpers ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A0 = hx(a), B0 = hx(b); k = clamp(k, 0, 1); return "#" + A0.map((v, i) => Math.round(v + (B0[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const sh3 = (c) => [mix(c, D.cream, 0.28), c, mix(c, D.n0, 0.45)];
  const ell = (g, cx, cy, rx, ry, col) => { g.fillStyle = col; for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
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
  const A = (g, a, fn) => { if (a <= 0) return; const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  // option time resolver: o[k] if a number, else the default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  // range option: [a, b] array, or a scalar start (span keeps its default length), or the scaled default
  const span = (o, d, typ, k, a, b) => {
    const v = o[k];
    if (Array.isArray(v) && v.length >= 2) return [v[0], Math.max(v[1], v[0] + 0.05)];
    if (typeof v === "number") return [v, v + ((b - a) * d) / typ];
    return [(a * d) / typ, (b * d) / typ];
  };
  // label: outlined, centred, fades + rises in over 0.4 s; fades out after `t1` if given
  const label = (g, s, x, y, t, t0, o) => {
    o = o || {}; if (t < t0) return;
    const k = P(t, t0, 0.4, "out"), out = o.t1 === undefined ? 1 : 1 - P(t, o.t1, 0.4, "io");
    A(g, k * out * (o.a === undefined ? 1 : o.a), () => PX.otext(g, s, x, y + Math.round(3 * (1 - k)), { align: o.align || "center", col: o.col || D.cream, outline: D.n0, size: o.size || 8, font: o.font }));
  };
  const woodCols = (k) => { const w = mix(mix(D.rust[2], D.amber[2], 0.4), D.n2, k === undefined ? 0.5 : k); return [mix(w, D.lamp, 0.22), w, mix(w, D.n0, 0.42)]; };

  // ---------- recurring motifs ----------
  // the YOU dot: small warm amber dot, soft 1px cream ring, faint pulse
  const youDot = (g, x, y, t, a) => {
    a = a === undefined ? 1 : a; if (a <= 0) return;
    x = Math.round(x); y = Math.round(y);
    A(g, a, () => {
      const ph = frac(t / 1.9);
      A(g, 0.4 * (1 - ph), () => ring(g, x, y, 4 + ph * 6, 4 + ph * 6, () => D.amber[0]));
      PX.glow(g, x, y, 10, D.amber[1], 0.22);
      A(g, 0.75, () => ring(g, x, y, 4, 4, () => D.cream));
      PX.circle(g, x, y, 2, D.amber[1]); R(g, x - 1, y - 1, 2, 1, D.amber[0]); R(g, x + 1, y + 1, 1, 1, D.amber[2]);
    });
  };
  // other people's dots (cool cream / steel) and videos (small teal squares)
  const otherDot = (g, x, y, k) => { x = Math.round(x); y = Math.round(y); const c = mix(D.steel[0], D.cream, k === undefined ? 0.4 : k); R(g, x - 1, y, 3, 1, c); R(g, x, y - 1, 1, 3, c); };
  const videoSq = (g, x, y, lit) => { x = Math.round(x); y = Math.round(y); R(g, x - 1, y - 1, 3, 3, mix(D.teal[1], D.teal[0], lit || 0)); R(g, x - 1, y - 1, 1, 1, D.teal[0]); };
  // pixel thumbs-up (not a glyph), 9x9
  const THUMB = ["....##...", "...##....", "...##....", "##.#####.", "##.######", "##.#####.", "##.######", "##.#####.", "##..####."];
  // dust in a light pool
  const dust = (g, seed, n, t, box, col, a) => PX.particles(g, seed, n, t, box, { vy: -1.6, vx: 1.1, col: col || D.lamp, a: a === undefined ? 0.4 : a, tw: 1.3 });

  // ---------- people ----------
  const SKINS = () => [mix(D.rose[0], D.lampD, 0.3), mix(D.lampD, D.rust[2], 0.45), mix(D.rust[2], D.n1, 0.42), mix(D.rose[0], D.paper, 0.4)];
  const HAIRS = () => [mix(D.n0, D.rust[2], 0.25), D.n0, mix(D.rust[2], D.n1, 0.2), mix(D.paperD, D.amber[2], 0.3), D.n6, mix(D.rust[1], D.rust[2], 0.5)];
  const SHIRTS = () => [mix(D.steel[2], D.n3, 0.2), mix(D.moss[2], D.n2, 0.25), mix(D.rust[2], D.n2, 0.3), mix(D.paperD, D.n3, 0.45), D.n4, mix(D.teal[2], D.n2, 0.2), mix(D.plum[2], D.n2, 0.2), mix(D.rose[2], D.n2, 0.35)];

  // volunteer seen from behind, seated at a desk. x = centre, y = desk near edge, s = scale. w = writing 0..1, up = looks up 0..1
  const backSitter = (g, x, y, s, t, v, w, up) => {
    const [cL, c, cD] = sh3(v.shirt), [hL, h, hD] = sh3(v.hair), sk = v.skin;
    const bw = Math.max(4, Math.round(24 * s)), sy = Math.round(y - 11 * s), hr = Math.max(2, Math.round(6.5 * s));
    const jx = w > 0 ? Math.round(Math.sin(t * 9 + v.ph) * 1.2 * s * w) : 0, jy = w > 0 ? Math.round(Math.abs(Math.sin(t * 13 + v.ph)) * s * w) : 0;
    const lift = Math.round(up * 3 * s);
    // writing arm (right elbow out, moving)
    if (s > 0.35) { R(g, x + bw / 2 - 2 * s + jx, sy + 3 * s + jy, Math.max(2, 6 * s), Math.max(2, 10 * s), c); R(g, x + bw / 2 + 3 * s + jx, sy + 4 * s + jy, Math.max(1, s), Math.max(1, 8 * s), cD); }
    // torso: rounded shoulders, back, lamp light on the shoulder tops, shadowed left side
    const th = Math.round(26 * s), rc = Math.max(1, Math.round(2 * s));
    R(g, x - bw / 2, sy + rc, bw, th - rc, c); R(g, x - bw / 2 + rc, sy, bw - 2 * rc, rc, c);
    R(g, x - bw / 2, sy + rc, Math.max(1, Math.round(4 * s)), th - rc, cD); R(g, x - bw / 2 + rc, sy, bw - 2 * rc - 1, 1, cL);
    if (s > 0.8) { R(g, x - bw / 2 + 1, sy + rc - 1, rc, 1, cL); R(g, x + bw / 2 - rc - 1, sy + rc - 1, rc, 1, cL); }
    if (s > 0.5) R(g, x + 1, sy + 5 * s, 1, 12 * s, cD);
    if (s > 0.8 && v.hood) { ell(g, x, Math.round(sy + 3 * s), Math.round(7 * s), Math.round(3.5 * s), cD); ell(g, x, Math.round(sy + 2 * s), Math.round(6 * s), Math.round(2.5 * s), c); R(g, x - Math.round(5 * s), Math.round(sy + 0.5 * s), Math.round(10 * s), 1, cL); }
    else if (s > 0.8) R(g, x - Math.round(4 * s), sy - 1, Math.round(8 * s), Math.max(1, Math.round(1.5 * s)), cD);   // collar
    // neck + head (bent over the paper; looks up when up > 0)
    const hy = Math.round(sy - hr + 1 - lift + (1 - up) * s);
    R(g, x - Math.max(1, Math.round(2 * s)), sy - Math.round(3 * s), Math.max(2, Math.round(4 * s)), Math.round(4 * s), mix(sk, D.n0, 0.3));
    if (s > 0.45) { R(g, x - hr - 1, hy, 1, Math.max(2, 3 * s), mix(sk, D.n0, 0.2)); R(g, x + hr, hy, 1, Math.max(2, 3 * s), sk); }   // ears
    PX.circle(g, x, hy, hr, h);
    if (up > 0.3 && s > 0.5) { R(g, x + hr - 1, hy - 1, 2, Math.round(hr * 0.9), sk); R(g, x + hr + 1, hy + 1, 1, 2, sk); R(g, x + hr - 1, hy + Math.round(hr * 0.9) - 1, 2, 1, mix(sk, D.n0, 0.3)); }   // cheek + nose as the head turns to the stage
    // hair styles: 0 short, 1 long, 2 bun; strands + lamp highlight on the crown
    if (v.style === 1) { R(g, x - hr, hy, 2 * hr + 1, Math.round(hr + 6 * s), h); R(g, x - hr, hy, Math.max(1, Math.round(2 * s)), Math.round(hr + 6 * s), hD); }
    if (v.style === 2) { PX.circle(g, x, hy - hr + 1, Math.max(1, Math.round(2.5 * s)), hD); R(g, x - 1, hy - hr - Math.round(s), 2, 1, hL); }
    R(g, x - hr + 2, hy - hr + 1, Math.max(1, hr - 1), 1, hL); R(g, x - hr + 1, hy - hr + 2, Math.max(1, Math.round(hr * 0.5)), 1, hL); R(g, x + 1, hy + hr - 1, Math.max(1, hr - 2), 1, hD);
    if (s > 0.8) for (let k = 0; k < 4; k++) R(g, x - hr + 2 + Math.floor(hash(v.ph, k) * (2 * hr - 3)), hy - 2 + Math.floor(hash(k, v.ph) * hr), 1, Math.max(2, Math.round(2 * s)), mix(h, hD, 0.55));
    R(g, x - hr, hy - 1, 1, Math.max(1, Math.round(hr * 0.8)), hD);
  };
  // chair back (between us and the sitter)
  const chairBack = (g, x, y, s, wd) => {
    const cw = Math.max(4, Math.round(18 * s)), ch = Math.max(3, Math.round(10 * s)), cy = Math.round(y + 8 * s);
    R(g, x - cw / 2, cy, cw, ch, wd[1]); R(g, x - cw / 2, cy, cw, 1, wd[0]); R(g, x - cw / 2, cy + ch - 1, cw, 1, wd[2]);
    if (s > 0.5) { R(g, x - cw / 2 + 2, cy + ch, 2, Math.round(10 * s), wd[2]); R(g, x + cw / 2 - 4, cy + ch, 2, Math.round(10 * s), wd[2]); }
  };

  // ======================= volunteers =======================
  // a big study hall at night seen from the back: rows of volunteers writing long paper tests (o.test 0.5); on the
  // stage a quiet machine reads only a wall of thumbs-up page cards (o.likes 4.0). "86,000 VOLUNTEERS" (o.count 1.0).
  K.volunteers = (o) => {
    const HZ = 128, FL = 118, CH = 398, ZB = 3.69, HW = 664, ROWS = 6, ZS = [0.62, 0.95, 1.35, 1.85, 2.5, 3.3];
    const zr = (k) => ZS[k], yr = (z) => HZ + FL / z;
    const rows = [];
    for (let k = 0; k < ROWS; k++) {
      const z = zr(k), s = 0.95 / z, people = [];
      for (const sg of [-1, 1]) for (let i = 0; i < 20; i++) {
        const wx = 70 + i * 56; if (wx > HW * 1.0 - 40) break;
        const x = 320 + (sg * wx) / z; if (x < -30 || x > 670) continue;
        const r = PX.rnd(1000 + k * 97 + i * 7 + (sg > 0 ? 500 : 0));
        people.push({ x, sg, skin: SKINS()[Math.floor(r() * 4)], hair: HAIRS()[Math.floor(r() * 6)], shirt: SHIRTS()[Math.floor(r() * 8)], style: Math.floor(r() * 3), hood: r() < 0.35, ph: r() * 9, lag: r() * 0.8, stack: r() });
      }
      rows.push({ z, s, y: yr(z), people });
    }
    // the near volunteer who looks up at the machine
    const LOOKER = rows[0].people.findIndex((p) => p.sg > 0) + 1;
    const CARD = { x: 196, y: 52, cols: 9, rows: 5, w: 12, h: 13, gx: 3, gy: 2 };
    const NC = CARD.cols * CARD.rows;
    const wallPt = (z, hh) => { const xf = 320 - HW / z, yf = HZ + FL / z, yc = HZ - CH / z; return [xf, lerp(yf, yc, hh)]; };
    return (g, t, d, c) => {
      const T = tm(o, d, 8.0), tT = T("test", 0.5), tC = T("count", 1.0), tL = T("likes", 4.0);
      const write = P(t, tT, 0.6, "out"), prog = clamp((t - tT) / 7, 0, 1), lk = P(t, tL, 0.9, "io");
      const scanDur = 3.2, cur = ((t - tL - 0.4) / scanDur) * NC;
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: ceiling, back wall, stage, card wall, machine ----
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 62, D.n0, D.n1, 4);
        // coffered ceiling beams converging on the back wall
        for (let i = -6; i <= 6; i++) PX.line(g, 320 + i * 30, 20, 320 + i * 150, -60, D.n2);
        // back wall: panelled wood, darker at the top
        PX.vgrad(g, 140, 20, 360, 140, mix(D.n2, D.n1, 0.3), mix(D.n3, D.rust[2], 0.12), 6);
        for (let x = 150; x < 500; x += 30) R(g, x, 128, 1, 32, D.n2);
        R(g, 140, 126, 360, 2, mix(D.n3, D.paperD, 0.15));
        // stage curtains
        for (const [x0, dir] of [[140, 1], [500, -1]]) for (let k = 0; k < 6; k++) {
          const xx = x0 + dir * k * 6 - (dir < 0 ? 6 : 0), col = k % 2 ? mix(D.rust[2], D.n1, 0.55) : mix(D.rust[2], D.n2, 0.35);
          R(g, xx, 20, 6, 136, col); R(g, xx + (dir > 0 ? 5 : 0), 20, 1, 136, mix(col, D.n0, 0.4));
        }
        R(g, 140, 18, 360, 7, mix(D.rust[2], D.n1, 0.45)); for (let x = 144; x < 500; x += 12) R(g, x, 25, 8, 2, mix(D.rust[2], D.n1, 0.55));
        // spotlight cone on the machine (stronger once it reads)
        A(g, 0.035 + 0.05 * lk, () => poly(g, [[392, 18], [412, 18], [452, 150], [352, 150]], D.cream));
        // card wall: page cards with a thumbs-up each; read cards warm to cream
        R(g, CARD.x - 6, CARD.y - 6, CARD.cols * (CARD.w + CARD.gx) + 9, CARD.rows * (CARD.h + CARD.gy) + 10, mix(D.n2, D.paperD, 0.08));
        R(g, CARD.x - 6, CARD.y - 6, CARD.cols * (CARD.w + CARD.gx) + 9, 1, D.n4);
        for (let j = 0; j < CARD.rows; j++) for (let i = 0; i < CARD.cols; i++) {
          const n = j * CARD.cols + i, cx = CARD.x + i * (CARD.w + CARD.gx), cy = CARD.y + j * (CARD.h + CARD.gy) + (hash(i, j) < 0.3 ? 1 : 0);
          const rd = clamp(cur - n, 0, 1), hot = Math.abs(cur - n - 0.5) < 0.8 ? 1 : 0;
          const paper = mix(mix(D.paperD, D.n3, 0.55), D.cream, rd * 0.55 + hot * 0.2);
          R(g, cx, cy, CARD.w, CARD.h, paper); R(g, cx, cy, CARD.w, 1, mix(paper, D.cream, 0.3)); R(g, cx + CARD.w, cy + 1, 1, CARD.h, D.n1);
          R(g, cx + 5, cy - 1, 2, 2, mix(D.steel[1], D.n3, 0.3));   // pin
          PX.sprite(g, THUMB, cx + 2, cy + 3, { "#": mix(D.ink, paper, rd > 0 ? 0.15 : 0.35) });
          if (hot && lk > 0) PX.glow(g, cx + 6, cy + 6, 9, D.cream, 0.2);
        }
        // stage platform
        R(g, 150, 140, 340, 12, mix(D.n3, D.rust[2], 0.2)); R(g, 150, 140, 340, 1, mix(D.n5, D.lamp, 0.15 + 0.15 * lk));
        R(g, 146, 152, 348, 8, mix(D.n2, D.rust[2], 0.15)); R(g, 146, 152, 348, 1, D.n4);
        for (let x = 160; x < 490; x += 22) R(g, x, 141, 1, 10, mix(D.n2, D.rust[2], 0.2));
        // the machine: steel cabinet, lens toward the card wall, reels, screen, tape
        const mx = 368, my = 92, mw = 64, mh = 48, [stL, st, stD] = D.steel.map((v) => mix(v, D.n2, 0.5));
        A(g, 0.45, () => ell(g, mx + mw / 2 + 4, my + mh + 1, mw / 2 + 8, 3, "#000000"));
        R(g, mx, my, mw, mh, st); R(g, mx, my, mw, 1, stL); R(g, mx, my, 1, mh, stL); R(g, mx + mw - 3, my + 1, 3, mh - 1, stD); R(g, mx, my + mh - 2, mw, 2, stD);
        for (const [rx, ry] of [[mx + 3, my + 3], [mx + mw - 6, my + 3], [mx + 3, my + mh - 6], [mx + mw - 6, my + mh - 6]]) R(g, rx, ry, 1, 1, stL);
        // reels on top
        for (const [rx, dir] of [[mx + 16, 1], [mx + 48, -1]]) {
          R(g, rx - 1, my - 4, 2, 4, stD); PX.circle(g, rx, my - 9, 7, mix(D.n3, D.steel[2], 0.3)); PX.circle(g, rx, my - 9, 5, D.n2);
          const ang = t * 0.4 * dir + lk * t * 2.2 * dir;
          for (let k = 0; k < 3; k++) { const a = ang + (k * TAU) / 3; PX.line(g, rx, my - 9, rx + Math.cos(a) * 5, my - 9 + Math.sin(a) * 5, D.n5); }
          R(g, rx - 1, my - 10, 2, 2, D.n6);
        }
        PX.line(g, mx + 16, my - 16, mx + 48, my - 16, D.n5);
        // lens
        PX.circle(g, mx + 9, my + 14, 6, D.n1); PX.circle(g, mx + 9, my + 14, 4, mix(D.n1, D.teal[2], 0.4 + 0.6 * lk)); R(g, mx + 7, my + 12, 2, 1, mix(D.teal[0], D.n3, 1 - lk));
        // little screen: idle cursor, then a calm profile of five bars growing as the cards are read
        const sx = mx + 22, sy = my + 8, sw = 34, sh = 18;
        R(g, sx - 1, sy - 1, sw + 2, sh + 2, D.n1); R(g, sx, sy, sw, sh, mix(D.n0, D.teal[2], 0.25 + 0.25 * lk));
        if (lk <= 0.01) { if (PX.blink(t, 1.1)) R(g, sx + 3, sy + sh - 5, 3, 2, D.teal[0]); }
        else for (let b = 0; b < 5; b++) { const hh = Math.round((sh - 5) * clamp(cur / NC, 0, 1) * (0.35 + 0.65 * hash(b, 3))); R(g, sx + 3 + b * 6, sy + sh - 2 - hh, 4, hh, mix(D.teal[1], D.teal[0], 0.4)); }
        // status lamp + punched tape curling out once it has read enough
        const on = PX.blink(t, lk > 0 ? 0.7 : 2.2, 0.4); R(g, mx + mw - 10, my + mh - 9, 3, 3, on ? D.moss[0] : D.moss[2]); if (on) PX.glow(g, mx + mw - 9, my + mh - 8, 5, D.moss[0], 0.25);
        const tape = clamp((cur - 8) / (NC - 8), 0, 1);
        R(g, mx + 26, my + mh - 6, 14, 2, D.n1);
        if (tape > 0) { const tl = Math.round(tape * 16); for (let k = 0; k < tl; k++) { const yy = my + mh - 4 + k, xx = mx + 28 + (k > 8 ? k - 8 : 0); R(g, xx, yy, 9, 1, mix(D.paper, D.n3, 0.45 + (k % 2) * 0.08)); if (k % 2 === 0) R(g, xx + 2 + (k * 3) % 5, yy, 1, 1, D.n2); } }
        // cable off the stage
        PX.line(g, mx + mw - 2, my + mh - 2, mx + mw + 22, 151, D.n1);
        // reading beam from the lens to the card being read
        if (lk > 0 && cur >= 0 && cur < NC) {
          const n = Math.floor(cur), i = ((n % CARD.cols) + CARD.cols) % CARD.cols, j = Math.floor(n / CARD.cols);
          const tx = CARD.x + i * (CARD.w + CARD.gx) + 6, ty = CARD.y + j * (CARD.h + CARD.gy) + 6;
          A(g, 0.35 * lk, () => { PX.line(g, mx + 4, my + 14, tx, ty, D.teal[0]); });
          A(g, 0.12 * lk, () => poly(g, [[mx + 4, my + 12], [mx + 4, my + 16], [tx - 6, ty + 7], [tx - 6, ty - 7]], D.teal[0]));
          PX.glow(g, mx + 9, my + 14, 10, D.teal[0], 0.3 * lk);
        }
      });
      // ---- side walls with tall windows and moonlight ----
      PX.par(g, c, 0.5, () => {
        for (const sg of [-1, 1]) {
          const X = (x) => (sg < 0 ? x : 640 - x);
          const [ax, ay] = wallPt(ZB, 1), [bx, by] = wallPt(ZB, 0), [cx2, cy2] = wallPt(1.2, 0), [dx2, dy2] = wallPt(1.2, 1);
          poly(g, [[X(ax), ay], [X(bx), by], [X(cx2), cy2], [X(dx2), dy2]], mix(D.n2, D.n1, 0.45));
          for (const [z1, z2] of [[1.75, 2.05], [2.4, 2.7], [3.05, 3.35]]) {
            const q = [wallPt(z1, 0.82), wallPt(z2, 0.82), wallPt(z2, 0.3), wallPt(z1, 0.3)].map(([x, y]) => [X(x), y]);
            const qf = [wallPt(z1 - 0.06, 0.85), wallPt(z2 + 0.06, 0.85), wallPt(z2 + 0.06, 0.27), wallPt(z1 - 0.06, 0.27)].map(([x, y]) => [X(x), y]);
            poly(g, qf, D.n3);
            poly(g, q, mix(D.steel[2], D.n1, sg < 0 ? 0.35 : 0.5));
            const [mx0, my0] = wallPt((z1 + z2) / 2, 0.82), [mx1, my1] = wallPt((z1 + z2) / 2, 0.3); PX.line(g, X(mx0), my0, X(mx1), my1, D.n2);
            const [hx0, hy0] = wallPt(z1, 0.56), [hx1, hy1] = wallPt(z2, 0.56); PX.line(g, X(hx0), hy0, X(hx1), hy1, D.n2);
            if (sg < 0) PX.glow(g, X((q[0][0] + q[2][0]) / 2), (q[0][1] + q[2][1]) / 2, 22, D.steel[0], 0.08);
          }
        }
        // floor between the rows
        poly(g, [[140, 160], [500, 160], [720, 205], [720, 400], [-80, 400], [-80, 205]], mix(D.n2, D.n1, 0.35));
        for (let k = 0; k < 9; k++) { const z = 0.6 + k * 0.38, y = yr(z) + 12 / z; R(g, -40, y, 720, 1, mix(D.n2, D.n3, 0.5)); }
      });
      // ---- rows, far to near ----
      const wd = woodCols(0.6);
      for (let k = ROWS - 1; k >= 0; k--) {
        const row = rows[k], s = row.s, y = row.y, dep = lerp(1, 0.55, k / (ROWS - 1));
        PX.par(g, c, dep, () => {
          const fog = (col) => mix(col, D.n1, k * 0.09);
          // desk tops (two blocks either side of the aisle), lit edge
          const dh = Math.max(2, Math.round(9 * s));
          for (const sg of [-1, 1]) {
            const x0 = 320 + sg * 46 * s, x1 = 320 + sg * (HW - 20) / row.z, xa = Math.min(x0, x1), xb = Math.max(x0, x1);
            R(g, xa, y - dh, xb - xa, dh, fog(wd[1])); R(g, xa, y - dh, xb - xa, 1, fog(wd[0])); R(g, xa, y, xb - xa, Math.max(1, Math.round(2 * s)), fog(wd[2]));
          }
          row.people.forEach((v, idx) => {
            // paper sheets and a page stack that grows with the test
            const lagP = clamp((t - tT - v.lag) / 7, 0, 1);
            const pw = Math.max(3, Math.round(13 * s)), ph = Math.max(2, Math.round(6 * s)), px0 = Math.round(v.x + 13 * s), py0 = Math.round(y - dh + 1);
            R(g, px0, py0, pw, ph, fog(mix(D.paper, D.n4, 0.3))); R(g, px0, py0, pw, 1, fog(mix(D.paper, D.n4, 0.12))); R(g, px0, py0 + ph - 1, pw, 1, fog(D.paperD));
            if (s > 0.4) for (let l = 0; l < 3; l++) { const lw = Math.round((pw - 3) * clamp(lagP * 4 - l * 0.8, 0, 1)); if (lw > 0) R(g, px0 + 1, py0 + 1 + l * 2 * s, lw, 1, fog(mix(D.ink, D.paper, 0.3))); }
            const stH = Math.round(lagP * (2 + v.stack * 4) * s); if (stH > 0) { R(g, Math.round(v.x - 22 * s), py0 + ph - stH - 1, Math.max(3, Math.round(10 * s)), stH + 1, fog(mix(D.paper, D.paperD, 0.4))); R(g, Math.round(v.x - 22 * s), py0 + ph - stH - 1, Math.max(3, Math.round(10 * s)), 1, fog(D.cream)); }
            const up = k === 0 && idx === LOOKER ? P(t, tL + 0.3, 0.8, "io") : 0;
            const vv = k ? { ...v, shirt: fog(v.shirt), hair: fog(v.hair), skin: fog(v.skin) } : v;
            backSitter(g, Math.round(v.x), y, s, t, vv, write * (1 - up) * (hash(idx, k) < 0.85 ? 1 : 0), up);
            chairBack(g, Math.round(v.x), y, s, wd.map(fog));
          });
        });
      }
      // ---- light: pendant lamps over the side blocks, moonlight shafts, dust ----
      const lampK = 1 - 0.4 * lk;
      for (let k = 1; k < ROWS; k++) {
        const z = zr(k) + 0.25, ly = HZ - 200 / z;
        for (const sg of [-1, 1]) {
          const lx = 320 + (sg * 380) / z, sz = Math.max(3, Math.round(12 / z));
          PX.line(g, lx, ly - 4, lx, HZ - CH / z, D.n2);
          poly(g, [[lx - sz, ly + 2], [lx + sz, ly + 2], [lx + sz / 2, ly - 3], [lx - sz / 2, ly - 3]], D.n3);
          R(g, lx - sz + 1, ly + 2, 2 * sz - 1, 1, mix(D.lampD, D.n3, 1 - lampK));
          PX.glow(g, lx, ly + 3, 8 / z * 6, D.lamp, 0.16 * lampK);
          PX.glow(g, lx, yr(zr(k)) - 6, 70 / z, D.lampD, 0.12 * lampK);
        }
      }
      PX.glow(g, 110, 330, 120, D.lampD, 0.1 * lampK); PX.glow(g, 530, 330, 120, D.lampD, 0.1 * lampK);
      A(g, 0.045, () => { poly(g, [[40, 70], [80, 64], [260, 300], [190, 330]], D.steel[0]); poly(g, [[96, 92], [118, 88], [320, 250], [282, 262]], D.steel[0]); });
      // hall dims a little when the machine starts reading: focus moves to the stage
      A(g, 0.28 * lk, () => { R(g, -40, 162, 720, 240, "#000000"); R(g, -40, -40, 180, 220, "#000000"); R(g, 500, -40, 180, 220, "#000000"); });
      PX.glow(g, 400, 110, 60, D.cream, 0.05 + 0.07 * lk);
      dust(g, 51, 30, t, [330, 30, 140, 120], D.cream, 0.35);
      dust(g, 52, 26, t, [40, 150, 560, 180], D.lamp, 0.3 * lampK);
      PX.vignette(g, 0.55);
      label(g, "86,000 VOLUNTEERS", 320, 318, t, tC, { t1: tL - 0.2 });
      label(g, "ONLY THE LIKES", 264, 38, t, tL + 0.3);
    };
  };
  // standing figure, 3/4 view, feet at (x, y), ~62 px tall, faces right (v.flip faces left).
  // ex: 0 neutral, 1 surprised, 2 put out (brows down, glancing up after the robot). lean: px backwards
  const stander = (g, x, y, v, ex, lean) => {
    const f = v.flip ? -1 : 1, L = Math.round(lean || 0);
    const fr = (dx, dy, w, h, col) => R(g, f > 0 ? x + dx : x - dx - w + 1, y + dy, w, h, col);
    const [sL, sk, sD] = [mix(v.skin, D.cream, 0.25), v.skin, mix(v.skin, D.n0, 0.32)];
    const [tL, tp, tD] = sh3(v.top), [pL, pa, pD] = sh3(v.pants), [hL, hr, hD] = sh3(v.hair);
    A(g, 0.45, () => ell(g, x, y, 11, 2, "#000000"));
    // shoes + legs
    fr(-7, -3, 6, 3, D.n1); fr(1, -3, 8, 3, mix(D.n1, D.n3, 0.5)); fr(2, -3, 5, 1, D.n4);
    fr(-6, -25, 5, 22, pD); fr(1, -25, 5, 22, pa); fr(5, -25, 1, 22, pL);
    if (v.skirt) { fr(-8, -30, 17, 12, pa); fr(-8, -30, 4, 12, pD); fr(7, -30, 2, 12, pL); }
    // back arm (behind the body)
    fr(-10 - L, -45, 3, 17, tD); fr(-10 - L, -28, 3, 3, sD);
    // torso, rounded shoulders, light on the front edge
    fr(-7 - L, -47, 15, 1, tp); fr(-8 - L, -46, 17, 22, tp); fr(-8 - L, -46, 4, 22, tD); fr(7 - L, -45, 2, 21, tL); fr(-8 - L, -25, 17, 1, tD);
    if (v.tie) { fr(2 - L, -46, 3, 2, D.cream); fr(3 - L, -44, 2, 12, v.tie); fr(3 - L, -33, 2, 1, mix(v.tie, D.n0, 0.4)); PX.line(g, x + f * (-3 - L), y - 46, x + f * (-1 - L), y - 34, mix(D.steel[1], D.n3, 0.3)); fr(-2 - L, -34, 3, 4, D.cream); }
    if (v.tee) { fr(1 - L, -46, 4, 21, v.tee); fr(1 - L, -46, 4, 1, mix(v.tee, D.n0, 0.3)); fr(-1 - L, -46, 2, 21, tD); }
    if (v.cardi) { fr(1 - L, -46, 2, 21, tD); for (let k = 0; k < 4; k++) fr(3 - L, -43 + k * 5, 1, 1, D.paper); }
    // front arm: hangs, holds a prop, or flies up to the chest when surprised
    if (ex === 1) { fr(5 - L, -45, 4, 8, tp); fr(8 - L, -45, 1, 7, tL); fr(2 - L, -38, 7, 3, tp); fr(1 - L, -40, 3, 3, sk); }
    else { fr(5 - L, -45, 4, 17, tp); fr(8 - L, -44, 1, 16, tL); fr(5 - L, -28, 4, 3, sk); }
    if (v.prop === "mug" && ex !== 1) { fr(8, -33, 5, 6, D.cream); fr(8, -33, 5, 1, mix(D.cream, D.n6, 0.4)); fr(13, -32, 1, 3, D.paperD); fr(12, -28, 1, 1, D.paperD); }
    if (v.prop === "book" && ex !== 1) { fr(6, -34, 6, 8, mix(D.rust[2], D.n2, 0.2)); fr(6, -34, 1, 8, D.paper); }
    // neck + head (leans back when surprised)
    const H = -L * (ex === 1 ? 1 : 0);
    fr(-1 - L, -50, 4, 4, sD);
    fr(-5 + H - L, -63, 11, 14, sk); fr(-6 + H - L, -61, 13, 10, sk); fr(5 + H - L, -60, 1, 8, sL); fr(-6 + H - L, -52, 2, 2, sD);
    fr(-3 + H - L, -57, 2, 3, sD);   // ear
    // hair
    if (v.hs === "long") { fr(-7 + H - L, -62, 6, 18, hr); fr(-7 + H - L, -62, 2, 18, hD); }
    if (v.hs === "bun") { PX.circle(g, x + f * (-6 + H - L), y - 63, 3, hr); R(g, x + f * (-6 + H - L) - 1, y - 65, 2, 1, hL); }
    fr(-6 + H - L, -65, 12, 4, hr); fr(-7 + H - L, -62, 5, 6, hr); fr(-2 + H - L, -66, 7, 1, hr);
    if (v.hs === "fringe" || v.hs === "long") fr(1 + H - L, -62, 6, 2, hr);
    fr(-3 + H - L, -66, 6, 1, hL); fr(-5 + H - L, -64, 4, 1, hL); fr(-7 + H - L, -57, 2, 2, hD);
    // face
    const ey = -57, dark = D.n0, br = hD;
    if (ex === 1) { fr(1 + H - L, ey - 1, 2, 2, dark); fr(5 + H - L, ey - 1, 2, 2, dark); fr(1 + H - L, ey - 1, 1, 1, D.cream); fr(5 + H - L, ey - 1, 1, 1, D.cream);
      fr(0 + H - L, ey - 4, 3, 1, br); fr(4 + H - L, ey - 4, 3, 1, br); fr(3 + H - L, ey + 4, 2, 2, mix(D.n0, D.rust[2], 0.3)); }
    else if (ex === 2) { fr(1 + H - L, ey - 1, 2, 1, dark); fr(5 + H - L, ey - 1, 2, 1, dark); fr(0 + H - L, ey - 2, 3, 1, br); fr(4 + H - L, ey - 3, 3, 1, br);
      fr(3 + H - L, ey + 5, 3, 1, sD); fr(2 + H - L, ey + 6, 1, 1, sD); }
    else { fr(1 + H - L, ey, 1, 2, dark); fr(5 + H - L, ey, 1, 2, dark); fr(0 + H - L, ey - 2, 2, 1, br); fr(4 + H - L, ey - 2, 2, 1, br); fr(3 + H - L, ey + 5, 3, 1, sD); }
    if (v.glasses) { fr(0 + H - L, ey - 1, 3, 1, D.n2); fr(4 + H - L, ey - 1, 3, 1, D.n2); fr(3 + H - L, ey - 1, 1, 1, D.n2); }
    fr(7 + H - L, ey + 1, 1, 2, sk); fr(7 + H - L, ey + 3, 1, 1, sD);   // nose
  };

  // small steel robot (~34 px), feet at (x, y). face 1 = right. step 0..1 walk cycle. cards = like-cards held
  const robot = (g, x, y, t, face, step, cards) => {
    const [hi, mid, lo] = D.steel.map((v) => mix(v, D.n3, 0.15)), bob = Math.round(Math.abs(Math.sin(step * Math.PI)) * 2);
    const fr = (dx, dy, w, h, col) => R(g, face > 0 ? x + dx : x - dx - w + 1, y + dy, w, h, col);
    A(g, 0.45, () => ell(g, x, y, 8, 2, "#000000"));
    const l1 = Math.round(Math.sin(step * TAU) * 2), l2 = -l1;
    fr(-5, -9 + Math.min(0, l1), 3, 9 - Math.min(0, l1), D.n4); fr(-6 + Math.max(0, l1), -2, 5, 2, D.n2);
    fr(2, -9 + Math.min(0, l2), 3, 9 - Math.min(0, l2), D.n5); fr(1 + Math.max(0, l2), -2, 5, 2, D.n2);
    const by = -22 - bob;
    fr(-8, by, 16, 13, mid); fr(-8, by, 16, 1, hi); fr(-8, by, 1, 13, hi); fr(6, by + 1, 2, 12, lo); fr(-7, by + 12, 15, 1, lo);
    fr(-4, by + 4, 6, 4, D.n2); fr(-3, by + 5, 1, 1, PX.blink(t, 0.9, 0.5) ? D.moss[0] : D.moss[2]);
    // head with one round eye, antenna
    const hy = by - 12;
    fr(-1, by - 2, 3, 2, D.n4);
    fr(-7, hy, 14, 10, mid); fr(-7, hy, 14, 1, hi); fr(-7, hy, 1, 10, hi); fr(5, hy + 1, 2, 9, lo);
    fr(-4, hy + 2, 10, 6, D.n1); fr(1, hy + 3, 3, 3, PX.blink(t + 0.3, 3.7, 0.95) ? D.cream : D.n4); fr(2, hy + 3, 1, 1, D.lamp);
    fr(-1, hy - 4, 1, 4, D.n6); fr(-2, hy - 6, 3, 2, PX.blink(t, 1.4, 0.5) ? D.teal[0] : D.n5);
    // arms holding a stack of thumbs-up cards in front
    fr(-11, by + 2, 3, 9, lo);
    if (cards > 0) {
      const n = Math.min(cards, 5);
      for (let k = 0; k < n; k++) { fr(6, by - 2 - k * 2, 10, 8, k === n - 1 ? D.paper : mix(D.paper, D.paperD, 0.6)); fr(6, by + 6 - k * 2, 10, 1, D.paperD); }
      PX.sprite(g, ["..#..", ".##..", "#####", "#####", "####."], face > 0 ? x + 8 : x - 12, y + by - 1 - (n - 1) * 2, { "#": mix(D.ink, D.paper, 0.25) }, 1, face < 0);
      fr(4, by + 4, 4, 3, mid);
    } else fr(8, by + 2, 3, 9, mid);
  };

  // ======================= judge_ladder =======================
  // a tall library at night with a switchback staircase; a small robot carrying a growing stack of like-cards climbs past
  // four people on the landings. COWORKER (o.s1 1.0, "10 LIKES"), FRIEND (o.s2 4.0, "70"), FAMILY (o.s3 6.5, "150"),
  // SPOUSE (o.s4 9.5, "300"). Each looks surprised as it passes, then a little put out. The view climbs with the robot.
  K.judge_ladder = (o) => {
    const RISE = 120, XL = 170, XR = 470, GY = 316;
    const WHO = [
      { name: "COWORKER", n: "10 LIKES", v: { skin: mix(D.rose[0], D.lampD, 0.3), hair: mix(D.n0, D.rust[2], 0.25), top: mix(D.paper, D.steel[1], 0.35), pants: D.n3, tie: mix(D.rust[2], D.n2, 0.2), prop: "mug", hs: "short" } },
      { name: "FRIEND", n: "70 LIKES", v: { skin: mix(D.rose[0], D.paper, 0.45), hair: mix(D.rust[1], D.amber[2], 0.25), top: mix(D.moss[2], D.moss[1], 0.35), pants: mix(D.steel[2], D.n2, 0.4), tee: D.paper, hs: "fringe" } },
      { name: "FAMILY", n: "150 LIKES", v: { skin: mix(D.lampD, D.rust[2], 0.4), hair: D.n7, top: mix(D.rose[2], D.n3, 0.3), pants: mix(D.n4, D.plum[2], 0.3), cardi: true, skirt: true, hs: "bun" } },
      { name: "SPOUSE", n: "300 LIKES", v: { skin: mix(D.rust[2], D.lampD, 0.35), hair: mix(D.n0, D.n2, 0.3), top: mix(D.teal[2], D.n3, 0.25), pants: D.n3, prop: "book", hs: "long" } },
    ];
    // landing i (1..4): odd at the right, even at the left; the person stands out on it, facing the stairs
    const land = (i) => (i % 2 ? { x0: XR, x1: XR + 140, px: XR + 74 } : { x0: XL - 140, x1: XL, px: XL - 74 });
    const r = PX.rnd(17), books = [];
    for (let col = 0; col < 8; col++) for (let sh = 0; sh < 26; sh++) {
      const list = []; let bx = 0;
      while (bx < 70) { const w = 3 + Math.floor(r() * 4); list.push([bx, w, 12 + Math.floor(r() * 9), Math.floor(r() * 7), r()]); bx += w + (r() < 0.12 ? 3 : 0); }
      books.push(list);
    }
    return (g, t, d, c) => {
      const T = tm(o, d, 13.0), S = [T("s1", 1.0), T("s2", 4.0), T("s3", 6.5), T("s4", 9.5)];
      // robot progress u in [0.5, 4]: a sum of per-flight progresses (robust to negative / 99 beats)
      let u = 0.5;
      for (let i = 0; i < 4; i++) {
        const gap = S[i] - (i ? S[i - 1] : 0), dur = clamp(gap - 0.7, 0.8, 2.4) * (i ? 1 : 0.6);
        u += (i ? 1 : 0.5) * E((t - (S[i] - dur)) / dur, "io");
      }
      const fl = Math.min(3, Math.floor(u)), fu = u - fl;   // flight index 0..3, fraction
      const odd = fl % 2 === 0, rx = odd ? lerp(XL, XR, fu) : lerp(XR, XL, fu), rwy = fl * RISE + fu * RISE;
      const moving = [0, 1, 2, 3].some((i) => { const gap = S[i] - (i ? S[i - 1] : 0), dur = clamp(gap - 0.7, 0.8, 2.4) * (i ? 1 : 0.6); return t > S[i] - dur && t < S[i]; });
      const camY = clamp(rwy - 120, 0, 4 * RISE - 150);
      const sy = (wy) => GY - (wy - camY);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: library wall of bookshelves, a tall moonlit window ----
      const fc = camY * 0.55;
      PX.par(g, c, 0.5, () => {
        const fy = (wy) => GY + 30 - (wy - fc);
        PX.vgrad(g, -40, -40, 720, 440, mix(D.n2, D.steel[2], 0.1), D.n1, 8);
        for (let col = 0; col < 8; col++) {
          const x0 = -50 + col * 92;
          if (col === 3 || col === 4) continue;
          R(g, x0, -40, 4, 440, mix(D.n2, D.rust[2], 0.2));
          for (let sh = 0; sh < 26; sh++) {
            const wy = sh * 26, yy = fy(wy); if (yy < -30 || yy > 400) continue;
            R(g, x0 + 4, yy, 84, 3, mix(D.n2, D.rust[2], 0.2)); R(g, x0 + 4, yy, 84, 1, mix(D.n3, D.lampD, 0.12)); R(g, x0 + 4, yy + 3, 84, 2, D.n1);
            for (const [bx, w, h, ci, k] of books[(col * 26 + sh) % books.length]) {
              const base = [D.rust[2], D.moss[2], D.steel[2], D.paperD, D.plum[2], D.n4, D.teal[2]][ci];
              const bc = mix(base, D.n1, 0.66 + 0.14 * k);
              R(g, x0 + 8 + bx, yy - h, w, h, bc); R(g, x0 + 8 + bx, yy - h, 1, h, mix(bc, D.n6, 0.15));
              if (k < 0.3) R(g, x0 + 8 + bx, yy - h + 3, w, 1, mix(bc, D.paperD, 0.3));
            }
          }
        }
        // the tall arched window between the shelves
        const wx = 230, ww = 170, wTop = fy(560), wBot = fy(120);
        R(g, wx - 6, wTop - 6, ww + 12, wBot - wTop + 12, mix(D.n2, D.rust[2], 0.15));
        PX.vgrad(g, wx, wTop, ww, wBot - wTop, mix(D.steel[2], D.n1, 0.25), mix(D.steel[2], D.n1, 0.6), 7);
        ell(g, wx + ww / 2, wTop, ww / 2, 30, mix(D.steel[2], D.n1, 0.25));
        PX.circle(g, wx + 120, wTop + 30, 11, mix(D.cream, D.steel[0], 0.3)); PX.circle(g, wx + 124, wTop + 27, 10, mix(D.steel[1], D.n1, 0.3)); PX.glow(g, wx + 118, wTop + 32, 50, D.steel[0], 0.18);
        for (let k = 1; k < 4; k++) R(g, wx + Math.round((ww * k) / 4) - 1, wTop - 20, 2, wBot - wTop + 20, mix(D.n2, D.rust[2], 0.15));
        for (let yy = wTop + 40; yy < wBot; yy += 48) R(g, wx, yy, ww, 2, mix(D.n2, D.rust[2], 0.15));
        R(g, wx - 10, wBot + 4, ww + 20, 4, mix(D.n3, D.rust[2], 0.2));
      });
      // moonlight falling across the stairs
      A(g, 0.05, () => poly(g, [[250, sy(560) * 0.55 + 140], [400, sy(560) * 0.55 + 120], [560, 420], [300, 420]], D.steel[0]));
      // ---- floor ----
      if (sy(0) < 380) {
        PX.vgrad(g, -40, sy(0), 720, 400 - sy(0), mix(D.n3, D.rust[2], 0.2), D.n1, 5);
        R(g, -40, sy(0), 720, 1, mix(D.n5, D.lampD, 0.2));
        ell(g, 330, sy(0) + 28, 190, 12, mix(D.rust[2], D.n2, 0.55)); ell(g, 330, sy(0) + 28, 180, 10, mix(D.rust[2], D.n2, 0.45));
        ring(g, 330, sy(0) + 28, 168, 8, () => mix(D.paperD, D.n2, 0.55));
      }
      // ---- staircase: four flights + landings, far flights first ----
      const wdN = woodCols(0.42);
      for (const i of [3, 1, 2, 0]) {
        const left2right = i % 2 === 0, base = i * RISE, wd = left2right ? wdN : wdN.map((v) => mix(v, D.n1, 0.42));
        // landing slab at the top of flight i
        const Lg = land(i + 1), ly = sy(base + RISE);
        if (ly > -40 && ly < 420) {
          R(g, Lg.x0, ly, Lg.x1 - Lg.x0, 10, wdN[1]); R(g, Lg.x0, ly, Lg.x1 - Lg.x0, 1, wdN[0]); R(g, Lg.x0, ly + 9, Lg.x1 - Lg.x0, 2, wdN[2]);
          for (let x = Lg.x0 + 4; x < Lg.x1; x += 34) R(g, x, ly + 11, 3, 4, wdN[2]);
          // balustrade on the outer edge + post
          const ox = i % 2 === 0 ? Lg.x1 - 4 : Lg.x0;
          R(g, ox, ly - 34, 4, 34, wdN[1]); R(g, ox, ly - 36, 4, 2, wdN[0]);
          // wall sconce over the landing (warm)
          const scx = Lg.px + (i % 2 === 0 ? 46 : -46), scy = ly - 58;
          R(g, scx - 1, scy, 3, 8, mix(D.amber[2], D.n2, 0.3)); poly(g, [[scx - 5, scy - 1], [scx + 6, scy - 1], [scx + 4, scy - 7], [scx - 3, scy - 7]], mix(D.paper, D.lampD, 0.4));
          PX.glow(g, scx, scy - 3, 40, D.lamp, 0.22); PX.glow(g, Lg.px, ly - 34, 80, D.lampD, 0.16);
        }
        // the flight: 10 steps
        const x0 = left2right ? XL : XR, dir = left2right ? 1 : -1;
        if (sy(base) > -40 && sy(base + RISE) < 420) {
          // stringer underneath
          for (let k = 0; k < 14; k++) PX.line(g, x0, sy(base) + 4 + k, x0 + dir * 300, sy(base + RISE) + 4 + k, k < 1 ? wd[1] : mix(wd[2], D.n1, k / 18));
          for (let st = 0; st < 10; st++) {
            const sx0 = x0 + dir * st * 30, top = sy(base + (st + 1) * 12), w = 30, xa = dir > 0 ? sx0 : sx0 - w;
            R(g, xa, top, w, sy(base + st * 12) - top + 2, wd[2]);
            R(g, xa, top, w, 3, wd[1]); R(g, xa, top, w, 1, wd[0]);
          }
          // handrail + balusters on the near side
          for (let st = 0; st <= 10; st++) { const bx = x0 + dir * st * 30 + dir * 4, by = sy(base + st * 12); R(g, bx, by - 28, 2, 28, mix(wd[2], D.n1, 0.2)); }
          for (let k = 0; k < 3; k++) PX.line(g, x0, sy(base) - 30 + k, x0 + dir * 300, sy(base + RISE) - 30 + k, k ? wd[2] : wd[0]);
        }
      }
      // ---- the people on the landings ----
      WHO.forEach((w, i) => {
        const Lg = land(i + 1), ly = sy((i + 1) * RISE); if (ly < -20 || ly > 440) return;
        const passed = t - S[i], ex = passed < -0.25 ? 0 : passed < 1.6 ? 1 : 2;
        const lean = passed > -0.25 && passed < 1.6 ? 1 + (passed < 0.2 ? 1 : 0) : 0;
        stander(g, Lg.px, ly, { ...w.v, flip: (i + 1) % 2 === 1 }, ex, lean);
        const off = i < 3 ? { t1: S[i + 1] - 0.4 } : {};   // only the current pair stays (three-label limit)
        label(g, w.name, Lg.px, ly - 96, t, S[i] - 0.25, off);
        label(g, w.n, Lg.px, ly - 84, t, S[i] + 0.1, { col: D.lamp, ...off });
      });
      // ---- the robot ----
      const cards = 1 + S.filter((s) => t >= s).length;
      const stp = fu <= 0 ? 0 : Math.min(10, Math.floor(fu * 10) + 1), hop = moving ? Math.round(Math.abs(Math.sin(fu * 10 * Math.PI)) * 3) : 0;
      robot(g, Math.round(rx), Math.round(sy(fl * RISE + stp * 12)) - 1 - hop, t, odd ? 1 : -1, moving ? fu * 10 : 0, cards);
      dust(g, 61, 30, t, [200, 20, 260, 300], D.cream, 0.3);
      PX.vignette(g, 0.55);
    };
  };
  // ---------- night town pieces ----------
  // window silhouette: a hooded person looking down at a phone (sync = shared nod phase), or other shapes
  const winFigure = (g, x, y, w, h, kind, t, glowCol, sync) => {
    const sil = D.n1, nod = Math.round(Math.max(0, Math.sin(sync)) * 1);
    if (kind === "phone") {
      const cx = x + Math.round(w * 0.45), hy = y + Math.round(h * 0.38) + nod;
      PX.circle(g, cx, hy, Math.max(2, Math.round(w * 0.14)), sil);
      R(g, cx - Math.round(w * 0.16), hy - Math.round(w * 0.14) - 1, Math.round(w * 0.3), 2, sil);   // hood
      R(g, cx - Math.round(w * 0.3), hy + Math.round(w * 0.14), Math.round(w * 0.6), h, sil);
      R(g, cx - Math.round(w * 0.36), hy + Math.round(w * 0.24), Math.round(w * 0.72), h, sil);
      const px = cx + Math.round(w * 0.18), py = hy + Math.round(w * 0.2);
      R(g, px, py, 2, 3, D.teal[0]); PX.glow(g, px + 1, py, 5, D.teal[0], 0.35);
    } else if (kind === "plant") {
      R(g, x + w - 6, y + h - 5, 4, 5, sil); PX.circle(g, x + w - 4, y + h - 8, 3, sil); R(g, x + w - 7, y + h - 11, 2, 3, sil);
    } else if (kind === "cat") {
      R(g, x + 2, y + h - 4, 6, 4, sil); R(g, x + 3, y + h - 7, 4, 3, sil); R(g, x + 3, y + h - 8, 1, 1, sil); R(g, x + 6, y + h - 8, 1, 1, sil); R(g, x + 8, y + h - 3, 3, 1, sil);
    } else if (kind === "lamp") {
      R(g, x + 3, y + h - 9, 1, 9, sil); poly(g, [[x + 1, y + h - 9], [x + 6, y + h - 9], [x + 5, y + h - 12], [x + 2, y + h - 12]], sil);
    }
  };
  // a house: x = left, base y; o.win = [[wx, wy, ww, wh, kind, lit, col]] relative to the wall; o.flip roof slope
  const house = (g, x, y, w, h, rh, t, o) => {
    o = o || {};
    const wall = o.wall || mix(D.n3, D.steel[2], 0.25), wallD = mix(wall, D.n0, 0.35), wallL = mix(wall, D.steel[0], 0.15);
    const roof = o.roof || mix(D.n2, D.rust[2], 0.2), roofL = mix(roof, D.steel[0], 0.3);
    A(g, 0.5, () => R(g, x - 2, y, w + 8, 3, "#000000"));
    R(g, x, y - h, w, h, wall); R(g, x, y - h, 2, h, wallL); R(g, x + w - 3, y - h, 3, h, wallD);
    for (let yy = y - h + 4; yy < y; yy += 5) R(g, x + 2, yy, w - 5, 1, mix(wall, D.n0, 0.12));   // siding
    // chimney (behind the roof slope)
    if (o.chim) { const cx = x + Math.round(w * o.chim); R(g, cx, y - h - rh * 0.8, 7, rh * 0.6, mix(D.n3, D.rust[2], 0.3)); R(g, cx - 1, y - h - rh * 0.8, 9, 2, D.n4); }
    // gable roof with moonlit left edge
    poly(g, [[x - 5, y - h + 1], [x + w / 2, y - h - rh], [x + w + 5, y - h + 1]], roof);
    PX.line(g, x - 5, y - h, x + w / 2, y - h - rh, roofL); PX.line(g, x - 4, y - h + 1, x + w / 2, y - h - rh + 1, mix(roof, roofL, 0.5));
    R(g, x - 5, y - h + 1, w + 10, 2, mix(roof, D.n0, 0.4));
    // windows
    for (const [wx, wy, ww, wh, kind, lit, col, sync] of o.win || []) {
      const X = x + wx, Y = y - h + wy;
      R(g, X - 1, Y - 1, ww + 2, wh + 2, D.n1);
      const off = mix(D.n1, D.steel[2], 0.25), on = col || mix(D.cream, D.steel[0], 0.35);
      R(g, X, Y, ww, wh, mix(off, on, lit));
      if (lit > 0.05) {
        R(g, X, Y + wh - 2, ww, 2, mix(off, mix(on, D.n0, 0.25), lit));
        if (kind) A(g, lit, () => clip(g, X, Y, ww, wh, () => winFigure(g, X, Y, ww, wh, kind, t, on, sync || 0)));
        PX.glow(g, X + ww / 2, Y + wh / 2, ww * 1.6, on, 0.2 * lit);
        if (o.spill) A(g, 0.1 * lit, () => ell(g, X + ww / 2, y + 6, ww, 3, on));
      }
      R(g, X + Math.floor(ww / 2), Y, 1, wh, D.n2); R(g, X, Y + Math.floor(wh / 2), ww, 1, D.n2);
      R(g, X - 2, Y + wh + 1, ww + 4, 1, wallL);
    }
    if (o.door) { const dx = x + o.door; R(g, dx, y - 20, 11, 20, mix(D.n2, D.rust[2], 0.3)); R(g, dx, y - 20, 11, 1, wallL); R(g, dx + 8, y - 10, 1, 1, D.lampD); }
  };
  const pine = (g, x, y, h, col) => { for (let k = 0; k < h; k++) { const w = Math.round((k / h) * h * 0.32) + 1; R(g, x - w, y - h + k, 2 * w + 1, 1, col); } R(g, x, y, 2, 3, D.n0); };

  // ======================= neighborhood =======================
  // the dot space as a small night town: lit windows are dots; at o.you (0.5) the YOU house window glows amber with
  // the YOU dot over its roof; at o.near (2.0) the neighbouring houses light up one by one, each with the same hooded
  // silhouette looking at a phone; o.sync (3.4) the silhouettes all nod at the same moment.
  K.neighborhood = (o) => {
    const r = PX.rnd(23), far = [];
    let fx = -40;
    while (fx < 680) { const w = 8 + Math.floor(r() * 10), hh = 6 + Math.floor(r() * 6); far.push([fx, w, hh, r(), r()]); fx += w + 4 + Math.floor(r() * 14); }
    const NB = [   // neighbours: [x, base, w, h, roof, delay]
      [168, 262, 84, 50, 30, 0.0], [430, 264, 88, 52, 32, 0.35], [50, 248, 70, 42, 26, 0.75], [548, 250, 72, 42, 26, 1.0],
    ];
    const ridge = (x) => 214 - 70 * Math.exp(-(((x - 40) / 190) ** 2)) - 34 * Math.exp(-(((x - 600) / 120) ** 2)) - 4 * Math.sin(x * 0.05);
    const r2 = PX.rnd(29), hill = [];
    for (let x = -40; x < 680; x += 9 + Math.floor(r2() * 16)) { const by = ridge(x) + 6 + r2() * 26; if (by < 236) hill.push([x, Math.round(by), 6 + Math.floor(r2() * 6), 5 + Math.floor(r2() * 4), r2(), r2()]); }
    hill.sort((a, b) => a[1] - b[1]);
    return (g, t, d, c) => {
      const T = tm(o, d, 5.0), tY = T("you", 0.5), tN = T("near", 2.0), tS = T("sync", 3.4);
      const you = P(t, tY, 0.7, "out");
      const syncPh = t >= tS ? clamp((t - tS) / 0.9, 0, 1) * Math.PI : 0;
      R(g, 0, 0, 640, 360, D.n0);
      // sky + moon + stars
      PX.par(g, c, 0.2, () => {
        PX.vgrad(g, -40, -40, 720, 260, D.n0, mix(D.steel[2], D.n1, 0.55), 9);
        const rs = PX.rnd(5); for (let i = 0; i < 70; i++) { const x = rs() * 700 - 30, y = rs() * 140 - 20; A(g, 0.25 + 0.35 * Math.abs(Math.sin(t * 0.8 + i)), () => R(g, x, y, 1, 1, D.cream)); }
        PX.circle(g, 520, 52, 12, mix(D.cream, D.steel[0], 0.25)); PX.circle(g, 525, 49, 11, mix(D.n1, D.steel[2], 0.45)); PX.glow(g, 516, 54, 60, D.steel[0], 0.12);
        A(g, 0.18, () => { R(g, 380 + Math.sin(t * 0.1) * 6, 66, 120, 3, D.n4); R(g, 410 + Math.sin(t * 0.1) * 6, 69, 70, 2, D.n4); });
      });
      // far hills with tiny houses: their windows are cool dots
      PX.par(g, c, 0.35, () => {
        g.fillStyle = mix(D.n1, D.steel[2], 0.3);
        for (let x = -40; x < 680; x++) { const y = Math.round(196 - 8 * Math.sin(x * 0.013 + 2) - 5 * Math.sin(x * 0.04)); g.fillRect(x, y, 1, 200); }
        for (const [x, w, hh, k1, k2] of far) { const y = Math.round(196 - 8 * Math.sin(x * 0.013 + 2) - 5 * Math.sin(x * 0.04)); if (k1 < 0.6) A(g, 0.5 + 0.3 * Math.sin(t * 0.5 + k2 * 9), () => R(g, x, y + 3 + Math.round(k2 * 6), 1, 1, mix(D.steel[0], D.cream, k2))); }
      });
      PX.par(g, c, 0.5, () => {
        g.fillStyle = mix(D.n1, D.steel[2], 0.18);
        for (let x = -40; x < 680; x++) g.fillRect(x, Math.round(ridge(x)), 1, 260);
        for (const [x, by, w, hh, k1, k2] of hill) {
          const col = mix(D.n1, D.steel[2], 0.1 + 0.1 * k2);
          R(g, x, by - hh, w, hh, col); poly(g, [[x - 1, by - hh], [x + w / 2, by - hh - 3], [x + w + 1, by - hh]], mix(col, D.n0, 0.3));
          if (k1 < 0.8) A(g, 0.55 + 0.35 * Math.sin(t * 0.6 + k2 * 9), () => R(g, x + 1 + Math.floor(k2 * (w - 3)), by - hh + 2, 2, 2, mix(D.steel[0], D.cream, k1)));
        }
        for (let x = -30; x < 680; x += 31) pine(g, x + (x * 7) % 13, Math.round(ridge(x)) + 40 + (x % 3) * 4, 12 + (x % 5), mix(D.n1, D.moss[2], 0.12));
      });
      // mid ground: lawn
      PX.vgrad(g, -40, 232, 720, 140, mix(D.n2, D.moss[2], 0.12), D.n1, 6);
      const ringA = P(t, tN + 1.3, 0.8, "out");
      if (ringA > 0) A(g, 0.45 * ringA, () => ring(g, 316, 272, 260 * (0.85 + 0.15 * ringA), 26, (a) => (Math.floor(a * 44) % 2 === 0 ? mix(D.cream, D.steel[0], 0.4) : null)));
      // the neighbours (back ones first)
      const order = [2, 3, 0, 1];
      PX.par(g, c, 0.8, () => {
        for (const i of order) {
          const [x, by, w, h, rh, dl] = NB[i], lit = P(t, tN + dl, 0.6, "out");
          const wx = Math.round(w * 0.3), ww = i < 2 ? 20 : 16, wh = i < 2 ? 18 : 14;
          house(g, x, by, w, h, rh, t, {
            wall: mix(D.n3, i % 2 ? D.steel[2] : D.rust[2], 0.18), chim: i === 1 ? 0.7 : null, door: w - 18,
            win: [[wx - 4, 12, ww, wh, "phone", lit, mix(D.cream, D.steel[0], 0.4), syncPh]], spill: 1,
          });
          if (lit > 0.5) A(g, lit - 0.5, () => otherDot(g, x + wx - 4 + ww / 2, by - h - rh - 8, 0.5));
        }
        pine(g, 146, 262, 34, mix(D.n1, D.moss[2], 0.2)); pine(g, 402, 266, 30, mix(D.n1, D.moss[2], 0.18)); pine(g, 136, 248, 22, mix(D.n1, D.moss[2], 0.15)); pine(g, 534, 252, 26, mix(D.n1, D.moss[2], 0.15)); pine(g, 14, 252, 30, mix(D.n1, D.moss[2], 0.15)); pine(g, 634, 254, 30, mix(D.n1, D.moss[2], 0.15));
      });
      // the YOU house, front and centre
      const amb = mix(D.amber[1], D.lamp, 0.5);
      house(g, 270, 286, 96, 62, 40, t, {
        wall: mix(D.n3, D.rust[2], 0.22), chim: 0.72, door: 68, spill: 1,
        win: [[12, 14, 30, 26, "phone", Math.max(0.25, you), mix(mix(D.cream, D.steel[0], 0.4), amb, you), syncPh], [48, 40, 10, 8, null, 0.15]],
      });
      PX.glow(g, 297, 255, 70, D.amber[1], 0.12 * you);
      youDot(g, 318, 168 - Math.round(2 * Math.sin(t * 1.3)), t, you);
      // chimney smoke from the YOU house
      for (let k = 0; k < 7; k++) { const u = frac(t * 0.18 + k / 7), sx = 342 + Math.sin(u * 5 + k) * 3 + u * 10, sy = 192 - u * 50; A(g, 0.22 * (1 - u), () => R(g, sx, sy, 3 + Math.round(u * 4), 2, D.n5)); }
      // the neighbourhood: a soft dotted ring on the lawn once the neighbours light
      // foreground: street, fence, lamp post
      PX.par(g, c, 1.0, () => {
        poly(g, [[300, 318], [318, 318], [326, 287], [318, 287]], mix(D.n3, D.paperD, 0.18));   // path to the door
        R(g, -40, 318, 720, 60, mix(D.n2, D.n1, 0.4)); R(g, -40, 318, 720, 1, D.n3); R(g, -40, 312, 720, 6, mix(D.n3, D.n2, 0.5));
        for (let x = -30; x < 680; x += 40) R(g, x, 342, 18, 2, mix(D.n3, D.paperD, 0.15));
        for (let x = -36; x < 680; x += 9) { if (x > 292 && x < 330) continue; R(g, x, 296, 3, 16, mix(D.n3, D.paperD, 0.2)); R(g, x, 296, 3, 1, mix(D.n5, D.paperD, 0.2)); }
        R(g, -40, 300, 334, 2, mix(D.n3, D.paperD, 0.15)); R(g, -40, 307, 334, 2, mix(D.n3, D.paperD, 0.12)); R(g, 330, 300, 360, 2, mix(D.n3, D.paperD, 0.15)); R(g, 330, 307, 360, 2, mix(D.n3, D.paperD, 0.12));
        const lx = 600; R(g, lx, 206, 3, 108, D.n3); R(g, lx - 6, 202, 15, 4, D.n4); R(g, lx - 4, 206, 11, 3, D.lamp);
        PX.glow(g, lx + 1, 208, 30, D.lamp, 0.3); A(g, 0.07, () => poly(g, [[lx - 4, 209], [lx + 7, 209], [lx + 46, 318], [lx - 44, 318]], D.lamp));
      });
      dust(g, 71, 12, t, [570, 210, 60, 100], D.lamp, 0.35);
      PX.vignette(g, 0.55);
      label(g, "YOU", 318, 148, t, tY + 0.3, { col: D.amber[0] });
    };
  };
  // ---------- machine room pieces ----------
  // brass gear: teeth n, rotation ang
  const gear = (g, cx, cy, r, n, ang, cols) => {
    const [gL, gc, gD] = cols;
    for (let k = 0; k < n; k++) { const a = ang + (k / n) * TAU, tx = cx + Math.cos(a) * (r - 1), ty = cy + Math.sin(a) * (r - 1); R(g, tx - 2, ty - 2, 4, 4, Math.sin(a) < -0.3 ? gL : gc); }
    PX.circle(g, cx, cy, r - 2, gc); PX.circle(g, cx + 1, cy + 1, r - 4, gD); PX.circle(g, cx, cy, r - 5, gc);
    for (let k = 0; k < 4; k++) { const a = ang + (k / 4) * TAU; for (let q = 0; q < 2; q++) PX.line(g, cx, cy, cx + Math.cos(a) * (r - 5), cy + Math.sin(a) * (r - 5) + q, gD); }
    PX.circle(g, cx, cy, Math.max(2, Math.round(r * 0.22)), gD); R(g, cx - 1, cy - 1, 2, 2, gL);
    ring(g, cx, cy, r - 2, r - 2, (a) => (Math.sin(a) < -0.4 ? gL : null));
  };
  // server racks receding along a wall; side -1 left, 1 right
  const rackRow = (g, t, side) => {
    for (let k = 5; k >= 0; k--) {
      const z = 1 + k * 0.6, s = 1 / z, w = Math.round(70 * s), h = Math.round(230 * s), x = side < 0 ? Math.round(150 - 150 * s - w) : Math.round(490 + 150 * s), y = Math.round(300 - 40 * s - h + 40 * (1 - s) * 0.2 - (1 - s) * 30);
      const body = mix(D.n2, D.steel[2], 0.15), fog = (c) => mix(c, D.n1, k * 0.12);
      R(g, x, y, w, h, fog(body)); R(g, x, y, w, 1, fog(D.n4)); R(g, side < 0 ? x + w - 2 : x, y, 2, h, fog(D.n3));
      for (let u = 6 * s; u < h - 6 * s; u += Math.max(3, 9 * s)) {
        R(g, x + 3, y + u, w - 6, Math.max(1, Math.round(5 * s)), fog(D.n1));
        const on = PX.blink(t + k * 0.7 + u * 0.13, 1.3 + (u % 7) * 0.4, 0.3), lc = (u * 7 + k) % 3 === 0 ? D.moss[0] : D.teal[0];
        R(g, x + 5, y + u + 1, 1, 1, fog(on ? lc : mix(lc, D.n2, 0.7)));
        if (on && k < 3) PX.glow(g, x + 5, y + u + 1, 4, lc, 0.18 * s);
      }
    }
  };
  // little picture tiles (recommendation cards): kind "cone", "boot", "sock", "lamp"
  const junkTile = (g, x, y, w, h, kind) => {
    R(g, x, y, w, h, D.paper); R(g, x, y, w, 1, D.cream); R(g, x, y + h - 1, w, 1, D.paperD); R(g, x + w - 1, y, 1, h, D.paperD);
    R(g, x + 2, y + 2, w - 4, h - 4, mix(D.teal[2], D.n2, 0.35));
    const cx = x + Math.round(w / 2), by = y + h - 3;
    if (kind === "cone") { poly(g, [[cx - 6, by], [cx + 6, by], [cx + 1, by - 13], [cx - 1, by - 13]], D.rust[1]); R(g, cx - 4, by - 7, 8, 2, D.cream); R(g, cx - 2, by - 11, 4, 1, D.cream); R(g, cx - 7, by, 14, 1, D.rust[2]); R(g, cx - 1, by - 12, 1, 10, D.rust[0]); }
    else if (kind === "boot") { R(g, cx - 3, by - 10, 6, 8, mix(D.rust[2], D.n2, 0.3)); R(g, cx - 3, by - 3, 10, 3, mix(D.rust[2], D.n2, 0.3)); R(g, cx - 3, by, 11, 1, D.n1); R(g, cx - 2, by - 8, 1, 4, D.paperD); }
    else if (kind === "sock") { R(g, cx - 2, by - 11, 5, 9, D.rose[1]); R(g, cx - 2, by - 4, 9, 4, D.rose[1]); R(g, cx - 2, by - 11, 5, 2, D.cream); }
    else { R(g, cx, by - 10, 1, 10, D.n5); poly(g, [[cx - 4, by - 9], [cx + 5, by - 9], [cx + 3, by - 13], [cx - 2, by - 13]], D.amber[2]); }
  };

  // ======================= inside_machine =======================
  // a dim server room; the back panel of a big machine swings open (o.open 1.0): no little person inside (an empty
  // tiny stool, a cobweb), only brass gears and abacus rods doing sums ("JUST ARITHMETIC" at o.sums 2.5). At o.garbage
  // (5.0) a chute drops a ridiculous recommendation (a traffic cone card) into a bin of other junk ("OFTEN WRONG").
  K.inside_machine = (o) => {
    const MX = 196, MY = 66, MW = 224, MH = 232, IX = MX + 14, IY = MY + 14, IW = MW - 28, IH = MH - 30;
    const BX = 508, BY = 306;   // bin
    return (g, t, d, c) => {
      const T = tm(o, d, 9.0), tO = T("open", 1.0), tS = T("sums", 2.5), tG = T("garbage", 5.0);
      const op = P(t, tO, 1.4, "io"), th = op * 1.95, inner = clamp(op * 1.6, 0, 1);
      const hum = Math.round(Math.sin(t * 40) * 0.4);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: server room ----
      PX.par(g, c, 0.45, () => {
        PX.vgrad(g, -40, -40, 720, 360, mix(D.n1, D.steel[2], 0.12), D.n1, 7);
        for (let k = 0; k < 3; k++) R(g, 100 + k * 6, 10 + k * 20, 440 - k * 12, 3, mix(D.n2, D.steel[2], 0.15 - k * 0.04));   // cable trays
        for (let x = 110; x < 540; x += 18) PX.line(g, x, 13, x + 3, 40, D.n2);
        R(g, 230, 40, 180, 140, mix(D.n1, D.steel[2], 0.08));   // far doorway
        PX.glow(g, 320, 30, 120, D.steel[0], 0.08);
        rackRow(g, t, -1); rackRow(g, t, 1);
      });
      // floor: perforated tiles with a cool sheen
      PX.par(g, c, 0.8, () => {
        PX.vgrad(g, -40, 286, 720, 90, mix(D.n2, D.steel[2], 0.15), D.n1, 5);
        for (let k = 0; k < 6; k++) { const y = 290 + k * k * 2.4; R(g, -40, y, 720, 1, mix(D.n2, D.n3, 0.4)); }
        for (let i = -12; i <= 12; i++) PX.line(g, 320 + i * 24, 288, 320 + i * 70, 380, mix(D.n2, D.n3, 0.3));
      });
      // overhead work light over the machine
      R(g, 316, -10, 2, 26, D.n3); poly(g, [[300, 22], [334, 22], [328, 14], [306, 14]], D.n3); R(g, 302, 22, 30, 1, D.lamp);
      PX.glow(g, 317, 24, 30, D.lamp, 0.25); A(g, 0.05, () => poly(g, [[304, 23], [330, 23], [430, 300], [204, 300]], D.lamp));
      // ---- the machine ----
      const [sL, st, sD] = D.steel.map((v) => mix(v, D.n2, 0.62));
      A(g, 0.5, () => ell(g, MX + MW / 2, MY + MH + 2, MW / 2 + 20, 6, "#000000"));
      R(g, MX + hum, MY, MW, MH, st); R(g, MX + hum, MY, MW, 2, sL); R(g, MX + hum, MY, 2, MH, sL); R(g, MX + MW - 4 + hum, MY + 2, 4, MH - 2, sD); R(g, MX + hum, MY + MH - 3, MW, 3, sD);
      for (const fx of [MX + 10, MX + MW - 26]) { R(g, fx + hum, MY + MH, 16, 5, D.n2); R(g, fx + hum, MY + MH, 16, 1, D.n4); }
      for (let k = 0; k < 9; k++) R(g, MX + 30 + k * 18 + hum, MY + 5, 10, 2, sD);
      // cables into the top
      for (let k = 0; k < 4; k++) { const cx = MX + 40 + k * 46; for (let y = -10; y < MY; y++) R(g, cx + Math.round(Math.sin(y * 0.05 + k) * 3), y, 3, 1, k % 2 ? D.n0 : mix(D.n1, D.steel[2], 0.2)); }
      // interior (visible as the door swings)
      if (inner > 0) {
        R(g, IX, IY, IW, IH, mix(D.n0, D.rust[2], 0.08));
        clip(g, IX, IY, IW, IH, () => {
          PX.glow(g, IX + IW / 2, IY + 8, 120, D.lamp, 0.16 * inner);
          R(g, IX + IW / 2 - 4, IY, 8, 4, D.n3); R(g, IX + IW / 2 - 2, IY + 4, 4, 3, D.lamp);   // work bulb
          const brass = [mix(D.amber[1], D.lamp, 0.25), mix(D.amber[2], D.rust[2], 0.2), mix(D.amber[2], D.n1, 0.5)];
          const spin = t * 0.9;
          // a meshing gear train (speeds follow the radii)
          for (const [gx, gy, gr, gn, k, ph] of [[38, 44, 24, 14, 1, 0], [73, 36, 14, 8, -24 / 14, 0.2], [103, 44, 20, 12, 24 / 20, 0.1], [131, 36, 12, 7, -2, 0.3], [158, 44, 18, 11, 24 / 18, 0]]) {
            R(g, IX + gx - 1, IY + gy, 2, 30, mix(D.n2, D.steel[2], 0.3)); gear(g, IX + gx, IY + gy, gr, gn, spin * k + ph, brass);
          }
          // abacus: five rods, beads shuffle in steps (the sums)
          const ax = IX + 14, ay = IY + 80, aw = IW - 28;
          const [wL, w0, wD] = woodCols(0.35);
          R(g, ax - 4, ay - 6, aw + 8, 4, w0); R(g, ax - 4, ay - 6, aw + 8, 1, wL); R(g, ax - 4, ay + 66, aw + 8, 4, wD);
          R(g, ax - 4, ay - 6, 4, 76, w0); R(g, ax + aw, ay - 6, 4, 76, wD);
          const busy = 0.6 + 2.4 * P(t, tS, 0.8, "io");
          for (let k = 0; k < 5; k++) {
            const ry = ay + 6 + k * 13; R(g, ax, ry, aw, 1, D.n5);
            const ph = t * busy * (0.6 + k * 0.23) + k * 1.7, step = Math.floor(ph), u = PX.ease(clamp((ph - step) * 3, 0, 1), "out");
            const v0 = Math.floor(hash(k, step) * 9), v1 = Math.floor(hash(k, step + 1) * 9), v = lerp(v0, v1, u);
            for (let b = 0; b < 9; b++) {
              const right = b >= 9 - v, bx = right ? ax + aw - (9 - b) * 9 : ax + b * 9 + 2;
              const col = b < 2 ? D.teal[1] : b === 4 ? D.cream : mix(D.paper, D.paperD, 0.4);
              ell(g, bx + 4, ry, 4, 3, mix(col, D.n0, 0.25)); ell(g, bx + 4, ry - 1, 3, 2, col); R(g, bx + 2, ry - 2, 2, 1, mix(col, D.cream, 0.5));
            }
          }
          // a tiny empty office in the corner: chair, desk, unlit lamp, cobweb (no little person in here)
          const sx = IX + 22, sy = IY + IH - 3;
          R(g, sx, sy - 13, 30, 2, w0); R(g, sx, sy - 13, 30, 1, wL); R(g, sx + 1, sy - 11, 2, 11, wD); R(g, sx + 27, sy - 11, 2, 11, wD);   // desk
          R(g, sx + 20, sy - 19, 1, 6, D.n5); R(g, sx + 17, sy - 21, 6, 2, D.n4); R(g, sx + 4, sy - 15, 7, 2, D.paperD);   // lamp (off) + paper
          R(g, sx + 36, sy - 16, 2, 16, wD); R(g, sx + 33, sy - 8, 10, 2, w0); R(g, sx + 33, sy - 6, 2, 6, wD); R(g, sx + 41, sy - 6, 2, 6, wD);   // chair, pushed out
          A(g, 0.45, () => { for (let k = 0; k < 4; k++) PX.line(g, IX, IY + IH - 1, IX + 6 + k * 6, IY + IH - 22 + k * 6, D.n6); for (let rr = 6; rr < 22; rr += 5) ring(g, IX, IY + IH, rr, rr, (a) => (a > 4.75 && a < 6.2 ? D.n6 : null)); });
          // summing drums (tick marks only) turning as the sums run
          for (let k = 0; k < 4; k++) {
            const dx = IX + 96 + k * 16, dy = IY + IH - 26, ph = t * busy * (0.3 + k * 0.5);
            R(g, dx, dy, 13, 18, mix(D.paper, D.n3, 0.35)); R(g, dx, dy, 13, 2, D.n2); R(g, dx, dy + 16, 13, 2, D.n2);
            for (let m = 0; m < 4; m++) { const yy = dy + 3 + Math.round(frac(ph + m / 4) * 12); R(g, dx + 3, yy, 7, 1, mix(D.ink, D.paper, 0.4)); }
            R(g, dx + 12, dy, 1, 18, mix(D.n0, D.n3, 0.5));
          }
          R(g, IX + 92, IY + IH - 4, 70, 3, mix(D.n2, D.steel[2], 0.3));
          A(g, 0.5 * (1 - inner), () => R(g, IX, IY, IW, IH, "#000000"));
        });
        R(g, IX - 1, IY - 1, IW + 2, 1, sD); R(g, IX - 1, IY + IH, IW + 2, 1, sL);
      }
      // the back panel door, hinged on the left; swings toward us and out of the way
      {
        const cs = Math.cos(th), ex = IX + IW * cs, grow = Math.round(Math.sin(th) * 10);
        const front = cs > 0, pc = front ? mix(st, D.n3, 0.15) : mix(sD, D.n1, 0.25);
        const quad = [[IX, IY], [ex, IY - grow], [ex, IY + IH + grow], [IX, IY + IH]];
        if (Math.abs(ex - IX) > 1) {
          poly(g, quad, pc);
          PX.line(g, IX, IY, ex, IY - grow, front ? sL : sD); PX.line(g, ex, IY - grow, ex, IY + IH + grow, front ? sD : sL);
          if (front) {
            // vents, label plate, handle drawn across the swinging quad
            for (let k = 0; k < 12; k++) { const v = 0.12 + k * 0.05, y0 = lerp(IY, IY + IH, v); PX.line(g, IX + (ex - IX) * 0.15, y0 - grow * 0.15 * 0, IX + (ex - IX) * 0.85, y0, sD); }
            const pl = 0.25, pr = 0.65; poly(g, [[IX + (ex - IX) * pl, IY + IH * 0.78], [IX + (ex - IX) * pr, IY + IH * 0.78], [IX + (ex - IX) * pr, IY + IH * 0.86], [IX + (ex - IX) * pl, IY + IH * 0.86]], mix(D.amber[2], D.n2, 0.35));
            R(g, IX + (ex - IX) * 0.9 - 2, IY + IH * 0.45, 3, 18, sL);
            for (const v of [0.05, 0.95]) for (const yv of [0.05, 0.95]) R(g, IX + (ex - IX) * v, lerp(IY, IY + IH, yv), 1, 1, sL);
          }
        }
        R(g, IX - 3, IY + 20, 3, 10, sD); R(g, IX - 3, IY + IH - 30, 3, 10, sD);   // hinges
      }
      // status lamps on the frame
      for (let k = 0; k < 4; k++) { const on = PX.blink(t + k * 0.4, 1.7 + k * 0.3, 0.5); R(g, MX + MW - 14, MY + 30 + k * 8, 3, 3, on ? (k ? D.teal[0] : D.moss[0]) : D.n2); if (on) PX.glow(g, MX + MW - 13, MY + 31 + k * 8, 5, D.teal[0], 0.2); }
      // ---- the chute and the bin of junk recommendations ----
      const cx0 = MX + MW - 2, cy0 = MY + 116;
      poly(g, [[cx0, cy0], [cx0 + 16, cy0], [cx0 + 56, cy0 + 40], [cx0 + 56, cy0 + 50], [cx0, cy0 + 18]], mix(st, D.n3, 0.3));
      PX.line(g, cx0, cy0, cx0 + 16, cy0, sL); PX.line(g, cx0 + 16, cy0, cx0 + 56, cy0 + 40, sL); PX.line(g, cx0, cy0 + 18, cx0 + 56, cy0 + 50, sD); R(g, cx0 + 54, cy0 + 40, 3, 11, sD);
      R(g, cx0 - 2, cy0 - 2, 6, 22, sD);
      // bin: wire mesh basket with junk cards sticking out
      const drawBinBack = () => { ell(g, BX, BY - 44, 34, 6, D.n2); };
      drawBinBack();
      const junk = [["boot", -22, -54, -0.2], ["sock", 8, -58, 0.15], ["lamp", -6, -50, 0]];
      for (const [k, dx, dy] of junk) junkTile(g, BX + dx, BY + dy, 20, 18, k);
      // falling card: down the chute, out, into the bin with a small bounce
      const fall = (t - tG) / 1.3;
      let cardPos = null;
      if (fall >= 0) {
        const u = clamp(fall, 0, 1);
        if (u < 0.45) { const k = E(u / 0.45, "in"), xl = lerp(cx0 - 22, cx0 + 44, k); cardPos = [xl, cy0 + Math.max(0, xl + 11 - (cx0 + 16)) - 19]; }
        else { const k = (u - 0.45) / 0.55, bounce = k > 0.75 ? Math.sin(((k - 0.75) / 0.25) * Math.PI) * 4 : 0; cardPos = [lerp(cx0 + 44, BX - 12, E(k, "out")), lerp(cy0 + 22, BY - 58, Math.min(1, (k / 0.75) ** 2)) - bounce]; }
        if (u >= 1) cardPos = [BX - 12, BY - 58];
      }
      if (cardPos) clip(g, cx0 + 1, 0, 640, 360, () => junkTile(g, Math.round(cardPos[0]), Math.round(cardPos[1]), 22, 20, "cone"));
      // basket front (mesh over the cards)
      const bc = mix(D.n5, D.steel[1], 0.3);
      for (let y = BY - 44; y < BY; y += 1) { const w = Math.round(34 - (y - (BY - 44)) * 0.12); R(g, BX - w, y, 1, 1, bc); R(g, BX + w, y, 1, 1, bc); }
      for (let k = -4; k <= 4; k++) PX.line(g, BX + k * 8, BY - 40, BX + k * 7, BY - 1, mix(bc, D.n1, 0.3));
      for (let y = BY - 36; y < BY; y += 8) { const w = Math.round(34 - (y - (BY - 44)) * 0.12); R(g, BX - w, y, 2 * w, 1, mix(bc, D.n1, 0.4)); }
      ring(g, BX, BY - 44, 34, 6, (a) => (Math.sin(a) > 0 ? bc : null)); ell(g, BX, BY, 30, 3, mix(D.n0, D.n2, 0.4));
      if (fall > 0.95 && fall < 1.6) PX.glow(g, BX, BY - 50, 26, D.cream, 0.25 * (1 - (fall - 0.95) / 0.65));
      dust(g, 81, 26, t, [230, 40, 180, 240], D.lamp, 0.3);
      PX.vignette(g, 0.55);
      label(g, "JUST ARITHMETIC", 308, 40, t, tS);
      label(g, "OFTEN WRONG", BX, BY - 96, t, tG + 1.2);
    };
  };
  // ---------- study corner pieces ----------
  const pin = (g, x, y, col) => { R(g, x - 1, y - 1, 3, 3, col); R(g, x - 1, y - 1, 1, 1, mix(col, D.cream, 0.5)); A(g, 0.4, () => R(g, x + 2, y + 1, 2, 2, "#000000")); };
  // paper sheet with a soft shadow, slight sway at the bottom corners
  const sheet = (g, x, y, w, h, t, ph) => {
    A(g, 0.35, () => R(g, x + 3, y + 3, w, h, "#000000"));
    const col = D.paper, sw = Math.round(Math.sin(t * 0.9 + ph) * 0.6);
    R(g, x, y, w, h - 6, col); R(g, x + sw, y + h - 6, w, 6, col);
    R(g, x, y, w, 1, D.cream); R(g, x + w - 1, y + 1, 1, h - 1, D.paperD); R(g, x + sw, y + h - 1, w, 1, D.paperD);
    for (let yy = y + 4; yy < y + h - 4; yy += 9) A(g, 0.25, () => R(g, x + 4, yy, w - 8, 1, D.paperD));
  };
  // desk lamp (side view) with the shade aimed up-right; base at (x, y)
  const deskLamp = (g, x, y) => {
    const m = mix(D.n4, D.steel[2], 0.3), mD = mix(m, D.n0, 0.4);
    ell(g, x, y, 14, 3, mD); R(g, x - 13, y - 3, 26, 3, m); R(g, x - 12, y - 3, 24, 1, mix(m, D.cream, 0.25));
    for (let k = 0; k < 2; k++) { PX.line(g, x + k, y - 3, x + 20 + k, y - 48, m); PX.line(g, x + 20 + k, y - 48, x + 44 + k, y - 68, m); }
    PX.circle(g, x + 20, y - 48, 2, mD);
    poly(g, [[x + 36, y - 74], [x + 54, y - 84], [x + 66, y - 60], [x + 48, y - 54]], m); PX.line(g, x + 36, y - 74, x + 54, y - 84, mix(m, D.cream, 0.3));
    PX.line(g, x + 48, y - 55, x + 66, y - 61, D.lamp); PX.line(g, x + 49, y - 56, x + 65, y - 62, D.lampD);
  };

  // ======================= two_lists =======================
  // a corkboard in a dim study, a desk lamp throwing a warm pool. Two paper lists: "WHAT YOU KEEP WATCHING" (o.l1 0.5,
  // long, thumbnails filling in) and "WHAT YOU'RE GLAD YOU WATCHED" (o.l2 3.0, short, ticks). At o.measure (6.0) a steel
  // tape-measure clamp slides in and clamps onto only the first list, the tape runs down it and a gauge needle rises.
  K.two_lists = (o) => {
    const L1 = { x: 128, y: 62, w: 176, h: 236 }, L2 = { x: 352, y: 74, w: 170, h: 150 };
    return (g, t, d, c) => {
      const T = tm(o, d, 10.0), t1 = T("l1", 0.5), t2 = T("l2", 3.0), tM = T("measure", 6.0);
      const slide = P(t, tM, 0.7, "out"), clampP = P(t, tM + 0.7, 0.3, "back"), tape = P(t, tM + 1.0, 1.4, "io"), needle = P(t, tM + 1.4, 1.2, "back");
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: wall with faint wallpaper, a night window edge at the right ----
      PX.par(g, c, 0.5, () => {
        PX.vgrad(g, -40, -40, 720, 400, mix(D.n2, D.steel[2], 0.08), D.n1, 8);
        for (let x = -40; x < 680; x += 16) A(g, 0.25, () => R(g, x, -40, 1, 400, D.n3));
        R(g, 590, 20, 80, 230, mix(D.n2, D.rust[2], 0.15)); PX.vgrad(g, 598, 28, 60, 214, mix(D.steel[2], D.n1, 0.35), mix(D.steel[2], D.n1, 0.65), 6);
        R(g, 596, 130, 64, 3, mix(D.n2, D.rust[2], 0.15)); PX.glow(g, 628, 80, 40, D.steel[0], 0.08);
        for (let k = 0; k < 4; k++) PX.line(g, 610 + k * 12, 40, 604 + k * 12, 240, mix(D.steel[2], D.n1, 0.5));
      });
      // ---- corkboard ----
      PX.par(g, c, 0.85, () => {
        const bx = 96, by = 40, bw = 456, bh = 274, [wL, w0, wD] = woodCols(0.42);
        A(g, 0.45, () => R(g, bx + 6, by + 6, bw, bh, "#000000"));
        R(g, bx, by, bw, bh, w0); R(g, bx, by, bw, 2, wL); R(g, bx, by, 2, bh, wL); R(g, bx + bw - 3, by, 3, bh, wD); R(g, bx, by + bh - 3, bw, 3, wD);
        const cork = mix(mix(D.amber[2], D.rust[2], 0.45), D.n2, 0.55);
        R(g, bx + 8, by + 8, bw - 16, bh - 16, cork);
        const rr = PX.rnd(61); for (let i = 0; i < 900; i++) R(g, bx + 8 + rr() * (bw - 17), by + 8 + rr() * (bh - 17), 1, 1, rr() < 0.5 ? mix(cork, D.n0, 0.25) : mix(cork, D.paperD, 0.25));
        // other bits pinned: a blank note, an old mountain photo, a string
        R(g, 524, 60, 18, 18, mix(D.paper, D.moss[0], 0.25)); pin(g, 533, 62, D.steel[1]);
        R(g, 520, 250, 26, 20, D.cream); R(g, 522, 252, 22, 14, mix(D.steel[2], D.n2, 0.3)); poly(g, [[522, 266], [530, 256], [536, 262], [540, 258], [544, 266]], mix(D.n4, D.paperD, 0.3)); pin(g, 533, 251, D.rust[1]);
        // list 1: long, keeps going (curled bottom)
        sheet(g, L1.x, L1.y, L1.w, L1.h, t, 0);
        pin(g, L1.x + 20, L1.y + 3, D.rust[1]); pin(g, L1.x + L1.w - 20, L1.y + 3, D.rust[1]);
        // list 2: shorter
        sheet(g, L2.x, L2.y, L2.w, L2.h, t, 2);
        pin(g, L2.x + L2.w / 2, L2.y + 3, D.moss[1]);
        // titles
        const ink = D.ink, s1 = ["WHAT YOU KEEP", "WATCHING"], s2 = ["WHAT YOU'RE GLAD", "YOU WATCHED"];
        s1.forEach((s, k) => PX.text(g, PX.typed(s, t, t1 + k * 0.5, 26), L1.x + 18, L1.y + 12 + k * 13, { font: "v", size: 16, col: ink }));
        s2.forEach((s, k) => PX.text(g, PX.typed(s, t, t2 + k * 0.6, 26), L2.x + 12, L2.y + 12 + k * 13, { font: "v", size: 16, col: ink }));
        if (t > t1 + 0.6) R(g, L1.x + 18, L1.y + 41, Math.round(120 * P(t, t1 + 0.6, 0.5)), 1, mix(ink, D.paper, 0.3));
        if (t > t2 + 0.8) R(g, L2.x + 12, L2.y + 41, Math.round(120 * P(t, t2 + 0.8, 0.5)), 1, mix(ink, D.paper, 0.3));
        // list 1 rows: thumbnail + scribble, filling fast and steadily
        for (let k = 0; k < 17; k++) {
          const a = P(t, t1 + 0.9 + k * 0.28, 0.25); if (a <= 0) continue;
          const ry = L1.y + 50 + k * 10.5; if (ry > L1.y + L1.h - 10) break;
          A(g, a, () => { R(g, L1.x + 16, ry, 7, 6, mix(D.teal[1], D.n2, 0.2)); R(g, L1.x + 16, ry, 2, 2, D.teal[0]);
            const lw = 40 + Math.floor(hash(k, 1) * 90); for (let x = 0; x < lw * a; x++) R(g, L1.x + 28 + x, ry + 2 + Math.round(Math.sin(x * 0.9 + k) * 0.7), 1, 1, mix(ink, D.paper, 0.25)); });
        }
        // list 2 rows: a handwritten line and a tick, slower
        for (let k = 0; k < 5; k++) {
          const a = P(t, t2 + 1.2 + k * 0.55, 0.4); if (a <= 0) continue;
          const ry = L2.y + 54 + k * 17;
          A(g, a, () => { PX.line(g, L2.x + 12, ry + 2, L2.x + 15, ry + 5, D.moss[2]); PX.line(g, L2.x + 15, ry + 5, L2.x + 21, ry - 2, D.moss[2]);
            const lw = 50 + Math.floor(hash(k, 7) * 70); for (let x = 0; x < lw * a; x++) R(g, L2.x + 28 + x, ry + 1 + Math.round(Math.sin(x * 0.7 + k * 2) * 0.8), 1, 1, mix(ink, D.paper, 0.2)); });
        }
        // ---- the measuring clamp on list 1 only ----
        if (slide > 0) {
          const cx = Math.round(lerp(-80, L1.x - 22, slide)), cy = L1.y + 46;
          const st3 = D.steel.map((v) => mix(v, D.n2, 0.35)), brass = mix(D.amber[2], D.n2, 0.3), brassL = mix(D.amber[1], D.n3, 0.3);
          // tape running down the left edge of the list, with ticks
          const tl = Math.round(tape * (L1.h - 30));
          if (tl > 0) { R(g, L1.x - 6, cy + 22, 8, tl, mix(D.paper, D.lampD, 0.3)); R(g, L1.x - 6, cy + 22, 1, tl, mix(D.paper, D.cream, 0.5)); for (let y = 0; y < tl; y += 4) R(g, L1.x - 6, cy + 22 + y, y % 20 === 0 ? 6 : y % 8 === 0 ? 4 : 2, 1, mix(D.ink, D.paper, 0.3)); R(g, L1.x - 7, cy + 22 + tl, 10, 2, st3[2]); }
          // rail arm from off-screen to the clamp
          R(g, -40, cy + 4, cx + 40, 4, st3[2]); R(g, -40, cy + 4, cx + 40, 1, st3[0]);
          // case
          R(g, cx - 6, cy - 6, 30, 30, st3[1]); R(g, cx - 6, cy - 6, 30, 1, st3[0]); R(g, cx - 6, cy - 6, 1, 30, st3[0]); R(g, cx + 22, cy - 5, 2, 29, st3[2]); R(g, cx - 6, cy + 22, 30, 2, st3[2]);
          // clamp jaw closing onto the paper edge
          const jy = Math.round(lerp(-8, 0, clampP));
          R(g, cx + 22, cy - 10 + jy, 14, 4, st3[1]); R(g, cx + 22, cy - 10 + jy, 14, 1, st3[0]); R(g, cx + 32, cy - 10 + jy, 4, 10 - jy, st3[2]);
          R(g, cx + 22, cy + 18 - jy, 14, 4, st3[1]); R(g, cx + 32, cy + 12, 4, 6 - jy, st3[2]);
          // gauge dial with a needle that rises and wobbles to rest
          PX.circle(g, cx + 8, cy + 8, 9, brass); PX.circle(g, cx + 8, cy + 8, 7, D.cream); ring(g, cx + 8, cy + 8, 9, 9, (a) => (Math.sin(a) < -0.2 ? brassL : null));
          for (let k = 0; k <= 6; k++) { const a = Math.PI * (0.8 + k * 0.233); R(g, cx + 8 + Math.round(Math.cos(a) * 6), cy + 8 + Math.round(Math.sin(a) * 6), 1, 1, D.ink); }
          const na = Math.PI * (0.85 + 1.15 * needle + 0.04 * Math.sin(t * 7) * needle);
          PX.line(g, cx + 8, cy + 8, cx + 8 + Math.cos(na) * 6, cy + 8 + Math.sin(na) * 6, D.rust[2]); R(g, cx + 7, cy + 7, 2, 2, D.n2);
          const on = clampP > 0.9; R(g, cx + 16, cy + 18, 3, 2, on ? D.teal[0] : D.n3); if (on) PX.glow(g, cx + 17, cy + 19, 6, D.teal[0], 0.3);
        }
      });
      // ---- foreground: desk edge, lamp, mug ----
      PX.par(g, c, 1.0, () => {
        const [wL, w0, wD] = woodCols(0.5);
        R(g, -40, 326, 720, 50, w0); R(g, -40, 326, 720, 2, wL); R(g, -40, 328, 720, 1, mix(w0, D.lamp, 0.2)); for (let x = -30; x < 680; x += 70) R(g, x, 338 + (x % 3), 50, 1, wD);
        deskLamp(g, 54, 330);
        R(g, 586, 306, 18, 20, mix(D.steel[2], D.n3, 0.4)); R(g, 586, 306, 18, 2, mix(D.steel[1], D.n4, 0.3)); R(g, 604, 310, 4, 9, mix(D.steel[2], D.n3, 0.5));
        for (let k = 0; k < 3; k++) { const u = frac(t * 0.3 + k / 3); A(g, 0.2 * (1 - u), () => R(g, 592 + Math.sin(u * 6 + k) * 2, 300 - u * 24, 2, 3, D.n6)); }
      });
      // lamp light: warm pool on the left list, soft falloff to the right
      PX.glow(g, 108, 266, 22, D.lamp, 0.4);
      PX.glow(g, 220, 190, 210, D.lampD, 0.09); PX.glow(g, 190, 200, 110, D.lamp, 0.05);
      for (let x = 280; x < 680; x += 4) A(g, 0.2 * ((x - 280) / 400), () => R(g, x, -40, 4, 440, "#000000"));   // light falls off to the right
      dust(g, 91, 30, t, [110, 60, 240, 230], D.lamp, 0.35);
      PX.vignette(g, 0.58);
      label(g, "MEASURED", L1.x + 88, L1.y - 16, t, tM + 1.1);
    };
  };
  // ---------- phones + feed tiles (sad_feed, controls, explore) ----------
  // phone body with a dark bezel; screen(g, sx, sy, sw, sh) is clipped
  const phone = (g, x, y, w, h, screen, o) => {
    o = o || {};
    const body = o.body || mix(D.n2, D.steel[2], 0.25);
    A(g, 0.4, () => R(g, x + 4, y + 4, w, h, "#000000"));
    R(g, x + 1, y, w - 2, h, body); R(g, x, y + 1, w, h - 2, body); R(g, x + 1, y, w - 2, 1, mix(body, D.n6, 0.35)); R(g, x, y + 1, 1, h - 2, mix(body, D.n6, 0.2)); R(g, x + w - 1, y + 1, 1, h - 2, mix(body, D.n0, 0.4));
    const sx = x + 4, sy = y + 8, sw = w - 8, sh = h - 16;
    R(g, sx, sy, sw, sh, D.n0);
    clip(g, sx, sy, sw, sh, () => { screen(g, sx, sy, sw, sh); A(g, 0.05, () => { for (let k = 0; k < 14; k++) R(g, sx + 2, sy + 2 + k, 18 - k, 1, D.cream); }); });
    R(g, x + w / 2 - 6, y + 3, 12, 2, mix(body, D.n0, 0.5));
    return { sx, sy, sw, sh };
  };
  // feed tile icons (no text, no logos). kind: dog, food, ball, sun, guitar, peak, cat, rain, umbrella, bench, drops, wood, boot
  const TILE_HAPPY = ["dog", "food", "plant", "sun", "guitar", "peak", "cat"];
  const tileBg = (kind) => ({ dog: D.moss[2], food: D.rust[2], plant: D.moss[2], sun: D.amber[2], guitar: D.rose[2], peak: D.teal[2], cat: D.plum[2], rain: D.steel[2], umbrella: D.steel[2], bench: D.steel[2], drops: D.steel[2], wood: mix(D.amber[2], D.rust[2], 0.4), boot: D.rust[2] }[kind] || D.n3);
  const tileIcon = (g, x, y, w, h, kind, k) => {
    const cx = x + Math.round(w / 2), cy = y + Math.round(h / 2), L = mix(D.cream, D.paper, 0.3), Dk = D.n1;
    if (kind === "dog") { R(g, cx - 7, cy - 1, 12, 6, L); R(g, cx + 3, cy - 6, 6, 6, L); R(g, cx + 3, cy - 7, 2, 3, mix(L, Dk, 0.4)); R(g, cx + 7, cy - 4, 1, 1, Dk); R(g, cx - 6, cy + 5, 2, 4, L); R(g, cx + 2, cy + 5, 2, 4, L); R(g, cx - 9, cy - 3, 2, 3, L); }
    else if (kind === "food") { ell(g, cx, cy + 3, 9, 3, L); ell(g, cx, cy + 1, 7, 3, mix(D.rust[0], L, 0.3)); R(g, cx - 3, cy - 2, 2, 2, D.moss[0]); R(g, cx + 2, cy - 1, 2, 2, D.amber[0]); for (let s = 0; s < 3; s++) R(g, cx - 3 + s * 3, cy - 8 + ((s + Math.floor(k * 3)) % 2), 1, 3, mix(L, D.n3, 0.4)); }
    else if (kind === "plant") { R(g, cx - 4, cy + 3, 8, 6, mix(D.rust[1], L, 0.3)); R(g, cx - 5, cy + 3, 10, 1, L); R(g, cx, cy - 6, 1, 9, D.moss[0]); ell(g, cx - 4, cy - 3, 3, 2, D.moss[0]); ell(g, cx + 4, cy - 5, 3, 2, D.moss[0]); ell(g, cx - 2, cy - 8, 2, 2, D.moss[0]); }
    else if (kind === "sun") { PX.circle(g, cx, cy, 5, D.amber[0]); for (let a = 0; a < 8; a++) R(g, cx + Math.round(Math.cos((a * TAU) / 8) * 9), cy + Math.round(Math.sin((a * TAU) / 8) * 9), 2, 2, D.amber[0]); }
    else if (kind === "guitar") { PX.circle(g, cx - 2, cy + 4, 5, L); PX.circle(g, cx + 1, cy - 1, 3, L); R(g, cx + 2, cy - 9, 2, 8, D.n1); R(g, cx - 3, cy + 3, 2, 2, D.n1); }
    else if (kind === "peak") { poly(g, [[x + 3, y + h - 3], [cx - 3, cy - 6], [cx + 3, cy], [cx + 7, cy - 4], [x + w - 3, y + h - 3]], L); poly(g, [[cx - 6, cy - 2], [cx - 3, cy - 6], [cx, cy - 2]], D.cream); }
    else if (kind === "cat") { R(g, cx - 5, cy - 2, 10, 8, L); R(g, cx - 5, cy - 5, 2, 3, L); R(g, cx + 3, cy - 5, 2, 3, L); R(g, cx - 3, cy, 1, 1, Dk); R(g, cx + 2, cy, 1, 1, Dk); R(g, cx + 5, cy + 3, 4, 2, L); }
    else if (kind === "rain") { R(g, cx - 8, cy - 6, 16, 5, mix(D.n6, D.steel[0], 0.3)); R(g, cx - 5, cy - 9, 9, 4, mix(D.n6, D.steel[0], 0.3)); for (let s = 0; s < 5; s++) { const yy = cy + ((s * 3 + Math.floor(k * 12)) % 8); R(g, cx - 7 + s * 3, yy, 1, 2, D.steel[0]); } }
    else if (kind === "umbrella") { poly(g, [[cx - 9, cy - 1], [cx + 9, cy - 1], [cx + 5, cy - 6], [cx - 5, cy - 6]], mix(D.n5, D.steel[1], 0.4)); R(g, cx, cy - 1, 1, 8, D.n6); R(g, cx - 2, cy + 7, 3, 1, D.n6); R(g, cx - 3, cy + 1, 6, 6, mix(D.n2, D.n4, 0.5)); for (let s = 0; s < 4; s++) R(g, x + 3 + s * 9, y + 3 + ((s * 5 + Math.floor(k * 10)) % (h - 6)), 1, 2, D.steel[0]); }
    else if (kind === "bench") { R(g, cx - 9, cy + 1, 18, 2, D.n6); R(g, cx - 9, cy - 4, 18, 2, D.n6); R(g, cx - 8, cy + 3, 1, 5, D.n6); R(g, cx + 7, cy + 3, 1, 5, D.n6); for (let s = 0; s < 6; s++) R(g, x + 2 + s * 7, y + 2 + ((s * 7 + Math.floor(k * 11)) % (h - 4)), 1, 2, D.steel[0]); }
    else if (kind === "drops") { R(g, x + 4, y + 4, w - 8, h - 8, mix(D.steel[2], D.n2, 0.3)); for (let s = 0; s < 7; s++) { const dx = x + 6 + ((s * 11) % (w - 12)), dy = y + 6 + ((s * 7 + Math.floor(k * 6)) % (h - 12)); R(g, dx, dy, 2, 2, mix(D.steel[0], D.cream, 0.3)); R(g, dx, dy + 2, 1, 2, D.steel[0]); } }
    else if (kind === "wood") { R(g, cx - 3, cy - 2, 2, 9, L); R(g, cx - 3, cy + 2, 8, 2, L); R(g, cx + 3, cy + 2, 2, 5, L); R(g, cx - 3, cy - 2, 7, 1, L); poly(g, [[cx + 4, cy - 8], [cx + 9, cy - 3], [cx + 7, cy - 1], [cx + 2, cy - 6]], mix(D.n6, D.steel[0], 0.4)); R(g, cx + 2, cy - 8, 2, 2, mix(D.rust[1], D.amber[2], 0.4)); }
    else if (kind === "boot") { R(g, cx - 4, cy - 7, 6, 10, L); R(g, cx - 4, cy + 1, 11, 4, L); R(g, cx - 5, cy + 5, 13, 2, D.n1); R(g, cx - 3, cy - 5, 4, 1, D.n2); R(g, cx - 3, cy - 2, 4, 1, D.n2); }
  };
  // one feed tile: bg + icon + caption bars. hl = highlight ring
  const tile = (g, x, y, w, h, kind, k, dim) => {
    const bg = mix(mix(tileBg(kind), D.n2, 0.25), D.n1, dim || 0);
    R(g, x, y, w, h, bg); R(g, x, y, w, 1, mix(bg, D.cream, 0.15));
    clip(g, x, y, w, h - 8, () => A(g, 1 - (dim || 0) * 0.6, () => tileIcon(g, x, y, w, h - 8, kind, k)));
    R(g, x, y + h - 8, w, 8, mix(D.n1, bg, 0.25)); R(g, x + 3, y + h - 6, Math.round(w * 0.6), 1, mix(D.n5, bg, 0.2)); R(g, x + 3, y + h - 3, Math.round(w * 0.35), 1, mix(D.n4, bg, 0.2));
  };

  // ======================= sad_feed =======================
  // a phone on a stand on a desk in a dark rainy room. Its feed scrolls slowly; the tiles turn one by one from mixed
  // colours to grey-blue rainy tiles (o.sad [1.0, 7.0]); a small screen-time clock "36 MIN" (o.clock 7.5). Quiet.
  K.sad_feed = (o) => {
    const r = PX.rnd(311), happy = [], sadK = ["rain", "umbrella", "bench", "drops"], thr = [];
    for (let i = 0; i < 80; i++) { happy.push(TILE_HAPPY[Math.floor(r() * TILE_HAPPY.length)]); thr.push(r()); }
    const drops = []; for (let i = 0; i < 90; i++) drops.push([r() * 560 + 40, r(), 0.6 + r() * 1.2, r()]);
    return (g, t, d, c) => {
      const T = tm(o, d, 10.0), [sa, sb] = span(o, d, 10.0, "sad", 1.0, 7.0), tC = T("clock", 7.5);
      const sadP = clamp((t - sa) / (sb - sa), 0, 1), clk = P(t, tC, 0.6, "out");
      R(g, 0, 0, 640, 360, D.n0);
      // ---- far: rainy window over the desk, city lights blurred behind the glass ----
      const WX = 40, WY = 18, WW = 560, WH = 226;
      PX.par(g, c, 0.5, () => {
        PX.vgrad(g, -40, -40, 720, 420, mix(D.n1, D.steel[2], 0.1), D.n0, 6);
        R(g, WX - 8, WY - 8, WW + 16, WH + 16, mix(D.n2, D.steel[2], 0.1));
        PX.vgrad(g, WX, WY, WW, WH, mix(D.n1, D.steel[2], 0.3), mix(D.n1, D.steel[2], 0.15), 7);
        const rc = PX.rnd(77);
        for (let i = 0; i < 40; i++) { const x = WX + rc() * WW, y = WY + 90 + rc() * 120, rad = 4 + rc() * 9; PX.glow(g, x, y, rad, rc() < 0.75 ? D.steel[0] : D.lampD, 0.12 + 0.06 * Math.sin(t * 0.5 + i)); }
        for (let x = WX; x < WX + WW; x += 20 + (x % 13)) { const by = WY + 160 + ((x * 7) % 34), bw = 14 + (x % 9); R(g, x, by, bw, WH, mix(D.n1, D.steel[2], 0.22)); for (let yy = by + 4; yy < WY + WH - 2; yy += 6) for (let xx = x + 2; xx < x + bw - 2; xx += 4) if (hash(xx, yy) < 0.25) R(g, xx, yy, 2, 2, mix(hash(yy, xx) < 0.7 ? D.steel[0] : D.lampD, D.n2, 0.55)); }
        // rain streaks on the glass (drops slide down, pause, slide)
        for (const [x, ph, sp, k] of drops) {
          const u = frac(t * sp * 0.18 + ph), y = WY + u * WH;
          A(g, 0.5, () => { R(g, x, y, 1, 2 + Math.round(k * 3), mix(D.steel[0], D.cream, 0.2)); R(g, x, y - 6, 1, 6, mix(D.steel[1], D.n2, 0.4)); });
        }
        for (let i = 0; i < 60; i++) { const x = WX + hash(i, 1) * WW, y = WY + hash(i, 2) * WH; R(g, x, y, 1, 1, mix(D.steel[0], D.n2, 0.4)); }
        R(g, WX + WW / 2 - 2, WY, 4, WH, mix(D.n2, D.steel[2], 0.1)); R(g, WX, WY + 96, WW, 3, mix(D.n2, D.steel[2], 0.1));
        R(g, WX - 14, WY + WH + 6, WW + 28, 5, mix(D.n3, D.steel[2], 0.1)); R(g, WX - 14, WY + WH + 6, WW + 28, 1, D.n4);
      });
      // curtains framing the window
      for (const [x0, dir] of [[0, 1], [640, -1]]) for (let k = 0; k < 7; k++) { const xx = x0 + dir * k * 9 - (dir < 0 ? 9 : 0), col = k % 2 ? mix(D.n2, D.steel[2], 0.12) : mix(D.n1, D.steel[2], 0.1); R(g, xx, -10, 9, 290, col); R(g, xx + (dir > 0 ? 8 : 0), -10, 1, 290, D.n0); }
      // rain shadows running down the wall below the sill
      for (let i = 0; i < 26; i++) { const x = 40 + hash(i, 5) * 560, u = frac(t * 0.12 + hash(i, 6)); A(g, 0.06, () => R(g, x, 252 + u * 24, 2, 6, D.n0)); }
      // ---- desk ----
      const [wL, w0, wD] = woodCols(0.62).map((v) => mix(v, D.n1, 0.55));
      R(g, -40, 264, 720, 120, w0); R(g, -40, 264, 720, 2, wL); for (let x = -30; x < 680; x += 64) R(g, x, 280 + (x % 5) * 3, 46, 1, wD);
      // cold mug, a closed notebook, a pen
      R(g, 438, 240, 22, 24, mix(D.paper, D.n2, 0.72)); R(g, 438, 240, 22, 2, mix(D.paper, D.n2, 0.6)); R(g, 460, 245, 4, 11, mix(D.paper, D.n2, 0.76)); R(g, 438, 240, 3, 24, mix(D.steel[0], D.n2, 0.6)); ell(g, 449, 241, 9, 1, mix(D.ink, D.n1, 0.5));
      R(g, 150, 252, 70, 12, mix(D.steel[2], D.n2, 0.45)); R(g, 150, 252, 70, 1, mix(D.steel[1], D.n3, 0.4)); R(g, 152, 262, 66, 2, D.paperD); PX.line(g, 236, 262, 270, 256, D.n5);
      // ---- the phone on a little stand ----
      const PX0 = 270, PY0 = 64, PW = 100, PH = 184;
      R(g, PX0 + 30, PY0 + PH - 6, 40, 16, mix(D.n3, D.steel[2], 0.2)); R(g, PX0 + 20, PY0 + PH + 8, 60, 4, mix(D.n3, D.steel[2], 0.25)); R(g, PX0 + 20, PY0 + PH + 8, 60, 1, D.n5);
      const scr = phone(g, PX0, PY0, PW, PH, (g, sx, sy, sw, sh) => {
        R(g, sx, sy, sw, sh, mix(D.n1, D.steel[2], 0.15));
        // status strip (no numbers)
        R(g, sx, sy, sw, 9, D.n1); R(g, sx + 4, sy + 3, 10, 3, D.n4); R(g, sx + sw - 14, sy + 3, 10, 3, D.n4);
        const tw = Math.floor((sw - 12) / 2), th = 46, gap = 4, scroll = t * 7;
        const row0 = Math.floor(scroll / (th + gap));
        for (let rr = row0; rr < row0 + 5; rr++) for (let col = 0; col < 2; col++) {
          const i = rr * 2 + col, ii = ((i % 80) + 80) % 80, x = sx + 4 + col * (tw + gap), y = sy + 12 + rr * (th + gap) - scroll;
          const s = clamp((sadP - thr[ii] * 0.88) / 0.12, 0, 1), sk = sadK[ii % 4];
          tile(g, x, y, tw, th, happy[ii], t, 0);
          if (s > 0) A(g, s, () => tile(g, x, y, tw, th, sk, t, 0.15));
        }
      });
      // phone light on the desk + wall: cooler and greyer as the feed turns
      const pl = mix(mix(D.teal[0], D.cream, 0.3), D.steel[1], sadP);
      PX.glow(g, PX0 + PW / 2, PY0 + PH / 2, 150, pl, 0.12); PX.glow(g, PX0 + PW / 2, 280, 120, pl, 0.14);
      A(g, 0.08, () => { ell(g, PX0 + PW / 2, 286, 110, 14, pl); ell(g, PX0 + PW / 2, 284, 70, 8, pl); });
      dust(g, 101, 18, t, [220, 60, 200, 200], D.steel[0], 0.25);
      PX.vignette(g, 0.6);
      // screen-time clock above the phone
      if (clk > 0) A(g, clk, () => { const cx = PX0 + PW / 2 - 34, cy = PY0 - 13; PX.circle(g, cx, cy, 6, D.n0); ring(g, cx, cy, 5, 5, () => D.cream); R(g, cx, cy - 3, 1, 4, D.cream); R(g, cx, cy, 3, 1, D.cream); });
      label(g, "36 MIN", PX0 + PW / 2 + 8, PY0 - 18, t, tC);
    };
  };
  // ---------- hands (You: medium-brown skin, mustard hoodie cuffs) ----------
  const YOU_SKIN = () => { const s = mix(D.rust[2], D.lampD, 0.5); return [mix(s, D.lamp, 0.32), s, mix(s, D.n0, 0.38)]; };   // matches home.js
  const HOODIE = () => { const h = mix(D.amber[1], D.n4, 0.34); return [mix(h, D.lamp, 0.3), h, mix(D.amber[2], D.n1, 0.42)]; };   // matches home.js (a touch darker for close-ups)
  // thick rounded stroke (finger / thumb) from (ax, ay) to (bx, by), radius rad
  const capsule = (g, ax, ay, bx, by, rad, col) => { const n = Math.ceil(Math.hypot(bx - ax, by - ay) / Math.max(1, rad * 0.3)); for (let i = 0; i <= n; i++) { const u = n ? i / n : 0; PX.circle(g, lerp(ax, bx, u), lerp(ay, by, u), rad, col); } };
  // small dot-space inset: dots, videos, YOU dot with trail. pts = cumulative YOU positions [[x,y],...] (0..1), cur = [x,y]
  const inset = (g, x, y, w, h, t, pts, cur, pulse, field) => {
    A(g, 0.5, () => R(g, x + 3, y + 3, w, h, "#000000"));
    R(g, x, y, w, h, mix(D.n0, D.steel[2], 0.12)); R(g, x, y, w, 1, mix(D.cream, D.n3, 0.5)); R(g, x, y + h - 1, w, 1, D.n2); R(g, x, y, 1, h, mix(D.cream, D.n3, 0.6)); R(g, x + w - 1, y, 1, h, D.n2);
    clip(g, x + 1, y + 1, w - 2, h - 2, () => {
      for (let k = 1; k < 4; k++) { A(g, 0.25, () => { R(g, x + (w * k) / 4, y, 1, h, D.n3); R(g, x, y + (h * k) / 4, w, 1, D.n3); }); }
      for (const [fx, fy, kind, ph] of field) {
        const px = x + fx * w + Math.sin(t * 0.3 + ph) * 1.2, py = y + fy * h + Math.cos(t * 0.27 + ph) * 1.2;
        if (kind) videoSq(g, px, py, 0); else A(g, 0.6, () => otherDot(g, px, py, 0.3));
      }
      // trail through the positions the dot has been
      for (let i = 1; i < pts.length; i++) {
        const [ax, ay] = pts[i - 1], [bx, by] = pts[i], n = Math.ceil(Math.hypot((bx - ax) * w, (by - ay) * h) / 3);
        for (let k = 0; k < n; k++) A(g, 0.45, () => R(g, x + lerp(ax, bx, k / n) * w, y + lerp(ay, by, k / n) * h, 1, 1, D.amber[0]));
      }
      if (pulse > 0) A(g, 0.6 * (1 - pulse), () => ring(g, x + cur[0] * w, y + cur[1] * h, 6 + pulse * 26, 6 + pulse * 26, () => D.amber[0]));
      youDot(g, x + cur[0] * w, y + cur[1] * h, t);
    });
  };

  // You's left hand holding a phone: holdBack before the phone (sleeve, palm), holdFront after (thumb, fingertips)
  const holdBack = (g, PXX, PYY, PWW, PHH) => {
    const [sL, sk, sD] = YOU_SKIN(), [hL, hc, hD] = HOODIE();
    // left hand behind the phone: sleeve, heel of the palm round the lower-left corner
    capsule(g, PXX - 30, PYY + PHH + 44, PXX - 120, PYY + PHH + 100, 34, hD); capsule(g, PXX - 28, PYY + PHH + 40, PXX - 118, PYY + PHH + 96, 30, hc); capsule(g, PXX - 44, PYY + PHH + 14, PXX - 120, PYY + PHH + 56, 3, hL);
    PX.circle(g, PXX + 4, PYY + PHH + 14, 46, sD); PX.circle(g, PXX + 8, PYY + PHH + 10, 42, sk); capsule(g, PXX - 18, PYY + PHH - 18, PXX - 8, PYY + PHH - 30, 3, sL);
  };
  const holdFront = (g, PXX, PYY, PWW, PHH) => {
    const [sL, sk, sD] = YOU_SKIN();
    // left thumb along the left edge, fingertips peeking round the right edge
    capsule(g, PXX - 18, PYY + PHH - 2, PXX + 12, PYY + PHH - 74, 12, sD); capsule(g, PXX - 17, PYY + PHH - 5, PXX + 12, PYY + PHH - 76, 11, sk); capsule(g, PXX - 21, PYY + PHH - 14, PXX + 5, PYY + PHH - 74, 3, sL);
    R(g, PXX + 7, PYY + PHH - 88, 9, 9, mix(sk, D.cream, 0.3)); R(g, PXX + 8, PYY + PHH - 87, 6, 4, mix(sk, D.cream, 0.45)); PX.line(g, PXX - 6, PYY + PHH - 44, PXX + 8, PYY + PHH - 48, sD);
    for (let k = 0; k < 3; k++) { const fy0 = PYY + 150 + k * 30; capsule(g, PXX + PWW - 4, fy0 + 2, PXX + PWW + 8, fy0 + 3, 11, sD); capsule(g, PXX + PWW - 4, fy0, PXX + PWW + 7, fy0, 10, k === 1 ? sk : mix(sk, sD, 0.2)); R(g, PXX + PWW - 7, fy0 - 7, 4, 4, mix(sk, D.cream, 0.25)); }
  };

  // ======================= controls =======================
  // close on You's hands holding a phone over a kitchen table at night; four actions in turn, each sending the YOU dot
  // (in a small inset space, top right) somewhere: "NOT INTERESTED" (o.b1 1.0), "PAUSE HISTORY" (o.b2 6.0),
  // "SEARCH ON PURPOSE" (o.b3 9.5), "FINISH IT" (o.b4 13.0, the loudest move: a big jump with a ring).
  K.controls = (o) => {
    const r = PX.rnd(401), field = [];
    for (let i = 0; i < 46; i++) field.push([0.04 + r() * 0.92, 0.06 + r() * 0.88, r() < 0.3 ? 1 : 0, r() * 6]);
    // clusters the moves head to (videos near the destination)
    for (const [cx, cy] of [[0.2, 0.18], [0.84, 0.2]]) for (let i = 0; i < 5; i++) field.push([cx + (r() - 0.5) * 0.14, cy + (r() - 0.5) * 0.16, 1, r() * 6]);
    const P0 = [0.56, 0.62], MOVES = [[-0.14, 0.04], [-0.06, -0.14], [-0.12, -0.2], [0.5, -0.12]];
    const MDEL = [1.7, 1.2, 2.0, 1.7], MDUR = [0.8, 0.8, 0.9, 1.0];
    const NAMES = ["NOT INTERESTED", "PAUSE HISTORY", "SEARCH ON PURPOSE", "FINISH IT"];
    const happy = []; for (let i = 0; i < 40; i++) happy.push(TILE_HAPPY[Math.floor(r() * TILE_HAPPY.length)]);
    const PXX = 240, PYY = 46, PWW = 136, PHH = 262, HS = 1.65;
    return (g, t, d, c) => {
      const T = tm(o, d, 17.0), B = [T("b1", 1.0), T("b2", 6.0), T("b3", 9.5), T("b4", 13.0)];
      // YOU dot position = start + every move scaled by its progress
      const pts = [P0.slice()]; let cur = P0.slice();
      MOVES.forEach(([dx, dy], i) => { const k = P(t, B[i] + MDEL[i], MDUR[i], i === 3 ? "back" : "io"); cur = [cur[0] + dx * k, cur[1] + dy * k]; pts.push(cur.slice()); });
      const pulse = clamp((t - B[3] - MDEL[3] - 0.5) / 1.2, 0, 1) * (t > B[3] + MDEL[3] + 0.5 ? 1 : 0), pulseOn = t > B[3] + MDEL[3] + 0.5 && t < B[3] + MDEL[3] + 1.7;
      // current action = latest beat that has started
      let act = -1; B.forEach((b, i) => { if (t >= b && (act < 0 || b >= B[act])) act = i; });
      const lt = act >= 0 ? t - B[act] : 0;
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: kitchen at night ----
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 300, mix(D.n2, D.rust[2], 0.06), D.n1, 7);
        for (let x = -30; x < 680; x += 64) { R(g, x, 18, 58, 64, mix(D.n2, D.n3, 0.35)); R(g, x, 18, 58, 1, D.n3); R(g, x + 50, 46, 2, 10, D.n4); }
        R(g, -40, 82, 720, 3, D.n0);
        R(g, 30, 110, 120, 90, mix(D.n2, D.n3, 0.2)); PX.vgrad(g, 36, 116, 108, 78, mix(D.steel[2], D.n1, 0.45), mix(D.steel[2], D.n1, 0.7), 5); R(g, 89, 116, 2, 78, D.n2); PX.glow(g, 120, 130, 30, D.steel[0], 0.08);
        R(g, -40, 196, 720, 50, mix(D.n2, D.n1, 0.3)); R(g, -40, 196, 720, 2, mix(D.n3, D.paperD, 0.15));   // counter
        R(g, 520, 160, 14, 36, mix(D.n3, D.steel[2], 0.2)); R(g, 560, 176, 30, 20, mix(D.n3, D.rust[2], 0.2));
        PX.glow(g, 500, 190, 6, D.moss[0], 0.3 * (PX.blink(t, 3, 0.9) ? 1 : 0.3));   // appliance standby light
      });
      // pendant lamp over the table
      R(g, 128, -10, 2, 40, D.n3); poly(g, [[106, 44], [152, 44], [142, 28], [116, 28]], D.n3); R(g, 108, 43, 42, 2, D.lamp);
      PX.glow(g, 129, 46, 50, D.lamp, 0.25); A(g, 0.05, () => poly(g, [[108, 45], [150, 45], [330, 300], [-60, 300]], D.lamp));
      // ---- table ----
      const [wL, w0, wD] = woodCols(0.55);
      R(g, -40, 246, 720, 140, w0); R(g, -40, 246, 720, 2, wL); for (let x = -30; x < 680; x += 80) R(g, x, 262 + (x % 4) * 6, 60, 1, wD);
      PX.glow(g, 140, 270, 150, D.lamp, 0.1);
      R(g, 60, 222, 26, 26, mix(D.paper, D.n3, 0.35)); R(g, 60, 222, 26, 2, mix(D.paper, D.cream, 0.2)); R(g, 86, 228, 6, 12, mix(D.paper, D.n3, 0.45)); ell(g, 73, 223, 11, 1, mix(D.rust[2], D.n1, 0.4));
      for (let k = 0; k < 3; k++) { const u = frac(t * 0.25 + k / 3); A(g, 0.25 * (1 - u), () => R(g, 70 + Math.sin(u * 6 + k) * 3, 214 - u * 30, 2, 3, D.n6)); }
      // ---- hands + phone ----
      const [sL, sk, sD] = YOU_SKIN(), [hL, hc, hD] = HOODIE();
      holdBack(g, PXX, PYY, PWW, PHH);
      // the phone
      // index finger of the right hand: keyframed per action (screen coords), presses as short bumps
      const sx0 = PXX + 4, sy0 = PYY + 8, sw0 = PWW - 8, sh0 = PHH - 16, REST = [sx0 + sw0 + 6, sy0 + sh0 - 60];
      let keys = [[0, REST[0], REST[1]]], presses = [];
      if (act === 0) { const dx = sx0 + 5 + 71, dy = sy0 + 80 + 51, rx = sx0 + 60, ry = sy0 + 80 + 45; keys = [[0, ...REST], [0.35, dx, dy], [0.7, dx, dy], [1.2, rx, ry], [1.8, rx, ry], [2.4, ...REST]]; presses = [0.5, 1.6]; }
      if (act === 1) { const tx = sx0 + sw0 - 21, ty = sy0 + 76; keys = [[0, ...REST], [0.6, tx, ty], [1.2, tx, ty], [1.8, ...REST]]; presses = [0.85]; }
      if (act === 2) { keys = [[0, ...REST], [0.35, sx0 + 60, sy0 + 25], [0.5, sx0 + 60, sy0 + 25]]; presses = [0.42];
        for (let k = 0; k < 5; k++) { const kx = sx0 + 14 + ((k * 3) % 5) * 22, ky = sy0 + sh0 - 92 + ((k * 2) % 3) * 24; keys.push([0.62 + k * 0.2, kx, ky]); presses.push(0.68 + k * 0.2); }
        keys.push([2.2, ...REST]); }
      if (act === 3) { keys = [[0, ...REST], [0.25, sx0 + sw0 / 2, sy0 + 108], [0.45, sx0 + sw0 / 2, sy0 + 108], [1.0, ...REST]]; presses = [0.33]; }
      const fx = PX.KF(keys.map(([k, x]) => [k, x]), lt), fy = PX.KF(keys.map(([k, , y]) => [k, y]), lt) + Math.sin(t * 1.1) * 1.5;
      const press = presses.reduce((m, p) => Math.max(m, 1 - Math.abs(lt - p) / 0.1), 0);
      const tap = press > 0 ? [fx, fy, press] : null;
      const scr = phone(g, PXX, PYY, PWW, PHH, (g, sx, sy, sw, sh) => {
        R(g, sx, sy, sw, sh, mix(D.n1, D.steel[2], 0.12));
        R(g, sx, sy, sw, 10, D.n1); R(g, sx + 4, sy + 4, 12, 3, D.n4); R(g, sx + sw - 16, sy + 4, 12, 3, D.n4);
        const feed = (dimK, skipTile) => {
          const tw = Math.floor((sw - 14) / 2), th = 58, gap = 5, scroll = t * 5;
          const row0 = Math.floor(scroll / (th + gap));
          for (let rr = row0; rr < row0 + 6; rr++) for (let col = 0; col < 2; col++) {
            const i = rr * 2 + col, ii = ((i % 40) + 40) % 40, x = sx + 5 + col * (tw + gap), y = sy + 14 + rr * (th + gap) - scroll;
            if (skipTile && skipTile(x, y, tw, th)) continue;
            tile(g, x, y, tw, th, happy[ii], t, dimK || 0);
            R(g, x + tw - 8, y + th - 7, 1, 1, D.n6); R(g, x + tw - 6, y + th - 7, 1, 1, D.n6); R(g, x + tw - 4, y + th - 7, 1, 1, D.n6);   // menu dots
          }
        };
        if (act === 0 && lt < 3.2) {
          // NOT INTERESTED: menu on one tile, tap the row, the tile folds away
          const tx = sx + 5, ty = sy + 80, tw = Math.floor((sw - 14) / 2), th = 58, fold = P(lt, 2.0, 0.6, "io");
          feed(0, (x, y) => Math.abs(x - tx) < 2 && Math.abs(y - ty) < 30);
          R(g, tx, ty, tw, th, mix(D.n1, D.steel[2], 0.12));
          if (fold < 1) { const hh = Math.round(th * (1 - fold)); clip(g, tx, ty + (th - hh) / 2, tw, hh, () => tile(g, tx, ty, tw, th, "peak", t, 0)); }
          const menu = P(lt, 0.5, 0.25, "out") * (1 - P(lt, 2.0, 0.2));
          if (menu > 0) A(g, menu, () => {
            const mx = tx + 20, my = ty + th - 18; R(g, mx, my, 92, 46, D.n2); R(g, mx, my, 92, 1, D.n4); A(g, 0.4, () => R(g, mx + 2, my + 46, 92, 2, "#000000"));
            for (let k = 0; k < 3; k++) { const ry = my + 5 + k * 14, hl = k === 0 && lt > 1.5; R(g, mx + 3, ry - 2, 86, 12, hl ? mix(D.n3, D.teal[2], 0.5) : D.n2); }
            ring(g, mx + 10, my + 9, 3, 3, () => D.cream); PX.line(g, mx + 8, my + 7, mx + 12, my + 11, D.cream); R(g, mx + 18, my + 8, 50, 2, D.cream);
            R(g, mx + 8, my + 22, 6, 4, D.n5); R(g, mx + 18, my + 22, 40, 2, D.n5); R(g, mx + 8, my + 36, 6, 4, D.n5); R(g, mx + 18, my + 36, 56, 2, D.n5);
          });
        } else if (act === 1 && lt < 3.0) {
          // PAUSE HISTORY: settings rows, one toggle flips off; the history list greys out
          A(g, P(lt, 0, 0.3), () => {
            R(g, sx, sy + 10, sw, sh - 10, mix(D.n1, D.steel[2], 0.08));
            R(g, sx + 8, sy + 20, 60, 3, D.n6);
            const off = P(lt, 0.9, 0.3, "io");
            for (let k = 0; k < 4; k++) {
              const ry = sy + 40 + k * 26; R(g, sx + 6, ry, sw - 12, 20, D.n2); R(g, sx + 12, ry + 8, 40 + k * 9, 2, D.n5);
              const tg = k === 1, on = tg ? 1 - off : k === 3 ? 0 : 1, tx = sx + sw - 30;
              R(g, tx, ry + 5, 18, 10, mix(D.n3, D.teal[1], on)); PX.circle(g, tx + 5 + on * 8, ry + 10, 4, D.cream);
              if (tg && off > 0.5) { R(g, sx + 12, ry + 4, 2, 7, D.cream); R(g, sx + 16, ry + 4, 2, 7, D.cream); }
            }
            for (let k = 0; k < 5; k++) { const ry = sy + 150 + k * 22; A(g, 1 - 0.6 * off, () => { R(g, sx + 8, ry, 26, 16, mix(D.teal[2], D.n2, 0.3)); R(g, sx + 40, ry + 4, 70 - k * 6, 2, D.n5); R(g, sx + 40, ry + 10, 40, 2, D.n4); }); }
          });
        } else if (act === 2 && lt < 3.4) {
          // SEARCH ON PURPOSE: search bar, keyboard, a typed word, results
          R(g, sx, sy + 10, sw, sh - 10, mix(D.n1, D.steel[2], 0.08));
          R(g, sx + 6, sy + 16, sw - 12, 18, D.n2); ring(g, sx + 15, sy + 24, 3, 3, () => D.n6); PX.line(g, sx + 17, sy + 26, sx + 20, sy + 29, D.n6);
          const word = PX.typed("CHESS", lt, 0.6, 5);
          PX.text(g, word, sx + 24, sy + 18, { font: "v", size: 14, col: D.cream });
          if (PX.blink(t, 0.8) && lt < 2.2) R(g, sx + 25 + PX.tw(g, word, { font: "v", size: 14 }), sy + 19, 1, 11, D.cream);
          const kb = P(lt, 0.1, 0.35, "out") * (1 - P(lt, 2.0, 0.35, "io")), ky = sy + sh - Math.round(kb * 110);
          if (kb > 0) { R(g, sx, ky, sw, 110, D.n2); for (let rr = 0; rr < 4; rr++) for (let k = 0; k < 9 - (rr === 3 ? 6 : rr); k++) { const kw = rr === 3 ? 50 : 10, kx = sx + 5 + (rr === 3 ? 36 : rr * 6) + k * (kw + 3), kyy = ky + 8 + rr * 24; R(g, kx, kyy, kw, 18, D.n4); R(g, kx, kyy, kw, 1, D.n5); } }
          const res = P(lt, 2.1, 0.5);
          if (res > 0) A(g, res, () => { for (let k = 0; k < 4; k++) { const ry = sy + 44 + k * 44; R(g, sx + 6, ry, 52, 36, mix(D.teal[2], D.n2, 0.15)); R(g, sx + 6, ry, 2, 2, D.teal[0]); for (let q = 0; q < 4; q++) R(g, sx + 18 + (q % 2) * 14, ry + 8 + Math.floor(q / 2) * 12, 8, 8, (q + k) % 2 ? D.cream : D.n1); R(g, sx + 64, ry + 6, 70 - k * 8, 2, D.n6); R(g, sx + 64, ry + 14, 50, 2, D.n4); } });
        } else if (act === 3 && lt < 4.2) {
          // FINISH IT: a video plays to the very end; a small tick
          R(g, sx, sy + 10, sw, sh - 10, D.n0);
          const vx = sx, vy = sy + 60, vw = sw, vh = 96;
          PX.vgrad(g, vx, vy, vw, vh, mix(D.steel[2], D.n1, 0.2), mix(D.teal[2], D.n1, 0.3), 5);
          const pan = lt * 10;
          poly(g, [[vx - 20 - pan % 40, vy + vh], [vx + 40 - pan % 40, vy + 40], [vx + 90 - pan % 40, vy + 70], [vx + 140 - pan % 40, vy + 30], [vx + 220 - pan % 40, vy + vh]], mix(D.n3, D.moss[2], 0.3));
          PX.circle(g, vx + 120, vy + 22, 6, mix(D.cream, D.paper, 0.4));
          const prog = P(lt, 0.3, 1.25, "lin");
          R(g, vx + 6, vy + vh + 8, vw - 12, 3, D.n3); R(g, vx + 6, vy + vh + 8, Math.round((vw - 12) * prog), 3, D.cream); PX.circle(g, vx + 6 + Math.round((vw - 12) * prog), vy + vh + 9, 3, D.cream);
          const done = P(lt, 1.6, 0.4, "back");
          if (done > 0) A(g, clamp(done, 0, 1), () => { PX.circle(g, vx + vw / 2, vy + vh / 2, 14, mix(D.n0, D.moss[2], 0.4)); PX.line(g, vx + vw / 2 - 6, vy + vh / 2, vx + vw / 2 - 2, vy + vh / 2 + 4, D.cream); PX.line(g, vx + vw / 2 - 2, vy + vh / 2 + 4, vx + vw / 2 + 6, vy + vh / 2 - 5, D.cream); PX.line(g, vx + vw / 2 - 6, vy + vh / 2 + 1, vx + vw / 2 - 2, vy + vh / 2 + 5, D.cream); });
          R(g, sx + 8, vy + vh + 20, 90, 3, D.n6); R(g, sx + 8, vy + vh + 28, 60, 2, D.n4);
          for (let k = 0; k < 2; k++) { const ry = vy + vh + 44 + k * 50; tile(g, sx + 8, ry, sw - 16, 42, happy[k + 5], t, 0.35); }
        } else feed(0);
        // tap ripple
        if (tap && tap[2] > 0.3) A(g, tap[2] * 0.5, () => ring(g, tap[0], tap[1], 5, 5, () => D.cream));
      });
      holdFront(g, PXX, PYY, PWW, PHH);
      // the right hand points in from the lower right (back of the hand toward us); the index finger taps
      {
        const tx = Math.round(fx) + Math.round(press * 1), ty = Math.round(fy) + Math.round(press * 2);
        const u = [0.62, 0.78], q = [0.78, -0.62];   // u: along the finger toward the wrist, q: across the knuckles
        const at = (a, b) => [tx + (u[0] * a + q[0] * b) * HS, ty + (u[1] * a + q[1] * b) * HS], rr = (v) => Math.round(v * HS);
        A(g, 0.3, () => { const [a0, a1] = at(4, -6), [b0, b1] = at(40, -10); capsule(g, a0 + 6, a1 + 8, b0 + 6, b1 + 8, rr(6), "#000000"); const [c0, c1] = at(56, 8); PX.circle(g, c0 + 8, c1 + 10, rr(22), "#000000"); });   // soft shadow on the screen
        // sleeve + cuff
        { const [a0, a1] = at(72, 16), [b0, b1] = at(360, 40); capsule(g, a0, a1 + 3, b0, b1 + 3, rr(27), mix(hD, D.n0, 0.3)); capsule(g, a0, a1, b0, b1, rr(24), hD); capsule(g, a0 - 2, a1 - 3, b0 - 2, b1 - 3, rr(19), hc); const [c0, c1] = at(70, 0), [d0, d1] = at(200, 6); capsule(g, c0, c1, d0, d1, rr(3), hL);
          PX.circle(g, a0, a1, rr(21), hD); for (let k = -3; k <= 3; k++) { const [e0, e1] = at(66, 16 + k * 5), [f0, f1] = at(76, 16 + k * 5); PX.line(g, e0, e1, f0, f1, mix(hD, D.n0, 0.3)); } }
        // wrist + back of the hand
        { const [a0, a1] = at(44, 12), [b0, b1] = at(64, 14); capsule(g, a0, a1 + 2, b0, b1 + 2, rr(15), sD); capsule(g, a0, a1, b0, b1, rr(14), sk); }
        { const [a0, a1] = at(34, 10), [b0, b1] = at(50, 12); capsule(g, a0, a1 + 2, b0, b1 + 2, rr(17), sD); capsule(g, a0, a1, b0, b1, rr(16), sk); const [c0, c1] = at(32, 2), [d0, d1] = at(48, 4); capsule(g, c0, c1, d0, d1, rr(4), sL);
          for (let k = 1; k < 4; k++) { const [e0, e1] = at(34, k * 8), [f0, f1] = at(48, k * 9); PX.line(g, e0, e1, f0, f1, mix(sk, sD, 0.45)); } }   // tendons
        // curled fingers: knuckle bumps across the top, short foreshortened first segments
        for (let k = 3; k >= 1; k--) { const [a0, a1] = at(30, k * 8), [b0, b1] = at(22, k * 8 + 1); capsule(g, a0, a1 + 1, b0, b1 + 1, rr(6), sD); capsule(g, a0, a1, b0, b1, rr(5), k % 2 ? sk : mix(sk, sD, 0.2)); const [c0, c1] = at(28, k * 8 - 2); R(g, c0, c1, 3, 2, sL); }
        // thumb tucked along the lower-left side
        { const [a0, a1] = at(46, -8), [b0, b1] = at(28, -12); capsule(g, a0, a1 + 1, b0, b1 + 1, rr(6), sD); capsule(g, a0, a1, b0, b1, rr(5), sk); R(g, b0 - 2, b1 - 3, 4, 3, mix(sk, D.cream, 0.3)); }
        // index finger, tapering, with two creases
        { const [a0, a1] = at(32, 0); capsule(g, a0, a1 + 1, tx, ty + 1, rr(6), sD); capsule(g, a0, a1, tx, ty, rr(5), sk); const [c0, c1] = at(28, -3), [d0, d1] = at(4, -3); capsule(g, c0, c1, d0, d1, rr(1), sL);
          for (const m of [12, 22]) { const [e0, e1] = at(m, -3), [f0, f1] = at(m, 3); PX.line(g, e0, e1, f0, f1, mix(sk, sD, 0.6)); } }
        R(g, tx - 4, ty - 4, 8, 7, mix(sk, D.cream, 0.32)); R(g, tx - 3, ty - 3, 5, 3, mix(sk, D.cream, 0.5));   // nail
      }
      // phone light on the hands (cool from the screen)
      PX.glow(g, PXX + PWW / 2, PYY + PHH / 2, 150, D.teal[0], 0.07);
      // ---- inset: the dot space ----
      inset(g, 452, 40, 156, 120, t, pts, cur, pulseOn ? pulse : 0, field);
      PX.otext(g, "YOU", 452 + cur[0] * 156 + 8, 40 + cur[1] * 120 - 12, { font: "v", size: 12, col: D.amber[0], outline: D.n0 });
      dust(g, 111, 22, t, [60, 40, 160, 200], D.lamp, 0.35);
      PX.vignette(g, 0.55);
      if (act >= 0) label(g, NAMES[act], 530, 172, t, B[act], { t1: B[act] + 4.6, col: act === 3 ? D.amber[0] : D.cream });
    };
  };
  // ======================= explore =======================
  // 1) You's phone in a dark bedroom: a feed of familiar tiles (peaks, boots, dogs); at o.odd (1.0) one odd woodworking
  // tile (chair + saw) slides into the feed. 2) cut-in at o.search (6.0): a dark house corridor, a flashlight beam
  // searching, settling on an unopened door with a small chair-and-saw plaque; "EXPLORING" at o.label (10.0).
  // 3) at o.scroll (13.0): the corridor stays, the beam drops away and clicks off, the door stays shut; an inset of the
  // phone shows the feed flicking the odd tile up and out of sight.
  K.explore = (o) => {
    const FAM = ["peak", "boot", "dog", "peak", "boot", "peak", "dog", "boot"];
    const PXX = 252, PYY = 40, PWW = 136, PHH = 262, OR = 2, OC = 1;   // odd tile slot (row, col)
    // corridor: colours dimmed toward black unless lit (k = 1)
    const hall = (g, k, t) => {
      const f = (c) => mix(mix(c, D.lamp, 0.14 * k), D.n0, 0.76 * (1 - k));
      const wall = mix(D.n3, D.paperD, 0.18), wallD = mix(wall, D.n0, 0.3), floor = mix(D.n3, D.rust[2], 0.25);
      R(g, -40, -40, 720, 440, f(mix(wall, D.n0, 0.2)));
      // perspective box: end wall rectangle, side walls, floor, ceiling
      const ex0 = 262, ex1 = 378, ey0 = 112, ey1 = 238;
      poly(g, [[-40, -40], [ex0, ey0], [ex0, ey1], [-40, 420]], f(wallD));
      poly(g, [[680, -40], [ex1, ey0], [ex1, ey1], [680, 420]], f(mix(wall, D.n0, 0.15)));
      poly(g, [[-40, 420], [ex0, ey1], [ex1, ey1], [680, 420]], f(floor));
      poly(g, [[-40, -40], [ex0, ey0], [ex1, ey0], [680, -40]], f(mix(D.n2, D.n0, 0.3)));
      R(g, ex0, ey0, ex1 - ex0, ey1 - ey0, f(wall));
      for (let i = -6; i <= 6; i++) PX.line(g, 320 + i * 10, ey1, 320 + i * 95, 400, f(mix(floor, D.n0, 0.35)));   // floorboards
      for (let j = 1; j < 6; j++) { const y = ey1 + (j * j * 160) / 36; R(g, -40, y, 720, 1, f(mix(floor, D.n0, 0.2))); }
      // skirting lines
      PX.line(g, -40, 400, ex0, ey1 - 4, f(D.n4)); PX.line(g, 680, 400, ex1, ey1 - 4, f(D.n4));
      // side doors (opened rooms: dark gaps with a hint of familiar shapes)
      poly(g, [[72, 96], [150, 122], [150, 286], [72, 318]], f(mix(D.n1, D.n0, 0.3))); PX.line(g, 72, 96, 72, 318, f(D.n4)); PX.line(g, 150, 122, 150, 286, f(D.n4));
      poly(g, [[568, 96], [490, 122], [490, 286], [568, 318]], f(mix(D.n1, D.n0, 0.3))); PX.line(g, 568, 96, 568, 318, f(D.n4)); PX.line(g, 490, 122, 490, 286, f(D.n4));
      poly(g, [[96, 250], [126, 240], [136, 262], [100, 276]], f(mix(D.teal[2], D.n1, 0.4)));   // a shape in the dark room (familiar)
      poly(g, [[508, 238], [540, 248], [540, 270], [508, 262]], f(mix(D.moss[2], D.n1, 0.4)));
      // picture frame on the left wall
      poly(g, [[186, 120], [226, 132], [226, 168], [186, 160]], f(mix(D.paperD, D.n2, 0.4))); poly(g, [[190, 126], [222, 136], [222, 164], [190, 156]], f(mix(D.steel[2], D.n2, 0.4)));
      // the unopened door at the end, with a chair-and-saw plaque, dust and a cobweb
      const dx = 296, dy = 146, dw = 48, dh = 92, [wL, w0, wD] = woodCols(0.4);
      R(g, dx - 4, dy - 4, dw + 8, dh + 4, f(mix(wall, D.n0, 0.35)));
      R(g, dx, dy, dw, dh, f(w0)); R(g, dx, dy, dw, 1, f(wL)); R(g, dx, dy, 1, dh, f(wL)); R(g, dx + dw - 2, dy, 2, dh, f(wD));
      R(g, dx + 6, dy + 8, dw - 12, 30, f(mix(w0, D.n0, 0.15))); R(g, dx + 6, dy + 46, dw - 12, 38, f(mix(w0, D.n0, 0.15)));
      R(g, dx + 6, dy + 8, dw - 12, 1, f(wL)); R(g, dx + 6, dy + 46, dw - 12, 1, f(wL));
      PX.circle(g, dx + dw - 8, dy + 50, 2, f(mix(D.amber[2], D.n3, 0.3))); R(g, dx + dw - 9, dy + 49, 1, 1, f(D.lamp));
      R(g, dx + 14, dy + 14, 20, 16, f(mix(D.paper, D.n3, 0.3))); R(g, dx + 14, dy + 14, 20, 1, f(D.paper));
      const pc = f(mix(D.ink, D.paper, 0.2));
      R(g, dx + 17, dy + 17, 2, 10, pc); R(g, dx + 17, dy + 22, 8, 2, pc); R(g, dx + 23, dy + 22, 2, 5, pc); R(g, dx + 17, dy + 17, 6, 1, pc);   // chair
      PX.line(g, dx + 26, dy + 16, dx + 31, dy + 23, pc); PX.line(g, dx + 27, dy + 16, dx + 32, dy + 23, pc); R(g, dx + 25, dy + 15, 3, 2, pc);   // saw
      R(g, dx - 4, dy + dh - 1, dw + 8, 2, f(mix(D.n0, wall, 0.2)));
      A(g, 0.5, () => { for (let q = 0; q < 3; q++) PX.line(g, dx + dw + 3, dy - 3, dx + dw + 3 - 10 + q * 4, dy - 3 + 12 - q * 3, f(D.n6)); });
      A(g, 0.35, () => { for (let q = 0; q < 14; q++) R(g, dx + hash(q, 2) * dw, dy + dh + 1 + hash(q, 3) * 3, 2, 1, f(D.n6)); });
    };
    // familiar feed in a phone screen; oddIn 0..1 slides the odd tile into its slot; flick = extra scroll
    const feedScreen = (g, sx, sy, sw, sh, t, oddIn, flick, small) => {
      R(g, sx, sy, sw, sh, mix(D.n1, D.steel[2], 0.12));
      if (!small) { R(g, sx, sy, sw, 10, D.n1); R(g, sx + 4, sy + 4, 12, 3, D.n4); R(g, sx + sw - 16, sy + 4, 12, 3, D.n4); }
      const gap = small ? 3 : 5, tw = Math.floor((sw - 3 * gap) / 2), th = small ? tw : 58, top = sy + (small ? 4 : 14), scroll = t * (small ? 2 : 4) + flick;
      const row0 = Math.floor(scroll / (th + gap)) - 1;
      for (let rr = row0; rr < row0 + 7; rr++) for (let col = 0; col < 2; col++) {
        const x = sx + gap + col * (tw + gap), y = top + rr * (th + gap) - scroll, i = rr * 2 + col, kind = FAM[((i % FAM.length) + FAM.length) % FAM.length];
        if (rr === OR && col === OC && oddIn > 0) {
          const off = Math.round((1 - oddIn) * (tw + gap + 4));
          clip(g, x, y, tw, th, () => { tile(g, x - (tw + gap) + off, y, tw, th, kind, t, 0); tile(g, x + off, y, tw, th, "wood", t, 0); });
          if (oddIn >= 1) A(g, 0.6 + 0.3 * Math.sin(t * 2.4), () => PX.box(g, x - 1, y - 1, tw + 2, th + 2, mix(D.cream, D.lampD, 0.3)));
        } else tile(g, x, y, tw, th, kind, t, 0);
      }
    };
    return (g, t, d, c) => {
      const T = tm(o, d, 17.0), tO = T("odd", 1.0), tS = T("search", 6.0), tL = T("label", 10.0), tX = T("scroll", 13.0);
      const oddIn = P(t, tO, 0.6, "out"), flick = 230 * P(t, tX + 0.6, 1.3, "io");   // the odd tile is seen in the inset, then flicked away
      const mode = t < tS ? 0 : t < tX ? 1 : 2;
      // dips to black at the cuts
      const cutA = Math.min(1, Math.abs(t - tS) / 0.25), cutB = Math.min(1, Math.abs(t - tX) / 0.25), dip = 1 - Math.min(cutA, cutB);
      R(g, 0, 0, 640, 360, D.n0);
      if (mode === 0) {
        // ---- dark bedroom: bed, window moonlight, the phone in You's hand ----
        PX.par(g, c, 0.4, () => {
          PX.vgrad(g, -40, -40, 720, 420, mix(D.n1, D.steel[2], 0.1), D.n0, 7);
          R(g, 440, 30, 150, 120, mix(D.n2, D.steel[2], 0.1)); PX.vgrad(g, 446, 36, 138, 108, mix(D.steel[2], D.n1, 0.4), mix(D.steel[2], D.n1, 0.65), 5);
          R(g, 513, 36, 3, 108, mix(D.n2, D.steel[2], 0.1)); PX.glow(g, 540, 70, 40, D.steel[0], 0.1);
          A(g, 0.06, () => poly(g, [[446, 144], [584, 144], [520, 360], [300, 360]], D.steel[0]));
          R(g, 20, 70, 76, 180, mix(D.n2, D.rust[2], 0.12)); R(g, 20, 70, 76, 2, D.n3); R(g, 57, 72, 1, 178, D.n1); R(g, 52, 150, 2, 10, D.n4); R(g, 61, 150, 2, 10, D.n4);   // wardrobe
          R(g, 120, 214, 56, 36, mix(D.n2, D.rust[2], 0.15)); R(g, 120, 214, 56, 2, D.n3); R(g, 126, 228, 44, 1, D.n1);   // nightstand
          R(g, 146, 196, 3, 18, D.n3); poly(g, [[136, 198], [158, 198], [154, 184], [140, 184]], mix(D.n3, D.paperD, 0.2)); R(g, 140, 210, 16, 4, D.n3);   // lamp (off)
        });
        PX.par(g, c, 0.7, () => { PX.vgrad(g, -40, 250, 720, 140, mix(D.steel[2], D.n2, 0.55), D.n1, 5); for (let x = -30; x < 680; x += 46) PX.line(g, x, 252, x + 30, 360, mix(D.n2, D.steel[2], 0.3)); });   // blanket folds
        holdBack(g, PXX, PYY, PWW, PHH);
        phone(g, PXX, PYY, PWW, PHH, (g, sx, sy, sw, sh) => feedScreen(g, sx, sy, sw, sh, t, oddIn, 0, false));
        holdFront(g, PXX, PYY, PWW, PHH);
        PX.glow(g, PXX + PWW / 2, PYY + PHH / 2, 160, D.teal[0], 0.08);
        if (oddIn >= 1) A(g, P(t, tO + 1.2, 0.5), () => { const tw = Math.floor((PWW - 8 - 15) / 2), qx = PXX + 4 + 5 + (tw + 5) + tw - 12, qy = PYY + 8 + 14 + OR * 63 - t * 4 + 4; PX.otext(g, "?", qx, qy, { col: D.cream, outline: D.n0 }); });
      } else {
        // ---- the corridor: dark version, then the lit version inside the flashlight beam ----
        const ls = t - tS;
        let bx = PX.KF([[0, 140], [1.2, 470], [2.6, 320]], ls), by = PX.KF([[0, 230], [1.2, 200], [2.6, 192]], ls);
        bx += Math.sin(t * 2.1) * 3 + Math.sin(t * 5.3) * 1; by += Math.sin(t * 1.7 + 1) * 2;
        let pow = 1;
        if (mode === 2) { const lx = t - tX; bx = lerp(320, 250, P(lx, 0.6, 1.4, "io")) + Math.sin(t * 2.1) * 3; by = lerp(192, 330, P(lx, 0.6, 1.4, "io")); pow = 1 - P(lx, 1.6, 0.6, "io") * 0.85 - (lx > 2.2 ? 0.15 : 0) * (PX.blink(lx, 0.12) ? 1 : 0); if (lx > 2.4) pow = 0; }
        if (mode === 1 && ls < 0) { bx = 140; by = 230; }
        hall(g, 0, t);
        if (pow > 0) {
          const rx = 66, ry = 50;
          // stepped falloff: concentric pools, brightest in the middle
          for (const [sc, kk] of [[1.7, 0.3], [1.35, 0.55], [1.08, 0.8], [0.78, 1]]) A(g, pow, () => { g.save(); g.beginPath(); g.ellipse(Math.round(bx), Math.round(by), rx * sc, ry * sc, 0, 0, TAU); g.clip(); hall(g, kk, t); g.restore(); });
          PX.glow(g, bx, by, 70, D.lamp, 0.16 * pow);
          A(g, 0.05 * pow, () => poly(g, [[110, 380], [190, 380], [bx + rx * 0.7, by + ry * 0.4], [bx - rx * 0.7, by - ry * 0.4]], D.lamp));   // beam through the dusty air
          dust(g, 121, 34, t, [Math.round(bx - 70), Math.round(by - 60), 140, 140], D.cream, 0.4 * pow);
        }
        // the flashlight in a hand at the bottom-left
        const [sL, sk, sD] = YOU_SKIN(), [, hc, hD] = HOODIE();
        const fx = 150, fy = 350, ang = Math.atan2(by - fy, bx - fx);
        capsule(g, fx - 70, fy + 40, fx - 20, fy + 16, 24, hD); capsule(g, fx - 70, fy + 36, fx - 22, fy + 12, 21, hc);
        capsule(g, fx, fy, fx + Math.cos(ang) * 30, fy + Math.sin(ang) * 30, 6, mix(D.n3, D.steel[2], 0.3)); PX.circle(g, fx + Math.cos(ang) * 32, fy + Math.sin(ang) * 32, 7, mix(D.n4, D.steel[2], 0.3));
        if (pow > 0) PX.circle(g, fx + Math.cos(ang) * 34, fy + Math.sin(ang) * 34, 4, mix(D.lamp, D.n3, 1 - pow));
        PX.circle(g, fx - 6, fy + 6, 15, sD); PX.circle(g, fx - 7, fy + 4, 13, sk); capsule(g, fx - 2, fy - 6, fx + 10, fy - 4, 5, sk); R(g, fx - 12, fy - 6, 6, 2, sL);
        // inset: the phone, the feed flicks the odd tile up and away
        if (mode === 2) {
          const ix = 470, iy = 36, iw = 112, ih = 150, ia = P(t, tX, 0.35, "out");
          A(g, ia, () => {
            A(g, 0.5, () => R(g, ix + 3, iy + 3, iw, ih, "#000000"));
            R(g, ix - 5, iy - 9, iw + 10, ih + 18, mix(D.n2, D.steel[2], 0.25)); R(g, ix - 5, iy - 9, iw + 10, 1, mix(D.n6, D.n3, 0.4)); R(g, ix + iw / 2 - 6, iy - 6, 12, 2, D.n1);
            clip(g, ix, iy, iw, ih, () => feedScreen(g, ix, iy, iw, ih, t, 1, flick * 0.8 + 10, true));
          });
        }
        PX.vignette(g, 0.62);
        if (t >= tL) label(g, "EXPLORING", 320, 304, t, tL);
      }
      if (mode === 0) PX.vignette(g, 0.55);
      if (dip > 0) A(g, dip, () => R(g, -40, -40, 720, 440, "#000000"));
    };
  };
})();
