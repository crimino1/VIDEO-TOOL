/* Builder A: cold open + intro scene kinds.
   calendar, money, chatbot, race, chair, robot_sink, warning, feed, sheet, logo, shatter, two_students */
(function () {
  const { K, C } = PX;
  const R = Math.round, F = Math.floor;

  // ---------- shared helpers (open file only) ----------
  const T = (g, s, x, y, col, size, align, font) => PX.text(g, s, x, y, { col, size, align, font });
  // text with a dark drop shadow (stays readable over stars)
  const TS = (g, s, x, y, col, size, align, font, sh) => {
    const o = size >= 16 && font !== "v" ? 2 : 1;
    T(g, s, x + o, y + o, sh || "#000", size, align, font); T(g, s, x, y, col, size, align, font);
  };
  // filled rect with pixel-rounded corners
  const INS = { 1: [1], 2: [2, 1], 3: [3, 1, 1], 4: [4, 2, 1, 1], 6: [6, 4, 3, 2, 1, 1] };
  const RR = (g, x, y, w, h, col, r) => {
    const ins = INS[r || 2];
    ins.forEach((k, i) => { PX.rect(g, x + k, y + i, w - 2 * k, 1, col); PX.rect(g, x + k, y + h - 1 - i, w - 2 * k, 1, col); });
    PX.rect(g, x, y + ins.length, w, h - 2 * ins.length, col);
  };
  // 3-stage pop size: big -> mid -> base (all multiples of 8 for Press Start 2P)
  const popSz = (k, base) => (k < 0.06 ? base * 2 : k < 0.12 ? base + 8 : base);
  // rubber stamp that slams on at `at` (scale pop + specks); outer border blinks afterwards
  const stamp = (g, s, cx, cy, t, at, col, size) => {
    if (t < at) return;
    const k = t - at, sz = popSz(k, size);
    const w = R(PX.tw(g, s, { size: sz }) + sz * 1.2), h = R(sz * 2.1), x = R(cx - w / 2), y = R(cy - h / 2);
    PX.rect(g, x, y, w, h, "rgba(46,0,6,.82)");
    if (k < 0.3 || PX.blink(t, 0.5, 0.7)) { PX.box(g, x, y, w, h, col); PX.box(g, x + 1, y + 1, w - 2, h - 2, col); }
    PX.box(g, x + 4, y + 4, w - 8, h - 8, col);
    T(g, s, cx, R(cy - sz / 2), col, sz, "center");
    const r = PX.rnd(31); // worn-ink specks
    for (let i = 0; i < 14; i++) PX.rect(g, x + 6 + r() * (w - 14), y + 6 + r() * (h - 14), 1 + F(r() * 2), 1, "rgba(46,0,6,.9)");
    if (k < 0.18) for (let i = 0; i < 10; i++) { const a = i * 0.628, rr = w / 2 + 6 + k * 120; PX.rect(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.4, 3, 3, col); }
  };
  // PX.person with solid dark eyes (the engine sprite leaves them transparent)
  const P = (g, x, y, o) => { const sc = o.sc || 1; PX.rect(g, x + sc, y + 3 * sc, 5 * sc, sc, "#1b2430"); PX.person(g, x, y, o); };
  const S = (g, rows, x, y, pal, sc, flip) => PX.sprite(g, rows, R(x), R(y), pal, sc, flip);
  // speech bubble with a glyph, tail down
  const bubble = (g, cx, y, ch, col, big) => {
    const s = big ? 24 : 16, w = s + 12, h = s + 10, x = R(cx - w / 2);
    RR(g, x, y, w, h, "#e8f1f2", 2); RR(g, x + 1, y + 1, w - 2, h - 2, "#101c28", 2);
    PX.rect(g, cx - 2, y + h - 1, 5, 2, "#e8f1f2"); PX.rect(g, cx - 1, y + h + 1, 3, 2, "#e8f1f2"); PX.rect(g, cx, y + h + 3, 1, 1, "#e8f1f2");
    PX.rect(g, cx - 1, y + h - 1, 3, 1, "#101c28");
    T(g, ch, cx + 1, y + 6, col, s, "center");
  };

  // ======================================================================
  // calendar: tear-off desk calendar 2026 -> 2027, BAD NEWS stamp
  // o: from ("2026"), to ("2027"), flip (0.36d), bad (0.69d), stamp ("BAD NEWS")
  const CAP = ["....k....", "..kkkkk..", "kkkkkkkkk", "..kkkkk.y", "...kkk..y", "...kkk.yy"];
  K.calendar = (o) => {
    const PW = 196, PH = 176;
    const pc = document.createElement("canvas"); pc.width = PW; pc.height = PH; const pg = pc.getContext("2d");
    const y1 = String(o.from || "2026"), y2 = String(o.to || "2027");
    const page = (c, yr, t, capAt, day) => {
      PX.rect(c, 0, 0, PW, PH, "#aeb8c2"); PX.rect(c, 0, 0, PW, 1, "#d2dae1");
      PX.rect(c, PW - 3, 0, 3, PH, "#8794a1"); PX.rect(c, 0, PH - 3, PW, 3, "#8794a1");
      PX.rect(c, 0, 0, PW, 22, "#c8323a"); PX.rect(c, 0, 0, PW, 2, "#e45a61"); PX.rect(c, 0, 20, PW, 2, "#8e1f26");
      T(c, "YEAR", PW / 2, 8, "#ffe0e0", 8, "center");
      const x0 = R(PW / 2 - yr.length * 20);
      for (let i = 0; i < yr.length; i++) {
        T(c, yr[i], x0 + i * 40 + 3, 37, "#7a8693", 40);
        T(c, yr[i], x0 + i * 40, 34, capAt !== undefined && i === yr.length - 1 ? "#c8323a" : "#1b2430", 40);
      }
      if (capAt !== undefined && t >= capAt) {
        const k = t - capAt, sc = k < 0.06 ? 7 : k < 0.12 ? 6 : 4, b = k > 0.12 && PX.blink(t, 0.6) ? -2 : 0;
        S(c, CAP, PW / 2 - 4.5 * sc, 96 - 3 * sc + b, { k: "#1b2430", y: "#d99a1a" }, sc);
      }
      const grid = true;
      for (let r = 0; r < 3 && grid; r++) for (let q = 0; q < 7; q++) {
        const x = 22 + q * 22, y = 116 + r * 17;
        PX.rect(c, x, y, 16, 12, "#8794a1"); PX.rect(c, x, y, 16, 1, "#c3ccd5");
      }
      // red "today" box racing through the days (year running out)
      if (grid && day >= 0) { const q = day % 7, r = F(day / 7); PX.box(c, 20 + q * 22, 114 + r * 17, 20, 16, "#c8323a"); PX.box(c, 21 + q * 22, 115 + r * 17, 18, 14, "#c8323a"); }
    };
    return (g, t, d) => {
      const flip = o.flip ?? 0.36 * d, bad = o.bad ?? 0.69 * d;
      const pin = PX.q(PX.p(t, 0, 0.5, "back"), 10), oy = R((1 - pin) * -150);
      let sh = 0;
      if (t > bad && t < bad + 0.25) sh = F(t * 40) % 2 ? 3 : -3; else if (t > flip && t < flip + 0.1) sh = 1;
      const bx = 128 + sh, by = 30 + oy, px = bx + 14, py = by + 22;
      // desk
      PX.rect(g, 30, 246, 420, 3, "#8a5a3c"); PX.rect(g, 30, 249, 420, 9, "#5a3a24"); PX.rect(g, 30, 258, 420, 2, "#3e2818");
      // backing board
      PX.rect(g, bx, by, 224, 216, "#3a4654"); PX.rect(g, bx, by, 224, 2, "#5a6b78");
      PX.rect(g, bx + 221, by, 3, 216, "#2a333d"); PX.rect(g, bx, by + 213, 224, 3, "#2a333d");
      // page stack thickness
      PX.rect(g, px + 2, py + PH, PW, 2, "#9aa5b0"); PX.rect(g, px + 4, py + PH + 2, PW - 2, 2, "#7d8894");
      // page underneath (next year)
      g.save(); g.translate(px, py); page(g, y2, t, flip + 0.3); g.restore();
      // top page (this year): dog-ear lifts, then tears and falls
      if (t < flip + 1.2) {
        page(pg, y1, t, undefined, Math.min(20, F(PX.clamp((t - 0.4) / (flip - 0.6), 0, 1) * 21)));
        if (t < flip) {
          const f = R(PX.q(PX.p(t, flip - 0.7, 0.7, "in"), 7) * 44);
          for (let i = 0; i < f; i++) pg.clearRect(PW - (f - i), PH - 1 - i, f - i, 1);
          for (let j = 0; j < f; j++) { PX.rect(pg, PW - f, PH - f + j, f - j, 1, "#d2dae1"); PX.rect(pg, PW - f + (f - j) - 1, PH - f + j, 1, 1, "#5a6b78"); }
          g.drawImage(pc, px, py);
        } else {
          for (let x = 0; x < PW; x += 6) pg.clearRect(x, 0, 3, 3);
          const k = t - flip, dy = R(k < 0.08 ? -3 : 700 * (k - 0.08) * (k - 0.08)), dx = R(70 * k), s = 0.5 * k;
          for (let j = 0; j < PH; j += 2) g.drawImage(pc, 0, j, PW, 2, px + dx + R(j * s), py + dy + j, PW, 2);
        }
      }
      if (t >= flip) for (let x = 0; x < PW; x += 6) { PX.rect(g, px + x, py, 3, 3, "#aeb8c2"); PX.rect(g, px + x + 3, py, 3, 1, "#aeb8c2"); }
      // binder rings
      for (const rx of [px + 44, px + PW - 52]) {
        PX.rect(g, rx, py - 10, 8, 18, "#8b9bab"); PX.rect(g, rx, py - 10, 2, 18, "#c9d3dc");
        PX.rect(g, rx + 6, py - 10, 2, 18, "#5a6b78"); PX.rect(g, rx + 2, py - 6, 4, 6, "#1b2430");
      }
      stamp(g, o.stamp || "BAD NEWS", px + PW / 2, py + 136, t, bad, C.red, 24);
    };
  };

  // ======================================================================
  // money: wallet spits coins, YR1-YR4 bar, TUITION $ counter
  // o: years ([4 times], spread over d), max (99999), label ("TUITION")
  const COINF = [
    [".yyy.", "yyoyy", "yoyoy", "yyoyy", ".yyy."],
    [".y.", "yoy", "yoy", "yoy", ".y."],
    ["o", "o", "o", "o", "o"],
    [".y.", "yoy", "yoy", "yoy", ".y."],
  ];
  const MOTH = [["w.....w", "ww.b.ww", ".wbbbw.", "..b.b.."], [".......", "wwwbwww", ".wbbbw.", "..b.b.."]];
  const fmtN = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  K.money = (o) => {
    const r = PX.rnd(11), J = [...Array(80)].map(() => [r(), r(), r()]);
    return (g, t, d) => {
      const yrs = o.years || [0, 1, 2, 3].map((i) => d * (0.08 + i * 0.21)), fd = 0.55, max = o.max ?? 99999;
      const segP = yrs.map((a) => PX.q(PX.p(t, a, fd, "lin"), 8));
      const done = segP.filter((p) => p >= 1).length, frac = segP.reduce((a, b) => a + b, 0) / 4;
      const spawnEnd = Math.min(d - 0.4, yrs[3] + fd);
      const wy = t > 0.2 && t < spawnEnd && F((t - 0.2) / 0.13) % 2 ? 1 : 0;
      // back of wallet
      PX.rect(g, 26, 104 + wy, 168, 116, "#5a3a24"); PX.rect(g, 26, 104 + wy, 168, 3, "#6e4630"); PX.rect(g, 32, 110 + wy, 156, 36, "#3e2818");
      // bills left (one disappears per finished year)
      for (let i = 0; i < 4 - done; i++) {
        const x = 36 + i * 6, y = 88 + i * 9 + wy;
        PX.rect(g, x, y, 136, 62, "#2b7a45"); PX.rect(g, x + 1, y + 1, 134, 60, "#3a9a5a"); PX.rect(g, x + 1, y + 1, 134, 2, "#5fc27e");
        PX.box(g, x + 4, y + 5, 128, 50, "#2b7a45"); PX.circle(g, x + 68, y + 22, 9, "#2b7a45"); T(g, "$", x + 69, y + 15, "#1f5a34", 16, "center");
      }
      // coins arcing out toward the counter
      for (let i = 0; i < 80; i++) {
        const t0 = 0.2 + i * 0.13; if (t0 > spawnEnd) break;
        const u = (t - t0) / 0.9; if (u < 0 || u > 1) continue;
        if (u > 0.82 && F(t * 25) % 2) continue;
        const uq = PX.q(u, 18), j = J[i];
        const x = PX.lerp(70 + j[0] * 90, 206 + j[1] * 70, uq), y = PX.lerp(140, 70 + j[2] * 60, uq) - (40 + j[2] * 40) * 4 * uq * (1 - uq);
        const fr = COINF[F((t - t0) * 14 + j[0] * 4) % 4], w = fr[0].length;
        S(g, fr, x - w * 2, y, { y: C.yellow, o: "#b8860b" }, 4);
      }
      // front pocket + snap tab
      const fy = 150 + wy;
      RR(g, 20, fy, 180, 78, "#5a3a24", 4); RR(g, 21, fy, 178, 76, "#8a5a3c", 4);
      PX.rect(g, 24, fy, 172, 4, "#a8724a"); PX.rect(g, 24, fy + 70, 172, 5, "#6e4630");
      for (let x = 30; x < 190; x += 7) { PX.rect(g, x, fy + 8, 4, 1, "#c89a6a"); PX.rect(g, x, fy + 66, 4, 1, "#c89a6a"); }
      for (let y = fy + 12; y < fy + 64; y += 7) PX.rect(g, 28, y, 1, 4, "#c89a6a");
      RR(g, 140, fy + 20, 66, 30, "#3e2818", 3); RR(g, 140, fy + 19, 64, 29, "#6e4630", 3); PX.rect(g, 143, fy + 19, 58, 2, "#8a5a3c");
      PX.circle(g, 186, fy + 33, 6, "#b8860b"); PX.circle(g, 186, fy + 33, 4, C.yellow); PX.rect(g, 184, fy + 31, 2, 2, "#fff3b0");
      // moth gag once the money is gone
      const mt = t - (yrs[3] + fd + 0.15);
      if (mt > 0) { const mx = 96 - mt * 30 + Math.sin(mt * 9) * 8, my = 118 - mt * 50; S(g, MOTH[F(t * 10) % 2], mx, my, { w: "#b8ad9a", b: "#6a5a48" }, 4); }
      // counter
      PX.panel(g, 214, 34, 250, 104, C.cyan);
      TS(g, o.label || "TUITION", 228, 46, C.yellow, 8);
      TS(g, "$" + fmtN(R(max * frac)), 339, 78, C.white, 32, "center");
      // 4-year progress bar
      PX.box(g, 213, 167, 252, 34, C.dim);
      for (let i = 0; i < 4; i++) {
        const x = 216 + i * 62, w = R(58 * segP[i]);
        PX.rect(g, x, 170, 58, 28, "#14283a");
        if (w > 0) { PX.rect(g, x, 170, w, 28, C.yellow); PX.rect(g, x, 170, w, 3, "#ffe28a"); PX.rect(g, x, 195, w, 3, "#b8860b"); }
        TS(g, "YR" + (i + 1), x + 29, 208, segP[i] > 0 ? C.white : C.dim, 8, "center");
      }
    };
  };

  // ======================================================================
  // chatbot: laptop chat, prompt types, code streams, stopwatch 00:00 -> 00:11, DONE
  // o: prompt ("DO MY CS HOMEWORK"), ask (0.3), done (d-0.6), secs (11)
  const BOT = [".cccccccc.", "cddddddddc", "cdwwddwwdc", "cdwwddwwdc", "cddddddddc", "cddwwwwddc", "cddddddddc", ".cccccccc."];
  K.chatbot = (o) => {
    const r = PX.rnd(5), COLS = [C.pink, C.cyan, C.yellow, C.green, C.purple, C.orange, "#8b9bab"];
    const LINES = []; let ind = 0;
    for (let i = 0; i < 60; i++) {
      const toks = [], n = 2 + F(r() * 3);
      for (let k = 0; k < n; k++) toks.push([8 + F(r() * 7) * 5, COLS[F(r() * COLS.length)]]);
      LINES.push([ind, toks]);
      ind = Math.max(0, Math.min(3, ind + (r() < 0.35 ? 1 : r() < 0.5 ? -1 : 0)));
    }
    return (g, t, d) => {
      const prompt = o.prompt || "DO MY CS HOMEWORK", ask = o.ask ?? 0.3, done = o.done ?? d - 0.6, secs = o.secs ?? 11;
      const typeEnd = ask + prompt.length / 20, codeStart = typeEnd + 0.35;
      // lid
      const lx = 36, ly = 32, lw = 304, lh = 178;
      RR(g, lx, ly, lw, lh, "#3a4654", 3); PX.rect(g, lx + 3, ly, lw - 6, 2, "#5a6b78"); PX.rect(g, lx + lw - 3, ly + 3, 2, lh - 6, "#2a333d");
      PX.rect(g, lx + lw / 2 - 1, ly + 5, 3, 3, "#1b2430");
      const sx = lx + 10, sy = ly + 12, sw = lw - 20, sh = lh - 20;
      PX.rect(g, sx, sy, sw, sh, "#0b1622");
      // base / keyboard
      for (let i = 0; i < 24; i++) { const k = R(i / 2); PX.rect(g, lx - k, ly + lh + i, lw + 2 * k, 1, i < 2 ? "#8b9bab" : i > 20 ? "#2a333d" : "#5a6b78"); }
      for (let row = 0; row < 2; row++) for (let x = lx + 8 - row * 2; x < lx + lw - 10; x += 12) PX.rect(g, x, ly + lh + 4 + row * 6, 9, 4, "#3a4654");
      PX.rect(g, lx + lw / 2 - 28, ly + lh + 16, 56, 4, "#4a5a68");
      // chat window header
      PX.rect(g, sx, sy, sw, 12, "#14283a");
      [C.red, C.yellow, C.green].forEach((c, i) => PX.rect(g, sx + 6 + i * 7, sy + 4, 4, 4, c));
      // user bubble
      if (t >= ask) {
        const tw = PX.tw(g, prompt), w = tw + 14, x = sx + sw - 8 - w, y = sy + 20;
        RR(g, x, y, w, 20, "#5b3bb0", 2); PX.rect(g, x + 2, y, w - 4, 1, "#9a7cf0"); PX.rect(g, x + w - 6, y + 20, 4, 3, "#5b3bb0");
        const s = PX.typed(prompt, t, ask, 20); T(g, s, x + 7, y + 6, C.white, 8);
        if (t < typeEnd + 0.4 && PX.blink(t, 0.3)) PX.rect(g, x + 7 + PX.tw(g, s), y + 5, 6, 10, C.white);
      }
      // bot answer
      if (t >= typeEnd) {
        S(g, BOT, sx + 8, sy + 50, { c: C.cyan, d: "#14283a", w: "#bff6f8" }, 2);
        const bx = sx + 34, by = sy + 48;
        if (t < codeStart) {
          RR(g, bx, by, 40, 16, "#14283a", 2);
          for (let i = 0; i < 3; i++) if (F((t - typeEnd) * 10) % 3 === i) PX.rect(g, bx + 9 + i * 9, by + 6, 4, 4, C.cyan); else PX.rect(g, bx + 9 + i * 9, by + 6, 4, 4, "#2a4a62");
        } else {
          const bw = sw - 42, bh = sh - 56;
          RR(g, bx, by, bw, bh, "#2a4a62", 2); RR(g, bx + 1, by + 1, bw - 2, bh - 2, "#101e2c", 2);
          const tEnd = Math.min(t, done), nf = (tEnd - codeStart) / 0.11, nShown = Math.min(LINES.length, F(nf) + 1);
          const first = Math.max(0, nShown - 10);
          for (let i = first; i < nShown; i++) {
            const [id, toks] = LINES[i], y = by + 7 + (i - first) * 9;
            PX.rect(g, bx + 5, y, 3, 4, "#2a4a62");
            let x = bx + 12 + id * 10, lim = i === nShown - 1 && t < done ? bx + 12 + id * 10 + (nf - F(nf)) * 150 : 1e9;
            for (const [w, c] of toks) { const ww = Math.min(w, lim - x, bx + bw - 6 - x); if (ww > 0) PX.rect(g, x, y, ww, 4, c); x += w + 4; }
          }
        }
      }
      // stopwatch
      const cx = 412, cy = 100, ok = t >= done;
      const ring = ok && PX.blink(t - done, 0.3) ? C.green : "#8b9bab";
      PX.rect(g, cx - 6, cy - 44, 12, 6, ring); PX.rect(g, cx - 3, cy - 38, 6, 5, "#5a6b78");
      PX.rect(g, cx + 22, cy - 30, 7, 6, "#5a6b78");
      PX.circle(g, cx, cy, 33, ring); PX.circle(g, cx, cy, 29, "#0b1622");
      for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; PX.rect(g, cx + Math.sin(a) * 24 - 1, cy - Math.cos(a) * 24 - 1, 2, 2, i % 3 ? "#5a6b78" : C.ink); }
      const el = secs * PX.clamp((t - ask) / (done - ask), 0, 1), a = (PX.q(el, 4) / 12) * 6.283;
      PX.line(g, cx, cy, cx + Math.sin(a) * 21, cy - Math.cos(a) * 21, C.orange);
      PX.rect(g, cx - 1, cy - 1, 3, 3, C.ink);
      const ss = String(F(el)).padStart(2, "0");
      if (!ok || PX.blink(t - done, 0.3, 0.7)) TS(g, "00:" + ss, cx, 146, ok ? C.green : C.white, 16, "center");
      if (ok) TS(g, "DONE", cx, 174, C.green, popSz(t - done, 16), "center");
    };
  };

  // ======================================================================
  // race: PHILOSOPHY breaks the HIRED tape, COMP SCI lags and sweats
  // o: win (2.2), a ("PHILOSOPHY"), b ("COMP SCI"), sign ("HIRED")
  // name tag: dark plate with coloured border
  const tag = (g, s, cx, y, col) => { const w = PX.tw(g, s) + 8, x = R(cx - w / 2); PX.rect(g, x, y, w, 13, "#05080c"); PX.box(g, x, y, w, 13, col); T(g, s, cx, y + 3, col, 8, "center"); };
  K.race = (o) => {
    const r = PX.rnd(23), CROWD = [], CONF = [];
    const CC = ["#7a3a5a", "#2a6a72", "#7a6a2a", "#2a6a3a", "#7a4a2a", "#4a3a7a"], FC = [C.pink, C.cyan, C.yellow, C.green, C.orange, C.purple];
    for (let row = 0; row < 3; row++) for (let x = 3 + (row % 2) * 4; x < 480; x += 8) CROWD.push([x, 66 + row * 12, CC[F(r() * CC.length)], r()]);
    for (let i = 0; i < 50; i++) CONF.push([r(), r(), FC[F(r() * FC.length)]]);
    return (g, t, d) => {
      const win = o.win ?? 0.69 * d, FX = 404;
      // stands + muted crowd (wave; cheers after the win)
      for (let row = 0; row < 3; row++) { PX.rect(g, 0, 62 + row * 12, 480, 12, row % 2 ? "#101a24" : "#141f2c"); PX.rect(g, 0, 73 + row * 12, 480, 1, "#1e3040"); }
      for (const [x, y, c, ph] of CROWD) {
        const up = t > win ? (F(t * 8 + ph * 4) % 2) * 2 : (F(t * 3 - x / 50) % 5 === 0 ? 2 : 0);
        PX.rect(g, x, y - up, 3, 3, "#8a6a52"); PX.rect(g, x - 1, y + 3 - up, 5, 5, c);
      }
      // grass + track
      PX.rect(g, 0, 98, 480, 12, "#1f6b3a"); PX.rect(g, 0, 98, 480, 2, "#2a8a4a");
      PX.rect(g, 0, 110, 480, 150, "#8a3a2a");
      for (let i = 0; i < 90; i++) PX.rect(g, (i * 53) % 480, 114 + ((i * 29) % 142), 2, 1, "#9a4836");
      for (const y of [110, 182, 256]) PX.rect(g, 0, y, 480, 2, "#cfd6dd");
      PX.rect(g, 0, 258, 480, 12, "#1f6b3a"); PX.rect(g, 0, 258, 480, 2, "#2a8a4a");
      // finish line (checkered, slanted)
      for (let y = 112; y < 256; y++) { const x = FX - 2 + R(((y - 112) * 16) / 144), b = F((y - 112) / 5) % 2; PX.rect(g, x, y, 5, 1, b ? "#e8f1f2" : "#1b2430"); PX.rect(g, x + 5, y, 5, 1, b ? "#1b2430" : "#e8f1f2"); }
      // sign gantry
      const lit = t >= win && PX.blink(t - win, 0.3, 0.6);
      PX.rect(g, FX - 4, 46, 3, 66, "#8b9bab"); PX.rect(g, FX - 4, 46, 1, 66, "#c9d3dc");
      PX.panel(g, FX - 62, 12, 116, 36, lit ? C.green : "#2a8a4a", "#0b1a12");
      TS(g, o.sign || "HIRED", FX - 4, 22, lit ? C.green : "#3aa860", 16, "center");
      // front post + tape
      PX.rect(g, FX + 18, 180, 4, 78, "#8b9bab");
      for (let y = 184; y < 256; y += 8) PX.rect(g, FX + 18, y, 4, 4, C.red);
      for (let y = 50; y < 110; y += 8) PX.rect(g, FX - 4, y, 3, 4, C.red);
      const tl = (x1, y1, x2, y2) => { PX.line(g, x1, y1, x2, y2, C.red); PX.line(g, x1 + 1, y1, x2 + 1, y2, "#ffb0b0"); PX.line(g, x1 + 2, y1, x2 + 2, y2, C.red); };
      if (t < win) tl(FX - 3, 76, FX + 18, 182);
      else { const w = F(t * 10) % 2; tl(FX - 3, 76, FX + 4 + w * 3, 106); tl(FX + 18, 182, FX + 10 - w * 3, 210); }
      // runners (sc 6 = 42x78)
      const phx = t < win ? 56 + (FX - 34 - 56) * Math.max(0, t) / win : FX - 34 + 48 * (1 - Math.exp(-(t - win) * 7));
      const csx = 6 + 68 * Math.max(0, t);
      const phRun = t < win + 0.4, phy = phRun ? F(t / 0.12) % 2 * 2 : (PX.blink(t, 0.36) ? -10 : 0);
      P(g, R(phx), 98 + phy, { sc: 6, col: C.yellow, frame: phRun ? F(t / 0.12) % 2 : 0, hair: "#6b4226", pants: "#3a3a5a" });
      tag(g, o.a || "PHILOSOPHY", Math.min(430, R(phx + 21)), 82 + phy, C.yellow);
      const csb = F(t / 0.2) % 2;
      P(g, R(csx), 172 + csb * 2, { sc: 6, col: C.cyan, frame: csb, skin: PX.C.skin[0] });
      tag(g, o.b || "COMP SCI", R(csx + 21), 156 + csb * 2, C.cyan);
      // sweat drops flying off the CS runner
      for (let k = 0; k < 7; k++) {
        const per = 0.9, tt = t + k * (per / 7), ph = (tt % per) / per;
        if (tt < per && t < 0.25) continue;
        const sxp = csx + 6 - ph * 30 - (k % 2) * 8, syp = 178 - ph * 16 + ph * ph * 50;
        PX.rect(g, sxp, syp, 3, 4, "#9fd8ff"); PX.rect(g, sxp, syp, 1, 1, "#e8f8ff");
      }
      // confetti after the win
      if (t > win) for (const [a, b, c] of CONF) { const k = t - win, x = FX - 90 + a * 180 + Math.sin(k * 6 + b * 9) * 4, y = 40 + b * 20 + k * 70 * (0.6 + a); if (y < 110) PX.rect(g, x, y, 3, 3, c); }
    };
  };

  // ======================================================================
  // chair: CHAIR.EXISTS = TRUE/FALSE flipping, chair dithers, two philosophers
  // o: per (0.45), start (0.4), label ("CHAIR.EXISTS =")
  const CHAIR = [
    "...LLLLLLLLLL...",
    "...LMMMMMMMMD...",
    "...LM......MD...",
    "...LM.L..L.MD...",
    "...LM.M..M.MD...",
    "...LM.M..M.MD...",
    "...LM.M..M.MD...",
    "...LM.M..M.MD...",
    "...LMMMMMMMMD...",
    "...LM......MD...",
    "..LLLLLLLLLLLL..",
    ".LLMMMMMMMMMMMD.",
    "LLMMMMMMMMMMMMDD",
    "MMMMMMMMMMMMMMMD",
    "DDDDDDDDDDDDDDDD",
    ".LM..........MD.",
    ".LM.L......M.MD.",
    ".LM.M......M.MD.",
    ".LM.M......D.MD.",
    ".LM.M......D.MD.",
    ".LM.D......D.MD.",
    ".LM..........MD.",
    ".DD..........DD.",
  ];
  const PHILO = [
    "...hhh...", "..hssh...", "..sesse..", "..sssss..", "..wwwww..", "..wwwww..", "...www...",
    ".ttttttt.", "tt.ttt.tt", "s.ttttt.s", "..ttttt..", "..tTttt..", "..ttTtt..", "..s...s..", ".bb...bb.",
  ];
  const CHPAL = { L: "#c08a5a", M: "#8a5a3c", D: "#5a3a24" };
  // sprite with a per-pixel mask (dither)
  const spriteMask = (g, rows, x, y, pal, sc, keep) => {
    for (let r = 0; r < rows.length; r++) for (let c = 0; c < rows[r].length; c++) {
      const col = pal[rows[r][c]]; if (!col) continue;
      g.fillStyle = col;
      for (let yy = 0; yy < sc; yy++) for (let xx = 0; xx < sc; xx++) { const X = x + c * sc + xx, Y = y + r * sc + yy; if (keep(X, Y)) g.fillRect(X, Y, 1, 1); }
    }
  };
  K.chair = (o) => (g, t, d) => {
    const per = o.per ?? 0.45, st = o.start ?? 0.4;
    const n = t < st ? 0 : F((t - st) / per) + 1, on = n % 2 === 0, ph = t < st ? 0 : (t - st) % per;
    // floor
    PX.rect(g, 20, 210, 440, 2, "#3a4654"); PX.rect(g, 20, 212, 440, 1, "#1b2430");
    // chair (sc 6 -> 96x138)
    const sc = 6, cx = 192, cy = 72;
    PX.rect(g, cx + 6, 208, 84, 3, "rgba(0,0,0,.5)");
    if (on) S(g, CHAIR, cx, cy, CHPAL, sc);
    else if (ph < 0.1) spriteMask(g, CHAIR, cx, cy, CHPAL, sc, (X, Y) => (X + Y + F(t * 30)) % 2 === 0);
    else spriteMask(g, CHAIR, cx, cy, { L: "#5fe3e8", M: "#2a9fad", D: "#1b5a66" }, sc, (X, Y) => X % 2 === 0 && (Y + F(t * 16)) % 3 === 0);
    // label
    const lab = o.label || "CHAIR.EXISTS =", val = on ? "TRUE" : "FALSE";
    const lw = PX.tw(g, lab + " ", { size: 16 }), tot = lw + PX.tw(g, "FALSE", { size: 16 }), x0 = R(240 - tot / 2);
    TS(g, lab, x0, 26, C.cyan, 16);
    TS(g, val, x0 + lw, 26, on ? C.green : C.red, ph < 0.06 && t >= st ? 24 : 16);
    // philosophers
    const pal = { h: "#8b9bab", s: PX.C.skin[1], e: "#1b2430", w: "#aab4be", t: "#6f86b0", T: "#4a5f88", b: "#5a3a24" };
    const pal2 = Object.assign({}, pal, { t: "#b07a4a", T: "#7a5232", s: PX.C.skin[2] });
    const b1 = PX.blink(t, 0.5) ? 2 : 0, b2 = PX.blink(t + 0.25, 0.5) ? 2 : 0;
    S(g, PHILO, 54, 150 + b1, pal, 4);
    S(g, PHILO, 390, 150 + b2, pal2, 4, true);
    bubble(g, 72, 108 + (on ? 0 : -4), "?", C.yellow, !on && ph < 0.12 && t >= st);
    bubble(g, 408, 108 + (on ? -4 : 0), "!", C.pink, on && ph < 0.12 && t >= st);
  };

  // ======================================================================
  // robot_sink: boxy robot crawls under a sink, gets stuck, ERROR: CANNOT FIT
  // o: err (0.53d), msg ("ERROR: CANNOT FIT")
  const WRENCH = ["HH..........", "H.H.........", "..HHHHHHHHHG", "H.H.......GG", "HH.........."];
  const pipe = (g, x, y, w, h) => {
    PX.rect(g, x, y, w, h, "#8b9bab");
    if (w <= h) { PX.rect(g, x, y, 2, h, "#c9d3dc"); PX.rect(g, x + w - 2, y, 2, h, "#5a6b78"); }
    else { PX.rect(g, x, y, w, 2, "#c9d3dc"); PX.rect(g, x, y + h - 2, w, 2, "#5a6b78"); }
  };
  K.robot_sink = (o) => (g, t, d) => {
    const err = o.err ?? 0.53 * d, inT = 1.1, stuck = t > inT;
    const jit = stuck ? (F(t * 18) % 2 ? 3 : -1) : 0, pj = stuck ? F(t * 18) % 2 : 0;
    // floor tiles
    for (let y = 226; y < 270; y += 11) for (let x = 0; x < 480; x += 16) PX.rect(g, x + ((y / 11) % 2) * 8, y, 15, 10, ((x / 16 + y / 11) % 2) ? "#121c28" : "#18263a");
    PX.rect(g, 0, 226, 480, 1, "#2a3a4c");
    // backsplash tiles
    for (let y = 40; y < 66; y += 9) for (let x = 14; x < 340; x += 12) PX.rect(g, x, y, 11, 8, "#162434");
    // counter + basin slot
    PX.rect(g, 14, 66, 326, 10, "#8b9bab"); PX.rect(g, 14, 66, 326, 2, "#c9d3dc"); PX.rect(g, 14, 74, 326, 2, "#5a6b78");
    PX.rect(g, 112, 66, 120, 3, "#2a333d");
    // faucet + drip
    PX.rect(g, 176, 46, 7, 20, "#8b9bab"); PX.rect(g, 176, 46, 2, 20, "#c9d3dc");
    PX.rect(g, 156, 42, 27, 6, "#8b9bab"); PX.rect(g, 156, 42, 27, 2, "#c9d3dc"); PX.rect(g, 156, 48, 5, 4, "#5a6b78");
    PX.rect(g, 188, 56, 10, 4, C.red); PX.rect(g, 161, 56, 10, 4, C.blue);
    const dp = (t % 0.7) / 0.7; if (dp < 0.6) PX.rect(g, 157, 53 + R(dp * 14), 2, 3, "#6fc3ff");
    // cabinet
    PX.rect(g, 36, 76, 280, 150, "#6a4430"); PX.rect(g, 36, 76, 280, 2, "#86583a"); PX.rect(g, 312, 76, 4, 150, "#5a3a24");
    PX.rect(g, 46, 84, 260, 130, "#0a1018"); PX.rect(g, 46, 84, 260, 6, "#05080c"); PX.rect(g, 46, 84, 6, 130, "#070b10");
    PX.rect(g, 36, 214, 280, 12, "#553624"); PX.rect(g, 36, 214, 280, 1, "#86583a");
    // open doors
    for (const [x, kx] of [[4, 30], [316, 318]]) {
      PX.rect(g, x, 72, 32, 158, "#553624"); PX.rect(g, x + 4, 80, 24, 142, "#6a4430"); PX.rect(g, x + 4, 80, 24, 2, "#86583a");
      PX.rect(g, kx, 144, 3, 10, "#c9d3dc");
    }
    // spray bottle + soap box
    PX.rect(g, 62, 178, 16, 36, C.pink); PX.rect(g, 62, 178, 3, 36, "#ff8cc4"); PX.rect(g, 65, 166, 9, 12, "#cfd6dd"); PX.rect(g, 58, 166, 7, 3, "#cfd6dd");
    PX.rect(g, 92, 192, 34, 22, "#c99a28"); PX.rect(g, 92, 192, 34, 3, C.yellow); PX.rect(g, 100, 200, 18, 6, "#8a6a18");
    // pipes (U-trap), rattling while the robot is stuck
    pipe(g, 162 + pj, 90, 12, 80); pipe(g, 162 + pj, 166, 64, 12); pipe(g, 214 + pj, 128, 12, 50); pipe(g, 214 + pj, 128, 92, 12);
    PX.rect(g, 160 + pj, 118, 16, 3, "#5a6b78"); PX.rect(g, 212 + pj, 144, 16, 3, "#5a6b78");
    // robot: lying on its back, head wedged under the trap, body sticking out
    const ox = R((1 - PX.q(PX.p(t, 0, inT, "out"), 11)) * 300) + jit, hx = 178 + ox, hy = 180 + pj;
    const kick = F(t / (stuck ? 0.08 : 0.15)) % 2, bx = hx + 46;
    // legs (kicking)
    PX.rect(g, bx + 118, 192, 34 + kick * 10, 9, "#4a5a68"); PX.rect(g, bx + 152 + kick * 10, 186, 12, 18, "#3a4654"); PX.rect(g, bx + 152 + kick * 10, 186, 12, 2, "#4a5a68");
    PX.rect(g, bx + 118, 208, 44 - kick * 10, 9, "#4a5a68"); PX.rect(g, bx + 162 - kick * 10, 202, 12, 18, "#3a4654"); PX.rect(g, bx + 162 - kick * 10, 202, 12, 2, "#4a5a68");
    // body
    RR(g, bx, 182, 122, 44, "#2a333d", 3); RR(g, bx + 1, 183, 120, 42, "#6f8090", 3);
    PX.rect(g, bx + 3, 183, 116, 4, "#a4b2c0"); PX.rect(g, bx + 3, 219, 116, 5, "#4a5a68");
    for (const rx of [bx + 6, bx + 112]) for (const ry of [190, 214]) PX.rect(g, rx, ry, 2, 2, "#4a5a68");
    PX.rect(g, bx + 16, 194, 44, 20, "#1b2430"); PX.rect(g, bx + 16, 194, 44, 1, "#3a4654");
    [C.red, C.green, C.yellow].forEach((c, i) => { if (F(t * 6 + i) % 3) PX.rect(g, bx + 22 + i * 13, 201, 7, 7, c); });
    for (let i = 0; i < 4; i++) PX.rect(g, bx + 72, 195 + i * 5, 34, 3, "#4a5a68");
    // arm waving up toward the pipe
    // arm gripping the pipe and yanking it
    const arm = stuck ? 40 - (F(t * 10) % 2) * 4 : 10, ax = bx + 20;
    PX.rect(g, ax, 182 - arm, 6, arm, "#4a5a68"); PX.rect(g, ax, 182 - arm, 2, arm, "#6f8090"); PX.rect(g, ax - 1, 182 - R(arm / 2), 8, 4, "#3a4654");
    PX.rect(g, ax - 3, 178 - arm, 4, 8, "#3a4654"); PX.rect(g, ax + 5, 178 - arm, 4, 8, "#3a4654");
    // neck + head
    PX.rect(g, hx + 38, 192, 9, 14, "#4a5a68");
    RR(g, hx, hy, 40, 34, "#2a333d", 2); RR(g, hx + 1, hy + 1, 38, 32, "#6f8090", 2);
    PX.rect(g, hx + 2, hy + 1, 36, 3, "#a4b2c0"); PX.rect(g, hx + 35, hy + 3, 3, 28, "#4a5a68");
    PX.rect(g, hx + 6, hy + 9, 26, 11, "#0b1622");
    if (t >= err) { // X X eyes
      for (const ex of [hx + 9, hx + 22]) { PX.rect(g, ex, hy + 11, 2, 2, C.red); PX.rect(g, ex + 4, hy + 11, 2, 2, C.red); PX.rect(g, ex + 2, hy + 13, 2, 2, C.red); PX.rect(g, ex, hy + 15, 2, 2, C.red); PX.rect(g, ex + 4, hy + 15, 2, 2, C.red); }
    } else if (!PX.blink(t, 1.3, 0.1)) { PX.rect(g, hx + 10, hy + 12, 6, 4, C.cyan); PX.rect(g, hx + 22, hy + 12, 6, 4, C.cyan); }
    PX.rect(g, hx + 10, hy + 25, 20, 2, "#3a4654");
    // antenna squashed flat against the pipe
    PX.rect(g, hx + 18, hy - 2, 3, 2, "#4a5a68"); PX.rect(g, hx + 18, hy - 3, 12, 1, "#4a5a68"); PX.rect(g, hx + 30, hy - 4, 3, 3, C.red);
    // steam puffs + "!" while stuck
    if (stuck) {
      for (let k = 0; k < 4; k++) { const p = ((t + k * 0.22) % 0.88) / 0.88, z = 4 + F(p * 5); PX.rect(g, hx - 8 - p * 16 - k * 3, hy + 6 - p * 30, z, z, `rgba(180,195,210,${0.75 - p * 0.6})`); }
      if (t < err) TS(g, "!", bx + 80, 146 - (PX.blink(t, 0.2) ? 3 : 0), C.yellow, 24, "center");
    }
    // forgotten wrench on the floor
    S(g, WRENCH, 384, 236, { H: "#6f8090", G: "#9aaab8" }, 6);
    // error box
    if (t >= err) {
      const k = t - err, sz = k < 0.07 ? 24 : 16, msg = o.msg || "ERROR: CANNOT FIT";
      const w = R(PX.tw(g, msg, { size: sz }) + 22 + sz * 1.5), h = sz + 16, x = R(240 - w / 2), y = R(22 - h / 2);
      PX.rect(g, x, y, w, h, "#3a0508");
      if (PX.blink(k, 0.4, 0.75)) { PX.box(g, x, y, w, h, C.red); PX.box(g, x + 1, y + 1, w - 2, h - 2, C.red); }
      const ix = x + 8, iy = y + 8, sp = sz / 8;
      for (let i = 0; i < sz; i++) { PX.rect(g, ix + i, iy + i, sp, sp, C.red); PX.rect(g, ix + sz - 1 - i, iy + i, sp, sp, C.red); }
      T(g, msg, ix + sz * 1.5 + 6, iy, C.white, sz);
    }
  };

  // ======================================================================
  // warning: full-screen red alert
  // o: lines (["DO NOT", "LEARN TO CODE"]), per (0.5)
  K.warning = (o) => (g, t, d) => {
    const lines = o.lines || ["DO NOT", "LEARN TO CODE"], per = o.per ?? 0.5, on = PX.blink(t, per);
    PX.rect(g, 0, 0, 480, 270, on ? "#4a080e" : "#12030a");
    const sh = on && (t % per) < 0.06 ? 2 : 0;
    // hazard stripes (scroll)
    const off = F(t * 30) * 2;
    for (const y0 of [0, 246]) {
      PX.rect(g, 0, y0, 480, 24, "#141414");
      for (let y = 0; y < 24; y++) for (let x = -24 + ((off + y) % 24); x < 480; x += 24) PX.rect(g, x, y0 + y, 12, 1, C.yellow);
      PX.rect(g, 0, y0 === 0 ? 23 : 246, 480, 1, "#000");
    }
    // beacons
    for (const bx of [58, 422]) {
      const lit = F(t * 8) % 2;
      PX.rect(g, bx - 16, 150, 32, 8, "#3a4654"); PX.rect(g, bx - 16, 150, 32, 2, "#5a6b78");
      for (let y = 0; y < 18; y++) { const w = R(Math.sqrt(1 - ((18 - y) / 18) ** 2) * 13); PX.rect(g, bx - w, 132 + y, 2 * w, 1, lit ? "#ff6a6a" : "#a82a2a"); }
      PX.rect(g, bx - 4, 136, 3, 6, "#ffd0d0");
      const a = F(t * 8) * 0.785;
      for (let k = 0; k < 2; k++) { const aa = a + k * 3.1416, c = Math.cos(aa), s = Math.sin(aa); if (s < 0.2) PX.line(g, bx + c * 16, 140 + s * 10, bx + c * 40, 140 + s * 26, C.red); }
    }
    // big triangle "!"
    const tx = 240 + sh, ty = 32, th = 92;
    for (let y = 0; y < th; y++) { const w = R((y / th) * 58); PX.rect(g, tx - w - 4, ty + y, 2 * w + 8, 1, "#1b0508"); }
    for (let y = 6; y < th - 4; y++) { const w = R(((y - 6) / th) * 58); PX.rect(g, tx - w, ty + y, 2 * w, 1, y > th - 12 ? "#d99a1a" : C.yellow); }
    PX.rect(g, tx - 5, ty + 32, 10, 32, "#1b0508"); PX.rect(g, tx - 5, ty + 70, 10, 10, "#1b0508");
    // text lines: pop in, then flash colour with a short blackout each pulse
    lines.forEach((s, i) => {
      const at = 0.2 + i * 0.35; if (t < at) return;
      const big = i === lines.length - 1, sz0 = big ? 32 : 24, k = t - at, sz = k < 0.06 ? sz0 + 8 : sz0;
      if (k > 0.3 && (t % per) < 0.07) return;
      const y = 136 + (i === 0 ? 0 : 36 + (i - 1) * 40) + (lines.length === 1 ? 16 : 0);
      TS(g, s, 240 + sh, y, on ? (big ? C.white : C.yellow) : (big ? C.yellow : C.white), sz, "center", undefined, "#2a0004");
    });
  };

  // ======================================================================
  // feed: phone with a doom-scrolling social feed
  // o: posts (["IT'S OVER", "CS IS DEAD", "LEARN A TRADE", "AI TOOK MY JOB", "SO OVER"]), step (0.85)
  const ICONS = {
    skull: [".wwwwww.", "wwwwwwww", "wkkwwkkw", "wkkwwkkw", "wwwkkwww", ".wwwwww.", "..wkwkw.", "..wwwww."],
    fire: ["...r....", "..rr..r.", "..rrr.rr", ".rrorrr.", ".roooor.", "rrooyorr", "roayyaor", ".rooooor"],
    down: ["..rrrr..", "..rrrr..", "..rrrr..", "rrrrrrrr", ".rrrrrr.", "..rrrr..", "...rr...", "........"],
  };
  // greedy word wrap to n chars per line
  const wrap = (str, n) => { const out = []; let cur = ""; for (const w of str.split(" ")) { if (cur && (cur + " " + w).length > n) { out.push(cur); cur = w; } else cur = cur ? cur + " " + w : w; } if (cur) out.push(cur); return out; };
  const IPAL = { w: "#e8eef2", k: "#1b2430", r: C.red, o: C.orange, y: C.yellow, a: "#ffb347" };
  K.feed = (o) => {
    const posts = o.posts || ["IT'S OVER", "CS IS DEAD", "LEARN A TRADE", "AI TOOK MY JOB", "SO OVER"];
    const ICN = ["skull", "fire", "down"], TC = [C.red, C.yellow, C.white, C.orange, C.pink];
    const VIEWS = ["2.4M VIEWS", "890K VIEWS", "1.1M VIEWS", "3.7M VIEWS", "666K VIEWS", "5.2M VIEWS"];
    const AV = [C.pink, C.orange, C.purple, C.green, C.blue, C.teal];
    return (g, t, d) => {
      const step = o.step ?? 0.85;
      // phone body
      const X = 164, Y = 16, W = 152, H = 240;
      RR(g, X - 1, Y - 1, W + 2, H + 2, "#1b2430", 6); RR(g, X, Y, W, H, "#3a4654", 6);
      PX.rect(g, X + 2, Y + 6, 2, H - 12, "#5a6b78"); PX.rect(g, X + W - 4, Y + 6, 2, H - 12, "#2a333d");
      PX.rect(g, X - 3, Y + 46, 3, 20, "#5a6b78"); PX.rect(g, X - 3, Y + 72, 3, 12, "#5a6b78"); PX.rect(g, X + W, Y + 56, 3, 26, "#5a6b78");
      PX.rect(g, X + 56, Y + 7, 40, 4, "#1b2430"); PX.rect(g, X + 102, Y + 7, 4, 4, "#1b2430");
      const sx = X + 8, sy = Y + 16, sw = W - 16, sh = H - 30, PHh = sh - 14;
      PX.rect(g, sx, sy, sw, sh, "#070d14");
      PX.rect(g, X + 56, Y + H - 9, 40, 3, "#8b9bab");
      // feed content (clipped): one big post per screen, swipes up every `step`
      const k = Math.max(0, F((t - 0.5) / step)), fr = ((t - 0.5) % step) / 0.2;
      const scroll = t < 0.5 ? 0 : (k + PX.q(PX.ease(Math.min(1, fr), "out"), 5)) * PHh;
      g.save(); g.beginPath(); g.rect(sx, sy + 14, sw, sh - 14); g.clip();
      const i0 = F(scroll / PHh);
      for (let i = i0; i < i0 + 2; i++) {
        const pi = i % posts.length, y = R(sy + 14 + i * PHh - scroll), col = TC[pi % TC.length];
        PX.rect(g, sx + 3, y + 3, sw - 6, PHh - 6, "#0f1a26");
        PX.rect(g, sx + 8, y + 9, 16, 16, AV[i % AV.length]); PX.rect(g, sx + 11, y + 13, 3, 3, "#1b2430"); PX.rect(g, sx + 18, y + 13, 3, 3, "#1b2430"); PX.rect(g, sx + 11, y + 19, 10, 2, "#1b2430");
        PX.rect(g, sx + 30, y + 11, 44 + ((i * 13) % 30), 4, "#8b9bab"); PX.rect(g, sx + 30, y + 19, 30, 3, "#3a4654");
        wrap(posts[pi], 7).forEach((ln, j) => TS(g, ln, sx + sw / 2, y + 36 + j * 22, col, 16, "center"));
        S(g, ICONS[ICN[pi % 3]], sx + sw / 2 - 20, y + 88 + (PX.blink(t, 0.4) ? 0 : -2), IPAL, 5);
        T(g, VIEWS[pi % VIEWS.length], sx + 10, y + 140, "#8b9bab", 18, "left", "v");
        PX.rect(g, sx + sw - 24, y + 145, 5, 5, C.red); PX.rect(g, sx + sw - 18, y + 145, 5, 5, C.red); PX.rect(g, sx + sw - 23, y + 150, 9, 3, C.red); PX.rect(g, sx + sw - 21, y + 153, 5, 2, C.red);
      }
      g.restore();
      // app header
      PX.rect(g, sx, sy, sw, 14, "#14283a");
      PX.rect(g, sx + 6, sy + 5, 10, 2, "#8b9bab"); PX.rect(g, sx + 6, sy + 8, 10, 2, "#8b9bab");
      PX.rect(g, sx + sw / 2 - 12, sy + 5, 24, 4, C.pink);
      PX.rect(g, sx + sw - 14, sy + 4, 7, 7, "#8b9bab"); PX.rect(g, sx + sw - 12, sy + 6, 3, 3, "#14283a");
      // reactions floating up beside the phone
      for (let n = 0; n < 14; n++) {
        const t0 = 0.2 + n * 0.36, p = (t - t0) / 2.2; if (p < 0 || p > 1) continue;
        const left = n % 2 === 0, x = (left ? 92 : 352) + ((n * 37) % 30) + (F(p * 8) % 2) * 4, y = 236 - PX.q(p, 20) * 210;
        if (p > 0.85 && F(t * 20) % 2) continue;
        S(g, ICONS[ICN[n % 3]], x, y, IPAL, 3);
      }
    };
  };

  // ======================================================================
  // sheet: spreadsheet panel; view pans one column right, target column blinks
  // o: rows, cols [{h, vals}], pan (0.36d), target (1)
  const CURSOR = ["k......", "kk.....", "kwk....", "kwwk...", "kwwwk..", "kwwwwk.", "kwwwwwk", "kwwkkkk", "kk.kwk.", "k...kwk", "....kk."];
  K.sheet = (o) => {
    const rows = o.rows || ["COMP SCI", "COMP ENG", "PHILOSOPHY", "ALL MAJORS"];
    const cols = o.cols || [
      { h: "UNEMPLOYED", vals: ["7.0%", "7.8%", "5.1%", "4.8%"] },
      { h: "UNDEREMPLOYED", vals: ["19%", "22%", "47%", "39%"] },
      { h: "PAY", vals: ["$87K", "$90K", "$?", "$58K"] },
    ];
    return (g, t, d) => {
      const pan = o.pan ?? 0.36 * d, tg = o.target ?? 1;
      const X = 16, Y = 24, W = 448, H = 222;
      PX.panel(g, X, Y, W, H, C.cyan);
      // title bar
      PX.rect(g, X + 2, Y + 2, W - 4, 12, "#14283a");
      [C.red, C.yellow, C.green].forEach((c, i) => PX.rect(g, X + 7 + i * 8, Y + 6, 4, 4, c));
      for (let i = 0; i < 6; i++) PX.rect(g, X + 46 + i * 14, Y + 6, 10, 4, "#2a4a62");
      const RN = 18, LX = X + 2 + RN, LW = 124, DX = LX + LW, DW = X + W - 2 - DX, CW = 218;
      const top = Y + 16, HH = 28, RH = 36, hy = top + 12;
      const sc = CW * tg * PX.q(PX.p(t, pan, 0.55, "out"), 10);
      // letters strip
      PX.rect(g, X + 2, top, W - 4, 12, "#101e2c");
      T(g, "A", LX + LW / 2, top - 1, "#5a6b78", 14, "center", "v");
      // grid background
      PX.rect(g, X + 2, hy, W - 4, HH + rows.length * RH, "#0b1622");
      PX.rect(g, X + 2, hy, W - 4, HH, "#121f2e");
      // data columns (clipped viewport)
      g.save(); g.beginPath(); g.rect(DX, top, DW, 12 + HH + rows.length * RH); g.clip();
      for (let c = 0; c < Math.max(cols.length, tg + 2); c++) {
        const cx = R(DX + c * CW - sc), col = cols[c];
        T(g, String.fromCharCode(66 + c), cx + CW / 2, top - 1, "#5a6b78", 14, "center", "v");
        PX.rect(g, cx + CW - 1, top, 1, 12 + HH + rows.length * RH, "#24405a");
        if (!col) continue;
        if (t > 0.1) TS(g, col.h, cx + CW / 2, hy + 10, C.yellow, 8, "center");
        const hiC = c === tg && t > pan + 0.55 ? C.yellow : C.white;
        rows.forEach((_, r) => { if (t > 0.2 + r * 0.15) TS(g, col.vals[r] ?? "", cx + CW / 2, hy + HH + r * RH + 8, hiC, 24, "center", "v"); });
        if (c === tg && t > pan + 0.55 && PX.blink(t - pan - 0.55, 0.4, 0.65)) {
          PX.box(g, cx + 3, hy + 2, CW - 6, HH + rows.length * RH - 4, C.yellow); PX.box(g, cx + 4, hy + 3, CW - 8, HH + rows.length * RH - 6, C.yellow);
        }
      }
      g.restore();
      // frozen label column + row numbers
      PX.rect(g, LX + LW - 1, top, 2, 12 + HH + rows.length * RH, "#3a6a8a");
      rows.forEach((s, r) => {
        const y = hy + HH + r * RH;
        PX.rect(g, X + 2, y, W - 4, 1, "#24405a");
        T(g, String(r + 1), X + 2 + RN / 2, y + 10, "#5a6b78", 14, "center", "v");
        if (t > 0.2 + r * 0.15) TS(g, s, LX + 8, y + 14, C.cyan, 8);
      });
      PX.rect(g, X + 2, hy + HH, W - 4, 1, "#3a6a8a"); PX.rect(g, X + 2 + RN, top, 1, 12 + HH + rows.length * RH, "#24405a");
      // scrollbar
      const sy = hy + HH + rows.length * RH + 4, cont = Math.max(cols.length, tg + 1) * CW + CW * 0.4, tw2 = Math.max(30, R((DW * DW) / cont));
      PX.rect(g, DX, sy, DW - 4, 9, "#101e2c");
      const thx = R(DX + (sc / cont) * DW), dragging = t > pan - 0.1 && t < pan + 0.6;
      PX.rect(g, thx, sy + 1, tw2, 7, dragging ? C.cyan : "#3a6a8a");
      // mouse cursor: comes in, grabs the thumb, drags
      const cp = PX.p(t, pan - 0.7, 0.55, "out");
      const mx = PX.lerp(420, thx + tw2 / 2, cp), my = PX.lerp(150, sy + 4, cp);
      if (t > pan - 0.8 && t < pan + 1.2) S(g, CURSOR, R(mx), R(my), { k: "#000", w: "#e8f1f2" }, 2);
    };
  };

  // ======================================================================
  // logo: 0/1 glyphs + squares fly in and snap into BIT BY BIT
  // o: text ("BIT BY BIT"), size (32), done (1.1), sub (none)
  const CUBE = [".LLLLLLLLLL.", "LLLLLLLLLLLD", "LMMMMMMMMMDD", "LMMMMMMMMMDD", "LMMkMMMkMMDD", "LMMkMMMkMMDD", "LMMMMMMMMMDD",
    "LMkMMMMMkMDD", "LMMkkkkkMMDD", "LMMMMMMMMMDD", "DDDDDDDDDDDD", ".DDDDDDDDDD."];
  K.logo = (o) => {
    const text = o.text || "BIT BY BIT", SZ = o.size || 32, FP = SZ / 8, CS = SZ >= 32 ? 3 : 2;
    const oc = document.createElement("canvas"); oc.width = 480; oc.height = 48; const ox = oc.getContext("2d", { willReadFrequently: true });
    let pts = null;
    const rr = PX.rnd(77), RN = [...Array(2000)].map(() => [rr(), rr(), rr(), rr()]);
    const CC = [C.cyan, C.pink, C.yellow, C.green, C.purple];
    return (g, t, d) => {
      const done = o.done ?? Math.min(1.1, d * 0.6);
      const tw = text.length * SZ, total = 12 * CS + 12 + tw, x0 = R(240 - total / 2), tx = x0 + 12 * CS + 12, ty = R(135 - SZ / 2) - (o.sub ? 12 : 0);
      if (!pts && document.fonts.check(SZ + 'px "Press Start 2P"')) {
        ox.clearRect(0, 0, 480, 48); T(ox, text, 0, 0, "#fff", SZ);
        const img = ox.getImageData(0, 0, tw, SZ).data; pts = [];
        for (let y = 1; y < SZ; y += FP) for (let x = 1; x < tw; x += FP) if (img[(y * tw + x) * 4 + 3] > 128) pts.push([x - 1, y - 1]);
      }
      if (t < done) {
        (pts || []).forEach(([px, py], i) => {
          const q = RN[i % RN.length], st = q[2] * 0.3, ar = done - q[3] * 0.18;
          const u = PX.q(PX.ease(PX.clamp((t - st) / (ar - st), 0, 1), "out"), 12);
          const sxp = q[0] * 520 - 20, syp = q[1] * 300 - 15;
          const x = PX.lerp(sxp, tx + px, u), y = PX.lerp(syp, ty + py, u);
          PX.rect(g, R(x), R(y), FP, FP, u >= 1 ? C.cyan : CC[i % CC.length]);
        });
        for (let i = 0; i < 48; i++) {
          const q = RN[1000 + i], u = PX.q(PX.ease(PX.clamp((t - q[2] * 0.25) / (done * 0.85 - q[2] * 0.25), 0, 1), "in"), 10);
          if (u >= 1) continue;
          const x = PX.lerp(q[0] * 480, tx + q[3] * tw, u), y = PX.lerp(q[1] * 270, ty + SZ / 4, u);
          T(g, q[3] < 0.5 ? "0" : "1", R(x), R(y), i % 3 ? C.green : C.cyan, 16, "left", "v");
        }
      } else {
        const k = t - done;
        T(g, text, tx + FP, ty + FP, C.yellow, SZ);
        T(g, text, tx, ty, k < 0.05 ? C.white : C.cyan, SZ);
        // shine sweep
        const bx = R(tx - 20 + PX.q(PX.clamp((k - 0.1) / 0.45, 0, 1), 16) * (tw + 40));
        if (k > 0.1 && k < 0.6) { g.save(); g.beginPath(); g.rect(bx, ty - 2, SZ / 2, SZ + 6); g.clip(); T(g, text, tx, ty, C.white, SZ); g.restore(); }
        // cube icon pops in
        const sc = k < 0.06 ? CS + 1 : CS, blink = PX.blink(k, 1.2, 0.08) && k > 0.4;
        S(g, blink ? CUBE.map((r, i) => (i === 4 || i === 5 ? r.replace(/k/g, "M") : r)) : CUBE, x0 + 6 * CS - 6 * sc, ty + SZ / 2 - 6 * sc, { L: "#b4f6f8", M: C.cyan, D: C.teal, k: "#0b1622" }, sc);
        if (o.sub) TS(g, PX.typed(o.sub, t, done + 0.15, 50), 240, ty + SZ + 14, C.ink, 20, "center", "v");
      }
    };
  };

  // ======================================================================
  // shatter: the question splits into numbered pieces
  // o: lines (["IS A CS DEGREE", "WORTH IT IN 2027?"]), at (0.39d)
  K.shatter = (o) => {
    const lines = o.lines || ["IS A CS DEGREE", "WORTH IT IN 2027?"], SZ = 24;
    const oc = document.createElement("canvas"); oc.width = 480; oc.height = 48; const ox = oc.getContext("2d");
    // split every line into two halves at the most balanced word break
    const pieces = [];
    lines.forEach((ln, li) => {
      const w = ln.split(" ");
      let best = w.length, bd = 1e9;
      for (let k = 1; k < w.length; k++) { const a = w.slice(0, k).join(" ").length, dd = Math.abs(a - (ln.length - a - 1)); if (dd < bd) { bd = dd; best = k; } }
      const a = w.slice(0, best).join(" "), b = w.slice(best).join(" ");
      pieces.push({ s: a, li, ci: 0 }); if (b) pieces.push({ s: b, li, ci: a.length + 1 });
    });
    const DIR = [[-22, -16, -0.09], [22, -14, 0.07], [-20, 16, 0.06], [24, 18, -0.10], [-14, 22, 0.08], [16, -22, -0.07]];
    return (g, t, d) => {
      const at = o.at ?? 0.39 * d, n = lines.length, y0 = R(132 - (n * 40 - 16) / 2);
      const lx = (li) => R(240 - (lines[li].length * SZ) / 2), ly = (li) => y0 + li * 40;
      if (t < at) {
        let used = 0; const tot = lines.join("").length, typedN = F(PX.clamp(t / 0.9, 0, 1) * tot);
        lines.forEach((ln, li) => { const s = ln.slice(0, Math.max(0, typedN - used)); used += ln.length; TS(g, s, lx(li), ly(li), C.yellow, SZ); });
        if (typedN >= tot && PX.blink(t, 0.4)) PX.rect(g, lx(n - 1) + lines[n - 1].length * SZ + 4, ly(n - 1), 12, SZ, C.yellow);
        // cracks just before the split
        const cp = PX.clamp((t - (at - 0.35)) / 0.35, 0, 1);
        if (cp > 0) {
          pieces.forEach((p) => { if (!p.ci) return; const x = lx(p.li) + p.ci * SZ - SZ / 2, y = ly(p.li) - 6, len = R(cp * 36); for (let j = 0; j < len; j += 4) PX.line(g, x + ((j / 4) % 2 ? 2 : -2), y + j, x + ((j / 4) % 2 ? -2 : 2), y + j + 4, C.white); });
          for (let li = 0; li < n - 1; li++) { const y = ly(li) + SZ + 7, len = R(cp * 400); for (let j = 0; j < len; j += 8) PX.line(g, 40 + j, y + ((j / 8) % 2 ? 2 : -2), 48 + j, y + ((j / 8) % 2 ? -2 : 2), C.white); }
        }
        return;
      }
      pieces.forEach((p, i) => {
        const [ddx, ddy, ang] = DIR[i % DIR.length], sp = PX.q(PX.p(t, at + i * 0.12, 0.4, "out"), 4);
        const bob = t > at + 1 ? (PX.blink(t + i * 0.2, 0.8) ? 1 : 0) : 0;
        const pw = p.s.length * SZ + 6, ph = SZ + 6;
        const tagAt = at + 0.5 + i * 0.42, tagged = t >= tagAt;
        ox.clearRect(0, 0, 480, 48);
        PX.box(ox, 0, 0, pw, ph, tagged ? C.pink : "#2a9fad");
        T(ox, p.s, 3, 3, t - at < 0.05 ? C.white : C.yellow, SZ);
        const X = lx(p.li) + p.ci * SZ - 3 + R(ddx * sp), Y = ly(p.li) - 3 + R(ddy * sp) + bob, a = ang * sp * (tagged ? 1.5 : 1);
        for (let c = 0; c < pw; c += 3) g.drawImage(oc, c, 0, 3, ph, X + c, Y + R((c - pw / 2) * a), 3, ph);
        if (tagged) {
          const k = t - tagAt, s = k < 0.07 ? 32 : 22, fs = k < 0.07 ? 24 : 16, ty = Y + R((-pw / 2) * a) - s + 6;
          PX.rect(g, X - s / 2 - 1, ty - 1, s + 2, s + 2, "#2a0018"); PX.rect(g, X - s / 2, ty, s, s, C.pink); PX.rect(g, X - s / 2, ty, s, 2, "#ff9ccd");
          T(g, String(i + 1), X + 1, ty + (s - fs) / 2 + 1, C.white, fs, "center");
        }
      });
    };
  };

  // ======================================================================
  // two_students: teen "17" before doors CS/ART/BIZ; older "20" with DEGREE 50%
  // o: right (0.47d), doors (["CS","ART","BIZ"]), a ("17"), b ("20"), pct (50), bar ("DEGREE")
  K.two_students = (o) => (g, t, d) => {
    const rt = o.right ?? 0.47 * d, doors = o.doors || ["CS", "ART", "BIZ"], DC = [C.cyan, C.pink, C.yellow];
    const dx = R(120 * (1 - PX.q(PX.p(t, rt, 0.45, "out"), 6)));
    // floor across
    PX.rect(g, 0, 250, 480, 2, "#3a4654"); PX.rect(g, 0, 252, 480, 1, "#1b2430");
    // ---- left group (centred until the right side arrives) ----
    const look = F(t / 0.9) % 3; // which door the teen looks at
    PX.rect(g, dx + 6, 158, 228, 2, "#24384c");
    doors.forEach((s, i) => {
      const cx = dx + 48 + i * 72, w = 56, h = 104, x = cx - w / 2, y = 54, col = DC[i % 3], hi = look === i;
      PX.rect(g, x - 4, y - 4, w + 8, h + 4, hi ? col : "#3a4654");
      PX.rect(g, x, y, w, h, "#26323e"); PX.rect(g, x + 6, y + 8, w - 12, 40, "#2e3c4a"); PX.rect(g, x + 6, y + 56, w - 12, 40, "#2e3c4a");
      PX.rect(g, x + 6, y + 8, w - 12, 1, "#3e4e5e"); PX.rect(g, x + 6, y + 56, w - 12, 1, "#3e4e5e");
      PX.rect(g, x + w - 11, y + 52, 5, 5, "#c9a028");
      if (hi) PX.rect(g, x, y + h - 2, w, 2, col);
      TS(g, s, cx, y - 26, col, 16, "center");
    });
    const tx = dx + 99, tb = PX.blink(t, 0.6) ? 1 : 0;
    P(g, tx, 172 + tb, { sc: 6, col: C.green, flip: look === 0, hair: "#3a2414" });
    bubble(g, tx + 21, 132 + (PX.blink(t, 0.5) ? -2 : 0), "?", C.yellow, PX.blink(t, 0.9, 0.12));
    PX.panel(g, tx + 50, 190, 44, 26, C.cyan); TS(g, o.a || "17", tx + 72, 195, C.white, 16, "center");
    // ---- right group ----
    if (t >= rt) {
      for (let y = 30; y < 248; y += 8) PX.rect(g, 240, y, 1, 4, "#3a6a8a");
      const wp = PX.clamp((t - rt) / 0.7, 0, 1), walking = wp < 1, fr = F(t / 0.13) % 2;
      const sx = R(PX.lerp(486, 352, wp)), sy = 172 + (walking ? fr : 0), sc = 6;
      // backpack peeking out behind the shoulders, then straps
      PX.rect(g, sx + 2 * sc, sy + 3 * sc + 2, 3 * sc, sc, "#1e3a66"); PX.rect(g, sx + 2 * sc + 3, sy + 3 * sc + 5, 3 * sc - 6, sc - 3, "#05060a");
      PX.rect(g, sx - sc, sy + 4 * sc, 9 * sc, 5 * sc, "#1e3a66"); PX.rect(g, sx - sc + 2, sy + 4 * sc + 2, 9 * sc - 4, 5 * sc - 4, "#3d6fb5");
      PX.rect(g, sx - sc + 2, sy + 4 * sc + 2, 9 * sc - 4, 3, "#6a98d8");
      P(g, sx, sy, { sc, col: C.purple, frame: walking ? fr : 0, hair: "#1b1410", skin: PX.C.skin[2] });
      PX.rect(g, sx + 2 * sc, sy + 6 * sc, 3, 3 * sc, "#1e3a66"); PX.rect(g, sx + 5 * sc - 3, sy + 6 * sc, 3, 3 * sc, "#1e3a66");
      // sweat drop now and then
      const sp = ((t - rt) % 1.4) / 1.4;
      if (!walking && sp < 0.5) { PX.rect(g, sx + 44, sy + 8 + R(sp * 20), 3, 5, "#9fd8ff"); PX.rect(g, sx + 44, sy + 8 + R(sp * 20), 1, 1, "#e8f8ff"); }
      PX.panel(g, sx - 54, 190, 44, 26, C.cyan); TS(g, o.b || "20", sx - 32, 195, C.white, 16, "center");
      // progress bar
      const pct = o.pct ?? 50, fp = PX.q(PX.p(t, rt + 0.7, 1.1, "lin"), 10) * pct;
      const bx = 262, by = 92, bw = 196;
      TS(g, o.bar || "DEGREE", bx, by - 24, C.yellow, 16);
      TS(g, R(fp) + "%", bx + bw, by - 24, C.white, 16, "right");
      PX.box(g, bx, by, bw, 24, C.cyan); PX.box(g, bx + 1, by + 1, bw - 2, 22, "#1b3a4a");
      const fw = R(((bw - 6) * fp) / 100);
      if (fw > 0) { PX.rect(g, bx + 3, by + 3, fw, 18, C.green); PX.rect(g, bx + 3, by + 3, fw, 4, "#9dffb6"); PX.rect(g, bx + 3, by + 17, fw, 4, "#24a048"); }
      if (fp >= pct && PX.blink(t, 0.5)) PX.rect(g, bx + 3 + fw, by + 3, 8, 18, "#2a6a3a");
      for (let i = 1; i < 10; i++) PX.rect(g, bx + 3 + R(((bw - 6) * i) / 10), by + 3, 1, 18, "rgba(0,0,0,.35)");
    }
  };
})();
