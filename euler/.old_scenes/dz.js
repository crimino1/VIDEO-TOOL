/* Math film, Builder A: George Dantzig (1939) and "the verdict". Documentary palette PX.D only, no mascot.
   Kinds: late_class, copy_night, hand_in, knock, impossible, at_board, verdict, schedules.
   Shared kit: colour mix, shapes, a stroke "handwriting" font (chalk / pencil / marker write-on), fake handwritten
   maths, side + front + back-view people drawn natively, the 1939 blackboard, light shafts.
   late_class may push the camera itself (o.push, default on): it scales the engine camera c in place. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, clamp = PX.clamp, lerp = PX.lerp, E = PX.ease;
  const TAU = Math.PI * 2, rad = (a) => (a * Math.PI) / 180;

  // ---------- colour + shape helpers ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A = hx(a), B = hx(b); k = clamp(k, 0, 1); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const tri = (b, l, s) => [mix(b, D.cream, l === undefined ? 0.28 : l), b, mix(b, D.n0, s === undefined ? 0.42 : s)];
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
  const A = (g, a, fn) => { if (a <= 0) return; const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };
  const frac = (x) => x - Math.floor(x);
  const hash = (i, j) => frac(Math.sin(i * 127.1 + j * 311.7) * 43758.5453);
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const clipPoly = (g, pts, fn) => { g.save(); g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.clip(); fn(); g.restore(); };
  // option time resolver: o[k] if given (used as is), else default scaled to the shot length
  const tm = (o, d, typ) => (k, def) => (typeof o[k] === "number" ? o[k] : (def * d) / typ);
  // range option [a, b]: o[k] array, or a number = start (span keeps the default length), else default scaled
  const rng = (o, d, typ) => (k, a, b) => { const v = o[k]; if (Array.isArray(v) && v.length > 1) return [v[0], v[1]]; if (typeof v === "number") return [v, v + ((b - a) * d) / typ]; return [(a * d) / typ, (b * d) / typ]; };
  const label = (g, s, x, y, t, t0, o) => {
    o = o || {}; if (t < t0) return;
    const a = PX.p(t, t0, 0.4, "out");
    A(g, a, () => PX.otext(g, s, x, y + Math.round(3 * (1 - a)), { align: "center", col: o.col || D.cream, outline: D.n0, size: o.size || 8, font: o.font }));
  };
  // thick bar from (x1,y1) to (x2,y2), width w
  const seg = (g, x1, y1, x2, y2, w, col) => {
    const L = Math.hypot(x2 - x1, y2 - y1) || 1, nx = (-(y2 - y1) / L) * w / 2, ny = ((x2 - x1) / L) * w / 2;
    poly(g, [[x1 + nx, y1 + ny], [x2 + nx, y2 + ny], [x2 - nx, y2 - ny], [x1 - nx, y1 - ny]], col);
  };
  const limb = (g, x1, y1, x2, y2, w, col) => { seg(g, x1, y1, x2, y2, w, col); ell(g, x1, y1, w / 2 - 0.3, w / 2 - 0.3, col); ell(g, x2, y2, w / 2 - 0.3, w / 2 - 0.3, col); };
  const shadow = (g, cx, cy, rx, ry, a) => A(g, a === undefined ? 0.35 : a, () => ell(g, cx, cy, rx, ry, "#000000"));
  // textured line (chalk / pencil): skips a few pixels; w = 1 or 2
  const tline = (g, x1, y1, x2, y2, col, o) => {
    o = o || {}; const gap = o.gap || 0, w = o.w || 1, sd = o.seed || 0;
    x1 = Math.round(x1); y1 = Math.round(y1); x2 = Math.round(x2); y2 = Math.round(y2);
    g.fillStyle = col; const dx = Math.abs(x2 - x1), dy = -Math.abs(y2 - y1), sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1; let e = dx + dy;
    for (let i = 0; i < 2000; i++) {
      if (!gap || hash(x1 * 3.1 + sd, y1 * 1.7) > gap) g.fillRect(x1, y1, w, w);
      if (x1 === x2 && y1 === y2) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x1 += sx; } if (e2 <= dx) { e += dx; y1 += sy; }
    }
  };

  // ---------- stroke font (uppercase handwriting) on a 4 x 6 grid ----------
  const FONT = {
    A: [[[0, 6], [2, 0], [4, 6]], [[1, 3.6], [3, 3.6]]],
    D: [[[0, 0], [0, 6], [2.4, 6], [4, 4.4], [4, 1.6], [2.4, 0], [0, 0]]],
    E: [[[4, 0], [0, 0], [0, 6], [4, 6]], [[0, 3], [3, 3]]],
    H: [[[0, 0], [0, 6]], [[4, 0], [4, 6]], [[0, 3], [4, 3]]],
    I: [[[2, 0], [2, 6]], [[1, 0], [3, 0]], [[1, 6], [3, 6]]],
    J: [[[4, 0], [4, 4.8], [3, 6], [1, 6], [0, 4.8]]],
    L: [[[0, 0], [0, 6], [4, 6]]],
    M: [[[0, 6], [0, 0], [2, 3.4], [4, 0], [4, 6]]],
    N: [[[0, 6], [0, 0], [4, 6], [4, 0]]],
    O: [[[1.2, 0], [2.8, 0], [4, 1.5], [4, 4.5], [2.8, 6], [1.2, 6], [0, 4.5], [0, 1.5], [1.2, 0]]],
    P: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.4], [3, 3.3], [0, 3.3]]],
    R: [[[0, 6], [0, 0], [3, 0], [4, 1], [4, 2.4], [3, 3.3], [0, 3.3]], [[2, 3.3], [4, 6]]],
    S: [[[4, 0.9], [3, 0], [1, 0], [0, 1], [0, 2.2], [1, 3], [3, 3], [4, 3.9], [4, 5.1], [3, 6], [1, 6], [0, 5.1]]],
    T: [[[0, 0], [4, 0]], [[2, 0], [2, 6]]],
    U: [[[0, 0], [0, 5], [1, 6], [3, 6], [4, 5], [4, 0]]],
    V: [[[0, 0], [2, 6], [4, 0]]],
    "'": [[[0.6, -0.2], [0.4, 1.6]]],
  };
  const ADV = (ch) => (ch === " " ? 4 : ch === "'" ? 2.2 : ch === "I" ? 4.4 : 6);
  // all strokes of a word as point lists in pixels, origin top-left; u = px per grid unit
  const wordStrokes = (str, u, seed) => {
    const out = []; let x = 0;
    for (let i = 0; i < str.length; i++) {
      const ch = str[i], gl = FONT[ch];
      if (gl) for (const st of gl) out.push(st.map(([px, py], j) => [x + (px + (hash(i * 7 + j, seed) - 0.5) * 0.5) * u, (py + (hash(seed, i * 5 + j) - 0.5) * 0.45 + Math.sin(i * 0.9 + seed) * 0.25) * u]));
      x += ADV(ch) * u;
    }
    return { strokes: out, w: x - 2 * u };
  };
  const strokeLen = (st) => { let L = 0; for (let i = 1; i < st.length; i++) L += Math.hypot(st[i][0] - st[i - 1][0], st[i][1] - st[i - 1][1]); return L; };
  // draw strokes at (x, y) revealed by progress p (0..1, by length); returns the pen tip (or null)
  const drawStrokes = (g, strokes, x, y, p, col, o) => {
    o = o || {}; const lens = strokes.map(strokeLen), tot = lens.reduce((a, b) => a + b, 0) || 1;
    let left = clamp(p, 0, 1) * tot, tip = null;
    for (let s = 0; s < strokes.length && left > 0; s++) {
      const st = strokes[s];
      for (let i = 1; i < st.length && left > 0; i++) {
        const [ax, ay] = st[i - 1], [bx, by] = st[i], L = Math.hypot(bx - ax, by - ay), k = Math.min(1, left / (L || 1));
        const ex = ax + (bx - ax) * k, ey = ay + (by - ay) * k;
        tline(g, x + ax, y + ay, x + ex, y + ey, col, { gap: o.gap, w: o.w, seed: s * 13 + i });
        tip = [x + ex, y + ey]; left -= L;
      }
    }
    return tip;
  };

  // ---------- fake handwritten maths (letters/symbols only, never digits) ----------
  const GL = {
    x: [[[0, 2], [4, 6]], [[4, 2], [0, 6]]],
    n: [[[0, 2], [0, 6]], [[0, 3], [1, 2], [3, 2], [4, 3], [4, 6]]],
    a: [[[4, 3], [3, 2], [1, 2], [0, 3], [0, 5], [1, 6], [3, 6], [4, 5]], [[4, 2], [4, 6]]],
    e: [[[0, 4], [4, 4], [4, 3], [3, 2], [1, 2], [0, 3], [0, 5], [1, 6], [4, 6]]],
    d: [[[4, 3], [3, 2], [1, 2], [0, 3], [0, 5], [1, 6], [3, 6], [4, 5]], [[4, 0], [4, 6]]],
    y: [[[0, 2], [2, 5.5]], [[4, 2], [1, 8.5]]],
    z: [[[0, 2], [4, 2], [0, 6], [4, 6]]],
    p: [[[0, 2], [0, 8.5]], [[0, 3], [1, 2], [3, 2], [4, 3], [4, 5], [3, 6], [1, 6], [0, 5]]],
    f: [[[3.5, 0.5], [2.5, 0], [1.5, 1], [1.5, 7.5], [0.5, 8.5]], [[0, 3], [3, 3]]],
    k: [[[0, 0], [0, 6]], [[3.5, 2], [0, 4.2], [3.5, 6]]],
    t: [[[1.5, 0.5], [1.5, 5.5], [2.5, 6], [3.5, 5.5]], [[0, 2.2], [3.2, 2.2]]],
    q: [[[4, 3], [3, 2], [1, 2], [0, 3], [0, 5], [1, 6], [3, 6], [4, 5]], [[4, 2], [4, 8.5], [5, 8]]],
    th: [[[2, 0], [0.4, 1.8], [0.4, 4.2], [2, 6], [3.6, 4.2], [3.6, 1.8], [2, 0]], [[0.4, 3], [3.6, 3]]],
    sg: [[[4, 0], [0, 0], [2.2, 3], [0, 6], [4, 6]]],
    lm: [[[0, 0], [1, 0], [4, 6]], [[2, 3], [0, 6]]],
    pa: [[[1, 1], [2, 0], [3, 0], [4, 2], [4, 4.5], [3, 6], [1, 6], [0, 5], [0, 4], [1, 3], [3, 3], [4, 4]]],
    pl: [[[2, 2], [2, 6]], [[0, 4], [4, 4]]],
    mi: [[[0, 4], [4, 4]]],
    eq: [[[0, 3.2], [4, 3.2]], [[0, 5], [4, 5]]],
    lp: [[[2, -0.5], [0.8, 1], [0, 3], [0, 5], [0.8, 7], [2, 8.5]]],
    rp: [[[0, -0.5], [1.2, 1], [2, 3], [2, 5], [1.2, 7], [0, 8.5]]],
    in: [[[3, -1.5], [2, -1.6], [1.2, -0.5], [1.2, 8], [0.4, 9.2], [-0.6, 9]]],
  };
  const GW = { lp: 3, rp: 3, in: 4, mi: 5, eq: 5, pl: 5, t: 4.5, f: 4.5 };
  const LETTERS = ["x", "n", "a", "e", "d", "y", "z", "p", "f", "k", "t", "q", "th", "sg", "lm", "pa"];
  // one line of maths ~w px wide: strokes in pixels (origin top-left of x-height box), unit u
  const mathLine = (seed, w, u) => {
    const r = PX.rnd(seed), out = []; let x = 0;
    const put = (k, sc, dy) => { const s = sc || 1; for (const st of GL[k]) out.push(st.map(([px, py]) => [x + (px + (r() - 0.5) * 0.5) * u * s, (dy || 0) + (py + (r() - 0.5) * 0.5) * u * s])); x += ((GW[k] || 4) + 1.6) * u * s; };
    const L = () => LETTERS[Math.floor(r() * LETTERS.length)];
    let n = 0;
    while (x < w - 10 * u) {
      const k = r();
      if (n > 1 && k < 0.13) put(r() < 0.5 ? "pl" : "mi");
      else if (n > 2 && k < 0.2 && x < w * 0.7) put("eq");
      else if (k < 0.27) { put("lp"); put(L()); put(r() < 0.5 ? "pl" : "mi"); put(L()); put("rp"); }
      else if (k < 0.33) { put("in", 1.05); put(L()); put("pa"); put(L()); }
      else if (k < 0.42 && x < w - 16 * u) { // fraction
        const x0 = x, a = 1 + Math.floor(r() * 2), b = 1 + Math.floor(r() * 2);
        for (let i = 0; i < a; i++) put(L(), 0.7, -3.4 * u); const xa = x; x = x0;
        for (let i = 0; i < b; i++) put(L(), 0.7, 5.6 * u); const xb = Math.max(xa, x);
        out.push([[x0 - u * 0.5, 4.3 * u + (r() - 0.5)], [xb, 4.3 * u + (r() - 0.5)]]); x = xb + u;
      } else { put(L()); if (r() < 0.25) put(L(), 0.6, -1.5 * u); }
      if (r() < 0.12) x += 3 * u;
      n++;
    }
    return out;
  };
  // block of n lines for a problem: returns [{strokes, y}]
  const mathBlock = (seed, w, u, n, lh) => [...Array(n)].map((_, i) => ({ strokes: mathLine(seed * 31 + i * 7, i === n - 1 ? w * 0.62 : w * (0.85 + 0.15 * hash(seed, i)), u), y: i * lh }));
  const blockLen = (B) => B.reduce((a, l) => a + l.strokes.reduce((b, s) => b + strokeLen(s), 0), 0);
  // draw a block revealed by p (0..1 over the whole block)
  const drawBlock = (g, B, x, y, p, col, o) => {
    const tot = blockLen(B) || 1; let left = clamp(p, 0, 1) * tot, tip = null;
    for (const l of B) { const L = l.strokes.reduce((b, s) => b + strokeLen(s), 0); if (left <= 0) break; const tp = drawStrokes(g, l.strokes, x, y + l.y, Math.min(1, left / (L || 1)), col, o); if (tp) tip = tp; left -= L; }
    return tip;
  };

  // ---------- people ----------
  const SKINS = {
    fair: tri(mix(D.paper, D.rose[1], 0.4), 0.3, 0.32),
    warm: tri(mix(D.paperD, D.rust[1], 0.3), 0.3, 0.35),
    med: tri(mix(D.rust[2], D.paperD, 0.55), 0.28, 0.38),
    deep: tri(mix(D.rust[2], D.n2, 0.35), 0.25, 0.4),
  };
  const HAIR = {
    black: [mix(D.n2, D.steel[2], 0.3), mix(D.n0, D.rust[2], 0.12)],
    brown: [mix(D.rust[2], D.paperD, 0.25), mix(D.rust[2], D.n0, 0.45)],
    grey: [mix(D.n7, D.cream, 0.3), D.n6],
    blond: [mix(D.paper, D.amber[0], 0.3), mix(D.paperD, D.amber[2], 0.4)],
    auburn: [mix(D.rust[1], D.paperD, 0.25), mix(D.rust[2], D.n1, 0.25)],
  };
  // Dantzig (1939 young man): brown tweed jacket, cream shirt, dark tie, slicked dark hair
  const DZ = { skin: SKINS.fair, hair: HAIR.black, coat: tri(mix(mix(D.amber[2], D.rust[2], 0.5), D.n3, 0.25), 0.22, 0.45), shirt: D.cream, tie: mix(D.steel[2], D.n1, 0.3), pants: tri(mix(D.n5, D.paperD, 0.25), 0.2, 0.4), shoe: D.n1, hairStyle: "slick" };
  // the professor (older): grey hair, glasses, dark grey suit / overcoat
  const PROF = { skin: SKINS.fair, hair: HAIR.grey, coat: tri(mix(D.n4, D.steel[2], 0.25), 0.22, 0.45), shirt: D.cream, tie: mix(D.rust[2], D.n1, 0.3), pants: tri(D.n3, 0.2, 0.4), shoe: D.n0, hairStyle: "bald", glasses: true, mus: true };
  // the learner (modern): dark curly hair, teal sweater, medium skin
  const LEARN = { skin: SKINS.med, hair: HAIR.black, coat: tri(mix(D.teal[1], D.n3, 0.25), 0.25, 0.42), shirt: mix(D.teal[1], D.n3, 0.25), pants: tri(mix(D.steel[2], D.n2, 0.35), 0.2, 0.4), shoe: mix(D.n6, D.cream, 0.3), hairStyle: "curly", sweater: true };

  // ---------- side-view head: hand-pixelled 16 x 18 sprite (facing +x), features drawn on top ----------
  const SKULL = [
    "................",
    "................",
    "....ssssss......",
    "..ssssssssss....",
    ".sssssssssssS...",
    ".sssssssssssSs..",
    "sssssssssssssS..",
    "ssssssssssssssS.",
    "sssssssssssssss.",
    "ssssssssssssssss",
    "sssssssssssssssd",
    ".ssssssssssssss.",
    ".dsssssssssssss.",
    "..dssssssssssS..",
    "..ddssssssssss..",
    "...ddsssssssss..",
    "....dddsssssd...",
    "......ddddd.....",
  ];
  const EAR = ["dd", "ds", "dd"];   // at (6, 8)
  const HAIRS = {
    slick: { y: 0, rows: [
      "....hhhhhh......",
      "..hhhHHHhhhh....",
      ".hhhhhhhHHhhh...",
      "hhhhhhhhhhhhhh..",
      "hhhhhhhhhhhhh...",
      "hhhhhhhhhhh.....",
      "hhhhhhhh........",
      "hhhhhhh.........",
      "hhhhh...........",
      "hhhhh...........",
      ".hhhh...........",
      ".hhh............",
      "..h............." ] },
    messy: { y: -2, rows: [
      "..h..hh..h......",
      ".hhh.hhhhhh.h...",
      "..hhhhHHhhhhh...",
      ".hhhhhhhHHhhhh..",
      "hhhhhhhhhhhhhhh.",
      "hhhhhhhhhhhhhh..",
      "hhhhhhhhhhhh.h..",
      "hhhhhhhhh.......",
      "hhhhhhhh........",
      "hhhhhh..........",
      "hhhhh...........",
      "hhhhh...........",
      ".hhhh...........",
      ".hhh............",
      "..h............." ] },
    curly: { y: -3, rows: [
      "...h.hh.hh......",
      "..hhhhhhhhhh.h..",
      ".hhhhhhhhhhhhhh.",
      "hhhhHhhhhHhhhhhh",
      "hhhhhhhHhhhhHhhh",
      "hhhhhhhhhhhhhhh.",
      "hhhhhhhhhhhhhh..",
      "hhhhhhhhhhhhhhh.",
      "hhhhhhhhhhhh.h..",
      "hhhhhhhh........",
      "hhhhhhh.........",
      "hhhhhh..........",
      "hhhhh...........",
      "hhhhh...........",
      ".hhhh...........",
      "..hh............" ] },
    bald: { y: 5, rows: [
      "hh..............",
      "hhhh............",
      "hhhhH...........",
      "hhhh............",
      "hhhh............",
      ".hhh............",
      ".hh............." ] },
  };
  const sideHead = (g, P, x, y, f, t) => {
    const [sl, sb, sd] = P.skin, [hl, hb] = P.hair, hd = mix(hb, D.n0, 0.35);
    PX.sprite(g, SKULL, x, y, { s: sb, S: sl, d: sd });
    PX.sprite(g, EAR, x + 6, y + 8, { s: sb, d: sd });
    const H = HAIRS[P.hairStyle] || HAIRS.slick;
    PX.sprite(g, H.rows, x, y + H.y, { h: hb, H: hl });
    if (P.hairStyle === "bald") { R(g, x + 3, y + 2, 4, 1, sl); }
    // eye / brow / mouth (cols are from the sprite's left; the face is at the right)
    const blink = PX.blink(t + (f.ph || 0), f.bper || 4.1, 0.045), e = f.eye || "open", ink = D.n0, br = mix(hb, D.n0, 0.25);
    if (blink || e === "closed") R(g, x + 11, y + 9, 2, 1, sd);
    else if (e === "half") { R(g, x + 12, y + 9, 1, 1, ink); R(g, x + 11, y + 8, 2, 1, sd); }
    else if (e === "wide") { R(g, x + 12, y + 7, 1, 3, ink); R(g, x + 13, y + 8, 1, 2, D.cream); }
    else if (e === "down") { R(g, x + 12, y + 9, 1, 1, ink); R(g, x + 11, y + 9, 1, 1, sd); }
    else R(g, x + 12, y + 8, 1, 2, ink);
    const b = f.brow || 0;
    if (b === 1) R(g, x + 11, y + 5, 3, 1, br);
    else if (b === -1) { R(g, x + 11, y + 6, 1, 1, br); R(g, x + 12, y + 7, 2, 1, br); }
    else if (b === 2) { R(g, x + 11, y + 7, 1, 1, br); R(g, x + 12, y + 6, 2, 1, br); }
    else R(g, x + 11, y + 6, 3, 1, br);
    const lip = mix(sd, D.rose[2], 0.5), m = f.mouth || "flat";
    if (m === "open" || m === "o") { R(g, x + 12, y + 12, 2, 2, ink); }
    else if (m === "yawn") R(g, x + 11, y + 12, 3, 3, ink);
    else if (m === "smile") { R(g, x + 12, y + 13, 2, 1, lip); R(g, x + 11, y + 12, 1, 1, lip); }
    else if (m === "frown") { R(g, x + 12, y + 12, 2, 1, lip); R(g, x + 11, y + 13, 1, 1, lip); }
    else R(g, x + 11, y + 13, 3, 1, lip);
    R(g, x + 14, y + 11, 1, 1, sd);   // nostril shade
    if (P.mus) R(g, x + 11, y + 11, 4, 1, hb);
    if (P.glasses) { const gc = mix(D.n1, D.amber[2], 0.3); PX.box(g, x + 10, y + 6, 5, 5, gc); R(g, x + 6, y + 7, 4, 1, gc); A(g, 0.35, () => R(g, x + 11, y + 7, 3, 3, D.glass)); }
  };

  // side-view person facing +x (dir -1 flips), feet at (x, y). o: h, pal, legN/legF [thigh, shin] deg from down (+ forward),
  // armN/armF [upper, fore] deg, lean (torso top shift), headDx/headDy, face {eye, brow, mouth}, hipY (seated),
  // bag (satchel), hat, coatLong, light (rim-light colour on the facing edge)
  const sideFig = (g, x, y, o) => {
    const P = o.pal, k = (o.h || 90) / 90, [sl, sb, sd] = P.skin, [cl, cb, cd] = P.coat, [pl, pb, pd] = P.pants;
    g.save(); g.translate(Math.round(x), 0); if (o.dir < 0) g.scale(-1, 1);
    const Lt = 21 * k, Ls = 20 * k, Lu = 14.5 * k, Lf = 13.5 * k, br = Math.round(Math.sin((o.t || 0) * 1.5 + (o.ph || 0)) * 0.6);
    const lN = o.legN || [0, 0], lF = o.legF || [0, 0];
    const drop = (l) => Lt * Math.cos(rad(l[0])) + Ls * Math.cos(rad(l[1]));
    const hipY = o.hipY !== undefined ? o.hipY : y - 3 * k - Math.max(drop(lN), drop(lF));
    const hipX = (o.hipX || 0) * k, shX = hipX + (o.lean || 0) * k, shY = hipY - 28 * k + br;
    const legPts = (l) => { const kx = hipX + Lt * Math.sin(rad(l[0])), ky = hipY + Lt * Math.cos(rad(l[0])); return [kx, ky, kx + Ls * Math.sin(rad(l[1])), ky + Ls * Math.cos(rad(l[1]))]; };
    const leg = (l, col, colD, shoe, outline) => {
      const [kx, ky, ax, ay] = legPts(l);
      if (outline) { limb(g, hipX, hipY, kx, ky, 9.5 * k, outline); limb(g, kx, ky, ax, ay, 8 * k, outline); }
      limb(g, hipX, hipY, kx, ky, 8 * k, col); limb(g, kx, ky, ax, ay, 6.5 * k, col);
      seg(g, kx + 2.2 * k, ky + 1, ax + 2 * k, ay - 2, Math.max(1, k), colD);
      if (o.slippers) { R(g, ax - 3 * k, ay - 1 * k, 9 * k, 3.4 * k, mix(D.rust[2], D.n2, 0.3)); R(g, ax - 3 * k, ay - 1 * k, 9 * k, 1, mix(D.rust[1], D.n3, 0.3)); }
      else { R(g, ax - 3 * k, ay - 1 * k, 9.5 * k, 3.4 * k, shoe); R(g, ax - 1 * k, ay - 1.6 * k, 7 * k, 1, mix(shoe, D.n6, 0.35)); }
    };
    const armPts = (a) => { const sx = shX + 0.5 * k, sy = shY + 4 * k, ex = sx + Lu * Math.sin(rad(a[0])), ey = sy + Lu * Math.cos(rad(a[0])); return [sx, sy, ex, ey, ex + Lf * Math.sin(rad(a[1])), ey + Lf * Math.cos(rad(a[1]))]; };
    // 2-bone IK: angles that put the hand at world point T (elbow hangs below the line)
    const ik = (T) => {
      const sx = shX + 0.5 * k, sy = shY + 4 * k, lx = (T[0] - Math.round(x)) * (o.dir < 0 ? -1 : 1) - sx, ly = T[1] - sy, L2 = Lf + 1.6 * k;
      const dd = clamp(Math.hypot(lx, ly), 1, Lu + L2 - 0.01), base = Math.atan2(lx, ly), a1 = Math.acos(clamp((Lu * Lu + dd * dd - L2 * L2) / (2 * Lu * dd), -1, 1));
      const ua = base - a1, ex = sx + Lu * Math.sin(ua), ey = sy + Lu * Math.cos(ua);
      return [(ua * 180) / Math.PI, (Math.atan2(sx + lx - ex, sy + ly - ey) * 180) / Math.PI];
    };
    if (o.reachN) o = { ...o, armN: ik(o.reachN) };
    const arm = (a, col, colD, near) => {
      const [sx, sy, ex, ey, hx2, hy2] = armPts(a);
      if (near) { limb(g, sx, sy, ex, ey, 7.6 * k, colD); limb(g, ex, ey, hx2, hy2, 7 * k, colD); }
      limb(g, sx, sy, ex, ey, 6 * k, col); limb(g, ex, ey, hx2, hy2, 5.4 * k, col);
      if (near) seg(g, sx + 1, sy - 1, ex + 1, ey - 1, Math.max(1, k * 0.8), o.light || mix(col, D.cream, 0.18));
      if (!P.sweater && !P.pj) ell(g, hx2, hy2, 2.4 * k, 2.4 * k, P.shirt);
      const hx3 = hx2 + 1.6 * k * Math.sin(rad(a[1])), hy3 = hy2 + 1.6 * k * Math.cos(rad(a[1]));
      ell(g, hx3, hy3, 2.6 * k, 2.6 * k, near ? sb : sd); if (near) R(g, hx3 - 1, hy3 - 2, 2, 1, sl);
      return [hx3, hy3];
    };
    // far arm + far leg (darker)
    const fa = arm(o.armF || [-8, -2], cd, cd, false);
    leg(lF, pd, mix(pd, D.n0, 0.3), mix(P.shoe, D.n0, 0.3));
    // torso with chest and back curves
    const cLow = hipY + (o.coatLong ? 17 : 5) * k;
    const back = [[shX - 6.5 * k, shY + 1 * k], [shX - 7.5 * k, shY + 9 * k], [hipX - 7 * k, hipY - 4 * k], [hipX - 7 * k, cLow - 1 * k]];
    const front = [[hipX + 7 * k, cLow], [hipX + 6.5 * k, hipY - 5 * k], [shX + 7.5 * k, shY + 10 * k], [shX + 6 * k, shY + 1 * k]];
    poly(g, [...back, ...front], cb);
    poly(g, [...back, [hipX - 3.5 * k, cLow - 1 * k], [shX - 3.5 * k, shY + 9 * k], [shX - 3 * k, shY + 1 * k]], cd);
    poly(g, [[hipX + 7 * k, cLow], [hipX + 6.5 * k, hipY - 5 * k], [shX + 7.5 * k, shY + 10 * k], [shX + 6 * k, shY + 1 * k], [shX + 4.5 * k, shY + 1.5 * k], [shX + 5.5 * k, shY + 10 * k], [hipX + 5 * k, hipY - 5 * k], [hipX + 5 * k, cLow]], o.light || cl);
    R(g, shX - 6 * k, shY + 0.5 * k, 12 * k, Math.max(1, k * 0.8), cl);
    if (P.pj) for (let i = 0; i < 5; i++) seg(g, shX - 4.5 * k + i * 2.6 * k, shY + 2 * k, hipX - 5 * k + i * 2.8 * k, cLow - 1 * k, Math.max(1, 0.8 * k), mix(cb, D.steel[2], 0.45));
    if (!P.sweater && !P.pj) { // shirt collar + tie at the throat, lapel line, pocket
      poly(g, [[shX + 2 * k, shY - 0.5 * k], [shX + 6 * k, shY + 0.5 * k], [shX + 5 * k, shY + 6 * k]], P.shirt);
      if (P.tie) R(g, shX + 4.6 * k, shY + 1 * k, 1.6 * k, 8 * k, P.tie);
      seg(g, shX + 3 * k, shY + 1 * k, shX + 4.5 * k, shY + 14 * k, Math.max(1, 0.8 * k), cd);
      seg(g, shX + 4.5 * k, shY + 14 * k, hipX + 6 * k, cLow, Math.max(1, 0.8 * k), cd);
      R(g, hipX - 3 * k, hipY - 6 * k, 6 * k, Math.max(1, k * 0.8), cd);
    }
    if (P.sweater) { R(g, shX - 4 * k, shY - 0.5 * k, 9 * k, 2 * k, cd); R(g, hipX - 7 * k, cLow - 2.5 * k, 14 * k, 2 * k, cd); }
    if (o.bag) seg(g, shX - 4 * k, shY + 0.5 * k, hipX + 5 * k, hipY - 1 * k, 1.6 * k, mix(D.rust[2], D.n1, 0.35));
    // near leg
    leg(lN, pb, pd, P.shoe, mix(pd, D.n0, 0.25));
    if (o.bag) { const bx = hipX - 11 * k, by = hipY - 4 * k; R(g, bx, by, 10 * k, 12 * k, mix(D.rust[2], D.n2, 0.25)); R(g, bx, by, 10 * k, 3 * k, mix(D.rust[1], D.n2, 0.45)); R(g, bx, by + 12 * k - 1, 10 * k, 1, mix(D.rust[2], D.n0, 0.4)); R(g, bx + 4 * k, by + 3 * k, 2, 2, D.lampD); }
    // neck + head (sprite, native pixels)
    const hcx = Math.round(shX + 1.5 * k + (o.headDx || 0)), hcy = Math.round(shY - 10 * k + (o.headDy || 0));
    R(g, shX - 1 * k, shY - 4 * k, 6 * k, 6 * k, sd); R(g, shX + 1.5 * k, shY - 4 * k, 3 * k, 5 * k, sb);
    sideHead(g, P, hcx - 7, hcy - 9, o.face || {}, o.t || 0);
    if (o.hat) { const hc = mix(D.n2, D.amber[2], 0.18), hx0 = hcx - 7, hy0 = hcy - 9; R(g, hx0 - 2, hy0 + 3, 20, 2, hc); R(g, hx0 - 2, hy0 + 3, 20, 1, mix(hc, D.n6, 0.3)); R(g, hx0 + 2, hy0 - 3, 12, 6, hc); R(g, hx0 + 2, hy0 + 1, 12, 2, mix(D.n1, D.rust[2], 0.3)); R(g, hx0 + 4, hy0 - 3, 8, 1, mix(hc, D.n6, 0.3)); R(g, hx0 + 7, hy0 - 3, 2, 1, mix(hc, D.n0, 0.4)); }
    // near arm on top
    const na = arm(o.armN || [8, 4], cb, cd, true);
    g.restore();
    const fx = (v) => Math.round(x) + (o.dir < 0 ? -v : v);
    return { hand: [fx(na[0]), na[1]], handF: [fx(fa[0]), fa[1]], head: [fx(hcx), hcy], hipY, shY };
  };

  // front-view face, head centre (cx, cy), unit k
  const frontFace = (g, P, cx, cy, k, f, t) => {
    const [sl, sb, sd] = P.skin, ey = cy + 0.5 * k, ex = 3.2 * k;
    const blink = PX.blink(t + (f.ph || 0), f.bper || 3.9, 0.045), e = f.eye || "open";
    const lk = (f.look || 0) * k, lky = (f.lookY || 0) * k;
    for (const s of [-1, 1]) {
      const x0 = cx + s * ex;
      if (blink || e === "closed") R(g, x0 - 1 * k, ey + 0.5 * k, 2.4 * k, Math.max(1, 0.8 * k), sd);
      else if (e === "half") { R(g, x0 - 1 * k, ey + 0.2 * k, 2.4 * k, 1.4 * k, D.n0); R(g, x0 - 1.2 * k, ey - 0.8 * k, 2.8 * k, 1.1 * k, sd); }
      else if (e === "wide") { R(g, x0 - 1.4 * k, ey - 1 * k, 3 * k, 3 * k, D.cream); R(g, x0 - 0.5 * k + lk * 0.5, ey - 0.4 * k + lky, 1.5 * k, 1.8 * k, D.n0); }
      else if (e === "down") R(g, x0 - 1 * k, ey + 0.6 * k, 2.4 * k, 1.2 * k, D.n0);
      else R(g, x0 - 0.8 * k + lk, ey - 0.6 * k + lky, 2 * k, 2.2 * k, D.n0);
      // brows
      const bw = f.brow || 0, by = ey - 3 * k;
      if (bw === 2) { R(g, x0 - (s < 0 ? 1.4 : 0.2) * k, by + (s < 0 ? 0 : 0), 1.8 * k, Math.max(1, 0.9 * k), P.hair[1]); R(g, x0 + (s < 0 ? 0.4 : -1.6) * k, by - 0.9 * k, 1.4 * k, Math.max(1, 0.9 * k), P.hair[1]); }
      else if (bw === -1) { R(g, x0 - (s < 0 ? 1.4 : 0.2) * k, by - 0.9 * k, 1.8 * k, Math.max(1, 0.9 * k), P.hair[1]); R(g, x0 + (s < 0 ? 0.4 : -1.6) * k, by + 0.2 * k, 1.4 * k, Math.max(1, 0.9 * k), P.hair[1]); }
      else R(g, x0 - 1.4 * k, by - (bw === 1 ? 1 * k : 0), 3 * k, Math.max(1, 0.9 * k), P.hair[1]);
    }
    R(g, cx - 0.5 * k, ey + 1.6 * k, 1.4 * k, 2.2 * k, sd); // nose shade
    const m = f.mouth || "flat", my = cy + 5.4 * k, lip = mix(sd, D.rose[2], 0.45);
    if (P.mus) R(g, cx - 2.4 * k, my - 1.6 * k, 4.8 * k, 1.3 * k, P.hair[1]);
    if (m === "open") { R(g, cx - 1.4 * k, my - 0.6 * k, 2.8 * k, 2.2 * k, D.n0); }
    else if (m === "o") R(g, cx - 1 * k, my - 0.6 * k, 2 * k, 2 * k, D.n0);
    else if (m === "yawn") { R(g, cx - 1.4 * k, my - 1.4 * k, 2.8 * k, 3.4 * k, D.n0); R(g, cx - 1 * k, my + 1 * k, 2 * k, Math.max(1, 0.8 * k), mix(D.rose[1], D.n1, 0.3)); }
    else if (m === "smile") { R(g, cx - 1.6 * k, my, 3.2 * k, Math.max(1, k * 0.9), lip); R(g, cx - 2.4 * k, my - 0.8 * k, Math.max(1, k * 0.9), Math.max(1, k * 0.9), lip); R(g, cx + 1.6 * k, my - 0.8 * k, Math.max(1, k * 0.9), Math.max(1, k * 0.9), lip); }
    else if (m === "frown") { R(g, cx - 1.6 * k, my, 3.2 * k, Math.max(1, k * 0.9), lip); R(g, cx - 2.4 * k, my + 0.8 * k, Math.max(1, k * 0.9), Math.max(1, k * 0.9), lip); R(g, cx + 1.6 * k, my + 0.8 * k, Math.max(1, k * 0.9), Math.max(1, k * 0.9), lip); }
    else if (m === "wavy") { R(g, cx - 2 * k, my, 1.4 * k, Math.max(1, k * 0.9), lip); R(g, cx - 0.6 * k, my - 0.8 * k, 1.4 * k, Math.max(1, k * 0.9), lip); R(g, cx + 0.8 * k, my, 1.4 * k, Math.max(1, k * 0.9), lip); }
    else R(g, cx - 1.6 * k, my, 3.2 * k, Math.max(1, k * 0.9), lip);
    if (P.glasses) { const gc = mix(D.n1, D.amber[2], 0.3); for (const s of [-1, 1]) PX.box(g, Math.round(cx + s * ex - 2 * k), Math.round(ey - 1.8 * k), Math.round(4.2 * k), Math.round(3.8 * k), gc); R(g, cx - 1 * k, ey - 0.8 * k, 2 * k, Math.max(1, 0.6 * k), gc); }
  };
  const frontHair = (g, P, cx, cy, k, t, back) => {
    const [hl, hb] = P.hair, st = P.hairStyle;
    if (st === "bald") { if (back) return; ell(g, cx - 6.4 * k, cy - 1 * k, 2 * k, 4 * k, hb); ell(g, cx + 6.4 * k, cy - 1 * k, 2 * k, 4 * k, hb); R(g, cx - 2 * k, cy - 7.4 * k, 3 * k, Math.max(1, k), P.skin[0]); return; }
    if (st === "curly") {
      if (back) { ell(g, cx, cy - 1 * k, 9 * k, 9 * k, hb); return; }
      const hm = mix(hb, hl, 0.35);
      ell(g, cx, cy - 5.6 * k, 8.8 * k, 5.2 * k, hb);
      for (const s of [-1, 1]) { ell(g, cx + s * 7.6 * k, cy - 2.5 * k, 2.4 * k, 3.8 * k, hb); ell(g, cx + s * 8 * k, cy + 0.5 * k, 1.6 * k, 2 * k, hb); }
      for (let i = 0; i < 9; i++) { const a = Math.PI * (0.05 + 0.9 * (i / 8)), rx = cx - Math.cos(a) * 8.6 * k, ry = cy - 5 * k - Math.sin(a) * 4.8 * k; ell(g, rx, ry, 1.9 * k, 1.7 * k, hb); if (k > 1.3 && i % 2) R(g, rx - 0.5 * k, ry - 1 * k, Math.max(1, k * 0.8), Math.max(1, k * 0.6), hm); }
      for (let i = 0; i < 5; i++) ell(g, cx - 5.4 * k + i * 2.7 * k, cy - 4.4 * k + (i % 2) * 0.8 * k, 1.6 * k, 1.4 * k, hb);
      for (let i = 0; i < 6; i++) R(g, cx - 6 * k + i * 2.4 * k, cy - 7.4 * k + ((i * 7) % 3) * k, Math.max(1, k * 0.8), Math.max(1, k * 0.6), hm);
      return;
    }
    if (st === "bun") { if (back) { ell(g, cx, cy - 1 * k, 8 * k, 8.4 * k, hb); return; } ell(g, cx, cy - 5 * k, 8 * k, 4.4 * k, hb); ell(g, cx, cy - 10 * k, 3.5 * k, 2.6 * k, hb); R(g, cx - 7.6 * k, cy - 5 * k, 2.4 * k, 6 * k, hb); R(g, cx + 5.2 * k, cy - 5 * k, 2.4 * k, 6 * k, hb); R(g, cx - 3 * k, cy - 8.6 * k, 4 * k, Math.max(1, k), hl); return; }
    if (st === "short") { if (back) { ell(g, cx, cy - 2 * k, 8 * k, 7.6 * k, hb); return; } ell(g, cx, cy - 5.2 * k, 8 * k, 4.4 * k, hb); R(g, cx - 7.6 * k, cy - 5 * k, 2 * k, 5 * k, hb); R(g, cx + 5.6 * k, cy - 5 * k, 2 * k, 5 * k, hb); R(g, cx - 4 * k, cy - 9 * k, 6 * k, Math.max(1, k), hl); return; }
    // slick / messy (side part)
    if (back) { ell(g, cx, cy - 2 * k, 7.8 * k, 7.6 * k, hb); return; }
    ell(g, cx, cy - 5.4 * k, 7.8 * k, 4.2 * k, hb); R(g, cx - 7.6 * k, cy - 5 * k, 2 * k, 5 * k, hb); R(g, cx + 5.6 * k, cy - 5 * k, 2 * k, 5 * k, hb);
    R(g, cx - 2 * k, cy - 9.4 * k, Math.max(1, k), 3 * k, hl); R(g, cx - 1 * k, cy - 9.6 * k, 6 * k, Math.max(1, k), hl);
    if (st === "messy") { for (let i = 0; i < 5; i++) { const a = Math.round(Math.sin(t * 0.6 + i * 1.3) * 0.6); R(g, cx - 7 * k + i * 3.2 * k + a, cy - 11 * k + (i % 2) * 1.2 * k, 2 * k, 3.6 * k, hb); } R(g, cx + 6 * k, cy - 7 * k, 3 * k, 2 * k, hb); R(g, cx - 9 * k, cy - 6 * k, 3 * k, 2 * k, hb); }
  };
  // front-view person, feet at (x, y) (or hipY for seated). o: h, pal, armL/armR [upper, fore] deg from down (+ outward),
  // face, noLegs, hold, headDy, tilt (head x shift), pj, shrug
  const frontFig = (g, x, y, o) => {
    const P = o.pal, k = (o.h || 90) / 90, [sl, sb, sd] = P.skin, [cl, cb, cd] = P.coat, [pl, pb, pd] = P.pants;
    x = Math.round(x); const br = Math.round(Math.sin((o.t || 0) * 1.5 + (o.ph || 0)) * 0.6);
    const hipY = o.hipY !== undefined ? o.hipY : y - 44 * k, shY = hipY - 29 * k + br + (o.shrug || 0) * k;
    if (!o.noLegs) {
      for (const s of [-1, 1]) { R(g, x + s * 4.5 * k - 3.5 * k, hipY, 7 * k, 41 * k, s < 0 ? pb : pd); R(g, x + s * 4.5 * k - 4 * k, y - 3.5 * k, 8 * k, 3.5 * k, P.shoe); }
      R(g, x - 0.5 * k, hipY + 2 * k, Math.max(1, k), 38 * k, pd);
    }
    // arms behind torso edges
    const arm = (s, a) => {
      const sx = x + s * 10 * k, sy = shY + 3.5 * k, ex = sx + s * 14.5 * k * Math.sin(rad(a[0])), ey = sy + 14.5 * k * Math.cos(rad(a[0]));
      const hx2 = ex + s * 13 * k * Math.sin(rad(a[1])), hy2 = ey + 13 * k * Math.cos(rad(a[1]));
      limb(g, sx, sy, ex, ey, 5.6 * k, s < 0 ? cb : cd); limb(g, ex, ey, hx2, hy2, 5 * k, s < 0 ? cb : cd);
      ell(g, hx2, hy2 + 1.5 * k, 2.5 * k, 2.6 * k, sb); return [hx2, hy2];
    };
    const crossed = o.cross, noA = crossed || o.noArms;
    const hL = noA ? null : arm(-1, o.armL || [6, 2]), hR = noA ? null : arm(1, o.armR || [6, 2]);
    if (o.noArms) for (const s of [-1, 1]) { R(g, x + s * 11 * k - (s < 0 ? 4 * k : 0), shY + 2 * k, 4 * k, 26 * k, s < 0 ? cb : cd); ell(g, x + s * 11 * k, shY + 4 * k, 3 * k, 3 * k, s < 0 ? cb : cd); }
    // torso
    const cLow = hipY + (o.coatLong ? 16 : 5) * k;
    const TS = [[x - 8 * k, shY], [x + 8 * k, shY], [x + 11.5 * k, shY + 3 * k], [x + 11 * k, shY + 12 * k], [x + 9.5 * k, cLow], [x - 9.5 * k, cLow], [x - 11 * k, shY + 12 * k], [x - 11.5 * k, shY + 3 * k]];
    poly(g, TS, cb);
    poly(g, [[x + 7 * k, shY], [x + 8 * k, shY], [x + 11.5 * k, shY + 3 * k], [x + 11 * k, shY + 12 * k], [x + 9.5 * k, cLow], [x + 7 * k, cLow], [x + 8 * k, shY + 12 * k]], cd);
    poly(g, [[x + 5 * k, shY + 2 * k], [x + 7 * k, shY + 1 * k], [x + 8 * k, shY + 12 * k], [x + 7 * k, cLow], [x + 5 * k, cLow], [x + 6 * k, shY + 12 * k]], mix(cb, cd, 0.5));
    poly(g, [[x - 8 * k, shY], [x + 2 * k, shY], [x - 2 * k, shY + 1.6 * k], [x - 10.5 * k, shY + 3.4 * k], [x - 11.5 * k, shY + 3 * k]], cl);
    if (k > 1.4) { seg(g, x - 6 * k, shY + 8 * k, x - 4 * k, cLow - 2 * k, Math.max(1, 0.6 * k), mix(cb, cd, 0.5)); seg(g, x + 2 * k, shY + 14 * k, x + 3 * k, cLow - 3 * k, Math.max(1, 0.6 * k), mix(cb, cd, 0.5)); }
    if (P.pj) for (let i = 0; i < 6; i++) R(g, x - 9 * k + i * 3.4 * k, shY + 2 * k, Math.max(1, 0.9 * k), cLow - shY - 2 * k, mix(cb, D.steel[2], 0.45));
    if (P.pj) { poly(g, [[x - 4 * k, shY + 1 * k], [x, shY + 7 * k], [x + 4 * k, shY + 1 * k]], sd); seg(g, x - 4.5 * k, shY + 1 * k, x, shY + 8 * k, Math.max(1, k), cl); seg(g, x + 4.5 * k, shY + 1 * k, x, shY + 8 * k, Math.max(1, k), cl); }
    else if (P.sweater) { R(g, x - 4 * k, shY + 0.5 * k, 8 * k, 2 * k, cd); R(g, x - 3 * k, shY + 0.5 * k, 6 * k, Math.max(1, k), sd); R(g, x - 9 * k, cLow - 2 * k, 18 * k, 2 * k, cd); }
    else {
      poly(g, [[x - 4.5 * k, shY + 1 * k], [x + 4.5 * k, shY + 1 * k], [x + 1.5 * k, shY + 15 * k], [x - 1.5 * k, shY + 15 * k]], P.shirt);
      if (P.tie) poly(g, [[x - 1.2 * k, shY + 2.5 * k], [x + 1.2 * k, shY + 2.5 * k], [x + 1.6 * k, shY + 13 * k], [x, shY + 15 * k], [x - 1.6 * k, shY + 13 * k]], P.tie);
      seg(g, x - 4.5 * k, shY + 1 * k, x - 1.5 * k, shY + 16 * k, Math.max(1, k), cd); seg(g, x + 4.5 * k, shY + 1 * k, x + 1.5 * k, shY + 16 * k, Math.max(1, k), cd);
      R(g, x - 0.5 * k, shY + 18 * k, Math.max(1, k), Math.max(1, k), cd); R(g, x - 0.5 * k, shY + 23 * k, Math.max(1, k), Math.max(1, k), cd);
    }
    if (crossed) { R(g, x - 11 * k, shY + 13 * k, 22 * k, 6 * k, cb); R(g, x - 11 * k, shY + 13 * k, 22 * k, Math.max(1, k), cl); R(g, x - 11 * k, shY + 18 * k, 22 * k, Math.max(1, k), cd); ell(g, x - 8 * k, shY + 15 * k, 2.4 * k, 2.2 * k, sb); ell(g, x + 8 * k, shY + 16 * k, 2.4 * k, 2.2 * k, sd); }
    // neck + head
    const hcx = x + (o.tilt || 0) * k, hcy = shY - 9.5 * k + (o.headDy || 0) * k;
    frontHair(g, P, hcx, hcy, k, o.t || 0, true);
    R(g, x - 2.6 * k, shY - 4 * k, 5.2 * k, 5 * k, sd);
    ell(g, hcx, hcy, 7.2 * k, 8.2 * k, sb);
    ell(g, hcx + 4.2 * k, hcy + 1 * k, 2.8 * k, 6 * k, mix(sb, sd, 0.5)); ell(g, hcx - 4 * k, hcy - 2 * k, 2 * k, 3 * k, sl);
    R(g, hcx - 8 * k, hcy - 0.5 * k, 1.6 * k, 3.4 * k, sd); R(g, hcx + 6.6 * k, hcy - 0.5 * k, 1.6 * k, 3.4 * k, sd);
    frontHair(g, P, hcx, hcy, k, o.t || 0, false);
    frontFace(g, P, hcx, hcy, k, o.face || {}, o.t || 0);
    return { hL, hR, head: [hcx, hcy], shY, hipY };
  };
  // seated person seen from behind (bust above a bench back): shoulder line centre (x, y), unit k; o.turn -1..1 turns head
  const backBust = (g, x, y, k, o) => {
    o = o || {}; const P = o.pal, [cl, cb, cd] = P.coat, [sl, sb, sd] = P.skin;
    const sway = Math.round(Math.sin((o.t || 0) * 0.9 + (o.ph || 0)) * 0.6 * k), wr = o.write ? Math.round(Math.sin((o.t || 0) * 9 + (o.ph || 0)) * 0.8) : 0;
    x = Math.round(x + sway);
    poly(g, [[x - 13 * k, y + 2 * k], [x + 13 * k, y + 2 * k], [x + 15 * k, y + 26 * k], [x - 15 * k, y + 26 * k]], cb);
    ell(g, x - 12 * k, y + 4 * k + wr, 4 * k, 4 * k, cb); ell(g, x + 12 * k, y + 4 * k - wr, 4 * k, 4 * k, cb);
    R(g, x - 12 * k, y + 0.5 * k, 24 * k, Math.max(1, k), cl); R(g, x + 9 * k, y + 2 * k, 6 * k, 24 * k, cd); R(g, x - 0.5 * k, y + 6 * k, Math.max(1, k), 20 * k, cd);
    if (o.light) R(g, x - 14 * k, y + 2 * k, Math.max(1, k), 22 * k, o.light);
    R(g, x - 3.5 * k, y - 2 * k, 7 * k, 3.5 * k, P.shirt || D.cream);
    R(g, x - 2.5 * k, y - 4 * k, 5 * k, 3 * k, sd);
    const turn = o.turn || 0, hx2 = x + turn * 2 * k, hy = y - 10 * k;
    ell(g, hx2, hy, 7 * k, 7.8 * k, sb);
    const st = P.hairStyle || "short", [hl, hb] = P.hair;
    if (Math.abs(turn) > 0.45) { // head turned to a profile: face on the turn side, ear in the middle, hair at the back
      const s = Math.sign(turn), F = (v) => hx2 + s * v * k, Wd = (v) => (s < 0 ? v * k : 0);
      ell(g, F(2.5), hy + 1 * k, 4.6 * k, 6.6 * k, sb);
      R(g, F(6.6) - Wd(1.6), hy - 1 * k, 1.6 * k, 3 * k, sb); R(g, F(4.2) - Wd(1.4), hy - 1.2 * k, 1.4 * k, 1.6 * k, D.n0);
      R(g, F(3.4) - Wd(3), hy - 3.2 * k, 3 * k, Math.max(1, k), hb); R(g, F(4) - Wd(2), hy + 4 * k, 2 * k, Math.max(1, k), mix(sd, D.rose[2], 0.4));
      ell(g, F(-1.8), hy - 1 * k, 6 * k, 7.4 * k, hb); ell(g, F(1), hy - 4.6 * k, 6.6 * k, 3.6 * k, hb);
      if (st === "bun") ell(g, F(-5.5), hy - 0.5 * k, 3 * k, 3 * k, hb);
      R(g, F(0) - Wd(2), hy - 0.5 * k, 2 * k, 3 * k, sd);
      R(g, F(-4) - Wd(6), hy - 7.6 * k, 6 * k, Math.max(1, k), hl);
      return;
    }
    if (st === "bun") { ell(g, hx2, hy - 0.8 * k, 7.5 * k, 7.4 * k, hb); ell(g, hx2, hy - 2 * k, 3.4 * k, 3 * k, mix(hb, D.n0, 0.3)); R(g, hx2 - 1 * k, hy - 4 * k, 2 * k, Math.max(1, k), hl); R(g, hx2 - 5 * k, hy - 7.4 * k, 7 * k, Math.max(1, k), hl); }
    else if (st === "curly") { ell(g, hx2, hy - 0.6 * k, 8.4 * k, 8 * k, hb); for (let i = 0; i < 6; i++) ell(g, hx2 - 6 * k + i * 2.4 * k, hy - 8.6 * k + (i % 2) * k, 1.8 * k, 1.6 * k, hb); for (let i = 0; i < 3; i++) R(g, hx2 - 4 * k + i * 3 * k, hy - 8 * k, Math.max(1, k), Math.max(1, k), hl); }
    else { ell(g, hx2, hy - 0.6 * k, 7.5 * k, 7.6 * k, hb); R(g, hx2 - 3 * k, hy + 5.6 * k, 6 * k, Math.max(1, k), mix(hb, sd, 0.5)); R(g, hx2 - 5 * k, hy - 7.6 * k, 7 * k, Math.max(1, k), hl); }
    R(g, hx2 - 8 * k, hy, 1.6 * k, 3 * k, sd); R(g, hx2 + 6.4 * k, hy, 1.6 * k, 3 * k, sd);
  };

  // ---------- the 1939 blackboard (shared by late_class and impossible) ----------
  const SLATE = mix(D.n2, D.moss[2], 0.32), SLATE_L = mix(SLATE, D.n5, 0.25), SLATE_D = mix(SLATE, D.n0, 0.3);
  const CHALK = mix(D.cream, SLATE, 0.12);
  const WOOD = tri(mix(mix(D.amber[2], D.rust[2], 0.4), D.n3, 0.32), 0.22, 0.5);
  // board in (x, y, w, h); u = chalk unit; prog [p1, p2] write-on of the two problems (1 = written)
  // the two problems are built once at unit 1 (canonical width BW1) and scaled, so every board shows the same chalk
  const BW1 = 93, PB = [mathBlock(39, BW1, 1, 4, 13), mathBlock(93, BW1, 1, 4, 13)];
  const scaleBlock = (B, u) => B.map((l) => ({ y: l.y * u, strokes: l.strokes.map((st) => st.map(([x, y]) => [x * u, y * u])) }));
  const boardBlocks = {};
  const blocksFor = (bw) => { const u = bw / BW1, key = u.toFixed(3); if (!boardBlocks[key]) boardBlocks[key] = PB.map((B) => scaleBlock(B, u)); return boardBlocks[key]; };
  const blackboard = (g, x, y, w, h, t, o) => {
    o = o || {};
    R(g, x - 5, y - 5, w + 10, h + 10, WOOD[2]); R(g, x - 4, y - 4, w + 8, h + 8, WOOD[1]); R(g, x - 4, y - 4, w + 8, 1, WOOD[0]); R(g, x - 4, y + h + 3, w + 8, 1, WOOD[2]);
    PX.vgrad(g, x, y, w, h, mix(SLATE, D.n6, o.lit ? 0.12 : 0.04), SLATE_D, 6);
    // eraser smudges (old chalk ghosts)
    const r = PX.rnd(7);
    for (let i = 0; i < 9; i++) { const sx = x + r() * w, sy = y + r() * h, sw = 20 + r() * 50; A(g, 0.07 + r() * 0.05, () => { for (let j = 0; j < 4; j++) R(g, sx + Math.sin(j + i) * 4, sy + j * 3, sw, 2, D.n6); }); }
    // centre split of the double board
    R(g, x + w / 2 - 1, y, 2, h, WOOD[2]); R(g, x + w / 2 - 1, y, 1, h, WOOD[1]);
    // chalk tray
    R(g, x - 6, y + h + 4, w + 12, 4, WOOD[1]); R(g, x - 6, y + h + 4, w + 12, 1, WOOD[0]); R(g, x - 6, y + h + 8, w + 12, 1, WOOD[2]);
    R(g, x + 24, y + h + 2, 7, 2, D.cream); R(g, x + 36, y + h + 2, 4, 2, mix(D.cream, D.n6, 0.3)); R(g, x + w - 40, y + h + 1, 14, 3, mix(D.paperD, D.n3, 0.4)); R(g, x + w - 40, y + h + 1, 14, 1, D.n5);
    // the two problems
    const pad = Math.round(w * 0.04), bw = w / 2 - 2 * pad, B = blocksFor(bw), u = bw / BW1, pr = o.prog || [1, 1];
    const top = y + (o.top || Math.round(h * 0.22));
    for (let i = 0; i < 2; i++) A(g, 0.92, () => drawBlock(g, B[i], x + pad + i * (w / 2), top, pr[i], CHALK, { gap: 0.12, w: u >= 2.2 ? 2 : 1 }));
    return { top, pad, bw, B, u, bottom: top + 3 * 13 * u + 8 * u };
  };

  // light shaft: quad from window points to floor points, soft dithered alpha
  const shaft = (g, pts, a, col) => { A(g, a, () => poly(g, pts, col || D.lamp)); A(g, a * 0.6, () => { const [p0, p1, p2, p3] = pts; poly(g, [p0, [lerp(p0[0], p1[0], 0.35), lerp(p0[1], p1[1], 0.35)], [lerp(p3[0], p2[0], 0.35), lerp(p3[1], p2[1], 0.35)], p3], col || D.lamp); }); };
  const dustIn = (g, pts, seed, n, t, box, col) => clipPoly(g, pts, () => PX.particles(g, seed, n, t, box, { vy: -2, vx: 1.5, col: col || D.lamp, a: 0.55, tw: 1.3 }));

  // ======================= late_class =======================
  // 1939 lecture hall seen from the back row: tiered benches, students' backs, tall windows on the left with morning
  // shafts, the professor at the lectern, two long chalk problems on the double blackboard.
  // o.enter 0.5 the side door opens and the young man slips in, crosses behind the last row and sits;
  // o.board 3.0 the camera pushes in on the blackboard (o.push false = no internal push).
  K.late_class = (o) => {
    const VP = [320, 118];
    const STU = [];
    { const r = PX.rnd(1939), coats = [tri(mix(D.n4, D.steel[2], 0.3)), tri(mix(D.moss[2], D.n3, 0.4)), tri(mix(D.paperD, D.n4, 0.45)), tri(mix(D.n3, D.amber[2], 0.3)), tri(mix(D.rust[2], D.n3, 0.5)), tri(mix(D.steel[2], D.n2, 0.25))];
      const hairs = [HAIR.black, HAIR.brown, HAIR.blond, HAIR.auburn, HAIR.brown];
      const rows = [{ y: 196, k: 0.42, x0: 186, x1: 452 }, { y: 222, k: 0.54, x0: 166, x1: 474 }, { y: 254, k: 0.7, x0: 140, x1: 500 }, { y: 296, k: 0.9, x0: 104, x1: 536 }];
      rows.forEach((rw, ri) => { const sp = 34 * rw.k; for (let x = rw.x0 + sp * 0.6; x < rw.x1 - sp * 0.4; x += sp) { if (ri === 3 && Math.abs(x - 392) < sp * 0.8) continue; if (r() < 0.16) continue;
        STU.push({ ri, x: x + (r() - 0.5) * 4 * rw.k, y: rw.y, k: rw.k, pal: { coat: coats[Math.floor(r() * coats.length)], skin: [SKINS.fair, SKINS.warm, SKINS.fair, SKINS.med][Math.floor(r() * 4)], hair: hairs[Math.floor(r() * hairs.length)], hairStyle: r() < 0.18 ? "bun" : "short", shirt: D.cream }, ph: r() * 6, write: r() < 0.4, turner: ri >= 2 && r() < 0.45 }); } });
      STU.rows = rows; }
    return (g, t, d, c) => {
      t = Math.max(-1, t);
      const T = tm(o, d, 7.0), tE = T("enter", 0.5), tB = T("board", 3.0);
      const c0 = { x: c.x, y: c.y, z: c.z };
      if (o.push !== false) { const p = E((t - tB) / Math.max(0.6, 1.6 * d / 7), "io"); if (p > 0) { c.z = c.z * lerp(1, 1.55, p); c.x = lerp(c.x, 320, p); c.y = lerp(c.y, 112, p);
        c.x = clamp(c.x, 320 / c.z, 640 - 320 / c.z); c.y = clamp(c.y, 180 / c.z, 360 - 180 / c.z); } }
      // door + walk timeline
      const ed = d / 7, tStep = tE + 0.45 * ed, tSit = tE + 2.0 * ed, tShut = tE + 2.6 * ed;
      const doorOpen = t < tE ? 0 : t < tShut ? E((t - tE) / (0.4 * ed), "out") : 1 - E((t - tShut) / (0.5 * ed), "io");
      const DX0 = 548, walkX = (tt) => lerp(DX0, 392, E((tt - tStep) / (tSit - tStep), "io"));
      const sitP = E((t - tSit) / (0.35 * ed), "io");
      const sunA = 1;

      R(g, 0, 0, 640, 360, D.n1);
      // ---- far layer: walls, windows, blackboard, professor ----
      PX.par(g, c0, 0.45, () => {
        // ceiling
        poly(g, [[-40, -40], [680, -40], [492, 34], [148, 34]], mix(D.n2, D.amber[2], 0.12));
        for (let i = 0; i < 7; i++) { const fx = 148 + i * (344 / 6), nx = lerp(-60, 700, i / 6); PX.line(g, fx, 34, nx, -40, mix(D.n1, D.amber[2], 0.15)); }
        for (const yy of [8, 22]) { const kk = (yy + 40) / 74; R(g, lerp(-40, 148, kk), yy, lerp(720, 344, kk), 3, mix(D.n1, D.amber[2], 0.2)); }
        // far wall: plaster upper, wood panels lower
        R(g, 148, 34, 344, 176, mix(D.paperD, D.n4, 0.55));
        PX.vgrad(g, 148, 34, 344, 120, mix(D.paperD, D.n4, 0.62), mix(D.paperD, D.n4, 0.45), 5);
        R(g, 148, 168, 344, 42, WOOD[2]); R(g, 148, 168, 344, 2, WOOD[1]);
        for (let x = 156; x < 490; x += 28) { R(g, x, 174, 22, 30, mix(WOOD[2], D.n1, 0.25)); R(g, x, 174, 22, 1, WOOD[1]); }
        // clock above the board (no numerals: ticks only)
        PX.circle(g, 320, 46, 9, WOOD[2]); PX.circle(g, 320, 46, 8, mix(D.cream, D.paperD, 0.3));
        for (let i = 0; i < 12; i++) { const an = (i / 12) * TAU; R(g, Math.round(320 + Math.cos(an) * 6.4), Math.round(46 + Math.sin(an) * 6.4), 1, 1, D.n3); }
        const ma = -Math.PI / 2 + (20 / 60) * TAU + t * 0.01, ha = -Math.PI / 2 + (9.33 / 12) * TAU;
        PX.line(g, 320, 46, 320 + Math.cos(ma) * 6, 46 + Math.sin(ma) * 6, D.n1); PX.line(g, 320, 46, 320 + Math.cos(ha) * 4, 46 + Math.sin(ha) * 4, D.n1);
        // the blackboard
        blackboard(g, 186, 62, 268, 92, t, { lit: true });
        // professor at the lectern (left of the board), gesturing at it
        const gest = Math.sin(t * 0.9) * 0.5 + 0.5;
        frontFig(g, 168, 206, { h: 54, pal: PROF, t, armR: [lerp(40, 70, gest), lerp(60, 110, gest)], armL: [8, 30], face: { look: 1, brow: 0 }, tilt: 1 });
        R(g, 154, 176, 30, 32, WOOD[1]); R(g, 152, 174, 34, 4, WOOD[0]); R(g, 154, 176, 30, 1, WOOD[0]); R(g, 178, 178, 6, 30, WOOD[2]);
        // front floor
        R(g, 148, 206, 344, 12, mix(D.n3, WOOD[2], 0.5));
        // left wall with three tall windows (perspective)
        poly(g, [[-40, -40], [148, 34], [148, 216], [-40, 380]], mix(D.paperD, D.n4, 0.66));
        const win = (fx0, fx1) => { // fx = fraction 0 (near) .. 1 (far) along the wall
          const X = (f) => lerp(-30, 148, f), Yt = (f) => lerp(10, 48, f), Yb = (f) => lerp(250, 186, f);
          const p = [[X(fx0), Yt(fx0)], [X(fx1), Yt(fx1)], [X(fx1), Yb(fx1)], [X(fx0), Yb(fx0)]];
          poly(g, [[p[0][0] - 3, p[0][1] - 4], [p[1][0] + 2, p[1][1] - 3], [p[2][0] + 2, p[2][1] + 3], [p[3][0] - 3, p[3][1] + 5]], WOOD[2]);
          clipPoly(g, p, () => { PX.vgrad(g, X(fx0) - 2, Yt(fx0) - 4, X(fx1) - X(fx0) + 4, Yb(fx0) - Yt(fx0) + 8, mix(D.steel[0], D.cream, 0.45), mix(D.cream, D.lamp, 0.45), 6);
            // a tree outside, soft
            A(g, 0.35, () => { ell(g, X((fx0 + fx1) / 2) + 4, Yt(fx0) + 40, 26, 22, mix(D.moss[1], D.cream, 0.35)); ell(g, X(fx0) + 2, Yt(fx0) + 70, 18, 18, mix(D.moss[1], D.cream, 0.45)); }); });
          // mullions
          const mx = lerp(p[0][0], p[1][0], 0.5); PX.line(g, mx, lerp(p[0][1], p[1][1], 0.5), mx, lerp(p[3][1], p[2][1], 0.5), WOOD[2]);
          for (const v of [0.33, 0.66]) PX.line(g, p[0][0], lerp(p[0][1], p[3][1], v), p[1][0], lerp(p[1][1], p[2][1], v), WOOD[2]);
          return p;
        };
        const W1 = win(0.06, 0.22), W2 = win(0.4, 0.53), W3 = win(0.7, 0.8);
        STU.win = [W1, W2, W3];
        // right wall
        poly(g, [[680, -40], [492, 34], [492, 216], [680, 400]], mix(D.paperD, D.n4, 0.72));
        poly(g, [[492, 168], [680, 110], [680, 400], [492, 216]], mix(WOOD[2], D.n1, 0.2));
        // a framed notice on the right wall
        poly(g, [[508, 80], [538, 72], [538, 112], [508, 116]], WOOD[2]); poly(g, [[510, 82], [536, 75], [536, 110], [510, 113]], mix(D.paper, D.n4, 0.35));
        for (let i = 0; i < 4; i++) PX.line(g, 513, 88 + i * 6, 532, 83 + i * 6, mix(D.n4, D.paper, 0.2));
      });
      // ---- sun shafts across the hall (from the windows, falling right and down) ----
      const shafts = [[[20, 60], [90, 40], [430, 300], [330, 360]], [[104, 62], [136, 52], [470, 250], [420, 290]], [[150, 70], [166, 64], [480, 214], [452, 236]]];
      for (const s of shafts) shaft(g, s, 0.09 * sunA);
      // ---- the side door (right wall, near the back row) ----
      PX.par(g, c0, 0.7, () => {
        const dx0 = 530, dx1 = 566, top0 = 212, top1 = 202, bot0 = 340, bot1 = 356;
        R(g, dx0 - 3, top0 - 4, dx1 - dx0 + 6, 3, WOOD[1]);
        poly(g, [[dx0 - 3, top0 - 3], [dx1 + 3, top1 - 4], [dx1 + 3, bot1 + 2], [dx0 - 3, bot0 + 2]], WOOD[2]);
        // corridor beyond (warm light)
        poly(g, [[dx0, top0], [dx1, top1], [dx1, bot1], [dx0, bot0]], mix(D.lamp, D.paper, 0.4));
        poly(g, [[dx0, bot0 - 26], [dx1, bot1 - 30], [dx1, bot1], [dx0, bot0]], mix(D.paperD, D.amber[2], 0.3));
        R(g, dx0 + 8, top0 + 20, 10, 60, mix(D.paperD, D.lamp, 0.3)); R(g, dx0 + 8, top0 + 20, 10, 1, D.cream);
        // door leaf hinged at the near jamb, swings open against the wall towards us
        const fx = lerp(dx0, dx1 + 34, doorOpen), ftop = lerp(top0, top1 - 12, doorOpen), fbot = lerp(bot0, bot1 + 14, doorOpen);
        const leaf = (u0, v0, u1, v1) => { const X = (u) => lerp(fx, dx1, u), Yt = (u) => lerp(ftop, top1, u), Yb = (u) => lerp(fbot, bot1, u);
          return [[X(u0), lerp(Yt(u0), Yb(u0), v0)], [X(u1), lerp(Yt(u1), Yb(u1), v0)], [X(u1), lerp(Yt(u1), Yb(u1), v1)], [X(u0), lerp(Yt(u0), Yb(u0), v1)]]; };
        if (Math.abs(fx - dx1) > 1) {
          poly(g, leaf(0, 0, 1, 1), doorOpen > 0.5 ? WOOD[2] : WOOD[1]);
          poly(g, leaf(0.18, 0.07, 0.82, 0.45), mix(WOOD[2], D.n1, 0.2)); poly(g, leaf(0.18, 0.53, 0.82, 0.92), mix(WOOD[2], D.n1, 0.2));
          const kn = leaf(0.08, 0.52, 0.12, 0.54)[0]; R(g, kn[0] - 1, kn[1], 3, 3, D.amber[1]); R(g, kn[0] - 1, kn[1], 1, 1, D.amber[0]);
        }
        if (doorOpen > 0.05) { A(g, 0.22 * doorOpen, () => poly(g, [[dx0, bot0], [dx1, bot1], [dx1 - 40, 372], [dx0 - 70, 372]], D.lamp)); PX.glow(g, dx1 - 6, bot1 - 50, 50, D.lamp, 0.12 * doorOpen); }
        // wall sconce
        R(g, 504, 160, 6, 10, WOOD[2]); ell(g, 507, 157, 5, 4, mix(D.cream, D.lamp, 0.4)); PX.glow(g, 507, 157, 22, D.lamp, 0.12);
      });
      // ---- rows of benches, far to near ----
      const rows = STU.rows, dzIn = t >= tSit + 0.3 * ed && tE < 90;
      rows.forEach((rw, ri) => {
        const dep = 0.55 + ri * 0.15;
        PX.par(g, c0, dep, () => {
          const k = rw.k, deskY = rw.y - 26 * k, x0 = rw.x0, x1 = rw.x1;
          // the tier this row stands on spans wall to wall; side aisles get a step nosing
          const ty = rw.y + 29 * k, xl = 148 - (ty - 216) * 1.146, xr = 492 + (ty - 216) * 1.146;
          poly(g, [[xl, ty], [xr, ty], [xr + 60, ty + 60], [xl - 60, ty + 60]], mix(D.n2, WOOD[2], 0.45));
          R(g, xl, ty, x0 - xl, 2, WOOD[0]); R(g, x1, ty, xr - x1, 2, mix(WOOD[0], D.n4, 0.3));
          poly(g, [[xl, ty + 2], [x0 - 6 * k, ty + 2], [x0 - 6 * k, ty + 6 * k], [xl - 6 * k, ty + 6 * k]], mix(D.n1, WOOD[2], 0.4));
          // desk top of this row (in front of the students: we see it beyond their shoulders)
          R(g, x0 - 4 * k, deskY, x1 - x0 + 8 * k, 4 * k, WOOD[0]); R(g, x0 - 4 * k, deskY + 4 * k, x1 - x0 + 8 * k, 3 * k, WOOD[2]);
          // papers on the desk
          for (let i = 0; i < 6; i++) { const px = x0 + 20 * k + i * (x1 - x0 - 40 * k) / 5 + hash(ri, i) * 10; R(g, px, deskY, 9 * k, 2 * k, D.paper); }
          // students
          for (const s of STU) if (s.ri === ri) {
            const turn = s.turner && tE < 90 && t > tE + 0.2 && t < tE + 2.6 * ed ? E((t - tE - 0.2) / 0.3, "out") * (1 - E((t - tE - 2.0 * ed) / 0.5, "io")) * 0.9 : 0;
            const lit = s.x < 330 - ri * 20 ? mix(D.lamp, D.cream, 0.4) : null;
            backBust(g, s.x, s.y - 2 * k, k, { pal: s.pal, t, ph: s.ph, write: s.write, turn, light: lit });
          }
          if (ri === 3 && dzIn) backBust(g, 392, rw.y - 2 * k, k, { pal: DZ, t, ph: 1, write: t > tSit + 1.2 * ed, turn: t < tSit + 1.0 * ed ? -0.6 : 0 });
          // bench back of this row
          R(g, x0 - 6 * k, rw.y + 14 * k, x1 - x0 + 12 * k, 14 * k, WOOD[1]); R(g, x0 - 6 * k, rw.y + 14 * k, x1 - x0 + 12 * k, Math.max(1, k), WOOD[0]);
          R(g, x0 - 6 * k, rw.y + 26 * k, x1 - x0 + 12 * k, 3 * k, WOOD[2]);
          for (let x = x0; x < x1; x += 46 * k) R(g, x, rw.y + 16 * k, Math.max(1, k), 10 * k, WOOD[2]);
          // riser below
          R(g, x0 - 6 * k, rw.y + 29 * k, x1 - x0 + 12 * k, 40, mix(D.n2, D.amber[2], 0.2));
          if (ri === 3 && dzIn) { R(g, 410, rw.y + 6, 12, 10, mix(D.rust[2], D.n2, 0.25)); R(g, 410, rw.y + 6, 12, 2, mix(D.rust[1], D.n2, 0.45)); }
        });
      });
      // ---- the young man walking in (nearest layer) ----
      PX.par(g, c0, 1.0, () => {
        if (tE < 90 && t >= tStep && t < tSit + 0.3 * ed) {
          const wx = walkX(t), ph = (t - tStep) * 9, walking = t < tSit;
          const sw = walking ? Math.sin(ph) : 0;
          const sink = sitP * 30;
          shadow(g, wx, 356, 16, 3, 0.3);
          sideFig(g, wx, 356 + sink, { h: 98, pal: DZ, dir: -1, t, legN: [sw * 24, sw * 24 - Math.max(0, Math.cos(ph)) * 30], legF: [-sw * 24, -sw * 24 - Math.max(0, -Math.cos(ph)) * 30],
            armN: [-sw * 16, -sw * 10 + 6], armF: [sw * 16 - 4, sw * 10], lean: 3, headDy: 1, bag: true, face: { brow: 2, mouth: "flat", eye: "open" } });
        }
      });
      // sunlight dust in the shafts
      for (let i = 0; i < 3; i++) dustIn(g, shafts[i], 11 + i, 26, t, [0, 30, 500, 330]);
      PX.vignette(g, 0.55);
    };
  };

  // ======================= impossible =======================
  // close on the 1939 blackboard: the same two chalk problems, morning sun and leaf shadows drifting across the slate.
  // o.label 1.0 a small chalk "UNSOLVED" is written above each; o.solved 2.8 a chalk tick is drawn under each.
  K.impossible = (o) => {
    const WS = wordStrokes("UNSOLVED", 2.0, 5), WS2 = wordStrokes("UNSOLVED", 2.0, 9);
    const TICK = [[[0, 6], [5, 12], [17, -2]].map(([x, y]) => [x * 1.15, y * 1.15])];
    return (g, t, d, c) => {
      const T = tm(o, d, 4.5), tL = T("label", 1.0), tS = T("solved", 2.8), sd = d / 4.5;
      const bx = 60, by = 40, bw = 520, bh = 246;
      PX.par(g, c, 0.6, () => {
        PX.vgrad(g, -40, -40, 720, 440, mix(D.paperD, D.n4, 0.5), mix(D.paperD, D.n3, 0.62), 7);
        R(g, -40, 318, 720, 60, WOOD[2]); R(g, -40, 318, 720, 2, WOOD[1]);
      });
      PX.par(g, c, 0.85, () => {
        const B = blackboard(g, bx, by, bw, bh, t, { lit: true, top: 74 });
        // sun band + drifting leaf shadows on the slate
        clip(g, bx, by, bw, bh, () => {
          A(g, 0.07, () => poly(g, [[bx + 40, by], [bx + 250, by], [bx + 420, by + bh], [bx + 200, by + bh]], D.lamp));
          for (let i = 0; i < 14; i++) { const lx = bx + 60 + hash(i, 1) * 320 + Math.sin(t * 0.7 + i) * 4, ly = by + hash(i, 2) * bh; A(g, 0.14, () => ell(g, lx + (ly - by) * 0.8, ly, 10 + hash(i, 3) * 10, 5 + hash(i, 4) * 5, D.n0)); }
        });
        for (let i = 0; i < 2; i++) {
          const cx0 = bx + B.pad + i * (bw / 2), ws = i ? WS2 : WS, t0 = tL + i * 0.35 * sd;
          const p = clamp((t - t0) / (0.75 * sd), 0, 1);
          if (p > 0) { const tip = drawStrokes(g, ws.strokes, cx0 + 2, by + 26, p, CHALK, { gap: 0.1, w: 2 });
            if (tip && p < 1) { R(g, tip[0] - 1, tip[1] - 1, 3, 3, D.cream); PX.particles(g, 30 + i, 5, t, [tip[0] - 4, tip[1] - 2, 9, 9], { vy: 6, col: D.cream, a: 0.5 }); } }
          if (p >= 1) { const q = clamp((t - t0 - 0.75 * sd) / 0.2, 0, 1); A(g, 0.85, () => tline(g, cx0 + 2, by + 43, cx0 + 2 + ws.w * q, by + 44, CHALK, { gap: 0.08 })); }
          const s0 = tS + i * 0.3 * sd, sp = clamp((t - s0) / (0.35 * sd), 0, 1);
          if (sp > 0) { const tip = drawStrokes(g, TICK, cx0 + B.bw * 0.4, B.bottom + 14, sp, CHALK, { gap: 0.05, w: 3 });
            if (tip && sp < 1) PX.particles(g, 40 + i, 6, t, [tip[0] - 5, tip[1] - 3, 11, 11], { vy: 7, col: D.cream, a: 0.6 }); }
        }
      });
      PX.particles(g, 3, 40, t, [40, 0, 420, 360], { vy: -2, vx: 2, col: D.lamp, a: 0.45, tw: 1.2 });
      // foreground: corner of the lecturer's desk with a chalk box and a felt eraser
      PX.par(g, c, 1.15, () => {
        poly(g, [[-40, 330], [150, 322], [170, 372], [-40, 372]], WOOD[1]); PX.line(g, -40, 330, 150, 322, WOOD[0]); poly(g, [[-40, 334], [152, 326], [154, 330], [-40, 338]], mix(WOOD[1], D.n0, 0.25));
        R(g, 70, 312, 26, 12, mix(D.paper, D.steel[1], 0.2)); R(g, 70, 312, 26, 2, mix(D.cream, D.steel[0], 0.3)); for (let i = 0; i < 4; i++) R(g, 73 + i * 5, 309, 3, 4, D.cream);
        R(g, 112, 316, 24, 7, mix(D.n3, D.amber[2], 0.3)); R(g, 112, 316, 24, 3, mix(D.paperD, D.n4, 0.3));
      });
      PX.vignette(g, 0.5);
    };
  };

  // ---------- time of day for windows: n day cycles between a and b ----------
  const dayAt = (t, a, b, n) => {
    if (!(b > a) || t <= a || t >= b) return { day: 0, warm: 0, f: 0 };
    const f = frac(((t - a) / (b - a)) * n);
    const day = PX.smooth((f - 0.12) / 0.18) * (1 - PX.smooth((f - 0.7) / 0.18));
    const warm = clamp(Math.max(1 - Math.abs(f - 0.22) / 0.09, 1 - Math.abs(f - 0.8) / 0.09), 0, 1);
    return { day, warm, f };
  };
  const skyTop = (u, w) => mix(mix(mix(D.n0, D.steel[2], 0.3), mix(D.steel[0], D.steel[1], 0.4), u), mix(D.rose[1], D.steel[1], 0.4), w * 0.5);
  const skyBot = (u, w) => mix(mix(mix(D.n1, D.steel[2], 0.5), mix(D.cream, D.steel[0], 0.4), u), D.lamp, w * 0.75);

  // ======================= copy_night =======================
  // a small rented room: he works hunched at the desk under a lamp; through the window night turns to day and back
  // (days pass); crumpled pages pile up round the basket, finished pages stack, coffee cups multiply.
  // o.days [1.0, 6.0] the days-passing stretch (o.n 3 day cycles); outside it, night.
  K.copy_night = (o) => {
    const roofs = []; { const r = PX.rnd(44); let x = 300; while (x < 470) { const w = 18 + r() * 26, h = 20 + r() * 34; roofs.push([x, w, h, r() < 0.6, [r(), r(), r()]]); x += w - 2; } }
    const balls = []; { const r = PX.rnd(9); for (let i = 0; i < 40; i++) { const ring = Math.floor(i / 8); balls.push([556 + (r() - 0.5) * (30 + ring * 10), 327 - ring * 3 - r() * 3, 3 + Math.floor(r() * 2), r()]); } }
    return (g, t, d, c) => {
      const RG = rng(o, d, 9.0), [a, b] = RG("days", 1.0, 6.0), n = Math.max(1, Math.round(o.n || 3));
      const S = dayAt(t, a, b, n), day = S.day, warm = S.warm, night = 1 - day;
      const passed = t >= b ? n : t <= a ? 0 : ((t - a) / Math.max(1e-6, b - a)) * n;   // days of work done (continuous)
      const tossEvery = 1.5 * d / 9, tossT0 = 0.6 * d / 9, tossN = Math.max(0, Math.floor((t - tossT0) / tossEvery) + 1);
      const tossU = t >= tossT0 ? ((t - tossT0) % tossEvery) / tossEvery : 1;
      const pile = Math.min(balls.length, 2 + tossN + Math.floor(passed * 6));
      // ---- wall + window (far) ----
      PX.par(g, c, 0.5, () => {
        const wall = mix(mix(D.n3, D.amber[2], 0.14), D.paperD, 0.14);
        R(g, -40, -40, 720, 380, wall);
        for (let x = -40; x < 680; x += 12) R(g, x, -40, 1, 380, mix(wall, D.n1, 0.16));
        for (let x = -34; x < 680; x += 24) for (let y = 8; y < 300; y += 22) R(g, x, y + (Math.round(x / 24) % 2) * 11, 2, 2, mix(wall, D.paperD, 0.15));
        R(g, -40, 40, 720, 3, mix(wall, D.n0, 0.3)); R(g, -40, 40, 720, 1, mix(wall, D.cream, 0.15));
        // sloped attic ceiling over the bed, with a beam
        poly(g, [[-40, -40], [290, -40], [-40, 170]], mix(wall, D.n1, 0.35)); poly(g, [[250, -40], [290, -40], [-40, 170], [-40, 146]], mix(WOOD[2], D.n1, 0.3));
        PX.line(g, 290, -40, -40, 170, mix(WOOD[1], D.n2, 0.3));
        // small framed photo above the bed
        R(g, 112, 150, 22, 28, WOOD[2]); R(g, 114, 152, 18, 24, mix(D.paperD, D.n4, 0.4)); ell(g, 123, 160, 4, 4, mix(D.n4, D.paperD, 0.2)); R(g, 117, 165, 12, 11, mix(D.n4, D.paperD, 0.25));
        // handwritten pages pinned up beside the window: more every day
        const pins = Math.min(7, 1 + Math.floor(passed * 2));
        for (let i = 0; i < pins; i++) { const px2 = 480 + (i % 3) * 22 + hash(i, 4) * 4, py2 = 112 + Math.floor(i / 3) * 30 + hash(i, 5) * 4; R(g, px2, py2, 18, 24, i % 2 ? D.paper : mix(D.paper, D.paperD, 0.5)); for (let l = 0; l < 5; l++) R(g, px2 + 2, py2 + 4 + l * 4, 10 + hash(i, l) * 4, 1, mix(D.n4, D.paper, 0.35)); R(g, px2 + 8, py2 + 1, 2, 2, D.rust[1]); }
        const wx = 304, wy = 58, ww = 160, wh = 128;
        R(g, wx - 7, wy - 7, ww + 14, wh + 14, WOOD[2]); R(g, wx - 6, wy - 6, ww + 12, 1, WOOD[1]);
        PX.vgrad(g, wx, wy, ww, wh, skyTop(day, warm), skyBot(day, warm), 6);
        clip(g, wx, wy, ww, wh, () => {
          A(g, night * 0.9, () => { for (let i = 0; i < 26; i++) R(g, wx + hash(i, 3) * ww, wy + hash(i, 4) * wh * 0.6, 1, 1, D.cream); PX.circle(g, wx + 120, wy + 24, 6, mix(D.cream, D.n6, 0.15)); PX.circle(g, wx + 123, wy + 22, 5, skyTop(day, warm)); });
          if (S.f > 0) { const u = clamp((S.f - 0.15) / 0.7, 0, 1), sx = wx + lerp(-10, ww + 10, u), sy = wy + wh - 30 - Math.sin(u * Math.PI) * 70; A(g, day, () => { PX.circle(g, sx, sy, 7, mix(D.lamp, D.cream, 0.5)); PX.glow(g, sx, sy, 34, D.lamp, 0.25); }); }
          for (let i = 0; i < 4; i++) { const cx2 = wx + frac(hash(i, 8) + t * 0.05 + passed * 0.6) * (ww + 80) - 40, cy2 = wy + 14 + i * 12; A(g, 0.25 + day * 0.4, () => { ell(g, cx2, cy2, 16, 4, mix(skyBot(day, warm), D.cream, 0.35)); ell(g, cx2 + 8, cy2 - 2, 9, 3, mix(skyBot(day, warm), D.cream, 0.45)); }); }
          for (const [x0, w0, h0, chim, rr] of roofs) {
            const top = wy + wh - h0, col = mix(mix(D.n1, D.steel[2], 0.3), mix(D.n4, D.paperD, 0.3), day);
            R(g, x0, top, w0, h0, col); poly(g, [[x0 - 2, top], [x0 + w0 / 2, top - 8], [x0 + w0 + 2, top]], mix(col, D.n0, 0.25));
            if (chim) R(g, x0 + w0 * 0.7, top - 12, 4, 8, mix(col, D.rust[2], 0.2));
            for (let k2 = 0; k2 < 3; k2++) { const lit = rr[k2] < 0.55, wx2 = x0 + 3 + k2 * (w0 / 3), wy2 = top + 6 + (k2 % 2) * 9; R(g, wx2, wy2, 3, 4, lit ? mix(mix(D.n2, D.steel[2], 0.3), D.lampD, night * (0.6 + 0.4 * Math.sin(t + k2 + x0))) : mix(col, D.n0, 0.3)); }
          }
        });
        R(g, wx + ww / 2 - 2, wy, 4, wh, WOOD[1]); R(g, wx, wy + wh / 2 - 2, ww, 4, WOOD[1]); R(g, wx + ww / 2 - 2, wy, 1, wh, WOOD[0]);
        R(g, wx - 12, wy + wh + 6, ww + 24, 5, WOOD[1]); R(g, wx - 12, wy + wh + 6, ww + 24, 1, WOOD[0]);
        for (let k2 = 0; k2 < 4; k2++) R(g, wx - 16 + k2 * 6, wy - 12, 6, wh + 24, k2 % 2 ? mix(D.paperD, D.rust[2], 0.25) : mix(D.paper, D.rust[2], 0.18));
        R(g, wx - 22, wy - 14, ww + 44, 3, D.n4);
        // coat on a hook + a shelf with a few books
        R(g, 222, 70, 4, 3, D.n5); poly(g, [[214, 72], [234, 72], [240, 150], [208, 150]], mix(D.n3, D.steel[2], 0.3)); R(g, 220, 72, 8, 40, mix(D.n2, D.steel[2], 0.3));
        R(g, 520, 92, 90, 4, WOOD[1]); { let xx = 524; const rb = PX.rnd(3); for (let i = 0; i < 9; i++) { const w2 = 5 + Math.floor(rb() * 4), h2 = 16 + Math.floor(rb() * 10); R(g, xx, 92 - h2, w2, h2, mix([D.rust[2], D.steel[2], D.moss[2], D.paperD][i % 4], D.n2, 0.4)); xx += w2 + 1; } }
      });
      // ---- floor + daylight patch sweeping with the sun ----
      R(g, -40, 330, 720, 40, mix(WOOD[2], D.n1, 0.35)); for (let k2 = 0; k2 < 4; k2++) R(g, -40, 334 + k2 * 7, 720, 1, mix(WOOD[2], D.n0, 0.5));
      if (day > 0) { const sx = lerp(420, 200, clamp((S.f - 0.15) / 0.7, 0, 1)); A(g, 0.16 * day, () => poly(g, [[sx, 332], [sx + 90, 332], [sx + 70, 360], [sx - 40, 360]], D.lamp)); A(g, 0.08 * day, () => poly(g, [[304, 186], [464, 186], [sx + 90, 332], [sx, 332]], D.lamp)); }
      // ---- bed + radiator (left) ----
      PX.par(g, c, 0.85, () => {
        const ir = mix(D.n2, D.steel[2], 0.25);
        R(g, 20, 214, 4, 118, ir); R(g, 20, 214, 4, 1, D.n5); for (let i = 0; i < 5; i++) R(g, 26 + i * 7, 230, 2, 50, ir); R(g, 20, 230, 40, 3, ir);
        R(g, 22, 268, 170, 22, mix(D.paper, D.n4, 0.35)); R(g, 22, 268, 170, 2, mix(D.paper, D.n6, 0.2));
        poly(g, [[60, 262], [196, 266], [200, 300], [56, 300]], mix(D.moss[2], D.n2, 0.35)); for (let i = 0; i < 6; i++) PX.line(g, 70 + i * 22, 264, 66 + i * 23, 298, mix(D.moss[2], D.n1, 0.45));
        ell(g, 44, 262, 16, 6, mix(D.cream, D.paperD, 0.3)); R(g, 22, 290, 176, 4, ir); R(g, 30, 294, 3, 36, ir); R(g, 186, 294, 3, 36, ir);
        R(g, 194, 238, 4, 94, ir);
        R(g, 236, 288, 40, 40, mix(D.n4, D.paperD, 0.2)); for (let i = 0; i < 6; i++) R(g, 238 + i * 6.5, 290, 2, 36, mix(D.n3, D.paperD, 0.15));
      });
      // ---- desk, lamp, papers ----
      const lampOn = 0.15 + 0.85 * night, fl = 0.96 + 0.04 * Math.sin(t * 13) * Math.sin(t * 3.1);
      shadow(g, 450, 331, 96, 4, 0.4);
      R(g, 360, 282, 180, 7, WOOD[1]); R(g, 360, 282, 180, 1, WOOD[0]); R(g, 364, 289, 6, 42, WOOD[2]); R(g, 530, 289, 6, 42, WOOD[2]); R(g, 440, 289, 90, 18, WOOD[2]); R(g, 440, 297, 90, 1, mix(WOOD[2], D.n0, 0.3)); R(g, 481, 292, 8, 2, D.amber[2]);
      const stack = Math.min(14, 2 + Math.floor(passed * 3.5));
      for (let i = 0; i < stack; i++) R(g, 478 + (hash(i, 1) - 0.5) * 3, 280 - i * 1.4, 24, 2, i % 2 ? D.paper : D.paperD);
      R(g, 404, 278, 30, 4, D.paper); R(g, 432, 279, 22, 3, D.paperD); for (let i = 0; i < 3; i++) R(g, 408 + i * 7, 279, 5, 1, D.n4);
      const cups = Math.min(4, 1 + Math.floor(passed));
      for (let i = 0; i < cups; i++) { const cx2 = 456 + i * 9 - (i > 1 ? 30 : 0), cy2 = 274; R(g, cx2, cy2, 6, 8, D.cream); R(g, cx2 + 6, cy2 + 2, 2, 3, D.cream); R(g, cx2, cy2 + 7, 6, 1, D.paperD); R(g, cx2 + 1, cy2, 4, 1, mix(D.rust[2], D.n1, 0.5)); }
      for (let i = 0; i < 3; i++) { const k2 = frac(t * 0.5 + i / 3); A(g, 0.35 * (1 - k2), () => R(g, 458 + Math.sin(k2 * 6 + i) * 2, 270 - k2 * 14, 1, 2, D.cream)); }
      R(g, 514, 278, 18, 4, D.n2); R(g, 514, 278, 18, 1, D.n4); PX.line(g, 523, 278, 523, 246, D.n3); PX.line(g, 523, 246, 510, 236, D.n3);
      poly(g, [[500, 228], [518, 232], [514, 244], [494, 240]], mix(D.moss[2], D.n2, 0.3)); R(g, 497, 240, 16, 2, mix(D.lamp, D.n4, 1 - lampOn));
      A(g, lampOn * fl, () => { A(g, 0.1, () => poly(g, [[500, 240], [514, 244], [560, 284], [380, 284]], D.lamp)); PX.glow(g, 504, 244, 18, D.cream, 0.3); });
      // ---- him: seated, hunched over the desk, writing; every so often crumples a page and tosses it ----
      // toss: wind up (hand by the ear), flick forward, the ball arcs over the desk into the basket
      const TQ = 0.5, q = tossU / TQ, tossing = q < 1 && t >= tossT0;
      const wr = Math.sin(t * 11) * 3, wr2 = Math.sin(t * 2.3) * 2;
      const armN = tossing ? [PX.KF([[0, 62], [0.35, 150], [0.55, 95], [1, 62]], q), PX.KF([[0, 104], [0.35, 195], [0.55, 95], [1, 104]], q)] : [62 + wr2, 104 + wr];
      const lean = 13 + Math.sin(t * 0.7) * 1 + Math.min(3, passed) - (tossing ? Math.sin(q * Math.PI) * 5 : 0);
      R(g, 316, 302, 46, 4, WOOD[1]); R(g, 318, 306, 3, 25, WOOD[2]); R(g, 356, 306, 3, 25, WOOD[2]); R(g, 314, 238, 4, 68, WOOD[2]); R(g, 314, 238, 4, 1, WOOD[0]);
      const me = sideFig(g, 338, 330, { h: 108, pal: DZ, t, hipY: 300, legN: [84, 4], legF: [78, 2], armF: [60, 98], armN, lean, headDx: 3 + passed * 0.5, headDy: 5, light: mix(DZ.coat[0], D.lamp, 0.45 * lampOn), face: { eye: passed > 1.5 ? "half" : "down", brow: -1, mouth: "flat" } });
      if (!tossing) { R(g, me.hand[0] + 1, me.hand[1] - 5, 1, 6, D.amber[1]); R(g, me.hand[0] + 1, me.hand[1] + 1, 1, 1, D.n1); }
      else if (q < 0.55) { ell(g, me.hand[0], me.hand[1] - 2, 2.5, 2.5, D.paper); R(g, me.hand[0] - 1, me.hand[1] - 3, 1, 1, D.cream); }
      else { const u = (q - 0.55) / 0.45, bx2 = lerp(me.hand[0], 556, u), by2 = lerp(me.hand[1], 318, u * u) - Math.sin(u * Math.PI) * 30; ell(g, bx2, by2, 2.5, 2.5, D.paper); R(g, bx2 - 1, by2 - 1, 1, 1, D.cream); }
      // ---- basket + pile of crumpled pages ----
      for (let i = 0; i < pile; i++) { const [x2, y2, r2, sh] = balls[i]; ell(g, x2, y2, r2, r2 - 0.5, sh < 0.5 ? D.paper : D.paperD); R(g, x2 - 1, y2 - r2 + 1, 2, 1, D.cream); R(g, x2, y2, 1, 1, D.n5); }
      R(g, 546, 306, 22, 24, mix(D.n3, D.amber[2], 0.25)); for (let i = 0; i < 5; i++) R(g, 548 + i * 4, 308, 1, 21, mix(D.n2, D.amber[2], 0.2)); R(g, 545, 305, 24, 2, mix(D.n4, D.amber[2], 0.25));
      for (let i = 0; i < Math.min(5, pile); i++) ell(g, 551 + i * 3, 304 - (i % 2) * 2, 3, 2.5, D.paper);
      // ---- night darkness, then the lamp's warmth over it ----
      A(g, 0.42 * night, () => R(g, 0, 0, 640, 360, D.n0));
      A(g, lampOn * fl, () => { PX.glow(g, 480, 262, 150, D.lampD, 0.2); PX.glow(g, 410, 240, 60, D.lamp, 0.1); });
      A(g, 0.08 * day, () => R(g, 0, 0, 640, 360, D.steel[0]));
      PX.particles(g, 21, 18, t, [390, 220, 140, 70], { vy: -2, vx: 1, col: D.lamp, a: 0.5 * lampOn });
      PX.vignette(g, 0.6);
    };
  };

  // ---------- small props ----------
  const books = (g, x, y, w, seed, h0, dim) => { const r = PX.rnd(seed); let xx = x; const cols = [D.rust[2], D.steel[2], D.moss[2], D.paperD, D.amber[2], D.n4, D.plum[2]];
    while (xx < x + w - 4) { const bw = 3 + Math.floor(r() * 4), bh = (h0 || 18) - Math.floor(r() * 6), col = mix(cols[Math.floor(r() * cols.length)], D.n2, dim === undefined ? 0.35 : dim);
      if (r() < 0.08) { poly(g, [[xx, y], [xx + bw, y], [xx + bw + 5, y - bh + 1], [xx + 5, y - bh + 1]], col); xx += bw + 6; continue; }
      R(g, xx, y - bh, bw, bh, col); R(g, xx, y - bh, 1, bh, mix(col, D.cream, 0.15)); R(g, xx, y - bh + 3, bw, 1, mix(col, D.amber[0], 0.25)); xx += bw + (r() < 0.15 ? 2 : 0); } };
  const paperStack = (g, x, y, w, n, seed) => { for (let i = 0; i < n; i++) { const dx = (hash(i, seed) - 0.5) * 4; R(g, x + dx, y - i * 2, w, 2, i % 3 === 0 ? D.paperD : D.paper); R(g, x + dx, y - i * 2, w, 1, mix(D.paper, D.cream, 0.4)); } };

  // ======================= hand_in =======================
  // the professor's office, late morning: shelves of books, blinds striping the light, a cluttered desk. The young man
  // sets his papers on the pile and rubs the back of his neck, apologetic; the professor keeps writing, barely glances.
  // o.place 0.5 the papers go down; o.rub 1.8 the neck rub; o.glance 2.7 the professor's eyes flick up for a moment.
  K.hand_in = (o) => {
    const PR = { ...PROF, coat: tri(mix(D.n4, D.amber[2], 0.18), 0.22, 0.45) };
    return (g, t, d, c) => {
      const T = tm(o, d, 4.5), tP = T("place", 0.5), tR = T("rub", 1.8), tG = T("glance", 2.7), sd = d / 4.5;
      // ---- back wall: shelves, window with blinds, diploma ----
      PX.par(g, c, 0.5, () => {
        const wall = mix(D.paperD, D.moss[2], 0.18);
        PX.vgrad(g, -40, -40, 720, 330, mix(wall, D.n3, 0.35), mix(wall, D.n3, 0.55), 6);
        R(g, -40, 250, 720, 70, WOOD[2]); R(g, -40, 250, 720, 2, WOOD[1]);
        // bookshelves (left)
        R(g, 14, 30, 196, 290, mix(WOOD[2], D.n1, 0.25)); R(g, 14, 30, 196, 3, WOOD[1]);
        for (let s = 0; s < 6; s++) { const sy = 70 + s * 46; R(g, 18, sy, 188, 4, WOOD[1]); R(g, 18, sy, 188, 1, WOOD[0]); books(g, 20, sy, 184, 11 + s, 30 - (s === 4 ? 6 : 0)); }
        // window with blinds (right), daylight
        const wx = 470, wy = 40, ww = 130, wh = 150;
        R(g, wx - 6, wy - 6, ww + 12, wh + 12, WOOD[2]);
        PX.vgrad(g, wx, wy, ww, wh, mix(D.steel[0], D.cream, 0.45), mix(D.cream, D.moss[0], 0.3), 5);
        A(g, 0.45, () => { ell(g, wx + 40, wy + 100, 40, 30, mix(D.moss[1], D.cream, 0.35)); ell(g, wx + 100, wy + 120, 30, 26, mix(D.moss[1], D.cream, 0.45)); });
        for (let i = 0; i < 22; i++) { R(g, wx, wy + 4 + i * 6.5, ww, 3, mix(D.paper, D.cream, 0.3)); R(g, wx, wy + 6 + i * 6.5, ww, 1, mix(D.paperD, D.n4, 0.2)); }
        R(g, wx + ww / 2, wy, 1, wh, D.n5);
        R(g, wx - 10, wy + wh + 6, ww + 20, 5, WOOD[1]); R(g, wx - 10, wy + wh + 6, ww + 20, 1, WOOD[0]);
        // diploma + small portrait
        R(g, 262, 54, 54, 40, WOOD[2]); R(g, 265, 57, 48, 34, mix(D.cream, D.paper, 0.4)); for (let l = 0; l < 4; l++) R(g, 272, 64 + l * 6, 34 - (l % 2) * 8, 1, mix(D.n5, D.paper, 0.3)); PX.circle(g, 302, 83, 3, D.rust[1]);
        R(g, 336, 62, 30, 36, WOOD[2]); R(g, 338, 64, 26, 32, mix(D.n4, D.paperD, 0.35)); ell(g, 351, 76, 6, 7, mix(D.n5, D.paperD, 0.3)); R(g, 343, 84, 16, 12, mix(D.n3, D.paperD, 0.25));
        // coat stand with a hat
        R(g, 432, 70, 3, 248, D.n2); R(g, 424, 316, 19, 3, D.n2); poly(g, [[420, 82], [446, 82], [452, 170], [416, 170]], mix(D.n3, D.steel[2], 0.25)); R(g, 422, 70, 22, 5, mix(D.n2, D.amber[2], 0.2)); R(g, 426, 64, 14, 7, mix(D.n2, D.amber[2], 0.2));
      });
      // blinds light stripes on the wall and floor
      A(g, 0.06, () => { for (let i = 0; i < 10; i++) poly(g, [[460, 50 + i * 14], [470, 50 + i * 14], [250, 170 + i * 18], [236, 170 + i * 18]], D.lamp); });
      // floor + rug
      R(g, -40, 318, 720, 50, mix(WOOD[2], D.n1, 0.3)); for (let k2 = 0; k2 < 4; k2++) R(g, -40, 322 + k2 * 10, 720, 1, mix(WOOD[2], D.n0, 0.45));
      poly(g, [[150, 330], [600, 330], [630, 362], [120, 362]], mix(D.rust[2], D.n2, 0.4)); poly(g, [[158, 333], [592, 333], [620, 362], [128, 362]], mix(D.rust[2], D.n2, 0.55));
      for (let i = 0; i < 12; i++) R(g, 170 + i * 36, 346, 14, 2, mix(D.amber[2], D.n2, 0.5));
      // ---- the professor seated behind the desk (own depth layer) ----
      const DT = 270;
      PX.par(g, c, 0.88, () => {
      const glance = t >= tG && t < tG + 0.7 * sd, dx = 410;
      R(g, dx - 20, 206, 40, 70, mix(D.n2, D.rust[2], 0.3)); R(g, dx - 20, 206, 40, 3, mix(D.n3, D.rust[2], 0.3)); for (let i = 0; i < 5; i++) R(g, dx - 16 + i * 8, 212, 2, 2, D.amber[2]);   // leather chair back
      const pf = frontFig(g, dx, 330, { h: 108, pal: PR, t, hipY: 284, noArms: true, noLegs: true, headDy: glance ? 0 : 2, face: { eye: glance ? "open" : "down", lookY: glance ? -0.6 : 0, brow: glance ? 1 : 0, mouth: "flat" } });
      // desk (front panel faces us)
      R(g, 268, DT, 300, 6, WOOD[1]); R(g, 268, DT, 300, 1, WOOD[0]); R(g, 272, DT + 6, 292, 50, WOOD[2]); R(g, 272, DT + 6, 292, 1, mix(WOOD[2], D.n0, 0.3));
      for (const px2 of [282, 430]) { R(g, px2, DT + 14, 124, 38, mix(WOOD[2], D.n1, 0.2)); R(g, px2, DT + 14, 124, 1, mix(WOOD[1], D.n2, 0.3)); R(g, px2 + 58, DT + 30, 8, 2, D.amber[2]); }
      shadow(g, 418, 326, 160, 4, 0.35);
      // forearms on the desk, pen moving
      const wr = Math.sin(t * 9) * 1.5, k = 1.2, shY = pf.shY;
      for (const s of [-1, 1]) { const ex = dx + s * 16, hx2 = dx + s * 5 + (s > 0 ? wr : 0); seg(g, dx + s * 12, shY + 6, ex, DT + 2, 6, s < 0 ? PR.coat[1] : PR.coat[2]); seg(g, ex, DT + 2, hx2, DT + 5, 6, s < 0 ? PR.coat[1] : PR.coat[2]); ell(g, hx2, DT + 5, 3, 2.4, s < 0 ? PR.skin[1] : PR.skin[2]); }
      R(g, dx + 6 + wr, DT - 4, 1, 8, D.n1); R(g, dx + 6 + wr, DT - 4, 1, 2, D.amber[1]);
      // clutter: paper stacks, books, inkwell, lamp, ashtray + pipe, the sheet he is writing on
      paperStack(g, 282, DT, 34, 8, 2); paperStack(g, 520, DT, 30, 12, 3); books(g, 330, DT, 26, 7, 12, 0.3);
      R(g, 388, DT - 2, 44, 3, D.paper); for (let i = 0; i < 3; i++) R(g, 392, DT - 2, 30 - i * 6, 1, mix(D.n5, D.paper, 0.3));
      R(g, 466, DT - 7, 8, 7, mix(D.n1, D.steel[2], 0.3)); R(g, 467, DT - 9, 6, 2, D.n4); R(g, 470, DT - 18, 1, 10, mix(D.cream, D.paperD, 0.3));
      R(g, 486, DT - 3, 14, 3, mix(D.n4, D.paperD, 0.3)); R(g, 492, DT - 6, 8, 3, mix(D.rust[2], D.n1, 0.3)); R(g, 488, DT - 5, 5, 2, mix(D.rust[2], D.n1, 0.3));
      for (let i = 0; i < 3; i++) { const k2 = frac(t * 0.35 + i / 3); A(g, 0.3 * (1 - k2), () => R(g, 490 + Math.sin(k2 * 7 + i) * 2, DT - 8 - k2 * 18, 1, 2, D.cream)); }
      // banker's lamp
      R(g, 540, DT - 4, 18, 4, mix(D.amber[2], D.n2, 0.3)); R(g, 548, DT - 18, 2, 14, mix(D.amber[2], D.n2, 0.2)); poly(g, [[532, DT - 26], [566, DT - 26], [562, DT - 18], [536, DT - 18]], mix(D.moss[2], D.n2, 0.2)); R(g, 532, DT - 26, 34, 1, mix(D.moss[1], D.n4, 0.3));
      if (t >= tP + 0.5 * sd || t >= tR) { R(g, 291, DT - 18, 18, 3, D.cream); R(g, 291, DT - 16, 18, 1, D.paperD); }   // his papers, on top of the pile
      });
      // ---- the young man: places the papers, then rubs his neck ----
      const pl = t >= tR ? 0 : E((t - tP) / (0.5 * sd), "io"), back = E((t - tP - 0.75 * sd) / (0.45 * sd), "io"), rub = E((t - tR) / (0.35 * sd), "io");
      const reach = pl * (1 - back);
      const rubW = Math.sin(t * 7) * 6;
      const armN = rub > 0 ? [lerp(12, -158, rub), lerp(6, 18 + rubW, rub)] : [lerp(30, 82, reach) * (1 - back) + 12 * back, lerp(70, 88, reach) * (1 - back) + 6 * back];
      const me = sideFig(g, 236, 326, { h: 110, pal: DZ, t, armN, armF: [lerp(8, 0, rub), lerp(14, 4, rub)], lean: 2 + 3 * reach + 2 * rub, headDy: 1 + rub * 2, headDx: rub * 1,
        face: { eye: rub > 0.5 ? "down" : "open", brow: rub > 0.5 || back > 0.5 ? 2 : 0, mouth: rub > 0.5 ? "smile" : "flat" } });
      shadow(g, 238, 326, 18, 3, 0.35);
      // the papers: in his hand, then on the desk pile
      if (!(t >= tP + 0.5 * sd || t >= tR)) { const ppx = me.hand[0] + 2, ppy = me.hand[1] - 6; R(g, ppx - 8, ppy, 18, 12, D.cream); R(g, ppx - 8, ppy, 18, 1, D.paper); for (let i = 0; i < 3; i++) R(g, ppx - 6, ppy + 3 + i * 3, 12, 1, mix(D.n5, D.paper, 0.4)); }
      // foreground: a tall office plant framing the right edge
      PX.par(g, c, 1.18, () => {
        R(g, 596, 318, 30, 44, mix(D.rust[2], D.n2, 0.35)); R(g, 594, 316, 34, 4, mix(D.rust[2], D.n3, 0.3));
        for (let i = 0; i < 9; i++) { const a = -1.9 + i * 0.32 + Math.sin(t * 0.8 + i) * 0.03, L = 60 + (i % 3) * 14, ex = 611 + Math.cos(a) * L, ey = 318 + Math.sin(a) * L; seg(g, 611, 318, ex, ey, 2, mix(D.moss[2], D.n1, 0.45)); ell(g, (611 + ex) / 2 + Math.cos(a) * 12, (318 + ey) / 2 + Math.sin(a) * 12, 7, 4, i % 2 ? mix(D.moss[2], D.n1, 0.4) : mix(D.moss[2], D.n1, 0.25)); }
      });
      PX.particles(g, 8, 26, t, [240, 40, 240, 200], { vy: -1.5, vx: 1.5, col: D.lamp, a: 0.4, tw: 1.1 });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= knock =======================
  // early Sunday morning on a quiet street of small houses, low sun from the left, long shadows. Close on a porch: the
  // professor in overcoat and hat bangs on the front door, papers in his other hand; the young man opens in pyjamas.
  // o.knock 0.8 knocking starts (bursts of three, the door shakes); o.open 3.5 the door opens.
  K.knock = (o) => {
    const PJ = { ...DZ, pj: true, hairStyle: "messy", coat: tri(mix(D.steel[1], D.paperD, 0.5), 0.25, 0.4), pants: tri(mix(D.steel[1], D.paperD, 0.5), 0.25, 0.4), shoe: mix(D.rust[2], D.n2, 0.3) };
    const PC = { ...PROF, coat: tri(mix(D.n3, D.amber[2], 0.2), 0.2, 0.45) };
    const far = []; { const r = PX.rnd(77); let x = -50; while (x < 230) { const w = 34 + r() * 30, h = 26 + r() * 20; far.push([x, w, h, r()]); x += w + 4 + r() * 10; } }
    const far2 = []; { const r = PX.rnd(78); let x = -60; while (x < 230) { const w = 26 + r() * 22, h = 18 + r() * 12; far2.push([x, w, h, r()]); x += w + 2; } }
    return (g, t, d, c) => {
      const T = tm(o, d, 7.0), tK = T("knock", 0.8), tO = T("open", 3.5), sd = d / 7;
      const kc = t - tK, per = 1.3, inK = kc >= 0 && t < tO, ph = inK ? kc % per : 9, ki = Math.floor(ph / 0.2), kphase = ki < 3 ? (ph % 0.2) / 0.2 : 1;
      const hit = inK && ki < 3 && kphase < 0.3;
      const open = E((t - tO) / (0.6 * sd), "out");
      const sunC = mix(D.lamp, D.cream, 0.35);
      // ---- far: low sun, street, houses across the way (seen past the corner of the house) ----
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -40, -40, 300, 300, mix(D.steel[1], D.n4, 0.25), mix(D.lamp, D.rose[0], 0.25), 8);
        PX.glow(g, 70, 196, 110, D.lamp, 0.45); PX.circle(g, 70, 196, 11, mix(D.cream, D.lamp, 0.5));
        for (let i = 0; i < 3; i++) { const cx2 = frac(hash(i, 2) + t * 0.006) * 300 - 50; A(g, 0.3, () => { ell(g, cx2, 60 + i * 26, 30, 4, mix(D.rose[0], D.cream, 0.5)); ell(g, cx2 + 14, 57 + i * 26, 16, 3, mix(D.rose[0], D.cream, 0.6)); }); }
        for (const [x, w, h, r] of far2) { const top = 214 - h, col = mix(mix(D.steel[1], D.lamp, 0.35), D.n5, 0.25); R(g, x, top, w, h + 30, col); poly(g, [[x - 3, top], [x + w / 2, top - 12], [x + w + 3, top]], mix(col, D.n4, 0.15)); }
        for (const [x, w, h, r] of far) { const top = 234 - h, col = mix(mix(D.steel[2], D.n4, 0.4), D.lamp, 0.12), lit = mix(col, D.lamp, 0.3);
          R(g, x, top, w, h + 30, col); R(g, x, top, 3, h + 30, lit); poly(g, [[x - 4, top], [x + w / 2, top - 16 - r * 6], [x + w + 4, top]], mix(col, D.rust[2], 0.25)); PX.line(g, x - 4, top, x + w / 2, top - 16 - r * 6, mix(lit, D.rust[1], 0.2));
          R(g, x + w * 0.22, top + 9, 6, 7, mix(col, D.lamp, r < 0.4 ? 0.55 : 0.12)); R(g, x + w * 0.62, top + 9, 6, 7, mix(col, D.n1, 0.2)); }
        for (let i = 0; i < 4; i++) { const tx = 10 + i * 64 + hash(i, 1) * 20, tc = mix(D.moss[2], D.steel[2], 0.35); R(g, tx - 1, 214, 3, 26, mix(D.n3, D.steel[2], 0.3)); for (let j = 0; j < 4; j++) ell(g, tx + (hash(i, j) - 0.5) * 14, 200 + j * 4 - 8, 10, 8, j % 2 ? tc : mix(tc, D.lamp, 0.15)); }
        R(g, -40, 240, 300, 80, mix(D.n4, D.paperD, 0.3)); R(g, -40, 240, 300, 1, mix(D.n6, D.lamp, 0.4));
        for (let i = 0; i < 6; i++) A(g, 0.25, () => R(g, -20 + i * 50, 262, 24, 2, D.cream));
        // a lamp-post across the street
        R(g, 150, 150, 2, 92, D.n3); R(g, 145, 146, 12, 5, D.n3); R(g, 147, 151, 8, 2, mix(D.cream, D.n5, 0.4));
      });
      // ---- the house front (mid) ----
      const hx0 = 214, base = 292;
      PX.par(g, c, 0.75, () => {
        const sid = mix(mix(D.paperD, D.steel[1], 0.3), D.n4, 0.2), sidD = mix(sid, D.n2, 0.3), sidL = mix(sid, D.lamp, 0.3);
        R(g, hx0, -40, 720, base + 40, sid);
        for (let y = -36; y < base; y += 6) { R(g, hx0, y, 720, 1, sidD); R(g, hx0, y + 1, 720, 1, mix(sid, D.cream, 0.08)); }
        // raking morning light on the wall, strongest near the corner
        A(g, 0.15, () => poly(g, [[hx0, -40], [hx0 + 140, -40], [hx0 + 330, base], [hx0, base]], D.lamp)); A(g, 0.07, () => poly(g, [[hx0 + 140, -40], [hx0 + 170, -40], [hx0 + 360, base], [hx0 + 330, base]], D.lamp));
        R(g, hx0 - 6, -40, 8, base + 40, mix(D.cream, D.paperD, 0.25)); R(g, hx0 - 6, -40, 2, base + 40, sidL);
        // upstairs windows (blinds half down), gutter + downspout, ivy up the corner
        for (const ux of [300, 470]) { R(g, ux - 5, 6, 70, 66, mix(D.cream, D.paperD, 0.3)); PX.vgrad(g, ux, 11, 60, 56, mix(D.steel[0], D.cream, 0.3), mix(D.lamp, D.paperD, 0.4), 4); R(g, ux, 11, 60, 24, mix(D.paper, D.cream, 0.3)); R(g, ux, 34, 60, 1, mix(D.paperD, D.n4, 0.3)); R(g, ux + 29, 11, 2, 56, mix(D.cream, D.paperD, 0.3)); R(g, ux - 8, 72, 76, 4, mix(D.cream, D.paperD, 0.2)); }
        R(g, 604, -40, 5, base + 40, mix(D.n5, D.paperD, 0.3)); R(g, 604, -40, 1, base + 40, sidL);
        for (let i = 0; i < 26; i++) { const vy = base - i * 9, vx = hx0 + 2 + Math.sin(i * 0.9) * 4; ell(g, vx, vy, 4, 3, i % 2 ? mix(D.moss[2], D.n2, 0.25) : mix(D.moss[1], D.n3, 0.35)); if (i % 3 === 0) R(g, vx + 3, vy - 2, 2, 2, mix(D.moss[0], D.lamp, 0.3)); }
        // window right of the door: curtains drawn
        const wx = 450, wy = 178;
        R(g, wx - 6, wy - 8, 92, 98, mix(D.cream, D.paperD, 0.3)); R(g, wx, wy, 80, 82, mix(D.n2, D.steel[2], 0.35));
        R(g, wx + 2, wy + 2, 38, 78, mix(D.paperD, D.rust[2], 0.25)); R(g, wx + 40, wy + 2, 38, 78, mix(D.paperD, D.rust[2], 0.32));
        for (let i = 0; i < 5; i++) { R(g, wx + 6 + i * 7, wy + 2, 1, 78, mix(D.paperD, D.rust[2], 0.4)); R(g, wx + 44 + i * 7, wy + 2, 1, 78, mix(D.paperD, D.rust[2], 0.45)); }
        R(g, wx + 39, wy, 2, 82, mix(D.cream, D.paperD, 0.3)); R(g, wx - 10, wy + 82, 100, 6, mix(D.cream, D.paperD, 0.2)); R(g, wx - 10, wy + 82, 100, 1, sidL);
        // window box with flowers
        R(g, wx - 4, wy + 88, 88, 10, mix(D.rust[2], D.n2, 0.35)); for (let i = 0; i < 10; i++) { ell(g, wx + 2 + i * 8.5, wy + 86, 5, 4, i % 2 ? D.moss[2] : mix(D.moss[1], D.n3, 0.2)); R(g, wx + 1 + i * 8.5, wy + 83, 2, 2, i % 3 ? mix(D.rose[1], D.paper, 0.2) : D.amber[0]); }
        // the doorway: hall behind, door hinged at the right, opening inward
        const dx0 = 344, dx1 = 392, dy0 = 172, dy1 = base, shake = hit ? (ki % 2 ? 1 : -1) : 0;
        R(g, dx0 - 7, dy0 - 9, dx1 - dx0 + 14, dy1 - dy0 + 9, mix(D.cream, D.paperD, 0.25)); R(g, dx0 - 7, dy0 - 9, dx1 - dx0 + 14, 2, sidL);
        R(g, dx0, dy0, dx1 - dx0, dy1 - dy0, mix(D.n1, D.rust[2], 0.18));
        R(g, dx0 + 4, dy0 + 30, dx1 - dx0 - 8, 2, mix(D.n2, D.rust[2], 0.25)); R(g, dx0 + 8, dy0 + 22, 3, 8, mix(D.n3, D.rust[2], 0.2));   // hall: picture rail + hook
        poly(g, [[dx0, dy1 - 40], [dx0 + 18, dy1 - 52], [dx0 + 18, dy1], [dx0, dy1]], mix(D.n2, D.rust[2], 0.22));                         // stairs going up
        for (let i = 0; i < 5; i++) R(g, dx0, dy1 - 8 - i * 9, 18 - i * 3, 1, mix(D.n3, D.rust[2], 0.25));
        if (open > 0) {
          A(g, 0.35 * open, () => poly(g, [[dx0, dy0], [dx0 + 30, dy0], [dx0 + 40, dy1], [dx0, dy1]], D.lamp));   // sun reaching into the hall
          const yawn = t > tO + 0.5 * sd && t < tO + 1.5 * sd, awake = t > tO + 2.0 * sd;
          frontFig(g, dx0 + 25, dy1, { h: 100, pal: PJ, t, armR: [lerp(10, 28, open), lerp(4, 46, open)], armL: [4, awake ? 30 : 2], headDy: awake ? 0 : 2, tilt: awake ? 0 : Math.round(Math.sin(t * 0.8)),
            face: { eye: awake ? "wide" : "half", brow: awake ? 1 : 0, mouth: yawn ? "yawn" : awake ? "o" : "flat" } });
        }
        const lw = (dx1 - dx0) * (1 - open * 0.84), lx = dx1 - lw + shake;
        const dc = mix(D.moss[2], D.n2, 0.2), dcD = mix(dc, D.n0, 0.3), dcL = mix(dc, D.lamp, 0.25);
        R(g, lx, dy0, lw, dy1 - dy0, open > 0.5 ? dcD : dc);
        if (lw > 14) { for (const [py, ph2] of [[8, 40], [56, 56]]) { R(g, lx + 6, dy0 + py, lw - 12, ph2, dcD); R(g, lx + 6, dy0 + py, lw - 12, 1, mix(dc, D.n0, 0.45)); R(g, lx + 6, dy0 + py + ph2 - 1, lw - 12, 1, dcL); } R(g, lx + 5, dy0 + 62, 3, 4, D.amber[1]); R(g, lx + 5, dy0 + 62, 1, 1, D.amber[0]); R(g, lx + lw / 2 - 6, dy0 + 34, 12, 3, mix(D.amber[2], D.n2, 0.2)); }
        R(g, lx, dy0, 1, dy1 - dy0, dcL);
        // knock marks by the fist
        if (hit) { const mx = dx0 + 6, my = dy0 + 44, s = 4 + kphase * 8; A(g, 0.8, () => { for (const [ax, ay] of [[-1, -1], [-1, 1], [-1, 0], [0, -1.2], [0, 1.2]]) R(g, mx + ax * s, my + ay * s, ax ? 2 : 1, ax ? 1 : 2, D.n0); }); }
        // porch roof, posts, lamp
        R(g, 262, 112, 252, 8, mix(D.cream, D.paperD, 0.25)); R(g, 262, 112, 252, 1, sidL); R(g, 262, 120, 252, 3, mix(D.n3, D.paperD, 0.3));
        poly(g, [[256, 112], [520, 112], [500, 96], [276, 96]], mix(D.rust[2], D.n3, 0.45)); PX.line(g, 276, 96, 500, 96, mix(D.rust[1], D.n4, 0.4));
        A(g, 0.3, () => R(g, 262, 123, 252, 10, D.n0));
        for (const px2 of [270, 500]) { R(g, px2, 123, 6, base - 123, mix(D.cream, D.paperD, 0.25)); R(g, px2, 123, 2, base - 123, sidL); R(g, px2 + 4, 123, 2, base - 123, mix(D.paperD, D.n4, 0.3)); }
        R(g, 406, 190, 6, 10, mix(D.n2, D.amber[2], 0.2)); R(g, 407, 192, 4, 6, mix(D.cream, D.lamp, 0.3)); R(g, 408, 186, 2, 4, D.n3);
        // porch floor + steps
        for (let i = 0; i < 4; i++) { const sy = base + i * 8, sx0 = 262 - i * 8, sw = 252 + i * 16; R(g, sx0, sy, sw, 8, mix(D.n5, D.paperD, 0.3 - i * 0.04)); R(g, sx0, sy, sw, 1, mix(D.n6, D.lamp, 0.35)); R(g, sx0, sy + 7, sw, 1, mix(D.n4, D.n2, 0.3)); }
        // front lawn + path up to the steps
        R(g, -40, base + 30, 720, 60, mix(D.moss[2], D.n3, 0.35)); for (let i = 0; i < 40; i++) R(g, (i * 37) % 700 - 30, base + 34 + (i * 13) % 24, 2, 1, mix(D.moss[1], D.lamp, 0.25));
        poly(g, [[262, base + 32], [514, base + 32], [540, 372], [236, 372]], mix(D.n5, D.paperD, 0.25)); for (let i = 0; i < 4; i++) R(g, 250 - i * 4, base + 40 + i * 9, 280 + i * 8, 1, mix(D.n4, D.paperD, 0.25));
        // milk bottles + newspaper on the porch
        for (let i = 0; i < 2; i++) { R(g, 414 + i * 6, base - 9, 4, 9, D.cream); R(g, 414 + i * 6, base - 10, 4, 1, D.steel[1]); R(g, 414 + i * 6, base - 9, 1, 9, sunC); }
        R(g, 300, base - 4, 16, 4, mix(D.paper, D.n6, 0.2)); R(g, 300, base - 3, 16, 1, mix(D.n5, D.paper, 0.4));
      });
      // long shadows thrown right by the low sun: the professor's falls across the door
      A(g, 0.24, () => { poly(g, [[316, base], [328, base], [362, 196], [348, 190]], D.n0); poly(g, [[276, base], [282, base], [330, 128], [324, 128]], D.n0); });
      // ---- the professor on the porch ----
      const talk = open > 0 ? t - tO : -1;
      const knockArm = inK ? [PX.KF([[0, 100], [0.3, 92], [1, 104]], kphase), PX.KF([[0, 150], [0.3, 136], [1, 162]], kphase)] : null;
      const offer = E((t - tO - 0.3 * sd) / (0.5 * sd), "out");
      const armN = knockArm || (open > 0 ? [lerp(10, 55, offer), lerp(6, 95, offer) + Math.sin(talk * 7) * 8 * offer] : [10, 6]);
      const me = sideFig(g, 316, base, { h: 106, pal: PC, t, hat: true, coatLong: true, armN, armF: [52, 82], lean: inK ? 3 : 2 + offer * 2, light: mix(PC.coat[0], D.lamp, 0.4),
        face: { brow: open > 0 ? 1 : -1, mouth: open > 0 ? (Math.sin(talk * 9) > 0 ? "open" : "flat") : "flat", eye: open > 0 ? "wide" : "open" } });
      const pp = open > 0 && !knockArm && offer > 0.2 ? me.hand : me.handF, shk = offer > 0.2 ? Math.round(Math.sin(t * 17)) : 0;
      R(g, pp[0] - 2, pp[1] - 11 + shk, 11, 14, D.cream); R(g, pp[0] - 2, pp[1] - 11 + shk, 11, 1, sunC); for (let i = 0; i < 3; i++) R(g, pp[0], pp[1] - 8 + i * 3 + shk, 6, 1, mix(D.n5, D.paper, 0.4));
      // ---- foreground: hedge + picket fence with an open gate ----
      PX.par(g, c, 1.15, () => {
        for (let i = 0; i < 9; i++) ell(g, 20 + i * 24 + Math.sin(t * 1.1 + i) * 0.6, 318 - (i % 2) * 5, 18, 14, i % 2 ? mix(D.moss[2], D.n1, 0.3) : mix(D.moss[2], D.n2, 0.15));
        for (let i = 0; i < 12; i++) R(g, 8 + i * 18, 306 - (i % 2) * 4, 3, 2, mix(D.moss[1], D.lamp, 0.35));
        const fc = mix(D.cream, D.paperD, 0.35), fd = mix(fc, D.n3, 0.4);
        R(g, -40, 334, 290, 3, fd); R(g, 450, 334, 230, 3, fd);
        for (let x = -36; x < 250; x += 13) { R(g, x, 322, 7, 40, fc); poly(g, [[x, 322], [x + 3.5, 317], [x + 7, 322]], fc); R(g, x + 5, 322, 2, 40, fd); }
        for (let x = 454; x < 660; x += 13) { R(g, x, 322, 7, 40, fc); poly(g, [[x, 322], [x + 3.5, 317], [x + 7, 322]], fc); R(g, x + 5, 322, 2, 40, fd); }
        A(g, 0.25, () => { for (let x = -36; x < 250; x += 13) poly(g, [[x + 7, 352], [x + 12, 352], [x + 40, 360], [x + 30, 360]], D.n0); });
        R(g, -40, 352, 720, 10, mix(D.n4, D.paperD, 0.3));
      });
      // birds on the wire in the sky gap
      PX.line(g, -10, 80, 214, 70, mix(D.n3, D.steel[2], 0.3));
      for (let i = 0; i < 3; i++) { const bx2 = 92 + i * 12, by2 = 80 - (bx2 + 10) * 10 / 224; R(g, bx2, by2 - 3, 5, 3, D.n2); R(g, bx2 + (PX.blink(t + i * 0.7, 1.9, 0.15) ? 3 : 4), by2 - 5, 2, 2, D.n2); }
      PX.particles(g, 12, 22, t, [0, 90, 340, 200], { vy: -1, vx: 2, col: D.lamp, a: 0.5, tw: 1.2 });
      PX.vignette(g, 0.5);
    };
  };

  // ---------- modern classroom kit (at_board, verdict) ----------
  const MODS = (() => { const r = PX.rnd(2024), coats = [tri(mix(D.steel[2], D.n3, 0.2)), tri(mix(D.moss[2], D.n3, 0.25)), tri(mix(D.rust[2], D.n3, 0.35)), tri(mix(D.paperD, D.n4, 0.3)), tri(mix(D.n4, D.n3, 0.3)), tri(mix(D.plum[2], D.n3, 0.35)), tri(mix(D.amber[2], D.n3, 0.4))];
    const hairs = [HAIR.black, HAIR.brown, HAIR.blond, HAIR.auburn, HAIR.black], skins = [SKINS.fair, SKINS.warm, SKINS.med, SKINS.deep];
    return [...Array(12)].map(() => ({ coat: coats[Math.floor(r() * coats.length)], skin: skins[Math.floor(r() * 4)], hair: hairs[Math.floor(r() * hairs.length)], hairStyle: ["short", "bun", "curly", "short"][Math.floor(r() * 4)], shirt: D.n3 })); })();
  const MARK = mix(D.steel[2], D.n1, 0.45);
  const WB = mix(mix(D.cream, D.paper, 0.5), D.steel[0], 0.22);
  const BOARD_PROB = mathBlock(512, 170, 1.5, 2, 20);
  const TRY = [{ y: 0, strokes: mathLine(77, 92, 1.5) }];

  // ======================= at_board =======================
  // a modern classroom: the learner at the whiteboard, marker in hand, the class watching from their desks, the
  // teacher by the windows. The learner writes under the problem; at o.blank 3.0 the marker freezes and a thought
  // bubble fills with static. No numbers anywhere.
  K.at_board = (o) => {
    const TCH = { skin: SKINS.warm, hair: HAIR.brown, coat: tri(mix(D.rose[2], D.n3, 0.35), 0.25, 0.4), shirt: D.cream, pants: tri(mix(D.n3, D.steel[2], 0.3)), shoe: D.n1, hairStyle: "bun" };
    return (g, t, d, c) => {
      const T = tm(o, d, 8.0), tB = T("blank", 3.0), sd = d / 8;
      const blank = t >= tB, bp = E((t - tB) / (0.5 * sd), "out");
      // ---- wall, whiteboard, clock, windows ----
      PX.par(g, c, 0.5, () => {
        const wall = mix(D.paperD, D.teal[2], 0.16);
        PX.vgrad(g, -40, -40, 720, 340, mix(wall, D.cream, 0.18), mix(wall, D.n3, 0.25), 6);
        R(g, -40, 262, 720, 60, mix(wall, D.n2, 0.35)); R(g, -40, 262, 720, 2, mix(wall, D.cream, 0.2));
        // ceiling light panels
        R(g, -40, -40, 720, 52, mix(D.n6, D.paperD, 0.3)); for (const lx of [40, 250, 460]) { R(g, lx, 6, 140, 6, mix(D.cream, D.steel[0], 0.3)); R(g, lx, 12, 140, 1, D.n5); } R(g, -40, 12, 720, 1, D.n5);
        // whiteboard
        // cork board with pinned sheets + a tidy row of shape cards (no text)
        R(g, 60, 52, 120, 70, mix(WOOD[2], D.n3, 0.2)); R(g, 63, 55, 114, 64, mix(D.paperD, D.amber[2], 0.35));
        for (let i = 0; i < 6; i++) { const px2 = 68 + i * 18 + hash(i, 2) * 3, py2 = 60 + (i % 2) * 26 + hash(i, 3) * 4; R(g, px2, py2, 14, 18, i % 3 ? D.paper : mix(D.paper, D.teal[0], 0.3)); for (let l = 0; l < 3; l++) R(g, px2 + 2, py2 + 4 + l * 4, 8 + hash(i, l) * 3, 1, mix(D.n5, D.paper, 0.4)); R(g, px2 + 6, py2 + 1, 2, 2, [D.rust[1], D.teal[1], D.amber[1]][i % 3]); }
        for (let i = 0; i < 7; i++) { const sx2 = 210 + i * 30, cc = [D.moss[1], D.steel[1], D.amber[1], D.rose[1]][i % 4]; R(g, sx2, 70, 22, 22, mix(D.paper, cc, 0.4)); if (i % 2) PX.circle(g, sx2 + 11, 81, 5, mix(D.n2, cc, 0.5)); else poly(g, [[sx2 + 4, 88], [sx2 + 11, 74], [sx2 + 18, 88]], mix(D.n2, cc, 0.5)); }
        const bx = 52, by = 136, bw = 370, bh = 108;
        R(g, bx - 4, by - 4, bw + 8, bh + 8, D.n6); R(g, bx - 4, by - 4, bw + 8, 1, D.n7); R(g, bx - 3, by + bh + 3, bw + 6, 1, D.n4);
        PX.vgrad(g, bx, by, bw, bh, mix(WB, D.cream, 0.4), WB, 5);
        A(g, 0.5, () => { poly(g, [[bx + 220, by], [bx + 260, by], [bx + 200, by + bh], [bx + 160, by + bh]], D.cream); });   // window glare
        for (let i = 0; i < 6; i++) A(g, 0.06, () => R(g, bx + 30 + hash(i, 3) * 300, by + 20 + hash(i, 4) * 100, 30 + hash(i, 5) * 30, 2, D.n6));   // ghost marks
        R(g, bx, by + bh + 4, bw, 4, D.n6); R(g, bx, by + bh + 4, bw, 1, D.n7);
        for (const [mx, mc] of [[90, mix(D.rust[1], D.n3, 0.2)], [104, mix(D.teal[1], D.n3, 0.2)], [118, MARK]]) { R(g, mx, by + bh + 1, 10, 3, mc); R(g, mx, by + bh + 1, 3, 3, D.n2); }
        // the problem (two lines, marker)
        drawBlock(g, BOARD_PROB, bx + 22, by + 20, 1, MARK, { w: 1 });
        // clock (ticks only)
        PX.circle(g, 450, 40, 11, D.n5); PX.circle(g, 450, 40, 10, mix(D.cream, D.paper, 0.3)); for (let i = 0; i < 12; i++) { const an = (i / 12) * TAU; R(g, Math.round(450 + Math.cos(an) * 8), Math.round(40 + Math.sin(an) * 8), 1, 1, D.n3); }
        const ma = -Math.PI / 2 + t * 0.05; PX.line(g, 450, 40, 450 + Math.cos(ma) * 7, 40 + Math.sin(ma) * 7, D.n1); PX.line(g, 450, 40, 450 + Math.cos(2.3) * 5, 40 + Math.sin(2.3) * 5, D.n1);
        PX.line(g, 450, 40, 450 + Math.cos(t * 6.28 / 60 * 6) * 8, 40 + Math.sin(t * 6.28 / 60 * 6) * 8, D.rust[1]);
        // windows (right), daylight, blinds up, trees outside
        R(g, 486, 50, 170, 190, mix(D.n6, D.cream, 0.3));
        PX.vgrad(g, 492, 56, 160, 178, mix(D.steel[0], D.cream, 0.4), mix(D.cream, D.moss[0], 0.35), 5);
        A(g, 0.5, () => { ell(g, 530, 190, 40, 34, mix(D.moss[1], D.cream, 0.35)); ell(g, 610, 170, 46, 40, mix(D.moss[1], D.cream, 0.45)); });
        R(g, 568, 56, 4, 178, mix(D.n6, D.cream, 0.3)); R(g, 492, 140, 160, 4, mix(D.n6, D.cream, 0.3));
        R(g, 492, 56, 160, 14, mix(D.paper, D.n6, 0.2)); for (let i = 0; i < 3; i++) R(g, 492, 58 + i * 4, 160, 1, mix(D.paperD, D.n5, 0.3));
        R(g, 480, 238, 182, 6, mix(D.n6, D.cream, 0.25)); R(g, 500, 226, 12, 12, mix(D.rust[2], D.paperD, 0.3)); ell(g, 506, 220, 9, 8, mix(D.moss[2], D.n3, 0.2));
      });
      // floor
      R(g, -40, 300, 720, 70, mix(D.n4, D.paperD, 0.3)); for (let i = 0; i < 8; i++) R(g, -40 + i * 96, 300, 1, 70, mix(D.n4, D.n3, 0.4)); R(g, -40, 330, 720, 1, mix(D.n4, D.n3, 0.4));
      A(g, 0.1, () => poly(g, [[492, 300], [652, 300], [560, 362], [380, 362]], D.cream));
      // ---- the teacher by the window, arms crossed ----
      PX.par(g, c, 0.8, () => { shadow(g, 594, 298, 14, 3, 0.3); frontFig(g, 594, 298, { h: 98, pal: TCH, t, cross: true, tilt: blank ? -1 : 0, face: { look: -1, brow: blank ? 2 : 0, mouth: "flat" } }); });
      // ---- the learner at the board (faces right, writes left to right under the problem) ----
      const by = 136, row = by + 76, tx0 = 318;
      const wp = clamp((Math.min(t, tB) - 0.4 * sd) / (2.6 * sd), 0, 1) * (tB > 0.4 * sd ? 1 : 0);
      const tip = drawBlock(g, TRY, tx0, row, wp * 0.6, MARK, { w: 1 }) || [tx0, row + 4];
      const lx = 292;
      shadow(g, lx, 300, 16, 3, 0.3);
      const fr = blank ? Math.round(Math.sin(t * 30) * 0.4) : 0;
      sideFig(g, lx, 300, { h: 104, pal: LEARN, t, reachN: [tip[0] - 2 + fr, tip[1] + 3], armF: [blank ? -6 : -2, blank ? -2 : 8], lean: 2, headDx: blank ? 1 : 0, headDy: blank ? 1 : 0,
        face: { eye: blank ? "wide" : "open", brow: blank ? 2 : -1, mouth: blank ? "frown" : "flat" } });
      // marker in hand
      R(g, tip[0] - 4, tip[1] - 1, 5, 2, MARK); R(g, tip[0] - 7, tip[1] - 1, 3, 2, D.n6);
      // sweat drop at the temple
      if (blank && t > tB + 0.8 * sd) { const k2 = frac((t - tB) * 0.35); A(g, 1 - k2, () => { R(g, lx + 9, 204 + k2 * 10, 2, 3, mix(D.teal[0], D.cream, 0.5)); R(g, lx + 10, 203 + k2 * 10, 1, 1, D.cream); }); }
      // thought bubble filling with static (pops in by growing its puffs, stays crisp)
      if (blank) {
        const cx = 362, cy = 122, s = Math.max(0.05, bp);
        const puffs = [[0, 0, 30, 22], [-24, 6, 16, 13], [24, 4, 18, 15], [-10, -16, 16, 12], [12, -15, 17, 12]].map(([dx, dy, rx, ry]) => [dx * s, dy * s, rx * s, ry * s]);
        for (const [tx2, ty2, r2] of [[312, 190, 2], [320, 177, 3], [331, 161, 4]]) { const q = clamp(bp * 3 - (r2 - 2), 0, 1); if (q > 0) { ell(g, tx2, ty2, r2 + 1, r2, D.n3); ell(g, tx2, ty2, r2, r2 - 1, D.cream); } }
        for (const [dx, dy, rx, ry] of puffs) ell(g, cx + dx, cy + dy, rx + 2, ry + 2, D.n3);
        for (const [dx, dy, rx, ry] of puffs) ell(g, cx + dx, cy + dy, rx, ry, D.cream);
        const fN = Math.floor(t * 14);
        for (let yy = -22; yy < 20; yy += 2) for (let xx = -36; xx < 36; xx += 2) {
          const inside = puffs.some(([dx, dy, rx, ry]) => rx > 4 && ((xx - dx) / (rx - 3)) ** 2 + ((yy - dy) / (ry - 3)) ** 2 < 1); if (!inside) continue;
          const hsh = hash(xx * 7 + fN * 13, yy * 3 + fN); R(g, cx + xx, cy + yy, 2, 2, hsh < 0.33 ? D.n2 : hsh < 0.66 ? D.n5 : D.n7);
        }
        if (bp >= 1) for (let i = 0; i < 2; i++) { const ly = cy - 16 + frac(t * 0.9 + i * 0.5) * 32; A(g, 0.45, () => R(g, cx - 28, ly, 56, 1, D.cream)); }
      }
      // ---- the class, seen from behind (foreground) ----
      PX.par(g, c, 1.12, () => {
        const desk = mix(D.paper, WOOD[1], 0.45), deskD = mix(desk, D.n2, 0.4);
        const rowA = [[70, 0], [182, 1], [372, 2], [520, 3]], rowB = [[20, 4], [140, 5], [262, 6], [384, 7], [610, 8]];
        // second row (smaller, further back)
        for (const [x2, i] of rowA) { const turn = blank && i === 1 ? E((t - tB - 0.6 * sd) / 0.3, "out") * 0.8 : 0; backBust(g, x2, 286, 1.25, { pal: MODS[i], t, ph: i, turn: turn || -0.15 * (x2 > 400 ? -1 : 1) * 0 }); R(g, x2 - 26, 316, 52, 4, desk); }
        R(g, -40, 314, 720, 5, desk); R(g, -40, 314, 720, 1, mix(desk, D.cream, 0.3)); R(g, -40, 319, 720, 3, deskD);
        // front row (big, cut by the frame)
        for (const [x2, i] of rowB) { const turn = blank && i === 6 ? -E((t - tB - 1.0 * sd) / 0.3, "out") * 0.8 : 0; backBust(g, x2, 330, 1.7, { pal: MODS[i], t, ph: i * 1.3, turn }); }
      });
      PX.vignette(g, 0.45);
    };
  };

  // ======================= verdict =======================
  // close on the learner at a desk: the teacher's hand slides a test paper onto the desk, a red circled "D" on it;
  // the teacher behind, out of focus, disappointed. At o.words 3.0 a pencil writes "I'M JUST NOT A MATH PERSON"
  // on the desk top. o.paper 0.5 the paper arrives. (Close-up: the learner is drawn larger than the wide shots.)
  K.verdict = (o) => {
    const TCH = { skin: SKINS.warm, hair: HAIR.brown, coat: tri(mix(D.rose[2], D.n3, 0.35), 0.25, 0.4), shirt: D.cream, pants: tri(mix(D.n3, D.steel[2], 0.3)), shoe: D.n1, hairStyle: "bun", glasses: true };
    const L1 = wordStrokes("I'M JUST NOT", 2.5, 3), L2 = wordStrokes("A MATH PERSON", 2.5, 8), GD = wordStrokes("D", 3.0, 4);
    const ring = []; for (let i = 0; i <= 28; i++) { const a = -0.5 + (i / 25) * TAU; ring.push([Math.cos(a) * (12 + (i > 22 ? 2 : 0)), Math.sin(a) * 11 - (i > 22 ? 1 : 0)]); }
    const LEN1 = L1.strokes.reduce((a, s) => a + strokeLen(s), 0), LEN2 = L2.strokes.reduce((a, s) => a + strokeLen(s), 0);
    return (g, t, d, c) => {
      const T = tm(o, d, 6.0), tP = T("paper", 0.5), tW = T("words", 3.0), sd = d / 6;
      const slide = E((t - tP) / (0.7 * sd), "out"), handOut = E((t - tP - 0.85 * sd) / (0.5 * sd), "io"), landed = t >= tP + 0.7 * sd;
      const sink = E((t - tP - 0.8 * sd) / (1.4 * sd), "io");
      const wall = mix(D.paperD, D.teal[2], 0.16);
      // ---- background classroom (soft, hazy) ----
      PX.par(g, c, 0.45, () => {
        PX.vgrad(g, -40, -40, 720, 320, mix(wall, D.cream, 0.15), mix(wall, D.n3, 0.2), 6);
        R(g, -40, 12, 720, 4, mix(wall, D.n2, 0.25));
        // window left with daylight and a tree
        R(g, -10, 40, 150, 180, mix(D.n6, D.cream, 0.3)); PX.vgrad(g, -4, 46, 138, 168, mix(D.steel[0], D.cream, 0.45), mix(D.cream, D.moss[0], 0.3), 5); R(g, 64, 46, 4, 168, mix(D.n6, D.cream, 0.3)); R(g, -4, 128, 138, 4, mix(D.n6, D.cream, 0.3));
        A(g, 0.45, () => { ell(g, 40, 170, 44, 34, mix(D.moss[1], D.cream, 0.4)); ell(g, 110, 190, 30, 24, mix(D.moss[1], D.cream, 0.5)); });
        // bulletin board with pinned sheets
        R(g, 176, 58, 110, 70, mix(WOOD[2], D.n3, 0.2)); R(g, 179, 61, 104, 64, mix(D.paperD, D.amber[2], 0.35));
        for (let i = 0; i < 5; i++) { const px2 = 184 + i * 20, py2 = 66 + (i % 2) * 24; R(g, px2, py2, 15, 20, D.paper); for (let l = 0; l < 3; l++) R(g, px2 + 2, py2 + 5 + l * 4, 9, 1, mix(D.n5, D.paper, 0.4)); R(g, px2 + 6, py2 + 1, 2, 2, [D.rust[1], D.teal[1], D.amber[1]][i % 3]); }
        // whiteboard edge right + door
        R(g, 540, 50, 140, 100, D.n6); R(g, 544, 54, 136, 92, mix(WB, D.cream, 0.2)); for (let i = 0; i < 3; i++) R(g, 556, 72 + i * 18, 60 + i * 10, 2, mix(MARK, WB, 0.5));
        R(g, 336, 40, 60, 170, mix(D.n5, D.paperD, 0.3)); R(g, 340, 44, 52, 166, mix(WOOD[1], D.n4, 0.3)); R(g, 352, 60, 28, 40, mix(D.steel[0], D.cream, 0.3)); R(g, 384, 130, 4, 8, D.n6);
        R(g, -40, 210, 720, 100, mix(wall, D.n2, 0.3)); R(g, -40, 210, 720, 2, mix(wall, D.cream, 0.15));
        // other desks + classmates, further back
        backBust(g, 92, 206, 1.15, { pal: MODS[3], t, ph: 2 }); R(g, 56, 234, 76, 5, mix(D.paper, WOOD[1], 0.45));
        backBust(g, 176, 210, 1.15, { pal: MODS[5], t, ph: 4, write: true }); R(g, 140, 238, 76, 5, mix(D.paper, WOOD[1], 0.45));
        // the teacher, arms crossed, slow head shake once the paper is down
        frontFig(g, 492, 282, { h: 130, pal: TCH, t, cross: true, tilt: landed ? Math.round(Math.sin((t - tP) * 2.4) * 1.5) : 0, headDy: landed ? 1 : 0, face: { brow: 2, mouth: "frown", eye: landed ? "down" : "open" } });
        A(g, 0.3, () => R(g, -40, -40, 720, 400, mix(D.paperD, D.teal[2], 0.25)));   // depth haze
      });
      A(g, 0.1, () => poly(g, [[0, 40], [140, 40], [430, 372], [110, 372]], D.lamp));   // window light across
      // ---- the learner (close-up) ----
      const [cl, cb, cd] = LEARN.coat, [sl, sb, sd2] = LEARN.skin;
      const Lr = frontFig(g, 300, 400, { h: 176, pal: LEARN, t, hipY: 238, noArms: true, noLegs: true, shrug: -2.5 * sink, headDy: 4 * sink,
        face: { eye: landed ? "down" : "open", lookY: landed ? 0 : 0.6, brow: landed ? 2 : 0, mouth: landed ? (t > tW ? "frown" : "wavy") : "flat" } });
      // desk top in perspective
      const desk = mix(D.paper, WOOD[1], 0.4), deskL = mix(desk, D.cream, 0.25), deskD = mix(desk, D.n2, 0.35);
      poly(g, [[118, 216], [482, 216], [660, 372], [-20, 372]], desk); R(g, 118, 216, 364, 1, deskL); R(g, 118, 217, 364, 1, deskD);
      for (let i = 0; i < 9; i++) PX.line(g, 150 + i * 40, 219, 40 + i * 70, 372, mix(desk, deskD, 0.16));   // grain
      A(g, 0.1, () => poly(g, [[118, 216], [280, 216], [190, 372], [-20, 372]], D.cream));
      // forearms resting on the desk either side of the paper
      for (const s of [-1, 1]) {
        const shx = 300 + s * 20, shy = Lr.shY + 6, ex = 300 + s * 50, ey = 224, hx2 = 300 + s * 62, hy2 = 258, ac = s < 0 ? cb : cd;
        seg(g, shx, shy, ex, ey, 12, ac); ell(g, ex, ey, 6, 6, ac);
        seg(g, ex, ey, hx2, hy2, 11, ac); seg(g, ex - s * 4, ey - 4, hx2 - s * 4, hy2 - 4, 1, s < 0 ? cl : cb); seg(g, ex + s * 5, ey + 4, hx2 + s * 5, hy2 + 3, 1, mix(cd, D.n0, 0.3));
        R(g, hx2 - 6, hy2 - 2, 12, 3, mix(cb, cl, 0.5));
        A(g, 0.3, () => ell(g, hx2 + s * 3, hy2 + 9, 8, 3, D.n0));
        ell(g, hx2 - s * 1, hy2 + 5, 7, 5, s < 0 ? sb : sd2); R(g, hx2 - s * 1 - 3, hy2 + 1, 5, 1, sl); R(g, hx2 - s * 6, hy2 + 4, 2, 4, s < 0 ? sb : sd2);
      }
      // ---- the test paper sliding in from the right (teacher's hand), red circled D ----
      if (t >= tP) {
        const px0 = lerp(660, 256, slide), py0 = 236;
        poly(g, [[px0 + 4, py0 - 14], [px0 + 94, py0 - 14], [px0 + 101, py0 + 36], [px0 - 3, py0 + 36]], mix(D.n0, desk, 0.6));
        poly(g, [[px0, py0 - 18], [px0 + 90, py0 - 18], [px0 + 97, py0 + 32], [px0 - 7, py0 + 32]], D.cream);
        R(g, px0 + 4, py0 - 13, 34, 1, mix(D.n4, D.cream, 0.3)); R(g, px0 + 4, py0 - 12, 34, 1, mix(D.n6, D.cream, 0.5));
        for (let i = 0; i < 6; i++) { const ly = py0 - 5 + i * 6, ww = 58 + hash(i, 2) * 22; for (let x2 = 0; x2 < ww; x2 += 3) if (hash(x2, i) > 0.25) R(g, px0 + 2 - i * 0.7 + x2, ly, 2, 1, mix(D.n5, D.cream, 0.35)); if (i % 2) R(g, px0 - 2 - i * 0.7, ly, 2, 1, D.rust[1]); }
        const gx = px0 + 70, gy = py0 - 7;
        drawStrokes(g, GD.strokes, gx - 6, gy - 9, 1, D.rust[1], { w: 2 }); drawStrokes(g, [ring], gx + 1, gy, 1, D.rust[1], { w: 1 });
        if (handOut < 1) { // the teacher's hand and sleeve, coming in from the lower right
          const hx2 = px0 + 88 + handOut * 180, hy2 = py0 + 10;
          seg(g, hx2 + 10, hy2 + 6, hx2 + 130, hy2 + 40, 17, TCH.coat[1]); seg(g, hx2 + 12, hy2 - 1, hx2 + 130, hy2 + 32, 1, TCH.coat[0]); seg(g, hx2 + 12, hy2 + 13, hx2 + 130, hy2 + 48, 2, TCH.coat[2]);
          R(g, hx2 + 2, hy2 - 2, 9, 12, D.cream); ell(g, hx2 - 2, hy2 + 2, 8, 6, TCH.skin[1]); R(g, hx2 - 10, hy2, 7, 3, TCH.skin[1]); R(g, hx2 - 9, hy2, 6, 1, TCH.skin[0]);
        }
      }
      // ---- the words, written in pencil on the desk ----
      if (t >= tW) {
        const wp = clamp((t - tW) / (2.0 * sd), 0, 1), split = LEN1 / (LEN1 + LEN2), graph = mix(D.n2, D.n4, 0.45), sheen = mix(D.n5, D.n6, 0.5);
        const p1 = clamp(wp / split, 0, 1), p2 = clamp((wp - split) / (1 - split), 0, 1);
        const x1 = 300 - L1.w / 2, x2 = 300 - L2.w / 2, y1 = 274, y2 = 294;
        A(g, 0.45, () => { drawStrokes(g, L1.strokes, x1 + 1, y1, p1, graph, { gap: 0.3 }); if (p2 > 0) drawStrokes(g, L2.strokes, x2 + 1, y2, p2, graph, { gap: 0.3 }); });
        let tip = drawStrokes(g, L1.strokes, x1, y1, p1, graph, { gap: 0.06 });
        if (p2 > 0) tip = drawStrokes(g, L2.strokes, x2, y2, p2, graph, { gap: 0.06 }) || tip;
        A(g, 0.3, () => { drawStrokes(g, L1.strokes, x1, y1 - 1, p1, sheen, { gap: 0.6 }); if (p2 > 0) drawStrokes(g, L2.strokes, x2, y2 - 1, p2, sheen, { gap: 0.6 }); });
        if (tip && wp < 1) { // the pencil itself
          const [px2, py2] = tip; A(g, 0.3, () => seg(g, px2 + 6, py2 + 2, px2 + 30, py2 - 14, 4, D.n0));
          seg(g, px2 + 2, py2 - 2, px2 + 24, py2 - 24, 4, D.amber[1]); seg(g, px2 + 3, py2 - 3, px2 + 24, py2 - 24, 1, D.amber[0]);
          seg(g, px2 + 22, py2 - 22, px2 + 27, py2 - 27, 4, mix(D.rose[1], D.paperD, 0.3)); R(g, px2 + 21, py2 - 23, 3, 3, D.n6);
          poly(g, [[px2, py2], [px2 + 4, py2 - 1], [px2 + 1, py2 - 4]], mix(D.paper, WOOD[1], 0.3)); R(g, px2, py2, 1, 1, D.n1);
        }
      }
      PX.particles(g, 6, 20, t, [40, 40, 300, 240], { vy: -1.2, vx: 1.4, col: D.lamp, a: 0.4, tw: 1.1 });
      // foreground: the out-of-focus back of the chair in front, lower left
      PX.par(g, c, 1.22, () => { const ch = mix(D.n2, D.steel[2], 0.25); poly(g, [[-40, 318], [96, 312], [104, 372], [-40, 372]], ch); R(g, -40, 314, 136, 2, mix(ch, D.n6, 0.3)); A(g, 0.5, () => R(g, 60, 320, 30, 40, mix(ch, D.n0, 0.3))); });
      PX.vignette(g, 0.5);
    };
  };

  // ======================= schedules =======================
  // the ending: a calm airport morning (departures board with letters only, planes at the gates, travellers) that
  // cross-fades to an orderly factory floor (conveyor lines, boxes moving in step, workers at stations).
  // o.planes 0.5 the board flips and a plane starts to taxi; o.factory 3.0 the cross-fade to the factory.
  K.schedules = (o) => {
    const ROWS = [["LONDON", "A", "ON TIME"], ["PARIS", "C", "BOARDING"], ["CHICAGO", "B", "ON TIME"], ["BOSTON", "D", "ON TIME"], ["DENVER", "F", "ON TIME"], ["SEATTLE", "E", "ON TIME"]];
    const PREV = [["ROME", "F", "BOARDING"], ...ROWS.slice(0, 5).map(([a, b, c2], i) => [a, b, i === 0 ? "ON TIME" : c2])];   // board before the flip (scrolls up one row)
    const ABC = "ABCDEFGHIJKLMNOPRSTUVWY";
    let buf = null;
    const PASS = [{ skin: SKINS.fair, hair: HAIR.brown, coat: tri(mix(D.steel[2], D.n2, 0.4)), pants: tri(D.n2), shoe: D.n0, shirt: D.n3, hairStyle: "short" }, { skin: SKINS.deep, hair: HAIR.black, coat: tri(mix(D.rust[2], D.n2, 0.5)), pants: tri(D.n3), shoe: D.n0, shirt: D.n3, hairStyle: "short" }, { skin: SKINS.med, hair: HAIR.black, coat: tri(mix(D.moss[2], D.n2, 0.45)), pants: tri(D.n2), shoe: D.n0, shirt: D.n3, hairStyle: "curly" }];
    const plane = (g, x, y, L, dir, liv) => { // side-view airliner, nose towards dir
      g.save(); g.translate(Math.round(x), 0); if (dir < 0) g.scale(-1, 1);
      const body = mix(D.cream, D.n6, 0.25), bodyD = mix(body, D.n4, 0.4), h = L * 0.11;
      R(g, -L / 2, y - h, L * 0.9, h, body); ell(g, L * 0.4, y - h / 2, L * 0.1, h / 2, body);   // fuselage + nose
      poly(g, [[-L / 2, y - h], [-L / 2 - L * 0.04, y - h - L * 0.2], [-L / 2 + L * 0.1, y - h - L * 0.2], [-L / 2 + L * 0.22, y - h]], body);   // fin
      poly(g, [[-L / 2 - L * 0.04, y - h - L * 0.2], [-L / 2 + L * 0.1, y - h - L * 0.2], [-L / 2 + L * 0.12, y - h - L * 0.12], [-L / 2 - L * 0.02, y - h - L * 0.12]], liv);
      R(g, -L / 2, y - h * 0.45, L * 0.95, Math.max(1, h * 0.14), liv);
      R(g, -L / 2, y - 1, L * 0.92, 1, bodyD);
      for (let i = 0; i < 18; i++) R(g, -L * 0.38 + i * L * 0.04, y - h * 0.72, 1, 1, D.n3);
      R(g, L * 0.42, y - h * 0.75, Math.max(2, L * 0.03), 2, D.n3);
      poly(g, [[-L * 0.08, y - h * 0.3], [L * 0.12, y - h * 0.3], [-L * 0.18, y + h * 0.3], [-L * 0.24, y + h * 0.3]], bodyD);   // wing
      R(g, -L * 0.04, y - h * 0.1, L * 0.12, h * 0.5, mix(D.n5, D.paperD, 0.2));   // engine
      R(g, -L * 0.3, y, 2, 4, D.n2); R(g, L * 0.32, y, 2, 4, D.n2); R(g, -L * 0.31, y + 3, 4, 2, D.n1); R(g, L * 0.31, y + 3, 4, 2, D.n1);
      g.restore();
    };
    const airport = (g, t, c, tPl) => {
      // outside: morning apron
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 250, mix(D.steel[0], D.steel[1], 0.3), mix(D.lamp, D.cream, 0.5), 8);
        for (let i = 0; i < 4; i++) A(g, 0.35, () => ell(g, frac(hash(i, 3) + t * 0.005) * 760 - 60, 50 + i * 20, 40, 4, D.cream));
        R(g, -40, 190, 720, 60, mix(D.n5, D.paperD, 0.35)); R(g, -40, 190, 720, 1, mix(D.n6, D.lamp, 0.4)); for (let i = 0; i < 10; i++) R(g, -30 + i * 80, 206, 30, 1, mix(D.amber[1], D.n5, 0.4));
        R(g, 580, 120, 10, 70, mix(D.n4, D.steel[1], 0.3)); R(g, 572, 112, 26, 10, mix(D.n3, D.steel[1], 0.3)); R(g, 574, 114, 22, 4, mix(D.steel[0], D.lamp, 0.3));   // tower
        // a far plane taxiing slowly, a near plane at the gate pushing back
        const tx = 700 - Math.max(0, t - tPl) * 38; plane(g, tx, 196, 90, -1, mix(D.steel[2], D.n4, 0.2));
        plane(g, 170 - Math.max(0, t - tPl - 1.2) * 4, 236, 210, 1, mix(D.teal[2], D.n4, 0.2));
        plane(g, 470, 238, 180, -1, mix(D.rust[2], D.n4, 0.25));
        // jet bridges from the terminal
        for (const [jx, jw] of [[230, 70], [380, 60]]) { R(g, jx, 196, jw, 16, mix(D.n5, D.paperD, 0.3)); R(g, jx, 196, jw, 2, mix(D.n6, D.lamp, 0.3)); R(g, jx + jw / 2 - 2, 212, 4, 34, D.n4); }
        // baggage tug
        const bgx = 300 + Math.sin(t * 0.3) * 40; R(g, bgx, 240, 14, 6, mix(D.amber[1], D.n4, 0.3)); R(g, bgx + 16, 242, 12, 4, D.n5); R(g, bgx + 30, 242, 12, 4, D.n5);
      });
      // inside: glass wall mullions, ceiling, floor
      PX.par(g, c, 0.7, () => {
        R(g, -40, -40, 720, 76, mix(D.n2, D.steel[2], 0.25)); for (let i = 0; i < 8; i++) R(g, -40 + i * 100, 18, 70, 3, mix(D.cream, D.lamp, 0.4)); R(g, -40, 36, 720, 3, D.n3);
        for (let x = -20; x < 680; x += 110) { R(g, x, 36, 6, 220, mix(D.n3, D.steel[2], 0.3)); R(g, x, 36, 1, 220, mix(D.n5, D.lamp, 0.3)); }
        R(g, -40, 250, 720, 8, mix(D.n3, D.steel[2], 0.3));
        R(g, -40, 258, 720, 110, mix(D.n4, D.paperD, 0.3));
        A(g, 0.12, () => { for (let x = -20; x < 680; x += 110) poly(g, [[x + 6, 258], [x + 104, 258], [x + 150, 360], [x + 30, 360]], D.cream); });   // window reflections
        for (let i = 0; i < 5; i++) R(g, -40, 270 + i * 18, 720, 1, mix(D.n4, D.n2, 0.25));
        // rows of seats
        for (let i = 0; i < 9; i++) { const sx = 360 + i * 30; R(g, sx, 286, 24, 12, mix(D.steel[2], D.n2, 0.3)); R(g, sx, 286, 24, 2, mix(D.steel[1], D.n3, 0.3)); R(g, sx + 2, 298, 20, 4, mix(D.steel[2], D.n1, 0.4)); R(g, sx + 11, 302, 2, 10, D.n3); }
      });
      // departures board (letters only)
      const bx = 84, by = 70, bw = 268, bh = 150;
      R(g, bx + bw / 2 - 30, 36, 2, by - 36, D.n4); R(g, bx + bw / 2 + 30, 36, 2, by - 36, D.n4);
      R(g, bx - 4, by - 4, bw + 8, bh + 8, D.n3); R(g, bx, by, bw, bh, D.n1); R(g, bx, by, bw, 18, mix(D.n2, D.steel[2], 0.3));
      PX.text(g, "DEPARTURES", bx + 8, by + 5, { size: 8, col: D.cream });
      R(g, bx + bw - 30, by + 5, 18, 8, D.n0); poly(g, [[bx + bw - 28, by + 11], [bx + bw - 16, by + 7], [bx + bw - 14, by + 9], [bx + bw - 26, by + 13]], D.amber[1]);
      ROWS.forEach(([dst0, gate0, st0], ri) => {
        const pre = t < tPl + 0.15 + ri * 0.12, [dst, gate, st] = pre ? PREV[ri] : [dst0, gate0, st0];
        const ry = by + 24 + ri * 20, settle = tPl + 0.15 + ri * 0.12;
        const flip = (s, seed, len) => { if (t >= settle + 0.5) return s; return [...s.padEnd(len)].map((ch, i) => (t < settle - 9 ? ch : ABC[Math.floor(hash(i + seed, Math.floor(t * 18)) * ABC.length)])).join(""); };
        const cells = (s, x0, n, col) => { for (let i = 0; i < n; i++) { R(g, x0 + i * 9, ry, 8, 13, D.n2); R(g, x0 + i * 9, ry + 6, 8, 1, D.n0); PX.text(g, s[i] || " ", x0 + i * 9 + 1, ry + 3, { size: 8, col }); } };
        const flipping = t >= settle - 0.01 && t < settle + 0.5;
        cells(flipping ? flip(dst, 1 + ri, 8) : dst.padEnd(8), bx + 8, 8, D.cream);
        cells(flipping ? flip(gate, 7 + ri, 1) : gate, bx + 96, 1, D.amber[0]);
        cells(flipping ? flip(st, 13 + ri, 8) : st.padEnd(8), bx + 116, 8, st === "BOARDING" ? D.amber[1] : D.moss[0]);
      });
      // travellers walking with rolling cases (backlit, slow)
      for (let i = 0; i < 4; i++) {
        const dir = i % 2 ? -1 : 1, sp = 14 + i * 3, x0 = frac(hash(i, 9) + dir * t * sp / 760) * 760 - 60, y0 = 330 + (i % 2) * 14, ph = t * 6 + i;
        const sw = Math.sin(ph);
        shadow(g, x0, y0, 12, 2, 0.3);
        sideFig(g, x0, y0, { h: 74 + (i % 3) * 6, pal: PASS[i % 3], t, ph: i, dir, legN: [sw * 20, sw * 20 - Math.max(0, Math.cos(ph)) * 25], legF: [-sw * 20, -sw * 20 - Math.max(0, -Math.cos(ph)) * 25], armN: [-sw * 14, -sw * 8], armF: [-30, -20], face: {} });
        const cx2 = x0 - dir * 20; R(g, cx2 - 6, y0 - 22, 13, 20, [mix(D.steel[2], D.n2, 0.3), mix(D.rust[2], D.n2, 0.4), mix(D.n4, D.n2, 0.3)][i % 3]); R(g, cx2 - 6, y0 - 22, 13, 1, D.n5); R(g, cx2 + dir * 4, y0 - 34, 1, 12, D.n5); R(g, cx2 - 4, y0 - 2, 2, 2, D.n0); R(g, cx2 + 3, y0 - 2, 2, 2, D.n0);
      }
    };
    const factory = (g, t, c) => {
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -40, 720, 300, mix(D.n3, D.steel[2], 0.25), mix(D.n3, D.paperD, 0.25), 7);
        // skylights in the saw-tooth roof
        for (let i = 0; i < 6; i++) { const sx = -20 + i * 120; poly(g, [[sx, 50], [sx + 100, 50], [sx + 100, 10], [sx + 10, 44]], mix(D.n2, D.steel[2], 0.2)); poly(g, [[sx + 14, 44], [sx + 96, 14], [sx + 96, 46]], mix(D.steel[0], D.cream, 0.35)); }
        R(g, -40, 50, 720, 4, D.n2);
        for (let x = -40; x < 680; x += 40) { PX.line(g, x, 54, x + 20, 80, D.n2); PX.line(g, x + 40, 54, x + 20, 80, D.n2); } R(g, -40, 80, 720, 2, D.n2);
        // back wall: brick rows, big windows
        for (let y = 90; y < 220; y += 6) R(g, -40, y, 720, 1, mix(D.n3, D.rust[2], 0.2));
        for (let i = 0; i < 5; i++) { const wx = 10 + i * 130; R(g, wx, 100, 90, 70, mix(D.n2, D.steel[2], 0.2)); PX.vgrad(g, wx + 3, 103, 84, 64, mix(D.steel[0], D.cream, 0.3), mix(D.cream, D.lamp, 0.3), 4); for (let k2 = 1; k2 < 4; k2++) R(g, wx + 3 + k2 * 21, 103, 1, 64, D.n3); R(g, wx + 3, 135, 84, 1, D.n3); }
        R(g, -40, 220, 720, 140, mix(D.n4, D.paperD, 0.22));
        for (let i = 0; i < 6; i++) A(g, 0.07, () => poly(g, [[10 + i * 130, 170], [100 + i * 130, 170], [150 + i * 130, 360], [40 + i * 130, 360]], D.cream));
      });
      // hanging lamps
      for (let i = 0; i < 5; i++) { const lx = 60 + i * 130; R(g, lx, 82, 1, 40, D.n2); poly(g, [[lx - 9, 128], [lx + 9, 128], [lx + 5, 122], [lx - 5, 122]], mix(D.moss[2], D.n2, 0.3)); R(g, lx - 6, 128, 12, 1, D.lamp); PX.glow(g, lx, 132, 40, D.lamp, 0.16); }
      // three conveyor lines at three depths, boxes moving in step
      const line = (y, k, sp, ph, n, dep) => PX.par(g, c, dep, () => {
        const h = 6 * k, spacing = 640 / n;
        // stations: workers behind the belt
        for (let i = 0; i < 4; i++) {
          const wx = 90 + i * 150 + (k > 1 ? 30 : 0), kk = (62 * k) / 90, ov = tri(mix([D.steel[2], D.teal[2], D.steel[2], D.moss[2]][i], D.n3, 0.3), 0.2, 0.4);
          const W = frontFig(g, wx, y + 6 * k, { h: 62 * k, pal: { skin: [SKINS.fair, SKINS.med, SKINS.warm, SKINS.deep][i], hair: [HAIR.brown, HAIR.black, HAIR.auburn, HAIR.black][i], coat: ov, shirt: D.n3, pants: tri(D.n3), shoe: D.n1, hairStyle: "short", sweater: true }, t, ph: i + k, noArms: true, noLegs: true, hipY: y + 4 * k, headDy: 1.5, face: { eye: "down" } });
          for (const sd2 of [-1, 1]) { const hx2 = wx + sd2 * 6 * kk + Math.sin(t * 1.4 + i + sd2) * 2 * kk, hy2 = y - 3 * k; seg(g, wx + sd2 * 11 * kk, W.shY + 5 * kk, hx2, hy2, 4.5 * kk, sd2 < 0 ? ov[1] : ov[2]); ell(g, hx2, hy2, 2.2 * kk, 2 * kk, D.paperD); }
          const [hcx, hcy] = W.head; ell(g, hcx, hcy - 6 * kk, 8 * kk, 4.4 * kk, mix(D.amber[1], D.n3, 0.2)); R(g, hcx - 9 * kk, hcy - 4 * kk, 18 * kk, Math.max(1, 1.4 * kk), mix(D.amber[1], D.n3, 0.35)); R(g, hcx - 3 * kk, hcy - 10 * kk, 4 * kk, Math.max(1, kk), mix(D.amber[0], D.cream, 0.2));
        }
        R(g, -40, y, 720, h, mix(D.n2, D.n3, 0.5)); R(g, -40, y, 720, 1, D.n5);
        for (let x = -40; x < 680; x += 6 * k) R(g, Math.round(x - ((t * sp) % (6 * k))), y + h - 2, 2, 2, D.n4);
        for (let x = -20; x < 680; x += 60 * k) { R(g, x, y + h, 3 * k, 22 * k, D.n2); }
        for (let i = -1; i < n + 1; i++) {
          const bx = ((i * spacing + t * sp + ph) % (640 + spacing)) - spacing / 2, bw = 14 * k, bh = 11 * k;
          R(g, bx, y - bh, bw, bh, mix(D.paperD, D.amber[2], 0.3)); R(g, bx, y - bh, bw, 1, mix(D.paper, D.cream, 0.2)); R(g, bx + bw - 2, y - bh, 2, bh, mix(D.paperD, D.n3, 0.4)); R(g, bx + bw / 2 - 1, y - bh, 2, bh, mix(D.paperD, D.amber[2], 0.5));
        }
      });
      // perspective floor lines
      for (let i = -6; i < 14; i++) PX.line(g, 320 + i * 20, 220, 320 + i * 90, 380, mix(D.n4, D.paperD, 0.15));
      line(214, 0.8, 18, 0, 10, 0.55); A(g, 0.3, () => R(g, 0, 150, 640, 80, mix(D.n3, D.paperD, 0.3)));   // haze over the far line
      line(262, 1.05, 24, 20, 9, 0.75); A(g, 0.12, () => R(g, 0, 200, 640, 80, mix(D.n3, D.paperD, 0.3)));
      line(326, 1.4, 32, 40, 7, 1.0);
      // the machines at each end the lines run through (hide where boxes enter and leave)
      PX.par(g, c, 0.9, () => {
        for (const [y2, k2] of [[214, 0.8], [262, 1.05], [326, 1.4]]) {
          const mh = 40 * k2, mw = 46 * k2, mc = mix(D.steel[2], D.n3, 0.35), mcL = mix(mc, D.n6, 0.3);
          R(g, -10, y2 - mh + 8 * k2, mw, mh, mc); R(g, -10, y2 - mh + 8 * k2, mw, 2, mcL); R(g, mw - 18 * k2, y2 - mh + 16 * k2, 8 * k2, 6 * k2, mix(D.moss[1], D.n2, 0.3)); R(g, 2, y2 - mh + 14 * k2, 14 * k2, 3 * k2, D.n2);
          R(g, 650 - mw, y2 - mh + 8 * k2, mw, mh, mc); R(g, 650 - mw, y2 - mh + 8 * k2, mw, 2, mcL); R(g, 656 - mw, y2 - mh + 16 * k2, 8 * k2, 6 * k2, mix(D.amber[1], D.n2, 0.3)); R(g, 650 - mw, y2 - 10 * k2, mw, 2, D.n2);
          A(g, 0.5 + 0.5 * Math.sin(t * 3 + y2), () => R(g, mw - 16 * k2, y2 - mh + 18 * k2, 3 * k2, 2 * k2, D.moss[0]));
        }
      });
      // stacked crates on a pallet + forklift (right, foreground)
      PX.par(g, c, 1.1, () => {
        for (let r2 = 0; r2 < 3; r2++) for (let cI = 0; cI < 2; cI++) { const x2 = 560 + cI * 26, y2 = 344 - r2 * 20; R(g, x2, y2 - 20, 24, 20, WOOD[1]); R(g, x2, y2 - 20, 24, 1, WOOD[0]); R(g, x2 + 2, y2 - 12, 20, 1, WOOD[2]); }
        R(g, 556, 344, 56, 4, WOOD[2]);
      });
    };
    return (g, t, d, c) => {
      const T = tm(o, d, 6.0), tPl = T("planes", 0.5), tF = T("factory", 3.0), sd = d / 6;
      const p = E((t - tF) / (0.9 * sd), "io");
      if (p < 1) airport(g, t, c, tPl);
      if (p > 0) {
        if (!buf) { buf = document.createElement("canvas"); buf.width = 640; buf.height = 360; }
        const b = buf.getContext("2d"); b.setTransform(1, 0, 0, 1, 0, 0); b.globalAlpha = 1; b.clearRect(0, 0, 640, 360);
        factory(b, t, c);
        A(g, p, () => g.drawImage(buf, 0, 0));
      }
      PX.particles(g, 31, 22, t, [0, 40, 640, 260], { vy: -1, vx: 1, col: D.lamp, a: 0.35, tw: 1.1 });
      PX.vignette(g, 0.48);
    };
  };
})();
