/* Geometry film, Builder A: the ancient world. Documentary palette PX.D only (black only for shadows), no mascot.
   Kinds: nile_flood, rope_stretchers, euclid_class, altar_ropes, syene_well, walkers. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, E = PX.ease, P = PX.p;
  const TAU = Math.PI * 2;

  // ---------- colour + shape kit ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A0 = hx(a), B0 = hx(b); k = clamp(k, 0, 1); return "#" + A0.map((v, i) => Math.round(v + (B0[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const sh3 = (c) => [mix(c, D.cream, 0.28), c, mix(c, D.n0, 0.45)];
  const ell = (g, cx, cy, rx, ry, col) => { if (rx < 0.5 || ry < 0.5) return; g.fillStyle = col; const yr = Math.round(ry); for (let y = -yr; y <= yr; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
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
  // convex hull, so garments threaded through IK joints never punch holes
  const hull = (pts) => {
    pts = pts.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]), lo = [], up = [];
    for (const p of pts) { while (lo.length >= 2 && cr(lo[lo.length - 2], lo[lo.length - 1], p) <= 0) lo.pop(); lo.push(p); }
    for (let i = pts.length - 1; i >= 0; i--) { const p = pts[i]; while (up.length >= 2 && cr(up[up.length - 2], up[up.length - 1], p) <= 0) up.pop(); up.push(p); }
    up.pop(); lo.pop(); return lo.concat(up);
  };
  const hpoly = (g, pts, col) => poly(g, hull(pts), col);
  const seg = (g, x1, y1, x2, y2, w, col) => {
    const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1, nx = (-dy / L) * w / 2, ny = (dx / L) * w / 2;
    poly(g, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], col);
  };
  const A = (g, a, fn) => { if (a <= 0) return; const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const clipR = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const BLK = "#000000";
  const shadow = (g, a, fn) => A(g, a, fn);
  // option time: o[k] if a number, else the default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  const bump = (t, a, r, b, f) => (t < a ? 0 : t < a + r ? E((t - a) / r, "io") : t < b ? 1 : 1 - E((t - b) / f, "io"));
  const ik = (sx, sy, hx0, hy0, L1, L2, bend) => {
    let dx = hx0 - sx, dy = hy0 - sy, dd = Math.hypot(dx, dy); const m = L1 + L2 - 0.5;
    if (dd > m) { dx *= m / dd; dy *= m / dd; dd = m; }
    dd = Math.max(dd, Math.abs(L1 - L2) + 1);
    const a = Math.acos(clamp((L1 * L1 + dd * dd - L2 * L2) / (2 * L1 * dd), -1, 1)), b = Math.atan2(dy, dx) + bend * a;
    return [sx + Math.cos(b) * L1, sy + Math.sin(b) * L1, sx + dx, sy + dy];
  };
  const flick = (t, s) => 0.93 + 0.05 * Math.sin(t * 9.1 + s) + 0.04 * Math.sin(t * 23.7 + s * 2) + 0.03 * Math.sin(t * 3.3 + s * 5);
  const dust = (g, seed, n, t, box, col, a) => PX.particles(g, seed, n, t, box, { vy: -1.2, vx: 1.6, col: col || D.lamp, a: a === undefined ? 0.35 : a, tw: 1.3 });

  // ---------- people palettes ----------
  const SKIN = {
    warm: mix(D.rose[0], D.lampD, 0.55), olive: mix(mix(D.rose[1], D.lampD, 0.55), D.moss[2], 0.12),
    brown: mix(mix(D.rust[2], D.lampD, 0.5), D.rose[1], 0.2), deep: mix(mix(mix(D.rust[2], D.lampD, 0.5), D.rose[1], 0.2), D.n1, 0.28),
  };
  const HAIR = { black: mix(D.n1, D.rust[2], 0.25), dark: mix(D.n2, D.rust[2], 0.45), grey: mix(D.n6, D.paperD, 0.3), white: mix(D.cream, D.n7, 0.35), salt: mix(D.n5, D.n2, 0.3) };
  const LINEN = mix(D.cream, D.paper, 0.3);

  // ======================= profile figure rig =======================
  // (x, y) = ground point under the hip; faces +x when dir = 1. Height v.h px (u = h / 80). lit = world side of the light (-1 left).
  // v = { h, skin, hair, hairStyle: short|bob|long|lock|knot|bald|wrap, beard: null|full|short, beardCol, dress: kilt|robe|tunic|dhoti|sheath,
  //       cloth, drape (Greek himation colour), sash, wrapCol, shawl, thread, collar (bead collar), kohl, age, child, seed }
  // Pose P (local px, +x forward, y up negative): hip [dx, dy], lean (rad, + forward), fN / fF foot targets, hN / hF hand targets,
  //       nod (px), eyes: open|closed|down|up, mouth: flat|smile|oh|talk, brow (-1..1), still (no breathing)
  let CAST = null;   // long cast shadow per unit height [dx, dy], set by a scene before drawing people
  const rig = (g, x, y, v, P, dir, t, lit) => {
    if (CAST) { const hh = v.h * (P.hip && P.hip[1] > 8 ? 0.7 : 1), fx = x + dir * (((P.fN || [0])[0] + (P.fF || [0])[0]) / 2); shadow(g, 0.2, () => poly(g, [[fx - v.h * 0.07, y], [fx + v.h * 0.07, y], [fx + CAST[0] * hh + v.h * 0.05, y + CAST[1] * hh], [fx + CAST[0] * hh - v.h * 0.05, y + CAST[1] * hh]], BLK)); }
    const u = v.h / 80, ph = v.seed || 0, ls = (lit === undefined ? -1 : lit) * dir;
    const sk = v.skin, sL = mix(sk, D.cream, 0.22), sD = mix(sk, D.n0, 0.32), sF = mix(sk, D.n0, 0.22);
    const [hL, hr, hD] = sh3(v.hair || HAIR.black), cl = v.cloth || LINEN, clL = mix(cl, D.cream, 0.35), clD = mix(cl, D.steel[2], 0.35), clF = mix(cl, D.steel[2], 0.5);
    const br = P.still ? 0 : (Math.sin(t * 1.7 + ph * 2.3) > 0.2 ? 1 : 0);
    const hip = [P.hip ? P.hip[0] : 0, -38 * u + (P.hip ? P.hip[1] : 0)], lean = P.lean || 0;
    const ax = Math.sin(lean), ay = -Math.cos(lean), rx0 = Math.cos(lean), ry0 = Math.sin(lean);   // torso up + forward axes
    const tl = 24 * u + br * 0.8, S = [hip[0] + ax * tl, hip[1] + ay * tl];
    const at = (p, f, up) => [p[0] + rx0 * f + ax * up, p[1] + ry0 * f + ay * up];
    const hs = v.child ? 1.18 : 1, hrx = Math.round(6.5 * u * hs), hry = Math.round(7.5 * u * hs);
    const H = [Math.round(S[0] + ax * (2 * u + hry) + 1.2 * u), Math.round(S[1] + ay * (2 * u + hry) + (P.nod || 0))];
    const J = at(S, -0.5 * u, -2.2 * u);
    const L1 = 20 * u, L2 = 19 * u, A1 = 13.5 * u, A2 = 12.5 * u;
    const leg = (tgt) => { const a1 = ik(hip[0], hip[1], tgt[0], tgt[1], L1, L2, 1), a2 = ik(hip[0], hip[1], tgt[0], tgt[1], L1, L2, -1); return a1[0] > a2[0] ? a1 : a2; };
    const arm = (tgt, eb) => { const a1 = ik(J[0], J[1], tgt[0], tgt[1], A1, A2, 1), a2 = ik(J[0], J[1], tgt[0], tgt[1], A1, A2, -1); if (eb) return eb > 0 ? (a1[0] > a2[0] ? a1 : a2) : (a1[0] < a2[0] ? a1 : a2); return a1[0] < a2[0] ? a1 : a2; };
    const fN = P.fN || [1.5 * u, 0], fF = P.fF || [-1.5 * u, 0];
    const hN = P.hN || [J[0] + 2 * u, J[1] + 24 * u], hF = P.hF || [J[0] - 1 * u, J[1] + 24 * u];
    const lN = leg(fN), lF = leg(fF), aN = arm(hN, P.ebN), aF = arm(hF, P.ebF);
    const bare = v.dress === "kilt" || v.dress === "dhoti" || v.dress === "sheath";
    const kneeLen = v.dress === "robe" || v.dress === "sheath" ? 1 : v.dress === "dhoti" ? 0.55 : 0;
    g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(dir, 1);
    // contact shadow
    shadow(g, 0.28, () => ell(g, (fN[0] + fF[0]) / 2, 0, 9 * u + Math.abs(fN[0] - fF[0]) / 2, 2 * u, BLK));
    const limb = (p0, p1, p2, w0, w1, c0, c1, far) => {
      seg(g, p0[0], p0[1], p1[0], p1[1], w0, far ? mix(c0, D.n0, 0.25) : c1); seg(g, p1[0], p1[1], p2[0], p2[1], w1, far ? mix(c0, D.n0, 0.25) : c1);
      if (!far) { seg(g, p0[0] + 0.6 * u * ls, p0[1] - 0.4 * u, p1[0] + 0.6 * u * ls, p1[1] - 0.4 * u, w0 - 1.6 * u, c0); seg(g, p1[0] + 0.6 * u * ls, p1[1] - 0.4 * u, p2[0] + 0.6 * u * ls, p2[1] - 0.4 * u, w1 - 1.6 * u, c0); }
    };
    const foot = (f, far) => { const c = far ? mix(sk, D.n0, 0.3) : sk; seg(g, f[0] - 1 * u, f[1] - 1.2 * u, f[0] + 4 * u, f[1] - 0.8 * u, 2.6 * u, c); R(g, f[0] + 2 * u, f[1] - 1.5 * u, 2 * u, 1, far ? c : sL); };
    const drawArm = (a, far) => {
      const E0 = [a[0], a[1]], Hh = [a[2], a[3]];
      const sleeve = !bare && v.dress !== "tunicbare";
      limb(J, E0, Hh, 5.2 * u, 4.2 * u, sk, sD, far);
      if (sleeve) { const sc = far ? mix(cl, D.n0, 0.3) : cl, m = [lerp(J[0], E0[0], 0.6), lerp(J[1], E0[1], 0.6)]; seg(g, J[0], J[1], m[0], m[1], 6.4 * u, sc); if (!far) seg(g, J[0] + 0.8 * u * ls, J[1] - 0.6 * u, m[0] + 0.8 * u * ls, m[1] - 0.6 * u, 3 * u, clL); }
      if (v.bracelet && !far) R(g, Hh[0] - 1.5 * u, Hh[1] - 2.5 * u, 3 * u, 1, D.amber[1]);
      ell(g, Hh[0], Hh[1], 2.2 * u, 2.2 * u, far ? sF : sk); if (!far) R(g, Hh[0] - 1 * u, Hh[1] - 2 * u, 2 * u, 1, sL);
    };
    const kneeOf = (l) => [l[0], l[1]], ankOf = (l) => [l[2], l[3]];
    // far arm, legs
    drawArm(aF, true);
    limb(hip, kneeOf(lF), ankOf(lF), 7 * u, 5.2 * u, sk, sD, true); foot(fF, true);
    limb(hip, kneeOf(lN), ankOf(lN), 7 * u, 5.2 * u, sk, sD, false); foot(fN, false);
    // torso
    const tor = [at(S, -4.6 * u, 0.6 * u), at(S, 4.4 * u, 0.4 * u), at(S, 5 * u, -5 * u), at(hip, 4.6 * u, 2 * u), at(hip, -4.4 * u, 1 * u), at(S, -5 * u, -6 * u)];
    if (bare) {
      hpoly(g, tor, sk); seg(g, ...at(S, 2.5 * u * ls, -3 * u), ...at(hip, 2.4 * u * ls, 3 * u), 2.5 * u, sL);
      seg(g, ...at(S, -3.8 * u * ls, -1 * u), ...at(hip, -3.6 * u * ls, 2 * u), 2 * u, sD);
      R(g, ...at(S, 2.5 * u, -6.5 * u).map(Math.round), 2 * u, 1, sD);   // chest line
      if (v.dress === "sheath") { hpoly(g, [at(S, -4.4 * u, -5 * u), at(S, 4.6 * u, -6.5 * u), at(hip, 5 * u, 2 * u), at(hip, -4.6 * u, 1 * u)], cl); seg(g, ...at(S, 1 * u, -0.5 * u), ...at(S, 1.5 * u, -6 * u), 1.2 * u, cl); }
    } else {
      hpoly(g, tor, cl); seg(g, ...at(S, 2.6 * u * ls, -3 * u), ...at(hip, 2.6 * u * ls, 3 * u), 2.4 * u, clL); seg(g, ...at(S, -3.6 * u * ls, -2 * u), ...at(hip, -3.6 * u * ls, 2 * u), 1.6 * u, clD);
      R(g, ...at(S, 1.5 * u, 0).map(Math.round), 3 * u, 1.4 * u, sD);   // neckline
    }
    if (v.collar) { const cc = v.collar; for (let k = 0; k < 3; k++) seg(g, ...at(S, -2.5 * u, -1 * u - k * 1.2 * u), ...at(S, 4.6 * u, -1.5 * u - k * 1.2 * u), 1.1 * u, k === 1 ? cc : mix(cc, D.cream, 0.3)); }
    if (v.thread) for (let k = 0; k <= 24; k++) { const q = k / 24, p = [lerp(...[at(S, -3 * u, -0.5 * u)[0], at(hip, 4 * u, 2 * u)[0]], q), lerp(...[at(S, -3 * u, -0.5 * u)[1], at(hip, 4 * u, 2 * u)[1]], q)]; R(g, p[0], p[1], 1, 1, D.cream); }
    // skirts (convex hulls through hip, knees, ankles)
    const kN = kneeOf(lN), kF = kneeOf(lF), aNk = ankOf(lN), aFk = ankOf(lF);
    const along = (a, b, q) => [lerp(a[0], b[0], q), lerp(a[1], b[1], q)];
    if (v.dress === "kilt" || v.dress === "tunic" || v.dress === "dhoti") {
      const lenq = v.dress === "dhoti" ? 0.45 : 0.15, endN = along(kN, aNk, lenq), endF = along(kF, aFk, lenq);
      const sk1 = [at(hip, -5 * u, 3.5 * u), at(hip, 5 * u, 3.5 * u), [endN[0] + 3.6 * u, endN[1]], [endN[0] - 3 * u, endN[1]], [endF[0] + 3 * u, endF[1]], [endF[0] - 3.8 * u, endF[1]], at(hip, -5.4 * u, -2 * u), at(hip, 5.4 * u, -2 * u)];
      hpoly(g, sk1, cl);
      // folds: pleats fanning from the belt to the hem
      for (let k = 0; k < 4; k++) { const q = (k + 0.5) / 4, top = at(hip, lerp(-3 * u, 3.6 * u, q), 2.8 * u), bot = [lerp(Math.min(endN[0], endF[0]) - 2 * u, Math.max(endN[0], endF[0]) + 3 * u, q), lerp(endF[1], endN[1], q) - 0.5]; PX.line(g, top[0], top[1], bot[0], bot[1], k % 2 ? clD : mix(cl, clD, 0.5)); }
      seg(g, ...at(hip, -5 * u, -1.5 * u), ...at(hip, 5 * u, -1.5 * u), 1.6 * u, v.sash || mix(cl, D.paperD, 0.5));
      if (v.dress === "kilt") { const f0 = at(hip, 4.6 * u, 1.5 * u); poly(g, [f0, [endN[0] + 3.4 * u, endN[1] - 0.5], [endN[0] + 0.5 * u, endN[1] - 0.5]], clL); }
      seg(g, endN[0] - 3 * u, endN[1], endN[0] + 3.5 * u, endN[1], 1, clD);
    } else if (v.dress === "robe" || v.dress === "sheath") {
      const lo = v.dress === "sheath" ? 0.9 : 0.86, eN = along(kN, aNk, lo), eF = along(kF, aFk, lo);
      hpoly(g, [at(hip, -5.6 * u, 4 * u), at(hip, 5.6 * u, 4 * u), [kN[0] + 4 * u, kN[1]], [kN[0] - 2 * u, kN[1] + 2 * u], [kF[0] - 4 * u, kF[1]], [eN[0] + 4 * u, eN[1]], [eN[0] - 3 * u, eN[1]], [eF[0] + 3 * u, eF[1]], [eF[0] - 4.5 * u, eF[1]]], cl);
      for (let k = 0; k < 5; k++) { const q = (k + 0.5) / 5, top = at(hip, lerp(-4 * u, 4 * u, q), 2 * u), bx = lerp(Math.min(eN[0], eF[0]) - 3 * u, Math.max(eN[0], eF[0]) + 3 * u, q); PX.line(g, top[0], top[1], bx, lerp(eF[1], eN[1], q) - 1, k % 2 ? clD : mix(cl, clD, 0.4)); }
      if (v.drape) {   // himation: wraps the hips and legs, one end over the far shoulder
        const dc = v.drape, [dL, , dD] = sh3(dc), dN = along(kN, aNk, 0.55), dF = along(kF, aFk, 0.55);
        hpoly(g, [at(hip, -5.8 * u, 1 * u), at(hip, 5.8 * u, 2 * u), [kN[0] + 4.2 * u, kN[1]], [dN[0] + 3.6 * u, dN[1]], [dN[0] - 2.5 * u, dN[1] + 1], [dF[0] - 4 * u, dF[1]], [kF[0] - 4.4 * u, kF[1]]], dc);
        seg(g, ...at(S, -3.6 * u, 0), ...at(hip, 4.6 * u, 1.5 * u), 5.5 * u, dc); ell(g, ...at(S, -3.4 * u, -0.5 * u), 3 * u, 2.6 * u, dc);
        seg(g, ...at(S, -2.2 * u, -0.8 * u), ...at(hip, 5 * u, 3.5 * u), 1.2 * u, dL); seg(g, ...at(S, -4.4 * u, 2 * u), ...at(hip, 3 * u, -0.5 * u), 1, dD);
        for (let k = 0; k < 3; k++) { const q = (k + 1) / 4; PX.line(g, ...at(hip, lerp(-4 * u, 4 * u, q), 1 * u), lerp(dF[0], dN[0], q), lerp(dF[1], dN[1], q), dD); }
        seg(g, dN[0] - 2.5 * u, dN[1] + 1, dN[0] + 3.6 * u, dN[1], 1, dD);
      } else seg(g, ...at(hip, -5 * u, -1 * u), ...at(hip, 5 * u, -1 * u), 1.4 * u, v.sash || clD);
      seg(g, eN[0] - 3 * u, eN[1], eN[0] + 4 * u, eN[1], 1, clF);
    }
    if (v.shawl) { const sc2 = v.shawl; seg(g, ...at(S, -5 * u, 0.5 * u), ...at(S, 4 * u, -7 * u), 4 * u, sc2); seg(g, ...at(S, -5.2 * u, 0), ...at(hip, -4.6 * u, 4 * u), 3.6 * u, sc2); seg(g, ...at(S, -4.4 * u, 1 * u), ...at(S, 3.6 * u, -5.5 * u), 1.2 * u, mix(sc2, D.cream, 0.3)); }
    // head
    seg(g, S[0] + 0.6 * u, S[1] + 1, H[0] - 1 * u, H[1] + hry * 0.6, 4.4 * u, sD);
    ell(g, H[0], H[1], hrx, hry, sk); ell(g, H[0] + 1.8 * u * hs, H[1] + hry * 0.42, hrx * 0.78, hry * 0.56, sk);
    const st = v.hairStyle, face = () => ell(g, H[0] + 2.2 * u * hs, H[1] + 1.6 * u * hs, hrx * 0.68, hry * 0.74, sk);
    if (st === "short" || st === "knot") {
      ell(g, H[0] - 1.2 * u, H[1] - 1.6 * u, hrx + 0.4 * u, hry * 0.82, hr); face();
      R(g, H[0] - 2 * u, H[1] - hry * 0.8, 4 * u, 1, hL); if (st === "knot") { ell(g, H[0] - hrx * 0.45, H[1] - hry * 0.95, 2.6 * u, 2.3 * u, hr); R(g, H[0] - hrx * 0.45 - 1 * u, H[1] - hry * 1.1, 2 * u, 1, hL); }
    } else if (st === "bob" || st === "long") {
      ell(g, H[0] - 1 * u, H[1] - 1 * u, hrx + 1.2 * u, hry + 0.6 * u, hr); R(g, H[0] - hrx - 2 * u, H[1], hrx * 1.5, (st === "long" ? 2.1 : 0.95) * hry, hr); face();
      R(g, H[0] + hrx * 0.25, H[1] - hry * 0.42, hrx * 0.8, 1, hD);
      for (let k = 0; k < 3; k++) R(g, H[0] - hrx - 1 * u, H[1] - 2 * u + k * 3 * u, hrx * 1.2, 1, k % 2 ? hD : hL);
      if (v.band) R(g, H[0] - hrx - 1, H[1] - hry * 0.45, hrx * 2 + 1, 1.2 * u, v.band);
    } else if (st === "lock") {
      ell(g, H[0] - 1 * u, H[1] - 2 * u, hrx * 0.95, hry * 0.7, mix(sk, hr, 0.35)); face();
      seg(g, H[0] - hrx * 0.5, H[1] - hry * 0.2, H[0] - hrx * 0.62, H[1] + hry * 1.15, 2.4 * u, hr); for (let k = 0; k < 4; k++) R(g, H[0] - hrx * 0.6, H[1] + k * 2 * u, 1, 1, hL);
    } else if (st === "bald") {
      ell(g, H[0] - hrx * 0.55, H[1] + 0.5 * u, hrx * 0.5, hry * 0.5, hr); face(); R(g, H[0] - 1 * u, H[1] - hry + 1, 3 * u, 1, sL);
    } else if (st === "wrap") {
      const wc = v.wrapCol || LINEN, [wL, , wD] = sh3(wc);
      ell(g, H[0] - 1 * u, H[1] - 1.8 * u, hrx + 1 * u, hry * 0.82, wc); face(); poly(g, [[H[0] - hrx, H[1] - 1 * u], [H[0] - hrx - 3 * u, H[1] + hry * 1.1], [H[0] - hrx + 2 * u, H[1] + hry * 0.9]], wD);
      R(g, H[0] - hrx, H[1] - hry * 0.3, hrx * 2, 1.2 * u, wD); R(g, H[0] - 2 * u, H[1] - hry * 0.9, 4 * u, 1, wL);
    }
    ell(g, H[0] - 1 * u, H[1] + 0.8 * u, 1.5 * u, 2.2 * u, sD); R(g, H[0] - 1 * u, H[1] + 0.2 * u, 1, 2 * u, sk);   // ear
    // nose + face shading
    poly(g, [[H[0] + hrx - 0.6, H[1] - 1.2 * u], [H[0] + hrx + 1.9 * u, H[1] + 1.9 * u], [H[0] + hrx - 0.2, H[1] + 2.3 * u]], sk); R(g, H[0] + hrx, H[1] + 2 * u, 1, 1, sD);
    R(g, H[0] + hrx - 2 * u, H[1] - 3 * u, 2 * u, 1, sL);
    // beard
    const bc = v.beardCol || hr, [bL, , bD] = sh3(bc);
    if (v.beard) {
      const full = v.beard === "full";
      hpoly(g, [[H[0] - 0.5 * u, H[1] + hry * 0.1], [H[0] + hrx - 1 * u, H[1] + hry * 0.4], [H[0] + hrx + 0.4 * u, H[1] + hry * 0.62], [H[0] + hrx - 1 * u, H[1] + hry * (full ? 1.3 : 1.0)], [H[0] + 1 * u, H[1] + hry * (full ? 1.15 : 0.9)], [H[0] - 1.5 * u, H[1] + hry * 0.5]], bc);
      R(g, H[0] + hrx - 3 * u, H[1] + hry * 0.38, 3.6 * u, 1.2 * u, bc); for (let k = 0; k < 3; k++) R(g, H[0] + k * 2 * u, H[1] + hry * (0.7 + k * 0.1), 1, 2 * u, bL); R(g, H[0] + hrx - 2 * u, H[1] + hry * (full ? 1.2 : 0.92), 2 * u, 1, bD);
    }
    // eyes, brow, mouth (auto blink)
    const ex = Math.round(H[0] + hrx - 3.2 * u), ey = Math.round(H[1] - 0.6 * u), blink = frac(t / 3.7 + ph * 0.31) < 0.04;
    let eyes = P.eyes || "open"; if (blink && eyes === "open") eyes = "closed";
    const browY = ey - 2 - Math.round((P.brow || 0) * 1.2), browC = v.age > 0.5 ? mix(hD, D.n7, 0.45) : hD;
    if (eyes === "closed") R(g, ex - 1, ey + 1, 3, 1, mix(sD, D.n0, 0.4));
    else if (eyes === "down") { R(g, ex - 1, ey + 1, 3, 1, mix(sD, D.n0, 0.4)); R(g, ex + 1, ey + 2, 1, 1, D.n0); }
    else { R(g, ex - 1, ey, 3, 2, mix(D.cream, sk, 0.22)); R(g, ex + 1, ey + (eyes === "up" ? -0 : 0), 1, 2, D.n0); if (eyes === "up") R(g, ex - 1, ey + 1, 2, 1, mix(D.cream, sk, 0.22)); }
    if (v.kohl && eyes !== "closed") { R(g, ex - 1, ey - 1, 4, 1, D.n1); R(g, ex - 2, ey + 1, 1, 1, D.n1); }
    R(g, ex - 1, browY, 4, 1, browC); if ((P.brow || 0) < -0.4) R(g, ex + 2, browY + 1, 1, 1, browC);
    const mx = Math.round(H[0] + hrx - 1.6 * u), my = Math.round(H[1] + hry * 0.5), mD = mix(D.rust[2], D.n0, 0.5);
    let mo = P.mouth || "flat"; if (mo === "talk") mo = Math.sin(t * 13 + ph) > 0 ? "oh" : "flat";
    if (mo === "oh") R(g, mx - 1, my - 1, 2, 2, mD);
    else if (mo === "smile") { R(g, mx - 1, my, 3, 1, sD); R(g, mx - 2, my - 1, 1, 1, sD); }
    else R(g, mx - 1, my, 3, 1, v.beard ? bD : sD);
    if (v.age > 0.5) { R(g, ex - 2, ey + 2, 2, 1, sD); R(g, mx - 3, my - 2, 1, 2, sD); R(g, H[0] + 1, H[1] - hry * 0.55, 3, 1, mix(sk, sD, 0.5)); }
    // near arm on top
    drawArm(aN, false);
    g.restore();
    const W = (p) => [x + dir * p[0], y + p[1]];
    return { eN: W([aN[0], aN[1]]), hN: W([aN[2], aN[3]]), hF: W([aF[2], aF[3]]), H: W(H), S: W(S), hip: W(hip), u, ex: W([ex, ey]) };
  };
  // world target -> rig local
  const loc = (x, y, dir, wx, wy) => [(wx - x) * dir, wy - y];
  // walk cycle: phase 0..1 per two steps, stride s; stance feet slide back linearly so they stay planted on ground moving at s / (T/2)
  const gait = (ph, s, lift, u) => {
    const f = (p) => { p = frac(p); if (p < 0.5) return [s / 2 - s * (p / 0.5), 0]; const q = (p - 0.5) / 0.5; return [-s / 2 + s * PX.smooth(q), -lift * Math.sin(q * Math.PI)]; };
    return { fN: f(ph), fF: f(ph + 0.5), bob: -1.4 * u * Math.abs(Math.sin(ph * TAU)) + 1.2 * u, sw: Math.sin(ph * TAU) };
  };

  // ---------- scenery pieces ----------
  // date palm: base (x, y), height h, sway
  const palm = (g, x, y, h, t, seed, cols) => {
    const r = PX.rnd(seed), bend = (r() - 0.5) * 0.35 * h, sw = Math.sin(t * 0.9 + seed) * 1.5;
    const trunk = cols.trunk, trD = mix(trunk, D.n0, 0.35), lf = cols.leaf, lfD = mix(lf, D.n0, 0.3), lfL = mix(lf, D.cream, 0.2);
    let px = x, py = y; const n = Math.ceil(h / 3);
    for (let i = 0; i <= n; i++) { const q = i / n, cx = x + bend * q * q + sw * q * q, cy = y - h * q, w = Math.max(2, Math.round(lerp(h * 0.07, h * 0.045, q))); R(g, cx - w / 2, cy, w, 3, i % 2 ? trunk : trD); R(g, cx - w / 2, cy, 1, 3, trD); px = cx; py = cy; }
    const fr = 9 + Math.floor(r() * 3), L = h * 0.42;
    for (let k = 0; k < fr; k++) {
      const a0 = -Math.PI / 2 + (k / (fr - 1) - 0.5) * 3.6 + (r() - 0.5) * 0.3, wv = Math.sin(t * 1.4 + k + seed) * 0.06;
      let lx = px, ly = py; const len = L * (0.75 + r() * 0.35), col = k % 3 === 0 ? lfD : k % 3 === 1 ? lf : lfL;
      for (let s = 1; s <= 10; s++) {
        const q = s / 10, a = a0 + wv + q * q * (Math.cos(a0) > 0 ? 0.9 : -0.9) * (Math.abs(Math.cos(a0)) + 0.2), nx = px + Math.cos(a) * len * q, ny = py + Math.sin(a) * len * q + q * q * len * 0.35;
        PX.line(g, lx, ly, nx, ny, col); if (s > 2 && s < 9) { R(g, nx, ny + 1, 1, 2 + (s % 2), col); R(g, nx - 1, ny + 2, 1, 1, lfD); }
        lx = nx; ly = ny;
      }
    }
    ell(g, px, py + 1, 2, 2, mix(trunk, lf, 0.4)); for (let k = 0; k < 3; k++) R(g, px - 2 + k * 2, py + 2, 1, 2, D.amber[2]);
  };
  // flying bird silhouette (2 frames of wing)
  const bird = (g, x, y, t, col, sc) => { const up = Math.sin(t * 9) > 0; sc = sc || 1; R(g, x - sc, y, 2 * sc + 1, 1, col); if (up) { R(g, x - 3 * sc, y - sc, 2 * sc, 1, col); R(g, x + sc + 1, y - sc, 2 * sc, 1, col); } else { R(g, x - 3 * sc, y + 1, 2 * sc, 1, col); R(g, x + sc + 1, y + 1, 2 * sc, 1, col); } };
  // egret standing (x, y feet), facing dir, peck 0..1
  const egret = (g, x, y, dir, peck, t, sc) => {
    sc = sc || 1; const w = mix(D.cream, D.n7, 0.15), wD = mix(D.cream, D.steel[1], 0.4), yb = D.amber[1];
    g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(dir, 1);
    shadow(g, 0.25, () => ell(g, 0, 0, 5 * sc, 1, BLK));
    PX.line(g, -1, 0, -1, -7 * sc, D.n2); PX.line(g, 1, 0, 1, -7 * sc, D.n2);
    ell(g, 0, -10 * sc, 5 * sc, 3 * sc, w); R(g, -5 * sc, -10 * sc, 3 * sc, 2 * sc, wD); poly(g, [[-4 * sc, -9 * sc], [-9 * sc, -7 * sc], [-4 * sc, -8 * sc]], w);
    const hx0 = lerp(4, 7, peck) * sc, hy0 = lerp(-19, -6, peck) * sc;
    seg(g, 3 * sc, -11 * sc, hx0 - 1, hy0 + 2 * sc, 2 * sc, w); ell(g, hx0, hy0, 1.6 * sc, 1.4 * sc, w);
    PX.line(g, hx0 + 1, hy0, hx0 + 5 * sc, hy0 + lerp(0, 3, peck) * sc, yb); R(g, hx0, hy0 - 1, 1, 1, D.n0);
    g.restore();
  };
  // knotted rope through points pts (array of [x,y]); knots at equal arc length (n intervals); returns knot positions
  const rope = (g, pts, n, col, from) => {
    const cD = mix(col, D.n0, 0.45), cL = mix(col, D.cream, 0.3);
    for (let i = 1; i < pts.length; i++) { PX.line(g, pts[i - 1][0], pts[i - 1][1] + 1, pts[i][0], pts[i][1] + 1, cD); PX.line(g, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], col); }
    if (!n) return [];
    const cum = [0]; for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const L = cum[cum.length - 1], out = []; let j = 1;
    for (let k = from === undefined ? 1 : from; k < n; k++) {
      const s = (L * k) / n; while (j < cum.length - 1 && cum[j] < s) j++;
      const q = (s - cum[j - 1]) / Math.max(1e-6, cum[j] - cum[j - 1]), p = [lerp(pts[j - 1][0], pts[j][0], q), lerp(pts[j - 1][1], pts[j][1], q)];
      ell(g, p[0], p[1] + 0.5, 1.6, 1.6, cD); R(g, p[0] - 1, p[1] - 1, 2, 2, col); R(g, p[0] - 1, p[1] - 1, 1, 1, cL); out.push(p);
    }
    return out;
  };
  const curve = (f, n) => { const out = []; for (let i = 0; i <= n; i++) out.push(f(i / n)); return out; };
  // wooden peg: base (x, y), height above ground h
  const peg = (g, x, y, h, wood) => {
    const [wL, w, wD] = wood; shadow(g, 0.3, () => ell(g, x + 4, y + 1, 5, 1.5, BLK));
    R(g, x - 2, y - h, 5, h, w); R(g, x - 2, y - h, 1, h, wL); R(g, x + 2, y - h, 1, h, wD); R(g, x - 3, y - h - 2, 7, 3, mix(w, D.paperD, 0.3)); R(g, x - 3, y - h - 2, 7, 1, mix(w, D.cream, 0.3)); R(g, x - 2, y - 1, 5, 1, mix(wD, D.n0, 0.3));
    for (let k = 0; k < h - 6; k += 5) R(g, x, y - h + 3 + k, 1, 2, wD);
  };
  const woodCols = (k) => { const w = mix(mix(D.rust[2], D.amber[2], 0.45), D.n2, k === undefined ? 0.35 : k); return [mix(w, D.lamp, 0.25), w, mix(w, D.n0, 0.42)]; };
  // flat-roofed mud-brick house
  const house = (g, x, y, w, h, wall, lightSide) => {
    const wL = mix(wall, D.lamp, 0.18), wD = mix(mix(wall, D.rust[2], 0.2), D.n3, 0.3);
    shadow(g, 0.25, () => R(g, x - 1, y - 1, w + 3, 2, BLK));
    R(g, x, y - h, w, h, wall); R(g, x, y - h, w, 2, wL); R(g, x - 1, y - h - 2, w + 2, 2, mix(wall, D.paperD, 0.2));
    R(g, lightSide < 0 ? x + w - Math.round(w * 0.3) : x, y - h, Math.round(w * 0.3), h, wD);
    R(g, x + Math.round(w * 0.2), y - Math.round(h * 0.55), 3, 3, mix(D.n1, wall, 0.25));
    if (w > 18) R(g, x + Math.round(w * 0.55), y - Math.round(h * 0.5), 4, Math.round(h * 0.5), mix(D.n1, wall, 0.2));
  };

  // ======================= rope_stretchers =======================
  // after the flood, wet black mud at morning. Two men stretch a knotted rope taut between pegs (o.stretch 0.5), a third
  // hammers the corner peg (o.peg 3.0), then the rope is pressed down and dragged to mark a straight boundary groove (o.mark 5.0).
  K.rope_stretchers = (o) => {
    const MA = { h: 104, skin: SKIN.brown, hair: HAIR.black, hairStyle: "short", dress: "kilt", seed: 1 };
    const MB = { h: 82, skin: SKIN.deep, hair: HAIR.black, hairStyle: "bob", dress: "kilt", seed: 2.4, cloth: mix(LINEN, D.paperD, 0.2) };
    const MC = { h: 96, skin: mix(SKIN.brown, SKIN.olive, 0.4), hairStyle: "wrap", wrapCol: mix(LINEN, D.paperD, 0.15), dress: "kilt", seed: 3.7, bracelet: 1 };
    const W1 = { h: 60, skin: SKIN.brown, hair: HAIR.black, hairStyle: "long", dress: "sheath", seed: 5, band: D.teal[2], collar: D.teal[1] };
    const W2 = { h: 62, skin: SKIN.deep, hair: HAIR.grey, hairStyle: "bald", dress: "kilt", seed: 6.2, age: 0.9, cloth: mix(LINEN, D.paperD, 0.3) };
    const W3 = { h: 50, skin: SKIN.brown, hair: HAIR.black, hairStyle: "lock", dress: "kilt", seed: 7.1, child: 1 };
    const r0 = PX.rnd(11), CLODS = [...Array(260)].map(() => [r0() * 700 - 30, 158 + Math.pow(r0(), 1.4) * 205, r0()]);
    const PUD = [[300, 330, 46, 6], [592, 300, 30, 4], [84, 214, 34, 3], [400, 202, 40, 3], [250, 228, 22, 2]];
    const PALMS = [[22, 150, 38, 1], [46, 151, 30, 2], [212, 149, 26, 3], [360, 150, 34, 4], [380, 151, 24, 5], [600, 150, 40, 6], [626, 151, 30, 7]];
    const GA = [172, 300], GB = [486, 246];   // peg bases (near-left corner peg, far-right peg)
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8), tS = T("stretch", 0.5), tP = T("peg", 3.0), tM = T("mark", 5.0);
      const s = P(t, tS, 1.1, "io"), low = P(t, tM, 0.6, "io"), gr = P(t, tM + 0.45, 1.5, "io"), drag = P(t, tM + 0.45, 1.5, "io");
      const hitT = t - tP, hits = clamp(Math.floor(hitT / 0.42) + (hitT >= 0 ? 1 : 0), 0, 4), hammering = hitT >= 0 && hitT < 4 * 0.42;
      const sw = hammering ? frac(hitT / 0.42) : 1;          // 0 = raised .. 0.55 strike .. 1 recover
      const sink = (hits >= 4 ? 1 : hits / 4 - (hammering && sw < 0.55 ? 0 : 0)) * 7;
      const hA = 15 - sink, hB = 11;
      const sky0 = mix(D.steel[0], D.cream, 0.3), sky1 = mix(D.lamp, D.cream, 0.4), haze = mix(D.paperD, D.steel[0], 0.35);
      CAST = [0.85, 0.32];
      // --- sky + far
      PX.par(g, c, 0.15, () => {
        PX.vgrad(g, -40, -40, 720, 196, sky0, sky1, 9);
        PX.glow(g, 96, 112, 140, D.lamp, 0.4); PX.circle(g, 96, 112, 8, D.cream);
        for (let k = 0; k < 5; k++) { const cx = ((k * 170 + t * 2.5) % 860) - 110, cy = 26 + (k % 3) * 20; A(g, 0.5, () => { ell(g, cx, cy + 2, 44, 3, mix(D.paperD, D.steel[0], 0.35)); ell(g, cx + 4, cy, 38, 3, mix(D.cream, sky0, 0.3)); ell(g, cx + 20, cy - 3, 18, 3, D.cream); }); }
        for (let k = 0; k < 3; k++) { const ph = frac(t / 9 + k * 0.13), bx = lerp(700, -60, ph), by = 58 + k * 6 + Math.sin(t + k) * 2; bird(g, bx + k * 9, by, t + k, mix(D.n4, D.steel[2], 0.3), 1); }
      });
      PX.par(g, c, 0.3, () => {
        // desert escarpment in haze, retreating floodwater at the horizon, village mound at right
        poly(g, curve((q) => [lerp(-40, 680, q), 122 + Math.sin(q * 7) * 5 + Math.sin(q * 23) * 2 + (q > 0.55 && q < 0.7 ? -8 * Math.sin((q - 0.55) / 0.15 * Math.PI) : 0)], 60).concat([[680, 150], [-40, 150]]), mix(sky1, D.paperD, 0.35));
        poly(g, curve((q) => [lerp(-40, 680, q), 132 + Math.sin(q * 9 + 2) * 3 + Math.sin(q * 31) * 1.5], 60).concat([[680, 150], [-40, 150]]), mix(sky1, mix(D.paperD, D.amber[2], 0.3), 0.5));
        for (let k = 0; k < 40; k++) { const tx = -30 + k * 18 + (k % 3) * 5, th = 4 + (k * 7) % 6; ell(g, tx, 141 - th / 2, 4 + (k % 3), th / 2 + 1, mix(mix(D.moss[2], D.steel[1], 0.4), sky1, 0.45)); }
        R(g, -40, 140, 720, 16, haze);
 R(g, -40, 147, 720, 8, mix(sky1, D.steel[0], 0.3));
        for (let k = 0; k < 30; k++) A(g, 0.5 + 0.5 * Math.sin(t * 2 + k), () => R(g, (k * 47) % 700 - 30, 149 + (k % 3) * 2, 6 + (k % 4) * 2, 1, D.cream));
        ell(g, 520, 150, 120, 12, mix(haze, D.amber[2], 0.25));
        const wall = mix(mix(D.paperD, D.amber[2], 0.3), D.steel[0], 0.25);
        for (const [hx0, hw, hh] of [[440, 26, 14], [466, 18, 18], [488, 30, 12], [522, 22, 16], [548, 34, 13], [586, 20, 10]]) house(g, hx0, 146, hw, hh, wall, -1);
        for (const [px, py, ph0, sd] of PALMS) palm(g, px, py, ph0, t, sd, { trunk: mix(D.n4, D.amber[2], 0.3), leaf: mix(mix(D.moss[2], D.steel[1], 0.35), D.paperD, 0.25) });
      });
      // --- mud plain
      PX.par(g, c, 0.7, () => {
        PX.vgrad(g, -40, 154, 720, 220, mix(mix(D.n4, D.paperD, 0.35), D.rust[2], 0.1), mix(D.n1, D.rust[2], 0.3), 12);
        // broad wet sheens reflecting the bright sky
        for (let k = 0; k < 7; k++) A(g, 0.16, () => ell(g, 60 + k * 90 + (k % 2) * 20, 172 + k * 9 + (k % 3) * 14, 70 + k * 6, 3 + k, sky1));
        // the low earthen dyke the villagers stand on
        const dk = mix(mix(D.paperD, D.rust[2], 0.3), D.n4, 0.2), dkL = mix(dk, D.lamp, 0.3), dkD = mix(dk, D.n1, 0.45);
        poly(g, curve((q) => [lerp(-40, 400, q), 183 + Math.sin(q * 17) * 1.2 + (q > 0.85 ? (q - 0.85) * 60 : 0)], 30).concat([[400, 200], [-40, 204]]), dk);
        poly(g, curve((q) => [lerp(-40, 404, q), 193 + Math.sin(q * 11 + 1) * 1.5 + (q > 0.85 ? (q - 0.85) * 30 : 0)], 30).concat([[404, 201], [-40, 206]]), dkD);
        for (let k = 0; k < 60; k++) R(g, -40 + k * 7.3, 183 + Math.sin(k * 0.6) * 1, 4 + (k % 3), 1, dkL);
        for (let k = 0; k < 26; k++) { const tx = -30 + k * 16 + (k % 3) * 3, th = 3 + (k % 4); for (let j = -1; j <= 1; j++) PX.line(g, tx, 184, tx + j * 2 + Math.sin(t * 1.3 + k) * 0.6, 184 - th, j ? D.moss[2] : mix(D.moss[1], D.paperD, 0.3)); }
        for (const [cx, cy, k] of CLODS) { const near = (cy - 158) / 205, w = 1 + Math.round(near * 3); R(g, cx, cy, w, 1, k < 0.5 ? mix(D.n1, D.rust[2], 0.25) : mix(D.n4, D.paperD, 0.25)); if (k > 0.8 && near > 0.4) R(g, cx, cy - 1, w, 1, mix(sky1, D.n4, 0.4)); }
        // first green shoots and straw left by the flood
        for (let k = 0; k < 40; k++) { const sx = (k * 97) % 680 - 20, sy = 210 + (k * 53) % 140, nn = (sy - 158) / 205; if (Math.abs(sy - lerp(300, 246, (sx - 172) / 314)) < 10 && sx > 150 && sx < 500) continue; R(g, sx, sy - 1 - nn * 2, 1, 1 + nn * 2, mix(D.moss[1], D.moss[2], k % 2)); R(g, sx + 2, sy - nn * 2, 1, 1 + nn * 2, D.moss[2]); }
        // wet sheen: sky glints on the mud
        for (let k = 0; k < 46; k++) { const gx = (k * 71) % 700 - 30, gy = 160 + ((k * 37) % 190), near = (gy - 158) / 200; A(g, 0.25 + 0.25 * Math.sin(t * 1.3 + k * 1.7), () => R(g, gx, gy, 4 + near * 14, 1, sky1)); }
        for (const [px, py, pw, ph0] of PUD) {
          ell(g, px, py, pw, ph0 + 1, mix(D.n1, D.rust[2], 0.2)); ell(g, px, py, pw - 2, ph0, mix(sky0, D.n4, 0.35)); ell(g, px - 3, py - 1, pw - 8, Math.max(1, ph0 - 2), mix(sky1, D.n5, 0.3));

          const rp = frac(t * 0.45 + px * 0.01); A(g, 0.6 * (1 - rp), () => { const rr = pw * 0.2 + rp * pw * 0.5; ell(g, px + pw * 0.2, py, rr, Math.max(1, rr * ph0 / pw), mix(D.n4, D.steel[2], 0.3)); ell(g, px + pw * 0.2, py, rr - 1, Math.max(0.6, (rr - 1) * ph0 / pw), mix(sky0, D.steel[1], 0.2)); });
        }
        // footprints from the men walking out
        for (let k = 0; k < 9; k++) { R(g, 120 + k * 9, 330 - k * 4 + (k % 2) * 3, 3, 1, mix(D.n0, D.rust[2], 0.2)); R(g, 500 + k * 6, 300 - k * 5 + (k % 2) * 2, 2, 1, mix(D.n0, D.rust[2], 0.2)); }
        // villagers on the dyke
        const look = s > 0.2 ? 1 : 0, point = bump(t, tP + 0.2, 0.3, tP + 1.8, 0.4);
        rig(g, 290, 192, W1, { hF: [3, -40], hN: [5, -34], nod: Math.sin(t * 0.8) > 0.6 ? 1 : 0, mouth: "flat" }, 1, t, -1);
        { const j = [290 + 1, 192 - 60 + 1]; ell(g, j[0], j[1] - 2, 5, 4, mix(D.rust[1], D.paperD, 0.3)); R(g, j[0] - 2, j[1] - 7, 5, 2, mix(D.rust[2], D.n2, 0.2)); R(g, j[0] - 3, j[1] - 4, 2, 1, mix(D.rust[0], D.cream, 0.2)); }
        const r2 = rig(g, 318, 191, W2, { hN: [9, -26], hF: [-3, -20], lean: 0.08, eyes: "open", brow: point > 0.5 ? 1 : 0 }, 1, t, -1);
        PX.line(g, r2.hN[0] + 1, r2.hN[1] - 8, r2.hN[0] + 3, 191, mix(D.amber[2], D.n2, 0.3));
        rig(g, 340, 192, W3, { hN: point > 0 ? [lerp(4, 13, point), lerp(-14, -28, point)] : [3, -14], mouth: point > 0.5 ? "oh" : "flat", nod: -point }, 1, t, -1);
        // egrets in the mud
        egret(g, 410 + Math.sin(t * 0.3) * 6, 214, -1, Math.max(0, Math.sin(t * 1.9)) ** 6, t, 1);
        egret(g, 596, 318, -1, frac(t / 2.6) < 0.25 ? Math.sin(frac(t / 2.6) / 0.25 * Math.PI) : 0, t, 1.4);
      });
      // --- rope geometry
      const L0 = [GA[0], GA[1]], L1g = [GB[0], GB[1]];
      const groundAt = (q) => [lerp(L0[0], L1g[0], q), lerp(L0[1], L1g[1], q)];
      const slack = (q) => { const p = groundAt(q), sc = lerp(1, 0.55, q); return [p[0] + Math.sin(q * 9.4 + 0.6) * 4 * sc, p[1] + 2 + (Math.sin(q * 6.1 + 1) * 6 + Math.sin(q * 15) * 2) * Math.sin(q * Math.PI) * sc]; };
      const tautAt = (q) => { const p = groundAt(q); return [p[0], p[1] - lerp(hA - 2, hB - 2, q)]; };
      const gpath = (q) => { const a = slack(q), b = groundAt(q); return [lerp(a[0], b[0], s), lerp(a[1], b[1] + 1, s)]; };
      const main = curve((q) => { const a = slack(q), b = tautAt(q), p = [lerp(a[0], b[0], s), lerp(a[1], b[1], s)], gp = gpath(q); return [p[0], lerp(p[1], gp[1], low) + drag * 7 * (1 - q * 0.4)]; }, 80);
      // the groove left behind by the dragged rope
      if (gr > 0) { const gp = curve((q) => gpath(q * gr), Math.max(2, Math.round(60 * gr))); for (let i = 1; i < gp.length; i++) { PX.line(g, gp[i - 1][0], gp[i - 1][1] + 2, gp[i][0], gp[i][1] + 2, mix(D.paperD, D.n4, 0.45)); PX.line(g, gp[i - 1][0], gp[i - 1][1] + 1, gp[i][0], gp[i][1] + 1, mix(D.n0, D.rust[2], 0.15)); PX.line(g, gp[i - 1][0], gp[i - 1][1], gp[i][0], gp[i][1], mix(D.n1, D.rust[2], 0.2)); } }
      const wood = woodCols();
      // far peg + man B (right, far)
      peg(g, GB[0], GB[1], hB, wood);
      const xB = 548 + 4 * s, yB = 258, uB = MB.h / 80;
      const hBw = [GB[0] + 28 + 3 * s - drag * 3, lerp(lerp(yB - 34, GB[1] - hB - 4, s), GB[1] + 4, low)];
      const pB = s > 0.3 ? { lean: -0.34 * s + low * 0.4, hip: [-4 * s + 3 * low, 2 * s + low * 6], fN: [lerp(1.5, 8, s) * uB, 0], fF: [lerp(-1.5, -11, s) * uB, 0], hN: loc(xB, yB, -1, hBw[0], hBw[1]), hF: loc(xB, yB, -1, hBw[0] + 3, hBw[1] + 2), brow: -s * 0.6, mouth: low > 0.5 ? "flat" : "flat", eyes: low > 0.5 ? "down" : "open" }
        : { hN: [6 * uB, -36 * uB], hF: [3 * uB, -34 * uB] };
      const rB = rig(g, xB, yB, MB, pB, -1, t, -1);
      // man C kneels behind the rope at the corner peg, facing left, with a mallet
      const xC = 198, yC = 282, uC = MC.h / 80;
      const raise = hammering ? (sw < 0.55 ? 1 - E(sw / 0.55, "in") : E((sw - 0.55) / 0.45, "io")) : (hitT < 0 ? 0.25 : 0);
      const restAfter = hits >= 4 && !hammering;
      const sight = restAfter ? P(t, tP + 4 * 0.42 + 0.3, 0.6, "io") : 0;
      const pressing = low > 0.3 && gr < 1 ? 1 : 0;
      const pegTop = [GA[0], GA[1] - hA];
      const angS = -1.22 * Math.PI, angU = -0.42 * Math.PI, ML = 22, ang = lerp(angS, angU, raise);
      const handStrike = [pegTop[0] - 3 - Math.cos(angS) * ML, pegTop[1] - 4 - Math.sin(angS) * ML], handUp = [xC - 4, yC - 70];
      let hCw = [lerp(handStrike[0], handUp[0], raise), lerp(handStrike[1], handUp[1], raise) - Math.sin(raise * Math.PI) * 6];
      if (restAfter) hCw = [xC - 16, yC - 24];
      if (pressing && restAfter) hCw = [lerp(xC - 16, GA[0] + 18, low), lerp(yC - 24, GA[1] - 3, low)];
      const rC = rig(g, xC, yC, MC, { hip: [restAfter ? 0 : (1 - raise) * 4 * uC, 17 * uC], lean: restAfter ? 0.1 + 0.25 * low : 0.62 - raise * 0.35,
 fN: [9 * uC, -1], fF: [-11 * uC, 0], hN: loc(xC, yC, -1, hCw[0], hCw[1]), hF: restAfter ? [7 * uC, -20 * uC] : loc(xC, yC, -1, pegTop[0] + 3, pegTop[1] + 5), ebN: -1, eyes: restAfter && !pressing ? (sight > 0.5 ? "open" : "down") : "down", brow: hammering ? -1 : 0, mouth: hammering && sw > 0.5 && sw < 0.7 ? "oh" : "flat", nod: hammering ? 0 : 1 }, -1, t, -1);
      // mallet
      if (!restAfter) {
        const hx1 = rC.hN[0], hy1 = rC.hN[1];
        if (!(restAfter && pressing)) {
          const ex = hx1 + Math.cos(ang) * ML, ey = hy1 + Math.sin(ang) * ML, nx = -Math.sin(ang), ny = Math.cos(ang);
          seg(g, hx1 - Math.cos(ang) * 2, hy1 - Math.sin(ang) * 2, ex, ey, 2.4, wood[1]);
          seg(g, ex - nx * 5, ey - ny * 5, ex + nx * 5, ey + ny * 5, 7, wood[2]); seg(g, ex - nx * 5 - Math.cos(ang), ey - ny * 5 - Math.sin(ang), ex + nx * 5 - Math.cos(ang), ey + ny * 5 - Math.sin(ang), 3, wood[1]); seg(g, ex - nx * 4 - Math.cos(ang) * 2, ey - ny * 4 - Math.sin(ang) * 2, ex - nx * 1 - Math.cos(ang) * 2, ey - ny * 1 - Math.sin(ang) * 2, 1.5, wood[0]);
          ell(g, hx1, hy1, 2.2 * uC, 2.2 * uC, MC.skin);
        }
      }
      if (restAfter) { seg(g, xC + 6, yC + 2, xC + 22, yC - 2, 2, wood[1]); seg(g, xC + 20, yC - 5, xC + 24, yC + 1, 6, wood[2]); }
      // mud flecks on each strike
      if (hammering && sw > 0.5 && sw < 0.9) { const k = (sw - 0.5) / 0.4; for (let i = 0; i < 6; i++) { const a = -Math.PI * (0.15 + 0.7 * hash(i, hits)), dd = k * (6 + 8 * hash(hits, i)); A(g, 1 - k, () => R(g, pegTop[0] + Math.cos(a) * dd, pegTop[1] + 4 + Math.sin(a) * dd + k * k * 8, 1, 1, mix(D.n1, D.rust[2], 0.2))); } }
      // corner peg
      peg(g, GA[0], GA[1], hA, wood);
      // ropes: main span with knots, end lengths to the hands
      const rc = mix(D.paperD, D.amber[2], 0.35);
      const xA = 106 - 4 * s, yA = 330, uA = MA.h / 80;
      const hAw = [lerp(xA + 8 * uA, GA[0] - 30 - 3 * s, E(s, "io")) + drag * 2, lerp(lerp(yA - 34 * uA, GA[1] - hA - 6, s), GA[1] + 6, low)];
      const endA = curve((q) => { const p0 = hAw, p1 = main[0], sag = (1 - s) * 16 * Math.sin(q * Math.PI); return [lerp(p0[0], p1[0], q), lerp(p0[1], p1[1], q) + sag]; }, 16);
      const endB = curve((q) => { const p0 = main[main.length - 1], p1 = rB.hN, sag = (1 - s) * 10 * Math.sin(q * Math.PI); return [lerp(p0[0], p1[0], q), lerp(p0[1], p1[1], q) + sag]; }, 12);
      rope(g, endB, 0, rc); rope(g, main, 12, rc, 0); rope(g, endA, 0, rc);
      R(g, pegTop[0] - 2, pegTop[1] + 1, 5, 2, mix(rc, D.n0, 0.3));   // lashing at the peg
      // man A (left, near) pulls
      const pA = s > 0.3 ? { lean: -0.36 * s + low * 0.45, hip: [-6 * s + 4 * low, 3 * s + low * 7], fN: [lerp(1.5, 10, s) * uA, 0], fF: [lerp(-1.5, -11, s) * uA, 0], hN: loc(xA, yA, 1, hAw[0], hAw[1]), hF: loc(xA, yA, 1, hAw[0] - 5, hAw[1] + 2), brow: -s * 0.8, mouth: s > 0.5 && t < tS + 1.6 ? "flat" : (gr >= 1 ? "smile" : "flat"), eyes: low > 0.5 && gr < 1 ? "down" : "open" }
        : { hN: loc(xA, yA, 1, hAw[0], hAw[1]), hF: [4 * uA, -32 * uA], mouth: "flat" };

      const rA = rig(g, xA, yA, MA, pA, 1, t, -1);
      // the rope's loose end trails from his hands onto the mud
      rope(g, curve((q) => [lerp(rA.hF[0], xA - 34, q), lerp(rA.hF[1], yA + 2, q) + Math.sin(q * Math.PI) * 4 * (1 - s * 0.6) - Math.sin(q * Math.PI * 2) * 3], 12), 0, rc);
      // basket of spare pegs and a water jar at the near right
      { const bx = 548, by = 344, bc = mix(D.amber[2], D.paperD, 0.35), bD = mix(bc, D.n0, 0.4);
        shadow(g, 0.3, () => ell(g, bx + 10, by + 2, 22, 4, BLK));
        for (let k = 0; k < 5; k++) { R(g, bx - 8 + k * 4, by - 30 - (k % 2) * 4, 3, 16, wood[k % 2]); R(g, bx - 8 + k * 4, by - 31 - (k % 2) * 4, 3, 1, wood[0]); }
        hpoly(g, [[bx - 14, by - 18], [bx + 14, by - 18], [bx + 11, by], [bx - 11, by]], bc); for (let k = 0; k < 4; k++) R(g, bx - 13 + k * 0.5, by - 16 + k * 4, 26 - k, 1, bD); R(g, bx - 14, by - 19, 28, 2, mix(bc, D.cream, 0.25));
        const jx = bx + 34, jc = mix(D.rust[1], D.paperD, 0.25); ell(g, jx, by - 12, 10, 12, jc); A(g, 0.5, () => ell(g, jx - 4, by - 15, 3, 6, mix(jc, D.lamp, 0.5))); ell(g, jx + 4, by - 9, 5, 9, mix(jc, D.n0, 0.3)); R(g, jx - 4, by - 26, 8, 3, mix(jc, D.n1, 0.2)); R(g, jx - 5, by - 27, 10, 2, mix(jc, D.cream, 0.2)); }
      // foreground: reeds and a clump of mud at the corners
      for (let k = 0; k < 14; k++) { const bx = 6 + k * 4, hgt = 22 + (k * 7) % 16, sw2 = Math.sin(t * 1.2 + k) * 2; seg(g, bx, 362, bx + sw2 + (k % 3 - 1) * 4, 362 - hgt, 2, k % 2 ? mix(D.moss[2], D.n2, 0.3) : mix(D.moss[1], D.paperD, 0.3)); }
      for (let k = 0; k < 10; k++) { const bx = 600 + k * 5, hgt = 18 + (k * 5) % 14, sw2 = Math.sin(t * 1.1 + k * 0.7) * 2; seg(g, bx, 362, bx + sw2 + (k % 3 - 1) * 3, 362 - hgt, 2, k % 2 ? mix(D.moss[2], D.n2, 0.35) : mix(D.moss[1], D.paperD, 0.35)); }
      PX.glow(g, 96, 102, 360, D.lamp, 0.08);
      PX.vignette(g, 0.38);
    };
  };
  // ---------- more scenery ----------
  // irregular distant grove: canopies of 2-3 lobes and the odd palm, scrolled by off
  const grove = (g, y, n, seed, col, off, span, hmax) => {
    const cD = mix(col, D.n0, 0.12);
    for (let k = 0; k < n; k++) {
      const r1 = hash(seed, k), r2 = hash(k, seed + 1), x = (((k * span) / n + r1 * 20 - (off || 0)) % (span + 80) + span + 80) % (span + 80) - 60, hh = (hmax || 14) * (0.55 + 0.45 * r2);
      if (r1 > 0.82) { const tx = x + 1, ty = y - hh * 1.4; PX.line(g, x, y, tx, ty, cD); for (const j of [-3, -2, -1, 1, 2, 3]) { const ex = tx + j * 2.5, ey = ty - 1 + Math.abs(j) * 0.4; PX.line(g, tx, ty, ex, ey, col); PX.line(g, ex, ey, ex + Math.sign(j), ey + 2, col); } R(g, tx - 1, ty - 1, 3, 1, col); continue; }
      R(g, x, y - hh * 0.5, 2, hh * 0.5, cD);
      ell(g, x, y - hh * 0.75, hh * (0.5 + r2 * 0.4), hh * 0.38, col); ell(g, x + hh * 0.45, y - hh * 0.6, hh * 0.4, hh * 0.3, cD); ell(g, x - hh * 0.4, y - hh * 0.62, hh * 0.35 * (0.6 + r1), hh * 0.28, col);
      R(g, x - hh * 0.3, y - hh * 1.05, hh * 0.4, 1, mix(col, D.cream, 0.15));
    }
  };
  const papyrus = (g, x, y, h, n, t, seed) => {
    for (let k = 0; k < n; k++) {
      const r1 = hash(seed, k), sx = x + (k - n / 2) * 3 + r1 * 3, hh = h * (0.7 + 0.3 * hash(k, seed)), sw = Math.sin(t * 1.1 + k + seed) * 2, tx = sx + (r1 - 0.5) * 8 + sw, ty = y - hh;
      PX.line(g, sx, y, tx, ty, k % 2 ? D.moss[2] : mix(D.moss[1], D.moss[2], 0.5));
      for (let j = -3; j <= 3; j++) PX.line(g, tx, ty, tx + j * 2 + sw * 0.3, ty - 4 + Math.abs(j) * 0.8, j % 2 ? mix(D.moss[1], D.amber[1], 0.3) : D.moss[1]);
    }
  };
  const flame = (g, x, y, s, t, seed) => {
    if (s <= 0.02) return;
    const f = flick(t, seed || 1), hgt = 14 * s * f, w = 4.5 * s, lean = Math.sin(t * 3.1 + (seed || 0)) * 1.5 * s;
    PX.glow(g, x, y - hgt * 0.4, 22 * s + 8, D.lamp, Math.min(0.3, 0.18 * s));
    poly(g, [[x - w, y], [x - w * 0.6, y - hgt * 0.5], [x + lean, y - hgt], [x + w * 0.7, y - hgt * 0.45], [x + w, y]], mix(D.rust[1], D.amber[1], 0.35));
    poly(g, [[x - w * 0.6, y], [x - w * 0.3, y - hgt * 0.45], [x + lean * 0.8, y - hgt * 0.78], [x + w * 0.5, y - hgt * 0.4], [x + w * 0.6, y]], D.amber[0]);
    poly(g, [[x - w * 0.25, y], [x + lean * 0.5, y - hgt * 0.45], [x + w * 0.3, y]], D.cream);
    for (let k = 0; k < 4; k++) { const ph = frac(t * 0.9 + k / 4), ex = x + Math.sin(ph * 6 + k * 2) * 3 * s; A(g, (1 - ph) * s, () => R(g, ex, y - hgt - ph * 18 * s, 1, 1, D.amber[0])); }
  };
  const smoke = (g, x, y, t, a, h) => { for (let k = 0; k < 14; k++) { const ph = frac(t * 0.22 + k / 14); A(g, (a || 0.2) * Math.sin(ph * Math.PI), () => ell(g, x + Math.sin(ph * 5 + k) * (1 + ph * 6) + ph * 8, y - ph * (h || 50), 1 + ph * 3, 1 + ph * 2, D.n6)); } };
  // papyrus boat with a square sail: centre (x, y waterline), scale sc
  const boat = (g, x, y, sc, t, sail, dir) => {
    dir = dir || 1; const hull = mix(D.amber[2], D.moss[2], 0.35), hD = mix(hull, D.n0, 0.4);
    A(g, 0.3, () => { R(g, x - 16 * sc, y + 2, 32 * sc, 1, hD); R(g, x - 10 * sc, y + 4, 20 * sc, 1, hD); });
    poly(g, [[x - 18 * sc, y - 5 * sc], [x - 12 * sc, y], [x + 12 * sc, y], [x + 18 * sc, y - 5 * sc], [x + 12 * sc, y - 2 * sc], [x - 12 * sc, y - 2 * sc]], hull); R(g, x - 12 * sc, y - 1, 24 * sc, 1, hD);
    const mx = x - dir * 2 * sc; PX.line(g, mx, y - 2 * sc, mx, y - 26 * sc, D.n3);
    const bw = Math.sin(t * 1.3 + x * 0.1) * 1.2 * sc;
    poly(g, [[mx - 9 * sc, y - 25 * sc], [mx + 9 * sc, y - 25 * sc], [mx + 8 * sc + bw, y - 7 * sc], [mx - 8 * sc + bw, y - 7 * sc]], sail); PX.line(g, mx - 9 * sc, y - 25 * sc, mx + 9 * sc, y - 25 * sc, D.n3); PX.line(g, mx - 8 * sc, y - 7 * sc, mx + 8 * sc, y - 7 * sc, D.n3);
    A(g, 0.35, () => poly(g, [[mx + dir * 2 * sc, y - 24 * sc], [mx + dir * 9 * sc, y - 24 * sc], [mx + dir * 8 * sc + bw, y - 8 * sc], [mx + dir * 2 * sc + bw, y - 8 * sc]], mix(sail, D.n0, 0.4)));
    R(g, x + dir * 9 * sc, y - 6 * sc, 2 * sc, 3 * sc, mix(D.rust[2], D.n2, 0.3)); R(g, x + dir * 9 * sc, y - 8 * sc, 2 * sc, 2 * sc, SKIN.deep);
  };
  // camel walking: feet (x, y), facing dir, phase ph
  const camel = (g, x, y, ph, dir, sc, load) => {
    const c0 = mix(D.amber[2], D.paperD, 0.45), cD = mix(c0, D.n0, 0.3), cL = mix(c0, D.cream, 0.25);
    g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(dir * sc, sc);
    shadow(g, 0.22, () => ell(g, 0, 0, 14, 2, BLK));
    const leg = (lx, p, far) => { const sw = Math.sin(p * TAU) * 4, lift = Math.max(0, Math.sin(p * TAU)) * 2; seg(g, lx, -18, lx + sw * 0.5, -9, 2.6, far ? cD : c0); seg(g, lx + sw * 0.5, -9, lx + sw, -lift, 2, far ? cD : c0); R(g, lx + sw - 1, -1 - lift, 3, 1, D.n2); };
    leg(-8, ph + 0.5, true); leg(7, ph, true);
    ell(g, 0, -22, 12, 6, c0); ell(g, -1, -27, 6, 5, c0); R(g, -5, -31, 7, 1, cL); ell(g, 1, -18, 10, 2, cD);
    seg(g, 9, -24, 15, -32, 4, c0); seg(g, 15, -32, 17, -38, 3.4, c0); ell(g, 19, -38, 3, 2, c0); R(g, 21, -38, 1, 1, D.n1); R(g, 16, -41, 2, 2, cD);
    PX.line(g, -12, -22, -14, -14, cD);
    if (load) { hpoly(g, [[-9, -29], [5, -29], [7, -19], [-11, -19]], load); R(g, -10, -24, 18, 1, mix(load, D.n0, 0.3)); R(g, -6, -33, 6, 4, mix(load, D.cream, 0.2)); }
    leg(-6, ph, false); leg(9, ph + 0.5, false);
    g.restore();
  };
  // Greek column: centre x, from yTop (under capital) to yBot, radius rw, lit from side ls
  const column = (g, x, yTop, yBot, rw, stone, ls) => {
    const [sL, s0, sD] = sh3(stone);
    R(g, x - rw, yTop, 2 * rw + 1, yBot - yTop, s0);
    for (let k = -rw + 2; k < rw - 1; k += 3) R(g, x + k, yTop + 2, 1, yBot - yTop - 4, mix(s0, sD, 0.45));
    R(g, ls > 0 ? x + rw - Math.round(rw * 0.5) : x - rw, yTop, Math.round(rw * 0.5) + 1, yBot - yTop, sD);
    R(g, ls > 0 ? x - Math.round(rw * 0.3) : x + Math.round(rw * 0.1), yTop, 2, yBot - yTop, sL);
    R(g, x - rw - 3, yTop - 4, 2 * rw + 7, 4, s0); R(g, x - rw - 2, yTop - 4, 2 * rw + 5, 1, sL); R(g, x - rw - 5, yTop - 8, 2 * rw + 11, 4, mix(s0, sL, 0.5)); R(g, x - rw - 5, yTop - 5, 2 * rw + 11, 1, sD);
    R(g, x - rw - 3, yBot - 4, 2 * rw + 7, 4, mix(s0, sD, 0.25)); R(g, x - rw - 3, yBot - 4, 2 * rw + 7, 1, sL);
  };
  const scrollEnd = (g, x, y, r, pap) => { PX.circle(g, x, y, r, pap); PX.circle(g, x, y, Math.max(1, r - 1), mix(pap, D.paperD, 0.5)); R(g, x, y, 1, 1, mix(pap, D.n2, 0.5)); };

  // ======================= nile_flood =======================
  // Egyptian farmland beside the Nile at the start of summer: palms, mud-brick houses, distant pyramids. Brown floodwater
  // spreads across the green fields from the river (o.flood 0.5, spreading for about d·0.7 - flood, capped at 4.8 s) and
  // swallows the small boundary stones; egrets lift off as it reaches them. A farmer and his son watch from a raised path.
  K.nile_flood = (o) => {
    const FARMER = { h: 100, skin: SKIN.brown, hair: HAIR.black, hairStyle: "short", dress: "kilt", seed: 1.3, cloth: mix(LINEN, D.paperD, 0.15) };
    const SON = { h: 64, skin: SKIN.brown, hair: HAIR.black, hairStyle: "lock", dress: "kilt", seed: 4.2, child: 1 };
    const Y0 = 147, Y1 = 300, VX = 320, VY = 30, NR = 9;
    const rowY = (k) => Y0 + (Y1 - Y0) * Math.pow(k / NR, 1.5);
    const XS = [...Array(13)].map((_, j) => -300 + j * 105 + (j % 3) * 12);
    const ditchX = (j, y) => VX + (XS[j] - VX) * (y - VY) / (Y1 - VY);
    const PLOTS = [], STONES = [];
    for (let k = 0; k < NR; k++) for (let j = 0; j < XS.length - 1; j++) {
      const h1 = hash(j, k + 3), cols = [D.moss[1], mix(D.moss[1], D.amber[1], 0.3), mix(D.moss[2], D.moss[1], 0.55), mix(D.moss[1], D.moss[0], 0.3), mix(D.amber[1], D.paperD, 0.35)];
      PLOTS.push([j, k, cols[Math.floor(h1 * 4.6)]]);
      if (k > 0 && hash(k, j + 7) < 0.55) { const y = rowY(k), x = ditchX(j, y); if (x > -10 && x < 650) STONES.push([x, y, 1 + 3.5 * (y - Y0) / (Y1 - Y0)]); }
    }
    STONES.push([404, 291, 5.5]);
    const nz = (x) => 0.5 + 0.5 * (0.42 * Math.sin(x * 0.027 + 1) + 0.28 * Math.sin(x * 0.071 + 2) + 0.17 * Math.sin(x * 0.19 + 0.5) + 0.13 * Math.sin(x * 0.43 + 3) * Math.sin(x * 0.05));
    const EGRETS = [[176, 214, 1], [346, 246, -1], [520, 228, -1]];
    const PALMS = [[118, 196, 46, 11], [138, 200, 38, 12], [300, 176, 34, 13], [560, 206, 50, 14], [590, 212, 40, 15]];
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8), tF = T("flood", 0.5), dur = clamp(0.7 * d - tF, 1.5, 4.8);
      const q = clamp((t - tF) / dur, 0, 1), fl = q;
      const front = (x) => Y0 + (Y1 + 3 - Y0) * clamp(fl * 1.15 - 0.15 * nz(x), 0, 1);
      const tCross = (x, y) => { const pn = clamp((((y - Y0) / (Y1 + 3 - Y0)) + 0.15 * nz(x)) / 1.15, 0, 1); return tF + dur * pn; };
      CAST = [-0.55, 0.16];
      const sky0 = mix(D.steel[0], D.cream, 0.25), sky1 = mix(D.lamp, D.cream, 0.5), haze = mix(sky1, D.paperD, 0.3);
      const water = mix(mix(mix(D.amber[2], D.paperD, 0.25), D.n4, 0.22), D.rust[2], 0.1), waterF = mix(water, sky1, 0.4), waterN = mix(water, D.n2, 0.25), foam = mix(D.paperD, D.cream, 0.5);
      // --- sky, pyramids, river
      PX.par(g, c, 0.12, () => {
        PX.vgrad(g, -40, -40, 720, 190, sky0, sky1, 9);
        PX.glow(g, 540, 46, 130, D.lamp, 0.35); PX.circle(g, 540, 46, 8, D.cream);
        for (let k = 0; k < 4; k++) { const cx = ((k * 200 - t * 2) % 860 + 860) % 860 - 110, cy = 30 + (k % 2) * 26; A(g, 0.45, () => { ell(g, cx, cy + 2, 40, 3, mix(D.paperD, D.steel[0], 0.4)); ell(g, cx + 6, cy, 34, 3, D.cream); }); }
        // desert plateau + pyramids in haze (lit from the right)
        poly(g, curve((qq) => [lerp(-40, 680, qq), 124 + Math.sin(qq * 5) * 3 + Math.sin(qq * 19) * 1.2], 50).concat([[680, 132], [-40, 132]]), mix(haze, D.amber[1], 0.12));
        for (const [px, w, hh] of [[150, 64, 40], [214, 48, 30], [258, 28, 18]]) { const top = 126 - hh; poly(g, [[px - w / 2, 126], [px, top], [px, 126]], mix(haze, D.steel[1], 0.28)); poly(g, [[px, top], [px + w / 2, 126], [px, 126]], mix(haze, D.lamp, 0.35)); R(g, px, top, 1, 2, mix(D.cream, D.lamp, 0.3)); }
      });
      PX.par(g, c, 0.3, () => {
        R(g, -40, 127, 720, 7, mix(mix(D.moss[2], D.steel[1], 0.35), haze, 0.45));
        grove(g, 133, 30, 3, mix(mix(D.moss[2], D.steel[2], 0.3), haze, 0.4), 0, 720, 13);
        PX.vgrad(g, -40, 133, 720, 16, mix(D.amber[2], sky0, 0.55), mix(water, D.steel[1], 0.2), 3);
        for (let k = 0; k < 24; k++) A(g, 0.4 + 0.4 * Math.sin(t * 2.2 + k * 1.3), () => R(g, (k * 53 + t * 4) % 720 - 40, 136 + (k % 4) * 3, 5 + (k % 3) * 3, 1, mix(D.cream, sky1, 0.3)));
        boat(g, ((t * 7 + 300) % 800) - 80, 143, 0.55, t, mix(D.cream, D.paper, 0.2), 1);
        for (let k = 0; k < 5; k++) { const ph = frac(t / 11 + 0.3), bx = lerp(-60, 700, ph) + (k % 2) * 7 - k * 5, by = 74 + Math.abs(k - 2) * 4; bird(g, bx, by, t + k * 0.4, mix(D.n3, D.steel[2], 0.3), 1); }
      });
      // --- fields, flood, stones
      PX.par(g, c, 0.65, () => {
        R(g, -40, Y0 - 1, 720, Y1 - Y0 + 8, mix(D.moss[2], D.n3, 0.2));
        for (const [j, k, col] of PLOTS) {
          const ya = rowY(k), yb = rowY(k + 1);
          poly(g, [[ditchX(j, ya) + 1, ya + 1], [ditchX(j + 1, ya) - 1, ya + 1], [ditchX(j + 1, yb) - 1, yb], [ditchX(j, yb) + 1, yb]], col);
          const nr = Math.max(1, Math.round((yb - ya) / 4));
          for (let r = 1; r < nr; r++) { const yy = lerp(ya, yb, r / nr); PX.line(g, ditchX(j, yy) + 2, yy, ditchX(j + 1, yy) - 2, yy, mix(col, D.n0, 0.18)); }
        }
        for (let j = 0; j < XS.length; j++) PX.line(g, ditchX(j, Y0), Y0, ditchX(j, Y1 + 4), Y1 + 4, mix(D.amber[2], D.n2, 0.35));
        // flood water, column by column with a foam edge and a wet margin ahead of it
        if (fl > 0) {
          g.save(); g.beginPath(); g.moveTo(-40, Y0 - 1); for (let x = -40; x <= 680; x += 2) g.lineTo(x, Math.round(front(x))); g.lineTo(680, Y0 - 1); g.closePath(); g.clip();
          PX.vgrad(g, -40, Y0 - 1, 720, Y1 - Y0 + 8, waterF, waterN, 9); g.restore();
          for (let x = -40; x < 680; x += 2) { const fy = Math.round(front(x)); if (fy <= Y0 + 0.5) continue; A(g, 0.5, () => R(g, x, fy, 2, 2, mix(D.n1, D.rust[2], 0.3))); R(g, x, fy - 1, 2, 1, mix(foam, water, 0.25)); }
        }
        for (let k = 0; k < 90; k++) { const wy = Y0 + 2 + ((k * 37) % 150), nn = (wy - Y0) / 153, wx = ((k * 91 + t * (5 + (k % 3) * 3)) % 760) - 60, len = 5 + nn * 22; if (wy < front(wx) - 2 && wy < front(wx + len) - 2) A(g, 0.3 + 0.25 * Math.sin(t * 1.7 + k), () => { R(g, wx, wy, len, 1, mix(water, sky1, 0.45)); if (k % 3 === 0) R(g, wx + 3, wy + 1, len * 0.6, 1, mix(water, D.n1, 0.25)); }); }
        for (let k = 0; k < 26; k++) { const gx = 380 + ((k * 67) % 300), gy = Y0 + 4 + ((k * 29) % 120); if (gy < front(gx) - 2) A(g, Math.max(0, Math.sin(t * 3 + k * 2.1)), () => R(g, gx, gy, 2, 1, D.cream)); }
        // a reed skiff drifts in once the land is under water
        { const age = t - (tF + 0.72 * dur); if (fl > 0.72 && age > 0) { const bx = 60 + age * 14, by = 256; if (by < front(bx) - 4) { boat(g, bx, by, 0.75, t, mix(D.paper, D.cream, 0.3), 1); } } }
        for (const [sx, sy, sz] of STONES) {
          const fy = front(sx), sub = clamp((fy - sy) / (5 + sz * 2), 0, 1), hh = Math.round(sz * 2.2), w = Math.round(sz * 2);
          if (sub < 1) {   // weathered boundary stone with a rounded top
            const vis = Math.max(1, Math.round(hh * (1 - sub))), sc = mix(mix(D.paperD, D.n5, 0.35), D.amber[2], 0.1), x0 = Math.round(sx - w / 2);
            if (sub <= 0) shadow(g, 0.3, () => poly(g, [[x0, sy], [x0 + w, sy], [x0 - hh * 0.6, sy + hh * 0.18], [x0 - hh * 0.6 - w, sy + hh * 0.18]], BLK));
            R(g, x0, sy - vis, w, vis, sc); if (vis >= hh - 1) { R(g, x0 + 1, sy - vis - 1, Math.max(1, w - 2), 1, sc); }
            R(g, x0 + w - Math.max(1, Math.round(w * 0.4)), sy - vis, Math.max(1, Math.round(w * 0.4)), vis, mix(sc, D.lamp, 0.3)); R(g, x0, sy - vis, 1, vis, mix(sc, D.n1, 0.3));
            if (w >= 5 && vis > 3) R(g, x0 + 2, sy - vis + 2, w - 4, 1, mix(sc, D.n1, 0.35));
            if (sub > 0) R(g, x0 - 1, sy, w + 2, 1, foam);
          }
          const age = t - tCross(sx, sy); if (fl > 0 && age > 0 && age < 1.6) { const rr = 2 + age * (4 + sz * 2); A(g, 0.7 * (1 - age / 1.6), () => { ell(g, sx, sy, rr, rr * 0.3, foam); ell(g, sx, sy, rr - 1, Math.max(0.6, rr * 0.3 - 1), water); }); }
        }
        // egrets lift off as the water reaches them
        for (const [ex, ey, edir] of EGRETS) {
          const age = fl > 0 ? t - tCross(ex, ey) : -1;
          if (age < 0) egret(g, ex, ey, edir, Math.max(0, Math.sin(t * 1.7 + ex)) ** 8, t, 0.9);
          else if (age < 4) { const fx = ex + edir * age * 34, fy2 = ey - 12 - age * 26 - age * age * 3; A(g, 1 - age / 4, () => bird(g, fx, fy2, t * 1.3 + ex, mix(D.cream, D.n7, 0.15), 2)); }
        }
        // palms in the fields, reflected once the flood surrounds them (the two in front of the village are drawn after it)
        for (const [px, py, ph0, sd] of PALMS.filter((p) => p[0] < 500)) {
          if (front(px) > py) A(g, 0.35, () => { for (let k = 0; k < 6; k++) R(g, px - 1 + Math.sin(t * 2 + k) * 0.8, py + 2 + k * 3, 3, 2, mix(D.moss[2], D.n1, 0.4)); });
          palm(g, px, py, ph0, t, sd, { trunk: mix(D.n3, D.amber[2], 0.4), leaf: mix(D.moss[2], D.moss[1], 0.4) });
          if (front(px) > py) R(g, px - 4, py, 8, 1, foam);
        }
        // the village mound stays dry
        const mound = mix(mix(D.paperD, D.amber[2], 0.35), D.n4, 0.1);
        poly(g, curve((qq) => [lerp(430, 700, qq), 166 - Math.sin(qq * Math.PI) * 10 + Math.sin(qq * 13) * 1.5], 24).concat([[700, 194], [440, 182]]), mound);
        R(g, 432, 180, 270, 1, mix(mound, D.n1, 0.3));
        const wall = mix(D.paperD, D.amber[2], 0.3);
        for (const [hx0, hw, hh] of [[456, 30, 18], [488, 22, 24], [512, 36, 16], [552, 26, 21], [580, 34, 15], [616, 28, 19]]) house(g, hx0, 172 - (hx0 > 500 && hx0 < 600 ? 4 : 0), hw, hh, wall, 1);
        smoke(g, 530, 146, t, 0.16, 40);
        for (const [px, py, ph0, sd] of PALMS.filter((p) => p[0] >= 500)) {
          if (front(px) > py) A(g, 0.35, () => { for (let k = 0; k < 6; k++) R(g, px - 1 + Math.sin(t * 2 + k) * 0.8, py + 2 + k * 3, 3, 2, mix(D.moss[2], D.n1, 0.4)); });
          palm(g, px, py, ph0, t, sd, { trunk: mix(D.n3, D.amber[2], 0.4), leaf: mix(D.moss[2], D.moss[1], 0.4) });
          if (front(px) > py) R(g, px - 4, py, 8, 1, foam);
        }
        // shaduf at the river bank
        { const pvx = 444, pvy = 150, a = Math.sin(t * 1.3) * 0.35; PX.line(g, pvx, 176, pvx, pvy, mix(D.n3, D.amber[2], 0.3)); const ex1 = pvx - Math.cos(a) * 18, ey1 = pvy + Math.sin(a) * 18, ex2 = pvx + Math.cos(a) * 12, ey2 = pvy - Math.sin(a) * 12; PX.line(g, ex1, ey1, ex2, ey2, mix(D.n3, D.amber[2], 0.3)); PX.line(g, ex1, ey1, ex1, ey1 + 10, D.n3); R(g, ex1 - 1, ey1 + 10, 3, 3, mix(D.rust[2], D.n2, 0.2)); ell(g, ex2, ey2, 2, 2, D.n4); }
      });
      // --- raised path (foreground) with papyrus framing
      const pth = mix(mix(D.paperD, D.amber[2], 0.35), D.rust[2], 0.18), pthL = mix(pth, D.lamp, 0.3), pthD = mix(pth, D.n1, 0.4);
      poly(g, curve((qq) => [lerp(-40, 680, qq), 300 + Math.sin(qq * 13) * 1.5 + Math.sin(qq * 31) * 0.8], 40).concat([[680, 372], [-40, 372]]), pthD);
      poly(g, curve((qq) => [lerp(-40, 680, qq), 306 + Math.sin(qq * 11 + 2) * 1.5], 40).concat([[680, 372], [-40, 372]]), pth);
      for (let k = 0; k < 70; k++) R(g, (k * 41) % 720 - 40, 310 + ((k * 23) % 50), 2 + (k % 4), 1, k % 3 ? pthD : pthL);
      R(g, -40, 306, 720, 1, pthL);
      for (let k = 0; k < 22; k++) { const tx = 70 + k * 23 + (k % 3) * 5, th = 3 + (k % 4); for (let j = -1; j <= 1; j++) PX.line(g, tx, 305, tx + j * 2 + Math.sin(t * 1.4 + k) * 0.7, 305 - th, j ? D.moss[2] : D.moss[1]); }
      // hoe and jar on the path
      { const wd = woodCols(); seg(g, 132, 330, 172, 322, 2, wd[1]); poly(g, [[170, 318], [178, 320], [176, 326], [171, 324]], mix(D.n5, D.amber[2], 0.3)); const jc = mix(D.rust[1], D.paperD, 0.3); shadow(g, 0.3, () => ell(g, 386, 336, 10, 2, BLK)); ell(g, 380, 326, 7, 9, jc); ell(g, 383, 328, 3, 6, mix(jc, D.n0, 0.3)); R(g, 377, 315, 6, 3, mix(jc, D.n1, 0.2)); A(g, 0.5, () => R(g, 376, 320, 2, 6, mix(jc, D.lamp, 0.5))); }
      // farmer + son
      const xF = 232, yF = 334, uF = FARMER.h / 80;
      const shade = fl < 0.25 ? 1 : 0, point = bump(fl, 0.22, 0.08, 0.6, 0.1), onShoulder = clamp((fl - 0.78) / 0.1, 0, 1);
      const sonWalk = clamp((fl - 0.6) / 0.18, 0, 1), sonX = lerp(292, 252, E(sonWalk, "io")), sonY = lerp(334, 338, sonWalk);
      const sonDir = fl > 0.55 && fl < 0.8 ? -1 : 1, uS = SON.h / 80;
      let hNF;
      if (shade) hNF = [10 * uF, -77 * uF]; else if (onShoulder > 0) hNF = loc(xF, yF, 1, lerp(xF + 14, sonX - 1, onShoulder), lerp(yF - 44, sonY - 50, onShoulder)); else hNF = [lerp(4, 30, point) * uF, lerp(-20, -64, point) * uF];
      const rF = rig(g, xF, yF, FARMER, { hN: hNF, hF: [-1 * uF, -22 * uF], lean: point * 0.06, eyes: shade ? "open" : "open", brow: shade ? -0.6 : point > 0.5 ? 1 : 0, mouth: point > 0.5 ? "talk" : "flat", nod: onShoulder > 0.5 ? 2 : 0 }, 1, t, 1);
      const sonStep = sonWalk > 0 && sonWalk < 1 ? gait(sonWalk * 2.4, 10 * uS, 3 * uS, uS) : null;
      const glance = frac(t / 4.3) > 0.5 && frac(t / 4.3) < 0.65;
      const sonPoint = bump(fl, 0.3, 0.06, 0.5, 0.08);
      rig(g, sonX, sonY, SON, { fN: sonStep ? sonStep.fN : undefined, fF: sonStep ? sonStep.fF : undefined, hip: sonStep ? [0, sonStep.bob] : undefined,
        hN: sonPoint > 0 ? [lerp(3, 20, sonPoint) * uS, lerp(-14, -56, sonPoint) * uS] : (sonDir < 0 ? [8 * uS, -30 * uS] : [3 * uS, -16 * uS]), hF: [-2 * uS, -16 * uS],
        eyes: sonDir < 0 || glance ? "up" : "open", mouth: sonPoint > 0.4 || (sonDir < 0) ? "oh" : "flat", brow: sonDir < 0 ? 1 : 0, nod: sonDir < 0 ? -1 : 0 }, sonDir, t, 1);
      if (onShoulder > 0.5) { seg(g, rF.eN[0], rF.eN[1], rF.hN[0], rF.hN[1], 4.2 * uF, mix(FARMER.skin, D.n0, 0.1)); ell(g, rF.hN[0], rF.hN[1], 2.4 * uF, 2.2 * uF, FARMER.skin); }
      // foreground papyrus at both edges
      papyrus(g, 10, 362, 74, 9, t, 1); papyrus(g, 618, 362, 66, 8, t, 2); papyrus(g, 48, 364, 46, 5, t, 3);
      PX.glow(g, 540, 46, 380, D.lamp, 0.07);
      PX.vignette(g, 0.36);
    };
  };

  // ======================= euclid_class =======================
  // Alexandria, about 300 BC: a sunlit colonnade, the harbour and the lighthouse beyond. A bearded teacher kneels at a sand
  // tray with a long rod and a compass: he draws a straight line between two dots (o.line 0.8), then a circle around a third
  // dot (o.circle 3.5). Three young students watch; one nods. Scrolls sit in wall niches.
  K.euclid_class = (o) => {
    const TEACH = { h: 100, skin: SKIN.olive, hair: mix(HAIR.grey, HAIR.dark, 0.45), hairStyle: "short", beard: "full", beardCol: mix(HAIR.grey, HAIR.salt, 0.5), dress: "robe", cloth: mix(D.cream, D.paper, 0.2), drape: mix(mix(D.rust[2], D.paperD, 0.3), D.n3, 0.3), seed: 2, age: 0.8 };
    const ST1 = { h: 86, skin: SKIN.warm, hair: HAIR.dark, hairStyle: "short", dress: "tunic", cloth: mix(D.steel[1], D.paper, 0.5), seed: 3.3 };
    const ST2 = { h: 84, skin: SKIN.olive, hair: HAIR.black, hairStyle: "short", dress: "tunic", cloth: mix(D.moss[1], D.paper, 0.55), sash: mix(D.moss[2], D.n2, 0.3), seed: 5.1 };
    const ST3 = { h: 80, skin: mix(SKIN.warm, SKIN.brown, 0.5), hair: HAIR.dark, hairStyle: "short", dress: "tunic", cloth: mix(D.amber[1], D.paperD, 0.5), seed: 7.7 };
    const TR = { x0: 234, x1: 416, y0: 272, y1: 324, sk: 14 };   // tray: back edge y0, front edge y1, front corners pushed out by sk
    const DA = [252, 297], DB = [338, 282], DC = [280, 309], RX = 22, RY = 8;
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8), tL = T("line", 0.8), tC = T("circle", 3.5);
      const lp = P(t, tL, 1.5, "io"), cp = P(t, tC + 0.5, 1.7, "io");
      CAST = [-0.5, 0.12];
      const stone = mix(D.paper, D.paperD, 0.35), wallC = mix(mix(D.paperD, D.amber[2], 0.18), D.n4, 0.12);
      const sky0 = mix(D.steel[0], D.cream, 0.2), sky1 = mix(D.cream, D.lamp, 0.25), sea = mix(D.teal[1], D.steel[1], 0.4);
      // --- harbour view (right)
      PX.par(g, c, 0.25, () => {
        PX.vgrad(g, 300, -40, 420, 220, sky0, sky1, 7);
        for (let k = 0; k < 3; k++) { const cx = 320 + ((k * 150 + t * 3) % 460), cy = 40 + k * 14; A(g, 0.5, () => { ell(g, cx, cy, 30, 3, D.cream); ell(g, cx + 10, cy - 2, 14, 3, D.cream); }); }
        PX.vgrad(g, 300, 168, 420, 60, mix(sea, sky1, 0.35), mix(sea, D.n2, 0.25), 5);
        for (let k = 0; k < 40; k++) A(g, 0.3 + 0.4 * Math.sin(t * 2 + k * 1.7), () => R(g, 300 + (k * 61 + t * 3) % 420, 172 + (k * 13) % 50, 3 + (k % 4) * 2, 1, mix(D.cream, sky1, 0.2)));
        // harbour mole and the lighthouse on its island
        R(g, 300, 186, 230, 4, mix(stone, D.steel[1], 0.3)); R(g, 300, 186, 230, 1, mix(stone, D.cream, 0.3));
        g.save(); g.translate(-54, 0);
        ell(g, 560, 182, 34, 6, mix(mix(D.paperD, D.amber[2], 0.3), D.steel[1], 0.25));
        const lc = mix(stone, D.steel[0], 0.2), lD = mix(lc, D.steel[2], 0.35);
        R(g, 548, 132, 24, 50, lc); R(g, 548, 132, 8, 50, lD); for (let k = 0; k < 4; k++) R(g, 558, 140 + k * 10, 3, 4, mix(D.n2, D.steel[2], 0.3));
        R(g, 546, 130, 28, 3, mix(lc, D.cream, 0.3)); R(g, 552, 108, 16, 22, lc); R(g, 552, 108, 5, 22, lD); R(g, 550, 106, 20, 2, mix(lc, D.cream, 0.3));
        R(g, 555, 94, 10, 12, lc); R(g, 555, 94, 3, 12, lD); R(g, 554, 92, 12, 2, mix(lc, D.cream, 0.3));
        const fk = flick(t, 3); PX.glow(g, 560, 88, 14, D.lamp, 0.35 * fk); poly(g, [[557, 92], [560, 85 - fk * 2], [563, 92]], D.amber[0]);
        smoke(g, 560, 84, t, 0.14, 40);
        g.restore();
        boat(g, 380 + ((t * 5) % 160), 200, 0.7, t, mix(D.cream, D.paper, 0.3), 1); boat(g, 470 - ((t * 3) % 80), 192, 0.45, t, mix(D.paper, D.rust[0], 0.25), -1);
        for (let k = 0; k < 3; k++) { const bx = 330 + ((k * 90 + t * 14) % 300), by = 70 + k * 8 + Math.sin(t * 1.5 + k) * 3; bird(g, bx, by, t + k, mix(D.n5, D.steel[1], 0.2), 1); }
      });
      // --- back wall (left) with scroll niches, and the colonnade
      PX.par(g, c, 0.6, () => {
        R(g, -40, -10, 352, 250, wallC); R(g, -40, 40, 352, 2, mix(wallC, D.cream, 0.2));
        for (let k = 0; k < 18; k++) R(g, -40 + k * 20, 20, 10, 6, mix(wallC, D.rust[1], 0.25));   // painted frieze
        R(g, -40, 18, 352, 1, mix(wallC, D.n2, 0.3)); R(g, -40, 27, 352, 1, mix(wallC, D.n2, 0.3));
        const nicheC = mix(D.n2, D.rust[2], 0.25), pap = mix(D.paper, D.cream, 0.3);
        for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) {
          const nx = 20 + k * 70, ny = 66 + r * 64;
          R(g, nx, ny, 48, 40, nicheC); R(g, nx, ny, 48, 3, mix(nicheC, D.n0, 0.3)); R(g, nx - 2, ny + 40, 52, 3, mix(wallC, D.cream, 0.25));
          for (let s = 0; s < 6; s++) {   // scrolls lying in a stack, ends facing out
            const row = s < 3 ? 0 : s < 5 ? 1 : 2, ln = 36 - row * 6 - Math.floor(hash(s, k + r) * 6), sc = hash(s, k + r) > 0.5 ? pap : mix(pap, D.amber[1], 0.25);
            const xx2 = nx + 6 + row * 3, yy2 = ny + 35 - row * 6 - (s % 3 === 1 && row === 0 ? 0 : 0);
            R(g, xx2, yy2 - 2, ln, 5, sc); R(g, xx2, yy2 + 2, ln, 1, mix(sc, D.paperD, 0.6)); R(g, xx2, yy2 - 2, ln, 1, mix(sc, D.cream, 0.4)); scrollEnd(g, xx2, yy2, 3, sc);
            if (hash(k, s + r) > 0.6) R(g, xx2 + ln - 8, yy2 - 2, 2, 5, mix(D.rust[1], D.n2, 0.2));
          }
        }
        // warm sun patch on the wall
        A(g, 0.22, () => poly(g, [[180, 40], [312, 40], [312, 236], [250, 236]], D.lamp));
        R(g, -40, 236, 352, 4, mix(wallC, D.n1, 0.35));
        // floor
        PX.vgrad(g, -40, 238, 720, 140, mix(stone, D.paperD, 0.3), mix(stone, D.n4, 0.35), 6);
        for (let k = 0; k < 9; k++) { const yy = 238 + Math.pow(k / 8, 1.4) * 124; R(g, -40, yy, 720, 1, mix(stone, D.n4, 0.5)); }
        for (let k = -6; k < 20; k++) PX.line(g, 320 + (k * 40 - 320) * 0.45, 238, 320 + (k * 40 - 320) * 1.3, 362, mix(stone, D.n4, 0.45));
        // sun shafts between the columns (light from the right, column shadows to the left)
        for (const cx of [326, 446, 566]) shadow(g, 0.22, () => poly(g, [[cx - 9, 238], [cx + 9, 238], [cx - 60, 362], [cx - 100, 362]], BLK));
        for (const cx of [326, 446, 566]) column(g, cx, 26, 240, 9, stone, 1);
        R(g, 300, 0, 420, 18, stone); R(g, 300, 14, 420, 4, mix(stone, D.n4, 0.3)); R(g, 300, 0, 420, 2, mix(stone, D.cream, 0.3));
        for (let k = 0; k < 14; k++) R(g, 300 + k * 30, 4, 12, 8, mix(stone, D.n4, 0.18));
        // low stone parapet between the columns, closing the view to the harbour
        R(g, 300, 220, 420, 20, mix(stone, D.n4, 0.18)); R(g, 300, 220, 420, 2, mix(stone, D.cream, 0.35)); R(g, 300, 236, 420, 4, mix(stone, D.n4, 0.4));
        for (let k = 0; k < 28; k++) R(g, 304 + k * 15, 224, 1, 12, mix(stone, D.n4, 0.35));
        dust(g, 21, 26, t, [330, 40, 260, 180], D.lamp, 0.35);
      });
      // --- sand tray
      const wd = woodCols(0.3), sand = mix(mix(D.paperD, D.paper, 0.45), D.amber[1], 0.12), sandD = mix(sand, D.amber[2], 0.4), sandL = mix(sand, D.cream, 0.35);
      const trp = [[TR.x0, TR.y0], [TR.x1, TR.y0], [TR.x1 + TR.sk, TR.y1], [TR.x0 - TR.sk, TR.y1]];
      shadow(g, 0.3, () => poly(g, [[TR.x0 - TR.sk + 2, TR.y1 + 1], [TR.x1 + TR.sk + 2, TR.y1 + 1], [TR.x1 + TR.sk - 30, TR.y1 + 12], [TR.x0 - TR.sk - 50, TR.y1 + 12]], BLK));
      poly(g, [[TR.x0 - TR.sk, TR.y1], [TR.x1 + TR.sk, TR.y1], [TR.x1 + TR.sk, TR.y1 + 6], [TR.x0 - TR.sk, TR.y1 + 6]], wd[2]); R(g, TR.x0 - TR.sk, TR.y1, TR.x1 - TR.x0 + 2 * TR.sk, 1, wd[0]);
      poly(g, trp, wd[1]); poly(g, [[TR.x0 + 3, TR.y0 + 2], [TR.x1 - 3, TR.y0 + 2], [TR.x1 + TR.sk - 4, TR.y1 - 2], [TR.x0 - TR.sk + 4, TR.y1 - 2]], sand);
      for (let k = 0; k < 70; k++) R(g, TR.x0 + (k * 37) % (TR.x1 - TR.x0), TR.y0 + 4 + (k * 13) % (TR.y1 - TR.y0 - 7), 1, 1, k % 2 ? sandD : sandL);
      const groove = (x1, y1, x2, y2) => { PX.line(g, x1, y1 + 2, x2, y2 + 2, sandL); PX.line(g, x1, y1, x2, y2, mix(sandD, D.n3, 0.55)); PX.line(g, x1, y1 + 1, x2, y2 + 1, mix(sandD, D.n2, 0.45)); };
      const dot = (p) => { ell(g, p[0], p[1] + 1, 2.4, 1.6, mix(D.n2, sandD, 0.2)); R(g, p[0] - 2, p[1] + 3, 5, 1, sandL); };
      if (lp > 0) groove(DA[0], DA[1], lerp(DA[0], DB[0], lp), lerp(DA[1], DB[1], lp));
      if (cp > 0) { let last = null; for (let k = 0; k <= Math.round(cp * 64); k++) { const a = Math.PI * 0.5 + (k / 64) * TAU, p = [DC[0] + Math.cos(a) * RX, DC[1] + Math.sin(a) * RY]; if (last) groove(last[0], last[1], p[0], p[1]); last = p; } }
      dot(DA); dot(DB); dot(DC);
      // --- teacher: kneels at the left end of the tray
      const xT = 204, yT = 322, uT = TEACH.h / 80;
      const drawing = lp > 0 && lp < 1, compass = t >= tC, circling = cp > 0 && cp < 1;
      let tip = lp <= 0 ? [DA[0] - 9, DA[1] + 3] : lp < 1 ? [lerp(DA[0], DB[0], lp), lerp(DA[1], DB[1], lp)] : [DB[0] + 3, DB[1] - 8];
      if (lp >= 1 && t > tL + 1.5 + 0.4) tip = [DB[0] - 20, DB[1] - 14];
      const cpos = P(t, tC, 0.5, "io"), ca = Math.PI * 0.5 + cp * TAU, legTip = [DC[0] + Math.cos(ca) * RX, DC[1] + Math.sin(ca) * RY];
      const apex = [lerp(DC[0] - 30, DC[0] - 10, cpos), lerp(DC[1] - 46, DC[1] - 30, cpos)];
      const lean = compass ? 0.55 + cpos * 0.2 : 0.42 + (lp > 0 && lp < 1 ? lp * 0.12 : lp >= 1 ? 0.1 : 0);
      const rodHand = (p) => [p[0] - 54, p[1] - 36];
      const hT = compass ? apex : rodHand(tip);
      const done = cp >= 1 && t > tC + 0.5 + 1.7 + 0.2;
      const rT = rig(g, xT, yT, TEACH, { hip: [compass ? 4 * uT : 2 * uT, 17 * uT], lean, fN: [10 * uT, -1], fF: [-11 * uT, 0], hN: loc(xT, yT, 1, hT[0], hT[1]), hF: compass ? [16 * uT, -14 * uT] : [12 * uT, -12 * uT], ebN: -1,
        eyes: done ? "open" : "down", mouth: (t < tL - 0.1) || (t > tL + 1.6 && t < tC - 0.2) || done ? "talk" : "flat", nod: done ? -1 : 1, brow: done ? 1 : 0 }, 1, t, 1);
      if (!compass) {   // long rod
        const hx1 = rT.hN[0], hy1 = rT.hN[1], ux = tip[0] - hx1, uy = tip[1] - hy1;
        PX.line(g, hx1 - ux * 0.12, hy1 - uy * 0.12, tip[0], tip[1], wd[1]); PX.line(g, hx1 - ux * 0.12 + 1, hy1 - uy * 0.12, tip[0] + 1, tip[1], wd[2]);
        ell(g, hx1, hy1, 2.2 * uT, 2.2 * uT, TEACH.skin);
        if (drawing) for (let k = 0; k < 3; k++) A(g, 0.6, () => R(g, tip[0] - 2 - k * 3, tip[1] + 1 - (k % 2), 1, 1, sandD));
      } else {   // wooden compass: pivot leg on C, drawing leg sweeps the circle
        const pivot = [DC[0], DC[1]], draw = cp > 0 ? legTip : [DC[0] + RX * 0.3, DC[1] + RY], ap = [rT.hN[0], rT.hN[1] - 3];
        const pv = cpos < 1 ? [lerp(ap[0] - 4, pivot[0], cpos), lerp(ap[1] + 26, pivot[1], cpos)] : pivot, dr = cpos < 1 ? [lerp(ap[0] + 6, draw[0], cpos), lerp(ap[1] + 26, draw[1], cpos)] : draw;
        seg(g, ap[0], ap[1], pv[0], pv[1], 2, wd[2]); seg(g, ap[0], ap[1], dr[0], dr[1], 2, wd[1]); R(g, dr[0], dr[1] - 1, 1, 2, D.n2);
        PX.circle(g, ap[0], ap[1], 2, mix(D.amber[1], D.n3, 0.3)); ell(g, rT.hN[0], rT.hN[1], 2.2 * uT, 2.2 * uT, TEACH.skin);
        if (circling) for (let k = 0; k < 2; k++) A(g, 0.6, () => R(g, legTip[0] + k * 2, legTip[1] + 1, 1, 1, sandD));
      }
      // --- students (right), facing left
      const lookDown = lp > 0 || compass;
      const nodA = cp >= 1 ? Math.max(0, Math.sin((t - (tC + 2.2)) * 6)) * 2 * (t - (tC + 2.2) < 1.6 ? 1 : 0) : 0;
      const leanIn = drawing || circling ? 0.12 : 0;
      // bench for the seated student
      R(g, 486, 290, 64, 6, mix(stone, D.n4, 0.2)); R(g, 486, 290, 64, 1, mix(stone, D.cream, 0.3)); R(g, 490, 296, 6, 22, mix(stone, D.n4, 0.35)); R(g, 540, 296, 6, 22, mix(stone, D.n4, 0.35));
      rig(g, 520, 316, ST3, { hip: [2, -4], lean: 0.1 + leanIn, fN: [10, 0], fF: [6, 0], hN: [14, -32], hF: [10, -30], eyes: lookDown ? "down" : "open", mouth: cp >= 1 ? "smile" : "flat", nod: 1 }, -1, t, 1);
      rig(g, 470, 318, ST2, { lean: leanIn + 0.05, hN: [6, -42], hF: [-2, -34], eyes: lookDown && !done ? "down" : "open", mouth: done ? "smile" : "flat", nod: nodA }, -1, t, 1);
      const scr = mix(D.paper, D.cream, 0.3);
      const r1 = rig(g, 446, 330, ST1, { lean: leanIn * 1.4, hN: [9, -44], hF: [6, -40], eyes: lookDown && !done ? "down" : "open", mouth: lp > 0.95 && lp < 1 ? "oh" : done ? "talk" : "flat", brow: lp > 0.5 ? 1 : 0 }, -1, t, 1);
      R(g, r1.hN[0] - 6, r1.hN[1] - 2, 9, 4, scr); scrollEnd(g, r1.hN[0] - 6, r1.hN[1], 2, scr);
      PX.vignette(g, 0.36);
    };
  };

  // ======================= altar_ropes =======================
  // ancient India, a Vedic fire altar laid out at dawn: priests stretch measuring ropes between bamboo pegs into a perfect
  // square (o.ropes 0.5, one side after another), bricks are laid in a pattern (o.bricks 3.0) and a small flame is lit in
  // the middle (o.fire 6.0) with the elder's long taper.
  K.altar_ropes = (o) => {
    const P1 = { h: 96, skin: SKIN.brown, hair: HAIR.black, hairStyle: "knot", dress: "dhoti", cloth: mix(D.cream, D.paper, 0.15), thread: 1, seed: 1.7 };
    const P2 = { h: 80, skin: SKIN.deep, hair: HAIR.black, hairStyle: "knot", dress: "dhoti", cloth: mix(D.cream, D.paperD, 0.2), thread: 1, seed: 3.1 };
    const P3 = { h: 98, skin: mix(SKIN.brown, SKIN.olive, 0.3), hair: HAIR.white, hairStyle: "knot", beard: "full", beardCol: HAIR.white, dress: "dhoti", cloth: mix(D.cream, D.paper, 0.1), thread: 1, shawl: mix(mix(D.amber[1], D.rust[1], 0.45), D.paperD, 0.25), age: 0.9, seed: 5.6 };
    const SQ = [[268, 214], [392, 214], [420, 270], [240, 270]];   // far-left, far-right, near-right, near-left
    const bil = (u, v) => { const a = [lerp(SQ[0][0], SQ[1][0], u), lerp(SQ[0][1], SQ[1][1], u)], b = [lerp(SQ[3][0], SQ[2][0], u), lerp(SQ[3][1], SQ[2][1], u)]; return [lerp(a[0], b[0], v), lerp(a[1], b[1], v)]; };
    const N = 6, ORDER = [];
    for (let v = N - 1; v >= 0; v--) for (let u = 0; u < N; u++) { if (u >= 2 && u <= 3 && v >= 2 && v <= 3) continue; ORDER.push([u, v]); }   // near rows first, hearth left open
    const TREES = [...Array(14)].map((_, k) => [k * 52 - 30 + (k % 3) * 9, 150, 16 + (k * 7) % 14]);
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8), tR = T("ropes", 0.5), tB = T("bricks", 3.0), tFi = T("fire", 6.0);
      const side = (k) => P(t, tR + k * 0.5, 0.55, "io");
      const nb = ORDER.length, brickT = (i) => tB + (i / nb) * 2.4;
      const fireP = P(t, tFi + 0.35, 0.9, "out");
      CAST = [0.55, 0.42];
      const sky0 = mix(D.steel[2], D.n3, 0.2), sky1 = mix(D.steel[1], D.rose[0], 0.3), sky2 = mix(D.lamp, D.rose[0], 0.25);
      PX.par(g, c, 0.12, () => {
        PX.vgrad(g, -40, -40, 720, 120, sky0, sky1, 8); PX.vgrad(g, -40, 80, 720, 76, sky1, sky2, 6);
        PX.glow(g, 140, 150, 150, D.lamp, 0.45); PX.circle(g, 140, 152, 13, mix(D.cream, D.lamp, 0.35)); R(g, 120, 152, 40, 14, sky2);
        for (let k = 0; k < 4; k++) { const cx = ((k * 180 + t * 2) % 860) - 110, cy = 46 + (k % 2) * 30; A(g, 0.5, () => { ell(g, cx, cy, 46, 3, mix(D.rose[0], D.lamp, 0.4)); ell(g, cx + 8, cy + 2, 40, 2, mix(D.rose[1], D.steel[1], 0.5)); }); }
        for (let k = 0; k < 4; k++) { const ph = frac(t / 10 + 0.6), bx = lerp(-60, 700, ph) - k * 8, by = 60 + Math.abs(k - 1.5) * 4; bird(g, bx, by, t + k * 0.3, mix(D.n3, D.plum[2], 0.3), 1); }
      });
      PX.par(g, c, 0.3, () => {
        // tree line in the morning mist
        grove(g, 152, 26, 8, mix(mix(D.moss[2], D.n2, 0.5), sky2, 0.5), 0, 720, 24); void TREES;
        grove(g, 156, 18, 9, mix(mix(D.moss[2], D.n2, 0.55), sky2, 0.3), 30, 720, 30);
        palm(g, 560, 156, 46, t, 21, { trunk: mix(D.n3, sky2, 0.3), leaf: mix(mix(D.moss[2], D.n2, 0.4), sky2, 0.3) });
        A(g, 0.5, () => R(g, -40, 140, 720, 18, mix(sky2, D.cream, 0.3)));
        // thatched hut
        const hc = mix(mix(D.amber[2], D.paperD, 0.4), sky2, 0.25); R(g, 470, 140, 30, 16, hc); poly(g, [[464, 142], [485, 124], [506, 142]], mix(mix(D.amber[2], D.paperD, 0.5), sky2, 0.3)); for (let k = 0; k < 5; k++) PX.line(g, 470 + k * 3, 140, 485, 126, mix(D.amber[2], sky2, 0.2)); R(g, 482, 146, 6, 10, mix(D.n2, sky2, 0.3));
      });
      PX.par(g, c, 0.7, () => {
        const earth = mix(mix(D.amber[2], D.paperD, 0.45), D.rust[2], 0.12);
        PX.vgrad(g, -40, 154, 720, 220, mix(earth, sky2, 0.3), mix(earth, D.n2, 0.35), 10);
        A(g, 0.08, () => poly(g, [[120, 154], [200, 154], [720, 372], [380, 372]], D.lamp));   // dawn light raking across the ground
        for (let k = 0; k < 9; k++) A(g, 0.18, () => ell(g, (k * 97) % 680, 178 + (k * 31) % 160, 30 + (k % 3) * 14, 3 + (k % 2) * 2, mix(D.moss[2], D.amber[2], 0.4)));
        for (let k = 0; k < 120; k++) R(g, (k * 53) % 720 - 40, 160 + ((k * 29) % 200), 1 + (k % 3), 1, k % 2 ? mix(earth, D.n2, 0.3) : mix(earth, D.lamp, 0.3));
        for (let k = 0; k < 24; k++) { const tx = (k * 73) % 700 - 20, ty = 176 + ((k * 41) % 170); if (tx > 200 && tx < 460 && ty > 200 && ty < 290) continue; const th = 3 + ((ty - 160) / 40); for (let j = -1; j <= 1; j++) PX.line(g, tx, ty, tx + j * 2 + Math.sin(t * 1.2 + k) * 0.6, ty - th, j ? D.moss[2] : mix(D.moss[1], D.amber[1], 0.3)); }
      });
      // --- altar ground: swept square, ropes, pegs, bricks
      const swept = mix(mix(D.amber[2], D.paperD, 0.5), D.lamp, 0.12);
      poly(g, [[SQ[0][0] - 6, SQ[0][1] - 3], [SQ[1][0] + 6, SQ[1][1] - 3], [SQ[2][0] + 9, SQ[2][1] + 4], [SQ[3][0] - 9, SQ[3][1] + 4]], swept);
      const wd = woodCols(), bam = mix(D.moss[0], D.amber[1], 0.45), bamD = mix(bam, D.n0, 0.35), twine = mix(D.cream, D.paperD, 0.35);
      const pegH = (k) => (k < 2 ? 12 : 16);
      const pegTop = (k) => [SQ[k][0], SQ[k][1] - pegH(k) + 3];
      // bricks
      const brick = mix(D.rust[1], D.paperD, 0.35), brickB = mix(D.rust[1], D.amber[2], 0.35);
      ORDER.forEach(([u, v], i) => {
        const bt = brickT(i), bp = P(t, bt, 0.25, "out"); if (bp <= 0) return;
        const a = bil(u / N + 0.01, v / N + 0.01), b = bil((u + 1) / N - 0.01, v / N + 0.01), cc = bil((u + 1) / N - 0.01, (v + 1) / N - 0.01), dd = bil(u / N + 0.01, (v + 1) / N - 0.01), dy = (1 - bp) * -8;
        const col = (u + v) % 2 ? brick : brickB;
        A(g, bp, () => { poly(g, [[a[0], a[1] + dy], [b[0], b[1] + dy], [cc[0], cc[1] + dy], [dd[0], dd[1] + dy]], col); poly(g, [[dd[0], dd[1] + dy], [cc[0], cc[1] + dy], [cc[0], cc[1] + dy + 3], [dd[0], dd[1] + dy + 3]], mix(col, D.n0, 0.4)); PX.line(g, a[0] + 1, a[1] + dy, b[0] - 1, b[1] + dy, mix(col, D.cream, 0.3)); });
        if ((u + v) % 2 === 0) A(g, bp * 0.6, () => { const m = bil((u + 0.5) / N, (v + 0.5) / N); R(g, m[0] - 2, m[1] + dy, 4, 1, mix(col, D.n0, 0.25)); });
      });
      // hearth: kindling in the open centre
      const hc0 = bil(0.5, 0.5);
      { const a = bil(2 / N, 2 / N), b = bil(4 / N, 2 / N), cc = bil(4 / N, 4 / N), dd = bil(2 / N, 4 / N), lf = ORDER.filter((_, i) => t >= brickT(i)).length / ORDER.length; A(g, 0.25 + 0.75 * lf, () => poly(g, [a, b, cc, dd], mix(D.n2, D.rust[2], 0.3))); for (let k = 0; k < 5; k++) seg(g, hc0[0] - 9 + k * 4, hc0[1] + 3 - (k % 2) * 2, hc0[0] - 4 + k * 3, hc0[1] - 3, 1.6, k % 2 ? wd[1] : wd[0]); }
      if (fireP > 0) { flame(g, hc0[0], hc0[1] + 1, 0.6 + fireP * 1.1, t, 2); smoke(g, hc0[0], hc0[1] - 14, t, 0.22 * fireP, 70); A(g, fireP * 0.5, () => { for (let k = 0; k < 3; k++) { const m = bil(0.5 + (k - 1) * 0.18, 0.62); R(g, m[0] - 6, m[1], 12, 1, D.lamp); } }); }
      // ropes: each side lies slack in loose curves until its time, then pulls straight between peg tops
      for (let k = 0; k < 4; k++) {
        const a = k, b = (k + 1) % 4, sp = side(k), A0 = SQ[a], B0 = SQ[b], pa = pegTop(a), pb = pegTop(b);
        const pts = curve((qq) => { const g0 = [lerp(A0[0], B0[0], qq), lerp(A0[1], B0[1], qq) + 1], wob = Math.sin(qq * Math.PI) * (5 + 3 * Math.sin(qq * 9 + k)), sl = [g0[0] + (b === 2 || a === 3 ? 0 : 0) + Math.sin(qq * 7 + k) * 3, g0[1] + wob * (k % 2 ? 0.6 : 1)], tt = [lerp(pa[0], pb[0], qq), lerp(pa[1], pb[1], qq)]; return [lerp(sl[0], tt[0], sp), lerp(sl[1], tt[1], sp)]; }, 30);
        rope(g, pts, 0, twine);
        if (sp > 0 && sp < 1) A(g, 1 - sp, () => R(g, (pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2 - 2, 1, 1, D.cream));
      }
      for (let k = 0; k < 4; k++) { const [px, py] = SQ[k], h = pegH(k); shadow(g, 0.3, () => ell(g, px + 3, py + 1, 4, 1, BLK)); R(g, px - 1, py - h, 3, h, bam); R(g, px + 1, py - h, 1, h, bamD); for (let n = 4; n < h; n += 5) R(g, px - 1, py - h + n, 3, 1, bamD); R(g, px - 2, py - h + 2, 5, 2, twine); }
      // brick stack beside the far-right priest (shrinks as bricks are laid)
      const laid = ORDER.filter((_, i) => t >= brickT(i)).length, left = Math.ceil((1 - laid / nb) * 12);
      for (let k = 0; k < left; k++) { const bx = 470 + (k % 3) * 9, by = 226 - Math.floor(k / 3) * 3;
 R(g, bx, by, 8, 3, k % 2 ? brick : brickB); R(g, bx, by + 2, 8, 1, mix(brick, D.n0, 0.4)); R(g, bx, by, 8, 1, mix(brick, D.cream, 0.25)); }
      // ritual things on the ground: a brass pot, a ghee bowl with a wooden ladle, a bundle of kusha grass
      { const br = D.amber[1], brD = D.amber[2], brL = D.amber[0]; shadow(g, 0.3, () => ell(g, 512, 316, 12, 2, BLK)); ell(g, 504, 306, 8, 8, br); ell(g, 501, 303, 3, 4, brL); ell(g, 507, 309, 4, 5, brD); R(g, 499, 296, 10, 3, brD); R(g, 498, 295, 12, 1, brL);
        ell(g, 528, 312, 9, 3, mix(D.rust[2], D.paperD, 0.3)); ell(g, 528, 311, 7, 2, D.lamp); seg(g, 520, 312, 548, 300, 2, wd[1]); ell(g, 549, 300, 3, 2, wd[2]);
        for (let k = 0; k < 9; k++) PX.line(g, 150 + k, 318 + (k % 2), 186 + k * 0.5, 312 + (k % 3), k % 2 ? D.moss[1] : mix(D.moss[1], D.amber[1], 0.4)); R(g, 166, 313, 3, 6, mix(D.amber[2], D.n2, 0.2)); }
      // --- priests
      const curBrick = ORDER[clamp(Math.floor(((t - tB) / 2.4) * nb), 0, nb - 1)], laying = t >= tB && t < tB + 2.4;
      // P2: far-right corner behind the altar, faces left; pulls the far rope then passes bricks
      const x2 = 436, y2 = 222, u2 = P2.h / 80, pull2 = bump(t, tR, 0.3, tR + 2.2, 0.4);
      const reach2 = laying ? 0.5 + 0.5 * Math.sin((t - tB) * 6) : 0;
      rig(g, x2, y2, P2, { lean: -0.25 * pull2 + reach2 * 0.5, hip: [-3 * pull2, reach2 * 8], fN: [lerp(1.5, 7, pull2) * u2, 0], fF: [lerp(-1.5, -8, pull2) * u2, 0],
        hN: pull2 > 0.1 ? loc(x2, y2, -1, SQ[1][0] + 16, SQ[1][1] - 18) : laying ? [lerp(8, 16, reach2) * u2, lerp(-30, -12, reach2) * u2] : [5 * u2, -26 * u2], hF: pull2 > 0.1 ? loc(x2, y2, -1, SQ[1][0] + 20, SQ[1][1] - 16) : [2 * u2, -22 * u2], eyes: laying ? "down" : "open", mouth: "flat", brow: pull2 > 0.5 ? -0.6 : 0 }, -1, t, -1);
      if (pull2 > 0.1) rope(g, [[SQ[1][0], SQ[1][1] - 9], [SQ[1][0] + 16, SQ[1][1] - 18]], 0, twine);
      // P1: near-left corner, kneels, ties ropes then lays bricks
      const x1 = 214, y1 = 292, u1 = P1.h / 80;
      const tie = bump(t, tR, 0.2, tR + 2.3, 0.3), tieW = Math.sin(t * 8) * 2 * tie;
      let hb = null; if (laying && curBrick) { const m = bil((curBrick[0] + 0.5) / N, (curBrick[1] + 0.5) / N); hb = [Math.min(m[0], 262), Math.max(m[1], 252)]; }
      const hN1 = hb ? loc(x1, y1, 1, hb[0], hb[1] - 2) : tie > 0 ? loc(x1, y1, 1, SQ[3][0] - 2 + tieW, SQ[3][1] - 10) : [14 * u1, -16 * u1];
      rig(g, x1, y1, P1, { hip: [2 * u1, 17 * u1], lean: hb ? 0.6 : 0.4, fN: [10 * u1, -1], fF: [-11 * u1, 0], hN: hN1, hF: tie > 0 ? loc(x1, y1, 1, SQ[3][0] - 4 - tieW, SQ[3][1] - 6) : [12 * u1, -10 * u1], ebN: -1, eyes: tie > 0 || hb ? "down" : "open", mouth: t > tFi + 1 ? "smile" : "flat" }, 1, t, -1);
      // P3: the elder kneels at the near-right corner with a long burning taper; at o.fire he leans in to the hearth
      const x3 = 452, y3 = 298, u3 = P3.h / 80, reach3 = bump(t, tFi - 0.4, 0.7, tFi + 0.9, 0.7);
      const tipRest = [x3 - 26, y3 - 92], tipFire = [hc0[0] + 4, hc0[1] - 2], tip3 = [lerp(tipRest[0], tipFire[0], reach3), lerp(tipRest[1], tipFire[1], reach3)];
      const hand3 = [lerp(x3 - 16, x3 - 34, reach3), lerp(y3 - 38, y3 - 44, reach3)];
      const r3 = rig(g, x3, y3, P3, { hip: [-2 * u3 + reach3 * 4 * u3, 17 * u3], lean: 0.2 + reach3 * 0.45, fN: [10 * u3, -1], fF: [-11 * u3, 0], hN: loc(x3, y3, -1, hand3[0], hand3[1]), hF: [8 * u3, -18 * u3], ebN: -1, eyes: reach3 > 0.3 ? "down" : "open", mouth: t > tFi + 1.4 ? "smile" : t < tFi - 0.6 ? "talk" : "flat" }, -1, t, -1);
      PX.line(g, r3.hN[0] + 2, r3.hN[1] + 4, tip3[0], tip3[1], wd[2]); PX.line(g, r3.hN[0], r3.hN[1], tip3[0], tip3[1], wd[1]);
      ell(g, r3.hN[0], r3.hN[1], 2.3 * u3, 2.2 * u3, P3.skin);
      flame(g, tip3[0], tip3[1] + 1, 0.32, t, 7);
      PX.vignette(g, 0.4);
    };
  };

  // ======================= syene_well =======================
  // split frame at noon. Left, Syene: a cutaway deep stone well; as the sun climbs overhead (o.sun 0.5) the sunlit patch
  // slides down the shaft until light reaches the water at the bottom and no shadow is left. Right, Alexandria: an upright
  // stick casts a short shadow; the scholar stretches a cord from its top to the shadow tip to measure the angle (o.measure 3.5).
  K.syene_well = (o) => {
    const ERA = { h: 98, skin: SKIN.olive, hair: HAIR.white, hairStyle: "bald", beard: "full", beardCol: HAIR.white, dress: "robe", cloth: mix(D.cream, D.paper, 0.15), drape: mix(mix(D.teal[2], D.paperD, 0.45), D.n3, 0.1), age: 1, seed: 3 };
    const WL = 136, WR = 182, WT = 128, WB = 316;   // shaft walls, ground level, water level
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 7), tS = T("sun", 0.5), tMe = T("measure", 3.5);
      const sp = P(t, tS, 2.0, "io"), mp = P(t, tMe, 1.0, "io"), arc = P(t, tMe + 1.0, 0.6, "io");
      const sky0 = mix(D.steel[0], D.cream, 0.15), sky1 = mix(D.cream, D.lamp, 0.25);
      CAST = [0.28, 0.04];   // near-noon: short shadows
      // ---------------- left: Syene ----------------
      clipR(g, 0, 0, 318, 360, () => {
        PX.par(g, c, 0.2, () => { PX.vgrad(g, -40, -40, 400, 172, sky0, sky1, 7); });
        const th = lerp(0.62, 0, sp), sx = 159 - Math.sin(th) * 110, sy = 44 + (1 - Math.cos(th)) * 60;
        PX.glow(g, sx, sy, 70, D.lamp, 0.45); PX.circle(g, sx, sy, 8, D.cream);
        // town of Syene on the ground line
        const wall = mix(D.paperD, D.amber[2], 0.3);
        for (const [hx0, hw, hh] of [[-6, 34, 22], [28, 24, 30], [214, 30, 26], [246, 40, 18], [288, 34, 24]]) house(g, hx0, WT, hw, hh, wall, -1);
        palm(g, 72, WT, 52, t, 31, { trunk: mix(D.n3, D.amber[2], 0.4), leaf: mix(D.moss[2], D.moss[1], 0.4) });
        const ps = Math.tan(th) * 44; shadow(g, 0.3, () => poly(g, [[70, WT], [74, WT], [74 + ps, WT + 2], [70 + ps, WT + 2]], BLK));
        palm(g, 236, WT, 40, t, 32, { trunk: mix(D.n3, D.amber[2], 0.4), leaf: mix(D.moss[2], D.moss[1], 0.4) });
        for (let k = 0; k < 2; k++) { const bx = ((k * 120 + t * 16) % 380) - 30, by = 66 + k * 12; bird(g, bx, by, t + k, mix(D.n4, D.steel[2], 0.3), 1); }
        // cutaway earth: sandstone strata
        const st = [mix(mix(D.paperD, D.amber[2], 0.4), D.n4, 0.2), mix(mix(D.paperD, D.rust[2], 0.22), D.n4, 0.22), mix(mix(D.amber[2], D.paperD, 0.4), D.n4, 0.3), mix(mix(D.paperD, D.amber[1], 0.25), D.n4, 0.2), mix(mix(D.rust[2], D.paperD, 0.45), D.n3, 0.3)];
        R(g, -40, WT, 400, 240, st[0]);
        let yy = WT + 14; for (let k = 1; yy < 362; k++) { const hh = 22 + (k * 13) % 20, col = st[k % st.length]; poly(g, curve((qq) => [lerp(-40, 360, qq), yy + Math.sin(qq * 9 + k) * 2.5 + Math.sin(qq * 23 + k * 2) * 1], 40).concat([[360, 362], [-40, 362]]), col); for (let j = 0; j < 26; j++) { const px = (j * 47 + k * 19) % 360 - 20, py = yy + 4 + (j * 7) % Math.max(4, hh - 6); R(g, px, py, 2 + (j % 3), 1, mix(col, D.n0, 0.16)); if (j % 5 === 0) { ell(g, px + 6, py, 2, 1.4, mix(col, D.paperD, 0.35)); R(g, px + 5, py - 1, 2, 1, mix(col, D.cream, 0.25)); } } yy += hh; }
        R(g, -40, WT - 1, 400, 3, mix(D.paperD, D.lamp, 0.3));
        A(g, 0.25, () => R(g, -40, WT + 2, 400, 6, BLK));
        // the shaft: stone lining, dark until the sun climbs
        const lin = mix(mix(D.paperD, D.n4, 0.35), D.amber[2], 0.15), linD = mix(lin, D.n0, 0.62);
        R(g, WL - 6, WT, 6, WB - WT + 14, mix(lin, D.n2, 0.2)); R(g, WR, WT, 6, WB - WT + 14, mix(lin, D.n2, 0.2));
        for (let k = 0; k < 24; k++) { R(g, WL - 6, WT + k * 8 + 7, 6, 1, mix(lin, D.n0, 0.4)); R(g, WR, WT + k * 8 + 7, 6, 1, mix(lin, D.n0, 0.4)); }
        R(g, WL, WT, WR - WL, WB - WT, linD);
        for (let k = 0; k < 24; k++) for (let j = 0; j < 4; j++) R(g, WL + j * 12 + (k % 2) * 6, WT + k * 8, 1, 8, mix(linD, D.n0, 0.3));
        for (let k = 0; k < 24; k++) R(g, WL, WT + k * 8, WR - WL, 1, mix(linD, D.n0, 0.3));
        // sunlit part of the shaft (light from the upper left falls on the right wall, then on the water)
        const tn = Math.tan(th), yHit = tn < 1e-3 ? 1e9 : WT + (WR - WL) / tn;
        const litPoly = yHit < WB ? [[WL, WT], [WR, WT], [WR, yHit]] : [[WL, WT], [WR, WT], [WR, WB], [WL + (WB - WT) * tn, WB]];
        A(g, 0.82, () => poly(g, litPoly, mix(lin, D.lamp, 0.35)));
        clipR(g, WL, WT, WR - WL, WB - WT, () => { for (let k = 0; k < 24; k++) A(g, 0.4, () => R(g, WL, WT + k * 8, WR - WL, 1, mix(lin, D.n0, 0.2))); });
        // water at the bottom
        const lit = clamp(1 - ((WL + (WB - WT) * tn) - WL) / (WR - WL), 0, 1);
        R(g, WL, WB, WR - WL, 14, mix(D.teal[2], D.n1, 0.5));
        A(g, lit, () => { R(g, WL, WB, WR - WL, 14, mix(D.teal[1], D.lamp, 0.25)); R(g, WL, WB, WR - WL, 1, D.cream); });
        if (lit > 0.6) { const k = (lit - 0.6) / 0.4, rr = 5 + Math.sin(t * 3) * 0.6; PX.glow(g, 159, WB + 4, 30, D.lamp, 0.22 * k); A(g, k, () => { ell(g, 159, WB + 4, rr + 2, 2, mix(D.cream, D.lamp, 0.3)); ell(g, 159, WB + 4, rr, 1, D.cream); }); const rp = frac(t * 0.6); A(g, k * (1 - rp) * 0.6, () => ell(g, 159, WB + 4, 6 + rp * 14, 1 + rp * 2, D.cream)); }
        // sun rays: parallel lines from the sun's direction into the well
        A(g, 0.12 + 0.1 * sp, () => { for (let k = -1; k <= 1; k++) { const x0 = 159 + k * 16; PX.line(g, x0 - Math.sin(th) * 140, WT - Math.cos(th) * 140, x0 + (k === 1 && yHit < WB ? 0 : 0), WT, D.cream); } });
        // the well head: stone parapet with a wooden frame
        R(g, WL - 12, WT - 12, WR - WL + 24, 12, lin); R(g, WL - 12, WT - 12, WR - WL + 24, 2, mix(lin, D.cream, 0.35)); for (let k = 0; k < 6; k++) R(g, WL - 12 + k * 12, WT - 10, 1, 10, mix(lin, D.n0, 0.3));
        A(g, 0.6, () => R(g, WL - 4, WT - 12, WR - WL + 8, 3, mix(D.n1, D.rust[2], 0.3)));
        const wdC = woodCols(); R(g, WL - 10, WT - 40, 3, 28, wdC[1]); R(g, WR + 7, WT - 40, 3, 28, wdC[1]); R(g, WL - 12, WT - 42, WR - WL + 24, 3, wdC[0]);
        PX.line(g, WR + 8, WT - 40, WR + 14, WT - 12, mix(D.paperD, D.amber[2], 0.35)); R(g, WR + 11, WT - 18, 6, 6, mix(D.rust[1], D.paperD, 0.3));
        shadow(g, 0.3, () => poly(g, [[WL - 12, WT], [WR + 12, WT], [WR + 12 + tn * 14, WT + 2], [WL - 12 + tn * 14, WT + 2]], BLK));
        PX.otext(g, "SYENE", 58, 32, { col: D.cream, outline: D.n1 });
        PX.vignette(g, 0.3);
      });
      // ---------------- right: Alexandria ----------------
      clipR(g, 322, 0, 318, 360, () => {
        PX.par(g, c, 0.2, () => { PX.vgrad(g, 280, -40, 400, 260, sky0, sky1, 7); });
        const th0 = 0.28, th = lerp(0.66, th0, sp), sxs = 470 - Math.sin(th) * 200, sys = 40 + (1 - Math.cos(th)) * 90;
        PX.glow(g, sxs, sys, 70, D.lamp, 0.45); PX.circle(g, sxs, sys, 8, D.cream);
        // library facade with columns and pediment
        const stone = mix(D.paper, D.paperD, 0.3), sD = mix(stone, D.steel[2], 0.3);
        PX.par(g, c, 0.4, () => {
          poly(g, [[352, 100], [496, 70], [640, 100]], stone); poly(g, [[366, 98], [496, 76], [626, 98]], mix(sD, D.lamp, 0.15)); R(g, 348, 100, 296, 8, stone); R(g, 348, 106, 296, 2, sD); R(g, 348, 100, 296, 1, mix(stone, D.cream, 0.4));
          R(g, 352, 108, 290, 100, mix(mix(D.rust[2], D.paperD, 0.35), D.n3, 0.4)); R(g, 352, 108, 290, 6, mix(D.n2, D.rust[2], 0.3));
          R(g, 482, 140, 28, 68, mix(D.n1, D.rust[2], 0.25)); R(g, 486, 144, 20, 64, mix(D.amber[2], D.n2, 0.5));
          for (let k = 0; k < 6; k++) column(g, 368 + k * 52, 118, 208, 7, stone, -1);
          R(g, 340, 206, 310, 6, stone); R(g, 340, 206, 310, 1, mix(stone, D.cream, 0.3));
          palm(g, 340, 214, 58, t, 41, { trunk: mix(D.n3, D.amber[2], 0.4), leaf: mix(D.moss[2], D.moss[1], 0.4) });
        });
        // courtyard paving
        const pav = mix(stone, D.amber[1], 0.12);
        PX.vgrad(g, 322, 212, 320, 150, mix(pav, D.lamp, 0.2), mix(pav, D.n4, 0.3), 6);
        for (let k = 0; k < 7; k++) R(g, 322, 212 + Math.pow(k / 6, 1.5) * 148, 320, 1, mix(pav, D.n4, 0.5));
        for (let k = -4; k < 12; k++) PX.line(g, 480 + (k * 40 - 160) * 0.5, 212, 480 + (k * 40 - 160) * 1.4, 362, mix(pav, D.n4, 0.45));
        // the gnomon and its short noon shadow
        const gx = 506, gy = 300, gh = 96, sl = Math.tan(th) * gh, tip = [gx + sl, gy];
        shadow(g, 0.5, () => poly(g, [[gx - 1, gy - 2], [gx + 3, gy - 2], [tip[0] + 1, gy + 1], [tip[0] - 1, gy + 2], [gx - 1, gy + 2]], BLK));
        A(g, 0.15 + 0.1 * sp, () => { for (let k = -1; k <= 1; k++) { const ox = k * 10; PX.line(g, gx + ox - Math.sin(th) * 160, gy - gh - Math.cos(th) * 160 + Math.abs(k) * 0, gx + ox + (k === 0 ? sl : sl), gy - (k === 0 ? 0 : gh * 0.5 * (1 - Math.abs(k) * 0)), D.cream); } });
        const wdC = woodCols(0.25); shadow(g, 0.3, () => ell(g, gx + 1, gy + 1, 6, 1.5, BLK)); R(g, gx - 1, gy - gh, 4, gh, wdC[1]); R(g, gx - 1, gy - gh, 1, gh, wdC[0]); R(g, gx + 2, gy - gh, 1, gh, wdC[2]); R(g, gx - 4, gy - 3, 10, 4, mix(stone, D.n4, 0.3)); R(g, gx - 4, gy - 3, 10, 1, mix(stone, D.cream, 0.3)); R(g, gx - 2, gy - gh - 2, 6, 2, wdC[0]);
        // scholar: kneels to the right of the shadow, faces left, cord from the stick top to the shadow tip
        const xE = 558, yE = 314, uE = ERA.h / 80, kn = mp;
        const top = [gx + 1, gy - gh + 2];
        const handCord = [lerp(xE - 20, tip[0] + 2, mp), lerp(yE - 50, gy - 1, mp)];
        const rE = rig(g, xE, yE, ERA, { hip: [0, lerp(0, 17, kn) * uE], lean: lerp(0.05, 0.5, kn), fN: kn > 0.5 ? [10 * uE, -1] : [lerp(1.5, 10, kn) * uE, 0], fF: kn > 0.5 ? [-11 * uE, 0] : [lerp(-1.5, -11, kn) * uE, 0],
          hN: loc(xE, yE, -1, handCord[0], handCord[1]), hF: [lerp(10, 6, kn) * uE, lerp(-40, -26, kn) * uE], ebN: -1, eyes: mp > 0.2 && arc < 1 ? "down" : sp < 1 && mp === 0 ? "up" : "open", mouth: arc >= 1 ? "smile" : "flat", brow: arc > 0.5 ? 1 : 0, nod: mp > 0 ? 1 : 0 }, -1, t, -1);
        const scr = mix(D.paper, D.cream, 0.3); R(g, rE.hF[0] - 4, rE.hF[1] - 8, 4, 12, scr); scrollEnd(g, rE.hF[0] - 2, rE.hF[1] - 8, 2, scr); scrollEnd(g, rE.hF[0] - 2, rE.hF[1] + 4, 2, scr);
        // the cord: coiled in his hand until he measures, then taut from the stick top to the shadow tip
        const cord = mix(D.rust[1], D.paperD, 0.35);
        if (mp > 0) { const ct = [lerp(rE.hN[0], top[0], mp), lerp(rE.hN[1], top[1], mp)]; PX.line(g, rE.hN[0], rE.hN[1], ct[0], ct[1], cord); }
        else { for (let k = 0; k < 3; k++) ell(g, rE.hN[0], rE.hN[1] + 4 + k, 3, 2, cord); }
        if (arc > 0) {   // the measured angle between the stick and the sun's line, as a small filled wedge
          const r0 = 40, a0 = Math.PI / 2, a1 = Math.PI / 2 - th * arc, wp = [top]; for (let k = 0; k <= 16; k++) { const a = lerp(a0, a1, k / 16); wp.push([top[0] + Math.cos(a) * r0, top[1] + Math.sin(a) * r0]); }
          A(g, 0.16, () => poly(g, wp, D.amber[1])); for (let k = 1; k < wp.length; k++) R(g, wp[k][0] - 1, wp[k][1], 2, 2, D.amber[0]);

        }
        PX.otext(g, "ALEXANDRIA", 340, 32, { col: D.cream, outline: D.n1 });
        PX.vignette(g, 0.3);
      });
      R(g, 318, 0, 4, 360, D.n1); R(g, 319, 0, 1, 360, D.n3);
    };
  };

  // ======================= walkers =======================
  // a desert road along the Nile with palms. Two bematists pace in perfectly even, matching steps from o.walk (0.3),
  // counting on knotted cords; milestones pass on the near side; a caravan and boats on the river pass behind.
  K.walkers = (o) => {
    const WA = { h: 108, skin: SKIN.brown, hairStyle: "wrap", wrapCol: mix(LINEN, D.paperD, 0.2), dress: "tunic", cloth: mix(D.cream, D.paperD, 0.3), sash: mix(D.rust[1], D.n2, 0.3), seed: 2.2 };
    const WB = { h: 102, skin: SKIN.deep, hair: HAIR.black, hairStyle: "wrap", wrapCol: mix(D.steel[1], D.paper, 0.45), dress: "tunic", cloth: mix(D.paper, D.amber[1], 0.25), sash: mix(D.teal[2], D.n2, 0.2), seed: 4.9 };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 7), tW = T("walk", 0.3), tau = t - tW;
      const uA = WA.h / 80, S = 19 * uA, CYC = 1.15, V = S / (CYC / 2);
      const soft = tau <= 0 ? 0 : tau < 0.5 ? tau * tau : tau - 0.25, X = V * soft, amp = clamp(tau / 0.5, 0, 1);
      const ph = X / (2 * S);
      CAST = [-0.6, 0.14];
      const sky0 = mix(D.steel[0], D.cream, 0.25), sky1 = mix(D.cream, D.lamp, 0.35), river = mix(D.teal[1], D.steel[1], 0.45);
      const wrap = (x, span) => ((x % span) + span) % span;
      PX.par(g, c, 0.1, () => {
        PX.vgrad(g, -40, -40, 720, 190, sky0, sky1, 8);
        PX.glow(g, 520, 40, 120, D.lamp, 0.4); PX.circle(g, 520, 40, 8, D.cream);
        for (let k = 0; k < 4; k++) { const cx = wrap(k * 210 - t * 3 - X * 0.05, 860) - 110, cy = 28 + (k % 2) * 24; A(g, 0.45, () => { ell(g, cx, cy + 2, 40, 3, mix(D.paperD, D.steel[0], 0.4)); ell(g, cx + 6, cy, 34, 3, D.cream); }); }
        // cliffs of the desert beyond the river
        poly(g, curve((q) => { const x = lerp(-40, 680, q); return [x, 116 + Math.sin((x + X * 0.1) * 0.02) * 8 + Math.sin((x + X * 0.1) * 0.071) * 3]; }, 60).concat([[680, 150], [-40, 150]]), mix(mix(D.paperD, D.amber[1], 0.25), sky1, 0.35));
        poly(g, curve((q) => { const x = lerp(-40, 680, q); return [x, 134 + Math.sin((x + X * 0.18) * 0.03 + 1) * 4]; }, 60).concat([[680, 150], [-40, 150]]), mix(mix(D.paperD, D.amber[2], 0.3), sky1, 0.25));
      });
      // far bank + river + boats
      R(g, -40, 146, 720, 6, mix(mix(D.moss[2], D.steel[1], 0.3), sky1, 0.35));
      grove(g, 151, 30, 5, mix(mix(D.moss[2], D.steel[2], 0.3), sky1, 0.35), X * 0.25, 720, 14);
      PX.vgrad(g, -40, 152, 720, 40, mix(river, sky1, 0.3), mix(river, D.n2, 0.15), 4);
      for (let k = 0; k < 40; k++) A(g, 0.35 + 0.35 * Math.sin(t * 2.4 + k), () => R(g, wrap(k * 47 + t * 6 - X * 0.35, 760) - 60, 155 + (k * 7) % 34, 4 + (k % 4) * 3, 1, mix(D.cream, sky1, 0.3)));
      boat(g, wrap(120 - t * 14 - X * 0.35, 900) - 100, 170, 0.9, t, mix(D.cream, D.paper, 0.25), -1);
      boat(g, wrap(560 + t * 9 - X * 0.35, 900) - 100, 182, 1.1, t, mix(D.paper, D.rust[0], 0.3), 1);
      // near bank: grassy strip, palms (parallax) and a dune ridge where the caravan walks
      PX.vgrad(g, -40, 188, 720, 40, mix(D.moss[2], D.paperD, 0.35), mix(D.moss[2], D.amber[2], 0.45), 3);
      for (let k = 0; k < 50; k++) { const rx = wrap(k * 29 - X * 0.5, 760) - 60; for (let j = -1; j <= 1; j++) PX.line(g, rx, 196, rx + j * 2, 190 - (k % 3) * 2, j ? D.moss[2] : mix(D.moss[1], D.paperD, 0.3)); }
      for (let k = 0; k < 9; k++) palm(g, wrap(k * 96 + 20 - X * 0.55, 860) - 80, 202, 52 + (k * 13) % 22, t, 50 + k, { trunk: mix(D.n3, D.amber[2], 0.35), leaf: mix(D.moss[2], D.moss[1], 0.35) });
      const dune = mix(mix(D.paperD, D.amber[1], 0.3), D.lamp, 0.1);
      poly(g, curve((q) => { const x = lerp(-40, 680, q); return [x, 214 + Math.sin((x + X * 0.7) * 0.015) * 4]; }, 50).concat([[680, 240], [-40, 240]]), dune);
      // caravan walking the other way
      for (let k = 0; k < 4; k++) { const cx = wrap(700 - t * 18 - X * 0.7 + k * 58, 1100) - 160, cy = 222 + (k % 2); camel(g, cx, cy, frac(t * 0.9 + k * 0.3), -1, 1.2, k % 2 ? mix(D.rust[1], D.paperD, 0.4) : mix(D.teal[2], D.paperD, 0.4)); }
      { const lx = wrap(700 - t * 18 - X * 0.7 - 30, 1100) - 160, gg = gait(frac(t * 0.9) , 10, 2, 0.62); rig(g, lx, 224, { h: 50, skin: SKIN.deep, hairStyle: "wrap", wrapCol: mix(D.cream, D.paperD, 0.3), dress: "robe", cloth: mix(D.paper, D.steel[1], 0.3), seed: 9 }, { fN: gg.fN, fF: gg.fF, hip: [0, gg.bob], hN: [8, -26] }, -1, t, 1); }
      // road
      const road = mix(mix(D.paperD, D.amber[1], 0.25), D.lamp, 0.15), roadD = mix(road, D.amber[2], 0.35);
      PX.vgrad(g, -40, 234, 720, 130, mix(road, D.lamp, 0.15), mix(road, D.amber[2], 0.25), 6);
      for (let k = 0; k < 80; k++) { const ry = 238 + (k * 17) % 120, nn = (ry - 234) / 130, rx = wrap(k * 53 - X * (0.8 + nn * 0.28), 760) - 60; R(g, rx, ry, 1 + Math.round(nn * 3), 1, k % 3 ? roadD : mix(road, D.cream, 0.3)); }
      for (const ry of [262, 300]) for (let k = 0; k < 24; k++) { const rx = wrap(k * 34 - X * (0.8 + (ry - 234) / 130 * 0.28), 816) - 88; R(g, rx, ry, 18, 1, roadD); }
      // palm shadows lying across the road (sun upper right)
      for (let k = 0; k < 6; k++) { const px = wrap(k * 150 + 40 - X * 0.95, 900) - 80, py = 248 + (k % 3) * 16; shadow(g, 0.08, () => { ell(g, px, py, 22 + (k % 2) * 10, 3, BLK); ell(g, px + 14, py + 2, 12, 2, BLK); }); }

      for (let k = 0; k < 16; k++) { const rx = wrap(k * 61 - X * 1.02, 980) - 80, ry = 330 + (k % 4) * 6; ell(g, rx, ry, 2 + (k % 3), 1.4, mix(D.paperD, D.n4, 0.35)); R(g, rx - 1, ry - 1, 2, 1, mix(D.cream, road, 0.3)); }
      // walkers (left to right), in perfect step
      const counting = (rr, uu, off) => {   // knotted cord hanging from the near hand; one knot slides through the fingers each step
        // a long knotted cord hangs in a loop between the hands, held out in front; one knot passes the fingers each step
        const hxw = rr.hN[0], hyw = rr.hN[1], cc = mix(D.paperD, D.amber[2], 0.45), cD = mix(cc, D.n0, 0.45), sp = 5.5 * uu, shift = frac(ph * 2 + off) * sp;
        const bx = rr.hF[0], by = rr.hF[1];
        const pts = curve((qq) => [lerp(hxw, bx, qq) + Math.sin(qq * Math.PI) * 3 * uu, lerp(hyw + 1, by, qq) + Math.sin(qq * Math.PI) * 20 * uu], 18);
        rope(g, pts, 0, cc);
        let L = 0; const seglen = [0]; for (let i = 1; i < pts.length; i++) { L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seglen.push(L); }
        for (let k = 0; k < 16; k++) { const s0 = k * sp + shift; if (s0 < 3 || s0 > L - 3) continue; let j = 1; while (j < seglen.length - 1 && seglen[j] < s0) j++; const qq = (s0 - seglen[j - 1]) / Math.max(1e-6, seglen[j] - seglen[j - 1]), p = [Math.round(lerp(pts[j - 1][0], pts[j][0], qq)), Math.round(lerp(pts[j - 1][1], pts[j][1], qq))]; R(g, p[0] - 2, p[1] - 1, 4, 4, cD); R(g, p[0] - 2, p[1] - 2, 4, 3, cc); R(g, p[0] - 1, p[1] - 2, 2, 1, mix(cc, D.cream, 0.45)); }
        for (const h of [[hxw, hyw], [bx, by]]) { ell(g, h[0], h[1], 2.3 * uu, 2.3 * uu, rr.skin); R(g, h[0] - uu, h[1] - 2 * uu, 2 * uu, 1, mix(rr.skin, D.cream, 0.25)); }
      };
      const walker = (x, y, v, off) => {
        const uu = v.h / 80, s = 19 * uu, gg = gait(ph, s, 3 * uu, uu), stand = [[1.5 * uu, 0], [-1.5 * uu, 0]];
        const fN = [lerp(stand[0][0], gg.fN[0], amp), gg.fN[1] * amp], fF = [lerp(stand[1][0], gg.fF[0], amp), gg.fF[1] * amp];
        const sw = gg.sw * amp;
        const r = rig(g, x, y, v, { fN, fF, hip: [0, gg.bob * amp], lean: 0.05 * amp, hN: [13 * uu, -47 * uu], hF: [6 * uu, -40 * uu],
 eyes: "open", mouth: amp > 0 && frac(ph * 2) < 0.12 ? "oh" : "flat", nod: Math.round(-gg.bob * amp * 0.3) }, 1, t, 1);
        r.skin = v.skin; counting(r, uu, off);
        // satchel strap + bag
        R(g, r.hip[0] - 7 * uu, r.hip[1] - 4 * uu, 5 * uu, 7 * uu, mix(D.rust[2], D.paperD, 0.3));
      };
      walker(262, 300, WB, 0.0);
      walker(324, 326, WA, 0.0);
      // milestones on the near roadside
      for (let k = -1; k < 4; k++) { const mx = wrap(180 + k * 260 - X * 1.02, 1040) - 160, my = 334; if (mx < -40 || mx > 680) continue; const st = mix(D.paper, D.n6, 0.25); shadow(g, 0.3, () => poly(g, [[mx - 6, my], [mx + 6, my], [mx - 14, my + 4], [mx - 24, my + 4]], BLK)); R(g, mx - 6, my - 28, 12, 28, st); ell(g, mx, my - 28, 6, 3, st); R(g, mx - 6, my - 28, 2, 28, mix(st, D.cream, 0.3)); R(g, mx + 4, my - 28, 2, 28, mix(st, D.n4, 0.4)); for (let j = 0; j < 3; j++) R(g, mx - 3, my - 22 + j * 5, 6, 1, mix(st, D.n3, 0.45)); R(g, mx - 1, my - 26, 2, 2, mix(st, D.n3, 0.45)); }
      // tamarisk shrubs and stones on the near roadside
      for (let k = 0; k < 5; k++) { const bx = wrap(k * 210 + 90 - X * 1.02, 1050) - 120, by = 334 + (k % 2) * 3, bc = mix(D.moss[2], D.paperD, 0.3); shadow(g, 0.25, () => ell(g, bx - 8, by + 1, 16, 2, BLK)); for (let j = 0; j < 9; j++) { const a = -Math.PI * (0.15 + 0.7 * j / 8), ln = 10 + (j % 3) * 4, sw = Math.sin(t * 1.3 + k + j) * 0.8; PX.line(g, bx, by, bx + Math.cos(a) * ln + sw, by + Math.sin(a) * ln, j % 2 ? bc : mix(bc, D.moss[0], 0.3)); } ell(g, bx + 14, by, 4, 2.5, mix(D.paperD, D.n5, 0.3)); R(g, bx + 12, by - 2, 3, 1, mix(D.cream, D.paperD, 0.3)); }
      // foreground tufts (fastest layer)

      for (let k = 0; k < 10; k++) { const fx = wrap(k * 83 - X * 1.08, 830) - 60, fy = 356 + (k % 3) * 2; for (let j = -2; j <= 2; j++) PX.line(g, fx, fy, fx + j * 2 + Math.sin(t * 1.5 + k) * 0.8, fy - 8 - (k % 3) * 3, j % 2 ? D.moss[2] : mix(D.moss[1], D.amber[1], 0.4)); }
      PX.vignette(g, 0.34);
    };
  };
})();
