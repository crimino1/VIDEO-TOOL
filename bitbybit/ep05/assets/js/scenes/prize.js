/* EP5 Builder C: the Netflix Prize (big_cheque, leaderboard, merge, photo_finish, shrink, dot_product).
   Documentary palette PX.D only; every shade is derived with mix(). Amber is reserved for the YOU dot. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, A = PX.alpha, clamp = PX.clamp, lerp = PX.lerp;

  // ---------- colour helpers (derive everything from PX.D) ----------
  const H2 = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const P = H2(a), Q = H2(b); return "#" + P.map((v, i) => Math.round(v + (Q[i] - v) * clamp(k, 0, 1)).toString(16).padStart(2, "0")).join(""); };
  const dk = (c, k) => mix(c, D.n0, k);
  const lt = (c, k) => mix(c, D.cream, k);
  const SH = (a) => `rgba(0,0,0,${a})`;
  const md = (i, n) => ((i % n) + n) % n;
  const WOOD = [mix(D.lampD, D.rust[2], 0.4), mix(D.rust[2], D.amber[2], 0.35), mix(D.rust[2], D.n1, 0.5)];
  const BRASS = [lt(mix(D.lampD, D.paperD, 0.3), 0.3), mix(D.lampD, D.paperD, 0.35), mix(D.lampD, D.rust[2], 0.45), mix(D.rust[2], D.n1, 0.55)];
  const BEIGE = [mix(D.paper, D.paperD, 0.4), mix(D.paperD, D.n4, 0.38), mix(D.paperD, D.n3, 0.68), mix(D.n3, D.n2, 0.4)];
  const SKINS = [
    [mix(D.rose[0], D.paper, 0.35), mix(D.rose[1], D.paperD, 0.45), mix(D.rose[2], D.paperD, 0.35)],          // light
    [mix(D.rose[0], D.amber[1], 0.35), mix(D.rose[1], D.amber[2], 0.5), mix(D.rose[2], D.amber[2], 0.6)],     // medium
    [mix(D.rust[2], D.paperD, 0.45), mix(D.rust[2], D.n2, 0.25), mix(D.rust[2], D.n1, 0.55)],                 // deep
  ];
  // the two super-teams (shared by merge + photo_finish): moss "leaf" team (winner) and steel "bolt" team
  const TEAM = [D.moss, D.steel];

  // ---------- beats ----------
  // single beat: explicit number used as given, otherwise default scaled by d / typical d
  const tm = (o, key, def, d, typ) => (typeof o[key] === "number" ? o[key] : (def * d) / typ);
  // range beat: o[key] = start number or [start, end]; o[key + "End"] overrides the end
  const rng = (o, key, a, b, d, typ) => {
    let s, e;
    if (Array.isArray(o[key])) { s = +o[key][0]; e = +o[key][1]; }
    else { s = tm(o, key, a, d, typ); e = typeof o[key + "End"] === "number" ? o[key + "End"] : typeof o[key] === "number" ? s + ((b - a) * d) / typ : (b * d) / typ; }
    return [s, Math.max(e, s + 0.1)];
  };
  const pr = (t, a, b) => clamp((t - a) / Math.max(b - a, 1e-6), 0, 1);

  // ---------- drawing helpers ----------
  const label = (g, s, x, y, a, col, size, font) => { if (a <= 0) return; A(g, a, () => PX.otext(g, s, x, y, { col: col || D.cream, align: "center", outline: D.n0, size: size || 8, font: font || "p" })); };
  const shadow = (g, x, y, w, h, a) => { for (let i = 0; i < 3; i++) { const k = 1 - i * 0.25, ww = Math.round(w * k); A(g, a * 0.4, () => R(g, x + (w - ww) / 2, y, ww, h, SH(1))); } };
  const dust = (g, t, box, seed, n, a) => PX.particles(g, seed || 5, n || 22, t, box, { vy: -2.5, vx: 1.5, col: D.lamp, a: a === undefined ? 0.4 : a, tw: 1.3 });
  const limb = (g, x1, y1, x2, y2, w, col) => { const h = w >> 1; for (let i = 0; i < w; i++) for (let j = 0; j < w; j++) PX.line(g, x1 + i - h, y1 + j - h, x2 + i - h, y2 + j - h, col); };
  // light cone from (x, y) down to a floor pool centred at tx, width w1 at depth h
  const cone = (g, x, y, tx, w0, w1, h, a, col) => {
    for (let r = 0; r < h; r++) { const k = r / h, w = w0 + (w1 - w0) * k, cx = x + (tx - x) * k; A(g, a * (0.35 + 0.65 * (1 - k)) * (r % 2 ? 0.85 : 1), () => R(g, cx - w / 2, y + r, w, 1, col || D.lamp)); }
  };
  // the YOU dot: warm amber, 1-px cream ring, faint pulse
  const youDot = (g, x, y, t, r) => {
    r = r || 3; const pu = 0.5 + 0.5 * Math.sin(t * 2.4);
    PX.glow(g, x, y, r * 4 + pu * 2, D.amber[1], 0.18 + 0.1 * pu);
    A(g, 0.55 + 0.3 * pu, () => { PX.circle(g, x, y, r + 1, D.cream); });
    PX.circle(g, x, y, r, D.amber[1]); R(g, x - 1, y - 1, 1, 1, D.amber[0]);
  };
  // a video: small teal square
  const vidSq = (g, x, y, s) => { s = s || 6; R(g, x, y, s, s, D.teal[1]); R(g, x, y, s, 1, D.teal[0]); R(g, x + s - 1, y + 1, 1, s - 1, D.teal[2]); };

  // a person (~76 px), x = centre, y = feet. o: skin, hair, top, bot ([l,b,s] each), shirt, tie, f (-1/0/1 facing),
  // walk (phase), stride, aL/aR (arm angle from straight down, + = toward screen right), eL/eR (forearm bend), mouth
  // "smile"|"o"|"flat"|"talk", brow, look (-1..1 x), up (eyes up), hair style "short"|"cap"|"wavy"|"bald", s (scale)
  const figure = (g, x, y, t, o) => {
    const s = o.s || 1, f = o.f || 0, sk = o.skin || SKINS[1], hr = o.hair || [D.n4, D.n2, D.n1], tp = o.top || [D.n5, D.n4, D.n3], bt = o.bot || [D.n4, D.n3, D.n2];
    const LL = Math.round(30 * s), TL = Math.round(25 * s), st = o.stride || 0, wk = o.walk || 0;
    const bob = st ? Math.round(Math.abs(Math.cos(wk)) * 1.4 * st) : 0;
    const hipY = y - LL - bob + 1, shY = hipY - TL, hx = x;
    // legs (two segments)
    const leg = (side, ph, col) => {
      // walking toward f: swing a (toward f when positive), shin folds back while the leg is lifted
      const a = Math.sin(ph) * 0.42 * st * (f || 1), sa = a - Math.max(0, Math.cos(ph)) * 0.7 * st * (f || 1);
      const kx = hx + side * 3 * s + Math.sin(a) * LL * 0.5, ky = hipY + Math.cos(a) * LL * 0.5;
      const fx = kx + Math.sin(sa) * LL * 0.5, fy = Math.min(y, ky + Math.cos(sa) * LL * 0.5);
      limb(g, hx + side * 3 * s, hipY, kx, ky, Math.round(5 * s), col); limb(g, kx, ky, fx, fy, Math.round(4 * s), col);
      const sh = f >= 0 ? 0 : -3; R(g, fx - 2 + sh, fy - 1, Math.round(6 * s), 2, D.n1); R(g, fx - 2 + sh, fy - 1, Math.round(6 * s), 1, D.n3);
    };
    leg(-1, wk + Math.PI, bt[2]); leg(1, wk, bt[1]);
    // arms: shoulder points
    const arm = (side, a, e, col, hand) => {
      const sx = hx + side * Math.round(8 * s), sy = shY + 3, ua = Math.round(12 * s), fa = Math.round(11 * s);
      const ex = sx + Math.sin(a) * ua, ey = sy + Math.cos(a) * ua, b = a + (e || 0), wx = ex + Math.sin(b) * fa, wy = ey + Math.cos(b) * fa;
      limb(g, sx, sy, ex, ey, Math.round(4 * s), col); limb(g, ex, ey, wx, wy, Math.round(4 * s), col);
      R(g, wx - 1, wy - 1, 3, 3, hand); R(g, wx - 1, wy - 1, 1, 1, sk[0]);
    };
    const aL = o.aL === undefined ? -0.12 : o.aL, aR = o.aR === undefined ? 0.12 : o.aR;
    // back arm first when side-on
    if (f < 0) arm(1, aR, o.eR, tp[2], sk[2]); if (f > 0) arm(-1, aL, o.eL, tp[2], sk[2]);
    // torso (rows taper from shoulders to hips)
    for (let r = 0; r <= TL; r++) {
      const k = r / TL, w = Math.round(lerp(17, 13, k) * s), yy = shY + r;
      R(g, hx - w / 2, yy, w, 1, tp[1]); R(g, hx - w / 2, yy, 2, 1, tp[0]); R(g, hx + w / 2 - 3, yy, 3, 1, tp[2]);
    }
    R(g, hx - 7 * s, hipY - 1, 14 * s, 2, dk(tp[2], 0.3));
    if (o.shirt) { // open jacket: shirt V + tie
      const sx = hx + f * 2;
      for (let r = 0; r < 12 * s; r++) { const w = Math.max(1, Math.round((6 - r * 0.45) * s)); R(g, sx - w / 2, shY + r, w, 1, o.shirt); }
      if (o.tie) { R(g, sx - 1, shY + 1, 2, Math.round(13 * s), o.tie); R(g, sx - 1, shY + 1, 2, 1, lt(o.tie, 0.3)); }
    }
    if (o.zip) R(g, hx + f * 2, shY + 2, 1, TL - 3, tp[2]);
    // neck + head
    const hcx = hx + f * 1, hy = shY - Math.round(15 * s);
    R(g, hcx - 2, shY - 3, 5, 4, sk[2]);
    const HW = Math.round(12 * s), HH = Math.round(14 * s);
    for (let r = 0; r < HH; r++) { const w = r < 2 ? HW - 4 : r > HH - 3 ? HW - 4 : HW; R(g, hcx - w / 2, hy + r, w, 1, sk[1]); R(g, hcx - w / 2, hy + r, 1, 1, sk[0]); R(g, hcx + w / 2 - 2, hy + r, 2, 1, sk[2]); }
    if (f) R(g, hcx - f * 6, hy + 6, 2, 4, sk[2]);            // ear (side-on)
    else { R(g, hcx - HW / 2 - 1, hy + 6, 1, 3, sk[1]); R(g, hcx + HW / 2, hy + 6, 1, 3, sk[2]); }
    // hair
    const hs = o.hs || "short";
    if (hs === "cap") { R(g, hcx - HW / 2, hy - 1, HW, 5, hr[1]); R(g, hcx - HW / 2, hy - 1, HW, 1, hr[0]); R(g, hcx + (f || 1) * (HW / 2 - 1) - (f < 0 ? 4 : 0), hy + 3, 5, 2, hr[2]); }
    else if (hs === "wavy") { R(g, hcx - HW / 2 - 1, hy - 2, HW + 2, 5, hr[1]); R(g, hcx - HW / 2 - 1, hy + 2, 3, 6, hr[1]); R(g, hcx + HW / 2 - 2, hy + 2, 3, 5, hr[2]); for (let i = 0; i < HW; i += 3) R(g, hcx - HW / 2 + i, hy - 3 + (i % 2), 2, 1, hr[0]); }
    else if (hs !== "bald") { R(g, hcx - HW / 2, hy - 1, HW, 4, hr[1]); R(g, hcx - HW / 2, hy - 1, HW, 1, hr[0]); R(g, hcx - HW / 2, hy + 2, 2, 4, hr[1]); R(g, hcx + HW / 2 - 2, hy + 2, 2, 3, hr[2]); }
    // face
    const lk = Math.round((o.look || 0) * 1.4) + f * 2, ey = hy + 6 - (o.up ? 1 : 0), blink = PX.blink(t + (o.seed || 0), 3.7, 0.05);
    const br = Math.round((o.brow || 0) * 2);
    for (const ex of f ? [hcx + f * 1, hcx + f * 4] : [hcx - 3, hcx + 2]) {
      R(g, ex + lk - (f ? f * 2 : 0) - 1, ey - 2 - br, 3, 1, hr[2]);
      if (blink) R(g, ex + lk - (f ? f * 2 : 0), ey + 1, 2, 1, sk[2]); else R(g, ex + lk - (f ? f * 2 : 0), ey, 1, 2, D.ink);
    }
    const my = hy + 10, mx = hcx + f * 2 - 1, mo = o.mouth === "talk" ? (Math.sin(t * 11) > 0.2 ? "o" : "flat") : o.mouth || "flat";
    if (mo === "smile") { R(g, mx - 1, my, 4, 1, dk(sk[2], 0.4)); R(g, mx - 2, my - 1, 1, 1, dk(sk[2], 0.4)); R(g, mx + 3, my - 1, 1, 1, dk(sk[2], 0.4)); }
    else if (mo === "o") R(g, mx, my - 1, 2, 2, dk(sk[2], 0.55));
    else R(g, mx, my, 3, 1, dk(sk[2], 0.35));
    // front arm last
    if (f <= 0) arm(-1, aL, o.eL, f < 0 ? tp[1] : tp[1], sk[1]);
    if (f >= 0) arm(1, aR, o.eR, f > 0 ? tp[1] : tp[2], f ? sk[1] : sk[2]);
    return { hx: hcx, hy, shY, hipY };
  };

  // ===================================================================================================
  // big_cheque (7.0): press-conference stage with spotlights; a giant cheque "$1,000,000" wheeled in (o.cheque 0.5),
  // a banner "BEAT OUR SYSTEM BY 10%" unrolls from the truss (o.banner 3.0). Generic company, no logo.
  K.big_cheque = (o) => {
    const FY = 272, EDGE = 306, CX = 392;
    const CURT = [mix(D.teal[2], D.n3, 0.55), mix(D.teal[2], D.n2, 0.7), mix(D.teal[2], D.n1, 0.82), D.n1];
    const r = PX.rnd(31), heads = [...Array(13)].map((_, i) => [i * 54 - 10 + r() * 20, 318 + r() * 16, 0.9 + r() * 0.35, r()]);
    const cams = heads.map((h, i) => (h[3] > 0.62 ? i : -1)).filter((i) => i >= 0);   // only heads holding cameras flash
    const flashes = cams.length ? [...Array(14)].map((_, i) => [i * 0.55 + r() * 0.4, cams[Math.floor(r() * cams.length)]]) : [];
    const EXEC = { skin: SKINS[0], hair: [D.n6, D.n5, D.n4], top: [D.n5, D.n4, D.n3], bot: [D.n3, D.n2, D.n1], shirt: D.cream, tie: D.steel[1], seed: 1.3, s: 1.25 };
    const HAND = { skin: SKINS[2], hair: [D.n4, D.n3, D.n2], top: [D.n4, D.n3, D.n2], bot: [D.n3, D.n2, D.n1], hs: "cap", seed: 0.4, s: 1.12 };
    return (g, t, d, c) => {
      const TC = tm(o, "cheque", 0.5, d, 7), TB = tm(o, "banner", 3.0, d, 7);
      const KS = Math.min(1, d / 7), WD = 2.2 * KS;                           // wheel-in time (shorter in short shots)
      const pc = PX.p(t, TC, WD, "io"), pb = PX.p(t, TB, 1.3 * KS, "out"), arrived = t >= TC + WD;
      // ---- far: curtain (breathing folds) ----
      PX.par(g, c, 0.4, () => {
        R(g, -30, -30, 700, FY + 40, CURT[2]);
        for (let x = -40; x < 700; x += 20) {
          const sw = Math.sin(t * 0.6 + x * 0.05) * 1.5;
          for (let y = -30; y < FY + 10; y += 2) { const bend = Math.sin(y * 0.02 + x) * 1.2 + sw; R(g, x + bend, y, 7, 2, CURT[1]); R(g, x + bend + 2, y, 2, 2, CURT[0]); R(g, x + bend + 13, y, 4, 2, CURT[3]); }
        }
        PX.vgrad(g, -30, -30, 700, 60, D.n0, CURT[2], 5);
        A(g, 0.5, () => PX.vgrad(g, -30, FY - 70, 700, 80, CURT[2], D.n1, 5));
        PX.glow(g, 150, 200, 110, D.lampD, 0.16); PX.glow(g, 392, 190, 170, D.lampD, 0.2);
        A(g, 0.35, () => { R(g, -30, -30, 90, FY + 40, D.n0); R(g, 610, -30, 90, FY + 40, D.n0); });
      });
      // ---- truss + fixtures ----
      PX.par(g, c, 0.7, () => {
        R(g, -30, 16, 700, 3, D.n4); R(g, -30, 28, 700, 3, D.n3); R(g, -30, 16, 700, 1, D.n5);
        for (let x = -30; x < 680; x += 12) { PX.line(g, x, 18, x + 6, 28, D.n3); PX.line(g, x + 6, 28, x + 12, 18, D.n3); }
        for (const fx of [150, 392, 520, 270]) { R(g, fx - 1, 31, 2, 4, D.n4); R(g, fx - 6, 34, 12, 9, D.n3); R(g, fx - 6, 34, 12, 1, D.n5); R(g, fx - 5, 42, 10, 2, D.lamp); }
        // banner batten + banner
        R(g, 120, 46, 400, 3, D.n4); R(g, 120, 46, 400, 1, D.n6);
        const bh = Math.round(46 * pb), bx = 136, bw = 368;
        if (bh > 0) {
          R(g, bx, 49, bw, bh, D.paper);
          for (let y = 49; y < 49 + bh; y++) { R(g, bx, y, 3, 1, D.paperD); R(g, bx + bw - 3, y, 3, 1, D.paperD); }
          for (let x = bx + 20; x < bx + bw; x += 46) A(g, 0.25, () => R(g, x, 49, 1, bh, D.paperD));     // fabric creases
          g.save(); g.beginPath(); g.rect(bx, 49, bw, bh); g.clip();
          PX.text(g, "BEAT OUR SYSTEM BY 10%", 320, 64, { size: 16, col: D.ink, align: "center" });
          g.restore();
          A(g, 0.25, () => R(g, bx, 49 + bh, bw, 2, SH(1)));
        }
        // the roll (cylinder) at the bottom edge
        const ry = 48 + bh;
        R(g, bx - 4, ry, bw + 8, 5, D.paperD); R(g, bx - 4, ry, bw + 8, 1, D.paper); R(g, bx - 4, ry + 4, bw + 8, 1, mix(D.paperD, D.n3, 0.5));
        R(g, bx - 7, ry, 3, 5, D.n5); R(g, bx + bw + 4, ry, 3, 5, D.n5);
      });
      // ---- spotlights: cones + floor pools ----
      const wob = Math.sin(t * 0.9) * 2;
      cone(g, 150, 44, 146 + wob * 0.5, 8, 100, FY - 44 + 16, 0.09);
      cone(g, 392, 44, CX + wob, 8, 170, FY - 44 + 16, 0.1);
      // ---- floor ----
      R(g, 0, FY, 640, EDGE - FY, mix(WOOD[2], D.n1, 0.6));
      for (let i = -12; i <= 12; i++) PX.line(g, 320 + i * 30, FY, 320 + i * 54, EDGE, mix(WOOD[2], D.n0, 0.7));
      for (const y of [FY + 6, FY + 15, FY + 26]) R(g, 0, y, 640, 1, mix(WOOD[2], D.n1, 0.75));
      R(g, 0, FY, 640, 1, mix(WOOD[1], D.n2, 0.5));
      for (const [px, pw] of [[146, 120], [CX, 190]]) for (let i = 0; i < 4; i++) A(g, 0.07 + i * 0.05, () => { const w = pw * (1 - i * 0.22), h = 22 * (1 - i * 0.22); for (let yy = 0; yy < h; yy++) { const k = 1 - Math.pow((yy - h / 2) / (h / 2), 2); R(g, px + wob - (w * Math.sqrt(k)) / 2, FY + 6 + yy - h / 2 + 8, w * Math.sqrt(k), 1, mix(D.lamp, WOOD[0], 0.4)); } });
      R(g, 0, EDGE, 640, 10, D.n1); R(g, 0, EDGE, 640, 1, mix(WOOD[1], D.n2, 0.3)); PX.vgrad(g, 0, EDGE + 10, 640, 50, D.n1, D.n0, 4);
      // ---- presenter behind a plain lectern ----
      const point = PX.p(t, TC + WD * 0.45, 0.6, "out") * (pc > 0 ? 1 : 0);
      figure(g, 146, 292, t, { ...EXEC, aL: lerp(-0.5, -0.5, point), eL: -0.9, aR: lerp(0.5, 2.0, point), eR: lerp(-0.9, -0.2, point),
        mouth: t > TB + 0.6 ? "smile" : t < TC + WD + 0.2 ? "talk" : "smile", look: lerp(0, 1, point), up: t > TB && t < TB + 2.2, brow: t > TB && t < TB + 1.6 ? 1 : 0 });
      shadow(g, 112, 288, 72, 4, 0.6);
      { const lx = 116, ly = 246; // lectern
        for (let rr = 0; rr < 44; rr++) { const w = 58 - Math.round(rr * 0.15), yy = ly + rr; R(g, 146 - w / 2, yy, w, 1, mix(WOOD[1], D.n2, 0.3)); R(g, 146 - w / 2, yy, 3, 1, mix(WOOD[0], D.n3, 0.2)); R(g, 146 + w / 2 - 6, yy, 6, 1, mix(WOOD[2], D.n1, 0.3)); }
        R(g, lx - 4, ly - 3, 68, 5, mix(WOOD[0], D.n3, 0.15)); R(g, lx - 4, ly - 3, 68, 1, lt(WOOD[0], 0.25));
        PX.box(g, 126, 256, 40, 22, mix(WOOD[2], D.n1, 0.45)); R(g, 127, 257, 38, 1, mix(WOOD[0], D.n3, 0.4));
        PX.line(g, 140, ly - 3, 136, ly - 14, D.n5); PX.line(g, 136, ly - 14, 140, ly - 20, D.n5); R(g, 139, ly - 23, 4, 4, D.n2); R(g, 139, ly - 23, 4, 1, D.n6);
        A(g, 0.6, () => R(g, 150, ly - 4, 14, 2, D.paper)); }
      // ---- cheque on an easel trolley, pushed by a stagehand ----
      const bx = lerp(780, CX, pc), BW = 214, BH = 94, BT = 176;
      if (pc > 0) {
        const L0 = bx - BW / 2;
        shadow(g, L0 + 10, 288, BW - 20, 5, 0.7);
        // trolley frame + wheels
        R(g, L0 + 24, BT + BH, 4, 288 - BT - BH, D.n4); R(g, L0 + BW - 28, BT + BH, 4, 288 - BT - BH, D.n4); R(g, L0 + 20, 280, BW - 40, 3, D.n4); R(g, L0 + 20, 280, BW - 40, 1, D.n6);
        const rot = Math.floor(bx * 0.5);
        for (const wx of [L0 + 26, L0 + BW - 26]) { PX.circle(g, wx, 287, 4, D.n2); PX.circle(g, wx, 287, 2, D.n5); R(g, wx + Math.round(Math.cos(rot) * 2), 287 + Math.round(Math.sin(rot) * 2), 1, 1, D.n7); }
        R(g, L0 + BW - 4, BT + 40, 3, 54, D.n5); R(g, L0 + BW - 4, BT + 40, 24, 3, D.n5);     // push handle
        // the cheque board
        A(g, 0.5, () => R(g, L0 + 3, BT + 3, BW, BH, SH(1)));
        R(g, L0, BT, BW, BH, D.paper); R(g, L0, BT, BW, 1, lt(D.paper, 0.4)); R(g, L0 + BW - 2, BT, 2, BH, D.paperD); R(g, L0, BT + BH - 2, BW, 2, D.paperD);
        PX.box(g, L0 + 5, BT + 5, BW - 10, BH - 10, mix(D.paperD, D.steel[2], 0.3));
        // guilloche band along the top (pattern, not text)
        for (let x = L0 + 8; x < L0 + BW - 8; x++) { R(g, x, BT + 11 + Math.round(Math.sin(x * 0.35) * 2), 1, 1, mix(D.paperD, D.teal[2], 0.35)); R(g, x, BT + 11 + Math.round(Math.cos(x * 0.35) * 2), 1, 1, mix(D.paperD, D.steel[2], 0.25)); }
        // company name scribble (illegible) + pay-to line
        R(g, L0 + 12, BT + 20, 44, 2, mix(D.ink, D.paperD, 0.4)); R(g, L0 + 12, BT + 24, 28, 1, mix(D.ink, D.paperD, 0.55));
        R(g, L0 + 12, BT + 40, 62, 1, mix(D.ink, D.paperD, 0.5)); for (let x = 0; x < 50; x++) R(g, L0 + 16 + x, BT + 36 + Math.round(Math.sin(x * 0.7) * 1.5), 1, 1, mix(D.ink, D.paperD, 0.3));
        // amount box
        R(g, L0 + 22, BT + 46, BW - 44, 24, lt(D.paper, 0.5)); PX.box(g, L0 + 22, BT + 46, BW - 44, 24, mix(D.paperD, D.n4, 0.4));
        PX.text(g, "$1,000,000", bx, BT + 50, { size: 16, col: D.ink, align: "center" });
        // memo + signature
        R(g, L0 + 12, BT + 82, 60, 1, mix(D.ink, D.paperD, 0.5));
        for (let x = 0; x < 52; x++) R(g, L0 + BW - 70 + x, BT + 79 + Math.round(Math.sin(x * 0.42) * 3 * Math.sin(x * 0.11)), 1, 1, D.ink);
        R(g, L0 + BW - 72, BT + 82, 60, 1, mix(D.ink, D.paperD, 0.5));
        // spotlight wash across the board
        A(g, 0.12, () => R(g, L0, BT, BW, BH, D.lamp));
        // stagehand
        const moving = pc > 0 && pc < 1, back = PX.p(t, TC + WD + 0.2, 1.0, "io");
        const hx = L0 + BW + 30 + back * 34;
        figure(g, hx, 292, t, { ...HAND, f: back > 0.6 ? 0 : -1, walk: (moving ? t * 9 : back > 0 && back < 1 ? t * 9 : 0), stride: moving ? 1 : back > 0 && back < 1 ? 0.6 : 0,
          aL: back > 0.3 ? -0.1 : -1.35, eL: back > 0.3 ? 0 : -0.2, aR: back > 0.3 ? 0.1 : -1.2, eR: back > 0.3 ? 0 : -0.3, mouth: "flat" });
        shadow(g, hx - 12, 290, 26, 3, 0.5);
      }
      // ---- foreground: press + audience silhouettes with rim light ----
      const fl = (i) => { for (const [ft, hi] of flashes) { const tt = t - (TC + WD + 0.1 + ft); if (hi === i && tt > 0 && tt < 0.14) return 1 - tt / 0.14; } return 0; };
      PX.par(g, c, 1.25, () => {
        heads.forEach(([hx, hy, sc, k], i) => {
          const by = Math.round(Math.sin(t * 0.8 + i) * 0.6), w = Math.round(48 * sc), hr2 = Math.round(10 * sc), rim = mix(D.n3, D.lampD, 0.35);
          for (let rr = 0; rr < 50; rr++) { const ww = Math.min(w, 24 * sc + rr * 3); R(g, hx - ww / 2, hy + 14 + rr + by, ww, 1, D.n0); }
          R(g, hx - 4, hy + 8 + by, 8, 7, D.n0);
          PX.circle(g, hx, hy + by, hr2, D.n0); for (let k = -hr2 + 3; k < hr2 - 3; k++) R(g, hx + k, hy + by - Math.round(Math.sqrt(hr2 * hr2 - k * k)), 1, 1, rim);
          if (k > 0.62) { // press camera held up
            const cx2 = hx + 8, cy2 = hy - 18 + by; R(g, cx2 - 7, cy2, 15, 9, D.n1); R(g, cx2 - 7, cy2, 15, 1, D.n3); R(g, cx2 - 2, cy2 - 3, 6, 3, D.n1); PX.circle(g, cx2, cy2 + 4, 2, D.n2);
            limb(g, hx + 10, hy + 16 + by, cx2 - 4, cy2 + 8, 4, D.n0); R(g, cx2 - 7, cy2 + 1, 1, 7, rim);
            const f2 = arrived ? fl(i) : 0;
            if (f2 > 0) { PX.glow(g, cx2 + 4, cy2 - 2, 40, D.cream, 0.5 * f2); R(g, cx2 + 2, cy2 - 3, 4, 2, D.cream); }
          }
        });
      });
      // a flash also lifts the board a touch
      { let f3 = 0; for (const i of cams) f3 = Math.max(f3, fl(i)); if (f3 > 0 && pc >= 1) A(g, 0.12 * f3, () => R(g, CX - 107, 176, 214, 94, D.cream)); }
      dust(g, t, [100, 60, 100, 200], 11, 16, 0.3); dust(g, t, [320, 60, 150, 200], 12, 22, 0.3);
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // leaderboard (16.0): cramped home office at night, 2007: CRT shows a contest leaderboard; a progress bar toward "10%"
  // climbs and stalls near "8%" (o.stuck 6.0); wall calendar flips month pages 2006 -> 2009 over o.years [1.0, 10.0]
  // (number = start, or [start, end], or o.yearsEnd); "THOUSANDS OF TEAMS" with the list scrolling (o.teams 3.0).
  K.leaderboard = (o) => {
    const SX = 258, SY = 96, SW = 190, SHt = 136, DY = 262;
    const r = PX.rnd(57), rows = [...Array(60)].map(() => [r(), r(), r(), Math.floor(r() * 6)]);
    const city = [...Array(30)].map(() => [r(), r(), r()]);
    const books = [...Array(14)].map(() => [r(), r(), r()]);
    const BADGE = [D.moss[1], D.steel[1], D.teal[1], D.rose[1], D.plum[1], D.paperD];
    const SCR = mix(D.n1, D.steel[2], 0.3), CRTL = mix(D.teal[0], D.steel[0], 0.5);
    return (g, t, d, c) => {
      const TS = tm(o, "stuck", 6.0, d, 16), TT = tm(o, "teams", 3.0, d, 16), [Y0, Y1] = rng(o, "years", 1.0, 10.0, d, 16);
      // progress (fraction of the 10% goal): climbs to 0.8, then creeps and bumps but never reaches the goal
      const cl = TS > 0 ? PX.ease(clamp(t / TS, 0, 1), "out") : 1, af = Math.max(0, t - TS);
      const bump = t > TS ? Math.max(0, Math.sin(af * 1.7)) * 0.012 * Math.min(1, af) : 0;
      const fill = Math.min(0.86, lerp(0.14, 0.8, cl) + (t > TS ? 0.03 * (1 - Math.exp(-af / 3)) : 0) + bump);
      const yp = pr(t, Y0, Y1), pi = Math.min(36, Math.floor(yp * 36)), ff = yp * 36 - Math.floor(yp * 36);
      // ---- far: window with blinds, night city ----
      PX.par(g, c, 0.45, () => {
        PX.vgrad(g, -20, -20, 680, 300, mix(D.n2, D.steel[2], 0.15), D.n1, 8);
        for (let x = -20; x < 680; x += 6) A(g, 0.18, () => R(g, x, -20, 1, 300, D.n1));       // wallpaper pinstripe
        const wx = 26, wy = 48, ww = 150, wh = 118;
        R(g, wx - 5, wy - 5, ww + 10, wh + 12, mix(D.paperD, D.n3, 0.7)); R(g, wx - 5, wy - 5, ww + 10, 1, mix(D.paperD, D.n4, 0.5));
        PX.vgrad(g, wx, wy, ww, wh, dk(D.steel[2], 0.55), mix(D.steel[2], D.n2, 0.55), 5);
        for (const [a, b, k] of city) { const bw = 10 + a * 18, bh = 20 + b * 60, bx = wx + k * (ww - 10); R(g, bx, wy + wh - bh, bw, bh, dk(D.n2, 0.25));
          for (let yy = wy + wh - bh + 4; yy < wy + wh - 2; yy += 6) for (let xx = bx + 2; xx < bx + bw - 2; xx += 4) if (((xx * 7 + yy * 3) % 11) < 2) R(g, xx, yy, 1, 2, Math.sin(t * 0.4 + xx + yy) > -0.7 ? mix(D.lamp, D.n2, 0.35) : D.n3); }
        // blinds: slats with gaps, one bent slat
        for (let s = 0; s < 13; s++) { const yy = wy + 2 + s * 9; R(g, wx, yy, ww, 4, mix(D.paperD, D.n3, 0.62)); R(g, wx, yy, ww, 1, mix(D.paperD, D.n4, 0.35)); if (s === 7) R(g, wx + 40, yy + 4, 30, 2, mix(D.paperD, D.n3, 0.62)); }
        PX.line(g, wx + 30, wy, wx + 30, wy + wh, D.n4); PX.line(g, wx + 120, wy, wx + 120, wy + wh, D.n4);
        // shelf with binders above the monitor
        R(g, 220, 40, 210, 4, mix(WOOD[2], D.n1, 0.3)); R(g, 220, 40, 210, 1, mix(WOOD[1], D.n2, 0.3));
        let bx = 226; for (const [a, b, k] of books) { const bw = 6 + Math.floor(a * 8), bh = 18 + Math.floor(b * 14); if (bx + bw > 424) break;
          const col = dk([D.steel[2], D.paperD, D.teal[2], D.rust[2], D.n5][Math.floor(k * 5)], 0.35); R(g, bx, 40 - bh, bw, bh, col); R(g, bx, 40 - bh, 1, bh, lt(col, 0.15)); R(g, bx + 1, 40 - bh + 4, bw - 2, 2, dk(col, 0.3)); bx += bw + 1; }
        // wall calendar with month pages (year changes every 12 flips)
        const cx = 502, cy = 52, cw = 80, ch = 104;
        R(g, cx + 38, cy - 8, 4, 4, D.n5);
        const page = (k, x, y, w, h) => { // k = month index 0..36
          const yr = 2006 + Math.floor(k / 12), mo = md(k, 12);
          R(g, x, y, w, h, D.paper); R(g, x, y, w, 1, lt(D.paper, 0.4)); R(g, x + w - 1, y, 1, h, D.paperD);
          if (h < 50) return;
          // picture: hills under a season sky
          const sky = [D.steel[2], D.teal[2], mix(D.moss[2], D.steel[2], 0.5), D.paperD][Math.floor(mo / 3)];
          R(g, x + 4, y + 4, w - 8, 36, mix(sky, D.paper, 0.25));
          for (let xx = 0; xx < w - 8; xx++) { const hh = 10 + Math.round(Math.sin(xx * 0.09 + mo) * 5 + Math.sin(xx * 0.23 + k) * 2); R(g, x + 4 + xx, y + 40 - hh, 1, hh, mix(D.moss[2], sky, 0.25 + (mo % 3) * 0.1)); }
          PX.text(g, String(yr), x + w / 2, y + 42, { font: "v", size: 20, col: D.ink, align: "center" });
          for (let rr = 0; rr < 4; rr++) for (let q = 0; q < 7; q++) R(g, x + 8 + q * 9, y + 64 + rr * 9, 5, 5, (rr * 7 + q + mo) % 9 === 0 ? D.rust[1] : mix(D.paperD, D.n5, 0.3));
        };
        A(g, 0.5, () => R(g, cx + 3, cy + 3, cw, ch, SH(1)));
        page(pi, cx, cy, cw, ch);
        if (yp > 0 && yp < 1 && ff < 0.6) { const k = PX.ease(ff / 0.6, "in"), hh = Math.round(ch * (1 - k)); // old page lifting over the hinge
          if (pi > 0) { page(pi - 1, cx, cy, cw, Math.max(1, hh)); A(g, 0.35 * k, () => R(g, cx, cy, cw, Math.max(1, hh), D.n2)); }
          if (k > 0.5) A(g, (k - 0.5) * 1.4, () => R(g, cx + 2, cy - Math.round(10 * (k - 0.5)), cw - 4, 3, D.paperD)); }
        for (let i = 0; i < 8; i++) { R(g, cx + 6 + i * 10, cy - 3, 3, 5, D.n6); R(g, cx + 6 + i * 10, cy - 3, 1, 5, D.n7); }
      });
      // CRT light on the wall
      PX.glow(g, SX + SW / 2, SY + SHt / 2, 240, CRTL, 0.2);
      // ---- desk ----
      R(g, 0, DY, 640, 98, mix(WOOD[2], D.n1, 0.55)); R(g, 0, DY, 640, 26, mix(WOOD[1], D.n1, 0.5)); R(g, 0, DY, 640, 1, mix(WOOD[0], D.n2, 0.3));
      R(g, 0, DY + 26, 640, 3, mix(WOOD[2], D.n0, 0.5)); for (let x = 0; x < 640; x += 37) A(g, 0.25, () => R(g, x, DY + 4 + (x % 5) * 4, 20 + (x % 13), 1, mix(WOOD[0], D.n2, 0.3)));
      // warm desk lamp (right) + pool
      { const lx = 612, ly = DY; R(g, lx - 10, ly - 3, 20, 3, D.n3); PX.line(g, lx, ly - 3, lx - 8, ly - 40, D.n4); PX.line(g, lx - 8, ly - 40, lx - 30, ly - 52, D.n4);
        for (let rr = 0; rr < 8; rr++) R(g, lx - 40 + rr, ly - 56 + rr, 18 - rr, 1, rr < 2 ? D.n5 : D.n3); R(g, lx - 36, ly - 48, 10, 2, D.lamp);
        PX.glow(g, lx - 30, ly - 6, 90, D.lampD, 0.28); A(g, 0.12, () => R(g, lx - 110, ly + 2, 150, 14, D.lamp)); }
      // pizza boxes stack up over the years
      const nbox = Math.min(5, 1 + Math.floor(pi / 8));
      for (let i = 0; i < nbox; i++) { const bx = 478 + ((i * 5) % 7) - 3, by = DY + 10 - (i + 1) * 9;
        A(g, 0.5, () => R(g, bx + 2, by + 9, 84, 2, SH(1)));
        R(g, bx, by, 84, 9, mix(D.paperD, D.n3, 0.25)); R(g, bx, by, 84, 1, mix(D.paper, D.paperD, 0.5)); R(g, bx + 82, by, 2, 9, mix(D.paperD, D.n2, 0.5)); R(g, bx + 30, by + 3, 22, 3, mix(D.rust[2], D.paperD, 0.5)); }
      // mug + steam
      { const mx = 440, my = DY + 2; R(g, mx, my - 16, 14, 16, D.n5); R(g, mx, my - 16, 14, 2, D.n6); R(g, mx + 1, my - 15, 12, 1, D.n2); R(g, mx + 14, my - 12, 4, 8, D.n5); R(g, mx + 2, my - 14, 2, 12, D.n6);
        for (let i = 0; i < 3; i++) { const ph = (t * 0.35 + i / 3) % 1; A(g, 0.22 * Math.sin(ph * Math.PI), () => R(g, mx + 6 + Math.sin(ph * 9 + i) * 3, my - 18 - ph * 30, 2, 3, D.n7)); } }
      // ---- CRT monitor ----
      { const mx = 236, my = 78, mw = 234, mh = 184;
        A(g, 0.5, () => R(g, mx + 6, DY - 2, mw - 12, 5, SH(1)));
        R(g, mx + 30, my + 150, mw - 60, DY - my - 150, BEIGE[2]); R(g, mx + 30, my + 150, mw - 60, 2, BEIGE[1]);     // deep tube housing
        R(g, mx, my, mw, mh - 20, BEIGE[1]); R(g, mx, my, mw, 2, BEIGE[0]); R(g, mx, my, 2, mh - 20, BEIGE[0]); R(g, mx + mw - 4, my, 4, mh - 20, BEIGE[2]); R(g, mx, my + mh - 22, mw, 2, BEIGE[2]);
        R(g, mx + 70, my + mh - 20, mw - 140, 10, BEIGE[2]); R(g, mx + 50, DY - 6, mw - 100, 6, BEIGE[1]); R(g, mx + 50, DY - 6, mw - 100, 1, BEIGE[0]);
        R(g, mx + mw - 30, my + mh - 32, 3, 2, PX.blink(t, 2.4, 0.9) ? D.moss[0] : D.moss[2]); for (let i = 0; i < 4; i++) R(g, mx + 20 + i * 8, my + mh - 31, 5, 2, BEIGE[2]);
        R(g, SX - 4, SY - 4, SW + 8, SHt + 8, BEIGE[3]); }
      // ---- screen contents ----
      g.save(); g.beginPath(); g.rect(SX, SY, SW, SHt); g.clip();
      R(g, SX, SY, SW, SHt, SCR);
      R(g, SX, SY, SW, 14, mix(D.teal[2], D.n2, 0.35)); R(g, SX, SY + 14, SW, 1, mix(D.teal[1], D.n2, 0.3));
      { const ix = SX + 6, iy = SY + 3; R(g, ix, iy, 9, 4, D.cream); R(g, ix + 1, iy + 4, 7, 2, D.cream); R(g, ix + 3, iy + 6, 3, 2, D.cream); R(g, ix + 2, iy + 8, 5, 1, D.cream); R(g, ix - 1, iy + 1, 1, 3, D.paperD); R(g, ix + 9, iy + 1, 1, 3, D.paperD); }
      R(g, SX + 20, SY + 5, 52, 3, mix(D.teal[0], SCR, 0.3)); R(g, SX + 20, SY + 10, 30, 1, mix(D.teal[0], SCR, 0.6));
      for (let i = 0; i < 3; i++) R(g, SX + SW - 38 + i * 11, SY + 5, 8, 4, mix(D.teal[1], SCR, 0.4));
      // list (scrolls through thousands of rows at o.teams)
      const LY = SY + 18, LH = 70, sp = PX.KF([[TT, 0], [TT + 1.4, 1], [TT + 2.6, 1], [TT + 3.6, 0]], t), off = sp * 640;
      g.save(); g.beginPath(); g.rect(SX, LY, SW, LH); g.clip();
      for (let i = Math.floor(off / 12); i < Math.floor(off / 12) + 8; i++) {
        const [a, b, k, bi] = rows[md(i, 60)], y = LY + i * 12 - off, lead = i === 0;
        if (lead) R(g, SX + 2, y, SW - 4, 11, mix(D.teal[2], SCR, 0.3));
        PX.circle(g, SX + 9, y + 5, 3, BADGE[i < 2 ? i : bi]); R(g, SX + 8, y + 3, 1, 1, lt(BADGE[i < 2 ? i : bi], 0.5));
        R(g, SX + 16, y + 3, 26 + Math.floor(a * 30), 3, mix(D.n6, SCR, 0.25 + k * 0.2));
        const sw2 = (SW - 104) * clamp(fill * (1 - Math.min(i, 40) * 0.012) - (i ? b * 0.04 : 0) + Math.sin(t * 2 + i) * 0.004, 0, 1);
        R(g, SX + 92, y + 3, SW - 104, 4, mix(D.n3, SCR, 0.3)); R(g, SX + 92, y + 3, sw2, 4, i === 0 ? D.teal[0] : mix(D.steel[1], SCR, 0.2));
      }
      g.restore();
      if (sp > 0) { R(g, SX + SW - 3, LY, 2, LH, mix(D.n4, SCR, 0.3)); R(g, SX + SW - 3, LY + sp * (LH - 4), 2, 4, D.n7); }
      // progress bar toward the 10% goal
      const PY = SY + 100, PXa = SX + 12, PW = SW - 50;
      R(g, SX + 6, PY - 10, SW - 12, 1, mix(D.n4, SCR, 0.3));
      R(g, PXa - 1, PY - 1, PW + 2, 12, D.n1); R(g, PXa, PY, PW, 10, mix(D.n3, SCR, 0.4));
      const fw = Math.round(PW * fill); R(g, PXa, PY, fw, 10, D.teal[1]); R(g, PXa, PY, fw, 2, D.teal[0]); R(g, PXa, PY + 8, fw, 2, D.teal[2]);
      for (let x = PXa + 4; x < PXa + fw; x += 6) R(g, x, PY + 2, 2, 6, mix(D.teal[1], D.teal[0], 0.4));
      if (t > TS) A(g, 0.3 + 0.3 * Math.sin(t * 4), () => R(g, PXa + fw - 1, PY, 1, 10, D.cream));
      // goal flag at 10%
      R(g, PXa + PW, PY - 8, 1, 20, D.cream); R(g, PXa + PW + 1, PY - 8, 7, 5, D.cream); R(g, PXa + PW + 1, PY - 3, 4, 1, D.paperD);
      PX.text(g, "10%", PXa + PW + 8, PY + 6, { font: "v", size: 16, col: D.cream });
      // the 8% wall
      if (t >= TS) { const a = PX.p(t, TS, 0.5), x8 = PXa + Math.round(PW * 0.8);
        A(g, a, () => { R(g, x8, PY - 4, 1, 18, D.rust[0]); PX.text(g, "8%", x8, PY + 14, { font: "v", size: 16, col: D.rust[0], align: "center" }); }); }
      // scanlines + glare + vignette inside the tube
      for (let y = SY; y < SY + SHt; y += 2) A(g, 0.14, () => R(g, SX, y, SW, 1, D.n0));
      A(g, 0.05, () => { for (let k = 0; k < 40; k++) R(g, SX + 20 + k, SY + 8 + k * 0.9, 30, 1, D.cream); });
      A(g, 0.3, () => { R(g, SX, SY, SW, 2, D.n0); R(g, SX, SY + SHt - 2, SW, 2, D.n0); R(g, SX, SY, 2, SHt, D.n0); R(g, SX + SW - 2, SY, 2, SHt, D.n0); });
      g.restore();
      for (const [x, y] of [[SX, SY], [SX + SW - 1, SY], [SX, SY + SHt - 1], [SX + SW - 1, SY + SHt - 1]]) R(g, x, y, 1, 1, BEIGE[3]);
      PX.glow(g, SX + SW / 2, SY + SHt / 2, 110, CRTL, 0.1);
      PX.glow(g, SX + SW / 2, DY + 14, 170, CRTL, 0.12);
      // keyboard + mouse
      { const kx = 270, ky = DY + 8; A(g, 0.5, () => R(g, kx + 2, ky + 12, 150, 3, SH(1))); R(g, kx, ky, 150, 13, BEIGE[1]); R(g, kx, ky, 150, 1, BEIGE[0]); R(g, kx, ky + 11, 150, 2, BEIGE[2]);
        for (let rr = 0; rr < 3; rr++) for (let q = 0; q < 18; q++) { const press = Math.floor(t * 9 + q * 3 + rr * 5) % 23 === 0 && t < TS + 1; R(g, kx + 4 + q * 8, ky + 2 + rr * 3 + (press ? 1 : 0), 6, 2, press ? BEIGE[2] : BEIGE[0]); }
        A(g, 0.12, () => R(g, kx, ky, 150, 13, CRTL));
        R(g, 432, DY + 12, 10, 7, BEIGE[1]); R(g, 432, DY + 12, 10, 1, BEIGE[0]); PX.line(g, 437, DY + 12, 440, DY + 4, D.n4); }
      // ---- foreground: the contestant from behind (CRT rim light) ----
      { const hx = 194, hy = 198, slump = PX.p(t, TS + 0.8, 1.2, "io"), scratch = PX.p(t, TS + 1.6, 0.7, "io");
        const HO = [mix(D.n5, D.steel[2], 0.35), mix(D.n4, D.steel[2], 0.3), mix(D.n3, D.steel[2], 0.2), D.n2], HR = [mix(D.n4, D.rust[2], 0.2), D.n2, D.n1];
        const RIM = mix(CRTL, HO[0], 0.25), sk = SKINS[1];
        const sy = hy + 22 + Math.round(slump * 3), tl = Math.round(slump * 2), by = Math.round(Math.sin(t * 1.4) * 0.6);
        // right arm to the keyboard (behind the torso edge)
        limb(g, hx + 38, sy + 16, hx + 62, sy + 62, 12, HO[2]); limb(g, hx + 62, sy + 62, hx + 88, DY + 10, 10, HO[1]);
        PX.line(g, hx + 68, sy + 64, hx + 93, DY + 8, RIM); R(g, hx + 86, DY + 6, 9, 6, sk[1]); R(g, hx + 86, DY + 6, 9, 1, sk[0]);
        // torso: rounded shoulders, lit from the screen on the right
        for (let rr = 0; rr < 150; rr++) { const w = Math.round(28 + 76 * Math.sqrt(Math.min(rr, 24) / 24) + Math.max(0, rr - 24) * 0.25), yy = sy + rr + by;
          R(g, hx - w / 2, yy, w, 1, HO[1]); R(g, hx - w / 2, yy, Math.round(w * 0.3), 1, HO[2]); R(g, hx - w / 2, yy, 3, 1, HO[3]); R(g, hx + w / 2 - 9, yy, 8, 1, HO[0]); R(g, hx + w / 2 - 1, yy, 1, 1, RIM); }
        PX.line(g, hx - 18, sy + 30, hx - 22, sy + 120, HO[2]); PX.line(g, hx + 20, sy + 34, hx + 26, sy + 120, HO[2]);
        // hood lying on the back
        for (let rr = 0; rr < 18; rr++) { const w = Math.round(44 - Math.pow(rr / 18, 2) * 30); R(g, hx - w / 2, sy + rr + by, w, 1, rr < 2 ? HO[1] : HO[2]); R(g, hx + w / 2 - 4, sy + rr + by, 4, 1, HO[1]); }
        for (let rr = 2; rr < 12; rr++) { const w = Math.round(30 - Math.pow(rr / 12, 2) * 24); R(g, hx - w / 2, sy + rr + by, w, 1, HO[3]); }
        // neck (in shadow under the hair)
        R(g, hx - 7 + tl, hy + 12, 14, 12, sk[2]); R(g, hx + 3 + tl, hy + 12, 4, 12, sk[1]);
        R(g, hx - 7 + tl, hy + 12, 14, 3, sk[2]);
        // back of head: dark hair with strands, ears, screen rim on the right
        const hcx = hx + tl;
        for (let yy = -17; yy <= 16; yy++) { const w = Math.round(2 * 15.5 * Math.sqrt(Math.max(0, 1 - Math.pow(yy / 17.5, 2)))); R(g, hcx - w / 2, hy + yy, w, 1, HR[1]); R(g, hcx - w / 2, hy + yy, 3, 1, HR[2]); if (yy < 12) R(g, hcx + w / 2 - 2, hy + yy, 2, 1, mix(RIM, HR[0], 0.45)); }
        for (let k = 0; k < 26; k++) { const a = (k * 2.399) % 6.28, rr2 = 3 + ((k * 7) % 11); const sx = hcx + Math.round(Math.cos(a) * rr2), sy2 = hy - 4 + Math.round(Math.sin(a) * rr2 * 1.1); R(g, sx, sy2, 2 + (k % 2), 1, k % 3 ? HR[0] : mix(HR[0], HR[1], 0.5)); }
        R(g, hcx - 18, hy, 3, 8, sk[2]); R(g, hcx + 15, hy, 3, 8, sk[1]); R(g, hcx + 17, hy + 1, 1, 6, sk[0]);
        // left arm: rises to scratch the back of the head after the stall
        if (scratch > 0) {
          const ex = lerp(hx - 50, hx - 54, scratch), ey = lerp(sy + 74, hy + 10, scratch), wx = lerp(hx - 44, hx - 12 + tl, scratch), wy = lerp(sy + 100, hy - 6, scratch);
          limb(g, hx - 38, sy + 16, ex, ey, 12, HO[2]); limb(g, ex, ey, wx, wy, 10, HO[1]); PX.line(g, ex - 5, ey, wx - 5, wy, HO[3]);
          const wig = scratch >= 1 ? Math.round(Math.sin(t * 10) * 1.2) : 0;
          R(g, wx - 5, wy - 4, 8, 8, sk[1]); R(g, wx - 5, wy - 4, 8, 1, sk[0]); for (let f = 0; f < 3; f++) R(g, wx + 2 + wig, wy - 4 + f * 3, 6, 2, f % 2 ? sk[2] : sk[1]);
        }
        // chair back in front of the lower body
        for (let rr = 0; rr < 110; rr++) { const w = rr < 6 ? 60 + rr * 2 : 72, yy = sy + 52 + rr; R(g, hx - w / 2 - 4, yy, w, 1, D.n1); R(g, hx + w / 2 - 7, yy, 3, 1, mix(D.n2, CRTL, 0.25)); }
        for (let yy = sy + 60; yy < 360; yy += 4) A(g, 0.5, () => R(g, hx - 36, yy, 66, 1, D.n0));
      }
      // ---- label ----
      if (t >= TT) label(g, "THOUSANDS OF TEAMS", 352, 58, PX.p(t, TT, 0.5));
      dust(g, t, [240, 80, 220, 160], 21, 14, 0.25);
      PX.vignette(g, 0.55);
    };
  };

  // ---------- team badges (round pin buttons with simple symbols) ----------
  const SYM = {
    star: ["..#..", ".###.", "#####", ".#.#.", "#...#"], tri: ["..#..", ".#.#.", ".#.#.", "#...#", "#####"], ring: [".###.", "#...#", "#...#", "#...#", ".###."],
    wave: [".....", ".#...", "#.#.#", "...#.", "....."], bolt: ["...#.", "..#..", ".###.", "..#..", ".#..."], leaf: ["...##", ".####", "#.##.", ".##..", "#...."],
    cross: ["..#..", "..#..", "#####", "..#..", "..#.."], sq: ["#####", "#...#", "#.#.#", "#...#", "#####"], dia: ["..#..", ".#.#.", "#...#", ".#.#.", "..#.."], dots: [".....", "#...#", ".....", "..#..", "....."],
  };
  const SYM7 = { leaf: ["....###", "..#####", ".####.#", ".###.#.", "..#.##.", ".#.....", "#......"], bolt: ["....##.", "...##..", "..##...", ".#####.", "...##..", "..##...", ".##...."] };
  const SYMK = ["star", "tri", "ring", "wave", "cross", "sq", "dia", "dots"];
  const badge = (g, x, y, col, sym, r) => {
    r = r || 7; x = Math.round(x); y = Math.round(y);
    A(g, 0.45, () => PX.circle(g, x + 2, y + 2, r, SH(1)));
    PX.circle(g, x, y, r, col[2]); PX.circle(g, x - 0.5, y - 0.5, r - 1, col[1]);
    R(g, x - r + 2, y - 2, 1, 3, col[0]); R(g, x - 2, y - r + 1, 4, 1, col[0]); R(g, x - r + 3, y - r + 3, 2, 1, lt(col[0], 0.5));
    if (r >= 9 && SYM7[sym]) PX.sprite(g, SYM7[sym], x - 3, y - 3, { "#": D.cream }); else PX.sprite(g, SYM[sym], x - 2, y - 2, { "#": D.cream });
  };

  // ===================================================================================================
  // merge (6.0): team badges drift on a lamp-lit cork board, snap into clusters of four (o.m1 1.0), then clusters merge
  // again (o.m2 3.0) until two super-teams remain: moss "leaf" team (left) and steel "bolt" team (right).
  K.merge = (o) => {
    const BX = 92, BY = 44, BW = 456, BH = 246;
    const r = PX.rnd(83), specks = [...Array(1500)].map(() => [r(), r(), r()]);
    const C1 = [[172, 112], [186, 226], [286, 152], [356, 204], [456, 112], [468, 226]], C2 = [[226, 168], [414, 168]];
    // hex lattice slots sorted by distance (12 per super-team), 2x2 slots per small cluster
    const hex = [[0, 0], ...[...Array(11)].map((_, k) => { const an = -Math.PI / 2 + (k * 2 * Math.PI) / 11; return [Math.cos(an) * 27, Math.sin(an) * 26]; })];
    const Q4 = [[-9, -8], [9, -8], [-9, 8], [9, 8]];
    const COLS = [D.teal, D.rose, D.plum, D.rust, D.moss, D.steel, [lt(D.paperD, 0.3), D.paperD, mix(D.paperD, D.n3, 0.5)]];
    // jittered start positions, shuffled so cluster mates start apart
    const starts = []; for (let j = 0; j < 4; j++) for (let i = 0; i < 6; i++) starts.push([BX + 50 + i * 72 + (r() - 0.5) * 34, BY + 40 + j * 54 + (r() - 0.5) * 26]);
    for (let i = starts.length - 1; i > 0; i--) { const k = Math.floor(r() * (i + 1)); [starts[i], starts[k]] = [starts[k], starts[i]]; }
    const B = [...Array(24)].map((_, i) => {
      const c = Math.floor(i / 4), team = c < 3 ? 0 : 1, slot2 = (c - team * 3) * 4 + (i % 4);
      const lead = i === 0 || i === 12;
      return { c, team, k2: slot2, s1: Q4[i % 4], s2: hex[slot2], home: starts[i], ph: r() * 6.28, sp: 0.5 + r() * 0.6,
        col: lead ? TEAM[team] : COLS[Math.floor(r() * COLS.length)], sym: lead ? (team ? "bolt" : "leaf") : SYMK[Math.floor(r() * SYMK.length)] };
    });
    const WALL = mix(D.n2, D.steel[2], 0.15), CORK = [mix(mix(D.paperD, D.rust[2], 0.3), D.n3, 0.3), mix(mix(D.paperD, D.rust[2], 0.35), D.n2, 0.5), mix(D.rust[2], D.n1, 0.6)];
    return (g, t, d, c) => {
      const T1 = tm(o, "m1", 1.0, d, 6), T2 = tm(o, "m2", 3.0, d, 6);
      // ---- far: wall, window light, shelf silhouettes ----
      PX.par(g, c, 0.5, () => {
        PX.vgrad(g, -30, -30, 700, 420, WALL, D.n1, 8);
        for (let k = 0; k < 4; k++) A(g, 0.05, () => { for (let y = -30; y < 360; y++) R(g, 560 + k * 14 + y * 0.35, y, 6, 1, D.steel[0]); });
        R(g, 590, 40, 60, 3, D.n3); for (let i = 0; i < 5; i++) R(g, 596 + i * 9, 20 - (i % 2) * 4, 7, 20 + (i % 2) * 4, dk(D.n4, 0.2));
      });
      // ---- board ----
      A(g, 0.5, () => R(g, BX + 6, BY + 8, BW, BH, SH(1)));
      R(g, BX - 9, BY - 9, BW + 18, BH + 18, WOOD[2]); R(g, BX - 9, BY - 9, BW + 18, 2, WOOD[0]); R(g, BX - 9, BY - 9, 2, BH + 18, WOOD[1]); R(g, BX - 9, BY + BH + 7, BW + 18, 2, dk(WOOD[2], 0.4));
      R(g, BX, BY, BW, BH, CORK[1]);
      for (const [a, b, k] of specks) R(g, BX + a * BW, BY + b * BH, k > 0.8 ? 2 : 1, 1, k < 0.45 ? CORK[0] : k < 0.9 ? CORK[2] : lt(CORK[0], 0.2));
      // lamp light falloff across the cork (warm top-left, dark corners)
      { const gr = g.createRadialGradient(BX + 130, BY + 30, 30, BX + 130, BY + 30, 480); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.6)"); g.fillStyle = gr; g.fillRect(BX, BY, BW, BH); }
      PX.glow(g, BX + 130, BY + 40, 240, D.lampD, 0.16);
      // other papers on the board (scribbles, no text)
      const note = (x, y, w, h, col, rot) => { A(g, 0.4, () => R(g, x + 2, y + 2, w, h, SH(1))); R(g, x, y, w, h, col); R(g, x, y, w, 1, lt(col, 0.3)); for (let l = 0; l < (h - 8) / 5; l++) R(g, x + 4, y + 6 + l * 5, w - 8 - ((l * 7) % 9), 1, mix(col, D.ink, 0.35)); R(g, x + w / 2 - 1, y + 1, 3, 3, D.rust[1]); };
      note(BX + 14, BY + 160, 40, 52, D.paper); note(BX + BW - 54, BY + 14, 42, 34, mix(D.paper, D.moss[0], 0.25)); note(BX + BW - 46, BY + BH - 58, 36, 46, D.paperD);
      // ---- badges ----
      const e1 = (b) => PX.p(t, T1 + b.c * 0.07, 0.6, "back"), e2 = (b) => PX.p(t, T2 + (b.c % 3) * 0.08, 0.7, "back");
      const pos = (b) => {
        const k1 = e1(b), k2 = e2(b), dr = (1 - clamp(k1, 0, 1)) * 3 + 0.4;
        const hx = b.home[0] + Math.sin(t * 0.7 * b.sp + b.ph) * dr * 2, hy = b.home[1] + Math.cos(t * 0.55 * b.sp + b.ph) * dr;
        // after the merge the outer ring turns slowly (the two teams in opposite directions)
        const rot = b.k2 ? Math.max(0, t - T2 - 0.8) * 0.12 * (b.team ? -1 : 1) : 0, an = -Math.PI / 2 + (b.k2 - 1) * 2 * Math.PI / 11 + rot;
        const s2 = b.k2 ? [Math.cos(an) * 27, Math.sin(an) * 26] : [0, 0];
        const p1 = [C1[b.c][0] + b.s1[0], C1[b.c][1] + b.s1[1]], p2 = [C2[b.team][0] + s2[0], C2[b.team][1] + s2[1]];
        const x1 = lerp(hx, p1[0], k1), y1 = lerp(hy, p1[1], k1);
        return [lerp(x1, p2[0], k2) + Math.sin(t * 1.1 + b.ph) * 0.4, lerp(y1, p2[1], k2)];
      };
      // threads: small loops after m1 (fade at m2), big team loops after m2
      const loop = (cx, cy, rx, ry, col, a, n, ph) => { if (a <= 0) return; A(g, a, () => { for (let i = 0; i < n; i++) { const an = (i / n) * 6.283 + (ph || 0); R(g, cx + Math.cos(an) * rx, cy + Math.sin(an) * ry, 1, 1, col); } }); };
      const s1a = clamp((t - T1 - 0.5) / 0.4, 0, 1) * (1 - clamp((t - T2) / 0.3, 0, 1));
      for (let ci = 0; ci < 6; ci++) loop(C1[ci][0], C1[ci][1], 22, 20, D.paper, s1a * 0.8, 140);
      const s2a = clamp((t - T2 - 0.7) / 0.5, 0, 1);
      for (let tm2 = 0; tm2 < 2; tm2++) { const [cx, cy] = C2[tm2], col = TEAM[tm2][0];
        loop(cx, cy, 46, 44, col, s2a, 320); loop(cx, cy, 47, 45, dk(col, 0.35), s2a * 0.8, 320, 0.01);
        for (const an of [0.8, 2.4, 3.9, 5.5]) if (s2a > 0) A(g, s2a, () => { const px = cx + Math.cos(an) * 46, py = cy + Math.sin(an) * 44; A(g, 0.5, () => R(g, px, py + 1, 3, 2, SH(1))); R(g, px - 1, py - 1, 3, 3, TEAM[tm2][1]); R(g, px - 1, py - 1, 1, 1, TEAM[tm2][0]); }); }
      // badges (draw by y so lower ones overlap)
      const P = B.map((b) => [b, pos(b)]).sort((a, b2) => a[1][1] - b2[1][1]);
      for (const [b, [x, y]] of P) badge(g, x, y, b.col, b.sym, b === B[0] || b === B[12] ? Math.round(lerp(7, 10, e2(b))) : 7);
      // snap flashes
      for (let ci = 0; ci < 6; ci++) { const ft = t - (T1 + ci * 0.07 + 0.42); if (ft > 0 && ft < 0.35) loop(C1[ci][0], C1[ci][1], 12 + ft * 40, 11 + ft * 36, D.cream, 0.5 * (1 - ft / 0.35), 90); }
      for (let tm2 = 0; tm2 < 2; tm2++) { const ft = t - (T2 + 0.6); if (ft > 0 && ft < 0.45) loop(C2[tm2][0], C2[tm2][1], 30 + ft * 50, 26 + ft * 46, D.cream, 0.5 * (1 - ft / 0.45), 180); }
      // ---- clip lamp at the top-left of the board ----
      PX.par(g, c, 1.1, () => {
        R(g, BX + 40, BY - 12, 10, 5, D.n3); PX.line(g, BX + 45, BY - 12, BX + 60, BY - 34, D.n4); PX.line(g, BX + 46, BY - 12, BX + 61, BY - 34, D.n5);
        for (let rr = 0; rr < 12; rr++) R(g, BX + 52 + rr * 0.6, BY - 42 + rr, 22 - rr * 0.5, 1, rr < 3 ? D.n5 : D.n3);
        R(g, BX + 58, BY - 30, 16, 2, D.lamp); PX.glow(g, BX + 66, BY - 28, 30, D.lamp, 0.35);
        // desk edge + mug + pin box in the foreground
        R(g, -20, 318, 680, 60, D.n1); R(g, -20, 318, 680, 2, mix(WOOD[1], D.n2, 0.5));
        R(g, 520, 296, 22, 24, D.n3); R(g, 520, 296, 22, 2, D.n5); R(g, 542, 302, 5, 10, D.n3); A(g, 0.3, () => R(g, 523, 298, 3, 20, D.n6));
        R(g, 96, 308, 40, 12, D.n4); R(g, 96, 308, 40, 1, D.n6); for (let i = 0; i < 7; i++) R(g, 100 + i * 5, 305 - (i % 2), 2, 2, [D.rust[1], D.teal[1], D.moss[1]][i % 3]);
      });
      dust(g, t, [BX, BY - 20, 220, 180], 33, 20, 0.35);
      PX.vignette(g, 0.55);
    };
  };

  // side-view runner (~84 px), x = hip x, y = ground. ph = stride phase, st = stride 0..1, o: skin, hair, shirt ([l,b,s]),
  // sym (jersey symbol), arms "run"|"up", face "effort"|"smile"|"down"
  const runner = (g, x, y, ph, st, o) => {
    const sk = o.skin, hr = o.hair, sh = o.shirt, SHO = [D.n4, D.n3, D.n2];
    const bob = -Math.round(Math.abs(Math.cos(ph)) * 2 * st), lean = 0.12 + 0.1 * st;
    const hipX = x, hipY = y - 35 + bob, topX = hipX + Math.round(Math.sin(lean) * 26), topY = hipY - 25;
    const leg = (p, cols) => {
      const th = 0.85 * Math.sin(p) * st, ka = (0.2 + 1.3 * Math.max(0, Math.cos(p))) * st + 0.05;
      const kx = hipX + Math.sin(th) * 18, ky = hipY + Math.cos(th) * 18, fi = th - ka;
      const fx = kx + Math.sin(fi) * 18, fy = Math.min(y, ky + Math.cos(fi) * 18);
      limb(g, hipX, hipY, kx, ky, 6, cols[0]); limb(g, kx, ky, fx, fy, 5, cols[1]);
      R(g, fx - 2, fy - 2, 8, 3, cols[2]); R(g, fx - 2, fy - 2, 8, 1, lt(cols[2], 0.3));
    };
    const arm = (q, cols, up) => {
      const al = up ? 2.75 : -0.95 * Math.sin(q) * st, be = up ? al + 0.25 : al + 1.45;
      const sx = topX, sy = topY + 4, ex = sx + Math.sin(al) * 12, ey = sy + Math.cos(al) * 12, hx = ex + Math.sin(be) * 11, hy = ey + Math.cos(be) * 11;
      limb(g, sx, sy, ex, ey, 4, cols[0]); limb(g, ex, ey, hx, hy, 4, cols[1]); R(g, hx - 1, hy - 1, 4, 4, cols[1]);
    };
    const far = [dk(sk[2], 0.15), dk(sk[2], 0.2), dk(SHO[2], 0.2)], near = [sk[1], sk[1], D.n1];
    arm(ph, [dk(sh[2], 0.2), dk(sk[2], 0.15)], o.arms === "up");
    leg(ph + Math.PI, far);
    // shorts + torso (jersey leaning forward)
    for (let r = 0; r <= 25; r++) { const k = r / 25, cx = Math.round(lerp(topX, hipX, k)), w = Math.round(lerp(13, 11, k)), yy = topY + r;
      R(g, cx - w / 2, yy, w, 1, sh[1]); R(g, cx + w / 2 - 3, yy, 3, 1, sh[0]); R(g, cx - w / 2, yy, 2, 1, sh[2]); }
    R(g, hipX - 6, hipY - 3, 13, 9, SHO[1]); R(g, hipX - 6, hipY - 3, 13, 1, SHO[0]); R(g, hipX + 4, hipY - 3, 3, 9, SHO[2]);
    PX.sprite(g, SYM[o.sym], Math.round(lerp(topX, hipX, 0.35)) - 1, topY + 6, { "#": D.cream });
    leg(ph, [sk[1], sk[1], D.n1]);
    // head (profile facing right)
    const hx = topX + 3, hy = topY - 15;
    R(g, topX - 1, topY - 3, 5, 4, sk[2]);
    for (let r = 0; r < 13; r++) { const w = r < 2 || r > 10 ? 9 : 11; R(g, hx - w / 2, hy + r, w, 1, sk[1]); R(g, hx - w / 2, hy + r, 2, 1, sk[2]); R(g, hx + w / 2 - 1, hy + r, 1, 1, sk[0]); }
    R(g, hx - 6, hy - 1, 11, 4, hr[1]); R(g, hx - 6, hy - 1, 11, 1, hr[0]); R(g, hx - 6, hy + 2, 4, 5, hr[1]); R(g, hx - 6, hy + 6, 2, 2, hr[2]);
    R(g, hx - 2, hy + 5, 2, 3, sk[2]);                                           // ear
    R(g, hx + 5, hy + 6, 1, 2, sk[1]);                                           // nose
    const fc = o.face || "effort";
    R(g, hx + 1, hy + 4 - (fc === "effort" ? 0 : 1), 3, 1, hr[2]);                // brow
    if (fc === "down") R(g, hx + 2, hy + 6, 2, 1, D.ink); else R(g, hx + 2, hy + 5, 1, 2, D.ink);
    if (fc === "effort") R(g, hx + 3, hy + 9, 2, 2, dk(sk[2], 0.5)); else if (fc === "smile") { R(g, hx + 1, hy + 9, 4, 1, dk(sk[2], 0.45)); R(g, hx + 4, hy + 8, 1, 1, dk(sk[2], 0.45)); } else R(g, hx + 2, hy + 10, 3, 1, dk(sk[2], 0.4));
    arm(ph + Math.PI, near, o.arms === "up");
    return { chest: topX + 7 };
  };

  // ===================================================================================================
  // photo_finish (8.5): night stadium, side view; two super-team runners (moss "leaf", steel "bolt") cross almost together;
  // at o.finish (3.5) the frame freezes into a photo-finish print and a timestamp strip shows "20 MINUTES" between their
  // marks; at o.win (5.5) colour returns, the moss runner raises both arms, quiet confetti.
  K.photo_finish = (o) => {
    const V = 150, XL0 = 368, GY = 226, TY = 306;
    const r = PX.rnd(97), crowd = [...Array(560)].map(() => [r(), r(), r()]), conf = [...Array(70)].map(() => [r(), r(), r(), r()]);
    const RA = { skin: SKINS[2], hair: [D.n3, D.n1, D.n0], shirt: [D.moss[0], D.moss[1], D.moss[2]], sym: "leaf" };
    const RB = { skin: SKINS[0], hair: [lt(D.paperD, 0.2), D.paperD, mix(D.paperD, D.n3, 0.5)], shirt: [D.steel[0], D.steel[1], D.steel[2]], sym: "bolt" };
    const SKY = [D.n0, mix(D.n1, D.steel[2], 0.3)];
    return (g, t, d, c) => {
      const TF = tm(o, "finish", 3.5, d, 8.5), TW = tm(o, "win", 5.5, d, 8.5), TU = Math.max(TF + 1.2, TW - 0.3);
      const frozen = t >= TF && t < TU, tau = Math.max(0, t - TU), post = t >= TU;
      const tw = Math.min(t, TF);                       // world time (frozen at the finish)
      const S = V * tw;                                 // camera scroll while tracking
      const XL = t < TF ? XL0 + (TF - t) * V : XL0;     // finish line on screen
      const ease = 1 - Math.exp(-tau * 1.0), wph = 11 * (1 - Math.exp(-0.8 * tau)) / 0.8, st = post ? 0.25 + 0.75 * Math.exp(-0.8 * tau) : 1;
      const SHIFT = 18, TYs = TY - SHIFT;               // world drawn 18 px up so the strip sits inside the safe area
      g.save(); g.translate(0, -SHIFT);
      // ---- far: sky, floodlights, stands ----
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -30, -30, 700, 140, SKY[0], SKY[1], 6);
        for (let i = -1; i < 4; i++) { const tx = md(Math.round(i * 260 - S * 0.12), 1040) - 200;
          R(g, tx, 20, 4, 90, D.n2); R(g, tx - 14, 14, 32, 12, D.n3);
          for (let a = 0; a < 4; a++) for (let b = 0; b < 2; b++) R(g, tx - 12 + a * 8, 16 + b * 5, 6, 3, D.lamp);
          PX.glow(g, tx + 2, 20, 70, D.lamp, 0.22); }
        // stand tiers with crowd heads
        R(g, -30, 92, 700, 120, mix(D.n2, D.steel[2], 0.2));
        for (let k = 0; k < 7; k++) { const yy = 96 + k * 16; R(g, -30, yy + 12, 700, 2, D.n1); }
        for (const [a, b, k] of crowd) { const x = md(Math.round(a * 760 - S * 0.3), 760) - 60, row = Math.floor(b * 7), yy = 98 + row * 16 + Math.round(Math.sin(t * 2 + a * 40) * (post ? 1 : 0.4));
          const col = mix([D.paperD, D.steel[1], D.teal[1], D.rose[2], D.n5][Math.floor(k * 5)], D.n2, 0.55 + row * 0.03);
          R(g, x, yy, 4, 4, col); R(g, x - 1, yy + 4, 6, 6, dk(col, 0.25)); }
        for (const [a, b, k] of crowd.slice(0, 40)) { const ft = (t * 0.7 + k * 9) % 3; if (ft < 0.06 && !frozen) { const x = md(Math.round(a * 760 - S * 0.3), 760) - 60; PX.glow(g, x, 100 + Math.floor(b * 7) * 16, 10, D.cream, 0.5); } }
        A(g, 0.35, () => PX.vgrad(g, -30, 150, 700, 62, mix(D.n2, D.steel[2], 0.2), D.n1, 4));
      });
      // ---- mid: barrier wall + track ----
      PX.par(g, c, 0.8, () => {
        R(g, -30, 206, 700, 20, D.n2); R(g, -30, 206, 700, 2, D.n4);
        for (let i = 0; i < 12; i++) { const x = md(Math.round(i * 80 - S * 0.8), 960) - 80; R(g, x, 209, 60, 13, mix(D.n3, D.teal[2], 0.3)); R(g, x, 209, 60, 1, mix(D.n4, D.teal[2], 0.3)); }
      });
      const TRK = [mix(D.rust[2], D.n2, 0.35), mix(D.rust[2], D.n2, 0.5)];
      R(g, 0, GY, 640, TY - GY, TRK[0]);
      for (let k = 0; k < 4; k++) R(g, 0, GY + k * 20 + 10, 640, 10, k % 2 ? TRK[1] : TRK[0]);
      for (let k = 0; k <= 4; k++) R(g, 0, GY + k * 20, 640, 1, mix(D.cream, TRK[0], 0.45));
      for (let i = 0; i < 40; i++) { const x = md(Math.round(i * 37 - S), 680) - 20; A(g, 0.3, () => R(g, x, GY + 3 + ((i * 13) % 76), 2, 1, D.n1)); }
      PX.glow(g, 320, GY - 20, 320, D.lampD, 0.08);
      // finish line + post with the photo-finish camera
      if (XL < 700) {
        for (let y = GY; y < TY; y++) R(g, XL + Math.round((TY - y) * 0.08), y, 2, 1, D.cream);
        const px = XL + 8; R(g, px, 132, 3, GY - 132, D.n5); R(g, px, 132, 1, GY - 132, D.n6); R(g, px - 6, 124, 16, 10, D.n3); R(g, px - 6, 124, 16, 1, D.n5); R(g, px - 10, 127, 4, 4, D.n2);
        R(g, px + 7, 126, 2, 2, PX.blink(t, 0.8, 0.5) || frozen ? D.rust[0] : D.rust[2]);
      }
      // ---- runners ----
      const rel = 3 + 5 * Math.sin(0.9 * (tw - TF) + 1) * clamp((TF - tw) / 2.5, 0, 1);
      const phA = (post ? 11 * TF + wph : 11 * tw), phB = phA + 2.6;
      const xA = XL0 - 4 + rel / 2 + (post ? ease * 112 : 0), xB = XL0 - 7 - rel / 2 + (post ? ease * 96 : 0);
      for (const [x, yy] of [[xA, 254], [xB, 298]]) A(g, 0.4, () => R(g, x - 10, yy - 1, 24, 2, SH(1)));
      runner(g, xA - 7, 254, phA, st, { ...RA, arms: post && tau > 0.6 ? "up" : "run", face: post && tau > 0.4 ? "smile" : "effort" });
      runner(g, xB - 7, 298, phB, st, { ...RB, face: post && tau > 0.8 ? "down" : "effort" });
      // ---- foreground infield edge ----
      R(g, 0, TY, 640, 4, mix(D.cream, D.n3, 0.5)); R(g, 0, TY + 4, 640, 80, mix(D.moss[2], D.n1, 0.65));
      for (let i = 0; i < 60; i++) { const x = md(Math.round(i * 23 - S * 1.2), 680) - 20; R(g, x, TY + 6 + ((i * 7) % 10), 1, 3, mix(D.moss[2], D.n1, 0.4)); }
      g.restore();
      // ---- the freeze: monochrome print, scan line, frame brackets ----
      if (t >= TF) {
        const mono = frozen ? 1 : clamp(1 - tau / 0.6, 0, 1);
        if (mono > 0) {
          const op = g.globalCompositeOperation; g.globalCompositeOperation = "color"; A(g, 0.85 * mono, () => R(g, 0, 0, 640, 360, mix(D.paperD, D.steel[2], 0.35))); g.globalCompositeOperation = op;
          A(g, 0.06 * mono, () => R(g, 0, 0, 640, 360, D.paper));
          A(g, mono, () => { for (let y = 0; y < 360; y += 3) R(g, XL0 + Math.round((TYs - Math.min(y, TYs)) * 0.08), y, 1, 2, D.cream);
            for (const [bx, by, sx2, sy2] of [[20, 16, 1, 1], [620, 16, -1, 1], [20, 272, 1, -1], [620, 272, -1, -1]]) { R(g, bx - (sx2 < 0 ? 14 : 0), by, 14, 1, D.cream); R(g, bx - (sx2 < 0 ? 0 : 0), by - (sy2 < 0 ? 13 : 0), 1, 14, D.cream); } });
        }
        const fl = 1 - clamp((t - TF) / 0.18, 0, 1); if (fl > 0) A(g, 0.6 * fl, () => R(g, 0, 0, 640, 360, D.cream));
      }
      // ---- confetti for the winner ----
      if (post && TW < 90) {
        const e = Math.max(0, t - TW);
        for (const [a, b, s2, k] of conf) { const y = 30 + e * (55 + s2 * 30) - b * 80, x = xA - 70 + a * 150 + Math.sin(e * 1.4 + k * 6) * 8;
          if (y < -4 || y > TYs) continue; const fl2 = md(Math.floor(e * 6 + k * 10), 3), col = [D.cream, D.moss[0], D.paper, D.teal[0]][Math.floor(k * 4)];
          A(g, clamp(e * 2, 0, 1) * 0.85, () => R(g, x, y, fl2 === 0 ? 3 : fl2 === 1 ? 2 : 1, fl2 === 2 ? 1 : 2, col)); }
      }
      // ---- timestamp strip ----
      if (t >= TF + 0.3) {
        const sp = PX.p(t, TF + 0.3, 0.5, "out"), sy = Math.round(lerp(368, 292, sp));
        R(g, 0, sy, 640, 80, D.n1); R(g, 0, sy, 640, 1, D.n4); R(g, 0, sy + 39, 640, 1, D.n0);
        for (let x = 6; x < 640; x += 14) { R(g, x, sy + 3, 6, 3, D.n0); R(g, x, sy + 34, 6, 3, D.n0); }
        for (let x = 20; x < 620; x += 8) R(g, x, sy + 22, 1, x % 40 === 20 ? 6 : 3, D.n6);
        R(g, 20, sy + 28, 600, 1, D.n5);
        const ma = XL0 - 22, mb = XL0 + 22;
        for (const [mx, col] of [[ma, D.moss[0]], [mb, D.steel[0]]]) { R(g, mx, sy + 18, 1, 12, col); for (let k = 0; k < 4; k++) R(g, mx - k, sy + 14 + k, 2 * k + 1, 1, col); }
        R(g, ma, sy + 31, mb - ma + 1, 1, D.cream); R(g, ma, sy + 29, 1, 3, D.cream); R(g, mb, sy + 29, 1, 3, D.cream);
        label(g, "20 MINUTES", XL0, sy + 4, PX.p(t, TF + 0.6, 0.4));
      }
      PX.vignette(g, 0.5);
    };
  };

  // tiny person avatar (5x6) for spreadsheet rows / strips
  const avatar = (g, x, y, col) => { R(g, x + 1, y, 3, 3, col); R(g, x, y + 4, 5, 2, col); };

  // ===================================================================================================
  // shrink (9.0): dark open-plan office at night; the wall-screen spreadsheet (avatar rows x teal video columns) compresses
  // (o.shrink [1.0, 4.0]: number = start, [start, end], or o.shrinkEnd) into two thin strips of little bars, a person strip
  // and a movie strip; "50 NUMBERS" beside each at o.label (5.0).
  K.shrink = (o) => {
    const WX = 100, WY = 34, WW = 440, WH = 220, GX = 132, GY = 66, NC = 30, NR = 13, P = 13, CS = 11;
    const SBX = 152, SP = 7, YP = 112, YM = 190;
    const r = PX.rnd(19);
    const lit = [...Array(NR * NC)].map(() => r() < 0.17);
    const pv = [...Array(50)].map((_, i) => Math.round((Math.sin(i * 1.7) * 0.6 + (r() - 0.5) * 1.1) * 15));
    const mv = [...Array(50)].map((_, i) => Math.round((Math.sin(i * 1.7 + 0.5) * 0.5 + (r() - 0.5) * 1.2) * 15));
    // every cell flies into a bar; strip = 0 (person) or 1 (movie); start order by distance from the grid centre
    const cells = [], cnt = [0, 0];
    for (let rr = 0; rr < NR; rr++) for (let cc = 0; cc < NC; cc++) {
      const x = GX + cc * P, y = GY + rr * P, strip = r() < 0.5 ? 0 : 1, bar = (cnt[strip]++ * 17) % 50;
      cells.push({ x, y, rr, cc, strip, bar, on: lit[rr * NC + cc], d: Math.hypot(cc - NC / 2, (rr - NR / 2) * 1.6) + r() * 2 });
    }
    const dmax = Math.max(...cells.map((q) => q.d));
    const hits = [[...Array(50)].map(() => 0), [...Array(50)].map(() => 0)]; cells.forEach((q) => hits[q.strip][q.bar]++);
    const desks = [...Array(6)].map((_, i) => [i * 118 - 30 + r() * 20, r()]);
    const SCRL = mix(D.teal[0], D.steel[0], 0.4);
    return (g, t, d, c) => {
      const [S0, S1] = rng(o, "shrink", 1.0, 4.0, d, 9), TL = tm(o, "label", 5.0, d, 9);
      const fly = 0.9, span = Math.max(0.1, S1 - S0 - fly);
      const ct = (q) => S0 + (1 - q.d / dmax) * span;   // the edges collapse first, the centre last
      // ---- far: office wall, ceiling, pillars ----
      PX.par(g, c, 0.5, () => {
        PX.vgrad(g, -30, -30, 700, 420, mix(D.n1, D.steel[2], 0.12), D.n0, 8);
        for (const px of [30, 610]) { R(g, px - 14, -30, 28, 330, D.n1); R(g, px + 12, -30, 2, 330, mix(D.n2, SCRL, 0.15)); }
        R(g, -30, 2, 700, 6, D.n1); for (let x = 40; x < 640; x += 120) { R(g, x, 8, 1, 14, D.n3); R(g, x - 10, 22, 21, 3, D.n2); R(g, x - 8, 25, 17, 1, D.n3); }
      });
      PX.glow(g, WX + WW / 2, WY + WH / 2, 330, SCRL, 0.16);
      // ---- wall screen ----
      R(g, WX - 6, WY - 6, WW + 12, WH + 12, D.n0); R(g, WX - 6, WY - 6, WW + 12, 1, D.n3); R(g, WX - 6, WY + WH + 5, WW + 12, 1, D.n2);
      R(g, WX, WY, WW, WH, mix(D.n1, D.steel[2], 0.22));
      g.save(); g.beginPath(); g.rect(WX, WY, WW, WH); g.clip();
      const gridA = 1 - pr(t, S0 + span * 0.5, S1);              // grid furniture fades as the cells leave
      // header: teal video squares, row avatars, grid lines
      A(g, gridA, () => {
        for (let cc = 0; cc < NC; cc++) vidSq(g, GX + cc * P + 2, GY - 12, 7);
        for (let rr = 0; rr < NR; rr++) avatar(g, GX - 11, GY + rr * P + 3, mix(D.cream, D.n5, 0.2));
        for (let cc = 0; cc <= NC; cc++) R(g, GX + cc * P - 1, GY - 1, 1, NR * P, mix(D.n3, D.steel[2], 0.3));
        for (let rr = 0; rr <= NR; rr++) R(g, GX - 1, GY + rr * P - 1, NC * P, 1, mix(D.n3, D.steel[2], 0.3));
      });
      // cells: sit, then fly into their bar (shrinking)
      for (const q of cells) {
        const s0 = ct(q), k = PX.p(t, s0, fly, "io");
        if (k >= 1) continue;
        const tx = SBX + q.bar * SP + 2, ty = q.strip ? YM : YP;
        const x = lerp(q.x, tx, k), y = lerp(q.y, ty, k) - Math.sin(k * Math.PI) * 18, s = Math.max(2, Math.round(lerp(CS, 2, k)));
        const tw = q.on ? 0.75 + 0.25 * Math.sin(t * 1.3 + q.cc * 0.7 + q.rr) : 0;
        const base = q.on ? mix(mix(D.paper, D.teal[0], 0.35), D.n2, 0.2 * (1 - tw)) : mix(D.n2, D.steel[2], 0.25);
        if (k > 0) A(g, 0.6 + 0.4 * k, () => R(g, x, y, s, s, k > 0.5 ? (q.strip ? D.teal[0] : D.cream) : base));
        else { R(g, x, y, s, s, base); if (q.on) R(g, x, y, s, 1, lt(base, 0.25)); }
      }
      // the two strips: bars grow as cells arrive
      for (let sI = 0; sI < 2; sI++) {
        const yb = sI ? YM : YP, vals = sI ? mv : pv, col = sI ? D.teal : [D.cream, D.paper, D.paperD];
        const sa = pr(t, S0 + span * 0.2, S0 + span * 0.5);
        if (sa <= 0) continue;
        A(g, sa, () => { R(g, SBX - 4, yb, 50 * SP + 6, 1, mix(D.n4, D.steel[2], 0.3));
          if (sI) vidSq(g, SBX - 24, yb - 4, 8); else avatar(g, SBX - 22, yb - 3, D.cream); });
        for (let i = 0; i < 50; i++) {
          let got = 0; for (const q of cells) if (q.strip === sI && q.bar === i && t >= ct(q) + fly) got++;
          const f = got / hits[sI][i], v = Math.round(vals[i] * PX.ease(f, "out") + (f >= 1 ? Math.sin(t * 1.4 + i * 0.6) * 0.8 : 0));
          if (f <= 0) continue;
          const x = SBX + i * SP, h = Math.max(1, Math.abs(v));
          const scan = Math.abs(md(t - TL, 3.2) * 18 - i) < 1.5 && t > TL ? 1 : 0;
          const cc = scan ? col[0] : v >= 0 ? col[1] : col[2];
          if (v >= 0) { R(g, x, yb - h, SP - 1, h, cc); R(g, x, yb - h, SP - 1, 1, col[0]); } else { R(g, x, yb + 1, SP - 1, h, cc); }
        }
      }
      // screen glass: scanlines, sheen
      for (let y = WY; y < WY + WH; y += 2) A(g, 0.1, () => R(g, WX, y, WW, 1, D.n0));
      A(g, 0.035, () => { for (let k = 0; k < 120; k++) R(g, WX + 60 + k * 1.1, WY + k * 1.8, 50, 2, D.cream); });
      g.restore();
      if (t >= TL) for (const yb of [YP, YM]) label(g, "50 NUMBERS", SBX + 25 * SP, yb - 32, PX.p(t, TL, 0.5), yb === YM ? D.teal[0] : D.cream);
      // ---- floor + desks (foreground), screen light on their tops ----
      R(g, 0, 268, 640, 92, D.n1); A(g, 0.5, () => PX.vgrad(g, 0, 268, 640, 92, mix(D.n2, D.steel[2], 0.2), D.n0, 5));
      PX.par(g, c, 1.2, () => {
        for (const [dx, k] of desks) { const dy = 300 + Math.round(k * 10);
          R(g, dx, dy, 96, 6, D.n2); R(g, dx, dy, 96, 1, mix(D.n4, SCRL, 0.35)); R(g, dx + 4, dy + 6, 4, 60, D.n1); R(g, dx + 88, dy + 6, 4, 60, D.n1);
          R(g, dx + 30, dy - 30, 40, 26, D.n1); R(g, dx + 31, dy - 29, 38, 1, mix(D.n3, SCRL, 0.4)); R(g, dx + 46, dy - 4, 8, 4, D.n1);
          if (k > 0.55) { R(g, dx + 33, dy - 27, 34, 20, mix(D.n1, D.steel[2], 0.35)); for (let l = 0; l < 4; l++) R(g, dx + 36, dy - 24 + l * 4, 12 + ((l * 7) % 14), 2, mix(D.teal[2], D.n2, 0.2)); }
          // chair
          R(g, dx + 36, dy + 8, 26, 18, D.n0); R(g, dx + 36, dy + 8, 26, 1, D.n2); R(g, dx + 47, dy + 26, 4, 24, D.n0); }
      });
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // dot_product (12.0): night workshop; a wooden bead loom on the bench: your strip of 50 beads (YOU tag) above a movie's
  // strip of 50 beads (teal tag). Pairs light left to right (o.pairs [1.0, 5.5]: number = start, [start, end], or o.pairsEnd)
  // with tiny multiply sparks; each product drops into a brass gutter and rolls into a brass gauge. o.big (6.5): gauge
  // high, "BIG TOTAL: LOVE IT". o.small (9.0): another movie strip slides in, a fast second sweep, gauge low, "SMALL TOTAL: SKIP".
  K.dot_product = (o) => {
    const FX0 = 96, FX1 = 476, RX = 110, PIT = 7, GE = 488, YU = 140, YM = 220, AMP = 22, GBY = 266, GX = 530, GYc = 196, GR = 36;
    const r = PX.rnd(23);
    const U = [...Array(50)].map(() => clamp((r() - 0.5) * 2.2, -1, 1));
    const M1 = U.map((u) => clamp(u * 0.85 + (r() - 0.5) * 0.45, -1, 1));
    const M2 = U.map((u) => clamp(-u * 0.7 + (r() - 0.5) * 0.5, -1, 1));
    const N1 = M1.reduce((s, m, i) => s + m * U[i], 0), N2 = M2.reduce((s, m, i) => s + m * U[i], 0);
    const NORM = Math.max(Math.abs(N1), Math.abs(N2)) * 1.08;
    const tools = [[40, 40, "saw"], [96, 36, "ham"], [140, 44, "pli"], [180, 38, "scr"], [214, 40, "scr"]];
    const BEADU = [lt(D.paper, 0.35), D.paper, D.paperD], BEADM = D.teal;
    return (g, t, d, c) => {
      const [P0, P1] = rng(o, "pairs", 1.0, 5.5, d, 12), TB = tm(o, "big", 6.5, d, 12), TS = tm(o, "small", 9.0, d, 12);
      const KS = Math.min(1, d / 12), SW0 = TS - 1.9 * KS, SW1 = TS - 1.4 * KS, Q0 = SW1, Q1 = TS - 0.8 * KS;   // swap + fast second sweep (shorter in short shots)
      const swap = PX.p(t, SW0, SW1 - SW0, "io");
      const act = (i, second) => (second ? Q0 + ((Q1 - Q0) * i) / 49 : P0 + ((P1 - P0) * i) / 49);
      const ROLL = 520 / KS, FALL = 0.25 * KS;
      const arrive = (i, second) => act(i, second) + FALL + (GE - (RX + i * PIT)) / ROLL;
      // gauge sum: movie 1 products until the swap, then movie 2
      let sum = 0;
      if (swap < 1) for (let i = 0; i < 50; i++) sum += M1[i] * U[i] * clamp((t - arrive(i, false)) / 0.2, 0, 1);
      sum *= 1 - swap;
      if (t >= SW1) for (let i = 0; i < 50; i++) sum += M2[i] * U[i] * clamp((t - arrive(i, true)) / 0.2, 0, 1);
      const val = clamp(sum / NORM, -1, 1);
      // ---- far: workshop wall, pegboard with tools, window ----
      PX.par(g, c, 0.5, () => {
        PX.vgrad(g, -30, -30, 700, 330, mix(D.n2, D.moss[2], 0.08), D.n1, 8);
        R(g, 6, 16, 258, 158, mix(WOOD[2], D.n1, 0.55)); R(g, 10, 20, 250, 150, mix(D.paperD, D.n2, 0.84)); R(g, 10, 20, 250, 1, mix(D.paperD, D.n2, 0.7));
        for (let y = 26; y < 166; y += 8) for (let x = 16; x < 256; x += 8) R(g, x, y, 1, 1, D.n1);
        for (const [x, y, k] of tools) {
          const col = dk(D.n6, 0.35);
          if (k === "saw") { R(g, x, y, 40, 12, mix(D.n6, D.n3, 0.5)); for (let i = 0; i < 20; i++) R(g, x + i * 2, y + 12, 1, 2, mix(D.n6, D.n3, 0.5)); R(g, x - 12, y, 12, 14, mix(WOOD[2], D.n2, 0.4)); }
          if (k === "ham") { R(g, x + 4, y, 3, 40, mix(WOOD[2], D.n2, 0.3)); R(g, x - 4, y - 4, 18, 7, col); }
          if (k === "pli") { PX.line(g, x, y, x + 6, y + 30, col); PX.line(g, x + 8, y, x + 2, y + 30, col); PX.line(g, x + 1, y, x + 5, y + 30, col); }
          if (k === "scr") { R(g, x, y, 5, 16, mix(D.rust[2], D.n2, 0.3)); R(g, x + 2, y + 16, 1, 20, col); }
        }
        // window with moonlight + bare branch
        const wx = 300, wy = 22, ww = 120, wh = 88;
        R(g, wx - 4, wy - 4, ww + 8, wh + 8, mix(WOOD[2], D.n1, 0.5));
        PX.vgrad(g, wx, wy, ww, wh, dk(D.steel[2], 0.5), mix(D.steel[2], D.n2, 0.5), 5);
        PX.circle(g, wx + 92, wy + 22, 7, mix(D.cream, D.steel[0], 0.35));
        for (let i = 0; i < 9; i++) R(g, wx + 8 + ((i * 37) % 100), wy + 6 + ((i * 23) % 40), 1, 1, mix(D.cream, D.steel[2], 0.3 + 0.3 * Math.sin(t * 1.3 + i)));
        R(g, wx + ww / 2 - 1, wy, 2, wh, mix(WOOD[2], D.n1, 0.5)); R(g, wx, wy + wh / 2 - 1, ww, 2, mix(WOOD[2], D.n1, 0.5));
        A(g, 0.05, () => { for (let y = 0; y < 170; y++) R(g, wx - 30 + y * 0.6, wy + wh + y, ww * 0.8, 1, D.steel[0]); });
        // shelf with jars (right)
        R(g, 448, 70, 180, 4, mix(WOOD[2], D.n1, 0.3)); for (let i = 0; i < 6; i++) { const jx = 456 + i * 28, jh = 16 + (i % 3) * 5; R(g, jx, 70 - jh, 18, jh, mix(D.glass, D.n2, 0.7)); R(g, jx + 2, 70 - jh, 3, jh, mix(D.glass, D.n3, 0.5)); R(g, jx - 1, 70 - jh - 3, 20, 3, D.n3); }
      });
      // task lamp over the loom
      R(g, 279, -10, 2, 26, D.n4); for (let k = 0; k < 9; k++) { const w = 22 + k * 3; R(g, 280 - w / 2, 16 + k, w, 1, k < 2 ? D.n5 : D.n3); } R(g, 266, 25, 28, 2, D.lamp);
      for (let rr = 0; rr < 240; rr++) { const w = 30 + rr * 1.6; A(g, 0.045 * (1 - rr / 240), () => R(g, 280 - w / 2, 27 + rr, w, 1, D.lamp)); }
      PX.glow(g, 280, 180, 260, D.lampD, 0.18);
      // ---- bench ----
      R(g, 0, 272, 640, 88, mix(WOOD[2], D.n1, 0.5)); R(g, 0, 272, 640, 9, WOOD[1]); R(g, 0, 272, 640, 1, lt(WOOD[0], 0.2)); R(g, 0, 281, 640, 2, dk(WOOD[2], 0.5));
      for (let x = 12; x < 640; x += 53) A(g, 0.3, () => R(g, x, 274 + (x % 4), 28, 1, WOOD[0]));
      for (let k = 0; k < 4; k++) { const dx = 18 + k * 158; PX.box(g, dx, 296, 140, 52, mix(WOOD[2], D.n0, 0.55)); R(g, dx + 1, 297, 138, 1, mix(WOOD[1], D.n2, 0.55)); R(g, dx + 58, 316, 24, 4, BRASS[2]); R(g, dx + 58, 316, 24, 1, BRASS[0]); }
      // shavings + pencil on the bench
      for (let i = 0; i < 9; i++) { const sx = 566 + i * 7 + (i % 3) * 2, sy = 272 - (i % 2); R(g, sx, sy - 2, 4, 2, lt(WOOD[0], 0.3)); R(g, sx + 1, sy - 3, 2, 1, lt(WOOD[0], 0.5)); }
      R(g, 30, 268, 46, 3, mix(D.moss[2], D.n3, 0.3)); R(g, 76, 268, 6, 3, D.paper); R(g, 82, 269, 3, 1, D.n2);
      // ---- the loom frame ----
      A(g, 0.5, () => R(g, FX0 + 4, 270, FX1 - FX0, 4, SH(1)));
      const FW = [mix(WOOD[0], D.n3, 0.3), mix(WOOD[1], D.n2, 0.3), mix(WOOD[2], D.n1, 0.3)];
      for (const [x, w] of [[FX0, 12], [FX1 - 12, 12]]) { R(g, x, 92, w, 180, FW[1]); R(g, x, 92, 2, 180, FW[0]); R(g, x + w - 3, 92, 3, 180, FW[2]); }
      for (const y of [92, 176, 256]) { R(g, FX0, y, FX1 - FX0, 9, FW[1]); R(g, FX0, y, FX1 - FX0, 1, lt(FW[0], 0.2)); R(g, FX0, y + 8, FX1 - FX0, 1, FW[2]); for (let x = FX0 + 20; x < FX1; x += 61) A(g, 0.35, () => R(g, x, y + 3, 24, 1, FW[2])); }
      for (const [x, y] of [[FX0 + 6, 96], [FX1 - 6, 96], [FX0 + 6, 180], [FX1 - 6, 180], [FX0 + 6, 260], [FX1 - 6, 260]]) { R(g, x - 1, y - 1, 3, 3, BRASS[2]); R(g, x - 1, y - 1, 1, 1, BRASS[0]); }
      for (let i = 0; i < 50; i++) { const x = RX + i * PIT; R(g, x, 101, 1, 75, BRASS[1]); R(g, x, 185, 1, 71, BRASS[1]); }
      // tags on the left post: YOU dot and a teal video square
      R(g, FX0 - 22, YU - 8, 18, 16, mix(D.paperD, D.n3, 0.4)); youDot(g, FX0 - 13, YU, t, 4);
      R(g, FX0 - 22, YM - 8, 18, 16, mix(D.paperD, D.n3, 0.4)); vidSq(g, FX0 - 17, YM - 4, 8);
      // ---- beads ----
      const mvSlide = swap <= 0 ? 0 : swap;                    // old movie slides down out of view, new one slides in from above
      for (let i = 0; i < 50; i++) {
        const x = RX + i * PIT, a1 = act(i, false), a2 = act(i, true);
        const lit1 = t >= a1 && swap < 1 ? clamp(1 - (t - a1) / 0.5, 0, 1) : 0, lit2 = t >= a2 && t >= SW1 ? clamp(1 - (t - a2) / 0.4, 0, 1) : 0;
        const done = (t >= a1 && swap < 0.5) || (t >= a2 && t >= SW1);
        const bead = (y, col, glow, isDone) => {
          R(g, x - 3, y - 1, 7, 3, col[2]); R(g, x - 2, y - 3, 5, 7, col[2]); R(g, x - 2, y - 2, 5, 4, isDone ? lt(col[1], 0.12) : col[1]); R(g, x - 2, y - 2, 2, 1, col[0]);
          if (glow > 0) { PX.glow(g, x, y, 9, col[0], 0.5 * glow); R(g, x - 1, y - 1, 3, 2, D.cream); }
        };
        bead(Math.round(YU - U[i] * AMP), BEADU, Math.max(lit1, lit2), done);
        // movie beads (clipped to the lower section while sliding)
        g.save(); g.beginPath(); g.rect(FX0 + 12, 185, FX1 - FX0 - 24, 71); g.clip();
        if (swap < 1) bead(Math.round(YM - M1[i] * AMP + mvSlide * 80), BEADM, lit1, t >= a1);
        if (swap > 0) bead(Math.round(YM - M2[i] * AMP - (1 - mvSlide) * 80), BEADM, lit2, t >= a2 && t >= SW1);
        g.restore();
        // multiply spark on the middle rail
        for (const [aa, ok] of [[a1, swap < 1], [a2, t >= SW1]]) { const e = t - aa; if (ok && e >= 0 && e < 0.3) { const k = 1 - e / 0.3, s = e < 0.15 ? 2 : 1;
          A(g, k, () => { R(g, x - s, 180 - s, 1, 1, D.cream); R(g, x + s, 180 - s, 1, 1, D.cream); R(g, x, 180, 1, 1, D.cream); R(g, x - s, 180 + s, 1, 1, D.cream); R(g, x + s, 180 + s, 1, 1, D.cream); PX.glow(g, x, 180, 7, D.lamp, 0.5); }); } }
      }
      // ---- brass gutter + droplets ----
      R(g, FX0 - 2, GBY - 1, GE - FX0 + 4, 4, BRASS[2]); R(g, FX0 - 2, GBY - 1, GE - FX0 + 4, 1, BRASS[0]); R(g, FX0 - 2, GBY + 2, GE - FX0 + 4, 1, BRASS[3]);
      R(g, GE - 2, GBY - 1, 4, 4, BRASS[2]); R(g, GE, 230, 4, GBY - 228, BRASS[2]); R(g, GE, 230, 1, GBY - 228, BRASS[0]); R(g, GE, 228, GX - GE, 4, BRASS[2]); R(g, GE, 228, GX - GE, 1, BRASS[0]);
      for (const second of [false, true]) {
        if (second ? t < SW1 : swap >= 1) continue;
        const V = second ? M2 : M1;
        for (let i = 0; i < 50; i++) {
          const a = act(i, second), e = t - a; if (e < 0) continue;
          const x0 = RX + i * PIT, pv = V[i] * U[i], col = pv >= 0 ? D.lamp : D.steel[0], s = Math.abs(pv) > 0.35 ? 2 : 1;
          let x, y;
          if (e < FALL) { x = x0; y = 184 + (GBY - 2 - 184) * (e / FALL) * (e / FALL); }
          else { x = x0 + (e - FALL) * ROLL; y = GBY; if (x > GE) { const up = x - GE; if (up < 36) { x = GE + 2; y = GBY - up; } else if (up < 36 + GX - GE - 2) { x = GE + 2 + (up - 36); y = 229; } else continue; } }
          A(g, pv >= 0 ? 0.95 : 0.7, () => R(g, x - (s >> 1), y - (s >> 1), s, s, col)); if (pv > 0.35) PX.glow(g, x, y, 5, D.lamp, 0.25);
        }
      }
      // ---- brass gauge ----
      { R(g, GX - 6, GYc + GR, 12, 272 - GYc - GR, BRASS[2]); R(g, GX - 6, GYc + GR, 2, 272 - GYc - GR, BRASS[1]); R(g, GX - 20, 268, 40, 4, BRASS[2]); R(g, GX - 20, 268, 40, 1, BRASS[0]);
        PX.circle(g, GX, GYc, GR + 4, BRASS[3]); PX.circle(g, GX, GYc, GR + 3, BRASS[2]); PX.circle(g, GX - 1, GYc - 1, GR + 2, BRASS[1]); PX.circle(g, GX, GYc, GR, D.paper); PX.circle(g, GX + 1, GYc + 1, GR - 3, mix(D.paper, D.paperD, 0.3));
        // arc ticks + zones (no numbers): low side steel, high side warm
        for (let k = 0; k <= 20; k++) { const an = Math.PI * (1.15 + 0.7 * (k / 20)), big = k % 5 === 0, r0 = GR - (big ? 9 : 6);
          PX.line(g, GX + Math.cos(an) * r0, GYc + Math.sin(an) * r0, GX + Math.cos(an) * (GR - 3), GYc + Math.sin(an) * (GR - 3), k < 7 ? D.steel[2] : k > 13 ? D.rust[2] : D.ink); }
        for (let k = 0; k < 40; k++) { const an = Math.PI * (1.15 + 0.7 * (k / 40)); R(g, GX + Math.cos(an) * (GR - 11), GYc + Math.sin(an) * (GR - 11), 1, 1, k < 14 ? D.steel[1] : k > 26 ? D.moss[2] : D.paperD); }
        // needle (springy) from the low end (left) to the high end (right); zero sits at the centre
        const wob = Math.sin(t * 9) * 0.015 * Math.min(1, Math.abs(val));
        const an = Math.PI * (1.5 + 0.33 * val) + wob;
        PX.line(g, GX + 1, GYc + 1, GX + 1 + Math.cos(an) * (GR - 6), GYc + 1 + Math.sin(an) * (GR - 6), SH(0.35));
        PX.line(g, GX, GYc, GX + Math.cos(an) * (GR - 6), GYc + Math.sin(an) * (GR - 6), D.rust[2]); PX.line(g, GX, GYc, GX - Math.cos(an) * 6, GYc - Math.sin(an) * 6, D.ink);
        PX.circle(g, GX, GYc, 3, BRASS[2]); R(g, GX - 1, GYc - 1, 1, 1, BRASS[0]);
        R(g, GX - 12, GYc + 14, 24, 6, mix(D.paperD, D.n4, 0.25)); R(g, GX - 10, GYc + 16, 20, 2, mix(D.ink, D.paperD, 0.5));
        A(g, 0.1, () => { PX.line(g, GX - 24, GYc - 20, GX - 6, GYc - 32, D.cream); PX.line(g, GX - 22, GYc - 16, GX - 2, GYc - 30, D.cream); });
        if (val > 0.6) PX.glow(g, GX, GYc, 50, D.lamp, 0.12 * (val - 0.6) / 0.4); }
      // ---- labels ----
      if (t >= TB && t < TS - 0.3 * KS) label(g, "BIG TOTAL: LOVE IT", 300, 62, PX.p(t, TB, 0.4) * (1 - PX.p(t, TS - 0.9 * KS, 0.5 * KS)), D.cream);
      if (t >= TS) label(g, "SMALL TOTAL: SKIP", 300, 62, PX.p(t, TS, 0.4), D.steel[0]);
      dust(g, t, [180, 40, 200, 200], 61, 22, 0.35);
      PX.vignette(g, 0.55);
    };
  };
})();
