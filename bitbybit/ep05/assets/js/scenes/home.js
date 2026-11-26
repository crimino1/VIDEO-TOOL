/* EP5 Builder A (cold open + ending, the boots story): boots_talk, mic_myth, phone_wall, crumbs, wifi_morning.
   Documentary look, cool and nocturnal: dark neutral nights, steel/teal machine + phone light, warm cream lamp light,
   one warm accent for the viewer (the YOU dot). PX.D only (black only for shadows). */
(function () {
  const { K, D } = PX;
  const R = PX.rect, P = PX.p, clamp = PX.clamp, lerp = PX.lerp;
  const TAU = Math.PI * 2;
  const BLK = "#000";

  // ---------- colour (derived from PX.D) ----------
  const hex = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { k = clamp(k, 0, 1); const A = hex(a), B = hex(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const tri = (b, l, d) => [l, b, d];   // [light, base, shadow]

  const WB = mix(mix(D.rust[2], D.amber[2], 0.35), D.n3, 0.3);
  const WOOD = [mix(WB, D.lamp, 0.3), WB, mix(WB, D.n0, 0.45), mix(WB, D.n0, 0.72)];
  const LEATH = [mix(D.rust[1], D.amber[1], 0.45), mix(D.rust[2], D.amber[2], 0.45), mix(D.rust[2], D.n0, 0.45)];   // boot leather
  // You: medium-brown skin, dark wavy hair, mustard-amber hoodie, jeans
  const YSK = mix(D.rust[2], D.lampD, 0.5);
  const YOU = {
    skin: tri(YSK, mix(YSK, D.lamp, 0.32), mix(YSK, D.n0, 0.38)),
    hair: tri(mix(D.n0, D.rust[2], 0.22), mix(D.n3, D.rust[2], 0.3), D.n0),
    top: tri(mix(D.amber[1], D.n4, 0.28), mix(mix(D.amber[1], D.n4, 0.28), D.lamp, 0.35), mix(D.amber[2], D.n1, 0.4)),
    pants: tri(mix(D.steel[2], D.n2, 0.25), mix(D.steel[1], D.n3, 0.45), mix(D.steel[2], D.n0, 0.5)),
    shoe: [D.paper, D.paperD], style: "wavy", hood: 1,
  };
  // the friend: light skin, short ginger hair, green jacket over a cream tee
  const FSK = mix(D.rose[0], D.lampD, 0.22);
  const FRIEND = {
    skin: tri(FSK, mix(FSK, D.cream, 0.35), mix(FSK, D.rose[2], 0.45)),
    hair: tri(mix(D.rust[1], D.amber[1], 0.3), mix(mix(D.rust[1], D.amber[1], 0.3), D.amber[0], 0.4), mix(D.rust[2], D.n1, 0.2)),
    top: tri(mix(D.moss[2], D.moss[1], 0.35), mix(D.moss[1], D.moss[0], 0.15), mix(D.moss[2], D.n1, 0.4)),
    pants: tri(mix(D.n3, D.ink, 0.3), mix(D.n4, D.ink, 0.2), D.n1),
    shoe: [mix(D.n4, D.rust[2], 0.2), D.n2], style: "short", tee: mix(D.paper, D.n4, 0.3),
  };
  // generic researcher: lab coat, dark short hair
  const RSK = mix(D.rose[1], D.lampD, 0.55);
  const RESEARCHER = {
    skin: tri(RSK, mix(RSK, D.cream, 0.3), mix(RSK, D.n0, 0.35)),
    hair: tri(mix(D.n1, D.n3, 0.4), D.n4, D.n0),
    top: tri(mix(D.paper, D.n5, 0.62), mix(D.paper, D.glass, 0.35), mix(D.paperD, D.n3, 0.7)),
    pants: tri(D.n3, D.n4, D.n1), shoe: [D.n2, D.n1], style: "short", tee: D.steel[2], coat: 1,
  };

  // night version of a character palette: every colour pulled toward n0 (k) and optionally tinted
  const shade = (S, k, tint, kt) => { const f = (c) => mix(tint ? mix(c, tint, kt || 0.15) : c, D.n0, k); return { ...S, skin: S.skin.map(f), hair: S.hair.map(f), top: S.top.map(f), pants: S.pants.map(f), shoe: S.shoe.map(f), tee: S.tee && f(S.tee) }; };

  // ---------- geometry ----------
  const poly = (g, pts, col) => {
    let y0 = Infinity, y1 = -Infinity;
    for (const [, y] of pts) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
    if (col) g.fillStyle = col;
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
  const ell = (g, cx, cy, rx, ry, col) => {
    if (col) g.fillStyle = col; const n = Math.max(0, Math.round(ry));
    if (n === 0) { g.fillRect(Math.round(cx - rx), Math.round(cy), Math.round(2 * rx) + 1, 1); return; }
    for (let y = -n; y <= n; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y / (ry + 0.3)) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
  };
  const disc = (g, cx, cy, r, col) => {
    if (col) g.fillStyle = col; cx = Math.round(cx); cy = Math.round(cy);
    if (r < 0.75) { g.fillRect(cx, cy, 1, 1); return; }
    const n = Math.round(r);
    for (let y = -n; y <= n; y++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - y * y))); g.fillRect(cx - w, cy + y, 2 * w + 1, 1); }
  };
  const dot = (g, x, y, col) => { if (col) g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); };
  const thick = (g, x1, y1, x2, y2, w, col) => { g.fillStyle = col; const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1)); for (let i = 0; i <= n; i++) disc(g, x1 + ((x2 - x1) * i) / Math.max(n, 1), y1 + ((y2 - y1) * i) / Math.max(n, 1), w / 2); };
  const ring = (g, cx, cy, r, col) => { g.fillStyle = col; const n = Math.max(8, Math.round(r * 7)); for (let i = 0; i < n; i++) { const a = (i / n) * TAU; g.fillRect(Math.round(cx + Math.cos(a) * r), Math.round(cy + Math.sin(a) * r), 1, 1); } };

  // ---------- light ----------
  const A = (g, a, fn) => PX.alpha(g, a, fn);
  const dim = (g, a, x, y, w, h) => { if (a <= 0.003) return; g.fillStyle = `rgba(0,0,0,${a.toFixed(3)})`; g.fillRect(x || 0, y || 0, w === undefined ? 640 : w, h === undefined ? 360 : h); };
  const pool = (g, x, y, r0, r1, a) => { if (a <= 0.003) return; const gr = g.createRadialGradient(x, y, r0, x, y, r1); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, `rgba(0,0,0,${a.toFixed(3)})`); g.fillStyle = gr; g.fillRect(0, 0, 640, 360); };
  const lab = (g, s, x, y, col, size, font) => PX.otext(g, s, x, y, { align: "center", col: col || D.cream, outline: D.n0, size: size || 8, font });
  // option time: explicit value used as given, else default scaled with shot length
  const opt = (o, d, typ) => (k, def) => (o[k] !== undefined && o[k] !== null && isFinite(+o[k]) ? +o[k] : (def * d) / typ);

  // ---------- motifs ----------
  // the YOU dot: warm amber dot, soft 1-px cream ring, faint pulse
  const youDot = (g, x, y, t, a) => {
    a = a === undefined ? 1 : a; if (a <= 0) return;
    A(g, a, () => {
      const ph = (((t % 2.2) + 2.2) % 2.2) / 2.2;
      A(g, 0.35 * (1 - ph), () => ring(g, x, y, 4 + ph * 5, D.amber[0]));
      PX.glow(g, x, y, 9, D.amber[1], 0.25);
      A(g, 0.55, () => ring(g, x, y, 3.2, D.cream));
      disc(g, x, y, 1.8, D.amber[1]); dot(g, x - 1, y - 1, D.amber[0]);
    });
  };
  const otherDot = (g, x, y, a, col) => { A(g, a, () => { A(g, 0.35, () => ring(g, x, y, 2.6, D.n6)); disc(g, x, y, 1.2, col || D.n7); }); };
  // hiking boot, two native sizes. (x, y) = top-left. "m" 15x13, "s" 8x7
  const BOOT_M = [
    "..kkkkk........",
    "..kbbbk........",
    "..kblbk........",
    "..kbblk........",
    "..kblbk........",
    "..kbblbk.......",
    ".kbbbbbbkk.....",
    ".kbhbbbbbbkk...",
    ".kbbhhbbbbbbk..",
    "kbbbbbbbbbbbbk.",
    "kddddddddddddk.",
    "sssssssssssssss",
    "s.ss.ss.ss.ss.s",
  ];
  const BOOT_S = [".kkk.....", ".kbk.....", ".klk.....", ".kbk.....", ".kbbkk...", ".kbbbbkk.", "kbbbbbbbk", "sssssssss"];
  const boot = (g, x, y, size, lit) => {
    const pal = { k: mix(LEATH[2], D.n0, 0.3), b: LEATH[1], h: LEATH[0], l: D.cream, d: mix(LEATH[1], D.amber[0], 0.25), s: D.n1 };
    if (lit) { pal.b = mix(pal.b, D.lamp, lit * 0.25); pal.h = mix(pal.h, D.cream, lit * 0.25); }
    PX.sprite(g, size === "s" ? BOOT_S : BOOT_M, x, y, pal);
  };
  const bubble = (g, x, y, w, h, tx, ty, a) => {   // speech bubble, tail to (tx, ty)
    if (a <= 0) return;
    A(g, a, () => {
      A(g, 0.35, () => R(g, x + 2, y + 3, w, h, BLK));
      const ex = clamp(tx, x + 6, x + w - 10);
      poly(g, [[ex, y + h - 1], [ex + 8, y + h - 1], [tx, ty]], D.n0);
      poly(g, [[ex + 1, y + h - 2], [ex + 7, y + h - 2], [tx + (tx < ex ? 1 : -1), ty - 2]], D.cream);
      PX.panel(g, x, y, w, h, D.n0, D.cream);
      R(g, x + 2, y + h - 3, w - 4, 1, D.paper);
    });
  };

  // ---------- characters ----------
  // face features shared by front views: eyes, brows, nose, mouth
  const faceFront = (g, ex, hy, S, o) => {
    const eye = o.eyes || "n", m = o.mouth || 0, gx = Math.round(clamp(o.gx || 0, -1, 1)), gy = o.gy || 0;
    const brow = mix(S.hair[1], S.skin[2], 0.3);
    const by = hy - 4 - (o.brow ? 1 : 0);
    R(g, ex - 5, by, 3, 1, brow); R(g, ex + 2, by, 3, 1, brow);
    if (o.blink || eye === "closed") { R(g, ex - 5, hy, 3, 1, D.n0); R(g, ex + 2, hy, 3, 1, D.n0); }
    else if (eye === "wide") {
      for (const sx of [ex - 5, ex + 2]) { R(g, sx, hy - 1, 3, 3, D.cream); R(g, sx + 1 + gx, hy - 1 + Math.round(gy), 1, 2, D.n0); }
    } else if (eye === "down") {
      for (const sx of [ex - 5, ex + 2]) { R(g, sx, hy, 3, 1, S.skin[2]); R(g, sx + 1 + gx, hy + 1, 2, 1, D.n0); }
    } else for (const sx of [ex - 5, ex + 2]) { R(g, sx + 1 + gx, hy - 1 + Math.round(gy), 2, 2, D.n0); dot(g, sx + 1 + gx, hy - 1 + Math.round(gy), mix(D.n0, D.n6, 0.5)); }
    R(g, ex, hy + 2, 1, 2, S.skin[2]);
    const mc = mix(S.skin[2], D.rust[2], 0.4), my = hy + 6;
    if (m === 1) { R(g, ex - 2, my - 1, 4, 2, mix(D.n0, D.rust[2], 0.3)); R(g, ex - 1, my, 2, 1, mix(D.rose[1], D.rust[2], 0.4)); }
    else if (m === 2) { R(g, ex - 2, my, 4, 1, mc); dot(g, ex - 3, my - 1, mc); dot(g, ex + 2, my - 1, mc); }
    else if (m === 3) R(g, ex - 1, my - 1, 2, 2, mix(D.n0, D.rust[2], 0.3));
    else R(g, ex - 2, my, 4, 1, mc);
  };
  // seated person, front view. (x, y) = seat under the hips; feet at y+34; head top ~y-64.
  // o: look -1..1 (head turn), tilt (px head drop), mouth 0 closed|1 open|2 smile|3 "o", eyes n|wide|down|closed, gx, gy,
  //    arms "lap"|"gesture"|"phone", wave (gesture hand bob), rim (+1 light from right, -1 left)
  const sitFront = (g, x, y, t, S, o) => {
    o = o || {};
    const [sk, skL, skD] = [S.skin[1], S.skin[0], S.skin[2]], [tp, tpL, tpD] = [S.top[1], S.top[0], S.top[2]], [pa, paL, paD] = [S.pants[1], S.pants[0], S.pants[2]];
    const rim = o.rim || 0, breathe = Math.round(Math.sin(t * 1.6 + x) * 0.5 + 0.5) * 0;
    // shins + shoes
    for (const s of [-1, 1]) {
      const lx = x + s * 9 - 4;
      A(g, 0.45, () => R(g, lx - 1, y + 10, 10, 3, BLK));   // shadow under the knee
      poly(g, [[lx, y + 9], [lx + 8, y + 9], [lx + 8 + s, y + 31], [lx + s, y + 31]], mix(pa, D.n0, 0.3)); R(g, s < 0 ? lx : lx + 7, y + 9, 1, 22, paD);
      R(g, lx - 1 + s, y + 31, 10, 4, S.shoe[1]); R(g, lx - 1 + s, y + 31, 10, 1, S.shoe[0]); R(g, lx - 1 + s, y + 34, 10, 1, D.n1);
    }
    // thighs (foreshortened toward us): lit tops, knee caps, dark lap crease
    R(g, x - 16, y - 4, 32, 13, pa); R(g, x - 15, y - 4, 30, 3, paL); R(g, x - 1, y - 2, 2, 11, paD); R(g, x - 16, y + 8, 32, 1, paD);
    for (const s of [-1, 1]) { R(g, x + s * 9 - 4, y + 4, 8, 3, mix(pa, paL, 0.5)); R(g, x + s * 9 - 3, y + 4, 6, 1, paL); }
    // torso
    const ty = y - 42 + breathe;
    R(g, x - 12, ty, 24, 2, tp); R(g, x - 14, ty + 2, 28, y - ty - 2, tp);
    R(g, x - 14, ty + 2, 3, y - ty - 2, rim < 0 ? tpL : tpD); R(g, x + 11, ty + 2, 3, y - ty - 2, rim > 0 ? tpL : tpD);
    R(g, x - 14, y - 2, 28, 2, tpD); A(g, 0.4, () => R(g, x - 15, y, 30, 1, BLK));
    if (S.coat || S.tee) {   // open jacket over a tee
      poly(g, [[x - 5, ty], [x + 5, ty], [x + 3, y - 2], [x - 3, y - 2]], S.tee);
      R(g, x - 5, ty, 2, y - ty - 2, tpD); R(g, x + 3, ty, 2, y - ty - 2, tpD);
      poly(g, [[x - 9, ty - 1], [x - 4, ty - 1], [x - 2, ty + 8], [x - 5, ty + 10]], tpL); poly(g, [[x + 4, ty - 1], [x + 9, ty - 1], [x + 5, ty + 10], [x + 2, ty + 8]], tpL);
    } else {
      R(g, x - 9, ty - 2, 18, 5, tpD); R(g, x - 7, ty - 1, 14, 2, mix(tpD, D.n0, 0.3));   // hood bunched at the neck
      R(g, x - 3, ty + 3, 1, 10, S.shoe[0]); R(g, x + 2, ty + 3, 1, 8, S.shoe[0]);    // drawstrings
      R(g, x - 9, y - 16, 18, 1, tpD); R(g, x - 10, y - 15, 1, 10, tpD); R(g, x + 9, y - 15, 1, 10, tpD);   // pocket
    }
    // arms
    const arm = o.arms || "lap", wave = o.wave || 0;
    const sleeve = (x1, y1, x2, y2, w, col) => thick(g, x1, y1, x2, y2, w, col);
    // left arm (viewer's left): always lap
    sleeve(x - 15, ty + 4, x - 17, y - 16, 6, tpD); sleeve(x - 15, ty + 4, x - 16, y - 18, 4, tp);
    if (arm === "phone") { sleeve(x - 17, y - 15, x - 5, y - 18, 5, tpD); R(g, x - 6, y - 21, 5, 4, sk); R(g, x - 6, y - 21, 5, 1, skL); }
    else { sleeve(x - 17, y - 15, x - 7, y - 7, 5, tpD); sleeve(x - 17, y - 16, x - 8, y - 9, 3, tp); R(g, x - 8, y - 9, 5, 4, sk); R(g, x - 8, y - 9, 5, 1, skL); }
    // right arm
    if (arm === "gesture") {
      const hx = x + 22, hy = y - 30 + Math.round(wave);
      sleeve(x + 15, ty + 4, x + 18, y - 16, 6, tpD); sleeve(x + 15, ty + 4, x + 17, y - 17, 4, tp);
      sleeve(x + 18, y - 16, hx, hy + 4, 5, tpD); sleeve(x + 18, y - 17, hx - 1, hy + 4, 3, tp);
      R(g, hx - 2, hy - 3, 5, 6, sk); R(g, hx - 2, hy - 3, 1, 6, skL); R(g, hx + 2, hy - 5, 1, 3, sk); dot(g, hx + 1, hy - 4, skL);
    } else if (arm === "phone") {
      sleeve(x + 15, ty + 4, x + 17, y - 16, 6, tpD); sleeve(x + 15, ty + 4, x + 16, y - 18, 4, tp);
      sleeve(x + 17, y - 15, x + 5, y - 18, 5, tpD);
      R(g, x - 3, y - 27, 7, 11, D.n1); R(g, x - 2, y - 26, 5, 8, o.screen || mix(D.teal[2], D.n2, 0.3));
      R(g, x + 1, y - 21, 5, 4, sk); R(g, x + 1, y - 21, 5, 1, skL);
    } else {
      sleeve(x + 15, ty + 4, x + 17, y - 16, 6, tpD); sleeve(x + 15, ty + 4, x + 16, y - 18, 4, tp);
      sleeve(x + 17, y - 15, x + 8, y - 7, 5, tpD); sleeve(x + 17, y - 16, x + 9, y - 9, 3, tp); R(g, x + 4, y - 9, 5, 4, sk); R(g, x + 4, y - 9, 5, 1, skL);
    }
    // neck + head
    const lk = clamp(o.look || 0, -1, 1), hx = x + Math.round(lk * 1.5) + Math.round(o.lean || 0), hy = y - 54 + Math.round(o.tilt || 0);
    R(g, x - 3, ty - 5, 6, 6, skD);
    if (S.style === "wavy") { ell(g, hx, hy - 3, 11, 8, S.hair[2]); R(g, hx - 11, hy - 3, 22, 8, S.hair[2]); }   // back hair volume
    ell(g, hx, hy, 8, 10, sk);
    R(g, hx - 8 + (lk > 0 ? 0 : 0), hy - 3, 2, 9, lk > 0.3 ? skL : skD);   // turned-away cheek darker
    R(g, hx + 6, hy - 3, 2, 9, rim > 0 ? skL : lk < -0.3 ? skL : skD);
    R(g, hx - 6, hy + 8, 12, 2, skD);   // jaw shadow
    // ears
    if (S.style !== "wavy") { R(g, hx - 10, hy, 2, 4, skD); R(g, hx + 8, hy, 2, 4, skD); }
    faceFront(g, hx + Math.round(lk * 4), hy + Math.round(o.gy2 || 0), S, o);
    // hair (front)
    const [hL, hB, hD] = [S.hair[0], S.hair[1], S.hair[2]], sh = Math.round(lk * 2);
    if (S.style === "wavy") {
      ell(g, hx + sh * 0.5, hy - 7, 10, 5, hB);
      for (let i = 0; i < 7; i++) { const fx = hx - 9 + i * 3 + sh; R(g, fx, hy - 4, 3, 1 + ((i + 1) % 2) * 2, hB); }
      R(g, hx - 11, hy - 6, 3, 11, hB); R(g, hx + 8, hy - 6, 3, 11, hB);
      for (let k = 0; k < 3; k++) { dot(g, hx - 12 + (k % 2), hy - 4 + k * 3, hB); dot(g, hx + 11 - (k % 2), hy - 3 + k * 3, hB); }
      R(g, hx - 10, hy + 4, 2, 2, hD); R(g, hx + 8, hy + 4, 2, 2, hD);
      for (const [px, py] of [[-5, -10], [-2, -11], [1, -10], [4, -9], [-7, -8], [6, -7]]) dot(g, hx + px + sh, hy + py, hL);
      R(g, hx - 4 + sh, hy - 8, 6, 1, hL);
    } else {
      ell(g, hx + sh * 0.5, hy - 7, 9, 4, hB);
      R(g, hx - 9, hy - 7, 2, 6, hB); R(g, hx + 7, hy - 7, 2, 6, hB);
      poly(g, [[hx - 8 + sh, hy - 6], [hx + 5 + sh, hy - 7], [hx + 1 + sh, hy - 3], [hx - 7 + sh, hy - 3]], hB);
      R(g, hx - 6 + sh, hy - 10, 8, 1, hL); dot(g, hx + 3 + sh, hy - 9, hL); dot(g, hx - 4 + sh, hy - 7, hL);
      R(g, hx - 8, hy - 4, 1, 3, hD); R(g, hx + 7, hy - 4, 1, 3, hD);
    }
  };

  // side-view person facing right. (x, y) = feet on the ground; head top ~y-94.
  // o: walk phase (radians, undefined = standing), phone 0..1 (phone held up), sit (seat height above ground, legs bent),
  //    mouth, eyes n|wide|down|closed, brow, look (-1 down .. 1 up head tilt), lean (px), screenCol, reach (arm to desk)
  const side = (g, x, y, t, S, o) => {
    o = o || {};
    const [sk, skL, skD] = [S.skin[1], S.skin[0], S.skin[2]], [tp, tpL, tpD] = [S.top[1], S.top[0], S.top[2]], [pa, paL, paD] = [S.pants[1], S.pants[0], S.pants[2]];
    const walking = o.walk !== undefined, ph = o.walk || 0, bob = walking ? Math.round(Math.abs(Math.sin(ph)) * -1.5) : 0;
    const sit = o.sit || 0, lean = o.lean || 0;
    const hipY = (sit ? y - sit : y - 44) + bob, hipX = x;
    // legs
    const leg = (sw, col, colD) => {
      if (sit) {
        const kx = hipX + 18, ky = hipY - 1, fx = kx + 2, fy = y - 3;
        thick(g, hipX, hipY, kx, ky, 8, col); thick(g, kx, ky, fx, fy, 7, colD);
        R(g, fx - 3, y - 4, 11, 4, S.shoe[1]); R(g, fx - 3, y - 4, 11, 1, S.shoe[0]); R(g, fx - 3, y - 1, 12, 1, D.n1);
        return;
      }
      const a = Math.sin(ph + sw) * (walking ? 0.42 : 0), kx = hipX + Math.sin(a) * 21, ky = hipY + Math.cos(a) * 21;
      const b2 = a - (walking ? Math.max(0, Math.sin(ph + sw + 1.2)) * 0.6 : 0), fx = kx + Math.sin(b2) * 20, fy = Math.min(y - 3, ky + Math.cos(b2) * 20);
      thick(g, hipX, hipY, kx, ky, 8, col); thick(g, kx, ky, fx, fy, 7, colD);
      R(g, fx - 4, fy, 12, 4, S.shoe[1]); R(g, fx - 4, fy, 12, 1, S.shoe[0]); R(g, fx - 4, fy + 3, 12, 1, D.n1);
    };
    leg(Math.PI, mix(pa, D.n0, 0.3), mix(paD, D.n0, 0.2));
    // back arm
    const shY = hipY - 38, shX = hipX + 2 + lean;
    if (!o.phone && !o.reach) { const a = walking ? -Math.sin(ph) * 0.5 : 0; thick(g, shX, shY + 3, shX + Math.sin(a) * 26, shY + 3 + Math.cos(a) * 26, 6, tpD); }
    else thick(g, shX - 1, shY + 3, shX + 6, shY + 20, 6, tpD);
    leg(0, pa, paD);
    // torso
    poly(g, [[shX - 9, shY], [shX + 8, shY], [hipX + 9, hipY + 2], [hipX - 9, hipY + 2]], tp);
    poly(g, [[shX - 9, shY], [shX - 5, shY], [hipX - 5, hipY + 2], [hipX - 9, hipY + 2]], tpD);
    R(g, Math.round(shX + 6), shY + 2, 2, hipY - shY - 4, tpL);
    if (S.coat) { poly(g, [[hipX - 9, hipY], [hipX + 10, hipY], [hipX + 12, hipY + 12], [hipX - 11, hipY + 12]], tp); R(g, hipX - 11, hipY + 11, 23, 1, tpD); R(g, Math.round(shX + 4), shY + 2, 1, hipY - shY + 8, tpD);
      poly(g, [[shX + 2, shY], [shX + 8, shY], [shX + 4, shY + 12]], S.tee); R(g, Math.round(shX - 2), hipY - 12, 6, 1, tpD); R(g, Math.round(shX - 2), hipY - 12, 1, 5, tpD); dot(g, Math.round(shX + 1), shY + 6, D.steel[1]); }
    else if (S.tee) { R(g, Math.round(shX + 5), shY + 1, 2, 16, S.tee); }
    else { R(g, Math.round(shX - 10), shY - 2, 9, 7, tpD); R(g, Math.round(shX - 9), shY - 1, 6, 4, tp); }   // hood on the back
    // head
    const hx = Math.round(shX + 2), hy = shY - 13 - Math.round(o.look || 0) * 0 + Math.round(bob * 0);
    R(g, hx - 2, shY - 5, 6, 6, skD);
    if (S.style === "wavy") ell(g, hx - 2, hy - 1, 10, 9, S.hair[2]);
    ell(g, hx, hy, 8, 9, sk);
    R(g, hx - 7, hy - 2, 4, 9, skD);
    const tilt = Math.round(clamp(o.look || 0, -1, 1) * 2);
    R(g, hx + 7, hy + tilt, 2, 3, sk);   // nose
    dot(g, hx + 8, hy + 2 + tilt, skD);
    const eye = o.eyes || "n";
    if (o.blink || eye === "closed") R(g, hx + 3, hy - 1 + tilt, 3, 1, D.n0);
    else if (eye === "wide") { R(g, hx + 3, hy - 2 + tilt, 3, 3, D.cream); R(g, hx + 5, hy - 2 + tilt, 1, 2, D.n0); }
    else if (eye === "down") { R(g, hx + 3, hy - 1 + tilt, 3, 1, skD); R(g, hx + 4, hy + tilt, 2, 1, D.n0); }
    else R(g, hx + 4, hy - 2 + tilt, 2, 2, D.n0);
    R(g, hx + 2, hy - 5 + tilt - (o.brow ? 1 : 0), 5, 1, mix(S.hair[1], skD, 0.3));
    const mc = mix(skD, D.rust[2], 0.4);
    if (o.mouth === 1) R(g, hx + 4, hy + 5 + tilt, 3, 2, mix(D.n0, D.rust[2], 0.3)); else if (o.mouth === 2) { R(g, hx + 4, hy + 5 + tilt, 3, 1, mc); dot(g, hx + 6, hy + 4 + tilt, mc); } else R(g, hx + 4, hy + 5 + tilt, 3, 1, mc);
    R(g, hx - 6, hy + 7, 8, 2, skD);
    R(g, hx - 3, hy, 3, 4, skD); dot(g, hx - 2, hy + 1, sk);   // ear
    const [hL, hB, hD] = [S.hair[0], S.hair[1], S.hair[2]];
    if (S.style === "wavy") {
      ell(g, hx - 1, hy - 6, 10, 5, hB); R(g, hx - 10, hy - 6, 7, 10, hB);
      for (let k = 0; k < 4; k++) dot(g, hx - 11 + (k % 2), hy - 5 + k * 3, hB);
      for (let i = 0; i < 3; i++) R(g, hx + 2 + i * 3, hy - 4, 3, 1 + (i % 2), hB);
      R(g, hx - 9, hy + 3, 5, 3, hD); dot(g, hx - 4, hy + 5, hB); for (const [px, py] of [[-4, -10], [-1, -11], [2, -10], [-7, -8], [5, -8]]) dot(g, hx + px, hy + py, hL);
    } else {
      ell(g, hx - 1, hy - 6, 9, 4, hB); R(g, hx - 9, hy - 6, 6, 7, hB); R(g, hx + 2, hy - 6, 4, 2, hB); dot(g, hx + 6, hy - 5, hB);
      R(g, hx - 5, hy - 10, 8, 1, hL); dot(g, hx + 4, hy - 8, hL); R(g, hx - 9, hy - 1, 3, 2, hD);
    }
    // front arm
    if (o.phone) {
      const k = clamp(o.phone, 0, 1), px2 = hx + 10, py2 = lerp(shY + 26, hy + 14, k);
      thick(g, shX + 1, shY + 3, shX + 5, shY + 18, 6, tp); thick(g, shX + 5, shY + 18, px2 - 1, py2 + 3, 5, tp);
      R(g, px2 - 1, py2 - 6, 3, 10, D.n1); R(g, px2 - 2, py2 - 5, 1, 8, o.screenCol || mix(D.teal[1], D.n2, 0.3));
      R(g, px2 - 3, py2 + 1, 5, 4, sk); dot(g, px2 - 3, py2 + 1, skL);
    } else if (o.reach) {
      const [rx, ry] = o.reach;
      thick(g, shX + 1, shY + 3, shX + 6, shY + 18, 6, tp); thick(g, shX + 6, shY + 18, rx - 3, ry, 5, tp); R(g, rx - 4, ry - 2, 6, 3, sk); R(g, rx - 4, ry - 2, 6, 1, skL);
    } else {
      const a = walking ? Math.sin(ph) * 0.5 : 0;
      thick(g, shX + 1, shY + 3, shX + 1 + Math.sin(a) * 25, shY + 3 + Math.cos(a) * 25, 6, tp);
      R(g, Math.round(shX - 1 + Math.sin(a) * 27), Math.round(shY + 1 + Math.cos(a) * 27), 4, 4, sk);
    }
    return { hx, hy, sx: hx + 10, sy: o.phone ? lerp(shY + 26, hy + 14, clamp(o.phone, 0, 1)) - 1 : 0 };
  };

  // phone lying face-up on a table (slight top-down), (x, y) top-left, 26x38. screen(g, sx, sy, sw, sh) draws the content
  const phoneFlat = (g, x, y, lit, screen) => {
    A(g, 0.5, () => R(g, x + 2, y + 3, 26, 38, BLK));
    R(g, x, y, 26, 38, D.n1); R(g, x + 1, y, 24, 1, D.n4); R(g, x + 25, y + 1, 1, 36, D.n3); R(g, x, y + 37, 26, 1, D.n0);
    R(g, x + 2, y + 4, 22, 30, mix(D.n0, D.steel[2], 0.22 + lit * 0.4));
    R(g, x + 10, y + 1, 6, 1, D.n3);
    if (lit > 0 && screen) { g.save(); g.beginPath(); g.rect(x + 2, y + 4, 22, 30); g.clip(); A(g, clamp(lit, 0, 1), () => screen(g, x + 2, y + 4, 22, 30)); g.restore(); }
    else A(g, 0.1, () => poly(g, [[x + 3, y + 5], [x + 11, y + 5], [x + 3, y + 18]], D.cream));
  };

  // ======================= boots_talk =======================
  // cosy living room at night; You and the friend on the sofa talking; the friend's bubble shows a hiking boot.
  // o.bubble (0.5) bubble pops, o.ad (4.0) phone on the coffee table lights with an ad card of the same boot,
  // o.look (ad + 0.5) You freezes and slowly turns to look down at the phone. Friend talks on, then glances over.
  K.boots_talk = (o) => {
    const r = PX.rnd(51), BOOKS = [];
    for (let s = 0; s < 4; s++) { let x = 0; while (x < 74) { const w = 3 + Math.floor(r() * 4), h = 16 + Math.floor(r() * 9), k = Math.floor(r() * 6); if (r() < 0.12) { x += 6; continue; } BOOKS.push([s, x, w, h, k]); x += w + (r() < 0.2 ? 1 : 0); } }
    const BC = [mix(D.rust[2], D.n2, 0.35), mix(D.moss[2], D.n2, 0.35), mix(D.steel[2], D.n2, 0.2), mix(D.paperD, D.n3, 0.45), mix(D.plum[2], D.n2, 0.3), mix(D.teal[2], D.n2, 0.3)];
    const YX = 286, FX = 362, SY = 242, LX = 476, LY = 118, PXp = 307, PYp = 300;
    return (g, t, d, c) => {
      const sc = d / 6.4, b = opt(o, d, 6.4), tB = b("bubble", 0.5), tAd = b("ad", 4.0), tLook = o.look !== undefined ? b("look", 0) : tAd + 0.5 * sc;
      const ad = P(t, tAd, 0.5, "out"), freeze = t >= tAd + 0.15, lookK = P(t, tLook, 1.3, "io");
      const roomDim = 0.14 * P(t, tAd, 1.2, "io");
      // ---- wall ----
      const WALL = mix(D.n2, D.teal[2], 0.18);
      PX.vgrad(g, 0, 0, 640, 262, mix(WALL, D.n1, 0.3), mix(WALL, D.n0, 0.45), 8);
      for (let x = 6; x < 640; x += 14) A(g, 0.16, () => R(g, x, 0, 1, 262, mix(WALL, D.n0, 0.5)));
      R(g, 0, 252, 640, 10, mix(WALL, D.n0, 0.55)); R(g, 0, 252, 640, 1, mix(WALL, D.n4, 0.3));   // skirting
      PX.par(g, c, 0.45, () => {
        // window: night sky, distant rooftops with a few warm windows, bare tree
        const wx = 56, wy = 50, ww = 104, wh = 140;
        R(g, wx - 4, wy - 4, ww + 8, wh + 8, mix(D.n3, D.n1, 0.4));
        PX.vgrad(g, wx, wy, ww, wh, mix(D.n1, D.steel[2], 0.55), mix(D.n1, D.steel[2], 0.2), 6);
        disc(g, wx + 74, wy + 26, 7, mix(D.cream, D.glass, 0.4)); disc(g, wx + 77, wy + 24, 6, mix(D.n1, D.steel[2], 0.5));
        PX.glow(g, wx + 72, wy + 27, 26, D.glass, 0.14);
        const rr = PX.rnd(9);
        for (let i = 0; i < 9; i++) { const bx = wx + i * 12 - 3, bh = 26 + rr() * 38; R(g, bx, wy + wh - bh, 13, bh, mix(D.n0, D.n2, 0.4)); for (let k = 0; k < 3; k++) if (rr() < 0.45) R(g, bx + 3 + (k % 2) * 6, wy + wh - bh + 6 + k * 9, 3, 3, PX.blink(t + i * 0.7 + k, 7.3, 0.92) ? mix(D.lamp, D.n2, 0.35) : mix(D.n2, D.lampD, 0.2)); }
        const TR = mix(D.n0, D.n2, 0.2);
        thick(g, wx + 24, wy + wh, wx + 30, wy + 70, 3, TR); thick(g, wx + 30, wy + 90, wx + 12, wy + 56, 2, TR); thick(g, wx + 29, wy + 78, wx + 48, wy + 44, 2, TR); thick(g, wx + 40, wy + 58, wx + 56, wy + 52, 1, TR);
        R(g, wx + ww / 2 - 1, wy, 3, wh, mix(D.n3, D.n1, 0.3)); R(g, wx, wy + 58, ww, 3, mix(D.n3, D.n1, 0.3));
        R(g, wx - 8, wy + wh + 4, ww + 16, 5, mix(D.n4, D.n2, 0.3)); R(g, wx - 8, wy + wh + 4, ww + 16, 1, D.n5);
        A(g, 0.05, () => poly(g, [[wx, wy + wh + 9], [wx + ww, wy + wh + 9], [wx + ww + 60, 262], [wx + 20, 262]], D.glass));   // moonlight on the wall
        // curtains, breathing
        const br = Math.sin(t * 0.9) * 1.5;
        for (const [cx, dir] of [[wx - 16, 1], [wx + ww - 4, -1]]) {
          const CU = [mix(D.teal[2], D.n2, 0.35), mix(D.teal[2], D.n1, 0.55)];
          poly(g, [[cx, wy - 10], [cx + 20, wy - 10], [cx + 20 + dir * br, wy + wh + 30], [cx + dir * br * 0.4, wy + wh + 30]], CU[0]);
          for (let k = 0; k < 4; k++) R(g, cx + 3 + k * 5, wy - 10, 2, wh + 40, CU[1]);
        }
        R(g, wx - 22, wy - 13, ww + 44, 3, mix(D.n4, D.n2, 0.4));
        // framed print over the sofa: quiet mountains (a hint)
        const fx = 292, fy = 70;
        R(g, fx - 2, fy - 2, 68, 44, mix(WOOD[2], D.n1, 0.3)); R(g, fx, fy, 64, 40, mix(D.paper, D.n3, 0.55));
        poly(g, [[fx + 4, fy + 36], [fx + 22, fy + 13], [fx + 34, fy + 25], [fx + 44, fy + 17], [fx + 60, fy + 36]], mix(D.steel[2], D.n3, 0.4));
        poly(g, [[fx + 18, fy + 18], [fx + 22, fy + 13], [fx + 26, fy + 18]], mix(D.paper, D.n4, 0.4));
        // wall clock without numerals
        const ccx = 222, ccy = 86; disc(g, ccx, ccy, 11, mix(D.n4, D.n2, 0.3)); disc(g, ccx, ccy, 9, mix(D.paper, D.n3, 0.5));
        for (let k = 0; k < 12; k++) dot(g, ccx + Math.cos((k / 12) * TAU) * 8, ccy + Math.sin((k / 12) * TAU) * 8, D.n3);
        const ma = -Math.PI / 2 + t * 0.05, ha = -Math.PI / 2 + 0.9;
        PX.line(g, ccx, ccy, ccx + Math.cos(ha) * 4, ccy + Math.sin(ha) * 4, D.n1); PX.line(g, ccx, ccy, ccx + Math.cos(ma) * 7, ccy + Math.sin(ma) * 7, D.n1);
        const sa = -Math.PI / 2 + Math.floor(t) * (TAU / 60); PX.line(g, ccx, ccy, ccx + Math.cos(sa) * 7, ccy + Math.sin(sa) * 7, mix(D.rust[1], D.n3, 0.3));
      });
      PX.par(g, c, 0.65, () => {
        // bookshelf at the right
        const sx = 520, sy = 58;
        R(g, sx - 4, sy - 4, 92, 200, WOOD[3]); R(g, sx, sy, 84, 192, mix(WOOD[3], D.n0, 0.4));
        for (let s = 0; s < 4; s++) R(g, sx - 4, sy + 46 + s * 48, 92, 4, WOOD[2]);
        for (const [s, bx, w, h, k] of BOOKS) { const by = sy + 46 + s * 48 - h; R(g, sx + 4 + bx, by, w, h, BC[k]); R(g, sx + 4 + bx, by, 1, h, mix(BC[k], D.cream, 0.12)); if (w > 4) R(g, sx + 4 + bx + 1, by + 4, w - 2, 1, mix(BC[k], D.paper, 0.25)); }
        R(g, sx + 56, sy - 14, 14, 10, mix(D.rust[2], D.n2, 0.3));
        for (let i = 0; i < 7; i++) { const a = -Math.PI / 2 + (i - 3) * 0.38 + Math.sin(t * 0.7 + i) * 0.04; thick(g, sx + 63, sy - 14, sx + 63 + Math.cos(a) * 16, sy - 14 + Math.sin(a) * 16, 2, i % 2 ? D.moss[2] : mix(D.moss[2], D.moss[1], 0.4)); }
        // low cabinet at the left with a standby LED
        R(g, 0, 214, 40, 48, mix(WOOD[3], D.n1, 0.2)); R(g, 0, 214, 40, 2, WOOD[2]);
        if (PX.blink(t, 2.6, 0.5)) dot(g, 34, 220, mix(D.rust[1], D.n3, 0.2));
      });
      // ---- floor + rug ----
      R(g, 0, 262, 640, 98, mix(WOOD[3], D.n1, 0.25));
      for (let y = 266, k = 0; y < 360; k++) { R(g, 0, y, 640, 1, mix(WOOD[3], D.n0, 0.35)); y += 6 + k * 3; }
      poly(g, [[170, 274], [470, 274], [560, 360], [80, 360]], mix(D.rust[2], D.n2, 0.55));
      poly(g, [[180, 278], [460, 278], [542, 356], [98, 356]], mix(D.rust[2], D.n2, 0.45));
      for (let k = 0; k < 5; k++) A(g, 0.5, () => PX.line(g, 200 + k * 60, 278, 150 + k * 92, 356, mix(D.rust[2], D.n2, 0.6)));
      // ---- floor lamp ----
      const lampOn = 1 - roomDim * 0.6;
      R(g, LX - 1, LY + 14, 3, 130, mix(D.amber[2], D.n1, 0.4)); R(g, LX - 10, 260, 22, 4, mix(D.amber[2], D.n1, 0.5));
      poly(g, [[LX - 12, LY - 8], [LX + 12, LY - 8], [LX + 17, LY + 14], [LX - 17, LY + 14]], mix(D.paper, D.lampD, 0.4));
      R(g, LX - 16, LY + 13, 33, 2, D.lamp); R(g, LX - 12, LY - 8, 24, 1, mix(D.paper, D.cream, 0.3));
      // ---- sofa ----
      const SO = [mix(D.steel[1], D.n4, 0.45), mix(D.steel[2], D.n2, 0.3), mix(D.steel[2], D.n0, 0.45)];
      A(g, 0.5, () => ell(g, 324, 284, 150, 7, BLK));
      R(g, 196, 162, 256, 76, SO[1]); R(g, 196, 162, 256, 2, SO[0]);
      for (const cx of [200, 326]) { R(g, cx, 168, 122, 64, mix(SO[1], SO[0], 0.12)); R(g, cx, 168, 122, 1, SO[0]); R(g, cx + 121, 170, 1, 60, SO[2]); R(g, cx, 226, 122, 6, SO[2]); for (let k = 0; k < 3; k++) dot(g, cx + 30 + k * 31, 198, SO[2]); }
      R(g, 192, 230, 264, 14, mix(SO[1], SO[0], 0.3)); R(g, 192, 230, 264, 1, SO[0]); R(g, 323, 231, 2, 13, SO[2]);   // seat tops
      R(g, 190, 244, 268, 28, SO[1]); R(g, 190, 244, 268, 1, SO[0]); R(g, 190, 270, 268, 9, SO[2]); R(g, 323, 245, 2, 25, SO[2]);
      for (const ax of [170, 450]) { R(g, ax, 196, 28, 83, SO[1]); ell(g, ax + 14, 198, 14, 5, SO[1]); R(g, ax + 2, 194, 24, 1, SO[0]); R(g, ax + (ax < 300 ? 0 : 25), 202, 3, 77, SO[2]); R(g, ax + (ax < 300 ? 25 : 0), 202, 3, 77, mix(SO[1], SO[2], 0.4)); }
      for (const fx of [194, 450]) R(g, fx, 279, 6, 5, WOOD[3]);
      poly(g, [[204, 206], [230, 200], [234, 230], [206, 234]], mix(D.paperD, D.n3, 0.35)); R(g, 206, 206, 2, 26, mix(D.paperD, D.n4, 0.2));   // cushion
      // ---- characters ----
      const talkF = t >= tB - 0.3 && t < tAd + 0.9 * sc;
      const syl = (s) => Math.sin(s * 11.3) + Math.sin(s * 6.1 + 1.2) > 0.25;
      const fMouth = talkF && syl(t) ? 1 : t > tB + 0.8 && t < tAd ? 2 : 0;
      const yReply = !freeze && t > tB + 1.9 * sc && t < tB + 2.6 * sc;
      const yMouth = freeze ? (t < tAd + 1.0 ? 3 : 0) : yReply && syl(t + 3) ? 1 : t > tB + 0.6 ? 2 : 0;
      const nod = !freeze && t > tB + 1.0 * sc && t < tB + 1.8 * sc ? Math.round(Math.max(0, Math.sin((t - tB - 1.0 * sc) * 8))) : 0;
      const blinkY = !freeze && PX.blink(t + 0.4, 3.1, 0.05), blinkF = PX.blink(t + 1.7, 3.7, 0.05);
      const fTurn = P(t, tAd + 1.3 * sc, 0.6, "io");
      sitFront(g, YX, SY, t, YOU, { look: freeze ? lerp(0.15, 0.8, lookK) : 0.7, tilt: freeze ? lookK * 3 : nod, lean: freeze ? lookK : 0, mouth: yMouth,
        eyes: blinkY ? "closed" : freeze ? (lookK > 0.5 ? "down" : "wide") : "n", gx: 1, brow: freeze && lookK < 0.5 ? 1 : 0, arms: "lap" });
      sitFront(g, FX, SY, t, FRIEND, { look: lerp(-0.7, -0.9, fTurn), mouth: fMouth, eyes: blinkF ? "closed" : fTurn > 0.5 ? "down" : "n", gx: -1,
        arms: talkF && t > tB ? "gesture" : "lap", wave: Math.sin(t * 5) * 2, rim: 1, brow: fTurn > 0.5 ? 1 : 0 });
      // ---- lamp light + room darkness ----
      pool(g, LX - 50, LY + 70, 60, 400, 0.66 + roomDim);
      PX.glow(g, LX, LY + 8, 86 * lampOn, D.lamp, 0.38 * lampOn); PX.glow(g, LX - 70, LY + 100, 180, D.lampD, 0.1 * lampOn);
      A(g, 0.055 * lampOn, () => poly(g, [[LX - 17, LY + 15], [LX + 17, LY + 15], [LX + 60, 262], [LX - 100, 262]], D.lamp));
      PX.particles(g, 5, 18, t, [LX - 80, LY + 16, 130, 120], { vy: -1.2, vx: 0.8, col: D.lamp, a: 0.45 });
      // ---- speech bubble with a boot ----
      const pop = P(t, tB, 0.35, "back"), bubA = clamp(P(t, tB, 0.15, "out"), 0, 1) * (1 - P(t, tAd + 0.1, 0.5, "io"));
      if (bubA > 0.01) {
        const k = clamp(pop, 0, 1.15), bw = Math.round(38 * k), bh = Math.round(28 * k), bx = Math.round(392 - bw / 2), by = Math.round(144 - bh + Math.sin(t * 2));
        if (bw > 6) bubble(g, bx, by, bw, bh, FX + 8, SY - 50, bubA);
        if (pop > 0.85) A(g, bubA, () => boot(g, bx + Math.round(bw / 2) - 7, by + Math.round(bh / 2) - 7, "m"));
      }
      // ---- coffee table (near layer) with the phone ----
      PX.par(g, c, 1.12, () => {
        g.translate(0, -22);
        const T0 = [mix(WOOD[1], D.n2, 0.2), mix(WOOD[2], D.n1, 0.2), WOOD[3]];
        A(g, 0.5, () => R(g, 200, 346, 250, 10, BLK));
        poly(g, [[220, 296], [430, 296], [452, 344], [198, 344]], T0[0]);
        R(g, 198, 344, 254, 8, T0[1]); R(g, 198, 344, 254, 1, mix(T0[0], D.lamp, 0.2)); R(g, 204, 352, 6, 34, T0[2]); R(g, 440, 352, 6, 34, T0[2]); A(g, 0.4, () => R(g, 198, 384, 256, 3, BLK));
        PX.line(g, 220, 296, 430, 296, mix(T0[0], D.lamp, 0.25));
        for (let k = 0; k < 4; k++) A(g, 0.25, () => PX.line(g, 226 - k * 5, 302 + k * 11, 424 + k * 6, 302 + k * 11, T0[1]));   // grain
        poly(g, [[370, 306], [410, 304], [418, 328], [376, 331]], mix(D.paper, D.n4, 0.45)); PX.line(g, 378, 312, 408, 310, mix(D.paper, D.n3, 0.3)); PX.line(g, 380, 316, 400, 315, mix(D.paper, D.n3, 0.3));
        R(g, 246, 310, 12, 13, mix(D.paper, D.n4, 0.25)); R(g, 246, 310, 12, 2, mix(D.paper, D.n4, 0.05)); R(g, 257, 313, 3, 6, mix(D.paper, D.n4, 0.35)); R(g, 248, 310, 8, 1, mix(WOOD[3], D.n0, 0.3));
        for (let k = 0; k < 3; k++) { const st = ((t * 0.5 + k / 3) % 1 + 1) % 1; A(g, 0.22 * (1 - st), () => dot(g, 251 + Math.sin(st * 9 + k) * 2, 307 - st * 18, D.paper)); A(g, 0.15 * (1 - st), () => dot(g, 253 + Math.sin(st * 7 + k * 2) * 2, 305 - st * 16, D.paper)); }
        // the phone
        const cardK = P(t, tAd + 0.15, 0.4, "back");
        phoneFlat(g, PXp, PYp, ad, (gg, sx, sy, sw, sh) => {
          R(gg, sx, sy, sw, sh, mix(D.steel[2], D.n1, 0.3));
          R(gg, sx, sy, sw, 2, mix(D.steel[2], D.n0, 0.3)); dot(gg, sx + 2, sy, D.steel[0]); R(gg, sx + sw - 5, sy, 3, 1, D.steel[0]);
          const cy = sy + 4 + Math.round((1 - clamp(cardK, 0, 1)) * 8);
          if (cardK > 0) {
            R(gg, sx + 1, cy, sw - 2, 24, mix(D.cream, D.glass, 0.3)); R(gg, sx + 1, cy + 23, sw - 2, 1, D.paperD);
            R(gg, sx + 2, cy + 1, sw - 4, 15, mix(D.paper, D.steel[0], 0.35));
            if (cardK > 0.6) boot(gg, sx + 4, cy + 2, "m");
            R(gg, sx + 3, cy + 18, 12, 1, D.n5); R(gg, sx + 3, cy + 20, 8, 1, D.n6);
            R(gg, sx + sw - 7, cy + 18, 4, 3, D.teal[1]);
          }
        });
        if (ad > 0) {
          PX.glow(g, PXp + 13, PYp + 18, 40, D.steel[0], 0.32 * ad);
          A(g, 0.08 * ad, () => ell(g, PXp + 13, PYp + 20, 36, 12, D.glass));
          const pk = P(t, tAd, 0.9, "out"), rr2 = 16 + pk * 24;
          if (pk < 1) A(g, 0.4 * (1 - pk), () => { g.fillStyle = D.glass; for (let i = 0; i < 40; i++) { const a = (i / 40) * TAU; dot(g, PXp + 13 + Math.cos(a) * rr2, PYp + 19 + Math.sin(a) * rr2 * 0.42); } });
        }
      });
      // cool phone light reaching up the faces after the ad
      if (ad > 0) { PX.glow(g, 318, 252, 90, D.steel[1], 0.1 * ad); PX.glow(g, YX + 2, SY - 52, 18, D.steel[0], 0.14 * ad * (0.3 + lookK * 0.7)); }
      PX.vignette(g, 0.55);
    };
  };

  // ---------- shared smooth path sampler (Catmull-Rom through pts, dots every `step` px) ----------
  const samplePath = (pts, step, closed) => {
    const out = [], n = pts.length, get = (i) => pts[closed ? ((i % n) + n) % n : clamp(i, 0, n - 1)];
    const segs = closed ? n : n - 1;
    let carry = 0, px = null, py = null;
    for (let i = 0; i < segs; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      for (let k = 0; k <= 24; k++) {
        const u = k / 24, u2 = u * u, u3 = u2 * u;
        const x = 0.5 * (2 * p1[0] + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3);
        const y = 0.5 * (2 * p1[1] + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3);
        if (px === null) { out.push([x, y]); px = x; py = y; continue; }
        carry += Math.hypot(x - px, y - py); px = x; py = y;
        if (carry >= step) { out.push([x, y]); carry = 0; }
      }
    }
    return out;
  };
  // microphone glyph with a slash, centre (x, y), ~9x13
  const micOff = (g, x, y, col, slash) => {
    x = Math.round(x); y = Math.round(y);
    R(g, x - 2, y - 6, 5, 8, col);
    R(g, x - 1, y - 7, 3, 1, col);
    R(g, x - 4, y - 1, 1, 3, col); R(g, x + 4, y - 1, 1, 3, col); R(g, x - 3, y + 2, 7, 1, col); R(g, x, y + 3, 1, 2, col); R(g, x - 2, y + 5, 5, 1, col);
    if (slash) for (let k = 0; k <= 12; k++) { R(g, x - 6 + k, y - 7 + k, 1, 1, slash); R(g, x - 5 + k, y - 7 + k, 1, 1, D.n0); }
  };

  // ======================= mic_myth =======================
  // dark bedroom: You asleep, a phone on its little stand on the nightstand, glowing faintly. A ghostly ear made of
  // dotted lines gathers over it (o.ear 0.5) ... then the dots drift apart as a "MIC OFF" icon settles on the screen (o.off 3.5)
  K.mic_myth = (o) => {
    const ES = 66, EX = 404 - 33, EY = 84;   // ear box top-left + width
    const sc2 = (arr) => arr.map(([u, v]) => [EX + u * ES, EY + v * ES]);
    const helix = samplePath(sc2([[0.22, 0.3], [0.3, 0.1], [0.52, 0], [0.76, 0.05], [0.92, 0.22], [0.97, 0.45], [0.9, 0.68], [0.76, 0.88], [0.66, 1.05], [0.6, 1.22], [0.48, 1.32], [0.34, 1.3], [0.27, 1.18], [0.27, 1.06]]), 2.8);
    const fold = samplePath(sc2([[0.4, 0.5], [0.33, 0.32], [0.42, 0.16], [0.6, 0.12], [0.78, 0.2], [0.85, 0.4], [0.8, 0.62], [0.68, 0.8]]), 3.4);
    const anti = samplePath(sc2([[0.5, 0.28], [0.66, 0.34], [0.7, 0.52], [0.62, 0.72], [0.5, 0.88], [0.4, 0.98]]), 3.4);
    const concha = samplePath(sc2([[0.4, 0.56], [0.3, 0.66], [0.3, 0.82], [0.4, 0.92], [0.52, 0.9]]), 3.4);
    const tragus = samplePath(sc2([[0.16, 0.68], [0.12, 0.78], [0.18, 0.9]]), 3);
    const antit = samplePath(sc2([[0.36, 1.05], [0.46, 1.0]]), 3);
    const DOTS = [], rr = PX.rnd(23);
    for (const [arr, w] of [[helix, 1], [fold, 0.6], [anti, 0.75], [concha, 0.7], [tragus, 0.8], [antit, 0.7]]) arr.forEach(([x, y], i) => DOTS.push({ x, y, w, ord: (DOTS.length + i * 0) / 1, sx: x + (rr() - 0.5) * 70, sy: y + 40 + rr() * 60, dx: (rr() - 0.5) * 50, dy: -20 - rr() * 40, ph: rr() * TAU, dl: rr() }));
    DOTS.forEach((p, i) => (p.ord = i / DOTS.length));
    const SLATS = 12;
    return (g, t, d, c) => {
      const b = opt(o, d, 6.0), tEar = b("ear", 0.5), tOff = b("off", 3.5);
      const offK = P(t, tOff, 0.6, "back"), offA = P(t, tOff, 0.3, "out");
      // ---- wall ----
      const WALL = mix(D.n1, D.steel[2], 0.2);
      PX.vgrad(g, 0, 0, 640, 270, mix(WALL, D.n2, 0.3), mix(WALL, D.n0, 0.4), 8);
      PX.par(g, c, 0.45, () => {
        // window with blinds; moon sky between the slats
        const wx = 40, wy = 54, ww = 110, wh = 136;
        R(g, wx - 5, wy - 5, ww + 10, wh + 10, mix(D.n3, D.n1, 0.5));
        PX.vgrad(g, wx, wy, ww, wh, mix(D.n1, D.steel[2], 0.6), mix(D.n1, D.steel[2], 0.3), 6);
        disc(g, wx + 30, wy + 30, 8, mix(D.cream, D.glass, 0.5)); PX.glow(g, wx + 30, wy + 30, 30, D.glass, 0.18);
        const sway = Math.sin(t * 0.8) * 0.6;
        for (let i = 0; i < SLATS; i++) { const sy = wy + 4 + i * 11; R(g, wx, sy, ww, 6, mix(D.n3, D.glass, 0.12)); R(g, wx, sy + 5, ww, 1, mix(D.n2, D.n0, 0.3)); R(g, wx, sy, ww, 1, mix(D.n4, D.glass, 0.3)); }
        R(g, wx + 20 + sway, wy, 1, wh, D.n4); R(g, wx + 88 + sway, wy, 1, wh, D.n4);
        R(g, wx - 9, wy + wh + 5, ww + 18, 5, mix(D.n4, D.n2, 0.3));
        // moonlight stripes through the blinds, across the wall
        for (let s2 = 0; s2 < 4; s2++) A(g, (0.075 - s2 * 0.017) + 0.01 * Math.sin(t * 0.8), () => { for (let i = 0; i < SLATS; i++) { const y0 = wy + 9 + i * 11, x0 = wx + ww + 10 + s2 * 45; poly(g, [[x0, y0 + 30 + s2 * 15.75], [x0, y0 + 34 + s2 * 15.75], [x0 + 45, y0 + 49.75 + s2 * 15.75], [x0 + 45, y0 + 45.75 + s2 * 15.75]], D.glass); } });
        // small framed print + shelf with a plant silhouette
        R(g, 220, 66, 44, 56, mix(D.n3, D.n1, 0.4)); R(g, 223, 69, 38, 50, mix(D.n2, D.steel[2], 0.25)); poly(g, [[226, 112], [240, 88], [258, 112]], mix(D.n3, D.steel[2], 0.3));
        R(g, 300, 94, 70, 3, mix(D.n4, D.n2, 0.4)); R(g, 306, 82, 10, 12, mix(D.n3, D.n1, 0.3)); for (let i = 0; i < 5; i++) thick(g, 311, 82, 311 + (i - 2) * 5, 70 + Math.abs(i - 2) * 3, 2, mix(D.moss[2], D.n1, 0.5));
        R(g, 340, 84, 6, 10, mix(D.n3, D.n1, 0.2)); R(g, 348, 86, 8, 8, mix(D.n3, D.n1, 0.35));
      });
      // wardrobe at the right with the hoodie on a hook
      const WD = [mix(WOOD[3], D.n2, 0.3), mix(WOOD[3], D.n0, 0.4)];
      R(g, 486, 40, 132, 232, WD[0]); R(g, 486, 40, 132, 2, mix(WOOD[2], D.n2, 0.3)); R(g, 551, 46, 1, 222, WD[1]); R(g, 486, 266, 132, 6, WD[1]);
      R(g, 543, 150, 2, 14, mix(D.amber[2], D.n2, 0.5)); R(g, 557, 150, 2, 14, mix(D.amber[2], D.n2, 0.5));
      { const HC = [mix(YOU.top[2], D.n1, 0.5), mix(YOU.top[2], D.n0, 0.62)];
        R(g, 505, 72, 3, 4, D.n4); ell(g, 506, 82, 7, 7, HC[0]); ell(g, 506, 83, 4, 4, HC[1]);
        poly(g, [[496, 86], [516, 86], [520, 138], [492, 138]], HC[0]); R(g, 492, 134, 28, 4, HC[1]);
        thick(g, 495, 90, 490, 132, 4, HC[1]); thick(g, 517, 90, 521, 130, 4, HC[1]); PX.line(g, 503, 90, 503, 102, D.n5); PX.line(g, 509, 90, 509, 100, D.n5); }
      // ---- floor ----
      R(g, 0, 270, 640, 90, mix(WOOD[3], D.n0, 0.35));
      for (let y = 274, k = 0; y < 360; k++) { R(g, 0, y, 640, 1, mix(WOOD[3], D.n0, 0.6)); y += 6 + k * 3; }
      poly(g, [[60, 300], [430, 300], [470, 352], [20, 352]], mix(D.n2, D.steel[2], 0.2));
      // ---- bed (You asleep) ----
      const BED = [mix(D.n4, D.steel[2], 0.3), mix(D.n3, D.steel[2], 0.3), mix(D.n2, D.n0, 0.3)];
      A(g, 0.5, () => ell(g, 218, 306, 140, 6, BLK));
      R(g, 92, 176, 12, 126, WOOD[2]); R(g, 92, 176, 12, 2, WOOD[1]); R(g, 104, 196, 4, 42, WOOD[3]);   // headboard
      R(g, 96, 238, 238, 50, BED[2]); R(g, 96, 288, 238, 14, WOOD[2]); R(g, 96, 288, 238, 1, WOOD[1]); R(g, 326, 250, 10, 52, WOOD[2]); R(g, 326, 250, 10, 1, WOOD[1]);
      R(g, 100, 228, 228, 14, mix(D.paper, D.n3, 0.55)); R(g, 100, 242, 228, 46, BED[1]); R(g, 100, 242, 228, 1, mix(D.paper, D.n2, 0.6));   // sheet + mattress side
      // pillow at the left (head end, near the window)
      ell(g, 136, 226, 28, 9, mix(D.paper, D.n3, 0.45)); ell(g, 134, 224, 25, 6, mix(D.paper, D.n3, 0.3));
      // head on the pillow, facing us, asleep
      const hx = 146, hy = 220, YS = YOU.skin, YH = YOU.hair;
      ell(g, hx, hy, 8, 9, YS[1]); R(g, hx - 7, hy - 2, 3, 8, YS[2]);
      ell(g, hx - 3, hy - 6, 10, 5, YH[1]); R(g, hx - 12, hy - 6, 7, 12, YH[1]); for (let k = 0; k < 4; k++) R(g, hx - 6 + k * 3, hy - 3, 3, 1 + (k % 2), YH[1]);
      for (const [px, py] of [[-6, -9], [-2, -10], [2, -9]]) dot(g, hx + px, hy + py, YH[0]);
      R(g, hx - 1, hy + 1, 3, 1, D.n0); R(g, hx + 4, hy + 1, 3, 1, D.n0); R(g, hx + 2, hy + 3, 1, 2, YS[2]); R(g, hx + 1, hy + 6, 3, 1, mix(YS[2], D.rust[2], 0.4));
      // blanket, breathing
      const br = Math.sin(t * 1.25) * 1.5;
      const BL = [mix(D.teal[1], D.n4, 0.6), mix(D.teal[2], D.n3, 0.55), mix(D.teal[2], D.n0, 0.5)];
      poly(g, [[156, 236], [188, 216 - br], [240, 212 - br], [290, 220 - br * 0.6], [330, 228], [332, 290], [146, 290]], BL[1]);
      poly(g, [[156, 236], [188, 216 - br], [240, 212 - br], [290, 220 - br * 0.6], [330, 228], [330, 232], [290, 225 - br * 0.6], [240, 217 - br], [188, 221 - br], [160, 240]], BL[0]);
      R(g, 146, 284, 186, 6, BL[2]); for (let k = 0; k < 3; k++) PX.line(g, 200 + k * 44, 222 - br, 190 + k * 46, 286, BL[2]);
      R(g, 156, 230, 18, 6, mix(D.paper, D.n3, 0.4));   // folded sheet edge
      R(g, 172, 232, 8, 4, YS[1]); dot(g, 172, 232, YS[0]);   // a hand out of the covers
      // sleep: slow little "z" puffs, very faint
      for (let k = 0; k < 2; k++) { const zt = (((t * 0.35 + k * 0.5) % 1) + 1) % 1; A(g, 0.25 * Math.sin(zt * Math.PI), () => { const zx = hx + 14 + zt * 12, zy = hy - 14 - zt * 16; R(g, zx, zy, 4, 1, D.n6); R(g, zx + 2, zy + 1, 1, 1, D.n6); R(g, zx + 1, zy + 2, 1, 1, D.n6); R(g, zx, zy + 3, 4, 1, D.n6); }); }
      // moonlight stripes across the bed
      A(g, 0.07, () => { for (let i = 0; i < 5; i++) poly(g, [[110 + i * 34, 226], [124 + i * 34, 226], [150 + i * 34, 300], [136 + i * 34, 300]], D.glass); });
      // ---- nightstand (near) with lamp (off), glass of water, phone on its stand ----
      const NX = 352, NY = 238, PHX = 404, PHY = 186;
      A(g, 0.5, () => R(g, NX + 4, 318, 108, 6, BLK));
      R(g, NX, NY, 108, 80, WOOD[2]); R(g, NX - 3, NY - 6, 114, 7, WOOD[1]); R(g, NX - 3, NY - 6, 114, 1, WOOD[0]);
      R(g, NX + 6, NY + 10, 96, 26, WOOD[3]); R(g, NX + 6, NY + 10, 96, 1, mix(WOOD[2], D.glass, 0.1)); R(g, NX + 50, NY + 21, 8, 3, mix(D.amber[2], D.n2, 0.4));
      R(g, NX + 6, NY + 42, 96, 30, WOOD[3]); R(g, NX + 50, NY + 55, 8, 3, mix(D.amber[2], D.n2, 0.4)); R(g, NX + 4, NY + 78, 6, 8, WOOD[3]); R(g, NX + 98, NY + 78, 6, 8, WOOD[3]);
      // lamp (off)
      R(g, NX + 12, NY - 10, 14, 4, D.n3); R(g, NX + 18, NY - 36, 2, 26, D.n4); poly(g, [[NX + 8, NY - 52], [NX + 30, NY - 52], [NX + 34, NY - 34], [NX + 4, NY - 34]], mix(D.paper, D.n3, 0.6));
      // glass of water catching the moon
      R(g, NX + 84, NY - 22, 9, 16, mix(D.glass, D.n2, 0.65)); R(g, NX + 84, NY - 14, 9, 8, mix(D.teal[2], D.n2, 0.4)); R(g, NX + 85, NY - 21, 1, 14, mix(D.glass, D.cream, 0.3)); R(g, NX + 84, NY - 22, 9, 1, D.glass);
      // phone stand + phone (screen tilted toward us)
      R(g, PHX - 10, NY - 10, 24, 4, D.n2); R(g, PHX - 10, NY - 10, 24, 1, D.n4); poly(g, [[PHX - 2, NY - 10], [PHX + 6, NY - 10], [PHX + 8, NY - 16], [PHX, NY - 16]], D.n3);
      const listen = clamp((t - tEar) / 1.2, 0, 1) * (1 - offA);
      R(g, PHX - 12, PHY, 26, 46, D.n1); R(g, PHX - 11, PHY, 24, 1, D.n4); R(g, PHX + 13, PHY + 1, 1, 44, D.n3);
      const scr = mix(D.n0, D.steel[2], 0.3 + 0.1 * listen + 0.12 * offA);
      R(g, PHX - 10, PHY + 4, 22, 38, scr); R(g, PHX - 2, PHY + 1, 6, 1, D.n3);
      A(g, 0.3 * (1 - offA * 0.6), () => { R(g, PHX - 6, PHY + 9, 14, 2, D.steel[0]); R(g, PHX - 3, PHY + 13, 8, 1, D.steel[0]); });   // faint lock screen
      if (offA > 0) {
        const my = PHY + 26 - Math.round((1 - clamp(offK, 0, 1.2)) * 8);
        A(g, offA, () => { disc(g, PHX + 1, my, 9, mix(D.steel[2], D.n1, 0.15)); micOff(g, PHX + 1, my, D.cream, D.rust[0]); });
      }
      // phone glow on the stand top, the wall, the glass
      PX.glow(g, PHX + 1, PHY + 22, 36 + 10 * offA, D.steel[0], 0.16 + 0.08 * listen + 0.1 * offA);
      A(g, 0.06 + 0.04 * offA, () => ell(g, PHX + 1, NY - 4, 34, 4, D.glass));
      // listening rings from the phone, while the ear is there
      if (listen > 0) for (let k = 0; k < 3; k++) { const ph = (((t * 0.6 + k / 3) % 1) + 1) % 1, rr2 = 8 + ph * 26; A(g, 0.22 * listen * (1 - ph), () => { g.fillStyle = D.glass; for (let i = 0; i < 18; i++) { const a = -Math.PI * 0.85 + (i / 17) * Math.PI * 0.7; dot(g, PHX + 1 + Math.cos(a) * rr2, PHY + 2 + Math.sin(a) * rr2 * 0.8); } }); }
      // ---- the dotted ear ----
      for (const p of DOTS) {
        const kin = P(t, tEar + p.ord * 1.3, 0.7, "out");
        if (kin <= 0) continue;
        const kout = P(t, tOff + p.dl * 0.5, 1.4, "out");
        const x = lerp(p.sx, p.x, kin) + p.dx * kout + Math.sin(t * 1.3 + p.ph) * 0.6, y = lerp(p.sy, p.y, kin) + p.dy * kout;
        const a = kin * (1 - kout) * (0.65 + 0.35 * Math.sin(t * 2.2 + p.ph));
        if (a <= 0.01) continue;
        A(g, a * p.w, () => { R(g, x, y, 1, 1, D.glass); });
        A(g, a * 0.25 * p.w, () => { R(g, x - 1, y, 3, 1, D.steel[0]); R(g, x, y - 1, 1, 3, D.steel[0]); });
      }
      const earA = clamp((t - tEar) / 1.0, 0, 1) * (1 - P(t, tOff, 1.2, "out"));
      if (earA > 0) PX.glow(g, EX + ES * 0.55, EY + ES * 0.65, 60, D.steel[1], 0.08 * earA);
      // ---- darkness + moon + vignette ----
      pool(g, 360, 200, 90, 420, 0.5);
      PX.particles(g, 31, 14, t, [170, 60, 220, 160], { vy: -0.8, vx: 0.6, col: D.glass, a: 0.25 });
      // near layer: chair back silhouette at the right edge
      PX.par(g, c, 1.18, () => { R(g, 626, 0, 14, 360, mix(D.n0, D.n1, 0.5)); R(g, 626, 0, 1, 360, mix(D.n2, D.steel[2], 0.3)); });
      if (offA > 0) lab(g, "MIC OFF", PHX + 1, PHY - 18 - Math.round((1 - clamp(offK, 0, 1)) * 4), D.cream, 8);
      PX.vignette(g, 0.58);
    };
  };

  // ======================= phone_wall =======================
  // university lab at night: racks of generic phones flicking through apps; a researcher at a monitor of traffic graphs.
  // o.count (1.0) the racks wake in a wave + "17,000+ APPS"; o.zero (6.0) monitor row "MIC IN SECRET: 0";
  // o.zero2 (8.5) row "AUDIO SENT: 0"
  K.phone_wall = (o) => {
    const RACKS = [26, 140, 254], RW = 104, RY = 58, SH = 7, PER = 7;
    const ICON = [D.teal[1], D.moss[1], D.steel[1], mix(D.amber[1], D.n3, 0.35), mix(D.rust[1], D.n3, 0.3), D.paper, D.teal[0], mix(D.plum[1], D.n3, 0.2)];
    const r = PX.rnd(77), PH = [];
    RACKS.forEach((rx, ri) => { for (let s = 0; s < SH; s++) for (let i = 0; i < PER; i++) PH.push({ x: rx + 8 + i * 13.5, y: RY + 10 + s * 32, ri, s, i, ph: r(), rate: 0.7 + r() * 1.6, seed: Math.floor(r() * 1e6), led: r() }); });
    const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return (h ^ (h >>> 16)) >>> 0; };
    const TRAF = [...Array(64)].map(() => 0.25 + r() * 0.75);
    return (g, t, d, c) => {
      const b = opt(o, d, 12.0), tC = b("count", 1.0), tZ = b("zero", 6.0), tZ2 = b("zero2", 8.5);
      // ---- room ----
      PX.vgrad(g, 0, 0, 640, 300, mix(D.n1, D.steel[2], 0.22), D.n0, 8);
      PX.par(g, c, 0.35, () => {
        // far racks receding in the dark, with slow LEDs
        for (let k = 0; k < 7; k++) { const x = 18 + k * 90, h = 150; R(g, x, 100, 70, h, mix(D.n1, D.steel[2], 0.12)); for (let j = 0; j < 10; j++) if (PX.blink(t + k * 0.37 + j * 0.61, 2.2 + (j % 3) * 0.7, 0.5)) dot(g, x + 6 + (j % 5) * 12, 108 + Math.floor(j / 5) * 70 + (k % 2) * 30, mix(D.teal[1], D.n2, 0.4)); }
        // ceiling light strips (off) + a high window band of night
        for (let k = 0; k < 4; k++) { R(g, 40 + k * 160, 14, 100, 3, mix(D.n3, D.steel[2], 0.2)); R(g, 40 + k * 160, 17, 100, 1, D.n1); }
        R(g, 0, 30, 640, 2, mix(D.n2, D.steel[2], 0.3));
      });
      PX.par(g, c, 0.7, () => {
        // cable tray above the racks
        R(g, 10, 44, 360, 6, D.n2); R(g, 10, 44, 360, 1, D.n4);
        for (let k = 0; k < 9; k++) { const x0 = 30 + k * 38; for (let y = 50; y < 58; y++) dot(g, x0 + Math.sin(y * 0.5 + k) * 1.5, y, mix(D.n3, D.n1, 0.3)); }
      });
      PX.par(g, c, 0.6, () => {
        // whiteboard on the right wall: marker sketches of a phone and arrows, no numbers
        const WX = 380, WY = 40;
        R(g, WX - 2, WY - 2, 224, 76, D.n3); R(g, WX, WY, 220, 72, mix(D.paper, D.n2, 0.8)); R(g, WX, WY + 72, 220, 3, D.n4);
        const MK = mix(D.steel[1], D.n3, 0.55), MK2 = mix(D.rust[1], D.n3, 0.6);
        PX.box(g, WX + 14, WY + 12, 16, 28, MK); R(g, WX + 19, WY + 36, 6, 1, MK);
        PX.line(g, WX + 34, WY + 22, WX + 70, WY + 22, MK); PX.line(g, WX + 66, WY + 19, WX + 70, WY + 22, MK); PX.line(g, WX + 66, WY + 25, WX + 70, WY + 22, MK);
        ell(g, WX + 92, WY + 24, 14, 9, null); PX.box(g, WX + 76, WY + 14, 32, 20, MK);
        for (let k = 0; k < 4; k++) PX.line(g, WX + 122, WY + 12 + k * 8, WX + 150 + (k % 2) * 14, WY + 12 + k * 8, MK);
        PX.line(g, WX + 22, WY + 46, WX + 22, WY + 60, MK2); PX.line(g, WX + 14, WY + 52, WX + 30, WY + 52, MK2);
        for (let k = 0; k < 3; k++) PX.line(g, WX + 40, WY + 48 + k * 7, WX + 96 - k * 12, WY + 48 + k * 7, MK);
        PX.box(g, WX + 170, WY + 40, 36, 22, MK); PX.line(g, WX + 172, WY + 58, WX + 204, WY + 58, MK2);
      });
      // floor
      R(g, 0, 300, 640, 60, mix(D.n1, D.steel[2], 0.15)); for (let y = 304, k = 0; y < 360; k++) { R(g, 0, y, 640, 1, D.n0); y += 5 + k * 3; }
      // ---- the racks of phones ----
      const wake = (p) => P(t, tC + (p.x / 380) * 0.9 + p.s * 0.04, 0.25, "out");
      RACKS.forEach((rx) => {
        A(g, 0.5, () => R(g, rx - 2, RY + SH * 32 + 8, RW + 8, 6, BLK));
        R(g, rx - 4, RY - 4, RW + 8, SH * 32 + 12, D.n2); R(g, rx - 4, RY - 4, RW + 8, 1, D.n4);
        R(g, rx - 4, RY - 4, 4, SH * 32 + 12, mix(D.n3, D.steel[2], 0.2)); R(g, rx + RW, RY - 4, 4, SH * 32 + 12, mix(D.n3, D.steel[2], 0.2)); R(g, rx - 4, RY - 4, 1, SH * 32 + 12, D.n5);
        R(g, rx, RY, RW, SH * 32 + 4, mix(D.n0, D.n1, 0.6));
        for (let s = 0; s < SH; s++) { const sy = RY + 30 + s * 32; R(g, rx, sy, RW, 3, D.n3); R(g, rx, sy, RW, 1, D.n5); }
      });
      for (const p of PH) {
        const x = Math.round(p.x), y = p.y, wk = wake(p);
        // cradle + cable
        R(g, x - 1, y + 17, 12, 3, D.n3); R(g, x + 4, y + 20, 2, 2, D.n4);
        R(g, x, y, 10, 18, D.n1); R(g, x, y, 10, 1, D.n4);
        const scr = mix(D.n0, D.steel[2], 0.15 + 0.25 * wk);
        R(g, x + 1, y + 2, 8, 14, scr);
        if (wk > 0) A(g, wk, () => {
          const step = Math.floor(t * p.rate + p.ph * 10), h = hash(p.seed, step);
          if (h % 5 === 0) {   // an app open: top bar + block
            const col = ICON[(h >>> 3) % ICON.length];
            R(g, x + 1, y + 2, 8, 2, mix(col, D.n1, 0.2)); R(g, x + 2, y + 5, 6, 5, mix(col, D.n2, 0.55)); R(g, x + 2, y + 11, 6, 1, D.n5); R(g, x + 2, y + 13, 4, 1, D.n5);
          } else {             // home screen grid of icons
            for (let k = 0; k < 6; k++) { const col = ICON[((h >>> (k * 3)) + k) % ICON.length]; R(g, x + 2 + (k % 2) * 4, y + 3 + Math.floor(k / 2) * 4, 2, 2, mix(col, D.n2, 0.15)); }
          }
          if (PX.blink(t + p.led * 5, 1.7 + p.led, 0.12)) dot(g, x + 8, y + 1, D.moss[0]);   // tiny network LED
        });
      }
      // rack glow
      const wk0 = P(t, tC, 1.2, "out");
      RACKS.forEach((rx) => PX.glow(g, rx + RW / 2, RY + 120, 120, D.teal[2], 0.22 * wk0));
      // cables down to the floor
      RACKS.forEach((rx, ri) => { for (let k = 0; k < 3; k++) { const x0 = rx + 16 + k * 34; for (let y = RY + SH * 32 + 10; y < 306; y++) dot(g, x0 + Math.sin(y * 0.15 + k * 2 + ri) * 4, y, mix(D.n2, D.n0, 0.45)); } });
      // the test harness steps through the phones one by one
      const scanT = t - tC - 1.2;
      if (scanT > 0) { const n = PH.length, i0 = Math.floor(scanT * 7); for (let k = 0; k < 3; k++) { const p = PH[(((i0 - k) % n) + n) % n]; A(g, (1 - k * 0.35) * clamp(scanT * 2, 0, 1), () => PX.box(g, Math.round(p.x) - 2, p.y - 2, 14, 22, D.cream)); } }
      // ---- the desk (near), shifted left to sit inside the safe area ----
      g.save(); g.translate(-30, 0);
      const DX = 372, DY = 262;
      // office chair behind the researcher
      R(g, 398, 214, 8, 46, D.n2); R(g, 396, 212, 12, 4, D.n3); R(g, 382, 268, 46, 5, D.n2); R(g, 403, 273, 3, 26, D.n3); R(g, 388, 298, 34, 3, D.n2);
      // researcher (sits facing the monitor)
      const zK = P(t, tZ, 0.6, "io"), z2K = P(t, tZ2, 0.6, "io");
      const lean = -2 * zK + 1 * z2K, typing = t < tZ - 0.3 || (t > tZ + 1.2 && t < tZ2 - 0.3);
      const kx = 452 + (typing ? Math.round(Math.sin(t * 13)) : 0);
      side(g, 412, 300, t, RESEARCHER, { sit: 40, lean, reach: [kx, 256 + (typing ? Math.round(Math.sin(t * 17)) : 0)], eyes: PX.blink(t + 0.8, 3.4, 0.05) ? "closed" : zK > 0.1 && zK < 0.95 && t < tZ + 1.5 ? "wide" : "n", brow: (t > tZ && t < tZ + 2) || (t > tZ2 && t < tZ2 + 2) ? 1 : 0, mouth: t > tZ2 + 0.8 ? 2 : 0 });
      // desk
      A(g, 0.5, () => R(g, DX, DY + 4, 268, 6, BLK));
      R(g, DX, DY, 268, 6, mix(D.n3, D.steel[2], 0.2)); R(g, DX, DY, 268, 1, D.n5); R(g, DX, DY + 6, 268, 2, D.n1);
      R(g, DX + 8, DY + 6, 4, 46, D.n3); R(g, DX + 8, DY + 6, 1, 46, D.n4); R(g, 626, DY + 6, 4, 46, D.n3);
      // PC tower under the desk, its LED breathing
      R(g, 566, 270, 30, 44, D.n2); R(g, 566, 270, 30, 1, D.n4); R(g, 570, 276, 22, 1, D.n3); R(g, 570, 279, 22, 1, D.n3);
      A(g, 0.4 + 0.4 * Math.sin(t * 1.4), () => R(g, 589, 302, 2, 2, D.teal[0]));
      for (let y = 314; y < 330; y++) dot(g, 580 + Math.sin(y * 0.4) * 2, y, D.n1);
      // keyboard, mug, notebook, a phone on a test cradle
      R(g, 438, DY - 3, 40, 3, D.n4); R(g, 438, DY - 3, 40, 1, D.n6); for (let k = 0; k < 9; k++) dot(g, 441 + k * 4, DY - 2, D.n2);
      R(g, 596, DY - 12, 10, 12, mix(D.paper, D.n4, 0.4)); R(g, 605, DY - 9, 3, 5, mix(D.paper, D.n4, 0.5)); R(g, 596, DY - 12, 10, 1, mix(D.paper, D.n3, 0.2));
      R(g, 486, DY - 2, 26, 2, mix(D.paper, D.n4, 0.35)); R(g, 486, DY - 2, 26, 1, mix(D.paper, D.n3, 0.2));
      R(g, 560, DY - 20, 12, 20, D.n1); R(g, 561, DY - 18, 10, 14, mix(D.steel[2], D.n1, 0.3)); R(g, 558, DY - 2, 16, 2, D.n3);
      // monitor
      const MX = 440, MY = 128, MW = 168, MH = 112;
      R(g, MX + MW / 2 - 4, MY + MH, 8, DY - MY - MH, D.n3); R(g, MX + MW / 2 - 18, DY - 3, 36, 3, D.n3);
      R(g, MX - 4, MY - 4, MW + 8, MH + 8, D.n1); R(g, MX - 4, MY - 4, MW + 8, 1, D.n4);
      R(g, MX, MY, MW, MH, mix(D.n0, D.teal[2], 0.2));
      g.save(); g.beginPath(); g.rect(MX, MY, MW, MH); g.clip();
      // panel 1: live traffic, scrolling bars (outgoing data)
      R(g, MX + 4, MY + 4, MW - 8, 2, mix(D.teal[2], D.n2, 0.4)); R(g, MX + 4, MY + 4, Math.round((MW - 8) * clamp((t - tC) / (d * 0.9), 0, 1)), 2, D.teal[0]);
      const gy = MY + 46, scroll = t * 6;
      for (let i = 0; i < 40; i++) {
        const x = MX + 6 + i * 4 - (((scroll % 4) + 4) % 4), v = TRAF[(((Math.floor(scroll / 4) + i) % 64) + 64) % 64], h = Math.round(v * 34 * (0.4 + 0.6 * wk0));
        R(g, x, gy - h, 3, h, mix(D.teal[1], D.n2, 0.25)); R(g, x, gy - h, 3, 1, D.teal[0]);
      }
      R(g, MX + 4, gy + 1, MW - 8, 1, D.n4);
      // grid lines
      for (let k = 1; k < 4; k++) A(g, 0.3, () => R(g, MX + 4, gy - k * 10, MW - 8, 1, D.n3));
      // rows: what the apps sent out
      const row = (y, label, tz) => {
        const k = P(t, tz, 0.3, "out"); if (k <= 0) return;
        A(g, k, () => {
          R(g, MX + 4, y - 2, MW - 8, 17, mix(D.n1, D.teal[2], 0.25 + 0.15 * Math.max(0, 1 - (t - tz) / 1.5)));
          const s = PX.typed(label, t, tz, 30);
          const w = PX.text(g, s, MX + 8, y - 1, { font: "v", size: 16, col: D.cream });
          if (s.length === label.length) { const zk = P(t, tz + 0.5, 0.3, "back"); PX.text(g, "0", MX + 12 + w, y - 1 - Math.round((1 - clamp(zk, 0, 1)) * 3), { font: "v", size: 16, col: D.moss[0] }); PX.glow(g, MX + 16 + w, y + 6, 10, D.moss[1], 0.25); }
          // a dead-flat line at the right of the row
          if (s.length === label.length) { R(g, MX + MW - 46, y + 7, 38, 1, D.moss[1]); if (PX.blink(t, 1, 0.5)) dot(g, MX + MW - 8, y + 7, D.moss[0]); }
        });
      };
      row(MY + 58, "MIC IN SECRET:", tZ); row(MY + 82, "AUDIO SENT:", tZ2);
      for (let yy = MY; yy < MY + MH; yy += 2) A(g, 0.1, () => R(g, MX, yy, MW, 1, BLK));
      A(g, 0.05, () => poly(g, [[MX, MY], [MX + 40, MY], [MX, MY + 50]], D.cream));
      g.restore();
      PX.glow(g, MX + MW / 2, MY + MH / 2, 120, D.teal[1], 0.12);
      // the researcher's face lit by the monitor
      PX.glow(g, 424, 244, 26, D.glass, 0.12);
      // small warm desk lamp at the right edge
      R(g, 622, DY - 4, 14, 4, D.n3); thick(g, 628, DY - 4, 620, DY - 36, 2, D.n4); thick(g, 620, DY - 36, 606, DY - 44, 2, D.n4);
      poly(g, [[598, DY - 48], [612, DY - 48], [616, DY - 38], [596, DY - 38]], mix(D.n5, D.lampD, 0.3)); R(g, 597, DY - 38, 18, 1, D.lamp);
      A(g, 0.07, () => poly(g, [[597, DY - 37], [615, DY - 37], [630, DY], [570, DY]], D.lamp));
      PX.glow(g, 606, DY - 20, 50, D.lamp, 0.22);
      g.restore();
      // ---- light + labels ----
      pool(g, 320, 190, 140, 440, 0.5);
      PX.particles(g, 19, 22, t, [20, 40, 360, 260], { vy: -1, vx: 0.4, col: D.glass, a: 0.18 });
      const cK = P(t, tC + 0.3, 0.5, "out");
      if (cK > 0) A(g, cK, () => lab(g, "17,000+ APPS", 196, 46 - Math.round((1 - cK) * 4), D.cream, 20, "v"));
      PX.vignette(g, 0.55);
    };
  };

  // ---------- action crumbs: 7x7 icons ----------
  const CRUMB = {
    tap: [".ccccc.", "c.....c", "c..c..c", "c.ccc.c", "c..c..c", "c.....c", ".ccccc."],
    scroll: ["...c...", "..ccc..", ".c.c.c.", "...c...", ".c.c.c.", "..ccc..", "...c..."],
    pause: [".cc.cc.", ".cc.cc.", ".cc.cc.", ".cc.cc.", ".cc.cc.", ".cc.cc.", "......."],
    pin: ["..ccc..", ".c...c.", ".c.c.c.", ".c...c.", "..c.c..", "..c.c..", "...c..."],
    wifi: [".ccccc.", "c.....c", "..ccc..", ".c...c.", "...c...", "..ccc..", "...c..."],
  };
  const crumb = (g, kind, x, y, col) => PX.sprite(g, CRUMB[kind] || CRUMB.tap, Math.round(x) - 3, Math.round(y) - 3, { c: col });

  // ======================= crumbs =======================
  // You walk a rainy night street, phone in hand. Every action (tap, scroll, pause, location, wifi) leaves a tiny glowing
  // crumb that drifts up toward a distant data-centre tower on a hill. o.out (6.0): the tower answers with one beam that
  // lands as a small boot card on You's phone (You stops and looks). o.acts = [[t, kind], ...] to override the crumbs.
  K.crumbs = (o) => {
    const r = PX.rnd(41), DROPS = [...Array(150)].map(() => [r() * 700, r() * 380, 0.6 + r() * 0.8, r()]);
    const BLD = []; { let x = 0; while (x < 1400) { const w = 34 + Math.floor(r() * 46), h = 34 + Math.floor(r() * 66); BLD.push([x, w, h, Math.floor(r() * 1e6)]); x += w + 2 + Math.floor(r() * 8); } }
    const ACTS = o.acts || [[0.4, "tap"], [1.25, "scroll"], [2.1, "pause"], [2.9, "pin"], [3.7, "wifi"], [4.5, "tap"], [5.2, "scroll"]];
    const TX = 534, TY = 84;   // tower top (screen)
    const YX = 236, YFeet = 288, YN = shade(YOU, 0.32, D.steel[2], 0.25);
    return (g, t, d, c) => {
      const sc = d / 9.0, b = opt(o, d, 9.0), tOut = b("out", 6.0);
      // walking distance: steady, then easing to a stop just after the answer
      const SPD = 22, u = clamp((t - tOut) / 0.9, 0, 1), dist = SPD * (t < tOut ? t : tOut + 0.9 * (u - (u * u) / 2));
      const walking = t < tOut + 0.9;
      // ---- sky + far hill with the data centre ----
      PX.vgrad(g, 0, 0, 640, 230, mix(D.n0, D.steel[2], 0.18), mix(D.n1, D.steel[2], 0.45), 8);
      A(g, 0.25, () => { for (let k = 0; k < 4; k++) ell(g, ((120 + k * 190 - dist * 0.05) % 760 + 760) % 760 - 60, 40 + k * 13, 70, 6, mix(D.n2, D.steel[2], 0.35)); });
      PX.par(g, c, 0.25, () => {
        // horizon city glow at the left
        for (let i = 0; i < 40; i++) { const x = (i * 37 + 11) % 360, y = 200 + ((i * 13) % 20); dot(g, x, y, i % 3 ? mix(D.lamp, D.n2, 0.5) : mix(D.glass, D.n2, 0.5)); }
        // hill
        poly(g, [[330, 232], [430, 176], [500, 152], [560, 150], [640, 170], [640, 232]], mix(D.n1, D.steel[2], 0.25));
        poly(g, [[380, 232], [460, 190], [540, 172], [640, 186], [640, 232]], mix(D.n1, D.n0, 0.4));
        // the data-centre: a tall block, rows of lit slits, a mast
        const bx = TX - 16;
        PX.glow(g, TX, 124, 80, D.teal[2], 0.42);
        R(g, bx, 96, 32, 62, mix(D.n1, D.steel[2], 0.3)); R(g, bx, 96, 32, 1, mix(D.n4, D.steel[2], 0.4)); R(g, bx + 31, 97, 1, 61, mix(D.n0, D.n1, 0.5));
        R(g, bx - 14, 128, 14, 30, mix(D.n1, D.steel[2], 0.22)); R(g, bx + 32, 134, 18, 24, mix(D.n1, D.steel[2], 0.22));
        for (let row = 0; row < 8; row++) for (let k = 0; k < 4; k++) { const on = PX.blink(t * 0.6 + row * 0.37 + k * 0.71, 3.1 + ((row + k) % 3) * 0.6, 0.8); R(g, bx + 3 + k * 7, 100 + row * 7, 5, 2, on ? mix(D.teal[0], D.n2, 0.25) : mix(D.teal[2], D.n1, 0.4)); }
        for (let k = 0; k < 3; k++) R(g, bx - 11 + k * 4, 132, 2, 2, mix(D.teal[1], D.n2, 0.4));
        R(g, bx + 6, 90, 8, 6, D.n2); R(g, bx + 18, 91, 8, 5, D.n2);   // roof units
        R(g, TX - 1, TY - 30, 2, 36, mix(D.n3, D.steel[2], 0.3)); PX.line(g, TX - 6, TY - 18, TX, TY - 30, D.n3); PX.line(g, TX + 6, TY - 18, TX, TY - 30, D.n3);
        if (PX.blink(t, 2.4, 0.3)) { dot(g, TX, TY - 31, D.rust[0]); PX.glow(g, TX, TY - 31, 6, D.rust[1], 0.5); }
      });
      // ---- mid street buildings (scroll slower) ----
      const mid = dist * 0.42;
      for (const [x0, w, h, sd] of BLD) {
        const x = ((x0 - mid) % 1400 + 1400) % 1400 - 120; if (x > 660 || x + w < -20) continue;
        const top = 262 - h, col = mix(D.n1, D.n2, (sd % 7) / 14);
        R(g, x, top, w, h, col); R(g, x, top, w, 1, mix(col, D.n4, 0.4));
        const wr = PX.rnd(sd);
        for (let yy = top + 8; yy < 250; yy += 11) for (let xx = x + 5; xx < x + w - 6; xx += 9) { const v = wr(); if (v < 0.16) R(g, xx, yy, 4, 5, mix(D.lamp, D.n2, 0.3 + v)); else if (v < 0.2) R(g, xx, yy, 4, 5, mix(D.steel[0], D.n2, PX.blink(t + sd % 10, 1.3, 0.6) ? 0.45 : 0.6)); else R(g, xx, yy, 4, 5, mix(col, D.n0, 0.25)); }
        if (sd % 3 === 0) { R(g, x + 6, 248, w - 12, 14, mix(D.lampD, D.n1, 0.72)); R(g, x + 6, 248, w - 12, 1, mix(D.lamp, D.n2, 0.55)); for (let xx = x + 14; xx < x + w - 8; xx += 9) R(g, xx, 249, 1, 13, mix(col, D.n0, 0.3)); R(g, x + 4, 245, w - 8, 3, mix(col, D.n4, 0.3)); }   // a shop front, closed, dim inside
        if (sd % 4 === 1) { R(g, x + w - 14, top - 7, 8, 7, mix(col, D.n0, 0.2)); R(g, x + w - 12, top - 9, 4, 2, mix(col, D.n0, 0.2)); }   // roof tank
      }
      // ---- sidewalk + road ----
      R(g, 0, 262, 640, 28, mix(D.n2, D.steel[2], 0.15)); R(g, 0, 262, 640, 1, D.n4);
      for (let k = -1; k < 14; k++) { const x = Math.round(k * 52 - (dist % 52)); R(g, x, 263, 1, 27, mix(D.n1, D.steel[2], 0.1)); }
      R(g, 0, 290, 640, 4, D.n4); R(g, 0, 290, 640, 1, D.n5);
      R(g, 0, 294, 640, 66, mix(D.n0, D.steel[2], 0.12));
      for (let k = -1; k < 8; k++) { const x = Math.round(k * 110 - ((dist * 1.15) % 110)); R(g, x, 330, 40, 2, mix(D.n3, D.n1, 0.3)); }
      // ---- lamp posts with warm cones (scroll with the street) ----
      const LP = 230, lamps = [];
      for (let k = -1; k < 4; k++) { const x = Math.round(k * LP + 120 - (((dist % LP) + LP) % LP)); lamps.push(x); }
      for (const x of lamps) {
        A(g, 0.08, () => poly(g, [[x + 10, 158], [x + 18, 158], [x + 52, 290], [x - 26, 290]], D.lamp));
        A(g, 0.12, () => ell(g, x + 14, 278, 34, 6, D.lamp));
        // reflection in the wet road
        for (let y = 296; y < 356; y += 2) A(g, 0.22 * (1 - (y - 296) / 60), () => R(g, x + 11 + Math.round(Math.sin(y * 0.7 + t * 3) * 1.5), y, 5, 1, D.lampD));
      }
      // ---- You (walking, phone up) ----
      const ph = (t < tOut ? t : tOut + 0.9 * (u - (u * u) / 2)) * 7.2;
      A(g, 0.45, () => ell(g, YX + 2, YFeet + 1, 14, 2, BLK));
      const look = P(t, tOut + 0.35, 0.5, "io");
      const yo = side(g, YX, YFeet, t, YN, { walk: walking ? ph : undefined, phone: 1, eyes: PX.blink(t + 0.3, 3.3, 0.05) ? "closed" : look > 0.2 && look < 1 && t < tOut + 1.6 ? "wide" : "down", brow: look > 0.2 && t < tOut + 1.6 ? 1 : 0,
        screenCol: mix(D.steel[0], D.n2, 0.2) });
      const PHX = yo.sx, PHY = yo.sy;
      PX.glow(g, PHX, PHY, 22, D.steel[0], 0.28); PX.glow(g, yo.hx + 4, yo.hy + 2, 14, D.steel[0], 0.14);
      // ---- lamp heads (in front of the street, behind the rain) ----
      for (const x of lamps) {
        R(g, x, 156, 3, 134, mix(D.n3, D.n1, 0.2)); R(g, x, 156, 1, 134, D.n4); R(g, x - 3, 286, 9, 4, D.n2);
        R(g, x, 154, 18, 3, D.n3); R(g, x + 10, 156, 10, 3, mix(D.n4, D.lampD, 0.3)); R(g, x + 11, 159, 8, 1, D.lamp);
        PX.glow(g, x + 15, 160, 40, D.lamp, 0.35);
      }
      // ---- crumbs drifting up to the tower ----
      const arrive = [];
      ACTS.forEach(([ta0, kind]) => {
        const ta = o.acts ? ta0 : ta0 * sc, age = t - ta, TRAV = 3.0;
        if (age < 0 || ta > tOut + 0.3) return;
        const k = clamp(age / TRAV, 0, 1);
        if (k >= 1) { arrive.push(ta + TRAV); return; }
        const e = PX.ease(k, "io"), x0 = PHX, y0 = PHY - 10, cx = x0 + 60, cy = y0 - 150;
        const bz = (s) => [(1 - s) * (1 - s) * x0 + 2 * (1 - s) * s * cx + s * s * TX, (1 - s) * (1 - s) * y0 + 2 * (1 - s) * s * cy + s * s * (TY + 12)];
        // trail
        for (let j = 1; j < 7; j++) { const s2 = Math.max(0, e - j * 0.035), [tx, ty] = bz(s2); A(g, 0.3 * (1 - j / 7) * (1 - k * 0.6), () => dot(g, tx, ty, D.glass)); }
        const [x, y] = bz(e), pop = P(age, 0, 0.25, "back");
        if (k < 0.45) { A(g, clamp(pop, 0, 1) * (1 - Math.max(0, k - 0.3) / 0.15), () => { PX.glow(g, x, y, 14, D.steel[0], 0.5); crumb(g, kind, x, y, D.cream); }); }
        if (k > 0.3) A(g, Math.min(1, (k - 0.3) / 0.15) * (1 - Math.max(0, k - 0.85) / 0.15), () => { R(g, x, y, 2, 2, D.cream); PX.glow(g, x, y, 6, D.steel[0], 0.3); });
      });
      // the tower stirs when crumbs arrive
      for (const ta of arrive) { const a2 = t - ta; if (a2 < 0.8) A(g, 0.5 * (1 - a2 / 0.8), () => { const rr2 = 4 + a2 * 18; ring(g, TX, TY + 14, rr2, D.glass); }); }
      // ---- the answer: one beam, then a boot card on the phone ----
      const bK = P(t, tOut, 0.55, "in"), bFade = 1 - P(t, tOut + 0.7, 0.8, "out");
      if (bK > 0 && bFade > 0) {
        const x1 = TX, y1 = TY + 12, x2 = PHX, y2 = PHY - 6, xe = lerp(x1, x2, bK), ye = lerp(y1, y2, bK);
        A(g, 0.9 * bFade, () => { PX.line(g, x1, y1, xe, ye, D.cream); PX.line(g, x1, y1 + 1, xe, ye + 1, D.glass); });
        for (let k2 = 1; k2 < 6; k2++) { const s2 = (k2 / 6) * bK; PX.glow(g, lerp(x1, x2, s2), lerp(y1, y2, s2), 10, D.steel[0], 0.18 * bFade); }
        A(g, 0.35 * bFade, () => { PX.line(g, x1 + 1, y1, xe + 1, ye, D.steel[0]); PX.line(g, x1 - 1, y1, xe - 1, ye, D.steel[0]); });
        PX.glow(g, xe, ye, 14, D.steel[0], 0.6 * bFade);
        PX.glow(g, TX, TY + 12, 24, D.glass, 0.4 * bFade);
      }
      const cK = P(t, tOut + 0.5, 0.4, "back");
      if (cK > 0) {
        const cw = 21, ch = 19, cx = Math.round(PHX - 6), cy = Math.round(PHY - 34 - (1 - clamp(cK, 0, 1)) * 6);
        A(g, clamp(cK, 0, 1), () => {
          A(g, 0.4, () => R(g, cx + 2, cy + 2, cw, ch, BLK));
          PX.panel(g, cx, cy, cw, ch, D.n0, mix(D.cream, D.glass, 0.3)); boot(g, cx + 3, cy + 3, "m");
          poly(g, [[cx + 5, cy + ch - 1], [cx + 10, cy + ch - 1], [PHX - 1, PHY - 7]], mix(D.cream, D.glass, 0.3));
          PX.glow(g, cx + cw / 2, cy + ch / 2, 22, D.cream, 0.15);
        });
      }
      // ---- rain ----
      for (const [x0, y0, sp, k] of DROPS) {
        const y = ((y0 + t * 240 * sp) % 380 + 380) % 380 - 10, x = ((x0 - t * 60 * sp - dist * 0.3) % 700 + 700) % 700 - 30;
        let a = 0.16 + 0.12 * k;
        for (const lx of lamps) if (Math.abs(x - lx - 14) < 30 && y > 160) a += 0.25;
        A(g, a, () => PX.line(g, x, y, x - 1, y + 4 + Math.round(sp * 2), mix(D.glass, D.steel[0], 0.4)));
      }
      for (let i = 0; i < 18; i++) { const ph2 = ((t * 1.7 + i * 0.37) % 1 + 1) % 1, x = (i * 71 + 23) % 640, y = 296 + (i * 29) % 60; A(g, 0.35 * (1 - ph2), () => { const w = 1 + Math.round(ph2 * 4); R(g, x - w, y, 2 * w + 1, 1, D.glass); }); }
      // near layer: railing posts sliding past (fast), dark
      const near = dist * 1.6;
      for (let k = -1; k < 6; k++) { const x = Math.round(k * 140 - (((near % 140) + 140) % 140)); R(g, x, 318, 6, 42, mix(D.n0, D.n1, 0.5)); R(g, x, 318, 1, 42, D.n2); }
      R(g, 0, 326, 640, 3, mix(D.n0, D.n1, 0.5)); R(g, 0, 326, 640, 1, D.n2);
      pool(g, 300, 200, 160, 420, 0.42);
      PX.vignette(g, 0.55);
    };
  };

  // mountain photo (sky, snowy peaks, pines) into a box
  const mountainPhoto = (g, x, y, w, h) => {
    PX.vgrad(g, x, y, w, h, mix(D.glass, D.steel[1], 0.35), mix(D.cream, D.glass, 0.4), 4);
    poly(g, [[x, y + h * 0.78], [x + w * 0.28, y + h * 0.3], [x + w * 0.42, y + h * 0.48], [x + w * 0.62, y + h * 0.18], [x + w, y + h * 0.66], [x + w, y + h], [x, y + h]], mix(D.steel[2], D.n3, 0.2));
    poly(g, [[x + w * 0.22, y + h * 0.4], [x + w * 0.28, y + h * 0.3], [x + w * 0.34, y + h * 0.4]], D.cream);
    poly(g, [[x + w * 0.54, y + h * 0.3], [x + w * 0.62, y + h * 0.18], [x + w * 0.7, y + h * 0.3], [x + w * 0.64, y + h * 0.28]], D.cream);
    for (let k = 0; k < 7; k++) { const px = x + 2 + k * (w / 7), ph = 5 + (k % 3) * 2; poly(g, [[px, y + h], [px + 3, y + h - ph], [px + 6, y + h]], mix(D.moss[2], D.n1, 0.3)); }
  };

  // ======================= wifi_morning =======================
  // small shared apartment, morning window light. o.friend (0.5) the friend at a laptop opens a trail map;
  // o.wifi (2.5) the router on the shelf links both devices; o.pause (5.0) You, on the sofa, stops on a mountain photo
  // for two seconds (dwell bar fills); o.spring (8.0) the wall calendar turns to spring flowers and, near the YOU dot,
  // a few other dots each show a tiny boot.
  K.wifi_morning = (o) => {
    const r = PX.rnd(61);
    const CL = [[-34, -10], [30, -20], [-18, 24], [40, 16], [8, -34]].map(([dx, dy], i) => ({ dx, dy, ph: r() * TAU, i }));
    const FX = 78, FY = 300, YX = 524, YS = 262, RX = 388, RY = 98, CX = 500, CY = 44, FDX = 24;
    return (g, t, d, c) => {
      const b = opt(o, d, 13.0), tF = b("friend", 0.5), tW = b("wifi", 2.5), tP = b("pause", 5.0), tS = b("spring", 8.0);
      const fK = P(t, tF, 0.5, "out"), wK = P(t, tW, 0.8, "out");
      const pauseDur = 2.0 * (d / 13), inPause = t >= tP && t < tP + pauseDur, pK = clamp((t - tP) / pauseDur, 0, 1);
      const cardA = P(t, tP - 0.1, 0.35, "out") * (1 - P(t, tP + pauseDur + 0.5, 0.5, "io"));
      const sK = P(t, tS, 0.7, "io");
      // ---- wall + window ----
      const WALL = mix(mix(D.paper, D.n5, 0.55), D.lamp, 0.08);
      PX.vgrad(g, 0, 0, 640, 268, mix(WALL, D.cream, 0.06), mix(WALL, D.n2, 0.35), 8);
      for (let x = 4; x < 640; x += 16) A(g, 0.07, () => R(g, x, 0, 1, 268, D.n2));
      R(g, 0, 258, 640, 10, mix(WALL, D.n2, 0.45)); R(g, 0, 258, 640, 1, mix(WALL, D.cream, 0.2));   // skirting
      PX.par(g, c, 0.4, () => {
        const wx = 236, wy = 44, ww = 104, wh = 132;
        R(g, wx - 5, wy - 5, ww + 10, wh + 10, mix(D.paper, D.n4, 0.35));
        PX.vgrad(g, wx, wy, ww, wh, mix(D.glass, D.steel[1], 0.3), mix(D.cream, D.lamp, 0.3), 6);
        PX.glow(g, wx + 80, wy + wh - 20, 60, D.lamp, 0.35);
        // soft far rooftops + a tree
        for (let i = 0; i < 7; i++) { const bh = 18 + ((i * 37) % 22); R(g, wx + i * 16 - 4, wy + wh - bh, 16, bh, mix(D.glass, D.steel[2], 0.32 + (i % 2) * 0.06)); }
        // a leafy branch reaching in from the top-left, swaying
        const TR = mix(D.moss[2], D.glass, 0.3), TR2 = mix(D.moss[1], D.glass, 0.35), BR = mix(D.n4, D.glass, 0.35);
        thick(g, wx - 2, wy + 6, wx + 46, wy + 22, 2, BR); thick(g, wx + 22, wy + 14, wx + 34, wy + 34, 1, BR);
        for (let k = 0; k < 11; k++) { const u = k / 10, sw = Math.sin(t * 0.9 + k * 0.7) * 1.4; const lx = wx + 2 + u * 48 + sw, ly = wy + 8 + u * 16 + (k % 3) * 5; disc(g, lx, ly, 4 + (k % 2), k % 2 ? TR : TR2); dot(g, lx - 1, ly - 2, mix(TR2, D.cream, 0.3)); }
        // a bird crossing now and then
        for (const bt of [3.1, 9.6]) { const k = (t - bt * (d / 13)) / 2.2; if (k > 0 && k < 1) { const bx = wx + ww * k, by = wy + 30 - Math.sin(k * 3) * 6, f = PX.blink(t, 0.3) ? 1 : 0; R(g, bx - 2, by - f, 2, 1, D.n3); R(g, bx + 1, by - f, 2, 1, D.n3); dot(g, bx, by, D.n3); } }
        R(g, wx + ww / 2 - 1, wy, 3, wh, mix(D.paper, D.n4, 0.3)); R(g, wx, wy + 56, ww, 3, mix(D.paper, D.n4, 0.3));
        R(g, wx - 10, wy + wh + 5, ww + 20, 5, mix(D.paper, D.n4, 0.25)); R(g, wx - 10, wy + wh + 5, ww + 20, 1, D.paper);
        // linen curtains, breathing in the morning air
        const br = Math.sin(t * 1.1) * 2;
        for (const [cx, dir] of [[wx - 18, 1], [wx + ww - 2, -1]]) {
          const CU = [mix(D.paper, D.n4, 0.2), mix(D.paper, D.n4, 0.4)];
          poly(g, [[cx, wy - 12], [cx + 20, wy - 12], [cx + 20 + dir * br, wy + wh + 34], [cx + dir * br * 0.4, wy + wh + 34]], CU[0]);
          for (let k = 0; k < 3; k++) R(g, cx + 4 + k * 6, wy - 12, 2, wh + 44, CU[1]);
        }
        R(g, wx - 24, wy - 15, ww + 48, 3, mix(D.n4, D.paperD, 0.3));
        // sill plants
        for (const [px, hh] of [[wx + 10, 10], [wx + 84, 8]]) { R(g, px, wy + wh + 0, 10, 6, mix(D.rust[1], D.paperD, 0.4)); for (let k = 0; k < 4; k++) thick(g, px + 5, wy + wh, px + 1 + k * 3, wy + wh - hh + Math.abs(k - 1.5) * 2, 2, D.moss[2]); }
      });
      // sunlight falling into the room (wall + floor)
      // poster (a trail map) + small shelf over the desk
      PX.par(g, c, 0.55, () => {
        R(g, 58, 60, 70, 88, mix(WOOD[2], D.n3, 0.3)); R(g, 61, 63, 64, 82, mix(D.paper, D.moss[0], 0.25));
        for (let k = 0; k < 6; k++) { g.fillStyle = mix(D.moss[1], D.paper, 0.45); for (let a = 0; a < 56; a++) dot(g, 64 + a, 74 + k * 11 + Math.sin(a * 0.18 + k) * 3); }
        for (let a = 0; a < 26; a++) if (a % 2 === 0) R(g, 70 + a * 2, 132 - a * 2.4 - Math.sin(a * 0.4) * 3, 2, 1, mix(D.rust[1], D.paper, 0.2));
        R(g, 150, 116, 60, 3, WOOD[1]); R(g, 150, 116, 60, 1, WOOD[0]);
        for (const [bx, bh, bc] of [[154, 14, D.steel[2]], [159, 12, D.rust[2]], [164, 15, D.moss[2]], [169, 11, D.paperD]]) R(g, bx, 116 - bh, 4, bh, mix(bc, D.n3, 0.25));
        R(g, 190, 108, 10, 8, mix(D.paper, D.n4, 0.3)); for (let k = 0; k < 5; k++) thick(g, 195, 112, 188 + k * 3.5, 120 + Math.abs(k - 2) * 2 + Math.sin(t + k) * 0.6, 1, D.moss[2]);   // trailing plant
      });
      // ---- shelf with the router ----
      PX.par(g, c, 0.7, () => {
        R(g, 352, 104, 84, 4, WOOD[1]); R(g, 352, 104, 84, 1, WOOD[0]); R(g, 360, 108, 3, 6, WOOD[2]); R(g, 424, 108, 3, 6, WOOD[2]);
        R(g, 414, 90, 4, 14, mix(D.rust[2], D.n3, 0.3)); R(g, 418, 92, 5, 12, mix(D.moss[2], D.n3, 0.3)); R(g, 424, 94, 4, 10, mix(D.steel[2], D.n3, 0.2));
        R(g, RX - 16, RY - 2, 34, 8, D.n2); R(g, RX - 16, RY - 2, 34, 1, D.n4); R(g, RX - 14, RY + 6, 3, 2, D.n1); R(g, RX + 13, RY + 6, 3, 2, D.n1);
        PX.line(g, RX - 12, RY - 2, RX - 16, RY - 16, D.n3); PX.line(g, RX + 12, RY - 2, RX + 16, RY - 16, D.n3);
        for (let k = 0; k < 4; k++) { const on = k === 0 || PX.blink(t * (1 + wK * 2) + k * 0.31, 0.6 + k * 0.17, 0.5); dot(g, RX - 8 + k * 5, RY + 2, on ? (k === 0 ? D.moss[0] : D.teal[0]) : D.n3); }
        R(g, 368, 92, 8, 12, mix(D.paper, D.n4, 0.3)); for (let k = 0; k < 4; k++) thick(g, 372, 92, 368 + k * 3, 82 + Math.abs(k - 1.5), 2, D.moss[2]);   // plant
      });
      // ---- wall calendar (spring flip) ----
      PX.par(g, c, 0.8, () => {
        R(g, CX + 24, CY - 4, 2, 4, D.n3);
        R(g, CX, CY, 50, 70, mix(D.paper, D.n4, 0.15)); R(g, CX, CY, 50, 2, mix(D.rust[2], D.n3, 0.3)); R(g, CX + 49, CY + 2, 1, 68, D.paperD);
        // grid of days (no numbers)
        for (let row = 0; row < 4; row++) for (let k = 0; k < 6; k++) R(g, CX + 4 + k * 7, CY + 44 + row * 6, 5, 4, mix(D.paper, D.n5, 0.25));
        // spring page underneath: blossoms
        const pic = (spring) => {
          R(g, CX + 3, CY + 4, 44, 36, spring ? mix(D.glass, D.cream, 0.4) : mix(D.steel[0], D.paper, 0.4));
          if (spring) { for (let k = 0; k < 5; k++) { thick(g, CX + 8 + k * 9, CY + 40, CX + 10 + k * 8, CY + 22 + (k % 2) * 4, 1, D.moss[2]); for (let j = 0; j < 3; j++) disc(g, CX + 10 + k * 8 + (j - 1) * 2, CY + 20 + (k % 2) * 4 - (j % 2) * 2, 1.6, j === 1 ? D.rose[0] : D.rose[1]); } R(g, CX + 3, CY + 38, 44, 2, D.moss[1]); }
          else { for (let k = 0; k < 3; k++) thick(g, CX + 12 + k * 13, CY + 40, CX + 14 + k * 12, CY + 16, 1, mix(D.n5, D.steel[2], 0.3)); R(g, CX + 3, CY + 36, 44, 4, D.cream); }
        };
        pic(true);
        // the winter page lifts away
        if (sK < 1) { const hh = Math.round(70 * (1 - sK)); g.save(); g.beginPath(); g.rect(CX, CY, 50, hh); g.clip(); R(g, CX, CY, 50, 70, mix(D.paper, D.n4, 0.12)); pic(false); for (let row = 0; row < 4; row++) for (let k = 0; k < 6; k++) R(g, CX + 4 + k * 7, CY + 44 + row * 6, 5, 4, mix(D.paper, D.n5, 0.25)); g.restore(); if (sK > 0) { R(g, CX, CY + hh, 50, 2, D.paperD); A(g, 0.3, () => R(g, CX, CY + hh + 2, 50, 3, BLK)); } }
        R(g, CX, CY, 50, 2, mix(D.rust[2], D.n3, 0.3));
      });
      // ---- floor + rug ----
      R(g, 0, 268, 640, 92, mix(WOOD[2], D.n3, 0.35)); R(g, 0, 268, 640, 1, mix(WOOD[1], D.paper, 0.2));
      for (let y = 272, k = 0; y < 360; k++) { R(g, 0, y, 640, 1, mix(WOOD[3], D.n2, 0.3)); y += 6 + k * 3; }
      poly(g, [[330, 290], [610, 290], [640, 350], [300, 350]], mix(D.teal[2], D.paper, 0.25));
      A(g, 0.1, () => poly(g, [[300, 268], [400, 268], [470, 360], [340, 360]], D.lamp));
      // ---- desk + friend + laptop (left), shifted right by FDX ----
      g.save(); g.translate(FDX, 0);
      const DX = 20, DY = 236;
      R(g, 66, 228, 6, 40, D.n3); R(g, 54, 266, 30, 4, D.n3); R(g, 66, 270, 3, 26, D.n4); R(g, 56, 296, 26, 3, D.n3);   // chair
      const typing = t > tF && t < tW + 1.5 * (d / 13);
      const ktap = typing ? Math.round(Math.sin(t * 14)) : 0;
      side(g, FX, FY, t, FRIEND, { sit: 40, reach: [128 + ktap, 230 + Math.round(Math.sin(t * 17)) * (typing ? 1 : 0)], eyes: PX.blink(t + 0.6, 3.6, 0.05) ? "closed" : "n", mouth: t > tF + 1.5 * (d / 13) ? 2 : 0 });
      A(g, 0.4, () => R(g, DX + 4, DY + 6, 196, 4, BLK));
      R(g, DX, DY, 200, 6, WOOD[1]); R(g, DX, DY, 200, 1, WOOD[0]); R(g, DX + 6, DY + 6, 5, 62, WOOD[2]); R(g, DX + 188, DY + 6, 5, 62, WOOD[2]);
      R(g, DX + 120, DY + 6, 68, 24, WOOD[2]); R(g, DX + 120, DY + 6, 68, 1, WOOD[3]); R(g, DX + 150, DY + 16, 8, 2, WOOD[0]);   // drawer
      // laptop: base + screen turned toward us a little
      R(g, 108, DY - 3, 46, 3, D.n4); R(g, 108, DY - 3, 46, 1, D.n6);
      const LS = [[120, DY - 4], [154, DY - 4], [160, DY - 34], [124, DY - 34]];
      poly(g, LS, D.n2);
      poly(g, [[122, DY - 6], [152, DY - 6], [157, DY - 32], [126, DY - 32]], mix(D.n1, D.steel[2], 0.2));
      if (fK > 0) A(g, fK, () => {
        g.save(); g.beginPath(); g.moveTo(122, DY - 6); g.lineTo(152, DY - 6); g.lineTo(157, DY - 32); g.lineTo(126, DY - 32); g.closePath(); g.clip();
        R(g, 118, DY - 34, 44, 30, mix(D.moss[0], D.paper, 0.45));
        for (let k = 0; k < 4; k++) { g.fillStyle = mix(D.moss[1], D.paper, 0.4); for (let a = 0; a < 40; a++) dot(g, 124 + a * 0.85 + k * 2, DY - 12 - k * 5 - Math.sin(a * 0.3 + k) * 2.5); }
        poly(g, [[140, DY - 32], [160, DY - 32], [160, DY - 24], [146, DY - 26]], mix(D.teal[0], D.paper, 0.3));   // a lake
        for (let a = 0; a < 18; a++) if (a % 2 === 0) { const tx = 128 + a * 1.4, ty = DY - 9 - a * 0.9 - Math.sin(a * 0.5) * 3; R(g, tx, ty, 2, 1, D.rust[1]); }
        const pinB = Math.round(Math.abs(Math.sin(t * 3)) * 1.2); R(g, 152, DY - 28 - pinB, 3, 3, D.rust[1]); dot(g, 153, DY - 25 - pinB, D.rust[2]);
        R(g, 122, DY - 32, 40, 3, mix(D.n6, D.paper, 0.4));
        g.restore();
      });
      PX.glow(g, 140, DY - 18, 30 + 10 * fK, D.glass, 0.12 + 0.12 * fK);
      // desk mug + steam, small lamp, notebook
      R(g, 40, DY - 11, 10, 11, mix(D.rust[1], D.paperD, 0.35)); R(g, 40, DY - 11, 10, 1, mix(D.rust[0], D.paper, 0.4)); R(g, 49, DY - 8, 3, 5, mix(D.rust[1], D.paperD, 0.45));
      for (let k = 0; k < 3; k++) { const st = (((t * 0.45 + k / 3) % 1) + 1) % 1; A(g, 0.3 * (1 - st), () => dot(g, 45 + Math.sin(st * 8 + k) * 2, DY - 13 - st * 18, D.cream)); }
      R(g, 166, DY - 2, 22, 2, mix(D.paper, D.n4, 0.2)); R(g, 166, DY - 2, 22, 1, D.cream);
      g.restore();
      // ---- sofa + You (right) ----
      const SO = [mix(D.moss[1], D.paper, 0.25), mix(D.moss[2], D.n4, 0.25), mix(D.moss[2], D.n1, 0.35)];
      A(g, 0.4, () => ell(g, 530, 304, 96, 5, BLK));
      R(g, 448, 192, 166, 66, SO[1]); R(g, 448, 192, 166, 2, SO[0]);
      R(g, 444, 250, 174, 12, mix(SO[1], SO[0], 0.3)); R(g, 444, 262, 174, 32, SO[1]); R(g, 444, 262, 174, 1, SO[0]); R(g, 444, 290, 174, 6, SO[2]);
      for (const ax of [432, 610]) { R(g, ax, 222, 22, 74, SO[1]); ell(g, ax + 11, 224, 11, 4, SO[1]); R(g, ax + 1, 220, 20, 1, SO[0]); R(g, ax + (ax < 500 ? 0 : 19), 228, 3, 68, SO[2]); }
      for (const fx2 of [448, 606]) R(g, fx2, 296, 6, 5, WOOD[3]);
      poly(g, [[586, 222], [608, 216], [610, 248], [588, 250]], mix(D.paper, D.rust[0], 0.2));   // cushion
      // You scroll, then stop on the photo
      const scrolling = !inPause && t > 0.3;
      const scr = inPause ? mix(D.glass, D.steel[1], 0.3) : PX.blink(t, 0.5) && scrolling ? mix(D.teal[1], D.n2, 0.2) : mix(D.steel[1], D.n2, 0.25);
      sitFront(g, YX, YS, t, YOU, { look: 0.1, tilt: 2, arms: "phone", screen: scr, eyes: PX.blink(t + 1.1, 3.4, 0.05) && !inPause ? "closed" : "down", gx: 0, brow: inPause ? 1 : 0, mouth: 0 });
      PX.glow(g, YX, YS - 22, 22, D.steel[0], 0.18); PX.glow(g, YX, YS - 52, 16, D.steel[0], 0.08);
      // ---- Wi-Fi links ----
      if (wK > 0) {
        const lA = 1 - 0.85 * P(t, tS, 1.0, "io");
        const link = (x2, y2, seed) => A(g, lA, () => {
          const n = Math.ceil(Math.hypot(x2 - RX, y2 - RY) / 4);
          for (let i = 0; i <= n; i++) { const k = i / n; if (k > wK) break; A(g, 0.55, () => dot(g, lerp(RX, x2, k), lerp(RY + 6, y2, k) - Math.sin(k * Math.PI) * 14, D.teal[0])); }
          if (wK >= 1) for (let j = 0; j < 3; j++) { const k = (((t * 0.45 + j / 3 + seed) % 1) + 1) % 1, kk = seed > 0.5 ? 1 - k : k; const px = lerp(RX, x2, kk), py = lerp(RY + 6, y2, kk) - Math.sin(kk * Math.PI) * 14; R(g, px - 1, py - 1, 2, 2, D.cream); PX.glow(g, px, py, 5, D.teal[0], 0.4); }
        });
        link(140 + FDX, DY - 34, 0.2); link(YX, YS - 28, 0.7);
        for (let k = 0; k < 3; k++) { const ph = (((t * 0.8 + k / 3) % 1) + 1) % 1, rr2 = 6 + ph * 18; A(g, 0.5 * (1 - ph) * wK, () => { g.fillStyle = D.teal[0]; for (let i = 0; i < 14; i++) { const a = -Math.PI * 0.8 + (i / 13) * Math.PI * 0.6; dot(g, RX + Math.cos(a) * rr2, RY - 4 + Math.sin(a) * rr2); } }); }
        PX.glow(g, RX, RY + 2, 20, D.teal[1], 0.25 * wK);
      }
      // ---- the paused photo, enlarged from the phone, with a dwell bar ----
      if (cardA > 0) {
        const cw = 56, ch = 58, cx = 400, cy = 140 - Math.round((1 - cardA) * 6);
        A(g, cardA, () => {
          g.fillStyle = D.cream; for (let k = 0; k < 14; k++) { const s2 = k / 14; if (k % 2 === 0) dot(g, lerp(cx + cw, YX - 2, s2), lerp(cy + ch - 10, YS - 28, s2)); }
          A(g, 0.4, () => R(g, cx + 3, cy + 3, cw, ch, BLK));
          PX.panel(g, cx, cy, cw, ch, D.n4, D.n1);
          mountainPhoto(g, cx + 3, cy + 3, cw - 6, 40);
          R(g, cx + 4, cy + 47, cw - 8, 4, D.n3);
          R(g, cx + 4, cy + 47, Math.round((cw - 8) * pK), 4, D.teal[1]); R(g, cx + 4, cy + 47, Math.round((cw - 8) * pK), 1, D.teal[0]);
          R(g, cx + 4, cy + 53, 20, 1, D.n5);
        });
      }
      // ---- spring: the YOU dot and nearby dots that bought boots ----
      const dK = P(t, tS + 0.6, 0.6, "out");
      if (dK > 0) {
        const ux = 470, uy = 168;
        { const gr = g.createRadialGradient(ux, uy, 10, ux, uy, 66); gr.addColorStop(0, `rgba(0,0,0,${(0.42 * dK).toFixed(3)})`); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(ux - 70, uy - 70, 140, 140); }
        CL.forEach((p, i) => {
          const k = P(t, tS + 1.0 + i * 0.35, 0.4, "out"); if (k <= 0) return;
          const x = ux + p.dx + Math.sin(t * 0.8 + p.ph) * 1.2, y = uy + p.dy + Math.cos(t * 0.7 + p.ph) * 1.2;
          otherDot(g, x, y, k * 0.95, D.cream);
          const bk = P(t, tS + 1.5 + i * 0.35, 0.35, "back"); if (bk > 0) A(g, clamp(bk, 0, 1), () => boot(g, x + 3, y - 10 - Math.round((1 - clamp(bk, 0, 1)) * 3), "s"));
        });
        youDot(g, ux, uy, t, dK);
      }
      // ---- morning light, dust ----
      PX.particles(g, 66, 26, t, [260, 60, 180, 280], { vy: -1.2, vx: 1.6, col: D.lamp, a: 0.45 });
      pool(g, 300, 170, 200, 460, 0.36);
      PX.vignette(g, 0.48);
    };
  };
})();
