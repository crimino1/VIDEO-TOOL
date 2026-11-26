/* Math film, Builder F: Andrew Wiles (attic years, Cambridge 1993, the gap, the stuck year, the Monday fix),
   math as dark rooms, and negative x negative as a film played in reverse. Documentary palette PX.D only.
   Kinds: attic, lecture93, presses, gap, stuck_year, epiphany, dark_room, walk_film. */
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
  // thick segment (limbs, beams)
  const seg = (g, x1, y1, x2, y2, w, col) => {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
    poly(g, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], col);
  };
  const A = (g, a, fn) => { if (a <= 0) return; const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const clipR = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const clipP = (g, pts, fn) => { g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip(); fn(); g.restore(); };
  // option time resolver: o[k] if a number, else the default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  // range option: [a, b] array, or a scalar start (span keeps its default length), or the scaled default
  const span = (o, d, typ, k, a, b) => {
    const v = o[k];
    if (Array.isArray(v) && v.length >= 2) return [v[0], Math.max(v[1], v[0] + 0.05)];
    if (typeof v === "number") return [v, v + ((b - a) * d) / typ];
    return [(a * d) / typ, (b * d) / typ];
  };
  // list option: array of times, or a scalar (one time), or the scaled defaults
  const times = (o, d, typ, k, defs) => { const v = o[k]; if (Array.isArray(v)) return v.filter((x) => typeof x === "number"); if (typeof v === "number") return [v]; return defs.map((x) => (x * d) / typ); };
  // label: outlined, centred, fades + rises in over 0.4 s; fades out after o.t1 if given
  const label = (g, s, x, y, t, t0, o) => {
    o = o || {}; if (t < t0) return;
    const k = P(t, t0, 0.4, "out"), out = o.t1 === undefined ? 1 : 1 - P(t, o.t1, 0.4, "io");
    A(g, k * out, () => PX.otext(g, s, x, y + Math.round(3 * (1 - k)), { align: o.align || "center", col: o.col || D.cream, outline: D.n0, size: o.size || 8, font: o.font }));
  };
  const dust = (g, seed, n, t, box, col, a) => PX.particles(g, seed, n, t, box, { vy: -1.4, vx: 1.0, col: col || D.lamp, a: a === undefined ? 0.4 : a, tw: 1.3 });
  const woodCols = (k) => { const w = mix(mix(D.rust[2], D.amber[2], 0.4), D.n2, k === undefined ? 0.5 : k); return [mix(w, D.lamp, 0.22), w, mix(w, D.n0, 0.42)]; };
  // handwriting / chalk scribble: a line of letter-like marks, revealed left to right by prog 0..1
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

  // ---------- the man (Wiles stand-in, generic): front view, seated behind a desk, ~76 px visible ----------
  // two layers so the desk sits between: manBody before the desk top, manArms after the papers.
  // P = { write 0..1, down 0..1 head bent to the paper, hands 0..1 head in hands, look 0..1 looking up, slump 0..1, turn 0..1, frown }
  const MAN = () => ({ skin: mix(D.rose[0], D.lampD, 0.35), hair: mix(mix(D.rust[2], D.n2, 0.62), D.paperD, 0.12), top: mix(D.moss[2], D.n3, 0.35), shirt: mix(D.paper, D.steel[0], 0.3) });
  const manGeo = (x, yd, t, P) => {
    const br = Math.sin(t * 1.6) > 0.35 ? 1 : 0, sl = P.slump || 0;
    const yS = Math.round(yd - 46 + sl * 4 - br * (1 - (P.hands || 0)));
    const hy = Math.round(yS - 18 + (P.down || 0) * 2 + sl * 4 - (P.look || 0) * 2);
    return { yS, hy };
  };
  const manBody = (g, x, yd, t, P, v, lit) => {
    v = v || MAN(); lit = lit === undefined ? -1 : lit;
    const { yS, hy } = manGeo(x, yd, t, P), dn = P.down || 0, lk = P.look || 0, hn = P.hands || 0;
    const [tL, tp, tD] = sh3(v.top), [sL, sk, sD] = [mix(v.skin, D.cream, 0.25), v.skin, mix(v.skin, D.n0, 0.3)], [hL, hr, hD] = sh3(v.hair);
    const side = (dx, w) => (lit < 0 ? x + dx : x - dx - w + 1);   // mirror so the lit side faces the light
    A(g, 0.35, () => ell(g, x + 4, yd - 20, 36, 26, "#000000"));   // soft shadow on the chair / wall behind
    // torso: rounded shoulders, lit edge, shadow side, V-neck with shirt collar
    R(g, x - 28, yS + 4, 57, yd - yS - 3, tp); R(g, x - 25, yS + 2, 51, 2, tp); R(g, x - 20, yS, 41, 2, tp);
    R(g, side(-28, 4), yS + 4, 4, yd - yS - 3, tL); R(g, side(-25, 8), yS + 2, 8, 1, tL); R(g, side(-20, 10), yS, 10, 1, tL);
    R(g, side(21, 8), yS + 4, 8, yd - yS - 3, tD); R(g, side(14, 12), yS + 2, 12, 1, mix(tp, tD, 0.5));
    for (let k = 0; k < 5; k++) R(g, side(-22 + k * 10, 1), yS + 16, 1, yd - yS - 18, mix(tp, tD, 0.25));   // knit
    poly(g, [[x - 8, yS], [x + 9, yS], [x + 0.5, yS + 15]], v.shirt);
    poly(g, [[x - 8, yS], [x - 1, yS], [x - 4, yS + 5]], mix(v.shirt, D.cream, 0.4)); poly(g, [[x + 2, yS], [x + 9, yS], [x + 5, yS + 5]], mix(v.shirt, D.cream, 0.4));
    R(g, x - 4, yS - 6, 9, 7, sD); R(g, x - 4, yS - 6, 9, 2, mix(sD, D.n0, 0.3));   // neck
    // head
    ell(g, x, hy, 11, 14, sk);
    A(g, 0.6, () => ell(g, x + (lit < 0 ? -5 : 5), hy - 2, 4, 7, sL));
    R(g, side(7, 4), hy - 8, 4, 17, sD); ell(g, x, hy + 11, 7, 2, sD);
    R(g, x - 13, hy - 1, 2, 7, lit < 0 ? sk : sD); R(g, x + 12, hy - 1, 2, 7, lit < 0 ? sD : sk); R(g, x - 13, hy + 1, 1, 3, sD); R(g, x + 13, hy + 1, 1, 3, sD);   // ears
    // hair: dark, short, a little receding; bent head shows more of the crown
    const cr = 5 + Math.round(dn * 4);
    ell(g, x, hy - 9, 11, cr, hr); R(g, x - 12, hy - 9, 3, 9, hr); R(g, x + 10, hy - 9, 3, 9, hr);
    ell(g, x + 1, hy - 9 + cr, 7, Math.max(1, cr - 4), sk); R(g, x - 3, hy - 8 + cr - 3, 4, 1, sL);
    R(g, side(-8, 6), hy - 9 - cr + 1, 6, 1, hL); R(g, side(-10, 3), hy - 9 - cr + 3, 3, 1, hL); R(g, side(7, 4), hy - 9, 4, 8, hD);
    R(g, x - 3, hy - 9 - cr + 1, 1, cr, hD);   // parting
    R(g, x - 12, hy - 2, 1, 3, mix(hr, D.n7, 0.35)); R(g, x + 12, hy - 2, 1, 3, mix(hr, D.n7, 0.35));
    // face (features slide down as the head bends)
    const ey = hy + 1 + Math.round(dn * 3);
    {
      const b2 = lk > 0.5 ? 1 : 0, gc = mix(D.n1, v.skin, 0.2);
      R(g, x - 8, ey - 5 - b2, 6, 1, hD); R(g, x + 3, ey - 5 - b2, 6, 1, hD);   // brows
      if (P.frown > 0.5 && lk < 0.5) { R(g, x - 3, ey - 4, 1, 1, hD); R(g, x + 3, ey - 4, 1, 1, hD); }
      if ((dn > 0.5 || hn > 0.5) && lk < 0.5) { R(g, x - 7, ey + 1, 4, 1, D.n1); R(g, x + 4, ey + 1, 4, 1, D.n1); }   // lids, looking down / shut
      else { R(g, x - 7, ey - 1, 4, 2, mix(D.cream, sk, 0.3)); R(g, x + 4, ey - 1, 4, 2, mix(D.cream, sk, 0.3)); R(g, x - 6, ey - 1, 2, 2, D.n0); R(g, x + 5, ey - 1, 2, 2, D.n0); }
      // glasses: thin frames, faint lens tint
      A(g, 0.25, () => { R(g, x - 9, ey - 3, 8, 6, D.cream); R(g, x + 2, ey - 3, 8, 6, D.cream); });
      R(g, x - 9, ey - 3, 8, 1, gc); R(g, x - 9, ey + 2, 8, 1, gc); R(g, x - 9, ey - 3, 1, 6, gc); R(g, x - 2, ey - 3, 1, 6, gc);
      R(g, x + 2, ey - 3, 8, 1, gc); R(g, x + 2, ey + 2, 8, 1, gc); R(g, x + 2, ey - 3, 1, 6, gc); R(g, x + 9, ey - 3, 1, 6, gc); R(g, x - 1, ey - 2, 3, 1, gc);
      R(g, x - 12, ey - 2, 3, 1, gc); R(g, x + 10, ey - 2, 3, 1, gc);
      R(g, lit < 0 ? x - 8 : x + 7, ey - 2, 1, 1, D.cream); if (lk > 0.3) A(g, lk, () => { R(g, x - 8, ey - 2, 2, 1, D.cream); R(g, x + 3, ey - 2, 2, 1, D.cream); });
      R(g, side(1, 1), ey + 2, 1, 4, sD); R(g, x - 1, ey + 6, 3, 1, sD);   // nose
      if (lk > 0.5) { R(g, x - 1, ey + 9, 3, 2, mix(sD, D.n0, 0.45)); }
      else if (P.frown > 0.5) { R(g, x - 2, ey + 9, 5, 1, sD); R(g, x - 3, ey + 10, 1, 1, sD); R(g, x + 3, ey + 10, 1, 1, sD); }
      else R(g, x - 3, ey + 9, 6, 1, sD);
    }
  };
  // arms: upper arm + forearm as thick segments; elbows/hands lerp between writing and head-in-hands
  const manArms = (g, x, yd, t, P, v, lit) => {
    v = v || MAN(); lit = lit === undefined ? -1 : lit;
    const { yS, hy } = manGeo(x, yd, t, P), hn = E(P.hands || 0, "io"), wr = P.write || 0;
    const [tL, tp, tD] = sh3(v.top), sk = v.skin, sD = mix(v.skin, D.n0, 0.3), sL = mix(v.skin, D.cream, 0.25);
    const wx = (Math.sin(t * 7.3) * 1.2 + (frac(t * 0.3) * 14 - 7)) * wr, wy = Math.abs(Math.sin(t * 11)) * wr;
    const turn = P.turn || 0;   // left hand slides a sheet (0..1)
    for (const s of [-1, 1]) {
      const sxp = x + s * 24, syp = yS + 8;
      const ex = lerp(x + s * 32, x + s * 22, hn), ey = lerp(yd + 10, yd + 12, hn);
      const handW = s > 0 ? [x + 12 + wx, yd + 22 + wy] : [x - 16 + turn * 12, yd + 20 - turn * 3];
      const hxp = Math.round(lerp(handW[0], x + s * 11, hn)), hyp = Math.round(lerp(handW[1], hy + 1, hn));
      const shade = s === lit ? tL : tD;
      seg(g, sxp, syp, ex, ey, 12, tp); seg(g, sxp + s * 4, syp, ex + s * 4, ey, 4, shade);
      seg(g, ex, ey, hxp, hyp, 9, tp); seg(g, ex, ey + 3, hxp, hyp + 3, 3, tD); seg(g, ex, ey - 3, hxp, hyp - 3, 1, s === lit ? tL : tp);
      R(g, hxp - 4, hyp - 4, 8, 3, mix(v.shirt, D.n3, 0.2));   // cuff
      if (hn > 0.6) {   // palm against the face, fingers up into the hair
        const fx = s > 0 ? hxp - 4 : hxp - 2;
        R(g, fx, hyp - 7, 7, 10, sk); R(g, fx + (s > 0 ? -2 : 3), hyp - 12, 6, 6, sk); R(g, s > 0 ? fx + 6 : fx, hyp - 7, 1, 10, sD);
        for (let f = 0; f < 3; f++) R(g, fx + (s > 0 ? -1 : 4) + f * 2 * -s, hyp - 12, 1, 4, sD);
        R(g, fx + (s > 0 ? -2 : 3), hyp - 12, 3, 1, sL);
        const oc = mix(sk, D.n0, 0.5); R(g, s > 0 ? fx - 1 : fx + 7, hyp - 6, 1, 9, oc); R(g, fx + (s > 0 ? -3 : 9), hyp - 12, 1, 6, oc); R(g, fx, hyp + 3, 7, 1, oc);
      } else { ell(g, hxp, hyp, 4, 3, sk); R(g, hxp - 3, hyp - 3, 4, 1, sL); R(g, hxp - 4, hyp + 2, 8, 1, sD); }
      if (s > 0 && wr > 0 && hn < 0.3) { PX.line(g, hxp - 1, hyp, hxp - 5, hyp - 8, D.amber[1]); R(g, hxp - 5, hyp - 9, 1, 1, mix(D.rose[1], D.n3, 0.3)); R(g, hxp, hyp + 1, 1, 1, D.ink); }
    }
  };

  // ---------- the attic (shared by attic + stuck_year) ----------
  // junction of the left roof slope with the gable wall, and the skylight set in the slope
  const JA = [60, 240], JB = [330, -10], JL = Math.hypot(JB[0] - JA[0], JB[1] - JA[1]);
  const UU = [(JB[0] - JA[0]) / JL, (JB[1] - JA[1]) / JL], NN = [UU[1], -UU[0]];   // NN points up-left, toward us on the slope
  const slopePt = (s, off) => [JA[0] + UU[0] * s * JL + NN[0] * off, JA[1] + UU[1] * s * JL + NN[1] * off];
  const SKY = [slopePt(0.2, 50), slopePt(0.56, 50), slopePt(0.56, 132), slopePt(0.2, 132)];
  const leafR = PX.rnd(41), LEAVES = [];
  for (let i = 0; i < 90; i++) { const u = leafR(); LEAVES.push([u, (leafR() - 0.5) * (0.35 + u * 0.4), leafR(), leafR()]); }
  // S: { night 0..1, season 0..4 (0 summer, 1 autumn, 2 winter, 3 spring), ghosts 0..1, lamp 0..1 }
  const atticRoom = (g, t, c, S) => {
    const night = S.night === undefined ? 1 : S.night, lampK = S.lamp === undefined ? 1 : S.lamp;
    const wall = mix(mix(D.n2, D.rust[2], 0.22), D.n3, 0.25 * (1 - night)), wallD = mix(wall, D.n0, 0.35), wallL = mix(wall, D.lampD, 0.18);
    const wdB = woodCols(0.5);
    R(g, 0, 0, 640, 360, D.n1);
    PX.par(g, c, 0.4, () => {
      // gable wall: vertical boards, warmer near the lamp
      R(g, -40, -40, 720, 380, wall);
      for (let x = 60; x < 690; x += 17) { R(g, x, -40, 1, 380, wallD); if (hash(x, 3) < 0.5) R(g, x + 3 + Math.floor(hash(x, 4) * 10), 40 + Math.floor(hash(x, 5) * 200), 1, 1, wallD); }
      // right roof slope + collar beam
      poly(g, [[520, -40], [700, -40], [700, 140]], mix(wall, D.n0, 0.25));
      seg(g, 520, -40, 700, 140, 10, wdB[2]); seg(g, 517, -40, 697, 140, 2, wdB[1]);
      R(g, 300, 34, 400, 12, wdB[1]); R(g, 300, 34, 400, 1, wdB[0]); R(g, 300, 45, 400, 2, wdB[2]);
      // left roof slope (seen from below): boards, rafters parallel to the junction, the skylight
      const far = slopePt(-0.3, 0), farT = slopePt(1.6, 0), f2 = slopePt(1.6, 400), f1 = slopePt(-0.3, 400);
      poly(g, [far, farT, f2, f1], mix(wall, D.n0, 0.18));
      for (let k = 1; k < 30; k++) { const off = k * 9, a = slopePt(-0.3, off), b = slopePt(1.6, off); PX.line(g, a[0], a[1], b[0], b[1], mix(wall, D.n0, 0.3)); }
      seg(g, JA[0], JA[1], JB[0], JB[1], 6, wdB[2]);
      for (const [off, w] of [[30, 7], [160, 12], [290, 18]]) { const a = slopePt(-0.3, off), b = slopePt(1.6, off); seg(g, a[0], a[1], b[0], b[1], w, wdB[1]); const a2 = slopePt(-0.3, off - w / 2 + 1), b2 = slopePt(1.6, off - w / 2 + 1); PX.line(g, a2[0], a2[1], b2[0], b2[1], wdB[0]); const a3 = slopePt(-0.3, off + w / 2 - 1), b3 = slopePt(1.6, off + w / 2 - 1); seg(g, a3[0], a3[1], b3[0], b3[1], 2, wdB[2]); }
      // skylight frame + glass
      const fr = [slopePt(0.18, 44), slopePt(0.58, 44), slopePt(0.58, 138), slopePt(0.18, 138)];
      poly(g, fr, wdB[2]); PX.line(g, fr[0][0], fr[0][1], fr[1][0], fr[1][1], wdB[0]);
      clipP(g, SKY, () => {
        const se = S.season || 0;
        if (night > 0.5) {
          PX.vgrad(g, 0, -60, 260, 230, mix(D.n0, D.steel[2], 0.25), mix(D.steel[2], D.n1, 0.35), 7);
          const r = PX.rnd(77);
          for (let i = 0; i < 46; i++) { const sx = r() * 230, sy = -50 + r() * 210, tw = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.7 + r()) + i)); A(g, tw, () => R(g, sx, sy, 1, 1, i % 9 === 0 ? D.lamp : D.cream)); if (i % 13 === 0) A(g, 0.35 * tw, () => { R(g, sx - 1, sy, 3, 1, D.cream); R(g, sx, sy - 1, 1, 3, D.cream); }); }
          const mo = S.moon === undefined ? 0.6 : S.moon, mx = lerp(50, 140, mo), my = 95 - Math.sin(mo * Math.PI) * 45;
          PX.circle(g, mx, my, 7, mix(D.cream, D.steel[0], 0.25)); PX.circle(g, mx + 3, my - 2, 6, mix(D.steel[2], D.n1, 0.35));
          PX.glow(g, mx - 2, my + 2, 30, D.steel[0], 0.15);
        } else {
          // daytime sky through the seasons (summer, autumn, winter, spring)
          const skyK = [[D.steel[0], D.cream, 0.45], [D.paper, D.steel[0], 0.4], [D.n6, D.n7, 0.5], [D.teal[0], D.cream, 0.5]];
          const i0 = Math.floor(se) % 4, i1 = (i0 + 1) % 4, f = frac(se);
          const top = mix(mix(skyK[i0][0], D.n3, 0.3), mix(skyK[i1][0], D.n3, 0.3), f), bot = mix(mix(skyK[i0][1], D.n4, 0.25), mix(skyK[i1][1], D.n4, 0.25), f);
          PX.vgrad(g, 0, -60, 260, 230, top, bot, 7);
          // clouds drifting
          for (let k = 0; k < 4; k++) { const cx = ((k * 83 + t * 4) % 300) - 30, cy = 10 + k * 34; A(g, 0.35, () => { ell(g, cx, cy, 16, 4, mix(bot, D.cream, 0.5)); ell(g, cx + 8, cy - 3, 9, 4, mix(bot, D.cream, 0.6)); }); }
          // the branch across the glass, leaves by season
          const b0 = [250, 20], b1 = [40, 120];
          const bc = mix(D.n1, D.rust[2], 0.2); seg(g, b0[0], b0[1], b1[0], b1[1], 6, bc); seg(g, b0[0], b0[1] - 2, b1[0], b1[1] - 2, 1, mix(bc, D.cream, 0.2)); seg(g, 150, 68, 118, 18, 3, bc); seg(g, 110, 87, 66, 58, 3, bc); seg(g, 196, 46, 200, 0, 2, bc); seg(g, 80, 104, 70, 136, 2, bc);
          if (se % 4 > 1.6 && se % 4 < 2.9) { seg(g, b0[0], b0[1] - 3, b1[0], b1[1] - 3, 2, D.cream); seg(g, 150, 66, 118, 16, 1, D.cream); }
          const dens = [1, 0.6, 0, 0.55][i0] * (1 - f) + [1, 0.6, 0, 0.55][i1] * f;
          const lc = [[D.moss[2], D.moss[1]], [D.amber[1], D.rust[1]], [D.n4, D.n4], [D.moss[1], D.moss[0]]];
          for (const [u, off, k1, k2] of LEAVES) {
            if (k1 > dens) continue;
            const bx = lerp(b0[0], b1[0], u) + off * 120, by = lerp(b0[1], b1[1], u) + off * 60 + Math.sin(t * 1.4 + u * 9) * 0.8;
            const col = mix(lerp(0, 1, f) < 0.5 ? lc[i0][k2 < 0.5 ? 0 : 1] : lc[i1][k2 < 0.5 ? 0 : 1], D.n2, 0.25);
            ell(g, bx, by, 4, 3, col); ell(g, bx + 3, by - 2, 3, 2, mix(col, D.n1, 0.15)); R(g, bx - 2, by - 3, 3, 1, mix(col, D.cream, 0.3)); R(g, bx + 1, by + 2, 3, 1, mix(col, D.n0, 0.3));
          }
          if (se % 4 > 0.7 && se % 4 < 1.8) PX.particles(g, 43, 8, t, [0, -40, 240, 200], { vy: 14, vx: -6, col: D.rust[1], a: 0.8, size: 2, tw: 3 });
          if (se % 4 > 1.7 && se % 4 < 2.7) PX.particles(g, 44, 30, t, [0, -40, 240, 200], { vy: 9, vx: -3, col: D.cream, a: 0.8, tw: 2 });
        }
        // faint silhouettes of people watching, in the glass
        const gh = S.ghosts || 0;
        if (gh > 0) for (let k = 0; k < 7; k++) {
          const a = clamp(gh * 7 - k * 0.6, 0, 1) * (0.16 + 0.06 * (k % 2)), [px, py] = slopePt(0.25 + k * 0.042, 74 + (k % 3) * 7);
          A(g, a, () => { const hc = mix(D.n1, D.steel[2], 0.3); PX.circle(g, px, py, 6, hc); R(g, px - 2, py + 5, 5, 4, hc); ell(g, px, py + 18, 15, 10, hc); R(g, px - 15, py + 18, 31, 30, hc); });
        }
        // glass sheen
        A(g, 0.08, () => { const a = slopePt(0.3, 50), b = slopePt(0.42, 50), cc = slopePt(0.3, 132), dd = slopePt(0.18, 132); poly(g, [a, b, [cc[0] + 30, cc[1] + 20], dd], D.cream); });
      });
      const m1 = slopePt(0.38, 50), m2 = slopePt(0.38, 132); seg(g, m1[0], m1[1], m2[0], m2[1], 2, wdB[1]);
      if ((S.season || 0) % 4 > 1.7 && (S.season || 0) % 4 < 2.8 && night < 0.5) seg(g, SKY[0][0], SKY[0][1], SKY[1][0], SKY[1][1], 3, D.cream);   // snow on the lower edge
      // knee wall at the left
      poly(g, [[JA[0], JA[1]], [-60, 280], [-60, 380], [JA[0], 300]], mix(wall, D.n0, 0.3));
      PX.line(g, JA[0], JA[1], -60, 280, wdB[0]);
    });
    // light from the skylight: cool shaft at night, soft daylight by day
    A(g, night > 0.5 ? 0.05 : 0.08, () => poly(g, [SKY[0], SKY[1], [330, 300], [150, 330]], night > 0.5 ? D.steel[0] : D.cream));
    // floor boards
    PX.vgrad(g, -40, 296, 720, 70, mix(wdB[2], D.n1, 0.2), mix(wdB[1], D.n1, 0.45), 4);
    for (let k = 0; k < 6; k++) PX.line(g, 320 + (k - 2.5) * 70, 296, 320 + (k - 2.5) * 190, 360, mix(wdB[2], D.n0, 0.3));
    R(g, -40, 296, 720, 1, mix(wdB[0], D.n2, 0.4));
    ell(g, 330, 322, 170, 18, mix(D.rust[2], D.n2, 0.5)); ell(g, 330, 322, 160, 15, mix(D.rust[2], D.n2, 0.38));
    for (let k = -150; k < 150; k += 9) R(g, 330 + k, 321 + Math.round(Math.sin(k) * 2), 4, 1, mix(D.amber[2], D.n2, 0.5));
    // low bookcase under the calendar
    PX.par(g, c, 1, () => {
      const bx = 506, by = 200, bw = 108, bh = 98, wd = woodCols(0.55);
      R(g, bx, by, bw, bh, wd[2]); R(g, bx, by, bw, 3, wd[1]); R(g, bx, by, bw, 1, wd[0]);
      const r = PX.rnd(55);
      for (let sh = 0; sh < 3; sh++) {
        const yy = by + 32 + sh * 31; R(g, bx + 3, yy, bw - 6, 2, wd[1]);
        let xx = bx + 5;
        while (xx < bx + bw - 8) { const w = 3 + Math.floor(r() * 4), h = 16 + Math.floor(r() * 10), base = [D.rust[2], D.moss[2], D.steel[2], D.paperD, D.n4, D.teal[2]][Math.floor(r() * 6)]; const bc = mix(base, D.n1, 0.45); if (r() < 0.12) { poly(g, [[xx, yy], [xx + w, yy], [xx + w + 7, yy - h + 2], [xx + 7 - 1, yy - h + 2]], bc); xx += w + 9; continue; } R(g, xx, yy - h, w, h, bc); R(g, xx, yy - h, 1, h, mix(bc, D.lamp, 0.15)); if (r() < 0.4) R(g, xx, yy - h + 3, w, 1, mix(bc, D.paperD, 0.35)); xx += w; }
      }
      // a box of old papers on top
      R(g, bx + 60, by - 20, 40, 20, mix(D.paperD, D.n3, 0.5)); R(g, bx + 60, by - 20, 40, 1, mix(D.paperD, D.n4, 0.2)); R(g, bx + 62, by - 22, 34, 2, mix(D.paper, D.n4, 0.4));
    });
  };
  // wall calendar: page index k (pictures cycle), flip f 0..1 (page lifting over the rings)
  const CAL_PICS = () => [[D.moss[1], D.steel[0]], [D.amber[1], D.paper], [D.n6, D.cream], [D.moss[0], D.teal[0]]];
  const calPage = (g, x, y, w, h, k, dim) => {
    const pc = mix(D.paper, D.n3, dim), [g1, s1] = CAL_PICS()[((k % 4) + 4) % 4];
    R(g, x, y, w, h, pc); R(g, x, y, w, 1, mix(pc, D.cream, 0.3)); R(g, x + w - 1, y, 1, h, mix(pc, D.n0, 0.25));
    // little picture: sky + hill
    const ph = Math.round(h * 0.38);
    R(g, x + 3, y + 3, w - 6, ph, mix(s1, D.n3, dim + 0.15)); poly(g, [[x + 3, y + 3 + ph], [x + 3, y + ph - 3], [x + w * 0.45, y + ph - 7], [x + w - 3, y + ph - 2], [x + w - 3, y + 3 + ph]], mix(g1, D.n3, dim + 0.15));
    scribble(g, x + 6, y + ph + 6, w - 12, 300 + k, mix(D.ink, pc, 0.3), 1, 2);   // month name, handwriting-like
    for (let j = 0; j < 4; j++) for (let i = 0; i < 7; i++) R(g, x + 3 + i * Math.floor((w - 5) / 7), y + ph + 11 + j * 4, Math.floor((w - 5) / 7) - 1, 3, mix(pc, D.ink, 0.12 + (hash(i + k, j) < 0.12 ? 0.25 : 0)));
  };
  const calendar = (g, x, y, k, f) => {
    const w = 38, h = 48;
    R(g, x + w / 2 - 1, y - 8, 2, 2, D.n6); PX.line(g, x + w / 2, y - 7, x + 4, y, D.n5); PX.line(g, x + w / 2, y - 7, x + w - 5, y, D.n5);
    A(g, 0.4, () => R(g, x + 2, y + 2, w, h, "#000000"));
    calPage(g, x, y, w, h, k + 1, 0.1);
    if (f > 0 && f < 1) {
      // the old page lifts and flips up over the rings (foreshortened)
      const fh = Math.round(h * Math.abs(Math.cos(f * Math.PI)));
      if (f < 0.5) clipR(g, x, y, w, fh, () => calPage(g, x, y, w, h, k, 0.1 + f * 0.6));
      else R(g, x, y - fh, w, fh, mix(D.paperD, D.n3, 0.3));
    } else if (f <= 0) calPage(g, x, y, w, h, k, 0.1);
    R(g, x - 1, y - 1, w + 2, 3, D.n2); for (let i = 0; i < 6; i++) R(g, x + 3 + i * 6, y - 2, 2, 4, D.n6);
  };
  // desk with papers: top from yd back edge to yf front edge
  const desk = (g, x0, x1, yd, yf, floorY, wd) => {
    poly(g, [[x0 + 8, yd], [x1 - 8, yd], [x1, yf], [x0, yf]], wd[1]);
    PX.line(g, x0 + 8, yd, x1 - 8, yd, wd[2]);
    for (let k = 1; k < 4; k++) PX.line(g, lerp(x0 + 8, x0, k / 4), lerp(yd, yf, k / 4), lerp(x1 - 8, x1, k / 4), lerp(yd, yf, k / 4), mix(wd[1], wd[2], 0.25));
    R(g, x0, yf, x1 - x0, 3, wd[0]); R(g, x0, yf + 3, x1 - x0, floorY - yf - 3, wd[2]);
    // drawers + legs
    for (const dx of [x0 + 10, x1 - 70]) { R(g, dx, yf + 8, 60, 14, mix(wd[2], wd[1], 0.35)); R(g, dx, yf + 8, 60, 1, mix(wd[1], wd[0], 0.4)); R(g, dx + 26, yf + 14, 8, 2, mix(D.amber[2], D.n2, 0.2)); }
    R(g, x0, yf + 3, 4, floorY - yf, mix(wd[2], D.n0, 0.3)); R(g, x1 - 4, yf + 3, 4, floorY - yf, mix(wd[2], D.n0, 0.3));
    A(g, 0.45, () => R(g, x0 - 4, floorY, x1 - x0 + 10, 4, "#000000"));
  };
  // a pile of paper: x centre, base y, height in px, w
  const paperStack = (g, x, y, hgt, w, seed, dim) => {
    hgt = Math.round(hgt); if (hgt <= 0) return;
    A(g, 0.4, () => R(g, x - w / 2 + 2, y - 1, w, 3, "#000000"));
    for (let k = 0; k < hgt; k++) { const sx = Math.round((hash(seed, k) - 0.5) * 3); R(g, x - w / 2 + sx, y - k - 1, w, 1, mix(k % 3 === 0 ? D.paperD : D.paper, D.n2, dim || 0.2)); }
    R(g, x - w / 2, y - hgt - 1, w, 1, mix(D.cream, D.n2, dim || 0.2));
  };
  // a sheet lying on the desk with handwriting (perspective-ish trapezoid), prog = writing progress
  const sheet = (g, x, y, w, h, seed, prog, dim) => {
    const pc = mix(D.paper, D.n2, dim || 0);
    poly(g, [[x + 2, y], [x + w - 2, y], [x + w, y + h], [x, y + h]], pc); R(g, x, y + h, w, 1, mix(pc, D.n0, 0.3));
    const lines = Math.floor((h - 2) / 2);
    for (let l = 0; l < lines; l++) { const lp = clamp(prog * lines - l, 0, 1); if (lp > 0) scribble(g, x + 4, y + 2 + l * 2, (w - 8) * (0.7 + 0.3 * hash(seed, l)), seed * 7 + l, mix(D.ink, pc, 0.35), lp, 1); }
  };
  // library book open on the desk
  const libBook = (g, x, y, dim) => {
    const cov = mix(D.moss[2], D.n2, 0.2 + (dim || 0)), pg = mix(D.paper, D.n2, 0.1 + (dim || 0));
    poly(g, [[x - 1, y + 1], [x + 37, y + 1], [x + 39, y + 13], [x - 3, y + 13]], cov);
    poly(g, [[x + 1, y], [x + 18, y + 1], [x + 18, y + 12], [x - 1, y + 11]], pg); poly(g, [[x + 18, y + 1], [x + 35, y], [x + 37, y + 11], [x + 18, y + 12]], mix(pg, D.cream, 0.15));
    R(g, x + 18, y + 1, 1, 11, mix(pg, D.n0, 0.3));
    for (let l = 0; l < 4; l++) { R(g, x + 2, y + 3 + l * 2, 14 - (l === 3 ? 5 : 0), 1, mix(D.ink, pg, 0.55)); R(g, x + 20, y + 3 + l * 2, 14, 1, mix(D.ink, pg, 0.55)); }
    R(g, x + 22, y - 5, 9, 6, mix(D.paper, D.lamp, 0.25)); R(g, x + 22, y - 5, 9, 1, D.cream); R(g, x + 23, y - 3, 6, 1, mix(D.ink, D.paper, 0.6));   // library card
  };
  const mug = (g, x, y, t, dim, steam) => {
    const mc = mix(D.cream, D.n3, dim || 0.2);
    R(g, x, y - 9, 8, 9, mc); R(g, x, y - 9, 8, 1, mix(mc, D.n0, 0.3)); R(g, x + 6, y - 9, 2, 9, mix(mc, D.n0, 0.2)); R(g, x + 8, y - 7, 2, 1, mc); R(g, x + 9, y - 7, 1, 4, mc); R(g, x + 8, y - 4, 2, 1, mc);
    R(g, x + 1, y - 8, 5, 1, mix(D.rust[2], D.n0, 0.4));
    if (steam) for (let k = 0; k < 3; k++) { const ph = frac(t * 0.5 + k / 3); A(g, 0.35 * Math.sin(ph * Math.PI), () => R(g, x + 3 + Math.round(Math.sin(ph * 6 + k) * 2), y - 11 - ph * 12, 1, 2, D.cream)); }
  };
  // angled desk lamp, base at (x, y), shade pointing down-right at the desk
  const deskLamp = (g, x, y, on) => {
    const st = D.steel.map((v) => mix(v, D.n2, 0.4)), br = mix(D.amber[2], D.n2, 0.15);
    ell(g, x, y - 1, 9, 2, st[2]); R(g, x - 8, y - 3, 16, 2, st[1]); R(g, x - 6, y - 3, 6, 1, st[0]);
    seg(g, x, y - 3, x - 8, y - 38, 2, br); seg(g, x - 8, y - 38, x + 14, y - 56, 2, br); R(g, x - 9, y - 39, 3, 3, st[1]);
    poly(g, [[x + 10, y - 62], [x + 20, y - 58], [x + 28, y - 44], [x + 10, y - 44]], st[1]); PX.line(g, x + 10, y - 62, x + 10, y - 44, st[0]); R(g, x + 10, y - 45, 18, 2, st[2]);
    if (on > 0) { R(g, x + 12, y - 44, 14, 1, mix(D.lampD, D.lamp, on)); PX.glow(g, x + 19, y - 42, 14, D.lamp, 0.35 * on); }
  };

  // old trunk under the eaves with a pile of journals on it (left foreground filler, base at y)
  const oldTrunk = (g, x, y) => {
    const tc = mix(D.rust[2], D.n1, 0.45), [tL, , tD] = sh3(tc), br = mix(D.amber[2], D.n2, 0.3);
    A(g, 0.45, () => R(g, x - 4, y, 92, 4, "#000000"));
    R(g, x, y - 34, 84, 34, tc); R(g, x, y - 34, 84, 1, tL); R(g, x + 78, y - 34, 6, 34, tD);
    R(g, x - 1, y - 40, 86, 7, mix(tc, D.n3, 0.2)); R(g, x - 1, y - 40, 86, 1, mix(tL, D.lampD, 0.2));
    for (const bx of [x + 14, x + 62]) { R(g, bx, y - 40, 4, 40, br); R(g, bx, y - 40, 1, 40, mix(br, D.lamp, 0.3)); }
    R(g, x + 38, y - 30, 8, 7, br); R(g, x + 41, y - 27, 2, 2, D.n1);
    for (const [cx, cy] of [[x, y - 40], [x + 80, y - 40], [x, y - 4], [x + 80, y - 4]]) R(g, cx, cy, 4, 4, br);
    // journals + a folded blanket
    const jc = [mix(D.steel[2], D.n2, 0.3), mix(D.moss[2], D.n2, 0.3), mix(D.paperD, D.n3, 0.4), mix(D.rust[2], D.n2, 0.2)];
    for (let k = 0; k < 4; k++) { const jx = x + 8 + (k % 2) * 3, jy = y - 44 - k * 4; R(g, jx, jy, 34 - k * 2, 4, jc[k]); R(g, jx, jy, 34 - k * 2, 1, mix(jc[k], D.lamp, 0.15)); R(g, jx + 30 - k * 2, jy + 1, 2, 2, mix(D.paper, D.n3, 0.4)); }
    R(g, x + 48, y - 48, 32, 8, mix(D.teal[2], D.n2, 0.35)); R(g, x + 48, y - 48, 32, 1, mix(D.teal[1], D.n3, 0.4)); for (let k = 0; k < 4; k++) R(g, x + 50 + k * 8, y - 45, 4, 1, mix(D.cream, D.n3, 0.6));
  };
  // crumpled paper ball (r ~3), seed varies the creases
  const ball = (g, x, y, seed, dim) => {
    const pc = mix(D.paper, D.n2, dim || 0.15), pd = mix(pc, D.n0, 0.3), pl = mix(pc, D.cream, 0.35);
    x = Math.round(x); y = Math.round(y);
    A(g, 0.4, () => R(g, x - 3, y + 2, 7, 2, "#000000"));
    ell(g, x, y, 3, 3, pc); R(g, x - 2, y - 3, 3, 1, pl); R(g, x - 3, y - 1, 1, 2, pl);
    R(g, x + 1 + Math.floor(hash(seed, 1) * 2), y - 1, 1, 3, pd); R(g, x - 1, y + Math.floor(hash(seed, 2) * 2), 2, 1, pd); R(g, x - 2, y + 2, 5, 1, pd);
  };
  // wire waste-paper basket, base centre (x, y); n balls inside
  const bin = (g, x, y, n) => {
    const st = D.steel.map((v) => mix(v, D.n2, 0.5));
    for (let k = 0; k < Math.min(n, 5); k++) ball(g, x - 7 + k * 4, y - 26 - (k % 2) * 2, 50 + k, 0.2);
    poly(g, [[x - 13, y - 26], [x + 13, y - 26], [x + 10, y], [x - 10, y]], mix(D.n1, D.n2, 0.5));
    for (let k = 0; k <= 8; k++) { const u = k / 8; PX.line(g, lerp(x - 13, x + 13, u), y - 26, lerp(x - 10, x + 10, u), y - 1, k < 3 ? st[0] : st[1]); }
    R(g, x - 14, y - 27, 28, 2, st[0]); R(g, x - 10, y - 1, 21, 1, st[2]); PX.line(g, x - 12, y - 13, x + 12, y - 13, st[1]);
    A(g, 0.45, () => R(g, x - 12, y, 26, 3, "#000000"));
  };
  // everything at the desk; S = { k, f calendar, tally, lvl (0..1 paper growth), pose, crumples, toss 0..1, night, season, ghosts, moon }
  const atticScene = (g, t, c, S) => {
    const v = MAN(), lvl = S.lvl, day = S.night === 0;
    atticRoom(g, t, c, S);
    PX.par(g, c, 0.4, () => {
      calendar(g, 452, 82, S.k, S.f);
      const wd = woodCols(0.5); R(g, 410, 47, 10, 253, wd[1]); R(g, 410, 47, 1, 253, wd[0]); R(g, 418, 47, 2, 253, wd[2]);
      for (let i = 0; i < S.tally; i++) R(g, 412, 92 + i * 6, 6, 1, mix(D.ink, wd[1], 0.15));
      if (S.tallyHi > 0) A(g, S.tallyHi, () => R(g, 411, 91 + (S.tally - 1) * 6, 8, 3, D.lamp));
    });
    const pg = (a) => clamp(lvl * 1.15 - a, 0, 1);
    paperStack(g, 168, 300, 4 + 30 * pg(0.05), 30, 1, 0.35); paperStack(g, 186, 302, 18 * pg(0.45), 28, 2, 0.3);
    paperStack(g, 470, 300, 6 + 26 * pg(0.2), 30, 3, 0.35); paperStack(g, 492, 304, 20 * pg(0.6), 26, 4, 0.3);
    // crumpled papers around the bin
    if (S.crumples !== undefined) {
      bin(g, 532, 312, S.crumples);
      for (let i = 0; i < S.crumples; i++) { const a = hash(i, 9) * TAU, rr = 18 + hash(i, 8) * 30; ball(g, 532 + Math.cos(a) * rr * 1.4, 314 + Math.abs(Math.sin(a)) * rr * 0.45 - (Math.sin(a) < 0 ? 8 : 0), i, 0.2); }
    }
    const X = 326, YD = 226, YF = 262, wd = woodCols(0.48), pose = S.pose;
    manBody(g, X, YD, t, pose, v, -1);
    desk(g, 186, 466, YD, YF, 300, wd);
    const lampK = day ? 0.75 : 1;
    PX.glow(g, 280, 248, 120, D.lampD, 0.22 * lampK); PX.glow(g, 310, 200, 70, D.lamp, 0.1 * lampK);
    libBook(g, 220, 240, 0);
    paperStack(g, 424, 254, 3 + 16 * pg(0.1), 28, 5, 0.12); paperStack(g, 450, 244, 2 + 10 * pg(0.4), 22, 6, 0.18);
    sheet(g, 372, 236, 28, 12, 9, 1, 0.2); sheet(g, 266, 232, 24, 8, 8, 1, 0.12);
    sheet(g, X - 20, 240, 44, 20, S.sheetSeed, S.sheetProg, 0);
    if (pg(0.5) > 0) mug(g, 392, 242, t, 0.35, false);
    if (pg(0.8) > 0) mug(g, 456, 258, t, 0.3, false);
    mug(g, 400, 256, t, 0.15, !day);
    R(g, 196, 236, 7, 10, mix(D.n3, D.rust[2], 0.3)); PX.line(g, 197, 235, 195, 227, D.amber[1]); PX.line(g, 201, 235, 203, 228, D.steel[1]);   // pencil cup
    manArms(g, X, YD, t, pose, v, -1);
    deskLamp(g, 250, 242, lampK);
    // a paper ball tossed at the bin
    if (S.toss > 0 && S.toss < 1) { const u = S.toss; ball(g, lerp(X + 16, 532, u), lerp(YD + 8, 288, u) - Math.sin(u * Math.PI) * 50, 77, 0.1); }
    const wdN = woodCols(0.7);
    R(g, 604, -40, 18, 420, wdN[2]); R(g, 604, -40, 2, 420, wdN[1]); seg(g, 612, 120, 700, 30, 12, wdN[2]);
    oldTrunk(g, 30, 298);
    dust(g, 71, 26, t, [220, 150, 160, 120], day ? D.cream : D.lamp, 0.35);
    PX.particles(g, 72, 14, t, [40, 40, 200, 220], { vy: 1.5, vx: 0.8, col: day ? D.cream : D.steel[0], a: day ? 0.35 : 0.25, tw: 1 });
    PX.vignette(g, 0.6 + (S.vig || 0));
  };

  // ======================= attic =======================
  // an attic study at night: sloped ceiling with a starry skylight, a desk covered in papers, the man with glasses
  // writing by lamplight; a wall calendar flips the years (o.years 1.0-7.0: seven flips, one pencil tally per year on the
  // post beside it) while stacks of paper grow on the desk and the floor; a library book lies open by the lamp.
  K.attic = (o) => (g, t, d, c) => {
    t = Math.max(0, t);
    const [y0, y1] = span(o, d, 10.0, "years", 1.0, 7.0);
    const N = 7, yp = clamp((t - y0) / (y1 - y0), 0, 1), fl = yp * N;
    const k = Math.min(N, Math.floor(fl)), f = k < N ? clamp((fl - k) * 3 - 2, 0, 1) : 0;   // each flip in the last third of its year
    const turn = clamp(1 - Math.abs(frac(t / 3.1) - 0.9) * 10, 0, 1);
    const tHi = k > 0 ? 1 - clamp((fl - k) * 3, 0, 1) : 0;
    atticScene(g, t, c, {
      night: 1, moon: yp <= 0 || yp >= 1 ? 0.6 : frac(fl + 0.6), k, f, tally: k, tallyHi: k < N ? tHi : 0, lvl: yp,
      pose: { write: 1 - turn, down: 1, turn }, sheetSeed: 11 + Math.floor(t / 3.1), sheetProg: frac(t / 3.1) * 1.1,
    });
  };

  // ======================= stuck_year =======================
  // the same attic by grey daylight a year later: crumpled papers pile up around the bin; he writes, frowning, throws one
  // more ball at the bin, then sinks his head into his hands (o.slump 3.0). Through the skylight the branch goes through a
  // whole year (o.year 0-9: summer, autumn leaves falling, winter snow, spring buds); faint silhouettes of watching people
  // gather in the glass (o.watch 1.0).
  K.stuck_year = (o) => (g, t, d, c) => {
    t = Math.max(0, t);
    const T = tm(o, d, 9.0), tS = T("slump", 3.0), tW = T("watch", 1.0), [r0, r1] = span(o, d, 9.0, "year", 0, 9.0);
    const se = 4 * clamp((t - r0) / (r1 - r0), 0, 1), sk = Math.min(3, Math.floor(se)), sf = clamp((se - sk) * 4 - 3, 0, 1);
    const tossT = tS - 1.4, toss = clamp((t - tossT) / 0.7, 0, 1);
    const hn = P(t, tS, 1.3, "io");
    const crumples = 9 + (toss >= 1 ? 1 : 0) + Math.floor(clamp((t - tS) / 2.2, 0, 3));
    const lift = toss > 0 && toss < 1 ? 0 : 0;
    atticScene(g, t, c, {
      night: 0, season: se, vig: 0.2 * hn, ghosts: P(t, tW, 3.0, "io"), k: sk, f: sk < 3 ? sf : 0, tally: 7, tallyHi: 0, lvl: 1, crumples,
      toss: toss > 0 && toss < 1 && t > 0.05 ? toss : 0,
      pose: { write: hn > 0.05 || (t > tossT - 0.3 && t < tossT + 0.5) ? 0 : 1, down: 1, frown: 1, hands: hn, slump: hn },
      sheetSeed: 21, sheetProg: clamp(t / Math.max(0.5, tS), 0, 1) * 0.6 + lift,
    });
  };

  // ======================= epiphany =======================
  // a quiet Monday morning study (a small desk calendar reads "MON"): cool early grey, then sunlight gradually floods in
  // through the window (o.light 2.0); he stops writing and looks up from his papers (o.look 3.5), glasses catching the
  // light, a still moment of realization. A small chalkboard of scribbles hangs behind him.
  K.epiphany = (o) => {
    const v = MAN(), r = PX.rnd(91), books = [];
    for (let sh = 0; sh < 5; sh++) { const row = []; let bx = 0; while (bx < 104) { const w = 3 + Math.floor(r() * 4); row.push([bx, w, 14 + Math.floor(r() * 9), Math.floor(r() * 6), r()]); bx += w + (r() < 0.1 ? 4 : 0); } books.push(row); }
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8.0), tL = T("light", 2.0), tK = T("look", 3.5);
      const L = P(t, tL, 3.2, "io"), lk = P(t, tK, 0.8, "out");
      const wall = mix(mix(D.n3, D.paperD, 0.3), D.rust[2], 0.1), wd = woodCols(0.45);
      const sunC = mix(D.lamp, D.cream, 0.25);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: wall, window with the morning outside, chalkboard, bookshelf ----
      PX.par(g, c, 0.4, () => {
        R(g, -40, -40, 720, 360, wall);
        PX.vgrad(g, -40, -40, 720, 120, mix(wall, D.n0, 0.3), wall, 5);
        R(g, -40, 200, 720, 100, mix(wd[1], D.n2, 0.35)); R(g, -40, 200, 720, 3, wd[0]); for (let x = -30; x < 680; x += 46) R(g, x, 210, 36, 80, mix(wd[1], D.n2, 0.5));
        R(g, -40, 292, 720, 6, wd[2]);
        // window: frame, morning sky warming, sun rising behind trees + rooftops
        const WX = 70, WY = 44, WW = 150, WH = 150;
        R(g, WX - 8, WY - 8, WW + 16, WH + 16, mix(D.cream, D.n3, 0.35));
        clipR(g, WX, WY, WW, WH, () => {
          const top = mix(mix(D.steel[2], D.n2, 0.3), mix(D.steel[0], D.cream, 0.4), L), bot = mix(mix(D.steel[1], D.n4, 0.4), mix(D.lamp, D.cream, 0.3), L);
          PX.vgrad(g, WX, WY, WW, WH, top, bot, 8);
          const sy = WY + WH + 4 - L * 64;
          PX.circle(g, WX + 50, sy, 11, mix(mix(D.lampD, D.n5, 0.4), D.cream, L)); PX.glow(g, WX + 50, sy, 60, D.lamp, 0.12 + 0.25 * L);
          const far = mix(mix(D.steel[2], D.n2, 0.2), mix(D.steel[1], D.paperD, 0.35), L);
          for (let k = 0; k < 7; k++) { const hx2 = WX - 6 + k * 26, hh = 18 + (k * 37) % 14; R(g, hx2, WY + WH - hh, 22, hh, far); poly(g, [[hx2 - 2, WY + WH - hh], [hx2 + 11, WY + WH - hh - 9], [hx2 + 24, WY + WH - hh]], far); if (k % 3 === 1) R(g, hx2 + 15, WY + WH - hh - 12, 4, 6, far); }
          const tc = mix(mix(D.n1, D.moss[2], 0.2), mix(D.moss[2], D.n2, 0.3), L);
          for (const [tx, ty, tr] of [[WX + 118, WY + 92, 22], [WX + 138, WY + 112, 18], [WX + 6, WY + 110, 16], [WX + 98, WY + 118, 14]]) { PX.circle(g, tx, ty, tr, tc); PX.circle(g, tx - tr * 0.4, ty - tr * 0.5, tr * 0.6, mix(tc, sunC, 0.18 * L)); R(g, tx - 1, ty + tr - 2, 3, 30, tc); }
          for (let k = 0; k < 2; k++) { const bx = WX + ((t * 9 + k * 50) % (WW + 30)) - 15, by = WY + 30 + k * 12 + Math.sin(t * 2 + k) * 2; R(g, bx, by, 2, 1, D.n2); R(g, bx + 3, by, 2, 1, D.n2); R(g, bx + 2, by + 1, 1, 1, D.n2); }
        });
        R(g, WX + WW / 2 - 2, WY, 4, WH, mix(D.cream, D.n3, 0.3)); R(g, WX, WY + WH / 2 - 2, WW, 4, mix(D.cream, D.n3, 0.3));
        R(g, WX - 12, WY + WH + 6, WW + 24, 6, mix(D.cream, D.n3, 0.25)); R(g, WX - 12, WY + WH + 6, WW + 24, 1, mix(D.cream, sunC, 0.4 * L));
        // plant on the sill
        R(g, WX + 112, WY + WH - 6, 14, 12, mix(D.rust[1], D.n3, 0.3)); for (let k = 0; k < 6; k++) seg(g, WX + 119, WY + WH - 6, WX + 108 + k * 5, WY + WH - 24 + Math.abs(k - 2.5) * 3, 2, mix(D.moss[1], D.n2, 0.3 - 0.2 * L));
        // curtains
        for (const [cx, dir] of [[WX - 22, 1], [WX + WW + 6, -1]]) for (let k = 0; k < 3; k++) { const col = k % 2 ? mix(D.rust[2], D.n2, 0.35) : mix(D.rust[2], D.n2, 0.2); R(g, cx + k * 6, WY - 14, 6, WH + 40, col); R(g, cx + k * 6 + (dir > 0 ? 5 : 0), WY - 14, 1, WH + 40, mix(col, D.n0, 0.3)); }
        R(g, WX - 30, WY - 18, WW + 60, 4, mix(D.amber[2], D.n2, 0.3));
        // chalkboard behind the desk
        const BX = 286, BY = 62, BW = 176, BH = 86;
        R(g, BX - 5, BY - 5, BW + 10, BH + 12, wd[1]); R(g, BX - 5, BY - 5, BW + 10, 1, wd[0]);
        R(g, BX, BY, BW, BH, mix(D.moss[2], D.n1, 0.6)); A(g, 0.12, () => { R(g, BX + 10, BY + 30, 80, 20, D.cream); R(g, BX + 100, BY + 8, 60, 14, D.cream); });
        for (let l = 0; l < 6; l++) scribble(g, BX + 8 + (l % 2) * 10, BY + 8 + l * 12, 120 + hash(l, 2) * 30, 400 + l, mix(D.cream, D.n4, 0.25), 1, 5);
        PX.line(g, BX + 140, BY + 60, BX + 160, BY + 76, mix(D.cream, D.n4, 0.3));
        R(g, BX, BY + BH + 2, BW, 3, wd[2]); R(g, BX + 30, BY + BH, 8, 2, D.cream); R(g, BX + 120, BY + BH - 1, 14, 3, mix(D.paperD, D.n3, 0.3));
        // bookshelf
        const SX = 500, SY = 34, SW = 120;
        R(g, SX, SY, SW, 266, wd[2]); R(g, SX, SY, SW, 2, wd[0]);
        books.forEach((row, sh) => { const yy = SY + 46 + sh * 50; R(g, SX + 4, yy, SW - 8, 3, wd[1]); for (const [bx, w, h, ci, k] of row) { const bc = mix([D.rust[2], D.moss[2], D.steel[2], D.paperD, D.n4, D.teal[2]][ci], D.n1, 0.4 + 0.2 * k); R(g, SX + 8 + bx, yy - h, w, h, bc); R(g, SX + 8 + bx, yy - h, 1, h, mix(bc, D.lamp, 0.12 + 0.1 * L)); } });
      });
      // ---- floor ----
      PX.vgrad(g, -40, 298, 720, 70, mix(wd[2], D.n1, 0.2), mix(wd[1], D.n1, 0.4), 4);
      for (let k = 0; k < 8; k++) PX.line(g, 320 + (k - 3.5) * 60, 298, 320 + (k - 3.5) * 150, 360, mix(wd[2], D.n0, 0.3));
      // ---- sun on the floor and the bookshelf (grows with L) ----
      A(g, 0.22 * L, () => { poly(g, [[150, 300], [290, 300], [420, 360], [230, 360]], sunC); }); A(g, 0.12 * L, () => poly(g, [[500, 150], [540, 140], [540, 250], [500, 262]], sunC)); A(g, 0.07 * L, () => R(g, 0, 0, 640, 300, D.lampD));
      // ---- desk + man ----
      const X = 372, YD = 226, YF = 262;
      const pose = { write: (1 - lk) * 0.7, down: 1 - lk, look: lk, frown: lk < 0.5 ? 1 : 0 };
      manBody(g, X, YD, t, pose, v, -1);
      desk(g, 232, 512, YD, YF, 300, wd);
      sheet(g, 262, 234, 30, 10, 31, 1, 0.15); sheet(g, 438, 236, 32, 12, 32, 1, 0.15); paperStack(g, 470, 252, 8, 26, 33, 0.12);
      sheet(g, X - 22, 240, 44, 20, 34, clamp(t / Math.max(0.5, tK), 0, 1) * 0.75, 0);
      mug(g, 432, 256, t, 0.15, true);
      // desk calendar "MON"
      const cx2 = 268, cy2 = 246; poly(g, [[cx2, cy2 + 12], [cx2 + 4, cy2], [cx2 + 26, cy2], [cx2 + 30, cy2 + 12]], mix(D.n3, D.n2, 0.4));
      R(g, cx2 + 4, cy2 - 6, 22, 16, mix(D.paper, D.n3, 0.15)); R(g, cx2 + 4, cy2 - 6, 22, 4, mix(D.rust[1], D.n3, 0.25));
      PX.text(g, "MON", cx2 + 15, cy2 - 3, { font: "v", size: 12, col: mix(D.ink, D.paper, 0.15), align: "center" });
      manArms(g, X, YD, t, pose, v, -1);
      // ---- the sun shaft from the window across the room, dust in it ----
      const shaft = [[70, 44], [220, 44], [560, 330], [330, 360]];
      A(g, 0.1 * L, () => poly(g, shaft, sunC));
      A(g, 0.06 * L, () => poly(g, [[110, 44], [170, 44], [450, 340], [370, 350]], D.cream));
      if (L > 0) clipP(g, shaft, () => PX.particles(g, 93, 40, t, [80, 40, 460, 320], { vy: -1.2, vx: 1.5, col: D.cream, a: 0.55 * L, tw: 1.4 }));
      PX.glow(g, X - 8, 186, 46, D.lamp, 0.16 * L);
      // cool pre-dawn grade lifting as the sun comes in
      A(g, 0.38 * (1 - L), () => R(g, 0, 0, 640, 360, mix(D.steel[2], D.n0, 0.5)));
      // near: the back of an armchair in the foreground, its rim caught by the sun
      const ac = mix(D.n1, D.rust[2], 0.25); ell(g, 40, 336, 70, 34, ac); R(g, -30, 336, 140, 40, ac); ell(g, 100, 326, 16, 14, mix(ac, D.n0, 0.2));
      A(g, 0.4 + 0.6 * L, () => { for (let a = -2.7; a < -0.8; a += 0.015) R(g, 40 + Math.cos(a) * 70, 336 + Math.sin(a) * 34, 2, 1, mix(ac, sunC, 0.4)); });
      PX.vignette(g, 0.55);
    };
  };

  // ---------- standing man (same person), feet at (x, y), ~92 px tall ----------
  // S = { front 0/1, armUp: [hx, hy] or null (writing hand), step 0..1 walk phase, nod 0..1, smile }
  const standMan = (g, x, y, t, S, v) => {
    v = v || MAN(); x = Math.round(x); y = Math.round(y);
    const [tL, tp, tD] = sh3(v.top), [pL, pa, pD] = sh3(mix(D.n3, D.steel[2], 0.3)), [hL, hr, hD] = sh3(v.hair);
    const sk = v.skin, sD = mix(sk, D.n0, 0.3), sL = mix(sk, D.cream, 0.25), fr = S.front;
    const st = S.step ? Math.sin(S.step * TAU) : 0, l1 = Math.round(st * 3), l2 = -l1, br = Math.sin(t * 1.6) > 0.4 ? 1 : 0;
    A(g, 0.45, () => ell(g, x, y, 14, 2, "#000000"));
    // legs + shoes
    R(g, x - 7 + l1, y - 40, 6, 37, pD); R(g, x + 1 + l2, y - 40, 6, 37, pa); R(g, x + 6 + l2, y - 40, 1, 37, pL);
    R(g, x - 8 + l1, y - 3, 7, 3, D.n1); R(g, x + 1 + l2, y - 3, 7, 3, mix(D.n1, D.n3, 0.4));
    R(g, x - 8, y - 42, 16, 3, mix(D.n1, D.rust[2], 0.2));   // belt
    // torso
    const ty = y - 70 - br;
    R(g, x - 11, ty + 2, 22, 30, tp); R(g, x - 9, ty, 18, 2, tp); R(g, x - 11, ty + 2, 3, 30, tL); R(g, x + 7, ty + 2, 4, 30, tD); R(g, x - 11, ty + 29, 22, 3, tD);
    if (fr) { poly(g, [[x - 4, ty], [x + 4, ty], [x, ty + 8]], v.shirt); R(g, x - 4, ty, 2, 2, D.cream); R(g, x + 2, ty, 2, 2, D.cream); }
    else R(g, x - 1, ty + 6, 1, 22, tD);
    // free arm hanging (left in back view)
    const side = fr ? 1 : -1;
    seg(g, x + side * 10, ty + 4, x + side * 12, ty + 27, 5, fr ? tD : tL); ell(g, x + side * 12, ty + 29, 2, 2, sk);
    // working arm: raised to the board, or hanging with the chalk
    if (S.armUp) { const [hx2, hy2] = S.armUp, ex = (x - side * 10 + hx2) / 2 - side * 3, ey = Math.max(ty + 8, (ty + 4 + hy2) / 2 + 6); seg(g, x - side * 10, ty + 4, ex, ey, 5, tp); seg(g, ex, ey, hx2, hy2 + 2, 4, tp); R(g, hx2 - 2, hy2 - 1, 4, 4, sk); R(g, hx2 - 1, hy2 - 2, 2, 1, D.cream); }
    else { seg(g, x - side * 10, ty + 4, x - side * 12, ty + 27, 5, fr ? tL : tD); ell(g, x - side * 12, ty + 29, 2, 2, sk); }
    // neck + head
    const hy = ty - 8 + Math.round((S.nod || 0) * 2);
    R(g, x - 2, ty - 3, 5, 4, sD);
    PX.circle(g, x, hy, 7, sk); R(g, x - 8, hy - 1, 2, 4, sD); R(g, x + 7, hy - 1, 2, 4, sD);
    if (fr) {
      PX.circle(g, x, hy - 3, 7, hr); R(g, x - 5, hy - 3, 11, 4, sk); R(g, x - 7, hy - 4, 2, 4, hr); R(g, x + 6, hy - 4, 2, 4, hr); R(g, x - 4, hy - 9, 6, 1, hL);
      R(g, x + 4, hy - 2, 3, 8, sD); R(g, x - 4, hy + 6, 9, 1, sD);
      const gc = mix(D.n1, sk, 0.35);
      for (const gx of [x - 5, x + 1]) { R(g, gx, hy - 2, 4, 1, gc); R(g, gx, hy + 1, 4, 1, gc); R(g, gx, hy - 2, 1, 4, gc); R(g, gx + 3, hy - 2, 1, 4, gc); }
      R(g, x - 1, hy - 1, 2, 1, gc); R(g, x - 3, hy - 1, 1, 2, D.n0); R(g, x + 2, hy - 1, 1, 2, D.n0); R(g, x - 4, hy - 1, 1, 1, D.cream);
      if (S.smile) { R(g, x - 2, hy + 4, 5, 1, sD); R(g, x - 3, hy + 3, 1, 1, sD); R(g, x + 3, hy + 3, 1, 1, sD); } else R(g, x - 1, hy + 4, 3, 1, sD);
    } else {
      PX.circle(g, x, hy - 1, 7, hr); R(g, x - 7, hy - 1, 15, 6, hr); R(g, x - 6, hy + 5, 13, 1, hD); R(g, x - 4, hy - 8, 6, 1, hL); R(g, x - 6, hy - 6, 3, 1, hL); R(g, x + 3, hy - 4, 3, 8, hD);
    }
  };
  // seated listener seen from behind: shoulders at (x, y), scale s; clap 0..1 (hands up, clapping), stand 0..1
  const listener = (g, x, y, s, t, v, clap, stand) => {
    y = Math.round(y - stand * 26 * s); x = Math.round(x);
    const [cL, c, cD] = sh3(v.shirt), [hL, h, hD] = sh3(v.hair), sk = v.skin;
    const bw = Math.round(30 * s), hr = Math.max(2, Math.round(7.5 * s)), hy = Math.round(y - 12 * s + Math.sin(t * 1.3 + v.ph) * 0.4);
    if (stand > 0) { R(g, x - bw / 2 + 1, y + 10 * s, bw - 2, Math.round(stand * 26 * s), c); R(g, x - bw / 2 + 1, y + 10 * s, Math.max(1, Math.round(4 * s)), Math.round(stand * 26 * s), cD); }
    ell(g, x, y + Math.round(6 * s), bw / 2, Math.round(8 * s), c); R(g, x - bw / 2, y + Math.round(6 * s), bw, Math.round(14 * s), c);
    R(g, x - bw / 2, y + Math.round(4 * s), Math.max(1, Math.round(4 * s)), Math.round(16 * s), cD); R(g, x - Math.round(bw / 2) + 3, y - 1, bw - 6, 1, cL);
    R(g, x - Math.round(2.5 * s), y - Math.round(4 * s), Math.round(5 * s), Math.round(5 * s), mix(sk, D.n0, 0.3));
    R(g, x - hr - 1, hy, 1, Math.max(2, Math.round(3 * s)), mix(sk, D.n0, 0.2)); R(g, x + hr, hy, 1, Math.max(2, Math.round(3 * s)), sk);
    PX.circle(g, x, hy, hr, h);
    if (v.style === 1) { R(g, x - hr, hy, 2 * hr + 1, Math.round(hr + 5 * s), h); R(g, x - hr, hy, Math.max(1, Math.round(2 * s)), Math.round(hr + 5 * s), hD); }
    if (v.style === 2) { R(g, x - hr + 1, hy - hr + 2, 2 * hr - 1, Math.max(1, Math.round(hr * 0.5)), mix(sk, h, 0.35)); }
    R(g, x - hr + 2, hy - hr + 1, Math.max(1, hr - 1), 1, hL); R(g, x + 1, hy + hr - 1, Math.max(1, hr - 2), 1, hD);
    if (clap > 0) {
      // clapping in front of the face: from behind, two hands meet just above the shoulder line beside the head
      const sd = v.ph % 2 > 1 ? 1 : -1, sep = Math.round((0.5 + 0.5 * Math.sin(t * 21 + v.ph * 3)) * 3.5 * s * clap);
      const cy = Math.round(hy - hr * 0.3 - clap * 4 * s), cx = x + Math.round(sd * (hr + 2.5 * s));
      const hw = Math.max(2, Math.round(3.5 * s)), hh = Math.max(3, Math.round(5 * s));
      seg(g, x + sd * bw * 0.32, y + 2 * s, cx - sep, cy + hh, Math.max(2, 4.5 * s), cD); seg(g, x + sd * bw * 0.45, y + 3 * s, cx + sep, cy + hh, Math.max(2, 4.5 * s), c);
      R(g, cx - sep - hw + 1, cy, hw, hh, mix(sk, D.n0, 0.12)); R(g, cx + sep, cy, hw, hh, sk); R(g, cx + sep, cy, hw, 1, mix(sk, D.cream, 0.3));
    }
  };
  const crowd = (seed, n) => {
    const r = PX.rnd(seed), SK = [mix(D.rose[0], D.lampD, 0.3), mix(D.lampD, D.rust[2], 0.45), mix(D.rust[2], D.n1, 0.42), mix(D.rose[0], D.paper, 0.4)];
    const HA = [mix(D.n0, D.rust[2], 0.25), D.n0, mix(D.rust[2], D.n1, 0.2), mix(D.paperD, D.amber[2], 0.3), D.n6, D.n7];
    const SH = [mix(D.steel[2], D.n3, 0.2), mix(D.moss[2], D.n2, 0.25), mix(D.rust[2], D.n2, 0.3), mix(D.paperD, D.n3, 0.45), D.n4, mix(D.teal[2], D.n2, 0.2), mix(D.n3, D.n2, 0.3)];
    return [...Array(n)].map(() => ({ skin: SK[Math.floor(r() * 4)], hair: HA[Math.floor(r() * 6)], shirt: SH[Math.floor(r() * 7)], style: r() < 0.25 ? 1 : r() < 0.3 ? 2 : 0, ph: r() * 9, lag: r() * 0.6, dx: (r() - 0.5) * 6, gap: r() < 0.08 }));
  };

  // ======================= lecture93 =======================
  // a wood-panelled lecture hall seen from the back rows: a long three-panel chalkboard under board lamps; the man writes
  // line after line in chalk (o.write 0.5), boxes the last line, then puts the chalk down, steps back and turns to the
  // room (o.done 4.0): the audience applauds, hands moving, a few stand up.
  K.lecture93 = (o) => {
    const rows = [{ y: 264, s: 0.62, n: 20, sp: 34 }, { y: 294, s: 0.8, n: 15, sp: 45 }, { y: 332, s: 1.02, n: 12, sp: 58 }, { y: 380, s: 1.3, n: 9, sp: 76 }];
    const people = rows.map((rw, k) => crowd(300 + k * 11, rw.n));
    const PANEL = (p) => 116 + p * 138, LINES = [];
    for (let p = 0; p < 3; p++) for (let r = 0; r < 4; r++) LINES.push({ x: PANEL(p) + 10 + (r === 0 ? 0 : 6 + (r % 2) * 8), y: 124 + r * 18, w: 92 - (r === 3 && p === 2 ? 34 : 0) + Math.round(hash(p, r) * 18) - 9, seed: 600 + p * 10 + r });
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8.0), tW = T("write", 0.5), tD = T("done", 4.0);
      const wEnd = Math.max(tW + 0.3, tD - 0.45), wp = clamp((t - tW) / (wEnd - tW), 0, 1) * LINES.length;
      const li = Math.min(LINES.length - 1, Math.floor(wp)), lp = wp >= LINES.length ? 1 : wp - li;
      const box = P(t, wEnd, 0.4, "io"), back = P(t, tD, 0.9, "io"), turned = t > tD + 0.45 ? 1 : 0, clap = P(t, tD + 0.25, 0.4, "out");
      const wd = woodCols(0.42), wall = mix(wd[2], D.n1, 0.25);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: front wall, chalkboard, lamps, lectern, side window ----
      PX.par(g, c, 0.4, () => {
        R(g, -40, -40, 720, 300, wall);
        for (let x = -40; x < 690; x += 34) { R(g, x, 0, 1, 236, mix(wall, D.n0, 0.3)); R(g, x + 1, 0, 1, 236, mix(wall, D.lampD, 0.08)); }
        R(g, -40, 208, 720, 3, wd[1]); R(g, -40, 208, 720, 1, wd[0]);
        R(g, -40, -40, 720, 54, mix(D.n1, wall, 0.4)); R(g, -40, 13, 720, 2, wd[1]);
        // tall side window (evening light)
        R(g, 588, 30, 44, 150, mix(D.cream, D.n3, 0.55)); PX.vgrad(g, 592, 34, 36, 142, mix(D.steel[0], D.n4, 0.35), mix(D.lamp, D.n4, 0.4), 6); R(g, 609, 34, 2, 142, mix(D.cream, D.n3, 0.5)); for (let yy = 70; yy < 176; yy += 36) R(g, 592, yy, 36, 2, mix(D.cream, D.n3, 0.5));
        A(g, 0.05, () => poly(g, [[592, 34], [628, 34], [520, 260], [450, 260]], D.lamp));
        // chalkboard: three panels in a wood frame, chalk tray
        R(g, 104, 109, 428, 92, wd[2]); R(g, 104, 109, 428, 1, wd[0]);
        for (let p = 0; p < 3; p++) {
          const bx = PANEL(p);
          R(g, bx, 115, 128, 79, mix(D.moss[2], D.n1, 0.62)); R(g, bx, 115, 128, 1, mix(D.moss[2], D.n1, 0.4));
          A(g, 0.07, () => { R(g, bx + 6, 120 + p * 9, 90, 12, D.cream); R(g, bx + 30, 172 - p * 6, 80, 10, D.cream); });   // old erased smudges
        }
        R(g, 104, 195, 428, 5, wd[1]); R(g, 104, 195, 428, 1, wd[0]); R(g, 140, 193, 9, 2, D.cream); R(g, 300, 193, 12, 3, mix(D.paperD, D.n3, 0.3)); R(g, 470, 193, 6, 2, D.cream);
        // wall clock above the board: ticks only, slow second hand
        const ccx = 320, ccy = 58; PX.circle(g, ccx, ccy, 15, wd[2]); PX.circle(g, ccx, ccy, 13, mix(D.cream, D.n3, 0.25));
        for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; R(g, ccx + Math.round(Math.cos(a) * 11), ccy + Math.round(Math.sin(a) * 11), 1, 1, D.n2); }
        PX.line(g, ccx, ccy, ccx + 4, ccy - 6, D.n1); PX.line(g, ccx, ccy, ccx - 8, ccy + 2, D.n1); const sa = t * 0.105 - 1.2; PX.line(g, ccx, ccy, ccx + Math.cos(sa) * 10, ccy + Math.sin(sa) * 10, mix(D.rust[1], D.n3, 0.2));
        // chalk lines written so far
        const chalk = mix(D.cream, D.n5, 0.18);
        LINES.forEach((L0, i) => { const pr = i < li ? 1 : i === li ? lp : 0; if (pr > 0) scribble(g, L0.x, L0.y, L0.w, L0.seed, chalk, pr, 6); });
        if (box > 0) { const L0 = LINES[LINES.length - 1], bx0 = L0.x - 4, by0 = L0.y - 5, bw = L0.w + 9, bh = 16, per = 2 * (bw + bh), n = box * per; for (let k = 0; k < n; k++) { const q = k < bw ? [bx0 + k, by0] : k < bw + bh ? [bx0 + bw, by0 + k - bw] : k < 2 * bw + bh ? [bx0 + bw - (k - bw - bh), by0 + bh] : [bx0, by0 + bh - (k - 2 * bw - bh)]; R(g, q[0], q[1], 1, 1, chalk); } }
        // board lamps
        for (let k = 0; k < 4; k++) { const lx = 150 + k * 112; R(g, lx - 1, 15, 2, 76, D.n2); poly(g, [[lx - 9, 98], [lx + 9, 98], [lx + 5, 91], [lx - 5, 91]], D.n3); R(g, lx - 8, 98, 16, 1, D.lamp); PX.glow(g, lx, 104, 30, D.lamp, 0.12); }
        A(g, 0.05, () => poly(g, [[104, 100], [532, 100], [560, 210], [80, 210]], D.lamp));
        // dais
        R(g, -40, 236, 720, 30, mix(wd[1], D.n2, 0.2)); R(g, -40, 236, 720, 1, wd[0]); R(g, -40, 248, 720, 20, mix(wd[2], D.n1, 0.2)); R(g, -40, 248, 720, 1, mix(wd[1], D.n2, 0.1));
        // lectern with papers and a glass of water
        const lx = 36; R(g, lx, 186, 40, 50, wd[1]); R(g, lx, 186, 40, 1, wd[0]); R(g, lx + 34, 186, 6, 50, wd[2]); poly(g, [[lx - 4, 182], [lx + 44, 182], [lx + 40, 188], [lx, 188]], wd[0]);
        R(g, lx + 6, 178, 18, 5, D.paper); R(g, lx + 8, 176, 16, 2, mix(D.paper, D.n4, 0.2)); R(g, lx + 30, 172, 5, 10, mix(D.glass, D.n3, 0.4)); R(g, lx + 30, 176, 5, 6, mix(D.teal[0], D.n3, 0.5)); R(g, lx + 30, 172, 1, 10, D.cream);
      });
      // ---- the man (same depth as the board he writes on) ----
      PX.par(g, c, 0.4, () => {
        const L0 = LINES[li], bodyX = (i, p) => LINES[i].x + LINES[i].w * p - 20;   // the body follows the chalk hand
        const mvP = li > 0 ? PX.smooth(lp * 5) : 1, wx = lerp(li > 0 ? bodyX(li - 1, 1) : bodyX(0, 0), bodyX(li, lp), mvP);
        const writing = t >= tW && wp < LINES.length, mx = lerp(wx, 532, back), my = 238 + back * 10;
        const hx2 = L0.x + L0.w * lp, hy2 = L0.y + 2 + Math.round(Math.sin(t * 20) * writing);
        const stepping = (writing && mvP < 1) || (back > 0 && back < 1);
        const armUp = !turned && back < 0.3 ? (writing ? [hx2, hy2] : t < tW ? (t > tW - 0.8 ? [LINES[0].x - 2, LINES[0].y + 3] : null) : box > 0 && box < 1 ? [LINES[11].x + LINES[11].w, LINES[11].y + 4] : null) : null;
        standMan(g, mx, my, t, { front: turned, armUp, step: stepping ? t * 2.2 : 0, nod: turned ? P(t, tD + 0.9, 0.3) - P(t, tD + 1.4, 0.4) : 0, smile: turned });
        if (writing) PX.particles(g, 610 + li, 5, t, [hx2 - 3, hy2, 6, 30], { vy: 10, col: D.cream, a: 0.5, tw: 3 });
      });
      PX.glow(g, 320, 130, 200, D.lampD, 0.08);
      // ---- audience rows, far to near, on a tiered wooden floor ----
      PX.vgrad(g, -40, 266, 720, 100, mix(wd[2], D.n1, 0.35), mix(wd[2], D.n1, 0.6), 4);
      rows.forEach((rw, k) => {
        PX.par(g, c, 0.6 + k * 0.12, () => {
          const fog = (col) => mix(col, D.n1, (3 - k) * 0.08);
          people[k].forEach((v, i) => {
            if (v.gap) return;
            const x = 320 + (i - (rw.n - 1) / 2) * rw.sp + v.dx + (k % 2) * rw.sp * 0.3;
            const cl = clap * clamp((t - tD - 0.25 - v.lag) / 0.3, 0, 1), sd = k < 3 && (i * 7 + k) % 5 === 0 ? P(t, tD + 1.0 + v.lag, 0.8, "io") : 0;
            listener(g, x, rw.y, rw.s, t, { ...v, skin: fog(v.skin), hair: fog(v.hair), shirt: fog(v.shirt) }, cl, sd);
          });
          const bc = fog(wd[1]), by = rw.y + Math.round(14 * rw.s);
          R(g, -40, by, 720, Math.round(10 * rw.s), bc); R(g, -40, by, 720, 1, fog(wd[0])); R(g, -40, by + Math.round(10 * rw.s), 720, Math.round(4 * rw.s), fog(wd[2]));
        });
      });
      A(g, 0.32, () => PX.vgrad(g, -40, 262, 720, 110, D.n1, D.n0, 5));   // the house is darker than the stage
      dust(g, 81, 24, t, [120, 60, 400, 140], D.lamp, 0.3);
      PX.vignette(g, 0.55);
    };
  };

  // ======================= gap =======================
  // top-down on a reviewer's desk under a lamp: a typed manuscript page whose lines carry a chain of steps joined by
  // arrows; earlier steps already ticked in red. The reviewer's hand follows the lines with a red pencil, then circles the
  // one place where an arrow is missing (o.circle 1.0) and writes a small "GAP" beside it (o.label 2.5).
  const typedLine = (g, x, y, w, seed, col) => { const r = PX.rnd(seed); let cx = x; while (cx < x + w - 3) { const ww = 3 + Math.floor(r() * 9); R(g, cx, y, Math.min(ww, x + w - cx), 2, col); cx += ww + 2; } };
  const tick = (g, x, y, col) => { R(g, x, y + 2, 1, 2, col); R(g, x + 1, y + 3, 1, 2, col); R(g, x + 2, y + 2, 1, 2, col); R(g, x + 3, y, 1, 3, col); R(g, x + 4, y - 2, 1, 3, col); };
  // top-down hand with a red pencil; tip at (px, py), arm coming in from the lower right
  const penHand = (g, px, py, shadow) => {
    const sk = MAN().skin, sD = mix(sk, D.n0, 0.3), sL = mix(sk, D.cream, 0.25), sl = mix(D.steel[1], D.n3, 0.35), slD = mix(sl, D.n0, 0.3), cuff = mix(D.paper, D.n4, 0.15);
    const c = (col) => shadow || col;
    const Q = (dx, dy) => [px + dx, py + dy];
    // sleeve + cuff
    seg(g, ...Q(70, 92), ...Q(190, 270), 50, c(sl)); seg(g, ...Q(58, 100), ...Q(170, 280), 10, c(slD)); seg(g, ...Q(84, 84), ...Q(200, 256), 3, c(mix(sl, D.cream, 0.3)));
    seg(g, ...Q(56, 70), ...Q(70, 92), 36, c(cuff)); seg(g, ...Q(44, 82), ...Q(58, 102), 6, c(mix(cuff, D.n0, 0.25)));
    // middle finger tucked under the pencil (left side)
    seg(g, ...Q(8, 20), ...Q(26, 46), 8, c(sD)); ell(g, px + 8, py + 20, 4, 4, c(sD));
    // pencil: sharpened cone, red body
    seg(g, ...Q(7, 10), ...Q(50, 74), 6, c(D.rust[1])); seg(g, ...Q(6, 10), ...Q(48, 74), 2, c(D.rust[0])); seg(g, ...Q(9, 9), ...Q(52, 73), 1, c(D.rust[2]));
    poly(g, [Q(0, 0), Q(10, 7), Q(5, 12)], c(D.paperD)); poly(g, [Q(0, 0), Q(3, 2), Q(1, 4)], c(D.rust[2]));
    // back of the hand + knuckles
    poly(g, [Q(22, 30), Q(44, 30), Q(66, 52), Q(64, 76), Q(44, 80), Q(26, 60)], c(sk));
    poly(g, [Q(26, 60), Q(44, 80), Q(40, 82), Q(24, 64)], c(sD)); poly(g, [Q(24, 32), Q(40, 31), Q(46, 38), Q(28, 40)], c(sL));
    for (let k = 0; k < 3; k++) R(g, px + 30 + k * 9, py + 42 + k * 5, 3, 1, c(sD));
    // index finger along the top of the pencil, thumb on the right
    seg(g, ...Q(12, 13), ...Q(34, 36), 8, c(sk)); seg(g, ...Q(12, 11), ...Q(32, 32), 2, c(sL)); ell(g, px + 12, py + 14, 4, 4, c(sk)); R(g, px + 10, py + 12, 3, 2, c(mix(sk, D.rose[0], 0.4)));
    seg(g, ...Q(22, 18), ...Q(46, 40), 9, c(sk)); seg(g, ...Q(24, 22), ...Q(46, 44), 2, c(sD)); ell(g, px + 21, py + 17, 4, 4, c(sk)); R(g, px + 20, py + 15, 3, 1, c(sL));
    R(g, px + 25, py + 30, 6, 1, c(sD));
  };
  K.gap = (o) => {
    const LN = [];
    for (let i = 0; i < 26; i++) LN.push({ y: 66 + i * 9, w: 196 - (i % 7 === 6 ? 70 : 0) - Math.floor(hash(i, 1) * 14), disp: i === 6 || i === 14 || i === 19 });
    const GY = 66 + 14 * 9 + 1, CH = [[236, 26], [272, 22], [304, 26], [358, 24], [392, 22]];   // chain blocks [x, w]; the gap sits between block 2 and 3
    const GX = 344;
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 5.0), tC = T("circle", 1.0), tL = T("label", 2.5);
      const cp = clamp((t - tC) / 1.0, 0, 1), lp = clamp((t - tL) / 0.8, 0, 1);
      const wd = woodCols(0.4);
      let hand = [0, 0];
      // ---- far: desk top with grain, lamp pool ----
      PX.par(g, c, 0.4, () => {
        R(g, -40, -40, 720, 440, wd[1]);
        for (let y = -40; y < 400; y += 4) { const k = hash(y, 2); R(g, -40, y, 720, 1, mix(wd[1], k < 0.5 ? wd[2] : wd[0], 0.18 + 0.1 * k)); }
        for (let k = 0; k < 14; k++) { const yy = Math.floor(hash(k, 7) * 400) - 20, xx = Math.floor(hash(k, 8) * 700) - 40; R(g, xx, yy, 40 + Math.floor(hash(k, 9) * 80), 1, wd[2]); }
        // rest of the manuscript: a thick stack, top-left
        A(g, 0.45, () => R(g, 34, 28, 132, 170, "#000000"));
        for (let k = 0; k < 6; k++) R(g, 26 + k, 20 + k, 132, 170, mix(D.paper, D.n3, 0.35 - k * 0.04)); R(g, 32, 26, 132, 1, D.cream);
        for (let i = 0; i < 14; i++) typedLine(g, 44, 50 + i * 9, 96 - (i % 5 === 4 ? 40 : 0), 900 + i, mix(D.ink, D.paper, 0.55));
        // coffee cup from above, glasses, paperclip
        A(g, 0.4, () => PX.circle(g, 566, 80, 24, "#000000")); R(g, 580, 70, 12, 8, mix(D.cream, D.n3, 0.3));
        PX.circle(g, 560, 74, 24, mix(D.cream, D.n4, 0.5)); PX.circle(g, 560, 74, 21, mix(D.cream, D.n3, 0.25)); PX.circle(g, 560, 74, 16, mix(D.rust[2], D.n0, 0.45)); R(g, 552, 67, 6, 2, mix(D.cream, D.rust[2], 0.35));
        const gl = mix(D.n1, D.amber[2], 0.3); for (const gx of [528, 556]) { PX.circle(g, gx, 300, 11, gl); PX.circle(g, gx, 300, 9, mix(wd[1], D.glass, 0.3)); R(g, gx - 5, 295, 3, 1, D.cream); } R(g, 539, 299, 6, 2, gl); seg(g, 517, 296, 488, 250, 2, gl); seg(g, 567, 296, 590, 248, 2, gl);
        PX.line(g, 460, 40, 480, 40, D.steel[0]); PX.line(g, 460, 44, 478, 44, D.steel[0]); PX.line(g, 460, 40, 460, 44, D.steel[0]); PX.line(g, 480, 40, 480, 46, D.steel[0]);
      });
      // ---- mid: the page being read ----
      PX.par(g, c, 0.6, () => {
        A(g, 0.5, () => R(g, 214, 40, 236, 318, "#000000"));
        R(g, 206, 34, 236, 318, mix(D.paper, D.n3, 0.3)); R(g, 202, 30, 236, 320, D.paper); R(g, 202, 30, 236, 1, D.cream); R(g, 437, 30, 1, 320, D.paperD);
        R(g, 210, 44, 90, 3, mix(D.ink, D.paper, 0.35));   // heading bar
        const ink = mix(D.ink, D.paper, 0.3);
        LN.forEach((L0, i) => {
          if (i === 14) return;
          if (L0.disp) { scribble(g, 260, L0.y - 2, 120, 940 + i, ink, 1, 5); return; }
          typedLine(g, 214, L0.y, L0.w, 700 + i, ink);
        });
        // the chain of steps: blocks joined by arrows, one arrow missing
        CH.forEach(([x, w], i) => {
          scribble(g, x, GY - 3, w, 960 + i, mix(D.ink, D.paper, 0.15), 1, 6);
          if (i < CH.length - 1 && i !== 2) { const ax = x + w + 2, aw = CH[i + 1][0] - ax - 3; R(g, ax, GY - 1, aw, 1, ink); R(g, ax, GY + 1, aw, 1, ink); R(g, ax + aw - 2, GY - 3, 1, 2, ink); R(g, ax + aw - 1, GY - 2, 1, 1, ink); R(g, ax + aw - 2, GY + 2, 1, 2, ink); R(g, ax + aw - 1, GY + 2, 1, 1, ink); R(g, ax + aw, GY, 1, 1, ink); }
        });
        // red ticks already given to the earlier steps
        for (const yy of [LN[3].y, LN[6].y, LN[9].y, LN[12].y]) tick(g, 444 - 20, yy - 1, D.rust[1]);
        // the circle (overshoots a little, like a real pencil loop) + the word
        const RX = 22, RY = 12, a0 = -2.6, turns = 1.12;
        const pt = (u) => { const a = a0 + u * turns * TAU, wob = 1 + 0.06 * Math.sin(u * 9); return [GX + Math.cos(a) * RX * wob, GY + Math.sin(a) * RY * wob + u * 2]; };
        const red = mix(D.rust[1], D.rust[2], 0.15);
        if (cp > 0) for (let k = 0; k <= cp * 140; k++) { const [x, y] = pt(k / 140); R(g, x, y, 2, 2, red); }
        if (lp > 0) clipR(g, GX + 30, GY + 2, 34 * lp, 20, () => { PX.text(g, "GAP", GX + 31, GY + 4, { font: "v", size: 18, col: red }); PX.text(g, "GAP", GX + 32, GY + 4, { font: "v", size: 18, col: red }); });
        // pencil tip path: tracking down the lines before the circle, the loop, then the word, then resting
        let px, py;
        if (t < tC) { const ln = 9 + Math.min(4, Math.floor(t / 1.2)), u = frac(t / 1.2); px = 230 + u * 150; py = 66 + ln * 9 + 1; }
        else if (cp < 1) [px, py] = pt(cp);
        else if (t < tL) { const u = P(t, tC + 1.0, Math.max(0.2, tL - tC - 1.0), "io"); [px, py] = [lerp(pt(1)[0], GX + 31, u), lerp(pt(1)[1], GY + 14, u)]; }
        else if (lp < 1) { px = GX + 31 + lp * 32; py = GY + 14 + Math.sin(lp * 30) * 3; }
        else { const u = P(t, tL + 0.8, 0.8, "io"); px = GX + 63 + u * 14; py = GY + 14 + u * 22; }
        hand = [px, py];
      });
      // ---- near: the hand and pencil with a soft shadow ----
      PX.par(g, c, 0.6, () => {
        const [px, py] = hand;
        A(g, 0.28, () => penHand(g, px + 12, py + 14, "#000000"));
        const ol = mix(MAN().skin, D.n0, 0.55); for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) penHand(g, Math.round(px) + dx, Math.round(py) + dy, ol);
        penHand(g, Math.round(px), Math.round(py), null);
      });
      PX.glow(g, 150, 60, 300, D.lamp, 0.12);
      PX.vignette(g, 0.65);
    };
  };

  // ======================= presses =======================
  // the loading dock of a printing house at dawn: a rotary press turns, the paper web racing over its drums; folded
  // newspapers ride an overhead conveyor out of the press and drop onto a newsstand cart by the open shutter, where the
  // bundles stack up (o.stack 1.5) and front pages stand in the rack. Headlines are bold wavy bars, no real text.
  const headline = (g, x, y, w, h, seed, col) => { const r = PX.rnd(seed); let cx = x; while (cx < x + w - 2) { const ww = 2 + Math.floor(r() * 5), yy = y + Math.round(Math.sin(cx * 0.35 + seed) * 0.6); R(g, cx, yy, Math.min(ww, x + w - cx), h, col); cx += ww + (r() < 0.25 ? 3 : 1); } };
  // a front page: masthead bar, headline, photo block, columns. s = small (folded paper on the conveyor)
  const frontPage = (g, x, y, w, h, seed, dim) => {
    const pc = mix(D.paper, D.n3, dim || 0), ink = mix(D.ink, pc, 0.15), soft = mix(D.ink, pc, 0.55);
    R(g, x, y, w, h, pc); R(g, x, y, w, 1, mix(pc, D.cream, 0.4)); R(g, x + w - 1, y, 1, h, mix(pc, D.n0, 0.2));
    R(g, x + 2, y + 2, w - 4, 1, soft); headline(g, x + 3, y + 4, w - 6, Math.max(2, Math.round(h * 0.07)), seed, ink); R(g, x + 2, y + 5 + Math.round(h * 0.07) + 1, w - 4, 1, soft);
    const hy = y + 8 + Math.round(h * 0.07);
    headline(g, x + 3, hy, w - 6, Math.max(2, Math.round(h * 0.09)), seed + 1, ink); if (w > 24) headline(g, x + 3, hy + Math.round(h * 0.12), Math.round((w - 6) * 0.7), Math.max(2, Math.round(h * 0.09)), seed + 2, ink);
    const py = hy + Math.round(h * 0.26), pw = Math.round(w * 0.5), ph = Math.round(h * 0.3);
    R(g, x + 3, py, pw, ph, mix(D.n5, pc, 0.35)); R(g, x + 3, py + ph - Math.round(ph * 0.4), pw, Math.round(ph * 0.4), mix(D.n4, pc, 0.3)); PX.circle(g, x + 3 + pw * 0.6, py + ph * 0.45, Math.max(1, Math.round(ph * 0.18)), mix(D.n3, pc, 0.3));
    for (let yy = py; yy < y + h - 3; yy += 2) { if (yy < py + ph + 1) R(g, x + 5 + pw, yy, w - pw - 8, 1, soft); else for (let cc = 0; cc < 3; cc++) R(g, x + 3 + cc * Math.round((w - 4) / 3), yy, Math.round((w - 4) / 3) - 2, 1, soft); }
  };
  K.presses = (o) => {
    const v = { skin: mix(D.lampD, D.rust[2], 0.4), hair: D.n1, top: mix(D.steel[2], D.n3, 0.3), shirt: D.n4 };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 5.0), tS = T("stack", 1.5), sp = 62, gapP = 30;
      const st = clamp((t - tS) / 3.2, 0, 1);
      const wd = woodCols(0.45), brick = mix(D.rust[2], D.n2, 0.7);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: brick hall, high windows, hanging lamps; the open shutter onto the dawn street ----
      PX.par(g, c, 0.35, () => {
        R(g, -40, -40, 720, 330, brick);
        for (let y = -40; y < 290; y += 6) { R(g, -40, y, 720, 1, mix(brick, D.n0, 0.3)); for (let x = -40 + ((y / 6) % 2) * 7; x < 680; x += 14) R(g, x, y, 1, 6, mix(brick, D.n0, 0.25)); }
        for (let k = 0; k < 3; k++) { const wx = 20 + k * 112; R(g, wx, 18, 64, 70, mix(D.n2, D.n1, 0.3)); PX.vgrad(g, wx + 3, 21, 58, 64, mix(D.steel[2], D.n2, 0.2), mix(D.steel[1], D.lampD, 0.35), 5); for (let j = 1; j < 3; j++) R(g, wx + 3, 21 + j * 21, 58, 1, D.n2); for (let j = 1; j < 4; j++) R(g, wx + 3 + j * 14, 21, 1, 64, D.n2); }
        // shutter opening: street, dawn sky, houses, lamppost
        const SX = 420, SW = 240;
        R(g, SX - 8, 26, SW + 16, 270, mix(D.n2, D.steel[2], 0.2));
        PX.vgrad(g, SX, 40, SW, 200, mix(D.steel[2], D.n2, 0.3), mix(D.lamp, D.rose[1], 0.35), 7);
        PX.glow(g, SX + 150, 210, 90, D.lamp, 0.22);
        for (let k = 0; k < 6; k++) { const hx2 = SX - 6 + k * 44, hh = 50 + (k * 29) % 30; R(g, hx2, 240 - hh, 40, hh, mix(D.n2, D.steel[2], 0.35)); poly(g, [[hx2 - 3, 240 - hh], [hx2 + 20, 240 - hh - 14], [hx2 + 43, 240 - hh]], mix(D.n2, D.steel[2], 0.3)); for (let j = 0; j < 3; j++) R(g, hx2 + 6 + j * 12, 250 - hh, 5, 7, (k + j) % 3 === 0 ? mix(D.lamp, D.n3, 0.2) : mix(D.n1, D.steel[2], 0.3)); }
        R(g, SX, 240, SW, 56, mix(D.n3, D.steel[2], 0.25)); R(g, SX, 240, SW, 1, mix(D.n5, D.lamp, 0.3));
        R(g, SX + 196, 150, 3, 90, D.n2); R(g, SX + 190, 146, 15, 6, D.n2); R(g, SX + 192, 152, 11, 2, mix(D.lamp, D.n3, 0.2)); PX.glow(g, SX + 197, 154, 16, D.lamp, 0.2);
        R(g, SX - 8, 26, SW + 16, 14, mix(D.n3, D.steel[2], 0.25)); for (let k = 0; k < 3; k++) R(g, SX - 8, 26 + k * 4, SW + 16, 1, mix(D.n2, D.steel[2], 0.2));   // rolled-up shutter
        R(g, SX, 296, SW, 60, mix(D.n3, D.steel[2], 0.25));
        for (let k = 0; k < 4; k++) { const lx = 60 + k * 110; R(g, lx, -40, 1, 66, D.n2); poly(g, [[lx - 10, 34], [lx + 11, 34], [lx + 6, 26], [lx - 5, 26]], D.n3); R(g, lx - 9, 34, 20, 1, D.lamp); PX.glow(g, lx, 40, 40, D.lamp, 0.14); }
      });
      // hall floor, press, conveyor and cart share one depth so nothing slides off what it stands on
      PX.par(g, c, 0.7, () => { R(g, -60, 290, 760, 90, mix(D.n2, D.n3, 0.4)); R(g, -60, 290, 760, 1, D.n4); });
      // ---- mid: the rotary press in 3/4 view: horizontal cylinders, the printed web snaking between them ----
      PX.par(g, c, 0.7, () => {
        const st2 = D.steel.map((x) => mix(x, D.n2, 0.45)), fc = mix(D.n1, D.steel[2], 0.3), fl = mix(fc, D.lamp, 0.2);
        A(g, 0.45, () => R(g, 30, 284, 320, 8, "#000000"));
        R(g, 60, 120, 254, 168, mix(D.n1, D.steel[2], 0.15));   // dark interior behind
        const CY = [146, 180, 214, 248], X0 = 78, X1 = 296, web = mix(D.paper, D.n3, 0.1), webD = mix(D.paperD, D.n3, 0.3);
        // web bands between the cylinders (behind them), printed marks moving along
        const band = (ya, yb, xa, xb, dir) => {
          poly(g, [[xa, ya], [xb, ya], [xb + dir * 10, yb], [xa + dir * 10, yb]], dir > 0 ? web : webD);
          const L = yb - ya, off = (t * sp) % 8;
          for (let s = off; s < L; s += 8) { const u = s / L, yy = ya + s; for (let k = 0; k < 9; k++) R(g, xa + 8 + k * 23 + dir * u * 10, yy, 12 + (k % 3) * 3, 1, mix(D.ink, web, 0.55)); }
        };
        for (let k = 0; k < 3; k++) band(CY[k] + 8, CY[k + 1] - 8, X0 + 4, X1 - 4, k % 2 ? -1 : 1);
        poly(g, [[X0 + 20, CY[0] - 8], [X1 - 8, CY[0] - 8], [326, 104], [284, 104]], web); for (let s = (t * sp) % 8; s < 34; s += 8) R(g, lerp(X0 + 30, 290, s / 34), CY[0] - 8 - s, lerp(180, 30, s / 34), 1, mix(D.ink, web, 0.6));   // up to the folder
        // cylinders: lit top, dark underside, end caps, rotation streaks
        CY.forEach((cy, i) => {
          PX.vgrad(g, X0, cy - 10, X1 - X0, 20, mix(st2[0], D.lamp, 0.15), st2[2], 5);
          R(g, X0, cy - 10, X1 - X0, 1, mix(st2[0], D.cream, 0.3)); R(g, X0, cy + 9, X1 - X0, 1, D.n1);
          const ph = (t * 3.5 * (i % 2 ? -1 : 1)) % 1;
          for (let k = 0; k < 3; k++) { const yy = cy - 9 + Math.round(((ph + k / 3 + 1) % 1) * 18); A(g, 0.35, () => R(g, X0 + 4, yy, X1 - X0 - 8, 1, D.cream)); }
          ell(g, X0, cy, 5, 10, st2[1]); ell(g, X0, cy, 2, 4, st2[2]); ell(g, X1, cy, 5, 10, st2[2]);
        });
        // side frames with a big gear on the right
        R(g, 60, 116, 16, 172, fc); R(g, 60, 116, 1, 172, fl); R(g, 298, 116, 18, 172, fc); R(g, 298, 116, 1, 172, fl);
        for (let yy = 124; yy < 284; yy += 14) { R(g, 66, yy, 2, 2, fl); R(g, 305, yy, 2, 2, fl); }
        const gx = 307, gy = 197, ga = t * 1.2;
        PX.circle(g, gx, gy, 24, D.n1); PX.circle(g, gx, gy, 21, mix(D.amber[2], D.n2, 0.45)); PX.circle(g, gx, gy, 15, mix(D.amber[2], D.n2, 0.6)); PX.circle(g, gx, gy, 4, mix(D.amber[1], D.n2, 0.3));
        for (let k = 0; k < 18; k++) { const aa = ga + (k * TAU) / 18; R(g, gx + Math.cos(aa) * 23 - 1, gy + Math.sin(aa) * 23 - 1, 3, 3, mix(D.amber[2], D.n2, 0.45)); }
        for (let k = 0; k < 4; k++) { const aa = ga + (k * TAU) / 4; PX.line(g, gx, gy, gx + Math.cos(aa) * 14, gy + Math.sin(aa) * 14, mix(D.amber[1], D.n2, 0.4)); }
        R(g, 56, 112, 264, 6, fc); R(g, 56, 112, 264, 1, fl); R(g, 40, 272, 290, 16, mix(D.n1, D.steel[2], 0.2)); R(g, 40, 272, 290, 1, fl);
        // walkway rail in front
        const rc = mix(D.amber[2], D.n2, 0.45); R(g, 30, 250, 310, 2, rc); R(g, 30, 262, 310, 1, rc); for (let px2 = 34; px2 < 340; px2 += 34) R(g, px2, 250, 2, 24, rc);
        // paper reel unwinding into the bottom cylinder
        const rr = 32 - st * 4; PX.circle(g, 28, 258, rr + 1, D.n1); PX.circle(g, 28, 258, rr, mix(D.paper, D.n3, 0.25)); for (let k = 6; k < rr; k += 5) { for (let a = 0; a < TAU; a += 0.1) R(g, 28 + Math.cos(a) * k, 258 + Math.sin(a) * k, 1, 1, mix(D.paperD, D.n3, 0.3)); } PX.circle(g, 28, 258, 5, D.n2);
        poly(g, [[40, 236], [56, 230], [82, 254], [60, 262]], webD);
        // folder box at the top where papers come out
        R(g, 280, 70, 50, 34, st2[1]); R(g, 280, 70, 50, 1, st2[0]); R(g, 326, 76, 4, 22, D.n1); R(g, 286, 78, 10, 3, D.moss[2]); if (PX.blink(t, 0.6)) R(g, 300, 78, 3, 3, D.amber[1]);
        // worker at the press (back view)
        standMan(g, 214, 292, t, { front: 0, armUp: [236, 210] }, v);
      });
      // ---- the overhead conveyor: papers in clips from the folder to the cart ----
      PX.par(g, c, 0.7, () => {
        const A0 = [330, 84], A1 = [478, 176], L = Math.hypot(A1[0] - A0[0], A1[1] - A0[1]);
        seg(g, A0[0], A0[1] - 8, A1[0] + 10, A1[1] - 2, 3, D.n2); seg(g, A0[0], A0[1] - 9, A1[0] + 10, A1[1] - 3, 1, D.n5);
        R(g, A1[0] + 6, A1[1] - 6, 3, 130, D.n2); R(g, 360, -40, 3, 105, D.n2);
        const off = (t * sp) % gapP;
        for (let s = off - gapP; s < L + 30; s += gapP) {
          const u = s / L; if (u < 0) continue;
          const seed = Math.round((t * sp - s) / gapP) * 7;
          if (u <= 1) {
            const x = lerp(A0[0], A1[0], u), y = lerp(A0[1], A1[1], u);
            R(g, x, y - 8, 2, 6, D.n5); A(g, 0.35, () => R(g, x - 6, y + 2, 16, 20, "#000000"));
            frontPage(g, x - 8, y - 2, 15, 20, 1000 + seed, 0.1);
          } else {
            // released: drop onto the bundle
            const fall = clamp((u - 1) * L / 30, 0, 1), x = A1[0] + 4, y = lerp(A1[1], 218 - st * 22, E(fall, "in"));
            if (fall < 1) frontPage(g, x - 8, y, 15, 20, 1000 + seed, 0.1);
          }
        }
      });
      // ---- near: the newsstand cart with stacks and the front-page rack ----
      PX.par(g, c, 0.7, () => {
      const CX = 440, CY = 236;
      A(g, 0.5, () => ell(g, CX + 85, 318, 100, 6, "#000000"));
      R(g, CX, CY, 170, 60, wd[1]); R(g, CX, CY, 170, 2, wd[0]); R(g, CX + 164, CY, 6, 60, wd[2]); for (let k = 0; k < 4; k++) R(g, CX + 8 + k * 40, CY + 8, 34, 44, mix(wd[1], D.moss[2], 0.35));
      for (const wx of [CX + 26, CX + 140]) { PX.circle(g, wx, 308, 12, D.n1); PX.circle(g, wx, 308, 8, D.n3); PX.circle(g, wx, 308, 2, D.n6); const a = 0.3; PX.line(g, wx - 7 * Math.cos(a), 308 - 7 * Math.sin(a), wx + 7 * Math.cos(a), 308 + 7 * Math.sin(a), D.n2); }
      // canopy on two posts
      R(g, CX + 4, 120, 3, CY - 120, D.n2); R(g, CX + 162, 120, 3, CY - 120, D.n2);
      for (let k = 0; k < 9; k++) { const col = k % 2 ? mix(D.cream, D.n3, 0.3) : mix(D.moss[2], D.n2, 0.25); poly(g, [[CX - 6 + k * 20, 110], [CX + 14 + k * 20, 110], [CX + 14 + k * 20, 124], [CX - 6 + k * 20, 124]], col); R(g, CX - 6 + k * 20, 124, 20, 3, mix(col, D.n0, 0.25)); }
      // bundles on the counter (grow), tied with twine
      const bundle = (x, h, seed) => { h = Math.round(h); if (h <= 0) return; for (let k = 0; k < h; k += 2) R(g, x, CY - k - 2, 34, 2, mix(k % 4 ? D.paper : D.paperD, D.n3, 0.15)); R(g, x, CY - h - 2, 34, 1, D.cream); R(g, x + 16, CY - h - 2, 2, h, mix(D.amber[2], D.n3, 0.2)); frontPage(g, x + 2, CY - h - 22, 30, 20, seed, 0.05); };
      bundle(CX + 18, 4 + st * 22, 2001); bundle(CX + 60, 2 + clamp(st * 1.4 - 0.3, 0, 1) * 18, 2002);
      // slanted rack of front pages at the front
      for (let k = 0; k < 3; k++) { const fx = CX + 100 + k * 22; poly(g, [[fx - 2, CY - 2], [fx + 22, CY - 2], [fx + 20, CY + 4], [fx, CY + 4]], wd[2]); frontPage(g, fx, CY - 36 + k * 2, 20, 30, 2010 + k, 0.03 + k * 0.03); }
      });
      dust(g, 95, 30, t, [40, 40, 380, 220], D.lamp, 0.35);
      PX.vignette(g, 0.55);
    };
  };

  // ---------- side-view walking figure, feet at (x, y), ~84 px tall ----------
  // S = { ph walk phase (radians; running it backwards = walking backwards), face 1 right / -1 left, arms "swing" | "feel" | "reach",
  //       reach [x, y] target for the front hand, recoil 0..1 (leans back, hands up), v colours {skin, hair, top, pants, shirt}, glasses }
  const sideWalker = (g, x, y, t, S) => {
    const v = S.v, f = S.face || 1, ph = S.ph || 0, mv = S.moving === undefined ? 1 : S.moving;
    const [tL, tp, tD] = sh3(v.top), [pL, pa, pD] = sh3(v.pants), sk = v.skin, sD = mix(sk, D.n0, 0.3), [hL, hr, hD] = sh3(v.hair);
    const X = (dx) => x + f * dx;
    const rc = S.recoil || 0, lean = -rc * 4 + (S.arms === "feel" ? 1 : 0);
    const bob = Math.round(Math.abs(Math.cos(ph)) * 2 * mv);
    const hipY = y - 40 + bob, shY = y - 68 + bob, hx = X(0), sx = X(lean);
    if (!S.noShadow) A(g, 0.45, () => ell(g, x, y, 13, 2, "#000000"));
    const leg = (p, col, colD) => {
      const a = Math.sin(p) * 0.4 * mv, kb = Math.max(0, Math.sin(p - 1.3)) * 0.8 * mv;
      const kx = hx + f * Math.sin(a) * 21, ky = hipY + Math.cos(a) * 21, fx = kx + f * Math.sin(a - kb) * 20, fy = Math.min(y, ky + Math.cos(a - kb) * 20);
      seg(g, hx, hipY, kx, ky, 7, col); seg(g, kx, ky, fx, fy, 6, col); seg(g, kx + f * 2, ky, fx + f * 2, fy, 1, colD);
      R(g, Math.round(fx) - (f > 0 ? 3 : 7), Math.round(fy) - 3, 10, 4, D.n1); R(g, Math.round(fx) + (f > 0 ? 3 : -7), Math.round(fy) - 3, 4, 1, D.n3);
    };
    const arm = (p, col, front) => {
      let ex, ey, hx2, hy2;
      if (S.arms === "feel" || (S.arms === "reach" && front) || rc > 0) {
        const tgt = rc > 0 ? [X(lean + 6), shY - 14 - rc * 6] : S.arms === "reach" && front && S.reach ? S.reach : [X(lean + 30 + (front ? 2 : -3)), shY + 6 + Math.sin(t * 2.2 + (front ? 0 : 1.7)) * 3];
        hx2 = tgt[0]; hy2 = tgt[1]; ex = (sx + hx2) / 2; ey = (shY + 2 + hy2) / 2 + 4;
      } else {
        const a = -Math.sin(p) * 0.45 * mv;
        ex = sx + f * Math.sin(a) * 15; ey = shY + 2 + Math.cos(a) * 15; hx2 = ex + f * Math.sin(a + 0.3 * mv) * 14; hy2 = ey + Math.cos(a + 0.3 * mv) * 14;
      }
      seg(g, sx, shY + 2, ex, ey, 6, col); seg(g, ex, ey, hx2, hy2, 5, col); ell(g, hx2, hy2, 2, 2, front ? sk : sD);
    };
    // far arm + far leg, body, near leg + near arm
    arm(ph + Math.PI, tD, false); leg(ph + Math.PI, pD, mix(pD, D.n0, 0.3));
    poly(g, [[X(-6), hipY + 2], [X(6), hipY + 2], [X(7 + lean), shY + 3], [X(-7 + lean), shY + 3]], tp);
    poly(g, [[X(-6), hipY + 2], [X(-2), hipY + 2], [X(-3 + lean), shY + 3], [X(-7 + lean), shY + 3]], tD); seg(g, X(6), hipY, X(7 + lean), shY + 4, 1, tL);
    R(g, Math.min(X(-6), X(6)), hipY, 13, 3, mix(v.pants, D.n0, 0.3));
    leg(ph, pa, pD);
    // head: profile with nose, ear, glasses
    const hy = shY - 9, hxx = X(lean + 1);
    R(g, Math.round(hxx) - 2, shY - 3, 5, 4, sD);
    PX.circle(g, hxx, hy, 7, sk); R(g, Math.round(X(lean + 7)) - (f > 0 ? 0 : 1), hy, 2, 3, sk); R(g, Math.round(X(lean + 7)) - (f > 0 ? 0 : 1), hy + 2, 2, 1, sD);
    PX.circle(g, X(lean - 1), hy - 2, 7, hr); R(g, Math.round(X(lean - 7)) - (f > 0 ? 0 : 3), hy - 2, 4, 7, hr); R(g, Math.round(X(lean + 1)), hy - 9, 5, 2, hr);
    R(g, Math.round(X(lean - 2)) - 1, hy - 8, 5, 1, hL); R(g, Math.round(hxx) - 1, hy, 2, 3, sD);
    if (S.glasses) { R(g, Math.round(X(lean + 3)) - (f > 0 ? 0 : 3), hy - 1, 4, 3, mix(D.n1, sk, 0.3)); R(g, Math.round(X(lean + 4)) - (f > 0 ? 0 : 1), hy, 1, 1, D.cream); R(g, Math.round(Math.min(hxx, X(lean + 3))), hy - 1, 3, 1, mix(D.n1, sk, 0.3)); }
    else R(g, Math.round(X(lean + 4)), hy, 1, 1, D.n0);
    R(g, Math.round(X(lean + 3)) - (f > 0 ? 0 : 2), hy + 4, 3, 1, sD);
    arm(ph, tp, true);
  };

  // ======================= dark_room =======================
  // Wiles' picture of doing maths: a dark sitting room seen faintly; the man feels his way in with his arms out, bumps the
  // armchair (o.bump first, 1.5) and the side table (o.bump second, 4.0: the vase tips over); at o.switch (7.0) his hand finds
  // the switch and the room lights warmly, revealing the askew chair and the fallen vase; at o.next (10.0) the door beside
  // him opens onto another dark room and he steps toward it. o.bump may be [t1, t2] or one number.
  K.dark_room = (o) => {
    const v = { ...MAN(), pants: mix(D.n3, D.steel[2], 0.3) };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 12.0), bb = typeof o.bump === "number" ? [o.bump, o.bump + (2.5 * d) / 12] : times(o, d, 12.0, "bump", [1.5, 4.0]), b1 = bb.length ? bb[0] : 1e9, b2 = bb.length > 1 ? bb[1] : 1e9;
      const tS = T("switch", 7.0), tN = T("next", 10.0);
      // figure path keyframes (sorted, so any beat order still gives a valid walk)
      const kf = [[0, 40]];
      if (b1 < 1e8) kf.push([b1, 134], [b1 + 0.35, 124], [b1 + 0.9, 124]);
      if (b2 < 1e8) kf.push([b2, 284], [b2 + 0.35, 274], [b2 + 0.9, 274]);
      kf.push([tS - 0.3, 470], [tN + 0.5, 470], [tN + 1.8, 532]);
      kf[0][0] = Math.min(0, ...kf.slice(1).map((k) => k[0])) - 0.5;   // the walk always starts at the left edge, before every beat
      const kfs = kf.filter((k) => isFinite(k[0])).sort((a, b) => a[0] - b[0]);
      kfs.forEach((k, i) => { if (i && k[0] <= kfs[i - 1][0]) k[0] = kfs[i - 1][0] + 0.01; });
      const xAt = (tt) => PX.KF(kfs, tt), fx = xAt(t), dx = xAt(t + 0.05) - xAt(t - 0.05);
      const moving = Math.abs(dx) > 0.15 ? 1 : 0, ph = fx / 7;
      const on = t >= tS ? clamp((t - tS) / 0.35, 0, 1) * (t - tS < 0.12 ? (PX.blink(t, 0.05) ? 1 : 0.3) : 1) : 0;
      const dark = 1 - on, hit1 = t >= b1 ? 1 : 0, hit2 = t >= b2 ? 1 : 0;
      const sh1 = hit1 ? Math.sin((t - b1) * 40) * Math.exp(-(t - b1) * 6) * 3 : 0, sh2 = hit2 ? Math.sin((t - b2) * 40) * Math.exp(-(t - b2) * 6) * 2 : 0;
      const recoil = Math.max(hit1 ? 1 - P(t, b1 + 0.15, 0.6, "io") : 0, hit2 ? 1 - P(t, b2 + 0.15, 0.6, "io") : 0) * (t > b1 + 0.02 || t > b2 + 0.02 ? 1 : 0);
      const door = P(t, tN, 0.9, "io");
      const wall = mix(mix(D.paperD, D.rust[2], 0.2), D.n3, 0.35), wd = woodCols(0.45), FY = 282;
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: wallpaper, picture, door, switch, lamp ----
      PX.par(g, c, 0.4, () => {
        R(g, -40, -40, 720, 400, wall);
        for (let x = -40; x < 690; x += 12) for (let y = 10; y < 240; y += 16) R(g, x + ((y / 16) % 2) * 6, y, 2, 2, mix(wall, D.lampD, 0.12));
        R(g, -40, 236, 720, 46, mix(wd[1], D.n2, 0.25)); R(g, -40, 236, 720, 2, wd[0]); R(g, -40, 278, 720, 4, wd[2]);
        R(g, -40, 6, 720, 6, mix(wall, D.cream, 0.15));
        // picture frame (landscape)
        R(g, 196, 104, 70, 50, wd[2]); R(g, 200, 108, 62, 42, mix(D.steel[1], D.n3, 0.3)); poly(g, [[200, 150], [200, 132], [226, 120], [262, 136], [262, 150]], mix(D.moss[2], D.n2, 0.2)); PX.circle(g, 246, 120, 4, mix(D.lamp, D.n3, 0.2));
        // night window with curtains (the only faint light before the switch)
        R(g, 372, 88, 74, 96, wd[2]); PX.vgrad(g, 376, 92, 66, 88, mix(D.n0, D.steel[2], 0.35), mix(D.steel[2], D.n1, 0.3), 5); PX.circle(g, 424, 108, 5, mix(D.cream, D.steel[0], 0.3)); PX.circle(g, 426, 107, 4, mix(D.steel[2], D.n1, 0.3));
        for (let k = 0; k < 9; k++) R(g, 380 + ((k * 23) % 58), 96 + ((k * 37) % 70), 1, 1, D.cream);
        R(g, 408, 92, 2, 88, wd[2]); R(g, 376, 134, 66, 2, wd[2]); R(g, 366, 186, 86, 4, wd[1]); R(g, 366, 186, 86, 1, wd[0]);
        for (const [cx, dir] of [[360, 1], [442, -1]]) for (let k = 0; k < 3; k++) { const col = k % 2 ? mix(D.plum[2], D.n2, 0.35) : mix(D.plum[2], D.n2, 0.2); R(g, cx + k * 5, 80, 5, 116, col); }
        R(g, 354, 78, 110, 3, mix(D.amber[2], D.n2, 0.3));
        // standing lamp by the armchair (off)
        R(g, 130, 160, 2, 122, D.n2); R(g, 122, 280, 18, 2, D.n2); poly(g, [[118, 160], [144, 160], [140, 138], [122, 138]], mix(D.paper, D.lampD, 0.3)); R(g, 118, 160, 26, 1, mix(D.lampD, D.n3, 0.3));
        // the door to the next room (opens into the dark)
        const DX = 520, DW = 54, DT = 140;
        R(g, DX - 6, DT - 6, DW + 12, FY - DT + 6, wd[2]); R(g, DX - 6, DT - 6, DW + 12, 1, wd[0]);
        R(g, DX, DT, DW, FY - DT, D.n0);
        if (door > 0) {
          // the next dark room: a faint chair + window shape, a little of our light spilling in
          A(g, 0.5, () => { R(g, DX + 10, FY - 30, 16, 20, D.n2); R(g, DX + 10, FY - 44, 4, 16, D.n2); R(g, DX + 30, DT + 22, 18, 24, mix(D.n1, D.steel[2], 0.3)); });
          A(g, 0.25 * on * door, () => poly(g, [[DX, FY], [DX + DW, FY], [DX + DW - 8, FY - 10], [DX + 4, FY - 10]], D.lamp));
        }
        const dw = Math.round(DW * (1 - door * 0.82));   // panel swings toward us, foreshortened
        R(g, DX, DT, dw, FY - DT, mix(wd[1], D.n2, 0.1)); R(g, DX, DT, dw, 1, wd[0]);
        if (dw > 14) { R(g, DX + 6, DT + 8, dw - 12, 50, mix(wd[1], D.n2, 0.25)); R(g, DX + 6, DT + 70, dw - 12, 58, mix(wd[1], D.n2, 0.25)); R(g, DX + dw - 8, DT + 66, 3, 4, D.amber[1]); }
        if (door > 0) R(g, DX + dw, DT, 3, FY - DT, wd[2]);
        // light switch beside the door
        R(g, 494, 176, 8, 12, mix(D.cream, D.n3, 0.2)); R(g, 497, on > 0.5 ? 178 : 182, 2, 4, D.n3);
        // ceiling lamp
        R(g, 309, -40, 2, 92, D.n2); poly(g, [[294, 70], [326, 70], [320, 52], [300, 52]], mix(D.paper, D.lampD, 0.3)); R(g, 294, 70, 32, 2, mix(D.lampD, D.n3, 0.3));
        if (on > 0) { R(g, 300, 70, 20, 3, D.lamp); PX.glow(g, 310, 74, 70, D.lamp, 0.3 * on); }
      });
      // ---- floor + rug ----
      PX.vgrad(g, -40, FY, 720, 90, mix(wd[1], D.n2, 0.2), mix(wd[2], D.n1, 0.3), 4);
      for (let k = 0; k < 9; k++) PX.line(g, 320 + (k - 4) * 80, FY, 320 + (k - 4) * 160, 360, mix(wd[2], D.n0, 0.25));
      ell(g, 250, 316, 170, 16, mix(D.rust[2], D.n2, 0.35)); ell(g, 250, 316, 160, 13, mix(D.rust[1], D.n2, 0.5)); for (let k = -150; k < 150; k += 10) R(g, 250 + k, 315, 5, 1, mix(D.amber[2], D.n2, 0.4));
      if (hit1) poly(g, [[110, 306], [140, 302], [150, 310], [118, 312]], mix(D.rust[2], D.n2, 0.3));   // rug rucked up
      // ---- furniture ----
      PX.par(g, c, 0.7, () => {
        // bookcase
        R(g, 30, 150, 74, 136, wd[2]); R(g, 30, 150, 74, 2, wd[0]); for (let k = 0; k < 4; k++) { const yy = 178 + k * 27; R(g, 34, yy, 66, 2, wd[1]); for (let b = 0; b < 9; b++) R(g, 36 + b * 7, yy - 18 + (b % 3), 5, 18 - (b % 3), mix([D.rust[2], D.moss[2], D.steel[2], D.paperD][b % 4], D.n1, 0.4)); }
        // armchair (askew after the first bump)
        const cx = 160 + (hit1 ? 14 : 0) + sh1, sk1 = hit1 ? 9 : 0, ac = mix(D.moss[2], D.n2, 0.25), [aL, , aD] = sh3(ac);
        A(g, 0.45, () => ell(g, cx + 26, FY + 8, 40, 4, "#000000")); if (hit1) { R(g, 162, FY + 1, 14, 1, mix(wd[2], D.n0, 0.35)); R(g, 214, FY + 1, 14, 1, mix(wd[2], D.n0, 0.35)); }
        poly(g, [[cx, FY - 74], [cx + 18, FY - 74 + sk1], [cx + 22, FY - 20], [cx, FY - 20]], aD);   // back
        R(g, cx, FY - 74, 16, 2, aL);
        R(g, cx + 4, FY - 36, 54, 18, ac); R(g, cx + 4, FY - 36, 54, 2, aL); R(g, cx + 46, FY - 46, 14, 30, ac); R(g, cx + 46, FY - 46, 14, 2, aL);
        R(g, cx + 2, FY - 18, 60, 12, aD); R(g, cx + 4, FY - 6, 4, 6, D.n1); R(g, cx + 54, FY - 6, 4, 6, D.n1);
        // side table with a vase (falls over at the second bump)
        const tx = 300 + sh2, tw = 44;
        A(g, 0.45, () => ell(g, tx + tw / 2, FY + 6, 28, 3, "#000000"));
        R(g, tx, FY - 46, tw, 5, wd[1]); R(g, tx, FY - 46, tw, 1, wd[0]); R(g, tx + 4, FY - 41, 3, 41, wd[2]); R(g, tx + tw - 7, FY - 41, 3, 41, wd[2]); R(g, tx + 6, FY - 20, tw - 12, 2, wd[2]);
        const tip = hit2 ? P(t, b2 + 0.1, 0.35, "in") : 0, vx = tx + 26, vy = FY - 46, vc = mix(D.teal[1], D.n2, 0.25);
        if (tip < 1) { const lean2 = tip * 6; poly(g, [[vx - 5 + lean2, vy - 18], [vx + 1 + lean2, vy - 18], [vx + 4, vy - 8], [vx + 2, vy], [vx - 6, vy], [vx - 8, vy - 8]], vc); R(g, vx - 4 + lean2, vy - 20, 4, 2, mix(vc, D.cream, 0.3)); seg(g, vx - 2 + lean2, vy - 20, vx - 6 + lean2 * 2, vy - 30, 1, D.moss[1]); seg(g, vx - 1 + lean2, vy - 20, vx + 3 + lean2 * 2, vy - 32, 1, D.moss[1]); PX.circle(g, vx - 6 + lean2 * 2, vy - 31, 2, D.rose[1]); }
        else { poly(g, [[vx - 4, vy - 6], [vx + 14, vy - 8], [vx + 16, vy - 1], [vx - 4, vy]], vc); seg(g, vx + 16, vy - 4, vx + 26, vy - 6, 1, D.moss[1]); PX.circle(g, vx + 27, vy - 6, 2, D.rose[1]); R(g, vx + 14, FY + 2, 4, 1, D.glass); R(g, vx + 20, FY + 4, 6, 1, D.glass); }
        // coat stand by the door
        R(g, 594, FY - 110, 3, 110, wd[2]); R(g, 586, FY - 2, 19, 2, wd[2]); poly(g, [[588, FY - 108], [604, FY - 108], [608, FY - 70], [584, FY - 70]], mix(D.steel[2], D.n2, 0.3));
      });
      // ---- the man ----
      PX.par(g, c, 0.7, () => {
        const reach = t > tS - 0.5 && t < tS + 0.6 ? [497, 182] : null;
        const turn = t > tS + 0.8 && t < tN + 0.4;   // looks back over the lit room
        sideWalker(g, Math.round(fx), FY + 4, t, { v, ph, face: turn ? -1 : 1, moving, arms: on > 0.5 ? (reach ? "reach" : "swing") : reach ? "reach" : "feel", reach, recoil: on > 0.5 ? 0 : recoil, glasses: true });
      });
      // impact puffs
      PX.par(g, c, 0.7, () => { for (const [bt, bx] of [[b1, 150], [b2, 296]]) if (t > bt && t < bt + 0.4) { const k = (t - bt) / 0.4; A(g, (1 - k) * (0.4 + 0.6 * on + 0.6 * dark), () => { for (let a = 0; a < 5; a++) { const aa = -1.2 + a * 0.6; R(g, bx + Math.cos(aa) * (6 + k * 8), FY - 50 + Math.sin(aa) * (6 + k * 8), 2, 1, D.cream); } }); } });
      // ---- darkness: the lit room under a deep cool shade; faint cool edges so shapes just read ----
      if (dark > 0) {
        A(g, 0.9 * dark, () => R(g, 0, 0, 640, 360, mix(D.n0, D.steel[2], 0.1)));
        PX.par(g, c, 0.4, () => A(g, 0.4 * dark, () => { PX.vgrad(g, 376, 92, 66, 88, mix(D.n0, D.steel[2], 0.35), mix(D.steel[2], D.n1, 0.3), 5); PX.circle(g, 424, 108, 5, mix(D.cream, D.steel[0], 0.3)); PX.circle(g, 426, 107, 4, mix(D.steel[2], D.n1, 0.3)); }));
        A(g, 0.025 * dark, () => poly(g, [[376, 92], [442, 92], [400, 330], [250, 330]], D.steel[0]));
        const e = D.steel[0];
        PX.par(g, c, 0.7, () => {
          const reach = t > tS - 0.5 && t < tS + 0.6 ? [497, 182] : null, sv = D.steel[2];
          A(g, 0.3 * dark, () => sideWalker(g, Math.round(fx), FY + 4, t, { v: { skin: sv, hair: sv, top: sv, pants: sv }, ph, face: 1, moving, arms: reach ? "reach" : "feel", reach, recoil, noShadow: true }));
          const cx = 160 + (hit1 ? 14 : 0) + sh1;
          A(g, 0.32 * dark, () => { R(g, 30, 150, 74, 1, e); R(g, cx, FY - 74, 16, 1, e); R(g, cx + 46, FY - 46, 14, 1, e); R(g, 300 + sh2, FY - 46, 44, 1, e); });
        });
        PX.par(g, c, 0.4, () => {
          A(g, 0.32 * dark, () => { R(g, 514, 134, 66, 1, e); R(g, 196, 104, 70, 1, e); R(g, 294, 70, 32, 1, e); R(g, 494, 176, 8, 1, e); R(g, 366, 186, 86, 1, e); R(g, 118, 138, 26, 1, e); });
          A(g, 0.35 * dark, () => R(g, 520, FY - 1, 54, 1, D.steel[0]));   // thin cool light under the door
        });
      } else A(g, 0.06, () => R(g, 0, 0, 640, 360, D.lampD));
      if (on > 0) { PX.glow(g, 310, 200, 260, D.lampD, 0.12 * on); dust(g, 97, 24, t, [200, 80, 220, 200], D.lamp, 0.35 * on); }
      PX.vignette(g, 0.6);
    };
  };
