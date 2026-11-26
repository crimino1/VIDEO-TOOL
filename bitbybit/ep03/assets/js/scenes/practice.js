/* EP2 Builder C: practice scenes. sheet_music, recursion, sql50, target, todo_clones, blueprint_build, diy_bench,
   dict_xray, clean_code. All native-resolution pixel art on the 640x360 canvas, pure functions of t. */
(function () {
  const { K, C } = PX;
  const R = PX.rect, T = PX.text, OT = PX.otext;
  const core = () => PX.core || {};
  const frac = (x) => x - Math.floor(x);
  const def = (v, dv) => (v === undefined ? dv : v);

  // ---------- local helpers ----------
  // crisp scanline polygon fill (no antialiasing)
  const poly = (g, pts, col) => {
    let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
    g.fillStyle = col;
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) * (bx - ax)) / (by - ay));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) { const xa = Math.round(xs[k]), xb = Math.round(xs[k + 1]); if (xb > xa) g.fillRect(xa, y, xb - xa, 1); }
    }
  };
  const ell = (g, cx, cy, rx, ry, col) => {
    g.fillStyle = col; const ryy = ry + 0.5;
    for (let y = -Math.round(ry); y <= Math.round(ry); y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ryy * ryy)))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
  };
  // thick line made of w x w squares
  const thk = (g, x1, y1, x2, y2, w, col) => {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)))); g.fillStyle = col;
    for (let i = 0; i <= n; i++) { const x = x1 + ((x2 - x1) * i) / n, y = y1 + ((y2 - y1) * i) / n; g.fillRect(Math.round(x - w / 2), Math.round(y - w / 2), w, w); }
  };
  // arc outline from angle a0 to a1 (radians)
  const arc = (g, cx, cy, r, a0, a1, col, w) => {
    g.fillStyle = col; w = w || 1; const n = Math.max(6, Math.ceil(Math.abs(a1 - a0) * r * 1.5));
    for (let i = 0; i <= n; i++) { const a = a0 + ((a1 - a0) * i) / n; g.fillRect(Math.round(cx + Math.cos(a) * r - (w - 1) / 2), Math.round(cy + Math.sin(a) * r - (w - 1) / 2), w, w); }
  };
  // box with 1px highlight (top/left) and shadow (bottom/right)
  const bx3 = (g, x, y, w, h, base, hl, dk) => { R(g, x, y, w, h, base); if (hl) { R(g, x, y, w, 1, hl); R(g, x, y, 1, h, hl); } if (dk) { R(g, x, y + h - 1, w, 1, dk); R(g, x + w - 1, y + 1, 1, h - 1, dk); } };
  // gear: n teeth, angle a
  const gear = (g, cx, cy, r, n, a, col, hl, dk, hole) => {
    for (let i = 0; i < n; i++) { const an = a + (i * 2 * Math.PI) / n; R(g, cx + Math.cos(an) * r - 2, cy + Math.sin(an) * r - 2, 4, 4, dk); R(g, cx + Math.cos(an) * r - 2, cy + Math.sin(an) * r - 2, 3, 3, col); }
    PX.circle(g, cx, cy, r - 1, dk); PX.circle(g, cx - 1, cy - 1, r - 2, col);
    arc(g, cx, cy, r - 3, Math.PI * 1.05, Math.PI * 1.55, hl);
    PX.circle(g, cx, cy, Math.max(2, Math.round(r * 0.38)), dk); PX.circle(g, cx, cy, Math.max(1, Math.round(r * 0.18)), hole || "#0b0d14");
    for (let k = 0; k < 3; k++) { const an = a + (k * 2 * Math.PI) / 3; R(g, cx + Math.cos(an) * r * 0.62 - 1, cy + Math.sin(an) * r * 0.62 - 1, 2, 2, dk); }
  };
  const mix = (a, b, k) => { const A = a.match(/\w\w/g).map((v) => parseInt(v, 16)), B = b.match(/\w\w/g).map((v) => parseInt(v, 16)); k = PX.clamp(k, 0, 1);
    return `rgb(${Math.round(A[0] + (B[0] - A[0]) * k)},${Math.round(A[1] + (B[1] - A[1]) * k)},${Math.round(A[2] + (B[2] - A[2]) * k)})`; };
  const rgba = (hex, a) => { const A = hex.match(/\w\w/g).map((v) => parseInt(v, 16)); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };
  // steam / smoke puffs rising from (x,y)
  const smoke = (g, x, y, t, n, col, rise, a) => {
    for (let i = 0; i < n; i++) { const k = frac(t * 0.6 + i / n); g.globalAlpha = (a || 0.5) * (1 - k) * Math.min(1, k * 6);
      PX.circle(g, x + Math.sin(k * 5 + i * 2) * 4 + k * 6, y - k * (rise || 30), 1 + Math.round(k * 5), col); }
    g.globalAlpha = 1;
  };
  // little sparkle cross
  const spark = (g, x, y, s, col) => { R(g, x - s, y, 2 * s + 1, 1, col); R(g, x, y - s, 1, 2 * s + 1, col); if (s > 2) { R(g, x - 1, y - 1, 3, 3, col); } };
  // night window with skyline (and frame), used by several rooms
  const nightWindow = (g, x, y, w, h, t, seed, frame) => {
    const fc = frame || "#2a2f45";
    R(g, x - 4, y - 4, w + 8, h + 8, fc); R(g, x - 4, y - 4, w + 8, 1, mix("2a2f45", "8890b0", 0.4));
    if (core().skyline) core().skyline(g, x, y, w, h, t, seed); else PX.vgrad(g, x, y, w, h, "1a1f4a", "3b2a5c", 6);
    R(g, x + Math.floor(w / 2) - 2, y, 4, h, fc); R(g, x, y + Math.floor(h / 2) - 2, w, 4, fc);
    R(g, x - 8, y + h + 4, w + 16, 5, mix("363c55", "000000", 0)); R(g, x - 8, y + h + 4, w + 16, 1, "#4a5274");
  };
  // front-facing person, (x, y) = feet centre, ~66 px tall.
  // o: shirt [hl,base,dk], pants, hair, skin, expr ("smile"|"flat"|"worry"|"o"|"smug"|"grin"), look [dx,dy], arms: {l:[x,y], r:[x,y]} hand targets, sweat, blink
  const guy = (g, x, y, t, o) => {
    o = o || {};
    const sk = o.skin || ["#f2c9a0", "#d9a070", "#a86b44"], sh = o.shirt || ["#ff8f8f", "#e0525c", "#a33442"], pa = o.pants || ["#4a5f8f", "#34466e", "#232f4d"];
    const hair = o.hair || ["#4a3020", "#2b1a10"], bob = Math.round(o.bob || 0);
    const hy = y - 66 + bob, ty = y - 44 + bob;
    // legs + shoes
    bx3(g, x - 9, y - 21, 8, 19, pa[1], pa[0], pa[2]); bx3(g, x + 1, y - 21, 8, 19, pa[1], pa[0], pa[2]);
    R(g, x - 10, y - 3, 9, 3, "#17171f"); R(g, x + 1, y - 3, 10, 3, "#17171f"); R(g, x - 10, y - 3, 9, 1, "#3a3a46"); R(g, x + 1, y - 3, 10, 1, "#3a3a46");
    // arms (behind torso edge)
    const shL = [x - 11, ty + 3], shR = [x + 11, ty + 3];
    const hL = (o.arms && o.arms.l) || [x - 14, ty + 24], hR = (o.arms && o.arms.r) || [x + 14, ty + 24];
    thk(g, shL[0], shL[1], hL[0], hL[1], 6, sh[2]); thk(g, shL[0], shL[1] - 1, hL[0], hL[1] - 1, 4, sh[1]);
    thk(g, shR[0], shR[1], hR[0], hR[1], 6, sh[2]); thk(g, shR[0], shR[1] - 1, hR[0], hR[1] - 1, 4, sh[1]);
    R(g, hL[0] - 2, hL[1] - 2, 5, 5, sk[1]); R(g, hL[0] - 2, hL[1] - 2, 5, 1, sk[0]);
    R(g, hR[0] - 2, hR[1] - 2, 5, 5, sk[1]); R(g, hR[0] - 2, hR[1] - 2, 5, 1, sk[0]);
    // torso
    R(g, x - 11, ty, 22, 25, sh[1]); R(g, x - 11, ty, 3, 25, sh[0]); R(g, x + 8, ty, 3, 25, sh[2]); R(g, x - 11, ty + 23, 22, 2, sh[2]);
    R(g, x - 4, ty, 8, 3, sk[2]); R(g, x - 3, ty, 6, 2, sk[1]);           // neck/collar
    // head
    R(g, x - 9, hy + 2, 18, 18, sk[1]); R(g, x - 8, hy + 1, 16, 1, sk[1]); R(g, x - 8, hy + 20, 16, 1, sk[2]);
    R(g, x - 9, hy + 2, 2, 17, sk[0]); R(g, x + 7, hy + 2, 2, 17, sk[2]);
    R(g, x - 11, hy + 9, 2, 5, sk[2]); R(g, x + 9, hy + 9, 2, 5, sk[2]); // ears
    // hair
    R(g, x - 10, hy - 2, 20, 7, hair[0]); R(g, x - 10, hy + 4, 3, 6, hair[0]); R(g, x + 7, hy + 4, 3, 5, hair[1]); R(g, x - 7, hy - 3, 13, 1, hair[0]);
    R(g, x - 6, hy - 1, 6, 1, mix(hair[0].slice(1), "ffffff", 0.25)); R(g, x + 2, hy + 4, 5, 2, hair[1]);
    // face
    const lk = o.look || [0, 0], ex = x + lk[0], ey = hy + 10 + lk[1];
    const blink = o.blink !== false && PX.blink(t + (o.seed || 0), 3.1, 0.05);
    if (blink) { R(g, ex - 5, ey + 1, 3, 1, "#2a1a14"); R(g, ex + 2, ey + 1, 3, 1, "#2a1a14"); }
    else { R(g, ex - 5, ey, 2, 3, "#1c120e"); R(g, ex + 3, ey, 2, 3, "#1c120e"); R(g, ex - 5, ey, 1, 1, "#ffffff"); R(g, ex + 3, ey, 1, 1, "#ffffff"); }
    const mx = x + Math.round(lk[0] / 2), my = hy + 15;
    const e = o.expr || "smile", mc = "#7a2e2a";
    if (e === "smile") { R(g, mx - 3, my, 6, 1, mc); R(g, mx - 4, my - 1, 1, 1, mc); R(g, mx + 3, my - 1, 1, 1, mc); }
    else if (e === "grin") { R(g, mx - 4, my - 1, 8, 3, mc); R(g, mx - 3, my - 1, 6, 1, "#f4efe0"); }
    else if (e === "flat") R(g, mx - 3, my, 6, 1, mc);
    else if (e === "worry") { R(g, mx - 3, my, 6, 1, mc); R(g, mx - 4, my + 1, 1, 1, mc); R(g, mx + 3, my + 1, 1, 1, mc); R(g, ex - 6, ey - 3, 3, 1, hair[1]); R(g, ex + 3, ey - 3, 3, 1, hair[1]); }
    else if (e === "o") { R(g, mx - 1, my - 1, 3, 3, mc); }
    else if (e === "smug") { R(g, mx - 2, my, 5, 1, mc); R(g, mx + 3, my - 1, 1, 1, mc); R(g, ex - 6, ey - 2, 3, 1, hair[1]); }
    R(g, ex - 7, ey + 4, 2, 1, "rgba(255,120,120,.35)"); R(g, ex + 5, ey + 4, 2, 1, "rgba(255,120,120,.35)");
    if (o.sweat) { const k = frac(t * 0.9); R(g, x + 10, hy + 3 + k * 8, 2, 3, "#8fd8ff"); R(g, x + 10, hy + 3 + k * 8, 1, 1, "#e8f8ff"); }
  };

  // ======================= sheet_music =======================
  // o.loop (4.0): magnifier frames the 2 red bars, they repeat x1 -> x40. o.clean (9.0): they turn green.
  K.sheet_music = (o) => {
    const notes = [];
    for (let b = 0; b < 12; b++) {
      const r = PX.rnd(b * 31 + 7), L = [];
      if (b === 5 || b === 6) { for (let i = 0; i < 8; i++) L.push({ u: i / 7.6, st: Math.floor(r() * 9), k: "s", grp: Math.floor(i / 4) }); }
      else {
        const pat = Math.floor(r() * 3);
        if (pat === 0) for (let i = 0; i < 4; i++) L.push({ u: i / 3.6, st: 1 + Math.floor(r() * 7), k: "q" });
        else if (pat === 1) { L.push({ u: 0, st: 2 + Math.floor(r() * 5), k: "h" }); L.push({ u: 0.55, st: 1 + Math.floor(r() * 7), k: "q" }); L.push({ u: 0.85, st: 1 + Math.floor(r() * 7), k: "q" }); }
        else { L.push({ u: 0, st: 2 + Math.floor(r() * 6), k: "q" }); L.push({ u: 0.28, st: 2 + Math.floor(r() * 6), k: "q" });
          for (let i = 0; i < 4; i++) L.push({ u: 0.56 + i * 0.12, st: 1 + Math.floor(r() * 7), k: "e", grp: Math.floor(i / 2) }); }
      }
      notes.push(L);
    }
    const ink = "#2a2018";
    // draw the notes of bar b with top staff line at by, bar from bx..bx+bw, scale s
    const drawNotes = (g, bx, by, bw, b, s, col) => {
      const L = notes[b], groups = {};
      for (const n of L) {
        const x = Math.round(bx + 6 * s + n.u * (bw - 14 * s)), y = Math.round(by + 20 * s - n.st * 2.5 * s);
        const rx = Math.round(2 * s + 0.4), ry = Math.max(1, Math.round(1.4 * s));
        ell(g, x, y, rx, ry, col);
        if (n.k === "h") ell(g, x, y, Math.max(1, rx - 1), Math.max(0, ry - 1), "#c4b28a");
        const sx = x + rx, stemL = Math.round(12 * s);
        if (n.grp === undefined) {
          R(g, sx, y - stemL, Math.max(1, Math.round(s * 0.7)), stemL, col);
        } else { const key = n.grp; (groups[key] = groups[key] || []).push([sx, y]); }
        if (n.st <= -1 || n.st >= 10) R(g, x - rx - 2, y, 2 * rx + 5, 1, col);
      }
      for (const k in groups) {
        const G = groups[k], top = Math.min(...G.map((p) => p[1])) - Math.round(12 * s), bw2 = Math.max(1, Math.round(s * 0.7));
        for (const [sx, y] of G) R(g, sx, top, bw2, y - top, col);
        const x0 = G[0][0], x1 = G[G.length - 1][0] + bw2, bh = Math.max(2, Math.round(2 * s));
        R(g, x0, top, x1 - x0, bh, col);
        if (L[0].k === "s") R(g, x0, top + bh + Math.round(s), x1 - x0, bh, col);
      }
    };
    const staff = (g, x, y, w, s, col) => { for (let i = 0; i < 5; i++) R(g, x, Math.round(y + i * 5 * s), w, 1, col); };
    const clef = ["..##..", ".#..#.", ".#..#.", "..#.#.", "..##..", ".##...", "#.#...", "#.###.", "#.#.#.", ".###..", "..#...", "..#...", "###..."];
    const SX = 160, SY = 50, SW = 320, SH = 188, BX0 = 194, BW = 67, STY = [88, 140, 192];

    return (g, t, d, c) => {
      const LOOP = def(o.loop, (4.0 * d) / 10.9), CLEAN = def(o.clean, (9.0 * d) / 10.9);
      const T0 = 0.3, BD = Math.max(0.12, (LOOP - 0.6) / 12.4);
      const barF = (t - T0) / BD;
      const u = PX.clamp((t - LOOP - 0.6) / Math.max(0.5, CLEAN - LOOP - 0.6), 0, 1);
      const count = t < LOOP + 0.6 ? 1 : 1 + 39 * Math.pow(u, 1.8);
      const clean = t >= CLEAN;
      // ---- room: wall with wallpaper + wainscot ----
      PX.vgrad(g, 0, 0, 640, 304, "1c1d3c", "100f24", 10);
      for (let x = 4; x < 640; x += 16) { R(g, x, 0, 1, 236, "rgba(0,0,0,.18)"); for (let y = 10 + ((x / 16) % 2) * 12; y < 230; y += 24) R(g, x + 8, y, 1, 1, "rgba(160,140,220,.18)"); }
      R(g, 0, 236, 640, 68, "#24161a"); R(g, 0, 236, 640, 3, "#4a2c2c"); R(g, 0, 239, 640, 1, "#140a0c");
      for (let x = 10; x < 640; x += 70) { PX.box(g, x, 246, 58, 48, "#1a0f12"); R(g, x + 1, 246, 56, 1, "#3a2226"); }
      // window + curtains (far)
      PX.par(g, c, 0.45, () => {
        nightWindow(g, 26, 44, 94, 120, t, 8, "#2b2a44");
        for (const cx of [6, 116]) { R(g, cx, 30, 26, 150, "#4a2346"); for (let k = 0; k < 4; k++) R(g, cx + 3 + k * 6, 30, 2, 150, "#38183a"); R(g, cx, 30, 26, 2, "#6a3466"); }
        R(g, 0, 26, 150, 5, "#2a1a20"); R(g, 0, 26, 150, 1, "#5a4048");
      });
      // piano + portrait + metronome (mid)
      PX.par(g, c, 0.65, () => {
        R(g, 524, 54, 74, 60, "#7a5a22"); R(g, 524, 54, 74, 2, "#c89a40"); R(g, 528, 58, 66, 52, "#2a2236"); R(g, 596, 54, 2, 60, "#4a3412");
        PX.circle(g, 561, 76, 9, "#4a3c56"); R(g, 547, 88, 28, 22, "#4a3c56"); PX.circle(g, 559, 74, 7, "#5a4a66");
        bx3(g, 500, 150, 150, 100, "#3a2220", "#6a4030", "#1e1010"); R(g, 500, 150, 150, 6, "#4a2c26"); R(g, 500, 150, 150, 1, "#8a5a40");
        R(g, 508, 168, 134, 30, "#2a1816"); R(g, 512, 172, 126, 22, "#24120f");
        R(g, 500, 222, 150, 14, "#c9bea0"); for (let k = 0; k < 19; k++) R(g, 500 + k * 8, 222, 1, 14, "#8a8070");
        for (let k = 0; k < 19; k++) if (k % 7 !== 2 && k % 7 !== 6) R(g, 505 + k * 8, 222, 5, 8, "#1a1414");
        R(g, 500, 236, 150, 4, "#2a1816"); R(g, 506, 240, 8, 60, "#2a1816"); R(g, 636, 240, 8, 60, "#1e1010");
        // metronome on the piano
        poly(g, [[552, 150], [576, 150], [568, 118], [560, 118]], "#6a3a22"); poly(g, [[552, 150], [556, 150], [561, 118], [560, 118]], "#9a5a32");
        R(g, 558, 128, 12, 14, "#2a1810");
        const rate = t < LOOP ? 1.1 : t < CLEAN ? 1.1 + 2.4 * u : 1.6, ang = 0.42 * Math.sin(t * Math.PI * rate);
        thk(g, 564, 146, 564 + Math.sin(ang) * 26, 146 - Math.cos(ang) * 26, 1, "#d8d0b8"); R(g, 562 + Math.sin(ang) * 18, 144 - Math.cos(ang) * 18, 4, 3, "#f7c948");
      });
      // floor
      R(g, 0, 304, 640, 56, "#21161a"); for (let y = 308; y < 360; y += 9) R(g, 0, y, 640, 1, "#170e11");
      for (let y = 304, k = 0; y < 360; y += 9, k++) for (let x = (k * 37) % 90; x < 640; x += 90) R(g, x, y, 1, 9, "#170e11");
      PX.glow(g, 320, 320, 150, "rgba(255,190,120,0.18)", 1);
      // lamp light on the wall behind the stand
      PX.glow(g, 330, 130, 250, "rgba(255,190,110,0.22)", 1);
      // ---- music stand ----
      R(g, 318, 242, 5, 68, "#2b2f38"); R(g, 318, 242, 1, 68, "#5a606c"); R(g, 315, 296, 11, 8, "#22252d");
      R(g, SX - 8, SY - 4, SW + 16, SH + 6, "#1d2028"); R(g, SX - 8, SY - 4, SW + 16, 1, "#4a505c");
      // rug under the stand
      ell(g, 320, 336, 190, 20, "#3a1622"); ell(g, 320, 336, 182, 17, "#5a2232"); ell(g, 320, 336, 150, 12, "#4a1a2a");
      for (let k = 0; k < 12; k++) R(g, 160 + k * 28, 335, 6, 2, "#8a4a3a");
      thk(g, 320, 306, 262, 348, 3, "#1c1e26"); thk(g, 320, 306, 378, 348, 3, "#1c1e26"); thk(g, 320, 306, 322, 354, 3, "#2a2d36");
      // violin leaning on the stand
      {
        const vx = 128, vy = 300;
        thk(g, vx + 18, vy - 10, vx + 30, vy - 88, 4, "#1a120c"); thk(g, vx + 17, vy - 10, vx + 29, vy - 88, 1, "#3a2a1c");
        R(g, vx + 27, vy - 98, 6, 10, "#6b3418"); R(g, vx + 28, vy - 97, 2, 4, "#c8703a"); R(g, vx + 25, vy - 93, 2, 2, "#2a1208"); R(g, vx + 33, vy - 91, 2, 2, "#2a1208");
        ell(g, vx + 15, vy - 18, 12, 13, "#5a2a12"); ell(g, vx + 17, vy + 10, 16, 16, "#5a2a12");
        ell(g, vx + 15, vy - 19, 10, 11, "#9a4a24"); ell(g, vx + 17, vy + 9, 14, 14, "#9a4a24");
        R(g, vx + 5, vy - 6, 22, 6, "#9a4a24");
        ell(g, vx + 11, vy - 22, 4, 6, "#c8703a"); ell(g, vx + 12, vy + 4, 5, 8, "#c8703a");
        thk(g, vx + 18, vy - 10, vx + 21, vy - 30, 4, "#1a120c");
        for (const fx of [vx + 9, vx + 26]) { R(g, fx, vy - 2, 1, 9, "#2a1208"); R(g, fx - 1, vy - 3, 1, 1, "#2a1208"); R(g, fx + 1, vy + 7, 1, 1, "#2a1208"); }
        R(g, vx + 13, vy + 4, 9, 1, "#d8b080"); thk(g, vx + 17, vy + 6, vx + 18, vy + 20, 3, "#1a120c");
        thk(g, vx + 17, vy + 18, vx + 30, vy - 88, 1, "rgba(230,220,190,.45)"); thk(g, vx + 19, vy + 18, vx + 31, vy - 88, 1, "rgba(230,220,190,.35)");
      }
      // ---- the sheet ----
      R(g, SX + 3, SY + 3, SW, SH, "rgba(0,0,0,.45)");
      PX.vgrad(g, SX, SY, SW, SH, "cdbb94", "a8956e", 6);
      R(g, SX + SW - 3, SY, 3, SH, "#94805a"); R(g, SX, SY + SH - 2, SW, 2, "#8a7652"); R(g, SX, SY, SW, 1, "#dccca6");
      T(g, "ETUDE No. 3", 320, SY + 8, { font: "v", size: 16, col: "#3a2c20", align: "center" });
      if (t < LOOP) T(g, "practice slowly", SX + SW - 12, SY + 22, { font: "v", size: 10, col: "#6a5a44", align: "right" });
      for (let s = 0; s < 3; s++) {
        const y = STY[s];
        staff(g, SX + 12, y, SW - 24, 1, "#6a5a48");
        PX.sprite(g, clef, SX + 14, y - 4, { "#": ink });
        for (let k = 0; k <= 4; k++) R(g, BX0 + k * BW, y, 1, 21, "#4a3c30");
        for (let k = 0; k < 4; k++) {
          const b = s * 4 + k, hard = b === 5 || b === 6, bx = BX0 + k * BW;
          const passed = barF > b + 1 || t >= LOOP;
          if (passed || clean) {
            let col;
            if (hard && !clean) col = `rgba(255,80,80,${0.22 + (PX.blink(t, 0.4) ? 0.18 : 0)})`;
            else col = "rgba(61,245,107,0.24)";
            R(g, bx + 1, y - 6, BW - 1, 32, col);
            if (!hard || clean) { R(g, bx + BW - 8, y - 12, 2, 2, "#1f9a4a"); R(g, bx + BW - 6, y - 10, 2, 2, "#1f9a4a"); R(g, bx + BW - 4, y - 14, 2, 4, "#1f9a4a"); }
            else { thk(g, bx + BW - 9, y - 14, bx + BW - 4, y - 9, 1, "#d23a3a"); thk(g, bx + BW - 9, y - 9, bx + BW - 4, y - 14, 1, "#d23a3a"); }
          }
          drawNotes(g, bx, y, BW, b, 1, ink);
        }
      }
      // playhead on the first pass
      if (barF >= 0 && barF < 12 && t < LOOP) {
        const b = Math.floor(barF), s = Math.floor(b / 4), x = BX0 + (barF - s * 4) * BW, y = STY[s], hard = b === 5 || b === 6;
        const col = hard ? "#ff4d4d" : "#f7a83c";
        R(g, x, y - 8, 2, 37, col); PX.glow(g, x + 1, y + 10, 26, hard ? "rgba(255,60,60,.6)" : "rgba(255,170,60,.5)", 1);
        if (hard) { const wob = Math.round(Math.sin(t * 40)); R(g, x - 3 + wob, y - 12, 8, 2, col); }
      }
      // ---- the lamp clamped on the stand ----
      thk(g, SX + SW + 2, SY - 2, SX + SW + 14, SY - 30, 2, "#3a3f4b"); thk(g, SX + SW + 14, SY - 30, SX + SW - 18, SY - 40, 2, "#3a3f4b");
      poly(g, [[SX + SW - 40, SY - 44], [SX + SW - 14, SY - 50], [SX + SW - 8, SY - 32], [SX + SW - 46, SY - 24]], "#2b3040");
      poly(g, [[SX + SW - 40, SY - 44], [SX + SW - 14, SY - 50], [SX + SW - 13, SY - 47], [SX + SW - 40, SY - 41]], "#5a6278");
      R(g, SX + SW - 44, SY - 27, 34, 3, "#ffd28a"); PX.glow(g, SX + SW - 26, SY - 22, 40, "rgba(255,220,150,.8)", 1);
      R(g, SX + SW - 6, SY - 8, 10, 8, "#22252d"); R(g, SX + SW - 6, SY - 8, 10, 1, "#4a505c");
      // ---- the loop: rectangular reading magnifier over the two red bars ----
      if (t >= LOOP) {
        const k = PX.p(t, LOOP, 0.6, "back"), ox = (1 - k) * 260, oy = (1 - k) * 170;
        const LX = 220 + ox, LY = 106 + oy, LW2 = 216, LH2 = 78, s = 1.45, bw = Math.round(BW * s);
        // dim the rest of the sheet so the eye goes to the lens
        const dim = 0.42 * PX.p(t, LOOP, 0.5, "out");
        g.globalAlpha = dim; R(g, 0, 0, 640, LY, "#05040c"); R(g, 0, LY + LH2, 640, 360 - LY - LH2, "#05040c"); R(g, 0, LY, LX, LH2, "#05040c"); R(g, LX + LW2, LY, 640 - LX - LW2, LH2, "#05040c"); g.globalAlpha = 1;
        // handle
        thk(g, LX + LW2 - 6, LY + LH2 + 2, LX + LW2 + 46, LY + LH2 + 64, 7, "#3a2216"); thk(g, LX + LW2 - 7, LY + LH2 + 1, LX + LW2 + 45, LY + LH2 + 63, 3, "#7a4a2c");
        // glass content (bars at 1.45x drawn natively)
        R(g, LX, LY, LW2, LH2, "#b3a07a");
        const hue = clean ? "3df56b" : u < 0.6 ? null : null;
        const tint = clean ? "rgba(61,245,107,0.38)" : (() => { const cc = u < 0.7 ? mix("ff3c3c", "ff8a3c", u / 0.7) : u < 0.92 ? mix("ff8a3c", "f7c948", (u - 0.7) / 0.22) : mix("f7c948", "3df56b", (u - 0.92) / 0.08); return cc.replace("rgb", "rgba").replace(")", ",0.42)"); })();
        const sx0 = LX + 12, sy0 = LY + 30;
        R(g, sx0, sy0 - 12, bw * 2, 46, tint);
        staff(g, LX + 4, sy0, LW2 - 8, s, "#6a5a48");
        for (let kk = 0; kk <= 2; kk++) R(g, sx0 + kk * bw, sy0, 2, Math.round(20 * s) + 1, "#4a3c30");
        drawNotes(g, sx0, sy0, bw, 5, s, ink); drawNotes(g, sx0 + bw, sy0, bw, 6, s, ink);
        // looping playhead
        const ph = t < LOOP + 0.6 ? 0 : clean ? frac((t - CLEAN) * 0.35) : frac(count);
        const pcol = clean ? "#3df56b" : mix("ff5050", "3df56b", u);
        R(g, sx0 + ph * bw * 2, LY + 4, 2, LH2 - 8, pcol);
        PX.glow(g, sx0 + ph * bw * 2, LY + LH2 / 2, 18, clean ? "rgba(61,245,107,.35)" : "rgba(255,140,80,.3)", 1);
        // loop arrows in the margins
        T(g, "||:", sx0 - 10, sy0 - 4, { font: "v", size: 16, col: "#4a3c30" }); T(g, ":||", sx0 + bw * 2 - 2, sy0 - 4, { font: "v", size: 16, col: "#4a3c30" });
        // glare + frame
        g.globalAlpha = 0.10; poly(g, [[LX + 20, LY], [LX + 46, LY], [LX + 16, LY + LH2], [LX - 10 + 10, LY + LH2]], "#ffffff"); g.globalAlpha = 1;
        R(g, LX - 4, LY - 4, LW2 + 8, 4, "#3a3f4b"); R(g, LX - 4, LY + LH2, LW2 + 8, 4, "#22252d"); R(g, LX - 4, LY, 4, LH2, "#30343f"); R(g, LX + LW2, LY, 4, LH2, "#22252d");
        R(g, LX - 4, LY - 4, LW2 + 8, 1, "#7a8294");
        // counter
        if (t >= LOOP + 0.3) {
          const n = Math.floor(count), pop = t < CLEAN ? Math.round(3 * (1 - PX.clamp(frac(count) * 5, 0, 1))) : 0;
          const ccol = clean ? "#3df56b" : n < 20 ? "#ff7a5c" : "#f7c948";
          OT(g, "x" + Math.min(40, n), LX + LW2 + 6, LY - 26 - pop, { size: 16, col: ccol });
        }
        if (clean) {
          const ck = PX.p(t, CLEAN, 0.4, "back");
          for (let i = 0; i < 10; i++) { const an = (i / 10) * 6.283, rr = 20 + 50 * PX.p(t, CLEAN, 0.8, "out"); if (t - CLEAN < 0.9) spark(g, LX + LW2 / 2 + Math.cos(an) * rr * 2, LY + LH2 / 2 + Math.sin(an) * rr, 2, "#bfffd0"); }
          OT(g, "CLEAN", LX + LW2 / 2, LY + LH2 + 10 - Math.round((1 - ck) * 8), { size: 16, col: "#3df56b", align: "center" });
        }
      }
      // floating notes after the clean pass
      if (clean) for (let i = 0; i < 5; i++) { const k = frac((t - CLEAN) * 0.5 + i / 5); g.globalAlpha = 1 - k; PX.sprite(g, ["..##", "..#.", "..#.", "###.", "##.."], 180 + i * 60 + Math.sin(k * 6 + i) * 6, 60 - k * 40 + (i % 2) * 20, { "#": i % 2 ? "#f7c948" : "#3df56b" }); g.globalAlpha = 1; }
      PX.particles(g, 21, 30, t, [200, 20, 300, 220], { vy: -3, vx: 1.5, col: "#ffe2b0", a: 0.6 });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= recursion =======================
  // dark office, monitor with a mirror-tunnel of recurse(n-1) frames; desk calendar MON..SUN stamped RECURSION.
  // o.stamp0 (0.8) first stamp, o.gap (0.5) between stamps, o.note (5.2) sticky note "TODO: SEE TODO"
  K.recursion = (o) => {
    const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
    const HUE = ["5fe3e8", "8a8cff", "c06cf0", "f25ca8", "f7a85c", "7ae0a0"];
    return (g, t, d, c) => {
      const S0 = def(o.stamp0, 0.8 * d / 7.4), GAP = def(o.gap, 0.5 * d / 7.4), NOTE = def(o.note, 5.2 * d / 7.4);
      // wall
      PX.vgrad(g, 0, 0, 640, 262, "141a32", "0a0d1a", 9);
      // blinds window (far)
      PX.par(g, c, 0.45, () => {
        R(g, 30, 36, 168, 148, "#252b42");
        if (core().skyline) core().skyline(g, 36, 42, 156, 136, t, 11);
        for (let y = 42; y < 178; y += 6) { R(g, 36, y, 156, 3, "#2a3150"); R(g, 36, y, 156, 1, "#46507a"); }
        R(g, 34, 38, 160, 4, "#3a4266"); R(g, 112, 42, 1, 140, "#8890b0"); R(g, 26, 182, 176, 5, "#30364f"); R(g, 26, 182, 176, 1, "#4a5274");
      });
      // light stripes from the blinds across the wall + a passing car sweep
      for (let i = 0; i < 9; i++) { const y = 58 + i * 13; poly(g, [[204, y], [300, y + 34], [300, y + 40], [204, y + 6]], "rgba(140,170,255,0.045)"); }
      { const k = frac(t / 3.2 + 0.15), x = -160 + k * 1000; g.globalAlpha = 0.07 * Math.sin(k * Math.PI);
        poly(g, [[x, 0], [x + 70, 0], [x + 150, 262], [x + 80, 262]], "#ffd8a0"); g.globalAlpha = 1; }
      // clock + cabinet (mid)
      PX.par(g, c, 0.62, () => {
        const cx = 574, cy = 64; PX.circle(g, cx, cy, 17, "#2a2f40"); PX.circle(g, cx, cy, 15, "#9a968a"); PX.circle(g, cx - 1, cy - 1, 13, "#aeaa9c");
        for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; R(g, cx + Math.cos(a) * 12, cy + Math.sin(a) * 12, 1, 1, "#3a3a40"); }
        const sa = Math.floor(t) / 60 * 6.283 - 1.57 + 2.2, ma = -1.57 + 1.3 + t * 0.002;
        thk(g, cx, cy, cx + Math.cos(ma) * 10, cy + Math.sin(ma) * 10, 1, "#1a1a20"); thk(g, cx, cy, cx + Math.cos(-0.6) * 7, cy + Math.sin(-0.6) * 7, 2, "#1a1a20");
        thk(g, cx, cy, cx + Math.cos(sa) * 12, cy + Math.sin(sa) * 12, 1, "#d23a3a");
        bx3(g, 520, 140, 92, 122, "#2c3242", "#46506a", "#1a1e28");
        for (let k = 0; k < 3; k++) { bx3(g, 526, 146 + k * 38, 80, 34, "#323a4e", "#4a5470", "#1e2230"); R(g, 556, 160 + k * 38, 20, 3, "#8890a8"); R(g, 556, 160 + k * 38, 20, 1, "#c0c8dc"); }
        R(g, 548, 120, 30, 20, "#6a3a2a"); R(g, 548, 120, 30, 2, "#8a5a40");
        for (let i = 0; i < 6; i++) poly(g, [[563, 122], [550 + i * 6, 96 + (i % 2) * 8], [554 + i * 6, 98 + (i % 2) * 8]], i % 2 ? "#2f6a44" : "#3f8a56");
      });
      // desk
      R(g, 0, 250, 640, 12, "#3a2a20"); R(g, 0, 250, 640, 2, "#5a4232"); R(g, 0, 262, 640, 98, "#120d0b"); R(g, 0, 262, 640, 2, "#1e1612");
      // banker's lamp (green) left
      R(g, 74, 242, 40, 8, "#5a4020"); R(g, 74, 242, 40, 1, "#9a7040"); R(g, 92, 214, 4, 28, "#9a7a40");
      poly(g, [[66, 214], [122, 214], [116, 200], [72, 200]], "#1f6a4a"); poly(g, [[72, 200], [116, 200], [117, 203], [71, 203]], "#3fa874"); R(g, 68, 214, 52, 2, "#ffd890");
      PX.glow(g, 94, 226, 70, "rgba(255,200,120,.35)", 1);
      if (core().mug) core().mug(g, 146, 240, t);
      // monitor
      const MX = 190, MY = 60, MW = 260, MH = 170;
      PX.glow(g, 320, 150, 230, "rgba(110,110,255,0.20)", 1);
      R(g, MX - 8, MY - 8, MW + 16, MH + 16, "#16181f"); R(g, MX - 8, MY - 8, MW + 16, 1, "#3a3f4b"); R(g, MX - 8, MY + MH + 7, MW + 16, 1, "#0a0b0f");
      R(g, 312, 238, 16, 12, "#16181f"); R(g, 296, 247, 48, 4, "#22252d"); R(g, 296, 247, 48, 1, "#3a3f4b");
      R(g, MX, MY, MW, 10, "#161b22"); R(g, MX + 3, MY + 2, 50, 8, "#0d1117"); T(g, "recurse.py", MX + 6, MY + 1, { font: "v", size: 10, col: "#c9d1d9" });
      R(g, MX + MW - 22, MY + 3, 4, 4, "#ff5f57"); R(g, MX + MW - 15, MY + 3, 4, 4, "#febc2e"); R(g, MX + MW - 8, MY + 3, 4, 4, "#28c840");
      // tunnel
      {
        const bx = MX, by = MY + 10, bw = MW, bh = MH - 10, Px = bx + bw * 0.5, Py = by + bh * 0.62, s0 = 0.7;
        const z = t * 0.5, f = frac(z), base = Math.floor(z);
        g.save(); g.beginPath(); g.rect(bx, by, bw, bh); g.clip();
        for (let i = -1; i < 16; i++) {
          const k = Math.pow(s0, i - f), w = bw * k, h = bh * k; if (w < 3) break;
          const x = Px - 0.5 * w, y = Py - 0.62 * h, j = i + base, dk = PX.clamp((i - f + 1) / 9, 0, 1);
          const hc = HUE[((j % HUE.length) + HUE.length) % HUE.length];
          R(g, x, y, w, h, mix("0f1424", "05060c", dk));
          R(g, x, y, w, 1, mix(hc, "0b0d18", dk * 0.7)); R(g, x, y + h - 1, w, 1, mix(hc, "0b0d18", dk * 0.85)); R(g, x, y, 1, h, mix(hc, "0b0d18", dk * 0.75)); R(g, x + w - 1, y, 1, h, mix(hc, "0b0d18", dk * 0.85));
          const fs = Math.floor(h * 0.08);
          g.globalAlpha = PX.clamp((1.12 - k) * 5, 0, 1);
          if (fs >= 10) {
            let lx = x + 5;
            for (const [s, col] of [["def", "#ff7b72"], [" recurse", "#d2a8ff"], ["(n):", "#c9d1d9"]]) lx += T(g, s, lx, y + 3, { font: "v", size: fs, col });
            lx = x + 5 + fs;
            for (const [s, col] of [["return", "#ff7b72"], [" recurse", "#d2a8ff"], ["(", "#c9d1d9"], ["n-1", "#f7c948"], [")", "#c9d1d9"]]) lx += T(g, s, lx, y + 3 + fs, { font: "v", size: fs, col });
            if (fs >= 10) T(g, "n=" + (97 - j), x + w - 5, y + 3, { font: "v", size: fs - 2, col: "#5a6b88", align: "right" });
          } else if (h > 14) {
            R(g, x + 3, y + 3, w * 0.3, 1, mix("d2a8ff", "0b0d18", 0.3 + dk * 0.6)); R(g, x + 3 + w * 0.06, y + 3 + Math.max(2, h * 0.07), w * 0.42, 1, mix("ff7b72", "0b0d18", 0.3 + dk * 0.6));
          }
          g.globalAlpha = 1;
        }
        g.restore();
        PX.glow(g, Px, Py, 40 + 6 * Math.sin(t * 3), "rgba(170,110,255,0.55)", 1);
      }
      // keyboard + mouse
      R(g, 262, 240, 116, 10, "#22252d"); R(g, 262, 240, 116, 1, "#4a505c");
      for (let ky = 0; ky < 2; ky++) for (let kx = 0; kx < 18; kx++) R(g, 265 + kx * 6, 242 + ky * 4, 5, 3, "#3a3f4b");
      R(g, 392, 243, 8, 6, "#2b2f38"); R(g, 392, 243, 8, 1, "#5a606c");
      PX.glow(g, 320, 252, 120, "rgba(120,120,255,0.18)", 1);
      // sticky note on the bezel
      if (t >= NOTE) {
        const k = PX.p(t, NOTE, 0.35, "back"), ny = MY + MH - 18 + (1 - k) * -40;
        g.globalAlpha = PX.clamp((t - NOTE) * 6, 0, 1);
        R(g, MX - 22, ny, 44, 30, "#c9a83a"); R(g, MX - 22, ny, 44, 30, "#e0c050"); R(g, MX - 22, ny, 44, 4, "#c9a83a"); R(g, MX + 21, ny + 1, 1, 29, "#a88a2a");
        T(g, "TODO:", MX - 18, ny + 5, { font: "v", size: 12, col: "#3a2a10" }); T(g, "SEE TODO", MX - 18, ny + 15, { font: "v", size: 12, col: "#3a2a10" });
        g.globalAlpha = 1;
      }
      // desk calendar (tent) with stamps
      {
        const idx = Math.floor((t - S0) / GAP + 0.25);
        const landT = (i) => S0 + i * GAP;
        let shake = 0; for (let i = 0; i < 7; i++) { const dt = t - landT(i); if (dt >= 0 && dt < 0.12) shake = 1; }
        const cx = 466, cy = 156 + shake;
        poly(g, [[cx + 8, cy + 94], [cx + 132, cy + 94], [cx + 124, cy + 6], [cx + 16, cy + 6]], "#1a1610");
        R(g, cx, cy + 4, 140, 90, "#b4aa92"); R(g, cx, cy + 4, 140, 1, "#d0c6ae"); R(g, cx + 139, cy + 4, 1, 90, "#9a9280");
        R(g, cx, cy + 4, 140, 14, "#a83a32"); R(g, cx, cy + 4, 140, 1, "#d05a4a"); T(g, "THIS WEEK", cx + 70, cy + 4, { font: "v", size: 14, col: "#f2e6d0", align: "center" });
        for (let k = 0; k < 9; k++) { R(g, cx + 8 + k * 15, cy, 3, 7, "#5a606c"); R(g, cx + 8 + k * 15, cy, 1, 7, "#9aa4b2"); }
        for (let i = 0; i < 7; i++) {
          const ry = cy + 20 + i * 10;
          R(g, cx + 4, ry + 9, 132, 1, "#9a9280");
          T(g, DAYS[i], cx + 6, ry, { font: "v", size: 12, col: i >= 5 ? "#a83a32" : "#3a3428" });
          const dt = t - landT(i);
          if (dt >= 0) {
            const big = dt < 0.08 ? 2 : 0, sx = cx + 34 - big, sy = ry - big, sw = 98 + big * 2, sh = 10 + big * 2;
            g.globalAlpha = 0.95; PX.box(g, sx, sy, sw, sh, "#c22a2a");
            T(g, "RECURSION", sx + sw / 2, sy + big - 1, { font: "v", size: 12, col: "#b81e1e", align: "center" }); g.globalAlpha = 1;
          }
        }
        // the rubber stamp coming down
        if (idx >= 0 && idx < 7) {
          const lt = landT(idx), dt = t - lt;
          const yy = dt < 0 ? -PX.ease(-dt / (GAP * 0.25), "in") * 40 : -PX.ease(dt / (GAP * 0.6), "out") * 50;
          const sx = cx + 83, sy = cy + 20 + idx * 10 - 4 + yy;
          if (sy > -40) {
            R(g, sx - 22, sy - 4, 44, 6, "#3a2a20"); R(g, sx - 22, sy - 4, 44, 1, "#6a4a30"); R(g, sx - 22, sy + 2, 44, 2, "#8a1a1a");
            R(g, sx - 4, sy - 18, 8, 14, "#6a4a30"); R(g, sx - 4, sy - 18, 2, 14, "#8a6a48"); ell(g, sx, sy - 22, 7, 5, "#a83a32"); ell(g, sx - 2, sy - 24, 3, 2, "#d05a4a");
          }
        }
      }
      // desk drawers + the coder staring into the tunnel
      for (const dx of [40, 470]) { bx3(g, dx, 272, 130, 40, "#1a1310", "#2a201a", "#0c0907"); R(g, dx + 55, 288, 20, 3, "#4a3a2a"); bx3(g, dx, 316, 130, 40, "#1a1310", "#2a201a", "#0c0907"); R(g, dx + 55, 332, 20, 3, "#4a3a2a"); }
      if (core().coder) core().coder(g, 320, 272 + Math.round(Math.sin(t * 1.4)), t, { col: "#3a3f78", hl: "#5258a0", dark: "#282c5a" });
      // foreground plant silhouette (near layer)
      PX.par(g, c, 1.25, () => {
        for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.32 + Math.sin(t * 0.8 + i) * 0.03, L = 70 + (i % 3) * 18;
          poly(g, [[-6, 372], [-6 + Math.cos(a) * L - 8, 372 + Math.sin(a) * L], [-6 + Math.cos(a) * L + 6, 372 + Math.sin(a) * L + 4]], "#070a0e"); }
        R(g, -10, 330, 50, 40, "#0a0a0e");
      });
      PX.particles(g, 31, 22, t, [180, 60, 280, 180], { vy: -2, vx: 1, col: "#b0b8ff", a: 0.45 });
      PX.vignette(g, 0.6);
    };
  };

  // ======================= sql50 =======================
  // server-room aisle, terminal on a cart: queries typing, counter QUERY 1/50 -> 50/50, database cylinder glowing.
  // o.done (0.86*d): time the 50th query finishes
  K.sql50 = (o) => {
    const Q = [["SELECT * FROM sales", "LIMIT 10;"], ["SELECT region, SUM(total)", "FROM sales GROUP BY region;"], ["SELECT COUNT(*)", "FROM sales WHERE total > 100;"],
      ["SELECT name, AVG(total)", "FROM sales JOIN users USING(id);"], ["SELECT month, MAX(total)", "FROM sales GROUP BY month;"], ["SELECT DISTINCT city", "FROM sales ORDER BY city;"]];
    const VX = 384, VY = 150, F = 250, P = (X, Y, Z) => [VX + (X * F) / Z, VY + (Y * F) / Z];
    const XW = 1.15, YC = -1.25, YT = -1.0, YF = 1.0, Z0 = 0.62, Z1 = 14;
    return (g, t, d, c) => {
      const END = def(o.done, d * 0.86), uu = PX.clamp((t - 0.35) / Math.max(0.5, END - 0.35), 0, 1);
      const cnt = 1 + 49 * Math.pow(uu, 2.1), n = Math.min(50, Math.floor(cnt)), done = t >= END;
      const fog = (z) => PX.clamp((z - Z0) / (Z1 - Z0), 0, 1);
      PX.par(g, c, 0.6, () => {
        // ceiling, floor, side walls, end wall
        poly(g, [P(-XW, YC, Z0), P(XW, YC, Z0), P(XW, YC, Z1), P(-XW, YC, Z1)], "#0b1324");
        poly(g, [P(-XW, YF, Z0), P(XW, YF, Z0), P(XW, YF, Z1), P(-XW, YF, Z1)], "#0b1424");
        for (const sx of [-1, 1]) poly(g, [P(sx * XW, YC, Z0), P(sx * XW, YC, Z1), P(sx * XW, YF, Z1), P(sx * XW, YF, Z0)], "#080e1c");
        const e0 = P(-XW, YC, Z1), e1 = P(XW, YF, Z1); R(g, e0[0], e0[1], e1[0] - e0[0], e1[1] - e0[1], "#13244a");
        const dd0 = P(-0.35, -0.5, Z1), dd1 = P(0.35, YF, Z1); R(g, dd0[0], dd0[1], dd1[0] - dd0[0], dd1[1] - dd0[1], "#3a6ab0"); PX.glow(g, VX, VY + 6, 40, "rgba(120,180,255,.5)", 1);
        // floor tiles
        for (let k = 0; k <= 4; k++) { const X = -XW + (k * 2 * XW) / 4, a = P(X, YF, Z0), b = P(X, YF, Z1); PX.line(g, a[0], a[1], b[0], b[1], "#15233e"); }
        for (let z = Z0 + 0.3; z < Z1; z += 0.575) { const a = P(-XW, YF, z), b = P(XW, YF, z); R(g, a[0], a[1], b[0] - a[0], 1, mix("1a2c4c", "0b1424", fog(z))); }
        // cable trays + ceiling light strips
        for (const X of [-0.7, 0.7]) { const a = P(X, YC + 0.02, Z0), b = P(X, YC + 0.02, Z1); PX.line(g, a[0], a[1], b[0], b[1], "#4a4420"); }
        for (let z = 1.0; z < Z1; z += 1.4) {
          const k = 1 - fog(z), q = [P(-0.12, YC, z), P(0.12, YC, z), P(0.12, YC, z + 0.6), P(-0.12, YC, z + 0.6)];
          poly(g, q, mix("b8e0ff", "1a2a48", 1 - k)); if (z < 6) PX.glow(g, (q[0][0] + q[1][0]) / 2, q[0][1] + 2, 60 * k + 10, "rgba(120,180,255,.35)", 1);
        }
        // racks, far to near, both sides
        const segs = []; for (let z = Z0 + 0.05; z < Z1; z += 0.95) segs.push(z); segs.reverse();
        for (const z0 of segs) for (const sx of [-1, 1]) {
          const z1 = z0 + 0.85, X = sx * XW, f = fog(z0);
          poly(g, [P(X, YT, z0), P(X, YT, z1), P(X, YF, z1), P(X, YF, z0)], mix("1e2840", "0c1424", f));
          const ea = P(X, YT, z0), eb = P(X, YF, z0); R(g, ea[0] - (sx < 0 ? 0 : 1), ea[1], Math.max(1, Math.round(3 / z0)), eb[1] - ea[1], mix("4a5a80", "0c1424", f));
          const ta = P(X, YT, z0), tb = P(X, YT, z1); PX.line(g, ta[0], ta[1], tb[0], tb[1], mix("3a4868", "0c1424", f));
          const r = PX.rnd(Math.round(z0 * 100) + (sx > 0 ? 7 : 0));
          for (let u = 0; u < 10; u++) {
            const Y = YT + 0.08 + u * 0.19, a = P(X, Y, z0 + 0.03), b = P(X, Y, z1 - 0.03);
            PX.line(g, a[0], a[1], b[0], b[1], mix("101828", "0a1120", f));
            if (z0 < 3.2 && u % 2 === 0) { const m0 = P(X, Y + 0.08, z0 + 0.3), m1 = P(X, Y + 0.08, z1 - 0.06); PX.line(g, m0[0], m0[1], m1[0], m1[1], mix("162036", "0a1120", f)); }
            for (let l = 0; l < 3; l++) {
              const zz = z0 + 0.1 + l * 0.07, pp = P(X, Y + 0.09, zz), ph = r() * 6, rate = 1 + r() * 5, kind = r();
              const on = Math.sin(t * rate + ph) > -0.3 || (done && l === 0);
              if (!on) continue;
              const col = kind < 0.55 ? "#3df56b" : kind < 0.85 ? "#5fe3e8" : "#f7a83c", sz = z0 < 1.6 ? 2 : 1;
              g.globalAlpha = 1 - f * 0.7; R(g, pp[0], pp[1], sz, sz, col); g.globalAlpha = 1;
            }
          }
        }
        PX.glow(g, VX, 250, 200, "rgba(70,120,255,0.16)", 1);
        // database cylinder standing in the aisle
        const pulse = done ? 1 : 1 - frac(cnt), cx = 412, top = 104, bot = 206, rw = 26, rh = 6;
        PX.glow(g, cx, (top + bot) / 2, 90 + 20 * pulse, `rgba(80,220,240,${0.25 + 0.3 * pulse})`, 1);
        ell(g, cx + 6, bot + 4, rw + 8, rh + 2, "rgba(0,0,0,.5)");
        R(g, cx - rw, top, rw * 2, bot - top, "#1a4a5a"); ell(g, cx, bot, rw, rh, "#123844");
        for (let x = -rw; x < rw; x++) { const k = (x + rw) / (2 * rw), col = k < 0.2 ? "#3a8a9a" : k < 0.6 ? "#235f70" : k < 0.85 ? "#1a4a5a" : "#123844"; R(g, cx + x, top, 1, bot - top, col); }
        for (let b = 0; b < 3; b++) {
          const y = top + 22 + b * 26, lit = done || (Math.floor(cnt) % 3 === b);
          for (let x = -rw; x <= rw; x++) { const yy = y + Math.round(rh * Math.sqrt(Math.max(0, 1 - (x * x) / (rw * rw)))); R(g, cx + x, yy, 1, 2, lit ? "#8af4ff" : "#2a7a8a"); }
          if (lit) PX.glow(g, cx, y + rh, 34, "rgba(120,240,255,.45)", 1);
        }
        ell(g, cx, top, rw, rh, "#4ab0c0"); ell(g, cx, top, rw - 3, rh - 2, "#2f8494"); R(g, cx - 10, top - 1, 8, 1, "#bff8ff");
        T(g, "SALES", cx, top + 40, { font: "v", size: 12, col: "#bff8ff", align: "center" });
      });
      // cold mist drifting along the floor
      PX.particles(g, 41, 40, t, [0, 250, 640, 70], { vx: 10, vy: 0, col: "#9ac8ff", a: 0.3, size: 2 });
      // cable from the cart to the database, packets flying
      const bz = (k) => { const a = [250, 330], m = [370, 318], b = [410, 212]; return [(1 - k) * (1 - k) * a[0] + 2 * (1 - k) * k * m[0] + k * k * b[0], (1 - k) * (1 - k) * a[1] + 2 * (1 - k) * k * m[1] + k * k * b[1]]; };
      for (let i = 0; i < 40; i++) { const [x, y] = bz(i / 40); R(g, x, y, 2, 2, "#1a2030"); }
      if (!done) for (let j = 0; j < 4; j++) { const k = frac(cnt * 0.5 + j / 4), [x, y] = bz(k); R(g, x - 1, y - 1, 3, 3, "#8af4ff"); PX.glow(g, x, y, 8, "rgba(120,240,255,.6)", 1); }
      // ---- the cart (foreground) ----
      R(g, 44, 300, 256, 6, "#5a6070"); R(g, 44, 300, 256, 1, "#9aa0b0"); R(g, 44, 305, 256, 2, "#2a2e38");
      for (const x of [50, 290]) { R(g, x, 306, 4, 44, "#4a505c"); R(g, x, 306, 1, 44, "#7a808c"); }
      R(g, 44, 336, 256, 4, "#4a505c"); R(g, 44, 336, 256, 1, "#7a808c");
      for (const x of [52, 292]) { PX.circle(g, x, 354, 5, "#15171d"); PX.circle(g, x, 354, 2, "#4a505c"); }
      bx3(g, 70, 318, 60, 18, "#3a3226", "#5a4a36", "#221c14"); bx3(g, 150, 322, 40, 14, "#2a2e38", "#4a505c", "#1a1d24");
      // monitor
      R(g, 150, 286, 44, 14, "#1d2028"); R(g, 150, 286, 44, 1, "#3a3f4b");
      bx3(g, 60, 156, 224, 132, "#2a2e38", "#4a505c", "#16181e"); R(g, 64, 160, 216, 124, "#1a1d24");
      const X0 = 72, Y0 = 166, W0 = 200, H0 = 112;
      R(g, X0, Y0, W0, H0, "#05111a");
      PX.glow(g, X0 + W0 / 2, Y0 + H0 / 2, 140, "rgba(60,200,220,.16)", 1);
      R(g, X0, Y0, W0, 12, "#0f2a3a"); T(g, "sales_db", X0 + 4, Y0 + 1, { font: "v", size: 12, col: "#7ab8c8" });
      const qc = done ? "#3df56b" : "#f7c948";
      T(g, "QUERY " + n + "/50", X0 + W0 - 4, Y0 + 2, { size: 8, col: qc, align: "right" });
      R(g, X0 + 4, Y0 + 15, W0 - 8, 5, "#0f2230"); R(g, X0 + 4, Y0 + 15, Math.round((W0 - 8) * (done ? 1 : (n - 1) / 50 + frac(cnt) / 50)), 5, done ? "#3df56b" : "#2fbf8a");
      for (let h = 1; h <= 4; h++) { const k = n - h; if (k < 1) break; T(g, "#" + k + "  OK  " + (3 + ((k * 7) % 19)) + " rows", X0 + 4, Y0 + 22 + (4 - h) * 10, { font: "v", size: 12, col: mix("3a8a6a", "05111a", h * 0.18) }); }
      if (!done) {
        const q = Q[n % Q.length], k = frac(cnt), L = q[0].length + q[1].length, m = Math.floor(PX.clamp(k / 0.7, 0, 1) * L);
        const s1 = q[0].slice(0, m), s2 = m > q[0].length ? q[1].slice(0, m - q[0].length) : "";
        T(g, "> " + s1, X0 + 4, Y0 + 64, { font: "v", size: 12, col: "#c9f0ff" }); T(g, "  " + s2, X0 + 4, Y0 + 74, { font: "v", size: 12, col: "#c9f0ff" });
        if (k > 0.72) T(g, "OK  " + (3 + ((n * 7) % 19)) + " rows  0.0" + (n % 9 + 1) + "s", X0 + 4, Y0 + 88, { font: "v", size: 12, col: "#3df56b" });
        else if (PX.blink(t, 0.5)) R(g, X0 + 6 + PX.tw(g, "  " + (s2 || s1), { font: "v", size: 12 }), Y0 + (s2 ? 76 : 66), 4, 9, "#c9f0ff");
      } else {
        const k = PX.p(t, END, 0.4, "back");
        OT(g, "50/50", X0 + W0 / 2, Y0 + 60 - Math.round((1 - k) * 10), { size: 24, col: "#3df56b", align: "center" });
        T(g, "ALL QUERIES OK", X0 + W0 / 2, Y0 + 90, { font: "v", size: 12, col: "#8af4a0", align: "center" });
      }
      // keyboard on the cart
      R(g, 96, 292, 150, 9, "#22252d"); R(g, 96, 292, 150, 1, "#4a505c");
      for (let kx = 0; kx < 24; kx++) { const press = !done && ((Math.floor(t * 20) + kx * 7) % 11 === 0); R(g, 99 + kx * 6, 294 + (press ? 1 : 0), 5, 3, press ? "#9aa4b2" : "#3a3f4b"); }
      PX.vignette(g, 0.55);
    };
  };

  // ======================= target =======================
  // archery range at night, target labelled THE THING YOU AVOID, arrow hits the bullseye at o.hit (1.2) with screen shake.
  K.target = (o) => {
    const STARS = []; { const r = PX.rnd(5); for (let i = 0; i < 70; i++) STARS.push([r() * 660 - 10, r() * 150, r()]); }
    const STRAW = []; { const r = PX.rnd(8); for (let i = 0; i < 26; i++) STRAW.push([r() * 6.283, 40 + r() * 80, r() * 4 - 2, r()]); }
    return (g, t, d, c) => {
      const HIT = def(o.hit, (1.2 * d) / 2.9), FLY = 0.3, REL = HIT - FLY, dt = t - HIT;
      const sh = dt >= 0 && dt < 0.6 ? Math.exp(-dt * 7) : 0, sx = Math.round(Math.sin(dt * 75) * 6 * sh), sy = Math.round(Math.cos(dt * 61) * 4 * sh);
      g.save(); g.translate(sx, sy);
      // sky
      PX.vgrad(g, -12, -12, 664, 222, "070b20", "2a2452", 9);
      for (const [x, y, a] of STARS) { g.globalAlpha = 0.3 + 0.6 * Math.abs(Math.sin(t * 1.4 + a * 9)); R(g, x, y, 1, 1, "#fff"); } g.globalAlpha = 1;
      PX.par(g, c, 0.25, () => {
        PX.circle(g, 536, 50, 14, "#e8e4c4"); PX.circle(g, 541, 46, 12, "#d4d0ae"); PX.glow(g, 536, 50, 60, "rgba(230,230,200,.25)", 1);
        g.globalAlpha = 0.5; ell(g, 120 + ((t * 6) % 760) - 60, 44, 40, 4, "#3a3a6a"); ell(g, 300 + ((t * 4) % 760) - 60, 72, 30, 3, "#3a3a6a"); g.globalAlpha = 1;
        const hill = []; for (let x = -12; x <= 652; x += 8) hill.push([x, 170 - 18 * Math.sin(x * 0.012) - 10 * Math.sin(x * 0.031 + 1)]);
        poly(g, [...hill, [652, 222], [-12, 222]], "#141a38");
      });
      PX.par(g, c, 0.45, () => {
        const tr = []; const r = PX.rnd(12); for (let x = -12; x <= 652; x += 6) tr.push([x, 186 - r() * 16 - (x % 30 === 0 ? 10 : 0)]);
        poly(g, [...tr, [652, 210], [-12, 210]], "#0b1424");
        R(g, -12, 196, 664, 10, "#0d1a20");
        for (let x = 0; x < 660; x += 20) { R(g, x, 190, 2, 16, "#2a3038"); } R(g, -12, 194, 664, 1, "#3a4048"); R(g, -12, 200, 664, 1, "#2a3038");
      });
      // field with mown stripes in perspective
      PX.vgrad(g, -12, 204, 664, 168, "12281e", "1d3f2a", 7);
      for (let i = 0; i < 9; i++) { const y0 = 204 + Math.pow(i / 9, 1.6) * 160, y1 = 204 + Math.pow((i + 0.5) / 9, 1.6) * 160; R(g, -12, y0, 664, y1 - y0, "rgba(120,200,140,.05)"); }
      for (const [y, lab] of [[226, "30M"], [258, "20M"], [312, "10M"]]) { R(g, -12, y, 664, 1, "rgba(220,230,200,.22)"); T(g, lab, 600, y - 10, { font: "v", size: 10, col: "rgba(220,230,200,.45)" }); }
      // floodlights
      PX.par(g, c, 0.6, () => {
        for (const [px, dir] of [[78, 1], [600, -1]]) {
          R(g, px - 2, 52, 4, 156, "#2a2e38"); R(g, px - 2, 52, 1, 156, "#4a505c");
          bx3(g, px - 14, 40, 28, 14, "#2a2e38", "#5a606c", "#16181e");
          for (let k = 0; k < 4; k++) { R(g, px - 11 + k * 6, 44, 4, 6, "#fff3c8"); }
          PX.glow(g, px, 47, 46, "rgba(255,240,190,.75)", 1);
          g.globalAlpha = 0.07; poly(g, [[px - 12, 54], [px + 12, 54], [px + dir * 300 + 90, 300], [px + dir * 300 - 110, 300]], "#fff0c0"); g.globalAlpha = 1;
          PX.particles(g, px, 8, t, [px - 24, 30, 48, 40], { vx: 14, vy: 9, col: "#fff6d0", a: 0.8 });
        }
      });
      PX.glow(g, 410, 230, 200, "rgba(255,230,170,.18)", 1);
      // distant lanes
      for (const [x, r, num] of [[176, 13, "1"], [250, 16, "2"]]) {
        R(g, x - 1, 196, 2, 24, "#3a2a1a"); PX.circle(g, x, 194, r + 3, "#5a4a24");
        for (const [k, col] of [[1, "#8a8470"], [0.75, "#1c1d22"], [0.5, "#2a5a9a"], [0.28, "#a83434"], [0.12, "#c09a30"]]) PX.circle(g, x, 194, Math.max(1, Math.round(r * k)), col);
        T(g, num, x, 220, { font: "v", size: 10, col: "#6a7a70", align: "center" });
      }
      // sign behind the main target
      R(g, 336, 96, 3, 110, "#3a2414"); R(g, 486, 96, 3, 110, "#3a2414");
      bx3(g, 324, 84, 176, 24, "#5a3a20", "#8a5a34", "#2a1a0e"); for (let k = 0; k < 3; k++) R(g, 326, 90 + k * 7, 172, 1, "#4a2e18");
      OT(g, "THE THING YOU AVOID", 412, 92, { size: 8, col: "#f7c948", align: "center" });
      { const fl = Math.sin(t * 9); poly(g, [[489, 70], [489 + 22, 74 + fl * 2], [489, 80]], "#d84040"); R(g, 488, 66, 2, 34, "#6a6a70"); }
      // main target: straw boss on legs
      const TX = 412, TY = 168;
      thk(g, TX - 30, TY + 30, TX - 44, 262, 4, "#4a2e18"); thk(g, TX + 30, TY + 30, TX + 44, 262, 4, "#3a2414"); thk(g, TX, TY + 30, TX + 6, 252, 3, "#2a1a0e");
      ell(g, TX + 4, 262, 54, 5, "rgba(0,0,0,.4)");
      PX.circle(g, TX, TY, 48, "#6a4e1c"); PX.circle(g, TX - 1, TY - 1, 46, "#9a7a34");
      for (let k = 0; k < 18; k++) { const a = k * 0.35; arc(g, TX, TY, 42 + (k % 3), a, a + 0.25, "#b8964a"); }
      const flash = dt >= 0 ? Math.max(0, 1 - dt * 3) : 0;
      for (const [r, col] of [[39, "#c4bc9c"], [32, "#202128"], [24, "#3a74c8"], [16, "#d03c3c"], [8, "#f0c040"]]) PX.circle(g, TX, TY, r, col);
      arc(g, TX, TY, 38, Math.PI * 1.1, Math.PI * 1.6, "#e4dcbc"); arc(g, TX, TY, 23, Math.PI * 1.1, Math.PI * 1.6, "#6a9ae8"); arc(g, TX, TY, 15, Math.PI * 1.1, Math.PI * 1.6, "#f06a5a");
      R(g, TX - 1, TY - 1, 3, 3, "#ffe68a");
      if (flash > 0) { PX.glow(g, TX, TY, 60 * flash + 20, `rgba(255,230,120,${0.8 * flash})`, 1); for (let i = 0; i < 3; i++) { const rr = 10 + (dt * 120 + i * 14); if (rr < 80) arc(g, TX, TY, rr, 0, 6.283, rgba("f7c948", Math.max(0, 0.8 - rr / 90))); } }
      // straw burst
      if (dt >= 0 && dt < 1.2) for (const [a, sp, vy, k] of STRAW) { const x = TX + Math.cos(a) * sp * dt, y = TY + Math.sin(a) * sp * dt * 0.7 + 60 * dt * dt; g.globalAlpha = Math.max(0, 1 - dt / 1.2); R(g, x, y, 2, 1, k < 0.5 ? "#d8b860" : "#b08a3a"); } g.globalAlpha = 1;
      // arrow in flight / stuck
      const ST = [196, 216];
      if (t >= REL && t < HIT) {
        const p = PX.clamp((t - REL) / FLY, 0, 1), q = Math.pow(p, 0.85), x = PX.lerp(ST[0], TX, q), y = PX.lerp(ST[1], TY, q) - 10 * Math.sin(Math.PI * p);
        const L = PX.lerp(70, 14, q), dx = TX - ST[0], dy = TY - ST[1], dl = Math.hypot(dx, dy), ux = dx / dl, uy = dy / dl;
        g.globalAlpha = 0.35; thk(g, x - ux * L * 2.2, y - uy * L * 2.2, x - ux * L, y - uy * L, 1, "#fff0c0"); g.globalAlpha = 1;
        thk(g, x, y, x - ux * L, y - uy * L, p < 0.5 ? 2 : 1, "#d8c8a0");
        R(g, x - 1, y - 1, 3, 3, "#c0c8d0");
        const fx = x - ux * L, fy = y - uy * L; R(g, fx - 3, fy - 3, 4, 2, "#f25ca8"); R(g, fx - 3, fy + 1, 4, 2, "#f25ca8");
      } else if (t >= HIT) {
        const w = Math.sin(dt * 55) * 3 * Math.exp(-dt * 4), ex = TX - 13 + w, ey = TY + 4 - w * 0.5;
        thk(g, TX, TY, ex, ey, 2, "#d8c8a0"); R(g, ex - 3, ey - 3, 4, 3, "#f25ca8"); R(g, ex - 3, ey + 1, 4, 3, "#f25ca8"); R(g, ex - 4, ey - 1, 3, 2, "#ff8ac8");
      }
      // archer (foreground, from behind)
      PX.par(g, c, 1.15, () => {
        const pull = t < REL ? 0.55 + 0.45 * PX.ease(t / Math.max(0.1, REL), "out") : 0, trem = t < REL ? Math.round(Math.sin(t * 50) * (t > REL - 0.4 ? 1 : 0)) : 0;
        const hx = 74, hy = 222, bowX = 176;
        // body
        for (let r2 = 0; r2 < 130; r2++) { const w = Math.round(44 + r2 * 0.22); R(g, hx - w / 2, hy + 18 + r2, w, 1, "#1f4f5c"); R(g, hx - w / 2, hy + 18 + r2, 4, 1, "#163a44"); R(g, hx + w / 2 - 6, hy + 18 + r2, 6, 1, "#2f7484"); }
        R(g, hx - 22, hy + 18, 44, 3, "#3a8a9a"); R(g, hx - 32, hy + 82, 64, 5, "#3a2414"); R(g, hx - 6, hy + 82, 8, 5, "#b08a3a"); R(g, hx - 33, hy + 87, 66, 60, "#1c2030"); R(g, hx - 33, hy + 87, 4, 60, "#14161f"); R(g, hx - 1, hy + 92, 2, 60, "#14161f");
        R(g, hx + 10, hy + 22, 4, 80, "#3a2a1a"); R(g, hx + 6, hy + 14, 12, 10, "#5a3a22");   // quiver strap/top
        for (let k = 0; k < 4; k++) { R(g, hx + 6 + k * 3, hy + 4 - (k % 2) * 2, 2, 10, "#d8c8a0"); R(g, hx + 5 + k * 3, hy + 2 - (k % 2) * 2, 3, 3, k % 2 ? "#5fe3e8" : "#f25ca8"); }
        // bow arm reaching toward the target
        thk(g, hx + 18, hy + 24, bowX - 4, 216, 8, "#1f4f5c"); thk(g, hx + 18, hy + 22, bowX - 4, 214, 3, "#3a8a9a");
        R(g, bowX - 6, 211, 7, 8, "#c98a5a"); R(g, bowX - 6, 211, 7, 2, "#e0a878");
        // bow
        const tip0 = [bowX - 4, 150], tip1 = [bowX - 4, 282];
        for (let yy = -66; yy <= 66; yy++) { const x = bowX - 4 + 14 * (1 - (yy / 66) * (yy / 66)); R(g, x, 216 + yy, 3, 1, "#4a2a14"); R(g, x + 2, 216 + yy, 1, 1, "#9a6a3a"); }
        // string + draw hand
        const nx = t < REL ? bowX - 4 - 70 * pull + trem : bowX - 4 + Math.round(Math.sin((t - REL) * 70) * 4 * Math.exp(-(t - REL) * 6));
        PX.line(g, tip0[0], tip0[1], nx, 216, "#e8e0c8"); PX.line(g, tip1[0], tip1[1], nx, 216, "#e8e0c8");
        const dh = t < REL ? [nx, 217] : [hx - 4 - Math.min(12, (t - REL) * 60), 212];
        thk(g, hx - 16, hy + 26, hx - 30, hy + 8, 8, "#1f4f5c"); thk(g, hx - 30, hy + 8, dh[0], dh[1], 7, "#1f4f5c"); thk(g, hx - 30, hy + 6, dh[0], dh[1] - 2, 2, "#3a8a9a");
        R(g, dh[0] - 3, dh[1] - 4, 7, 7, "#c98a5a");
        if (t < REL) { thk(g, nx, 216, bowX + 16, 214, 2, "#d8c8a0"); R(g, bowX + 15, 213, 3, 3, "#c0c8d0"); R(g, nx + 2, 213, 6, 2, "#f25ca8"); R(g, nx + 2, 217, 6, 2, "#f25ca8"); }
        // head + ponytail
        R(g, hx - 6, hy + 10, 12, 10, "#a8704a");
        PX.circle(g, hx, hy, 13, "#22140c"); PX.circle(g, hx + 2, hy - 3, 9, "#3a2414"); R(g, hx + 4, hy - 12, 8, 2, "#5a3a22");
        thk(g, hx - 8, hy + 2, hx - 18, hy + 22 + Math.sin(t * 3) * 2, 5, "#22140c"); R(g, hx - 9, hy - 1, 4, 4, "#d84040");
        R(g, hx + 12, hy - 2, 3, 6, "#a8704a");
      });
      g.restore();
      PX.vignette(g, 0.55);
    };
  };

  // ======================= todo_clones =======================
  // TV-shop window on a night street: wall of monitors all showing the same TO-DO app in different colour schemes,
  // multiplying in waves; a painter keeps repainting one; the shop sign flickers to "PROGRESS?" at o.q (6.0).
  // o.repaint: times of the repaint strokes (default 6 strokes over the shot)
  K.todo_clones = (o) => {
    const SCH = [["5fe3e8", "10222e", "f7c948", "3a6a7a"], ["f25ca8", "2a1428", "5fe3e8", "7a3a62"], ["3df56b", "0f2418", "f7c948", "2f6a44"], ["f7a83c", "2a1a0c", "5fe3e8", "7a5a2a"],
      ["8a7cff", "171436", "f25ca8", "4a4280"], ["ff6a5c", "2a1212", "f7c948", "7a3434"], ["f7c948", "24200c", "f25ca8", "7a6a2a"], ["9ad0ff", "142030", "3df56b", "3a5a78"]];
    const COLS = 6, ROWS = 3, SW = 56, SH = 42, GX = 8, GY = 10, WX = 132, WY = 96, PR = 2, PC = 0;
    const FONT = { T: ["###", ".#.", ".#.", ".#.", ".#."], O: ["###", "#.#", "#.#", "#.#", "###"], D: ["##.", "#.#", "#.#", "#.#", "##."], "-": ["...", "...", "###", "...", "..."] };
    const mini = (g, s, x, y, col) => { for (const ch of s) { PX.sprite(g, FONT[ch], x, y, { "#": col }); x += 4; } };
    const app = (g, x, y, w, h, sc, t, seed) => {
      const [bar, bg, acc, ln] = SCH[sc].map((v) => "#" + v);
      R(g, x, y, w, h, bg); R(g, x, y, w, 8, bar); mini(g, "TO-DO", x + 3, y + 2, bg);
      for (let i = 0; i < 3; i++) {
        const ry = y + 12 + i * 8, done = i < 1 + ((seed + Math.floor(t * 0.7)) % 2);
        PX.box(g, x + 3, ry, 5, 5, acc); if (done) R(g, x + 4, ry + 1, 3, 3, acc);
        const L = 14 + ((seed * 7 + i * 11) % 18); R(g, x + 11, ry + 2, L, 2, ln); if (done) R(g, x + 10, ry + 2, L + 2, 1, acc);
      }
      PX.circle(g, x + w - 7, y + h - 7, 4, bar); R(g, x + w - 9, y + h - 7, 5, 1, bg); R(g, x + w - 7, y + h - 9, 1, 5, bg);
    };
    return (g, t, d, c) => {
      const Q = def(o.q, (6 * d) / 10.6), sc = d / 10.6;
      const RP = o.repaint || [1.0, 2.6, 4.2, 5.6, 7.6, 9.0].map((v) => v * sc);
      let k = -1; for (let i = 0; i < RP.length; i++) if (t >= RP[i]) k = i;
      const dist = (r, cc) => Math.abs(r - PR) + Math.abs(cc - PC);
      const schemeAt = (r, cc) => { const dd = dist(r, cc); let kk = -1; for (let i = 0; i < RP.length; i++) if (t >= RP[i] + 0.35 + dd * 0.12) kk = i;
        return dd === 0 ? (((kk + 1) * 3) % 8) : (((kk + 1) * 3 + r * 3 + cc * 5) % 8); };
      // brick facade
      R(g, 0, 0, 640, 262, "#24161e");
      for (let y = 0, row = 0; y < 262; y += 7, row++) { R(g, 0, y + 6, 640, 1, "#170c12"); for (let x = (row % 2) * 8 - 8; x < 640; x += 16) { R(g, x, y, 1, 6, "#170c12"); const r = PX.rnd(x * 13 + y * 7 + 999)(); if (r < 0.2) R(g, x + 1, y, 15, 6, "#2c1a24"); if (r > 0.92) R(g, x + 1, y, 15, 1, "#3a2430"); } }
      // upstairs windows (far)
      PX.par(g, c, 0.55, () => {
        for (const wx of [40, 560]) { const lit = PX.blink(t + wx * 0.01, 7, 0.8); R(g, wx - 3, 18, 46, 52, "#3a2a30"); R(g, wx, 21, 40, 46, lit ? "#3a3020" : "#141626"); R(g, wx + 19, 21, 2, 46, "#3a2a30"); R(g, wx, 43, 40, 2, "#3a2a30");
          if (lit) PX.glow(g, wx + 20, 44, 40, "rgba(255,200,120,.25)", 1); }
      });
      // sign board with neon
      const SB = [212, 18, 216, 40];
      bx3(g, SB[0], SB[1], SB[2], SB[3], "#14121c", "#3a3644", "#08070c"); R(g, SB[0] + 30, SB[1] - 18, 2, 18, "#3a3644"); R(g, SB[0] + SB[2] - 32, SB[1] - 18, 2, 18, "#3a3644");
      {
        const flick = t >= Q && t < Q + 0.7, on = flick ? PX.blink(t, 0.09, 0.45) : t < Q ? !(PX.blink(t, 2.3, 0.04)) : !(PX.blink(t + 0.3, 1.7, 0.05));
        const pre = t < Q + 0.35, txt = pre ? "TV  SHOP" : "PROGRESS?", col = pre ? "#f25ca8" : "#f7c948";
        if (on) { PX.glow(g, 320, 38, 120, pre ? "rgba(242,92,168,.45)" : "rgba(247,201,72,.55)", 1); OT(g, txt, 320, 30, { size: 16, col, outline: pre ? "#6a1a48" : "#6a4a10", align: "center" }); }
        else OT(g, txt, 320, 30, { size: 16, col: "#2a2430", outline: "#100e16", align: "center" });
      }
      // awning
      for (let x = 96; x < 544; x += 16) { const a = (x / 16) % 2; R(g, x, 64, 16, 16, a ? "#2a5a62" : "#1a343e"); R(g, x, 64, 16, 1, a ? "#4a8a92" : "#2a4a54"); ell(g, x + 8, 80, 8, 3, a ? "#2a5a62" : "#1a343e"); }
      R(g, 96, 62, 448, 3, "#0e0c12");
      // window + screens
      R(g, 114, 84, 412, 170, "#3a3f4b"); R(g, 114, 84, 412, 1, "#6a7080"); R(g, 118, 88, 404, 162, "#06070d");
      PX.glow(g, 320, 168, 240, "rgba(120,160,255,.10)", 1);
      for (let r = 0; r < ROWS; r++) {
        R(g, 118, WY + (r + 1) * (SH + GY) - GY + 1, 404, 3, "#1a1c24"); R(g, 118, WY + (r + 1) * (SH + GY) - GY + 1, 404, 1, "#30343f");
        for (let cc = 0; cc < COLS; cc++) {
          const x = WX + cc * (SW + GX), y = WY + r * (SH + GY), dd = dist(r, cc), onT = 0.15 * sc + dd * 0.32 * sc;
          bx3(g, x - 2, y - 2, SW + 4, SH + 4, "#1c1e26", "#3a3f4b", "#0c0d12");
          if (t < onT) { R(g, x, y, SW, SH, "#0a0c12"); continue; }
          const age = t - onT;
          if (age < 0.12) { R(g, x, y + SH / 2 - 1, SW, 2, "#d8f0ff"); continue; }
          const s = schemeAt(r, cc);
          if (dd === 0 && k >= 0 && t < RP[k] + 0.5) {          // being repainted: wipe from the top
            const prev = (k * 3) % 8, wp = PX.clamp((t - RP[k]) / 0.5, 0, 1);
            app(g, x, y, SW, SH, prev, t, r * 6 + cc);
            g.save(); g.beginPath(); g.rect(x, y, SW, Math.round(SH * wp)); g.clip(); app(g, x, y, SW, SH, s, t, r * 6 + cc); g.restore();
          } else app(g, x, y, SW, SH, s, t, r * 6 + cc);
          PX.glow(g, x + SW / 2, y + SH / 2, 30, rgba(SCH[s][0], 0.18), 1);
          if (PX.blink(t * 1.3 + r + cc * 0.7, 2, 0.1)) R(g, x, y + ((t * 40 + cc * 9) % SH), SW, 1, "rgba(255,255,255,.12)");
        }
      }
      // glass reflections
      g.globalAlpha = 0.06; for (const gx of [150, 330, 450]) poly(g, [[gx, 88], [gx + 30, 88], [gx - 40, 250], [gx - 70, 250]], "#c0d8ff"); g.globalAlpha = 1;
      // wall base + sidewalk + street
      R(g, 0, 254, 640, 8, "#2a2630"); R(g, 0, 254, 640, 1, "#4a4654");
      R(g, 0, 262, 640, 70, "#1b1f2c");
      for (let i = -6; i < 16; i++) { const x0 = 320 + i * 48; PX.line(g, x0, 262, 320 + (x0 - 320) * 1.6, 332, "#141824"); }
      R(g, 0, 292, 640, 1, "#141824");
      // reflections of the screens on the wet pavement
      for (let cc = 0; cc < COLS; cc++) { const x = WX + cc * (SW + GX), s = schemeAt(2, cc); for (let yy = 0; yy < 56; yy += 2) { const wob = Math.round(Math.sin(t * 3 + yy * 0.5 + cc) * (1 + yy / 20)); g.globalAlpha = 0.2 * (1 - yy / 56); R(g, x + 4 + wob + yy / 8, 264 + yy, SW - 8 - yy / 4, 1, "#" + SCH[s][0]); } } g.globalAlpha = 1;
      R(g, 0, 332, 640, 6, "#3a3e4a"); R(g, 0, 332, 640, 1, "#5a5e6a"); R(g, 0, 338, 640, 22, "#0d0f18");
      for (let i = 0; i < 8; i++) { g.globalAlpha = 0.25; R(g, 60 + i * 76 + Math.sin(t + i) * 2, 342 + (i % 3) * 5, 30, 1, i % 2 ? "#f25ca8" : "#5fe3e8"); } g.globalAlpha = 1;
      // street lamp (right)
      R(g, 586, 60, 4, 274, "#2a2e38"); R(g, 586, 60, 1, 274, "#4a505c"); thk(g, 588, 62, 566, 58, 3, "#2a2e38"); bx3(g, 554, 56, 20, 6, "#2a2e38", "#5a606c", "#16181e");
      R(g, 557, 62, 14, 2, "#ffe0a0"); PX.glow(g, 564, 66, 60, "rgba(255,210,140,.6)", 1); g.globalAlpha = 0.06; poly(g, [[556, 64], [572, 64], [620, 332], [508, 332]], "#ffe0a0"); g.globalAlpha = 1;
      // paint cans + drips
      for (const [x, col] of [[64, "#f25ca8"], [80, "#5fe3e8"], [148, "#3df56b"]]) { bx3(g, x, 290, 12, 12, "#8a909c", "#c0c6d0", "#5a606c"); R(g, x, 290, 12, 2, col); R(g, x + 3, 292, 2, 4, col); ell(g, x + 6, 304, 7, 1, col); }
      for (const [x, col] of [[120, "#f25ca8"], [160, "#f7a83c"], [100, "#8a7cff"]]) { g.globalAlpha = 0.7; ell(g, x, 308 + (x % 7), 4, 1, col); } g.globalAlpha = 1;
      // the painter on a step stool, roller on screen (row 2, col 0)
      {
        const sx0 = WX + PC * (SW + GX), sy0 = WY + PR * (SH + GY), inPaint = k >= 0 && t < RP[k] + 0.5;
        const ry = inPaint ? sy0 - 4 + PX.ease((t - RP[k]) / 0.5, "io") * (SH - 8) : sy0 + 12 + Math.sin(t * 4) * 10;
        const px = 104, feet = 280, look = t >= Q && t < Q + 2.2;
        bx3(g, 88, 280, 34, 5, "#8a5a34", "#b07a4a", "#4a2e18"); thk(g, 92, 285, 88, 304, 3, "#6a4428"); thk(g, 118, 285, 122, 304, 3, "#6a4428"); R(g, 90, 294, 30, 2, "#6a4428");
        const hand = [128, Math.round(ry + 22)];
        const rc = "#" + SCH[k >= 0 ? (((k + 1) * 3) % 8) : 0][0];
        guy(g, px, feet, t, { shirt: ["#ffe08a", "#f0b840", "#b07c20"], pants: ["#5a7ab0", "#3d5a8f", "#2a3f66"], hair: ["#7a4a2a", "#4a2a14"], expr: look ? "worry" : inPaint ? "grin" : "smile",
          look: look ? [0, -2] : [2, 0], sweat: look, arms: { r: hand, l: look ? [px - 18, feet - 58] : [px - 14, feet - 22] }, bob: Math.sin(t * 4) * 0.6, seed: 1 });
        R(g, px - 11, feet - 69, 22, 4, "#e8e0d0"); R(g, px - 11, feet - 69, 22, 1, "#ffffff"); R(g, px + 5, feet - 66, 9, 2, "#d0c8b8");   // painter cap
        thk(g, hand[0], hand[1], sx0 + 10, ry + 8, 2, "#c0c6d0");
        bx3(g, sx0 + 8, ry, 8, 18, rc, "#ffffff", "rgba(0,0,0,.4)"); R(g, sx0 + 16, ry + 6, 2, 6, "#c0c6d0");
        if (look) { OT(g, "?", px + 18, feet - 86 - Math.round(PX.p(t, Q, 0.3, "back") * 4), { size: 16, col: "#f7c948" }); }
      }
      // passer-by on a phone, ignoring all of it
      {
        const T0 = 1.5 * sc, T1 = T0 + 6.5 * sc, kk = (t - T0) / (T1 - T0);
        if (kk > 0 && kk < 1) { const x = 700 - kk * 780; guy(g, x, 352, t, { shirt: ["#6a7a9a", "#4a5878", "#323c56"], pants: ["#2a2e3a", "#20232c", "#16181e"], hair: ["#1a1410", "#100c08"], expr: "flat", look: [-2, 3], bob: Math.abs(Math.sin(t * 8)) * -2, arms: { l: [x - 7, 306], r: [x - 3, 307] }, seed: 3 });
          R(g, x - 8, 304, 7, 5, "#1a1c24"); R(g, x - 7, 305, 5, 3, "#5fe3e8"); PX.glow(g, x - 5, 300, 14, "rgba(95,227,232,.45)", 1); }
      }
      PX.vignette(g, 0.55);
    };
  };

  // ======================= blueprint_build =======================
  // workshop table under a pendant lamp: a hand lifts a generic phone onto a blueprint, it explodes into labelled parts
  // (UI, NETWORK, STORAGE, LOGIC), each with a little animated detail. o.lift (0.2), o.boom (1.8), o.labels (2.4), o.title (5.5)
  K.blueprint_build = (o) => {
    const phoneUI = (g, x, y, w, h, t) => {
      R(g, x, y, w, h, "#0e1a2a"); R(g, x, y, w, 6, "#2a7a8a"); R(g, x + 2, y + 2, 10, 2, "#bff8ff");
      const nc = Math.max(1, Math.min(3, Math.floor((h - 15) / 13)));
      for (let i = 0; i < nc; i++) { bx3(g, x + 3, y + 9 + i * 13, w - 6, 10, "#1a2c44", "#2a4462", "#101c2c"); R(g, x + 5, y + 11 + i * 13, 6, 6, ["#f25ca8", "#f7c948", "#3df56b"][i]); R(g, x + 13, y + 12 + i * 13, w - 20, 1, "#7a9ac0"); R(g, x + 13, y + 15 + i * 13, (w - 20) / 2, 1, "#4a6a90"); }
      R(g, x, y + h - 7, w, 7, "#16243a"); for (let i = 0; i < 3; i++) R(g, x + 5 + i * ((w - 10) / 2.4), y + h - 5, 4, 3, i === Math.floor(t * 1.5) % 3 ? "#5fe3e8" : "#3a5070");
    };
    const phone = (g, cx, cy, t) => {
      const w = 40, h = 74, x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
      R(g, x + 3, y + 3, w, h, "rgba(0,0,0,.4)");
      R(g, x, y + 1, w, h - 2, "#1b1e27"); R(g, x + 1, y, w - 2, h, "#1b1e27"); R(g, x + 1, y, 1, h, "#4a505c"); R(g, x + 1, y, w - 2, 1, "#4a505c"); R(g, x + w - 2, y + 1, 1, h - 2, "#0c0d12");
      phoneUI(g, x + 3, y + 6, w - 6, h - 12, t); R(g, x + 15, y + 2, 10, 2, "#0c0d12");
    };
    const PARTS = [
      { name: "UI", tx: 214, ty: 110, lx: -1 }, { name: "NETWORK", tx: 428, ty: 110, lx: 1 },
      { name: "STORAGE", tx: 214, ty: 204, lx: -1 }, { name: "LOGIC", tx: 428, ty: 204, lx: 1 },
    ];
    const drawPart = (g, i, x, y, t, lt) => {
      x = Math.round(x); y = Math.round(y);
      if (i === 0) {                         // UI layer: screen with a tapping cursor
        R(g, x - 26, y - 22, 52, 44, "#9ac0f0"); R(g, x - 25, y - 21, 50, 42, "#0e1a2a"); phoneUI(g, x - 23, y - 19, 46, 38, t);
        const tap = frac(lt * 0.8), bx = x - 18, by = y - 10 + 13 * (Math.floor(lt * 0.8) % 2);
        if (tap < 0.25) { PX.box(g, bx - 3, by - 2, 46, 14, "#5fe3e8"); PX.glow(g, bx + 20, by + 5, 20, "rgba(95,227,232,.5)", 1); }
        PX.sprite(g, ["#....", "##...", "#w#..", "#ww#.", "#www#", "#ww##", "##.#."], bx + 30, by + 3 + (tap < 0.25 ? 1 : 0), { "#": "#0b0d14", w: "#e8f1f2" });
      } else if (i === 1) {                  // network: antenna + pulsing waves
        bx3(g, x - 16, y + 6, 32, 14, "#2a3a58", "#4a6a98", "#16203a"); for (let k = 0; k < 3; k++) R(g, x - 10 + k * 8, y + 12, 4, 3, PX.blink(t + k * 0.3, 0.6) ? "#3df56b" : "#1a5a2a");
        R(g, x - 1, y - 18, 3, 24, "#9aa4b2"); R(g, x - 1, y - 18, 1, 24, "#d8e0ea"); PX.circle(g, x, y - 20, 3, "#ff5c5c");
        for (let k = 0; k < 3; k++) { const r = 8 + frac(lt * 0.9 + k / 3) * 26, a = 1 - (r - 8) / 26; g.globalAlpha = a; arc(g, x, y - 20, r, -Math.PI * 0.8, -Math.PI * 0.2, "#5fe3e8"); g.globalAlpha = 1; }
      } else if (i === 2) {                  // storage: disk stack with a fill bar
        for (let k = 2; k >= 0; k--) { const yy = y + 8 - k * 9; R(g, x - 18, yy - 4, 36, 8, "#2a5a8a"); ell(g, x, yy + 4, 18, 3, "#1e4670"); ell(g, x, yy - 4, 18, 3, "#4a8ac8"); R(g, x - 18, yy - 4, 2, 8, "#5a9ad8"); }
        const fill = 0.5 + 0.4 * Math.sin(lt * 1.6);
        R(g, x + 24, y - 20, 6, 32, "#101c2c"); R(g, x + 25, y - 19 + Math.round(30 * (1 - fill)), 4, Math.round(30 * fill), "#3df56b"); PX.circle(g, x - 14, y + 14, 1, PX.blink(t, 0.3) ? "#f7c948" : "#5a4a20");
      } else {                               // logic: CPU chip with a turning gear and pulses on the traces
        for (let k = 0; k < 5; k++) { R(g, x - 13 + k * 6, y - 20, 2, 5, "#c0c6d0"); R(g, x - 13 + k * 6, y + 15, 2, 5, "#c0c6d0"); R(g, x - 20, y - 13 + k * 6, 5, 2, "#c0c6d0"); R(g, x + 15, y - 13 + k * 6, 5, 2, "#c0c6d0"); }
        bx3(g, x - 15, y - 15, 30, 30, "#2a2e38", "#4a505c", "#16181e");
        gear(g, x, y, 9, 8, lt * 2.2, "#f7c948", "#ffe8a0", "#a87a20", "#2a2e38");
        for (let k = 0; k < 2; k++) { const p = frac(lt * 1.2 + k / 2), tx = x + 20 + p * 22; R(g, x + 20, y - 7 + k * 12, 22, 1, "#2c5596"); R(g, tx, y - 8 + k * 12, 3, 3, "#5fe3e8"); }
      }
    };
    return (g, t, d, c) => {
      const sc = d / 9.4, L0 = def(o.lift, 0.2 * sc), L1 = L0 + 1.0, BOOM = def(o.boom, 1.8 * sc), LAB = def(o.labels, 2.4 * sc), TIT = def(o.title, 5.5 * sc);
      // wall + window + pegboard
      PX.vgrad(g, 0, 0, 640, 270, "1c1a32", "100f1e", 9);
      PX.par(g, c, 0.4, () => nightWindow(g, 22, 40, 84, 96, t, 21, "#2b2a40"));
      PX.par(g, c, 0.55, () => {
        R(g, 128, 18, 500, 232, "#2a2436"); R(g, 128, 18, 500, 1, "#3e3650");
        for (let y = 24; y < 248; y += 8) for (let x = 134; x < 626; x += 8) R(g, x, y, 1, 1, "#18141f");
        // hanging tools (desaturated)
        R(g, 520, 40, 4, 44, "#5a4a3a"); R(g, 510, 34, 24, 10, "#6a6e78"); R(g, 510, 34, 24, 1, "#8a8e98");        // hammer
        thk(g, 560, 40, 568, 100, 4, "#6a6e78"); PX.circle(g, 558, 38, 6, "#6a6e78"); PX.circle(g, 558, 38, 2, "#2a2436");   // wrench
        poly(g, [[586, 40], [612, 40], [612, 96], [590, 70]], "#5a5e68"); R(g, 584, 32, 12, 10, "#5a3a2a");             // saw
        PX.circle(g, 150, 60, 10, "#8a7a30"); PX.circle(g, 150, 60, 4, "#2a2436");                                        // tape
        for (let k = 0; k < 5; k++) R(g, 172 + k * 6, 40, 3, 22 - k * 3, ["#7a4a3a", "#3a5a7a", "#5a7a3a", "#7a6a3a", "#5a3a6a"][k]);
      });
      // pendant lamp (sways a little)
      const sway = Math.sin(t * 1.1) * 2, LX = 304 + sway;
      PX.line(g, 304, 0, LX, 16, "#3a3f4b");
      g.globalAlpha = 0.05; poly(g, [[LX - 24, 32], [LX + 24, 32], [LX + 170, 270], [LX - 170, 270]], "#ffe0a0"); g.globalAlpha = 1;
      PX.glow(g, LX, 150, 260, "rgba(255,200,120,0.26)", 1);
      // drafting board + blueprint
      bx3(g, 138, 44, 364, 222, "#6a4a30", "#9a7048", "#3a2414");
      const BX = 146, BY = 52, BW = 348, BH = 206;
      R(g, BX, BY, BW, BH, "#19346a");
      for (let x = BX; x < BX + BW; x += 8) R(g, x, BY, 1, BH, (x - BX) % 40 === 0 ? "#284e8c" : "#1f3d76");
      for (let y = BY; y < BY + BH; y += 8) R(g, BX, y, BW, 1, (y - BY) % 40 === 0 ? "#284e8c" : "#1f3d76");
      { const ch = "rgba(170,205,250,.32)";   // chalk annotations
        R(g, BX + 330, BY + 30, 1, 150, ch); for (const yy of [BY + 30, BY + 179]) { R(g, BX + 327, yy, 7, 1, ch); } R(g, BX + 329, BY + 32, 3, 2, ch); R(g, BX + 329, BY + 176, 3, 2, ch);
        T(g, "74", BX + 334, BY + 98, { font: "v", size: 10, col: ch });
        arc(g, BX + 34, BY + 176, 12, 0, 6.283, ch); R(g, BX + 20, BY + 176, 28, 1, ch); R(g, BX + 34, BY + 162, 1, 28, ch); T(g, "r=4", BX + 50, BY + 178, { font: "v", size: 10, col: ch });
        R(g, BX + 20, BY + 24, 60, 1, ch); R(g, BX + 20, BY + 30, 44, 1, ch); R(g, BX + 20, BY + 36, 52, 1, ch);
        for (let k = 0; k < 5; k++) R(g, BX + 150 + k * 10, BY + 194, 6, 1, ch); }
      PX.box(g, BX + 5, BY + 5, BW - 10, BH - 10, "#6a94d0");
      R(g, BX + BW - 84, BY + BH - 28, 78, 22, "#1c3a72"); PX.box(g, BX + BW - 84, BY + BH - 28, 78, 22, "#6a94d0"); R(g, BX + BW - 84, BY + BH - 17, 78, 1, "#6a94d0");
      T(g, "APP v0.1", BX + BW - 80, BY + BH - 28, { font: "v", size: 12, col: "#9ac0f0" }); T(g, "SHEET 1/1", BX + BW - 80, BY + BH - 17, { font: "v", size: 10, col: "#6a94d0" });
      for (const [px, py] of [[BX + 4, BY + 4], [BX + BW - 6, BY + 4], [BX + 4, BY + BH - 6], [BX + BW - 6, BY + BH - 6]]) { PX.circle(g, px, py, 2, "#d84040"); R(g, px - 1, py - 1, 1, 1, "#ff9a9a"); }
      // faint chalk sketch of a phone in the middle (the plan)
      PX.box(g, 300, 112, 40, 74, "rgba(154,192,240,.25)");
      // lamp shade on top of the light
      poly(g, [[LX - 12, 14], [LX + 12, 14], [LX + 28, 32], [LX - 28, 32]], "#2b3a44"); poly(g, [[LX - 12, 14], [LX + 12, 14], [LX + 13, 16], [LX - 13, 16]], "#5a7080");
      R(g, LX - 26, 32, 52, 2, "#ffd890"); PX.glow(g, LX, 36, 34, "rgba(255,230,160,.8)", 1);
      // ---- phone lifted in, then exploded ----
      const ghost = t >= BOOM;
      if (ghost) {
        for (let y = 112; y < 186; y += 4) { R(g, 300, y, 1, 2, "#b8d4ff"); R(g, 339, y, 1, 2, "#b8d4ff"); }
        for (let x = 300; x < 340; x += 4) { R(g, x, 112, 2, 1, "#b8d4ff"); R(g, x, 185, 2, 1, "#b8d4ff"); }
      }
      if (t >= BOOM) {
        PARTS.forEach((pt, i) => {
          const k = PX.p(t, BOOM + i * 0.06, 0.6, "back"), x = PX.lerp(320, pt.tx, k), y = PX.lerp(150, pt.ty, k);
          const n = 24; for (let s = 0; s < n; s += 2) { const a = s / n, b = (s + 1) / n; if (a > k) break; PX.line(g, PX.lerp(320, x, a), PX.lerp(150, y, a), PX.lerp(320, x, b), PX.lerp(150, y, b), "rgba(184,212,255,.7)"); }
          drawPart(g, i, x, y, t, t - BOOM);
          if (t >= LAB + i * 0.25) {
            const s = PX.typed(pt.name, t, LAB + i * 0.25, 18), lx = pt.lx < 0 ? pt.tx - 34 : pt.tx + 34, ly = pt.ty - 34;
            OT(g, s, lx, ly, { font: "v", size: 16, col: "#e0ecff", outline: "#10244a", align: pt.lx < 0 ? "right" : "left" });
          }
        });
        // screws flying out and bouncing
        for (let i = 0; i < 6; i++) { const dt = t - BOOM, vx = (i - 2.5) * 28, x = 320 + vx * Math.min(dt, 1.2), fl = 150 + 120 * Math.min(dt, 1.2) * Math.min(dt, 1.2) * 2 - 60 * Math.min(dt, 1.2);
          const y = Math.min(fl, 262 - Math.abs(Math.sin(dt * 9)) * 6 * Math.max(0, 1 - dt)); R(g, x, y, 2, 2, "#c0c6d0"); R(g, x, y, 1, 1, "#ffffff"); }
        if (t - BOOM < 0.4) { const k = (t - BOOM) / 0.4; PX.glow(g, 320, 150, 60 + 60 * k, `rgba(190,220,255,${0.9 * (1 - k)})`, 1); for (let i = 0; i < 8; i++) { const a = i * 0.785; spark(g, 320 + Math.cos(a) * 50 * k, 150 + Math.sin(a) * 40 * k, 2, "#e0ecff"); } }
      } else if (t >= L0) {
        const k = PX.p(t, L0, L1 - L0, "back"), py = PX.lerp(420, 150, k), out = PX.ease((t - (BOOM - 0.35)) / 0.35, "in");
        phone(g, 320, py, t);
        // the hand: sleeve + palm + fingers wrapped on the sides
        const hy = py + 30 + out * 140;
        R(g, 300, hy + 14, 40, 120, "#3a4a7a"); R(g, 300, hy + 14, 3, 120, "#5262a0"); R(g, 337, hy + 14, 3, 120, "#26305a");
        R(g, 302, hy - 2, 36, 18, "#d9a070"); R(g, 302, hy - 2, 36, 2, "#f2c9a0"); R(g, 336, hy, 2, 16, "#a86b44");
        for (let f = 0; f < 3; f++) { R(g, 296, hy - 12 + f * 6, 7, 5, "#d9a070"); R(g, 296, hy - 12 + f * 6, 7, 1, "#f2c9a0"); }
        R(g, 337, hy - 14, 6, 14, "#d9a070"); R(g, 341, hy - 14, 2, 14, "#a86b44");
      }
      // title tape strip
      if (t >= TIT) {
        const k = PX.p(t, TIT, 0.45, "back"), y = PX.lerp(-30, 60, k), x0 = 222, w = 196;
        R(g, x0 + 3, y + 3, w, 16, "rgba(0,0,0,.35)");
        R(g, x0, y, w, 16, "#d8c79a"); R(g, x0, y, w, 1, "#efe2bc"); R(g, x0, y + 15, w, 1, "#b0a070");
        for (let i = 0; i < 16; i += 2) { R(g, x0 - 2, y + i, 2, 1, "#d8c79a"); R(g, x0 + w, y + i + 1, 2, 1, "#d8c79a"); }
        T(g, "BUILD YOUR OWN VERSION", 320, y + 4, { size: 8, col: "#3a2a14", align: "center" });
      }
      // table
      R(g, 0, 264, 640, 16, "#6a4a30"); R(g, 0, 264, 640, 2, "#9a7048"); R(g, 0, 278, 640, 2, "#3a2414");
      R(g, 0, 280, 640, 80, "#24180f"); for (let x = 0; x < 640; x += 80) R(g, x, 280, 1, 80, "#1a1009"); bx3(g, 240, 296, 160, 34, "#2c1e14", "#3e2c1e", "#160e08"); R(g, 304, 310, 32, 4, "#8a6a48");
      PX.glow(g, 320, 272, 200, "rgba(255,200,120,0.16)", 1);
      // table props
      R(g, 40, 268, 80, 6, "#d8b040"); for (let k = 0; k < 16; k++) R(g, 42 + k * 5, 268, 1, k % 2 ? 2 : 4, "#5a4410");
      if (core().mug) core().mug(g, 130, 256, t);
      thk(g, 170, 272, 214, 266, 2, "#f7c948"); R(g, 212, 265, 3, 3, "#f2c9a0");
      bx3(g, 520, 232, 84, 34, "#a83232", "#d05050", "#5a1a1a"); R(g, 520, 244, 84, 2, "#5a1a1a"); R(g, 548, 224, 28, 4, "#2a2e38"); R(g, 548, 224, 2, 10, "#2a2e38"); R(g, 574, 224, 2, 10, "#2a2e38");
      thk(g, 452, 270, 492, 262, 3, "#4a6ab0"); thk(g, 492, 262, 506, 259, 1, "#c0c6d0");
      PX.particles(g, 61, 30, t, [180, 40, 280, 220], { vy: -3, vx: 1.5, col: "#ffe2b0", a: 0.55 });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= diy_bench =======================
  // long maker workbench, camera pans across 4 stations revealed at o.at [0.4, 3.0, 5.6, 8.2]:
  // HASH MAP, REGEX, INTERPRETER, WEB SERVER. At o.worse (10.5) everything gets wobbly: duct tape, smoke, sign.
  K.diy_bench = (o) => {
    const NAMES = ["HASH MAP", "REGEX", "INTERPRETER", "WEB SERVER"], STN = [300, 580, 860, 1140];
    const KEYS = [["cat", 2], ["dog", 5], ["ana", 0], ["zip", 3], ["bob", 1], ["sun", 4]];
    const TAPE = "the cat sat on a cot by the cut ";
    const tag = (g, x, y, s) => { R(g, x, y, 20, 10, "#d8cfb0"); R(g, x, y, 20, 1, "#efe6c8"); R(g, x, y + 9, 20, 1, "#a89e80"); R(g, x + 2, y + 4, 2, 2, "#5a5040"); T(g, s, x + 6, y - 1, { font: "v", size: 10, col: "#2a2418" }); };
    const devs = [
      (g, x, t, lt) => {          // HASH MAP
        bx3(g, x - 92, 184, 184, 52, "#6a4a30", "#9a7048", "#3a2414");
        for (let s = 0; s < 6; s++) { const sx = x - 86 + s * 29; R(g, sx, 196, 26, 36, "#1e140c"); R(g, sx, 196, 26, 2, "#120a06"); T(g, String(s), sx + 13, 185, { font: "v", size: 10, col: "#f2d8a8", align: "center" }); }
        poly(g, [[x - 26, 108], [x + 26, 108], [x + 9, 128], [x - 9, 128]], "#5a6070"); poly(g, [[x - 26, 108], [x + 26, 108], [x + 25, 110], [x - 25, 110]], "#9aa0b0");
        bx3(g, x - 30, 128, 60, 30, "#3a4a66", "#5a6a8a", "#1e2a3e"); R(g, x - 24, 134, 32, 12, "#0a1420");
        let cur = -1; KEYS.forEach(([k, s], j) => { const st = 0.3 + j * 0.9; if (lt >= st && lt < st + 1.0) cur = j; });
        const spin = cur >= 0 ? lt * 9 : lt * 1.5;
        gear(g, x + 18, 143, 8, 7, spin, "#f7c948", "#ffe8a0", "#a87a20", "#3a4a66");
        T(g, cur >= 0 && lt - (0.3 + cur * 0.9) > 0.35 ? "h=" + KEYS[cur][1] : "hash", x - 8, 133, { font: "v", size: 12, col: "#5fe3e8", align: "center" });
        KEYS.forEach(([k, s], j) => {
          const st = 0.3 + j * 0.9, u = lt - st; if (u < 0) return;
          const sx = x - 86 + s * 29 + 3;
          if (u < 0.35) { const kk = PX.ease(u / 0.35, "in"); tag(g, x - 10, PX.lerp(70, 116, kk), k); }
          else if (u < 0.6) { }
          else if (u < 1.0) { const kk = PX.ease((u - 0.6) / 0.4, "out"); tag(g, PX.lerp(x - 10, sx, kk), PX.lerp(160, 214, kk) - Math.sin(kk * Math.PI) * 14, k); }
          else { tag(g, sx, 214, k); if (u < 1.3) { PX.glow(g, sx + 10, 214, 20, "rgba(61,245,107,.7)", 1); } }
        });
      },
      (g, x, t, lt) => {          // REGEX
        for (const sx of [x - 92, x + 92]) { PX.circle(g, sx, 199, 15, "#3a2e22"); PX.circle(g, sx, 199, 13, "#c4b48e"); PX.circle(g, sx, 199, 5, "#5a4a36");
          for (let k = 0; k < 3; k++) { const a = lt * 3 + k * 2.09; R(g, sx + Math.cos(a) * 9 - 1, 199 + Math.sin(a) * 9 - 1, 2, 2, "#5a4a36"); } R(g, sx - 2, 214, 4, 22, "#4a505c"); }
        R(g, x - 92, 192, 184, 14, "#d8cfb0"); R(g, x - 92, 192, 184, 1, "#efe6c8"); R(g, x - 92, 205, 184, 1, "#a89e80");
        const cw = PX.tw(g, TAPE, { font: "v", size: 12 }), off = (lt * 22) % cw, tx0 = x - 92 - off;
        g.save(); g.beginPath(); g.rect(x - 92, 192, 184, 14); g.clip();
        for (let rep = 0; rep < 3; rep++) {
          const bx = tx0 + rep * cw;
          let idx = 0; for (const w of TAPE.split(" ")) {
            const wx = bx + PX.tw(g, TAPE.slice(0, idx), { font: "v", size: 12 }), ww = PX.tw(g, w, { font: "v", size: 12 });
            if (/^c.t$/.test(w) && wx + ww < x - 8) { R(g, wx - 1, 194, ww + 2, 10, "#f7c948"); }
            idx += w.length + 1;
          }
          T(g, TAPE, bx, 192, { font: "v", size: 12, col: "#2a2418" });
        }
        g.restore();
        bx3(g, x - 22, 158, 44, 30, "#2a3a58", "#4a6a98", "#16203a"); bx3(g, x - 22, 208, 44, 26, "#2a3a58", "#4a6a98", "#16203a");
        R(g, x - 10, 186, 20, 24, "rgba(95,227,232,.18)"); PX.box(g, x - 10, 186, 20, 24, "#5fe3e8"); PX.glow(g, x, 198, 24, "rgba(95,227,232,.4)", 1);
        R(g, x - 34, 132, 68, 22, "#0a1420"); PX.box(g, x - 34, 132, 68, 22, "#4a6a98"); T(g, "/c.t/", x, 134, { font: "v", size: 20, col: "#f7c948", align: "center" });
        R(g, x - 2, 154, 4, 4, "#4a6a98");
        PX.circle(g, x + 15, 166, 2, PX.blink(lt, 0.7, 0.3) ? "#3df56b" : "#1a4a2a");
      },
      (g, x, t, lt) => {          // INTERPRETER
        R(g, x - 104, 214, 116, 8, "#1a1c24"); for (let k = 0; k < 14; k++) R(g, x - 104 + ((k * 9 + lt * 30) % 116), 214, 3, 8, "#2a2e38");
        for (const rx of [x - 104, x + 10]) { PX.circle(g, rx, 218, 5, "#4a505c"); const a = lt * 6; R(g, rx + Math.cos(a) * 3 - 1, 218 + Math.sin(a) * 3 - 1, 2, 2, "#9aa4b2"); }
        R(g, x - 96, 222, 3, 14, "#3a3f4b"); R(g, x, 222, 3, 14, "#3a3f4b");
        const BL = [["print", "#f25ca8"], ["let", "#5fe3e8"], ["if", "#f7c948"]];
        for (let j = 0; j < 4; j++) { const ph = frac(lt / 3.0 + j / 3), bx = x - 110 + ph * 3 * 46, b = BL[(Math.floor(lt / 3.0 + j / 3) + j) % 3 === 0 ? j % 3 : j % 3];
          if (bx > x + 4 || bx < x - 112) continue; bx3(g, bx, 199, 34, 15, b[1], "#ffffff", "rgba(0,0,0,.45)"); T(g, b[0], bx + 17, 199, { font: "v", size: 12, col: "#14121c", align: "center" }); }
        const thump = Math.round(Math.max(0, Math.sin(lt * 6.28 / 1.0)) * 1);
        const my = 150 - thump;
        bx3(g, x + 8, my, 84, 86 + thump, "#4a5a70", "#6a7a94", "#2a3444"); R(g, x + 8, my + 46, 12, 22, "#14161e");
        for (const [rx, ry] of [[x + 12, my + 4], [x + 86, my + 4], [x + 12, my + 80], [x + 86, my + 80]]) R(g, rx, ry, 2, 2, "#9aa4b2");
        R(g, x + 58, my - 22, 14, 22, "#3a4250"); R(g, x + 56, my - 24, 18, 4, "#5a6270");
        R(g, x + 22, my + 10, 60, 26, "#05111a"); PX.box(g, x + 22, my + 10, 60, 26, "#2a3444");
        const outs = ["> 42", "> hi", "> True"]; T(g, outs[Math.floor(lt / 1.0) % 3], x + 26, my + 12, { font: "v", size: 12, col: "#3df56b" });
        if (PX.blink(lt, 0.6)) R(g, x + 26, my + 26, 5, 2, "#3df56b");
        PX.circle(g, x + 76, my + 54, 7, "#c4bc9c"); PX.circle(g, x + 76, my + 54, 5, "#e0d8b8"); const na = -2.4 + 1.6 * (0.5 + 0.5 * Math.sin(lt * 3)); thk(g, x + 76, my + 54, x + 76 + Math.cos(na) * 5, my + 54 + Math.sin(na) * 5, 1, "#d84040");
        PX.circle(g, x + 40, my + 54, 3, PX.blink(lt, 1.0, 0.2) ? "#f7c948" : "#5a4a20");
        smoke(g, x + 65, my - 26, lt, 4, "#8a8e98", 26, 0.35);
      },
      (g, x, t, lt) => {          // WEB SERVER
        const cyc = frac(lt / 1.8), ph = cyc * 1.8;
        bx3(g, x - 90, 156, 52, 80, "#2a2e38", "#4a505c", "#16181e");
        for (let k = 0; k < 5; k++) { R(g, x - 84, 164 + k * 12, 40, 8, "#1a1d24"); R(g, x - 80, 167 + k * 12, 3, 2, (ph > 0.6 && ph < 0.85) || PX.blink(lt + k * 0.37, 0.5, 0.4) ? "#3df56b" : "#1a4a2a"); R(g, x - 72, 167 + k * 12, 22, 1, "#2a2e38"); }
        T(g, "SERVER", x - 64, 222, { font: "v", size: 10, col: "#7a8294", align: "center" });
        bx3(g, x + 14, 150, 92, 64, "#1b1e27", "#3a3f4b", "#0c0d12"); R(g, x + 56, 214, 8, 12, "#1b1e27"); R(g, x + 44, 226, 32, 4, "#22252d");
        R(g, x + 18, 154, 84, 56, "#a4aebe"); R(g, x + 18, 154, 84, 8, "#6a7484"); R(g, x + 20, 156, 4, 4, "#ff5f57"); R(g, x + 26, 156, 4, 4, "#febc2e");
        R(g, x + 20, 164, 80, 8, "#c4ccd8"); T(g, "localhost:8000", x + 22, 163, { font: "v", size: 10, col: "#4a505c" });
        if (ph > 1.3 || ph < 0.05) { const k = PX.p(ph > 1.3 ? ph : ph + 1.8, 1.3, 0.25, "back"); T(g, "HELLO", x + 60, 184 - Math.round((1 - k) * 4), { size: 8, col: "#1f9a4a", align: "center" }); }
        else for (let k = 0; k < 3; k++) R(g, x + 52 + k * 6, 188, 3, 3, k === Math.floor(lt * 4) % 3 ? "#5a606c" : "#b0b8c4");
        // cable + packets
        R(g, x - 38, 232, 98, 2, "#1a1c24");
        if (ph < 0.6) { const k = ph / 0.6, px = PX.lerp(x + 58, x - 40, k); R(g, px - 5, 225, 10, 7, "#d8cfb0"); PX.line(g, px - 5, 225, px, 229, "#8a8068"); PX.line(g, px + 4, 225, px, 229, "#8a8068"); }
        else if (ph > 0.8 && ph < 1.3) { const k = (ph - 0.8) / 0.5, px = PX.lerp(x - 40, x + 58, k); R(g, px - 6, 224, 12, 8, "#3df56b"); PX.glow(g, px, 228, 12, "rgba(61,245,107,.6)", 1); }
      },
    ];
    return (g, t, d, c) => {
      const sc = d / 16.4, AT = o.at || [0.4, 3.0, 5.6, 8.2].map((v) => v * sc), W = def(o.worse, 10.5 * sc);
      const KS = [[0, 0], [AT[1] - 0.9, 0], [AT[1] - 0.05, 260], [AT[2] - 0.9, 260], [AT[2] - 0.05, 540], [AT[3] - 0.9, 540], [AT[3] - 0.05, 820], [W + 1.2, 820], [d - 0.4, 100]];
      for (let i = 1; i < KS.length; i++) KS[i][0] = Math.max(KS[i][0], KS[i - 1][0] + 0.05);   // keep keyframes ordered on short shots
      const P = PX.KF(KS, t);
      const worse = t >= W;
      // far wall + windows
      PX.vgrad(g, 0, 0, 640, 240, "191a32", "0f0f1e", 9);
      const Pw = P * 0.4; for (let wx = 60; wx < 1200; wx += 300) { const x = wx - Pw; if (x > -120 && x < 700) nightWindow(g, x, 26, 96, 70, t, 30 + wx, "#2a2a40"); }
      // mid: shelves with jars and boxes
      const Pm = P * 0.7;
      for (let sx = 200; sx < 1500; sx += 240) {
        const x = sx - Pm; if (x < -140 || x > 760) continue;
        R(g, x, 118, 120, 4, "#4a3626"); R(g, x, 118, 120, 1, "#6a4a34"); R(g, x + 6, 122, 3, 8, "#2a1e14"); R(g, x + 110, 122, 3, 8, "#2a1e14");
        const r = PX.rnd(sx); for (let k = 0; k < 6; k++) { const h = 8 + Math.floor(r() * 12), w = 10 + Math.floor(r() * 8), col = ["#3a4a6a", "#5a3a3a", "#3a5a4a", "#6a5a3a"][k % 4]; bx3(g, x + 6 + k * 18, 118 - h, w, h, col, mix(col.slice(1), "ffffff", 0.2), mix(col.slice(1), "000000", 0.4)); }
      }
      // bench
      R(g, 0, 236, 640, 14, "#7a5638"); R(g, 0, 236, 640, 2, "#a07a52"); R(g, 0, 248, 640, 2, "#4a3020");
      R(g, 0, 250, 640, 46, "#3a2618"); R(g, 0, 250, 640, 1, "#4a3220"); R(g, 0, 296, 640, 64, "#120c09"); R(g, 0, 296, 640, 3, "#0a0705");
      for (let lx = 40; lx < 1500; lx += 280) { const x = lx - P; if (x > -20 && x < 660) { R(g, x, 296, 10, 50, "#2a1c12"); R(g, x, 296, 2, 50, "#3a2818"); } }
      R(g, 0, 318, 640, 6, "#2e1e14"); R(g, 0, 318, 640, 1, "#4a3220");
      for (let bx = 100; bx < 1500; bx += 190) { const x = bx - P; if (x > -60 && x < 700) { bx3(g, x, 300, 44, 18, "#5a4a30", "#7a6a48", "#3a2e1a"); bx3(g, x + 50, 306, 30, 12, "#3a3f4b", "#5a606c", "#1a1d24"); } }
      R(g, 0, 346, 640, 14, "#100c0a");
      // stations
      for (let i = 0; i < 4; i++) {
        const x = STN[i] - P; if (x < -230 || x > 870) continue;
        const lt = t - AT[i], on = lt >= 0;
        // clamp lamp
        R(g, x - 70, 0, 3, 70, "#2a2e38"); thk(g, x - 69, 70, x - 40, 84, 3, "#2a2e38");
        poly(g, [[x - 50, 78], [x - 30, 80], [x - 22, 96], [x - 56, 92]], "#3a4250"); poly(g, [[x - 50, 78], [x - 30, 80], [x - 29, 82], [x - 50, 80]], "#6a7480");
        const flick = on && lt < 0.5 ? PX.blink(lt, 0.1, 0.5) : on;
        if (flick) { R(g, x - 54, 92, 30, 2, "#ffe0a0"); PX.glow(g, x - 38, 96, 30, "rgba(255,230,160,.8)", 1); PX.glow(g, x, 190, 150, "rgba(255,200,120,.26)", 1); g.globalAlpha = 0.05; poly(g, [[x - 54, 94], [x - 24, 94], [x + 110, 236], [x - 130, 236]], "#ffe0a0"); g.globalAlpha = 1; }
        // nameplate
        bx3(g, x - 56, 258, 112, 16, on ? "#b08a3a" : "#5a4a2a", on ? "#e0c070" : "#6a5a3a", "#4a3418");
        T(g, NAMES[i], x, 262, { size: 8, col: on ? "#2a1a08" : "#3a2e1a", align: "center" });
        // device (wobbly when worse)
        const wob = worse ? [Math.round(Math.sin(t * 17 + i * 2) * 1.6), Math.round(Math.sin(t * 23 + i) * 1)] : [0, 0];
        g.save(); g.translate(wob[0], wob[1]);
        if (on) devs[i](g, x, t, lt);
        // dust cover flying off at reveal
        if (lt < 0.7) {
          const k = on ? PX.ease(lt / 0.7, "in") : 0, up = k * 220, a = 1 - k;
          g.globalAlpha = a; poly(g, [[x - 104, 236 - up], [x + 104, 236 - up], [x + 84, 110 - up * 1.2], [x + 20, 98 - up * 1.3], [x - 70, 108 - up * 1.1]], "#46444e");
          for (let f = 0; f < 5; f++) { PX.line(g, x - 70 + f * 36, 112 - up * 1.15, x - 90 + f * 44, 236 - up, "#2e2c36"); PX.line(g, x - 68 + f * 36, 112 - up * 1.15, x - 88 + f * 44, 236 - up, "#5a5864"); }
          poly(g, [[x - 70, 108 - up * 1.1], [x + 20, 98 - up * 1.3], [x + 84, 110 - up * 1.2], [x + 80, 116 - up * 1.2], [x - 66, 114 - up * 1.1]], "#64626e");
          R(g, x - 104, 233 - up, 208, 3, "#4a4850"); g.globalAlpha = 1;
          if (on) PX.particles(g, 70 + i, 14, t, [x - 110, 180, 220, 60], { vy: -20, vx: 6, col: "#a8a4b0", a: 0.7 * (1 - k) });
        }
        // worse: duct tape + smoke + fire/sparks
        if (worse && on) {
          const tk = PX.p(t, W + i * 0.15, 0.25, "back");
          if (t >= W + i * 0.15) {
            const tape = (x1, y1, x2, y2) => { thk(g, x1, y1, PX.lerp(x1, x2, tk), PX.lerp(y1, y2, tk), 6, "#7a7a84"); thk(g, x1, y1 - 2, PX.lerp(x1, x2, tk), PX.lerp(y1, y2, tk) - 2, 1, "#a8a8b2"); };
            const TP = [[[-70, 196, -44, 206], [-40, 210, -16, 204], [30, 150, 52, 166]], [[-30, 170, -6, 178], [8, 214, 30, 222], [60, 196, 88, 200]], [[14, 168, 40, 160], [60, 200, 84, 212], [-60, 214, -36, 220]], [[-84, 176, -60, 190], [-50, 210, -30, 216], [40, 190, 66, 180]]][i];
            for (const [a, b, c2, d2] of TP) tape(x + a, b, x + c2, d2);
            PX.line(g, x + TP[0][0] - 4, TP[0][1] - 8, x + TP[0][0] + 6, TP[0][1] + 10, "#0b0d14");
          }
          smoke(g, x - 10 + i * 6, 140, t + i, 6, "#6a6a74", 70, 0.75);
          if (i === 2) for (let f = 0; f < 3; f++) { const fh = 8 + Math.round(Math.abs(Math.sin(t * 13 + f * 2)) * 6); poly(g, [[x + 60 + f * 4 - 4, 126], [x + 60 + f * 4 + 4, 126], [x + 60 + f * 4, 126 - fh]], f === 1 ? "#f7c948" : "#f08a3c"); }
          if (i === 3 || i === 0) for (let s = 0; s < 4; s++) { const k = frac(t * 2.3 + s / 4), r = PX.rnd(s + Math.floor(t * 2.3) * 7); spark(g, x - 60 + r() * 50, 150 - k * 20, 1, "#ffe08a"); }
        }
        g.restore();
      }
      // the sign drops in (screen space) and sways
      if (worse) {
        const k = PX.p(t, W + 0.5, 0.6, "back"), sw = Math.round(Math.sin((t - W) * 2.2) * 5 * Math.exp(-(t - W) * 0.2)), y = PX.lerp(-90, 30, k), x = 320 + sw;
        PX.line(g, 250, -4, x - 100, y + 2, "#c4b48e"); PX.line(g, 390, -4, x + 100, y + 2, "#c4b48e");
        R(g, x - 118 + 3, y + 3, 236, 56, "rgba(0,0,0,.4)");
        R(g, x - 118, y, 236, 56, "#b08a5a"); R(g, x - 118, y, 236, 2, "#c8a474"); R(g, x - 118, y + 54, 236, 2, "#7a5a34"); R(g, x - 118, y, 2, 56, "#c8a474");
        for (let k2 = 0; k2 < 6; k2++) R(g, x - 110 + k2 * 40, y + 8 + (k2 % 3) * 14, 18, 1, "#9a7448");
        T(g, "0 USERS", x, y + 8, { size: 24, col: "#5a1a10", align: "center" });
        T(g, "- THAT'S FINE -", x, y + 38, { size: 8, col: "#3a2410", align: "center" });
        PX.circle(g, x - 100, y + 4, 2, "#5a5e68"); PX.circle(g, x + 100, y + 4, 2, "#5a5e68");
      }
      PX.particles(g, 81, 26, t, [0, 60, 640, 180], { vy: -2, vx: 1, col: "#ffe2b0", a: 0.45 });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= dict_xray =======================
  // a big dict card floats in a lab; at o.xray (2.0) a scanner beam sweeps and reveals the inside: hash gears,
  // bucket array, keys landing in slots ("name" -> 3, "age" -> 6).
  K.dict_xray = (o) => {
    const SEG = [['{', "#c9d1d9"], ['"name"', "#ff9a6a"], [': ', "#8a94a8"], ['"Ana"', "#3df56b"], [', ', "#8a94a8"], ['"age"', "#ff9a6a"], [': ', "#8a94a8"], ['31', "#5fe3e8"], ['}', "#c9d1d9"]];
    const X0 = 140, Y0 = 70, W0 = 360, H0 = 160, SLOT = (s) => X0 + 20 + s * 40;
    return (g, t, d, c) => {
      const XR = def(o.xray, (2.0 * d) / 7.1), SCAN = 1.0, KN = XR + SCAN + 0.5, KA = KN + 1.5;
      const bob = Math.round(Math.sin(t * 1.6) * 2), y0 = Y0 + bob;
      // lab wall with tiles
      PX.vgrad(g, 0, 0, 640, 300, "131c30", "0a0f1e", 9);
      for (let y = 0; y < 300; y += 24) R(g, 0, y, 640, 1, "#0c1222");
      for (let x = 0, k = 0; x < 640; x += 24, k++) R(g, x, 0, 1, 300, "#0c1222");
      // shelves with glowing beakers (far)
      PX.par(g, c, 0.45, () => {
        for (const sx of [16, 516]) {
          for (let s = 0; s < 3; s++) {
            const sy = 70 + s * 64; R(g, sx, sy, 108, 4, "#2a3448"); R(g, sx, sy, 108, 1, "#4a5470");
            for (let b = 0; b < 4; b++) {
              const bx = sx + 8 + b * 26, col = ["#3df56b", "#f25ca8", "#5fe3e8", "#f7c948"][(b + s + (sx > 100 ? 1 : 0)) % 4], h = 14 + ((b * 5 + s * 3) % 10);
              R(g, bx, sy - h, 14, h, "rgba(160,190,220,.15)"); R(g, bx + 1, sy - h * 0.6, 12, h * 0.6, col); R(g, bx, sy - h, 14, 1, "#8a9ab8"); R(g, bx + 4, sy - h - 4, 6, 4, "rgba(160,190,220,.2)");
              PX.glow(g, bx + 7, sy - h * 0.3, 18, rgba(col.slice(1), 0.35), 1);
              for (let q = 0; q < 2; q++) { const k = frac(t * 0.8 + b * 0.3 + q * 0.5); R(g, bx + 4 + q * 4, sy - k * h * 0.6, 1, 1, "#e8f8ff"); }
            }
          }
        }
      });
      // pipes along the top (mid)
      PX.par(g, c, 0.7, () => {
        R(g, 0, 10, 640, 8, "#2a3448"); R(g, 0, 10, 640, 2, "#4a5878"); R(g, 0, 16, 640, 2, "#1a2030");
        for (let x = 40; x < 640; x += 120) { R(g, x, 8, 8, 12, "#3a4660"); R(g, x, 8, 8, 1, "#5a6a8a"); }
        PX.circle(g, 470, 32, 9, "#1a2030"); PX.circle(g, 470, 32, 7, "#c4bc9c"); const na = -1.9 + Math.sin(t * 2.3) * 0.25 + Math.sin(t * 9) * 0.05; thk(g, 470, 32, 470 + Math.cos(na) * 6, 32 + Math.sin(na) * 6, 1, "#d84040"); R(g, 469, 18, 3, 6, "#3a4660");
      });
      // floor
      R(g, 0, 300, 640, 60, "#0e1424"); R(g, 0, 300, 640, 1, "#2a3450");
      for (let x = -40; x < 680; x += 16) poly(g, [[x, 304], [x + 8, 304], [x + 4, 310], [x - 4, 310]], "#c9a83a"); R(g, 0, 304, 640, 0, "#000");
      for (let x = -36; x < 680; x += 16) poly(g, [[x + 4, 304], [x + 12, 304], [x + 8, 310], [x, 310]], "#1a1a20");
      // emitters + beam
      g.globalAlpha = 0.07 + 0.02 * Math.sin(t * 4); poly(g, [[280, 30], [360, 30], [400, 286], [240, 286]], "#5fe3e8"); g.globalAlpha = 1;
      bx3(g, 274, 20, 92, 14, "#2a3448", "#4a5878", "#141a28"); for (let k = 0; k < 5; k++) R(g, 282 + k * 16, 33, 8, 2, PX.blink(t + k * 0.2, 0.8, 0.6) ? "#8af4ff" : "#2a6a7a");
      ell(g, 320, 292, 90, 12, "#141a28"); ell(g, 320, 288, 86, 10, "#2a3448"); ell(g, 320, 286, 80, 8, "#3a4660");
      for (let k = 0; k < 12; k++) { const a = (k / 12) * 6.283 + t; R(g, 320 + Math.cos(a) * 70, 286 + Math.sin(a) * 6, 3, 2, Math.sin(a) > 0 ? "#8af4ff" : "#2a6a7a"); }
      PX.glow(g, 320, 284, 90, "rgba(95,227,232,.35)", 1); PX.glow(g, 320, 150, 220, "rgba(95,227,232,.12)", 1);
      // ---- the card ----
      const scanP = PX.clamp((t - XR) / SCAN, 0, 1), scanX = Math.round(X0 + scanP * W0);
      R(g, X0 + 4, y0 + 6, W0, H0, "rgba(0,0,0,.35)");
      const drawText = (yy, mode) => {
        let lx = 320 - PX.tw(g, SEG.map((s) => s[0]).join(""), { font: "v", size: 24 }) / 2;
        const pos = {};
        for (const [s, col] of SEG) { pos[s] = pos[s] || lx; const w = T(g, s, lx, yy, { font: "v", size: 24, col: mode ? (mode === 1 ? "#2f8a94" : col) : col }); lx += w; }
        return pos;
      };
      // normal face
      R(g, X0, y0, W0, H0, "#15233e"); R(g, X0, y0, W0, 1, "#5fe3e8"); R(g, X0, y0 + H0 - 1, W0, 1, "#2a6a7a"); R(g, X0, y0, 1, H0, "#5fe3e8"); R(g, X0 + W0 - 1, y0, 1, H0, "#2a6a7a");
      for (let k = 0; k < 6; k++) { const sx = X0 + ((k * 70 + t * 40) % (W0 + 80)) - 40; g.globalAlpha = 0.06; poly(g, [[sx, y0 + 46], [sx + 20, y0 + 46], [sx - 20, y0 + H0 - 6], [sx - 40, y0 + H0 - 6]], "#bfe8ff"); } g.globalAlpha = 1;
      R(g, X0 + 10, y0 + 46, W0 - 20, H0 - 56, "rgba(120,160,220,.08)"); PX.box(g, X0 + 10, y0 + 46, W0 - 20, H0 - 56, "#24385a");
      T(g, "?", 320, y0 + 80, { size: 24, col: "#24385a", align: "center" });
      T(g, "type: dict", X0 + 14, y0 + H0 - 18, { font: "v", size: 12, col: "#4a6a90" });
      const tpos = drawText(y0 + 12, 0);
      // x-ray side (left of the scan line)
      if (scanP > 0) {
        g.save(); g.beginPath(); g.rect(X0, y0, scanX - X0, H0); g.clip();
        R(g, X0, y0, W0, H0, "#062226");
        for (let yy = y0; yy < y0 + H0; yy += 3) R(g, X0, yy, W0, 1, "rgba(95,227,232,.05)");
        R(g, X0, y0, W0, 1, "#8af4ff"); R(g, X0, y0, 1, H0, "#8af4ff"); R(g, X0, y0 + H0 - 1, W0, 1, "#2f8a94");
        drawText(y0 + 12, 1);
        // gears = hash function
        const busy = (t > KN + 0.4 && t < KN + 0.9) || (t > KA + 0.4 && t < KA + 0.9), sp = busy ? 12 : 1.2;
        T(g, "hash()", 262, y0 + 54, { font: "v", size: 16, col: "#8af4ff", align: "right" });
        gear(g, 290, y0 + 64, 14, 10, t * sp, "#2fb8c4", "#8af4ff", "#14606a", "#062226");
        gear(g, 314, y0 + 54, 9, 7, -t * sp * 1.55 + 0.3, "#2fb8c4", "#8af4ff", "#14606a", "#062226");
        // bucket array
        for (let s = 0; s < 8; s++) { const sx = SLOT(s); PX.box(g, sx, y0 + 108, 38, 40, "#2f8a94"); R(g, sx + 1, y0 + 109, 36, 1, "#0a3a40"); T(g, String(s), sx + 19, y0 + 96, { font: "v", size: 12, col: "#5fb8c0", align: "center" }); }
        // keys travelling: text -> gears -> slot
        const key = (k0, word, val, slot) => {
          const u = t - k0; if (u < 0) return;
          const sx0 = tpos[word], s1x = 288, s1y = y0 + 58, sx = SLOT(slot) + 4, sy = y0 + 112;
          let x, y, show = true;
          if (u < 0.4) { const k = PX.ease(u / 0.4, "io"); x = PX.lerp(sx0, s1x - 20, k); y = PX.lerp(y0 + 14, s1y, k) - Math.sin(k * 3.14) * 10; }
          else if (u < 0.9) { show = false; const k = PX.p(u, 0.55, 0.25, "back"); if (u > 0.55) OT(g, String(slot), 330, y0 + 40 - Math.round(k * 4), { size: 16, col: "#f7c948" }); }
          else if (u < 1.35) { const k = PX.ease((u - 0.9) / 0.45, "io"); x = PX.lerp(320, sx, k); y = PX.lerp(y0 + 70, sy, k); }
          else { x = sx; y = sy; }
          if (show) { T(g, word, x, y, { font: "v", size: 16, col: "#ff9a6a" }); }
          if (u >= 1.35) { T(g, val, sx, sy + 16, { font: "v", size: 16, col: val === "31" ? "#5fe3e8" : "#3df56b" }); if (u < 1.8) PX.glow(g, SLOT(slot) + 19, y0 + 128, 30, "rgba(247,201,72,.6)", 1); }
        };
        key(KN, '"name"', '"Ana"', 3); key(KA, '"age"', "31", 6);
        g.restore();
      }
      // corner brackets
      for (const [cx, cy, dx, dy] of [[X0 - 4, y0 - 4, 1, 1], [X0 + W0 + 3, y0 - 4, -1, 1], [X0 - 4, y0 + H0 + 3, 1, -1], [X0 + W0 + 3, y0 + H0 + 3, -1, -1]]) { R(g, Math.min(cx, cx + dx * 10), cy, 10, 1, "#5fe3e8"); R(g, cx, Math.min(cy, cy + dy * 10), 1, 10, "#5fe3e8"); }
      // the scanner bar
      if (t >= XR - 0.4) {
        const park = t > XR + SCAN, bx = park ? X0 + W0 + 10 + Math.round(PX.ease((t - XR - SCAN) / 0.4, "out") * 14) : t < XR ? X0 - 14 : scanX;
        const a = park ? Math.max(0, 1 - (t - XR - SCAN) / 0.5) : 1;
        if (a <= 0) { } else {
        g.globalAlpha = a;
        bx3(g, bx - 8, y0 - 22, 16, 12, "#3a4660", "#5a6a8a", "#1a2030"); bx3(g, bx - 8, y0 + H0 + 10, 16, 12, "#3a4660", "#5a6a8a", "#1a2030");
        if (!park && t >= XR) { R(g, bx - 1, y0 - 10, 3, H0 + 20, "#bff8ff"); PX.glow(g, bx, y0 + H0 / 2, 70, "rgba(95,227,232,.7)", 1); R(g, bx - 6, y0 - 10, 12, H0 + 20, "rgba(95,227,232,.16)"); }
        T(g, "X-RAY", bx, y0 - 34, { font: "v", size: 12, col: "#8af4ff", align: "center" });
        g.globalAlpha = 1; }
      }
      PX.particles(g, 91, 30, t, [160, 40, 320, 250], { vy: -4, vx: 0, col: "#8af4ff", a: 0.5 });
      // foreground consoles
      PX.par(g, c, 1.12, () => {
        for (const [cx, w, fl] of [[-14, 168, 0], [486, 168, 1]]) {
          R(g, cx, 318, w, 46, "#141a2a"); R(g, cx, 318, w, 1, "#3a4660");
          poly(g, [[cx, 318], [cx + w, 318], [cx + w - 8, 300], [cx + 8, 300]], "#222c42"); R(g, cx + 8, 300, w - 16, 1, "#4a5878");
          for (let b = 0; b < 8; b++) R(g, cx + 18 + b * 16, 308, 8, 4, PX.blink(t + b * 0.37 + fl, 1.1, 0.5) ? ["#3df56b", "#f7c948", "#ff5c5c", "#5fe3e8"][b % 4] : "#2a3448");
          const mx = cx + (fl ? 20 : 70), my = 262;
          bx3(g, mx, my, 76, 40, "#1a1d24", "#3a3f4b", "#0c0d12"); R(g, mx + 3, my + 3, 70, 34, "#04131a");
          let py = null; for (let k = 0; k < 68; k++) { const yy = my + 20 + Math.round(Math.sin(k * 0.35 - t * 6 + fl * 2) * (fl ? 6 : 10) * Math.sin(k * 0.08 + 1)); if (py !== null) PX.line(g, mx + 3 + k - 1, py, mx + 3 + k, yy, fl ? "#f25ca8" : "#3df56b"); py = yy; }
          PX.glow(g, mx + 38, my + 20, 50, fl ? "rgba(242,92,168,.25)" : "rgba(61,245,107,.25)", 1);
        }
      });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= clean_code =======================
  // two monitors on a desk: LEFT messy code (tangles, red squiggles), RIGHT clean code; bulbs pop over the right
  // at o.bulbs [1.2, 1.9, 2.6]; label "CLEAN CODE FEELS DIFFERENT" at o.label (3.4).
  K.clean_code = (o) => {
    const MESSY = ["def f(x,y,z,a=[] ,**k):", "  if x:", "      for i in range(len(y)):", "   if y[i]==None:z=z+1;a.append(i)", "        else:", "     tmp2=tmp+ x*2-y[i] # ???",
      "  return z if z else a if a else None#fix", "x=f(1,2,3);print(x) ;  global tmp", "def f2(x): return f(x,x,x)  # copy", "    #TODO TODO fix later!!!", " try: f2(None)", "except: pass"];
    const SQ = [0, 3, 5, 6, 7, 10, 11];
    const CLEAN = [[["def", "#ff7b72"], [" total", "#d2a8ff"], ["(items):", "#c9d1d9"]], [["    ", ""], ['"""Sum the prices."""', "#8b949e"]], [["    return", "#ff7b72"], [" sum(i.price ", "#c9d1d9"], ["for", "#ff7b72"], [" i ", "#c9d1d9"], ["in", "#ff7b72"], [" items)", "#c9d1d9"]], [["", ""]],
      [["def", "#ff7b72"], [" average", "#d2a8ff"], ["(items):", "#c9d1d9"]], [["    if not", "#ff7b72"], [" items:", "#c9d1d9"]], [["        return", "#ff7b72"], [" 0", "#5fe3e8"]], [["    return", "#ff7b72"], [" total(items) / len(items)", "#c9d1d9"]]];
    const bulb = (g, x, y, k, t, i) => {
      if (k <= 0) return;
      const r = Math.max(1, Math.round(7 * k));
      PX.glow(g, x, y, 34 * k, "rgba(255,220,120,.7)", 1);
      for (let j = 0; j < 8; j++) { const a = j * 0.785 + t * 0.6 + i, r0 = r + 4, r1 = r + 7 + Math.round(Math.sin(t * 6 + j) * 1.5); if (k > 0.8) thk(g, x + Math.cos(a) * r0, y + Math.sin(a) * r0, x + Math.cos(a) * r1, y + Math.sin(a) * r1, 1, "#f7c948"); }
      PX.circle(g, x, y, r, "#e8b830"); PX.circle(g, x - 1, y - 1, Math.max(1, r - 2), "#ffe08a"); R(g, x - Math.round(r * 0.4), y - Math.round(r * 0.5), 2, 2, "#fff6d8");
      if (k > 0.6) { R(g, x - 3, y + r, 6, 2, "#9aa4b2"); R(g, x - 3, y + r + 2, 6, 1, "#5a606c"); R(g, x - 3, y + r + 3, 6, 2, "#9aa4b2"); R(g, x - 2, y + r + 5, 4, 1, "#3a3f4b"); }
    };
    const plant = (g, x, y, t, wilt) => {
      bx3(g, x - 8, y - 12, 16, 12, "#8a4a30", "#b06a48", "#5a2e1c");
      if (wilt) { for (let k = 0; k < 4; k++) { const dx = (k - 1.5) * 4; thk(g, x + dx * 0.3, y - 12, x + dx, y - 20, 1, "#6a6a2a"); thk(g, x + dx, y - 20, x + dx * 2.6, y - 12 + (k % 2) * 3, 2, k % 2 ? "#7a5a2a" : "#6a6a2a"); } R(g, x + 6, y - 2, 3, 2, "#7a5a2a"); }
      else { for (let k = 0; k < 5; k++) { const a = -2.6 + k * 0.42 + Math.sin(t * 1.2 + k) * 0.05; poly(g, [[x, y - 12], [x + Math.cos(a) * 18 - 2, y - 12 + Math.sin(a) * 18], [x + Math.cos(a) * 18 + 3, y - 12 + Math.sin(a) * 18 + 2]], k % 2 ? "#2f8a4a" : "#3fb060"); }
        PX.circle(g, x + 2, y - 30, 3, "#f25ca8"); R(g, x + 1, y - 31, 2, 2, "#f7c948"); }
    };
    return (g, t, d, c) => {
      const sc = d / 6.6, BU = o.bulbs || [1.2, 1.9, 2.6].map((v) => v * sc), LAB = def(o.label, 3.4 * sc);
      // wall, window, shelf
      PX.vgrad(g, 0, 0, 640, 250, "171c36", "0d1022", 9);
      PX.par(g, c, 0.4, () => nightWindow(g, 18, 34, 60, 86, t, 41, "#2a2f45"));
      PX.par(g, c, 0.6, () => {
        R(g, 566, 96, 70, 4, "#4a3626"); R(g, 566, 96, 70, 1, "#6a4a34");
        let bx = 570; for (let k = 0; k < 6; k++) { const h = 14 + (k * 5) % 9, col = ["#3a5a8a", "#8a3a3a", "#3a7a5a", "#7a6a3a", "#5a3a7a", "#3a6a7a"][k]; bx3(g, bx, 96 - h, 8, h, col, mix(col.slice(1), "ffffff", 0.25), mix(col.slice(1), "000000", 0.4)); bx += 9; }
        R(g, 572, 130, 52, 40, "#1e2438"); R(g, 574, 132, 48, 36, "#2a3458"); T(g, "{ }", 598, 142, { size: 8, col: "#5fe3e8", align: "center" });
      });
      // lamp (left)
      PX.glow(g, 64, 210, 120, "rgba(255,190,110,.4)", 1);
      R(g, 48, 244, 30, 6, "#2b2f38"); R(g, 60, 198, 4, 46, "#3a3f4b"); poly(g, [[46, 198], [78, 198], [72, 186], [52, 186]], "#3a3f4b"); R(g, 48, 197, 28, 2, "#ffd28a");
      // desk
      R(g, 0, 250, 640, 12, "#5a3e2b"); R(g, 0, 250, 640, 2, "#7a573d"); R(g, 0, 262, 640, 98, "#1a1410"); R(g, 30, 262, 10, 98, "#2a1f17"); R(g, 600, 262, 10, 98, "#2a1f17");
      // ---- LEFT monitor: messy ----
      const LX = 96, MY = 84, MW = 204, MH = 136, sh = Math.round(Math.sin(t * 31) * (PX.blink(t, 1.7, 0.2) ? 1 : 0));
      PX.glow(g, LX + MW / 2, MY + MH / 2, 150, "rgba(255,80,80,.14)", 1);
      R(g, LX - 6 + sh, MY - 6, MW + 12, MH + 12, "#1a1d24"); R(g, LX - 6 + sh, MY - 6, MW + 12, 1, "#3a3f4b");
      R(g, LX + MW / 2 - 4, MY + MH + 6, 8, 12, "#1a1d24"); R(g, LX + MW / 2 - 16, MY + MH + 16, 32, 4, "#22262f");
      g.save(); g.beginPath(); g.rect(LX + sh, MY, MW, MH); g.clip();
      R(g, LX + sh, MY, MW, MH, "#14100f"); R(g, LX + sh, MY, MW, 9, "#221a18"); T(g, "final_v2_REAL.py", LX + 4 + sh, MY, { font: "v", size: 10, col: "#c9a0a0" });
      const scroll = Math.round(Math.sin(t * 0.7) * 3);
      MESSY.forEach((ln, i) => {
        const y = MY + 12 + i * 10 + scroll, x = LX + 6 + sh;
        T(g, ln, x, y, { font: "v", size: 12, col: ["#d8c0a0", "#ff9a7a", "#c9d1d9", "#e0a0ff"][i % 4] });
        if (SQ.includes(i)) { const w = PX.tw(g, ln, { font: "v", size: 12 }); for (let k = 0; k < w; k += 2) R(g, x + k, y + 10 + ((k / 2) % 2), 2, 1, "#ff4d4d"); }
      });
      // spaghetti tangle over the code
      for (let s = 0; s < 4; s++) { const col = ["#ff5c5c", "#f08a3c", "#f25ca8", "#ff7a5c"][s]; let px0 = null;
        for (let k = 0; k <= 60; k++) { const u = k / 60, x = LX + 10 + u * (MW - 20) + sh, y = MY + MH / 2 + Math.sin(u * 9 + s * 1.7 + t * 1.3) * 40 * Math.sin(u * 3 + s) + Math.cos(u * 17 + s) * 8;
          if (px0) { g.globalAlpha = 0.55; PX.line(g, px0[0], px0[1], x, y, col); g.globalAlpha = 1; } px0 = [x, y]; } }
      R(g, LX + sh, MY + MH - 10, MW, 10, "#3a1414");
      if (PX.blink(t, 0.5, 0.7)) T(g, "47 ERRORS", LX + 4 + sh, MY + MH - 11, { font: "v", size: 12, col: "#ff6a6a" });
      T(g, "line 3?", LX + MW - 4 + sh, MY + MH - 11, { font: "v", size: 12, col: "#a06060", align: "right" });
      g.restore();
      smoke(g, LX + MW - 30, MY - 6, t, 4, "#5a5a64", 30, 0.4);
      plant(g, LX - 20, 250, t, true);
      for (const [x, y] of [[LX + 6, 244], [LX + 20, 246], [LX + 12, 240]]) { PX.circle(g, x, y, 4, "#b8b0a0"); R(g, x - 2, y - 1, 3, 1, "#8a8478"); }
      // ---- RIGHT monitor: clean ----
      const RX = 340;
      PX.glow(g, RX + MW / 2, MY + MH / 2, 160, "rgba(90,200,255,.16)", 1);
      R(g, RX - 6, MY - 6, MW + 12, MH + 12, "#1a1d24"); R(g, RX - 6, MY - 6, MW + 12, 1, "#4a505c");
      R(g, RX + MW / 2 - 4, MY + MH + 6, 8, 12, "#1a1d24"); R(g, RX + MW / 2 - 16, MY + MH + 16, 32, 4, "#22262f");
      R(g, RX, MY, MW, MH, "#0d1117"); R(g, RX, MY, MW, 9, "#161b22"); T(g, "prices.py", RX + 4, MY, { font: "v", size: 10, col: "#c9d1d9" });
      CLEAN.forEach((segs, i) => { let x = RX + 18; T(g, String(i + 1), RX + 12, MY + 13 + i * 12, { font: "v", size: 12, col: "#484f58", align: "right" }); for (const [s, col] of segs) { if (col) x += T(g, s, x, MY + 13 + i * 12, { font: "v", size: 12, col }); else x += PX.tw(g, s, { font: "v", size: 12 }); } });
      for (let i = 1; i <= 3; i++) R(g, RX + 18, MY + 13 + i * 12 + 0, 1, 10, "#21262d");
      if (PX.blink(t, 1.05, 0.55)) R(g, RX + 18 + PX.tw(g, "    return total(items) / len(items)", { font: "v", size: 12 }) + 2, MY + 14 + 7 * 12, 2, 9, "#e6edf3");
      R(g, RX, MY + MH - 10, MW, 10, "#0f2a1a"); R(g, RX + 5, MY + MH - 7, 2, 2, "#3df56b"); R(g, RX + 7, MY + MH - 5, 2, 2, "#3df56b"); R(g, RX + 9, MY + MH - 9, 2, 4, "#3df56b");
      T(g, "0 problems", RX + 14, MY + MH - 11, { font: "v", size: 12, col: "#3df56b" });
      plant(g, RX + MW + 22, 250, t, false);
      // drawers + keyboard + mug
      for (const dx of [50, 470]) { bx3(g, dx, 272, 120, 38, "#1e1712", "#2e241c", "#0e0a08"); R(g, dx + 50, 288, 20, 3, "#5a4636"); bx3(g, dx, 314, 120, 40, "#1e1712", "#2e241c", "#0e0a08"); R(g, dx + 50, 330, 20, 3, "#5a4636"); }
      R(g, 268, 238, 104, 12, "#2b2f38"); R(g, 268, 238, 104, 1, "#4a505c"); for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 16; kx++) R(g, 271 + kx * 6, 240 + ky * 3, 5, 2, "#5a6270");
      if (core().mug) core().mug(g, 384, 238, t);
      PX.glow(g, 320, 256, 160, "rgba(120,140,255,.14)", 1);
      if (core().coder) core().coder(g, 320, 274, t, { typing: t > BU[0], col: "#3a4a86", hl: "#5262a8", dark: "#283666" });
      // bulbs over the right monitor
      BU.forEach((bt, i) => { const k = PX.p(t, bt, 0.35, "back"), x = RX + 50 + i * 52, y = 60 - Math.round(Math.sin(t * 2 + i) * 2); if (t >= bt) bulb(g, x, y, k, t, i); if (t >= bt && t < bt + 0.3) for (let j = 0; j < 6; j++) { const a = j * 1.05, rr = 8 + (t - bt) * 80; spark(g, x + Math.cos(a) * rr, y + Math.sin(a) * rr, 1, "#ffe08a"); } });
      if (t >= LAB) { const k = PX.p(t, LAB, 0.4, "back"); OT(g, "CLEAN CODE FEELS DIFFERENT", 320, 16 - Math.round((1 - k) * 12), { size: 16, col: "#5fe3e8", outline: "#05060a", align: "center" }); }
      PX.particles(g, 101, 22, t, [20, 140, 140, 110], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.6 });
      PX.vignette(g, 0.55);
    };
  };
})();
