/* Math film, Builder B (fast vs deep). Documentary palette PX.D only (no neon, no hex except black shadows).
   Kinds: fast_hand, lycee, medal, deep_quick, jungle, paper_floor, sprint_climb. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, E = PX.ease, P = PX.p;
  const TAU = Math.PI * 2;

  // ---------- colour + shape helpers ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { k = clamp(k, 0, 1); const A0 = hx(a), B0 = hx(b); return "#" + A0.map((v, i) => Math.round(v + (B0[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const sh3 = (c) => [mix(c, D.cream, 0.26), c, mix(c, D.n0, 0.42)];
  const ell = (g, cx, cy, rx, ry, col) => {
    g.fillStyle = col; const n = Math.max(0, Math.round(ry));
    if (!n) { g.fillRect(Math.round(cx - rx), Math.round(cy), Math.round(2 * rx) + 1, 1); return; }
    for (let y = -n; y <= n; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / (ry + 0.3)) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
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
  // thick pixel segment: w x w stamps along the line
  const seg = (g, x1, y1, x2, y2, w, col) => {
    g.fillStyle = col; const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1))), o = Math.floor(w / 2);
    for (let i = 0; i <= n; i++) g.fillRect(Math.round(x1 + ((x2 - x1) * i) / n) - o, Math.round(y1 + ((y2 - y1) * i) / n) - o, w, w);
  };
  const A = (g, a, fn) => { if (a <= 0.002) return; const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  // darkness outside a light pool
  const pool = (g, x, y, r0, r1, a) => { if (a <= 0.003) return; const gr = g.createRadialGradient(x, y, r0, x, y, r1); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, `rgba(0,0,0,${a.toFixed(3)})`); g.fillStyle = gr; g.fillRect(-60, -60, 760, 480); };
  // option time resolver: o[k] if a number, else the default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  // range option: [a, b] array, scalar start (keeps default span), or scaled default
  const span = (o, d, typ, k, a, b) => {
    const v = o[k];
    if (Array.isArray(v) && v.length >= 2 && typeof v[0] === "number") return [v[0], Math.max(+v[1] || v[0], v[0] + 0.05)];
    if (typeof v === "number") return v < 0 ? [v, v + 0.05] : [v, v + ((b - a) * d) / typ];   // negative = already over
    return [(a * d) / typ, (b * d) / typ];
  };
  const label = (g, s, x, y, t, t0, o) => {
    o = o || {}; if (t < t0) return;
    const k = P(t, t0, 0.45, "out"), out = o.t1 === undefined ? 1 : 1 - P(t, o.t1, 0.4, "io");
    A(g, k * out, () => PX.otext(g, s, x, y + Math.round(3 * (1 - k)), { align: o.align || "center", col: o.col || D.cream, outline: D.n0, size: o.size || 8, font: o.font }));
  };
  const dust = (g, seed, n, t, box, col, a) => PX.particles(g, seed, n, t, box, { vy: -1.4, vx: 1.2, col: col || D.lamp, a: a === undefined ? 0.4 : a, tw: 1.3 });
  const SKIN = { lt: mix(D.rose[0], D.lamp, 0.28), md: mix(D.lampD, D.rust[1], 0.32), tan: mix(D.lampD, D.rust[2], 0.5), dk: mix(D.rust[2], D.n1, 0.38) };
  const WB = mix(mix(D.rust[2], D.amber[2], 0.4), D.n3, 0.25);
  const wood = (k) => { const w = mix(WB, D.n1, k || 0); return [mix(w, D.lamp, 0.28), w, mix(w, D.n0, 0.45)]; };

  // ---------- people ----------
  // face in profile facing right; (fx, fy) = eye pixel. ex: calm|think|eager|frown|surp|up
  // head in 3/4 view turned to the right (both eyes visible). (cx, cy) skull centre, ex expression, lk eye shift (-1 up, 1 down)
  const headR = (g, cx, cy, v, ex, lk, s) => {
    const r = Math.max(4, Math.round(6 * s)), sk = v.skin, skL = mix(sk, D.cream, 0.2), skD = mix(sk, D.n0, 0.28);
    const [hL, h, hD] = sh3(v.hair), u = r >= 8 ? 2 : 1, q = (k) => Math.round(r * k);
    const fcx = cx + q(0.24), fcy = cy + q(0.28);
    // back hair (behind the skull): bob / pony / curly volume
    if (v.hs === "bob") { R(g, cx - r - 1, cy - 1, q(1.1), q(1.25), hD); R(g, cx - r, cy - 1, q(0.9), q(1.2), h); }
    if (v.hs === "pony") { PX.circle(g, cx - r - 1, cy - q(0.2), Math.max(2, q(0.3)), hD); seg(g, cx - r - 2, cy, cx - r - 3, cy + q(1.1), Math.max(2, q(0.3)), h); }
    if (v.hs === "curly") PX.circle(g, cx - 1, cy - 1, r + 2, hD);
    // skull (hair-coloured unless bald), then the face shape in front
    if (v.hs === "bald") PX.circle(g, cx, cy, r, sk); else PX.circle(g, cx - 1, cy - 1, r + 1, h);
    ell(g, fcx, fcy, q(0.8), q(0.76), sk);
    R(g, fcx - q(0.55), fcy + q(0.55), q(1.1), 1, skD);                                  // under-jaw shadow
    R(g, fcx + q(0.74), fcy - q(0.3), 1, q(0.7), skD);                                  // front cheek shade
    R(g, fcx - q(0.55), fcy - q(0.2), 1, q(0.5), skL);                                  // lit cheek
    // nose (bump past the contour), cheek blush
    const nx = cx + r - 1 + (u > 1 ? 1 : 0), ny = cy + q(0.15);
    R(g, nx, ny, u, q(0.3) + 1, sk); R(g, nx - 1, ny + q(0.3) + 1, u + 1, 1, skD);
    if (u > 1) R(g, cx + q(0.05), cy + q(0.45), 2, 1, mix(sk, D.rose[1], 0.4));
    // hair top / fringe
    if (v.hs === "bald") { R(g, cx - r, cy - q(0.1), q(0.45), q(0.7), h); R(g, cx - r, cy - q(0.1), 1, q(0.6), hD); }
    else if (v.hs === "curly") {
      const cr = Math.max(2, q(0.38));
      for (let k = 0; k < 8; k++) { const a = Math.PI * (0.95 + k * 0.16); PX.circle(g, Math.round(cx - 1 + Math.cos(a) * r * 0.9), Math.round(cy - 1 + Math.sin(a) * r * 0.9), cr, k % 2 ? h : hD); }
      for (let k = 0; k < 4; k++) PX.circle(g, cx - q(0.4) + k * q(0.42), cy - q(0.55) + (k % 2), Math.max(1, cr - 1), k % 2 ? hD : h);
      for (let k = 0; k < 3 * r; k++) R(g, cx - r + Math.round(hash(k, 3) * (1.7 * r)), cy - r - 1 + Math.round(hash(3, k) * r * 0.9), 1, 1, k % 3 ? hL : hD);
    } else {
      const top = cy - q(0.42);
      R(g, cx - r + 1, top - 1, q(1.7), 2, h);
      for (let i = 0; i < q(1.6); i += 2) R(g, cx - r + 2 + i, top + 1, 1 + (i % 4 ? 1 : 0), 1 + ((i * 7) % 3 ? 0 : 1), h);
      if (v.hs === "bob" || v.hs === "pony") R(g, cx - q(0.35), cy - q(0.4), 2, q(0.9), h);   // strand in front of the ear
      R(g, cx - q(0.6), cy - r, q(0.9), 1, hL); R(g, cx - r + 1, cy - q(0.6), 1, q(0.5), hL);
      if (v.hs === "part") R(g, cx - q(0.1), cy - r, 1, 2, hD);
    }
    // ear on the hair line
    const ex0 = cx - q(0.42);
    R(g, ex0 - 1, cy + q(0.05), 1 + u, 2 + u, sk); R(g, ex0, cy + q(0.05) + 1, u, u, skD);
    if (v.beard) { const bc = mix(h, sk, 0.15); ell(g, fcx + 1, fcy + q(0.45), q(0.62), q(0.38), bc); R(g, fcx - q(0.1), fcy + q(0.1), q(0.7), u, bc); R(g, cx + q(0.25), cy + q(0.55), q(0.35), 1, mix(D.n0, D.rust[2], 0.4)); }
    // eyes, brows, mouth
    const e1 = cx + q(0.12), e2 = cx + q(0.66), ey = cy + q(0.12) + Math.round((lk || 0)) * (u > 1 ? 1 : 0), dk = D.n0, br = mix(hD, D.n0, 0.5);
    const eh = u + 1, my = cy + q(0.62), lip = mix(D.n0, D.rust[2], 0.45);
    const eye = (x, w) => {
      if (ex === "shut") R(g, x, ey + 1, w + 1, 1, dk);
      else if (ex === "eager" || ex === "surp") { R(g, x, ey - 1, w, eh + 1, dk); R(g, x, ey - 1, 1, 1, D.cream); }
      else if (ex === "frown") R(g, x, ey + 1, w, eh - 1, dk);
      else if (ex === "think") R(g, x + (w > 1 ? 1 : 0), ey - 1, Math.max(1, w - (u > 1 ? 1 : 0)), eh, dk);
      else { R(g, x, ey, w, eh, dk); if (u > 1) R(g, x, ey, 1, 1, mix(dk, D.cream, 0.45)); }
    };
    eye(e1, u); eye(e2, u > 1 ? u - 1 : 1);
    const eb = ey - (v.glasses ? 1 : 0);
    if (ex === "frown") { R(g, e1 - 1, eb - u - 1, u + 1, 1, br); R(g, e1 + u, eb - u, 1, 1, br); R(g, e2, eb - u, 1, 1, br); R(g, e2 + 1, eb - u - 1, u, 1, br); }
    else if (ex === "eager" || ex === "surp") { R(g, e1 - 1, eb - u - 3, u + 2, 1, br); R(g, e2 - 1, eb - u - 3, u + 1, 1, br); }
    else if (ex === "think") { R(g, e1 - 1, eb - u - 1, u + 2, 1, br); R(g, e2, eb - u - 2, u + 1, 1, br); }
    else { R(g, e1 - 1, eb - u - 1, u + 2, 1, br); R(g, e2, eb - u - 1, u + 1, 1, br); }
    const mx = cx + q(0.28);
    if (ex === "eager") { R(g, mx, my - 1, q(0.42) + 1, u + 1, lip); R(g, mx, my - 1, q(0.42) + 1, 1, D.cream); }
    else if (ex === "surp" || ex === "talk") R(g, mx + 1, my - 1, u, u + 1, lip);
    else if (ex === "frown") { R(g, mx, my, q(0.38), 1, skD); R(g, mx - 1, my + 1, 1, 1, skD); R(g, mx + q(0.38), my + 1, 1, 1, skD); }
    else if (ex === "smile") { R(g, mx, my, q(0.4), 1, skD); R(g, mx - 1, my - 1, 1, 1, skD); R(g, mx + q(0.4), my - 1, 1, 1, skD); }
    else R(g, mx, my, q(0.36), 1, skD);
    if (v.glasses) {
      const gc = mix(D.n1, D.amber[2], 0.3), rr = u + 1;
      for (const [gx, gw] of [[e1, rr + 1], [e2, rr]]) { R(g, gx - 1, ey - 2, gw + 1, 1, gc); R(g, gx - 1, ey + eh + 1, gw + 1, 1, gc); R(g, gx - 2, ey - 1, 1, eh + 2, gc); R(g, gx + gw, ey - 1, 1, eh + 2, gc); }
      R(g, e1 + rr + 1, ey, e2 - e1 - rr - 3, 1, gc); R(g, ex0 + u, ey, e1 - ex0 - u - 2, 1, gc);
      A(g, 0.5, () => R(g, e1, ey - 1, 1, 1, D.cream));
    }
  };

  // seated figure, profile facing right. (x, y) = back of the seat top. st: arm 0..1 (raise), lean px, ex, lk (eye -1 up/+1 down),
  // write 0..1, pose "chin" | "head" (hand on head) | "tap", t. Desk is drawn by the caller after body() and before arm().
  const sitter = (g, x, y, s, v, st, t) => {
    const X = (d) => Math.round(x + d * s), Y = (d) => Math.round(y + d * s), W = (d) => Math.max(1, Math.round(d * s));
    const B = (dx, dy, w, h, col) => R(g, X(dx), Y(dy), W(w), W(h), col);
    const [tL, tp, tD] = sh3(v.top), [pL, pa, pD] = sh3(v.pants), sk = v.skin, skD = mix(sk, D.n0, 0.3);
    const L = (st.lean || 0) + (st.arm > 0.5 ? -1 : 0), rise = st.arm ? Math.round(st.arm * 2 * s) : 0;
    const breath = Math.round(Math.max(0, Math.sin(t * 1.6 + (v.ph || 0))) * 0.8);
    const body = () => {
      const ch = wood(0.35);
      // chair
      B(-13, -24, 3, 46, ch[2]); B(-14, -23, 5, 11, ch[1]); B(-14, -23, 5, 1, ch[0]); B(-13, 0, 20, 3, ch[1]); B(-13, 0, 20, 1, ch[0]); B(4, 3, 2, 19, ch[2]);
      // far leg + shoe, near leg
      B(-6, -7, 15, 6, pD); B(7, -3, 5, 22, pD); B(6, 19, 9, 3, D.n1);
      B(-8, -6 - rise / s, 19, 6, pa); B(-8, -6 - rise / s, 19, 1, pL); B(9, -2, 5, 21, pa); B(9, -2, 1, 21, pL); B(8, 19, 10, 3, mix(D.n1, D.n3, 0.5)); B(9, 19, 6, 1, D.n4);
      // torso (rounded back, light from the left = back edge)
      const ty = -27 - rise / s + breath / s, b0 = v.thin ? -6 : -8;
      poly(g, [[X(b0), Y(-5)], [X(4), Y(-5)], [X(4 + L), Y(ty + 2)], [X(2 + L), Y(ty)], [X(b0 + 2 + L), Y(ty)], [X(b0 + L), Y(ty + 3)]], tp);
      poly(g, [[X(b0), Y(-5)], [X(b0 + 2), Y(-5)], [X(b0 + 2 + L), Y(ty + 2)], [X(b0 + L), Y(ty + 3)]], tL);
      poly(g, [[X(2), Y(-5)], [X(4), Y(-5)], [X(4 + L), Y(ty + 2)], [X(2 + L), Y(ty + 1)]], tD);
      B(-8, -7, 12, 2, tD);
      if (v.collar) { B(-1 + L, ty, 4, 2, v.collar); B(1 + L, ty + 2, 2, 2, v.collar); }
      if (v.vneck) B(1 + L, ty, 2, 3, v.vneck);
      // neck + head
      B(-2 + L, ty - 3, 4, 4, skD);
      const hy = ty - 9 + (st.lk > 0 ? 1 : 0) + (st.write ? 1 : 0);
      headR(g, X(L + 0.5), Y(hy), v, st.ex || "calm", st.lk || 0, s);
      return { ty, hy };
    };
    const arm = (k) => {
      const ty = k.ty, sx = 0 + L, sy = ty + 4;
      let el, hd;
      const up = E(st.arm || 0, "out");
      if (st.pose === "chin") { el = [11, -11]; hd = [5 + L, k.hy + 6]; }
      else if (st.pose === "head") { el = [8 + L, ty - 2]; hd = [3 + L, k.hy - 6]; }
      else {
        const wj = st.write ? Math.sin(t * (st.wspd || 7) + (v.ph || 0)) * 2 * st.write : 0, tap = st.pose === "tap" ? Math.abs(Math.sin(t * 5)) * 3 : 0;
        el = [lerp(5, 9 + L, up), lerp(-13, ty - 8, up)]; hd = [lerp(15 + wj, 11 + L + Math.sin(t * 9) * up * 0.6, up), lerp(-11 - tap, ty - 27, up)];
      }
      const w = Math.max(2, Math.round(4 * s));
      seg(g, X(sx), Y(sy), X(el[0]), Y(el[1]), w, tp); seg(g, X(el[0]), Y(el[1]), X(hd[0]), Y(hd[1]), w, tp);
      seg(g, X(sx - 1), Y(sy), X(el[0] - 1), Y(el[1]), 1, tL);
      R(g, X(hd[0]) - 1, Y(hd[1]) - 1, W(3) + 1, W(3), sk);
      if (up > 0.6) { R(g, X(hd[0]) - 1, Y(hd[1]) - W(3), W(3), W(3), sk); R(g, X(hd[0]) - 1, Y(hd[1]) - W(3), 1, W(3), skD); }
      if (st.write || st.pose === "tap") { const pc = mix(D.amber[1], D.n3, 0.25); seg(g, X(hd[0] + 1), Y(hd[1] - 1), X(hd[0] + 4), Y(hd[1] - 5), 1, pc); R(g, X(hd[0] + 4), Y(hd[1] - 5), 1, 1, D.rose[1]); }
    };
    return { body, arm };
  };
  // classroom desk (side view, slightly from above), front edge right. (x, y) = top-left of the desk surface
  const deskSide = (g, x, y, w, s, wd, paper) => {
    const th = Math.max(3, Math.round(4 * s));
    R(g, x, y, w, th, wd[0]); R(g, x, y + th, w, Math.max(2, Math.round(3 * s)), wd[1]); R(g, x, y + th + Math.round(3 * s), w, 1, wd[2]);
    R(g, x + w - Math.round(5 * s), y + th, Math.max(2, Math.round(3 * s)), Math.round(28 * s), wd[2]);
    R(g, x + Math.round(3 * s), y + th, Math.max(2, Math.round(2 * s)), Math.round(28 * s), mix(wd[2], D.n0, 0.3));
    if (paper) { R(g, x + Math.round(6 * s), y, Math.round(14 * s), Math.max(2, Math.round(2 * s)), paper); R(g, x + Math.round(6 * s), y, Math.round(14 * s), 1, mix(paper, D.cream, 0.4)); }
  };

  // standing adult, profile; f = 1 faces right, -1 left. feet at (x, y). arm: "down" | "point" | "board" | "open" (0..1 blend k)
  const standing = (g, x, y, s, v, f, pose, k, ex, lk, t) => {
    const fx = (d) => Math.round(x + f * d * s), Y = (d) => Math.round(y + d * s), W = (d) => Math.max(1, Math.round(d * s));
    const B = (dx, dy, w, h, col) => { const a = fx(dx), b = fx(dx + w); R(g, Math.min(a, b), Y(dy), Math.abs(b - a) || 1, W(h), col); };
    const [tL, tp, tD] = sh3(v.top), [pL, pa, pD] = sh3(v.pants), sk = v.skin;
    const br = Math.round(Math.max(0, Math.sin(t * 1.4 + (v.ph || 0))) * 0.9);
    A(g, 0.35, () => ell(g, x, y, Math.round(12 * s), Math.max(1, Math.round(2 * s)), "#000000"));
    // legs + shoes
    if (v.walk !== undefined) {   // walk cycle: legs swing from the hip, boots follow
      const sw = Math.sin(v.walk) * 6, lift = (q0) => Math.max(0, Math.sin(q0)) * 2;
      for (const [dir, col] of [[-1, pD], [1, pa]]) {
        const fxo = dir * sw, ly = -lift(v.walk * dir + (dir < 0 ? Math.PI : 0)) - 1;
        seg(g, fx(dir < 0 ? -2 : 2), Y(-38), fx(fxo * 0.5 + (dir < 0 ? -1 : 1)), Y(-20), W(5), col); seg(g, fx(fxo * 0.5 + (dir < 0 ? -1 : 1)), Y(-20), fx(fxo), Y(ly - 2), W(5), col);
        B(fxo - 3, ly - 2, 9, 3, dir < 0 ? D.n1 : mix(D.n1, D.n3, 0.45)); B(fxo - 2, ly - 2, 6, 1, D.n4);
      }
    } else {
      if (v.skirt) { B(-3, -14, 3, 12, mix(sk, D.n0, 0.25)); B(1, -14, 3, 12, sk); }
      else { B(-4, -40, 5, 38, pD); B(0, -40, 5, 38, pa); B(4, -40, 1, 38, pL); }
      B(-5, -3, 7, 3, D.n1); B(0, -3, 9, 3, mix(D.n1, D.n3, 0.4)); B(1, -3, 6, 1, D.n4);
    }
    // back arm
    seg(g, fx(-1), Y(-70 + br), fx(-4), Y(-48), W(4), tD); R(g, fx(-4) - 1, Y(-48), W(3), W(3), mix(sk, D.n0, 0.3));
    // backpack (behind)
    if (v.pack) { const [kL, k0, kD] = sh3(v.pack); B(-13, -72, 8, 28, k0); B(-13, -72, 8, 2, kL); B(-13, -72, 2, 28, f > 0 ? kL : kD); B(-14, -56, 9, 6, kD); B(-12, -78, 6, 6, mix(D.paper, D.n4, 0.3)); }
    // torso + skirt
    const top = -74 + br;
    poly(g, [[fx(-6), Y(-38)], [fx(6), Y(-38)], [fx(6), Y(top + 3)], [fx(4), Y(top)], [fx(-5), Y(top)], [fx(-7), Y(top + 4)]], tp);
    poly(g, [[fx(-7), Y(-38)], [fx(-4), Y(-38)], [fx(-4), Y(top + 2)], [fx(-7), Y(top + 4)]], f > 0 ? tL : tD);
    poly(g, [[fx(4), Y(-38)], [fx(6), Y(-38)], [fx(6), Y(top + 3)], [fx(4), Y(top + 1)]], f > 0 ? tD : tL);
    if (v.skirt) { poly(g, [[fx(-7), Y(-40)], [fx(7), Y(-40)], [fx(9), Y(-13)], [fx(-8), Y(-13)]], v.skirt); B(-8, -14, 17, 1, mix(v.skirt, D.n0, 0.35)); }
    else B(-6, -40, 12, 2, mix(pa, D.n0, 0.3));
    if (v.lapel) { seg(g, fx(1), Y(top + 1), fx(4), Y(top + 14), 1, v.lapel); B(2, top, 3, 4, D.cream); B(3, top + 4, 1, 10, v.tie || pD); }
    if (v.cardi) { B(3, top + 2, 1, 32, tD); for (let i = 0; i < 4; i++) B(4, top + 6 + i * 7, 1, 1, D.paper); }
    // neck + head
    B(-2, top - 4, 4, 5, mix(sk, D.n0, 0.3));
    const hx0 = fx(0.5), hy0 = Y(top - 11);
    g.save(); if (f < 0) { g.translate(hx0 * 2, 0); g.scale(-1, 1); }
    headR(g, hx0, hy0, v, ex, lk, s * 1.12);
    if (v.hs === "bun") { const hc = sh3(v.hair); PX.circle(g, hx0 - Math.round(7 * s), hy0 - Math.round(4 * s), Math.max(2, Math.round(3 * s)), hc[1]); R(g, hx0 - Math.round(8 * s), hy0 - Math.round(6 * s), 2, 1, hc[0]); }
    if (v.hat) { const [aL, a0, aD] = sh3(v.hat), hr = Math.round(6.7 * s); R(g, hx0 - hr - 4, hy0 - Math.round(hr * 0.45), 2 * hr + 9, 2, a0); R(g, hx0 - hr - 4, hy0 - Math.round(hr * 0.45) + 2, 2 * hr + 9, 1, aD); ell(g, hx0 - 1, hy0 - Math.round(hr * 0.75), hr, Math.round(hr * 0.5), a0); R(g, hx0 - hr + 1, hy0 - Math.round(hr * 0.6), 2 * hr - 1, 2, aD); R(g, hx0 - hr + 2, hy0 - Math.round(hr * 1.15), hr, 1, aL); }
    g.restore();
    // front arm
    const P0 = Array.isArray(pose) ? pose : { down: [[4, -52], [5, -36]], point: [[9, -60], [20, -66]], board: [[8, -56], [14, -76]], open: [[8, -52], [16, -58]], lantern: [[6, -52], [13, -47]], lift: [[10, -66], [16, -80]] }[pose] || [[4, -52], [5, -36]];
    const el = [lerp(4, P0[0][0], k), lerp(-52, P0[0][1], k)], hd = [lerp(5, P0[1][0], k), lerp(-36, P0[1][1], k)];
    seg(g, fx(1), Y(top + 4), fx(el[0]), Y(el[1]), W(4), tp); seg(g, fx(el[0]), Y(el[1]), fx(hd[0]), Y(hd[1]), W(4), tp);
    seg(g, fx(2), Y(top + 4), fx(el[0] + 1), Y(el[1]), 1, f > 0 ? tL : tD);
    R(g, fx(hd[0]) - 1, Y(hd[1]) - 1, W(3), W(3), sk);
    return { hand: [fx(hd[0]), Y(hd[1])], head: [hx0, hy0] };
  };

  const POSE = { down: [[4, -52], [5, -36]], open: [[8, -52], [16, -58]], point: [[9, -60], [20, -66]] };
  const pmix = (A0, B0, k) => A0.map((p, i) => [lerp(p[0], B0[i][0], k), lerp(p[1], B0[i][1], k)]);

  // ---------- shared room pieces ----------
  // tall window with daylight, foliage outside, mullions. lit 0..1
  const windowDay = (g, x, y, w, h, t, seed, frame, sky) => {
    R(g, x - 4, y - 4, w + 8, h + 8, frame[2]); R(g, x - 3, y - 3, w + 6, h + 6, frame[1]); R(g, x - 3, y - 3, w + 6, 1, frame[0]);
    PX.vgrad(g, x, y, w, h, sky[0], sky[1], 6);
    const r = PX.rnd(seed);
    clip(g, x, y, w, h, () => {
      PX.line(g, x + w * 0.3, y + h, x + w * 0.42, y + h * 0.35, mix(D.n3, sky[1], 0.5)); PX.line(g, x + w * 0.31, y + h, x + w * 0.43, y + h * 0.35, mix(D.n3, sky[1], 0.5));
      for (let i = 0; i < 9; i++) {
        const bx = x + r() * w, by = y + h * (0.3 + r() * 0.75), rr = 6 + r() * 10, sw = Math.round(Math.sin(t * 0.8 + i) * 1.2);
        const c0 = mix(D.moss[2], sky[1], 0.4), c1 = mix(D.moss[1], sky[1], 0.42), c2 = mix(D.moss[0], sky[1], 0.4);
        PX.circle(g, Math.round(bx) + sw, Math.round(by), Math.round(rr), c0); PX.circle(g, Math.round(bx - rr * 0.2) + sw, Math.round(by - rr * 0.25), Math.round(rr * 0.75), c1);
        for (let k = 0; k < rr * 1.5; k++) R(g, Math.round(bx - rr * 0.6 + hash(i, k) * rr) + sw, Math.round(by - rr * 0.7 + hash(k, i) * rr * 0.8), 1, 1, c2);
      }
    });
    R(g, x + Math.floor(w / 2) - 1, y, 2, h, frame[1]);
    for (let yy = y + Math.round(h / 3); yy < y + h - 4; yy += Math.round(h / 3)) R(g, x, yy, w, 2, frame[1]);
    R(g, x - 6, y + h + 3, w + 12, 4, frame[0]); R(g, x - 6, y + h + 7, w + 12, 1, frame[2]);
  };
  // wall clock with hands only (no numerals)
  const clockFace = (g, x, y, r, t, rim) => {
    PX.circle(g, x + 1, y + 2, r + 1, mix(D.n1, D.n3, 0.4)); PX.circle(g, x, y, r + 1, rim); PX.circle(g, x, y, r - 1, D.cream);
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU; R(g, Math.round(x + Math.cos(a) * (r - 3)), Math.round(y + Math.sin(a) * (r - 3)), 1, 1, D.n4); }
    const am = -Math.PI / 2 + t * 0.105, ah = -Math.PI / 2 + 0.9 + t * 0.009, as = -Math.PI / 2 + t * TAU / 60 * 6;
    PX.line(g, x, y, x + Math.cos(ah) * (r - 6), y + Math.sin(ah) * (r - 6), D.ink); PX.line(g, x, y, x + Math.cos(am) * (r - 3), y + Math.sin(am) * (r - 3), D.ink);
    PX.line(g, x, y, x + Math.cos(as) * (r - 3), y + Math.sin(as) * (r - 3), D.rust[1]); R(g, x, y, 1, 1, D.n0);
  };
  // handwriting-like squiggle line (chalk / marker / pencil), progress p 0..1
  const scrib = (g, x, y, w, p, col, seed, amp) => {
    const n = Math.floor(w * clamp(p, 0, 1)); amp = amp || 2;
    for (let i = 0; i < n; i++) {
      const gap = hash(seed, Math.floor(i / 7)) < 0.18;
      if (gap) continue;
      const yy = y + Math.round(Math.sin(i * 0.9 + seed) * amp * 0.5 + Math.sin(i * 0.37 + seed * 2) * amp * 0.5);
      R(g, x + i, yy, 1, 1, col);
    }
  };

  // ======================= fast_hand =======================
  // modern classroom from the side: the teacher starts a question (speech bubble filling with squiggles), one kid's hand
  // shoots up instantly at o.hand (1.0) before she finishes; the others are still thinking (chin, pencil tap, writing).
  K.fast_hand = (o) => {
    const KIDS = [
      // back row (s 0.85)
      { x: 126, y: 206, s: 1.2, row: 1, v: { skin: SKIN.dk, hair: D.n0, top: mix(D.steel[2], D.n3, 0.2), pants: D.n3, hs: "short", ph: 1 }, pose: "tap", ex: "think", lk: -1 },
      { x: 290, y: 206, s: 1.2, row: 1, v: { skin: SKIN.lt, hair: mix(D.paperD, D.amber[2], 0.4), top: mix(D.rose[2], D.n3, 0.3), pants: D.n4, hs: "pony", ph: 2 }, write: 1, ex: "calm", lk: 1 },
      { x: 430, y: 206, s: 1.2, row: 1, v: { skin: SKIN.tan, hair: mix(D.n0, D.rust[2], 0.3), top: mix(D.moss[2], D.n3, 0.25), pants: D.n3, hs: "part", ph: 3 }, pose: "head", ex: "frown", lk: -1 },
      // front row (s 1.6): the learner (left), the fast kid (middle), a writer (right)
      { x: 94, y: 282, s: 1.6, row: 0, learner: true, v: { skin: SKIN.md, hair: mix(D.n0, D.rust[2], 0.18), top: mix(D.teal[1], D.teal[2], 0.45), pants: mix(D.steel[2], D.n2, 0.4), hs: "curly", ph: 4 }, pose: "chin", ex: "think", lk: -1 },
      { x: 250, y: 282, s: 1.6, row: 0, fast: true, v: { skin: SKIN.lt, hair: mix(D.amber[2], D.rust[2], 0.35), top: mix(D.amber[2], D.paperD, 0.3), pants: D.n3, hs: "part", collar: D.cream, ph: 5 }, ex: "calm" },
      { x: 404, y: 282, s: 1.6, row: 0, v: { skin: SKIN.tan, hair: D.n0, top: mix(D.plum[2], D.n3, 0.35), pants: D.n4, hs: "bob", ph: 6 }, write: 1, ex: "calm", lk: 1 },
    ];
    const TEACH = { skin: SKIN.md, hair: mix(D.n1, D.rust[2], 0.3), top: mix(D.moss[2], D.paperD, 0.25), pants: D.n3, skirt: mix(D.steel[2], D.n2, 0.3), hs: "bun", cardi: true, ph: 0.5 };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 5.0), tH = T("hand", 1.0);
      const up = P(t, tH, 0.16, "back"), after = t - tH;
      const talkEnd = tH + 0.25, talking = t > 0.15 && t < talkEnd;
      R(g, 0, 0, 640, 360, D.n2);
      // ---- far: back wall, windows, board, clock, posters ----
      PX.par(g, c, 0.45, () => {
        const wall = mix(D.paperD, D.n5, 0.42);
        PX.vgrad(g, -60, -40, 760, 280, mix(wall, D.n3, 0.45), wall, 7);
        // sunlit wall patches from the windows (left side warmer)
        A(g, 0.1, () => R(g, -60, -40, 300, 280, D.lamp));
        R(g, -60, 188, 760, 86, mix(D.teal[2], D.n3, 0.35)); R(g, -60, 188, 760, 2, mix(D.teal[1], D.paperD, 0.35)); R(g, -60, 190, 760, 1, mix(D.teal[2], D.n2, 0.4)); R(g, -60, 230, 760, 4, mix(D.n2, D.teal[2], 0.2));
        for (let x = -40; x < 700; x += 48) R(g, x, 192, 1, 38, mix(D.teal[2], D.n2, 0.45));
        const fr = [mix(D.cream, D.paperD, 0.25), mix(D.paperD, D.n6, 0.35), mix(D.n4, D.n3, 0.4)], sky = [mix(D.steel[0], D.cream, 0.4), mix(D.cream, D.lamp, 0.35)];
        windowDay(g, -14, 22, 62, 140, t, 11, fr, sky); windowDay(g, 78, 22, 62, 140, t, 12, fr, sky);
        // posters: shapes only
        R(g, 172, 54, 32, 42, mix(D.n3, D.n2, 0.5)); R(g, 173, 55, 30, 40, mix(D.paper, D.cream, 0.4));
        poly(g, [[188, 61], [198, 82], [178, 82]], mix(D.steel[1], D.paper, 0.35)); PX.circle(g, 188, 76, 4, mix(D.amber[1], D.paper, 0.35));
        R(g, 212, 64, 26, 30, mix(D.n3, D.n2, 0.5)); R(g, 213, 65, 24, 28, mix(D.moss[0], D.paper, 0.55)); for (let i = 0; i < 4; i++) R(g, 217, 70 + i * 6, 16 - i * 3, 2, mix(D.moss[2], D.paper, 0.3));
        clockFace(g, 278, 40, 13, t + 20, mix(D.n3, D.steel[2], 0.4));
        // low book shelf under the posters + a plant on the sill
        const sw0 = wood(0.35);
        R(g, 166, 140, 82, 50, sw0[2]); R(g, 166, 140, 82, 2, sw0[0]); R(g, 168, 164, 78, 2, sw0[1]);
        for (let i = 0, bx = 170; bx < 240 && i < 20; i++) { const bw = 3 + Math.floor(hash(i, 4) * 4), bh = 14 + Math.floor(hash(4, i) * 8), cc = [D.rust[2], D.steel[2], D.moss[2], D.paperD, D.teal[2]][i % 5];
          R(g, bx, 164 - bh, bw, bh, mix(cc, D.n3, 0.3)); R(g, bx, 164 - bh, 1, bh, mix(cc, D.paper, 0.2)); const bh2 = 12 + Math.floor(hash(i, 9) * 8); R(g, bx + 1, 188 - bh2, bw, bh2, mix([D.paperD, D.moss[2], D.rust[2], D.steel[2]][i % 4], D.n3, 0.35)); bx += bw + (hash(i, 7) < 0.2 ? 3 : 0); }
        R(g, 100, 152, 12, 10, mix(D.rust[1], D.paperD, 0.3)); R(g, 100, 152, 12, 1, mix(D.rust[0], D.paper, 0.3));
        for (let k = 0; k < 7; k++) { const a = -Math.PI / 2 + (k - 3) * 0.38 + Math.sin(t * 0.9 + k) * 0.03; seg(g, 106, 152, 106 + Math.cos(a) * 12, 152 + Math.sin(a) * 12, 2, k % 2 ? D.moss[2] : D.moss[1]); }
        // whiteboard with marker squiggles (the question being written)
        const bd = mix(D.cream, D.n6, 0.3);
        R(g, 318, 26, 262, 112, mix(D.n5, D.steel[2], 0.3)); R(g, 320, 28, 258, 108, bd); R(g, 320, 28, 258, 1, mix(bd, D.cream, 0.5)); R(g, 320, 134, 258, 2, mix(bd, D.n5, 0.3));
        A(g, 0.22, () => poly(g, [[392, 28], [436, 28], [404, 136], [360, 136]], D.cream));
        const ink = mix(D.steel[2], D.n2, 0.3), ink2 = mix(D.teal[2], D.n2, 0.2);
        scrib(g, 334, 42, 120, 1, ink, 3, 3); scrib(g, 334, 56, 84, 1, ink, 5, 3); scrib(g, 334, 76, 160, 1, ink2, 7, 3); scrib(g, 340, 92, 64, 1, ink2, 8, 2);
        PX.line(g, 334, 108, 360, 108, ink); scrib(g, 366, 108, 50, 1, ink, 9, 2);
        R(g, 330, 138, 238, 4, mix(D.n5, D.steel[2], 0.3)); R(g, 350, 136, 10, 2, D.rust[1]); R(g, 364, 136, 10, 2, D.steel[1]);
      });
      // ---- floor ----
      PX.par(g, c, 0.7, () => {
        PX.vgrad(g, -60, 233, 760, 170, mix(D.n4, D.paperD, 0.32), mix(D.n3, D.paperD, 0.2), 6);
        for (let k = 0; k < 8; k++) { const y = 236 + k * k * 2.2 + k * 5; R(g, -60, Math.round(y), 760, 1, mix(D.n3, D.paperD, 0.14)); }
        for (let i = -12; i < 20; i++) PX.line(g, 320 + i * 40, 234, 320 + i * 90, 400, mix(D.n3, D.paperD, 0.16));
        A(g, 0.18, () => { poly(g, [[20, 234], [80, 234], [190, 330], [100, 330]], D.cream); poly(g, [[112, 234], [172, 234], [290, 330], [200, 330]], D.cream); });
      });
      // window light shafts through the air
      A(g, 0.06, () => { poly(g, [[-10, 30], [48, 30], [190, 330], [100, 330]], D.cream); poly(g, [[78, 30], [140, 30], [290, 330], [200, 330]], D.cream); });
      // ---- kids: back row then front row; teacher ----
      const drawKid = (kd) => {
        const fast = kd.fast, s = kd.s;
        let st = { ex: kd.ex, lk: kd.lk || 0, write: kd.write || 0, pose: kd.pose, lean: kd.write ? 2 : 0 };
        if (fast) {
          st = { arm: up, ex: up > 0.05 ? "eager" : "calm", lk: -1, lean: up > 0.05 ? -1 : 0 };
          if (up > 0.05 && after > 0.25) st.arm = 1 + Math.sin(after * 11) * 0.03;
        }
        if (kd.learner && after > 0.4 && after < 2.2) { st.ex = "surp"; st.lk = 0; st.pose = null; }   // glances at the raised hand
        if (kd.learner && after >= 2.2) { st.ex = "frown"; st.lk = 1; st.pose = null; st.write = 0.25; st.lean = 2; }
        if (kd.row === 1 && kd.pose === "head" && after > 0.6) st.ex = "surp";
        const fig = sitter(g, kd.x, kd.y, s, kd.v, st, t);
        const k = fig.body();
        const wd = wood(kd.row ? 0.3 : 0.1);
        deskSide(g, Math.round(kd.x + 9 * s), Math.round(kd.y - 10 * s), Math.round(42 * s), s, wd, mix(D.cream, D.paper, 0.4));
        fig.arm(k);
        // motion streaks + a little lift as the hand shoots up
        if (fast && after > 0 && after < 0.45) A(g, 1 - after / 0.45, () => { for (let i = 0; i < 3; i++) R(g, Math.round(kd.x + (6 + i * 3) * s), Math.round(kd.y + (-60 + i * 6) * s) + Math.round(after * 30), 1, Math.round(6 * s), D.cream); });
        // thought dots over the learner while thinking
        if (kd.learner && t < tH + 0.4) for (let i = 0; i < 3; i++) if (PX.blink(t - i * 0.25, 1.2, 0.6)) R(g, Math.round(kd.x + (8 + i * 5) * s), Math.round(kd.y - (52 + i * 3) * s), 2, 2, mix(D.cream, D.n6, 0.2));
      };
      PX.par(g, c, 0.82, () => KIDS.filter((k) => k.row === 1).forEach(drawKid));
      // teacher at the board (between the rows in depth)
      PX.par(g, c, 0.88, () => {
        const pk = 1 - P(t, tH + 0.1, 0.4, "io");
        const ex = after > 0.15 ? "surp" : "calm";
        const kOpen = 0.55 + 0.45 * pk + Math.sin(t * 3) * 0.08 * pk, arm = pmix(pmix(POSE.down, POSE.open, kOpen), POSE.point, P(t, tH + 1.0, 0.4, "out"));
        const fig = standing(g, 556, 262, 1.15, TEACH, -1, arm, 1, ex, 0, t);
        if (talking && Math.sin(t * 22) > 0) R(g, fig.head[0] - 5, fig.head[1] + 6, 2, 2, mix(D.n0, D.rust[2], 0.4));
        if (pk > 0.5) R(g, fig.hand[0] - 1, fig.hand[1] - 4, 1, 4, D.n1);   // marker
        // speech bubble: squiggles fill in until the hand interrupts
        const bub = P(t, 0.1, 0.3, "out") * (1 - P(t, tH + 1.6, 0.5, "io"));
        if (bub > 0) A(g, bub, () => {
          const bx = 444, by = 104, bw = 86, bh = 26;
          R(g, bx + 1, by - 1, bw - 2, bh + 2, D.n4); R(g, bx - 1, by + 1, bw + 2, bh - 2, D.n4);
          R(g, bx + 1, by, bw - 2, bh, D.cream); R(g, bx, by + 1, bw, bh - 2, D.cream); R(g, bx + 2, by + bh - 1, bw - 4, 1, D.paper);
          poly(g, [[bx + bw - 22, by + bh - 1], [bx + bw - 9, by + bh - 1], [bx + bw + 8, by + bh + 16]], D.n4); poly(g, [[bx + bw - 21, by + bh - 2], [bx + bw - 10, by + bh - 2], [bx + bw + 6, by + bh + 13]], D.cream);
          const fill = clamp((Math.min(t, talkEnd) - 0.2) / 2.2, 0, 1);
          scrib(g, bx + 7, by + 8, bw - 16, clamp(fill * 2, 0, 1), D.ink, 21, 2); scrib(g, bx + 7, by + 17, bw - 30, clamp(fill * 2 - 1, 0, 1), D.ink, 22, 2);
          if (after > 0.1) { const f2 = clamp(fill * 2, 0, 1), cx = bx + 7 + Math.round(f2 < 1 ? (bw - 16) * f2 : (bw - 30) * clamp(fill * 2 - 1, 0, 1)) + 2; R(g, cx, by + 6 + (f2 >= 1 ? 9 : 0), 1, 1, D.ink); R(g, cx + 3, by + 6 + (f2 >= 1 ? 9 : 0), 1, 1, D.ink); R(g, cx + 6, by + 6 + (f2 >= 1 ? 9 : 0), 1, 1, D.ink); }
        });
      });
      PX.par(g, c, 1.0, () => KIDS.filter((k) => k.row === 0).forEach(drawKid));
      // foreground: blurred near desk corner + bag
      PX.par(g, c, 1.25, () => {
        const fw = wood(0.55);
        poly(g, [[566, 318], [720, 306], [720, 420], [584, 420]], fw[2]); R(g, 566, 316, 160, 5, fw[1]); R(g, 566, 316, 160, 1, fw[0]);
        ell(g, 22, 378, 46, 30, mix(D.rust[2], D.n1, 0.55)); ell(g, 18, 370, 34, 18, mix(D.rust[2], D.n1, 0.4)); R(g, 2, 354, 26, 2, mix(D.rust[2], D.paperD, 0.3));
      });
      dust(g, 31, 34, t, [20, 50, 280, 260], D.cream, 0.35);
      PX.vignette(g, 0.5);
    };
  };

  // small grey rain cloud with drops falling to yb; k = grow 0..1
  const rainCloud = (g, x, y, k, t, yb, sc) => {
    if (k <= 0) return;
    const [cL, c, cD] = [mix(D.n6, D.steel[0], 0.3), mix(D.n5, D.steel[2], 0.35), mix(D.n4, D.steel[2], 0.4)];
    const s = E(k, "back") * (sc || 1), bob = Math.round(Math.sin(t * 1.7) * 1.5), cy = y + bob;
    // drops (behind the cloud)
    if (k > 0.6) for (let i = 0; i < 9; i++) {
      const ph = frac(t * 1.5 + hash(i, 2)), dx = Math.round(x + (-15 + i * 3.8) * (sc || 1)), dy = Math.round(cy + 6 * (sc || 1) + ph * (yb - cy - 6 * (sc || 1)));
      A(g, 0.95 * (1 - ph * 0.4), () => { R(g, dx, dy, 1, 4, mix(D.steel[0], D.cream, 0.35)); R(g, dx, dy + 3, 1, 1, D.cream); });
    }
    const pf = [[-12, 2, 7], [-4, -3, 9], [6, -1, 8], [13, 3, 6], [0, 4, 8]];
    for (const [dx, dy, r] of pf) PX.circle(g, x + Math.round(dx * s), cy + Math.round(dy * s) + 1, Math.max(1, Math.round(r * s)), cD);
    for (const [dx, dy, r] of pf) PX.circle(g, x + Math.round(dx * s), cy + Math.round(dy * s), Math.max(1, Math.round((r - 1) * s)), c);
    for (const [dx, dy, r] of pf.slice(0, 3)) PX.circle(g, x + Math.round((dx - 1) * s), cy + Math.round((dy - 2) * s), Math.max(1, Math.round((r - 4) * s)), cL);
    R(g, x - Math.round(15 * s), cy + Math.round(8 * s), Math.round(30 * s), 1, cD);
  };

  // ======================= lycee =======================
  // a 1930s French lycée classroom (tall windows, wooden desks, stove, wall map, slate board). The teacher asks;
  // other boys' hands go up quickly (o.hands [1.0, 5.0]); a thin boy with round glasses sits still, frowning, writing
  // slowly; at o.worry (8.0) a small rain cloud of worry settles over him.
  K.lycee = (o) => {
    const smock = [mix(D.n4, D.steel[2], 0.3), mix(D.n3, D.steel[2], 0.25), mix(D.n4, D.paperD, 0.25), mix(D.n3, D.n4, 0.5)];
    const BOYS = [
      { x: 56, y: 200, s: 1.25, row: 1, k: 1, v: { skin: SKIN.lt, hair: mix(D.amber[2], D.n2, 0.45), top: smock[0], pants: D.n2, hs: "part", collar: D.cream, ph: 1 } },
      { x: 262, y: 200, s: 1.25, row: 1, k: 0, v: { skin: SKIN.md, hair: D.n0, top: smock[1], pants: D.n2, hs: "short", collar: D.cream, ph: 2 } },
      { x: 404, y: 200, s: 1.25, row: 1, k: 3, v: { skin: SKIN.lt, hair: mix(D.rust[2], D.n2, 0.4), top: smock[2], pants: D.n3, hs: "part", collar: D.cream, ph: 3 } },
      { x: 350, y: 280, s: 1.75, row: 0, k: 2, v: { skin: SKIN.lt, hair: mix(D.n0, D.amber[2], 0.3), top: smock[3], pants: D.n2, hs: "short", collar: D.cream, ph: 4 } },
      { x: 130, y: 280, s: 1.75, row: 0, thin: true, v: { skin: mix(SKIN.lt, D.paper, 0.2), hair: mix(D.n0, D.rust[2], 0.2), top: mix(D.n4, D.steel[2], 0.2), pants: D.n2, hs: "part", collar: D.cream, glasses: true, thin: true, ph: 5 } },
    ];
    const PROF = { skin: mix(SKIN.lt, D.rose[1], 0.15), hair: D.n6, top: mix(D.n2, D.steel[2], 0.25), pants: D.n2, hs: "bald", beard: true, lapel: D.n1, tie: mix(D.rust[2], D.n1, 0.3), ph: 0.3 };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 13.0), [h0, h1] = span(o, d, 13.0, "hands", 1.0, 5.0), tW = T("worry", 8.0);
      const raiseAt = (k) => lerp(h0, h1, k / 3);
      const pick = h1 + 0.6, down = (k) => (k === 2 ? P(t, pick + 0.6, 0.5, "io") : P(t, h1 + 1.6 + k * 0.25, 0.6, "io"));
      R(g, 0, 0, 640, 360, D.n2);
      // ---- far: plaster wall, wainscot, windows, map, stove, board ----
      PX.par(g, c, 0.45, () => {
        const pl = mix(D.paper, D.amber[2], 0.18);
        PX.vgrad(g, -60, -40, 760, 280, mix(pl, D.n2, 0.6), mix(pl, D.n4, 0.35), 8);
        A(g, 0.08, () => R(g, -60, -40, 320, 280, D.lamp));
        R(g, -60, 6, 760, 3, mix(D.paperD, D.n3, 0.4)); R(g, -60, 9, 760, 1, mix(D.n2, D.n3, 0.5));   // cornice
        const wd = wood(0.4);
        R(g, -60, 176, 760, 92, wd[1]); R(g, -60, 176, 760, 3, wd[0]); R(g, -60, 179, 760, 1, wd[2]);
        for (let x = -50; x < 700; x += 36) { R(g, x, 186, 28, 32, mix(wd[1], D.n0, 0.12)); R(g, x, 186, 28, 1, wd[2]); R(g, x, 217, 28, 1, wd[0]); }
        R(g, -60, 224, 760, 4, wd[2]);
        // tall arched windows, warm morning light
        const fr = [mix(D.paper, D.lampD, 0.3), mix(D.paperD, D.rust[2], 0.3), mix(D.n3, D.rust[2], 0.25)], sky = [mix(D.steel[0], D.lamp, 0.45), mix(D.lamp, D.cream, 0.4)];
        for (const wx of [-24, 76]) {
          windowDay(g, wx, 34, 60, 128, t, 20 + wx, fr, sky);
          ell(g, wx + 30, 34, 33, 14, fr[1]); clip(g, wx - 4, 14, 68, 20, () => { ell(g, wx + 30, 34, 30, 12, sky[0]); }); R(g, wx + 29, 22, 2, 12, fr[1]);
        }
        // pull-down wall map (generic landmasses), wooden rods
        const mx = 170, my = 40, mw = 92, mh = 70;
        R(g, mx - 3, my - 4, mw + 6, 4, wd[0]); R(g, mx - 3, my - 1, mw + 6, 1, wd[2]); PX.line(g, mx + mw / 2, my - 4, mx + mw / 2, my - 22, D.n3);
        R(g, mx, my, mw, mh, mix(D.paper, D.teal[0], 0.3)); R(g, mx, my, 2, mh, mix(D.paperD, D.teal[1], 0.3));
        const land = mix(D.moss[1], D.paperD, 0.45), land2 = mix(D.amber[1], D.paperD, 0.55);
        poly(g, [[mx + 14, my + 12], [mx + 34, my + 8], [mx + 44, my + 20], [mx + 38, my + 34], [mx + 46, my + 48], [mx + 30, my + 58], [mx + 22, my + 42], [mx + 10, my + 30]], land);
        poly(g, [[mx + 56, my + 14], [mx + 80, my + 16], [mx + 84, my + 30], [mx + 70, my + 40], [mx + 60, my + 32]], land2);
        poly(g, [[mx + 62, my + 48], [mx + 76, my + 46], [mx + 80, my + 60], [mx + 66, my + 62]], land);
        for (let i = 1; i < 4; i++) { R(g, mx, my + i * 17, mw, 1, mix(D.paper, D.teal[1], 0.4)); R(g, mx + i * 23, my, 1, mh, mix(D.paper, D.teal[1], 0.4)); }
        R(g, mx - 2, my + mh, mw + 4, 3, wd[1]); R(g, mx + mw / 2 - 2, my + mh + 3, 4, 4, D.n3);
        // cast-iron stove + pipe (warm firebox)
        const sx = 300, sy = 226;
        A(g, 0.4, () => ell(g, sx, sy, 22, 3, "#000000"));
        R(g, sx - 20, sy - 6, 40, 6, mix(D.n2, D.n1, 0.5)); R(g, sx - 16, sy - 44, 32, 38, D.n2); R(g, sx - 16, sy - 44, 3, 38, D.n4); R(g, sx + 12, sy - 44, 4, 38, D.n1);
        R(g, sx - 19, sy - 48, 38, 5, D.n3); R(g, sx - 19, sy - 48, 38, 1, D.n5);
        const fl = 0.75 + 0.25 * Math.sin(t * 7.3) * Math.sin(t * 3.1 + 1);
        R(g, sx - 8, sy - 32, 16, 12, D.n1); R(g, sx - 7, sy - 31, 14, 10, mix(D.rust[2], D.amber[1], 0.4 * fl)); R(g, sx - 7, sy - 24, 14, 3, mix(D.amber[1], D.lamp, fl * 0.6));
        for (let i = 0; i < 3; i++) R(g, sx - 5 + i * 5, sy - 31, 1, 10, D.n1);
        PX.glow(g, sx, sy - 24, 26, D.lampD, 0.2 * fl);
        R(g, sx - 4, sy - 76, 8, 28, D.n2); R(g, sx - 4, sy - 76, 2, 28, D.n4); R(g, sx - 4, sy - 80, 8, 4, D.n3);
        R(g, sx - 4, sy - 186, 8, 110, D.n2); R(g, sx - 4, sy - 186, 2, 110, D.n4);
        R(g, sx - 4, sy - 190, 140, 8, D.n2); R(g, sx - 4, sy - 190, 140, 2, D.n4);
        // slate board with chalk lines, chalk ledge
        const bx = 352, by = 34, bw = 214, bh = 106, sl = mix(D.n2, D.moss[2], 0.3);
        R(g, bx - 5, by - 5, bw + 10, bh + 10, wd[2]); R(g, bx - 4, by - 4, bw + 8, bh + 8, wd[1]); R(g, bx - 4, by - 4, bw + 8, 1, wd[0]);
        R(g, bx, by, bw, bh, sl); A(g, 0.2, () => { for (let i = 0; i < 6; i++) R(g, bx + 10 + i * 34, by + 4 + (i % 3) * 30, 22, 6, mix(sl, D.cream, 0.3)); });
        const ch = mix(D.cream, sl, 0.2);
        scrib(g, bx + 12, by + 14, 120, 1, ch, 31, 3); scrib(g, bx + 12, by + 30, 150, 1, ch, 32, 3); scrib(g, bx + 18, by + 48, 90, 1, ch, 33, 3);
        PX.line(g, bx + 18, by + 66, bx + 70, by + 66, ch); scrib(g, bx + 78, by + 66, 60, 1, ch, 34, 2);
        for (let a = 0; a < 60; a++) R(g, Math.round(bx + 172 + Math.cos(a / 60 * TAU) * 18), Math.round(by + 50 + Math.sin(a / 60 * TAU) * 18), 1, 1, ch);
        PX.line(g, bx + 172, by + 50, bx + 186, by + 39, ch);
        R(g, bx - 6, by + bh + 4, bw + 12, 4, wd[0]); R(g, bx + 20, by + bh + 2, 6, 2, D.cream); R(g, bx + 30, by + bh + 2, 10, 3, mix(D.paperD, D.n4, 0.3));
        // ceiling lamp (unlit, morning)
        for (const lx of [210, 470]) { PX.line(g, lx, -40, lx, 16, D.n3); ell(g, lx, 20, 8, 4, mix(D.paper, D.n5, 0.4)); R(g, lx - 8, 20, 17, 2, mix(D.paperD, D.n4, 0.4)); }
      });
      // ---- floor: worn planks + sun patches ----
      PX.par(g, c, 0.7, () => {
        const fw = wood(0.3);
        PX.vgrad(g, -60, 228, 760, 180, mix(fw[1], D.n3, 0.25), mix(fw[2], D.n2, 0.2), 6);
        for (let k = 0; k < 9; k++) { const y = 232 + k * k * 2 + k * 5; R(g, -60, Math.round(y), 760, 1, mix(fw[2], D.n1, 0.3)); for (let j = 0; j < 8; j++) R(g, Math.round(-40 + hash(k, j) * 720), Math.round(y) - 6 - k, 1, 6 + k, mix(fw[2], D.n1, 0.2)); }
        A(g, 0.2, () => { poly(g, [[0, 228], [56, 228], [176, 330], [90, 330]], D.lamp); poly(g, [[100, 228], [156, 228], [280, 330], [190, 330]], D.lamp); });
        // estrade (teacher's platform)
        R(g, 444, 244, 260, 12, fw[1]); R(g, 444, 244, 260, 1, fw[0]); R(g, 444, 255, 260, 2, fw[2]); A(g, 0.35, () => R(g, 444, 257, 260, 3, "#000000"));
      });
      A(g, 0.07, () => { poly(g, [[-24, 20], [36, 20], [176, 330], [90, 330]], D.lamp); poly(g, [[76, 20], [136, 20], [280, 330], [190, 330]], D.lamp); });
      // ---- people ----
      const drawBoy = (b) => {
        const s = b.s; let st;
        if (b.thin) {
          const wor = t >= tW;
          const glance = t > h0 + 1.2 && t < h0 + 2.6;   // looks up at the raised hands, then back to his page
          st = { ex: glance ? "think" : "frown", lk: glance ? -1 : 1, write: glance ? 0 : 0.45, wspd: 1.6, lean: wor ? 4 : glance ? 0 : 2 };
          if (PX.blink(t + 0.4, 3.7, 0.05)) st.ex = "shut";
        } else {
          const tr = raiseAt(b.k), up = P(t, tr, 0.18, "back") * (1 - down(b.k));
          st = { arm: up, ex: up > 0.1 ? "eager" : "think", lk: up > 0.1 ? -1 : 1, lean: up > 0.1 ? -1 : 1, write: up > 0.1 ? 0 : 0.6 };
          if (up > 0.9 && b.k !== 2) st.arm = 1 + Math.sin(t * 9 + b.k) * 0.04;
          if (b.k === 2 && t > pick + 0.3) { st.ex = t < pick + 3.2 && PX.blink(t, 0.25, 0.5) ? "talk" : "smile"; st.lk = 0; st.write = 0; }   // answering
        }
        const fig = sitter(g, b.x, b.y, s, b.v, st, t);
        const k = fig.body();
        const wd = wood(b.row ? 0.25 : 0.05);
        // old slanted desk with an inkwell
        const dx = Math.round(b.x + 9 * s), dy = Math.round(b.y - 10 * s), dw = Math.round(44 * s);
        deskSide(g, dx, dy, dw, s, wd, b.thin ? mix(D.cream, D.paper, 0.3) : mix(D.paper, D.cream, 0.2));
        R(g, dx + dw - Math.round(9 * s), dy - 2, Math.round(4 * s), 2, D.n1); R(g, dx + dw - Math.round(9 * s), dy - 2, 1, 1, D.n5);
        if (b.thin) {   // his notebook: a slowly growing line of pencil on the visible page edge
          const pg = clamp((t - 0.3) / 12, 0, 1);
          R(g, dx + Math.round(6 * s), dy - 1, Math.round(16 * s), 1, mix(D.cream, D.paper, 0.2));
          R(g, dx + Math.round(6 * s), dy - 1, Math.round(16 * s * pg), 1, mix(D.ink, D.paper, 0.4));
        }
        fig.arm(k);
        return k;
      };
      PX.par(g, c, 0.8, () => BOYS.filter((b) => b.row === 1).forEach(drawBoy));
      // the professor on the estrade behind his desk
      PX.par(g, c, 0.86, () => {
        const pAsk = 0.4 + 0.6 * Math.abs(Math.sin(t * 0.9));
        const arm = pmix(pmix(POSE.down, POSE.open, pAsk * (t < h1 ? 1 : 0.6)), POSE.point, P(t, pick, 0.4, "out"));
        const fig = standing(g, 562, 245, 1.2, PROF, -1, arm, 1, "calm", 0, t);
        if (t < h0 + 0.4 && Math.sin(t * 20) > 0) R(g, fig.head[0] - 6, fig.head[1] + 6, 2, 1, mix(D.n0, D.rust[2], 0.4));
        const wd = wood(0.15);
        R(g, 470, 196, 66, 6, wd[0]); R(g, 472, 202, 62, 42, wd[1]); R(g, 472, 202, 62, 1, wd[2]); R(g, 478, 208, 50, 30, mix(wd[1], D.n0, 0.1)); R(g, 478, 208, 50, 1, wd[2]);
        R(g, 478, 190, 18, 6, mix(D.rust[2], D.n2, 0.2)); R(g, 478, 190, 18, 1, D.paper); R(g, 502, 192, 14, 4, D.paper); R(g, 502, 192, 14, 1, D.cream);
      });
      let thinK = null;
      PX.par(g, c, 1.0, () => BOYS.filter((b) => b.row === 0).forEach((b) => { const k = drawBoy(b); if (b.thin) thinK = k; }));
      // the worry cloud over the thin boy
      PX.par(g, c, 1.0, () => {
        const thin = BOYS[4], wk = P(t, tW, 0.7, "out");
        const hx0 = Math.round(thin.x + 4 * thin.s), hy0 = Math.round(thin.y + ((thinK ? thinK.hy : -38) - 8) * thin.s);
        rainCloud(g, hx0 + 2, hy0 - 20, wk, t, hy0 - 2, 1.45);
        pool(g, hx0, hy0 + 20, 50, 300, 0.28 * wk);
      });
      // foreground: corner of a near desk with an inkwell, blurred dark
      PX.par(g, c, 1.25, () => {
        const fw = wood(0.6);
        poly(g, [[548, 310], [720, 300], [720, 420], [560, 420]], fw[2]); R(g, 548, 308, 180, 5, fw[1]); R(g, 548, 308, 180, 1, fw[0]);
        R(g, 590, 298, 12, 10, D.n1); R(g, 592, 296, 8, 2, D.n4); R(g, 592, 300, 2, 4, mix(D.glass, D.n3, 0.5));
      });
      dust(g, 41, 40, t, [10, 40, 260, 270], D.lamp, 0.4);
      PX.vignette(g, 0.55);
    };
  };

  // ======================= medal =======================
  // a gold medal with a laurel relief on a velvet stand in a glass case, under a spotlight; a slow sheen crosses it.
  // At o.plaque (1.0) a small brass plaque "1950" in front of it catches its own light.
  K.medal = (o) => {
    const GOLD = [mix(D.amber[2], D.n0, 0.55), mix(D.amber[2], D.n0, 0.2), D.amber[2], mix(D.amber[2], D.amber[1], 0.5), D.amber[1], D.amber[0], mix(D.amber[0], D.cream, 0.55)];
    const gi = (v) => GOLD[clamp(Math.round(v), 0, GOLD.length - 1)];
    const MX = 320, MY = 150, MR = 62;
    // laurel leaves: [x, y, angle] along two arcs
    const LEAVES = [];
    for (const sd of [-1, 1]) for (let i = 0; i < 26; i++) {
      const a = Math.PI / 2 + sd * (0.32 + i * 0.088), side = i % 2 ? 1 : -1, rr = 43 + side * 3.5;
      const tx = -Math.sin(a) * sd, ty = Math.cos(a) * sd;   // tangent, pointing up the wreath
      LEAVES.push([MX + Math.cos(a) * rr, MY + Math.sin(a) * rr, Math.atan2(ty, tx) + side * sd * 0.55]);
    }
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 4.0), tP = T("plaque", 1.0);
      const pl = P(t, tP, 0.7, "io");
      R(g, 0, 0, 640, 360, D.n0);
      // ---- far: velvet backdrop with folds ----
      const vel = mix(D.rust[2], D.n0, 0.5);
      PX.par(g, c, 0.3, () => {
        for (let x = -60; x < 700; x++) { const f = Math.sin(x * 0.075) * 0.5 + Math.sin(x * 0.19 + 1) * 0.25; R(g, x, -40, 1, 330, mix(vel, f > 0 ? mix(D.rust[2], D.n1, 0.35) : D.n0, Math.abs(f) * 0.6)); }
        A(g, 0.5, () => { for (let x = -60; x < 700; x += 2) R(g, x, -40 + ((x / 2) % 3), 1, 330, mix(vel, D.n0, 0.4)); });
      });
      // ---- velvet shelf (the surface it stands on) ----
      PX.par(g, c, 0.7, () => {
        PX.vgrad(g, -60, 236, 760, 180, mix(vel, D.rust[1], 0.2), mix(vel, D.n0, 0.6), 7);
        R(g, -60, 236, 760, 1, mix(vel, D.rose[1], 0.35));
        for (let i = 0; i < 260; i++) R(g, Math.round(-60 + hash(i, 1) * 760), Math.round(238 + hash(1, i) * 120), 1, 1, mix(vel, D.n0, 0.5));
      });
      // spotlight from above: pool on backdrop + shelf
      PX.glow(g, MX, MY, 150, mix(D.lampD, D.rust[1], 0.3), 0.3);
      A(g, 0.07, () => poly(g, [[MX - 24, -10], [MX + 24, -10], [MX + 120, 250], [MX - 120, 250]], D.lamp));
      A(g, 0.22, () => ell(g, MX, 252, 120, 14, mix(D.lamp, D.rust[1], 0.4)));
      // ---- the medal ----
      PX.par(g, c, 1.0, () => {
        // shadow on the backdrop + stand
        A(g, 0.5, () => PX.circle(g, MX + 7, MY + 8, MR, "#000000"));
        const st = wood(0.45);
        poly(g, [[MX - 30, 236], [MX + 30, 236], [MX + 22, 214], [MX - 22, 214]], st[1]); R(g, MX - 22, 214, 44, 2, st[0]); R(g, MX - 30, 235, 60, 1, st[2]);
        R(g, MX - 4, MY + MR - 4, 8, 6, mix(D.amber[2], D.n1, 0.3));
        // edge thickness (bottom-right), then shaded face, per pixel
        PX.circle(g, MX + 2, MY + 3, MR, GOLD[0]); PX.circle(g, MX + 1, MY + 2, MR, GOLD[1]);
        const sweep = ((t - 0.2) / 2.6) % 1.6, sx = lerp(-1.4, 1.6, clamp(sweep, 0, 1));
        for (let y = -MR; y <= MR; y++) {
          const w = Math.floor(Math.sqrt(MR * MR - y * y));
          for (let x = -w; x <= w; x++) {
            const r = Math.sqrt(x * x + y * y) / MR, nx = x / MR, ny = y / MR;
            let v;
            if (r > 0.9) v = 3.2 - (nx + ny) * 2.6;                                  // bevelled rim, lit from the upper left
            else if (r > 0.86) v = 1.6 + (nx + ny) * 1.6;                            // inner step (shadowed upper left)
            else v = 2.7 - (nx + ny) * 0.9 + (r > 0.78 ? -0.4 : 0);                    // field
            const band = Math.abs((nx + ny * 0.6) - sx);
            if (band < 0.16) v += (1 - band / 0.16) * 2.2;
            g.fillStyle = gi(v); g.fillRect(MX + x, MY + y, 1, 1);
          }
        }
        // beaded border
        for (let i = 0; i < 64; i++) { const a = (i / 64) * TAU, x = Math.round(MX + Math.cos(a) * (MR * 0.82)), y = Math.round(MY + Math.sin(a) * (MR * 0.82)); R(g, x + 1, y + 1, 1, 1, GOLD[1]); R(g, x, y, 1, 1, GOLD[5]); }
        // laurel relief: shadow, base, highlight
        const leaf = (x, y, a, col, dx, dy) => { const ca = Math.cos(a), sa = Math.sin(a); for (let k = -5; k <= 5; k++) { const wdt = 1.9 * Math.sqrt(Math.max(0, 1 - (k / 5.6) ** 2)) - 0.2; for (let j = -Math.ceil(wdt); j <= Math.ceil(wdt); j++) { if (Math.abs(j) > wdt) continue; g.fillStyle = col; g.fillRect(Math.round(x + ca * k - sa * j + dx), Math.round(y + sa * k + ca * j + dy), 1, 1); } } };
        for (const sd of [-1, 1]) { for (let i = 0; i < 24; i++) { const a = Math.PI / 2 + sd * (0.3 + i * 0.1); R(g, Math.round(MX + Math.cos(a) * 43) + 1, Math.round(MY + Math.sin(a) * 43) + 1, 1, 1, GOLD[1]); R(g, Math.round(MX + Math.cos(a) * 43), Math.round(MY + Math.sin(a) * 43), 1, 1, GOLD[4]); } }
        for (const [x, y, a] of LEAVES) leaf(x, y, a, GOLD[1], 1, 1);
        for (const [x, y, a] of LEAVES) leaf(x, y, a, GOLD[4], 0, 0);
        for (const [x, y, a] of LEAVES) { const ca = Math.cos(a), sa = Math.sin(a); for (let k = -3; k <= 3; k++) R(g, Math.round(x + ca * k), Math.round(y + sa * k), 1, 1, k < 0 ? GOLD[3] : GOLD[2]); R(g, Math.round(x - ca * 2 - 1), Math.round(y - sa * 2 - 1), 1, 1, GOLD[6]); }
        // ribbon knot at the bottom of the wreath
        R(g, MX - 4, MY + 42, 9, 4, GOLD[1]); R(g, MX - 4, MY + 41, 8, 3, GOLD[4]); R(g, MX - 3, MY + 41, 3, 1, GOLD[6]);
        // central emblem: an eight-point star in relief (generic)
        const star = (col, dx, dy, k) => { const pts = []; for (let i = 0; i < 16; i++) { const a = (i / 16) * TAU - Math.PI / 2, rr = (i % 2 ? 9 : 22) * k; pts.push([MX + dx + Math.cos(a) * rr, MY - 2 + dy + Math.sin(a) * rr]); } poly(g, pts, col); };
        star(GOLD[1], 2, 2, 1); star(GOLD[3], 0, 0, 1); star(GOLD[5], -1, -1, 0.55); star(GOLD[4], 0, 0, 0.45);
        for (let i = 0; i < 8; i++) { const a = (i / 8) * TAU - Math.PI / 2; PX.line(g, MX, MY - 2, MX + Math.cos(a) * 20, MY - 2 + Math.sin(a) * 20, i < 2 || i > 6 ? GOLD[6] : GOLD[2]); }
        PX.circle(g, MX, MY - 2, 3, GOLD[5]); R(g, MX - 1, MY - 4, 2, 1, GOLD[6]);
        // a sparkle on the rim at the end of each sweep
        const spk = clamp(1 - Math.abs(sweep - 1.05) / 0.12, 0, 1);
        if (spk > 0) A(g, spk, () => { const x = MX + 38, y = MY - 44; R(g, x - 3, y, 7, 1, D.cream); R(g, x, y - 3, 1, 7, D.cream); R(g, x - 1, y - 1, 3, 3, D.cream); });
      });
      // ---- brass plaque on a little plinth ----
      PX.par(g, c, 1.08, () => {
        const px = 270, py = 270, pw = 100, ph = 30, st = wood(0.55).map((v) => mix(v, D.n0, 0.6 * (1 - pl)));
        A(g, 0.5, () => ell(g, px + pw / 2, py + ph + 14, 64, 4, "#000000"));
        poly(g, [[px - 10, py + ph + 14], [px + pw + 10, py + ph + 14], [px + pw + 4, py - 4], [px - 4, py - 4]], st[1]); R(g, px - 4, py - 4, pw + 8, 1, st[0]); R(g, px - 10, py + ph + 13, pw + 20, 1, st[2]);
        const br = [mix(D.amber[2], D.n1, 0.25), mix(D.amber[2], D.amber[1], 0.3), mix(D.amber[1], D.lamp, 0.4)].map((v) => mix(v, D.n0, 0.9 * (1 - pl)));
        R(g, px, py, pw, ph, br[1]); R(g, px, py, pw, 1, br[2]); R(g, px, py, 1, ph, br[2]); R(g, px + pw - 1, py, 1, ph, br[0]); R(g, px, py + ph - 1, pw, 1, br[0]);
        for (const [x, y] of [[px + 3, py + 3], [px + pw - 5, py + 3], [px + 3, py + ph - 5], [px + pw - 5, py + ph - 5]]) { R(g, x, y, 2, 2, br[0]); R(g, x, y, 1, 1, br[2]); }
        R(g, px + 8, py + 6, pw - 16, 1, br[0]); R(g, px + 8, py + ph - 7, pw - 16, 1, br[2]);
        PX.text(g, "1950", px + pw / 2 + 1, py + 12, { align: "center", col: br[2], size: 8 });
        PX.text(g, "1950", px + pw / 2, py + 11, { align: "center", col: mix(mix(D.amber[2], D.n0, 0.55), D.n0, 0.9 * (1 - pl)), size: 8 });
        // plaque sheen when its light comes up
        const sp = clamp((t - tP - 0.3) / 0.9, 0, 1);
        if (sp > 0 && sp < 1) A(g, 0.5 * Math.sin(sp * Math.PI), () => clip(g, px, py, pw, ph, () => poly(g, [[px + sp * 140 - 30, py], [px + sp * 140 - 18, py], [px + sp * 140 - 34, py + ph], [px + sp * 140 - 46, py + ph]], D.cream)));
        if (pl > 0) PX.glow(g, px + pw / 2, py + ph / 2, 60, D.lampD, 0.14 * pl);
      });
      // glass case: frame corners and faint reflections, foreground
      PX.par(g, c, 1.3, () => {
        A(g, 0.07, () => { poly(g, [[60, -20], [92, -20], [40, 380], [8, 380]], D.cream); poly(g, [[104, -20], [112, -20], [60, 380], [52, 380]], D.cream); poly(g, [[560, -20], [574, -20], [610, 380], [596, 380]], D.cream); });
        R(g, -40, -40, 64, 440, D.n1); R(g, 23, -40, 1, 440, D.n4); R(g, 616, -40, 64, 440, D.n1); R(g, 616, -40, 1, 440, D.n4);
        R(g, -40, 338, 720, 60, D.n1); R(g, -40, 338, 720, 1, D.n4);
      });
      dust(g, 71, 26, t, [230, 0, 180, 230], D.lamp, 0.4);
      PX.vignette(g, 0.6);
    };
  };

  // ---------- divers ----------
  // freediver along an axis: (x, y) head centre, a = direction feet->head (rad), kick phase, col = suit
  const diver = (g, x, y, a, kick, col, skin, fin, sc) => {
    sc = sc || 1;
    const ux = Math.cos(a), uy = Math.sin(a), vx = -uy, vy = ux;
    const p = (du, dv) => [x + (ux * du + vx * dv) * sc, y + (uy * du + vy * dv) * sc];
    const [cL, cc, cD] = sh3(col), [fL, f, fD] = sh3(fin);
    const S = (a0, a1, w, c0) => seg(g, a0[0], a0[1], a1[0], a1[1], Math.max(1, Math.round(w * sc)), c0);
    const k1 = Math.sin(kick) * 3, k2 = -k1;
    // far leg + fin
    S(p(-21, -1), p(-33, -2 + k2 * 0.5), 4, cD); S(p(-33, -2 + k2 * 0.5), p(-42, -2 + k2), 3, cD);
    poly(g, [p(-41, -4 + k2), p(-41, 1 + k2), p(-55, 2 + k2 * 1.8), p(-55, -6 + k2 * 1.8)].map(([px, py]) => [px, py]), fD);
    // torso
    S(p(-6, 0), p(-21, 0), 7, cc); S(p(-6, -3), p(-21, -3), 1, cL); S(p(-6, 3), p(-21, 3), 1, cD);
    // near leg + fin
    S(p(-21, 1), p(-33, 1 + k1 * 0.5), 4, cc); S(p(-33, 1 + k1 * 0.5), p(-42, 1 + k1), 3, cc);
    poly(g, [p(-41, -2 + k1), p(-41, 3 + k1), p(-56, 6 + k1 * 1.8), p(-56, -3 + k1 * 1.8)], f); S(p(-43, -2 + k1), p(-54, -3 + k1 * 1.8), 1, fL);
    // arms stretched ahead of the head
    S(p(-7, -3), p(9, -2), 3, cD); S(p(-7, 3), p(9, 2), 3, cc); S(p(9, -2), p(11, 0), 2, skin);
    // head: hood + mask
    const [hx0, hy0] = p(0, 0);
    PX.circle(g, Math.round(hx0), Math.round(hy0), Math.round(5 * sc), cD); PX.circle(g, Math.round(hx0 - ux), Math.round(hy0 - uy), Math.round(4 * sc), cc);
    const [mx0, my0] = p(1, 3.2), mw = Math.round(5 * sc);
    R(g, Math.round(mx0) - 3, Math.round(my0) - 3, mw + 1, mw + 1, D.n1); R(g, Math.round(mx0) - 2, Math.round(my0) - 2, mw - 1, mw - 1, D.glass); R(g, Math.round(mx0) - 2, Math.round(my0) - 2, 1, 1, D.cream);
    const [sk0, sk1] = p(-2, 5); R(g, Math.round(sk0) - 1, Math.round(sk1) - 1, 3, 2, skin);
  };

  // ======================= deep_quick =======================
  // a lake in cross-section: one swimmer splashes fast at the surface (o.quick 0.5), the other dives slowly down into
  // the deep where a shaft of light falls (o.deep 2.0). Labels "QUICK" and "DEEP".
  K.deep_quick = (o) => {
    const WL = 112;
    const r0 = PX.rnd(5), ROCKS = [], WEEDS = [];
    for (let i = 0; i < 26; i++) ROCKS.push([r0() * 680 - 20, r0(), 3 + r0() * 9]);
    for (let i = 0; i < 22; i++) WEEDS.push([r0() * 680 - 20, 14 + r0() * 30, r0() * 6]);
    const bed = (x) => 262 + (x / 640) * 70 + Math.sin(x * 0.03) * 6;   // shallow left, deep right
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 6.0), tQ = T("quick", 0.5), tD = T("deep", 2.0);
      const qk = P(t, tQ, 0.3, "out"), dur = (3.8 * d) / 6.0, dv = E((t - tD) / dur, "io"), dive = P(t, tD, 0.6, "io");
      R(g, 0, 0, 640, 360, D.n2);
      // ---- sky + far shore ----
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -60, -40, 760, WL + 42, mix(D.steel[0], D.steel[1], 0.35), mix(D.cream, D.lamp, 0.35), 8);
        A(g, 0.5, () => { ell(g, 150, 30, 40, 4, D.cream); ell(g, 182, 26, 26, 4, D.cream); ell(g, 470, 46, 52, 3, D.cream); });
        const hill = mix(D.steel[2], D.moss[2], 0.35);
        poly(g, [[-60, WL + 40], [-60, 78], [80, 66], [210, 80], [330, 70], [470, 84], [600, 68], [700, 74], [700, WL + 40]], mix(hill, D.cream, 0.35));
        const fz = mix(D.moss[2], D.steel[2], 0.5), fzD = mix(fz, D.n2, 0.3);
        R(g, -60, WL - 8, 760, 48, fzD);
        for (let x = -60; x < 700; x += 5 + Math.floor(hash(x, 2) * 5)) { const h = 12 + hash(x, 1) * 16 + 5 * Math.sin(x * 0.015); for (let k = 0; k < h; k++) { const w = Math.round((k / h) * 4.5) + ((k % 4) === 3 ? 1 : 0); R(g, x - w, WL - h - 4 + k, 2 * w + 1, 1, hash(x, 3) < 0.5 ? fz : fzD); } }
      });
      PX.par(g, c, 0.5, () => {
        // near reeds on the left bank
        R(g, -60, WL - 6, 150, 46, mix(D.moss[2], D.n2, 0.4));
        for (let i = 0; i < 26; i++) { const x = -50 + i * 5.3, h = 10 + hash(i, 5) * 14, sw = Math.sin(t * 1.3 + i) * 1.5; PX.line(g, x, WL, x + sw, WL - h, i % 3 ? D.moss[2] : mix(D.moss[1], D.paperD, 0.3)); if (i % 4 === 0) R(g, Math.round(x + sw) - 1, Math.round(WL - h) - 3, 2, 4, mix(D.rust[2], D.n2, 0.3)); }
      });
      // ---- underwater body ----
      const wTop = mix(mix(D.teal[1], D.steel[1], 0.25), D.n2, 0.15), wBot = mix(D.teal[2], D.n0, 0.72);
      PX.vgrad(g, -60, WL, 760, 300, wTop, wBot, 10);   // water body at world depth so the surface line never splits
      PX.par(g, c, 0.6, () => {
        // distant rock silhouettes in the haze
        A(g, 0.5, () => { poly(g, [[-60, 360], [-60, 250], [40, 230], [120, 270], [200, 300], [200, 360]], mix(D.teal[2], D.n1, 0.5)); poly(g, [[560, 360], [600, 260], [700, 240], [700, 360]], mix(D.teal[2], D.n1, 0.55)); });
      });
      // light shafts from the surface (drifting) + the deep shaft over the right
      for (let i = 0; i < 6; i++) {
        const x0 = 40 + i * 110 + Math.sin(t * 0.4 + i) * 10, w = 12 + (i % 3) * 8, fl = 0.05 + 0.025 * Math.sin(t * 1.1 + i * 2);
        A(g, fl, () => poly(g, [[x0, WL], [x0 + w, WL], [x0 + w + 70, 360], [x0 + 40, 360]], D.cream));
      }
      A(g, 0.09 + 0.05 * dive, () => poly(g, [[436, WL], [470, WL], [536, 360], [482, 360]], D.lamp));
      // caustic shimmer under the surface
      for (let x = -40; x < 680; x += 3) { const yy = WL + 3 + Math.round((Math.sin(x * 0.11 + t * 2.2) + Math.sin(x * 0.047 - t * 1.4)) * 2); A(g, 0.25, () => R(g, x, yy, 2, 1, D.teal[0])); }
      // lake bed
      PX.par(g, c, 0.85, () => {
        g.fillStyle = mix(D.n2, D.teal[2], 0.35);
        for (let x = -60; x < 700; x++) g.fillRect(x, Math.round(bed(x)), 1, 400);
        for (let x = -60; x < 700; x += 2) R(g, x, Math.round(bed(x)), 2, 1, mix(D.paperD, D.teal[2], 0.55));
        for (const [x, k, r] of ROCKS) { const y = bed(x) + 2; ell(g, x, y, r, r * 0.55, mix(D.n3, D.teal[2], 0.3 + k * 0.2)); ell(g, x - 1, y - 1, r * 0.7, r * 0.3, mix(D.n4, D.teal[1], 0.3)); }
        for (const [x, h, ph] of WEEDS) { const y = bed(x); for (let k = 0; k < h; k++) { const sx = Math.sin(t * 1.2 + ph + k * 0.18) * k * 0.12; R(g, Math.round(x + sx), Math.round(y - k), 2, 1, k % 5 ? mix(D.moss[2], D.teal[2], 0.3) : mix(D.moss[1], D.teal[2], 0.3)); } }
        // the lit spot in the deep: a pale stone in a pool of light
        const lx = 500, ly = bed(500);
        A(g, 0.22 + 0.12 * dive, () => ell(g, lx, ly + 2, 34, 6, D.lamp));
        ell(g, lx + 4, ly - 1, 6, 3, mix(D.paper, D.teal[0], 0.3)); R(g, lx + 1, ly - 3, 4, 1, D.cream);
      });
      // plankton drifting
      PX.particles(g, 81, 60, t, [0, WL + 6, 640, 250], { vy: -2, vx: 1.5, col: D.teal[0], a: 0.45, tw: 1.1 });
      // ---- the deep diver: floats at the surface, then dives and sinks slowly toward the light ----
      PX.par(g, c, 1.0, () => {
        const dx = lerp(452, 496, dv) + 34 * (1 - dive), dy = lerp(WL + 8, 282, dv), ang = lerp(0, Math.PI / 2, dive) + Math.sin(t * 0.7) * 0.04 * dive;
        const kick = t * (dive > 0 ? 2.2 : 1.0);
        if (dive <= 0) {   // resting at the surface, face down, gentle bob
          diver(g, dx, WL + 5 + Math.round(Math.sin(t * 1.8)), 0, kick * 0.5, mix(D.steel[2], D.n2, 0.3), SKIN.md, mix(D.teal[1], D.n2, 0.3), 1.35);
        } else diver(g, dx, dy, ang, kick, mix(D.steel[2], D.n2, 0.3), SKIN.md, mix(D.teal[1], D.n2, 0.3), 1.35);
        // bubbles rising from the diver
        if (dive > 0) for (let i = 0; i < 6; i++) {
          const ph = frac(t * 0.45 + i / 6), by0 = dy - 6, by = lerp(by0, WL + 4, ph), bx = dx + 3 + Math.sin(ph * 9 + i) * 3;
          if (by < by0) A(g, 0.8 * (1 - ph * 0.6), () => { const rr = i % 3 === 0 ? 2 : 1; PX.circle(g, Math.round(bx), Math.round(by), rr, D.teal[0]); R(g, Math.round(bx) - 1, Math.round(by) - rr, 1, 1, D.cream); });
        }
      });
      // ---- the quick swimmer: thrashes at the surface ----
      PX.par(g, c, 1.0, () => {
        const sx = 170 + Math.sin(t * 1.5) * 6 * qk, sy = WL + 2, Z = 1.45, q = (v) => Math.round(v * Z);
        const spd = lerp(2.5, 13, qk), ph = t * spd;
        const suit = mix(D.rust[2], D.n2, 0.25), [sL, s0, sD] = sh3(suit), skin = SKIN.lt, cap = mix(D.amber[1], D.paperD, 0.3);
        // body under the surface (slightly tilted), legs kicking
        clip(g, -60, WL, 760, 300, () => {
          seg(g, sx - q(4), sy + q(4), sx - q(24), sy + q(8), q(7), s0); seg(g, sx - q(4), sy + q(1), sx - q(24), sy + q(5), 1, sL);
          const k1 = Math.sin(ph * 1.3) * 5, k2 = -k1;
          seg(g, sx - q(24), sy + q(7), sx - q(40), sy + q(9 + k1), q(4), sD); seg(g, sx - q(24), sy + q(9), sx - q(40), sy + q(11 + k2), q(4), s0);
          poly(g, [[sx - q(39), sy + q(7 + k1)], [sx - q(39), sy + q(12 + k1)], [sx - q(51), sy + q(13 + k1 * 1.6)], [sx - q(51), sy + q(6 + k1 * 1.6)]], mix(D.amber[2], D.n2, 0.3));
        });
        // arms windmilling (front crawl): near and far arm half a cycle apart, big arcs above the water
        for (const [off, col] of [[Math.PI, sD], [0, s0]]) {
          const a = ph + off, ex0 = sx + q(4) + Math.cos(a) * q(15), ey0 = sy - q(6) + Math.sin(a) * q(13);
          const elx = (sx + ex0) / 2 + Math.sin(a) * 3, ely = (sy - q(2) + ey0) / 2 - q(3);
          seg(g, sx, sy - q(1), elx, ely, q(3), col); seg(g, elx, ely, ex0, ey0, q(3), col);
          R(g, Math.round(ex0) - 2, Math.round(ey0) - 2, 4, 4, skin);
        }
        // head with a swim cap + goggles
        const hb = Math.round(Math.sin(ph) * 1.5 * qk), hx1 = sx + q(5), hy1 = sy - q(4) + hb;
        PX.circle(g, hx1, hy1, q(5), skin); PX.circle(g, hx1 - 1, hy1 - 2, q(5), cap); R(g, hx1 - q(6), hy1, q(12), 2, cap); R(g, hx1 - q(3), hy1 - q(5), q(4), 1, mix(cap, D.cream, 0.4));
        R(g, hx1 + 2, hy1 + 1, 5, 3, D.n1); R(g, hx1 + 3, hy1 + 2, 3, 1, D.glass); R(g, hx1 + 4, hy1 + 5, 2, 1, mix(skin, D.n0, 0.4));
        // splash droplets: bursts born every 1/6 s while thrashing
        if (qk > 0) for (let b = 0; b < 6; b++) {
          const tb = Math.floor(t * 8) / 8 - b / 8, age = t - tb; if (tb < tQ) continue;
          for (let i = 0; i < 12; i++) {
            const vx = (hash(tb * 60, i) - 0.5) * 80, vy = -50 - hash(i, tb * 60) * 60, x = sx + 12 + (hash(i + 3, tb * 7) - 0.5) * 40 + vx * age, y = sy - 2 + vy * age + 160 * age * age;
            if (y < sy + 2) A(g, clamp(1 - age / 0.7, 0, 1), () => R(g, Math.round(x), Math.round(y), i % 3 ? 2 : 1, i % 3 ? 2 : 3, i % 4 ? D.cream : D.teal[0]));
          }
        }
        // foam + rings on the surface
        A(g, 0.85 * qk, () => { for (let i = 0; i < 18; i++) R(g, Math.round(sx - 36 + hash(i, Math.floor(t * 10)) * 80), sy - 2 + (i % 3), 2 + (i % 4), 1 + (i % 2), D.cream); });
        for (let k = 0; k < 3; k++) { const rk = frac(t * (qk > 0 ? 1.4 : 0.4) + k / 3); A(g, (1 - rk) * 0.5, () => { const rx = 14 + rk * 50; R(g, Math.round(sx - rx), WL + 1, 6, 1, D.cream); R(g, Math.round(sx + rx), WL + 1, 6, 1, D.cream); }); }
      });
      // surface line (from above: light band; from below: silvery)
      for (let x = -40; x < 680; x++) { const yy = WL + Math.round(Math.sin(x * 0.08 + t * 1.6) * 0.8); R(g, x, yy, 1, 1, mix(D.cream, D.teal[0], 0.3)); }
      A(g, 0.35, () => R(g, -40, WL + 1, 720, 1, D.teal[0]));
      // foreground weeds swaying in the bottom corners
      PX.par(g, c, 1.25, () => {
        for (const [bx, n] of [[-10, 7], [606, 6]]) for (let i = 0; i < n; i++) {
          const x0 = bx + i * 7, h = 60 + hash(i, bx) * 50;
          for (let k = 0; k < h; k++) { const sw = Math.sin(t * 0.9 + i + k * 0.05) * k * 0.15; R(g, Math.round(x0 + sw), 372 - k, 3, 1, k % 6 ? mix(D.moss[2], D.n0, 0.45) : mix(D.moss[2], D.n0, 0.25)); }
        }
      });
      // depth darkens toward the bottom
      { const gr = g.createLinearGradient(0, 170, 0, 360); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.5)"); g.fillStyle = gr; g.fillRect(-60, 170, 760, 200); }
      PX.vignette(g, 0.45);
      label(g, "QUICK", 176, 58, t, tQ + 0.2);
      label(g, "DEEP", 540, 226, t, tD + 0.8);
    };
  };

  // leaf: from stem (x, y) along angle, length, half width; optional midrib colour
  const leafP = (g, x, y, ang, len, wid, col, rib, lit) => {
    const ca = Math.cos(ang), sa = Math.sin(ang), pts = [], n = 8;
    for (let k = 0; k <= n; k++) { const u = k / n, w = wid * Math.pow(Math.sin(Math.PI * Math.min(u * 1.15, 1)), 0.8); pts.push([x + ca * len * u - sa * w, y + sa * len * u + ca * w]); }
    for (let k = n; k >= 0; k--) { const u = k / n, w = wid * Math.pow(Math.sin(Math.PI * Math.min(u * 1.15, 1)), 0.8); pts.push([x + ca * len * u + sa * w, y + sa * len * u - ca * w]); }
    poly(g, pts, col);
    if (lit) poly(g, pts.slice(0, n + 1).concat([[x + ca * len, y + sa * len], [x, y]]), lit);
    if (rib) PX.line(g, x, y, x + ca * len * 0.92, y + sa * len * 0.92, rib);
  };
  // fern / palm frond: curved midrib with leaflets
  const frond = (g, x, y, ang, len, bend, col, colL, t, ph) => {
    let px = x, py = y, a = ang;
    for (let k = 0; k < len; k += 2) {
      a += bend + Math.sin(t * 0.9 + ph) * 0.002; const nx = px + Math.cos(a) * 2, ny = py + Math.sin(a) * 2;
      seg(g, px, py, nx, ny, 1, col);
      const lw = 9 * Math.sin(Math.PI * (k / len)) + 2;
      for (const sd of [-1, 1]) PX.line(g, nx, ny, nx + Math.cos(a + sd * 1.1) * lw, ny + Math.sin(a + sd * 1.1) * lw, sd < 0 ? colL : col);
      px = nx; py = ny;
    }
  };

  // ======================= jungle =======================
  // dense dark jungle: a small explorer with a lantern tries the left opening, then the right (o.tries [0.5, 5.0]),
  // both dead ends; at o.path (5.5) the big leaves in the middle part, sunlight falls through, a clear path opens.
  K.jungle = (o) => {
    const OPEN = [[178, 246, 40, 52], [462, 246, 40, 52], [320, 232, 60, 74]];
    const inOpen = (x, y, pad) => OPEN.some(([cx, cy, rx, ry]) => ((x - cx) / (rx + pad)) ** 2 + ((y - cy) / (ry + pad)) ** 2 < 1);
    const r0 = PX.rnd(13), WALL = [], CANOPY = [], FG = [];
    for (const [tier, n] of [[0, 230], [1, 170], [2, 70]]) for (let i = 0; i < n; i++) { const x = r0() * 720 - 40, y = 30 + r0() * 280; if (inOpen(x, y, tier === 2 ? 4 : -8)) continue; WALL.push([x, y, Math.PI * (0.25 + r0() * 0.5) + (r0() < 0.5 ? Math.PI : 0) * 0 + (r0() - 0.5) * 2.4, 22 + r0() * 24 - tier * 2, 4 + r0() * 3.5, tier, r0() * 6]); }
    const FRONDS = []; for (let i = 0; i < 16; i++) { const x = r0() * 680 - 20, y = 250 + r0() * 50; if (inOpen(x, y - 10, 0)) continue; FRONDS.push([x, y, -Math.PI / 2 + (r0() - 0.5) * 2.2, 30 + r0() * 30, (r0() - 0.5) * 0.06, r0() * 6]); }
    for (let i = 0; i < 60; i++) CANOPY.push([r0() * 760 - 60, r0() * 140 - 20, 18 + r0() * 30, r0()]);
    for (const [x, y, a] of [[-10, 360, -1.0], [10, 380, -0.6], [30, 370, -1.3], [650, 360, -2.1], [630, 380, -2.6], [610, 368, -1.8], [-20, 40, 0.5], [660, 30, 2.7]]) FG.push([x, y, a]);
    const TANGLE = []; for (let i = 0; i < 24; i++) TANGLE.push([r0(), r0(), r0(), r0()]);
    const EXPL = { skin: SKIN.tan, hair: D.n1, top: mix(D.paperD, D.moss[2], 0.3), pants: mix(D.paperD, D.n3, 0.5), hs: "short", hat: mix(D.paperD, D.amber[2], 0.25), pack: mix(D.moss[2], D.rust[2], 0.3), ph: 1 };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8.0), [a, b] = span(o, d, 8.0, "tries", 0.5, 5.0), tP = T("path", 5.5), m = (a + b) / 2;
      const op = P(t, tP, 1.0, "io"), HX = 320, HY = 312;
      // ---- explorer state ----
      let ex = HX, ey = HY, face = 1, walking = false, lift = 0, shake = 0, sc = 0.86;
      const leg = (t0, t1, tx) => {
        const u = (t - t0) / Math.max(0.05, t1 - t0); if (u <= 0 || u >= 1) return false;
        if (u < 0.3) { ex = lerp(HX, tx, E(u / 0.3, "io")); face = tx > HX ? 1 : -1; walking = true; }
        else if (u < 0.72) { ex = tx; face = tx > HX ? 1 : -1; lift = P(u, 0.32, 0.1, "io") * (1 - P(u, 0.62, 0.1, "io")); shake = u > 0.52 && u < 0.66 ? Math.round(Math.sin(t * 30)) : 0; }
        else { ex = lerp(tx, HX, E((u - 0.72) / 0.28, "io")); face = tx > HX ? -1 : 1; walking = true; }
        return true;
      };
      const pw = clamp((t - tP - 0.8) / 3.2, 0, 1);
      if (pw > 0) { ex = lerp(HX, 334, pw); ey = lerp(HY, 262, E(pw, "lin")); sc = lerp(0.86, 0.6, pw); face = 1; walking = pw < 1; }
      else if (!leg(a, m, 176) && !leg(m, b, 464)) { face = 1; }
      const wph = walking ? t * 9 : undefined;
      // ---- far canopy ----
      R(g, 0, 0, 640, 360, mix(D.moss[2], D.n0, 0.7));
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -60, -40, 760, 300, mix(D.moss[2], D.n0, 0.78), mix(D.moss[2], D.n0, 0.55), 6);
        for (const [x, y, rr, k] of CANOPY) { PX.circle(g, Math.round(x), Math.round(y), Math.round(rr), mix(D.moss[2], D.n0, 0.74 - k * 0.08)); PX.circle(g, Math.round(x - rr * 0.25), Math.round(y - rr * 0.3), Math.round(rr * 0.6), mix(D.moss[2], D.n0, 0.66 - k * 0.08)); }
      });
      // ---- path vista behind the middle (revealed when the leaves part) ----
      PX.par(g, c, 0.6, () => { g.save(); g.beginPath(); g.ellipse(320, 232, 58, 72, 0, 0, TAU); g.clip(); (() => {
        PX.vgrad(g, 250, 150, 140, 110, mix(D.moss[0], D.cream, 0.45), mix(D.moss[1], D.lamp, 0.25), 6);
        for (let i = 0; i < 9; i++) { const x = 250 + i * 17, h = 40 + hash(i, 8) * 40; R(g, x, 250 - h, 3, h, mix(D.moss[2], D.moss[0], 0.45)); PX.circle(g, x + 1, 250 - h, 9, mix(D.moss[1], D.moss[0], 0.4)); }
        R(g, 250, 248, 140, 80, mix(D.moss[2], D.moss[1], 0.4));
        poly(g, [[344, 232], [354, 232], [400, 330], [280, 330]], mix(D.paperD, D.lamp, 0.35));
        poly(g, [[346, 232], [352, 232], [370, 290], [324, 290]], mix(D.paper, D.lamp, 0.5));
        A(g, 0.5, () => ell(g, 350, 228, 18, 8, D.cream));
      })(); g.restore(); });
      // ---- foliage wall with three openings ----
      PX.par(g, c, 0.6, () => {
        // side dead ends: dark tangles of vines + thorns
        for (const [cx, cy, rx, ry] of OPEN.slice(0, 2)) {
          ell(g, cx, cy, rx, ry, mix(D.moss[2], D.n0, 0.82));
          for (const [p, q, r2, w] of TANGLE) { const x1 = cx - rx + p * rx * 2, y1 = cy - ry + q * ry * 2, x2 = cx - rx + r2 * rx * 2, y2 = cy - ry + w * ry * 2; seg(g, x1, y1, x2, y2, 2, mix(D.moss[2], D.n1, 0.55)); for (let k = 1; k < 4; k++) { const xx = lerp(x1, x2, k / 4), yy = lerp(y1, y2, k / 4); R(g, Math.round(xx), Math.round(yy) - 2, 1, 2, mix(D.rust[2], D.n1, 0.4)); } }
        }
        // the middle opening: dark until the leaves part
        A(g, 1 - op * 0.95, () => ell(g, 320, 232, 60, 74, mix(D.moss[2], D.n0, 0.8)));
        const TC = [[mix(D.moss[2], D.n0, 0.68), mix(D.moss[2], D.n0, 0.6)], [mix(D.moss[2], D.n0, 0.5), mix(D.moss[2], D.n0, 0.38)], [mix(D.moss[2], D.n0, 0.32), mix(D.moss[2], D.moss[1], 0.15)]];
        for (const [x, y, ang, len, wid, ti, ph] of WALL) {
          const sw = Math.sin(t * 0.8 + ph) * 0.04;
          leafP(g, x, y, ang + sw, len, wid, TC[ti][0], ti ? mix(TC[ti][0], D.n0, 0.3) : null, TC[ti][1]);
        }
        for (const [x, y, ang, len, bend, ph] of FRONDS) frond(g, x, y, ang, len, bend, mix(D.moss[2], D.n0, 0.4), mix(D.moss[2], D.n0, 0.25), t, ph);
        // the curtain of big leaves in the middle: anchored at the sides, swing open at o.path
        const LS = [[262, 176, 0.32], [266, 214, 0.06], [260, 250, -0.12], [266, 292, -0.38], [378, 188, Math.PI - 0.28], [374, 228, Math.PI + 0.02], [380, 262, Math.PI + 0.18], [372, 300, Math.PI + 0.42]];
        LS.forEach(([x, y, a0], i) => {
          const sd = x < 320 ? 1 : -1, ang = a0 + sd * (y < 240 ? -1 : 1) * op * 1.25 + Math.sin(t * 1.1 + i) * 0.03;
          const ln = 64 + (i * 7) % 13, base = mix(D.moss[2], D.n0, 0.36 + (i % 2) * 0.1);
          leafP(g, x, y, ang + sd * 0.1, ln - 14, 10, mix(base, D.n0, 0.3), null);
          leafP(g, x, y, ang, ln, 14 + (i % 3), base, mix(base, D.n0, 0.35), mix(base, D.moss[1], 0.22));
        });
      });
      // ---- trunks + lianas ----
      PX.par(g, c, 0.72, () => {
        for (const [x, w] of [[28, 34], [100, 22], [548, 26], [618, 36]]) {
          const tc = mix(D.n2, D.rust[2], 0.2);
          R(g, x - w / 2, -40, w, 360, tc); R(g, x - w / 2, -40, 3, 360, mix(tc, D.moss[1], 0.15)); R(g, x + w / 2 - 4, -40, 4, 360, mix(tc, D.n0, 0.4));
          for (let k = 0; k < 12; k++) R(g, Math.round(x - w / 2 + 3 + hash(x, k) * (w - 6)), Math.round(hash(k, x) * 300), 1, 8 + Math.round(hash(k, x + 1) * 10), mix(tc, D.n0, 0.3));
          poly(g, [[x - w / 2 - 14, 318], [x - w / 2, 270], [x, 318]], mix(tc, D.n0, 0.2)); poly(g, [[x + w / 2 + 12, 318], [x + w / 2, 276], [x, 318]], mix(tc, D.n0, 0.35));
          for (let k = 0; k < 6; k++) R(g, Math.round(x - w / 2 + hash(k, x + 2) * w), Math.round(40 + hash(x + 2, k) * 220), 3, 2, mix(D.moss[2], tc, 0.3));   // moss
        }
        for (const [x0, x1, sag, ph] of [[28, 100, 40, 0], [100, 548, 46, 1], [548, 618, 50, 2], [100, 250, 110, 3]]) {
          for (let k = 0; k <= 40; k++) { const u = k / 40, x = lerp(x0, x1, u), y = 30 + Math.sin(u * Math.PI) * sag + Math.sin(t * 0.7 + ph) * 2 * Math.sin(u * Math.PI); R(g, Math.round(x), Math.round(y), 2, 2, mix(D.moss[2], D.n1, 0.5)); }
        }
        for (const [x, h, ph] of [[120, 120, 0], [292, 70, 1], [520, 140, 2], [560, 90, 3]]) for (let k = 0; k < h; k++) R(g, Math.round(x + Math.sin(t * 0.8 + ph + k * 0.03) * k * 0.05), 20 + k, 1, 1, mix(D.moss[2], D.n1, 0.4));
      });
      // ---- ground ----
      PX.par(g, c, 0.85, () => {
        PX.vgrad(g, -60, 300, 760, 100, mix(D.n2, D.moss[2], 0.35), mix(D.n1, D.moss[2], 0.2), 4);
        for (let k = 0; k < 7; k++) ell(g, 300 + hash(k, 31) * 50 + k * 4, 304 + k * 4, 30 + k * 12 + hash(31, k) * 10, 2 + k * 0.6, mix(D.paperD, D.n2, 0.7 - k * 0.012));
        for (let i = 0; i < 26; i++) R(g, Math.round(250 + hash(i, 33) * 150), Math.round(302 + hash(33, i) * 30), 2, 1, mix(D.paperD, D.n2, 0.55));
        for (let i = 0; i < 70; i++) { const x = Math.round(-40 + hash(i, 21) * 720), y = Math.round(302 + hash(21, i) * 58); R(g, x, y, 2 + (i % 3), 1, i % 2 ? mix(D.moss[2], D.n1, 0.4) : mix(D.rust[2], D.n1, 0.5)); }
        for (const [x0, y0, x1, y1] of [[40, 318, 120, 330], [600, 316, 520, 332], [220, 314, 180, 340]]) seg(g, x0, y0, x1, y1, 3, mix(D.n2, D.rust[2], 0.25));
      });
      // ---- the explorer + lantern ----
      let lx = 0, ly = 0;
      PX.par(g, c, 1.0, () => {
        const v = { ...EXPL, walk: wph };
        const pose = [[lerp(6, 10, lift), lerp(-52, -66, lift)], [lerp(13, 16, lift), lerp(-47, -80, lift)]];
        const fig = standing(g, Math.round(ex) + shake, Math.round(ey), sc, v, face, pose, 1, lift > 0.4 ? (shake ? "frown" : "think") : pw > 0 || op > 0.5 ? "surp" : "calm", lift > 0.4 ? -1 : 0, t);
        // lantern hanging from the hand (swings while walking)
        const sw = walking ? Math.sin(t * 9) * 1.5 : Math.sin(t * 1.3) * 0.5;
        lx = fig.hand[0] + Math.round(sw); ly = fig.hand[1] + Math.round(6 * sc) + 2;
        const fl = 0.85 + 0.15 * Math.sin(t * 13) * Math.sin(t * 5.7);
        R(g, lx - 1, fig.hand[1], 1, ly - fig.hand[1] - 3, D.n1);
        R(g, lx - 3, ly - 4, 6, 1, D.n2); R(g, lx - 3, ly + 4, 6, 2, D.n2); R(g, lx - 3, ly - 3, 1, 7, D.n1); R(g, lx + 2, ly - 3, 1, 7, D.n1);
        R(g, lx - 2, ly - 3, 4, 7, mix(D.amber[1], D.lamp, 0.5 * fl)); R(g, lx - 1, ly - 1, 2, 3, D.cream);
        PX.glow(g, lx, ly, 18, D.lamp, 0.35 * fl);
      });
      // ---- foreground leaves framing ----
      PX.par(g, c, 1.3, () => { FG.forEach(([x, y, a0], i) => { const sw = Math.sin(t * 0.9 + i) * 0.05; leafP(g, x, y, a0 + sw, 110, 24, mix(D.moss[2], D.n0, 0.72), mix(D.moss[2], D.n0, 0.5)); }); });
      // ---- light: lantern pool in the gloom; then sunlight through the leaves ----
      const fl = 0.92 + 0.08 * Math.sin(t * 11);
      { const gr = g.createRadialGradient(lx, ly, 18 * fl, lx, ly, 200); const da = lerp(0.62, 0.3, op); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.35, `rgba(0,0,0,${(da * 0.55).toFixed(3)})`); gr.addColorStop(1, `rgba(0,0,0,${da.toFixed(3)})`); g.fillStyle = gr; g.fillRect(-60, -60, 760, 480); }
      PX.glow(g, lx, ly, 60, D.lampD, 0.18 * fl);
      if (op > 0) {
        PX.par(g, c, 0.55, () => {
          A(g, 0.13 * op, () => { poly(g, [[300, -20], [336, -20], [370, 320], [300, 320]], D.lamp); poly(g, [[352, -20], [372, -20], [402, 310], [374, 310]], D.lamp); poly(g, [[262, -20], [276, -20], [300, 300], [282, 300]], D.lamp); });
          A(g, 0.25 * op, () => { for (let i = 0; i < 9; i++) ell(g, 280 + hash(i, 4) * 90, 308 + hash(4, i) * 14, 6 + hash(i, 6) * 6, 2, D.lamp); });
        });
        PX.particles(g, 91, 30, t, [270, 40, 120, 270], { vy: -2, vx: 0.6, col: D.lamp, a: 0.5 * op, tw: 1.4 });
      }
      PX.particles(g, 92, 18, t, [0, 60, 640, 260], { vy: 1, vx: 1.5, col: D.moss[0], a: 0.25, tw: 2 });   // drifting spores
      PX.vignette(g, 0.6);
    };
  };

  // two-bone reach: from shoulder (sx, sy) to target, bones l1/l2, bend side bs (+1/-1). returns elbow
  const ik = (sx, sy, tx, ty, l1, l2, bs) => {
    let dx = tx - sx, dy = ty - sy, dd = Math.hypot(dx, dy); const mx = (l1 + l2) * 0.99;
    if (dd > mx) { dx *= mx / dd; dy *= mx / dd; dd = mx; }
    const a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * Math.max(dd, 1e-3)), h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
    const ux = dx / Math.max(dd, 1e-3), uy = dy / Math.max(dd, 1e-3);
    return [sx + ux * a - uy * h * bs, sy + uy * a + ux * h * bs, sx + dx, sy + dy];
  };

  // ======================= paper_floor =======================
  // a bright room: a woman with dark short hair kneels drawing big curving pencil diagrams across giant sheets of paper
  // on the floor; a small girl (about 3) toddles in to watch with a crayon (o.girl 2.0), then adds a little drawing of
  // her own (o.paint 5.0; only once she has arrived).
  K.paper_floor = (o) => {
    const HZ = 120, FX = (x, z) => 320 + (x - 320) * (0.74 + (0.42 * z) / 240), FP = (x, z) => [FX(x, z), HZ + z];
    const SHEETS = [[60, 40, 170, 110, -0.04], [210, 30, 190, 120, 0.03], [380, 46, 170, 110, -0.02], [40, 150, 190, 100, 0.05], [220, 140, 200, 110, -0.03], [410, 150, 180, 100, 0.02]];
    const mapPts = (pts) => pts.map(([x, z]) => FP(x, z));
    const curve = (n, f) => { const a = []; for (let i = 0; i <= n; i++) a.push(f(i / n)); return a; };
    // the drawings already on the paper (floor coordinates): a two-holed surface with loops, a spiral, wave families
    const almond = (cx, cz, w, h, upper) => curve(36, (u) => { const th = upper ? Math.PI + u * Math.PI : u * Math.PI; return [cx + w * Math.cos(th), cz + h * Math.sin(th) * (upper ? 0.55 : 1)]; });
    const OLD = [
      curve(140, (u) => { const th = u * TAU; return [255 + 152 * Math.cos(th), 96 + Math.sin(th) * (40 - 12 * Math.cos(2 * th)) + 6 * Math.cos(th)]; }),
      almond(186, 86, 26, 9, false), almond(186, 88, 18, 9, true), almond(322, 104, 28, 9, false), almond(322, 106, 19, 9, true),
      curve(40, (u) => { const th = -Math.PI / 2 + u * Math.PI; return [138 + 9 * Math.cos(th), 92 + 32 * Math.sin(th)]; }),
      curve(80, (u) => { const th = u * TAU; const x = 322 + 50 * Math.cos(th), z = 104 + 20 * Math.sin(th); return [x + (z - 104) * 0.5, z]; }),
      curve(120, (u) => [118 + 274 * u, 98 + 26 * Math.sin(u * TAU * 2.5) * (1 - Math.abs(2 * u - 1) ** 2)]),
      curve(90, (u) => { const th = u * TAU * 3; return [118 + Math.cos(th) * (4 + u * 30), 200 + Math.sin(th) * (3 + u * 18)]; }),
      ...[0, 1, 2, 3].map((k) => curve(60, (u) => [250 + u * 150, 182 + k * 9 + Math.sin(u * 9 + k) * (5 + k)])),
      ...[0, 1, 2, 3, 4].map((k) => curve(30, (u) => { const th = Math.PI * (1.05 + u * 0.9); return [520 + Math.cos(th) * (12 + k * 11), 74 + Math.sin(th) * (6 + k * 6) + 40]; })),
    ];
    const DASH = curve(40, (u) => { const th = Math.PI / 2 + u * Math.PI; return [138 + 9 * Math.cos(th), 92 + 32 * Math.sin(th)]; });
    // the curve she is drawing now: a long loop wrapping around the right hole, inside her reach
    const ACT = curve(220, (u) => { const th = u * TAU * 1.5 + 0.6; return [452 + Math.cos(th) * (16 + u * 8), 118 + Math.sin(th) * (8 + u * 4) + Math.sin(u * 20) * 1.2]; });
    const drawPoly = (g, pts, col, frac0, dash) => {
      const n = Math.floor((pts.length - 1) * clamp(frac0 === undefined ? 1 : frac0, 0, 1));
      for (let i = 0; i < n; i++) { if (dash && i % 4 > 1) continue; const [x1, y1] = FP(pts[i][0], pts[i][1]), [x2, y2] = FP(pts[i + 1][0], pts[i + 1][1]); PX.line(g, x1, y1, x2, y2, col); }
      const k = clamp(Math.floor((pts.length - 1) * clamp(frac0 === undefined ? 1 : frac0, 0, 1)), 0, pts.length - 1); return FP(pts[k][0], pts[k][1]);
    };
    const WOMAN = { skin: mix(SKIN.md, SKIN.lt, 0.4), hair: D.n0, top: mix(D.moss[1], D.paperD, 0.35), pants: mix(D.n3, D.steel[2], 0.3), hs: "bob" };
    const GIRL = { skin: SKIN.lt, hair: mix(D.n1, D.rust[2], 0.35), top: mix(D.rose[1], D.paper, 0.25), hs: "curly" };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8.0), tG = T("girl", 2.0), tPa = T("paint", 5.0);
      const arrive = 1.6, gw = clamp((t - tG) / arrive, 0, 1), here = t >= tG;
      const tPaint = Math.max(tPa, tG + arrive), pa = here ? clamp((t - tPaint) / 1.8, 0, 1) : 0;
      R(g, 0, 0, 640, 360, D.paperD);
      // ---- back wall, big window, shelf, plant ----
      PX.par(g, c, 0.45, () => {
        PX.vgrad(g, -60, -40, 760, HZ + 44, mix(D.paperD, D.n5, 0.25), mix(D.paper, D.paperD, 0.4), 6); R(g, -60, HZ, 760, 50, mix(D.paper, D.paperD, 0.4));
        // window with light curtains
        const wx = 92, wy = 6, ww = 150, wh = 100, fr = mix(D.cream, D.n6, 0.2);
        R(g, wx - 4, wy - 4, ww + 8, wh + 8, fr); PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[0], D.paper, 0.35), mix(D.paper, D.lamp, 0.3), 5);
        for (let i = 0; i < 8; i++) { const x = wx + i * 20 + 4, h = 20 + hash(i, 40) * 30; PX.circle(g, x, wy + wh - h * 0.3, 11, mix(D.moss[1], D.paper, 0.45)); PX.circle(g, x - 2, wy + wh - h * 0.3 - 3, 7, mix(D.moss[0], D.paper, 0.45)); }
        R(g, wx + ww / 2 - 1, wy, 3, wh, fr); R(g, wx, wy + wh / 2 - 1, ww, 3, fr);
        for (const [cx0, dir] of [[wx - 14, 1], [wx + ww + 14, -1]]) for (let k = 0; k < 4; k++) { const sw = Math.sin(t * 0.7 + k) * 1.5; R(g, Math.round(cx0 + dir * k * 4 + sw - (dir < 0 ? 4 : 0)), -10, 5, wh + 26, k % 2 ? mix(D.cream, D.rose[0], 0.25) : mix(D.cream, D.rose[0], 0.12)); }
        R(g, wx - 24, -6, ww + 48, 3, mix(D.n5, D.paperD, 0.3));
        // low shelf with books + plant on the right
        const sw0 = wood(0.2);
        R(g, 440, 70, 140, 54, sw0[1]); R(g, 440, 70, 140, 2, sw0[0]); R(g, 444, 96, 132, 2, sw0[2]);
        for (let i = 0, bx = 446; bx < 570 && i < 30; i++) { const bw = 4 + Math.floor(hash(i, 41) * 4), bh = 14 + Math.floor(hash(41, i) * 8); R(g, bx, 96 - bh, bw, bh, mix([D.rust[1], D.steel[1], D.moss[1], D.paperD, D.teal[1], D.amber[2]][i % 6], D.paper, 0.25)); bx += bw + 1; }
        for (let i = 0; i < 6; i++) { R(g, 448 + i * 20, 104, 16, 18, mix(D.paperD, D.paper, 0.3)); R(g, 448 + i * 20, 104, 16, 1, D.cream); }
        R(g, 596, 94, 18, 26, mix(D.rust[1], D.paperD, 0.35)); R(g, 596, 94, 18, 2, mix(D.rust[0], D.paper, 0.4));
        for (let k = 0; k < 9; k++) { const a = -Math.PI / 2 + (k - 4) * 0.33 + Math.sin(t * 0.8 + k) * 0.03; leafP(g, 605, 94, a, 22 + (k % 3) * 6, 4, k % 2 ? D.moss[2] : D.moss[1], null, D.moss[0]); }
        R(g, -60, HZ - 4, 760, 4, mix(D.paperD, D.n5, 0.3));
      });
      // ---- floor + paper sheets + drawings ----
      PX.par(g, c, 0.75, () => {
        const fw = [mix(D.paperD, D.amber[2], 0.35), mix(mix(D.paperD, D.rust[2], 0.45), D.n3, 0.2)];
        PX.vgrad(g, -60, HZ, 760, 300, fw[0], fw[1], 6);
        for (let k = -12; k < 20; k++) { const [x1, y1] = FP(k * 40, 0), [x2, y2] = FP(k * 40, 260); PX.line(g, x1, y1, x2, y2, mix(fw[1], D.n3, 0.15)); }
        // window light falling on the floor
        A(g, 0.18, () => poly(g, mapPts([[60, 4], [230, 4], [300, 120], [110, 120]]), D.lamp));
        // sheets (shadow, paper, slight edge tone)
        SHEETS.forEach(([x0, z0, w, h, rot], i) => {
          const cx = x0 + w / 2, cz = z0 + h / 2, ca = Math.cos(rot), sa = Math.sin(rot);
          const q = [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]].map(([u, v]) => [cx + u * ca - v * sa, cz + u * sa + v * ca]);
          A(g, 0.14, () => poly(g, mapPts(q.map(([x, z]) => [x + 2, z + 2])), mix(D.rust[2], D.n1, 0.5)));
          const pc = mix(D.paper, i % 2 ? D.paperD : D.cream, 0.12 + (i % 3) * 0.06);
          poly(g, mapPts(q), pc);
          for (let e = 0; e < 4; e++) { const [a0, a1] = [FP(q[e][0], q[e][1]), FP(q[(e + 1) % 4][0], q[(e + 1) % 4][1])]; PX.line(g, a0[0], a0[1], a1[0], a1[1], e === 0 ? mix(pc, D.cream, 0.6) : mix(pc, D.paperD, 0.5)); }
          const cq = FP(q[1][0], q[1][1]); poly(g, [[cq[0] - 8, cq[1]], [cq[0], cq[1]], [cq[0] - 2, cq[1] + 5]], mix(pc, D.paperD, 0.35));
        });
        const lead = mix(D.ink, D.paper, 0.38), lead2 = mix(D.ink, D.paper, 0.6);
        OLD.forEach((pts, i) => drawPoly(g, pts, i < 8 ? lead : lead2));
        drawPoly(g, DASH, lead2, 1, true);
        // small marks: shading ticks along the waist, an arrow head
        for (let k = 0; k < 9; k++) { const [x1, y1] = FP(372 + k * 4, 70 + k), [x2, y2] = FP(376 + k * 4, 78 + k); PX.line(g, x1, y1, x2, y2, lead2); }
        // pencils, eraser, a mug at the edge
        const pc1 = FP(560, 216); seg(g, pc1[0], pc1[1], pc1[0] + 16, pc1[1] - 4, 2, mix(D.amber[1], D.paperD, 0.2)); R(g, pc1[0] + 15, pc1[1] - 5, 2, 2, D.ink);
        const pc2 = FP(90, 120); seg(g, pc2[0], pc2[1], pc2[0] + 14, pc2[1] + 3, 2, mix(D.steel[1], D.paperD, 0.2));
        const er = FP(520, 60); R(g, er[0], er[1], 8, 4, mix(D.rose[0], D.paper, 0.3)); R(g, er[0], er[1] + 3, 8, 1, mix(D.rose[1], D.paperD, 0.3));
        const mg = FP(600, 100); R(g, mg[0], mg[1] - 10, 10, 11, mix(D.teal[1], D.paper, 0.35)); R(g, mg[0], mg[1] - 10, 10, 2, mix(D.n3, D.rust[2], 0.4)); R(g, mg[0] + 10, mg[1] - 7, 2, 5, mix(D.teal[1], D.paper, 0.35));
      });
      // ---- the active curve + the woman drawing it ----
      let tip;
      PX.par(g, c, 0.75, () => { const pr = clamp(0.06 + (t / Math.max(d, 1)) * 0.94, 0, 1); tip = drawPoly(g, ACT, mix(D.ink, D.paper, 0.2), pr); });
      PX.par(g, c, 0.75, () => {
        const v = WOMAN, s = 1.45, f = -1, x = 492, y = 262;
        const fx = (dd) => x + f * dd * s, Y = (dd) => y + dd * s;
        const [tL, tp, tD] = sh3(v.top), [pL, pa0, pD] = sh3(v.pants), sk = v.skin;
        const br = Math.sin(t * 1.5) * 0.6, lean = 7 + Math.sin(t * 0.9) * 1.2;
        A(g, 0.22, () => ell(g, x + 8, y + 2, 34, 4, mix(D.rust[2], D.n1, 0.4)));
        // shins on the floor behind the knee, thigh up to the hip
        seg(g, fx(9), Y(-2), fx(-14), Y(-2), Math.round(5 * s), pD); R(g, Math.round(fx(-14)) - 3, Math.round(Y(-4)), 8, 4, D.n2);
        seg(g, fx(9), Y(-3), fx(-6), Y(-16), Math.round(7 * s), pa0); seg(g, fx(9), Y(-6), fx(-6), Y(-19), 1, pL);
        // support arm (far) planted on the paper
        const shx = fx(3 + lean), shy = Y(-36 + lean * 0.5 + br);
        seg(g, shx, shy, fx(14 + lean), Y(-14), Math.round(4 * s), tD); seg(g, fx(14 + lean), Y(-14), fx(19 + lean), Y(-1), Math.round(4 * s), tD); R(g, Math.round(fx(19 + lean)) - 3, Math.round(Y(-1)) - 1, 6, 3, mix(sk, D.n0, 0.25));
        // torso bent forward
        seg(g, fx(-6), Y(-18), shx, shy, Math.round(10 * s), tp);
        seg(g, fx(-9), Y(-19), fx(-1 + lean), Y(-38 + lean * 0.5 + br), 2, tL);
        seg(g, fx(-4), Y(-16), fx(2), Y(-14), 3, tD);
        // head, looking down at the paper
        const hx0 = Math.round(fx(9 + lean)), hy0 = Math.round(Y(-44 + lean * 0.6 + br));
        R(g, Math.round(fx(5 + lean)) - 2, Math.round(Y(-40 + lean * 0.5 + br)), 6, 6, mix(sk, D.n0, 0.3));
        g.save(); g.translate(hx0 * 2, 0); g.scale(-1, 1); headR(g, hx0, hy0, v, PX.blink(t + 1, 4.1, 0.06) ? "shut" : "calm", 1, s * 1.05); g.restore();
        // drawing arm (near): two-bone reach to the pencil tip
        const [tx, ty] = tip, [elx, ely, hx, hy] = ik(shx - 2, shy + 2, tx + 2, ty - 2, 15 * s, 15 * s, -1);
        seg(g, shx - 2, shy + 2, elx, ely, Math.round(4 * s), tp); seg(g, elx, ely, hx, hy, Math.round(3.6 * s), tp); seg(g, shx - 3, shy + 1, elx - 1, ely, 1, tL);
        R(g, Math.round(hx) - 2, Math.round(hy) - 2, 5, 4, sk);
        seg(g, hx, hy - 1, tx, ty, 1, mix(D.amber[1], D.paperD, 0.2)); R(g, Math.round(tx), Math.round(ty), 1, 1, D.ink);
      });
      // ---- the little girl ----
      PX.par(g, c, 0.75, () => {
        if (!here) return;
        const s = 1.0, gx = Math.round(lerp(-30, 214, E(gw, "out"))), walking = gw < 1, crouch = P(t, tPaint - 0.3, 0.4, "io");
        const bob = walking ? Math.round(Math.abs(Math.sin(t * 10)) * 2) : 0, gy = 316 - bob;
        const [dL, dr, dD] = sh3(GIRL.top), sk = GIRL.skin, dropY = Math.round(crouch * 9);
        A(g, 0.22, () => ell(g, gx + 2, 317, 13, 2, mix(D.rust[2], D.n1, 0.4)));
        // legs (short), waddle
        const lg = walking ? Math.round(Math.sin(t * 10) * 2) : 0;
        if (crouch < 0.5) { R(g, gx - 4 + lg, gy - 10, 3, 9, sk); R(g, gx + 1 - lg, gy - 10, 3, 9, mix(sk, D.n0, 0.15)); }
        else { R(g, gx - 5, gy - 5, 10, 4, sk); }
        R(g, gx - 6 + lg, gy - 2, 5, 2, mix(D.rose[2], D.n2, 0.3)); R(g, gx + 1 - lg, gy - 2, 5, 2, mix(D.rose[2], D.n2, 0.3));
        // dress
        poly(g, [[gx - 8, gy - 9 + dropY], [gx + 8, gy - 9 + dropY], [gx + 4, gy - 25 + dropY], [gx - 4, gy - 25 + dropY]], dr);
        R(g, gx - 8, gy - 10 + dropY, 16, 1, dD); R(g, gx - 4, gy - 25 + dropY, 2, 15, dL);
        // back arm
        R(g, gx - 6, gy - 24 + dropY, 3, 9, dD);
        // head (big, curly)
        const hx0 = gx + 1, hy0 = gy - 33 + dropY, look = crouch > 0.5 ? 1 : 0;
        headR(g, hx0, hy0, GIRL, crouch > 0.5 ? "calm" : walking ? "smile" : PX.blink(t, 3.3, 0.07) ? "shut" : "surp", look, 1.3);
        // front arm holding a crayon; scribbles on the paper once painting
        const sx = gx + 2, sy = gy - 22 + dropY;
        let hx, hy;
        if (pa > 0 && pa < 1) { hx = gx + 14 + Math.sin(t * 16) * 3; hy = gy - 4 + Math.cos(t * 13) * 1.5; }
        else if (crouch > 0.5) { hx = gx + 13; hy = gy - 6; }
        else { hx = gx + 8; hy = gy - 16 - (walking ? 0 : Math.round(Math.max(0, Math.sin(t * 2.2)) * 2)); }
        seg(g, sx, sy, hx, hy, 3, dr); R(g, Math.round(hx) - 1, Math.round(hy) - 1, 3, 3, sk);
        seg(g, hx + 1, hy, hx + 4, hy - 3, 2, D.rust[1]);
      });
      // her crayon drawing (a little sun with rays + a flower), drawn over 1.8 s
      PX.par(g, c, 0.75, () => {
        if (pa <= 0) return;
        const ox = 232, oy = 312, col = D.amber[1], col2 = D.rust[1];
        const n = Math.floor(pa * 40);
        for (let i = 0; i < Math.min(n, 18); i++) { const a = (i / 18) * TAU; R(g, Math.round(ox + Math.cos(a) * 6), Math.round(oy - 2 + Math.sin(a) * 3), 2, 1, col); }
        if (n > 18) for (let i = 0; i < Math.min(n - 18, 8); i++) { const a = (i / 8) * TAU; PX.line(g, ox + Math.cos(a) * 8, oy - 2 + Math.sin(a) * 4, ox + Math.cos(a) * 12, oy - 2 + Math.sin(a) * 6, col); }
        if (n > 26) { const k = Math.min(n - 26, 14); for (let i = 0; i < k; i++) { const a = (i / 14) * TAU; R(g, Math.round(ox + 22 + Math.cos(a) * 3), Math.round(oy + 2 + Math.sin(a) * 2), 2, 1, col2); } if (k > 8) PX.line(g, ox + 22, oy + 4, ox + 21, oy + 12, D.moss[1]); }
      });
      // sunlight + motes
      A(g, 0.08, () => poly(g, [[86, 0], [250, 0], [330, 240], [120, 240]], D.lamp));
      dust(g, 61, 30, t, [100, 10, 220, 220], D.cream, 0.4);
      PX.vignette(g, 0.45);
    };
  };
  // ======================= sprint_climb =======================
  // two posters side by side: left a sprinter bursts out of the blocks down a running track (o.sprint 0.5); right a
  // climber steadily ascends a huge mountain face (o.climb 2.5). At o.judge (5.0) a stopwatch floats over the climber
  // with a puzzled look: wrong tool.
  K.sprint_climb = (o) => {
    const LP = [16, 18, 296, 324], RP = [328, 18, 296, 324];
    const r0 = PX.rnd(29), CROWD = [], HOLDS = [], CLOUDS = [];
    for (let i = 0; i < 260; i++) CROWD.push([r0() * 420, Math.floor(r0() * 7), Math.floor(r0() * 6), r0()]);
    for (let i = 0; i < 40; i++) HOLDS.push([r0(), r0() * 900, r0()]);
    for (let i = 0; i < 9; i++) CLOUDS.push([r0() * 340 - 20, 210 + r0() * 90, 20 + r0() * 30]);
    const FACETS = []; for (let i = 0; i < 46; i++) FACETS.push([r0() * 170, r0() * 980, 10 + r0() * 30, 6 + r0() * 18, r0() < 0.5 ? 0 : 2, r0()]);
    // the right poster's rock edge (x in panel coords) at world height wy
    const edge = (wy) => 118 + Math.sin(wy * 0.021) * 14 + Math.sin(wy * 0.057 + 1) * 6 + Math.sin(wy * 0.11) * 2;
    const frame = (g, [x, y, w, h], fn) => {
      R(g, x - 4, y - 4, w + 8, h + 8, mix(D.n1, D.n0, 0.4)); R(g, x - 3, y - 3, w + 6, h + 6, mix(D.paper, D.n4, 0.35)); R(g, x - 3, y - 3, w + 6, 1, mix(D.paper, D.n6, 0.2));
      clip(g, x, y, w, h, () => { g.save(); g.translate(x, y); fn(); g.restore(); });
      A(g, 0.12, () => { for (let i = 0; i < 140; i++) R(g, x + Math.floor(hash(i, x) * w), y + Math.floor(hash(x, i) * h), 1, 1, D.n0); });   // print grain
      R(g, x, y, w, 1, mix(D.n0, D.paper, 0.2)); R(g, x, y + h - 1, w, 1, D.n1);
    };
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const T = tm(o, d, 8.0), tS = T("sprint", 0.5), tC = T("climb", 2.5), tJ = T("judge", 5.0);
      R(g, 0, 0, 640, 360, D.n1);
      // wall behind the posters
      PX.par(g, c, 0.3, () => { PX.vgrad(g, -60, -40, 760, 440, mix(D.n2, D.rust[2], 0.12), D.n1, 6); A(g, 0.15, () => { for (let x = -60; x < 700; x += 4) R(g, x, -40, 1, 440, D.n0); }); });
      A(g, 0.14, () => { ell(g, 164, 4, 120, 30, D.lamp); ell(g, 476, 4, 120, 30, D.lamp); });
      // ---------- left poster: the sprint ----------
      const run = P(t, tS, 0.25, "out"), spd = run * 260;
      const dt = Math.max(0, t - tS), dist = dt < 0.6 ? (130 * dt * dt) / 0.6 : 78 + 260 * (dt - 0.6);
      PX.par(g, c, 0.85, () => frame(g, LP, () => {
        const W = LP[2], H = LP[3], HZ = 168;
        PX.vgrad(g, 0, 0, W, 90, mix(D.steel[1], D.steel[2], 0.3), mix(D.steel[0], D.paper, 0.35), 6);
        // floodlight towers
        for (const fx0 of [40, 230]) { R(g, fx0, 6, 3, 80, D.n3); R(g, fx0 - 8, 4, 19, 8, D.n3); for (let k = 0; k < 4; k++) R(g, fx0 - 6 + k * 4, 6, 3, 3, D.lamp); }
        // stands with a blurred crowd (scrolls slowly once he runs)
        R(g, 0, 70, W, 98, mix(D.n3, D.steel[2], 0.25));
        const off = dist * 0.18;
        for (const [cx0, row, ci, k] of CROWD) {
          const x = (((cx0 - off) % 420) + 420) % 420 - 60, y = 76 + row * 13;
          const cc = [D.rust[1], D.steel[1], D.paper, D.moss[1], D.amber[2], D.n5][ci];
          R(g, Math.round(x), y + Math.round(k * 3), 3, 4, mix(cc, D.n3, 0.45)); R(g, Math.round(x), y + Math.round(k * 3) - 2, 3, 2, mix(SKIN.md, D.n3, 0.4));
          if (spd > 30) A(g, 0.4, () => R(g, Math.round(x) + 3, y + Math.round(k * 3), 4, 4, mix(cc, D.n3, 0.6)));
        }
        for (let row = 0; row < 7; row++) R(g, 0, 82 + row * 13, W, 1, mix(D.n2, D.steel[2], 0.3));
        R(g, 0, HZ - 10, W, 10, mix(D.n2, D.moss[2], 0.3)); R(g, 0, HZ - 10, W, 1, mix(D.n5, D.paper, 0.2));
        // track: lanes widen toward us; lane marks scroll
        const tr = mix(mix(D.rust[1], D.rust[2], 0.55), D.n3, 0.22);
        PX.vgrad(g, 0, HZ, W, H - HZ, mix(tr, D.paperD, 0.15), mix(tr, D.n1, 0.25), 5);
        for (const ly of [HZ, HZ + 14, HZ + 32, HZ + 56, HZ + 88, HZ + 130]) R(g, 0, ly, W, ly > HZ + 40 ? 2 : 1, mix(D.cream, tr, 0.25));
        for (let k = 0; k < 14; k++) { const x = (((k * 60 - dist) % 840) + 840) % 840 - 60; R(g, Math.round(x), HZ + 44, 10, 2, mix(D.cream, tr, 0.4)); R(g, Math.round(x * 1.3), HZ + 72, 14, 2, mix(D.cream, tr, 0.4)); }
        // start line + blocks (scroll away)
        const sx0 = 70 - dist; if (sx0 > -40) { R(g, Math.round(sx0) + 10, HZ + 14, 3, H - HZ, mix(D.cream, tr, 0.15)); R(g, Math.round(sx0) - 10, HZ + 70, 12, 5, D.n4); R(g, Math.round(sx0) - 10, HZ + 70, 12, 1, D.n6); }
        // the sprinter
        const hx = lerp(62, 128, E(clamp((t - tS) / 1.2, 0, 1), "out")), gy = HZ + 76;
        const sk = SKIN.dk, vest = mix(D.teal[1], D.n2, 0.15), shorts = D.n2, [vL, v0] = sh3(vest);
        A(g, 0.35, () => ell(g, hx + 4, gy + 1, 18, 2, "#000000"));
        const ph = t * 13, sw = Math.sin(ph), crouch = 1 - run;
        const hipY = gy - 36 + crouch * 12 + Math.round(Math.abs(Math.cos(ph)) * 2 * run), lean = lerp(0.35, 1.1, crouch);
        const shx = hx + Math.sin(lean) * 26, shy = hipY - Math.cos(lean) * 26;
        const leg = (s0, near) => {
          const ta = run > 0 ? 0.85 * s0 : (near ? 1.1 : -0.5), bend = run > 0 ? 0.35 + 1.3 * Math.max(0, Math.cos(ph + (near ? 0 : Math.PI))) : (near ? 2.0 : 0.4);
          const kx = hx + Math.sin(ta) * 17, ky = hipY + Math.cos(ta) * 17, fx0 = kx + Math.sin(ta - bend) * 17, fy0 = Math.min(ky + Math.cos(ta - bend) * 17, gy - 1);
          const col = near ? sk : mix(sk, D.n0, 0.3);
          seg(g, hx, hipY, kx, ky, 5, col); seg(g, kx, ky, fx0, fy0, 4, col);
          R(g, Math.round(fx0) - 2, Math.round(fy0) - 1, 7, 3, near ? mix(D.cream, D.n6, 0.3) : D.n2);
        };
        const arm = (s0, col) => {
          const ua = run > 0 ? -0.95 * s0 + lean * 0.4 : 0.15, ex0 = shx + Math.sin(ua) * 12, ey0 = shy + Math.cos(ua) * 12;
          const fa = ua + 1.7, hx0 = run > 0 ? ex0 + Math.sin(fa) * 11 : ex0 + 1, hy0 = run > 0 ? ey0 - Math.cos(fa) * 11 : Math.min(gy - 2, ey0 + 12);
          seg(g, shx, shy, ex0, ey0, 4, col); seg(g, ex0, ey0, hx0, hy0, 3, col);
        };
        leg(-sw, false); arm(sw, mix(sk, D.n0, 0.3));
        seg(g, hx, hipY, hx + 4, hipY - 4, 8, shorts);
        seg(g, hx + 2, hipY - 4, shx, shy, 9, v0); seg(g, hx, hipY - 5, shx - 2, shy - 1, 1, vL);
        leg(sw, true);
        const hdx = shx + Math.sin(lean) * 9 + 1, hdy = shy - Math.cos(lean) * 9;
        headR(g, Math.round(hdx), Math.round(hdy), { skin: sk, hair: D.n0, hs: "short" }, run > 0 ? "frown" : "calm", run > 0 ? 0 : 1, 1.1);
        arm(-sw, sk);
        // speed lines
        if (spd > 60) A(g, 0.5 * run, () => { for (let k = 0; k < 7; k++) { const yy = hipY - 30 + k * 9, xx = hx - 30 - ((t * 400 + k * 37) % 60); R(g, Math.round(xx), Math.round(yy), 14 + (k % 3) * 6, 1, D.cream); } });
        A(g, 0.25, () => PX.vgrad(g, 0, H - 40, W, 40, mix(D.n0, tr, 0.5), D.n0, 4));
      }));
      // ---------- right poster: the climb ----------
      const cl = Math.max(0, t - tC), up = cl * 9;   // wall passed (px): slow and steady
      PX.par(g, c, 0.85, () => frame(g, RP, () => {
        const W = RP[2], H = RP[3];
        PX.vgrad(g, 0, 0, W, H, mix(D.steel[1], D.steel[2], 0.45), mix(D.steel[0], D.lamp, 0.35), 8);
        // far peaks + a cloud sea below
        poly(g, [[-10, 250], [30, 196], [60, 214], [96, 170], [140, 230], [140, 260], [-10, 260]], mix(D.steel[1], D.cream, 0.35));
        poly(g, [[30, 196], [40, 204], [52, 200], [60, 214], [44, 210]], D.cream); poly(g, [[96, 170], [106, 186], [90, 184]], D.cream);
        for (const [cx0, cy0, rr] of CLOUDS) { const x = ((cx0 + t * 3) % 360) - 20, y = cy0 + up * 0.15; ell(g, x, y + 2, rr, rr * 0.35, mix(D.steel[0], D.steel[1], 0.4)); ell(g, x, y, rr, rr * 0.33, mix(D.cream, D.steel[0], 0.35)); ell(g, x - rr * 0.3, y - 3, rr * 0.6, rr * 0.25, mix(D.cream, D.steel[0], 0.12)); }
        // the rock face (right side), scrolling down as he climbs
        const rock = [mix(D.n4, D.paperD, 0.25), mix(D.n3, D.rust[2], 0.15), mix(D.n2, D.rust[2], 0.1)];
        for (let y = 0; y < H; y++) { const ex0 = Math.round(edge(y - up)); R(g, ex0, y, W - ex0, 1, rock[1]); R(g, ex0, y, 3, 1, rock[0]); R(g, ex0 + 3, y, 2, 1, mix(rock[0], rock[1], 0.5)); }
        for (const [fx0, fy0, fw0, fh0, tone, k] of FACETS) { const yy = (((fy0 + up) % 980) + 980) % 980 - 300; if (yy < -40 || yy > H + 40) continue; const ex0 = edge(yy - up) + 6 + fx0;
          A(g, 0.55, () => poly(g, [[ex0, yy], [ex0 + fw0, yy - fh0 * 0.4], [ex0 + fw0 * (0.6 + k * 0.5), yy + fh0], [ex0 - 3, yy + fh0 * 0.8]], rock[tone])); }
        // strata + snow ledges, holds (wrap around a 980 px tall world)
        for (let k = 0; k < 14; k++) { const yy = Math.round((((k * 70 + 10 + up) % 980) + 980) % 980 - 300); if (yy < -20 || yy > H + 20) continue; const ex0 = edge(yy - up);
          seg(g, ex0 + 4, yy, W, yy - 24, 1, rock[2]); const sn = mix(D.cream, D.steel[0], 0.25); R(g, Math.round(ex0) - 1, yy - 1, 9 + (k % 3) * 3, 2, sn); R(g, Math.round(ex0) + 1, yy - 2, 4 + (k % 2) * 3, 1, sn); R(g, Math.round(ex0) + 2, yy + 1, 6, 1, mix(sn, D.steel[1], 0.5)); R(g, Math.round(ex0) - 1, yy + 1, 1, 2, rock[2]); }
        for (const [k, wy0, q] of HOLDS) { const yy = Math.round((((wy0 + up) % 900) + 900) % 900 - 300); if (yy < -10 || yy > H + 10) continue; const x = edge(yy - up) + 8 + k * 120; R(g, Math.round(x), yy, 3 + Math.round(q * 4), 2, rock[2]); R(g, Math.round(x), yy - 1, 3 + Math.round(q * 4), 1, rock[0]); }
        // the climber on the edge: one limb moves at a time
        const mv = cl / 1.4, step = Math.floor(mv), fr = mv - step, mvk = cl > 0 ? E(clamp(fr / 0.6, 0, 1), "io") : 0;
        const bx = Math.round(edge(150 - up)) - 12, by = Math.round(150 - (cl > 0 ? mvk * 2 : 0));
        const helmet = mix(D.amber[1], D.rust[1], 0.3), jacket = mix(D.rust[1], D.rust[2], 0.35), [jL, j0, jD] = sh3(jacket), pnt = mix(D.n3, D.steel[2], 0.3);
        for (let y = by + 18; y < H; y += 1) R(g, Math.round(bx - 6 + Math.sin(y * 0.05 + t * 0.6) * 2), y, 1, 1, mix(D.amber[1], D.paperD, 0.3));   // rope
        const limb = (i) => { const act = step % 4 === i && cl > 0, base = [[10, -30], [12, -14], [6, 22], [9, 30]][i], off = act ? (1 - mvk) * 10 : 0; return [bx + base[0], by + base[1] + off]; };
        const [h1, h2, f1, f2] = [0, 1, 2, 3].map(limb);
        seg(g, bx + 2, by - 10, h2[0], h2[1], 3, jD); seg(g, bx - 2, by + 8, f2[0] - 4, f2[1] - 8, 4, mix(pnt, D.n0, 0.3)); seg(g, f2[0] - 4, f2[1] - 8, f2[0], f2[1], 4, mix(pnt, D.n0, 0.3));
        R(g, bx - 16, by - 16, 9, 18, mix(D.moss[2], D.n2, 0.2)); R(g, bx - 16, by - 16, 9, 2, mix(D.moss[1], D.n2, 0.2)); R(g, bx - 16, by - 18, 9, 3, mix(D.paper, D.n4, 0.3));
        seg(g, bx - 4, by - 14, bx - 1, by + 8, 9, j0); seg(g, bx - 7, by - 14, bx - 5, by + 6, 1, jL);
        R(g, bx - 6, by + 6, 10, 3, D.n2);   // harness
        seg(g, bx, by + 8, f1[0] - 6, f1[1] - 10, 4, pnt); seg(g, f1[0] - 6, f1[1] - 10, f1[0], f1[1], 4, pnt); R(g, Math.round(f1[0]) - 1, Math.round(f1[1]) - 1, 6, 3, D.n1);
        headR(g, bx + 2, by - 22, { skin: SKIN.lt, hair: mix(D.n1, D.rust[2], 0.3), hs: "short" }, t > tJ + 0.5 ? "think" : "calm", -1, 1.0);
        ell(g, bx + 1, by - 27, 7, 4, helmet); R(g, bx - 6, by - 25, 15, 2, mix(helmet, D.n0, 0.3)); R(g, bx - 3, by - 30, 6, 1, mix(helmet, D.cream, 0.45)); R(g, bx - 4, by - 24, 1, 6, D.n2);
        seg(g, bx + 3, by - 12, h1[0], h1[1], 3, j0); R(g, Math.round(h1[0]) - 1, Math.round(h1[1]) - 2, 3, 3, SKIN.lt);
        R(g, Math.round(h2[0]) - 1, Math.round(h2[1]) - 2, 3, 3, mix(SKIN.lt, D.n0, 0.2));
        if (cl > 0 && fr > 0.55 && fr < 0.85 && step % 4 < 2) A(g, (0.85 - fr) * 2.5, () => { const [px0, py0] = step % 4 === 0 ? h1 : h2; for (let k = 0; k < 5; k++) R(g, Math.round(px0 + (hash(k, step) - 0.5) * 8), Math.round(py0 - 2 - hash(step, k) * 6), 1, 1, D.cream); });
        // ---- the stopwatch: floats in over the climber, puzzled ----
        const jk = P(t, tJ, 0.9, "out");
        if (jk > 0) {
          const wx = bx - 46 + Math.sin(t * 1.3) * 3, wy = lerp(-40, 86, jk) + Math.sin(t * 2.1) * 2.5, tilt = Math.sin(t * 1.1) * 0.25 + 0.15, rr = 20;
          const rot = (dx, dy) => [wx + dx * Math.cos(tilt) - dy * Math.sin(tilt), wy + dx * Math.sin(tilt) + dy * Math.cos(tilt)];
          const [cr0, cr1] = rot(0, -rr - 4), [b0, b1] = rot(15, -rr + 2), [s0x, s0y] = rot(0, -rr), [s1x, s1y] = rot(11, -rr + 3);
          seg(g, s0x, s0y, cr0, cr1, 4, D.steel[1]); R(g, Math.round(cr0) - 4, Math.round(cr1) - 3, 8, 3, D.steel[0]);
          seg(g, s1x, s1y, b0, b1, 3, D.steel[2]);
          PX.circle(g, Math.round(wx), Math.round(wy), rr + 2, D.steel[2]); PX.circle(g, Math.round(wx) - 1, Math.round(wy) - 1, rr + 1, D.steel[1]); PX.circle(g, Math.round(wx), Math.round(wy), rr - 2, mix(D.cream, D.paper, 0.3));
          R(g, Math.round(wx) - 10, Math.round(wy) - rr + 1, 8, 1, D.cream);
          for (let i = 0; i < 12; i++) { const [tx0, ty0] = rot(Math.cos((i / 12) * TAU) * (rr - 4), Math.sin((i / 12) * TAU) * (rr - 4)); R(g, Math.round(tx0), Math.round(ty0), 1, 1, D.n4); }
          // face: eyes glance down at the climber, one brow up, a wobbly mouth
          const look = Math.sin(t * 0.9) > -0.3 ? 1 : 0;
          const [e1x, e1y] = rot(-6, -5), [e2x, e2y] = rot(5, -5);
          for (const [ex1, ey1] of [[e1x, e1y], [e2x, e2y]]) { R(g, Math.round(ex1) - 2, Math.round(ey1) - 2, 5, 6, D.n3); R(g, Math.round(ex1) - 1, Math.round(ey1) - 2, 3, 6, D.cream); R(g, Math.round(ex1) - 2, Math.round(ey1) - 1, 5, 4, D.cream); R(g, Math.round(ex1) - 1 - look, Math.round(ey1) + look, 2, 3, D.n0); R(g, Math.round(ex1) - 1 - look, Math.round(ey1) + look, 1, 1, D.n4); }
          const [b1x, b1y] = rot(-7, -10), [b2x, b2y] = rot(4, -13);
          R(g, Math.round(b1x) - 2, Math.round(b1y), 5, 1, D.n1); seg(g, b2x - 2, b2y + 3, b2x + 4, b2y - 1, 1, D.n1);
          for (let k = 0; k < 7; k++) { const [mx0, my0] = rot(-4 + k * 1.3, 7 + Math.round(Math.sin(k * 1.8 + t * 3) * 0.8)); R(g, Math.round(mx0), Math.round(my0), 1, 1, D.n3); }
          // the hand twitches back and forth: it cannot decide what to measure
          const ha = -Math.PI / 2 + Math.sin(t * 3.4) * 1.1 + tilt, hx2 = wx + Math.cos(ha) * (rr - 6), hy2 = wy + 4 + Math.sin(ha) * (rr - 6);
          PX.line(g, wx, wy + 4, hx2, hy2, D.rust[1]); R(g, Math.round(wx), Math.round(wy) + 4, 1, 1, D.n1);
          if (jk < 1) A(g, 1 - jk, () => { for (let k = 1; k < 5; k++) R(g, Math.round(wx) - 1, Math.round(wy - rr - k * 7), 2, 3, D.cream); });
        }
        A(g, 0.18, () => PX.vgrad(g, 0, H - 50, W, 50, mix(D.n0, D.steel[2], 0.4), D.n0, 4));
      }));
      dust(g, 33, 16, t, [0, 0, 640, 360], D.lamp, 0.22);
      PX.vignette(g, 0.5);
    };
  };
})();
