/* Euler film, Builder B: people of the past. Documentary palette PX.D only (black only for shadows), no mascot.
   Kinds: brahmagupta, bank, basel, italy, descartes, euler_blind, euler_young. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, E = PX.ease, P = PX.p;
  const TAU = Math.PI * 2;

  // ---------- colour + shape helpers ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A0 = hx(a), B0 = hx(b); k = clamp(k, 0, 1); return "#" + A0.map((v, i) => Math.round(v + (B0[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const sh3 = (c) => [mix(c, D.cream, 0.28), c, mix(c, D.n0, 0.45)];
  const ell = (g, cx, cy, rx, ry, col) => { if (rx < 0.5 || ry < 0.5) return; g.fillStyle = col; for (let y = -Math.round(ry); y <= Math.round(ry); y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
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
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
    poly(g, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], col);
  };
  const A = (g, a, fn) => { if (a <= 0) return; const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const clipR = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const shadow = (g, a, fn) => A(g, a, fn);   // fn draws with "#000000"
  const BLK = "#000000";
  // option time resolver: o[k] if a number, else the default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  // 0 -> 1 -> 0 bump: rise over [a, a+r], hold to b, fall over [b, b+f]
  const bump = (t, a, r, b, f) => (t < a ? 0 : t < a + r ? E((t - a) / r, "io") : t < b ? 1 : 1 - E((t - b) / f, "io"));
  const dust = (g, seed, n, t, box, col, a) => PX.particles(g, seed, n, t, box, { vy: -1.4, vx: 1.0, col: col || D.lamp, a: a === undefined ? 0.4 : a, tw: 1.3 });
  const woodCols = (k, warm) => { const w = mix(mix(D.rust[2], D.amber[2], warm === undefined ? 0.4 : warm), D.n2, k === undefined ? 0.5 : k); return [mix(w, D.lamp, 0.22), w, mix(w, D.n0, 0.42)]; };
  // candle / lamp flicker 0.85..1.05, deterministic
  const flick = (t, s) => 0.93 + 0.05 * Math.sin(t * 9.1 + s) + 0.04 * Math.sin(t * 23.7 + s * 2) + 0.03 * Math.sin(t * 3.3 + s * 5);
  // handwriting scribble: letter-like marks revealed left to right by prog 0..1
  const scribble = (g, x, y, w, seed, col, prog, hgt) => {
    const r = PX.rnd(seed), hh = hgt || 3, end = x + w * clamp(prog === undefined ? 1 : prog, 0, 1);
    let cx = x;
    while (cx < end) {
      if (r() < 0.16) { cx += 3; continue; }
      const k = r(), up = r() < 0.18 ? Math.ceil(hh * 0.6) : 0, dn = r() < 0.1 ? Math.ceil(hh * 0.5) : 0;
      if (k < 0.35) R(g, cx, y - up, 1, hh + up + dn, col);
      else if (k < 0.7) { R(g, cx, y + 1, 1, hh - 1, col); R(g, cx + 1, y, 1, 1, col); }
      else { R(g, cx, y + hh - 1, 2, 1, col); R(g, cx + 1, y + 1, 1, hh - 1, col); }
      cx += 2;
    }
  };
  // cursive handwriting line (bigger sizes): a looping trochoid with random letter heights and word gaps
  const cursive = (g, x, y, w, seed, col, hgt, prog) => {
    const r = PX.rnd(seed), f = 1.15, cyc = TAU / f, n = Math.ceil(w / cyc) + 1, amp = [];
    for (let i = 0; i < n; i++) { const a = r(); amp.push(a < 0.13 ? 0 : a > 0.9 ? 2.0 : a > 0.84 ? -1.1 : 0.55 + 0.4 * r()); }
    const end = w * clamp(prog === undefined ? 1 : prog, 0, 1); let last = null;
    for (let s0 = 0; s0 < end; s0 += 0.3) {
      const i = Math.floor(s0 / cyc), a = amp[i];
      if (a === 0) { last = null; continue; }
      const ph = s0 * f, px = x + s0 - 1.5 * Math.sin(ph), py = a > 0 ? y - hgt * a * (0.5 - 0.5 * Math.cos(ph)) : y + hgt * -a * (0.5 - 0.5 * Math.cos(ph));
      if (last) PX.line(g, last[0], last[1], px, py, col); last = [px, py];
    }
  };
  // 2-bone IK: shoulder (sx,sy) -> hand (hx,hy); bend +1/-1 picks the elbow side. returns [ex, ey, hx, hy]
  const ik = (sx, sy, hx0, hy0, L1, L2, bend) => {
    let dx = hx0 - sx, dy = hy0 - sy, dd = Math.hypot(dx, dy); const m = L1 + L2 - 0.5;
    if (dd > m) { dx *= m / dd; dy *= m / dd; dd = m; }
    dd = Math.max(dd, Math.abs(L1 - L2) + 1);
    const a = Math.acos(clamp((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1)), b = Math.atan2(dy, dx) + bend * a;
    return [sx + Math.cos(b) * L1, sy + Math.sin(b) * L1, sx + dx, sy + dy];
  };
  // tighter framing baked into a kind: zoom z about (fx, fy), on top of the shot camera, kept inside the frame
  const frame = (c, z, fx, fy) => { c.z *= z; c.x = clamp(lerp(c.x, fx, 1 - 1 / z), 320 / c.z, 640 - 320 / c.z); c.y = clamp(lerp(c.y, fy, 1 - 1 / z), 180 / c.z, 360 - 180 / c.z); };
  // close-up window: [a, b] seconds, or none when o[key] === false
  const win = (o, key, a, b) => (o[key] === false ? [1e9, 1e9] : [a, b]);

  // ---------- palettes for people ----------
  const SKIN = { fair: mix(D.rose[0], D.lampD, 0.35), warm: mix(D.rose[0], D.lampD, 0.55), olive: mix(mix(D.rose[1], D.lampD, 0.55), D.moss[2], 0.12), brown: mix(mix(D.rust[2], D.lampD, 0.5), D.rose[1], 0.2) };
  const HAIR = { black: mix(D.n1, D.rust[2], 0.25), dark: mix(D.n2, D.rust[2], 0.45), brown: mix(D.rust[2], D.amber[2], 0.35), grey: mix(D.n6, D.paperD, 0.3), white: mix(D.cream, D.n7, 0.35), salt: mix(D.n5, D.n2, 0.3) };

  // ======================= front-view seated figure =======================
  // drawn in two layers so a desk / counter sits between: frontBody (head + torso) then frontArms (over the desk).
  // v = { skin, hair, hairStyle: short|long|knot|cap|beret|coif|visor, beard: null|full|tash|cavalier|stubble, top, shirt,
  //       collar: band|vest|shawl|robe|plain|cravat, age 0..1, hatCol }
  // P = { down 0..1, look 0..1 (head up), eyes: open|closed|blind, glance -1..1, talk 0/1, smile 0..1, shrug 0..1, scoff 0..1,
  //       brow 0..1 (raised), tilt -1..1, hR [x,y], hL [x,y] (hand targets), toolR: quill|stylus|chalk, palmR/palmL (open palms) }
  const frontGeo = (x, yd, t, P) => {
    const br = Math.sin(t * 1.6 + (P.ph || 0)) > 0.3 ? 1 : 0, sh = Math.round((P.shrug || 0) * 4);
    const yS = Math.round(yd - 46 - br - sh), hy = Math.round(yd - 64 - br - (P.shrug || 0) * 1.5 + (P.down || 0) * 2 - (P.look || 0) * 2);
    const hx0 = Math.round(x + (P.tilt || 0) * 2);
    return { yS, hy, hx: hx0, sh };
  };
  const frontBody = (g, x, yd, t, P, v, lit) => {
    lit = lit === undefined ? -1 : lit;
    const { yS, hy, hx: X } = frontGeo(x, yd, t, P), dn = P.down || 0;
    const [tL, tp, tD] = sh3(v.top), sk = v.skin, sL = mix(sk, D.cream, 0.25), sD = mix(sk, D.n0, 0.3), [hL, hr, hD] = sh3(v.hair);
    const side = (dx, w) => (lit < 0 ? x + dx : x - dx - w + 1), sideH = (dx, w) => (lit < 0 ? X + dx : X - dx - w + 1);
    shadow(g, 0.3, () => ell(g, x - lit * 6, yd - 22, 38, 28, BLK));
    // long hair falls behind the shoulders
    if (v.hairStyle === "long") { R(g, X - 15, hy - 4, 30, 30, hr); R(g, sideH(-15, 3), hy - 2, 3, 26, hL); }
    if (v.hairStyle === "knot" || v.hairStyle === "short" || v.hairStyle === "visor") {}
    // torso
    const tw = 28;
    R(g, x - tw, yS + 4, 2 * tw + 1, yd - yS - 3, tp); R(g, x - tw + 3, yS + 2, 2 * tw - 5, 2, tp); R(g, x - tw + 8, yS, 2 * tw - 15, 2, tp);
    R(g, side(-tw, 4), yS + 4, 4, yd - yS - 3, tL); R(g, side(-tw + 3, 8), yS + 2, 8, 1, tL); R(g, side(-tw + 8, 10), yS, 10, 1, tL);
    R(g, side(tw - 7, 8), yS + 4, 8, yd - yS - 3, tD); R(g, side(tw - 14, 12), yS + 2, 12, 1, mix(tp, tD, 0.5));
    const col = v.collar;
    if (col === "band") {   // 1630s flat white falling collar over a dark doublet with buttons
      for (let k = 0; k < 4; k++) R(g, x, yS + 16 + k * 7, 1, 2, mix(D.paperD, tp, 0.3));
      poly(g, [[x - 15, yS - 1], [x + 16, yS - 1], [x + 13, yS + 10], [x + 1, yS + 12], [x - 12, yS + 10]], mix(D.cream, D.paper, 0.3));
      R(g, x, yS + 1, 1, 11, mix(D.paperD, D.n3, 0.3)); R(g, side(-15, 10), yS - 1, 10, 1, D.cream);
      R(g, x - 12, yS + 10, 12, 1, mix(D.paperD, D.n3, 0.2)); R(g, x + 1, yS + 10, 12, 1, mix(D.paperD, D.n3, 0.35));
      for (let k = 0; k < 3; k++) R(g, x - 10 + k * 9, yS + 8 + (k % 2), 1, 1, mix(D.paperD, D.n4, 0.2));   // lace dots
    } else if (col === "vest") {   // white shirt, dark waistcoat, tie
      R(g, x - 13, yS + 1, 27, yd - yS, v.shirt); R(g, side(-13, 4), yS + 1, 4, yd - yS, mix(v.shirt, D.cream, 0.4));
      const vc = v.vest || mix(D.n2, D.rust[2], 0.3);
      poly(g, [[x - 18, yS + 2], [x - 4, yS + 22], [x - 4, yd + 2], [x - 18, yd + 2]], vc); poly(g, [[x + 19, yS + 2], [x + 5, yS + 22], [x + 5, yd + 2], [x + 19, yd + 2]], mix(vc, D.n0, 0.2));
      for (let k = 0; k < 3; k++) R(g, x + 6, yS + 26 + k * 6, 1, 1, D.amber[1]);
      R(g, x - 3, yS - 1, 7, 3, mix(D.cream, v.shirt, 0.3)); poly(g, [[x - 2, yS + 2], [x + 3, yS + 2], [x + 2, yS + 18], [x + 0.5, yS + 21], [x - 1, yS + 18]], v.tie || D.teal[2]);
      PX.line(g, x + 7, yS + 30, x + 14, yS + 28, D.amber[0]);   // watch chain
    } else if (col === "shawl") {   // bare chest + draped shawl over the left shoulder, sacred thread
      R(g, x - tw + 4, yS + 3, 2 * tw - 7, yd - yS - 2, sk); R(g, side(-tw + 4, 5), yS + 3, 5, yd - yS, sL); R(g, side(tw - 9, 7), yS + 3, 7, yd - yS, sD);
      R(g, x - 10, yS + 14, 8, 1, sD); R(g, x + 3, yS + 14, 8, 1, sD); R(g, x, yS + 22, 1, 10, mix(sk, sD, 0.5));
      for (let k = 0; k < 40; k++) R(g, Math.round(x - 16 + k * 0.85), Math.round(yS + 2 + k * 1.05), 1, 1, mix(D.cream, sk, 0.25));   // thread
      const sc = v.shawl, [scL, , scD] = sh3(sc);
      poly(g, [[x + 6, yS - 1], [x + tw - 2, yS + 1], [x + tw, yd + 2], [x - 10, yd + 2], [x - 2, yS + 18]], sc);
      poly(g, [[x + 6, yS - 1], [x + 12, yS - 1], [x + 4, yS + 22], [x - 2, yS + 18]], scL);
      for (let k = 0; k < 4; k++) PX.line(g, x + 4 + k * 5, yS + 18 + k * 2, x - 4 + k * 8, yd + 1, scD);
      R(g, x - 8, yd - 2, 40, 2, mix(D.amber[1], sc, 0.4));   // border stripe
    } else if (col === "robe") {   // dressing gown with a crossing shawl collar over a shirt
      R(g, x - 9, yS, 18, 14, v.shirt); R(g, x - 4, yS - 1, 9, 3, mix(v.shirt, D.cream, 0.35));
      const [lc, , lcD] = sh3(v.lapel || mix(v.top, D.paperD, 0.25));
      poly(g, [[x - 16, yS], [x - 9, yS], [x + 6, yd + 2], [x - 2, yd + 2]], lc); poly(g, [[x + 16, yS], [x + 9, yS], [x - 1, yS + 22], [x + 4, yS + 26]], lcD);
      for (let k = 0; k < 6; k++) R(g, side(-22 + k * 9, 1), yS + 14, 1, yd - yS - 14, mix(tp, tD, 0.3));
    } else if (col === "plain") {   // round-necked robe with a pleated front
      R(g, x - 7, yS - 1, 14, 4, mix(v.shirt, D.n3, 0.1)); R(g, x - 6, yS - 1, 12, 1, mix(v.shirt, D.cream, 0.3));
      for (let k = 0; k < 5; k++) R(g, x - 12 + k * 6, yS + 6, 1, yd - yS - 6, mix(tp, tD, 0.35));
    }
    // neck
    if (col !== "band") { R(g, X - 4, yS - 6, 9, 7, sD); R(g, X - 4, yS - 6, 9, 2, mix(sD, D.n0, 0.3)); } else R(g, X - 4, yS - 5, 9, 5, sD);
    // head
    ell(g, X, hy, 11, 14, sk);
    A(g, 0.6, () => ell(g, X + (lit < 0 ? -5 : 5), hy - 2, 4, 7, sL));
    R(g, sideH(7, 4), hy - 8, 4, 17, sD); ell(g, X, hy + 11, 7, 2, sD);
    R(g, X - 13, hy - 1, 2, 7, lit < 0 ? sk : sD); R(g, X + 12, hy - 1, 2, 7, lit < 0 ? sD : sk); R(g, X - 13, hy + 1, 1, 3, sD); R(g, X + 13, hy + 1, 1, 3, sD);
    // hair / hats
    const hs = v.hairStyle, cr = 5 + Math.round(dn * 4);
    if (hs === "short" || hs === "visor") {
      ell(g, X, hy - 9, 11, cr, hr); R(g, X - 12, hy - 9, 3, 8, hr); R(g, X + 10, hy - 9, 3, 8, hr);
      ell(g, X + 1, hy - 9 + cr, 7, Math.max(1, cr - 4), sk);
      R(g, sideH(-8, 6), hy - 9 - cr + 1, 6, 1, hL); R(g, sideH(7, 4), hy - 9, 4, 7, hD); R(g, X + 3, hy - 9 - cr + 1, 1, cr, hD);
      R(g, X - 12, hy - 2, 1, 3, mix(hr, D.n7, 0.3)); R(g, X + 12, hy - 2, 1, 3, mix(hr, D.n7, 0.3));
      if (hs === "visor") {   // green eyeshade visor on a band
        const vc = v.hatCol || D.moss[2];
        R(g, X - 13, hy - 9, 27, 2, mix(vc, D.n1, 0.2));
        poly(g, [[X - 13, hy - 7], [X + 14, hy - 7], [X + 11, hy - 3], [X - 10, hy - 3]], mix(vc, D.teal[1], 0.2));
        A(g, 0.5, () => R(g, X - 10, hy - 3, 21, 1, mix(vc, D.cream, 0.3)));
        A(g, 0.25, () => R(g, X - 10, hy - 2, 21, 4, mix(D.moss[1], D.n0, 0.3)));   // green-tinted shade on the brow
      }
    } else if (hs === "long") {   // centre parting, waves to the shoulders
      ell(g, X, hy - 8, 12, 7, hr); R(g, X - 14, hy - 8, 5, 22, hr); R(g, X + 10, hy - 8, 5, 22, hr);
      R(g, X - 15, hy + 10, 6, 14, hr); R(g, X + 10, hy + 10, 6, 14, hr);
      R(g, X, hy - 14, 1, 6, hD); poly(g, [[X - 1, hy - 9], [X - 10, hy - 5], [X - 11, hy - 1], [X - 8, hy - 3]], hr); poly(g, [[X + 1, hy - 9], [X + 10, hy - 5], [X + 11, hy - 1], [X + 8, hy - 3]], hr);
      for (let k = 0; k < 4; k++) { R(g, sideH(-13, 2), hy - 4 + k * 7, 2, 3, hL); R(g, sideH(11, 2), hy - 2 + k * 7, 2, 3, hD); }
      R(g, sideH(-6, 5), hy - 14, 5, 1, hL);
    } else if (hs === "knot") {   // pulled back, topknot, greying
      ell(g, X, hy - 10, 11, 4, hr); R(g, X - 11, hy - 10, 2, 6, hr); R(g, X + 10, hy - 10, 2, 6, hr);
      ell(g, X, hy - 17, 5, 4, hr); R(g, X - 2, hy - 20, 3, 1, hL); R(g, X - 4, hy - 14, 9, 1, hD);
      for (let k = 0; k < 5; k++) R(g, X - 8 + k * 4, hy - 12 + (k % 2), 2, 1, hL);
      R(g, X - 12, hy - 4, 1, 4, hL); R(g, X + 12, hy - 4, 1, 4, hL);
    } else if (hs === "cap") {   // soft cloth cap / turban (Euler)
      const cc = v.hatCol || mix(D.paper, D.rust[2], 0.2), [cL, , cD] = sh3(cc);
      R(g, X - 12, hy - 4, 2, 5, hr); R(g, X + 11, hy - 4, 2, 5, hr);
      ell(g, X + 1, hy - 13, 15, 9, cc); ell(g, X - 3, hy - 16, 9, 5, cL); ell(g, X + 8, hy - 11, 6, 4, mix(cc, cD, 0.5));
      R(g, X - 6, hy - 12, 5, 1, mix(cc, cD, 0.6)); R(g, X - 7, hy - 11, 1, 2, mix(cc, cD, 0.6)); R(g, X + 3, hy - 17, 4, 1, mix(cc, cD, 0.5)); R(g, X + 7, hy - 16, 1, 2, mix(cc, cD, 0.5));
      R(g, X - 13, hy - 7, 27, 3, cD); R(g, X - 13, hy - 7, 27, 1, mix(cc, D.cream, 0.1)); R(g, X + 9, hy - 9, 4, 6, cD);
    } else if (hs === "beret") {   // flat dark cap over short hair
      R(g, X - 12, hy - 8, 3, 9, hr); R(g, X + 10, hy - 8, 3, 9, hr);
      const cc = v.hatCol || D.n1; ell(g, X + 1, hy - 12, 15, 5, cc); R(g, X - 12, hy - 9, 25, 2, mix(cc, D.n0, 0.3)); R(g, X - 8, hy - 16, 10, 1, mix(cc, D.cream, 0.15));
    } else if (hs === "coif") {   // close round scholar's cap
      R(g, X - 12, hy - 7, 3, 9, hr); R(g, X + 10, hy - 7, 3, 9, hr);
      const cc = v.hatCol || D.rust[2]; ell(g, X, hy - 12, 12, 6, cc); R(g, X - 12, hy - 10, 25, 2, mix(cc, D.n0, 0.3)); R(g, sideH(-8, 7), hy - 16, 7, 1, mix(cc, D.cream, 0.25));
    }
    // face
    const ey = hy + 1 + Math.round(dn * 3), gl = Math.round(P.glance || 0), lk = P.look || 0;
    const brow = P.brow || 0, sc = P.scoff || 0, eyes = P.eyes || "open";
    const by = (s) => ey - 5 - Math.round(brow * 2 + (s > 0 ? sc * 2 : -sc * 0.5));
    const browC = v.age > 0.5 ? mix(hD, D.n7, 0.4) : hD;
    R(g, X - 8, by(-1), 6, 1, browC); R(g, X + 3, by(1), 6, 1, browC);
    if (sc > 0.5) { R(g, X + 3, by(1) + 1, 1, 1, browC); R(g, X + 9, by(1) + 1, 1, 2, browC); R(g, X - 8, by(-1) + 1, 6, 1, browC); }
    if (brow > 0.5) { R(g, X - 9, by(-1) + 1, 1, 1, browC); R(g, X + 9, by(1) + 1, 1, 1, browC); }
    const eyeOpen = (ex, s) => { R(g, ex, ey - 1, 4, 2, mix(D.cream, sk, 0.3)); R(g, ex + 1 + clamp(gl, -1, 1) * (s > 0 ? 1 : 1), ey - 1, 2, 2, D.n0); };
    const eyeShut = (ex) => { R(g, ex, ey, 4, 1, mix(sD, D.n0, 0.4)); R(g, ex, ey + 1, 1, 1, mix(sD, D.n0, 0.2)); };
    const looksDown = (dn > 0.5 && lk < 0.5) || P.lids;
    if (eyes === "closed") { eyeShut(X - 7); eyeShut(X + 4); }
    else if (eyes === "blind") { eyeShut(X - 7); R(g, X + 4, ey, 4, 1, mix(sD, D.n0, 0.4)); R(g, X + 4, ey - 2, 1, 1, sD); R(g, X + 7, ey + 2, 1, 1, sD); PX.line(g, X + 3, ey - 3, X + 8, ey + 2, mix(sD, D.n0, 0.15)); }
    else if (looksDown) { for (const ex of [X - 7, X + 4]) { R(g, ex, ey, 4, 1, mix(sD, D.n0, 0.35)); R(g, ex + 1, ey + 1, 2, 1, D.n0); R(g, ex, ey - 1, 4, 1, mix(sk, sL, 0.5)); } }
    else { eyeOpen(X - 7, -1); eyeOpen(X + 4, 1); R(g, X + (lit < 0 ? -7 : 6), ey - 1, 1, 1, D.cream); if (sc > 0.5) { R(g, X - 7, ey - 1, 4, 1, mix(sk, sD, 0.5)); R(g, X + 4, ey - 1, 4, 1, mix(sk, sD, 0.5)); R(g, X - 7, ey - 2, 4, 1, sD); } }
    if (v.age > 0.5) { R(g, X - 10, ey + 1, 1, 2, sD); R(g, X + 10, ey + 1, 1, 2, sD); R(g, X - 6, ey + 3, 3, 1, mix(sk, sD, 0.5)); R(g, X + 4, ey + 3, 3, 1, mix(sk, sD, 0.5)); }
    R(g, sideH(1, 1), ey + 2, 1, 4, sD); R(g, X - 1, ey + 6, 3, 1, sD);   // nose
    // mouth
    const my = ey + 9, sm = P.smile || 0;
    if (P.talk) { R(g, X - 2, my - 1, 5, 3, mix(D.rust[2], D.n0, 0.5)); R(g, X - 2, my - 1, 5, 1, sD); }
    else if (P.oh > 0.5) { R(g, X - 1, my - 1, 3, 3, mix(D.rust[2], D.n0, 0.5)); }
    else if (sc > 0.5) { R(g, X - 3, my + 1, 5, 1, sD); R(g, X + 2, my, 2, 1, sD); R(g, X + 4, my - 1, 1, 1, sD); R(g, X - 2, my + 2, 3, 1, mix(sk, sD, 0.4)); }
    else if (P.meh > 0.5) { R(g, X - 3, my, 7, 1, sD); R(g, X - 4, my + 1, 1, 1, sD); R(g, X + 4, my + 1, 1, 1, sD); R(g, X - 1, my + 1, 3, 1, mix(sk, sD, 0.4)); }
    else if (sm > 0.5) { R(g, X - 3, my + 1, 7, 1, sD); R(g, X - 4, my, 1, 1, sD); R(g, X + 4, my, 1, 1, sD); if (sm > 0.8) R(g, X - 2, my + 2, 5, 1, mix(D.rose[1], sk, 0.4)); }
    else R(g, X - 2, my, 5, 1, sD);
    // beards
    const bc = v.beardCol || hr, [bL, , bD] = sh3(bc);
    if (v.beard === "full") {
      poly(g, [[X - 11, ey + 2], [X - 9, ey + 12], [X - 4, ey + 17], [X + 4, ey + 17], [X + 9, ey + 12], [X + 11, ey + 2], [X + 8, ey + 8], [X + 4, ey + 7], [X - 4, ey + 7], [X - 8, ey + 8]], bc);
      R(g, X - 4, my - 2, 9, 2, bc); R(g, X - 3, my, 7, 1 + (P.talk ? 1 : 0), mix(D.rust[2], D.n0, P.talk ? 0.5 : 0.25));
      for (let k = 0; k < 4; k++) R(g, X - 6 + k * 4, ey + 11 + (k % 2), 1, 3, bL); R(g, X - 2, ey + 16, 5, 1, bD);
    } else if (v.beard === "tash") { R(g, X - 5, my - 2, 11, 2, bc); R(g, X - 6, my - 1, 2, 1, bc); R(g, X + 5, my - 1, 2, 1, bc); R(g, X - 3, my - 2, 3, 1, bL); }
    else if (v.beard === "cavalier") { R(g, X - 5, my - 2, 4, 1, bc); R(g, X + 2, my - 2, 4, 1, bc); R(g, X - 6, my - 3, 1, 1, bc); R(g, X + 6, my - 3, 1, 1, bc); R(g, X - 1, my + 2, 3, 3, bc); R(g, X, my + 5, 1, 1, bc); }
  };
  // tool held in a hand: tip (tx,ty), direction to the hand
  const tool = (g, kind, tx, ty, hx0, hy0, t) => {
    if (kind === "quill") {
      const dx = hx0 - tx, dy = hy0 - ty, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      const ex = tx + ux * 22, ey = ty + uy * 22;
      PX.line(g, tx, ty, ex, ey, mix(D.paperD, D.n4, 0.2));
      for (let k = 8; k < 22; k++) { const px = tx + ux * k, py = ty + uy * k, w = Math.round(Math.sin(((k - 8) / 14) * Math.PI) * 3); R(g, px - uy * 1, py + ux * 1 - w, 1, w, D.cream); R(g, px + 1, py, 1, Math.max(1, w - 1), mix(D.cream, D.paperD, 0.5)); }
      R(g, tx, ty, 1, 1, D.n0);
    } else if (kind === "stylus") { PX.line(g, tx, ty, tx + (hx0 - tx) * 1.6, ty + (hy0 - ty) * 1.6, mix(D.n5, D.rust[2], 0.2)); R(g, tx, ty, 1, 1, D.n6); }
    else if (kind === "chalk") { PX.line(g, tx, ty, tx + (hx0 - tx) * 0.6, ty + (hy0 - ty) * 0.6, D.cream); }
  };
  const hand = (g, hx0, hy0, sk, palm) => {
    const sL = mix(sk, D.cream, 0.25), sD = mix(sk, D.n0, 0.3); hx0 = Math.round(hx0); hy0 = Math.round(hy0);
    if (palm) { ell(g, hx0, hy0, 4, 2, sk); R(g, hx0 - 4, hy0 - 3, 2, 2, sk); R(g, hx0 + 3, hy0 - 3, 2, 2, sk); R(g, hx0 - 1, hy0 - 3, 3, 1, sL); R(g, hx0 - 3, hy0 + 2, 7, 1, sD); }
    else { ell(g, hx0, hy0, 4, 3, sk); R(g, hx0 - 3, hy0 - 3, 4, 1, sL); R(g, hx0 - 4, hy0 + 2, 8, 1, sD); R(g, hx0 + 1, hy0 - 1, 1, 2, sD); }
  };
  const frontArms = (g, x, yd, t, P, v, lit) => {
    lit = lit === undefined ? -1 : lit;
    const { yS } = frontGeo(x, yd, t, P), [tL, tp, tD] = sh3(v.armCol || v.top), sk = v.skin;
    for (const s of [-1, 1]) {
      const sx = x + s * 24, sy = yS + 8, tgt = s > 0 ? P.hR : P.hL;
      if (!tgt) continue;
      const [ex, ey, hx1, hy1] = ik(sx, sy, tgt[0], tgt[1], 23, 23, -s);
      const shade = s === lit ? tL : tD;
      seg(g, sx - s * 1, sy + 1, ex - s * 1, ey + 1, 13, mix(tp, D.n0, 0.4)); seg(g, sx, sy, ex, ey, 11, tp); seg(g, sx + s * 4, sy, ex + s * 4, ey, 4, shade);
      seg(g, ex, ey + 1, hx1, hy1 + 1, 10, mix(tp, D.n0, 0.4)); seg(g, ex, ey, hx1, hy1, 9, tp); seg(g, ex, ey + 3, hx1, hy1 + 3, 3, tD); seg(g, ex, ey - 3, hx1, hy1 - 3, 1, s === lit ? tL : tp);
      const cuff = v.cuff || mix(v.shirt, D.n3, 0.15), ux = hx1 - ex, uy = hy1 - ey, L = Math.hypot(ux, uy) || 1;
      seg(g, hx1 - (ux / L) * 3, hy1 - (uy / L) * 3, hx1 - (ux / L) * 0.5, hy1 - (uy / L) * 0.5, 9, cuff);
      const palm = s > 0 ? P.palmR : P.palmL, tk = s > 0 ? P.toolR : null;
      if (tk && !palm && P.pen) tool(g, tk, P.pen[0], P.pen[1], hx1 + 2, hy1 - 4, t);
      hand(g, hx1, hy1, sk, palm);
      if (tk && palm) tool(g, tk, hx1 + 2, hy1 - 2, hx1 + 8, hy1 - 12, t);
    }
  };
  // hand target for writing with the pen tip at (px, py): the hand sits above-right of the tip
  const penHand = (px, py) => [px + 4, py - 3];
  // writing wobble: pen tip x offset along a line and small vertical jitter, for prog k (0..1 writing intensity)
  const penWobble = (t, k, w) => [(Math.sin(t * 7.3) * 1.2 + (frac(t * 0.35) * w - w / 2)) * k, Math.abs(Math.sin(t * 11)) * k];

  // ======================= handwriting glyphs (stroke polylines in a 6 x 10 box) =======================
  const GLY = {
    I: [[[1, 0], [5, 0]], [[3, 0], [3, 10]], [[1, 10], [5, 10]]],
    M: [[[0, 10], [0.8, 0], [3, 6.5], [5.2, 0], [6, 10]]],
    A: [[[0, 10], [3, 0], [6, 10]], [[1.3, 6], [4.8, 6]]],
    G: [[[6, 2], [4.6, 0.2], [2.2, 0], [0.6, 2], [0, 5], [0.6, 8.2], [2.4, 10], [4.6, 10], [6, 8.4], [6, 6], [3.6, 6]]],
    N: [[[0, 10], [0, 0], [6, 10], [6, 0]]],
    R: [[[0, 10], [0, 0], [4, 0], [5.8, 1.4], [5.8, 3.6], [4, 5], [0, 5]], [[2.8, 5], [6, 10]]],
    E: [[[6, 0], [0, 0], [0, 10], [6, 10]], [[0, 5], [4.4, 5]]],
  };
  // strokes for a word at (x, y) with scale s; slant shifts the top right
  const wordStrokes = (str, x, y, s, gap, slant) => {
    const out = []; let cx = x;
    for (const ch of str) { for (const st of GLY[ch] || []) out.push(st.map(([u, v]) => [cx + (u + (10 - v) * slant) * s, y + v * s])); cx += (ch === "I" ? 6 : 6) * s + gap; }
    return out;
  };
  // draw strokes up to progress p (0..1 of total pen path incl. lifts); returns pen tip [x, y, down]
  const drawWord = (g, strokes, p, col, th) => {
    const lens = strokes.map((st) => { let L = 0; for (let i = 1; i < st.length; i++) L += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); return L; });
    const lifts = strokes.map((st, i) => (i ? Math.hypot(st[0][0] - strokes[i - 1][strokes[i - 1].length - 1][0], st[0][1] - strokes[i - 1][strokes[i - 1].length - 1][1]) * 0.6 : 0));
    const total = lens.reduce((a, b) => a + b, 0) + lifts.reduce((a, b) => a + b, 0);
    let rem = clamp(p, 0, 1) * total, tip = strokes[0] ? [strokes[0][0][0], strokes[0][0][1], 0] : [0, 0, 0];
    const ln = (a, b) => { PX.line(g, a[0], a[1], b[0], b[1], col); if (th > 1) PX.line(g, a[0] + 1, a[1], b[0] + 1, b[1], col); };
    for (let i = 0; i < strokes.length; i++) {
      const st = strokes[i];
      if (lifts[i] > 0) { const prev = strokes[i - 1][strokes[i - 1].length - 1]; if (rem < lifts[i]) { const k = rem / lifts[i]; return [lerp(prev[0], st[0][0], k), lerp(prev[1], st[0][1], k) - Math.sin(k * Math.PI) * 3, 0]; } rem -= lifts[i]; }
      for (let j = 1; j < st.length; j++) {
        const a = st[j - 1], b = st[j], L = Math.hypot(b[0] - a[0], b[1] - a[1]);
        if (rem <= L) { const k = L ? rem / L : 1, e = [lerp(a[0], b[0], k), lerp(a[1], b[1], k)]; ln(a, e); return [e[0], e[1], 1]; }
        ln(a, b); rem -= L; tip = [b[0], b[1], 1];
      }
    }
    return [tip[0], tip[1], 0];
  };

  // ======================= props =======================
  // candle on a brass holder: base centre (x, y), wax height h; returns flame centre [fx, fy]
  const candle = (g, x, y, h, t, seed, lit) => {
    const br = [mix(D.amber[0], D.lamp, 0.3), mix(D.amber[2], D.lampD, 0.4), mix(D.amber[2], D.n1, 0.45)];
    shadow(g, 0.4, () => ell(g, x + 2, y + 1, 10, 2, BLK));
    ell(g, x, y - 1, 9, 2, br[2]); ell(g, x, y - 2, 8, 2, br[1]); R(g, x - 6, y - 3, 5, 1, br[0]);
    R(g, x - 2, y - 7, 5, 5, br[1]); R(g, x - 2, y - 7, 1, 5, br[0]); R(g, x - 4, y - 8, 9, 2, br[1]); R(g, x - 4, y - 8, 9, 1, br[0]);
    R(g, x + 7, y - 5, 3, 3, br[2]); R(g, x + 8, y - 4, 1, 1, br[1]);   // finger loop
    const wx = mix(D.cream, D.paper, 0.2), wD = mix(D.paperD, D.n3, 0.2);
    R(g, x - 2, y - 8 - h, 5, h, wx); R(g, x + 2, y - 8 - h, 1, h, wD); R(g, x - 2, y - 8 - h, 1, h, mix(wx, D.lamp, 0.4));
    R(g, x - 3, y - 9 - h + 3, 1, 4, wx); R(g, x + 3, y - 8 - h + 5, 1, 5, wx); R(g, x - 2, y - 10, 1, 2, wx);   // drips
    const fy = y - 10 - h, f = flick(t, seed || 0), sw = Math.round(Math.sin(t * 5.3 + (seed || 0)) * 0.7);
    R(g, x, fy + 1, 1, 2, D.n1);   // wick
    if (lit !== false) {
      const fh = Math.round(6 * f);
      ell(g, x + sw * 0.5, fy - 1, 2, 3, mix(D.amber[1], D.lamp, 0.3)); R(g, x + sw, fy - fh, 1, fh, D.lamp); R(g, x, fy - 2, 1, 2, D.cream);
      R(g, x - 1 + sw, fy - fh + 2, 3, fh - 2, D.lamp); R(g, x, fy - 1, 1, 2, mix(D.steel[0], D.cream, 0.5));
    }
    return [x, fy - 2];
  };
  // smoke wisp rising from (x, y)
  const smoke = (g, x, y, t, a) => { for (let k = 0; k < 10; k++) { const ph = frac(t * 0.25 + k / 10); A(g, (a || 0.18) * Math.sin(ph * Math.PI), () => R(g, x + Math.round(Math.sin(ph * 7 + k) * (1 + ph * 4)), y - ph * 40, 1, 2, D.n6)); } };
  // books on a shelf between x0..x1 standing on y
  const books = (g, x0, x1, y, seed, dim, hmax) => {
    const r = PX.rnd(seed); let xx = x0;
    while (xx < x1 - 4) {
      const w = 3 + Math.floor(r() * 4), h = (hmax || 22) - Math.floor(r() * 8), base = [D.rust[2], D.moss[2], D.steel[2], D.paperD, D.n4, D.amber[2], D.teal[2]][Math.floor(r() * 7)], bc = mix(base, D.n1, dim);
      if (r() < 0.1 && xx + w + 8 < x1) { poly(g, [[xx, y], [xx + w, y], [xx + w + 6, y - h + 2], [xx + 6 - 1, y - h + 2]], bc); xx += w + 8; continue; }
      R(g, xx, y - h, w, h, bc); R(g, xx, y - h, 1, h, mix(bc, D.lamp, 0.15)); if (r() < 0.5) { R(g, xx, y - h + 3, w, 1, mix(bc, D.amber[1], 0.3)); R(g, xx, y - 4, w, 1, mix(bc, D.amber[1], 0.25)); }
      xx += w;
    }
  };
  const paperStack = (g, x, y, hgt, w, seed, dim) => {
    hgt = Math.round(hgt); if (hgt <= 0) return;
    shadow(g, 0.4, () => R(g, x - w / 2 + 2, y - 1, w, 3, BLK));
    for (let k = 0; k < hgt; k++) { const sx = Math.round((hash(seed, k) - 0.5) * 3); R(g, x - w / 2 + sx, y - k - 1, w, 1, mix(k % 3 === 0 ? D.paperD : D.paper, D.n2, dim || 0.2)); }
    R(g, x - w / 2, y - hgt - 1, w, 1, mix(D.cream, D.n2, dim || 0.2));
  };
  // a sheet lying on a desk (trapezoid) with handwriting, prog = writing progress
  const sheet = (g, x, y, w, h, seed, prog, dim) => {
    const pc = mix(D.paper, D.n2, dim || 0);
    poly(g, [[x + 2, y], [x + w - 2, y], [x + w, y + h], [x, y + h]], pc); R(g, x, y + h, w, 1, mix(pc, D.n0, 0.3));
    const lines = Math.floor((h - 2) / 2);
    for (let l = 0; l < lines; l++) { const lp = clamp(prog * lines - l, 0, 1); if (lp > 0) scribble(g, x + 4, y + 2 + l * 2, (w - 8) * (0.7 + 0.3 * hash(seed, l)), seed * 7 + l, mix(D.ink, pc, 0.35), lp, 1); }
  };
  const inkPot = (g, x, y, quill) => {
    const gc = mix(D.n1, D.teal[2], 0.3);
    shadow(g, 0.4, () => R(g, x - 4, y, 12, 2, BLK));
    R(g, x - 4, y - 7, 9, 7, gc); R(g, x - 4, y - 7, 9, 1, mix(gc, D.cream, 0.3)); R(g, x - 3, y - 6, 1, 5, mix(gc, D.lamp, 0.35)); R(g, x - 2, y - 9, 5, 2, mix(gc, D.n0, 0.3));
    if (quill) { PX.line(g, x, y - 9, x + 9, y - 30, mix(D.paperD, D.n4, 0.2)); for (let k = 0; k < 14; k++) { const px = x + 3 + k * 0.45 * 1.3, py = y - 15 - k * 1.1; R(g, px - 2, py, 2, 1, D.cream); R(g, px + 1, py, 1, 1, mix(D.cream, D.paperD, 0.5)); } }
  };

  // big writing hand for close-ups: tool tip at (px, py), tool shaft up and to the right, fist below it, forearm from the
  // lower right. o = { sk, sleeve: colour | null (bare arm), cuff: lace | bangle, tool: quill | stylus }
  const bigHand = (g, px, py, o) => {
    const ux = 0.62, uy = -0.78, nx = 0.93, ny = -0.37, nnx = 0.78, nny = 0.62;
    const H = [px + ux * 30 + nnx * 38, py + uy * 30 + nny * 38];
    const sk = o.sk, skL = mix(sk, D.cream, 0.3), skD = mix(sk, D.n0, 0.3), sl = o.sleeve || sk, [sL, , sD] = o.sleeve ? sh3(sl) : [skL, sk, skD];
    const fa = [H[0] + 2, H[1] + 4], fb = [H[0] + 100, H[1] + 280], aw = o.sleeve ? 1 : 0.72;
    shadow(g, 0.22, () => { seg(g, fa[0] + 10, fa[1] + 10, fb[0] + 10, fb[1], 40 * aw, BLK); PX.line(g, px + 7, py + 8, px + 7 + ux * 110, py + 8 + uy * 110, BLK); });
    if (o.tool === "quill") {
      const qe = 130;
      PX.line(g, px, py, px + ux * qe, py + uy * qe, mix(D.paperD, D.n4, 0.35)); PX.line(g, px + 1, py, px + 1 + ux * qe, py + uy * qe, mix(D.cream, D.paperD, 0.25));
      for (let k = 34; k < qe; k++) {
        const u = (k - 34) / (qe - 34), w = Math.round(Math.sin(Math.min(1, u * 1.25) * Math.PI * 0.5 + u * 0.4) * 9 * (1 - u * 0.35)), bx = px + ux * k, by = py + uy * k;
        for (let j = 1; j <= w; j++) R(g, bx - j * 0.93, by - j * 0.42, 1, 1, j === w ? mix(D.paperD, D.n4, 0.35) : (k + j) % 7 === 0 ? mix(D.cream, D.paperD, 0.5) : D.cream);
        for (let j = 1; j <= Math.round(w * 0.5); j++) R(g, bx + j * 0.78, by + j * 0.62, 1, 1, j === Math.round(w * 0.5) ? mix(D.paperD, D.n4, 0.3) : mix(D.cream, D.paperD, 0.3));
      }
      R(g, px - 1, py - 1, 2, 2, D.ink);
    } else {   // iron stylus with a brass knob
      const se = 110, sc = mix(D.n3, D.rust[2], 0.25);
      seg(g, px, py, px + ux * se, py + uy * se, 3, sc); PX.line(g, px, py, px + ux * se, py + uy * se, mix(D.n6, D.lampD, 0.3)); R(g, px, py, 1, 1, D.n0);
      ell(g, px + ux * (se + 3), py + uy * (se + 3), 4, 4, mix(D.amber[2], D.lampD, 0.3)); R(g, px + ux * (se + 3) - 2, py + uy * (se + 3) - 3, 2, 1, mix(D.lampD, D.cream, 0.3));
    }
    // forearm (sleeve tapers, folds) and cuff
    const w0 = 15 * aw, w1 = 24 * aw;
    poly(g, [[fa[0] - w0 * nx, fa[1] - w0 * ny], [fa[0] + w0 * nx, fa[1] + w0 * ny], [fb[0] + w1 * nx, fb[1] + w1 * ny], [fb[0] - w1 * nx, fb[1] - w1 * ny]], sl);
    poly(g, [[fa[0] - w0 * nx, fa[1] - w0 * ny], [fa[0] - (w0 - 5) * nx, fa[1] - (w0 - 5) * ny], [fb[0] - (w1 - 7) * nx, fb[1] - (w1 - 7) * ny], [fb[0] - w1 * nx, fb[1] - w1 * ny]], sL);
    poly(g, [[fa[0] + (w0 - 6) * nx, fa[1] + (w0 - 6) * ny], [fa[0] + w0 * nx, fa[1] + w0 * ny], [fb[0] + w1 * nx, fb[1] + w1 * ny], [fb[0] + (w1 - 10) * nx, fb[1] + (w1 - 10) * ny]], sD);
    if (o.sleeve) for (let k = 1; k < 6; k++) { const u = k / 6 + 0.04 * Math.sin(k * 3), cx1 = lerp(fa[0], fb[0], u), cy1 = lerp(fa[1], fb[1], u), wv = lerp(15, 24, u); PX.line(g, cx1 - wv * 0.6 * nx, cy1 - wv * 0.6 * ny + 2, cx1 + wv * 0.3 * nx, cy1 + wv * 0.3 * ny - 3, mix(sl, D.n0, 0.3)); }
    if (o.cuff === "lace") for (let k = -19; k <= 19; k++) { const xx = fa[0] - 2 + k * nx, yy = fa[1] - 4 + k * ny, wv = 6 + (Math.abs(k) % 3); R(g, xx, yy - wv + 4, 1, wv, k % 3 === 0 ? mix(D.cream, D.paperD, 0.4) : D.cream); R(g, xx, yy - wv + 3, 1, 1, k % 2 ? D.cream : mix(D.cream, D.paperD, 0.5)); }
    if (o.cuff === "bangle") { const b0 = [fa[0] + 12, fa[1] + 30], bc = [mix(D.lampD, D.cream, 0.2), mix(D.amber[2], D.lampD, 0.35), mix(D.amber[2], D.n1, 0.45)]; for (let k = -12; k <= 12; k++) { const xx = b0[0] + k * nx, yy = b0[1] + k * ny; R(g, xx, yy - 2, 1, 5, k < -6 ? bc[0] : k > 6 ? bc[2] : bc[1]); } }
    // the hand, built in (u along the tool, n across it toward the hand) coordinates from the tip
    const Q = (u, n) => [px + ux * u + nnx * n, py + uy * u + nny * n];
    const hand = [Q(3, 1), Q(12, -3), Q(24, -6), Q(34, 0), Q(40, 12), Q(42, 28), Q(38, 42), Q(20, 44), Q(10, 32), Q(6, 16)];
    shadow(g, 0.25, () => poly(g, hand.map(([x, y]) => [x + 7, y + 9]), BLK));
    poly(g, hand, sk);
    poly(g, [Q(12, -3), Q(24, -6), Q(34, 0), Q(30, 4), Q(16, 2)], skL);                        // lit ridge of the index finger
    for (const [u0, n0] of [[9, 12], [11, 21], [14, 30]]) { const [cx2, cy2] = Q(u0, n0); ell(g, cx2, cy2, 4, 3, mix(sk, skD, 0.35)); R(g, cx2 - 3, cy2 - 3, 3, 1, skL); }   // curled fingers
    { const k1 = Q(22, 8), k2 = Q(26, 18), k3 = Q(29, 28); for (const [kx, ky] of [k1, k2, k3]) { R(g, kx - 1, ky - 1, 3, 2, skL); R(g, kx, ky + 1, 2, 1, skD); } }   // knuckles
    seg(g, ...Q(32, -4), ...Q(15, -5), 5, mix(sk, D.cream, 0.12)); { const [tx2, ty2] = Q(14, -5); R(g, tx2 - 2, ty2 - 2, 3, 2, skL); }   // thumb over the shaft
    { const [nx2, ny2] = Q(5, 1); R(g, nx2 - 1, ny2 - 1, 3, 2, mix(sk, D.cream, 0.4)); }   // fingernail
    PX.line(g, ...Q(38, 42), ...Q(20, 44), skD); PX.line(g, ...Q(20, 44), ...Q(10, 32), skD);
  };

  // ======================= descartes =======================
  // 1637 France: a man with long hair and a moustache writes by candlelight in a quiet room (o.write 0.3); at o.word (3.0)
  // a close-up of the page shows him write "IMAGINAIRE" in ink (o.insert:false keeps the wide shot); back in the wide shot
  // he gives a dismissive little shrug (o.shrug, default word + 2.2) and goes back to writing.
  const DESC = { skin: SKIN.fair, hair: HAIR.dark, hairStyle: "long", beard: "cavalier", top: mix(D.n2, D.steel[2], 0.25), shirt: D.cream, collar: "band", cuff: D.cream };
  const descRoom = (g, t, c, S) => {
    const fl = flick(t, 1), wall = mix(mix(D.n2, D.rust[2], 0.18), D.paperD, 0.08), wallD = mix(wall, D.n0, 0.3), wd = woodCols(0.55), beam = woodCols(0.62);
    R(g, 0, 0, 640, 360, D.n1);
    PX.par(g, c, 0.4, () => {
      R(g, -40, -40, 720, 380, wall);
      for (let i = 0; i < 220; i++) { const px = hash(i, 1) * 720 - 40, py = hash(i, 2) * 300 - 20; R(g, px, py, 1 + (i % 3 === 0 ? 1 : 0), 1, i % 2 ? wallD : mix(wall, D.paperD, 0.12)); }
      // timber frame: posts, brace and a ceiling beam
      for (const bx of [24, 446]) { R(g, bx, -40, 14, 360, beam[1]); R(g, bx, -40, 2, 360, beam[0]); R(g, bx + 11, -40, 3, 360, beam[2]); }
      R(g, -40, 26, 720, 13, beam[1]); R(g, -40, 26, 720, 2, beam[0]); R(g, -40, 37, 720, 3, beam[2]);
      for (let k = -2; k < 14; k++) R(g, k * 52 + 8, 40, 10, 5, beam[2]);   // joist ends
      // casement window with leaded diamond panes (night, a moon, the roofs of the town)
      const wx = 92, wy = 70, ww = 96, wh = 116;
      R(g, wx - 8, wy - 8, ww + 16, wh + 20, wallD); R(g, wx - 6, wy + wh + 2, ww + 12, 6, wd[1]); R(g, wx - 6, wy + wh + 2, ww + 12, 1, wd[0]);
      clipR(g, wx, wy, ww, wh, () => {
        PX.vgrad(g, wx, wy, ww, wh, mix(D.n0, D.steel[2], 0.35), mix(D.steel[2], D.n2, 0.4), 7);
        const r = PX.rnd(9); for (let i = 0; i < 26; i++) { const sx = wx + r() * ww, sy = wy + r() * wh * 0.6; A(g, 0.4 + 0.5 * Math.abs(Math.sin(t * (0.6 + r()) + i)), () => R(g, sx, sy, 1, 1, D.cream)); }
        PX.circle(g, wx + 66, wy + 26, 7, mix(D.cream, D.steel[0], 0.25)); PX.circle(g, wx + 69, wy + 24, 6, mix(D.steel[2], D.n1, 0.3));
        PX.glow(g, wx + 64, wy + 28, 26, D.steel[0], 0.12);
        const rf = mix(D.n0, D.steel[2], 0.2);
        // the town: gabled houses, chimneys, a church spire
        poly(g, [[wx + 60, wy + 90], [wx + 64, wy + 52], [wx + 66, wy + 40], [wx + 68, wy + 52], [wx + 72, wy + 90]], rf); R(g, wx + 61, wy + 66, 10, 30, rf);
        for (const [hx0, hw, hh] of [[-4, 22, 92], [16, 18, 86], [32, 24, 96], [54, 20, 100], [72, 26, 90]]) { R(g, wx + hx0, wy + hh, hw, wh, rf); poly(g, [[wx + hx0 - 1, wy + hh], [wx + hx0 + hw / 2, wy + hh - hw * 0.6], [wx + hx0 + hw + 1, wy + hh]], rf); R(g, wx + hx0 + hw - 6, wy + hh - hw * 0.5, 3, 6, rf); }
        R(g, wx + 40, wy + 104, 3, 3, mix(D.lampD, D.n2, 0.25 + 0.1 * Math.sin(t * 0.7))); R(g, wx + 8, wy + 106, 2, 3, mix(D.lampD, D.n2, 0.45)); R(g, wx + 80, wy + 100, 2, 2, mix(D.lampD, D.n2, 0.5));
      });
      const lead = mix(D.n1, D.n3, 0.4);
      clipR(g, wx, wy, ww, wh, () => { for (let k = -12; k < 14; k++) { PX.line(g, wx + k * 12, wy, wx + k * 12 + wh * 0.6, wy + wh, lead); PX.line(g, wx + k * 12, wy, wx + k * 12 - wh * 0.6, wy + wh, lead); } });
      R(g, wx + ww / 2 - 2, wy, 4, wh, wd[2]); R(g, wx, wy + 56, ww, 3, wd[2]);
      R(g, wx - 3, wy - 3, ww + 6, 3, wd[2]); R(g, wx - 3, wy + wh, ww + 6, 3, wd[2]); R(g, wx - 3, wy, 3, wh, wd[2]); R(g, wx + ww, wy, 3, wh, wd[2]);
      A(g, 0.3 * fl, () => R(g, wx + ww - 18, wy + 70, 2, 2, D.lamp));   // candle reflected in the glass
      // heavy curtain, gathered to the left
      const cu = mix(D.rust[2], D.n1, 0.35), [cuL, , cuD] = sh3(cu);
      poly(g, [[wx - 18, wy - 14], [wx + 14, wy - 14], [wx + 4, wy + 60], [wx + 10, wy + wh + 30], [wx - 18, wy + wh + 30]], cu);
      for (let k = 0; k < 4; k++) PX.line(g, wx - 14 + k * 7, wy - 12, wx - 14 + k * 6 + (k === 3 ? 8 : 0), wy + wh + 28, k % 2 ? cuD : cuL);
      R(g, wx - 20, wy - 16, ww + 40, 3, mix(D.amber[2], D.n2, 0.3));
      // a small framed engraving near the candle
      const fx0 = 226, fy0 = 92; shadow(g, 0.35, () => R(g, fx0 + 3, fy0 + 3, 52, 40, BLK));
      R(g, fx0, fy0, 52, 40, wd[2]); R(g, fx0, fy0, 52, 1, wd[0]); R(g, fx0 + 4, fy0 + 4, 44, 32, mix(D.paperD, D.n3, 0.35));
      poly(g, [[fx0 + 4, fy0 + 30], [fx0 + 18, fy0 + 18], [fx0 + 28, fy0 + 24], [fx0 + 38, fy0 + 14], [fx0 + 48, fy0 + 22], [fx0 + 48, fy0 + 36], [fx0 + 4, fy0 + 36]], mix(D.ink, D.paperD, 0.55));
      for (let k = 0; k < 5; k++) PX.line(g, fx0 + 6, fy0 + 8 + k * 3, fx0 + 46, fy0 + 8 + k * 3, mix(D.paperD, D.n3, 0.45));
      // wide-brimmed hat and cloak on a peg
      const pgx = 418, pgy = 92, cl = mix(D.n2, D.moss[2], 0.25), [clL, , clD] = sh3(cl);
      R(g, pgx - 1, pgy - 1, 4, 3, wd[1]);
      poly(g, [[pgx - 6, pgy + 2], [pgx + 8, pgy + 2], [pgx + 16, pgy + 90], [pgx - 14, pgy + 92]], cl);
      for (let k = 0; k < 4; k++) PX.line(g, pgx - 4 + k * 4, pgy + 6, pgx - 12 + k * 8, pgy + 90, k % 2 ? clD : clL);
      shadow(g, 0.3, () => poly(g, [[pgx + 8, pgy + 2], [pgx + 12, pgy + 2], [pgx + 20, pgy + 92], [pgx + 16, pgy + 90]], BLK));
      ell(g, pgx + 1, pgy, 12, 2, mix(D.n1, D.n3, 0.3)); ell(g, pgx + 1, pgy - 6, 6, 7, mix(D.n1, D.n3, 0.35)); R(g, pgx - 5, pgy - 13, 12, 3, mix(D.n1, D.n3, 0.35)); R(g, pgx - 6, pgy - 2, 14, 2, mix(D.amber[2], D.n2, 0.4)); R(g, pgx - 12, pgy - 1, 8, 1, mix(D.n3, D.lampD, 0.25));
      // shelf with books, hourglass and a globe on the right wall
      R(g, 490, 120, 120, 4, wd[1]); R(g, 490, 120, 120, 1, wd[0]); books(g, 494, 560, 120, 31, 0.45, 20);
      R(g, 490, 178, 120, 4, wd[1]); R(g, 490, 178, 120, 1, wd[0]); books(g, 500, 600, 178, 32, 0.5, 22);
      const gx = 584, gy = 106; PX.circle(g, gx, gy, 11, mix(D.paperD, D.n3, 0.35)); ell(g, gx - 3, gy - 2, 6, 7, mix(D.moss[2], D.paperD, 0.3)); ell(g, gx + 5, gy + 4, 3, 4, mix(D.moss[2], D.paperD, 0.35));
      PX.line(g, gx - 12, gy - 1, gx + 12, gy - 1, mix(D.amber[2], D.n2, 0.2)); R(g, gx - 1, gy + 11, 3, 5, wd[2]); R(g, gx - 6, gy + 15, 13, 3, wd[1]);
    });
    // floor
    PX.vgrad(g, -40, 296, 720, 70, mix(wd[2], D.n1, 0.25), mix(wd[1], D.n1, 0.5), 4);
    for (let k = 0; k < 7; k++) PX.line(g, 320 + (k - 3) * 64, 296, 320 + (k - 3) * 170, 360, mix(wd[2], D.n0, 0.3));
    R(g, -40, 296, 720, 1, mix(wd[0], D.n2, 0.5));
    // worn rug under the table
    const rg = mix(D.rust[2], D.n2, 0.45); poly(g, [[150, 300], [500, 300], [560, 340], [100, 340]], rg); poly(g, [[160, 303], [490, 303], [544, 337], [114, 337]], mix(D.rust[2], D.n2, 0.32));
    for (let k = 0; k < 9; k++) R(g, 190 + k * 34, 318 + (k % 2) * 3, 12, 2, mix(D.amber[2], D.n2, 0.45)); for (let k = 0; k < 28; k++) R(g, 104 + k * 16, 341, 2, 2, mix(D.paperD, D.n3, 0.5));
    // a wooden chest under the window with a rolled map and books
    PX.par(g, c, 0.85, () => {
      const cx0 = 66, cy0 = 300, cc = woodCols(0.55, 0.3);
      shadow(g, 0.45, () => R(g, cx0 - 4, cy0, 112, 4, BLK));
      R(g, cx0, cy0 - 40, 104, 40, cc[1]); R(g, cx0, cy0 - 40, 104, 1, cc[0]); R(g, cx0 + 96, cy0 - 40, 8, 40, cc[2]);
      R(g, cx0 - 2, cy0 - 46, 108, 7, cc[1]); R(g, cx0 - 2, cy0 - 46, 108, 1, cc[0]); R(g, cx0 - 2, cy0 - 40, 108, 1, cc[2]);
      for (const bx of [cx0 + 16, cx0 + 80]) R(g, bx, cy0 - 46, 3, 46, mix(D.n2, D.amber[2], 0.3)); R(g, cx0 + 48, cy0 - 34, 8, 8, mix(D.n2, D.amber[2], 0.35));
      R(g, cx0 + 8, cy0 - 52, 30, 6, mix(D.steel[2], D.n2, 0.3)); R(g, cx0 + 10, cy0 - 57, 26, 5, mix(D.rust[2], D.n2, 0.25)); R(g, cx0 + 10, cy0 - 57, 26, 1, mix(D.rust[1], D.n3, 0.4));
      seg(g, cx0 + 50, cy0 - 50, cx0 + 92, cy0 - 54, 6, mix(D.paper, D.n3, 0.4)); ell(g, cx0 + 92, cy0 - 54, 3, 3, mix(D.paperD, D.n3, 0.35)); R(g, cx0 + 66, cy0 - 54, 2, 7, mix(D.rust[2], D.n2, 0.2));
    });
  };
  const descDesk = (g, t, S) => {
    const v = DESC, X = 352, YD = 228, YF = 258, wd = woodCols(0.48), fl = flick(t, 1);
    const pose = S.pose;
    // high-backed chair behind him
    const ch = woodCols(0.65);
    R(g, X - 34, YD - 92, 68, 60, ch[2]); R(g, X - 34, YD - 92, 68, 2, ch[1]); R(g, X - 38, YD - 98, 6, 70, ch[1]); R(g, X + 32, YD - 98, 6, 70, ch[1]);
    ell(g, X - 35, YD - 100, 4, 3, ch[0]); ell(g, X + 35, YD - 100, 4, 3, ch[1]);
    frontBody(g, X, YD, t, pose, v, -1);
    // his legs and the chair legs under the table
    const br2 = mix(D.n1, D.steel[2], 0.25), stk = mix(D.paperD, D.n4, 0.45);
    R(g, X - 30, YF + 6, 4, 296 - YF - 6, ch[2]); R(g, X + 26, YF + 6, 4, 296 - YF - 6, ch[2]);
    for (const s of [-1, 1]) { const lx = X + s * 10 - 4; R(g, lx, YF + 10, 9, 14, br2); R(g, lx + 1, YF + 22, 7, 288 - YF - 22, stk); R(g, lx + 1, YF + 22, 2, 288 - YF - 22, mix(stk, D.lampD, 0.2)); ell(g, lx + 4 + s * 2, 292, 6, 3, D.n0); R(g, lx + 2 + s * 2, 290, 4, 1, mix(D.amber[2], D.n2, 0.3)); }
    // table
    poly(g, [[184, YD], [470, YD], [480, YF], [174, YF]], wd[1]); PX.line(g, 184, YD, 470, YD, wd[2]);
    for (let k = 1; k < 4; k++) PX.line(g, lerp(184, 174, k / 4), lerp(YD, YF, k / 4), lerp(470, 480, k / 4), lerp(YD, YF, k / 4), mix(wd[1], wd[2], 0.25));
    R(g, 174, YF, 306, 4, wd[0]); R(g, 174, YF + 4, 306, 10, wd[2]); R(g, 174, YF + 13, 306, 1, mix(wd[2], D.n0, 0.4));
    for (const lx of [182, 466]) { R(g, lx, YF + 14, 7, 296 - YF - 14, wd[2]); R(g, lx, YF + 14, 1, 296 - YF - 14, wd[1]); R(g, lx - 1, YF + 22, 9, 3, wd[1]); }
    shadow(g, 0.45, () => R(g, 170, 296, 316, 4, BLK));
    // books, papers, ink pot
    R(g, 196, YD + 6, 40, 8, mix(D.rust[2], D.n1, 0.3)); R(g, 198, YD + 2, 36, 5, mix(D.moss[2], D.n1, 0.35)); R(g, 198, YD + 2, 36, 1, mix(D.moss[1], D.n2, 0.4)); R(g, 200, YD - 2, 30, 4, mix(D.paperD, D.n2, 0.3));
    sheet(g, 420, YD + 4, 34, 14, 3, 1, 0.25); paperStack(g, 446, YD + 12, 6, 28, 4, 0.2);
    sheet(g, X - 26, YD + 8, 52, 18, 7, S.prog, 0.02);
    if (S.word) { const pc = mix(D.paper, D.n2, 0.02); R(g, X - 18, YD + 21, 32, 3, pc); for (let k = 0; k < 10; k++) R(g, X - 17 + k * 3, YD + 21 + (k % 3 === 1 ? 0 : 1), 2, 2 - (k % 2), mix(D.ink, pc, 0.1)); }
    inkPot(g, X + 40, YD + 14, false);
    // hourglass
    const hgx = 404, hgy = YD + 10;
    R(g, hgx - 6, hgy - 1, 13, 2, wd[2]); R(g, hgx - 6, hgy - 22, 13, 2, wd[2]); R(g, hgx - 6, hgy - 21, 1, 20, wd[1]); R(g, hgx + 6, hgy - 21, 1, 20, wd[1]);
    poly(g, [[hgx - 4, hgy - 20], [hgx + 5, hgy - 20], [hgx + 1, hgy - 11], [hgx, hgy - 11]], mix(D.glass, D.n3, 0.55)); poly(g, [[hgx, hgy - 10], [hgx + 1, hgy - 10], [hgx + 5, hgy - 1], [hgx - 4, hgy - 1]], mix(D.glass, D.n3, 0.55));
    const sand = mix(D.amber[1], D.paperD, 0.4), sp = frac(t / 40);
    poly(g, [[hgx - 3 + sp * 3, hgy - 18 + sp * 7], [hgx + 4 - sp * 3, hgy - 18 + sp * 7], [hgx + 1, hgy - 11], [hgx, hgy - 11]], sand); poly(g, [[hgx - 4, hgy - 2], [hgx + 5, hgy - 2], [hgx + 1, hgy - 6 - sp * 3], [hgx, hgy - 6 - sp * 3]], sand);
    if (Math.floor(t * 8) % 2 === 0) R(g, hgx, hgy - 10, 1, 4, sand); else R(g, hgx, hgy - 9, 1, 3, sand);
    // the candle (left of him) and its warm light
    const [fx, fy] = candle(g, 262, YD + 12, 26, t, 1);
    frontArms(g, X, YD, t, pose, v, -1);
    PX.glow(g, fx, fy, 170 * fl, D.lampD, 0.26); PX.glow(g, fx, fy, 60 * fl, D.lamp, 0.22); PX.glow(g, fx, fy - 2, 9, D.lamp, 0.45);
    smoke(g, fx, fy - 8, t, 0.12);
    // foreground: the dark back of a second chair at bottom right
    const fc = mix(D.n1, D.rust[2], 0.12);
    R(g, 548, 248, 12, 120, fc); R(g, 622, 248, 12, 120, fc); R(g, 548, 262, 86, 12, fc); R(g, 548, 300, 86, 10, fc);
    ell(g, 554, 244, 7, 6, fc); ell(g, 628, 244, 7, 6, fc); R(g, 551, 240, 3, 2, mix(fc, D.lampD, 0.45)); R(g, 550, 262, 80, 1, mix(fc, D.lampD, 0.3));
    dust(g, 21, 22, t, [200, 120, 200, 140], D.lamp, 0.3);
    PX.vignette(g, 0.62);
  };
  // close-up of the page: candle light from the upper left, earlier lines, the word written stroke by stroke
  const PAGE = [[64, 26], [700, 12], [700, 400], [76, 400]];
  const descInsert = (g, t, S) => {
    const wd = woodCols(0.45), fl = flick(t, 1);
    R(g, 0, 0, 640, 360, wd[1]);
    for (let k = 0; k < 18; k++) { const yy = k * 21 + Math.round(hash(k, 3) * 8); R(g, 0, yy, 640, 1, wd[2]); if (k % 3 === 0) R(g, 0, yy + 3, 640, 1, mix(wd[1], wd[0], 0.4)); }
    // ink pot on the desk at the left, seen from above
    const ix = 34, iy = 150;
    shadow(g, 0.4, () => ell(g, ix + 5, iy + 6, 20, 18, BLK));
    ell(g, ix, iy, 19, 17, mix(D.n1, D.teal[2], 0.35)); ell(g, ix - 3, iy - 4, 12, 10, mix(D.n1, D.teal[2], 0.5)); ell(g, ix, iy, 9, 8, mix(D.n2, D.teal[2], 0.2)); ell(g, ix, iy, 7, 6, D.n0);
    R(g, ix - 3, iy - 3, 3, 1, mix(D.lamp, D.n2, 0.3 * fl)); R(g, ix - 12, iy - 10, 5, 1, mix(D.teal[0], D.n2, 0.3)); R(g, ix - 14, iy - 7, 1, 4, mix(D.teal[0], D.n2, 0.4));
    // the page
    shadow(g, 0.5, () => poly(g, PAGE.map(([x, y]) => [x + 6, y + 6]), BLK));
    poly(g, PAGE, D.paper);
    g.save(); g.beginPath(); PAGE.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip();
    PX.vgrad(g, 0, 0, 640, 360, mix(D.paper, D.cream, 0.35), mix(D.paper, D.paperD, 0.55), 12);
    for (let i = 0; i < 180; i++) R(g, 64 + hash(i, 5) * 600, 14 + hash(i, 6) * 360, 1, 1, mix(D.paperD, D.paper, 0.45));
    R(g, 64, 26, 640, 1, mix(D.cream, D.paper, 0.2));
    const ic = mix(D.ink, D.paperD, 0.25);
    cursive(g, 120, 74, 440, 61, ic, 9); cursive(g, 108, 112, 500, 62, ic, 9); cursive(g, 108, 150, 250, 63, ic, 9);
    // the word, then a faint wet sheen on the fresh ink
    const strokes = wordStrokes("IMAGINAIRE", 160, 180, 3.0, 5, 0.16);
    const tip = drawWord(g, strokes, S.wordP, D.ink, 2);
    if (S.wordP > 0 && S.wordP < 1) A(g, 0.3, () => drawWord(g, strokes, S.wordP, mix(D.steel[0], D.cream, 0.3), 1));
    g.restore();
    // the writing hand: tip (px, py), shaft up and to the right, fist below the shaft, sleeve from the lower right
    const [tx, ty, down] = S.wordP >= 1 ? [strokes[strokes.length - 1][1][0] + 14, 196, 0] : tip;
    bigHand(g, Math.round(tx), Math.round(ty - (down ? 0 : 3)), { sk: DESC.skin, sleeve: DESC.top, cuff: "lace", tool: "quill" });
    PX.glow(g, 20, 0, 360 * fl, D.lampD, 0.2); PX.glow(g, 40, 20, 160 * fl, D.lamp, 0.12);
    PX.vignette(g, 0.5);
  };
  K.descartes = (o) => (g, t, d, c) => {
    t = Math.max(0, t);
    const T = tm(o, d, 7.0), tWr = T("write", 0.3), tW = T("word", 3.0), k = d / 7;
    const wDur = 1.3 * k, [i0, i1] = win(o, "insert", tW - 0.45 * k, tW + wDur + 0.5 * k);
    const tS = typeof o.shrug === "number" ? o.shrug : tW + wDur + 0.9 * k;
    const shr = bump(t, tS, 0.35, tS + 0.75, 0.5), wordP = clamp((t - tW) / wDur, 0, 1);
    if (t >= i0 && t < i1) { descInsert(g, t, { wordP }); return; }
    const wr = t >= tWr && shr < 0.05 ? 1 : 0, back = clamp(1 - Math.abs(t - (tW + wDur)) * 2, 0, 1);
    const X = 352, YD = 228, [wx, wy] = penWobble(t, wr, 12);
    const pen = [X + 2 + wx, YD + 16 + Math.round(wy)];
    const rest = [X + 10, YD + 22];
    const hR = shr > 0 ? [lerp(pen[0] + 4, X + 38, shr), lerp(pen[1] - 3, YD - 20, shr)] : wr ? penHand(pen[0], pen[1]) : [rest[0] + 4, rest[1] - 3];
    const hL = [lerp(X - 20, X - 38, shr), lerp(YD + 18, YD - 20, shr)];
    const pose = { down: shr > 0.3 ? 0.2 : 1, look: shr > 0.3 ? 0.5 : 0, eyes: shr > 0.3 ? "open" : "open", shrug: shr, brow: shr, meh: shr > 0.3 ? 1 : 0, tilt: shr > 0.5 ? 1 : 0, hR, hL, toolR: "quill", pen: shr > 0 ? null : (wr ? pen : [rest[0], rest[1]]), palmR: shr > 0.4, palmL: shr > 0.4, glance: 0 };
    descRoom(g, t, c, {});
    descDesk(g, t, { pose, prog: clamp((t - tWr) / (2.4 * k), 0, 1) * 0.6 + (t > tW ? 0.4 : 0), word: t >= tW + wDur * 0.5 });
  };

  // ======================= brahmagupta =======================
  // 7th-century India: a scholar sits cross-legged in a pillared courtyard veranda at dusk, an oil lamp burning beside him,
  // writing on a palm leaf with an iron stylus (o.write 0.3). Around o.zero (3.0) a close-up of the leaf shows him finish a
  // small ring, the symbol for zero, which then glows softly (o.insert:false keeps the wide shot). Back wide, he regards it.
  const BRAH = { skin: SKIN.brown, hair: HAIR.salt, hairStyle: "knot", beard: "full", beardCol: mix(HAIR.grey, HAIR.salt, 0.4), top: SKIN.brown, shirt: D.cream, collar: "shawl", shawl: mix(mix(D.amber[2], D.rust[1], 0.45), D.n3, 0.25), armCol: SKIN.brown, cuff: mix(D.amber[2], D.n2, 0.2), age: 0.8 };
  // Brahmi-like incised script: glyphs built from Brahmi-style strokes (6 x 8 box), with vowel ticks; returns the end x
  const BRG = [
    [[[3, 0], [3, 8]], [[0, 4], [6, 4]]],                                   // ka
    [[[0, 8], [3, 0], [6, 8]]],                                             // ga
    [[[0, 0], [0, 6], [3, 8], [6, 6], [6, 0]]],                             // pa
    [[[3, 0], [4, 2], [2, 4], [4, 6], [3, 8]]],                             // ra
    [[[0, 0], [5, 0], [6, 2], [6, 6], [5, 8], [0, 8], [0, 0]]],             // dha
    [[[0, 8], [0, 3], [3, 0], [6, 3]]],                                     // la
    [[[0, 0], [6, 0], [3, 8], [0, 0]]],                                     // va
    [[[0, 3], [3, 0], [6, 3], [3, 6], [0, 3]], [[3, 6], [3, 8]]],           // ma-like
    [[[0, 0], [0, 8], [6, 8]], [[0, 4], [4, 4]]],                           // ta-like
    [[[6, 0], [1, 1], [0, 4], [1, 7], [6, 8]]],                             // cha-like
  ];
  const brahmi = (g, x, y, w, seed, col, sz, prog) => {
    const r = PX.rnd(seed), end = x + w * clamp(prog === undefined ? 1 : prog, 0, 1), sc = sz / 8; let cx = x;
    while (cx < end - sz * 0.5) {
      const skip = r() < 0.09, k = Math.floor(r() * BRG.length), tick = r(), adv = Math.floor(r() * 2);
      if (skip) { cx += sz; continue; }
      const X = Math.round(cx), Y = Math.round(y);
      for (const st of BRG[k]) for (let i = 1; i < st.length; i++) PX.line(g, X + st[i - 1][0] * sc, Y + st[i - 1][1] * sc, X + st[i][0] * sc, Y + st[i][1] * sc, col);
      if (tick < 0.22) PX.line(g, X + 6 * sc, Y, X + 8 * sc, Y - 2 * sc, col); else if (tick < 0.36) PX.line(g, X + 3 * sc, Y + 8 * sc, X + 5 * sc, Y + 10 * sc, col); else if (tick < 0.46) PX.line(g, X - 1, Y + 2 * sc, X + 1, Y + 2 * sc, col);
      cx += sz + 3 + adv;
    }
    return cx;
  };
  // tall brass standing lamp with a five-wick dish; base centre (x, y); returns the flame centre
  const standLamp = (g, x, y, t, h) => {
    const br = [mix(D.lampD, D.cream, 0.1), mix(mix(D.amber[2], D.rust[2], 0.3), D.n2, 0.25), mix(D.amber[2], D.n1, 0.65)];
    shadow(g, 0.45, () => ell(g, x + 3, y + 1, 18, 3, BLK));
    ell(g, x, y - 2, 16, 4, br[2]); ell(g, x, y - 4, 14, 3, br[1]); R(g, x - 10, y - 6, 8, 1, br[0]);
    R(g, x - 3, y - h, 6, h - 4, br[1]); R(g, x - 3, y - h, 2, h - 4, br[0]); R(g, x + 2, y - h, 1, h - 4, br[2]);
    for (const f of [0.25, 0.5, 0.75]) { const yy = Math.round(y - h * f); ell(g, x, yy, 5, 2, br[1]); R(g, x - 4, yy - 1, 3, 1, br[0]); }
    ell(g, x, y - h - 1, 14, 3, br[2]); ell(g, x, y - h - 3, 13, 3, br[1]); R(g, x - 11, y - h - 5, 22, 1, br[0]);
    R(g, x - 2, y - h - 14, 4, 10, br[1]); ell(g, x, y - h - 15, 4, 3, br[0]);
    for (let i = 0; i < 5; i++) {
      const fx = x - 12 + i * 6, fy = y - h - 5, f = flick(t, i * 1.7), fh = Math.round(5 * f), sw = Math.round(Math.sin(t * 4.7 + i) * 0.6);
      ell(g, fx + sw * 0.5, fy - 1, 1, 2, mix(D.amber[1], D.lamp, 0.4)); R(g, fx + sw, fy - fh, 1, fh, D.lamp); R(g, fx, fy - 1, 1, 1, D.cream);
    }
    return [x, y - h - 8];
  };
  // a palm-leaf manuscript bundle (pothi) between two wooden boards, tied with cords
  const pothi = (g, x, y, w, n, dim) => {
    const wb = woodCols(0.5 + dim * 0.3, 0.5), lf = mix(mix(D.paper, D.amber[1], 0.25), D.n2, dim);
    R(g, x, y - 3, w, 3, wb[1]); R(g, x, y - 3, w, 1, wb[0]);
    for (let k = 0; k < n; k++) R(g, x + 1, y - 4 - k, w - 2, 1, k % 2 ? lf : mix(lf, D.n2, 0.2));
    R(g, x, y - 7 - n, w, 3, wb[1]); R(g, x, y - 7 - n, w, 1, wb[0]); R(g, x + 1, y - 4 - n, w - 2, 1, wb[2]);
    R(g, x + Math.round(w * 0.3), y - 8 - n, 2, n + 8, mix(D.rust[2], D.n2, 0.2)); R(g, x + Math.round(w * 0.7), y - 8 - n, 2, n + 8, mix(D.rust[2], D.n2, 0.2));
  };
  const brahRoom = (g, t, c, lampF) => {
    const st = mix(mix(D.n3, D.rust[2], 0.3), D.paperD, 0.12), [stL, , stD] = sh3(st), wb = woodCols(0.6, 0.45);
    R(g, 0, 0, 640, 360, D.n1);
    // far: dusk sky with the last sun behind the wall, birds going home, a big tree, the courtyard wall
    PX.par(g, c, 0.25, () => {
      PX.vgrad(g, -40, -40, 720, 210, mix(D.steel[2], D.n1, 0.45), mix(mix(D.amber[1], D.rust[1], 0.4), D.n3, 0.3), 10);
      PX.glow(g, 210, 160, 230, D.amber[1], 0.22); PX.glow(g, 210, 160, 80, D.lamp, 0.16);
      A(g, 0.35, () => { ell(g, 150, 108, 120, 4, mix(D.rose[0], D.amber[0], 0.4)); ell(g, 440, 96, 90, 3, mix(D.rose[0], D.n6, 0.4)); ell(g, 300, 74, 70, 2, mix(D.rose[1], D.n5, 0.4)); });
      for (const [bx, by, sp] of [[0, 62, 9], [40, 70, 11], [74, 56, 10], [300, 84, 8]]) { const xx = ((bx + t * sp) % 760) - 60, yy = by + Math.sin(t * 2 + bx) * 3, wing = Math.sin(t * 9 + bx) > 0 ? 1 : 0; PX.line(g, xx - 3, yy - wing, xx, yy, D.n1); PX.line(g, xx, yy, xx + 3, yy - wing, D.n1); }
      // tree: dark leafy silhouette, rim-lit by the sky
      const tc = mix(D.moss[2], D.n1, 0.62), tcL = mix(D.moss[2], D.amber[2], 0.3);
      R(g, 472, 110, 9, 60, mix(D.n1, D.rust[2], 0.15)); seg(g, 476, 130, 440, 96, 4, mix(D.n1, D.rust[2], 0.15)); seg(g, 476, 124, 520, 92, 4, mix(D.n1, D.rust[2], 0.15));
      ell(g, 478, 96, 80, 36, tc); ell(g, 430, 108, 44, 22, tc); ell(g, 530, 104, 46, 24, tc);
      for (let i = 0; i < 140; i++) { const a = hash(i, 1) * TAU, lx = 478 + Math.cos(a) * (84 + hash(i, 2) * 8), ly = 96 + Math.sin(a) * (38 + hash(i, 2) * 6); if (ly < 140) ell(g, lx, ly, 3 + hash(i, 3) * 4, 2 + hash(i, 4) * 3, tc); }
      for (let i = 0; i < 30; i++) R(g, 400 + hash(i, 9) * 160, 70 + hash(i, 10) * 60, 1, 1, mix(D.amber[1], D.n4, 0.3));
      for (let i = 0; i < 40; i++) { const a = Math.PI + hash(i, 5) * Math.PI, lx = 478 + Math.cos(a) * 88, ly = 92 + Math.sin(a) * 44; R(g, lx + Math.round(Math.sin(t * 1.3 + i) * 0.6), ly, 3, 1, tcL); }
      ell(g, 60, 136, 70, 22, tc); for (let i = 0; i < 60; i++) { const a = Math.PI + hash(i, 7) * Math.PI, lx = 60 + Math.cos(a) * (72 + hash(i, 8) * 6), ly = 136 + Math.sin(a) * (24 + hash(i, 8) * 4); ell(g, lx, ly, 3 + hash(i, 3) * 3, 2 + hash(i, 4) * 2, tc); }
      const wl = mix(mix(D.n3, D.rose[2], 0.3), D.paperD, 0.1);
      R(g, -40, 150, 720, 72, wl); R(g, -40, 150, 720, 2, mix(wl, D.amber[0], 0.25)); R(g, -40, 152, 720, 2, mix(wl, D.n0, 0.3));
      for (let k = 0; k < 40; k++) R(g, hash(k, 11) * 700 - 30, 158 + hash(k, 12) * 56, 2, 1, mix(wl, D.n0, 0.15));
      // doorway with a lamp in a niche
      R(g, 296, 166, 40, 56, mix(D.n1, D.rust[2], 0.12)); ell(g, 316, 166, 20, 10, mix(D.n1, D.rust[2], 0.12)); R(g, 292, 164, 48, 2, mix(wl, D.n0, 0.2));
      R(g, 360, 180, 10, 12, mix(D.n1, D.rust[2], 0.2)); ell(g, 365, 180, 5, 3, mix(D.n1, D.rust[2], 0.2)); R(g, 364, 187, 2, 2, D.lamp); PX.glow(g, 365, 187, 12, D.lamp, 0.3 * flick(t, 9));
      // courtyard floor + tulsi planter
      R(g, -40, 222, 720, 28, mix(D.n3, D.paperD, 0.22)); for (let k = 0; k < 14; k++) PX.line(g, k * 52 - 20, 222, k * 64 - 120, 250, mix(D.n3, D.n1, 0.4));
      const tp = mix(D.n4, D.paperD, 0.3); R(g, 196, 196, 30, 30, tp); R(g, 192, 192, 38, 5, mix(tp, D.amber[0], 0.15)); R(g, 222, 196, 4, 30, mix(tp, D.n0, 0.3));
      for (let i = 0; i < 9; i++) { const a = -Math.PI / 2 + (i - 4) * 0.32 + Math.sin(t * 1.2 + i) * 0.04; seg(g, 211, 192, 211 + Math.cos(a) * 14, 192 + Math.sin(a) * 14, 2, mix(D.moss[2], D.n2, 0.3)); ell(g, 211 + Math.cos(a) * 14, 192 + Math.sin(a) * 14, 2, 2, mix(D.moss[1], D.n2, 0.4)); }
    });
    // middle: the veranda ceiling beam with a leaf garland, carved pillars, polished floor
    PX.par(g, c, 0.6, () => {
      R(g, -40, -40, 720, 60, mix(wb[2], D.n0, 0.3)); R(g, -40, 20, 720, 14, wb[1]); R(g, -40, 20, 720, 1, wb[0]); R(g, -40, 33, 720, 3, wb[2]);
      for (let k = 0; k < 24; k++) { R(g, k * 30 - 20, 24, 2, 6, wb[2]); R(g, k * 30 - 6, 26, 4, 2, mix(wb[1], wb[0], 0.4)); }
      // mango-leaf garland (toran) swaying a little
      PX.line(g, 110, 38, 500, 38, mix(D.n1, D.rust[2], 0.3));
      for (let k = 0; k < 26; k++) { const lx = 116 + k * 15, sw = Math.round(Math.sin(t * 1.1 + k * 0.7) * 1), lc = k % 2 ? mix(D.moss[2], D.n2, 0.35) : mix(D.moss[1], D.n2, 0.5); poly(g, [[lx - 2, 39], [lx + 2, 39], [lx + 2 + sw, 47], [lx + sw, 52], [lx - 2 + sw, 47]], lc); R(g, lx, 40, 1, 8, mix(lc, D.n0, 0.3)); if (k % 4 === 0) ell(g, lx + 7, 41, 2, 2, mix(D.amber[1], D.rust[1], 0.4)); }
      for (const px of [96, 512]) {
        R(g, px - 9, 36, 18, 210, st); R(g, px - 9, 36, 3, 210, stL); R(g, px + 6, 36, 3, 210, stD);
        for (const yy of [70, 120, 170]) { R(g, px - 11, yy, 22, 6, st); R(g, px - 11, yy, 22, 1, stL); R(g, px - 11, yy + 5, 22, 1, stD); for (let j = 0; j < 5; j++) R(g, px - 8 + j * 4, yy + 2, 2, 2, stD); }
        R(g, px - 22, 36, 44, 8, st); R(g, px - 22, 36, 44, 1, stL); R(g, px - 22, 43, 44, 1, stD); poly(g, [[px - 22, 44], [px - 10, 44], [px - 10, 54]], stD); poly(g, [[px + 22, 44], [px + 10, 44], [px + 10, 54]], stD);
        R(g, px - 14, 236, 28, 12, st); R(g, px - 14, 236, 28, 1, stL); R(g, px - 16, 246, 32, 4, stD);
      }
      PX.vgrad(g, -40, 248, 720, 120, mix(st, D.n1, 0.5), mix(st, D.n0, 0.6), 6);
      R(g, -40, 248, 720, 2, mix(stL, D.n2, 0.4));
      for (let k = 0; k < 9; k++) PX.line(g, 320 + (k - 4) * 80, 250, 320 + (k - 4) * 190, 360, mix(st, D.n0, 0.65));
      for (const yy of [272, 306]) R(g, -40, yy, 720, 1, mix(st, D.n0, 0.65));
    });
    PX.glow(g, 404, 330, 70 * lampF, D.lampD, 0.2);   // lamp reflected in the floor
  };
  const brahScene = (g, t, c, S) => {
    const v = BRAH, X = 300, YD = 266, lampF = flick(t, 3);
    brahRoom(g, t, c, lampF);
    // the scholar's mat
    poly(g, [[222, 280], [380, 280], [400, 304], [204, 304]], mix(D.amber[2], D.n2, 0.35));
    for (let k = 0; k < 9; k++) PX.line(g, 228 + k * 18, 281, 210 + k * 21, 303, mix(D.amber[2], D.n2, 0.5)); R(g, 204, 304, 196, 2, mix(D.amber[2], D.n1, 0.5));
    // manuscripts on a low stand at his right
    const wb = woodCols(0.5, 0.45);
    R(g, 168, 270, 56, 4, wb[1]); R(g, 168, 270, 56, 1, wb[0]); R(g, 172, 274, 4, 18, wb[2]); R(g, 216, 274, 4, 18, wb[2]);
    pothi(g, 170, 270, 52, 8, 0.15); pothi(g, 174, 255, 46, 6, 0.2); pothi(g, 172, 244, 48, 5, 0.25);
    pothi(g, 128, 300, 40, 4, 0.3);
    { const dx = 246, dy = 318, f = flick(t, 7); ell(g, dx, dy, 7, 3, mix(D.rust[2], D.n2, 0.3)); ell(g, dx, dy - 1, 5, 2, mix(D.rust[1], D.n3, 0.35)); R(g, dx + 4, dy - 3, 1, 2, D.n1); R(g, dx + 4, dy - 3 - Math.round(3 * f), 1, Math.round(3 * f), D.lamp); R(g, dx + 3, dy - 4, 3, 2, mix(D.amber[1], D.lamp, 0.4)); PX.glow(g, dx + 4, dy - 4, 26 * f, D.lamp, 0.22); }
    frontBody(g, X, YD, t, S.pose, v, 1);
    // crossed legs in a cream dhoti
    const dh = mix(D.paperD, D.n4, 0.45), [dL, , dD] = sh3(dh);
    ell(g, X, YD + 12, 46, 12, dh); ell(g, X + 8, YD + 8, 26, 5, mix(dh, D.lampD, 0.2)); R(g, X - 44, YD + 18, 88, 2, dD);
    for (let k = 0; k < 4; k++) PX.line(g, X - 30 + k * 18, YD + 4, X - 24 + k * 18, YD + 20, dD);
    ell(g, X - 36, YD + 18, 7, 3, mix(v.skin, D.n0, 0.1)); ell(g, X + 36, YD + 18, 7, 3, v.skin);
    // low slanted writing board with the leaf
    poly(g, [[X - 34, YD + 2], [X + 34, YD + 2], [X + 38, YD + 12], [X - 38, YD + 12]], wb[1]); R(g, X - 38, YD + 12, 76, 3, wb[2]); R(g, X - 34, YD + 2, 68, 1, wb[0]);
    R(g, X - 34, YD + 15, 4, 10, wb[2]); R(g, X + 30, YD + 15, 4, 10, wb[2]);
    const lf = mix(D.paper, D.amber[1], 0.3);
    poly(g, [[X - 30, YD + 3], [X + 30, YD + 3], [X + 31, YD + 10], [X - 31, YD + 10]], lf); R(g, X - 31, YD + 10, 62, 1, mix(lf, D.n0, 0.35));
    R(g, X - 16, YD + 6, 1, 1, D.n2); R(g, X + 15, YD + 6, 1, 1, D.n2);
    for (let l = 0; l < 2; l++) scribble(g, X - 26, YD + 5 + l * 2, 50 * (l ? S.prog : 1), 70 + l, mix(D.ink, lf, 0.3), 1, 1);
    if (S.glow > 0) { const zc = mix(D.ink, D.amber[1], 0.6 * S.glow); R(g, X + 19, YD + 4, 3, 1, zc); R(g, X + 19, YD + 8, 3, 1, zc); R(g, X + 18, YD + 5, 1, 3, zc); R(g, X + 22, YD + 5, 1, 3, zc); PX.glow(g, X + 20, YD + 6, 10, D.amber[0], 0.4 * S.glow); }
    frontArms(g, X, YD, t, S.pose, v, 1);
    const [fx, fy] = standLamp(g, 404, 300, t, 128);
    PX.glow(g, fx, fy, 210 * lampF, D.lampD, 0.24); PX.glow(g, fx, fy, 70 * lampF, D.lamp, 0.13); PX.glow(g, fx, fy + 2, 12, D.lamp, 0.25);
    smoke(g, fx - 6, fy - 6, t, 0.1); smoke(g, fx + 6, fy - 6, t + 2, 0.1);
    // foreground: a brass water pot and a carved pillar edge
    const br = [mix(D.lampD, D.cream, 0.1), mix(mix(D.amber[2], D.rust[2], 0.35), D.lampD, 0.25), mix(D.amber[2], D.n1, 0.6)];
    shadow(g, 0.45, () => ell(g, 482, 330, 22, 4, BLK)); ell(g, 478, 314, 18, 15, br[1]); ell(g, 472, 308, 8, 6, br[0]); R(g, 470, 294, 16, 6, br[1]); R(g, 467, 292, 22, 3, br[0]); R(g, 490, 306, 3, 14, br[2]);
    const pc = mix(D.n1, D.rust[2], 0.15);
    R(g, 590, -10, 60, 380, pc); R(g, 590, -10, 2, 380, mix(pc, D.lampD, 0.35)); for (const yy of [60, 140, 220, 300]) { R(g, 584, yy, 66, 10, pc); R(g, 584, yy, 66, 1, mix(pc, D.lampD, 0.4)); }
    dust(g, 31, 22, t, [260, 150, 220, 140], D.lamp, 0.3);
    PX.vignette(g, 0.6);
  };
  // close-up: the leaf on the board, the stylus finishing a line and the ring for zero; lamp light from the left
  const brahInsert = (g, t, S) => {
    const lampF = flick(t, 3), sk = BRAH.skin, skL = mix(sk, D.cream, 0.25), skD = mix(sk, D.n0, 0.3), wb = woodCols(0.55, 0.45);
    // his lap and the floor below, dim and soft
    PX.vgrad(g, 0, 0, 640, 360, mix(D.n2, D.rust[2], 0.3), D.n1, 6);
    const dh = mix(mix(D.n2, D.rust[2], 0.3), D.paperD, 0.15); R(g, 0, 292, 640, 68, dh); for (let k = 0; k < 9; k++) PX.line(g, k * 76 - 40, 292, k * 70 - 10, 360, mix(dh, D.n0, 0.2)); A(g, 0.35, () => R(g, 0, 292, 640, 6, BLK));
    // the board
    poly(g, [[-20, 92], [660, 80], [660, 270], [-20, 282]], wb[1]); for (let k = 0; k < 9; k++) PX.line(g, -20, 106 + k * 20, 660, 94 + k * 20, mix(wb[1], wb[2], 0.35));
    R(g, -20, 276, 680, 2, wb[0]); poly(g, [[-20, 278], [660, 266], [660, 276], [-20, 288]], wb[2]);
    // leaves below, then the leaf (rounded ends, fibres, string holes)
    const lf = mix(mix(D.paperD, D.amber[2], 0.22), D.n3, 0.12), lfD = mix(lf, D.n0, 0.3), lfL = mix(lf, D.cream, 0.3);
    const ly = (x) => 172 - x * 0.018;
    const leaf = (dy, col, edge) => { poly(g, [[40, ly(40) - 40 + dy], [600, ly(600) - 40 + dy], [600, ly(600) + 40 + dy], [40, ly(40) + 40 + dy]], col); ell(g, 40, ly(40) + dy, 22, 40, col); ell(g, 600, ly(600) + dy, 22, 40, col); if (edge) { R(g, 30, ly(40) + 40 + dy, 580, 1, edge); } };
    shadow(g, 0.45, () => { poly(g, [[44, ly(44) - 30], [608, ly(608) - 30], [608, ly(608) + 50], [44, ly(44) + 50]], BLK); });
    for (let k = 3; k > 0; k--) leaf(k * 3, mix(lf, D.n1, 0.2 + k * 0.08), mix(lf, D.n0, 0.5));
    leaf(0, lf);
    clipR(g, 0, 0, 640, 360, () => {
      for (let k = -3; k <= 3; k++) PX.line(g, 22, ly(22) + k * 11, 618, ly(618) + k * 11, mix(lf, lfD, 0.18));
      R(g, 30, ly(30) - 40, 580, 1, lfL);
    });
    for (const hx0 of [150, 480]) { ell(g, hx0, ly(hx0), 4, 4, mix(D.n1, wb[2], 0.3)); R(g, hx0 - 2, ly(hx0) - 4, 3, 1, lfD); }
    seg(g, 150, ly(150), 146, 270, 3, mix(D.rust[2], D.n2, 0.15)); seg(g, 150, ly(150), 147, 270, 1, mix(D.rust[1], D.n3, 0.3));
    // incised lines (soot rubbed in): three rows, the last being finished now
    const ink = mix(D.n1, D.ink, 0.35), yr = (x0, row) => ly(x0) - 26 + row * 20;
    brahmi(g, 60, yr(60, 0), 520, 81, ink, 9);
    brahmi(g, 60, yr(60, 1), 520, 82, ink, 9);
    const endX = brahmi(g, 60, yr(60, 2), 300, 83, ink, 9, S.lineP);
    const ZX = 60 + 300 + 14, ZY = Math.round(yr(ZX, 2) + 4), RR = 6, ringK = clamp(S.ringP, 0, 1);
    let tip = S.lineP < 1 ? [endX, yr(endX, 2) + 4 + Math.round(Math.sin(t * 30) * 3)] : [ZX + RR, ZY];
    if (ringK > 0) {
      const n = Math.ceil(ringK * 32);
      for (let i = 0; i < n; i++) { const a0 = (i / 32) * TAU, a1 = (Math.min(i + 1, ringK * 32) / 32) * TAU; for (const rr of [RR, RR - 1]) PX.line(g, ZX + Math.cos(a0) * rr, ZY + Math.sin(a0) * rr, ZX + Math.cos(a1) * rr, ZY + Math.sin(a1) * rr, ink); }
      tip = [ZX + Math.cos(ringK * TAU) * RR, ZY + Math.sin(ringK * TAU) * RR];
    }
    if (S.glow > 0) {   // soft, warm, small
      const gp = S.glow * (0.92 + 0.08 * Math.sin(t * 2.2));
      PX.glow(g, ZX, ZY, 30, D.amber[0], 0.26 * gp); PX.glow(g, ZX, ZY, 12, D.lamp, 0.3 * gp);
      A(g, 0.8 * gp, () => { for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU; R(g, ZX + Math.cos(a) * (RR - 0.5), ZY + Math.sin(a) * (RR - 0.5), 1, 1, mix(D.amber[0], D.cream, 0.35)); } });
    }
    // left hand steadies the leaf from below
    shadow(g, 0.3, () => ell(g, 52, 250, 34, 14, BLK));
    seg(g, -30, 300, 30, 252, 26, sk); seg(g, -34, 294, 26, 246, 6, skL);
    poly(g, [[20, 240], [64, 226], [80, 236], [74, 256], [34, 264], [14, 256]], sk); R(g, 30, 258, 40, 2, skD);
    for (let k = 0; k < 4; k++) { const fx = 44 + k * 9, fy = 216 + Math.abs(k - 1.2) * 3; seg(g, fx - 4, 238, fx, fy, 7, sk); R(g, fx - 2, fy - 1, 4, 2, skL); R(g, fx - 1, fy, 2, 1, mix(sk, D.cream, 0.45)); PX.line(g, fx + 2, 236, fx + 3, fy + 4, skD); }
    seg(g, 24, 244, 40, 226, 6, mix(sk, D.cream, 0.1));
    // right hand with the stylus
    const lift = S.lineP >= 1 && ringK >= 1 ? 5 : 0;
    bigHand(g, Math.round(tip[0]), Math.round(tip[1]) - lift, { sk: mix(sk, D.n1, 0.18), sleeve: null, cuff: "bangle", tool: "stylus" });
    PX.glow(g, -40, 140, 340 * lampF, D.lampD, 0.26); PX.glow(g, -20, 150, 150 * lampF, D.lamp, 0.14);
    PX.vignette(g, 0.6);
  };
  K.brahmagupta = (o) => (g, t, d, c) => {
    t = Math.max(0, t);
    const T = tm(o, d, 8.0), tWr = T("write", 0.3), tZ = T("zero", 3.0), k = d / 8;
    const [i0, i1] = win(o, "insert", tZ - 1.6 * k, tZ + 2.0 * k);
    const ringP = clamp((t - (tZ - 0.7 * k)) / (0.7 * k), 0, 1), lineP = clamp((t - i0) / Math.max(0.1, tZ - 0.7 * k - i0), 0, 1), glow = P(t, tZ, 0.7, "io");
    if (t >= i0 && t < i1) { brahInsert(g, t, { lineP, ringP, glow }); return; }
    const X = 300, YD = 266, after = t >= tZ, wr = t >= tWr && !after ? 1 : 0;
    const [wx, wy] = penWobble(t, wr, 20), pen = [X + 4 + wx, YD + 6 + Math.round(wy * 0.5)];
    const pose = { down: after ? 0.6 : 1, smile: after ? 1 : 0, hR: wr ? penHand(pen[0], pen[1]) : [X + 32, YD + 1], hL: [X - 28, YD + 6], toolR: "stylus", pen: wr ? pen : [X + 28, YD + 4], lids: after };
    brahScene(g, t, c, { pose, prog: clamp((t - tWr) / (2 * k), 0, 1), glow: after ? glow : 0 });
  };

  // ======================= bank =======================
  // a warm old-fashioned bank counter in afternoon sun (brass grille, ledgers, coin scales, pigeonholes, a wall clock):
  // a smiling banker in an eyeshade slides one coin under the grille to a customer (o.give 0.5); from o.grow (3.0) the
  // coin stack beside it grows in steps (o.steps 6, each step a little bigger, no digits).
  const BANKER = { skin: SKIN.warm, hair: HAIR.brown, hairStyle: "visor", beard: "tash", top: mix(D.paper, D.steel[0], 0.15), shirt: mix(D.paper, D.cream, 0.3), collar: "vest", vest: mix(mix(D.rust[2], D.n2, 0.5), D.amber[2], 0.15), tie: mix(D.moss[2], D.n2, 0.3), armCol: mix(D.paper, D.steel[0], 0.12), cuff: mix(D.cream, D.paper, 0.2), hatCol: mix(D.moss[2], D.teal[2], 0.3) };
  const COIN = () => [mix(D.amber[0], D.cream, 0.2), mix(mix(D.amber[1], D.lampD, 0.5), D.paperD, 0.15), mix(D.amber[2], D.rust[2], 0.35)];
  // one coin lying flat (centre x, y), stacked coins are 2 px apart
  const flatCoin = (g, x, y, edge) => { const [cL, cc, cD] = COIN(); x = Math.round(x); y = Math.round(y); if (edge) { R(g, x - 5, y, 11, 2, cD); R(g, x - 4, y + 2, 9, 1, mix(cD, D.n0, 0.3)); } ell(g, x, y, 5, 1.6, cc); R(g, x - 3, y - 1, 4, 1, cL); R(g, x + 4, y, 1, 1, cD); };
  const coinStack = (g, x, y, n, drop, nd) => {
    shadow(g, 0.4, () => ell(g, x + 2, y + 2, 7, 2, BLK));
    for (let i = 0; i < n; i++) flatCoin(g, x + Math.round((hash(i, 3) - 0.5) * 2), y - i * 3, true);
    if (drop > 0 && drop < 1) for (let j = 0; j < (nd || 1); j++) flatCoin(g, x, y - (n + j) * 3 - Math.round((1 - E(drop, "in")) * (16 + j * 4)), true);
  };
  const bankRoom = (g, t, c) => {
    const wd = woodCols(0.45, 0.35), pl = mix(mix(D.paperD, D.amber[2], 0.25), D.n3, 0.35), plD = mix(pl, D.n0, 0.25);
    R(g, 0, 0, 640, 360, D.n2);
    PX.par(g, c, 0.4, () => {
      // plaster wall, wood wainscot, cornice
      R(g, -40, -40, 720, 300, pl);
      for (let i = 0; i < 160; i++) R(g, hash(i, 1) * 720 - 40, hash(i, 2) * 220, 2, 1, mix(pl, D.n0, 0.08));
      R(g, -40, 10, 720, 8, wd[1]); R(g, -40, 10, 720, 1, wd[0]); R(g, -40, 17, 720, 2, wd[2]);
      R(g, -40, 176, 720, 90, wd[1]); R(g, -40, 176, 720, 2, wd[0]); for (let x = -30; x < 700; x += 46) { R(g, x, 186, 38, 50, mix(wd[1], wd[2], 0.35)); R(g, x, 186, 38, 1, wd[0]); R(g, x + 37, 186, 1, 50, wd[2]); }
      // tall arched window on the right with the afternoon outside
      const wx = 470, wy = 40, ww = 92, wh = 140;
      R(g, wx - 8, wy - 4, ww + 16, wh + 12, plD);
      g.save(); g.beginPath(); g.rect(wx, wy + 30, ww, wh - 30); g.ellipse(wx + ww / 2, wy + 30, ww / 2, 30, 0, Math.PI, 0); g.clip();
      PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[0], D.cream, 0.45), mix(D.cream, D.lamp, 0.5), 7);
      for (const [bx, bh] of [[0, 60], [22, 84], [50, 70], [70, 96]]) { R(g, wx + bx, wy + wh - bh * 0.6, 22, bh, mix(D.paperD, D.steel[0], 0.35)); for (let k = 0; k < 4; k++) R(g, wx + bx + 4 + (k % 2) * 8, wy + wh - bh * 0.6 + 6 + Math.floor(k / 2) * 12, 4, 6, mix(D.steel[1], D.cream, 0.4)); }
      g.restore();
      for (let k = 1; k < 3; k++) R(g, wx + (ww * k) / 3 - 1, wy + 4, 2, wh, wd[2]); for (let k = 1; k < 5; k++) R(g, wx, wy + 30 + k * 26, ww, 2, wd[2]);
      R(g, wx - 4, wy + wh, ww + 8, 5, wd[1]); R(g, wx - 4, wy + wh, ww + 8, 1, wd[0]);
      // pigeonhole cabinet with ledgers and rolled papers
      const px0 = 64, py0 = 52, cw = 150, chh = 124;
      R(g, px0 - 4, py0 - 6, cw + 8, chh + 10, wd[2]); R(g, px0 - 4, py0 - 6, cw + 8, 2, wd[0]);
      for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) {
        const cx = px0 + i * 25, cy = py0 + j * 31; R(g, cx + 1, cy + 1, 23, 29, mix(D.n1, wd[2], 0.4));
        const r = hash(i, j);
        if (r < 0.45) { for (let k = 0; k < 4; k++) { const bc = mix([D.rust[2], D.moss[2], D.steel[2], D.paperD][(i + j + k) % 4], D.n2, 0.35); R(g, cx + 3 + k * 5, cy + 6, 4, 24, bc); R(g, cx + 3 + k * 5, cy + 9, 4, 1, mix(bc, D.amber[1], 0.4)); } }
        else if (r < 0.8) { for (let k = 0; k < 3; k++) { ell(g, cx + 6 + k * 6, cy + 22 - (k % 2) * 4, 3, 3, mix(D.paper, D.n3, 0.3)); R(g, cx + 5 + k * 6, cy + 21 - (k % 2) * 4, 1, 1, mix(D.paperD, D.n3, 0.4)); } }
        else { R(g, cx + 3, cy + 22, 19, 8, mix(D.paper, D.n3, 0.25)); R(g, cx + 3, cy + 22, 19, 1, mix(D.cream, D.n3, 0.2)); }
      }
      for (let j = 1; j < 4; j++) R(g, px0, py0 + j * 31, cw, 2, wd[1]); for (let i = 1; i < 6; i++) R(g, px0 + i * 25, py0, 2, chh, wd[1]);
      // wall clock with a swinging pendulum (ticks only)
      const cx0 = 262, cy0 = 70, sw = Math.sin(t * Math.PI) * 0.35;
      R(g, cx0 - 14, cy0 - 18, 28, 92, wd[2]); R(g, cx0 - 14, cy0 - 18, 28, 1, wd[0]); poly(g, [[cx0 - 16, cy0 - 18], [cx0, cy0 - 28], [cx0 + 16, cy0 - 18]], wd[1]);
      PX.circle(g, cx0, cy0, 11, mix(D.amber[2], D.n2, 0.2)); PX.circle(g, cx0, cy0, 10, mix(D.cream, D.paper, 0.3));
      for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; R(g, Math.round(cx0 + Math.cos(a) * 8), Math.round(cy0 + Math.sin(a) * 8), 1, 1, D.n3); }
      const ma = -Math.PI / 2 + t * 0.02 + 2.1, ha = -Math.PI / 2 + 4.0; PX.line(g, cx0, cy0, cx0 + Math.cos(ma) * 7, cy0 + Math.sin(ma) * 7, D.n1); PX.line(g, cx0, cy0, cx0 + Math.cos(ha) * 5, cy0 + Math.sin(ha) * 5, D.n1);
      R(g, cx0 - 9, cy0 + 16, 18, 52, mix(D.n1, wd[2], 0.3)); const pbx = cx0 + Math.sin(sw * 0.45) * 30, pby = cy0 + 18 + Math.cos(sw * 0.45) * 30;
      PX.line(g, cx0, cy0 + 18, pbx, pby, mix(D.amber[1], D.n3, 0.3)); PX.circle(g, pbx, pby, 4, mix(D.amber[1], D.lampD, 0.3)); R(g, pbx - 2, pby - 2, 2, 1, D.lamp);
      // framed banknote-style certificate (no text) and a calendar-like notice board
      R(g, 360, 64, 64, 44, wd[2]); R(g, 363, 67, 58, 38, mix(D.paper, D.moss[0], 0.2)); for (let k = 0; k < 4; k++) R(g, 370, 76 + k * 6, 44 - (k % 2) * 12, 2, mix(D.moss[2], D.paper, 0.4)); ell(g, 392, 92, 6, 5, mix(D.moss[2], D.paper, 0.3));
      // hanging globe lamp
      PX.line(g, 340, -10, 340, 34, D.n2); ell(g, 340, 42, 10, 9, mix(D.cream, D.lamp, 0.4)); R(g, 334, 32, 12, 3, mix(D.amber[2], D.n2, 0.2)); PX.glow(g, 340, 42, 50, D.lamp, 0.2);
    });
  };
  K.bank = (o) => (g, t, d, c) => {
    t = Math.max(0, t);
    const T = tm(o, d, 8.0), tG = T("give", 0.5), tGr = T("grow", 3.0), k = d / 8, steps = typeof o.steps === "number" ? Math.max(1, Math.round(o.steps)) : 6;
    const X = 320, YD = 236, YG = 246, YF = 272, v = BANKER;
    // coin path: from his hand behind the slot, under the grille, to the customer's side
    const slide = clamp((t - (tG + 0.35)) / 0.8, 0, 1), sE = E(slide, "out");
    const coinX = lerp(X + 6, X - 16, sE), coinY = lerp(YD + 6, YF - 10, sE);
    const reach = bump(t, tG, 0.35, tG + 0.6, 0.5);
    // stack heights grow by bigger steps (compounding look)
    const SY = YF - 9, hts = [0]; for (let i = 1; i <= steps; i++) hts.push(Math.max(hts[i - 1] + 1, Math.round(Math.pow(1.5, i) * 0.9)));
    const stepDur = Math.max(0.3, (3.5 * k) / steps), si = t < tGr ? 0 : Math.min(steps, Math.floor((t - tGr) / stepDur) + 1);
    const n = hts[si], drop = si > 0 ? clamp((t - tGr - (si - 1) * stepDur) / 0.25, 0, 1) : 1, nShow = drop < 1 ? hts[si - 1] : n, nDrop = si > 0 ? n - hts[si - 1] : 0;
    const glance = t > tGr ? Math.sin(t * 1.3) > 0.2 ? -1 : 0 : 0;
    bankRoom(g, t, c);
    // banker
    const pose = { smile: 1, look: 0.3, glance: reach > 0.2 ? -1 : glance, tilt: si > 0 && drop < 1 ? 1 : 0, hR: [lerp(X + 26, coinX + 2, reach), lerp(YD + 2, YD + 4, reach)], hL: [X - 30, YD + 4], ph: 1 };
    frontBody(g, X, YD, t, pose, v, 1);
    // counter: banker side strip
    const mb = mix(mix(D.paper, D.paperD, 0.5), D.n4, 0.32), mbL = mix(mb, D.cream, 0.3), mbD = mix(mb, D.n0, 0.3);
    R(g, -40, YD, 720, YG - YD, mix(mb, D.n2, 0.15));
    // ledger, inkwell and brass coin scales on his side
    const lg = mix(D.paper, D.n3, 0.15); poly(g, [[372, YD + 1], [432, YD + 1], [436, YD + 8], [368, YD + 8]], lg); R(g, 401, YD + 1, 1, 7, mix(D.paperD, D.n3, 0.3));
    for (let l = 0; l < 3; l++) { R(g, 374, YD + 2 + l * 2, 24, 1, mix(D.ink, lg, 0.6)); R(g, 404, YD + 2 + l * 2, 26, 1, mix(D.ink, lg, 0.6)); }
    inkPot(g, 446, YD + 8, true);
    { const bx = 214, by = YD + 8, br = COIN(), bs = Math.sin(t * 0.8) * 1.2; R(g, bx - 1, by - 34, 3, 34, br[1]); R(g, bx - 8, by - 2, 17, 3, br[2]); R(g, bx - 1, by - 34, 1, 34, br[0]);
      PX.line(g, bx - 18, by - 32 + bs, bx + 18, by - 32 - bs, br[1]); for (const s of [-1, 1]) { const px = bx + s * 18, py = by - 32 - s * bs; PX.line(g, px, py, px - 5, py + 14, br[2]); PX.line(g, px, py, px + 5, py + 14, br[2]); ell(g, px, py + 15, 7, 2, br[1]); R(g, px - 5, py + 14, 6, 1, br[0]); }
      flatCoin(g, bx - 18, by - 32 + bs + 13, true); flatCoin(g, bx - 17, by - 32 + bs + 11, true); }
    frontArms(g, X, YD, t, pose, v, 1);
    if (slide <= 0) flatCoin(g, lerp(X + 6, X + 6, 0), YD + 6, true);
    // brass grille with an arched teller window and a slot at the counter
    const br = COIN(), gb = [mix(br[0], D.n4, 0.35), mix(br[1], D.n3, 0.5), mix(br[2], D.n1, 0.35)];
    R(g, -40, YG - 4, 720, 4, gb[1]); R(g, -40, YG - 4, 720, 1, gb[0]);
    const inWin = (x, y) => Math.abs(x - X) < 40 && (y > 170 || Math.hypot(x - X, (y - 170) * 1.2) < 40);
    const GT = 128;
    for (let x = -36; x < 680; x += 12) {
      if (Math.abs(x - X) < 40) { const top = 176 - Math.sqrt(Math.max(0, 1600 - (x - X) ** 2)) / 1.2; R(g, x, GT, 2, top - GT, gb[1]); R(g, x, GT, 1, top - GT, gb[0]); continue; }
      R(g, x, GT, 2, YG - GT - 4, gb[1]); R(g, x, GT, 1, YG - GT - 4, gb[0]); R(g, x + 2, GT, 1, YG - GT - 4, gb[2]);
    }
    for (const yy of [GT, GT + 22]) { R(g, -40, yy, 720, 3, gb[1]); R(g, -40, yy, 720, 1, gb[0]); R(g, -40, yy + 3, 720, 1, gb[2]); }
    for (let x = -36; x < 680; x += 24) { ell(g, x + 6, GT + 12, 5, 6, gb[2]); ell(g, x + 6, GT + 12, 3, 4, mix(D.n2, D.amber[2], 0.15)); R(g, x + 4, GT + 8, 2, 1, gb[0]); }
    for (let x = -36; x < 680; x += 24) { poly(g, [[x + 2, GT], [x + 6, GT - 8], [x + 10, GT]], gb[1]); R(g, x + 5, GT - 7, 1, 6, gb[0]); }
    // arch frame of the window
    for (let a = 0; a <= 40; a++) { const an = Math.PI + (a / 40) * Math.PI, ax = X + Math.cos(an) * 41, ay = 176 + Math.sin(an) * 34; R(g, ax - 1, ay - 1, 3, 3, gb[1]); R(g, ax - 1, ay - 1, 2, 1, gb[0]); }
    R(g, X - 42, 176, 3, YG - 178, gb[1]); R(g, X + 40, 176, 3, YG - 178, gb[1]); R(g, X - 42, 176, 1, YG - 178, gb[0]);
    R(g, X - 30, YG - 9, 60, 5, mix(D.n1, D.amber[2], 0.15));   // the slot
    R(g, X - 30, YG - 10, 60, 1, gb[0]);
    // counter: customer side (marble top), front panel
    R(g, -40, YG, 720, YF - YG, mb); R(g, -40, YG, 720, 1, mbD);
    for (let i = 0; i < 14; i++) PX.line(g, hash(i, 4) * 640, YG + 2 + hash(i, 5) * 20, hash(i, 4) * 640 + 30, YG + 4 + hash(i, 6) * 20, mix(mb, D.n6, 0.4));
    R(g, -40, YF, 720, 3, mbL); { const wf = woodCols(0.5, 0.35); R(g, -40, YF + 3, 720, 100, wf[1]); for (let x = -20; x < 680; x += 64) { R(g, x, YF + 14, 52, 80, mix(wf[1], wf[2], 0.4)); R(g, x, YF + 14, 52, 1, wf[0]); R(g, x + 51, YF + 14, 1, 80, wf[2]); } }
    // sun patch on the counter + god rays from the window
    A(g, 0.12, () => poly(g, [[468, 52], [560, 52], [380, 272], [180, 272]], D.lamp));
    A(g, 0.1, () => poly(g, [[260, YG + 2], [430, YG + 2], [420, YF - 2], [230, YF - 2]], D.lamp));
    // coin trays on the customer side, the given coin and the growing stack
    R(g, 400, YG + 8, 44, 10, mix(D.n2, D.rust[2], 0.3)); R(g, 400, YG + 8, 44, 1, mix(D.rust[1], D.n3, 0.4)); for (let i = 0; i < 6; i++) flatCoin(g, 406 + i * 6, YG + 13, false);
    if (slide > 0) flatCoin(g, coinX, coinY, true);
    if (si > 0) coinStack(g, X + 4, SY + 1, nShow, drop < 1 ? drop : 0, nDrop);
    // customer from behind, foreground left: bowler hat, coat, hand on the counter
    const cu = mix(mix(D.rust[2], D.n2, 0.55), D.moss[2], 0.15), [cuL, , cuD] = sh3(cu), cs = SKIN.fair, nod = si > 0 && drop < 1 ? 1 : 0, cx1 = 150, cy1 = 214 + nod;
    poly(g, [[cx1 - 70, 380], [cx1 - 66, 290], [cx1 - 56, 268], [cx1 - 30, 256], [cx1 + 30, 256], [cx1 + 56, 268], [cx1 + 66, 290], [cx1 + 72, 380]], cu); R(g, cx1 - 2, 262, 2, 120, cuD);
    poly(g, [[cx1 + 40, 258], [cx1 + 62, 280], [cx1 + 72, 380], [cx1 + 52, 380]], cuL);
    poly(g, [[cx1 - 70, 380], [cx1 - 62, 280], [cx1 - 50, 270], [cx1 - 54, 380]], cuD);
    R(g, cx1 - 12, 252, 24, 8, mix(D.cream, D.paper, 0.3)); R(g, cx1 - 9, 244, 18, 10, mix(cs, D.n0, 0.15));
    ell(g, cx1, 228, 17, 19, mix(HAIR.dark, D.n1, 0.2)); R(g, cx1 + 15, 222, 3, 10, mix(cs, D.n0, 0.1)); R(g, cx1 - 18, 222, 3, 10, mix(cs, D.n0, 0.2));
    const hc = mix(D.n1, D.steel[2], 0.15); ell(g, cx1, cy1 - 4, 28, 6, hc); ell(g, cx1, cy1 - 14, 18, 14, hc); R(g, cx1 - 18, cy1 - 9, 36, 4, mix(hc, D.rust[2], 0.3)); R(g, cx1 + 4, cy1 - 26, 10, 2, mix(hc, D.lamp, 0.25)); R(g, cx1 + 18, cy1 - 6, 10, 1, mix(hc, D.lamp, 0.3));
    seg(g, cx1 + 50, 286, cx1 + 96, YF - 4, 18, cu); seg(g, cx1 + 52, 280, cx1 + 96, YF - 10, 4, cuL);
    R(g, cx1 + 92, YF - 12, 10, 8, mix(D.cream, D.paper, 0.3)); ell(g, cx1 + 108, YF - 8, 8, 5, cs); R(g, cx1 + 103, YF - 12, 8, 1, mix(cs, D.cream, 0.3)); for (let f = 0; f < 3; f++) R(g, cx1 + 110 + f * 2, YF - 5, 1, 2, mix(cs, D.n0, 0.3));
    dust(g, 41, 30, t, [300, 60, 220, 200], D.lamp, 0.45);
    PX.vignette(g, 0.5);
  };

  // ======================= italy =======================
  // 1500s Italy: a public maths contest in a sunlit piazza. Two mathematicians sit at a cloth-covered table, chalking
  // equations (scribbles) on slates, a small crowd behind them. At o.trick (2.5) a small softly glowing "?" appears on the
  // left man's slate (his strange trick); the rival glances over and scoffs (o.scoff, default trick + 0.6), then goes back.
  const TART = { skin: SKIN.olive, hair: HAIR.black, hairStyle: "beret", hatCol: mix(D.n1, D.rust[2], 0.2), beard: "full", top: mix(mix(D.rust[2], D.n2, 0.35), D.plum[2], 0.15), shirt: D.cream, collar: "plain", cuff: mix(D.cream, D.paperD, 0.3) };
  const RIVAL = { skin: SKIN.warm, hair: HAIR.brown, hairStyle: "coif", hatCol: mix(D.rust[1], D.n2, 0.35), beard: null, top: mix(D.moss[2], D.teal[2], 0.35), shirt: D.cream, collar: "plain", cuff: mix(D.cream, D.paperD, 0.3) };
  // a standing onlooker, base (x, y), height h; pal { robe, skin, hair, hat }
  const standee = (g, x, y, h, pal, t, ph, look) => {
    const bob = Math.sin(t * 1.3 + ph) > 0.6 ? 1 : 0, hr = Math.max(3, Math.round(h * 0.1)), hy = Math.round(y - h + hr + bob), [rL, rb, rD] = sh3(pal.robe);
    shadow(g, 0.3, () => poly(g, [[x - h * 0.2, y], [x + h * 0.2, y], [x + h * 0.6, y + 6], [x + h * 0.2, y + 6]], BLK));
    poly(g, [[x - h * 0.16, hy + hr + 2], [x + h * 0.16, hy + hr + 2], [x + h * 0.22, y], [x - h * 0.22, y]], rb);
    poly(g, [[x - h * 0.16, hy + hr + 2], [x - h * 0.08, hy + hr + 2], [x - h * 0.12, y], [x - h * 0.22, y]], rL);
    poly(g, [[x + h * 0.08, hy + hr + 2], [x + h * 0.16, hy + hr + 2], [x + h * 0.22, y], [x + h * 0.12, y]], rD);
    R(g, x - h * 0.15, hy + hr + Math.round(h * 0.28), h * 0.3, 2, mix(rb, D.n0, 0.35));   // belt
    for (const sd of [-1, 1]) { seg(g, x + sd * h * 0.17, hy + hr + 4, x + sd * h * 0.2, hy + hr + h * 0.4, 4, sd < 0 ? rL : rD); R(g, x + sd * h * 0.2 - 1, hy + hr + h * 0.4, 3, 3, pal.skin); }
    R(g, x - 2, hy + hr - 1, 4, 4, mix(pal.skin, D.n0, 0.25));
    PX.circle(g, x, hy, hr, pal.skin); R(g, x - hr, hy - 1, 2, 3, mix(pal.skin, D.cream, 0.2));
    const lx = Math.round(look || 0);
    if (hr >= 4) { R(g, x - 2 + lx, hy, 1, 1, D.n1); R(g, x + 2 + lx, hy, 1, 1, D.n1); R(g, x - 1 + lx, hy + 2, 3, 1, mix(pal.skin, D.n0, 0.3)); }
    if (pal.hat) { ell(g, x, hy - hr + 1, hr + 2, Math.max(2, hr * 0.5), pal.hat); R(g, x - hr - 1, hy - hr + 1, 2 * hr + 3, 1, mix(pal.hat, D.n0, 0.3)); }
    else { ell(g, x, hy - hr + 2, hr, Math.max(2, hr * 0.6), pal.hair); R(g, x - hr, hy - hr + 2, 2, hr, pal.hair); R(g, x + hr - 1, hy - hr + 2, 2, hr, pal.hair); }
    if (pal.veil) { R(g, x - hr - 1, hy - hr, 2 * hr + 3, hr * 2 + 2, pal.veil); PX.circle(g, x, hy + 1, hr - 1, pal.skin); R(g, x - 2 + lx, hy + 1, 1, 1, D.n1); R(g, x + 2 + lx, hy + 1, 1, 1, D.n1); }
    if (pal.point) { const a = pal.point * Math.min(1, 1); seg(g, x - h * 0.12, hy + hr + 6, x - h * 0.12 - 10 * a, hy + hr + 2 - 4 * a, 3, rb); R(g, x - h * 0.12 - 11 * a, hy + hr + 1 - 4 * a, 2, 2, pal.skin); }
  };
  const piazza = (g, t, c) => {
    const sky = [mix(D.steel[0], D.cream, 0.35), mix(D.cream, D.lamp, 0.35)];
    const och = mix(mix(D.amber[2], D.paperD, 0.55), D.rust[2], 0.12), terr = mix(mix(D.rust[1], D.paperD, 0.4), D.n4, 0.15), shd = (cc) => mix(cc, D.steel[2], 0.35);
    PX.par(g, c, 0.2, () => {
      PX.vgrad(g, -40, -40, 720, 200, sky[0], sky[1], 8);
      for (let k = 0; k < 3; k++) { const cx = ((k * 230 + t * 3) % 820) - 90, cy = 26 + k * 18; A(g, 0.5, () => { ell(g, cx, cy, 34, 6, D.cream); ell(g, cx + 16, cy - 4, 18, 6, D.cream); }); }
      // campanile at the back left, dome far right
      const ct = mix(terr, D.steel[0], 0.25);
      R(g, 70, 20, 34, 200, ct); R(g, 70, 20, 4, 200, mix(ct, D.cream, 0.2)); R(g, 98, 20, 6, 200, shd(ct));
      for (const yy of [40, 70]) { R(g, 78, yy, 7, 14, mix(D.n2, D.steel[2], 0.2)); R(g, 90, yy, 7, 14, mix(D.n2, D.steel[2], 0.2)); ell(g, 81, yy, 3, 2, mix(D.n2, D.steel[2], 0.2)); ell(g, 93, yy, 3, 2, mix(D.n2, D.steel[2], 0.2)); }
      R(g, 66, 16, 42, 5, mix(ct, D.cream, 0.15)); poly(g, [[70, 16], [87, -14], [104, 16]], mix(D.rust[2], D.n3, 0.3));
      ell(g, 560, 74, 34, 26, mix(mix(D.rust[1], D.paperD, 0.5), D.steel[0], 0.3)); R(g, 526, 74, 68, 40, mix(och, D.steel[0], 0.3)); R(g, 558, 40, 4, 10, mix(D.n4, D.steel[0], 0.3));
      for (let k = 0; k < 7; k++) R(g, 532 + k * 9, 60 + Math.abs(3 - k) * 2, 1, 14, mix(D.rust[2], D.steel[0], 0.3));
    });
    PX.par(g, c, 0.4, () => {
      // facades: ochre and terracotta houses with shutters, a loggia with arches across the back
      const houses = [[-30, 70, 120, och], [90, 96, 110, terr], [200, 60, 150, och], [350, 88, 130, terr], [480, 80, 190, och]];
      for (const [hx0, hy0, hw, hc] of houses) {
        R(g, hx0, hy0, hw, 230 - hy0, hc); R(g, hx0, hy0 - 6, hw, 6, mix(D.rust[2], D.n2, 0.25)); R(g, hx0 - 2, hy0 - 7, hw + 4, 2, mix(D.rust[1], D.n3, 0.25));
        for (let k = 0; k < Math.floor(hw / 26); k++) { const wx = hx0 + 10 + k * 26, wy = hy0 + 14; R(g, wx, wy, 10, 16, mix(D.n2, D.steel[2], 0.25)); R(g, wx - 4, wy, 4, 16, mix(D.moss[2], D.n3, 0.25)); R(g, wx + 10, wy, 4, 16, mix(D.moss[2], D.n3, 0.35)); R(g, wx - 2, wy + 16, 14, 2, mix(hc, D.cream, 0.3)); }
        R(g, hx0 + hw - 6, hy0, 6, 230 - hy0, shd(hc));
      }
      const lg = mix(D.paper, D.paperD, 0.4);
      R(g, -40, 140, 720, 8, lg); R(g, -40, 140, 720, 1, mix(lg, D.cream, 0.4));
      for (let k = 0; k < 13; k++) { const ax = -20 + k * 54; R(g, ax, 148, 8, 82, lg); R(g, ax + 6, 148, 2, 82, shd(lg)); R(g, ax + 8, 156, 46, 74, mix(D.n2, D.rust[2], 0.2)); ell(g, ax + 31, 158, 23, 12, mix(D.n2, D.rust[2], 0.2)); R(g, ax + 8, 146, 46, 4, lg); }
      for (let k = 0; k < 13; k++) { const ax = -20 + k * 54; ell(g, ax + 31, 153, 23, 4, lg); }
      // a striped awning and a hanging banner moving in the breeze
      for (let k = 0; k < 8; k++) poly(g, [[440 + k * 12, 132], [452 + k * 12, 132], [455 + k * 12, 146], [443 + k * 12, 146]], k % 2 ? mix(D.cream, D.paperD, 0.2) : mix(D.rust[1], D.n3, 0.2));
      const fx = 290; PX.line(g, fx, 50, fx, 96, D.n3); for (let j = 0; j < 22; j++) { const w = Math.sin(t * 2.2 - j * 0.4) * 2; R(g, fx + 1 + j, 52 + w, 1, 14 - j * 0.2, j % 8 < 4 ? mix(D.steel[1], D.n3, 0.2) : mix(D.amber[1], D.paperD, 0.3)); }
      A(g, 0.22, () => poly(g, [[420, 60], [720, 60], [720, 232], [300, 232]], mix(D.steel[2], D.n1, 0.3)));   // a building's shadow across the right facades
      // piazza paving far
      R(g, -40, 230, 720, 30, mix(D.paperD, D.n4, 0.3));
      for (let k = 0; k < 30; k++) PX.line(g, k * 26 - 40, 230, k * 34 - 140, 260, mix(D.paperD, D.n5, 0.45));
    });
  };
  // slate on the table: centre (x, y), w; chalk prog; q = "?" glow 0..1
  const slate = (g, x, y, w, prog, seed, q, t) => {
    const fr = woodCols(0.4, 0.4), sl = mix(D.n2, D.teal[2], 0.25), h = Math.round(w * 0.42);
    shadow(g, 0.4, () => poly(g, [[x - w / 2 + 3, y + 2], [x + w / 2 + 3, y + 2], [x + w / 2 + 6, y + h + 3], [x - w / 2 + 4, y + h + 3]], BLK));
    poly(g, [[x - w / 2 + 3, y], [x + w / 2 - 3, y], [x + w / 2, y + h], [x - w / 2, y + h]], fr[1]);
    poly(g, [[x - w / 2 + 6, y + 2], [x + w / 2 - 6, y + 2], [x + w / 2 - 3, y + h - 2], [x - w / 2 + 3, y + h - 2]], sl);
    R(g, x - w / 2, y + h, w, 1, fr[2]); R(g, x - w / 2 + 3, y, w - 6, 1, fr[0]);
    const ck = mix(D.cream, sl, 0.25);
    for (let l = 0; l < 4; l++) { const lp = clamp(prog * 4 - l, 0, 1); if (lp > 0) scribble(g, x - w / 2 + 8 + l, y + 4 + l * 4, (w - 18) * (0.6 + 0.4 * hash(seed, l)), seed * 5 + l, ck, lp, 2); }
    if (q > 0) {
      const qx = x + w / 2 - 16, qy = y + h - 13, qc = mix(D.amber[0], D.cream, 0.4);
      PX.glow(g, qx + 2, qy + 4, 16, D.amber[0], 0.3 * q);
      A(g, q, () => PX.sprite(g, [".###.", "#...#", "....#", "..##.", "..#..", ".....", "..#.."], qx, qy, { "#": qc }, 1));
    }
  };
  K.italy = (o) => (g, t, d, c) => {
    t = Math.max(0, t);
    const T = tm(o, d, 6.0), tTr = T("trick", 2.5), tSc = typeof o.scoff === "number" ? o.scoff : tTr + (0.6 * d) / 6;
    const q = P(t, tTr, 0.6, "io"), sc = bump(t, tSc, 0.3, tSc + 1.3, 0.5);
    const X1 = 238, X2 = 404, YD = 252, YF = 282;
    piazza(g, t, c);
    PX.vgrad(g, -40, 246, 720, 80, mix(D.paperD, D.n4, 0.32), mix(D.paperD, D.n4, 0.22), 4);
    for (let k = 0; k < 40; k++) { R(g, (k * 37) % 680 - 20, 252 + (k * 13) % 70, 18, 1, mix(D.paperD, D.n5, 0.45)); }
    // the crowd behind the table
    const CROWD = [[150, 0.85, 0], [178, 0.92, 1], [206, 0.8, 2], [300, 0.9, 3], [326, 0.82, 4], [352, 0.95, 5], [470, 0.88, 6], [498, 0.8, 7], [530, 0.93, 8], [118, 0.78, 9], [560, 0.84, 10]];
    const robes = [mix(D.steel[2], D.n3, 0.3), mix(D.rust[2], D.n3, 0.3), mix(D.moss[2], D.n3, 0.3), mix(D.paperD, D.n4, 0.3), mix(D.amber[2], D.n3, 0.35), mix(D.plum[2], D.n3, 0.4), mix(D.teal[2], D.n3, 0.3)];
    for (const [cx, kk, i] of CROWD) {
      const pal = { robe: robes[i % robes.length], skin: [SKIN.olive, SKIN.warm, SKIN.fair][i % 3], hair: [HAIR.black, HAIR.dark, HAIR.brown][i % 3], hat: i % 3 === 0 ? mix(D.n1, D.rust[2], 0.25) : i % 4 === 1 ? mix(D.rust[2], D.n2, 0.3) : null, veil: i === 4 || i === 8 ? mix(D.cream, D.paperD, 0.3) : null, point: i === 3 ? P(t, tTr + 0.3, 0.4, "out") * (t < tTr + 2.6 ? 1 : 0) : 0 };
      standee(g, cx, 246, 66 * kk, pal, t, i * 1.7, t > tTr ? (cx < 320 ? 1 : -1) * (i % 2) : 0);
    }
    // pigeons on the paving
    for (const [px, ph] of [[96, 0], [560, 2]]) { const hop = Math.max(0, Math.sin(t * 2 + ph)) * 2, pc = mix(D.n5, D.steel[1], 0.3); ell(g, px, 318 - hop, 4, 3, pc); R(g, px + 3, 314 - hop, 3, 3, mix(pc, D.n7, 0.3)); R(g, px + 6, 315 - hop, 1, 1, D.amber[1]); R(g, px - 5, 317 - hop, 2, 1, pc); }
    // the two contestants
    const wr1 = t < tTr - 0.1 || t > tTr + 0.9 ? 1 : 0, [w1x, w1y] = penWobble(t, wr1, 14), pen1 = [X1 + 4 + w1x, YD + 12 + Math.round(w1y)];
    const p1 = { down: 1, smile: t > tTr + 0.2 && t < tTr + 1.5 ? 1 : 0, hR: wr1 ? penHand(pen1[0], pen1[1]) : [X1 + 18, YD + 10], hL: [X1 - 22, YD + 14], toolR: "chalk", pen: wr1 ? pen1 : [X1 + 14, YD + 13], ph: 0.5 };
    const wr2 = sc < 0.1 ? 1 : 0, [w2x, w2y] = penWobble(t + 1.3, wr2, 14), pen2 = [X2 + 4 + w2x, YD + 12 + Math.round(w2y)];
    const p2 = { down: sc > 0.3 ? 0 : 1, look: sc > 0.3 ? 0.6 : 0, scoff: sc > 0.4 ? 1 : 0, glance: sc > 0.3 ? -1 : 0, tilt: sc > 0.3 ? -1 : 0, hR: wr2 ? penHand(pen2[0], pen2[1]) : [X2 + 18, YD + 10], hL: sc > 0.3 ? [X2 - 26, YD + 2] : [X2 - 22, YD + 14], toolR: "chalk", pen: wr2 ? pen2 : [X2 + 14, YD + 13], ph: 2 };
    frontBody(g, X1, YD, t, p1, TART, -1); frontBody(g, X2, YD, t, p2, RIVAL, -1);
    // the table with a cloth
    const cl = mix(D.teal[2], D.n2, 0.25), [clL, , clD] = sh3(cl);
    poly(g, [[150, YD], [490, YD], [500, YF], [140, YF]], mix(cl, D.paperD, 0.1)); PX.line(g, 150, YD, 490, YD, clD);
    R(g, 140, YF, 360, 40, cl); R(g, 140, YF, 360, 2, clL); for (let k = 0; k < 9; k++) R(g, 150 + k * 40, YF + 2, 2, 38, clD);
    for (let k = 0; k < 90; k++) R(g, 141 + k * 4, YF + 40, 2, 3, mix(D.amber[1], D.paperD, 0.4));   // fringe
    shadow(g, 0.35, () => poly(g, [[140, YF + 43], [500, YF + 43], [580, 344], [200, 344]], BLK)); PX.glow(g, 40, 20, 300, D.lamp, 0.12);
    shadow(g, 0.2, () => { for (const xx of [X1, X2]) poly(g, [[xx - 4, YD + 1], [xx + 30, YD + 1], [xx + 44, YD + 26], [xx + 10, YD + 26]], BLK); });
    slate(g, X1 + 2, YD + 6, 58, clamp(t / (2.2 * d / 6), 0, 1), 3, q, t);
    slate(g, X2 + 2, YD + 6, 58, clamp(t / (3.0 * d / 6), 0, 1), 4, 0, t);
    // hourglass and a purse of coins for the prize
    const hx = 320, hy = YD + 20, wd = woodCols(0.4, 0.4), sand = mix(D.amber[1], D.paperD, 0.4), sp = clamp(t / 30, 0, 1);
    R(g, hx - 7, hy - 1, 15, 2, wd[2]); R(g, hx - 7, hy - 26, 15, 2, wd[2]); R(g, hx - 7, hy - 25, 1, 24, wd[1]); R(g, hx + 7, hy - 25, 1, 24, wd[1]);
    poly(g, [[hx - 5, hy - 24], [hx + 6, hy - 24], [hx + 1, hy - 13], [hx, hy - 13]], mix(D.glass, D.cream, 0.3)); poly(g, [[hx, hy - 12], [hx + 1, hy - 12], [hx + 6, hy - 1], [hx - 5, hy - 1]], mix(D.glass, D.cream, 0.3));
    poly(g, [[hx - 4 + sp * 3, hy - 22 + sp * 8], [hx + 5 - sp * 3, hy - 22 + sp * 8], [hx + 1, hy - 13], [hx, hy - 13]], sand); poly(g, [[hx - 5, hy - 2], [hx + 6, hy - 2], [hx + 1, hy - 7 - sp * 3], [hx, hy - 7 - sp * 3]], sand); R(g, hx, hy - 12, 1, 5, sand);
    const pu = mix(D.rust[2], D.n2, 0.3); ell(g, 350, hy - 5, 8, 6, pu); R(g, 346, hy - 13, 8, 3, pu); R(g, 345, hy - 12, 10, 1, mix(D.amber[1], D.n3, 0.3)); flatCoin(g, 362, hy - 1, true); flatCoin(g, 358, hy + 1, true);
    frontArms(g, X1, YD, t, p1, TART, -1); frontArms(g, X2, YD, t, p2, RIVAL, -1);
    if (t > tSc + 0.35 && t < tSc + 1.3) { const u = (t - tSc - 0.35) / 0.95; for (let k = 0; k < 3; k++) A(g, 0.5 * Math.sin(u * Math.PI), () => R(g, X2 - 6 - u * 10 - k * 3, YD - 52 - u * 4 + k, 2, 1, D.cream)); }
    // near paving, sunlit, with cast shadows
    PX.vgrad(g, -40, 322, 720, 50, mix(D.paperD, D.n4, 0.2), mix(D.paperD, D.n4, 0.35), 3);
    for (let k = 0; k < 24; k++) { R(g, k * 30 - 10 + (k % 2) * 8, 330, 22, 1, mix(D.paperD, D.n5, 0.5)); R(g, k * 34 - 20 + (k % 2) * 10, 346, 26, 1, mix(D.paperD, D.n5, 0.5)); }
    // foreground: a stone well rim at the right edge, a shadow of a column at the left
    { const cw = woodCols(0.4, 0.4); shadow(g, 0.35, () => R(g, 560, 360 - 4, 90, 6, BLK)); R(g, 566, 300, 80, 60, cw[1]); for (let k = 0; k < 4; k++) R(g, 566, 304 + k * 15, 80, 2, cw[2]); R(g, 566, 300, 80, 1, cw[0]); R(g, 566, 300, 3, 60, cw[0]);
      for (let k = 0; k < 9; k++) { const fx = 572 + (k % 5) * 14 + (k > 4 ? 7 : 0), fy = 296 - (k > 4 ? 6 : 0); PX.circle(g, fx, fy, 5, k % 3 ? mix(D.amber[1], D.rust[1], 0.4) : mix(D.moss[1], D.amber[1], 0.4)); R(g, fx - 2, fy - 3, 2, 1, D.cream); } }
    shadow(g, 0.22, () => poly(g, [[-40, 300], [30, 300], [120, 372], [-40, 372]], BLK));
    PX.vignette(g, 0.4);
  };

  // ======================= side-view figure =======================
  // seated (or standing) in profile, facing +x (dir 1) or -x (dir -1); (x, y) = hip joint.
  // v = { skin, hair, hairStyle: wig17|wig40|cap|short, top (coat), vest, shirt, breeches, stock (stockings), hatCol }
  // P = { lean 0..1 (back), hunch 0..1, stand, hN [x,y] near hand, hF far hand (local, relative to hip, +x forward),
  //       tool: quill, talk, eyes: open|closed, brow, smile, oh, nod }
  const sideFig = (g, x, y, t, P, v, dir) => {
    g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(dir, 1);
    const lb = P.lean || 0, hu = P.hunch || 0, br = Math.sin(t * 1.6 + (P.ph || 0)) > 0.3 ? 1 : 0, st = P.stand;
    const S = [Math.round(6 * hu - 13 * lb), Math.round(-32 + hu + 3 * lb - br)], Hc = [S[0] + Math.round(4 + 3 * hu - 3 * lb), S[1] - 13 + Math.round(2 * hu + (P.nod || 0))];
    const [cL, cc, cD] = sh3(v.top), sk = v.skin, sL = mix(sk, D.cream, 0.25), sD = mix(sk, D.n0, 0.3), [hL, hr, hD] = sh3(v.hair);
    const bre = v.breeches || mix(v.top, D.n0, 0.15), stk = v.stock || mix(D.paper, D.n4, 0.3);
    const arm = (tgt, far) => {
      if (!tgt) return;
      const J = [S[0], S[1] + 4], a1 = ik(J[0], J[1], tgt[0], tgt[1], 17, 16, 1), a2 = ik(J[0], J[1], tgt[0], tgt[1], 17, 16, -1), [ex, ey, hx1, hy1] = a1[1] > a2[1] ? a1 : a2;
      const col = far ? mix(cc, D.n0, 0.3) : cc;
      seg(g, J[0], J[1], ex, ey, 9, col); if (!far) seg(g, J[0] - 2, J[1], ex - 2, ey, 2, cD);
      seg(g, ex, ey, hx1, hy1, 7, col); if (!far) seg(g, ex, ey - 2, hx1, hy1 - 2, 1, cL);
      R(g, hx1 - 3, hy1 - 3, 5, 6, far ? mix(D.cream, D.n3, 0.4) : mix(D.cream, D.paper, 0.3));   // cuff
      ell(g, hx1 + 2, hy1, 3, 3, far ? sD : sk); if (!far) R(g, hx1 + 1, hy1 - 3, 3, 1, sL);
      if (!far && P.tool === "quill") { PX.line(g, hx1 + 4, hy1 + 2, hx1 + 9, hy1 - 12, mix(D.paperD, D.n4, 0.2)); for (let k = 0; k < 9; k++) { R(g, hx1 + 6 + k * 0.4, hy1 - 4 - k, 1, 1, D.cream); R(g, hx1 + 4 + k * 0.4, hy1 - 3 - k, 2, 1, k > 6 ? mix(D.cream, D.paperD, 0.4) : D.cream); } }
    };
    // far leg, far arm
    const legs = (far) => {
      const o = far ? 3 : 0, bc = far ? mix(bre, D.n0, 0.3) : bre, sc = far ? mix(stk, D.n0, 0.3) : stk;
      if (st) { seg(g, 1 - o, 2, 2 - o, 24, 10, bc); seg(g, 2 - o, 22, 2 - o, 46, 7, sc); ell(g, 5 - o, 48, 6, 2, D.n0); R(g, 4 - o, 46, 3, 1, mix(D.amber[1], D.n3, 0.3)); }
      else { seg(g, 0, 2 - o, 24, 2 - o, 11, bc); seg(g, 24, 2 - o, 26, 28 - o, 7, sc); ell(g, 29, 30 - o, 6, 2, D.n0); R(g, 27, 28 - o, 3, 1, mix(D.amber[1], D.n3, 0.3)); }
    };
    legs(true); arm(P.hF, true); legs(false);
    // torso + coat
    poly(g, [[-10, 3], [-10, -10], [S[0] - 9, S[1] + 2], [S[0] - 4, S[1] - 2], [S[0] + 6, S[1]], [S[0] + 9, S[1] + 6], [10, -8], [11, 3]], cc);
    poly(g, [[-10, 3], [-10, -10], [S[0] - 9, S[1] + 2], [S[0] - 5, S[1] + 4], [-6, -8], [-6, 3]], cL);
    if (v.vest) poly(g, [[S[0] + 5, S[1] + 2], [S[0] + 9, S[1] + 6], [10, -6], [7, -4]], v.vest);
    poly(g, [[-12, 2], [12, 0], st ? [10, 22] : [17, 10], st ? [-10, 24] : [-13, 13]], mix(cc, D.n0, 0.12)); R(g, st ? -10 : -13, st ? 23 : 12, st ? 20 : 30, 1, cD);
    R(g, S[0] + 5, S[1] - 1, 4, 6, v.shirt || D.cream); R(g, S[0] + 7, S[1] + 3, 3, 4, mix(v.shirt || D.cream, D.paperD, 0.3));   // stock / cravat
    // head: neck, skull, profile
    R(g, S[0] + 1, S[1] - 6, 6, 7, sD);
    ell(g, Hc[0], Hc[1], 9, 11, sk); ell(g, Hc[0] - 2, Hc[1] - 2, 5, 7, mix(sk, sD, 0.25));
    R(g, Hc[0] + 8, Hc[1] - 6, 2, 6, sk); poly(g, [[Hc[0] + 9, Hc[1] - 1], [Hc[0] + 12, Hc[1] + 3], [Hc[0] + 9, Hc[1] + 4]], sk); R(g, Hc[0] + 10, Hc[1] + 3, 1, 1, sD);   // brow ridge + nose
    R(g, Hc[0] + 6, Hc[1] + 8, 4, 3, sk); R(g, Hc[0] + 3, Hc[1] + 10, 6, 1, sD);   // chin
    R(g, Hc[0] + 7, Hc[1] - 5, 2, 2, sL);
    const ey = Hc[1] - 1;
    if (P.eyes === "closed") { R(g, Hc[0] + 4, ey + 1, 3, 1, mix(sD, D.n0, 0.4)); }
    else { R(g, Hc[0] + 5, ey, 3, 2, mix(D.cream, sk, 0.3)); R(g, Hc[0] + 6 + (P.lookDown ? 0 : 1), ey + (P.lookDown ? 1 : 0), 1, 2 - (P.lookDown ? 1 : 0), D.n0); }
    R(g, Hc[0] + 4, ey - 3 - Math.round((P.brow || 0) * 2), 5, 1, hD);
    if (P.talk) { R(g, Hc[0] + 6, Hc[1] + 5, 3, 2, mix(D.rust[2], D.n0, 0.5)); }
    else if (P.oh) { R(g, Hc[0] + 7, Hc[1] + 5, 2, 2, mix(D.rust[2], D.n0, 0.5)); }
    else if (P.smile) { R(g, Hc[0] + 6, Hc[1] + 6, 3, 1, sD); R(g, Hc[0] + 5, Hc[1] + 5, 1, 1, sD); }
    else R(g, Hc[0] + 6, Hc[1] + 5, 3, 1, sD);
    R(g, Hc[0] - 2, Hc[1] - 1, 3, 5, sD); R(g, Hc[0] - 1, Hc[1], 1, 3, sk);   // ear
    if (v.age > 0.5) { R(g, Hc[0] + 3, ey + 3, 2, 1, sD); R(g, Hc[0] + 5, Hc[1] + 7, 1, 1, sD); }
    // hair / wig
    const hs = v.hairStyle;
    if (hs === "wig17") {   // full-bottomed periwig falling past the shoulders
      ell(g, Hc[0] - 3, Hc[1] - 4, 11, 10, hr); ell(g, Hc[0] - 6, Hc[1] + 10, 9, 14, hr); ell(g, Hc[0] + 2, Hc[1] - 10, 8, 4, hr);
      for (let k = 0; k < 12; k++) { const cx = Hc[0] - 12 + (k % 4) * 5, cy = Hc[1] - 6 + Math.floor(k / 4) * 9; R(g, cx, cy, 2, 1, hL); R(g, cx + 1, cy + 2, 2, 1, hD); }
      R(g, Hc[0] - 1, Hc[1] - 13, 6, 1, hL); ell(g, Hc[0] + 1, Hc[1] + 2, 4, 5, sk); R(g, Hc[0] - 3, Hc[1] + 4, 3, 16, hD);
    } else if (hs === "wig40") {   // powdered wig with side rolls and a queue tied with a black ribbon
      ell(g, Hc[0] - 1, Hc[1] - 6, 10, 7, hr); R(g, Hc[0] - 10, Hc[1] - 6, 6, 8, hr);
      for (const yy of [0, 4]) { ell(g, Hc[0] - 3, Hc[1] + yy, 4, 2, hr); R(g, Hc[0] - 5, Hc[1] + yy - 1, 3, 1, hL); }
      seg(g, Hc[0] - 10, Hc[1] + 1, Hc[0] - 13, Hc[1] + 14, 3, hr); R(g, Hc[0] - 14, Hc[1] + 3, 5, 3, D.n0); R(g, Hc[0] - 16, Hc[1] + 5, 3, 3, D.n0);
      R(g, Hc[0] - 5, Hc[1] - 12, 8, 1, hL);
    } else if (hs === "cap") {
      const ccap = v.hatCol || mix(D.paper, D.rust[2], 0.2), [kL, , kD] = sh3(ccap);
      ell(g, Hc[0] - 1, Hc[1] - 7, 11, 8, ccap); R(g, Hc[0] - 11, Hc[1] - 4, 20, 3, kD); ell(g, Hc[0] - 3, Hc[1] - 10, 6, 3, kL); R(g, Hc[0] - 9, Hc[1] - 1, 3, 5, hr);
    } else {   // short
      ell(g, Hc[0] - 1, Hc[1] - 6, 10, 6, hr); R(g, Hc[0] - 10, Hc[1] - 6, 5, 9, hr); R(g, Hc[0] + 5, Hc[1] - 10, 4, 3, hr); R(g, Hc[0] - 4, Hc[1] - 11, 7, 1, hL);
    }
    arm(P.hN, false);
    g.restore();
    return { S, Hc };
  };

  // ======================= euler_blind =======================
  // 1770s St Petersburg study on a snowy afternoon: the old Euler in a robe and soft cap sits in a wing chair by the tall
  // window, eyes closed (one eye scarred shut), dictating (o.dictate 0.5: mouth moving, hand gesturing); a young helper
  // at a desk writes quickly and from o.pages (3.0) finished sheets pile up beside him. Snow falls outside, the tiled
  // stove glows, the helper's candle flickers.
  const EULER_OLD = { skin: SKIN.fair, hair: HAIR.white, hairStyle: "cap", hatCol: mix(mix(D.paperD, D.rust[2], 0.3), D.n4, 0.15), top: mix(mix(D.rust[2], D.amber[2], 0.35), D.n2, 0.35), lapel: mix(D.amber[2], D.n2, 0.3), shirt: D.cream, collar: "robe", cuff: D.cream, age: 0.9 };
  const HELPER = { skin: SKIN.warm, hair: HAIR.brown, hairStyle: "short", top: mix(D.steel[2], D.n2, 0.25), vest: mix(D.paperD, D.n3, 0.2), shirt: D.cream, breeches: mix(D.n2, D.steel[2], 0.2), stock: mix(D.paper, D.n4, 0.3) };
  K.euler_blind = (o) => (g, t, d, c) => {
    t = Math.max(0, t);
    const T = tm(o, d, 10.0), tD = T("dictate", 0.5), tP = T("pages", 3.0), k = d / 10;
    const fl = flick(t, 4), wd = woodCols(0.5, 0.35);
    const wall = mix(mix(D.steel[2], D.paperD, 0.35), D.n3, 0.35), wallD = mix(wall, D.n0, 0.25);
    R(g, 0, 0, 640, 360, D.n1);
    PX.par(g, c, 0.4, () => {
      R(g, -40, -40, 720, 380, wall);
      for (let x = -40; x < 700; x += 60) { R(g, x, 40, 1, 200, mix(wall, D.cream, 0.08)); R(g, x + 30, 40, 1, 200, wallD); }   // panelling
      R(g, -40, 30, 720, 6, mix(wall, D.cream, 0.15)); R(g, -40, 190, 720, 4, wd[1]); R(g, -40, 194, 720, 80, mix(wall, D.n0, 0.12));
      for (let x = -30; x < 700; x += 48) { R(g, x, 202, 40, 54, mix(wall, D.n0, 0.18)); R(g, x, 202, 40, 1, mix(wall, D.cream, 0.1)); }
      // tall window: snowy St Petersburg, a golden spire, the frozen river
      const wx = 46, wy = 44, ww = 104, wh = 176;
      R(g, wx - 10, wy - 8, ww + 20, wh + 18, mix(wall, D.cream, 0.15)); R(g, wx - 6, wy - 4, ww + 12, wh + 8, wallD);
      clipR(g, wx, wy, ww, wh, () => {
        PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[0], D.n6, 0.4), mix(D.cream, D.steel[0], 0.4), 8);
        const fb = mix(D.steel[1], D.n6, 0.45);
        R(g, wx, wy + 120, ww, 60, mix(D.cream, D.steel[0], 0.35));   // frozen river
        R(g, wx, wy + 104, ww, 16, fb); for (let k2 = 0; k2 < 9; k2++) R(g, wx + 4 + k2 * 11, wy + 108, 5, 6, mix(fb, D.n3, 0.3));
        R(g, wx + 58, wy + 60, 8, 50, fb); poly(g, [[wx + 58, wy + 60], [wx + 62, wy + 6], [wx + 66, wy + 60]], mix(D.amber[1], D.n6, 0.35)); R(g, wx + 61, wy + 2, 2, 6, mix(D.amber[1], D.n6, 0.35));
        R(g, wx + 10, wy + 92, 40, 14, fb); poly(g, [[wx + 10, wy + 92], [wx + 30, wy + 82], [wx + 50, wy + 92]], fb);
        PX.particles(g, 61, 40, t, [wx, wy, ww, wh], { vy: 14, vx: -3, col: D.cream, a: 0.85, tw: 2 });
        PX.particles(g, 62, 20, t, [wx, wy, ww, wh], { vy: 22, vx: -5, col: D.cream, a: 0.9, size: 2, tw: 3 });
      });
      for (let k2 = 1; k2 < 3; k2++) R(g, wx + (ww * k2) / 3 - 1, wy, 3, wh, mix(D.cream, D.paperD, 0.3)); for (let k2 = 1; k2 < 5; k2++) R(g, wx, wy + (wh * k2) / 5 - 1, ww, 3, mix(D.cream, D.paperD, 0.3));
      R(g, wx - 8, wy + wh, ww + 16, 6, mix(D.cream, D.paperD, 0.25)); for (let k2 = 0; k2 < 12; k2++) R(g, wx + 2 + k2 * 9, wy + wh - 4, 6, 4, D.cream);   // snow on the sill
      // drapes
      const dr = mix(D.moss[2], D.n2, 0.35), [drL, , drD] = sh3(dr);
      poly(g, [[wx - 18, wy - 14], [wx + 8, wy - 14], [wx - 2, wy + 90], [wx + 4, wy + wh + 40], [wx - 18, wy + wh + 40]], dr); poly(g, [[wx + ww + 18, wy - 14], [wx + ww - 8, wy - 14], [wx + ww + 2, wy + 90], [wx + ww - 4, wy + wh + 40], [wx + ww + 18, wy + wh + 40]], dr);
      for (let k2 = 0; k2 < 3; k2++) { PX.line(g, wx - 14 + k2 * 6, wy - 12, wx - 14 + k2 * 6, wy + wh + 38, k2 % 2 ? drD : drL); PX.line(g, wx + ww + 14 - k2 * 6, wy - 12, wx + ww + 14 - k2 * 6, wy + wh + 38, k2 % 2 ? drD : drL); }
      // tiled stove in the far corner, warm glow at its door
      const sx = 560, sy = 40, sw2 = 64, tile = mix(mix(D.paper, D.cream, 0.4), D.n4, 0.2);
      R(g, sx, sy, sw2, 230, tile); R(g, sx + sw2 - 8, sy, 8, 230, mix(tile, D.n3, 0.3));
      for (let j = 0; j < 14; j++) for (let i = 0; i < 4; i++) { const tx = sx + 2 + i * 16, ty = sy + 4 + j * 16; R(g, tx, ty, 14, 14, mix(tile, D.paperD, 0.25)); R(g, tx + 1, ty + 1, 12, 1, mix(tile, D.cream, 0.3)); R(g, tx + 5, ty + 5, 4, 4, mix(D.steel[1], tile, 0.6)); }
      R(g, sx - 4, sy - 6, sw2 + 8, 8, mix(tile, D.paperD, 0.25)); R(g, sx - 4, 200, sw2 + 8, 5, mix(tile, D.paperD, 0.3));
      R(g, sx + 20, 222, 22, 16, D.n1); R(g, sx + 22, 226, 18, 10, mix(D.rust[1], D.amber[1], 0.4 + 0.2 * Math.sin(t * 3))); PX.glow(g, sx + 31, 232, 40 * fl, D.lampD, 0.3);
      // portrait + bookcase between
      R(g, 250, 64, 54, 66, wd[2]); R(g, 254, 68, 46, 58, mix(D.n2, D.rust[2], 0.25)); ell(g, 277, 90, 9, 11, mix(D.paperD, D.n3, 0.4)); R(g, 264, 104, 26, 20, mix(D.n3, D.steel[2], 0.3));
      R(g, 340, 50, 110, 150, wd[2]); for (let j = 0; j < 4; j++) { R(g, 344, 54 + j * 36, 102, 34, mix(D.n1, wd[2], 0.3)); books(g, 346, 444, 88 + j * 36, 51 + j, 0.45, 26); R(g, 342, 88 + j * 36, 106, 2, wd[1]); }
    });
    // floor + rug
    PX.vgrad(g, -40, 272, 720, 100, mix(wd[2], D.n1, 0.25), mix(wd[1], D.n1, 0.45), 4);
    for (let k2 = 0; k2 < 8; k2++) PX.line(g, 320 + (k2 - 4) * 70, 272, 320 + (k2 - 4) * 180, 360, mix(wd[2], D.n0, 0.3));
    const rg = mix(D.rust[2], D.n2, 0.35); poly(g, [[120, 290], [520, 290], [580, 344], [70, 344]], rg); poly(g, [[132, 294], [508, 294], [562, 340], [88, 340]], mix(D.steel[2], D.n2, 0.4)); poly(g, [[150, 299], [490, 299], [536, 335], [110, 335]], rg);
    // window light pooling on the floor
    A(g, 0.06, () => poly(g, [[150, 44], [150, 220], [330, 330], [400, 330], [260, 200], [180, 44]], D.cream));
    // Euler in the wing chair
    const X = 214, YD = 262, dict = t >= tD, talk = dict && Math.sin(t * 11) > -0.1 && Math.sin(t * 2.3) > -0.6 ? 1 : 0;
    const gest = dict ? 0.5 + 0.5 * Math.sin(t * 1.7) : 0, beat = dict ? Math.sin(t * 4.2) * 2 : 0;
    const ch = mix(D.teal[2], D.n2, 0.3), [chL, , chD] = sh3(ch);
    R(g, X - 44, YD - 96, 88, 110, ch); ell(g, X, YD - 96, 44, 10, ch); R(g, X - 44, YD - 96, 6, 110, chL); R(g, X + 38, YD - 96, 6, 110, chD);
    poly(g, [[X - 52, YD - 70], [X - 40, YD - 80], [X - 40, YD - 20], [X - 52, YD - 10]], chL); poly(g, [[X + 52, YD - 70], [X + 40, YD - 80], [X + 40, YD - 20], [X + 52, YD - 10]], chD);   // wings
    for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) R(g, X - 30 + i * 12, YD - 86 + j * 18, 1, 1, chD);   // buttons
    const pose = { eyes: "blind", talk, look: dict ? 0.5 : 0.3, tilt: dict && Math.sin(t * 0.9) > 0.5 ? 1 : 0, brow: dict && Math.sin(t * 1.3) > 0.6 ? 1 : 0,
      hR: dict ? [X + 40 + gest * 4, YD - 34 - gest * 8 + beat] : [X + 26, YD + 6], hL: [X - 26, YD + 8], palmR: dict, ph: 0.4 };
    frontBody(g, X, YD, t, pose, EULER_OLD, -1);
    // lap: a blanket over his knees, chair arms
    const bl = mix(D.rust[2], D.n2, 0.25); poly(g, [[X - 36, YD - 4], [X + 36, YD - 4], [X + 44, YD + 30], [X - 44, YD + 30]], bl); for (let k2 = 0; k2 < 5; k2++) PX.line(g, X - 30 + k2 * 15, YD, X - 34 + k2 * 17, YD + 28, mix(bl, D.n0, 0.3)); R(g, X - 44, YD + 26, 88, 4, mix(D.amber[1], bl, 0.6));
    R(g, X - 56, YD - 20, 18, 52, ch); R(g, X - 56, YD - 20, 18, 3, chL); R(g, X + 38, YD - 20, 18, 52, chD); R(g, X + 38, YD - 20, 18, 3, ch);
    R(g, X - 50, YD + 30, 5, 16, wd[2]); R(g, X + 46, YD + 30, 5, 16, wd[2]);
    frontArms(g, X, YD, t, pose, EULER_OLD, -1);
    // the helper's desk, candle, growing pile of pages
    const DX = 404, DY = 238, wdd = woodCols(0.45, 0.4);
    const nPg = t < tP ? 2 : Math.min(28, 2 + Math.floor((t - tP) / (0.75 * k)) * 2), carry = t >= tP ? frac((t - tP) / (0.75 * k)) : 0;
    const hxN = carry > 0.65 ? [26 + (carry - 0.65) * 120, -26] : [26 + Math.sin(t * 9) * 2 + frac(t * 0.9) * 10, -22 + Math.abs(Math.sin(t * 13)) * 1.5];
    // helper sits at the right, facing left toward Euler, writing on the desk in front of him
    R(g, 500, 196, 5, 100, wdd[2]); R(g, 500, 196, 1, 100, wdd[1]); R(g, 474, 262, 32, 4, wdd[1]); R(g, 476, 266, 4, 30, wdd[2]); R(g, 500, 266, 4, 30, wdd[2]);   // his chair
    sideFig(g, 488, 260, t, { hunch: 1, hN: hxN, hF: [20, -22], tool: "quill", lookDown: 1, nod: Math.sin(t * 0.8) > 0.8 ? 1 : 0, ph: 1.3 }, HELPER, -1);
    poly(g, [[DX - 70, DY], [DX + 60, DY], [DX + 66, DY + 12], [DX - 76, DY + 12]], wdd[1]); R(g, DX - 76, DY + 12, 142, 6, wdd[2]); R(g, DX - 70, DY, 130, 1, wdd[0]);
    for (const lx of [DX - 72, DX + 58]) { R(g, lx, DY + 18, 6, 274 + 20 - DY - 18, wdd[2]); }
    sheet(g, DX + 16, DY + 2, 30, 8, 9 + Math.max(0, Math.floor((t - tP) / (0.75 * k))), t < tP ? clamp((t - tD) / Math.max(0.5, tP - tD), 0, 1) * 0.9 : carry > 0.65 ? 0 : clamp(carry / 0.65, 0, 1), 0);
    paperStack(g, DX - 24, DY + 10, nPg, 30, 5, 0.1);
    if (carry > 0.65) { const u = (carry - 0.65) / 0.35; sheet(g, lerp(DX + 16, DX - 38, u), DY + 2 - Math.sin(u * Math.PI) * 10 - nPg * u, 28, 4, 3, 1, 0); }
    inkPot(g, DX + 50, DY + 8, false);
    const [cfx, cfy] = candle(g, DX - 62, DY + 8, 14, t, 4);
    PX.glow(g, cfx, cfy, 120 * fl, D.lampD, 0.22); PX.glow(g, cfx, cfy, 40 * fl, D.lamp, 0.2);
    // floor pile of finished pages
    paperStack(g, 560, 300, Math.max(0, nPg - 12) * 0.8, 34, 7, 0.2);
    // cold window light on Euler's face side
    PX.glow(g, 120, 170, 160, D.steel[0], 0.12);
    PX.particles(g, 63, 18, t, [140, 60, 200, 220], { vy: 1.5, vx: 0.8, col: D.cream, a: 0.3, tw: 1 });
    PX.vignette(g, 0.55);
  };

  // ======================= basel =======================
  // 1683 Basel: a man in a long dark wig and dark coat calculates at his desk by candlelight, quill busy over a ledger
  // (o.calc 0.5); at o.eureka (3.5) he stops, leans back in his chair, hand to his chin, eyebrows up, intrigued.
  const BERN = { skin: SKIN.fair, hair: mix(HAIR.dark, HAIR.brown, 0.3), hairStyle: "wig17", top: mix(D.n2, D.n1, 0.3), vest: mix(D.n3, D.rust[2], 0.25), shirt: D.cream, breeches: mix(D.n2, D.n1, 0.2), stock: mix(D.paper, D.n4, 0.35) };
  K.basel = (o) => (g, t, d, c) => {
    t = Math.max(0, t);
    const T = tm(o, d, 6.0), tC = T("calc", 0.5), tE = T("eureka", 3.5);
    if (o.frame !== false) frame(c, 1.22, 350, 214);
    const fl = flick(t, 6), wd = woodCols(0.5, 0.4), wdD = woodCols(0.62, 0.4);
    const wall = mix(mix(D.n2, D.moss[2], 0.18), D.rust[2], 0.1);
    R(g, 0, 0, 640, 360, D.n1);
    PX.par(g, c, 0.4, () => {
      // panelled walls
      R(g, -40, -40, 720, 380, wall);
      for (let x = -30; x < 700; x += 56) { R(g, x, 46, 48, 120, mix(wall, D.n0, 0.12)); R(g, x, 46, 48, 1, mix(wall, D.lampD, 0.15)); R(g, x + 47, 46, 1, 120, mix(wall, D.n0, 0.3)); R(g, x, 186, 48, 70, mix(wall, D.n0, 0.16)); R(g, x, 186, 48, 1, mix(wall, D.lampD, 0.12)); }
      R(g, -40, 30, 720, 8, wdD[1]); R(g, -40, 30, 720, 1, wdD[0]); R(g, -40, 172, 720, 6, wdD[1]); R(g, -40, 172, 720, 1, wdD[0]);
      // leaded window: evening over the roofs, the minster's twin towers
      const wx = 388, wy = 60, ww = 104, wh = 104;
      R(g, wx - 8, wy - 6, ww + 16, wh + 14, wdD[2]);
      clipR(g, wx, wy, ww, wh, () => {
        PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[2], D.n1, 0.3), mix(mix(D.rust[1], D.amber[1], 0.4), D.n3, 0.35), 8);
        const rf = mix(D.n1, D.steel[2], 0.25);
        for (const tx of [wx + 30, wx + 48]) { R(g, tx, wy + 40, 12, 80, rf); poly(g, [[tx - 1, wy + 40], [tx + 6, wy + 14], [tx + 13, wy + 40]], rf); R(g, tx + 4, wy + 56, 3, 6, mix(D.lampD, D.n2, 0.4)); }
        R(g, wx + 26, wy + 70, 40, 50, rf);
        for (const [hx0, hw, hh] of [[-4, 30, 82], [66, 22, 78], [86, 30, 86]]) { R(g, wx + hx0, wy + hh, hw, 50, rf); poly(g, [[wx + hx0 - 2, wy + hh], [wx + hx0 + hw / 2, wy + hh - 16], [wx + hx0 + hw + 2, wy + hh]], rf); }
        R(g, wx + 8, wy + 92, 2, 3, mix(D.lampD, D.n2, 0.3)); R(g, wx + 96, wy + 96, 2, 3, mix(D.lampD, D.n2, 0.35));
        for (let i = 0; i < 12; i++) A(g, 0.5 + 0.4 * Math.sin(t + i), () => R(g, wx + hash(i, 1) * ww, wy + hash(i, 2) * 30, 1, 1, D.cream));
        const lead = mix(D.n1, D.n3, 0.4); for (let k = -8; k < 12; k++) { PX.line(g, wx + k * 12, wy, wx + k * 12 + wh * 0.5, wy + wh, lead); PX.line(g, wx + k * 12, wy, wx + k * 12 - wh * 0.5, wy + wh, lead); }
      });
      R(g, wx + ww / 2 - 2, wy, 4, wh, wdD[2]); R(g, wx - 6, wy + wh, ww + 12, 6, wdD[1]); R(g, wx - 6, wy + wh, ww + 12, 1, wdD[0]);
      // bookcase at the left, a map on the wall
      R(g, 120, 50, 120, 210, wdD[2]); for (let j = 0; j < 5; j++) { R(g, 124, 54 + j * 40, 112, 38, mix(D.n1, wdD[2], 0.3)); books(g, 126, 234, 92 + j * 40, 71 + j, 0.5, 28); R(g, 122, 92 + j * 40, 116, 2, wdD[1]); }
      R(g, 268, 70, 78, 58, wdD[2]); R(g, 271, 73, 72, 52, mix(D.paperD, D.n3, 0.35));
      poly(g, [[278, 86], [298, 78], [320, 84], [336, 76], [336, 116], [308, 118], [282, 112]], mix(D.moss[2], D.paperD, 0.45)); PX.line(g, 288, 76, 294, 124, mix(D.steel[2], D.paperD, 0.3)); PX.line(g, 271, 98, 343, 102, mix(D.ink, D.paperD, 0.6));
    });
    // floor
    PX.vgrad(g, -40, 284, 720, 80, mix(wd[2], D.n1, 0.3), mix(wd[1], D.n1, 0.5), 4);
    for (let k = 0; k < 8; k++) PX.line(g, 320 + (k - 4) * 70, 284, 320 + (k - 4) * 180, 360, mix(wd[2], D.n0, 0.3));
    { const rg = mix(D.moss[2], D.n2, 0.45); poly(g, [[200, 296], [520, 296], [570, 340], [160, 340]], rg); poly(g, [[212, 299], [508, 299], [552, 337], [176, 337]], mix(D.rust[2], D.n2, 0.4)); }
    // timing and pose
    const calc = t >= tC && t < tE, lb = P(t, tE, 0.7, "io"), X = 300, Y = 262, DY = 232;
    const [wx2, wy2] = penWobble(t, calc ? 1 : 0, 10);
    const pose = { hunch: 1 - lb, lean: lb, ph: 0.7, tool: "quill", lookDown: lb < 0.3 ? 1 : 0, brow: lb > 0.5 ? 1 : 0, oh: lb > 0.5 && t < tE + 1.6 ? 1 : 0, smile: t >= tE + 1.6 ? 1 : 0,
      hN: lb > 0.05 ? [lerp(30, -4, lb), lerp(-30, -34, lb)] : [30 + wx2, -30 + wy2 * 0.6], hF: lb > 0.05 ? [lerp(26, 14, lb), lerp(-28, -12, lb)] : [26, -28] };
    // high-backed chair behind him
    const ch = woodCols(0.6, 0.35);
    R(g, X - 26, Y - 80, 7, 112, ch[2]); R(g, X - 26, Y - 80, 2, 112, ch[1]); ell(g, X - 23, Y - 82, 5, 4, ch[1]);
    poly(g, [[X - 20, Y - 70], [X - 14, Y - 70], [X - 12, Y - 2], [X - 20, Y - 2]], mix(D.rust[2], D.n1, 0.4));
    R(g, X - 26, Y + 2, 44, 6, ch[1]); R(g, X - 24, Y + 8, 4, 24, ch[2]); R(g, X + 14, Y + 8, 4, 24, ch[2]);
    sideFig(g, X, Y, t, pose, BERN, 1);
    // the desk with ledgers, coins and the candle
    poly(g, [[X + 18, DY], [490, DY], [500, DY + 10], [X + 10, DY + 10]], wd[1]); R(g, X + 10, DY + 10, 490 - X, 6, wd[2]); R(g, X + 18, DY, 472 - X, 1, wd[0]);
    R(g, X + 16, DY + 16, 6, 284 - DY - 16, wd[2]); R(g, 488, DY + 16, 6, 284 - DY - 16, wd[2]); R(g, X + 22, DY + 18, 466 - X, 18, mix(wd[2], wd[1], 0.3)); R(g, 410, DY + 24, 10, 3, mix(D.amber[2], D.n2, 0.3));
    shadow(g, 0.45, () => R(g, X + 12, 284, 490 - X, 4, BLK));
    const lg = mix(D.paper, D.n3, 0.1);
    poly(g, [[X + 22, DY + 1], [X + 82, DY + 1], [X + 86, DY + 8], [X + 18, DY + 8]], lg); R(g, X + 52, DY + 1, 1, 7, mix(D.paperD, D.n3, 0.3));
    for (let l = 0; l < 3; l++) { scribble(g, X + 24, DY + 2 + l * 2, 24, 90 + l, mix(D.ink, lg, 0.35), 1, 1); scribble(g, X + 55, DY + 2 + l * 2, 26 * clamp((t - tC) / 2.5 - l * 0.3, 0, 1), 95 + l, mix(D.ink, lg, 0.35), 1, 1); }
    R(g, X + 118, DY - 6, 34, 7, mix(D.rust[2], D.n1, 0.3)); R(g, X + 118, DY - 6, 34, 1, mix(D.rust[1], D.n2, 0.4)); R(g, X + 120, DY - 12, 30, 6, mix(D.steel[2], D.n1, 0.35)); R(g, X + 122, DY - 18, 26, 6, mix(D.moss[2], D.n1, 0.35));
    for (let i = 0; i < 5; i++) flatCoin(g, X + 160 + (i % 3) * 8, DY + 5 - Math.floor(i / 3) * 3, true);
    inkPot(g, X + 92, DY + 6, false);
    const [fx, fy] = candle(g, 392, DY + 6, 22, t, 6);
    PX.glow(g, fx, fy, 190 * fl, D.lampD, 0.26); PX.glow(g, fx, fy, 60 * fl, D.lamp, 0.2); PX.glow(g, fx, fy - 2, 9, D.lamp, 0.4);
    smoke(g, fx, fy - 8, t, 0.12);
    { const gx = 90, gy = 250, gc = mix(D.paperD, D.n3, 0.3), fw = woodCols(0.55, 0.4); R(g, gx - 2, gy + 30, 5, 60, fw[2]); R(g, gx - 24, 334, 50, 6, fw[2]); ell(g, gx, gy + 30, 30, 5, fw[1]);
      PX.circle(g, gx, gy, 28, gc); ell(g, gx - 8, gy - 6, 12, 14, mix(D.moss[2], D.paperD, 0.35)); ell(g, gx + 12, gy + 10, 8, 9, mix(D.moss[2], D.paperD, 0.4)); A(g, 0.35, () => ell(g, gx + 10, gy - 2, 18, 24, BLK));
      for (let a = 0; a <= 40; a++) { const an = -Math.PI * 0.5 + (a / 40) * Math.PI * 1.2; R(g, gx + Math.cos(an) * 31, gy + Math.sin(an) * 31, 2, 2, mix(D.amber[2], D.n2, 0.25)); } }
    { const cu = mix(D.rust[2], D.n1, 0.4); poly(g, [[600, -10], [660, -10], [660, 372], [596, 372], [612, 160]], cu); for (let k = 0; k < 3; k++) PX.line(g, 612 + k * 12, -8, 606 + k * 14, 370, mix(cu, D.n0, 0.3)); }
    dust(g, 81, 20, t, [300, 120, 200, 140], D.lamp, 0.3);
    PX.vignette(g, 0.62);
  };

  // ======================= euler_young =======================
  // 1740s: a younger man in a powdered wig stands at a tall writing desk by a daylit window, writing fast (o.write 0.5);
  // stacks of manuscripts everywhere. Every o.page seconds (default 2.2) he slides a finished sheet onto the pile.
  const EULER_Y = { skin: SKIN.warm, hair: HAIR.white, hairStyle: "wig40", top: mix(D.steel[2], D.n2, 0.15), vest: mix(D.amber[2], D.paperD, 0.35), shirt: D.cream, breeches: mix(D.steel[2], D.n2, 0.3), stock: mix(D.paper, D.cream, 0.3) };
  K.euler_young = (o) => (g, t, d, c) => {
    t = Math.max(0, t);
    const T = tm(o, d, 5.0), tW = T("write", 0.5), per = typeof o.page === "number" ? Math.max(0.6, o.page) : 2.2 * d / 5;
    if (o.frame !== false) frame(c, 1.12, 330, 200);
    const wd = woodCols(0.42, 0.4), wall = mix(mix(D.paperD, D.amber[2], 0.15), D.n4, 0.4);
    R(g, 0, 0, 640, 360, D.n2);
    PX.par(g, c, 0.4, () => {
      R(g, -40, -40, 720, 380, wall);
      R(g, -40, 190, 720, 4, wd[1]); R(g, -40, 194, 720, 100, mix(wall, D.n0, 0.1));
      for (let x = -30; x < 700; x += 50) { R(g, x, 204, 40, 60, mix(wall, D.n0, 0.16)); R(g, x, 204, 40, 1, mix(wall, D.cream, 0.15)); }
      // tall daylit window on the left with a pigeon on the sill
      const wx = 60, wy = 40, ww = 96, wh = 160;
      R(g, wx - 8, wy - 6, ww + 16, wh + 14, mix(wall, D.cream, 0.2));
      clipR(g, wx, wy, ww, wh, () => {
        PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[0], D.cream, 0.4), mix(D.cream, D.lamp, 0.35), 7);
        const fb = mix(D.paperD, D.steel[0], 0.35); R(g, wx, wy + 110, ww, 60, fb); for (let k = 0; k < 5; k++) { R(g, wx + 6 + k * 20, wy + 118, 8, 12, mix(D.steel[1], D.cream, 0.4)); } poly(g, [[wx, wy + 110], [wx + 30, wy + 92], [wx + 60, wy + 110]], mix(D.rust[1], D.paperD, 0.4));
        A(g, 0.5, () => ell(g, wx + 70, wy + 80, 20, 14, mix(D.moss[1], D.cream, 0.4)));
      });
      for (let k = 1; k < 3; k++) R(g, wx + (ww * k) / 3 - 1, wy, 2, wh, D.cream); for (let k = 1; k < 5; k++) R(g, wx, wy + (wh * k) / 5 - 1, ww, 2, D.cream);
      R(g, wx - 8, wy + wh, ww + 16, 6, mix(D.cream, D.paperD, 0.3));
      { const hop = Math.max(0, Math.sin(t * 1.7)) > 0.95 ? 1 : 0, px = wx + 76, py = wy + wh - 1 - hop, pc = mix(D.n5, D.steel[1], 0.3); ell(g, px, py - 3, 5, 3, pc); R(g, px - 6, py - 4, 4, 4, mix(pc, D.n7, 0.3)); R(g, px - 7, py - 3, 1, 1, D.amber[1]); R(g, px + 4, py - 3, 3, 2, mix(pc, D.n3, 0.3)); }
      // shelves overflowing with manuscripts, pinned sheets
      R(g, 400, 40, 180, 150, wd[2]);
      for (let j = 0; j < 4; j++) { R(g, 404, 44 + j * 36, 172, 34, mix(D.n2, wd[2], 0.3)); R(g, 402, 78 + j * 36, 176, 2, wd[1]);
        for (let i = 0; i < 6; i++) { const bx = 408 + i * 28; if (hash(i, j) < 0.45) books(g, bx, bx + 26, 78 + j * 36, 100 + i + j * 7, 0.35, 26); else paperStack(g, bx + 12, 78 + j * 36, 6 + hash(i, j + 3) * 20, 22, i + j * 9, 0.12); } }
      R(g, 196, 70, 44, 56, wd[2]); R(g, 199, 73, 38, 50, mix(D.n3, D.moss[2], 0.3)); ell(g, 218, 92, 8, 10, mix(D.paperD, D.n4, 0.3)); R(g, 206, 104, 24, 19, mix(D.n2, D.rust[2], 0.3));
      for (const [px, py] of [[300, 70], [334, 84], [312, 112]]) { R(g, px, py, 22, 28, mix(D.paper, D.n4, 0.2)); for (let l = 0; l < 6; l++) R(g, px + 3, py + 4 + l * 4, 16 - (l % 2) * 4, 1, mix(D.ink, D.paper, 0.6)); R(g, px + 10, py + 1, 2, 2, D.rust[1]); }
    });
    // floor with sunlight from the window
    PX.vgrad(g, -40, 288, 720, 80, mix(wd[1], D.n2, 0.2), mix(wd[1], D.n2, 0.45), 4);
    for (let k = 0; k < 8; k++) PX.line(g, 320 + (k - 4) * 70, 288, 320 + (k - 4) * 180, 360, mix(wd[2], D.n0, 0.25));
    A(g, 0.08, () => poly(g, [[156, 40], [156, 200], [360, 340], [470, 340], [250, 150], [200, 40]], D.cream));
    A(g, 0.12, () => poly(g, [[200, 300], [330, 300], [400, 350], [240, 350]], D.lamp));
    A(g, 0.1, () => poly(g, [[240, 70], [300, 50], [300, 170], [240, 190]], D.lamp)); A(g, 0.06, () => { R(g, 268, 52, 2, 128, D.cream); });
    // stacks of manuscripts on the floor
    for (const [sx, h, w2, sd] of [[60, 34, 34, 1], [100, 22, 30, 2], [520, 40, 36, 3], [566, 26, 32, 4], [480, 14, 30, 5]]) paperStack(g, sx, 304, h, w2, sd, 0.1);
    // writing timeline: write, then every period slide the sheet onto the pile
    const X = 352, Y = 240, DX = 300, DY = 222, wr = t >= tW, ph = wr ? frac((t - tW) / per) : 0, slide = wr && ph > 0.8 ? (ph - 0.8) / 0.2 : 0, nDone = wr ? Math.floor((t - tW) / per) : 0;
    const [wx2, wy2] = penWobble(t, wr && !slide ? 1 : 0, 12);
    const pose = { stand: 1, hunch: 0.8, lookDown: 1, tool: "quill", ph: 0.2, hN: slide ? [lerp(34, 70, slide), -22] : [34 + wx2, -22 + wy2 * 0.6], hF: [26, -20] };
    // the tall desk (slanted top) in front of him, and the pile it feeds on the side table
    const st2 = woodCols(0.5, 0.4);
    R(g, 216, 254, 70, 8, st2[1]); R(g, 216, 254, 70, 1, st2[0]); R(g, 220, 262, 4, 40, st2[2]); R(g, 278, 262, 4, 40, st2[2]);
    paperStack(g, 250, 254, 10 + nDone * 3, 34, 11, 0.05); inkPot(g, 276, 254, true);
    if (slide > 0) sheet(g, lerp(DX + 8, 236, slide), lerp(DY - 6, 236 - nDone * 3, slide) - Math.sin(slide * Math.PI) * 8, 28, 4, 2, 1, 0);
    sideFig(g, X, Y, t, pose, EULER_Y, -1);
    poly(g, [[DX - 20, DY + 4], [DX + 28, DY - 8], [DX + 32, DY - 4], [DX - 16, DY + 8]], st2[1]); R(g, DX - 20, DY + 8, 52, 4, st2[2]);
    R(g, DX - 2, DY + 10, 6, 288 - DY - 10, st2[2]); R(g, DX - 2, DY + 10, 1, 288 - DY - 10, st2[1]); R(g, DX - 16, 298, 34, 4, st2[2]);
    if (!slide) { const pc = mix(D.paper, D.cream, 0.2); poly(g, [[DX - 12, DY + 2], [DX + 20, DY - 6], [DX + 22, DY - 3], [DX - 10, DY + 5]], pc); for (let l = 0; l < 3; l++) { const lp = clamp(ph * 3 - l, 0, 1); if (lp > 0) PX.line(g, DX - 9 + l, DY + 2 - l * 1, DX - 9 + l + 24 * lp, DY - 4 - l * 1 + (1 - lp) * 6 * 0, mix(D.ink, pc, 0.4)); } }
    // foreground: a chair heaped with manuscripts at the right, curtain edge at the left
    { const fc = woodCols(0.55, 0.4); R(g, 500, 250, 8, 120, fc[2]); R(g, 590, 250, 8, 120, fc[2]); R(g, 496, 290, 108, 10, fc[1]); R(g, 496, 290, 108, 1, fc[0]); R(g, 590, 200, 8, 92, fc[2]); R(g, 590, 200, 2, 92, fc[1]);
      paperStack(g, 532, 290, 22, 44, 21, 0.05); paperStack(g, 568, 290, 14, 30, 22, 0.08); for (let k = 0; k < 3; k++) R(g, 514 + k * 22, 300, 3, 3, mix(D.rust[1], D.n3, 0.3)); }
    { const cu = mix(D.moss[2], D.n2, 0.3); poly(g, [[-20, -10], [34, -10], [22, 140], [34, 372], [-20, 372]], cu); for (let k = 0; k < 3; k++) PX.line(g, k * 9, -8, k * 9 + 6, 370, mix(cu, D.n0, 0.25)); }
    PX.glow(g, 150, 120, 220, D.cream, 0.12);
    dust(g, 91, 30, t, [160, 60, 240, 240], D.cream, 0.45);
    PX.vignette(g, 0.45);
  };
})();
