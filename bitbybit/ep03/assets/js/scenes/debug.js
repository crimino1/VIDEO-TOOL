/* EP2 Builder D: debugging scenes. time_machine, paste_loop, think_vs_real, stacktrace, prints, journal, duck,
   chat_explain. All share the coder's night room (wall, window, shelf, desk, lamp) drawn by the helpers below. */
(function () {
  const { K, C } = PX;
  const R = PX.rect, T = PX.text, OT = PX.otext, W = 640, H = 360;

  // ---------------- shared art helpers ----------------
  const ell = (g, cx, cy, rx, ry, col) => {
    g.fillStyle = col;
    for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
  };
  const thick = (g, x1, y1, x2, y2, w, col) => {
    const n = Math.max(1, Math.ceil(Math.hypot(x2 - x1, y2 - y1))); g.fillStyle = col;
    for (let i = 0; i <= n; i++) { const x = x1 + ((x2 - x1) * i) / n, y = y1 + ((y2 - y1) * i) / n; g.fillRect(Math.round(x - w / 2), Math.round(y - w / 2), w, w); }
  };
  const rr = (g, x, y, w, h, col) => { R(g, x + 1, y, w - 2, h, col); R(g, x, y + 1, w, h - 2, col); };
  const rr2 = (g, x, y, w, h, col) => { R(g, x + 2, y, w - 4, h, col); R(g, x + 1, y + 1, w - 2, h - 2, col); R(g, x, y + 2, w, h - 4, col); };
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const A = (g, a, fn) => PX.alpha(g, a, fn);
  const pop = (t, t0, d) => PX.p(t, t0, d || 0.35, "back");          // 0 -> 1 with overshoot
  const vis = (t, t0) => t >= t0;
  // pixel check mark / cross
  const tick = (g, x, y, s, col) => { thick(g, x, y + s * 0.5, x + s * 0.35, y + s * 0.85, Math.max(2, Math.round(s / 6)), col); thick(g, x + s * 0.35, y + s * 0.85, x + s, y, Math.max(2, Math.round(s / 6)), col); };
  const cross = (g, x, y, s, col) => { const w = Math.max(2, Math.round(s / 6)); thick(g, x, y, x + s, y + s, w, col); thick(g, x + s, y, x, y + s, w, col); };
  // speech bubble with tail to (tx, ty)
  const bubble = (g, x, y, w, h, tx, ty, fill, edge) => {
    fill = fill || "#dfe6ee"; edge = edge || "#0b0f1a";
    const bx = PX.clamp(tx, x + 6, x + w - 10), by = ty < y ? y : y + h - 1;
    const TN = Math.max(7, Math.ceil(Math.hypot(tx - bx, ty - by)));
    for (let i = 0; i < TN; i++) { const k = i / TN, cx = PX.lerp(bx + 3, tx, k), cy = PX.lerp(by, ty, k), ww = Math.round(7 * (1 - k)) + 1; R(g, cx - ww / 2 - 1, cy - 1, ww + 2, 3, edge); }
    rr2(g, x - 1, y - 1, w + 2, h + 2, edge); rr2(g, x, y, w, h, fill); R(g, x + 2, y + h - 2, w - 4, 1, "rgba(0,0,0,.12)");
    for (let i = 0; i < TN; i++) { const k = i / TN, cx = PX.lerp(bx + 3, tx, k), cy = PX.lerp(by, ty, k), ww = Math.round(7 * (1 - k)); if (ww > 0) R(g, cx - ww / 2, cy, ww, 1, fill); }
  };
  // comic "pop" burst behind a word
  const burst = (g, cx, cy, r, col, edge, spin) => {
    g.fillStyle = edge; g.beginPath();
    for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.283 + (spin || 0), rad = i % 2 ? r * 0.62 : r; g.lineTo(cx + Math.cos(a) * (rad + 2), cy + Math.sin(a) * (rad + 2) * 0.8); }
    g.fill(); g.fillStyle = col; g.beginPath();
    for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.283 + (spin || 0), rad = i % 2 ? r * 0.62 : r; g.lineTo(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad * 0.8); }
    g.fill();
  };
  const sweat = (g, x, y, t, ph) => {           // falling sweat drop
    const k = ((t * 1.6 + (ph || 0)) % 1), yy = y + k * 14;
    A(g, 1 - k * 0.6, () => { R(g, x, yy, 3, 4, "#7fd6f0"); R(g, x + 1, yy - 2, 1, 2, "#7fd6f0"); R(g, x, yy, 1, 1, "#d8f6ff"); });
  };
  const bulb = (g, x, y, t, t0) => {           // idea light bulb popping in
    const k = pop(t, t0, 0.4); if (k <= 0) return;
    PX.zoom(g, k, x, y, () => {
      PX.glow(g, x, y, 34, "rgba(255,220,120,0.7)");
      for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.283 + t * 0.6, r1 = 14 + 2 * Math.sin(t * 8 + i); thick(g, x + Math.cos(a) * r1, y + Math.sin(a) * r1, x + Math.cos(a) * (r1 + 5), y + Math.sin(a) * (r1 + 5), 2, "#f7c948"); }
      PX.circle(g, x, y, 9, "#f7c948"); PX.circle(g, x - 1, y - 1, 7, "#ffe08a"); R(g, x - 4, y - 5, 2, 3, "#fff6d0");
      R(g, x - 4, y + 8, 8, 2, "#9aa4b2"); R(g, x - 4, y + 10, 8, 2, "#6b7280"); R(g, x - 3, y + 12, 6, 2, "#9aa4b2");
    });
  };

  // ---------------- the coder's room ----------------
  const RGB = (t, i) => `hsl(${Math.round((t * 60 + i * 22) % 360)},85%,62%)`;
  // wall clock; ang = minute hand angle (rad)
  const clock = (g, x, y, ang) => {
    PX.circle(g, x, y, 15, "#0b0f1a"); PX.circle(g, x, y, 14, "#3a3f55"); PX.circle(g, x, y, 12, "#bdb6a2"); PX.circle(g, x + 1, y + 1, 11, "#a69f8c");
    PX.circle(g, x - 1, y - 1, 10, "#c9c2ad");
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; R(g, x + Math.cos(a) * 9, y + Math.sin(a) * 9, 1, 1, "#4a4436"); }
    thick(g, x, y, x + Math.cos(ang / 12 - 1.57) * 5, y + Math.sin(ang / 12 - 1.57) * 5, 2, "#2a2620");
    thick(g, x, y, x + Math.cos(ang - 1.57) * 8, y + Math.sin(ang - 1.57) * 8, 1, "#2a2620"); R(g, x, y, 1, 1, "#c0392b");
    R(g, x - 9, y - 13, 6, 1, "#5a6080");
  };
  const plant = (g, x, y, t) => {       // potted plant, base at (x, y)
    R(g, x - 9, y - 12, 18, 12, "#7a4a2c"); R(g, x - 10, y - 14, 20, 3, "#8e5a36"); R(g, x - 9, y - 12, 2, 12, "#9a6440"); R(g, x + 5, y - 12, 4, 12, "#5c361f");
    const sw = Math.sin(t * 1.3) * 1.5;
    [[-1, -30, -9], [0, -36, 2], [1, -28, 10], [0, -24, -5], [1, -33, 6]].forEach(([s, h, dx], i) => {
      const tx = x + dx + sw * (i % 2 ? 1 : -0.6), ty = y + h; thick(g, x + dx * 0.2, y - 14, tx, ty, 1, "#2f5e3a");
      ell(g, tx, ty, 4, 2, i % 2 ? "#3d7a4a" : "#4f9a5c"); R(g, tx - 3, ty - 2, 3, 1, "#7fcf8a");
    });
  };
  const books = (g, x, y, n, seed) => {     // book row standing on y
    const cols = ["#8e3b46", "#2f6690", "#3a7d5c", "#6a4c93", "#b8642f", "#2a8a86", "#b89a3a", "#5b6474"], r = PX.rnd(seed || 4);
    let bx = x;
    for (let i = 0; i < n; i++) { const h = 14 + Math.floor(r() * 8), w = 4 + Math.floor(r() * 3), col = cols[Math.floor(r() * cols.length)];
      R(g, bx, y - h, w, h, col); R(g, bx, y - h, 1, h, "rgba(255,255,255,.22)"); R(g, bx + w - 1, y - h, 1, h, "rgba(0,0,0,.3)"); R(g, bx, y - h + 3, w, 1, "rgba(255,230,160,.35)"); bx += w + 1; }
    return bx;
  };
  // back wall with window (left), shelf + clock (right), string lights. o.clock = minute angle, o.noShelf, o.winX
  const wall = (g, t, c, o) => {
    o = o || {};
    PX.vgrad(g, 0, 0, W, H, "1b2244", "0d1124", 10);
    A(g, 0.03, () => { for (let x = 0; x < W; x += 14) R(g, x, 0, 5, H, "#8fa2ff"); });
    A(g, 0.05, () => { for (let y = 6; y < H; y += 28) for (let x = (y / 28) % 2 ? 7 : 0; x < W; x += 14) R(g, x + 2, y, 1, 1, "#c8d0ff"); });
    const wx = o.winX === undefined ? 34 : o.winX;
    PX.par(g, c, 0.45, () => {                          // window: far layer
      PX.glow(g, wx + 70, 100, 130, "rgba(110,90,200,0.18)");
      R(g, wx - 4, 26, 148, 128, "#232842"); R(g, wx - 4, 26, 148, 1, "#4a5275");
      PX.core.skyline(g, wx, 30, 140, 118, t, 5);
      // passing cloud
      const cx = wx + ((t * 4) % 180) - 30; A(g, 0.35, () => { ell(g, cx, 48, 16, 3, "#6a5a9a"); ell(g, cx + 8, 46, 9, 3, "#7a6aaa"); });
      R(g, wx + 68, 30, 4, 118, "#232842"); R(g, wx, 86, 140, 4, "#232842"); R(g, wx + 68, 30, 1, 118, "#3d4466");
      R(g, wx - 8, 152, 156, 6, "#343a58"); R(g, wx - 8, 152, 156, 1, "#5a6390");
      // curtains with folds
      for (const [cx0, dir] of [[wx - 16, 1], [wx + 132, -1]]) {
        for (let i = 0; i < 4; i++) { const sway = Math.round(Math.sin(t * 0.8 + i) * 0.7); R(g, cx0 + i * 6 + (dir < 0 ? 0 : 0), 22, 6, 142 + sway, i % 2 ? "#3a2a62" : "#4a3878"); R(g, cx0 + i * 6, 22, 1, 142 + sway, "#5c4a90"); }
      }
      R(g, wx - 22, 18, 186, 4, "#5a4a3a"); R(g, wx - 22, 18, 186, 1, "#8a7050");
    });
    PX.par(g, c, 0.65, () => {                          // mid layer: shelf, clock, poster
      if (!o.noShelf) {
        R(g, 470, 78, 140, 5, "#5a3e2b"); R(g, 470, 78, 140, 1, "#8a6446"); R(g, 470, 83, 140, 2, "#22180f");
        R(g, 480, 83, 3, 6, "#3a2a1c"); R(g, 596, 83, 3, 6, "#3a2a1c");
        books(g, 478, 78, 9, 7);
        plant(g, 580, 78, t);
        R(g, 548, 70, 12, 8, "#1b1e26"); R(g, 550, 72, 8, 4, PX.blink(t, 1.8, 0.8) ? "#3df56b" : "#1f5a30");   // tiny LED box
      }
      clock(g, o.clockX || 430, 60, o.clock === undefined ? t * 0.105 : o.clock);
      if (!o.noPoster) { R(g, 494, 110, 54, 70, "#141a30"); R(g, 496, 112, 50, 66, "#1f2a52"); PX.vgrad(g, 498, 114, 46, 40, "3a2a6a", "f25ca8", 6);
        PX.circle(g, 521, 140, 10, "#f7c948"); for (let i = 0; i < 4; i++) R(g, 511, 136 + i * 4, 21, 1, "#3a2a6a"); R(g, 498, 154, 46, 22, "#14183a");
        T(g, "DEBUG", 521, 160, { size: 8, col: "#5fe3e8", align: "center" }); R(g, 496, 112, 1, 66, "#3a4a80"); }
    });
    PX.par(g, c, 0.6, () => {                           // string lights across the top
      for (let i = 0; i < 22; i++) {
        const x = 8 + i * 30, sag = Math.sin((i % 7) / 6 * 3.14) * 10, y = 10 + sag;
        if (i) thick(g, x - 30, 10 + Math.sin(((i - 1) % 7) / 6 * 3.14) * 10, x, y, 1, "#2a2c3a");
        const on = 0.65 + 0.35 * Math.sin(t * 2.2 + i * 1.7), col = ["#ffcf8a", "#f25ca8", "#5fe3e8", "#f7c948"][i % 4];
        R(g, x - 1, y + 1, 3, 4, col); R(g, x - 1, y + 1, 1, 1, "#fff6e0"); PX.glow(g, x, y + 3, 12, col, 0.35 * on);
      }
    });
  };
  // desk: top surface y..y+24, front panel below
  const desk = (g, y, t) => {
    R(g, 0, y, W, 24, "#5e412d"); R(g, 0, y, W, 1, "#3a281b");
    const r = PX.rnd(21); for (let i = 0; i < 40; i++) R(g, Math.floor(r() * W), y + 3 + Math.floor(r() * 19), 12 + Math.floor(r() * 50), 1, r() < 0.5 ? "#53392a" : "#6a4a34");
    R(g, 0, y + 24, W, 3, "#8a6446"); R(g, 0, y + 24, W, 1, "#b08560"); R(g, 0, y + 27, W, H - y - 27, "#1c1510");
    R(g, 0, y + 27, W, 2, "#0f0b08");
    for (const dx of [40, 440]) { R(g, dx, y + 36, 150, 40, "#241b14"); R(g, dx, y + 36, 150, 1, "#3a2c20"); R(g, dx + 65, y + 52, 20, 3, "#4a3a2c"); R(g, dx + 65, y + 52, 20, 1, "#7a6248"); }
  };
  // articulated desk lamp standing at (x, y); dir = 1 head points right, -1 left
  const lamp = (g, x, y, t, dir) => {
    dir = dir || 1;
    const hx = x + 30 * dir, hy = y - 66;
    PX.glow(g, hx + 10 * dir, y - 4, 120, "rgba(255,190,110,0.42)");
    ell(g, x, y - 2, 13, 3, "#1e2129"); ell(g, x, y - 3, 12, 2, "#3a3f4b"); R(g, x - 10, y - 5, 12, 1, "#6a7080");
    thick(g, x, y - 5, x - 6 * dir, y - 42, 3, "#3a3f4b"); thick(g, x + 1, y - 5, x - 5 * dir, y - 42, 1, "#6a7080");
    PX.circle(g, x - 6 * dir, y - 43, 2, "#2b2f38");
    thick(g, x - 6 * dir, y - 43, hx - 4 * dir, hy, 3, "#3a3f4b"); thick(g, x - 6 * dir, y - 44, hx - 4 * dir, hy - 1, 1, "#6a7080");
    for (let r = 0; r < 13; r++) { const w = 6 + Math.round(r * 1.3), cx = hx + r * 0.6 * dir; R(g, cx - w / 2, hy + r, w, 1, r < 2 ? "#5a6070" : "#3a3f4b"); R(g, cx - w / 2, hy + r, 1, 1, "#7a8090"); }
    const fl = 0.9 + 0.1 * Math.sin(t * 23) * Math.sin(t * 3.1);
    R(g, hx + 7.8 * dir - 7, hy + 13, 14, 2, "#ffd28a"); PX.glow(g, hx + 8 * dir, hy + 15, 26, "rgba(255,220,150,0.9)", fl);
  };
  // monitor with bezel + stand; content drawn by fn(x, y, w, h) clipped to the screen
  const monitor = (g, x, y, w, h, t, fn, o) => {
    o = o || {};
    PX.glow(g, x + w / 2, y + h / 2, Math.max(w, h) * 0.95, o.glow || "rgba(90,170,255,0.24)");
    const sx = x + w / 2, sb = o.base || y + h + 34;
    R(g, sx - 6, y + h, 12, sb - y - h - 3, "#22262f"); R(g, sx - 6, y + h, 2, sb - y - h - 3, "#3a3f4b");
    R(g, sx - 26, sb - 4, 52, 4, "#262a33"); R(g, sx - 26, sb - 4, 52, 1, "#4a505e"); R(g, sx - 28, sb, 56, 1, "rgba(0,0,0,.5)");
    R(g, x - 6, y - 6, w + 12, h + 14, "#1a1d25"); R(g, x - 6, y - 6, w + 12, 1, "#4e5564"); R(g, x - 6, y - 6, 1, h + 14, "#383e4c");
    R(g, x + w + 5, y - 6, 1, h + 14, "#101218"); R(g, x - 6, y + h + 7, w + 12, 1, "#0c0e13");
    R(g, x + w - 8, y + h + 3, 3, 1, PX.blink(t, 2.4, 0.9) ? "#3df56b" : "#1a4a28");
    R(g, x, y, w, h, "#0d1117");
    clip(g, x, y, w, h, () => fn(x, y, w, h));
    A(g, 0.022, () => { for (let i = 0; i < 3; i++) thick(g, x + w * 0.55 + i * 8, y, x + w * 0.55 + i * 8 - h * 0.6, y + h, 3 - i, "#dfe8ff"); });
  };
  // a generic app window inside a screen
  const appWin = (g, x, y, w, h, title, col) => {
    R(g, x, y, w, h, "#11161f"); R(g, x, y, w, 9, col || "#1f2733"); R(g, x, y + 9, w, 1, "#0a0d12");
    R(g, x + 3, y + 3, 3, 3, "#ff5c5c"); R(g, x + 8, y + 3, 3, 3, "#f7c948"); R(g, x + 13, y + 3, 3, 3, "#3df56b");
    if (title) T(g, title, x + w / 2, y + 1, { font: "v", size: 9, col: "#c9d1d9", align: "center" });
  };
  // code lines [{ind, seg:[[txt,col],..], sq: squiggle}] at (x,y), line height lh
  const code = (g, x, y, lines, lh, o) => {
    o = o || {};
    lines.forEach((ln, i) => {
      if (!ln) return;
      const yy = y + i * lh; let lx = x + (ln.ind || 0) * (o.ind || 6);
      if (ln.hl) R(g, x - 3, yy, o.w || 200, lh, ln.hl);
      for (const [txt, col] of ln.seg) { const w0 = PX.tw(g, txt, { font: "v", size: o.size || 9 }); T(g, txt, lx, yy, { font: "v", size: o.size || 9, col }); if (ln.sq && txt.trim()) for (let k = 0; k < w0; k += 2) R(g, lx + k, yy + lh - 1 - (k % 4 ? 1 : 0), 1, 1, "#ff5c5c"); lx += w0; }
    });
  };
  const KW = "#ff7b72", FN = "#d2a8ff", TX = "#c9d1d9", ST = "#a5d6ff", CM = "#7d8590", NU = "#79c0ff";
  // mouse cursor arrow
  const cursor = (g, x, y) => PX.sprite(g, ["k.......", "kk......", "kwk.....", "kwwk....", "kwwwk...", "kwwwwk..", "kwwwwwk.", "kwwwkkkk", "kwkwk...", "kk.kwk..", "k...kwk.", "....kk.."], Math.round(x), Math.round(y), { k: "#0b0f1a", w: "#e6edf3" });
  // big keycap (foreground keyboard); press 0..1
  const keycap = (g, x, y, w, label, press, col) => {
    const dy = Math.round(press * 3); col = col || ["#5a6070", "#3e4350", "#2a2e38"];
    R(g, x, y + 4, w, 18, "#2a2d36");
    R(g, x + 1, y + dy, w - 2, 18 - dy, col[1]); R(g, x + 1, y + dy + 14 - dy, w - 2, 4, col[2]);
    R(g, x + 3, y + dy + 1, w - 6, 12 - dy * 0.3, col[0]); R(g, x + 3, y + dy + 1, w - 6, 1, col[3] || "#7a8090"); R(g, x + 1, y + dy, 1, 18 - dy, col[3] || "#6a7080");
    if (label) T(g, label, x + w / 2, y + dy + 3, { size: 8, col: col[4] || "#c9d1d9", align: "center" });
  };

  // ---------------- characters ----------------
  const HOOD = { b: "#2f4a86", l: "#3f5fa3", d: "#22356a" }, SKIN = { l: "#e0a77a", b: "#c98a5a", d: "#a0683f" }, HAIR = { b: "#1a120c", l: "#3a2a1c" };
  // close-up front face. ex: "read" | "cringe" | "grin" | "worry"; look: -1..1 eye direction
  const face = (g, cx, cy, t, ex, look) => {
    // shoulders + hood
    for (let r = 0; r < 80; r++) { const w = 230 + r * 1.6; R(g, cx - w / 2, cy + 92 + r, w, 1, HOOD.b); R(g, cx - w / 2, cy + 92 + r, 10, 1, HOOD.l); R(g, cx + w / 2 - 14, cy + 92 + r, 14, 1, HOOD.d); }
    R(g, cx - 110, cy + 92, 220, 3, "#5a86c8");
    ell(g, cx, cy + 96, 62, 16, HOOD.d); ell(g, cx, cy + 92, 52, 12, HOOD.b);
    thick(g, cx - 14, cy + 104, cx - 18, cy + 140, 2, "#d8dee9"); thick(g, cx + 14, cy + 104, cx + 18, cy + 136, 2, "#d8dee9");
    R(g, cx - 20, cy + 140, 4, 4, "#9aa4b2"); R(g, cx + 16, cy + 136, 4, 4, "#9aa4b2");
    R(g, cx - 20, cy + 50, 40, 46, SKIN.d); R(g, cx - 20, cy + 50, 6, 46, SKIN.b);
    // ears
    for (const s of [-1, 1]) { ell(g, cx + s * 58, cy + 6, 9, 14, SKIN.d); ell(g, cx + s * 57, cy + 6, 6, 10, s < 0 ? SKIN.b : SKIN.d); R(g, cx + s * 57 - 1, cy + 2, 3, 8, "#8a5530"); }
    // head (shadow right, rim light left)
    ell(g, cx, cy, 58, 68, SKIN.d); ell(g, cx - 5, cy - 3, 54, 65, SKIN.l); ell(g, cx - 3, cy - 2, 53, 64, SKIN.b);
    ell(g, cx + 30, cy + 20, 18, 30, "#b77a4d");
    // hair
    A(g, 0.35, () => ell(g, cx - 2, cy - 24, 52, 14, "#7a4a2a"));          // shadow of the fringe on the forehead
    g.fillStyle = HAIR.b; ell(g, cx, cy - 42, 64, 38, HAIR.b);
    for (let i = 0; i < 6; i++) { const bx = cx - 52 + i * 20; g.beginPath(); g.moveTo(bx - 4, cy - 66); g.lineTo(bx + 14, cy - 70); g.lineTo(bx + 2 + i * 2, cy - 88 + (i % 2) * 6); g.fill(); }
    R(g, cx - 62, cy - 44, 12, 36, HAIR.b); R(g, cx + 50, cy - 44, 12, 36, HAIR.b);
    for (let i = 0; i < 7; i++) { const bx = cx - 50 + i * 16, len = 12 + ((i * 7) % 5) * 3; g.beginPath(); g.moveTo(bx - 2, cy - 30); g.lineTo(bx + 14, cy - 30); g.lineTo(bx + 4 + (i % 2) * 4, cy - 30 + len); g.fill(); }
    R(g, cx - 34, cy - 74, 40, 3, HAIR.l); R(g, cx - 44, cy - 66, 12, 2, HAIR.l); R(g, cx - 20, cy - 80, 14, 2, HAIR.l); R(g, cx + 10, cy - 76, 10, 2, HAIR.l); R(g, cx - 60, cy - 48, 3, 22, "#5fa0d8");
    const sh = ex === "cringe" ? Math.round(Math.sin(t * 55) * 2) : 0;
    const e = (s) => cx + s * 22 + sh;
    if (ex === "cringe") {
      for (const s of [-1, 1]) {
        thick(g, e(s) - s * 10, cy - 9, e(s) + s * 6, cy - 3, 3, "#2a160c"); thick(g, e(s) + s * 6, cy - 3, e(s) - s * 10, cy + 3, 3, "#2a160c");
        thick(g, e(s) - s * 14, cy - 22, e(s) + s * 10, cy - 15, 4, HAIR.b);
        thick(g, e(s) + s * 12, cy - 10, e(s) + s * 18, cy - 13, 1, "#8a5530"); thick(g, e(s) + s * 12, cy + 4, e(s) + s * 18, cy + 7, 1, "#8a5530");
      }
      thick(g, cx - 3 + sh, cy - 16, cx + 3 + sh, cy - 12, 1, "#8a5530");
      // gritted teeth grimace
      const mx = cx + sh, my = cy + 34;
      rr(g, mx - 28, my - 8, 56, 18, "#3a1410"); R(g, mx - 25, my - 5, 50, 12, "#e2dccf"); R(g, mx - 25, my, 50, 1, "#9a8f80");
      for (let i = 1; i < 7; i++) R(g, mx - 25 + i * 7, my - 5, 1, 12, "#9a8f80");
      R(g, mx - 32, my - 10, 6, 2, "#8a5530"); R(g, mx + 26, my - 10, 6, 2, "#8a5530");
      sweat(g, cx + 46, cy - 30, t, 0); sweat(g, cx - 50, cy - 20, t, 0.5); sweat(g, cx + 40, cy - 6, t, 0.25);
      for (let i = 0; i < 3; i++) { const a = -0.5 + i * 0.5; for (const s of [-1, 1]) thick(g, cx + s * (74 + i * 2), cy - 30 + i * 18, cx + s * (88 + i * 2), cy - 34 + i * 18 + a * 4, 2, "#e6edf3"); }
    } else if (ex === "grin") {
      for (const s of [-1, 1]) {
        for (let i = -9; i <= 9; i++) { const yy = cy - 2 - Math.round(Math.sqrt(Math.max(0, 81 - i * i)) * 0.6); R(g, e(s) + i - 1, yy, 3, 3, "#2a160c"); }
        thick(g, e(s) - 12, cy - 24, e(s) + 10, cy - 26, 4, HAIR.b);
        A(g, 0.45, () => ell(g, e(s) + s * 6, cy + 18, 10, 5, "#f25ca8"));
      }
      R(g, cx - 2, cy + 10, 8, 3, SKIN.d);
      const my = cy + 30;
      g.fillStyle = "#3a1410"; g.beginPath(); g.moveTo(cx - 30, my); g.quadraticCurveTo(cx, my + 34, cx + 30, my); g.closePath(); g.fill();
      g.fillStyle = "#e2dccf"; g.beginPath(); g.moveTo(cx - 26, my + 2); g.lineTo(cx + 26, my + 2); g.lineTo(cx + 22, my + 7); g.lineTo(cx - 22, my + 7); g.fill();
      ell(g, cx + 2, my + 14, 10, 4, "#c0504a");
    } else {
      const worry = ex === "worry";
      for (const s of [-1, 1]) {
        const bl = PX.blink(t + 0.3, 3.1, 0.05);
        ell(g, e(s), cy - 2, 11, bl ? 1 : 8, "#2a160c"); ell(g, e(s), cy - 2, 10, bl ? 0 : 7, "#e2dccf");
        if (!bl) { const lx = e(s) + Math.round((look || 0) * 4); PX.circle(g, lx, cy - 1, 5, "#4a2c18"); PX.circle(g, lx, cy - 1, 3, "#0b0605"); R(g, lx - 3, cy - 4, 2, 2, "#ffffff"); R(g, lx + 1, cy, 3, 2, "#5fe3e8"); }
        R(g, e(s) - 10, cy - 10, 20, 2, "#2a160c");
        thick(g, e(s) - 12, cy - 18 - (worry ? s * 3 : 0), e(s) + 10, cy - 20 + (worry ? s * 3 : 0), 4, HAIR.b);
      }
      R(g, cx - 2, cy + 10, 8, 3, SKIN.d); R(g, cx - 2, cy + 8, 2, 2, SKIN.l);
      if (worry) { rr(g, cx - 8, cy + 30, 16, 8, "#3a1410"); R(g, cx - 5, cy + 31, 10, 2, "#e2dccf"); sweat(g, cx + 44, cy - 24, t, 0); }
      else R(g, cx - 10, cy + 33, 20, 3, "#6a2a1e");
    }
    PX.glow(g, cx - 10, cy + 10, 130, "rgba(95,200,255,0.16)");     // monitor light on the face
  };
  // side-view walker facing right, feet at (x, fy), ph = walk phase (rad)
  const walker = (g, x, fy, ph, t) => {
    const bob = -Math.round(Math.abs(Math.sin(ph)) * 2), hip = fy - 40 + bob, sh = fy - 66 + bob;
    const leg = (p, dark) => {
      const th = Math.sin(p) * 0.5, kn = Math.max(0, -Math.cos(p)) * 0.8 + 0.1;
      const kx = x + Math.sin(th) * 20, ky = hip + Math.cos(th) * 20, fx = kx + Math.sin(th - kn) * 19, fyy = Math.min(fy - 2, ky + Math.cos(th - kn) * 19);
      thick(g, x, hip, kx, ky, 8, dark ? "#1e2638" : "#2d3b55"); thick(g, kx, ky, fx, fyy, 7, dark ? "#1e2638" : "#2d3b55");
      if (!dark) thick(g, x - 3, hip, kx - 3, ky, 1, "#4a5a7a");
      R(g, fx - 4, fyy - 1, 11, 5, dark ? "#2a2a30" : "#e6e1d6"); R(g, fx - 4, fyy + 3, 11, 2, dark ? "#141418" : "#8a8478");
    };
    const arm = (p, dark) => {
      const a = -Math.sin(p) * 0.6, ex = x + Math.sin(a) * 15, ey = sh + 3 + Math.cos(a) * 15, hx = ex + Math.sin(a + 0.5) * 13, hy = ey + Math.cos(a + 0.5) * 13;
      thick(g, x, sh + 3, ex, ey, 7, dark ? HOOD.d : HOOD.b); thick(g, ex, ey, hx, hy, 6, dark ? HOOD.d : HOOD.b);
      if (!dark) thick(g, x - 2, sh + 1, ex - 3, ey, 1, HOOD.l);
      R(g, hx - 2, hy - 2, 5, 5, dark ? SKIN.d : SKIN.b);
    };
    arm(ph + Math.PI, true); leg(ph + Math.PI, true);
    leg(ph, false);
    R(g, x - 9, sh, 19, hip - sh + 4, HOOD.b); R(g, x - 9, sh, 3, hip - sh + 4, HOOD.l); R(g, x + 7, sh, 3, hip - sh + 4, HOOD.d);
    R(g, x - 9, hip, 19, 4, HOOD.d); ell(g, x - 7, sh + 2, 6, 5, HOOD.d);
    R(g, x - 2, sh - 5, 7, 6, SKIN.d);
    const hx = x + 2, hy = sh - 14;
    PX.circle(g, hx, hy, 11, SKIN.b); PX.circle(g, hx - 1, hy - 1, 10, SKIN.l); PX.circle(g, hx, hy, 10, SKIN.b);
    PX.circle(g, hx - 3, hy - 4, 10, HAIR.b); R(g, hx - 8, hy - 13, 12, 2, HAIR.l); R(g, hx + 4, hy - 8, 6, 3, HAIR.b);
    R(g, hx - 2, hy - 1, 4, 5, SKIN.d);
    R(g, hx + 6, hy - 2, 2, 2, "#1a0e08"); R(g, hx + 6, hy - 6, 4, 1, HAIR.b);
    R(g, hx + 5, hy + 5, 4, 1, "#6a2a1e"); R(g, hx + 8, hy + 4, 1, 1, "#6a2a1e");
    arm(ph, false);
  };

  // ---------------- confetti ----------------
  const confetti = (g, t, t0, n, seed) => {
    if (t < t0) return;
    const r = PX.rnd(seed || 9), tt = t - t0, cols = ["#f7c948", "#f25ca8", "#5fe3e8", "#3df56b", "#ff7b5c", "#8a5cf6"];
    for (let i = 0; i < n; i++) {
      const side = i % 2, x0 = side ? 600 : 40, y0 = 330, vx = (side ? -1 : 1) * (40 + r() * 520), vy = -(220 + r() * 260), k = 1.6, fall = 26 + r() * 30;
      const e = (1 - Math.exp(-k * tt)) / k, x = x0 + vx * e + Math.sin(tt * 3 + i) * 8, y = y0 + vy * e + fall * tt * tt * 0.9 + fall * tt;
      if (y > H + 4) continue;
      const flip = Math.floor(tt * 10 + i) % 3, col = cols[i % cols.length];
      R(g, x, y, flip === 0 ? 4 : flip === 1 ? 3 : 2, flip === 0 ? 2 : flip === 1 ? 3 : 4, col); if (flip === 1) R(g, x, y, 1, 1, "#ffffff");
    }
  };
  const poppers = (g, t, t0) => {
    for (const [x, s] of [[30, 1], [610, -1]]) {
      const k = pop(t, t0, 0.3), ang = -0.9 * s;
      g.save(); g.translate(x, 350); g.rotate(ang * (0.3 + 0.7 * k) + (s > 0 ? 0.5 : -0.5));
      for (let r = 0; r < 34; r++) { const w = 2 + Math.round(r * 0.5); R(g, -w / 2, -r, w, 1, (Math.floor(r / 5) % 2) ? "#f25ca8" : "#f7c948"); }
      g.restore();
    }
  };

  // =====================================================================
  // time_machine (15.4): calendar rewinds 3 months, old spaghetti file opens, cringe close-up, CONGRATS,
  // then the treadmill. o.back 0.8, o.open (back+2.2), o.cringe 6.0, o.yay 7.5, o.still 11.5,
  // o.months ["NOV","OCT","SEP","AUG"], o.file "final_v2_REAL.py"
  // =====================================================================
  const SPAGHETTI = [
    { seg: [["def", KW], [" do_stuff", FN], ["(x, xx, data2):", TX]] },
    { ind: 1, seg: [["global", KW], [" temp_final", TX]] },
    { ind: 1, seg: [["if", KW], [" x:", TX]] },
    { ind: 2, seg: [["if", KW], [" xx != ", TX], ["None", NU], [":", TX]], sq: 1 },
    { ind: 3, seg: [["for", KW], [" i ", TX], ["in", KW], [" range(len(data2)):", TX]] },
    { ind: 4, seg: [["if", KW], [" data2[i] == ", TX], ["True", NU], [":", TX]], sq: 1 },
    { ind: 5, seg: [["temp_final = temp_final+1", TX]] },
    { ind: 5, seg: [["if", KW], [" temp_final > ", TX], ["3", NU], [":", TX]] },
    { ind: 6, seg: [["# dont touch this", CM]] },
    { ind: 6, seg: [["try", KW], [":", TX]] },
    { ind: 7, seg: [["x = x", TX]], sq: 1 },
    { ind: 6, seg: [["except", KW], [":", TX]] },
    { ind: 7, seg: [["pass", KW], ["  # ??", CM]] },
    { ind: 1, seg: [["return", KW], [" temp_final", TX], ["  # works?? why", CM]] },
    { seg: [["", TX]] },
    { seg: [["def", KW], [" do_stuff2", FN], ["(x):", TX]] },
    { ind: 1, seg: [["return", KW], [" do_stuff(x,x,x)", TX]], sq: 1 },
    { seg: [["", TX]] },
    { seg: [["temp_final = ", TX], ["0", NU], ["  # dont delete", CM]] },
    { seg: [["print", FN], ["(do_stuff2(", TX], ["5", NU], ["))", TX]] },
  ];
  const CLEAN = [
    { seg: [["def", KW], [" total", FN], ["(items):", TX]] },
    { ind: 1, seg: [["return", KW], [" sum(i.price", TX]] },
    { ind: 3, seg: [["for", KW], [" i ", TX], ["in", KW], [" items)", TX]] },
  ];
  const deskCal = (g, x, y, cur, nxt, k) => {   // flip calendar 52x44 at (x,y); next page swings down over it (k 0..1)
    R(g, x - 4, y + 4, 60, 44, "#141018"); R(g, x - 3, y + 44, 58, 4, "#2a2230"); R(g, x - 4, y + 4, 1, 44, "#3a3040");
    const page = (m, d, hgt, shade) => {
      R(g, x, y + 4, 52, hgt, shade ? "#a8a090" : "#d6cfbf"); R(g, x, y + 4, 52, Math.min(hgt, 12), shade ? "#8a2a22" : "#c0392b");
      if (hgt > 30) { T(g, m, x + 26, y + 6, { size: 8, col: "#f3e9dc", align: "center" }); T(g, String(d), x + 26, y + 19, { size: 16, col: "#2a2430", align: "center" }); }
      R(g, x, y + 3 + hgt, 52, 1, "#6a6458"); R(g, x, y + 4, 1, hgt, "#efe8da");
    };
    page(cur[0], cur[1], 38);
    for (let i = 0; i < 3; i++) R(g, x + 1, y + 43 + i, 50, 1, i % 2 ? "#b8b0a0" : "#8a8476");
    if (k > 0 && k < 1) page(nxt[0], nxt[1], Math.max(1, Math.round(38 * k)), k < 0.6);
    for (let i = 0; i < 4; i++) { R(g, x + 8 + i * 12, y, 3, 7, "#4a4a55"); R(g, x + 8 + i * 12, y, 1, 7, "#8a8a99"); }
  };
  K.time_machine = (o) => {
    const months = o.months || ["NOV", "OCT", "SEP", "AUG"], days = [13, 13, 13, 13];
    return (g, t, d, c) => {
      const back = o.back === undefined ? 0.8 : o.back, open = o.open === undefined ? back + 2.4 : o.open;
      const cringe = o.cringe === undefined ? d * 0.39 : o.cringe, yay = o.yay === undefined ? d * 0.49 : o.yay, still = o.still === undefined ? d * 0.75 : o.still;
      const flips = [back, back + 0.5, back + 0.9], FD = 0.42;
      if (t < cringe) {
        // ---- the room, calendar rewinding
        const rew = t >= back && t < back + 1.5;
        const minAng = t < back ? t * 0.1 : rew ? -((t - back) * 18) : -27 + (t - back - 1.5) * 0.1;
        wall(g, t, c, { clock: minAng, clockX: 452 });
        const DY = 252;
        lamp(g, 64, DY + 4, t, 1);
        desk(g, DY, t);
        // monitor
        monitor(g, 196, 70, 236, 140, t, (x, y, w, h) => {
          if (t < back + 1.6) {
            PX.core.editor(g, x, y, w, h, t, { file: "app.py", lines: CLEAN });
            if (rew) { const r = PX.rnd(Math.floor(t * 20)); for (let i = 0; i < 6; i++) R(g, x, y + r() * h, w, 1 + r() * 3, "rgba(200,220,255,.35)"); }
          } else if (t < open) {
            R(g, x, y, w, h, "#16203a"); appWin(g, x + 14, y + 10, w - 28, h - 20, "~/old_stuff");
            const files = ["test.py", "final.py", "final_v2.py", o.file || "final_v2_REAL.py", "untitled(3).py"];
            files.forEach((f, i) => { const fy = y + 26 + i * 18, sel = i === 3 && t > open - 0.9;
              if (sel) R(g, x + 20, fy - 2, w - 40, 15, "#2f4a86");
              R(g, x + 26, fy, 9, 11, "#c9d1d9"); R(g, x + 32, fy, 3, 3, "#7d8590"); R(g, x + 27, fy + 5, 6, 1, i === 3 ? "#f7c948" : "#5fe3e8"); R(g, x + 27, fy + 7, 5, 1, "#7d8590");
              T(g, f, x + 42, fy, { font: "v", size: 12, col: sel ? "#ffffff" : "#c9d1d9" }); T(g, ["2 KB", "4 KB", "9 KB", "31 KB", "0 KB"][i], x + w - 26, fy, { font: "v", size: 10, col: CM, align: "right" }); });
            const cp = PX.p(t, back + 1.7, 0.9, "io"); cursor(g, PX.lerp(x + w - 30, x + 120, cp), PX.lerp(y + h - 20, y + 26 + 3 * 18 + 4, cp));
          } else {
            const k = PX.p(t, open, 0.25, "out");
            R(g, x, y, w, h, "#0d1117"); R(g, x, y, w, 10, "#161b22"); R(g, x + 3, y + 2, 82, 8, "#0d1117"); T(g, o.file || "final_v2_REAL.py", x + 6, y + 1, { font: "v", size: 10, col: "#f7c948" });
            T(g, "3 months ago", x + w - 4, y + 1, { font: "v", size: 9, col: CM, align: "right" });
            const scroll = Math.max(0, (t - open - 1.2) * 6);
            clip(g, x, y + 11, w, h - 11, () => {
              A(g, k, () => {
                for (let i = 0; i < 20; i++) T(g, String(i + 1), x + 13, y + 13 + i * 8 - scroll, { font: "v", size: 9, col: "#484f58", align: "right" });
                code(g, x + 18, y + 13 - scroll, SPAGHETTI, 8, { ind: 7 });
                // spaghetti jump arrows in the gutter
                g.globalAlpha *= 0.85;
                for (const [a, b, col] of [[3, 16, "#f08a3c"], [6, 19, "#f25ca8"], [1, 12, "#f7c948"]]) {
                  const ya = y + 17 + a * 8 - scroll, yb = y + 17 + b * 8 - scroll, xl = x + w - 18 - (a % 3) * 6;
                  thick(g, xl, ya, xl + 8, ya, 1, col); thick(g, xl + 8, ya, xl + 8 + Math.sin(t * 3 + a) * 3, yb, 1, col); thick(g, xl + 8, yb, xl, yb, 1, col); R(g, xl, yb - 1, 2, 3, col);
                }
              });
            });
          }
        });
        // flip calendar on the desk
        let fi = 0; for (const f of flips) if (t >= f + FD) fi++;
        const cur = flips[fi], fk = cur !== undefined && t >= cur ? PX.ease((t - cur) / FD, "in") : 0;
        const nxt = Math.min(fi + 1, 3);
        deskCal(g, 112, DY - 40, [months[fi], days[fi]], [months[nxt], days[nxt]], fk);
        if (fk > 0 && fk < 1) { for (let i = 0; i < 3; i++) thick(g, 104 - i * 3, DY - 40 + i * 6, 98 - i * 3, DY - 34 + i * 6, 1, "#e6edf3"); }
        PX.core.mug(g, 448, DY + 2, t);
        R(g, 470, DY + 6, 26, 5, "#2a2f3a"); R(g, 470, DY + 6, 26, 1, "#5a6070");   // phone
        // keyboard
        R(g, 262, DY + 8, 104, 12, "#22252d"); R(g, 262, DY + 8, 104, 1, "#4a505c");
        for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 16; kx++) R(g, 265 + kx * 6, DY + 10 + ky * 3, 5, 2, "#5a6270");
        // the coder from behind (right), recoils as the file opens
        const recoil = t > open + 1.6 ? Math.round(PX.p(t, open + 1.6, 0.25, "back") * 4) : 0;
        PX.core.coder(g, 520 + recoil, 290 + recoil, t, { typing: t < back });
        if (t > open + 2.0) sweat(g, 540 + recoil, 250, t, 0);
        // VHS rewind overlay
        if (rew || (t >= back - 0.05 && t < back + 1.7)) {
          const r = PX.rnd(Math.floor(t * 24) + 3);
          for (let i = 0; i < 5; i++) A(g, 0.25, () => R(g, 0, r() * H, W, 1 + r() * 2, "#dfe8ff"));
          const by = 300 + ((t * 300) % 80); A(g, 0.15, () => R(g, 0, by, W, 10, "#dfe8ff"));
          if (PX.blink(t, 0.5, 0.65)) { for (const ox of [0, 12]) { g.fillStyle = "#e6edf3"; g.beginPath(); g.moveTo(94 + ox, 52); g.lineTo(106 + ox, 45); g.lineTo(106 + ox, 59); g.fill(); }
            OT(g, "REW", 124, 48, { size: 16, col: "#e6edf3" }); }
        }
        if (t > back + 1.25 && t < open + 1.0) { const k = pop(t, back + 1.25, 0.4), bx = 196, by = 168; PX.zoom(g, k, bx, by, () => { burst(g, bx, by, 34, "#f25ca8", "#0b0f1a", 0.2); OT(g, "-3", bx, by - 12, { size: 16, col: "#ffffff", align: "center" }); OT(g, "MONTHS", bx, by + 6, { size: 8, col: "#ffffff", align: "center" }); }); }
        PX.particles(g, 11, 24, t, [20, 150, 200, 110], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.7 });
        PX.vignette(g, 0.55);
      } else if (t < still) {
        // ---- close-up: cringe, then CONGRATS
        const tt = t - cringe;
        PX.vgrad(g, 0, 0, W, H, "1d1a3c", "0d0c1e", 8);
        PX.par(g, c, 0.35, () => {
          R(g, 470, 40, 90, 320, "#141228"); R(g, 476, 46, 78, 314, "#1a1832"); R(g, 540, 190, 6, 4, "#5a5070");     // door
          R(g, 70, 70, 70, 90, "#191636"); A(g, 0.6, () => PX.vgrad(g, 74, 74, 62, 82, "3a2a6a", "6a3a7a", 5));         // poster (soft)
          for (let i = 0; i < 12; i++) { const x = 20 + i * 56, y = 30 + Math.sin(i / 11 * 3.14) * 24, col = ["#ffcf8a", "#f25ca8", "#5fe3e8"][i % 3];
            PX.glow(g, x, y, 22, col, 0.35 + 0.15 * Math.sin(t * 2 + i)); A(g, 0.5, () => PX.circle(g, x, y, 5, col)); }
        });
        const ex = t >= yay + 0.15 ? "grin" : tt < 0.35 ? "read" : "cringe";
        const recoil = ex === "cringe" ? Math.round(PX.p(t, cringe + 0.35, 0.3, "back") * 10) : 0;
        face(g, 320, 186 + recoil, t, ex, Math.sin(t * 4));
        if (ex === "cringe" && t < yay) { const k = pop(t, cringe + 0.4, 0.3); PX.zoom(g, k, 520, 110, () => { burst(g, 520, 110, 34, "#ff5c5c", "#0b0f1a", t * 0.5); OT(g, "OOF", 520, 103, { size: 16, col: "#ffffff", align: "center" }); }); }
        if (t >= yay) {
          poppers(g, t, yay); confetti(g, t, yay, 180, 4);
          const word = o.yayText || "CONGRATS!", tw = PX.tw(g, word, { size: 32 });
          let lx = 320 - tw / 2;
          for (let i = 0; i < word.length; i++) {
            const k = pop(t, yay + 0.05 + i * 0.05, 0.35), ch = word[i], cw = PX.tw(g, ch, { size: 32 });
            const yy = 50 + (1 - k) * -60 + Math.round(Math.sin(t * 6 + i * 0.7) * 2);
            if (k > 0) { T(g, ch, lx + 3, yy + 4, { size: 32, col: "#f25ca8" }); OT(g, ch, lx, yy, { size: 32, col: "#f7c948" }); }
            lx += cw;
          }
        }
        PX.vignette(g, 0.5);
      } else {
        // ---- treadmill: walking in place under the PERFECT CODE sign
        const tt = t - still;
        wall(g, t, c, { noPoster: true, clockX: 420 });
        // floor
        R(g, 0, 268, W, 92, "#2a1e18"); R(g, 0, 268, W, 2, "#140e0b");
        for (let i = 0; i < 8; i++) R(g, 0, 272 + i * i * 1.5, W, 1, "#3a2a20");
        for (let i = -6; i < 14; i++) thick(g, 320 + i * 40, 270, 320 + i * 70, 360, 1, "#221813");
        PX.glow(g, 120, 300, 160, "rgba(110,90,200,0.15)");
        // floor lamp right
        PX.glow(g, 560, 150, 140, "rgba(255,190,110,0.35)");
        R(g, 556, 150, 4, 120, "#3a3f4b"); ell(g, 558, 268, 14, 3, "#2b2f38");
        for (let r = 0; r < 18; r++) R(g, 548 - r * 0.4, 130 + r, 22 + r * 0.8, 1, r < 2 ? "#e8c890" : "#c8a070"); R(g, 548, 148, 22, 2, "#ffd28a");
        // neon sign
        const fl = (Math.floor(t * 9) % 23 === 0) ? 0.3 : 1, sk = pop(t, still + 0.4, 0.4);
        PX.zoom(g, sk, 320, 84, () => {
          rr2(g, 214, 60, 212, 48, "#120f22"); rr2(g, 216, 62, 208, 44, "#1a1530");
          thick(g, 260, 40, 250, 60, 1, "#5a5a6a"); thick(g, 380, 40, 390, 60, 1, "#5a5a6a");
          PX.glow(g, 320, 84, 120, "rgba(242,92,168,0.5)", fl);
          A(g, fl, () => { OT(g, o.sign || "PERFECT CODE", 320, 76, { size: 16, col: "#ffb0d8", outline: "#f25ca8", align: "center" }); });
          for (let i = 0; i < 3; i++) { const s = (t * 1.3 + i * 0.33) % 1, sx = 230 + ((i * 71) % 180), sy = 66 + ((i * 37) % 30); if (s < 0.4) { R(g, sx, sy - 2, 1, 5, "#fff3c0"); R(g, sx - 2, sy, 5, 1, "#fff3c0"); } }
        });
        // treadmill
        const tx = 220, tw2 = 220, ty = 252;
        R(g, tx - 6, ty + 16, tw2 + 20, 6, "rgba(0,0,0,.45)");
        R(g, tx, ty, tw2, 16, "#2a2d36"); R(g, tx, ty, tw2, 1, "#5a6070"); R(g, tx, ty + 12, tw2, 4, "#1a1c22");
        R(g, tx + 4, ty - 4, tw2 - 8, 5, "#15161b");
        const belt = (tt * 60) % 14; for (let bx = tx + 4 - belt; bx < tx + tw2 - 6; bx += 14) if (bx > tx + 3) R(g, bx, ty - 3, 6, 1, "#3a3d48");
        PX.circle(g, tx + 6, ty + 4, 6, "#3a3f4b"); PX.circle(g, tx + tw2 - 6, ty + 4, 6, "#3a3f4b"); PX.circle(g, tx + 6, ty + 4, 2, "#5a6070");
        // console posts
        thick(g, tx + tw2 - 14, ty, tx + tw2 - 2, ty - 92, 5, "#3a3f4b"); thick(g, tx + tw2 - 15, ty, tx + tw2 - 3, ty - 92, 1, "#6a7080");
        R(g, tx + tw2 - 30, ty - 104, 54, 18, "#22252d"); R(g, tx + tw2 - 30, ty - 104, 54, 1, "#5a6070");
        R(g, tx + tw2 - 26, ty - 100, 30, 10, "#0e1a14"); T(g, "0.00KM", tx + tw2 - 11, ty - 100, { font: "v", size: 10, col: "#3df56b", align: "center" });
        R(g, tx + tw2 + 10, ty - 99, 4, 4, PX.blink(t, 0.8) ? "#ff5c5c" : "#5a2020");
        thick(g, tx + tw2 - 24, ty - 86, tx + tw2 - 16, ty - 62, 3, "#4a505c"); R(g, tx + 120, ty - 63, tw2 - 136, 4, "#4a505c"); R(g, tx + 120, ty - 63, tw2 - 136, 1, "#7a8090"); R(g, tx + 116, ty - 64, 6, 6, "#22252d");
        const sw = Math.sin(t * 2.2) * 1.5; R(g, tx + 150, ty - 61, 14, 3, "#c0507a"); R(g, tx + 150 + sw * 0.3, ty - 58, 7, 18, "#d8608a"); R(g, tx + 157 + sw * 0.5, ty - 58, 7, 14, "#a8406a"); R(g, tx + 150 + sw * 0.3, ty - 42, 7, 2, "#f2a0c0");
        // cobweb on the console (has not moved in ages)
        A(g, 0.55, () => { for (let i = 0; i < 4; i++) thick(g, tx + tw2 + 24, ty - 104, tx + tw2 + 24 - 12 + i * 4, ty - 86 + i * 2, 1, "#c8d0dc"); for (let i = 1; i < 4; i++) thick(g, tx + tw2 + 24 - i * 4, ty - 104 + i * 5, tx + tw2 + 24, ty - 104 + i * 6, 1, "#c8d0dc"); });
        walker(g, 330, ty - 4, tt * 7.5, t);
        // dust kicked off the back of the belt
        for (let i = 0; i < 6; i++) { const k = ((tt * 1.2 + i / 6) % 1); A(g, 0.5 * (1 - k), () => ell(g, tx - 4 - k * 30, ty + 8 - k * 14 + Math.sin(i) * 4, 3 + k * 6, 2 + k * 3, "#8a7a6a")); }
        PX.particles(g, 31, 30, t, [100, 120, 440, 150], { vy: -2, vx: 3, col: "#ffe2b0", a: 0.5 });
        PX.vignette(g, 0.55);
      }
    };
  };

  // =====================================================================
  // paste_loop (12.5): error -> CTRL+C -> chat app -> CTRL+V -> green check, looping faster; the LEARNING jar drains
  // by o.drain (6.6); at o.rewire (8.6) cut to an X-ray lightbox in a clinic: new neural paths light up.
  // o.label "STRUGGLE = REWIRING"
  // =====================================================================
  // loop k lasts max(0.55, 2.6 * 0.74^k) s; returns [loop index, phase 0..1]
  const loopAt = (t) => { let k = 0, s = 0; for (;;) { const dk = Math.max(0.55, 2.6 * Math.pow(0.74, k)); if (t < s + dk || k > 60) return [k, (t - s) / dk]; s += dk; k++; } };
  const jar = (g, x, y, level, t, label, drip) => {   // glass jar standing on y, 46 x 62
    const w = 54, h = 74, x0 = x - w / 2, top = y - h;
    PX.glow(g, x, y - h * level * 0.5, 60, "rgba(61,245,107,0.35)", level > 0.02 ? 0.4 + 0.6 * level : 0);
    R(g, x0 + 1, y + 1, w - 2, 2, "rgba(0,0,0,.45)");
    rr2(g, x0, top + 6, w, h - 6, "#1b2a33");                                     // glass back
    const lv = Math.round((h - 12) * level), ly = y - 3 - lv;
    if (lv > 0) {
      R(g, x0 + 3, ly, w - 6, lv, "#1f8a48"); R(g, x0 + 3, ly, w - 6, 2, "#3df56b"); R(g, x0 + 3, ly + 2, 6, lv - 2, "#28a85a");
      for (let i = 0; i < 6; i++) { const k = (t * 0.7 + i / 6) % 1, bx = x0 + 8 + ((i * 13) % (w - 16)), by = y - 4 - k * lv; if (by > ly + 2) R(g, bx + Math.round(Math.sin(t * 4 + i)), by, 2, 2, "#8affb0"); }
      R(g, x0 + 3 + ((t * 9) % (w - 10)), ly, 4, 1, "#b8ffd0");
    } else { R(g, x0 + 3, y - 5, w - 6, 2, "#173a26"); }
    R(g, x0, top + 6, 2, h - 6, "#6a8a9a"); R(g, x0 + 4, top + 10, 2, h - 20, "#cfe6f0"); R(g, x0 + w - 2, top + 6, 2, h - 6, "#2a3a44");
    R(g, x0 - 2, top, w + 4, 8, "#8a6446"); R(g, x0 - 2, top, w + 4, 1, "#c09070"); R(g, x0 - 2, top + 7, w + 4, 1, "#4a3020");
    R(g, x0 + 4, top + 26, w - 8, 16, "#d6cfbf"); R(g, x0 + 4, top + 26, w - 8, 1, "#efe8da"); R(g, x0 + 4, top + 41, w - 8, 1, "#9a9284");
    T(g, label || "LEARNING", x, top + 30, { font: "v", size: 11, col: "#3a2a20", align: "center" });
    if (drip) { R(g, x + w / 2 - 2, y - 8, 7, 4, "#9aa4b2"); R(g, x + w / 2 + 3, y - 8, 2, 7, "#9aa4b2"); const k = (t * 2.4) % 1; R(g, x + w / 2 + 3, y - 1 + k * 8, 2, 3, "#3df56b"); }
  };
  // X-ray lightbox with a brain; links light up from t0 over dur
  const NEUR = [[-60, -14], [-38, -34], [-10, -42], [22, -38], [50, -24], [66, 0], [-48, 10], [-20, -12], [10, -16], [36, -4], [-28, 24], [4, 14], [30, 22], [56, 26], [-6, 36]];
  const LINKS = [[7, 8], [8, 9], [1, 7], [9, 5], [6, 10], [10, 11], [11, 12], [12, 13], [2, 8], [3, 9], [0, 6], [11, 14], [4, 9], [7, 10], [8, 11], [9, 12]];
  const xrayBrain = (g, cx, cy, t, t0, dur) => {
    const r = PX.rnd(17);
    // outline: cerebrum, cerebellum, stem
    const film = "#121a24", bone = "#9cc4d6";
    ell(g, cx, cy, 92, 62, bone); ell(g, cx + 48, cy + 48, 32, 22, bone); R(g, cx + 22, cy + 50, 14, 40, bone);
    ell(g, cx, cy, 89, 59, film); ell(g, cx + 48, cy + 48, 29, 19, film); R(g, cx + 25, cy + 52, 8, 40, film);
    ell(g, cx, cy, 89, 59, "#18232f"); ell(g, cx - 4, cy - 4, 80, 50, "#1b2836");
    // gyri: wiggly faint lines
    for (let i = 0; i < 12; i++) {
      const x0 = cx - 75 + r() * 140, y0 = cy - 45 + r() * 80; let px = x0, py = y0;
      for (let k = 1; k < 9; k++) { const nx = x0 + k * 5, ny = y0 + Math.sin(k * 1.3 + i) * 5; if (((nx - cx) / 86) ** 2 + ((ny - cy) / 56) ** 2 < 1) thick(g, px, py, nx, ny, 1, "#2e4256"); px = nx; py = ny; }
    }
    for (let i = 0; i < 4; i++) thick(g, cx + 30 + i * 8, cy + 36, cx + 34 + i * 8, cy + 62, 1, "#2e4256");
    // links growing
    LINKS.forEach(([a, b], i) => {
      const ti = t0 + (i / LINKS.length) * dur, k = PX.p(t, ti, 0.35, "out"); if (k <= 0) return;
      const [ax, ay] = NEUR[a], [bx, by] = NEUR[b], ex = cx + ax + (bx - ax) * k, ey = cy + ay + (by - ay) * k;
      PX.glow(g, (cx * 2 + ax + bx) / 2, (cy * 2 + ay + by) / 2, 22, "rgba(95,227,232,0.35)", k);
      thick(g, cx + ax, cy + ay, ex, ey, 2, "#3fb8c8"); thick(g, cx + ax, cy + ay, ex, ey, 1, "#a8f4ff");
      if (k >= 1) { const u = (t * 1.5 + i * 0.37) % 1; R(g, cx + ax + (bx - ax) * u - 1, cy + ay + (by - ay) * u - 1, 3, 3, "#f7f3c0"); }
    });
    NEUR.forEach(([x, y], i) => {
      const lit = LINKS.some(([a, b], j) => (a === i || b === i) && t >= t0 + (j / LINKS.length) * dur);
      if (lit) PX.glow(g, cx + x, cy + y, 10, "rgba(160,250,255,0.8)", 0.7 + 0.3 * Math.sin(t * 6 + i));
      PX.circle(g, cx + x, cy + y, 2, lit ? "#c8fbff" : "#3a5266");
    });
  };
  K.paste_loop = (o) => (g, t, d, c) => {
    const drain = o.drain === undefined ? d * 0.53 : o.drain, rewire = o.rewire === undefined ? d * 0.69 : o.rewire;
    if (t < rewire) {
      const DY = 250, [n, u] = loopAt(Math.max(0, t));
      wall(g, t, c, {});
      lamp(g, 604, DY + 4, t, -1);
      desk(g, DY, t);
      const step = u < 0.2 ? 0 : u < 0.3 ? 1 : u < 0.62 ? 2 : u < 0.72 ? 3 : 4;
      monitor(g, 140, 54, 268, 156, t, (x, y, w, h) => {
        const ERR = ["TypeError", "KeyError", "IndexError", "NameError", "ValueError", "ZeroDivision"][n % 6];
        PX.core.editor(g, x, y, w, h, t, { file: "app.py", lines: [
          { seg: [["def", KW], [" load", FN], ["(cfg):", TX]] }, { ind: 1, seg: [["data = read(cfg)", TX]] },
          { ind: 1, seg: [["return", KW], [" data[", TX], ["'key'", ST], ["]", TX]], hl: step === 4 ? "rgba(61,245,107,.18)" : step < 2 ? "rgba(255,92,92,.18)" : null },
          { seg: [["", TX]] }, { seg: [["load(", TX], ["'app.cfg'", ST], [")", TX]] }] });
        if (step <= 1) {                                            // red error popup
          const sh = u < 0.08 ? Math.round(Math.sin(t * 70) * 3) : 0;
          const px = x + w / 2 - 70 + sh, py = y + 40;
          R(g, px + 3, py + 3, 140, 66, "rgba(0,0,0,.5)"); R(g, px, py, 140, 66, "#2a1418"); R(g, px, py, 140, 12, "#c03a3a"); R(g, px, py, 140, 1, "#ff8a8a");
          T(g, "ERROR", px + 6, py + 2, { size: 8, col: "#ffe0e0" }); R(g, px + 128, py + 3, 7, 7, "#7a1a1a"); cross(g, px + 129, py + 4, 4, "#ffd0d0");
          PX.circle(g, px + 20, py + 34, 10, "#ff5c5c"); cross(g, px + 15, py + 29, 10, "#2a1418");
          T(g, ERR + ":", px + 38, py + 22, { font: "v", size: 12, col: "#ff9a9a" }); T(g, "line 3 in load", px + 38, py + 33, { font: "v", size: 11, col: "#d0a0a0" });
          if (step === 1) R(g, px + 36, py + 22, 98, 22, "rgba(95,140,255,.35)");
          rr(g, px + 98, py + 50, 34, 11, "#5a2a2e"); T(g, "OK", px + 115, py + 51, { font: "v", size: 10, col: "#ffd0d0", align: "center" });
        } else if (step <= 3) {                                     // chat app
          const cx0 = x + 10, cy0 = y + 12, k = PX.p(u, 0.3, 0.06, "back");
          PX.zoom(g, 0.6 + 0.4 * k, x + w / 2, y + h / 2, () => {
            appWin(g, cx0, cy0, w - 20, h - 20, "chat", "#26203a");
            R(g, cx0, cy0 + 10, 36, h - 30, "#181428"); for (let i = 0; i < 4; i++) { PX.circle(g, cx0 + 18, cy0 + 22 + i * 18, 6, ["#8a5cf6", "#2a9fad", "#f08a3c", "#5a6b78"][i]); }
            R(g, cx0 + 2, cy0 + 14, 2, 16, "#f25ca8");
            const mx = cx0 + 44, mw = w - 20 - 50;
            if (u > 0.34) { const bw = 108; rr2(g, mx + mw - bw - 4, cy0 + 16, bw, 26, "#3a4aa0"); T(g, "fix this pls:", mx + mw - bw + 2, cy0 + 17, { font: "v", size: 10, col: "#e6edf3" });
              T(g, ERR + ": line 3", mx + mw - bw + 2, cy0 + 27, { font: "v", size: 10, col: "#ff9a9a" }); }
            if (u > 0.42) { rr2(g, mx, cy0 + 48, 120, 52, "#2a2f3c"); R(g, mx + 4, cy0 + 52, 10, 10, "#3df56b"); R(g, mx + 6, cy0 + 54, 6, 6, "#1a5a30");
              const dots = u < 0.48; if (dots) for (let i = 0; i < 3; i++) R(g, mx + 20 + i * 6, cy0 + 56 + (Math.floor(t * 8 + i) % 2), 3, 3, "#9aa4b2");
              else { T(g, "here, paste this:", mx + 18, cy0 + 52, { font: "v", size: 10, col: "#c9d1d9" }); R(g, mx + 6, cy0 + 66, 108, 30, "#0d1117");
                T(g, PX.typed("data.get('key')", u * 10, 4.9, 30), mx + 9, cy0 + 70, { font: "v", size: 10, col: "#3df56b" }); T(g, PX.typed("# trust me", u * 10, 5.3, 30), mx + 9, cy0 + 80, { font: "v", size: 10, col: CM }); }
              if (step === 3) R(g, mx + 6, cy0 + 66, 108, 30, "rgba(95,140,255,.35)"); }
          });
        } else {                                                    // pasted, green check
          const k = pop(t, t - (u - 0.72) * Math.max(0.55, 2.6 * Math.pow(0.74, n)), 0.3);
          PX.zoom(g, k, x + w - 40, y + 40, () => { PX.glow(g, x + w - 40, y + 40, 40, "rgba(61,245,107,0.5)"); PX.circle(g, x + w - 40, y + 40, 18, "#0b0f1a"); PX.circle(g, x + w - 40, y + 40, 16, "#2fae5a"); PX.circle(g, x + w - 41, y + 39, 13, "#3df56b"); tick(g, x + w - 50, y + 32, 20, "#0b3a1a"); });
          OT(g, "IT WORKS?", x + w - 40, y + 64, { font: "v", size: 14, col: "#3df56b", align: "center" });
        }
        // loop counter
        R(g, x + 4, y + h - 14, 54, 11, "#161b22"); T(g, "LOOP x" + (n + 1), x + 8, y + h - 13, { font: "v", size: 11, col: n > 4 ? "#ff9a9a" : "#c9d1d9" });
      });
      // jar of LEARNING drains a little on every paste
      const lev = PX.clamp(1 - PX.ease(t / drain, "io"), 0, 1);
      jar(g, 470, DY + 14, lev, t, "LEARNING", lev > 0.01);
      if (t > drain) { const k = pop(t, drain, 0.35); PX.zoom(g, k, 470, DY - 62, () => { OT(g, "EMPTY", 470, DY - 66, { size: 8, col: "#ff5c5c", align: "center" }); }); }
      PX.core.mug(g, 104, DY + 6, t);
      plant(g, 66, DY + 14, t);
      // foreground keyboard with big CTRL / C / V keys (closest layer)
      PX.par(g, c, 1.25, () => {
        R(g, 30, 296, 580, 76, "#16181e"); R(g, 30, 296, 580, 2, "#3a3f4b");
        for (let i = 0; i < 17; i++) { R(g, 38 + i * 34, 300, 30, 10, "#2a2e38"); R(g, 39 + i * 34, 300, 28, 7, "#3e4350"); R(g, 39 + i * 34, 300, 28, 1, "#5a6070"); }
        for (let i = 0; i < 56; i++) R(g, 44 + i * 10, 370 - 4, 10, 2, RGB(t, i));
        PX.glow(g, 320, 350, 260, "rgba(160,90,255,0.22)");
        const pc = step === 1 ? Math.sin(PX.clamp((u - 0.2) / 0.1, 0, 1) * 3.14) : 0, pv = step === 3 ? Math.sin(PX.clamp((u - 0.62) / 0.1, 0, 1) * 3.14) : 0;
        const keys = [[48, 30, ""], [82, 30, ""], [116, 52, "CTRL", Math.max(pc, pv)], [172, 30, ""], [206, 30, "X"], [240, 30, "C", pc], [274, 30, "V", pv], [308, 30, "B"], [342, 30, ""], [376, 30, ""], [410, 30, ""], [444, 30, ""], [478, 52, ""], [534, 30, ""]];
        for (const [kx, kw, lab, pr] of keys) keycap(g, kx, 318, kw, lab, pr || 0, lab === "CTRL" || lab === "C" || lab === "V" ? ["#d8b060", "#a8803a", "#6a4a20", "#f0d090", "#2a1a08"] : null);
        if (pc > 0.5) { burst(g, 210, 296, 22, "#f7c948", "#0b0f1a", t); OT(g, "CTRL+C", 210, 292, { size: 8, col: "#0b0f1a", outline: "#f7c948", align: "center" }); }
        if (pv > 0.5) { burst(g, 300, 296, 22, "#5fe3e8", "#0b0f1a", t); OT(g, "CTRL+V", 300, 292, { size: 8, col: "#0b0f1a", outline: "#5fe3e8", align: "center" }); }
      });
      PX.particles(g, 12, 22, t, [440, 120, 180, 120], { vy: -3, vx: -2, col: "#ffe2b0", a: 0.6 });
      PX.vignette(g, 0.55);
    } else {
      // ---- clinic: X-ray lightbox
      const tt = t - rewire;
      PX.vgrad(g, 0, 0, W, H, "1a2c36", "0e1a22", 8);
      for (let y = 0; y < 260; y += 20) { R(g, 0, y, W, 1, "#122028"); for (let x = (y / 20) % 2 ? 10 : 0; x < W; x += 20) R(g, x, y, 1, 20, "#122028"); }
      for (let y = 1; y < 260; y += 20) A(g, 0.5, () => R(g, 0, y, W, 1, "#2a4450"));
      // ceiling strip light flicker
      const fl = (Math.floor(t * 12) % 31 === 0) ? 0.4 : 1;
      R(g, 220, 0, 200, 6, "#2a3a44"); R(g, 226, 6, 188, 3, "#c8e4ee"); PX.glow(g, 320, 10, 200, "rgba(170,220,240,0.25)", fl);
      PX.par(g, c, 0.6, () => {
        // eye chart
        R(g, 520, 60, 70, 100, "#0e161c"); R(g, 522, 62, 66, 96, "#a8b4b0"); R(g, 522, 62, 66, 1, "#c8d4d0");
        ["E", "FP", "TOZ", "LPED"].forEach((l, i) => T(g, l, 555, 68 + i * 20, { size: [16, 8, 8, 8][i], col: "#1a2024", align: "center" }));
        // clipboard on a hook
        R(g, 72, 80, 3, 4, "#9aa4b2"); R(g, 56, 86, 36, 48, "#7a5a3a"); R(g, 60, 92, 28, 38, "#c8c2b4"); R(g, 66, 84, 16, 5, "#9aa4b2");
        for (let i = 0; i < 5; i++) R(g, 63, 98 + i * 6, 14 + (i * 5) % 9, 1, "#5a6070");
      });
      // counter at the bottom
      R(g, 0, 268, W, 92, "#1c2a30"); R(g, 0, 268, W, 4, "#6a8a94"); R(g, 0, 268, W, 1, "#a8c8d0"); R(g, 0, 272, W, 2, "#0e1418");
      for (let i = 0; i < 4; i++) { R(g, 20 + i * 160, 284, 140, 70, "#16222a"); R(g, 20 + i * 160, 284, 140, 1, "#2a3c44"); R(g, 82 + i * 160, 300, 16, 3, "#6a8a94"); }
      // lightbox
      const lx = 160, ly = 34, lw = 320, lh = 210;
      PX.glow(g, 320, 140, 260, "rgba(140,200,230,0.25)", fl);
      R(g, lx - 8, ly - 8, lw + 16, lh + 16, "#2a3640"); R(g, lx - 8, ly - 8, lw + 16, 1, "#7a8a94"); R(g, lx - 8, ly - 8, 1, lh + 16, "#5a6a74");
      PX.vgrad(g, lx, ly, lw, lh, "5f93a8", "40687c", 6);
      R(g, lx + 10, ly + 10, lw - 20, lh - 24, "#121a24"); R(g, lx + 18, ly + 12, lw - 36, 1, "#2a3a48");
      R(g, lx + 150, ly + 4, 20, 10, "#c8c2b0"); R(g, lx + 154, ly + 2, 12, 3, "#9aa4b2");   // clip
      xrayBrain(g, 310, 128, t, rewire + 0.3, Math.min(2.6, d - rewire - 0.6));
      T(g, "L", lx + 26, ly + 18, { size: 8, col: "#5a7a8a" });
      // the jar refills on the counter
      jar(g, 548, 270, PX.clamp(PX.ease(tt / Math.max(1, d - rewire - 0.4), "io"), 0, 1), t, "LEARNING", false);
      R(g, 80, 252, 16, 18, "#c8d0d4"); R(g, 80, 252, 16, 2, "#e8f0f4"); R(g, 82, 244, 12, 8, "#e8e4dc");   // cotton jar
      const lk = pop(t, rewire + 1.2, 0.4);
      if (lk > 0) PX.zoom(g, lk, 320, ly + lh - 6, () => { rr2(g, 196, ly + lh - 16, 248, 22, "#0b0f1a"); OT(g, o.label || "STRUGGLE = REWIRING", 320, ly + lh - 12, { size: 8, col: "#5fe3e8", align: "center" }); });
      PX.particles(g, 13, 20, t, [160, 40, 320, 200], { vy: -2, vx: 1, col: "#cfeaff", a: 0.4 });
      PX.vignette(g, 0.55);
    }
  };

  // =====================================================================
  // think_vs_real (6.0): two framed screens on a gallery-lit wall. LEFT "WHAT YOU THINK IT DOES" (neat flowchart),
  // RIGHT "WHAT IT ACTUALLY DOES" (tangled flow, sparks, smoke, a gremlin bug). o.left 0.2, o.real 1.6
  // =====================================================================
  const gremlin = (g, x, y, t, dir) => {        // little bug creature ~30x22, dir 1 = facing right
    const f = Math.floor(t * 14) % 2, s = dir || 1;
    for (let i = 0; i < 3; i++) { const lx = x - 8 + i * 7, k = (f + i) % 2; thick(g, lx, y + 5, lx - 3 + k * 6, y + 12, 2, "#2a0e16"); }
    ell(g, x, y, 14, 9, "#2a0e16"); ell(g, x, y - 1, 13, 8, "#8a2a46"); ell(g, x - 1, y + 3, 11, 4, "#6a1e36");
    ell(g, x - 3 * s, y - 4, 7, 3, "#c04a6a"); R(g, x - 5 * s, y - 6, 3, 1, "#f08aa8");
    for (let i = 0; i < 3; i++) R(g, x - 8 + i * 6, y - 8 + (i % 2), 2, 3, "#2a0e16");               // spikes
    const hx = x + 13 * s; PX.circle(g, hx, y - 2, 8, "#2a0e16"); PX.circle(g, hx, y - 2, 7, "#a03656"); PX.circle(g, hx - s, y - 4, 4, "#c04a6a");
    for (const ex of [hx - 1 * s, hx + 4 * s]) { R(g, ex - 1, y - 6, 3, 3, "#ffd0d0"); R(g, ex, y - 5, 2, 2, "#ff2a2a"); }
    PX.glow(g, hx + 2 * s, y - 5, 12, "rgba(255,80,80,0.7)");
    R(g, hx - 4, y + 1, 9, 3, "#1a0408"); for (let i = 0; i < 4; i++) R(g, hx - 4 + i * 2 + (f ? 1 : 0), y + 1, 1, 2, "#f3e9dc");
    thick(g, hx - 2 * s, y - 9, hx - 5 * s, y - 17 + f, 1, "#2a0e16"); thick(g, hx + 3 * s, y - 9, hx + 6 * s, y - 17 + f, 1, "#2a0e16");
    R(g, hx - 5 * s - 1, y - 18 + f, 3, 2, "#ff5c5c"); R(g, hx + 6 * s - 1, y - 18 + f, 3, 2, "#ff5c5c");
  };
  const flowBox = (g, x, y, w, h, label, col, fill) => {
    rr(g, x - 1, y - 1, w + 2, h + 2, "#05070c"); rr(g, x, y, w, h, fill || "#13283a"); R(g, x + 1, y, w - 2, 1, col); R(g, x, y + 1, 1, h - 2, col);
    R(g, x + 1, y + h - 1, w - 2, 1, "rgba(0,0,0,.4)");
    T(g, label, x + w / 2, y + h / 2 - 5, { font: "v", size: 11, col: col, align: "center" });
  };
  const arrow = (g, x1, y1, x2, y2, col) => {
    thick(g, x1, y1, x2, y2, 1, col); const a = Math.atan2(y2 - y1, x2 - x1);
    thick(g, x2, y2, x2 - Math.cos(a - 0.5) * 4, y2 - Math.sin(a - 0.5) * 4, 1, col); thick(g, x2, y2, x2 - Math.cos(a + 0.5) * 4, y2 - Math.sin(a + 0.5) * 4, 1, col);
  };
  const pictureLight = (g, cx, y, t, on) => {
    R(g, cx - 30, y, 60, 5, "#6a5230"); R(g, cx - 30, y, 60, 1, "#c8a060"); R(g, cx - 2, y - 10, 4, 10, "#4a3a22");
    R(g, cx - 28, y + 5, 56, 1, on ? "#ffe0a0" : "#4a3a22");
    if (on) { PX.glow(g, cx, y + 40, 140, "rgba(255,200,130,0.28)", 0.9 + 0.1 * Math.sin(t * 5)); }
  };
  K.think_vs_real = (o) => (g, t, d, c) => {
    const left = o.left === undefined ? 0.2 : o.left, real = o.real === undefined ? Math.min(1.6, d * 0.27) : o.real;
    PX.vgrad(g, 0, 0, W, H, "1c2246", "10142c", 10);
    A(g, 0.04, () => { for (let x = 0; x < W; x += 20) R(g, x, 0, 1, 250, "#a8b8ff"); });
    // wainscot + floor
    R(g, 0, 238, W, 52, "#2a1e30"); R(g, 0, 238, W, 3, "#4a3650"); R(g, 0, 241, W, 1, "#140e18");
    for (let x = 10; x < W; x += 80) { R(g, x, 248, 68, 34, "#241a2a"); R(g, x, 248, 68, 1, "#3a2c42"); R(g, x, 281, 68, 1, "#140e18"); }
    R(g, 0, 290, W, 70, "#2a1e18"); R(g, 0, 290, W, 2, "#120c0a");
    for (let i = -8; i < 16; i++) thick(g, 320 + i * 40, 292, 320 + i * 64, 360, 1, "#1e1612");
    for (let i = 0; i < 5; i++) R(g, 0, 296 + i * i * 2.6, W, 1, "#33251d");
    PX.glow(g, 171, 300, 120, "rgba(255,207,138,0.16)"); PX.glow(g, 469, 300, 120, "rgba(255,207,138,0.16)");   // light pools on the floor
    // far: door + plant (parallax)
    PX.par(g, c, 0.55, () => {
      R(g, 296, 120, 48, 118, "#151a34"); R(g, 300, 124, 40, 114, "#1a2040"); R(g, 334, 180, 3, 3, "#8a7a5a");
      A(g, 0.6, () => { for (let i = 0; i < 3; i++) R(g, 300, 128 + i * 36, 40, 1, "#232a50"); });
    });
    PX.par(g, c, 0.8, () => {
      for (const [px, sc] of [[22, 1], [618, -1]]) {
        R(g, px - 12, 262, 24, 28, "#5a3a2a"); R(g, px - 13, 260, 26, 4, "#7a5038"); R(g, px - 12, 262, 3, 28, "#8a5a40");
        for (let i = 0; i < 7; i++) { const a = -1.57 + (i - 3) * 0.32 + Math.sin(t * 1.1 + i) * 0.04, len = 40 + (i % 3) * 16; thick(g, px, 260, px + Math.cos(a) * len * 0.5, 260 + Math.sin(a) * len, 2, i % 2 ? "#2f6a3e" : "#3d7a4a");
          ell(g, px + Math.cos(a) * len * 0.5, 260 + Math.sin(a) * len, 5, 3, "#4f9a5c"); R(g, px + Math.cos(a) * len * 0.5 - 3, 258 + Math.sin(a) * len, 3, 1, "#7fcf8a"); }
      }
    });
    const frame = (fx, fy, fw, fh, on, chaos) => {
      R(g, fx - 10, fy - 10, fw + 20, fh + 20, "#3a2a1a"); R(g, fx - 10, fy - 10, fw + 20, 2, "#a07a46"); R(g, fx - 10, fy - 10, 2, fh + 20, "#8a6a3c");
      R(g, fx + fw + 8, fy - 10, 2, fh + 20, "#22180e"); R(g, fx - 10, fy + fh + 8, fw + 20, 2, "#1a1209");
      R(g, fx - 6, fy - 6, fw + 12, fh + 12, "#14100a"); R(g, fx - 2, fy - 2, fw + 4, fh + 4, "#0a0c12");
      R(g, fx, fy, fw, fh, on ? (chaos ? "#1a1018" : "#0e1a26") : "#07090e");
      if (on) PX.glow(g, fx + fw / 2, fy + fh / 2, fw * 0.7, chaos ? "rgba(255,92,92,0.16)" : "rgba(95,227,232,0.14)");
    };
    const LX = 64, RX = 362, FY = 54, FW = 214, FH = 150;
    pictureLight(g, LX + FW / 2, FY - 22, t, t >= left);
    pictureLight(g, RX + FW / 2, FY - 22, t, t >= real);
    frame(LX, FY, FW, FH, t >= left, false);
    // ---- left: neat flowchart, a calm data dot travelling
    if (t >= left) clip(g, LX, FY, FW, FH, () => {
      const k = PX.p(t, left, 0.6, "out"); g.globalAlpha = k;
      A(g, 0.12, () => { for (let x = LX; x < LX + FW; x += 10) R(g, x, FY, 1, FH, "#5fe3e8"); for (let y = FY; y < FY + FH; y += 10) R(g, LX, y, FW, 1, "#5fe3e8"); });
      const cx = LX + FW / 2, B = [["START", 12], ["INPUT", 44], ["PROCESS", 76], ["OUTPUT", 108]];
      B.forEach(([lab, by], i) => { flowBox(g, cx - 34, FY + by, 68, 18, lab, i === 3 ? "#3df56b" : "#5fe3e8"); if (i < 3) arrow(g, cx, FY + by + 19, cx, FY + by + 31, "#5fe3e8"); });
      const u = ((t - left) * 0.45) % 1, dy = FY + 21 + u * 96; PX.glow(g, cx, dy, 10, "rgba(247,201,72,0.9)"); R(g, cx - 2, dy - 2, 4, 4, "#f7c948");
      tick(g, cx + 44, FY + 112, 10, "#3df56b");
      g.globalAlpha = 1;
    });
    frame(RX, FY, FW, FH, t >= real, true);
    // ---- right: tangled reality
    if (t >= real) clip(g, RX, FY, FW, FH, () => {
      const tt = t - real, cx = RX + FW / 2, r = PX.rnd(5), jit = (i) => Math.round(Math.sin(t * 9 + i * 2.1) * (tt > 1 ? 1 : 0));
      const boxes = [[cx - 58, FY + 14, "START"], [cx + 18, FY + 30, "INPUT"], [cx - 70, FY + 70, "PROCESS"], [cx + 6, FY + 92, "OUTPUT"], [cx - 28, FY + 120, "???"]];
      // spaghetti arrows: grow in with time
      const paths = 14, shown = Math.min(paths, Math.floor(tt * 7) + 3);
      for (let i = 0; i < shown; i++) {
        const a = boxes[Math.floor(r() * 5)], b = boxes[Math.floor(r() * 5)], col = ["#ff5c5c", "#f7c948", "#f25ca8", "#5fe3e8", "#f08a3c"][i % 5];
        const x1 = a[0] + 30, y1 = a[1] + 9, x2 = b[0] + 30 + (i % 3) * 6, y2 = b[1] + 9 + (i % 2) * 4, mx = (x1 + x2) / 2 + (r() - 0.5) * 160, my = (y1 + y2) / 2 + (r() - 0.5) * 120;
        let px = x1, py = y1;
        for (let k = 1; k <= 16; k++) { const s2 = k / 16, nx = (1 - s2) * (1 - s2) * x1 + 2 * (1 - s2) * s2 * mx + s2 * s2 * x2, ny = (1 - s2) * (1 - s2) * y1 + 2 * (1 - s2) * s2 * my + s2 * s2 * y2; thick(g, px, py, nx, ny, 1, col); px = nx; py = ny; }
        R(g, x2 - 1, y2 - 1, 3, 3, col);
      }
      boxes.forEach(([bx, by, lab], i) => { const hot = i === 2 && PX.blink(t, 0.5); flowBox(g, bx + jit(i), by + jit(i + 3), 60, 18, lab, hot ? "#ff5c5c" : i === 4 ? "#f25ca8" : "#f7c948", hot ? "#3a1218" : "#2a1a20"); });
      // sparks from PROCESS + smoke
      const sx = cx - 40, sy = FY + 72;
      for (let i = 0; i < 10; i++) { const k = (tt * 1.8 + i / 10) % 1, a = -1.6 + (i - 5) * 0.28; R(g, sx + Math.cos(a) * k * 24, sy + Math.sin(a) * k * 24 + k * k * 12, 2, 2, k < 0.5 ? "#fff0a0" : "#f08a3c"); }
      PX.glow(g, sx, sy, 16, "rgba(255,180,80,0.8)", 0.6 + 0.4 * Math.sin(t * 20));
      for (let i = 0; i < 4; i++) { const k = (tt * 0.6 + i / 4) % 1; A(g, 0.45 * (1 - k), () => ell(g, sx - 6 + Math.sin(k * 6 + i) * 4, sy - 6 - k * 40, 4 + k * 8, 3 + k * 5, "#6a6a78")); }
      // gremlin running around
      if (tt > 0.6) {
        const gt = tt - 0.6, gx = cx + Math.sin(gt * 2.3) * 80, gy = FY + 80 + Math.sin(gt * 3.7) * 52, vx = Math.cos(gt * 2.3);
        gremlin(g, gx, gy, t, vx >= 0 ? 1 : -1);
        if (Math.floor(gt * 3) % 4 === 1) { OT(g, "CHOMP", gx, gy - 22, { font: "v", size: 12, col: "#ff9a9a", align: "center" }); }
      }
      if (Math.floor(t * 7) % 9 === 0) { const y = FY + Math.floor(r() * FH); A(g, 0.6, () => R(g, RX, y, FW, 3, "#f25ca8")); }
    });
    // plaques
    const plq = (cx, str, on, col) => { rr(g, cx - 96, FY + FH + 16, 192, 16, "#0b0f1a"); rr(g, cx - 95, FY + FH + 17, 190, 14, on ? "#2a2416" : "#141418"); R(g, cx - 94, FY + FH + 17, 188, 1, on ? "#8a7040" : "#2a2a2a");
      if (on) T(g, str, cx, FY + FH + 20, { size: 8, col, align: "center" }); };
    const k1 = pop(t, left + 0.3, 0.4), k2 = pop(t, real + 0.3, 0.4);
    PX.zoom(g, Math.max(0.01, k1), LX + FW / 2, FY + FH + 24, () => plq(LX + FW / 2, "WHAT YOU THINK IT DOES", true, "#5fe3e8"));
    PX.zoom(g, Math.max(0.01, k2), RX + FW / 2, FY + FH + 24, () => plq(RX + FW / 2, "WHAT IT ACTUALLY DOES", true, "#ff7b72"));
    // foreground: bench + the coder (from behind) looking between the two
    PX.par(g, c, 1.2, () => {
      const look = t < real + 0.4 ? 0 : Math.round(Math.sin((t - real) * 1.2) * 6);
      PX.core.coder(g, 320 + look, 322, t, { col: "#26355e", hl: "#3a5590", dark: "#1a2546" });
      if (t > real + 1.2) { const k = pop(t, real + 1.2, 0.3); PX.zoom(g, k, 356, 258, () => { OT(g, "?!", 356, 252, { size: 16, col: "#f7c948", align: "center" }); }); }
    });
    PX.particles(g, 14, 30, t, [40, 40, 560, 220], { vy: -2, vx: 1.5, col: "#ffe2b0", a: 0.45 });
    PX.vignette(g, 0.55);
  };

  // =====================================================================
  // stacktrace (14.5): kitchen timer set to 20:00 at o.timer (0.3); red traceback floods the monitor at o.trace (4.4);
  // an eye cursor reads line 1 and panics; o.scan (8.5) it scans down; o.found (11.0) "File main.py, line 42" lights up.
  // =====================================================================
  const lcd = (g, str, x, y, col) => T(g, str, x, y, { font: "v", size: 32, col: col || "#1c2a1a" });
  const kitchenTimer = (g, x, y, t, secs, o) => {        // 92 x 60 body, base at y
    o = o || {};
    const bx = x - 46, by = y - 60;
    R(g, bx + 4, y, 84, 3, "rgba(0,0,0,.45)");
    rr2(g, bx, by, 92, 60, "#7a2a1e"); rr2(g, bx, by, 92, 57, "#d0533a"); R(g, bx + 2, by + 1, 88, 2, "#f08a6a"); R(g, bx + 1, by + 3, 2, 50, "#e86a4e");
    R(g, bx + 86, by + 4, 4, 50, "#a83a28");
    R(g, bx + 12, by - 5, 18, 6, "#3a3f4b"); R(g, bx + 12, by - 5 + (o.press ? 2 : 0), 18, 2, "#6a7080"); R(g, bx + 62, by - 5, 18, 6, "#3a3f4b"); R(g, bx + 62, by - 5, 18, 2, "#6a7080");
    rr(g, bx + 8, by + 10, 76, 30, "#2a1410"); R(g, bx + 10, by + 12, 72, 26, "#8fae84"); R(g, bx + 10, by + 12, 72, 1, "#b0d0a0");
    PX.glow(g, x, by + 25, 40, "rgba(160,230,140,0.35)");
    const m = Math.floor(secs / 60), s = Math.floor(secs % 60), str = String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    A(g, 0.14, () => lcd(g, "88:88", bx + 16, by + 9));
    if (o.blank !== true) lcd(g, str, bx + 16, by + 9);
    for (let i = 0; i < 3; i++) { PX.circle(g, bx + 22 + i * 24, by + 48, 4, "#7a2a1e"); PX.circle(g, bx + 22 + i * 24, by + 47, 3, "#f0c0a0"); }
    R(g, bx + 78, by + 4, 4, 4, PX.blink(t, 1, 0.5) && o.run ? "#ff5c5c" : "#5a1a10");
  };
  const eye = (g, x, y, t, mood, look) => {               // eye cursor ~30x18; mood: read | panic | happy
    const w = mood === "panic" ? 17 : 15, h = mood === "panic" ? 11 : 8, sh = mood === "panic" ? Math.round(Math.sin(t * 60) * 1.5) : 0;
    x += sh;
    PX.glow(g, x, y, 34, mood === "panic" ? "rgba(255,92,92,0.5)" : "rgba(247,201,72,0.45)");
    if (mood === "happy") { for (let i = -13; i <= 13; i++) { const yy = y + 4 - Math.round(Math.sqrt(Math.max(0, 169 - i * i)) * 0.6); R(g, x + i - 2, yy - 2, 5, 6, "#0b0f1a"); } for (let i = -12; i <= 12; i++) { const yy = y + 4 - Math.round(Math.sqrt(Math.max(0, 169 - i * i)) * 0.6); R(g, x + i, yy, 1, 2, "#f7c948"); } return; }
    for (let r = -h - 1; r <= h + 1; r++) { const hw = Math.round((w + 2) * Math.pow(1 - Math.pow(Math.abs(r) / (h + 1), 2), 0.7)); R(g, x - hw, y + r, hw * 2 + 1, 1, "#0b0f1a"); }
    for (let r = -h; r <= h; r++) { const hw = Math.round(w * Math.pow(1 - Math.pow(Math.abs(r) / h, 2), 0.7)); R(g, x - hw, y + r, hw * 2 + 1, 1, "#e8e2d4"); }
    const px = x + Math.round((look || 0) * 6);
    PX.circle(g, px, y, mood === "panic" ? 4 : 6, "#1f6f7a"); PX.circle(g, px, y, mood === "panic" ? 3 : 5, "#2a9fad"); PX.circle(g, px, y, mood === "panic" ? 1 : 3, "#0b0f1a"); R(g, px - 3, y - 4, 2, 2, "#ffffff");
    if (mood === "read") { R(g, x - w - 1, y - h - 1, w * 2 + 3, 4, "#0b0f1a"); R(g, x - w + 2, y - h + 3, w * 2 - 3, 1, "#c8c0b0"); }
    if (mood === "panic") { for (const s of [-1, 1]) thick(g, x + s * 12, y - h - 6, x + s * 4, y - h - 9, 2, "#0b0f1a"); sweat(g, x + 18, y - 10, t, 0); sweat(g, x - 21, y - 6, t, 0.5); sweat(g, x + 22, y, t, 0.3); }
  };
  const TRACE = [
    ["Traceback (most recent call last):", "#ff9a9a"],
    ['  File "app.py", line 88, in <module>', "#ff7b72"], ["    run()", "#c9a0a0"],
    ['  File "app.py", line 71, in run', "#ff7b72"], ["    total = checkout(cart)", "#c9a0a0"],
    ['  File "shop/cart.py", line 30, in checkout', "#ff7b72"], ["    return price(items)", "#c9a0a0"],
    ['  File "shop/price.py", line 12, in price', "#ff7b72"], ["    tax = rate(item) * qty", "#c9a0a0"],
    ['  File "lib/tax.py", line 5, in rate', "#ff7b72"], ["    return lookup(item.zone)", "#c9a0a0"],
    ['  File "lib/zones.py", line 19, in lookup', "#ff7b72"], ["    return TABLE[z] + extra(z)", "#c9a0a0"],
    ['  File "main.py", line 42, in extra', "#ff7b72"], ["    return z.cost + \"5\"", "#c9a0a0"],
    ["TypeError: unsupported operand type(s)", "#ff5c5c"],
  ];
  K.stacktrace = (o) => (g, t, d, c) => {
    const tm = o.timer === undefined ? 0.3 : o.timer, trace = o.trace === undefined ? d * 0.3 : o.trace, scan = o.scan === undefined ? d * 0.59 : o.scan, found = o.found === undefined ? d * 0.76 : o.found;
    const DY = 252;
    wall(g, t, c, { winX: 30 });
    lamp(g, 600, DY + 4, t, -1);
    desk(g, DY, t);
    const MX = 214, MY = 44, MW = 270, MH = 166, LH = 9, TY = MY + 14;
    const target = 13;                                    // the main.py line
    monitor(g, MX, MY, MW, MH, t, (x, y, w, h) => {
      if (t < trace) {
        PX.core.editor(g, x, y, w, h, t, { file: "main.py", lines: [
          { seg: [["def", KW], [" extra", FN], ["(z):", TX]] }, { ind: 1, seg: [["return", KW], [" z.cost + ", TX], ['"5"', ST]] }, { seg: [["", TX]] },
          { seg: [["run", FN], ["()", TX]] }] });
        if (t > trace - 0.6) { const k = (t - (trace - 0.6)) / 0.6; R(g, x + 16, y + 12 + 3 * 7, 70, 7, `rgba(95,140,255,${0.3 * k})`); }
      } else {
        const tt = t - trace;
        R(g, x, y, w, h, "#140a0e"); R(g, x, y, w, 10, "#2a1418"); T(g, "TERMINAL", x + 6, y + 1, { font: "v", size: 10, col: "#ff9a9a" });
        R(g, x + w - 40, y + 2, 34, 6, "#5a1a20"); T(g, "ERROR", x + w - 23, y + 1, { font: "v", size: 9, col: "#ffd0d0", align: "center" });
        A(g, 0.1 + 0.05 * Math.sin(t * 3), () => R(g, x, y + 10, w, h - 10, "#ff2a2a"));
        const n = Math.min(TRACE.length, Math.floor(tt * 22) + 1);
        for (let i = 0; i < n; i++) {
          const ly = TY + i * LH;
          let hl = null;
          if (t >= scan && t < found) { const si = (t - scan) / (found - 0.3 - scan) * TRACE.length; if (Math.abs(i - si) < 1) hl = "rgba(247,201,72,.18)"; }
          if (t >= found && i === target) hl = PX.blink(t, 0.4, 0.7) ? "rgba(247,201,72,.45)" : "rgba(247,201,72,.25)";
          if (hl) R(g, x + 2, ly - 1, w - 4, LH, hl);
          const dim = t >= found && i !== target && i !== target + 2;
          A(g, dim ? 0.45 : 1, () => T(g, TRACE[i][0], x + 6, ly, { font: "v", size: 10, col: t >= found && i === target ? "#ffe9a0" : TRACE[i][1] }));
        }
        if (tt < 0.25) A(g, 0.6 * (1 - tt / 0.25), () => R(g, x, y, w, h, "#ff5c5c"));
      }
    });
    // eye cursor
    if (t >= trace + 0.6) {
      let ex, ey, mood = "read", look = 0;
      const lineY = (i) => TY + i * LH + 4;
      if (t < scan) {
        const k = PX.p(t, trace + 0.6, 1.4, "io"); ex = MX + 30 + k * 130; ey = lineY(0) + 14; look = 0.6;
        if (t > trace + 2.2) { mood = "panic"; ex = MX + 160; look = 0; }
      } else if (t < found) {
        const k = PX.p(t, scan, found - 0.3 - scan, "io"); ex = MX + 160 - Math.sin(k * 30) * 6; ey = lineY(0) + 14 + k * (lineY(target) - 28 - lineY(0)); look = Math.sin(t * 14) * 0.8;
      } else { ex = MX + 196; ey = lineY(target) - 14; mood = "happy"; }
      eye(g, ex, ey, t, mood, look);
      if (mood === "panic") { const k = pop(t, trace + 2.2, 0.3); PX.zoom(g, k, ex + 40, ey - 16, () => OT(g, "AAAH", ex + 40, ey - 22, { font: "v", size: 16, col: "#ff9a9a", align: "center" })); }
      if (t >= found) {
        const k = pop(t, found, 0.4), bob = Math.round(Math.sin(t * 8) * 3), ay = lineY(target);
        PX.zoom(g, k, MX - 30, ay, () => {
          g.fillStyle = "#0b0f1a"; g.beginPath(); g.moveTo(MX - 64 + bob, ay - 7); g.lineTo(MX - 30 + bob, ay - 7); g.lineTo(MX - 30 + bob, ay - 15); g.lineTo(MX - 8 + bob, ay); g.lineTo(MX - 30 + bob, ay + 15); g.lineTo(MX - 30 + bob, ay + 7); g.lineTo(MX - 64 + bob, ay + 7); g.fill();
          g.fillStyle = "#f7c948"; g.beginPath(); g.moveTo(MX - 62 + bob, ay - 5); g.lineTo(MX - 32 + bob, ay - 5); g.lineTo(MX - 32 + bob, ay - 12); g.lineTo(MX - 11 + bob, ay); g.lineTo(MX - 32 + bob, ay + 12); g.lineTo(MX - 32 + bob, ay + 5); g.lineTo(MX - 62 + bob, ay + 5); g.fill();
          R(g, MX - 62 + bob, ay - 5, 30, 1, "#fff0b0"); PX.glow(g, MX - 30, ay, 40, "rgba(247,201,72,0.5)");
        });
        const k2 = pop(t, found + 0.25, 0.35); PX.zoom(g, k2, MX + 238, ay - 34, () => { burst(g, MX + 238, ay - 34, 14, "#f7c948", "#0b0f1a", 0.3); T(g, "!", MX + 239, ay - 42, { size: 16, col: "#0b0f1a", align: "center" }); });
        const k3 = pop(t, found + 0.5, 0.4); PX.zoom(g, k3, MX + MW / 2, MY + MH + 22, () => OT(g, "THE LINE THAT MATTERS", MX + MW / 2, MY + MH + 18, { size: 8, col: "#f7c948", align: "center" }));
      }
    }
    // kitchen timer on the desk (foreground left)
    if (t >= tm) {
      const k = PX.p(t, tm, 0.45, "back"), drop = Math.round((1 - k) * -80);
      const setK = PX.clamp((t - tm - 0.4) / 0.7, 0, 1), running = t > tm + 1.3;
      const secs = running ? Math.max(0, 1200 - (t - tm - 1.3)) : Math.floor(setK * 20) * 60;
      PX.glow(g, 108, DY + 10, 70, "rgba(255,120,80,0.25)");
      kitchenTimer(g, 108, DY + 26 + drop, t, secs, { run: running, press: t > tm + 1.2 && t < tm + 1.4 });
      if (t < tm + 0.7 && t > tm + 0.35) for (let i = 0; i < 6; i++) { const q = (t - tm - 0.35) / 0.35; A(g, 0.6 * (1 - q), () => ell(g, 108 + (i - 2.5) * 16 * (0.5 + q), DY + 24 - q * 6, 4, 2, "#a89080")); }
      const lk = pop(t, tm + 1.3, 0.4);
      if (lk > 0 && t < trace + 0.5) PX.zoom(g, lk, 108, DY - 52, () => { rr2(g, 52, DY - 62, 112, 18, "#0b0f1a"); T(g, "20 MIN. ALONE", 108, DY - 57, { size: 8, col: "#f7c948", align: "center" }); });
    }
    PX.core.mug(g, 520, DY + 6, t);
    // sticky note on the bezel
    R(g, MX - 18, MY + MH - 14, 26, 24, "#c9b04a"); R(g, MX - 18, MY + MH - 14, 26, 3, "#e8d070"); T(g, "READ", MX - 5, MY + MH - 7, { font: "v", size: 10, col: "#3a3010", align: "center" }); T(g, "IT!", MX - 5, MY + MH + 1, { font: "v", size: 10, col: "#3a3010", align: "center" });
    plant(g, 560, DY + 16, t);
    PX.particles(g, 15, 24, t, [460, 120, 170, 120], { vy: -3, vx: -2, col: "#ffe2b0", a: 0.6 });
    PX.vignette(g, 0.55);
  };

  // =====================================================================
  // prints (5.9): print() lines slot into the code (green), a console prints values, the sticky note
  // "GUESS: total is None" gets a tick at o.ok (4.2). o.at [3 slot times], o.out (first console line time)
  // =====================================================================
  K.prints = (o) => (g, t, d, c) => {
    const at = o.at || [d * 0.08, d * 0.2, d * 0.32], out = o.out === undefined ? d * 0.44 : o.out, ok = o.ok === undefined ? d * 0.71 : o.ok;
    const DY = 254;
    wall(g, t, c, { noPoster: true });
    lamp(g, 70, DY + 4, t, 1);
    desk(g, DY, t);
    const MX = 168, MY = 40, MW = 290, MH = 176;
    const typing = at.some((a) => t > a - 0.4 && t < a + 0.1);
    monitor(g, MX, MY, MW, MH, t, (x, y, w, h) => {
      R(g, x, y, w, h, "#0d1117"); R(g, x, y, w, 10, "#161b22"); R(g, x + 3, y + 2, 40, 8, "#0d1117"); T(g, "cart.py", x + 6, y + 1, { font: "v", size: 10, col: "#c9d1d9" });
      // code with print lines slotting in
      const base = [
        { seg: [["def", KW], [" total", FN], ["(cart):", TX]] },
        { ind: 1, seg: [["t = ", TX], ["0", NU]] },
        { ind: 1, seg: [["for", KW], [" item ", TX], ["in", KW], [" cart:", TX]] },
        { ind: 2, seg: [["t += item.price", TX]] },
        { ind: 1, seg: [["# (no return...)", CM]] },
        { seg: [["result = total(cart)", TX]] },
      ];
      const ins = [[4, { ind: 2, seg: [["print", FN], ["(", TX], ['"t ="', ST], [", t)", TX]], p: 1 }], [2, { ind: 1, seg: [["print", FN], ["(", TX], ['"cart:"', ST], [", len(cart))", TX]], p: 1 }], [99, { ind: 0, seg: [["print", FN], ["(", TX], ['"result:"', ST], [", result)", TX]], p: 1 }]];
      // build list in insertion order; each inserted line has slot progress
      let lines = base.map((l) => ({ l, k: 1 }));
      ins.forEach(([pos, l], i) => { const k = PX.p(t, at[i], 0.35, "back"); if (t >= at[i]) lines.splice(Math.min(pos, lines.length), 0, { l, k, t0: at[i] }); });
      const LH = 10, y0 = y + 14; let yy = y0;
      lines.forEach(({ l, k, t0 }, i) => {
        const hgt = LH * PX.clamp(k, 0, 1.2);
        T(g, String(i + 1), x + 13, yy, { font: "v", size: 10, col: "#484f58", align: "right" });
        if (l.p) {
          const glowA = PX.clamp(1 - (t - t0 - 0.4) / 1.2, 0.18, 1);
          R(g, x + 16, yy - 1, w - 20, LH, `rgba(61,245,107,${0.22 * glowA})`); R(g, x + 16, yy - 1, 2, LH, "#3df56b");
          clip(g, x + 18, yy - 1, w, LH, () => code(g, x + 22 + (1 - PX.clamp(k, 0, 1)) * 160, yy, [l], LH, { size: 10 }));
        } else code(g, x + 22, yy, [l], LH, { size: 10 });
        yy += hgt;
      });
      if (typing || PX.blink(t, 1)) R(g, x + 120, yy - LH + 1, 2, 8, "#e6edf3");
      // console panel
      const cy = y + h - 62;
      R(g, x, cy, w, 62, "#090c12"); R(g, x, cy, w, 1, "#30363d"); R(g, x, cy + 1, w, 9, "#11161f"); T(g, "CONSOLE", x + 6, cy + 1, { font: "v", size: 10, col: "#7d8590" });
      R(g, x + w - 44, cy + 2, 38, 7, "#1f6f3a"); T(g, "RUN", x + w - 25, cy + 1, { font: "v", size: 9, col: "#c8ffd8", align: "center" });
      const outs = [["cart: 3", "#c9d1d9"], ["t = 4", "#c9d1d9"], ["t = 9", "#c9d1d9"], ["t = 15", "#c9d1d9"], ["result: None", "#f7c948"]];
      outs.forEach(([s2, col], i) => { const ti = out + i * 0.28; if (t < ti) return; const ly = cy + 12 + i * 10;
        if (i === 4) R(g, x + 4, ly - 1, 90, 10, PX.blink(t, 0.5, 0.7) ? "rgba(247,201,72,.25)" : "rgba(247,201,72,.12)");
        T(g, "> " + s2, x + 8, ly, { font: "v", size: 10, col }); });
    });
    // sticky note with the guess
    const nx = MX + MW + 2, ny = MY + 56, sw2 = Math.sin(t * 2) * 0.6;
    R(g, nx + 2, ny + 3, 66, 60, "rgba(0,0,0,.4)");
    R(g, nx, ny, 66, 60, "#d4b84a"); R(g, nx, ny, 66, 6, "#e8d070"); R(g, nx, ny + 54, 66, 6, "#b89a34"); R(g, nx + 62, ny + 6 + sw2, 4, 48, "#c4a83e");
    T(g, "GUESS:", nx + 6, ny + 9, { font: "v", size: 13, col: "#5a3a10" }); T(g, "total is", nx + 6, ny + 22, { font: "v", size: 13, col: "#3a2a10" }); T(g, "None", nx + 6, ny + 35, { font: "v", size: 16, col: "#c0392b" });
    R(g, nx + 6, ny + 49, 30, 1, "#c0392b");
    R(g, nx + 26, ny - 3, 14, 5, "rgba(200,220,240,.55)");                    // tape
    if (t >= ok) {
      const k = pop(t, ok, 0.35);
      PX.zoom(g, k, nx + 50, ny + 44, () => { PX.glow(g, nx + 50, ny + 44, 40, "rgba(61,245,107,0.55)"); PX.circle(g, nx + 50, ny + 44, 15, "#0b0f1a"); PX.circle(g, nx + 50, ny + 44, 13, "#2fae5a"); PX.circle(g, nx + 49, ny + 43, 11, "#3df56b"); tick(g, nx + 42, ny + 37, 16, "#0b3a1a"); });
      const k2 = pop(t, ok + 0.25, 0.35); PX.zoom(g, k2, nx + 33, ny + 80, () => OT(g, "CONFIRMED", nx + 33, ny + 76, { size: 8, col: "#3df56b", align: "center" }));
    }
    PX.core.mug(g, 136, DY + 6, t);
    plant(g, 580, DY + 16, t);
    PX.core.coder(g, 312, 296, t, { typing });
    PX.particles(g, 16, 24, t, [30, 130, 180, 120], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.6 });
    PX.vignette(g, 0.55);
  };

  // =====================================================================
  // journal (17.5): top-down desk under a lamp, a leather notebook. Entries write themselves; pages flip at o.months (7.0);
  // at o.five (10.0) the tally marks collapse into a "TOP 5 MISTAKES" list. o.top [[label,count] x5]
  // =====================================================================
  const INK = { r: "#9a2e26", b: "#26346e", g: "#2a6438", k: "#2a2a3a" };
  const ENTRIES = [
    [["BROKE:", "login"], ["WHY:", "user is None"], ["FOUND:", "print()"], null, ["BROKE:", "cart total"], ["WHY:", "off by one"], ["FOUND:", "print()"]],
    [["BROKE:", "signup"], ["WHY:", "typo 'emial'"], ["FOUND:", "traceback"], null, ["BROKE:", "search"], ["WHY:", "str not int"], ["FOUND:", "print()"]],
    [["BROKE:", "export"], ["WHY:", "list mutated"], ["FOUND:", "debugger"], null, ["BROKE:", "paging"], ["WHY:", "off by one"], ["FOUND:", "print()"]],
    [["BROKE:", "login again"], ["WHY:", "None. again."], ["FOUND:", "in 2 min!"], null, ["BROKE:", "dates"], ["WHY:", "off by one"], ["FOUND:", "print()"]],
  ];
  const tallies = (g, x, y, n, col, a) => {
    for (let i = 0; i < n; i++) { const grp = Math.floor(i / 5), j = i % 5, gx = x + grp * 12;
      if (j < 4) R(g, gx + j * 2, y + ((i * 7) % 3 === 0 ? 1 : 0), 1, 8, col); else thick(g, gx - 1, y + 6, gx + 8, y + 1, 1, col); }
  };
  const pen = (g, x, y, t) => {                       // fountain pen, nib at (x, y), body toward lower right
    A(g, 0.35, () => thick(g, x + 6, y + 8, x + 62, y + 52, 6, "#000000"));
    thick(g, x + 2, y + 2, x + 10, y + 9, 3, "#c8ccd4"); R(g, x, y, 2, 2, "#5a6070");
    thick(g, x + 10, y + 9, x + 56, y + 44, 6, "#1e2a4a"); thick(g, x + 9, y + 7, x + 55, y + 42, 1, "#4a5a8a");
    thick(g, x + 18, y + 15, x + 30, y + 24, 2, "#d8b050"); R(g, x + 38, y + 30, 4, 4, "#d8b050");
  };
  K.journal = (o) => {
    const top = o.top || [["OFF BY ONE", 23], ["NONE CHECK", 17], ["TYPO", 12], ["WRONG TYPE", 9], ["MUTATED LIST", 6]];
    const months = o.dates || ["MAR", "JUN", "SEP", "DEC"];
    return (g, t, d, c) => {
      const mo = o.months === undefined ? d * 0.4 : o.months, five = o.five === undefined ? d * 0.57 : o.five;
      const flips = [mo, mo + 0.7, mo + 1.4], FD = 0.6;
      // ---- desk surface (top-down planks)
      R(g, 0, 0, W, H, "#3a281c");
      for (let y = 0; y < H; y += 44) { R(g, 0, y, W, 1, "#22170f"); R(g, 0, y + 1, W, 1, "#4e3626"); }
      const r = PX.rnd(41); for (let i = 0; i < 90; i++) { const y = Math.floor(r() * H), x = Math.floor(r() * W); R(g, x, y, 20 + Math.floor(r() * 60), 1, r() < 0.5 ? "#33241a" : "#46311f"); }
      PX.glow(g, 250, 150, 300, "rgba(255,190,110,0.32)");
      // props (desk level)
      // mug top view + steam
      PX.par(g, c, 1.05, () => {
        PX.circle(g, 552, 92, 23, "rgba(0,0,0,.35)"); PX.circle(g, 548, 88, 22, "#c8ccd4"); PX.circle(g, 548, 88, 18, "#9aa0ae"); PX.circle(g, 548, 88, 16, "#4a2a18"); PX.circle(g, 545, 85, 6, "#6a3a22");
        R(g, 570, 82, 10, 12, "#c8ccd4"); R(g, 572, 85, 6, 6, "#3a281c"); R(g, 534, 72, 6, 2, "#eef0f4");
        for (let i = 0; i < 4; i++) { const k = (t * 0.5 + i / 4) % 1; A(g, 0.35 * (1 - k), () => ell(g, 548 + Math.sin(k * 7 + i) * 6, 88 - k * 30, 3 + k * 6, 2 + k * 3, "#e6edf3")); }
        // phone face down + sticky notes + pencil + crumpled paper
        rr2(g, 520, 200, 44, 82, "#1b1e26"); R(g, 524, 204, 36, 1, "#3a3f4b"); PX.circle(g, 534, 214, 4, "#2a2e38"); R(g, 523, 202, 1, 76, "#4a505e");
        R(g, 66, 230, 46, 44, "#c9b04a"); R(g, 66, 230, 46, 4, "#e0c860"); T(g, "20 MIN", 89, 240, { font: "v", size: 12, col: "#5a4410", align: "center" }); T(g, "RULE", 89, 252, { font: "v", size: 12, col: "#5a4410", align: "center" });
        R(g, 80, 284, 40, 36, "#d8607a"); R(g, 80, 284, 40, 4, "#f080a0"); T(g, "READ", 100, 294, { font: "v", size: 12, col: "#4a1020", align: "center" }); T(g, "TRACE", 100, 304, { font: "v", size: 12, col: "#4a1020", align: "center" });
        thick(g, 490, 300, 560, 320, 4, "#d8a83a"); thick(g, 490, 299, 560, 319, 1, "#f0d070"); R(g, 557, 316, 6, 6, "#e8a0a0"); thick(g, 486, 298, 491, 300, 3, "#3a2a1a");
        ell(g, 600, 300, 14, 11, "#b8b0a0"); ell(g, 598, 298, 11, 8, "#d6cfbf"); thick(g, 590, 296, 604, 300, 1, "#9a9284"); thick(g, 594, 304, 606, 294, 1, "#9a9284");
        // tiny rubber duck cameo
        ell(g, 600, 186, 10, 8, "#c8a020"); ell(g, 599, 185, 9, 7, "#f0c838"); PX.circle(g, 606, 180, 5, "#f0c838"); R(g, 610, 180, 4, 2, "#f08a3c"); R(g, 607, 178, 1, 1, "#1a1208");
      });
      // ---- notebook
      const NX = 168, NY = 50, PW = 148, PH = 248, SP = NX + 4 + PW;   // spine x
      R(g, NX - 6, NY - 2, PW * 2 + 20, PH + 14, "rgba(0,0,0,.45)");
      rr2(g, NX - 4, NY - 6, PW * 2 + 16, PH + 12, "#5a2e1a"); rr2(g, NX - 3, NY - 5, PW * 2 + 14, PH + 10, "#7a4026");
      for (let x = NX; x < NX + PW * 2 + 8; x += 6) { R(g, x, NY - 3, 3, 1, "#b07a50"); R(g, x, NY + PH + 3, 3, 1, "#b07a50"); }
      R(g, SP - 2, NY + PH + 4, 6, 24, "#a8322a"); R(g, SP - 2, NY + PH + 26, 3, 3, "#a8322a"); R(g, SP + 1, NY + PH + 26, 3, 2, "#a8322a");   // ribbon
      const pageBg = (x, w, left) => {
        R(g, x, NY, w, PH, "#b3a587"); for (let i = 0; i < 6; i++) R(g, left ? x + w - 6 + i : x + i - 0, NY, 1, PH, ["#9a8e72", "#a69a7e", "#b0a488", "#b8ac8f", "#bdb193", "#c2b596"][left ? 5 - i : i]);
        for (let ly = NY + 28; ly < NY + PH - 6; ly += 12) R(g, x + 4, ly, w - 8, 1, "#b0b8c0");
        R(g, left ? x + 18 : x + 14, NY + 4, 1, PH - 8, "#c88a80");
        R(g, left ? x : x + w - 1, NY, 1, PH, left ? "#efe6cc" : "#a89e84");
      };
      // spread index & flip
      let sp = 0; for (const f of flips) if (t >= f + FD * 0.5) sp++;
      const fl = flips.find((f) => t >= f && t < f + FD);
      const drawLeft = (s, tFull) => {
        pageBg(NX + 4, PW, true);
        T(g, months[s] + " " + (3 + s * 7), NX + 26, NY + 10, { font: "v", size: 16, col: INK.k });
        const ents = ENTRIES[s]; let budget = tFull ? 1e9 : Math.floor(Math.max(0, t - 0.4) * 15), cx = 0, cy = 0;
        for (let i = 0; i < ents.length; i++) {
          const e = ents[i]; if (!e) { budget -= 3; continue; }
          const ly = NY + 17 + (i + 1) * 12; if (budget <= 0) break;
          const tag = e[0].slice(0, budget); budget -= e[0].length;
          const col = e[0] === "BROKE:" ? INK.r : e[0] === "WHY:" ? INK.b : INK.g;
          const w1 = PX.tw(g, e[0] + " ", { font: "v", size: 14 });
          T(g, tag, NX + 26, ly, { font: "v", size: 14, col }); cx = NX + 26 + PX.tw(g, tag, { font: "v", size: 14 }); cy = ly;
          if (budget > 0) { const body = e[1].slice(0, budget); budget -= e[1].length; T(g, body, NX + 26 + w1, ly, { font: "v", size: 14, col: INK.k }); cx = NX + 26 + w1 + PX.tw(g, body, { font: "v", size: 14 }); }
        }
        if (s >= 1) { T(g, "+12 more...", NX + 26, NY + 17 + 9 * 12, { font: "v", size: 14, col: "#6a6a7a" }); for (let i = 0; i < 4; i++) R(g, NX + 26, NY + 17 + (10 + i) * 12 + 6, 60 + ((i * 37) % 50), 1, "#5a5a6a"); }
        return [cx, cy];
      };
      // right page: tallies (before five) -> TOP 5 list (after)
      const drawRight = (s) => {
        pageBg(SP + 4, PW - 4, false);
        const x = SP + 22, k5 = PX.p(t, five, 0.9, "io");
        const frac = t >= five ? 1 : Math.min(1, [0.25, 0.5, 0.75, 0.95][Math.min(s, 3)] + (s === 0 ? PX.clamp(t / mo, 0, 1) * 0.15 : 0));
        if (t < five + 0.45) A(g, 1 - PX.clamp((t - five) / 0.45, 0, 1), () => T(g, "TALLY", x, NY + 10, { font: "v", size: 16, col: INK.k }));
        if (t >= five + 0.3) { const kk = pop(t, five + 0.3, 0.4); PX.zoom(g, kk, x + 60, NY + 16, () => { T(g, "TOP 5", x, NY + 8, { size: 8, col: INK.r }); T(g, "MISTAKES", x, NY + 18, { size: 8, col: INK.r }); R(g, x, NY + 28, 72, 1, INK.r); }); }
        top.forEach(([lab, n], i) => {
          const ly = NY + 41 + i * 36, cnt = Math.round(n * frac);
          T(g, lab, x, ly, { font: "v", size: 14, col: INK.k });
          if (t < five) tallies(g, x, ly + 13, cnt, INK.b);
          else {
            // marks fly together into the count
            if (k5 < 1) { for (let m = 0; m < n; m++) { const grp = Math.floor(m / 5), j = m % 5, sx = x + grp * 12 + j * 2, tx = x + 6; R(g, PX.lerp(sx, tx, k5), ly + 13 + Math.sin(m + k5 * 6) * 4 * (1 - k5) * k5 * 4, 1, Math.round(8 * (1 - k5)) + 1, INK.b); } }
            const kc = pop(t, five + 0.7 + i * 0.12, 0.35);
            if (kc > 0) { PX.zoom(g, kc, x + 20, ly + 18, () => { T(g, "x" + n, x, ly + 12, { font: "v", size: 16, col: i === 0 ? INK.r : INK.b });
              R(g, x + 30, ly + 16, Math.round((n / top[0][1]) * 70 * PX.clamp((t - five - 0.8 - i * 0.12) / 0.5, 0, 1)), 5, i === 0 ? "#b84a3a" : "#5a6a9a"); R(g, x + 30, ly + 16, Math.round((n / top[0][1]) * 70 * PX.clamp((t - five - 0.8 - i * 0.12) / 0.5, 0, 1)), 1, "#e8a090"); }); }
          }
        });
        // circle the #1 by hand
        if (t > five + 2.4) { const kc = PX.clamp((t - five - 2.4) / 0.6, 0, 1); for (let a = 0; a < kc * 6.6; a += 0.05) R(g, x + 30 + Math.cos(a - 1) * 40, NY + 47 + Math.sin(a - 1) * 13 + a * 0.4, 2, 1, INK.r); }
      };
      const ls = fl !== undefined ? (t >= fl + FD * 0.5 ? sp : sp) : sp;
      const [pcx, pcy] = drawLeft(Math.min(ls, 3), ls > 0);
      drawRight(Math.min(sp, 3));
      R(g, SP, NY, 4, PH, "#8a7a60"); R(g, SP + 1, NY, 2, PH, "#6a5a44");
      // turning page
      if (fl !== undefined) {
        const k = PX.ease((t - fl) / FD, "io"), ex = PX.lerp(SP + 4 + PW - 4, NX + 4, k);
        const x0 = Math.min(ex, SP + 2), x1 = Math.max(ex, SP + 2), lift = Math.round(Math.sin(k * 3.14) * 10);
        R(g, x0 + 4, NY + 4, x1 - x0, PH, "rgba(0,0,0,.3)");
        R(g, x0, NY - lift, x1 - x0, PH + lift * 2, k < 0.5 ? "#b4a88c" : "#c8bb9c");
        for (let ly = NY + 28; ly < NY + PH - 6; ly += 12) R(g, x0 + 3, ly, Math.max(0, x1 - x0 - 6), 1, "#b0b8c0");
        R(g, ex < SP ? x0 : x1 - 2, NY - lift, 2, PH + lift * 2, "#f0e8d0");
        A(g, 0.3, () => R(g, ex < SP ? x1 - 10 : x0, NY - lift, 10, PH + lift * 2, "#8a7a60"));
      }
      // pen writing / circling
      let px = pcx, py = pcy + 10;
      if (t > five + 2.4) { const a = PX.clamp((t - five - 2.4) / 0.6, 0, 1) * 6.6; px = SP + 52 + Math.cos(a - 1) * 40; py = NY + 47 + Math.sin(a - 1) * 13 + a * 0.4; }
      else if (t >= mo) { px = 520; py = 150 + Math.sin(t) * 2; }
      else { px += Math.round(Math.sin(t * 30) * 1); py += Math.round(Math.cos(t * 23) * 1); }
      pen(g, px, py, t);
      if (t >= mo && t < five) { const k = pop(t, mo + 0.2, 0.4); PX.zoom(g, k, 320, 48, () => { rr2(g, 236, 38, 168, 20, "#0b0f1a"); T(g, "MONTHS LATER", 320, 44, { size: 8, col: "#f7c948", align: "center" }); }); }
      // lamp shade from above (closest layer)
      PX.par(g, c, 1.3, () => {
        PX.circle(g, 46, 40, 58, "rgba(0,0,0,.25)"); PX.circle(g, 40, 30, 54, "#2b2f38"); PX.circle(g, 40, 30, 50, "#3a3f4b"); PX.circle(g, 34, 24, 30, "#4a505c");
        for (let a = 0.2; a < 1.5; a += 0.02) R(g, 40 + Math.cos(a) * 52, 30 + Math.sin(a) * 52, 2, 2, "#ffd28a");
        PX.glow(g, 80, 70, 70, "rgba(255,220,150,0.6)", 0.9 + 0.1 * Math.sin(t * 17));
      });
      PX.particles(g, 17, 30, t, [60, 40, 380, 260], { vy: -2, vx: 2, col: "#ffe2b0", a: 0.55 });
      PX.vignette(g, 0.55);
    };
  };

  // =====================================================================
  // duck (18.6): a big glossy rubber duck under the lamp; the coder explains code to it in speech bubbles.
  // o.lines [bubble texts], o.say (10.6) "THIS IS DEFINITELY A NUMBER...", o.oops (14.0) total flips 42 -> "42"
  // =====================================================================
  const DUCK = { hl: "#f8d860", sp: "#fff2b0", b: "#e6b42c", s: "#bc861a", d: "#8a5c10", bk: "#f08a3c", bkd: "#c05a20", bkl: "#ffb070" };
  const duckDraw = (g, x, y, t, wide, skep) => {       // feet line y, faces left; ~120 px tall
    const bob = Math.round(Math.sin(t * 1.6) * 1.5), tilt = Math.round(Math.sin(t * 0.9) * 2);
    // shadow + reflection on the desk
    A(g, 0.4, () => ell(g, x + 6, y + 2, 58, 6, "#000000"));
    A(g, 0.18, () => ell(g, x, y + 5, 40, 3, DUCK.b));
    // body
    const by = y - 34 + bob;
    ell(g, x, by, 54, 34, DUCK.d); ell(g, x + 2, by - 2, 52, 32, DUCK.s); ell(g, x + 6, by - 5, 46, 27, DUCK.b);
    ell(g, x + 18, by - 14, 22, 10, DUCK.hl); ell(g, x + 24, by - 18, 8, 3, DUCK.sp);
    // tail
    g.fillStyle = DUCK.s; g.beginPath(); g.moveTo(x + 40, by - 12); g.lineTo(x + 66, by - 34); g.lineTo(x + 56, by + 4); g.fill();
    g.fillStyle = DUCK.b; g.beginPath(); g.moveTo(x + 42, by - 12); g.lineTo(x + 63, by - 30); g.lineTo(x + 54, by); g.fill(); R(g, x + 58, by - 28, 3, 2, DUCK.sp);
    // wing
    ell(g, x + 10, by - 2, 24, 14, DUCK.s); ell(g, x + 11, by - 4, 22, 12, DUCK.b); ell(g, x + 15, by - 8, 12, 4, DUCK.hl);
    for (let i = 0; i < 3; i++) thick(g, x + 24 + i * 4, by + 4 - i, x + 30 + i * 4, by + 8 - i * 2, 1, DUCK.s);
    // head
    const hx = x - 26 + tilt, hy = by - 50;
    ell(g, hx + 4, hy + 34, 20, 10, DUCK.s);                       // neck
    PX.circle(g, hx, hy, 32, DUCK.d); PX.circle(g, hx + 2, hy - 2, 30, DUCK.s); PX.circle(g, hx + 5, hy - 4, 26, DUCK.b);
    ell(g, hx + 12, hy - 18, 12, 6, DUCK.hl); R(g, hx + 14, hy - 22, 6, 3, DUCK.sp); R(g, hx + 22, hy - 14, 2, 2, DUCK.sp);
    // beak
    const bx = hx - 26, bky = hy + 6;
    ell(g, bx, bky + 4, 18, 7, DUCK.bkd); ell(g, bx - 1, bky, 19, 7, DUCK.bk); ell(g, bx + 2, bky - 3, 12, 3, DUCK.bkl);
    R(g, bx - 14, bky + 4, 26, 1, DUCK.bkd); R(g, bx + 6, bky - 2, 2, 1, "#8a3a10");
    // eye
    const ex = hx - 8, ey = hy - 6;
    if (wide) {
      const k = PX.clamp(wide, 0, 1), r = Math.round(6 + 6 * k);
      PX.circle(g, ex, ey, r + 1, "#1a1208"); PX.circle(g, ex, ey, r, "#f3eee0"); PX.circle(g, ex - 1, ey, 3, "#1a1208"); R(g, ex - 3, ey - 3, 2, 2, "#ffffff");
      thick(g, ex - 10, ey - r - 6, ex + 6, ey - r - 9, 2, DUCK.d);
    } else if (PX.blink(t + 0.2, 3.4, 0.05)) R(g, ex - 5, ey, 10, 2, "#1a1208");
    else if (skep) { ell(g, ex, ey, 6, 6, "#f3eee0"); R(g, ex - 6, ey - 6, 13, 6, DUCK.s); R(g, ex - 6, ey - 1, 13, 1, "#1a1208"); R(g, ex - 5, ey, 3, 4, "#1a1208"); }
    else { ell(g, ex, ey, 5, 7, "#1a1208"); R(g, ex - 2, ey - 4, 3, 3, "#ffffff"); R(g, ex + 1, ey + 2, 1, 1, "#6a5a40"); }
    A(g, 0.5, () => ell(g, ex + 10, ey + 12, 6, 3, "#f8a060"));   // cheek
  };
  K.duck = (o) => {
    const lines = o.lines || ["so total = get_total()", "get_total returns...", "...a number. obviously.", "then I add the tax:", "total + total * 0.2"];
    return (g, t, d, c) => {
      const say = o.say === undefined ? d * 0.57 : o.say, oops = o.oops === undefined ? d * 0.75 : o.oops;
      const DY = 256;
      wall(g, t, c, { winX: 26 });
      desk(g, DY, t);
      // monitor in the back with the code
      monitor(g, 196, 96, 150, 96, t, (x, y, w, h) => {
        PX.core.editor(g, x, y, w, h, t, { file: "tax.py", lines: [
          { seg: [["total = get_total()", TX]] }, { seg: [["tax = total * ", TX], ["0.2", NU]] }, { seg: [["print", FN], ["(total + tax)", TX]], hl: t >= oops ? "rgba(255,92,92,.3)" : null }] });
      }, { base: DY + 6 });
      lamp(g, 600, DY + 4, t, -1);
      PX.glow(g, 410, 200, 140, "rgba(255,200,120,0.28)");
      PX.core.mug(g, 540, DY + 6, t);
      R(g, 470, DY + 4, 50, 8, "#3a6a8a"); R(g, 472, DY - 4, 46, 8, "#8a3b46"); R(g, 470, DY + 4, 50, 1, "#5a8aaa"); R(g, 472, DY - 4, 46, 1, "#b05a66");   // book stack
      // the duck (hero)
      const wide = t >= oops ? PX.p(t, oops + 0.1, 0.25, "back") : 0;
      const hop = t >= oops && t < oops + 0.5 ? -Math.round(Math.sin(((t - oops) / 0.5) * 3.14) * 10) : 0;
      duckDraw(g, 410, DY + 8 + hop, t, wide, t > say + 1.2 && t < oops);
      if (t >= oops + 0.1 && t < oops + 2.2) { const k = pop(t, oops + 0.1, 0.3); PX.zoom(g, k, 368, 92, () => { burst(g, 368, 92, 16, "#ff5c5c", "#0b0f1a", t); T(g, "!", 369, 84, { size: 16, col: "#ffffff", align: "center" }); }); }
      // the coder (left, from behind), head bobbing while talking
      const talking = t < oops;
      PX.core.coder(g, 120, 284 + (talking ? Math.round(Math.abs(Math.sin(t * 7)) * 1) : 0), t, {});
      // speech bubbles
      const slot = (say - 0.5) / lines.length;
      if (t < say) {
        const i = Math.floor(Math.max(0, t - 0.5) / slot), ti = 0.5 + i * slot;
        if (t >= 0.5 && i < lines.length) {
          const k = pop(t, ti, 0.3), str = PX.typed(lines[i], t, ti + 0.1, 30), bw = PX.tw(g, lines[i], { font: "v", size: 16 }) + 16;
          PX.zoom(g, k, 130, 200, () => { bubble(g, 40, 160 - (i % 2) * 6, bw, 22, 128, 236, "#dfe6ee"); T(g, str, 48, 163 - (i % 2) * 6, { font: "v", size: 16, col: "#1a2030" }); });
        }
      } else {
        const k = pop(t, say, 0.35), str = o.sayText || "THIS IS DEFINITELY", str2 = o.sayText2 === undefined ? "A NUMBER..." : o.sayText2;
        if (t < oops + 0.2) PX.zoom(g, k, 130, 200, () => { bubble(g, 36, 140, 210, 40, 128, 236, "#dfe6ee"); T(g, PX.typed(str, t, say, 26), 46, 148, { size: 8, col: "#1a2030" }); T(g, PX.typed(str2, t, say + 0.7, 26), 46, 162, { size: 8, col: "#1a2030" });
          if (t > say + 1.6) { const kk = pop(t, say + 1.6, 0.3); PX.zoom(g, kk, 230, 136, () => { R(g, 220, 128, 22, 14, "#f7c948"); R(g, 220, 128, 22, 1, "#fff0a0"); T(g, "100%", 231, 131, { font: "v", size: 10, col: "#3a2a10", align: "center" }); }); } });
        // variable inspector card: total = 42 -> "42"
        const vk = pop(t, say + 0.8, 0.35);
        if (vk > 0) PX.zoom(g, vk, 470, 70, () => {
          const flipK = t >= oops ? PX.clamp((t - oops) / 0.3, 0, 1) : 0, sy = Math.abs(Math.cos(flipK * 3.14)), isStr = flipK > 0.5;
          const cw = 132, ch = 40, cx = 404, cy = 50, hh = Math.max(2, Math.round(ch * sy));
          R(g, cx + 3, cy + (ch - hh) / 2 + 3, cw, hh, "rgba(0,0,0,.5)");
          rr2(g, cx - 1, cy + (ch - hh) / 2 - 1, cw + 2, hh + 2, isStr ? "#ff5c5c" : "#5fe3e8"); rr2(g, cx, cy + (ch - hh) / 2, cw, hh, "#0d1117");
          if (sy > 0.6) {
            T(g, "total", cx + 8, cy + 6, { font: "v", size: 14, col: TX }); T(g, "=", cx + 50, cy + 6, { font: "v", size: 14, col: KW });
            T(g, isStr ? '"42"' : "42", cx + 64, cy + 3, { size: 16, col: isStr ? "#f25ca8" : NU });
            R(g, cx + 6, cy + 26, 36, 10, isStr ? "#5a1a2a" : "#13283a"); T(g, isStr ? "str" : "int?", cx + 24, cy + 26, { font: "v", size: 11, col: isStr ? "#ff9ab8" : "#79c0ff", align: "center" });
          }
          if (isStr) PX.glow(g, cx + cw / 2, cy + ch / 2, 70, "rgba(242,92,168,0.3)");
        });
        if (t >= oops) { bulb(g, 150, 190, t, oops + 0.25); if (t > oops + 0.6) { const kk = pop(t, oops + 0.6, 0.35); PX.zoom(g, kk, 470, 116, () => OT(g, "A STRING.", 470, 112, { size: 8, col: "#f25ca8", align: "center" })); } }
      }
      PX.particles(g, 18, 26, t, [330, 120, 200, 130], { vy: -3, vx: -2, col: "#ffe2b0", a: 0.6 });
      PX.vignette(g, 0.55);
    };
  };

  // =====================================================================
  // chat_explain (17.2): a chat app on a big monitor. User asks "why didn't my version work?" with code;
  // toggle FIX IT FOR ME / EXPLAIN IT flips at o.toggle (2.0); the answer explains with a mini diagram;
  // o.patch (11.0) PATCH (bandage) vs UNDERSTANDING (lit brain).
  // =====================================================================
  const brainIcon = (g, x, y, t, lit) => {        // ~44x34 side-view brain centred at (x, y)
    if (lit) PX.glow(g, x, y, 60, "rgba(242,92,168,0.55)", 0.85 + 0.15 * Math.sin(t * 5));
    const b = lit ? ["#7a2a52", "#e0709a", "#f8a8c8", "#ffd8e8"] : ["#3a3040", "#6a5a6a", "#8a7a8a", "#9a8a9a"];
    ell(g, x, y, 23, 17, b[0]); ell(g, x - 1, y - 1, 21, 15, b[1]); ell(g, x - 6, y - 6, 9, 5, b[2]); ell(g, x + 8, y - 7, 7, 4, b[2]);
    ell(g, x + 14, y + 12, 8, 5, b[0]); ell(g, x + 14, y + 11, 7, 4, b[1]); R(g, x + 4, y + 14, 5, 8, b[0]);
    for (const [ax, ay, bx2, by2] of [[-16, -2, -6, 2], [-6, 2, -2, -8], [2, -6, 6, 4], [6, 4, 14, -2], [-12, 8, 0, 8], [8, -12, 16, -6]]) thick(g, x + ax, y + ay, x + bx2, y + by2, 1, b[0]);
    R(g, x - 10, y - 10, 3, 2, b[3]);
    if (lit) for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 + t * 0.8, r1 = 30 + 3 * Math.sin(t * 6 + i); R(g, x + Math.cos(a) * r1, y + Math.sin(a) * r1 * 0.8, 2, 2, i % 2 ? "#f7c948" : "#5fe3e8"); }
  };
  const bandage = (g, x, y) => {
    g.save(); g.translate(x, y); g.rotate(-0.5);
    rr2(g, -26, -9, 52, 18, "#6a4a3a"); rr2(g, -25, -8, 50, 16, "#b88a6a"); R(g, -24, -8, 48, 2, "#d0a888");
    R(g, -9, -7, 18, 14, "#d8c0a8"); for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) R(g, -6 + i * 5, -4 + j * 6, 1, 1, "#9a7a62");
    g.restore();
  };
  K.chat_explain = (o) => (g, t, d, c) => {
    const tog = o.toggle === undefined ? Math.min(2.0, d * 0.12) : o.toggle, patch = o.patch === undefined ? d * 0.64 : o.patch;
    const DY = 262;
    wall(g, t, c, { noShelf: true, noPoster: true, winX: 20 });
    lamp(g, 40, DY + 4, t, 1);
    desk(g, DY, t);
    const X = 116, Y = 22, MW = 410, MH = 208;
    monitor(g, X, Y, MW, MH, t, (x, y, w, h) => {
      R(g, x, y, w, h, "#12141c");
      // top bar + toggle
      R(g, x, y, w, 16, "#1c1f2b"); R(g, x, y + 16, w, 1, "#0a0b10"); PX.circle(g, x + 10, y + 8, 4, "#8a5cf6"); T(g, "chat", x + 18, y + 2, { font: "v", size: 13, col: "#c9d1d9" });
      const on = t >= tog, kk = PX.p(t, tog, 0.3, "back"), tx0 = x + w - 186, segW = [96, 80];
      rr2(g, tx0 - 2, y + 2, 182, 13, "#0a0b10");
      const knobX = PX.lerp(tx0, tx0 + segW[0] + 2, on ? kk : 0), knobW = PX.lerp(segW[0], segW[1], on ? kk : 0);
      rr2(g, knobX, y + 3, knobW, 11, on ? "#2fae5a" : "#a83a3a"); R(g, knobX + 2, y + 3, knobW - 4, 1, on ? "#8affb0" : "#ff9a9a");
      T(g, "FIX IT FOR ME", tx0 + segW[0] / 2, y + 2, { font: "v", size: 12, col: on ? "#5a6070" : "#ffe0e0", align: "center" });
      T(g, "EXPLAIN IT", tx0 + segW[0] + 2 + segW[1] / 2, y + 2, { font: "v", size: 12, col: on ? "#e0ffe8" : "#5a6070", align: "center" });
      // sidebar
      R(g, x, y + 17, 64, h - 17, "#0e1016"); for (let i = 0; i < 6; i++) { R(g, x + 6, y + 26 + i * 18, 52, 12, i === 0 ? "#22263a" : "#14161f"); R(g, x + 10, y + 30 + i * 18, 26 + ((i * 13) % 18), 2, "#3a3f55"); }
      const mx = x + 72, mw = w - 80;
      // user message with code block
      if (t >= 0.2) {
        const k = pop(t, 0.2, 0.3), bw = 190, bx = mx + mw - bw, by = y + 22;
        PX.zoom(g, Math.max(0.01, k), bx + bw, by, () => {
          rr2(g, bx, by, bw, 62, "#2a3a7a"); R(g, bx + 2, by, bw - 4, 1, "#4a5aaa");
          T(g, "why didn't my version work?", bx + 6, by + 2, { font: "v", size: 13, col: "#e6edf3" });
          R(g, bx + 6, by + 16, bw - 12, 40, "#0d1117");
          code(g, bx + 10, by + 19, [{ seg: [["for", KW], [" i ", TX], ["in", KW], [" range(len(xs)):", TX]] }, { ind: 1, seg: [["if", KW], [" xs[i] == x:", TX]] }, { ind: 2, seg: [["del", KW], [" xs[i]", TX]], sq: 1 }], 11, { size: 11 });
        });
      }
      // assistant answer
      const a0 = tog + 0.6;
      if (t >= a0) {
        const ax = mx, ay = y + 92, aw = 300;
        PX.circle(g, ax + 6, ay + 6, 6, "#2a9fad"); R(g, ax + 4, ay + 4, 4, 4, "#bff6fa");
        const ah = 108; rr2(g, ax + 16, ay, aw - 16, ah, "#1f2330"); R(g, ax + 18, ay, aw - 20, 1, "#343a4e");
        if (t < a0 + 0.6) { for (let i = 0; i < 3; i++) R(g, ax + 26 + i * 7, ay + 8 + (Math.floor(t * 8 + i) % 2), 4, 4, "#9aa4b2"); }
        else {
          const lines2 = ["You delete items while looping.", "The list shrinks, indexes shift,", "so the next item gets skipped:"];
          lines2.forEach((ln, i) => T(g, PX.typed(ln, t, a0 + 0.6 + i * 1.1, 32), ax + 22, ay + 3 + i * 12, { font: "v", size: 13, col: i === 2 ? "#f7c948" : "#c9d1d9" }));
          // mini diagram: [3][7][7][9], deleting xs[1] shifts the second 7 under the index that was already passed
          const dt0 = a0 + 4.0;
          if (t >= dt0) {
            const dk = PX.p(t, dt0 + 1.2, 0.5, "back"), gone = t >= dt0 + 1.0, bx0 = ax + 30, by0 = ay + 54;
            const vals = [3, 7, 7, 9];
            vals.forEach((v, i) => {
              if (i === 1 && gone) { A(g, PX.clamp(1 - (t - dt0 - 1.0) / 0.3, 0, 1), () => { R(g, bx0 + i * 26, by0 - (t - dt0 - 1) * 30, 22, 18, "#5a1a20"); }); return; }
              const shift = i > 1 && gone ? dk * 26 : 0, skipped = i === 2 && t > dt0 + 2.2;
              rr(g, bx0 + i * 26 - shift, by0, 22, 18, skipped ? "#5a1a20" : "#13283a"); R(g, bx0 + i * 26 - shift + 1, by0, 20, 1, skipped ? "#ff5c5c" : "#5fe3e8");
              T(g, String(v), bx0 + i * 26 - shift + 11, by0 + 2, { size: 8, col: skipped ? "#ff9a9a" : "#c9d1d9", align: "center" });
              T(g, String(i - (i > 1 && gone ? 1 : 0)), bx0 + i * 26 - shift + 11, by0 + 20, { font: "v", size: 10, col: "#5a6070", align: "center" });
            });
            // index arrow i moves 1 -> 2 (skipping the shifted 7)
            const ii = t < dt0 + 1.6 ? 1 : 1 + PX.p(t, dt0 + 1.6, 0.4, "back"), axx = bx0 + ii * 26 + 11;
            g.fillStyle = "#f7c948"; g.beginPath(); g.moveTo(axx - 4, by0 - 9); g.lineTo(axx + 4, by0 - 9); g.lineTo(axx, by0 - 3); g.fill(); T(g, "i", axx + 6, by0 - 13, { font: "v", size: 12, col: "#f7c948" });
            if (t > dt0 + 2.2) { const k = pop(t, dt0 + 2.2, 0.3); PX.zoom(g, k, bx0 + 124, by0 + 8, () => OT(g, "SKIPPED!", bx0 + 124, by0 + 3, { font: "v", size: 14, col: "#ff7b72", align: "center" })); }
          }
          if (t >= a0 + 7.4) T(g, PX.typed("Fix: loop over a copy -> xs[:]", t, a0 + 7.4, 30), ax + 22, ay + 92, { font: "v", size: 13, col: "#3df56b" });
        }
      }
      // cursor clicks the toggle
      if (t < tog + 0.8) { const ck = PX.p(t, tog - 0.9, 0.8, "io"); cursor(g, PX.lerp(x + w - 120, tx0 + segW[0] + 40, ck), PX.lerp(y + 120, y + 8, ck)); if (t > tog - 0.08 && t < tog + 0.15) PX.circle(g, tx0 + segW[0] + 40, y + 8, 6, "rgba(255,255,255,.3)"); }
      // PATCH vs UNDERSTANDING
      if (t >= patch) {
        const tt = t - patch;
        A(g, PX.clamp(tt / 0.3, 0, 0.9), () => R(g, x, y, w, h, "#07080c"));
        const k1 = pop(t, patch + 0.2, 0.4), k2 = pop(t, patch + 0.7, 0.4), cy = y + h / 2 - 4;
        PX.zoom(g, Math.max(0.01, k1), x + 110, cy, () => {
          rr2(g, x + 50, cy - 50, 120, 104, "#1a1a22"); R(g, x + 52, cy - 50, 116, 1, "#3a3a46");
          bandage(g, x + 110, cy - 10); T(g, "PATCH", x + 110, cy + 30, { size: 8, col: "#9a9aa8", align: "center" }); T(g, "works today", x + 110, cy + 40, { font: "v", size: 11, col: "#6a6a78", align: "center" });
        });
        if (tt > 0.5) T(g, "VS", x + w / 2, cy - 6, { size: 8, col: "#5a6070", align: "center" });
        PX.zoom(g, Math.max(0.01, k2), x + w - 110, cy, () => {
          rr2(g, x + w - 176, cy - 58, 132, 118, "#2a1a2a"); rr2(g, x + w - 175, cy - 57, 130, 116, "#1f1424"); R(g, x + w - 172, cy - 57, 124, 1, "#f25ca8");
          brainIcon(g, x + w - 110, cy - 14, t, true); OT(g, "UNDERSTANDING", x + w - 110, cy + 28, { size: 8, col: "#ffb0d8", align: "center" }); T(g, "works forever", x + w - 110, cy + 40, { font: "v", size: 11, col: "#c890b0", align: "center" });
        });
      }
    });
    PX.par(g, c, 0.65, () => {                         // cork board on the right wall
      R(g, 546, 70, 78, 96, "#3a2a1a"); R(g, 546, 70, 78, 1, "#7a5a3a"); R(g, 550, 74, 70, 88, "#8a6440"); 
      const r = PX.rnd(8); for (let i = 0; i < 40; i++) R(g, 550 + r() * 70, 74 + r() * 88, 1, 1, "#6a4a2c");
      [[556, 80, "#c9b04a", -0.1], [586, 86, "#d8607a", 0.08], [560, 118, "#5fb0c8", 0.05], [590, 124, "#c9b04a", -0.06]].forEach(([nx, ny, col], i) => {
        R(g, nx, ny, 26, 24, col); R(g, nx, ny, 26, 3, "rgba(255,255,255,.25)"); for (let k = 0; k < 3; k++) R(g, nx + 4, ny + 8 + k * 5, 14 + ((i + k) % 3) * 3, 1, "rgba(40,30,20,.6)");
        PX.circle(g, nx + 13, ny + 1, 2, ["#ff5c5c", "#3df56b", "#f7c948", "#5fe3e8"][i]); });
    });
    PX.core.mug(g, 560, DY + 6, t);
    plant(g, 600, DY + 16, t);
    R(g, 90, DY + 8, 30, 8, "#2a2f3a"); R(g, 90, DY + 8, 30, 1, "#5a6070");
    PX.particles(g, 19, 22, t, [10, 140, 140, 120], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.6 });
    PX.vignette(g, 0.55);
  };
})();
