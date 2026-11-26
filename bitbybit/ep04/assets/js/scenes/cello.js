/* EP4 Builder E: Cello (MIT 2016), code compiled to DNA that runs inside E. coli.
   Kinds: verilog_ed, compile_dna, ecoli_in, cell_circuit, plate60, my_code, tumor_drug, root_microbes, grow_prog.
   Documentary palette PX.D only (no hex literals), native-resolution pixel art, pure functions of t. */
(function () {
  const { K, D } = PX;
  const R = PX.rect, P = PX.p, E = PX.ease, clamp = PX.clamp, lerp = PX.lerp;

  // ---------- local helpers (kept inside this file) ----------
  const hx = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A = hx(a), B = hx(b); k = clamp(k, 0, 1); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const rgba = (c, a) => `rgba(${hx(c).join(",")},${a})`;
  const dk = (c, k) => mix(c, D.n0, k);            // darken toward night
  const ell = (g, cx, cy, rx, ry, col) => { g.fillStyle = col; for (let y = -ry; y <= ry; y++) { const w = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (y / ry) ** 2))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); } };
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
  const A = (g, a, fn) => PX.alpha(g, a, fn);
  // default beat time scaled to shot length: tm(o, "gate", 5.0, d, 13)
  const tm = (o, k, def, d, base) => (o[k] !== undefined && o[k] !== null ? o[k] : (def * d) / base);
  const label = (g, s, x, y, col, o) => PX.otext(g, s, x, y, { align: "center", col: col || D.cream, outline: D.n0, ...(o || {}) });
  const SKIN = [mix(mix(D.rose[1], D.lampD, 0.45), D.paper, 0.45), mix(D.rose[1], D.lampD, 0.45), mix(mix(D.rose[1], D.lampD, 0.45), D.rust[2], 0.55)];
  const COAT = [mix(D.cream, D.n4, 0.12), mix(D.paper, D.n4, 0.2), mix(D.paperD, D.n3, 0.3)];

  // ---------- shared props ----------
  // monitor bezel + stand; screen rect returned
  const monitor = (g, x, y, w, h, o) => {
    o = o || {};
    const b = o.bez || 6;
    if (o.stand !== false) { R(g, x + w / 2 - 7, y + h, 14, o.standH || 14, D.n2); R(g, x + w / 2 - 7, y + h, 2, o.standH || 14, D.n3);
      R(g, x + w / 2 - 26, y + h + (o.standH || 14) - 2, 52, 4, D.n3); R(g, x + w / 2 - 26, y + h + (o.standH || 14) - 2, 52, 1, D.n4); }
    R(g, x, y, w, h, D.n2); R(g, x, y, w, 1, D.n4); R(g, x, y, 1, h, D.n3); R(g, x + w - 1, y, 1, h, D.n1); R(g, x, y + h - 2, w, 2, D.n1);
    R(g, x + w - 12, y + h - 4, 3, 1, dk(D.moss[1], 0.25));               // power led
    return { x: x + b, y: y + b, w: w - 2 * b, h: h - 2 * b - 1 };
  };
  // code editor: tokens per line typed progressively
  const SYN = () => ({ kw: D.rust[0], id: D.cream, fn: D.amber[0], op: D.teal[0], p: D.n7, com: D.n5 });
  const VLINES = [
    [["// on when a is present and b is missing", "com"]],
    [],
    [["module", "kw"], [" sensor", "fn"], ["(", "p"], ["input", "kw"], [" a, ", "id"], ["input", "kw"], [" b, ", "id"], ["output", "kw"], [" y", "id"], [");", "p"]],
    [["  assign", "kw"], [" y ", "id"], ["= ", "op"], ["a ", "id"], ["& ~", "op"], ["b", "id"], [";", "p"]],
    [["endmodule", "kw"]],
  ];
  const VCH = VLINES.reduce((s, l) => s + l.reduce((a, [x]) => a + x.length, 0) + 1, 0);
  const typedLines = (lines, n) => {
    const out = [];
    for (const ln of lines) { const segs = []; for (const [txt, k] of ln) { if (n <= 0) break; const m = Math.min(txt.length, n); segs.push([txt.slice(0, m), k]); n -= m; } out.push(segs); n -= 1; if (n < 0) break; }
    return out;
  };
  // editor body inside screen rect s. o: n (chars typed), fs (font size), status, prog (0..1 or null), t
  const editor = (g, s, t, o) => {
    const syn = SYN(), fs = o.fs || 12, lh = Math.round(fs * 0.95);
    R(g, s.x, s.y, s.w, s.h, mix(D.n1, D.teal[2], 0.12));
    // tab bar
    const tbh = Math.round(fs * 0.9);
    R(g, s.x, s.y, s.w, tbh, D.n2); R(g, s.x + 3, s.y + 2, PX.tw(g, "sensor.v", { font: "v", size: fs - 2 }) + 10, tbh - 2, mix(D.n1, D.teal[2], 0.12));
    PX.text(g, "sensor.v", s.x + 8, s.y + 1, { font: "v", size: fs - 2, col: D.n7 });
    R(g, s.x + 3, s.y + 2, PX.tw(g, "sensor.v", { font: "v", size: fs - 2 }) + 10, 1, D.amber[1]);
    // gutter (dots, no numbers)
    const gx = s.x + 4, top = s.y + tbh + 4;
    R(g, s.x, s.y + tbh, 12, s.h - tbh, mix(D.n1, D.n2, 0.5));
    const lines = typedLines(VLINES, o.n);
    const nl = Math.min(Math.floor((s.h - tbh - 14) / lh), Math.max(lines.length, 1) + 2);
    for (let i = 0; i < nl; i++) R(g, gx + 2, top + i * lh + Math.round(fs * 0.4), 2, 1, i < lines.length ? D.n5 : D.n3);
    let cx = s.x + 16, cy = top;
    lines.forEach((segs, i) => {
      let lx = s.x + 16; for (const [txt, k] of segs) lx += PX.text(g, txt, lx, top + i * lh, { font: "v", size: fs, col: syn[k] });
      cx = lx; cy = top + i * lh;
    });
    if (o.cursor !== false && (PX.blink(t, 1.0, 0.55) || o.typing)) R(g, Math.round(cx + 1), cy + 2, Math.max(2, Math.round(fs / 6)), fs - 3, D.cream);
    // status bar
    const sh = Math.round(fs * 0.9), sy = s.y + s.h - sh;
    if (o.log && o.log.length) {                                        // build output pane
      const lh2 = fs - 2, py = sy - 4 - 3 * lh2;
      R(g, s.x, py - 3, s.w, 1, D.n3);
      o.log.forEach((ln, i) => PX.text(g, ln, s.x + 8, py + i * lh2, { font: "v", size: fs - 2, col: i === o.log.length - 1 ? D.n7 : D.n5 }));
    }
    R(g, s.x, sy, s.w, sh, D.n2); R(g, s.x, sy, s.w, 1, D.n3);
    if (o.prog !== null && o.prog !== undefined) {
      PX.text(g, "COMPILING", s.x + 6, sy, { font: "v", size: fs - 2, col: D.amber[0] });
      const bx = s.x + 12 + PX.tw(g, "COMPILING", { font: "v", size: fs - 2 }), bw = s.w - (bx - s.x) - 8;
      R(g, bx, sy + 3, bw, sh - 5, D.n1); R(g, bx, sy + 3, Math.round(bw * clamp(o.prog, 0, 1)), sh - 5, D.amber[2]); R(g, bx, sy + 3, Math.round(bw * clamp(o.prog, 0, 1)), 1, D.amber[1]);
    } else PX.text(g, "VERILOG", s.x + s.w - 6, sy, { font: "v", size: fs - 2, col: D.n5, align: "right" });
  };
  // largest VT323 size where the longest code line fits width w
  const fitFs = (g, w, max) => { const L = VLINES[2].map((x) => x[0]).join(""); for (let fs = max || 16; fs > 8; fs--) if (PX.tw(g, L, { font: "v", size: fs }) + 22 <= w) return fs; return 9; };

  // reagent bottle (brown/clear/white), base at (x, y)
  const bottle = (g, x, y, w, h, kind, far) => {
    const f = far || 0;
    const body = kind === "brown" ? [D.amber[2], dk(D.amber[2], 0.35), dk(D.amber[2], 0.6)] : kind === "white" ? [D.n7, D.n6, D.n5] : [D.glass, dk(D.glass, 0.35), dk(D.glass, 0.6)];
    const c = body.map((x) => dk(x, f));
    R(g, x, y - h, w, h, c[1]); R(g, x + w - 2, y - h, 2, h, c[2]); R(g, x + 1, y - h + 2, 1, h - 4, c[0]);
    R(g, x + Math.floor(w / 2) - 2, y - h - 4, 4, 4, c[1]); R(g, x + Math.floor(w / 2) - 3, y - h - 7, 6, 3, dk(D.n4, f));
    if (w > 6) { R(g, x + 2, y - h + Math.floor(h / 3), w - 4, Math.floor(h / 3), dk(D.paper, 0.25 + f)); }
  };
  // rack of microtubes with coloured caps
  const tubeRack = (g, x, y, n, t, caps) => {
    R(g, x, y - 12, n * 8 + 4, 12, D.n4); R(g, x, y - 12, n * 8 + 4, 1, D.n6); R(g, x, y - 1, n * 8 + 4, 1, D.n2);
    for (let i = 0; i < n; i++) {
      const tx = x + 3 + i * 8, cap = caps[i % caps.length];
      R(g, tx, y - 24, 5, 14, dk(D.glass, 0.25)); R(g, tx + 4, y - 24, 1, 14, dk(D.glass, 0.55)); R(g, tx + 1, y - 22, 1, 10, D.glass);
      R(g, tx + 1, y - 15, 3, 5, mix(cap[1], D.glass, 0.5));
      R(g, tx - 1, y - 27, 7, 3, cap[1]); R(g, tx - 1, y - 27, 7, 1, cap[0]); R(g, tx + 5, y - 27, 1, 3, cap[2]);
      R(g, tx - 1, y - 12, 7, 2, D.n3);
    }
  };
  // pipette (vertical, in a stand), top at (x, y)
  const pipette = (g, x, y, h, cap) => {
    R(g, x, y, 6, 8, cap[1]); R(g, x, y, 6, 1, cap[0]); R(g, x + 5, y, 1, 8, cap[2]);
    R(g, x - 1, y + 8, 8, Math.round(h * 0.45), D.n6); R(g, x - 1, y + 8, 1, Math.round(h * 0.45), D.n7); R(g, x + 6, y + 8, 1, Math.round(h * 0.45), D.n4);
    R(g, x + 1, y + 14, 4, 6, D.n2); R(g, x + 2, y + 15, 2, 4, D.amber[2]);             // little volume window (no digits)
    R(g, x + 1, y + 8 + Math.round(h * 0.45), 4, Math.round(h * 0.3), D.n5); R(g, x + 1, y + 8 + Math.round(h * 0.45), 1, Math.round(h * 0.3), D.n6);
    R(g, x + 2, y + 8 + Math.round(h * 0.75), 2, Math.round(h * 0.2), D.n7);
  };
  // articulated desk lamp: base (bx, by), head pointing down to (hx, hy)
  const deskLamp = (g, bx, by, hx2, hy2, on) => {
    R(g, bx - 12, by - 4, 24, 4, D.n3); R(g, bx - 12, by - 4, 24, 1, D.n5);
    const ex = bx + 6, ey = by - 60;
    PX.line(g, bx, by - 4, ex, ey, D.n4); PX.line(g, bx + 1, by - 4, ex + 1, ey, D.n3);
    PX.line(g, ex, ey, hx2 - 6, hy2 - 10, D.n4); PX.line(g, ex, ey + 1, hx2 - 6, hy2 - 9, D.n3);
    R(g, ex - 1, ey - 1, 3, 3, D.n5);
    poly(g, [[hx2 - 5, hy2 - 15], [hx2 + 4, hy2 - 15], [hx2 + 15, hy2 + 3], [hx2 - 15, hy2 + 3]], D.n3);
    poly(g, [[hx2 - 5, hy2 - 15], [hx2 - 2, hy2 - 15], [hx2 - 10, hy2 + 3], [hx2 - 15, hy2 + 3]], D.n4);
    PX.line(g, hx2 - 5, hy2 - 15, hx2 - 15, hy2 + 3, D.n5); R(g, hx2 - 2, hy2 - 18, 4, 3, D.n4);
    if (on) { ell(g, hx2, hy2 + 3, 13, 2, D.lamp); R(g, hx2 - 6, hy2 + 3, 12, 1, D.cream); PX.glow(g, hx2, hy2 + 4, 26, rgba(D.lamp, 0.35)); }
  };

  // night-time window with distant lit windows (outside layer)
  const nightWindow = (g, x, y, w, h, t, c) => {
    PX.par(g, c, 0.85, () => {   // nested inside the wall layer (0.45): total about 0.3
      PX.vgrad(g, x, y, w, h, dk(D.steel[2], 0.55), dk(D.steel[2], 0.25), 6);
      const r = PX.rnd(9);
      let bx = x - 6;
      while (bx < x + w) { const bw = 10 + Math.floor(r() * 18), bh = 18 + r() * h * 0.45, top = y + h - bh; R(g, bx, top, bw, bh, dk(D.n2, 0.3));
        for (let wy = top + 3; wy < y + h - 2; wy += 5) for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) if (r() < 0.18) R(g, wx, wy, 2, 2, dk(D.lamp, 0.45 + 0.1 * Math.sin(t * 0.4 + wx)));
        bx += bw + 1; }
    });
    // frame + blinds (fixed to wall)
    R(g, x - 4, y - 4, w + 8, 4, D.n3); R(g, x - 4, y + h, w + 8, 6, D.n4); R(g, x - 4, y + h, w + 8, 1, D.n5);
    R(g, x - 4, y, 4, h, D.n3); R(g, x + w, y, 4, h, D.n3); R(g, x + w / 2 - 1, y, 3, h, D.n3);
    for (let i = 0; i < 9; i++) { R(g, x, y + i * 4, w, 2, mix(D.n4, D.n5, 0.4)); R(g, x, y + i * 4 + 2, w, 1, D.n3); }
    PX.line(g, x + 10, y, x + 10, y + 36, D.n5);
  };
  // lab-coat arm pressing a key: fingertip at (fx, fy), arm comes from lower right
  const pressArm = (g, fx, fy) => {
    const wx = fx + 14, wy = fy + 12;                                       // wrist
    poly(g, [[wx - 6, wy - 2], [wx + 10, wy - 6], [wx + 70, wy + 120], [wx + 36, wy + 132]], COAT[1]);
    poly(g, [[wx - 6, wy - 2], [wx - 1, wy - 3], [wx + 42, wy + 130], [wx + 36, wy + 132]], COAT[0]);
    poly(g, [[wx + 5, wy - 5], [wx + 10, wy - 6], [wx + 70, wy + 120], [wx + 62, wy + 124]], COAT[2]);
    PX.line(g, wx + 14, wy + 40, wx + 22, wy + 58, COAT[2]); PX.line(g, wx + 24, wy + 70, wx + 30, wy + 86, COAT[2]);
    poly(g, [[wx - 7, wy - 2], [wx + 10, wy - 7], [wx + 13, wy - 2], [wx - 4, wy + 3]], COAT[2]);   // cuff
    // hand (back of hand, fingers curled, index extended)
    poly(g, [[fx - 2, fy + 3], [fx + 12, fy - 1], [fx + 18, fy + 8], [fx + 4, fy + 13]], SKIN[1]);
    PX.line(g, fx - 1, fy + 3, fx + 12, fy - 1, SKIN[0]);
    R(g, fx + 9, fy + 8, 8, 3, SKIN[2]); R(g, fx + 11, fy + 6, 3, 2, SKIN[2]);   // curled fingers
    R(g, fx - 1, fy, 3, 8, SKIN[1]); R(g, fx - 1, fy, 1, 8, SKIN[0]); R(g, fx + 1, fy + 2, 1, 6, SKIN[2]);   // index
    R(g, fx - 4, fy + 5, 4, 3, SKIN[1]); R(g, fx - 4, fy + 5, 4, 1, SKIN[0]);                               // thumb
  };

  // ======================= verilog_ed =======================
  // molecular-biology bench at night; code types; gate card; hand presses COMPILE.
  // o.code (0.5) typing starts, o.gate (5.0) gate card, o.compile (10.5) key press
  K.verilog_ed = (o) => {
    const rb = PX.rnd(41), SHELF = [];
    for (let x = -30; x < 680;) { const w = 6 + Math.floor(rb() * 9), h = 12 + Math.floor(rb() * 16), k = rb(); SHELF.push([x, w, h, k < 0.35 ? "brown" : k < 0.7 ? "clear" : "white"]); x += w + 2 + Math.floor(rb() * 7); }
    const NEU = [D.n7, D.n6, D.n5], CAPS = [D.amber, NEU, D.teal, D.amber, NEU, D.moss, NEU, D.amber];
    return (g, t, d, c) => {
      const t0 = tm(o, "code", 0.5, d, 13), tg = tm(o, "gate", 5.0, d, 13), tc = tm(o, "compile", 10.5, d, 13);
      const cps = Math.max(10, VCH / Math.max(1, (tg + (tc - tg) * 0.45) - t0));
      const n = t < t0 ? 0 : Math.floor((t - t0) * cps), typing = n > 0 && n < VCH;
      const BY = 236;                                                      // bench back edge
      // ---- far: wall, window, shelf (par 0.45) ----
      PX.par(g, c, 0.45, () => {
        PX.vgrad(g, -40, -40, 720, BY + 44, dk(D.n2, 0.35), D.n2, 9);
        for (let y = 60; y < BY; y += 22) R(g, -40, y, 720, 1, mix(D.n2, D.n1, 0.45));
        for (let y = 38; y < BY; y += 22) for (let x = -40 + ((y / 22) % 2) * 15; x < 680; x += 30) R(g, x, y + 22, 1, 21, mix(D.n2, D.n1, 0.3));
        nightWindow(g, 14, 70, 96, 104, t, c);
        for (const [x, w, h, k] of SHELF) bottle(g, x, 48, w, h, k, 0.62);
        R(g, -40, 48, 720, 4, D.n3); R(g, -40, 48, 720, 1, D.n4); R(g, -40, 52, 720, 3, D.n1);
        // lab coat on a hook, far right
        R(g, 624, 66, 3, 3, D.n4);
        poly(g, [[614, 72], [636, 72], [644, 180], [606, 180]], dk(D.paper, 0.66)); poly(g, [[623, 72], [627, 72], [626, 150], [624, 150]], dk(D.paper, 0.78));
      });
      // warm lamp spill on the wall behind the lamp
      PX.glow(g, 122, 200, 130, rgba(D.lamp, 0.14));
      // ---- mid: gate card pinned on the wall (par 0.6) ----
      PX.par(g, c, 0.6, () => {
        if (t < tg) return;
        const kin = P(t, tg, 0.5, "out"), x = 404, y = 74 - Math.round((1 - kin) * 8), w = 156, h = 108, paper = mix(D.paper, D.n4, 0.24);
        A(g, kin, () => {
          R(g, x + 3, y + 4, w, h, "rgba(0,0,0,0.35)");
          R(g, x, y, w, h, paper); R(g, x, y, w, 1, D.paper); R(g, x, y + h - 1, w, 1, D.paperD); R(g, x + w - 1, y, 1, h, D.paperD);
          for (let ly = y + 14; ly < y + h - 4; ly += 11) R(g, x + 4, ly, w - 8, 1, mix(paper, D.teal[1], 0.2));
          R(g, x + 4, y + 4, w - 8, 1, mix(paper, D.rust[1], 0.3));
          R(g, x + w / 2 - 2, y - 2, 4, 4, D.rust[1]); R(g, x + w / 2 - 2, y - 2, 4, 1, D.rust[0]);
        });
        // pencil drawing: wires + AND body + bubble on B, drawn progressively
        const pk = P(t, tg + 0.4, 1.4, "io"), ink = D.ink, gx = x + 84, gy = y + 18;
        A(g, kin, () => {
          const seg = (p0, p1, x1, y1, x2, y2) => { const k = clamp((pk - p0) / (p1 - p0), 0, 1); if (k > 0) PX.line(g, x1, y1, lerp(x1, x2, k), lerp(y1, y2, k), ink); };
          seg(0, 0.2, x + 66, gy + 8, gx, gy + 8);
          seg(0.05, 0.25, x + 66, gy + 28, gx - 6, gy + 28);
          if (pk > 0.3) { PX.circle(g, gx - 3, gy + 28, 3, ink); PX.circle(g, gx - 3, gy + 28, 2, paper); }
          if (pk > 0.3) {
            const k = clamp((pk - 0.3) / 0.4, 0, 1);
            R(g, gx, gy, 1, Math.round(36 * Math.min(1, k * 2)), ink);
            if (k > 0.3) { R(g, gx, gy, 12, 1, ink); R(g, gx, gy + 35, 12, 1, ink); }
            if (k > 0.5) for (let a = -90; a <= 90; a += 2) { if ((a + 90) / 180 > (k - 0.5) * 2) break; R(g, gx + 12 + Math.round(Math.cos((a * Math.PI) / 180) * 18), gy + 18 + Math.round(Math.sin((a * Math.PI) / 180) * 17.5), 1, 1, ink); }
          }
          seg(0.72, 0.9, gx + 30, gy + 18, x + w - 12, gy + 18);
        });
        const lt = tg + 1.2;
        const lab = (s, lx, ly, t1, col, al) => { if (t < t1) return; A(g, kin * P(t, t1, 0.35, "out"), () => PX.text(g, PX.typed(s, t, t1, 22), lx, ly, { font: "v", size: 15, col, align: al || "left" })); };
        lab("A PRESENT", x + 8, gy + 1, lt, ink);
        lab("B MISSING", x + 8, gy + 21, lt + 0.5, ink);
        lab("OUTPUT ON", x + w - 10, gy + 44, lt + 1.0, D.moss[2], "right");
        if (t > lt + 1.4) A(g, P(t, lt + 1.4, 0.4, "out"), () => { PX.circle(g, x + w - 12, gy + 18, 3, D.moss[1]); R(g, x + w - 13, gy + 17, 2, 1, D.moss[0]); PX.glow(g, x + w - 12, gy + 18, 10, rgba(D.moss[0], 0.3)); });
      });
      // monitor cool spill
      PX.glow(g, 270, 160, 180, rgba(D.teal[0], 0.07));
      // ---- bench (black epoxy top, cabinets below) ----
      R(g, -10, BY, 660, 2, D.n4);
      PX.vgrad(g, -10, BY + 2, 660, 44, D.n2, D.n3, 5);
      R(g, -10, BY + 46, 660, 2, D.n5); R(g, -10, BY + 48, 660, 6, D.n2); R(g, -10, BY + 54, 660, 80, D.n1);
      for (let x = 14; x < 640; x += 158) { R(g, x, BY + 62, 144, 70, mix(D.n1, D.n2, 0.55)); R(g, x, BY + 62, 144, 1, D.n2); R(g, x + 64, BY + 78, 16, 2, D.n3); R(g, x + 64, BY + 78, 16, 1, D.n4); }
      PX.glow(g, 118, BY + 24, 120, rgba(D.lamp, 0.26));
      PX.glow(g, 118, BY + 70, 90, rgba(D.lamp, 0.08));
      // ---- mid props (par 0.85) ----
      PX.par(g, c, 0.85, () => {
        deskLamp(g, 34, BY + 10, 118, 146, true);
        // tip box
        R(g, 410, BY + 2, 36, 12, D.n4); R(g, 410, BY + 2, 36, 1, D.n6); R(g, 410, BY + 2, 1, 12, D.n5);
        for (let i = 0; i < 6; i++) R(g, 413 + i * 5, BY, 3, 2, mix(D.amber[0], D.paper, 0.5));
        tubeRack(g, 470, BY + 18, 8, t, CAPS);
        R(g, 566, BY - 12, 6, 10, dk(D.glass, 0.3)); poly(g, [[566, BY - 2], [572, BY - 2], [590, BY + 22], [548, BY + 22]], dk(D.glass, 0.4));
        poly(g, [[559, BY + 9], [579, BY + 9], [588, BY + 21], [550, BY + 21]], D.teal[2]); R(g, 554, BY + 9 + Math.round(Math.sin(t * 1.4)), 30, 1, D.teal[1]);
        PX.line(g, 567, BY - 1, 553, BY + 19, D.glass);
        R(g, 600, BY - 4, 46, 22, D.n4); R(g, 600, BY - 4, 46, 1, D.n6); ell(g, 623, BY - 4, 18, 3, D.n5); R(g, 606, BY + 10, 3, 2, PX.blink(t, 2.4, 0.85) ? D.amber[1] : D.amber[2]);
      });
      // ---- monitor (focus) ----
      const mx = 150, my = 84, mw = 240, mh = 134;
      const s = monitor(g, mx, my, mw, mh, { standH: 20 });
      const fs = fitFs(g, s.w, 13);
      const cd = clamp(d - tc - 0.4, 0.8, 2.0), prog = t >= tc + 0.12 ? 0.62 * E(clamp((t - tc - 0.12) / cd, 0, 1), "out") : null;   // compile_dna finishes the bar
      const LOG = ["> compile sensor.v"];
      const log = t < tc + 0.2 ? null : [PX.typed(LOG[0], t, tc + 0.2, 30)];
      editor(g, s, t, { n, fs, typing, prog, log });
      R(g, s.x, s.y, s.w, 1, rgba(D.cream, 0.08));
      PX.glow(g, mx + mw / 2, BY + 20, 100, rgba(D.teal[0], 0.06));
      // ---- near: notebook, keyboard, pipettes, hand (par 1) ----
      PX.par(g, c, 1.0, () => {
        // open lab notebook lying flat at the front
        poly(g, [[112, BY + 30], [200, BY + 30], [206, BY + 44], [104, BY + 44]], D.paperD);
        poly(g, [[113, BY + 29], [155, BY + 29], [155, BY + 43], [106, BY + 43]], mix(D.paper, D.lamp, 0.15));
        poly(g, [[157, BY + 29], [199, BY + 29], [204, BY + 43], [157, BY + 43]], D.paper);
        for (let i = 0; i < 4; i++) { R(g, 112 - i, BY + 32 + i * 3, 36, 1, mix(D.paper, D.ink, 0.35)); R(g, 162, BY + 32 + i * 3, 30 + i, 1, mix(D.paper, D.ink, 0.25)); }
        PX.line(g, 176, BY + 44, 214, BY + 36, D.amber[2]); PX.line(g, 177, BY + 44, 214, BY + 37, D.amber[1]); R(g, 174, BY + 44, 3, 1, D.ink);
        // keyboard
        const kx = 202, ky = BY + 20;
        R(g, kx, ky, 138, 14, D.n3); R(g, kx, ky, 138, 1, D.n5); R(g, kx, ky + 13, 138, 1, D.n1);
        const pressK = tc, down = t > pressK && t < pressK + 0.35;
        for (let r = 0; r < 3; r++) for (let q = 0; q < 17; q++) {
          if (r === 1 && q === 16) continue;
          const kxp = kx + 3 + q * 8 - (r === 1 ? 2 : 0), kyp = ky + 2 + r * 4;
          const hit = typing && ((Math.floor(t * 16) + q * 5 + r * 7) % 19 === 0);
          R(g, kxp, kyp + (hit ? 1 : 0), 6, 3, hit ? D.n5 : D.n4); R(g, kxp, kyp + (hit ? 1 : 0), 6, 1, D.n6);
        }
        const ex = kx + 124, ey = ky + 5 + (down ? 1 : 0), lit = t > pressK ? clamp(1 - (t - pressK) / 1.6, 0, 1) : 0;
        R(g, ex, ey, 11, 6, lit > 0 ? mix(D.n5, D.amber[1], lit) : D.n5); R(g, ex, ey, 11, 1, lit > 0 ? D.amber[0] : D.n7);
        if (lit > 0) PX.glow(g, ex + 5, ey + 3, 16, rgba(D.amber[1], 0.25 * lit));
        R(g, 352, BY + 24, 9, 7, D.n4); R(g, 352, BY + 24, 9, 1, D.n6); R(g, 356, BY + 24, 1, 3, D.n2);
        // pipette stand (in the lamp pool)
        R(g, 74, BY + 18, 50, 5, D.n4); R(g, 74, BY + 18, 50, 1, D.n6); R(g, 96, BY - 52, 4, 70, D.n4); R(g, 96, BY - 52, 1, 70, D.n6);
        R(g, 76, BY - 42, 46, 4, D.n4); R(g, 76, BY - 42, 46, 1, D.lampD);
        pipette(g, 80, BY - 56, 54, D.amber); pipette(g, 104, BY - 54, 50, [D.n7, D.n6, D.n5]); pipette(g, 113, BY - 52, 46, D.moss);
        R(g, 80, BY - 56, 1, 7, D.lamp); R(g, 79, BY - 48, 1, 24, D.n7);
        // hand reaching for enter (from bottom right)
        const reach = P(t, tc - 0.75, 0.75, "out") * (1 - P(t, tc + 1.3, 0.8, "io"));
        if (reach > 0) pressArm(g, lerp(500, ex + 5, reach), lerp(400, ey - 7, reach) + (down ? 1 : 0));
        if (t > pressK) { const k = clamp(P(t, pressK, 0.3, "back"), 0, 1.2); A(g, clamp(k, 0, 1), () => label(g, "COMPILE", ex + 4, BY + 60 - Math.round((1 - clamp(k, 0, 1)) * 4), D.amber[0])); }
      });
      PX.particles(g, 13, 24, t, [60, 150, 130, 100], { vy: -2, vx: 1.5, col: D.lamp, a: 0.5 });
      PX.vignette(g, 0.5);
    };
  };
  // ---------- biology helpers ----------
  // rod bacterium (capsule) at any angle, pixel-scanned: pal = [hi, base, edge, core]
  const rod = (g, cx, cy, len, rad, ang, pal, a) => {
    const ux = Math.cos(ang), uy = Math.sin(ang), ext = len / 2 + rad + 1, hl = len / 2, o = g.globalAlpha;
    g.globalAlpha = o * (a === undefined ? 1 : a);
    for (let y = Math.floor(cy - ext); y <= Math.ceil(cy + ext); y++) for (let x = Math.floor(cx - ext); x <= Math.ceil(cx + ext); x++) {
      const px = x + 0.5 - cx, py = y + 0.5 - cy, s = clamp(px * ux + py * uy, -hl, hl), dx = px - s * ux, dy = py - s * uy, dd = Math.sqrt(dx * dx + dy * dy);
      if (dd > rad) continue;
      let col;
      if (dd > rad - 1.1) col = pal[2];
      else if ((dx * -0.55 + dy * -0.83) / rad > 0.45) col = pal[0];
      else if (dd < rad * (0.32 + 0.14 * Math.sin(s * 0.7 + cx)) && Math.abs(s) < hl * 0.85) col = pal[3];
      else col = pal[1];
      g.fillStyle = col; g.fillRect(x, y, 1, 1);
    }
    g.globalAlpha = o;
  };
  // flagella trailing from the back of a rod
  const flagella = (g, cx, cy, len, rad, ang, t, col, n, a) => {
    const ux = Math.cos(ang), uy = Math.sin(ang), bx = cx - ux * (len / 2 + rad - 1), by = cy - uy * (len / 2 + rad - 1), o = g.globalAlpha;
    g.globalAlpha = o * (a === undefined ? 0.6 : a);
    for (let k = 0; k < (n || 3); k++) {
      const off = (k - ((n || 3) - 1) / 2) * 0.5;
      for (let i = 2; i < 18; i++) { const w = Math.sin(i * 0.55 - t * 9 + k * 2) * 2.2 * (i / 18), ax = -ux, ay = -uy;
        const x = bx + ax * i + (-ay) * (w + off * i * 0.6), y = by + ay * i + ax * (w + off * i * 0.6); g.fillStyle = col; g.fillRect(Math.round(x), Math.round(y), 1, 1); }
    }
    g.globalAlpha = o;
  };
  const BACT = () => [mix(D.glass, D.teal[1], 0.15), mix(D.glass, D.teal[2], 0.5), mix(D.glass, D.cream, 0.35), mix(D.teal[2], D.n2, 0.25)];
  // plasmid ring
  const plasmid = (g, x, y, r, t) => {
    for (let a = 0; a < 6.283; a += 0.08) { const px = x + Math.cos(a) * r, py = y + Math.sin(a) * r * 0.9, top = Math.sin(a) < -0.3;
      R(g, Math.round(px), Math.round(py), 2, 2, top ? D.amber[0] : D.amber[1]); }
    if (r >= 5) { const gm = [[0.4, D.moss[1]], [2.2, D.rust[1]], [4.0, D.teal[1]]];
      for (const [a0, col] of gm) for (let a = a0; a < a0 + 0.8; a += 0.1) R(g, Math.round(x + Math.cos(a + t * 0.3) * r), Math.round(y + Math.sin(a + t * 0.3) * r * 0.9), 2, 2, col); }
  };
  // filled horizontal capsule via row spans
  const hcap = (g, cx, cy, hl, rad, col, dy0) => {
    g.fillStyle = col;
    for (let y = -rad; y <= rad; y++) { const w = Math.floor(Math.sqrt(rad * rad - y * y)); g.fillRect(Math.round(cx - hl - w), Math.round(cy + y + (dy0 || 0)), 2 * (hl + w) + 1, 1); }
  };
  const inCap = (x, y, cx, cy, hl, rad) => { const s = clamp(x - cx, -hl, hl); return (x - cx - s) ** 2 + (y - cy) ** 2 <= rad * rad; };
  // microscope eyepiece mask: everything outside circle (cx, cy, r) to black + rim
  const eyepiece = (g, cx, cy, r) => {
    const gr = g.createRadialGradient(cx, cy, r * 0.7, cx, cy, r); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.55)"); g.fillStyle = gr; g.fillRect(cx - r, cy - r, 2 * r, 2 * r);
    for (let y = -40; y < 400; y++) { const dy = y + 0.5 - cy; if (Math.abs(dy) >= r) { R(g, -40, y, 720, 1, D.n0); continue; }
      const w = Math.sqrt(r * r - dy * dy); R(g, -40, y, cx - w + 40, 1, D.n0); R(g, cx + w, y, 720 - (cx + w) + 40, 1, D.n0); }
    for (let a = 0; a < 6.283; a += 0.004) { const x = cx + Math.cos(a) * (r + 1), y = cy + Math.sin(a) * (r + 1); R(g, Math.round(x), Math.round(y), 2, 2, Math.sin(a) < -0.4 ? D.n4 : D.n2); }
  };

  // ======================= compile_dna =======================
  // close on the monitor: progress bar, ghost chip layout crossed out, DNA sequence types out.
  // o.dna (2.5) DNA replaces the chip
  K.compile_dna = (o) => {
    const rs = PX.rnd(23), SEQ = [...Array(900)].map(() => "ACGT"[Math.floor(rs() * 4)]).join("");
    const rc = PX.rnd(5), BLOCKS = [...Array(9)].map((_, i) => [i % 3, Math.floor(i / 3), 0.6 + rc() * 0.4]);
    return (g, t, d, c) => {
      const td = tm(o, "dna", 2.5, d, 5);
      // room behind the monitor (barely visible at the edges)
      PX.par(g, c, 0.5, () => { PX.vgrad(g, -40, -40, 720, 440, dk(D.n2, 0.3), D.n1, 8); PX.glow(g, -10, 200, 180, rgba(D.lamp, 0.16)); });
      // bench edge + keyboard (near, bottom)
      R(g, -10, 326, 660, 40, D.n2); R(g, -10, 326, 660, 1, D.n4);
      PX.glow(g, 60, 340, 120, rgba(D.lamp, 0.14));
      // monitor
      const s = monitor(g, 30, 10, 580, 310, { bez: 12, stand: false });
      R(g, 30, 10, 1, 310, mix(D.n3, D.lampD, 0.35));     // lamp catches the left bezel edge
      const fs = 20, ink = mix(D.n1, D.teal[2], 0.12);
      R(g, s.x, s.y, s.w, s.h, ink);
      // title bar
      R(g, s.x, s.y, s.w, 18, D.n2); R(g, s.x + 24, s.y + 3, 74, 15, ink); R(g, s.x + 24, s.y + 3, 74, 1, D.amber[1]);
      PX.text(g, "sensor.v", s.x + 32, s.y + 2, { font: "v", size: 16, col: D.n7 });
      // progress bar
      const pg = clamp((t - 0.08 * td) / Math.max(0.3, td * 0.75), 0, 1), done = pg >= 1;
      const by = s.y + s.h - 26;
      R(g, s.x, by - 4, s.w, 30, D.n2); R(g, s.x, by - 4, s.w, 1, D.n3);
      PX.text(g, done ? "DONE" : "COMPILING", s.x + 30, by - 1, { font: "v", size: 18, col: done ? D.moss[0] : D.amber[0] });
      const bx = s.x + 120, bw = s.w - 160;
      R(g, bx, by + 3, bw, 12, D.n1); R(g, bx, by + 3, Math.round(bw * E(pg, "io")), 12, done ? D.moss[2] : D.amber[2]); R(g, bx, by + 3, Math.round(bw * E(pg, "io")), 2, done ? D.moss[1] : D.amber[1]);
      for (let x = bx + 8; x < bx + bw; x += 8) R(g, x, by + 3, 1, 12, "rgba(0,0,0,0.25)");
      // ghost chip layout
      const area = { x: s.x + 10, y: s.y + 26, w: s.w - 20, h: by - 12 - (s.y + 26) };
      const chipA = clamp((t - 0.16 * td) / (0.24 * td), 0, 1) * (1 - clamp((t - td) / 0.25, 0, 1));
      if (chipA > 0) A(g, chipA, () => {
        const cx = area.x + area.w / 2, cy = area.y + area.h / 2 + 6, w = 190, h = 140, x0 = cx - w / 2, y0 = cy - h / 2, col = mix(D.steel[1], D.n2, 0.35), coli = D.steel[0];
        PX.text(g, "CHIP LAYOUT", cx, y0 - 22, { font: "v", size: 18, col: D.n6, align: "center" });
        PX.box(g, x0, y0, w, h, col); PX.box(g, x0 + 1, y0 + 1, w - 2, h - 2, mix(col, D.n1, 0.5));
        for (let i = 0; i < 12; i++) { R(g, x0 + 10 + i * 15, y0 - 6, 6, 6, col); R(g, x0 + 10 + i * 15, y0 + h, 6, 6, col); }
        for (let i = 0; i < 8; i++) { R(g, x0 - 6, y0 + 12 + i * 15, 6, 6, col); R(g, x0 + w, y0 + 12 + i * 15, 6, 6, col); }
        const bp = clamp((t - 0.24 * td) / (0.42 * td), 0, 1);
        BLOCKS.forEach(([i, j, k], n) => { if (n / BLOCKS.length > bp) return; const bx2 = x0 + 16 + i * 58, by2 = y0 + 14 + j * 42; PX.box(g, bx2, by2, 44 * k + 8, 26, coli); R(g, bx2 + 3, by2 + 3, 44 * k + 2, 2, mix(coli, D.n1, 0.6)); });
        if (bp > 0.5) for (let i = 0; i < 4; i++) { PX.line(g, x0 + 30 + i * 40, y0 + 40, x0 + 30 + i * 40, y0 + 56, mix(coli, D.n1, 0.4)); PX.line(g, x0 + 20, y0 + 96 + (i % 2) * 4, x0 + 170, y0 + 96 + (i % 2) * 4, mix(coli, D.n1, 0.55)); }
        // crossed out
        const xk = clamp((t - td * 0.72) / (td * 0.13), 0, 1), xk2 = clamp((t - td * 0.82) / (td * 0.13), 0, 1);
        for (let w2 = 0; w2 < 3; w2++) {
          if (xk > 0) PX.line(g, x0 - 14 + w2, y0 - 10, lerp(x0 - 14, x0 + w + 14, xk) + w2, lerp(y0 - 10, y0 + h + 10, xk), D.rust[1]);
          if (xk2 > 0) PX.line(g, x0 + w + 14 - w2, y0 - 10, lerp(x0 + w + 14, x0 - 14, xk2) - w2, lerp(y0 - 10, y0 + h + 10, xk2), D.rust[1]);
        }
      });
      // DNA sequence typing (groups of ten, scrolls when full)
      if (t >= td) {
        const k = clamp((t - td - 0.2) / 0.3, 0, 1);
        A(g, k, () => PX.text(g, "DNA SEQUENCE", area.x + area.w / 2, area.y + 2, { font: "v", size: 18, col: D.cream, align: "center" }));
        const per = 30, cw = 14, gap = 10, lh = 20, rows = Math.floor((area.h - 26) / lh);
        const tt = Math.max(0, t - td - 0.25), n = Math.floor(tt * 170), full = Math.floor(n / per), x0 = area.x + area.w / 2 - (per * cw + 2 * gap) / 2;
        const first = Math.max(0, full - rows + 1), sc = full >= rows ? (tt * 170 - full * per) / per : 0;
        for (let r = first; r <= full; r++) {
          const yy = area.y + 26 + (r - first) * lh - Math.round(sc * lh * (full >= rows ? 1 : 0));
          if (yy < area.y + 22 || yy > area.y + area.h - lh + 2) continue;
          const m = r < full ? per : n - full * per;
          for (let i = 0; i < m; i++) { const ch = SEQ[(r * per + i) % SEQ.length]; PX.text(g, ch, x0 + i * cw + Math.floor(i / 10) * gap, yy, { font: "v", size: fs, col: D.dna[ch] }); }
          if (r === full) R(g, x0 + m * cw + Math.floor(m / 10) * gap + 1, yy + 4, 3, 13, PX.blink(t, 0.8) ? D.cream : ink);
        }
      }
      // sticky note on the bezel (the gate doodle from the bench)
      R(g, 552, 4, 50, 42, "rgba(0,0,0,0.35)"); R(g, 548, 0, 50, 42, mix(D.amber[0], D.paper, 0.55)); R(g, 548, 41, 50, 1, mix(D.amber[2], D.paper, 0.4));
      { const ink2 = mix(D.ink, D.amber[2], 0.3); R(g, 556, 14, 10, 1, ink2); R(g, 556, 28, 8, 1, ink2); R(g, 566, 10, 1, 22, ink2); R(g, 566, 10, 8, 1, ink2); R(g, 566, 31, 8, 1, ink2);
        for (let a = -90; a <= 90; a += 6) R(g, 574 + Math.round(Math.cos((a * Math.PI) / 180) * 10), 21 + Math.round(Math.sin((a * Math.PI) / 180) * 10.5), 1, 1, ink2);
        R(g, 584, 21, 8, 1, ink2); R(g, 563, 27, 3, 3, ink2); R(g, 564, 28, 1, 1, mix(D.amber[0], D.paper, 0.55)); }
      // glass: faint reflection band + screen light on the room
      A(g, 0.05, () => poly(g, [[s.x + 40, s.y], [s.x + 130, s.y], [s.x + 40, s.y + s.h], [s.x - 50, s.y + s.h]], D.cream));
      PX.glow(g, 320, 340, 200, rgba(D.teal[0], 0.05));
      PX.vignette(g, 0.5);
    };
  };

  // ======================= ecoli_in =======================
  // microscope view of E. coli; a plasmid ring slides into one cell at o.in (2.0), which then glows faintly.
  // o.label (0.4) "E. COLI" label
  K.ecoli_in = (o) => {
    const r = PX.rnd(31), B = [];
    const CX = 320, CY = 182, RR = 162;
    B.push({ x: 336, y: 196, a: 0.35, len: 30, rad: 8, vx: 1.2, vy: -0.6, va: 0.02, ph: 0 });     // target
    while (B.length < 15) { const a = r() * 6.283, rr = 30 + r() * (RR - 30); const x = CX + Math.cos(a) * rr, y = CY + Math.sin(a) * rr;
      if (B.some((b) => (b.x - x) ** 2 + (b.y - y) ** 2 < 1300)) continue;
      B.push({ x, y, a: r() * 6.283, len: 20 + r() * 12, rad: 6 + Math.round(r()), vx: (r() - 0.5) * 5, vy: (r() - 0.5) * 5, va: (r() - 0.5) * 0.12, ph: r() * 6 }); }
    let LB = 1; B.forEach((b, i) => { if (i && (b.x - 400) ** 2 + (b.y - 120) ** 2 < (B[LB].x - 400) ** 2 + (B[LB].y - 120) ** 2) LB = i; });
    const FAR = [...Array(12)].map(() => [r() * 640, r() * 360, 12 + r() * 16, r() * 6.283, (r() - 0.5) * 3]);
    const DEB = [...Array(30)].map(() => [r() * 640, r() * 360, r()]);
    return (g, t, d, c) => {
      const ti = tm(o, "in", 2.0, d, 6.5), tl = tm(o, "label", 0.4, d, 6.5);
      // field background
      R(g, -40, -40, 720, 440, mix(D.n1, D.teal[2], 0.3));
      PX.glow(g, CX - 30, CY - 40, 210, rgba(D.teal[0], 0.1));
      // far: out-of-focus cells
      PX.par(g, c, 0.5, () => { for (const [x, y, rr, a, v] of FAR) PX.glow(g, x + v * t, y + Math.sin(t * 0.3 + a) * 3, rr, rgba(D.glass, 0.12)); });
      // mid: bacteria
      const pal = BACT();
      B.forEach((b, i) => {
        const x = b.x + b.vx * t + Math.sin(t * 0.8 + b.ph) * 1.5, y = b.y + b.vy * t + Math.cos(t * 0.7 + b.ph) * 1.5, a = b.a + b.va * t + Math.sin(t * 1.3 + b.ph) * 0.04;
        flagella(g, x, y, b.len, b.rad, a, t + b.ph, mix(D.glass, D.n5, 0.3), 2, 0.4);
        let p2 = pal;
        if (i === 0 && t > ti) { const k = P(t, ti, 1.2, "io") * (0.85 + 0.15 * Math.sin(t * 2.2)); p2 = pal.map((cc, j) => mix(cc, j === 2 ? D.amber[1] : D.amber[0], k * (j === 3 ? 0.55 : 0.28))); }
        rod(g, x, y, b.len, b.rad, a, p2, 0.88);
        if (i === 0 && t > ti) { const k = P(t, ti, 1.2, "io"); PX.glow(g, x, y, 34, rgba(D.amber[0], 0.16 * k * (0.85 + 0.15 * Math.sin(t * 2.2)))); A(g, k, () => plasmid(g, Math.round(x + 2), Math.round(y), 3, t)); }
        if (i === 0) b._x = x, b._y = y;
      });
      // plasmid sliding in
      const T = B[0];
      if (t < ti + 0.15) {
        const k = P(t, ti - 1.6, 1.6, "io"), px = lerp(170, T._x + 2, k) + Math.sin(k * 3.1) * -18, py = lerp(110, T._y, k) + Math.sin(k * 3.1) * 14;
        const rr = Math.round(lerp(8, 3, P(t, ti - 0.35, 0.4, "io")));
        A(g, 1 - P(t, ti, 0.15, "lin"), () => { PX.glow(g, px, py, 16, rgba(D.amber[1], 0.18)); plasmid(g, Math.round(px), Math.round(py), rr, t); });
        if (o.labels !== false && t > ti - 1.6 && t < ti - 0.2) A(g, P(t, ti - 1.6, 0.3) * (1 - P(t, ti - 0.5, 0.3)), () => label(g, "DNA", Math.round(px), Math.round(py) - 22, D.amber[0], { font: "p", size: 8 }));
      }
      // near: debris specks
      PX.par(g, c, 1.15, () => { for (const [x, y, k] of DEB) { g.globalAlpha = 0.25 + 0.2 * k; R(g, x + Math.sin(t * 0.4 + k * 6) * 4, y - t * (1 + k * 2), 1, 1, D.glass); } g.globalAlpha = 1; });
      // reticle
      A(g, 0.18, () => { R(g, CX - RR, CY, 2 * RR, 1, D.n6); R(g, CX, CY - RR, 1, 2 * RR, D.n6); for (let i = -6; i <= 6; i++) R(g, CX + i * 10, CY - 2, 1, 5, D.n6); });
      eyepiece(g, CX, CY, RR);
      if (o.labels !== false && t > tl) { const b = B[LB], k = P(t, tl, 0.4); const x = b.x + b.vx * t + Math.sin(t * 0.8 + b.ph) * 1.5, y = b.y + b.vy * t + Math.cos(t * 0.7 + b.ph) * 1.5;
        A(g, k, () => { PX.line(g, x + 8, y - 8, x + 18, y - 18, D.cream); label(g, "E. COLI", x + 20, y - 32, D.cream, { align: "left" }); }); }
      PX.vignette(g, 0.45);
    };
  };

  // ======================= cell_circuit =======================
  // cutaway bacterium as a living circuit: OXYGEN / SUGAR sensors (o.in 0.5), genes repress genes (o.gates 4.0),
  // output gene glows and the cell fills with protein (o.out 7.5)
  K.cell_circuit = (o) => {
    const CX = 320, CY = 186, HL = 190, RAD = 92;
    const r = PX.rnd(12), RIB = [...Array(220)].map(() => [CX - HL - RAD + r() * (2 * HL + 2 * RAD), CY - RAD + r() * 2 * RAD, r() * 6.283, r()]).filter(([x, y]) => inCap(x, y, CX, CY, HL, RAD - 9));
    const FARB = [...Array(7)].map(() => [r() * 640, r() * 360, r() * 6.283, 30 + r() * 20]);
    const O2 = [...Array(12)].map((_, i) => [r(), r(), i, r() * 6.283]);
    const PROT = [...Array(170)].map(() => [r(), r(), r(), r()]);
    const PILI = [...Array(34)].map(() => [r(), r() * 0.6 - 0.3, 3 + r() * 5]);
    const TY = 214, GW = 54, G = [{ x: 172 }, { x: 276 }, { x: 380 }, { x: 476 }];
    const PAP = [D.paper, D.paperD, mix(D.paperD, D.n2, 0.4)];
    // perimeter point of the capsule at parameter u (0..1) and its outward normal
    const per = (u) => {
      const L = 2 * (2 * HL) + 2 * Math.PI * RAD; let s = u * L;
      if (s < 2 * HL) return [CX - HL + s, CY - RAD, 0, -1]; s -= 2 * HL;
      if (s < Math.PI * RAD) { const a = -Math.PI / 2 + s / RAD; return [CX + HL + Math.cos(a) * RAD, CY + Math.sin(a) * RAD, Math.cos(a), Math.sin(a)]; } s -= Math.PI * RAD;
      if (s < 2 * HL) return [CX + HL - s, CY + RAD, 0, 1]; s -= 2 * HL;
      const a = Math.PI / 2 + s / RAD; return [CX - HL + Math.cos(a) * RAD, CY + Math.sin(a) * RAD, Math.cos(a), Math.sin(a)];
    };
    const gene = (g, x, y, on, base, k) => {
      const c0 = on ? base[0] : mix(base[2], D.n2, 0.35), c1 = on ? base[1] : mix(base[2], D.n2, 0.55), c2 = on ? base[2] : D.n2;
      poly(g, [[x, y - 9], [x + GW - 10, y - 9], [x + GW, y], [x + GW - 10, y + 9], [x, y + 9]], c1);
      R(g, x, y - 9, GW - 10, 1, c0); R(g, x, y + 8, GW - 10, 1, c2); R(g, x, y - 9, 1, 18, c0);
      for (let i = 0; i < 3; i++) R(g, x + 9 + i * 11, y - 8, 5, 16, on ? c0 : c2);
      const pc = mix(D.paperD, D.n3, 0.2);                                // promoter: bent arrow
      R(g, x - 6, y - 19, 1, 10, pc); R(g, x - 6, y - 19, 8, 1, pc); R(g, x + 1, y - 21, 1, 5, pc); R(g, x + 2, y - 20, 1, 3, pc);
      if (on && k) PX.glow(g, x + GW / 2, y, 30, rgba(base[0], 0.22 * k));
    };
    const repress = (g, x1, x2, h, k, on) => {
      if (k <= 0) return;
      const col = on ? D.rust[0] : mix(D.rust[2], D.n2, 0.25), n = 36;
      for (let i = 0; i <= n * k; i++) { const u = i / n, x = lerp(x1, x2, u), y = TY - 14 - Math.sin(u * Math.PI) * h; if (on || i % 3 !== 2) R(g, Math.round(x), Math.round(y), 2, 2, col); }
      if (k >= 1) R(g, x2 - 6, TY - 15, 13, 2, col);
    };
    return (g, t, d, c) => {
      const tin = tm(o, "in", 0.5, d, 10.5), tg = tm(o, "gates", 4.0, d, 10.5), to = tm(o, "out", 7.5, d, 10.5), sc = clamp(d / 10.5, 0.4, 1.5);
      // far: dark medium, other cells drifting
      R(g, -40, -40, 720, 440, mix(D.n0, D.teal[2], 0.16));
      PX.glow(g, 200, 40, 300, rgba(D.teal[0], 0.05));
      PX.par(g, c, 0.4, () => { for (const [x, y, a, l] of FARB) A(g, 0.2, () => rod(g, x + Math.sin(t * 0.2 + a) * 4, y, l, 9, a + t * 0.01, [D.n4, D.n3, D.n4, D.n3])); });
      PX.particles(g, 4, 30, t, [0, 0, 640, 360], { vy: -1.5, vx: 1, col: D.n5, a: 0.35 });
      // flagella + pili outside (right end)
      for (let k = 0; k < 3; k++) { const by = CY - 30 + k * 30; for (let i = 0; i < 90; i++) { const x = CX + HL + RAD - 4 + i, y = by + Math.sin(i * 0.12 - t * 5 + k * 2) * (3 + i * 0.06) + (k - 1) * i * 0.25; A(g, 0.5 * (1 - i / 100), () => R(g, x, y, 1, 1, D.teal[1])); } }
      for (const [u, j, l] of PILI) { const [x, y, nx, ny] = per(u); for (let i = 1; i < l; i++) R(g, x + nx * (2 + i) + j * i * ny, y + ny * (2 + i) - j * i * nx, 1, 1, mix(D.teal[2], D.n5, 0.3)); }
      // membrane (outer lit rim, double layer) + cytoplasm
      hcap(g, CX, CY, HL, RAD, D.teal[0], -1);
      hcap(g, CX, CY, HL, RAD, D.teal[1]);
      hcap(g, CX, CY, HL, RAD - 2, D.teal[2]);
      hcap(g, CX, CY, HL, RAD - 5, mix(D.teal[1], D.teal[2], 0.5));
      hcap(g, CX, CY, HL, RAD - 7, mix(D.n1, D.teal[2], 0.32));
      // lipid heads along the bilayer
      for (let i = 0; i < 300; i++) { const [x, y, nx, ny] = per(i / 300); R(g, x - nx * 3, y - ny * 3, 1, 1, mix(D.teal[0], D.teal[1], 0.4)); if (i % 2) R(g, x - nx * 5, y - ny * 5, 1, 1, D.teal[2]); }
      const fill = P(t, to + 0.6 * sc, 2.4 * sc, "io");
      if (fill > 0) A(g, 0.24 * fill, () => hcap(g, CX, CY, HL, RAD - 7, D.moss[1]));
      PX.glow(g, CX - 80, CY - 50, 220, rgba(D.teal[0], 0.06));
      // ribosomes / texture
      for (const [x, y, a, k] of RIB) { const xx = x + Math.sin(t * 0.5 + a) * 2, yy = y + Math.cos(t * 0.4 + a) * 2; R(g, xx, yy, k > 0.65 ? 2 : 1, k > 0.85 ? 2 : 1, mix(D.teal[2], D.glass, 0.2 + 0.25 * k)); }
      // the plasmid we put in: a twisted ring of DNA behind the circuit
      for (let a = 0; a < 6.283; a += 0.012) {
        const x = CX + 14 + Math.cos(a) * 176, y = CY + 22 + Math.sin(a) * 52, tw = Math.sin(a * 46 + t * 0.6) * 2;
        R(g, Math.round(x), Math.round(y + tw), 1, 1, mix(D.amber[2], D.n2, 0.35)); R(g, Math.round(x), Math.round(y - tw), 1, 1, mix(D.amber[2], D.n2, 0.55));
      }
      // DNA track (ladder)
      R(g, 150, TY - 2, 392, 1, D.paperD); R(g, 150, TY + 2, 392, 1, mix(D.paperD, D.n2, 0.35));
      for (let x = 152; x < 540; x += 4) R(g, x, TY - 1, 1, 3, mix(D.paperD, D.n2, 0.55));
      // sensors on the membrane (top = oxygen, bottom = sugar)
      const sx = 196, oxOn = P(t, tin + 1.0 * sc, 0.5 * sc, "out");
      const sensor = (y, dir, on, base) => {
        const c1 = on > 0 ? mix(D.n5, base[1], on) : D.n5, c0 = on > 0 ? mix(D.n6, base[0], on) : D.n6, c2 = D.n3;
        ell(g, sx, y + dir * 9, 9, 6, c1); ell(g, sx, y + dir * 10, 4, 2, mix(D.n1, D.teal[2], 0.3));              // outer cup
        R(g, sx - 4, y - 7, 8, 14, c1); R(g, sx - 4, y - 7, 1, 14, c0); R(g, sx + 3, y - 7, 1, 14, c2);           // channel through membrane
        ell(g, sx, y - dir * 11, 7, 5, c1); R(g, sx - 5, y - dir * 11 - 2, 3, 1, c0);                             // inner lobe
        if (on > 0) PX.glow(g, sx, y, 24, rgba(base[0], 0.22 * on));
      };
      sensor(CY - RAD + 2, -1, oxOn, D.steel);
      sensor(CY + RAD - 2, 1, 0, D.amber);
      // oxygen molecules (O2 pairs) drifting into the top sensor
      for (const [u, v, i, ph] of O2) {
        const st = tin + i * 0.22 * sc, k = P(t, st, 1.5 * sc, "io"); if (t < st - 0.6) continue;
        const x0 = sx - 150 + u * 300, y0 = 14 + v * 44, x = lerp(x0, sx + ((i % 3) - 1) * 2, k), y = lerp(y0, CY - RAD - 14, k) + Math.sin(t * 2 + ph) * (1 - k) * 4;
        A(g, P(t, st - 0.6, 0.6) * (1 - P(t, st + 1.5 * sc, 0.25)), () => { const a = ph + t * 0.8, dx = Math.round(Math.cos(a) * 2), dy = Math.round(Math.sin(a) * 2);
          PX.circle(g, x - dx, y - dy, 2, D.steel[1]); PX.circle(g, x + dx, y + dy, 2, D.steel[0]); R(g, x + dx - 1, y + dy - 1, 1, 1, D.cream); });
      }
      // signal path oxygen sensor -> gene 1
      const sigK = P(t, tin + 1.4 * sc, 1.0 * sc, "io");
      for (let i = 0; i < 16 * sigK; i++) { const u = i / 16, x = lerp(sx, G[0].x - 6, u), y = lerp(CY - RAD + 20, TY - 22, u); R(g, Math.round(x), Math.round(y), 2, 2, (((Math.floor(t * 8) - i) % 4) + 4) % 4 === 0 ? D.steel[0] : D.steel[1]); }
      // genes + repression
      const g1on = sigK >= 1, rep = P(t, tg, 1.0 * sc, "io"), g2off = P(t, tg + 1.0 * sc, 0.6 * sc);
      const outOn = t >= to, outK = P(t, to, 0.6 * sc, "out");
      gene(g, G[0].x, TY, g1on, D.steel, g1on ? 0.8 : 0);
      gene(g, G[1].x, TY, g2off < 1, PAP, 0);
      gene(g, G[2].x, TY, false, PAP, 0);
      gene(g, G[3].x, TY, outOn, D.moss, outK * (0.8 + 0.2 * Math.sin(t * 2)));
      repress(g, G[0].x + 34, G[1].x - 6, 26, rep, true);
      repress(g, G[1].x + 34, G[3].x - 6, 44, P(t, tg + 0.5 * sc, 1.0 * sc, "io"), g2off < 1);
      repress(g, G[2].x + 34, G[3].x - 10, 18, P(t, tg + 0.9 * sc, 1.0 * sc, "io"), false);
      // protein particles from the output gene
      if (outOn) for (const [u, v, w, z] of PROT) {
        const st = to + (0.2 + u * 2.6) * sc, k = P(t, st, (1.8 + z) * sc, "out"); if (t < st) continue;
        const ang = v * 6.283, rr = k * (50 + w * 230), x = G[3].x + 26 + Math.cos(ang) * rr * 1.3 + Math.sin(t + u * 9) * 2, y = TY + Math.sin(ang) * rr * 0.4;
        if (!inCap(x, y, CX, CY, HL, RAD - 9)) continue;
        R(g, x, y, 2, 2, z > 0.5 ? D.moss[0] : D.moss[1]); if (z > 0.8) R(g, x + 2, y + 1, 1, 1, D.moss[1]);
      }
      // labels
      A(g, P(t, tin, 0.5), () => { label(g, "OXYGEN", sx, CY - RAD - 38, D.steel[0]); label(g, "SUGAR", sx, CY + RAD + 22, D.n7); });
      if (t > tg) A(g, P(t, tg, 0.5), () => label(g, "GENES = GATES", 344, TY - 84, D.cream));
      if (t > to) A(g, P(t, to + 0.3, 0.5), () => label(g, "OUTPUT", G[3].x + 26, TY + 24, D.moss[0]));
      PX.vignette(g, 0.5);
    };
  };

  // ======================= plate60 =======================
  // top-down: a 60-well plate (6 x 10) on a light box; a read head scans well by well, 45 light moss green by o.end (5.0),
  // the 15 failures stay dark; "45 / 60" on lab tape at o.count (5.5). o.start (0.5) scan begins
  K.plate60 = (o) => {
    const r = PX.rnd(60), idx = [...Array(60).keys()];
    for (let i = 59; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const DEAD = new Set(idx.slice(0, 15));                 // exactly 15 dead -> 45 working
    const PH = [...Array(60)].map(() => r() * 6.283);
    return (g, t, d, c) => {
      const ts = tm(o, "start", 0.5, d, 8.5), te = tm(o, "end", 5.0, d, 8.5), tc = tm(o, "count", 5.5, d, 8.5);
      const PX0 = 182, PY0 = 94, PIT = 28, WR = 10;
      // far: bench surface (black epoxy) with lamp pool
      PX.par(g, c, 0.7, () => {
        PX.vgrad(g, -40, -40, 720, 440, D.n2, D.n1, 8);
        for (let i = 0; i < 40; i++) { const rr = PX.rnd((i + 3) * 2654435761); R(g, rr() * 680 - 20, rr() * 400 - 20, 1, 1, D.n3); }
        // notebook (right) with tick marks only
        R(g, 520, 120, 112, 150, mix(D.paper, D.n2, 0.45)); R(g, 520, 120, 112, 1, mix(D.paper, D.n2, 0.25)); R(g, 524, 120, 2, 150, mix(D.rust[2], D.n2, 0.4));
        for (let i = 0; i < 10; i++) R(g, 532, 134 + i * 12, 90, 1, mix(D.teal[1], D.n2, 0.6));
        for (let i = 0; i < 6; i++) { const y = 131 + i * 12; [[0, 3], [1, 4], [2, 5], [3, 4], [4, 3], [5, 2], [6, 1]].forEach(([a, b]) => R(g, 536 + a, y + b, 1, 1, mix(D.ink, D.n2, 0.2))); R(g, 550, y + 3, 40 + (i * 13) % 30, 1, mix(D.ink, D.paper, 0.6)); }
        // tip box (left)
        R(g, 22, 92, 92, 66, D.n3); R(g, 22, 92, 92, 1, D.n5); R(g, 26, 96, 84, 58, mix(D.teal[2], D.n2, 0.4));
        for (let y = 0; y < 6; y++) for (let x = 0; x < 9; x++) { R(g, 30 + x * 9, 100 + y * 9, 5, 5, mix(D.amber[0], D.n3, 0.55)); R(g, 31 + x * 9, 101 + y * 9, 3, 3, D.n2); }
        // multichannel pipette lying diagonally
        poly(g, [[40, 214], [52, 206], [126, 276], [114, 284]], D.n5); poly(g, [[40, 214], [44, 211], [118, 281], [114, 284]], D.n6);
        poly(g, [[110, 270], [140, 246], [156, 262], [126, 286]], D.n4);
        for (let i = 0; i < 6; i++) PX.line(g, 128 + i * 5, 280 - i * 4, 140 + i * 5, 292 - i * 4, D.n6);
      });
      PX.glow(g, 120, 60, 260, rgba(D.lamp, 0.10));
      // mid: light box + plate
      R(g, 150, 62, 340, 254, D.n3); R(g, 150, 62, 340, 1, D.n5); R(g, 150, 315, 340, 1, D.n1);
      PX.vgrad(g, 156, 68, 328, 242, mix(D.cream, D.n3, 0.6), mix(D.cream, D.n3, 0.74), 6);
      PX.glow(g, 320, 190, 200, rgba(D.lamp, 0.08));
      // plate body (clear plastic) + A1 notch
      const bx = PX0 - 22, by = PY0 - 20, bw = 9 * PIT + 44, bh = 5 * PIT + 40;
      R(g, bx + 3, by + 4, bw, bh, "rgba(0,0,0,0.35)");
      R(g, bx, by, bw, bh, mix(D.glass, D.n3, 0.62)); R(g, bx, by, bw, 1, mix(D.glass, D.n3, 0.2)); R(g, bx, by, 1, bh, mix(D.glass, D.n3, 0.35)); R(g, bx + bw - 1, by, 1, bh, mix(D.glass, D.n2, 0.7)); R(g, bx, by + bh - 1, bw, 1, mix(D.glass, D.n2, 0.7));
      poly(g, [[bx, by], [bx + 8, by], [bx, by + 8]], mix(D.cream, D.n3, 0.6));
      R(g, bx + 4, by + 4, bw - 8, bh - 8, mix(D.glass, D.n3, 0.7));
      "ABCDEF".split("").forEach((ch, i) => PX.text(g, ch, bx + 8, PY0 + i * PIT - 6, { font: "v", size: 12, col: mix(D.glass, D.n3, 0.25), align: "center" }));
      // read head position
      const sp = (te - ts) / 60, cur = Math.floor((t - ts) / sp);
      for (let k = 0; k < 60; k++) {
        const row = Math.floor(k / 10), col = k % 10, x = PX0 + col * PIT, y = PY0 + row * PIT;
        const tk = ts + k * sp, on = t >= tk + sp * 0.6 && !DEAD.has(k), kk = on ? P(t, tk + sp * 0.6, 0.4, "out") : 0;
        PX.circle(g, x, y, WR + 1, mix(D.glass, D.n2, 0.55));
        PX.circle(g, x, y, WR, mix(D.glass, D.n3, 0.45));
        PX.circle(g, x, y, WR - 1, mix(D.n2, D.moss[2], 0.22));
        R(g, x - 4, y - 7, 5, 1, mix(D.glass, D.n3, 0.3));                                     // meniscus glint
        if (kk > 0) {
          const br = 0.9 + 0.1 * Math.sin(t * 1.6 + PH[k]);
          PX.circle(g, x, y, WR - 1, mix(D.moss[2], D.moss[1], kk));
          PX.circle(g, x, y, WR - 3, mix(D.moss[2], D.moss[1], kk * br * 0.85));
          PX.circle(g, x - 1, y - 1, WR - 7, mix(D.moss[1], D.moss[0], kk * br * 0.6));
          R(g, x - 5, y - 6, 3, 1, mix(D.moss[1], D.cream, 0.25 * kk));
          PX.glow(g, x, y, 16, rgba(D.moss[0], 0.06 * kk * br));
        }
      }
      // read head: a soft cream square that steps well to well
      if (t >= ts && cur < 60) {
        const row = Math.floor(cur / 10), col = cur % 10, x = PX0 + col * PIT, y = PY0 + row * PIT;
        PX.box(g, x - 13, y - 13, 27, 27, mix(D.cream, D.n3, 0.25)); R(g, x - 13, y - 13, 4, 1, D.cream); R(g, x - 13, y - 13, 1, 4, D.cream);
        PX.glow(g, x, y, 16, rgba(D.cream, 0.1));
      }
      // tape with the count
      if (t >= tc) {
        const k = P(t, tc, 0.35, "out"), tx = 254, ty = by + bh + 8 - Math.round((1 - k) * 6);
        A(g, k, () => {
          R(g, tx + 2, ty + 3, 132, 24, "rgba(0,0,0,0.3)");
          R(g, tx, ty, 132, 24, mix(D.paper, D.lampD, 0.25)); R(g, tx, ty, 132, 1, D.paper);
          for (let i = 0; i < 24; i += 3) { R(g, tx - 1, ty + i, 1, 2, mix(D.paper, D.lampD, 0.25)); R(g, tx + 132, ty + i + 1, 1, 2, mix(D.paper, D.lampD, 0.25)); }
          PX.text(g, "45 / 60", tx + 66, ty - 1, { font: "v", size: 26, col: D.ink, align: "center" });
        });
      }
      // near: soft dark gloved fingertips at the bottom right (out of focus, par 1.3)
      PX.par(g, c, 1.25, () => { poly(g, [[500, 352], [508, 344], [652, 300], [652, 312]], D.n4); poly(g, [[500, 352], [503, 349], [652, 304], [652, 306]], D.n5); poly(g, [[488, 360], [494, 354], [508, 344], [500, 352]], mix(D.rust[1], D.n3, 0.3)); });
      PX.particles(g, 61, 18, t, [150, 60, 340, 250], { vy: -2, vx: 1, col: D.lamp, a: 0.35 });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= my_code =======================
  // gag: the same monitor on a cosy home desk; build output scrolls red ERROR lines; a tiny cactus wilts.
  K.my_code = (o) => {
    const MSG = ["ERROR: unexpected ';'", "ERROR: name 'y' is not defined", "warning: unused variable", "ERROR: missing bracket", "ERROR: type mismatch",
      "ERROR: cannot find module", "ERROR: unexpected end of file", "ERROR: expected expression", "warning: this looks wrong", "ERROR: everything"];
    const rs = PX.rnd(8), LINES = [...Array(120)].map(() => MSG[Math.floor(rs() * MSG.length)]);
    return (g, t, d, c) => {
      // far: warm wall, window with night rain, shelf
      PX.par(g, c, 0.45, () => {
        PX.vgrad(g, -40, -40, 720, 300, mix(D.n2, D.rust[2], 0.12), mix(D.n2, D.rust[2], 0.22), 8);
        // window
        const wx = 30, wy = 50, ww = 120, wh = 120;
        PX.vgrad(g, wx, wy, ww, wh, dk(D.steel[2], 0.6), dk(D.steel[2], 0.35), 6);
        for (let i = 0; i < 26; i++) { const rr = PX.rnd((i + 70) * 2654435761), x = wx + rr() * ww, y0 = rr() * wh, y = wy + ((((y0 + t * 90 * (0.7 + rr() * 0.5)) % wh) + wh) % wh); R(g, x, y, 1, 4, mix(D.steel[1], D.n2, 0.5)); }
        R(g, wx - 4, wy - 4, ww + 8, 4, mix(D.amber[2], D.n2, 0.4)); R(g, wx - 4, wy + wh, ww + 8, 6, mix(D.amber[2], D.n2, 0.3)); R(g, wx - 4, wy, 4, wh, mix(D.amber[2], D.n2, 0.4)); R(g, wx + ww, wy, 4, wh, mix(D.amber[2], D.n2, 0.4)); R(g, wx + ww / 2 - 1, wy, 3, wh, mix(D.amber[2], D.n2, 0.4));
        // shelf + books
        R(g, 456, 74, 160, 5, mix(D.amber[2], D.n2, 0.35)); R(g, 456, 74, 160, 1, mix(D.amber[1], D.n2, 0.4));
        const bk = [D.rust, [D.n6, D.n5, D.n4], D.amber, [D.paper, D.paperD, D.n5], D.rust, [D.n5, D.n4, D.n3], D.amber, D.rust];
        let bx = 462; bk.forEach((cc, i) => { const h = 20 + (i * 7) % 10, w = 7 + (i % 3); R(g, bx, 74 - h, w, h, mix(cc[2], D.n2, 0.25)); R(g, bx, 74 - h, 1, h, mix(cc[1], D.n2, 0.3)); bx += w + 1; });
        R(g, 560, 50, 14, 24, mix(D.moss[2], D.n2, 0.2)); R(g, 556, 66, 22, 8, mix(D.rust[2], D.n2, 0.2));
        // fairy-light string, calm warm dots
        for (let i = 0; i < 18; i++) { const x = 190 + i * 15, y = 34 + Math.round(Math.sin(i * 0.7) * 3 + (i - 9) ** 2 * 0.06); R(g, x, y, 2, 2, mix(D.lamp, D.n2, 0.25 + 0.15 * Math.sin(t * 1.2 + i))); }
      });
      PX.glow(g, 540, 170, 160, rgba(D.lamp, 0.16));
      // desk (warm wood)
      PX.vgrad(g, -10, 244, 660, 116, mix(D.rust[2], D.n2, 0.62), mix(D.rust[2], D.n0, 0.85), 7); R(g, -10, 244, 660, 2, mix(D.amber[2], D.n4, 0.3));
      for (let i = 0; i < 18; i++) { const rr = PX.rnd((i + 40) * 2654435761); R(g, rr() * 640, 250 + rr() * 100, 40 + rr() * 90, 1, mix(D.rust[2], D.n1, 0.65)); }
      // monitor
      const mx = 176, my = 66, mw = 272, mh = 164, s = monitor(g, mx, my, mw, mh, { standH: 16 });
      R(g, s.x, s.y, s.w, s.h, mix(D.n1, D.teal[2], 0.1));
      R(g, s.x, s.y, s.w, 14, D.n2); PX.text(g, "build output", s.x + 6, s.y, { font: "v", size: 14, col: D.n6 });
      const lh = 12, rows = Math.floor((s.h - 32) / lh), scroll = Math.max(0, t) * 9, first = Math.floor(scroll);
      g.save(); g.beginPath(); g.rect(s.x, s.y + 14, s.w, s.h - 30); g.clip();
      for (let i = 0; i <= rows + 1; i++) {
        const ln = LINES[(first + i) % LINES.length], y = s.y + 16 + i * lh - Math.round((scroll - first) * lh);
        const err = ln.startsWith("ERROR");
        PX.text(g, ln, s.x + 8, y, { font: "v", size: 14, col: err ? D.rust[0] : D.amber[1] });
      }
      g.restore();
      R(g, s.x, s.y + s.h - 16, s.w, 16, mix(D.rust[2], D.n2, 0.45)); PX.text(g, "BUILD FAILED", s.x + 8, s.y + s.h - 16, { font: "v", size: 15, col: D.rust[0] });
      PX.glow(g, mx + mw / 2, my + mh / 2, 170, rgba(D.rust[1], 0.06));
      // desk lamp (right) + mug + keyboard
      deskLamp(g, 560, 252, 520, 150, true);
      PX.glow(g, 520, 250, 110, rgba(D.lamp, 0.22));
      R(g, 232, 256, 160, 14, D.n3); R(g, 232, 256, 160, 1, D.n5);
      for (let r2 = 0; r2 < 3; r2++) for (let q = 0; q < 19; q++) { R(g, 235 + q * 8, 258 + r2 * 4, 6, 3, D.n4); R(g, 235 + q * 8, 258 + r2 * 4, 6, 1, D.n6); }
      // mug with steam
      R(g, 470, 236, 16, 18, mix(D.rust[1], D.n3, 0.25)); R(g, 470, 236, 16, 1, D.rust[0]); R(g, 486, 240, 4, 9, mix(D.rust[1], D.n3, 0.35)); R(g, 471, 238, 14, 2, mix(D.amber[2], D.n1, 0.5));
      for (let i = 0; i < 4; i++) { const k = (((t * 0.6 + i / 4) % 1) + 1) % 1; A(g, 0.35 * (1 - k), () => R(g, 476 + Math.round(Math.sin(k * 7 + i) * 3), 230 - k * 24, 2, 4, D.n7)); }
      // the sad tiny cactus: leans and its arms droop further during the shot
      const wilt = P(t, d * 0.35, d * 0.5, "io"), px2 = 134, py = 254;
      const CA = [D.moss[0], mix(D.moss[1], D.moss[2], 0.3), D.moss[2]];
      R(g, px2 - 11, py - 15, 22, 15, mix(D.rust[1], D.amber[2], 0.4)); R(g, px2 - 13, py - 18, 26, 4, mix(D.rust[0], D.amber[2], 0.45)); R(g, px2 - 13, py - 18, 26, 1, mix(D.rust[0], D.cream, 0.2));
      R(g, px2 + 7, py - 15, 4, 15, mix(D.rust[2], D.n2, 0.3)); R(g, px2 - 11, py - 17, 22, 2, mix(D.amber[2], D.n1, 0.5));
      const H = 26, lean = (i) => Math.round(((i / H) ** 2) * (3 + wilt * 7));
      for (let i = 0; i < H; i++) { const y = py - 19 - i, x = px2 - 5 + lean(i), w = i > H - 3 ? 9 - (i - (H - 3)) * 2 : 9, xo = (9 - w) / 2;
        R(g, x + xo, y, w, 1, CA[1]); R(g, x + xo, y, 2, 1, CA[0]); R(g, x + xo + w - 2, y, 2, 1, CA[2]); R(g, x + 4, y, 1, 1, CA[2]); if (i % 5 === 2) { R(g, x - 1, y, 1, 1, D.cream); R(g, x + 9, y + 2, 1, 1, D.cream); } }
      // arms: out, then hanging down (sadder as it wilts)
      const arm = (i0, dir, len) => { const y0 = py - 19 - i0, x0 = px2 - 5 + lean(i0) + (dir < 0 ? -1 : 9);
        for (let k = 0; k < 4; k++) R(g, x0 + dir * k - (dir < 0 ? 1 : 0), y0 - 1, 2, 4, CA[1]);
        const down = Math.round(len * (0.4 + wilt * 0.6)); for (let k = 0; k < down; k++) R(g, x0 + dir * 4 - (dir < 0 ? 1 : 0), y0 + 1 + k, 3, 1, k % 3 ? CA[1] : CA[2]); };
      arm(14, -1, 6); arm(18, 1, 5);
      // a tiny wilted flower falling off the top
      const fx = px2 - 1 + lean(H) + Math.round(wilt * 6), fy = py - 19 - H - 2 + Math.round(wilt * 4);
      R(g, fx, fy, 3, 2, D.rose[1]); R(g, fx, fy, 1, 1, D.rose[0]);
      // notebook with scribbles at the front left
      poly(g, [[60, 300], [170, 296], [176, 336], [62, 342]], mix(D.paper, D.n3, 0.45)); poly(g, [[62, 302], [116, 299], [118, 339], [64, 340]], mix(D.paper, D.n3, 0.35));
      for (let i = 0; i < 5; i++) { R(g, 70, 306 + i * 6, 38 - (i * 9) % 14, 1, mix(D.ink, D.paper, 0.45)); R(g, 124, 304 + i * 6, 40 - (i * 7) % 12, 1, mix(D.ink, D.paper, 0.5)); }
      PX.line(g, 128, 330, 160, 316, mix(D.rust[1], D.n2, 0.2)); PX.line(g, 128, 331, 160, 317, mix(D.rust[0], D.n2, 0.2));
      PX.particles(g, 77, 14, t, [440, 140, 160, 120], { vy: -2, vx: -1, col: D.lamp, a: 0.45 });
      PX.vignette(g, 0.55);
    };
  };

  // ======================= tumor_drug =======================
  // inside a blood vessel: engineered bacteria swim past healthy cells, detect a tumour cell at o.detect (1.5)
  // and release drug particles only there. o.labels (true) HEALTHY / TUMOR
  K.tumor_drug = (o) => {
    const r = PX.rnd(17);
    const RBC = [...Array(16)].map(() => [r() * 760 - 60, 120 + r() * 120, 0.6 + r() * 0.8, r() * 6.283]);
    const NEAR = [...Array(5)].map(() => [r() * 900, 100 + r() * 160, r() * 6.283]);
    const HEALTHY = [...Array(7)].map((_, i) => [40 + i * 56 + r() * 10, 286 + r() * 6, 15 + r() * 3, r() * 6.283]);
    const TUM = [...Array(18)].map(() => [r() * 6.283, 20 + r() * 18]), NUC = [...Array(7)].map(() => [(r() - 0.5) * 60, (r() - 0.5) * 22, 2 + Math.floor(r() * 3)]);
    const DRUG = [...Array(90)].map(() => [r(), r(), r()]);
    const BAC = [[0, -10, 0.0], [1, 16, 0.18], [2, 2, 0.34]];
    return (g, t, d, c) => {
      const td = tm(o, "detect", 1.5, d, 4.3), lab = o.labels !== false;
      const TX = 500, TYY = 280;
      // far: deep tissue behind the vessel
      PX.par(g, c, 0.5, () => {
        R(g, -40, -40, 720, 440, mix(D.rose[2], D.n0, 0.72));
        for (let i = 0; i < 8; i++) { const rr = PX.rnd((i + 90) * 2654435761); let x = rr() * 640, y = rr() * 360; for (let k = 0; k < 60; k++) { x += Math.cos(k * 0.2 + i) * 3; y += Math.sin(k * 0.13 + i * 2) * 2; R(g, x, y, 2, 1, mix(D.rose[2], D.n0, 0.5)); } }
      });
      // lumen
      PX.vgrad(g, -10, 70, 660, 230, mix(D.rose[2], D.n1, 0.62), mix(D.rose[2], D.n1, 0.78), 7);
      PX.glow(g, 260, 170, 280, rgba(D.rose[0], 0.07));
      // vessel walls (top + bottom), layered, slightly wavy
      const wall = (y0, dir) => {
        for (let x = -10; x < 660; x += 2) { const w = Math.round(Math.sin(x * 0.03 + t * 0.6) * 2 + Math.sin(x * 0.11) * 1.5), y = y0 + w;
          if (dir < 0) { R(g, x, -10, 2, y + 10, mix(D.rose[2], D.n1, 0.5)); R(g, x, y - 6, 2, 4, mix(D.rose[1], D.rose[2], 0.5)); R(g, x, y - 2, 2, 2, D.rose[1]); R(g, x, y, 2, 1, D.rose[0]); }
          else { R(g, x, y, 2, 380 - y, mix(D.rose[2], D.n1, 0.5)); R(g, x, y + 2, 2, 4, mix(D.rose[1], D.rose[2], 0.5)); R(g, x, y, 2, 2, D.rose[1]); R(g, x, y, 2, 1, D.rose[0]); } }
      };
      wall(74, -1); wall(300, 1);
      // endothelial cell outlines on the top wall
      for (let x = 20; x < 640; x += 46) { ell(g, x + Math.sin(x) * 6, 62, 18, 4, mix(D.rose[2], D.n1, 0.25)); ell(g, x + Math.sin(x) * 6, 62, 4, 2, mix(D.plum[2], D.n1, 0.3)); }
      for (let x = 30; x < 640; x += 52) { ell(g, x, 330, 16, 5, mix(D.rose[2], D.n1, 0.3)); ell(g, x, 330, 4, 2, mix(D.plum[2], D.n1, 0.3)); }
      // red blood cells drifting right
      for (const [x0, y0, sp, ph] of RBC) {
        const x = ((((x0 + t * 40 * sp) % 760) + 760) % 760) - 60, y = y0 + Math.sin(t * 1.2 + ph) * 4, tilt = Math.sin(t * 0.8 + ph);
        const rx = 11, ry = Math.max(3, Math.round(10 * Math.abs(tilt) + 2));
        ell(g, x, y, rx, ry, mix(D.rust[2], D.rose[2], 0.5)); ell(g, x, y - 1, rx - 1, ry - 1, mix(D.rose[1], D.rust[1], 0.4));
        if (ry > 5) ell(g, x, y, 5, ry - 5, mix(D.rose[2], D.rust[2], 0.45));
      }
      // healthy cells lining the bottom wall
      for (const [x, y, rr, ph] of HEALTHY) {
        if (x > TX - 70) continue;
        const b = Math.sin(t * 1.1 + ph);
        ell(g, x, y, rr, rr - 4 + Math.round(b * 0.6), mix(D.rose[2], D.n2, 0.2)); ell(g, x, y - 1, rr - 2, rr - 6, mix(D.rose[1], D.n2, 0.3)); R(g, x - rr + 4, y - rr + 6, 6, 1, mix(D.rose[0], D.n2, 0.15));
        ell(g, x + 2, y, 5, 4, mix(D.rose[2], D.plum[2], 0.4)); R(g, x + 1, y - 2, 2, 1, D.rose[1]);
      }
      // tumour: lumpy darker mass (shrinks a little once the drug arrives)
      const hit = P(t, td + 0.5, 2.0, "io"), shrink = 1 - 0.12 * hit;
      const lump = (k, col) => { for (const [a, rr] of TUM) ell(g, TX + Math.cos(a) * 26 * shrink, TYY + Math.sin(a) * 10 * shrink, Math.round(rr * shrink * k), Math.round(rr * 0.75 * shrink * k), col); };
      lump(1.0, mix(D.plum[2], D.n1, 0.35)); lump(0.88, mix(D.plum[2], D.rose[2], 0.45)); lump(0.66, mix(D.rose[2], D.plum[2], 0.4)); lump(0.4, mix(D.rose[2], D.plum[1], 0.3));
      for (const [nx, ny, nr] of NUC) { const x = TX + nx * shrink, y = TYY - 4 + ny * shrink; ell(g, x, y, nr + 1, nr, mix(D.plum[2], D.n1, 0.4)); R(g, x - 1, y - nr + 1, 2, 1, mix(D.plum[1], D.n2, 0.3)); }
      if (hit > 0) A(g, 0.4 * hit, () => lump(0.7, mix(D.n2, D.rose[2], 0.4)));
      // bacteria swimming in, then homing on the tumour
      const pal = BACT();
      BAC.forEach(([i, dy, lag]) => {
        const k = P(t, -0.1 + lag, td - lag + 0.1, "lin");
        let x = lerp(-40, TX - 30 + i * 18, k), y = lerp(150 + dy, 140 + dy, k), a = 0;
        if (t > td) { const h = P(t, td, 0.8, "io"); y = lerp(150 + dy - 10 * k, TYY - 48 + i * 4, h); x += h * (i - 1) * 14; a = h * 0.6 * (i === 1 ? 1 : 0.5); }
        x += Math.sin(t * 3 + i) * 1.5;
        flagella(g, x, y, 20, 6, a, t * 1.4 + i, mix(D.glass, D.n5, 0.3), 2, 0.45);
        rod(g, x, y, 20, 6, a, pal, 0.92);
      });
      // detection ring
      if (t > td && t < td + 0.9) { const k = P(t, td, 0.9, "out"), rr = Math.round(10 + k * 46); A(g, 0.6 * (1 - k), () => { for (let q = 0; q < 6.283; q += 0.05) R(g, Math.round(TX + Math.cos(q) * rr), Math.round(TYY - 36 + Math.sin(q) * rr * 0.6), 1, 1, D.cream); }); }
      // drug particles only at the tumour
      for (const [u, v, w] of DRUG) {
        const st = td + 0.35 + u * 1.6; if (t < st) continue;
        const k = P(t, st, 0.9 + w, "out"), a = v * 6.283, x0 = TX + (v - 0.5) * 40, y0 = TYY - 46;
        const x = x0 + Math.cos(a) * k * 30, y = y0 + k * (34 + Math.sin(a) * 10);
        A(g, 1 - P(t, st + 1.6, 0.6), () => { R(g, x, y, 2, 2, D.amber[1]); R(g, x, y, 1, 1, D.amber[0]); });
      }
      if (t > td + 0.4) PX.glow(g, TX, TYY - 10, 60, rgba(D.amber[0], 0.07 * P(t, td + 0.4, 0.8)));
      // near: out-of-focus blood cells passing in front
      PX.par(g, c, 1.3, () => { for (const [x0, y0, ph] of NEAR) { const x = ((((x0 + t * 70) % 900) + 900) % 900) - 130; A(g, 0.35, () => { ell(g, x, y0, 26, 12 + Math.round(Math.sin(t + ph) * 4), mix(D.rose[2], D.n1, 0.2)); ell(g, x, y0, 12, 5, mix(D.rose[2], D.n1, 0.45)); }); } });
      if (lab) {
        A(g, P(t, 0.3, 0.4) * (1 - P(t, td + 0.2, 0.4)), () => label(g, "HEALTHY", 160, 238, D.rose[0]));
        if (t > td) A(g, P(t, td, 0.4), () => label(g, "TUMOR", TX - 100, 250, D.cream));
      }
      PX.vignette(g, 0.55);
    };
  };

  // ======================= root_microbes =======================
  // underground cross-section; caterpillar chews a leaf at o.attack (1.5); root microbes release insecticide that
  // rises up the plant at o.spray (3.0); the caterpillar leaves (o.leave, default spray + 1.0)
  K.root_microbes = (o) => {
    const r = PX.rnd(29), GY = 160, SX = 300;
    // roots: taproot + laterals (+ small sub-branches) as polylines with widths
    const ROOTS = [];
    const grow = (x, y, a, len, w, depth, bias) => {
      const pts = [[x, y]];
      for (let i = 0; i < len; i++) { a += (r() - 0.5) * 0.25 + (Math.PI / 2 - a) * (bias || 0.02); x += Math.cos(a) * 3; y += Math.sin(a) * 3; pts.push([x, y]);
        if (depth === 0 && i > 2 && i % 5 === 3) { const side = (Math.floor(i / 5) % 2 ? 1 : -1), l = Math.round(len * (0.7 - i / len * 0.5) * (0.6 + r() * 0.4)); grow(x, y, Math.PI / 2 + side * (0.9 + r() * 0.5), l, Math.max(1.5, w - 1.5), 1, 0.012); }
        if (depth === 1 && i > 3 && r() < 0.12) grow(x, y, a + (r() < 0.5 ? -0.8 : 0.8), 4 + Math.floor(r() * 5), 1, 2, 0); }
      ROOTS.push({ pts, w, depth });
    };
    grow(SX, GY + 1, Math.PI / 2, 44, 4.5, 0, 0.05);
    ROOTS.sort((a, b) => b.depth - a.depth);
    const MIC = []; ROOTS.forEach((rt) => rt.pts.forEach((p, i) => { if (i > 2 && r() < (rt.depth === 2 ? 0.5 : 0.18)) MIC.push([p[0] + (r() - 0.5) * 7, p[1] + (r() - 0.5) * 7, r() * 6.283]); }));
    const PEB = [...Array(60)].map(() => [r() * 660 - 10, GY + 10 + r() * 200, 2 + Math.floor(r() * 4), r()]);
    const SPR = [...Array(80)].map(() => [r(), r(), r()]);
    const LAT = ROOTS.filter((x) => x.depth < 2);
    // leaf geometry (big right leaf): midline i -> (SX + 1 + i, 98 - 0.35 i)
    const LL = 74, LW = 14, lp = (i) => [SX + 1 + i, 98 - i * 0.35];
    const leafW = (i) => Math.round(Math.sin((i / LL) * Math.PI) ** 0.8 * LW);
    // neighbouring grass blade the caterpillar escapes along
    const BL = [...Array(30)].map((_, k) => { const u = k / 29; return [lerp(SX + LL - 10, 470, u) + Math.sin(u * 3.1) * 16, lerp(98 - (LL - 12) * 0.35 - 6, GY, u * u * 0.6 + u * 0.4)]; });
    // caterpillar path: along the leaf top, onto the blade, down to the ground and away
    const PATH = []; for (let i = 20; i <= LL - 16; i += 2) { const [x, y] = lp(i); PATH.push([x, y - leafW(i) * 0.35 - 3]); } BL.forEach((p) => PATH.push([p[0] + 1, p[1] - 3])); PATH.push([560, GY - 4], [700, GY - 4]);
    const CUM = [0]; for (let i = 1; i < PATH.length; i++) CUM.push(CUM[i - 1] + Math.hypot(PATH[i][0] - PATH[i - 1][0], PATH[i][1] - PATH[i - 1][1]));
    const at = (s) => { s = clamp(s, 0, CUM[CUM.length - 1]); let i = 1; while (i < CUM.length - 1 && CUM[i] < s) i++; const k = (s - CUM[i - 1]) / Math.max(1e-6, CUM[i] - CUM[i - 1]); return [lerp(PATH[i - 1][0], PATH[i][0], k), lerp(PATH[i - 1][1], PATH[i][1], k)]; };
    const S0 = 36;   // head arc position while chewing (leaf i ~ 56)
    return (g, t, d, c) => {
      const ta = tm(o, "attack", 1.5, d, 5.6), tsp = tm(o, "spray", 3.0, d, 5.6), tl = o.leave !== undefined ? o.leave : tsp + (1.0 * d) / 5.6;
      // far: dawn sky + hills (par 0.4), nearer hills (0.7)
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, -60, 720, GY + 160, mix(D.steel[2], D.n1, 0.4), mix(D.lampD, D.steel[2], 0.5), 24);
        PX.glow(g, 540, GY - 10, 150, rgba(D.lamp, 0.16));
        for (let x = -40; x < 680; x += 2) { const h = 24 + Math.sin(x * 0.012) * 10 + Math.sin(x * 0.041) * 4; R(g, x, GY - h, 2, h + 100, mix(D.moss[2], D.n2, 0.6)); }
      });
      PX.par(g, c, 0.7, () => { for (let x = -40; x < 680; x += 2) { const h = 10 + Math.sin(x * 0.025 + 2) * 5; R(g, x, GY - h, 2, h + 60, mix(D.moss[2], D.n2, 0.4)); } });
      // soil strata
      PX.vgrad(g, -10, GY, 660, 70, mix(mix(D.rust[2], D.amber[2], 0.45), D.n1, 0.55), mix(mix(D.rust[2], D.amber[2], 0.4), D.n1, 0.62), 8);
      PX.vgrad(g, -10, GY + 70, 660, 140, mix(mix(D.rust[2], D.amber[2], 0.4), D.n1, 0.62), mix(D.rust[2], D.n0, 0.72), 10);
      for (let x = -10; x < 660; x += 3) { R(g, x, GY + 68 + Math.round(Math.sin(x * 0.05) * 3), 3, 1, mix(D.amber[2], D.n1, 0.5)); R(g, x, GY + 150 + Math.round(Math.sin(x * 0.03 + 1) * 4), 3, 1, mix(D.rust[2], D.n0, 0.55)); }
      for (const [x, y, s, k] of PEB) { ell(g, x, y, s, Math.max(1, s - 1), mix(D.n4, D.amber[2], 0.25 + 0.3 * k)); R(g, x - s + 1, y - s + 1, s, 1, mix(D.n5, D.paperD, 0.3)); }
      // earthworm in its tunnel (bottom right)
      for (let i = 0; i < 30; i++) R(g, 470 + i * 2, 318 + Math.round(Math.sin(i * 0.4) * 3), 2, 4, mix(D.n0, D.rust[2], 0.3));
      for (let i = 0; i < 12; i++) { const x = 478 + i * 2 + Math.sin(t * 1.2) * 4, y = 318 + Math.round(Math.sin(i * 0.4 + t * 1.5) * 2); R(g, x, y + 1, 2, 2, D.rose[2]); R(g, x, y + 1, 2, 1, D.rose[1]); }
      // grass line
      for (let x = -10; x < 660; x += 2) { const h = 3 + ((x * 7) % 6); R(g, x, GY - h, 1, h, D.moss[2]); if ((x * 3) % 7 === 0) R(g, x, GY - h - 1, 1, 1, D.moss[1]); }
      R(g, -10, GY, 660, 2, mix(D.rust[2], D.n2, 0.2));
      PX.glow(g, SX, GY + 70, 170, rgba(D.lamp, 0.05));
      // roots (continuous, tapered, lit left edge)
      const alarmK = t > ta + 0.3 && t < ta + 1.5 ? Math.sin(((t - ta - 0.3) / 1.2) * Math.PI) : 0;
      for (const rt of ROOTS) {
        const n = rt.pts.length;
        for (let i = 1; i < n; i++) { const [x0, y0] = rt.pts[i - 1], [x1, y1] = rt.pts[i], w = Math.max(1, Math.round(rt.w * (1 - (i / n) * 0.75)));
          const base = mix(D.paperD, D.amber[2], 0.35), col = alarmK > 0 && rt.depth < 2 ? mix(base, D.rust[1], alarmK * 0.4) : base;
          for (let k = 0; k < w; k++) PX.line(g, x0 - w / 2 + k, y0, x1 - w / 2 + k, y1, k === 0 ? mix(D.paper, D.paperD, 0.3) : k === w - 1 && w > 2 ? mix(D.paperD, D.n2, 0.4) : col);
          if (rt.depth > 0 && i > n - 5 && i % 2 === 0) { R(g, x1 + 2, y1 - 1, 1, 1, mix(D.paperD, D.n2, 0.4)); R(g, x1 - 2, y1 + 1, 1, 1, mix(D.paperD, D.n2, 0.45)); } }
      }
      // microbes on the roots (tiny rods), they brighten when they respond
      const resp = P(t, tsp - 0.2, 0.5);
      for (const [x, y, ph] of MIC) { const wx = x + Math.sin(t * 2 + ph) * 0.8, wy = y + Math.cos(t * 1.7 + ph) * 0.8, a = ph + Math.sin(t * 0.8 + ph) * 0.4;
        rod(g, wx, wy, 3, 1.6, a, [mix(D.moss[0], D.amber[0], resp * 0.5), mix(D.moss[1], D.amber[1], resp * 0.4), D.moss[2], D.moss[1]], 1); }
      if (resp > 0) PX.glow(g, SX, GY + 60, 120, rgba(D.amber[0], 0.05 * resp));
      // plant: stem + leaves
      const sig = (y) => { if (t < tsp + 0.4) return 0; const head = lerp(GY, 50, P(t, tsp + 0.4, 0.8, "io")); return y >= head ? 0.4 * (1 - P(t, tsp + 2.0, 1.0)) : 0; };
      for (let y = 48; y < GY + 2; y++) { const x = SX + Math.round(Math.sin(y * 0.05) * 1.5), s = sig(y); R(g, x - 1, y, 4, 1, mix(D.moss[2], D.amber[1], s)); R(g, x - 1, y, 1, 1, mix(D.moss[1], D.amber[0], s)); R(g, x + 2, y, 1, 1, mix(D.moss[2], D.n2, 0.3)); }
      // alarm pulse running down the stem after the attack
      if (alarmK > 0) { const y = lerp(96, GY + 60, (t - ta - 0.3) / 1.2); if (y < GY) A(g, 0.8, () => R(g, SX - 1, y, 4, 4, D.rust[0])); }
      const leafPx = (cx, cy, dir, len, wd, bite, s) => {
        for (let i = 0; i < len; i++) { const k = i / len, w = Math.round(Math.sin(k * Math.PI) ** 0.8 * wd), lx = cx + dir * i, ly = cy - Math.round(i * 0.35);
          for (let j = -w; j <= w; j++) { if (bite && bite(i, j)) continue; const col = j < -w + 2 ? D.moss[0] : j > w - 2 ? D.moss[2] : j === 0 ? mix(D.moss[2], D.moss[1], 0.4) : D.moss[1]; R(g, lx, ly + j, 1, 1, s ? mix(col, D.amber[1], s * 0.25) : col); }
          if (i % 9 === 4 && w > 4 && !(bite && bite(i + 4, 0))) { PX.line(g, lx, ly, lx + dir * 4, ly - w + 2, mix(D.moss[2], D.moss[1], 0.4)); PX.line(g, lx, ly, lx + dir * 4, ly + w - 2, mix(D.moss[2], D.moss[1], 0.5)); } }
      };
      const leafS = t > tsp + 1.0 ? 0.6 * (1 - P(t, tsp + 2.2, 1.0)) * P(t, tsp + 1.0, 0.3) : 0;
      leafPx(SX - 1, 124, -1, 56, 11, null, leafS);
      // bites appear at the upper edge in front of the caterpillar's head
      const chew = clamp((Math.min(t, tsp + 0.9) - ta) / ((tsp + 0.9 - ta)), 0, 1);
      const cl = chew * 14;                                              // the leaf tip is eaten back, scalloped edge
      leafPx(SX + 1, 98, 1, LL, LW, (i, j) => cl > 0.5 && i > LL - cl + Math.round(2.5 * Math.cos(j * 0.9 + cl)), leafS);
      // bud on top
      ell(g, SX + 1, 46, 5, 4, D.moss[1]); R(g, SX - 2, 43, 3, 1, D.moss[0]); ell(g, SX - 5, 52, 4, 2, D.moss[2]); ell(g, SX + 6, 51, 4, 2, D.moss[1]);
      // grass blade (neighbour)
      BL.forEach(([x, y], k) => { if (k) { const [px, py] = BL[k - 1]; PX.line(g, px, py, x, y, D.moss[2]); PX.line(g, px - 1, py, x - 1, y, mix(D.moss[1], D.moss[2], 0.4)); } });
      // caterpillar: chews (head bobs), recoils when the insecticide arrives, then crawls away along the path
      const go = P(t, tl, Math.max(0.6, d - tl - 0.05), "io"), sHead = S0 + go * (CUM[CUM.length - 1] - S0), chewing = t > ta && t < tsp + 0.9;
      const recoil = t > tsp + 0.9 && t < tl ? Math.sin(P(t, tsp + 0.9, tl - tsp - 0.9, "lin") * Math.PI) : 0;
      const base = mix(D.moss[1], D.amber[1], 0.5), sh = mix(base, D.n2, 0.35), hi = mix(base, D.cream, 0.35);
      for (let s = 7; s >= 1; s--) {
        const wave = go > 0 && go < 1 ? Math.abs(Math.sin(t * 8 - s * 0.9)) * 2 : 0;
        const [x, y] = at(sHead - s * 5);
        PX.circle(g, x, y - wave, 4, sh); PX.circle(g, x, y - 1 - wave, 3, base); R(g, x - 1, y - 4 - wave, 2, 1, hi); R(g, x, y + 3 - wave, 1, 1, D.n1);
        if (s % 2) R(g, x - 1, y - 2 - wave, 1, 1, sh);
      }
      { const [x, y] = at(sHead), bob = chewing ? Math.round(Math.sin(t * 12)) : 0, lift = Math.round(recoil * 4);
        PX.circle(g, x + 1, y - lift + bob, 4, mix(D.amber[2], D.n2, 0.15)); R(g, x + 3, y - 2 - lift + bob, 1, 1, D.n0); R(g, x + 2, y + 2 - lift + bob, 2, 1, D.n1); R(g, x - 1, y - 3 - lift + bob, 2, 1, mix(D.amber[1], D.cream, 0.3)); }
      // insecticide particles rising: root microbes -> stem -> leaves
      for (const [u, v, w] of SPR) {
        const st = tsp + u * 1.4; if (t < st) continue;
        const k = P(t, st, 1.3, "io"), rt = LAT[Math.floor(v * LAT.length)], p = rt.pts[Math.max(0, Math.floor(rt.pts.length * (0.3 + 0.7 * w)) - 1)];
        let x, y;
        if (k < 0.4) { const q = k / 0.4; x = lerp(p[0], SX + 1, q); y = lerp(p[1], GY, q); } else if (k < 0.8) { const q = (k - 0.4) / 0.4; x = SX + Math.sin(q * 9 + u * 6); y = lerp(GY, w < 0.5 ? 124 : 98, q); } else { const q = (k - 0.8) / 0.2; x = SX + (w < 0.5 ? -1 : 1) * q * (w < 0.5 ? 46 : 62); y = (w < 0.5 ? 124 : 98) - q * (w < 0.5 ? 16 : 22) + (v - 0.5) * 8 * q; }
        A(g, 1 - P(t, st + 1.3, 0.5), () => { R(g, x, y, 2, 2, D.amber[1]); R(g, x, y, 1, 1, D.amber[0]); });
      }
      PX.particles(g, 31, 14, t, [0, 0, 640, GY - 20], { vy: -1, vx: 2, col: D.lamp, a: 0.3 });
      PX.vignette(g, 0.5);
    };
  };
  // ======================= grow_prog =======================
  // petri dish on a windowsill at dawn; a seedling sprouts whose top leaf is a tiny program window (o.grow 0.5..3.5)
  K.grow_prog = (o) => {
    const r = PX.rnd(44), DUST = [...Array(30)].map(() => [r(), r(), r()]);
    return (g, t, d, c) => {
      const gr = Array.isArray(o.grow) ? o.grow : null, g0 = gr ? gr[0] : tm(o, "grow", 0.5, d, 4.0), g1 = gr ? gr[1] : o.growEnd !== undefined ? o.growEnd : (3.5 * d) / 4.0, gp = clamp((t - g0) / Math.max(0.1, g1 - g0), 0, 1);
      const SILL = 286;
      // far: dawn sky + hills through the window (par 0.35)
      PX.par(g, c, 0.35, () => {
        PX.vgrad(g, -40, -40, 720, 320, mix(D.steel[2], D.n1, 0.25), mix(D.lamp, D.rose[1], 0.35), 28);
        PX.glow(g, 430, 222, 130, rgba(D.lamp, 0.32));
        PX.circle(g, 430, 222, 12, mix(D.lamp, D.cream, 0.4));
        for (let x = -40; x < 680; x += 2) { const h = 34 + Math.sin(x * 0.01 + 1) * 14 + Math.sin(x * 0.037) * 5; R(g, x, 262 - h + 30, 2, h, mix(D.steel[2], D.rose[2], 0.35)); }
      });
      PX.par(g, c, 0.6, () => { for (let x = -40; x < 680; x += 2) { const h = 18 + Math.sin(x * 0.02 + 4) * 8 + ((x * 13) % 7); R(g, x, 276 - h, 2, h + 20, mix(D.n2, D.moss[2], 0.3)); } for (let i = 0; i < 9; i++) { const x = 30 + i * 74 + (i * 37) % 20; ell(g, x, 250, 9, 14, mix(D.n2, D.moss[2], 0.25)); R(g, x, 260, 2, 8, D.n2); } });
      // window frame + mullions (wall)
      const FR = mix(D.n3, D.amber[2], 0.25), FRL = mix(D.n4, D.lampD, 0.35);
      R(g, -10, -10, 70, 310, FR); R(g, 580, -10, 70, 310, FR); R(g, -10, -10, 660, 30, FR);
      R(g, 60, 20, 8, 266, mix(D.n4, D.amber[2], 0.25)); R(g, 572, 20, 8, 266, mix(D.n4, D.amber[2], 0.25)); R(g, 316, 20, 8, 266, mix(D.n4, D.amber[2], 0.25)); R(g, 68, 140, 504, 6, mix(D.n4, D.amber[2], 0.25));
      R(g, 316, 20, 1, 266, FRL); R(g, 68, 140, 504, 1, FRL); R(g, 572, 20, 1, 266, FRL);
      // glass condensation dots near the bottom of panes
      for (let i = 0; i < 60; i++) { const rr = PX.rnd((i + 300) * 2654435761), x = 70 + rr() * 500, y = 226 + rr() * 58; if (Math.abs(x - 320) < 6) continue; A(g, 0.25, () => R(g, x, y, 1, 1, D.cream)); }
      // sunbeam
      A(g, 0.06, () => poly(g, [[330, 140], [470, 140], [420, 360], [180, 360]], D.lamp));
      // sill
      R(g, -10, SILL, 660, 8, mix(D.amber[2], D.n3, 0.25)); R(g, -10, SILL, 660, 1, mix(D.lampD, D.amber[1], 0.4)); R(g, -10, SILL + 8, 660, 4, mix(D.amber[2], D.n1, 0.55));
      PX.vgrad(g, -10, SILL + 12, 660, 100, mix(D.n3, D.amber[2], 0.2), D.n1, 6);
      PX.glow(g, 330, SILL, 150, rgba(D.lamp, 0.12));
      // a small pot plant on the left (calm prop) + the dish lid leaning
      R(g, 100, SILL - 22, 26, 22, mix(D.rust[1], D.amber[2], 0.4)); R(g, 98, SILL - 25, 30, 4, mix(D.rust[0], D.amber[2], 0.4));
      for (let i = 0; i < 5; i++) ell(g, 104 + i * 5, SILL - 34 - (i % 2) * 6, 4, 7, i % 2 ? D.moss[2] : mix(D.moss[2], D.moss[1], 0.5));
      ell(g, 476, SILL - 2, 34, 4, mix(D.glass, D.n3, 0.6)); R(g, 444, SILL - 3, 64, 1, mix(D.glass, D.cream, 0.3));
      // petri dish (glass, agar)
      const DX = 320, DY = SILL - 8;
      ell(g, DX, DY + 2, 58, 9, "rgba(0,0,0,0.3)");
      ell(g, DX, DY, 50, 8, mix(D.glass, D.n3, 0.5)); ell(g, DX, DY - 1, 46, 6, mix(D.paperD, D.amber[2], 0.35)); ell(g, DX, DY - 2, 44, 4, mix(D.paperD, D.lampD, 0.3));
      R(g, DX - 50, DY - 1, 100, 1, mix(D.glass, D.n4, 0.2)); R(g, DX - 36, DY - 4, 18, 1, mix(D.cream, D.glass, 0.4)); R(g, DX + 30, DY + 4, 12, 1, mix(D.glass, D.cream, 0.2));
      // seedling
      const sh = Math.round(E(clamp(gp / 0.6, 0, 1), "out") * 52), base = DY - 4;
      for (let i = 0; i < sh; i++) { const x = DX + Math.round(Math.sin(i * 0.12 + t * 0.8) * (i / 52) * 2); R(g, x - 1, base - i, 3, 1, D.moss[2]); R(g, x - 1, base - i, 1, 1, D.moss[1]); }
      const tipx = DX + Math.round(Math.sin(sh * 0.12 + t * 0.8) * (sh / 52) * 2), tipy = base - sh;
      // cotyledons
      const ck = E(clamp((gp - 0.25) / 0.35, 0, 1), "out");
      if (ck > 0) { const cy = base - 22, l = Math.round(14 * ck);
        for (const dir of [-1, 1]) for (let i = 0; i < l; i++) { const w = Math.round(Math.sin((i / Math.max(1, l)) * Math.PI) * 4 * ck), x = DX + dir * (i + 1), y = cy - Math.round(i * 0.35);
          for (let j = -w; j <= w; j++) R(g, x, y + j, 1, 1, j < 0 ? D.moss[1] : D.moss[2]); R(g, x, y - w, 1, 1, D.moss[0]); } }
      // the code leaf at the tip: a pointed leaf whose veins are lines of code, with a blinking cursor
      const lk = E(clamp((gp - 0.5) / 0.5, 0, 1), "out");
      if (lk > 0) {
        const L = Math.max(4, Math.round(64 * lk)), Wd = Math.max(2, Math.round(30 * lk)), sw = Math.round(Math.sin(t * 0.8) * 1);
        const lx0 = tipx + sw, ly0 = tipy - 1;                       // leaf grows upward-right from the tip
        const pt = (u, v) => [lx0 + u * L * 0.3 + v * 0.75, ly0 - u * L * 0.95 + v * 0.15];
        const rows = {};
        for (let i = 0; i <= L; i++) { const u = i / L, w = Math.round(Math.sin(u * Math.PI) ** 0.75 * Wd);
          for (let j = -w; j <= w; j++) { const [x, y] = pt(u, j), X = Math.round(x), Y = Math.round(y); R(g, X, Y, 2, 1, j < -w + 2 ? D.moss[0] : j > w - 2 ? D.moss[2] : D.moss[1]);
            const rw = rows[Y] || (rows[Y] = [X, X + 1]); rw[0] = Math.min(rw[0], X); rw[1] = Math.max(rw[1], X + 1); } }
        for (let i = 2; i < L - 2; i++) { const [x, y] = pt(i / L, 0); R(g, x, y, 1, 1, mix(D.moss[2], D.moss[1], 0.3)); }   // midrib
        if (lk > 0.55) {
          const q = (lk - 0.55) / 0.45, ys = Object.keys(rows).map(Number).sort((a, b) => a - b), y0 = ys[0], y1 = ys[ys.length - 1];
          const CODE = [[0, 0.7, 0], [1, 0.8, 1], [2, 0.6, 1], [2, 0.9, 2], [1, 0.5, 1], [0, 0.4, 0]];
          A(g, q, () => {
            let k = 0;
            for (let y = y0 + 10; y < y1 - 8 && k < CODE.length; y += 5, k++) {
              const rw = rows[y]; if (!rw) continue; const [ind, len, col] = CODE[k], a = rw[0] + 3 + ind * 3, b = rw[1] - 3, n = Math.max(2, Math.round((b - a) * len));
              if (b - a < 4) continue;
              R(g, a, y, n, 1, [mix(D.moss[0], D.cream, 0.7), D.amber[0], mix(D.moss[0], D.cream, 0.4)][col]); R(g, a, y + 1, n, 1, D.moss[2]);
              if (k === CODE.length - 1 || y + 5 >= y1 - 6) { if (PX.blink(t, 0.9)) R(g, a + n + 2, y - 1, 1, 3, D.cream); }
            }
          });
        }
        PX.glow(g, ...pt(0.5, 0), 36, rgba(D.moss[0], 0.08 * lk));
        R(g, tipx - 1, tipy - 3, 3, 4, D.moss[2]);
      }
      // dust in the sunbeam
      for (const [u, v, w] of DUST) { const x = 200 + u * 260 + Math.sin(t * 0.5 + w * 6) * 6, y = 150 + ((v * 200 - t * (2 + w * 3)) % 200 + 200) % 200; A(g, 0.3 + 0.3 * Math.sin(t * 2 + w * 9), () => R(g, x, y, 1, 1, D.lamp)); }
      PX.vignette(g, 0.48);
    };
  };
})();
