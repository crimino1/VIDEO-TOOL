/* EP3 Builder B: vibe coding scenes. copilot_room, trap, vibe_couch, viral, shower, toys_vs_career, birthday_site.
   Native-resolution pixel art on the 640x360 canvas, pure functions of t. Reuses PX.core (skyline, coder, mug) and
   PX.learn (person, outlined, fairy, candle, rain) from the EP2 files at draw time. */
(function () {
  const { K } = PX;
  const R = PX.rect, TX = PX.text, OT = PX.otext, cl = PX.clamp, lerp = PX.lerp;
  const LB = () => PX.learn, CORE = () => PX.core;
  const frac = (x) => x - Math.floor(x);
  // option time with default scaled to shot length (def given for typical length typ)
  const T = (o, k, def, d, typ) => (o[k] !== undefined ? o[k] : (def * d) / typ);
  const SHC = {};
  const sh = (hex, f) => {
    const k = hex + f; if (SHC[k]) return SHC[k];
    const n = parseInt(hex.slice(1), 16), m = (v) => Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1));
    return (SHC[k] = "#" + [m(n >> 16), m((n >> 8) & 255), m(n & 255)].map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join(""));
  };
  const rgba = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16},${(n >> 8) & 255},${n & 255},${a})`; };
  const ell = (g, cx, cy, rx, ry, col) => {
    g.fillStyle = col; const ryy = ry + 0.5;
    for (let y = -Math.round(ry); y <= Math.round(ry); y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ryy * ryy)))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
  };
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
  const thk = (g, x1, y1, x2, y2, w, col) => {
    const n = Math.max(1, Math.ceil(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)))); g.fillStyle = col;
    for (let i = 0; i <= n; i++) g.fillRect(Math.round(x1 + ((x2 - x1) * i) / n - w / 2), Math.round(y1 + ((y2 - y1) * i) / n - w / 2), w, w);
  };
  const bx3 = (g, x, y, w, h, base, hl, dk) => { R(g, x, y, w, h, base); if (hl) { R(g, x, y, w, 1, hl); R(g, x, y, 1, h, hl); } if (dk) { R(g, x, y + h - 1, w, 1, dk); R(g, x + w - 1, y + 1, 1, h - 1, dk); } };
  const star4 = (g, x, y, r, col) => { R(g, x, y - r, 1, 2 * r + 1, col); R(g, x - r, y, 2 * r + 1, 1, col); if (r > 2) R(g, x - 1, y - 1, 3, 3, col); };
  const HEART = [".#.#.", "#####", "#####", ".###.", "..#.."];
  const heart = (g, x, y, col) => { PX.sprite(g, HEART, x, y, { "#": col }); R(g, x + 1, y + 1, 1, 1, "#ffd0e8"); };
  const shadow = (g, cx, cy, rx, a) => PX.alpha(g, a === undefined ? 0.45 : a, () => ell(g, cx, cy, rx, Math.max(1, Math.round(rx / 4)), "#000000"));
  const steam = (g, x, y, t, n, col, rise, a, seed) => {
    for (let i = 0; i < n; i++) { const k = frac(t * 0.35 + i / n + (seed || 0)); g.globalAlpha = (a || 0.15) * (1 - k) * Math.min(1, k * 5);
      PX.circle(g, x + Math.sin(k * 4 + i * 2.3) * 14 + (i % 3 - 1) * 20, y - k * (rise || 60), 6 + Math.round(k * 12), col); }
    g.globalAlpha = 1;
  };
  // person geometry (mirrors PX.learn.person proportions) so hands can be placed before drawing
  const geo = (h, y, seated) => { const hh = Math.round(h * 0.3), th = Math.round(h * 0.28), nk = Math.max(1, Math.round(h * 0.03)), legH = h - hh - nk - th, hip = seated ? y : y - legH, ty = hip - th; return { hh, th, hip, ty, hy: ty - nk - hh }; };

  // ---------- the AI agent: rounded cyan-grey box head, two big square eyes, antenna with a pink LED ----------
  // (x, y) = head centre, w = head width. o.eyes "normal"|"happy"|"wide"|"closed", o.mouth "smile"|"flat"|"o"
  const agent = (g, x, y, w, t, o) => {
    o = o || {};
    const h = Math.round(w * 0.8), x0 = Math.round(x - w / 2), y0 = Math.round(y - h / 2), xc = Math.round(x), cut = w >= 16 ? 2 : 1;
    const HL = "#d4ecf2", B = "#8fb4c4", DK = "#587a8c";
    const ah = Math.max(3, Math.round(w * 0.3)), on = PX.blink(t + (o.seed || 0), 1.3, 0.6);
    R(g, xc, y0 - ah, 1, ah, "#6a8494"); R(g, xc - 1, y0 - ah - 2, 3, 3, on ? "#ff7ac0" : "#a83a72"); if (w >= 20) R(g, xc - 1, y0 - ah - 2, 1, 1, "#ffd0e8");
    PX.glow(g, xc, y0 - ah - 1, Math.max(6, w * 0.4), "rgba(255,90,170,0.9)", on ? 0.8 : 0.25);
    const ey0 = y0 + Math.round(h * 0.35), eh = Math.max(2, Math.round(h * 0.3));
    R(g, x0 - 2, ey0, 2, eh, DK); R(g, x0 + w, ey0, 2, eh, DK); R(g, x0 - 2, ey0, 2, 1, B); R(g, x0 + w, ey0, 2, 1, B);
    for (let r = 0; r < h; r++) { const ins = r < cut ? cut - r : r >= h - cut ? r - (h - cut) + 1 : 0; R(g, x0 + ins, y0 + r, w - 2 * ins, 1, B); }
    R(g, x0 + cut, y0, w - 2 * cut, 1, HL); R(g, x0, y0 + cut, 1, h - 2 * cut, HL); R(g, x0 + w - 1, y0 + cut, 1, h - 2 * cut, DK); R(g, x0 + cut, y0 + h - 1, w - 2 * cut, 1, DK);
    if (w >= 16) R(g, x0 + w - 2, y0 + cut + 1, 1, h - 2 * cut - 2, sh(DK, 1.15));
    const m = Math.max(2, Math.round(w * 0.13)), fx = x0 + m, fy = y0 + Math.round(h * 0.2), fw = w - 2 * m, fh = Math.round(h * 0.62);
    R(g, fx, fy, fw, fh, "#13202c"); R(g, fx, fy + fh - 1, fw, 1, "#2a4050");
    const es = Math.max(2, Math.round(w * 0.17)), ey = fy + Math.max(1, Math.round(fh * 0.2)), gap = Math.round(fw * 0.16), exL = fx + gap, exR = fx + fw - gap - es, ec = o.ec || "#5fe3e8";
    const eyes = o.eyes || "normal", blink = eyes === "normal" && PX.blink(t + (o.seed || 0) * 0.7, 3.4, 0.05);
    for (const ex of [exL, exR]) {
      if (eyes === "closed" || blink) R(g, ex, ey + es - 1, es, 1, ec);
      else if (eyes === "happy") { R(g, ex, ey + 1, 1, es - 1, ec); R(g, ex + es - 1, ey + 1, 1, es - 1, ec); R(g, ex + 1, ey, es - 2, 1, ec); }
      else if (eyes === "wide") { R(g, ex - 1, ey - 1, es + 2, es + 2, ec); R(g, ex + 1, ey + 1, Math.max(1, es - 2), Math.max(1, es - 2), "#13202c"); }
      else { R(g, ex, ey, es, es, ec); if (es >= 3) R(g, ex, ey, 1, 1, "#e8ffff"); }
    }
    PX.glow(g, xc, ey + es / 2, w * 0.5, rgba(ec, 0.5), 0.6);
    const my = fy + fh - Math.max(2, Math.round(fh * 0.28)), mw = Math.max(2, Math.round(fw * 0.3)), mo = o.mouth || "smile";
    if (mo === "o") R(g, xc - 1, my - 1, 3, 2, ec);
    else if (mo === "flat") R(g, xc - Math.round(mw / 2), my, mw, 1, ec);
    else { R(g, xc - Math.round(mw / 2) + 1, my, mw - 1, 1, ec); R(g, xc - Math.round(mw / 2), my - 1, 1, 1, ec); R(g, xc + Math.round(mw / 2), my - 1, 1, 1, ec); }
    if (o.sweat) { const k = frac(t * 1.2); R(g, x0 + w + 1, y0 + 2 + k * 5, 2, 3, "#8fd8ff"); }
  };

  // ---------- the dev: dark messy hair, green hoodie, medium-brown skin, headphones around the neck ----------
  const DEV = { h: 66, shirt: "#3a9a5a", pants: "#2c3048", hair: "#17111a", hairStyle: "spiky", skin: "#a8704a", shoe: "#1c1c26" };
  const phonesNeck = (g, P) => {
    const y = P.ty - 1, x = P.hx, hw = P.hw;
    R(g, x - hw / 2 + 1, y + 1, hw - 2, 2, "#262836"); R(g, x - hw / 2 + 1, y + 1, hw - 2, 1, "#4a4e62");
    for (const s of [-1, 1]) { const cx = s < 0 ? x - hw / 2 - 3 : x + hw / 2 - 1; R(g, cx, y - 1, 4, 6, "#33364a"); R(g, cx, y - 1, 4, 1, "#5a6078"); R(g, cx + (s < 0 ? 0 : 3), y, 1, 5, "#1c1e2a"); R(g, cx + 1, y + 2, 2, 2, "#3df56b"); }
  };
  // extra(b, P) draws inside the outline pass (glasses, hats...)
  const dev = (g, x, y, o, extra) => LB().outlined(g, (b) => {
    const P = LB().person(b, x, y, { ...DEV, ...o, outline: false });
    if (!(o && o.noPhones)) phonesNeck(b, P);
    if (extra) extra(b, P);
    return P;
  });
  const shades = (g, P, k) => { // sunglasses sliding down from the forehead (k 0..1)
    const ey = P.ey, y = Math.round(lerp(P.hy - 4, ey - 1, k)), x = P.hx, hw = P.hw;
    R(g, x - hw / 2, y, hw, 1, "#0a0a12");
    R(g, x - hw / 2 + 1, y, Math.round(hw / 2) - 1, 4, "#0a0a12"); R(g, x + 1, y, Math.round(hw / 2) - 2, 4, "#0a0a12");
    R(g, x - hw / 2 + 2, y + 1, 2, 1, "#5a6a9a"); R(g, x + 2, y + 1, 2, 1, "#5a6a9a");
  };
  const mouthOpen = (g, P) => { const my = P.hy + Math.round(P.hh * 0.78); R(g, P.hx - 1, my - 1, 3, 3, "#1a1016"); R(g, P.hx - 1, my + 1, 3, 1, "#b0404a"); };

  // pixel pine silhouette
  const pine = (g, x, base, h, col, hl, trunk, dk) => {
    R(g, x - 1, base - Math.round(h * 0.22), 3, Math.round(h * 0.22), trunk || col);
    for (let i = 0; i < 4; i++) {
      const ty0 = Math.round(base - h * 0.16 - i * h * 0.19), w = (4 - i) * h * 0.075 + 3, th = Math.round(h * 0.3);
      for (let r = 0; r < th; r++) { const ww = Math.round((w * r) / th) + ((r + i) % 4 === 3 ? 1 : 0), y = ty0 - th + r; R(g, x - ww, y, ww * 2 + 1, 1, col); if (hl && r > 1) R(g, x + ww - 1 - (r % 3 === 0 ? 1 : 0), y, 2, 1, hl); }
      for (let k = -Math.round(w); k < w; k += 3) R(g, x + k, ty0, 2, 1 + (Math.abs(k) % 2), col);
      if (dk) { R(g, x - Math.round(w * 0.8), ty0 - 1, Math.round(w * 1.2), 1, dk); for (let r = 3; r < th - 1; r += 3) { const ww = Math.round((w * r) / th); for (let k = -ww + ((r * 5 + i) % 4); k < ww - 2; k += 5 + (r % 3)) R(g, x + k, ty0 - th + r, 2, 1, dk); } }
    }
  };
  // code line colours
  const KW = "#ff7b72", FN = "#d2a8ff", TXc = "#c9d1d9", STR = "#a5d6ff", NUM = "#79c0ff", CM = "#7d8590";

  // ======================= copilot_room =======================
  // lo-fi room at night: monitor with code (left) + AI chat (right); grey ghost suggestions appear and get accepted.
  // o.start (0.5) first suggestion, o.every (1.2) seconds per suggestion
  K.copilot_room = (o) => {
    const CODE = [
      { seg: [["def", KW], [" score", FN], ["(user):", TXc]] },
      { ind: 1, seg: [["total", TXc], [" = ", KW], ["0", NUM]] },
      { ind: 1, seg: [["for", KW], [" q ", TXc], ["in", KW], [" user.quiz:", TXc]] },
      { ind: 2, seg: [["if", KW], [" q.ok:", TXc]] },
      { ind: 3, seg: [["total", TXc], [" += ", KW], ["q.pts", TXc]] },
      { ind: 2, seg: [["else", KW], [":", TXc]] },
      { ind: 3, seg: [["log", FN], ["(q.id)", TXc]] },
      { ind: 1, seg: [["bonus", TXc], [" = ", KW], ["streak", FN], ["(user)", TXc]] },
      { ind: 1, seg: [["return", KW], [" total + bonus", TXc]] },
      { seg: [["", TXc]] },
      { seg: [["def", KW], [" streak", FN], ["(user):", TXc]] },
      { ind: 1, seg: [["days", TXc], [" = ", KW], ["user.log", TXc]] },
      { ind: 1, seg: [["return", KW], [" len", FN], ["(days)", TXc]] },
      { seg: [["", TXc]] },
      { seg: [["# ", CM], ["save scores", CM]] },
      { seg: [["db", TXc], [".save", FN], ["(", TXc], ["\"s\"", STR], [")", TXc]] },
    ];
    const RNG = PX.rnd(41), DROPS = [...Array(22)].map(() => [RNG(), RNG(), 0.25 + RNG() * 0.5, RNG()]);
    const BASE = 3, ACC = 0.62;
    return (g, t, d, c) => {
      const t0 = T(o, "start", 0.5, d, 7), P = o.every !== undefined ? o.every : 1.2;
      const k = t < t0 ? -1 : Math.floor((t - t0) / P), A = t0 + k * P, accepted = k >= 0 && t >= A + ACC;
      const solid = BASE + (k < 0 ? 0 : k + (accepted ? 1 : 0)), ghostOn = k >= 0 && !accepted;
      const flash = k >= 0 && accepted ? t - (A + ACC) : 9;
      // ---- wall ----
      PX.vgrad(g, 0, 0, 640, 254, "1a1d3e", "0d1124", 10);
      for (let x = 8; x < 640; x += 18) R(g, x, 0, 1, 250, "rgba(0,0,0,.14)");
      // window with rain (far)
      PX.par(g, c, 0.45, () => {
        const wx = 34, wy = 40, ww = 160, wh = 126;
        R(g, wx - 5, wy - 5, ww + 10, wh + 10, "#262b46"); R(g, wx - 5, wy - 5, ww + 10, 1, "#4a5274");
        if (CORE().skyline) CORE().skyline(g, wx, wy, ww, wh, t, 12); else PX.vgrad(g, wx, wy, ww, wh, "1a1f4a", "3b2a5c", 6);
        R(g, wx, wy, ww, wh, "rgba(40,60,120,.28)");
        LB().rain(g, t, 7, 60, [wx, wy, ww, wh], { a: 0.35, col: "#a8c0f0", vy: 220, vx: -30, len: 7 });
        for (const [u, v, sp, ph] of DROPS) { // drops trickling down the glass
          const x = wx + 2 + u * (ww - 4), y = wy + frac(v + t * sp * 0.35 + ph) * wh;
          g.globalAlpha = 0.55; R(g, x, y, 1, 2, "#c8d8ff"); g.globalAlpha = 0.2; R(g, x, y - 6, 1, 6, "#c8d8ff"); g.globalAlpha = 1;
        }
        R(g, wx + ww / 2 - 2, wy, 4, wh, "#262b46"); R(g, wx, wy + wh / 2 - 2, ww, 4, "#262b46");
        R(g, wx - 10, wy + wh + 5, ww + 20, 6, "#363c5a"); R(g, wx - 10, wy + wh + 5, ww + 20, 1, "#5a6488");
        // curtains
        for (const cx of [wx - 22, wx + ww + 6]) { R(g, cx, wy - 14, 18, 150, "#3a2350"); for (let i = 0; i < 3; i++) R(g, cx + 3 + i * 5, wy - 14, 2, 150, "#2a1840"); R(g, cx + (cx < wx ? 16 : 0), wy - 14, 2, 150, "#4e3068"); }
        R(g, wx - 26, wy - 16, ww + 52, 3, "#1c1428"); R(g, wx - 26, wy - 16, ww + 52, 1, "#5a4a6a");
        // cat asleep on the sill, silhouetted against the window
        { const cx = wx + 34, cy = wy + wh + 4, br = Math.sin(t * 2.2) > 0 ? 1 : 0, tl = Math.round(Math.sin(t * 1.4) * 3);
          ell(g, cx, cy - 5 - br, 13, 6 + br, "#141020"); PX.circle(g, cx + 11, cy - 8, 5, "#141020"); R(g, cx + 8, cy - 15, 2, 3, "#141020"); R(g, cx + 13, cy - 15, 2, 3, "#141020");
          for (let a = 3.3; a < 5.6; a += 0.08) R(g, cx + Math.cos(a) * 13, cy - 5 - br + Math.sin(a) * (6 + br), 1, 1, "#3a3a66");
          thk(g, cx - 12, cy - 2, cx - 20, cy - 4 + tl, 2, "#141020"); R(g, cx + 12, cy - 8, 2, 1, "#2a2440"); }
        // small plant on the sill
        R(g, wx + 120, wy + wh - 6, 14, 10, "#8a4a2c"); R(g, wx + 120, wy + wh - 6, 14, 2, "#b0623a");
        for (let i = 0; i < 5; i++) thk(g, wx + 127, wy + wh - 6, wx + 118 + i * 5, wy + wh - 22 + (i % 2) * 5, 2, i % 2 ? "#2f7a4a" : "#3f9a5a");
      });
      // fairy lights + shelf (mid)
      PX.par(g, c, 0.7, () => {
        LB().fairy(g, 214, 470, 14, 12, t, 11, 6);
        R(g, 470, 82, 140, 5, "#4a3626"); R(g, 470, 82, 140, 1, "#7a5a3e"); R(g, 470, 87, 140, 2, "#22180f");
        const bk = ["#a8443a", "#3a6a9a", "#3a8a5a", "#7a4a8a", "#b06a2a", "#2a8a8a", "#c0a03a"];
        let bx = 476; bk.forEach((col, i) => { const h = 18 + (i * 7) % 9, w = 6 + (i % 3); R(g, bx, 82 - h, w, h, col); R(g, bx, 82 - h, 1, h, sh(col, 1.3)); R(g, bx + w - 1, 82 - h, 1, h, sh(col, 0.7)); bx += w + 1; });
        R(g, bx + 4, 70, 18, 12, "#2a2f45"); R(g, bx + 6, 72, 14, 8, "#5fe3e8"); R(g, bx + 6, 72, 14, 8, "rgba(10,20,40,.55)"); // tiny photo frame
        // vinyl / poster
        R(g, 516, 112, 64, 64, "#1c2036"); R(g, 518, 114, 60, 60, "#2a2244"); PX.circle(g, 548, 144, 22, "#141220"); PX.circle(g, 548, 144, 8, "#f25ca8"); PX.circle(g, 548, 144, 2, "#141220");
        for (let r = 12; r < 22; r += 3) { R(g, 548 - r, 144, 1, 1, "#2e2a40"); R(g, 548 + r, 144, 1, 1, "#2e2a40"); }
        // hanging plant
        R(g, 600, 0, 1, 40, "#2a2a36"); R(g, 592, 40, 18, 12, "#7a4a2c"); R(g, 592, 40, 18, 2, "#a0623a");
        for (let i = 0; i < 6; i++) { const sw = Math.round(Math.sin(t * 1.3 + i) * 1.5); thk(g, 594 + i * 3, 50, 590 + i * 4 + sw, 62 + (i % 3) * 8, 2, i % 2 ? "#2f7a4a" : "#46a862"); }
      });
      // lamp light on the wall
      PX.glow(g, 548, 196, 150, "rgba(255,190,110,0.32)", 1);
      // ---- desk ----
      R(g, 0, 250, 640, 12, "#5a3e2b"); R(g, 0, 250, 640, 2, "#8a6444"); R(g, 0, 262, 640, 98, "#1a1410"); R(g, 0, 262, 640, 2, "#0e0a08");
      for (const lx of [24, 604]) { R(g, lx, 262, 12, 98, "#2a1f17"); R(g, lx, 262, 2, 98, "#3a2a1f"); }
      // ---- monitor ----
      const MX = 196, MY = 62, MW = 248, MH = 142;
      PX.glow(g, 320, 140, 210, "rgba(90,160,255,0.2)", 1);
      R(g, MX - 6, MY - 6, MW + 12, MH + 12, "#1a1d26"); R(g, MX - 6, MY - 6, MW + 12, 1, "#4a505e"); R(g, MX - 6, MY - 6, 1, MH + 12, "#30343f"); R(g, MX + MW + 5, MY - 6, 1, MH + 12, "#101218");
      R(g, MX + MW / 2 - 6, MY + MH + 6, 12, 26, "#1a1d26"); R(g, MX + MW / 2 - 6, MY + MH + 6, 2, 26, "#30343f"); R(g, MX + MW / 2 - 26, MY + MH + 30, 52, 4, "#22252e"); R(g, MX + MW / 2 - 26, MY + MH + 30, 52, 1, "#4a505e");
      R(g, MX + MW / 2 - 1, MY + MH + 2, 2, 1, PX.blink(t, 2) ? "#3df56b" : "#1f6a3a");
      // editor (left)
      const EW = 140;
      R(g, MX, MY, MW, MH, "#0d1117"); R(g, MX, MY, MW, 9, "#161b22");
      R(g, MX + 3, MY + 2, 40, 7, "#0d1117"); TX(g, "score.py", MX + 6, MY + 1, { font: "v", size: 10, col: "#c9d1d9" });
      R(g, MX, MY + 9, 16, MH - 9, "#0b0f14");
      const lh = 9, rows = Math.floor((MH - 14) / lh), total = solid + (ghostOn ? 1 : 0), first = Math.max(0, total - rows);
      for (let i = first; i < total; i++) {
        const ln = CODE[i % CODE.length], y = MY + 11 + (i - first) * lh, isG = ghostOn && i === total - 1;
        TX(g, String(i + 1), MX + 13, y, { font: "v", size: 10, col: isG ? "#30363d" : "#484f58", align: "right" });
        if (i === solid - 1 && flash < 0.35) { R(g, MX + 16, y, EW - 16, lh, rgba("#3df56b", 0.22 * (1 - flash / 0.35))); }
        let lx = MX + 19 + (ln.ind || 0) * 8;
        if (isG) {
          const n = Math.floor(cl((t - A) / 0.18, 0, 1) * 40); let used = 0;
          for (const [txt] of ln.seg) { const s = txt.slice(0, Math.max(0, n - used)); used += txt.length; lx += TX(g, s, lx, y, { font: "v", size: 10, col: "#737c88" }); }
          if (t - A > 0.2) { const kx = MX + EW - 22; R(g, kx, y + 1, 18, 7, "#21262d"); TX(g, "TAB", kx + 9, y, { font: "v", size: 9, col: "#8b949e", align: "center" }); }
        } else for (const [txt, col] of ln.seg) lx += TX(g, txt, lx, y, { font: "v", size: 10, col });
        if (i === total - 1 && (PX.blink(t, 1.0, 0.55) || isG)) R(g, (isG ? MX + 19 + (ln.ind || 0) * 8 : lx + 1), y + 1, 1, 7, "#e6edf3");
      }
      // chat panel (right)
      const CX = MX + EW + 2, CW = MW - EW - 2;
      R(g, CX - 2, MY, 2, MH, "#21262d"); R(g, CX, MY, CW, MH, "#10161e"); R(g, CX, MY, CW, 14, "#161d27");
      agent(g, CX + 10, MY + 7, 12, t, { eyes: ghostOn && t - A < 0.3 ? "happy" : "normal" });
      R(g, CX + 21, MY + 5, 30, 2, "#5fe3e8"); R(g, CX + 21, MY + 9, 18, 1, "#3a5060");
      // messages: one AI reply per suggestion, newest at the bottom
      const n = Math.max(0, k + 1), msgs = [];
      for (let i = 0; i <= n; i++) msgs.push(i % 3 === 1 ? { me: 1, w: 40 + (i * 13) % 20, l: 1, i } : { me: 0, w: 66 + (i * 17) % 22, l: 2 + (i % 2), i });
      let yb = MY + MH - 18;
      R(g, CX + 4, MY + MH - 14, CW - 8, 10, "#1c2430"); R(g, CX + 4, MY + MH - 14, CW - 8, 1, "#2e3a4a"); if (PX.blink(t, 1.1)) R(g, CX + 7, MY + MH - 12, 1, 6, "#8b949e");
      for (let j = msgs.length - 1; j >= 0 && yb > MY + 18; j--) {
        const m = msgs[j], bh = 5 + m.l * 5, age = m.i === n ? t - A : 9, pop = PX.ease(cl(age / 0.25, 0, 1), "back");
        if (age < 0) continue;
        const bw = Math.round(m.w * (0.4 + 0.6 * pop)), x = m.me ? CX + CW - 5 - bw : CX + 5, y = yb - bh;
        if (y < MY + 16) break;
        R(g, x, y, bw, bh, m.me ? "#2a3a7a" : "#1d3a40"); R(g, x, y, bw, 1, m.me ? "#3e52a0" : "#2c5a62");
        for (let L = 0; L < m.l; L++) R(g, x + 4, y + 4 + L * 5, Math.max(4, bw - 10 - ((L + m.i) % 3) * 9), 2, m.me ? "#9fb0f0" : "#7fd8d8");
        if (!m.me && m.i === n && age < 0.3) { R(g, x + 4, y + 4, bw - 8, bh - 6, "#1d3a40"); for (let q = 0; q < 3; q++) R(g, x + 6 + q * 5, y + 5 + (Math.floor(t * 8 + q) % 2), 2, 2, "#7fd8d8"); }
        yb = y - 4;
      }
      // screen glare
      g.globalAlpha = 0.05; poly(g, [[MX + 20, MY], [MX + 60, MY], [MX + 10, MY + MH], [MX - 30 + 30, MY + MH]], "#ffffff"); g.globalAlpha = 1;
      PX.glow(g, 320, 252, 110, "rgba(90,170,255,0.2)", 1);
      // ---- desk props ----
      // lamp (right)
      R(g, 536, 244, 30, 6, "#2b2f38"); R(g, 536, 244, 30, 1, "#4a505c"); thk(g, 551, 244, 560, 210, 3, "#3a3f4b"); thk(g, 560, 210, 540, 190, 3, "#3a3f4b");
      poly(g, [[522, 188], [552, 180], [558, 196], [528, 204]], "#2e3446"); poly(g, [[522, 188], [552, 180], [553, 183], [523, 191]], "#5a6278");
      R(g, 528, 200, 28, 2, "#ffd28a"); PX.glow(g, 542, 206, 60, "rgba(255,210,140,0.7)", 1); PX.glow(g, 545, 248, 90, "rgba(255,180,100,0.3)", 1);
      // books stack + plant (right desk)
      bx3(g, 470, 238, 42, 6, "#8a3a3a", "#b05050", "#5a2020"); bx3(g, 474, 232, 36, 6, "#2a5a8a", "#4a7ab0", "#1a3a5a"); bx3(g, 468, 244, 46, 6, "#3a7a4a", "#5aa06a", "#24502e");
      R(g, 590, 234, 18, 16, "#8a4a2c"); R(g, 590, 234, 18, 2, "#b0623a"); for (let i = 0; i < 6; i++) { const sw = Math.round(Math.sin(t * 1.1 + i * 1.7)); thk(g, 599, 234, 588 + i * 5 + sw, 214 + (i % 2) * 6, 2, i % 2 ? "#2f7a4a" : "#4aa864"); }
      // mug + phone (left)
      if (CORE().mug) CORE().mug(g, 160, 240, t);
      R(g, 112, 244, 26, 6, "#15171e"); R(g, 113, 245, 24, 4, PX.blink(t + 0.4, 4.3, 0.12) ? "#2a5a8a" : "#1c2230");
      // headphone stand (left)
      R(g, 70, 214, 3, 36, "#2b2f38"); R(g, 62, 248, 19, 3, "#2b2f38"); R(g, 64, 210, 15, 3, "#3a3f4b");
      // keyboard
      R(g, 266, 238, 108, 12, "#22252e"); R(g, 266, 238, 108, 1, "#4a505c");
      const tabHit = flash < 0.15;
      for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 17; kx++) { const press = (kx === 0 && ky === 1 && tabHit); R(g, 269 + kx * 6, 240 + ky * 3 + (press ? 1 : 0), 5, 2, press ? "#3df56b" : "#5a6270"); }
      R(g, 384, 242, 8, 6, "#3a3f4b"); R(g, 384, 242, 8, 1, "#5a606c");
      // ---- the dev from behind (green hoodie, headphones on the neck) ----
      if (CORE().coder) {
        const x = 314, y = 270;
        CORE().coder(g, x, y, t, { typing: flash < 0.25, col: "#2a7448", hl: "#3c9460", dark: "#1a5432", hair: "#17111a", skin: "#a8704a" });
        R(g, x - 13, y - 6, 26, 3, "#262836"); R(g, x - 13, y - 6, 26, 1, "#4a4e62");
        R(g, x - 18, y - 9, 6, 8, "#33364a"); R(g, x + 12, y - 9, 6, 8, "#33364a"); R(g, x - 18, y - 9, 6, 1, "#5a6078"); R(g, x + 12, y - 9, 6, 1, "#5a6078");
        R(g, x - 16, y - 6, 2, 2, "#3df56b"); R(g, x + 14, y - 6, 2, 2, "#3df56b");
        // TAB keycap pops above the shoulder when a suggestion is accepted
        if (flash < 0.7) { const pk = PX.ease(cl(flash / 0.2, 0, 1), "back"), fy = Math.round(222 - pk * 8 - flash * 10);
          PX.alpha(g, 1 - cl((flash - 0.45) / 0.25, 0, 1), () => { bx3(g, x + 34, fy, 26, 13, "#2e3440", "#5a6478", "#1a1e26"); TX(g, "TAB", x + 47, fy + 3, { size: 8, col: "#3df56b", align: "center" }); }); }
      }
      PX.particles(g, 13, 24, t, [470, 150, 150, 100], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.6 });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= trap =======================
  // moonlit forest path; the dev walks right staring at his phone toward a bear trap baited with an ACCEPT ALL button.
  // o.stop (8.0) he halts one step before it. o.lean (false): walks leaning on an AI-avatar crutch, eyes closed.
  K.trap = (o) => {
    const RN = PX.rnd(77);
    const farT = [...Array(30)].map((_, i) => [i * 23 - 10 + RN() * 12, 40 + RN() * 34]);
    const midT = [...Array(8)].map((_, i) => [i * 88 + 20 + RN() * 30, 110 + RN() * 50]);
    const LEAVES = [...Array(170)].map(() => [RN() * 640, 296 + RN() * 50, Math.floor(RN() * 4), RN()]);
    const STARS = [...Array(60)].map(() => [RN() * 640, RN() * 150, RN()]);
    const LC = ["#6a4436", "#8a5a3a", "#5a3a3a", "#7a6a3a"];
    const TRX = 478, GY = 320, DH = 84;
    const ST = ["#e4ebf4", "#9aa6b8", "#5a6476", "#2c3240"];
    const trap = (g, x, y, t, front) => {
      const RX = 58, RY = 15;
      if (!front) {
        shadow(g, x, y + 3, 76, 0.55);
        for (let i = 0; i < 7; i++) { const cx = x + 64 + i * 7, cy = y + 5 + Math.round(Math.sin(i * 1.3)); PX.box(g, cx, cy, 6, 4, i % 2 ? ST[2] : ST[1]); }
        R(g, x + 113, y - 6, 4, 16, ST[2]); R(g, x + 113, y - 6, 1, 16, ST[1]); R(g, x + 110, y - 8, 10, 3, ST[1]); R(g, x + 110, y - 8, 10, 1, ST[0]);
        for (const s of [-1, 1]) { const x0 = s < 0 ? x - RX - 44 : x + RX - 2; R(g, x0, y - 2, 46, 5, ST[2]); R(g, x0, y - 2, 46, 1, ST[0]); R(g, x0, y + 2, 46, 1, ST[3]);
          const lx = s < 0 ? x0 - 5 : x0 + 42; PX.box(g, lx, y - 5, 9, 10, ST[1]); PX.box(g, lx + 1, y - 4, 7, 8, ST[2]); R(g, lx, y - 5, 9, 1, ST[0]); }
        ell(g, x, y + 1, RX + 1, RY + 1, ST[3]); ell(g, x, y, RX, RY, ST[2]); ell(g, x, y - 1, RX - 3, RY - 2, ST[1]); ell(g, x, y - 1, RX - 6, RY - 4, "#1c1c2a"); ell(g, x, y, RX - 7, RY - 4, "#272536");
        for (let a = Math.PI * 1.08; a < Math.PI * 1.92; a += 0.03) R(g, x + Math.cos(a) * (RX - 1), y - 1 + Math.sin(a) * (RY - 1), 1, 1, ST[0]);
      }
      for (let i = 0; i < 26; i++) {
        const a = (i / 26) * Math.PI * 2 + 0.06, sn = Math.sin(a);
        if (front ? sn <= 0 : sn > 0) continue;
        const px = Math.round(x + Math.cos(a) * (RX - 4)), py = Math.round(y - 1 + sn * (RY - 3)), th = front ? 9 : 7;
        for (let r = 0; r < th; r++) { const w = Math.max(1, Math.round(((r + 1) / th) * 4)); R(g, px - Math.floor(w / 2), py - th + r, w, 1, r < 2 ? ST[0] : r < th - 2 ? ST[1] : ST[2]); }
        R(g, px + 1, py - th + 3, 1, th - 3, ST[2]);
      }
      if (!front) {
        ell(g, x, y + 2, 17, 5, ST[3]); ell(g, x, y + 1, 16, 4, ST[1]); R(g, x - 12, y - 2, 24, 1, ST[0]);
        R(g, x - 3, y - 14, 6, 14, ST[2]); R(g, x - 3, y - 14, 2, 14, ST[1]); R(g, x - 6, y - 15, 12, 2, ST[1]);
      }
    };
    const button = (g, x, y, t) => {
      const pulse = 0.5 + 0.5 * Math.sin(t * 4);
      PX.glow(g, x, y + 2, 56 + pulse * 12, "rgba(61,245,107,0.65)", 1);
      PX.glow(g, x, y + 34, 50, "rgba(61,245,107,0.35)", 1);
      const w = 78, h = 20, x0 = x - w / 2, y0 = y - h / 2;
      R(g, x0 + 1, y0 + 4, w, h, "#0e2a16");
      R(g, x0 + 1, y0, w - 2, h, "#24b04a"); R(g, x0, y0 + 1, w, h - 2, "#24b04a");
      R(g, x0 + 1, y0, w - 2, 2, "#7cff9e"); R(g, x0, y0 + 1, 1, h - 3, "#5ae07c"); R(g, x0 + 1, y0 + h - 2, w - 2, 2, "#127a30"); R(g, x0 + w - 1, y0 + 1, 1, h - 2, "#169038");
      TX(g, "ACCEPT ALL", x + 1, y0 + 3, { font: "v", size: 16, col: "#0c3a1a", align: "center" });
      TX(g, "ACCEPT ALL", x, y0 + 2, { font: "v", size: 16, col: "#effff2", align: "center" });
      const sp = frac(t / 1.7); if (sp < 0.35) { const sx = Math.round(x0 + (sp / 0.35) * (w + 10) - 5); g.globalAlpha = 0.5; for (let r = 0; r < h; r++) { const xx = sx + Math.round((h - r) * 0.4); if (xx > x0 && xx < x0 + w - 2) R(g, xx, y0 + r, 3, 1, "#ffffff"); } g.globalAlpha = 1; }
      for (let i = 0; i < 5; i++) { const k = frac(t * 0.6 + i / 5); if (k < 0.5) star4(g, Math.round(x - 50 + ((i * 29) % 100)), Math.round(y - 16 - (i % 2) * 8 + (i > 2 ? 34 : 0)), k < 0.25 ? 2 : 1, "#d8ffe0"); }
    };
    const bush = (g, x, y, s, col, rim) => { for (let i = 0; i < 5; i++) { const cx = x + (i - 2) * s * 0.8, r = Math.round(s * (0.7 + ((i * 3) % 4) * 0.12)); PX.circle(g, cx, y - r * 0.6, r, col); if (rim) for (let a = 3.8; a < 5.6; a += 0.1) R(g, cx + Math.cos(a) * r, y - r * 0.6 + Math.sin(a) * r, 1, 1, rim); } };
    return (g, t, d, c) => {
      const STOP = T(o, "stop", 8.0, d, 11), lean = !!o.lean;
      // ---- sky ----
      PX.par(g, c, 0.15, () => {
        PX.vgrad(g, -20, -20, 680, 270, "070a1c", "222850", 9);
        for (const [x, y, p] of STARS) { g.globalAlpha = 0.35 + 0.55 * Math.abs(Math.sin(t * 1.2 + p * 9)); R(g, x, y, 1, 1, "#e8ecff"); } g.globalAlpha = 1;
        PX.glow(g, 488, 62, 130, "rgba(170,190,255,0.38)", 1);
        PX.circle(g, 488, 62, 19, "#c8cce0"); PX.circle(g, 486, 60, 17, "#eef0e0"); PX.circle(g, 480, 56, 4, "#d8dac8"); PX.circle(g, 494, 68, 3, "#d8dac8"); PX.circle(g, 491, 53, 2, "#d8dac8");
        for (let i = 0; i < 3; i++) { const cx = ((i * 260 + t * 6) % 900) - 130, cy = 40 + i * 26; g.globalAlpha = 0.35; ell(g, cx, cy, 60, 4, "#3a4270"); ell(g, cx + 20, cy - 3, 34, 3, "#4a5288"); g.globalAlpha = 1; }
      });
      // ---- far pines ----
      PX.par(g, c, 0.32, () => {
        R(g, -20, 206, 680, 70, "#121a34");
        for (const [x, h] of farT) pine(g, x, 222, h + 22, "#151e3c", null, null, "#111830");
        g.globalAlpha = 0.16; R(g, -20, 196, 680, 30, "#7080b8"); g.globalAlpha = 1;
      });
      for (let i = 0; i < 6; i++) { const fx = ((i * 140 + t * 8) % 840) - 100; g.globalAlpha = 0.13; ell(g, fx, 234 + (i % 2) * 8, 100, 11, "#9aa8d8"); g.globalAlpha = 1; }
      // moonlight shafts
      PX.alpha(g, 0.07 + 0.02 * Math.sin(t * 0.7), () => { poly(g, [[470, 70], [500, 70], [430, 330], [340, 330]], "#a8b8f0"); poly(g, [[505, 70], [520, 70], [560, 330], [520, 330]], "#a8b8f0"); });
      // ---- mid pines ----
      PX.par(g, c, 0.6, () => {
        for (const [x, h] of midT) pine(g, x, 286, h + 50, "#0c1226", "#2a3864", "#0a0e1c", "#080c1a");
        R(g, -20, 276, 680, 20, "#0f1424");
        for (let i = 0; i < 9; i++) bush(g, i * 80 + 20, 292, 9, "#0d1324", "#1e2a4a");
      });
      // ---- ground + path ----
      R(g, 0, 284, 640, 76, "#121828");
      for (let x = 0; x < 640; x += 3) { const hgt = 2 + ((x * 7) % 5); R(g, x, 286 - hgt, 1, hgt, x % 2 ? "#18243a" : "#1c2c40"); }
      PX.par(g, c, 0.85, () => { for (const [x, h] of [[-6, 230], [176, 196], [600, 214]]) pine(g, x, 300, h, "#0a0f20", "#33447a", "#080b16", "#060914"); });
      poly(g, [[0, 300], [640, 296], [640, 346], [0, 342]], "#29293c");
      poly(g, [[0, 300], [640, 296], [640, 299], [0, 303]], "#36374f");
      for (let i = 0; i < 80; i++) { const px = (i * 97) % 640, py = 304 + ((i * 53) % 38); R(g, px, py, 2, 1, i % 3 ? "#3a3a52" : "#1c1c2a"); }
      for (const [x, y, ci, p] of LEAVES) { R(g, x, y, 2, 1, LC[ci]); if (p > 0.6) R(g, x + 1, y - 1, 1, 1, sh(LC[ci], 1.3)); }
      PX.glow(g, 470, 316, 190, "rgba(120,140,220,0.12)", 1);
      // ---- the trap ----
      trap(g, TRX, GY, t, false);
      button(g, TRX, GY - 30, t);
      trap(g, TRX, GY, t, true);
      for (let i = 0; i < 60; i++) { const a = (i / 60) * Math.PI * 2, rr = 46 + ((i * 7) % 16), lx = TRX + Math.cos(a) * rr, ly = GY + 2 + Math.abs(Math.sin(a)) * 11 + (Math.sin(a) < 0 ? -3 : 1); if (i % 3 === 0) continue; R(g, lx, ly, 3, 2, LC[i % 4]); R(g, lx, ly, 1, 1, sh(LC[i % 4], 1.35)); }
      for (let i = 0; i < 18; i++) { const lx = TRX - 70 + i * 8, ly = GY + 8 + (i % 3); R(g, lx, ly, 4, 2, LC[(i + 1) % 4]); R(g, lx + 1, ly - 1, 2, 1, sh(LC[(i + 1) % 4], 1.25)); }
      // ---- the dev ----
      const X0 = 96, XS = TRX - 92, x = Math.round(X0 + (XS - X0) * cl(t / STOP, 0, 1)), dist = x - X0;
      const walking = t > 0 && t < STOP, ph = Math.floor(dist / 9) % 2;
      const legs = walking ? (ph ? [-4, 4] : [3, -3]) : [0, 1], bob = walking ? (ph ? -1 : 0) : Math.round(Math.sin(t * 2) * 0.5);
      const G = geo(DH, GY);
      shadow(g, x, GY, 17, 0.5);
      if (!lean) {
        PX.glow(g, x + 4, G.ty + 4, 30, "rgba(95,227,232,0.5)", 1);
        const py = G.ty + 6 + bob;
        dev(g, x, GY, { h: DH, legs, bob, face: "neutral", look: 2, hands: { l: [x - 1, py + 9], r: [x + 6, py + 9] }, lit: 1 }, (b, P) => {
          R(b, x - 1, py, 8, 12, "#1a1c24"); R(b, x, py + 1, 6, 10, "#5fe3e8"); R(b, x, py + 1, 6, 1, "#bff8fa");
          R(b, x + 1, py + 4, 4, 1, "#2a6a8a"); R(b, x + 1, py + 7, 3, 1, "#2a6a8a");
        });
        PX.glow(g, x + 2, G.hy + 16, 22, "rgba(95,227,232,0.35)", 1);
        if (t > STOP) { const k = frac((t - STOP) / 1.3); if (k < 0.3) star4(g, x + 9, py - 3 - Math.round(k * 10), 1, "#bff8fa"); }
      } else {
        // crutch: foot planted out to the side, AI-avatar head as the armpit pad (drawn first so his arm wraps over it)
        const cx = x + 20, top = G.ty + 5 + bob, fx = x + 32;
        thk(g, fx, GY - 1, cx + 1, top + 8, 3, "#6a4a2c"); thk(g, fx - 1, GY - 1, cx, top + 8, 1, "#9a6e44");
        R(g, fx - 3, GY - 4, 6, 4, "#22222a"); R(g, lerp(fx, cx, 0.45) - 4, lerp(GY, top, 0.45), 8, 3, "#4a3420");
        agent(g, cx + 3, top, 22, t, { eyes: "happy" });
        dev(g, x, GY, { h: DH, legs, bob, face: "closed", lit: 1, hands: { l: [x - 11, G.ty + 20 + bob], r: [lerp(fx, cx, 0.45) + 1, lerp(GY, top, 0.45) - 2] } });
        for (let i = 0; i < 2; i++) { const k = frac(t * 0.5 + i * 0.5); PX.alpha(g, (1 - k) * Math.min(1, k * 5), () => PX.sprite(g, ["..##", "..#.", "..#.", "###.", "##.."], x - 14 - i * 7, G.hy - 6 - k * 24, { "#": "#5fe3e8" })); }
      }
      // ---- fireflies ----
      for (let i = 0; i < 18; i++) {
        const fx = (i * 41 + 30) % 640 + Math.sin(t * (0.5 + (i % 5) * 0.13) + i) * 24, fy = 150 + ((i * 67) % 150) + Math.sin(t * 0.8 + i * 2) * 10;
        const on = 0.5 + 0.5 * Math.sin(t * (1.5 + (i % 3) * 0.6) + i * 2.1);
        if (on < 0.25) continue; R(g, fx, fy, 1, 1, "#f0ffa0"); PX.glow(g, fx, fy, 9, "rgba(220,255,120,0.8)", on * 0.6);
      }
      for (let i = 0; i < 7; i++) { const fx = ((i * 120 - t * 10) % 840 + 840) % 840 - 100; g.globalAlpha = 0.1; ell(g, fx, 334 + (i % 3) * 6, 90, 8, "#a8b4e0"); g.globalAlpha = 1; }
      // ---- foreground: trunks + bushes ----
      PX.par(g, c, 1.2, () => {
        for (const [tx, tw] of [[0, 30], [606, 40]]) { R(g, tx, 0, tw, 360, "#070a14"); R(g, tx + (tx < 300 ? tw - 3 : 2), 0, 2, 360, "#1c2644"); for (let y = 8; y < 360; y += 19) R(g, tx + 6 + (y % 3) * 4, y, 10, 1, "#0e1222"); }
        bush(g, 40, 364, 20, "#05070f", "#18213c"); bush(g, 600, 364, 22, "#05070f", "#18213c"); bush(g, 140, 370, 13, "#05070f", "#141c34");
      });
      PX.vignette(g, 0.6);
    };
  };

  // ======================= vibe_couch =======================
  // the dev sprawled on a beanbag in a neon room, headset mic, talking; wall screen shows diffs + ACCEPT ALL pressed
  // again and again (ACCEPTED 1..48). o.unread (3.0) red UNREAD stamps; o.forget (6.0) code fades, sunglasses on.
  K.vibe_couch = (o) => {
    const RN = PX.rnd(93), CARDS = [...Array(40)].map(() => { const n = 3 + Math.floor(RN() * 3); return [...Array(n)].map(() => [RN() < 0.5 ? 1 : -1, 0.35 + RN() * 0.6]); });
    return (g, t, d, c) => {
      const UNR = T(o, "unread", 3.0, d, 9), FORG = T(o, "forget", 6.0, d, 9);
      const cnt = (tt) => Math.round(1 + 47 * Math.pow(cl((tt - 0.3) / Math.max(1, d - 1.1), 0, 1), 1.25));
      const n = cnt(t), pressed = cnt(t - 0.12) !== n || t < 0.42 && t > 0.3;
      const fade = 1 - PX.p(t, FORG, 1.0, "io");
      // ---- wall ----
      PX.vgrad(g, 0, 0, 640, 280, "1e1234", "0c0a1c", 10);
      // far: window with city (par)
      PX.par(g, c, 0.4, () => {
        R(g, 22, 48, 96, 120, "#241a3a"); if (CORE().skyline) CORE().skyline(g, 26, 52, 88, 112, t, 21);
        R(g, 68, 52, 3, 112, "#241a3a"); R(g, 18, 166, 104, 5, "#33284e"); R(g, 18, 166, 104, 1, "#5a4a7a");
        // neon sign (wave + bolt, no text) on the right wall
        const fl = PX.blink(t, 2.7, 0.94) ? 1 : 0.35;
        PX.alpha(g, fl, () => { for (let i = 0; i < 46; i++) { const yy = 92 + Math.round(Math.sin(i * 0.4) * 6); R(g, 548 + i, yy, 1, 2, "#ff7ac0"); } thk(g, 572, 104, 566, 120, 2, "#5fe3e8"); thk(g, 566, 120, 576, 120, 2, "#5fe3e8"); thk(g, 576, 120, 568, 138, 2, "#5fe3e8"); });
        PX.glow(g, 572, 112, 60, "rgba(242,92,168,0.5)", fl); PX.glow(g, 572, 124, 30, "rgba(95,227,232,0.5)", fl);
      });
      // ceiling neon strips
      R(g, 0, 6, 640, 2, "#ff7ac0"); PX.glow(g, 160, 8, 160, "rgba(242,92,168,0.4)", 1); PX.glow(g, 480, 8, 160, "rgba(242,92,168,0.4)", 1);
      R(g, 632, 0, 2, 280, "#5fe3e8"); PX.glow(g, 633, 140, 120, "rgba(95,227,232,0.35)", 1);
      // ---- wall screen ----
      const SX = 150, SY = 30, SW = 330, SH = 178;
      PX.glow(g, 315, 120, 230, "rgba(140,90,255,0.32)", 1);
      R(g, SX - 6, SY - 6, SW + 12, SH + 12, "#14121e"); R(g, SX - 6, SY - 6, SW + 12, 1, "#4a4466"); R(g, SX - 6, SY + SH + 5, SW + 12, 1, "#08060e");
      R(g, SX, SY, SW, SH, "#0d1018");
      // diffs column flying up
      const DX = SX + 10, DW = 196, sc = t * 70 + Math.max(0, t - 2) * 25 * (t - 2) * 0.3;
      g.save(); g.beginPath(); g.rect(SX, SY, SW, SH); g.clip();
      const CH = 44;
      const i0 = Math.floor(sc / CH);
      for (let j = 0; j < 6; j++) {
        const i = i0 + j, y = Math.round(SY + 6 + j * CH - (sc - i0 * CH)), card = CARDS[i % CARDS.length];
        PX.alpha(g, 0.25 + 0.75 * fade, () => {
          R(g, DX, y, DW, CH - 6, "#141a26"); R(g, DX, y, DW, 8, "#1e2636"); R(g, DX + 4, y + 3, 40 + (i * 13) % 30, 2, "#8b949e");
          if (fade > 0.02) PX.alpha(g, fade, () => card.forEach(([s, w], L) => { const ly = y + 10 + L * 7; if (ly > y + CH - 12) return; R(g, DX + 1, ly, DW - 2, 6, s > 0 ? "#12301e" : "#3a1618"); R(g, DX + 4, ly + 2, 3, 1, s > 0 ? "#3df56b" : "#ff5c5c"); if (s > 0) R(g, DX + 5, ly + 1, 1, 3, "#3df56b"); R(g, DX + 12, ly + 2, Math.round((DW - 24) * w), 2, s > 0 ? "#7ce89a" : "#ff9a9a"); }));
        });
        // UNREAD stamps
        if (t >= UNR) {
          const age = t - UNR - j * 0.07, k = cl(age / 0.16, 0, 1);
          if (age >= 0) PX.alpha(g, k * (0.4 + 0.6 * fade), () => { const sx = DX + DW - 82, sy = y + 12 - Math.round((1 - k) * 6); PX.box(g, sx, sy, 72, 18, "#ff4d4d"); PX.box(g, sx + 1, sy + 1, 70, 16, "#ff4d4d"); R(g, sx + 2, sy + 2, 68, 14, "rgba(255,60,60,.18)"); TX(g, "UNREAD", sx + 36, sy + 5, { size: 8, col: "#ff6a6a", align: "center" }); });
        }
      }
      g.restore();
      // right side: counter + big button
      const BX = SX + 216, BW2 = 106;
      OT(g, "ACCEPTED:", BX + BW2 / 2, SY + 30, { font: "v", size: 16, col: "#c9d1d9", align: "center" });
      const pop = pressed ? 2 : 0;
      OT(g, String(n), BX + BW2 / 2, SY + 50 - pop, { size: 16, col: n >= 48 ? "#f7c948" : "#3df56b", align: "center" });
      const by = SY + 96 + (pressed ? 2 : 0);
      PX.glow(g, BX + BW2 / 2, SY + 110, 70, "rgba(61,245,107,0.55)", pressed ? 1 : 0.6);
      R(g, BX + 4, SY + 100, BW2 - 8, 34, "#0e3a1c");
      R(g, BX + 4, by, BW2 - 8, 30, pressed ? "#2ac85a" : "#24b04a"); R(g, BX + 4, by, BW2 - 8, 2, "#8cffaa"); R(g, BX + 4, by + 28, BW2 - 8, 2, "#127a30");
      TX(g, "ACCEPT", BX + BW2 / 2, by + 6, { size: 8, col: "#f0fff4", align: "center" }); TX(g, "ALL", BX + BW2 / 2, by + 17, { size: 8, col: "#f0fff4", align: "center" });
      if (pressed) for (let i = 0; i < 6; i++) { const a = i * 1.047; star4(g, Math.round(BX + BW2 / 2 + Math.cos(a) * 62), Math.round(by + 15 + Math.sin(a) * 26), 1, "#c8ffd8"); }
      // screen glare
      g.globalAlpha = 0.04; poly(g, [[SX + 30, SY], [SX + 90, SY], [SX + 20, SY + SH], [SX - 40 + 40, SY + SH]], "#ffffff"); g.globalAlpha = 1;
      // speakers (mid)
      PX.par(g, c, 0.85, () => {
        for (const sx of [110, 500]) { bx3(g, sx, 140, 28, 70, "#1c1a28", "#3a3650", "#0c0a14"); PX.circle(g, sx + 14, 162, 8, "#0c0a14"); PX.circle(g, sx + 14, 162, 5 + (Math.sin(t * 12) > 0.3 ? 1 : 0), "#2a2640"); PX.circle(g, sx + 14, 190, 5, "#0c0a14"); R(g, sx + 4, 144, 2, 2, PX.blink(t, 0.4) ? "#f25ca8" : "#5a2040"); }
      });
      // ---- floor ----
      R(g, 0, 262, 640, 98, "#150f22"); R(g, 0, 262, 640, 2, "#2a1e40");
      for (let y = 270; y < 360; y += 10) R(g, 0, y, 640, 1, "#110c1c");
      ell(g, 300, 322, 230, 30, "#24163a"); ell(g, 300, 322, 220, 27, "#2e1c48"); for (let i = 0; i < 18; i++) R(g, 100 + i * 22, 322, 8, 1, "#4a2e6a");
      PX.glow(g, 315, 280, 220, "rgba(140,90,255,0.18)", 1);
      // floor clutter: energy cans + pizza box
      poly(g, [[392, 318], [470, 318], [478, 330], [384, 330]], "#c8a070"); R(g, 384, 330, 94, 3, "#8a6a40"); R(g, 392, 318, 78, 1, "#e8c090"); R(g, 410, 322, 40, 2, "#a88050");
      poly(g, [[470, 318], [492, 296], [500, 300], [478, 322]], "#b89060"); R(g, 486, 304, 3, 3, "#d84a3a"); R(g, 482, 309, 2, 2, "#f7c948");
      for (let i = 0; i < 5; i++) { const cx = 504 + i * 11 - (i === 4 ? 6 : 0), cy = i === 4 ? 326 : 310, lay = i === 4; if (lay) { bx3(g, cx, cy, 16, 8, "#5fe3e8", "#bff8fa", "#2a8a90"); R(g, cx + 5, cy + 1, 4, 6, "#1a2a3a"); } else { bx3(g, cx, cy, 9, 18, "#5fe3e8", "#bff8fa", "#2a8a90"); R(g, cx + 1, cy + 6, 7, 4, "#1a2a3a"); R(g, cx + 2, cy - 1, 5, 1, "#8aa0b0"); } }
      PX.glow(g, 530, 316, 40, "rgba(95,227,232,0.25)", 1);
      // ---- beanbag + dev (sunk in, legs sprawled toward camera) ----
      const DXp = 250, HIP = 290, DH = 96;
      shadow(g, DXp, 340, 96, 0.5);
      const G = geo(DH, HIP, true), talk = t < FORG + 0.4 && Math.sin(t * 13) + Math.sin(t * 7.1) > 0.3;
      const glass = PX.ease(cl((t - FORG - 0.2) / 0.45, 0, 1), "back"), gest = Math.round(Math.sin(t * 3.1) * 5);
      const behind = { al: [[-22, -17], [-4, -30]], ar: [[22, -17], [4, -30]] };
      const arms = t < FORG ? { hands: { l: [DXp - 34, G.ty + 2 + gest] }, ar: behind.ar } : behind;
      const BB = ["#7a4ab0", "#5a2e86", "#3a1c5a", "#24103a"];
      const P = LB().outlined(g, (b) => {
        // back of the beanbag rising behind him
        ell(b, DXp, HIP - 20, 76, 52, BB[2]); ell(b, DXp - 4, HIP - 24, 70, 47, BB[1]); ell(b, DXp - 22, HIP - 46, 34, 20, BB[0]);
        for (let a = 3.5; a < 4.9; a += 0.03) R(b, DXp - 4 + Math.cos(a) * 69, HIP - 24 + Math.sin(a) * 46, 2, 1, "#c08ae8");
        thk(b, DXp + 30, HIP - 66, DXp + 46, HIP - 20, 1, BB[2]);
        const P2 = LB().person(b, DXp, HIP, { ...DEV, h: DH, seated: true, noLegs: true, face: t > FORG + 0.4 ? "smug" : "happy", look: 1, ...arms, lit: 1, outline: false });
        if (talk) mouthOpen(b, P2);
        const hx = P2.hx, hw = P2.hw;   // headset: band, ear cups, mic boom
        R(b, hx - hw / 2 - 1, P2.hy - 3, hw + 2, 2, "#2a2c3a"); R(b, hx - hw / 2 - 1, P2.hy - 3, hw + 2, 1, "#5a5e78");
        R(b, hx - hw / 2 - 4, P2.hy + 8, 5, 9, "#33364a"); R(b, hx + hw / 2 - 1, P2.hy + 8, 5, 9, "#33364a"); R(b, hx + hw / 2 + 1, P2.hy + 11, 2, 2, "#f25ca8");
        thk(b, hx + hw / 2, P2.hy + 16, hx + 5, P2.hy + Math.round(P2.hh * 0.82), 1, "#2a2c3a"); R(b, hx + 3, P2.hy + Math.round(P2.hh * 0.8), 4, 3, "#4a4e62");
        if (glass > 0) shades(b, P2, glass);
        // front lip of the beanbag swallowing his hips
        ell(b, DXp, HIP + 8, 84, 22, BB[2]); ell(b, DXp - 2, HIP + 5, 80, 19, BB[1]); ell(b, DXp - 30, HIP, 30, 8, BB[0]); R(b, DXp - 50, HIP - 4, 26, 1, "#c08ae8");
        // legs sprawled forward and apart
        const pa = ["#3e4462", "#2c3048", "#1c2034"], sway = Math.round(Math.sin(t * 1.5) * 1);
        for (const s of [-1, 1]) {
          const k0 = [DXp + s * 8, HIP], kn = [DXp + s * 26, HIP + 14], ft = [DXp + s * (36 + (s > 0 ? sway : 0)), HIP + 44];
          thk(b, k0[0], k0[1], kn[0], kn[1], 12, pa[2]); thk(b, k0[0], k0[1] - 1, kn[0], kn[1] - 1, 10, pa[1]); thk(b, k0[0] - s, k0[1] - 3, kn[0] - s, kn[1] - 4, 3, pa[0]);
          thk(b, kn[0], kn[1], ft[0], ft[1] - 6, 10, pa[2]); thk(b, kn[0] - s, kn[1], ft[0] - s, ft[1] - 6, 7, pa[1]); R(b, kn[0] - 4, kn[1] - 4, 8, 3, pa[0]);
          ell(b, ft[0], ft[1] - 2, 8, 5, "#e8e8f0"); ell(b, ft[0], ft[1] - 4, 7, 3, "#ffffff"); R(b, ft[0] - 7, ft[1] + 1, 15, 2, "#9a9ab0"); R(b, ft[0] - 3, ft[1] - 5, 6, 1, "#3df56b");
        }
        return P2;
      });
      // voice waves toward the screen while talking
      if (t < FORG + 0.4) for (let i = 0; i < 3; i++) { const k = frac(t * 1.6 + i / 3); PX.alpha(g, (1 - k) * 0.8, () => { const r = 8 + k * 34; for (let a = -1.1; a < 0.1; a += 0.1) R(g, P.hx + 12 + Math.cos(a) * r, P.hy + 22 + Math.sin(a) * r, 1, 1, "#5fe3e8"); }); }
      if (glass >= 1 && t - FORG < 1.8) { const k = frac((t - FORG) * 1.1); if (k < 0.4) star4(g, P.hx + 7, P.ey, 3, "#ffffff"); }
      // foreground: floor lamp silhouette + plant (par)
      PX.par(g, c, 1.18, () => {
        R(g, 596, 120, 3, 240, "#0a0812"); ell(g, 597, 116, 18, 8, "#120e1c"); PX.glow(g, 597, 124, 70, "rgba(242,92,168,0.3)", 1);
        for (let i = 0; i < 8; i++) thk(g, 20, 362, 6 + i * 6 + Math.sin(t + i) * 2, 300 + (i % 3) * 12, 3, "#08060e");
      });
      PX.particles(g, 31, 22, t, [100, 40, 440, 200], { vy: -2, vx: 1, col: "#e0c8ff", a: 0.5 });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= viral =======================
  // night street, billboards light up "#VIBECODING" one after another, a crowd of tiny people's phones light up,
  // a trending tower climbs with up-arrows, hearts rise. o.at (0.3) first billboard, o.gap (0.5) between billboards
  K.viral = (o) => {
    const RN = PX.rnd(51), PCOL = ["#c05a4a", "#3a8ac0", "#c0a03a", "#3aa86a", "#8a5ac0", "#d07a3a", "#5a6a9a", "#c04a7a"];
    const SKIN = ["#f0c8a0", "#d8a070", "#a8704a", "#7a4a2c"], HAIR = ["#1a1418", "#4a2a1a", "#c8a050", "#2a2a3a", "#7a3a2a"];
    const crowd = [];
    for (let row = 0; row < 3; row++) for (let i = 0; i < 12 - row; i++) crowd.push({ x: 30 + i * (580 / (12 - row)) + RN() * 22 + row * 14, y: 290 + row * 22 + Math.round(RN() * 4), h: 20 + row * 4 + Math.floor(RN() * 3), c: PCOL[Math.floor(RN() * 8)], s: SKIN[Math.floor(RN() * 4)], hr: HAIR[Math.floor(RN() * 5)], on: 0.2 + RN() * 3.0, ph: RN() * 6, pc: RN() < 0.5 ? "#f25ca8" : "#5fe3e8" });
    crowd.sort((a, b) => a.y - b.y);
    const tiny = (g, p, t) => {
      const lit = t >= p.on, h = p.h, x = Math.round(p.x), y = p.y, bob = Math.round(Math.sin(t * 3 + p.ph) * 0.6);
      const hd = Math.round(h * 0.28), bw = Math.round(h * 0.38), bh = Math.round(h * 0.38);
      shadow(g, x, y, Math.round(bw * 0.8), 0.4);
      R(g, x - Math.round(bw / 2) + 1, y - Math.round(h * 0.3), 2, Math.round(h * 0.3), "#1e2234"); R(g, x + Math.round(bw / 2) - 3, y - Math.round(h * 0.3), 2, Math.round(h * 0.3), "#1e2234");
      const ty = y - Math.round(h * 0.3) - bh + bob;
      R(g, x - Math.round(bw / 2), ty, bw, bh, p.c); R(g, x - Math.round(bw / 2), ty, 1, bh, sh(p.c, 1.25)); R(g, x + Math.round(bw / 2) - 1, ty, 1, bh, sh(p.c, 0.65));
      const hy = ty - hd - 1;
      R(g, x - Math.round(hd / 2), hy, hd, hd, p.s); R(g, x - Math.round(hd / 2), hy - 1, hd, 2, p.hr); R(g, x - Math.round(hd / 2), hy, 1, Math.round(hd / 2), p.hr);
      // arms holding phone at the chest
      R(g, x - 2, ty + 2, 4, 2, sh(p.c, 0.8)); R(g, x - 1, ty + 1, 3, 4, "#14161e");
      R(g, x, ty + 2, 1, 2, lit ? p.pc : "#2a2e3e");
      R(g, x - 1, hy + Math.round(hd * 0.6), 1, 1, "#1a1016"); R(g, x + 1, hy + Math.round(hd * 0.6), 1, 1, "#1a1016");
      if (lit) { PX.glow(g, x, ty + 2, 10, p.pc === "#f25ca8" ? "rgba(242,92,168,0.8)" : "rgba(95,227,232,0.8)", 0.7); const k = cl((t - p.on) / 0.25, 0, 1); if (k < 1) star4(g, x, hy - 4, 1, "#ffffff"); }
    };
    const BLD = [[-6, 140, 150], [150, 112, 176], [332, 150, 150], [488, 124, 160]];
    const BB = [[12, 72, 118, 46], [172, 38, 136, 52], [344, 84, 124, 46], [492, 54, 128, 48]];
    return (g, t, d, c) => {
      const AT = T(o, "at", 0.3, d, 4), GAP = T(o, "gap", 0.5, d, 4);
      // ---- sky + far skyline ----
      PX.par(g, c, 0.25, () => {
        if (CORE().skyline) CORE().skyline(g, -30, -10, 700, 200, t, 31); else PX.vgrad(g, -30, -10, 700, 200, "1a1f4a", "3b2a5c", 6);
      });
      // ---- mid buildings with rooftop billboards ----
      PX.par(g, c, 0.6, () => {
        for (const [x, y, w] of BLD) {
          R(g, x, y, w, 260, "#141930"); R(g, x, y, 2, 260, "#262e52"); R(g, x + w - 3, y, 3, 260, "#0b0e1e"); R(g, x - 2, y - 3, w + 4, 3, "#1e2440"); R(g, x - 2, y - 3, w + 4, 1, "#3a4468");
          for (let wy = y + 8, r = 0; wy < 250; wy += 10, r++) for (let wx = x + 6, q = 0; wx < x + w - 8; wx += 9, q++) {
            const hsh = (q * 7 + r * 13 + x * 3) % 19, col = hsh < 3 ? "#f7c948" : hsh === 3 ? "#7ab8e8" : null;
            R(g, wx, wy, 5, 6, "#1a2040");
            if (col) { const fl = Math.sin(t * 0.9 + q + r * 3) > -0.85; R(g, wx, wy, 5, 6, fl ? sh(col, 0.62) : sh(col, 0.3)); R(g, wx, wy, 5, 1, sh(col, 0.8)); }
          }
        }
        // roof props
        R(g, 96, 128, 14, 12, "#1a1e34"); R(g, 94, 126, 18, 3, "#262c48"); R(g, 300, 98, 2, 16, "#2a3050"); R(g, 299, 96, 4, 2, PX.blink(t, 1.1) ? "#ff5c5c" : "#5a2020");
        BB.forEach(([x, y, w, h], i) => {
          const on = AT + i * GAP, k = t - on;
          for (const lx of [x + 12, x + w - 15]) { R(g, lx, y + h, 3, BLD[i][1] - y - h, "#20253e"); R(g, lx, y + h, 1, BLD[i][1] - y - h, "#353c5e"); }
          thk(g, x + 13, y + h + 2, x + w - 14, BLD[i][1] - 2, 1, "#20253e"); thk(g, x + w - 14, y + h + 2, x + 13, BLD[i][1] - 2, 1, "#20253e");
          R(g, x - 4, y - 4, w + 8, h + 8, "#232640"); R(g, x - 4, y - 4, w + 8, 1, "#4a5070"); R(g, x - 4, y + h + 3, w + 8, 1, "#10121e");
          R(g, x, y, w, h, "#10142a");
          if (k < 0) { // old dull ad: generic shapes
            R(g, x + 8, y + 8, w * 0.36, h - 16, "#232444"); R(g, x + w * 0.52, y + 12, w * 0.38, 4, "#2e3050"); R(g, x + w * 0.52, y + 20, w * 0.26, 3, "#282a48");
          } else {
            const glitch = k < 0.2 && Math.floor(t * 40) % 2 === 0;
            const bg = i % 2 ? ["2a0a34", "50165a"] : ["0a1e38", "12385a"];
            PX.vgrad(g, x, y, w, h, bg[0], bg[1], 5);
            for (let s = 0; s < h; s += 3) R(g, x, y + s, w, 1, "rgba(0,0,0,.2)");
            const col = i % 2 ? "#ff9ad0" : "#8ff4f8";
            if (!glitch) OT(g, "#VIBECODING", x + w / 2 + (k < 0.3 ? Math.round((0.3 - k) * 40) : 0), y + h / 2 - 10, { font: "v", size: 20, col, align: "center", outline: i % 2 ? "#3a0a3a" : "#06203a" });
            else { R(g, x, y + h / 2 - 3, w, 5, col); R(g, x + 10, y + h / 2 + 6, w - 30, 2, col); }
            R(g, x + 8, y + h - 7, w - 16, 1, rgba(col, 0.5));
            PX.glow(g, x + w / 2, y + h / 2, w * 0.75, i % 2 ? "rgba(242,92,168,0.45)" : "rgba(95,227,232,0.45)", cl(k / 0.2, 0, 1));
            if (k < 0.35) PX.alpha(g, (1 - k / 0.35) * 0.7, () => R(g, x, y, w, h, col));
          }
          for (let s = 0; s < 3; s++) { const lx = x + 12 + s * ((w - 24) / 2); R(g, lx - 2, y - 9, 5, 3, "#3a3f4b"); R(g, lx - 1, y - 6, 3, 1, k >= 0 ? "#fff2c8" : "#4a4a40"); }
        });
      });
      // trending tower screen (right, mid-near)
      PX.par(g, c, 0.8, () => {
        const x = 566, y = 128, w = 64, h = 112;
        R(g, x - 3, y - 3, w + 6, h + 140, "#1a1e34"); R(g, x - 3, y - 3, w + 6, 1, "#4a5274");
        R(g, x, y, w, h, "#0c1222");
        TX(g, "TREND", x + w / 2, y + 4, { size: 8, col: "#f7c948", align: "center" });
        const k = cl((t - AT) / (d - AT - 0.3), 0, 1), pts = [];
        for (let i = 0; i <= 12; i++) { const u = i / 12, v = u <= k ? Math.pow(u, 2.2) : null; if (v !== null) pts.push([x + 6 + u * (w - 12), y + h - 10 - v * (h - 34)]); }
        for (let i = 1; i < pts.length; i++) thk(g, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], 2, "#3df56b");
        if (pts.length) { const [px, py] = pts[pts.length - 1]; PX.glow(g, px, py, 14, "rgba(61,245,107,0.8)", 1); }
        for (let i = 0; i < 3; i++) { const kk = frac(t * 1.4 + i / 3); PX.alpha(g, 1 - kk, () => PX.sprite(g, ["..#..", ".###.", "#####", "..#..", "..#.."], x + 8 + i * 20, y + h - 18 - kk * 50, { "#": "#3df56b" })); }
      });
      // ---- street ----
      R(g, 0, 250, 640, 22, "#22263c"); R(g, 0, 250, 640, 1, "#3a4060"); for (let x = 0; x < 640; x += 32) R(g, x, 250, 1, 22, "#1a1e30");
      R(g, 0, 272, 640, 88, "#161a2a"); R(g, 0, 272, 640, 2, "#0e1120");
      for (let y = 284, k = 0; y < 360; y += 10 + k * 2, k++) R(g, 0, y, 640, 1, "#1e2236");
      // wet plaza: rippling reflections of the lit billboards
      BB.forEach(([x, , w], i) => { if (t < AT + i * GAP) return; const col = i % 2 ? "#f25ca8" : "#5fe3e8";
        for (let y = 0; y < 70; y += 2) { const off = Math.round(Math.sin(y * 0.45 + t * 4 + i) * 3); g.globalAlpha = 0.24 * (1 - y / 70); R(g, x + 10 + off, 276 + y, w - 20, 1, col); } g.globalAlpha = 1; });
      // street lamps
      for (const lx of [150, 420]) { R(g, lx, 168, 3, 84, "#2a2e44"); R(g, lx, 168, 1, 84, "#4a5070"); R(g, lx - 8, 166, 12, 3, "#2a2e44"); R(g, lx - 7, 169, 8, 2, "#ffd28a"); PX.glow(g, lx - 3, 172, 60, "rgba(255,200,120,0.5)", 1); }
      // ---- crowd ----
      for (const p of crowd) tiny(g, p, t);
      // hearts rising from lit phones
      crowd.forEach((p, i) => { if (t < p.on) return; for (let j = 0; j < 2; j++) { const k = frac((t - p.on) * 0.7 + j * 0.5); if ((t - p.on) * 0.7 + j * 0.5 < 0.0) continue; PX.alpha(g, (1 - k) * Math.min(1, k * 6), () => heart(g, Math.round(p.x - 2 + Math.sin(k * 6 + i) * 4), Math.round(p.y - p.h - 6 - k * 60), j % 2 ? "#f25ca8" : "#ff7ab8")); } });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= shower =======================
  // cartoon bathroom: a tall thin figure with short dark hair above the curtain; a "VIBE CODING" thought bubble
  // floats up and pops like a soap bubble at o.pop (1.8)
  K.shower = (o) => {
    return (g, t, d, c) => {
      const POP = T(o, "pop", 1.8, d, 3);
      // ---- tiled wall ----
      PX.vgrad(g, 0, 0, 640, 360, "2a4a62", "1a2c40", 10);
      for (let y = 0; y < 360; y += 16) { R(g, 0, y, 640, 1, "#14243a"); R(g, 0, y + 1, 640, 1, "#3a5c76"); }
      for (let y = 0, r = 0; y < 360; y += 16, r++) for (let x = (r % 2) * 8; x < 640; x += 16) R(g, x, y, 1, 16, "#14243a");
      // drops on tiles
      for (let i = 0; i < 30; i++) { const x = (i * 83) % 640, y = (i * 47) % 300 + frac(t * 0.08 + i * 0.37) * 30; R(g, x, y, 1, 2, "#8ab8d8"); R(g, x, y, 1, 1, "#d8f0ff"); }
      // far: small window + shelf + mirror (par)
      PX.par(g, c, 0.5, () => {
        R(g, 40, 40, 74, 60, "#1e2c40"); PX.vgrad(g, 44, 44, 66, 52, "0e1430", "2a2a5a", 5); PX.circle(g, 92, 60, 7, "#e8e8d0"); PX.circle(g, 95, 58, 6, "#1a2048");
        for (let i = 0; i < 8; i++) R(g, 48 + i * 8, 48 + (i * 13) % 30, 1, 1, "#e8ecff");
        R(g, 76, 44, 2, 52, "#1e2c40"); R(g, 36, 100, 82, 4, "#c8d8e0"); R(g, 36, 100, 82, 1, "#ffffff");
        g.globalAlpha = 0.35; R(g, 44, 70, 66, 26, "#c8d8f0"); g.globalAlpha = 1;  // fogged lower glass
        // mirror (right), fogged
        R(g, 518, 48, 88, 104, "#9aa4b2"); R(g, 518, 48, 88, 1, "#e0e6ee"); R(g, 605, 48, 1, 104, "#5a6474");
        PX.vgrad(g, 522, 52, 80, 96, "3a5a74", "24405a", 5); g.globalAlpha = 0.45; R(g, 522, 52, 80, 96, "#b8cce0"); g.globalAlpha = 1;
        PX.circle(g, 562, 96, 16, "#3a5a74"); PX.circle(g, 562, 96, 13, "#4e6e88"); R(g, 556, 90, 3, 3, "#3a5a74"); R(g, 566, 90, 3, 3, "#3a5a74");
        for (let a = 0.5; a < 2.65; a += 0.15) R(g, 562 + Math.cos(a) * 7, 97 + Math.sin(a) * 6, 2, 2, "#3a5a74");
        for (let i = 0; i < 4; i++) R(g, 548 + i * 9, 113 + (i % 2) * 3, 1, 6 + i, "#5a7a94");
        // shelf with bottles + plant
        R(g, 516, 170, 92, 4, "#c8d8e0"); R(g, 516, 170, 92, 1, "#ffffff");
        [["#f25ca8", 10], ["#f7c948", 14], ["#5fe3e8", 8]].forEach(([col, h], i) => { bx3(g, 524 + i * 14, 170 - h, 9, h, col, sh(col, 1.3), sh(col, 0.65)); R(g, 526 + i * 14, 168 - h, 5, 2, "#e8e8e8"); });
        R(g, 572, 158, 16, 12, "#c86a3a"); R(g, 572, 158, 16, 2, "#e08a5a");
        for (let i = 0; i < 7; i++) { const sw = Math.round(Math.sin(t * 1.4 + i) * 1); thk(g, 580, 158, 566 + i * 5 + sw, 132 + (i % 3) * 7, 2, i % 2 ? "#3a8a5a" : "#5ab07a"); }
      });
      // towel rail (left, mid)
      PX.par(g, c, 0.8, () => {
        R(g, 30, 190, 90, 3, "#c8ccd8"); R(g, 30, 190, 90, 1, "#ffffff");
        R(g, 44, 192, 54, 70, "#e86a8a"); R(g, 44, 192, 54, 3, "#ff9ab0"); for (let y = 200; y < 262; y += 8) R(g, 44, y, 54, 1, "#c84a6a"); R(g, 96, 192, 2, 70, "#b04a66");
        R(g, 44, 246, 54, 4, "#ffffff"); R(g, 44, 250, 54, 2, "#f0c0d0");
      });
      // ceiling lamp glow
      PX.glow(g, 320, 0, 260, "rgba(255,200,140,0.3)", 1);
      R(g, 300, 0, 40, 6, "#8a8e9a"); R(g, 300, 5, 40, 1, "#c8ccd8"); R(g, 304, 6, 32, 3, "#ffe0a0"); PX.glow(g, 320, 8, 40, "rgba(255,220,160,0.6)", 1);
      // ---- shower: head, water ----
      const CT = 176; // curtain top (rod)
      R(g, 226, 50, 4, 40, "#9aa4b2"); R(g, 226, 50, 1, 40, "#d8e0ea"); R(g, 226, 48, 30, 4, "#9aa4b2"); R(g, 226, 48, 30, 1, "#d8e0ea");
      poly(g, [[246, 52], [264, 52], [270, 62], [240, 62]], "#b8c2d0"); R(g, 240, 61, 30, 2, "#6a7484"); R(g, 247, 53, 12, 1, "#e8eef4");
      for (let i = 0; i < 10; i++) { const sx = 242 + i * 3; for (let y = 64; y < CT; y += 5) { const yy = y + Math.floor(frac(t * 4 + i * 0.13) * 5); g.globalAlpha = 0.45; R(g, sx + (yy - 64) * 0.18 * ((i - 4.5) / 4.5), yy, 1, 3, "#a8d8f4"); } g.globalAlpha = 1; }
      // ---- the figure (behind the curtain) ----
      const happy = t > POP + 0.5;
      const P = LB().outlined(g, (b) => {
        const P2 = LB().person(b, 330, 232, { h: 112, shirt: "#e0b088", skin: "#e0b088", hair: "#1e1612", hairStyle: "short", top: "none", outline: false,
          face: t < POP ? "closed" : t < POP + 0.5 ? "shock" : "happy", al: [-6, 30], ar: [6, 30], lit: -1 });
        // wet hair spikes + shampoo foam
        for (let i = 0; i < 5; i++) PX.circle(b, P2.hx - 10 + i * 5, P2.hy - 1 - (i % 2) * 2, 3, "#f4f8ff");
        R(b, P2.hx - 9, P2.hy - 3, 4, 1, "#ffffff");
        return P2;
      });
      // foam bubbles drifting from the hair
      for (let i = 0; i < 5; i++) { const k = frac(t * 0.5 + i / 5); PX.alpha(g, (1 - k) * 0.8, () => { PX.box(g, P.hx - 14 + i * 7 + Math.sin(k * 5 + i) * 3, P.hy - 6 - k * 26, 3, 3, "#e8f4ff"); }); }
      // ---- curtain rod + curtain ----
      R(g, 150, CT - 4, 340, 3, "#c8ccd8"); R(g, 150, CT - 4, 340, 1, "#ffffff"); R(g, 146, CT - 6, 6, 7, "#8a94a2"); R(g, 488, CT - 6, 6, 7, "#8a94a2");
      for (let x = 160; x < 480; x++) {
        const fold = Math.sin(x * 0.19 + Math.sin(t * 1.3) * 0.6), col = fold > 0.45 ? "#457e9c" : fold < -0.45 ? "#1e4660" : "#30607e";
        const sway = Math.round(Math.sin(t * 1.3 + x * 0.02) * 1);
        R(g, x + sway, CT, 1, 360 - CT, col);
      }
      for (let x = 162; x < 480; x += 22) { PX.box(g, x, CT - 6, 5, 6, "#d8dce4"); }
      // curtain print: little fish
      for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { const fx = 176 + i * 52 + (r % 2) * 26, fy = CT + 26 + r * 44; ell(g, fx + 4, fy + 2, 5, 3, "#e8b040"); poly(g, [[fx - 1, fy + 2], [fx - 5, fy - 1], [fx - 5, fy + 5]], "#c88a2a"); R(g, fx + 2, fy, 4, 1, "#ffd870"); R(g, fx + 6, fy + 1, 1, 1, "#1a1016"); }
      R(g, 160, CT, 320, 2, "#7ab8d0"); PX.glow(g, 330, CT + 40, 140, "rgba(255,210,150,0.12)", 1);
      // ---- thought bubble ----
      const rise = cl(t / POP, 0, 1), bx = P.hx + 46 + Math.sin(t * 2.2) * 5, by = Math.round(lerp(150, 70, PX.ease(rise, "out")));
      // trail bubbles
      for (let i = 0; i < 3; i++) { const k = cl(t * 2 - i * 0.3, 0, 1); if (k > 0 && t < POP + 0.1) PX.alpha(g, 0.85, () => { const tx = P.hx + 14 + i * 10, ty = P.hy - 2 - i * 10; PX.box(g, tx, ty, 3 + i * 2, 3 + i * 2, "#c8e8ff"); R(g, tx + 1, ty + 1, 1, 1, "#ffffff"); }); }
      if (t < POP) {
        const r = Math.round(36 * PX.ease(cl(t / 0.5, 0, 1), "back")) + Math.round(Math.sin(t * 5) * 1), wob = Math.round(Math.sin(t * 7) * 1);
        PX.alpha(g, 0.22, () => PX.circle(g, bx, by, r, "#c8e0ff"));
        for (let a = 0; a < 6.283; a += 0.025) { const hue = Math.round((a * 57 + t * 120) % 360); g.fillStyle = `hsl(${hue},85%,72%)`; g.fillRect(Math.round(bx + Math.cos(a) * (r + wob * Math.cos(a * 2))), Math.round(by + Math.sin(a) * (r - wob * Math.cos(a * 2))), 2, 1); }
        for (let a = 3.6; a < 4.6; a += 0.04) R(g, bx + Math.cos(a) * (r - 6), by + Math.sin(a) * (r - 6), 2, 2, "#ffffff");
        PX.glow(g, bx, by, r + 14, "rgba(160,220,255,0.35)", 1);
        if (r > 30) OT(g, "VIBE", bx, by - 12, { size: 8, col: "#ffffff", align: "center", outline: "#2a3a6a" });
        if (r > 30) OT(g, "CODING", bx, by + 2, { size: 8, col: "#f7c948", align: "center", outline: "#2a3a6a" });
      } else {
        const k = (t - POP) / 0.5;
        if (k < 1) {
          const ring = 38 + k * 26;
          PX.alpha(g, 1 - k, () => { for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.283; R(g, bx + Math.cos(a) * ring, by + Math.sin(a) * ring + k * k * 20, 2, 2, i % 2 ? "#c8e8ff" : "#ffffff"); star4(g, Math.round(bx + Math.cos(a + 0.2) * ring * 0.6), Math.round(by + Math.sin(a + 0.2) * ring * 0.6), 1, "#e8f8ff"); } });
          if (k < 0.25) PX.alpha(g, 1 - k * 4, () => PX.circle(g, bx, by, 30, "#e8f8ff"));
        }
        // droplets falling after the pop
        for (let i = 0; i < 8; i++) { const kk = (t - POP) * 1.4 - i * 0.05; if (kk < 0 || kk > 1) continue; R(g, bx - 30 + i * 9, by + kk * kk * 120, 1, 3, "#c8e8ff"); }
      }
      // ---- steam ----
      steam(g, 320, 210, t, 10, "#e8f0ff", 180, 0.17);
      steam(g, 250, 200, t + 1.3, 6, "#e8f0ff", 150, 0.14, 0.4);
      PX.particles(g, 61, 30, t, [140, 40, 360, 160], { vy: -8, vx: 1, col: "#e8f4ff", a: 0.45 });
      PX.vignette(g, 0.5);
    };
  };

  // ======================= toys_vs_career =======================
  // left: kid's playroom "WEEKEND TOYS"; at o.career (3.0) floodlights reveal the right half: a skyscraper made of the
  // same toy blocks on a construction site "CAREER PLAN"; it sways and a block falls at o.fall (career + 1.6)
  K.toys_vs_career = (o) => {
    const BC = ["#d84a3a", "#f0b83a", "#3a7ad8", "#3ab05a", "#d86ab0"];
    const brick = (g, x, y, w, h, col, studs) => {
      R(g, x, y, w, h, col); R(g, x, y, w, 1, sh(col, 1.35)); R(g, x, y, 1, h, sh(col, 1.2)); R(g, x, y + h - 1, w, 1, sh(col, 0.6)); R(g, x + w - 1, y, 1, h, sh(col, 0.7));
      if (studs) for (let s = 0; s < studs; s++) { const sx = x + 2 + Math.round((s + 0.5) * ((w - 4) / studs)) - 2; R(g, sx, y - 2, 4, 2, sh(col, 1.1)); R(g, sx, y - 2, 4, 1, sh(col, 1.4)); }
    };
    const robot = (g, x, y, t, col, ph) => { // toy robot ~26 px, feet at (x, y)
      const st = Math.round(Math.sin(t * 6 + ph)), arm = Math.round(Math.sin(t * 6 + ph) * 3);
      R(g, x - 5, y - 4, 4, 4, sh(col, 0.6)); R(g, x + 1, y - 4, 4, 4, sh(col, 0.6));
      bx3(g, x - 7, y - 16 + st, 14, 12, col, sh(col, 1.35), sh(col, 0.6)); R(g, x - 3, y - 12 + st, 6, 4, "#1a1a26"); R(g, x - 2, y - 11 + st, 1, 1, "#ff5c5c"); R(g, x + 1, y - 11 + st, 1, 1, "#3df56b");
      R(g, x - 10, y - 15 + st + arm, 3, 8, sh(col, 0.8)); R(g, x + 7, y - 15 + st - arm, 3, 8, sh(col, 0.8));
      bx3(g, x - 6, y - 26 + st, 12, 10, "#b8c0cc", "#e8eef4", "#6a7484"); R(g, x - 4, y - 23 + st, 2, 2, "#5fe3e8"); R(g, x + 2, y - 23 + st, 2, 2, "#5fe3e8"); R(g, x - 2, y - 19 + st, 4, 1, "#2a2e3a");
      R(g, x, y - 30 + st, 1, 4, "#6a7484"); R(g, x - 1, y - 32 + st, 3, 2, PX.blink(t + ph, 0.8) ? "#f25ca8" : "#7a2a5a");
      // wind-up key
      const kk = Math.round(Math.sin(t * 8 + ph) * 2); R(g, x + 7, y - 12 + st, 3, 1, "#c8a040"); R(g, x + 10, y - 13 + st - kk, 1, 3 + kk * 2 > 0 ? 3 : 1, "#f0c850");
    };
    return (g, t, d, c) => {
      const CAR = T(o, "career", 3.0, d, 6.5), FALL = o.fall !== undefined ? o.fall : CAR + 1.6 * d / 6.5;
      const lightK = t < CAR ? 0 : t < CAR + 0.3 ? (Math.floor((t - CAR) * 30) % 3 === 0 ? 0.2 : 0.85) : 1;
      const MID = 316;
      // ======== RIGHT: construction site (drawn first, left room overlaps the divider) ========
      PX.par(g, c, 0.25, () => {
        PX.vgrad(g, MID, -20, 360, 240, "080b1e", "1c2244", 8);
        for (let i = 0; i < 26; i++) R(g, MID + (i * 53) % 330, (i * 37) % 140, 1, 1, "#d8dcf0");
        PX.circle(g, 590, 44, 10, "#d8dac8"); PX.circle(g, 586, 41, 9, "#eef0e0");
        let bx = MID; const r = PX.rnd(17); while (bx < 680) { const w = 14 + r() * 20, h = 40 + r() * 70; R(g, bx, 220 - h, w, h, "#121630"); for (let wy = 224 - h; wy < 216; wy += 6) for (let wx = bx + 2; wx < bx + w - 2; wx += 4) if (r() < 0.25) R(g, wx, wy, 2, 2, "#5a5030"); bx += w + 2; }
      });
      // ground + fence
      R(g, MID, 220, 340, 140, "#1a1820"); R(g, MID, 220, 340, 2, "#2a2630");
      for (let i = 0; i < 40; i++) R(g, MID + (i * 71) % 330, 236 + (i * 29) % 110, 3, 1, "#24222c");
      PX.par(g, c, 0.7, () => { for (let x = MID + 4; x < 650; x += 30) { R(g, x, 196, 2, 30, "#3a3a46"); } R(g, MID, 200, 340, 2, "#3a3a46"); R(g, MID, 214, 340, 2, "#3a3a46"); for (let x = MID; x < 650; x += 8) R(g, x, 206, 4, 3, (x / 8) % 2 ? "#f7c948" : "#1a1a20"); });
      // scaffolding behind, left of the tower
      for (let y = 120; y < 302; y += 20) R(g, 384, y, 36, 2, "#4a4a58");
      R(g, 384, 120, 2, 182, "#5a5a68"); R(g, 418, 120, 2, 182, "#3a3a48"); for (let y = 120; y < 300; y += 20) thk(g, 385, y, 419, y + 20, 1, "#3a3a48");
      // tower of toy blocks: a skyscraper, sways more and more
      const TXc0 = 474, base = 304, N = 17, BH = 14, amp = 1.5 + 5 * cl((t - CAR) / 2.5, 0, 1), sway = Math.sin(t * 2.3) * amp, fallen = t >= FALL;
      for (let i = 0; i < N; i++) {
        if (i === N - 1 && fallen) continue;
        const u = i / (N - 1), dx = Math.round(sway * Math.pow(u, 1.7) * 3), w = 44 - (i % 2) * 6 - Math.floor(i / 5) * 3, y = base - (i + 1) * BH;
        brick(g, TXc0 - w / 2 + dx + (i % 3 === 1 ? 3 : i % 3 === 2 ? -2 : 0), y, w, BH, BC[(i * 2) % 5], 3);
        if (i % 4 === 2) for (let k = 0; k < 3; k++) R(g, TXc0 - w / 2 + dx + 6 + k * 11, y + 5, 5, 4, "#fff2c0");   // little lit windows
      }
      // crane hook dangling over the top
      { const hx = TXc0 + 30 + Math.round(Math.sin(t * 1.1) * 4), top = base - N * BH - 40; R(g, 380, 20, 260, 3, "#5a5060"); R(g, 380, 20, 260, 1, "#8a8090"); R(g, hx, 23, 1, top - 23, "#8a8a98"); R(g, hx - 3, top, 7, 4, "#c8a040"); R(g, hx + 2, top + 4, 2, 4, "#c8a040"); }
      // the falling block (top one) tumbles off to the right
      if (fallen) {
        const k = t - FALL, x0 = TXc0 + Math.round(sway * 3), y0 = base - N * BH, gy = 308, tl = Math.sqrt((gy - 8 - y0) / 360);
        const fy = Math.min(gy - 8, y0 - 20 * k + 360 * k * k), fx = x0 + 90 * Math.min(k, tl);
        const landed = k >= tl, ang = landed ? 0.35 : k * 8;
        const cx = fx, cy = fy, ca = Math.cos(ang), sa = Math.sin(ang), hw = 19, hh = 7, col = BC[((N - 1) * 2) % 5];
        const pts = [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(([px, py]) => [cx + px * ca - py * sa, cy + px * sa + py * ca]);
        poly(g, pts, sh(col, 0.75)); const inn = pts.map(([px, py]) => [cx + (px - cx) * 0.85, cy + (py - cy) * 0.7 - 1]); poly(g, inn, col);
        if (!landed) for (let i = 1; i < 4; i++) PX.alpha(g, 0.3 - i * 0.07, () => R(g, cx - 2 - i * 9, cy - 10 * i, 3, 3, "#ffffff"));
        if (landed) { const dk = cl((k - tl) / 0.7, 0, 1); for (let i = 0; i < 9; i++) PX.alpha(g, 1 - dk, () => PX.circle(g, cx - 18 + i * 4 + (i - 4) * dk * 10, gy - 2 - dk * 12 - (i % 2) * 3, 2 + Math.round(dk * 4), "#6a6070")); }
      }
      // hard hats, cones, briefcase
      const hat = (x, y, col) => { ell(g, x, y, 8, 6, col); R(g, x - 8, y, 17, 6, "#1a1820"); R(g, x - 10, y, 21, 2, sh(col, 0.75)); R(g, x - 4, y - 4, 3, 2, sh(col, 1.4)); };
      hat(370, 310, "#f7c948"); hat(392, 316, "#f0a030");
      for (const cx of [346, 600]) { poly(g, [[cx - 6, 312], [cx + 6, 312], [cx + 1, 292], [cx - 1, 292]], "#f08a3c"); R(g, cx - 4, 302, 8, 3, "#f0f0f0"); R(g, cx - 8, 312, 16, 2, "#c06a2a"); }
      bx3(g, 412, 302, 26, 18, "#6a4426", "#9a6a3e", "#3a2414"); R(g, 420, 298, 10, 4, "#3a2414"); R(g, 422, 299, 6, 2, "#1a1820"); R(g, 423, 309, 4, 3, "#c8a040");
      // sign CAREER PLAN
      R(g, 536, 250, 3, 60, "#4a3a2a"); R(g, 584, 250, 3, 60, "#4a3a2a"); bx3(g, 526, 228, 72, 32, "#cfc6aa", "#e8dfc4", "#8a8068");
      TX(g, "CAREER", 562, 234, { size: 8, col: "#2a2018", align: "center" }); TX(g, "PLAN", 562, 246, { size: 8, col: "#2a2018", align: "center" });
      // floodlights
      for (const [fx, fy] of [[352, 110], [612, 96]]) {
        R(g, fx, fy, 3, 200, "#2a2a36"); R(g, fx - 8, fy - 6, 18, 8, "#3a3a46"); R(g, fx - 7, fy + 1, 16, 2, lightK > 0.5 ? "#fff2c8" : "#4a4a40");
      }
      // darkness until the lights come on (the reveal)
      PX.alpha(g, 0.93 - lightK * 0.85, () => R(g, MID, 0, 340, 360, "#04050c"));
      if (lightK > 0) { PX.glow(g, 354, 114, 200, "rgba(255,230,170,0.35)", lightK); PX.glow(g, 614, 100, 200, "rgba(255,230,170,0.35)", lightK); PX.glow(g, 470, 240, 120, "rgba(255,210,150,0.2)", lightK); }
      // ======== LEFT: playroom ========
      g.save(); g.beginPath(); g.rect(0, 0, MID + 2, 360); g.clip();
      R(g, 0, 0, MID, 360, "#2e2240");
      PX.vgrad(g, 0, 0, MID, 240, "33264a", "241a36", 8);
      for (let y = 10; y < 230; y += 20) for (let x = 8 + (y % 40); x < MID - 4; x += 40) { R(g, x, y, 1, 3, "#4a3a66"); R(g, x - 1, y + 1, 3, 1, "#4a3a66"); }
      PX.par(g, c, 0.55, () => {
        R(g, 30, 46, 80, 70, "#4a3a5a"); PX.vgrad(g, 34, 50, 72, 62, "0e1430", "2a2a5a", 5); PX.circle(g, 88, 66, 6, "#eef0e0");
        for (let i = 0; i < 6; i++) R(g, 40 + i * 11, 56 + (i * 7) % 30, 1, 1, "#e8ecff"); R(g, 68, 50, 3, 62, "#4a3a5a"); R(g, 26, 114, 88, 4, "#5a4a6a");
        // bunting
        for (let i = 0; i < 9; i++) { const x = 130 + i * 18, y = 24 + Math.round(Math.sin(i / 8 * Math.PI) * 8); poly(g, [[x, y], [x + 12, y], [x + 6, y + 10]], BC[i % 5]); }
        R(g, 128, 23, 168, 1, "#c8c0d8");
      });
      // sign WEEKEND TOYS
      bx3(g, 140, 64, 116, 40, "#cdbb94", "#e6d6b0", "#8a7a5a"); R(g, 196, 56, 2, 8, "#8a7a60"); PX.circle(g, 197, 55, 2, "#d84a3a");
      TX(g, "WEEKEND", 198, 72, { size: 8, col: "#d84a3a", align: "center" }); TX(g, "TOYS", 198, 86, { size: 8, col: "#3a7ad8", align: "center" });
      // floor + play mat
      R(g, 0, 236, MID, 124, "#3a2a24"); R(g, 0, 236, MID, 2, "#5a4234");
      poly(g, [[30, 262], [290, 262], [312, 350], [6, 350]], "#24566e");
      for (let r = 0; r < 4; r++) for (let q = 0; q < 6; q++) { const y0 = 262 + r * 22, y1 = y0 + 22, l0 = lerp(30, 6, (y0 - 262) / 88), r0 = lerp(290, 312, (y0 - 262) / 88), l1 = lerp(30, 6, (y1 - 262) / 88), r1 = lerp(290, 312, (y1 - 262) / 88);
        if ((r + q) % 2) poly(g, [[l0 + (r0 - l0) * q / 6, y0], [l0 + (r0 - l0) * (q + 1) / 6, y0], [l1 + (r1 - l1) * (q + 1) / 6, y1], [l1 + (r1 - l1) * q / 6, y1]], ["#b8564a", "#c09a44", "#4a8a64", "#6270b0"][(r * 2 + q) % 4]); }
      // lamp on a nightstand (warm light)
      bx3(g, 250, 196, 40, 42, "#6a4a36", "#8a6a4e", "#3a2618"); R(g, 266, 172, 4, 24, "#c8b898"); poly(g, [[254, 172], [282, 172], [276, 152], [260, 152]], "#d89a5a"); poly(g, [[256, 171], [264, 171], [264, 153], [261, 153]], "#e8b878"); R(g, 254, 171, 28, 1, "#ffe0a0");
      PX.glow(g, 268, 168, 120, "rgba(255,200,120,0.38)", 1);
      // toy box with toys peeking out
      bx3(g, 34, 214, 64, 40, "#c85a3a", "#e88060", "#7a3020"); poly(g, [[34, 214], [98, 214], [106, 196], [42, 196]], "#a84a30"); R(g, 42, 196, 64, 1, "#e88060");
      R(g, 50, 206, 10, 8, "#3a7ad8"); PX.circle(g, 76, 208, 6, "#f0b83a"); R(g, 62, 200, 4, 14, "#3ab05a");
      for (let i = 0; i < 3; i++) R(g, 40 + i * 20, 230, 12, 2, "#e8a070");
      // scattered blocks
      brick(g, 120, 300, 22, 12, BC[0], 2); brick(g, 146, 306, 22, 12, BC[2], 2); brick(g, 132, 288, 22, 12, BC[1], 2); brick(g, 240, 318, 22, 12, BC[3], 2);
      // toy robots (one wind-up walker)
      robot(g, 90, 300, t, "#d84a3a", 0);
      const wx = 196 + Math.round(Math.sin(t * 0.9) * 22); robot(g, wx, 334, t, "#3a7ad8", 1.5);
      // paper plane loop
      { const a = t * 1.3, px = 160 + Math.cos(a) * 70, py = 150 + Math.sin(a * 2) * 18, dir = -Math.sin(a) >= 0 ? 1 : -1;
        poly(g, [[px - 9 * dir, py - 3], [px + 9 * dir, py], [px - 9 * dir, py + 3]], "#f0f0f8"); poly(g, [[px - 9 * dir, py], [px + 9 * dir, py], [px - 6 * dir, py + 4]], "#b8bcd0");
        for (let i = 1; i < 5; i++) { const aa = a - i * 0.12; PX.alpha(g, 0.3 - i * 0.05, () => R(g, 160 + Math.cos(aa) * 70, 150 + Math.sin(aa * 2) * 18, 2, 1, "#ffffff")); } }
      // divider wall edge
      R(g, MID - 2, 0, 6, 360, "#14101c"); R(g, MID - 2, 0, 1, 360, "#4a3a5a");
      PX.particles(g, 71, 18, t, [200, 120, 110, 110], { vy: -3, vx: 1, col: "#ffe2b0", a: 0.6 });
      g.restore();
      // divider wall edge
      R(g, MID - 2, 0, 6, 360, "#14101c"); R(g, MID - 2, 0, 1, 360, "#4a3a5a");
      PX.vignette(g, 0.5);
    };
  };

  // ======================= birthday_site =======================
  // party table: laptop with a goofy birthday website, balloons, cake, confetti; at o.vibe (4.0) the dev (party hat)
  // leans back with sunglasses and a neon "VIBE AWAY" sign lights up
  K.birthday_site = (o) => {
    const RN = PX.rnd(23), CONF = [...Array(70)].map(() => [RN() * 640, RN() * 360, RN(), Math.floor(RN() * 5)]);
    const CC = ["#f25ca8", "#f7c948", "#5fe3e8", "#3df56b", "#ff8a5c"];
    const CAKE = ["..c.c.c..", "..f.f.f..", "pppppppp.", "wwwwwwwww", "ppsppspps", "ppppppppp", "wwwwwwwww"];
    const balloon = (g, x, y, col, t, ph) => {
      const bx = x + Math.round(Math.sin(t * 1.1 + ph) * 3), by = y + Math.round(Math.sin(t * 1.5 + ph) * 2);
      for (let i = 0; i < 40; i++) R(g, bx + Math.round(Math.sin(i * 0.3 + t * 2 + ph) * 2), by + 16 + i * 2, 1, 2, "#c8c0d8");
      ell(g, bx, by, 11, 14, sh(col, 0.7)); ell(g, bx - 1, by - 1, 10, 13, col); ell(g, bx - 4, by - 6, 3, 4, sh(col, 1.4)); R(g, bx - 1, by + 14, 3, 3, sh(col, 0.7));
    };
    return (g, t, d, c) => {
      const VIBE = T(o, "vibe", 4.0, d, 7), vk = PX.ease(cl((t - VIBE) / 0.5, 0, 1), "back");
      const neon = t < VIBE ? 0 : t < VIBE + 0.35 ? (Math.floor((t - VIBE) * 25) % 2 ? 1 : 0.15) : 1;
      // ---- wall ----
      PX.vgrad(g, 0, 0, 640, 250, "26193e", "130e24", 10);
      for (let x = 0; x < 640; x += 24) R(g, x, 0, 12, 250, "rgba(255,255,255,.015)");
      // far: window + neon sign (par)
      PX.par(g, c, 0.5, () => {
        R(g, 520, 40, 92, 110, "#2e2244"); if (CORE().skyline) CORE().skyline(g, 524, 44, 84, 102, t, 41); R(g, 564, 44, 3, 102, "#2e2244"); R(g, 516, 148, 100, 5, "#3e3058");
        // neon sign
        const tube = (s, x, y, col) => { OT(g, s, x, y, { size: 16, col: neon > 0.5 ? col : "#3a2a4a", align: "center", outline: neon > 0.5 ? sh(col, 0.5) : "#1a1424" }); };
        R(g, 60, 52, 186, 54, "#1a1228"); PX.box(g, 60, 52, 186, 54, "#2e2242");
        tube("VIBE", 153, 60, "#ff7ac0"); tube("AWAY", 153, 82, "#7ff0f4");
        if (neon > 0) { PX.glow(g, 153, 68, 100, "rgba(242,92,168,0.4)", neon); PX.glow(g, 153, 90, 90, "rgba(95,227,232,0.32)", neon); }
      });
      // bunting + string lights (mid)
      PX.par(g, c, 0.75, () => {
        for (let i = 0; i < 18; i++) { const x = 10 + i * 36, y = 14 + Math.round(Math.sin((i / 17) * Math.PI) * 14); poly(g, [[x, y], [x + 22, y + 1], [x + 11, y + 16]], CC[i % 5]); R(g, x + 2, y + 1, 18, 1, sh(CC[i % 5], 1.3)); }
        LB().fairy(g, 0, 640, 124, 14, t, 14, 8);
      });
      // balloons
      balloon(g, 290, 70, "#f25ca8", t, 0); balloon(g, 318, 58, "#5fe3e8", t, 1.3); balloon(g, 346, 76, "#f7c948", t, 2.4); balloon(g, 488, 90, "#3df56b", t, 3.1);
      // ---- the dev (party hat) behind the table ----
      const DXp = Math.round(236 - vk * 10), HIP = 254 - Math.round(vk * 2), DHh = 92;
      const behind = { al: [[-20, -16], [-4, -28]], ar: [[20, -16], [4, -28]] };
      const arms = t < VIBE ? { hands: { l: [DXp + 30, 256], r: [DXp + 48, 254 + (PX.blink(t, 0.18) ? 1 : 0)] } } : behind;
      dev(g, DXp, HIP, { h: DHh, seated: true, noLegs: true, face: t < VIBE ? "happy" : "smug", look: t < VIBE ? 2 : 0, ...arms, lit: -1 }, (b, P) => {
        const hx = P.hx - 2, hy = P.hy, hh = Math.round(P.hh * 0.95), hw = Math.round(P.hw * 0.62);
        poly(b, [[hx - hw, hy + 1], [hx + hw, hy + 1], [hx + 2, hy - hh]], "#3a7ad8");
        poly(b, [[hx - hw, hy + 1], [hx - hw + 3, hy + 1], [hx + 2, hy - hh], [hx + 1, hy - hh]], "#5a9af0");
        for (let i = 0; i < 3; i++) { const yy = hy - 3 - Math.round((i * hh) / 3.4), k = 1 - (yy - (hy - hh)) / hh, w = Math.round(hw * (1 - k)); R(b, hx + 2 - w, yy, 2 * w, 2, "#f7c948"); }
        PX.circle(b, hx + 2, hy - hh - 1, 3, "#f25ca8"); R(b, hx + 1, hy - hh - 3, 1, 1, "#ffd0e8");
        if (vk > 0) shades(b, P, vk);
      });
      // ---- table: cloth top + front drape ----
      const TY = 252;
      R(g, 0, TY, 640, 30, "#7a2c56"); R(g, 0, TY, 640, 2, "#b05888"); for (let x = 0; x < 640; x += 22) R(g, x + ((x / 22) % 2) * 6, TY + 8 + ((x / 22) % 3) * 6, 3, 2, "#98446e");
      R(g, 0, TY + 30, 640, 78, "#4a1636"); for (let x = 0; x < 640; x += 16) { ell(g, x + 8, TY + 31, 8, 3, "#7a2c56"); R(g, x, TY + 34, 1, 74, "#3a0e2a"); }
      for (let y = TY + 44; y < 360; y += 16) for (let x = ((y / 16) % 2) * 16; x < 640; x += 32) R(g, x, y, 3, 3, "#5e2048");
      // gift box (right)
      bx3(g, 566, TY - 10, 40, 26, "#3a8ac0", "#6ab0e0", "#1e5a86"); R(g, 583, TY - 10, 6, 26, "#f7c948"); R(g, 566, TY - 1, 40, 5, "#f7c948");
      poly(g, [[586, TY - 10], [574, TY - 20], [572, TY - 12]], "#f7c948"); poly(g, [[586, TY - 10], [598, TY - 20], [600, TY - 12]], "#e0b030");
      PX.glow(g, 240, TY + 10, 160, "rgba(255,170,120,0.18)", 1);
      // ---- cake (left) ----
      const CX0 = 104, CY0 = TY + 10;
      bx3(g, CX0 - 4, CY0, 58, 6, "#c8c8d8", "#ffffff", "#8a8a9a");
      R(g, CX0, CY0 - 28, 50, 28, "#d8789a"); R(g, CX0, CY0 - 28, 50, 4, "#f4dce4"); for (let i = 0; i < 7; i++) R(g, CX0 + 2 + i * 7, CY0 - 24, 3, 3 + (i % 2) * 3, "#f4dce4");
      R(g, CX0, CY0 - 12, 50, 2, "#a8486a"); R(g, CX0 + 48, CY0 - 28, 2, 28, "#a8587a"); R(g, CX0, CY0 - 28, 2, 28, "#f0a0bc");
      LB().candle(g, CX0 + 12, CY0 - 28, t, 10); LB().candle(g, CX0 + 25, CY0 - 28, t + 0.4, 12); LB().candle(g, CX0 + 38, CY0 - 28, t + 0.8, 10);
      // cups + party popper
      bx3(g, 34, TY + 2, 14, 16, "#3ab0b8", "#8ae0e4", "#1a6a70"); bx3(g, 56, TY + 6, 12, 13, "#c0a030", "#f0d060", "#806010");
      poly(g, [[176, TY + 14], [190, TY + 4], [194, TY + 10]], "#f25ca8"); R(g, 190, TY + 2, 2, 2, "#f7c948"); R(g, 195, TY + 6, 2, 2, "#5fe3e8");
      // ---- laptop ----
      const LX = 336, LY = 120, LW = 190, LH = 116;
      PX.glow(g, LX + LW / 2, LY + LH / 2, 200, "rgba(242,120,200,0.25)", 1);
      R(g, LX - 6, LY - 6, LW + 12, LH + 12, "#22242e"); R(g, LX - 6, LY - 6, LW + 12, 1, "#5a5e6e"); R(g, LX - 6, LY - 6, 1, LH + 12, "#3a3e4c");
      poly(g, [[LX - 10, LY + LH + 6], [LX + LW + 10, LY + LH + 6], [LX + LW + 22, LY + LH + 20], [LX - 22, LY + LH + 20]], "#30333e"); R(g, LX - 22, LY + LH + 20, LW + 44, 2, "#1a1c24"); R(g, LX - 10, LY + LH + 6, LW + 20, 1, "#6a6e80");
      for (let r = 0; r < 3; r++) for (let q = 0; q < 18; q++) R(g, LX + 2 + q * 11 - r * 2, LY + LH + 9 + r * 3, 8, 2, "#4a4e5c");
      // website: browser chrome
      R(g, LX, LY, LW, 10, "#2a2c38"); for (let i = 0; i < 3; i++) R(g, LX + 4 + i * 5, LY + 4, 3, 3, ["#ff5c5c", "#f7c948", "#3df56b"][i]); R(g, LX + 24, LY + 3, LW - 30, 5, "#3a3d4c");
      const WY = LY + 10, WH = LH - 10;
      for (let i = 0; i < 12; i++) { const yy = WY + ((i * 12 + Math.floor(t * 20)) % (WH + 12)) - 12; R(g, LX, yy, LW, 6, i % 2 ? "#4a1e6a" : "#5a2478"); }
      g.save(); g.beginPath(); g.rect(LX, WY, LW, WH); g.clip();
      for (let i = 0; i < 12; i++) { const yy = WY + ((i * 12 + Math.floor(t * 20)) % (WH + 12)) - 12; R(g, LX, yy, LW, 6, i % 2 ? "#4a1e6a" : "#5a2478"); R(g, LX, yy + 6, LW, 6, "#3a165a"); }
      // bouncing rainbow letters
      const str = "HAPPY BIRTHDAY!", lw2 = 8 * str.length, sx0 = LX + LW / 2 - lw2 / 2;
      for (let i = 0; i < str.length; i++) { const yb = Math.round(Math.abs(Math.sin(t * 5 + i * 0.5)) * -7); const hue = Math.round((t * 160 + i * 24) % 360);
        TX(g, str[i], sx0 + i * 8 + 1, WY + 18 + yb + 1, { size: 8, col: "#1a0a2a" }); g.fillStyle = `hsl(${hue},95%,65%)`; TX(g, str[i], sx0 + i * 8, WY + 18 + yb, { size: 8, col: `hsl(${hue},95%,65%)` }); }
      // dancing cake
      const dance = Math.round(Math.sin(t * 8) * 3), squash = Math.abs(Math.sin(t * 8)) > 0.8 ? 1 : 0;
      PX.sprite(g, CAKE, LX + LW / 2 - 13 + dance, WY + 46 + squash, { c: PX.blink(t, 0.2) ? "#ffd070" : "#ff9a40", f: "#e8dcc0", p: "#f25ca8", w: "#fff0f4", s: "#5fe3e8" }, 3);
      R(g, LX + LW / 2 - 14, WY + 68 + squash, 6, 4, "#f7c948"); R(g, LX + LW / 2 + 8, WY + 68 + squash, 6, 4, "#f7c948");
      // spinning stars
      for (let i = 0; i < 6; i++) { const sx = LX + 14 + (i % 3) * 84 + (i > 2 ? 42 : 0), sy = WY + 40 + (i > 2 ? 34 : 0) + Math.round(Math.sin(t * 3 + i) * 3), fr = Math.floor(t * 8 + i) % 2, col = CC[(i + 1) % 5];
        if (fr) star4(g, sx, sy, 4, col); else { for (let k = -3; k <= 3; k++) { R(g, sx + k, sy + k, 1, 1, col); R(g, sx + k, sy - k, 1, 1, col); } R(g, sx - 1, sy - 1, 3, 3, col); } }
      g.restore();
      // screen light on the dev
      PX.glow(g, DXp + 20, 214, 70, "rgba(242,120,200,0.22)", 1);
      // ---- confetti in the air ----
      for (const [x0, y0, p, ci] of CONF) { const y = (y0 + t * (20 + p * 25)) % 380 - 10, x = x0 + Math.sin(t * 2 + p * 9) * 6, fl = Math.sin(t * 7 + p * 20) > 0; R(g, x, y, fl ? 2 : 1, fl ? 1 : 2, CC[ci]); }
      // VIBE beat: confetti burst + sparkles
      if (t >= VIBE && t < VIBE + 1) { const k = (t - VIBE); for (let i = 0; i < 18; i++) { const a = (i / 18) * 6.283; PX.alpha(g, 1 - k, () => R(g, DXp + Math.cos(a) * k * 90, 196 + Math.sin(a) * k * 60 + k * k * 30, 2, 2, CC[i % 5])); } }
      PX.vignette(g, 0.5);
    };
  };
})();
