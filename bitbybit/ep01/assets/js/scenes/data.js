/* Builder B — Part 1 "numbers" scene kinds:
   students, counter, payroll, lines, office, ladder, training, grad_books, prod2am, worldmap, warnsign, laptop_close */
(function () {
  const { K, C } = PX;
  const R = Math.round, F = Math.floor;
  const GR = ["#3a4654", "#5a6b78", "#8b9bab"]; // dark / base / light greys
  const fmt = (v) => Math.round(v).toLocaleString("en-US");
  const hash = (i) => ((Math.imul(i + 1, 2654435761) >>> 0) % 1000) / 1000;

  // ---------- shared helpers (data*) ----------
  const dataPopS = (t, at, dur) => PX.q(PX.ease((t - at) / (dur || 0.3), "back"), 10);
  // draw fn scaled by a pop (0 -> overshoot -> 1) about (cx, cy)
  const dataPop = (g, t, at, cx, cy, fn, dur) => {
    if (t < at) return; const s = dataPopS(t, at, dur); if (s <= 0) return;
    if (s === 1) fn(); else PX.zoom(g, s, cx, cy, fn);
  };
  // CRT "switch on": reveal fn inside a clip box that opens vertically from its centre line (stepped)
  const dataOpen = (g, t, at, x, y, w, h, fn, dur) => {
    if (t < at) return; const p = PX.q(PX.p(t, at, dur || 0.3, "out"), 6); if (p >= 1) return fn();
    const hh = Math.max(2, R(h * p)), yy = R(y + (h - hh) / 2);
    g.save(); g.beginPath(); g.rect(x, yy, w, hh); g.clip(); fn(); g.restore();
    PX.rect(g, x, yy, w, 1, C.white); PX.rect(g, x, yy + hh - 1, w, 1, C.white);
  };
  // text with a dark backing plate (and optional border colour)
  const dataLabel = (g, s, x, y, o) => {
    o = o || {}; const w = PX.tw(g, s, o), v = o.font === "v", h = v ? R((o.size || 16) * 0.72) : (o.size || 8);
    const ax = o.align === "center" ? x - w / 2 : o.align === "right" ? x - w : x, pd = o.pad || 4;
    PX.rect(g, ax - pd, y - pd + (v ? 2 : 0), w + pd * 2, h + pd * 2, o.bg || "rgba(5,6,10,.88)");
    if (o.border) PX.box(g, ax - pd, y - pd + (v ? 2 : 0), w + pd * 2, h + pd * 2, o.border);
    PX.text(g, s, x, y, o);
  };
  // rounded rect (radius ~4) filled, optional 2px border colour
  const RC = [4, 2, 1, 1];
  const dataRound = (g, x, y, w, h, fill, border) => {
    const shape = (x, y, w, h, col) => { for (let i = 0; i < h; i++) { const k = i < 4 ? RC[i] : h - 1 - i < 4 ? RC[h - 1 - i] : 0; PX.rect(g, x + k, y + i, w - 2 * k, 1, col); } };
    if (border) { shape(x, y, w, h, border); shape(x + 2, y + 2, w - 4, h - 4, fill); } else shape(x, y, w, h, fill);
  };
  const dataDash = (g, x, y, w, h, col) => {
    for (let i = 0; i < w; i += 3) { PX.rect(g, x + i, y, 1, 1, col); PX.rect(g, x + i, y + h - 1, 1, 1, col); }
    for (let i = 0; i < h; i += 3) { PX.rect(g, x, y + i, 1, 1, col); PX.rect(g, x + w - 1, y + i, 1, 1, col); }
  };
  const mix = (a, b, p) => {
    p = PX.clamp(p, 0, 1); const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
    const c = (s) => R(((A >> s) & 255) + ((((B >> s) & 255) - ((A >> s) & 255)) * p));
    return `rgb(${c(16)},${c(8)},${c(0)})`;
  };
  const TICK = ["......gg", ".....ggg", "gg..ggg.", "ggggggg.", ".ggggg..", "..ggg..."];
  const CROSS = ["rr...rr", "rrr.rrr", ".rrrrr.", "..rrr..", ".rrrrr.", "rrr.rrr", "rr...rr"];
  // tick / cross in a bordered box of size 9*sc+6
  const dataMark = (g, x, y, sc, ok) => {
    const s = 9 * sc + 6, col = ok ? C.green : C.red;
    PX.rect(g, x, y, s, s, "#0b1622"); PX.box(g, x, y, s, s, col); PX.box(g, x + 1, y + 1, s - 2, s - 2, col);
    if (ok) PX.sprite(g, TICK, x + 3 + R(sc / 2), y + 3 + R(1.5 * sc), { g: C.green }, sc);
    else PX.sprite(g, CROSS, x + 3 + sc, y + 3 + sc, { r: C.red }, sc);
  };
  // person 7x13 with filled eyes and extras: glasses, stache, bald, back (seen from behind), pack, sad, wide, up (arms raised)
  const UP = ["s.hhh.s", "shhhhhs", "csssssc", "cs.s.sc", "csssssc", "c.sss.c", "ccccccc", "..ccc..", "..ccc..", "..ccc..", "..p.p..", "..p.p..", ".bb.bb."];
  const dataMan = (g, x, y, o) => {
    o = o || {}; const sc = o.sc || 1, skin = o.skin || C.skin[1], hair = o.hair || "#2b1d14";
    x = R(x); y = R(y);
    const P = (cx, cy, w, h, col) => PX.rect(g, x + cx * sc, y + cy * sc, w * sc, h * sc, col);
    if (o.up) PX.sprite(g, UP, x, y, { h: hair, s: skin, c: o.col || C.cyan, p: o.pants || "#2d3b55", b: "#111" }, sc);
    else PX.person(g, x, y, Object.assign({}, o, { cap: false }));
    if (o.back) { P(1, 2, 5, 2, hair); P(2, 4, 3, 1, hair); if (o.pack) P(2, 6, 3, 3, o.pack); }
    else {
      const ey = o.sad ? 4 : 3, E = o.eye || "#101418";
      if (o.sad) { P(2, 3, 1, 1, skin); P(4, 3, 1, 1, skin); }
      if (o.wide && sc >= 3) { P(2, 3, 1, 1, "#fff"); P(4, 3, 1, 1, "#fff"); PX.rect(g, x + 2 * sc + 1, y + 3 * sc + 1, 1, 1, E); PX.rect(g, x + 4 * sc + 1, y + 3 * sc + 1, 1, 1, E); }
      else if (sc >= 3) { P(2, 3, 1, 1, skin); P(4, 3, 1, 1, skin); const py = y + ey * sc + (o.sad ? 1 : sc - 2); PX.rect(g, x + 2 * sc, py, 2, 2, E); PX.rect(g, x + 4 * sc + sc - 2, py, 2, 2, E); }
      else { P(2, ey, 1, 1, E); P(4, ey, 1, 1, E); }
      if (o.bald) P(2, 0, 3, 2, skin);
      if (o.sides) { P(1, 2, 1, 2, hair); P(5, 2, 1, 2, hair); }
      if (o.stache) P(2, 4, 3, 1, o.stacheCol || "#e3e8ec");
      if (o.glasses && sc >= 2) { const gc = o.glasses === true ? (sc >= 3 ? "#262b33" : "#c9d3dc") : o.glasses; PX.box(g, x + 2 * sc - 1, y + 3 * sc - 1, sc + 2, sc + 2, gc); PX.box(g, x + 4 * sc - 1, y + 3 * sc - 1, sc + 2, sc + 2, gc); }
    }
    if (o.cap) {
      const tilt = o.capTilt ? sc : 0;
      PX.rect(g, x - sc, y - sc + tilt, 9 * sc, sc, "#4a5466"); PX.rect(g, x - sc, y - sc, 4 * sc, sc, "#4a5466");
      PX.rect(g, x - sc, y - sc + tilt, 9 * sc, 1, "#7a8698");
      PX.rect(g, x + 2 * sc, y - 2 * sc, 3 * sc, sc, "#2e3442"); PX.rect(g, x + 7 * sc, y + tilt, sc, 3 * sc, C.yellow);
    }
  };
  // stack of 4 books (40x30 units * sc)
  const BOOKS = [[0, 40, C.red, C.yellow], [3, 34, C.blue, "#cfe3f0"], [1, 38, C.green, C.yellow], [5, 30, C.purple, C.pink]];
  const dataBooks = (g, x, y, sc, sy) => {
    sc = sc || 1; const sx = sc; sy = sy || sc;
    BOOKS.forEach(([dx, w, col, band], i) => {
      const sc = sy, by = y + (30 - (i + 1) * 7) * sy, bx = x + dx * sx; w = w * sx / sy;
      PX.rect(g, bx, by, w * sc, 7 * sc, col);
      PX.rect(g, bx, by, w * sc, sc, "rgba(255,255,255,.35)");
      PX.rect(g, bx, by + 6 * sc, w * sc, sc, "rgba(0,0,0,.35)");
      PX.rect(g, bx + (w - 5) * sc, by + sc, 5 * sc, 5 * sc, "#efe6cf");
      PX.rect(g, bx + (w - 5) * sc, by + 3 * sc, 5 * sc, Math.max(1, F(sc / 2)), "#c9bfa5");
      PX.rect(g, bx + 5 * sc, by + 2 * sc, 3 * sc, 3 * sc, band);
      PX.rect(g, bx + 10 * sc, by + 3 * sc, 14 * sc, sc, "rgba(255,255,255,.4)");
    });
  };
  // three stacked doc pages (36x34 units * sc)
  const dataDocs = (g, x, y, sc) => {
    sc = sc || 1;
    for (let k = 2; k >= 0; k--) {
      const px = x + k * 4 * sc, py = y + (2 - k) * 2 * sc, U = (ox, oy, w, h, c) => PX.rect(g, px + ox * sc, py + oy * sc, w * sc, h * sc, c);
      U(0, 0, 26, 26, k ? (k === 1 ? "#8b9bab" : "#6b7b8b") : "#c9d4de");
      U(0, 0, 26, 1, k ? "#a8b6c4" : "#e8f1f2");
      if (!k) {
        for (let j = 0; j < 6; j++) { U(20 + j, j, 6 - j, 1, "#05060a"); U(20, j, j + 1, 1, "#8b9bab"); }
        U(3, 3, 12, 2, C.blue);
        for (let l = 0; l < 5; l++) U(3, 8 + l * 3.5, l % 3 === 2 ? 12 : 19, 1, l === 3 ? C.teal : "#5a6b78");
      }
    }
  };
  // speech bubble w x h with tail and two short lines (or a glyph)
  const dataBubble = (g, x, y, w, h, col, glyph) => {
    dataRound(g, x, y, w, h, "#dfe7ee", col);
    PX.rect(g, x + 5, y + h - 1, 5, 2, col); PX.rect(g, x + 6, y + h, 3, 2, "#dfe7ee"); PX.rect(g, x + 5, y + h + 1, 2, 2, col); PX.rect(g, x + 4, y + h + 3, 2, 1, col);
    if (glyph) PX.text(g, glyph, x + w / 2, y + R(h / 2) - 4, { col, align: "center" });
    else { PX.rect(g, x + 5, y + 5, w - 12, 2, "#5a6b78"); PX.rect(g, x + 5, y + 9, w - 18, 2, col); }
  };
  // LLM chip centred at (cx, cy); s = body size; glow 0..1
  const dataChip = (g, cx, cy, s, glow, t, label) => {
    const x = R(cx - s / 2), y = R(cy - s / 2), pin = R(s * 0.09), np = 7;
    if (glow > 0) { PX.alpha(g, glow * 0.12, () => PX.rect(g, x - pin - 4, y - pin - 4, s + 2 * pin + 8, s + 2 * pin + 8, C.cyan)); for (let i = 1; i <= 4; i++) PX.alpha(g, glow * (0.75 - i * 0.16), () => { const e = pin + 4 + i * 6; PX.box(g, x - e, y - e, s + 2 * e, s + 2 * e, C.cyan); PX.box(g, x - e + 1, y - e + 1, s + 2 * e - 2, s + 2 * e - 2, C.cyan); }); }
    // pins
    for (let i = 0; i < np; i++) {
      const o = R(s * 0.12 + i * (s * 0.76) / (np - 1)) - 2;
      const lit = glow > 0.05 && hash(i * 7 + F(t * 6)) < 0.25 + glow * 0.3;
      const pc = lit ? C.yellow : GR[2];
      PX.rect(g, x + o, y - pin, 5, pin, pc); PX.rect(g, x + o, y + s, 5, pin, pc);
      PX.rect(g, x - pin, y + o, pin, 5, pc); PX.rect(g, x + s, y + o, pin, 5, pc);
      PX.rect(g, x + o + 4, y - pin, 1, pin, GR[0]); PX.rect(g, x + o + 4, y + s, 1, pin, GR[0]);
      PX.rect(g, x - pin, y + o + 4, pin, 1, GR[0]); PX.rect(g, x + s, y + o + 4, pin, 1, GR[0]);
    }
    // body with bevel
    PX.rect(g, x, y, s, s, "#1e2834"); PX.rect(g, x, y, s, 3, "#4a5868"); PX.rect(g, x, y, 3, s, "#3a4654");
    PX.rect(g, x, y + s - 3, s, 3, "#10161e"); PX.rect(g, x + s - 3, y, 3, s, "#141b24");
    PX.circle(g, x + 10, y + 10, 3, "#3a4654");
    // die
    const dm = R(s * 0.22), dx = x + dm, dw = s - 2 * dm;
    PX.rect(g, dx - 2, dx - x + y - 2, dw + 4, dw + 4, "#0b1018");
    PX.rect(g, dx, y + dm, dw, dw, mix("#12303a", "#238c99", glow));
    for (let i = 1; i < 4; i++) { PX.rect(g, dx + R(dw * i / 4), y + dm, 1, dw, mix("#1a4250", "#5fe3e8", glow * 0.8)); PX.rect(g, dx, y + dm + R(dw * i / 4), dw, 1, mix("#1a4250", "#5fe3e8", glow * 0.8)); }
    if (label !== false) {
      const L = label || "LLM", sz = s >= 110 ? 24 : 16, w = PX.tw(g, L, { size: sz });
      PX.rect(g, cx - w / 2 - 4, cy - sz / 2 - 4, w + 8, sz + 8, "#0b1018");
      PX.text(g, L, cx, cy - sz / 2, { size: sz, col: mix("#8b9bab", "#ffffff", glow), align: "center" });
    }
  };
  // little monitor (front), screen with scrolling code lines
  const dataCode = (g, x, y, w, h, t, seed, cols) => {
    cols = cols || [C.cyan, C.green, C.pink, C.yellow, "#8b9bab"];
    const P = t * 9 + seed * 37, lh = 4, nl = F((h - 2) / lh), maxc = F((w - 4) / 2);
    const line = F(P / maxc), part = P % maxc;
    for (let j = 0; j < nl; j++) {
      const idx = line - (nl - 1) + j; if (idx < 0) continue;
      const ind = F(hash(idx * 3 + seed) * 3) * 2;
      let len = j === nl - 1 ? F(part) : 3 + F(hash(idx + seed * 11) * (maxc - 4));
      len = Math.min(len, maxc - ind);
      PX.rect(g, x + 2 + ind * 2, y + 2 + j * lh, len * 2, 2, cols[F(hash(idx * 5 + seed) * cols.length)]);
      if (j === nl - 1 && PX.blink(t, 0.4)) PX.rect(g, x + 2 + (ind + len) * 2, y + 1 + j * lh, 2, 3, C.white);
    }
  };
  const dataArc = (g, cx, cy, r, a0, a1, col, sz) => { for (let a = a0; a <= a1; a += 1 / r) PX.rect(g, cx + Math.cos(a) * r, cy + Math.sin(a) * r, sz || 2, sz || 2, col); };

  // ============ students: grid of tiny students; ~8.4% flash red and drop out ============
  // o: cols 16, rows 8, drop 2.5, pct 8.4, label "CS MAJORS, 1 YEAR", seed 7
  K.students = (o) => {
    const cols = o.cols || 16, rows = o.rows || 8, n = cols * rows;
    const drop = o.drop ?? 2.5, pct = o.pct ?? 8.4, label = o.label ?? "CS MAJORS, 1 YEAR";
    const r = PX.rnd(o.seed || 7);
    const shirts = [C.cyan, C.pink, C.yellow, C.purple, C.orange, C.green, C.blue, C.teal, "#8b9bab"];
    const hairs = ["#2b1d14", "#14100c", "#6b4226", "#c9a227", "#8a3c1e", "#4a3020"];
    const S = [...Array(n)].map(() => ({ col: shirts[F(r() * shirts.length)], skin: C.skin[F(r() * 4)], hair: hairs[F(r() * hairs.length)], cap: r() < 0.12, ph: r() }));
    const k = R(n * pct / 100), ord = [...Array(n).keys()];
    for (let i = n - 1; i > 0; i--) { const j = F(r() * (i + 1)); [ord[i], ord[j]] = [ord[j], ord[i]]; }
    const out = new Map(ord.slice(0, k).map((id, j) => [id, j]));
    return (g, t) => {
      const pw = 27, ph = 25, x0 = R((480 - cols * pw) / 2 + (pw - 14) / 2), y0 = 66;
      const fall = [];
      for (let rr = 0; rr < rows; rr++) for (let c = 0; c < cols; c++) {
        const i = rr * cols + c, s = S[i], app = 0.05 + rr * 0.09 + c * 0.012;
        if (t < app) continue;
        const dy = -R(10 * (1 - PX.q(PX.p(t, app, 0.25, "out"), 5)));
        const bob = F(t * 1.6 + s.ph * 7) % 3 === 0 ? -1 : 0;
        const x = x0 + c * pw, y = y0 + rr * ph + dy + bob, oj = out.get(i);
        if (oj !== undefined && t >= drop + oj * 0.05) {
          const tt = t - drop - oj * 0.05;
          dataDash(g, x - 1, y0 + rr * ph - 1, 16, 28, "#b03030");
          if (tt >= 0.7) PX.sprite(g, CROSS, x + 4, y0 + rr * ph + 10, { r: "#b03030" }, 1);
          if (tt < 0.7) dataMan(g, x, y0 + rr * ph, { sc: 2, col: PX.blink(tt, 0.14) ? C.red : s.col, skin: s.skin, hair: s.hair, cap: s.cap, sad: true });
          else { const u = tt - 0.7, fy = y0 + rr * ph - 90 * u + 520 * u * u; if (fy < 280) fall.push([x, fy, s]); }
          continue;
        }
        dataMan(g, x, y, { sc: 2, col: s.col, skin: s.skin, hair: s.hair, cap: s.cap });
      }
      fall.forEach(([x, y, s]) => dataMan(g, x, y, { sc: 2, col: C.red, skin: s.skin, hair: s.hair, cap: s.cap, sad: true }));
      // counter + label
      if (t > 0.3) PX.text(g, label, 240, 48, { align: "center", col: C.yellow });
      const ca = drop + 0.5;
      dataPop(g, t, ca, 240, 24, () => {
        const v = pct * PX.q(PX.p(t, ca, 0.7, "out"), 14);
        const s = "-" + v.toFixed(1) + "%", w = PX.tw(g, "-" + pct.toFixed(1) + "%", { size: 32 });
        PX.text(g, s, 240 - w / 2 + 2, 10, { size: 32, col: "#7a1414" });
        PX.text(g, s, 240 - w / 2, 8, { size: 32, col: C.red });
        // down arrow
        const ax = R(240 - w / 2 - 26);
        PX.rect(g, ax + 5, 10, 6, 14, C.red); for (let j = 0; j < 8; j++) PX.rect(g, ax + j, 24 + j, 16 - 2 * j, 1, C.red);
      }, 0.3);
    };
  };

  // ============ counter: big number in a rounded cyan panel + students walking away ============
  // o: v 53000, prefix "", suffix "", label ["FEWER STUDENTS"], at 0.3, cd 1.4, walkers true
  K.counter = (o) => {
    const v = o.v ?? 53000, at = o.at ?? 0.3, cd = o.cd ?? 1.4, pre = o.prefix || "", suf = o.suffix || "";
    const label = o.label === undefined ? ["FEWER STUDENTS"] : [].concat(o.label), walkers = o.walkers !== false, arrow = o.arrow ?? "down";
    const r = PX.rnd(11), shirts = [C.pink, C.yellow, C.purple, C.orange, C.green, C.blue];
    const W = [...Array(8)].map((_, i) => ({ st: at + 0.1 + i * 0.6, col: shirts[i % 6], hair: ["#2b1d14", "#6b4226", "#14100c", "#c9a227"][F(r() * 4)], pack: [C.red, C.teal, C.orange, C.blue][F(r() * 4)], dy: F(r() * 3) * 6 }));
    return (g, t) => {
      const full = pre + fmt(v) + suf; let sz = 48;
      while (sz > 16 && PX.tw(g, full, { size: sz }) > 400) sz -= 8;
      const tw = PX.tw(g, full, { size: sz }), pw = R(tw + 64), ph = sz + 56;
      const cx = 240, px = R(cx - pw / 2), py = walkers ? 34 : 60;
      dataOpen(g, t, at - 0.3, px - 6, py - 6, pw + 12, ph + 14, () => {
        dataRound(g, px + 4, py + 5, pw, ph, "#0a2a30");
        dataRound(g, px, py, pw, ph, C.panel, C.cyan);
        PX.rect(g, px + 6, py + 5, pw - 12, 1, "rgba(95,227,232,.35)");
        const p = PX.q(PX.p(t, at, cd, "out"), 40), s = pre + fmt(v * p) + suf;
        const done = t > at + cd, flash = done && t < at + cd + 0.6 && PX.blink(t - at - cd, 0.2);
        PX.text(g, s, px + pw - 32, py + 28, { size: sz, col: flash ? C.yellow : C.white, align: "right" });
        if (flash) PX.box(g, px - 4, py - 4, pw + 8, ph + 8, C.white);
      });
      label.forEach((l, i) => {
        const la = at + 0.4 + i * 0.4;
        if (t < la) return;
        const y = py + ph + 20 + i * 24, s = i ? 8 : 16, str = PX.typed(l, t, la, 24);
        PX.text(g, str, cx, y, { size: s, col: i ? C.ink : C.yellow, align: "center" });
        if (!i && arrow && str.length === l.length) {
          const ax = R(cx - PX.tw(g, l, { size: 16 }) / 2 - 26), b = PX.blink(t, 0.6) ? 2 : 0, up = arrow === "up", ac = up ? C.green : C.red;
          if (up) { PX.rect(g, ax + 4, y + 5 - b, 6, 10, ac); for (let j = 0; j < 7; j++) PX.rect(g, ax + 6 - j, y - 2 - b + j, 2 + 2 * j, 1, ac); }
          else { PX.rect(g, ax + 4, y - 2 + b, 6, 10, ac); for (let j = 0; j < 7; j++) PX.rect(g, ax + j, y + 8 + b + j, 14 - 2 * j, 1, ac); }
        }
      });
      if (!walkers) return;
      // students walking away (seen from behind) along the floor, off to the right
      PX.rect(g, 0, 254, 480, 1, "#14283a"); for (let x = 0; x < 480; x += 16) PX.rect(g, x, 256, 8, 1, "#0f1e2c");
      W.forEach((w) => {
        if (t < w.st) return;
        const u = t - w.st, x = -24 + u * 70;
        if (x > 486) return;
        dataMan(g, x, 254 - 39 - (F(t * 5) % 2), { sc: 3, back: true, col: w.col, hair: w.hair, pack: w.pack, frame: F(t * 5) % 2 });
      });
    };
  };

  // ============ payroll: conveyor of pay stubs / ID cards into a scanner ============
  // o: name "STANFORD", label "MILLIONS OF PAYROLL RECORDS", rate 873421 (records/s), speed 70
  const dataCard = (g, x, y, kind, seed) => {
    x = R(x); y = R(y);
    PX.rect(g, x + 2, y + 2, 44, 30, "rgba(0,0,0,.5)");
    if (kind === 0) {
      PX.rect(g, x, y, 44, 30, "#dfe7ee"); PX.rect(g, x, y, 44, 6, "#2fa85a"); PX.rect(g, x, y, 44, 1, "#7ee09a");
      for (let i = 0; i < 8; i++) PX.rect(g, x + 1, y + 8 + i * 3, 1, 1, "#8b9bab");
      PX.text(g, "$", x + 5, y + 10, { size: 16, col: "#1d7a3c" });
      PX.rect(g, x + 24, y + 10, 16, 2, "#8b9bab"); PX.rect(g, x + 24, y + 15, 11, 2, "#8b9bab"); PX.rect(g, x + 24, y + 21, 16, 3, "#2fa85a");
      PX.rect(g, x, y + 29, 44, 1, "#8b9bab");
    } else {
      PX.rect(g, x, y, 44, 30, "#bcd6ea"); PX.rect(g, x, y, 44, 6, C.blue); PX.rect(g, x, y, 44, 1, "#8fb3ff");
      PX.rect(g, x + 4, y + 9, 13, 17, "#eef4f8"); PX.circle(g, x + 10, y + 15, 3, C.skin[F(seed * 4)]);
      PX.rect(g, x + 7, y + 12, 7, 2, "#2b1d14"); PX.rect(g, x + 6, y + 20, 9, 6, [C.pink, C.orange, C.purple][F(seed * 3)]);
      PX.rect(g, x + 21, y + 10, 18, 2, "#5a6b78"); PX.rect(g, x + 21, y + 15, 12, 2, "#8b9bab");
      for (let i = 0; i < 9; i++) PX.rect(g, x + 21 + i * 2, y + 21, hash(i + seed * 50) < 0.5 ? 1 : 2, 6, "#3a4654");
      PX.rect(g, x, y + 29, 44, 1, "#7d99b0");
    }
  };
  K.payroll = (o) => {
    const name = o.name ?? "STANFORD", label = o.label ?? "MILLIONS OF PAYROLL RECORDS", rate = o.rate ?? 873421, sp = o.speed ?? 70;
    return (g, t) => {
      const BT = 182, MX = 300; // belt top, machine mouth x
      // floor
      PX.rect(g, 0, 250, 480, 1, "#2a3542"); for (let x = 0; x < 480; x += 24) PX.rect(g, x, 252, 12, 1, "#14202c");
      // belt legs
      [30, 150, 260].forEach((lx) => { PX.rect(g, lx, BT + 14, 6, 236 - BT, GR[0]); PX.rect(g, lx, BT + 14, 2, 236 - BT, GR[1]); PX.rect(g, lx - 4, 248, 14, 3, GR[1]); });
      // belt body
      PX.rect(g, -4, BT, MX + 10, 14, GR[1]); PX.rect(g, -4, BT, MX + 10, 2, GR[2]); PX.rect(g, -4, BT + 12, MX + 10, 2, "#2a3542");
      const off = F((t * sp) % 12);
      for (let x = -12 + off; x < MX; x += 12) PX.rect(g, x, BT + 3, 5, 8, GR[0]);
      for (let x = 10; x < MX; x += 40) { PX.circle(g, x, BT + 7, 4, "#2a3542"); PX.circle(g, x, BT + 7, 2, GR[2]); const a = t * 6 + x; PX.rect(g, x + R(Math.cos(a) * 2), BT + 7 + R(Math.sin(a) * 2), 1, 1, "#111"); }
      // cards
      const SP = 64, pos = t * sp;
      for (let k = F((pos - MX - 60) / SP); k <= F((pos + 60) / SP); k++) {
        const x = -50 + pos - k * SP;
        if (x < -50 || x > MX + 4) continue;
        dataCard(g, x, BT - 31, hash(k + 500) < 0.55 ? 0 : 1, hash(k + 900));
      }
      // scanner machine
      const mx = 290, my = 74, mw = 160, mh = 176;
      PX.rect(g, mx + mw, my, 10, mh, "#2a3542"); // side
      PX.rect(g, mx + 8, my - 8, mw, 8, GR[2]); PX.rect(g, mx + mw, my - 8, 10, 8, GR[1]); // top
      for (let i = 0; i < 8; i++) PX.rect(g, mx + i, my - i - 1, 1, 1, GR[2]);
      PX.rect(g, mx, my, mw, mh, GR[1]); PX.rect(g, mx, my, mw, 2, GR[2]); PX.rect(g, mx, my, 2, mh, GR[2]); PX.rect(g, mx + mw - 2, my, 2, mh, GR[0]);
      // name plate
      const nw = PX.tw(g, name, { size: 16 }) + 16;
      PX.rect(g, mx + mw / 2 - nw / 2, my + 10, nw, 24, "#8c1515"); PX.rect(g, mx + mw / 2 - nw / 2, my + 10, nw, 2, "#c43a3a"); PX.rect(g, mx + mw / 2 - nw / 2, my + 32, nw, 2, "#5a0a0a");
      PX.text(g, name, mx + mw / 2, my + 14, { size: 16, col: C.white, align: "center" });
      // mouth
      PX.rect(g, mx, BT - 42, 34, 60, "#0b0f15"); PX.rect(g, mx, BT - 42, 34, 2, "#05070a"); PX.rect(g, mx + 32, BT - 42, 2, 60, GR[0]);
      for (let i = 0; i < 6; i++) PX.rect(g, mx + 4, BT - 40 + i * 9, 26, 3, "#141b24"); // flaps
      // scan beam (sweeps up/down in the mouth, light across the incoming card)
      const sy = BT - 38 + R(Math.abs(((t * 2.2) % 2) - 1) * 50);
      PX.rect(g, mx - 2, sy, 36, 2, C.red); PX.alpha(g, 0.25, () => PX.rect(g, mx - 30, sy - 2, 32, 6, C.red));
      PX.rect(g, mx - 3, BT - 46, 40, 4, GR[2]); PX.rect(g, mx - 3, BT + 18, 40, 4, GR[0]);
      // screen with scrolling rows + OK flash per card
      const sx = mx + 52, syy = my + 50, sw = 92, sh = 56;
      PX.rect(g, sx - 3, syy - 3, sw + 6, sh + 6, GR[0]); PX.rect(g, sx, syy, sw, sh, "#06140c");
      const rowsN = 6, sc = F(t * 14);
      for (let j = 0; j < rowsN; j++) {
        const id = sc + j, w = 20 + F(hash(id) * 60);
        PX.rect(g, sx + 4, syy + 4 + j * 8, 10, 4, "#1d7a3c"); PX.rect(g, sx + 18, syy + 4 + j * 8, Math.min(w, sw - 22), 4, j === rowsN - 1 ? C.green : "#2fa85a");
      }
      const ph = (pos + 50 - MX) / SP, ok = (ph - F(ph)) < 0.35 && ph > 0;
      PX.rect(g, sx + sw - 30, syy + sh + 8, 30, 12, ok ? C.green : "#103a1c"); PX.text(g, "OK", sx + sw - 15, syy + sh + 10, { col: ok ? "#06140c" : "#1d7a3c", align: "center" });
      PX.rect(g, sx, syy + sh + 10, 6, 6, PX.blink(t, 0.3) ? C.red : "#4a1010"); PX.rect(g, sx + 10, syy + sh + 10, 6, 6, PX.blink(t + 0.15, 0.3) ? C.yellow : "#4a3a10");
      // vents + feet
      for (let i = 0; i < 5; i++) PX.rect(g, mx + 50, my + 140 + i * 6, 100, 2, GR[0]);
      PX.rect(g, mx + 6, 248, 16, 3, GR[0]); PX.rect(g, mx + mw - 22, 248, 16, 3, GR[0]);
      // bits rising out of the top vent
      for (let i = 0; i < 4; i++) {
        const u = ((t * 0.9 + i * 0.25) % 1), bx = mx + 40 + i * 26 + R(Math.sin(i * 3 + u * 6) * 3), by = my - 12 - F(u * 40);
        PX.alpha(g, 1 - u, () => PX.text(g, hash(i + F(t * 0.9 + i * 0.25) * 4) < 0.5 ? "0" : "1", bx, by, { col: C.green }));
      }
      // record counter
      const cnt = F(Math.max(0, t - 0.2) * rate + Math.max(0, t - 0.2) * Math.max(0, t - 0.2) * rate * 0.6);
      PX.panel(g, 40, 16, 240, 44, C.cyan);
      PX.text(g, "RECORDS", 50, 20, { font: "v", size: 16, col: C.dim });
      PX.text(g, fmt(cnt), 270, 36, { size: 16, col: C.white, align: "right" });
      PX.text(g, label, 160, 72, { col: C.yellow, align: "center" });
    };
  };

  // ============ lines: wide line chart with progressive series + note markers ============
  // o: years [2018..2025], series [{label, col, pts, at, dd}], notes [{i, label, col, at, s}], title, min, max
  K.lines = (o) => {
    const years = o.years || [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025], n = years.length;
    const SER = o.series || [
      { label: "AGES 22-25", col: C.cyan, pts: [100, 104, 108, 116, 128, 118, 108, 102], at: 0.5, dd: 4 },
      { label: "OLDER WORKERS", col: C.yellow, pts: [100, 101, 102, 104, 105, 107, 109, 110], at: 9.0, dd: 3 },
    ];
    SER.forEach((s, i) => { s.col = s.col || [C.cyan, C.yellow, C.pink, C.green][i % 4]; s.at = s.at ?? 0.5 + i * 4; s.dd = s.dd ?? 3; });
    const NOTES = (o.notes || [
      { i: 4, label: "PEAK", col: C.white, at: 3.0, s: 0 },
      { i: 7, label: "-20%", col: C.red, at: 5.5, s: 0 },
      { i: 7, label: "+6-9%", col: C.green, at: 11.5, s: 1 },
    ]).map((nt) => {
      let s = nt.s; if (s === undefined) { s = 0; SER.forEach((se, j) => { if (se.at <= nt.at) s = j; }); }
      return Object.assign({}, nt, { s });
    });
    const all = SER.flatMap((s) => s.pts);
    const lo = o.min ?? F((Math.min(...all) - 3) / 10) * 10, hi = o.max ?? Math.ceil((Math.max(...all) + 4) / 10) * 10;
    const top = o.title ? 70 : 58, X0 = 72, X1 = 404, Y0 = top, Y1 = 208;
    const xi = (i) => R(X0 + (X1 - X0) * i / (n - 1)), yv = (v) => R(Y1 - (Y1 - Y0) * (v - lo) / (hi - lo));
    const at = (s, f) => { const j = Math.min(F(f), n - 2), u = f - j; return [lerpP(xi(j), xi(j + 1), u), lerpP(yv(s.pts[j]), yv(s.pts[j + 1]), u)]; };
    const lerpP = (a, b, u) => R(a + (b - a) * u);
    return (g, t) => {
      PX.panel(g, 14, 10, 452, 248, C.cyan);
      if (o.title) PX.text(g, o.title, 240, 20, { col: C.yellow, align: "center" });
      // grid + y labels
      for (let v = lo; v <= hi; v += 10) {
        const y = yv(v), c = v === 100 ? "#2f5670" : C.grid;
        for (let x = X0; x <= X1; x += v === 100 ? 3 : 4) PX.rect(g, x, y, 2, 1, c);
        if (v > lo) PX.text(g, String(v), X0 - 8, y - 6, { font: "v", size: 16, col: v === 100 ? C.ink : C.dim, align: "right" });
      }
      PX.rect(g, X0, Y0 - 6, 1, Y1 - Y0 + 7, C.dim); PX.rect(g, X0, Y1, X1 - X0 + 8, 1, C.dim);
      // x labels light up as the first line reaches them
      const reach = SER.reduce((m, s) => Math.max(m, t < s.at ? -1 : PX.q(PX.p(t, s.at, s.dd, "lin"), (n - 1) * 10) * (n - 1)), -1);
      years.forEach((yr, i) => { PX.rect(g, xi(i), Y1 + 1, 1, 3, C.dim); PX.text(g, String(yr), xi(i), Y1 + 6, { font: "v", size: 16, col: i <= reach + 0.01 ? C.ink : C.dim, align: "center" }); });
      // legend chips
      let lx = X0;
      SER.forEach((s) => {
        const w = PX.tw(g, s.label, { font: "v", size: 18 }) + 16;
        if (t >= s.at) dataPop(g, t, s.at, lx + w / 2, top - 30, () => { PX.rect(g, lx, top - 32, 8, 8, s.col); PX.rect(g, lx, top - 32, 8, 2, "rgba(255,255,255,.5)"); PX.text(g, s.label, lx + 12, top - 36, { font: "v", size: 18, col: s.col }); }, 0.25);
        lx += w + 14;
      });
      // series
      SER.forEach((s) => {
        if (t < s.at) return;
        const p = PX.q(PX.p(t, s.at, s.dd, "lin"), (n - 1) * 10), f = p * (n - 1);
        const [hx, hy] = at(s, f);
        // soft area under the line (column fills)
        PX.alpha(g, 0.11, () => { for (let x = X0; x <= hx; x++) { const ff = (x - X0) / (X1 - X0) * (n - 1); const [, yy] = at(s, Math.min(ff, f)); PX.rect(g, x, yy + 2, 1, Y1 - yy - 2, s.col); } });
        for (let j = 0; j < n - 1 && j < f; j++) {
          const [x1, y1] = [xi(j), yv(s.pts[j])], [x2, y2] = j + 1 <= f ? [xi(j + 1), yv(s.pts[j + 1])] : [hx, hy];
          PX.line(g, x1, y1, x2, y2, s.col); PX.line(g, x1, y1 + 1, x2, y2 + 1, s.col); PX.line(g, x1, y1 - 1, x2, y2 - 1, mix(s.col, "#ffffff", 0.0));
        }
        for (let j = 0; j <= f + 1e-6 && j < n; j++) { PX.rect(g, xi(j) - 2, yv(s.pts[j]) - 2, 5, 5, s.col); PX.rect(g, xi(j) - 1, yv(s.pts[j]) - 1, 3, 3, "#0b1622"); }
        if (p < 1) { PX.rect(g, hx - 3, hy - 3, 7, 7, C.white); PX.rect(g, hx - 2, hy - 2, 5, 5, s.col); }
        else {
          const u = ((t - s.at - s.dd) / 2.2) % 1, [px, py] = at(s, u * (n - 1));
          PX.rect(g, px - 2, py - 2, 5, 5, C.white);
          if (PX.blink(t, 0.6)) PX.box(g, xi(n - 1) - 4, yv(s.pts[n - 1]) - 4, 9, 9, C.white);
        }
      });
      // notes
      NOTES.forEach((nt) => {
        if (t < nt.at) return;
        const s = SER[nt.s] || SER[0], v = s.pts[nt.i], x = xi(nt.i), y = yv(v), col = nt.col || C.white;
        const above = SER.every((o2) => o2 === s || o2.pts[nt.i] <= v);
        PX.rect(g, x - 4, y - 4, 9, 9, col); PX.rect(g, x - 2, y - 2, 5, 5, s.col);
        const ly = above ? y - 34 : y + 14;
        for (let yy = Math.min(ly + 18, y - 5); above && yy > ly + 16; yy--) PX.rect(g, x, yy, 1, 1, col);
        dataPop(g, t, nt.at, x, ly + 8, () => dataLabel(g, nt.label, x, ly, { font: "v", size: 24, col, align: "center", border: col, pad: 4 }), 0.3);
        if (t < nt.at + 1.5 && PX.blink(t - nt.at, 0.3)) PX.box(g, x - 6, y - 6, 13, 13, col);
      });
    };
  };

  // ============ office: seniors at desks; HIRING sign flips to NOT HIRING; queue of grads slumps ============
  // o: flip 4.0, grads 5
  K.office = (o) => {
    const flip = o.flip ?? 4.0, ng = Math.min(4, o.grads ?? 4);
    const SEN = [
      { hair: "#d4dae0", glasses: true, sides: true, col: "#5a6b78", skin: C.skin[1] }, { hair: "#b8c0c8", bald: true, sides: true, stache: true, col: C.purple, skin: C.skin[2] },
      { hair: "#e8edf0", glasses: true, sides: true, stache: true, col: C.teal, skin: C.skin[3] }, { hair: "#a8b0b8", bald: true, sides: true, glasses: true, col: "#a0703c", skin: C.skin[0] },
      { hair: "#dfe5ea", stache: true, col: "#3d5a8a", skin: C.skin[3] }, { hair: "#c8cfd6", glasses: true, col: "#8a3c5a", skin: C.skin[1] },
    ];
    const DESKS = [[10, 116], [150, 116], [22, 204], [162, 204]];
    const GRAD = [C.cyan, C.pink, C.yellow, C.green, C.orange, C.purple].slice(0, ng);
    const desk = (g, x, top, i, t) => {
      const s = SEN[i];
      // monitor
      PX.rect(g, x + 64, top - 38, 48, 34, GR[0]); PX.rect(g, x + 64, top - 38, 48, 2, GR[2]); PX.rect(g, x + 110, top - 38, 2, 34, "#2a3542");
      PX.rect(g, x + 67, top - 35, 42, 27, "#0a2028"); dataCode(g, x + 67, top - 35, 42, 27, t, i * 3 + 1);
      PX.rect(g, x + 84, top - 4, 8, 4, GR[1]); PX.rect(g, x + 78, top - 1, 20, 1, GR[2]);
      // senior (sc 3)
      dataMan(g, x + 22, top - 30, Object.assign({ sc: 3 }, s));
      // desk
      PX.rect(g, x, top, 128, 4, "#b07a50"); PX.rect(g, x, top + 4, 128, 2, "#8a5a3c");
      PX.rect(g, x + 4, top + 6, 120, 24, "#5c3a22"); PX.rect(g, x + 4, top + 6, 120, 1, "#7a4e2e"); PX.rect(g, x + 120, top + 6, 4, 24, "#432a18");
      PX.rect(g, x + 10, top + 12, 30, 12, "#6b4428"); PX.rect(g, x + 22, top + 17, 6, 2, "#b07a50");
      // keyboard + typing hands
      PX.rect(g, x + 18, top - 3, 28, 3, GR[2]); PX.rect(g, x + 18, top - 1, 28, 1, GR[1]);
      const f = F(t * 7 + i * 1.3) % 2;
      PX.rect(g, x + 20, top - 6 + f, 5, 3, s.skin); PX.rect(g, x + 38, top - 5 - f, 5, 3, s.skin);
      // mug + steam
      if (i !== 1) { PX.rect(g, x + 4, top - 9, 8, 9, i === 2 ? C.orange : "#dfe7ee"); PX.rect(g, x + 12, top - 7, 2, 4, i === 2 ? C.orange : "#dfe7ee"); PX.rect(g, x + 5, top - 9, 6, 1, "#3a2010"); const st = F(t * 3 + i) % 3; PX.rect(g, x + 6 + (st % 2) * 2, top - 14 - st * 2, 1, 3, "rgba(232,241,242,.5)"); }
      else { PX.rect(g, x + 4, top - 10, 14, 10, "#2fa85a"); PX.rect(g, x + 8, top - 18, 6, 9, "#3df56b"); PX.rect(g, x + 5, top - 14, 4, 5, "#2fa85a"); } // plant
    };
    return (g, t) => {
      const flipped = t >= flip;
      // interior
      PX.rect(g, 0, 0, 300, 178, "#0f1826"); PX.rect(g, 0, 172, 300, 6, "#162234");
      PX.rect(g, 0, 178, 300, 92, "#0b111b"); for (let y = 190; y < 270; y += 16) PX.rect(g, 0, y, 300, 1, "#121b28");
      [[50, 8], [190, 8]].forEach(([lx, ly]) => { PX.rect(g, lx, ly, 60, 3, "#cfe9f0"); PX.rect(g, lx - 2, ly - 2, 64, 2, GR[0]); PX.alpha(g, 0.05, () => { for (let y = 0; y < 150; y += 2) PX.rect(g, lx - y / 3, ly + 3 + y, 60 + y / 1.5, 2, "#cfe9f0"); }); });
      // wall clock + poster
      PX.circle(g, 150, 34, 9, GR[2]); PX.circle(g, 150, 34, 7, "#e8f1f2"); PX.rect(g, 150, 28, 1, 7, "#111"); const ca = t * 1.5; PX.line(g, 150, 34, 150 + R(Math.cos(ca) * 5), 34 + R(Math.sin(ca) * 5), C.red);
      DESKS.forEach(([x, y], i) => desk(g, x, y, i, t));
      // facade + door
      PX.rect(g, 296, 52, 80, 182, "#2f3a47");
      for (let y = 58; y < 234; y += 8) for (let x = 296 + ((y / 8) % 2) * 6; x < 376; x += 12) PX.rect(g, x, y, 11, 7, "#36424f");
      PX.rect(g, 292, 48, 88, 6, GR[1]); PX.rect(g, 292, 48, 88, 1, GR[2]);
      PX.rect(g, 296, 52, 2, 182, "#4a5868");
      // exterior: sidewalk
      PX.rect(g, 296, 234, 184, 36, "#222c38"); PX.rect(g, 296, 234, 184, 2, "#3a4654"); for (let x = 300; x < 480; x += 30) PX.rect(g, x, 236, 1, 34, "#1a222c");
      // street lamp
      PX.rect(g, 468, 64, 4, 170, GR[0]); PX.rect(g, 468, 64, 1, 170, GR[1]); PX.rect(g, 440, 62, 32, 3, GR[0]); PX.rect(g, 436, 64, 12, 4, GR[1]); PX.rect(g, 438, 68, 8, 2, "#f7e7b0");
      PX.alpha(g, 0.07, () => { for (let y = 0; y < 160; y += 2) PX.rect(g, 442 - y / 4, 70 + y, 2 + y / 2, 2, "#f7e7b0"); });
      const dx = 314, dy = 150, dw = 40, dh = 84;
      PX.rect(g, dx - 4, dy - 4, dw + 8, dh + 4, GR[2]);
      const shut = PX.q(PX.p(t, flip, 0.15, "in"), 3);
      PX.rect(g, dx, dy, dw, dh, "#b8964a");
      if (!flipped || shut < 1) { PX.alpha(g, 0.22, () => { for (let y = 0; y < 34; y += 2) PX.rect(g, dx - y, 236 + y, dw + y * 2, 2, "#f7e7b0"); }); PX.rect(g, dx + 4, dy + 8, dw - 8, dh - 8, "#d9b45e"); }
      const doorW = flipped ? R(dw * shut) : 0;
      if (doorW > 0) { PX.rect(g, dx, dy, doorW, dh, "#7a4e2e"); PX.rect(g, dx, dy, doorW, 2, "#9a6a40"); if (doorW > 20) { PX.box(g, dx + 6, dy + 8, dw - 12, 30, "#5c3a22"); PX.box(g, dx + 6, dy + 44, dw - 12, 32, "#5c3a22"); PX.rect(g, dx + dw - 8, dy + 44, 3, 3, C.yellow); } }
      // sign (flips with a squash)
      const sq = Math.abs(PX.q((t - flip) / 0.3, 4) * 2 - 1), squash = t >= flip && t < flip + 0.3 ? sq : 1;
      const txt = t >= flip + 0.15 ? "NOT HIRING" : "HIRING", col = t >= flip + 0.15 ? C.red : C.green;
      const sw = PX.tw(g, "NOT HIRING") + 16, swx = R(sw * squash), sx = 334;
      PX.rect(g, sx - 30, 116, 1, 12, GR[2]); PX.rect(g, sx + 30, 116, 1, 12, GR[2]);
      PX.rect(g, sx - swx / 2, 128, swx, 18, "#0b1622"); PX.box(g, sx - swx / 2, 128, swx, 18, col);
      if (squash > 0.8) { const on = t < flip || PX.blink(t - flip, 0.4, 0.7); PX.text(g, txt, sx, 133, { col: on ? col : mix(col, "#000000", 0.5), align: "center" }); }
      // queue of grads
      GRAD.forEach((c, i) => {
        const x = 368 + i * 28, base = 234 - 39, hair = ["#2b1d14", "#c9a227", "#14100c", "#8a3c1e", "#6b4226"][i % 5], skin = C.skin[(i * 3) % 4];
        if (!flipped) { const hop = PX.blink(t + i * 0.17, 0.5) ? -3 : 0; dataMan(g, x, base + hop, { sc: 3, col: c, cap: true, skin, hair }); PX.rect(g, x + 17, base + hop + 14, 4, 12, "#efe6cf"); PX.rect(g, x + 17, base + hop + 19, 4, 2, C.red); }
        else {
          const sl = t > flip + 0.25 + i * 0.08 ? 3 : 0;
          dataMan(g, x, base + sl, { sc: 3, col: mix(c, "#3a4654", 0.45), cap: true, capTilt: true, sad: true, skin, hair });
          PX.rect(g, x + 17, base + sl + 24, 4, 12, "#cfc6b0"); PX.rect(g, x + 17, base + sl + 29, 4, 2, "#a03030");
          if (i % 2 === 0) { const u = ((t - flip) * 1.4 + i * 0.3) % 1; PX.rect(g, x + 15, base + 12 + sl + F(u * 12), 2, 3, C.blue); }
        }
      });
      // rain cloud after the flip
      if (t > flip + 0.4) {
        const cy = 160 + (t < flip + 0.6 ? -4 : 0);
        [[392, 6, 10], [410, 0, 13], [432, -3, 14], [452, 2, 11], [466, 7, 8]].forEach(([x, dy, r]) => PX.circle(g, x, cy + dy, r, "#56626f"));
        [[392, 8, 9], [410, 3, 12], [432, 1, 13], [452, 5, 10], [466, 9, 7]].forEach(([x, dy, r]) => PX.circle(g, x, cy + dy, r, "#3e4854"));
        PX.rect(g, 382, cy + 10, 92, 8, "#3e4854"); PX.rect(g, 384, cy + 17, 88, 2, "#2c343e");
        for (let i = 0; i < 10; i++) { const u = (t * 1.8 + hash(i)) % 1; PX.rect(g, 386 + i * 9, cy + 22 + F(u * 12), 1, 3, C.blue); }
      }
    };
  };

  // ============ ladder: seniors on top rungs; saw cuts the bottom section; grad jumps, can't reach ============
  // o: saw 1.6, jump 2.8, label "ENTRY LEVEL"
  K.ladder = (o) => {
    const saw = o.saw ?? 1.6, jump = o.jump ?? 2.8, label = o.label ?? "ENTRY LEVEL";
    const LX = 192, RX = 296, RW = 8, TOP = 26, FL = 256, CUT = 186, STEP = 22;
    const W = ["#d9a05e", "#a8743e", "#6b4a26"]; // wood light/base/dark
    const rail = (g, x, y1, y2) => { PX.rect(g, x, y1, RW, y2 - y1, W[1]); PX.rect(g, x, y1, 3, y2 - y1, W[0]); PX.rect(g, x + RW - 2, y1, 2, y2 - y1, W[2]); };
    const rung = (g, y, x1, x2) => { PX.rect(g, x1, y, x2 - x1, 5, W[1]); PX.rect(g, x1, y, x2 - x1, 1, W[0]); PX.rect(g, x1, y + 4, x2 - x1, 1, W[2]); };
    const upper = []; for (let y = TOP + 18; y < CUT - 10; y += STEP) upper.push(y);
    const lower = [CUT + 10, CUT + 10 + STEP, CUT + 10 + 2 * STEP].filter((y) => y < FL - 6);
    return (g, t) => {
      // girder at top
      PX.rect(g, 120, 10, 250, 12, GR[1]); PX.rect(g, 120, 10, 250, 2, GR[2]); PX.rect(g, 120, 20, 250, 2, GR[0]);
      for (let x = 126; x < 366; x += 16) PX.rect(g, x, 14, 2, 2, GR[2]);
      PX.rect(g, LX + 2, 20, 4, 8, GR[2]); PX.rect(g, RX + 2, 20, 4, 8, GR[2]);
      // floor
      PX.rect(g, 60, FL, 360, 2, "#3a4654"); for (let x = 64; x < 420; x += 20) PX.rect(g, x, FL + 4, 10, 1, "#1a2430");
      const cut = t >= saw;
      // upper ladder
      rail(g, LX, TOP, cut ? CUT : FL); rail(g, RX, TOP, cut ? CUT : FL);
      upper.forEach((y) => rung(g, y, LX + RW, RX));
      if (cut) { [LX, RX].forEach((x) => { PX.rect(g, x, CUT, 2, 2, W[0]); PX.rect(g, x + 3, CUT, 2, 3, W[1]); }); }
      // lower section: in place, then falls flat toward the viewer
      const fallP = cut ? PX.q(PX.p(t, saw + 0.05, 0.35, "in"), 4) : 0;
      const segH = FL - CUT, h = R(segH * Math.cos(fallP * Math.PI / 2)) + R(fallP * 16), wide = R(fallP * 18);
      const by = FL + R(fallP * 8), sTop = by - h;
      const sy = (yy) => R(by - (FL - yy) / segH * h);
      if (!cut) { lower.forEach((y) => rung(g, y, LX + RW, RX)); }
      else {
        PX.rect(g, LX - wide, sTop, RW, h, W[1]); PX.rect(g, LX - wide, sTop, 2, h, W[0]);
        PX.rect(g, RX + wide, sTop, RW, h, W[1]); PX.rect(g, RX + wide + RW - 1, sTop, 1, h, W[2]);
        lower.forEach((y) => { PX.rect(g, LX - wide + RW, sy(y), RX - LX - RW + 2 * wide, Math.max(2, R(5 * (1 - fallP))), W[1]); PX.rect(g, LX - wide + RW, sy(y), RX - LX - RW + 2 * wide, 1, W[0]); });
      }
      // ENTRY LEVEL tag on the lowest rung
      const tagY = cut ? sy(lower[lower.length - 1]) + 6 : lower[lower.length - 1] + 6;
      if (fallP < 1) dataLabel(g, label, (LX + RX + RW) / 2, Math.min(tagY, 246), { font: "v", size: 16, col: "#0b1622", bg: C.yellow, align: "center", pad: 3 });
      else dataLabel(g, label, 360, 250, { font: "v", size: 16, col: "#0b1622", bg: C.yellow, align: "center", pad: 3 });
      // dust when it lands
      if (fallP >= 1 && t < saw + 1.2) { const u = (t - saw - 0.4) / 0.8; for (let i = 0; i < 8; i++) PX.alpha(g, 1 - u, () => PX.rect(g, 200 + i * 14 + R(Math.cos(i) * u * 18), FL - 4 - F(u * 12 * hash(i)), 4, 4, "#8b9bab")); }
      // saw: slides across both rails with sparks, then flies off
      if (t > saw - 0.7 && t < saw + 0.5) {
        const p = PX.clamp((t - saw + 0.7) / 0.7, 0, 1), jx = F(t * 20) % 2 ? 3 : -3;
        const x = R(130 + p * 150 + jx + (t > saw ? (t - saw) * 300 : 0)), y = CUT - 5 - (t > saw ? R((t - saw) * 60) : 0);
        PX.rect(g, x, y, 60, 11, GR[2]); PX.rect(g, x, y, 60, 2, "#dfe7ee"); PX.rect(g, x, y + 9, 60, 2, GR[1]);
        for (let i = 0; i < 15; i++) PX.rect(g, x + i * 4, y + 11, 2, 2, GR[2]);
        PX.rect(g, x + 60, y - 6, 18, 19, "#8a3c1e"); PX.rect(g, x + 64, y - 1, 9, 8, "#05060a"); PX.rect(g, x + 60, y - 6, 18, 2, "#b0562c"); PX.rect(g, x + 76, y - 6, 2, 19, "#5a2410");
        if (t < saw) for (let i = 0; i < 7; i++) { const a = hash(i + F(t * 15) * 9) * 3.1 + 3.1, rr = 4 + hash(i * 3 + F(t * 15)) * 14; PX.rect(g, (p < 0.5 ? LX : RX) + 3 + R(Math.cos(a) * rr), CUT + R(Math.sin(a) * rr * 0.6) + 6, 2, 2, i % 2 ? C.yellow : C.orange); }
      }
      // seniors on the upper rungs
      dataMan(g, 214, upper[1] - 39, { sc: 3, hair: "#d4dae0", glasses: true, col: C.purple, skin: C.skin[0] });
      dataMan(g, 254, upper[4] - 39, { sc: 3, hair: "#b8c0c8", bald: true, stache: true, col: C.teal, skin: C.skin[2] });
      // grad: walks under, jumps (twice), can't reach
      const wx = PX.q(PX.p(t, jump - 0.9, 0.7, "lin"), 8), gx = R(150 + wx * 88);
      const J = (j0, H) => { const u = (t - j0) / 0.55; return u > 0 && u < 1 ? R(4 * H * u * (1 - u)) : 0; };
      const jh = J(jump, 24) + J(jump + 0.9, 14), air = jh > 0;
      const gy = FL - 39 - jh;
      dataMan(g, gx, gy, { sc: 3, col: C.cyan, cap: !air, up: air, skin: C.skin[1], hair: "#2b1d14", frame: wx > 0 && wx < 1 ? F(t * 6) % 2 : 0, sad: t > jump + 0.6 });
      if (air) { PX.rect(g, gx - 3, gy - 8, 27, 3, "#111"); PX.rect(g, gx + 6, gy - 11, 9, 3, "#1d1d24"); }
      if (t > jump + 0.55) {
        const ga = t > jump + 0.6 && t < jump + 2.2;
        if (ga && PX.blink(t, 0.5, 0.7)) PX.text(g, "!", gx + 26, gy - 18, { size: 16, col: C.red });
        const u = ((t - jump) * 1.5) % 1; PX.rect(g, gx - 4, gy + 4 + F(u * 10), 2, 3, C.blue); PX.rect(g, gx + 23, gy + 8 + F(((u + 0.5) % 1) * 10), 2, 3, C.blue);
      }
      // gap marker between hand and lowest rung
      if (t > jump + 0.2 && t < jump + 0.6) { const yb = upper[upper.length - 1] + 6; for (let y = yb; y < gy - 8; y += 3) PX.rect(g, gx + 10, y, 1, 1, C.red); }
    };
  };

  // ============ training: books / docs / forum answers stream packets into an LLM chip ============
  // o: items [{label, at, icon:"books"|"docs"|"bubbles"}], label "LLM"
  const dataItemIcon = (g, kind, x, y, t, at) => {
    if (kind === "books") dataBooks(g, x, y, 2);
    else if (kind === "docs") dataDocs(g, x + 6, y, 2);
    else { const B = [[0, 0, C.pink, "?"], [40, 2, C.cyan], [14, 20, C.yellow, "!"], [52, 23, C.green], [-2, 38, C.purple], [36, 41, C.orange, "?"]]; B.forEach(([bx, by, col, gl], i) => { if (t > at + i * 0.18) dataBubble(g, x + bx, y - 4 + by, 30, 16, col, gl); }); }
  };
  K.training = (o) => {
    const items = (o.items || [{ label: "TEXTBOOKS", at: 0.4 }, { label: "DOCS", at: 1.8 }, { label: "FORUM ANSWERS", at: 3.2 }]).map((it, i) => Object.assign({ icon: ["books", "docs", "bubbles"][i % 3], col: [C.orange, C.cyan, C.pink][i % 3] }, it));
    const n = items.length;
    return (g, t) => {
      const cx = 372, cy = 135, S = 136, sp = Math.min(86, 236 / n);
      let glow = 0;
      items.forEach((it, i) => {
        if (t < it.at) return;
        const yc = R(cy - (n - 1) * sp / 2 + i * sp) - 6, ix = 18, iy = yc - 34;
        dataPop(g, t, it.at, ix + 40, yc, () => { dataItemIcon(g, it.icon, ix, iy, t, it.at); PX.text(g, it.label, ix + 40, yc + 27, { font: "v", size: 18, col: C.yellow, align: "center" }); }, 0.3);
        // track: right, then over to the chip's left pins
        const ty = R(cy - 40 + i * (80 / Math.max(1, n - 1))), x1 = 112, x2 = 196 + i * 12, x3 = cx - S / 2 - 12;
        const segs = [[x1, yc, x2, yc], [x2, yc, x2, ty], [x2, ty, x3, ty]], len = segs.reduce((a, s) => a + Math.abs(s[2] - s[0]) + Math.abs(s[3] - s[1]), 0);
        const tp = PX.q(PX.p(t, it.at + 0.2, 0.4, "lin"), 8);
        const ptAt = (d) => { for (const s of segs) { const L = Math.abs(s[2] - s[0]) + Math.abs(s[3] - s[1]); if (d <= L) { const u = L ? d / L : 0; return [R(s[0] + (s[2] - s[0]) * u), R(s[1] + (s[3] - s[1]) * u)]; } d -= L; } return [x3, ty]; };
        for (let d = 0; d < len * tp; d += 2) { const [x, y] = ptAt(d); PX.rect(g, x, y, 2, 2, "#18324a"); }
        if (t > it.at + 0.6) {
          for (let k = 0; k < 7; k++) {
            const u = (((t - it.at - 0.6) * 0.9 + k / 7) % 1), [x, y] = ptAt(PX.q(u, 24) * len);
            PX.rect(g, x - 2, y - 2, 5, 5, it.col); PX.rect(g, x - 1, y - 1, 2, 2, C.white);
          }
          glow += PX.p(t, it.at + 0.8, 1.2, "out") / n;
        }
      });
      const pulse = glow > 0 ? (PX.blink(t, 0.5) ? 0.08 : 0) : 0;
      dataChip(g, cx, cy, S, PX.clamp(glow * 0.9 + pulse, 0, 1), t, o.label || "LLM");
    };
  };

  // ============ grad_books: graduate holding the book stack = LLM chip ============
  // o: eq 1.5, label "WRITTEN-DOWN KNOWLEDGE"
  K.grad_books = (o) => {
    const eq = o.eq ?? 1.5, label = o.label ?? "WRITTEN-DOWN KNOWLEDGE";
    return (g, t) => {
      // graduate in gown (sc 6) hugging a book stack
      const gx = 50, gy = 80, sc = 7, bob = F(t * 2) % 2, GW = "#3d3f6e";
      PX.rect(g, gx - 8, gy + 91, 66, 3, "#14202c");
      dataMan(g, gx, gy + bob, { sc, col: GW, pants: GW, cap: true, skin: C.skin[2], hair: "#5a3a22" });
      PX.rect(g, gx + sc, gy + bob + 9 * sc, 5 * sc, 3 * sc, GW); PX.rect(g, gx + sc, gy + bob + 6 * sc, 2, 6 * sc, "#565a94");
      PX.rect(g, gx + 2 * sc, gy + bob + 6 * sc, sc, 2 * sc, C.cyan); PX.rect(g, gx + 4 * sc, gy + bob + 6 * sc, sc, 2 * sc, C.cyan);
      const bx = gx - 10, by = gy + bob + 44;
      dataBooks(g, bx, by, 1.75, 1.3);
      PX.rect(g, bx + 12, by + 10, 34, 2, "#dfe7ee"); PX.rect(g, bx + 22, by + 19, 30, 2, "#dfe7ee"); // papers sticking out
      PX.rect(g, bx - 4, by + 22, 7, 7, C.skin[2]); PX.rect(g, bx + 68, by + 22, 7, 7, C.skin[2]);
      // chip
      const glow = 0.45 + (t > eq ? 0.35 : 0) + (PX.blink(t, 0.6) ? 0.08 : 0);
      dataChip(g, 372, 136, 116, glow, t, "LLM");
      // "=" sign
      dataPop(g, t, eq, 232, 136, () => {
        const c = t < eq + 0.6 && PX.blink(t - eq, 0.15) ? C.white : C.yellow;
        [124, 142].forEach((y) => { PX.rect(g, 206, y, 52, 10, c); PX.rect(g, 206, y, 52, 2, "rgba(255,255,255,.5)"); PX.rect(g, 206, y + 8, 52, 2, "rgba(0,0,0,.3)"); });
      }, 0.3);
      // label
      if (t > eq + 0.5) PX.text(g, PX.typed(label, t, eq + 0.5, 30), 240, 236, { size: 16, col: C.yellow, align: "center" });
      // sparkle hop between the two after "="
      if (t > eq + 0.3) { const u = ((t - eq - 0.3) * 0.8) % 1, x = R(130 + u * 180), y = R(76 - Math.sin(u * Math.PI) * 30); PX.rect(g, x - 1, y - 4, 2, 9, C.white); PX.rect(g, x - 4, y - 1, 9, 2, C.white); }
    };
  };

  // ============ prod2am: night, PROD DOWN, 2:00 AM, burning rack; lightbulb lesson ============
  // o: lesson 5.0, label "NOT IN ANY TEXTBOOK", time "2:00"
  const FLAME = [["..o..", ".oyo.", ".oyo.", "oyyyo", "oyWyo", ".oyo."], [".o...", ".oo.o", "oyoo.", "oyyyo", "oyWyo", ".ooo."], ["...o.", "o.oo.", ".oyo.", "oyyoo", "oyWyo", ".oyo."]];
  K.prod2am = (o) => {
    const lesson = o.lesson ?? 5.0, label = o.label ?? "NOT IN ANY TEXTBOOK", tm = o.time ?? "2:00";
    return (g, t) => {
      const alarm = PX.blink(t, 0.5);
      // room
      PX.rect(g, 0, 0, 480, 270, "#0a1120"); PX.rect(g, 0, 228, 480, 42, "#070b14"); PX.rect(g, 0, 228, 480, 1, "#1a2433");
      // window with moon
      PX.rect(g, 18, 10, 86, 58, GR[0]); PX.rect(g, 22, 14, 78, 50, "#0d1a36");
      [[30, 22], [52, 54], [88, 58], [40, 42], [70, 20]].forEach(([x, y], i) => { if (PX.blink(t + i * 0.37, 1.2, 0.7)) PX.rect(g, x, y, 1, 1, C.white); });
      PX.circle(g, 82, 30, 9, "#f2e6b8"); PX.circle(g, 86, 27, 8, "#0d1a36"); PX.rect(g, 60, 14, 2, 50, GR[0]); PX.rect(g, 22, 38, 78, 2, GR[0]);
      // digital wall clock
      PX.rect(g, 192, 16, 104, 38, GR[0]); PX.rect(g, 195, 19, 98, 32, "#140606");
      const parts = tm.split(":");
      PX.text(g, parts[0], 226, 27, { size: 16, col: C.red, align: "right" });
      if (PX.blink(t, 1)) PX.text(g, ":", 226, 27, { size: 16, col: C.red });
      PX.text(g, parts[1] || "00", 240, 27, { size: 16, col: C.red });
      PX.text(g, "AM", 276, 35, { col: C.red });
      // server rack
      const rx = 362, ry = 56, rw = 92;
      PX.rect(g, rx, ry, rw, 172, "#1b2430"); PX.rect(g, rx, ry, rw, 3, GR[1]); PX.rect(g, rx, ry, 3, 172, GR[0]); PX.rect(g, rx + rw - 3, ry, 3, 172, "#10161e");
      for (let u = 0; u < 8; u++) {
        const y = ry + 8 + u * 20;
        PX.rect(g, rx + 7, y, rw - 14, 16, "#26313e"); PX.rect(g, rx + 7, y, rw - 14, 1, "#3a4654");
        for (let v = 0; v < 4; v++) PX.rect(g, rx + 12, y + 4 + v * 3, 36, 1, "#141b24");
        for (let l = 0; l < 3; l++) { const on = PX.blink(t + hash(u * 3 + l) * 2, 0.3 + hash(u + l * 9) * 0.5); PX.rect(g, rx + 58 + l * 8, y + 6, 4, 4, on ? C.red : "#3a0c0c"); }
      }
      // flames on top and out of one unit + smoke
      [[rx + 8, ry - 22], [rx + 34, ry - 26], [rx + 62, ry - 21], [rx + rw - 6, ry + 64]].forEach(([fx, fy], i) => {
        PX.sprite(g, FLAME[(F(t * 9) + i) % 3], fx, fy, { o: C.orange, y: C.yellow, W: "#fff3c0" }, i === 1 ? 5 : 4);
      });
      for (let i = 0; i < 6; i++) { const u = (t * 0.5 + i / 6) % 1; PX.alpha(g, 0.5 * (1 - u), () => PX.rect(g, rx + 20 + i * 10 + R(Math.sin(u * 6 + i) * 4), ry - 28 - F(u * 50), 6, 6, "#5a6470")); }
      // monitor (screen flashes PROD DOWN)
      PX.rect(g, 152, 86, 140, 82, GR[0]); PX.rect(g, 152, 86, 140, 2, GR[2]); PX.rect(g, 152, 86, 2, 82, GR[1]);
      PX.rect(g, 159, 93, 126, 66, alarm ? "#a3161e" : "#1c0608");
      PX.text(g, "PROD", 222, 104, { size: 16, col: alarm ? C.white : C.red, align: "center" });
      PX.text(g, "DOWN", 222, 128, { size: 16, col: alarm ? C.white : C.red, align: "center" });
      [[166, 108], [266, 108]].forEach(([x, y]) => { for (let j = 0; j < 9; j++) PX.rect(g, x + 4 - F(j / 2), y + j, 1 + 2 * F(j / 2), 1, C.yellow); PX.rect(g, x + 4, y + 3, 1, 3, "#111"); PX.rect(g, x + 4, y + 7, 1, 1, "#111"); });
      PX.rect(g, 214, 168, 16, 8, GR[1]); PX.rect(g, 204, 174, 36, 3, GR[2]);
      // dev behind desk
      const dvx = 84, dvy = 126, HR = "#6b4226";
      dataMan(g, dvx, dvy, { sc: 5, col: C.purple, skin: C.skin[1], hair: HR, wide: t < lesson });
      PX.rect(g, dvx + 4, dvy - 5, 5, 5, HR); PX.rect(g, dvx + 15, dvy - 7, 5, 7, HR); PX.rect(g, dvx + 26, dvy - 4, 5, 4, HR); // messy hair
      if (t < lesson) { const u = (t * 1.6) % 1; PX.rect(g, dvx - 6, dvy + 10 + F(u * 16), 3, 4, C.blue); PX.rect(g, dvx + 38, dvy + 6 + F(((u + 0.4) % 1) * 16), 3, 4, C.blue); }
      else PX.rect(g, dvx + 12, dvy + 22, 11, 2, "#7a3a2a"); // calm mouth
      // desk
      PX.rect(g, 36, 176, 300, 4, "#6b4a32"); PX.rect(g, 36, 176, 300, 1, "#8a6040"); PX.rect(g, 40, 180, 292, 48, "#3a2818"); PX.rect(g, 40, 180, 292, 1, "#4e3622");
      PX.rect(g, 76, 172, 50, 4, GR[1]); PX.rect(g, 76, 172, 50, 1, GR[2]);
      const f = F(t * 12) % 2; PX.rect(g, 84 + f * 3, 168 + f, 7, 4, C.skin[1]); PX.rect(g, 110 - f * 3, 169 - f, 7, 4, C.skin[1]);
      // coffee mugs + steam
      [[44, 0], [56, 1], [132, 2]].forEach(([mx, i]) => { PX.rect(g, mx, 166, 7, 10, i === 2 ? C.orange : "#dfe7ee"); PX.rect(g, mx + 7, 168, 2, 5, i === 2 ? C.orange : "#dfe7ee"); PX.rect(g, mx + 1, 166, 5, 1, "#3a2010"); const s = F(t * 3 + i) % 3; PX.rect(g, mx + 2 + (s % 2) * 2, 160 - s * 2, 1, 3, "rgba(232,241,242,.55)"); });
      // red alarm wash
      if (alarm) PX.alpha(g, 0.08, () => PX.rect(g, 0, 0, 480, 270, C.red));
      // lesson: lightbulb pops over the dev
      dataPop(g, t, lesson, dvx + 17, 106, () => {
        const bx = dvx + 7, by = 90;
        PX.sprite(g, ["..yyy..", ".yyWyy.", "yyWyyyy", "yyyyyyy", "yyyyyyy", ".yyyyy.", "..yyy..", "..ggg..", "..ddd..", "..ggg.."], bx, by, { y: C.yellow, W: "#fff7d0", g: GR[2], d: GR[0] }, 3);
        if (PX.blink(t - lesson, 0.4, 0.6)) [[-10, 4], [28, 4], [-8, -8], [26, -8], [10, -14]].forEach(([dx, dy]) => PX.rect(g, bx + dx, by + dy, dx === 10 ? 2 : 5, dx === 10 ? 6 : 2, C.yellow));
      }, 0.3);
      if (t > lesson + 0.3) dataLabel(g, PX.typed(label, t, lesson + 0.3, 28), 104, 74, { col: C.yellow, align: "center" });
    };
  };

  // ============ worldmap: blocky continents; USA lights up; ? markers elsewhere ============
  // o: us 0.6, others 4.5, label "US DATA"
  const MAP = (() => {
    const S = {
      u: [[2, 2, 6], [3, 2, 6], [4, 3, 6], [5, 4, 5], [7, 10, 20], [8, 10, 20], [9, 10, 19], [10, 11, 18], [11, 13, 15], [11, 18, 18]],
      n: [[1, 13, 20], [2, 7, 21], [3, 7, 22], [4, 7, 14], [4, 18, 21], [5, 7, 14], [5, 18, 22], [6, 8, 21], [11, 11, 12], [12, 12, 15], [13, 13, 16], [14, 15, 17], [15, 17, 17]],
      g: [[0, 23, 28], [1, 22, 29], [2, 23, 28], [3, 24, 27], [4, 25, 26]],
      s: [[15, 18, 22], [16, 17, 24], [17, 17, 25], [18, 18, 25], [19, 18, 25], [20, 19, 24], [21, 19, 24], [22, 19, 23], [23, 19, 22], [24, 19, 21], [25, 19, 21], [26, 19, 20], [27, 19, 20], [28, 20, 20]],
      e: [[2, 34, 37], [3, 28, 29], [3, 33, 36], [4, 32, 39], [5, 31, 32], [5, 34, 39], [6, 31, 31], [6, 33, 39], [7, 31, 39], [8, 30, 32], [8, 33, 34], [8, 35, 39], [9, 30, 31], [9, 34, 34], [9, 36, 39]],
      r: [[1, 46, 53], [2, 38, 63], [3, 37, 63], [4, 40, 61], [5, 40, 58], [5, 60, 61], [6, 40, 57], [7, 40, 55], [8, 40, 54], [8, 57, 57], [9, 41, 54], [9, 56, 56], [10, 39, 53], [10, 55, 55], [11, 38, 42], [11, 43, 53], [12, 38, 42], [12, 44, 47], [12, 49, 52], [13, 39, 42], [13, 45, 47], [13, 49, 51], [14, 40, 41], [14, 45, 46], [14, 49, 51], [14, 54, 54], [15, 46, 46], [15, 49, 50], [15, 54, 54], [16, 49, 50], [16, 52, 53], [17, 49, 50], [17, 52, 53], [17, 54, 54], [18, 50, 50], [18, 52, 53], [19, 51, 55]],
      a: [[10, 30, 38], [11, 30, 37], [12, 29, 37], [13, 29, 38], [14, 29, 39], [15, 29, 41], [16, 31, 40], [17, 33, 39], [18, 34, 39], [19, 34, 39], [20, 34, 38], [20, 40, 40], [21, 34, 38], [21, 40, 40], [22, 34, 37], [22, 40, 40], [23, 34, 37], [24, 35, 36]],
      o: [[17, 56, 58], [18, 56, 58], [20, 54, 57], [21, 52, 58], [22, 52, 59], [23, 52, 59], [24, 52, 54], [24, 56, 58], [25, 57, 58], [26, 57, 57], [25, 62, 62], [26, 61, 62], [27, 61, 61]],
    };
    const cells = [];
    for (const k in S) for (const [r, a, b] of S[k]) for (let c = a; c <= b; c++) cells.push([c, r, k]);
    return cells;
  })();
  K.worldmap = (o) => {
    const us = o.us ?? 0.6, others = o.others ?? 4.5, label = o.label ?? "US DATA";
    const MK = [[35, 5], [51, 5], [35, 15], [21, 20], [55, 21]]; // Europe, Asia, Africa, S America, Oceania (col,row)
    return (g, t) => {
      const cs = 7, x0 = 16, y0 = 36;
      const scan = t > 1.2 ? x0 + ((t - 1.2) / 2.6 % 1) * 470 : -99;
      for (const [c, r, k] of MAP) {
        if (t < c * 0.008) continue;
        const x = x0 + c * cs, y = y0 + r * cs, isUS = k === "u";
        const lit = isUS && t >= us + (c - 2) * 0.02;
        const near = Math.abs(x - scan) < 8;
        let base = "#123a42", topc = "#1a5058";
        if (lit) { const sh = hash(c * 31 + r * 7 + F(t * 4)) < 0.12; base = sh ? C.cyan : "#2aa9b4"; topc = sh ? "#d8fbfc" : C.cyan; }
        else if (near) { base = "#1a5660"; topc = "#22707a"; }
        PX.rect(g, x, y, 6, 6, base); PX.rect(g, x, y, 6, 1, topc);
      }
      PX.rect(g, scan, 30, 2, 212, "rgba(95,227,232,.25)");
      // US label with pointer
      if (t > us + 0.4) {
        const lx = 70, ly = 140, tx = x0 + 13 * cs;
        for (let y = ly - 6; y > y0 + 11 * cs + 3; y -= 2) PX.rect(g, tx, y, 1, 1, C.cyan);
        dataPop(g, t, us + 0.4, lx, ly + 8, () => dataLabel(g, label, lx, ly, { size: 16, col: C.cyan, align: "center", border: C.cyan, pad: 5 }), 0.3);
        // data packets popping out of the US
        for (let i = 0; i < 4; i++) { const u = ((t - us) * 0.8 + i / 4) % 1, px = x0 + (12 + i * 2) * cs, py = y0 + 8 * cs - F(u * 30); PX.alpha(g, 1 - u, () => PX.rect(g, px, py, 3, 3, C.cyan)); }
      }
      // "?" markers on the other continents
      MK.forEach(([c, r], i) => {
        const a = others + i * 0.35; if (t < a) return;
        const x = x0 + c * cs + 3, y = y0 + r * cs + 3;
        dataPop(g, t, a, x, y, () => {
          const on = PX.blink(t - a, 0.6, 0.65);
          PX.rect(g, x - 10, y - 11, 21, 22, on ? C.yellow : "#5a4a10"); PX.rect(g, x - 8, y - 9, 17, 18, "#0b1622");
          PX.text(g, "?", x + 1, y - 7, { size: 16, col: on ? C.yellow : "#8a7420", align: "center" });
        }, 0.3);
      });
    };
  };

  // ============ warnsign: big warning road sign; WARNING SIGN tick vs MEASUREMENT cross ============
  // o: at 2.5, at2 (at+1.0), a "WARNING SIGN", b "MEASUREMENT"
  const dataTri = (g, cx, top, W, H, d, col) => {
    const k = W / (2 * H), th = Math.atan(k), side = d / Math.cos(th);
    for (let y = Math.ceil(d / Math.sin(th)); y <= H - d; y++) { const hw = R(y * k - side); if (hw >= 0) PX.rect(g, cx - hw, top + y, 2 * hw + 1, 1, col); }
  };
  K.warnsign = (o) => {
    const at = o.at ?? 2.5, at2 = o.at2 ?? at + 1.0, A = o.a ?? "WARNING SIGN", B = o.b ?? "MEASUREMENT";
    return (g, t) => {
      const drop = PX.q(PX.p(t, 0.05, 0.4, "back"), 8), off = R((1 - drop) * -160);
      const cx = 132, top = 36 + off, W = 196, H = 170;
      // post
      PX.rect(g, cx - 7, top + H - 10, 14, 262 - top - H + 10, GR[1]); PX.rect(g, cx - 7, top + H - 10, 3, 262 - top - H + 10, GR[2]); PX.rect(g, cx + 4, top + H - 10, 3, 262 - top - H + 10, GR[0]);
      PX.rect(g, cx - 18, 260, 36, 4, GR[0]);
      // sign: grey rim, black band, yellow face with light top-left
      dataTri(g, cx, top, W, H, 0, GR[2]); dataTri(g, cx, top, W, H, 4, "#141414"); dataTri(g, cx, top, W, H, 12, C.yellow);
      dataTri(g, cx, top, W, H, 16, "#e8b830");
      // "!"
      const ex = cx - 8, ey = top + 62;
      for (let y = 0; y < 52; y++) { const w = 16 - F(y / 13) * 2; PX.rect(g, cx - w / 2, ey + y, w, 1, "#141414"); }
      PX.rect(g, ex + 1, ey + 62, 14, 14, "#141414");
      // amber flasher on top
      const fl = PX.blink(t, 0.5);
      PX.rect(g, cx - 4, top - 6, 8, 6, GR[0]); PX.circle(g, cx, top - 12, 7, fl ? C.orange : "#5a3010"); PX.circle(g, cx - 2, top - 14, 2, fl ? "#ffd9a0" : "#7a4820");
      if (fl) { [[-16, -12, 6, 2], [11, -12, 6, 2], [-1, -28, 2, 6]].forEach(([dx, dy, w, h]) => PX.rect(g, cx + dx, top + dy, w, h, C.orange)); }
      // verdict rows
      const rowsY = [78, 158];
      [[A, true, at], [B, false, at2]].forEach(([s, ok, a], i) => {
        if (t < a) return;
        const y = rowsY[i], tx = 300;
        dataPop(g, t, a, 262, y + 13, () => dataMark(g, 249, y, 3, ok), 0.3);
        PX.text(g, PX.typed(s, t, a + 0.15, 30), tx, y + 1, { font: "v", size: 32, col: ok ? C.green : C.red });
        if (!ok && t > a + 0.4) {
          const rx = tx, ry = y + 32, rw = R(150 * PX.q(PX.p(t, a + 0.4, 0.4, "out"), 6));
          PX.rect(g, rx, ry, rw, 14, "#d9b45e"); PX.rect(g, rx, ry, rw, 2, "#f2d48a"); PX.rect(g, rx, ry + 12, rw, 2, "#a07a30");
          for (let x = 4; x < rw - 2; x += 6) PX.rect(g, rx + x, ry + 2, 1, x % 30 === 4 ? 7 : 4, "#5a4010");
        }
        if (ok && t > a + 0.5) PX.rect(g, tx, y + 28, R(PX.tw(g, s, { font: "v", size: 32 }) * PX.q(PX.p(t, a + 0.5, 0.3), 6)), 2, C.green);
      });
    };
  };

  // ============ laptop_close: lid closes in stepped frames; phone slides in dialling PLUMBER... ============
  // o: close 1.2, ring (close+0.9), name "PLUMBER"
  K.laptop_close = (o) => {
    const close = o.close ?? 1.2, ring = o.ring ?? close + 0.9, name = o.name ?? "PLUMBER";
    const STEPS = [1, 0.78, 0.5, 0.24, 0];
    return (g, t) => {
      const shift = PX.q(PX.p(t, ring - 0.3, 0.5, "out"), 6), cx = R(240 - shift * 78), HY = 178;
      const cs = t < close ? 0 : Math.min(4, F((t - close) / 0.11) + 1), hh = R(136 * STEPS[cs]), shake = cs === 4 && t < close + 0.7 ? (F(t * 30) % 2) : 0;
      // deck (trapezoid)
      for (let i = 0; i < 22; i++) { const hw = 114 + R(i * 0.7); PX.rect(g, cx - hw, HY + i + shake, hw * 2, 1, i < 2 ? GR[2] : GR[1]); }
      PX.rect(g, cx - 130, HY + 22 + shake, 260, 4, GR[0]); PX.rect(g, cx - 18, HY + 22 + shake, 36, 2, "#2a3542");
      if (cs < 4) {
        for (let r = 0; r < 3; r++) for (let k = 0; k < 14; k++) PX.rect(g, cx - 98 - r * 2 + k * 14 + r, HY + 3 + r * 5, 11, 3, "#2a3542");
        PX.rect(g, cx - 54, HY + 3 + 15, 108, 3, "#2a3542"); PX.rect(g, cx - 26, HY + 19, 52, 1, GR[2]);
      } else {
        for (let i = 0; i < 14; i++) { const hw = 112 + R(i * 0.7); PX.rect(g, cx - hw, HY + 2 + i + shake, hw * 2, 1, i < 2 ? GR[2] : i < 4 ? "#6f8090" : GR[1]); }
        PX.rect(g, cx - 116, HY + 16 + shake, 232, 2, GR[0]);
      }
      // lid (screen side visible, foreshortening as it closes)
      if (hh > 0) {
        const lx = cx - 112, ly = HY - hh;
        PX.rect(g, lx, ly, 224, hh, GR[0]); PX.rect(g, lx, ly, 224, 2, GR[1]); PX.rect(g, lx, ly, 2, hh, GR[1]);
        if (hh > 16) {
          const sx = lx + 9, sy = ly + 8, sw = 206, sh = hh - 14;
          PX.rect(g, sx, sy, sw, sh, "#07121c");
          if (cs === 0) {
            const lines = [[0, 14, C.pink], [2, 22, C.cyan], [4, 18, C.green], [4, 26, C.yellow], [2, 8, C.pink], [0, 3, C.white], [0, 16, C.pink], [2, 20, C.cyan], [4, 12, C.green], [2, 24, C.yellow], [0, 3, C.white]];
            const shown = F(t * 9) + 4, first = Math.max(0, shown - 10);
            for (let j = first; j < shown; j++) {
              const L = lines[j % lines.length], len = j === shown - 1 ? F((t * 9 % 1) * L[1]) : L[1];
              PX.rect(g, sx + 8, sy + 6 + (j - first) * 11, 10, 3, "#2a4a5e"); PX.rect(g, sx + 26 + L[0] * 8, sy + 6 + (j - first) * 11, len * 5, 4, L[2]);
              if (j === shown - 1 && PX.blink(t, 0.4)) PX.rect(g, sx + 28 + L[0] * 8 + len * 5, sy + 5 + (j - first) * 11, 4, 6, C.white);
            }
          } else for (let j = 0; j * 5 < sh - 6; j++) PX.rect(g, sx + 26, sy + 3 + j * 5, 40 + F(hash(j) * 100), 2, "#1c3346");
        }
      }
      // thud dust
      if (cs === 4 && t < close + 0.9) { const u = (t - close - 0.44) / 0.5; if (u > 0 && u < 1) for (let i = 0; i < 6; i++) PX.alpha(g, 1 - u, () => { PX.rect(g, cx - 120 - F(u * 24) - i * 3, HY + 10 - F(u * 10 * hash(i)), 4, 4, GR[2]); PX.rect(g, cx + 116 + F(u * 24) + i * 3, HY + 10 - F(u * 10 * hash(i + 7)), 4, 4, GR[2]); }); }
      // phone
      if (t > ring - 0.4) {
        const sl = PX.q(PX.p(t, ring - 0.4, 0.45, "out"), 7), vib = t > ring && PX.blink(t, 0.1) ? 1 : 0;
        const px = R(500 - sl * 170) + vib, py = 46, pw = 108, ph = 184;
        if (t > ring) for (let k = 0; k < 3; k++) {
          const u = ((t - ring) * 1.2 + k / 3) % 1, rr = 64 + F(u * 30);
          const col = mix("#5fe3e8", "#0b1622", u);
          dataArc(g, px + pw / 2, py + 60, rr, -0.7, 0.7, col); dataArc(g, px + pw / 2, py + 60, rr, Math.PI - 0.7, Math.PI + 0.7, col);
        }
        dataRound(g, px, py, pw, ph, GR[0], GR[1]); PX.rect(g, px + 5, py + 3, pw - 10, 1, GR[2]);
        PX.rect(g, px + 7, py + 14, pw - 14, ph - 30, "#07121c"); PX.rect(g, px + pw / 2 - 10, py + 7, 20, 3, "#1a222c");
        PX.text(g, "CALLING", px + pw / 2, py + 22, { font: "v", size: 16, col: C.dim, align: "center" });
        PX.circle(g, px + pw / 2, py + 62, 19, "#16384a"); PX.circle(g, px + pw / 2, py + 62, 17, "#1f4f66");
        // wrench icon
        const wx = px + pw / 2, wy = py + 62;
        for (let i = -8; i <= 8; i++) PX.rect(g, wx + i - 1, wy - i - 1, 3, 3, GR[2]);
        PX.rect(g, wx + 5, wy - 13, 8, 8, GR[2]); PX.rect(g, wx + 8, wy - 13, 3, 4, "#1f4f66");
        PX.rect(g, wx - 12, wy + 6, 6, 6, GR[2]);
        const nm = name, w = PX.tw(g, nm + "...");
        PX.text(g, nm + ".".repeat(F(t * 3) % 4), px + pw / 2 - w / 2, py + 96, { col: C.white });
        PX.text(g, "00:0" + Math.min(9, Math.max(0, F(t - ring))), px + pw / 2, py + 112, { font: "v", size: 16, col: C.dim, align: "center" });
        const pul = PX.blink(t, 0.5);
        PX.circle(g, px + pw / 2, py + 146, pul ? 13 : 11, pul ? C.green : "#1d7a3c");
        PX.sprite(g, ["hh....", "hhh...", ".hh...", "..hh..", "...hhh", "....hh"], px + pw / 2 - 6, py + 140, { h: "#06140c" }, 2);
        PX.rect(g, px + pw / 2 - 14, py + ph - 9, 28, 2, GR[2]);
      }
    };
  };
})();
