/* Builder E scene kinds (verdict + ending): checklist, loans, safe, profile, door_ai, quest, rename, queue,
   ticket, checker, subscribe. Helpers are prefixed end_. */
(function () {
  const { K, C } = PX;
  const G1 = "#3a4654", G2 = "#5a6b78", G3 = "#8b9bab", G4 = "#c8d2da", INK = "#05060a";

  // ---------- helpers ----------
  const TICK = ["......gg", ".....ggg", "g...ggg.", "gg.ggg..", "ggggg...", ".ggg....", "..g....."];
  const CROSS = ["rr...rr", "rrr.rrr", ".rrrrr.", "..rrr..", ".rrrrr.", "rrr.rrr", "rr...rr"];
  // tick ("ok") or cross ("x") centred on cx,cy, with a dark outline so it reads on anything
  function end_mark(g, kind, cx, cy, sc, col) {
    const rows = kind === "x" ? CROSS : TICK, w = rows[0].length * sc, h = rows.length * sc;
    const x = Math.round(cx - w / 2), y = Math.round(cy - h / 2), o = Math.max(1, sc >> 1);
    for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) PX.sprite(g, rows, x + dx * o, y + dy * o, { g: INK, r: INK }, sc);
    PX.sprite(g, rows, x, y, { g: col || C.green, r: col || C.red }, sc);
  }
  // pop-in scale (0 before at, back-ease overshoot, stepped) and stamp slam (2.2x -> 1x)
  const end_pop = (t, at, dur) => { if (t < at) return 0; const p = (t - at) / (dur || 0.3); return p >= 1 ? 1 : Math.max(0.1, PX.q(PX.ease(p, "back"), 8)); };
  const end_slam = (t, at) => { if (t < at) return 0; const p = (t - at) / 0.22; return p >= 1 ? 1 : PX.q(2.2 - 1.2 * p * p, 10); };
  function end_scaled(g, s, cx, cy, fn) { if (s <= 0) return; if (s === 1) fn(); else PX.zoom(g, s, cx, cy, fn); }
  const end_shake = (t, at, dur, amp) => (t >= at && t < at + dur ? (Math.floor(t * 30) % 2 ? amp : -amp) : 0);
  // biggest readable font that fits maxW: Press Start 16, then VT323 32..16, then Press Start 8
  function end_fit(g, s, maxW, noBig) {
    if (!noBig && PX.tw(g, s, { size: 16 }) <= maxW) return { size: 16 };
    for (let z = 32; z >= 16; z -= 2) if (PX.tw(g, s, { font: "v", size: z }) <= maxW) return { font: "v", size: z };
    return { size: 8 };
  }
  // draw text vertically centred on cy whatever the font (VT323 caps sit lower in the em box)
  function end_textC(g, s, x, cy, f, col, align) {
    const y = f.font === "v" ? cy - Math.round(f.size * 0.5) : cy - Math.round(f.size / 2);
    return PX.text(g, s, x, y, Object.assign({}, f, { col, align }));
  }
  function end_sparkle(g, x, y, ph, col, sc) {
    sc = sc || 1; const s = [0, 1, 2, 1][((ph % 4) + 4) % 4];
    PX.rect(g, x - s * sc, y, (2 * s + 1) * sc, sc, col); PX.rect(g, x, y - s * sc, sc, (2 * s + 1) * sc, col);
  }
  const HEART = [".hh.hh.", "hwhhhhh", "hhhhhhh", ".hhhhh.", "..hhh..", "...h..."];
  const end_heart = (g, x, y, sc, col) => PX.sprite(g, HEART, x, y, { h: col || C.pink, w: "#ffd0e6" }, sc || 1);
  const DROP = [".b.", "bbb", "bwb", ".b."];
  const end_drop = (g, x, y, sc) => PX.sprite(g, DROP, x, y, { b: "#5fb8e8", w: "#d8f4ff" }, sc || 2);
  // "!" pop sprite
  const end_bang = (g, x, y, sc, col) => PX.sprite(g, ["yy", "yy", "yy", "yy", "..", "yy"], x, y, { y: col || C.yellow }, sc || 2);
  // speech bubble with tail pointing down at tx
  function end_bubble(g, s, cx, y, col) {
    const w = PX.tw(g, s) + 14, x = Math.round(cx - w / 2);
    PX.panel(g, x, y, w, 20, col || C.ink, "#0d1824");
    PX.rect(g, cx - 2, y + 19, 5, 2, "#0d1824"); PX.rect(g, cx - 3, y + 19, 1, 3, col || C.ink); PX.rect(g, cx + 3, y + 19, 1, 3, col || C.ink);
    PX.rect(g, cx - 1, y + 21, 3, 2, "#0d1824"); PX.rect(g, cx - 2, y + 22, 1, 2, col || C.ink); PX.rect(g, cx + 2, y + 22, 1, 2, col || C.ink); PX.rect(g, cx - 1, y + 24, 3, 1, col || C.ink);
    PX.text(g, s, cx, y + 6, { col: col || C.ink, align: "center" });
  }
  const SHIRTS = [C.cyan, C.pink, C.yellow, C.green, C.purple, C.orange, C.blue, "#e8f1f2"];
  const HAIRS = ["#2b1d14", "#5a3a1e", "#111111", "#c89a4a", "#8a3a1e", "#3a2a20"];

  // ---------- checklist ----------
  // o: title ("DO IT IF..."), items [{text, at, mark:"ok"|"x", markAt}]
  K.checklist = (o) => {
    const title = o.title || "DO IT IF...";
    const items = o.items || [{ text: "YOU LIKE BUILDING", mark: "ok" }, { text: "ONLY FOR THE MONEY", mark: "x" }];
    return (g, t, d) => {
      const n = Math.max(1, items.length), X = 40, Y = 20, W = 400, H = 230;
      PX.panel(g, X, Y, W, H, C.cyan);
      PX.rect(g, X + 2, Y + 2, W - 4, 32, "#10283a"); PX.rect(g, X + 2, Y + 34, W - 4, 1, C.teal);
      const tf = PX.tw(g, title, { size: 16 }) <= W - 80 ? { size: 16 } : { size: 8 };
      PX.text(g, PX.typed(title, t, 0, 16), X + 14, Y + 18 - tf.size / 2, Object.assign({ col: C.yellow }, tf));
      [C.red, C.yellow, C.green].forEach((c, i) => PX.rect(g, X + W - 44 + i * 12, Y + 15, 6, 6, c));
      const top = Y + 42, avail = H - 50, rowH = Math.min(86, Math.floor(avail / n));
      const y0 = top + Math.floor((avail - rowH * n) / 2), bs = rowH >= 60 ? 44 : Math.max(16, rowH - 16);
      const span = Math.max(1.2, (d - 1.6) / n);
      items.forEach((it, i) => {
        const at = it.at !== undefined ? it.at : 0.7 + i * span;
        if (t < at) return;
        const txt = it.text || "", cps = 18, tEnd = at + txt.length / cps;
        const mAt = it.markAt !== undefined ? it.markAt : tEnd + 0.35, good = it.mark !== "x", marked = it.mark && t >= mAt;
        const cy = y0 + i * rowH + Math.floor(rowH / 2), sh = !good ? end_shake(t, mAt + 0.1, 0.3, 2) : 0;
        const bx = X + 18 + sh, by = cy - (bs >> 1), mc = good ? "#1f8a40" : "#9a2a2a";
        if (!marked) PX.rect(g, X + 6, cy - (rowH >> 1) + 4, W - 12, rowH - 8, "#0e2130");
        if (marked && t < mAt + 0.15) PX.rect(g, X + 6, cy - (rowH >> 1) + 4, W - 12, rowH - 8, good ? "#12452a" : "#4a1218");
        PX.rect(g, bx, by, bs, bs, marked ? (good ? "#0f3a1e" : "#3d1016") : "#0a1119");
        PX.box(g, bx, by, bs, bs, marked ? mc : C.dim); PX.box(g, bx + 1, by + 1, bs - 2, bs - 2, marked ? mc : C.dim);
        const tx = bx + bs + 14, f = end_fit(g, txt, X + W - 14 - tx), shown = PX.typed(txt, t, at, cps);
        const w = end_textC(g, shown, tx, cy, f, marked && !good ? C.dim : C.ink);
        const fh = f.font === "v" ? Math.round(f.size * 0.62) : f.size;
        if (t < tEnd + 0.4 && PX.blink(t, 0.3)) PX.rect(g, tx + w + 3, cy - (fh >> 1), Math.max(4, fh >> 1), fh, C.cyan);
        if (marked && !good) PX.rect(g, tx - 3, cy - 1, Math.round((PX.tw(g, txt, f) + 6) * PX.q(PX.p(t, mAt + 0.1, 0.25, "lin"), 6)), 3, C.red);
        if (marked) {
          const sc = Math.max(2, Math.round(bs / (good ? 6.5 : 8.5)));
          end_scaled(g, end_pop(t, mAt, 0.28), bx + bs / 2, by + bs / 2, () => end_mark(g, good ? "ok" : "x", bx + bs / 2 + (good ? 5 : 0), by + bs / 2 - (good ? 6 : 0), sc));
          if (good && t > mAt + 0.2) [[-6, -10], [bs + 6, -6], [bs + 2, bs + 4]].forEach(([dx, dy], k) => end_sparkle(g, bx + dx, by + dy, Math.floor(t * 6) + k * 2, k === 1 ? C.yellow : C.green, 1));
        }
      });
    };
  };

  // ---------- loans ----------
  function end_sack(g, cx, by, r, lines) { // money bag: pear body, pinched neck with rope, flared top
    const cy = by - r, D = "#5a3c1c", B = "#9a6e3a", L = "#b98a4e", bw = Math.round(r * 0.9);
    PX.circle(g, cx, cy, r, D); PX.rect(g, cx - bw, cy, 2 * bw, r, D);
    PX.circle(g, cx - 2, cy - 2, r - 2, B); PX.rect(g, cx - bw + 1, cy - 2, 2 * bw - 4, r - 2, B);
    PX.circle(g, cx - Math.round(r * 0.45), cy - Math.round(r * 0.45), Math.max(2, Math.round(r * 0.28)), L);
    const nw = Math.max(4, Math.round(r * 0.36)), ny = cy - r - 2;
    PX.rect(g, cx - nw / 2, ny - 4, nw, 7, B);
    const fh = Math.max(5, Math.round(r * 0.36));
    for (let i = 0; i < fh; i++) { const w = nw + 4 + i * 2; PX.rect(g, cx - w / 2, ny - 5 - i, w, 1, i === fh - 1 ? L : B); PX.rect(g, cx + w / 2 - 2, ny - 5 - i, 2, 1, D); }
    const tw = nw + 4 + fh * 2; for (let x = 0; x < tw; x += 4) PX.rect(g, cx - tw / 2 + x, ny - 5 - fh, 2, 1, L);
    PX.rect(g, cx - nw / 2 - 3, ny - 4, nw + 6, 3, "#3a220c"); PX.rect(g, cx + nw / 2 + 1, ny - 2, 2, 5, "#3a220c");
    const tot = lines.reduce((a, l) => a + l.size, 0) + 4 * (lines.length - 1);
    let y = cy - Math.round(tot / 2) + 4;
    for (const l of lines) { PX.text(g, l.s, cx, y + 1, { size: l.size, col: "#2a1806", align: "center" }); PX.text(g, l.s, cx - 1, y, { size: l.size, col: l.col, align: "center" }); y += l.size + 4; }
  }
  // o: a (0.4) small loan lands, b (3.6) giant loan lands, salary ("87K"), loan ("20K"), loan2 ("200K"),
  //    good ("WORTH IT"), bad ("NOT WORTH IT")
  K.loans = (o) => {
    const a = o.a !== undefined ? o.a : 0.4, b = o.b !== undefined ? o.b : 3.6;
    const sal = o.salary || "87K", l1 = o.loan || "20K", l2 = o.loan2 || "200K";
    const PXo = 240, PYo = 72, R = 140, PUF = PX.rnd(31), puffs = [...Array(6)].map(() => [PUF() * 2 - 1, -PUF() * 0.8]);
    const angAt = (t) => {
      if (t < a) return -0.3;
      const u = t - a; let ang = -0.15 - 0.15 * Math.exp(-4 * u) * Math.cos(9 * u) + 0.02 * Math.sin(t * 2.6);
      if (t >= b) {
        const v = t - b, prev = -0.15 + 0.02 * Math.sin(b * 2.6);
        ang = v < 0.12 ? PX.lerp(prev, 0.36, (v / 0.12) * (v / 0.12)) : 0.36 - 0.07 * Math.abs(Math.sin(13 * (v - 0.12))) * Math.exp(-4 * (v - 0.12));
      }
      return ang;
    };
    return (g, t, d) => {
      g.translate(end_shake(t, b + 0.1, 0.35, 2), 0);
      const ang = PX.q(angAt(t), 40), co = Math.cos(ang), si = Math.sin(ang);
      // dial arc + post + base
      for (let ph = -0.62; ph <= 0.62; ph += 0.05) PX.rect(g, PXo + 30 * Math.sin(ph) - 1, PYo - 30 * Math.cos(ph) - 1, 2, 2, ph < 0 ? "#1f7a3a" : "#8a2a2a");
      PX.rect(g, PXo - 5, PYo, 10, 146, "#b8862e"); PX.rect(g, PXo - 5, PYo, 3, 146, "#e0b04a"); PX.rect(g, PXo + 3, PYo, 2, 146, "#7a5a1e");
      PX.rect(g, PXo - 30, 212, 60, 6, "#b8862e"); PX.rect(g, PXo - 46, 218, 92, 10, "#9a7024"); PX.rect(g, PXo - 46, 218, 92, 2, "#e0b04a"); PX.rect(g, PXo - 46, 226, 92, 2, "#5e4416");
      // pointer
      const pc = ang < -0.01 ? C.green : ang > 0.01 ? C.red : C.yellow;
      for (let k = -1; k <= 0; k++) PX.line(g, PXo + k, PYo, PXo + k + 25 * si, PYo - 25 * co, pc);
      // beam
      const L = [PXo - R * co, PYo - R * si], Rr = [PXo + R * co, PYo + R * si];
      [["#e0b04a", -2], ["#b8862e", -1], ["#b8862e", 0], ["#7a5a1e", 1]].forEach(([c, k]) => PX.line(g, L[0], L[1] + k, Rr[0], Rr[1] + k, c));
      PX.circle(g, PXo, PYo, 7, "#7a5a1e"); PX.circle(g, PXo - 1, PYo - 1, 5, "#e0b04a");
      // pans hang straight down
      const pan = (ex, ey) => {
        const py = Math.round(ey + 58);
        PX.line(g, ex, ey, ex - 36, py, G3); PX.line(g, ex, ey, ex + 36, py, G3);
        PX.circle(g, ex, ey, 2, "#e0b04a");
        PX.rect(g, ex - 40, py, 80, 4, "#b8862e"); PX.rect(g, ex - 40, py, 80, 1, "#e0b04a"); PX.rect(g, ex - 30, py + 4, 60, 3, "#7a5a1e");
        return py;
      };
      const lpy = pan(Math.round(L[0]), Math.round(L[1])), rpy = pan(Math.round(Rr[0]), Math.round(Rr[1]));
      end_sack(g, Math.round(L[0]), lpy, 32, [{ s: "SALARY", size: 8, col: "#f0dcb0" }, { s: sal, size: 16, col: C.green }]);
      const rx = Math.round(Rr[0]);
      if (t >= a - 0.3 && t < b) {
        const p = PX.clamp((t - (a - 0.3)) / 0.3, 0, 1), y = Math.round(PX.lerp(-20, rpy, p * p));
        end_sack(g, rx, y, 24, [{ s: "LOANS", size: 8, col: "#f0dcb0" }, { s: l1, size: 8, col: "#ff6b6b" }]);
      }
      if (t >= b - 0.3) {
        const p = PX.clamp((t - (b - 0.3)) / 0.3, 0, 1), y = Math.round(PX.lerp(-30, rpy, p * p));
        end_sack(g, rx, y, 46, [{ s: "LOANS", size: 16, col: "#f0dcb0" }, { s: l2, size: 16, col: "#ff3b3b" }]);
        if (t > b && t < b + 0.8) {
          const u = (t - b) / 0.8;
          PX.alpha(g, 1 - u, () => puffs.forEach(([dx, dy]) => PX.circle(g, rx + dx * (30 + 40 * u), rpy + 2 + dy * 30 * u, Math.round(3 + 5 * u), "#d8dee4")));
        }
      }
      // sparkle on the salary bag while it is winning
      if (t < b) end_sparkle(g, Math.round(L[0]) + 26, lpy - 58, Math.floor(t * 5), C.yellow, 1);
      // verdict banner
      if (t >= a + 0.5 && t < b) end_scaled(g, end_pop(t, a + 0.5), 240, 246, () => {
        const s = o.good || "WORTH IT", w = PX.tw(g, s, { size: 16 }) + 26;
        end_mark(g, "ok", 240 - w / 2 + 8, 245, 2); PX.text(g, s, 240 - w / 2 + 24, 238, { size: 16, col: C.green });
      });
      if (t >= b + 0.1) end_scaled(g, end_slam(t, b + 0.1), 240, 246, () => {
        const s = o.bad || "NOT WORTH IT", w = PX.tw(g, s, { size: 16 }) + 26;
        end_mark(g, "x", 240 - w / 2 + 7, 245, 2); PX.text(g, s, 240 - w / 2 + 24, 238, { size: 16, col: C.red });
      });
    };
  };

  // ---------- safe ----------
  // o: label ("SAFE CHOICE (2019)"), open (3.0), gone (6.5), text ("SAFE IS GONE")
  K.safe = (o) => {
    const open = o.open !== undefined ? o.open : 3.0, gone = o.gone !== undefined ? o.gone : 6.5;
    const label = o.label || "SAFE CHOICE (2019)", text = o.text || "SAFE IS GONE";
    const BX = 136, BY = 42, BW = 208, BH = 180, DX = 156, DY = 58, DW = 168, DH = 148, cxD = 72, cyD = 74;
    // static door art (front + back) on small offscreen canvases, then drawn column by column when swinging
    const mk = () => { const c = document.createElement("canvas"); c.width = DW; c.height = DH; return c; };
    const front = mk(), back = mk();
    { const f = front.getContext("2d");
      PX.rect(f, 0, 0, DW, DH, "#55646f"); PX.rect(f, 0, 0, DW, 3, "#8b9bab"); PX.rect(f, 0, 0, 3, DH, "#8b9bab");
      PX.rect(f, 0, DH - 3, DW, 3, "#46535f"); PX.rect(f, DW - 3, 0, 3, DH, "#46535f");
      PX.box(f, 10, 10, DW - 20, DH - 20, "#3a4654"); PX.box(f, 11, 11, DW - 22, DH - 22, "#7d8d9a");
      for (let i = 0; i < 6; i++) for (const [x, y] of [[6 + i * 31, 5], [6 + i * 31, DH - 7]]) PX.rect(f, x, y, 2, 2, "#c8d2da");
      PX.circle(f, cxD, cyD, 30, "#2a333c"); PX.circle(f, cxD, cyD, 27, "#8b9bab"); PX.circle(f, cxD - 1, cyD - 1, 25, "#a9b6c1");
      for (let k = 0; k < 12; k++) { const a = k * Math.PI / 6; PX.rect(f, cxD + 21 * Math.sin(a) - 1, cyD - 21 * Math.cos(a) - 1, k % 3 ? 2 : 3, k % 3 ? 2 : 3, "#2a333c"); }
      PX.circle(f, cxD, cyD, 6, "#46535f"); PX.circle(f, cxD - 1, cyD - 1, 4, "#a6b6c3");
      PX.rect(f, 128, 40, 14, 70, "#46535f"); PX.rect(f, 130, 42, 10, 66, "#8b9bab"); PX.rect(f, 130, 42, 3, 66, "#c8d2da");
    }
    { const f = back.getContext("2d");
      PX.rect(f, 0, 0, DW, DH, "#3a4654"); PX.box(f, 0, 0, DW, DH, "#2a333c");
      for (const y of [24, 70, 116]) { PX.rect(f, 10, y, DW - 20, 8, "#5a6b78"); PX.rect(f, 10, y, DW - 20, 2, "#8b9bab"); PX.rect(f, 0, y + 1, 10, 6, "#c8d2da"); }
      PX.rect(f, 60, 14, 46, 120, "#2f3944"); PX.circle(f, 83, 74, 12, "#5a6b78"); PX.circle(f, 83, 74, 5, "#8b9bab");
    }
    const R = PX.rnd(5), puffs = [...Array(8)].map(() => [R() * 2 - 1, R() * 1.4 - 0.9, 3 + R() * 3]);
    const MOTH = [["w.....w", "ww...ww", ".wwbww.", "..wbw..", "...b..."], [".......", "...b...", "wwwbwww", ".wwbww.", "..w.w.."]];
    return (g, t, d) => {
      g.imageSmoothingEnabled = false;
      // plate
      const pw = PX.tw(g, label) + 20;
      PX.rect(g, 240 - pw / 2, 20, pw, 16, "#b8862e"); PX.rect(g, 240 - pw / 2, 20, pw, 2, "#e0b04a"); PX.rect(g, 240 - pw / 2, 34, pw, 2, "#6e4f1a");
      PX.rect(g, 240 - pw / 2 + 3, 26, 2, 2, "#6e4f1a"); PX.rect(g, 240 + pw / 2 - 5, 26, 2, 2, "#6e4f1a");
      PX.text(g, label, 240, 24, { col: "#2b1a08", align: "center" });
      PX.rect(g, 236, 36, 8, 6, "#6e4f1a");
      // body
      PX.rect(g, BX, BY, BW, BH, G2); PX.rect(g, BX, BY, BW, 4, G3); PX.rect(g, BX, BY, 4, BH, G3);
      PX.rect(g, BX + BW - 6, BY, 6, BH, G1); PX.rect(g, BX, BY + BH - 6, BW, 6, G1);
      PX.rect(g, BX + 10, BY + BH, 22, 10, G1); PX.rect(g, BX + BW - 32, BY + BH, 22, 10, G1);
      for (const [x, y] of [[BX + 8, BY + 8], [BX + BW - 12, BY + 8], [BX + 8, BY + BH - 12], [BX + BW - 12, BY + BH - 12]]) { PX.rect(g, x, y, 3, 3, G4); PX.rect(g, x + 1, y + 1, 2, 2, G1); }
      // interior (behind the door)
      PX.rect(g, DX, DY, DW, DH, "#0b0e12");
      PX.rect(g, DX, DY, DW, 10, "#1a2129"); PX.rect(g, DX, DY, 10, DH, "#151b22"); PX.rect(g, DX + DW - 10, DY, 10, DH, "#151b22"); PX.rect(g, DX, DY + DH - 10, DW, 10, "#1e252e");
      for (const y of [DY + 56, DY + 104]) { PX.rect(g, DX + 10, y, DW - 20, 4, "#2a333c"); PX.rect(g, DX + 10, y, DW - 20, 1, "#46535f"); }
      PX.line(g, DX + 10, DY + 10, DX + 40, DY + 10, "#46535f"); PX.line(g, DX + 10, DY + 10, DX + 10, DY + 38, "#46535f"); PX.line(g, DX + 10, DY + 10, DX + 32, DY + 30, "#46535f");
      PX.line(g, DX + 26, DY + 10, DX + 10, DY + 26, "#3a4654"); PX.line(g, DX + 36, DY + 10, DX + 10, DY + 34, "#3a4654");
      PX.circle(g, DX + 120, DY + DH - 14, 4, "#3a4654"); PX.rect(g, DX + 113, DY + DH - 12, 14, 2, "#2a333c");
      // door
      const th = PX.q(PX.p(t, open, 0.7, "out"), 7) * 2.0;
      if (th <= 0) {
        g.drawImage(front, DX, DY);
        const stops = [[0.2, 0], [1.2, 26], [2.0, 15], [2.6, 21]], pos = Math.floor(PX.KF(stops, t)) % 12;
        const a = pos * Math.PI / 6;
        for (let k = -1; k <= 0; k++) PX.line(g, DX + cxD + k, DY + cyD, DX + cxD + k + 19 * Math.sin(a), DY + cyD - 19 * Math.cos(a), "#e8323a");
        PX.circle(g, DX + cxD, DY + cyD, 3, "#2a333c");
        // handle spokes: turn 45 deg just before opening
        const ha = t > open - 0.35 ? Math.PI / 4 : 0;
        for (let k = 0; k < 3; k++) { const a2 = ha + k * 2 * Math.PI / 3, hx = DX + 135 + Math.round(18 * Math.sin(a2)), hy = DY + 74 - Math.round(18 * Math.cos(a2)); PX.line(g, DX + 135, DY + 74, hx, hy, "#c8d2da"); PX.line(g, DX + 136, DY + 74, hx + 1, hy, "#8b9bab"); PX.circle(g, hx, hy, 3, "#e0b04a"); }
        PX.circle(g, DX + 135, DY + 74, 5, "#46535f");
        if (t > 2.6 && t < 3.0) PX.text(g, "CLICK", DX + cxD + 34, DY + 22, { font: "v", size: 18, col: C.yellow });
      } else {
        const co = Math.cos(th), si = Math.sin(th), n = Math.round(Math.abs(DW * co)), src = co >= 0 ? front : back;
        for (let j = 0; j < n; j++) {
          const f = (j + 0.5) / n, ext = Math.round(f * si * 22), sx = Math.min(DW - 1, Math.floor(f * DW));
          g.drawImage(src, co >= 0 ? sx : DW - 1 - sx, 0, 1, DH, co >= 0 ? DX + j : DX - 1 - j, DY - ext, 1, DH + 2 * ext);
        }
        if (co < 0) { const ext = Math.round(si * 22), x = DX - n - 5; PX.rect(g, x, DY - ext, 5, DH + 2 * ext, "#2a333c"); for (const y of [0.2, 0.5, 0.8]) PX.rect(g, x - 6, DY - ext + Math.round((DH + 2 * ext) * y), 6, 6, G4); }
        PX.rect(g, DX - 4, DY + 18, 4, 16, G1); PX.rect(g, DX - 4, DY + DH - 34, 4, 16, G1);
      }
      // dust puffs
      if (t > open + 0.1 && t < open + 1.6) {
        const u = (t - open - 0.1) / 1.5;
        PX.alpha(g, 0.85 * (1 - u), () => puffs.forEach(([dx, dy, r]) => PX.circle(g, 240 + dx * 120 * u, 140 + dy * 90 * u, Math.round(r + 7 * u), "#9aa6b2")));
      }
      // moth flutters out
      const t0 = open + 0.8;
      if (t > t0) {
        const u = (t - t0) / 3.4, fr = Math.floor(t * 10) % 2;
        const mx = 236 + 210 * u + Math.round(14 * Math.sin(u * 8)), my = 150 - 160 * u + Math.round(5 * Math.sin(t * 13));
        if (mx < 500 && my > -20) PX.sprite(g, MOTH[fr], mx, my, { w: "#d8cdb0", b: "#6b5a44" }, 4);
      }
      if (t >= gone) end_scaled(g, end_slam(t, gone), 240, 246, () => PX.text(g, text, 240, 238, { size: 16, col: C.red, align: "center" }));
    };
  };

  // ---------- profile ----------
  // o: name ("CS GRAD, 2027"), fields [{label, val}] (PROJECTS BUILT/NONE, INTERNSHIP/NONE, CURIOSITY/???),
  //    at [1.5, 3.0, 4.5], degree (true: a green "DEGREE YES" row first)
  K.profile = (o) => {
    const name = o.name || "CS GRAD, 2027";
    const fields = o.fields || [{ label: "PROJECTS BUILT", val: "NONE" }, { label: "INTERNSHIP", val: "NONE" }, { label: "CURIOSITY", val: "???" }];
    const ats = o.at || [1.5, 3.0, 4.5];
    const rows = (o.degree === false ? [] : [{ label: "DEGREE", val: "YES", ok: true, at: 0.6 }])
      .concat(fields.map((f, i) => ({ label: f.label, val: f.val || "NONE", at: ats[i] !== undefined ? ats[i] : 1.5 + i * 1.5 })));
    const markAt = (r) => r.at + r.val.length / 10 + 0.15;
    const last = Math.max(...rows.map(markAt)) + 0.9;
    return (g, t, d) => {
      const X = 84, W = 312, H = 230, Y = 20 - Math.round(PX.q(1 - PX.p(t, -0.1, 0.45, "out"), 5) * 260);
      let sh = 0; rows.forEach((r) => { if (!r.ok) sh += end_shake(t, markAt(r), 0.25, 2); });
      g.translate(sh, 0);
      const alarm = t > last, bc = alarm ? (PX.blink(t, 0.36) ? C.red : "#5a1a1a") : C.cyan;
      PX.panel(g, X, Y, W, H, bc);
      if (alarm) PX.box(g, X + 2, Y + 2, W - 4, H - 4, bc);
      // photo with a grad in it
      PX.rect(g, X + 14, Y + 12, 46, 54, "#14283a"); PX.box(g, X + 14, Y + 12, 46, 54, G3);
      g.save(); g.beginPath(); g.rect(X + 15, Y + 13, 44, 52); g.clip();
      PX.person(g, X + 27, Y + 26, { sc: 3, col: C.cyan, cap: true, skin: C.skin[0] });
      g.restore();
      const crosses = rows.filter((r) => !r.ok && t >= markAt(r)).length;
      for (let k = 0; k < crosses; k++) end_drop(g, X + 50 - k * 2 + (k % 2) * 4, Y + 24 + k * 7 + (Math.floor(t * 3 + k) % 2), 2);
      PX.text(g, name, X + 72, Y + 18, { size: 16, col: C.yellow });
      PX.text(g, "RESUME.TXT", X + 72, Y + 44, { col: C.dim });
      for (let x = X + 12; x < X + W - 12; x += 6) PX.rect(g, x, Y + 76, 3, 1, G2);
      rows.forEach((r, i) => {
        const y = Y + 90 + i * 34;
        if (t < Math.min(r.at, 0.25 + i * 0.12)) return;
        const m = markAt(r), mc = r.ok ? C.green : C.red;
        if (t >= m && t < m + 0.15) PX.rect(g, X + 8, y - 4, W - 16, 26, r.ok ? "#12452a" : "#4a1218");
        const lw = PX.text(g, r.label, X + 16, y - 4, { font: "v", size: 22, col: C.cyan });
        for (let x = X + 22 + lw; x < X + 196; x += 4) PX.rect(g, x, y + 11, 1, 1, G2);
        if (t >= r.at) {
          const s = PX.typed(r.val, t, r.at, 10), w = PX.text(g, s, X + 202, y + 1, { size: 16, col: mc });
          if (s.length < r.val.length && PX.blink(t, 0.2)) PX.rect(g, X + 204 + w, y + 1, 8, 16, mc);
        }
        if (t >= m) end_scaled(g, end_pop(t, m, 0.25), X + W - 26, y + 9, () => end_mark(g, r.ok ? "ok" : "x", X + W - 26, y + 9, 3));
      });
    };
  };

  // ---------- door_ai ----------
  const SHRUG = [
    ["...hhh...", "..hhhhh..", "..sssss..", "..s.s.s..", "..sssss..", "s..sss..s", "c.ccccc.c", "ccc.c.ccc", "..ccccc..", "...ccc...", "...p.p...", "...p.p...", "..bb.bb.."],
    ["...hhh...", "..hhhhh..", "..sssss..", "..s.s.s..", "s.sssss.s", "c..sss..c", "ccccccccc", "..c.c.c..", "..ccccc..", "...ccc...", "...p.p...", "...p.p...", "..bb.bb.."],
  ];
  // o: doors (["BIOLOGY","BUSINESS","MEDIA","HISTORY"]), door (1) gets the sticker, at (3.5), say ("DON'T PANIC")
  K.door_ai = (o) => {
    const doors = o.doors || ["BIOLOGY", "BUSINESS", "MEDIA", "HISTORY"], di = o.door !== undefined ? o.door : 1;
    const at = o.at !== undefined ? o.at : 3.5, say = o.say || "DON'T PANIC";
    const n = doors.length, DWd = 76, gap = Math.floor((480 - n * DWd) / (n + 1));
    const dx = (i) => gap + i * (DWd + gap);
    const plateC = [C.green, C.yellow, C.pink, C.purple, C.orange, C.cyan];
    const R = PX.rnd(17), qx0 = dx(di) + 52, Q = [];
    for (let k = 0; qx0 + k * 26 < 462; k++) Q.push({ x: qx0 + k * 26, col: SHIRTS[Math.floor(R() * SHIRTS.length)], hair: HAIRS[Math.floor(R() * HAIRS.length)], skin: C.skin[Math.floor(R() * 4)], ph: R() * 6 });
    return (g, t, d) => {
      // wall, floor, ceiling lights
      PX.rect(g, 0, 36, 480, 176, "#151a26"); PX.rect(g, 0, 36, 480, 3, "#232b3c"); PX.rect(g, 0, 196, 480, 16, "#1b2130"); PX.rect(g, 0, 196, 480, 2, "#2a3346");
      PX.rect(g, 0, 212, 480, 30, "#1a202c"); for (let x = 0; x < 480; x += 40) PX.rect(g, x, 213, 1, 29, "#232b3a"); PX.rect(g, 0, 226, 480, 1, "#232b3a");
      PX.rect(g, 0, 212, 480, 1, "#3a4654");
      for (let i = 0; i < n; i++) {
        const lx = dx(i) + DWd / 2, off = i === 2 && (PX.blink(t, 2.3, 0.08) || (t > 1.1 && t < 1.2));
        PX.rect(g, lx - 18, 39, 36, 4, off ? "#3a4654" : "#e8f1d0");
        if (!off) PX.alpha(g, 0.07, () => { for (let k = 0; k < 5; k++) PX.rect(g, lx - 20 - k * 6, 43 + k * 6, 40 + k * 12, 6, "#e8f1d0"); });
      }
      // doors
      for (let i = 0; i < n; i++) {
        const x = dx(i), y = 82, hot = i === di && t >= at;
        const pc = plateC[i % plateC.length];
        PX.rect(g, x + 2, 58, DWd - 4, 16, "#0d1420"); PX.box(g, x + 2, 58, DWd - 4, 16, pc);
        PX.text(g, doors[i], x + DWd / 2, 62, { col: C.ink, align: "center" });
        PX.rect(g, x - 4, y - 4, DWd + 8, 134, G1); PX.rect(g, x - 4, y - 4, DWd + 8, 2, G3);
        PX.rect(g, x, y, DWd, 130, "#7a4e30"); PX.rect(g, x, y, 3, 130, "#a06a44"); PX.rect(g, x + DWd - 4, y, 4, 130, "#5a3820");
        PX.box(g, x + 10, y + 46, DWd - 20, 30, "#5a3820"); PX.box(g, x + 10, y + 84, DWd - 20, 34, "#5a3820");
        PX.rect(g, x + 22, y + 10, DWd - 44, 24, hot ? "#f25ca8" : "#2a4a66"); PX.rect(g, x + 22, y + 10, DWd - 44, 2, hot ? "#ffc0de" : "#5a8aa8");
        PX.rect(g, x + DWd / 2 - 1, y + 10, 2, 24, "#5a3820");
        PX.rect(g, x + DWd - 14, y + 70, 5, 5, C.yellow); PX.rect(g, x + DWd - 14, y + 74, 5, 1, "#b8860b");
        if (i === di && t >= at) {
          const cx = x + DWd / 2, cy = y + 62;
          end_scaled(g, end_slam(t, at), cx, cy, () => {
            PX.rect(g, cx - 24, cy - 14, 48, 28, C.white); PX.rect(g, cx - 22, cy - 12, 44, 24, C.pink); PX.rect(g, cx - 22, cy - 12, 44, 3, "#ff9ccc");
            PX.text(g, "AI", cx + 1, cy - 7, { size: 16, col: C.white, align: "center" });
          });
          if (t > at + 0.2) [[-30, -20], [30, -16], [-26, 22], [32, 20]].forEach(([sx, sy], k) => end_sparkle(g, cx + sx, cy + sy, Math.floor(t * 7) + k, k % 2 ? C.yellow : C.white, 2));
        }
      }
      // queue appears at the AI door
      Q.forEach((p, k) => {
        const ts = at + 0.4 + k * 0.09;
        if (t < ts) return;
        const x = Math.max(p.x, Math.round(500 - (t - ts) * 420)), moving = x > p.x;
        const bob = moving ? 0 : (Math.floor(t * 2 + p.ph) % 2);
        PX.person(g, x, 173 - bob, { sc: 3, col: p.col, hair: p.hair, skin: p.skin, frame: moving ? Math.floor(t * 10) % 2 : 0, cap: k % 3 === 1 });
      });
      if (t > at + 1.2) end_bang(g, dx(di) + DWd / 2 - 2, 18 + (Math.floor(t * 4) % 2), 3);
      // student walks in, then shrugs
      const sx = Math.min(26, Math.round(-36 + t * 50)), walking = sx < 26, SY = 186;
      if (t < at + 1.4) PX.person(g, sx, SY, { sc: 4, col: C.cyan, cap: true, frame: walking ? Math.floor(t * 5) % 2 : 0 });
      else { const f = Math.floor((t - at) * 3) % 2; PX.sprite(g, SHRUG[f], sx - 4, SY, { h: "#2b1d14", s: C.skin[1], c: C.cyan, p: "#2d3b55", b: "#111" }, 4);
        PX.rect(g, sx - 4, SY - 4, 36, 4, "#111"); PX.rect(g, sx + 8, SY - 8, 12, 4, "#111"); PX.rect(g, sx + 28, SY, 4, 12, C.yellow); }
      if (t > at + 1.7) end_scaled(g, end_pop(t, at + 1.7), sx + 14, 170, () => end_bubble(g, say, Math.max(60, sx + 40), 156, C.yellow));
    };
  };

  // ---------- quest ----------
  // o: title ("QUESTS"), items [{text, at, done}] (BUILD SOMETHING REAL 0.5/9, ONE INTERNSHIP 12/14,
  //    HARD MATH ELECTIVES 15/18), sub {text:"TO-DO APP", at:3, strike:3.8, end:5} (false = none), xp ("+100 XP")
  K.quest = (o) => {
    const items = o.items || [{ text: "BUILD SOMETHING REAL", at: 0.5, done: 9 }, { text: "ONE INTERNSHIP", at: 12, done: 14 }, { text: "HARD MATH ELECTIVES", at: 15, done: 18 }];
    const sub = o.sub === false ? null : Object.assign({ text: "TO-DO APP", at: 3, strike: 3.8, end: 5 }, o.sub || {});
    const title = o.title || "QUESTS", xp = o.xp || "+100 XP";
    const R = PX.rnd(9), burst = [...Array(8)].map((_, k) => [Math.cos(k * Math.PI / 4), Math.sin(k * Math.PI / 4), R()]);
    return (g, t, d) => {
      const X = 36, Y = 18, W = 408, H = 234, n = items.length;
      PX.panel(g, X, Y, W, H, C.purple);
      PX.rect(g, X + 2, Y + 2, W - 4, 32, "#1c1236"); PX.rect(g, X + 2, Y + 34, W - 4, 1, C.purple);
      // scroll icon
      PX.rect(g, X + 12, Y + 9, 16, 16, "#d9c79a"); PX.rect(g, X + 10, Y + 8, 20, 3, "#b89a5a"); PX.rect(g, X + 10, Y + 23, 20, 3, "#b89a5a");
      for (let k = 0; k < 3; k++) PX.rect(g, X + 15, Y + 13 + k * 3, 10, 1, "#6e5a30");
      const done = items.filter((it) => it.done !== undefined && t >= it.done).length;
      const lastDone = Math.max(-9, ...items.map((it) => (it.done !== undefined && t >= it.done ? it.done : -9)));
      const tw = PX.text(g, title + " ", X + 38, Y + 10, { size: 16, col: C.yellow });
      end_scaled(g, lastDone > 0 ? end_pop(t, lastDone, 0.3) : 1, X + 38 + tw + 24, Y + 18, () =>
        PX.text(g, done + "/" + n, X + 38 + tw, Y + 10, { size: 16, col: done === n ? C.green : C.white }));
      const rowH = Math.min(64, Math.floor((H - 46) / Math.max(1, n)));
      items.forEach((it, i) => {
        const y = Y + 46 + i * rowH, ok = it.done !== undefined && t >= it.done;
        if (t < it.at) { // locked quest slot
          PX.rect(g, X + 14, y, 20, 20, "#0a1119"); PX.box(g, X + 14, y, 20, 20, "#2a3346");
          PX.rect(g, X + 19, y + 9, 10, 8, G2); PX.box(g, X + 20, y + 4, 8, 7, G2); PX.rect(g, X + 23, y + 12, 2, 3, "#0a1119");
          PX.text(g, "? ? ?", X + 44, y + 2, { size: 16, col: "#2f3d52" });
          return;
        }
        const bx = X + 14, tx = X + 44, f = end_fit(g, it.text, X + W - 40 - tx);
        PX.rect(g, bx, y, 20, 20, ok ? "#0f3a1e" : "#0a1119"); PX.box(g, bx, y, 20, 20, ok ? C.green : C.dim); PX.box(g, bx + 1, y + 1, 18, 18, ok ? C.green : C.dim);
        const s = PX.typed(it.text, t, it.at, 20);
        end_textC(g, s, tx, y + 10, f, ok ? C.green : C.ink);
        // progress segments fill between start and done
        const t1 = it.at + it.text.length / 20 + 0.3, segs = 12;
        const fill = it.done === undefined ? 0 : Math.floor(segs * PX.clamp((t - t1) / Math.max(0.5, it.done - t1 - 0.2), 0, 1));
        if (t > t1) for (let k = 0; k < segs; k++) PX.rect(g, tx + k * 13, y + 26, 11, 7, k < fill ? (ok ? C.green : C.cyan) : "#1a2a3a");
        if (!ok && t > t1) end_bang(g, X + W - 22, y + 2 + (Math.floor(t * 3) % 2) * 2, 2);
        if (ok) {
          end_scaled(g, end_pop(t, it.done, 0.3), bx + 10, y + 10, () => end_mark(g, "ok", bx + 12, y + 7, 3));
          const u = (t - it.done) / 0.7;
          if (u < 1) burst.forEach(([cx, cy, r], k) => end_sparkle(g, bx + 10 + Math.round(cx * (10 + 26 * u)), y + 10 + Math.round(cy * (8 + 18 * u)), Math.floor(t * 12) + k, k % 2 ? C.yellow : C.green, 1));
          const v = (t - it.done) / 1.6;
          if (v < 1) PX.text(g, xp, X + W - 16, y + 26 - Math.round(PX.q(v, 6) * 6), { col: C.yellow, align: "right" });
          else end_sparkle(g, X + W - 26, y + 10, Math.floor(t * 4 + i), C.green, 1);
        }
        if (i === 0 && sub && t >= sub.at && t < sub.end) {
          const sx = tx + segs * 13 + 14, sw = PX.text(g, PX.typed(sub.text, t, sub.at, 14), sx, y + 20, { font: "v", size: 22, col: G3 });
          if (t >= sub.strike) PX.rect(g, sx - 3, y + 30, Math.round((PX.tw(g, sub.text, { font: "v", size: 22 }) + 6) * PX.q(PX.p(t, sub.strike, 0.25, "lin"), 6)), 2, C.red);
        }
      });
    };
  };

  // ---------- rename ----------
  // o: total (500), start (0.4), done (4.0), complain (4.5), msg ("IT BROKE!!"), from ("COUSIN:"), prefix ("STUDIO_WK46_")
  K.rename = (o) => {
    const total = o.total || 500, st = o.start !== undefined ? o.start : 0.4, dn = o.done !== undefined ? o.done : 4.0;
    const cp = o.complain !== undefined ? o.complain : 4.5, msg = o.msg || "IT BROKE!!", from = o.from || "COUSIN:", pre = o.prefix || "STUDIO_WK46_";
    const R = PX.rnd(46), olds = [...Array(total + 8)].map((_, i) => "IMG_" + (4821 + i * 3 + Math.floor(R() * 3)) + ".JPG");
    const pad = (v) => String(v).padStart(String(total).length, "0");
    const icon = (g, x, y) => { PX.rect(g, x, y, 14, 11, G3); PX.rect(g, x + 1, y + 1, 12, 9, "#2a6a9a"); PX.rect(g, x + 9, y + 2, 2, 2, C.yellow); PX.line(g, x + 1, y + 9, x + 5, y + 4, "#3df56b"); PX.line(g, x + 5, y + 4, x + 9, y + 9, "#3df56b"); PX.rect(g, x + 1, y + 9, 12, 1, "#2a8a4a"); };
    return (g, t, d) => {
      const X = 28, Y = 18, W = 424, H = 234;
      const p = PX.clamp((t - st) / Math.max(0.1, dn - st), 0, 1), cnt = Math.round(total * PX.q(p, 60)), fin = cnt >= total;
      PX.panel(g, X, Y, W, H, C.cyan);
      PX.rect(g, X + 2, Y + 2, W - 4, 22, "#10283a"); PX.rect(g, X + 2, Y + 24, W - 4, 1, C.teal);
      PX.text(g, "RENAME.PY", X + 10, Y + 9, { col: C.yellow });
      PX.text(g, pad(cnt) + "/" + total, X + W - 12, Y + 9, { col: fin ? C.green : C.white, align: "right" });
      const rowH = 21, nrow = 8, base = PX.clamp(cnt - 5, 0, total - nrow), broke = t > cp + 0.6;
      for (let r = 0; r < nrow; r++) {
        const i = base + r, y = Y + 32 + r * rowH, cur = i === cnt && !fin;
        if (cur) PX.rect(g, X + 6, y - 2, W - 12, rowH - 2, "#3a3010");
        PX.text(g, pad(i + 1), X + 12, y + 1, { font: "v", size: 18, col: C.dim });
        icon(g, X + 50, y + 2);
        let name, col;
        if (i < cnt || (fin && i < total)) { name = pre + pad(i + 1) + ".JPG"; col = C.green; if (broke && (r === 5 || r === 7) && PX.blink(t, 0.4)) { name = pre + "???.JPG"; col = C.red; } }
        else if (cur) { const nn = pre + pad(i + 1) + ".JPG"; name = nn.slice(0, 1 + Math.floor(t * 90) % nn.length) + "_"; col = C.yellow; }
        else { name = olds[i]; col = C.ink; }
        PX.text(g, name, X + 72, y - 1, { font: "v", size: 22, col });
      }
      // progress bar
      const segs = 34, by = Y + H - 26;
      for (let k = 0; k < segs; k++) PX.rect(g, X + 12 + k * 12, by, 10, 10, k < Math.round(segs * cnt / total) ? (fin ? C.green : C.cyan) : "#1a2a3a");
      if (fin) end_mark(g, "ok", X + W - 20, by + 4, 2);
      // phone notification banner drops in over the list
      if (t >= cp) {
        const u = PX.q(PX.p(t, cp, 0.3, "out"), 6), buzz = t > cp + 1 && PX.blink(t - cp, 1.6, 0.15) ? (Math.floor(t * 30) % 2 ? 1 : -1) : 0;
        const bx = 64 + end_shake(t, cp + 0.3, 0.6, 3) + buzz, by = Math.round(PX.lerp(-80, 74, u)), bw = 352, bh = 72;
        PX.panel(g, bx, by, bw, bh, C.yellow, "#1e2a38"); PX.box(g, bx + 2, by + 2, bw - 4, bh - 4, "#5a4a1a");
        // phone icon with a chat bubble
        const ix = bx + 16, iy = by + 14;
        PX.rect(g, ix, iy, 26, 44, G3); PX.rect(g, ix + 2, iy + 5, 22, 32, "#0b1622"); PX.rect(g, ix + 10, iy + 39, 6, 3, G1);
        PX.rect(g, ix + 5, iy + 11, 16, 11, C.green); PX.rect(g, ix + 7, iy + 22, 4, 3, C.green); PX.rect(g, ix + 8, iy + 15, 10, 2, "#0f3a1e");
        if (t > cp + 0.3 && PX.blink(t, 0.3)) for (const sd of [-1, 1]) { const vx = sd < 0 ? ix - 6 : ix + 30; PX.rect(g, vx, iy + 14, 2, 14, C.white); PX.rect(g, vx + sd * 4, iy + 10, 2, 22, C.white); }
        PX.text(g, from, bx + 62, by + 14, { size: 16, col: C.yellow });
        PX.text(g, "NOW", bx + bw - 14, by + 12, { font: "v", size: 18, col: C.dim, align: "right" });
        PX.text(g, msg, bx + 62, by + 42, { size: 16, col: PX.blink(t, 0.5) ? C.red : C.white });
        end_scaled(g, end_pop(t, cp + 0.3, 0.25), bx + bw - 2, by + 2, () => { PX.circle(g, bx + bw - 2, by + 2, 9, C.red); PX.text(g, "!", bx + bw - 1, by - 2, { col: C.white, align: "center" }); });
      }
    };
  };

  // ---------- queue ----------
  // o: n (12) people, door ("CS"), leave (3.0) ~40% walk off with "$", love (9.0) hearts over the rest, frac (0.4)
  K.queue = (o) => {
    const N = o.n || 10, leave = o.leave !== undefined ? o.leave : 3.0, love = o.love !== undefined ? o.love : 9.0;
    const door = o.door || "CS", frac = o.frac !== undefined ? o.frac : 0.4, R = PX.rnd(23);
    const SC = 5, SP = 40, FRONT = 332, slotX = (k) => FRONT - SP * k;
    const P = [...Array(N)].map((_, k) => ({ x: slotX(k), col: SHIRTS[Math.floor(R() * SHIRTS.length)], hair: HAIRS[Math.floor(R() * HAIRS.length)], skin: C.skin[Math.floor(R() * 4)], cap: R() < 0.35, ph: Math.floor(R() * 4), leave: false }));
    const idx = [...Array(N - 1)].map((_, k) => k + 1).map((k) => [R(), k]).sort((a, b) => a[0] - b[0]).map((a) => a[1]);
    idx.slice(0, Math.round(N * frac)).forEach((k, j) => { P[k].leave = true; P[k].lt = leave + j * 0.4; });
    let m = 0; P.forEach((p) => { if (!p.leave) { p.slot = m; p.mt = leave + 2.0 + m * 0.12; m++; } });
    const FY = 238, PY = FY - 13 * SC;
    return (g, t, d) => {
      // wall, floor, door
      PX.rect(g, 0, 64, 480, FY - 64, "#0e1320"); PX.rect(g, 0, 64, 480, 2, "#1a2232"); PX.rect(g, 0, FY - 8, 480, 8, "#161d2b");
      PX.rect(g, 0, FY, 480, 3, G2); PX.rect(g, 0, FY + 3, 480, 29, "#141a24");
      PX.rect(g, 380, 50, 96, FY - 50, G1); PX.rect(g, 380, 50, 96, 3, G3);
      PX.rect(g, 387, 57, 82, FY - 57, "#2c4a66"); PX.rect(g, 387, 57, 4, FY - 57, "#4a7a9a"); PX.rect(g, 464, 57, 5, FY - 57, "#1c3046");
      PX.box(g, 398, 124, 60, 46, "#1c3046"); PX.box(g, 398, 178, 60, 50, "#1c3046");
      PX.rect(g, 402, 70, 52, 40, PX.blink(t, 1.4, 0.85) ? "#9ff4f6" : "#5fb8c0"); PX.rect(g, 427, 70, 2, 40, "#2c4a66"); PX.rect(g, 402, 89, 52, 2, "#2c4a66");
      PX.rect(g, 454, 150, 6, 6, C.yellow);
      PX.rect(g, 384, 10, 88, 36, "#0d1824"); PX.box(g, 384, 10, 88, 36, C.cyan); PX.box(g, 385, 11, 86, 34, C.teal);
      PX.text(g, door, 429, 16, { size: 24, col: C.cyan, align: "center" });
      const stay = [], go = [];
      P.forEach((p, k) => {
        let x = p.x, y = PY, moving = false;
        if (k === N - 1 && t < 2) { x = Math.min(p.x, Math.round(-90 + t * 60)); moving = x < p.x; }
        if (p.leave && t >= p.lt) {
          const u = t - p.lt;
          y = PY + (u < 0.1 ? 0 : u < 0.2 ? 10 : 20);
          x = u < 0.25 ? p.x : Math.round(p.x - (u - 0.25) * 90); moving = u >= 0.25;
          if (x > -40) go.push({ p, x, y, moving });
        } else {
          if (!p.leave && t >= p.mt) { const tx = slotX(p.slot), u = PX.clamp((t - p.mt) / Math.max(0.01, (tx - p.x) / 60), 0, 1); x = Math.round(PX.lerp(p.x, tx, u)); moving = u > 0 && u < 1; }
          stay.push({ p, x, y, moving });
        }
      });
      const draw = ({ p, x, y, moving }) => {
        const bob = moving ? 0 : ((Math.floor(t * 2) + p.ph) % 4 === 0 ? 2 : 0);
        PX.person(g, x, y - bob, { sc: SC, col: p.col, hair: p.hair, skin: p.skin, cap: p.cap, frame: moving ? Math.floor(t * 6) % 2 : 0 });
      };
      stay.forEach((s) => {
        draw(s);
        if (t >= love) {
          const hx = s.x + 7, hy = s.y - 30 - ((Math.floor(t * 2.5) + s.p.ph) % 2) * 2, big = Math.floor(t * 1.25 + s.p.slot * 0.5) % 4 === 0;
          end_scaled(g, end_pop(t, love + s.p.slot * 0.15, 0.3), hx + 10, hy + 9, () => end_heart(g, hx - (big ? 4 : 0), hy - (big ? 3 : 0), big ? 4 : 3));
        }
      });
      go.forEach((s) => {
        draw(s);
        end_scaled(g, end_pop(t, s.p.lt, 0.25), s.x + 17, s.y - 18, () =>
          PX.text(g, "$", s.x + 18, s.y - 30 - (Math.floor(t * 4) % 2) * 2, { size: 24, col: C.green, align: "center" }));
      });
    };
  };

  // ---------- ticket ----------
  // o: no (0.6) cross on the ticket, yes (2.2) tick on the dumbbell, only (3.8) reps start, rep (0.9 s per rep)
  K.ticket = (o) => {
    const no = o.no !== undefined ? o.no : 0.6, yes = o.yes !== undefined ? o.yes : 2.2, only = o.only !== undefined ? o.only : 3.8, rep = o.rep || 0.9;
    const clearCircle = (g, cx, cy, r) => { for (let y = -r; y <= r; y++) { const w = Math.floor(Math.sqrt(r * r - y * y)); g.clearRect(cx - w, cy + y, 2 * w + 1, 1); } };
    const LIFT = [0, -12, -28, -44, -52, -44, -28, -12];
    const TK = "#2a1806";
    return (g, t, d) => {
      // ticket slides in from left
      const tx = Math.round(-250 * PX.q(1 - PX.p(t, -0.1, 0.4, "out"), 6)) + 12, ty = 74, TW = 230, TH = 112;
      PX.alpha(g, t > only ? 0.45 : 1, () => {
        PX.rect(g, tx, ty, TW, TH, "#9c7024"); PX.rect(g, tx, ty, TW, 4, "#c99a3a"); PX.rect(g, tx, ty + TH - 4, TW, 4, "#6a4a16");
        for (let x = tx + 6; x < tx + TW - 6; x += 6) { PX.rect(g, x, ty + 8, 3, 1, "#6e4f1a"); PX.rect(g, x, ty + TH - 9, 3, 1, "#6e4f1a"); }
        for (let y = ty + 6; y < ty + TH - 4; y += 6) PX.rect(g, tx + 178, y, 2, 3, "#6e4f1a");
        for (let k = 0; k < 12; k++) PX.rect(g, tx + 188 + k * 3, ty + 24, k % 3 ? 1 : 2, 64, TK);
        PX.text(g, "JOB", tx + 90, ty + 24, { size: 24, col: TK, align: "center" });
        PX.text(g, "TICKET", tx + 90, ty + 58, { size: 16, col: TK, align: "center" });
        for (const sx of [tx + 22, tx + 158]) { PX.rect(g, sx - 1, ty + 84, 3, 9, "#6e4f1a"); PX.rect(g, sx - 4, ty + 87, 9, 3, "#6e4f1a"); }
        clearCircle(g, tx, ty + TH / 2, 12); clearCircle(g, tx + TW, ty + TH / 2, 12);
      });
      if (t >= no) end_scaled(g, end_slam(t, no), tx + 90, ty + 56, () => {
        const X2 = (c, w) => { for (let k = -w; k <= w; k++) { PX.line(g, tx + 42 + k, ty + 12, tx + 138 + k, ty + 100, c); PX.line(g, tx + 138 + k, ty + 12, tx + 42 + k, ty + 100, c); } };
        X2(INK, 8); X2("#e8202a", 6);
      });
      // lifter + dumbbell slide in from right; bar held at chest, then overhead reps
      const cx = 364 + Math.round(220 * PX.q(1 - PX.p(t, 1.3, 0.45, "out"), 6));
      let lift = 0, reps = 0;
      if (t > only) { const ph = (t - only) / rep; reps = Math.floor(ph + 0.5); lift = LIFT[Math.floor((ph % 1) * LIFT.length)]; }
      const PYp = 110, cy = 150 + lift, sh = PYp + 30;
      PX.person(g, cx - 17, PYp, { sc: 5, col: C.pink, hair: "#2b1d14", skin: C.skin[2] });
      if (lift <= -44 && PX.blink(t, 0.2)) { end_drop(g, cx - 30, PYp - 2, 2); end_drop(g, cx + 24, PYp + 2, 2); }
      for (const s of [-1, 1]) { // arms from shoulders to the bar
        const ax = cx + s * 20 - 2, top = Math.min(cy, sh), h = Math.abs(sh - cy) + 4;
        PX.rect(g, ax, top, 5, h, C.skin[2]); PX.rect(g, ax - 1, cy - 4, 7, 8, C.skin[2]);
      }
      PX.rect(g, cx - 74, cy - 3, 148, 6, G3); PX.rect(g, cx - 74, cy - 3, 148, 2, G4);
      for (const s of [-1, 1]) {
        const plate = (off, w, h) => { const x = s < 0 ? cx - off - w : cx + off; PX.rect(g, x, cy - h / 2, w, h, G1); PX.rect(g, x, cy - h / 2, w, 2, G3); PX.rect(g, x + (s < 0 ? 0 : w - 2), cy - h / 2, 2, h, G2); };
        plate(42, 6, 22); plate(48, 12, 56); plate(60, 10, 44); plate(70, 6, 16);
      }
      if (t > 1.6) PX.text(g, "TRAINING", Math.min(cx, 480), 198, { size: 16, col: C.cyan, align: "center" });
      if (t >= yes) end_scaled(g, end_pop(t, yes, 0.3), 446, 52, () => end_mark(g, "ok", 446, 52, 5));
      if (t > only) end_scaled(g, end_pop(t, only, 0.25), 364, 230, () => PX.text(g, "REPS: " + reps, 364, 222, { size: 16, col: C.white, align: "center" }));
    };
  };

  // ---------- checker ----------
  // o: ghost (3.0), label ("REPLACED")
  K.checker = (o) => {
    const ghost = o.ghost !== undefined ? o.ghost : 3.0, label = o.label || "REPLACED", R = PX.rnd(12);
    const LINES = [...Array(9)].map(() => ({ ind: Math.floor(R() * 3) * 5, w: 18 + Math.floor(R() * 32), col: [C.cyan, C.pink, C.yellow, C.green, C.purple][Math.floor(R() * 5)] }));
    // ghost: person silhouette with a checkerboard cut (see-through), sat on the seat (legs hidden)
    const GHOST = document.createElement("canvas"); GHOST.width = 40; GHOST.height = 70;
    { const q = GHOST.getContext("2d"); PX.person(q, 2, 2, { sc: 5, col: "#9fe8f0", hair: "#9fe8f0", skin: "#d8fbff", pants: "#9fe8f0" });
      for (let y = 0; y < 70; y++) for (let x = (y % 2); x < 40; x += 2) q.clearRect(x, y, 1, 1); }
    const STRIP = [...Array(30)].map(() => [Math.floor(R() * 6), 4 + Math.floor(R() * 10), [C.cyan, C.pink, C.yellow, C.green][Math.floor(R() * 4)]]);
    return (g, t, d) => {
      // floor + divider
      PX.rect(g, 0, 230, 480, 2, G2);
      for (let y = 40; y < 228; y += 8) PX.rect(g, 262, y, 1, 4, "#1f2a38");
      // reviewer behind the desk holding the printout
      PX.person(g, 136, 62, { sc: 4, col: C.purple, hair: "#5a3a1e", skin: C.skin[1] });
      const PXx = 112, PYy = 96, PWd = 84, PHd = 92;
      PX.rect(g, PXx, PYy, PWd, PHd, "#b9c1c8"); PX.rect(g, PXx, PYy, PWd, 2, "#dde2e6"); PX.rect(g, PXx + PWd - 3, PYy, 3, PHd, "#a9b2ba");
      LINES.forEach((l, i) => PX.rect(g, PXx + 8 + l.ind, PYy + 8 + i * 9, Math.min(l.w, PWd - 26 - l.ind), 4, l.col === C.yellow ? "#c99a20" : l.col === C.cyan ? "#2a9fad" : l.col === C.pink ? "#c23a80" : l.col === C.green ? "#1f9a45" : "#6a44c8"));
      PX.rect(g, PXx - 6, PYy + 50, 8, 10, C.skin[1]); PX.rect(g, PXx + PWd - 2, PYy + 50, 8, 10, C.skin[1]);
      // magnifier steps down the lines, ticking each
      const per = 0.42, li = Math.max(0, Math.floor((t - 0.3) / per)), cur = li % LINES.length;
      for (let i = 0; i < LINES.length; i++) if (i < li % (LINES.length + 3) && i !== cur) end_mark(g, "ok", PXx + PWd - 9, PYy + 10 + i * 9, 1);
      const mx = PXx + 30 + (cur % 2) * 6, my = PYy + 10 + cur * 9;
      for (let k = -2; k <= 2; k++) PX.line(g, mx + 14 + k, my + 14, mx + 34 + k, my + 34, k === -2 ? "#b07a50" : "#6e4f26");
      PX.rect(g, mx + 30, my + 28, 10, 10, C.skin[1]);
      PX.circle(g, mx, my, 19, G1); PX.circle(g, mx, my, 17, G4); PX.circle(g, mx, my, 14, "#bfe2ec");
      const l = LINES[cur]; PX.rect(g, mx - 13, my - 4, 26, 9, l.col); PX.rect(g, mx - 13, my - 4, 26, 2, "rgba(255,255,255,.35)");
      PX.rect(g, mx - 9, my - 11, 5, 2, "#ffffff"); PX.rect(g, mx - 11, my - 9, 2, 3, "#ffffff");
      // desk
      PX.rect(g, 84, 186, 156, 8, "#a0704a"); PX.rect(g, 84, 186, 156, 2, "#c89068"); PX.rect(g, 92, 194, 140, 36, "#5a3a24"); PX.rect(g, 92, 194, 140, 2, "#3a2414");
      PX.rect(g, 150, 204, 24, 3, "#8a5a3c");
      // robot feeding the printout strip
      const rx = 18, ry = 120;
      PX.rect(g, rx + 22, ry - 14, 2, 10, G3); PX.rect(g, rx + 20, ry - 18, 6, 5, PX.blink(t, 0.6) ? C.red : "#5a1a1a");
      PX.rect(g, rx + 4, ry - 4, 38, 30, G2); PX.rect(g, rx + 4, ry - 4, 38, 3, G3); PX.rect(g, rx + 10, ry + 3, 26, 14, "#0b1622");
      const blinkE = PX.blink(t + 0.3, 2.2, 0.08);
      PX.rect(g, rx + 14, ry + 7 + (blinkE ? 3 : 0), 5, blinkE ? 1 : 5, C.cyan); PX.rect(g, rx + 27, ry + 7 + (blinkE ? 3 : 0), 5, blinkE ? 1 : 5, C.cyan);
      PX.rect(g, rx, ry + 30, 46, 50, G2); PX.rect(g, rx, ry + 30, 46, 3, G3); PX.rect(g, rx + 42, ry + 30, 4, 50, G1);
      PX.rect(g, rx + 8, ry + 42, 30, 4, "#111"); PX.rect(g, rx + 8, ry + 56, 6, 6, C.green); PX.rect(g, rx + 18, ry + 56, 6, 6, C.yellow);
      PX.rect(g, rx + 8, ry + 80, 10, 30, G1); PX.rect(g, rx + 28, ry + 80, 10, 30, G1); PX.rect(g, rx + 4, ry + 108, 16, 4, G2); PX.rect(g, rx + 26, ry + 108, 16, 4, G2);
      // strip from robot slot over to the printout, code scrolling along it
      PX.rect(g, rx + 38, ry + 42, 112 - rx - 38, 8, "#b9c1c8"); PX.rect(g, rx + 38, ry + 49, 112 - rx - 38, 1, "#8a939b");
      const off = Math.floor(t * 24) % 12;
      for (let k = 0; k < 9; k++) { const s = STRIP[k % STRIP.length], x = rx + 40 + k * 9 + off - 12; if (x > rx + 39 && x + 6 < 111) PX.rect(g, x, ry + 44, 5, 3, s[2]); }
      // empty office chair (spins, slows), ghost appears at o.ghost
      const spin = PX.clamp(1 - t / (ghost + 0.5), 0, 1), fr = spin > 0 ? Math.floor(t * (3 + 9 * spin)) % 4 : 0;
      const bw = [56, 42, 18, 42][fr], ccx = 370;
      PX.rect(g, ccx - 30, 166, 60, 10, G1); PX.rect(g, ccx - 30, 166, 60, 3, G2);
      PX.rect(g, ccx - 3, 176, 6, 34, G2); PX.rect(g, ccx - 36, 210, 72, 5, G1); PX.rect(g, ccx - 36, 210, 72, 1, G3);
      for (const wx of [ccx - 36, ccx - 2, ccx + 32]) PX.rect(g, wx, 215, 5, 5, G2);
      PX.rect(g, ccx - bw / 2, 116, bw, 48, "#2d3b55"); PX.rect(g, ccx - bw / 2, 116, bw, 3, "#4a5f80"); if (bw > 20) PX.rect(g, ccx - bw / 2 + 4, 122, 3, 36, "#3d5070");
      PX.rect(g, ccx - 3, 164, 6, 4, G1);
      if (fr === 0) { PX.rect(g, ccx - 38, 150, 8, 4, G1); PX.rect(g, ccx + 30, 150, 8, 4, G1); PX.rect(g, ccx - 36, 154, 4, 12, G1); PX.rect(g, ccx + 32, 154, 4, 12, G1); }
      if (t >= ghost) { // dithered see-through sitter
        const a = PX.q(PX.p(t, ghost, 0.8, "lin"), 4) * (PX.blink(t, 0.18, 0.8) ? 0.9 : 0.6), yo = Math.floor(t * 2) % 2;
        PX.alpha(g, a, () => g.drawImage(GHOST, ccx - 20, 112 - yo));
        end_scaled(g, end_slam(t, ghost + 0.3), ccx - 4, 50, () => PX.text(g, label, ccx - 4, 42, { size: 16, col: C.red, align: "center" }));
      }
    };
  };

  // ---------- subscribe ----------
  const HAND = ["....kk......", "...kwwk.....", "...kwwk.....", "...kwwk.....", "...kwwkkk...", "...kwwkwwkk.", ".kkkwwkwwkwk", "kwwkwwwwwwwk", "kwwwwwwwwwwk", ".kwwwwwwwwsk", "..kwwwwwwwsk", "..kwwwwwwsk.", "...kwwwwssk.", "...kkkkkkkk."];
  const BELL = ["....yy....", "...yyyy...", "..yyyyyy..", "..yyyyyy..", "..yyyyyy..", ".yyyyyyyy.", ".yyyyyyyy.", "yyyyyyyyyy", "yyyyyyyyyy", "..........", "....oo....", ".....o...."];
  // o: press (1.2), comment (3.0 or the comment text), text ("WHAT ARE YOU STUDYING?"), label ("SUBSCRIBE")
  K.subscribe = (o) => {
    const press = o.press !== undefined ? o.press : 1.2;
    const cat = typeof o.comment === "number" ? o.comment : (o.commentAt !== undefined ? o.commentAt : 3.0);
    const text = typeof o.comment === "string" ? o.comment : (o.text || "WHAT ARE YOU STUDYING?");
    const label = o.label || "SUBSCRIBE", done = o.done || "SUBSCRIBED";
    return (g, t, d) => {
      const on = t >= press + 0.08, down = t >= press && t < press + 0.18 ? 1 : 0;
      // button
      const BX = 56, BY = 72, BW = 300, BH = 64, dep = down ? 5 : on ? 3 : 0, th = 8 - dep;
      const cBase = on ? "#46525e" : "#d62f2f", cTop = on ? "#6c7a88" : "#ff6a5e", cDark = on ? "#262f39" : "#7e1a1a";
      const hover = !on && t > press - 0.4 && PX.blink(t, 0.2);
      PX.rect(g, BX + 3, BY + dep + th, BW - 6, BH, cDark); PX.rect(g, BX, BY + dep + 3 + th, BW, BH - 6, cDark);
      PX.rect(g, BX + 3, BY + dep, BW - 6, BH, cBase); PX.rect(g, BX, BY + dep + 3, BW, BH - 6, cBase);
      PX.rect(g, BX + 3, BY + dep, BW - 6, 5, cTop);
      if (hover) PX.box(g, BX - 3, BY + dep - 3, BW + 6, BH + 6 + th, C.white);
      PX.text(g, on ? done : label, BX + BW / 2 + 1, BY + dep + 21, { size: 24, col: on ? "#b8c4ce" : C.white, align: "center" });
      // bell: grey until subscribed, then rings now and every 3 s
      const ringT = on ? ((t - press) % 3) : 9, ringing = ringT < 1.1;
      const sw = ringing ? [2, -2, 2, -2, 1, -1][Math.floor(ringT * 12) % 6] : 0;
      const bx = 396, by = 72, pal = on ? { y: C.yellow, o: "#c99a20" } : { y: G2, o: G1 };
      BELL.forEach((row, r) => PX.sprite(g, [row], bx + Math.round(sw * r / 3), by + r * 5, pal, 5));
      if (on) PX.rect(g, bx + 15 + sw, by + 12, 5, 15, "#ffe9a8");
      if (ringing) for (const s of [-1, 1]) { const wx = s < 0 ? bx - 12 : bx + 58; PX.rect(g, wx, by + 16, 3, 18, C.yellow); PX.rect(g, wx + s * 8, by + 8, 3, 34, C.yellow); }
      // hand cursor: glides to the button, presses, then leaves
      let hx, hy;
      const p1 = PX.q(PX.p(t, 0.1, press - 0.25, "out"), 10), p2 = PX.q(PX.p(t, press + 0.7, 0.6, "smooth"), 8);
      hx = PX.lerp(460, 214, p1); hy = PX.lerp(250, 104, p1);
      hx = PX.lerp(hx, 520, p2); hy = PX.lerp(hy, 300, p2);
      hy += down ? 4 : 0;
      if (t >= press && t < press + 0.3) for (const [dx, dy] of [[-10, -6], [10, -6], [-12, 4], [12, 4]]) PX.rect(g, hx + 4 + dx, hy + dy, 3, 3, C.white);
      PX.sprite(g, HAND, Math.round(hx), Math.round(hy), { k: INK, w: "#f2f2f2", s: "#b8c2cc" }, 3);
      // comment box
      if (t >= cat) {
        const u = PX.q(PX.p(t, cat, 0.3, "out"), 5), Y0 = Math.round(PX.lerp(280, 166, u));
        PX.panel(g, 56, Y0, 368, 74, C.cyan);
        PX.rect(g, 66, Y0 + 12, 30, 30, "#14283a"); PX.circle(g, 81, Y0 + 24, 6, C.skin[0]); PX.rect(g, 72, Y0 + 32, 18, 9, C.pink); PX.rect(g, 75, Y0 + 17, 12, 3, "#2b1d14");
        PX.text(g, "@YOU", 106, Y0 + 10, { col: C.dim });
        const f = end_fit(g, text, 304), s = PX.typed(text, t, cat + 0.35, 16);
        const w = end_textC(g, s, 106, Y0 + 38, f, C.ink);
        if (PX.blink(t, 0.5) || s.length < text.length) PX.rect(g, 108 + w, Y0 + 30, 3, 16, C.cyan);
        const tEnd = cat + 0.35 + text.length / 16;
        if (t > tEnd + 0.4) {
          const likes = Math.floor(Math.pow(PX.clamp((t - tEnd - 0.4) / 5, 0, 1), 1.6) * 999);
          end_heart(g, 300, Y0 + 57, 2, likes > 0 && PX.blink(t, 0.8, 0.3) ? "#ff8cc8" : C.pink);
          PX.text(g, String(likes), 318, Y0 + 54, { font: "v", size: 18, col: C.white });
          PX.text(g, "REPLY", 414, Y0 + 54, { font: "v", size: 18, col: C.dim, align: "right" });
        }
      }
    };
  };
})();
