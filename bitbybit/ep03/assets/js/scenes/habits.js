/* EP3 Builder F scenes (objection + habits): moral_panic, compiler, new_hire, spot_diff, explain_aloud, guess_first,
   autopilot, assistants_off. Full environments, 3+ depth layers, glow + vignette, native-res characters.
   Reuses PX.learn (person, outlined, cone, limb, sweat) and PX.core (skyline, mug) at draw time. */
(function () {
  const { K } = PX;
  const R = PX.rect, G = PX.glow, cl = PX.clamp, lerp = PX.lerp;
  let L = null;                                   // PX.learn, grabbed when a kind is built (learn.js loads after this file)
  const need = () => (L = PX.learn);

  // ---------- helpers ----------
  const T = (o, k, def, d, typ) => (o[k] !== undefined ? o[k] : Array.isArray(def) ? def.map((v) => (v * d) / typ) : (def * d) / typ);
  const SHC = {};
  const sh = (hex, f) => {
    const k = hex + f; if (SHC[k]) return SHC[k];
    const n = parseInt(hex.slice(1), 16), m = (v) => Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1));
    return (SHC[k] = "#" + [m(n >> 16), m((n >> 8) & 255), m(n & 255)].map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join(""));
  };
  const ell = (g, cx, cy, rx, ry, col) => {
    g.fillStyle = col;
    for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
  };
  const A = (g, a, fn) => PX.alpha(g, a, fn);
  const pop = (t, t0, dd) => PX.p(t, t0, dd || 0.35, "back");
  const frac = (x) => x - Math.floor(x);
  const thick = (g, x1, y1, x2, y2, w, col) => {
    const n = Math.max(1, Math.round(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)))), o = Math.floor(w / 2);
    for (let i = 0; i <= n; i++) R(g, Math.round(x1 + ((x2 - x1) * i) / n) - o, Math.round(y1 + ((y2 - y1) * i) / n) - o, w, w, col);
  };
  const tick = (g, x, y, s, col) => { const w = Math.max(2, Math.round(s / 5)); thick(g, x, y + s * 0.55, x + s * 0.35, y + s * 0.9, w, col); thick(g, x + s * 0.35, y + s * 0.9, x + s, y + s * 0.1, w, col); };
  const cross = (g, x, y, s, col) => { const w = Math.max(2, Math.round(s / 5)); thick(g, x, y, x + s, y + s, w, col); thick(g, x + s, y, x, y + s, w, col); };
  const clip = (g, x, y, w, h, fn) => { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); };
  const clipC = (g, cx, cy, r, fn) => { g.save(); g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.clip(); fn(); g.restore(); };
  // light that flicks on at t0 (0 before, flicker, then 1)
  const flick = (t, t0) => { if (t < t0) return 0; const k = t - t0; if (k > 0.32) return 1; return [1, 0.15, 0.9, 0.2, 1, 0.6, 1][Math.floor(k * 22)] || 1; };
  // speech/label plate with a pointer
  const bubble = (g, x, y, w, h, tx, ty, fill, edge) => {
    R(g, x + 2, y, w - 4, h, edge); R(g, x, y + 2, w, h - 4, edge); R(g, x + 1, y + 1, w - 2, h - 2, edge);
    R(g, x + 2, y + 1, w - 4, h - 2, fill); R(g, x + 1, y + 2, w - 2, h - 4, fill);
    if (tx !== undefined) { const bx = cl(tx, x + 6, x + w - 10), up = ty < y; for (let i = 0; i < 6; i++) { const yy = up ? y - i : y + h - 1 + i, ww = Math.max(1, 6 - i); R(g, bx + (tx > bx ? i : 0), yy, ww + 2, 1, edge); R(g, bx + 1 + (tx > bx ? i : 0), yy - (up ? -1 : 1), ww, 1, fill); } }
  };
  // stamped label: outlined text that pops in with overshoot
  const label = (g, str, x, y, t, t0, o) => {
    if (t < t0) return; const k = pop(t, t0, 0.3), sz = (o && o.size) || 8;
    A(g, cl((t - t0) * 6, 0, 1), () => PX.otext(g, str, x, y + Math.round((1 - k) * 6), { size: sz, align: "center", col: (o && o.col) || "#f7c948", font: o && o.font }));
  };
  const plate = (g, str, x, y, t, t0, col, o) => {     // label on a dark pill, centred at x
    if (t < t0) return; o = o || {}; const sz = o.size || 8, k = pop(t, t0, 0.3);
    const w = Math.round(PX.tw(g, str, { size: sz, font: o.font }) + 14), h = sz + 9, yy = y + Math.round((1 - k) * 8);
    A(g, cl((t - t0) * 6, 0, 1), () => { R(g, x - w / 2 + 1, yy + 2, w, h, "rgba(0,0,0,.5)"); bubble(g, x - w / 2, yy, w, h, undefined, 0, o.fill || "#141a2e", col);
      PX.text(g, str, x, yy + 5 - (o.font === "v" ? 2 : 0), { size: sz, align: "center", col, font: o.font }); });
  };

  // ---- the AI agent: rounded cyan-grey box head, big square eyes, antenna with a pink LED ----
  // (cx, cy) = head centre, w = head width. o: eyes "normal"|"happy"|"wide"|"closed", mouth "grin"|"smile"|"o"|"flat"|"none", look, tie
  const bot = (g, cx, cy, w, t, o) => {
    o = o || {}; cx = Math.round(cx); cy = Math.round(cy);
    const h = Math.round(w * 0.8), x = cx - Math.round(w / 2), y = cy - Math.round(h / 2);
    const B = "#8fb3c2", HL = "#c6e3ec", SD = "#5d8091", DK = "#3a5566", OUT = "#141c28";
    // antenna
    R(g, cx - 1, y - 9, 2, 9, DK); R(g, cx - 1, y - 9, 1, 9, SD);
    const led = PX.blink(t + (o.ph || 0), 1.1, 0.6) ? "#ff7ac0" : "#a83a72";
    PX.circle(g, cx, y - 11, 3, OUT); PX.circle(g, cx, y - 11, 2, led); R(g, cx - 1, y - 12, 1, 1, "#ffd0e8");
    G(g, cx, y - 11, 10, "rgba(242,92,168,0.8)", led === "#ff7ac0" ? 0.9 : 0.3);
    // ear bolts
    for (const s of [-1, 1]) { const ex = s < 0 ? x - 4 : x + w; R(g, ex, cy - 5, 4, 10, OUT); R(g, ex + (s < 0 ? 1 : 0), cy - 4, 3, 8, SD); R(g, ex + (s < 0 ? 1 : 0), cy - 4, 3, 1, HL); }
    // head body with outline + rounded corners
    const rr = (xx, yy, ww, hh, col, c) => { R(g, xx + c, yy, ww - 2 * c, hh, col); R(g, xx, yy + c, ww, hh - 2 * c, col); if (c > 1) R(g, xx + 1, yy + 1, ww - 2, hh - 2, col); };
    rr(x - 1, y - 1, w + 2, h + 2, OUT, 4); rr(x, y, w, h, B, 4);
    R(g, x + 3, y + 1, w - 6, 2, HL); R(g, x + 1, y + 3, 2, h - 8, HL);
    R(g, x + 3, y + h - 3, w - 6, 2, SD); R(g, x + w - 3, y + 4, 2, h - 8, SD);
    // face screen
    const fx = x + Math.round(w * 0.12), fy = y + Math.round(h * 0.16), fw = w - 2 * Math.round(w * 0.12), fh = Math.round(h * 0.66);
    rr(fx, fy, fw, fh, "#16222e", 2); R(g, fx + 2, fy + 1, fw - 4, 1, "#22344a");
    const es = Math.max(3, Math.round(w * 0.17)), lk = Math.round(o.look || 0), ey = fy + Math.round(fh * 0.22), E = "#6ff0f2";
    const eye = (exx) => {
      const ev = o.eyes || "normal";
      if (ev === "happy") { for (let i = 0; i < es; i++) { const dy = Math.round(Math.abs(i - (es - 1) / 2) * 0.9); R(g, exx + i, ey + dy + 1, 1, 2, E); } }
      else if (ev === "closed" || (ev === "normal" && PX.blink(t + (o.ph || 0) * 1.7, 3.3, 0.05))) R(g, exx, ey + Math.round(es / 2), es, 1, E);
      else if (ev === "wide") { R(g, exx - 1, ey - 1, es + 2, es + 2, E); R(g, exx + 1, ey + 1, es - 2, es - 2, "#16222e"); R(g, exx + Math.round(es / 2) - 1, ey + Math.round(es / 2) - 1, 2, 2, E); }
      else { R(g, exx, ey, es, es, E); R(g, exx, ey, Math.max(1, es - 2), 1, "#d6ffff"); }
    };
    eye(cx - Math.round(fw * 0.27) - Math.round(es / 2) + lk); eye(cx + Math.round(fw * 0.27) - Math.round(es / 2) + lk);
    const my = ey + es + Math.max(2, Math.round(fh * 0.12)), mo = o.mouth || "smile";
    if (mo === "grin") { const mw = Math.round(fw * 0.62); R(g, cx - mw / 2, my, mw, 1, E); for (let i = 0; i < mw; i++) { const k = (i - mw / 2) / (mw / 2), dy = Math.round((1 - k * k) * Math.max(2, fh * 0.18)); R(g, cx - mw / 2 + i, my, 1, dy + 1, E); }
      R(g, cx - mw / 2 + 2, my + 1, mw - 4, 1, "#d6ffff"); }
    else if (mo === "smile") { const mw = Math.round(fw * 0.36); R(g, cx - mw / 2 + 1, my + 1, mw - 2, 1, E); R(g, cx - mw / 2, my, 1, 1, E); R(g, cx + mw / 2 - 1, my, 1, 1, E); }
    else if (mo === "o") { R(g, cx - 2, my - 1, 4, 4, E); R(g, cx - 1, my, 2, 2, "#16222e"); }
    else if (mo === "flat") R(g, cx - 4, my, 8, 1, E);
    G(g, cx, fy + fh / 2, w * 0.7, "rgba(95,227,232,0.35)", 0.6);
    if (o.tie) { const ty = y + h + 1; R(g, cx - 5, ty, 10, 3, "#e8eef2"); R(g, cx - 2, ty, 4, 3, "#d03a4a"); R(g, cx - 3, ty + 3, 6, 2, "#d03a4a"); R(g, cx - 2, ty + 5, 4, 6, "#d03a4a"); R(g, cx - 1, ty + 11, 2, 1, "#d03a4a"); R(g, cx - 2, ty + 3, 1, 8, "#ff6070"); }
    return { x, y, w, h, fy, fh };
  };

  // dev (viewer stand-in): green hoodie, medium-brown skin, dark messy hair, headphones around the neck
  const DEV = { skin: "#a86b3c", hair: "#1d1410", hairStyle: "spiky", shirt: "#3f9a52", pants: "#2a2f45", shoe: "#1c1c26" };
  const headphones = (g, P) => {
    const x = P.hx, y = P.ty - 1, w = P.hw + 4;
    R(g, x - w / 2, y - 2, w, 2, "#20232c"); R(g, x - w / 2 + 2, y - 2, w - 4, 1, "#3a3f4e");
    for (const s of [-1, 1]) { const cx = s < 0 ? x - w / 2 - 2 : x + w / 2 - 3; R(g, cx, y - 3, 5, 6, "#2a2e3a"); R(g, cx + 1, y - 3, 3, 1, "#5a6070"); R(g, cx + 1, y + 1, 3, 1, "#3df56b"); }
  };

  // crumpled paper ball
  const paperBall = (g, x, y) => { PX.circle(g, x, y, 3, "#cfd2d8"); R(g, x - 2, y - 2, 2, 1, "#f0f2f6"); R(g, x, y, 2, 1, "#9aa0ac"); R(g, x - 1, y + 2, 3, 1, "#8a909c"); R(g, x + 1, y - 1, 1, 1, "#9aa0ac"); };

  // =============================================================================================
  // moral_panic: museum gallery of old panics. o.at = [calculator, compiler, forum] light-up times, o.pan (true): internal
  // dolly that follows the lit exhibit (parallax); timeline cam.x adds more parallax on top.
  // =============================================================================================
  K.moral_panic = (o) => {
    need();
    const MOON = "#8fa8ff";
    // newspaper in a gold frame, centre x, top y; lit 0..1
    const paper = (g, cx, y, lit, kind, t) => {
      const w = 108, h = 74, x = cx - w / 2;
      R(g, x + 3, y + 4, w, h, "rgba(0,0,0,.45)");
      const F = lit > 0.5 ? ["#f0c860", "#c8963a", "#8a6224"] : ["#5a4a30", "#463a26", "#30281a"];
      R(g, x, y, w, h, F[1]); R(g, x, y, w, 1, F[0]); R(g, x, y, 1, h, F[0]); R(g, x, y + h - 1, w, 1, F[2]); R(g, x + w - 1, y, 1, h, F[2]);
      R(g, x + 3, y + 3, w - 6, h - 6, F[2]); R(g, x + 4, y + 4, w - 8, h - 8, F[0]);
      const P = lit > 0.5 ? "#d9d1b6" : "#3a3a44", INK = lit > 0.5 ? "#26222a" : "#22222c", GR = lit > 0.5 ? "#9a937c" : "#2c2c36";
      R(g, x + 5, y + 5, w - 10, h - 10, P);
      if (lit > 0.5) { R(g, x + 5, y + 5, w - 10, 1, "#ece6cf"); R(g, x + w - 10, y + 12, 4, h - 18, "#ccc4a8"); }
      PX.text(g, "THE MORNING PAPER", cx, y + 6, { font: "v", size: 10, col: INK, align: "center" });
      R(g, x + 8, y + 15, w - 16, 1, INK); R(g, x + 8, y + 17, w - 16, 1, GR);
      PX.text(g, "WILL ROT", cx, y + 21, { size: 8, col: lit > 0.5 ? "#8a1e1e" : INK, align: "center" });
      PX.text(g, "OUR BRAINS!", cx, y + 31, { size: 8, col: lit > 0.5 ? "#8a1e1e" : INK, align: "center" });
      // picture + columns
      const px0 = x + 9, py0 = y + 43;
      R(g, px0, py0, 32, 22, lit > 0.5 ? "#7a7462" : "#2c2c36"); R(g, px0 + 1, py0 + 1, 30, 20, lit > 0.5 ? "#a8a08a" : "#30303a");
      const ic = lit > 0.5 ? "#4a4436" : "#26262e";
      if (kind === 0) { R(g, px0 + 10, py0 + 3, 12, 16, ic); R(g, px0 + 12, py0 + 5, 8, 3, "#8a9a7a"); for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) R(g, px0 + 12 + i * 3, py0 + 10 + j * 3, 2, 2, lit > 0.5 ? "#a8a08a" : "#30303a"); }
      else if (kind === 1) { R(g, px0 + 5, py0 + 6, 22, 13, ic); R(g, px0 + 7, py0 + 3, 9, 4, ic); R(g, px0 + 9, py0 + 9, 14, 2, lit > 0.5 ? "#a8a08a" : "#30303a"); }
      else { R(g, px0 + 7, py0 + 3, 18, 14, ic); R(g, px0 + 9, py0 + 5, 14, 9, lit > 0.5 ? "#8aa0a0" : "#30303a"); R(g, px0 + 13, py0 + 17, 6, 3, ic); }
      for (let i = 0; i < 7; i++) { R(g, x + 46, y + 44 + i * 3, w - 56 - (i % 3) * 4, 1, GR); }
      R(g, x + 9, y + 67, w - 18, 1, GR);
      if (lit > 0.5) G(g, cx, y + h / 2, 70, "rgba(255,214,150,0.35)", lit);
    };
    const calc = (g, cx, by, lit, t) => {        // ~56 x 74 desk calculator on a little easel, base at by
      const w = 56, h = 72, x = cx - w / 2, y = by - h;
      const Bd = lit ? ["#5c6272", "#434958", "#2c303c"] : ["#262836", "#1e202c", "#16161f"];
      R(g, cx - 18, by - 6, 36, 6, lit ? "#3a2c22" : "#16121a");
      R(g, x - 1, y - 1, w + 2, h + 2, "#0c0c14"); R(g, x, y, w, h, Bd[1]); R(g, x, y, w, 2, Bd[0]); R(g, x, y, 2, h, Bd[0]); R(g, x + w - 2, y, 2, h, Bd[2]); R(g, x, y + h - 2, w, 2, Bd[2]);
      // solar strip + LCD
      R(g, x + 30, y + 5, 20, 5, lit ? "#3a3048" : "#1a1822"); for (let i = 0; i < 4; i++) R(g, x + 31 + i * 5, y + 6, 4, 3, lit ? "#5a4a6e" : "#1e1c26");
      R(g, x + 5, y + 13, w - 10, 14, "#14181a"); R(g, x + 6, y + 14, w - 12, 12, lit ? "#8fb27a" : "#1e2620");
      if (lit && PX.blink(t, 0.9)) R(g, x + w - 13, y + 17, 4, 7, "#2a3a26");
      if (lit) R(g, x + 6, y + 14, w - 12, 1, "#b8d6a0");
      const KC = [["#ff8a5c", "#c0583a"], ["#9aa2b4", "#6a7284"], ["#e05a5a", "#a03030"]];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) {
        const kc = c === 3 ? KC[0] : r === 0 && c === 0 ? KC[2] : KC[1], kx = x + 5 + c * 12, ky = y + 32 + r * 9;
        R(g, kx, ky, 10, 7, lit ? kc[1] : "#14141c"); R(g, kx, ky, 10, 6, lit ? kc[0] : "#1c1c26"); if (lit) R(g, kx + 1, ky, 8, 1, sh(kc[0], 1.3));
      }
      return { x, y, w, h };
    };
    const machine = (g, cx, by, lit, t) => {     // punch-card "COMPILER" machine, ~84 x 70, base at by
      const w = 84, h = 58, x = cx - w / 2, y = by - h;
      const M = lit ? ["#b8b088", "#948c68", "#6a644a"] : ["#2c2a26", "#24221e", "#1a1916"];
      // hopper with card stack (top-left)
      R(g, x + 6, y - 16, 30, 17, lit ? "#5a5440" : "#1a1916"); R(g, x + 8, y - 14, 26, 14, lit ? "#e0d4a8" : "#2a2824");
      for (let i = 0; i < 6; i++) R(g, x + 8, y - 13 + i * 2, 26, 1, lit ? "#b8ab80" : "#22201c");
      // output tray (right)
      R(g, x + w - 4, y + 18, 18, 4, M[2]); R(g, x + w - 4, y + 16, 18, 2, M[0]);
      R(g, x - 1, y - 1, w + 2, h + 2, "#0c0c10"); R(g, x, y, w, h, M[1]); R(g, x, y, w, 2, M[0]); R(g, x, y, 2, h, M[0]); R(g, x + w - 3, y, 3, h, M[2]); R(g, x, y + h - 3, w, 3, M[2]);
      R(g, x + 4, y + 12, w - 8, 3, "#14140f");                       // card slot
      // card gliding out of the slot to the tray
      if (lit) { const k = frac(t * 0.5); if (k < 0.7) { const cxx = x + 10 + k / 0.7 * (w - 4); R(g, cxx, y + 13 - Math.round(k * 2), 22, 4, "#c8bc94"); for (let i = 0; i < 5; i++) R(g, cxx + 2 + i * 4, y + 14 - Math.round(k * 2), 1, 1, "#4a4436"); } }
      // stacked output cards
      for (let i = 0; i < 4; i++) R(g, x + w - 2, y + 15 - i, 16, 1, lit ? (i % 2 ? "#d6caa0" : "#e8dcb0") : "#2a2824");
      // nameplate + lamps + crank
      R(g, x + 12, y + 24, w - 24, 13, "#1a1812"); R(g, x + 13, y + 25, w - 26, 11, lit ? "#2a2418" : "#141410");
      PX.text(g, "COMPILER", cx, y + 27, { size: 8, col: lit ? "#f7c948" : "#3a3420", align: "center" });
      for (let i = 0; i < 5; i++) { const on = lit && PX.blink(t + i * 0.37, 0.8 + i * 0.13, 0.5); R(g, x + 14 + i * 13, y + 43, 5, 4, on ? ["#ff5c5c", "#f7c948", "#3df56b", "#5fe3e8", "#f7c948"][i] : lit ? "#3a3626" : "#18170f");
        if (on) G(g, x + 16 + i * 13, y + 45, 6, "rgba(255,220,140,0.6)", 0.6); }
      R(g, x + 4, y + h - 8, w - 8, 2, M[2]);
      return { x, y, w, h };
    };
    const monitor = (g, cx, by, lit, t) => {      // beige CRT with a Q&A forum page, ~66 x 60, base at by
      const w = 68, h = 54, x = cx - w / 2, y = by - h - 8;
      const M = lit ? ["#cfc4a4", "#b0a584", "#867c60"] : ["#2a2824", "#22201c", "#191814"];
      R(g, cx - 16, by - 8, 32, 8, M[2]); R(g, cx - 10, by - 10, 20, 3, M[1]);
      R(g, x - 1, y - 1, w + 2, h + 2, "#0c0c10"); R(g, x, y, w, h, M[1]); R(g, x, y, w, 2, M[0]); R(g, x, y, 2, h, M[0]); R(g, x + w - 2, y, 2, h, M[2]); R(g, x, y + h - 4, w, 4, M[2]);
      const sx = x + 5, sy = y + 5, sw = w - 10, shh = h - 14;
      R(g, sx - 1, sy - 1, sw + 2, shh + 2, "#14140f"); R(g, sx, sy, sw, shh, lit ? "#1e2c34" : "#121418");
      if (lit) {
        clip(g, sx, sy, sw, shh, () => {
          R(g, sx, sy, sw, 7, "#2a7a86"); PX.text(g, "Q&A FORUM", sx + 2, sy - 1, { font: "v", size: 10, col: "#e6f4f0" });
          const sc = Math.floor(t * 1.2) % 3;
          for (let i = 0; i < 4; i++) { const ry = sy + 10 + i * 9 - sc;
            R(g, sx + 2, ry + 1, 3, 1, "#7ad0a0"); R(g, sx + 3, ry, 1, 1, "#7ad0a0"); R(g, sx + 2, ry + 4, 3, 1, "#5a6a74"); R(g, sx + 3, ry + 5, 1, 1, "#5a6a74");
            R(g, sx + 8, ry, sw - 12 - (i * 7) % 13, 2, i === 0 ? "#c8dce0" : "#6a8a94"); R(g, sx + 8, ry + 3, sw - 18 - (i * 5) % 9, 1, "#4a6470");
            if (i === 1) { R(g, sx + sw - 6, ry, 1, 2, "#3df56b"); R(g, sx + sw - 5, ry + 2, 1, 1, "#3df56b"); R(g, sx + sw - 4, ry - 1, 1, 3, "#3df56b"); } }
        });
        R(g, sx, sy, sw, 1, "rgba(255,255,255,.12)"); G(g, cx, sy + shh / 2, 40, "rgba(95,200,220,0.4)", 0.8);
      }
      R(g, x + w - 9, y + h - 3, 3, 2, lit ? "#3df56b" : "#1a1a14");
      // keyboard in front
      R(g, cx - 26, by - 4, 52, 5, lit ? "#a89e80" : "#1c1b17"); for (let i = 0; i < 12; i++) R(g, cx - 24 + i * 4, by - 3, 3, 1, lit ? "#e0d8bc" : "#24231e");
      return { x, y, w, h };
    };
    return (g, t, d, c) => {
      const at = T(o, "at", [0.5, 4.0, 6.5], d, 11.0), pan = o.pan !== false;
      const lit = at.map((a) => flick(t, a));
      const OX = pan ? PX.KF([[0, -58], [at[0] + 0.6, -58], [at[1] - 0.3, -58], [at[1] + 0.9, 0], [at[2] - 0.3, 0], [at[2] + 0.9, 58], [at[2] + 2.4, 58], [at[2] + 4.2, 0]], t) : 0;
      const lay = (dep, fn) => PX.par(g, c, dep, () => { g.translate(Math.round(-OX * dep), 0); fn(); });
      const EX = [160, 320, 480];
      // ---- far: ceiling skylight + back galleries through arches (depth 0.35)
      lay(0.35, () => {
        PX.vgrad(g, -120, 0, 880, 60, "0a0c1a", "141630", 5);
        // long skylight with moonlit panes
        R(g, -120, 8, 880, 18, "#0e1124");
        for (let i = -6; i < 30; i++) { const sx = i * 32; R(g, sx + 2, 10, 28, 14, "#1c2448"); R(g, sx + 3, 11, 26, 6, "#26305e"); R(g, sx + 4, 11, 8, 1, "#3a4682"); }
        PX.particles(g, 3, 20, t, [-100, 10, 840, 14], { vy: 0, vx: 1, col: "#cdd8ff", a: 0.6, tw: 1.4 });
      });
      lay(0.55, () => {
        // back wall
        PX.vgrad(g, -140, 26, 920, 236, "1d1b38", "121226", 9);
        for (let y = 40; y < 192; y += 12) for (let x = -140 + ((y / 12) % 2) * 8; x < 780; x += 16) { R(g, x, y, 1, 3, "#232046"); R(g, x - 1, y + 1, 3, 1, "#232046"); }
        R(g, -140, 26, 920, 4, "#2a2850"); R(g, -140, 30, 920, 2, "#0c0c1c");     // crown moulding
        R(g, -140, 196, 920, 3, "#2c2a4e"); R(g, -140, 199, 920, 63, "#17162e");    // wainscot
        for (let x = -140; x < 780; x += 46) { R(g, x + 4, 204, 38, 52, "#1b1a36"); R(g, x + 4, 204, 38, 1, "#25244a"); R(g, x + 4, 255, 38, 1, "#0f0f20"); }
        // arches at both ends into further dark galleries
        for (const ax of [14, 626]) {
          R(g, ax - 34, 70, 68, 192, "#2a2850"); R(g, ax - 30, 74, 60, 188, "#07070f"); PX.circle(g, ax, 78, 30, "#2a2850"); PX.circle(g, ax, 78, 26, "#07070f");
          PX.vgrad(g, ax - 26, 70, 52, 192, "0a0a16", "141428", 5);
          // distant exhibit under its own little spotlight
          L.cone(g, ax, 96, 4, 26, 110, "#ffd9a0", 0.35); R(g, ax - 8, 196, 16, 50, "#1c1a30"); R(g, ax - 6, 184, 12, 12, "#3a3450"); R(g, ax - 6, 184, 12, 1, "#8a7a6a");
          R(g, ax - 26, 246, 52, 16, "#0d0d1a");
        }
        // EXIT sign over the right arch
        R(g, 610, 30, 32, 12, "#0c1a10"); PX.text(g, "EXIT", 626, 32, { size: 8, col: "#3df56b", align: "center" }); G(g, 626, 36, 26, "rgba(61,245,107,0.5)", 0.7);
        // a night guard's torch sweeping in the far left gallery
        const gx = 14 + Math.sin(t * 0.55) * 14; G(g, gx, 200, 22, "rgba(255,240,190,0.5)", 0.6); R(g, gx - 1, 180, 3, 16, "#06060c");
        // security camera blinking
        R(g, 556, 36, 14, 7, "#2c2e3e"); R(g, 566, 34, 6, 4, "#22242e"); R(g, 556, 36, 14, 1, "#4a4e66");
        if (PX.blink(t, 1.4, 0.3)) { R(g, 557, 39, 2, 2, "#ff5c5c"); G(g, 558, 40, 6, "rgba(255,90,90,0.8)", 0.8); }
      });
      // ---- moonlight wash from the skylight
      G(g, 320 - OX * 0.4, 30, 300, "rgba(110,130,220,0.16)", 1);
      // ---- main layer: frames, pedestals, exhibits, floor (depth 1)
      lay(1, () => {
        // floor: dark polished stone with plank seams and reflections
        PX.vgrad(g, -160, 262, 960, 98, "1a1830", "0d0c1a", 6);
        R(g, -160, 262, 960, 2, "#2e2c50");
        for (let i = 0; i < 6; i++) { const yy = 268 + i * i * 3 + i * 4; R(g, -160, yy, 960, 1, "#141326"); }
        for (let x = -160; x < 800; x += 58) PX.line(g, x, 264, x + (x - 320) * 0.9, 360, "#151428");
        EX.forEach((ex, i) => {
          const k = lit[i];
          // spotlight beam from the ceiling track
          R(g, ex - 5, 26, 10, 6, "#2a2c3c"); R(g, ex - 3, 32, 6, 4, k ? "#ffe2a8" : "#3a3a48");
          if (k) { L.cone(g, ex, 36, 6, 104, 226, "#ffd9a0", 0.42 * k); G(g, ex, 170, 90, "rgba(255,200,130,0.35)", k); }
          paper(g, ex, 48, k, i, t);
          // pedestal
          const px = ex - 34;
          R(g, px - 2, 196, 72, 6, k ? "#3a3450" : "#1a1828"); R(g, px - 2, 196, 72, 1, k ? "#8a7ea8" : "#2a2840");
          R(g, px, 202, 68, 60, k ? "#2a2640" : "#151424"); R(g, px, 202, 3, 60, k ? "#4a4468" : "#1c1a2e"); R(g, px + 64, 202, 4, 60, "#0e0d1a");
          R(g, px + 22, 222, 24, 9, k ? "#a88a4a" : "#2a2418"); R(g, px + 23, 223, 22, 7, k ? "#d8b060" : "#30281a");
          for (let j = 0; j < 3; j++) R(g, px + 26, 225 + j * 2, 16 - j * 4, 1, k ? "#7a5e2a" : "#221c12");
          // reflection of the pedestal + light pool on the floor
          A(g, 0.25, () => { R(g, px, 264, 68, 26, k ? "#2a2640" : "#151424"); });
          if (k) { A(g, 0.5 * k, () => ell(g, ex, 270, 60, 7, "#3a3048")); G(g, ex, 268, 70, "rgba(255,200,130,0.22)", k); }
          // the exhibit
          if (i === 0) calc(g, ex, 196, k > 0.5, t);
          else if (i === 1) machine(g, ex, 196, k > 0.5, t);
          else monitor(g, ex, 196, k > 0.5, t);
          if (k) PX.particles(g, 30 + i, 14, t, [ex - 40, 60, 80, 130], { vy: -3, vx: 1.5, col: "#ffe8c0", a: 0.7 * k });
        });
      });
      // ---- foreground: velvet ropes + brass stanchions (depth 1.35) and dark pillars at the edges (depth 1.7)
      lay(1.35, () => {
        const posts = [-60, 40, 160, 280, 400, 520, 640, 740];
        for (let i = 0; i < posts.length - 1; i++) { const a = posts[i], b = posts[i + 1], sw = Math.sin(t * 1.3 + i) * 1.2;
          for (let x = a + 4; x < b; x++) { const k = (x - a) / (b - a), yy = 300 + Math.sin(k * Math.PI) * (14 + sw); R(g, x, yy, 1, 3, "#7a1830"); R(g, x, yy, 1, 1, "#c03050"); } }
        posts.forEach((x) => { R(g, x - 2, 296, 5, 50, "#8a6a2a"); R(g, x - 2, 296, 1, 50, "#e8c060"); R(g, x + 2, 296, 1, 50, "#5a4418");
          PX.circle(g, x, 294, 4, "#c09a40"); R(g, x - 2, 291, 2, 2, "#ffe08a"); ell(g, x, 347, 11, 3, "#6a5020"); R(g, x - 9, 345, 18, 1, "#c09a40"); });
      });
      lay(1.25, () => {     // marble columns framing the shot
        for (const px of [-96, 736]) { const s = px < 0 ? 1 : -1;
          R(g, px - 30, 0, 60, 360, "#181630"); for (let i = -24; i <= 24; i += 8) R(g, px + i, 0, 2, 360, "#100f22");
          R(g, px + s * 28, 0, 2, 360, "#3a3660"); R(g, px + s * 26, 0, 1, 360, "#26244a");
          R(g, px - 34, 0, 68, 14, "#22203e"); R(g, px - 34, 14, 68, 2, "#3a3660"); R(g, px - 34, 330, 68, 30, "#22203e"); R(g, px - 34, 330, 68, 1, "#3a3660"); }
      });
      PX.vignette(g, 0.55);
    };
  };

  // =============================================================================================
  // compiler: a clean factory machine stamps identical code blocks into identical boxes, forever. o.per (1.25) stamp
  // period, o.start (1) first counter value. Bored worker naps beside a "NO NEED TO CHECK" sign.
  // =============================================================================================
  K.compiler = (o) => {
    need();
    const P = o.per || 1.25, S = 80, MX = 320;
    const box = (g, x, y) => {             // identical output box, 30 x 22, bottom-left at (x, y)
      R(g, x, y - 22, 30, 22, "#b8834a"); R(g, x, y - 22, 30, 2, "#dcaa6a"); R(g, x, y - 22, 2, 22, "#c99558"); R(g, x + 27, y - 22, 3, 22, "#8a5e30");
      R(g, x + 13, y - 22, 4, 22, "#d8c49a"); R(g, x + 13, y - 22, 4, 1, "#f0e0bc");
      PX.text(g, "{}", x + 3, y - 15, { size: 8, col: "#6a4420" }); R(g, x, y - 1, 30, 1, "#5a3c1c");
    };
    const block = (g, x, y) => {            // glowing code block, 30 x 18
      R(g, x, y - 18, 30, 18, "#1c3a5e"); R(g, x, y - 18, 30, 1, "#5fb8e8"); R(g, x, y - 18, 1, 18, "#3a78b0"); R(g, x + 29, y - 18, 1, 18, "#10243e");
      const cs = ["#ff7b72", "#d2a8ff", "#a5d6ff", "#7ee787"];
      for (let i = 0; i < 4; i++) R(g, x + 4 + (i % 2) * 3, y - 15 + i * 4, 14 + ((i * 5) % 9), 2, cs[i]);
      G(g, x + 15, y - 9, 16, "rgba(95,184,232,0.45)", 0.7);
    };
    return (g, t, d, c) => {
      const u = Math.max(0, t) / P, k = Math.floor(u), f = u - k;
      const mv = PX.ease(Math.min(f / 0.5, 1), "io");
      const ram = f < 0.6 ? 0 : f < 0.7 ? PX.ease((f - 0.6) / 0.1, "in") : f < 0.78 ? 1 : f < 0.95 ? 1 - PX.ease((f - 0.78) / 0.17, "io") : 0;
      const flash = f >= 0.7 && f < 0.76 ? 1 - (f - 0.7) / 0.06 : 0;
      const hum = 0.9 + 0.1 * Math.sin(t * 9) * Math.sin(t * 2.3);
      const BY = 236;
      const items = (fn) => { for (let n = -6; n <= 6; n++) { const cx = MX + S * (n + mv - 1); fn(cx - 15, cx, cx > MX + 1 || (Math.abs(cx - MX) < 1 && f >= 0.7)); } };
      // ---- far: factory wall with tall night windows + truss roof (depth 0.35)
      PX.par(g, c, 0.35, () => {
        PX.vgrad(g, -40, 0, 720, 250, "141a30", "0e1222", 8);
        for (let i = 0; i < 6; i++) { const wx = -10 + i * 118;
          R(g, wx, 34, 84, 120, "#0a0e1c"); PX.vgrad(g, wx + 3, 37, 78, 114, "1c2650", "2e2a58", 5);
          if (i === 4) { PX.circle(g, wx + 56, 62, 9, "#e8e4c0"); PX.circle(g, wx + 59, 60, 8, "#d6d2ae"); }
          for (let s = 0; s < 6; s++) R(g, wx + 6 + ((s * 37 + i * 13) % 70), 42 + ((s * 23 + i * 7) % 50), 1, 1, "#c8d0ff");
          R(g, wx + 6, 122, 72, 28, "#141a32");
          R(g, wx + 3, 92, 78, 2, "#0a0e1c"); for (let m = 1; m < 4; m++) R(g, wx + 3 + m * 20, 37, 2, 114, "#0a0e1c"); }
        for (let x = -40; x < 700; x += 60) { PX.line(g, x, 8, x + 30, 26, "#232a46"); PX.line(g, x + 30, 26, x + 60, 8, "#232a46"); }
        R(g, -40, 6, 720, 3, "#2a3254"); R(g, -40, 26, 720, 3, "#2a3254");
      });
      // ---- mid: pipes, catwalk, walls of identical boxes (depth 0.6)
      PX.par(g, c, 0.6, () => {
        R(g, -40, 160, 720, 90, "#121828");
        R(g, -40, 168, 720, 5, "#2e3a52"); R(g, -40, 168, 720, 1, "#4a5a7a"); R(g, -40, 178, 720, 3, "#3a2a2a"); R(g, -40, 178, 720, 1, "#5a4040");
        for (let x = 10; x < 680; x += 90) R(g, x, 166, 6, 9, "#4a5a7a");
        R(g, -40, 120, 720, 4, "#2a3048"); R(g, -40, 120, 720, 1, "#4a5470");
        for (let x = -40; x < 700; x += 14) R(g, x, 106, 1, 14, "#262c44"); R(g, -40, 106, 720, 2, "#343c5a");
        const wall = (x0, cols, rows) => { for (let r = 0; r < rows; r++) for (let cc = 0; cc < cols; cc++) { const bx = x0 + cc * 20, by = 248 - r * 14;
          R(g, bx, by - 14, 19, 14, "#5a4430"); R(g, bx, by - 14, 19, 1, "#7a5e40"); R(g, bx + 8, by - 14, 3, 14, "#6e5a44"); R(g, bx + 18, by - 14, 1, 14, "#3a2a1c"); }
          R(g, x0 - 2, 248, cols * 20 + 2, 3, "#3a2e22"); };
        wall(442, 9, 5); wall(-20, 4, 4);
      });
      // ---- hanging lamps (humming) + cones
      for (const lx of [110, 320, 530]) {
        R(g, lx, 0, 1, 40, "#2a2e3c"); R(g, lx - 12, 40, 24, 6, "#3a4054"); R(g, lx - 14, 46, 28, 2, "#566080"); R(g, lx - 10, 48, 20, 2, "#ffe6b0");
        L.cone(g, lx, 50, 22, 150, 210, "#ffdcaa", 0.16 * hum); G(g, lx, 52, 40, "rgba(255,220,160,0.7)", 0.6 * hum);
      }
      // ---- main layer
      PX.par(g, c, 1, () => {
        PX.vgrad(g, -40, 250, 720, 110, "2a2e3c", "171a24", 6); R(g, -40, 250, 720, 1, "#3e4458");
        for (let x = -40; x < 700; x += 20) R(g, x, 300, 12, 3, "#b89a30"); R(g, -40, 303, 720, 1, "#121420");
        for (let i = 0; i < 9; i++) PX.line(g, -40 + i * 90, 252, -140 + i * 110, 360, "#202430");
        for (const lx of [110, 320, 530]) { A(g, 0.35, () => ell(g, lx, 282, 70, 10, "#3a3a46")); G(g, lx, 282, 80, "rgba(255,210,150,0.12)", 1); }
        // conveyor
        const belt = Math.round(S * (k + mv)) % 8;
        for (let x = -20; x < 680; x += 46) { R(g, x, BY + 8, 4, 42, "#2a2e3a"); R(g, x, BY + 8, 1, 42, "#4a5066"); }
        R(g, -40, BY, 720, 8, "#22252e"); R(g, -40, BY, 720, 1, "#4a4e5e");
        for (let x = -40 + belt; x < 680; x += 8) R(g, x, BY + 1, 1, 3, "#30343e");
        R(g, -40, BY + 6, 720, 3, "#3a3f50"); R(g, -40, BY + 6, 720, 1, "#5a6078");
        items((x, cx, st) => { if (cx < -40 || cx > 680 || (cx > 252 && cx < 388)) return; if (st) box(g, x, BY); else block(g, x, BY); });
        // the machine
        const mx = 248, my = 92, mw = 144, mh = 146;
        R(g, mx - 6, my + mh - 4, mw + 12, 10, "#1a1d26");
        R(g, mx + 18, 0, 8, my, "#3a4a5a"); R(g, mx + 18, 0, 2, my, "#5a7088"); R(g, mx + mw - 30, 0, 6, my, "#3a4a5a"); R(g, mx + mw - 30, 0, 2, my, "#5a7088");
        for (let i = 0; i < 4; i++) { const ks = frac(f - 0.72 + i * 0.08); if (ks < 0.6) A(g, 0.35 * (1 - ks / 0.6), () => PX.circle(g, mx + mw - 27 + Math.sin(ks * 9 + i) * 4 + ks * 14, 52 - ks * 40, 3 + Math.round(ks * 8), "#9aa8c0")); }
        R(g, mx + 14, 60, 16, 4, "#4a5a6e"); R(g, mx + mw - 34, 44, 14, 4, "#4a5a6e");
        R(g, mx - 1, my - 1, mw + 2, mh + 2, "#0c0f16");
        R(g, mx, my, mw, mh, "#5a8a8e"); R(g, mx, my, mw, 2, "#8ac0c0"); R(g, mx, my, 2, mh, "#7aaeb0"); R(g, mx + mw - 4, my, 4, mh, "#3a6266"); R(g, mx, my + mh - 6, mw, 6, "#3a6266");
        for (let i = 0; i < 6; i++) { R(g, mx + 6 + i * 26, my + 4, 2, 2, "#3a6266"); R(g, mx + 6 + i * 26, my + mh - 10, 2, 2, "#2a4a4e"); }
        R(g, mx + 22, my - 22, mw - 44, 22, "#0e1218"); R(g, mx + 24, my - 20, mw - 48, 18, "#1e1a12");
        PX.text(g, "COMPILER", MX, my - 16, { size: 8, col: "#ffcf6a", align: "center" }); G(g, MX, my - 11, 60, "rgba(255,190,90,0.5)", 0.7 * hum);
        // chamber window with the ram
        const cx0 = 278, cy0 = my + 52, cw = 84, ch = 92;
        R(g, cx0 - 3, cy0 - 3, cw + 6, ch + 3, "#2a4a4e"); R(g, cx0, cy0, cw, ch, "#0c141a");
        G(g, MX, cy0 + 50, 60, "rgba(140,230,255,0.25)", 1);
        clip(g, cx0, cy0, cw, ch, () => {
          R(g, cx0, BY, cw, 8, "#22252e"); R(g, cx0, BY, cw, 1, "#4a4e5e");
          items((x, cx, st) => { if (st) box(g, x, BY); else block(g, x, BY); });
          const ry = cy0 - 2 + Math.round(ram * (BY - 22 - 26 - (cy0 - 2)));
          R(g, MX - 4, cy0 - 10, 8, ry - cy0 + 12, "#9ab0b8"); R(g, MX - 4, cy0 - 10, 2, ry - cy0 + 12, "#d0e0e6");
          R(g, MX - 22, ry + 2, 44, 24, "#6a7a86"); R(g, MX - 22, ry + 2, 44, 2, "#a8bcc8"); R(g, MX - 22, ry + 24, 44, 2, "#3a4652");
          if (flash > 0) { G(g, MX, BY - 6, 40, "rgba(160,240,255,0.9)", flash); PX.particles(g, k * 7 + 3, 8, f * 4, [MX - 24, BY - 14, 48, 10], { vy: -18, vx: 0, col: "#d6ffff", a: flash }); }
        });
        R(g, cx0, cy0, cw, 1, "rgba(255,255,255,.18)"); R(g, cx0 + 4, cy0 + 4, 2, 30, "rgba(255,255,255,.08)"); R(g, cx0 + 9, cy0 + 4, 1, 18, "rgba(255,255,255,.08)");
        for (const s of [-1, 1]) { const px = s < 0 ? mx + 8 : mx + mw - 18, ph = Math.round(ram * 10);
          R(g, px, my + 34, 10, 30, "#3a5a5e"); R(g, px + 2, my + 64, 6, 18 + ph, "#c0d0d6"); R(g, px + 2, my + 64, 2, 18 + ph, "#e8f2f6"); R(g, px, my + 82 + ph, 10, 4, "#3a5a5e"); }
        // counter (odometer)
        const cnt = (o.start === undefined ? 1 : o.start) + k + (f >= 0.7 ? 1 : 0);
        R(g, mx + 30, my + 12, mw - 60, 34, "#0e1416"); R(g, mx + 32, my + 14, mw - 64, 30, "#121e1a");
        PX.text(g, "IDENTICAL BOXES", MX, my + 12, { font: "v", size: 13, col: "#7ac89a", align: "center" });
        const ds = String(Math.max(0, cnt)).padStart(6, "0"), roll = f >= 0.7 && f < 0.8 ? (f - 0.7) / 0.1 : 1;
        for (let i = 0; i < 6; i++) { const dx = MX - 33 + i * 11; R(g, dx, my + 26, 10, 15, "#0a100c");
          clip(g, dx, my + 26, 10, 15, () => { const last = i === 5 || ds.slice(i + 1).split("").every((ch) => ch === "0");
            const off = last && roll < 1 ? Math.round((1 - roll) * 15) : 0;
            PX.text(g, ds[i], dx + 5, my + 25 + off, { font: "v", size: 18, col: "#3df56b", align: "center" });
            if (off) PX.text(g, String((+ds[i] + 9) % 10), dx + 5, my + 10 + off, { font: "v", size: 18, col: "#3df56b", align: "center" }); }); }
        G(g, MX, my + 34, 44, "rgba(61,245,107,0.3)", 0.8);
        R(g, mx + mw - 16, my + 50, 8, 8, "#0c1210"); R(g, mx + mw - 15, my + 51, 6, 6, "#3df56b"); G(g, mx + mw - 12, my + 54, 12, "rgba(61,245,107,0.8)", 0.8 * hum);
        // napping worker on a crate + the sign
        const WX = 492, WF = 336;
        A(g, 0.45, () => ell(g, WX, WF + 1, 30, 4, "#000000"));
        R(g, WX - 22, WF - 26, 44, 26, "#7a5634"); R(g, WX - 22, WF - 26, 44, 2, "#a07a50"); R(g, WX - 22, WF - 26, 2, 26, "#8e6a44"); R(g, WX + 19, WF - 26, 3, 26, "#4a3020");
        R(g, WX - 20, WF - 14, 40, 2, "#5a3c22"); PX.line(g, WX - 20, WF - 24, WX + 18, WF - 2, "#5a3c22");
        const br = Math.sin(t * 1.6);
        const W = L.person(g, WX, WF - 24, { h: 76, seated: true, floor: WF, skin: "#e0a878", hair: "#5a3a22", hairStyle: "short", shirt: "#d0743a", pants: "#3a4a6a",
          face: "closed", bob: Math.round(br * 0.7), al: [[7, 9], [15, 11]], ar: [[-7, 9], [-15, 11]], lit: -1 });
        const hx = W.hx, hb = W.ey + 1;                     // hard hat tipped down over the eyes
        R(g, hx - W.hw / 2 - 4, hb, W.hw + 8, 2, "#c89818"); R(g, hx - W.hw / 2 - 4, hb, W.hw + 8, 1, "#ffe070");
        R(g, hx - W.hw / 2 - 1, hb - 9, W.hw + 2, 9, "#f7c948"); R(g, hx - W.hw / 2 + 1, hb - 11, W.hw - 2, 2, "#f7c948"); R(g, hx - W.hw / 2 + 4, hb - 12, W.hw - 8, 1, "#f7c948");
        R(g, hx - 1, hb - 12, 2, 12, "#d8a828"); R(g, hx + 3, hb - 10, 4, 2, "#fff0a0"); R(g, hx - W.hw / 2 - 1, hb - 9, 2, 9, "#c89818");
        for (let i = 0; i < 3; i++) { const kz = frac(t * 0.4 + i / 3);
          A(g, Math.sin(kz * Math.PI), () => PX.otext(g, "Z", hx - 14 - kz * 22 + Math.sin(kz * 6) * 3, hb - 22 - kz * 30, { size: 8, col: "#cfe0ff" })); }
        const SX = 566;
        R(g, SX - 1, 236, 3, 100, "#4a4e5a"); R(g, SX - 1, 236, 1, 100, "#7a8098");
        R(g, SX - 36, 230, 74, 36, "#141414"); R(g, SX - 35, 231, 72, 34, "#f0c040"); R(g, SX - 33, 233, 68, 30, "#20201c");
        PX.text(g, "NO NEED", SX + 1, 237, { size: 8, col: "#f7c948", align: "center" }); PX.text(g, "TO CHECK", SX + 1, 249, { size: 8, col: "#f7c948", align: "center" });
        R(g, SX - 35, 231, 72, 1, "#fff0a0");
      });
      // ---- foreground: crate + railing (depth 1.3)
      PX.par(g, c, 1.3, () => {
        R(g, -60, 312, 110, 60, "#3a2c20"); R(g, -60, 312, 110, 2, "#6a5038"); for (let i = 0; i < 4; i++) R(g, -56 + i * 28, 314, 2, 50, "#2a1e14");
        R(g, -60, 330, 110, 2, "#2a1e14");
        R(g, 600, 290, 80, 4, "#c8a030"); R(g, 600, 290, 80, 1, "#ffe080"); R(g, 612, 290, 4, 80, "#9a7a20"); R(g, 612, 290, 1, 80, "#e0c060"); R(g, 600, 318, 80, 3, "#9a7a20");
      });
      PX.particles(g, 17, 30, t, [40, 50, 560, 220], { vy: -2, vx: 1, col: "#ffe8c0", a: 0.5 });
      PX.vignette(g, 0.5);
    };
  };
  // =============================================================================================
  // new_hire: office at night, the AI agent (tiny tie, 8 arms, huge grin) churns out ticked documents ("USUALLY RIGHT").
  // At o.flip (5.0) one document lifts out, glows, an x-ray pass reveals a red cross under its tick ("WRONG - BUT LOOKS RIGHT").
  // =============================================================================================
  // centred label with a real pixel dash between two parts (fonts have no em dash)
  const dashLabel = (g, a, b, x, y, t, t0, col) => {
    if (t < t0) return; const k = pop(t, t0, 0.3), wa = PX.tw(g, a, { size: 8 }), wb = PX.tw(g, b, { size: 8 }), w = wa + wb + 28, x0 = Math.round(x - w / 2), yy = y + Math.round((1 - k) * 6);
    A(g, cl((t - t0) * 6, 0, 1), () => { R(g, x0 - 8, yy - 6, w + 16, 20, "rgba(10,8,20,.75)"); R(g, x0 - 8, yy - 6, w + 16, 1, col); R(g, x0 - 8, yy + 13, w + 16, 1, col);
      PX.otext(g, a, x0, yy, { size: 8, col }); R(g, x0 + wa + 6, yy + 3, 14, 2, col); R(g, x0 + wa + 6, yy + 5, 14, 1, "#05060a"); PX.otext(g, b, x0 + wa + 28, yy, { size: 8, col }); });
  };
  const docSmall = (g, x, y, glow) => {     // 14 x 18 page with a green tick, top-left (x, y)
    R(g, x, y, 14, 18, "#8a93a8"); R(g, x, y, 13, 17, "#d6dbe6"); R(g, x, y, 13, 1, "#eef1f6");
    for (let i = 0; i < 4; i++) R(g, x + 2, y + 3 + i * 3, 9 - (i % 2) * 3, 1, "#8a93a8");
    R(g, x + 7, y + 13, 1, 2, "#2fc85a"); R(g, x + 8, y + 14, 1, 2, "#2fc85a"); R(g, x + 9, y + 12, 1, 3, "#2fc85a"); R(g, x + 10, y + 10, 1, 3, "#2fc85a");
    if (glow) G(g, x + 7, y + 9, 18, "rgba(255,240,180,0.8)", glow);
  };
  K.new_hire = (o) => {
    need();
    const ARM = ["#b8ccd6", "#7f98a6", "#4f6674"];
    return (g, t, d, c) => {
      const flip = T(o, "flip", 5.0, d, 10.5), P = 0.5, launch0 = 0.3;
      const BX = 250, HY = 146, HW = 64;                       // bot head centre / width
      const OUT = [470, 252];                                  // growing stack base (centre x, top of cabinet)
      const landed = (tt) => Math.max(0, Math.floor((tt - launch0 - 0.45) / P) + 1);
      const nStack = Math.min(landed(t), landed(flip + 0.01));  // after the flip the special doc is the last one counted
      const after = t >= flip;
      // ---- far: night city through the glass wall (depth 0.35)
      PX.par(g, c, 0.35, () => {
        PX.core.skyline(g, -40, 20, 720, 190, t, 21);
        for (let x = -40; x < 700; x += 92) R(g, x, 20, 6, 190, "#141826");
        R(g, -40, 92, 720, 3, "#141826");
      });
      // ---- mid: back wall pieces, cubicles, water cooler, welcome banner (depth 0.65)
      PX.par(g, c, 0.65, () => {
        R(g, -40, 0, 720, 20, "#151a2c"); R(g, -40, 18, 720, 3, "#262c44");
        R(g, -40, 210, 720, 80, "#1a1e30"); R(g, -40, 210, 720, 2, "#2c3250");
        // ceiling light panels (one flickers)
        for (let i = 0; i < 4; i++) { const lx = 40 + i * 170, on = i !== 2 || !PX.blink(t * 1.0 + 0.3, 2.7, 0.08);
          R(g, lx, 2, 90, 6, "#2a3048"); R(g, lx + 2, 4, 86, 3, on ? "#e8f0ff" : "#4a5068"); if (on) G(g, lx + 45, 10, 70, "rgba(200,220,255,0.35)", 0.8); }
        // cubicle partitions in the back
        for (const [x0, w] of [[-30, 120], [520, 160]]) { R(g, x0, 178, w, 50, "#3a4060"); R(g, x0, 178, w, 3, "#5a6288"); for (let x = x0 + 6; x < x0 + w; x += 6) R(g, x, 184, 1, 40, "#343a58");
          R(g, x0 + w / 2 - 14, 164, 28, 16, "#20263c"); R(g, x0 + w / 2 - 12, 166, 24, 11, "#2a5a7a"); G(g, x0 + w / 2, 172, 20, "rgba(95,180,230,0.4)", 0.6); }
        // water cooler with rising bubbles
        R(g, 112, 186, 20, 40, "#c8ccd8"); R(g, 112, 186, 2, 40, "#e8ecf4"); R(g, 130, 186, 2, 40, "#8a90a0");
        R(g, 114, 160, 16, 26, "#3a7ac8"); R(g, 115, 161, 4, 24, "#6aa8f0"); R(g, 116, 156, 12, 4, "#3a7ac8");
        for (let i = 0; i < 3; i++) { const kb = frac(t * 0.6 + i / 3); R(g, 120 + (i % 2) * 4, 184 - kb * 22, 2, 2, "#a8d4ff"); }
        // welcome banner with balloons
        R(g, 180, 30, 280, 1, "#4a4a5a");
        for (let i = 0; i < 9; i++) { const fx = 190 + i * 30, sag = Math.round(Math.sin((i / 8) * Math.PI) * 10);
          g.fillStyle = ["#f25ca8", "#5fe3e8", "#f7c948"][i % 3]; g.beginPath(); g.moveTo(fx, 31 + sag); g.lineTo(fx + 16, 31 + sag); g.lineTo(fx + 8, 44 + sag); g.fill(); }
        PX.otext(g, "WELCOME!", 320, 52, { size: 8, col: "#ffcf8a", align: "center" });
        for (const [bx, col, ph] of [[170, "#f25ca8", 0], [182, "#5fe3e8", 1.3], [470, "#f7c948", 2.1]]) { const by = 50 + Math.round(Math.sin(t * 1.4 + ph) * 2);
          ell(g, bx, by, 8, 10, col); R(g, bx - 4, by - 6, 2, 3, sh(col, 1.5)); PX.line(g, bx, by + 10, bx + 2, by + 40, "#8a8aa0"); }
      });
      // ---- main: desk, the agent, documents (depth 1)
      PX.par(g, c, 1, () => {
        PX.vgrad(g, -40, 290, 720, 70, "262a40", "171a28", 5); R(g, -40, 290, 720, 1, "#3a3f5c");
        for (let x = -40; x < 700; x += 4) R(g, x + ((x / 4) % 2), 300 + ((x * 7) % 50), 1, 1, "#20243a");
        const dim = after ? cl((t - flip) / 0.5, 0, 1) * 0.0 : 0;
        // desk lamp light
        G(g, 170, 210, 140, "rgba(255,200,130,0.28)", 1);
        // filing cabinet with the stacks
        R(g, 430, 252, 84, 50, "#3c4258"); R(g, 430, 252, 84, 2, "#5a6280"); R(g, 430, 252, 2, 50, "#4a5270"); R(g, 511, 252, 3, 50, "#262a3c");
        for (let i = 0; i < 2; i++) { R(g, 436, 260 + i * 20, 72, 16, "#353b52"); R(g, 462, 266 + i * 20, 20, 3, "#8a92aa"); }
        // pre-existing tall stack (eager since morning)
        for (let i = 0; i < 26; i++) { const sx = 442 + ((i * 3) % 3) - 1; R(g, sx, 250 - i * 2, 16, 2, i % 2 ? "#9aa2b2" : "#b4bbc8"); R(g, sx, 251 - i * 2, 16, 1, "#6a7284"); }
        docSmall(g, 443, 250 - 26 * 2 - 16, 0);
        // growing stack
        for (let i = 0; i < nStack; i++) { const sx = OUT[0] + ((i * 5) % 3) - 1; R(g, sx, OUT[1] - 2 - i * 2, 16, 2, i % 2 ? "#9aa2b2" : "#b4bbc8"); R(g, sx, OUT[1] - 1 - i * 2, 16, 1, "#9aa2b4"); }
        if (nStack > 0 && !(after && t < flip + 0.5)) docSmall(g, OUT[0] + 1, OUT[1] - 2 - nStack * 2 - 16, 0);
        // the agent: torso behind the desk, 8 arms, head
        const bob = Math.round(Math.sin(t * 7) * 1);
        R(g, BX - 22, HY + 26, 44, 70, "#3a5566"); R(g, BX - 22, HY + 26, 44, 2, "#8fb3c2"); R(g, BX - 22, HY + 26, 3, 70, "#5d8091"); R(g, BX + 19, HY + 26, 3, 70, "#26404e");
        R(g, BX - 8, HY + 30, 16, 40, "#4a6878");
        const shoulders = [];
        for (let i = 0; i < 4; i++) { shoulders.push([BX - 20, HY + 34 + i * 9, -1, i]); shoulders.push([BX + 20, HY + 34 + i * 9, 1, i]); }
        const TG = {   // hand targets per side: keyboard, paper ream, stamp, pass-to-stack
          "-1": [[214, 232], [168, 226], [190, 210], [236, 236], [150, 200], [200, 238]],
          "1": [[268, 234], [300, 226], [330, 214], [290, 238], [350, 200], [318, 234]] };
        shoulders.forEach(([sx, sy, s, i], j) => {
          const tg = TG[String(s)], ph = t * (2.2 + i * 0.35) + j * 0.73, a = Math.floor(ph) % tg.length, b = (a + 1 + i) % tg.length, e = PX.ease(frac(ph), "io");
          const hx = lerp(tg[a][0], tg[b][0], e) + Math.round(Math.sin(t * 20 + j) * 1), hy = lerp(tg[a][1], tg[b][1], e) - i * 3;
          const ex = (sx + hx) / 2 + s * 14, ey = (sy + hy) / 2 + 10 - i * 4;
          L.limb(g, sx, sy, ex, ey, 5, ARM[1], ARM[2]); L.limb(g, ex, ey, hx, hy, 4, ARM[0], ARM[2]);
          R(g, ex - 2, ey - 2, 4, 4, "#26404e"); R(g, ex - 1, ey - 1, 2, 2, "#8fb3c2");
          R(g, hx - 3, hy - 2, 2, 5, "#5d8091"); R(g, hx + 1, hy - 2, 2, 5, "#5d8091"); R(g, hx - 2, hy - 3, 4, 2, ARM[0]);
        });
        bot(g, BX, HY + bob, HW, t, { eyes: after && t > flip + 2.6 && t < flip + 3.4 ? "wide" : "happy", mouth: "grin", tie: true });
        if (after && t > flip + 2.6) L.sweat(g, BX + 30, HY - 18, t, 1, 4);
        for (let i = 0; i < 3; i++) { const ks = frac(t * 0.9 + i / 3); if (ks < 0.5) L.star4(g, BX + [-46, 44, 38][i], HY + [-20, -28, 6][i], ks < 0.25 ? 1 : 2, "#f7c948"); }
        // desk (in front of the torso and arms' roots)
        R(g, 120, 240, 290, 8, "#6a4a32"); R(g, 120, 240, 290, 2, "#8e6a48"); R(g, 120, 248, 290, 52, "#3a2a20"); R(g, 120, 248, 290, 2, "#24180f");
        R(g, 130, 250, 8, 50, "#2a1e16"); R(g, 392, 250, 8, 50, "#2a1e16"); R(g, 234, 252, 60, 30, "#33251c"); R(g, 260, 262, 8, 2, "#8a6a48");
        // desk items: monitor back, lamp, ream, keyboard, mug
        R(g, 136, 196, 52, 40, "#20242e"); R(g, 136, 196, 52, 2, "#3a4050"); R(g, 158, 236, 8, 4, "#20242e"); G(g, 162, 200, 30, "rgba(95,180,230,0.25)", 0.8);
        R(g, 196, 228, 30, 10, "#e0e4ec"); R(g, 196, 228, 30, 2, "#ffffff"); for (let i = 0; i < 4; i++) R(g, 196, 231 + i * 2, 30, 1, "#b8bec8");
        R(g, 222, 234, 60, 6, "#2a2e3a"); R(g, 222, 234, 60, 1, "#4a5060"); for (let i = 0; i < 10; i++) R(g, 224 + i * 6, 235 + ((Math.floor(t * 16) + i * 3) % 7 === 0 ? 1 : 0), 4, 2, "#6a7080");
        R(g, 360, 222, 6, 18, "#3a3f4b"); R(g, 352, 214, 22, 9, "#3a3f4b"); R(g, 354, 222, 18, 1, "#ffd28a"); G(g, 362, 232, 50, "rgba(255,200,130,0.4)", 0.9);
        PX.core.mug(g, 318, 230, t);
        // documents flying from the agent to the stack (arc)
        for (let n = 0; n < 40; n++) {
          const t0 = launch0 + n * P, k = (t - t0) / 0.45;
          if (k < 0 || k >= 1) continue;
          if (after && t0 >= flip - 0.45 + 0.01 && t0 < flip + 0.6) continue;    // pause while the flagged doc lifts
          const top = OUT[1] - 18 - n * 2;
          const x = lerp(300, OUT[0] + 1, k), y = lerp(214, top, k) - Math.sin(k * Math.PI) * 40;
          docSmall(g, x, y, 0);
        }
        void dim;
      });
      // ---- foreground: big plant (left) and an office chair (right), depth 1.3
      PX.par(g, c, 1.3, () => {
        R(g, 22, 318, 40, 42, "#6a3e2a"); R(g, 22, 318, 40, 3, "#8a5a3a"); R(g, 22, 318, 3, 42, "#7a4a32"); R(g, 58, 318, 4, 42, "#4a2a1c");
        const sw = Math.sin(t * 0.9) * 2;
        for (let i = 0; i < 11; i++) { const an = -2.75 + i * 0.27, len = 30 + ((i * 7) % 4) * 8, ex = 42 + Math.cos(an) * len + sw * (i / 11), ey = 318 + Math.sin(an) * len;
          L.limb(g, 42, 318, ex, ey, 2, "#2a5a34", "#1c3a24");
          for (let j = 0; j < 3; j++) { const k = 0.45 + j * 0.27, lx = lerp(42, ex, k), ly = lerp(318, ey, k), lw = 4 + j * 2;
            ell(g, lx, ly, lw, 3, j % 2 ? "#2e7a40" : "#3e9a52"); R(g, lx - lw + 2, ly - 2, lw, 1, "#7ac88a"); R(g, lx - lw + 1, ly + 2, lw * 2 - 2, 1, "#1c4a28"); } }
        R(g, 560, 300, 70, 40, "#1c1e28"); R(g, 560, 300, 70, 3, "#3a3e50"); R(g, 562, 304, 3, 34, "#2a2c3a"); R(g, 590, 340, 10, 20, "#14151c"); R(g, 570, 352, 50, 4, "#14151c");
      });
      // ---- the flagged document (focus beat)
      if (after) {
        const kd = cl((t - flip) / 0.5, 0, 1);
        A(g, 0.45 * kd, () => R(g, 0, 0, 640, 360, "#05060f"));                  // dim the room so the eye goes to it
        const sx = OUT[0] + 1, sy = OUT[1] - 2 - nStack * 2 - 16;
        if (t < flip + 0.5) { const k = PX.ease(kd, "out"); docSmall(g, sx, sy - k * 50, 0.6 + 0.4 * Math.sin(t * 20)); }
        else {
          const DX = 430, DY = 64, DW = 96, DH = 124, open = PX.p(t, flip + 0.5, 0.35, "back");
          const hh = Math.max(2, Math.round(DH * cl(open, 0, 1.2)));
          G(g, DX + DW / 2, DY + DH / 2, 110, "rgba(255,230,160,0.45)", 0.7 + 0.15 * Math.sin(t * 4));
          clip(g, DX - 4, DY + DH / 2 - hh / 2 - 2, DW + 8, hh + 4, () => {
            R(g, DX + 3, DY + 4, DW, DH, "rgba(0,0,0,.5)");
            R(g, DX, DY, DW, DH, "#8a93a8"); R(g, DX, DY, DW - 2, DH - 2, "#c2c8d4"); R(g, DX, DY, DW - 2, 2, "#e0e4ec"); R(g, DX + DW - 14, DY, 12, 12, "#b0b8c8");
            for (let i = 0; i < 9; i++) R(g, DX + 10, DY + 14 + i * 7, DW - 26 - ((i * 13) % 22), 2, i === 0 ? "#5a6478" : "#9aa2b4");
            tick(g, DX + 50, DY + 86, 26, "#2fc85a");
            // x-ray pass: above the scan line the page turns to an x-ray plate and shows the cross under the tick
            const sy2 = DY + Math.round(PX.p(t, flip + 1.1, 1.1, "io") * DH);
            const xr = () => {
              R(g, DX, DY, DW - 2, DH - 2, "#0e2a44"); for (let i = 0; i < 9; i++) R(g, DX + 10, DY + 14 + i * 7, DW - 26 - ((i * 13) % 22), 2, "#2a6a8e");
              A(g, 0.5, () => tick(g, DX + 50, DY + 86, 26, "#5fe3e8"));
              cross(g, DX + 52, DY + 86, 24, "#ff4d4d"); G(g, DX + 64, DY + 98, 34, "rgba(255,77,77,0.7)", 0.9);
            };
            if (t > flip + 1.1 && t < flip + 2.3) clip(g, DX, DY, DW, sy2 - DY, xr);
            if (t >= flip + 2.3) { const kr = PX.p(t, flip + 2.3, 0.3, "back"), rr = Math.max(1, Math.round(24 * kr)); clipC(g, DX + 63, DY + 99, rr, xr);
              for (let a2 = 0; a2 < 64; a2++) { const an = (a2 / 64) * 6.2832; R(g, DX + 63 + Math.cos(an) * (rr + 1), DY + 99 + Math.sin(an) * (rr + 1), 1, 1, "#8ff8ff"); } }
            if (t > flip + 1.1 && t < flip + 2.3) { R(g, DX - 4, sy2 - 1, DW + 8, 2, "#8ff8ff"); G(g, DX + DW / 2, sy2, 50, "rgba(95,227,232,0.8)", 0.8); }
          });
        }
      }
      // ---- labels
      if (t >= 1.0) { const fade = after ? 1 - cl((t - flip) / 0.4, 0, 1) : 1; if (fade > 0) A(g, fade, () => plate(g, "USUALLY RIGHT", 478, 150, t, 1.0, "#3df56b")); }
      dashLabel(g, "WRONG", "BUT LOOKS RIGHT", 470, 204, t, flip + 2.6, "#ff6a6a");
      PX.particles(g, 23, 18, t, [120, 160, 300, 120], { vy: -3, vx: 1, col: "#ffe2b0", a: 0.5 });
      PX.vignette(g, 0.5);
    };
  };
  // =============================================================================================
  // spot_diff: noir detective desk under a banker's lamp. Two near-identical code cards; a hand sweeps a magnifying glass
  // across them; at o.found (5.0) the one different line on the right card glows red. Label "TELL THEM APART".
  // =============================================================================================
  const CARD = [
    [0, [["def", "#5a1450"], [" find(users, name):", "#16161e"]]],
    [1, [['"""look up by name"""', "#2e4a26"]]],
    [1, [["for", "#5a1450"], [" u ", "#16161e"], ["in", "#5a1450"], [" users:", "#16161e"]]],
    [2, [["if", "#5a1450"], [" u.name ", "#16161e"], ["==", "#16161e"], [" name:", "#16161e"]]],
    [3, [["return", "#5a1450"], [" u", "#16161e"]]],
    [1, [["log(", "#16161e"], ['"not found"', "#2e4a26"], [")", "#16161e"]]],
    [1, [["return", "#5a1450"], [" None", "#183e6a"]]],
  ];
  K.spot_diff = (o) => {
    need();
    const CW = 172, CH = 168, CY = 112, LX = 124, RX = 344, DIFF = 3;
    const card = (g, x, y, right, found, t) => {
      R(g, x + 3, y + 4, CW, CH, "rgba(0,0,0,.45)");
      R(g, x, y, CW, CH, "#4e4a3c"); R(g, x, y, CW - 1, CH - 1, "#6a6452"); R(g, x, y, CW - 1, 1, "#857e66");
      R(g, x, y + 16, CW - 1, 1, "#985a56"); for (let i = 0; i < 9; i++) R(g, x, y + 33 + i * 15, CW - 1, 1, "#5c625e");
      PX.text(g, right ? "B" : "A", x + CW - 12, y + 2, { font: "v", size: 13, col: "#8a6a4a" });
      // paper clip
      R(g, x + 14, y - 6, 6, 18, "#8a92a0"); R(g, x + 15, y - 5, 4, 16, "#c8d0dc"); R(g, x + 16, y - 3, 2, 12, "#8a92a0");
      CARD.forEach(([ind, seg], i) => {
        const ly = y + 19 + i * 15;
        if (right && i === DIFF && found > 0) { A(g, found, () => { R(g, x + 4, ly + 1, CW - 9, 13, "#a8443c"); }); G(g, x + CW / 2, ly + 7, 60, "rgba(255,77,77,0.7)", found * (0.7 + 0.3 * Math.sin(t * 8))); }
        let lx = x + 8 + ind * 12;
        seg.forEach(([txt, col]) => { const tx = right && i === DIFF && txt === "==" ? "!=" : txt;
          lx += PX.text(g, tx, lx, ly - 1, { font: "v", size: 14, col: right && i === DIFF && found > 0.5 ? "#7a0a0a" : col }); });
      });
    };
    return (g, t, d, c) => {
      const found = T(o, "found", 5.0, d, 8.5);
      const fk = cl((t - found) / 0.3, 0, 1);
      // ---- far: wall, corkboard, venetian-blind window with rain (depth 0.4)
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, 0, 720, 96, "1c1830", "141222", 5);
        for (let x = -40; x < 700; x += 10) R(g, x, 0, 1, 96, "#1a1630");
        // window with blinds
        R(g, 440, 6, 170, 80, "#0c0c18"); PX.vgrad(g, 443, 9, 164, 74, "1a2a5a", "2a3a6a", 4);
        L.rain(g, t, 9, 26, [443, 9, 164, 74], { a: 0.4, col: "#9ab8f0" });
        for (let y = 9; y < 83; y += 6) { R(g, 443, y, 164, 3, "#3a3a52"); R(g, 443, y, 164, 1, "#6a6a8a"); }
        G(g, 525, 46, 90, "rgba(140,170,255,0.25)", 1);
        // corkboard with pinned photos + red string
        R(g, 40, 10, 150, 74, "#5a3a22"); R(g, 43, 13, 144, 68, "#8a6a42");
        for (let i = 0; i < 60; i++) R(g, 44 + ((i * 37) % 142), 14 + ((i * 23) % 66), 1, 1, "#6e5232");
        const pins = [[64, 30], [110, 22], [160, 36], [86, 60], [146, 66]];
        pins.forEach(([px, py], i) => { R(g, px - 9, py - 6, 18, 14, "#c8c0a8"); R(g, px - 8, py - 5, 16, 10, ["#4a5a6a", "#6a5a4a", "#3a4a3a", "#5a4a5a", "#4a4a5a"][i]); });
        for (let i = 0; i < pins.length - 1; i++) PX.line(g, pins[i][0], pins[i][1] - 6, pins[i + 1][0], pins[i + 1][1] - 6, "#c03030");
        pins.forEach(([px, py]) => { R(g, px - 1, py - 7, 3, 3, "#ff4d4d"); });
        R(g, -40, 92, 720, 4, "#0c0a14");
      });
      // ---- desk surface (depth 0.8)
      PX.par(g, c, 0.8, () => {
        PX.vgrad(g, -40, 96, 720, 264, "3a2418", "24160e", 7);
        R(g, -40, 96, 720, 3, "#5a3a26");
        R(g, 70, 104, 500, 250, "#1e3a2c"); R(g, 72, 106, 496, 246, "#24453a"); R(g, 72, 106, 496, 1, "#3a6050");   // leather inlay
        for (let i = 0; i < 40; i++) R(g, 80 + ((i * 53) % 480), 110 + ((i * 31) % 236), 2, 1, "#2a4c40");
        // manila case folder under the cards
        R(g, 108, 100, 424, 196, "#5e4c2a"); R(g, 108, 100, 424, 2, "#8a7040"); R(g, 108, 100, 90, 8, "#6e5a32");
      });
      // window light through blinds: diagonal stripes on the desk
      A(g, 0.07, () => { for (let i = 0; i < 9; i++) { g.fillStyle = "#c8d8ff"; g.beginPath(); const x0 = 330 + i * 34; g.moveTo(x0, 96); g.lineTo(x0 + 14, 96); g.lineTo(x0 + 120, 360); g.lineTo(x0 + 106, 360); g.fill(); } });
      // lamp light pool
      G(g, 230, 180, 280, "rgba(255,200,130,0.14)", 1);
      // ---- main: cards + props (depth 1)
      PX.par(g, c, 1, () => {
        card(g, LX, CY, false, 0, t); card(g, RX, CY, true, fk, t);
        // red marker circle drawn around the line
        if (t > found + 0.3) { const kc = cl((t - found - 0.3) / 0.6, 0, 1), cy2 = CY + 19 + DIFF * 15 + 6;
          for (let a = 0; a < kc * 6.6; a += 0.02) { R(g, RX + CW / 2 + Math.cos(a - 2) * 92, cy2 + Math.sin(a - 2) * 15, 2, 2, "#ff4d4d"); } }
        // fedora (lower left)
        ell(g, 66, 318, 46, 14, "#2a2422"); ell(g, 66, 314, 44, 12, "#3a322c"); ell(g, 66, 306, 26, 10, "#2e2824"); ell(g, 66, 300, 24, 9, "#3e3630");
        R(g, 42, 306, 48, 4, "#6a1a1a"); R(g, 44, 301, 30, 1, "#5a4e44");
        // coffee cup (top view) with steam
        PX.circle(g, 574, 140, 14, "#d8d0c0"); PX.circle(g, 574, 140, 11, "#3a2014"); R(g, 568, 135, 5, 2, "#6a4428"); R(g, 588, 138, 6, 5, "#d8d0c0");
        for (let i = 0; i < 3; i++) { const k = frac(t * 0.5 + i / 3); A(g, 0.4 * (1 - k), () => R(g, 572 + Math.sin(k * 7 + i) * 4, 128 - k * 30, 3, 4, "#c8c0b8")); }
        // pencil + notebook
        R(g, 520, 300, 70, 46, "#2a2a4a"); R(g, 520, 300, 70, 2, "#4a4a7a"); R(g, 522, 304, 66, 40, "#c8c0a0"); for (let i = 0; i < 6; i++) R(g, 526, 310 + i * 6, 56, 1, "#9aa0b0");
        thick(g, 500, 290, 560, 276, 3, "#e0b030"); R(g, 498, 289, 4, 3, "#e8a0a0"); R(g, 559, 275, 3, 3, "#3a2a1a");
      });
      // ---- banker's lamp (top-left) + its cone
      PX.par(g, c, 1.1, () => {
        R(g, 30, 66, 4, 40, "#c09a40"); R(g, 30, 66, 1, 40, "#ffe08a"); ell(g, 32, 108, 16, 4, "#8a6a2a");
        R(g, 6, 50, 64, 18, "#1a5a3a"); R(g, 8, 50, 60, 3, "#3a9a6a"); R(g, 6, 66, 64, 2, "#0e3a24"); R(g, 10, 68, 56, 2, "#ffe2a8");
        G(g, 38, 72, 60, "rgba(255,220,150,0.6)", 0.8 + 0.05 * Math.sin(t * 11));
      });
      // ---- ceiling fan shadow sweeping over the desk
      A(g, 0.12, () => { const an = t * 1.6; for (let b = 0; b < 3; b++) { const a2 = an + (b * 6.2832) / 3; g.fillStyle = "#000"; g.beginPath();
        g.moveTo(380, 60); g.lineTo(380 + Math.cos(a2 - 0.12) * 420, 60 + Math.sin(a2 - 0.12) * 260); g.lineTo(380 + Math.cos(a2 + 0.12) * 420, 60 + Math.sin(a2 + 0.12) * 260); g.fill(); } });
      // ---- magnifying glass in a hand (foreground)
      const MXk = [[0, 168], [0.6, 168], [1.4, 250], [1.9, 170], [2.6, 252], [3.2, 400], [3.9, 470], [4.4, 392], [found, 432]];
      const MYk = [[0, 150], [0.6, 150], [1.4, 165], [1.9, 195], [2.6, 225], [3.2, 150], [3.9, 180], [4.4, 205], [found, CY + 19 + DIFF * 15 + 6]];
      const gx = Math.round(PX.KF(MXk, t) + Math.sin(t * 3.1) * 1.2), gy = Math.round(PX.KF(MYk, t) + Math.cos(t * 2.7) * 1);
      const LR = 30;
      PX.par(g, c, 1.25, () => {
        A(g, 0.35, () => PX.circle(g, gx + 10, gy + 14, LR, "#000"));
        clipC(g, gx, gy, LR - 1, () => {
          PX.zoom(g, 2, gx, gy, () => { card(g, LX, CY, false, 0, t); card(g, RX, CY, true, fk, t); });
          A(g, 0.05, () => R(g, gx - LR, gy - LR, LR * 2, LR * 2, "#8ff0ff"));
          A(g, 0.35, () => { for (let a = 3.5; a < 4.6; a += 0.03) R(g, gx + Math.cos(a) * (LR - 6), gy + Math.sin(a) * (LR - 6), 2, 2, "#ffffff"); });
        });
        for (let a = 0; a < 6.2832; a += 0.012) { const ca = Math.cos(a), sa = Math.sin(a);
          R(g, gx + ca * LR - 1, gy + sa * LR - 1, 3, 3, sa < -0.3 || ca < -0.5 ? "#e8c060" : "#8a6a2a"); }
        // handle, then a fist, shirt cuff and trench-coat sleeve running off to the lower right
        thick(g, gx + 21, gy + 21, gx + 46, gy + 46, 6, "#2a180e"); thick(g, gx + 21, gy + 20, gx + 46, gy + 45, 2, "#7a5030");
        R(g, gx + 17, gy + 17, 8, 8, "#c09a40"); R(g, gx + 17, gy + 17, 8, 2, "#ffe08a");
        thick(g, gx + 70, gy + 70, gx + 190, gy + 190, 30, "#4e3a24"); thick(g, gx + 66, gy + 64, gx + 186, gy + 184, 22, "#6e5434"); thick(g, gx + 62, gy + 58, gx + 182, gy + 178, 6, "#8e7048");
        thick(g, gx + 58, gy + 58, gx + 64, gy + 64, 20, "#7a7468"); thick(g, gx + 57, gy + 56, gx + 62, gy + 61, 14, "#a09a8a");
        PX.circle(g, gx + 49, gy + 49, 10, "#7a4a2a"); PX.circle(g, gx + 49, gy + 49, 9, "#c98a5a"); PX.circle(g, gx + 47, gy + 47, 6, "#dba070");
        for (let i = 0; i < 3; i++) { const kx = gx + 43 + i * 5, ky = gy + 53 - i * 5; PX.line(g, kx, ky, kx + 5, ky + 5, "#8a5634"); }
        ell(g, gx + 42, gy + 44, 5, 3, "#d89a68"); R(g, gx + 39, gy + 42, 4, 1, "#f0c090");
      });
      plate(g, "TELL THEM APART", 320, 16, t, found + 0.5, "#ff6a6a");
      PX.particles(g, 41, 22, t, [60, 100, 420, 200], { vy: -2, vx: 1.5, col: "#ffe2b0", a: 0.55 });
      PX.vignette(g, 0.6);
    };
  };
  // =============================================================================================
  // explain_aloud: the dev at his desk at night walks a pointer down his code line by line, narrating (squiggle words).
  // o.stop (8.0): bubble becomes "...AND THEN THIS PART / DOES SOMETHING" + "???", the line turns red.
  // o.hw (14.8): yellow sticky note "HOMEWORK" slaps onto the monitor. o.title (0.5): top label.
  // =============================================================================================
  const EXPL = [
    [0, [["def", "#ff7b72"], [" load_users", "#d2a8ff"], ["(path):", "#c9d1d9"]]],
    [1, [["rows = ", "#c9d1d9"], ["read_csv", "#d2a8ff"], ["(path)", "#c9d1d9"]]],
    [1, [["users = []", "#c9d1d9"]]],
    [1, [["for", "#ff7b72"], [" r ", "#c9d1d9"], ["in", "#ff7b72"], [" rows:", "#c9d1d9"]]],
    [2, [["u = ", "#c9d1d9"], ["User", "#ffa657"], ["(r)", "#c9d1d9"]]],
    [2, [["users.", "#c9d1d9"], ["append", "#d2a8ff"], ["(u)", "#c9d1d9"]]],
    [1, [["cache.", "#c9d1d9"], ["warm", "#d2a8ff"], ["(users)", "#c9d1d9"]]],
    [1, [["k = ", "#c9d1d9"], ["reduce", "#d2a8ff"], ["(xor, ", "#c9d1d9"], ["map", "#d2a8ff"], ["(hash, users))", "#c9d1d9"]]],
    [1, [["return", "#ff7b72"], [" users, k", "#c9d1d9"]]],
  ];
  const squiggle = (g, x, y, w, t, col, seed) => { for (let i = 0; i < w; i++) R(g, x + i, y + Math.round(Math.sin(i * 0.9 + seed * 2.3 + t * 0.0) * 1.2), 1, 2, col); };
  K.explain_aloud = (o) => {
    need();
    return (g, t, d, c) => {
      const stop = T(o, "stop", 8.0, d, 16.5), hw = T(o, "hw", 14.8, d, 16.5), t0 = T(o, "title", 0.5, d, 16.5);
      const step = (stop - 1.0) / 7, line = t < 1.0 ? 0 : Math.min(7, Math.floor((t - 1.0) / step));
      const stuck = t >= stop;
      const SX = 330, SY = 92, SW = 248, SH = 156, LH = 15;
      const lineY = (i) => SY + 16 + i * LH;
      // ---- far: window with rainy city + cat on the sill (depth 0.4)
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -40, 0, 720, 270, "171c36", "0e1124", 9);
        R(g, 26, 40, 176, 150, "#262b44"); PX.core.skyline(g, 32, 46, 164, 136, t, 8);
        L.rain(g, t, 12, 40, [32, 46, 164, 136], { a: 0.45 });
        R(g, 112, 46, 4, 136, "#262b44"); R(g, 32, 112, 164, 3, "#262b44"); R(g, 20, 188, 188, 6, "#343a58"); R(g, 20, 188, 188, 1, "#4e5680");
        // cat on the sill, tail swishing
        const cx = 160, cy = 188, tail = Math.sin(t * 2.2) * 5;
        ell(g, cx, cy - 7, 10, 6, "#1a1820"); PX.circle(g, cx + 9, cy - 14, 5, "#1a1820"); R(g, cx + 5, cy - 21, 2, 3, "#1a1820"); R(g, cx + 11, cy - 21, 2, 3, "#1a1820");
        if (!PX.blink(t, 3.1, 0.06)) { R(g, cx + 7, cy - 15, 1, 1, "#f7c948"); R(g, cx + 11, cy - 15, 1, 1, "#f7c948"); }
        L.limb(g, cx - 9, cy - 4, cx - 18, cy - 10 + tail, 2, "#1a1820"); L.limb(g, cx - 18, cy - 10 + tail, cx - 20 + tail * 0.4, cy - 18 + tail, 2, "#1a1820");
        R(g, cx - 4, cy - 13, 8, 1, "#3a3650");
      });
      // ---- mid: shelf, poster, PC tower (depth 0.7)
      PX.par(g, c, 0.7, () => {
        R(g, 586, 60, 70, 5, "#4a3626"); const bk = ["#a0392b", "#2970a9", "#279e60", "#7e44ad", "#c35400"];
        let bx = 590; bk.forEach((col, i) => { const h = 18 + (i * 5) % 8; R(g, bx, 60 - h, 7, h, col); R(g, bx, 60 - h, 1, h, sh(col, 1.4)); bx += 8; });
        R(g, 590, 92, 44, 56, "#1e2438"); R(g, 592, 94, 40, 52, "#2a2a52"); PX.text(g, "{ }", 612, 112, { size: 8, col: "#f25ca8", align: "center" });
        R(g, 220, 70, 56, 40, "#1e2438"); R(g, 222, 72, 52, 36, "#24304e"); for (let i = 0; i < 4; i++) R(g, 228, 78 + i * 7, 40 - i * 6, 2, "#5fe3e8");
      });
      // ---- lamp light (left) + monitor light
      G(g, 70, 248, 140, "rgba(255,190,110,0.4)", 1);
      G(g, 448, 160, 190, "rgba(90,160,255,0.22)", 1);
      // ---- main: desk, monitor, dev (depth 1)
      PX.par(g, c, 1, () => {
        // monitor
        R(g, SX - 9, SY - 9, SW + 18, SH + 18, "#14161c"); R(g, SX - 8, SY - 8, SW + 16, SH + 16, "#22262f"); R(g, SX - 8, SY - 8, SW + 16, 1, "#4a505e"); R(g, SX - 8, SY - 8, 1, SH + 16, "#3a3f4b");
        R(g, SX + SW / 2 - 6, SY + SH + 8, 12, 36, "#1a1d24"); R(g, SX + SW / 2 - 6, SY + SH + 8, 2, 36, "#2a2e38"); R(g, SX + SW / 2 - 26, SY + SH + 42, 52, 4, "#22262f");
        R(g, SX, SY, SW, SH, "#0d1117"); R(g, SX, SY, SW, 10, "#161b22"); R(g, SX + 4, SY + 2, 50, 8, "#0d1117");
        PX.text(g, "users.py", SX + 7, SY + 1, { font: "v", size: 10, col: "#c9d1d9" });
        EXPL.forEach(([ind, seg], i) => {
          const y = lineY(i), on = i === line && t >= 1.0, bad = stuck && i === 7;
          if (on || bad) { const col = bad ? (PX.blink(t, 0.5, 0.65) ? "#5a1a22" : "#3a1018") : "#1f3a5a"; R(g, SX + 1, y, SW - 2, LH - 1, col); R(g, SX + 1, y, 2, LH - 1, bad ? "#ff4d4d" : "#5fe3e8"); }
          R(g, SX + 9, y + 6, 2, 2, on || bad ? "#9aa4b2" : "#30363d");
          let lx = SX + 20 + ind * 12;
          seg.forEach(([txt, col]) => { lx += PX.text(g, txt, lx, y, { font: "v", size: 12, col: bad ? "#ffb0b0" : col }); });
        });
        if (stuck) G(g, SX + SW / 2, lineY(7) + 7, 90, "rgba(255,77,77,0.45)", 0.8);
        R(g, SX, SY, SW, 1, "rgba(255,255,255,.08)");
        // sticky note slap
        if (t >= hw) {
          const k = PX.p(t, hw, 0.22, "in"), nx = SX + SW - 82, ny = SY + 8 - Math.round((1 - k) * 120), sq = t - hw < 0.32 && t - hw > 0.22 ? 2 : 0;
          R(g, nx + 3, ny + 3 + sq, 76, 44 - sq, "rgba(0,0,0,.4)");
          R(g, nx, ny + sq, 76, 44 - sq, "#d8b030"); R(g, nx, ny + sq, 76, 8, "#c09a20"); R(g, nx, ny + 8 + sq, 76, 1, "#e8c848");
          R(g, nx + 66, ny + 34, 10, 10, "#a8841a");
          PX.text(g, "HOMEWORK", nx + 38, ny + 20 + sq, { size: 8, col: "#2a1a10", align: "center" });
          R(g, nx + 8, ny + 32 + sq, 44, 1, "#8a6a1a");
          if (t - hw > 0.22 && t - hw < 0.6) { const kk = (t - hw - 0.22) / 0.38; for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1], [0, -1]]) A(g, 1 - kk, () => R(g, nx + 38 + dx * (44 + kk * 14), ny + 22 + dy * (26 + kk * 10), 3, 2, "#f7c948")); }
        }
        // desk
        R(g, -40, 292, 720, 8, "#5a3e2b"); R(g, -40, 292, 720, 2, "#7a573d"); R(g, -40, 300, 720, 60, "#1a1410"); R(g, -40, 300, 720, 2, "#100c08");
        R(g, 360, 306, 120, 30, "#221a14"); R(g, 360, 306, 120, 1, "#3a2c20"); R(g, 412, 318, 16, 3, "#6a5038");
        R(g, 370, 284, 120, 8, "#22252e"); R(g, 370, 284, 120, 1, "#4a4e5e"); for (let i = 0; i < 19; i++) R(g, 373 + i * 6, 286 + (stuck ? 0 : ((Math.floor(t * 9) + i * 5) % 17 === 0 ? 1 : 0)), 5, 2, "#5a6270");
        for (let i = 0; i < 3; i++) { R(g, 250 + i * 4, 286 - i * 2, 60, 6, ["#8a8e9a", "#9aa0ac", "#7a808c"][i]); }
        // lamp + mug + PC tower
        R(g, 48, 286, 26, 6, "#2b2f38"); R(g, 58, 240, 4, 46, "#3a3f4b"); R(g, 50, 230, 26, 12, "#3a3f4b"); R(g, 52, 241, 22, 2, "#ffd28a");
        PX.core.mug(g, 98, 282, t);
        R(g, 596, 196, 40, 96, "#16181f"); R(g, 596, 196, 40, 1, "#3a3f4b"); R(g, 596, 196, 1, 96, "#2a2e38");
        for (let i = 0; i < 5; i++) R(g, 602, 206 + i * 6, 28, 2, `hsl(${Math.round((t * 60 + i * 30) % 360)},70%,55%)`);
        R(g, 628, 282, 3, 3, PX.blink(t, 0.4, 0.5) ? "#3df56b" : "#1a4a2a");
        // the dev: front-facing, seated behind the desk, pointer in the right hand
        const DX = 196, bob = Math.round(Math.sin(t * 1.8) * 0.6);
        const ptY = lineY(Math.min(line, 7)) + 7, eased = t < 1.0 ? 0 : PX.p(t, 1.0 + line * step, 0.25, "back");
        const prevY = lineY(Math.max(0, line - 1)) + 7, ty = line === 0 ? ptY : lerp(prevY, ptY, eased);
        const scratch = stuck && t > stop + 1.4 && t < stop + 4.6;
        const face = t >= hw ? "sad" : stuck ? (t > stop + 4.6 ? "focus" : "sweat") : PX.blink(t, 0.45, 0.5) ? "happy" : "neutral";
        const handR = [DX + 72, 236 + (ty - 150) * 0.3];
        const P = L.person(g, DX, 308, { h: 128, seated: true, noLegs: true, ...DEV, face, bob, lit: 1, look: 2,
          hands: { r: scratch ? [DX + 22, 222 + Math.round(Math.sin(t * 14) * 2)] : handR, l: [DX - 26, 292] } });
        headphones(g, P);
        // talking mouth while narrating
        if (!stuck && t >= 1.0 && PX.blink(t, 0.22, 0.5)) R(g, P.hx - 1, P.hy + Math.round(P.hh * 0.78), 3, 2, "#5a1a1a");
        // pointer stick from the hand to the line
        if (!scratch) { const [hx, hy] = P.hr; thick(g, hx + 2, hy - 1, SX - 3, ty, 2, "#c8a060"); R(g, SX - 5, ty - 1, 3, 3, stuck ? "#ff4d4d" : "#e8e8f0"); }
        if (stuck) L.sweat(g, P.hx + 14, P.hy + 2, t, 2, 9);
        // desk front edge in front of the dev's lap
        R(g, 110, 298, 180, 2, "#2a1f17");
      });
      // ---- speech bubble (narration as squiggle words, then the stuck sentence)
      const BX = 36, BY = 30, BW = 228, BH = 66;
      if (t >= 0.9) {
        const k = pop(t, 0.9, 0.35);
        A(g, cl((t - 0.9) * 5, 0, 1), () => {
          bubble(g, BX, BY + Math.round((1 - k) * 8), BW, BH, 186, 220, stuck ? "#d6c8ca" : "#c4ccd8", "#0c1020");
          if (!stuck) {
            const rows = Math.min(3, line + 1);
            for (let r = 0; r < rows; r++) { const li = line - rows + 1 + r; let x = BX + 12; const rr = PX.rnd(li * 31 + 7);
              const grow = r === rows - 1 ? cl((t - 1.0 - li * step) / (step * 0.8), 0, 1) : 1, maxX = BX + 12 + (BW - 24) * grow;
              while (x < BX + BW - 30 && x < maxX) { const w = 10 + Math.floor(rr() * 26); squiggle(g, x, BY + 14 + r * 16, Math.min(w, maxX - x), t, "#3a4660", li + x); x += w + 6; } }
          } else {
            PX.text(g, "...AND THEN THIS PART", BX + BW / 2, BY + 18, { size: 8, col: "#3a1a1a", align: "center" });
            PX.text(g, "DOES SOMETHING", BX + BW / 2, BY + 36, { size: 8, col: "#b02a2a", align: "center" });
          }
        });
      }
      if (stuck) for (let i = 0; i < 3; i++) { const kq = pop(t, stop + 0.2 + i * 0.15, 0.3); if (kq > 0) PX.otext(g, "?", 262 + i * 14, 168 - Math.round(kq * 8) + Math.round(Math.sin(t * 3 + i) * 2), { size: 16, col: ["#f7c948", "#ff6a6a", "#5fe3e8"][i] }); }
      // ---- title label
      if (t >= t0) A(g, cl((t - t0) * 3, 0, 1), () => PX.otext(g, "DON'T SHIP WHAT YOU CAN'T EXPLAIN", 320, 8, { size: 8, align: "center", col: "#f7c948" }));
      PX.particles(g, 51, 20, t, [30, 190, 160, 100], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.6 });
      PX.vignette(g, 0.55);
    };
  };
  // =============================================================================================
  // guess_first: top-down desk at night. o.timer (2.5) the hand flips a 30-second sand timer, then scribbles two lines;
  // o.ai (7.5) an AI answer card slides in; o.match (11.0) "MATCH -> GREAT"; o.diff (13.5) card swaps, "DIFFERENT ->
  // WORTH LEARNING"; o.skip (17.5) notepad slides away, four AI cards fan out, all ticked: "EVERY ANSWER LOOKS RIGHT".
  // =============================================================================================
  const arrowLabel = (g, a, b, x, y, t, t0, col, t1) => {
    if (t < t0) return; const k = pop(t, t0, 0.3), wa = PX.tw(g, a, { size: 8 }), wb = PX.tw(g, b, { size: 8 }), w = wa + wb + 30, x0 = Math.round(x - w / 2), yy = y + Math.round((1 - k) * 6);
    const fade = t1 !== undefined ? 1 - cl((t - t1) / 0.3, 0, 1) : 1; if (fade <= 0) return;
    A(g, cl((t - t0) * 6, 0, 1) * fade, () => { R(g, x0 - 9, yy - 7, w + 18, 22, "rgba(8,10,20,.82)"); bubble(g, x0 - 9, yy - 7, w + 18, 22, undefined, 0, "#0e1220", col);
      PX.text(g, a, x0, yy, { size: 8, col }); const ax = x0 + wa + 8; R(g, ax, yy + 3, 11, 2, col); for (let i = 0; i < 4; i++) R(g, ax + 10 - i, yy + 4 - i, 1, 1 + 2 * i - 1 + 1, col);
      PX.text(g, b, x0 + wa + 30, yy, { size: 8, col }); });
  };
  const ANS = [
    [[0, 34, "#ff7b72"], [1, 46, "#d2a8ff"], [1, 30, "#c9d1d9"]],                          // matches the guess
    [[0, 24, "#ffa657"], [1, 54, "#79c0ff"], [2, 36, "#c9d1d9"], [1, 20, "#ff7b72"]],       // a different approach
    [[0, 40, "#7ee787"], [1, 30, "#c9d1d9"], [1, 44, "#d2a8ff"]],
    [[0, 30, "#79c0ff"], [2, 40, "#ffa657"], [1, 26, "#c9d1d9"]],
  ];
  const aiCard = (g, x, y, w, h, t, v, ticked) => {
    R(g, x + 3, y + 4, w, h, "rgba(0,0,0,.5)");
    R(g, x, y, w, h, "#2a3a52"); R(g, x + 1, y + 1, w - 2, h - 2, "#121a2a"); R(g, x + 1, y + 1, w - 2, 14, "#1a2640"); R(g, x + 1, y + 1, w - 2, 1, "#3a5070");
    bot(g, x + 12, y + 9, 14, t, { mouth: "smile", ph: v });
    R(g, x + 24, y + 6, 30, 3, "#5a7090");
    const sc = w / 180;
    ANS[v].forEach(([ind, len, col], i) => { R(g, x + 10 + ind * 10 * sc, y + 24 + i * Math.round(13 * sc + 2), Math.round(len * 2 * sc), 4, col); R(g, x + 10 + ind * 10 * sc, y + 24 + i * Math.round(13 * sc + 2), 2, 4, sh(col, 1.3)); });
    if (ticked) { const tx = x + 8, ty = y + h - 30; G(g, tx + 11, ty + 11, 26, "rgba(61,245,107,0.75)", 0.8 + 0.2 * Math.sin(t * 5 + v)); R(g, tx - 2, ty - 2, 26, 26, "#0e2a18"); tick(g, tx + 1, ty + 1, 20, "#3df56b"); }
  };
  K.guess_first = (o) => {
    need();
    return (g, t, d, c) => {
      const tT = T(o, "timer", 2.5, d, 21), tA = T(o, "ai", 7.5, d, 21), tM = T(o, "match", 11.0, d, 21), tD = T(o, "diff", 13.5, d, 21), tS = T(o, "skip", 17.5, d, 21);
      const wr = [tT + 0.6, tT + 2.4, tT + 4.4];                       // writing: line 1 from wr[0] to wr[1], line 2 to wr[2]
      const away = PX.p(t, tS, 0.7, "in") * 420;                      // notepad + timer slide off left
      const NX = 150 - away, NY = 72, NW = 156, NH = 232;
      const TX = 82 - away, TY = 150;
      let tip = null;
      // ---- desk surface (depth 0.7)
      PX.par(g, c, 0.7, () => {
        R(g, -40, -20, 720, 400, "#2e1e14");
        for (let y = -20; y < 380; y += 26) { R(g, -40, y, 720, 1, "#1c1008"); R(g, -40, y + 1, 720, 1, "#3e2a1a");
          const r = PX.rnd(y + 99); for (let i = 0; i < 14; i++) { const gx = -40 + r() * 720, gy = y + 4 + r() * 18; R(g, gx, gy, 10 + r() * 30, 1, "#281809"); } }
        A(g, 0.25, () => { PX.circle(g, 590, 300, 14, "#22140a"); PX.circle(g, 590, 300, 12, "#3a2618"); });        // coffee ring
      });
      // lamp pool (top-left) + cool moonlight from the right
      G(g, 120, 90, 300, "rgba(255,200,130,0.32)", 1);
      G(g, 660, 260, 300, "rgba(90,120,220,0.22)", 1);
      // ---- main objects (depth 1)
      PX.par(g, c, 1, () => {
        // keyboard (top edge) + phone + mug
        R(g, 230, -10, 220, 40, "#1c1e26"); R(g, 230, 29, 220, 1, "#3a3e4c");
        for (let r = 0; r < 3; r++) for (let k = 0; k < 18; k++) R(g, 236 + k * 12, -2 + r * 10, 10, 8, (r * 18 + k) % 7 === 3 ? "#3a3e4c" : "#2a2d38");
        R(g, 520, 170, 30, 56, "#14161c"); R(g, 520, 170, 30, 1, "#3a3e4c"); R(g, 531, 174, 8, 2, "#2a2d38");
        PX.circle(g, 40, 30, 34, "#1a1c24"); PX.circle(g, 40, 30, 30, "#2e6a4a"); PX.circle(g, 36, 26, 18, "#3e8a62"); PX.circle(g, 40, 30, 7, "#c09a40"); G(g, 40, 30, 70, "rgba(255,220,150,0.5)", 0.8);
        PX.circle(g, 580, 70, 18, "#1e2028"); PX.circle(g, 580, 70, 16, "#d0c8b8"); PX.circle(g, 580, 70, 13, "#3a2014"); R(g, 572, 63, 6, 2, "#6a4428"); R(g, 596, 66, 9, 8, "#d0c8b8");
        // sand timer (side view on its stand), flips at tT
        const fk = cl((t - tT) / 0.45, 0, 1), flipping = t >= tT && fk < 1, sq = flipping ? Math.abs(Math.cos(fk * Math.PI)) : 1;
        const sandUp = t < tT ? 0 : 1 - cl((t - tT - 0.45) / 30, 0, 1);    // fraction of sand still in the top bulb
        const th2 = Math.max(2, Math.round(28 * sq));
        R(g, TX - 18, TY - th2 - 4, 36, 4, "#6a4a2c"); R(g, TX - 18, TY + th2, 36, 4, "#6a4a2c"); R(g, TX - 18, TY - th2 - 4, 36, 1, "#9a7448");
        for (const s of [-1, 1]) R(g, TX + s * 16 - 1, TY - th2, 2, th2 * 2, "#8a6a40");
        for (let i = 0; i < th2; i++) { const k = i / th2, w = Math.round(2 + 11 * Math.pow(k, 0.7));
          R(g, TX - w, TY - 1 - i, 2 * w, 1, "#2a3448"); R(g, TX - w, TY + i, 2 * w, 1, "#2a3448"); }
        if (!flipping) {
          const topH = Math.round(24 * (t < tT ? 0 : sandUp)), botH = Math.round(24 * (t < tT ? 1 : 1 - sandUp));
          for (let i = 0; i < topH; i++) { const k = (i + 1) / 28, w = Math.round(2 + 11 * Math.pow(k, 0.7)) - 1; R(g, TX - w, TY - 2 - i, 2 * w, 1, "#e0b860"); }
          for (let i = 0; i < botH; i++) { const k = (28 - i) / 28, w = Math.round(2 + 11 * Math.pow(k, 0.7)) - 1; R(g, TX - w, TY + 27 - i, 2 * w, 1, i === botH - 1 ? "#f0d080" : "#d0a850"); }
          if (t > tT && sandUp > 0) R(g, TX, TY - 1, 1, 27 - botH, "#e0b860");
        }
        for (let i = 0; i < th2; i += 4) R(g, TX - 8, TY - th2 + i, 1, 2, "rgba(255,255,255,.18)");
        PX.text(g, "30 SEC", TX, TY + th2 + 8, { font: "v", size: 12, col: "#c8a878", align: "center" });
        // notepad
        R(g, NX + 4, NY + 5, NW, NH, "rgba(0,0,0,.45)");
        R(g, NX, NY, NW, NH, "#7a6824"); R(g, NX, NY, NW - 1, NH - 1, "#94802e"); R(g, NX, NY + 14, NW - 1, 1, "#a8923a"); R(g, NX, NY, NW, 14, "#7a2a2a"); R(g, NX, NY + 13, NW, 1, "#4a1a1a");
        for (let i = 0; i < 13; i++) R(g, NX, NY + 30 + i * 15, NW - 1, 1, "#6e7060");
        R(g, NX + 22, NY + 14, 1, NH - 14, "#b04a3a");
        // scribbles: two lines of handwriting
        const scrib = (j, k) => { const x0 = NX + 28, base = NY + 26 + j * 15 + 15, w = j === 0 ? 112 : 96, n = Math.floor(w * k);
          let px = x0, py = base; for (let i = 0; i <= n; i++) { const gap = (i % 31) > 26; const x = x0 + i, y = base - 2 + Math.round(Math.sin(i * 0.55 + j) * 2.4 - Math.abs(Math.sin(i * 0.21 + j * 2)) * 2);
            if (!gap) { PX.line(g, px, py, x, y, "#14205a"); PX.line(g, px, py + 1, x, y + 1, "#14205a"); } px = x; py = y; } return [px, py]; };
        const k1 = cl((t - wr[0]) / (wr[1] - wr[0]), 0, 1), k2 = cl((t - wr[1]) / (wr[2] - wr[1]), 0, 1);
        if (t >= wr[0]) tip = scrib(0, k1); if (t >= wr[1]) tip = scrib(1, k2);
        // match / diff connectors from the guess lines to the card
        const onCard = (t >= tM && t < tS);
        if (onCard) { const col = t < tD ? "#3df56b" : "#f7c948";
          for (let j = 0; j < 2; j++) { const y1 = NY + 38 + j * 15, y2 = 120 + j * 15; for (let x = NX + NW + 2; x < 352; x += 6) R(g, x, Math.round(lerp(y1, y2, (x - NX - NW) / (352 - NX - NW))), 3, 1, col); } }
        // AI answer card(s)
        if (t >= tA && t < tS + 0.2) {
          const ks = PX.p(t, tA, 0.5, "back"), cx = Math.round(lerp(700, 352, ks));
          const sw = t >= tD - 0.15 && t < tD + 0.15 ? Math.abs((t - tD) / 0.15) : 1, v = t < tD ? 0 : 1;
          const cw = Math.max(2, Math.round(180 * sw));
          clip(g, cx + 90 - cw / 2, 0, cw, 360, () => aiCard(g, cx, 96, 180, 112, t, v, false));
          if (t >= tM && t < tD - 0.15) { const kt = pop(t, tM, 0.3); if (kt > 0) { R(g, cx + 150, 176, 24, 24, "#0e2a18"); tick(g, cx + 152, 178, 20 * Math.min(kt, 1), "#3df56b"); } }
        }
        if (t >= tS) {
          for (let i = 0; i < 4; i++) { const kf = PX.p(t, tS + 0.35 + i * 0.12, 0.5, "back");
            const tx = [96, 202, 308, 414][i], ty = [118, 96, 92, 112][i];
            const x = Math.round(lerp(352, tx, kf)), y = Math.round(lerp(96, ty, kf));
            aiCard(g, x, y, 124, 108, t, i, kf > 0.6); }
        }
      });
      // ---- the hand with a pencil (green hoodie sleeve), depth 1.15
      const handPos = () => {
        if (t >= tS) { const k = PX.p(t, tS - 0.1, 0.6, "in"); return [lerp(NX + 140 + away, 520, k), lerp(NY + 100, 460, k)]; }
        if (tip && t < wr[2] + 0.05) return [tip[0], tip[1]];
        if (t >= wr[2]) { const k = PX.p(t, wr[2], 0.6); return [lerp(NX + 124, NX + 150, k), lerp(NY + 68, NY + 120, k) + Math.round(Math.sin(t * 6) * 1)]; }
        const kin = PX.p(t, 0.4, 0.9, "out"), kf = PX.p(t, tT + 0.45, 0.4);
        const atTimer = [TX + 16, TY + 4 + (t >= tT && t < tT + 0.45 ? -Math.sin(((t - tT) / 0.45) * Math.PI) * 10 : 0)];
        const pre = [lerp(470, atTimer[0], kin), lerp(460, atTimer[1], kin)];
        return t < tT + 0.45 ? pre : [lerp(atTimer[0], NX + 28, kf), lerp(atTimer[1], NY + 40, kf)];
      };
      const [hx, hy] = handPos();
      if (hy < 420) PX.par(g, c, 1.15, () => {
        const writing = t >= wr[0] && t < wr[2];
        const px = Math.round(hx), py = Math.round(hy) + (writing ? Math.round(Math.sin(t * 30)) : 0);
        thick(g, px + 40, py + 50, px + 150, py + 200, 40, "#1e4a2a"); thick(g, px + 36, py + 46, px + 146, py + 196, 32, "#2f7a40"); thick(g, px + 30, py + 40, px + 140, py + 190, 8, "#46985a");
        for (let i = 0; i < 4; i++) thick(g, px + 52 + i * 26, py + 66 + i * 36, px + 60 + i * 26, py + 60 + i * 36, 2, "#1e4a2a");
        thick(g, px + 27, py + 33, px + 35, py + 41, 26, "#1e4a2a"); thick(g, px + 27, py + 32, px + 33, py + 38, 20, "#2a6a38");
        // hand (from above) holding a pencil
        ell(g, px + 18, py + 22, 13, 11, "#7a4a24"); ell(g, px + 18, py + 21, 12, 10, "#a86b3c"); ell(g, px + 15, py + 18, 7, 5, "#c48850");
        for (let i = 0; i < 3; i++) R(g, px + 22 + i * 3, py + 12 + i * 2, 2, 6, "#8a5630");
        thick(g, px + 1, py + 1, px + 22, py + 18, 3, "#e0b030"); R(g, px, py, 2, 2, "#2a2a3a"); R(g, px + 1, py + 1, 2, 2, "#e8c890");
        ell(g, px + 8, py + 12, 4, 3, "#a86b3c"); R(g, px + 6, py + 10, 3, 1, "#c48850");
      });
      // ---- steam from the mug + dust in the lamp light
      for (let i = 0; i < 3; i++) { const k = frac(t * 0.4 + i / 3); A(g, 0.35 * (1 - k), () => R(g, 578 + Math.sin(k * 6 + i) * 6, 64 - k * 40, 3, 5, "#c8c0b8")); }
      PX.particles(g, 61, 22, t, [20, 20, 260, 200], { vy: -2, vx: 2, col: "#ffe2b0", a: 0.55 });
      // ---- labels
      arrowLabel(g, "MATCH", "GREAT", 442, 236, t, tM + 0.2, "#3df56b", tD - 0.15);
      arrowLabel(g, "DIFFERENT", "WORTH LEARNING", 442, 236, t, tD + 0.25, "#f7c948", tS);
      if (t >= tS + 1.0) plate(g, "EVERY ANSWER LOOKS RIGHT", 320, 262, t, tS + 1.0, "#3df56b");
      PX.vignette(g, 0.55);
    };
  };
  // =============================================================================================
  // autopilot: airliner cockpit at night over moonlit clouds, relaxed captain (hands behind head), glowing "AP" lamp.
  // o.disc (1.5): red "AUTOPILOT DISCONNECT" flashes, he grabs the yoke, the horizon rolls; level again by o.steady (4.5).
  // =============================================================================================
  K.autopilot = (o) => {
    need();
    let OUT = null;                                    // scratch buffer for the outside view (re-drawn every frame)
    const outside = (q, t) => {
      q.setTransform(1, 0, 0, 1, 0, 80); q.clearRect(0, -80, 640, 520);
      PX.vgrad(q, 0, -80, 640, 196, "060a1e", "2e2c62", 9);
      const r = PX.rnd(5); for (let i = 0; i < 90; i++) { const x = r() * 640, y = -80 + r() * 180; q.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i)); R(q, x, y, 1, 1, "#e8ecff"); } q.globalAlpha = 1;
      G(q, 470, 34, 70, "rgba(200,210,255,0.5)", 1); PX.circle(q, 470, 34, 13, "#eeeacc"); PX.circle(q, 474, 31, 11, "#dcd8b8");
      G(q, 470, 118, 220, "rgba(150,140,230,0.25)", 1);                         // horizon glow under the moon
      // cloud sea: rows from the horizon toward the camera, scrolling under us
      R(q, 0, 114, 640, 330, "#262c5c");
      for (let row = 0; row < 9; row++) {
        const y = 116 + row * row * 4 + row * 5, sp = 5 + row * row * 4, step = 26 + row * 14, rr = Math.round(5 + row * 3.2);
        const k = row / 8, base = `rgb(${Math.round(lerp(46, 70, k))},${Math.round(lerp(54, 82, k))},${Math.round(lerp(104, 140, k))})`;
        const hl = `rgb(${Math.round(lerp(96, 150, k))},${Math.round(lerp(104, 160, k))},${Math.round(lerp(170, 220, k))})`, dk = `rgb(${Math.round(lerp(34, 44, k))},${Math.round(lerp(40, 50, k))},${Math.round(lerp(84, 100, k))})`;
        const off = (t * sp) % step;
        R(q, 0, y + rr, 640, 2, dk);
        for (let x = -step - off; x < 680; x += step) { const j = Math.round(Math.sin((x + off + row * 37) * 0.13) * 3);
          PX.circle(q, x, y + j, rr, base); PX.circle(q, x + step * 0.45, y + j + 2, Math.round(rr * 0.8), base); R(q, x - rr, y + j, step + rr, rr + 4, base);
          R(q, x - Math.round(rr * 0.7), y + j - rr + 1, Math.round(rr * 1.2), 1, hl); R(q, x - Math.round(rr * 0.4), y + j - rr + 2, Math.round(rr * 0.6), 1, hl); }
      }
      for (let i = 0; i < 30; i++) { const x = 440 + Math.sin(i * 1.7) * 40 + (i % 5) * 6, y = 120 + i * 4; if (PX.blink(t + i * 0.13, 0.9, 0.5)) R(q, x, y, 2, 1, "#b8c4f0"); }
      q.setTransform(1, 0, 0, 1, 0, 0);
    };
    return (g, t, d, c) => {
      const disc = T(o, "disc", 1.5, d, 7.0), steady = T(o, "steady", 4.5, d, 7.0);
      const alarm = t >= disc && t < steady + 0.4, fl = alarm && PX.blink(t - disc, 0.36, 0.55);
      const roll = (t < disc ? 0 : PX.KF([[disc, 0], [disc + 0.7, -13], [disc + 1.4, -8], [disc + 2.1, -10.5], [steady - 0.5, -2.5], [steady, 0]], t)) + (alarm ? Math.sin(t * 9) * 0.6 : 0) + Math.sin(t * 0.7) * 0.4;
      const pitch = t < disc ? 0 : PX.KF([[disc, 0], [disc + 0.8, 10], [disc + 2, 4], [steady, 0]], t);
      const ta = Math.tan((roll * Math.PI) / 180);
      if (!OUT) { OUT = document.createElement("canvas"); OUT.width = 640; OUT.height = 520; }
      const q = OUT.getContext("2d"); outside(q, t);
      // ---- outside, sheared column by column (a crisp roll): depth 0.3
      R(g, 0, 0, 640, 360, "#060a1e");
      PX.par(g, c, 0.3, () => { for (let x = -40; x < 680; x++) { const sx = cl(x, 0, 639), dy = Math.round((x - 320) * ta + pitch); g.drawImage(OUT, sx, 80 - dy, 1, 360, x, 0, 1, 360); } });
      // ---- cockpit shell (depth 1)
      PX.par(g, c, 1, () => {
        const F = "#14161e", FH = "#353a4c";
        // overhead panel
        R(g, -40, -10, 720, 36, F); R(g, -40, 25, 720, 2, FH);
        for (let i = 0; i < 26; i++) { const x = 40 + i * 22; R(g, x, 6, 14, 12, "#1c1f2a"); R(g, x + 5, 8 + (i % 3), 4, 6, "#4a5064"); if (i % 4 === 1) R(g, x + 2, 16, 3, 2, PX.blink(t + i, 2.3, 0.85) ? "#f7c948" : "#4a3a18"); }
        // windshield pillars
        g.fillStyle = F; g.beginPath(); g.moveTo(-40, 0); g.lineTo(60, 26); g.lineTo(26, 196); g.lineTo(-40, 196); g.fill();
        g.beginPath(); g.moveTo(680, 0); g.lineTo(580, 26); g.lineTo(614, 196); g.lineTo(680, 196); g.fill();
        PX.line(g, 60, 27, 27, 194, FH); PX.line(g, 580, 27, 613, 194, FH);
        R(g, 312, 26, 16, 170, F); R(g, 312, 26, 1, 170, FH); R(g, 327, 26, 1, 170, "#0c0d12");
        // glareshield
        R(g, -40, 188, 720, 22, "#0e1016"); R(g, -40, 188, 720, 2, "#2a2e3c"); R(g, -40, 209, 720, 2, "#06070a");
        // annunciator: AUTOPILOT DISCONNECT
        R(g, 226, 192, 188, 15, "#1a0a0c"); R(g, 228, 193, 184, 13, fl ? "#a01818" : alarm ? "#3a0c10" : "#20100f");
        PX.text(g, "AUTOPILOT DISCONNECT", 320, 196, { size: 8, col: fl ? "#ffe0e0" : alarm ? "#a03030" : "#3a1a1a", align: "center" });
        if (fl) G(g, 320, 199, 110, "rgba(255,60,60,0.8)", 0.9);
        // master warning buttons
        for (const wx of [196, 444]) { R(g, wx - 9, 192, 18, 15, "#200a0a"); R(g, wx - 8, 193, 16, 13, fl ? "#ff4d4d" : "#401010"); if (fl) G(g, wx, 199, 24, "rgba(255,80,80,0.9)", 0.9); }
        // MCP with the AP lamp
        R(g, 470, 191, 110, 17, "#1c1f28"); for (let i = 0; i < 5; i++) R(g, 476 + i * 14, 196, 10, 7, "#2c3040");
        const apOn = t < disc;
        R(g, 552, 194, 22, 11, apOn ? "#1a4a2a" : "#1a1e24"); PX.text(g, "AP", 563, 195, { size: 8, col: apOn ? "#5dff8a" : "#3a4048", align: "center" });
        if (apOn) G(g, 563, 199, 26, "rgba(61,245,107,0.9)", 0.8 + 0.1 * Math.sin(t * 3));
        // main instrument panel
        R(g, -40, 211, 720, 160, "#1a1d26"); R(g, -40, 211, 720, 1, "#2a2e3a");
        for (let i = 0; i < 14; i++) R(g, 10 + i * 46, 216, 2, 2, "#3a3e4c");
        // PFD with attitude indicator (rolls with the horizon)
        const ai = (cx, cy, rad) => {
          for (let yy = -rad; yy <= rad; yy++) { const w = Math.floor(Math.sqrt(rad * rad - yy * yy));
            for (let xx = -w; xx <= w; xx++) { const hy = (xx) * ta * 1.0 + pitch * 0.3; R(g, cx + xx, cy + yy, 1, 1, yy < hy ? "#2a6ab8" : "#7a4a24"); } }
          for (let xx = -rad; xx <= rad; xx++) { const yy = Math.round(xx * ta + pitch * 0.3); if (xx * xx + yy * yy < rad * rad) R(g, cx + xx, cy + yy, 1, 1, "#e8f0ff"); }
          R(g, cx - 12, cy, 8, 2, "#f7c948"); R(g, cx + 5, cy, 8, 2, "#f7c948"); R(g, cx - 1, cy - 1, 3, 3, "#f7c948");
        };
        const screen = (x, y, w, h) => { R(g, x - 3, y - 3, w + 6, h + 6, "#0c0d12"); R(g, x, y, w, h, "#080c14"); R(g, x, y, w, 1, "#1e2a3a"); };
        screen(196, 222, 70, 64); ai(231, 254, 26);
        R(g, 198, 226, 8, 56, "#141c2a"); R(g, 256, 226, 8, 56, "#141c2a"); for (let i = 0; i < 6; i++) { R(g, 200, 230 + i * 9, 4, 1, "#7ab0d0"); R(g, 258, 230 + i * 9, 4, 1, "#7ab0d0"); }
        G(g, 231, 254, 50, "rgba(90,160,255,0.35)", 0.8);
        // ND: route line + range arcs
        screen(276, 222, 70, 64);
        for (let a2 = -1.1; a2 < 1.1; a2 += 0.03) { R(g, 311 + Math.sin(a2) * 40, 282 - Math.cos(a2) * 40, 1, 1, "#3a5a7a"); R(g, 311 + Math.sin(a2) * 22, 282 - Math.cos(a2) * 22, 1, 1, "#3a5a7a"); }
        PX.line(g, 311, 280, 311 + Math.round(roll * 1.2), 228, "#e060e0"); R(g, 309, 276, 5, 6, "#f7c948");
        // engine display + FO screens
        screen(366, 222, 56, 64); for (let i = 0; i < 2; i++) { PX.circle(g, 382 + i * 24, 242, 9, "#1a2432"); PX.line(g, 382 + i * 24, 242, 382 + i * 24 + 6, 236, "#5dff8a"); R(g, 375 + i * 24, 262, 14, 3, "#3a6a4a"); R(g, 375 + i * 24, 262, 10, 3, "#5dff8a"); }
        screen(440, 222, 60, 64); ai(470, 254, 22); screen(512, 222, 60, 64);
        for (let i = 0; i < 4; i++) R(g, 520, 234 + i * 12, 40 - i * 7, 2, "#3a8ab0");
        // throttle quadrant + coffee
        R(g, 284, 300, 92, 70, "#14161c"); R(g, 284, 300, 92, 1, "#3a3e4c");
        for (let i = 0; i < 2; i++) { R(g, 306 + i * 30, 296, 6, 40, "#3a3e4c"); R(g, 300 + i * 30, 290, 18, 9, "#7a808e"); R(g, 300 + i * 30, 290, 18, 2, "#aab0bc"); }
        const cupX = 396; R(g, cupX, 310, 16, 20, "#9a968c"); R(g, cupX, 310, 2, 20, "#bab6aa"); R(g, cupX + 16, 314, 4, 8, "#9a968c");
        for (let xx = 0; xx < 14; xx++) R(g, cupX + 1 + xx, 311 + Math.round((xx - 7) * -ta * 0.7), 1, 3, "#4a2a14");
        if (t > disc + 0.5 && t < disc + 1.3) { const k = (t - disc - 0.5) / 0.8; R(g, cupX + 18 + k * 14, 304 - Math.sin(k * Math.PI) * 14 + k * 10, 2, 2, "#6a3a1a"); R(g, cupX + 12 + k * 6, 302 - Math.sin(k * Math.PI) * 18 + k * 8, 2, 2, "#6a3a1a"); }
        G(g, 320, 254, 200, "rgba(80,170,230,0.12)", 1);
        // empty first-officer seat on the right
        R(g, 560, 236, 110, 140, "#101218"); R(g, 572, 224, 86, 30, "#14161e"); R(g, 572, 224, 86, 1, "#3a3e50"); R(g, 560, 236, 1, 140, "#2a2e3c");
      });
      // ---- the captain, from behind (depth 1.15)
      PX.par(g, c, 1.15, () => {
        const grab = t >= disc + 0.2, shake = alarm ? Math.round(Math.sin(t * 34) * 1.4) : 0;
        const HX = 120 + (grab ? 2 : 0), HY = 184 + (grab ? 3 : 0) + Math.round(Math.sin(t * 1.5) * (grab ? 0 : 0.7));
        const SHIRT = "#8a92a2", SH2 = "#5e6676", SH3 = "#aab2c2", SKIN = "#d09870";
        // yoke horns (gripped after the disconnect)
        if (grab) { for (const s of [-1, 1]) { const yx = HX + s * 64, yy = 282; R(g, yx - 4, yy - 14, 8, 26, "#24262e"); R(g, yx - 4, yy - 14, 2, 26, "#4a4e5c"); } }
        // arms behind torso when gripping: elbows out
        const sl = [HX - 46, 232], sr = [HX + 46, 232];
        if (grab) {
          L.limb(g, sl[0], sl[1], HX - 70, 262 + shake, 12, SHIRT, SH2); L.limb(g, HX - 70, 262 + shake, HX - 64, 280 + shake, 10, SHIRT, SH2);
          L.limb(g, sr[0], sr[1], HX + 70, 262 - shake, 12, SHIRT, SH2); L.limb(g, HX + 70, 262 - shake, HX + 64, 280 - shake, 10, SHIRT, SH2);
          for (const s of [-1, 1]) { ell(g, HX + s * 64, 280 + (s < 0 ? shake : -shake), 6, 5, SKIN); R(g, HX + s * 64 - 3, 276 + (s < 0 ? shake : -shake), 5, 1, "#f0c090"); }
        }
        // torso (back) with shoulders + epaulettes
        for (let r = 0; r < 140; r++) { const w = Math.round(Math.min(108, 70 + r * 1.4)); R(g, HX - w / 2, 220 + r, w, 1, SHIRT); R(g, HX - w / 2, 220 + r, 6, 1, SH2); R(g, HX + w / 2 - 4, 220 + r, 4, 1, SH3); }
        R(g, HX - 1, 224, 2, 130, SH2);
        for (const s of [-1, 1]) { const ex = HX + s * 36 - 11; R(g, ex, 222, 22, 7, "#14182a"); for (let i = 0; i < 4; i++) R(g, ex + 3 + i * 5, 223, 2, 5, "#e0b040"); }
        // neck + head (back view), headset
        R(g, HX - 9, 200, 18, 22, sh(SKIN, 0.82)); R(g, HX - 12, 214, 24, 7, SH3);
        const turn = grab ? 1 : 0;
        PX.circle(g, HX, HY, 22, "#2e2016"); PX.circle(g, HX - 3, HY - 5, 16, "#3e2c1e"); PX.circle(g, HX + 1, HY - 2, 17, "#2e2016");
        if (turn) { R(g, HX + 16, HY - 4, 7, 16, SKIN); R(g, HX + 20, HY - 2, 4, 12, sh(SKIN, 1.1)); R(g, HX + 18, HY + 10, 6, 6, SKIN); }
        R(g, HX - 22, HY - 2, 4, 10, SKIN);
        // headset band + ear cups
        for (let a2 = Math.PI; a2 <= 2 * Math.PI; a2 += 0.04) R(g, HX + Math.cos(a2) * 22, HY - 2 + Math.sin(a2) * 23, 3, 3, "#30333e");
        R(g, HX - 27, HY - 6, 8, 16, "#22242c"); R(g, HX - 27, HY - 6, 8, 2, "#4a4e5e"); R(g, HX + 20, HY - 6, 8, 16, "#22242c"); R(g, HX + 20, HY - 6, 8, 2, "#4a4e5e");
        // rim light from the moon / screens
        R(g, HX - 6, HY - 22, 14, 1, "#6a6aa0"); R(g, HX + 14, HY - 16, 2, 6, "#5a5a90");
        // relaxed: hands laced behind the head (drawn in front)
        if (!grab) {
          const bob2 = Math.round(Math.sin(t * 1.5) * 0.7);
          L.limb(g, sl[0], sl[1], HX - 44, 192 + bob2, 13, SHIRT, SH2); L.limb(g, HX - 44, 192 + bob2, HX - 8, 188 + bob2, 11, SHIRT, SH2);
          L.limb(g, sr[0], sr[1], HX + 44, 192 + bob2, 13, SHIRT, SH2); L.limb(g, HX + 44, 192 + bob2, HX + 8, 188 + bob2, 11, SHIRT, SH2);
          R(g, HX - 44, 186 + bob2, 10, 3, SH3); R(g, HX + 36, 186 + bob2, 10, 3, SH3);
          ell(g, HX, 190 + bob2, 10, 6, SKIN); for (let i = -2; i <= 2; i++) R(g, HX + i * 3, 187 + bob2, 1, 6, sh(SKIN, 0.8));
        } else if (alarm) L.sweat(g, HX + 26, HY - 18, t, 2, 3);
        // seat back (between us and him)
        R(g, HX - 62, 300, 124, 70, "#16181f"); R(g, HX - 62, 300, 124, 2, "#3a3e50"); R(g, HX - 62, 300, 3, 70, "#2a2e3c");
      });
      // ---- red alarm wash over the whole cockpit
      if (fl) A(g, 0.1, () => R(g, 0, 0, 640, 360, "#ff2a2a"));
      PX.vignette(g, 0.55);
    };
  };
  // =============================================================================================
  // assistants_off: the dev's lo-fi room. o.off (0.6) he flips the wall switch "AI ASSISTANTS" to OFF and the AI panel on
  // the monitor shuts with a CRT blink; he builds a tiny snake game by hand, slowly (sweat, crumpled paper).
  // o.humble (5.0): the snake finally eats the apple, small proud smile, label "HUMBLING".
  // =============================================================================================
  const SNAKE_CODE = [
    [0, [["def", "#ff7b72"], [" tick():", "#d2a8ff"]]],
    [1, [["head = ", "#c9d1d9"], ["next_cell", "#d2a8ff"], ["()", "#c9d1d9"]]],
    [1, [["if", "#ff7b72"], [" head == apple:", "#c9d1d9"]]],
    [2, [["grow", "#d2a8ff"], ["()", "#c9d1d9"]]],
    [1, [["else", "#ff7b72"], [":", "#c9d1d9"]]],
    [2, [["snake.", "#c9d1d9"], ["pop", "#d2a8ff"], ["()", "#c9d1d9"]]],
    [1, [["draw", "#d2a8ff"], ["()", "#c9d1d9"]]],
  ];
  const SNAKE_PATH = [[0, 10], [1, 10], [2, 10], [3, 10], [4, 10], [4, 9], [4, 8], [3, 8], [3, 7], [4, 7], [5, 7], [6, 7], [6, 6], [6, 5], [7, 5], [8, 5], [8, 4], [8, 3], [8, 2], [7, 2], [6, 2], [5, 2], [4, 2], [3, 2]];
  const APPLE_I = 17;
  K.assistants_off = (o) => {
    need();
    return (g, t, d, c) => {
      const off = T(o, "off", 0.6, d, 8.0), hum = T(o, "humble", 5.0, d, 8.0);
      const isOff = t >= off;
      const SX = 144, SY = 84, SW = 272, SH = 152, CPW = 150;
      // ---- far: window with rain + city (depth 0.45)
      PX.par(g, c, 0.45, () => {
        PX.vgrad(g, -40, 0, 720, 300, "161b34", "0c1020", 9);
        R(g, 6, 30, 118, 130, "#262b44"); PX.core.skyline(g, 12, 36, 106, 118, t, 14); L.rain(g, t, 21, 30, [12, 36, 106, 118], { a: 0.45 });
        R(g, 62, 36, 3, 118, "#262b44"); R(g, 12, 94, 106, 3, "#262b44"); R(g, 2, 158, 126, 5, "#343a58");
      });
      // ---- mid: fairy lights, shelf, poster (depth 0.7)
      PX.par(g, c, 0.7, () => {
        L.fairy(g, 130, 630, 14, 10, t, 14, 5);
        R(g, 450, 64, 120, 4, "#4a3626"); const bk = ["#a0392b", "#2970a9", "#279e60", "#7e44ad", "#c35400", "#16a085"];
        let bx = 456; bk.forEach((col, i) => { const h = 16 + (i * 5) % 8; R(g, bx, 64 - h, 7, h, col); R(g, bx, 64 - h, 1, h, sh(col, 1.4)); bx += 8; });
        R(g, 530, 46, 14, 18, "#3d6b4a"); R(g, 527, 58, 20, 6, "#7a4a2c");
        R(g, 460, 92, 50, 62, "#1e2438"); R(g, 462, 94, 46, 58, "#2c2440"); PX.circle(g, 485, 116, 10, "#3df56b"); R(g, 478, 112, 4, 4, "#0c1020");
      });
      G(g, 40, 250, 120, "rgba(255,190,110,0.35)", 1);
      G(g, 280, 160, 190, "rgba(90,160,255,0.2)", 1);
      // ---- main (depth 1)
      PX.par(g, c, 1, () => {
        // the wall switch "AI ASSISTANTS"
        const WX = 562, WY = 226;
        PX.otext(g, "AI", WX, 186, { font: "v", size: 16, col: "#cfe0ff", align: "center" });
        PX.otext(g, "ASSISTANTS", WX, 198, { font: "v", size: 16, col: "#cfe0ff", align: "center" });
        R(g, WX - 15, WY - 4, 30, 44, "#0c0e14"); R(g, WX - 14, WY - 3, 28, 42, "#c8ccd8"); R(g, WX - 14, WY - 3, 28, 1, "#eef0f6"); R(g, WX + 12, WY - 3, 2, 42, "#8a90a0");
        PX.text(g, "ON", WX, WY - 1, { font: "v", size: 10, col: isOff ? "#6a7080" : "#1a8a3a", align: "center" });
        PX.text(g, "OFF", WX, WY + 28, { font: "v", size: 10, col: isOff ? "#c02a2a" : "#6a7080", align: "center" });
        const lk = isOff ? PX.p(t, off, 0.18, "back") : 0, ly = Math.round(lerp(-9, 9, cl(lk, -0.2, 1.2)));
        R(g, WX - 5, WY + 13, 10, 10, "#9aa0ae"); R(g, WX - 3, WY + 17 + Math.min(0, ly), 6, Math.abs(ly) + 1, "#e0e4ec"); R(g, WX - 4, WY + 17 + ly - 2, 8, 4, isOff ? "#d03030" : "#30b050");
        if (isOff && t < off + 0.3) { const k = (t - off) / 0.3; for (let i = 0; i < 6; i++) { const an = i * 1.05; R(g, WX + Math.cos(an) * (8 + k * 14), WY + 18 + Math.sin(an) * (8 + k * 14), 2, 2, "#f7c948"); } }
        // monitor
        R(g, SX - 8, SY - 8, SW + 16, SH + 16, "#1a1d24"); R(g, SX - 8, SY - 8, SW + 16, 1, "#4a505e"); R(g, SX - 8, SY - 8, 1, SH + 16, "#3a3f4b");
        R(g, SX + SW / 2 - 6, SY + SH + 8, 12, 48, "#1a1d24"); R(g, SX + SW / 2 - 28, SY + SH + 52, 56, 4, "#22262f");
        R(g, SX, SY, SW, SH, "#0d1117"); R(g, SX, SY, SW, 10, "#161b22"); PX.text(g, "snake.py", SX + 6, SY + 1, { font: "v", size: 10, col: "#c9d1d9" });
        // code pane, typed slowly (with a retype)
        const t0 = off + 0.5, dip = Math.max(0, 1 - Math.abs(t - 3.0) / 0.5) * 7;
        let n = Math.max(0, Math.floor((t - t0) * 13 - dip)), cx = SX + 8, cy = SY + 14;
        SNAKE_CODE.forEach(([ind, seg], i) => { if (n <= 0 && i > 0) return; let lx = SX + 8 + ind * 10; const y = SY + 14 + i * 12;
          for (const [txt, col] of seg) { if (n <= 0) break; const k = Math.min(txt.length, n); lx += PX.text(g, txt.slice(0, k), lx, y, { font: "v", size: 12, col }); n -= k; }
          cx = lx; cy = y; n -= 1; });
        if (PX.blink(t, 0.9, 0.55)) R(g, cx + 1, cy + 2, 2, 9, "#e6edf3");
        R(g, SX + CPW, SY + 10, 1, SH - 10, "#30363d");
        // right pane: AI chat before, CRT blink-shut at off, then the snake game
        const px = SX + CPW + 1, pw = SW - CPW - 1, py = SY + 10, ph = SH - 10, pcx = px + pw / 2, pcy = py + ph / 2;
        const chat = () => { R(g, px, py, pw, ph, "#101826"); R(g, px, py, pw, 12, "#16233a");
          bot(g, px + 10, py + 6, 12, t, { mouth: "smile" }); PX.text(g, "ASSISTANT", px + 20, py + 1, { font: "v", size: 10, col: "#5fe3e8" });
          for (let i = 0; i < 4; i++) { const bw = 50 + ((i * 23) % 40), right = i % 2; R(g, right ? px + pw - bw - 6 : px + 6, py + 18 + i * 26, bw, 18, right ? "#1f3a5a" : "#24304a"); for (let j = 0; j < 2; j++) R(g, (right ? px + pw - bw - 6 : px + 6) + 4, py + 22 + i * 26 + j * 6, bw - 12 - j * 10, 2, "#7aa8c8"); } };
        if (!isOff) chat();
        else if (t < off + 0.32) {
          const k = (t - off) / 0.32;
          if (k < 0.5) { const hh = Math.max(1, Math.round(ph * (1 - k / 0.5))); clip(g, px, pcy - hh / 2, pw, hh, chat); R(g, px, pcy - 1, pw, 2, "#e8faff"); }
          else { const ww = Math.max(1, Math.round(pw * (1 - (k - 0.5) / 0.5))); R(g, pcx - ww / 2, pcy - 1, ww, 2, "#e8faff"); G(g, pcx, pcy, 30, "rgba(200,250,255,0.9)", 1); }
        } else if (t < off + 0.7) { const k = (t - off - 0.32) / 0.38; A(g, 1 - k, () => { R(g, pcx - 1, pcy - 1, 2, 2, "#e8faff"); G(g, pcx, pcy, 14, "rgba(200,250,255,0.8)", 1); }); }
        else {
          // snake game window
          const gx = px + 7, gy = py + 9, CS = 10, COLS = 11, ROWS = 12;
          A(g, cl((t - off - 0.7) * 4, 0, 1), () => {
            R(g, px, py, pw, ph, "#0a120c"); R(g, px, py, pw, 7, "#14261a"); PX.text(g, "snake", px + 3, py - 2, { font: "v", size: 10, col: "#7ee787" });
            for (let r2 = 0; r2 < ROWS; r2++) for (let c2 = 0; c2 < COLS; c2++) if ((r2 + c2) % 2 === 0) R(g, gx + c2 * CS, gy + r2 * CS, CS, CS, "#0e1a10");
            const s0 = off + 0.9, stepT = (hum - s0) / APPLE_I, hi = cl(Math.floor((t - s0) / stepT), 0, SNAKE_PATH.length - 1);
            const ate = t >= hum, len = ate ? 4 : 3;
            if (!ate) { const [ac, ar] = SNAKE_PATH[APPLE_I], pulse = PX.blink(t, 0.5, 0.5) ? 1 : 0;
              R(g, gx + ac * CS + 2 - pulse, gy + ar * CS + 2 - pulse, 6 + 2 * pulse, 6 + 2 * pulse, "#ff4d4d"); R(g, gx + ac * CS + 4, gy + ar * CS + 1, 2, 2, "#3df56b"); G(g, gx + ac * CS + 5, gy + ar * CS + 5, 10, "rgba(255,77,77,0.7)", 0.7); }
            for (let k = len - 1; k >= 0; k--) { const [sc, sr] = SNAKE_PATH[Math.max(0, hi - k)];
              R(g, gx + sc * CS + 1, gy + sr * CS + 1, CS - 2, CS - 2, k === 0 ? "#7ee787" : "#3aa850"); if (k === 0) { R(g, gx + sc * CS + 3, gy + sr * CS + 3, 1, 1, "#0a120c"); R(g, gx + sc * CS + 6, gy + sr * CS + 3, 1, 1, "#0a120c"); } }
            if (ate && t < hum + 0.6) { const k = (t - hum) / 0.6, [ac, ar] = SNAKE_PATH[APPLE_I]; for (let i = 0; i < 8; i++) { const an = i * 0.785; R(g, gx + ac * CS + 5 + Math.cos(an) * k * 18, gy + ar * CS + 5 + Math.sin(an) * k * 18, 2, 2, i % 2 ? "#f7c948" : "#3df56b"); } G(g, gx + ac * CS + 5, gy + ar * CS + 5, 30, "rgba(61,245,107,0.8)", 1 - k); }
          });
        }
        R(g, SX, SY, SW, 1, "rgba(255,255,255,.08)");
        // desk
        R(g, -40, 292, 720, 8, "#5a3e2b"); R(g, -40, 292, 720, 2, "#7a573d"); R(g, -40, 300, 720, 60, "#1a1410"); R(g, -40, 300, 720, 2, "#100c08");
        R(g, 26, 286, 26, 6, "#2b2f38"); R(g, 36, 240, 4, 46, "#3a3f4b"); R(g, 28, 230, 26, 12, "#3a3f4b"); R(g, 30, 241, 22, 2, "#ffd28a");
        PX.core.mug(g, 84, 282, t);
        // crumpled paper: two on the desk from before + throws that miss the bin
        paperBall(g, 116, 288); paperBall(g, 126, 289);
        R(g, 566, 318, 26, 34, "#2a2e3a"); R(g, 566, 318, 26, 2, "#4a505e"); R(g, 568, 322, 1, 28, "#3a3f4b"); R(g, 300, 306, 120, 30, "#221a14"); R(g, 300, 306, 120, 1, "#3a2c20"); R(g, 352, 318, 16, 3, "#6a5038");
        for (const [tt, lx2] of [[1.7, 556], [3.4, 600], [4.3, 582]]) { const k = (t - tt) / 0.5; if (k < 0) continue;
          const kk = Math.min(1, k), x = lerp(500, lx2, kk), y = lerp(262, 348, kk) - Math.sin(kk * Math.PI) * 50; paperBall(g, x, y); }
        // keyboard
        R(g, 436, 284, 96, 9, "#22252e"); R(g, 436, 284, 96, 1, "#4a4e5e");
        const typing = isOff && t < hum - 0.2 && ((t * 0.7) % 1) < 0.62;
        for (let i = 0; i < 15; i++) R(g, 439 + i * 6, 286 + (typing && (Math.floor(t * 8) + i * 5) % 11 === 0 ? 1 : 0), 5, 2, "#5a6270");
        // the dev (front-facing), headphones on the neck
        const DX = 488, happy = t >= hum;
        const reach = t < off + 0.25 ? PX.p(t, off - 0.45, 0.4) : 1 - PX.p(t, off + 0.25, 0.4);
        const lHand = [lerp(DX + 22, WX - 2, reach), lerp(288, WY + 18, reach)];
        const peck = typing ? Math.round(Math.sin(t * 12)) * 2 : 0;
        const tossing = [1.7, 3.4, 4.3].some((tt) => t > tt - 0.25 && t < tt + 0.05);
        const face = happy ? "happy" : !isOff ? "neutral" : tossing ? "flat" : PX.blink(t, 1.6, 0.5) ? "focus" : "strain";
        const P = L.person(g, DX, 312, { h: 120, seated: true, noLegs: true, ...DEV, face, lit: -1, look: -2, blush: happy, bob: Math.round(Math.sin(t * 1.7) * 0.6),
          hands: { r: tossing ? [DX - 30, 250] : [DX - 26 + (typing ? -peck : 0), 288], l: reach > 0 ? lHand : [DX + 24 + (typing ? peck : 0), 288] } });
        headphones(g, P);
        if (isOff && !happy) L.sweat(g, P.hx - 16, P.hy + 2, t, 2, 13);
        if (happy) for (let i = 0; i < 3; i++) { const ks = frac((t - hum) * 1.2 + i / 3); if (ks < 0.6) L.star4(g, P.hx + [-24, 22, 18][i], P.hy + [-6, -10, 14][i], ks < 0.3 ? 1 : 2, "#f7c948"); }
        R(g, 400, 298, 180, 2, "#2a1f17");
      });
      if (t >= hum + 0.3) plate(g, "HUMBLING", 320, 30, t, hum + 0.3, "#f7c948");
      PX.particles(g, 71, 22, t, [10, 180, 150, 110], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.6 });
      PX.vignette(g, 0.55);
    };
  };
  // @@END
})();
