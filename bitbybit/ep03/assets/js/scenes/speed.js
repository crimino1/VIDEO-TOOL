/* EP3 Builder D: the speed study.
   sixteen_devs, coin_flip, speed_chart, survey, compass, feels_fast, caveats, broken_gauge.
   Full illustrated night environments, 3+ parallax layers, glow + vignette, native-resolution characters (PX.learn.person). */
(function () {
  const { K } = PX;
  const R = PX.rect, G = PX.glow, cl = PX.clamp, lerp = PX.lerp;
  const LB = PX.learn;
  const sh = LB.sh, person = LB.person, ell = LB.ell, limb = LB.limb, cone = LB.cone;
  const frac = (x) => x - Math.floor(x);
  // option time with default scaled to shot length (def given for the typical length typ)
  const T = (o, k, def, d, typ) => (o[k] !== undefined ? o[k] : Array.isArray(def) ? def.map((v) => (v * d) / typ) : (def * d) / typ);
  const pop = (t, t0, dd) => PX.p(t, t0, dd || 0.35, "back");
  const hr = (i) => PX.rnd(((i + 1) * 2654435761) >>> 0);
  const shake = (t, t0, dur, amp) => (t >= t0 && t < t0 + dur ? Math.round(Math.sin(t * 90) * amp * (1 - (t - t0) / dur)) : 0);
  const thick = (g, x1, y1, x2, y2, w, col) => limb(g, x1, y1, x2, y2, w, col);
  const tick = (g, x, y, s, col) => { const w = Math.max(2, Math.round(s / 6)); thick(g, x, y + s * 0.5, x + s * 0.35, y + s * 0.85, w, col); thick(g, x + s * 0.35, y + s * 0.85, x + s, y, w, col); };
  const cross = (g, x, y, s, col) => { const w = Math.max(2, Math.round(s / 6)); thick(g, x, y, x + s, y + s, w, col); thick(g, x + s, y, x, y + s, w, col); };
  const KW = "#ff7b72", FN = "#d2a8ff", TX = "#c9d1d9", ST = "#a5d6ff", CM = "#7d8590", NU = "#79c0ff";
  const CODEC = [KW, FN, TX, ST, TX, CM, NU, TX];

  // crisp rotation: draw fn into an offscreen canvas, paste rotated pixel by pixel (no smoothing)
  const OFF = document.createElement("canvas"), OG = OFF.getContext("2d");
  const rot = (g, w, h, cx, cy, ang, fn, px, py) => {
    OFF.width = w; OFF.height = h; OG.clearRect(0, 0, w, h); fn(OG);
    const img = OG.getImageData(0, 0, w, h).data, ca = Math.cos(ang), sa = Math.sin(ang);
    px = px === undefined ? w / 2 : px; py = py === undefined ? h / 2 : py;   // pivot inside the picture
    const ext = Math.ceil(Math.hypot(Math.max(px, w - px), Math.max(py, h - py))) + 1;
    for (let yy = -ext; yy <= ext; yy++) for (let xx = -ext; xx <= ext; xx++) {
      const u = Math.floor(ca * xx + sa * yy + px), v = Math.floor(-sa * xx + ca * yy + py);
      if (u < 0 || v < 0 || u >= w || v >= h) continue;
      const i = (v * w + u) * 4; if (img[i + 3] < 128) continue;
      g.fillStyle = `rgb(${img[i]},${img[i + 1]},${img[i + 2]})`; g.fillRect(Math.round(cx) + xx, Math.round(cy) + yy, 1, 1);
    }
  };

  // ---------- character extras drawn over PX.learn.person (P = its returned geometry) ----------
  const extras = (g, P, e, o) => {
    o = o || {};
    const { hx, hy, hw, hh, ey, ty } = P, ex = Math.max(2, Math.round(hw * 0.22)), big = hh >= 16;
    if (e.beanie) { const c = e.beanie; R(g, hx - hw / 2 - 1, hy - 3, hw + 2, Math.round(hh * 0.32) + 3, c); R(g, hx - hw / 2, hy - 4, hw, 1, c); R(g, hx - hw / 2 - 1, hy + Math.round(hh * 0.2), hw + 2, 2, sh(c, 0.7)); R(g, hx - 2, hy - 3, Math.round(hw / 3), 1, sh(c, 1.35)); R(g, hx - 1, hy - 6, 3, 2, sh(c, 1.2)); }
    if (e.cap) { const c = e.cap; R(g, hx - hw / 2, hy - 3, hw, Math.round(hh * 0.3) + 2, c); R(g, hx - hw / 2 - 1, hy + Math.round(hh * 0.22), hw + Math.round(hw * 0.55), 2, sh(c, 0.7)); R(g, hx - 2, hy - 3, Math.round(hw / 3), 1, sh(c, 1.35)); }
    if (e.glasses) {
      const gw = big ? 5 : 3, gh = big ? 4 : 3, c = e.glasses;
      for (const s of [-1, 1]) { const gx = hx + s * ex - (s < 0 ? gw - 1 : 0) + (o.look || 0); PX.box(g, gx, ey - 1, gw, gh, c); if (o.glint) R(g, gx + 1, ey, 1, 1, "#e8f4ff"); }
      R(g, hx - ex + 1 + (o.look || 0), ey, 2 * ex - 2, 1, c);
    }
    if (e.beard) {
      const c = e.beard, my = hy + Math.round(hh * 0.78), bw = hw - 2;
      for (let y = ey + 2; y <= hy + hh + Math.round(hh * 0.12); y++) {
        const k = (y - (ey + 2)) / (hh * 0.55), w = Math.round(bw * (1 - Math.max(0, k - 0.65) * 1.3));
        if (w <= 0) continue;
        if (y >= my - 1 && y <= my + 1) { R(g, hx - Math.round(w / 2), y, Math.round(w / 2) - 3, 1, c); R(g, hx + 3, y, Math.round(w / 2) - 3, 1, c); }
        else if (y > ey + 3 || Math.abs(y - ey) > 0) R(g, hx - Math.round(w / 2), y, y < my - 1 ? 3 : w, 1, c), y < my - 1 && R(g, hx + Math.round(w / 2) - 3, y, 3, 1, c);
      }
      R(g, hx - 3, my - 2, 7, 1, c); R(g, hx - 2, my - 2, 2, 1, sh(c, 1.3));
      R(g, hx - Math.round(bw / 2), ey + 3, 1, hh * 0.4, sh(c, 0.7));
    }
    if (e.phones) {   // headphones around the neck
      const c = e.phones, w = hw + 2;
      R(g, hx - w / 2, ty - 1, w, 2, c); R(g, hx - w / 2 - 1, ty - 3, 3, 4, sh(c, 1.3)); R(g, hx + w / 2 - 2, ty - 3, 3, 4, sh(c, 1.3)); R(g, hx - w / 2, ty - 1, w, 1, sh(c, 1.5));
    }
  };

  // ---------- small props ----------
  // AI robot face icon (s = box size). mode "ok" | "banned"
  const bot = (g, x, y, s, mode, t) => {
    const ok = mode !== "banned", base = ok ? "#7fb8c8" : "#b07070", hl = ok ? "#b8e8f0" : "#e0a0a0", dk = ok ? "#3e6a7a" : "#6a3036";
    const r = Math.max(2, Math.round(s / 6));
    R(g, x + r, y, s - 2 * r, s, base); R(g, x, y + r, s, s - 2 * r, base); R(g, x + 1, y + 1, s - 2, s - 2, base);
    R(g, x + r, y, s - 2 * r, 2, hl); R(g, x, y + r, 2, s - 2 * r, hl); R(g, x + s - 2, y + r, 2, s - 2 * r, dk); R(g, x + r, y + s - 2, s - 2 * r, 2, dk);
    const ew = Math.round(s * 0.22), eyY = y + Math.round(s * 0.34);
    const bl = t !== undefined && PX.blink(t + x * 0.01, 3.1, 0.06);
    for (const k of [0.22, 0.56]) { R(g, x + Math.round(s * k), eyY + (bl ? ew - 2 : 0), ew, bl ? 2 : ew, ok ? "#0e2a3a" : "#3a0e14"); if (!bl) R(g, x + Math.round(s * k) + 1, eyY + 1, Math.max(1, ew / 3), Math.max(1, ew / 3), ok ? "#5fe3e8" : "#ff8080"); }
    R(g, x + Math.round(s * 0.36), y + Math.round(s * 0.74), Math.round(s * 0.28), Math.max(1, Math.round(s / 14)), ok ? "#0e2a3a" : "#3a0e14");
    // antenna + pink LED
    R(g, x + s / 2 - 1, y - Math.round(s * 0.22), 2, Math.round(s * 0.22), dk); R(g, x + s / 2 - 2, y - Math.round(s * 0.3), 4, 3, "#f25ca8");
    if (!ok) { const w = Math.max(2, Math.round(s / 7)); thick(g, x - 3, y - 3, x + s + 2, y + s + 2, w, "#ff4d4d"); thick(g, x + s + 2, y - 3, x - 3, y + s + 2, w, "#ff4d4d"); }
  };
  const mug = (g, x, y, t, col) => {   // base at (x, y)
    col = col || "#d06a4a";
    R(g, x, y - 9, 8, 9, col); R(g, x, y - 9, 1, 9, sh(col, 1.3)); R(g, x + 6, y - 9, 2, 9, sh(col, 0.7)); R(g, x + 8, y - 7, 2, 4, col); R(g, x + 1, y - 9, 6, 1, "#4a2a18");
    for (let i = 0; i < 3; i++) { const k = frac(t * 0.6 + i / 3); PX.alpha(g, 0.45 * (1 - k), () => R(g, x + 3 + Math.round(Math.sin(k * 6 + i) * 2), y - 12 - k * 14, 2, 2, "#c9d1d9")); }
  };
  const plant = (g, x, y, t, s) => {   // pot base at (x, y)
    s = s || 1; const sw = Math.sin(t * 1.3) * s;
    for (let i = 0; i < 7; i++) { const a = -1.57 + (i - 3) * 0.38, L = (14 + (i % 3) * 5) * s; limb(g, x, y - 12 * s, x + Math.cos(a) * L + sw, y - 12 * s + Math.sin(a) * L, Math.max(2, Math.round(3 * s)), i % 2 ? "#3d8a4a" : "#2f6e3c"); }
    R(g, x - 7 * s, y - 12 * s, 14 * s, 12 * s, "#8a4a2c"); R(g, x - 8 * s, y - 13 * s, 16 * s, 3 * s, "#a85a34"); R(g, x - 7 * s, y - 12 * s, 2, 12 * s, "#b86a40"); R(g, x + 5 * s, y - 12 * s, 2, 12 * s, "#5a2e1a");
  };
  // wall clock with real-ish hands (ang in revolutions)
  const wallClock = (g, x, y, r, sec, frozen) => {
    PX.circle(g, x, y, r + 2, "#1a1a26"); PX.circle(g, x, y, r + 1, "#5a5e70"); PX.circle(g, x, y, r, "#d8d2c0"); PX.circle(g, x + 1, y + 1, r - 2, "#cbc4b0");
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283, L = i % 3 ? 1 : 2; for (let k = 0; k < L; k++) R(g, x + Math.cos(a) * (r - 2 - k), y + Math.sin(a) * (r - 2 - k), 1, 1, "#3a3a46"); }
    const as = (sec / 60) * 6.283 - 1.57, am = (sec / 3600 + 0.35) * 6.283 - 1.57, ah = -0.6;
    thick(g, x, y, x + Math.cos(ah) * (r * 0.5), y + Math.sin(ah) * (r * 0.5), 2, "#2a2a36");
    thick(g, x, y, x + Math.cos(am) * (r * 0.75), y + Math.sin(am) * (r * 0.75), 2, "#2a2a36");
    PX.line(g, x, y, x + Math.cos(as) * (r - 2), y + Math.sin(as) * (r - 2), frozen ? "#ff4d4d" : "#c03030");
    R(g, x - 1, y - 1, 3, 3, "#1a1a26");
  };

  // ================= the hackathon loft (shared by sixteen_devs / coin_flip / survey) =================
  const DEVS = [
    { skin: "#e0a878", hair: "#2a1a10", hs: "short", shirt: "#3f6fd0", e: { phones: "#2a2a34" } },
    { skin: "#8a5a3a", hair: "#141018", hs: "bun", shirt: "#c0503a", e: {} },
    { skin: "#f0c8a0", hair: "#c8a050", hs: "long", shirt: "#7a4ab0", e: { glasses: "#1a1a26" } },
    { skin: "#c98a5a", hair: "#2a1a10", hs: "short", shirt: "#3a9a6a", e: { beard: "#2a1a10" } },
    { skin: "#d9a066", hair: "#5a2a1a", hs: "spiky", shirt: "#d08a2a", e: {} },
    { skin: "#6b4226", hair: "#141018", hs: "short", shirt: "#2a8aa0", e: { beanie: "#c04a5a" } },
    { skin: "#e8b890", hair: "#8a8a92", hs: "short", shirt: "#4a5a7a", e: { glasses: "#c8a050", beard: "#9a9aa2" } },
    { skin: "#a86b3c", hair: "#2a1a10", hs: "long", shirt: "#c04a8a", e: {} },
    { skin: "#f2c9a0", hair: "#d06a2a", hs: "short", shirt: "#5a8a3a", e: { cap: "#2a4a8a" } },
    { skin: "#7a4a2a", hair: "#141018", hs: "bald", shirt: "#8a3a3a", e: { glasses: "#1a1a26" } },
    { skin: "#e0a878", hair: "#3a2416", hs: "bun", shirt: "#3a7ac0", e: { phones: "#c04a5a" } },
    { skin: "#c98a5a", hair: "#1a1218", hs: "spiky", shirt: "#6a4a9a", e: {} },
    { skin: "#f0c8a0", hair: "#5a3a1a", hs: "short", shirt: "#b8862a", e: { beard: "#5a3a1a" } },
    { skin: "#8a5a3a", hair: "#2a1a10", hs: "long", shirt: "#2a9a8a", e: { glasses: "#1a1a26" } },
    { skin: "#d9a066", hair: "#141018", hs: "short", shirt: "#a04a3a", e: { beanie: "#3a6a5a" } },
    { skin: "#a86b3c", hair: "#3a2416", hs: "bald", shirt: "#4a6ab0", e: { beard: "#1a1218", phones: "#2a2a34" } },
  ];
  // perspective rows (back -> front): desk front-edge y, scale, column spacing
  const ROWS = [{ y: 172, s: 0.56, sp: 86 }, { y: 210, s: 0.68, sp: 104 }, { y: 256, s: 0.83, sp: 124 }, { y: 314, s: 1.0, sp: 146 }];
  const deskPos = (i) => { const r = ROWS[i >> 2], col = i & 3; return { x: Math.round(320 + (col - 1.5) * r.sp), y: r.y, s: r.s, row: i >> 2, col }; };
  const ORDER = [5, 14, 0, 10, 3, 8, 13, 6, 1, 11, 15, 4, 9, 2, 12, 7];   // desks light up in this order

  // hall background. o: dark (0..1 darkening), t
  const hall = (g, t, c, dark) => {
    dark = dark || 0;
    // far: brick wall + 3 big factory windows with the night city
    PX.par(g, c, 0.4, () => {
      PX.core.skyline(g, -40, 20, 720, 150, t, 7);
      const WX = [40, 250, 460], inWin = (x, y) => y >= 26 && y < 164 && WX.some((wx) => x >= wx && x < wx + 140);
      for (let y = -30; y < 200; y += 6) { const off = (y / 6) % 2 ? 0 : 7; for (let x = -40 + off; x < 680; x += 14) {
        if (inWin(x, y) && inWin(x + 12, y) && inWin(x, y + 4)) continue;
        const col = (x * 7 + y * 3) % 5 ? "#251f3e" : "#2a2242";
        for (let k = 0; k < 13; k++) if (!inWin(x + k, y) || !inWin(x + k, y + 4)) { R(g, x + k, y, 1, 5, col); R(g, x + k, y, 1, 1, "#30284a"); }
      } }
      for (const wx of WX) {
        PX.box(g, wx - 2, 24, 144, 142, "#14122a"); PX.box(g, wx - 1, 25, 142, 140, "#2a2a40");
        for (let k = 1; k < 4; k++) R(g, wx + k * 35 - 1, 26, 2, 138, "#2a2a40");
        for (let k = 1; k < 4; k++) R(g, wx, 26 + k * 34, 140, 2, "#2a2a40");
        R(g, wx - 6, 164, 152, 5, "#3a3450"); R(g, wx - 6, 164, 152, 1, "#5a5270");
        G(g, wx + 70, 100, 90, "rgba(120,110,220,0.12)", 1);
      }
    });
    // ceiling: steel beams, ducts, string lights (mid-far)
    PX.par(g, c, 0.6, () => {
      R(g, -40, -20, 720, 34, "#0e0c1c"); R(g, -40, 12, 720, 3, "#2a2840"); R(g, -40, 14, 720, 1, "#4a4664");
      for (let x = -20; x < 680; x += 40) { PX.line(g, x, 0, x + 20, 12, "#24223a"); PX.line(g, x + 20, 12, x + 40, 0, "#24223a"); }
      R(g, -40, 20, 720, 7, "#3a3e52"); R(g, -40, 20, 720, 1, "#6a7088"); R(g, -40, 26, 720, 1, "#22243a");
      for (let x = 0; x < 640; x += 64) R(g, x, 19, 3, 9, "#4a4e64");
      LB.fairy(g, -20, 330, 30, 16, t, 14, 3); LB.fairy(g, 310, 660, 30, 16, t, 14, 8);
    });
    // floor: polished concrete with reflections
    PX.vgrad(g, -40, 168, 720, 200, "1e2040", "2a2c4e", 7);
    for (let i = 0; i < 9; i++) { const y = 168 + Math.round(Math.pow(i / 9, 1.6) * 200); R(g, -40, y, 720, 1, "#262848"); }
    for (let k = -8; k <= 8; k++) PX.line(g, 320 + k * 30, 168, 320 + k * 110, 360, "#24264a");
    // banners hanging from the beam (mid)
    PX.par(g, c, 0.75, () => {
      const B = [[64, "#6a4ab0", "gear", 3], [170, "#2a8a8a", "leaf", 5], [276, "#c0603a", "cube", 7], [382, "#b04a7a", "bolt", 9]];
      B.forEach(([bx, col, ic, pips], i) => {
        const sway = Math.round(Math.sin(t * 1.1 + i * 1.7) * 1.2), x = bx + sway, y = 27, w = 46, h = 54;
        R(g, bx - 1, y, 1, 4, "#5a5e70"); R(g, bx + w - 2, y, 1, 4, "#5a5e70");
        R(g, x - 3, y + 3, w + 2, 3, "#3a3020"); R(g, x - 3, y + 3, w + 2, 1, "#8a7040");
        for (let yy = 0; yy < h; yy++) {
          const notch = yy > h - 8 ? (yy - (h - 8)) * 3 : 0, half = w / 2 - notch;
          R(g, x - 2, y + 6 + yy, half, 1, col); R(g, x - 2 + w / 2 + notch, y + 6 + yy, half, 1, col);
          R(g, x - 2, y + 6 + yy, 2, 1, sh(col, 1.25)); R(g, x + w - 4, y + 6 + yy, 2, 1, sh(col, 0.7));
          if (notch) { R(g, x - 2 + half - 1, y + 6 + yy, 1, 1, sh(col, 0.7)); }
        }
        const cx = x - 2 + w / 2, cy = y + 22, ink = sh(col, 1.7);
        if (ic === "gear") { PX.circle(g, cx, cy, 8, ink); PX.circle(g, cx, cy, 3, col); for (let a = 0; a < 8; a++) R(g, cx + Math.cos(a * 0.785) * 9 - 1, cy + Math.sin(a * 0.785) * 9 - 1, 3, 3, ink); }
        else if (ic === "leaf") { ell(g, cx, cy, 6, 9, ink); PX.line(g, cx, cy - 8, cx, cy + 10, col); for (let k = -1; k <= 1; k++) { PX.line(g, cx, cy + k * 4, cx - 4, cy + k * 4 - 3, col); PX.line(g, cx, cy + k * 4, cx + 4, cy + k * 4 - 3, col); } }
        else if (ic === "cube") { for (let k = 0; k < 8; k++) { R(g, cx - 8 + k, cy - 4 - k / 2, 1, 12, ink); R(g, cx + k, cy - 8 + k / 2, 1, 12, sh(col, 1.4)); } R(g, cx - 8, cy - 5, 16, 2, sh(col, 1.9)); }
        else { for (const [ax, ay, bx2, by2] of [[3, -10, -4, 1], [-4, 1, 3, 1], [3, 1, -3, 11]]) thick(g, cx + ax, cy + ay, cx + bx2, cy + by2, 3, ink); }
        // "YEARS" tag with experience pips
        R(g, x + 2, y + 38, w - 8, 9, "#141626"); R(g, x + 2, y + 38, w - 8, 1, sh(col, 1.4));
        PX.text(g, "YEARS", x + 4, y + 39, { font: "v", size: 9, col: "#f0e0b0" });
        for (let k = 0; k < pips; k++) R(g, x + 4 + (k % 5) * 3, y + 48 + Math.floor(k / 5) * 3 - 1, 2, 2, "#f7c948");
      });
    });
    if (dark) PX.alpha(g, dark, () => R(g, -40, -40, 720, 440, "#05060f"));
  };

  // one workstation: dev seated behind the desk, monitor angled toward them on the right
  const SB = document.createElement("canvas"); SB.width = 640; SB.height = 360;
  const station = (g0, i, t, lit, o) => {
    o = o || {};
    // draw into a buffer so an unlit desk can be darkened as a whole (source-atop keeps its silhouette)
    const g = SB.getContext("2d"); g.setTransform(g0.getTransform()); g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, 640, 360); g.restore();
    const P = stationArt(g, i, t, lit, o);
    const dk = 0.62 * (1 - cl(lit, 0, 1));
    if (dk > 0) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = "source-atop"; g.fillStyle = `rgba(6,8,22,${dk})`; g.fillRect(0, 0, 640, 360); g.restore(); }
    g0.save(); g0.setTransform(1, 0, 0, 1, 0, 0); g0.drawImage(SB, 0, 0); g0.restore();
    return P;
  };
  const stationArt = (g, i, t, lit, o) => {
    const { x, y, s } = deskPos(i), D = DEVS[i], rr = hr(i + 3);
    const dw = Math.round(118 * s), dd = Math.round(14 * s), fh = Math.round(19 * s);
    const on = cl(lit, 0, 1), boot = cl(lit * 3, 0, 1);
    const typing = on > 0.6 && !o.still;
    const face = o.face || (on < 0.3 ? "closed" : typing ? (Math.sin(t * 0.7 + i) > 0.6 ? "happy" : "focus") : "neutral");
    // monitor glow behind everything at this desk
    const mx = x + Math.round(22 * s), my = y - dd - Math.round(36 * s), mw = Math.round(38 * s), mh = Math.round(28 * s);
    if (on > 0) G(g, mx + mw / 2, my + mh / 2, 70 * s, "rgba(90,170,255,0.30)", on);
    // dev (seated, hips hidden by desk)
    const ph = i * 1.3, bob = typing ? Math.round(Math.sin(t * 3 + ph) * 0.6) : 0;
    const kx = x - Math.round(14 * s), ky = y - dd - 1;
    const tp = typing ? Math.round(Math.sin(t * 19 + ph)) : 0, tq = typing ? Math.round(Math.sin(t * 17 + ph + 1.4)) : 0;
    let hands = { l: [kx - Math.round(9 * s), ky - 2 + tp], r: [kx + Math.round(8 * s), ky - 2 + tq] };
    const act = o.act || 0;   // 0..1 stretch (arms up)
    if (act > 0) hands = { l: [lerp(hands.l[0], x - 30 * s, act), lerp(hands.l[1], y - 74 * s, act)], r: [lerp(hands.r[0], x + 2 * s, act), lerp(hands.r[1], y - 74 * s, act)] };
    if (o.sip > 0) hands.r = [lerp(hands.r[0], x - 12 * s, o.sip), lerp(hands.r[1], y - 44 * s, o.sip)];
    const P = person(g, x - Math.round(14 * s), y - dd + Math.round(5 * s) + bob, {
      h: Math.round(72 * s), seated: true, noLegs: true, skin: D.skin, hair: D.hair, hairStyle: D.hs, shirt: D.shirt, pants: "#2d3550",
      face, look: on > 0.3 ? 1 : 0, lit: 1, hands, bob: 0,
    });
    extras(g, P, D.e, { look: on > 0.3 ? 1 : 0, glint: on > 0.5 && Math.sin(t * 2 + i) > 0.7 });
    if (o.sip > 0.5) mug(g, Math.round(hands.r[0]) - 3, Math.round(hands.r[1]) + 4, t, "#5fa0c0");
    // screen light on the face side
    if (on > 0.4) { PX.alpha(g, 0.3 * on, () => R(g, P.hx + P.hw / 2, P.hy + 3, 1, P.hh - 6, "#9fe8ff")); G(g, P.hx + P.hw / 2, P.hy + P.hh / 2, P.hh * 1.2, "rgba(120,200,255,0.25)", on); }
    // desk: top surface + front panel + legs
    R(g, x - dw / 2, y - dd, dw, dd, "#5a4636"); R(g, x - dw / 2, y - dd, dw, 1, "#8a6a4e");
    for (let k = 1; k < 3; k++) R(g, x - dw / 2 + 2, y - dd + Math.round((dd * k) / 3), dw - 4, 1, "#52402f");
    if (on > 0) G(g, mx + mw / 2 - 4, y - dd / 2, 40 * s, "rgba(110,170,255,0.35)", on);
    R(g, x - dw / 2, y, dw, 2, "#6a523e"); R(g, x - dw / 2, y + 2, dw, 1, "#2a2018");
    // metal legs + modesty panel (floor shows through)
    R(g, x - dw / 2 + 3, y + 3, Math.max(2, Math.round(3 * s)), fh, "#3a3e52"); R(g, x + dw / 2 - 3 - Math.max(2, Math.round(3 * s)), y + 3, Math.max(2, Math.round(3 * s)), fh, "#2a2c3e");
    R(g, x - dw / 2 + 3, y + 3, 1, fh, "#5a6078");
    R(g, x - dw / 2 + 8, y + 3, dw - 16, Math.round(fh * 0.55), "#23253a"); R(g, x - dw / 2 + 8, y + 3, dw - 16, 1, "#34374f");
    // drawer unit with a glowing power LED
    const du = Math.round(22 * s); R(g, x + dw / 2 - 6 - du, y + 3, du, fh, "#2c2f46"); R(g, x + dw / 2 - 6 - du, y + 3, 1, fh, "#3e4260");
    for (let k = 1; k < 3; k++) R(g, x + dw / 2 - 6 - du, y + 3 + Math.round((fh * k) / 3), du, 1, "#1c1e30");
    R(g, x + dw / 2 - 6 - du + 2, y + 6, 2, 1, on > 0.5 ? (PX.blink(t + i * 0.37, 2.2, 0.8) ? "#3df56b" : "#1a5a2a") : "#2a1a1a");
    // name sticker
    R(g, x - dw / 2 + 12, y + 5, Math.round(16 * s), Math.max(2, Math.round(3 * s)), sh(D.shirt, 0.85));
    // keyboard
    R(g, kx - Math.round(14 * s), ky - Math.round(3 * s), Math.round(28 * s), Math.max(2, Math.round(3 * s)), "#1e2030");
    R(g, kx - Math.round(14 * s), ky - Math.round(3 * s), Math.round(28 * s), 1, on > 0.5 ? "#6aa0d0" : "#3a3e52");
    // angled monitor (screen faces the dev: right edge further away = shorter)
    const ix = mx, iy = my;
    R(g, ix + mw / 2 - 1, iy + mh, Math.max(2, Math.round(3 * s)), y - dd - (iy + mh) + 1, "#2a2c3a"); R(g, ix + mw / 2 - 6 * s, y - dd - 1, 12 * s, 2, "#3a3e52");
    for (let u = 0; u < mw; u++) {
      const k = u / mw, top = iy + Math.round(k * 3 * s), hgt = Math.round(mh - k * 6 * s);
      R(g, ix + u, top - 2, 1, hgt + 4, u < 2 ? "#4a4e64" : "#1a1c28");
    }
    for (let u = 2; u < mw - 1; u++) {
      const k = u / mw, top = iy + Math.round(k * 3 * s), hgt = Math.round(mh - k * 6 * s);
      R(g, ix + u, top, 1, hgt, boot > 0 ? (boot < 1 && Math.abs((top + hgt / 2) - (iy + mh / 2)) > hgt * boot / 2 ? "#0a0c14" : "#0d1424") : "#0a0c14");
    }
    if (boot >= 1) {   // code lines (per-desk seed, scroll when typing)
      const nL = Math.max(4, Math.round(mh / 3.2)), scroll = typing ? Math.floor(t * (2 + rr() * 2)) : 0;
      for (let l = 0; l < nL; l++) {
        const r2 = hr(i * 97 + l + scroll), ind = Math.floor(r2() * 3), len = 0.25 + r2() * 0.55, col = CODEC[Math.floor(r2() * CODEC.length)];
        const v = (l + 0.8) / (nL + 0.6);
        for (let u = 4 + ind * 3; u < 4 + ind * 3 + len * (mw - 10); u++) {
          const k = u / mw, top = iy + Math.round(k * 3 * s), hgt = mh - k * 6 * s;
          if ((u * 7 + l) % 9 === 0) continue;
          R(g, ix + u, top + Math.round(v * hgt), 1, 1, col);
        }
      }
      if (PX.blink(t + i * 0.3, 0.9)) R(g, ix + 5, iy + Math.round(mh * 0.85), 2, 1, "#e6edf3");
    } else if (boot > 0) R(g, ix + 2, iy + mh / 2, mw - 3, 1, "#c8e8ff");
    // desk lamp + mug per desk (lamp on when lit)
    if (i % 3 === 0) mug(g, x - dw / 2 + Math.round(10 * s), y - Math.round(dd / 2), t + i, ["#d06a4a", "#4a8ad0", "#e0b040"][i % 3]);
    else if (i % 3 === 1) { const lx = x - dw / 2 + Math.round(8 * s), ly = y - Math.round(dd / 2); R(g, lx - 3, ly - 2, 7, 2, "#2a2c3a"); R(g, lx, ly - Math.round(20 * s), 1, Math.round(18 * s), "#4a4e64"); R(g, lx - 2, ly - Math.round(24 * s), 9, 4, "#3a3e52");
      if (on > 0.5) { R(g, lx - 1, ly - Math.round(20 * s), 7, 1, "#ffe2a8"); G(g, lx + 2, ly - Math.round(14 * s), 34 * s, "rgba(255,190,110,0.45)", on); } }
    else plant(g, x - dw / 2 + Math.round(9 * s), y - Math.round(dd / 2), t + i, Math.max(0.5, s * 0.7));
    // power-on sparkle
    if (lit > 0 && lit < 0.6) { const k = lit / 0.6; PX.alpha(g, 1 - k, () => { LB.star4(g, ix + mw / 2, iy - 4 - k * 6, 2 + Math.round(k * 3), "#e8fbff"); }); }
    return P;
  };

  // ================= sixteen_devs =================
  // o.count = [start, end] desks light up one by one, counter 1..16 (default [0.5, 3.5])
  K.sixteen_devs = (o) => (g, t, d, c) => {
    const cnt = T(o, "count", [0.5, 3.5], d, 8.5), c0 = cnt[0], c1 = cnt[1];
    hall(g, t, c, 0.28);
    // dim ambient before the desks light up (cool)
    const lit = (j) => { const idx = ORDER.indexOf(j), at = c0 + (idx / 15) * (c1 - c0); return (t - at) / 0.5; };
    const n = cl(Math.floor(((t - c0) / (c1 - c0)) * 15) + 1, 0, 16) * (t >= c0 ? 1 : 0);
    // workstations, back to front
    for (let j = 0; j < 16; j++) {
      const L = lit(j), tl = t - (c1 + 0.6);
      const o2 = {};
      if (j === 9) o2.act = cl(Math.sin(cl((t - 5.0 * d / 8.5) / 1.4, 0, 1) * Math.PI) * 1.3, 0, 1);       // stretch
      if (j === 12) o2.sip = cl(Math.sin(cl((t - 6.2 * d / 8.5) / 1.6, 0, 1) * Math.PI) * 1.4, 0, 1);       // coffee sip
      if (j === 2 && tl > 0 && tl < 1.2) o2.face = "happy";
      station(g, j, t, L, o2);
      if (j === 6 && t > 7.0 * d / 8.5) { const k = pop(t, 7.0 * d / 8.5, 0.3), p = deskPos(j); PX.alpha(g, cl(1 - (t - 7.0 * d / 8.5 - 1) * 2, 0, 1), () => LB.star4(g, p.x - 8, p.y - 60 * p.s - k * 4, 3, "#f7c948")); }
    }
    // hanging LED counter board (top-right of centre, inside the safe area)
    PX.par(g, c, 0.8, () => {
      const bx = 458, by = 40, bw = 128, bh = 34;
      R(g, bx + 20, 27, 1, 13, "#5a5e70"); R(g, bx + bw - 21, 27, 1, 13, "#5a5e70");
      R(g, bx - 2, by - 2, bw + 4, bh + 4, "#2a2c3a"); R(g, bx - 2, by - 2, bw + 4, 1, "#5a6078"); R(g, bx, by, bw, bh, "#080a10");
      for (let yy = by + 2; yy < by + bh - 1; yy += 2) for (let xx = bx + 2; xx < bx + bw - 1; xx += 2) R(g, xx, yy, 1, 1, "#12161e");
      PX.text(g, "DEVS", bx + 8, by + 10, { size: 8, col: "#5a7a8a" });
      const pk = n > 0 ? 1 - cl((t - (c0 + ((n - 1) / 15) * (c1 - c0))) / 0.25, 0, 1) : 0;
      const col = n >= 16 ? "#3df56b" : "#f7c948";
      PX.text(g, String(n).padStart(2, " "), bx + bw - 10, by + 5 - Math.round(pk * 2), { size: 24, col, align: "right" });
      G(g, bx + bw - 36, by + bh / 2, 40, n >= 16 ? "rgba(61,245,107,0.35)" : "rgba(247,201,72,0.3)", n > 0 ? 1 : 0);
      if (n >= 16 && t < c1 + 1.2) PX.alpha(g, 1 - (t - c1) / 1.2, () => G(g, bx + bw / 2, by + bh / 2, 90, "rgba(61,245,107,0.5)", 1));
    });
    // dust in the air + vignette
    PX.particles(g, 21, 40, t, [0, 40, 640, 260], { vy: -2, vx: 1.5, col: "#c8d8ff", a: 0.45 });
    PX.vignette(g, 0.55);
  };

  // ================= coin_flip =================
  // o.flips (5), o.first "ai" | "no" (which face lands first)
  K.coin_flip = (o) => (g, t, d, c) => {
    const nF = o.flips || 5, per = (d - 0.4) / nF, t0 = 0.25, first = o.first === "no" ? 1 : 0;
    hall(g, t, c, 0.45);
    // the 16 desks, lights off, in the background (back rows only)
    for (let j = 0; j < 8; j++) station(g, j, t, 0, { face: "closed" });
    PX.alpha(g, 0.35, () => R(g, -40, 150, 720, 220, "#05060f"));
    // spotlight cone from the ceiling onto the flip table
    cone(g, 320, 24, 30, 240, 236, "#bfd8ff", 0.32);
    const bins = [{ x: 128, col: "#5fe3e8", mode: "ok", lab: ["AI", "ALLOWED"] }, { x: 512, col: "#ff5c5c", mode: "banned", lab: ["AI", "BANNED"] }];
    const fi = Math.floor((t - t0) / per), fk = (t - t0) / per - fi;   // current flip index + phase
    const sideOf = (j) => (j + first) % 2, landAt = (j) => t0 + j * per + per * 0.92;
    const BY = 246, BW = 104, BH = 70;
    bins.forEach((b, bi) => {
      const by = BY, bw = BW, bh = BH;
      G(g, b.x, by + 10, 120, bi ? "rgba(255,92,92,0.25)" : "rgba(95,227,232,0.25)", 1);
      ell(g, b.x, by + bh, bw / 2 + 10, 6, "rgba(0,0,0,0.55)");
      // crate body with slats + metal corners
      R(g, b.x - bw / 2, by, bw, bh, "#2a2e44");
      for (let k = 0; k < 4; k++) { R(g, b.x - bw / 2, by + 4 + k * 17, bw, 1, "#3a3f5a"); R(g, b.x - bw / 2, by + 16 + k * 17, bw, 1, "#1c1f30"); }
      R(g, b.x - bw / 2, by, 3, bh, "#4a5070"); R(g, b.x + bw / 2 - 3, by, 3, bh, "#181a28");
      for (const cx of [b.x - bw / 2, b.x + bw / 2 - 6]) { R(g, cx, by, 6, 6, "#5a6078"); R(g, cx, by + bh - 6, 6, 6, "#3a3e52"); R(g, cx + 2, by + 2, 1, 1, "#a0a8c0"); R(g, cx + 2, by + bh - 4, 1, 1, "#8088a0"); }
      // open top (inside) with stacked cards
      R(g, b.x - bw / 2 - 2, by - 10, bw + 4, 11, "#14161f"); R(g, b.x - bw / 2 - 2, by - 10, bw + 4, 2, sh(b.col, 0.85)); R(g, b.x - bw / 2 - 2, by, bw + 4, 1, "#4a5070");
      let nk = 0; for (let j = 0; j < nF; j++) if (sideOf(j) === bi && t >= landAt(j)) nk++;
      for (let k = 0; k < nk; k++) { const r = hr(k + bi * 9), cx = b.x - 26 + r() * 34, cy = by - 6 - k * 3; R(g, cx, cy, 20, 5, k % 2 ? "#e8e0c8" : "#d8d0b8"); R(g, cx, cy, 20, 1, "#fff6e0"); R(g, cx + 2, cy + 2, 4, 1, "#c04a3a"); }
      // front plate: icon + label (lit edge)
      R(g, b.x - 44, by + 20, 88, 40, "#10121c"); R(g, b.x - 44, by + 20, 88, 1, b.col); R(g, b.x - 44, by + 59, 88, 1, "#2a2e44");
      bot(g, b.x - 37, by + 31, 18, b.mode, t);
      PX.text(g, b.lab[0], b.x - 12, by + 28, { size: 8, col: b.col }); PX.text(g, b.lab[1], b.x - 12, by + 42, { size: 8, col: b.col });
      G(g, b.x, by + 40, 50, bi ? "rgba(255,92,92,0.2)" : "rgba(95,227,232,0.2)", 1);
      // flash when a card lands
      for (let j = 0; j < nF; j++) if (sideOf(j) === bi && t >= landAt(j) && t < landAt(j) + 0.4) { const k = (t - landAt(j)) / 0.4; PX.alpha(g, 1 - k, () => { G(g, b.x, by - 6, 70, b.col, 0.9); for (let q = 0; q < 6; q++) R(g, b.x - 30 + q * 12, by - 12 - k * 20 - (q % 2) * 6, 2, 2, b.col); }); }
    });
    // flip table in the middle
    const px = 320, py = 262;
    ell(g, px, py + 52, 74, 8, "rgba(0,0,0,0.55)");
    R(g, px - 54, py, 108, 10, "#4a4f6a"); R(g, px - 54, py, 108, 1, "#a8b0d0"); R(g, px - 54, py + 9, 108, 1, "#2a2c3e");
    R(g, px - 44, py + 10, 88, 42, "#262840"); R(g, px - 44, py + 10, 3, 42, "#3a3e5a"); R(g, px + 41, py + 10, 3, 42, "#181a2a");
    R(g, px - 30, py + 22, 30, 2, "#5fe3e8"); R(g, px, py + 22, 30, 2, "#ff5c5c"); G(g, px - 15, py + 23, 20, "rgba(95,227,232,0.4)", 1); G(g, px + 15, py + 23, 20, "rgba(255,92,92,0.4)", 1);
    PX.text(g, "TASK", px, py + 32, { font: "v", size: 12, col: "#8a90b0", align: "center" });
    G(g, px, py, 90, "rgba(190,215,255,0.25)", 1);
    // task card on the table (a new card each flip); flies to the matching bin after the coin lands
    if (fi >= 0 && fi < nF) {
      const side = sideOf(fi), b = bins[side];
      let cx = px, cy = py - 8, ang = 0;
      if (fk > 0.62) { const k = PX.ease((fk - 0.62) / 0.3, "io"); cx = lerp(px, b.x, k); cy = lerp(py - 8, BY - 8, k) - Math.sin(k * Math.PI) * 80; ang = k * 6.28 * (side ? 1 : -1); }
      if (fk < 0.92) {
        const appear = pop(t, t0 + fi * per, 0.2);
        rot(g, 34, 22, cx, cy - (1 - appear) * 12, ang * 0.25, (q) => {
          q.fillStyle = "#e8e0c8"; q.fillRect(0, 0, 34, 22); q.fillStyle = "#fff6e0"; q.fillRect(0, 0, 34, 1);
          q.fillStyle = "#b8ae94"; q.fillRect(0, 21, 34, 1); q.fillStyle = "#c04a3a"; q.fillRect(3, 3, 10, 3);
          q.fillStyle = "#5a5a6a"; for (let k = 0; k < 3; k++) q.fillRect(3, 9 + k * 4, 18 + ((k * 7 + fi * 3) % 10), 2);
          q.fillStyle = "#7a7488"; q.fillRect(26, 13, 5, 5);
        });
        if (fk > 0.62) PX.alpha(g, 0.5, () => { for (let k = 1; k < 4; k++) { const kk = PX.ease((fk - 0.62 - k * 0.02) / 0.3, "io"); R(g, lerp(px, b.x, kk), lerp(py - 8, BY - 8, kk) - Math.sin(kk * Math.PI) * 80, 2, 2, b.col); } });
      }
    }
    // the coin: tossed up, spins, lands showing a face
    if (fi >= 0 && fi < nF) {
      const side = sideOf(fi), spinning = fk < 0.55, up = spinning ? Math.sin((fk / 0.55) * Math.PI) : 0;
      const cy = 132 - Math.round(up * 46), R0 = 40;
      const ang = spinning ? fk * 6.28 * 5 + 0.3 : 0, cs = Math.cos(ang);
      const wf = spinning ? Math.abs(cs) : 1, faceSide = spinning ? (cs > 0 ? 0 : 1) : side;
      const col = faceSide === 0 ? "#5fe3e8" : "#ff5c5c";
      const land = !spinning ? pop(t, t0 + fi * per + per * 0.55, 0.25) : 1;
      G(g, 320, cy, 130, faceSide === 0 ? "rgba(95,227,232,0.45)" : "rgba(255,92,92,0.45)", 1);
      G(g, 320, cy, 70, "rgba(255,220,140,0.35)", 1);
      const rx = Math.max(2, Math.round(R0 * wf * (0.86 + 0.14 * land))), ry = R0;
      // edge thickness (stack of darker ellipses) when the coin is turned
      const th = Math.round(6 * (1 - wf)) + 1;
      for (let k = th; k > 0; k--) ell(g, 320 + (cs > 0 ? k : -k), cy, rx, ry, k === th ? "#6a4a10" : "#a8801c");
      ell(g, 320, cy, rx, ry, "#e0b040"); ell(g, 320 - Math.round(rx * 0.06), cy - 2, Math.max(1, rx - 3), ry - 3, "#f7c948");
      ell(g, 320, cy, Math.max(1, rx - 6), ry - 6, "#c8961e");
      ell(g, 320, cy, Math.max(1, rx - 8), ry - 8, faceSide === 0 ? "#235866" : "#66232c");
      ell(g, 320 - Math.round(rx * 0.1), cy - 3, Math.max(1, rx - 12), ry - 12, faceSide === 0 ? "#2c6e7e" : "#7e2c36");
      // embossed dots around the rim
      for (let k = 0; k < 20; k++) { const a = (k / 20) * 6.283; R(g, 320 + Math.cos(a) * (rx - 4.5), cy + Math.sin(a) * (ry - 4.5), 1, 1, "#ffe08a"); }
      if (wf > 0.82) bot(g, 320 - Math.round(15 * wf), cy - 12, Math.round(30 * wf), faceSide === 0 ? "ok" : "banned", t);
      else if (wf > 0.3) R(g, 320 - Math.round(rx * 0.4), cy - 8, Math.round(rx * 0.8), 16, col);
      // moving glint
      if (wf > 0.5) { const gx = 320 - Math.round(rx * 0.55); R(g, gx, cy - ry + 10, 2, 7, "#fff6d0"); R(g, gx + 2, cy - ry + 8, 2, 3, "#fff6d0"); }
      // shadow on the table grows as the coin comes down
      ell(g, 320, py - 1, Math.round(20 + (1 - up) * 14), 2, "rgba(0,0,0,0.35)");
      // result label above the coin after landing + burst
      if (!spinning) {
        const k = pop(t, t0 + fi * per + per * 0.55, 0.3), lab = side === 0 ? "AI ALLOWED" : "AI BANNED";
        PX.alpha(g, cl(k * 2, 0, 1), () => { const ly = cy - R0 - 30 + Math.round((1 - k) * 8), lw = PX.tw(g, lab, { size: 16 }) + 16;
          R(g, 320 - lw / 2, ly - 5, lw, 26, "rgba(6,8,20,0.82)"); R(g, 320 - lw / 2, ly - 5, lw, 1, side === 0 ? "#5fe3e8" : "#ff5c5c"); R(g, 320 - lw / 2, ly + 20, lw, 1, side === 0 ? "#2a7a80" : "#8a2a2a");
          PX.otext(g, lab, 320, ly, { size: 16, col: side === 0 ? "#5fe3e8" : "#ff5c5c", align: "center" }); });
        if (fk < 0.7) PX.alpha(g, 1 - (fk - 0.55) / 0.15, () => { for (let k2 = 0; k2 < 12; k2++) { const a = k2 * 0.5236, rr2 = R0 + 6 + (fk - 0.55) * 260; R(g, 320 + Math.cos(a) * rr2, cy + Math.sin(a) * rr2, 2, 2, k2 % 2 ? "#fff0c0" : col); } });
      }
    }
    PX.particles(g, 31, 34, t, [190, 30, 260, 230], { vy: -4, vx: 1, col: "#d8e8ff", a: 0.6 });
    PX.vignette(g, 0.6);
  };

  // ================= scientist (shared by speed_chart / survey) =================
  // standing scientist in a lab coat (front), feet at (x, y). o: h, face, hands {l, r}, look, clip (draw clipboard at right hand), brows
  const SCI = { skin: "#8a5a3a", hair: "#1a1218", hairStyle: "bun", shirt: "#7c869c", pants: "#2a3048", shoe: "#1a1a22" };
  const clipboard = (g, x, y, o) => {   // centre-top at (x, y); w x h
    o = o || {}; const w = o.w || 22, h = o.h || 28;
    R(g, x - w / 2, y, w, h, "#7a5a3a"); R(g, x - w / 2, y, w, 1, "#9a7a52"); R(g, x + w / 2 - 1, y, 1, h, "#5a3e26");
    R(g, x - w / 2 + 2, y + 3, w - 4, h - 5, "#8e8676"); R(g, x - w / 2 + 2, y + h - 3, w - 4, 1, "#7a7262"); R(g, x - w / 2 + 2, y + 3, 1, h - 5, "#9a927f");
    R(g, x - 5, y - 2, 10, 4, "#9aa0b0"); R(g, x - 5, y - 2, 10, 1, "#d0d6e0");
    if (o.watch) {   // big red stopwatch drawing
      const cx = x, cy = y + 6 + (h - 6) / 2 + 1, r = Math.round(Math.min(w, h - 8) * 0.36);
      PX.circle(g, cx, cy, r + 1, "#c02a2a"); PX.circle(g, cx, cy, r - 1, "#8e8676"); R(g, cx - 2, cy - r - 4, 5, 3, "#c02a2a"); R(g, cx + r - 1, cy - r, 3, 2, "#c02a2a");
      thick(g, cx, cy, cx + Math.round(r * 0.6), cy - Math.round(r * 0.5), 2, "#c02a2a"); R(g, cx - 1, cy - 1, 2, 2, "#c02a2a");
    } else for (let k = 0; k < Math.floor((h - 8) / 4); k++) R(g, x - w / 2 + 4, y + 6 + k * 4, (k * 7) % 3 ? w - 10 : w - 14, 1, k < (o.lines || 99) ? "#5a5a6a" : "#8e8676");
  };
  const scientist = (g, x, y, t, o) => {
    o = o || {};
    const h = o.h || 100;
    const P = person(g, x, y, { ...SCI, shirt: o.coat || SCI.shirt, h, face: o.face || "neutral", hands: o.hands, look: o.look || 0, lit: o.lit || -1, top: "shirt", bob: o.bob || 0, legs: o.legs });
    const { hx, ty, tw, hip, hy, hh, ey, hw } = P, coat = o.coat || SCI.shirt;
    // coat skirt over the thighs + front opening, inner shirt + tie
    const sk = Math.round(h * 0.16);
    R(g, hx - tw / 2, hip - 1, tw, sk, coat); R(g, hx - tw / 2, hip - 1, 2, sk, sh(coat, 1.15)); R(g, hx + tw / 2 - 2, hip - 1, 2, sk, sh(coat, 0.75)); R(g, hx - tw / 2, hip + sk - 2, tw, 1, sh(coat, 0.75));
    R(g, hx, ty + 6, 1, hip + sk - ty - 7, sh(coat, 0.7));
    for (let k = 0; k < 6; k++) R(g, hx - 3 + Math.round(k / 2), ty + k, 6 - k, 1, "#4a6aa0");
    R(g, hx, ty + 2, 1, 7, "#c04a4a"); R(g, hx - 1, ty + 7, 3, 2, "#c04a4a");
    R(g, hx + Math.round(tw * 0.18), ty + Math.round(h * 0.07), 5, 4, sh(coat, 0.85)); R(g, hx + Math.round(tw * 0.18) + 1, ty + Math.round(h * 0.07) - 2, 1, 3, "#3a6ad0"); R(g, hx + Math.round(tw * 0.18) + 3, ty + Math.round(h * 0.07) - 2, 1, 3, "#c03030");
    // badge
    R(g, hx - Math.round(tw * 0.35), ty + Math.round(h * 0.07), 5, 6, "#e0e4ec"); R(g, hx - Math.round(tw * 0.35), ty + Math.round(h * 0.07), 5, 2, "#3a8ac0");
    extras(g, P, { glasses: "#2a2a36" }, { look: o.look || 0, glint: Math.sin(t * 1.7) > 0.8 });
    if (o.brows) for (const s of [-1, 1]) { const bx = hx + s * Math.max(2, Math.round(hw * 0.22)) - (s < 0 ? 4 : 0) + (o.look || 0); R(g, bx, ey - 4 - o.brows, 5, 1, "#1a1218"); }
    if (o.clip) { const [cx, cy] = P.hr; clipboard(g, cx - 2, cy - 18, { watch: o.watch, w: o.clipW || 20, h: o.clipH || 26, lines: o.lines }); R(g, cx - 4, cy - 2, 5, 4, SCI.skin); }
    return P;
  };

  // ================= speed_chart =================
  // o.pred (1.0) PREDICTED bar grows up to 24% FASTER; o.actual (6.5) ACTUAL drops to 19% SLOWER (thud + dust);
  // o.belief (null) purple dashed BELIEVED AFTER bar up to 20% FASTER; o.state "all" = PREDICTED + ACTUAL already shown at t = 0
  K.speed_chart = (o) => (g, t, d, c) => {
    const all = o.state === "all";
    const pred = all ? -10 : T(o, "pred", 1.0, d, 13), act = all ? -10 : T(o, "actual", 6.5, d, 13);
    const bel = o.belief === undefined || o.belief === null ? null : o.belief;
    const SX = 112, SY = 34, SW = 376, SH = 198, ZY = 140, SC = 2.7;
    const thud = shake(t, act + 0.3, 0.5, 3);
    // ---- far: lab wall, window with the city, shelves of glowing flasks ----
    PX.par(g, c, 0.35, () => {
      PX.vgrad(g, -40, -30, 720, 300, "161a34", "0e1124", 8);
      for (let x = -40; x < 680; x += 40) R(g, x, -30, 1, 300, "#141830");
      R(g, -14, 40, 110, 156, "#0a0c18"); PX.core.skyline(g, -10, 44, 102, 148, t, 12);
      R(g, 40, 44, 2, 148, "#22263c"); R(g, -10, 116, 102, 2, "#22263c"); R(g, -16, 194, 114, 4, "#2a2e48"); R(g, -16, 194, 114, 1, "#4a4e6a");
      // rain streaks on the window
      LB.rain(g, t, 77, 18, [-10, 44, 102, 148], { a: 0.35, len: 5, vy: 200, vx: -20 });
      // shelf with flasks (right)
      R(g, 512, 92, 140, 4, "#3a3048"); R(g, 512, 92, 140, 1, "#5a4e6a");
      const FL = [[522, "#3df56b"], [540, "#f25ca8"], [560, "#5fe3e8"], [584, "#f7c948"], [606, "#8a5cf6"]];
      FL.forEach(([fx, col], i) => {
        const fh = 10 + (i % 3) * 4; R(g, fx, 92 - fh, 10, fh, "#2a3448"); R(g, fx + 3, 92 - fh - 5, 4, 5, "#3a4458");
        R(g, fx + 1, 92 - fh * 0.6, 8, fh * 0.6 - 1, sh(col, 0.75)); R(g, fx + 1, 92 - fh * 0.6, 8, 1, col); R(g, fx, 92 - fh, 1, fh, "#6a7a98");
        G(g, fx + 5, 88, 16, col, 0.3 + 0.1 * Math.sin(t * 2 + i));
      });
      // server rack in the corner
      R(g, 566, 110, 70, 150, "#0c0e18"); R(g, 566, 110, 70, 1, "#3a3e52"); R(g, 566, 110, 1, 150, "#2a2e44");
      for (let k = 0; k < 9; k++) { R(g, 570, 116 + k * 15, 62, 12, "#151826"); R(g, 570, 116 + k * 15, 62, 1, "#262a3e");
        for (let l = 0; l < 4; l++) if (PX.blink(t + k * 0.37 + l * 0.61, 0.6 + ((k + l) % 4) * 0.35, 0.5)) R(g, 574 + l * 5, 121 + k * 15, 2, 2, (k + l) % 3 ? "#3df56b" : "#f7c948"); }
      // poster: grid of coloured squares (generic periodic-table look)
      R(g, 500, 132, 56, 40, "#1c2038"); for (let yy = 0; yy < 5; yy++) for (let xx = 0; xx < 8; xx++) if (!(yy === 0 && xx > 0 && xx < 7)) R(g, 503 + xx * 6.5, 135 + yy * 7, 5, 5, ["#3a5a8a", "#5a3a7a", "#3a7a5a", "#7a5a3a"][(xx + yy * 3) % 4]);
    });
    // ---- floor ----
    PX.vgrad(g, -40, 250, 720, 120, "1a1e36", "242a48", 5);
    R(g, -40, 250, 720, 2, "#2c3250");
    for (let k = 0; k < 6; k++) R(g, -40, 250 + Math.round(Math.pow(k / 6, 1.5) * 110), 720, 1, "#1e2440");
    for (let k = -10; k <= 10; k++) PX.line(g, 320 + k * 34, 252, 320 + k * 96, 360, "#20263f");
    // ---- mid: the big wall screen ----
    PX.par(g, c, 0.7, () => {
      g.save(); g.translate(thud, Math.abs(thud) > 1 ? 1 : 0);
      G(g, SX + SW / 2, SY + SH / 2, 300, "rgba(70,120,220,0.18)", 1);
      R(g, SX - 8, SY - 8, SW + 16, SH + 16, "#0a0b12"); R(g, SX - 8, SY - 8, SW + 16, 1, "#4a4f68"); R(g, SX - 8, SY - 8, 1, SH + 16, "#30344a"); R(g, SX + SW + 7, SY - 8, 1, SH + 16, "#1a1c28");
      R(g, SX + SW / 2 - 10, SY + SH + 8, 20, 3, "#1a1c28"); R(g, SX + SW - 20, SY + SH + 2, 3, 3, PX.blink(t, 2, 0.9) ? "#3df56b" : "#1a4a2a");
      PX.vgrad(g, SX, SY, SW, SH, "0e1630", "0a1024", 6);
      for (let x = SX + 16; x < SX + SW; x += 24) R(g, x, SY, 1, SH, "#121c3a");
      for (let y = ZY - 96; y < SY + SH; y += 16) if (y > SY) R(g, SX, y, SW, 1, "#121c3a");
      // header strip
      R(g, SX, SY, SW, 12, "#121a36"); R(g, SX + 4, SY + 4, 4, 4, "#ff5c5c"); R(g, SX + 10, SY + 4, 4, 4, "#f7c948"); R(g, SX + 16, SY + 4, 4, 4, "#3df56b");
      PX.text(g, "STUDY RESULTS", SX + SW - 6, SY + 1, { font: "v", size: 12, col: "#5a6a9a", align: "right" });
      // zero line
      R(g, SX + 8, ZY, SW - 16, 2, "#c8d4f0"); R(g, SX + 8, ZY + 2, SW - 16, 1, "#4a5a8a"); G(g, SX + SW / 2, ZY, 160, "rgba(200,212,240,0.12)", 1);
      R(g, SX + 8, ZY - 3, 2, 8, "#c8d4f0"); R(g, SX + SW - 10, ZY - 3, 2, 8, "#c8d4f0");
      const slots = bel !== null ? [208, 300, 392] : [248, 352], BW = 52;
      const bar = (x, v, col, dk, k, o2) => {   // v in %, + = up (faster); k = 0..1 grow
        const L = Math.round(Math.abs(v) * SC * k), up = v > 0;
        if (L <= 0) return;
        const y0 = up ? ZY - L : ZY + 3, x0 = x - BW / 2;
        if (o2 && o2.dashed) {
          for (let yy = 0; yy < L; yy++) { const on = Math.floor((yy + t * 12) / 4) % 2 === 0; R(g, x0, y0 + yy, 2, 1, on ? col : "rgba(0,0,0,0)"); R(g, x0 + BW - 2, y0 + yy, 2, 1, on ? col : "rgba(0,0,0,0)"); }
          for (let xx = 0; xx < BW; xx++) { const on = Math.floor(xx / 4) % 2 === 0; if (on) { R(g, x0 + xx, up ? y0 : y0 + L - 2, 1, 2, col); } }
          PX.alpha(g, 0.22 + 0.08 * Math.sin(t * 5), () => R(g, x0 + 2, y0, BW - 4, L, col));
          G(g, x, up ? y0 : y0 + L, 50, col, 0.35);
          return;
        }
        R(g, x0, y0, BW, L, col); R(g, x0, y0, 3, L, sh(col, 1.3)); R(g, x0 + BW - 4, y0, 4, L, dk);
        for (let yy = y0 + 3; yy < y0 + L; yy += 4) R(g, x0 + 4, yy, BW - 9, 1, sh(col, 0.88));
        R(g, x0, up ? y0 : y0 + L - 2, BW, 2, sh(col, 1.45));
        G(g, x, up ? y0 + 4 : y0 + L - 4, 70, col, 0.45);
      };
      const lab2 = (x, y, big, small, col, a, smallFirst) => PX.alpha(g, a, () => {
        if (smallFirst) { PX.otext(g, small, x, y, { size: 8, col, align: "center" }); PX.otext(g, big, x, y + 11, { size: 16, col, align: "center" }); }
        else { PX.otext(g, big, x, y, { size: 16, col, align: "center" }); PX.otext(g, small, x, y + 19, { size: 8, col, align: "center" }); }
      });
      // PREDICTED (up, cyan)
      const kp = all ? 1 : PX.p(t, pred, 1.4, "back");
      if (t >= pred) {
        bar(slots[0], 24, "#2a9cb0", "#17586a", kp);
        const top = ZY - Math.round(24 * SC * Math.min(kp, 1));
        PX.otext(g, "PREDICTED", slots[0], ZY + 8, { size: 8, col: "#8ae8f0", align: "center" });
        if (all || t > pred + 1.2) lab2(slots[0], top - 32, "24%", "FASTER", "#5fe3e8", all ? 1 : pop(t, pred + 1.2, 0.3), true);
      }
      // ACTUAL (down, red) - slams in with a thud
      if (t < act && t > act - 1.6 && !all) { if (PX.blink(t, 0.4)) PX.text(g, "...", slots[1], ZY + 10, { size: 8, col: "#ff8a8a", align: "center" }); }
      if (t >= act) {
        const ka = all ? 1 : t < act + 0.3 ? PX.ease((t - act) / 0.3, "in") : 1 - 0.08 * Math.sin(cl((t - act - 0.3) / 0.3, 0, 1) * Math.PI);
        bar(slots[1], -19, "#c43232", "#6e161c", ka);
        const bot2 = ZY + 3 + Math.round(19 * SC * ka);
        PX.otext(g, "ACTUAL", slots[1], ZY - 12, { size: 8, col: "#ff9a9a", align: "center" });
        if (all || t > act + 0.45) lab2(slots[1], bot2 + 4, "19%", "SLOWER", "#ff5c5c", all ? 1 : pop(t, act + 0.45, 0.3));
        // dust puff + debris at the impact
        if (!all && t > act + 0.28 && t < act + 1.8) {
          const k = (t - act - 0.28) / 1.5, r = PX.rnd(17);
          for (let i = 0; i < 18; i++) { const vx = (r() - 0.5) * 90, vy = -20 - r() * 50, sz = r() < 0.3 ? 2 : 1;
            PX.alpha(g, (1 - k) * 0.9, () => R(g, slots[1] + vx * k * 1.2, bot2 + vy * k + 70 * k * k, sz, sz, i % 3 ? "#ffb0a0" : "#c8c0b8")); }
          for (let i = 0; i < 6; i++) { const s = i < 3 ? -1 : 1, kk = PX.ease(k, "out"); PX.alpha(g, (1 - k) * 0.5, () => PX.circle(g, slots[1] + s * (20 + kk * 30 + (i % 3) * 8), bot2 - 2 - (i % 3) * 3, 3 + Math.round(kk * 4), "#8a8090")); }
          PX.alpha(g, cl(1 - k * 3, 0, 1), () => G(g, slots[1], bot2, 90, "rgba(255,90,90,0.6)", 1));
        }
      }
      // BELIEVED AFTER (ghost purple dashed, up)
      if (bel !== null && t >= bel) {
        const kb = PX.p(t, bel, 1.6, "out");
        PX.alpha(g, 0.85 + 0.15 * Math.sin(t * 9), () => bar(slots[2], 20, "#a77cff", "#5a3ab0", kb, { dashed: true }));
        PX.otext(g, "BELIEVED", slots[2], ZY + 8, { size: 8, col: "#c4a8ff", align: "center" }); PX.otext(g, "AFTER", slots[2], ZY + 19, { size: 8, col: "#c4a8ff", align: "center" });
        if (t > bel + 1.4) lab2(slots[2], ZY - Math.round(20 * SC * kb) - 32, "20%", "FASTER", "#c4a8ff", pop(t, bel + 1.4, 0.3), true);
      }
      // screen scanline sweep + glass glare
      const sy = SY + ((t * 40) % SH); PX.alpha(g, 0.12, () => R(g, SX, sy, SW, 2, "#9ab8ff"));
      PX.alpha(g, 0.06, () => { for (let k = 0; k < 40; k++) R(g, SX + SW - 120 + k, SY, 30, SH - k * 3 > 0 ? 3 : 0, "#ffffff"); });
      g.restore();
    });
    // ---- the scientist (right of the screen) ----
    const sx = 548, sy = 342, SH2 = 1.22;
    let face = "neutral", brows = 0, look = -1;
    const pointPred = !all && t > pred - 0.2 && t < pred + 2.6, pointAct = !all && t > act + 0.2 && t < act + 1.2;
    if (t > pred + 0.6) face = "happy";
    if (t > act - 1.2) face = "neutral";
    if (t > act + 0.25) { face = "shock"; brows = 2; }
    if (t > act + 2.6) { face = "sweat"; brows = 1; }
    if (all) { face = "sweat"; brows = 1; }
    const writing = !all && t > pred + 2.8 && t < act - 1.4;
    const lean = pointPred ? PX.p(t, pred - 0.2, 0.4, "back") * (t > pred + 2.2 ? 1 - PX.p(t, pred + 2.2, 0.4) : 1) : 0;
    const jump = !all && t > act + 0.25 && t < act + 0.55 ? -Math.round(Math.sin(((t - act - 0.25) / 0.3) * Math.PI) * 4) : 0;
    const hs = (dx, dy) => [sx + dx * SH2, sy + dy * SH2];
    const handsS = { l: hs(-26 - lean * 24, -66 - lean * 22), r: hs(12, -52) };
    if (writing) handsS.l = hs(-2 + Math.round(Math.sin(t * 9) * 3), -56 + Math.round(Math.sin(t * 4.3)));
    if (t > act + 0.25 && !all) handsS.l = hs(-22, -82 + jump);   // hand flies up in surprise
    if (t > act + 3.6 && !all) handsS.l = hs(-6, -94 + Math.round(Math.sin(t * 8) * 1));   // scratches head
    ell(g, sx, sy, 26, 4, "rgba(0,0,0,0.45)");
    const P = scientist(g, sx, sy + jump, t, { h: 122, face, brows, look, hands: handsS, clip: true, clipW: 24, clipH: 30, lines: writing ? 1 + Math.floor((t - pred - 2.8) * 2) : 99, bob: Math.round(Math.sin(t * 1.6) * 0.6) });
    // pointer stick toward the active bar
    if (lean > 0.05) { const [hx2, hy2] = P.hl, tx = lerp(hx2, 330, lean * 0.6), ty = lerp(hy2, ZY - 50, lean * 0.6); PX.line(g, hx2, hy2, tx, ty, "#d8d0c0"); R(g, tx - 1, ty - 1, 2, 2, "#ff5c5c"); }
    if (face === "sweat") LB.sweat(g, P.hx + 4, P.hy + 4, t, 2, 9);
    if (face === "shock" && t < act + 1.4) { for (let k = 0; k < 3; k++) R(g, P.hx - 14 + k * 12, P.hy - 10 - (k === 1 ? 4 : 0), 2, 6, "#f7c948"); }
    // screen light on the scientist (left side)
    G(g, sx - 30, sy - 70, 70, "rgba(90,150,255,0.18)", 1);
    // ---- foreground: lab bench with bubbling flasks, microscope ----
    PX.par(g, c, 1.15, () => {
      const by = 304;
      R(g, -40, by, 330, 8, "#3a3e52"); R(g, -40, by, 330, 1, "#7a80a0"); R(g, -40, by + 8, 330, 60, "#16182a"); R(g, -40, by + 8, 330, 2, "#0c0d18");
      for (let x = 20; x < 290; x += 90) { R(g, x, by + 14, 70, 40, "#1c1f34"); R(g, x, by + 14, 70, 1, "#2a2e48"); R(g, x + 30, by + 30, 10, 2, "#5a6078"); }
      // flasks
      const fl = (fx, col, s) => {
        const fy = by;
        for (let r = 0; r < 18 * s; r++) { const w = r < 7 * s ? 4 * s : Math.round(4 * s + (r - 7 * s) * 0.9); R(g, fx - w / 2, fy - 18 * s + r, w, 1, r < 7 * s ? "#3a4a68" : r > 10 * s ? sh(col, 0.75) : "#2a3450"); }
        R(g, fx - 3 * s, fy - 20 * s, 6 * s, 2, "#7a8aa8"); R(g, fx - 5 * s, fy - 8 * s, 1, 7 * s, sh(col, 1.3));
        G(g, fx, fy - 5 * s, 22 * s, col, 0.45 + 0.1 * Math.sin(t * 3 + fx));
        for (let i = 0; i < 4; i++) { const k = frac(t * 0.8 + i / 4 + fx * 0.01); PX.alpha(g, 1 - k, () => R(g, fx - 2 + Math.round(Math.sin(k * 9 + i) * 2), fy - 6 * s - k * 20 * s, k > 0.6 ? 2 : 1, k > 0.6 ? 2 : 1, sh(col, 1.4))); }
      };
      fl(40, "#3df56b", 1.2); fl(78, "#f25ca8", 1); fl(110, "#5fe3e8", 1.4);
      // test-tube rack
      R(g, 140, by - 6, 44, 6, "#5a4636"); R(g, 140, by - 6, 44, 1, "#8a6a4e");
      ["#f7c948", "#3df56b", "#f25ca8", "#5fe3e8", "#8a5cf6"].forEach((col, i) => { R(g, 144 + i * 8, by - 20, 4, 16, "#3a4a68"); R(g, 144 + i * 8, by - 12, 4, 8, col); R(g, 144 + i * 8, by - 20, 1, 16, "#8a9ab8"); });
      // microscope
      R(g, 210, by - 4, 30, 4, "#2a2e40"); R(g, 230, by - 34, 6, 30, "#3a3e52"); R(g, 218, by - 40, 8, 26, "#4a4f6a"); R(g, 218, by - 40, 2, 26, "#7a80a0"); R(g, 216, by - 44, 12, 4, "#2a2e40"); R(g, 214, by - 16, 22, 3, "#3a3e52");
      G(g, 222, by - 12, 14, "rgba(255,240,200,0.5)", 1);
      // desk lamp warm pool
      R(g, 262, by - 3, 14, 3, "#2a2c3a"); limb(g, 268, by - 3, 258, by - 34, 2, "#4a4e64"); limb(g, 258, by - 34, 276, by - 44, 2, "#4a4e64"); R(g, 270, by - 48, 14, 6, "#3a3e52"); R(g, 272, by - 42, 10, 1, "#ffe2a8");
      G(g, 276, by - 30, 60, "rgba(255,190,110,0.45)", 1);
    });
    PX.particles(g, 41, 30, t, [100, 30, 420, 220], { vy: -3, vx: 2, col: "#b8c8ff", a: 0.4 });
    PX.vignette(g, 0.55);
  };

  // ================= survey =================
  // o.ask (0.2) "HOW DID IT GO?" bubble; o.answer (1.8) dev grins, thumbs up, "WAY FASTER!"
  const bubble = (g, x, y, txt, tx, ty, k, o) => {   // centre-top (x, y), tail tip (tx, ty), pop k
    o = o || {}; if (k <= 0) return;
    const sz = o.size || 8, w = Math.round(PX.tw(g, txt, { size: sz }) + 18), h = sz + 14, fill = o.fill || "#c4ccd8", edge = o.edge || "#1a1c2c";
    const s = Math.min(1, k), ww = Math.round(w * s), hh = Math.round(h * s), x0 = Math.round(x - ww / 2), y0 = Math.round(y + (h - hh) / 2);
    // tail
    const bx = lerp(x0 + 8, x0 + ww - 8, cl((tx - x0) / ww, 0, 1));
    for (let i = 0; i < 9; i++) { const k2 = i / 9, cx = lerp(bx, tx, k2), cy = lerp(y0 + hh - 1, ty, k2), w2 = Math.round(6 * (1 - k2)) + 1; R(g, cx - w2 / 2 - 1, cy, w2 + 2, 2, edge); }
    for (let i = 0; i < 8; i++) { const k2 = i / 9, cx = lerp(bx, tx, k2), cy = lerp(y0 + hh - 1, ty, k2), w2 = Math.round(6 * (1 - k2)); if (w2 > 0) R(g, cx - w2 / 2, cy, w2, 1, fill); }
    R(g, x0 + 2, y0 - 1, ww - 4, hh + 2, edge); R(g, x0 - 1, y0 + 2, ww + 2, hh - 4, edge); R(g, x0, y0 + 1, ww, hh - 2, edge);
    R(g, x0 + 2, y0, ww - 4, hh, fill); R(g, x0, y0 + 2, ww, hh - 4, fill); R(g, x0 + 1, y0 + 1, ww - 2, hh - 2, fill);
    R(g, x0 + 2, y0 + hh - 2, ww - 4, 1, sh(fill, 0.82)); R(g, x0 + 3, y0 + 1, ww - 8, 1, "#ffffff");
    if (k >= 0.9) PX.text(g, txt, x, y0 + 7, { size: sz, col: o.col || "#1a1c2c", align: "center" });
  };
  const thumb = (g, x, y, skin) => PX.sprite(g, ["..kk...", ".kssk..", ".kssk..", ".kssk..", "kkssskk", "ksssssk", "ksssssk", "kdssssk", "kdssssk", ".kdddk."], x - 3, y - 9, { s: skin, d: sh(skin, 0.75), k: "#1a1016" });
  K.survey = (o) => (g, t, d, c) => {
    const ask = T(o, "ask", 0.2, d, 4.0), ans = T(o, "answer", 1.8, d, 4.0);
    // ---- far: the hackathon loft, other desks still working ----
    hall(g, t, c, 0.3);
    for (let j = 0; j < 8; j++) station(g, j, t, 1, {});
    PX.alpha(g, 0.4, () => R(g, -40, -40, 720, 440, "#070818"));
    // ---- foreground desk (right) ----
    const DY = 268, D = DEVS[12];
    const got = t >= ans, gk = pop(t, ans, 0.35);
    // monitor (angled toward the dev) + glow
    const mx = 520, my = 170, mw = 84, mh = 62;
    G(g, mx + 30, my + 30, 150, "rgba(90,170,255,0.32)", 1);
    R(g, mx + mw / 2 - 2, my + mh, 5, DY - (my + mh), "#2a2c3a"); R(g, mx + mw / 2 - 14, DY - 2, 28, 3, "#3a3e52");
    for (let u = 0; u < mw; u++) { const k = u / mw, top = my + Math.round(k * 6), hh = Math.round(mh - k * 12); R(g, mx + u, top - 3, 1, hh + 6, u < 3 ? "#4a4e64" : "#1a1c28"); }
    for (let u = 3; u < mw - 2; u++) { const k = u / mw, top = my + Math.round(k * 6), hh = Math.round(mh - k * 12); R(g, mx + u, top, 1, hh, "#0d1424"); }
    for (let l = 0; l < 13; l++) {
      const r2 = hr(500 + l + Math.floor(t * 3)), ind = Math.floor(r2() * 3), len = 0.3 + r2() * 0.5, col = CODEC[Math.floor(r2() * CODEC.length)];
      for (let u = 8 + ind * 5; u < 8 + ind * 5 + len * (mw - 20); u++) { if ((u * 5 + l) % 7 === 0) continue; const k = u / mw, top = my + Math.round(k * 6), hh = mh - k * 12; R(g, mx + u, top + Math.round(((l + 1) / 14.5) * hh), 1, 1, col); }
    }
    // the dev (seated): types, then turns, grins, thumbs up
    const typ = !got, tp = typ ? Math.round(Math.sin(t * 19)) : 0;
    const hands = got ? { l: [418, DY - 6], r: [480 + Math.round((1 - gk) * -24), DY - 40 - Math.round(gk * 8)] } : { l: [420, DY - 4 + tp], r: [452, DY - 4 - tp] };
    const P = person(g, 432, DY + 8 + (got ? -Math.round(gk * 2) : 0), { h: 112, seated: true, noLegs: true, skin: D.skin, hair: D.hair, hairStyle: D.hs, shirt: D.shirt,
      face: got ? "happy" : t > ask + 0.4 ? "neutral" : "focus", look: got ? -2 : 2, lit: 1, hands });
    extras(g, P, D.e, { look: got ? -2 : 2 });
    if (got) { thumb(g, P.hr[0], P.hr[1] - 2, D.skin); if (t < ans + 0.6) PX.alpha(g, 1 - (t - ans) / 0.6, () => { for (let k = 0; k < 4; k++) LB.star4(g, P.hr[0] + [-10, 10, -6, 12][k], P.hr[1] - 12 - [0, 4, 12, 14][k] - (t - ans) * 20, 2, "#f7c948"); }); }
    PX.alpha(g, 0.35, () => R(g, P.hx + P.hw / 2, P.hy + 4, 1, P.hh - 8, "#9fe8ff"));
    // desk top + front
    R(g, 300, DY, 360, 14, "#5a4636"); R(g, 300, DY, 360, 1, "#8a6a4e"); R(g, 300, DY + 6, 360, 1, "#52402f");
    G(g, 540, DY + 6, 70, "rgba(110,170,255,0.3)", 1);
    R(g, 300, DY + 14, 360, 3, "#2a2018"); R(g, 300, DY + 17, 360, 60, "#23253a"); R(g, 300, DY + 17, 2, 60, "#3a3e5a");
    R(g, 560, DY + 20, 60, 50, "#2c2f46"); R(g, 560, DY + 20, 1, 50, "#3e4260"); for (let k = 1; k < 3; k++) R(g, 560, DY + 20 + k * 16, 60, 1, "#1c1e30");
    R(g, 586, DY + 26, 8, 2, "#5a6078"); R(g, 586, DY + 42, 8, 2, "#5a6078");
    // keyboard, mouse, mug, sticky notes
    R(g, 404, DY + 2, 60, 6, "#1e2030"); R(g, 404, DY + 2, 60, 1, "#6aa0d0"); for (let k = 0; k < 9; k++) R(g, 407 + k * 6, DY + 4, 4, 2, "#4a5068");
    R(g, 476, DY + 4, 7, 5, "#3a3e52"); R(g, 476, DY + 4, 7, 1, "#6a7090");
    mug(g, 354, DY + 6, t, "#e0b040");
    R(g, 606, my + 8, 10, 10, "#f7c948"); R(g, 606, my + 8, 10, 1, "#fff0a0"); R(g, 608, my + 11, 6, 1, "#8a6a1a"); R(g, 608, my + 14, 4, 1, "#8a6a1a");
    plant(g, 630, DY + 2, t, 1.1);
    // ---- the scientist (left) holding the clipboard up: big red stopwatch drawing ----
    const sx = 196, sy = 356, hsc = 136 / 100;
    const look2 = got && t > ans + 0.5 ? -1 : 2, flat = got && t > ans + 0.5;
    const raise = PX.p(t, ask, 0.4, "back");
    const hands2 = { l: [sx - 17, sy - 70 - raise * 4], r: [sx + 17, sy - 70 - raise * 4] };
    ell(g, sx, sy, 30, 5, "rgba(0,0,0,0.45)");
    const S = scientist(g, sx, sy, t, { h: 136, coat: "#6a7488", face: flat ? "flat" : "neutral", look: look2, hands: hands2, lit: 1, bob: Math.round(Math.sin(t * 1.6) * 0.6) });
    if (flat) { R(g, S.hx + 3 + look2, S.ey - 6, 6, 1, "#1a1218"); }   // one eyebrow up
    const cx = sx, cy = sy - 70 - raise * 4 - 28;
    clipboard(g, cx, cy, { w: 40, h: 50, watch: true });
    // stopwatch pulse once the answer is in
    if (got && t > ans + 0.6) { const pk = 0.5 + 0.5 * Math.sin((t - ans) * 7); G(g, cx, cy + 28, 34, "rgba(255,70,70,0.5)", pk); }
    R(g, hands2.l[0] - 3, hands2.l[1] - 3, 6, 6, SCI.skin); R(g, hands2.r[0] - 3, hands2.r[1] - 3, 6, 6, SCI.skin);
    // light from the dev's monitor on the scientist's right side
    G(g, sx + 40, sy - 110, 60, "rgba(90,150,255,0.15)", 1);
    // ---- speech bubbles ----
    bubble(g, 170, 168, "HOW DID IT GO?", 192, 212, pop(t, ask, 0.3), {});
    if (got) bubble(g, 440, 140, "WAY FASTER!", 436, 196, gk, { size: 16, fill: "#c8dcb4", col: "#14481f" });
    PX.particles(g, 51, 24, t, [0, 40, 640, 260], { vy: -2, vx: 1.5, col: "#c8d8ff", a: 0.4 });
    PX.vignette(g, 0.55);
  };

  // ================= compass =================
  // o.wobble (3.0) needle shakes; hiker walks toward the cliff path until then, taps the compass, walks on
  const pine = (g, x, base, h, col, hl) => {
    const w = Math.round(h * 0.42);
    R(g, x - 1, base - Math.round(h * 0.18), 3, Math.round(h * 0.18), sh(col, 0.8));
    for (let r = 0; r < h * 0.86; r++) {
      const k = r / (h * 0.86), tier = (k * 4) % 1, ww = Math.round(w * (0.2 + 0.8 * k) * (0.7 + 0.3 * tier));
      R(g, x - ww, base - Math.round(h * 0.16) - Math.round(h * 0.86) + r, ww * 2 + 1, 1, col);
      if (hl && ww > 1) R(g, x + ww - 1, base - Math.round(h * 0.16) - Math.round(h * 0.86) + r, 1, 1, hl);
    }
  };
  const fog = (g, t, y, h, col, a, sp, seed) => {
    const r = PX.rnd(seed);
    for (let i = 0; i < 9; i++) {
      const w = 120 + r() * 160, x = ((r() * 900 + t * sp * (0.6 + r() * 0.6)) % 900) - 160, yy = y + r() * h, hh = 6 + r() * 10;
      PX.alpha(g, a * (0.6 + 0.4 * Math.sin(t * 0.7 + i)), () => ell(g, x, yy, Math.round(w / 2), Math.round(hh / 2), col));
    }
  };
  K.compass = (o) => (g, t, d, c) => {
    const wob = T(o, "wobble", 3.0, d, 6.0);
    const HZ = 196;
    const edgeX = (y) => 446 + (y - HZ) * 0.26 + Math.round(Math.sin(y * 0.7) * 1.5 + Math.sin(y * 0.23) * 3);
    // ---- sky: dusk ----
    PX.par(g, c, 0.15, () => {
      PX.vgrad(g, -40, -30, 720, 120, "1c1a40", "4a2f5e", 6); PX.vgrad(g, -40, 90, 720, 120, "4a2f5e", "c4686a", 6); PX.vgrad(g, -40, 200, 720, 170, "c4686a", "e89a6a", 5);
      const r = PX.rnd(61); for (let i = 0; i < 30; i++) { const x = r() * 680 - 20, y = r() * 90; g.globalAlpha = (0.3 + 0.6 * Math.abs(Math.sin(t * 1.3 + i))) * (1 - y / 100); R(g, x, y, 1, 1, "#fff"); } g.globalAlpha = 1;
      PX.circle(g, 560, 214, 16, "#ffd8a0"); G(g, 560, 214, 140, "rgba(255,170,110,0.5)", 1); G(g, 560, 214, 40, "rgba(255,230,180,0.6)", 1);
      // distant mountains in the valley beyond the cliff
      for (let x = 380; x < 700; x++) { const h = 30 + Math.sin(x * 0.03) * 12 + Math.sin(x * 0.11) * 5; R(g, x, 236 - h, 1, h + 140, "#6a4a6a"); R(g, x, 236 - h, 1, 1, "#b07a80"); }
      for (let x = 400; x < 700; x++) { const h = 16 + Math.sin(x * 0.05 + 2) * 8; R(g, x, 262 - h, 1, h + 120, "#5a3e5e"); }
      // birds
      for (let i = 0; i < 4; i++) { const bx = ((i * 140 + t * (18 + i * 4)) % 760) - 60, by = 50 + i * 14 + Math.sin(t * 2 + i) * 3, f = Math.sin(t * 9 + i) > 0; R(g, bx, by, 1, 1, "#1a1428"); R(g, bx - 2, by + (f ? -1 : 1), 2, 1, "#1a1428"); R(g, bx + 1, by + (f ? -1 : 1), 2, 1, "#1a1428"); }
    });
    // ---- valley mist below the cliff ----
    PX.par(g, c, 0.25, () => { fog(g, t, 230, 120, "#e8b8a8", 0.35, 6, 3); PX.vgrad(g, 380, 280, 300, 90, "c88a88", "a0707a", 4); fog(g, t, 270, 80, "#f0c8b8", 0.4, 9, 4); });
    // ---- far forest (left) ----
    PX.par(g, c, 0.35, () => {
      for (let i = 0; i < 26; i++) { const x = -30 + i * 19 + ((i * 37) % 11); if (x > edgeX(HZ) - 20) continue; pine(g, x, HZ + 6, 50 + ((i * 53) % 30), "#3a2a4e"); }
      fog(g, t, HZ - 20, 30, "#c890a0", 0.3, 5, 5);
    });
    PX.par(g, c, 0.55, () => {
      for (let i = 0; i < 16; i++) { const x = -40 + i * 30 + ((i * 29) % 13); if (x > edgeX(HZ) - 40) continue; pine(g, x, HZ + 22, 76 + ((i * 41) % 34), "#2a2040", "#5a3a5a"); }
      fog(g, t, HZ, 30, "#b88aa0", 0.35, 8, 6);
    });
    // ---- ground (ends at the cliff edge) ----
    const GA = [58, 44, 78], GB = [26, 32, 46];
    for (let y = HZ; y < 360; y++) { const k = Math.pow((y - HZ) / 164, 0.6), ex = Math.round(edgeX(y)), q = (v) => Math.round(lerp(GA[v], GB[v], k) + (((y >> 1) + (y % 3)) % 2 ? 0 : -2));
      R(g, -40, y, ex + 40, 1, `rgb(${q(0)},${q(1)},${q(2)})`); R(g, ex - 3, y, 3, 1, "#5a4250"); R(g, ex, y, 2 + Math.round(((y * 7) % 5) / 2), 1, "#1a1424"); }
    // ground mist at the forest line + dark bushes + rocks
    fog(g, t, HZ - 4, 14, "#9a7a9a", 0.35, 6, 13);
    for (let i = 0; i < 14; i++) { const r = hr(i + 600), bx = r() * 420 - 20, byy = HZ + 6 + r() * 14, br = 6 + r() * 7; PX.circle(g, bx, byy, br, "#241e36"); PX.circle(g, bx - 2, byy - 2, Math.max(1, br - 3), "#2c2440"); R(g, bx - br / 2, byy - br + 1, br, 1, "#4a3a5a"); }
    for (const [rx, ry, rw] of [[120, 262, 14], [420, 256, 10], [60, 345, 20], [400, 340, 16], [210, 282, 8]]) { ell(g, rx, ry, rw, Math.round(rw * 0.55), "#3a3448"); ell(g, rx - 2, ry - 2, rw - 4, Math.round(rw * 0.35), "#4e4660"); R(g, rx + rw - 5, ry - 3, 3, 2, "#b07a7a"); }
    // rock face below the edge
    for (let y = 270; y < 360; y++) { const ex = Math.round(edgeX(y)), w = 16 + ((y * 13) % 9); R(g, ex, y, w, 1, (y >> 2) % 2 ? "#3a2a3a" : "#30222e"); R(g, ex + w - 1, y, 1, 1, "#d08a7a"); R(g, ex + 2, y, 1, 1, "#4a3646"); }
    // grass tufts
    const rg = PX.rnd(71);
    for (let i = 0; i < 70; i++) { const y = HZ + 6 + Math.pow(rg(), 0.7) * 154, x = rg() * (edgeX(y) + 20) - 30, s = 1 + Math.round((y - HZ) / 60), sw = Math.round(Math.sin(t * 2 + i) * 0.6);
      R(g, x + sw, y - 2 * s, 1, 2 * s, "#3a4a52"); R(g, x + 2 + sw, y - 3 * s, 1, 3 * s, "#46585e"); R(g, x + 4, y - 2 * s, 1, 2 * s, "#3a4a52"); }
    // paths: main path from the left to the fork; the real road winds up-left into the forest; the "fast" path runs to the cliff
    const PY = 312;
    for (let y = 296; y < 330; y++) { const k = (y - 296) / 34, w = 1; R(g, -40, y, 352 + k * 30, w, y < 300 || y > 326 ? "#5a4636" : "#6a5442"); }
    for (let y = 298; y < 326; y++) R(g, 312, y, edgeX(y) - 312, 1, y < 301 || y > 323 ? "#5a4636" : "#6e5644");
    for (let i = 0; i < 40; i++) { const k = i / 40, y = 300 - k * 100, x = 330 - Math.sin(k * 3.2) * 80 - k * 60, w = Math.round(30 * (1 - k * 0.8)); R(g, x - w / 2, y, w, 3, i % 2 ? "#5e4a3a" : "#5a4636"); }
    for (let i = 0; i < 26; i++) { const r = hr(i + 300); R(g, r() * 460 - 20, 300 + r() * 26, 2, 1, "#8a7058"); }
    // pebbles tumbling off the edge
    for (let i = 0; i < 3; i++) { const k = frac(t * 0.4 + i / 3); R(g, edgeX(PY) + 4 + k * 10, PY + k * k * 60, 2, 2, "#6a5442"); }
    // ---- signpost at the fork, lantern, crow ----
    const sx = 352, sb = 300;
    R(g, sx - 3, sb - 92, 6, 92, "#5a3e2a"); R(g, sx - 3, sb - 92, 2, 92, "#7a5a3c"); R(g, sx + 2, sb - 92, 1, 92, "#3a2618");
    ell(g, sx, sb, 12, 2, "rgba(0,0,0,0.4)");
    const sign = (y, dir, txt, col) => {   // dir = 1 points right
      const w = PX.tw(g, txt, { size: 8 }) + 22, x0 = dir > 0 ? sx - 6 : sx + 6 - w, h = 15;
      R(g, x0, y, w, h, "#7a5a3c"); R(g, x0, y, w, 1, "#a88058"); R(g, x0, y + h - 1, w, 1, "#4a3220");
      for (let k = 0; k < 8; k++) { const tipX = dir > 0 ? x0 + w + k : x0 - 1 - k; R(g, tipX, y + k, 1, h - 2 * k, "#7a5a3c"); }
      R(g, dir > 0 ? x0 + 3 : x0 + w - 6, y + 6, 2, 2, "#3a2618");
      PX.text(g, txt, dir > 0 ? x0 + 8 : x0 + 12, y + 4, { size: 8, col });
    };
    sign(sb - 86, 1, "FASTER", "#ffe08a");
    sign(sb - 66, -1, "SLOWER", "#d8d0c0");
    // arrow glyphs
    PX.text(g, ">", sx + 80, sb - 82, { size: 8, col: "#ffe08a" }); PX.text(g, "<", sx - 86, sb - 62, { size: 8, col: "#d8d0c0" });
    G(g, sx + 40, sb - 80, 50, "rgba(255,210,120,0.25)", 1);
    // lantern hanging under the signs
    R(g, sx + 3, sb - 50, 8, 1, "#3a2618"); R(g, sx + 9, sb - 50, 1, 6, "#2a2a36");
    const fl = 0.85 + 0.15 * Math.sin(t * 11) * Math.sin(t * 3.7);
    R(g, sx + 6, sb - 44, 8, 10, "#2a2a36"); R(g, sx + 7, sb - 43, 6, 8, "#ffcf7a"); R(g, sx + 5, sb - 45, 10, 2, "#3a3a46");
    G(g, sx + 10, sb - 39, 70, `rgba(255,190,110,${0.55 * fl})`, 1); G(g, sx + 10, sb - 39, 14, "rgba(255,240,190,0.9)", 1);
    // crow on the FASTER sign: flaps away when the needle wobbles
    {
      const cx0 = sx + 54, cy0 = sb - 87, fk = cl((t - wob) / 1.4, 0, 1), cx = cx0 + fk * 160, cy = cy0 - fk * 90 - Math.sin(fk * 3) * 10;
      const flap = fk > 0 ? Math.sin(t * 22) > 0 : false;
      R(g, cx - 4, cy - 5, 8, 5, "#141020"); R(g, cx + 3, cy - 8, 4, 4, "#141020"); R(g, cx + 7, cy - 7, 2, 1, "#d8a040"); R(g, cx + 5, cy - 7, 1, 1, "#f0e0a0"); R(g, cx - 7, cy - 4, 4, 2, "#141020");
      if (fk > 0) { R(g, cx - 3, cy - (flap ? 10 : 2), 6, flap ? 5 : 3, "#201a30"); } else { R(g, cx - 2, cy, 1, 2, "#3a3a46"); R(g, cx + 1, cy, 1, 2, "#3a3a46"); }
      if (t > wob && t < wob + 0.8) PX.otext(g, "CAW", cx + 6, cy - 20, { font: "v", size: 12, col: "#e8d8c0" });
    }
    // ---- the expert hiker ----
    const walk1 = cl(t / wob, 0, 1), walk2 = cl((t - wob - 1.6) / (d - wob - 1.6), 0, 1);
    const hx = 96 + walk1 * 130 + walk2 * 14, moving = (t < wob) || (t > wob + 1.6);
    const ph = moving ? Math.floor(t * 5) % 2 : 0, fy = 316;
    const tap = t > wob + 0.5 && t < wob + 1.4;
    const sweatOn = t > wob + 0.8 && t < wob + 2.4;
    // backpack behind (sticks out both sides + bedroll above), badges sewn on its side pockets
    const bob = moving ? (ph ? -1 : 0) : 0, by = fy - 98 + bob;
    R(g, hx - 22, by + 30, 44, 40, "#5a6a3a"); R(g, hx - 22, by + 30, 2, 40, "#7a8a4e"); R(g, hx + 20, by + 30, 2, 40, "#3a4626");
    R(g, hx - 18, by + 22, 36, 9, "#8a3a2a"); R(g, hx - 18, by + 22, 36, 2, "#b85a3a"); R(g, hx - 6, by + 22, 2, 9, "#5a2418"); R(g, hx + 6, by + 22, 2, 9, "#5a2418");
    const BADGE = ["#f7c948", "#5fe3e8", "#f25ca8", "#3df56b", "#ff8a4a", "#a77cff"];
    BADGE.forEach((col, i) => { const bx = i < 3 ? hx - 21 : hx + 17, byy = by + 38 + (i % 3) * 10; PX.circle(g, bx + 2, byy, 2, col); R(g, bx + 1, byy - 1, 1, 1, "#fff8e0"); });
    // "EXPERT" pennant on a pole out of the pack
    const fx = hx + 18, fy0 = by - 6;
    R(g, fx, fy0, 1, 36, "#c8b890");
    for (let i = 0; i < 46; i++) { const wv = Math.round(Math.sin(t * 6 - i * 0.2) * 1.5 * (i / 46)), hh = Math.round(13 * (1 - i / 60)); R(g, fx + 1 + i, fy0 + wv + (13 - hh) / 2, 1, hh, i < 2 ? "#a03030" : "#c84040"); }
    PX.text(g, "EXPERT", fx + 4, fy0 + 3 + Math.round(Math.sin(t * 6 - 5) * 1), { font: "v", size: 10, col: "#ffe8c0" });
    const hands = tap ? { l: [hx - 12, fy - 52 - Math.round(Math.abs(Math.sin(t * 14)) * 2)], r: [hx + 14, fy - 54] } : { l: [hx - 14, fy - 44 + (moving ? (ph ? 1 : -1) : 0)], r: [hx + 14, fy - 54] };
    ell(g, hx, fy, 16, 3, "rgba(0,0,0,0.4)");
    const P = person(g, hx, fy + bob, { h: 98, skin: "#e0a878", hair: "#a8a8b0", hairStyle: "short", shirt: "#8a5a32", pants: "#4a4a3a", shoe: "#3a2a1a",
      face: sweatOn ? "smug" : "happy", look: 2, lit: 1, legs: moving ? (ph ? [-4, 4] : [3, -3]) : [0, 0], hands, top: "shirt" });
    // straps + chest pocket
    R(g, P.hx - P.tw / 2 + 4, P.ty + 1, 3, 26, "#4a5a2e"); R(g, P.hx + P.tw / 2 - 7, P.ty + 1, 3, 26, "#4a5a2e"); R(g, P.hx - P.tw / 2 + 4, P.ty + 14, P.tw - 8, 2, "#3a4626");
    extras(g, P, { beard: "#b8b8c0" });
    // bush hat
    R(g, P.hx - P.hw / 2 - 5, P.hy + 2, P.hw + 10, 3, "#6a5a3a"); R(g, P.hx - P.hw / 2 - 5, P.hy + 2, P.hw + 10, 1, "#9a8452");
    R(g, P.hx - P.hw / 2 + 1, P.hy - 6, P.hw - 2, 9, "#7a6a44"); R(g, P.hx - P.hw / 2 + 1, P.hy - 6, P.hw - 2, 1, "#a8925e"); R(g, P.hx - P.hw / 2 + 1, P.hy, P.hw - 2, 2, "#4a3a22");
    if (sweatOn) LB.drop(g, P.hx - P.hw / 2 - 4, P.hy + 8 + Math.round(((t - wob - 0.8) % 0.8) * 10));
    // small compass in the right hand
    const [cxh, cyh] = P.hr;
    PX.circle(g, cxh + 4, cyh - 4, 5, "#c8a050"); PX.circle(g, cxh + 4, cyh - 4, 4, "#1a2230"); R(g, cxh + 4, cyh - 4, 3, 1, "#ff4d4d");
    G(g, cxh + 4, cyh - 4, 12, "rgba(255,220,140,0.4)", 1);
    // warm rim light from the low sun (right)
    G(g, P.hx + 30, P.hy + 30, 50, "rgba(255,160,110,0.18)", 1);
    // ---- big compass inset (HUD bubble), needle points at the cliff path ----
    {
      const ix = 150, iy = 102, r = 50;
      PX.line(g, cxh + 4, cyh - 9, ix + 30, iy + 40, "#e8d8b0"); PX.line(g, cxh + 5, cyh - 9, ix + 31, iy + 40, "#8a7a5a");
      PX.circle(g, ix, iy, r + 4, "#2a1e14"); PX.circle(g, ix, iy, r + 3, "#c8a050"); PX.circle(g, ix, iy, r + 1, "#8a6a2a"); PX.circle(g, ix, iy, r, "#a89a7a"); PX.circle(g, ix + 1, iy + 2, r - 3, "#9c8e70"); PX.circle(g, ix, iy, 16, "#94866a");
      for (let i = 0; i < 32; i++) { const a = (i / 32) * 6.283, L = i % 8 === 0 ? 7 : i % 4 === 0 ? 4 : 2; PX.line(g, ix + Math.cos(a) * (r - 2), iy + Math.sin(a) * (r - 2), ix + Math.cos(a) * (r - 2 - L), iy + Math.sin(a) * (r - 2 - L), "#3a2e22"); }
      PX.text(g, "N", ix, iy - r + 9, { size: 8, col: "#a03030", align: "center" });
      // needle angle: points right (to the cliff); wobble = violent shake decaying
      const w = t >= wob ? Math.exp(-(t - wob) * 1.1) : 0;
      const ang = 0.05 * Math.sin(t * 2) + w * (0.9 * Math.sin((t - wob) * 31) + 0.5 * Math.sin((t - wob) * 17));
      const ca = Math.cos(ang), sa = Math.sin(ang), L1 = r - 10;
      for (let k = -1; k <= 1; k++) { PX.line(g, ix - sa * k, iy + ca * k, ix + ca * L1, iy + sa * L1, "#d83030"); PX.line(g, ix - sa * k, iy + ca * k, ix - ca * L1, iy - sa * L1, "#3a4a5a"); }
      R(g, ix - 2, iy - 2, 5, 5, "#c8a050"); R(g, ix - 1, iy - 1, 2, 2, "#fff0c0");
      if (w > 0.2) for (let k = 0; k < 3; k++) { const ex = ix + r + 8, ey = iy - 12 + k * 12; R(g, ex + Math.round(Math.sin(t * 40 + k) * 2), ey, 4, 1, "#ffe08a"); R(g, ix - r - 12 + Math.round(Math.sin(t * 40 + k) * 2), ey, 4, 1, "#ffe08a"); }
      // glass glare
      PX.alpha(g, 0.25, () => { for (let k = 0; k < 10; k++) R(g, ix - 30 + k * 2, iy - 32 + k, 8, 1, "#ffffff"); });
    }
    // fireflies + foreground ferns (fore parallax) + mist
    PX.particles(g, 81, 24, t, [0, 200, 440, 140], { vy: -3, vx: 3, col: "#e8f080", a: 0.9, tw: 4 });
    PX.par(g, c, 1.2, () => {
      fog(g, t, 330, 30, "#a890a8", 0.25, 14, 9);
      for (let k = 0; k < 5; k++) { const r = hr(k + 700); R(g, r() * 600, 352 + r() * 8, 6 + r() * 10, 1, "#3a3448"); }
      for (const [fx2, s] of [[-6, 1.2], [36, 0.9], [600, 1.3], [628, 1]]) for (let k = 0; k < 7; k++) { const a = -2.6 + k * 0.36, L = 26 * s; limb(g, fx2, 364, fx2 + Math.cos(a) * L + Math.sin(t * 1.5 + k) * 2, 364 + Math.sin(a) * L, 3, k % 2 ? "#1c2a30" : "#16222a"); }
    });
    PX.vignette(g, 0.5);
  };

  // ================= feels_fast =================
  // o.fast (1.0) needle sweeps to max + "FEELS FAST", code pours onto the dash screen; o.clock (7.0) world freezes,
  // big clock on the windshield, needle drops, "THE CLOCK DISAGREES"
  K.feels_fast = (o) => (g, t, d, c) => {
    const fast = T(o, "fast", 1.0, d, 9.0), clk = T(o, "clock", 7.0, d, 9.0);
    const frozen = t >= clk, tf = Math.min(t, clk);                 // world time stops at the clock beat
    const spd = cl((tf - fast + 0.4) / 1.2, 0.15, 1);              // perceived speed 0.15 -> 1
    const wt = tf * 0.4 + Math.max(0, tf - fast) * 1.6;            // distance travelled (world scroll)
    const HZ = 112, DY = 200, VX = 320;
    // ---- far: night sky + city glow at the horizon ----
    PX.par(g, c, 0.25, () => {
      PX.vgrad(g, -40, -30, 720, 150, "0c0e24", "2a1e48", 7);
      const r = PX.rnd(91); for (let i = 0; i < 50; i++) { const x = r() * 700 - 30, y = r() * 100; g.globalAlpha = 0.3 + 0.6 * Math.abs(Math.sin(t * 1.1 + i)); R(g, x, y, 1, 1, "#fff"); } g.globalAlpha = 1;
      PX.circle(g, 520, 40, 9, "#f4f1d0"); PX.circle(g, 523, 38, 8, "#e4e0b8");
      for (let x = -40; x < 680; x += 9) { const h = 8 + ((x * 31) % 23); R(g, x, HZ - h, 8, h, "#1c1838"); if ((x * 7) % 3 === 0) R(g, x + 3, HZ - h + 3, 2, 2, "#c8a04a"); }
      G(g, VX, HZ, 200, "rgba(95,227,232,0.18)", 1);
    });
    // ---- mid: the highway made of code lines rushing toward us ----
    PX.par(g, c, 0.6, () => {
      PX.vgrad(g, -40, HZ, 720, DY - HZ + 20, "0a0c1a", "10142a", 4);
      for (let y = HZ; y < DY + 12; y++) { const k = (y - HZ) / (DY - HZ), hw = 8 + k * 430; R(g, VX - hw, y, 2 * hw, 1, "#0c1020"); R(g, VX - hw - 2, y, 2, 1, "#5fe3e8"); R(g, VX + hw, y, 2, 1, "#5fe3e8"); }
      const N = 26;
      for (let i = 0; i < N; i++) {
        const raw = i / N + wt, row = Math.floor(raw * 1) , u = frac(raw), k = Math.pow(u, 2.2), y = HZ + k * (DY + 12 - HZ), hw = 8 + k * 430;
        const th = Math.max(1, Math.round(k * 5)), rr = hr(i * 31 + Math.floor(raw) * 7);
        let x = VX - hw + hw * 0.06 + rr() * hw * 0.2;
        while (x < VX + hw * 0.9) {
          const len = hw * (0.06 + rr() * 0.18), col = CODEC[Math.floor(rr() * CODEC.length)];
          PX.alpha(g, 0.35 + 0.65 * k, () => R(g, x, y, Math.max(1, len), th, col));
          x += len + hw * (0.03 + rr() * 0.05);
          if (rr() < 0.2) break;
        }
      }
      // roadside code towers whizzing past
      for (let i = 0; i < 8; i++) {
        const u = frac(i / 8 + wt * 0.55), k = Math.pow(u, 2.6), side = i % 2 ? 1 : -1;
        const bx = VX + side * (30 + k * 700), byy = HZ + k * (DY - HZ + 40), bh = 10 + k * 260, bw = 4 + k * 90;
        const x0 = side > 0 ? bx : bx - bw;
        R(g, x0, byy - bh, bw, bh, "#141a34"); R(g, side > 0 ? x0 : x0 + bw - 1, byy - bh, Math.max(1, k * 3), bh, "#2a3a6a");
        const rr = hr(i + Math.floor(i / 8 + wt * 0.55) * 13);
        for (let wy = byy - bh + 4 * Math.max(1, k * 2); wy < byy - 3; wy += Math.max(2, Math.round(6 * k))) for (let wx = x0 + 2; wx < x0 + bw - 3; wx += Math.max(2, Math.round(8 * k))) if (rr() < 0.5) R(g, wx, wy, Math.max(1, k * 5), Math.max(1, k * 2), CODEC[Math.floor(rr() * 8)]);
      }
      // motion streaks from the vanishing point
      const rs = PX.rnd(5);
      for (let i = 0; i < 40; i++) {
        const a = rs() * 6.283, ph = rs(), u = frac(ph + wt * 1.3), r0 = 20 + u * u * 520, len = (10 + u * 120) * spd;
        const x1 = VX + Math.cos(a) * r0, y1 = HZ + Math.sin(a) * r0 * 0.55, x2 = VX + Math.cos(a) * (r0 + len), y2 = HZ + Math.sin(a) * (r0 + len) * 0.55;
        if (y1 > DY + 12 && y2 > DY + 12) continue;
        PX.alpha(g, spd * 0.7 * u, () => PX.line(g, x1, y1, x2, y2, i % 3 ? "#bfe8ff" : "#f25ca8"));
      }
      if (frozen) PX.alpha(g, 0.35 * PX.p(t, clk, 0.3), () => R(g, -40, -30, 720, DY + 60, "#1a2040"));
    });
    // ---- interior: roof, A-pillars, mirror with a dangling robot charm ----
    for (let y = 0; y < 360; y++) { const w = Math.round(lerp(76, 14, y / 220)); if (y < 220) { R(g, -40, y, 40 + w, 1, "#0a0b12"); R(g, 640 - w, y, w + 40, 1, "#0a0b12"); R(g, w, y, 1, 1, "#2a2e40"); R(g, 639 - w, y, 1, 1, "#20232f"); } }
    R(g, -40, -30, 720, 40, "#08090f"); R(g, -40, 9, 720, 2, "#1e2130"); R(g, -40, 10, 720, 1, "#3a3e52");
    R(g, VX - 1, 10, 3, 10, "#1a1c26"); R(g, VX - 36, 18, 72, 16, "#16181f"); R(g, VX - 34, 20, 68, 12, "#2a2e44"); R(g, VX - 34, 20, 68, 1, "#4a5068"); R(g, VX - 30, 22, 20, 4, "#3a4060");
    {
      const sw = frozen ? Math.sin((clk - fast) * 3) * 0.6 * spd : Math.sin(tf * 3.1) * (0.15 + 0.5 * spd) + Math.sin(tf * 7.3) * 0.1 * spd;
      const L = 30, ax = VX + 18, ay = 32, ex = ax + Math.sin(sw) * L, ey = ay + Math.cos(sw) * L;
      PX.line(g, ax, ay, ex, ey, "#8a8ea0");
      bot(g, Math.round(ex - 7), Math.round(ey), 14, "ok", t);
    }
    // ---- big clock on the windshield ----
    if (frozen) {
      const k = pop(t, clk, 0.45), cx = 320, cy = 84, r = Math.round(46 * Math.min(k, 1.15));
      G(g, cx, cy, 120, "rgba(255,240,200,0.25)", k);
      PX.circle(g, cx, cy, r + 4, "#2a2a36"); PX.circle(g, cx, cy, r + 3, "#8a8ea0"); PX.circle(g, cx, cy, r + 1, "#3a3e52");
      PX.circle(g, cx, cy, r, "#8c8674"); PX.circle(g, cx + 1, cy + 2, r - 3, "#827c6a");
      if (k > 0.6) {
        for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283, L = i % 3 ? 3 : 6; thick(g, cx + Math.cos(a) * (r - 3), cy + Math.sin(a) * (r - 3), cx + Math.cos(a) * (r - 3 - L), cy + Math.sin(a) * (r - 3 - L), 2, "#2a2a36"); }
        const sec = Math.floor((t - clk) * 1) * 6.283 / 60 - 1.57 + 1.2;
        thick(g, cx, cy, cx + Math.cos(-0.5) * r * 0.5, cy + Math.sin(-0.5) * r * 0.5, 3, "#2a2a36");
        thick(g, cx, cy, cx + Math.cos(0.9 + (t - clk) * 0.02) * r * 0.78, cy + Math.sin(0.9 + (t - clk) * 0.02) * r * 0.78, 2, "#2a2a36");
        PX.line(g, cx, cy, cx + Math.cos(sec) * (r - 4), cy + Math.sin(sec) * (r - 4), "#d83030");
        R(g, cx - 2, cy - 2, 4, 4, "#2a2a36");
        // bells + legs (alarm clock)
        PX.circle(g, cx - r + 4, cy - r + 2, 9, "#5a5e70"); PX.circle(g, cx + r - 4, cy - r + 2, 9, "#5a5e70"); PX.circle(g, cx - r + 3, cy - r + 1, 6, "#7a7e90"); PX.circle(g, cx + r - 5, cy - r + 1, 6, "#7a7e90");
        thick(g, cx - r * 0.6, cy + r * 0.8, cx - r * 0.8, cy + r + 6, 3, "#3a3e52"); thick(g, cx + r * 0.6, cy + r * 0.8, cx + r * 0.8, cy + r + 6, 3, "#3a3e52");
        if (frac(t - clk) < 0.12) PX.alpha(g, 0.6, () => { for (let q = 0; q < 3; q++) R(g, cx - r - 12 - q * 3, cy - r + q * 4, 6, 1, "#ffe08a"); for (let q = 0; q < 3; q++) R(g, cx + r + 8 + q * 3, cy - r + q * 4, 6, 1, "#ffe08a"); });
      }
    }
    // ---- dashboard ----
    const dashY = (x) => DY - 4 + Math.round(Math.pow((x - 320) / 320, 2) * -12);
    for (let x = 0; x < 640; x++) { const y0 = dashY(x); R(g, x, y0, 1, 360 - y0, "#141826"); R(g, x, y0, 1, 1, "#4a4f68"); R(g, x, y0 + 1, 1, 3, "#20243a"); }
    PX.vgrad(g, 0, 290, 640, 70, "141826", "06070c", 5);
    G(g, 320, 250, 260, "rgba(80,140,255,0.12)", 1);
    // vents left + right
    for (const vx of [26, 556]) { R(g, vx, 226, 58, 34, "#0b0c14"); R(g, vx, 226, 58, 1, "#363a50"); for (let i = 0; i < 5; i++) { R(g, vx + 3, 230 + i * 6, 52, 2, "#22263a"); R(g, vx + 3, 230 + i * 6, 52, 1, "#3a3f58"); } }
    // dash screen (right): code pours in, scrolling fast, overflowing
    const DX = 404, DYs = 214, DW = 140, DH = 74;
    R(g, DX - 4, DYs - 4, DW + 8, DH + 8, "#0a0b12"); R(g, DX - 4, DYs - 4, DW + 8, 1, "#4a4f68"); R(g, DX, DYs, DW, DH, "#081020");
    G(g, DX + DW / 2, DYs + DH / 2, 110, "rgba(95,200,232,0.22)", 1);
    {
      const pour = cl((tf - fast - 0.3) / 0.5, 0, 1), sc = Math.max(0, tf - fast - 0.3) * 30;
      R(g, DX, DYs, DW, 9, "#12203a"); PX.text(g, "AI CODE", DX + 4, DYs, { font: "v", size: 10, col: "#5fe3e8" });
      if (pour > 0) for (let l = 0; l < 12; l++) {
        const li = Math.floor(sc) + l, yy = DYs + 11 + l * 5 - frac(sc) * 5, rr = hr(li * 13 + 7);
        if (yy < DYs + 10 || yy > DYs + DH - 3) continue;
        let x = DX + 4 + Math.floor(rr() * 3) * 6;
        for (let s = 0; s < 4; s++) { const w = 6 + rr() * 26; if (x + w > DX + DW - 4) break; R(g, x, yy, w, 2, CODEC[Math.floor(rr() * 8)]); x += w + 3; }
      }
      // overflow: code lines spill out of the screen's bottom edge
      if (pour >= 1) for (let i = 0; i < 6; i++) { const k = frac(tf * 1.4 + i / 6), rr = hr(i + 900); PX.alpha(g, 1 - k, () => R(g, DX + 10 + rr() * (DW - 30), DYs + DH + 2 + k * 40, 8 + rr() * 12, 2, CODEC[i % 8])); }
      if (frozen) PX.alpha(g, 0.5, () => R(g, DX, DYs, DW, DH, "#0a0c18"));
    }
    // speedometer (centre-left, behind the wheel)
    const gx = 236, gy = 270, gr = 62;
    let v = 0.12 + 0.02 * Math.sin(t * 9);
    if (tf > fast) v = 0.12 + 0.88 * PX.ease(cl((tf - fast) / 0.9, 0, 1), "back");
    if (tf > fast + 0.9) v = 0.98 + 0.03 * Math.sin(tf * 47) + 0.015 * Math.sin(tf * 83);
    if (frozen) v = lerp(Math.min(1.02, v), 0.24, PX.ease(cl((t - clk - 0.2) / 1.1, 0, 1), "back"));
    v = Math.min(v, 1.04);
    {
      PX.circle(g, gx, gy, gr + 6, "#22263a"); PX.circle(g, gx, gy, gr + 5, "#4a5068"); PX.circle(g, gx, gy, gr + 3, "#14172a"); PX.circle(g, gx, gy, gr, "#0a0f22");
      PX.circle(g, gx, gy + 3, gr - 4, "#0c1430");
      G(g, gx, gy, gr, "rgba(70,140,255,0.2)", 1);
      for (let a = -2.4; a < -0.3; a += 0.02) R(g, gx + Math.cos(a) * (gr + 5), gy + Math.sin(a) * (gr + 5), 1, 1, "#8a90b0");
      const hot = v > 0.8 && !frozen;
      for (let vv = 0.8; vv <= 1; vv += 0.004) { const a = Math.PI * 0.75 + vv * Math.PI * 1.5; for (let rr = gr - 10; rr < gr - 3; rr++) R(g, gx + Math.cos(a) * rr, gy + Math.sin(a) * rr, 1, 1, hot ? (PX.blink(t, 0.22) ? "#ff4040" : "#b02028") : "#6a1a22"); }
      if (hot) G(g, gx + gr * 0.6, gy + gr * 0.3, 46, "rgba(255,60,60,0.45)", 1);
      for (let i = 0; i <= 40; i++) {
        const a = Math.PI * 0.75 + (i / 40) * Math.PI * 1.5, maj = i % 5 === 0, r1 = maj ? gr - 15 : gr - 9;
        PX.line(g, gx + Math.cos(a) * r1, gy + Math.sin(a) * r1, gx + Math.cos(a) * (gr - 3), gy + Math.sin(a) * (gr - 3), maj ? "#d8e4ff" : "#5a6a98");
      }
      // speed icons instead of numbers: snail at the low end, rocket at the top
      PX.sprite(g, [".ss..", "s..s.", "s.ss.", ".ss.d", "ddddd"], gx - 40, gy + 26, { s: "#8a9ab8", d: "#5a6a88" });
      PX.sprite(g, ["..r..", ".rwr.", ".rwr.", ".rrr.", "rr.rr", "o...o"], gx + 34, gy + 24, { r: "#c8d0e0", w: "#5fe3e8", o: "#ff8a4a" });
      // needle
      const a = Math.PI * 0.75 + v * Math.PI * 1.5, ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca;
      for (let k = -1; k <= 1; k++) PX.line(g, gx + nx * k, gy + ny * k, gx + ca * (gr - 8), gy + sa * (gr - 8), k ? "#c83020" : "#ff7a3a");
      PX.line(g, gx, gy, gx - ca * 12, gy - sa * 12, "#c83020");
      G(g, gx + ca * (gr - 10), gy + sa * (gr - 10), 18, "rgba(255,120,60,0.7)", 1);
      PX.circle(g, gx, gy, 6, "#22263a"); PX.circle(g, gx, gy, 4, "#3a4058"); R(g, gx - 2, gy - 3, 2, 1, "#8a90b0");
      // sparks at full tilt
      if (hot && tf > fast + 0.9) for (let i = 0; i < 5; i++) { const k = frac(t * 3 + i / 5), rr = hr(i + Math.floor(t * 3 + i / 5) * 5); R(g, gx + ca * (gr - 6) + (rr() - 0.5) * 20 * k, gy + sa * (gr - 6) - k * 14 + rr() * 6, 1, 1, "#ffd27a"); }
      // LCD under the needle: speed bar
      R(g, gx - 22, gy - 34, 44, 9, "#06100c"); R(g, gx - 22, gy - 34, 44, 1, "#2a3a34");
      const nb = Math.round(v * 9); for (let i = 0; i < 9; i++) R(g, gx - 20 + i * 4.6, gy - 32, 3, 5, i < nb ? (i > 6 ? "#ff5c5c" : "#3df56b") : "#14241c");
    }
    // warning lights row
    for (let i = 0; i < 4; i++) { const on = frozen ? PX.blink(t + i * 0.1, 0.5) : i === 1 && spd > 0.9 && PX.blink(t, 0.6); R(g, 330 + i * 12, 238, 8, 6, on ? "#ff5c5c" : "#2a1e24"); if (on) G(g, 334 + i * 12, 241, 12, "rgba(255,80,80,0.6)", 1); }
    // steering wheel (front) + the dev's hands in green sleeves
    {
      const wcx = 236, wcy = 410, wr = 126, shk = !frozen && spd > 0.9 ? Math.round(Math.sin(t * 40) * 0.8) : 0;
      for (let a = -2.75; a < -0.39; a += 0.003) { const x = wcx + Math.cos(a) * wr, y = wcy + Math.sin(a) * wr + shk; R(g, x - 1, y - 7, 3, 14, "#15161e"); R(g, x, y - 7, 1, 2, "#4a4e64"); R(g, x, y + 5, 1, 2, "#08080c"); }
      for (let a = -2.4; a < -0.75; a += 0.08) { const x = wcx + Math.cos(a) * wr, y = wcy + Math.sin(a) * wr + shk; R(g, x, y - 1, 1, 2, "#24252f"); }
      // spokes + hub
      thick(g, wcx - 70, wcy - 112 + shk, wcx - 30, wcy - 90 + shk, 9, "#15161e"); thick(g, wcx + 70, wcy - 112 + shk, wcx + 30, wcy - 90 + shk, 9, "#15161e");
      R(g, wcx - 30, wcy - 100 + shk, 60, 40, "#1a1b24"); R(g, wcx - 30, wcy - 100 + shk, 60, 1, "#3a3e52"); R(g, wcx - 6, wcy - 92 + shk, 12, 8, "#22232e");
      const hand = (a, s) => {
        const x = Math.round(wcx + Math.cos(a) * wr), y = Math.round(wcy + Math.sin(a) * wr) + shk;
        // sleeve from the bottom corner
        limb(g, x + s * 46, 372, x + s * 6, y + 12, 18, "#2f8a4a", "#1e5a30"); limb(g, x + s * 44, 372, x + s * 8, y + 14, 4, "#3fa860");
        R(g, x - 10 + s * 4, y + 6, 20, 6, "#26703c"); R(g, x - 10 + s * 4, y + 6, 20, 1, "#3fa860");
        // fist wrapped around the rim, thumb over the top
        R(g, x - 12, y - 9, 24, 19, "#1a1016"); R(g, x - 11, y - 10, 22, 21, "#1a1016");
        R(g, x - 11, y - 8, 22, 17, "#8a5530"); R(g, x - 10, y - 9, 20, 19, "#8a5530"); R(g, x - 10, y - 9, 20, 3, "#a86b3c"); R(g, x - 11, y - 6, 2, 10, "#a86b3c");
        R(g, x - 10, y + 6, 20, 3, "#6a3e22"); for (let k = 0; k < 3; k++) R(g, x - 5 + k * 6, y - 6, 1, 11, "#6a3e22");
        R(g, x - 5 - s * 2, y - 13, 12, 5, "#1a1016"); R(g, x - 4 - s * 2, y - 12, 10, 3, "#a86b3c"); R(g, x - 4 - s * 2, y - 12, 10, 1, "#c98a5a");
      };
      hand(-2.3, -1); hand(-0.84, 1);
    }
    // dash detail: seam, knobs, hazard button
    R(g, 0, 312, 640, 1, "#0a0b12"); R(g, 0, 313, 640, 1, "#262a3c");
    for (const [kx, ky] of [[430, 304], [462, 304], [494, 304]]) { PX.circle(g, kx, ky, 5, "#0e1018"); PX.circle(g, kx, ky, 4, "#2a2e40"); R(g, kx - 1, ky - 4, 2, 3, "#8a90b0"); }
    R(g, 518, 298, 14, 10, "#2a1416"); R(g, 519, 299, 12, 8, frozen && PX.blink(t, 0.5) ? "#ff5c5c" : "#6a2024"); R(g, 522, 301, 6, 1, "#ffb0a0");
    // ---- labels on the windshield ----
    if (t > fast + 0.5 && !frozen) {
      const k = pop(t, fast + 0.5, 0.3), jit = spd > 0.95 ? Math.round(Math.sin(t * 30)) : 0;
      PX.alpha(g, cl(k, 0, 1), () => { G(g, 320, 150, 80, "rgba(95,227,232,0.3)", 1); PX.otext(g, "FEELS FAST", 320 + jit, 142 - Math.round((1 - k) * 10), { size: 24, col: "#5fe3e8", align: "center" }); });
    }
    if (frozen && t > clk + 0.7) {
      const k = pop(t, clk + 0.7, 0.3);
      PX.alpha(g, cl(k, 0, 1), () => { const w = PX.tw(g, "THE CLOCK DISAGREES", { size: 16 }) + 20; R(g, 320 - w / 2, 150, w, 26, "rgba(6,8,20,0.8)"); R(g, 320 - w / 2, 150, w, 1, "#ff5c5c"); PX.otext(g, "THE CLOCK DISAGREES", 320, 155, { size: 16, col: "#ff8a7a", align: "center" }); });
    }
    // glass reflections on the windshield
    PX.alpha(g, 0.06, () => { for (let k = 0; k < 60; k++) R(g, 420 + k, 20 + k * 2, 26, 2, "#ffffff"); });
    PX.vignette(g, 0.55);
  };

  // ================= caveats =================
  // o.at ([1.0, 4.5, 8.5]) the three items are hand-written then ticked; o.items to override the three lines
  K.caveats = (o) => (g, t, d, c) => {
    const at = T(o, "at", [1.0, 4.5, 8.5], d, 14.0), items = o.items || ["SMALL STUDY: 16 DEVS", "EARLY-2025 TOOLS", "EXPERTS ON THEIR OWN CODE"];
    const CPS = 9, DY = 214;
    // ---- far: wall, rainy window, cork board, wall clock, the blinking warning sign ----
    PX.par(g, c, 0.4, () => {
      PX.vgrad(g, -40, -30, 720, 260, "1a1a36", "121228", 8);
      for (let x = -40; x < 680; x += 6) R(g, x, -30, 1, 260, (x / 6) % 2 ? "#18183a" : "#1c1c3e");   // wallpaper stripes
      R(g, -10, 30, 140, 130, "#0a0c18"); PX.core.skyline(g, -6, 34, 132, 122, t, 21);
      R(g, 58, 34, 3, 122, "#2a2e48"); R(g, -6, 94, 132, 3, "#2a2e48"); R(g, -14, 156, 148, 5, "#34385a"); R(g, -14, 156, 148, 1, "#5a5e80");
      LB.rain(g, t, 33, 30, [-6, 34, 132, 122], { a: 0.45, len: 6, vy: 220, vx: -30 });
      for (let i = 0; i < 6; i++) { const k = frac(t * 0.12 + i / 6), rx = 4 + ((i * 41) % 120); R(g, rx, 36 + k * 116, 1, 3, "#8aa8e0"); R(g, rx, 36 + k * 116 - 4, 1, 4, "#4a5a8a"); }   // drops running down
      // cork board with pinned notes
      R(g, 474, 40, 120, 86, "#5a3e28"); R(g, 478, 44, 112, 78, "#8a6440"); for (let i = 0; i < 40; i++) { const r = hr(i + 50); R(g, 478 + r() * 110, 44 + r() * 76, 1, 1, "#6a4a2c"); }
      [[486, 50, "#c8c0a0"], [520, 56, "#c8b060"], [556, 48, "#a0b8c8"], [500, 86, "#c8a0a0"], [544, 84, "#c8c0a0"]].forEach(([nx, ny, col], i) => {
        R(g, nx, ny, 26, 24, col); R(g, nx, ny, 26, 1, sh(col, 1.2)); for (let k = 0; k < 3; k++) R(g, nx + 3, ny + 6 + k * 5, 18 - k * 4, 1, sh(col, 0.6)); R(g, nx + 12, ny - 1, 3, 3, ["#ff5c5c", "#3df56b", "#5fe3e8", "#f7c948", "#f25ca8"][i]);
      });
      // red string between two notes (the "detective" touch)
      PX.line(g, 499, 52, 569, 50, "#c83a3a"); PX.line(g, 569, 50, 514, 88, "#c83a3a");
      wallClock(g, 430, 40, 14, t * 1 + 1400);
    });
    // warning sign (mid layer): yellow triangle with a blinking amber beacon
    PX.par(g, c, 0.6, () => {
      const wx = 534, wy = 140, on = PX.blink(t, 1.0, 0.55);
      R(g, wx - 12, wy + 38, 24, 3, "#3a3e52"); R(g, wx - 12, wy + 38, 24, 1, "#5a6078");
      for (let r = 0; r < 40; r++) { const w = Math.round(r * 0.62); R(g, wx - w, wy + r, 2 * w + 1, 1, r > 36 ? "#1a1a10" : r > 33 ? "#2a2a14" : on ? "#f7c948" : "#b8922e"); R(g, wx - w, wy + r, 1, 1, "#1a1a10"); R(g, wx + w, wy + r, 1, 1, "#1a1a10"); }
      for (let r = 4; r < 34; r++) { const w = Math.round((r - 4) * 0.62); if (r > 6) { R(g, wx - w + 3, wy + r, Math.max(0, 2 * w - 5), 1, on ? "#ffd860" : "#c8a038"); } }
      R(g, wx - 2, wy + 12, 4, 13, "#1a1a10"); R(g, wx - 2, wy + 28, 4, 4, "#1a1a10");
      R(g, wx - 4, wy - 8, 8, 7, "#3a3020"); R(g, wx - 3, wy - 7, 6, 5, on ? "#ffb020" : "#5a3a10");
      if (on) { G(g, wx, wy - 5, 30, "rgba(255,180,40,0.8)", 1); G(g, wx, wy + 22, 70, "rgba(247,201,72,0.3)", 1); }
    });
    // ---- desk surface (perspective) ----
    for (let y = DY; y < 360; y++) { const k = (y - DY) / 146; R(g, -40, y, 720, 1, k < 0.04 ? "#7a5a3e" : `rgb(${Math.round(70 + k * 20)},${Math.round(48 + k * 12)},${Math.round(32 + k * 6)})`); }
    for (let i = 0; i < 12; i++) { const r = hr(i + 80), y = DY + 4 + Math.pow(r(), 0.8) * 140, x = r() * 640; R(g, x, y, 30 + r() * 80, 1, "#5a3e28"); }
    R(g, -40, DY, 720, 2, "#9a7a52");
    // lamp (left): base, arm, shade, warm cone over the clipboard
    const fl = 0.92 + 0.08 * Math.sin(t * 13) * Math.sin(t * 2.3);
    PX.par(g, c, 0.85, () => {
      R(g, 60, DY + 18, 34, 6, "#2a2c3a"); R(g, 60, DY + 18, 34, 1, "#5a6078");
      limb(g, 77, DY + 18, 92, DY - 70, 3, "#4a4e64", "#2a2c3a"); limb(g, 92, DY - 70, 150, DY - 110, 3, "#4a4e64", "#2a2c3a");
      for (let r = 0; r < 18; r++) { const w = 6 + r; R(g, 150 - w / 2 + r * 0.6, DY - 118 + r, w, 1, r === 17 ? "#ffe8b0" : r < 2 ? "#5a6078" : "#3a3e52"); }
      cone(g, 160, DY - 100, 26, 220, 220, "#ffd79a", 0.16 * fl);
      G(g, 162, DY - 98, 34, "rgba(255,230,170,0.9)", fl);
    });
    G(g, 300, 220, 220, `rgba(255,190,110,${0.32 * fl})`, 1);
    // ---- the clipboard propped up on the desk ----
    const CX = 196, CY = 54, CW = 252, CH = 252;
    ell(g, CX + CW / 2 + 10, CY + CH + 4, CW / 2 + 10, 6, "rgba(0,0,0,0.5)");
    R(g, CX - 6, CY, CW + 12, CH + 6, "#6a4a2c"); R(g, CX - 6, CY, CW + 12, 2, "#9a7448"); R(g, CX + CW + 4, CY, 2, CH + 6, "#3e2a16"); R(g, CX - 6, CY + CH + 4, CW + 12, 2, "#3e2a16");
    R(g, CX, CY + 10, CW, CH - 8, "#8e8876"); R(g, CX, CY + 10, 2, CH - 8, "#a09a86"); R(g, CX, CY + CH, CW, 2, "#6a6454");
    for (let k = 0; k < 4; k++) R(g, CX + 4, CY + CH - 6 + k, CW - 8, 1, "#7e786a");   // sheets underneath
    // ruled lines + margin
    for (let y = CY + 46; y < CY + CH - 6; y += 22) R(g, CX + 4, y, CW - 8, 1, "#70708a");
    R(g, CX + 28, CY + 14, 1, CH - 18, "#b06a6a");
    // metal clip
    R(g, CX + CW / 2 - 30, CY - 8, 60, 20, "#5a6078"); R(g, CX + CW / 2 - 30, CY - 8, 60, 2, "#a8b0c8"); R(g, CX + CW / 2 - 30, CY + 10, 60, 2, "#2a2e40");
    R(g, CX + CW / 2 - 12, CY - 14, 24, 8, "#4a5068"); R(g, CX + CW / 2 - 12, CY - 14, 24, 1, "#9aa0b8"); R(g, CX + CW / 2 - 4, CY - 4, 8, 4, "#2a2e40");
    // title
    const ink = "#1e2a5a";
    PX.text(g, "FAIR WARNING", CX + CW / 2 + 8, CY + 22, { size: 16, col: "#a82a2a", align: "center" });
    // pen state: where is the tip?
    let tip = null, writing = false;
    const lineY = (i) => CY + 66 + i * 54;
    items.forEach((txt, i) => {
      if (t < at[i]) return;
      const shown = PX.typed(txt, t, at[i], CPS), y = lineY(i), x0 = CX + 50;
      // checkbox
      PX.box(g, CX + 32, y - 2, 13, 13, ink); PX.box(g, CX + 33, y - 1, 11, 11, "#6a6a80");
      // handwriting with a slight wobble per character
      let x = x0;
      for (let k = 0; k < shown.length; k++) { const ch = shown[k], dy = Math.round(Math.sin(k * 1.7 + i) * 0.8); x += PX.text(g, ch, x, y - 4 + dy, { font: "v", size: 18, col: ink }); }
      const doneT = at[i] + txt.length / CPS;
      if (t < doneT) { tip = [x + 1, y + 10]; writing = true; }
      // tick after the line is written
      const tk = doneT + 0.25;
      if (t >= tk - 0.2 && t < tk) tip = [CX + 36, y + 6];
      if (t >= tk) {
        const k = pop(t, tk, 0.3);
        PX.alpha(g, cl(k, 0, 1), () => tick(g, CX + 33, y - 6 - Math.round((1 - k) * 4), 16, "#2a9a4a"));
        if (t < tk + 0.5) PX.alpha(g, 1 - (t - tk) / 0.5, () => { LB.star4(g, CX + 50, y - 8 - (t - tk) * 16, 2, "#3df56b"); G(g, CX + 40, y + 2, 26, "rgba(61,245,107,0.6)", 1); });
      }
    });
    // underline the title twice at the end
    const ul = at[2] + items[2].length / CPS + 0.9;
    for (let n = 0; n < 2; n++) {
      const s0 = ul + n * 0.55, k = cl((t - s0) / 0.45, 0, 1); if (k <= 0) continue;
      const x1 = CX + 50, x2 = CX + 50 + k * (CW - 84), yy = CY + 42 + n * 3;
      for (let x = x1; x < x2; x++) R(g, x, yy + Math.round(Math.sin(x * 0.15 + n) * 0.7), 1, 2, "#a82a2a");
      if (k < 1) tip = [x2, yy + 2];
    }
    // ---- the researcher's hand with a pen ----
    {
      const rest = [CX + CW + 30, CY + CH - 30];
      const tp = tip || rest, wob = writing ? Math.round(Math.sin(t * 26)) : 0;
      const px = tp[0] + wob, py = tp[1] - (writing ? Math.abs(Math.round(Math.sin(t * 13))) : 0);
      // pen: tip at (px, py), body goes down-right
      const ex = px + 22, ey = py + 30;
      thick(g, px, py, ex, ey, 3, "#2a3a8a"); PX.line(g, px + 1, py, ex + 1, ey, "#5a6ad0"); R(g, px - 1, py - 1, 2, 2, "#c8c8d8");
      // hand (fist around the pen) + sleeve to the bottom-right corner
      const sx2 = ex + 90, sy2 = 430, mx2 = lerp(ex + 12, sx2, 0.5), my2 = lerp(ey + 16, sy2, 0.5);
      limb(g, mx2, my2, sx2, sy2, 40, "#3a3456", "#221e36"); limb(g, ex + 12, ey + 16, mx2, my2, 26, "#3a3456", "#221e36");
      limb(g, ex + 2, ey + 14, mx2 - 12, my2, 2, "#5a5280"); limb(g, mx2 - 19, my2, sx2 - 20, sy2, 3, "#5a5280");
      R(g, ex + 4, ey + 12, 18, 12, "#2a2440"); R(g, ex + 4, ey + 12, 18, 2, "#6a62a0");   // sweater cuff
      R(g, ex - 9, ey - 7, 26, 22, "#1a1016"); R(g, ex - 8, ey - 6, 24, 20, "#7a4e30"); R(g, ex - 8, ey - 6, 24, 3, "#9a6640"); R(g, ex - 8, ey + 11, 24, 3, "#5a3420");
      for (let k = 0; k < 3; k++) R(g, ex - 3 + k * 6, ey - 4, 1, 13, "#5a3420");
      R(g, ex - 12, ey - 10, 10, 9, "#1a1016"); R(g, ex - 11, ey - 9, 8, 7, "#9a6640"); R(g, ex - 11, ey - 9, 8, 1, "#b8805a");
      G(g, ex, ey, 30, "rgba(255,190,110,0.2)", 1);
    }
    // ---- desk props: lab notebook (left), magnifier + coffee (right), pencil cup ----
    PX.par(g, c, 1.15, () => {
      // open notebook
      const nx = 30, ny = 280;
      R(g, nx, ny, 150, 70, "#2a3a6a"); R(g, nx + 4, ny + 3, 70, 64, "#a8a08a"); R(g, nx + 76, ny + 3, 70, 64, "#a49c86"); R(g, nx + 74, ny + 2, 3, 66, "#5a5244");
      for (let k = 0; k < 6; k++) { R(g, nx + 10, ny + 12 + k * 9, 56 - (k % 3) * 12, 1, "#3a4a7a"); R(g, nx + 84, ny + 12 + k * 9, 50 - (k % 2) * 16, 1, "#3a4a7a"); }
      // a tiny bar chart doodle on the right page
      for (let k = 0; k < 4; k++) R(g, nx + 90 + k * 10, ny + 60 - (k * 7 + 6), 6, k * 7 + 6, k === 3 ? "#a83a3a" : "#3a6a9a");
      // pencil cup
      R(g, 186, 262, 22, 28, "#3a4a5a"); R(g, 186, 262, 22, 2, "#5a6a7a"); R(g, 186, 262, 2, 28, "#4a5a6a");
      thick(g, 192, 262, 186, 236, 3, "#f7c948"); thick(g, 198, 262, 204, 232, 3, "#c84a4a"); thick(g, 203, 262, 212, 240, 3, "#3a8ac0");
      // coffee mug with steam
      const mx = 560, my = 312;
      R(g, mx, my - 26, 24, 26, "#c84a3a"); R(g, mx, my - 26, 3, 26, "#e06a52"); R(g, mx + 20, my - 26, 4, 26, "#8a2a20"); R(g, mx + 24, my - 20, 6, 12, "#c84a3a"); R(g, mx + 27, my - 17, 2, 6, "#6a2018");
      R(g, mx + 2, my - 26, 20, 3, "#3a2010");
      for (let i = 0; i < 4; i++) { const k = frac(t * 0.5 + i / 4); PX.alpha(g, 0.4 * (1 - k), () => R(g, mx + 8 + Math.round(Math.sin(k * 6 + i) * 4), my - 32 - k * 36, 3, 3, "#c9d1d9")); }
      // magnifying glass lying on the desk (glint sweeps)
      const gx = 498, gy = 334;
      thick(g, gx + 18, gy + 6, gx + 50, gy + 22, 6, "#5a3a22"); thick(g, gx + 18, gy + 5, gx + 50, gy + 21, 2, "#8a5a32");
      ell(g, gx, gy, 24, 15, "#8a8ea0"); ell(g, gx, gy, 21, 12, "#3a4a6a"); ell(g, gx - 2, gy - 2, 15, 7, "#4a5a7a");
      const gk = frac(t * 0.25); if (gk < 0.3) { const sx = gx - 16 + gk * 100; for (let k = 0; k < 6; k++) R(g, sx + k, gy - 8 + k * 2, 2, 2, "#e8f0ff"); }
    });
    // moth circling the lamp + dust in the light
    { const a = t * 3.2, mx = 166 + Math.cos(a) * 22, my = DY - 96 + Math.sin(a * 1.3) * 12, f = Math.sin(t * 30) > 0; R(g, mx, my, 2, 1, "#d8c8a8"); R(g, mx - 2, my + (f ? -1 : 1), 2, 1, "#a89878"); R(g, mx + 2, my + (f ? -1 : 1), 2, 1, "#a89878"); }
    PX.particles(g, 91, 30, t, [120, 100, 260, 160], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.6 });
    PX.vignette(g, 0.55);
  };

  // ================= broken_gauge =================
  // o.label (2.5) red "NOT RELIABLE" tag drops in on a string and swings to rest
  K.broken_gauge = (o) => {
    // needle path: jumps between the extremes with overshoot, never settles
    const NR = PX.rnd(123), SEG = [];
    let tt = 0, prev = 0.5;
    for (let i = 0; i < 60; i++) { const dur = 0.3 + NR() * 0.55, tgt = i % 2 ? 0.86 + NR() * 0.14 : NR() * 0.14, mid = NR() < 0.25; SEG.push([tt, dur, prev, mid ? 0.35 + NR() * 0.3 : tgt]); prev = SEG[SEG.length - 1][3]; tt += dur; }
    const needle = (t) => { for (const [a, du, v0, v1] of SEG) if (t < a + du) return lerp(v0, v1, PX.ease((t - a) / du, "back")); return 0.5; };
    return (g, t, d, c) => {
      const lab = T(o, "label", 2.5, d, 7.0);
      const GX = 320, GY = 168, GR = 104;
      const v = cl(needle(Math.max(0, t)) + 0.015 * Math.sin(t * 61) + 0.01 * Math.sin(t * 97), -0.04, 1.04);
      // slam: when the needle hits an end hard, the panel jolts
      const vEnd = v < 0.02 || v > 0.98, jolt = vEnd ? Math.round(Math.sin(t * 80)) : 0;
      // ---- far: dark stone room, pipes, hanging bulb ----
      const bsw = Math.sin(t * 1.3) * 6, bx = 92 + bsw, byy = 52;
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -30, 720, 420, "15121e", "0c0a12", 7);
        for (let y = -30; y < 380; y += 10) { const off = (y / 10) % 2 ? 0 : 11; for (let x = -40 + off; x < 680; x += 22) { R(g, x, y, 21, 9, (x * 3 + y) % 7 ? "#1a1624" : "#1e1a2a"); R(g, x, y, 21, 1, "#241f32"); } }
        // pipes along the wall
        for (const [py, col] of [[18, "#4a3a2a"], [318, "#3a3040"]]) { R(g, -40, py, 720, 10, col); R(g, -40, py, 720, 2, sh(col, 1.5)); R(g, -40, py + 8, 720, 2, sh(col, 0.6)); for (let x = 20; x < 640; x += 120) { R(g, x, py - 2, 8, 14, sh(col, 1.2)); R(g, x, py - 2, 8, 1, sh(col, 1.7)); } }
        R(g, 590, 18, 10, 330, "#4a3a2a"); R(g, 590, 18, 2, 330, "#7a5e40");
        // valve wheel
        PX.circle(g, 595, 200, 12, "#7a2a22"); PX.circle(g, 595, 200, 9, "#15121e"); for (let a = 0; a < 4; a++) thick(g, 595, 200, 595 + Math.cos(a * 1.57 + 0.4) * 10, 200 + Math.sin(a * 1.57 + 0.4) * 10, 2, "#7a2a22");
        // steam puffs from a joint
        for (let i = 0; i < 5; i++) { const k = frac(t * 0.5 + i / 5); PX.alpha(g, 0.35 * (1 - k), () => PX.circle(g, 140 + k * 30 + Math.sin(k * 6 + i) * 4, 14 - k * 30, 3 + Math.round(k * 7), "#8a8496")); }
      });
      // hanging bare bulb (warm key light), swinging
      R(g, 92, -10, 1, 4, "#2a2a36"); PX.line(g, 92, -6, bx, byy - 8, "#2a2a36");
      R(g, bx - 3, byy - 9, 6, 5, "#3a3a46"); PX.circle(g, bx, byy, 5, "#ffd890"); R(g, bx - 1, byy - 2, 2, 3, "#fff4d0");
      G(g, bx, byy, 160, "rgba(255,190,110,0.32)", 0.9 + 0.1 * Math.sin(t * 17));
      G(g, bx, byy, 22, "rgba(255,240,200,0.9)", 1);
      // ---- mid: the brass instrument panel ----
      PX.par(g, c, 0.8, () => {
        g.save(); g.translate(jolt, 0);
        const PX0 = 110, PY0 = 26, PW = 420, PH = 300;
        ell(g, 320, PY0 + PH + 12, 230, 10, "rgba(0,0,0,0.5)");
        R(g, PX0 - 6, PY0 - 6, PW + 12, PH + 12, "#2a1c0e");
        PX.vgrad(g, PX0, PY0, PW, PH, "6e5228", "4a3418", 6);
        R(g, PX0, PY0, PW, 2, "#b08a4a"); R(g, PX0, PY0, 2, PH, "#9a7840"); R(g, PX0 + PW - 2, PY0, 2, PH, "#2e200e"); R(g, PX0, PY0 + PH - 2, PW, 2, "#2e200e");
        // brushed streaks + patina spots
        for (let i = 0; i < 40; i++) { const r = hr(i + 30); R(g, PX0 + 6 + r() * (PW - 40), PY0 + 6 + r() * (PH - 12), 10 + r() * 30, 1, i % 3 ? "#7a5c2e" : "#3e6a5a"); }
        // key light from the bulb (upper left): darker toward the right/bottom
        for (let x = 0; x < PW; x += 4) PX.alpha(g, 0.5 * Math.pow(x / PW, 1.3), () => R(g, PX0 + x, PY0, 4, PH, "#120c06"));
        PX.alpha(g, 0.3, () => PX.vgrad(g, PX0, PY0 + PH * 0.6, PW, PH * 0.4, "4a3418", "1a1208", 4));
        // rivets around the border
        const rivet = (x, y) => { R(g, x - 1, y - 1, 3, 3, "#3a2810"); R(g, x - 1, y - 1, 2, 2, "#c89a52"); R(g, x - 1, y - 1, 1, 1, "#f0d08a"); };
        for (let x = PX0 + 8; x < PX0 + PW - 4; x += 16) { rivet(x, PY0 + 7); rivet(x, PY0 + PH - 8); }
        for (let y = PY0 + 23; y < PY0 + PH - 12; y += 16) { rivet(PX0 + 7, y); rivet(PX0 + PW - 8, y); }
        // small side dials (they twitch too)
        const dial = (x, y, r, val, col) => {
          PX.circle(g, x, y, r + 3, "#2e200e"); PX.circle(g, x, y, r + 2, "#a07a3e"); PX.circle(g, x, y, r, "#7c7462"); PX.circle(g, x + 1, y + 1, r - 2, "#726a58");
          for (let i = 0; i <= 8; i++) { const a = Math.PI * 0.75 + (i / 8) * Math.PI * 1.5; R(g, x + Math.cos(a) * (r - 2), y + Math.sin(a) * (r - 2), 1, 1, "#2a2420"); }
          const a = Math.PI * 0.75 + val * Math.PI * 1.5; PX.line(g, x, y, x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3), col); R(g, x - 1, y - 1, 2, 2, "#2a2420");
        };
        dial(158, 80, 20, 0.5 + 0.3 * Math.sin(t * 2.3) + 0.1 * Math.sin(t * 9), "#c83030");
        dial(158, 140, 14, 0.3 + 0.2 * Math.sin(t * 3.7 + 1), "#2a2420");
        dial(482, 80, 20, 0.6 + 0.35 * Math.sin(t * 1.7 + 2) * Math.sin(t * 5), "#c83030");
        dial(482, 140, 14, 0.7 + 0.15 * Math.sin(t * 4.1), "#2a2420");
        // indicator lamps + toggle switches
        [["#ff5c5c", 0.4], ["#f7c948", 0.7], ["#3df56b", 1.3]].forEach(([col, per], i) => {
          const lx = 150 + i * 16, ly = 196, on = PX.blink(t + i * 0.2, per, 0.5);
          PX.circle(g, lx, ly, 5, "#2e200e"); PX.circle(g, lx, ly, 4, on ? col : sh(col, 0.35)); if (on) { R(g, lx - 1, ly - 2, 2, 1, "#fff0d0"); G(g, lx, ly, 14, col, 0.6); }
        });
        for (let i = 0; i < 3; i++) { const sx = 452 + i * 16, sy = 190, up = Math.sin(t * 0.9 + i * 2) > 0; R(g, sx - 4, sy, 9, 12, "#2e200e"); R(g, sx - 3, sy + 1, 7, 10, "#5a4220"); thick(g, sx, sy + 6, sx + (up ? -2 : 2), sy + (up ? -2 : 14), 2, "#c8c0b0"); }
        // speaker grille
        for (let i = 0; i < 5; i++) R(g, 140, 228 + i * 6, 44, 2, "#2e200e");
        for (let i = 0; i < 5; i++) R(g, 456, 228 + i * 6, 44, 2, "#2e200e");
        // nameplate
        const NP = "AI HELP-O-METER", nw = PX.tw(g, NP, { size: 8 }) + 26;
        R(g, GX - nw / 2, 292, nw, 22, "#2e200e"); R(g, GX - nw / 2 + 1, 293, nw - 2, 20, "#b8924a"); R(g, GX - nw / 2 + 1, 293, nw - 2, 1, "#f0d08a"); R(g, GX - nw / 2 + 1, 312, nw - 2, 1, "#6a4a20");
        rivet(GX - nw / 2 + 5, 303); rivet(GX + nw / 2 - 6, 303);
        PX.text(g, NP, GX, 300, { size: 8, col: "#3a2408", align: "center" }); PX.text(g, NP, GX, 299, { size: 8, col: "#2a1804", align: "center" });
        // ---- the big gauge ----
        PX.circle(g, GX, GY, GR + 10, "#2e200e"); PX.circle(g, GX, GY, GR + 9, "#8a6a32"); PX.circle(g, GX, GY, GR + 6, "#c89a52"); PX.circle(g, GX + 1, GY + 1, GR + 4, "#7a5a2a"); PX.circle(g, GX, GY, GR + 2, "#2e200e");
        for (let a = -2.6; a < -0.5; a += 0.01) R(g, GX + Math.cos(a) * (GR + 7), GY + Math.sin(a) * (GR + 7), 1, 1, "#f0d08a");
        for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283 + 0.26; R(g, GX + Math.cos(a) * (GR + 6) - 1, GY + Math.sin(a) * (GR + 6) - 1, 3, 3, "#3a2810"); R(g, GX + Math.cos(a) * (GR + 6) - 1, GY + Math.sin(a) * (GR + 6) - 1, 1, 1, "#f0d08a"); }
        PX.circle(g, GX, GY, GR, "#7a7260"); PX.circle(g, GX + 2, GY + 3, GR - 4, "#706854");
        // aged stains
        for (let i = 0; i < 6; i++) { const r = hr(i + 60); PX.alpha(g, 0.25, () => PX.circle(g, GX + (r() - 0.5) * 120, GY + (r() - 0.5) * 120, 6 + r() * 10, "#6a604a")); }
        G(g, GX, GY, GR, "rgba(255,200,120,0.12)", 1);
        // scale: green (A LOT) on the right, red (NOT AT ALL) on the left
        for (let vv = 0; vv <= 1; vv += 0.003) {
          const a = Math.PI * 0.75 + vv * Math.PI * 1.5, col = vv < 0.18 ? "#9a3a2a" : vv > 0.82 ? "#3a7a3a" : null;
          if (col) for (let rr = GR - 14; rr < GR - 8; rr++) R(g, GX + Math.cos(a) * rr, GY + Math.sin(a) * rr, 1, 1, col);
          R(g, GX + Math.cos(a) * (GR - 8), GY + Math.sin(a) * (GR - 8), 1, 1, "#2a2420");
        }
        for (let i = 0; i <= 20; i++) { const a = Math.PI * 0.75 + (i / 20) * Math.PI * 1.5, maj = i % 5 === 0, r1 = maj ? GR - 22 : GR - 15;
          if (maj) thick(g, GX + Math.cos(a) * r1, GY + Math.sin(a) * r1, GX + Math.cos(a) * (GR - 8), GY + Math.sin(a) * (GR - 8), 2, "#2a2420"); else PX.line(g, GX + Math.cos(a) * r1, GY + Math.sin(a) * r1, GX + Math.cos(a) * (GR - 8), GY + Math.sin(a) * (GR - 8), "#3a3428"); }
        PX.text(g, "NOT AT ALL", GX - 38, GY + 36, { font: "v", size: 16, col: "#6a1a10", align: "center" });
        PX.text(g, "A LOT", GX + 42, GY + 36, { font: "v", size: 16, col: "#1a4a1a", align: "center" });
        // needle (with shadow)
        const a = Math.PI * 0.75 + v * Math.PI * 1.5, ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca, L = GR - 14;
        for (let k = -1; k <= 1; k++) PX.line(g, GX + 3 + nx * k, GY + 4 + ny * k, GX + 3 + ca * L, GY + 4 + sa * L, "#4a4230");
        for (let k = -1; k <= 1; k++) PX.line(g, GX + nx * k * 1.5, GY + ny * k * 1.5, GX + ca * L, GY + sa * L, k ? "#7a1a12" : "#c82a1a");
        thick(g, GX, GY, GX - ca * 18, GY - sa * 18, 4, "#2a2420");
        PX.circle(g, GX, GY, 9, "#2e200e"); PX.circle(g, GX, GY, 8, "#a07a3e"); PX.circle(g, GX - 1, GY - 1, 5, "#c89a52"); R(g, GX - 3, GY - 3, 2, 2, "#f0d08a");
        // cracked glass: radiating cracks from an impact + concentric breaks, glare
        const IX = GX + 38, IY = GY - 40, CR = PX.rnd(7);
        for (let i = 0; i < 9; i++) {
          let ang = i * 0.7 + CR() * 0.4, x = IX, y = IY, len = 30 + CR() * 70;
          for (let s2 = 0; s2 < len; s2 += 6) { const nx2 = x + Math.cos(ang) * 6, ny2 = y + Math.sin(ang) * 6; if (Math.hypot(nx2 - GX, ny2 - GY) > GR - 1) break; PX.alpha(g, 0.75, () => PX.line(g, x, y, nx2, ny2, "#e8eef4")); PX.alpha(g, 0.4, () => PX.line(g, x + 1, y + 1, nx2 + 1, ny2 + 1, "#2a2420")); x = nx2; y = ny2; ang += (CR() - 0.5) * 0.5; }
        }
        for (const rr of [9, 18]) for (let k = 0; k < 7; k++) { const a0 = k * 0.9 + rr * 0.1, a1 = a0 + 0.45; PX.alpha(g, 0.6, () => PX.line(g, IX + Math.cos(a0) * rr, IY + Math.sin(a0) * rr, IX + Math.cos(a1) * rr, IY + Math.sin(a1) * rr, "#dfe8f0")); }
        PX.alpha(g, 0.7, () => { PX.circle(g, IX, IY, 2, "#e8eef4"); });
        PX.alpha(g, 0.16, () => { for (let k = 0; k < 20; k++) { const a0 = -2.6 + k * 0.05; R(g, GX + Math.cos(a0) * (GR - 10), GY + Math.sin(a0) * (GR - 10), 3, 3, "#ffffff"); } });
        // a missing glass shard (darker wedge) near the impact
        PX.alpha(g, 0.25, () => { for (let r = 0; r < 12; r++) R(g, IX + 4 + r, IY + 2 + r * 0.5, 12 - r, 1, "#000000"); });
        // sparks when the needle slams an end
        if (vEnd) for (let i = 0; i < 4; i++) { const rr = hr(i + Math.floor(t * 12) * 4); R(g, GX + ca * L + (rr() - 0.5) * 10, GY + sa * L + (rr() - 0.5) * 10, 1, 1, "#ffd27a"); }
        g.restore();
      });
      // ---- the red tag on a string: drops in, swings, settles ----
      if (t >= lab) {
        const tl = t - lab, drop = PX.ease(cl(tl / 0.35, 0, 1), "out"), ang = -1.2 * Math.exp(-tl * 1.4) * Math.cos(tl * 4.2) + 0.08 * Math.sin(t * 1.6) * (1 - Math.exp(-tl));
        const NX = 418, NY = 30;
        R(g, NX - 2, NY - 2, 4, 4, "#3a3a46"); R(g, NX - 1, NY - 1, 2, 2, "#9aa0b0");   // nail
        const TW = 118, TH = 34, SL = 66;
        rot(g, TW + 10, SL + TH + 4, NX, NY - Math.round((1 - drop) * 130), ang, (q) => {
          const cx = (TW + 10) / 2;
          q.fillStyle = "#c8b890"; q.fillRect(cx, 0, 1, SL);
          q.fillStyle = "#1a0a08"; q.fillRect(4, SL - 1, TW + 2, TH + 2);
          q.fillStyle = "#b82a22"; q.fillRect(5, SL, TW, TH); q.fillStyle = "#d84a3a"; q.fillRect(5, SL, TW, 2); q.fillStyle = "#7a1810"; q.fillRect(5, SL + TH - 2, TW, 2);
          // corner cut + grommet
          q.clearRect(4, SL - 1, 4, 4); q.clearRect(TW + 3, SL - 1, 4, 4);
          q.fillStyle = "#c8a050"; q.fillRect(cx - 3, SL + 3, 7, 7); q.fillStyle = "#1a0a08"; q.fillRect(cx - 1, SL + 5, 3, 3);
          q.font = '8px "Press Start 2P"'; q.textBaseline = "top"; q.textAlign = "center";
          q.fillStyle = "#4a0a06"; q.fillText("NOT RELIABLE", cx + 1, SL + 16); q.fillStyle = "#f4e4c8"; q.fillText("NOT RELIABLE", cx, SL + 15);
        }, (TW + 10) / 2, 0);
        if (tl < 0.6) PX.alpha(g, 1 - tl / 0.6, () => G(g, NX, NY + SL + 16, 60, "rgba(255,90,70,0.6)", 1));
      }
      // dust in the bulb light
      PX.particles(g, 101, 30, t, [20, 20, 260, 220], { vy: -2, vx: 2, col: "#ffe2b0", a: 0.55 });
      PX.vignette(g, 0.6);
    };
  };

})();
