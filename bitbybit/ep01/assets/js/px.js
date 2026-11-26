/* Bit by Bit pixel engine for HyperFrames.
   build.py writes window.PXS = [[a, b, kind, opts], ...] in part seconds.
   Each scene kind draws on a 480x270 low-res canvas (1 px = 4 screen px); the engine upscales it with
   nearest-neighbour onto #crt (1920x1080), adds bloom + scanlines + RGB mask, and draws the starfield on #stars.
   Everything is a pure function of time. Scene kinds: PX.K[kind] = (o) => (g, t, d) => {...}
   where g = 480x270 2D context, t = seconds into the shot (may be slightly negative), d = shot length. */
(function () {
  const LW = 480, LH = 270, W = 1920, H = 1080, S = 4;
  const PX = (window.PX = window.PX || {});
  PX.K = PX.K || {};
  PX.LW = LW; PX.LH = LH;

  // ---------- palette ----------
  PX.C = {
    bg: "#05060a", ink: "#e8f1f2", dim: "#5a6b78", panel: "#0b1622", grid: "#14283a",
    cyan: "#5fe3e8", green: "#3df56b", yellow: "#f7c948", pink: "#f25ca8", purple: "#8a5cf6",
    orange: "#f08a3c", red: "#ff4d4d", blue: "#3d7cf5", white: "#ffffff", teal: "#2a9fad", brown: "#8a5a3c",
    skin: ["#f2c9a0", "#d9a066", "#a86b3c", "#6b4226"],
  };

  // ---------- math ----------
  const clamp = (PX.clamp = (x, a, b) => Math.max(a, Math.min(b, x)));
  const lerp = (PX.lerp = (a, b, p) => a + (b - a) * p);
  PX.smooth = (p) => { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); };
  PX.ease = (p, e) => {
    p = clamp(p, 0, 1);
    if (e === "lin") return p;
    if (e === "out") return 1 - Math.pow(1 - p, 3);
    if (e === "in") return p * p * p;
    if (e === "back") { const c = 1.7; return 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2); }
    return p * p * (3 - 2 * p);
  };
  // progress of t through [a, a+d] with easing
  PX.p = (t, a, d, e) => PX.ease((t - a) / Math.max(d, 1e-6), e || "out");
  // keyframes [[t, v], ...] (smoothstep between)
  PX.KF = (arr, t) => {
    if (!Array.isArray(arr)) return arr;
    if (t <= arr[0][0]) return arr[0][1];
    for (let i = 1; i < arr.length; i++) if (t < arr[i][0]) return lerp(arr[i - 1][1], arr[i][1], PX.smooth((t - arr[i - 1][0]) / (arr[i][0] - arr[i - 1][0])));
    return arr[arr.length - 1][1];
  };
  PX.rnd = (seed) => { let s = (seed >>> 0) || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  // stepped value (for "chunky" pixel motion): quantise x to n steps
  PX.q = (x, n) => Math.round(x * n) / n;
  // blink on/off with period
  PX.blink = (t, per, duty) => ((t % per) + per) % per < per * (duty === undefined ? 0.5 : duty);

  // ---------- drawing (all coordinates in low-res pixels) ----------
  PX.rect = (g, x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  PX.line = (g, x1, y1, x2, y2, col) => { // pixel line (Bresenham)
    x1 = Math.round(x1); y1 = Math.round(y1); x2 = Math.round(x2); y2 = Math.round(y2);
    g.fillStyle = col; const dx = Math.abs(x2 - x1), dy = -Math.abs(y2 - y1), sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1; let e = dx + dy;
    for (let i = 0; i < 4000; i++) { g.fillRect(x1, y1, 1, 1); if (x1 === x2 && y1 === y2) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x1 += sx; } if (e2 <= dx) { e += dx; y1 += sy; } }
  };
  PX.box = (g, x, y, w, h, col) => { PX.rect(g, x, y, w, 1, col); PX.rect(g, x, y + h - 1, w, 1, col); PX.rect(g, x, y, 1, h, col); PX.rect(g, x + w - 1, y, 1, h, col); };
  // CRT "monitor" panel: dark fill + 1px bright rounded border (corner pixels cut)
  PX.panel = (g, x, y, w, h, col, fill) => {
    PX.rect(g, x + 1, y + 1, w - 2, h - 2, fill || PX.C.panel);
    PX.rect(g, x + 2, y, w - 4, 1, col); PX.rect(g, x + 2, y + h - 1, w - 4, 1, col);
    PX.rect(g, x, y + 2, 1, h - 4, col); PX.rect(g, x + w - 1, y + 2, 1, h - 4, col);
    PX.rect(g, x + 1, y + 1, 1, 1, col); PX.rect(g, x + w - 2, y + 1, 1, 1, col); PX.rect(g, x + 1, y + h - 2, 1, 1, col); PX.rect(g, x + w - 2, y + h - 2, 1, 1, col);
  };
  PX.circle = (g, cx, cy, r, col) => { g.fillStyle = col; for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
  // sprite from strings; '.' or ' ' = transparent, other chars index the palette object
  PX.sprite = (g, rows, x, y, pal, sc, flip) => {
    sc = sc || 1;
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const ch = row[flip ? row.length - 1 - c : c];
        if (ch === "." || ch === " ") continue;
        const col = pal[ch]; if (!col) continue;
        g.fillStyle = col; g.fillRect(Math.round(x + c * sc), Math.round(y + r * sc), sc, sc);
      }
    }
  };
  // text. font: "p" = Press Start 2P (size multiple of 8), "v" = VT323 (size ~10-20). align left|center|right
  PX.text = (g, str, x, y, o) => {
    o = o || {};
    const f = o.font === "v" ? "VT323" : "Press Start 2P", sz = o.size || (o.font === "v" ? 16 : 8);
    g.font = `${sz}px "${f}"`; g.textBaseline = "top"; g.textAlign = o.align || "left";
    g.fillStyle = o.col || PX.C.ink; g.fillText(str, Math.round(x), Math.round(y));
    return g.measureText(str).width;
  };
  PX.tw = (g, str, o) => { o = o || {}; const f = o.font === "v" ? "VT323" : "Press Start 2P"; g.font = `${o.size || (o.font === "v" ? 16 : 8)}px "${f}"`; return g.measureText(str).width; };
  // typewriter: characters visible at time t when typing starts at t0 with cps chars/second
  PX.typed = (str, t, t0, cps) => str.slice(0, clamp(Math.floor((t - t0) * (cps || 20)), 0, str.length));
  // draw fn into a zoomed coordinate frame: scale s about (cx, cy) in low-res pixels (nearest neighbour on upscale)
  PX.zoom = (g, s, cx, cy, fn) => { g.save(); g.translate(cx, cy); g.scale(s, s); g.translate(-cx, -cy); fn(); g.restore(); };
  // fade whole layer: g.globalAlpha helper
  PX.alpha = (g, a, fn) => { const o = g.globalAlpha; g.globalAlpha = o * clamp(a, 0, 1); fn(); g.globalAlpha = o; };

  // small pixel person 7x13; walk frame 0/1; col = shirt colour; cap = grad cap
  const PERSON = [
    ["..hhh..", ".hhhhh.", ".sssss.", ".seses.", ".sssss.", "..sss..", ".ccccc.", "cc.c.cc", "s.ccc.s", "..ccc..", "..p.p..", "..p.p..", ".bb.bb."],
    ["..hhh..", ".hhhhh.", ".sssss.", ".seses.", ".sssss.", "..sss..", ".ccccc.", "cc.c.cc", "s.ccc.s", "..ccc..", "..p..p.", ".p...p.", "bb...bb"],
  ];
  PX.person = (g, x, y, o) => {
    o = o || {};
    const pal = { e: "#111", h: o.hair || "#2b1d14", s: o.skin || PX.C.skin[1], c: o.col || PX.C.cyan, p: o.pants || "#2d3b55", b: "#111" };
    PX.sprite(g, PERSON[o.frame ? 1 : 0], x, y, pal, o.sc || 1, o.flip);
    if (o.cap) { const sc = o.sc || 1; PX.rect(g, x - 1 * sc, y - 1 * sc, 9 * sc, 1 * sc, "#111"); PX.rect(g, x + 2 * sc, y - 2 * sc, 3 * sc, 1 * sc, "#111"); PX.rect(g, x + 7 * sc, y, 1 * sc, 3 * sc, PX.C.yellow); }
  };
  // coin (5x5)
  PX.coin = (g, x, y, sc) => PX.sprite(g, [".yyy.", "yyoyy", "yoyoy", "yyoyy", ".yyy."], x, y, { y: PX.C.yellow, o: "#b8860b" }, sc || 1);

  // glitch: horizontal slice offsets on the low-res canvas (call at end of a scene draw); amount 0..1
  PX.glitch = (g, amount, seed) => {
    if (amount <= 0) return;
    const r = PX.rnd(seed || 7), n = Math.ceil(10 * amount);
    for (let i = 0; i < n; i++) {
      const y = Math.floor(r() * LH), h = 2 + Math.floor(r() * 14), dx = Math.round((r() - 0.5) * 60 * amount);
      const img = g.getImageData(0, y, LW, h); g.putImageData(img, dx, y);
      if (r() < 0.4) { g.fillStyle = r() < 0.5 ? "rgba(95,227,232,.35)" : "rgba(242,92,168,.35)"; g.fillRect(0, y, LW, 1); }
    }
  };

  // ---------- canvases + driver: PX.start() after all scene files are loaded ----------
  PX.start = function () {
  const crt = document.getElementById("crt"), stars = document.getElementById("stars");
  const C2 = crt.getContext("2d"), ST = stars ? stars.getContext("2d") : null;
  const low = document.createElement("canvas"); low.width = LW; low.height = LH;
  const L = low.getContext("2d");
  const big = document.createElement("canvas"); big.width = W; big.height = H;
  const B = big.getContext("2d");

  // scanline + aperture-grille pattern, 4x4 per low-res pixel
  const pat = document.createElement("canvas"); pat.width = 4; pat.height = 4;
  { const p = pat.getContext("2d"); p.fillStyle = "#fff"; p.fillRect(0, 0, 4, 4);
    p.fillStyle = "rgba(0,0,0,.42)"; p.fillRect(0, 3, 4, 1);              // scanline gap
    p.fillStyle = "rgba(255,190,190,1)"; p.fillRect(0, 0, 1, 3);           // R column tint
    p.fillStyle = "rgba(190,255,200,1)"; p.fillRect(1, 0, 1, 3);           // G
    p.fillStyle = "rgba(190,205,255,1)"; p.fillRect(2, 0, 1, 3); }         // B
  const PAT = C2.createPattern(pat, "repeat");

  // starfield: fixed stars + slow diagonal streaks, all deterministic in t
  const SR = PX.rnd(99), STARS = [];
  for (let i = 0; i < 420; i++) STARS.push([SR() * W, SR() * H, SR() * 1.3 + 0.3, SR() * 0.7 + 0.15, SR() * 6.28]);
  const STREAKS = []; for (let i = 0; i < 46; i++) STREAKS.push([SR() * W, SR() * H, 8 + SR() * 22, 30 + SR() * 70, SR()]);
  function drawStars(t, o) {
    if (!ST) return;
    ST.fillStyle = PX.C.bg; ST.fillRect(0, 0, W, H);
    const vis = o && o.stars === 0 ? 0 : 1; if (!vis) return;
    for (const [x, y, r, a, ph] of STARS) { ST.globalAlpha = a * (0.75 + 0.25 * Math.sin(t * 1.3 + ph)); ST.fillStyle = "#fff"; ST.fillRect(x, y, r, r); }
    ST.strokeStyle = "#fff"; ST.lineWidth = 1;
    for (const [x0, y0, len, sp, a] of STREAKS) {
      const x = ((x0 + t * sp) % (W + 200)) - 100, y = ((y0 + t * sp * 0.42) % (H + 100)) - 50;
      ST.globalAlpha = 0.18 + 0.3 * a; ST.beginPath(); ST.moveTo(x, y); ST.lineTo(x - len, y - len * 0.42); ST.stroke();
    }
    ST.globalAlpha = 1;
  }

  // ---------- driver ----------
  const SHOTS = (window.PXS || []).map(([a, b, k, o]) => ({ a, b, k, o: o || {}, f: PX.K[k] ? PX.K[k](o || {}) : null }));
  if (SHOTS.some((s) => !s.f)) console.error("unknown px kind", SHOTS.filter((s) => !s.f).map((s) => s.k));
  // star layer settings from window.STARS_OFF = [[a,b],...] (photo-only stretches can hide stars)
  function draw(t) {
    let s = null;
    for (const x of SHOTS) if (t >= x.a && t < x.b) s = x;
    drawStars(t, s ? s.o : null);
    C2.clearRect(0, 0, W, H);
    if (!s || !s.f) return;
    const tt = t - s.a, d = s.b - s.a, o = s.o;
    L.clearRect(0, 0, LW, LH);
    if (o.bg) { L.fillStyle = o.bg; L.fillRect(0, 0, LW, LH); }
    L.save(); s.f(L, tt, d); L.restore();
    // shot-level glitch in/out (opts.gin / opts.gout seconds)
    if (o.gin && tt < o.gin) PX.glitch(L, 1 - tt / o.gin, Math.floor(tt * 30) + 1);
    if (o.gout && tt > d - o.gout) PX.glitch(L, (tt - (d - o.gout)) / o.gout, Math.floor(tt * 30) + 3);
    // fade (opts.fin / opts.fout seconds)
    let a = 1; if (o.fin) a = Math.min(a, clamp(tt / o.fin, 0, 1)); if (o.fout) a = Math.min(a, clamp((d - tt) / o.fout, 0, 1));
    // upscale
    B.clearRect(0, 0, W, H); B.imageSmoothingEnabled = false; B.drawImage(low, 0, 0, W, H);
    C2.globalAlpha = a;
    C2.imageSmoothingEnabled = false; C2.drawImage(big, 0, 0);
    // aperture grille + scanlines (multiply only where there is content)
    C2.globalCompositeOperation = "multiply"; C2.fillStyle = PAT; C2.fillRect(0, 0, W, H);
    C2.globalCompositeOperation = "destination-in"; C2.drawImage(big, 0, 0);
    // bloom
    C2.globalCompositeOperation = "lighter"; C2.globalAlpha = a * (o.bloom === undefined ? 0.42 : o.bloom);
    C2.filter = "blur(7px)"; C2.drawImage(big, 0, 0); C2.filter = "blur(2px)"; C2.globalAlpha = a * 0.25; C2.drawImage(big, 0, 0);
    C2.filter = "none"; C2.globalCompositeOperation = "source-over"; C2.globalAlpha = 1;
  }
  window.addEventListener("hf-seek", (e) => draw(e.detail.time));
  window.PX_draw = draw;
  // fonts must be ready before the first frame is drawn
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  window.__hf.buildReady.px = Promise.all([document.fonts.load('8px "Press Start 2P"'), document.fonts.load('16px "VT323"')]).then(() => draw(0));
  draw(0);
  };
})();
