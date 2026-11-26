/* EP3 Builder E scenes (the skill study): classroom52, quiz, finish_race, quiz_scores, debug_gap, calendar_gap,
   two_groups, no_map. Reuses PX.learn (person, sh, limb, cone, pendant, clock, sweat) and PX.core from EP2. */
(function () {
  const { K } = PX;
  const R = PX.rect, cl = PX.clamp, lerp = PX.lerp;
  const LB = PX.learn, sh = LB.sh, limb = LB.limb, ell = LB.ell;
  const SK = (PX.skill = {});

  // option time with default scaled to the shot length (def given for the typical length typ)
  const T = (o, k, def, d, typ) => (o[k] !== undefined ? o[k] : Array.isArray(def) ? def.map((v) => (v * d) / typ) : (def * d) / typ);
  const mix = (a, b, k) => {
    k = cl(k, 0, 1); const A = parseInt(a.slice(1), 16), B = parseInt(b.slice(1), 16);
    return "#" + [16, 8, 0].map((s) => Math.round(((A >> s) & 255) * (1 - k) + ((B >> s) & 255) * k).toString(16).padStart(2, "0")).join("");
  };
  const frac = (x) => x - Math.floor(x);
  // light shaft made of 1px rows between two horizontal spans (additive)
  const shaft = (g, ax0, ax1, y0, bx0, bx1, y1, col, a) => {
    const op = g.globalCompositeOperation, oa = g.globalAlpha; g.globalCompositeOperation = "lighter";
    for (let y = y0; y < y1; y++) { const k = (y - y0) / (y1 - y0); g.globalAlpha = oa * a * (1 - k * 0.8); R(g, lerp(ax0, bx0, k), y, lerp(ax1, bx1, k) - lerp(ax0, bx0, k), 1, col); }
    g.globalAlpha = oa; g.globalCompositeOperation = op;
  };
  // hanging sign (two wires from the top), swings in from above with back ease at k (0..1)
  const hangSign = (SK.hangSign = (g, cx, y, w, h, k, t, txt, col, o) => {
    o = o || {}; if (k <= 0) return;
    const yy = Math.round(lerp(-h - 10, y, PX.ease(cl(k, 0, 1), "back"))), sw = Math.round(Math.sin(t * 2.2 + cx) * (k < 1 ? 2 : 0.6));
    const x = Math.round(cx - w / 2) + sw;
    R(g, x + 6, 0, 1, yy, "#262838"); R(g, x + w - 7, 0, 1, yy, "#262838");
    R(g, x + 2, yy + 3, w, h, "rgba(0,0,0,0.45)");
    R(g, x, yy, w, h, o.fill || "#1a1d2c"); PX.box(g, x, yy, w, h, col); R(g, x + 1, yy + 1, w - 2, 1, sh(col, 1.3));
    R(g, x + 5, yy - 1, 3, 3, "#8a8fa0"); R(g, x + w - 8, yy - 1, 3, 3, "#8a8fa0");
    PX.glow(g, x + w / 2, yy + h / 2, w * 0.7, o.glow || col, 0.25);
    PX.text(g, txt, x + w / 2, yy + Math.round((h - (o.size || 8)) / 2) + 1, { size: o.size || 8, col: o.tcol || col, align: "center" });
  });

  /* The AI agent avatar: rounded cyan-grey box head, two big square eyes, small antenna with a pink LED.
     (cx, cy) = head centre, w = head width (6..120). o.eyes: "on" | "happy" | "wide" | "off" | "x"; o.sq = vertical squash 0..1 (CRT blink) */
  const agent = (SK.agent = (g, cx, cy, w, t, o) => {
    o = o || {}; w = Math.max(6, Math.round(w)); const sq = o.sq === undefined ? 1 : o.sq;
    const h = Math.max(1, Math.round(w * 0.78 * sq)), x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
    const off = o.eyes === "off" || o.eyes === "x";
    const base = off ? "#4c5662" : "#8db3bf", hl = off ? "#626e7a" : "#c6e6ec", dk = off ? "#343c46" : "#58798a";
    if (!off && o.glow !== false) PX.glow(g, cx, cy, w * 1.5, "rgba(95,227,232,0.5)", o.ga === undefined ? 0.55 : o.ga);
    if (sq > 0.5) { // antenna
      const ah = Math.max(2, Math.round(w * 0.26)), led = off ? "#5a2a3a" : PX.blink(t + (o.ph || 0), 1.2, 0.6) ? "#ff7cc0" : "#b03a7a";
      R(g, Math.round(cx), y - ah, 1, ah, dk);
      const lr = Math.max(1, Math.round(w / (w > 40 ? 22 : 12))); R(g, Math.round(cx) - lr + 1, y - ah - lr * 2 + 1, lr * 2 - 1 + 1, lr * 2 - 1 + 1, led);
      if (!off) PX.glow(g, cx + 0.5, y - ah - lr + 1, 4 + w * 0.12, "rgba(242,92,168,0.8)", 0.6);
    }
    const cut = w >= 16 ? 2 : 1;
    for (let r = 0; r < h; r++) { const ins = r === 0 || r === h - 1 ? cut : r === 1 || r === h - 2 ? cut - 1 : 0; R(g, x + ins, y + r, w - ins * 2, 1, base); }
    R(g, x + cut, y, w - cut * 2, 1, hl); R(g, x, y + cut, 1, Math.max(1, h - cut * 2), hl);
    R(g, x + w - 1, y + cut, 1, Math.max(1, h - cut * 2), dk); R(g, x + cut, y + h - 1, w - cut * 2, 1, dk);
    if (w >= 14) { R(g, x - 1, y + Math.round(h * 0.35), 1, Math.max(2, Math.round(h * 0.3)), dk); R(g, x + w, y + Math.round(h * 0.35), 1, Math.max(2, Math.round(h * 0.3)), dk); } // ear bolts
    if (h < 3) return;
    const m = Math.max(1, Math.round(w * 0.13)), fx = x + m, fy = y + m, fw = w - 2 * m, fh = h - 2 * m;
    R(g, fx, fy, fw, fh, off ? "#14181e" : "#10202c");
    if (fw >= 8) R(g, fx, fy, fw, 1, off ? "#1c2228" : "#1a3446");
    const e = Math.max(1, Math.round(w * 0.17)), eh = Math.max(1, Math.min(fh - 1, o.eyes === "wide" ? Math.round(e * 1.4) : e));
    const ey = fy + Math.max(0, Math.round(fh * 0.42 - eh / 2));
    const lk = Math.round(o.look || 0), ex = [Math.round(cx - w * 0.2 - e / 2) + lk, Math.round(cx + w * 0.2 - e / 2) + lk];
    const ec = o.ecol || "#5fe3e8";
    const blinkNow = o.blink !== false && !off && frac((t + (o.ph || 0)) / 3.3) > 0.96;
    for (const xx of ex) {
      if (o.eyes === "off") continue;
      if (o.eyes === "x") { const c2 = "#ff5c5c"; R(g, xx, ey, 1, 1, c2); R(g, xx + e - 1, ey, 1, 1, c2); R(g, xx + Math.floor(e / 2), ey + Math.floor(eh / 2), 1, 1, c2); R(g, xx, ey + eh - 1, 1, 1, c2); R(g, xx + e - 1, ey + eh - 1, 1, 1, c2); continue; }
      if (o.eyes === "happy") { R(g, xx, ey + 1, e, 1, ec); if (e > 2) { R(g, xx, ey + 2, 1, 1, ec); R(g, xx + e - 1, ey + 2, 1, 1, ec); } continue; }
      if (blinkNow) { R(g, xx, ey + Math.floor(eh / 2), e, 1, ec); continue; }
      R(g, xx, ey, e, eh, ec); if (e >= 3) R(g, xx, ey, Math.ceil(e / 2), 1, "#d8fbff");
    }
    if (fh >= 6 && !off) { const mw = Math.max(2, Math.round(w * 0.22)); R(g, Math.round(cx - mw / 2), fy + fh - Math.max(2, Math.round(fh * 0.22)), mw, 1, o.eyes === "happy" ? "#5fe3e8" : "#3a8a9a"); }
  });

  /* Student seen from behind, native size at scale s (s = 1 -> head 10 px). (x, y) = seat centre on the desk's near edge.
     a = {hood, hair, skin, style, ph}; o = {rim, typing, bob, arms ("up"|"hand"), writing} */
  const backStudent = (SK.backStudent = (g, x, y, s, a, t, o) => {
    o = o || {};
    const S = (v) => Math.max(1, Math.round(v * s));
    x = Math.round(x);
    const bob = o.bob || 0, sy = Math.round(y - 9 * s) + bob;
    const hood = a.hood, hd = sh(hood, 0.68), hl = sh(hood, 1.28), rim = o.rim || "#ffd8a0";
    const sw = S(24), th = S(17), hw = S(10), hh = S(11);
    const ty = o.typing ? (Math.sin(t * 17 + a.ph * 9) > 0 ? 1 : 0) : 0, wr = o.writing ? Math.round(Math.sin(t * 9 + a.ph * 5)) : 0;
    // elbows / arms
    if (o.arms === "up") {
      limb(g, x - sw / 2 + S(2), sy + S(3), x - S(6), sy - S(22), S(4), hood, hd); limb(g, x + sw / 2 - S(2), sy + S(3), x + S(6), sy - S(22), S(4), hood, hd);
      R(g, x - S(8), sy - S(25), S(4), S(4), a.skin); R(g, x + S(4), sy - S(25), S(4), S(4), a.skin);
    } else {
      R(g, x - sw / 2 - S(2), sy + S(4) + ty, S(4), S(9), hd); R(g, x - sw / 2 - S(2), sy + S(4) + ty, 1, S(9), sh(hood, 0.5));
    }
    if (o.arms === "hand") { limb(g, x + sw / 2 - S(2), sy + S(3), x + S(10), sy - S(24), S(4), hood, hd); R(g, x + S(8), sy - S(28), S(4), S(5), a.skin); R(g, x + S(8), sy - S(28), S(4), 1, sh(a.skin, 1.2)); }
    else if (o.arms !== "up") R(g, x + sw / 2 - S(2), sy + S(4) + (o.typing ? 1 - ty : 0) + wr, S(4), S(9), hd);
    // torso
    for (let r = 0; r < th; r++) { const w = sw - (r === 0 ? S(7) : r === 1 ? S(4) : r === 2 ? S(1) : 0); R(g, x - w / 2, sy + r, w, 1, hood); }
    R(g, x - sw / 2, sy + S(3), S(3), th - S(3), hd); R(g, x + sw / 2 - S(3), sy + S(3), S(3), th - S(3), hd);
    R(g, x - S(1) + 1, sy + S(6), 1, th - S(6), hd);
    R(g, x - sw / 2 + S(4), sy, sw - S(8), 1, rim); R(g, x - sw / 2 + S(1), sy + S(2), S(2), 1, sh(rim, 0.8)); R(g, x + sw / 2 - S(3), sy + S(2), S(2), 1, sh(rim, 0.8));
    // hood bump on the back
    R(g, x - S(6), sy - 1, S(12), S(5), hd); R(g, x - S(5), sy - 1, S(10), 1, hl); R(g, x - S(4), sy + S(4) - 1, S(8), 1, sh(hood, 0.55));
    // head
    const hx = x - Math.round(hw / 2), hy = sy - hh + S(2);
    const skin = a.skin, hair = a.hair, hlh = sh(hair, 1.5);
    R(g, hx + 1, hy, hw - 2, hh, skin); R(g, hx, hy + 1, hw, hh - 2, skin);
    R(g, hx - 1, hy + Math.round(hh * 0.45), 1, S(2), sh(skin, 0.85)); R(g, hx + hw, hy + Math.round(hh * 0.45), 1, S(2), sh(skin, 0.85)); // ears
    const st = a.style;
    if (st === "bald") { R(g, hx + 2, hy, hw - 4, 1, rim); R(g, hx, hy + Math.round(hh * 0.55), hw, S(3), hair); }
    else {
      const nape = st === "long" || st === "pony" ? 0 : S(2);
      R(g, hx + 1, hy - 1, hw - 2, hh - nape + 1, hair); R(g, hx, hy, hw, hh - nape - 1, hair);
      if (st === "curly") for (let i = 0; i < hw; i += Math.max(2, S(3))) R(g, hx + i - 1, hy - 2, S(3), S(3), hair);
      if (st === "spiky") for (let i = 0; i < hw; i += Math.max(2, S(3))) R(g, hx + i, hy - 2 - (i % 2), S(2), S(2), hair);
      if (st === "long") R(g, hx - 1, hy + S(3), hw + 2, hh + S(4), hair);
      if (st === "pony") { R(g, x - S(1), hy + hh - S(1), S(3), S(7), hair); R(g, x - S(1), hy + hh - S(2), S(3), 1, "#c04a6a"); }
      if (st === "bun") { PX.circle(g, x, hy - S(2), S(3), hair); R(g, x - S(1), hy - S(4), S(2), 1, hlh); }
      if (st === "cap") { R(g, hx, hy - 1, hw, Math.round(hh * 0.5), a.cap || "#c0392b"); R(g, hx + 1, hy - 2, hw - 2, 1, a.cap || "#c0392b"); R(g, x - S(1), hy + Math.round(hh * 0.5) - S(2), S(3), S(2), skin); R(g, hx + 1, hy - 2, hw - 2, 1, rim); }
      else { R(g, hx + 2, hy - (st === "curly" || st === "spiky" ? 2 : 1), hw - 4, 1, rim); R(g, hx + 1, hy + 1, S(2), Math.round(hh * 0.4), hlh); }
    }
  });

  // headphones around the dev's neck (front-facing LB.person), from person() return value
  const phones = (g, p) => {
    const y = p.ty - 1, w = p.hw + 2;
    R(g, p.hx - w / 2, y - 1, w, 2, "#2a2c36"); R(g, p.hx - w / 2 - 2, y - 2, 4, 5, "#3a3e4a"); R(g, p.hx + w / 2 - 2, y - 2, 4, 5, "#3a3e4a");
    R(g, p.hx - w / 2 - 2, y - 2, 4, 1, "#5a6070"); R(g, p.hx + w / 2 - 2, y - 2, 4, 1, "#5a6070");
  };
  SK.dev = (g, x, y, o) => { const p = LB.person(g, x, y, { skin: "#a86b3c", hair: "#1a120c", hairStyle: "spiky", shirt: "#3f9a55", pants: "#2a3046", ...o }); phones(g, p); return p; };

  // ======================= the training room (classroom52 + quiz) =======================
  const ROWS = [{ y: 210, s: 0.6, n: 7 }, { y: 240, s: 0.78, n: 7 }, { y: 280, s: 1.0, n: 6 }, { y: 330, s: 1.25, n: 6 }];
  const HOODS = ["#3a6ab0", "#b04a5a", "#4a9a6a", "#8a5ab0", "#c08a3a", "#3a8a9a", "#6a6a82", "#a05a3a", "#2f4a86", "#7a3a6a", "#4a7a3a", "#c06a8a"];
  const HAIRS = ["#1a120c", "#3a2416", "#6a4a2a", "#c8a060", "#24242c", "#8a3a2a", "#4a3020", "#d8c8a8"];
  const SKINS = ["#f2c9a0", "#e0a878", "#c98a5a", "#a86b3c", "#6b4226", "#d9a066"];
  const STYLES = ["short", "short", "long", "bun", "cap", "curly", "spiky", "pony", "bald", "short", "long", "curly"];
  const SEATS = [];
  {
    const r = PX.rnd(52);
    ROWS.forEach((row, ri) => {
      const sp = 36 * row.s, a = 10 * row.s + 4;
      for (const side of [-1, 1]) for (let i = 0; i < row.n; i++) {
        SEATS.push({ ri, side, i, s: row.s, y: row.y, x: Math.round(320 + side * (a + (i + 0.5) * sp)), ord: 0,
          a: { hood: HOODS[Math.floor(r() * HOODS.length)], hair: HAIRS[Math.floor(r() * HAIRS.length)], skin: SKINS[Math.floor(r() * SKINS.length)],
            style: STYLES[Math.floor(r() * STYLES.length)], cap: ["#c0392b", "#2a6ab0", "#e0b030"][Math.floor(r() * 3)], ph: r() } });
      }
    });
    // order for staggered effects: front row first, outward from the aisle
    SEATS.slice().sort((p, q) => p.ri - q.ri || p.i - q.i || p.side - q.side).forEach((s, k) => (s.ord = k));
  }

  const laptop = (g, x, y, s, t, ph, o) => {
    const w = Math.round(15 * s), h = Math.round(10 * s), lx = Math.round(x - w / 2), base = Math.round(y - 3 * s);
    R(g, lx - Math.round(2 * s), base, w + Math.round(4 * s), Math.max(2, Math.round(2 * s)), "#565c6c"); R(g, lx - Math.round(2 * s), base, w + Math.round(4 * s), 1, "#7a8090");
    if (o.closed) { R(g, lx - 1, base - 2, w + 2, 2, "#3a3e4a"); R(g, lx - 1, base - 2, w + 2, 1, "#5a6070"); return; }
    R(g, lx - 1, base - h - 1, w + 2, h + 1, "#2a2d36");
    R(g, lx, base - h, w, h - 1, o.tint ? "#0c2a32" : "#0d1520");
    const lines = Math.max(2, Math.floor((h - 2) / 2)), scroll = o.fast ? Math.floor(t * 6) : Math.floor(t * 1.2);
    for (let i = 0; i < lines; i++) {
      const k = (i + scroll + Math.floor(ph * 9)) % 7, lw = Math.max(2, Math.round((w - 3) * (0.3 + ((k * 37) % 60) / 100)));
      R(g, lx + 1 + ((k % 3) ? Math.round(2 * s) : 0), base - h + 1 + i * 2, Math.min(w - 2, lw), 1, o.tint ? ["#5fe3e8", "#3a9aaa", "#8af0f0"][k % 3] : ["#ff7b72", "#d2a8ff", "#a5d6ff", "#c9d1d9"][k % 4]);
    }
    PX.glow(g, x, base - h / 2, 16 * s, o.tint ? "rgba(95,227,232,0.55)" : "rgba(110,160,255,0.5)", o.ga);
  };
  const paper = (g, x, y, s, state, t, ph) => {
    const w = Math.round(14 * s), h = Math.max(3, Math.round(6 * s)), px0 = Math.round(x - w / 2), py0 = Math.round(y - 7 * s);
    R(g, px0 + 1, py0 + 1, w, h, "rgba(0,0,0,0.35)");
    R(g, px0, py0, w, h, state === 2 ? "#e8e2d0" : "#cfc8b4"); R(g, px0, py0, w, 1, "#f4f0e4");
    if (state === 2) for (let i = 1; i < h - 1; i += 2) R(g, px0 + 2, py0 + i, Math.round((w - 4) * (0.5 + 0.5 * frac(ph * 7 + i * 0.37))), 1, "#5a6a8a");
    else R(g, px0 + w - 4, py0 + 1, 2, 1, "#9a947e");
  };
  const deskLamp = (g, x, y, s, a) => {
    const S = (v) => Math.max(1, Math.round(v * s));
    R(g, x - S(3), y - S(2), S(6), S(2), "#3a3e4a"); R(g, x, y - S(10), 1, S(8), "#5a6070");
    R(g, x - S(1), y - S(12), S(6), S(3), "#c0892a"); R(g, x - S(1), y - S(12), S(6), 1, "#ffcf8a");
    if (a > 0) { R(g, x, y - S(9), S(4), 1, "#fff0c0"); PX.glow(g, x + S(2), y - S(7), 22 * s, "rgba(255,190,110,0.9)", 0.6 * a); LB.cone(g, x + S(2), y - S(9), S(4), S(14), S(8), "#ffcf8a", 0.6 * a); }
  };

  // st: {dusk, lights, board(g, t), seat(seat) -> {helper, sq, eyes, offTxt, lamp, closed, paper, typing, writing, sweat, flash, arms}, split, tint}
  const trainRoom = (g, t, c, st) => {
    const dusk = st.dusk, lt = st.lights;
    // ---- far: sky through the windows ----
    PX.par(g, c, 0.35, () => {
      PX.vgrad(g, -40, -20, 720, 120, mix("#4a2c6a", "#10142e", dusk), mix("#c0507a", "#2c2452", dusk), 8);
      PX.vgrad(g, -40, 100, 720, 90, mix("#e8687a", "#2c2452", dusk), mix("#ffb060", "#4a2e5e", dusk), 7);
      if (dusk > 0.35) { const r = PX.rnd(8); for (let i = 0; i < 60; i++) { const sx = -40 + r() * 720, sy = r() * 110, ph = r() * 6; g.globalAlpha = (dusk - 0.35) * 1.5 * (0.5 + 0.5 * Math.sin(t * 2 + ph)); R(g, sx, sy, 1, 1, "#ffffff"); } g.globalAlpha = 1; }
      const sunY = lerp(118, 178, dusk), sunA = 1 - dusk * 0.9;
      PX.glow(g, 92, sunY, 70, "rgba(255,160,90,0.9)", sunA * 0.7);
      PX.alpha(g, sunA, () => { PX.circle(g, 92, sunY, 13, mix("#ffe6a8", "#ff6a50", dusk)); PX.circle(g, 89, sunY - 3, 7, mix("#fff6d0", "#ff8a60", dusk)); });
      // cloud streaks
      for (let i = 0; i < 6; i++) { const cx = ((i * 131 + t * (2 + i * 0.4)) % 760) - 60, cy = 60 + i * 15; const col = mix(i % 2 ? "#ff9a8a" : "#f0b0a0", "#3a3264", dusk);
        R(g, cx, cy, 70 - i * 6, 2, col); R(g, cx + 10, cy - 2, 34 - i * 3, 2, col); R(g, cx + 6, cy + 2, 50 - i * 5, 1, sh(col, 0.85)); }
      // birds
      for (let i = 0; i < 3; i++) { const bx = ((t * 14 + i * 24) % 220) - 20, by = 76 + i * 7 + Math.round(Math.sin(t * 3 + i) * 2), up = PX.blink(t + i * 0.2, 0.4);
        R(g, bx, by, 1, 1, "#20182a"); R(g, bx - 2, by - (up ? 1 : 0), 2, 1, "#20182a"); R(g, bx + 1, by - (up ? 1 : 0), 2, 1, "#20182a"); }
      // city silhouette
      const r = PX.rnd(21); let bx = -40;
      while (bx < 690) { const bw = 14 + Math.floor(r() * 24), bh = 18 + Math.floor(r() * 40), top = 178 - bh, col = mix(r() < 0.5 ? "#3a2440" : "#43294a", "#141830", dusk);
        R(g, bx, top, bw, bh, col); R(g, bx, top, bw, 1, sh(col, 1.3));
        for (let wy = top + 4; wy < 174; wy += 5) for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) { const on = r(); if (on < dusk * 0.5) R(g, wx, wy, 2, 2, Math.sin(t * 0.7 + wx + wy) > -0.85 ? "#f7c948" : "#5a4a20"); }
        bx += bw + 1 + Math.floor(r() * 3); }
    });
    // ---- the front wall with window holes ----
    PX.par(g, c, 0.6, () => {
      const wall = mix("#3e2e4c", "#1c2040", dusk), wd = sh(wall, 0.8), wl = sh(wall, 1.12);
      R(g, -40, -20, 720, 50, wall); R(g, -40, 170, 720, 40, wall); R(g, -40, 30, 60, 140, wall); R(g, 160, 30, 320, 140, wall); R(g, 620, 30, 60, 140, wall);
      for (let x = -40; x < 680; x += 4) R(g, x, 32 + ((x / 4) % 2), 1, 1, wd);
      // wainscot
      R(g, -40, 178, 720, 18, mix("#4a3026", "#2a1e22", dusk)); R(g, -40, 178, 720, 1, mix("#7a5038", "#4a3430", dusk)); for (let x = -36; x < 680; x += 40) R(g, x, 180, 1, 16, mix("#3a241e", "#1e1418", dusk));
      // windows
      const wf = mix("#d8c8b0", "#5a5a72", dusk), wfd = sh(wf, 0.7);
      for (const wx of [20, 480]) {
        R(g, wx - 4, 26, 148, 4, wf); R(g, wx - 4, 170, 148, 3, wf); R(g, wx - 7, 173, 154, 4, wl); R(g, wx - 7, 177, 154, 1, wd);
        R(g, wx - 4, 26, 4, 147, wf); R(g, wx + 140, 26, 4, 147, wfd); R(g, wx + 68, 30, 4, 140, wf); R(g, wx, 96, 140, 3, wf); R(g, wx, 99, 140, 1, wfd);
        R(g, wx - 4, 26, 148, 1, sh(wf, 1.2));
        // glass sheen
        PX.alpha(g, 0.08, () => { for (let i = 0; i < 3; i++) PX.line(g, wx + 10 + i * 6, 90, wx + 40 + i * 6, 36, "#ffffff"); });
      }
      // chalkboard
      R(g, 192, 40, 256, 108, mix("#6a4630", "#3e2a22", dusk)); R(g, 192, 40, 256, 1, mix("#a07050", "#5a4034", dusk)); R(g, 192, 147, 256, 1, "#1a1012");
      PX.vgrad(g, 197, 45, 246, 98, "26443a", "1c342c", 5);
      PX.alpha(g, 0.12, () => { for (let i = 0; i < 9; i++) R(g, 210 + i * 26, 60 + ((i * 17) % 60), 18, 2, "#c8d8c8"); });   // old smudges
      R(g, 196, 143, 248, 5, mix("#7a5238", "#4a3228", dusk)); R(g, 214, 141, 8, 2, "#f0f0e0"); R(g, 226, 141, 6, 2, "#f7c948"); R(g, 410, 140, 16, 3, "#5a4a6a"); R(g, 410, 140, 16, 1, "#8a7a9a");
      if (st.board) st.board(g, t);
      // little poster + clock
      R(g, 166, 66, 22, 30, "#22263a"); R(g, 168, 68, 18, 26, "#3a5a8a"); PX.text(g, "{ }", 177, 74, { size: 8, col: "#f7c948", align: "center" }); R(g, 171, 86, 12, 1, "#8ab0e0"); R(g, 171, 89, 9, 1, "#8ab0e0");
      LB.clock(g, 463, 72, st.clockT === undefined ? t * 12 : st.clockT, st.clockR || 10);
      R(g, 455, 84, 16, 1, "rgba(0,0,0,0.3)");
    });
    // light from the windows
    shaft(g, 22, 158, 178, -50, 230, 360, "#ffb070", (1 - dusk) * 0.22);
    shaft(g, 482, 618, 178, 420, 700, 360, "#ffb070", (1 - dusk) * 0.18);
    PX.glow(g, 92, 120, 120, "rgba(255,150,90,0.5)", (1 - dusk) * 0.6);
    // ---- floor ----
    PX.par(g, c, 0.85, () => {
      const fc = mix("#4a3430", "#262234", dusk * 0.7);
      R(g, -40, 196, 720, 180, fc); R(g, -40, 196, 720, 1, sh(fc, 0.6));
      for (let k = -16; k <= 16; k++) PX.line(g, 320 + k * 26, 197, 320 + k * 78, 372, sh(fc, 0.82));
      let yy = 200, kk = 3; while (yy < 372) { R(g, -40, yy, 720, 1, sh(fc, 0.9)); yy += kk; kk += 3; }
    });
    // ceiling + pendant lamps
    R(g, -40, -20, 720, 34, "#0e1020"); R(g, -40, 13, 720, 1, "#262a40"); for (let x = -40; x < 680; x += 60) R(g, x, -20, 2, 33, "#161a2c");
    PX.par(g, c, 0.8, () => {
      for (const lx of [110, 250, 390, 530]) {
        LB.pendant(g, lx, 0, t, lt, 20);
        if (lt > 0) { PX.glow(g, lx, 32, 40, "rgba(255,226,168,0.9)", lt * 0.7); LB.cone(g, lx, 31, 18, 110, 170, "#ffe2a8", lt * 0.11); }
      }
    });
    // ---- the split line down the aisle ----
    const sp = st.split || 0;
    if (sp > 0) {
      const y1 = lerp(196, 372, sp);
      PX.glow(g, 160, 290, 230, "rgba(95,227,232,0.35)", (st.tint || 0) * 0.5);
      PX.glow(g, 480, 290, 230, "rgba(255,180,100,0.35)", (st.tint || 0) * 0.5);
      for (let y = 196; y < y1; y += 2) { const k = (y - 196) / 176, w = 1 + Math.round(k * 2); R(g, 320 - Math.floor(w / 2), y, w, 2, "#bff8ff"); }
      PX.glow(g, 320, y1, 30, "rgba(160,250,255,0.9)", sp < 1 ? 1 : 0.4);
      for (let y = 200; y < y1; y += 24) PX.glow(g, 320, y + ((t * 40) % 24), 10, "rgba(120,240,255,0.7)", 0.6);
    }
    // ---- desks, students ----
    ROWS.forEach((row, ri) => {
      PX.par(g, c, 0.88 + ri * 0.04, () => {
        const s = row.s, seats = SEATS.filter((q) => q.ri === ri);
        for (const side of [-1, 1]) {
          const xs = seats.filter((q) => q.side === side).map((q) => q.x), a = Math.round(10 * s + 2);
          const x0 = side < 0 ? Math.min(...xs) - 20 * s : 320 + a, x1 = side < 0 ? 320 - a : Math.max(...xs) + 20 * s;
          const top = Math.round(row.y - 10 * s), fr = Math.max(3, Math.round(5 * s));
          R(g, x0, top, x1 - x0, row.y - top, mix("#7a5a40", "#4e3e3e", dusk * 0.6)); R(g, x0, top, x1 - x0, 1, mix("#a07a58", "#6a5a5a", dusk * 0.6));
          R(g, x0, row.y, x1 - x0, fr, mix("#4a3428", "#2e2430", dusk * 0.6)); R(g, x0, row.y, x1 - x0, 1, mix("#c09068", "#7a6a6a", dusk * 0.4));
          R(g, x0 + 2, row.y + fr, Math.max(2, Math.round(3 * s)), Math.round(14 * s), "#1e1820"); R(g, x1 - 2 - Math.round(3 * s), row.y + fr, Math.max(2, Math.round(3 * s)), Math.round(14 * s), "#1e1820");
        }
        for (const q of seats) {
          const ss = st.seat(q);
          if (ss.lamp !== undefined) deskLamp(g, q.x + Math.round(17 * s), q.y - Math.round(4 * s), s, ss.lamp);
          if (ss.paper) paper(g, q.x + Math.round(15 * s), q.y + Math.round(1 * s), s, ss.paper, t, q.a.ph);
          if (!ss.noLaptop) laptop(g, q.x + Math.round(6 * s), q.y, s, t, q.a.ph, { closed: ss.closed, tint: ss.helper > 0.5, fast: ss.helper > 0.5, ga: 0.35 + 0.4 * dusk });
          backStudent(g, q.x, q.y, s, q.a, t, { rim: mix("#ffc890", lt > 0.5 ? "#ffe8c0" : "#8a90c0", dusk), typing: ss.typing, writing: ss.writing, arms: ss.arms,
            bob: Math.round(Math.sin(t * 1.7 + q.a.ph * 6) * 0.6) });
          R(g, q.x - Math.round(10 * s), q.y + Math.round(6 * s), Math.round(20 * s), Math.round(10 * s), "#23262e"); R(g, q.x - Math.round(10 * s), q.y + Math.round(6 * s), Math.round(20 * s), 1, "#3e4350");
          if (ss.sweat) LB.sweat(g, q.x, q.y - Math.round(18 * s), t + q.a.ph * 3, 1, 7 + q.ord);
          if (ss.flash > 0) LB.star4(g, q.x, q.y - Math.round(26 * s), Math.round(2 + 2 * ss.flash), "#fff6c0");
          if (ss.helper > 0 || ss.sq !== undefined) {
            const hy = q.y - Math.round(19 * s) + Math.round(Math.sin(t * 2.4 + q.a.ph * 6) * 1.5 * s), hw = Math.round(11 * s * Math.max(0.01, ss.helper === undefined ? 1 : ss.helper));
            if (hw >= 3) agent(g, q.x - Math.round(15 * s), hy, Math.max(6, hw), t, { eyes: ss.eyes || "on", sq: ss.sq, ph: q.a.ph * 3, ga: 0.5 });
            if (ss.offTxt) PX.otext(g, "OFF", q.x - Math.round(15 * s), hy - Math.round(14 * s) - 4, { font: "v", size: ri >= 2 ? 12 : 10, col: "#ff5c5c", align: "center" });
          }
        }
      });
    });
  };

  // ================= classroom52: evening training room, 52 juniors, split AI vs by hand =================
  K.classroom52 = (o) => (g, t, d, c) => {
    const count = T(o, "count", 0.8, d, 11), split = T(o, "split", 7.0, d, 11), lights = T(o, "lights", 3.2, d, 11);
    const lt = t < lights ? 0 : t < lights + 0.45 ? (PX.blink(t, 0.11, 0.5) ? 1 : 0.15) : 1;
    const spk = PX.p(t, split, 0.7, "out");
    trainRoom(g, t, c, {
      dusk: cl(t / (d * 0.9), 0, 1), lights: lt, split: t >= split ? spk : 0, tint: PX.p(t, split + 0.4, 1.0, "io"),
      board: (g2) => {
        PX.text(g2, PX.typed("NEW PYTHON LIBRARY", t, -0.6, 22), 320, 52, { size: 8, col: "#c4d4c0", align: "center" });
        R(g2, 248, 63, Math.round(144 * PX.p(t, 0.3, 0.4)), 1, "#c8d4c4");
        PX.text(g2, "import ???", 210, 72, { font: "v", size: 14, col: "#cfe0cc" });
        PX.text(g2, "x = lib.load()", 210, 86, { font: "v", size: 14, col: "#b8ccb4" });
        PX.text(g2, "x.run( ? )", 210, 100, { font: "v", size: 14, col: "#b8ccb4" });
        PX.line(g2, 300, 92, 330, 92, "#a8bca4"); PX.line(g2, 327, 89, 330, 92, "#a8bca4"); PX.line(g2, 327, 95, 330, 92, "#a8bca4");
        R(g2, 336, 84, 26, 16, "#2a4a40"); PX.box(g2, 336, 84, 26, 16, "#b8ccb4"); PX.text(g2, "?", 349, 87, { size: 8, col: "#f7c948", align: "center" });
        if (t >= count) {
          const k = PX.p(t, count, 0.45, "back"), fl = t - count < 0.15;
          PX.zoom(g2, Math.max(0.05, k), 404, 106, () => {
            PX.text(g2, "52", 404, 95, { size: 24, col: fl ? "#ffffff" : "#f7c948", align: "center" });
          });
          const ek = PX.p(t, count + 0.3, 0.6, "io"), n = Math.floor(ek * 40);
          for (let i = 0; i < n; i++) { const a = (i / 40) * 6.283 - 1.2; R(g2, 404 + Math.cos(a) * 34, 106 + Math.sin(a) * 18, 2, 1, "#f7c948"); }
          if (t - count < 0.6) PX.glow(g2, 404, 106, 50, "rgba(247,201,72,0.8)", 1 - (t - count) / 0.6);
        }
      },
      seat: (q) => {
        const out = { typing: ((q.ord * 7) % 3) !== 0 };
        const fk = t - (count + 0.25 + q.ord * 0.024); if (fk > 0 && fk < 0.3) out.flash = 1 - fk / 0.3;
        if (q.ord === 31 && t > 4.4 * d / 11 && t < 5.6 * d / 11) out.arms = "up";
        if (q.ord === 12 && t > 5.6 * d / 11 && t < 6.8 * d / 11) out.arms = "hand";
        if (t >= split) {
          const dl = split + 0.45 + (q.ord % 26) * 0.035, k = PX.p(t, dl, 0.35, "back");
          if (q.side < 0) { out.helper = k; out.eyes = t - dl < 0.5 ? "happy" : "on"; out.typing = true; }
          else { out.lamp = t < dl ? 0 : t < dl + 0.12 ? 0.4 : 1; out.writing = true; out.typing = false; out.paper = k > 0.5 ? 2 : 0; }
        }
        return out;
      },
    });
    // paper plane sight-gag drifting over the rows
    const pp = (t - 2.0 * d / 11) / (1.6 * d / 11);
    if (pp > 0 && pp < 1) { const px = lerp(560, 120, pp), py = lerp(250, 190, pp) - Math.sin(pp * 3.14) * 30;
      PX.sprite(g, ["w.....", "www...", "wwwww.", "ddwwww", "dd...."], px, py, { w: "#eae4d4", d: "#a8a090" }, 1, true); }
    // the labels
    if (t >= split) {
      const k = PX.p(t, split + 0.6, 0.55, "lin");
      hangSign(g, 160, 152, 124, 18, k, t, "AI ASSISTANT", "#5fe3e8");
      hangSign(g, 480, 152, 96, 18, PX.p(t, split + 0.8, 0.55, "lin"), t, "BY HAND", "#ffcf8a");
    }
    PX.particles(g, 17, 30, t, [0, 150, 640, 200], { vy: -2, vx: 1.5, col: "#ffe2b0", a: 0.45 });
    PX.vignette(g, 0.5);
  };

  // ================= quiz: same room, exam, AI helpers switched off =================
  K.quiz = (o) => (g, t, d, c) => {
    const flip = T(o, "flip", 0.3, d, 3.5), off = T(o, "off", 0.8, d, 3.5), sweat = T(o, "sweat", 1.5, d, 3.5);
    trainRoom(g, t, c, {
      dusk: 1, lights: 1, split: 1, tint: 0.6, clockR: 13, clockT: Math.floor(t * 2) * 6 + 40,
      board: (g2) => {
        PX.text(g2, "QUIZ", 220, 58, { size: 24, col: "#d8e4d4" });
        R(g2, 322, 68, 12, 3, "#d8e4d4");
        PX.text(g2, "NO AI", 342, 62, { size: 16, col: "#ff8a7a" });
        R(g2, 236, 90, 176, 1, "#c8d4c4");
        // crossed robot doodle
        const pul = PX.blink(t, 0.6, 0.5) ? "#ff8a7a" : "#e06a5a";
        PX.box(g2, 300, 100, 22, 18, "#cfe0cc"); R(g2, 305, 106, 3, 3, "#cfe0cc"); R(g2, 314, 106, 3, 3, "#cfe0cc"); R(g2, 310, 96, 1, 4, "#cfe0cc");
        PX.circle(g2, 311, 109, 16, pul); PX.circle(g2, 311, 109, 14, "#22403a"); PX.box(g2, 300, 100, 22, 18, "#cfe0cc"); R(g2, 305, 106, 3, 3, "#cfe0cc"); R(g2, 314, 106, 3, 3, "#cfe0cc");
        PX.line(g2, 300, 98, 322, 120, pul); PX.line(g2, 301, 98, 323, 120, pul);
        PX.text(g2, "PENCILS ONLY", 232, 126, { font: "v", size: 12, col: "#b8ccb4" });
      },
      seat: (q) => {
        const out = { noLaptop: true, paper: t >= flip + q.ord * 0.012 ? 2 : 1 };
        if (q.side < 0) {
          const dl = off + (q.ord % 26) * 0.03, k = (t - dl) / 0.18;
          if (k < 0) { out.helper = 1; out.eyes = "on"; }
          else if (k < 1) { out.helper = 1; out.sq = 1 - k * 0.92; out.eyes = "on"; }
          else { out.helper = 1; out.sq = 1; out.eyes = "off"; out.offTxt = q.ri >= 2 && t - dl < 2.2 ? PX.blink(t - dl, 0.5, 0.7) : false; }
          out.sweat = t > sweat + (q.ord % 5) * 0.1; out.writing = false;
        } else out.writing = t > flip + 0.3;
        return out;
      },
    });
    // clock tick sparks
    if (frac(t * 2) < 0.2) PX.par(g, c, 0.6, () => { R(g, 476, 64, 3, 1, "#e8e0c8"); R(g, 476, 79, 3, 1, "#e8e0c8"); R(g, 449, 64, 3, 1, "#e8e0c8"); });
    PX.particles(g, 19, 22, t, [0, 150, 640, 200], { vy: -2, vx: 1.5, col: "#ffe2b0", a: 0.35 });
    PX.vignette(g, 0.55);
  };

  // ---------- side-view runner (~54 px), facing right. (x, y) = feet ground point, ph = run-cycle phase (rad), o.run = 0..1 ----------
  const runner = (SK.runner = (g, x, y, ph, o) => LB.outlined(g, (b) => {
    const run = o.run === undefined ? 1 : o.run, shirt = o.shirt, sd = sh(shirt, 0.68), sl = sh(shirt, 1.3), skin = o.skin, pants = o.pants || "#2a3046", pd = sh(pants, 0.7);
    const bounce = Math.round(-Math.abs(Math.sin(ph)) * 2 * run) + (o.bob || 0);
    const hip = [x, y - 24 + bounce], neck = [x + Math.round(4 * run) + 1, y - 42 + bounce];
    const leg = (p, col, dk) => {
      const a = Math.sin(p) * run, th = a * 0.85, bend = 0.15 + Math.max(0, -Math.cos(p)) * 1.3 * run;
      const kx = hip[0] + Math.sin(th) * 11, ky = hip[1] + Math.cos(th) * 11, fx = kx + Math.sin(th - bend) * 11, fy = Math.min(y - 1, ky + Math.cos(th - bend) * 11);
      limb(b, hip[0], hip[1], kx, ky, 4, col, dk); limb(b, kx, ky, fx, fy, 4, col, dk);
      R(b, fx - 2, fy - 1, 7, 3, "#1c1c26"); R(b, fx - 2, fy - 1, 7, 1, "#5a5a6a");
    };
    const arm = (p, col, dk) => { const a = -Math.sin(p) * 0.9 * run, ex = neck[0] + Math.sin(a) * 8, ey = neck[1] + 3 + Math.cos(a) * 8, hx = ex + Math.sin(a + 1.4) * 7, hy = ey + Math.cos(a + 1.4) * 7;
      limb(b, neck[0], neck[1] + 3, ex, ey, 4, col, dk); limb(b, ex, ey, hx, hy, 3, col, dk); R(b, hx - 1, hy - 1, 3, 3, skin); };
    leg(ph + Math.PI, pd, sh(pants, 0.5)); arm(ph, sd, sh(shirt, 0.5));
    limb(b, hip[0], hip[1] - 2, neck[0], neck[1] + 4, 10, shirt, sd); R(b, neck[0] - 3, neck[1] + 1, 6, 2, sl);
    leg(ph, pants, pd);
    // laptop held like a tray, screen towards the runner
    const lx = neck[0] + 4, ly = neck[1] + 12;
    limb(b, neck[0], neck[1] + 3, lx, ly, 4, shirt, sd);
    R(b, lx - 2, ly, 14, 2, "#7a8090"); R(b, lx - 2, ly, 14, 1, "#a8b0c0"); R(b, lx + 9, ly - 9, 2, 10, "#565c6c"); R(b, lx + 8, ly - 8, 1, 8, o.screen || "#5fe3e8");
    R(b, lx + 1, ly - 1, 3, 3, skin);
    // head
    const hx = neck[0] - 5, hy = neck[1] - 13;
    R(b, neck[0] - 1, neck[1] - 2, 4, 3, sh(skin, 0.8));
    R(b, hx + 1, hy, 10, 13, skin); R(b, hx, hy + 1, 12, 11, skin); R(b, hx + 11, hy + 3, 1, 7, sh(skin, 1.15)); R(b, hx + 12, hy + 6, 1, 2, skin);
    R(b, hx, hy - 1, 11, 5, o.hair); R(b, hx - 1, hy, 4, 9, o.hair); R(b, hx + 1, hy - 2, 8, 1, o.hair); R(b, hx + 3, hy - 2, 5, 1, sh(o.hair, 1.5));
    if (o.spiky) { R(b, hx + 2, hy - 3, 2, 2, o.hair); R(b, hx + 6, hy - 4, 2, 3, o.hair); R(b, hx - 2, hy - 1, 2, 2, o.hair); }
    R(b, hx + 3, hy + 6, 2, 2, sh(skin, 0.85)); // ear
    const f = o.face || "focus";
    if (f === "happy") { R(b, hx + 8, hy + 5, 2, 1, "#1a1016"); R(b, hx + 8, hy + 9, 3, 1, "#1a1016"); R(b, hx + 7, hy + 8, 1, 1, "#1a1016"); }
    else { R(b, hx + 8, hy + 5, 2, 2, "#1a1016"); R(b, hx + 7, hy + 3, 4, 1, sh(o.hair, 0.8)); R(b, hx + 8, hy + 9, f === "puff" ? 3 : 2, f === "puff" ? 2 : 1, "#1a1016"); }
    if (o.phones) { R(b, hx + 1, neck[1] - 1, 9, 2, "#2a2c36"); R(b, hx + 7, neck[1] - 2, 3, 4, "#3a3e4a"); }
  }));

  // ================= finish_race: stadium track at night, AI finishes a hair sooner =================
  K.finish_race = (o) => {
    const crowdR = PX.rnd(77), CROWD = [];
    for (let r = 0; r < 7; r++) for (let x = -30; x < 680; x += 7) CROWD.push([x + Math.floor(crowdR() * 3), 82 + r * 13, HOODS[Math.floor(crowdR() * HOODS.length)], SKINS[Math.floor(crowdR() * SKINS.length)], crowdR(), r]);
    return (g, t, d, c) => {
      const meh = T(o, "meh", 3.0, d, 5), tA = T(o, "ai", 1.5, d, 5), tH = T(o, "hand", 1.85, d, 5), FX = 430;
      const pos = (x0, tf) => { const v = (FX - x0) / tf, D = 0.9; if (t < tf) return [x0 + v * t, 1]; const u = Math.min(t - tf, D); return [FX + v * u - (v * u * u) / (2 * D), 1 - u / D]; };
      const [ax, arun] = pos(150, tA), [hx, hrun] = pos(140, tH);
      // ---- sky + light towers ----
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -40, -20, 720, 110, "0c0f24", "232650", 8);
        PX.particles(g, 3, 40, t, [-40, -20, 720, 60], { vy: 0, vx: 0, col: "#ffffff", a: 0.6, tw: 1.3 });
        for (const lx of [36, 604]) {
          R(g, lx - 2, 18, 5, 90, "#2a2e40"); R(g, lx - 2, 18, 1, 90, "#4a5068");
          R(g, lx - 16, 6, 33, 16, "#1c1f2c"); for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) R(g, lx - 14 + i * 8, 8 + j * 7, 6, 5, "#fff4d8");
          PX.glow(g, lx, 14, 90, "rgba(255,244,216,0.9)", 0.75);
          LB.cone(g, lx + (lx < 320 ? 30 : -30), 22, 30, 220, 300, "#fff0d0", 0.07);
        }
      });
      // ---- stands + crowd + jumbotron ----
      PX.par(g, c, 0.45, () => {
        R(g, -40, 74, 720, 106, "#1a1c30");
        for (let r = 0; r < 8; r++) { R(g, -40, 80 + r * 13, 720, 1, "#262a44"); R(g, -40, 90 + r * 13, 720, 2, "#14162a"); }
        const cheer = t > tA ? 1 : 0.3, wave = (t - 3.4) * 260;
        for (const [x, y, col, sk, ph, r] of CROWD) {
          const near = Math.abs(x - wave) < 40 ? Math.round(-4 * Math.cos(((x - wave) / 40) * 1.57)) : 0;
          const j = Math.round(Math.max(0, Math.sin(t * (6 + ph * 5) + ph * 30)) * 2 * cheer) + near;
          R(g, x, y - j, 5, 5, sh(col, 0.75 + r * 0.03)); R(g, x + 1, y - 4 - j, 3, 3, sh(sk, 0.7 + r * 0.04));
          if (ph > 0.93 && t > tA) { R(g, x + 1, y - 9 - j, 1, 5, "#c8c0b0"); R(g, x - 1, y - 12 - j, 5, 3, ph > 0.965 ? "#5fe3e8" : "#ffcf8a"); }
        }
        const fr = PX.rnd(Math.floor(t * 8) + 5);
        for (let i = 0; i < 4; i++) { const fx = fr() * 680 - 20, fy = 80 + fr() * 85; if (fr() < 0.6) { R(g, fx, fy, 2, 2, "#ffffff"); PX.glow(g, fx, fy, 8, "rgba(255,255,255,0.9)", 0.8); } }
        // jumbotron
        const JX = 236, JY = 14, JW = 168, JH = 60;
        R(g, JX + 30, JY + JH, 6, 14, "#22253a"); R(g, JX + JW - 36, JY + JH, 6, 14, "#22253a");
        R(g, JX - 5, JY - 5, JW + 10, JH + 10, "#1c1f2e"); R(g, JX - 5, JY - 5, JW + 10, 1, "#4a4f66"); R(g, JX, JY, JW, JH, "#0a1018");
        for (let y = JY; y < JY + JH; y += 2) R(g, JX, y, JW, 1, "rgba(255,255,255,0.03)");
        if (t < tA - 0.05) {
          PX.text(g, "LIVE", JX + 8, JY + 6, { size: 8, col: PX.blink(t, 0.8) ? "#ff5c5c" : "#7a2a2a" });
          PX.text(g, "FINAL STRETCH", JX + JW / 2, JY + 26, { font: "v", size: 16, col: "#c9d1d9", align: "center" });
          R(g, JX + 14, JY + 46, JW - 28, 3, "#1e2a38"); R(g, JX + 14, JY + 46, (JW - 28) * cl(t / tA, 0, 1), 3, "#5fe3e8");
        } else if (t < tH + 0.35) {
          PX.glow(g, JX + JW / 2, JY + JH / 2, 90, "rgba(255,255,255,0.8)", PX.blink(t, 0.12) ? 0.5 : 0.2);
          PX.text(g, "PHOTO FINISH", JX + JW / 2, JY + 24, { size: 8, col: "#ffffff", align: "center" });
        } else {
          const k = PX.p(t, tH + 0.35, 0.35, "back");
          PX.zoom(g, Math.max(0.05, k), JX + JW / 2, JY + JH / 2, () => {
            PX.text(g, "~2 MIN", JX + JW / 2, JY + 10, { size: 16, col: "#5fe3e8", align: "center" });
            PX.text(g, "SOONER", JX + JW / 2, JY + 32, { size: 16, col: "#5fe3e8", align: "center" });
          });
          PX.glow(g, JX + JW / 2, JY + JH / 2, 80, "rgba(95,227,232,0.6)", 0.5);
          agent(g, JX + 16, JY + 48, 12, t, { ga: 0.3 }); agent(g, JX + JW - 16, JY + 48, 12, t, { ga: 0.3 });
        }
      });
      // ---- ad boards (mid) ----
      PX.par(g, c, 0.7, () => {
        const ADS = ["#2a4a8a", "#8a2a4a", "#2a6a4a", "#6a4a8a"];
        for (let i = 0; i < 12; i++) { const bx = -40 + i * 64, col = ADS[i % 4]; R(g, bx, 168, 62, 20, col); R(g, bx, 168, 62, 1, sh(col, 1.5));
          const sx = (((t * 30 + i * 20) % 62) + 62) % 62; R(g, bx + 6, 175, 50, 2, sh(col, 1.35)); R(g, bx + sx, 172, 6, 12, "rgba(255,255,255,0.12)"); }
        R(g, -40, 188, 720, 3, "#e8e0d0"); R(g, -40, 191, 720, 2, "#8a8478");
      });
      // ---- track ----
      R(g, -40, 193, 720, 145, "#8a3e36");
      const tr = PX.rnd(9); for (let i = 0; i < 260; i++) R(g, tr() * 680 - 20, 193 + tr() * 145, 1, 1, tr() < 0.5 ? "#9a4a3e" : "#76322a");
      for (const ly of [196, 231, 266, 301, 334]) { R(g, -40, ly, 720, ly % 35 === 21 ? 2 : 1, "#d8c8bc"); R(g, -40, ly + 2, 720, 1, "#6a2e26"); }
      for (let i = 0; i < 4; i++) { const yy = 211 + i * 35; R(g, 70, yy, 10, 2, "#c8b8ac"); R(g, 78, yy - 2, 2, 6, "#c8b8ac"); R(g, 80, yy - 1, 1, 4, "#c8b8ac"); }
      PX.glow(g, 120, 250, 200, "rgba(255,240,210,0.35)", 0.5); PX.glow(g, 540, 250, 200, "rgba(255,240,210,0.35)", 0.5);
      // finish line + post + banner
      for (let y = 196; y < 336; y += 4) { R(g, FX - 3, y, 3, 2, "#f0f0f0"); R(g, FX, y + 2, 3, 2, "#f0f0f0"); R(g, FX - 3, y + 2, 3, 2, "#1a1a1a"); R(g, FX, y, 3, 2, "#1a1a1a"); }
      R(g, FX - 2, 130, 4, 66, "#c8c8d0"); R(g, FX - 2, 130, 1, 66, "#ffffff");
      R(g, FX - 40, 124, 80, 16, "#c0392b"); R(g, FX - 40, 124, 80, 1, "#ff7a6a"); R(g, FX - 40, 139, 80, 1, "#7a1a12");
      PX.text(g, "FINISH", FX, 128, { size: 8, col: "#fff4e0", align: "center" });
      // runners (AI in the far lane)
      const ph = (x) => x * 0.075, done = (tf) => t > tf + 0.9;
      ell(g, ax + 2, 238, 9, 2, "rgba(0,0,0,0.35)"); ell(g, hx + 2, 306, 9, 2, "rgba(0,0,0,0.35)");
      runner(g, Math.round(ax), 238, ph(ax), { run: arun, shirt: "#3a6ab0", skin: "#f2c9a0", hair: "#c8a060", face: done(tA) ? "happy" : "focus", bob: done(tA) ? Math.round(Math.sin(t * 5)) : 0 });
      agent(g, ax + 10, 168 + Math.round(Math.sin(t * 5) * 2), 14, t, { eyes: t > tA ? "happy" : "on" });
      runner(g, Math.round(hx), 306, ph(hx), { run: hrun, shirt: "#3f9a55", skin: "#a86b3c", hair: "#1a120c", spiky: 1, phones: 1, screen: "#ffcf8a", face: done(tH) ? "puff" : "focus", bob: done(tH) ? Math.round(Math.sin(t * 7)) : 0 });
      if (done(tH)) LB.sweat(g, hx + 4, 262, t, 2, 3);
      // name tags
      if (t < tH + 1.0) {
        PX.otext(g, "AI", ax - 14, 186, { size: 8, col: "#5fe3e8", align: "center" });
        PX.otext(g, "BY HAND", hx, 236, { size: 8, col: "#ffcf8a", align: "center" });
      }
      // crossing flashes + confetti
      for (const tf of [tA, tH]) if (t > tf && t < tf + 0.25) PX.glow(g, FX, 260, 160, "rgba(255,255,255,0.9)", (1 - (t - tf) / 0.25) * 0.6);
      if (t > tA) { const r = PX.rnd(41), k = t - tA; for (let i = 0; i < 40; i++) { const vx = (r() - 0.5) * 120, vy = -40 - r() * 90, x = FX + vx * k, y = 140 + vy * k + 70 * k * k, col = ["#f7c948", "#f25ca8", "#5fe3e8", "#3df56b"][i % 4];
        if (y < 340 && k < 3.5) R(g, x, y, PX.blink(t + i * 0.1, 0.3) ? 2 : 1, 2, col); } }
      // ---- foreground: infield grass + referee ----
      R(g, -40, 337, 720, 30, "#1e4428"); for (let x = -40; x < 680; x += 6) R(g, x + ((x / 6) % 2) * 2, 337, 2, 2, "#2a5a34"); R(g, -40, 337, 720, 1, "#3a7a44");
      // TV camera on a tripod (left foreground), red tally light
      PX.par(g, c, 1.1, () => {
        const cx = 70, cy = 300; PX.line(g, cx, cy + 10, cx - 18, 366, "#2a2c36"); PX.line(g, cx + 1, cy + 10, cx + 16, 366, "#2a2c36"); PX.line(g, cx, cy + 10, cx, 366, "#22242c");
        R(g, cx - 22, cy - 12, 40, 22, "#2e3240"); R(g, cx - 22, cy - 12, 40, 1, "#5a6070"); R(g, cx - 22, cy - 12, 1, 22, "#4a5060"); R(g, cx + 18, cy - 8, 14, 12, "#1e2028"); R(g, cx + 30, cy - 9, 4, 14, "#3a3e4a");
        PX.circle(g, cx + 32, cy - 2, 4, "#5a7aa0"); R(g, cx + 31, cy - 4, 2, 2, "#c0e0ff"); R(g, cx - 16, cy - 18, 20, 6, "#22242c");
        const tl = PX.blink(t, 1, 0.7); R(g, cx - 18, cy - 8, 3, 3, tl ? "#ff4a4a" : "#5a1a1a"); if (tl) PX.glow(g, cx - 17, cy - 7, 10, "rgba(255,70,70,0.9)", 0.7);
        R(g, cx - 40, cy - 20, 16, 20, "#14161e"); ell(g, cx - 32, cy - 26, 7, 7, "#14161e"); R(g, cx - 38, cy - 30, 12, 4, "#1c1e28"); R(g, cx - 40, cy, 18, 66, "#14161e");
      });
      const shrug = t >= meh, sk = PX.p(t, meh, 0.3, "back");
      const rx = 360, ry = 366;
      const p = LB.person(g, rx, ry, { h: 88, skin: "#d9a066", hair: "#4a3020", shirt: "#e4e2da", pants: "#1e1e26", lit: -1, look: shrug ? 0 : 2,
        face: shrug ? "closed" : "neutral", bob: Math.round(Math.sin(t * 1.8) * 0.6),
        al: shrug ? [[-10, lerp(14, 2, sk)], [-22, lerp(20, -10, sk)]] : [-3, 22], ar: shrug ? [[10, lerp(14, 2, sk)], [22, lerp(20, -10, sk)]] : [[8, 10], [12, 0]] });
      for (let x = p.hx - p.tw / 2 + 3; x < p.hx + p.tw / 2 - 3; x += 4) R(g, x, p.ty + 2, 2, Math.round(88 * 0.28) - 4, "#24242c");
      R(g, p.hx - p.hw / 2 - 1, p.hy - 2, p.hw + 2, 5, "#1a1a22"); R(g, p.hx, p.hy + 2, p.hw / 2 + 4, 2, "#1a1a22"); R(g, p.hx - p.hw / 2, p.hy - 2, p.hw, 1, "#3a3a48");
      R(g, p.hx - 1, p.ty + 5, 3, 3, "#c8c8d0"); R(g, p.hx, p.ty, 1, 5, "#c8c8d0");   // whistle
      if (!shrug) { R(g, p.hr[0] - 3, p.hr[1] - 8, 7, 7, "#c8c8d0"); R(g, p.hr[0] - 2, p.hr[1] - 7, 5, 5, "#1a2a2a"); R(g, p.hr[0], p.hr[1] - 6, 1, 2, "#3df56b"); }
      if (shrug) {
        const bk = PX.p(t, meh + 0.15, 0.3, "back"), bx = 360, by = 236;
        PX.zoom(g, Math.max(0.05, bk), bx, by + 18, () => {
          R(g, bx - 74, by, 148, 36, "#0e1018"); R(g, bx - 73, by + 1, 146, 34, "#f4f0e4"); R(g, bx - 73, by + 1, 146, 1, "#ffffff"); R(g, bx - 73, by + 33, 146, 2, "#c8c0b0");
          for (let i = 0; i < 6; i++) R(g, bx - 3 + i, by + 36 + i, 6 - i, 1, "#f4f0e4");
          PX.text(g, "TOO SMALL TO", bx, by + 6, { size: 8, col: "#2a2030", align: "center" });
          PX.text(g, "MEAN ANYTHING", bx, by + 20, { size: 8, col: "#2a2030", align: "center" });
        });
        if (t - meh < 0.6) for (const s of [-1, 1]) { R(g, rx + s * 34, 300 - (t - meh) * 20, 1, 4, "#e8e0d0"); R(g, rx + s * 30, 296 - (t - meh) * 20, 1, 3, "#e8e0d0"); }
      }
      PX.vignette(g, 0.5);
    };
  };

  // ================= quiz_scores: game-show stage, two podium scoreboards =================
  K.quiz_scores = (o) => (g, t, d, c) => {
    const hand = T(o, "hand", 0.6, d, 6.5), ai = T(o, "ai", 2.0, d, 6.5), dbg = o.debug === undefined ? null : o.debug;
    const hk = PX.p(t, hand, 1.1, "out"), ak = PX.p(t, ai, 1.1, "out"), hDone = t >= hand + 1.1, aDone = t >= ai + 1.1;
    // ---- backdrop ----
    PX.par(g, c, 0.4, () => {
      PX.vgrad(g, -40, -20, 720, 280, "1a1240", "2a1a50", 8);
      for (let i = 0; i < 14; i++) { const x = -20 + i * 50; R(g, x, 0, 10, 250, "#22184c"); R(g, x + 4, 0, 2, 250, PX.blink(t + i * 0.15, 1.4, 0.5) ? "#3a2a7a" : "#2c2060"); }
      const rx = 150, ry = 120;
      for (let i = 0; i <= 40; i++) { const a = Math.PI + (i / 40) * Math.PI, x = 320 + Math.cos(a) * rx, y = 150 + Math.sin(a) * ry;
        const on = (i + Math.floor(t * (hDone ? 14 : 6))) % 3 === 0; R(g, x - 1, y - 1, 3, 3, on ? "#ffe08a" : "#6a5030"); if (on) PX.glow(g, x, y, 6, "rgba(255,224,138,0.9)", 0.6); }
      PX.circle(g, 320, 104, 34, "#2a1c58"); PX.circle(g, 320, 104, 30, "#1c1440");
      const qa = PX.blink(t, 2.3, 0.94) ? 1 : 0.45; PX.text(g, "?", 320, 88, { size: 32, col: qa > 0.5 ? "#f25ca8" : "#8a3a6a", align: "center" }); PX.glow(g, 320, 104, 50, "rgba(242,92,168,0.8)", 0.4 * qa);
    });
    // ---- curtains ----
    PX.par(g, c, 0.6, () => {
      for (const side of [-1, 1]) for (let i = 0; i < 8; i++) { const x = side < 0 ? -40 + i * 11 : 670 - i * 11 - 12, w = 12, sway = Math.round(Math.sin(t * 0.8 + i) * 1);
        R(g, x + sway, -10, w, 290, i % 2 ? "#7a1a2a" : "#9a2a3a"); R(g, x + sway + 2, -10, 2, 290, i % 2 ? "#9a2a3a" : "#c04050"); R(g, x + sway + w - 2, -10, 2, 290, "#5a1020"); }
      R(g, -40, -10, 720, 16, "#7a1a2a"); for (let x = -40; x < 680; x += 16) PX.circle(g, x + 8, 6, 8, "#9a2a3a"); R(g, -40, 13, 720, 2, "#f7c948");
    });
    // ---- stage floor ----
    PX.vgrad(g, -40, 250, 720, 60, "2a2048", "120e24", 5);
    for (let x = -40; x < 700; x += 40) PX.line(g, 320 + (x - 320) * 0.6, 250, x, 310, "#1e1838");
    for (let y = 262; y < 306; y += 2) { const a = 0.16 * (1 - (y - 262) / 44); PX.alpha(g, a, () => { R(g, 140 + ((y / 2) % 2) * 2, y, 60, 1, "#5fe3e8"); R(g, 440 + ((y / 2) % 2) * 2, y, 60, 1, "#ffcf8a"); }); }   // floor reflections
    R(g, -40, 308, 720, 6, "#3a2a5a"); R(g, -40, 308, 720, 1, "#6a5a9a");
    for (let x = -36; x < 680; x += 14) { const on = (x / 14 + Math.floor(t * 8)) % 4 === 0; R(g, x, 310, 3, 2, on ? "#ffe08a" : "#6a5030"); }
    R(g, -40, 314, 720, 50, "#0c0a18");
    // ---- spotlights ----
    const hs = hDone ? 1 : 0.55, as = aDone ? 0.3 : 0.55;
    LB.cone(g, 470, -4, 10, 150, 300, "#fff0c8", 0.22 * hs); LB.cone(g, 170, -4, 10, 150, 300, "#d0f4ff", 0.22 * as);
    // ---- podiums with contestants ----
    const podium = (cx, name, val, k, done, col, dim, who) => {
      const t0 = who === "hand" ? hand : ai;
      const face = who === "hand" ? (done ? "happy" : "focus") : aDone ? "sweat" : hDone ? "sad" : "focus";
      const p = who === "hand" ? SK.dev(g, cx, 214, { h: 84, face, noLegs: true, bob: done ? Math.round(Math.abs(Math.sin(t * 6)) * -2) : 0, ar: done ? [[12, -10], [16, -26]] : [6, 16], al: [-6, 16] })
        : LB.person(g, cx, 214, { h: 84, skin: "#f2c9a0", hair: "#c8a060", hairStyle: "long", shirt: "#3a6ab0", face, noLegs: true, al: [-6, 16], ar: [6, 16] });
      if (who === "ai") agent(g, cx + 38, 128 + Math.round(Math.sin(t * 2.5) * 2), 20, t, { eyes: aDone ? "wide" : "on", ga: 0.4 });
      if (who === "hand") { R(g, p.hx + p.hw / 2 - 1, p.hy + 2, 8, 2, "#f7c948"); R(g, p.hx + p.hw / 2 + 6, p.hy + 2, 2, 2, "#e07a8a"); }   // pencil behind the ear
      if (who === "ai" && aDone) LB.sweat(g, cx, p.hy + 6, t, 2, 9);
      const x = cx - 58, y = 196, w = 116, h = 64;
      R(g, x - 4, y - 6, w + 8, 8, "#3a3060"); R(g, x - 4, y - 6, w + 8, 1, "#8a7ac0");
      R(g, x, y + 2, w, h, "#241c44"); R(g, x, y + 2, 3, h, "#3a2e66"); R(g, x + w - 3, y + 2, 3, h, "#16102c");
      for (let i = 0; i < 10; i++) { const on = (i + Math.floor(t * 6)) % 2 === 0; R(g, x + 6 + i * 11, y + h - 4, 5, 2, on && !dim ? col : sh(col, 0.4)); }
      R(g, x + 10, y + 6, w - 20, 12, "#120e22"); PX.text(g, name, cx, y + 8, { size: 8, col: dim ? sh(col, 0.75) : col, align: "center" });
      R(g, x + 10, y + 22, w - 20, 30, "#060810"); PX.box(g, x + 10, y + 22, w - 20, 30, sh(col, 0.5));
      for (let yy = y + 23; yy < y + 51; yy += 2) R(g, x + 11, yy, w - 22, 1, "rgba(255,255,255,0.03)");
      const n = Math.round(val * k), flash = done && t - t0 - 1.1 < 0.5 && PX.blink(t, 0.12);
      if (t >= t0) {
        PX.text(g, n + "%", cx, y + 26, { size: 24, col: flash ? "#ffffff" : dim ? sh(col, 0.7) : col, align: "center" });
        PX.glow(g, cx, y + 37, 50, dim ? "rgba(120,200,220,0.4)" : who === "hand" ? "rgba(247,201,72,0.7)" : "rgba(95,227,232,0.6)", done && !dim ? 0.55 : 0.3);
      } else PX.text(g, "--", cx, y + 26, { size: 24, col: "#1a2030", align: "center" });
    };
    podium(170, "AI", 50, ak, aDone, "#5fe3e8", aDone, "ai");
    podium(470, "BY HAND", 67, hk, hDone, "#f7c948", false, "hand");
    // ---- confetti for 67% ----
    if (t > hand + 1.0) { const k = t - hand - 1.0, r = PX.rnd(13);
      for (let i = 0; i < 70; i++) { const x0 = 380 + r() * 190, sp = 30 + r() * 40, ofs = r() * 40, y = -10 + ((ofs + sp * k) % 330), x = x0 + Math.sin(t * 3 + i) * 6, col = ["#f7c948", "#f25ca8", "#3df56b", "#ffffff", "#ff9a5a"][i % 5];
        if (k * sp > ofs) R(g, x, y, PX.blink(t + i * 0.13, 0.25) ? 2 : 1, 2, col); } }
    // ---- category board (option o.debug) ----
    if (dbg !== null && t >= dbg) {
      const k = PX.p(t, dbg, 0.55, "back"), bx = 226, bw = 188, by = Math.round(lerp(-150, 30, k)), bh = 142;
      R(g, bx + 20, 0, 1, Math.max(0, by), "#5a5070"); R(g, bx + bw - 21, 0, 1, Math.max(0, by), "#5a5070");
      R(g, bx + 3, by + 4, bw, bh, "rgba(0,0,0,0.5)");
      R(g, bx, by, bw, bh, "#14102a"); PX.box(g, bx, by, bw, bh, "#8a7ac0"); R(g, bx + 1, by + 1, bw - 2, 1, "#c0b0f0");
      for (let i = 0; i < 12; i++) R(g, bx + 6 + i * 15, by + 3, 3, 2, (i + Math.floor(t * 8)) % 3 ? "#6a5030" : "#ffe08a");
      const cats = [["DEBUGGING", 0.86, 0.38], ["READING CODE", 0.8, 0.62], ["CONCEPTS", 0.76, 0.64]];
      cats.forEach(([nm, hv, av], i) => {
        const ry = by + 14 + i * 42, gk = PX.p(t, dbg + 0.5 + i * 0.25, 0.6, "out"), isD = i === 0;
        const red = isD && t > dbg + 1.3 && PX.blink(t, 0.4, 0.6);
        if (isD) { R(g, bx + 5, ry - 3, bw - 10, 38, red ? "#3a0e18" : "#1e1430"); if (red) { PX.box(g, bx + 5, ry - 3, bw - 10, 38, "#ff5c5c"); PX.glow(g, bx + bw / 2, ry + 16, 90, "rgba(255,92,92,0.6)", 0.4); } }
        PX.text(g, nm, bx + 10, ry, { size: 8, col: red ? "#ff8a8a" : "#d8d0f0" });
        R(g, bx + 10, ry + 12, 168, 7, "#0c0a18"); R(g, bx + 10, ry + 12, Math.round(168 * hv * gk), 7, "#f7c948"); R(g, bx + 10, ry + 12, Math.round(168 * hv * gk), 1, "#ffe8a0");
        R(g, bx + 10, ry + 22, 168, 7, "#0c0a18"); R(g, bx + 10, ry + 22, Math.round(168 * av * gk), 7, "#5fe3e8"); R(g, bx + 10, ry + 22, Math.round(168 * av * gk), 1, "#c0f8ff");
        if (isD && gk > 0.95) { const gx0 = bx + 10 + Math.round(168 * av), gx1 = bx + 10 + Math.round(168 * hv); R(g, gx0 + 1, ry + 25, gx1 - gx0 - 1, 1, red ? "#ff5c5c" : "#7a3a4a"); R(g, gx0 + 1, ry + 22, 1, 7, "#ff5c5c"); R(g, gx1 - 1, ry + 14, 1, 15, "#ff5c5c"); }
      });
    }
    // ---- audience silhouettes (foreground) ----
    PX.par(g, c, 1.15, () => {
      const r = PX.rnd(31), cheer = t > hand + 1.1;
      for (let i = 0; i < 26; i++) { const x = -30 + i * 27 + r() * 8, y = 336 + r() * 10, j = cheer ? Math.round(Math.max(0, Math.sin(t * 7 + i)) * 3) : 0, col = r() < 0.5 ? "#0a0814" : "#100c1e";
        ell(g, x, y - j, 9, 7, col); R(g, x - 14, y + 6 - j, 28, 30, col); R(g, x - 5, y - 7 - j, 10, 1, "#3a2c66"); R(g, x - 12, y + 6 - j, 24, 1, "#2a2050");
        if (cheer && i % 5 === 2) limb(g, x + 10, y + 6 - j, x + 16, y - 16 - j, 4, col); }
    });
    PX.particles(g, 23, 30, t, [0, 0, 640, 300], { vy: -4, vx: 1, col: "#d8c8ff", a: 0.35 });
    PX.vignette(g, 0.5);
  };

  // ---------- small helpers for the factory ----------
  const gear = (g, cx, cy, r, a, col) => {
    for (let i = 0; i < 8; i++) { const an = a + (i / 8) * 6.283; R(g, cx + Math.cos(an) * r - 2, cy + Math.sin(an) * r - 2, 4, 4, col); }
    PX.circle(g, cx, cy, r - 1, col); PX.circle(g, cx, cy, Math.max(1, r - 4), sh(col, 0.6)); PX.circle(g, cx, cy, 2, sh(col, 1.3));
  };
  const codeBlock = (g, x, y, seed, o) => {   // 28x18 card of code on the belt
    o = o || {}; x = Math.round(x); y = Math.round(y);
    R(g, x + 1, y + 2, 28, 18, "rgba(0,0,0,0.4)");
    R(g, x, y, 28, 18, "#142236"); PX.box(g, x, y, 28, 18, o.red ? "#ff5c5c" : "#3a8ab0"); R(g, x + 1, y + 1, 26, 1, "#5ab0d8");
    const r = PX.rnd(seed + 3), cols = ["#ff7b72", "#d2a8ff", "#a5d6ff", "#7ee787"];
    for (let i = 0; i < 4; i++) R(g, x + 3 + (i % 2) * 3, y + 4 + i * 3, 6 + Math.floor(r() * 14), 1, cols[Math.floor(r() * 4)]);
  };
  const bug = (g, x, y, t) => {   // small red bug peeking, legs wiggling
    const w = Math.round(Math.sin(t * 18));
    R(g, x - 4, y - 2 + w, 1, 2, "#2a0a0a"); R(g, x + 4, y - 2 - w, 1, 2, "#2a0a0a"); R(g, x - 4, y + 2 - w, 1, 2, "#2a0a0a"); R(g, x + 4, y + 2 + w, 1, 2, "#2a0a0a");
    ell(g, x, y, 3, 3, "#d02a2a"); R(g, x - 2, y - 2, 2, 1, "#ff8a8a"); R(g, x, y - 3, 1, 6, "#7a1010");
    R(g, x - 2, y - 5, 4, 2, "#3a0a0a"); R(g, x - 3, y - 7 + w, 1, 2, "#3a0a0a"); R(g, x + 2, y - 7 - w, 1, 2, "#3a0a0a");
    R(g, x - 1, y - 5, 1, 1, "#ffe0e0"); R(g, x + 1, y - 5, 1, 1, "#ffe0e0");
  };

  // ================= debug_gap: factory floor, the AI machine, a human quality check that misses a bug =================
  K.debug_gap = (o) => (g, t, d, c) => {
    const bugT = T(o, "bug", 4.0, d, 10.5), labT = T(o, "label", 6.0, d, 10.5);
    const GATE = 430, V = 52, PER = 1.15;
    const phone = t > bugT - 1.3 && t < bugT + 1.2;
    // ---- back wall ----
    PX.par(g, c, 0.4, () => {
      PX.vgrad(g, -40, -20, 720, 250, "141a30", "1e2440", 7);
      for (let x = -40; x < 680; x += 24) for (let y = 70; y < 230; y += 8) R(g, x + ((y / 8) % 2) * 12, y, 23, 7, ((x + y) / 8) % 3 ? "#1a2038" : "#1c233e");
      // high windows with moonlight
      for (let i = 0; i < 6; i++) { const wx = -10 + i * 116; R(g, wx, 14, 92, 44, "#2a3048"); PX.vgrad(g, wx + 3, 17, 86, 38, "1e2a5a", "34407a", 4);
        for (let j = 1; j < 4; j++) R(g, wx + 3 + j * 21, 17, 2, 38, "#2a3048"); R(g, wx + 3, 35, 86, 2, "#2a3048"); }
      PX.circle(g, 470, 30, 7, "#e8e4c8"); PX.circle(g, 473, 28, 6, "#34407a");
      shaft(g, 360, 450, 58, 300, 470, 240, "#8aa8ff", 0.12); shaft(g, 120, 210, 58, 60, 230, 240, "#8aa8ff", 0.1);
      // pipes
      R(g, -40, 64, 720, 6, "#2e3550"); R(g, -40, 64, 720, 1, "#4a5578"); R(g, -40, 76, 720, 3, "#262c44");
      for (let x = 40; x < 680; x += 140) { R(g, x, 61, 8, 12, "#3a4260"); R(g, x + 2, 59, 4, 2, "#c0392b"); }
      for (let i = 0; i < 5; i++) R(g, 60 + i * 130, 0, 2, 64, "#22283e");
    });
    // ---- catwalk + lamps (mid) ----
    PX.par(g, c, 0.65, () => {
      R(g, -40, 118, 720, 4, "#2a3048"); R(g, -40, 118, 720, 1, "#4a5578"); for (let x = -40; x < 680; x += 14) R(g, x, 104, 2, 14, "#262c44"); R(g, -40, 103, 720, 2, "#3a4260");
      for (const lx of [300, 560]) { const sw = Math.round(Math.sin(t * 1.1 + lx) * 1.5);
        R(g, lx + sw, 0, 1, 130, "#22283e"); R(g, lx - 10 + sw, 130, 21, 6, "#3a4260"); R(g, lx - 12 + sw, 136, 25, 2, "#5a6488"); R(g, lx - 8 + sw, 138, 17, 1, "#ffe2a8");
        PX.glow(g, lx + sw, 140, 36, "rgba(255,226,168,0.9)", 0.6); LB.cone(g, lx + sw, 139, 20, 150, 120, "#ffe2a8", 0.13); }
      // wall sign
      R(g, 520, 150, 74, 24, "#1a1d2a"); for (let i = 0; i < 8; i++) R(g, 522 + i * 9, 152, 5, 3, i % 2 ? "#f7c948" : "#1a1a1a"); PX.text(g, "LINE A", 557, 160, { size: 8, col: "#f7c948", align: "center" });
    });
    // ---- floor ----
    PX.vgrad(g, -40, 238, 720, 130, "22283a", "141824", 5);
    for (let x = -40; x < 700; x += 48) PX.line(g, 320 + (x - 320) * 0.5, 238, x, 368, "#1a1e2c");
    // floor details: cables, puddle reflecting the lamp, oil stains
    PX.line(g, 200, 300, 260, 296, "#0e1018"); PX.line(g, 260, 296, 330, 304, "#0e1018"); PX.line(g, 330, 304, 400, 300, "#0e1018"); PX.line(g, 200, 301, 400, 301, "#1a1e2a");
    ell(g, 300, 282, 34, 4, "#2a3450"); R(g, 286, 281, 24, 1, "#8a9ac8"); PX.glow(g, 300, 282, 26, "rgba(255,226,168,0.6)", 0.35 + 0.1 * Math.sin(t * 2));
    ell(g, 520, 296, 20, 3, "#181c28");
    // ---- the AI machine ----
    const pump = Math.round(Math.sin(t * 4.4) * 2);
    PX.glow(g, 115, 120, 150, "rgba(95,227,232,0.4)", 0.5);
    R(g, 24, 150, 168, 150, "#2a3346"); R(g, 24, 150, 168, 2, "#5a6a88"); R(g, 24, 150, 2, 150, "#46546e"); R(g, 190, 150, 2, 150, "#1a2030");
    for (let i = 0; i < 6; i++) { R(g, 32 + i * 26, 158, 3, 3, "#5a6a88"); R(g, 32 + i * 26, 290, 3, 3, "#5a6a88"); }
    R(g, 40, 176, 70, 44, "#1e2638"); PX.box(g, 40, 176, 70, 44, "#3a4a66");
    for (let i = 0; i < 4; i++) R(g, 46, 182 + i * 9, 40 + ((i * 17 + Math.floor(t * 3)) % 18), 3, ["#5fe3e8", "#3df56b", "#5fe3e8", "#f7c948"][i]);
    gear(g, 140, 196, 14, t * 2, "#5a6488"); gear(g, 164, 222, 9, -t * 3.2, "#6a7498");
    for (let i = 0; i < 8; i++) { const on = (i + Math.floor(t * 5)) % 4 === 0; R(g, 40 + i * 10, 236, 6, 4, on ? "#3df56b" : "#1a4a2a"); if (on) PX.glow(g, 43 + i * 10, 238, 8, "rgba(61,245,107,0.8)", 0.5); }
    R(g, 40, 252, 136, 34, "#232b3c"); for (let i = 0; i < 9; i++) R(g, 44 + i * 15, 256, 10, 26, "#1a2030");
    // pistons + neck
    R(g, 70, 136 + pump, 10, 18, "#5a6488"); R(g, 150, 136 - pump, 10, 18, "#5a6488"); R(g, 72, 136 + pump, 2, 18, "#8a96b8"); R(g, 152, 136 - pump, 2, 18, "#8a96b8");
    R(g, 96, 130, 40, 22, "#3a4460");
    agent(g, 116, 92 + Math.round(pump / 2), 104, t, { look: 6, ga: 0.35, eyes: t > labT ? "happy" : "on" });
    // output chute
    for (let i = 0; i < 22; i++) R(g, 182 + i, 206 + i, 18, 2, i % 2 ? "#3a4460" : "#46506e");
    R(g, 182, 196, 24, 12, "#2a3346"); R(g, 182, 196, 24, 2, "#5a6a88");
    // welding sparks
    if (frac(t * 0.9) < 0.35) { const r = PX.rnd(Math.floor(t * 20)); PX.glow(g, 200, 214, 16, "rgba(255,230,160,0.9)", 0.8); for (let i = 0; i < 6; i++) R(g, 200 + (r() - 0.3) * 20, 214 + (r() - 0.5) * 14, 1, 1, r() < 0.5 ? "#ffe08a" : "#ffffff"); }
    // steam
    for (let i = 0; i < 4; i++) { const k = frac(t * 0.45 + i / 4); PX.alpha(g, 0.35 * (1 - k), () => PX.circle(g, 60 + Math.sin(k * 5 + i) * 4, 148 - k * 60, 3 + Math.round(k * 6), "#8a96b8")); }
    // ---- conveyor ----
    const BY = 236;
    R(g, 196, BY, 470, 8, "#1e2230"); R(g, 196, BY, 470, 1, "#5a6488");
    const sc = (t * V) % 12; for (let x = 196 - 12; x < 666; x += 12) R(g, x + sc, BY + 2, 6, 2, "#2c3244");
    R(g, 196, BY + 8, 470, 6, "#3a4260"); R(g, 196, BY + 8, 470, 1, "#5a6488");
    for (let x = 206; x < 666; x += 20) { PX.circle(g, x, BY + 11, 3, "#22283a"); const a = t * V / 3; R(g, x + Math.round(Math.cos(a) * 2), BY + 11 + Math.round(Math.sin(a) * 2), 1, 1, "#8a96b8"); }
    for (let x = 220; x < 666; x += 80) { R(g, x, BY + 14, 4, 50, "#262c3e"); R(g, x, BY + 14, 1, 50, "#3a4260"); }
    R(g, 196, BY + 60, 470, 4, "#1a1e2a");
    // ---- quality check station (gate behind the belt) ----
    R(g, GATE - 24, 160, 4, 78, "#4a5470"); R(g, GATE + 20, 160, 4, 78, "#4a5470"); R(g, GATE - 26, 154, 52, 8, "#3a4460"); R(g, GATE - 26, 154, 52, 1, "#6a7498");
    const scanOn = PX.blink(t, 0.5, 0.8); R(g, GATE - 20, 162, 40, 2, scanOn ? "#3df56b" : "#1a5a2a");
    if (scanOn) LB.cone(g, GATE, 163, 36, 40, 72, "#3df56b", 0.25);
    R(g, GATE + 30, 196, 52, 40, "#2a3346"); R(g, GATE + 30, 196, 52, 2, "#5a6a88");   // booth desk
    hangSign(g, GATE + 4, 126, 120, 18, 1, t, "QUALITY CHECK", "#3df56b");
    // ---- supervisor (behind the belt, waist up) ----
    const sx = GATE + 62;
    const p = LB.person(g, sx, 284, { h: 112, skin: "#c98a5a", hair: "#2a1a10", shirt: "#e8782a", stripe: "#f0f0a0", pants: "#2a3046", lit: -1, noLegs: true,
      face: phone ? "smug" : "neutral", look: phone ? 0 : -2, bob: phone ? 0 : Math.round(Math.max(0, Math.sin((t - bugT) * (6.283 / PER))) * 1),
      al: phone ? [[-6, 8], [2, -6]] : [-4, 18], ar: phone ? [[8, 8], [4, -8]] : [[8, 10], [-6, 14]] });
    R(g, p.hx - p.hw / 2 - 2, p.hy - 3, p.hw + 4, 6, "#f7c948"); R(g, p.hx - p.hw / 2, p.hy - 6, p.hw, 4, "#f7c948"); R(g, p.hx - p.hw / 2 + 2, p.hy - 6, p.hw - 6, 1, "#fff0a0"); R(g, p.hx - p.hw / 2 - 2, p.hy + 2, p.hw + 4, 1, "#b8901a");
    if (phone) { const px = p.hx - 4, py = p.hy + p.hh + 2; R(g, px, py, 9, 13, "#1a1c24"); R(g, px + 1, py + 1, 7, 10, "#5fa8ff"); R(g, px + 2, py + 3, 5, 1, "#c0e0ff"); R(g, px + 2, py + 6, 4, 1, "#c0e0ff");
      PX.glow(g, px + 4, py + 2, 26, "rgba(110,170,255,0.9)", 0.55); }
    else { R(g, p.hr[0] - 3, p.hr[1] - 2, 8, 10, "#c8c0a8"); R(g, p.hr[0] - 2, p.hr[1], 6, 1, "#5a5a6a"); R(g, p.hr[0] - 2, p.hr[1] + 3, 6, 1, "#5a5a6a"); }   // clipboard
    // ---- blocks on the belt ----
    for (let i = -6; i <= 8; i++) {
      const arr = bugT + i * PER, x = GATE + V * (t - arr) - 14;
      if (x < 186 || x > 660) continue;
      const passed = t > arr, isBug = i === 0;
      const ent = cl((x - 186) / 20, 0, 1);
      codeBlock(g, x, BY - 18 + Math.round((1 - ent) * -6), i * 7 + 50, { red: isBug && passed && t > arr + 0.8 });
      if (isBug) { const peek = Math.round(Math.abs(Math.sin(t * 2.2)) * 3); bug(g, x + 22, BY - 18 - peek, t); if (t > arr - 1 && t < arr + 1.5) PX.glow(g, x + 22, BY - 20, 14, "rgba(255,80,80,0.8)", 0.5); }
      if (passed && !isBug) {
        const k = PX.p(t, arr, 0.25, "back"), ty = BY - 30 - Math.round(k * 4);
        PX.zoom(g, Math.max(0.05, k), x + 14, ty + 4, () => { R(g, x + 9, ty + 4, 3, 3, "#3df56b"); R(g, x + 12, ty + 6, 3, 3, "#3df56b"); R(g, x + 15, ty + 3, 3, 3, "#3df56b"); R(g, x + 18, ty, 3, 3, "#3df56b"); R(g, x + 9, ty + 4, 12, 1, "#a0ffb8"); });
        if (t - arr < 0.3) PX.glow(g, x + 14, ty + 4, 16, "rgba(61,245,107,0.9)", 1 - (t - arr) / 0.3);
      }
    }
    // ---- foreground: hazard floor strip, crates ----
    PX.par(g, c, 1.12, () => {
      R(g, -40, 318, 720, 50, "#12141e");
      for (let x = -40; x < 700; x += 16) { g.fillStyle = "#c8a020"; g.beginPath(); g.moveTo(x, 318); g.lineTo(x + 8, 318); g.lineTo(x, 326); g.lineTo(x - 8, 326); g.fill(); }
      R(g, -40, 326, 720, 1, "#2a2c38");
      const crate = (x, y, w, h) => { R(g, x, y, w, h, "#5a4030"); R(g, x, y, w, 2, "#8a6a48"); PX.box(g, x, y, w, h, "#3a2818"); PX.line(g, x + 2, y + 2, x + w - 3, y + h - 3, "#3a2818"); R(g, x + 2, y + 2, 1, h - 4, "#7a5a40"); };
      crate(-10, 290, 50, 44); crate(16, 262, 34, 30); crate(586, 296, 64, 40);
    });
    // ---- label banner ----
    if (t >= labT) hangSign(g, 320, 30, 264, 22, PX.p(t, labT, 0.6, "lin"), t, "DEBUGGING = SUPERVISING THE AI", "#f7c948", { fill: "#22180c" });
    PX.particles(g, 29, 28, t, [0, 60, 640, 200], { vy: -3, vx: 2, col: "#c8d0ff", a: 0.4 });
    PX.vignette(g, 0.55);
  };

  // ================= calendar_gap: office wall calendar, pages flip a month ahead =================
  K.calendar_gap = (o) => (g, t, d, c) => {
    const flip = T(o, "flip", 1.5, d, 5), NP = 8, FD = 0.95;   // flipping pages over FD seconds
    const gust = t > flip - 0.2 && t < flip + FD + 0.8, gk = cl((t - flip + 0.2) / 0.3, 0, 1) * cl((flip + FD + 0.8 - t) / 0.6, 0, 1);
    const swing = t > flip ? Math.sin((t - flip) * 7) * 5 * Math.exp(-(t - flip) * 1.4) : 0;
    // ---- wall ----
    PX.par(g, c, 0.5, () => {
      PX.vgrad(g, -40, -20, 720, 400, "2a2a48", "1c1c34", 8);
      for (let x = -40; x < 680; x += 20) R(g, x, -20, 1, 400, "#262642");
      R(g, -40, 300, 720, 6, "#3a2e3a"); R(g, -40, 300, 720, 1, "#5a4a5a");
      // moonlight through blinds: slanted stripes across the wall
      const op = g.globalCompositeOperation; g.globalCompositeOperation = "lighter"; g.fillStyle = "rgba(120,140,220,0.07)";
      for (let i = 0; i < 6; i++) { const y = -10 + i * 22; g.beginPath(); g.moveTo(380, y); g.lineTo(700, y + 120); g.lineTo(700, y + 132); g.lineTo(380, y + 12); g.fill(); }
      g.globalCompositeOperation = op;
    });
    PX.glow(g, 70, 290, 250, "rgba(255,190,110,0.55)", 0.75);
    // ---- side props (mid) ----
    PX.par(g, c, 0.7, () => {
      R(g, 22, 54, 120, 90, "#5a4030"); R(g, 26, 58, 112, 82, "#9a7048"); R(g, 22, 54, 120, 1, "#8a6a50"); for (let i = 0; i < 40; i++) R(g, 28 + ((i * 37) % 108), 60 + ((i * 53) % 78), 1, 1, "#7a5838");
      const notes = [[34, 66, "#d8b83a"], [80, 64, "#6ab0d0"], [48, 98, "#d07898"], [96, 100, "#90c060"]];
      notes.forEach(([nx, ny, col], i) => { const fl = gust ? Math.round(Math.sin(t * 25 + i) * 2 * gk) : 0, gone = i === 1 && t > flip + 0.1;
        if (gone) return; R(g, nx, ny + fl, 30, 26, col); R(g, nx, ny + fl, 30, 3, sh(col, 0.85)); R(g, nx + 4, ny + 9 + fl, 20, 1, sh(col, 0.6)); R(g, nx + 4, ny + 14 + fl, 16, 1, sh(col, 0.6)); R(g, nx + 13, ny - 1, 3, 3, "#c0392b"); });
      R(g, 492, 46, 100, 72, "#3a2a24"); R(g, 496, 50, 92, 64, "#2a3a6a"); PX.circle(g, 562, 68, 8, "#e8c048"); for (let i = 0; i < 4; i++) R(g, 496 + i * 23, 94 - i * 6, 23, 20 + i * 6, ["#2a5a4a", "#346a54", "#2a5a4a", "#3e7a5e"][i]);
      R(g, 492, 46, 100, 1, "#6a5040");
      LB.clock(g, 540, 176, t * 30, 18);
      for (let i = 0; i < 7; i++) { const a = -2.4 + i * 0.5 + Math.sin(t * 2 + i) * 0.06 + (gust ? Math.sin(t * 14 + i) * 0.12 * gk : 0); limb(g, 604, 300, 604 + Math.cos(a) * 34, 300 + Math.sin(a) * 40, 4, i % 2 ? "#3a8a4a" : "#2e7040", "#1e4a2a"); }
      R(g, 588, 296, 34, 30, "#8a4a2c"); R(g, 588, 296, 34, 3, "#b06a40");
    });
    // ---- calendar ----
    const CX = 320 + Math.round(swing), TOP = 30, W = 216, H = 270, X = Math.round(CX - W / 2);
    R(g, 319, 12, 3, 4, "#8a8a9a"); PX.line(g, 320, 15, X + 30, TOP + 2, "#5a5a6a"); PX.line(g, 320, 15, X + W - 30, TOP + 2, "#5a5a6a");
    R(g, X + 5, TOP + 7, W, H, "rgba(0,0,0,0.45)");
    const BIND = TOP + 14, PH = H - 14, PAP = "#aea489", PD = "#968b72", GRID = "#776c56";
    const grid = (y0, skip) => { for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) { if (skip && skip(r, q)) continue; const bx = X + 10 + q * 49, by = y0 + 60 + r * 62; R(g, bx, by, 47, 58, "#a69c82"); PX.box(g, bx, by, 47, 58, GRID); R(g, bx + 1, by + 1, 45, 1, "#bab096"); } };
    const pageBody = (y0, h, kind) => {
      R(g, X, y0, W, h, PAP); R(g, X, y0, 2, h, "#d4caae"); R(g, X + W - 3, y0, 3, h, PD);
      if (h < 50) return;
      if (kind === "day1") {
        R(g, X + 8, y0 + 8, W - 16, 42, "#a8322a"); R(g, X + 8, y0 + 8, W - 16, 2, "#d0503e"); R(g, X + 8, y0 + 48, W - 16, 2, "#7a1e18");
        PX.text(g, "DAY 1", CX, y0 + 17, { size: 24, col: "#f4e4d0", align: "center" });
        grid(y0, (r, q) => r === 0 && (q === 1 || q === 2));
        const bx = X + 59, by = y0 + 60; R(g, bx, by, 96, 58, "#a69c82"); PX.box(g, bx, by, 96, 58, GRID);
        PX.text(g, "QUIZ", bx + 48, by + 22, { size: 16, col: "#22306a", align: "center" });
        const ck = PX.p(t, 0.15, 0.7, "io"), n = Math.floor(ck * 64);
        for (let i = 0; i < n; i++) { const a = (i / 58) * 6.283 - 2.4; R(g, bx + 48 + Math.cos(a) * 44, by + 29 + Math.sin(a) * 19 + (i > 56 ? 2 : 0), 2, 2, "#d02a2a"); }
      } else if (kind === "blank") {
        R(g, X + 8, y0 + 8, W - 16, 42, "#4a5a8a"); R(g, X + 8, y0 + 8, W - 16, 2, "#6a7aaa"); grid(y0);
      } else {
        R(g, X + 8, y0 + 8, W - 16, 42, "#2e4a7a"); R(g, X + 8, y0 + 8, W - 16, 2, "#4a6aa0"); R(g, X + 8, y0 + 48, W - 16, 2, "#1e3256");
        PX.text(g, "A MONTH LATER", CX, y0 + 25, { size: 8, col: "#d8e4ff", align: "center" });
        grid(y0, (r, q) => r === 1 && (q === 1 || q === 2));
        const bx = X + 59, by = y0 + 122, qk = PX.p(t, flip + FD + 0.15, 0.4, "back"), pul = t > flip + FD + 0.5 ? 0.5 + 0.5 * Math.sin(t * 4) : 0;
        R(g, bx - 2, by - 2, 100, 62, pul > 0.5 ? "#e8b838" : "#c89a2a"); R(g, bx, by, 96, 58, "#b4aa90"); R(g, bx, by, 96, 1, "#c8bea4");
        if (qk > 0) PX.zoom(g, Math.max(0.05, qk), bx + 48, by + 29, () => PX.text(g, "?", bx + 49, by + 13, { size: 32, col: "#22306a", align: "center" }));
        if (pul) PX.glow(g, bx + 48, by + 29, 60, "rgba(247,201,72,0.7)", 0.15 + 0.2 * pul);
      }
    };
    const pk = (t - flip) / FD, nFlipped = t < flip ? 0 : Math.min(NP, Math.floor(pk * NP));
    if (t < flip) pageBody(BIND, PH, "day1");
    else {
      pageBody(BIND, PH, nFlipped >= NP - 1 ? "late" : "blank");
      if (nFlipped < NP) {   // the page currently flipping up over the binding
        const f = frac(pk * NP), kind = nFlipped === 0 ? "day1" : "blank";
        if (f < 0.6) { const h = Math.round(PH * Math.cos((f / 0.6) * 1.5708)); pageBody(BIND, Math.max(1, h), kind); R(g, X, BIND + h - 3, W, 3, "#8a806a"); R(g, X, BIND + h, W, 3, "rgba(0,0,0,0.3)"); }
        else { const h = Math.round(22 * Math.sin(((f - 0.6) / 0.4) * 1.5708)); R(g, X + 2, BIND - h, W - 4, h, "#8a816c"); R(g, X + 2, BIND - h, W - 4, 1, "#b0a68e"); }
      }
      for (let i = 0; i < Math.min(nFlipped, 4); i++) { const fl = Math.round(Math.sin(t * 20 + i * 1.7) * 3 * gk); R(g, X + 4 + i * 2, BIND - 8 - i * 3 + fl, W - 8 - i * 4, 6, sh("#8a816c", 1 - i * 0.06)); R(g, X + 4 + i * 2, BIND - 8 - i * 3 + fl, W - 8 - i * 4, 1, "#a89e88"); }
    }
    // lamp light on the paper (left side warmer)
    PX.glow(g, X + 20, TOP + 200, 160, "rgba(255,180,100,0.35)", 0.2);
    // binding
    R(g, X - 2, TOP, W + 4, 16, "#2a2c3a"); R(g, X - 2, TOP, W + 4, 1, "#5a5e72");
    for (let i = 0; i < 16; i++) { R(g, X + 8 + i * 13, TOP + 4, 3, 12, "#9a9eaa"); R(g, X + 8 + i * 13, TOP + 4, 1, 12, "#c8ccd8"); }
    // ---- the gust ----
    if (gust) {
      const r = PX.rnd(61);
      for (let i = 0; i < 26; i++) { const y = 20 + r() * 300, sp = 500 + r() * 400, len = 14 + r() * 30, x = ((r() * 900 + (t - flip) * sp) % 900) - 120;
        PX.alpha(g, 0.35 * gk, () => R(g, x, Math.round(y + Math.sin(x * 0.03) * 4), len, 1, "#d8e0ff")); }
      // the blue sticky note tumbles across
      const k = (t - flip - 0.1) / 1.2;
      if (k > 0 && k < 1) { const nx = lerp(92, 700, PX.ease(k, "in")), ny = 70 + Math.sin(k * 9) * 20 + k * 60, wv = Math.abs(Math.cos(k * 14));
        R(g, nx, ny, 30, Math.max(2, Math.round(26 * wv)), "#7ad0f0"); R(g, nx, ny, 30, 2, "#5ab0d0"); }
    }
    // ---- desk edge (foreground) ----
    PX.par(g, c, 1.1, () => {
      R(g, -40, 318, 720, 50, "#3a2a20"); R(g, -40, 318, 720, 3, "#6a4a34"); R(g, -40, 321, 720, 1, "#2a1c14");
      PX.core.mug(g, 150, 306, t);
      R(g, 40, 312, 30, 6, "#2b2f38"); R(g, 52, 262, 4, 50, "#3a3f4b"); R(g, 38, 252, 32, 12, "#3a3f4b"); R(g, 38, 252, 32, 1, "#5a6070"); R(g, 40, 263, 28, 2, "#ffd28a"); PX.glow(g, 54, 268, 50, "rgba(255,210,138,0.8)", 0.6);
      R(g, 360, 312, 120, 8, "#2b2f38"); R(g, 360, 312, 120, 1, "#4a505c"); for (let kx = 0; kx < 18; kx++) R(g, 363 + kx * 6.4, 314, 5, 2, "#5a6270");
      R(g, 222, 310, 50, 8, "#e8e0c8"); R(g, 222, 310, 50, 1, "#ffffff"); R(g, 230, 313, 30, 1, "#8a8a9a");
    });
    PX.glow(g, 600, 200, 120, "rgba(90,150,255,0.25)", 0.6);   // off-screen monitor light
    PX.particles(g, 37, 22, t + (gust ? (t - flip) * 3 : 0), [0, 40, 640, 270], { vy: -3, vx: gust ? 60 : 2, col: "#ffe2b0", a: 0.45 });
    PX.vignette(g, 0.55);
  };

  // ---------- office bits for two_groups ----------
  const monBack = (g, x, y, w, h, t) => {   // monitor seen from behind, screen light spilling around it
    PX.glow(g, x, y + h / 2, w * 1.1, "rgba(95,200,232,0.6)", 0.45);
    R(g, x - w / 2, y, w, h, "#2a2e3a"); R(g, x - w / 2, y, w, 1, "#5a6070"); R(g, x - w / 2, y, 1, h, "#4a5060"); R(g, x + w / 2 - 1, y, 1, h, "#1a1c24");
    R(g, x - w / 2 - 1, y + 1, 1, h - 2, "#8af0f8"); R(g, x + w / 2, y + 1, 1, h - 2, "#8af0f8");
    R(g, x - 3, y + h, 6, 6, "#22252e"); R(g, x - 9, y + h + 6, 18, 2, "#2a2e3a");
    R(g, x - w / 4, y + h / 3, w / 2, 1, "#363a48"); R(g, x - w / 4, y + h / 3 + 3, w / 2, 1, "#363a48");
  };
  const desk = (g, x0, x1, top, col, ph) => {
    ph = ph || 30;
    R(g, x0 + 4, top + 7 + ph, 4, 40, sh(col, 0.4)); R(g, x1 - 8, top + 7 + ph, 4, 40, sh(col, 0.4));
    ell(g, (x0 + x1) / 2, top + 7 + ph + 30, (x1 - x0) / 2, 4, "rgba(0,0,0,0.3)");
    R(g, x0, top, x1 - x0, 7, sh(col, 1.15)); R(g, x0, top, x1 - x0, 1, sh(col, 1.45));
    R(g, x0, top + 7, x1 - x0, ph, sh(col, 0.62)); R(g, x0, top + 7, x1 - x0, 2, sh(col, 0.45)); R(g, x0 + 3, top + 12, x1 - x0 - 6, 1, sh(col, 0.75));
    R(g, x0 + 6, top + 16, x1 - x0 - 12, ph - 14, sh(col, 0.56)); R(g, x0 + 6, top + 16, x1 - x0 - 12, 1, sh(col, 0.48));
  };
  const keycap = (g, x, y, w, txt, down, col) => {
    R(g, x, y + 3, w, 9, sh(col, 0.45)); R(g, x, y + (down ? 3 : 0), w, 9, col); R(g, x, y + (down ? 3 : 0), w, 1, sh(col, 1.4)); R(g, x + 1, y + (down ? 3 : 0) + 8, w - 2, 1, sh(col, 0.7));
    PX.text(g, txt, x + w / 2, y + (down ? 3 : 0) + 1, { font: "v", size: 10, col: "#1a1420", align: "center" });
  };
  const glazed = (g, p) => {   // half-closed eyes reflecting the screen
    const ex = Math.max(2, Math.round(p.hw * 0.22));
    for (const s of [-1, 1]) { const x = p.hx + s * ex - (s < 0 ? 2 : 0) - 1; R(g, x, p.ey - 1, 4, 4, sh("#e0a878", 1)); }
    for (const s of [-1, 1]) { const x = p.hx + s * ex - (s < 0 ? 2 : 0) - 1; R(g, x, p.ey, 4, 1, "#1a1016"); R(g, x, p.ey + 1, 4, 1, "#5fe3e8"); }
  };
  const bulb = (g, x, y, k, t) => {
    if (k <= 0) return;
    PX.zoom(g, Math.max(0.05, k), x, y + 6, () => {
      PX.glow(g, x, y, 26, "rgba(255,220,120,0.9)", 0.8);
      PX.circle(g, x, y, 6, "#ffe27a"); R(g, x - 3, y - 4, 2, 2, "#fff8d0"); R(g, x - 3, y + 6, 7, 2, "#9aa0b0"); R(g, x - 2, y + 8, 5, 2, "#7a8090");
      if (PX.blink(t, 0.3, 0.6)) for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.44; R(g, x + Math.cos(a) * 11, y + Math.sin(a) * 11, 2, 1, "#ffe27a"); }
    });
  };
  const bubble = (g, x, y, lines, tx, ty) => {   // speech bubble centred at x, top y; tail to (tx, ty)
    const w = Math.max(...lines.map((l) => l.length)) * 8 + 14, h = lines.length * 11 + 9, bx = Math.round(x - w / 2);
    R(g, bx - 1, y - 1, w + 2, h + 2, "#0e1018"); R(g, bx, y, w, h, "#f0ece0"); R(g, bx, y, w, 1, "#ffffff"); R(g, bx, y + h - 2, w, 2, "#c8c0b0");
    for (let i = 0; i < 6; i++) R(g, Math.round(lerp(x, tx, i / 6)) - 2 + Math.round(i * 0.3), y + h + i, 4 - Math.floor(i / 2), 1, "#f0ece0");
    lines.forEach((l, i) => PX.text(g, l, x, y + 5 + i * 11, { size: 8, col: "#22202e", align: "center" }));
  };

  // ================= two_groups: the AI group's room, two lanes: handed it all over vs asked why =================
  K.two_groups = (o) => (g, t, d, c) => {
    const tl = T(o, "left", 4.0, d, 16), tr = T(o, "right", 11.0, d, 16), same = T(o, "same", 13.0, d, 16), sw = (tl + tr) / 2;
    // ---- far: windows with the night city, both lanes ----
    PX.par(g, c, 0.35, () => {
      PX.vgrad(g, -40, 30, 720, 100, "141a3a", "2a2450", 6);
      PX.core.skyline(g, -40, 40, 720, 90, t, 12);
    });
    // ---- wall ----
    PX.par(g, c, 0.6, () => {
      const wall = "#232848";
      R(g, -40, -20, 720, 60, wall); R(g, -40, 128, 720, 90, wall); for (let x = -40; x < 680; x += 6) R(g, x, 129 + ((x / 6) % 2), 1, 1, "#1e2240");
      for (const wx of [0, 110, 340, 450, 560]) { R(g, wx - 30, 40, 4, 88, "#3a3e5a"); }
      R(g, -40, 38, 720, 3, "#3a3e5a"); R(g, -40, 126, 720, 4, "#4a4e6a"); R(g, -40, 129, 720, 1, "#2a2e48");
      // lane title plaques
      R(g, 70, 12, 180, 20, "#141830"); R(g, 410, 12, 140, 20, "#141830");
      PX.alpha(g, 1 - 0.75 * PX.p(t, same, 0.5, "io"), () => {
        PX.box(g, 70, 12, 180, 20, "#ff8a7a"); PX.text(g, "HANDED IT ALL OVER", 160, 18, { size: 8, col: "#ff9a8a", align: "center" });
        PX.box(g, 410, 12, 140, 20, "#7ae8a0"); PX.text(g, "ASKED WHY", 480, 18, { size: 8, col: "#8af0b0", align: "center" }); });
      LB.clock(g, 600, 160, t * 10, 9);
      R(g, 20, 150, 24, 30, "#2a3050"); R(g, 22, 152, 20, 26, "#4a3a6a"); R(g, 26, 158, 12, 2, "#f7c948"); R(g, 26, 163, 9, 2, "#8a7ab0");
      R(g, -40, 216, 720, 4, "#1a1d34");
    });
    // ---- floor ----
    PX.vgrad(g, -40, 218, 720, 150, "2a2a44", "1a1a2e", 5);
    for (let x = -40; x < 700; x += 36) PX.line(g, 320 + (x - 320) * 0.45, 218, x, 368, "#22223a");
    // ceiling lamps
    for (const lx of [160, 480]) { R(g, lx - 30, 0, 60, 4, "#3a3e5a"); R(g, lx - 28, 4, 56, 2, "#ffe8c0"); PX.glow(g, lx, 8, 70, "rgba(255,232,192,0.8)", 0.5); LB.cone(g, lx, 6, 56, 200, 220, "#ffe8c0", 0.06); }
    // ======== LEFT LANE: copy-pasters ========
    const P = 0.5;
    const leftDev = (x, hip, h, ph, mon, pile, cap, big) => {
      const u = frac((t + ph) / P), down = u > 0.55, n = Math.max(0, Math.floor((t + ph) / P));
      const top = hip - 4;
      const MW = big ? 56 : 36, MH = big ? 40 : 26;
      monBack(g, mon, top - MH - 8, MW, MH, t);
      agent(g, mon, top - MH - (big ? 30 : 22) + Math.round(Math.sin(t * 3 + ph) * 2), big ? 26 : 16, t, { eyes: "happy", ph, ga: 0.4 });
      if (frac(t * 4 + ph) < 0.5) R(g, mon - 2 + ((Math.floor(t * 8) % 3) - 1) * 4, top - MH - (big ? 14 : 12), 2, 3, "#5fe3e8");
      const p = LB.person(g, x, hip, { h, seated: true, skin: big ? "#e0a878" : "#c98a5a", hair: big ? "#6a4a2a" : "#1a120c", hairStyle: big ? "short" : "bun", shirt: big ? "#8a5ab0" : "#b04a5a", face: "neutral",
        bob: down ? 1 : 0, hands: down ? { l: [x - 9, top + 2], r: [x + 12, top + 2] } : { l: [x - 12, top - 12], r: [x + 14, top - 12] } });
      glazed(g, p);
      desk(g, x - (big ? 84 : 52), x + (big ? 84 : 52), top, "#6a5040", big ? 50 : 26);
      keycap(g, x - (big ? 24 : 15), top - 6, big ? 22 : 14, big ? "CTRL" : "C", down, "#c8c4d8"); keycap(g, x + (big ? 4 : 2), top - 6, big ? 16 : 10, "V", down, "#f7c948");
      if (down && u < 0.7) PX.glow(g, x, top, 18, "rgba(247,201,72,0.8)", 0.5);
      // pile of identical copies
      const ph2 = Math.min(cap, n * (big ? 2 : 1.5)), sx = pile;
      for (let i = 0; i < ph2; i += 2) { const off = Math.round(Math.sin(i * 0.21) * 2 + i * 0.03), col = (i / 2) % 2 ? "#b8b09a" : "#a8a08a"; R(g, sx - (big ? 13 : 9) + off, top - 2 - i, big ? 26 : 18, 2, col); }
      R(g, sx - (big ? 13 : 9) + Math.round(Math.sin(ph2 * 0.21) * 2 + ph2 * 0.03), top - 2 - ph2, big ? 26 : 18, 1, "#d8d0bc");
      // copy in flight
      const fu = frac((t + ph) / P - 0.55); if (n > 0 && fu < 0.75) { const k = fu / 0.75, fx = lerp(mon, sx, k), fy = lerp(top - MH - 10, top - 4 - ph2, k) - Math.sin(k * 3.14) * 22;
        R(g, fx - 6, fy, 12, 8, "#d8d0bc"); R(g, fx - 4, fy + 2, 7, 1, "#5a6a8a"); R(g, fx - 4, fy + 4, 5, 1, "#5a6a8a"); }
      if (big && down && u < 0.75) PX.otext(g, "CTRL+V", x + 50, top - 22 - Math.round((u - 0.55) * 30), { font: "v", size: 14, col: "#f7c948", align: "center" });
    };
    leftDev(262, 238, 70, 0.23, 212, 298, 80, false);
    leftDev(150, 318, 116, 0, 54, 208, 140, true);
    // ======== RIGHT LANE: question-askers ========
    const CP = 3.2;
    const rightDev = (x, hip, h, ph, mon, big, idx) => {
      const u = frac((t + ph) / CP), cyc = Math.floor((t + ph) / CP), top = hip - 4;
      const MW = big ? 56 : 36, MH = big ? 40 : 26;
      monBack(g, mon, top - MH - 8, MW, MH, t);
      const ay = top - MH - (big ? 30 : 22) + Math.round(Math.sin(t * 2.5 + ph) * 2);
      agent(g, mon, ay, big ? 26 : 16, t, { eyes: u > 0.32 && u < 0.66 ? "happy" : "on", look: -2, ph, ga: 0.45 });
      const asking = u < 0.32, lit = u > 0.66;
      const p = LB.person(g, x, hip, { h, seated: true, skin: big ? "#6b4226" : "#f2c9a0", hair: big ? "#1a120c" : "#8a3a2a", hairStyle: big ? "curly" : "long", shirt: big ? "#3a8a9a" : "#c08a3a",
        face: lit ? "happy" : asking ? "focus" : "neutral", look: 2, lit: -1,
        hands: asking ? { l: [x - 12, top], r: [x + (big ? 44 : 26), top - (big ? 34 : 20)] } : { l: [x - 12, top], r: [x + 10, top + 1] } });
      if (!big && u > 0.2 && u < 0.3) R(g, p.hx - 12, p.hy, 1, 1, "#fff");
      desk(g, x - (big ? 84 : 52), x + (big ? 84 : 52), top, "#6a5040", big ? 50 : 26);
      // notebook with growing notes
      const nx = x - (big ? 20 : 14), nw = big ? 36 : 24; R(g, nx, top - 2, nw, 6, "#d8d0bc"); R(g, nx + nw / 2, top - 2, 1, 6, "#8a8070"); R(g, nx, top - 2, nw, 1, "#f0e8d4");
      const notes = Math.min(4, cyc + (lit ? 1 : 0)); for (let i = 0; i < notes; i++) R(g, nx + 2 + (i % 2) * (nw / 2), top + (i < 2 ? 0 : 2), nw / 2 - 5, 1, "#3a4a7a");
      R(g, p.hl[0] - 1, p.hl[1] - 6, 1, 6, "#f7c948");
      bulb(g, p.hx + (big ? 18 : 12), p.hy - (big ? 14 : 10), lit ? PX.ease(cl((u - 0.66) / 0.08, 0, 1), "back") : 0, t);
      if (big) {
        const q = cyc % 2 === 0 ? ["WHY?"] : ["WHAT DOES", "THIS LINE DO?"];
        if (asking && u > 0.03) bubble(g, x - 6, p.hy - 44 + (q.length === 1 ? 11 : 0), q, x + 4, p.hy - 4);
        if (u > 0.34 && u < 0.64) {   // AI explains: a little diagram bubble
          const bx = mon - 30, by = ay - 50; R(g, bx - 1, by - 1, 62, 34, "#0e1018"); R(g, bx, by, 60, 32, "#d8f6f8"); R(g, bx, by, 60, 1, "#ffffff");
          const k = cl((u - 0.34) / 0.2, 0, 1); for (let i = 0; i < 3; i++) R(g, bx + 5, by + 5 + i * 6, Math.round([30, 22, 26][i] * cl(k * 3 - i, 0, 1)), 2, "#2a8a9a");
          R(g, bx + 40, by + 6, 12, 8, "#2a8a9a"); PX.line(g, bx + 46, by + 14, bx + 46, by + 22, "#2a8a9a"); R(g, bx + 40, by + 22, 12, 6, "#f25ca8");
          for (let i = 0; i < 5; i++) R(g, mon - 2 + i, by + 32 + i, 4 - Math.floor(i / 2), 1, "#d8f6f8");
        }
      }
    };
    rightDev(404, 238, 70, 1.1, 356, false, 1);
    rightDev(474, 318, 116, 0, 574, true, 0);
    // ---- glass partition ----
    PX.alpha(g, 0.18, () => R(g, 312, 0, 16, 360, "#8ad8f0"));
    R(g, 311, 0, 2, 360, "#3a4a6a"); R(g, 327, 0, 2, 360, "#3a4a6a"); R(g, 313, 0, 1, 360, "#8ad8f0");
    for (let i = 0; i < 3; i++) PX.alpha(g, 0.25, () => PX.line(g, 314 + i * 4, 60 + i * 40, 326, 40 + i * 40, "#ffffff"));
    // ---- focus: dim the lane the narrator isn't on ----
    const fL = cl((t - sw) / 0.6, 0, 1) * (1 - cl((t - same) / 0.6, 0, 1)), fR = (1 - cl((t - sw) / 0.6, 0, 1)) * cl((t - 0.5) / 0.6, 0, 1) * (1 - cl((t - same) / 0.6, 0, 1));
    if (fL > 0) PX.alpha(g, 0.5 * fL, () => R(g, -40, -20, 351, 400, "#05060e"));
    if (fR > 0) PX.alpha(g, 0.5 * fR, () => R(g, 329, -20, 360, 400, "#05060e"));
    // ---- hanging score signs + banner ----
    hangSign(g, 160, 138, 104, 20, PX.p(t, tl, 0.6, "lin"), t, "UNDER 40%", "#ff5c5c", { fill: "#2a0e14" });
    hangSign(g, 480, 138, 104, 20, PX.p(t, tr, 0.6, "lin"), t, "ABOVE 65%", "#3df56b", { fill: "#0e2a18" });
    if (t >= same) {
      const k = PX.p(t, same, 0.6, "back"), y = Math.round(lerp(-40, 58, k));
      R(g, 140, 0, 1, y, "#3a3e4e"); R(g, 499, 0, 1, y, "#3a3e4e");
      R(g, 128 + 3, y + 4, 384, 32, "rgba(0,0,0,0.5)"); R(g, 128, y, 384, 32, "#f7c948"); R(g, 128, y, 384, 2, "#ffe8a0"); R(g, 128, y + 30, 384, 2, "#b8901a");
      for (let i = 0; i < 4; i++) { R(g, 128 - 10, y + 4 + i * 6, 10, 3, "#d8a830"); R(g, 512, y + 4 + i * 6, 10, 3, "#d8a830"); }
      PX.text(g, "SAME TOOL. SAME TASK.", 320, y + 8, { size: 16, col: "#2a1a08", align: "center" });
      if (t - same < 0.5) PX.glow(g, 320, y + 16, 200, "rgba(247,201,72,0.8)", 0.5 * (1 - (t - same) / 0.5));
    }
    PX.particles(g, 43, 26, t, [0, 30, 640, 300], { vy: -3, vx: 1, col: "#d8e0ff", a: 0.35 });
    PX.vignette(g, 0.5);
  };

  // ================= no_map: top-down night city, the GPS line vanishes =================
  K.no_map = (o) => {
    const SX = [40, 168, 296, 424, 552], SY = [30, 130, 230, 330], HW = 9;
    // buildings per block (static layout)
    const BLD = [], r = PX.rnd(404);
    for (let i = -1; i < SX.length; i++) for (let j = -1; j < SY.length; j++) {
      const x0 = (i < 0 ? -80 : SX[i]) + HW + 3, x1 = (i + 1 < SX.length ? SX[i + 1] : 720) - HW - 3, y0 = (j < 0 ? -60 : SY[j]) + HW + 3, y1 = (j + 1 < SY.length ? SY[j + 1] : 420) - HW - 3;
      if (i === 1 && j === 1) { BLD.push({ park: 1, x0, y0, x1, y1 }); continue; }
      const river = j === 2;
      const rows = river ? [[y0, 258], [294, y1]] : y1 - y0 > 50 ? [[y0, Math.round((y0 + y1) / 2) - 1], [Math.round((y0 + y1) / 2) + 2, y1]] : [[y0, y1]];
      const PAL = ["#2e3458", "#34305a", "#283c58", "#3a3450", "#2a3048", "#4a3438", "#3a4040", "#30284a"];
      for (const [ya, yb] of rows) { let x = x0; while (x < x1 - 8) { const w = Math.min(x1 - x, 18 + Math.floor(r() * 34)); if (x1 - x - w < 12) { BLD.push({ x, y: ya, w: x1 - x, h: yb - ya, ht: 2 + Math.floor(r() * 7), col: PAL[Math.floor(r() * PAL.length)], sk: r(), ac: r() }); break; }
        BLD.push({ x, y: ya, w: w - 2, h: yb - ya, ht: 2 + Math.floor(r() * 7), col: PAL[Math.floor(r() * PAL.length)], sk: r(), ac: r() }); x += w; } }
    }
    // route: polyline + length helpers
    const ROUTE = [[90, 330], [168, 330], [168, 230], [296, 230], [296, 130], [424, 130]];
    const seg = []; let L = 0; for (let i = 1; i < ROUTE.length; i++) { const [ax, ay] = ROUTE[i - 1], [bx, by] = ROUTE[i], l = Math.abs(bx - ax) + Math.abs(by - ay); seg.push([ax, ay, bx, by, L, l]); L += l; }
    const at = (s) => { if (s <= 0) { const [ax, ay, bx, by] = seg[0], l = seg[0][5]; return [ax + ((bx - ax) * s) / l, ay + ((by - ay) * s) / l, Math.atan2(by - ay, bx - ax)]; }
      for (const [ax, ay, bx, by, s0, l] of seg) if (s <= s0 + l) { const k = (s - s0) / l; return [lerp(ax, bx, k), lerp(ay, by, k), Math.atan2(by - ay, bx - ax)]; }
      const [ax, ay, bx, by] = seg[seg.length - 1]; return [bx, by, Math.atan2(by - ay, bx - ax)]; };
    const LC = seg[2][4] + seg[2][5];   // the crossroads (296, 230) where the car gives up
    const TRAFFIC = [[0, 0, 60, "#c04a4a"], [1, 1, -50, "#d8d0c0"], [0, 3, -45, "#4a7ac0"], [1, 3, 55, "#e0b040"], [0, 1, 40, "#8a5ab0"], [1, 4, -40, "#4ab08a"]];
    const car = (g, x, y, ang, col, lights) => {
      g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(Math.round(ang / 1.5708) * 1.5708 + 1.5708);
      if (lights) { LB.cone(g, 0, -12, 4, 22, 26, "#fff0c0", 0.0); }
      R(g, -4, -7, 9, 15, "rgba(0,0,0,0.4)"); R(g, -5, -8, 9, 15, col); R(g, -5, -8, 9, 1, sh(col, 1.4)); R(g, -4, -5, 7, 4, "#1a2a3a"); R(g, -4, 2, 7, 3, "#1a2a3a"); R(g, -3, -5, 2, 1, "#5a7a9a");
      R(g, -5, -8, 2, 1, "#fff4c0"); R(g, 2, -8, 2, 1, "#fff4c0"); R(g, -5, 6, 2, 1, "#ff3a3a"); R(g, 2, 6, 2, 1, "#ff3a3a");
      g.restore();
    };
    return (g, t, d, c) => {
      const lost = T(o, "lost", 2.0, d, 4);
      const v = LC / (lost + 0.175);
      const s = t < lost ? v * t : t < lost + 0.35 ? v * lost + v * (t - lost) - (v * (t - lost) * (t - lost)) / 0.7 : LC;
      const [cx, cy, ca] = at(s), fog = PX.p(t, lost + 0.1, 1.4, "io");
      // ---- ground: blocks' sidewalks + streets ----
      PX.par(g, c, 0.92, () => {
        R(g, -60, -40, 760, 440, "#14162a");
        for (const y of SY) { R(g, -60, y - HW, 760, HW * 2, "#1c1e2e"); for (let x = -60; x < 700; x += 14) R(g, x, y, 7, 1, "#5a5a48"); }
        for (const x of SX) { R(g, x - HW, -40, HW * 2, 440, "#1c1e2e"); for (let y = -40; y < 400; y += 14) R(g, x, y, 1, 7, "#5a5a48"); }
        for (const x of SX) for (const y of SY) { R(g, x - HW, y - HW, HW * 2, HW * 2, "#1e2032"); for (let i = 0; i < 4; i++) { R(g, x - HW + 2 + i * 4, y - HW - 4, 2, 3, "#3a3c50"); R(g, x - HW + 2 + i * 4, y + HW + 1, 2, 3, "#3a3c50"); } }
        // river + bridges
        PX.vgrad(g, -60, 262, 760, 30, "1a2a5a", "203470", 4);
        for (let i = 0; i < 30; i++) { const wx = ((i * 53 + t * 12) % 760) - 60; R(g, wx, 266 + (i * 7) % 22, 6, 1, "#4a6ab0"); }
        R(g, -60, 261, 760, 1, "#2a3050"); R(g, -60, 292, 760, 1, "#2a3050");
        for (const x of SX) { R(g, x - HW - 2, 258, HW * 2 + 4, 38, "#2a2c3c"); R(g, x - HW - 2, 258, 2, 38, "#4a4c60"); R(g, x + HW, 258, 2, 38, "#4a4c60"); R(g, x - HW, 260, HW * 2, 34, "#1c1e2e"); for (let y = 262; y < 292; y += 14) R(g, x, y, 1, 7, "#5a5a48"); }
      });
      // ---- buildings + park ----
      PX.par(g, c, 1.0, () => {
        for (const b of BLD) {
          if (b.park) {
            R(g, b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, "#1e3a2a"); PX.box(g, b.x0, b.y0, b.x1 - b.x0, b.y1 - b.y0, "#2a4a34");
            PX.line(g, b.x0, b.y0 + 20, b.x1, b.y1 - 16, "#4a4a3a"); PX.line(g, b.x0 + 30, b.y1, b.x1 - 20, b.y0, "#4a4a3a");
            ell(g, b.x0 + 60, b.y0 + 44, 16, 9, "#1e3a6a"); R(g, b.x0 + 52, b.y0 + 41, 8, 1, "#4a7ad0");
            const tr = PX.rnd(9); for (let i = 0; i < 14; i++) { const tx = b.x0 + 8 + tr() * (b.x1 - b.x0 - 16), ty = b.y0 + 8 + tr() * (b.y1 - b.y0 - 16); if (Math.abs(tx - b.x0 - 60) < 20 && Math.abs(ty - b.y0 - 44) < 12) continue;
              PX.circle(g, tx + 1, ty + 2, 5, "#10200e"); PX.circle(g, tx, ty, 5, "#2a6a3a"); PX.circle(g, tx - 1, ty - 1, 3, "#3a8a4a"); R(g, tx - 2, ty - 3, 2, 1, "#5aaa6a"); }
            R(g, b.x0 + 40, b.y0 + 64, 3, 3, "#ffe2a8"); PX.glow(g, b.x0 + 41, b.y0 + 65, 14, "rgba(255,226,168,0.8)", 0.5);
            continue;
          }
          R(g, b.x + b.ht, b.y + b.ht, b.w, b.h, "#0a0b16");   // drop shadow (light from the upper-left moon)
          R(g, b.x, b.y, b.w, b.h, b.col); R(g, b.x, b.y, b.w, 1, sh(b.col, 1.45)); R(g, b.x, b.y, 1, b.h, sh(b.col, 1.25)); R(g, b.x + b.w - 1, b.y, 1, b.h, sh(b.col, 0.7)); R(g, b.x, b.y + b.h - 1, b.w, 1, sh(b.col, 0.7));
          R(g, b.x + 2, b.y + 2, b.w - 4, b.h - 4, sh(b.col, 0.92));
          if (b.ac > 0.4 && b.w > 14 && b.h > 14) { R(g, b.x + 4, b.y + 4, 6, 5, "#5a6078"); R(g, b.x + 4, b.y + 4, 6, 1, "#8a90a8"); R(g, b.x + 6, b.y + 6, 2, 1, "#2a2e3a"); }
          if (b.sk > 0.45) { const on = Math.sin(t * 0.8 + b.x) > -0.7; R(g, b.x + b.w - 9, b.y + b.h - 8, 5, 4, on ? "#f7c948" : "#4a4020"); if (on) PX.glow(g, b.x + b.w - 7, b.y + b.h - 6, 8, "rgba(247,201,72,0.6)", 0.4); }
          if (b.sk < 0.15 && b.w > 16) { PX.circle(g, b.x + b.w - 8, b.y + 8, 4, "#4a4a5a"); PX.circle(g, b.x + b.w - 9, b.y + 7, 2, "#6a6a7a"); }
          if (b.ac < 0.12) { const on = PX.blink(t + b.x * 0.01, 1.3, 0.5); R(g, b.x + 2, b.y + 2, 1, 1, on ? "#ff4a4a" : "#5a1a1a"); }
        }
        // streetlights at intersections
        for (const x of SX) for (const y of SY) { R(g, x - HW - 2, y - HW - 2, 2, 2, "#ffe2a8"); PX.glow(g, x - HW - 1, y - HW - 1, 22, "rgba(255,210,140,0.7)", 0.35); }
      });
      // ---- traffic ----
      PX.par(g, c, 1.0, () => {
        for (const [vert, k, sp, col] of TRAFFIC) {
          const p0 = ((k * 97 + t * sp) % 760 + 760) % 760 - 60, lane = sp > 0 ? 4 : -4;
          const x = vert ? SX[k] + lane : p0, y = vert ? p0 : SY[k] + lane, ang = vert ? (sp > 0 ? 1.5708 : -1.5708) : (sp > 0 ? 0 : 3.1416);
          PX.glow(g, x + Math.cos(ang) * 10, y + Math.sin(ang) * 10, 12, "rgba(255,240,190,0.7)", 0.4); car(g, x, y, ang, col);
        }
      });
      // ---- GPS line + destination ----
      const gpsOn = t < lost ? 1 : t < lost + 0.35 ? (PX.blink(t, 0.08, 0.5) ? 1 : 0) : 0;
      if (gpsOn) {
        PX.par(g, c, 1.0, () => {
          for (let ss = s + 8; ss < L; ss += 2) { const [x, y] = at(ss); R(g, x - 1, y - 1, 3, 3, "#5fe3e8"); }
          for (let ss = s + 8; ss < L; ss += 30) { const [x, y] = at(ss + ((t * 60) % 30)); PX.glow(g, x, y, 10, "rgba(95,227,232,0.9)", 0.7); R(g, x - 1, y - 1, 3, 3, "#d8fcff"); }
          const pb = Math.round(Math.sin(t * 5) * 2), [dx, dy] = ROUTE[ROUTE.length - 1];
          PX.glow(g, dx, dy - 8, 20, "rgba(242,92,168,0.9)", 0.7); PX.circle(g, dx, dy - 12 + pb, 6, "#f25ca8"); PX.circle(g, dx, dy - 12 + pb, 2, "#ffe0f0"); for (let i = 0; i < 5; i++) R(g, dx - 2 + i * 0.5, dy - 6 + pb + i, 5 - i, 1, "#f25ca8");
        });
      }
      // ---- our car ----
      PX.par(g, c, 1.0, () => {
        PX.glow(g, cx + Math.cos(ca) * 14, cy + Math.sin(ca) * 14, 22, "rgba(255,240,190,0.9)", t > lost + 0.35 ? 0.4 : 0.6);
        car(g, cx, cy, ca, "#f0a030");
        if (t > lost + 0.35) { const bl = PX.blink(t, 0.6); R(g, cx - 6, cy - 6, 2, 2, bl ? "#ffb030" : "#5a3a10"); R(g, cx + 5, cy - 6, 2, 2, bl ? "#ffb030" : "#5a3a10"); }
      });
      // ---- fog over the streets you can't see ----
      if (fog > 0) {
        PX.par(g, c, 1.12, () => {
          const fr = PX.rnd(5);
          for (let i = 0; i < 90; i++) { const fx = fr() * 760 - 60 + Math.sin(t * 0.4 + i) * 10 + t * 4, fy = fr() * 420 - 30, rr = 22 + fr() * 18;
            const dist = Math.hypot(fx - cx, fy - cy), a = fog * cl((dist - 40) / 60, 0, 1) * 0.65;
            if (a > 0.02) PX.alpha(g, a, () => { PX.circle(g, fx, fy, rr, i % 2 ? "#3a3858" : "#34324e"); PX.circle(g, fx - 4, fy - 4, Math.round(rr * 0.6), "#44426a"); }); }
        });
      }
      if (fog > 0) {   // dark veil: only the crossroads around the car stays visible
        const gr = g.createRadialGradient(cx, cy, 36, cx, cy, 150); gr.addColorStop(0, "rgba(16,14,30,0)"); gr.addColorStop(1, `rgba(16,14,30,${0.82 * fog})`);
        g.fillStyle = gr; g.fillRect(-60, -40, 760, 440);
      }
      // ---- wisps of cloud above the city (top layer) ----
      PX.par(g, c, 1.25, () => { for (let i = 0; i < 4; i++) { const wx = ((i * 190 + t * 9) % 820) - 120; PX.alpha(g, 0.12, () => { R(g, wx, 60 + i * 80, 90, 6, "#8a90c0"); R(g, wx + 14, 56 + i * 80, 50, 4, "#8a90c0"); }); } });
      // ---- "?" + NO MAP ----
      if (t > lost + 0.4) {
        const k = PX.p(t, lost + 0.4, 0.3, "back"), bx = cx + 12, by = cy - 30 + Math.round(Math.sin(t * 3) * 1.5);
        PX.zoom(g, Math.max(0.05, k), bx, by + 10, () => { R(g, bx - 9, by - 1, 20, 20, "#0e1018"); R(g, bx - 8, by, 18, 18, "#f0ece0"); for (let i = 0; i < 4; i++) R(g, bx - 6 + i, by + 18 + i, 4 - i, 1, "#f0ece0"); PX.text(g, "?", bx + 1, by + 2, { size: 16, col: "#2a2030", align: "center" }); });
      }
      // HUD panel
      const hx = 240, hy = 14;
      R(g, hx - 2, hy - 2, 164, 32, "#05060a"); R(g, hx, hy, 160, 28, "#101624"); PX.box(g, hx, hy, 160, 28, t > lost ? "#ff5c5c" : "#3a8ab0");
      if (t < lost) {
        R(g, hx + 8, hy + 7, 14, 14, "#1a2a3a"); PX.line(g, hx + 15, hy + 9, hx + 15, hy + 19, "#5fe3e8"); PX.line(g, hx + 12, hy + 12, hx + 15, hy + 9, "#5fe3e8"); PX.line(g, hx + 18, hy + 12, hx + 15, hy + 9, "#5fe3e8");
        R(g, hx + 30, hy + 12, 120, 4, "#1a2a3a"); R(g, hx + 30, hy + 12, Math.round(120 * cl(s / L, 0, 1)), 4, "#5fe3e8");
      } else {
        const fl = PX.blink(t, 0.5, 0.7);
        R(g, hx + 8, hy + 7, 16, 14, "#3a2a2a"); R(g, hx + 9, hy + 8, 4, 12, "#6a5a4a"); R(g, hx + 14, hy + 8, 4, 12, "#7a6a5a"); R(g, hx + 19, hy + 8, 4, 12, "#6a5a4a");
        PX.line(g, hx + 7, hy + 6, hx + 24, hy + 22, "#ff5c5c"); PX.line(g, hx + 8, hy + 6, hx + 25, hy + 22, "#ff5c5c");
        PX.text(g, "NO MAP", hx + 92, hy + 7, { size: 16, col: fl ? "#ff6a6a" : "#a03a3a", align: "center" });
        if (t - lost < 0.4) PX.glow(g, hx + 80, hy + 14, 90, "rgba(255,92,92,0.8)", 0.6 * (1 - (t - lost) / 0.4));
      }
      PX.vignette(g, 0.55);
    };
  };
})();
