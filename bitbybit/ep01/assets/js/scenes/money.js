/* Builder C — Parts 2-3 scene kinds: median, rank, compare, projection, design2code, value, suspects, thumb. */
(function () {
  const { K, C } = PX;
  const G1 = "#3a4654", G2 = "#5a6b78", G3 = "#8b9bab";
  // option time with default scaled to the shot length (typ = the length the default was designed for)
  const moAt = (v, dflt, d, typ) => (v !== undefined && v !== null ? v : (dflt * d) / typ);
  const moO2 = (o, k) => Object.assign({}, o, { col: k });
  // text with drop shadow / with outline
  function moT(g, s, x, y, o, sh, dx) { dx = dx || 1; if (sh) PX.text(g, s, x + dx, y + dx, moO2(o, sh)); return PX.text(g, s, x, y, o); }
  function moOut(g, s, x, y, o, oc, w) { w = w || 1; for (let a = -w; a <= w; a++) for (let b = -w; b <= w; b++) if (a || b) PX.text(g, s, x + a, y + b, moO2(o, oc)); return PX.text(g, s, x, y, o); }
  // filled triangle, dir 1 = tip up at y, -1 = tip down at y+h-1
  function moTri(g, cx, y, h, dir, col) { for (let i = 0; i < h; i++) PX.rect(g, cx - i, dir > 0 ? y + i : y + h - 1 - i, 2 * i + 1, 1, col); }
  // triangle pointing left, tip at (x, cy)
  function moTriL(g, x, cy, h, col) { for (let i = 0; i < h; i++) PX.rect(g, x + i, cy - i, 1, 2 * i + 1, col); }
  // fat arrow, dir 1 = up (tip at base-len), -1 = down (tip at top+len). (cx, y0) = fixed end
  function moArrow(g, cx, y0, len, dir, col, dk) {
    len = Math.round(len); if (len < 2) return;
    const hh = Math.min(15, len), sl = len - hh;
    if (dir > 0) { PX.rect(g, cx - 7, y0 - sl, 15, sl, col); PX.rect(g, cx + 4, y0 - sl, 4, sl, dk); moTri(g, cx, y0 - len, hh, 1, col); }
    else { PX.rect(g, cx - 7, y0, 15, sl, col); PX.rect(g, cx + 4, y0, 4, sl, dk); moTri(g, cx, y0 + sl, hh, -1, col); }
  }
  // stamp that slams in (big -> small) with a short shake
  function moStamp(g, s, cx, cy, t, at, col, size) {
    if (t < at) return;
    const k = t - at, base = size || 16, sz = k < 0.07 ? base * 2 : k < 0.14 ? base + 8 : base;
    const w = Math.round(PX.tw(g, s, { size: sz })) + 18, h = sz + 16, sh = k < 0.35 ? Math.round(Math.sin(k * 80) * 2) : 0;
    const x = Math.round(cx - w / 2) + sh, y = Math.round(cy - h / 2);
    PX.rect(g, x, y, w, h, "rgba(30,0,4,.85)"); PX.box(g, x, y, w, h, col); PX.box(g, x + 2, y + 2, w - 4, h - 4, col);
    PX.text(g, s, x + 9, y + 8, { size: sz, col });
  }
  function moSpark(g, x, y, col, big) { const b = big ? 2 : 0; PX.rect(g, x, y - 2 - b, 1, 5 + 2 * b, col); PX.rect(g, x - 2 - b, y, 5 + 2 * b, 1, col); if (big) PX.rect(g, x - 1, y - 1, 3, 3, col); }
  function moEllipse(g, cx, cy, rx, ry, col) { for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(1 - (y * y) / (ry * ry))); PX.rect(g, cx - w, cy + y, 2 * w + 1, 1, col); } }
  const moBob = (t, ph, per) => (Math.floor(t / (per || 0.5) + (ph || 0) * 2) % 2 === 0 ? 0 : 1);

  // ---------------------------------------------------------------- median
  // o: n (21), mid (0.6), half (2.2), label ("MEDIAN $87K"), halfLabel ("HALF MAKE LESS")
  K.median = (o) => {
    const n = o.n || 21, m = Math.floor(n / 2), lab = o.label || "MEDIAN $87K", hl = o.halfLabel || "HALF MAKE LESS";
    const R = PX.rnd(21), SH = [C.cyan, C.pink, C.purple, C.orange, C.green, C.blue, C.teal, "#c0c0c0"], HA = ["#2b1d14", "#111", "#6b4226", "#d9b36c", "#8a8a8a"];
    const ppl = [...Array(n)].map(() => ({ col: SH[Math.floor(R() * SH.length)], hair: HA[Math.floor(R() * HA.length)], skin: C.skin[Math.floor(R() * 4)], ph: R() }));
    return (g, t, d) => {
      const mid = moAt(o.mid, 0.6, d, 4.5), half = moAt(o.half, 2.2, d, 4.5);
      const sp = Math.min(22, Math.floor(464 / n)), x0 = Math.round(240 - (n * sp) / 2), floor = 252, base = floor - 32, bw = sp - 8;
      PX.rect(g, 6, floor, 468, 1, G1);
      let midTop = base;
      for (let i = 0; i < n; i++) {
        const cx = x0 + i * sp + Math.floor(sp / 2), dim = i < m && t >= half + (m - 1 - i) * 0.05, isM = i === m && t >= mid;
        const hMax = Math.round(16 + 156 * Math.pow(i / (n - 1), 1.55)), bh = Math.round(hMax * PX.q(PX.p(t, 0.05 + i * 0.02, 0.4, "out"), 8));
        const col = isM ? C.yellow : dim ? "#22303c" : "#3fb8c2", x = cx - Math.floor(bw / 2);
        if (i === m) midTop = base - hMax;
        if (bh > 0) {
          PX.rect(g, x, base - bh, bw, bh, col);
          if (bh > 3 && !dim) { PX.rect(g, x, base - bh, bw, 2, "rgba(255,255,255,.4)"); PX.rect(g, x + bw - 3, base - bh, 3, bh, "rgba(0,0,0,.3)"); }
        }
        const p = ppl[i], py = floor - 26 - (dim ? 0 : moBob(t, p.ph, 0.4));
        PX.alpha(g, dim ? 0.35 : 1, () => PX.person(g, cx - 7, py, { sc: 2, col: isM ? C.yellow : p.col, hair: p.hair, skin: p.skin }));
        if (dim && t > half + 0.6 && PX.blink(t + p.ph, 0.6, 0.6)) { PX.rect(g, cx + 6, py + 2, 2, 3, C.cyan); PX.rect(g, cx + 5, py + 4, 4, 2, C.cyan); }
      }
      if (t >= mid) {
        const k = t - mid, cx = x0 + m * sp + Math.floor(sp / 2), sz = k < 0.08 ? 24 : 16;
        const w = PX.tw(g, lab, { size: sz }) + 16, bx = Math.round(240 - w / 2), by = 14;
        PX.panel(g, bx, by, w, sz + 14, C.yellow, "#1e1806"); PX.text(g, lab, 240, by + 7, { size: sz, col: C.yellow, align: "center" });
        for (let y = by + sz + 18; y < midTop - 6; y += 6) PX.rect(g, cx, y, 1, 3, C.yellow);
        if (PX.blink(t, 0.5)) PX.box(g, cx - Math.floor(bw / 2) - 3, midTop - 3, bw + 6, floor - midTop + 5, C.white);
      }
      if (t >= half + 0.3) {
        const a = x0 + 2, b = x0 + m * sp - 4, cxl = Math.round((a + b) / 2), y = 150, pop = t - half - 0.3 < 0.08;
        PX.rect(g, a, y, b - a, 1, C.pink); PX.rect(g, a, y, 1, 6, C.pink); PX.rect(g, b - 1, y, 1, 6, C.pink);
        const hs = pop ? 24 : PX.tw(g, hl, { size: 16 }) <= b - a + 12 ? 16 : 8;
        moT(g, hl, cxl, y - hs - 8, { size: hs, col: C.pink, align: "center" }, "#4a1030", 2);
      }
    };
  };

  // ---------------------------------------------------------------- rank
  // o: rows [{name, v}] (v "$90K" or number in K), at (0.3), hi (1), title ("HIGH SCORES"), medal ("2ND")
  K.rank = (o) => {
    const rows = o.rows || [
      { name: "COMP ENG", v: "$90K" }, { name: "COMP SCI", v: "$87K" }, { name: "ECONOMICS", v: "$78K" }, { name: "PHYSICS", v: "$75K" },
      { name: "FINANCE", v: "$72K" }, { name: "NURSING", v: "$70K" }, { name: "ALL MAJORS", v: "$58K" },
    ];
    const hi = o.hi === undefined ? 1 : o.hi, title = o.title || "HIGH SCORES";
    const ORD = (i) => i + 1 + (i === 0 ? "ST" : i === 1 ? "ND" : i === 2 ? "RD" : "TH"), medal = o.medal || ORD(hi);
    const RC = [C.yellow, C.cyan, C.pink, C.green, C.orange, C.purple, C.white];
    const val = (v) => (typeof v === "number" ? "$" + v + "K" : String(v));
    return (g, t, d) => {
      const at = moAt(o.at, 0.3, d, 5.5), n = rows.length, rh = Math.min(26, Math.floor(180 / n)), x0 = 76, w = 352, y0 = 10, h = 252;
      PX.panel(g, x0, y0, w, h, C.purple, "#0a0816");
      PX.text(g, title, 242, y0 + 12, { size: 16, col: "#4a1440", align: "center" });
      PX.text(g, title, 240, y0 + 10, { size: 16, col: [C.yellow, C.pink, C.cyan, C.green][Math.floor(t / 0.3) % 4], align: "center" });
      PX.text(g, "RANK", x0 + 16, y0 + 36, { font: "v", size: 16, col: G3 }); PX.text(g, "MAJOR", x0 + 84, y0 + 36, { font: "v", size: 16, col: G3 });
      PX.text(g, "PAY", x0 + w - 16, y0 + 36, { font: "v", size: 16, col: G3, align: "right" });
      PX.rect(g, x0 + 10, y0 + 52, w - 20, 1, "#2a1f4a");
      let typing = -1;
      rows.forEach((r, i) => {
        const st = at + i * 0.45, y = y0 + 60 + i * rh, rk = ORD(i), nm = r.name, vv = val(r.v);
        const k = Math.floor((t - st) * 32); if (k <= 0) return;
        const done = k >= rk.length + nm.length + vv.length; if (!done) typing = i;
        const on = i === hi && t > st + 0.7, bl = on && PX.blink(t, 0.4, 0.6);
        if (on) { PX.rect(g, x0 + 6, y - 5, w - 12, rh - 1, bl ? "#3a2c06" : "#1c1608"); if (bl) PX.box(g, x0 + 6, y - 5, w - 12, rh - 1, C.yellow); }
        const col = on ? (bl ? C.yellow : C.white) : i === n - 1 ? G3 : C.ink;
        PX.text(g, rk.slice(0, k), x0 + 16, y, { size: 16, col: on ? col : RC[i % RC.length] });
        const k2 = k - rk.length; if (k2 > 0) PX.text(g, nm.slice(0, k2), x0 + 84, y, { size: 16, col });
        const k3 = k2 - nm.length;
        if (k3 > 0) {
          const vs = vv.slice(0, k3), vx = x0 + w - 16, tw = PX.tw(g, vv, { size: 16 }), nx = x0 + 84 + PX.tw(g, nm, { size: 16 }) + 6;
          for (let x = nx; x < vx - tw - 6; x += 6) PX.rect(g, x, y + 12, 2, 2, "#3a3460");
          PX.text(g, vs, vx - tw, y, { size: 16, col: on ? col : C.white });
        }
        if (i === hi && t > st + 0.7) {
          const k4 = t - st - 0.7, drop = Math.round(Math.max(0, 1 - k4 / 0.3) * 40), cx = 38, cy = y + 14 - drop + moBob(t, 0, 0.3) * 2;
          PX.rect(g, cx - 12, cy - 40, 24, 24, "#2a56b0"); PX.rect(g, cx - 4, cy - 40, 8, 24, C.purple);
          PX.circle(g, cx, cy, 20, "#4a5866"); PX.circle(g, cx - 1, cy - 1, 18, "#8b9bab"); PX.circle(g, cx - 2, cy - 2, 15, "#aab8c6"); PX.rect(g, cx - 10, cy - 12, 4, 4, "#dde6ee");
          PX.text(g, medal, cx - 1, cy - 5, { size: 8, col: "#2a3440", align: "center" });
          if (PX.blink(t, 0.5)) moSpark(g, cx + 16, cy - 16, C.white, 1);
        }
      });
      if (typing >= 0 && PX.blink(t, 0.2)) PX.rect(g, x0 + w - 12, y0 + 60 + typing * rh, 6, 14, C.yellow);
      if (PX.blink(t, 1.0, 0.6)) PX.text(g, "INSERT COIN", 240, y0 + h - 16, { size: 8, col: G2, align: "center" });
    };
  };

  // ---------------------------------------------------------------- compare
  // o: left ("COMP SCI"), right ("PHILOSOPHY"), stats [{label, a, b, at, good:"low"|"high"}], verdict (11), verdictLabel
  const MO_LAPTOP = ["..gggggggg..", "..gccccccg..", "..gcppcccg..", "..gccccccg..", "..gggggggg..", ".mmmmmmmmmm.", "mmmmmmmmmmmm"];
  const MO_SCROLL = [".bbbbbbbbbb.", "bwwwwwwwwwwb", ".wddwddddw..", ".wwwwwwwww..", ".wddddwddw..", ".wwwwwwwww..", "bwwwwwwwwwwb", ".bbbbbbbbbb."];
  K.compare = (o) => {
    const L = o.left || "COMP SCI", Rn = o.right || "PHILOSOPHY", vl = o.verdictLabel || "DIFFERENT TRADE-OFFS";
    const stats0 = o.stats || [
      { label: "OUT OF WORK", a: "7.0%", b: "5.1%", at: 1.5, good: "low" },
      { label: "JOB NEEDS DEGREE", a: "81%", b: "53%", at: 4.5, good: "high" },
      { label: "PAY VS AVERAGE", a: "+50%", b: "?", at: 7.5, good: "high" },
    ];
    const num = (v) => parseFloat(String(v).replace(/[^0-9.\-]/g, ""));
    const stats = stats0.map((s) => {
      const a = num(s.a), b = num(s.b), mx = Math.max(Math.abs(a) || 0, Math.abs(b) || 0) * 1.12 || 1;
      let win = -1;
      if (!isNaN(a) && !isNaN(b)) win = a === b ? -1 : (s.good === "low" ? a < b : a > b) ? 0 : 1;
      else if (!isNaN(a)) win = 0; else if (!isNaN(b)) win = 1;
      return Object.assign({}, s, { na: a, nb: b, mx, win });
    });
    const shown = (v, p) => {
      const m = String(v).match(/^([^0-9]*)([0-9.]+)(.*)$/); if (!m) return String(v);
      const dec = (m[2].split(".")[1] || "").length; return m[1] + (parseFloat(m[2]) * p).toFixed(dec) + m[3];
    };
    return (g, t, d) => {
      const verdict = moAt(o.verdict, 11, d, 13), cw = 212, ch = 218, ty = 8;
      const ats = stats.map((s, j) => (s.at !== undefined ? s.at : ((1.5 + 3 * j) * d) / 13));
      [0, 1].forEach((side) => {
        const x = side ? 254 : 14, col = side ? C.yellow : C.cyan, dk = side ? "#2a2208" : "#0a2226";
        const rise = Math.round((1 - PX.q(PX.p(t, side * 0.25, 0.35, "out"), 5)) * 60), y = ty + rise;
        PX.panel(g, x, y, cw, ch, col, "#0b1218"); PX.rect(g, x + 2, y + 2, cw - 4, 64, dk);
        // hero: jumps when it wins a row
        let jump = 0; stats.forEach((s, j) => { if (s.win === side && t > ats[j] + 1.4 && t < ats[j] + 1.8) jump = 4; });
        const py = y + 8 - jump - (jump ? 0 : moBob(t, side * 0.5, 0.5));
        PX.person(g, x + 8, py, { sc: 4, col, hair: side ? "#9a9a9a" : "#2b1d14", skin: side ? C.skin[0] : C.skin[2], pants: side ? "#5a4a2a" : "#2d3b55" });
        if (side) { PX.rect(g, x + 12, py + 20, 20, 6, "#e0e0e0"); PX.rect(g, x + 16, py + 26, 12, 4, "#e0e0e0"); PX.rect(g, x + 18, py + 20, 8, 2, "#8a3a3a"); }
        PX.text(g, side ? Rn : L, x + 44, y + 12, { size: 16, col });
        PX.sprite(g, side ? MO_SCROLL : MO_LAPTOP, x + 44, y + 36, side ? { b: C.brown, w: "#e8dcb8", d: "#8a7a5a" } : { g: G2, c: "#1d5a63", p: C.pink, m: G3 }, 2);
        PX.text(g, side ? "LV 99 THINKER" : "LV 99 CODER", x + 74, y + 42, { font: "v", size: 16, col: G3 });
        stats.forEach((s, j) => {
          const at = ats[j]; if (t < at) return;
          const ry = y + 78 + j * 46, v = side ? s.b : s.a, nv = side ? s.nb : s.na;
          PX.text(g, PX.typed(s.label, t, at, 28), x + 10, ry, { size: 8, col: C.ink });
          const bx = x + 10, by = ry + 12, bwid = 132, segs = 22, p = PX.p(t, at + 0.3, 1.1, "lin");
          PX.box(g, bx, by, bwid, 16, G1);
          if (isNaN(nv)) {
            if (t > at + 0.3) { for (let i = 0; i < segs; i++) if ((i + Math.floor(t * 6)) % 3 === 0) PX.rect(g, bx + 2 + i * 6, by + 2, 4, 12, "#2a3440"); PX.text(g, "???", bx + bwid / 2, by + 4, { size: 8, col: G3, align: "center" }); }
          } else {
            const fs = Math.round(segs * Math.min(1, Math.abs(nv) / s.mx) * p);
            for (let i = 0; i < fs; i++) { PX.rect(g, bx + 2 + i * 6, by + 2, 5, 12, col); PX.rect(g, bx + 2 + i * 6, by + 2, 5, 2, "rgba(255,255,255,.45)"); }
          }
          if (t > at + 0.3) PX.text(g, isNaN(nv) ? String(v) : shown(v, PX.q(Math.min(1, p * 1.05), 20)), x + 148, by - 4, { font: "v", size: 24, col: C.white });
          if (s.win === side && t > at + 1.4 && (t > at + 1.9 || PX.blink(t, 0.12))) { moTri(g, x + 201, by - 1, 8, 1, C.green); PX.rect(g, x + 198, by + 7, 7, 6, C.green); }
        });
      });
      // VS badge
      PX.panel(g, 228, 108, 24, 20, C.pink, "#2a0a1c"); PX.text(g, "VS", 240, 114, { size: 8, col: PX.blink(t, 0.6) ? C.pink : C.white, align: "center" });
      if (t >= verdict) {
        const k = PX.q(PX.p(t, verdict, 0.3, "out"), 6), w = PX.tw(g, vl, { size: 16 }) + 40, bx = Math.round(240 - w / 2 - (1 - k) * 500);
        PX.panel(g, bx, 230, w, 30, C.yellow, "#2e2406"); PX.text(g, vl, bx + w / 2, 238, { size: 16, col: C.yellow, align: "center" });
        if (k >= 1 && PX.blink(t, 0.5)) { moSpark(g, bx - 8, 236, C.yellow, 1); moSpark(g, bx + w + 7, 252, C.yellow, 1); }
      }
    };
  };

  // ---------------------------------------------------------------- projection
  // o: r1 (1.5), open (4.5), r2 (9.0), down (13.5), title ("BLS PROJECTIONS"), years ("2025-2035"),
  //    row1 (["SOFTWARE","DEVELOPERS"]), up ("+10%"), openings (106000), openLabel ("OPENINGS/YR"), row2 (["COMPUTER","PROGRAMMERS"]), dn ("-7%")
  K.projection = (o) => {
    const title = o.title || "BLS PROJECTIONS", yrs = o.years || "2025-2035", row1 = o.row1 || ["SOFTWARE", "DEVELOPERS"], row2 = o.row2 || ["COMPUTER", "PROGRAMMERS"];
    const up = o.up || "+10%", dn = o.dn || "-7%", openings = o.openings === undefined ? 106000 : o.openings, ol = o.openLabel || "OPENINGS/YR";
    const fmt = (v) => Math.round(v).toLocaleString("en-US");
    const pct = (s, p) => { const m = String(s).match(/^([+\-]?)(\d+)(.*)$/); return m ? m[1] + Math.round(parseInt(m[2]) * p) + m[3] : s; };
    const typeRow = (g, lines, t, at, y, col) => { let off = 0; lines.forEach((ln, i) => { PX.text(g, PX.typed(ln, t, at + off / 18, 18), 28, y + i * 20, { size: 16, col }); off += ln.length; }); return at + off / 18; };
    return (g, t, d) => {
      const s = d / 21, r1 = moAt(o.r1, 1.5, d, 21), open = moAt(o.open, 4.5, d, 21), r2 = moAt(o.r2, 9, d, 21), down = moAt(o.down, 13.5, d, 21);
      PX.panel(g, 12, 6, 456, 258, C.cyan, "#08121c");
      PX.rect(g, 14, 8, 452, 34, "#0f2436");
      // government building icon
      moTri(g, 38, 12, 8, 1, G3); PX.rect(g, 26, 20, 25, 2, G3);
      for (let i = 0; i < 4; i++) PX.rect(g, 27 + i * 6, 23, 3, 11, i % 2 ? G2 : G3);
      PX.rect(g, 25, 34, 27, 3, G3);
      moT(g, title, 60, 17, { size: 16, col: C.yellow }, "#4a3a08");
      PX.text(g, yrs, 60 + PX.tw(g, title, { size: 16 }) + 10, 15, { font: "v", size: 24, col: C.cyan });
      PX.text(g, "OCCUPATION", 28, 47, { font: "v", size: 16, col: G3 }); PX.text(g, "10-YR CHANGE", 252, 47, { font: "v", size: 16, col: G3 });
      PX.rect(g, 14, 64, 452, 1, "#1d3a52"); PX.rect(g, 14, 162, 452, 1, "#1d3a52"); PX.rect(g, 240, 44, 1, 216, "#14283a");
      // row 1
      if (t >= r1) {
        const e1 = typeRow(g, row1, t, r1, 76, C.ink), ga = e1 + 0.3;
        if (t >= ga) {
          const p = PX.q(PX.p(t, ga, 1.0, "lin"), 8), bob = p >= 1 ? moBob(t, 0, 0.35) : 0;
          moArrow(g, 270, 150 - bob, 82 * p, 1, C.green, "#1e8a3c");
          moT(g, pct(up, p), 296, 84, { size: 24, col: C.green }, "#0c3a18", 2);
        } else if (PX.blink(t, 0.3)) PX.rect(g, 28 + PX.tw(g, row1[row1.length - 1], { size: 16 }) + 2, 96, 8, 16, C.cyan);
        if (t >= open) {
          const p = PX.q(PX.p(t, open, 1.6, "out"), 30), k = t - open;
          moT(g, fmt(openings * p), 28, 118, { size: k < 0.1 ? 32 : 24, col: C.white }, G1, 2);
          PX.text(g, ol, 28, 143, { font: "v", size: 18, col: C.cyan });
          const icons = Math.min(7, Math.max(0, Math.floor((t - open - 0.3) / (0.4 * Math.max(s, 0.5))) + 1));
          for (let i = 0; i < icons; i++) PX.person(g, 304 + i * 22, 126 - moBob(t, i * 0.37, 0.3) * 2, { col: [C.cyan, C.green, C.yellow, C.pink][i % 4], sc: 2, hair: "#2b1d14", skin: C.skin[i % 4] });
        }
      }
      // row 2
      if (t >= r2) {
        const e2 = typeRow(g, row2, t, r2, 174, C.ink);
        if (t < down) { if (t > e2 && PX.blink(t, 0.5)) PX.text(g, "...", 300, 196, { size: 24, col: G2 }); }
        else {
          const p = PX.q(PX.p(t, down, 0.9, "lin"), 8), bob = p >= 1 ? moBob(t, 0.5, 0.35) : 0;
          moArrow(g, 270, 170 + bob, 82 * p, -1, C.red, "#8a1e1e");
          moT(g, pct(dn, p), 296, 188, { size: 24, col: C.red }, "#3a0c0c", 2);
          if (t < down + 2.2 && PX.blink(t, 0.3)) PX.box(g, 18, 166, 444, 94, C.red);
          // the programmers shrink away
          for (let i = 0; i < 6; i++) { const k = i % 3 === 1 ? t - down - 1 - i * 0.3 : -1, x = 326 + i * 22; if (k < 0) PX.person(g, x, 226 - (i % 3 === 1 ? 0 : moBob(t, i * 0.3, 0.5) * 2), { col: G3, sc: 2, hair: "#555", skin: C.skin[(i + 1) % 4] }); else if (k < 0.4) { PX.line(g, x, 230, x + 12, 242, C.red); PX.line(g, x + 12, 230, x, 242, C.red); } }
        }
        if (t < down) for (let i = 0; i < 6; i++) if (t > e2 + i * 0.15) PX.person(g, 326 + i * 22, 226 - moBob(t, i * 0.3, 0.4) * 2, { col: G3, sc: 2, hair: "#555", skin: C.skin[(i + 1) % 4] });
      }
    };
  };

  // ---------------------------------------------------------------- design2code
  // o: label ("COMPUTER PROGRAMMER"), at (0.3) when the label types, code (1.4) when code starts flowing
  K.design2code = (o) => {
    const label = o.label || "COMPUTER PROGRAMMER", R = PX.rnd(77), CC = [C.pink, C.cyan, C.yellow, C.green, C.purple, C.orange];
    const LINES = [...Array(60)].map((_, i) => { const ind = [0, 1, 1, 2, 2, 1, 0][i % 7]; const segs = []; let x = ind * 8; const n = 1 + Math.floor(R() * 3); for (let k = 0; k < n; k++) { const w = 8 + Math.floor(R() * 26); segs.push([x, w, CC[Math.floor(R() * CC.length)]]); x += w + 4; } return segs; });
    return (g, t, d) => {
      const lat = moAt(o.at, 0.3, d, 5), cst = moAt(o.code, 1.4, d, 5);
      // blueprint sheet
      const bx = 14, by = 44, bw = 140, bh = 156, bp = PX.p(t, 0, 0.3, "out"), byy = by + Math.round((1 - PX.q(bp, 4)) * 40);
      PX.rect(g, bx, byy, bw, bh, "#163f78");
      for (let x = 10; x < bw; x += 10) PX.rect(g, bx + x, byy, 1, bh, "#1f5296");
      for (let y = 10; y < bh; y += 10) PX.rect(g, bx, byy + y, bw, 1, "#1f5296");
      PX.box(g, bx, byy, bw, bh, "#9cc4f0");
      for (let i = 0; i < 10; i++) PX.rect(g, bx + bw - 10 + i, byy + bh - 10 + (9 - i), 10 - i, 1, "#0b2448");
      const W = "#dbeaff", step = (k) => t > 0.25 + k * 0.18;
      const bxs = [[16, 16, 46, 28], [80, 16, 44, 28], [40, 96, 62, 34]];
      bxs.forEach(([x, y, w, h], k) => { if (!step(k)) return; PX.box(g, bx + x, byy + y, w, h, W); PX.rect(g, bx + x + 5, byy + y + 7, w - 14, 2, W); PX.rect(g, bx + x + 5, byy + y + 14, w - 22, 2, "#8fb6e8"); });
      if (step(3)) { PX.rect(g, bx + 62, byy + 30, 18, 1, W); PX.rect(g, bx + 78, byy + 28, 2, 5, W); }
      if (step(4)) { PX.rect(g, bx + 38, byy + 44, 1, 38, W); PX.rect(g, bx + 102, byy + 44, 1, 38, W); moTri(g, bx + 38, byy + 82, 5, -1, W); moTri(g, bx + 102, byy + 82, 5, -1, W); PX.rect(g, bx + 38, byy + 86, 1, 10, W); PX.rect(g, bx + 102, byy + 86, 1, 10, W); }
      if (step(5)) { PX.text(g, "SPEC", bx + 8, byy + bh - 20, { font: "v", size: 16, col: W }); for (let i = 0; i < 3; i++) PX.rect(g, bx + 50 + i * 20, byy + bh - 14, 14, 1, "#8fb6e8"); }
      // marching chevrons + paper packets from sheet to worker
      if (t > 0.9) {
        for (let i = 0; i < 3; i++) { const on = Math.floor(t * 6) % 3 === i; const x = 162 + i * 10, c = on ? C.yellow : "#5a4a14"; for (let k = 0; k < 6; k++) { PX.rect(g, x + k, 112 + k, 3, 1, c); PX.rect(g, x + k, 124 - k, 3, 1, c); } }
        for (let k = 0; k < 8; k++) { const st = 1.0 + k * 0.55, p = (t - st) / 0.5; if (p < 0 || p > 1) continue; const x = 150 + Math.round(PX.q(p, 6) * 56); PX.rect(g, x, 98, 9, 11, "#dbeaff"); PX.rect(g, x + 2, 101, 5, 1, "#3d7cf5"); PX.rect(g, x + 2, 104, 4, 1, "#3d7cf5"); }
      }
      // worker behind a laptop at a desk
      const wx = 231, typing = t > cst - 0.2, fr = typing ? Math.floor(t * 8) % 2 : 0, wy = 92 + (typing ? 0 : moBob(t, 0, 0.6));
      PX.rect(g, 222, 118, 54, 52, G1); PX.rect(g, 222, 118, 54, 3, G2);
      PX.person(g, wx, wy, { sc: 5, col: C.purple, hair: "#2b1d14", skin: C.skin[1] });
      PX.rect(g, wx + 5, wy + 10, 25, 5, "#2b1d14");
      if (typing) PX.rect(g, wx + 5, wy + 15, 25, 10, "rgba(95,227,232,.16)");
      PX.rect(g, wx - 12, wy + 32, 12, 26 + (fr ? 0 : 5), C.purple); PX.rect(g, wx + 35, wy + 32, 12, 26 + (fr ? 5 : 0), C.purple);
      PX.rect(g, 178, 166, 132, 7, C.brown); PX.rect(g, 178, 166, 132, 2, "#b07a50"); PX.rect(g, 184, 173, 120, 40, "#5c3a24"); PX.rect(g, 184, 173, 120, 2, "#3e2616");
      PX.rect(g, 222, 128, 54, 36, G2); PX.rect(g, 222, 128, 54, 2, G3); PX.rect(g, 272, 128, 4, 36, G1); PX.rect(g, 214, 162, 70, 4, G3);
      PX.rect(g, 245, 142, 8, 8, G1);
      PX.rect(g, wx - 13, wy + 56 + (fr ? 0 : 5), 12, 9, C.skin[1]); PX.rect(g, wx + 36, wy + 56 + (fr ? 5 : 0), 12, 9, C.skin[1]);
      // code panel on the right with lines streaming in (and flying out of the laptop)
      const px = 312, py = 52, pw = 156, ph = 152;
      PX.panel(g, px, py, pw, ph, C.green, "#06120a");
      PX.rect(g, px + 2, py + 2, pw - 4, 10, "#0e2a16"); [C.red, C.yellow, C.green].forEach((c, i) => PX.rect(g, px + 6 + i * 7, py + 5, 4, 4, c));
      const nl = Math.max(0, Math.floor((t - cst) / 0.2) + 1), vis = 17, first = Math.max(0, nl - vis);
      for (let i = first; i < nl && i < LINES.length; i++) { const y = py + 16 + (i - first) * 8; LINES[i].forEach(([x, w, c]) => PX.rect(g, px + 18 + x, y, Math.min(w, pw - 24 - x), 4, c)); PX.rect(g, px + 7, y, 6, 4, "#1f4a2a"); }
      if (nl > 0 && t > cst) { const k = ((t - cst) % 0.2) / 0.2, x = 280 + Math.round(PX.q(k, 4) * 28); PX.rect(g, x, 140, 14, 3, CC[nl % CC.length]); }
      if (t >= lat) { const s = PX.typed(label, t, lat, 30); moT(g, s, 240, 226, { size: 16, col: C.yellow, align: "center" }, "#4a3a08", 2); }
    };
  };

  // ---------------------------------------------------------------- value
  // o: cheap (0.8), a (3.5), b (6.5), left (["DESIGN","CODE"]), aLabel (["DECIDE WHAT","TO BUILD"]), bLabel (["JUDGE IF","IT'S GOOD"])
  function moTag(g, x, y, w, h, col, fill) {
    const sh = (inset, c) => { const hh = h - inset * 2, n = Math.floor(hh / 2); for (let i = 0; i < hh; i++) { const off = Math.round(Math.abs(i - n) * 0.55); PX.rect(g, x + inset + off, y + inset + i, w - inset * 2 - off, 1, c); } };
    sh(0, col); sh(2, fill);
    PX.circle(g, x + 16, y + Math.floor(h / 2), 4, col); PX.circle(g, x + 16, y + Math.floor(h / 2), 2, "#05060a");
  }
  K.value = (o) => {
    const left = o.left || ["DESIGN", "CODE"], la = o.aLabel || ["DECIDE WHAT", "TO BUILD"], lb = o.bLabel || ["JUDGE IF", "IT'S GOOD"];
    return (g, t, d) => {
      const cheap = moAt(o.cheap, 0.8, d, 9.8), ta = moAt(o.a, 3.5, d, 9.8), tb = moAt(o.b, 6.5, d, 9.8);
      // left tag (hangs from a nail)
      const lx = 10 + Math.round((1 - PX.q(PX.p(t, ta - 0.5, 0.4, "out"), 5)) * 120), ly = 52 + moBob(t, 0, 0.6), lw = 224, lh = 168;
      const gone = Math.max(0, Math.min(3, Math.floor((t - cheap) / 0.2) + 1)), dead = t >= cheap, tc = dead ? G3 : C.ink, ac = dead ? G3 : C.cyan;
      PX.rect(g, lx + 14, 18, 4, 4, G3); PX.line(g, lx + 16, 22, lx + 16, ly + lh / 2 - 4, "#c8b890");
      moTag(g, lx, ly, lw, lh, dead ? G2 : C.cyan, dead ? "#0b1218" : "#0a2228");
      PX.text(g, left[0], lx + 36, ly + 20, { size: 24, col: tc });
      // pixel arrow + second word
      const ax = lx + 36, ay = ly + 56; PX.rect(g, ax, ay + 8, 16, 8, ac);
      for (let i = 0; i < 12; i++) PX.rect(g, ax + 16 + i, ay + i, 1, 24 - 2 * i, ac);
      PX.text(g, left[1], ax + 34, ay, { size: 24, col: tc });
      const price = "$$$$".slice(0, 4 - gone), shake = dead && t - cheap - (gone - 1) * 0.2 < 0.1 ? 3 : 0;
      moT(g, price, lx + 36 + shake, ly + 104, { size: 32, col: dead ? C.red : C.yellow }, dead ? "#3a0c0c" : "#4a3a08", 3);
      for (let k = 0; k < gone; k++) { const st = cheap + k * 0.2, f = t - st; if (f < 0 || f > 1.2) continue; const x = lx + 36 + (3 - k) * 32 + Math.round(f * 30), y = ly + 104 + Math.round(f * f * 140); PX.text(g, "$", x, y, { size: 24, col: "#b8860b" }); }
      if (dead) { const p = PX.q(PX.p(t, cheap + 0.2, 0.6, "lin"), 6); moArrow(g, lx + 190, ly + 70, 80 * p, -1, C.red, "#8a1e1e"); }
      // right tags
      [[ta, la, 26, 0], [tb, lb, 146, 1]].forEach(([at, lines, y0, j]) => {
        if (t < at) return;
        const k = PX.q(PX.p(t, at, 0.3, "out"), 5), x = 250 + Math.round((1 - k) * 240), y = y0 + moBob(t, j * 0.5, 0.6), w = 216, h = 104;
        PX.rect(g, x + 14, y0 - 16, 4, 4, G3); PX.line(g, x + 16, y0 - 12, x + 16, y + h / 2 - 4, "#c8b890");
        moTag(g, x, y, w, h, C.yellow, "#1e1806");
        lines.forEach((ln, i) => PX.text(g, ln, x + 30, y + 14 + i * 20, { size: 16, col: C.ink }));
        const n = Math.max(1, Math.min(4, Math.floor((t - at - 0.4) / 0.35) + 1)), full = n >= 4;
        moT(g, "$$$$".slice(0, n), x + 30, y + 64, { size: 24, col: C.green }, "#0c3a18", 2);
        if (t > at + 0.4) { const p = PX.q(PX.p(t, at + 0.4, 1.0, "lin"), 5); moArrow(g, x + 160, y + 92, 34 * p, 1, C.green, "#1e8a3c"); }
        if (full) { const sp = [[x + 10, y - 6], [x + w - 8, y + 10], [x + w - 30, y + h + 4], [x + 120, y - 4], [x + 6, y + h - 6]]; sp.forEach(([sx, sy], i) => { if (PX.blink(t + i * 0.17, 0.5, 0.55)) moSpark(g, sx, sy, i % 2 ? C.white : C.yellow, i % 2); }); }
      });
    };
  };

  // ---------------------------------------------------------------- suspects
  // o: at ([1.0, 6.0, 8.0]), none (11), title ("WHO DID IT?"), stamp ("NO CLEAN ANSWER"),
  //    names ([["AI"], ["INTEREST","RATES"], ["2021","HIRING BINGE"]])
  const MO_ROBOT = [
    "......rr......", ".......o......", "..oooooooooo..", "..oggggggggo..", "..ogeeggeego..", "..ogeeggeego..", "..oggggggggo..", "..ogmmmmmmgo..",
    "..oooooooooo..", ".....oooo.....", "oooooooooooooo", "ogggggggggggmo", "ogmyymrrmmggmo", "ogmyymrrmmggmo", "ogggggggggggmo", "ogggggggggggmo",
    "oooooooooooooo", "..om......mo..", "..om......mo..", "..om......mo..", ".ooo......ooo.",
  ];
  K.suspects = (o) => {
    const ats0 = o.at || [1.0, 6.0, 8.0], title = o.title || "WHO DID IT?", stamp = o.stamp || "NO CLEAN ANSWER";
    const names = o.names || [["AI"], ["INTEREST", "RATES"], ["2021", "HIRING BINGE"]];
    const WALL = "#111b27", floor = 226, XS = [92, 240, 388];
    const CROWD = [[-20, -14, C.green, 1], [18, -16, C.purple, 0], [-40, 0, C.cyan, 0], [-2, 2, C.pink, 1], [36, 0, C.yellow, 0]];
    return (g, t, d) => {
      const ats = ats0.map((a, i) => (o.at ? a : (a * d) / 13)), none = moAt(o.none, 11, d, 13);
      PX.rect(g, 0, 30, 480, floor - 30, WALL);
      for (let k = 0; k * 24 < floor - 40; k++) { const y = floor - k * 24; PX.rect(g, 0, y, 480, 1, k % 2 ? "#1c2a3a" : "#26384a"); if (k % 2 === 0 && k) PX.text(g, String(3 + k / 2) + "'", 4, y - 6, { font: "v", size: 14, col: G2 }); }
      // spotlight cone (on the wall, behind suspects)
      const sx = 240 + Math.round(PX.q(Math.sin(t * 0.9), 12) * 160), off = t >= none;
      if (!off) for (let y = 30; y < floor; y += 2) { const hw = 16 + Math.round((y - 30) * 0.22); PX.rect(g, sx - hw, y, hw * 2, 2, "rgba(247,201,72,.07)"); }
      const lit = (i) => !off && Math.abs(sx - XS[i]) < 50;
      // suspects rise in from below the floor
      XS.forEach((cx, i) => {
        if (t < ats[i]) return;
        const rise = Math.round((1 - PX.q(PX.p(t, ats[i], 0.4, "out"), 5)) * 130), base = floor + rise, shrug = off && t > none + 0.3;
        if (t - ats[i] < 0.1) PX.alpha(g, 0.12, () => PX.rect(g, cx - 66, 30, 132, floor - 30, C.white));
        if (i === 0) {
          const blink = PX.blink(t + 0.3, 2.2, 0.08), top = base - 105;
          PX.sprite(g, MO_ROBOT, cx - 35, top, { o: "#1c242e", g: G3, m: G2, e: blink ? G1 : C.cyan, r: C.red, y: C.yellow }, 5);
          const armY = shrug ? top + 42 : top + 55 + moBob(t, 0, 0.5) * 2;
          PX.rect(g, cx - 45, armY, 10, 32, G2); PX.rect(g, cx + 35, armY, 10, 32, G2); PX.rect(g, cx - 45, armY + 32, 10, 8, G1); PX.rect(g, cx + 35, armY + 32, 10, 8, G1);
          if (PX.blink(t, 0.8)) PX.rect(g, cx - 5, top - 2, 10, 5, C.red);
        } else if (i === 1) {
          const top = base - 120, col = C.orange, dk = "#9a4f1a", hole = WALL;
          PX.rect(g, cx - 12, base - 22, 4, 22, G2); PX.rect(g, cx + 8, base - 22, 4, 22, G2); PX.rect(g, cx - 18, base - 4, 10, 4, G3); PX.rect(g, cx + 8, base - 4, 10, 4, G3);
          for (let k = 0; k < 14; k++) PX.line(g, cx - 32 + k, top + 96, cx + 20 + k, top + 6, k < 10 ? col : dk);
          PX.circle(g, cx - 22, top + 22, 18, col); PX.circle(g, cx - 22, top + 22, 8, hole); PX.circle(g, cx + 22, top + 78, 18, col); PX.circle(g, cx + 22, top + 78, 8, hole);
          PX.rect(g, cx - 32, top + 8, 6, 3, "#ffc48a"); PX.rect(g, cx + 12, top + 64, 6, 3, "#ffc48a");
          const look = Math.floor(t / 0.7) % 2 ? 2 : -2;
          [[-10, 44], [6, 44]].forEach(([ex, ey]) => { PX.rect(g, cx + ex - 1, top + ey, 10, 10, "#1c242e"); PX.rect(g, cx + ex, top + ey + 1, 8, 8, C.white); PX.rect(g, cx + ex + 3 + look, top + ey + 3, 3, 4, "#111"); });
          if (shrug) { PX.rect(g, cx - 40, top + 50, 8, 3, "#1c242e"); PX.rect(g, cx + 32, top + 50, 8, 3, "#1c242e"); }
        } else {
          CROWD.forEach(([dx, dy, col, hat], k) => {
            const jy = (Math.floor(t / 0.3) + k) % 3 === 0 ? 4 : 0, x = cx + dx - 14, y = base - 52 + dy - jy;
            PX.person(g, x, y, { sc: 4, col, hair: ["#2b1d14", "#111", "#d9b36c", "#6b4226"][k % 4], skin: C.skin[k % 4], frame: shrug ? 0 : (Math.floor(t / 0.3) + k) % 2 });
            if (hat) { moTri(g, x + 14, y - 12, 11, 1, k % 2 ? C.pink : C.yellow); PX.rect(g, x + 13, y - 14, 3, 3, C.white); }
          });
          const bx = cx + 50, by = base - 134 + moBob(t, 0, 0.45) * 2;
          PX.line(g, cx + 48, base - 30, bx, by + 22, "#c8c8c8");
          PX.circle(g, bx, by, 20, "#c0305f"); PX.circle(g, bx - 1, by - 1, 18, C.pink); PX.rect(g, bx - 11, by - 12, 4, 4, "#ffc8e0"); moTri(g, bx, by + 20, 3, -1, "#c0305f");
          PX.text(g, "2021", bx + 1, by - 4, { size: 8, col: "#3a0820", align: "center" });
        }
        // question mark above
        const qy = (i === 1 ? floor - 150 : i === 0 ? floor - 136 : floor - 110) + rise - moBob(t, i * 0.3, 0.35) * 3;
        moT(g, "?", cx - (i === 2 ? 24 : 0), qy, { size: 16, col: lit(i) ? C.white : C.yellow, align: "center" }, "#4a3a08", 2);
        if (off && t > none + 0.3 + i * 0.1) moT(g, "?", cx + 22 - (i === 2 ? 24 : 0), qy + 8, { size: 8, col: C.yellow, align: "center" }, "#4a3a08");
      });
      PX.rect(g, 0, floor, 480, 44, "#0a0c10"); PX.rect(g, 0, floor, 480, 2, "#26384a");
      if (!off) PX.alpha(g, 0.18, () => moEllipse(g, sx, floor + 6, 56, 4, C.yellow));
      // name placards
      XS.forEach((cx, i) => {
        if (t < ats[i] + 0.3) return;
        const nm = names[i] || [""], w = 132, x = cx - w / 2, y = 232;
        PX.panel(g, x, y, w, 32, lit(i) ? C.yellow : G2, "#05070a");
        if (nm.length === 1) PX.text(g, nm[0], cx, y + 8, { size: 16, col: C.white, align: "center" });
        else nm.forEach((ln, k) => PX.text(g, ln, cx, y + 6 + k * 12, { size: 8, col: C.white, align: "center" }));
      });
      moT(g, title, 240, 8, { size: 16, col: C.yellow, align: "center" }, "#4a3a08", 2);
      moStamp(g, stamp, 240, 128, t, none, C.red, 24);
    };
  };

  // ---------------------------------------------------------------- thumb
  // o: lines (["CS IS","DEAD"]), fine ("*NOT PROVEN"), at (1.4), time ("12:07")
  K.thumb = (o) => {
    const lines = o.lines || ["CS IS", "DEAD"], fine = o.fine || "*NOT PROVEN", dur = o.time || "12:07";
    const FW = 384, FH = 216, cv = document.createElement("canvas"); cv.width = FW; cv.height = FH;
    { const c = cv.getContext("2d"), im = c.createImageData(FW, FH), cx = 120, cy = 110;
      for (let y = 0; y < FH; y++) for (let x = 0; x < FW; x++) { const a = Math.atan2(y - cy, x - cx), r = Math.floor(((a + Math.PI) / (2 * Math.PI)) * 18) % 2, dd = Math.hypot(x - cx, y - cy) / 300;
        const c1 = r ? [122, 28, 20] : [168, 56, 24], k = Math.max(0.45, 1 - dd * 0.6), i = (y * FW + x) * 4; im.data[i] = c1[0] * k; im.data[i + 1] = c1[1] * k; im.data[i + 2] = c1[2] * k; im.data[i + 3] = 255; }
      c.putImageData(im, 0, 0); }
    return (g, t, d) => {
      const at = moAt(o.at, 1.4, d, 2.6), X = 48, Y = 18 - Math.round((1 - PX.q(PX.p(t, 0, 0.25, "out"), 4)) * 240);
      PX.rect(g, X - 3, Y - 3, FW + 6, FH + 6, G2); PX.rect(g, X - 2, Y - 2, FW + 4, FH + 4, "#111");
      g.save(); g.beginPath(); g.rect(X, Y, FW, FH); g.clip();
      g.drawImage(cv, X, Y);
      // shocked face
      const fx = X + 104, fy = Y + 118, jit = Math.floor(t * 12) % 2;
      PX.rect(g, fx - 70, fy + 52, 140, 60, "#2a7f8a"); PX.rect(g, fx - 70, fy + 52, 140, 4, "#4fb3bd"); PX.rect(g, fx - 16, fy + 44, 32, 14, "#a86b3c");
      PX.circle(g, fx, fy - 10, 56, "#2b1d14");
      PX.circle(g, fx, fy + 2, 50, "#a86b3c"); PX.circle(g, fx - 3, fy, 47, "#d9a066");
      PX.rect(g, fx - 46, fy - 48, 92, 14, "#2b1d14"); PX.rect(g, fx - 36, fy - 36, 20, 6, "#2b1d14"); PX.rect(g, fx + 10, fy - 38, 26, 8, "#2b1d14");
      [-20, 20].forEach((ex) => { PX.rect(g, fx + ex - 10, fy - 30 - (ex < 0 ? 0 : 2), 20, 3, "#2b1d14"); PX.circle(g, fx + ex, fy - 10, 13, "#2b1d14"); PX.circle(g, fx + ex, fy - 10, 11, C.white); PX.rect(g, fx + ex - 2 + (jit ? 1 : -1), fy - 12, 4, 4, "#111"); });
      PX.circle(g, fx, fy + 28, 13, "#5a1010"); PX.circle(g, fx, fy + 29, 11, "#2a0606"); PX.rect(g, fx - 6, fy + 34, 12, 5, "#d05a6a");
      PX.rect(g, fx - 62, fy + 4, 16, 40, "#8a5530"); PX.rect(g, fx - 60, fy + 4, 12, 38, "#d9a066"); PX.rect(g, fx + 46, fy + 4, 16, 40, "#8a5530"); PX.rect(g, fx + 48, fy + 4, 12, 38, "#d9a066"); [fx - 60, fx + 48].forEach((hx) => { PX.rect(g, hx + 4, fy + 4, 1, 16, "#8a5530"); PX.rect(g, hx + 8, fy + 4, 1, 16, "#8a5530"); });
      if (PX.blink(t, 0.4)) { PX.rect(g, fx + 32, fy - 34, 5, 7, "#7fd8ff"); PX.rect(g, fx + 33, fy - 37, 3, 3, "#7fd8ff"); }
      // big text
      const sh = Math.floor(t * 10) % 2;
      moOut(g, lines[0], X + 222 + sh, Y + 30, { size: 32, col: C.white }, "#111", 2);
      moOut(g, lines[1] || "", X + 186 - sh, Y + 74, { size: 48, col: C.red }, "#111", 3);
      PX.text(g, lines[1] || "", X + 186 - sh, Y + 74, { size: 48, col: C.red });
      if (t >= at + 0.03) { const s = PX.typed(fine, t, at, 40); PX.rect(g, X + 228, Y + 132, PX.tw(g, s, { size: 8 }) + 6, 12, "rgba(0,0,0,.6)"); PX.text(g, s, X + 231, Y + 134, { size: 8, col: C.white }); }
      // red arrow pointing at the face
      const ax = X + 196 + (Math.floor(t / 0.2) % 2 ? 0 : 6), ay = Y + 170;
      PX.rect(g, ax + 14, ay - 8, 72, 16, "#111"); moTriL(g, ax - 3, ay, 19, "#111");
      PX.rect(g, ax + 16, ay - 6, 68, 12, C.red); moTriL(g, ax, ay, 16, C.red); PX.rect(g, ax + 16, ay - 6, 68, 3, "#ff9a9a");
      // duration badge + play bar
      const tw = PX.tw(g, dur, { font: "v", size: 16 }); PX.rect(g, X + FW - tw - 12, Y + FH - 26, tw + 8, 15, "rgba(0,0,0,.8)"); PX.text(g, dur, X + FW - tw - 8, Y + FH - 26, { font: "v", size: 16, col: C.white });
      const pp = Math.round(PX.clamp(t / d, 0, 1) * (FW - 8) * 0.7);
      PX.rect(g, X, Y + FH - 6, FW, 6, "rgba(0,0,0,.55)"); PX.rect(g, X + 4, Y + FH - 4, FW - 8, 2, "#6a6a6a"); PX.rect(g, X + 4, Y + FH - 4, pp, 2, "#ff2a2a"); PX.circle(g, X + 4 + pp, Y + FH - 3, 3, "#ff2a2a");
      g.restore();
    };
  };
})();
