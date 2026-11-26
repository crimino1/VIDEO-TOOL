/* EP5 Builder D: learning the numbers + the dot space. Kinds: nudge, axes, dot_space, dot_moves.
   Palette PX.D only (shades derived with mix). YOU dot = amber core + soft 1-px cream ring + slow pulse. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, A = PX.alpha, P = PX.p, clamp = PX.clamp, lerp = PX.lerp;

  // ---------- colour + drawing helpers (local) ----------
  const H2 = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { k = clamp(k, 0, 1); const X = H2(a), Y = H2(b); return "#" + X.map((v, i) => Math.round(v + (Y[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const dk = (c, k) => mix(c, D.n0, k), lt = (c, k) => mix(c, D.cream, k);
  const SH = (a) => `rgba(0,0,0,${a})`;
  const label = (g, s, x, y, a, col, o) => { if (a <= 0) return; A(g, a, () => PX.otext(g, s, x, y, Object.assign({ col: col || D.cream, align: "center", outline: D.n0, size: 8 }, o || {}))); };
  // 1-px circle outline
  const ring = (g, cx, cy, r, col) => {
    cx = Math.round(cx); cy = Math.round(cy); g.fillStyle = col; const n = Math.max(8, Math.round(r * 7)); let lx = 1e9, ly = 1e9;
    for (let i = 0; i < n; i++) { const a = (i / n) * 6.2832, x = Math.round(cx + Math.cos(a) * r), y = Math.round(cy + Math.sin(a) * r); if (x !== lx || y !== ly) g.fillRect(x, y, 1, 1); lx = x; ly = y; }
  };
  // dotted pixel line (every `gap` px)
  const dline = (g, x1, y1, x2, y2, col, gap, ph) => {
    const L = Math.hypot(x2 - x1, y2 - y1), n = Math.floor(L / (gap || 2)); g.fillStyle = col;
    for (let i = 0; i <= n; i++) { const u = n ? (i + (ph || 0)) / n : 0; if (u > 1) continue; g.fillRect(Math.round(lerp(x1, x2, u)), Math.round(lerp(y1, y2, u)), 1, 1); }
  };
  // THE YOU DOT: amber core, soft cream ring, slow outward pulse. r = core radius (2 in the wide space, 5 close up)
  const youDot = (g, x, y, t, r, a) => {
    a = a === undefined ? 1 : a; if (a <= 0) return; x = Math.round(x); y = Math.round(y);
    A(g, a, () => {
      const ph = (((t % 2.6) + 2.6) % 2.6) / 2.6;
      A(g, 0.4 * (1 - ph), () => ring(g, x, y, r + 3 + ph * (r + 7), mix(D.amber[0], D.cream, 0.4)));
      PX.glow(g, x, y, r * 4 + 8, D.amber[1], 0.2 + 0.05 * Math.sin(t * 2.4));
      ring(g, x, y, r + 2, mix(D.cream, D.n1, 0.3));
      if (r <= 2) { PX.circle(g, x, y, r, D.amber[1]); R(g, x - 1, y - 1, 1, 1, D.amber[0]); R(g, x + 1, y + 1, 1, 1, D.amber[2]); }
      else { PX.circle(g, x, y, r, D.amber[2]); PX.circle(g, x - 1, y - 1, r - 1, D.amber[1]); PX.circle(g, x - 2, y - 2, 1, D.amber[0]); R(g, x - 2, y - 3, 2, 1, lt(D.amber[0], 0.5)); }
    });
  };
  // a video = small teal square (s = 1..3), lit 0..1
  const vsq = (g, x, y, s, col, hi) => { x = Math.round(x - s / 2); y = Math.round(y - s / 2); R(g, x, y, s, s, col); if (s >= 3 && hi) R(g, x, y, 1, 1, hi); };

  // ---------- shared dot field (people dots + video squares in 3D) ----------
  const FIELD = (() => {
    const r = PX.rnd(505), pts = [], g3 = () => r() + r() + r() - 1.5;
    for (let i = 0; i < 1300; i++) pts.push({ x: g3() * 1.9, y: g3() * 1.05, z: g3() * 1.9, v: 0, s: r() });
    for (let i = 0; i < 170; i++) pts.push({ x: g3() * 1.9, y: g3() * 1.05, z: g3() * 1.9, v: 1, s: r() });
    // the neighbourhood around the YOU dot (origin): similar people + videos they like
    for (let i = 0; i < 22; i++) { const a = r() * 6.28, b = (r() - 0.5) * 2.2, rr = 0.1 + r() * 0.26; pts.push({ x: Math.cos(a) * Math.cos(b) * rr, y: Math.sin(b) * rr * 0.8, z: Math.sin(a) * Math.cos(b) * rr, v: 0, s: r(), nb: 1, o: rr }); }
    for (let i = 0; i < 8; i++) { const a = i * 0.8 + r() * 0.5, b = (r() - 0.5) * 1.6, rr = 0.14 + r() * 0.2; pts.push({ x: Math.cos(a) * Math.cos(b) * rr, y: Math.sin(b) * rr * 0.8, z: Math.sin(a) * Math.cos(b) * rr, v: 1, s: r(), nb: 1, o: rr }); }
    // keep the rest of the crowd out of the neighbourhood so it reads
    return pts.filter((p) => p.nb || Math.hypot(p.x, p.y, p.z) > 0.5);
  })();
  const WALK_TO = { x: 0.27, y: 0.07, z: -0.1, v: 1, s: 0.5, nb: 1, o: 0.2 };
  FIELD.push(WALK_TO);
  const DIRS = (() => { const r = PX.rnd(77), out = []; for (let i = 0; i < 25; i++) { const z = r() * 2 - 1, a = r() * 6.2832, q = Math.sqrt(1 - z * z); out.push([q * Math.cos(a), z * 0.8, q * Math.sin(a)]); } return out; })();
  const DUST = (() => { const r = PX.rnd(31); return [...Array(200)].map(() => [r() * 760 - 60, r() * 480 - 60, r(), r()]); })();
  const proj = (x, y, z, cm) => {
    x -= cm.tx; y -= cm.ty; z -= cm.tz;
    const cy = Math.cos(cm.yaw), sy = Math.sin(cm.yaw); const X = x * cy - z * sy; let Z = x * sy + z * cy;
    const cp = Math.cos(cm.pitch), sp = Math.sin(cm.pitch); const Y = y * cp - Z * sp; Z = y * sp + Z * cp;
    const zc = Z + cm.dist; if (zc < 0.1) return null;
    return [320 + (cm.f * X) / zc, 180 + (cm.f * Y) / zc, zc];
  };
  const spaceBg = (g, c, t) => {
    PX.vgrad(g, 0, 0, 640, 360, D.n0, mix(D.n1, D.steel[2], 0.18), 9);
    PX.par(g, c, 0.3, () => {
      PX.glow(g, 300, 170, 300, mix(D.steel[2], D.n2, 0.4), 0.16);
      for (const [x, y, a, s] of DUST) { const tw = 0.5 + 0.5 * Math.sin(t * (0.4 + s) + a * 9); A(g, 0.12 + 0.18 * tw * a, () => R(g, x, y, 1, 1, s > 0.8 ? D.teal[2] : D.n6)); }
    });
  };
  // draw the projected field; style(pt, pr) -> optional overrides
  const drawField = (g, c, t, cm, hook, pts) => {
    const list = [];
    for (const p of (pts || FIELD)) { const pr = proj(p.x, p.y, p.z, cm); if (!pr || pr[0] < -80 || pr[0] > 720 || pr[1] < -80 || pr[1] > 440) continue; list.push([pr, p]); }
    list.sort((a, b) => b[0][2] - a[0][2]);
    const one = ([pr, p]) => {
      const [x, y, zc] = pr, fog = clamp((zc - 0.55) / 2.6, 0, 1);
      if (hook && hook(p, pr, fog)) return;
      if (zc < 0.42) { // out of focus, very close: soft disc
        const rr = clamp(2.4 / zc, 4, 16); PX.glow(g, x, y, rr, p.v ? D.teal[1] : mix(D.steel[0], D.cream, 0.3), 0.22); return; }
      const tw = p.s > 0.9 ? 0.75 + 0.25 * Math.sin(t * (0.8 + p.s) + p.s * 40) : 1;
      if (p.v) vsq(g, x, y, zc < 1.15 ? 2 : 1, mix(D.teal[2], D.n1, 0.15 + fog * 0.7));
      else { const col = mix(mix(D.steel[0], D.cream, p.s < 0.55 ? 0.15 : 0.6), D.n1, 0.2 + fog * 0.7); A(g, tw, () => R(g, Math.round(x), Math.round(y), zc < 0.9 ? 2 : 1, zc < 0.9 ? 2 : 1, col)); }
    };
    const far = list.filter((e) => e[0][2] > 2.15), near = list.filter((e) => e[0][2] <= 2.15);
    PX.par(g, c, 0.65, () => far.forEach(one));
    return () => near.forEach(one);   // caller draws near layer after its own mid-layer art
  };

  // ===================================================================================================
  // dot_space (17): vast calm space of dots; YOU appears, 50 directions, neighbours brighten, videos close by, a short walk
  K.dot_space = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const k = d / 17, TY = o.you ?? 0.5 * k, TD = o.dims ?? 3 * k, TN = o.near ?? 6 * k, TV = o.videos ?? 9 * k, TW = o.walk ?? 12 * k;
      spaceBg(g, c, t);
      const cm = { yaw: 0.55 + t * 0.03, pitch: -0.2 + 0.04 * Math.sin(t * 0.21), f: 340, tx: 0, ty: 0, tz: 0,
        dist: 1.95 - 0.68 * P(t, TY - 0.3, 3.8, "io") + 0.55 * P(t, TW + 2.8, 3.4, "io") };
      const pn = P(t, TN, 1.6, "io"), pv = P(t, TV, 1.4, "io");
      const drawNear = drawField(g, c, t, cm, (p, pr, fog) => {
        if (!p.nb) return false;
        const [x, y, zc] = pr;
        if (p.v) {
          const lit = clamp(pv * 1.4 - p.o * 2, 0, 1), arrive = p === WALK_TO ? P(t, TW + 2.0, 0.5, "out") : 0;
          if (lit > 0) PX.glow(g, x, y, 10 + arrive * 8, D.teal[1], 0.12 * lit + arrive * 0.2);
          vsq(g, x, y, lit > 0.3 ? 3 : 2, mix(mix(D.teal[2], D.n1, 0.2 + fog * 0.6), arrive ? D.teal[0] : D.teal[1], lit), lit > 0.3 ? mix(D.teal[1], D.cream, 0.5) : null);
          if (arrive > 0 && arrive < 1) A(g, 1 - arrive, () => ring(g, x, y, 3 + arrive * 9, D.teal[0]));
        } else {
          const lit = clamp(pn * 1.3 - p.o * 1.5, 0, 1), base = mix(mix(D.steel[0], D.cream, 0.35), D.n1, 0.22 + fog * 0.68);
          if (lit > 0) PX.glow(g, x, y, 7, D.cream, 0.1 * lit);
          R(g, Math.round(x), Math.round(y), 2, 2, mix(base, D.cream, lit));
          if (lit > 0.6) R(g, Math.round(x), Math.round(y), 1, 1, lt(D.cream, 0.6));
        }
        return true;
      });
      // 50 directions: faint dotted axes through the YOU dot
      const pd = P(t, TD, 0.3);
      if (pd > 0) DIRS.forEach((u, i) => {
        const a = P(t, TD + i * 0.06, 0.5), L = 0.62; if (a <= 0) return;
        const p0 = proj(-u[0] * L, -u[1] * L, -u[2] * L, cm), p1 = proj(u[0] * L, u[1] * L, u[2] * L, cm); if (!p0 || !p1) return;
        const flash = 1 - P(t, TD + i * 0.06 + 0.3, 1.2, "io");
        A(g, a * (0.32 + 0.4 * flash), () => dline(g, p0[0], p0[1], p1[0], p1[1], mix(D.steel[0], D.n1, 0.35 - 0.2 * flash), 3));
      });
      drawNear();
      // the walk: dotted steps from YOU to one video
      const pw = proj(WALK_TO.x, WALK_TO.y, WALK_TO.z, cm);
      if (pw && t >= TW) {
        const N = 10, dx = pw[0] - 320, dy = pw[1] - 180, L = Math.hypot(dx, dy) || 1, nx = -dy / L, ny = dx / L;
        for (let j = 1; j < N; j++) { const ap = P(t, TW + j * 0.2, 0.15); if (ap <= 0) break; const u = j / N, bend = Math.sin(u * Math.PI) * 9, side = j % 2 ? 1 : -1;
          A(g, ap, () => R(g, Math.round(320 + dx * u + nx * (bend + side * 1.5)), Math.round(180 + dy * u + ny * (bend + side * 1.5)), 2, 2, mix(D.amber[0], D.cream, 0.25))); }
      }
      // the YOU dot (origin)
      const ay = P(t, TY, 0.7, "out");
      if (ay > 0) {
        if (ay < 1) A(g, 1 - ay, () => ring(g, 320, 180, 4 + ay * 14, D.amber[0]));
        youDot(g, 320, 180, t - TY, 3, ay);
        label(g, "YOU", 320, 158, P(t, TY + 0.3, 0.5), D.amber[0]);
      }
      label(g, "50 DIRECTIONS", 320, 58, P(t, TD + 0.2, 0.6));
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // dot_moves (6.5): close on the YOU dot; tap / pause / scroll icons pop and each nudges it, leaving a faint trail;
  // a server rack silhouette far behind the dots
  const ICONS = {
    tap: ["....kk......", "...kwwk.....", "...kwwk.....", "...kwwk.....", "...kwwkkk...", "...kwwkwwkk.", "kk.kwwkwwkwk", "kwkkwwwwwwwk", "kwwkwwwwwwwk", ".kwwwwwwwwwk", "..kwwwwwwwk.", "..kwwwwwwwk.", "...kwwwwwk..", "...kkkkkkk.."],
    pause: ["kkkk..kkkk", "kwwk..kwwk", "kwwk..kwwk", "kwwk..kwwk", "kwwk..kwwk", "kwwk..kwwk", "kwwk..kwwk", "kwwk..kwwk", "kwwk..kwwk", "kwwk..kwwk", "kkkk..kkkk"],
    scroll: ["....k....", "...kwk...", "..kwwwk..", ".kwwwwwk.", "kkkkwkkkk", "....w....", "...kwk...", "...kwk...", "....w....", "kkkkwkkkk", ".kwwwwwk.", "..kwwwk..", "...kwk...", "....k...."],
  };
  const MOVES = [["tap", 30, -9], ["pause", 16, 14], ["scroll", 27, -15], ["pause", -6, -17], ["tap", 23, 8]];
  // a denser local patch of the space for the close-up
  const LOCAL = (() => { const r = PX.rnd(808), out = [];
    for (let i = 0; i < 820; i++) { const v = r() < 0.12 ? 1 : 0; out.push({ x: (r() - 0.5) * 2.4, y: (r() - 0.5) * 1.4, z: (r() - 0.35) * 2.2, v, s: r() }); }
    return out.filter((p) => Math.hypot(p.x, p.y * 1.6, p.z) > 0.14); })();
  const rack = (g, x, y, w, h, t, seed, fogK) => {
    const body = mix(D.n3, D.n1, fogK), face = mix(D.n1, D.n0, 0.3), rail = mix(D.n4, D.n1, fogK), vent = mix(D.n2, D.n1, fogK);
    R(g, x, y, w, h, body); R(g, x, y, w, 1, mix(D.n5, D.n1, fogK)); R(g, x + 3, y + 5, w - 6, h - 8, face);
    R(g, x + 3, y + 5, 2, h - 8, rail); R(g, x + w - 5, y + 5, 2, h - 8, rail);
    const r = PX.rnd(seed);
    for (let uy = y + 8; uy < y + h - 10; uy += 8) {
      const big = r() < 0.2, uh = big ? 13 : 6; if (uy + uh > y + h - 6) break;
      R(g, x + 6, uy, w - 12, uh, vent); R(g, x + 6, uy, w - 12, 1, rail);
      for (let vx = x + 9; vx < x + w * 0.55; vx += 3) R(g, vx, uy + 2, 1, uh - 3, face);
      for (let q = 0; q < 4; q++) { const sp = 0.3 + r() * 1.1, ph = r() * 6.28, pick = r(), col = pick < 0.12 ? D.amber[1] : pick < 0.6 ? D.teal[1] : D.moss[1];
        if (Math.sin(t * sp + ph) > -0.3) R(g, x + w - 10 - q * 4, uy + 2, 2, 1, mix(col, D.n1, 0.35 + fogK * 0.45)); }
      if (big) uy += 7;
    }
  };
  K.dot_moves = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const k = d / 6.5;
      let MS, ME;
      if (Array.isArray(o.moves)) { MS = o.moves[0]; ME = o.moves[1]; }
      else { MS = o.moves ?? 0.5 * k; ME = o.movesEnd ?? (MS < 0 ? Math.min(MS + 5 * k, -2) : MS + 5 * k); }
      const n = MOVES.length, step = Math.max(0, ME - MS) / (n - 1), TI = MOVES.map((_, i) => MS + i * step);
      const start = [254, 198];
      const posAt = (s) => { let x = start[0], y = start[1]; MOVES.forEach(([, dx, dy], i) => { const e = P(s, TI[i] + 0.12, 0.55, "out"); x += dx * e; y += dy * e; }); return [x, y]; };
      const [px, py] = posAt(t);
      // far: an aisle of server racks behind the space, low contrast
      PX.vgrad(g, 0, 0, 640, 360, D.n0, mix(D.n1, D.steel[2], 0.15), 9);
      PX.par(g, c, 0.3, () => {
        R(g, -60, 292, 760, 130, mix(D.n1, D.n0, 0.3)); R(g, -60, 292, 760, 1, D.n2);
        [[-40, 0.75], [44, 0.6], [128, 0.55], [212, 0.5], [380, 0.45], [464, 0.5], [548, 0.6], [632, 0.75]].forEach(([x, f], i) => rack(g, x, 30 + Math.abs(i - 3.5) * 2, 80, 262 - Math.abs(i - 3.5) * 2, t, 11 + i, f));
        for (let x = -60; x < 700; x += 4) R(g, x, 296 + ((x / 4) % 3), 2, 1, mix(D.n2, D.n0, 0.5));
        A(g, 0.64, () => R(g, -60, -60, 760, 480, D.n0));
        PX.glow(g, 320, 150, 200, mix(D.steel[2], D.teal[2], 0.3), 0.16);
      });
      // mid haze band
      PX.par(g, c, 0.6, () => { for (let b = 0; b < 3; b++) A(g, 0.06, () => R(g, ((t * (3 + b * 2) + b * 210) % 900) - 300, 120 + b * 50, 320, 14 + b * 6, D.steel[2])); });
      // the space follows the dot a little (parallax as it travels)
      const cm = { yaw: 0.2 + t * 0.03, pitch: -0.1, f: 300, dist: 0.85, tx: (px - start[0]) * 0.0022, ty: (py - start[1]) * 0.0022, tz: 0 };
      drawField(g, c, t, cm, null, LOCAL)();
      // trail: faint dotted path + ghost rings at each resting place
      if (t > Math.min(MS, ME)) {
        let prev = null;
        for (let s = Math.min(MS, ME); s <= t; s += 0.02) { const q = posAt(s); if (prev && Math.hypot(q[0] - prev[0], q[1] - prev[1]) < 3) continue; const age = clamp((t - s) / 7, 0, 1);
          R(g, Math.round(q[0]), Math.round(q[1]), 1, 1, mix(mix(D.amber[1], D.cream, 0.2), D.n1, 0.25 + 0.45 * age)); prev = q; }
        TI.forEach((ti) => { if (t < ti + 0.7) return; const q = posAt(ti); ring(g, q[0], q[1], 3, mix(D.amber[2], D.n1, 0.35)); R(g, Math.round(q[0]), Math.round(q[1]), 1, 1, mix(D.amber[1], D.n1, 0.4)); });
      }
      // icons: pop behind the dot, impulse, push
      MOVES.forEach(([ic, dx, dy], i) => {
        const ti = TI[i], life = step > 0 ? clamp(step * 0.85, 0.45, 1.05) : 1.05; if (t < ti || t > ti + life + 0.5) return;
        const q = posAt(ti), L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
        const bx = Math.round(q[0] - ux * 30 - uy * 8), by = Math.round(q[1] - uy * 30 + ux * 8);
        const pop = P(t, ti, 0.25, "back"), fade = 1 - P(t, ti + life, 0.45, "io"), rise = Math.round((1 - pop) * 4);
        A(g, clamp(Math.min(pop * 1.5, fade), 0, 1), () => {
          const x0 = bx - 13, y0 = by - 13 + rise, S = 26;
          A(g, 0.5, () => R(g, x0 + 2, y0 + 3, S, S, SH(0.6)));
          R(g, x0 + 1, y0, S - 2, S, mix(D.n2, D.steel[2], 0.45)); R(g, x0, y0 + 1, S, S - 2, mix(D.n2, D.steel[2], 0.45));
          R(g, x0 + 1, y0, S - 2, 1, mix(D.steel[1], D.cream, 0.25)); R(g, x0, y0 + 1, 1, S - 3, mix(D.steel[1], D.n2, 0.3));
          R(g, x0 + 1, y0 + S - 1, S - 2, 1, mix(D.steel[2], D.n0, 0.5)); R(g, x0 + S - 1, y0 + 2, 1, S - 3, mix(D.steel[2], D.n0, 0.3));
          const spr = ICONS[ic]; PX.sprite(g, spr, bx - Math.floor(spr[0].length / 2), by - Math.floor(spr.length / 2) + rise, { k: D.n1, w: D.cream });
          if (t < ti + 0.35) A(g, 1 - P(t, ti, 0.35), () => ring(g, bx, by + rise, 16 + P(t, ti, 0.35) * 6, D.cream));
        });
        // impulse: three short pulses travelling to the dot
        const ip = P(t, ti + 0.02, 0.22, "lin");
        if (ip > 0 && ip < 1) for (let j = 0; j < 3; j++) { const u = clamp(ip * 1.3 - j * 0.15, 0, 1); if (u <= 0 || u >= 1) continue;
          const cx = lerp(bx + ux * 15, q[0] - ux * 9, u), cy = lerp(by + uy * 15, q[1] - uy * 9, u);
          A(g, 0.85 * (1 - u * 0.6), () => R(g, Math.round(cx), Math.round(cy), 2, 2, D.cream)); }
      });
      // the YOU dot, with a flash ring on each push
      let hit = 0; TI.forEach((ti) => { const e = t - ti - 0.12; if (e >= 0 && e < 0.4) hit = Math.max(hit, 1 - e / 0.4); });
      if (hit > 0) A(g, hit * 0.8, () => ring(g, px, py, 9 + (1 - hit) * 8, D.amber[0]));
      youDot(g, px, py, t, 5);
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // nudge (14): a vast dim control room; a giant mixing desk of sliders (rows = people, columns = movies) starts random,
  // waves of tiny nudges ripple across, the ERROR meter on the wall falls step by step; board: AGAIN ... BILLIONS OF TIMES
  const NR = 5, NC = 12, DY0 = 202, DY1 = 316;
  const NG = (() => { const r = PX.rnd(1212), a = []; for (let j = 0; j < NR; j++) for (let c = 0; c < NC; c++) a.push({ v0: 0.06 + r() * 0.88, tg: 0.18 + r() * 0.64, dl: r() * 0.45, ph: r() * 6.28 }); return a; })();
  const yAt = (u) => DY0 + (DY1 - DY0) * (u * 0.82 + u * u * 0.18);
  const xL = (y) => lerp(100, 54, (y - DY0) / (DY1 - DY0)), xRt = (y) => lerp(540, 586, (y - DY0) / (DY1 - DY0));
  const colX = (c, y) => { const a = xL(y) + 30, b = xRt(y) - 8; return Math.round(lerp(a, b, (c + 0.5) / NC)); };
  const bust = (g, x, y, col, sh) => { PX.circle(g, x, y, 3, col); R(g, x - 1, y - 2, 2, 1, lt(col, 0.4)); R(g, x - 5, y + 5, 11, 4, col); R(g, x - 4, y + 4, 9, 1, col); R(g, x + 2, y + 5, 3, 4, sh); };
  K.nudge = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const k = d / 14, TR = o.random ?? 0.5 * k, TN = o.nudge ?? 3 * k, TB = o.billions ?? 10.5 * k;
      // wave schedule: intervals shrink, sweeps get quicker; replaced by a blur of tiny waves at TB
      const WV = []; { let tt = TN, i = 0; while (tt < TB && i < 200) { const iv = k * Math.max(0.3, 1.5 * Math.pow(0.8, i)); WV.push([tt, Math.min(0.95, iv * 0.72)]); tt += iv; i++; } }
      const bil = t >= TB ? (t - TB) : -1;
      const waves = (frac, tq) => { tq = tq === undefined ? t : tq; let n = 0, last = -1e9;
        for (const [T0, sw] of WV) { const a = T0 + frac * sw; if (tq < a) break; last = a; if (tq >= a + 0.3) n++; else { n += PX.ease((tq - a) / 0.3, "out"); break; } }
        if (tq >= TB) { const b = tq - TB; n += b / 0.1 + 4; last = Math.max(last, tq - (b % 0.1)); } return [n, last]; };
      const errAt = (tq) => P(tq, TR, 0.5) * (0.07 + 0.93 * Math.pow(0.72, waves(1, tq)[0]));
      const rp = P(t, TR, 0.5);
      R(g, 0, 0, 640, 360, D.n0);
      // ---- far: back wall, ceiling strips, wall screens, LED board, error meter ----
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -60, -60, 760, 200, D.n0, mix(D.n1, D.steel[2], 0.2), 8);
        for (let x = -40; x < 700; x += 84) { R(g, x, -60, 1, 200, D.n0); R(g, x + 1, -60, 1, 200, mix(D.n1, D.n2, 0.6)); }
        R(g, -60, 22, 760, 1, D.n0); R(g, -60, 23, 760, 1, D.n2);
        for (let i = 0; i < 8; i++) { const x = -18 + i * 96; R(g, x, 6, 46, 3, mix(D.n3, D.lamp, 0.25)); PX.glow(g, x + 23, 10, 34, D.lamp, 0.05); }
        // wall screen: the error history (a falling line, no numbers); second screen: slow activity bars
        const sx = 24, sy = 46, sw = 96, sh = 60;
        R(g, sx - 3, sy - 3, sw + 6, sh + 6, D.n1); R(g, sx - 3, sy - 3, sw + 6, 1, D.n3); R(g, sx, sy, sw, sh, mix(D.n0, D.steel[2], 0.25));
        for (let gy = 6; gy < sh; gy += 9) R(g, sx, sy + gy, sw, 1, mix(D.n0, D.steel[2], 0.38));
        let py = null; for (let x = 0; x <= sw - 4; x += 2) { const tq = t - (1 - x / (sw - 4)) * 7, y = sy + sh - 6 - (sh - 14) * errAt(tq);
          if (py !== null) PX.line(g, sx + x + 1, py, sx + x + 2, y, mix(D.steel[0], D.cream, 0.2)); py = y; }
        R(g, sx + sw - 4, Math.round(py) - 1, 3, 3, D.cream); PX.glow(g, sx + sw / 2, sy + sh / 2, 60, D.steel[1], 0.08);
        const s2x = 130, s2w = 80;
        R(g, s2x - 3, sy - 3, s2w + 6, sh + 6, D.n1); R(g, s2x - 3, sy - 3, s2w + 6, 1, D.n3); R(g, s2x, sy, s2w, sh, mix(D.n0, D.teal[2], 0.25));
        for (let b = 0; b < 12; b++) { const hgt = Math.round(8 + (sh - 18) * (0.5 + 0.45 * Math.sin(t * 0.6 + b * 1.7) * Math.cos(t * 0.23 + b))); R(g, s2x + 4 + b * 6, sy + sh - 4 - hgt, 4, hgt, mix(D.teal[2], D.n1, 0.15)); R(g, s2x + 4 + b * 6, sy + sh - 4 - hgt, 4, 1, D.teal[1]); }
        // LED board
        const bx = 236, by = 40, bw = 168, bh = 36;
        R(g, bx - 4, by - 4, bw + 8, bh + 8, D.n2); R(g, bx - 4, by - 4, bw + 8, 1, D.n4); R(g, bx, by, bw, bh, D.n0);
        for (let yy = by; yy < by + bh; yy += 2) for (let xx = bx + ((yy / 2) % 2); xx < bx + bw; xx += 4) R(g, xx, yy, 1, 1, mix(D.n1, D.n2, 0.5));
        g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
        if (bil >= 0) { const s = PX.typed("BILLIONS OF TIMES", t, TB, 26); PX.text(g, s, bx + bw / 2, by + 9, { font: "v", size: 20, col: D.cream, align: "center" }); PX.glow(g, bx + bw / 2, by + bh / 2, 70, D.cream, 0.08); }
        else if (WV.length > 1 && t >= WV[1][0]) {
          let lastW = 0; for (let i = 1; i < WV.length; i++) if (t >= WV[i][0]) lastW = WV[i][0];
          const fl = 1 - P(t, lastW, 0.55, "io"), a = 0.45 + 0.55 * fl;
          A(g, a, () => PX.text(g, "AGAIN", bx + bw / 2, by + 9, { font: "v", size: 20, col: D.cream, align: "center" })); PX.glow(g, bx + bw / 2, by + bh / 2, 50, D.cream, 0.06 * a);
        } else if (PX.blink(t, 1.1, 0.55)) R(g, bx + bw / 2 - 4, by + 24, 9, 2, mix(D.cream, D.n0, 0.3));
        for (let yy = by; yy < by + bh; yy += 2) A(g, 0.35, () => R(g, bx, yy + 1, bw, 1, D.n0));
        g.restore();
        // ERROR meter: segmented column, steps down as the waves finish
        const mx = 492, my = 34, mw = 30, mh = 76, NS = 14;
        R(g, mx - 5, my - 5, mw + 10, mh + 24, D.n2); R(g, mx - 5, my - 5, mw + 10, 1, D.n4); R(g, mx - 5, my - 5, 1, mh + 24, D.n3); R(g, mx, my, mw, mh, D.n0);
        const lev = errAt(t), lit = Math.ceil(lev * NS - 0.01);
        for (let s2 = 0; s2 < NS; s2++) { const y = my + mh - 4 - s2 * 5.3, on = s2 < lit, hot = s2 >= NS - 4;
          const col = on ? (hot ? D.rust[1] : D.lamp) : mix(hot ? D.rust[2] : D.lampD, D.n0, 0.82); R(g, mx + 4, y - 3, mw - 8, 4, col); if (on) R(g, mx + 4, y - 3, mw - 8, 1, lt(col, 0.35)); }
        if (lit > 0) PX.glow(g, mx + mw / 2, my + mh - lit * 2.7, 26, lit > NS - 4 ? D.rust[1] : D.lampD, 0.2);
        R(g, mx - 1, my + mh + 4, mw + 2, 11, mix(D.n1, D.n0, 0.4)); PX.text(g, "ERROR", mx + mw / 2, my + mh + 4, { font: "v", size: 12, col: D.paperD, align: "center" });
        for (let i = 0; i < 3; i++) { R(g, 560, 46 + i * 24, 140, 3, D.n1); R(g, 560, 46 + i * 24, 140, 1, D.n2); }
      });
      // ---- mid-far: a higher tier of empty consoles ----
      PX.par(g, c, 0.55, () => {
        R(g, -60, 132, 760, 60, mix(D.n1, D.n0, 0.4)); R(g, -60, 132, 760, 1, D.n2);
        for (let i = 0; i < 11; i++) { const x = -30 + i * 66, on = Math.sin(t * (0.25 + i * 0.05) + i * 2) > -0.7;
          R(g, x, 141, 50, 6, D.n2); R(g, x + 8, 131, 14, 10, D.n1); R(g, x + 9, 132, 12, 8, mix(D.n1, D.teal[2], on ? 0.35 : 0.15)); R(g, x + 26, 131, 14, 10, D.n1); R(g, x + 27, 132, 12, 8, mix(D.n1, D.steel[2], 0.3)); }
      });
      // ---- mid: the nearer tier of empty operator consoles, small monitor glows, railing ----
      PX.par(g, c, 0.7, () => {
        R(g, -60, 158, 760, 220, mix(D.n1, D.n0, 0.15)); R(g, -60, 158, 760, 1, D.n3);
        for (let i = 0; i < 8; i++) { const x = -20 + i * 92, fl = Math.sin(t * (0.3 + i * 0.07) + i) > -0.6 ? 1 : 0.6;
          R(g, x, 166, 70, 9, D.n2); R(g, x, 166, 70, 1, D.n4);
          for (let m = 0; m < 2; m++) { R(g, x + 10 + m * 28, 152, 22, 14, D.n1); R(g, x + 11 + m * 28, 153, 20, 11, mix(D.n1, D.teal[2], 0.45 * fl)); A(g, 0.06 * fl, () => R(g, x + 6 + m * 28, 164, 30, 6, D.teal[1])); }
          R(g, x + 27, 170, 16, 12, D.n1); R(g, x + 29, 168, 12, 2, D.n2);
        }
        R(g, -60, 184, 760, 2, D.n2); R(g, -60, 184, 760, 1, D.n4);
        for (let x = -60; x < 700; x += 40) R(g, x, 185, 2, 12, D.n2);
        for (let y = 200; y < 380; y += 14) R(g, -60, y, 760, 1, mix(D.n1, D.n2, 0.25));
      });
      // ---- the desk ----
      PX.glow(g, 320, 210, 300, mix(D.steel[2], D.n3, 0.3), 0.3);
      R(g, 92, 184, 456, 17, D.n2); R(g, 92, 184, 456, 1, D.n4); R(g, 92, 200, 456, 2, D.n1);
      for (let cc = 0; cc < NC; cc++) {
        const x = colX(cc, DY0), [, last] = waves(cc / (NC - 1)), fl = clamp(1 - (t - last) / 0.45, 0, 1);
        R(g, x - 3, 186, 6, 6, D.teal[2]); R(g, x - 3, 186, 5, 5, D.teal[1]); R(g, x - 3, 186, 2, 1, D.teal[0]);
        for (let sg = 0; sg < 3; sg++) { const on = rp > 0 && (sg < Math.round(fl * 3) || (sg === 0 && Math.sin(t * 1.3 + cc * 1.7) > 0.2)); R(g, x - 2, 197 - sg * 2, 4, 1, on ? mix(D.teal[0], D.cream, sg === 2 ? 0.4 : 0) : D.n1); }
      }
      for (let y = DY0; y <= DY1 + 2; y++) { const u = (y - DY0) / (DY1 - DY0); R(g, xL(y) - 2, y, xRt(y) - xL(y) + 4, 1, mix(D.n3, D.n2, 0.25 + 0.5 * u)); }
      for (let y = DY0; y <= DY1 + 2; y++) { R(g, xL(y) - 2, y, 1, 1, D.n5); R(g, xRt(y) + 1, y, 1, 1, D.n1); }
      // wave front: faint cool light sweeping across
      for (const [T0, sw] of WV) { if (t < T0 || t > T0 + sw + 0.2) continue; const u = (t - T0) / sw, x = lerp(colX(0, 260) - 10, colX(NC - 1, 260) + 10, clamp(u, 0, 1));
        A(g, 0.5 * (1 - clamp((u - 1) * 5, 0, 1)), () => { for (let y = DY0; y < DY1; y += 1) R(g, x - 2, y, 4, 1, mix(D.teal[1], D.n3, 0.55)); PX.glow(g, x, 258, 46, D.teal[1], 0.1); }); }
      if (bil >= 0) A(g, 0.06 + 0.04 * Math.sin(t * 30), () => PX.glow(g, 320, 258, 200, D.teal[1], 0.25));
      for (let j = 0; j < NR; j++) {
        const y0 = Math.round(yAt(j / NR)), y1 = Math.round(yAt((j + 1) / NR)), h = y1 - y0, you = j === 2;
        R(g, xL(y0) + 2, y0, xRt(y0) - xL(y0) - 4, 1, D.n1); R(g, xL(y0) + 2, y0 + 1, xRt(y0) - xL(y0) - 4, 1, mix(D.n4, D.n3, 0.4));
        const tx = Math.round(xL(y0) + 8), ty = y0 + 3;
        R(g, tx - 2, ty, 18, h - 5, D.n1); R(g, tx - 2, ty + h - 6, 18, 1, D.n4);
        bust(g, tx + 7, ty + Math.round(h / 2) - 5, you ? D.amber[1] : mix(D.steel[0], D.cream, 0.35), you ? D.amber[2] : D.steel[2]);
        if (you) PX.glow(g, tx + 7, ty + h / 2, 12, D.amber[1], 0.12);
        for (let cc = 0; cc < NC; cc++) {
          const s = NG[j * NC + cc], x = colX(cc, y0 + h / 2), [nW, last] = waves(cc / (NC - 1));
          const vr = lerp(0.5, s.v0, P(t, TR + s.dl, 0.35, "back"));
          let v = s.tg + (vr - s.tg) * Math.pow(0.72, nW);
          if (bil >= 0) v += Math.sin(t * 21 + s.ph * 5) * 0.025;
          const fl = clamp(1 - (t - last) / 0.4, 0, 1);
          const st = y0 + 4, sl = h - 9, ky = Math.round(st + (1 - clamp(v, 0, 1)) * sl), kw = 8 + Math.round(j * 0.5);
          R(g, x - 1, st - 1, 2, sl + 4, D.n0); R(g, x + 1, st - 1, 1, sl + 4, mix(D.n4, D.n3, 0.5));
          for (let tk = 0; tk <= 4; tk++) R(g, x + Math.floor(kw / 2) + 1, st + Math.round(tk * sl / 4), 2, 1, mix(D.n5, D.n3, 0.4));
          A(g, 0.5, () => R(g, x - kw / 2, ky + 2, kw, 2, SH(0.6)));
          const kc = mix(D.paperD, D.cream, fl * 0.7);
          R(g, x - kw / 2, ky - 1, kw, 4, kc); R(g, x - kw / 2, ky - 1, kw, 1, lt(kc, 0.45)); R(g, x - kw / 2, ky + 2, kw, 1, mix(kc, D.n3, 0.45)); R(g, x - kw / 2 + 1, ky + 1, kw - 2, 1, mix(D.ink, kc, 0.3));
          R(g, x - kw / 2 - 3, st, 2, 2, fl > 0 ? mix(D.n2, D.teal[0], fl) : (rp > 0 && Math.sin(t * 0.7 + s.ph) > 0.85 ? D.teal[2] : D.n1));
          if (fl > 0.3) PX.glow(g, x, ky, 7, D.cream, 0.12 * fl);
        }
      }
      // desk front armrest + front panel
      R(g, 44, DY1 + 3, 552, 12, D.n3); R(g, 44, DY1 + 3, 552, 1, mix(D.n5, D.steel[1], 0.2)); R(g, 44, DY1 + 14, 552, 2, D.n1);
      R(g, 44, DY1 + 16, 552, 60, mix(D.n1, D.n0, 0.3)); for (let x = 70; x < 580; x += 6) R(g, x, DY1 + 26, 3, 1, D.n2);
      // the empty operator chair (foreground right, seen from behind), rim-lit by the desk
      const chx = 552, chy = 246, CW = 80, CH = 130, RIM = mix(D.steel[1], D.n3, 0.35), BK = [mix(D.n3, D.n2, 0.5), D.n2, mix(D.n2, D.n0, 0.5)];
      A(g, 0.45, () => R(g, chx - 10, chy + 10, CW + 20, CH, SH(0.6)));
      // headrest on a post
      R(g, chx + CW / 2 - 3, chy - 6, 6, 10, BK[2]);
      for (let r = 0; r < 18; r++) { const ins = r < 4 ? 4 - Math.round(Math.sqrt(16 - (4 - r) * (4 - r))) : r > 14 ? 3 - Math.round(Math.sqrt(9 - (r - 14) * (r - 14))) : 0, w = 48 - ins * 2;
        R(g, chx + CW / 2 - w / 2, chy - 26 + r, w, 1, BK[1]); R(g, chx + CW / 2 - w / 2, chy - 26 + r, 1, 1, RIM); }
      R(g, chx + CW / 2 - 20, chy - 26, 40, 1, RIM);
      // backrest: rounded top, slight taper
      for (let r = 0; r < CH; r++) { const ins = r < 10 ? 10 - Math.round(Math.sqrt(100 - (10 - r) * (10 - r))) : 0, tap = Math.round(Math.max(0, r - 60) * 0.06), w = CW - (ins + tap) * 2, x = chx + ins + tap;
        R(g, x, chy + r, w, 1, BK[1]); R(g, x + 6, chy + r, w - 12, 1, BK[0]); R(g, x + w - 8, chy + r, 8, 1, BK[2]); R(g, x, chy + r, 1, 1, RIM); }
      R(g, chx + 10, chy, CW - 20, 1, RIM);
      for (let i = 0; i < 6; i++) R(g, chx + 12, chy + 20 + i * 16, CW - 24, 1, BK[2]);
      PX.glow(g, chx + 10, chy + 4, 30, D.steel[1], 0.08);
      PX.particles(g, 9, 26, t, [150, 90, 340, 200], { vy: -2, vx: 1.5, col: mix(D.steel[0], D.cream, 0.5), a: 0.4, tw: 1 });
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // axes (20): a darkroom light table; movie slides (simple pictures, no text) slide into place along grease-pencil axes:
  // SERIOUS-SILLY (a1), KIDS-ADULTS (a2), EXPLOSIONS-CONVERSATIONS (a3); a card NOBODY TOLD IT is pinned (nobody)
  const TY0 = 104, TY1 = 318;
  const tXL = (v) => lerp(108, 56, v), tXR = (v) => lerp(532, 584, v);
  const tmap = (u, v) => [lerp(tXL(v), tXR(v), u), lerp(TY0, TY1, v)];
  // slides: [motif, s (0 serious .. 1 silly), k (0 kids .. 1 adults), e (0 explosions .. 1 conversations), lane on the first axis]
  const SLIDES = [["storm", 0.0, 0.7, 0.4, -1], ["talk", 0.08, 0.92, 1.0, 1], ["burst", 0.17, 0.62, 0.0, -1], ["wine", 0.26, 1.0, 0.92, 1], ["tea", 0.36, 0.55, 0.8, -1],
    ["rocket", 0.45, 0.25, 0.12, 1], ["car", 0.55, 0.48, 0.06, -1], ["castle", 0.65, 0.12, 0.5, 1], ["balloon", 0.76, 0.05, 0.62, -1], ["hat", 0.88, 0.38, 0.7, 1], ["duck", 1.0, 0.0, 0.55, -1]];
  const PILE = (() => { const r = PX.rnd(4242); return SLIDES.map(() => [0.22 + r() * 0.56, 0.24 + r() * 0.5, r()]); })();
  const motif = (g, m, x, y) => { // 16 x 24 picture area at x, y (backlit transparency colours)
    const W = 16, H = 24, Rr = (a, b, w, h, col) => R(g, x + a, y + b, w, h, col), C = (a, b, r, col) => PX.circle(g, x + a, y + b, r, col);
    const bgs = { storm: mix(D.steel[2], D.n2, 0.4), talk: mix(D.rose[2], D.n2, 0.35), burst: mix(D.n1, D.rust[2], 0.35), wine: mix(D.plum[2], D.n1, 0.2), tea: mix(D.moss[2], D.n2, 0.2),
      rocket: mix(D.n1, D.steel[2], 0.4), car: mix(D.teal[2], D.n2, 0.2), castle: mix(D.steel[1], D.n3, 0.45), balloon: mix(D.teal[1], D.n4, 0.35), hat: mix(D.plum[2], D.n2, 0.1), duck: mix(D.teal[2], D.teal[1], 0.3) };
    PX.vgrad(g, x, y, W, H, bgs[m], dk(bgs[m], 0.35), 3);
    if (m === "storm") { for (const [a, b, r] of [[5, 7, 3], [9, 6, 4], [12, 8, 3]]) C(a, b, r, D.n6); Rr(3, 8, 11, 3, D.n6); Rr(3, 10, 11, 1, D.n5);
      for (const [a, b] of [[9, 12], [8, 13], [7, 14], [8, 15], [9, 15], [8, 16], [7, 17], [6, 18], [6, 19]]) Rr(a, b, 2, 1, D.amber[0]);
      for (let i = 0; i < 6; i++) Rr(2 + i * 2.5, 14 + (i % 3) * 3, 1, 2, mix(D.steel[0], D.n3, 0.3)); }
    if (m === "talk") { C(4, 11, 3, D.n1); Rr(2, 14, 4, 7, D.n1); Rr(6, 11, 1, 2, D.n1); C(12, 11, 3, D.n1); Rr(10, 14, 4, 7, D.n1); Rr(9, 11, 1, 2, D.n1);
      Rr(7, 7, 2, 1, D.cream); Rr(6, 5, 4, 2, mix(D.cream, D.rose[1], 0.3)); Rr(0, 21, W, 3, dk(D.rose[2], 0.4)); }
    if (m === "burst") { for (let a = 0; a < 8; a++) PX.line(g, x + 8, y + 12, x + 8 + Math.round(Math.cos(a * 0.785 + 0.3) * 7), y + 12 + Math.round(Math.sin(a * 0.785 + 0.3) * 9), D.rust[1]);
      C(8, 12, 4, D.amber[1]); C(8, 12, 2, D.amber[0]); Rr(0, 20, W, 4, D.n1); Rr(2, 19, 3, 1, D.n1); Rr(11, 18, 3, 2, D.n1); }
    if (m === "wine") { for (let r = 0; r < 7; r++) { const w = 9 - Math.round(r * 0.9); Rr(8 - w / 2, 5 + r, w, 1, r > 2 ? D.rust[2] : mix(D.cream, D.plum[2], 0.5)); }
      Rr(4, 5, 1, 3, D.cream); Rr(7, 12, 2, 6, D.cream); Rr(5, 18, 6, 1, D.cream); Rr(11, 4, 1, 1, D.cream); Rr(0, 20, W, 4, dk(D.plum[2], 0.3)); }
    if (m === "tea") { Rr(3, 12, 9, 6, D.cream); Rr(3, 12, 9, 1, lt(D.cream, 0.5)); Rr(12, 13, 2, 1, D.cream); Rr(13, 13, 1, 3, D.cream); Rr(12, 15, 2, 1, D.cream); Rr(4, 17, 7, 1, D.paperD);
      Rr(1, 18, 13, 1, D.paper); for (let i = 0; i < 4; i++) { Rr(5 + (i % 2), 9 - i * 1.5, 1, 1, D.n6); Rr(8 - (i % 2), 9 - i * 1.5, 1, 1, D.n6); } Rr(0, 19, W, 5, dk(D.moss[2], 0.3)); }
    if (m === "rocket") { for (const [a, b] of [[2, 3], [13, 5], [11, 19], [3, 15]]) Rr(a, b, 1, 1, D.cream); Rr(7, 4, 2, 1, D.rust[0]); Rr(6, 5, 4, 2, D.rust[1]);
      Rr(6, 7, 4, 9, D.cream); Rr(9, 7, 1, 9, D.paperD); Rr(7, 9, 2, 2, D.teal[1]); Rr(4, 13, 2, 4, D.rust[1]); Rr(10, 13, 2, 4, D.rust[1]); Rr(7, 16, 2, 2, D.amber[0]); Rr(7, 18, 2, 2, D.amber[1]); Rr(8, 20, 1, 1, D.amber[1]); }
    if (m === "car") { Rr(0, 18, W, 6, D.n2); for (let i = 0; i < 3; i++) Rr(0, 11 + i * 2, 3 - i, 1, D.cream); Rr(3, 13, 12, 4, D.rust[1]); Rr(3, 13, 12, 1, D.rust[0]); Rr(6, 10, 6, 3, D.rust[1]);
      Rr(7, 11, 2, 2, D.glass); Rr(10, 11, 1, 2, D.glass); C(5, 17, 1, D.n0); C(12, 17, 1, D.n0); Rr(14, 14, 1, 1, D.amber[0]); }
    if (m === "castle") { Rr(0, 19, W, 5, mix(D.moss[2], D.n2, 0.4)); Rr(3, 10, 10, 9, D.paper); Rr(2, 7, 3, 12, D.paper); Rr(11, 7, 3, 12, D.paper); Rr(6, 5, 4, 14, lt(D.paper, 0.3));
      Rr(2, 6, 1, 1, D.paper); Rr(4, 6, 1, 1, D.paper); Rr(11, 6, 1, 1, D.paper); Rr(13, 6, 1, 1, D.paper); Rr(7, 15, 2, 4, D.n2); Rr(8, 2, 1, 3, D.n2); Rr(9, 2, 2, 1, D.rust[1]); C(13, 3, 1, D.cream); }
    if (m === "balloon") { Rr(0, 20, W, 4, mix(D.moss[2], D.n3, 0.3)); C(8, 8, 4, D.rust[1]); Rr(6, 6, 2, 2, D.rust[0]); Rr(7, 12, 2, 1, D.rust[2]);
      for (let i = 0; i < 8; i++) Rr(8 + Math.round(Math.sin(i * 0.9)), 13 + i, 1, 1, D.n1); Rr(2, 4, 3, 1, lt(D.teal[1], 0.5)); Rr(11, 15, 3, 1, lt(D.teal[1], 0.5)); }
    if (m === "hat") { for (let r = 0; r < 13; r++) { const w = 1 + Math.round(r * 0.75); Rr(8 - w / 2, 5 + r, w, 1, (Math.floor((r + 1) / 3) % 2) ? D.amber[1] : D.moss[1]); }
      C(8, 4, 1, D.cream); Rr(2, 18, 12, 1, D.cream); for (const [a, b, col] of [[2, 4, D.rust[0]], [13, 6, D.cream], [3, 12, D.teal[0]], [13, 13, D.rust[0]], [5, 21, D.amber[0]], [11, 21, D.teal[0]], [1, 8, D.amber[0]]]) Rr(a, b, 1, 1, col); }
    if (m === "duck") { Rr(0, 17, W, 7, D.teal[2]); for (let i = 0; i < 4; i++) Rr(1 + i * 4, 19 + (i % 2) * 2, 2, 1, D.teal[0]);
      C(7, 15, 4, D.amber[1]); Rr(3, 15, 9, 3, D.amber[1]); C(11, 10, 3, D.amber[1]); Rr(14, 10, 2, 1, D.rust[0]); Rr(14, 11, 2, 1, D.rust[1]); Rr(11, 9, 1, 1, D.n0); Rr(5, 13, 3, 1, D.amber[0]); Rr(4, 17, 8, 1, D.amber[2]); }
  };
  const slide = (g, cx, cy, m, sh) => { // 22 x 30 slide mount centred at cx, cy
    const x = Math.round(cx - 11), y = Math.round(cy - 15);
    A(g, 0.35, () => R(g, x + sh, y + sh + 1, 22, 30, mix(D.n3, D.steel[2], 0.3)));
    R(g, x, y, 22, 30, D.paper); R(g, x, y, 22, 1, lt(D.paper, 0.5)); R(g, x, y + 29, 22, 1, D.paperD); R(g, x + 21, y, 1, 30, D.paperD);
    motif(g, m, x + 3, y + 3);
    R(g, x + 3, y + 3, 16, 1, SH(0.15));
  };
  const pencil = (g, x1, y1, x2, y2, col, p) => { // grease-pencil stroke, revealed 0..1 from its centre outward
    if (p <= 0) return; const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    PX.line(g, lerp(mx, x1, p), lerp(my, y1, p), lerp(mx, x2, p), lerp(my, y2, p), col);
    PX.line(g, lerp(mx, x1, p) + 0.6, lerp(my, y1, p) + 1, lerp(mx, x2, p) + 0.6, lerp(my, y2, p) + 1, col);
  };
  const arrowHead = (g, x, y, dx, dy, col) => { const L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L; for (const sg of [1, -1]) PX.line(g, x, y, x - ux * 6 + uy * 4 * sg, y - uy * 6 - ux * 4 * sg, col); };
  K.axes = (o) => {
    return (g, t, d, c) => {
      t = Math.max(0, t);
      const k = d / 20, T1 = o.a1 ?? 2 * k, T2 = o.a2 ?? 6 * k, T3 = o.a3 ?? 9.5 * k, TNB = o.nobody ?? 14 * k;
      const GP = mix(D.rust[2], D.ink, 0.25), GPd = mix(GP, D.n6, 0.5);
      R(g, 0, 0, 640, 360, D.n0);
      // ---- far: darkroom wall, safelight, drying line with prints, shelf of bottles, the pinned card ----
      PX.par(g, c, 0.45, () => {
        PX.vgrad(g, -60, -60, 760, 180, D.n0, mix(D.n1, D.rust[2], 0.12), 7);
        for (let y = -40; y < 110; y += 12) for (let x = -60 + ((y / 12) % 2) * 12; x < 700; x += 24) R(g, x, y, 1, 11, mix(D.n1, D.n0, 0.4));
        for (let y = -40; y < 110; y += 12) R(g, -60, y, 760, 1, mix(D.n1, D.n0, 0.4));
        // safelight
        const sf = 0.85 + 0.15 * Math.sin(t * 0.9) * Math.sin(t * 2.3);
        R(g, 566, 18, 26, 18, D.n2); R(g, 568, 20, 22, 13, mix(D.rust[2], D.rust[1], 0.4 * sf)); R(g, 576, 10, 6, 8, D.n2); PX.glow(g, 579, 28, 90, D.rust[2], 0.32 * sf);
        // drying line + prints
        PX.line(g, -60, 22, 700, 30, D.n4);
        [[150, 22], [196, 18], [252, 24], [404, 20], [458, 26]].forEach(([px, w], i) => { const sw = Math.round(Math.sin(t * 0.6 + i * 1.7) * 1), py = 25 + Math.round((px + 60) / 760 * 8);
          R(g, px + sw, py + 3, w, 30, mix(D.n4, D.n5, (i % 2) * 0.4)); PX.vgrad(g, px + 2 + sw, py + 5, w - 4, 26, mix(D.n2, D.n4, 0.2 + (i % 3) * 0.15), mix(D.n3, D.n5, 0.3), 3);
          for (let xx = 0; xx < w - 4; xx++) { const hh = Math.round(6 + Math.sin(xx * 0.35 + i * 2) * 3 + (i % 2) * 3); R(g, px + 2 + sw + xx, py + 31 - hh, 1, hh, mix(D.n1, D.n2, 0.5)); }
          if (i % 2) R(g, px + w - 8 + sw, py + 9, 3, 3, mix(D.n5, D.n6, 0.5));
          R(g, px + 3, py - 1, 3, 6, D.n6); R(g, px + w - 6, py - 1, 3, 6, D.n6); });
        // shelf + bottles (right)
        R(g, 486, 84, 220, 4, D.n3); R(g, 486, 88, 220, 2, D.n1);
        [[492, 10, 16, 0], [506, 8, 20, 1], [520, 12, 14, 2], [538, 9, 18, 0], [553, 14, 12, 3], [572, 9, 20, 1], [588, 10, 16, 0]].forEach(([bx, bw, bh, ty]) => {
          const col = [mix(D.amber[2], D.n1, 0.55), mix(D.n4, D.n2, 0.3), mix(D.steel[2], D.n2, 0.3), mix(D.paperD, D.n3, 0.6)][ty];
          R(g, bx, 84 - bh, bw, bh, col); R(g, bx + Math.floor(bw / 2) - 2, 84 - bh - 3, 4, 3, D.n2); R(g, bx + 1, 84 - bh + 1, 1, bh - 3, lt(col, 0.2)); R(g, bx + 2, 84 - bh + 6, bw - 4, 4, mix(col, D.paper, 0.35)); });
        // the card, pinned to the wall above the table
        if (t >= TNB) {
          const p = P(t, TNB, 0.55, "out"), sw = Math.sin((t - TNB) * 7) * Math.exp(-(t - TNB) * 3) * 2;
          const cx = 320, cy = 64 - Math.round((1 - p) * 14), cw = 128, ch = 24;
          A(g, clamp((t - TNB) / 0.15, 0, 1), () => {
            A(g, 0.5, () => R(g, cx - cw / 2 + 3, cy - ch / 2 + 3, cw, ch, SH(0.6)));
            R(g, cx - cw / 2 + Math.round(sw), cy - ch / 2, cw, ch, D.paper); R(g, cx - cw / 2 + Math.round(sw), cy - ch / 2, cw, 1, lt(D.paper, 0.5));
            R(g, cx - cw / 2 + Math.round(sw), cy - ch / 2 + 6, cw, 1, mix(D.paper, D.rose[1], 0.3)); R(g, cx - cw / 2 + Math.round(sw), cy + ch / 2 - 1, cw, 1, D.paperD);
            PX.text(g, "NOBODY TOLD IT", cx + Math.round(sw), cy - 2, { font: "p", size: 8, col: D.ink, align: "center" });
            const pin = P(t, TNB + 0.35, 0.2, "back"); PX.circle(g, cx, cy - ch / 2 + 2 - Math.round((1 - pin) * 4), 2, D.rust[1]); R(g, cx - 1, cy - ch / 2 + 1 - Math.round((1 - pin) * 4), 1, 1, D.rust[0]);
          });
          PX.glow(g, cx, cy, 70, D.cream, 0.06 * p);
        }
      });
      // ---- mid: the enlarger column (left), timer (right), table back rail ----
      PX.par(g, c, 0.72, () => {
        R(g, 22, -40, 12, 160, D.n2); R(g, 22, -40, 2, 160, D.n4); R(g, 32, -40, 2, 160, D.n1);
        R(g, 6, 34, 52, 30, D.n2); R(g, 6, 34, 52, 1, D.n4); R(g, 14, 64, 36, 10, D.n1); R(g, 22, 74, 20, 10, D.n2); R(g, 26, 84, 12, 4, mix(D.n1, D.glass, 0.25));
        for (let i = 0; i < 4; i++) R(g, 10, 40 + i * 5, 44, 1, D.n1);
        // darkroom timer: round face, glowing hands, no numbers
        PX.circle(g, 610, 70, 15, D.n2); PX.circle(g, 610, 70, 13, mix(D.n1, D.moss[2], 0.2)); for (let q = 0; q < 12; q++) R(g, 610 + Math.cos(q * 0.524) * 11, 70 + Math.sin(q * 0.524) * 11, 1, 1, mix(D.moss[1], D.n2, 0.4));
        PX.line(g, 610, 70, 610 + Math.cos(t * 0.6 - 1.57) * 10, 70 + Math.sin(t * 0.6 - 1.57) * 10, mix(D.moss[0], D.n2, 0.3)); PX.line(g, 610, 70, 604, 66, mix(D.moss[0], D.n2, 0.5));
        R(g, -60, 96, 760, 6, D.n2); R(g, -60, 96, 760, 1, D.n3);
      });
      // ---- the light table ----
      for (let y = TY0 - 7; y <= TY1 + 9; y++) { const v = (y - TY0) / (TY1 - TY0); R(g, tXL(v) - 8, y, tXR(v) - tXL(v) + 16, 1, y < TY0 - 5 ? D.n5 : D.n3); }
      for (let y = TY0; y <= TY1; y++) { const v = (y - TY0) / (TY1 - TY0); R(g, tXL(v), y, tXR(v) - tXL(v), 1, mix(mix(D.glass, D.n5, 0.42), D.n4, Math.abs(v - 0.45) * 0.5)); }
      g.save(); g.beginPath(); g.moveTo(tXL(0), TY0); g.lineTo(tXR(0), TY0); g.lineTo(tXR(1), TY1 + 1); g.lineTo(tXL(1), TY1 + 1); g.closePath(); g.clip();
      PX.glow(g, 320, 206, 280, mix(D.cream, D.glass, 0.4), 0.32);
      for (let i = 1; i < 12; i++) { const u = i / 12; PX.line(g, tmap(u, 0)[0], TY0, tmap(u, 1)[0], TY1, mix(D.glass, D.n5, 0.3)); }
      for (let i = 1; i < 8; i++) { const v = i / 8, y = lerp(TY0, TY1, v); R(g, tXL(v), y, tXR(v) - tXL(v), 1, mix(D.glass, D.n5, 0.3)); }
      // dust on the glass
      for (let i = 0; i < 30; i++) { const u = ((i * 0.618) % 1), v = ((i * 0.377 + 0.1) % 1), [x, y] = tmap(u, v); R(g, x, y, 1, 1, mix(D.n5, D.glass, 0.3)); }
      // ---- axes (grease pencil) ----
      const p1 = P(t, T1, 0.8, "io"), p2 = P(t, T2, 0.8, "io"), p3 = P(t, T3, 0.9, "io");
      const dim1 = 1 - 0.55 * P(t, T2, 0.6, "io"), dim2 = 1 - 0.55 * P(t, T3, 0.6, "io");
      const c3 = P(t, T3, 1.2, "io");   // when the 3rd axis arrives the plane tilts back a little
      const ax = [[0.04, 0.5, 0.96, 0.5], [0.5, 0.04, 0.5, 0.96], [0.08, 0.08, 0.92, 0.92]];
      const axCol = [mix(GP, GPd, 1 - dim1), mix(GP, GPd, 1 - dim2), GP];
      [p1, p2, p3].forEach((pp, i) => {
        if (pp <= 0) return; const [u0, v0, u1, v1] = ax[i], [x0, y0] = tmap(u0, v0), [x1, y1] = tmap(u1, v1);
        pencil(g, x0, y0, x1, y1, axCol[i], pp);
        if (pp >= 1) { arrowHead(g, x0, y0, x0 - x1, y0 - y1, axCol[i]); arrowHead(g, x1, y1, x1 - x0, y1 - y0, axCol[i]); }
        // ticks, drawn once the third axis is settled
        const tk = P(t, T3 + 2.4 + i * 0.25, 0.6);
        if (tk > 0) for (let q = 1; q < 8; q++) { if (q / 8 > tk) break; const u = lerp(u0, u1, q / 8), v = lerp(v0, v1, q / 8), [tx, ty] = tmap(u, v), L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L * 2, ny = (x1 - x0) / L * 2;
          PX.line(g, tx - nx, ty - ny, tx + nx, ty + ny, axCol[i]); }
      });
      // ---- slides ----
      const dealEnd = clamp(T1 - 0.3, 0, 1.6 * k);
      const pos = SLIDES.map(([m, s, kk, e, lane], i) => {
        const [pu, pv] = PILE[i];
        const q1 = [0.14 + 0.72 * s, 0.5 + lane * 0.16], q2 = [0.1 + 0.8 * s, 0.1 + 0.8 * kk];
        const q2c = [0.18 + 0.64 * s, 0.18 + 0.64 * kk], q3 = [q2c[0] + (e - 0.5) * 0.32, q2c[1] + (e - 0.5) * 0.26];
        const a = P(t, T1 + 0.3 + i * 0.07, 1.0, "io"), b = P(t, T2 + 0.3 + i * 0.07, 1.0, "io"), cc = P(t, T3 + 0.4 + i * 0.07, 1.1, "io");
        let u = lerp(pu, q1[0], a), v = lerp(pv, q1[1], a); u = lerp(u, q2[0], b); v = lerp(v, q2[1], b);
        const cm1 = clamp(cc * 2, 0, 1), sh1 = clamp(cc * 2 - 1, 0, 1);   // first settle into the smaller plane, then slide along the new direction
        u = lerp(u, q2c[0], PX.smooth(cm1)); v = lerp(v, q2c[1], PX.smooth(cm1)); u = lerp(u, q3[0], PX.smooth(sh1)); v = lerp(v, q3[1], PX.smooth(sh1));
        const moving = (a > 0 && a < 1) || (b > 0 && b < 1) || (cc > 0 && cc < 1);
        const deal = dealEnd > 0 ? P(t, dealEnd * (i / SLIDES.length), 0.35, "out") : 1;
        return { m, i, e, u, v, moving, deal, foot: q2c, sh1 };
      });
      // nearer (explosions) slides drawn last once the third axis is in
      // pencil guides showing how far each slide moved along the new direction
      for (const sl of pos) { if (sl.sh1 <= 0 || Math.abs(sl.e - 0.5) < 0.08) continue; const [fx, fy] = tmap(sl.foot[0], sl.foot[1]), [x, y] = tmap(sl.u, sl.v); dline(g, fx, fy, x, y, GPd, 3); R(g, Math.round(fx) - 1, Math.round(fy) - 1, 3, 3, GPd); }
      pos.sort((A1, B1) => (c3 > 0 ? (B1.e - A1.e) : (A1.i - B1.i)));
      for (const sl of pos) { if (sl.deal <= 0) continue; const [x, y] = tmap(sl.u, sl.v), lift = sl.moving ? 1 : 0, shd = 1 + lift * 2 + Math.round(c3 * (1 - sl.e) * 2);
        A(g, sl.deal, () => slide(g, x - lift, y - lift - Math.round((1 - sl.deal) * 8), sl.m, shd)); }
      // ---- labels (grease pencil handwriting), earlier axes fade back ----
      const lab = (s, uv, a, al, dy, dx) => { if (a <= 0) return; const [x, y] = tmap(uv[0], uv[1]); A(g, a, () => PX.otext(g, s, x + (dx || 0), y + (dy || 0), { font: "v", size: 16, col: GP, align: al, outline: mix(D.glass, D.cream, 0.15) })); };
      const ty = (s, T) => PX.typed(s, t, T, 18);
      lab(ty("SERIOUS", T1 + 0.5), [0.03, 0.5], dim1, "left", 3); lab(ty("SILLY", T1 + 0.7), [0.97, 0.5], dim1, "right", 3);
      lab(ty("KIDS", T2 + 0.5), [0.5, 0.0], dim2, "left", -1, 7); lab(ty("ADULTS", T2 + 0.7), [0.5, 1.0], dim2, "left", -15, 7);
      lab(ty("EXPLOSIONS", T3 + 0.6), [0.1, 0.08], 1, "left", -18); lab(ty("CONVERSATIONS", T3 + 0.9), [0.93, 0.92], 1, "right", -1);
      g.restore();
      // ---- foreground: table front rail, grease pencil, loupe gliding in late ----
      R(g, 40, TY1 + 9, 560, 8, D.n4); R(g, 40, TY1 + 9, 560, 1, mix(D.n6, D.glass, 0.3)); R(g, 40, TY1 + 17, 560, 50, D.n1);
      A(g, 0.5, () => R(g, 120, TY1 + 12, 46, 3, SH(0.6))); R(g, 118, TY1 + 10, 40, 3, D.rust[2]); R(g, 118, TY1 + 10, 40, 1, D.rust[1]); R(g, 158, TY1 + 10, 4, 3, D.ink); R(g, 114, TY1 + 10, 4, 3, D.paperD);
      const lp = P(t, TNB + 2.2, 1.8, "io"), lx = Math.round(lerp(660, 364, lp)), ly = Math.round(lerp(380, 162, lp));
      if (lp > 0) { A(g, 0.35, () => { for (let q = 15; q <= 19; q++) ring(g, lx + 4, ly + 5, q, D.n0); });
        A(g, 0.22, () => PX.circle(g, lx, ly, 14, D.cream));
        for (let q = 15; q <= 18; q++) ring(g, lx, ly, q, q === 15 ? D.n5 : q === 18 ? D.n1 : D.n3);
        for (let q = 0; q < 9; q++) { const an = 3.6 + q * 0.13; R(g, lx + Math.round(Math.cos(an) * 11), ly + Math.round(Math.sin(an) * 11), 1, 1, lt(D.glass, 0.6)); } }
      PX.particles(g, 21, 30, t, [80, 60, 480, 240], { vy: -1.5, vx: 1, col: mix(D.cream, D.glass, 0.5), a: 0.35, tw: 0.8 });
      PX.vignette(g, 0.5);
    };
  };
})();
