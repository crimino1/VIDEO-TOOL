/* EP5 Builder E: the TikTok bots and YouTube's two stages. Documentary palette PX.D only, cool and nocturnal.
   Kinds: bot_farm, linger, ballot, two_stage, clickbait, seventy.
   Shared kit: colour mix, shapes, video-tile pictures (dog, dancer, star sign + generic), phone, YOU dot, people. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, E = PX.ease;
  const TAU = Math.PI * 2;

  // ---------- colour + shape helpers ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A = hx(a), B = hx(b); k = clamp(k, 0, 1); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const ell = (g, cx, cy, rx, ry, col) => { rx = Math.max(0, rx); ry = Math.max(0.5, ry); g.fillStyle = col; for (let y = -Math.round(ry); y <= Math.round(ry); y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
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
  const A = (g, a, fn) => { const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const wrap = (i, n) => ((i % n) + n) % n;
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  // option time resolver: o[k] if given (used as is), else default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  // label: outlined pixel text, centred, fades + rises in over 0.4 s; out = fade-out start (optional)
  const label = (g, s, x, y, t, t0, o) => {
    o = o || {}; if (t < t0) return;
    let a = PX.p(t, t0, 0.4, "out"); if (o.out !== undefined && t > o.out) a *= 1 - clamp((t - o.out) / 0.4, 0, 1);
    if (a <= 0) return;
    A(g, a, () => PX.otext(g, s, x, y + Math.round(3 * (1 - PX.p(t, t0, 0.4, "out"))), { align: "center", col: o.col || D.cream, outline: D.n0, size: o.size || 8, font: o.font }));
  };
  const thick = (g, x1, y1, x2, y2, col, w) => { for (let k = 0; k < (w || 2); k++) PX.line(g, x1 + (Math.abs(y2 - y1) > Math.abs(x2 - x1) ? k : 0), y1 + (Math.abs(y2 - y1) > Math.abs(x2 - x1) ? 0 : k), x2 + (Math.abs(y2 - y1) > Math.abs(x2 - x1) ? k : 0), y2 + (Math.abs(y2 - y1) > Math.abs(x2 - x1) ? 0 : k), col); };

  // thick straight bar from (x1,y1) to (x2,y2), width w, with a lit top edge
  const seg = (g, x1, y1, x2, y2, w, col, colL) => {
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / L * w / 2, ny = (x2 - x1) / L * w / 2;
    poly(g, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], col);
    if (colL) PX.line(g, x1 - nx * (ny > 0 ? 1 : -1), y1 - Math.abs(ny), x2 - nx * (ny > 0 ? 1 : -1), y2 - Math.abs(ny), colL);
  };
  // ---------- the YOU dot (recurring motif): amber core, soft 1px cream ring, faint pulse ----------
  const youDot = (g, x, y, t, a) => {
    a = a === undefined ? 1 : a; if (a <= 0) return;
    A(g, a, () => {
      const p = frac(t * 0.6);
      PX.glow(g, x, y, 12, D.amber[1], 0.28);
      A(g, 0.45 * (1 - p), () => { const rr = 4 + Math.round(p * 5); for (let i = 0; i < 24; i++) { const an = (i / 24) * TAU; R(g, Math.round(x + Math.cos(an) * rr), Math.round(y + Math.sin(an) * rr), 1, 1, D.cream); } });
      for (let i = 0; i < 20; i++) { const an = (i / 20) * TAU; A(g, 0.7, () => R(g, Math.round(x + Math.cos(an) * 4), Math.round(y + Math.sin(an) * 4), 1, 1, D.cream)); }
      PX.circle(g, x, y, 2, D.amber[1]); R(g, x - 1, y - 1, 1, 1, D.amber[0]); R(g, x + 1, y + 1, 1, 1, D.amber[2]);
    });
  };
  // other people's dot (cool cream / steel)
  const dot = (g, x, y, col, a) => A(g, a === undefined ? 1 : a, () => { R(g, x - 1, y, 3, 1, col); R(g, x, y - 1, 1, 3, col); });

  // ---------- icons (tags) ----------
  const ICON = {
    dog: ["....x.x", "x...xxx", ".xxxxx.", ".x...x."],
    dance: ["x.x.x", ".xxx.", "..x..", ".x.x.", "x...x"],
    astro: ["..x..", ".xxx.", "xxxxx", ".xxx.", ".x.x."],
  };
  const KINDS = ["dog", "dance", "astro"];
  const icon = (g, k, x, y, col) => PX.sprite(g, ICON[k], x, y, { x: col });

  // ---------- figures drawn natively at any size ----------
  const FUR = () => { const f = mix(D.paper, D.amber[2], 0.5); return [mix(f, D.cream, 0.35), f, mix(f, D.n1, 0.45)]; };
  // dog standing on ground y=by, centred on cx, body length s; o.fur [l, b, d], o.wag phase, o.flip
  const dogShape = (g, cx, by, s, t, o) => {
    o = o || {}; const [fl, fb, fd] = o.fur || FUR(), f = o.flip ? -1 : 1, X = (v) => cx + f * v * s;
    const wag = Math.sin(t * 9 + (o.ph || 0)) * s * 0.07, lw = Math.max(1, Math.round(s * 0.075)), Y = (v) => by - v * s;
    const leg = (lx, col, back) => { const x = Math.round(X(lx) - lw / 2); R(g, x, Y(0.34), lw, s * 0.34, col); if (s > 24) { R(g, x + (f > 0 ? 1 : -1) * (back ? 0 : 1), by - 1, lw + 1, 1, fd); R(g, x, Y(0.34), 1, s * 0.25, back ? fd : fl); } };
    // tail (curving up)
    const tb = [X(-0.34), Y(0.44)], tm2 = [X(-0.46), Y(0.52)], te = [X(-0.5) + wag * f, Y(0.66)];
    const tw = Math.max(1, Math.round(s * 0.05));
    thick(g, tb[0], tb[1], tm2[0], tm2[1], fd, tw); thick(g, tm2[0], tm2[1], te[0], te[1], fd, tw);
    // far legs
    leg(-0.2, fd, true); leg(0.16, fd, true);
    // body: rump + chest + barrel, darker belly, lit back
    ell(g, X(-0.24), Y(0.42), s * 0.15, s * 0.14, fb); ell(g, X(0.18), Y(0.44), s * 0.16, s * 0.15, fb);
    ell(g, cx, Y(0.42), s * 0.32, s * 0.13, fb);
    if (s > 16) { ell(g, X(-0.02), Y(0.35), s * 0.28, s * 0.05, fd); ell(g, X(-0.04), Y(0.53), s * 0.24, s * 0.025, fl); }
    // near legs (back leg with a thigh)
    ell(g, X(-0.24), Y(0.38), s * 0.1, s * 0.1, fb);
    leg(-0.27, fb); leg(0.2, fb);
    // neck + head + snout + ear
    poly(g, [[X(0.18), Y(0.56)], [X(0.32), Y(0.7)], [X(0.44), Y(0.62)], [X(0.3), Y(0.4)]], fb);
    const hy = Y(0.66), hr = Math.max(1, s * 0.12);
    ell(g, X(0.39), hy, hr, hr, fb);
    ell(g, X(0.52), hy + s * 0.04, s * 0.09, s * 0.055, fb);
    if (s > 16) { ell(g, X(0.52), hy + s * 0.075, s * 0.08, s * 0.02, fd); ell(g, X(0.37), hy - s * 0.06, s * 0.06, s * 0.025, fl); }
    R(g, Math.round(X(0.6)) - (f < 0 ? Math.max(1, s * 0.035) : 0), hy + s * 0.015, Math.max(1, s * 0.035), Math.max(1, s * 0.035), D.n0);   // nose
    ell(g, X(0.32), hy + s * 0.04, s * 0.045, s * 0.1, fd);                                                                          // floppy ear
    if (s > 10) R(g, Math.round(X(0.43)), hy - s * 0.03, Math.max(1, s * 0.025), Math.max(1, s * 0.03), D.n0);                          // eye
    if (s > 30 && o.tongue) R(g, Math.round(X(0.53)), hy + s * 0.1, Math.max(1, s * 0.03), s * 0.045, D.rose[1]);
  };
  // dancer: height s, standing on by; colour col
  const dancerShape = (g, cx, by, s, t, col, colD) => {
    const sw = Math.sin(t * 5), w = Math.max(1, Math.round(s / 14));
    const hy = by - s * 0.88, sh = by - s * 0.72, hip = by - s * 0.42;
    PX.circle(g, cx + sw * s * 0.03, hy, Math.max(1, Math.round(s * 0.08)), colD || col);
    thick(g, cx, sh, cx + sw * s * 0.02, hip, col, w + 1);
    // arms: one up, one out, swapping
    thick(g, cx, sh, cx - s * 0.22, sh - s * (0.12 + 0.12 * sw), col, w);
    thick(g, cx, sh, cx + s * 0.22, sh - s * (0.12 - 0.12 * sw), col, w);
    thick(g, cx, hip, cx - s * (0.12 + 0.05 * sw), by, colD || col, w);
    thick(g, cx, hip, cx + s * (0.14 - 0.05 * sw), by - s * 0.04 * (1 + sw), colD || col, w);
  };

  // ---------- one short-video picture in (x, y, w, h) ----------
  // type: dog | dance | astro | cook | sea | city | talk ; v = variant seed
  const GEN = ["cook", "sea", "city", "talk"];
  const vid = (g, x, y, w, h, type, v, t) => {
    const r = PX.rnd(1 + Math.floor(v * 977) % 9973), big = w > 40;
    clip(g, x, y, w, h, () => {
      if (type === "dog") {
        const sky = [mix(D.steel[2], D.n2, 0.2), mix(D.teal[2], D.n2, 0.3), mix(D.moss[2], D.n2, 0.5)][Math.floor(r() * 3)];
        PX.vgrad(g, x, y, w, h * 0.62, mix(sky, D.n1, 0.25), mix(sky, D.cream, 0.18), big ? 6 : 2);
        R(g, x, y + h * 0.62, w, h * 0.38, mix(D.moss[2], D.n1, 0.25)); R(g, x, y + h * 0.62, w, 1, mix(D.moss[1], D.n2, 0.3));
        if (big) for (let i = 0; i < 26; i++) R(g, x + r() * w, y + h * (0.66 + r() * 0.32), 2, 1, mix(D.moss[2], D.moss[1], 0.35));
        const furs = [FUR(), [mix(D.n6, D.cream, 0.4), D.n6, D.n4], [mix(D.rust[2], D.paper, 0.4), mix(D.rust[2], D.n2, 0.2), mix(D.rust[2], D.n0, 0.4)]];
        dogShape(g, x + w * (0.45 + (r() - 0.5) * 0.1), y + h * 0.8, w * 0.62, t, { fur: furs[Math.floor(r() * 3)], flip: r() < 0.4, ph: r() * 6, tongue: true });
      } else if (type === "dance") {
        PX.vgrad(g, x, y, w, h, mix(D.n3, D.plum[2], 0.35), mix(D.n2, D.rose[2], 0.2), big ? 6 : 2);
        R(g, x, y + h * 0.78, w, h * 0.22, mix(D.n3, D.paperD, 0.25)); R(g, x, y + h * 0.78, w, 1, mix(D.n4, D.paper, 0.3));
        if (big) PX.glow(g, x + w * 0.5, y + h * 0.2, w * 0.5, D.lampD, 0.12);
        const cc = [D.rose[1], D.teal[1], D.paper][Math.floor(r() * 3)];
        dancerShape(g, x + w * 0.5, y + h * 0.84, h * 0.55, t + r() * 3, mix(cc, D.cream, 0.15), mix(cc, D.n1, 0.3));
      } else if (type === "astro") {
        PX.vgrad(g, x, y, w, h, D.n0, mix(D.n2, D.steel[2], 0.4), big ? 6 : 2);
        for (let i = 0; i < (big ? 30 : 4); i++) A(g, 0.4 + 0.5 * r(), () => R(g, x + r() * w, y + r() * h, 1, 1, D.cream));
        const cx = x + w * 0.5, cy = y + h * 0.42, rr = w * 0.32;
        if (big) { for (let i = 0; i < 64; i++) { const an = (i / 64) * TAU; R(g, cx + Math.cos(an) * rr, cy + Math.sin(an) * rr, 1, 1, mix(D.paperD, D.n2, 0.3)); }
          for (let i = 0; i < 12; i++) { const an = (i / 12) * TAU + t * 0.1; R(g, cx + Math.cos(an) * (rr + 4) - 1, cy + Math.sin(an) * (rr + 4) - 1, 2, 2, D.paperD); } }
        PX.circle(g, cx, cy, Math.max(1, Math.round(w * 0.14)), D.lamp); PX.circle(g, cx + w * 0.06, cy - w * 0.04, Math.max(1, Math.round(w * 0.12)), mix(D.n1, D.steel[2], 0.3));
      } else if (type === "cook") {
        R(g, x, y, w, h, mix(D.n3, D.amber[2], 0.3)); R(g, x, y + h * 0.6, w, h * 0.4, mix(D.n4, D.rust[2], 0.3)); R(g, x, y + h * 0.6, w, 1, mix(D.n6, D.paper, 0.3));
        ell(g, x + w * 0.5, y + h * 0.56, w * 0.3, w * 0.08, D.n2); R(g, x + w * 0.2, y + h * 0.44, w * 0.6, h * 0.12, D.n4); R(g, x + w * 0.2, y + h * 0.44, w * 0.6, 1, D.n6);
        if (big) for (let i = 0; i < 3; i++) { const k = frac(t * 0.5 + i / 3); A(g, 0.5 * (1 - k), () => R(g, x + w * (0.38 + i * 0.12) + Math.sin(k * 6) * 2, y + h * (0.4 - k * 0.25), 2, 3, D.cream)); }
      } else if (type === "sea") {
        PX.vgrad(g, x, y, w, h * 0.5, mix(D.steel[1], D.n2, 0.3), mix(D.paperD, D.steel[1], 0.4), big ? 6 : 2);
        R(g, x, y + h * 0.5, w, h * 0.5, mix(D.teal[2], D.n1, 0.2));
        for (let i = 0; i < (big ? 18 : 2); i++) R(g, x + r() * w, y + h * (0.53 + r() * 0.45), big ? 4 : 2, 1, mix(D.teal[1], D.n2, 0.2));
        PX.circle(g, x + w * 0.7, y + h * 0.4, Math.max(1, Math.round(w * 0.08)), D.lamp);
      } else if (type === "city") {
        PX.vgrad(g, x, y, w, h, mix(D.n2, D.steel[2], 0.3), mix(D.n3, D.rust[2], 0.25), big ? 6 : 2);
        let bx = x; while (bx < x + w) { const bw = Math.max(2, w * (0.12 + r() * 0.14)), bh = h * (0.25 + r() * 0.4); R(g, bx, y + h - bh, bw, bh, mix(D.n1, D.steel[2], 0.2));
          if (big) for (let yy = y + h - bh + 4; yy < y + h - 3; yy += 6) for (let xx = bx + 2; xx < bx + bw - 2; xx += 4) if (r() < 0.4) R(g, xx, yy, 2, 2, D.lampD); bx += bw + 1; }
      } else { // talk: generic person talking to camera
        R(g, x, y, w, h, mix(D.n3, D.teal[2], 0.25));
        if (big) R(g, x + w * 0.62, y + h * 0.18, w * 0.25, h * 0.3, mix(D.n4, D.teal[2], 0.2));
        const cx = x + w * 0.5, hc = [mix(D.n2, D.rust[2], 0.3), D.n1, mix(D.paperD, D.amber[2], 0.3)][Math.floor(r() * 3)];
        ell(g, cx, y + h * 0.95, w * 0.34, h * 0.2, [D.steel[2], D.moss[2], D.rose[2]][Math.floor(r() * 3)]);
        ell(g, cx, y + h * 0.5, w * 0.17, w * 0.2, SKINS()[Math.floor(r() * 4)]);
        ell(g, cx, y + h * 0.5 - w * 0.12, w * 0.18, w * 0.1, hc);
        if (big) { R(g, cx - w * 0.07, y + h * 0.5, 2, 2, D.n0); R(g, cx + w * 0.05, y + h * 0.5, 2, 2, D.n0); R(g, cx - w * 0.04, y + h * 0.5 + w * 0.09, w * 0.08, PX.blink(t, 0.3, 0.5) ? 2 : 1, D.ink); }
      }
    });
  };

  // ---------- phone (body + bezel), screen(sx, sy, sw, sh) draws the picture ----------
  const phone = (g, x, y, w, h, screen, o) => {
    o = o || {}; const body = o.body || D.n1, edge = o.edge || D.n4;
    R(g, x + 1, y, w - 2, h, body); R(g, x, y + 1, w, h - 2, body);
    R(g, x + 1, y, w - 2, 1, edge); R(g, x, y + 1, 1, h - 2, mix(edge, body, 0.4)); R(g, x + w - 1, y + 1, 1, h - 2, mix(edge, D.n0, 0.3));
    const b = o.bez || 1, sx = x + b, sy = y + (o.top || 2), sw = w - 2 * b, sh = h - (o.top || 2) - (o.bot || 2);
    clip(g, sx, sy, sw, sh, () => screen(sx, sy, sw, sh));
    return { sx, sy, sw, sh };
  };

  // ---------- concrete basement shell (shared by bot_farm and linger) ----------
  const basementWall = (g, c, t, soft) => {
    const fog = (col) => mix(col, D.n1, soft || 0);
    PX.vgrad(g, -40, -40, 720, 440, fog(mix(D.n2, D.steel[2], 0.18)), D.n1, 9);
    PX.par(g, c, 0.4, () => {
      for (let y = -20, row = 0; y < 330; y += 16, row++) { R(g, -40, y, 720, 1, fog(mix(D.n1, D.n2, 0.4))); for (let x = -40 + (row % 2) * 20; x < 680; x += 40) R(g, x, y, 1, 16, fog(mix(D.n1, D.n2, 0.5))); }
      // street-level window, top left: a streetlamp outside, wet glass
      const wx = 52, wy = 18, ww = 96, wh = 30;
      R(g, wx - 4, wy - 4, ww + 8, wh + 8, fog(D.n3));
      PX.vgrad(g, wx, wy, ww, wh, fog(mix(D.steel[2], D.n1, 0.4)), fog(mix(D.lampD, D.n2, 0.6)), 4);
      R(g, wx + 30, wy + 4, 2, wh - 4, fog(D.n1)); R(g, wx + 24, wy + 3, 14, 3, fog(D.lampD));
      for (let i = 0; i < 8; i++) { const k = frac(t * 0.35 + i * 0.37); A(g, 0.5, () => R(g, wx + 6 + i * 11, wy + k * wh, 1, 3, fog(D.n6))); }
      R(g, wx + ww / 2 - 1, wy, 2, wh, fog(D.n3)); R(g, wx - 6, wy + wh + 4, ww + 12, 3, fog(D.n4));
      PX.glow(g, wx + 30, wy + 8, 60, D.lampD, 0.14);
    });
    // ceiling pipes
    PX.par(g, c, 0.6, () => {
      R(g, -40, 0, 720, 8, fog(D.n1));
      for (const [py, col] of [[6, D.n4], [13, mix(D.n3, D.rust[2], 0.3)]]) { R(g, -40, py, 720, 4, fog(col)); R(g, -40, py, 720, 1, fog(mix(col, D.n7, 0.35))); R(g, -40, py + 4, 720, 1, D.n0); }
      for (let x = 30; x < 640; x += 110) { R(g, x, 0, 3, 18, fog(D.n3)); R(g, x - 2, 17, 7, 2, fog(D.n4)); }
    });
  };
  // fluorescent tube hanging from the ceiling at (x, y); flick = slight flicker amount
  const tube = (g, x, y, t, a) => {
    R(g, x - 40, y - 2, 1, -y, D.n3); R(g, x + 40, y - 2, 1, -y, D.n3);
    R(g, x - 46, y - 3, 92, 4, D.n3); R(g, x - 46, y - 3, 92, 1, D.n5);
    const fl = 0.85 + 0.15 * (hash(Math.floor(t * 9), 3) < 0.08 ? 0.2 : 1);
    R(g, x - 43, y + 1, 86, 2, mix(D.n5, D.steel[0], fl * a)); R(g, x - 43, y + 1, 86, 1, mix(D.n6, D.cream, fl * a * 0.8));
    PX.glow(g, x, y + 4, 150, D.steel[0], 0.13 * a * fl);
  };

  // per-phone short-video feed: which video shows at time t and how far it has scrolled
  // phone i, interest kind; returns { a: type now, b: next type, u: scroll offset 0..1 }
  const feedAt = (i, kind, t, lock) => {
    const per = 1.1 + hash(i, 2) * 1.3, ph = hash(i, 5) * per, v = (t + ph) / per, k = Math.floor(v), u = frac(v);
    const pick = (k) => (lock ? kind : hash(i, k + 11) < 0.35 ? kind : GEN[Math.floor(hash(i, k + 31) * 4)]);
    const sc = u > 0.86 ? E((u - 0.86) / 0.14, "io") : 0;
    return { a: pick(k), b: pick(k + 1), u: lock ? 0 : sc, va: hash(i, k), vb: hash(i, k + 1) };
  };

  // ======================= bot_farm =======================
  // newsroom basement at night: a metal rack of phones on stands (bots), each scrolling a feed, a paper tag under
  // each with its secret interest (dog, dancer, star sign); a side rack and a back rack make 100+.
  // o.count 1.0 "100+ BOTS"; o.dog 3.0, o.dance 4.0, o.astro 5.0 spotlight one phone of each; o.nosearch 7.0
  // a crossed-out keyboard card "NO SEARCHING".
  K.bot_farm = (o) => {
    const SH = [108, 166, 224, 282], X0 = 92, NS = 12, PIT = 38, PW = 15, PHH = 27;
    const phones = [];
    SH.forEach((sy, s) => { for (let j = 0; j < NS; j++) { const i = phones.length; phones.push({ i, x: X0 + 8 + j * PIT + Math.round((hash(i, 1) - 0.5) * 4), y: sy - PHH - 4, kind: KINDS[Math.floor(hash(i, 3) * 3)], s, tilt: hash(i, 9) }); } });
    const HL = { dog: 14, dance: 30, astro: 43 };   // which phone each spotlight picks
    for (const k of KINDS) phones[HL[k]].kind = k;
    return (g, t, d, c) => {
      const T = tm(o, d, 12.0), tC = T("count", 1.0), tN = T("nosearch", 7.0);
      const beats = KINDS.map((k) => [T(k, { dog: 3.0, dance: 4.0, astro: 5.0 }[k]), k]);
      // active spotlight = latest beat already started, unless "no searching" started after it
      let act = null; for (const [bt, k] of beats) if (t >= bt && (!act || bt >= act[0])) act = [bt, k];
      if (act && t >= tN && tN >= act[0]) act = null;
      const nsA = t >= tN ? PX.p(t, tN, 0.5, "out") : 0;
      R(g, 0, 0, 640, 360, D.n1);
      basementWall(g, c, t, 0.35);
      // back rack (far, small, dim): more bots
      PX.par(g, c, 0.55, () => {
        for (const by of [70, 104]) {
          R(g, 470, by, 150, 3, D.n3); R(g, 470, by + 3, 150, 1, D.n0);
          for (let j = 0; j < 12; j++) { const i = 200 + j + by, x = 474 + j * 12, f = feedAt(i, KINDS[j % 3], t);
            R(g, x, by - 13, 7, 12, D.n0); A(g, 0.55, () => vid(g, x + 1, by - 12 - Math.round(f.u * 10), 5, 10, f.a, f.va, t)); A(g, 0.55, () => vid(g, x + 1, by - 2 - Math.round(f.u * 10), 5, 10, f.b, f.vb, t));
            R(g, x, by - 2, 7, 1, D.n0); }
          for (const ux of [468, 620]) R(g, ux, 40, 3, by - 30, D.n3);
        }
        PX.glow(g, 545, 90, 70, D.teal[1], 0.1);
      });
      tube(g, 320, 34, t, 0.55);
      // main rack: uprights, shelves, phones, tags
      const uprights = [X0 - 8, X0 + NS * PIT / 2 - 2, X0 + NS * PIT + 4];
      for (const ux of uprights) { R(g, ux, 58, 5, 260, D.n3); R(g, ux, 58, 1, 260, D.n5); R(g, ux + 4, 58, 1, 260, D.n1); for (let y = 64; y < 314; y += 6) R(g, ux + 2, y, 1, 2, D.n1); }
      // spotlight: dim layer under the active phone; draw shelves first
      for (const sy of SH) {
        R(g, X0 - 10, sy - 5, NS * PIT + 22, 5, mix(D.n3, D.n2, 0.3)); R(g, X0 - 10, sy - 5, NS * PIT + 22, 1, D.n2);
        R(g, X0 - 10, sy, NS * PIT + 22, 5, D.n4); R(g, X0 - 10, sy, NS * PIT + 22, 1, D.n6); R(g, X0 - 10, sy + 5, NS * PIT + 22, 2, D.n0);
        A(g, 0.5, () => R(g, X0 - 10, sy + 7, NS * PIT + 22, 3, D.n1));
      }
      // power strips + cables along each shelf
      SH.forEach((sy, s) => { for (let j = 0; j < NS; j += 1) { const x = X0 + 15 + j * PIT; PX.line(g, x, sy - 3, x + 6, sy + 12 + (j % 3), D.n0); } });
      for (const p of phones) {
        const { x, y } = p, lock = act && phones[HL[act[1]]] === p;
        const f = feedAt(p.i, p.kind, t, lock);
        // stand
        R(g, x + 2, y + PHH, 3, 4, D.n4); R(g, x + PW - 5, y + PHH, 3, 4, D.n4); R(g, x, y + PHH + 3, PW, 1, D.n5);
        A(g, 0.35, () => R(g, x - 2, y + PHH + 4, PW + 6, 1, "#000000"));
        phone(g, x, y, PW, PHH, (sx, sy, sw, sh) => {
          const off = Math.round(f.u * sh);
          vid(g, sx, sy - off, sw, sh, f.a, f.va, t); if (off) vid(g, sx, sy - off + sh, sw, sh, f.b, f.vb, t);
          R(g, sx + sw - 3, sy + sh - 9, 2, 2, mix(D.cream, D.n3, 0.3)); R(g, sx + sw - 3, sy + sh - 5, 2, 1, mix(D.cream, D.n3, 0.5));   // tiny side icons
          A(g, 0.12, () => R(g, sx, sy, sw, 1, D.cream));
          const op = g.globalCompositeOperation; g.globalCompositeOperation = "lighter"; A(g, 0.12, () => R(g, sx, sy, sw, sh, D.glass)); g.globalCompositeOperation = op;
        });
        PX.glow(g, x + PW / 2, y + PHH / 2, 20, D.teal[0], 0.09);
        A(g, 0.22, () => ell(g, x + PW / 2, y + PHH + 2, 11, 1, D.teal[0]));
        if (PX.blink(t + hash(p.i, 4) * 5, 3.1, 0.5)) R(g, x + PW - 3, y + PHH - 1, 1, 1, D.moss[1]);
        // paper tag hanging from the shelf lip, with the secret interest icon
        const ty = SH[p.s] + 6, tx = x + 3, sw = Math.sin(t * 1.3 + p.i) * 0.6;
        R(g, tx + 4, ty, 1, 2, D.n6);
        R(g, tx + Math.round(sw), ty + 2, 10, 8, mix(D.paper, D.n2, 0.45)); R(g, tx + Math.round(sw), ty + 2, 10, 1, mix(D.paper, D.n2, 0.25));
        icon(g, p.kind, tx + Math.round(sw) + (p.kind === "dog" ? 1 : 2), ty + 4 - (p.kind === "dog" ? 0 : 1) + (p.kind === "dog" ? 1 : 0), D.ink);
      }
      // status LEDs on the uprights (slow, calm)
      for (let k = 0; k < 8; k++) { const on = PX.blink(t + k * 0.7, 2.6, 0.12); R(g, uprights[k % 3] + 2, 120 + k * 24, 1, 1, on ? D.moss[0] : D.moss[2]); }
      // foreground: side rack edge on the right, cables on the floor
      PX.par(g, c, 1.15, () => {
        PX.vgrad(g, -40, 318, 720, 60, D.n2, D.n0, 4);
        A(g, 0.25, () => { for (let k = 0; k < 7; k++) R(g, 90 + k * 70, 322, 30, 1, D.teal[2]); });
        for (let k = 0; k < 5; k++) { const pts = []; for (let i = 0; i <= 60; i++) { const u = i / 60; pts.push([lerp(60 + k * 120, 140 + k * 110, u), 330 + Math.sin(u * Math.PI) * (8 + k * 2) + k]); } for (const [px, py] of pts) R(g, px, py, 1, 2, D.n0); }
        // side rack seen edge-on, close to camera (dark, a few phones glowing)
        R(g, 600, 30, 8, 340, D.n2); R(g, 600, 30, 1, 340, D.n4);
        for (let k = 0; k < 4; k++) { const yy = 90 + k * 64; R(g, 586, yy, 60, 4, D.n2); R(g, 586, yy, 60, 1, D.n4);
          for (let j = 0; j < 2; j++) { const f = feedAt(300 + k * 2 + j, KINDS[(k + j) % 3], t); R(g, 612 + j * 16, yy - 30, 13, 27, D.n0); A(g, 0.6, () => vid(g, 613 + j * 16, yy - 28, 11, 23, f.a, f.va, t)); } }
        R(g, -30, 30, 26, 340, D.n0);
        // journalist's desk corner, bottom left: lamp, laptop with a running log, mug, notebook
        poly(g, [[-30, 300], [196, 290], [214, 372], [-30, 372]], mix(D.n2, D.rust[2], 0.3));
        poly(g, [[-30, 300], [196, 290], [204, 330], [-30, 340]], mix(D.n3, D.rust[2], 0.35));
        A(g, 0.45, () => ell(g, 66, 303, 62, 7, mix(D.lampD, D.n3, 0.35)));
        A(g, 0.4, () => ell(g, 66, 302, 36, 4, mix(D.lamp, D.lampD, 0.5)));
        poly(g, [[-30, 300], [196, 290], [197, 292], [-30, 302]], mix(D.n5, D.lampD, 0.45));
        A(g, 0.5, () => poly(g, [[-30, 303], [197, 293], [199, 300], [-30, 312]], D.n0));
        // lamp
        R(g, 18, 292, 18, 3, D.n4); R(g, 18, 292, 18, 1, D.n6); thick(g, 26, 292, 40, 262, D.n5, 2); thick(g, 40, 262, 64, 256, D.n5, 2); R(g, 39, 261, 3, 3, D.n6);
        poly(g, [[56, 250], [76, 248], [83, 263], [51, 266]], D.n4); PX.line(g, 56, 250, 76, 248, D.n6); R(g, 53, 264, 29, 2, D.lamp); R(g, 57, 266, 21, 1, D.cream);
        PX.glow(g, 67, 272, 50, D.lamp, 0.32); PX.glow(g, 70, 300, 110, D.lampD, 0.2);
        // notebook
        poly(g, [[86, 300], [128, 297], [131, 312], [88, 315]], D.paper); for (let k = 0; k < 4; k++) PX.line(g, 92, 304 + k * 3, 124, 301 + k * 3, D.paperD);
        // laptop (screen facing us, slightly turned)
        poly(g, [[132, 296], [190, 292], [192, 300], [134, 304]], D.n2); poly(g, [[136, 250], [186, 246], [190, 292], [134, 296]], D.n2);
        poly(g, [[139, 253], [184, 250], [187, 289], [137, 292]], mix(D.n1, D.teal[2], 0.35));
        clip(g, 138, 251, 49, 40, () => { const sc = Math.floor(t * 3); for (let k = 0; k < 8; k++) { const w2 = 8 + Math.floor(hash(sc + k, 1) * 26); R(g, 142, 287 - k * 4 - 0, w2, 1, mix(D.teal[0], D.n2, 0.25 + 0.06 * k)); } });
        PX.glow(g, 160, 272, 36, D.teal[0], 0.12);
        // mug
        R(g, 100, 284, 9, 10, D.n6); R(g, 100, 284, 9, 1, D.n7); R(g, 109, 286, 2, 5, D.n6); R(g, 101, 285, 7, 2, mix(D.rust[2], D.n0, 0.5));
        for (let i = 0; i < 3; i++) { const k = frac(t * 0.5 + i / 3); A(g, 0.35 * (1 - k), () => R(g, 103 + Math.round(Math.sin(k * 6 + i) * 2), 281 - k * 14, 1, 3, D.cream)); }
      });
      // spotlight on the active phone: dim everything else, bracket + enlarged tag card
      const fadeHL = act ? PX.p(t, act[0], 0.35, "out") : 0;
      if (act && fadeHL > 0) {
        const p = phones[HL[act[1]]], hx0 = p.x - 6, hy0 = p.y - 6, hw = PW + 12, hh = PHH + 26;
        g.save(); g.beginPath(); g.rect(0, 0, 640, 360); g.rect(hx0 + hw, hy0, -hw, hh); g.clip("evenodd");
        A(g, 0.55 * fadeHL, () => R(g, 0, 0, 640, 360, D.n0)); g.restore();
        PX.glow(g, p.x + PW / 2, p.y + PHH / 2, 40, D.teal[0], 0.2 * fadeHL);
        A(g, fadeHL, () => {
          for (const [bx, by, sx, sy] of [[hx0, hy0, 1, 1], [hx0 + hw - 1, hy0, -1, 1], [hx0, hy0 + hh - 1, 1, -1], [hx0 + hw - 1, hy0 + hh - 1, -1, -1]]) { R(g, bx, by, 4 * sx, 1, D.cream); R(g, bx, by, 1, 4 * sy, D.cream); }
          // enlarged tag card on a thread, above-right of the phone
          const k = PX.p(t, act[0], 0.45, "back"), cx = p.x + PW + 16, cy = p.y - 30 + Math.round((1 - k) * 8), cw = 34, ch = 28;
          PX.line(g, p.x + PW / 2 + 4, SH[p.s] + 8, cx + 4, cy + ch, D.n6);
          A(g, 0.5, () => R(g, cx + 2, cy + 2, cw, ch, "#000000"));
          R(g, cx, cy, cw, ch, D.paper); R(g, cx, cy, cw, 1, D.cream); R(g, cx, cy + ch - 1, cw, 1, D.paperD); R(g, cx + 3, cy + 3, 2, 2, D.paperD);
          const ink = D.ink;
          if (act[1] === "dog") dogShape(g, cx + cw / 2 - 1, cy + ch - 5, 20, t, { fur: [mix(D.ink, D.paper, 0.4), ink, ink] });
          else if (act[1] === "dance") dancerShape(g, cx + cw / 2, cy + ch - 4, 21, t, ink);
          else { const sx = cx + cw / 2 + 4, sy = cy + ch / 2; PX.circle(g, cx + 10, sy - 2, 6, ink); PX.circle(g, cx + 13, sy - 4, 5, D.paper);
            poly(g, [[sx + 6, sy - 9], [sx + 8, sy - 3], [sx + 14, sy - 3], [sx + 9, sy + 1], [sx + 11, sy + 7], [sx + 6, sy + 3], [sx + 1, sy + 7], [sx + 3, sy + 1], [sx - 2, sy - 3], [sx + 4, sy - 3]], ink); }
        });
      }
      PX.particles(g, 7, 30, t, [150, 40, 340, 260], { vy: -1.5, vx: 1, col: D.steel[0], a: 0.35 });
      PX.vignette(g, 0.55);
      label(g, "100+ BOTS", 320, 50, t, tC, { out: tN });
      // NO SEARCHING card: a keyboard icon crossed out
      if (nsA > 0) {
        A(g, 0.5 * nsA, () => R(g, 0, 0, 640, 360, D.n0));
        const cx = 320, cy = 196 + Math.round((1 - nsA) * 6), w = 132, h = 66;
        A(g, nsA, () => {
          A(g, 0.5, () => R(g, cx - w / 2 + 3, cy - h / 2 + 3, w, h, "#000000"));
          R(g, cx - w / 2, cy - h / 2, w, h, mix(D.n2, D.steel[2], 0.25)); PX.box(g, cx - w / 2, cy - h / 2, w, h, D.n5); R(g, cx - w / 2 + 1, cy - h / 2 + 1, w - 2, 1, D.n6);
          // keyboard
          const kx = cx - 44, ky = cy - 24;
          R(g, kx, ky, 88, 30, D.n1); R(g, kx, ky, 88, 1, D.n5);
          for (let rr = 0; rr < 4; rr++) for (let kk = 0; kk < (rr === 3 ? 1 : 11); kk++) {
            const w2 = rr === 3 ? 40 : 6, x2 = rr === 3 ? kx + 24 : kx + 4 + kk * 7.5 + rr * 2;
            R(g, x2, ky + 4 + rr * 6, w2, 4, D.n4); R(g, x2, ky + 4 + rr * 6, w2, 1, D.n6);
          }
          // strike: grows diagonally
          const s = E(clamp((t - tN - 0.4) / 0.4, 0, 1), "out");
          if (s > 0) { const x1 = kx - 6, y1 = ky + 36, x2 = lerp(x1, kx + 94, s), y2 = lerp(y1, ky - 6, s); thick(g, x1, y1, x2, y2, D.n0, 4); thick(g, x1, y1 - 1, x2, y2 - 1, D.rust[1], 2); }
        });
        label(g, "NO SEARCHING", cx, cy + 14, t, tN + 0.3);
      }
    };
  };
  // ======================= linger =======================
  // extreme close-up of one bot phone in its stand; a small mechanical stylus swipes the feed up. Dog videos make it
  // wait longer (the dwell bar fills further); the heart is never touched. o.linger 1.0 dog videos start lingering;
  // o.figured 6.0 the feed turns into a grid of dogs; o.clock 7.0 a desk clock sweeps to just under two "UNDER 2 HOURS".
  K.linger = (o) => {
    const PXX = 244, PY = 36, PWW = 152, PHT = 278, SCR = 0.34;
    const typeOf = (i) => (i % 5 === 2 || hash(i, 7) < 0.22 ? "dog" : GEN[Math.floor(hash(i, 8) * 4)]);
    const bok = []; { const r = PX.rnd(55); for (let i = 0; i < 34; i++) bok.push([r() * 680 - 20, [70, 132, 196, 262][Math.floor(r() * 4)] - r() * 8, 10 + r() * 8, r(), r()]); }
    return (g, t, d, c) => {
      const T = tm(o, d, 11.0), tL = T("linger", 1.0), tF = T("figured", 6.0), tCk = T("clock", 7.0);
      const tc = Math.max(t, 0);
      // feed schedule (pure in t): video i shows for dwell(i), then a swipe of SCR
      let cur = -0.4, i = 0, inScroll = 0, dw = 0;
      for (let n = 0; n < 200; n++) {
        dw = typeOf(i) === "dog" && cur >= tL - 0.3 ? 2.5 : 0.8 + hash(i, 3) * 0.3;
        if (tc < cur + dw) break;
        if (tc < cur + dw + SCR) { inScroll = (tc - cur - dw) / SCR; break; }
        cur += dw + SCR; i++;
      }
      const spent = inScroll > 0 ? dw : tc - cur, grid = E(clamp((t - tF) / 0.7, 0, 1), "io");
      R(g, 0, 0, 640, 360, D.n1);
      // far: the rest of the rack, out of focus (soft blocks of phone light)
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 440, mix(D.n2, D.steel[2], 0.15), D.n0, 8);
        for (const sy of [86, 148, 212, 278]) { A(g, 0.6, () => R(g, -40, sy - 2, 720, 8, D.n2)); A(g, 0.3, () => R(g, -40, sy - 3, 720, 1, D.n4)); }
        for (const [bx, by, bs, k, ph] of bok) {
          const col = k < 0.3 ? D.teal[0] : k < 0.55 ? D.glass : k < 0.8 ? D.steel[0] : D.paper, a = 0.12 + 0.08 * Math.sin(t * 0.7 + ph * 6);
          A(g, a, () => { ell(g, bx, by - bs, bs * 0.55, bs * 0.9, col); }); PX.glow(g, bx, by - bs, bs * 1.6, col, a * 0.5);
        }
        R(g, 0, 0, 640, 10, D.n0); A(g, 0.5, () => R(g, 180, 12, 280, 3, D.steel[0])); PX.glow(g, 320, 14, 160, D.steel[0], 0.08);
      });
      // mid: shelf the stand sits on
      PX.par(g, c, 0.85, () => {
        R(g, -40, 316, 720, 8, D.n3); R(g, -40, 316, 720, 1, D.n5); R(g, -40, 324, 720, 40, D.n1);
        A(g, 0.3, () => ell(g, 320, 318, 130, 3, D.teal[0]));
      });
      // phone stand: clamp arms behind the phone, stem down
      R(g, 312, 300, 16, 18, D.n3); R(g, 312, 300, 2, 18, D.n5); R(g, 290, 314, 60, 4, D.n4); R(g, 290, 314, 60, 1, D.n6);
      R(g, PXX - 6, 200, 6, 18, D.n4); R(g, PXX + PWW, 200, 6, 18, D.n3); R(g, PXX - 6, 200, 1, 18, D.n6);
      // the phone
      PX.glow(g, 320, 182, 210, D.teal[0], 0.1);
      phone(g, PXX, PY, PWW, PHT, (sx, sy, sw, sh) => {
        // full-screen feed
        const full = () => {
          const off = Math.round(E(inScroll, "io") * sh);
          vid(g, sx, sy - off, sw, sh, typeOf(i), hash(i, 1), t); if (off) vid(g, sx, sy - off + sh, sw, sh, typeOf(i + 1), hash(i + 1, 1), t);
          // overlay UI (generic short-video app): caption bars, profile disc, side actions; the heart stays an outline
          A(g, 0.35, () => R(g, sx, sy + sh - 54, sw, 54, D.n0));
          PX.circle(g, sx + 14, sy + sh - 40, 6, D.n6); PX.circle(g, sx + 14, sy + sh - 40, 5, mix(D.paperD, D.n4, 0.4));
          R(g, sx + 24, sy + sh - 43, 44, 3, D.cream); R(g, sx + 8, sy + sh - 30, 96, 2, mix(D.cream, D.n4, 0.35)); R(g, sx + 8, sy + sh - 25, 70, 2, mix(D.cream, D.n4, 0.45));
          const ix = sx + sw - 18;
          PX.sprite(g, [".xx.xx.", "x..x..x", "x.....x", ".x...x.", "..x.x..", "...x..."], ix - 1, sy + sh * 0.5, { x: D.cream });
          PX.sprite(g, ["xxxxxx", "x....x", "x....x", "xxxxxx", ".x....", "x....."], ix, sy + sh * 0.5 + 18, { x: mix(D.cream, D.n5, 0.2) });
          PX.sprite(g, ["...x..", "....x.", "xxxxxx", "x...x.", "x..x..", "x....."], ix, sy + sh * 0.5 + 34, { x: mix(D.cream, D.n5, 0.2) });
          // dwell bar: time spent on this video (fills further on dog videos)
          const k = clamp(spent / 2.6, 0, 1), bx = sx + 16, by = sy + sh - 14, bw = sw - 24;
          PX.sprite(g, ["xxxxx", ".x.x.", "..x..", ".x.x.", "xxxxx"], sx + 7, by - 1, { x: D.cream });
          R(g, bx, by, bw, 4, D.n2); R(g, bx, by, Math.round(bw * k), 4, mix(D.cream, D.lamp, k)); R(g, bx, by, Math.round(bw * k), 1, D.cream);
          if (k > 0.9) PX.glow(g, bx + bw * k, by + 2, 10, D.lamp, 0.4);
        };
        // grid of dogs after "figured out"
        const gridV = () => {
          R(g, sx, sy, sw, sh, D.n1);
          const gw = Math.floor((sw - 9) / 2), gh = Math.round(gw * 1.45), off = Math.max(0, t - tF) * 16, st = gh + 3;
          for (let row = -1; row < 6; row++) {
            const rr = row + Math.floor(off / st), yy = sy + 14 + row * st - (off % st);
            for (let col = 0; col < 2; col++) { const xx = sx + 3 + col * (gw + 3); vid(g, xx, yy, gw, gh, "dog", hash(rr, col + 40), t + col);
              R(g, xx + 3, yy + gh - 7, gw * 0.5, 2, mix(D.cream, D.n4, 0.3)); }
          }
          R(g, sx, sy, sw, 12, D.n1); R(g, sx + sw / 2 - 18, sy + 4, 16, 3, D.cream); R(g, sx + sw / 2 + 4, sy + 4, 16, 3, D.n5);
        };
        if (grid < 1) full();
        if (grid > 0) A(g, grid, () => { g.save(); g.translate(0, Math.round((1 - grid) * 30)); gridV(); g.restore(); });
        // status bar: signal + battery icons only
        R(g, sx, sy, sw, 9, mix(D.n0, D.n1, 0.5));
        for (let k = 0; k < 4; k++) R(g, sx + 6 + k * 3, sy + 6 - k, 2, 1 + k, D.cream);
        PX.box(g, sx + sw - 18, sy + 2, 11, 5, D.cream); R(g, sx + sw - 17, sy + 3, 7, 3, D.cream); R(g, sx + sw - 7, sy + 3, 1, 3, D.cream);
        // glass reflection from the ceiling tube
        A(g, 0.06, () => poly(g, [[sx, sy + 40], [sx + 60, sy], [sx + 90, sy], [sx, sy + 70]], D.cream));
      }, { bez: 6, top: 14, bot: 14, edge: D.n5 });
      R(g, PXX + PWW / 2 - 14, PY + 5, 28, 3, D.n0); PX.circle(g, PXX + PWW / 2 + 22, PY + 6, 1, D.n3);
      R(g, PXX + PWW, PY + 60, 2, 26, D.n4); R(g, PXX - 2, PY + 50, 2, 16, D.n4);
      // mechanical stylus: hovers top right, presses + drags up on each swipe (never near the heart)
      {
        const hoverX = 356, hoverY = 128;
        let tx = hoverX, ty = hoverY, press = 0;
        if (grid > 0.5) { const k = frac(t * 0.5); tx = 330; ty = lerp(260, 140, E(clamp(k * 1.6, 0, 1), "io")); press = k < 0.62 ? 1 : 0; }
        else if (inScroll > 0) { ty = lerp(262, 110, E(inScroll, "io")); tx = 330; press = 1; }
        else { const left = dw - spent; if (left < 0.25) { const k = 1 - left / 0.25; tx = lerp(hoverX, 330, E(k, "io")); ty = lerp(hoverY, 262, E(k, "io")); press = k > 0.9 ? 1 : 0; } }
        ty += Math.sin(t * 2.1) * 1.5;
        // arm from the top-right corner, two segments
        const bx0 = 560, jx = lerp(bx0, tx, 0.4) + 40, jy = lerp(8, ty, 0.5) - 20;
        R(g, 470, 0, 170, 8, D.n2); R(g, 470, 7, 170, 1, D.n4);                               // ceiling rail
        R(g, bx0 - 8, 0, 16, 12, D.n3); R(g, bx0 - 8, 11, 16, 1, D.n5);
        seg(g, bx0, 8, jx, jy, 7, D.n4, D.n6); seg(g, jx, jy, tx + 2, ty - 18, 5, D.n4, D.n7); PX.glow(g, jx, jy, 30, D.teal[0], 0.06);
        PX.circle(g, jx, jy, 5, D.n2); PX.circle(g, jx, jy, 4, D.n4); PX.circle(g, jx - 1, jy - 1, 2, D.n6); R(g, jx, jy, 1, 1, D.n1);
        R(g, tx - 2, ty - 20, 6, 14, D.n3); R(g, tx - 2, ty - 20, 1, 14, D.n6); R(g, tx - 1, ty - 6, 4, 4 + press, mix(D.n2, D.rust[2], 0.3));
        if (press) A(g, 0.5, () => ell(g, tx + 1, ty, 5, 2, D.cream));
        R(g, tx + 3, ty - 17, 1, 1, PX.blink(t, 0.8, 0.5) ? D.rust[0] : D.rust[2]);
      }
      // the bot's tag on the stand: its secret interest
      { const sw2 = Math.round(Math.sin(t * 1.1) * 1); R(g, PXX - 4, 218, 1, 8, D.n6); R(g, PXX - 11 + sw2, 226, 15, 12, mix(D.paper, D.n3, 0.2)); R(g, PXX - 11 + sw2, 226, 15, 1, D.paper); icon(g, "dog", PXX - 7 + sw2, 230, D.ink); }
      // desk clock on the shelf (right): sweeps from twelve to just under two
      if (t >= tCk) {
        const a0 = PX.p(t, tCk, 0.4, "out"), sw = E(clamp((t - tCk - 0.2) / 1.8, 0, 1), "io"), cx = 492, cy = 268, r = 22;
        A(g, a0, () => {
          A(g, 0.5, () => ell(g, cx + 3, 316, 24, 3, "#000000"));
          R(g, cx - 14, 286, 6, 30, D.n3); R(g, cx + 8, 286, 6, 30, D.n3);
          PX.circle(g, cx, cy, r + 3, D.n4); PX.circle(g, cx - 1, cy - 1, r + 2, D.n6); PX.circle(g, cx, cy, r + 1, D.n3); PX.circle(g, cx, cy, r, D.paper);
          for (let k = 0; k < 12; k++) { const an = (k / 12) * TAU; R(g, Math.round(cx + Math.sin(an) * (r - 3)), Math.round(cy - Math.cos(an) * (r - 3)), k % 3 ? 1 : 2, k % 3 ? 1 : 2, D.ink); }
          // shaded sector: the time it took
          const ha = sw * (110 / 60) * (TAU / 12);
          for (let rr = 3; rr < r - 4; rr++) for (let k = 0; k <= 40; k++) { const an = (k / 40) * ha; A(g, 0.25, () => R(g, Math.round(cx + Math.sin(an) * rr), Math.round(cy - Math.cos(an) * rr), 1, 1, D.teal[1])); }
          const ma = sw * (110 / 60) * TAU;
          thick(g, cx, cy, cx + Math.sin(ha) * (r * 0.5), cy - Math.cos(ha) * (r * 0.5), D.ink, 2);
          PX.line(g, cx, cy, cx + Math.sin(ma) * (r - 4), cy - Math.cos(ma) * (r - 4), D.ink);
          R(g, cx - 1, cy - 1, 3, 3, D.rust[2]);
          A(g, 0.15, () => ell(g, cx - 7, cy - 9, 8, 4, D.cream));
        });
        label(g, "UNDER 2 HOURS", cx, 300, t, tCk + 0.6, { size: 8 });
      }
      PX.particles(g, 21, 26, t, [60, 30, 520, 280], { vy: -1.2, vx: 0.8, col: D.steel[0], a: 0.3 });
      PX.vignette(g, 0.55);
    };
  };
  // ---------- You (recurring character): 20s, dark wavy hair, mustard hoodie, medium-brown skin ----------
  const SKIN = () => { const s = mix(D.rust[2], D.paperD, 0.5); return [mix(s, D.lamp, 0.25), s, mix(s, D.n0, 0.4)]; };
  const HOOD = (dark) => { const h = mix(mix(D.amber[2], D.paperD, 0.12), D.n2, dark || 0); return [mix(h, D.amber[1], 0.3), h, mix(h, D.n0, 0.5)]; };
  // curled up on a sofa, knees up, side 3/4 facing right, phone held above the knees. hip on the seat at (x, y).
  // o.lit 0..1 phone light on the face, o.lid 0..1 heavy eyelids, o.flick thumb offset (px), o.lean px toward the phone
  const youSit = (g, x, y, t, o) => {
    o = o || {}; const [sl, sb, sd] = SKIN(), [hl, hb, hd] = HOOD(0.3), hair = mix(D.n0, D.rust[2], 0.16), hairL = mix(D.n3, D.rust[2], 0.3);
    const jean = mix(D.steel[2], D.n1, 0.4), jeanL = mix(D.steel[1], D.n2, 0.45), jeanD = mix(jean, D.n0, 0.4);
    const lean = o.lean || 0, br = Math.round(Math.sin(t * 1.4) * 0.7), L = o.lit === undefined ? 1 : o.lit;
    const lit = (col, k) => mix(col, D.teal[0], 0.3 * L * (k === undefined ? 1 : k));
    const kx = x + 30, ky = y - 34;                 // knee
    const sx = x + 6 + lean, sy = y - 52 + br;       // shoulder (top of torso)
    const px = x + 40 + lean, py = y - 54 + br;      // phone centre
    // far leg (behind), then torso, then near leg
    poly(g, [[x + 2, y - 10], [kx - 2, ky - 2], [kx + 5, ky + 4], [x + 6, y]], jeanD);
    poly(g, [[kx - 2, ky], [kx + 6, ky + 2], [kx + 9, y - 2], [kx + 1, y - 2]], jeanD);
    // torso: hunched, hoodie
    poly(g, [[x - 11, y + 1], [x + 10, y + 1], [sx + 16, sy + 10], [sx + 8, sy - 1], [sx - 9, sy + 2], [x - 13, y - 14]], hb);
    poly(g, [[x - 11, y + 1], [x - 4, y + 1], [sx - 5, sy + 6], [sx - 9, sy + 2], [x - 13, y - 14]], hd);
    poly(g, [[x + 4, y], [x + 10, y + 2], [sx + 16, sy + 10], [sx + 11, sy + 8]], lit(hl, 0.9));
    R(g, x - 11, y - 2, 21, 3, hd);
    // hood folded behind the neck
    ell(g, sx - 5, sy + 2, 7, 4, hd); ell(g, sx - 4, sy + 1, 5, 2, hb);
    // near leg: thigh up to the knee, shin down to the foot on the seat
    poly(g, [[x - 2, y - 12], [kx - 3, ky - 4], [kx + 6, ky + 4], [x + 6, y + 2]], jean);
    PX.line(g, x - 1, y - 13, kx - 3, ky - 5, jeanL);
    poly(g, [[kx - 3, ky - 3], [kx + 6, ky], [kx + 10, y - 3], [kx + 2, y - 3]], jean);
    PX.line(g, kx + 6, ky + 1, kx + 10, y - 4, lit(jeanL));
    R(g, kx + 1, y - 4, 13, 4, mix(D.paper, D.n3, 0.45)); R(g, kx + 1, y - 4, 13, 1, mix(D.paper, D.n3, 0.25));   // sock
    // head, tilted down toward the phone
    const hx0 = sx + 8, hy0 = sy - 13;
    R(g, hx0 - 4, hy0 + 7, 8, 7, sd); R(g, hx0 - 2, hy0 + 7, 6, 6, sb);                                                     // neck
    ell(g, hx0, hy0, 10, 11, sb);
    poly(g, [[hx0 + 3, hy0 - 3], [hx0 + 11, hy0 + 1], [hx0 + 12, hy0 + 5], [hx0 + 9, hy0 + 10], [hx0 + 2, hy0 + 11]], sb);   // face plane
    poly(g, [[hx0 + 6, hy0 - 1], [hx0 + 12, hy0 + 2], [hx0 + 12, hy0 + 6], [hx0 + 9, hy0 + 10], [hx0 + 5, hy0 + 9]], lit(sl));
    R(g, hx0 + 11, hy0 + 2, 2, 3, lit(sl)); R(g, hx0 + 12, hy0 + 4, 1, 1, sd);                                              // nose
    R(g, hx0 + 6, hy0 + 11, 5, 1, lit(sl, 0.6));                                                                            // jaw lit from below
    R(g, hx0, hy0 + 2, 3, 5, sd); R(g, hx0 + 1, hy0 + 3, 1, 3, mix(sd, D.n0, 0.3));                                          // ear
    // eye: tired; blinks; phone glint
    const bl = PX.blink(t + 0.7, 3.7, 0.05), lid = o.lid || 0;
    if (!bl) { R(g, hx0 + 7, hy0 + 2, 3, 2, D.n0); if (lid > 0.35) R(g, hx0 + 7, hy0 + 2, 3, 1, sd); else R(g, hx0 + 9, hy0 + 2, 1, 1, D.glass); }
    else R(g, hx0 + 7, hy0 + 3, 3, 1, sd);
    R(g, hx0 + 6, hy0, 5, 1, hair);                                                                                         // brow
    R(g, hx0 + 9, hy0 + 8, 2, 1, mix(sd, D.rose[2], 0.4));                                                                  // mouth
    // dark wavy hair: volume on top and back, curls
    ell(g, hx0 - 2, hy0 - 6, 11, 7, hair); ell(g, hx0 - 6, hy0, 6, 8, hair);
    for (let k = 0; k < 6; k++) { R(g, hx0 - 11 + k * 4, hy0 - 13 + (k % 2), 4, 2, hair); }
    for (let k = 0; k < 3; k++) R(g, hx0 - 12, hy0 - 6 + k * 4 + (k % 2), 2, 3, hair);
    R(g, hx0 + 4, hy0 - 6, 6, 3, hair); R(g, hx0 + 8, hy0 - 4, 3, 3, hair); R(g, hx0 + 6, hy0 - 3, 2, 2, hair);
    for (let k = 0; k < 4; k++) R(g, hx0 - 8 + k * 4, hy0 - 10 + (k % 2), 2, 1, hairL);
    R(g, hx0 + 5, hy0 - 5, 3, 1, lit(hairL, 0.6));
    // near arm: upper arm down to the knee, forearm up to the phone, hands round it
    const ex = sx + 12, ey = sy + 26;
    poly(g, [[sx + 2, sy + 4], [sx + 13, sy + 5], [ex + 5, ey], [ex - 4, ey + 1]], hb);
    PX.line(g, sx + 2, sy + 5, ex - 4, ey, hd);
    poly(g, [[ex - 4, ey + 2], [ex + 5, ey - 4], [px + 2, py + 3], [px - 3, py + 10]], lit(hb, 0.5));
    R(g, ex - 4, ey - 1, 9, 3, hd);
    // phone: back towards us, screen light spills to the face
    R(g, px - 2, py - 8, 5, 14, D.n1); R(g, px - 2, py - 8, 1, 14, D.n4); R(g, px + 2, py - 8, 1, 14, lit(D.n5, 1));
    R(g, px - 5, py + 1, 7, 6, sb); R(g, px - 5, py + 1, 7, 1, lit(sl)); R(g, px - 5, py + 6, 7, 1, sd);
    R(g, px + 2, py - 4 + (o.flick || 0), 3, 3, lit(sl));         // thumb on the screen
    return { px, py, hx: hx0, hy: hy0 };
  };

  // ======================= ballot =======================
  // living room at 1 a.m.: You on the sofa scrolling, phone light on the face, the floor lamp off, a city window.
  // Every pause drops a small glowing ballot into a clear ballot box beside the sofa, faster and faster.
  // o.votes 1.0 first ballot; o.label 0.5 "HESITATION"
  K.ballot = (o) => {
    const city = []; { const r = PX.rnd(808); let bx = 396; while (bx < 600) { const bw = 10 + Math.floor(r() * 20), bh = 30 + r() * 90, win = []; for (let yy = 0; yy < bh - 6; yy += 6) for (let xx = 2; xx < bw - 3; xx += 4) if (r() < 0.12) win.push([xx, yy, r()]); city.push([bx, bw, bh, win]); bx += bw + 2; } }
    const pileR = PX.rnd(17), pile = []; for (let i = 0; i < 80; i++) pile.push([pileR(), pileR(), pileR()]);
    return (g, t, d, c) => {
      const T = tm(o, d, 9.0), tV = T("votes", 1.0), tLb = T("label", 0.5);
      // vote times: intervals shrink (1.1 s, then x0.8 each, never under 0.24 s)
      const votes = []; { let vt = tV, iv = 1.1; for (let k = 0; k < 90 && vt < t + 2; k++) { votes.push(vt); vt += iv; iv = Math.max(0.24, iv * 0.8); } }
      const FL = 0.95;  // flight time
      const landed = votes.filter((v) => v + FL <= t).length;
      const lastV = votes.filter((v) => v <= t).pop();
      const sincePause = lastV === undefined ? 99 : t - lastV;
      R(g, 0, 0, 640, 360, D.n1);
      // far: wall + window with the night city
      PX.par(g, c, 0.5, () => {
        PX.vgrad(g, -40, -40, 720, 380, mix(D.n2, D.steel[2], 0.12), D.n1, 8);
        const wx = 392, wy = 44, ww = 212, wh = 150;
        R(g, wx - 6, wy - 6, ww + 12, wh + 12, D.n2);
        PX.vgrad(g, wx, wy, ww, wh, mix(D.n0, D.steel[2], 0.3), mix(D.n2, D.steel[2], 0.45), 6);
        PX.circle(g, wx + 46, wy + 30, 7, mix(D.cream, D.n6, 0.2)); PX.circle(g, wx + 49, wy + 28, 6, mix(D.n1, D.steel[2], 0.3)); PX.glow(g, wx + 46, wy + 30, 30, D.cream, 0.1);
        for (const [bx, bw, bh, win] of city) { const top = wy + wh - bh; R(g, bx, top, Math.min(bw, wx + ww - bx), bh, mix(D.n0, D.steel[2], 0.25));
          for (const [xx, yy, k] of win) if (bx + xx < wx + ww - 2) A(g, 0.5 + 0.4 * Math.sin(t * 0.3 + k * 9), () => R(g, bx + xx, top + 4 + yy, 2, 2, k < 0.25 ? D.teal[0] : D.lampD)); }
        R(g, wx + ww / 2 - 2, wy, 4, wh, D.n2); R(g, wx, wy + wh / 2 - 2, ww, 3, D.n2);
        R(g, wx - 10, wy + wh + 5, ww + 20, 5, D.n3); R(g, wx - 10, wy + wh + 5, ww + 20, 1, D.n5);
        // curtains breathing
        const br = Math.sin(t * 0.6) * 2;
        for (const [cx0, dir] of [[wx - 16, 1], [wx + ww - 14, -1]]) { for (let k = 0; k < 5; k++) { const xx = cx0 + k * 6 + (k === 4 ? br * dir : 0); R(g, xx, wy - 12, 6, wh + 30, k % 2 ? mix(D.n3, D.steel[2], 0.25) : mix(D.n2, D.steel[2], 0.25)); } R(g, cx0, wy - 12, 30, 1, D.n4); }
        R(g, wx - 24, wy - 16, ww + 48, 3, D.n4);
        // tall bookshelf at the far left
        R(g, 0, 100, 48, 196, D.n2); R(g, 46, 100, 2, 196, D.n3);
        { const rb = PX.rnd(31); for (const sy of [126, 166, 206, 246]) { R(g, 0, sy, 48, 3, D.n3); let xx = 3; while (xx < 42) { const w = 3 + Math.floor(rb() * 4), h = 18 + Math.floor(rb() * 14); R(g, xx, sy - h, w, h, mix([D.n3, D.steel[2], D.rust[2], D.moss[2]][Math.floor(rb() * 4)], D.n1, 0.5)); xx += w + 1; } } }
        // picture frame on the left wall
        R(g, 150, 70, 46, 34, D.n3); R(g, 153, 73, 40, 28, mix(D.n2, D.moss[2], 0.25)); poly(g, [[153, 101], [168, 84], [180, 94], [193, 80], [193, 101]], mix(D.n2, D.moss[2], 0.45));
      });
      // moonlight on the floor
      A(g, 0.07, () => poly(g, [[420, 296], [560, 296], [620, 360], [440, 360]], D.cream));
      // floor
      PX.par(g, c, 0.8, () => {
        R(g, -40, 292, 720, 80, mix(D.n2, D.rust[2], 0.15)); R(g, -40, 292, 720, 1, D.n3);
        for (let k = 0; k < 8; k++) R(g, -40, 300 + k * 8, 720, 1, mix(D.n1, D.rust[2], 0.12));
        // floor lamp, switched off (left)
        R(g, 56, 288, 26, 4, D.n3); R(g, 56, 288, 26, 1, D.n5); R(g, 68, 120, 2, 168, D.n3); R(g, 68, 120, 1, 168, D.n4);
        poly(g, [[52, 122], [86, 122], [80, 96], [58, 96]], mix(D.n3, D.paperD, 0.18)); R(g, 58, 96, 22, 1, D.n4); R(g, 52, 121, 34, 1, D.n2);
        PX.line(g, 78, 122, 78, 136, D.n5); R(g, 77, 136, 3, 2, D.n5);
      });
      // phone light: cool pool on the face and sofa (flickers with scrolling)
      const scrolling = sincePause > 0.35, fl = scrolling ? 0.85 + 0.15 * Math.sin(t * 23) : 1;
      // sofa
      const sofa = mix(D.steel[2], D.n1, 0.6), sofaD = mix(sofa, D.n0, 0.45), sofaL = mix(sofa, D.n6, 0.18);
      A(g, 0.5, () => ell(g, 250, 296, 160, 6, "#000000"));
      R(g, 110, 182, 260, 66, sofa); R(g, 110, 182, 260, 2, sofaL); R(g, 110, 246, 260, 2, sofaD);
      for (const sx of [110, 197, 284]) { R(g, sx + 85, 186, 2, 58, sofaD); }
      R(g, 96, 214, 22, 76, sofaD); R(g, 96, 214, 22, 2, sofa);                // left arm
      R(g, 100, 246, 284, 16, sofa); R(g, 100, 246, 284, 1, sofaL);           // seat
      for (const sx of [195, 282]) R(g, sx, 247, 1, 14, sofaD); R(g, 100, 260, 284, 2, mix(sofa, D.n0, 0.25));
      R(g, 100, 262, 284, 26, sofaD); R(g, 106, 288, 6, 6, D.n0); R(g, 372, 288, 6, 6, D.n0);
      // cushion + a throw blanket on the left
      const thr = mix(D.moss[2], D.n1, 0.72);
      poly(g, [[118, 214], [150, 206], [158, 244], [124, 248]], mix(D.rose[2], D.n1, 0.68)); PX.line(g, 118, 214, 150, 206, mix(D.rose[2], D.n3, 0.6));
      poly(g, [[96, 212], [126, 212], [130, 262], [122, 292], [100, 290]], thr); for (let k = 0; k < 4; k++) PX.line(g, 102 + k * 6, 216, 104 + k * 6, 288, mix(thr, D.n0, 0.3));
      // phone light falling on the sofa around You
      PX.glow(g, 322, 226, 70, D.teal[1], 0.16);
      // You
      const lid = clamp((t - 3) / 4, 0, 1);
      const flick = scrolling ? Math.round(Math.max(0, Math.sin(t * 14)) * -3) : 0;
      const Y = youSit(g, 292, 248, t, { lit: fl, lid, flick, lean: Math.round(lid * 2) });
      // cushion + right arm in front
      R(g, 360, 214, 26, 76, sofa); R(g, 360, 214, 26, 2, sofaL); R(g, 360, 214, 2, 76, sofaL); R(g, 384, 214, 2, 76, sofaD);
      PX.glow(g, Y.px + 2, Y.py - 4, 28, D.teal[0], 0.32 * fl); PX.glow(g, Y.hx + 6, Y.hy + 3, 16, D.teal[0], 0.25 * fl);
      // ballot box beside the sofa: clear acrylic, dark lid with a slot
      const bx = 416, by = 246, bw = 58, bh = 54;
      A(g, 0.5, () => ell(g, bx + bw / 2 + 4, by + bh + 2, 34, 4, "#000000"));
      A(g, 0.22, () => R(g, bx, by, bw, bh, D.glass));
      // pile of landed ballots (rows from the bottom)
      for (let i = 0; i < Math.min(landed, pile.length); i++) {
        const [a, b, c2] = pile[i], row = Math.floor(i / 7), px = bx + 3 + Math.round(a * (bw - 11)), py = by + bh - 5 - row * 3 - Math.round(b * 2);
        R(g, px, py, 7, 3, c2 < 0.5 ? D.paper : mix(D.paper, D.paperD, 0.6)); R(g, px, py, 7, 1, D.cream);
      }
      R(g, bx, by, 1, bh, mix(D.glass, D.n6, 0.3)); R(g, bx + bw - 1, by, 1, bh, mix(D.glass, D.n4, 0.4)); R(g, bx, by + bh - 1, bw, 1, mix(D.glass, D.n4, 0.4));
      A(g, 0.18, () => { for (let k = 0; k < 18; k++) R(g, bx + 6 + k, by + 6 + k * 2, 1, 3, D.cream); });
      R(g, bx - 3, by - 6, bw + 6, 7, D.n3); R(g, bx - 3, by - 6, bw + 6, 1, D.n5); R(g, bx + bw / 2 - 10, by - 4, 20, 2, D.n0);
      // ballots in flight: from the phone, arcing into the slot
      for (const v of votes) {
        const u = (t - v) / FL; if (u < 0 || u > 1) continue;
        const e = E(u, "io"), x0 = Y.px + 4, y0 = Y.py - 8, x1 = bx + bw / 2, y1 = by - 6;
        const px = lerp(x0, x1, e), py = lerp(y0, y1, e) - Math.sin(e * Math.PI) * 46, flip = Math.floor(u * 8) % 2;
        PX.glow(g, px, py, 10, D.lamp, 0.25 * (1 - u * 0.5));
        if (u > 0.92) continue;
        if (flip) { R(g, px - 4, py - 2, 9, 5, D.cream); R(g, px - 4, py + 2, 9, 1, D.paperD); R(g, px, py - 2, 1, 4, D.paper); }
        else { R(g, px - 3, py - 4, 6, 8, D.cream); R(g, px - 3, py + 3, 6, 1, D.paperD); R(g, px - 3, py, 6, 1, D.paper); }
      }
      // little flash at the phone on each pause
      if (sincePause < 0.3) PX.glow(g, Y.px + 3, Y.py - 6, 14, D.cream, 0.35 * (1 - sincePause / 0.3));
      // foreground: coffee table edge with a mug and a remote
      PX.par(g, c, 1.15, () => {
        R(g, 150, 318, 240, 8, mix(D.n2, D.rust[2], 0.25)); R(g, 150, 318, 240, 1, mix(D.n4, D.rust[2], 0.2)); R(g, 150, 326, 240, 40, mix(D.n0, D.rust[2], 0.15));
        R(g, 196, 306, 10, 12, D.n4); R(g, 196, 306, 10, 1, D.n6); R(g, 206, 309, 3, 5, D.n4);
        R(g, 300, 314, 26, 4, D.n2); R(g, 304, 315, 2, 1, D.rust[2]);
        A(g, 0.2, () => ell(g, 270, 319, 60, 1, D.teal[0]));
      });
      PX.particles(g, 5, 18, t, [250, 150, 140, 110], { vy: -1, vx: 0.6, col: D.teal[0], a: 0.35 });
      PX.vignette(g, 0.58);
      label(g, "HESITATION", bx + bw / 2, 222, t, tLb);
    };
  };
  // ======================= two_stage =======================
  // a warehouse of video cards (teal spines) running to the horizon; the YOU dot hangs in the aisle.
  // o.s1 1.0 stage one: cards near the dot light up, a forklift races in, the lit cards stream into its crate, it rushes
  // the crate to the front ("ROUGH AND FAST"). o.s2 7.0 stage two: a lamp clicks on over an inspector's desk; the
  // inspector takes each card, times it with a stopwatch and marks one bar on it ("SLOW AND CAREFUL").
  // o.watch 12.0 the stopwatch lights: "WATCH TIME".
  K.two_stage = (o) => {
    const VX = 226, VY = 166, F = 300, CH = 22, FX = 46;
    const P3 = (X, Y, Z) => [VX + (X * F) / Z, VY + ((CH - Y) * F) / Z];
    // shelf cards: side, Z, level, shade
    const cards = []; for (const side of [-1, 1]) for (let z = 40; z < 2600; z += 8) for (let L = 0; L < 6; L++) { const h = hash(z + side * 7, L); if (h < 0.1) continue; cards.push({ side, z, L, h, near: z > 210 && z < 360 && L > 0 && L < 5 }); }
    const nearCards = cards.filter((q) => q.near);
    nearCards.forEach((q, i) => { q.ord = hash(i, 77); });
    const YOU = { X: 0, Y: 30, Z: 285 };
    return (g, t, d, c) => {
      const T = tm(o, d, 16.0), s1 = T("s1", 1.0), s2 = T("s2", 7.0), tW = T("watch", 12.0);
      const fog = (col, z) => mix(col, D.n1, clamp((z - 120) / 1500, 0, 0.92));
      const lightUp = clamp((t - s1) / 0.6, 0, 1), grab = clamp((t - s1 - 2.0) / 1.3, 0, 1);
      R(g, 0, 0, 640, 360, D.n1);
      // ceiling + floor planes
      PX.vgrad(g, 0, 0, 640, VY, D.n0, mix(D.n1, D.steel[2], 0.2), 6);
      PX.vgrad(g, 0, VY, 640, 360 - VY, mix(D.n1, D.steel[2], 0.15), mix(D.n2, D.steel[2], 0.2), 7);
      // floor lines along the aisle + reflections of the lamps
      for (const X of [-30, 30]) { const a = P3(X, 0, 2600), b = P3(X, 0, 80); PX.line(g, a[0], a[1], b[0], b[1], mix(D.paperD, D.n2, 0.7)); }
      for (let z = 150; z < 2600; z *= 1.45) { const a = P3(-44, 0, z), b = P3(44, 0, z); A(g, 0.5, () => PX.line(g, a[0], a[1], b[0], b[1], D.n2)); }
      // ceiling lamps over the aisle (cool), their pools on the floor
      for (let z = 2200; z >= 140; z /= 1.5) {
        const [lx, ly] = P3(0, 64, z), [fx, fy] = P3(0, 0, z), w = Math.max(1, (14 * F) / z);
        PX.glow(g, fx, fy, Math.max(4, (40 * F) / z), D.steel[0], 0.12 * clamp(400 / z, 0.2, 1));
        R(g, lx - w / 2, ly, w, Math.max(1, (2 * F) / z), fog(D.n5, z)); R(g, lx - w / 2, ly + Math.max(1, (2 * F) / z), w, 1, fog(D.steel[0], z));
        PX.glow(g, lx, ly + 2, Math.max(3, (16 * F) / z), D.steel[0], 0.18);
      }
      // far end: a dim loading door with cool light
      { const p0 = P3(-16, 40, 2600), p1 = P3(16, 0, 2600); R(g, p0[0], p0[1], p1[0] - p0[0], p1[1] - p0[1], mix(D.n3, D.steel[2], 0.4)); PX.glow(g, VX, VY + 4, 30, D.steel[0], 0.18); }
      // roof girders crossing the aisle
      for (let z = 1800; z >= 60; z /= 1.6) { const a = P3(-FX, 80, z), b = P3(FX, 80, z), w = Math.max(1, (4 * F) / z); R(g, a[0], a[1] - w, b[0] - a[0], w, fog(D.n2, z)); R(g, a[0], a[1], b[0] - a[0], 1, fog(D.n3, z)); }
      // shelves: faces at X = +-FX, far to near; uprights every 64 units
      const shelfTop = 62;
      for (const side of [-1, 1]) {
        const X = side * FX;
        // backing (dark) + boards
        const a0 = P3(X, shelfTop, 2600), a1 = P3(X, 0, 2600), b0 = P3(X, shelfTop, 36), b1 = P3(X, 0, 36);
        poly(g, [a0, b0, b1, a1], D.n1);
        for (let L = 0; L <= 6; L++) { const y = L * 10.3; const p0 = P3(X, y, 2600), p1 = P3(X, y, 36); PX.line(g, p0[0], p0[1], p1[0], p1[1], mix(D.n3, D.steel[2], 0.3)); }
      }
      // cards (spines), far to near
      for (let k = cards.length - 1; k >= 0; k--) { /* order not critical; drawn below by depth */ }
      const drawCard = (q) => {
        const X = q.side * FX, y0 = q.L * 10.3 + 1.2, y1 = y0 + 7.6 + q.h * 1.2;
        const p0 = P3(X, y1, q.z), p1 = P3(X, y0, q.z + 6);
        let col = fog(mix(D.teal[2], D.teal[1], q.h * 0.8), q.z);
        if (q.z < 150) col = mix(col, D.n1, ((150 - q.z) / 110) * 0.7);
        if (q.h > 0.93) col = mix(col, D.paperD, 0.35);
        if (q.near) {
          if (grab > 0 && q.ord < grab) return;  // already grabbed
          col = mix(col, mix(D.teal[0], D.cream, 0.25), lightUp * (0.75 + 0.25 * Math.sin(t * 3 + q.h * 9)));
        }
        const x0 = Math.min(p0[0], p1[0]), x1 = Math.max(p0[0], p1[0]);
        R(g, x0, p0[1], Math.max(1, x1 - x0), Math.max(1, p1[1] - p0[1]), col);
        if (x1 - x0 > 3) R(g, x0, p0[1], Math.max(1, x1 - x0), 1, mix(col, D.cream, 0.25));
      };
      for (let k = cards.length - 1; k >= 0; k--) if (cards[k].z > 700) drawCard(cards[k]);
      for (let k = cards.length - 1; k >= 0; k--) if (cards[k].z <= 700) drawCard(cards[k]);
      // uprights
      for (const side of [-1, 1]) for (let z = 2560; z >= 40; z -= 64) {
        const X = side * FX, p0 = P3(X, shelfTop, z), p1 = P3(X, 0, z), w = Math.max(1, (3 * F) / z);
        R(g, p0[0] - w / 2, p0[1], w, p1[1] - p0[1], fog(D.n4, z)); if (w > 2) R(g, p0[0] - w / 2, p0[1], 1, p1[1] - p0[1], fog(D.n6, z));
      }
      // glow of the lit zone around the YOU dot
      const [ux, uy] = P3(YOU.X, YOU.Y, YOU.Z);
      if (lightUp > 0) for (const side of [-1, 1]) { const [gx, gy] = P3(side * FX, 26, 285); PX.glow(g, gx, gy, 46, D.teal[0], 0.22 * lightUp * (1 - grab * 0.8)); }
      // the YOU dot: always there, hanging in the aisle
      youDot(g, Math.round(ux), Math.round(uy), t);
      // ---- forklift (front view, always facing the camera) ----
      // path: arrives from far (s1+0.4..2.0), waits while cards stream in (2.0..3.4), races to the front-right (3.4..5.0)
      const fk = (() => {
        const u = t - s1;
        if (u < 0.3) return null;
        if (u < 2.0) { const e = E((u - 0.3) / 1.7, "out"); return { X: 0, Z: lerp(2200, 330, e), lift: 0, v: 1 - e }; }
        if (u < 3.4) { const e = E((u - 2.0) / 1.4, "io"); return { X: 0, Z: 330, lift: e * 10, v: 0 }; }
        if (u < 5.0) { const e = E((u - 3.4) / 1.6, "in"); return { X: lerp(0, 34, e), Z: lerp(330, 34, e), lift: 10, v: e }; }
        return null;
      })();
      // cards streaming from the shelves into the crate
      if (fk && grab > 0 && grab < 1) {
        const [cx, cy] = P3(fk.X, 14 + fk.lift, fk.Z);
        nearCards.forEach((q) => { const u = (grab - q.ord) / 0.2; if (u <= 0 || u >= 1) return; const [qx, qy] = P3(q.side * FX, q.L * 10.3 + 5, q.z); const e = E(u, "in");
          const x = lerp(qx, cx, e), y = lerp(qy, cy, e) - Math.sin(e * Math.PI) * 10; R(g, x, y, 2, 2, mix(D.teal[0], D.cream, 0.3)); });
      }
      if (fk) {
        const k = F / fk.Z / 1.3, [gx, gy] = P3(fk.X, 0, fk.Z), U = (v) => v * k;
        const body = mix(D.rust[2], D.paperD, 0.25), bodyL = mix(body, D.lamp, 0.25), bodyD = mix(body, D.n0, 0.45), bob = fk.v > 0.1 ? Math.round(Math.sin(t * 30) * U(0.6)) : 0;
        // speed streaks + dust behind
        if (fk.v > 0.15) A(g, 0.35 * fk.v, () => { for (let i = 0; i < 6; i++) { const yy = gy - U(4 + i * 7), len = U(18 + hash(i, Math.floor(t * 12)) * 26); R(g, gx - U(26) - len * 0.2, yy, 1, Math.max(1, len * 0.15), D.n5); R(g, gx + U(26), yy, 1, Math.max(1, len * 0.15), D.n5); } });
        A(g, 0.5, () => ell(g, gx, gy, U(26), Math.max(1, U(3)), "#000000"));
        const y = gy + bob;
        R(g, gx - U(20), y - U(30), U(40), U(26), bodyD); R(g, gx - U(20), y - U(30), U(40), Math.max(1, U(2)), body);           // body behind
        R(g, gx - U(22), y - U(11), U(8), U(11), D.n0); R(g, gx + U(14), y - U(11), U(8), U(11), D.n0);                           // wheels
        R(g, gx - U(16), y - U(62), Math.max(1, U(3)), U(62), D.n4); R(g, gx + U(13), y - U(62), Math.max(1, U(3)), U(62), D.n4); // mast rails
        R(g, gx - U(22), y - U(64), U(44), Math.max(1, U(3)), D.n5);                                                              // cage roof
        PX.circle(g, gx, y - U(46), Math.max(1, Math.round(U(5))), mix(D.rust[2], D.paperD, 0.5));                              // driver
        R(g, gx - U(5), y - U(52), U(10), Math.max(1, U(3)), mix(D.amber[2], D.n2, 0.4));                                       // cap
        R(g, gx - U(7), y - U(41), U(14), U(10), mix(D.steel[2], D.n2, 0.3));
        // headlights
        for (const s of [-1, 1]) { R(g, gx + s * U(17) - U(2), y - U(26), U(4), U(3), D.cream); PX.glow(g, gx + s * U(17), y - U(25), U(14), D.cream, 0.3); }
        // forks + crate
        const fy = y - U(4) - U(fk.lift);
        R(g, gx - U(13), fy, U(4), Math.max(1, U(2)), D.n6); R(g, gx + U(9), fy, U(4), Math.max(1, U(2)), D.n6);
        const cw = U(30), chh = U(18), cx0 = gx - cw / 2, cy0 = fy - chh;
        const wood = mix(D.rust[2], D.paperD, 0.45);
        R(g, cx0, cy0, cw, chh, wood); R(g, cx0, cy0, cw, Math.max(1, U(1.5)), mix(wood, D.lamp, 0.3)); R(g, cx0, cy0 + chh / 2, cw, Math.max(1, U(1)), mix(wood, D.n0, 0.3));
        R(g, cx0, cy0, Math.max(1, U(2)), chh, mix(wood, D.n0, 0.25)); R(g, cx0 + cw - Math.max(1, U(2)), cy0, Math.max(1, U(2)), chh, mix(wood, D.n0, 0.25));
        // crate contents: teal card tops, fill = grab
        const fill = clamp(grab, 0, 1); if (fill > 0) for (let i = 0; i < 14; i++) { if (hash(i, 3) > fill) continue; R(g, cx0 + U(2) + (i % 7) * U(3.8), cy0 - U(2) - Math.floor(i / 7) * U(2), Math.max(1, U(3)), Math.max(1, U(3)), mix(D.teal[0], D.teal[1], hash(i, 5))); }
        R(g, cx0 + U(2), cy0 + U(4), U(4), U(3), D.paper);
      }
      label(g, "ROUGH AND FAST", VX, 54, t, s1 + 0.3, { out: s2 - 0.6 });
      // ---- foreground: the inspector's desk (right) ----
      const lampOn = t >= s2 ? clamp((t - s2) / 0.15, 0, 1) * (t - s2 < 0.35 && hash(Math.floor((t - s2) * 20), 1) < 0.4 ? 0.5 : 1) : 0;
      const dsk = mix(D.n3, D.rust[2], 0.3), dskL = mix(dsk, D.lamp, 0.3), dskD = mix(dsk, D.n0, 0.5);
      // crate on the desk once delivered
      const delivered = t >= s1 + 5.1, cardsLeft = 18;
      // inspector cycle (period P after s2 + 0.6)
      const P = 1.6, cyc = t - s2 - 0.6, nDone = cyc > 0 ? Math.floor(cyc / P) : 0, ph = cyc > 0 ? (cyc % P) / P : -1;
      PX.par(g, c, 1.08, () => {
        // lamp pool
        if (lampOn > 0) { PX.glow(g, 476, 250, 150, D.lampD, 0.28 * lampOn); PX.glow(g, 470, 230, 60, D.lamp, 0.25 * lampOn); }
        // desk top + front
        poly(g, [[366, 266], [640, 258], [640, 274], [362, 282]], mix(dsk, dskL, lampOn * 0.5));
        poly(g, [[366, 266], [640, 258], [640, 259], [366, 267]], mix(dskL, D.lamp, lampOn * 0.3));
        poly(g, [[362, 282], [640, 274], [640, 370], [362, 370]], dskD);
        for (const [dx, dw] of [[372, 110], [490, 150]]) { PX.box(g, dx, 290, dw, 40, mix(dskD, D.n4, 0.25)); R(g, dx + dw / 2 - 6, 304, 12, 2, mix(D.n5, D.lampD, lampOn * 0.4)); }
        A(g, 0.6, () => R(g, 362, 282, 278, 3, D.n0));
        // the inspector: older, grey hair, round glasses, cardigan; faces left toward the crate
        const ix = 540, iy = 262, cardig = mix(D.moss[2], D.n2, 0.35), cardL = mix(cardig, D.lamp, 0.25 * lampOn), skin = mix(D.paper, D.rust[1], 0.3), skinD = mix(skin, D.n1, 0.4);
        const lean = ph >= 0.3 && ph < 1.0 ? 3 : 0, br = Math.round(Math.sin(t * 1.3) * 0.6);
        // chair back
        R(g, ix + 12, iy - 58, 12, 60, D.n2); R(g, ix + 12, iy - 58, 12, 2, D.n4);
        poly(g, [[ix - 18, iy], [ix + 16, iy], [ix + 14, iy - 46 + br], [ix - 12 - lean, iy - 48 + br]], cardig);
        poly(g, [[ix - 18, iy], [ix - 10, iy], [ix - 8 - lean, iy - 46 + br], [ix - 12 - lean, iy - 48 + br]], mix(cardig, D.lamp, 0.3 * lampOn));
        R(g, ix - 6 - lean, iy - 48 + br, 8, 6, D.paper);   // shirt collar
        const hx2 = ix - 4 - lean, hy2 = iy - 60 + br;
        R(g, hx2 - 2, hy2 + 7, 7, 6, skinD);
        ell(g, hx2, hy2, 9, 10, skin);
        poly(g, [[hx2 - 6, hy2 - 2], [hx2 - 11, hy2 + 3], [hx2 - 7, hy2 + 8], [hx2 - 2, hy2 + 10]], mix(skin, D.lamp, 0.35 * lampOn));
        R(g, hx2 - 12, hy2 + 2, 2, 3, skin);   // nose
        ell(g, hx2 + 3, hy2 - 5, 8, 6, D.n7); ell(g, hx2 + 6, hy2 + 1, 4, 6, D.n6); R(g, hx2 - 4, hy2 - 10, 10, 2, D.n7);   // grey hair
        R(g, hx2 + 2, hy2 + 1, 2, 3, skinD);   // ear
        // round glasses
        for (let k = 0; k < 10; k++) { const an = (k / 10) * TAU; R(g, Math.round(hx2 - 7 + Math.cos(an) * 2.5), Math.round(hy2 + 1 + Math.sin(an) * 2.5), 1, 1, D.n1); }
        R(g, hx2 - 3, hy2, 4, 1, D.n1); R(g, hx2 - 7, hy2 + 1, 1, 1, D.n0);
        R(g, hx2 - 6, hy2 + 7, 3, 1, skinD);   // mouth
        // the card being judged + the arm doing the work
        let hx = ix - 26, hy = iy - 18, card = null;
        if (ph >= 0) {
          if (ph < 0.3) { const e = E(ph / 0.3, "io"); hx = lerp(ix - 26, 458, e); hy = lerp(iy - 18, iy - 24, e); }
          else if (ph < 0.55) { const e = E((ph - 0.3) / 0.25, "io"); hx = lerp(458, 482, e); hy = lerp(iy - 24, iy - 50, e); card = 1; }
          else if (ph < 1.0) { hx = 482; hy = iy - 50 + Math.round(Math.sin(t * 2) * 0.6); card = 1; }
          if (ph < 0.3 && ph > 0.22) card = 1;
          if (ph >= 0.78) { const e = E((ph - 0.78) / 0.22, "io"); hx = lerp(482, 510, e); hy = lerp(iy - 50, iy - 12 - Math.min(nDone, 9) * 3, e); card = 1; }
          if (ph > 0.97) card = null;
        }
        poly(g, [[ix - 9 - lean, iy - 43 + br], [ix + 3 - lean, iy - 39 + br], [hx + 3, hy + 4], [hx - 2, hy - 2]], cardL); PX.line(g, ix + 3 - lean, iy - 39 + br, hx + 3, hy + 4, mix(cardig, D.n0, 0.4));
        R(g, hx - 3, hy - 3, 6, 5, skin); R(g, hx - 3, hy - 3, 6, 1, mix(skin, D.lamp, 0.3 * lampOn));
        // timed bar on the card: grows while examined (0.55..0.9), then fixed
        const barOf = (n) => 0.25 + 0.75 * hash(n, 13);
        if (card) {
          const kk = clamp((ph - 0.55) / 0.35, 0, 1) * barOf(nDone);
          R(g, hx - 7, hy - 14, 12, 10, mix(D.teal[1], D.n2, 0.1)); R(g, hx - 7, hy - 14, 12, 1, D.teal[0]);
          R(g, hx - 6, hy - 6, 10, 3, D.paper); if (kk > 0) R(g, hx - 6, hy - 5, Math.max(1, Math.round(10 * kk)), 1, D.ink);
          if (lampOn > 0 && ph > 0.4 && ph < 0.95) PX.glow(g, hx - 1, hy - 9, 10, D.lamp, 0.25);
        }
        // crate on the desk (left), emptying
        if (delivered) {
          const dt2 = t - s1 - 5.1, drop = Math.round((1 - E(clamp(dt2 / 0.25, 0, 1), "in")) * -14);
          const wood = mix(D.rust[2], D.paperD, 0.45), x0 = 436, y0 = 240 + drop, left = clamp(cardsLeft - nDone, 3, cardsLeft);
          for (let i = 0; i < left; i++) R(g, x0 + 3 + (i % 9) * 4, y0 - 2 - Math.floor(i / 9) * 2, 3, 4, mix(D.teal[1], D.teal[0], hash(i, 2) * lampOn));
          R(g, x0, y0, 42, 22, wood); R(g, x0, y0, 42, 1, mix(wood, D.lamp, 0.3)); R(g, x0, y0 + 10, 42, 1, mix(wood, D.n0, 0.3)); R(g, x0, y0, 2, 22, mix(wood, D.n0, 0.3)); R(g, x0 + 40, y0, 2, 22, mix(wood, D.n0, 0.3));
          if (dt2 > 0.25 && dt2 < 0.9) A(g, 0.5 * (1 - (dt2 - 0.25) / 0.65), () => { for (let i = 0; i < 8; i++) R(g, x0 + 21 + (i - 4) * (6 + (dt2 - 0.25) * 18), y0 + 20 - (dt2 - 0.25) * 10 * hash(i, 1), 2, 1, D.n6); });
        }
        // sorted pile (right): cards stacked, each with its bar
        const done = Math.min(nDone, 9);
        const sorted = [...Array(done)].map((_, n) => barOf(n)).sort((a, b) => a - b);
        sorted.forEach((b, n) => { const yy = 262 - n * 3; R(g, 500, yy, 18, 3, n % 2 ? mix(D.teal[1], D.n2, 0.2) : mix(D.teal[2], D.n2, 0.1)); R(g, 501, yy + 1, Math.round(14 * b), 1, D.paper); });
        // stopwatch on the desk: runs while a card is examined
        const swx = 398, swy = 268, onW = t >= tW ? PX.p(t, tW, 0.5, "out") : 0;
        A(g, 0.5, () => ell(g, swx + 2, swy + 8, 10, 2, "#000000"));
        PX.circle(g, swx, swy, 9, mix(D.n5, D.steel[2], 0.3)); PX.circle(g, swx, swy, 8, mix(D.paper, D.lamp, onW * 0.5)); R(g, swx - 2, swy - 13, 5, 3, D.n5); R(g, swx - 1, swy - 11, 3, 2, D.n4);
        for (let k = 0; k < 8; k++) { const an = (k / 8) * TAU; R(g, Math.round(swx + Math.sin(an) * 6), Math.round(swy - Math.cos(an) * 6), 1, 1, D.ink); }
        const run = ph >= 0.55 && ph < 0.9 ? (ph - 0.55) / 0.35 : ph >= 0.9 ? 1 : 0, ang = (run * barOf(nDone) + nDone * 0.13) * TAU;
        PX.line(g, swx, swy, swx + Math.sin(ang) * 6, swy - Math.cos(ang) * 6, D.rust[2]);
        if (lampOn > 0) PX.glow(g, swx, swy, 14, D.lamp, 0.12 * lampOn + 0.35 * onW);
        // desk lamp (angled), switched on at s2
        R(g, 414, 258, 18, 4, D.n3); R(g, 414, 258, 18, 1, D.n5); thick(g, 423, 258, 414, 214, D.n4, 2); thick(g, 414, 214, 462, 198, D.n4, 2); R(g, 413, 213, 3, 3, D.n6);
        poly(g, [[462, 196], [480, 194], [488, 208], [458, 212]], D.n4); PX.line(g, 462, 196, 480, 194, D.n6);
        R(g, 459, 210, 29, 2, mix(D.n3, D.lamp, lampOn)); if (lampOn > 0) R(g, 462, 212, 23, 1, D.cream);
      });
      // dim the desk area before the lamp is on (it waits in the dark)
      PX.vignette(g, 0.55);
      label(g, "SLOW AND CAREFUL", 478, 168, t, s2 + 0.3, { out: tW - 0.3 });
      label(g, "WATCH TIME", 398, 288, t, tW, { col: D.lamp });
    };
  };
  // ---------- generic passer-by (~54 px at k = 1), feet at (x, by) ----------
  // o.k scale, o.dir 1 right / -1 left, o.walk phase (radians; undefined = standing), o.back (seen from behind, facing the
  // stall), o.coat [l, b, d], o.hair, o.skin, o.reach 0..1 near arm up (clicking)
  const walker = (g, x, by, t, o) => {
    const k = o.k || 1, f = o.dir || 1, X = (v) => Math.round(x + f * v * k), Y = (v) => Math.round(by + v * k), [cl, cb, cd] = o.coat, skin = o.skin, skinD = mix(skin, D.n1, 0.4);
    const pants = o.pants || mix(D.n2, D.steel[2], 0.3), w = o.walk, sw = w === undefined ? 0 : Math.sin(w), bob = w === undefined ? 0 : Math.abs(Math.cos(w));
    const hip = -24 - bob, sh = -44 - bob, lw = Math.max(2, Math.round(3 * k));
    if (o.back) { // standing, back to camera, one arm reaching up to the board
      const cx = x, Xb = (v) => Math.round(cx + v * k);
      for (const s of [-1, 1]) { R(g, Xb(s * 3) - lw / 2, Y(hip + 2), lw, Y(-1) - Y(hip + 2), mix(pants, D.n0, s > 0 ? 0.3 : 0)); R(g, Xb(s * 3) - lw / 2 - 1, Y(-2), lw + 2, Math.max(2, k * 2), D.n0); }
      poly(g, [[Xb(-7), Y(sh + 1)], [Xb(7), Y(sh + 1)], [Xb(8), Y(hip + 5)], [Xb(-8), Y(hip + 5)]], cb);
      poly(g, [[Xb(-7), Y(sh + 1)], [Xb(-2), Y(sh + 1)], [Xb(-3), Y(hip + 5)], [Xb(-8), Y(hip + 5)]], cd);
      PX.line(g, Xb(0), Y(sh + 4), Xb(0), Y(hip + 4), cd);
      const ra = o.reach || 0, hx = Xb(lerp(9, 10, ra)), hy = Y(lerp(sh + 17, sh - 14, ra));
      thick(g, Xb(-6), Y(sh + 3), Xb(-8), Y(sh + 17), cd, lw);
      thick(g, Xb(6), Y(sh + 3), hx, hy, cb, lw); R(g, hx - 1, hy - 1, Math.max(3, k * 3), Math.max(3, k * 3), skin);
      R(g, Xb(-2), Y(sh - 3), Math.max(4, k * 4), Math.max(3, k * 3), skinD);
      ell(g, Xb(0), Y(sh - 8), 5 * k, 5 * k, o.hair); ell(g, Xb(0), Y(sh - 10), 5 * k, 3 * k, mix(o.hair, D.cream, 0.08));
      R(g, Xb(-5) - 1, Y(sh - 7), Math.max(1, k), Math.max(2, 2 * k), skinD); R(g, Xb(5), Y(sh - 7), Math.max(1, k), Math.max(2, 2 * k), skinD);
      return { hx, hy };
    }
    const leg = (s, col) => { const fx = X(s * 7), kx = X(s * 3); thick(g, X(0), Y(hip), kx, Y(hip + 11), col, lw); thick(g, kx, Y(hip + 11), fx, Y(-1), col, lw); R(g, fx - (f > 0 ? 1 : 3) * k, Y(-2), 5 * k, Math.max(2, 2 * k), D.n0); };
    leg(-sw, mix(pants, D.n0, 0.35)); leg(sw, pants);
    thick(g, X(-1), Y(sh + 3), X(-sw * 6), Y(sh + 17), cd, lw);
    poly(g, [[X(-6), Y(sh)], [X(5), Y(sh)], [X(7), Y(hip + 4)], [X(-7), Y(hip + 4)]], cb);
    poly(g, [[X(-6), Y(sh)], [X(-2), Y(sh)], [X(-3), Y(hip + 4)], [X(-7), Y(hip + 4)]], cd);
    PX.line(g, X(5), Y(sh + 1), X(7), Y(hip + 3), cl);
    R(g, Math.min(X(-1), X(2)), Y(sh - 3), Math.max(4, 4 * k), Math.max(3, 3 * k), skinD);
    ell(g, X(1), Y(sh - 8), 5 * k, 5 * k, skin); R(g, Math.min(X(5), X(6)), Y(sh - 8), Math.max(1, k), Math.max(2, 2 * k), skin);
    ell(g, X(0), Y(sh - 11), 5 * k, 3 * k, o.hair); R(g, Math.min(X(-4), X(-6)), Y(sh - 11), Math.max(2, 2 * k), 5 * k, o.hair);
    R(g, X(3), Y(sh - 9), Math.max(1, k), Math.max(1, k), D.n0);
    thick(g, X(1), Y(sh + 3), X(sw * 6), Y(sh + 17), cb, lw); R(g, X(sw * 6) - 1, Y(sh + 17) - 1, Math.max(3, 3 * k), Math.max(3, 3 * k), skin);
    return { hx: X(sw * 6), hy: Y(sh + 17) };
  };
  const PEOPLE = () => [
    { coat: [mix(D.steel[1], D.n4, 0.2), mix(D.steel[2], D.n2, 0.2), mix(D.steel[2], D.n0, 0.5)], hair: mix(D.n0, D.rust[2], 0.2) },
    { coat: [mix(D.moss[1], D.n4, 0.3), mix(D.moss[2], D.n2, 0.25), mix(D.moss[2], D.n0, 0.5)], hair: mix(D.paperD, D.n2, 0.3) },
    { coat: [mix(D.rose[1], D.n4, 0.3), mix(D.rose[2], D.n2, 0.3), mix(D.rose[2], D.n0, 0.5)], hair: D.n0 },
    { coat: [D.n6, D.n4, D.n2], hair: mix(D.rust[2], D.n2, 0.2) },
    { coat: [mix(D.paperD, D.n4, 0.3), mix(D.paperD, D.n2, 0.45), mix(D.paperD, D.n0, 0.6)], hair: mix(D.n0, D.rust[2], 0.3) },
    { coat: [mix(D.teal[1], D.n4, 0.3), mix(D.teal[2], D.n2, 0.2), mix(D.teal[2], D.n0, 0.5)], hair: mix(D.n6, D.n2, 0.2) },
  ];
  const SKINS = () => [mix(D.rust[2], D.paperD, 0.5), mix(D.paper, D.rust[1], 0.25), mix(D.rust[2], D.n2, 0.25), mix(D.paper, D.rust[1], 0.45)];

  // ======================= clickbait =======================
  // a night-market stall of loud thumbnails ("!!!", arrows, shocked shapes, all in the calm palette) drawing quick
  // clicks (tally marks on the board); o.leave 2.5 the shoppers turn and walk off fast; o.cross 4.0 the "CLICKS" sign is
  // crossed out. The thumbnails keep jiggling for nobody.
  K.clickbait = (o) => {
    const SH = [ // shopper: from side, counter x, arrive time (typical d = 6)
      { side: -1, x: 238, a: 0.0 }, { side: 1, x: 402, a: 0.25 }, { side: -1, x: 286, a: 0.55 }, { side: 1, x: 352, a: 0.8 }, { side: -1, x: 196, a: 1.1 }, { side: 1, x: 446, a: 1.35 },
    ];
    const stalls = []; { const r = PX.rnd(64); for (let i = 0; i < 6; i++) stalls.push([i * 118 - 40 + r() * 20, 150 + r() * 10, 70 + r() * 30, r()]); }
    return (g, t, d, c) => {
      const T = tm(o, d, 6.0), tLv = T("leave", 2.5), tX = T("cross", 4.0), sc = d / 6.0;
      // clicks: each shopper clicks 0.2 s after arriving, again every 0.5 s until leaving
      let clicks = 0; const flash = [];
      SH.forEach((s, i) => { const arr = s.a * sc + 1.0; for (let k = 0; k < 4; k++) { const ct = arr + 0.2 + k * 0.5; if (ct >= tLv + i * 0.1) break; if (ct <= t) { clicks++; if (t - ct < 0.25) flash.push([s, t - ct]); } } });
      R(g, 0, 0, 640, 360, D.n1);
      // far: night sky, rooftops, other stalls with warm bulbs (dim)
      PX.par(g, c, 0.35, () => {
        PX.vgrad(g, -40, -40, 720, 240, D.n0, mix(D.n2, D.steel[2], 0.3), 7);
        const r = PX.rnd(9); let bx = -40; while (bx < 680) { const bw = 30 + r() * 50, bh = 50 + r() * 70; R(g, bx, 190 - bh, bw, bh + 20, mix(D.n1, D.steel[2], 0.15));
          for (let yy = 196 - bh; yy < 180; yy += 9) for (let xx = bx + 4; xx < bx + bw - 4; xx += 7) if (r() < 0.15) R(g, xx, yy, 2, 3, mix(D.lampD, D.n2, 0.4)); bx += bw + 2; }
      });
      PX.par(g, c, 0.55, () => {
        for (const [x, y, w, k] of stalls) { R(g, x, y, w, 50, mix(D.n2, D.rust[2], 0.15)); poly(g, [[x - 6, y], [x + w + 6, y], [x + w, y - 12], [x, y - 12]], mix(D.n3, D.rust[2], 0.3));
          for (let i = 0; i < 5; i++) { const bx2 = x + 4 + i * (w / 5); R(g, bx2, y + 2, 2, 2, D.lampD); PX.glow(g, bx2, y + 3, 10, D.lamp, 0.12 + 0.04 * Math.sin(t * 2 + i + k * 9)); } }
        R(g, -40, 196, 720, 4, D.n2);
        // a few far walkers (tiny silhouettes)
        for (let i = 0; i < 6; i++) { const sp = 14 + hash(i, 1) * 10, dir = i % 2 ? 1 : -1, x = wrap(Math.round(hash(i, 2) * 700 + dir * sp * t), 700) - 30, y = 196;
          R(g, x, y - 13, 3, 13, mix(D.n0, D.n2, 0.5)); R(g, x, y - 16, 3, 3, mix(D.n0, D.n2, 0.5)); }
      });
      // ground: wet cobbles with reflections of the lights
      PX.vgrad(g, -40, 196, 720, 180, mix(D.n2, D.steel[2], 0.15), D.n1, 6);
      for (let y = 206, row = 0; y < 370; y += 8 + row, row++) for (let x = -40 + (row % 2) * 9; x < 680; x += 18 + row * 2) A(g, 0.35, () => R(g, x, y, 12 + row, 1, D.n1));
      // the stall
      const sx = 160, sw = 320, ctr = 244;
      A(g, 0.5, () => ell(g, 320, 302, 190, 6, "#000000"));
      R(g, sx, 120, 6, 130, mix(D.n3, D.rust[2], 0.35)); R(g, sx + sw - 6, 120, 6, 130, mix(D.n3, D.rust[2], 0.35));
      // back board of thumbnails
      R(g, sx + 10, 124, sw - 20, 112, mix(D.n2, D.rust[2], 0.2));
      const thumbs = [];
      for (let r = 0; r < 3; r++) for (let k = 0; k < 6; k++) thumbs.push([sx + 18 + k * 49, 130 + r * 35, r * 6 + k]);
      for (const [x, y, i] of thumbs) {
        const jig = Math.round(Math.sin(t * 9 + i * 1.7) * (hash(i, 4) < 0.5 ? 1 : 0)), xx = x + jig, w = 43, h = 30;
        const bg = [mix(D.rust[2], D.rust[1], 0.22), mix(D.amber[2], D.n2, 0.3), mix(D.teal[2], D.n2, 0.15), mix(D.rose[2], D.n2, 0.38)][Math.floor(hash(i, 1) * 4)];
        R(g, xx, y, w, h, bg); R(g, xx, y, w, 1, mix(bg, D.cream, 0.3));
        const ty = Math.floor(hash(i, 2) * 3);
        if (ty === 0) { // shocked face shape
          PX.circle(g, xx + 14, y + 16, 9, mix(D.paper, bg, 0.2)); R(g, xx + 10, y + 13, 2, 2, D.ink); R(g, xx + 16, y + 13, 2, 2, D.ink); PX.circle(g, xx + 13, y + 20, 2, D.ink);
        } else if (ty === 1) { // big arrow pointing at a circle
          for (let k = 0; k < 9; k++) R(g, xx + 6 + k, y + 22 - k, 2, 2, D.cream); R(g, xx + 13, y + 12, 5, 2, D.cream); R(g, xx + 16, y + 12, 2, 5, D.cream);
          for (let k = 0; k < 20; k++) { const an = (k / 20) * TAU; R(g, Math.round(xx + 25 + Math.cos(an) * 6), Math.round(y + 11 + Math.sin(an) * 5), 1, 1, D.cream); }
        } else { // before / after split
          R(g, xx + 3, y + 4, 16, 22, mix(bg, D.n0, 0.3)); R(g, xx + 21, y + 4, 16, 22, mix(bg, D.cream, 0.2)); R(g, xx + 19, y + 4, 2, 22, D.cream);
        }
        PX.text(g, "!!!", xx + w - 3, y + 2, { align: "right", col: D.cream, size: 8 });
        if (PX.blink(t + hash(i, 6) * 3, 0.9, 0.5) && hash(i, 7) < 0.4) A(g, 0.25, () => R(g, xx, y, w, h, D.cream));
      }
      // awning with warm bulbs
      for (let k = 0; k < 10; k++) poly(g, [[sx - 14 + k * 35, 100], [sx - 14 + (k + 1) * 35, 100], [sx - 14 + (k + 1) * 35, 120], [sx - 14 + k * 35, 120]], k % 2 ? mix(D.paper, D.n2, 0.55) : mix(D.rust[2], D.n2, 0.35));
      for (let k = 0; k < 10; k++) { const x0 = sx - 14 + k * 35; for (let j = 0; j < 35; j += 7) R(g, x0 + j, 120, 5, 3 + ((j / 7) % 2), k % 2 ? mix(D.paper, D.n2, 0.55) : mix(D.rust[2], D.n2, 0.35)); }
      R(g, sx - 14, 98, sw + 28, 2, D.n3);
      for (let k = 0; k < 12; k++) { const bx = sx + 6 + k * 27, by = 126 + Math.round(Math.sin(k * 0.9) * 1.5); R(g, bx, by, 2, 3, D.lamp); PX.glow(g, bx + 1, by + 2, 14, D.lamp, 0.22); }
      PX.glow(g, 320, 190, 200, D.lampD, 0.14);
      // counter
      R(g, sx - 6, ctr, sw + 12, 6, mix(D.n4, D.rust[2], 0.35)); R(g, sx - 6, ctr, sw + 12, 1, mix(D.n6, D.lamp, 0.3));
      R(g, sx, ctr + 6, sw, 46, mix(D.n2, D.rust[2], 0.3)); for (let k = 0; k < 8; k++) R(g, sx + 4 + k * 40, ctr + 6, 1, 46, mix(D.n1, D.rust[2], 0.3));
      // sign "CLICKS" with tally marks
      const sgx = 320, sgy = 64;
      R(g, sgx - 1, sgy + 18, 2, 18, D.n3); R(g, sgx - 70, sgy - 4, 140, 24, mix(D.paperD, D.n2, 0.35)); PX.box(g, sgx - 70, sgy - 4, 140, 24, mix(D.paperD, D.n1, 0.6));
      PX.text(g, "CLICKS", sgx, sgy + 4, { align: "center", col: D.ink, size: 8 });
      PX.glow(g, sgx, sgy + 6, 70, D.lamp, 0.1);
      // tally board under the sign
      R(g, sgx - 60, sgy + 24, 120, 12, mix(D.n2, D.rust[2], 0.25));
      for (let i = 0; i < Math.min(clicks, 25); i++) { const grp = Math.floor(i / 5), k = i % 5, x0 = sgx - 54 + grp * 22;
        if (k < 4) R(g, x0 + k * 3, sgy + 26, 1, 8, D.cream); else PX.line(g, x0 - 1, sgy + 33, x0 + 11, sgy + 27, D.cream); }
      // crossed out
      if (t >= tX) { const p = E(clamp((t - tX) / 0.35, 0, 1), "out"); for (const [ax, ay, bx2, by2] of [[sgx - 64, sgy + 16, sgx + 64, sgy - 2], [sgx - 64, sgy - 2, sgx + 64, sgy + 16]]) { const ex = lerp(ax, bx2, p), ey = lerp(ay, by2, p); thick(g, ax, ay + 1, ex, ey + 1, D.n0, 3); thick(g, ax, ay, ex, ey, D.rust[1], 2); } }
      // shoppers: walk in, turn to the board and click, then (after o.leave) hurry away
      const ppl = PEOPLE(), sk = SKINS(), by = 330;
      SH.forEach((s, i) => {
        const a = s.a * sc, lv = tLv + i * 0.1, from = s.side < 0 ? -50 : 690, sx2 = 320 + (s.x - 320) * 1.15;
        const posAt = (tt) => lerp(from, sx2, clamp((tt - a) / 1.0, 0, 1));
        let x, dir, walk, reach = 0, back = false;
        if (t < lv) { x = posAt(t); dir = s.side < 0 ? 1 : -1; if (t < a + 1.0) walk = t * 10 + i; else back = true;
          for (const [fs, ft] of flash) if (fs === s) reach = Math.sin((ft / 0.25) * Math.PI); }
        else { const x0 = posAt(lv), out = x0 < 320 ? -1 : 1; x = x0 + out * 230 * (t - lv) * Math.min(1, (t - lv) * 4 + 0.3); dir = out; walk = t * 17 + i; }
        if (x < -50 || x > 690) return;
        const P = ppl[i % ppl.length], H = walker(g, x, by + (i % 2) * 5, t, { k: 1.45, dir, walk, back, coat: P.coat, hair: P.hair, skin: sk[i % sk.length], reach: back ? Math.max(reach, 0.15) : 0 });
        if (back && reach > 0.2) { PX.glow(g, H.hx + 1, H.hy - 2, 12, D.cream, 0.45 * reach); R(g, H.hx, H.hy - 5, 3, 3, D.cream); }
      });
      // a dropped thumbnail on the ground after they leave
      if (t >= tLv + 0.3) { const k = E(clamp((t - tLv - 0.3) / 0.3, 0, 1), "out"); A(g, k, () => { poly(g, [[300, 316], [322, 312], [324, 324], [302, 328]], mix(D.amber[2], D.n2, 0.3)); PX.text(g, "!!!", 304, 315, { col: D.cream, size: 8 }); }); }
      // foreground: the edge of a neighbouring stall's crate, out of focus
      PX.par(g, c, 1.2, () => { R(g, 560, 290, 110, 80, mix(D.n1, D.rust[2], 0.2)); R(g, 560, 290, 110, 2, mix(D.n3, D.rust[2], 0.3)); R(g, -40, 320, 120, 50, mix(D.n0, D.rust[2], 0.1)); });
      PX.particles(g, 3, 20, t, [160, 110, 320, 120], { vy: -2, vx: 1, col: D.lamp, a: 0.4 });
      PX.vignette(g, 0.55);
    };
  };
  // ======================= seventy =======================
  // a canal city at dusk, seen from a bridge: a river of tiny boats (viewers) flows away from us and forks round an
  // island; the left channel runs under a stone lantern gate "RECOMMENDED". o.gate 2.0 the lanterns light and most boats
  // take that channel; o.pct 3.5 a plaque "70%" lights on top of the gate.
  K.seventy = (o) => {
    const HY = 150, GY = 258;
    // channels: polylines of [x, y, half width]; main runs from under the bridge to the fork
    const MAIN = [[320, 380, 196], [320, 290, 84]];
    const LEFT = [[290, 290, 40], [229, 258, 50], [196, 230, 44]];
    const RIGHT = [[350, 290, 40], [411, 258, 50], [444, 230, 44]];
    const along = (P, v) => { const n = P.length - 1, f = clamp(v, 0, 1) * n, i = Math.min(n - 1, Math.floor(f)), k = f - i; return P[i].map((a, j) => lerp(a, P[i + 1][j], k)); };
    // houses: [x, base y, width, height, colour index, seed]
    const row = (x0, x1, by, h0, h1, seed) => { const r = PX.rnd(seed), out = []; let x = x0; while (x < x1) { const w = 26 + Math.floor(r() * 22); out.push([x, by, w, h0 + r() * (h1 - h0), Math.floor(r() * 4), r() * 999, r()]); x += w; } return out; };
    const MIDL = row(-20, 300, 232, 46, 84, 21), MIDR = row(440, 660, 232, 46, 84, 22), ISLB = row(250, 400, 236, 60, 92, 23);
    return (g, t, d, c) => {
      const T = tm(o, d, 8.0), tG = T("gate", 2.0), tP = T("pct", 3.5);
      const gl = clamp((t - tG) / 0.6, 0, 1), glF = gl * (0.92 + 0.08 * Math.sin(t * 7));
      const cols = [mix(D.n3, D.steel[2], 0.35), mix(D.n3, D.paperD, 0.3), mix(D.n2, D.rust[2], 0.4), mix(D.n3, D.moss[2], 0.3)];
      R(g, 0, 0, 640, 360, D.n1);
      // sky at dusk: steel above, a low warm band; first stars
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -40, -40, 720, HY + 60, mix(D.n0, D.steel[2], 0.3), mix(D.n4, D.lampD, 0.22), 9);
        for (let i = 0; i < 24; i++) A(g, 0.25 + 0.3 * Math.sin(t * 0.8 + i), () => R(g, hash(i, 1) * 640, hash(i, 2) * 70, 1, 1, D.cream));
        const r = PX.rnd(5); let bx = -40; while (bx < 680) { const bw = 12 + r() * 24, bh = 10 + r() * 22; R(g, bx, HY + 10 - bh, bw, bh + 40, mix(D.n2, D.steel[2], 0.3)); if (r() < 0.25) R(g, bx + bw / 2, HY + 4 - bh, 2, 6, mix(D.n2, D.steel[2], 0.3)); bx += bw; }
        poly(g, [[470, HY - 50], [475, HY - 18], [465, HY - 18]], mix(D.n2, D.steel[2], 0.3)); R(g, 462, HY - 18, 16, 40, mix(D.n2, D.steel[2], 0.3));
      });
      // a facade (front-facing canal house): stepped or pointed gable, lit windows, reflection length rl
      const house = (x, by, w, h, ci, seed, gab, fogK, rl) => {
        const col = mix(cols[ci], D.n2, fogK), colL = mix(col, D.paperD, 0.18), colD = mix(col, D.n0, 0.35), top = by - h;
        R(g, x, top, w, h, col); R(g, x, top, 1, h, colL); R(g, x + w - 1, top, 1, h, colD);
        if (gab < 0.5) poly(g, [[x, top], [x + w, top], [x + w / 2, top - w * 0.45]], col);
        else for (let k = 0; k < 3; k++) R(g, x + k * w / 6, top - (k + 1) * 4, w - k * w / 3, 4, col);
        const nx = Math.max(2, Math.floor(w / 11)), ny = Math.max(2, Math.floor(h / 16)), ww = 3, wh = 5;
        for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
          const k = hash(seed + j, i), wx = Math.round(x + (w * (i + 0.5)) / nx - 1), wy = Math.round(top + 6 + j * ((h - 10) / ny));
          const lit = k < 0.42 && Math.sin(t * 0.4 + k * 50) > -0.95;
          R(g, wx, wy, ww, wh, lit ? mix(D.lampD, D.lamp, k * 2) : mix(D.n0, col, 0.35));
          if (lit && rl && j === ny - 1) A(g, 0.22, () => { for (let q = 0; q < rl; q++) R(g, wx + Math.round(Math.sin(t * 2.5 + q * 0.9 + k * 9)), by + 3 + q * 2, ww, 1, D.lampD); });
        }
        R(g, x, by - 1, w, 1, colD);
      };
      // mid rows on the far banks (behind the channels' ends)
      for (const [x, by, w, h, ci, sd, gb] of [...MIDL, ...MIDR]) house(x, by, w, h, ci, sd, gb, 0.35, 0);
      // quays: cobbled ground everywhere below the far rows (water is drawn over it)
      const land = mix(D.n2, D.paperD, 0.12);
      R(g, -40, 230, 720, 150, land); R(g, -40, 230, 720, 1, mix(land, D.n0, 0.4));
      for (let y = 236, rr = 0; y < 340; y += 4 + rr, rr++) for (let x = -40 + (rr % 2) * 5; x < 680; x += 10 + rr * 2) A(g, 0.4, () => R(g, x, y, 6 + rr, 1, mix(land, D.n0, 0.3)));
      // trees + quay lamps on the banks
      const tree = (x, by, s) => { R(g, x - 1, by - 14 * s, 2 * s, 14 * s, D.n0); ell(g, x, by - 20 * s, 10 * s, 8 * s, mix(D.moss[2], D.n1, 0.55)); ell(g, x - 2 * s, by - 23 * s, 6 * s, 4 * s, mix(D.moss[2], D.n2, 0.4)); };
      tree(120, 262, 1.2); tree(70, 250, 1); tree(528, 262, 1.2); tree(585, 250, 1);
      for (const [lx, ly] of [[160, 262], [478, 262]]) { R(g, lx, ly - 26, 2, 26, D.n0); R(g, lx - 2, ly - 30, 6, 4, D.n1); R(g, lx - 1, ly - 26, 4, 1, D.lamp); PX.glow(g, lx + 1, ly - 25, 26, D.lamp, 0.22); A(g, 0.2, () => ell(g, lx + 1, ly + 2, 14, 3, D.lampD)); }
      // water: main + two channels + far ends, with sky reflection
      const water = mix(D.teal[2], D.n1, 0.45), waterL = mix(D.steel[1], D.teal[2], 0.55);
      const drawCh = (P) => { for (let y = Math.round(P[0][1]); y >= P[P.length - 1][1]; y--) { const v = (P[0][1] - y) / (P[0][1] - P[P.length - 1][1]), [cx, , hw] = along(P, v); R(g, cx - hw, y, 2 * hw + 1, 1, mix(water, waterL, clamp((300 - y) / 90, 0, 0.6))); } };
      drawCh(MAIN); drawCh(LEFT); drawCh(RIGHT);
      // quay edges
      for (const P of [MAIN, LEFT, RIGHT]) for (const s of [-1, 1]) for (let k = 0; k < P.length - 1; k++) { const a = P[k], b = P[k + 1]; PX.line(g, a[0] + s * a[2], a[1], b[0] + s * b[2], b[1], mix(D.n4, D.paperD, 0.25)); }
      // ripples
      for (let i = 0; i < 60; i++) { const v = frac(hash(i, 3) + t * 0.06), P = i % 3 === 0 ? MAIN : i % 3 === 1 ? LEFT : RIGHT, [cx, cy, hw] = along(P, 1 - v);
        A(g, 0.3, () => R(g, cx + (hash(i, 5) - 0.5) * 1.7 * hw, cy, Math.max(1, Math.round((cy - HY) / 30)), 1, waterL)); }
      // island: back houses, then the prow building on its stone quay
      for (const [x, by, w, h, ci, sd, gb] of ISLB) house(x, by, w, h, ci, sd, gb, 0.25, 0);
      poly(g, [[320, 292], [279, 258], [361, 258]], mix(D.n3, D.paperD, 0.25)); PX.line(g, 279, 258, 320, 292, mix(D.n5, D.paperD, 0.3)); PX.line(g, 361, 258, 320, 292, D.n2);
      house(282, 258, 76, 96, 0, 444, 0.3, 0.25, 0);
      R(g, 318, 262, 2, 22, D.n0); R(g, 315, 258, 8, 5, D.n1); R(g, 316, 262, 6, 1, D.lamp); PX.glow(g, 319, 264, 22, D.lamp, 0.25);
      // boats: viewers, spawn every 0.15 s, 6 s trip
      const TR = 6, boats = [];
      for (let i = 0; i < 70; i++) {
        const b0 = (i - 40) * 0.15 + (hash(i, 9) - 0.5) * 0.06, u = (t - b0) / TR; if (u < 0 || u > 1) continue;
        const tFork = b0 + 0.5 * TR, goL = hash(i, 21) < (tFork >= tG ? 0.7 : 0.5), lane = (hash(i, 22) - 0.5) * 1.2;
        let x, y;
        if (u < 0.5) { const [cx, cy, hw] = along(MAIN, u / 0.5); x = cx + lane * hw; y = cy; }
        else { const v = (u - 0.5) / 0.5, [cx, cy, hw] = along(goL ? LEFT : RIGHT, v), [mx, , mhw] = along(MAIN, 1), bl = PX.smooth(v / 0.3); x = lerp(mx + lane * mhw, cx + lane * 0.6 * hw, bl); y = cy; }
        boats.push({ x, y, s: clamp((y - HY) / 140, 0.3, 1.6), goL: u >= 0.5 && goL, a: clamp((1 - u) / 0.08, 0, 1), i });
      }
      const drawBoat = (bt) => A(g, bt.a, () => {
        const { x, y, s } = bt, w = Math.max(3, Math.round(13 * s)), h = Math.max(2, Math.round(4 * s)), hull = mix(D.rust[2], D.n1, 0.5);
        const warm = bt.goL ? gl : 0;
        A(g, 0.3, () => { PX.line(g, x - w / 2, y + h, x - w * 0.9, y + h + 5 * s, waterL); PX.line(g, x + w / 2, y + h, x + w * 0.9, y + h + 5 * s, waterL); });
        R(g, x - w / 2, y, w, h, hull); R(g, x - w / 2, y, w, 1, mix(hull, D.paperD, 0.45)); R(g, x - w / 2 + 1, y + h, w - 2, 1, D.n0);
        // the viewer sitting in it
        R(g, x - Math.round(1.5 * s), y - Math.round(5 * s), Math.max(2, Math.round(3 * s)), Math.max(2, Math.round(5 * s)), mix(D.steel[2], D.n3, 0.2));
        R(g, x - Math.round(1 * s), y - Math.round(7 * s), Math.max(1, Math.round(2.5 * s)), Math.max(1, Math.round(2.5 * s)), D.paperD);
        // stern lantern (warms up in the recommended channel)
        const lc = mix(mix(D.cream, D.n6, 0.35), D.lamp, warm), lx = x + Math.round(w / 2) - 1, ly = y - Math.max(2, Math.round(4 * s));
        R(g, lx, ly, 1, Math.max(2, Math.round(4 * s)), D.n3); R(g, lx - (s > 1 ? 1 : 0), ly - 1, s > 1 ? 2 : 1, s > 1 ? 2 : 1, lc);
        PX.glow(g, lx, ly, Math.max(4, 9 * s), lc, 0.18 + 0.22 * warm);
        if (s > 0.6) A(g, 0.25, () => R(g, lx, y + h + 1, 1, Math.round(5 * s), lc));
      });
      for (const bt of boats) if (bt.y < GY) drawBoat(bt);
      // the lantern gate over the left channel
      {
        const x0 = 166, x1 = 292, top = 168, pw = 14;
        const stone = mix(D.paperD, D.n2, 0.5), stoneL = mix(stone, D.lamp, 0.3 * glF), stoneD = mix(stone, D.n0, 0.4);
        for (const px2 of [x0, x1 - pw]) { R(g, px2, top, pw, GY - top + 2, stone); R(g, px2, top, 2, GY - top, stoneL); R(g, px2 + pw - 2, top, 2, GY - top, stoneD);
          for (let k = 0; k < 8; k++) R(g, px2 + 1, top + 18 + k * 10, pw - 2, 1, stoneD); R(g, px2 - 2, GY - 4, pw + 4, 6, stoneD); }
        // arch band with voussoirs
        R(g, x0 - 4, top - 10, x1 - x0 + 8, 4, stoneL); R(g, x0, top - 6, x1 - x0, 18, stone);
        const acx = (x0 + x1) / 2, ar = (x1 - x0) / 2 - pw;
        for (let xx = -ar; xx <= ar; xx++) { const yy = Math.round(Math.sqrt(Math.max(0, ar * ar - xx * xx)) * 0.32); R(g, acx + xx, top + 12, 1, 12 - yy, stone); R(g, acx + xx, top + 24 - yy, 1, 1, stoneD); if (xx % 9 === 0) R(g, acx + xx, top + 12, 1, 12 - yy, stoneD); }
        // sign board
        const sw2 = 104, sx2 = acx - sw2 / 2, sy2 = top - 34;
        R(g, acx - 30, sy2 + 18, 2, 8, D.n3); R(g, acx + 28, sy2 + 18, 2, 8, D.n3);
        const board = mix(mix(D.rust[2], D.paperD, 0.35), D.n1, 0.35 * (1 - gl));
        R(g, sx2, sy2, sw2, 18, board); R(g, sx2, sy2, sw2, 1, mix(board, D.lamp, 0.25 + glF * 0.4)); R(g, sx2, sy2 + 17, sw2, 1, D.n1);
        PX.text(g, "RECOMMENDED", acx, sy2 + 5, { align: "center", col: mix(D.n6, D.cream, gl), size: 8 });
        // lanterns: big ones on the pillars + a string under the arch band
        const lan = (lx, ly, big) => {
          const bw = big ? 6 : 3, bh = big ? 8 : 4;
          R(g, lx, ly - 4, 1, 4, D.n3); R(g, lx - (bw >> 1), ly, bw, bh, mix(D.n3, D.lamp, glF)); R(g, lx - (bw >> 1), ly, bw, 1, D.n2); if (big) R(g, lx - (bw >> 1), ly + bh, bw, 1, D.n2);
          if (gl > 0) { PX.glow(g, lx, ly + bh / 2, big ? 30 : 12, D.lamp, (big ? 0.45 : 0.3) * glF);
            const rx = lx, ry0 = GY + 6 + (ly - top) * 0.2; if (!big) A(g, 0.3 * glF, () => { for (let q = 0; q < (big ? 14 : 7); q++) R(g, rx - 1 + Math.round(Math.sin(t * 3 + q) * 1.3), ry0 + q * 3, big ? 3 : 2, 1, D.lamp); }); }
        };
        lan(x0 - 4, top + 6, true); lan(x1 + 3, top + 6, true);
        for (let k = 1; k < 7; k++) { const lx = Math.round(lerp(x0 + pw, x1 - pw, k / 7)), ly = top + 30 - Math.round(Math.sin((k / 7) * Math.PI) * 4); lan(lx, ly, false); }
        if (gl > 0) PX.glow(g, acx, GY - 20, 90, D.lampD, 0.2 * glF);
        // 70% plaque on top of the gate
        if (t >= tP) { const k = PX.p(t, tP, 0.4, "out"); A(g, k, () => { R(g, acx - 28, sy2 - 28, 56, 24, mix(D.n2, D.rust[2], 0.3)); PX.box(g, acx - 28, sy2 - 28, 56, 24, mix(D.paperD, D.lamp, 0.45)); R(g, acx - 1, sy2 - 4, 2, 4, D.n3); PX.glow(g, acx, sy2 - 16, 40, D.lamp, 0.28 * k); });
          label(g, "70%", acx, sy2 - 24, t, tP, { size: 16, col: D.lamp }); }
      }
      for (const bt of boats) if (bt.y >= GY) drawBoat(bt);
      // near houses framing left and right (big, dark, a few lit windows)
      house(-30, 330, 92, 210, 2, 901, 0.7, 0.3, 10); house(586, 330, 90, 200, 0, 902, 0.2, 0.3, 10);
      // foreground: the bridge railing we stand on, a street lamp at the left
      PX.par(g, c, 1.15, () => {
        R(g, -40, 332, 720, 6, mix(D.n2, D.paperD, 0.2)); R(g, -40, 332, 720, 1, mix(D.n4, D.lamp, 0.25)); R(g, -40, 338, 720, 32, D.n0);
        for (let x = -30; x < 680; x += 22) { R(g, x, 338, 9, 32, D.n1); R(g, x, 338, 1, 32, D.n2); }
        R(g, 74, 170, 4, 162, D.n0); R(g, 68, 162, 16, 10, D.n1); R(g, 70, 172, 12, 2, D.lamp); PX.glow(g, 76, 176, 70, D.lamp, 0.22);
      });
      PX.particles(g, 8, 18, t, [100, 150, 440, 180], { vy: -0.6, vx: 1.5, col: D.lamp, a: 0.25 });
      PX.vignette(g, 0.5);
    };
  };
})();
