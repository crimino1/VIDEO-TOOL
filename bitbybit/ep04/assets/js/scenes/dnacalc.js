/* EP4 Builder C: Adleman's DNA computer (1994). Kinds: zoom_dna, flight_map, dna_blocks, tube_chains, serial_parallel,
   lab_week, dna_vs_earth. Documentary palette PX.D only (no hex literals); every scene is a lit place with 3+ depth layers. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, E = PX.ease, P = PX.p, clamp = PX.clamp, lerp = PX.lerp;

  // ---------- local helpers ----------
  const hex = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); k = clamp(k, 0, 1); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const rgba = (c, a) => { const A = hex(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; };
  const ell = (g, cx, cy, rx, ry, col) => { if (rx <= 0 || ry <= 0) return; g.fillStyle = col; for (let y = -Math.round(ry); y <= Math.round(ry); y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
  const poly = (g, pts, col) => {
    let y0 = Infinity, y1 = -Infinity;
    for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    g.fillStyle = col;
    for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
      const xs = [], yc = y + 0.5;
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) { const a = Math.round(xs[i]), b = Math.round(xs[i + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
    }
  };
  // radial darkness: clear inside r0, black at alpha a beyond r1 (lamp falloff)
  const shade = (g, x, y, r0, r1, a) => {
    const gr = g.createRadialGradient(x, y, r0, x, y, r1); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, `rgba(0,0,0,${a})`);
    g.fillStyle = gr; g.fillRect(0, 0, 640, 360);
  };
  const lampGlow = (g, x, y, r, a) => PX.glow(g, x, y, r, rgba(D.lamp, 0.55), a);
  const dust = (g, seed, n, t, box, a) => PX.particles(g, seed, n, t, box, { vy: -2.5, vx: 1.5, col: D.lamp, a: a === undefined ? 0.45 : a, tw: 1.3 });
  const lbl = (g, s, x, y, o) => PX.otext(g, s, x, y, { align: "center", col: D.cream, outline: D.n0, ...o });
  const opt = (o, k, def) => (o[k] === undefined ? def : o[k]);
  // range option [a,b] scaled from a typical duration
  const rng = (o, k, a, b, d, typ) => { const v = o[k]; if (Array.isArray(v)) return v; if (typeof v === "number") return [v, v + (b - a) * d / typ]; return [a * d / typ, b * d / typ]; };
  const tm = (o, k, def, d, typ) => (o[k] === undefined ? def * d / typ : o[k]);
  // skin + hair, mixed from the palette
  const SKIN_M = [mix(D.rose[0], D.lamp, 0.25), mix(D.rose[1], D.lampD, 0.45), mix(D.rose[2], D.ink, 0.35)];
  const SKIN_L = [mix(D.rose[0], D.cream, 0.55), mix(D.rose[0], D.paper, 0.35), mix(D.rose[1], D.paperD, 0.4)];
  const GINGER = [mix(D.rust[0], D.amber[1], 0.3), mix(D.rust[1], D.lampD, 0.35), mix(D.rust[2], D.ink, 0.2)];
  const COAT = [D.cream, mix(D.paper, D.cream, 0.3), mix(D.paperD, D.n5, 0.35)];
  const WOOD = [mix(D.lampD, D.n3, 0.3), mix(D.lampD, D.n1, 0.62), mix(D.lampD, D.n0, 0.8)];
  const CORK = [mix(D.paperD, D.lampD, 0.25), mix(D.paperD, D.n2, 0.5), mix(D.paperD, D.n1, 0.72)];
  const BRASS = [mix(D.amber[0], D.lamp, 0.4), mix(D.amber[2], D.lampD, 0.45), mix(D.amber[2], D.n1, 0.45)];
  const COMP = { A: "T", T: "A", C: "G", G: "C" };
  // base colour shades: [light, base, shadow]
  const BASE = {};
  for (const b of "ACGT") BASE[b] = [mix(D.dna[b], D.cream, 0.35), D.dna[b], mix(D.dna[b], D.n0, 0.45)];

  // a tick mark (5x4) in colour col
  const tick = (g, x, y, col) => { R(g, x, y + 2, 1, 1, col); R(g, x + 1, y + 3, 1, 1, col); R(g, x + 2, y + 2, 1, 1, col); R(g, x + 3, y + 1, 1, 1, col); R(g, x + 4, y, 1, 1, col); };
  const tickB = (g, x, y, col) => { tick(g, x, y, col); tick(g, x + 1, y, col); };

  // ---------- characters ----------
  // the researcher, seen from the front, hunched over a bench (~95 px visible): x = centre, y = bench back edge.
  // o.slump = extra head drop (px). Lamp light comes from the right.
  const researcherFront = (g, x, y, t, o) => {
    o = o || {};
    const br = Math.round(Math.sin(t * 1.6) * 0.8), sl = Math.round(o.slump || 0);
    const sy = y - 62 + br, HAIR = [D.n5, D.n2, D.n1];
    // upper arms going down to the elbows on the bench
    poly(g, [[x - 38, sy + 6], [x - 24, sy + 6], [x - 30, y + 2], [x - 46, y + 2]], COAT[2]);
    PX.line(g, x - 39, sy + 7, x - 46, y + 1, mix(COAT[2], D.n3, 0.35));
    poly(g, [[x + 24, sy + 6], [x + 38, sy + 6], [x + 46, y + 2], [x + 30, y + 2]], COAT[1]);
    PX.line(g, x + 38, sy + 7, x + 45, y + 1, COAT[0]); PX.line(g, x + 31, sy + 30, x + 34, y, COAT[2]);
    // torso with rounded shoulders
    for (let r = 0; y + 4 - (sy + r) > 0; r++) {
      const w = Math.round(60 + r * 0.16) - (r < 5 ? (5 - r) * 3 : 0), xl = Math.round(x - w / 2);
      R(g, xl, sy + r, w, 1, COAT[1]); R(g, xl, sy + r, 9, 1, COAT[2]); R(g, xl + w - 2, sy + r, 2, 1, COAT[0]);
    }
    R(g, x + 4, sy, 20, 1, COAT[0]); R(g, x + 14, sy + 1, 12, 1, COAT[0]);
    PX.line(g, x - 22, sy + 24, x - 17, y, COAT[2]); PX.line(g, x + 21, sy + 28, x + 18, y, COAT[2]);   // creases
    // shirt, collar, lapels, buttons
    poly(g, [[x - 10, sy], [x + 10, sy], [x, sy + 30]], D.teal[2]); R(g, x - 3, sy, 6, 2, mix(D.teal[2], D.n1, 0.4));
    poly(g, [[x - 11, sy], [x - 4, sy + 1], [x - 8, sy + 8]], COAT[0]); poly(g, [[x + 11, sy], [x + 4, sy + 1], [x + 8, sy + 8]], COAT[0]);
    PX.line(g, x - 10, sy + 1, x - 1, sy + 31, COAT[2]); PX.line(g, x + 10, sy + 1, x + 1, sy + 31, COAT[2]);
    R(g, x + 3, sy + 38, 2, 2, D.n5); R(g, x + 3, sy + 50, 2, 2, D.n5);
    // breast pocket with pens
    R(g, x - 26, sy + 26, 13, 1, COAT[2]); R(g, x - 26, sy + 27, 1, 9, COAT[2]);
    R(g, x - 23, sy + 21, 1, 5, D.rust[1]); R(g, x - 20, sy + 20, 1, 6, D.steel[2]); R(g, x - 17, sy + 22, 1, 4, D.n1);
    // head, bowed over the work
    const hx = x + 1, hy = sy - 8 + sl;
    R(g, hx - 6, hy + 9, 12, 8, SKIN_M[2]);
    ell(g, hx, hy, 15, 15, HAIR[2]);
    ell(g, hx, hy + 5, 12, 11, SKIN_M[1]); ell(g, hx + 3, hy + 4, 8, 9, SKIN_M[0]);
    R(g, hx - 14, hy + 3, 3, 7, SKIN_M[2]); R(g, hx + 12, hy + 3, 3, 7, SKIN_M[1]); R(g, hx + 13, hy + 4, 1, 4, SKIN_M[0]);
    ell(g, hx, hy - 4, 15, 9, HAIR[1]); R(g, hx - 15, hy - 4, 30, 4, HAIR[1]); R(g, hx - 14, hy, 4, 4, HAIR[1]); R(g, hx + 11, hy, 4, 3, HAIR[1]);
    PX.line(g, hx - 1, hy - 12, hx + 1, hy - 1, HAIR[2]);
    for (const [ax, ay, w] of [[4, -11, 5], [7, -9, 5], [9, -6, 5], [3, -7, 3], [-8, -9, 4]]) R(g, hx + ax, hy + ay, w, 1, ax > 0 ? HAIR[0] : mix(HAIR[1], HAIR[0], 0.4));
    ell(g, hx, hy - 18, 7, 6, HAIR[1]); R(g, hx + 1, hy - 22, 5, 1, HAIR[0]); R(g, hx + 4, hy - 20, 2, 2, HAIR[0]); R(g, hx - 6, hy - 14, 12, 2, HAIR[2]);
    R(g, hx - 7, hy - 15, 14, 1, D.rust[2]);   // hair tie
    // brows, glasses, downcast eyes, nose, mouth
    R(g, hx - 9, hy + 1, 6, 1, HAIR[2]); R(g, hx + 3, hy + 1, 6, 1, HAIR[2]);
    for (const sd of [-1, 1]) { PX.box(g, hx + sd * 6 - 4, hy + 3, 9, 7, D.n1); R(g, hx + sd * 6 - 2, hy + 7, 5, 1, D.ink); }
    R(g, hx - 1, hy + 5, 3, 1, D.n1); R(g, hx + 8, hy + 4, 2, 1, D.lamp); R(g, hx + 9, hy + 5, 1, 1, D.lamp);
    R(g, hx + 1, hy + 9, 1, 3, SKIN_M[2]); R(g, hx, hy + 12, 3, 1, SKIN_M[2]);
    R(g, hx - 3, hy + 15, 7, 1, mix(SKIN_M[2], D.rust[2], 0.3));
  };
  // forearms on the bench: left hand resting, right hand holding a pipette over the gel (py = pipette lift 0..1)
  const researcherHands = (g, x, y, t, py) => {
    poly(g, [[x - 46, y], [x - 30, y], [x - 26, y + 14], [x - 42, y + 15]], COAT[2]); R(g, x - 42, y + 14, 16, 2, mix(COAT[2], D.n3, 0.3));
    R(g, x - 40, y + 15, 12, 6, SKIN_M[1]); R(g, x - 39, y + 15, 10, 1, SKIN_M[0]); R(g, x - 40, y + 20, 12, 1, SKIN_M[2]);
    const lift = Math.round(py * 7), px = x + 26, top = y - 40 - lift;
    poly(g, [[x + 30, y], [x + 46, y], [px + 14, top + 34], [px + 4, top + 30]], COAT[1]); PX.line(g, x + 46, y, px + 14, top + 34, COAT[0]);
    R(g, px - 2, top, 5, 3, D.n6); R(g, px - 2, top, 5, 1, D.n7); R(g, px, top + 3, 1, 5, D.n5);
    R(g, px - 3, top + 8, 7, 18, D.n6); R(g, px - 3, top + 8, 1, 18, D.n7); R(g, px + 3, top + 8, 1, 18, D.n4); R(g, px - 3, top + 12, 7, 2, D.steel[1]);
    R(g, px - 2, top + 26, 5, 5, D.n7); R(g, px - 1, top + 31, 3, 4, mix(D.glass, D.n6, 0.3)); R(g, px, top + 35, 1, 5, mix(D.glass, D.n5, 0.3));
    R(g, px + 3, top + 13, 8, 10, SKIN_M[1]); R(g, px + 3, top + 13, 8, 1, SKIN_M[0]); R(g, px - 5, top + 15, 3, 5, SKIN_M[2]); R(g, px + 10, top + 14, 1, 8, SKIN_M[0]);
  };
  // the assistant, front bust (upright): x = centre, y = shoulder line. light skin, short ginger hair
  const assistantBust = (g, x, y, t, o) => {
    o = o || {};
    const br = Math.round(Math.sin(t * 1.4 + 1) * 0.5), sy = y + br;
    for (let r = 0; r < 40; r++) { const w = Math.round(40 + r * 0.3) - (r < 3 ? (3 - r) * 4 : 0); R(g, x - w / 2, sy + r, w, 1, COAT[1]); R(g, x - w / 2, sy + r, 5, 1, COAT[2]); R(g, x + w / 2 - 1, sy + r, 1, 1, COAT[0]); }
    poly(g, [[x - 6, sy], [x + 6, sy], [x, sy + 16]], D.moss[2]);
    PX.line(g, x - 6, sy, x, sy + 16, COAT[2]); PX.line(g, x + 6, sy, x, sy + 16, COAT[2]);
    const hx = x, hy = sy - 13;
    R(g, hx - 3, hy + 8, 7, 6, SKIN_L[2]);
    ell(g, hx, hy, 10, 11, SKIN_L[1]); ell(g, hx + 2, hy + 1, 6, 8, SKIN_L[0]);
    R(g, hx - 11, hy, 2, 5, SKIN_L[2]); R(g, hx + 10, hy, 2, 5, SKIN_L[1]);
    ell(g, hx, hy - 6, 11, 6, GINGER[1]); R(g, hx - 11, hy - 6, 22, 4, GINGER[1]);
    R(g, hx - 10, hy - 2, 3, 4, GINGER[1]); R(g, hx + 8, hy - 2, 3, 3, GINGER[1]);
    for (let i = -8; i < 8; i += 3) R(g, hx + i, hy - 2, 2, 2, GINGER[1]);
    R(g, hx - 4, hy - 10, 9, 1, GINGER[0]); R(g, hx + 3, hy - 8, 4, 1, GINGER[0]); R(g, hx - 10, hy - 4, 2, 4, GINGER[2]);
    const look = o.look || 0;
    R(g, hx - 4 + look, hy + 2, 2, 2, D.ink); R(g, hx + 3 + look, hy + 2, 2, 2, D.ink);
    R(g, hx - 5, hy, 3, 1, GINGER[2]); R(g, hx + 3, hy, 3, 1, GINGER[2]);
    R(g, hx + 1, hy + 5, 1, 1, SKIN_L[2]); R(g, hx - 2, hy + 8, 5, 1, SKIN_L[2]); R(g, hx + 3, hy + 7, 1, 1, SKIN_L[2]);
    R(g, hx - 6, hy + 5, 2, 1, mix(SKIN_L[1], D.rose[1], 0.5)); R(g, hx + 5, hy + 5, 2, 1, mix(SKIN_L[1], D.rose[1], 0.5));
  };

  // ======================= flight_map =======================
  // An old route map pinned to a cork wall under a desk lamp: 7 pins (A..G), one-way flight arrows drawn in ink
  // (o.flights [1.5,4.0]), index card "VISIT EVERY CITY ONCE" pinned at o.rule (5.0), red string traces the
  // route A..G from o.path (8.0) over o.pathDur (4.0) s, a tick by each pin as the string reaches it.
  K.flight_map = (o) => {
    const CITY = [[165, 112], [255, 96], [332, 150], [250, 196], [362, 238], [452, 190], [470, 110]];
    const NAMES = "ABCDEFG";
    const ROUTE = [0, 1, 2, 3, 4, 5, 6];
    const FL = [[0, 1], [0, 3], [1, 2], [1, 6], [2, 3], [2, 4], [3, 4], [3, 5], [4, 5], [5, 2], [5, 6]];
    const r = PX.rnd(41), SPECK = [];
    for (let i = 0; i < 900; i++) SPECK.push([r() * 520 + 60, r() * 300 + 20, r()]);
    const LAND = []; // faint printed land masses on the map
    for (let i = 0; i < 14; i++) LAND.push([150 + r() * 330, 80 + r() * 190, 18 + r() * 34, 10 + r() * 20]);
    return (g, t, d, c) => {
      const [f0, f1] = rng(o, "flights", 1.5, 4.0, d, 14), tRule = tm(o, "rule", 5.0, d, 14), tPath = tm(o, "path", 8.0, d, 14);
      const pDur = opt(o, "pathDur", 4.0 * Math.min(1, d / 14));
      // far: plaster wall
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 440, mix(D.n3, D.lampD, 0.08), D.n1, 9);
        R(g, -40, 318, 720, 60, D.n1);
      });
      // mid: cork board in a wooden frame
      PX.par(g, c, 0.8, () => {
        R(g, 70, 26, 500, 290, WOOD[2]); R(g, 74, 30, 492, 282, WOOD[1]); R(g, 74, 30, 492, 2, WOOD[0]); R(g, 74, 30, 2, 282, WOOD[0]);
        R(g, 84, 40, 472, 262, CORK[1]); R(g, 84, 40, 472, 2, CORK[2]); R(g, 84, 40, 2, 262, CORK[2]);
        for (const [x, y, k] of SPECK) if (x > 85 && x < 555 && y > 41 && y < 301) R(g, x, y, 1, 1, k < 0.5 ? CORK[2] : CORK[0]);
        // other notes pinned on the cork: a scribbled card and a postcard with a plane
        R(g, 93, 134, 28, 38, rgba(D.n0, 0.4)); R(g, 91, 131, 28, 38, mix(D.paper, D.amber[0], 0.25));
        for (let y = 139; y < 166; y += 5) R(g, 95, y, 14 + ((y * 7) % 9), 1, mix(D.ink, D.paper, 0.5));
        PX.circle(g, 105, 133, 2, D.moss[2]);
        R(g, 520, 196, 32, 44, rgba(D.n0, 0.4)); R(g, 518, 193, 32, 44, D.cream); R(g, 521, 196, 26, 26, mix(D.teal[2], D.n2, 0.3));
        R(g, 521, 214, 26, 8, mix(D.teal[2], D.moss[2], 0.5));
        poly(g, [[524, 206], [544, 203], [545, 205], [525, 208]], D.n7); poly(g, [[533, 205], [537, 199], [539, 199], [537, 205]], D.n7); R(g, 525, 203, 2, 3, D.n7);
        for (let y = 226; y < 234; y += 3) R(g, 522, y, 22, 1, mix(D.ink, D.cream, 0.6));
        PX.circle(g, 534, 195, 2, D.steel[1]);
        // map paper (slightly aged, folded in quarters)
        const mx = 128, my = 62, mw = 380, mh = 226;
        R(g, mx + 3, my + 4, mw, mh, rgba(D.n0, 0.45));
        R(g, mx, my, mw, mh, D.paper);
        PX.vgrad(g, mx, my + mh - 40, mw, 40, D.paper.slice(1), mix(D.paper, D.paperD, 0.5).slice(1), 4);
        g.save(); g.beginPath(); g.rect(mx + 4, my + 4, mw - 8, mh - 8); g.clip();
        for (const [x, y, w, h] of LAND) ell(g, x, y, w, h, mix(D.paper, D.paperD, 0.38));
        for (const [x, y, w, h] of LAND) ell(g, x + 1, y - 1, w - 3, h - 3, mix(D.paper, D.paperD, 0.22));
        g.restore();
        for (let gx = mx + 30; gx < mx + mw; gx += 48) for (let gy = my + 3; gy < my + mh - 3; gy += 3) R(g, gx, gy, 1, 1, mix(D.paper, D.paperD, 0.55));
        for (let gy = my + 26; gy < my + mh; gy += 44) for (let gx = mx + 3; gx < mx + mw - 3; gx += 3) R(g, gx, gy, 1, 1, mix(D.paper, D.paperD, 0.55));
        R(g, mx + mw / 2, my, 1, mh, mix(D.paper, D.paperD, 0.7)); R(g, mx + mw / 2 + 1, my, 1, mh, mix(D.paper, D.cream, 0.5));
        R(g, mx, my + mh / 2, mw, 1, mix(D.paper, D.paperD, 0.7)); R(g, mx, my + mh / 2 + 1, mw, 1, mix(D.paper, D.cream, 0.5));
        R(g, mx + 4, my + 4, mw - 8, 1, D.paperD); R(g, mx + 4, my + mh - 5, mw - 8, 1, D.paperD); R(g, mx + 4, my + 4, 1, mh - 8, D.paperD); R(g, mx + mw - 5, my + 4, 1, mh - 8, D.paperD);
        // compass rose (bottom-left)
        const cx0 = mx + 30, cy0 = my + mh - 30, ink2 = mix(D.ink, D.paper, 0.45);
        PX.line(g, cx0, cy0 - 12, cx0, cy0 + 12, ink2); PX.line(g, cx0 - 12, cy0, cx0 + 12, cy0, ink2);
        poly(g, [[cx0, cy0 - 13], [cx0 + 3, cy0], [cx0 - 3, cy0]], ink2); PX.text(g, "N", cx0, cy0 - 23, { font: "v", size: 10, col: ink2, align: "center" });
        // corner pins of the map
        for (const [px, py] of [[mx + 7, my + 7], [mx + mw - 8, my + 7], [mx + 7, my + mh - 8], [mx + mw - 8, my + mh - 8]]) { PX.circle(g, px + 1, py + 2, 2, rgba(D.n0, 0.5)); PX.circle(g, px, py, 2, D.steel[1]); R(g, px - 1, py - 1, 1, 1, D.steel[0]); }
        // flight arrows (ink), each grows from its source over 0.5 s
        const ink = mix(D.ink, D.paper, 0.15);
        FL.forEach(([a, b], i) => {
          const s = f0 + (i / FL.length) * (f1 - f0), k = P(t, s, 0.5, "io");
          if (k <= 0) return;
          const [ax, ay] = CITY[a], [bx, by] = CITY[b], L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L;
          const sx = ax + ux * 7, sy = ay + uy * 7, ex = bx - ux * 9, ey = by - uy * 9;
          const qx = lerp(sx, ex, k), qy = lerp(sy, ey, k);
          PX.line(g, sx, sy, qx, qy, ink);
          if (k > 0.92) { // arrow head at the target end
            const hx = ex, hy = ey, px = -uy, py = ux;
            poly(g, [[hx + ux * 2, hy + uy * 2], [hx - ux * 6 + px * 3.5, hy - uy * 6 + py * 3.5], [hx - ux * 6 - px * 3.5, hy - uy * 6 - py * 3.5]], ink);
          }
        });
        // red string along the route
        const segT = pDur / (ROUTE.length - 1);
        const reached = (i) => t >= tPath + i * segT;
        for (let i = 0; i < ROUTE.length - 1; i++) {
          const k = P(t, tPath + i * segT, segT, "io"); if (k <= 0) break;
          const [ax, ay] = CITY[ROUTE[i]], [bx, by] = CITY[ROUTE[i + 1]];
          const L = Math.hypot(bx - ax, by - ay), n = Math.ceil(L * k), sag = (u) => Math.sin(u * Math.PI) * Math.min(4, L * 0.025);
          for (let j = 0; j <= n; j++) { const u = j / L; R(g, lerp(ax, bx, u) + 1, lerp(ay, by, u) + sag(u) + 3, 1, 1, rgba(D.n0, 0.3)); }
          for (let j = 0; j <= n; j++) { const u = j / L, x = lerp(ax, bx, u), y = lerp(ay, by, u) + sag(u); R(g, x, y, 1, 1, D.rust[1]); R(g, x, y + 1, 1, 1, D.rust[2]); }
          for (let j = 0; j <= n; j += 3) { const u = j / L; R(g, lerp(ax, bx, u), lerp(ay, by, u) + sag(u), 1, 1, D.rust[0]); }
        }
        // pins + letter tags
        CITY.forEach(([x, y], i) => {
          const pk = P(t, 0.15 + i * 0.14, 0.25, "back"); if (pk <= 0) return;
          const lift = Math.round((1 - pk) * -6);
          // tag
          R(g, x + 6, y - 15, 11, 11, mix(D.cream, D.paper, 0.3)); R(g, x + 6, y - 5, 11, 1, D.paperD);
          PX.text(g, NAMES[i], x + 8, y - 13, { size: 8, col: D.ink });
          // pin: shadow, needle, head
          R(g, x + 2, y + 3, 3, 2, rgba(D.n0, 0.4));
          PX.circle(g, x, y - 1 + lift, 4, D.rust[2]); PX.circle(g, x, y - 2 + lift, 3, D.rust[1]); R(g, x - 2, y - 4 + lift, 2, 1, D.rust[0]);
          if (reached(i) && t >= tPath) {
            const tk = P(t, tPath + i * segT, 0.3, "back");
            if (tk > 0.4) { R(g, x + 17, y - 15, 13, 11, mix(D.cream, D.paper, 0.3)); R(g, x + 17, y - 5, 13, 1, D.paperD); tickB(g, x + 21, y - 13, D.moss[2]); tickB(g, x + 21, y - 12, D.moss[2]); }
          }
        });
        // index card with the rule
        if (t >= tRule) {
          const k = P(t, tRule, 0.45, "out"), cy = lerp(326, 286, k), cx = 320;
          g.globalAlpha = clamp(k * 2, 0, 1);
          R(g, cx - 88, cy + 3, 178, 24, rgba(D.n0, 0.4));
          R(g, cx - 90, cy, 178, 24, D.cream); R(g, cx - 90, cy + 23, 178, 1, D.paperD);
          for (let x = cx - 86; x < cx + 84; x += 1) R(g, x, cy + 7, 1, 1, mix(D.cream, D.rust[0], 0.35));
          PX.text(g, "VISIT EVERY CITY ONCE", cx - 1, cy + 8, { font: "v", size: 16, col: D.ink, align: "center" });
          PX.circle(g, cx - 1, cy + 3, 2, D.steel[1]); R(g, cx - 2, cy + 2, 1, 1, D.steel[0]);
          g.globalAlpha = 1;
        }
      });
      // lamp light on the board
      shade(g, 430, 110, 50, 440, 0.66);
      lampGlow(g, 440, 100, 220, 0.09);
      // near: desk edge with mug, pencil, string spool
      PX.par(g, c, 1.0, () => {
        R(g, -40, 322, 720, 5, WOOD[0]); R(g, -40, 327, 720, 60, WOOD[2]); R(g, -40, 327, 720, 2, mix(WOOD[2], D.n0, 0.5));
        // spool of red string
        R(g, 112, 300, 22, 4, WOOD[1]); R(g, 114, 304, 18, 16, D.rust[1]); R(g, 114, 304, 3, 16, D.rust[0]); R(g, 128, 304, 4, 16, D.rust[2]); R(g, 112, 318, 22, 4, WOOD[1]);
        for (let y = 306; y < 318; y += 3) R(g, 117, y, 11, 1, D.rust[2]);
        // pencil
        R(g, 160, 318, 46, 3, D.amber[2]); R(g, 160, 318, 46, 1, D.amber[1]); R(g, 206, 318, 4, 3, D.paper); R(g, 210, 319, 2, 1, D.ink); R(g, 156, 318, 4, 3, D.rose[1]);
        // mug with steam
        const mx = 496, my = 294;
        R(g, mx, my, 20, 28, D.n4); R(g, mx + 1, my, 4, 28, D.n5); R(g, mx + 15, my, 5, 28, D.n3); R(g, mx + 20, my + 6, 5, 12, D.n4); R(g, mx + 22, my + 9, 2, 6, D.n2);
        R(g, mx + 1, my + 1, 18, 3, mix(D.rust[2], D.n0, 0.4));
        for (let i = 0; i < 4; i++) { const k = (((t * 0.35 + i / 4) % 1) + 1) % 1; g.globalAlpha = 0.28 * Math.sin(k * Math.PI); R(g, mx + 8 + Math.round(Math.sin(k * 5 + i) * 3), my - 4 - k * 26, 2, 4, D.n7); }
        g.globalAlpha = 1;
      });
      // the lamp shade (top right, out of focus edge)
      PX.par(g, c, 1.06, () => {
        poly(g, [[500, -10], [600, -10], [622, 26], [480, 26]], D.n2); poly(g, [[500, -10], [600, -10], [604, 0], [497, 0]], D.n3);
        R(g, 482, 24, 138, 3, D.n4); R(g, 488, 27, 126, 2, D.lamp); lampGlow(g, 552, 30, 50, 0.45);
      });
      dust(g, 17, 30, t, [360, 30, 220, 200]);
      PX.vignette(g, 0.5);
    };
  };

  // ======================= lab_week =======================
  // A lab bench at night: the researcher hunched over a gel electrophoresis tank, a wall calendar flipping through
  // 7 days (o.days [0.5,5.5]), paper coffee cups piling up (2 per day). At o.paper (6.0) a foreground inset: the
  // assistant solves the same 7-city puzzle on a paper napkin next to a stopwatch that then reads "1:00" — done.
  K.lab_week = (o) => {
    const r = PX.rnd(23), STARS = [];
    for (let i = 0; i < 26; i++) STARS.push([36 + r() * 136, 34 + r() * 56, r() * 6.28]);
    const BLD = []; let bx = 34; while (bx < 178) { const w = 10 + Math.floor(r() * 16); BLD.push([bx, 104 + Math.floor(r() * 24), w]); bx += w + 1; }
    const LANES = [0, 1, 2, 3, 4, 5, 6, 7].map(() => [0.1 + r() * 0.4, 0.45 + r() * 0.4]);
    const NAP = [[0, 4], [12, -4], [24, 2], [12, 9], [30, 12], [38, 4], [44, -4]];   // napkin sketch cities (local)
    const BY = 262;   // bench back edge
    return (g, t, d, c) => {
      const [d0, d1] = rng(o, "days", 0.5, 5.5, d, 9.5), tPaper = tm(o, "paper", 6.0, d, 9.5);
      const sp = (d1 - d0) / 5, dayF = t < d0 ? 0 : Math.min(6, Math.floor((t - d0) / sp) + 1), day = dayF + 1;
      const tFlip = d0 + (dayF - 1) * sp, flipK = dayF >= 1 ? clamp((t - tFlip) / 0.4, 0, 1) : 1;
      // far: wall, window with the night city, shelves of reagent bottles
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 320, mix(D.n3, D.teal[2], 0.12), D.n1, 9);
        R(g, 28, 24, 156, 132, D.n3); R(g, 28, 24, 156, 1, D.n5);
        PX.vgrad(g, 34, 30, 144, 120, mix(D.teal[2], D.n1, 0.55), mix(D.n1, D.plum[2], 0.2), 6);
        for (const [sx, sy, ph] of STARS) { g.globalAlpha = 0.35 + 0.35 * Math.sin(t * 1.2 + ph); R(g, sx, sy, 1, 1, D.cream); } g.globalAlpha = 1;
        PX.circle(g, 150, 54, 7, mix(D.cream, D.paper, 0.4)); PX.circle(g, 153, 52, 6, mix(D.n1, D.teal[2], 0.4));
        for (const [x, y, w] of BLD) { R(g, x, y, w, 150 - y, D.n1); for (let wy = y + 4; wy < 146; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 4) if (((wx * 7 + wy * 13) % 11) < 2) R(g, wx, wy, 2, 2, mix(D.lampD, D.n2, 0.45)); }
        R(g, 104, 30, 4, 120, D.n3); R(g, 34, 88, 144, 4, D.n3); R(g, 24, 154, 164, 5, D.n4); R(g, 24, 154, 164, 1, D.n5);
        for (const sy of [74, 130]) {
          R(g, 560, sy, 120, 4, WOOD[1]); R(g, 560, sy, 120, 1, WOOD[0]);
          let x = 566;
          for (let i = 0; i < 6; i++) {
            const h = 18 + ((i * 5 + sy) % 9), w = 10 + (i % 3) * 2, col = i % 3 === 0 ? mix(D.rust[2], D.n1, 0.4) : i % 3 === 1 ? mix(D.teal[2], D.n1, 0.2) : D.n4;
            R(g, x, sy - h, w, h, col); R(g, x + 2, sy - h - 3, w - 4, 3, D.n2); R(g, x, sy - h, 1, h, mix(col, D.cream, 0.25)); R(g, x + 1, sy - h + 6, w - 2, 6, mix(D.paper, D.n3, 0.35)); x += w + 3;
          }
        }
      });
      // mid wall: framed helix print + the calendar
      PX.par(g, c, 0.6, () => {
        R(g, 224, 52, 52, 70, D.n2); R(g, 227, 55, 46, 64, mix(D.paper, D.n4, 0.45));
        for (let i = 0; i < 26; i++) { const yy = 60 + i * 2.2, a = Math.sin(i * 0.5) * 12; R(g, 250 + a, yy, 2, 2, mix(D.teal[1], D.n4, 0.3)); R(g, 250 - a, yy, 2, 2, mix(D.rust[1], D.n4, 0.3)); if (i % 2 === 0) R(g, 250 - Math.abs(a) + 1, yy, Math.abs(a) * 2, 1, mix(D.paperD, D.n4, 0.4)); }
        const cx = 456, cy = 38, cw = 76, ch = 90;
        R(g, cx + 3, cy + 4, cw, ch, rgba(D.n0, 0.45));
        R(g, cx, cy, cw, ch, mix(D.paper, D.n4, 0.25)); R(g, cx, cy, cw, 17, D.rust[2]); R(g, cx, cy, cw, 1, D.rust[1]);
        PX.text(g, "DAY", cx + cw / 2, cy + 5, { size: 8, col: D.cream, align: "center" });
        R(g, cx + 3, cy + 19, cw - 6, ch - 22, D.paper);
        PX.text(g, String(day), cx + cw / 2 + 1, cy + 34, { size: 32, col: D.ink, align: "center" });
        for (let i = 0; i < 5; i++) R(g, cx + 10 + i * 12, cy + ch - 12, 8, 1, D.paperD);
        if (flipK < 1) {   // yesterday's page lifts up and away
          const k = E(flipK, "in"), h = Math.round((ch - 22) * (1 - k));
          if (h > 0) {
            R(g, cx + 3, cy + 19, cw - 6, h, k < 0.5 ? D.paper : mix(D.paperD, D.paper, 0.4)); R(g, cx + 3, cy + 19 + h, cw - 6, 1, D.paperD);
            R(g, cx + 3, cy + 20 + h, cw - 6, 2, rgba(D.n0, 0.25));
            if (k < 0.5) { g.save(); g.beginPath(); g.rect(cx + 3, cy + 19, cw - 6, h); g.clip(); PX.text(g, String(day - 1), cx + cw / 2 + 1, cy + 34 - Math.round((ch - 22 - h) * 0.5), { size: 32, col: D.ink, align: "center" }); g.restore(); }
          }
        }
        for (let i = 0; i < 6; i++) R(g, cx + 8 + i * 12, cy - 2, 2, 5, D.n6);
      });
      lampGlow(g, 390, 230, 220, 0.22);
      // the researcher behind the bench
      PX.par(g, c, 0.85, () => {
        R(g, -40, BY - 14, 720, 14, mix(D.n3, D.teal[2], 0.1)); for (let x = -40; x < 680; x += 18) R(g, x, BY - 14, 1, 14, D.n2); R(g, -40, BY - 14, 720, 1, D.n4);
        researcherFront(g, 330, BY, t, { slump: Math.min(dayF, 6) * 0.8 });
      });
      // bench + things on it
      PX.par(g, c, 0.9, () => {
        R(g, -40, BY, 720, 22, D.n3); R(g, -40, BY, 720, 1, D.n4);
        R(g, -40, BY + 22, 720, 4, D.n5); R(g, -40, BY + 22, 720, 1, D.n6); R(g, -40, BY + 26, 720, 100, D.n2);
        for (const x of [10, 200, 420, 630]) R(g, x, BY + 26, 2, 100, D.n1);
        for (const x of [105, 525]) { R(g, x - 12, BY + 44, 24, 3, D.n5); R(g, x - 12, BY + 44, 24, 1, D.n6); }
        // power supply (left) with leads to the tank
        const ps = 160;
        R(g, ps, BY - 30, 56, 42, D.n4); R(g, ps, BY - 30, 56, 1, D.n6); R(g, ps, BY - 30, 1, 42, D.n5); R(g, ps + 54, BY - 30, 2, 42, D.n3);
        R(g, ps + 6, BY - 24, 28, 11, D.n1); R(g, ps + 8, BY - 20, Math.round(14 + 6 * Math.sin(t * 0.8)), 3, mix(D.moss[2], D.n2, 0.15));
        R(g, ps + 42, BY - 22, 3, 3, D.amber[1]); PX.glow(g, ps + 43, BY - 21, 6, rgba(D.amber[1], 0.6), 0.6);
        PX.circle(g, ps + 12, BY + 1, 3, D.rust[2]); PX.circle(g, ps + 26, BY + 1, 3, D.n1);
        PX.line(g, ps + 12, BY + 4, 244, BY + 16, D.rust[2]); PX.line(g, 244, BY + 16, 266, BY + 8, D.rust[2]);
        PX.line(g, ps + 26, BY + 5, 260, BY + 19, D.n1); PX.line(g, 260, BY + 19, 396, BY + 18, D.n1); PX.line(g, 396, BY + 18, 402, BY + 10, D.n1);
        // gel tank: buffer, gel slab, 8 lanes of soft bands slowly running
        const gx = 264, gy = BY - 8, gw = 140;
        R(g, gx, gy, gw, 20, mix(D.teal[2], D.n2, 0.35)); R(g, gx, gy, gw, 1, D.glass); R(g, gx, gy, 1, 28, mix(D.glass, D.n3, 0.4)); R(g, gx + gw - 1, gy, 1, 28, mix(D.glass, D.n3, 0.4));
        R(g, gx + 8, gy + 2, gw - 16, 16, mix(D.teal[1], D.n2, 0.55)); R(g, gx + 8, gy + 2, gw - 16, 1, mix(D.teal[0], D.n3, 0.4));
        for (let i = 0; i < 8; i++) {
          const lx = gx + 14 + i * 15, [a, b] = LANES[i], run = clamp(t / d, 0, 1) * 3;
          R(g, lx, gy + 3, 8, 2, D.n2);
          for (const k of [a, b]) { const yy = gy + 6 + Math.round(Math.min(10, k * 9 + run)); g.globalAlpha = 0.4; R(g, lx - 1, yy - 1, 10, 3, D.amber[0]); g.globalAlpha = 1; R(g, lx, yy, 8, 1, mix(D.amber[0], D.cream, 0.45)); }
        }
        R(g, gx, gy + 20, gw, 8, mix(D.teal[2], D.n1, 0.3)); R(g, gx, gy + 20, gw, 1, mix(D.glass, D.teal[2], 0.4));
        R(g, gx + 3, gy + 1, 30, 1, rgba(D.cream, 0.5)); R(g, gx + 2, gy + 22, 1, 4, rgba(D.cream, 0.4));
        // beakers
        for (const [bx2, bh, lq] of [[422, 26, 0.5], [442, 18, 0.65]]) {
          const b0 = BY + 14;
          R(g, bx2, b0 - bh, 16, bh, rgba(D.glass, 0.16)); R(g, bx2, b0 - bh, 1, bh, rgba(D.glass, 0.7)); R(g, bx2 + 15, b0 - bh, 1, bh, rgba(D.glass, 0.4));
          const lh = Math.round(bh * lq); R(g, bx2 + 1, b0 - lh, 14, lh, rgba(D.teal[1], 0.45)); R(g, bx2 + 1, b0 - lh, 14, 1, rgba(D.teal[0], 0.7));
          R(g, bx2 - 1, b0 - bh, 18, 1, rgba(D.glass, 0.8)); R(g, bx2 + 3, b0 - bh + 3, 1, bh - 6, rgba(D.cream, 0.35));
        }
        // paper coffee cups: 2 per day, a pyramid 5-4-3-2
        const SLOTS = []; [5, 4, 3, 2].forEach((n, row) => { for (let i = 0; i < n; i++) SLOTS.push([474 + row * 7 + i * 14, BY + 14 - row * 15]); });
        const ncup = Math.min(14, day * 2);
        for (let i = 0; i < ncup; i++) {
          const [cx, cy] = SLOTS[i], born = i < 2 ? -1 : d0 + (Math.floor(i / 2) - 1) * sp + 0.15 * (i % 2), k = born < 0 ? 1 : P(t, born, 0.3, "back");
          if (k <= 0) continue;
          const h = Math.round(15 * Math.min(1, k)), top = cy - h;
          poly(g, [[cx, top], [cx + 13, top], [cx + 11, cy], [cx + 2, cy]], mix(D.cream, D.paper, 0.45));
          R(g, cx + 1, top, 2, h, D.cream); R(g, cx + 10, top + 1, 1, h - 1, D.paperD);
          if (h > 8) { R(g, cx + 1, top + 5, 12, 5, WOOD[0]); R(g, cx + 1, top + 5, 12, 1, mix(WOOD[0], D.cream, 0.3)); R(g, cx + 10, top + 5, 2, 5, WOOD[1]); }
          R(g, cx - 1, top, 15, 2, D.n6); R(g, cx - 1, top, 15, 1, D.n7);
        }
        { const [cx, cy] = SLOTS[ncup - 1]; for (let i = 0; i < 3; i++) { const k = (((t * 0.5 + i / 3) % 1) + 1) % 1; g.globalAlpha = 0.25 * Math.sin(k * Math.PI); R(g, cx + 6 + Math.round(Math.sin(k * 6 + i) * 2), cy - 19 - k * 20, 2, 3, D.n7); } g.globalAlpha = 1; }
        // gooseneck lamp: base right, head over the researcher's work
        R(g, 590, BY + 6, 34, 7, D.n4); R(g, 590, BY + 6, 34, 1, D.n6);
        for (const [a, b] of [[[606, BY + 6], [596, 190]], [[596, 190], [520, 150]], [[520, 150], [450, 168]]]) { PX.line(g, a[0], a[1], b[0], b[1], D.n5); PX.line(g, a[0] + 1, a[1] + 1, b[0] + 1, b[1] + 1, D.n3); }
        poly(g, [[434, 164], [460, 164], [470, 186], [424, 186]], D.n4); poly(g, [[434, 164], [460, 164], [462, 169], [432, 169]], D.n5);
        R(g, 426, 186, 42, 2, D.lamp); PX.glow(g, 447, 189, 30, rgba(D.lamp, 0.7), 0.6);
        researcherHands(g, 330, BY, t, 0.5 + 0.5 * Math.sin(t * 2.1));
      });
      shade(g, 390, 225, 80, 440, 0.62);
      dust(g, 29, 26, t, [360, 180, 140, 80]);
      // foreground inset: the assistant, the napkin and the stopwatch
      if (t >= tPaper) {
        const f = clamp((d - tPaper) / 3.5, 0.4, 1), k = P(t, tPaper, 0.5 * f, "out"), ox = 12, oy = Math.round(lerp(372, 194, k)), W = 238, H = 156;
        PX.par(g, c, 1.0, () => {
          R(g, ox + 4, oy + 5, W, H, rgba(D.n0, 0.55));
          R(g, ox, oy, W, H, D.cream); R(g, ox, oy + H - 1, W, 1, D.paperD); R(g, ox, oy, 1, H, D.paperD);
          const ix = ox + 7, iy = oy + 7, iw = W - 14, ih = H - 24;
          g.save(); g.beginPath(); g.rect(ix, iy, iw, ih); g.clip();
          // a diner booth at night: dark wall, window, warm pendant light
          PX.vgrad(g, ix, iy, iw, ih, mix(D.n3, D.rust[2], 0.15), D.n1, 6);
          R(g, ix + 116, iy + 8, 92, 56, D.n2); R(g, ix + 119, iy + 11, 86, 50, mix(D.teal[2], D.n1, 0.6));
          for (let i = 0; i < 5; i++) PX.line(g, ix + 124 + i * 18, iy + 58, ix + 136 + i * 18, iy + 14, rgba(D.teal[0], 0.18));
          for (const [lx2, ly2] of [[130, 50], [150, 46], [181, 52], [196, 44]]) R(g, ix + lx2, iy + ly2, 2, 2, mix(D.lampD, D.n2, 0.3));
          R(g, ix + 161, iy + 11, 2, 50, D.n2);
          R(g, ix + 70, iy, 1, 10, D.n5); poly(g, [[ix + 63, iy + 10], [ix + 78, iy + 10], [ix + 82, iy + 18], [ix + 59, iy + 18]], D.n4); R(g, ix + 61, iy + 18, 20, 1, D.lamp);
          PX.glow(g, ix + 71, iy + 30, 80, rgba(D.lamp, 0.5), 0.55);
          R(g, ix, iy + 44, 36, 60, mix(D.rust[2], D.n1, 0.4)); R(g, ix, iy + 44, 36, 2, mix(D.rust[1], D.n2, 0.4));   // booth seat back
          assistantBust(g, ix + 70, iy + 64, t, { look: 1 });
          // table
          R(g, ix, iy + 100, iw, ih - 100, WOOD[1]); R(g, ix, iy + 100, iw, 1, WOOD[0]); R(g, ix, iy + 102, iw, 1, mix(WOOD[1], D.n0, 0.3));
          // napkin with the 7-city sketch
          const nx = ix + 72, ny = iy + 104;
          poly(g, [[nx, ny], [nx + 62, ny], [nx + 67, ny + 22], [nx - 5, ny + 22]], D.cream); PX.line(g, nx - 5, ny + 22, nx + 67, ny + 22, D.paperD);
          PX.line(g, nx + 30, ny + 1, nx + 31, ny + 21, mix(D.cream, D.paperD, 0.5));
          const sk = P(t, tPaper + 0.6 * f, 1.6 * f, "lin"), gr = mix(D.n4, D.ink, 0.3);
          const NP = NAP.map(([a, b]) => [nx + 9 + a, ny + 9 + b * 0.6]);
          for (const [a, b] of NP) R(g, a - 1, b - 1, 3, 2, gr);
          let pen = NP[0];
          for (let i = 0; i < NP.length - 1; i++) { const kk = clamp(sk * 6 - i, 0, 1); if (kk <= 0) break; const [ax, ay] = NP[i], [bx2, by] = NP[i + 1]; pen = [lerp(ax, bx2, kk), lerp(ay, by, kk)]; PX.line(g, ax, ay, pen[0], pen[1], gr); }
          // arm: shoulder -> elbow on the table -> hand with the pencil
          const [pxn, pyn] = pen, ex = ix + 96, ey = iy + 100;
          poly(g, [[ix + 84, iy + 67], [ix + 92, iy + 65], [ex + 4, ey - 2], [ex - 4, ey]], COAT[1]); PX.line(g, ix + 92, iy + 65, ex + 4, ey - 2, COAT[0]); PX.line(g, ix + 84, iy + 68, ex - 4, ey, COAT[2]);
          poly(g, [[ex - 5, ey - 3], [ex + 4, ey - 4], [pxn + 8, pyn + 1], [pxn + 3, pyn + 5]], COAT[1]); PX.line(g, ex - 5, ey, pxn + 3, pyn + 5, COAT[2]);
          R(g, pxn + 1, pyn - 2, 7, 6, SKIN_L[1]); R(g, pxn + 1, pyn - 2, 7, 1, SKIN_L[0]); R(g, pxn + 1, pyn + 3, 7, 1, SKIN_L[2]);
          PX.line(g, pxn, pyn, pxn + 5, pyn - 10, D.amber[1]); PX.line(g, pxn + 1, pyn, pxn + 6, pyn - 10, D.amber[2]); R(g, pxn, pyn, 1, 1, D.ink); R(g, pxn + 5, pyn - 11, 2, 2, D.rose[1]);
          // stopwatch: the hand sweeps one full turn
          const sx = ix + 160, sy2 = iy + 112;
          R(g, sx - 2, sy2 - 15, 4, 3, D.n6); R(g, sx - 3, sy2 - 16, 6, 1, D.n7); PX.circle(g, sx, sy2, 11, D.n5); PX.circle(g, sx, sy2, 10, D.n6); PX.circle(g, sx, sy2, 8, D.cream);
          R(g, sx + 6, sy2 + 9, 6, 2, rgba(D.n0, 0.35));
          for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; R(g, sx + Math.round(Math.sin(a) * 7), sy2 - Math.round(Math.cos(a) * 7), 1, 1, D.n5); }
          const sw = P(t, tPaper + 0.6 * f, 1.6 * f, "lin") * 6.283;
          PX.line(g, sx, sy2, sx + Math.round(Math.sin(sw) * 6), sy2 - Math.round(Math.cos(sw) * 6), D.rust[1]); R(g, sx, sy2, 1, 1, D.ink);
          g.restore();
          const done = tPaper + 2.3 * f;
          if (t >= done && P(t, done, 0.3, "back") > 0.3) {
            lbl(g, "1:00", sx + 32, sy2 - 9, { font: "v", size: 20 });
            tickB(g, nx + 1, ny + 13, D.moss[2]); tickB(g, nx + 1, ny + 14, D.moss[2]);
          }
        });
      }
      PX.vignette(g, 0.55);
    };
  };

  // ---------- DNA bricks (shared) ----------
  // one base cell, 14x16. side = "dn" (connector on the bottom edge, top strand) or "up" (bottom strand).
  // purines A/G carry a tab, pyrimidines T/C a notch; A-T are triangles, G-C are squares, so only partners fit.
  const CW = 20, CH = 22;
  const baseCell = (g, x, y, b, side, bg, a) => {
    const [hi, mid, lo] = BASE[b], tab = b === "A" || b === "G", tri = b === "A" || b === "T";
    const ey = side === "dn" ? y + CH : y, dir = side === "dn" ? 1 : -1, cx = x + CW / 2;
    // body row by row, leaving the notch open (so a partner's tab can show through it)
    for (let yy = 0; yy < CH; yy++) {
      const dEdge = dir > 0 ? CH - 1 - yy : yy;   // distance from the connector edge
      let na = 0, nb = 0;
      if (!tab) { if (tri && dEdge < 5) { const hw = 5 - dEdge; na = cx - hw; nb = cx + hw; } else if (!tri && dEdge < 4) { na = cx - 4; nb = cx + 4; } }
      const col = yy === 0 ? hi : yy === CH - 1 ? lo : mid;
      if (nb > na) { R(g, x, y + yy, na - x, 1, col); R(g, nb, y + yy, x + CW - nb, 1, col); } else R(g, x, y + yy, CW, 1, col);
    }
    R(g, x, y + 1, 1, CH - 2, hi); R(g, x + CW - 1, y + 1, 1, CH - 2, lo);
    if (tab) {
      if (tri) poly(g, [[cx - 5, ey], [cx + 5, ey], [cx, ey + dir * 5]], mid); else R(g, cx - 4, dir > 0 ? ey : ey - 4, 8, 4, mid);
      if (dir > 0) R(g, cx - 1, ey + (tri ? 2 : 3), 2, 1, lo); else R(g, cx - 2, ey - (tri ? 3 : 4), tri ? 4 : 8, 1, hi);
    }
    PX.text(g, b, x + 6, y + (side === "dn" ? 5 : 9), { size: 8, col: D.ink });
  };
  const brick = (g, x, y, seq, side, bg, lift) => {
    lift = lift || 0;
    R(g, x + 2 + lift, y + 3 + lift * 1.5, seq.length * CW, CH, rgba(D.n0, 0.28 + 0.04 * lift));
    for (let i = 0; i < seq.length; i++) baseCell(g, x + i * CW, y, seq[i], side, bg);
    R(g, x, y, 1, CH, mix(BASE[seq[0]][1], D.n0, 0.5)); R(g, x + seq.length * CW - 1, y, 1, CH, mix(BASE[seq[seq.length - 1]][1], D.n0, 0.5));
  };

  // ======================= dna_blocks =======================
  // A lab notebook on a bench under a lamp: four cities (A-D) written as short DNA bricks of 6 bases appear
  // (0.3-2.0 s); at o.flights (2.5) three "flight" bricks lift off the page one by one (every o.gap 1.2 s) and snap
  // under the joint of two cities: their bases are the complements of the end of one city and the start of the
  // next (A-T triangles, G-C squares). At o.chain (7.0) a pencil bracket underlines the finished route.
  // Labels CITY / FLIGHT.
  K.dna_blocks = (o) => {
    const CITIES = ["GATCCA", "TTGACG", "CAGGTA"], NAMES = "ABC";
    const comp = (s) => s.split("").map((b) => COMP[b]).join("");
    const FLIGHTS = [0, 1].map((i) => comp(CITIES[i].slice(3)) + comp(CITIES[i + 1].slice(0, 3)));
    const W6 = 6 * CW, GAP = 12, X0 = Math.round(320 - (3 * W6 + 2 * GAP) / 2), Y0 = 146;
    const CX = [0, 1, 2].map((i) => X0 + i * (W6 + GAP));
    const PILE = [[150, 256], [300, 280]];
    const r = PX.rnd(61), GRAIN = [];
    for (let i = 0; i < 700; i++) GRAIN.push([r() * 680 - 20, r() * 400 - 20, r()]);
    return (g, t, d, c) => {
      const tFl = tm(o, "flights", 2.5, d, 9), gap = opt(o, "gap", 1.2 * Math.min(1, d / 9)), tCh = opt(o, "chain", Math.max(7.0 * d / 9, tFl + 0.5 + gap + 1.2));
      const paper = D.paper, pg = mix(D.paper, D.teal[1], 0.18);
      // far: bench top, dark slate
      PX.par(g, c, 0.5, () => {
        R(g, -40, -40, 720, 440, mix(D.n2, D.n3, 0.4));
        for (const [x, y, k] of GRAIN) R(g, x, y, k < 0.5 ? 2 : 1, 1, k < 0.5 ? D.n2 : D.n3);
        // tube rack seen from above (top-left) and a petri dish (top-right)
        R(g, 14, 18, 70, 46, D.n4); R(g, 14, 18, 70, 1, D.n5); R(g, 16, 62, 68, 2, D.n1);
        for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) { const cap = (i + j) % 3 === 0 ? D.teal[2] : (i + j) % 3 === 1 ? D.rust[2] : D.n6; PX.circle(g, 24 + i * 16, 28 + j * 13, 5, D.n2); PX.circle(g, 24 + i * 16, 28 + j * 13, 4, cap); R(g, 22 + i * 16, 25 + j * 13, 2, 1, mix(cap, D.cream, 0.4)); }
        PX.circle(g, 588, 52, 34, rgba(D.glass, 0.18)); PX.circle(g, 588, 52, 31, rgba(D.n1, 0.5)); PX.circle(g, 588, 52, 29, mix(D.amber[2], D.n2, 0.55));
        for (const [a, b] of [[578, 44], [596, 60], [590, 40], [572, 62]]) PX.circle(g, a, b, 3, mix(D.paper, D.amber[2], 0.5));
        R(g, 566, 26, 16, 1, rgba(D.cream, 0.5));
      });
      // mid: the notebook
      PX.par(g, c, 0.8, () => {
        const nx = 78, ny = 34, nw = 484, nh = 306;
        R(g, nx + 4, ny + 6, nw, nh, rgba(D.n0, 0.5));
        R(g, nx - 3, ny + 2, nw + 6, nh, mix(D.rust[2], D.n2, 0.5));   // cover edge
        R(g, nx, ny, nw, nh, paper);
        for (let x = nx + 12; x < nx + nw - 4; x += 12) R(g, x, ny + 14, 1, nh - 18, pg);
        for (let y = ny + 14; y < ny + nh - 4; y += 12) R(g, nx + 4, y, nw - 8, 1, pg);
        R(g, nx + 46, ny + 14, 1, nh - 18, mix(D.paper, D.rust[0], 0.4));
        PX.vgrad(g, nx, ny + nh - 30, nw, 30, paper.slice(1), mix(paper, D.paperD, 0.45).slice(1), 4);
        for (let i = 0; i < 18; i++) { const x = nx + 16 + i * 24; R(g, x, ny - 6, 8, 3, D.n6); R(g, x, ny - 6, 8, 1, D.n7); R(g, x + 1, ny - 3, 6, 4, D.n5); PX.circle(g, x + 4, ny + 6, 2, D.n3); }
        // pencil scribbles: heading + notes (no numbers)
        const pen = mix(D.n5, D.ink, 0.3);
        for (let i = 0; i < 70; i++) R(g, nx + 60 + i * 2, ny + 26 + Math.round(Math.sin(i * 1.3) * 1.5), 2, 1, pen);
        for (let i = 0; i < 42; i++) R(g, nx + 60 + i * 2, ny + 38 + Math.round(Math.sin(i * 1.7 + 1) * 1.2), 2, 1, mix(pen, paper, 0.4));
        for (let row = 0; row < 3; row++) for (let i = 0; i < 30 + row * 9; i++) R(g, nx + 60 + i * 2, ny + 258 + row * 12 + Math.round(Math.sin(i * 1.5 + row) * 1.2), 2, 1, mix(pen, paper, 0.45));
        // small pencil sketch of the flight map (bottom right)
        { const M = [[0, 6], [16, 0], [30, 12], [16, 22], [34, 34], [52, 22], [56, 4]], mx = 452, my = 252;
          for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [0, 3], [1, 6], [3, 5]]) PX.line(g, mx + M[a][0], my + M[a][1], mx + M[b][0], my + M[b][1], mix(pen, paper, 0.45));
          for (const [a, b] of M) R(g, mx + a - 1, my + b - 1, 3, 3, pen); }
        // cities
        CITIES.forEach((s, i) => {
          const k = P(t, 0.3 + i * 0.4, 0.5, "out"); if (k <= 0) return;
          g.globalAlpha = clamp(k * 1.6, 0, 1);
          brick(g, CX[i], Y0 - Math.round((1 - k) * 8), s, "dn", paper, Math.round((1 - k) * 3));
          g.globalAlpha = 1;
          if (k > 0.6) PX.text(g, NAMES[i], CX[i] + W6 / 2, Y0 - 22, { font: "v", size: 16, col: D.ink, align: "center" });
        });
        if (t > 0.6) { PX.text(g, "CITY", X0 - 6, Y0 + 3, { font: "v", size: 16, col: D.ink, align: "right" }); }
        // flights
        FLIGHTS.forEach((s, i) => {
          const t0 = tFl + 0.5 + i * gap, k = P(t, t0, 0.9, "io"), [px, py] = PILE[i];
          const tx = CX[i] + 3 * CW, ty = Y0 + CH;
          const vis = P(t, tFl + i * 0.2, 0.4, "out"); if (vis <= 0) return;
          const lift = Math.round(Math.sin(k * Math.PI) * 4), x = lerp(px, tx, k), y = lerp(py, ty, k) - lift;
          g.globalAlpha = clamp(vis * 1.5, 0, 1);
          brick(g, x, y, s, "up", paper, lift);
          g.globalAlpha = 1;
          if (k >= 1) { const sk = P(t, t0 + 0.9, 0.35, "out"); if (sk < 1) { g.globalAlpha = 0.6 * (1 - sk); R(g, tx - 4, ty - 1, 6 * CW + 8, 2, D.cream); g.globalAlpha = 1; } }
        });
        if (t >= tFl) { g.globalAlpha = P(t, tFl, 0.4, "out"); PX.text(g, "FLIGHT", X0 + 3 * CW - 8, Y0 + CH + 6, { font: "v", size: 16, col: D.ink, align: "right" }); g.globalAlpha = 1; }
        // pencil bracket under the finished route
        if (t >= tCh) {
          const k = P(t, tCh, 1.0, "io"), xa = X0, xb = X0 + 3 * W6 + 2 * GAP, yb = Y0 + 2 * CH + 18, xe = lerp(xa, xb, k);
          for (let x = xa; x < xe; x++) R(g, x, yb + Math.round(Math.sin(x * 0.21) * 0.6), 1, 1, pen);
          R(g, xa, yb - 5, 1, 5, pen); if (k >= 1) R(g, xb, yb - 5, 1, 5, pen);
        }
      });
      // lamp light from the top right
      shade(g, 440, 120, 90, 470, 0.55);
      lampGlow(g, 470, 90, 260, 0.08);
      // near: pencil lying across the page corner, and the edge of a pipette
      PX.par(g, c, 1.1, () => {
        const px0 = 452, py0 = 330;
        for (let i = 0; i < 110; i++) { const x = px0 + i, y = py0 - Math.round(i * 0.36); R(g, x + 3, y + 4, 1, 3, rgba(D.n0, 0.35)); R(g, x, y, 1, 4, i < 8 ? D.paper : i < 102 ? D.amber[1] : D.rose[1]); R(g, x, y, 1, 1, i < 8 ? D.cream : i < 102 ? D.amber[0] : D.rose[0]); R(g, x, y + 3, 1, 1, i < 8 ? D.paperD : i < 102 ? D.amber[2] : D.rose[2]); }
        R(g, px0 - 2, py0 + 1, 2, 2, D.ink);
        poly(g, [[-20, 304], [60, 330], [56, 342], [-20, 316]], D.n4); poly(g, [[-20, 304], [60, 330], [59, 333], [-20, 307]], D.n5);
        poly(g, [[60, 330], [88, 339], [84, 351], [56, 342]], D.teal[2]); poly(g, [[60, 330], [88, 339], [87, 342], [59, 333]], D.teal[1]);
      });
      dust(g, 37, 22, t, [380, 40, 220, 200], 0.35);
      PX.vignette(g, 0.5);
    };
  };

  // ---------- tiny double strand (10 px ladder) at angle a ----------
  const strandBits = (seed) => { const r = PX.rnd(seed), s = []; for (let i = 0; i < 10; i++) s.push("ACGT"[Math.floor(r() * 4)]); return s; };
  const tinyStrand = (g, x, y, a, bits, dim, am) => {   // am = 0..1 blend to amber (the correct route)
    const ca = Math.cos(a), sa = Math.sin(a), n = bits.length;
    const bb = mix(mix(D.teal[0], D.n3, 0.5 + dim * 0.4), D.amber[0], am), bb2 = mix(mix(D.teal[2], D.n1, 0.3 + dim * 0.5), D.amber[2], am);
    for (let i = 0; i < n; i++) {
      const px = x + ca * (i - n / 2 + 0.5), py = y + sa * (i - n / 2 + 0.5), b = bits[i];
      R(g, px + sa * 1.5, py - ca * 1.5, 1, 1, bb);
      R(g, px + sa * 0.5, py - ca * 0.5, 1, 1, mix(mix(D.dna[b], D.n2, dim), D.amber[i % 3 ? 1 : 0], am));
      R(g, px - sa * 0.5, py + ca * 0.5, 1, 1, mix(mix(D.dna[COMP[b]], D.n2, dim + 0.12), D.amber[1], am));
      R(g, px - sa * 1.5, py + ca * 1.5, 1, 1, bb2);
    }
  };

  // ======================= tube_chains =======================
  // Macro inside a glass test tube standing in a rack under lab light: rounded tube bottom, liquid with slow
  // caustics; hundreds of tiny DNA strands drift, bump and link into chains of different lengths (o.link [1.0,8.0]);
  // at o.right (10.0) one 7-piece chain (the correct route) lights amber while every other chain dims.
  K.tube_chains = (o) => {
    const X0 = 172, X1 = 468, XC = 320, YB = 206, RB = 148, MEN = 58, SEG = 10;
    const inside = (x, y) => y >= MEN && x > X0 + 3 && x < X1 - 3 && (y <= YB || (x - XC) ** 2 + (y - YB) ** 2 <= (RB - 4) ** 2);
    const span = (y) => (y <= YB ? (X1 - X0) / 2 : Math.sqrt(Math.max(0, RB * RB - (y - YB) ** 2)));
    const r = PX.rnd(73), CH = [];
    for (let k = 0; k < 58; k++) {   // chain 0 = the right answer: 7 pieces near the centre
      const L = k === 0 ? 7 : [1, 1, 2, 2, 3, 3, 4, 4, 5, 6, 7][Math.floor(r() * 11)];
      let x = XC, y = 186; if (k) do { x = X0 + 30 + r() * (X1 - X0 - 60); y = MEN + 30 + r() * 250; } while (!inside(x, y + 30) || !inside(x, y - 10));
      const ch = { L, x, y, a: k === 0 ? -0.1 : r() * 6.28, ph: r() * 6.28, seg: [] };
      for (let j = 0; j < L; j++) ch.seg.push({ dx: (r() - 0.5) * 70, dy: (r() - 0.5) * 50, a: r() * 6.28, spin: (r() - 0.5) * 1.2, tj: r(), bits: strandBits(k * 31 + j * 7 + 3), ph: r() * 6.28 });
      CH.push(ch);
    }
    const FAR = []; while (FAR.length < 200) { const x = X0 + r() * (X1 - X0), y = MEN + r() * 300; if (inside(x, y)) FAR.push([x, y, r() * 6.28, r()]); }
    const BUB = []; for (let i = 0; i < 9; i++) BUB.push([X0 + 30 + r() * 230, r(), 4 + r() * 6, r() * 6.28]);
    const BOK = []; for (let i = 0; i < 14; i++) BOK.push([r() < 0.5 ? r() * 150 : 490 + r() * 150, r() * 360, 8 + r() * 14, r()]);
    return (g, t, d, c) => {
      const [l0, l1] = rng(o, "link", 1.0, 8.0, d, 16), tR = tm(o, "right", 10.0, d, 16);
      const lit = P(t, tR, 1.2, "io");
      // far: the blurred lab and the neighbouring tubes in the rack
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 440, mix(D.n3, D.lampD, 0.1), D.n1, 8);
        g.filter = "blur(3px)";
        for (const [x, col] of [[36, D.rust[2]], [604, D.amber[2]]]) {
          R(g, x - 52, -40, 104, 300, rgba(D.glass, 0.1)); PX.circle(g, x, 260, 52, rgba(D.glass, 0.1));
          R(g, x - 48, 90, 96, 170, rgba(col, 0.25)); PX.circle(g, x, 258, 48, rgba(col, 0.25)); R(g, x - 40, -40, 4, 330, rgba(D.cream, 0.18));
        }
        g.filter = "none";
        for (const [x, y, rr, k] of BOK) PX.glow(g, x, y, rr, rgba(k < 0.6 ? D.lamp : D.teal[0], 0.3), 0.5);
      });
      // the tube interior
      PX.par(g, c, 0.85, () => {
        R(g, X0, -40, X1 - X0, MEN + 40, rgba(D.glass, 0.06));
        const top = mix(D.teal[2], D.n2, 0.1), bot = mix(D.n1, D.teal[2], 0.25);
        for (let y = MEN; y < 364; y++) { const w = span(y); if (w <= 0) continue; R(g, XC - w, y, 2 * w, 1, mix(top, bot, (y - MEN) / 300)); }
        for (let x = X0; x < X1; x++) { const e = Math.min(x - X0, X1 - x), up = Math.round(10 * Math.exp(-e / 14)); R(g, x, MEN - up, 1, up, top); R(g, x, MEN - up, 1, 1, mix(D.teal[0], D.n3, 0.3)); }
        // caustics (light rippling down from the surface)
        for (let i = 0; i < 12; i++) {
          const y0 = MEN + 16 + i * 24;
          for (let x = X0 + 4; x < X1 - 4; x += 2) {
            const k = Math.sin(x * 0.045 + t * 0.35 + i * 1.7); if (k < 0.2) continue;
            const y = y0 + 6 * Math.sin(x * 0.03 + t * 0.5 + i) + 3 * Math.sin(x * 0.071 - t * 0.37 + i * 2);
            if (!inside(x, y)) continue;
            g.globalAlpha = 0.12 * k * (1 - i / 14); R(g, x, y, 2, 1, D.teal[0]);
          }
        }
        g.globalAlpha = 1;
        for (const [x, y, ph, k] of FAR) { const xx = x + Math.sin(t * 0.3 + ph) * 6, yy = y + Math.cos(t * 0.25 + ph) * 4; if (!inside(xx, yy)) continue; g.globalAlpha = (0.3 + 0.2 * k) * (1 - lit * 0.4); R(g, xx, yy, 2 + Math.round(k * 2), 1, mix(D.teal[1], D.n3, 0.25)); }
        g.globalAlpha = 1;
        for (const [x, ph, sp, w] of BUB) { const y = 330 - (((t * sp + ph * 280) % 280) + 280) % 280, xx = x + Math.sin(t + w) * 2; if (!inside(xx, y) || y < MEN + 4) continue; g.globalAlpha = 0.4; PX.box(g, xx, y, 3, 3, D.teal[0]); R(g, xx, y, 1, 1, D.cream); }
        g.globalAlpha = 1;
        // chains
        const right = CH[0];
        if (lit > 0) PX.glow(g, right.x, right.y, 64, rgba(D.amber[1], 0.4), lit * 0.45);
        for (let k = CH.length - 1; k >= 0; k--) {
          const ch = CH[k], isR = k === 0;
          const cx = ch.x + Math.sin(t * 0.17 + ch.ph) * (isR ? 6 * (1 - lit) : 12), cy = ch.y + Math.cos(t * 0.13 + ch.ph) * (isR ? 4 * (1 - lit) : 9);
          const ca = ch.a + Math.sin(t * 0.21 + ch.ph) * (isR ? 0.12 * (1 - lit) : 0.35);
          const dim = isR ? 0 : lit * 0.55;
          ch.seg.forEach((s, j) => {
            const tj = l0 + s.tj * (l1 - l0), jk = ch.L === 1 ? 0 : P(t, tj, 0.9, "io");
            const off = (j - (ch.L - 1) / 2) * SEG, bend = Math.sin(j * 0.9 + ch.ph + t * 0.3) * 3, ja = ca + Math.cos(j * 0.9 + ch.ph + t * 0.3) * 0.25;
            const sx = cx + Math.cos(ca) * off - Math.sin(ca) * bend, sy = cy + Math.sin(ca) * off + Math.cos(ca) * bend;
            const fx = cx + s.dx + Math.sin(t * 0.6 + s.ph) * 5, fy = cy + s.dy + Math.cos(t * 0.5 + s.ph) * 4, fa = s.a + t * s.spin;
            const x = lerp(fx, sx, jk), y = lerp(fy, sy, jk), a = jk >= 1 ? ja : fa + (ja - fa) * jk;
            if (!inside(x, y)) return;
            g.globalAlpha = isR ? 1 : 1 - lit * 0.45;
            tinyStrand(g, x, y, a, s.bits, dim, isR ? lit : 0);
            if (jk > 0.8 && jk < 1 && j > 0) { g.globalAlpha = 0.7; R(g, x - Math.cos(ca) * 5, y - Math.sin(ca) * 5, 1, 1, D.cream); }
          });
        }
        g.globalAlpha = 1;
        // darker liquid near the glass (refraction)
        for (let y = MEN - 10; y < 364; y++) {
          const w = span(Math.max(y, MEN)); if (w <= 0) continue;
          for (let i = 0; i < 14; i += 2) { g.globalAlpha = 0.45 * (1 - i / 14); R(g, XC - w + i, y, 2, 1, D.n0); R(g, XC + w - i - 2, y, 2, 1, D.n0); }
        }
        g.globalAlpha = 1;
      });
      // glass wall: straight sides + round bottom, highlights on the lit (left) side
      PX.par(g, c, 0.9, () => {
        for (let y = -40; y < 364; y++) {
          const dy = y - YB, wi = y <= YB ? RB : Math.sqrt(Math.max(0, RB * RB - dy * dy)), wo = y <= YB ? RB + 8 : Math.sqrt(Math.max(0, (RB + 8) ** 2 - dy * dy));
          if (wo <= 0) continue;
          R(g, XC - wo, y, wo - wi, 1, rgba(D.glass, 0.17)); R(g, XC + wi, y, wo - wi, 1, rgba(D.glass, 0.13));
          const wh = y <= YB ? RB + 5 : Math.sqrt(Math.max(0, (RB + 5) ** 2 - dy * dy));
          if (wh > 0) { R(g, XC - wh, y, 1, 1, rgba(D.cream, y < YB + 60 ? 0.5 : 0.25)); R(g, XC + wh - 3, y, 1, 1, rgba(D.glass, 0.3)); }
        }
      });
      // near: the rack's top plate in front of the tube
      PX.par(g, c, 1.15, () => {
        R(g, -40, 10, 720, 26, D.n4); R(g, -40, 10, 720, 1, D.n6); R(g, -40, 11, 720, 1, D.n5); R(g, -40, 34, 720, 3, D.n2); R(g, -40, -40, 720, 50, D.n2); R(g, -40, 8, 720, 2, D.n1);
        for (const hx of [XC - RB - 14, XC + RB + 6]) R(g, hx, 14, 8, 18, D.n3);
        for (let x = -40; x < 680; x += 40) R(g, x, 22, 2, 2, D.n2);
      });
      lampGlow(g, 300, -20, 300, 0.18);
      shade(g, 320, 170, 120, 420, 0.5);
      PX.vignette(g, 0.5);
    };
  };

  // ======================= serial_parallel =======================
  // A museum hall at night with two lit diorama cases. Left (lit at o.left 0.5): a tiny old computer and one worker
  // robot feeding it route cards from a long queue, one after another, slowly (o.cycle 2.4 s per card). Right (lit at
  // o.right 3.5): a test tube full of tiny worker dots, all busy at once. Brass plaques "ONE AFTER ANOTHER" /
  // "ALL AT ONCE" light with their case.
  K.serial_parallel = (o) => {
    const r = PX.rnd(83), DOTS = [];
    const TX = 470, TT = 96, TB = 222, TR = 24;   // right diorama test tube
    while (DOTS.length < 520) { const x = TX - TR + 3 + r() * (2 * TR - 6), y = TT + 22 + r() * (TB - TT - 22 + TR - 4); if (y > TB && (x - TX) ** 2 + (y - TB) ** 2 > (TR - 4) ** 2) continue; DOTS.push([x, y, r() * 6.28, 0.8 + r() * 1.6, r()]); }
    // the worker robot, native pixels (~40 px tall), x = centre, y = feet
    const robot = (g, x, y, t, face, fr, carry, lit) => {
      const bob = fr ? 1 : 0, [hi, mid, lo] = D.steel;
      R(g, x - 9, y, 18, 2, rgba(D.n0, 0.45));
      // legs
      const l1 = fr ? -2 : 0, l2 = fr ? 1 : 0;
      R(g, x - 5, y - 9 + Math.min(0, l1), 3, 9, D.n4); R(g, x - 6, y - 2, 5, 2, D.n2);
      R(g, x + 2, y - 9 + Math.min(0, l2), 3, 9, D.n5); R(g, x + 1, y - 2, 5, 2, D.n2);
      // body
      const by = y - 23 + bob;
      R(g, x - 8, by, 16, 14, mid); R(g, x - 8, by, 16, 1, hi); R(g, x - 8, by, 1, 14, hi); R(g, x + 6, by + 1, 2, 13, lo); R(g, x - 7, by + 13, 15, 1, lo);
      R(g, x - 4, by + 4, 8, 5, D.n3); R(g, x - 3, by + 5, 1, 1, mix(D.amber[1], D.n3, 1 - lit)); R(g, x - 1, by + 5, 1, 1, mix(D.moss[1], D.n3, 1 - lit)); R(g, x - 3, by + 7, 6, 1, D.n4);
      R(g, x - 2, by - 2, 4, 2, D.n4);
      // head with visor and one eye looking where it walks
      const hy = by - 13;
      R(g, x - 7, hy, 14, 11, mid); R(g, x - 7, hy, 14, 1, hi); R(g, x - 7, hy, 1, 11, hi); R(g, x + 5, hy + 1, 2, 10, lo);
      R(g, x - 5, hy + 3, 10, 5, D.n1); R(g, x + (face > 0 ? 1 : -4), hy + 4, 3, 3, D.cream); R(g, x + (face > 0 ? 1 : -4), hy + 4, 1, 1, D.lamp);
      R(g, x - 8, hy + 4, 1, 3, lo); R(g, x + 7, hy + 4, 1, 3, lo);
      R(g, x, hy - 4, 1, 4, D.n6); R(g, x - 1, hy - 6, 3, 2, PX.blink(t, 1.6, 0.5) ? mix(D.amber[1], D.n4, 1 - lit) : D.n5);
      // arms
      if (carry) {
        const ax = face > 0 ? x + 6 : x - 14;
        R(g, ax, by + 3, 8, 3, lo); R(g, face > 0 ? x + 10 : x - 15, by - 1, 7, 11, D.cream); R(g, face > 0 ? x + 16 : x - 15, by - 1, 1, 11, D.paperD);
        R(g, face > 0 ? x + 11 : x - 14, by + 2, 4, 1, mix(D.ink, D.paper, 0.5)); R(g, face > 0 ? x + 11 : x - 14, by + 5, 3, 1, mix(D.ink, D.paper, 0.5));
      } else { R(g, x - 11, by + 2, 3, 10, lo); R(g, x + 8, by + 2, 3, 10, mid); }
    };
    return (g, t, d, c) => {
      const tL = tm(o, "left", 0.5, d, 9.5), tRt = tm(o, "right", 3.5, d, 9.5), cyc = opt(o, "cycle", 2.4);
      const litL = P(t, tL, 0.8, "io"), litR = P(t, tRt, 0.9, "io");
      // far: the hall
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 380, mix(D.n3, D.plum[2], 0.12), D.n1, 9);
        R(g, -40, 196, 720, 2, D.n3);
        for (let x = -30; x < 680; x += 96) { R(g, x, 210, 80, 70, D.n2); R(g, x, 210, 80, 1, D.n3); }
        for (const x of [-10, 618]) { R(g, x, 70, 44, 56, D.n2); R(g, x + 3, 73, 38, 50, mix(D.n3, D.moss[2], 0.2)); }
        R(g, -40, 0, 720, 8, D.n1);
        for (const x of [175, 465]) { R(g, x - 6, 6, 12, 7, D.n4); R(g, x - 4, 13, 8, 2, D.n5); }
      });
      // floor with soft reflections
      PX.par(g, c, 0.7, () => {
        PX.vgrad(g, -40, 300, 720, 80, mix(D.n2, D.n3, 0.3).slice(0), D.n1, 5);
        for (let i = 0; i < 10; i++) { g.globalAlpha = 0.07 * (1 - i / 10); R(g, 46, 316 + i * 3, 262, 3, rgba(D.lamp, litL)); R(g, 336, 316 + i * 3, 262, 3, rgba(D.lamp, litR)); } g.globalAlpha = 1;
      });
      // mid: the two cases on plinths
      PX.par(g, c, 0.85, () => {
        for (const [x0, lit] of [[34, litL], [324, litR]]) {
          const w = 282;
          R(g, x0 + 10, 270, w - 20, 44, WOOD[2]); R(g, x0 + 10, 270, w - 20, 1, WOOD[0]); R(g, x0 + 10, 310, w - 20, 4, D.n1);
          R(g, x0, 56, w, 216, WOOD[1]); R(g, x0, 56, w, 1, WOOD[0]); R(g, x0, 56, 1, 216, WOOD[0]); R(g, x0 + w - 2, 56, 2, 216, WOOD[2]);
          // interior back wall + floor (lit when the case lamp is on)
          const ix = x0 + 10, iy = 66, iw = w - 20, ih = 196;
          PX.vgrad(g, ix, iy, iw, ih - 40, mix(D.n3, D.lampD, 0.12 + 0.2 * lit), mix(D.n2, D.n1, 0.5 - 0.3 * lit), 6);
          PX.vgrad(g, ix, iy + ih - 40, iw, 40, mix(D.paperD, D.n2, 0.75 - 0.35 * lit), mix(D.paperD, D.n1, 0.85 - 0.3 * lit), 4);
          R(g, ix, iy + ih - 40, iw, 1, mix(D.paperD, D.n3, 0.6 - 0.3 * lit));
          // brass plaque on the plinth
          const px = x0 + w / 2;
          R(g, px - 78, 280, 156, 20, BRASS[2]); R(g, px - 77, 281, 154, 18, mix(BRASS[1], BRASS[2], 0.6 - 0.6 * lit)); R(g, px - 77, 281, 154, 1, mix(BRASS[0], BRASS[2], 0.5 - 0.5 * lit));
        }
      });
      // left diorama contents
      PX.par(g, c, 0.85, () => {
        const fy = 222;   // diorama floor line (feet)
        g.save(); g.beginPath(); g.rect(44, 66, 262, 196); g.clip();
        // painted backdrop: a row of old tape cabinets
        for (let i = 0; i < 6; i++) { const bx = 56 + i * 28; R(g, bx, 120, 24, 74, mix(D.n3, D.paperD, 0.12 + 0.12 * litL)); R(g, bx, 120, 24, 1, mix(D.n4, D.paperD, 0.3 * litL));
          for (const ry of [134, 152]) { PX.circle(g, bx + 7, ry, 4, mix(D.n2, D.n3, 0.5)); PX.circle(g, bx + 17, ry, 4, mix(D.n2, D.n3, 0.5)); } R(g, bx + 4, 168, 16, 6, mix(D.n2, D.n3, 0.6)); }
        // conveyor of route cards, moving one slot per cycle
        R(g, 44, fy - 3, 108, 6, D.n3); R(g, 44, fy - 3, 108, 1, D.n5); for (let x = 46; x < 150; x += 6) R(g, x, fy + 1, 2, 1, D.n2);
        const n = t < tL ? 0 : Math.floor((t - tL) / cyc), ph = t < tL ? 0 : ((t - tL) % cyc) / cyc;
        const shift = ph < 0.15 ? 0 : E(clamp((ph - 0.15) / 0.12, 0, 1), "io");
        for (let i = 0; i < 16; i++) {
          const x = 138 - (i - (ph >= 0.15 ? 1 : 0) + (ph >= 0.15 ? 1 - shift : 0)) * 7;
          if (i === 0 && ph >= 0.12) continue;   // picked up
          if (x < 40) continue;
          R(g, x, fy - 14, 5, 11, mix(D.cream, D.paper, 0.4 - 0.3 * litL)); R(g, x + 4, fy - 14, 1, 11, D.paperD);
          R(g, x + 1, fy - 11, 3, 1, mix(D.ink, D.paper, 0.5)); R(g, x + 1, fy - 8, 2, 1, mix(D.ink, D.paper, 0.5));
        }
        // the old computer: cabinet with two tape reels, a small screen and a card slot
        const cx0 = 226;
        R(g, cx0, fy - 62, 56, 62, mix(D.paper, D.n4, 0.45 - 0.25 * litL)); R(g, cx0, fy - 62, 56, 1, D.paper); R(g, cx0 + 54, fy - 62, 2, 62, mix(D.paperD, D.n2, 0.4));
        for (const [rx, ry] of [[cx0 + 14, fy - 48], [cx0 + 40, fy - 48]]) { PX.circle(g, rx, ry, 9, D.n2); PX.circle(g, rx, ry, 7, D.n4); PX.circle(g, rx, ry, 2, D.n6); const a = t * (n % 2 ? 2 : 0.6) + rx; R(g, rx + Math.round(Math.cos(a) * 5), ry + Math.round(Math.sin(a) * 5), 2, 2, D.n6); }
        R(g, cx0 + 8, fy - 34, 40, 14, D.n1); R(g, cx0 + 9, fy - 33, 38, 12, mix(D.teal[2], D.n1, 0.5));
        // screen: the current route being checked, then its verdict
        if (t >= tL) {
          const sc = mix(D.teal[0], D.n3, 0.3);
          for (let i = 0; i < 6; i++) { const u = ph * 6 - i; if (u <= 0 || ph > 0.95) break; R(g, cx0 + 11 + i * 6, fy - 27 + ((i * 5 + n * 3) % 5) - 2, Math.min(6, u * 6), 1, sc); }
          if (ph > 0.55 && ph < 0.95) { const ok = n % 7 === 6; if (ok) tickB(g, cx0 + 40, fy - 31, D.moss[0]); else { PX.line(g, cx0 + 40, fy - 31, cx0 + 44, fy - 27, D.rust[0]); PX.line(g, cx0 + 44, fy - 31, cx0 + 40, fy - 27, D.rust[0]); } }
        }
        R(g, cx0 + 8, fy - 14, 16, 2, D.n1); R(g, cx0 + 34, fy - 15, 3, 3, mix(D.amber[1], D.n3, 1 - litL));
        // the robot: pick a card at the conveyor end, carry it to the slot, insert, walk back
        let rx2, carry = false, face = 1;
        if (ph < 0.15) { rx2 = 152; carry = ph > 0.08; }
        else if (ph < 0.5) { rx2 = lerp(152, 212, E((ph - 0.15) / 0.35, "io")); carry = true; }
        else if (ph < 0.62) { rx2 = 212; carry = ph < 0.56; }
        else { rx2 = lerp(212, 152, E((ph - 0.62) / 0.38, "io")); face = -1; }
        const walking = (ph > 0.15 && ph < 0.5) || ph > 0.62, fr = walking && Math.floor(t * 6) % 2;
        robot(g, Math.round(rx2), fy, t, face, fr, carry, litL);
        if (ph >= 0.5 && ph < 0.62) { const k = (ph - 0.5) / 0.12; R(g, cx0 + 8 + 16 * k - 6, fy - 15, 6, 2, D.cream); }
        g.restore();
        // case lamp strip
        g.globalAlpha = litL; R(g, 54, 67, 242, 2, D.lamp); g.globalAlpha = 1;
      });
      // right diorama contents: the busy test tube
      PX.par(g, c, 0.85, () => {
        g.save(); g.beginPath(); g.rect(334, 66, 262, 196); g.clip();
        const dimC = 1 - litR;
        // painted backdrop: lab shelves with flasks
        for (const sy of [120, 160]) { R(g, 344, sy, 242, 2, mix(D.n3, D.paperD, 0.15 + 0.15 * litR)); for (let i = 0; i < 9; i++) { const fx = 352 + i * 26 + (sy % 7); if (Math.abs(fx - TX) < 40) continue; R(g, fx, sy - 14, 8, 14, mix(D.n3, D.teal[2], 0.25 + 0.2 * litR)); R(g, fx + 2, sy - 19, 4, 5, mix(D.n3, D.teal[2], 0.2)); } }
        // little stand
        R(g, TX - 40, 238, 80, 6, mix(D.n4, D.n2, dimC)); R(g, TX - 40, 238, 80, 1, mix(D.n6, D.n3, dimC)); R(g, TX - 34, 210, 4, 28, D.n3); R(g, TX + 30, 210, 4, 28, D.n3); R(g, TX - 36, 206, 72, 4, mix(D.n5, D.n2, dimC));
        // tube body + liquid
        for (let y = TT; y <= TB + TR; y++) { const w = y <= TB ? TR : Math.sqrt(Math.max(0, TR * TR - (y - TB) ** 2)); R(g, TX - w, y, 2 * w, 1, rgba(D.glass, 0.12)); if (y > TT + 20) { const wl = Math.max(0, w - 2); R(g, TX - wl, y, 2 * wl, 1, mix(mix(D.teal[2], D.n1, 0.25), D.n1, 0.6 * dimC)); } }
        R(g, TX - TR + 2, TT + 20, 2 * TR - 4, 1, mix(D.teal[0], D.n3, 0.4 + 0.4 * dimC));
        if (litR > 0) PX.glow(g, TX, TB - 20, 60, rgba(D.amber[1], 0.4), litR * 0.4);
        // trillions of tiny workers, all busy at once
        for (const [x, y, phs, sp, k] of DOTS) {
          const a = t * sp * 2.2 + phs, xx = x + Math.cos(a) * 2.2, yy = y + Math.sin(a * 1.3) * 1.6;
          g.globalAlpha = litR * (0.55 + 0.45 * Math.sin(t * 4 * sp + phs)) + dimC * 0.18;
          R(g, xx, yy, 1, 1, k < 0.6 ? D.amber[0] : k < 0.85 ? D.cream : D.amber[1]);
        }
        g.globalAlpha = 1;
        R(g, TX - TR, TT, 1, TB - TT, rgba(D.cream, 0.5)); R(g, TX - TR + 3, TT, 1, TB - TT, rgba(D.cream, 0.18)); R(g, TX + TR - 1, TT, 1, TB - TT, rgba(D.glass, 0.35));
        R(g, TX - TR - 2, TT - 2, 2 * TR + 4, 3, mix(D.glass, D.n4, 0.4 + 0.4 * dimC));
        g.restore();
        g.globalAlpha = litR; R(g, 344, 67, 242, 2, D.lamp); g.globalAlpha = 1;
      });
      // case glass: faint reflections, and the lamp light inside each case
      PX.par(g, c, 0.86, () => {
        for (const x0 of [44, 334]) { for (const [ox, w] of [[40, 10], [58, 3], [190, 6]]) poly(g, [[x0 + ox, 262], [x0 + ox + w, 262], [x0 + ox + w + 60, 66], [x0 + ox + 60, 66]], rgba(D.cream, 0.035)); }
        lampGlow(g, 175, 90, 170, 0.35 * litL); lampGlow(g, 465, 90, 170, 0.35 * litR);
        if (litL > 0.05) { g.globalAlpha = litL; PX.text(g, "ONE AFTER ANOTHER", 175, 286, { size: 8, col: D.ink, align: "center" }); g.globalAlpha = 1; }
        if (litR > 0.05) { g.globalAlpha = litR; PX.text(g, "ALL AT ONCE", 465, 286, { size: 8, col: D.ink, align: "center" }); g.globalAlpha = 1; }
      });
      shade(g, 320, 170, 150, 420, 0.45);
      // near: velvet rope on brass posts
      PX.par(g, c, 1.15, () => {
        for (const x of [-6, 320, 646]) { R(g, x - 3, 300, 6, 60, BRASS[2]); R(g, x - 2, 300, 2, 60, BRASS[1]); R(g, x - 6, 296, 12, 5, BRASS[1]); R(g, x - 5, 296, 10, 1, BRASS[0]); R(g, x - 8, 354, 16, 6, BRASS[2]); }
        for (let x = -6; x < 646; x++) { const u = ((x + 6) % 326) / 326, y = 304 + Math.round(Math.sin(u * Math.PI) * 18); R(g, x, y, 1, 4, mix(D.rust[2], D.n0, 0.35)); R(g, x, y, 1, 1, mix(D.rust[1], D.n2, 0.4)); }
      });
      dust(g, 47, 20, t, [120, 70, 400, 140], 0.3);
      PX.vignette(g, 0.55);
    };
  };

  // short twisted DNA piece (helix) from (x,y) along angle a, length len, phase ph; alpha via globalAlpha
  const helixPiece = (g, x, y, a, len, ph, dim) => {
    const ca = Math.cos(a), sa = Math.sin(a), b1 = mix(D.cream, D.n2, dim + 0.1), b2 = mix(D.teal[0], D.n2, dim + 0.2);
    for (let i = 0; i < len; i++) {
      const w = Math.sin(i * 0.55 + ph) * 3, px = x + ca * i, py = y + sa * i;
      R(g, px - sa * w, py + ca * w, 1, 1, b1); R(g, px + sa * w, py - ca * w, 1, 1, b2);
      if (i % 4 === 0 && Math.abs(w) > 2) { const b = "ACGT"[(i + Math.round(ph * 3)) % 4]; for (let k = -Math.abs(w) + 1; k < Math.abs(w); k++) R(g, px + sa * k, py - ca * k, 1, 1, mix(D.dna[b], D.n2, dim + 0.3)); }
    }
  };

  // a small rotating Earth, shaded per pixel (light from the upper left), 4 tones per material
  const OCEAN = [mix(D.steel[0], D.teal[0], 0.4), mix(D.steel[1], D.teal[1], 0.45), mix(D.steel[2], D.teal[2], 0.5), mix(D.n1, D.steel[2], 0.35)];
  const LAND = [mix(D.moss[0], D.paper, 0.2), D.moss[1], D.moss[2], mix(D.n1, D.moss[2], 0.35)];
  const ICE = [D.cream, mix(D.cream, D.n6, 0.4), D.n5, D.n2];
  const globe = (g, cx, cy, er, t) => {
    const lx = -0.62, ly = -0.42, lz = 0.66, rot = t * 0.18;
    for (let py = -er; py <= er; py++) for (let px = -er; px <= er; px++) {
      const x = px / er, y = py / er, q = 1 - x * x - y * y; if (q < 0) continue;
      const z = Math.sqrt(q), lon = Math.atan2(x, z) + rot, lat = Math.asin(y);
      const land = Math.sin(lon * 2 + 0.6) * 0.6 + Math.sin(lon * 3.3 + lat * 2.1 + 1.3) * 0.45 + Math.sin(lat * 4.5 - lon) * 0.35 + Math.cos(lat * 1.4) * 0.15 - 0.42;
      const cloud = Math.sin(lon * 5 + lat * 9 + t * 0.25) * 0.5 + Math.sin(lon * 9 - lat * 4) * 0.4 + Math.sin(lat * 13) * 0.3;
      const lit = x * lx + y * ly + z * lz, lv = lit > 0.62 ? 0 : lit > 0.3 ? 1 : lit > 0.02 ? 2 : 3;
      let pal = Math.abs(lat) > 1.2 ? ICE : land > 0 ? LAND : OCEAN;
      let col = pal[lv];
      if (cloud > 0.75 && lv < 3) col = lv === 0 ? D.cream : lv === 1 ? mix(D.cream, D.n6, 0.3) : D.n5;
      if (lv === 2 && ((px + py) & 1) && lit < 0.12) col = pal[3];
      R(g, cx + px, cy + py, 1, 1, col);
    }
  };

  // ======================= dna_vs_earth =======================
  // A giant brass balance scale floating in space, lit by the Earth: left pan holds the Earth, right pan a heap of
  // tangled DNA that grows from o.cities (1.0), where a brass counter "200 CITIES" appears; the beam tips past the
  // Earth at o.tip (4.0).
  K.dna_vs_earth = (o) => {
    const r = PX.rnd(97), STARS = [], BAND = [], HEAP = [], FLOAT = [];
    for (let i = 0; i < 260; i++) STARS.push([r() * 700 - 30, r() * 420 - 30, r(), r() * 6.28]);
    for (let i = 0; i < 900; i++) { const u = r() * 760 - 60, v = (r() + r() + r() - 1.5) * 46; BAND.push([u, u * 0.32 + 40 + v, r()]); }
    // tangled heap: long helix ropes wandering inside a unit half-dome (u -1..1, v 0..1), lower ones first
    for (let i = 0; i < 22; i++) {
      const k = i / 22, pts = []; let u = (r() - 0.5) * 1.4 * (0.4 + 0.6 * k), v = r() * 0.5 * (0.3 + 0.7 * k), hd = r() * 6.28;
      for (let j = 0; j < 46; j++) {
        hd += (r() - 0.5) * 0.9; let nu = u + Math.cos(hd) * 0.04, nv = v + Math.sin(hd) * 0.04;
        const lim = 0.3 + 0.7 * k;
        if (nu * nu + nv * nv > lim * lim || nv < 0) { hd += Math.PI * 0.8; nu = u; nv = v; }
        u = nu; v = nv; pts.push([u, v]);
      }
      HEAP.push({ pts, ph: r() * 6.28, k });
    }
    for (let i = 0; i < 5; i++) FLOAT.push([r() * 640, r() * 360, r() * 6.28, r() * 6.28]);
    const PX0 = 320, PY0 = 98, BL = 170;
    return (g, t, d, c) => {
      const tC = tm(o, "cities", 1.0, d, 8), tT = tm(o, "tip", 4.0, d, 8);
      const grow = P(t, tC, (tT - tC) + 1.6, "io");
      const th = PX.KF([[0, 0.2], [tC, 0.2], [tT - 0.5, 0.04], [tT + 0.2, -0.06], [tT + 1.6, -0.21]], t) + Math.sin(t * 1.1) * 0.006;
      // far: stars + a faint milky band
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -40, -40, 720, 440, D.n1, D.n0, 6);
        for (const [x, y, k] of BAND) { g.globalAlpha = 0.12 + 0.18 * k; R(g, x, y, 1, 1, k < 0.7 ? D.n4 : D.n6); }
        for (const [x, y, k, ph] of STARS) { g.globalAlpha = (0.3 + 0.6 * k) * (0.7 + 0.3 * Math.sin(t * 1.4 + ph)); R(g, x, y, 1, 1, k > 0.92 ? D.lamp : D.cream); if (k > 0.97) { R(g, x - 1, y, 3, 1, D.cream); R(g, x, y - 1, 1, 3, D.cream); } }
        g.globalAlpha = 1;
      });
      // mid: the scale
      PX.par(g, c, 0.85, () => {
        const ca = Math.cos(th), sa = Math.sin(th);
        const L = [PX0 - BL * ca, PY0 + BL * sa], Rr = [PX0 + BL * ca, PY0 - BL * sa];
        // pedestal + pillar
        poly(g, [[PX0 - 64, 336], [PX0 + 64, 336], [PX0 + 44, 312], [PX0 - 44, 312]], BRASS[2]); poly(g, [[PX0 - 64, 336], [PX0 - 44, 312], [PX0 - 40, 312], [PX0 - 58, 336]], BRASS[1]);
        R(g, PX0 - 70, 336, 140, 6, BRASS[2]); R(g, PX0 - 70, 336, 140, 1, BRASS[1]); R(g, PX0 - 46, 310, 92, 3, BRASS[1]); R(g, PX0 - 46, 310, 92, 1, BRASS[0]);
        R(g, PX0 - 4, PY0 + 6, 8, 206, BRASS[2]); R(g, PX0 - 4, PY0 + 6, 3, 206, BRASS[1]); R(g, PX0 - 4, PY0 + 6, 1, 206, BRASS[0]);
        for (const y of [150, 220, 280]) { R(g, PX0 - 7, y, 14, 4, BRASS[2]); R(g, PX0 - 7, y, 14, 1, BRASS[0]); }
        // tilt dial + needle under the pivot
        for (let i = -4; i <= 4; i++) { const a = i * 0.1; R(g, PX0 + Math.sin(a) * 34, PY0 + 6 + Math.cos(a) * 34, 1, 3, BRASS[0]); }
        PX.line(g, PX0, PY0, PX0 - Math.sin(th) * 34, PY0 + Math.cos(th) * 34, D.cream);
        // the beam
        const bw = 3;
        poly(g, [[L[0] - sa * bw, L[1] - ca * bw], [Rr[0] - sa * bw, Rr[1] - ca * bw], [Rr[0] + sa * bw, Rr[1] + ca * bw], [L[0] + sa * bw, L[1] + ca * bw]], BRASS[1]);
        PX.line(g, L[0] - sa * bw, L[1] - ca * bw, Rr[0] - sa * bw, Rr[1] - ca * bw, BRASS[0]);
        PX.line(g, L[0] + sa * bw, L[1] + ca * bw, Rr[0] + sa * bw, Rr[1] + ca * bw, BRASS[2]);
        PX.circle(g, PX0, PY0, 8, BRASS[2]); PX.circle(g, PX0, PY0, 6, BRASS[1]); R(g, PX0 - 3, PY0 - 4, 3, 2, BRASS[0]);
        poly(g, [[PX0 - 3, PY0 - 7], [PX0 + 3, PY0 - 7], [PX0, PY0 - 16]], BRASS[1]);
        // pans hanging straight down from the beam ends
        const pan = (ex, ey, content) => {
          R(g, ex - 2, ey - 2, 4, 6, BRASS[2]); PX.circle(g, ex, ey, 3, BRASS[1]);
          const py = ey + 112;
          for (const dx of [-40, 0, 40]) PX.line(g, ex, ey + 3, ex + dx, py, dx === 0 ? BRASS[2] : BRASS[1]);
          content(ex, py);
          ell(g, ex, py + 3, 46, 9, BRASS[2]); ell(g, ex, py, 46, 7, BRASS[1]); R(g, ex - 44, py, 22, 1, BRASS[0]);
          for (let i = 0; i < 12; i++) R(g, ex - 30 + i * 5, py + 9 + Math.round(Math.sin((i / 11) * Math.PI) * 3), 4, 1, BRASS[2]);
        };
        pan(L[0], L[1], (ex, py) => {
          // the Earth, sitting in the pan; lit from the left
          const cx = ex, cy = py - 40, er = 42;
          PX.glow(g, cx, cy, 90, rgba(D.teal[0], 0.3), 0.45);
          globe(g, cx, cy, er, t);
          for (let a = 2.0; a < 4.4; a += 0.02) R(g, cx + Math.cos(a) * (er + 1), cy + Math.sin(a) * (er + 1), 1, 1, D.teal[0]);
        });
        pan(Rr[0], Rr[1], (ex, py) => {
          // the growing heap of tangled DNA ropes (each a little helix following its path)
          const sc = 22 + 44 * grow, n = HEAP.length * grow;
          HEAP.forEach((h, i) => {
            const vis = clamp(n - i, 0, 1); if (vis <= 0) return;
            const m = Math.floor(h.pts.length * vis), dim = 0.45 * (1 - h.k);
            const P2 = h.pts.slice(0, m).map(([u, v]) => [ex + u * sc * 1.3, py - 3 - v * sc * 1.1]);
            for (const [x, y] of P2) R(g, x - 1, y + 1, 3, 3, rgba(D.n0, 0.55));
            for (let j = 1; j < P2.length; j++) {
              const [x0, y0] = P2[j - 1], [x1, y1] = P2[j], L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L, ny = (x1 - x0) / L;
              for (let s2 = 0; s2 < 3; s2++) {
                const q = j * 3 + s2, x = lerp(x0, x1, s2 / 3), y = lerp(y0, y1, s2 / 3), w = Math.sin(q * 0.45 + h.ph + t * 0.8) * 2.5;
                R(g, x + nx * w, y + ny * w, 1, 1, mix(D.cream, D.n2, dim)); R(g, x - nx * w, y - ny * w, 1, 1, mix(D.teal[0], D.n2, dim + 0.1));
                if (q % 4 === 0 && Math.abs(w) > 1.2) R(g, x, y, 1, 1, mix(D.dna["ACGT"[(q >> 2) % 4]], D.n2, dim + 0.2));
              }
            }
          });
          g.globalAlpha = 1;
        });
        // brass counter on the pedestal
        if (t >= tC) {
          const k = P(t, tC, 0.4, "back");
          R(g, PX0 - 48, 288, 96, 19, BRASS[2]); R(g, PX0 - 47, 289, 94, 17, BRASS[1]); R(g, PX0 - 47, 289, 94, 1, BRASS[0]);
          if (k > 0.3) PX.text(g, "200 CITIES", PX0, 294, { size: 8, col: D.ink, align: "center" });
        }
      });
      PX.glow(g, -60, 120, 260, rgba(D.lamp, 0.25), 0.5);
      // earthlight on the left of everything, deep shadow to the right
      shade(g, 160, 200, 120, 520, 0.45);
      // near: a few soft out-of-focus DNA pieces drifting past
      PX.par(g, c, 1.25, () => {
        g.filter = "blur(2px)";
        for (const [x, y, a, ph] of FLOAT) { const xx = ((x + t * 9) % 760) - 60, yy = y + Math.sin(t * 0.3 + ph) * 12; g.globalAlpha = 0.5; helixPiece(g, xx, yy, a + t * 0.1, 46, ph + t, 0.3); }
        g.filter = "none"; g.globalAlpha = 1;
      });
      PX.vignette(g, 0.5);
    };
  };

  // ======================= zoom_dna =======================
  // Powers-of-ten zoom, one continuous move: a hand holding a test tube -> a drop -> a cell -> the nucleus -> a DNA
  // double helix that unwinds. Each level is drawn natively at its own zoom (no bitmap scaling) and grows ~3.2x over
  // its o.step (d/5 = 1.4 s); levels cross-dissolve through a soft focus blur. The helix unwinds from o.unwind (6.0).
  K.zoom_dna = (o) => {
    const off = document.createElement("canvas"); off.width = 640; off.height = 360;
    const oc = off.getContext("2d");
    const r = PX.rnd(113), XC = 320, YC = 180, Z = 3.2;
    const BOK = []; for (let i = 0; i < 12; i++) BOK.push([r() * 640, r() * 360, 10 + r() * 22, r()]);
    const CELLS = []; for (let i = 0; i < 9; i++) { const a = r() * 6.28, d2 = 0.3 + r() * 0.5; CELLS.push([Math.cos(a) * d2, Math.sin(a) * d2, 0.8 + r() * 0.5, r() * 6.28]); }
    const ORG = []; for (let i = 0; i < 9; i++) { const a = r() * 6.28, d2 = 0.5 + r() * 0.35; ORG.push([Math.cos(a) * d2, Math.sin(a) * d2, r() * 3.14, r()]); }
    const THREADS = []; for (let i = 0; i < 14; i++) { const pts = []; let u = (r() - 0.5) * 1.4, v = (r() - 0.5) * 1.4, hd = r() * 6.28; for (let j = 0; j < 40; j++) { hd += (r() - 0.5) * 1.1; u += Math.cos(hd) * 0.035; v += Math.sin(hd) * 0.035; if (u * u + v * v > 0.8) hd += 2.4; pts.push([u, v]); } THREADS.push(pts); }
    const SPECK = []; for (let i = 0; i < 70; i++) SPECK.push([r() * 640, r() * 360, r() * 6.28]);
    const ln = (gc, x0, y0, x1, y1, w, col) => { const L = Math.max(1, Math.hypot(x1 - x0, y1 - y0)), n = Math.ceil(L); for (let i = 0; i <= n; i++) R(gc, lerp(x0, x1, i / n) - w / 2, lerp(y0, y1, i / n) - w / 2, w, w, col); };
    const W = (s, k) => Math.max(1, Math.round(s * (k || 1)));

    // L0: a gloved-free hand holding a test tube at a lab bench; the zoom aims at a droplet in the liquid
    const lv0 = (gc, s, t) => {
      PX.vgrad(gc, 0, 0, 640, 360, mix(D.n3, D.lampD, 0.12), D.n1, 8);
      for (const [x, y, rr, k] of BOK) PX.glow(gc, XC + (x - XC) * Math.sqrt(s), YC + (y - YC) * Math.sqrt(s), rr * Math.sqrt(s), rgba(k < 0.6 ? D.lamp : D.teal[0], 0.35), 0.5);
      // out-of-focus lab behind: shelf with bottles and a bench edge
      { const q = Math.sqrt(s), sy = YC - 10 * q; gc.filter = "blur(2px)";
        R(gc, 0, sy, 640, 4 * q, D.n3);
        for (let i = 0; i < 14; i++) { const bx = XC + (i * 48 - 330) * q, h = (24 + (i * 7) % 16) * q, col = i % 3 === 0 ? mix(D.rust[2], D.n2, 0.4) : i % 3 === 1 ? mix(D.teal[2], D.n2, 0.2) : D.n4; R(gc, bx, sy - h, 16 * q, h, col); R(gc, bx + 2 * q, sy - h, 3 * q, h, rgba(D.cream, 0.12)); }
        gc.filter = "none"; }
      R(gc, 0, YC + 150 * Math.sqrt(s), 640, 400, mix(D.n2, D.n1, 0.4)); R(gc, 0, YC + 150 * Math.sqrt(s), 640, 1, D.n4);
      const hw = 15 * s, yT = YC - 112 * s, yB = YC + 46 * s, yL = YC - 34 * s;
      // tube glass + liquid
      for (let y = Math.max(-2, Math.floor(yT)); y < Math.min(362, yB + hw); y++) {
        const w = y <= yB ? hw : Math.sqrt(Math.max(0, hw * hw - (y - yB) ** 2)); if (w <= 0) continue;
        R(gc, XC - w, y, 2 * w, 1, rgba(D.glass, 0.16));
        if (y >= yL) { const wl = Math.max(0, w - W(s, 1.2)); R(gc, XC - wl, y, 2 * wl, 1, mix(D.teal[1], D.n2, 0.4 + 0.25 * clamp((y - yL) / (90 * s), 0, 1))); }
      }
      R(gc, XC - hw + W(s), yL, 2 * hw - 2 * W(s), W(s), D.teal[0]);
      R(gc, XC - hw - W(s, 1.5), yT - W(s, 2), 2 * hw + 2 * W(s, 1.5), W(s, 2.5), mix(D.glass, D.n5, 0.3));
      R(gc, XC - hw + W(s, 2.5), yT, W(s, 1.4), yB - yT, rgba(D.cream, 0.55)); R(gc, XC + hw - W(s, 3), yT, W(s), yB - yT, rgba(D.glass, 0.35));
      // the droplet the camera dives into
      PX.circle(gc, XC, YC, Math.max(1, Math.round(3 * s)), mix(D.teal[0], D.cream, 0.2)); R(gc, XC - s, YC - s * 1.5, W(s), W(s), D.cream);
      // arm from the upper right: sleeve, wrist, palm behind the tube, fingers wrapped across the front, thumb
      const yG = YC - 78 * s, hx = XC + 18 * s;
      poly(gc, [[hx + 14 * s, yG - 22 * s], [hx + 44 * s, yG - 6 * s], [hx + 230 * s, yG - 120 * s], [hx + 170 * s, yG - 170 * s]], COAT[1]);
      ln(gc, hx + 14 * s, yG - 22 * s, hx + 170 * s, yG - 170 * s, W(s, 2), COAT[0]); ln(gc, hx + 44 * s, yG - 6 * s, hx + 230 * s, yG - 120 * s, W(s, 3), COAT[2]);
      ln(gc, hx + 22 * s, yG - 20 * s, hx + 46 * s, yG - 8 * s, W(s, 2), COAT[2]);   // cuff seam
      poly(gc, [[hx - 4 * s, yG - 16 * s], [hx + 16 * s, yG - 22 * s], [hx + 34 * s, yG - 6 * s], [hx + 8 * s, yG + 16 * s]], SKIN_M[2]);
      ell(gc, hx + 4 * s, yG, 14 * s, 18 * s, SKIN_M[1]); ell(gc, hx + 2 * s, yG - 4 * s, 9 * s, 12 * s, SKIN_M[0]);
      for (let k = 0; k < 4; k++) {
        const y = yG - 16 * s + k * 9 * s, len = (40 - Math.abs(k - 1.4) * 5) * s, x0 = hx + 6 * s - len;
        R(gc, x0, y, len, 8 * s, SKIN_M[1]); R(gc, x0, y, len, W(s, 1.5), SKIN_M[0]); R(gc, x0, y + 7 * s - W(s), len, W(s), SKIN_M[2]);
        ell(gc, x0, y + 4 * s, 4 * s, 4 * s, SKIN_M[1]); R(gc, x0 - 2 * s, y + 1 * s, W(s, 2), W(s), SKIN_M[0]);
        R(gc, x0 + len * 0.45, y + 1 * s, W(s), 6 * s, SKIN_M[2]);
      }
    };
    // L1: a single drop of the liquid, a few cells floating in it
    const lv1 = (gc, s, t) => {
      PX.vgrad(gc, 0, 0, 640, 360, mix(D.teal[2], D.n1, 0.45), D.n1, 8);
      for (const [x, y, rr, k] of BOK) PX.glow(gc, x, y, rr * 1.5, rgba(D.teal[0], 0.25), 0.4);
      const Rd = 70 * s;
      PX.circle(gc, XC + 4 * s, YC + 6 * s, Math.round(Rd), rgba(D.n0, 0.35));
      PX.circle(gc, XC, YC, Math.round(Rd), mix(D.teal[1], D.n2, 0.5));
      PX.circle(gc, XC - Rd * 0.12, YC - Rd * 0.12, Math.round(Rd * 0.82), mix(D.teal[1], D.n2, 0.38));
      for (const [u, v, k, ph] of CELLS) {
        const cx = XC + u * Rd + Math.sin(t * 0.6 + ph) * 2 * s, cy = YC + v * Rd + Math.cos(t * 0.5 + ph) * 2 * s, cr = Math.round(7 * s * k);
        if (cr < 1) continue;
        PX.circle(gc, cx, cy, cr, rgba(D.rose[0], 0.28)); PX.circle(gc, cx, cy, Math.max(1, Math.round(cr * 0.38)), rgba(D.rose[2], 0.7));
        R(gc, cx - cr * 0.5, cy - cr * 0.7, W(s), W(s), rgba(D.cream, 0.5));
      }
      { const cr = Math.round(8 * s); PX.circle(gc, XC, YC, cr, rgba(D.rose[0], 0.4)); PX.circle(gc, XC, YC, Math.max(1, Math.round(cr * 0.4)), D.rose[2]); }
      for (let a = 0; a < 6.283; a += 0.6 / Math.max(1, Rd / 20)) R(gc, XC + Math.cos(a) * Rd, YC + Math.sin(a) * Rd, W(s, 1.2), W(s, 1.2), rgba(D.teal[0], a > 2.2 && a < 4.4 ? 0.9 : 0.4));
      ell(gc, XC - Rd * 0.42, YC - Rd * 0.5, Rd * 0.22, Rd * 0.1, rgba(D.cream, 0.55)); PX.circle(gc, XC + Rd * 0.45, YC + Rd * 0.48, Math.max(1, Math.round(Rd * 0.05)), rgba(D.cream, 0.35));
    };
    // L2: one cell, translucent and slightly irregular, with organelles; the nucleus sits at the centre
    const lv2 = (gc, s, t) => {
      PX.vgrad(gc, 0, 0, 640, 360, mix(D.teal[2], D.n1, 0.35), mix(D.n1, D.teal[2], 0.2), 8);
      for (const [x, y, rr] of BOK) PX.circle(gc, x, y, Math.round(rr * 2.2), rgba(D.rose[0], 0.06));
      const Rc = 104 * s, pts = [];
      for (let i = 0; i < 48; i++) { const a = (i / 48) * 6.283, rr = Rc * (1 + 0.04 * Math.sin(a * 3 + t * 0.7) + 0.025 * Math.sin(a * 5 - t * 0.4)); pts.push([XC + Math.cos(a) * rr, YC + Math.sin(a) * rr]); }
      poly(gc, pts, rgba(D.rose[0], 0.16)); poly(gc, pts.map(([x, y]) => [XC + (x - XC) * 0.93, YC + (y - YC) * 0.93]), rgba(D.teal[1], 0.14));
      for (let i = 0; i < 48; i++) ln(gc, pts[i][0], pts[i][1], pts[(i + 1) % 48][0], pts[(i + 1) % 48][1], W(s, 1.2), i > 16 && i < 34 ? rgba(D.rose[0], 0.85) : rgba(D.rose[0], 0.45));
      for (const [u, v, a, k] of ORG) {
        const ox = XC + u * Rc, oy = YC + v * Rc, L = 9 * s, ca = Math.cos(a + t * 0.1), sa = Math.sin(a + t * 0.1);
        for (let i = -L; i <= L; i += Math.max(0.5, s * 0.6)) PX.circle(gc, ox + ca * i, oy + sa * i, Math.max(1, Math.round(3.4 * s * Math.sqrt(1 - (i / (L + 0.01)) ** 2))), k < 0.6 ? mix(D.amber[2], D.n2, 0.35) : mix(D.teal[0], D.n3, 0.4));
      }
      const Rn = 34 * s;
      PX.circle(gc, XC, YC, Math.round(Rn + W(s, 2)), rgba(D.rose[0], 0.5)); PX.circle(gc, XC, YC, Math.round(Rn), mix(D.rose[2], D.n2, 0.3));
      PX.circle(gc, XC + Rn * 0.3, YC - Rn * 0.2, Math.max(1, Math.round(Rn * 0.25)), mix(D.rose[2], D.n1, 0.4));
      for (let i = 0; i < 18; i++) { const a = i * 2.4, d2 = (i % 5) / 6; R(gc, XC + Math.cos(a) * Rn * d2, YC + Math.sin(a) * Rn * d2, W(s), W(s), rgba(D.rose[0], 0.6)); }
    };
    // L3: the nucleus: double envelope with pores, tangled chromatin threads, one coiled thread at the centre
    const lv3 = (gc, s, t) => {
      PX.vgrad(gc, 0, 0, 640, 360, mix(D.teal[2], D.n1, 0.45), D.n1, 8);
      const Rn = 150 * s;
      PX.circle(gc, XC, YC, Math.round(Rn), mix(D.rose[2], D.n1, 0.38));
      PX.circle(gc, XC - Rn * 0.1, YC - Rn * 0.1, Math.round(Rn * 0.8), mix(D.rose[2], D.n1, 0.28));
      for (const pts of THREADS) {
        for (let j = 1; j < pts.length; j++) { const [u0, v0] = pts[j - 1], [u1, v1] = pts[j]; ln(gc, XC + u0 * Rn, YC + v0 * Rn, XC + u1 * Rn, YC + v1 * Rn, W(s, 1.4), rgba(D.rose[0], 0.55)); }
      }
      // the coil the camera aims at
      for (let i = 0; i < 120; i++) {
        const u = i / 120, a = u * 6.283 * 2.5 + t * 1.2, x = XC - 30 * s + u * 60 * s, w = Math.sin(a) * 6 * s;
        R(gc, x, YC + w, W(s, 1.4), W(s, 1.4), D.cream); R(gc, x, YC - w, W(s, 1.4), W(s, 1.4), mix(D.cream, D.teal[0], 0.5));
        if (i % 6 === 0 && Math.abs(w) > 2 * s) R(gc, x, YC - Math.abs(w), W(s), 2 * Math.abs(w), mix(D.dna["ACGT"[(i / 6) % 4]], D.n1, 0.2));
      }
      const step = 0.4 / Math.max(1, Rn / 40);
      for (let a = 0; a < 6.283; a += step) {
        const pore = Math.floor(a / 0.35) % 3 === 0 && (a % 0.35) < 0.08;
        if (pore) continue;
        R(gc, XC + Math.cos(a) * Rn, YC + Math.sin(a) * Rn, W(s, 1.4), W(s, 1.4), D.rose[1]);
        R(gc, XC + Math.cos(a) * (Rn + W(s, 4)), YC + Math.sin(a) * (Rn + W(s, 4)), W(s, 1.2), W(s, 1.2), a > 2.3 && a < 4.2 ? D.rose[0] : D.rose[2]);
      }
    };
    // L4: the double helix, base pairs in DNA colours; from o.unwind it unzips from the right
    const lv4 = (gc, s, t, uw) => {
      PX.vgrad(gc, 0, 0, 640, 360, mix(D.rose[2], D.n1, 0.65), D.n1, 8);
      gc.filter = "blur(3px)"; gc.globalAlpha = 0.35;
      for (const pts of THREADS.slice(0, 8)) for (let j = 1; j < pts.length; j++) { const [u0, v0] = pts[j - 1], [u1, v1] = pts[j]; ln(gc, XC + u0 * 420 + t * 3, YC + v0 * 260, XC + u1 * 420 + t * 3, YC + v1 * 260, 4, D.rose[1]); }
      gc.filter = "none"; gc.globalAlpha = 1;
      for (const [x, y, ph] of SPECK) { gc.globalAlpha = 0.25 + 0.2 * Math.sin(t + ph); R(gc, (x + t * 4) % 640, y + Math.sin(t * 0.5 + ph) * 3, 1, 1, D.rose[0]); }
      gc.globalAlpha = 1;
      const A = 30 * s, k = 0.085 / s, ph = t * 1.4, ux = lerp(700, 210, uw);
      const pos = (x, side) => { const open = Math.max(0, x - ux), sep = Math.min(80, open * 0.32) * s; const w = Math.sin(k * x + ph) * A * (open > 0 ? Math.max(0.35, 1 - open / 160) : 1); return YC + (side ? w : -w) + (side ? sep : -sep) * 0.9; };
      // rungs (base pairs), drawn first so the backbones sit on top
      for (let x = -20; x < 660; x += Math.max(6, Math.round(9 * s))) {
        const y1 = pos(x, 0), y2 = pos(x, 1), b = "ACGT"[((Math.floor(x / 9) % 4) + 4) % 4], cb = COMP[b], open = x > ux;
        const front = Math.cos(k * x + ph) > 0, rw = W(s, 1.6);
        if (!open) { const ym = (y1 + y2) / 2; R(gc, x, Math.min(y1, ym), rw, Math.abs(ym - y1), mix(D.dna[b], D.n1, front ? 0 : 0.35)); R(gc, x, Math.min(y2, ym), rw, Math.abs(ym - y2), mix(D.dna[cb], D.n1, front ? 0 : 0.35)); }
        else { const st = 9 * s; R(gc, x, y1, rw, st, D.dna[b]); R(gc, x, y2 - st, rw, st, D.dna[cb]); }
      }
      // backbones
      for (let x = -20; x < 660; x++) {
        for (const side of [0, 1]) {
          const y = pos(x, side), front = (Math.cos(k * x + ph) > 0) === (side === 0), bw = W(s, 2.6);
          R(gc, x, y - bw / 2, 1, bw, side ? (front ? mix(D.cream, D.teal[0], 0.45) : mix(D.teal[2], D.n2, 0.2)) : (front ? D.cream : D.paperD));
          if (front) R(gc, x, y - bw / 2, 1, 1, side ? D.teal[0] : D.cream);
        }
      }
    };
    const LV = [lv0, lv1, lv2, lv3, lv4];
    return (g, t, d, c) => {
      const T = opt(o, "step", d / 5), tU = tm(o, "unwind", 6.0, d, 7.0), uw = P(t, tU, Math.max(0.5, d - tU), "io");
      const out = [];
      for (let i = 0; i < 5; i++) {
        const u = (t - i * T) / T;
        let a = 1;
        if (i > 0) a = Math.min(a, PX.smooth((u + 0.28) / 0.4));
        if (i < 4) a = Math.min(a, 1 - PX.smooth((u - 0.9) / 0.38));
        if (a <= 0) continue;
        const s = i === 0 ? 0.8 * Math.pow(Z, u) : i < 4 ? Math.pow(Z, u) : Math.pow(Z, Math.min(u, 0) ) * lerp(1, 1.35, clamp(u / Math.max(0.1, (d - 4 * T) / T), 0, 1));
        out.push([i, a, s]);
      }
      if (!out.length) out.push([4, 1, 1.35]);
      out.forEach(([i, a, s], n) => {
        oc.clearRect(0, 0, 640, 360);
        LV[i](oc, s, t, uw);
        const blur = (1 - a) * 4;
        g.filter = blur > 0.15 ? `blur(${blur.toFixed(2)}px)` : "none";
        g.globalAlpha = n === 0 ? 1 : a;
        g.drawImage(off, 0, 0);
        g.filter = "none"; g.globalAlpha = 1;
      });
      lampGlow(g, 200, 60, 260, 0.08);
      PX.vignette(g, 0.5);
    };
  };
})();
