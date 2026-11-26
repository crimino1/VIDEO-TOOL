/* Builder D scene kinds (Part 4): shop oldpath receipt slots fundamentals review query lecture
   math stack campus door funnel difficulty coast */
(function () {
  const { K, C } = PX;
  const R = Math.round;
  const G1 = "#3a4654", G2 = "#5a6b78", G3 = "#8b9bab", INK = "#20242c";
  const def = (v, d) => (v === undefined ? d : v);

  // ---------- helpers (buy_*) ----------
  // scanline polygon fill (crisp, integer rows)
  function buy_poly(g, pts, col) {
    g.fillStyle = col;
    let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.floor(y0); y < Math.ceil(y1); y++) {
      const yc = y + 0.5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
        if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + ((yc - ay) / (by - ay)) * (bx - ax));
      }
      xs.sort((a, b) => a - b);
      for (let i = 0; i + 1 < xs.length; i += 2) { const a = R(xs[i]), b = R(xs[i + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
    }
  }
  // pop-in scale (back ease, stepped), 0 before `at`
  const buy_pop = (t, at, dur) => { if (t < at) return 0; const p = (t - at) / (dur || 0.25); return p >= 1 ? 1 : Math.max(0.1, PX.q(PX.ease(p, "back"), 8)); };
  function buy_scaled(g, s, cx, cy, fn) { if (s <= 0) return; if (s === 1) return fn(); PX.zoom(g, s, cx, cy, fn); }
  // screen shake offset [dx, dy] for [at, at+dur]
  const buy_shake = (t, at, dur, amp) => {
    if (t < at || t > at + dur) return [0, 0];
    const k = Math.floor((t - at) * 30), f = 1 - (t - at) / dur;
    return [R((((k * 7) % 5) - 2) * 0.5 * amp * f), R((((k * 3) % 5) - 2) * 0.5 * amp * f)];
  };
  // rubber stamp slamming down (scale 3 -> 1)
  function buy_stamp(g, txt, cx, cy, t, at, o) {
    if (t < at) return;
    o = o || {};
    const col = o.col || C.red, size = o.size || 16;
    const p = (t - at) / 0.16, s = p < 1 ? [3, 2.2, 1.5, 1.15][Math.floor(p * 4)] : 1;
    const w = R(PX.tw(g, txt, { size }) + 24), h = size + 20;
    buy_scaled(g, s, cx, cy, () => {
      const x = R(cx - w / 2), y = R(cy - h / 2);
      PX.rect(g, x, y, w, h, "rgba(30,0,0,.7)");
      PX.box(g, x, y, w, h, col); PX.box(g, x + 1, y + 1, w - 2, h - 2, col); PX.box(g, x + 4, y + 4, w - 8, h - 8, col);
      PX.text(g, txt, cx, y + 11, { size, col, align: "center" });
    });
  }
  const BUY_SKULL = [".wwwwwww.", "wwwwwwwws", "wwwwwwwws", "wkkwwwkks", "wkkwwwkks", "wwwwkwwws", ".wwwwwws.", "..wgwgw..", "..wwwws.."];
  const buy_skull = (g, x, y, sc, eye) => PX.sprite(g, BUY_SKULL, x, y, { w: "#ddd6c4", s: "#9c968a", k: eye || "#120808", g: "#4a4440" }, sc);
  const BUY_TICK = ["........g", ".......gg", "g.....gg.", "gg...gg..", ".gg.gg...", "..ggg....", "...g....."];
  const buy_tick = (g, x, y, sc, col) => PX.sprite(g, BUY_TICK, x, y, { g: col || C.green }, sc);
  const BUY_CROSS = ["r.....r", "rr...rr", ".rr.rr.", "..rrr..", ".rr.rr.", "rr...rr", "r.....r"];
  const buy_cross = (g, x, y, sc, col) => PX.sprite(g, BUY_CROSS, x, y, { r: col || C.red }, sc);
  const BUY_FIRE = [
    ["....r.....", "...rr..r..", "..rrr.rr..", "..royrrr..", ".rroyyorr.", ".royyyyor.", "rroyywyorr", "royywwyyor", "royywwyyor", ".royyyyor."],
    ["......r...", "..r..rr...", "..rr.rrr..", "..rrryor..", ".rroyyorr.", ".royyyyor.", "rroyywyorr", "royywwyyor", "royywwyyor", ".royyyyor."],
    ["...r......", "...rr.r...", "..rrrrr...", ".rroyyrr..", ".royyyorr.", "rroyywyor.", "royywwyorr", "royywwyyor", "royywwyyor", ".royyyyor."],
  ];
  const buy_fire = (g, x, y, sc, t) => PX.sprite(g, BUY_FIRE[Math.floor(t * 9) % 3], x, y, { r: C.red, o: C.orange, y: C.yellow, w: "#fff2b0" }, sc);
  // 4-point twinkle
  function buy_spark(g, x, y, s, col) {
    x = R(x); y = R(y); col = col || C.yellow;
    PX.rect(g, x - s, y, 2 * s + 1, 1, col); PX.rect(g, x, y - s, 1, 2 * s + 1, col);
    if (s > 1) PX.rect(g, x - 1, y - 1, 3, 3, col);
  }
  // fake code line as coloured token bars; returns [[dx, w, col], ...]
  const BUY_TOK = [C.cyan, C.pink, C.yellow, C.green, C.purple, C.orange, "#8b9bab"];
  function buy_codeLine(r) {
    const ind = Math.floor(r() * 4) * 8, n = 1 + Math.floor(r() * 5), out = [];
    let x = ind;
    for (let i = 0; i < n; i++) { const w = 6 + Math.floor(r() * 26); out.push([x, w, BUY_TOK[Math.floor(r() * BUY_TOK.length)]]); x += w + 4; }
    return out;
  }
  // dust puff ring
  function buy_dust(g, x, y, u, col) {
    if (u < 0 || u > 1) return;
    const r = 3 + R(u * 10), c = col || "#8b9bab";
    PX.alpha(g, 1 - u, () => { for (let k = -1; k <= 1; k += 2) PX.circle(g, x + k * R(4 + u * 16), y - R(u * 6), Math.max(1, R(4 - u * 3)), c); PX.circle(g, x, y - R(u * 10), Math.max(1, R(r / 3)), c); });
  }

  // ======================= shop =======================
  // o: dead (3.0) SOLD OUT stamp, dead2 (5.0) skull, item (["GUARANTEED","JOB"]), price ("$$$")
  K.shop = (o) => {
    const dead = def(o.dead, 3.0), dead2 = def(o.dead2, 5.0);
    const item = o.item || ["GUARANTEED", "JOB"], price = o.price || "$$$";
    const r = PX.rnd(31), goods = [];
    const GC = [C.teal, C.purple, C.orange, C.pink, C.blue, C.green];
    for (let s = 0; s < 2; s++) for (let x = 22; x < 446;) { const w = 10 + Math.floor(r() * 16), h = 12 + Math.floor(r() * 18); if (x + w > 458) break; goods.push([x, s, w, h, GC[Math.floor(r() * 6)], r() < 0.4]); x += w + 3 + Math.floor(r() * 6); }
    const BRIEF = [".....kkkk.....", "....k....k....", "bbbbbbbbbbbbbb", "bBBBBBBBBBBBBd", "bBBBBBBBBBBBBd", "bbbbbbyybbbbbd", "bBBBBByyBBBBBd", "bBBBBBBBBBBBBd", "bBBBBBBBBBBBBd", "dddddddddddddd"];
    return (g, t) => {
      const [sx, sy] = buy_shake(t, dead, 0.4, 5); g.translate(sx, sy);
      // back wall: shelves with goods (dimmed)
      PX.alpha(g, 0.5, () => goods.forEach(([x, s, w, h, col, jar]) => {
        const y = 52 + s * 54 - h;
        PX.rect(g, x, y, w, h, col); PX.rect(g, x, y, w, 2, "rgba(255,255,255,.4)"); PX.rect(g, x + w - 2, y, 2, h, "rgba(0,0,0,.35)");
        if (jar) PX.rect(g, x + 2, y - 3, w - 4, 3, G3); else PX.rect(g, x + 2, y + 6, w - 4, 3, "rgba(0,0,0,.3)");
      }));
      for (let s = 0; s < 2; s++) { const y = 52 + s * 54; PX.rect(g, 16, y, 448, 6, "#6b4a30"); PX.rect(g, 16, y, 448, 1, "#a87a4e"); PX.rect(g, 16, y + 6, 448, 2, "#24160c"); }
      // counter
      PX.rect(g, 10, 196, 460, 8, "#8a5a3c"); PX.rect(g, 10, 196, 460, 2, "#c08a56"); PX.rect(g, 14, 204, 452, 66, "#4a2e1a"); PX.rect(g, 14, 204, 452, 3, "#24160c");
      for (let x = 18; x < 420; x += 64) { PX.rect(g, x + 6, 214, 52, 48, "#5a3a24"); PX.rect(g, x + 6, 214, 52, 1, "#2a1a10"); PX.rect(g, x + 6, 261, 52, 1, "#7a5034"); }
      // item card (pops at 0.2)
      const sc = buy_pop(t, 0.2, 0.3), cx = 240, cy = 130;
      buy_scaled(g, sc, cx, 196, () => {
        PX.rect(g, 150, 186, 6, 10, "#3a2414"); PX.rect(g, 324, 186, 6, 10, "#3a2414");
        PX.panel(g, 128, 62, 224, 128, C.cyan, "#0f2233");
        PX.box(g, 132, 66, 216, 120, "#1d4a5a");
        PX.text(g, item[0], cx, 76, { size: 16, col: C.yellow, align: "center" });
        if (item[1]) PX.text(g, item[1], cx, 96, { size: 16, col: C.yellow, align: "center" });
        const bob = t < dead && PX.blink(t, 0.8) ? -1 : 0;
        PX.sprite(g, BRIEF, cx - 35, 124 + bob, { b: "#c08a56", B: "#8a5a3c", d: "#4a2e1a", k: "#2a1a10", y: C.yellow }, 5);
      });
      // price tag swinging from the card corner
      if (t > 0.7) {
        const sw = t < dead ? R(Math.sin(t * 5) * 3) : 0, tx = 368 + sw, ty = 104;
        PX.line(g, 348, 68, tx + 6, ty + 4, "#ddd6c4");
        PX.rect(g, tx, ty, 70, 30, "#e0b040"); PX.rect(g, tx, ty, 70, 2, "#ffe08a"); PX.rect(g, tx, ty + 28, 70, 2, "#9a7020");
        PX.rect(g, tx + 4, ty + 3, 4, 4, "#05060a");
        PX.text(g, price, tx + 38, ty + 8, { size: 16, col: "#2a1a08", align: "center" });
        if (t >= dead + 0.6) PX.rect(g, tx + 8, ty + 13, 58, 3, C.red);
      }
      // sparkles around the card while it is still for sale
      if (t > 0.5 && t < dead) [[120, 70], [362, 160], [140, 182], [356, 56], [240, 50]].forEach(([x, y], i) => { const ph = (t * 2.2 + i * 0.37) % 1; if (ph < 0.5) buy_spark(g, x, y, ph < 0.25 ? 1 : 3, i % 2 ? C.cyan : C.yellow); });
      // sold: card dims, stamp slams
      if (t >= dead) { PX.rect(g, 130, 64, 220, 124, "rgba(0,0,0,.45)"); buy_stamp(g, "SOLD OUT", cx, cy + 4, t, dead, { size: 24 }); }
      // skull pops over the card
      if (t >= dead2) {
        const s2 = buy_pop(t, dead2, 0.3), bob = R(Math.sin((t - dead2) * 4)) * 2;
        buy_scaled(g, s2, cx, 40, () => buy_skull(g, cx - 22, 10 + bob, 5, PX.blink(t, 0.5) ? C.red : "#120808"));
      }
    };
  };

  // ======================= oldpath =======================
  // o: steps [{label, at}] (SHOW UP 0.5, PASS CLASSES 1.8, 1 INTERNSHIP 3.4, OFFER 5.0); last node = envelope
  K.oldpath = (o) => {
    const steps = o.steps || [{ label: "SHOW UP", at: 0.5 }, { label: "PASS CLASSES", at: 1.8 }, { label: "1 INTERNSHIP", at: 3.4 }, { label: "OFFER", at: 5.0 }];
    const n = steps.length;
    const nodes = steps.map((s, i) => [R(80 + (i * 320) / Math.max(1, n - 1)), i % 2 ? 132 : 190]);
    const start = [24, nodes[0][1]];
    // L-shaped path points between nodes
    const segs = [];
    for (let i = 0; i < n - 1; i++) { const [ax, ay] = nodes[i], [bx, by] = nodes[i + 1], mx = R((ax + bx) / 2); segs.push([[ax, ay], [mx, ay], [mx, by], [bx, by]]); }
    const r = PX.rnd(5), tufts = [];
    for (let i = 0; i < 60; i++) tufts.push([R(30 + r() * 420), R(40 + r() * 200)]);
    const trees = [[40, 64], [70, 48], [160, 60], [190, 46], [330, 52], [300, 62], [446, 238], [250, 238], [140, 240], [36, 236], [350, 240]];
    return (g, t) => {
      // island
      PX.rect(g, 14, 30, 452, 222, "#0b2715"); PX.rect(g, 14, 30, 452, 3, "#2f7a43"); PX.rect(g, 14, 249, 452, 3, "#0c2414");
      PX.rect(g, 14, 252, 452, 6, "#2a5a8a"); PX.rect(g, 14, 252, 452, 1, "#5fa3e8");
      tufts.forEach(([x, y]) => { PX.rect(g, x, y, 1, 2, "#2f7a43"); PX.rect(g, x + 2, y - 1, 1, 3, "#2f7a43"); });
      trees.forEach(([x, y], i) => { const sway = PX.blink(t + i * 0.3, 1.2) ? 1 : 0; PX.rect(g, x - 2, y + 6, 4, 8, "#5a3a24"); PX.circle(g, x + sway, y, 9, "#1f6a36"); PX.circle(g, x - 2 + sway, y - 3, 5, "#3a9a52"); });
      // path dots (lit once the next node is reached)
      const dots = (pts, lit) => { for (let k = 0; k < pts.length - 1; k++) { const [ax, ay] = pts[k], [bx, by] = pts[k + 1], L = Math.abs(bx - ax) + Math.abs(by - ay); for (let s = 0; s <= L; s += 8) { const x = ax + (bx - ax) * (s / (L || 1)), y = ay + (by - ay) * (s / (L || 1)); PX.rect(g, x - 2, y - 2, 4, 4, lit ? C.yellow : "#a8865a"); } } };
      dots([start, nodes[0]], t >= steps[0].at);
      segs.forEach((pts, i) => dots(pts, t >= steps[i + 1].at));
      // nodes + labels
      nodes.forEach(([x, y], i) => {
        const lit = t >= steps[i].at, u = t - steps[i].at;
        PX.circle(g, x, y + 2, 12, "#0c2414"); PX.circle(g, x, y, 12, lit ? "#b8860b" : "#3a4654"); PX.circle(g, x, y - 1, 9, lit ? C.yellow : G2); PX.circle(g, x, y - 2, 4, lit ? "#fff2b0" : G3);
        if (lit && u < 0.5) { const rr = 12 + R(u * 30); PX.box(g, x - rr, y - rr, 2 * rr + 1, 2 * rr + 1, C.yellow); }
        if (lit) {
          const last = i === n - 1, ly = y + 18;
          const lw = PX.tw(g, steps[i].label, { size: last ? 16 : 8 });
          PX.rect(g, x - lw / 2 - 4, ly - 3, lw + 8, (last ? 16 : 8) + 6, "#0b2715");
          PX.text(g, steps[i].label, x, ly + (u < 0.15 ? 3 : 0), { size: last ? 16 : 8, col: last ? C.yellow : C.ink, align: "center" });
        }
      });
      // offer envelope floating above the last node
      // (raised over the hero's head once reached, "item get" style)
      const [ex, ey0] = nodes[n - 1], got = t >= steps[n - 1].at, ey = ey0 - 92 + (got ? (t - steps[n - 1].at < 0.3 ? 6 : 0) : PX.blink(t, 0.6) ? -1 : 1);
      if (got) PX.alpha(g, 0.3, () => PX.circle(g, ex, ey + 15, PX.blink(t, 0.3) ? 34 : 30, C.yellow));
      PX.alpha(g, got ? 1 : 0.5, () => {
        PX.rect(g, ex - 24, ey, 48, 32, got ? "#d8d0bc" : G3); PX.rect(g, ex - 24, ey + 29, 48, 3, "#8b8470"); PX.rect(g, ex + 21, ey, 3, 32, "#a8a08a");
        PX.line(g, ex - 24, ey, ex, ey + 17, "#6b6450"); PX.line(g, ex + 23, ey, ex, ey + 17, "#6b6450");
        PX.circle(g, ex, ey + 17, 4, got ? C.red : G1);
      });
      if (got) for (let k = 0; k < 6; k++) { const ph = (t * 1.6 + k * 0.17) % 1; if (ph < 0.5) buy_spark(g, ex + [-38, 38, -32, 34, 0, -44][k], ey + [-6, 2, 30, 26, -14, 14][k], ph < 0.25 ? 1 : 3); }
      // the character: hops between nodes
      let px = start[0], py = start[1], air = 0;
      for (let i = 0; i < n; i++) {
        const prev = i ? nodes[i - 1] : start, hd = Math.min(0.45, (steps[i].at - (i ? steps[i - 1].at : 0)) * 0.8), a = steps[i].at - hd;
        if (t >= steps[i].at) { px = nodes[i][0]; py = nodes[i][1]; }
        else if (t >= a) { const p = PX.q((t - a) / hd, 8); px = PX.lerp(prev[0], nodes[i][0], p); py = PX.lerp(prev[1], nodes[i][1], p) - Math.sin(p * Math.PI) * 30; air = 1; break; }
        else break;
      }
      const bob = !air && PX.blink(t, 0.5) ? 1 : 0;
      PX.person(g, R(px - 14), R(py - 50 + bob), { sc: 4, col: C.cyan, frame: air ? 1 : 0 });
    };
  };

  // ======================= receipt =======================
  // o: lines [{l, r, at, sep?}] (CS DEGREE, 4 YEARS, TUITION, ----, TOTAL PAID + tick), empty (4.5) "SKILLS ATTACHED: NONE"
  K.receipt = (o) => {
    const lines = (o.lines || [{ l: "CS DEGREE", r: "x1", at: 0.4 }, { l: "4 YEARS", r: "", at: 1.0 }, { l: "TUITION", r: "$$$$$", at: 1.6 }, { l: "LATE NIGHTS", r: "MANY", at: 2.2 }, { sep: true, at: 2.7 }, { l: "TOTAL PAID", r: "ok", at: 3.2 }]).slice();
    const empty = def(o.empty, 4.5);
    lines.push({ l: "SKILLS ATTACHED:", at: empty }, { none: true, at: empty + 0.35 });
    const LH = 23, slot = 200, X0 = 128, PW = 224;
    const adv = (t, ln) => PX.q(PX.clamp((t - ln.at) / 0.25, 0, 1), 4);
    return (g, t) => {
      const f = 8 + lines.reduce((s, ln) => s + LH * adv(t, ln), 0), printing = lines.some((ln) => t >= ln.at && t < ln.at + 0.3);
      const jx = printing && PX.blink(t, 0.06) ? 1 : 0;
      // paper rises out of the slot (newest line at the bottom)
      g.save(); g.beginPath(); g.rect(0, 0, 480, slot); g.clip();
      const top = slot - f;
      PX.rect(g, X0, top, PW, f, "#c4bda8"); PX.rect(g, X0 + PW - 4, top, 4, f, "#9c9682"); PX.rect(g, X0, top, 3, f, "#d6d0bc");
      for (let x = X0; x < X0 + PW; x += 8) { PX.rect(g, x, top - 2, 4, 2, "#c4bda8"); PX.rect(g, x + 1, top - 3, 2, 1, "#c4bda8"); }
      lines.forEach((ln, i) => {
        if (t < ln.at) return;
        const y = slot - lines.slice(i).reduce((s, l2) => s + LH * adv(t, l2), 0) + 1;
        if (ln.sep) { for (let x = X0 + 10; x < X0 + PW - 12; x += 7) PX.rect(g, x, y + 10, 4, 2, INK); return; }
        if (ln.none) {
          const on = t < ln.at + 0.3 || PX.blink(t, 0.5, 0.65);
          PX.rect(g, X0 + 40, y, PW - 80, 20, on ? C.red : "#7a2020");
          PX.text(g, "NONE", X0 + PW / 2, y + 2, { size: 16, col: on ? "#fff0f0" : "#c4bda8", align: "center" });
          return;
        }
        const red = i === lines.length - 2;
        PX.text(g, ln.l, X0 + 12, y - 2, { font: "v", size: 24, col: red ? "#b01818" : INK });
        if (ln.r === "ok") buy_tick(g, X0 + PW - 42, y + 1, 3, "#139a36");
        else if (ln.r) PX.text(g, ln.r, X0 + PW - 12, y - 2, { font: "v", size: 24, col: INK, align: "right" });
      });
      g.restore();
      // printer body (bottom)
      g.translate(jx, 0);
      PX.rect(g, X0 - 26, slot - 6, PW + 52, 10, G3); PX.rect(g, X0 - 26, slot - 6, PW + 52, 2, "#b8c6d2");
      PX.rect(g, X0 - 8, slot - 2, PW + 16, 4, "#11161c");
      PX.rect(g, X0 - 26, slot + 4, PW + 52, 48, G2); PX.rect(g, X0 - 26, slot + 52, PW + 52, 8, G1);
      PX.rect(g, X0 - 26, slot + 4, 2, 48, G3); PX.rect(g, X0 + PW + 24, slot + 4, 2, 48, G1);
      PX.rect(g, X0 - 12, slot + 16, 34, 24, "#11161c"); PX.text(g, String(Math.min(99, Math.floor(f / LH))).padStart(2, "0"), X0 + 5, slot + 16, { font: "v", size: 24, col: C.green, align: "center" });
      PX.rect(g, X0 + PW - 6, slot + 22, 10, 10, printing && PX.blink(t, 0.12) ? C.green : "#1d4a2a"); PX.rect(g, X0 + PW + 10, slot + 22, 10, 10, t >= empty && PX.blink(t, 0.5) ? C.red : "#4a1a1a");
      for (let x = X0 + 40; x < X0 + PW - 30; x += 7) PX.rect(g, x, slot + 24, 4, 8, G1);
    };
  };

  // ======================= slots =======================
  // o: at ([0.6, 1.3, 2.0]) unlock times, n (3), label (none)
  K.slots = (o) => {
    const at = o.at || [0.6, 1.3, 2.0], n = at.length;
    const Q = [".yyyy.", "yy..yy", "....yy", "...yy.", "..yy..", "..yy..", "......", "..yy..", "..yy.."];
    const LOCK = ["yyyyyyyyyyy", "yYYYYYYYYYo", "yYYYkkkYYYo", "yYYYkkkYYYo", "yYYYYkYYYYo", "yYYYYkYYYYo", "yYYYYYYYYYo", "ooooooooooo"];
    return (g, t) => {
      const W = 124, gap = (480 - n * W) / (n + 1);
      for (let i = 0; i < n; i++) {
        const x = R(gap + i * (W + gap)), y = 80, H = 140, cx = x + W / 2, u = t - at[i];
        const open = u >= 0;
        // number tab
        PX.panel(g, cx - 18, 40, 36, 30, open ? C.yellow : C.cyan, "#0f2233");
        PX.text(g, String(i + 1), cx + 1, 48, { size: 16, col: open ? C.yellow : C.cyan, align: "center" });
        // slot box with bevel + grid
        PX.panel(g, x, y, W, H, open ? C.yellow : C.cyan, "#0b1622");
        PX.rect(g, x + 4, y + 4, W - 8, 3, "#05090f"); PX.rect(g, x + 4, y + 4, 3, H - 8, "#05090f"); PX.rect(g, x + 4, y + H - 7, W - 8, 3, "#1d3448");
        for (let gx = x + 14; gx < x + W - 8; gx += 12) PX.rect(g, gx, y + 8, 1, H - 16, "#122638");
        for (let gy = y + 14; gy < y + H - 8; gy += 12) PX.rect(g, x + 8, gy, W - 16, 1, "#122638");
        if (!open || u < 0.7) {
          // padlock: jiggles just before, shackle pops, then falls
          const jig = !open && u > -0.35 && PX.blink(t, 0.08) ? 1 : 0;
          const fall = open ? Math.max(0, u - 0.15) : 0, dy = R(fall * fall * 500), sh = open ? Math.min(8, R(u * 60)) : 0;
          const lx = cx - 22 + jig, ly = y + 58 + dy;
          g.save(); g.beginPath(); g.rect(x + 3, y + 3, W - 6, H - 6); g.clip();
          PX.alpha(g, open ? 1 - fall / 0.55 : 1, () => {
            PX.rect(g, lx + 6, ly - 22 - sh, 4, 24, G3); PX.rect(g, lx + 34, ly - 22 - sh + (open ? 0 : 0), 4, open ? 14 : 24, G3); PX.rect(g, lx + 6, ly - 26 - sh, 32, 4, G3); PX.rect(g, lx + 10, ly - 22 - sh, 24, 1, G2);
            PX.sprite(g, LOCK, lx, ly, { y: "#ffe08a", Y: "#d9a020", o: "#8a6010", k: "#2a1a08" }, 4);
          });
          g.restore();
        }
        if (open) {
          const s = buy_pop(t, at[i] + 0.15, 0.3), glow = PX.blink(t, 0.4);
          buy_scaled(g, s, cx, y + 70, () => {
            PX.alpha(g, 0.18, () => PX.circle(g, cx, y + 70, glow ? 42 : 38, C.yellow));
            PX.alpha(g, 0.22, () => PX.circle(g, cx, y + 70, 30, C.yellow));
            PX.sprite(g, Q, cx - 18, y + 40 + (glow ? -1 : 0), { y: glow ? "#fff2b0" : C.yellow }, 6);
          });
          for (let k = 0; k < 4; k++) { const ph = (u * 1.5 + k * 0.25) % 1; if (u > 0.2 && ph < 0.5) buy_spark(g, x + [10, W - 10, 12, W - 12][k], y + [12, 20, H - 14, H - 20][k], ph < 0.25 ? 1 : 2); }
        }
      }
    };
  };

  // ======================= fundamentals =======================
  // o: at ([0.5, 2.3, 4.4, 5.6]) tile times, labels (4 strings), row (7.0) DB opens into a table, hi (42)
  K.fundamentals = (o) => {
    const at = o.at || [0.5, 2.3, 4.4, 5.6], row = def(o.row, 7.0), hi = def(o.hi, 42);
    const labels = o.labels || ["DATA STRUCTURES", "OPERATING SYSTEMS", "NETWORKS", "DATABASES"];
    const cols = [C.cyan, C.purple, C.pink, C.yellow];
    const TW = 212, TH = 108, pos = [[22, 24], [246, 24], [22, 142], [246, 142]];
    const tree = [[0, 0, -1], [-44, 20, 0], [44, 20, 0], [-66, 42, 1], [-22, 42, 1], [22, 42, 2], [66, 42, 2]];
    const dfs = [0, 1, 3, 4, 2, 5, 6];
    const net = [[-60, 10], [-20, -12], [24, 4], [62, -14], [-30, 34], [40, 36]], edges = [[0, 1], [1, 2], [2, 3], [0, 4], [4, 5], [5, 2], [1, 4], [5, 3]];
    const ROWS = [[40, "ANA", "$12"], [41, "BEN", "$40"], [42, "CHO", "$7"], [43, "DEV", "$99"], [44, "EVA", "$23"], [45, "FIN", "$58"]];
    const ell = (g, cx, cy, rx, ry, col) => { g.fillStyle = col; for (let y = -ry; y <= ry; y++) { const w = R(rx * Math.sqrt(1 - (y * y) / (ry * ry))); g.fillRect(R(cx - w), R(cy + y), 2 * w + 1, 1); } };
    const icon = [
      (g, cx, cy, u) => { // binary tree, DFS highlight walks the nodes
        tree.forEach(([dx, dy, par], i) => { if (u < i * 0.12 || par < 0) return; PX.line(g, cx + tree[par][0], cy - 22 + tree[par][1], cx + dx, cy - 22 + dy, "#4a8a90"); });
        const vis = dfs[Math.floor(Math.max(0, u - 1) / 0.3) % 7];
        tree.forEach(([dx, dy], i) => { if (u < i * 0.12) return; const on = u > 1 && i === vis; PX.circle(g, cx + dx, cy - 22 + dy, 6, on ? C.yellow : C.cyan); PX.circle(g, cx + dx - 1, cy - 23 + dy, 2, on ? "#fff2b0" : "#b8f4f6"); });
      },
      (g, cx, cy, u, t) => { // window + spinning gears
        PX.rect(g, cx - 52, cy - 30, 104, 62, "#1a1430"); PX.rect(g, cx - 52, cy - 30, 104, 10, C.purple); PX.box(g, cx - 52, cy - 30, 104, 62, C.purple);
        [C.red, C.yellow, C.green].forEach((c, k) => PX.rect(g, cx - 47 + k * 7, cy - 27, 4, 4, c));
        const gear = (gx, gy, r, rot, col) => { for (let k = 0; k < 8; k++) { const a = rot + (k * Math.PI) / 4; PX.rect(g, R(gx + Math.cos(a) * (r + 2) - 3), R(gy + Math.sin(a) * (r + 2) - 3), 6, 6, col); } PX.circle(g, gx, gy, r, col); PX.circle(g, gx, gy, R(r / 3), "#1a1430"); };
        const st = Math.floor(t * 10);
        gear(cx - 14, cy + 4, 12, (st * Math.PI) / 16, "#b39cff"); gear(cx + 16, cy - 4, 7, (-st * Math.PI) / 10 + 0.3, "#8a5cf6");
        for (let k = 0; k < 3; k++) PX.rect(g, cx + 8, cy + 10 + k * 5, 8 + ((st + k * 3) % 5) * 6, 2, "#6a5aa0");
      },
      (g, cx, cy, u, t) => { // network: nodes + moving packets
        edges.forEach(([a, b]) => PX.line(g, cx + net[a][0], cy + net[a][1] - 10, cx + net[b][0], cy + net[b][1] - 10, "#7a3a62"));
        edges.forEach(([a, b], k) => { const p = PX.q((t * 0.9 + k * 0.37) % 1, 10), x = PX.lerp(net[a][0], net[b][0], p), y = PX.lerp(net[a][1], net[b][1], p); if (k % 2 === 0 || u > 0.6) PX.rect(g, R(cx + x - 2), R(cy + y - 12), 4, 4, k % 3 ? C.yellow : C.white); });
        net.forEach(([x, y], k) => { PX.rect(g, cx + x - 7, cy + y - 16, 14, 11, G2); PX.rect(g, cx + x - 5, cy + y - 14, 10, 7, PX.blink(t + k * 0.21, 0.7) ? C.pink : "#6a2a4a"); PX.rect(g, cx + x - 3, cy + y - 5, 6, 2, G1); });
      },
      (g, cx, cy, u, t) => { // database cylinder
        const w = 38, top = cy - 30;
        for (let k = 2; k >= 0; k--) { const y = top + k * 18; PX.rect(g, cx - w, y, 2 * w + 1, 18, k % 2 ? "#b08a20" : "#c89a28"); ell(g, cx, y + 18, w, 6, "#8a6a10"); }
        ell(g, cx, top, w, 6, "#ffe08a"); ell(g, cx, top, w - 6, 3, "#e0b040");
        PX.rect(g, cx - w, top, 3, 60, "#ffe08a");
        for (let k = 0; k < 3; k++) PX.rect(g, cx + w - 12, top + 8 + k * 18, 5, 3, PX.blink(t + k * 0.17, 0.4) ? C.green : "#1d4a2a");
      },
    ];
    return (g, t) => {
      const open = t >= row ? PX.q(PX.clamp((t - row) / 0.35, 0, 1), 6) : 0;
      for (let i = 0; i < 4; i++) {
        if (t < at[i]) continue;
        const [x, y] = pos[i], s = buy_pop(t, at[i], 0.3), cx = x + TW / 2;
        buy_scaled(g, s, cx, y + TH / 2, () => {
          PX.panel(g, x, y, TW, TH, cols[i], "#0b1622");
          icon[i](g, cx, y + 44, t - at[i], t);
          PX.rect(g, x + 6, y + TH - 22, TW - 12, 16, "#081018");
          PX.text(g, labels[i], cx, y + TH - 18, { col: cols[i], align: "center" });
        });
      }
      if (open > 0) {
        PX.rect(g, 0, 0, 480, 270, `rgba(0,0,0,${0.65 * open})`);
        const [sx, sy] = pos[3], x = R(PX.lerp(sx, 60, open)), y = R(PX.lerp(sy, 20, open)), w = R(PX.lerp(TW, 360, open)), h = R(PX.lerp(TH, 230, open));
        PX.panel(g, x, y, w, h, C.yellow, "#0b1622");
        if (open >= 1) {
          const u = t - row - 0.35;
          PX.text(g, labels[3], 240, 30, { col: C.yellow, align: "center" });
          const cx = [90, 170, 300], heads = ["ID", "NAME", "TOTAL"];
          PX.rect(g, 70, 46, 340, 22, "#1d3448");
          heads.forEach((hd, k) => PX.text(g, hd, cx[k], 49, { font: "v", size: 20, col: C.cyan }));
          ROWS.forEach((rw, k) => {
            if (u < k * 0.08) return;
            const yy = 74 + k * 26, isH = rw[0] === hi && u > 0.6;
            if (isH) { const on = PX.blink(t, 0.5, 0.7); PX.rect(g, 66, yy - 3, 348, 24, on ? "#5a4a10" : "#2a2410"); PX.box(g, 66, yy - 3, 348, 24, on ? C.yellow : "#8a6a10"); }
            else PX.rect(g, 70, yy + 21, 340, 1, "#14283a");
            rw.forEach((v, c) => PX.text(g, String(v), cx[c], yy, { font: "v", size: 20, col: isH ? C.yellow : C.ink }));
            if (isH) PX.text(g, "ROW " + hi, 370, yy + 4, { col: C.yellow, align: "center" });
          });
        }
      }
    };
  };

  // circle-clipped rect (for magnifier lenses)
  function buy_lensRect(g, x, y, w, h, col, cx, cy, r) {
    g.fillStyle = col;
    for (let yy = Math.max(R(y), cy - r); yy < Math.min(R(y + h), cy + r + 1); yy++) {
      const s = Math.floor(Math.sqrt(Math.max(0, r * r - (yy - cy) * (yy - cy)))), a = Math.max(R(x), cx - s), b = Math.min(R(x + w), cx + s + 1);
      if (b > a) g.fillRect(a, yy, b - a, 1);
    }
  }

  // ======================= review =======================
  // o: find (4.5) scroll stops + magnifier, total (400) lines, bug (287) bug line number
  K.review = (o) => {
    const find = def(o.find, 4.5), total = def(o.total, 400), bug = def(o.bug, 287);
    const r = PX.rnd(77), code = [];
    for (let i = 0; i < total + 20; i++) code.push(r() < 0.12 ? [] : buy_codeLine(r));
    code[bug - 1] = [[8, 22, C.cyan], [34, 10, C.pink], [48, 40, C.yellow], [92, 12, C.pink], [108, 30, C.green], [142, 18, C.purple], [164, 34, C.orange]];
    const LHt = 12, X = 34, Y = 22, W = 412, H = 232, CX = X + 46, CY = Y + 20, VIS = 17, MID = 8;
    return (g, t) => {
      const p = PX.clamp((t - 0.2) / (find - 0.2), 0, 1), pos = (bug - 1 - MID) * (1 - (1 - p) * (1 - p));
      const top = Math.floor(pos), frac = R((pos - top) * LHt), cur = Math.min(total, top + MID + 1), stopped = t >= find;
      PX.panel(g, X, Y, W, H, C.cyan, "#0a141e");
      PX.rect(g, X + 2, Y + 2, W - 4, 14, "#14283a");
      [C.red, C.yellow, C.green].forEach((c, k) => PX.rect(g, X + 8 + k * 8, Y + 6, 5, 5, c));
      PX.text(g, "LINE " + cur + "/" + total, X + W - 10, Y + 5, { col: stopped && PX.blink(t, 0.5) ? C.yellow : C.white, align: "right" });
      g.save(); g.beginPath(); g.rect(X + 2, CY, W - 4, H - 24); g.clip();
      PX.rect(g, X + 2, CY, 38, H - 24, "#0d1c2a");
      for (let k = -1; k <= VIS + 1; k++) {
        const ln = top + k, y = CY + 4 + k * LHt - frac;
        if (ln < 0 || ln >= code.length) continue;
        const isBug = ln === bug - 1 && stopped;
        if (isBug) PX.rect(g, X + 2, y - 3, W - 4, LHt, "#4a1018");
        PX.text(g, String(ln + 1), X + 36, y - 3, { font: "v", size: 14, col: isBug ? C.red : "#3d5a6e", align: "right" });
        code[ln].forEach(([dx, w, col]) => PX.rect(g, CX + dx, y, w, 5, isBug ? (w > 14 ? C.red : "#ff9a9a") : col));
      }
      g.restore();
      // scrollbar
      PX.rect(g, X + W - 8, CY + 2, 4, H - 28, "#14283a"); PX.rect(g, X + W - 8, CY + 2 + R((H - 48) * (pos / (total - VIS))), 4, 20, G3);
      if (stopped) {
        const y = CY + 4 + MID * LHt, u = t - find, ly = y + 2, rr = 30;
        if (u > 0.5) { const s = buy_pop(t, find + 0.5, 0.25); buy_scaled(g, s, X + W - 46, y + 2, () => { PX.rect(g, X + W - 74, y - 6, 54, 16, C.red); PX.text(g, "BUG", X + W - 47, y - 2, { col: C.white, align: "center" }); }); }
        // magnifier slides in from the right
        const lx = R(PX.lerp(560, 226, PX.q(PX.p(t, find + 0.1, 0.6, "out"), 10)));
        for (let k = 0; k < 7; k++) PX.line(g, lx + 22 + k, ly + 22, lx + 46 + k, ly + 46, k < 2 || k > 4 ? "#5a3a24" : "#a87a4e");
        PX.circle(g, lx, ly, rr + 4, G3); PX.circle(g, lx, ly, rr + 2, G2);
        buy_lensRect(g, lx - rr, ly - rr, 2 * rr, 2 * rr, "#3a0c14", lx, ly, rr);
        code[bug - 1].forEach(([dx, w]) => buy_lensRect(g, lx + (CX + dx - lx) * 2, ly - 5, w * 2, 10, w > 14 ? C.red : "#ff9a9a", lx, ly, rr));
        buy_lensRect(g, lx - rr, ly - rr + 6, 2 * rr, 3, "rgba(255,255,255,.3)", lx - 10, ly - 12, 12);
      }
    };
  };

  // ======================= query =======================
  // o: q ("SELECT * FROM ORDERS"), a (0.6) run 1, b (3.0) run 2, fail (5.6) timeout, rows1 ("100 ROWS"), rows2 ("10,000,000 ROWS")
  K.query = (o) => {
    const q = o.q || "SELECT * FROM ORDERS", a = def(o.a, 0.6), b = def(o.b, 3.0), fail = def(o.fail, 5.6);
    const rows1 = o.rows1 || "100 ROWS", rows2 = o.rows2 || "10,000,000 ROWS";
    return (g, t) => {
      const [sx, sy] = buy_shake(t, fail, 0.6, 6); g.translate(sx, sy);
      const X = 26, Y = 16, W = 428, H = 238, dead = t >= fail;
      PX.panel(g, X, Y, W, H, dead && PX.blink(t, 0.3) ? C.red : C.green, "#06120a");
      // prompt + cursor
      const typed = PX.typed(q, t, 0.05, 40);
      PX.text(g, "> " + typed, X + 12, Y + 8, { font: "v", size: 24, col: C.green });
      if (typed.length < q.length || (t < a && PX.blink(t, 0.4))) PX.rect(g, X + 14 + PX.tw(g, "> " + typed, { font: "v", size: 24 }), Y + 12, 8, 16, C.green);
      // run 1: instant
      if (t >= a) PX.alpha(g, t >= b ? 0.45 : 1, () => {
        PX.text(g, rows1, X + 14, Y + 40, { font: "v", size: 24, col: C.white });
        const p = PX.q(PX.clamp((t - a) / 0.12, 0, 1), 3);
        PX.rect(g, X + 14, Y + 66, W - 28, 20, "#10241a"); PX.rect(g, X + 14, Y + 66, R((W - 28) * p), 20, C.green); PX.rect(g, X + 14, Y + 66, R((W - 28) * p), 3, "#9affb4");
        if (p >= 1) { PX.text(g, "0.01S", X + W - 50, Y + 40, { font: "v", size: 24, col: C.green, align: "right" }); buy_tick(g, X + W - 44, Y + 44, 3); }
      });
      // run 2: crawls, then times out
      if (t >= b) {
        const u = PX.clamp((t - b) / (fail - b), 0, 1);
        PX.text(g, rows2, X + 14, Y + 104, { font: "v", size: 24, col: C.white });
        PX.text(g, (u * 30).toFixed(1).padStart(4, "0") + "S", X + W - 14, Y + 104, { font: "v", size: 24, col: dead ? C.red : u > 0.6 ? C.orange : C.yellow, align: "right" });
        const bw = W - 28, bx = X + 14, by = Y + 130, fill = R(bw * PX.q(0.04 + 0.2 * Math.sqrt(u), 40));
        PX.rect(g, bx, by, bw, 24, "#241a08");
        PX.rect(g, bx, by, fill, 24, dead ? "#a02020" : "#b07a18");
        if (!dead) for (let k = -2; k < fill / 12 + 1; k++) for (let j = 0; j < 6; j++) { const xx = bx + k * 12 + (Math.floor(t * 12) % 12) + j; if (xx >= bx && xx + 4 <= bx + fill) PX.rect(g, xx, by + j * 4, 4, 4, "#e0b040"); }
        if (!dead) { const sp = Math.floor(t * 8) % 4, scx = bx + fill + 12, scy = by + 12, [x1, y1, x2, y2] = [[0, -7, 0, 7], [-5, -5, 5, 5], [-7, 0, 7, 0], [5, -5, -5, 5]][sp]; PX.line(g, scx + x1, scy + y1, scx + x2, scy + y2, C.yellow); PX.line(g, scx + x1 + 1, scy + y1, scx + x2 + 1, scy + y2, C.yellow); }
        if (dead) {
          buy_fire(g, bx + bw - 130, by - 6, 3, t); buy_fire(g, bx + bw - 96, by - 2, 3, t + 0.2);
          buy_fire(g, X + W - 60, Y + H - 50, 4, t + 0.3);
          buy_stamp(g, "TIMEOUT", 220, Y + 196, t, fail, { size: 24 });
        }
      }
    };
  };

  // ======================= lecture =======================
  // o: title ("INDEXES"), save (3.0) star burst, text ("THIS ONE SAVES YOU")
  K.lecture = (o) => {
    const title = o.title || "INDEXES", save = def(o.save, 3.0), burst = o.text || "THIS ONE SAVES YOU";
    const CH = "#d6dfcf", CHD = "#8fa88a";
    const BX = 16, BY = 10, BW = 304, BH = 188, cx = BX + BW / 2;
    const root = [cx - 32, 58, 64, 24, "40 | 80"], kids = [[BX + 18, 128, 68, 24, "10 | 25"], [cx - 34, 128, 68, 24, "50 | 70"], [BX + BW - 86, 128, 68, 24, "90 | 99"]];
    const partBox = (g, [x, y, w, h], p, col) => { // outline drawn by perimeter progress
      let left = 2 * (w + h) * p;
      const seg = (len, fn) => { const k = Math.max(0, Math.min(len, left)); if (k > 0) fn(R(k)); left -= len; };
      seg(w, (k) => PX.rect(g, x, y, k, 2, col)); seg(h, (k) => PX.rect(g, x + w - 2, y, 2, k, col));
      seg(w, (k) => PX.rect(g, x + w - k, y + h - 2, k, 2, col)); seg(h, (k) => PX.rect(g, x, y + h - k, 2, k, col));
    };
    return (g, t) => {
      // board, tray, floor
      PX.rect(g, BX - 6, BY - 6, BW + 12, BH + 12, "#6b4a30"); PX.rect(g, BX - 6, BY - 6, BW + 12, 2, "#a87a4e"); PX.rect(g, BX - 6, BY + BH + 4, BW + 12, 2, "#3a2414");
      PX.rect(g, BX, BY, BW, BH, "#173826");
      for (let k = 0; k < 6; k++) PX.rect(g, BX + 20 + k * 47, BY + 12 + ((k * 37) % 150), 18, 1, "#1f4630");
      PX.rect(g, BX + 10, BY + BH + 6, BW - 20, 5, "#5a3a24"); PX.rect(g, BX + 40, BY + BH + 3, 10, 3, CH); PX.rect(g, BX + 60, BY + BH + 3, 7, 3, "#f2a0c8");
      PX.rect(g, 0, 244, 480, 1, "#2a3440");
      PX.text(g, PX.typed(title, t, 0.1, 14), cx, BY + 12, { size: 16, col: CH, align: "center" });
      if (t > 0.7) PX.rect(g, cx - 60, BY + 32, R(120 * PX.clamp((t - 0.7) / 0.3, 0, 1)), 2, CHD);
      const glow = t >= save;
      // b-tree drawn stroke by stroke; at save the search path lights up
      partBox(g, root, PX.clamp((t - 0.6) / 0.4, 0, 1), glow ? C.yellow : CH);
      if (t > 1.0) PX.text(g, root[4], cx, root[1] + 3, { font: "v", size: 20, col: glow ? C.yellow : CH, align: "center" });
      kids.forEach((k, i) => {
        const pe = PX.q(PX.clamp((t - 1.1 - i * 0.25) / 0.25, 0, 1), 6), hot = glow && i === 1, col = hot ? C.yellow : CH;
        const ax = root[0] + 12 + i * 20, ay = root[1] + 24, bx = k[0] + k[2] / 2, by = k[1];
        if (pe > 0) { PX.line(g, ax, ay, ax + (bx - ax) * pe, ay + (by - ay) * pe, col); PX.line(g, ax + 1, ay, ax + 1 + (bx - ax) * pe, ay + (by - ay) * pe, col); }
        partBox(g, k, PX.clamp((t - 1.8 - i * 0.3) / 0.3, 0, 1), col);
        if (t > 2.1 + i * 0.3) PX.text(g, k[4], bx, k[1] + 3, { font: "v", size: 20, col, align: "center" });
      });
      // professor with pointer (tip hops between nodes)
      const tgt = t < 1.8 ? [cx + 32, root[1] + 12] : t < save ? [kids[Math.floor((t - 1.8) / 0.4) % 3][0] + 68, 140] : [cx + 34, 140];
      const px = 338, py = 180, hx = px - 1, hy = py + 33;
      PX.line(g, hx, hy, tgt[0], tgt[1], "#c8a070"); PX.line(g, hx, hy + 1, tgt[0], tgt[1] + 1, "#8a5a3c");
      PX.person(g, px, py, { sc: 4, col: C.purple, hair: "#9aa4ae", skin: PX.C.skin[1] });
      PX.rect(g, px + 8, py + 18, 12, 4, "#d8dce0"); PX.rect(g, px + 12, py + 22, 4, 2, "#d8dce0"); // beard
      // sleepy student at a desk
      const sx = 412, sy = 182, nod = !glow && PX.blink(t, 1.0, 0.45) ? 3 : 0;
      PX.person(g, sx, sy + nod - (glow ? 4 : 0), { sc: 4, col: C.orange, hair: "#4a2e1a" });
      if (!glow) PX.rect(g, sx + 4, sy + 12 + nod, 20, 4, PX.C.skin[1]); // closed eyes
      PX.rect(g, sx - 14, sy + 32, 58, 6, "#8a5a3c"); PX.rect(g, sx - 14, sy + 32, 58, 2, "#c08a56"); PX.rect(g, sx - 10, sy + 38, 4, 24, "#5a3a24"); PX.rect(g, sx + 36, sy + 38, 4, 24, "#5a3a24");
      if (!glow) for (let k = 0; k < 2; k++) { const ph = (t * 0.7 + k * 0.5) % 1; PX.alpha(g, 1 - ph, () => PX.text(g, k ? "z" : "Z", sx + 28 + R(ph * 14) + k * 6, sy - 8 - R(ph * 40), { size: k ? 8 : 16, col: C.cyan })); }
      else if (t < save + 1.4) PX.text(g, "!", sx + 14, sy - 24 - (PX.blink(t, 0.2) ? 2 : 0), { size: 16, col: C.yellow });
      // star burst
      if (glow) {
        const s = buy_pop(t, save, 0.3), bx = 168, by = 226, wob = PX.blink(t, 0.3) ? 1 : 0, pts = [];
        for (let k = 0; k < 28; k++) { const a = (k / 28) * Math.PI * 2, out = k % 2 === 0; pts.push([bx + Math.cos(a) * (out ? 112 + wob * 6 : 92), by + Math.sin(a) * (out ? 38 + wob * 3 : 28)]); }
        buy_scaled(g, s, bx, by, () => {
          buy_poly(g, pts.map(([x, y]) => [x + 2, y + 2]), "#6a4a08");
          buy_poly(g, pts, "#e8b020");
          buy_poly(g, pts.map(([x, y]) => [bx + (x - bx) * 0.86, by + (y - by) * 0.8]), C.yellow);
          PX.text(g, burst, bx, by - 4, { col: "#2a1004", align: "center" });
        });
      }
    };
  };

  // ======================= math =======================
  // o: at ([0.4, 1.6, 3.0]) panel times, titles (["LINEAR ALGEBRA","PROBABILITY","DISCRETE MATH"])
  K.math = (o) => {
    const at = o.at || [0.4, 1.6, 3.0], titles = o.titles || ["LINEAR ALGEBRA", "PROBABILITY", "DISCRETE MATH"];
    const cols = [C.cyan, C.yellow, C.purple];
    const PIPS = { 1: [[1, 1]], 2: [[0, 0], [2, 2]], 3: [[0, 0], [1, 1], [2, 2]], 4: [[0, 0], [2, 0], [0, 2], [2, 2]], 5: [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]], 6: [[0, 0], [2, 0], [0, 1], [2, 1], [0, 2], [2, 2]] };
    const die = (g, x, y, f) => { PX.rect(g, x, y + 2, 34, 34, "#8b8470"); PX.rect(g, x, y, 34, 32, "#d8d0bc"); PX.rect(g, x, y, 34, 2, "#f0ead8"); (PIPS[f] || []).forEach(([a, b]) => PX.rect(g, x + 5 + a * 10, y + 5 + b * 9, 5, 5, "#20242c")); };
    const nodes = [[-44, -52], [10, -62], [46, -22], [-28, -8], [20, 18], [-44, 40], [38, 58]];
    const edges = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 4], [1, 3], [3, 5], [4, 6], [5, 6], [2, 6]];
    const path = [0, 1, 2, 4, 6];
    return (g, t) => {
      for (let i = 0; i < 3; i++) {
        if (t < at[i]) continue;
        const x = 12 + i * 156, y = 26, w = 144, h = 218, cx = x + w / 2, u = t - at[i];
        buy_scaled(g, buy_pop(t, at[i], 0.3), cx, y + h / 2, () => {
          PX.panel(g, x, y, w, h, cols[i], "#0b1622");
          PX.rect(g, x + 4, y + 4, w - 8, 18, "#14283a");
          PX.text(g, titles[i], cx, y + 9, { col: cols[i], align: "center" });
          if (i === 0) { // matrix with brackets; one cell changes every 0.45 s
            const v = [2, 0, 1, 3, 5, 7, 1, 4, 2], k = Math.floor(u / 0.45);
            let last = -1;
            for (let j = 1; j <= k; j++) { last = (j * 5) % 9; v[last] = (j * 7 + 3) % 10; }
            const fl = u - k * 0.45 < 0.25;
            for (const s of [-1, 1]) { const bx = cx + s * 60 - (s > 0 ? 3 : 0); PX.rect(g, bx, y + 44, 3, 134, G3); PX.rect(g, s < 0 ? bx : bx - 9, y + 44, 12, 3, G3); PX.rect(g, s < 0 ? bx : bx - 9, y + 175, 12, 3, G3); }
            v.forEach((n, j) => { const hot = j === last && fl; if (hot) PX.rect(g, cx - 50 + (j % 3) * 36, y + 52 + Math.floor(j / 3) * 42, 28, 30, "#4a3a10"); PX.text(g, String(n), cx - 36 + (j % 3) * 36, y + 50 + Math.floor(j / 3) * 42, { font: "v", size: 32, col: hot ? C.yellow : C.white, align: "center" }); });
          } else if (i === 1) { // dice roll, then histogram of sums (7 lights up)
            const roll = u < 1.0, fr = Math.floor(u * 14);
            [0, 1].forEach((k) => {
              const f = roll ? 1 + ((fr * 7 + k * 3 + fr * k) % 6) : 3 + k, bob = roll ? -R(Math.abs(Math.sin(u * Math.PI * 3)) * 14 * (1 - u)) : 0;
              die(g, cx - 40 + k * 46, y + 40 + bob + (roll && (fr + k) % 2 ? 2 : 0), f);
            });
            const hs = [1, 2, 3, 4, 5, 6, 5, 4, 3, 2, 1], gp = PX.q(PX.clamp((u - 0.5) / 0.8, 0, 1), 8);
            hs.forEach((n, k) => { const bh = R(n * 13 * gp), hot = k === 5 && !roll; PX.rect(g, cx - 66 + k * 12, y + 200 - bh, 10, bh, hot ? (PX.blink(t, 0.4) ? C.yellow : "#b8860b") : "#3d8a90"); if (bh > 2) PX.rect(g, cx - 66 + k * 12, y + 200 - bh, 10, 2, hot ? "#fff2b0" : C.cyan); });
            PX.rect(g, cx - 68, y + 201, 136, 1, G2);
          } else { // graph: a path lights edge by edge, loops
            const gy = y + 112, cyc = (path.length - 1) * 0.35 + 0.8, lit = Math.floor(((u % cyc) / 0.35));
            const on = (a, b) => { for (let k = 0; k < Math.min(lit, path.length - 1); k++) if ((path[k] === a && path[k + 1] === b) || (path[k] === b && path[k + 1] === a)) return true; return false; };
            edges.forEach(([a, b]) => { const c = on(a, b) ? C.yellow : "#4a3a7a"; PX.line(g, cx + nodes[a][0], gy + nodes[a][1], cx + nodes[b][0], gy + nodes[b][1], c); PX.line(g, cx + nodes[a][0] + 1, gy + nodes[a][1], cx + nodes[b][0] + 1, gy + nodes[b][1], c); });
            nodes.forEach(([nx, ny], k) => { const pi = path.indexOf(k), hot = pi >= 0 && pi <= lit; PX.circle(g, cx + nx, gy + ny, 8, hot ? "#b8860b" : "#3a2a6a"); PX.circle(g, cx + nx, gy + ny - 1, 6, hot ? C.yellow : C.purple); PX.rect(g, cx + nx - 2, gy + ny - 4, 2, 2, "rgba(255,255,255,.6)"); });
          }
        });
      }
    };
  };

  // ======================= stack =======================
  // o: at ([0.3, 0.9, 1.5]) base block drops, labels (["LINEAR ALGEBRA","PROBABILITY","DISCRETE MATH"]),
  //    ai (2.5) AI block lands, crack (5.0) "WEEKEND TUTORIAL" pillar cracks, weak ("WEEKEND TUTORIAL")
  K.stack = (o) => {
    const at = o.at || [0.3, 0.9, 1.5], labels = o.labels || ["LINEAR ALGEBRA", "PROBABILITY", "DISCRETE MATH"];
    const ai = def(o.ai, 2.5), crack = def(o.crack, 5.0), weak = o.weak || "WEEKEND TUTORIAL";
    const cols = [["#2a9fad", "#5fe3e8", "#16606a"], ["#6a4cc8", "#9a7cf0", "#3a2a80"], ["#b8407a", "#f25ca8", "#6a1a44"]];
    const GROUND = 248, BH = 40, X0 = 30, BW = 236;
    const drop = (t, a, yT) => { if (t < a) return null; const p = PX.clamp((t - a) / 0.35, 0, 1); return R(PX.lerp(-60, yT, PX.q(p * p, 10))); };
    const block = (g, x, y, w, h, c) => { PX.rect(g, x, y, w, h, c[0]); PX.rect(g, x, y, w, 3, c[1]); PX.rect(g, x, y + h - 3, w, 3, c[2]); PX.rect(g, x + w - 3, y, 3, h, c[2]); };
    const net = (g, x, y, sc, t) => { // tiny neural net
      const L = [[0, 4, 8], [0, 3, 6, 9], [2, 7]].map((ys, li) => ys.map((yy) => [x + li * 8 * sc, y + yy * sc]));
      for (let l = 0; l < 2; l++) L[l].forEach((a) => L[l + 1].forEach((b) => PX.line(g, a[0], a[1], b[0], b[1], "#4a6a9a")));
      L.forEach((ly, li) => ly.forEach(([nx, ny], k) => PX.rect(g, nx - sc, ny - sc, 2 * sc + 1, 2 * sc + 1, PX.blink(t + li * 0.15 + k * 0.1, 0.6) ? C.cyan : "#8ef0f4")));
    };
    const aiBlock = (g, x, y, w, h, t, big) => {
      const pulse = PX.blink(t, 0.4);
      if (big) PX.alpha(g, pulse ? 0.25 : 0.15, () => PX.rect(g, x - 6, y - 6, w + 12, h + 12, C.yellow));
      PX.rect(g, x, y, w, h, "#1a1430"); PX.box(g, x, y, w, h, pulse ? C.yellow : "#e0b040"); PX.box(g, x + 1, y + 1, w - 2, h - 2, "#8a6a10");
      net(g, x + (big ? 12 : 6), y + (big ? 10 : 6), big ? 3 : 1, t);
      PX.text(g, "AI", x + w - (big ? 40 : 18), y + h / 2 - (big ? 12 : 4), { size: big ? 24 : 8, col: C.yellow, align: "center" });
    };
    return (g, t) => {
      let sh = [0, 0];
      [...at, ai].forEach((a, k) => { const s2 = buy_shake(t, a + 0.35, 0.18, k === 3 ? 4 : 2); if (s2[0] || s2[1]) sh = s2; });
      g.translate(sh[0], sh[1]);
      PX.rect(g, 10, GROUND, 460, 2, G2); PX.rect(g, 10, GROUND + 2, 460, 1, G1);
      at.forEach((a, i) => {
        const yT = GROUND - (i + 1) * BH, y = drop(t, a, yT); if (y === null) return;
        block(g, X0, y, BW, BH, cols[i]);
        PX.text(g, labels[i], X0 + BW / 2, y + 16, { col: "#05060a", align: "center" });
        buy_dust(g, X0 - 4, yT + BH, (t - a - 0.35) / 0.5); buy_dust(g, X0 + BW + 4, yT + BH, (t - a - 0.35) / 0.5);
      });
      const aiT = GROUND - 3 * BH - 64, ay = drop(t, ai, aiT);
      if (ay !== null) { aiBlock(g, X0 + 28, ay, BW - 56, 64, t, true); buy_dust(g, X0 + 24, aiT + 64, (t - ai - 0.35) / 0.5); buy_dust(g, X0 + BW - 24, aiT + 64, (t - ai - 0.35) / 0.5); }
      // weak pillar on the right
      const wa = crack - 1.4;
      if (t >= wa) {
        const px = 368, pw = 12, top = 146, mid = 200, broke = t >= crack + 0.8, fallU = PX.clamp((t - crack - 0.8) / 0.4, 0, 1);
        const wob = t >= crack && !broke ? (PX.blink(t, 0.1) ? 2 : -2) : 0;
        const py = drop(t, wa, top) ?? top;
        PX.text(g, weak, px + pw / 2, GROUND + 6, { font: "v", size: 16, col: "#c8b88a", align: "center" });
        // lower half stays
        PX.rect(g, px, broke ? mid : py, pw, GROUND - (broke ? mid : py), "#a8906a"); PX.rect(g, px, broke ? mid : py, 3, GROUND - (broke ? mid : py), "#d8c49a"); PX.rect(g, px + pw - 3, broke ? mid : py, 3, GROUND - (broke ? mid : py), "#6a5638");
        if (t >= crack) { const n = Math.min(4, 1 + Math.floor((t - crack) / 0.2)); for (let k = 0; k < n; k++) { PX.rect(g, px + 2 + (k % 2) * 5, mid - 10 + k * 6, 4, 1, "#2a1a10"); PX.rect(g, px + 5 - (k % 2) * 3, mid - 9 + k * 6, 1, 4, "#2a1a10"); } }
        if (!broke) {
          aiBlock(g, px + pw / 2 - 30 + wob, py - 28, 60, 28, t, false);
        } else {
          // top half topples right, mini AI drops to the floor
          const fy = R(PX.lerp(top, GROUND - 12, fallU * fallU));
          PX.rect(g, px + 14 + R(fallU * 30), fy, R(PX.lerp(pw, 46, fallU)), R(PX.lerp(mid - top, 12, fallU)), "#a8906a");
          const my = R(PX.lerp(top - 28, GROUND - 28, fallU * fallU));
          aiBlock(g, px - 64 + R((1 - fallU) * 40), my, 60, 28, t, false);
          buy_dust(g, px - 34, GROUND, (t - crack - 1.2) / 0.6); buy_dust(g, px + 50, GROUND, (t - crack - 1.2) / 0.6);
          if (t > crack + 1.2 && t < crack + 2.4) PX.text(g, "!", px - 34, GROUND - 50 - (PX.blink(t, 0.2) ? 2 : 0), { size: 16, col: C.red, align: "center" });
        }
      }
    };
  };

  // ======================= campus =======================
  // o: years ([0, d/4, d/2, 3d/4]) times each year starts (default even over d); trees cycle seasons each year
  K.campus = (o) => {
    const r = PX.rnd(13), walkers = [];
    for (let i = 0; i < 7; i++) walkers.push({ x0: r() * 520, v: (18 + r() * 22) * (r() < 0.5 ? -1 : 1), lane: i % 2, col: [C.cyan, C.pink, C.orange, C.green, C.purple, C.yellow, C.blue][i], hair: ["#2b1d14", "#6b4226", "#111", "#c89a5a"][i % 4], skin: PX.C.skin[i % 4], bag: r() < 0.6 });
    const trees = [[46, 150, 26], [92, 164, 20], [404, 160, 22], [446, 148, 26]];
    const SEAS = [["#1f7a3a", "#3fae5a"], ["#b0601a", "#e09030"], ["#8b9bab", "#c8d4dc"], ["#3a9a4a", "#7ad07a"]];
    return (g, t, d) => {
      const yrs = o.years || [0, d / 4, d / 2, (3 * d) / 4];
      let yi = 0; yrs.forEach((a, k) => { if (t >= a) yi = k; });
      const ylen = (yrs[yi + 1] !== undefined ? yrs[yi + 1] : d) - yrs[yi], season = Math.min(3, Math.floor(((t - yrs[yi]) / ylen) * 4));
      // lawn + paths
      PX.rect(g, 0, 196, 480, 74, "#0f2a18"); PX.rect(g, 0, 196, 480, 2, "#1f5a30");
      if (season === 2) PX.rect(g, 0, 196, 480, 74, "#1e2a32");
      buy_poly(g, [[204, 196], [276, 196], [300, 230], [180, 230]], "#5a4a38");
      PX.rect(g, 0, 228, 480, 18, "#5a4a38"); PX.rect(g, 0, 228, 480, 2, "#7a6a50"); PX.rect(g, 0, 244, 480, 2, "#3a2e22");
      // building: pediment, columns, steps
      buy_poly(g, [[118, 72], [240, 30], [362, 72]], G3); buy_poly(g, [[132, 70], [240, 38], [348, 70]], G2);
      PX.circle(g, 240, 56, 9, "#d8d0bc"); PX.circle(g, 240, 56, 7, "#f0ead8");
      const ha = t * 6, ma = t * 0.6; PX.line(g, 240, 56, 240 + R(Math.cos(ha) * 6), 56 + R(Math.sin(ha) * 6), "#20242c"); PX.line(g, 240, 56, 240 + R(Math.cos(ma) * 4), 56 + R(Math.sin(ma) * 4), "#20242c");
      PX.rect(g, 114, 72, 252, 10, G3); PX.rect(g, 114, 72, 252, 2, "#b8c6d2"); PX.rect(g, 114, 80, 252, 2, G1);
      PX.rect(g, 124, 82, 232, 90, "#26303a");
      for (let k = 0; k < 6; k++) { const cx = 132 + k * 42; PX.rect(g, cx, 82, 16, 90, G3); PX.rect(g, cx, 82, 4, 90, "#b8c6d2"); PX.rect(g, cx + 12, 82, 4, 90, G2); PX.rect(g, cx - 2, 82, 20, 4, "#b8c6d2"); PX.rect(g, cx - 2, 168, 20, 4, G2); }
      PX.rect(g, 222, 112, 36, 60, "#3a2414"); PX.rect(g, 224, 114, 32, 58, "#5a3a24"); PX.rect(g, 239, 114, 2, 58, "#3a2414");
      [[158, 104], [302, 104]].forEach(([wx, wy]) => { PX.rect(g, wx, wy, 14, 22, PX.blink(t + wx, 1.7, 0.8) ? "#e0b040" : "#5a4a20"); PX.rect(g, wx + 6, wy, 2, 22, "#26303a"); });
      for (let k = 0; k < 3; k++) { PX.rect(g, 112 - k * 8, 172 + k * 8, 256 + k * 16, 8, k % 2 ? G2 : G3); PX.rect(g, 112 - k * 8, 172 + k * 8, 256 + k * 16, 1, "#b8c6d2"); }
      // trees (seasons cycle every quarter-year)
      const [c0, c1] = SEAS[season];
      trees.forEach(([x, y, rr], k) => {
        PX.rect(g, x - 3, y + rr - 6, 7, 34, "#5a3a24"); PX.rect(g, x - 3, y + rr - 6, 2, 34, "#7a5034");
        if (season === 2) { PX.line(g, x, y + 4, x - 12, y - 8, "#5a3a24"); PX.line(g, x, y + 4, x + 12, y - 10, "#5a3a24"); PX.circle(g, x, y - 2, R(rr * 0.6), c0); PX.rect(g, x - 8, y - 10, 16, 3, c1); }
        else { PX.circle(g, x, y, rr, c0); PX.circle(g, x - 5, y - 6, R(rr * 0.55), c1); }
      });
      // falling leaves / snow
      if (season === 1 || season === 2) for (let k = 0; k < 16; k++) { const fx = (k * 61) % 480, fy = ((t * (season === 2 ? 30 : 40) + k * 37) % 120) + 110; PX.rect(g, fx + (Math.floor(t * 4 + k) % 2), R(fy), 2, 2, season === 2 ? "#ffffff" : C.orange); }
      // students walking (caps in the final year)
      walkers.forEach((w) => {
        const span = 540, x = (((w.x0 + t * w.v) % span) + span) % span - 30, y = 204 + w.lane * 10;
        PX.person(g, R(x), y, { sc: 2, col: w.col, hair: w.hair, skin: w.skin, frame: Math.floor(t * 5 + w.x0) % 2, flip: w.v < 0, cap: yi === 3 });
        if (w.bag) PX.rect(g, R(x) + (w.v < 0 ? 12 : -2), y + 13, 4, 7, "#8a5a3c");
      });
      // YEAR counter panel
      PX.panel(g, 386, 6, 86, 50, C.yellow, "#0b1622");
      PX.text(g, "YEAR", 404, 14, { col: C.yellow });
      const flip = t - yrs[yi] < 0.15 && yi > 0;
      PX.text(g, String(yi + 1), 446, 28 + (flip ? -3 : 0), { size: 24, col: C.white, align: "center" });
      PX.text(g, "/4", 404, 36, { font: "v", size: 18, col: C.dim });
      for (let k = 0; k < 4; k++) PX.rect(g, 394 + k * 8, 26, 6, 6, k <= yi ? C.yellow : "#3a3010");
    };
  };

  // ======================= door =======================
  // o: label ("INTERNSHIPS"), plaque (["ENROLLED","STUDENTS ONLY"]), open (4.5), side (6.0) "SIDE DOOR" neon, sideText
  K.door = (o) => {
    const label = o.label || "INTERNSHIPS", plaque = o.plaque || ["ENROLLED", "STUDENTS ONLY"], open = def(o.open, 4.5), side = def(o.side, 6.0), sideText = o.sideText || "SIDE DOOR";
    const DX = 192, DY = 64, DW = 96, DH = 168, FL = 232;
    return (g, t) => {
      // brick wall + floor
      PX.rect(g, 0, 0, 480, FL, "#2a1414");
      for (let row = 0; row * 12 < FL; row++) for (let k = -1; k < 17; k++) { const bx = k * 30 + (row % 2) * 15, by = row * 12; PX.rect(g, bx + 1, by + 1, 28, 10, (k + row) % 3 ? "#4a2424" : "#552a28"); PX.rect(g, bx + 1, by + 1, 28, 1, "#6a3430"); }
      PX.rect(g, 0, FL, 480, 38, "#1c2229"); PX.rect(g, 0, FL, 480, 2, "#3a4654");
      for (let k = 0; k < 8; k++) PX.rect(g, k * 64, FL + 14, 40, 1, "#262e36");
      const op = t >= open ? PX.q(PX.clamp((t - open) / 0.5, 0, 1), 5) : 0;
      // light spill on the floor
      if (op > 0) PX.alpha(g, 0.4 * op, () => buy_poly(g, [[DX, FL], [DX + DW, FL], [DX + DW + 60, 270], [DX - 60, 270]], C.yellow));
      // frame + opening
      PX.rect(g, DX - 8, DY - 8, DW + 16, DH + 8, "#8a5a3c"); PX.rect(g, DX - 8, DY - 8, DW + 16, 2, "#c08a56"); PX.rect(g, DX - 8, DY - 8, 2, DH + 8, "#c08a56");
      PX.rect(g, DX, DY, DW, DH, op > 0 ? "#f0c860" : "#140c08");
      if (op > 0) { PX.rect(g, DX, DY, DW, DH, "#c89a38"); for (let k = 0; k < 5; k++) PX.rect(g, DX + 8 + k * 18, DY + 10, 6, DH - 20, "#e8b850"); PX.rect(g, DX, DY + DH - 30, DW, 30, "#a87a28"); }
      // door leaf (swings: narrows toward the hinge)
      const lw = R(DW * (1 - op * 0.82));
      PX.rect(g, DX, DY, lw, DH, "#5a3a24"); PX.rect(g, DX + lw - 3, DY, 3, DH, "#3a2414");
      if (lw > 30) { PX.box(g, DX + 10, DY + 12, lw - 20, 62, "#7a5034"); PX.box(g, DX + 10, DY + 86, lw - 20, 70, "#7a5034"); PX.rect(g, DX + lw - 16, DY + 84, 6, 6, C.yellow); }
      // sign above
      PX.panel(g, 140, 26, 200, 26, C.cyan, "#0b1622");
      PX.text(g, label, 240, 31, { size: 16, col: C.yellow, align: "center" });
      // plaque
      PX.rect(g, 310, 118, 108, 40, "#6a4808"); PX.rect(g, 312, 120, 104, 36, "#b8860b"); PX.rect(g, 312, 120, 104, 2, "#e0b040");
      plaque.forEach((ln, k) => PX.text(g, ln, 364, 120 + k * 16, { font: "v", size: 16, col: "#2a1a08", align: "center" }));
      // student: walks up, waits, steps into the light
      const arrive = Math.min(3.5, open - 0.6);
      let sx = t < arrive ? PX.lerp(-40, 120, PX.clamp(t / arrive, 0, 1)) : 120, walking = t < arrive;
      if (t > open + 0.7) { const p = PX.clamp((t - open - 0.7) / 1.0, 0, 1); sx = PX.lerp(120, DX + DW / 2 - 17, p); walking = p < 1; }
      const look = !walking && t < open ? (PX.blink(t, 0.8) ? "?" : "") : "";
      PX.person(g, R(sx), FL - 65, { sc: 5, col: C.cyan, cap: true, frame: walking ? Math.floor(t * 5) % 2 : 0 });
      if (look) PX.text(g, look, R(sx) + 16, FL - 90, { size: 16, col: C.yellow, align: "center" });
      // SIDE DOOR neon sign
      if (t >= side) {
        const u = t - side, on = u > 0.5 ? !(PX.blink(t, 2.3, 0.04)) : [1, 0, 1, 1, 0, 1][Math.floor(u / 0.08) % 6];
        const col = on ? C.pink : "#4a1a30";
        if (on) PX.alpha(g, 0.15, () => PX.rect(g, 18, 84, 160, 50, C.pink));
        PX.text(g, sideText, 98, 92, { size: 16, col, align: "center" });
        // arrow pointing at the door
        PX.rect(g, 60, 118, 100, 3, col); buy_poly(g, [[160, 112], [174, 119], [160, 127]], col);
      }
    };
  };

  // ======================= funnel =======================
  // o: harsh (4.0) funnel narrows + fewer pass, seats (3), gate ("HAS DEGREE?"), every (0.32) s between resumes
  K.funnel = (o) => {
    const harsh = def(o.harsh, 4.0), seats = def(o.seats, 3), gate = o.gate || "HAS DEGREE?", every = def(o.every, 0.32);
    const r = PX.rnd(21), res = [];
    for (let k = 0; k < 80; k++) res.push({ t0: 0.1 + k * every, x0: 140 + r() * 190, roll: r(), dir: r() < 0.5 ? -1 : 1 });
    const CX = 240, TOP = 62, NECK = 150, GY = 204;
    const paper = (g, x, y, tint) => {
      x = R(x); y = R(y);
      PX.rect(g, x, y, 22, 28, "#c4bda8"); PX.rect(g, x + 19, y, 3, 28, "#9c9682"); PX.rect(g, x, y, 22, 2, "#d8d2c0");
      PX.rect(g, x + 3, y + 3, 6, 7, "#6a7a8a"); PX.rect(g, x + 11, y + 4, 7, 2, INK); PX.rect(g, x + 11, y + 7, 5, 1, INK);
      for (let k = 0; k < 5; k++) PX.rect(g, x + 3, y + 13 + k * 3, 14 - (k % 2) * 4, 1, "#6a6458");
      if (tint) { PX.box(g, x - 1, y - 1, 24, 30, tint); PX.box(g, x - 2, y - 2, 26, 32, tint); }
    };
    return (g, t, d) => {
      const nar = t >= harsh ? PX.q(PX.clamp((t - harsh) / 0.5, 0, 1), 5) : 0;
      const sw = R(PX.lerp(20, 7, nar)), tw = R(PX.lerp(132, 112, nar));
      const [sx] = buy_shake(t, harsh, 0.5, 3);
      // tray of seats at the bottom
      PX.rect(g, CX - 60, 252, 120, 6, G2); PX.rect(g, CX - 60, 252, 120, 1, G3);
      // gate: posts + scanner beam
      PX.rect(g, CX - 46, GY - 22, 8, 48, G2); PX.rect(g, CX + 38, GY - 22, 8, 48, G2); PX.rect(g, CX - 46, GY - 22, 2, 48, G3); PX.rect(g, CX + 38, GY - 22, 2, 48, G3);
      let flash = null;
      // resumes
      res.forEach((rs) => {
        const u = t - rs.t0; if (u < 0 || rs.t0 > d - 1.4) return;
        const pass = rs.roll < (rs.t0 + 1.5 < harsh ? 0.5 : 0.12);
        let x, y, tint = null;
        if (u < 0.5) { const p = u / 0.5; x = rs.x0; y = PX.lerp(-24, TOP - 6, p * p); }
        else if (u < 1.2) { const p = PX.q((u - 0.5) / 0.7, 10); x = PX.lerp(rs.x0, CX, p); y = PX.lerp(TOP - 6, NECK - 10, p * p); }
        else if (u < 1.5) { const p = (u - 1.2) / 0.3; x = CX; y = PX.lerp(NECK - 10, GY - 10, p); }
        else if (pass) { const p = PX.clamp((u - 1.5) / 0.35, 0, 1); x = CX; y = PX.lerp(GY - 10, 232, p); tint = C.green; if (u > 2.0) return; if (u < 1.75) flash = C.green; }
        else { const p = (u - 1.5) / 0.9; if (p > 1) return; x = CX + rs.dir * p * 300; y = GY - 10 - Math.sin(p * Math.PI) * 70 + p * 60; tint = C.red; if (u < 1.75) flash = C.red; }
        paper(g, x - 11, y - 4, tint);
        if (tint === C.red) buy_cross(g, R(x) - 7, R(y) + 6, 2);
        if (tint === C.green) buy_tick(g, R(x) - 9, R(y) + 7, 2);
      });
      // funnel body (drawn over the papers in the neck, so they vanish inside)
      g.save(); g.translate(sx, 0);
      buy_poly(g, [[CX - 134, TOP], [CX + 134, TOP], [CX + sw, NECK], [CX - sw, NECK]], "rgba(58,70,84,.55)");
      for (let k = 0; k < 3; k++) { PX.line(g, CX - 134 + k, TOP, CX - sw + k, NECK, k === 0 ? "#b8c6d2" : G3); PX.line(g, CX + 134 - k, TOP, CX + sw - k, NECK, k === 0 ? G1 : G2); }
      PX.rect(g, CX - 140, TOP - 6, 280, 6, G3); PX.rect(g, CX - 140, TOP - 6, 280, 2, "#b8c6d2"); PX.rect(g, CX - 140, TOP, 280, 2, G1);
      PX.rect(g, CX - sw, NECK, 2 * sw, 26, G2); PX.rect(g, CX - sw, NECK, 3, 26, G3); PX.rect(g, CX + sw - 3, NECK, 3, 26, G1);
      PX.rect(g, CX - sw + 3, NECK, 2 * sw - 6, 26, "#1a222c");
      if (nar > 0 && t < harsh + 0.8) { PX.text(g, ">", CX - tw - 6, 100, { size: 16, col: C.red, align: "center" }); PX.text(g, "<", CX + tw + 6, 100, { size: 16, col: C.red, align: "center" }); }
      g.restore();
      // beam
      const bc = flash || (PX.blink(t, 0.2) ? "#3a5a6a" : "#2a4050");
      PX.rect(g, CX - 38, GY + 2, 76, 3, bc); if (flash) PX.alpha(g, 0.25, () => PX.rect(g, CX - 38, GY - 4, 76, 15, flash));
      PX.rect(g, CX - 42, GY - 26, 84, 4, flash || G3);
      // gate sign
      PX.panel(g, 28, GY - 12, 150, 26, C.yellow, "#0b1622"); PX.text(g, gate, 103, GY - 3, { col: C.yellow, align: "center" });
      PX.rect(g, 178, GY, 14, 2, C.yellow);
      // seats counter
      PX.panel(g, 318, 8, 154, 26, C.cyan, "#0b1622");
      PX.text(g, "JUNIOR SEATS: " + seats, 395, 17, { col: t >= harsh && PX.blink(t, 0.5) ? C.red : C.white, align: "center" });
    };
  };

  // ======================= difficulty =======================
  // o: at (1.5) cursor moves to HARD, title ("SELECT DIFFICULTY"), opts (["EASY","NORMAL","HARD"]), notes (["", "DEGREE", "SELF-TAUGHT"])
  K.difficulty = (o) => {
    const at = def(o.at, 1.5), title = o.title || "SELECT DIFFICULTY", opts = o.opts || ["EASY", "NORMAL", "HARD"], notes = o.notes || ["", "DEGREE", "SELF-TAUGHT"];
    const X = 56, Y = 22, W = 368, H = 226;
    return (g, t) => {
      const hard = t >= at, sel = hard ? 2 : 1, u = t - at;
      PX.panel(g, X, Y, W, H, hard && PX.blink(t, 0.4) ? C.red : C.cyan, "#0b1622");
      PX.box(g, X + 4, Y + 4, W - 8, H - 8, "#1d3448");
      PX.text(g, PX.typed(title, t, 0, 40), 240, Y + 18, { size: 16, col: C.yellow, align: "center" });
      PX.rect(g, X + 30, Y + 42, W - 60, 2, "#1d3448");
      opts.forEach((op, i) => {
        const y = Y + 66 + i * 50, isSel = i === sel, show = t >= 0.15 + i * 0.12;
        if (!show) return;
        if (isSel) PX.rect(g, X + 22, y - 8, W - 44, 32, hard ? (PX.blink(t, 0.4) ? "#4a1018" : "#2a0a10") : "#14283a");
        const col = i === 0 ? "#4a5a68" : isSel && hard ? (PX.blink(t, 0.4) ? C.red : "#ff9a9a") : isSel ? C.white : "#8b9bab";
        PX.text(g, op, X + 66, y, { size: 16, col });
        if (i === 0) { // EASY is locked (sight gag)
          PX.rect(g, X + 60, y + 6, PX.tw(g, op, { size: 16 }) + 12, 2, "#4a5a68");
          const lx = X + 140, ly = y - 2; PX.rect(g, lx + 3, ly, 8, 2, G2); PX.rect(g, lx + 2, ly, 2, 7, G2); PX.rect(g, lx + 10, ly, 2, 7, G2); PX.rect(g, lx, ly + 6, 14, 11, G2); PX.rect(g, lx + 6, ly + 9, 2, 4, G1);
        }
        if (notes[i]) PX.text(g, notes[i], X + 214, y - 2, { font: "v", size: 20, col: "#6a7a88" });
      });
      // cursor: blinking arrow, jumps NORMAL -> HARD
      const cy = Y + 66 + sel * 50 + 1 + (hard && u < 0.1 ? -6 : 0), cx = X + 38 + (PX.blink(t, 0.5) ? 0 : 3);
      buy_poly(g, [[cx, cy], [cx + 12, cy + 7], [cx, cy + 14]], hard ? C.red : C.yellow);
      if (hard && u > 0.3) { const s = buy_pop(t, at + 0.3, 0.3); buy_scaled(g, s, X + W - 46, Y + 174, () => buy_skull(g, X + W - 60, Y + 162, 3, PX.blink(t, 0.4) ? C.red : "#120808")); }
    };
  };

  // ======================= coast =======================
  // o: stop (2.2) hits the "NO COASTING" sign and tumbles, sign (["NO","COASTING"])
  K.coast = (o) => {
    const stop = def(o.stop, 2.2), sign = o.sign || ["NO", "COASTING"];
    const SX = 330, Y0 = 92, Y1 = 214, POST = 368;
    const gy = (x) => (x < SX ? Y0 + ((Y1 - Y0) * x) / SX : Y1);
    const r = PX.rnd(9), rocks = []; for (let i = 0; i < 26; i++) { const x = r() * 480; rocks.push([x, gy(x) + 8 + r() * 40]); }
    return (g, t) => {
      // hill
      buy_poly(g, [[0, Y0], [SX, Y1], [480, Y1], [480, 270], [0, 270]], "#16301e");
      buy_poly(g, [[0, Y0], [SX, Y1], [480, Y1], [480, Y1 + 4], [SX, Y1 + 4], [0, Y0 + 4]], "#3a8a4a");
      rocks.forEach(([x, y]) => PX.rect(g, x, y, 3, 2, "#24482c"));
      // board/rider position
      const hit = t >= stop, p = PX.clamp(t / stop, 0, 1), bx = R(24 + (POST - 18 - 24) * Math.pow(p, 1.7));
      const by = R(gy(bx)), sl = bx < SX ? (Y1 - Y0) / SX : 0;
      // sign (wobbles on impact)
      const wob = hit && t < stop + 0.5 ? (PX.blink(t, 0.08) ? 2 : -2) : 0;
      PX.rect(g, POST - 4, Y1 - 56, 8, 56, "#8b9bab"); PX.rect(g, POST - 4, Y1 - 56, 2, 56, "#b8c6d2");
      PX.rect(g, POST - 72 + wob, Y1 - 120, 144, 66, "#d8dce0"); PX.rect(g, POST - 69 + wob, Y1 - 117, 138, 60, "#b02424"); PX.rect(g, POST - 69 + wob, Y1 - 117, 138, 2, "#e04a4a");
      PX.text(g, sign[0], POST + wob, Y1 - 110, { size: 24, col: C.white, align: "center" });
      if (sign[1]) PX.text(g, sign[1], POST + 1 + wob, Y1 - 80, { size: 16, col: C.white, align: "center" });
      const board = (x, y, s) => { for (let k = 0; k < 3; k++) PX.line(g, x - 20, y - 5 - k - R(-20 * s), x + 20, y - 5 - k - R(20 * s), k === 2 ? "#f0b070" : C.orange); PX.rect(g, x - 15, y - 4 - R(-15 * s), 4, 4, "#20242c"); PX.rect(g, x + 11, y - 4 - R(11 * s), 4, 4, "#20242c"); };
      if (!hit) {
        // speed lines behind
        if (t > 0.4) for (let k = 0; k < 4; k++) { const len = 14 + ((k * 13 + Math.floor(t * 12)) % 3) * 8, ox = bx - 26 - k * 6, oy = by - 12 - k * 9; PX.line(g, ox - len, oy - R(sl * len), ox, oy, k % 2 ? C.cyan : C.white); }
        board(bx, by, -sl);
        const bb = PX.blink(t, 0.3) ? 0 : 1;
        PX.person(g, bx - 14, by - 58 + bb, { sc: 4, col: C.cyan, frame: 0 });
        PX.rect(g, bx - 22, by - 34 + bb, 8, 4, PX.C.skin[1]); PX.rect(g, bx + 14, by - 42 + bb, 8, 4, PX.C.skin[1]); // arms out
      } else {
        const u = t - stop;
        // board bounces back and flips
        const bp = PX.clamp(u / 0.5, 0, 1); board(R(bx - bp * 40), R(Y1 - Math.sin(bp * Math.PI) * 18), 0);
        // rider flies over the sign, tumbling in 90-degree steps, then lies flat
        const fp = PX.clamp(u / 0.8, 0, 1), fx = R(PX.lerp(bx, 436, fp)), fy = R(PX.lerp(Y1 - 30, Y1 - 14, fp) - Math.sin(fp * Math.PI) * 110);
        const rot = fp < 1 ? Math.floor(u / 0.1) % 4 : 1;
        g.save(); g.translate(fx, fy); g.rotate((rot * Math.PI) / 2);
        PX.person(g, -14, -26, { sc: 4, col: C.cyan, frame: 1 });
        g.restore();
        buy_dust(g, POST - 10, Y1, u / 0.6);
        buy_dust(g, 440, Y1, (u - 0.8) / 0.6);
        if (u < 0.4) PX.text(g, "!", POST - 86, Y1 - 120, { size: 16, col: C.yellow, align: "center" });
        // dizzy stars
        if (fp >= 1) for (let k = 0; k < 3; k++) { const a = u * 6 + (k * Math.PI * 2) / 3; buy_spark(g, 456 + R(Math.cos(a) * 14), Y1 - 34 + R(Math.sin(a) * 5), 2, C.yellow); }
      }
    };
  };
})();