﻿
  // ======================= walk_film =======================
  // a small classroom with the blinds down: a projector on a cart throws a film onto a pull-down screen, a few students
  // watch. On screen the learner walks along a park path. Top-left chip = which clip was filmed, top-right = how it is
  // played, a cream arrow under the walker = the direction it LOOKS like.
  //   o.fwd 0.5   clip FORWARD (walks right)            o.back 3.0  clip BACKWARD (faces right, steps left)
  //   o.play 5.0  PLAY > over the forward clip           o.rev 7.5   REVERSE << : the forward clip run backwards looks like walking backward
  //   o.both 11.0 REVERSE << over the backward clip: looks like walking forward.  Before the first beat: the lit, empty leader.
  const SEGS = [
    { k: "fwd", def: 0.5, clip: "FORWARD", mode: 0, dir: 1 }, { k: "back", def: 3.0, clip: "BACKWARD", mode: 0, dir: -1 },
    { k: "play", def: 5.0, clip: "FORWARD", mode: 1, dir: 1 }, { k: "rev", def: 7.5, clip: "FORWARD", mode: -1, dir: -1 },
    { k: "both", def: 11.0, clip: "BACKWARD", mode: -1, dir: 1 },
  ];
  const tri = (g, x, y, h, dir, col) => { for (let k = 0; k < h; k++) { const w = Math.round((h - Math.abs(k - (h - 1) / 2) * 2) / 2) + 1; R(g, dir > 0 ? x : x - w + 1, y + k, w, 1, col); } };
  K.walk_film = (o) => {
    const learner = { skin: mix(D.lampD, D.rust[2], 0.35), hair: mix(D.n0, D.rust[2], 0.2), top: D.teal[1], pants: mix(D.n3, D.steel[2], 0.35) };
    const students = crowd(77, 6).map((v, i) => ({ ...v, style: i % 3 === 1 ? 1 : 0, hair: [D.n0, mix(D.n0, D.rust[2], 0.3), mix(D.rust[2], D.n1, 0.25), mix(D.paperD, D.amber[2], 0.35)][i % 4] }));
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 16.0);
      let cur = null, t0 = 0;
      SEGS.forEach((sg) => { const bt = T(sg.k, sg.def); if (t >= bt && (cur === null || bt >= t0)) { cur = sg; t0 = bt; } });
      const s = t - t0, flash = cur && s < 0.12 ? 1 - s / 0.12 : 0, mode = cur ? cur.mode : 0;
      const SX = 168, SY = 40, SW = 304, SH = 172, flick = 1 + 0.03 * Math.sin(t * 47) * Math.sin(t * 13);
      const wall = mix(D.n2, D.steel[2], 0.15), wd = woodCols(0.5);
      R(g, 0, 0, 640, 360, D.n1);
      // ---- far: classroom wall, blinds, chalkboard edge behind the screen ----
      PX.par(g, c, 0.4, () => {
        R(g, -40, -40, 720, 300, wall);
        R(g, 120, 30, 400, 196, mix(D.moss[2], D.n1, 0.65)); R(g, 116, 26, 408, 4, wd[1]); R(g, 116, 226, 408, 5, wd[1]); R(g, 116, 226, 408, 1, wd[0]);
        for (const bx of [-30, 548]) { R(g, bx, 40, 100, 150, mix(D.n1, D.steel[2], 0.2)); for (let y = 42; y < 190; y += 5) { R(g, bx + 2, y, 96, 3, mix(D.n2, D.paperD, 0.18)); R(g, bx + 2, y + 3, 96, 1, mix(D.n1, D.lampD, 0.15)); } A(g, 0.25, () => { for (let y = 44; y < 190; y += 5) R(g, bx + 2, y, 96, 1, D.lampD); }); }
        R(g, -40, 250, 720, 4, mix(wd[2], D.n1, 0.2));
        // screen case + pull cord
        R(g, SX - 10, SY - 10, SW + 20, 7, D.n4); R(g, SX - 10, SY - 10, SW + 20, 1, D.n6);
        R(g, SX - 3, SY - 3, SW + 6, SH + 8, mix(D.cream, D.n3, 0.45)); R(g, SX + SW / 2 - 6, SY + SH + 4, 12, 3, D.n4); R(g, SX + SW / 2, SY + SH + 7, 1, 10, D.n5);
      });
      // ---- the film on the screen ----
      PX.par(g, c, 0.4, () => {
        clipR(g, SX, SY, SW, SH, () => {
          const proj = (col) => mix(col, D.cream, 0.18);
          if (!cur) {
            // leader: bright warm frame, a registration circle, gentle flicker
            R(g, SX, SY, SW, SH, proj(mix(D.paper, D.lamp, 0.3)));
            for (let a = 0; a < TAU; a += 0.02) R(g, SX + SW / 2 + Math.cos(a) * 46, SY + SH / 2 + Math.sin(a) * 46, 1, 1, mix(D.paperD, D.n4, 0.3));
            R(g, SX + SW / 2, SY + 10, 1, SH - 20, mix(D.paperD, D.n4, 0.4)); R(g, SX + 10, SY + SH / 2, SW - 20, 1, mix(D.paperD, D.n4, 0.4));
            const sw = frac(t * 1.3) * TAU; PX.line(g, SX + SW / 2, SY + SH / 2, SX + SW / 2 + Math.cos(sw - 1.57) * 46, SY + SH / 2 + Math.sin(sw - 1.57) * 46, mix(D.ink, D.paper, 0.4));
          } else {
            PX.vgrad(g, SX, SY, SW, 120, proj(mix(D.steel[0], D.cream, 0.3)), proj(mix(D.lamp, D.cream, 0.35)), 6);
            // distant trees, hedge, path, lamp posts, a bench
            const tc = proj(mix(D.moss[2], D.steel[1], 0.3));
            for (let k = 0; k < 9; k++) { const tx = SX - 10 + k * 40 + (k % 2) * 8, tr = 14 + (k * 7) % 9; PX.circle(g, tx, SY + 112 - tr * 0.6, tr, tc); PX.circle(g, tx - 5, SY + 106 - tr * 0.8, tr * 0.6, proj(mix(D.moss[1], D.steel[1], 0.3))); }
            R(g, SX, SY + 112, SW, 26, proj(mix(D.moss[2], D.n3, 0.2))); R(g, SX, SY + 112, SW, 2, proj(D.moss[1]));
            R(g, SX, SY + 138, SW, 34, proj(mix(D.paperD, D.n4, 0.25))); R(g, SX, SY + 138, SW, 1, proj(D.paper));
            for (let k = 0; k < SW; k += 16) R(g, SX + k, SY + 156 + (k % 32 ? 0 : 6), 8, 1, proj(mix(D.paperD, D.n4, 0.45)));
            for (const lx of [SX + 40, SX + 196]) { R(g, lx, SY + 70, 3, 72, proj(D.n3)); R(g, lx - 4, SY + 66, 11, 5, proj(D.n3)); R(g, lx - 2, SY + 71, 7, 1, proj(D.lamp)); }
            R(g, SX + 236, SY + 128, 40, 4, proj(woodCols(0.4)[1])); R(g, SX + 236, SY + 120, 40, 3, proj(woodCols(0.4)[1])); R(g, SX + 240, SY + 132, 3, 8, proj(D.n3)); R(g, SX + 270, SY + 132, 3, 8, proj(D.n3));
            // the walker: always faces right; the motion (and the leg cycle) runs in the apparent direction
            const v = 24, span2 = SW + 60, x0 = cur.dir > 0 ? SX + 60 : SX + SW - 60;
            const wx = SX - 30 + ((((x0 - (SX - 30)) + cur.dir * v * s) % span2) + span2) % span2;
            sideWalker(g, Math.round(wx), SY + 162, t, { v: learner, ph: cur.dir * s * 4.6, face: 1, moving: 1, arms: "swing" });
            // curly hair bumps over the walker's head
            for (let k = 0; k < 5; k++) PX.circle(g, Math.round(wx) - 5 + k * 3, SY + 162 - 84 + (k % 2), 2, mix(D.n0, D.rust[2], 0.2));
            // apparent-direction arrow under the walker
            const ax = Math.round(wx), ay = SY + 168, ac = mix(D.cream, D.n2, 0.1);
            R(g, ax - 16, ay, 32, 2, ac); tri(g, cur.dir > 0 ? ax + 16 : ax - 17, ay - 3, 8, cur.dir, ac);
            // film grain + a running scratch
            const gr = PX.rnd(Math.floor(t * 24) + 5); for (let k = 0; k < 40; k++) A(g, 0.25, () => R(g, SX + gr() * SW, SY + gr() * SH, 1, 1, gr() < 0.5 ? D.n2 : D.cream));
            if (frac(t * 0.7) < 0.35) A(g, 0.3, () => R(g, SX + 40 + Math.floor(gr() * 220), SY, 1, SH, D.cream));
          }
          A(g, 0.12 * Math.max(0, 1 - flick) * 10, () => R(g, SX, SY, SW, SH, D.n0));
          if (flash > 0) A(g, 0.5 * flash, () => R(g, SX, SY, SW, SH, D.cream));
          // vignette inside the projected frame
          A(g, 0.22, () => { R(g, SX, SY, SW, 3, D.n0); R(g, SX, SY + SH - 3, SW, 3, D.n0); R(g, SX, SY, 4, SH, D.n0); R(g, SX + SW - 4, SY, 4, SH, D.n0); });
        });
        // labels: which clip (top-left), how it is played (top-right)
        if (cur) {
          const cw = PX.tw(g, cur.clip), kc = P(t, t0, 0.4);
          A(g, kc, () => { R(g, SX + 9, SY + 6, cw + 26, 16, D.n1); R(g, SX + 9, SY + 6, cw + 26, 1, D.teal[0]); for (let k = 0; k < 3; k++) { R(g, SX + 13, SY + 9 + k * 4, 6, 3, mix(D.cream, D.n3, 0.3)); R(g, SX + 15, SY + 10 + k * 4, 2, 1, D.n1); } PX.text(g, cur.clip, SX + 24, SY + 10, { col: D.cream }); });
          if (mode !== 0) {
            const txt = mode > 0 ? "PLAY" : "REVERSE", w = PX.tw(g, txt), x1 = SX + SW - 14, k = P(t, t0, 0.4);
            A(g, k, () => {
              const bw = w + (mode > 0 ? 14 : 22), bx = x1 - bw;
              R(g, bx - 5, SY + 6, bw + 10, 16, D.n1); R(g, bx - 5, SY + 6, bw + 10, 1, mode > 0 ? D.moss[1] : D.amber[1]);
              PX.text(g, txt, bx, SY + 10, { col: D.cream });
              if (mode > 0) tri(g, bx + w + 5, SY + 9, 9, 1, D.moss[0]);
              else { tri(g, bx + w + 12, SY + 9, 9, -1, D.amber[0]); tri(g, bx + w + 19, SY + 9, 9, -1, D.amber[0]); }
            });
          }
        }
      });
      // ---- light beam from the projector, dust in it ----
      const LX = 330, LY = 288;
      A(g, 0.07 * flick, () => poly(g, [[LX - 3, LY], [LX + 3, LY], [SX + SW, SY], [SX, SY]], D.cream));
      A(g, 0.05 * flick, () => poly(g, [[LX - 3, LY], [LX + 3, LY], [SX + SW, SY + SH], [SX, SY + SH]], D.cream));
      clipP(g, [[LX - 4, LY], [LX + 4, LY], [SX + SW, SY], [SX, SY]], () => PX.particles(g, 99, 60, t, [SX, SY, SW, LY - SY], { vy: -2, vx: 1.2, col: D.cream, a: 0.55, tw: 1.6 }));
      // ---- near: desks + students, the projector on its cart ----
      PX.par(g, c, 0.75, () => {
        R(g, -40, 254, 720, 120, mix(wd[2], D.n1, 0.45));
        [[90, 300, 1.0], [200, 296, 0.95], [462, 296, 0.95], [566, 300, 1.0]].forEach(([x, y, s2], i) => listener(g, x, y, s2, t, { ...students[i], shirt: mix(students[i].shirt, D.n1, 0.3), hair: mix(students[i].hair, D.n1, 0.2) }, 0, 0));
        R(g, -40, 318, 720, 10, mix(wd[1], D.n1, 0.35)); R(g, -40, 318, 720, 1, mix(wd[0], D.n2, 0.3)); R(g, -40, 328, 720, 40, mix(wd[2], D.n1, 0.5));
        // projector cart + projector with two reels
        R(g, 300, 300, 62, 6, D.n3); R(g, 304, 306, 4, 54, D.n2); R(g, 354, 306, 4, 54, D.n2);
        const pc = mix(D.steel[2], D.n2, 0.3), [pL, , pD] = sh3(pc);
        R(g, 306, 278, 50, 22, pc); R(g, 306, 278, 50, 1, pL); R(g, 352, 279, 4, 21, pD); R(g, 324, 284, 12, 4, D.n1); R(g, 326, 285, 8, 2, mix(D.lamp, D.n3, 0.3));
        R(g, LX - 4, LY - 2, 8, 6, D.n1); PX.glow(g, LX, LY, 14, D.lamp, 0.3);
        const ang = t * 2.4 * (mode < 0 ? -1 : 1);
        for (const [rx, ry, rr] of [[314, 262, 13], [348, 258, 13]]) {
          seg(g, rx, ry, rx + (rx < 330 ? 4 : -4), 280, 2, D.n2);
          PX.circle(g, rx, ry, rr, D.n1); PX.circle(g, rx, ry, rr - 2, mix(D.n3, D.steel[2], 0.3)); PX.circle(g, rx, ry, rr - 6, mix(D.n2, D.amber[2], 0.15)); PX.circle(g, rx, ry, 2, D.n6);
          for (let k = 0; k < 3; k++) { const a = ang + (k * TAU) / 3; R(g, rx + Math.cos(a) * (rr - 5) - 1, ry + Math.sin(a) * (rr - 5) - 1, 3, 3, D.n1); }
        }
        PX.line(g, 314, 275, 330, 279, D.n1); PX.line(g, 348, 271, 334, 279, D.n1);
      });
      PX.vignette(g, 0.6);
    };
  };
})();
