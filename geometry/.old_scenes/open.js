/* EP2 Builder A scenes: keeb, neovim, tutorials, logo2, two_paths, quit_curve, secbg, recap, outro.
   Full illustrated environments, 3+ depth layers, light + glow, ambient motion, story beats at o.* times. */
(function () {
  const { K, C } = PX;
  const R = PX.rect;
  const E = PX.ease, P = PX.p, clamp = PX.clamp, lerp = PX.lerp;

  // ---------- local helpers ----------
  // scanline polygon fill (crisp pixel edges)
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
  const ell = (g, cx, cy, rx, ry, col) => { g.fillStyle = col; for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(1 - (y / ry) ** 2)); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
  const hex = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  // mix two #rrggbb colours
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); k = clamp(k, 0, 1); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * k)).join(",")})`; };
  const mixh = (a, b, k) => { const A = hex(a), B = hex(b); k = clamp(k, 0, 1); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const hsl = (h, s, l, a) => `hsla(${Math.round(((h % 360) + 360) % 360)},${s}%,${l}%,${a === undefined ? 1 : a})`;
  // outlined label
  const label = (g, s, x, y, o) => PX.otext(g, s, x, y, { align: "center", ...o });
  // comic burst with text (pops in with "back" easing over 0.18 s, lives `life` s)
  const burst = (g, x, y, str, t0, t, o) => {
    o = o || {}; const life = o.life || 0.55, age = t - t0;
    if (age < 0 || age > life) return;
    const k = E(age / 0.18, "back") * (age > life - 0.12 ? (life - age) / 0.12 : 1);
    const sz = o.size || 16, tw = PX.tw(g, str, { size: sz }), rw = (tw / 2 + 30) * k, rh = (sz / 2 + 20) * k, n = 14, pts = [];
    for (let i = 0; i < n * 2; i++) { const a = (i / (n * 2)) * Math.PI * 2, rr = i % 2 ? 0.72 : 1.08 + 0.12 * ((i * 7) % 3) / 2; pts.push([x + Math.cos(a) * rw * rr, y + Math.sin(a) * rh * rr]); }
    poly(g, pts.map(([a, b]) => [a + 2, b + 3]), "#05060a");
    poly(g, pts, o.bg || "#f7c948");
    poly(g, pts.map(([a, b]) => [x + (a - x) * 0.8, y + (b - y) * 0.75]), o.bg2 || "#ffe08a");
    if (k > 0.6) PX.otext(g, str, x, y - sz / 2, { size: sz, col: o.col || "#ff5c5c", align: "center" });
  };
  // night wall with soft vertical gradient + faint dithered texture
  const wall = (g, x, y, w, h, c0, c1) => { PX.vgrad(g, x, y, w, h, c0 || "151b33", c1 || "0c1020", 10); };

  // ======================= keeb =======================
  // extreme close-up of a mechanical keyboard: fingers strike keys, CLACK! pops, RGB under-glow.
  // o.rate strikes/s (5), o.pops = every Nth strike gets a CLACK! (3)
  K.keeb = (o) => {
    const LEG = [["ESC", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "="],
      ["TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]"],
      ["CAPS", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "ENTER"],
      ["SHIFT", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "SHIFT", ""]];
    const ROWS = [{ y: 70, s: 0.78, st: 0.0 }, { y: 112, s: 0.86, st: 0.5 }, { y: 160, s: 0.95, st: 0.75 }, { y: 214, s: 1.05, st: 1.25 }, { y: 274, s: 1.15, st: 0 }];
    const KW = 60, PITCH = 66, TH = 34, FH = 12;
    const keyX = (r, col) => 320 + (col - 6.2 + ROWS[r].st * 0.5) * PITCH * ROWS[r].s;
    // finger -> key (row 2 home keys), order of strikes
    const FING = [{ col: 1, side: -1 }, { col: 2, side: -1 }, { col: 3, side: -1 }, { col: 4, side: -1 }, { col: 7, side: 1 }, { col: 8, side: 1 }, { col: 9, side: 1 }, { col: 10, side: 1 }];
    const ORDER = [3, 6, 1, 4, 7, 2, 5, 0, 4, 3, 6, 5, 1, 7, 2, 4];
    const rate = o.rate || 5, popN = o.pops || 3;
    const accents = { "0,0": 1, "1,12": 1, "3,11": 1 };
    return (g, t, d, c) => {
      const si = Math.floor(t * rate), sp = t * rate - si;
      const cur = ORDER[((si % ORDER.length) + ORDER.length) % ORDER.length];
      // finger state: lift then strike
      const fz = (f) => { if (f !== cur) return 0; return sp < 0.45 ? -E(sp / 0.45, "out") : sp < 0.6 ? -1 + E((sp - 0.45) / 0.15, "in") * 1.4 : 0.4 - (sp - 0.6) * 1; };
      const down = (f) => f === cur && sp >= 0.55 && sp < 0.95;
      // ---- far: wall + desk, blurred bokeh items ----
      PX.par(g, c, 0.35, () => {
        PX.vgrad(g, 0, 0, 640, 40, "121733", "1c1a2e", 5);
        PX.vgrad(g, 0, 36, 640, 50, "2a2030", "3a2a28", 5);
        // monitor stand + screen glow spill (soft, out of focus)
        R(g, 270, 0, 100, 30, "#1b1f2e"); R(g, 300, 26, 40, 16, "#232838"); R(g, 286, 40, 68, 5, "#2b3042");
        PX.glow(g, 320, 0, 160, "rgba(90,160,255,0.35)");
        // mug (blurry, 2-tone)
        R(g, 120, 20, 30, 34, "#4a4f63"); R(g, 150, 28, 8, 14, "#3b3f50"); R(g, 122, 20, 26, 4, "#5c6178");
        for (let i = 0; i < 3; i++) { const k = (t * 0.5 + i / 3) % 1; g.globalAlpha = 0.25 * (1 - k); PX.circle(g, 134 + Math.sin(k * 5 + i) * 4, 16 - k * 22, 4 + k * 3, "#9aa4c0"); }
        g.globalAlpha = 1;
        // lamp + figurine
        R(g, 520, 0, 10, 40, "#2b2a33"); R(g, 506, 38, 38, 6, "#33313a");
        PX.glow(g, 525, 4, 120, "rgba(255,190,110,0.5)");
        R(g, 440, 24, 14, 22, "#3d5a4a"); R(g, 436, 42, 22, 6, "#5a3a2c");
        // bokeh discs
        const bk = [[60, 18, 9, "255,200,120"], [200, 10, 6, "120,180,255"], [395, 14, 8, "242,92,168"], [590, 22, 10, "255,200,120"], [480, 8, 5, "95,227,232"]];
        bk.forEach(([x, y, r, col], i) => { g.globalAlpha = 0.18 + 0.08 * Math.sin(t * 1.3 + i); PX.circle(g, x, y, r, `rgb(${col})`); g.globalAlpha = 0.25; PX.circle(g, x, y, r - 2, `rgb(${col})`); });
        g.globalAlpha = 1;
      });
      // ---- keyboard case ----
      R(g, 0, 50, 640, 310, "#16151f"); R(g, 0, 50, 640, 3, "#4a4660"); R(g, 0, 53, 640, 2, "#2c2a3a");
      R(g, 0, 58, 640, 302, "#0d0c14");
      // RGB under-glow on the plate
      for (let r = 0; r < 5; r++) {
        const Rw = ROWS[r];
        for (let col = -1; col < 15; col++) {
          const x = keyX(r, col), w = r === 4 ? KW * Rw.s : KW * Rw.s;
          if (r === 4 && (col < 2 || col > 10 || col % 1)) continue;
          PX.glow(g, x + w / 2, Rw.y + (TH + FH) * Rw.s, 34 * Rw.s, hsl(t * 80 + x * 0.5 + r * 30, 95, 60, 0.55));
        }
      }
      // keys
      const drawKey = (x, y, w, s, press, leg, acc, hue) => {
        const dy = Math.round(press * 6 * s), th = Math.round(TH * s), fh = Math.round(FH * s) - dy, inset = Math.round(5 * s);
        const pal = acc ? ["#ffd78a", "#f0a840", "#b86e22", "#8a4e14", "#5a300c"] : ["#7a83b0", "#4d5578", "#3a4160", "#2a3048", "#1c2034"];
        y += dy;
        // skirt (sides + front)
        R(g, x, y + 3, w, th + fh - 3, pal[3]);
        R(g, x + 1, y + th, w - 2, fh, pal[2]); R(g, x + 1, y + th, w - 2, 1, pal[1]);
        R(g, x, y + 3, 2, th + fh - 3, pal[2]); R(g, x + w - 2, y + 3, 2, th + fh - 3, pal[4]);
        R(g, x + 1, y + th + fh - 1, w - 2, 1, hsl(hue, 95, 62, 0.9));      // RGB rim light under the cap
        // top face (dished: lighter rim, darker centre-bottom)
        R(g, x + inset, y, w - inset * 2, th - 2, pal[1]);
        R(g, x + inset, y, w - inset * 2, 1, pal[0]); R(g, x + inset, y, 1, th - 3, pal[0]);
        R(g, x + inset + 2, y + th - 6, w - inset * 2 - 4, 3, pal[2]);
        R(g, x + w - inset - 1, y + 1, 1, th - 3, pal[2]);
        if (leg) {
          const big = s > 0.9 && leg.length === 1;
          PX.text(g, leg, x + inset + 4, y + 4, { size: big ? 16 : 8, col: acc ? "#5a300c" : "#c8cff0" });
        }
      };
      for (let r = 0; r < 4; r++) {
        const Rw = ROWS[r];
        for (let col = -1; col < 15; col++) {
          const x = keyX(r, col), w = Math.round(KW * Rw.s);
          if (x > 650 || x + w < -10) continue;
          const f = r === 2 ? FING.findIndex((F) => F.col === col) : -1;
          const press = f >= 0 && down(f) ? 1 : 0;
          drawKey(Math.round(x), Rw.y, w, Rw.s, press, LEG[r][col] || "", accents[r + "," + col] || (r === 2 && col === 12), t * 80 + x * 0.5 + r * 30);
        }
      }
      // spacebar row
      { const Rw = ROWS[4], s = Rw.s, thumbDown = cur === 4 || cur === 2 ? (sp > 0.55 && sp < 0.95 && si % 4 === 0 ? 1 : 0) : 0;
        drawKey(Math.round(keyX(4, 2.8)), Rw.y, Math.round(PITCH * s * 6 - 6), s, thumbDown, "", false, t * 80 + 200);
        drawKey(Math.round(keyX(4, 0.3)), Rw.y, Math.round(PITCH * s * 2.3), s, 0, "ALT", false, t * 80);
        drawKey(Math.round(keyX(4, 9.0)), Rw.y, Math.round(PITCH * s * 2.3), s, 0, "ALT", false, t * 80 + 320); }
      // light from the far monitor on the key tops
      PX.glow(g, 320, 40, 260, "rgba(110,150,255,0.14)");
      // ---- hands (fingers from the bottom edge, back of the hand to camera) ----
      const SK = ["#eab88a", "#c98a5c", "#9a5e3a", "#5a321e"];
      const finger = (tx, ty, bx, by, w0, w1, rim, nail) => {
        const n = Math.max(1, by - ty);
        for (let i = 0; i <= n; i++) {
          const y = ty + i, k = i / n, cx = lerp(tx, bx, k), wf = lerp(w0, w1, k);
          let ww = wf; const rr = w0 / 2; if (i < rr) ww = Math.round(Math.sqrt(Math.max(0, rr * rr - (rr - i) ** 2)) * 2);
          const x0 = Math.round(cx - ww / 2); ww = Math.round(ww);
          R(g, x0, y, ww, 1, SK[3]); R(g, x0 + 1, y, ww - 2, 1, SK[1]); R(g, x0 + 2, y, 3, 1, SK[0]); R(g, x0 + ww - 6, y, 5, 1, SK[2]);
          R(g, x0 + ww - 2, y, 1, 1, rim);
        }
        if (nail) { const nw = Math.round(w0 * 0.55), nx = Math.round(tx - nw / 2); R(g, nx, ty + 4, nw, 12, "#e9b9a0"); R(g, nx + 1, ty + 5, nw - 2, 10, "#f8dccb"); R(g, nx + 2, ty + 5, 3, 6, "#fff3ea"); R(g, nx + 1, ty + 15, nw - 2, 1, "#c98e74"); }
        for (const kk of [0.3, 0.62]) { const yy = Math.round(ty + n * kk), cx = lerp(tx, bx, kk), ww = lerp(w0, w1, kk); R(g, Math.round(cx - ww * 0.22), yy, Math.round(ww * 0.44), 1, SK[2]); R(g, Math.round(cx - ww * 0.14), yy + 2, Math.round(ww * 0.28), 1, SK[2]); }
      };
      const hand = (side) => {
        const fs = FING.map((F, i) => ({ ...F, i })).filter((F) => F.side === side);
        const px = side < 0 ? 186 : 454;
        // back of the hand + sleeve (drawn first, fingers overlap the knuckle line)
        for (let y = 250; y < 362; y++) { const k = (y - 250) / 112, top = y < 280 ? Math.sqrt(1 - ((280 - y) / 30) ** 2) : 1, w = Math.round((200 - k * 40) * top), x0 = Math.round(px - w / 2 + side * k * 14);
          if (w < 4) continue;
          R(g, x0, y, w, 1, SK[3]); R(g, x0 + 1, y, w - 2, 1, SK[1]); R(g, x0 + 2, y, 6, 1, SK[0]); R(g, x0 + w - 12, y, 11, 1, SK[2]); }
        for (let i = 0; i < 3; i++) { R(g, px - 30 + i * 30 + side * 4, 296 + i * 2, 2, 26, SK[2]); R(g, px - 29 + i * 30 + side * 4, 296 + i * 2, 1, 26, SK[0]); }   // tendons
        // sleeve cuff
        R(g, px - 100 + side * 10, 338, 200, 24, "#2f4a86"); R(g, px - 100 + side * 10, 338, 200, 3, "#4a68ad"); R(g, px - 100 + side * 10, 352, 200, 2, "#22356a");
        fs.forEach((F, j) => {
          const Rw = ROWS[2], kx = keyX(2, F.col) + KW * Rw.s / 2, lift = fz(F.i);
          const pinky = F.col === 1 || F.col === 10;
          const tx = kx, ty = Rw.y + 4 + Math.round(lift * 10) + (down(F.i) ? 6 : 0);
          const bx = lerp(px + (j - 1.5) * 46, tx, 0.35);
          finger(Math.round(tx), Math.round(ty), Math.round(bx), 262 + Math.abs(j - 1.5) * 6, pinky ? 34 : 40, pinky ? 38 : 46, hsl(t * 80 + kx * 0.5, 90, 65, 0.9), true);
          R(g, Math.round(bx - 10), 262 + Math.abs(j - 1.5) * 6, 20, 3, SK[0]);   // knuckle highlight
        });
        // thumb toward the spacebar
        finger(px - side * 96, 270, px - side * 70, 330, 36, 44, SK[2], true);
      };
      hand(-1); hand(1);
      { const gr = g.createLinearGradient(0, 290, 0, 360); gr.addColorStop(0, "rgba(8,10,24,0)"); gr.addColorStop(1, "rgba(8,10,24,0.55)"); g.fillStyle = gr; g.fillRect(0, 290, 640, 70); }
      // ---- CLACK! pops ----
      for (let k = 0; k < 3; k++) {
        const s0 = si - k; if (s0 < 0 || s0 % popN) continue;
        const f = ORDER[s0 % ORDER.length], Rw = ROWS[2], kx = keyX(2, FING[f].col) + 30;
        burst(g, clamp(kx + (s0 % 2 ? 40 : -40), 110, 530), Rw.y - 34 - (s0 % 3) * 6, s0 % 6 === 0 ? "CLICK!" : "CLACK!", (s0 + 0.55) / rate, t, { life: 0.5 });
      }
      PX.particles(g, 5, 30, t, [0, 0, 640, 200], { vy: -2, vx: 1.5, col: "#cfd8ff", a: 0.35 });
      PX.vignette(g, 0.55);
    };
  };
  // ---------- shared room pieces for this file ----------
  // wall calendar page: day name + number; previous page flips up over the binding for 0.35 s after each day time
  const calendar = (g, x, y, w, h, t, days, names, nums) => {
    let i = 0; for (let k = 0; k < days.length; k++) if (t >= days[k]) i = k + 1;
    const drawPage = (j, yy, hh, back) => {
      R(g, x, yy, w, hh, back ? "#b9b1a0" : "#ece4d2"); R(g, x, yy, w, 1, "#fff8e8"); R(g, x + w - 2, yy, 2, hh, "#c9bfa8");
      if (back || hh < h * 0.6) return;
      const nm = names[Math.min(j, names.length - 1)], col = nm === "SAT" || nm === "SUN" ? "#d9483b" : "#2b3044";
      PX.text(g, nm, x + w / 2, yy + 6, { size: 16, col, align: "center" });
      PX.text(g, String(nums[Math.min(j, nums.length - 1)]), x + w / 2, yy + 28, { size: 32, col, align: "center" });
      for (let r = 0; r < 2; r++) for (let q = 0; q < 6; q++) R(g, x + 6 + q * ((w - 12) / 6), yy + hh - 12 + r * 5, 3, 2, "#c4baa4");
    };
    R(g, x + 3, y + 3, w, h + 16, "rgba(0,0,0,.35)");
    R(g, x, y + 12, w, h + 4, "#c9c0ab"); R(g, x, y + 12, w, h + 2, "#ddd4c0");
    const ft = i > 0 ? t - days[i - 1] : 9, fp = clamp(ft / 0.35, 0, 1);
    drawPage(i, y + 12, h, false);
    if (fp < 1) {
      const k = E(fp, "in"), hh = Math.max(1, Math.round(h * Math.abs(Math.cos(k * Math.PI))));
      if (k < 0.5) { R(g, x, y + 12, w, h, "rgba(0,0,0,.25)"); drawPage(i - 1, y + 12, hh, false); } else drawPage(i - 1, y + 12 - hh, hh, true);
    }
    R(g, x, y, w, 12, "#c0392b"); R(g, x, y, w, 2, "#e0604f"); R(g, x, y + 10, w, 2, "#8e2a20");
    PX.text(g, "NOV", x + w / 2, y + 2, { size: 8, col: "#ffe8d8", align: "center" });
    R(g, x + w / 2 - 1, y - 6, 2, 6, "#5a5a6a"); R(g, x + w / 2 - 2, y - 7, 4, 2, "#8a8a9a");
  };
  // window with a time-of-day sky (dl: 0 night .. 1 day), sunA = arc phase 0..1
  const timeWindow = (g, x, y, w, h, t, dl, sunA) => {
    const top = mixh("10163a", "4f9bd8", dl), bot = mixh("2c2350", dl > 0.5 ? "bfe2f2" : "f08a5c", dl < 0.5 ? dl * 1.6 : dl);
    PX.vgrad(g, x, y, w, h, top.slice(1), bot.slice(1), 8);
    const r = PX.rnd(17);
    for (let i = 0; i < 26; i++) { const sx = x + r() * w, sy = y + r() * h * 0.6, ph = r() * 6; g.globalAlpha = (1 - dl) * (0.4 + 0.6 * Math.abs(Math.sin(t * 2 + ph))); R(g, sx, sy, 1, 1, "#fff"); }
    g.globalAlpha = 1;
    const ph = ((sunA % 1) + 1) % 1, ax = x + w * (0.15 + 0.7 * ph), ay = y + h * 0.75 - Math.sin(ph * Math.PI) * h * 0.55;
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    if (dl > 0.5) { PX.glow(g, ax, ay, 30, "rgba(255,230,150,0.7)"); PX.circle(g, ax, ay, 8, "#fff2b8"); PX.circle(g, ax - 1, ay - 1, 6, "#fffbe0"); }
    else { PX.circle(g, ax, ay, 7, "#f4f1d0"); PX.circle(g, ax + 3, ay - 2, 6, top); }
    for (let i = 0; i < 3; i++) { const cx = x + ((i * 53 + t * 6) % (w + 40)) - 20, cy = y + 14 + i * 13; g.globalAlpha = 0.5 + dl * 0.4;
      const cc = mixh("3a3560", "f4f8ff", dl); R(g, cx, cy, 22, 4, cc); R(g, cx + 5, cy - 3, 12, 3, cc); }
    g.globalAlpha = 1;
    const rr = PX.rnd(23); let bx = x - 2;
    while (bx < x + w) { const bw = 10 + Math.floor(rr() * 16), bh = 10 + rr() * 28; R(g, bx, y + h - bh, bw, bh, mixh("141833", "5a6f8f", dl * 0.8));
      for (let wy = y + h - bh + 3; wy < y + h - 2; wy += 5) for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) if (rr() < 0.35) R(g, wx, wy, 2, 2, dl < 0.5 ? "#f7c948" : "#8fa7c4");
      bx += bw + 1; }
    g.restore();
    R(g, x - 5, y - 5, w + 10, 5, "#2a2f45"); R(g, x - 5, y + h, w + 10, 5, "#2a2f45"); R(g, x - 5, y, 5, h, "#2a2f45"); R(g, x + w, y, 5, h, "#2a2f45");
    R(g, x + w / 2 - 2, y, 4, h, "#2a2f45"); R(g, x, y + h / 2 - 2, w, 4, "#2a2f45");
    R(g, x - 5, y - 5, w + 10, 1, "#454b66"); R(g, x - 8, y + h + 5, w + 16, 5, "#363c55"); R(g, x - 8, y + h + 5, w + 16, 1, "#565e80");
  };
  // energy drink can (12x20); lying = on its side (22x12)
  const can = (g, x, y, col, lying) => {
    const [hi, base, sh] = col;
    if (lying) { R(g, x, y + 2, 20, 10, base); R(g, x, y + 2, 20, 2, hi); R(g, x, y + 10, 20, 2, sh); R(g, x + 6, y + 4, 7, 6, "#1b1f2e"); R(g, x + 20, y + 3, 2, 8, "#b8c0cc"); R(g, x - 1, y + 3, 1, 8, "#8a92a0"); return; }
    R(g, x, y, 12, 20, base); R(g, x, y, 3, 20, hi); R(g, x + 9, y, 3, 20, sh);
    R(g, x, y, 12, 2, "#c8d0dc"); R(g, x + 1, y - 1, 10, 1, "#9aa4b2"); R(g, x, y + 18, 12, 2, "#8a92a0");
    R(g, x + 1, y + 7, 10, 6, "#1b1f2e"); R(g, x + 3, y + 8, 6, 1, hi); R(g, x + 4, y + 10, 4, 1, hi);
  };
  const CANS = [["#b8ff7a", "#62d23a", "#2f8a1c"], ["#ff9ad0", "#f25ca8", "#a02a6a"], ["#9af6ff", "#3ac0d8", "#1e7088"], ["#ffe08a", "#f7c948", "#a87c1c"]];

  // ======================= neovim =======================
  // monitor fills the frame: NVIM splash, 412 plugins installing, calendar FRI->SAT->SUN, window day/night, cans pile up.
  // o.splash 1.3 (splash ends), o.days [1.5,3,4.5], o.done 5.8 ("0 projects" blinks)
  K.neovim = (o) => {
    const L5 = { N: ["X...X", "XX..X", "X.X.X", "X..XX", "X...X"], V: ["X...X", "X...X", "X...X", ".X.X.", "..X.."], I: ["XXX", ".X.", ".X.", ".X.", "XXX"], M: ["X...X", "XX.XX", "X.X.X", "X...X", "X...X"] };
    const NAMES = ["fancy-statusline", "icon-pack", "auto-pairs", "theme-collection", "lsp-setup", "fuzzy-finder", "git-gutter", "smooth-scroll", "which-key", "start-dashboard",
      "file-tree", "minimap", "zen-mode", "indent-rainbow", "cursor-trail", "snippets-pack", "tab-bar-pro", "colorizer", "surround", "comment-toggle", "dim-inactive", "scrollbar-glow"];
    const rc = PX.rnd(77), CPOS = [];
    [[5, 0], [4, 1], [3, 2], [2, 3], [1, 4]].forEach(([n, row]) => { for (let i = 0; i < n; i++) CPOS.push([i * 13 + row * 6.5, -row * 21, 0]); });
    CPOS.push([-30, 8, 1], [76, 9, 1], [-18, 0, 0]);
    const CC = CPOS.map(() => Math.floor(rc() * 4));
    return (g, t, d, c) => {
      const days = o.days || [d * 0.214, d * 0.43, d * 0.643], done = o.done !== undefined ? o.done : d * 0.83, splash = o.splash !== undefined ? o.splash : d * 0.19;
      let u; if (t < days[0]) u = 0.2 + 0.3 * (t / days[0]); else { let k = 0; while (k + 1 < days.length && t >= days[k + 1]) k++;
        const per = k + 1 < days.length ? days[k + 1] - days[k] : days[1] - days[0]; u = 0.5 + k + (t - days[k]) / per; }
      const dl = clamp(0.5 + 0.5 * Math.cos(u * Math.PI * 2) * 1.6, 0, 1);
      // wall
      PX.vgrad(g, 0, 0, 640, 280, mixh("151b33", "2a3558", dl * 0.6).slice(1), "0c1020", 10);
      PX.par(g, c, 0.55, () => {
        timeWindow(g, 506, 30, 116, 140, t, dl, u - 0.25);
        PX.glow(g, 564, 120, 150, dl > 0.3 ? "rgba(255,220,160,0.35)" : "rgba(120,140,255,0.18)", 0.4 + dl * 0.6);
        calendar(g, 38, 58, 70, 76, t, days, ["FRI", "SAT", "SUN", "MON"], [13, 14, 15, 16]);
        R(g, 44, 180, 58, 40, "#1e2438"); R(g, 46, 182, 54, 36, "#2a3150"); PX.text(g, ":wq", 73, 196, { size: 8, col: "#f7c948", align: "center" });
      });
      // desk
      PX.vgrad(g, 0, 266, 640, 94, "4a3424", "1e150e", 7); R(g, 0, 266, 640, 2, "#7a573d");
      { const rg = PX.rnd(5); for (let i = 0; i < 26; i++) { const y = 272 + Math.floor(rg() * 86), x = rg() * 640; R(g, x, y, 30 + rg() * 80, 1, "rgba(20,12,6,.45)"); } }
      PX.glow(g, 300, 270, 240, "rgba(80,200,170,0.22)");
      // monitor
      const mx = 116, my = 14, mw = 372, mh = 246, sx = mx + 10, sy = my + 10, sw = mw - 20, sh = mh - 22;
      R(g, 280, 258, 40, 12, "#1b1e26"); R(g, 262, 266, 76, 4, "#2a2e38"); R(g, 262, 266, 76, 1, "#454b5c");
      R(g, mx, my, mw, mh, "#1d2029"); R(g, mx, my, mw, 2, "#3e4352"); R(g, mx, my, 2, mh, "#2f3341"); R(g, mx + mw - 2, my, 2, mh, "#121419"); R(g, mx, my + mh - 3, mw, 3, "#14161c");
      R(g, mx + mw - 18, my + mh - 8, 3, 2, PX.blink(t, 2, 0.8) ? "#3df56b" : "#1c5a2c");
      R(g, sx, sy, sw, sh, "#0b0f16");
      g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
      const tf = (s, x, y, col, sz) => PX.text(g, s, x, y, { font: "v", size: sz || 12, col });
      if (t < done) {
        R(g, sx, sy + sh - 11, sw, 11, "#1f2a3a"); R(g, sx, sy + sh - 11, 46, 11, t < splash ? "#3aa86b" : "#c98a2a");
        tf(t < splash ? "NORMAL" : "LAZY", sx + 5, sy + sh - 12, "#0b0f16"); tf("init.lua", sx + 54, sy + sh - 12, "#9aa8bd"); tf("utf-8  lua", sx + sw - 64, sy + sh - 12, "#6b7a90");
      }
      if (t < splash) {
        const cell = 11; let cx0 = sx + sw / 2 - (21 * cell) / 2, n = 0;
        for (const ch of "NVIM") {
          const m = L5[ch];
          for (let r = 0; r < 5; r++) for (let q = 0; q < m[r].length; q++) if (m[r][q] === "X") {
            n++; const app = clamp((t - n * 0.012) / 0.15, 0, 1); if (app <= 0) continue;
            const x = cx0 + q * cell, y = sy + 46 + r * cell - Math.round((1 - E(app, "back")) * 8);
            const k = (x - sx) / sw, base = mix("3fbf7a", "3aa0d8", k), hi = mix("8ff0b0", "8fd8ff", k);
            R(g, x, y, cell - 1, cell - 1, base); R(g, x, y, cell - 1, 2, hi); R(g, x, y + cell - 3, cell - 1, 2, "#1d4f5a");
          }
          cx0 += (m[0].length + 1) * cell;
        }
        tf("NVIM v0.10 - the editor you will configure forever", sx + sw / 2 - 120, sy + 116, "#6b7a90");
        const menu = ["  New file          e", "  Find file         f", "  Config (again)    c", "  Quit              q"];
        menu.forEach((m, i) => tf(m, sx + sw / 2 - 70, sy + 136 + i * 13, i === 2 ? "#f7c948" : "#9aa8bd"));
        R(g, sx + sw / 2 - 76, sy + 136 + 2 * 13 + 2, 3, 9, PX.blink(t, 0.6) ? "#f7c948" : "#0b0f16");
      } else if (t < done) {
        const pp = clamp((t - splash) / (done - 0.25 - splash), 0, 1), total = 412, cnt = Math.max(1, Math.floor(E(pp, "io") * total));
        R(g, sx, sy, sw, 14, "#15202e"); tf("PLUGIN MANAGER", sx + 6, sy + 1, "#5fe3e8"); tf(`${cnt}/${total}`, sx + sw - 50, sy + 1, "#f7c948");
        R(g, sx + 6, sy + 18, sw - 12, 6, "#1b2636"); R(g, sx + 6, sy + 18, Math.round((sw - 12) * cnt / total), 6, "#3aa86b"); R(g, sx + 6, sy + 18, Math.round((sw - 12) * cnt / total), 1, "#7fe0a0");
        const rows = 13, lh = 13;
        const first = Math.max(1, cnt - rows + 1);
        for (let r = 0; r < rows; r++) {
          const idx = first + r; if (idx > cnt) break;
          const y = sy + 30 + r * lh, cur = idx === cnt, nm = NAMES[idx % NAMES.length] + (idx > NAMES.length ? "-" + (idx % 9 + 2) : "");
          if (cur) {
            R(g, sx + 2, y - 1, sw - 4, lh, "#1a2a24");
            tf(`installing plugin ${idx}/${total}`, sx + 8, y - 1, "#e6edf3");
            const fill = Math.floor(((t * 9) % 1) * 6);
            for (let b = 0; b < 6; b++) R(g, sx + 150 + b * 8, y + 2, 6, 7, b < fill ? "#3df56b" : "#24342c");
            tf(nm, sx + 206, y - 1, "#8fd8ff");
          } else { tf("+", sx + 8, y - 1, "#3df56b"); tf(nm, sx + 18, y - 1, "#9aa8bd"); tf(`${(idx * 37) % 90 + 4}ms`, sx + sw - 40, y - 1, "#4d5a6e"); }
        }
      } else {
        PX.glow(g, sx + sw / 2, sy + sh / 2, 120, "rgba(255,92,92,0.12)");
        tf("+ 412 plugins installed", sx + sw / 2 - 66, sy + 54, "#3df56b", 14);
        tf("+ 3 colour schemes perfected", sx + sw / 2 - 66, sy + 70, "#3df56b", 14);
        const k = E((t - done) / 0.3, "back");
        if (PX.blink(t - done, 0.7, 0.62) || t - done < 0.6) PX.text(g, "0 projects", sx + sw / 2, sy + 104 + (1 - k) * 10, { size: 24, col: "#ff5c5c", align: "center" });
        tf("> _", sx + 12, sy + sh - 20, "#6b7a90", 14);
      }
      g.restore();
      R(g, sx, sy, sw, 1, "rgba(255,255,255,.08)");
      PX.glow(g, mx + mw / 2, my + mh / 2, 230, t >= done ? "rgba(255,90,90,0.10)" : "rgba(80,200,170,0.10)");
      // desk things: keyboard, mouse, cans, plant, mug
      R(g, 210, 290, 190, 16, "#22252e"); R(g, 210, 290, 190, 1, "#454b5c");
      for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 23; kx++) R(g, 214 + kx * 8, 292 + ky * 4, 7, 3, (Math.floor(t * 6) + kx * 7 + ky) % 31 === 0 ? "#8fd8ff" : "#3a3f4c");
      R(g, 420, 296, 12, 8, "#2a2e38"); R(g, 420, 296, 12, 1, "#555c6e"); R(g, 425, 297, 1, 3, "#111");
      const nCans = Math.floor(clamp((t - 0.4) / (done - 0.4), 0, 1) * CPOS.length);
      for (let i = 0; i < Math.min(CPOS.length, nCans + 1); i++) {
        const ti = 0.4 + (i / CPOS.length) * (done - 0.4), a = clamp((t - ti) / 0.3, 0, 1); if (a <= 0) continue;
        const [cx, cy, ly] = CPOS[i], dy = -(1 - E(a, "back")) * 60;
        if (!ly) { R(g, 520 + cx, 286 + cy + 1, 12, 2, "rgba(0,0,0,.4)"); can(g, 520 + cx, 266 + cy + dy, CANS[CC[i]], false); }
        else can(g, 520 + cx, 278 + cy + dy, CANS[CC[i]], true);
      }
      R(g, 60, 248, 20, 20, "#7a4a2c"); R(g, 60, 248, 20, 2, "#9a6a4c"); R(g, 64, 232, 4, 16, "#3d8a4a"); R(g, 70, 226, 4, 22, "#4aa85a"); R(g, 58, 236, 8, 4, "#3d8a4a"); R(g, 72, 230, 9, 4, "#4aa85a");
      PX.core.mug(g, 94, 256, t);
      // phone face-up: missed calls pile up too (buzzes now and then)
      { const ph = Math.floor(t / 1.1), buzz = (t % 1.1) < 0.35, bx = 452 + (buzz ? Math.round(Math.sin(t * 90)) : 0), by = 318;
        R(g, bx, by + 2, 56, 26, "rgba(0,0,0,.4)"); R(g, bx - 2, by - 2, 56, 26, "#15171d"); R(g, bx - 2, by - 2, 56, 1, "#3a3f4c");
        R(g, bx, by, 52, 22, buzz ? "#20324a" : "#0e1420");
        if (buzz || t % 1.1 < 0.8) { PX.text(g, "MISSED: " + (3 + ph * 2), bx + 3, by + 1, { font: "v", size: 10, col: "#ff8a8a" }); PX.text(g, "MOM CALLING", bx + 3, by + 10, { font: "v", size: 10, col: "#c9d1d9" }); }
        if (buzz) { PX.glow(g, bx + 22, by + 8, 40, "rgba(120,170,255,0.35)"); R(g, bx - 6, by + 4, 2, 1, "#9aa4b2"); R(g, bx + 48, by + 9, 2, 1, "#9aa4b2"); } }
      // foreground: crumpled snack bag + crumbs (nearest layer, moves a bit more than the world)
      PX.par(g, c, 1.15, () => {
        poly(g, [[-6, 318], [34, 300], [70, 312], [86, 344], [60, 366], [-6, 366]], "#a8501c");
        poly(g, [[-2, 322], [32, 306], [62, 316], [74, 340], [52, 360], [-2, 360]], "#e07a2a");
        poly(g, [[6, 326], [30, 314], [52, 322], [44, 336], [14, 340]], "#f7c948"); R(g, 18, 324, 18, 2, "#ffe08a"); R(g, 34, 302, 20, 2, "#f09a4a");
        R(g, 24, 328, 14, 6, "#d9483b"); R(g, 26, 330, 10, 1, "#ffd0b0");
        [[96, 332], [104, 340], [90, 346], [118, 336], [110, 350]].forEach(([x, y]) => { R(g, x, y, 2, 2, "#e0a04a"); R(g, x, y + 2, 2, 1, "#6a3a1a"); });
      });
      PX.particles(g, 9, 24, t, [0, 20, 640, 240], { vy: -2, vx: 1, col: "#cfe8ff", a: 0.35 });
      PX.vignette(g, 0.5);
    };
  };
  // ======================= tutorials =======================
  // video site on a big monitor: player at 2x, 8 thumbnails whose progress bars fill one after another,
  // counter WATCHED 1 -> 347, viewer's head + glasses (screen reflection) in the foreground.
  // o.from 1, o.to 347
  K.tutorials = (o) => {
    const TITLES = ["PYTHON IN 10 MIN", "JS CRASH COURSE", "LEARN C++ FAST", "REACT IN 1 HOUR", "SQL FOR BEGINNERS", "RUST BASICS", "GIT EXPLAINED", "DSA FULL COURSE"];
    const DUR = ["10:04", "42:17", "1:02:33", "58:09", "23:41", "3:12:00", "17:55", "11:48:20"];
    const TH = ["#2a3a6a", "#4a2a5a", "#1e4a4a", "#5a3a1e", "#2a4a2a", "#5a1e2e", "#3a3a3a", "#1e3a5a"];
    const rt = PX.rnd(31), LINES = TH.map(() => [...Array(5)].map(() => [rt() * 0.4, 0.2 + rt() * 0.5, Math.floor(rt() * 4)]));
    const LC = ["#ff7b72", "#d2a8ff", "#a5d6ff", "#7ee787"];
    return (g, t, d, c) => {
      const from = o.from || 1, to = o.to || 347;
      const pAll = clamp(t / (d * 0.92), 0, 1), cnt = Math.round(from + (to - from) * Math.pow(pAll, 1.8));
      // wall + far props
      PX.vgrad(g, 0, 0, 640, 270, "141a33", "0b0f20", 10);
      PX.par(g, c, 0.5, () => {
        R(g, 548, 26, 80, 96, "#2a2f45"); PX.core.skyline(g, 552, 30, 72, 88, t, 9); R(g, 586, 30, 3, 88, "#2a2f45"); R(g, 544, 120, 88, 5, "#363c55");
        R(g, 6, 40, 52, 4, "#4a3626"); R(g, 6, 44, 52, 2, "#2c1f15");
        ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#d35400"].forEach((col, i) => { R(g, 10 + i * 8, 22 + (i % 2) * 3, 6, 18 - (i % 2) * 3, col); R(g, 10 + i * 8, 22 + (i % 2) * 3, 1, 18, "rgba(255,255,255,.25)"); });
        R(g, 14, 120, 40, 52, "#1e2438"); R(g, 16, 122, 36, 48, "#3a2a50"); PX.text(g, "10X", 34, 136, { size: 8, col: "#f25ca8", align: "center" }); PX.text(g, "DEV", 34, 150, { size: 8, col: "#5fe3e8", align: "center" });
      });
      // desk
      PX.vgrad(g, 0, 262, 640, 98, "3e2c20", "1a120c", 6); R(g, 0, 262, 640, 2, "#6a4a33");
      // monitor
      const mx = 66, my = 12, mw = 462, mh = 244, sx = mx + 9, sy = my + 9, sw = mw - 18, sh = mh - 20;
      PX.glow(g, mx + mw / 2, my + mh / 2, 300, "rgba(90,150,255,0.16)");
      R(g, 280, 254, 40, 10, "#1b1e26"); R(g, 260, 262, 80, 4, "#2a2e38"); R(g, 260, 262, 80, 1, "#454b5c");
      R(g, mx, my, mw, mh, "#1d2029"); R(g, mx, my, mw, 2, "#3e4352"); R(g, mx, my, 2, mh, "#2f3341"); R(g, mx + mw - 2, my, 2, mh, "#121419");
      R(g, sx, sy, sw, sh, "#12151d");
      // site header
      R(g, sx, sy, sw, 16, "#1a1e28");
      R(g, sx + 6, sy + 3, 16, 10, "#e0505a"); poly(g, [[sx + 12, sy + 5], [sx + 18, sy + 8], [sx + 12, sy + 11]], "#ffe8e8");
      PX.text(g, "VIDS", sx + 26, sy + 1, { font: "v", size: 14, col: "#e6edf3" });
      R(g, sx + 120, sy + 3, 170, 10, "#0d1017"); R(g, sx + 120, sy + 3, 170, 1, "#2a2f3c"); PX.text(g, "learn coding fast no effort", sx + 124, sy + 2, { font: "v", size: 11, col: "#8a94a8" });
      PX.circle(g, sx + sw - 12, sy + 8, 5, "#5fa8e8");
      // player
      const px0 = sx + 6, py0 = sy + 22, pw = 280, ph = 150;
      R(g, px0, py0, pw, ph, "#000");
      // tutorial content: big code typed at 2x, on loop
      R(g, px0 + 1, py0 + 1, pw - 2, ph - 16, "#0d1117"); R(g, px0 + 1, py0 + 1, pw - 2, 12, "#161b22"); PX.text(g, "tutorial.py", px0 + 6, py0 + 1, { font: "v", size: 12, col: "#c9d1d9" });
      { const TUT = [[["def", "#ff7b72"], [" greet", "#d2a8ff"], ["(name):", "#c9d1d9"]], [["    return", "#ff7b72"], [" f", "#c9d1d9"], ['"hi {name}"', "#a5d6ff"]], [["", "#000"]],
          [["for", "#ff7b72"], [" i ", "#c9d1d9"], ["in", "#ff7b72"], [" range", "#d2a8ff"], ["(3):", "#c9d1d9"]], [["    print", "#d2a8ff"], ["(greet(", "#c9d1d9"], ['"you"', "#a5d6ff"], ["))", "#c9d1d9"]], [["", "#000"]], [["# easy right? next video ->", "#7d8590"]]];
        let n = Math.floor(((t * 2) % 5) * 36), lx = 0, ly = 0;
        TUT.forEach((ln, i) => { let x = px0 + 24; if (n < 0) return; PX.text(g, String(i + 1), px0 + 14, py0 + 18 + i * 15, { font: "v", size: 14, col: "#484f58", align: "right" });
          for (const [s0, col] of ln) { const k = clamp(n, 0, s0.length); x += PX.text(g, s0.slice(0, k), x, py0 + 18 + i * 15, { font: "v", size: 14, col }); n -= s0.length; if (n < 0) break; }
          lx = x; ly = py0 + 18 + i * 15; n -= 1; });
        if (PX.blink(t, 0.5)) R(g, lx + 1, ly + 2, 5, 11, "#e6edf3"); }
      // instructor webcam bubble (talks fast)
      { const cx = px0 + pw - 26, cy = py0 + ph - 42; PX.circle(g, cx, cy, 17, "#2a3550"); PX.circle(g, cx, cy, 15, "#3a4a6e");
        R(g, cx - 7, cy - 9, 14, 16, "#d9a066"); R(g, cx - 7, cy - 9, 14, 3, "#3a2416"); R(g, cx - 8, cy - 11, 16, 4, "#3a2416"); R(g, cx + 5, cy - 6, 2, 12, "#b07a48");
        R(g, cx - 4, cy - 3, 2, 2, "#111"); R(g, cx + 2, cy - 3, 2, 2, "#111");
        R(g, cx - 3, cy + 3, 6, Math.abs(Math.sin(t * 22)) > 0.5 ? 3 : 1, "#5a1e1e"); R(g, cx - 9, cy + 8, 18, 6, "#5fa8e8"); }
      // 2x badge
      { const k = 1 + 0.15 * Math.max(0, Math.sin(t * 6)); const bx = px0 + pw - 50, by = py0 + 18, bs = Math.round(Math.max(0, Math.sin(t * 6)) * 2);
        R(g, bx - bs, by - bs, 30 + bs * 2, 16 + bs * 2, "#f7c948"); R(g, bx - bs, by - bs, 30 + bs * 2, 1, "#ffe8a0"); R(g, bx - bs, by + 15 + bs, 30 + bs * 2, 1, "#a87c1c"); PX.text(g, "2x", bx + 7, by + 4, { size: 8, col: "#3a2400" });
        poly(g, [[bx + 34, by + 3], [bx + 40, by + 8], [bx + 34, by + 13]], "#f7c948"); poly(g, [[bx + 40, by + 3], [bx + 46, by + 8], [bx + 40, by + 13]], "#f7c948"); }
      // controls + racing progress
      const vp = ((t * 0.45) % 1);
      R(g, px0, py0 + ph - 14, pw, 14, "rgba(10,12,18,.92)"); R(g, px0 + 4, py0 + ph - 13, pw - 8, 2, "#3a3f4c"); R(g, px0 + 4, py0 + ph - 13, Math.round((pw - 8) * vp), 2, "#f25ca8");
      PX.circle(g, px0 + 4 + Math.round((pw - 8) * vp), py0 + ph - 12, 2, "#ff9ad0");
      const secs = Math.floor(vp * 600); PX.text(g, `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")} / 10:00`, px0 + 22, py0 + ph - 11, { font: "v", size: 11, col: "#c9d1d9" });
      poly(g, [[px0 + 6, py0 + ph - 9], [px0 + 12, py0 + ph - 6], [px0 + 6, py0 + ph - 3]], "#e6edf3");
      PX.text(g, "PYTHON IN 10 MIN (PART " + cnt + ")", px0, py0 + ph + 4, { font: "v", size: 14, col: "#e6edf3" });
      PX.text(g, "2.1M views  -  you have watched this " + Math.max(1, Math.floor(cnt / 40)) + "x", px0, py0 + ph + 17, { font: "v", size: 11, col: "#7d8590" });
      // thumbnail grid (2 x 4), bars fill one after another
      const gx = px0 + pw + 8, gy = py0, tw = 68, th = 38;
      for (let i = 0; i < 8; i++) {
        const x = gx + (i % 2) * (tw + 6), y = gy + Math.floor(i / 2) * (th + 15);
        const t0 = (i / 8) * d * 0.9, fp = clamp((t - t0) / (d * 0.9 / 8), 0, 1), cur = fp > 0 && fp < 1;
        R(g, x - 1, y - 1, tw + 2, th + 2, cur ? "#f25ca8" : "#1a1e28");
        R(g, x, y, tw, th, TH[i]);
        LINES[i].forEach(([a, w, cidx], r) => R(g, x + 4 + a * 20, y + 5 + r * 5, Math.round(w * (tw - 20)), 2, LC[cidx]));
        PX.text(g, TITLES[i].split(" ")[0], x + 4, y + th - 13, { font: "v", size: 12, col: "#f7c948" });
        const dw = PX.tw(g, DUR[i], { font: "v", size: 10 }); R(g, x + tw - dw - 4, y + th - 10, dw + 3, 9, "rgba(0,0,0,.8)"); PX.text(g, DUR[i], x + tw - dw - 2, y + th - 11, { font: "v", size: 10, col: "#e6edf3" });
        R(g, x, y + th - 2, tw, 2, "#2a2f3c"); R(g, x, y + th - 2, Math.round(tw * fp), 2, "#ff4d6d");
        if (fp >= 1) { R(g, x, y, tw, th - 2, "rgba(10,12,20,.5)"); R(g, x + 3, y + 3, 11, 10, "#3df56b"); R(g, x + 3, y + 3, 11, 1, "#a0ffb8"); R(g, x + 5, y + 8, 2, 2, "#0b2a14"); R(g, x + 7, y + 9, 2, 2, "#0b2a14"); R(g, x + 9, y + 7, 2, 2, "#0b2a14"); R(g, x + 11, y + 5, 2, 2, "#0b2a14"); }
        PX.text(g, TITLES[i].slice(0, 12), x, y + th + 1, { font: "v", size: 10, col: "#9aa4b2" });
      }
      R(g, sx, sy, sw, 1, "rgba(255,255,255,.08)");
      // desk props: keyboard edge, popcorn bowl
      R(g, 220, 280, 150, 12, "#22252e"); R(g, 220, 280, 150, 1, "#454b5c");
      PX.glow(g, 300, 270, 200, "rgba(90,150,255,0.14)");
      PX.par(g, c, 1.12, () => {
        // popcorn bowl, front-left
        for (let y = 0; y < 34; y++) { const w = Math.round(120 - y * y * 0.05); R(g, 70 - w / 2, 318 + y, w, 1, y < 3 ? "#e85a5a" : y % 8 < 4 ? "#c0392b" : "#f2e6d8"); }
        const rp = PX.rnd(8), PC = [];
        for (let i = 0; i < 70; i++) { const u = rp() * 2 - 1, v = rp(); PC.push([70 + u * 56, 320 - v * (1 - u * u) * 22]); }
        PC.sort((p, q) => p[1] - q[1]).forEach(([x, y], i) => { PX.circle(g, x, y, 4, i % 3 ? "#f2e2bc" : "#e0c890"); R(g, x - 2, y - 3, 3, 2, "#fff8e8"); R(g, x + 1, y + 2, 3, 1, "#b8955a"); });
        // a kernel hopping out now and then
        const hp = (t * 0.9) % 1; R(g, 104 + hp * 30, 300 - Math.sin(hp * Math.PI) * 26, 4, 3, "#fff4d8");
      });
      // viewer: back of the head, cheek + glasses lens with the screen reflected in it
      PX.par(g, c, 1.2, () => {
        const hx = 566, hy = 292, bob = Math.round(Math.sin(t * 1.6) * 1.5);
        // shoulders (hoodie)
        for (let y = 318; y < 362; y++) { const w = Math.round(210 + (y - 318) * 2.2); R(g, hx - w / 2 + 10, y, w, 1, "#1e2944"); R(g, hx - w / 2 + 10, y, 4, 1, "#3a4c7a"); }
        R(g, hx - 80, 318, 120, 2, "#3a4c7a");
        R(g, hx - 22, 300 + bob, 44, 26, "#7a5236"); R(g, hx - 22, 300 + bob, 6, 26, "#a87a50");
        // head: hair mass, then the side of the face (turned toward the screen) inside the head silhouette
        const HR = 60, HV = 64, span = (cx, cy, rx, ry, y) => { const k = 1 - ((y - cy) / ry) ** 2; if (k <= 0) return null; const w = rx * Math.sqrt(k); return [cx - w, cx + w]; };
        for (let y = hy - HV; y <= hy + HV; y++) {
          const hs = span(hx, hy, HR, HV, y); if (!hs) continue;
          R(g, hs[0], y + bob, hs[1] - hs[0], 1, "#1a120c");
          const hl = span(hx - 10, hy - 14, HR - 8, HV - 10, y); if (hl) R(g, Math.max(hs[0], hl[0]), y + bob, Math.min(hs[1], hl[1]) - Math.max(hs[0], hl[0]), 1, "#22170f");
          const fs = span(hx - 50, hy + 22, 34, 44, y); if (fs && y > hy - 10) { const x0 = Math.max(hs[0], fs[0]), x1 = Math.min(hs[1], fs[1]); if (x1 > x0) { R(g, x0, y + bob, x1 - x0, 1, "#c98a5a"); R(g, x0, y + bob, 3, 1, "#a8c0f0"); R(g, x1 - 6, y + bob, 6, 1, "#a06a42"); } }
          R(g, hs[0], y + bob, 2, 1, y < hy + 10 ? "#4a5e94" : "#2a3454");     // rim light
        }
        const rh = PX.rnd(4);
        for (let i = 0; i < 30; i++) { const a = -1.9 + rh() * 2.6, r0 = 10 + rh() * 44, x = hx + 8 + Math.cos(a) * r0, y = hy - 4 + Math.sin(a) * r0 + bob; R(g, x, y, 2, 5 + rh() * 9, rh() < 0.5 ? "#2e2016" : "#120c08"); }
        for (let a = -2.9; a < -1.0; a += 0.035) { const x = hx + Math.cos(a) * (HR - 1), y = hy + Math.sin(a) * (HV - 1) + bob; R(g, x, y, 2, 2, a < -2.0 ? "#5a70a8" : "#3a4a78"); }
        // sideburn / hairline over the face
        poly(g, [[hx - 44, hy - 12 + bob], [hx - 14, hy - 16 + bob], [hx - 14, hy + 14 + bob], [hx - 26, hy + 6 + bob], [hx - 40, hy - 2 + bob]], "#1a120c");
        // ear
        ell(g, hx - 14, hy + 10 + bob, 8, 13, "#a8704a"); ell(g, hx - 15, hy + 9 + bob, 6, 11, "#d9a070"); R(g, hx - 15, hy + 5 + bob, 2, 9, "#8a5434"); R(g, hx - 21, hy + 2 + bob, 2, 14, "#a8c0f0");
        // glasses: temple arm from the ear to the lens at the front of the face
        R(g, hx - 68, hy + 1 + bob, 56, 3, "#2a2a30"); R(g, hx - 68, hy + 1 + bob, 56, 1, "#7a7a88");
        const lx = hx - 84, ly = hy - 10 + bob, lw = 20, lh = 26;
        R(g, lx - 1, ly - 1, lw + 2, lh + 2, "#121216"); R(g, lx, ly, lw, lh, "#2e3038"); R(g, lx + 2, ly + 2, lw - 4, lh - 4, "#14223e");
        // reflection (mirrored): thumbs on the left, player on the right, its bar filling
        const vp2 = (t * 0.45) % 1;
        R(g, lx + 9, ly + 5, 9, 8, "#4f7fc8"); R(g, lx + 10, ly + 6, 4, 1, "#a0c8ff");
        for (let r = 0; r < 4; r++) R(g, lx + 3, ly + 5 + r * 4, 4, 3, r % 2 ? "#c0709a" : "#7090c0");
        R(g, lx + 9, ly + 15, Math.round(9 * vp2), 1, "#ff9ad0"); R(g, lx + 9, ly + 18, 7, 1, "#8a94a8");
        R(g, lx + 2, ly + 2, 1, lh - 4, "rgba(255,255,255,.6)"); R(g, lx + 4, ly + 2, 6, 1, "rgba(255,255,255,.35)");
        PX.glow(g, lx + 11, ly + 12, 22, "rgba(150,190,255,0.45)");
      });
      // counter (HUD label)
      { const step = Math.floor(cnt), pop = 1 - ((t * 7) % 1) * 0.0;
        label(g, "WATCHED: " + step, 300, 316, { size: 16, col: "#f7c948" }); }
      PX.particles(g, 13, 22, t, [60, 20, 480, 240], { vy: -2, vx: 1, col: "#cfe0ff", a: 0.3 });
      PX.vignette(g, 0.5);
    };
  };
  // ======================= logo2 =======================
  // channel sting: old CRT TV in a dark room powers on (line -> expands), static, then pixels assemble into the
  // cube head + "BIT BY BIT". o.on 0.15 (power on), o.done 1.4 (logo complete), o.tag (optional tagline typed after done)
  const CUBE = (() => {
    const IN = ["fffffffffff", "fwwffffffff", "ffewfffewff", "ffeefffeeff", "fffffffffff", "ffmfffffmff", "fffmmmmmfff", "fffffffffff", "fffffffffff", "ddddddddddd"];
    return ["....oooooooooooo", "...ottttttttttso", "..ottttttttttsso", ".oooooooooooosso", ...IN.map((s) => ".o" + s + "oso"), ".o" + "d".repeat(11) + "oo.", ".ooooooooooooo.."];
  })();
  const CUBE_PAL = { o: "#0b3a44", t: "#a8f4f6", s: "#2a9fad", f: "#5fe3e8", d: "#3ac0c8", e: "#0b1622", w: "#e8ffff", m: "#0b1622" };
  K.logo2 = (o) => {
    const rn = PX.rnd(12), PIX = [];
    CUBE.forEach((row, r) => [...row].forEach((ch, q) => { if (ch !== ".") PIX.push([q, r, ch, rn(), rn(), rn()]); }));
    const CELLS = [...Array(400)].map(() => rn());
    return (g, t, d, c) => {
      const on = o.on !== undefined ? o.on : 0.15, done = o.done !== undefined ? o.done : Math.min(1.4, d * 0.6);
      const tl = t - on, lineEnd = 0.3, statEnd = Math.max(lineEnd + 0.15, (done - on) * 0.45);
      const sx = 168, sy = 78, sw = 262, sh = 176;   // screen
      const lit = tl < 0 ? 0 : tl < lineEnd ? 0.6 : 1;
      // room
      PX.vgrad(g, 0, 0, 640, 300, "120f24", "0a0a16", 10);
      PX.par(g, c, 0.5, () => {
        // window with blinds + moon light
        R(g, 520, 30, 90, 110, "#1a1d36"); PX.vgrad(g, 524, 34, 82, 102, "1c2450", "2a2a5a", 6); PX.circle(g, 586, 58, 7, "#e8e4c0");
        for (let i = 0; i < 12; i++) R(g, 524, 36 + i * 8, 82, 3, "#30355a");
        R(g, 516, 140, 98, 5, "#2a2e4a");
        // poster + shelf with cartridges
        R(g, 34, 36, 70, 92, "#1c1830"); R(g, 37, 39, 64, 86, "#2e2150"); PX.text(g, "PRESS", 69, 62, { size: 8, col: "#f25ca8", align: "center" }); PX.text(g, "START", 69, 74, { size: 8, col: "#f7c948", align: "center" });
        for (let i = 0; i < 5; i++) R(g, 50 + i * 8, 96, 6, 6, ["#5fe3e8", "#f25ca8", "#f7c948", "#3df56b", "#8a5cf6"][i]);
        R(g, 22, 170, 100, 4, "#3a2a20"); for (let i = 0; i < 9; i++) { R(g, 26 + i * 10, 152, 8, 18, ["#3a3f5a", "#5a2a3a", "#2a4a5a"][i % 3]); R(g, 27 + i * 10, 155, 6, 4, "#8a90a8"); }
      });
      // TV glow on the wall
      if (lit) PX.glow(g, sx + sw / 2, sy + sh / 2, 260, tl < statEnd ? "rgba(200,210,230,0.22)" : "rgba(95,227,232,0.22)", lit);
      // floor + cabinet
      R(g, 0, 300, 640, 60, "#141018"); R(g, 0, 300, 640, 1, "#2a2230");
      R(g, 110, 292, 420, 68, "#3a2618"); R(g, 110, 292, 420, 3, "#6a4a30"); R(g, 110, 295, 420, 2, "#24170e");
      R(g, 126, 306, 186, 46, "#22160e"); R(g, 328, 306, 186, 46, "#22160e"); R(g, 126, 306, 186, 1, "#4a3020"); R(g, 328, 306, 186, 1, "#4a3020");
      // VCR blinking 12:00 + tapes
      R(g, 140, 314, 120, 22, "#1a1a20"); R(g, 140, 314, 120, 1, "#3a3a46"); R(g, 150, 322, 50, 3, "#0a0a0e");
      if (PX.blink(t, 0.8, 0.55)) PX.text(g, "12:00", 218, 318, { font: "v", size: 14, col: "#3df56b" });
      for (let i = 0; i < 4; i++) { R(g, 344 + i * 30, 318, 26, 30, "#151515"); R(g, 348 + i * 30, 322, 18, 8, ["#c0392b", "#f7c948", "#2980b9", "#ecf0f1"][i]); }
      // ---- the TV ----
      const tx = 132, ty = 56, tw = 376, th = 236;
      // antenna
      PX.line(g, 300, ty, 250, ty - 52, "#8a8a9a"); PX.line(g, 340, ty, 400, ty - 50, "#8a8a9a"); PX.line(g, 301, ty, 251, ty - 52, "#5a5a6a");
      PX.circle(g, 250, ty - 53, 2, "#c0c0d0"); PX.circle(g, 400, ty - 51, 2, "#c0c0d0"); R(g, 300, ty - 8, 42, 8, "#2a2a34");
      // body (three shades + highlight edge)
      R(g, tx, ty, tw, th, "#5a4636"); R(g, tx + 4, ty + 4, tw - 8, th - 8, "#7a5e46"); R(g, tx + 4, ty + 4, tw - 8, 2, "#a07e5e"); R(g, tx + 4, ty + 4, 2, th - 8, "#94745a");
      R(g, tx + tw - 8, ty + 4, 4, th - 8, "#4a382a"); R(g, tx, ty + th - 6, tw, 6, "#3a2c20");
      { const rw = PX.rnd(19); for (let i = 0; i < 22; i++) { const y = ty + 8 + Math.floor(rw() * (th - 16)), x = tx + 6 + rw() * (tw - 60); R(g, x, y, 20 + rw() * 60, 1, i % 2 ? "#6a503c" : "#86684e"); } }
      // bezel around the screen
      R(g, sx - 12, sy - 12, sw + 24, sh + 24, "#2a2a30"); R(g, sx - 12, sy - 12, sw + 24, 2, "#4a4a56"); R(g, sx - 6, sy - 6, sw + 12, sh + 12, "#131317");
      // control panel
      const cx0 = sx + sw + 18;
      R(g, cx0, sy - 12, 50, sh + 24, "#3a3a44"); R(g, cx0, sy - 12, 50, 2, "#5a5a68");
      for (let i = 0; i < 2; i++) { PX.circle(g, cx0 + 25, sy + 18 + i * 40, 11, "#1a1a20"); PX.circle(g, cx0 + 25, sy + 17 + i * 40, 9, "#4a4a56"); R(g, cx0 + 24, sy + 9 + i * 40, 2, 7, "#c0c0d0"); }
      for (let i = 0; i < 9; i++) R(g, cx0 + 8, sy + 104 + i * 6, 34, 2, "#24242c");
      R(g, cx0 + 20, sy + sh + 2, 10, 4, tl >= 0 ? "#3df56b" : "#ff4d4d");
      PX.glow(g, cx0 + 25, sy + sh + 4, 10, tl >= 0 ? "rgba(61,245,107,0.8)" : "rgba(255,77,77,0.8)");
      // screen
      g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
      R(g, sx, sy, sw, sh, "#0c1414");
      const midY = sy + sh / 2;
      if (tl >= 0 && tl < lineEnd) {
        const k1 = E(tl / (lineEnd * 0.5), "out"), k2 = E((tl - lineEnd * 0.5) / (lineEnd * 0.5), "in");
        const lw = sw * k1, lh = Math.max(1, Math.round(2 + k2 * sh));
        R(g, sx, sy, sw, sh, "#0e1818"); R(g, sx + sw / 2 - lw / 2, midY - lh / 2, lw, lh, k2 > 0.5 ? "#cfe8ea" : "#ffffff");
        PX.glow(g, sx + sw / 2, midY, 140, "rgba(255,255,255,0.5)");
      } else if (tl >= lineEnd) {
        const stat = tl < statEnd ? 1 : clamp(1 - (tl - statEnd) / 0.35, 0, 1);
        const asm = clamp((tl - statEnd * 0.8) / (done - on - statEnd * 0.8), 0, 1);
        R(g, sx, sy, sw, sh, "#0a1a22");
        PX.glow(g, sx + sw / 2, sy + sh / 2, 180, "rgba(95,227,232,0.18)");
        // logo
        const cs = 3, cubeX = sx + sw / 2 - 24, cubeY = sy + 22;
        let blink = tl > done - on + 0.5 && (t % 1.6) < 0.12;
        PIX.forEach(([q, r, ch, a, b, s0]) => {
          const k = E(clamp((asm - s0 * 0.5) / 0.5, 0, 1), "out"); if (k <= 0) return;
          const fx = sx + a * sw, fy = sy + b * sh, x = lerp(fx, cubeX + q * cs, k), y = lerp(fy, cubeY + r * cs, k);
          let col = CUBE_PAL[ch]; if (blink && (ch === "e" || ch === "w") && r === 6) col = CUBE_PAL.f;
          R(g, x, y, cs, cs, col);
        });
        const ty2 = sy + 92;
        PX.text(g, "BIT BY BIT", sx + sw / 2 + 3, ty2 + 3, { size: 24, col: "#f7c948", align: "center" });
        PX.text(g, "BIT BY BIT", sx + sw / 2, ty2, { size: 24, col: "#5fe3e8", align: "center" });
        // unrevealed cells still static
        const tw2 = 250, x0 = sx + sw / 2 - tw2 / 2, cw = 10, cols = Math.ceil(tw2 / cw), rows = 3;
        const fr = PX.rnd(Math.floor(t * 30) + 3);
        for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) if (CELLS[r * cols + q] > (asm - 0.15) / 0.75) { const v = Math.floor(fr() * 60) + 10; R(g, x0 + q * cw, ty2 - 2 + r * cw, cw, cw, `rgb(${v},${v + 8},${v + 10})`); }
        // tag line types in after done
        if (o.tag) PX.text(g, PX.typed(o.tag, t, done + 0.1, 30), sx + sw / 2, sy + 136, { font: "v", size: 14, col: "#8fb8c8", align: "center" });
        // static noise over everything
        if (stat > 0) {
          const nr = PX.rnd(Math.floor(t * 30) + 1);
          for (let y = sy; y < sy + sh; y += 2) for (let x = sx; x < sx + sw; x += 2) { const v = nr(); if (v < 0.55 * stat + 0.1 * stat) { const L2 = Math.floor(40 + nr() * 180); g.globalAlpha = stat; R(g, x, y, 2, 2, `rgb(${L2},${L2},${L2 + 8})`); } }
          g.globalAlpha = 1;
          const by = sy + ((t * 220) % sh); R(g, sx, by, sw, 6, `rgba(255,255,255,${0.15 * stat})`);
        }
        // scanline shimmer band + slight horizontal tear
        const sb = sy + ((t * 70) % (sh + 40)) - 20; R(g, sx, sb, sw, 8, "rgba(160,240,255,0.06)"); R(g, sx, sb + 3, sw, 2, "rgba(160,240,255,0.06)");
        for (let y = sy; y < sy + sh; y += 3) R(g, sx, y, sw, 1, "rgba(0,0,0,0.18)");
      }
      // glass: curved reflection + corners
      PX.glow(g, sx + 40, sy + 26, 50, "rgba(255,255,255,0.07)"); for (let i = 0; i < 18; i++) R(g, sx + 14 + i * 2, sy + 40 - i * 2, 2, 2, "rgba(255,255,255,.07)");
      g.restore();
      for (let i = 0; i < 5; i++) { const w = 5 - i; R(g, sx, sy + i, w, 1, "#131317"); R(g, sx + sw - w, sy + i, w, 1, "#131317"); R(g, sx, sy + sh - 1 - i, w, 1, "#131317"); R(g, sx + sw - w, sy + sh - 1 - i, w, 1, "#131317"); }
      // light spill from the screen on the cabinet top
      if (lit) PX.glow(g, sx + sw / 2, 300, 200, "rgba(95,227,232,0.16)", lit);
      PX.particles(g, 21, 20, t, [80, 20, 480, 260], { vy: -3, vx: 1, col: "#bfefff", a: 0.35 });
      PX.vignette(g, 0.6);
    };
  };
  // front-facing chibi person (native res). x = centre, y = top of head. ~26 px head + torso; o.mouth smile|flat|o|grit|frown|open,
  // o.eyes open|half|closed|wide, o.brow none|worry|angry, o.sweat, o.skin [hi,base,sh], o.hair [hi,base], o.shirt [hi,base,sh]
  const kid = (g, x, y, t, o) => {
    o = o || {};
    const sk = o.skin || ["#f0bf8f", "#d99a66", "#a86b3c"], hr = o.hair || ["#4a3424", "#2b1d14"], sh = o.shirt || ["#5a7ac8", "#3f5fa3", "#2a3f78"];
    x = Math.round(x); y = Math.round(y);
    // torso (hoodie), drawn first
    if (!o.noBody) {
      for (let r = 0; r < 26; r++) { const w = 26 + Math.round(r * 0.5); R(g, x - w / 2, y + 26 + r, w, 1, sh[1]); R(g, x - w / 2, y + 26 + r, 3, 1, sh[0]); R(g, x + w / 2 - 4, y + 26 + r, 4, 1, sh[2]); }
      R(g, x - 6, y + 26, 12, 3, sh[2]); R(g, x - 1, y + 29, 2, 10, sh[2]);   // hood opening + zip
      R(g, x - 4, y + 29, 1, 6, "#e6edf3"); R(g, x + 3, y + 29, 1, 6, "#e6edf3");  // strings
    }
    // neck
    R(g, x - 4, y + 23, 8, 4, sk[2]);
    // head
    R(g, x - 12, y + 3, 24, 21, sk[1]); R(g, x - 11, y + 2, 22, 1, sk[1]); R(g, x - 11, y + 24, 22, 1, sk[2]);
    R(g, x - 12, y + 4, 2, 18, sk[0]); R(g, x + 10, y + 4, 2, 19, sk[2]);
    R(g, x - 14, y + 11, 2, 6, sk[1]); R(g, x + 12, y + 11, 2, 6, sk[2]);     // ears
    // hair
    R(g, x - 13, y - 1, 26, 7, hr[1]); R(g, x - 11, y - 3, 22, 3, hr[1]); R(g, x - 13, y + 6, 4, 6, hr[1]); R(g, x + 9, y + 6, 4, 5, hr[1]);
    R(g, x - 9, y - 3, 10, 2, hr[0]); R(g, x - 5, y + 5, 8, 2, hr[1]); R(g, x + 1, y + 5, 5, 3, hr[1]);
    // eyes
    const ey = y + 12, eyes = o.eyes || (PX.blink(t + (o.ph || 0), 3.1, 0.05) ? "closed" : "open");
    for (const ex of [x - 6, x + 3]) {
      if (eyes === "closed") R(g, ex, ey + 2, 3, 1, "#1a1010");
      else if (eyes === "half") { R(g, ex, ey + 1, 3, 2, "#1a1010"); R(g, ex - 1, ey, 5, 1, sk[2]); }
      else if (eyes === "wide") { R(g, ex - 1, ey - 1, 5, 5, "#f4f4f4"); R(g, ex, ey, 3, 3, "#1a1010"); R(g, ex, ey, 1, 1, "#fff"); }
      else { R(g, ex, ey, 3, 4, "#1a1010"); R(g, ex, ey, 1, 1, "#ffffff"); }
    }
    // brows
    if (o.brow === "worry") { R(g, x - 7, y + 9, 3, 1, hr[1]); R(g, x - 4, y + 8, 1, 1, hr[1]); R(g, x + 4, y + 9, 3, 1, hr[1]); R(g, x + 3, y + 8, 1, 1, hr[1]); }
    if (o.brow === "angry") { R(g, x - 7, y + 8, 2, 1, hr[1]); R(g, x - 5, y + 9, 2, 1, hr[1]); R(g, x + 3, y + 9, 2, 1, hr[1]); R(g, x + 5, y + 8, 2, 1, hr[1]); }
    // mouth
    const my = y + 19, m = o.mouth || "smile", mc = "#5a1e1e";
    if (m === "smile") { R(g, x - 3, my, 6, 1, mc); R(g, x - 4, my - 1, 1, 1, mc); R(g, x + 3, my - 1, 1, 1, mc); }
    else if (m === "flat") R(g, x - 2, my, 5, 1, mc);
    else if (m === "o") { R(g, x - 1, my - 1, 3, 3, mc); }
    else if (m === "open") { R(g, x - 3, my - 1, 6, 3, mc); R(g, x - 2, my + 1, 4, 1, "#e06060"); }
    else if (m === "grit") { R(g, x - 4, my - 1, 8, 3, "#f4f4f4"); R(g, x - 4, my, 8, 1, mc); R(g, x - 5, my - 1, 1, 3, mc); R(g, x + 4, my - 1, 1, 3, mc); }
    else if (m === "frown") { R(g, x - 3, my - 1, 6, 1, mc); R(g, x - 4, my, 1, 1, mc); R(g, x + 3, my, 1, 1, mc); }
    if (o.blush) { R(g, x - 10, y + 16, 3, 2, "#e88a7a"); R(g, x + 7, y + 16, 3, 2, "#e88a7a"); }
    if (o.sweat) { const k = (t * 1.5) % 1; R(g, x + 13, y + 4 + k * 8, 2, 3, "#8fd8ff"); R(g, x + 13, y + 4 + k * 8, 1, 1, "#e8ffff"); R(g, x + 12, y + 6 + k * 8, 4, 2, "#5fb8e8"); }
  };
  // little dust puff (age 0..0.5 s)
  const dust = (g, x, y, age, n) => {
    if (age < 0 || age > 0.5) return; const k = age / 0.5;
    for (let i = 0; i < (n || 6); i++) { const a = (i / (n || 6)) * Math.PI - Math.PI, r = 4 + k * 14; g.globalAlpha = 0.7 * (1 - k); R(g, x + Math.cos(a) * r - 2, y + Math.sin(a) * r * 0.5 - 2, 4 - k * 2, 4 - k * 2, "#c8c0b8"); }
    g.globalAlpha = 1;
  };

  // ======================= two_paths =======================
  // split screen, wall between: LEFT "FEELS LIKE PROGRESS" beanbag + tutorials + giant bar painted on the wall;
  // RIGHT "ACTUAL PROGRESS" messy desk, errors popping, staircase growing. o.labels 1.0, o.reveal 6.0 (bar peels off)
  K.two_paths = (o) => {
    return (g, t, d, c) => {
      const labels = o.labels !== undefined ? o.labels : Math.min(1.0, d * 0.1), reveal = o.reveal !== undefined ? o.reveal : d * 0.55;
      // ===== LEFT ROOM =====
      g.save(); g.beginPath(); g.rect(0, 0, 316, 360); g.clip();
      PX.vgrad(g, 0, 0, 316, 280, "2a1f44", "1a1430", 9);
      PX.par(g, c, 0.6, () => {
        // window with moon
        R(g, 220, 104, 70, 64, "#2a2346"); PX.vgrad(g, 224, 108, 62, 56, "141a3a", "2c2350", 5); PX.circle(g, 270, 122, 6, "#f4f1d0"); PX.circle(g, 273, 120, 5, "#1a2040");
        R(g, 253, 108, 3, 56, "#2a2346"); R(g, 218, 168, 74, 4, "#3a3060");
        // wall frame pictures
        R(g, 30, 118, 34, 26, "#3a2a20"); R(g, 33, 121, 28, 20, "#5a8aa8"); R(g, 33, 133, 28, 8, "#3a6a4a");
      });
      // giant progress bar painted on the wall (peels off after reveal)
      const fill = clamp(0.12 + 0.85 * E(t / Math.max(0.1, reveal - 0.3), "io"), 0, 0.97);
      const bx = 26, by = 46, bw = 262, bh = 40;
      const peel = clamp((t - reveal) / 1.0, 0, 1), fall = clamp((t - reveal - 1.0) / 0.6, 0, 1);
      // ghost outline left on the wall
      if (peel > 0) { R(g, bx - 4, by - 4, bw + 8, bh + 8, "#30264e"); R(g, bx - 4, by - 4, bw + 8, 1, "#3a2f5c");
        [[bx - 8, by - 6], [bx + bw - 4, by - 6], [bx - 8, by + bh], [bx + bw - 4, by + bh]].forEach(([x, y]) => { R(g, x, y, 12, 5, "#c8bc98"); R(g, x, y, 12, 1, "#e8dcb8"); }); }
      const drawBar = (oy) => {
        R(g, bx - 4, by - 4 + oy, bw + 8, bh + 8, "#141020"); R(g, bx - 2, by - 2 + oy, bw + 4, bh + 4, "#e6dcc8");
        R(g, bx, by + oy, bw, bh, "#1c1830");
        const fw = Math.round(bw * fill);
        R(g, bx, by + oy, fw, bh, "#2fbf5a"); R(g, bx, by + oy, fw, 6, "#7af59a"); R(g, bx, by + bh - 6 + oy, fw, 6, "#1f8a3e");
        for (let i = 0; i < fw; i += 16) R(g, bx + i + ((t * 30) % 16), by + 6 + oy, 6, bh - 12, "rgba(255,255,255,.12)");
        PX.otext(g, Math.round(fill * 100) + "%", bx + bw / 2, by + 12 + oy, { size: 16, col: "#ffffff", align: "center" });
        PX.text(g, "PROGRESS", bx + 4, by - 13 + oy, { size: 8, col: "#e6dcc8" });
      };
      if (peel <= 0) {
        drawBar(0);
        // sparkles
        for (let i = 0; i < 5; i++) { const ph = (t * 1.3 + i * 0.37) % 1, sx = bx + ((i * 71) % bw), sy = by + ((i * 23) % bh); if (sx > bx + bw * fill) continue; const k = Math.sin(ph * Math.PI);
          R(g, sx - 1, sy - 3 * k, 2, 6 * k + 1, "#fffbe0"); R(g, sx - 3 * k, sy, 6 * k + 1, 2, "#fffbe0"); }
        PX.glow(g, bx + bw * fill, by + bh / 2, 40, "rgba(120,255,160,0.35)");
      } else if (fall < 1) {
        // corner fold from the top-right: everything right of the fold line flips down (paper back shows)
        g.save(); const fk = E(peel, "io"), fx = bx + bw + 8 - fk * (bw * 0.7), fy = by - 4 + fk * (bh + 30);
        const oy = E(fall, "in") * 260, rot = fall * 0.3;
        g.translate(bx + bw / 2, by + oy); g.rotate(rot); g.translate(-(bx + bw / 2), -by);
        // clip out the folded triangle
        g.save(); g.beginPath(); g.moveTo(bx - 10, by - 10); g.lineTo(fx, by - 10); g.lineTo(bx + bw + 10, fy); g.lineTo(bx + bw + 10, by + bh + 10); g.lineTo(bx - 10, by + bh + 10); g.closePath(); g.clip();
        drawBar(0); g.restore();
        // folded flap (mirror of the corner): paper back
        poly(g, [[fx, by - 4], [bx + bw + 4, by - 4], [bx + bw + 4, Math.min(fy, by + bh + 4)]].map(([px, py]) => [px, py]), "rgba(0,0,0,0.35)");
        const ax = fx, ay = by - 4, bx2 = bx + bw + 4, by2 = fy;
        poly(g, [[ax, ay], [bx2, by2], [ax + (by2 - ay) * 0.55, ay + (bx2 - ax) * 0.55]], "#7a705e"); poly(g, [[ax + 3, ay + 2], [bx2 - 2, by2 - 3], [ax + (by2 - ay) * 0.5, ay + (bx2 - ax) * 0.5]], "#948a74");
        PX.line(g, ax, ay, bx2, by2, "#fff4dc");
        g.restore();
      }
      // floor + rug
      PX.vgrad(g, 0, 276, 316, 84, "3a2a3a", "1e1622", 6); R(g, 0, 276, 316, 2, "#4a3a4e");
      ell(g, 150, 320, 120, 26, "#5a2a4a"); ell(g, 150, 320, 112, 22, "#7a3a5e"); ell(g, 150, 320, 100, 18, "#5a2a4a");
      if (fall >= 1) {   // crumpled sheet on the floor
        poly(g, [[44, 300], [74, 290], [110, 296], [124, 310], [96, 320], [52, 318]], "#a89c86"); poly(g, [[48, 302], [74, 294], [106, 300], [116, 310], [94, 316], [56, 314]], "#cfc4ae");
        poly(g, [[60, 302], [88, 298], [102, 306], [74, 310]], "#2fbf5a"); PX.line(g, 72, 294, 96, 316, "#a89c86"); PX.line(g, 52, 310, 110, 302, "#a89c86");
        dust(g, 84, 306, t - reveal - 1.6, 8);
      }
      // floor lamp (warm light)
      R(g, 30, 160, 3, 120, "#3a3a46"); R(g, 22, 276, 20, 4, "#2a2a34"); poly(g, [[18, 160], [46, 160], [40, 140], [24, 140]], "#e8b860"); R(g, 22, 158, 20, 2, "#fff0b0");
      PX.glow(g, 32, 170, 150, "rgba(255,190,110,0.45)");
      // beanbag + person
      const bob = Math.round(Math.sin(t * 1.4) * 1);
      ell(g, 152, 272, 66, 34, "#6a2a6a"); ell(g, 146, 266, 60, 30, "#8a3a8a"); ell(g, 138, 258, 40, 18, "#a050a0"); R(g, 120, 248, 20, 3, "#c070c0");
      const shocked = t > reveal + 0.2;
      kid(g, 152, 214 + bob, t, { mouth: shocked ? "o" : (Math.floor(t * 2) % 7 === 0 ? "open" : "smile"), eyes: shocked ? "wide" : "half", blush: !shocked, shirt: ["#f08a8a", "#d85a5a", "#a03a3a"], hair: ["#7a4a24", "#4a2a14"] });
      // legs + feet poking out front
      R(g, 128, 268, 14, 16, "#2d3b55"); R(g, 162, 268, 14, 16, "#2d3b55"); R(g, 124, 282, 20, 6, "#e6e6ee"); R(g, 160, 282, 20, 6, "#e6e6ee"); R(g, 124, 286, 20, 2, "#9a9aae");
      // tablet held at chest, playing a tutorial
      R(g, 134, 244 + bob, 36, 24, "#1a1a20"); R(g, 136, 246 + bob, 32, 20, "#2a4a8a");
      R(g, 138, 248 + bob, 12, 2, "#ff7b72"); R(g, 138, 252 + bob, 20, 2, "#a5d6ff"); R(g, 138, 256 + bob, 16, 2, "#d2a8ff"); R(g, 136, 263 + bob, Math.round(32 * ((t * 0.4) % 1)), 2, "#f25ca8");
      R(g, 128, 246 + bob, 8, 10, "#d99a66"); R(g, 168, 246 + bob, 8, 10, "#a86b3c");   // hands
      PX.glow(g, 152, 240, 40, "rgba(120,170,255,0.35)");
      // chips bag next to the beanbag
      poly(g, [[212, 268], [232, 262], [238, 290], [214, 292]], "#e07a2a"); R(g, 218, 272, 12, 6, "#f7c948");
      g.restore();

      // ===== RIGHT ROOM =====
      g.save(); g.beginPath(); g.rect(324, 0, 316, 360); g.clip();
      PX.vgrad(g, 324, 0, 316, 280, "18213e", "0e1428", 9);
      // staircase growing behind (on the wall), one step every ~0.85 s, keeps climbing
      const stepT = 0.85, nSteps = Math.floor(clamp(t - 0.3, 0, 99) / stepT) + 1, SW = 26, SR = 19, base = 262;
      PX.par(g, c, 0.75, () => {
        for (let i = 0; i < Math.min(nSteps, 12); i++) {
          const age = t - 0.3 - i * stepT, k = E(clamp(age / 0.3, 0, 1), "back");
          const sx = 332 + i * SW, hh = Math.round((i + 1) * SR * k);
          R(g, sx, base - hh, SW, hh, "#34446a"); R(g, sx, base - hh, SW, 4, "#7088bc"); R(g, sx, base - hh + 4, SW, 1, "#4a5e8e"); R(g, sx, base - hh, 2, hh, "#4f6290"); R(g, sx + SW - 3, base - hh, 3, hh, "#243052");
          for (let yy = base - hh + 10; yy < base; yy += 10) { R(g, sx + 2, yy, SW - 5, 1, "#2a3858"); R(g, sx + ((yy / 10) % 2 ? 8 : 16), yy - 9, 1, 9, "#2a3858"); }
          dust(g, sx + SW / 2, base - hh, age - 0.25, 6);
        }
        const ni = Math.min(nSteps, 12) - 1, fx = 332 + ni * SW + 13, fy = base - (ni + 1) * SR, wv = Math.round(Math.sin(t * 8));
        R(g, fx, fy - 20, 2, 20, "#c0c0d0"); poly(g, [[fx + 2, fy - 20], [fx + 14, fy - 16 + wv], [fx + 2, fy - 12]], "#3df56b"); R(g, fx + 2, fy - 20, 10, 1, "#9affb8");
        PX.glow(g, fx + 6, fy - 16, 24, "rgba(61,245,107,0.35)");
      });
      // desk lamp light
      PX.glow(g, 600, 222, 150, "rgba(255,190,110,0.42)");
      // person (behind the desk), reacting to errors
      const errI = Math.floor((t - 0.6) / 1.3), errAge = (t - 0.6) - errI * 1.3, inErr = t > 0.6 && errAge < 0.7;
      kid(g, 476, 206 + Math.round(Math.sin(t * 9) * (inErr ? 1 : 0)), t, { mouth: inErr ? "grit" : "flat", brow: inErr ? "worry" : "angry", sweat: inErr, eyes: inErr ? "open" : undefined, ph: 1.3 });
      R(g, 454, 244, 8, 22, "#3f5fa3"); R(g, 490, 244, 8, 22, "#2a3f78"); R(g, 452, 262, 10, 6, "#d99a66"); R(g, 490, 262, 10, 6, "#a86b3c");
      // desk + drawers + floor
      R(g, 324, 300, 316, 60, "#141018");
      R(g, 324, 268, 316, 8, "#5a3e2b"); R(g, 324, 268, 316, 2, "#7a573d"); R(g, 324, 276, 316, 3, "#2a1f17");
      R(g, 340, 279, 120, 81, "#2a1f17"); R(g, 342, 282, 116, 36, "#3a2a1e"); R(g, 342, 322, 116, 36, "#3a2a1e"); R(g, 342, 282, 116, 1, "#5a4030"); R(g, 342, 322, 116, 1, "#5a4030");
      R(g, 392, 298, 16, 3, "#8a6a4a"); R(g, 392, 338, 16, 3, "#8a6a4a");
      R(g, 600, 279, 8, 81, "#2a1f17");
      // trash bin overflowing with crumpled attempts
      R(g, 530, 316, 40, 44, "#3a3f4b"); R(g, 530, 316, 40, 3, "#5a6070"); R(g, 566, 316, 4, 44, "#262a33");
      [[538, 312], [550, 308], [562, 313], [544, 304], [556, 300], [520, 350], [584, 346]].forEach(([x, y]) => { PX.circle(g, x, y, 5, "#e6dcc8"); R(g, x - 3, y - 1, 4, 1, "#b8ae98"); R(g, x, y + 2, 3, 1, "#b8ae98"); });
      // laptop (back of the lid toward us)
      R(g, 444, 228, 64, 42, "#8a92a6"); R(g, 444, 228, 64, 2, "#b8c0d4"); R(g, 505, 228, 3, 42, "#5a6276"); R(g, 444, 228, 2, 42, "#a0a8bc");
      R(g, 466, 241, 20, 14, "#f25ca8"); R(g, 468, 243, 16, 10, "#ff9ad0"); PX.text(g, "</>", 476, 244, { size: 8, col: "#5a1e3e", align: "center" });
      PX.glow(g, 476, 222, 56, inErr ? "rgba(255,92,92,0.45)" : "rgba(120,200,255,0.3)");
      // mess: mugs, papers, crumpled balls, lamp
      PX.core.mug(g, 360, 258, t); PX.core.mug(g, 376, 260, t + 0.4);
      for (let i = 0; i < 4; i++) R(g, 522 + i * 3, 260 - i * 2, 40, 6, i % 2 ? "#d8d0c0" : "#ece4d2");
      [[408, 263], [424, 264]].forEach(([x, y]) => { PX.circle(g, x, y, 4, "#e6dcc8"); R(g, x - 2, y - 1, 3, 1, "#b8ae98"); });
      R(g, 596, 262, 22, 6, "#2b2f38"); R(g, 604, 220, 4, 42, "#3a3f4b"); R(g, 590, 210, 26, 12, "#3a3f4b"); R(g, 592, 221, 22, 2, "#ffd28a");
      // error popups / green checks
      for (let k = 0; k < 2; k++) {
        const i = errI - k; if (i < 0) continue; const age = (t - 0.6) - i * 1.3, ok = i % 3 === 2;
        if (age > 1.1) continue;
        const px = 430 + ((i * 47) % 100), py = 176 - age * 24, s = E(age / 0.2, "back");
        g.globalAlpha = clamp((1.1 - age) / 0.3, 0, 1);
        const w = Math.round(52 * s), h = Math.round(18 * s);
        R(g, px - w / 2 + 2, py + 2, w, h, "rgba(0,0,0,.4)"); R(g, px - w / 2, py, w, h, ok ? "#1f8a3e" : "#b8282e"); R(g, px - w / 2, py, w, 2, ok ? "#7af59a" : "#ff7a7a");
        if (s > 0.8) PX.text(g, ok ? "FIXED" : "ERROR", px, py + 5, { size: 8, col: "#ffffff", align: "center" });
        g.globalAlpha = 1;
      }
      g.restore();

      // ===== dividing wall =====
      R(g, 312, 0, 16, 360, "#2a2436"); R(g, 312, 0, 2, 360, "#4a4060"); R(g, 326, 0, 2, 360, "#1a1622");
      for (let y = 6; y < 360; y += 12) { R(g, 314, y, 12, 1, "#1e1a2a"); R(g, (y / 12) % 2 ? 320 : 316, y, 1, 12, "#1e1a2a"); }
      // labels
      if (t >= labels) {
        const k = E((t - labels) / 0.35, "back");
        g.globalAlpha = clamp((t - labels) / 0.2, 0, 1);
        label(g, "FEELS LIKE PROGRESS", 158, 16 - (1 - k) * 10, { size: 8, col: "#ff9ad0" });
        label(g, "ACTUAL PROGRESS", 482, 16 - (1 - k) * 10, { size: 8, col: "#3df56b" });
        g.globalAlpha = 1;
      }
      PX.particles(g, 31, 30, t, [0, 30, 640, 240], { vy: -3, vx: 1, col: "#ffe2b0", a: 0.35 });
      PX.vignette(g, 0.5);
    };
  };
  // ======================= quit_curve =======================
  // sunset mountain: winding trail, glowing "?" summit, a tiny climber turns back near the top; ghost footprints of others
  // turning at the same spot; o.q 3.0 sign "MOST PEOPLE QUIT HERE" pops at the turn. o.turn (climber turns, default 0.6*d)
  K.quit_curve = (o) => {
    const TR = [[150, 352], [330, 322], [196, 290], [356, 252], [238, 222], [356, 186], [282, 150], [366, 118], [340, 96], [392, 64]];
    const SEG = []; let tot = 0;
    for (let i = 1; i < TR.length; i++) { const l = Math.hypot(TR[i][0] - TR[i - 1][0], TR[i][1] - TR[i - 1][1]); SEG.push([tot, l]); tot += l; }
    const at = (s) => { s = clamp(s, 0, tot); for (let i = 0; i < SEG.length; i++) { const [a, l] = SEG[i]; if (s <= a + l || i === SEG.length - 1) { const k = (s - a) / l; return [lerp(TR[i][0], TR[i + 1][0], k), lerp(TR[i][1], TR[i + 1][1], k), Math.sign(TR[i + 1][0] - TR[i][0])]; } } };
    const SQ = SEG[6][0] + SEG[6][1] * 0.15;   // the quit spot (on the leg after the 6th bend)
    const rr = PX.rnd(55), GH = [...Array(7)].map(() => [(rr() - 0.5) * 8, 0.85 + rr() * 0.3, rr()]);
    return (g, t, d, c) => {
      const q = o.q !== undefined ? o.q : d * 0.4, turn = o.turn !== undefined ? o.turn : d * 0.6;
      // sky
      PX.vgrad(g, 0, 0, 640, 120, "1e1a4a", "6a2f6a", 8); PX.vgrad(g, 0, 120, 640, 120, "6a2f6a", "f08a5c", 8); PX.vgrad(g, 0, 240, 640, 120, "f08a5c", "ffcf8a", 6);
      const r = PX.rnd(3); for (let i = 0; i < 40; i++) { const x = r() * 640, y = r() * 90; g.globalAlpha = 0.3 + 0.5 * Math.abs(Math.sin(t * 1.4 + i)); R(g, x, y, 1, 1, "#fff"); } g.globalAlpha = 1;
      // sun setting behind the right ranges
      PX.par(g, c, 0.2, () => { PX.glow(g, 540, 230, 170, "rgba(255,200,120,0.55)"); PX.circle(g, 540, 230, 26, "#ffd890"); PX.circle(g, 540, 230, 22, "#ffe8b0");
        for (let i = 0; i < 4; i++) R(g, 510, 236 + i * 5, 60, 1, "#f0a070"); });
      // clouds
      PX.par(g, c, 0.3, () => { for (let i = 0; i < 5; i++) { const x = ((i * 157 + t * (4 + i)) % 760) - 60, y = 60 + i * 26; R(g, x, y, 50, 4, "#c86a7a"); R(g, x + 10, y - 3, 26, 3, "#e08a8a"); R(g, x + 4, y + 4, 40, 2, "#8a4a6a"); } });
      // far ranges
      PX.par(g, c, 0.35, () => {
        poly(g, [[0, 250], [70, 190], [120, 215], [190, 170], [250, 220], [300, 200], [380, 240], [460, 180], [520, 210], [580, 170], [640, 200], [640, 360], [0, 360]], "#7a3a6a");
        poly(g, [[0, 280], [90, 230], [150, 260], [240, 220], [320, 270], [420, 230], [500, 260], [570, 225], [640, 250], [640, 360], [0, 360]], "#5a2c5e");
      });
      // main mountain
      PX.par(g, c, 0.7, () => {
        poly(g, [[-20, 360], [100, 280], [180, 210], [240, 160], [300, 110], [350, 80], [392, 58], [450, 112], [520, 170], [600, 250], [660, 300], [660, 360]], "#3a2550");
        poly(g, [[392, 58], [450, 112], [520, 170], [600, 250], [660, 300], [660, 360], [500, 360], [470, 280], [452, 200], [425, 130], [404, 90]], "#5a3060");
        poly(g, [[392, 58], [450, 112], [520, 170], [600, 250], [660, 300], [660, 360], [560, 360], [520, 280], [480, 190], [440, 120]], "#6e3a62");
        // strata + snow streaks + slope trees
        const sk2 = PX.rnd(14); for (let i = 0; i < 14; i++) { const y = 110 + i * 17, x0 = 404 + (y - 90) * 0.32; R(g, x0 + sk2() * 30, y, 20 + sk2() * 40, 1, "#4a2850"); R(g, x0 + 60 + sk2() * 60, y + 6, 16 + sk2() * 30, 1, "#7e4a6e"); }
        [[170, 300], [186, 310], [120, 320], [430, 320], [452, 336], [210, 330], [520, 300], [545, 315]].forEach(([x, y]) => { for (let i = 0; i < 14; i += 2) { const w = Math.round(i * 0.6) + 1; R(g, x - w / 2, y - 14 + i, w, 2, "#22163a"); } });
        PX.line(g, 392, 58, 450, 112, "#ff9a70"); PX.line(g, 450, 112, 520, 170, "#f08a6a"); PX.line(g, 520, 170, 600, 250, "#e07a6a");
        poly(g, [[392, 58], [414, 78], [404, 80], [396, 92], [384, 84], [374, 92], [368, 84]], "#c8b0d8"); poly(g, [[392, 58], [414, 78], [404, 82], [398, 74]], "#f8e0e8");
        // rocks / texture strokes
        const rk = PX.rnd(9); for (let i = 0; i < 40; i++) { const y = 120 + rk() * 230, x = 120 + rk() * 440; if (y < 360 - (x < 392 ? (x - 40) * 0.85 : 0) - 0) R(g, x, y, 6 + rk() * 10, 1, x > 420 ? "#4e2a52" : "#2e1d42"); }
        // left-face strata + low haze for depth
        const sk3 = PX.rnd(21); for (let i = 0; i < 12; i++) { const y = 130 + i * 19, x0 = 392 - (y - 58) * 1.15; R(g, x0 + 20 + sk3() * 60, y, 18 + sk3() * 40, 1, "#2e1d44"); R(g, x0 + 40 + sk3() * 80, y + 8, 12 + sk3() * 30, 1, "#45305e"); }
        for (let i = 0; i < 6; i++) { g.globalAlpha = 0.05 + i * 0.03; R(g, -20, 300 + i * 10, 680, 10, "#f08a7a"); } g.globalAlpha = 1;
        // summit glow + "?"
        PX.glow(g, 392, 58, 70, "rgba(255,220,140,0.6)");
        const qb = Math.round(Math.sin(t * 2.4) * 2);
        PX.otext(g, "?", 392, 22 + qb, { size: 24, col: "#ffcf5a", align: "center", outline: "#3a1a2a" });
        // trail
        for (let i = 1; i < TR.length; i++) { PX.line(g, TR[i - 1][0], TR[i - 1][1] + 1, TR[i][0], TR[i][1] + 1, "#2a1a30"); PX.line(g, TR[i - 1][0], TR[i - 1][1], TR[i][0], TR[i][1], "#c89a70"); }
        for (let s = 0; s < tot; s += 9) { const [x, y] = at(s); R(g, x, y - 1, 1, 1, "#e8c090"); }
        // ghost footprints of others: up to the spot, U-turn, back down
        const ga = 0.15 + 0.6 * clamp((t - q) / 0.6, 0, 1);
        GH.forEach(([off, k2, ph]) => {
          const top = SQ * (0.97 + 0.04 * ph);
          for (let s = top - 140 + ph * 6; s < top; s += 7) { const [x, y] = at(s); g.globalAlpha = ga * clamp(1 - (top - s) / 140, 0, 1); R(g, x + off, y - 3 + (Math.floor(s / 7) % 2 ? 1 : -1), 2, 1, "#cfe0ff"); }
          for (let a = 0; a < Math.PI; a += 0.35) { const [x, y] = at(top); g.globalAlpha = ga; R(g, x + off + Math.sin(a) * 6, y - 3 - Math.cos(a) * 3 - 3, 2, 1, "#cfe0ff"); }
        });
        g.globalAlpha = 1;
        // the sign at the turn
        if (t >= q) {
          const k = E((t - q) / 0.45, "back"), [sx0, sy0] = at(SQ), x = sx0 - 96, y = sy0 - 4;
          const hgt = Math.round(30 * k);
          R(g, x + 50, y - hgt + 24, 3, hgt, "#5a3a24"); R(g, x + 50, y - hgt + 24, 1, hgt, "#8a5a34");
          if (k > 0.3) { const by = y - hgt - 6; R(g, x - 2, by - 1, 106, 32, "#3a2414"); R(g, x, by, 102, 29, "#a87a4a"); R(g, x, by, 102, 2, "#d8a86a"); R(g, x, by + 27, 102, 2, "#6a4428");
            R(g, x + 3, by + 3, 2, 2, "#5a3a24"); R(g, x + 97, by + 3, 2, 2, "#5a3a24");
            PX.text(g, "MOST PEOPLE", x + 51, by + 5, { size: 8, col: "#2a160a", align: "center" }); PX.text(g, "QUIT HERE", x + 51, by + 16, { size: 8, col: "#9a1a1a", align: "center" });
            PX.line(g, x + 102, by + 14, sx0 - 4, sy0 - 6, "#d8a86a"); }
          if (t - q < 0.5) dust(g, x + 51, y + 24, t - q, 6);
        }
        // the climber (16 px), up the trail, hesitates, turns back
        const up = clamp((t - 0.2) / (turn - 0.6 - 0.2), 0, 1), down = clamp((t - turn) / (d - turn), 0, 1);
        const s = t < turn ? SQ * E(up, "lin") : SQ - (SQ - 20) * down * 0.55;
        const [cx, cy, dir0] = at(s), walking = (t < turn - 0.6 && up < 1) || t > turn, dir = t < turn ? dir0 : -dir0;
        const step = walking ? Math.floor(t * 8) % 2 : 0, x = Math.round(cx), y = Math.round(cy) - 16;
        R(g, x - 3, y + 15, 7, 1, "rgba(20,10,20,.5)");
        R(g, x - 2 - dir * 3, y + 5, 4, 7, "#c0392b"); R(g, x - 2 - dir * 3, y + 5, 4, 1, "#e05a4a");          // backpack
        R(g, x - 2, y + 5, 5, 6, "#3f5fa3"); R(g, x - 2, y + 5, 1, 6, "#5a7ac8");                               // body
        R(g, x - 2, y, 5, 5, "#d99a66"); R(g, x - 2, y - 1, 5, 2, "#2b1d14"); R(g, x + (dir > 0 ? 2 : -2), y + 2, 1, 1, "#111");
        R(g, x - 2 + (step ? 1 : 0), y + 11, 2, 4, "#2d3b55"); R(g, x + 1 - (step ? 1 : 0), y + 11, 2, 4, "#2d3b55");
        R(g, x + dir * 3, y + 6, 1, 9, "#8a6a4a");                                                              // walking stick
        if (t > turn - 0.6 && t < turn + 0.4) { R(g, x + 5, y - 6 + Math.round((t * 2) % 1 * 3), 2, 3, "#8fd8ff"); PX.otext(g, "?!", x + 14, y - 10, { size: 8, col: "#ffe08a", align: "center" }); }
      });
      // birds
      for (let i = 0; i < 3; i++) { const bx = ((t * 24 + i * 60) % 760) - 60, by = 110 + i * 14 + Math.sin(t * 2 + i) * 4, f = Math.floor(t * 6 + i) % 2;
        R(g, bx, by, 2, 1, "#2a1530"); R(g, bx + 4, by, 2, 1, "#2a1530"); R(g, bx + 2, by + (f ? -1 : 1), 2, 1, "#2a1530"); }
      // foreground pines + rocks (nearest layer)
      PX.par(g, c, 1.15, () => {
        const pine = (x, y, h) => { for (let i = 0; i < h; i += 3) { const w = Math.round((i / h) * h * 0.45) + 2; R(g, x - w / 2, y - h + i, w, 3, i % 6 ? "#1a1024" : "#24142e"); } R(g, x - 1, y, 3, 8, "#140a18"); };
        pine(26, 330, 70); pine(58, 350, 56); pine(610, 340, 80); pine(580, 356, 50);
        poly(g, [[-10, 360], [-10, 330], [40, 336], [90, 350], [120, 360]], "#140a18"); poly(g, [[520, 360], [560, 344], [620, 338], [660, 342], [660, 360]], "#140a18");
      });
      PX.particles(g, 41, 26, t, [0, 140, 640, 200], { vy: -4, vx: 3, col: "#ffd8a0", a: 0.45 });
      PX.vignette(g, 0.5);
    };
  };
  // ======================= secbg =======================
  // section-card backdrop: synthwave horizon (stars, striped sun, wireframe mountains, grid floor scrolling toward
  // the viewer). The middle third stays calm for the title. o.speed grid scroll (0.6 rows/s), o.hue "pink"|"cyan"
  K.secbg = (o) => {
    const rs = PX.rnd(61), STARS = [...Array(70)].map(() => [rs() * 640, rs() * 112, rs() * 6.28, rs() < 0.15 ? 2 : 1]);
    const cyan = o.hue === "cyan";
    const LN = cyan ? "#3ac0d8" : "#f25ca8", LN2 = cyan ? "#1e6a8a" : "#8a2a7a";
    return (g, t, d, c) => {
      const HY = 250, sp = o.speed || 0.6;
      // sky
      PX.vgrad(g, 0, 0, 640, 130, "07061a", "1c0e3e", 8); PX.vgrad(g, 0, 130, 640, HY - 130, "1c0e3e", cyan ? "3a2a6a" : "5a1a5a", 8);
      PX.par(g, c, 0.15, () => {
        for (const [x, y, ph, sz] of STARS) { g.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.2 + ph)); R(g, x, y, sz, sz, sz > 1 ? "#ffe8f8" : "#cfd8ff"); }
        g.globalAlpha = 1;
        // shooting star every ~3 s, top band only
        const si = Math.floor(t / 3.1), sk = (t / 3.1) - si; if (sk < 0.25) { const r = PX.rnd(si + 5), x0 = 80 + r() * 480, y0 = 10 + r() * 50, k = sk / 0.25;
          for (let i = 0; i < 14; i++) { g.globalAlpha = (1 - i / 14) * (1 - k); R(g, x0 + k * 120 - i * 3, y0 + k * 30 - i * 0.75, 2, 1, "#ffffff"); } g.globalAlpha = 1; }
      });
      // sun (sunk into the horizon, stripes drifting down)
      PX.par(g, c, 0.25, () => {
        PX.glow(g, 320, HY - 10, 200, cyan ? "rgba(95,227,232,0.22)" : "rgba(242,92,168,0.28)");
        const SR2 = 66, cy = HY + 8;
        for (let y = -SR2; y <= 0; y++) {
          const yy = cy + y; if (yy >= HY) continue;
          const k = (y + SR2) / SR2, gap = k > 0.45 && ((yy + Math.floor(t * 6)) % 9) < Math.round((k - 0.4) * 8);
          if (gap) continue;
          const w = Math.floor(Math.sqrt(SR2 * SR2 - y * y));
          R(g, 320 - w, yy, w * 2 + 1, 1, mix(cyan ? "bff4f6" : "ffd86a", cyan ? "3a8ad8" : "f2508a", k));
        }
      });
      // wireframe mountains, sides only (centre stays open behind the sun)
      PX.par(g, c, 0.4, () => {
        const L1 = [[-10, HY], [30, 214], [70, 230], [120, 190], [170, 226], [210, 210], [250, HY]], R1 = L1.map(([x, y]) => [640 - x, y]);
        for (const M of [L1, R1]) { poly(g, M, "#1a0c30"); for (let i = 1; i < M.length; i++) PX.line(g, M[i - 1][0], M[i - 1][1], M[i][0], M[i][1], LN);
          for (let i = 1; i < M.length - 1; i++) PX.line(g, M[i][0], M[i][1], M[i][0] + (M[i][0] < 320 ? 12 : -12), HY, LN2); }
      });
      // floor
      PX.vgrad(g, 0, HY, 640, 360 - HY, "1a0a2e", "0a0616", 6);
      PX.glow(g, 320, HY, 320, cyan ? "rgba(95,227,232,0.22)" : "rgba(242,92,168,0.25)");
      // sun reflection strip
      for (let y = HY + 2; y < 360; y += 3) { const w = 50 - (y - HY) * 0.25; g.globalAlpha = 0.25 * (1 - (y - HY) / 110); R(g, 320 - w / 2 + Math.sin(y * 0.7 + t * 3) * 3, y, w, 1, cyan ? "#8fe8f0" : "#ffb070"); }
      g.globalAlpha = 1;
      // grid: rows scroll toward the viewer
      const N = 12, ph = (t * sp) % 1;
      for (let k = 0; k < N; k++) { const f = (k + ph) / N, y = Math.round(HY + 110 * Math.pow(f, 2.2)); g.globalAlpha = 0.25 + 0.75 * f; R(g, 0, y, 640, 1, LN); }
      g.globalAlpha = 1;
      for (let i = -16; i <= 16; i++) { PX.line(g, 320 + i * 8, HY, 320 + i * 64, 372, i % 4 ? LN2 : LN); }
      R(g, 0, HY, 640, 1, cyan ? "#bff4f6" : "#ffb0d8");
      PX.particles(g, 71, 18, t, [0, 262, 640, 98], { vy: -5, vx: 0, col: cyan ? "#bff4f6" : "#ffb0d8", a: 0.4 });
      PX.vignette(g, 0.45);
    };
  };
  // ======================= recap =======================
  // quest-complete board in a cozy room: cork board under string lights + lamp; 6 cards pin on at o.at (6 times),
  // each with a pixel icon and a short label; each lands with a bounce + dust, then a green tick stamps on.
  K.recap = (o) => {
    const LAB = o.labels || [["STOP", "WATCHING"], ["BUILD", "TOO BIG"], ["PRACTICE", "WEAK SPOTS"], ["READ BETTER", "CODE"], ["STRUGGLE", "FIRST"], ["SHIP TO", "HUMANS"]];
    const ACC = ["#e05a5a", "#d8a040", "#e05a5a", "#5a8ad8", "#8a5cd6", "#3aa86b"];
    const icon = (i, x, y, t, age) => {   // icon centred at x, top y (~40x36)
      if (i === 0) { // TV with an X
        PX.line(g0, x - 6, y + 4, x - 12, y - 4, "#5a5a6a"); PX.line(g0, x + 6, y + 4, x + 12, y - 4, "#5a5a6a");
        R(g0, x - 20, y + 4, 40, 28, "#4a3a2e"); R(g0, x - 20, y + 4, 40, 2, "#6a5444"); R(g0, x - 17, y + 7, 26, 21, "#2a3a4a"); R(g0, x - 16, y + 8, 6, 2, "#5a7a9a");
        R(g0, x + 12, y + 9, 5, 5, "#2a2a30"); R(g0, x + 12, y + 17, 5, 5, "#2a2a30"); R(g0, x - 16, y + 32, 6, 3, "#3a2a20"); R(g0, x + 10, y + 32, 6, 3, "#3a2a20");
        const xc = PX.blink(age, 0.8, 0.7) ? "#ff4d4d" : "#c02a2a"; for (let k = 0; k < 15; k++) { R(g0, x - 12 + k * 1.4, y + 9 + k * 1.2, 3, 3, xc); R(g0, x + 6 - k * 1.4, y + 9 + k * 1.2, 3, 3, xc); }
      } else if (i === 1) { // box slightly too big for its outline
        for (let k = 0; k < 28; k += 4) { R(g0, x - 14 + k, y + 8, 2, 1, "#8a7a6a"); R(g0, x - 14 + k, y + 30, 2, 1, "#8a7a6a"); } for (let k = 0; k < 22; k += 4) { R(g0, x - 14, y + 8 + k, 1, 2, "#8a7a6a"); R(g0, x + 14, y + 8 + k, 1, 2, "#8a7a6a"); }
        const bb = Math.round(Math.sin(age * 4) * 1);
        R(g0, x - 18 - bb, y + 4 - bb, 36 + bb * 2, 32 + bb * 2, "#b8864a"); R(g0, x - 18 - bb, y + 4 - bb, 36 + bb * 2, 8, "#d8a868"); R(g0, x + 14 + bb, y + 4, 4, 32, "#8a5e2e");
        R(g0, x - 2, y + 4 - bb, 4, 32, "#e8d8a8"); R(g0, x - 18, y + 11, 36, 1, "#8a5e2e");
        PX.line(g0, x - 26, y + 20, x - 21, y + 20, "#e05a5a"); R(g0, x - 26, y + 19, 1, 3, "#e05a5a"); PX.line(g0, x + 21, y + 20, x + 26, y + 20, "#e05a5a"); R(g0, x + 26, y + 19, 1, 3, "#e05a5a");
      } else if (i === 2) { // target + arrow
        PX.circle(g0, x, y + 19, 17, "#e8e0d0"); PX.circle(g0, x, y + 19, 14, "#d83a3a"); PX.circle(g0, x, y + 19, 10, "#e8e0d0"); PX.circle(g0, x, y + 19, 6, "#d83a3a"); PX.circle(g0, x, y + 19, 2, "#f7c948");
        R(g0, x - 17, y + 17, 2, 4, "#a89c88");
        const wob = Math.round(Math.sin(age * 20) * Math.max(0, 1 - age * 2) * 2);
        PX.line(g0, x + 1, y + 18, x + 20, y + 2 + wob, "#5a3a24"); PX.line(g0, x + 1, y + 19, x + 20, y + 3 + wob, "#8a5a34"); poly(g0, [[x + 18, y - 2 + wob], [x + 24, y + 2 + wob], [x + 20, y + 6 + wob], [x + 16, y + 2 + wob]], "#3aa8d8");
      } else if (i === 3) { // open book
        poly(g0, [[x - 22, y + 8], [x, y + 12], [x + 22, y + 8], [x + 22, y + 34], [x, y + 38], [x - 22, y + 34]], "#3a5a9a");
        poly(g0, [[x - 20, y + 6], [x - 1, y + 10], [x - 1, y + 34], [x - 20, y + 30]], "#f4ecd8"); poly(g0, [[x + 1, y + 10], [x + 20, y + 6], [x + 20, y + 30], [x + 1, y + 34]], "#e4dcc8");
        for (let k = 0; k < 5; k++) { PX.line(g0, x - 17, y + 12 + k * 4, x - 4, y + 15 + k * 4, k === 2 ? "#3aa86b" : "#8a8a9a"); PX.line(g0, x + 4, y + 15 + k * 4, x + 17, y + 12 + k * 4, k === 1 ? "#d2a8ff" : "#8a8a9a"); }
        R(g0, x - 1, y + 10, 2, 25, "#a89c88");
        const sp = (age * 1.5) % 1; R(g0, x + 6 + sp * 10, y + 2 - sp * 6, 2, 2, "#f7c948");
      } else if (i === 4) { // hourglass with falling sand
        R(g0, x - 14, y + 2, 28, 4, "#7a4a2a"); R(g0, x - 14, y + 34, 28, 4, "#7a4a2a"); R(g0, x - 14, y + 2, 28, 1, "#a87a4a");
        poly(g0, [[x - 12, y + 6], [x + 12, y + 6], [x + 3, y + 20], [x + 12, y + 34], [x - 12, y + 34], [x - 3, y + 20]], "#4a5a6a");
        poly(g0, [[x - 11, y + 6], [x + 11, y + 6], [x + 2, y + 20], [x - 2, y + 20]], "#a8c8d8"); poly(g0, [[x - 2, y + 20], [x + 2, y + 20], [x + 11, y + 34], [x - 11, y + 34]], "#a8c8d8");
        R(g0, x - 16, y + 4, 2, 32, "#7a4a2a"); R(g0, x + 14, y + 4, 2, 32, "#5a3a1e");
        const s = clamp((age % 6) / 6, 0, 1), top = Math.round(10 * (1 - s));
        poly(g0, [[x - 2 - top * 0.8, y + 20 - top], [x + 2 + top * 0.8, y + 20 - top], [x + 2, y + 20], [x - 2, y + 20]], "#d89a3a");
        poly(g0, [[x - 10, y + 34], [x + 10, y + 34], [x + 2, y + 34 - Math.round(10 * s) - 2], [x - 2, y + 34 - Math.round(10 * s) - 2]], "#d89a3a");
        if (s < 1) R(g0, x, y + 20, 1, 13 - Math.round(10 * s), "#d89a3a");
        R(g0, x - 8, y + 8, 1, 6, "#ffffff");
      } else { // rocket to a person
        const k = (age * 0.6) % 1, rx = x - 18 + Math.round(k * 6);
        for (let j = 0; j < 4; j++) R(g0, rx - 8 - j * 4, y + 18 + ((j + Math.floor(age * 12)) % 2), 4, 3, j < 2 ? "#f7c948" : "#f08a3c");
        poly(g0, [[rx - 7, y + 13], [rx + 10, y + 13], [rx + 17, y + 19], [rx + 10, y + 25], [rx - 7, y + 25]], "#2a2a3a"); poly(g0, [[rx - 6, y + 14], [rx + 10, y + 14], [rx + 16, y + 19], [rx + 10, y + 24], [rx - 6, y + 24]], "#c8d0e0"); R(g0, rx - 6, y + 14, 16, 2, "#f0f4ff"); R(g0, rx - 6, y + 22, 16, 2, "#8a92a8");
        PX.circle(g0, rx + 6, y + 19, 2, "#5fa8e8"); poly(g0, [[rx - 6, y + 14], [rx - 2, y + 14], [rx - 8, y + 8]], "#e05a5a"); poly(g0, [[rx - 6, y + 24], [rx - 2, y + 24], [rx - 8, y + 30]], "#e05a5a");
        // person waving
        const px2 = x + 18, wv = Math.floor(age * 4) % 2;
        R(g0, px2 - 3, y + 8, 7, 7, "#d99a66"); R(g0, px2 - 3, y + 7, 7, 2, "#2b1d14"); R(g0, px2 - 1, y + 11, 1, 1, "#111"); R(g0, px2 + 2, y + 11, 1, 1, "#111");
        R(g0, px2 - 4, y + 15, 9, 12, "#3aa86b"); R(g0, px2 - 3, y + 27, 3, 8, "#2d3b55"); R(g0, px2 + 1, y + 27, 3, 8, "#2d3b55");
        R(g0, px2 + 5, y + (wv ? 8 : 11), 2, 7, "#d99a66");
      }
    };
    let g0 = null;
    return (g, t, d, c) => {
      g0 = g;
      const at = o.at || [0.054, 0.204, 0.355, 0.505, 0.656, 0.806].map((k) => +(k * d).toFixed(2));
      // wall + wallpaper stripes
      PX.vgrad(g, 0, 0, 640, 300, "2a2038", "171320", 10);
      for (let x = 0; x < 640; x += 16) R(g, x, 0, 1, 300, "rgba(255,255,255,0.025)");
      // lamp glow (warm, left) + window light (cool, right)
      PX.par(g, c, 0.5, () => {
        R(g, 590, 40, 44, 120, "#1e2238"); PX.vgrad(g, 594, 44, 36, 112, "1a2050", "2c2a5a", 6); R(g, 610, 44, 2, 112, "#1e2238"); PX.circle(g, 620, 62, 4, "#e8e4c0");
        R(g, 6, 60, 46, 4, "#4a3626"); ["#c0392b", "#2980b9", "#27ae60", "#d35400"].forEach((cc, k) => R(g, 10 + k * 9, 42 + (k % 2) * 4, 7, 18 - (k % 2) * 4, cc));
      });
      PX.glow(g, 40, 230, 220, "rgba(255,190,110,0.42)");
      // cork board
      const bx = 66, by = 34, bw = 508, bh = 236;
      R(g, bx - 10, by - 10, bw + 20, bh + 20, "#4a2e1a"); R(g, bx - 10, by - 10, bw + 20, 3, "#7a5232"); R(g, bx - 10, by - 10, 3, bh + 20, "#6a4428"); R(g, bx + bw + 7, by - 10, 3, bh + 20, "#2e1c10"); R(g, bx - 10, by + bh + 7, bw + 20, 3, "#2e1c10");
      R(g, bx, by, bw, bh, "#9a6c42");
      { const rc = PX.rnd(88); for (let i = 0; i < 900; i++) { const x = bx + rc() * bw, y = by + rc() * bh, v = rc(); R(g, x, y, 1, 1, v < 0.5 ? "#875a34" : v < 0.85 ? "#ad7e52" : "#6e4626"); } }
      PX.glow(g, bx + 40, by + bh, 260, "rgba(255,180,100,0.12)");
      // plaque
      R(g, 270, by - 16, 100, 16, "#2a1a0e"); R(g, 272, by - 14, 96, 12, "#c8a050"); R(g, 272, by - 14, 96, 1, "#f0d080");
      PX.text(g, "QUEST LOG", 320, by - 12, { size: 8, col: "#3a2408", align: "center" });
      // string lights across the top
      for (let i = 0; i < 17; i++) { const x = 40 + i * 35, y = 14 + Math.round(Math.sin(i * 0.9) * 2 + Math.abs(i - 8) * 0.6), on = Math.sin(t * 2.2 + i * 1.7) > -0.3;
        if (i) PX.line(g, x - 35, 14 + Math.round(Math.sin((i - 1) * 0.9) * 2 + Math.abs(i - 9) * 0.6), x, y, "#2a2a30");
        const col = ["#ffcf8a", "#f25ca8", "#5fe3e8", "#3df56b"][i % 4]; R(g, x - 1, y + 1, 3, 4, on ? col : "#5a4a3a"); if (on) PX.glow(g, x, y + 3, 14, col.replace("#", "") && "rgba(255,210,150,0.35)"); }
      // cards
      for (let i = 0; i < 6; i++) {
        const age = t - at[i]; if (age < 0) continue;
        const col = i % 3, row = Math.floor(i / 3), cw = 146, ch = 100, cx = bx + 18 + col * 162, cy = by + 16 + row * 112;
        const k = E(clamp(age / 0.42, 0, 1), "back"), dy = Math.round((1 - k) * -70), sq = age > 0.3 && age < 0.42 ? 2 : 0;
        // shadow
        R(g, cx + 4, cy + 5 + Math.max(0, dy * 0.3), cw, ch, "rgba(30,15,5,0.45)");
        const PAP = [["#c4b594", "#d4c6a6", "#9a8c6c"], ["#bfb49c", "#cfc4ac", "#968a72"], ["#c8b690", "#d8c6a0", "#9e8a66"]][i % 3];
        R(g, cx, cy + dy + sq, cw, ch - sq, PAP[0]); R(g, cx, cy + dy + sq, cw, 2, PAP[1]); R(g, cx, cy + dy + ch - 3, cw, 3, PAP[2]); R(g, cx + cw - 2, cy + dy + sq, 2, ch - sq, PAP[2]); R(g, cx, cy + dy + sq, 2, ch - sq, PAP[1]);
        R(g, cx + 10, cy + dy + 52, cw - 20, 1, PAP[2]);
        R(g, cx, cy + dy + sq, cw, 6, ACC[i]); R(g, cx, cy + dy + sq, cw, 1, "#ffffff40");
        PX.text(g, String(i + 1), cx + 6, cy + dy + 10, { size: 8, col: "#b8ac94" });
        icon(i, cx + cw / 2, cy + dy + 14, t, age);
        PX.text(g, LAB[i][0], cx + cw / 2, cy + dy + 60, { size: 8, col: "#2a2030", align: "center" });
        PX.text(g, LAB[i][1], cx + cw / 2, cy + dy + 72, { size: 8, col: "#2a2030", align: "center" });
        // pin (drops in after the card lands)
        const pk = clamp((age - 0.35) / 0.15, 0, 1);
        if (pk > 0) { const py = cy + dy - 6 - Math.round((1 - pk) * 14); R(g, cx + cw / 2 - 1, py + 7, 3, 3, "rgba(0,0,0,.35)"); PX.circle(g, cx + cw / 2, py + 3, 5, "#c02a2a"); PX.circle(g, cx + cw / 2 - 1, py + 2, 3, "#e85a5a"); R(g, cx + cw / 2 - 2, py, 2, 2, "#ffb0b0"); }
        dust(g, cx + 10, cy + ch, age - 0.38, 6); dust(g, cx + cw - 10, cy + ch, age - 0.38, 6);
        // quest-complete tick + focus glow on the newest card
        const tk = clamp((age - 0.6) / 0.2, 0, 1);
        if (tk > 0) { const tx = cx + cw - 22, ty = cy + dy + 70, s2 = E(tk, "back");
          PX.circle(g, tx + 8, ty + 8, Math.round(9 * s2), "#1f8a3e"); PX.circle(g, tx + 8, ty + 8, Math.round(7 * s2), "#3df56b");
          if (tk >= 1) { R(g, tx + 4, ty + 8, 2, 2, "#0b2a14"); R(g, tx + 6, ty + 10, 2, 2, "#0b2a14"); R(g, tx + 8, ty + 8, 2, 2, "#0b2a14"); R(g, tx + 10, ty + 6, 2, 2, "#0b2a14"); R(g, tx + 12, ty + 4, 2, 2, "#0b2a14"); } }
        const newest = i === 5 || t < at[i + 1];
        if (newest && age < 2.4) PX.glow(g, cx + cw / 2, cy + ch / 2, 110, "rgba(255,230,160,0.22)", 1 - age / 2.4);
      }
      // desk below + lamp + plant + mug
      PX.vgrad(g, 0, 296, 640, 22, "6a4a30", "54382a", 3); R(g, 0, 296, 640, 1, "#9a7050"); R(g, 0, 318, 640, 42, "#24170e"); R(g, 0, 318, 640, 2, "#3a2618");
      R(g, 20, 290, 30, 6, "#2b2f38"); R(g, 32, 236, 4, 56, "#3a3f4b"); poly(g, [[16, 236], [52, 236], [44, 218], [24, 218]], "#3a3f4b"); R(g, 20, 234, 28, 2, "#ffd28a");
      R(g, 590, 270, 26, 26, "#7a4a2c"); R(g, 590, 270, 26, 2, "#9a6a4c"); const sw = Math.round(Math.sin(t * 1.3) * 1);
      R(g, 596 + sw, 244, 4, 26, "#3d8a4a"); R(g, 604 + sw, 236, 4, 34, "#4aa85a"); R(g, 586 + sw, 250, 10, 4, "#3d8a4a"); R(g, 606 + sw, 246, 12, 4, "#4aa85a");
      PX.core.mug(g, 540, 286, t);
      // desk clutter: closed laptop, pencil cup, sticky notes
      R(g, 250, 300, 140, 9, "#4a5064"); R(g, 250, 300, 140, 2, "#7a8098"); R(g, 252, 309, 136, 3, "#2a2e3a"); R(g, 306, 302, 18, 5, "#f25ca8");
      R(g, 470, 278, 16, 18, "#3a5a8a"); R(g, 470, 278, 16, 2, "#5a7aaa"); R(g, 472, 266, 2, 12, "#f7c948"); R(g, 477, 262, 2, 16, "#e05a5a"); R(g, 482, 268, 2, 10, "#5fe3e8");
      [[120, 302, "#f7c948"], [138, 306, "#f25ca8"], [420, 304, "#5fe3e8"]].forEach(([x, y, cc]) => { R(g, x, y, 16, 8, cc); R(g, x, y + 7, 16, 1, "#00000040"); });
      PX.particles(g, 51, 30, t, [20, 40, 300, 240], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.55 });
      PX.vignette(g, 0.5);
    };
  };
  // ======================= outro =======================
  // the room at dawn: window turns orange, the coder stretches, cursor clicks a big SUBSCRIBE button on the monitor at
  // o.press (1.5) -> SUBSCRIBED; at o.comment (3.5) a comment card slides out and types "WHAT ARE YOU BUILDING?".
  // o.stretch [0.1, 1.2] (arms up window), o.text (comment text)
  // seated coder from behind with arm pose k (0 = hands forward on the desk, 1 = arms stretched above the head)
  const coderPose = (g, x, y, t, k, o) => {
    o = o || {};
    const hood = "#2f4a86", hl = "#3f5fa3", dark = "#22356a", hair = "#1a120c", hairHl = "#3a2a1c", skin = "#c98a5a";
    R(g, x - 40, y + 18, 80, 70, "#23262e"); R(g, x - 40, y + 18, 80, 3, "#3a3f4b"); R(g, x - 40, y + 18, 3, 70, "#2d313a"); R(g, x + 37, y + 18, 3, 70, "#1a1c22");
    const arm = (side) => {
      const mouse = side > 0 ? (o.mouse || 0) : 0;
      const sx = x + side * 30, sy = y + 6, ex = lerp(x + side * (44 + mouse * 8), x + side * 48, k), ey = lerp(y + 12, y - 26, k), hx = lerp(x + side * (36 + mouse * 26), x + side * 14, k), hy = lerp(y - 14 - mouse * 4, y - 62, k) + (o.typing ? Math.round(Math.sin(t * 20 + side)) : 0);
      const seg = (ax, ay, bx, by, w, col) => { const n = Math.ceil(Math.hypot(bx - ax, by - ay)); for (let i = 0; i <= n; i++) { const u = i / Math.max(1, n); R(g, lerp(ax, bx, u) - w / 2, lerp(ay, by, u) - w / 2, w, w, col); } };
      seg(sx, sy, ex, ey, 14, dark); seg(sx, sy, ex, ey, 12, hood); seg(ex, ey, hx, hy, 12, hood); seg(ex - side * 3, ey, hx - side * 3, hy, 4, side < 0 ? hl : dark);
      PX.circle(g, hx, hy - 4, 5, skin); R(g, hx - 3, hy - 9, 6, 2, "#e0a878");
    };
    if (k < 0.5) { arm(-1); arm(1); }
    for (let r = 0; r < 70; r++) { const w = Math.round(64 + r * 0.25); R(g, x - w / 2, y + r, w, 1, hood); R(g, x - w / 2, y + r, 5, 1, dark); R(g, x + w / 2 - 5, y + r, 5, 1, dark); }
    R(g, x - 30, y, 60, 3, hl);
    PX.circle(g, x, y + 4, 15, dark); PX.circle(g, x, y + 2, 12, hood); R(g, x - 12, y - 2, 24, 3, hl); R(g, x - 1, y + 14, 2, 40, dark);
    const tilt = Math.round(k * 3);
    R(g, x - 6, y - 8, 12, 10, skin); R(g, x - 6, y - 8, 12, 2, "#a8704a");
    PX.circle(g, x, y - 22 + tilt, 16, hair); PX.circle(g, x - 2, y - 26 + tilt, 12, hairHl); PX.circle(g, x + 1, y - 24 + tilt, 12, hair);
    R(g, x - 17, y - 22 + tilt, 4, 8, skin); R(g, x + 13, y - 22 + tilt, 4, 8, skin);
    R(g, x - 8, y - 38 + tilt, 16, 2, "#ff9a5a");                                      // dawn rim light
    if (k >= 0.5) { arm(-1); arm(1); }
  };
  K.outro = (o) => {
    const rf = PX.rnd(70), CONF = [...Array(24)].map(() => [rf() * 6.28, 30 + rf() * 50, rf(), Math.floor(rf() * 4)]);
    return (g, t, d, c) => {
      const press = o.press !== undefined ? o.press : d * 0.19, cmt = o.comment !== undefined ? o.comment : d * 0.44;
      const st = o.stretch || [Math.min(0.1, d * 0.02), Math.min(1.2, press - 0.2)];
      const text = o.text || "WHAT ARE YOU BUILDING?";
      const dawn = clamp(0.25 + 0.75 * (t / d), 0, 1);
      // wall warmed by the dawn
      PX.vgrad(g, 0, 0, 640, 300, mixh("1c2040", "3a2a48", dawn).slice(1), mixh("0c1020", "1e1626", dawn).slice(1), 10);
      // window: dawn sky, rising sun, skyline
      PX.par(g, c, 0.55, () => {
        const wx = 60, wy = 42, ww = 178, wh = 116;
        R(g, wx - 6, wy - 6, ww + 12, wh + 12, "#2a2f45");
        PX.vgrad(g, wx, wy, ww, wh * 0.55, mixh("1a1f4a", "4a3a8a", dawn).slice(1), mixh("3b2a5c", "f08a5c", dawn).slice(1), 6);
        PX.vgrad(g, wx, wy + wh * 0.55, ww, wh * 0.45, mixh("3b2a5c", "f08a5c", dawn).slice(1), mixh("5a3a5c", "ffcf8a", dawn).slice(1), 5);
        g.save(); g.beginPath(); g.rect(wx, wy, ww, wh); g.clip();
        const sy = wy + wh - 10 - dawn * 46; PX.glow(g, wx + ww * 0.62, sy, 70, "rgba(255,200,120,0.7)", dawn); PX.circle(g, wx + ww * 0.62, sy, 11, "#ffd890"); PX.circle(g, wx + ww * 0.62, sy, 8, "#ffeec0");
        const rs = PX.rnd(5); for (let i = 0; i < 20; i++) { g.globalAlpha = (1 - dawn) * 0.8; R(g, wx + rs() * ww, wy + rs() * wh * 0.4, 1, 1, "#fff"); } g.globalAlpha = 1;
        for (let i = 0; i < 3; i++) { const cx = wx + ((i * 61 + t * 5) % (ww + 40)) - 20, cy = wy + 16 + i * 12; R(g, cx, cy, 26, 3, "#ffb0a0"); R(g, cx + 4, cy - 2, 14, 2, "#ffc8b0"); R(g, cx + 2, cy + 3, 20, 1, "#c86a7a"); }
        const rb = PX.rnd(3); let bx = wx - 4;
        while (bx < wx + ww) { const bw = 12 + Math.floor(rb() * 22), bh = wh * (0.2 + rb() * 0.45), top = wy + wh - bh; R(g, bx, top, bw, bh, rb() < 0.5 ? "#2a1e3a" : "#33243f"); R(g, bx, top, bw, 1, "#ff9a6a");
          for (let yy = top + 4; yy < wy + wh - 3; yy += 5) for (let xx = bx + 2; xx < bx + bw - 2; xx += 4) if (rb() < 0.18) R(g, xx, yy, 2, 2, "#f7c948"); bx += bw + 1; }
        g.restore();
        R(g, wx + ww / 2 - 2, wy, 4, wh, "#2a2f45"); R(g, wx, wy + wh / 2 - 2, ww, 4, "#2a2f45"); R(g, wx - 10, wy + wh + 4, ww + 20, 6, "#363c55"); R(g, wx - 10, wy + wh + 4, ww + 20, 1, "#ffb080");
        // shelf + plant + poster
        R(g, 448, 70, 150, 5, "#4a3626"); R(g, 448, 75, 150, 2, "#2c1f15");
        ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#d35400", "#16a085"].forEach((cc, i) => { const h = 18 + (i * 7) % 9, w = 6 + (i % 3); R(g, 454 + i * 10, 70 - h, w, h, cc); R(g, 454 + i * 10, 70 - h, 1, h, "rgba(255,255,255,.25)"); });
        R(g, 560, 50, 16, 20, "#3d6b4a"); R(g, 556, 64, 24, 6, "#7a4a2c");
      });
      // dawn light beam across the room + lamp
      g.globalAlpha = 0.10 * dawn; poly(g, [[60, 42], [238, 42], [460, 300], [180, 300]], "#ffb070"); g.globalAlpha = 1;
      PX.glow(g, 150, 110, 200, "rgba(255,170,100,0.35)", dawn);
      PX.glow(g, 120, 205, 110, "rgba(255,190,110,0.4)", 1 - dawn * 0.5);
      // desk + lamp
      R(g, 0, 250, 640, 12, "#5a3e2b"); R(g, 0, 250, 640, 2, "#8a6a4d"); R(g, 0, 262, 640, 98, "#1a1410"); R(g, 30, 262, 10, 98, "#2a1f17"); R(g, 600, 262, 10, 98, "#2a1f17");
      R(g, 96, 244, 26, 6, "#2b2f38"); R(g, 106, 196, 4, 48, "#3a3f4b"); R(g, 98, 186, 26, 12, "#3a3f4b"); R(g, 100, 197, 22, 2, "#ffd28a");
      // monitor with the channel page
      const mx = 214, my = 72, mw = 212, mh = 136;
      R(g, mx - 4, my - 4, mw + 8, mh + 8, "#1a1d24"); R(g, mx - 4, my - 4, mw + 8, 1, "#4a4f5c"); R(g, mx + mw / 2 - 5, my + mh + 4, 10, 30, "#1a1d24"); R(g, mx + mw / 2 - 20, my + mh + 30, 40, 4, "#22262f");
      PX.glow(g, 320, 150, 170, "rgba(90,170,255,0.18)");
      R(g, mx, my, mw, mh, "#12151d"); R(g, mx, my, mw, 26, "#2a2050");
      for (let i = 0; i < 12; i++) R(g, mx + i * 18, my + 4 + (i % 3) * 5, 10, 2, ["#5fe3e8", "#f25ca8", "#f7c948"][i % 3]);  // banner pixels
      // channel avatar (cube head, native 16x16) + name
      PX.sprite(g, CUBE, mx + 8, my + 18, CUBE_PAL, 1);
      PX.text(g, "BIT BY BIT", mx + 30, my + 30, { size: 8, col: "#e6edf3" }); PX.text(g, "computer science, bit by bit", mx + 30, my + 40, { font: "v", size: 10, col: "#7d8590" });
      // video tiles row
      for (let i = 0; i < 4; i++) { R(g, mx + 8 + i * 50, my + 98, 44, 26, ["#2a3a6a", "#4a2a5a", "#1e4a4a", "#5a3a1e"][i]); R(g, mx + 12 + i * 50, my + 104, 20, 2, "#a5d6ff"); R(g, mx + 12 + i * 50, my + 110, 28, 2, "#ff7b72"); }
      // SUBSCRIBE button
      const done = t >= press, bp = done && t < press + 0.12 ? 2 : 0;
      const bw2 = 164, bh2 = 26, bx2 = mx + mw / 2 - bw2 / 2, by2 = my + 58 + bp;
      R(g, bx2 + 2, my + 58 + bh2, bw2, 3, "#05060a");
      if (!done) { R(g, bx2, by2, bw2, bh2, "#d83a4a"); R(g, bx2, by2, bw2, 3, "#ff7a8a"); R(g, bx2, by2 + bh2 - 3, bw2, 3, "#8a1a2a"); PX.text(g, "SUBSCRIBE", bx2 + bw2 / 2, by2 + 6, { size: 16, col: "#fff0f0", align: "center" });
        PX.glow(g, bx2 + bw2 / 2, by2 + 12, 80, "rgba(255,90,110,0.25)", 0.6 + 0.4 * Math.sin(t * 5)); }
      else { R(g, bx2, by2, bw2, bh2, "#3a3f4c"); R(g, bx2, by2, bw2, 3, "#5a6070"); R(g, bx2, by2 + bh2 - 3, bw2, 3, "#22262e"); PX.text(g, "SUBSCRIBED", bx2 + bw2 / 2 + 6, by2 + 9, { size: 8, col: "#c9d1d9", align: "center" });
        R(g, bx2 + 18, by2 + 12, 2, 2, "#3df56b"); R(g, bx2 + 20, by2 + 14, 2, 2, "#3df56b"); R(g, bx2 + 22, by2 + 12, 2, 2, "#3df56b"); R(g, bx2 + 24, by2 + 10, 2, 2, "#3df56b");
        // bell wiggles
        const bw3 = Math.round(Math.sin((t - press) * 30) * 2 * Math.max(0, 1 - (t - press) / 0.8));
        const bx3 = bx2 + bw2 + 8 + bw3, by3 = by2 + 6; R(g, bx3, by3 + 2, 10, 9, "#f7c948"); R(g, bx3 + 2, by3, 6, 3, "#f7c948"); R(g, bx3 - 1, by3 + 10, 12, 2, "#c89a28"); R(g, bx3 + 4, by3 + 12, 2, 2, "#f7c948");
        // confetti burst
        const ca = t - press; if (ca < 1.2) CONF.forEach(([a, sp, ph, ci]) => { const x = bx2 + bw2 / 2 + Math.cos(a) * sp * ca * 1.6, y = by2 + 12 + Math.sin(a) * sp * ca * 1.2 + 60 * ca * ca; g.globalAlpha = clamp(1.2 - ca, 0, 1);
          R(g, x, y, 2, Math.floor((t * 10 + ph * 10) % 2) ? 2 : 1, ["#5fe3e8", "#f25ca8", "#f7c948", "#3df56b"][ci]); }); g.globalAlpha = 1; }
      // cursor: glides to the button, clicks, drifts off
      { const p1 = E(clamp((t - 0.3) / (press - 0.4), 0, 1), "io"), p2 = E(clamp((t - press - 0.3) / 0.8, 0, 1), "io");
        const cx = lerp(mx + 40, bx2 + bw2 * 0.7, p1) + p2 * 40, cy = lerp(my + 120, by2 + 14, p1) + p2 * 30;
        const CUR = ["k.........", "kk........", "kwk.......", "kwwk......", "kwwwk.....", "kwwwwk....", "kwwwwwk...", "kwwwwwwk..", "kwwwwkkkk.", "kwkwwk....", "kk.kwwk...", "k...kwk...", "....kk...."];
        PX.sprite(g, CUR, Math.round(cx), Math.round(cy), { k: "#05060a", w: "#f4f4f4" }, 1);
        if (Math.abs(t - press) < 0.25) { const rr = Math.round((t - press + 0.25) * 30); PX.circle(g, cx, cy, rr, "rgba(255,255,255,0.0)"); for (let a = 0; a < 6.28; a += 0.8) R(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, 2, 2, "#ffffff"); } }
      R(g, mx, my, mw, 1, "rgba(255,255,255,.08)");
      // keyboard, mug, mouse
      R(g, 270, 238, 100, 12, "#2b2f38"); R(g, 270, 238, 100, 1, "#4a505c");
      for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 16; kx++) R(g, 273 + kx * 6, 240 + ky * 3, 5, 2, "#5a6270");
      R(g, 384, 242, 8, 6, "#3a3f4b"); PX.core.mug(g, 210, 238, t);
      // the coder: stretch, then back to the desk
      const k = t < st[0] ? 0 : t < st[0] + 0.35 ? E((t - st[0]) / 0.35, "back") : t < st[1] - 0.3 ? 1 - 0.05 * Math.sin((t - st[0]) * 6) : clamp(1 - (t - (st[1] - 0.3)) / 0.3, 0, 1);
      coderPose(g, 320, 266, t, clamp(k, 0, 1.1), { typing: t > cmt + 0.4 && t < cmt + 0.4 + text.length / 16, mouse: t > st[1] && t < press + 1.0 ? E(clamp((t - st[1]) / 0.3, 0, 1)) * (t > press + 0.7 ? clamp((press + 1.0 - t) / 0.3, 0, 1) : 1) : 0 });
      if (k > 0.6) { PX.otext(g, "~", 352, 206 - Math.round((t - st[0]) * 4), { size: 16, col: "#ffcf8a" }); }
      // comment card slides out from the monitor and types the question
      if (t >= cmt) {
        const ck = E(clamp((t - cmt) / 0.45, 0, 1), "back"), cw = 172, ch = 58, cx = lerp(mx + mw - cw, 414, ck), cy = 92;
        R(g, cx + 4, cy + 4, cw, ch, "rgba(0,0,0,.45)"); R(g, cx, cy, cw, ch, "#1c2130"); R(g, cx, cy, cw, 2, "#3a4258"); R(g, cx, cy, 2, ch, "#2a3044"); R(g, cx + cw - 2, cy, 2, ch, "#11141c");
        PX.circle(g, cx + 14, cy + 14, 7, "#f25ca8"); R(g, cx + 11, cy + 12, 2, 2, "#2a0a1a"); R(g, cx + 16, cy + 12, 2, 2, "#2a0a1a"); R(g, cx + 12, cy + 17, 5, 1, "#2a0a1a");
        PX.text(g, "@you", cx + 26, cy + 6, { font: "v", size: 12, col: "#8a94a8" }); PX.text(g, "just now", cx + 60, cy + 6, { font: "v", size: 12, col: "#4d5a6e" });
        const typed = PX.typed(text, t, cmt + 0.4, 16), split = text.lastIndexOf(" ", 14);
        const l1 = typed.slice(0, split > 0 ? split : 14), l2 = typed.length > split ? typed.slice(split + 1) : "";
        PX.text(g, l1, cx + 10, cy + 26, { size: 8, col: "#e6edf3" }); PX.text(g, l2, cx + 10, cy + 38, { size: 8, col: "#5fe3e8" });
        if (PX.blink(t, 0.5)) { const lt = l2 ? l2 : l1, ly = l2 ? cy + 38 : cy + 26; R(g, cx + 10 + PX.tw(g, lt, { size: 8 }) + 1, ly, 2, 8, "#e6edf3"); }
        PX.glow(g, cx + cw / 2, cy + ch / 2, 90, "rgba(95,227,232,0.12)");
        // a heart pops on the comment once it is posted
        const ht = t - (cmt + 0.6 + text.length / 16); if (ht > 0) { const hs = E(clamp(ht / 0.25, 0, 1), "back"), hx = cx + cw - 22, hy = cy + ch - 14;
          PX.sprite(g, [".rr.rr.", "rrrrrrr", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."], hx, hy - Math.round(hs * 3), { r: "#ff5c8a" }, 1);
          PX.text(g, "1", hx + 10, hy - 2, { font: "v", size: 12, col: "#ff9ab8" }); if (ht < 0.5) PX.glow(g, hx + 3, hy, 20, "rgba(255,92,138,0.6)", 1 - ht * 2); }
      }
      PX.particles(g, 61, 30, t, [60, 40, 260, 220], { vy: -3, vx: 3, col: "#ffd8a8", a: 0.6 });
      PX.vignette(g, 0.5);
    };
  };
})();
