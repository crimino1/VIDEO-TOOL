/* EP3 Builder C: the cost you can see.
   app_works, eighty_build, support_email, code_wall, stranger, iceberg, assembly.
   Reuses PX.learn.* (person, ell, limb, cone, sweat) and PX.core.* at draw time (learn.js loads after this file). */
(function () {
  const { K } = PX;
  const R = PX.rect, G = PX.glow, A = PX.alpha;
  const LB = () => PX.learn;
  // option time with default scaled to shot length (typ = typical length the default was written for)
  const T = (o, k, def, d, typ) => (o[k] !== undefined ? o[k] : Array.isArray(def) ? def.map((v) => (v * d) / typ) : (def * d) / typ);
  // shade #rrggbb: k<0 darker, k>0 lighter
  const sh = (hex, k) => {
    const n = parseInt(hex.slice(1), 16), f = (v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
    return "#" + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1);
  };
  // well-mixed per-item random stream (mulberry32; PX.rnd seeds in a row give evenly spaced values)
  const hr = (i) => { let a = ((i + 1) * 2654435761 + 0x9e3779b9) >>> 0; return () => { a = (a + 0x6d2b79f5) >>> 0; let q = Math.imul(a ^ (a >>> 15), 1 | a); q = (q + Math.imul(q ^ (q >>> 7), 61 | q)) ^ q; return ((q ^ (q >>> 14)) >>> 0) / 4294967296; }; };
  const rr = (g, x, y, w, h, r, col) => {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let i = 0; i < h; i++) {
      const k = i < r ? r - i - 0.5 : i >= h - r ? i - (h - r) + 0.5 : 0;
      const ins = k ? Math.round(r - Math.sqrt(Math.max(0, r * r - k * k))) : 0;
      R(g, x + ins, y + i, w - 2 * ins, 1, col);
    }
  };
  // block with lit edge (L=-1 light from left) and shadow edge
  const mat = (g, x, y, w, h, base, L) => {
    R(g, x, y, w, h, base);
    const hi = sh(base, 0.22), lo = sh(base, -0.32);
    if ((L || -1) < 0) { R(g, x, y, 1, h, hi); R(g, x + w - 2, y, 2, h, lo); } else { R(g, x + w - 1, y, 1, h, hi); R(g, x, y, 2, h, lo); }
    R(g, x, y, w, 1, hi); R(g, x, y + h - 1, w, 1, lo);
  };
  const thick = (g, x1, y1, x2, y2, w, col) => {
    const n = Math.max(1, Math.round(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1)))), o2 = Math.floor(w / 2);
    for (let i = 0; i <= n; i++) R(g, Math.round(x1 + ((x2 - x1) * i) / n) - o2, Math.round(y1 + ((y2 - y1) * i) / n) - o2, w, w, col);
  };
  const shake = (t, t0, dur, amp) => (t >= t0 && t < t0 + dur ? Math.round(Math.sin(t * 90) * amp * (1 - (t - t0) / dur)) : 0);
  const star4 = (g, x, y, r, col) => { R(g, x, y - r, 1, 2 * r + 1, col); R(g, x - r, y, 2 * r + 1, 1, col); if (r > 2) R(g, x - 1, y - 1, 3, 3, col); };
  // label that pops in with a back-ease bounce at t0
  const pop = (g, t, t0, str, x, y, o) => {
    if (t < t0) return; const k = PX.p(t, t0, 0.35, "back");
    A(g, PX.clamp((t - t0) / 0.12, 0, 1), () => PX.otext(g, str, x, y + Math.round((1 - k) * 8), o));
  };
  const confetti = (g, t, seed, n, box, t0) => {
    const r = PX.rnd(seed), cols = ["#f25ca8", "#f7c948", "#5fe3e8", "#3df56b", "#8a5cf6", "#f08a3c"];
    const [bx, by, bw, bh] = box;
    for (let i = 0; i < n; i++) {
      const x0 = r() * bw, y0 = r() * bh, sp = 0.6 + r() * 0.7, ph = r() * 6.28, col = cols[i % 6];
      const tt = t - (t0 || 0); if (tt < 0) continue;
      const y = by + ((y0 + 34 * sp * tt) % bh), x = bx + ((((x0 + Math.sin(tt * 2.2 + ph) * 8) % bw) + bw) % bw);
      const f = Math.floor(tt * 8 + ph * 3) % 3;
      R(g, x, y, f === 0 ? 2 : 1, f === 1 ? 2 : 1, col); if (f === 2) R(g, x + 1, y + 1, 1, 1, sh(col, -0.3));
    }
  };

  // ---------- the recurring cast ----------
  const DEV = { skin: "#b07a4e", hair: "#1a120c", shirt: "#2f8a4e", pants: "#2b3550", hairStyle: "spiky", top: "hoodie" };
  // headphones resting around the neck (needs person() result)
  const phones = (g, p) => {
    const y = p.ty - 1, x = p.hx, w = p.hw + 4;
    R(g, x - (w >> 1), y + 1, w, 2, "#23262f"); R(g, x - (w >> 1), y + 1, w, 1, "#4a505e");
    for (const s of [-1, 1]) { const cx = x + s * ((w >> 1) - 1) - (s < 0 ? 1 : 2); R(g, cx - 1, y, 4, 5, "#2b2f3a"); R(g, cx - 1, y, 4, 1, "#5a6070"); R(g, cx, y + 1, 2, 3, "#3df56b"); }
  };
  // the dev (front view, LB.person). (x, y) = feet (or hip line when o.seated)
  const dev = (g, x, y, o) => LB().outlined(g, (b) => { const p = LB().person(b, x, y, Object.assign({}, DEV, o, { outline: false })); if (!o.noPhones) phones(b, p); if (o.extra) o.extra(b, p); return p; });
  // the AI agent head: rounded cyan-grey box, two big square eyes, antenna + pink LED. (x, y) = head centre, s = width
  const bot = (g, x, y, s, t, o) => {
    o = o || {}; const h = Math.round(s * 0.78), x0 = Math.round(x - s / 2), y0 = Math.round(y - h / 2);
    R(g, x - 1, y0 - Math.round(s * 0.28), 2, Math.round(s * 0.28), "#7a8a9a");
    const led = PX.blink(t + (o.ph || 0), 1.2, 0.6); PX.circle(g, x, y0 - Math.round(s * 0.3), Math.max(1, Math.round(s / 14)), led ? "#ff7ac0" : "#a03a72");
    if (led) G(g, x, y0 - Math.round(s * 0.3), s * 0.3, "rgba(242,92,168,0.5)");
    rr(g, x0 - 1, y0 - 1, s + 2, h + 2, Math.round(s / 5), "#1c2430");
    rr(g, x0, y0, s, h, Math.round(s / 5), "#8fb4c4"); rr(g, x0 + 2, y0 + 2, s - 3, h - 4, Math.round(s / 6), "#a9cfd9");
    R(g, x0 + Math.round(s / 5), y0 + 1, s - Math.round(s / 2.5), 1, "#d6f0f2"); R(g, x0 + s - 3, y0 + 4, 2, h - 8, "#6f93a6");
    R(g, x0 + 2, y0 + h - 3, s - 4, 2, "#6f93a6");
    // face plate
    const fx = x0 + Math.round(s * 0.14), fy = y0 + Math.round(h * 0.2), fw = s - Math.round(s * 0.28), fh = Math.round(h * 0.6);
    rr(g, fx, fy, fw, fh, 2, "#16222e");
    const es = Math.max(2, Math.round(s * 0.16)), ey = fy + Math.round(fh * 0.22), blink = !o.noBlink && PX.blink(t + (o.ph || 0) * 1.7, 3.1, 0.05);
    for (const sd of [-1, 1]) {
      const ex = Math.round(x + sd * s * 0.17 - es / 2);
      if (o.eyes === "happy") { for (let i = 0; i < es; i++) R(g, ex + i, ey + Math.round(es * 0.6) - Math.round(Math.sin((i / (es - 1)) * 3.14) * es * 0.5), 1, 2, "#5fe3e8"); }
      else if (o.eyes === "shrug") { R(g, ex, ey + Math.round(es / 2), es, 2, "#5fe3e8"); }
      else if (blink) R(g, ex, ey + Math.round(es / 2), es, 1, "#5fe3e8");
      else { R(g, ex, ey, es, es, "#5fe3e8"); R(g, ex, ey, Math.max(1, es >> 2), Math.max(1, es >> 2), "#e6fbfc"); }
    }
    if (s >= 20) { const my = fy + fh - Math.max(3, Math.round(fh * 0.25)); if (o.eyes === "shrug") R(g, x - 3, my + 1, 6, 1, "#5fe3e8"); else { R(g, x - 3, my, 6, 1, "#5fe3e8"); R(g, x - 4, my - 1, 1, 1, "#5fe3e8"); R(g, x + 3, my - 1, 1, 1, "#5fe3e8"); } }
    G(g, x, y, s * 0.9, "rgba(95,227,232,0.12)");
  };

  // generic app UI drawn on a phone screen (x, y, w, h). o.state: "app" | "login" ; o.ok = green check badge
  const appScreen = (g, x, y, w, h, t, o) => {
    o = o || {};
    PX.vgrad(g, x, y, w, h, "1b2a4a", "141c34", 5);
    R(g, x, y, w, 3, "#0e1426"); R(g, x + 2, y + 1, 6, 1, "#9aa4b2"); R(g, x + w - 7, y + 1, 5, 1, "#9aa4b2");
    if (o.state === "login") {
      PX.circle(g, x + w / 2, y + h * 0.28, Math.round(w * 0.14), "#2a3a5c"); PX.circle(g, x + w / 2, y + h * 0.25, Math.round(w * 0.06), "#7a8aa8"); R(g, x + w / 2 - w * 0.09, y + h * 0.3, w * 0.18, 3, "#7a8aa8");
      for (let i = 0; i < 2; i++) { R(g, x + 5, y + h * 0.46 + i * 9, w - 10, 6, "#e0e6ee"); R(g, x + 6, y + h * 0.46 + i * 9 + 1, 6 + i * 3, 4, "#9aa4b2"); }
      rr(g, x + 5, y + h * 0.68, w - 10, 7, 2, "#3d7cf5");
      return;
    }
    R(g, x, y + 3, w, 9, "#3d7cf5"); R(g, x, y + 3, w, 1, "#6a9cff"); R(g, x + 3, y + 6, 6, 1, "#e0ecff"); R(g, x + 3, y + 8, 6, 1, "#e0ecff"); PX.circle(g, x + w - 7, y + 7, 2, "#e0ecff");
    for (let i = 0; i < 3; i++) {
      const cy = y + 15 + i * Math.round((h - 30) / 3.3);
      rr(g, x + 3, cy, w - 6, Math.round((h - 30) / 3.8), 2, "#24345a"); R(g, x + 4, cy, w - 8, 1, "#34487a");
      PX.circle(g, x + 9, cy + 6, 3, ["#f25ca8", "#f7c948", "#3df56b"][i]);
      R(g, x + 15, cy + 3, Math.round((w - 22) * (0.8 - i * 0.15)), 2, "#c9d4e6"); R(g, x + 15, cy + 7, Math.round((w - 22) * 0.5), 1, "#7a8aa8");
    }
    rr(g, x + 5, y + h - 13, w - 10, 8, 3, "#3df56b"); R(g, x + 7, y + h - 13, w - 14, 1, "#9affb8");
  };
  // phone body around a screen
  const phone = (g, x, y, w, h, fn) => {
    rr(g, x - 3, y - 7, w + 6, h + 14, 5, "#11141c"); rr(g, x - 2, y - 6, w + 4, h + 12, 4, "#2a2f3c");
    R(g, x - 2, y - 2, 1, h + 4, "#4a5266"); R(g, x + w / 2 - 5, y - 4, 10, 1, "#11141c");
    fn(); R(g, x + w / 2 - 6, y + h + 3, 12, 1, "#5a6276");
  };

  // ======================= app_works =======================
  // stage + spotlights + confetti, a phone app on a pedestal, banner "IT WORKS!". At o.reveal (3.0) the stage front turns
  // x-ray: spaghetti wires, duct tape, sparks and "???" boxes holding the pedestal up.
  K.app_works = (o) => (g, t, d, c) => {
    const rv = T(o, "reveal", 3.0, d, 6.0), xk = PX.clamp((t - rv) / 0.7, 0, 1), scanX = Math.round(PX.lerp(-10, 650, PX.ease(xk, "io")));
    const after = t >= rv;
    // ---- far: back wall, LED backdrop, curtains
    PX.par(g, c, 0.4, () => {
      PX.vgrad(g, 0, 0, 640, 240, "1a1236", "0c0a1c", 9);
      for (let yy = 30; yy < 220; yy += 8) for (let xx = 120 + ((yy / 8) % 2) * 4; xx < 520; xx += 8) {
        const tw = 0.5 + 0.5 * Math.sin(t * 2 + xx * 0.11 + yy * 0.07); A(g, 0.15 + 0.35 * tw, () => R(g, xx, yy, 2, 2, (xx + yy) % 24 === 0 ? "#f25ca8" : "#5f6ad8"));
      }
      for (const s of [-1, 1]) {
        for (let i = 0; i < 9; i++) {
          const x0 = s < 0 ? i * 14 - 4 : 640 - (i + 1) * 14 + 4, sw = Math.round(Math.sin(t * 0.8 + i) * 1);
          const hem = 250 + Math.round(Math.sin(i * 1.7) * 4);
          R(g, x0 + sw, 0, 14, hem, i % 2 ? "#6a1630" : "#7e1d3a"); R(g, x0 + sw + (s < 0 ? 0 : 11), 0, 3, hem, "#4a0e22"); R(g, x0 + sw + (s < 0 ? 11 : 1), 0, 2, hem, "#9a2a4c");
        }
      }
      // valance with gold fringe
      for (let xx = 0; xx < 640; xx += 20) { rr(g, xx, -10, 22, 34, 9, "#6a1630"); R(g, xx + 2, 18, 18, 2, "#9a2a4c"); }
      for (let xx = 0; xx < 640; xx += 2) R(g, xx, 22 + (xx % 6 === 0 ? 2 : 0), 1, 3, "#c8a040");
    });
    // ---- truss + spot cans (mid)
    PX.par(g, c, 0.65, () => {
      R(g, 0, 26, 640, 4, "#2a2e3a"); R(g, 0, 26, 640, 1, "#4a5060"); R(g, 0, 34, 640, 2, "#22252e");
      for (let xx = 0; xx < 640; xx += 10) { PX.line(g, xx, 30, xx + 5, 34, "#3a3e4a"); PX.line(g, xx + 5, 34, xx + 10, 30, "#3a3e4a"); }
      for (const [sx, col] of [[150, "#ffe2a8"], [320, "#fff2d0"], [490, "#ffe2a8"]]) { R(g, sx - 6, 36, 12, 9, "#1c1f28"); R(g, sx - 6, 36, 12, 1, "#5a6070"); R(g, sx - 4, 44, 8, 2, col); }
    });
    // spotlight beams onto the pedestal (additive)
    const tgt = 320 + Math.round(Math.sin(t * 0.9) * 6);
    for (const [sx, sp] of [[150, 0.7], [320, 0], [490, -0.7]]) {
      const tx = tgt + Math.round(Math.sin(t * 1.1 + sp * 3) * (sp ? 14 : 0));
      const op = g.globalCompositeOperation; g.globalCompositeOperation = "lighter";
      for (let yy = 46; yy < 232; yy++) { const k = (yy - 46) / 186, cx = PX.lerp(sx, tx, k), w = 4 + k * (sp ? 56 : 74);
        g.globalAlpha = 0.07 + 0.05 * (1 - k); R(g, cx - w / 2, yy, w, 1, sp ? "#ffd89a" : "#fff0d0"); g.globalAlpha = 0.06; R(g, cx - w / 4, yy, w / 2, 1, "#ffffff"); }
      g.globalAlpha = 1; g.globalCompositeOperation = op;
    }
    // ---- banner "IT WORKS!" on ropes
    const bsw = Math.sin(t * 1.4) * 1.5, by = 42 + Math.round(bsw);
    PX.line(g, 200, 36, 206, by, "#8a7a5a"); PX.line(g, 440, 36, 434, by, "#8a7a5a");
    R(g, 196, by, 248, 26, "#d8b04a"); R(g, 198, by + 2, 244, 22, "#2a1a46"); R(g, 198, by + 2, 244, 1, "#4a3a6e"); R(g, 196, by, 248, 1, "#f0d070");
    for (const s of [-1, 1]) { const ex = s < 0 ? 186 : 444; R(g, ex, by + 4, 10, 18, "#5a1a3a"); R(g, ex + (s < 0 ? 0 : 6), by + 22, 4, 4, "#5a1a3a"); }
    PX.text(g, "IT WORKS!", 321, by + 5, { size: 16, col: "#7a5a10", align: "center" });
    PX.text(g, "IT WORKS!", 320, by + 4, { size: 16, col: PX.blink(t, 0.5, 0.8) ? "#f7c948" : "#ffe08a", align: "center" });
    for (let i = 0; i < 12; i++) { const on = Math.floor(t * 6 + i) % 3 === 0; R(g, 202 + i * 20, by + 22, 2, 2, on ? "#fff0b0" : "#8a7030"); }
    // ---- stage floor (top surface)
    const sy = 230;
    PX.vgrad(g, 0, sy - 22, 640, 24, "3a2a24", "5a3e2c", 4);
    for (let i = 0; i < 5; i++) R(g, 0, sy - 22 + i * 5, 640, 1, "#2e2018");
    for (let xx = -40; xx < 680; xx += 46) PX.line(g, 320 + (xx - 320) * 0.8, sy - 22, xx, sy, "#2e2018");
    R(g, 0, sy, 640, 3, "#8a6040"); R(g, 0, sy, 640, 1, "#c08a5a");
    G(g, tgt, sy - 8, 120, "rgba(255,230,180,0.35)");
    // ---- pedestal + phone (wobbles after the reveal)
    const wob = after ? Math.round(Math.sin(t * 7) * (t < rv + 1.5 ? 1 : 0.6)) : 0, px = 320 + wob;
    A(g, 0.45, () => LB().ell(g, 320, sy - 6, 48, 5, "#000000"));
    mat(g, px - 34, sy - 14, 68, 9, "#6a5f7e", -1); mat(g, px - 26, sy - 44, 52, 30, "#5a5070", -1); R(g, px - 26, sy - 44, 52, 1, "#8a80a4");
    for (let i = 0; i < 5; i++) R(g, px - 20 + i * 10, sy - 42, 2, 26, "#4a4060");
    mat(g, px - 32, sy - 50, 64, 7, "#6a5f7e", -1); R(g, px - 32, sy - 50, 64, 1, "#d8b04a"); R(g, px - 34, sy - 14, 68, 1, "#d8b04a");
    const pw = 50, ph = 86, ppx = px - pw / 2, ppy = sy - 50 - ph - 9 + Math.round(Math.sin(t * 2) * 1);
    G(g, px, ppy + ph / 2, 90, "rgba(95,160,255,0.28)");
    phone(g, ppx, ppy, pw, ph, () => {
      appScreen(g, ppx, ppy, pw, ph, t);
      // check badge pops
      const bk = PX.p(t, 0.4, 0.4, "back"), bx = ppx + pw / 2, bcy = ppy + ph / 2 + 2;
      if (bk > 0) { PX.circle(g, bx, bcy, Math.round(13 * bk), "#1a6a3a"); PX.circle(g, bx, bcy, Math.round(11 * bk), "#3df56b");
        if (bk > 0.8) { thick(g, bx - 5, bcy, bx - 1, bcy + 4, 2, "#0c2a16"); thick(g, bx - 1, bcy + 4, bx + 6, bcy - 4, 2, "#0c2a16"); } }
      // glass shine sweep
      const sk = ((t * 0.5) % 1.6) - 0.3;
      A(g, 0.18, () => { for (let i = 0; i < 10; i++) { const xx = ppx + sk * pw * 1.4 + i - ph * 0.3; for (let yy = 0; yy < ph; yy += 1) { const lx = Math.round(xx + yy * 0.3); if (lx >= ppx && lx < ppx + pw) R(g, lx, ppy + yy, 1, 1, "#ffffff"); } } });
    });
    for (const [sx, sy2] of [[ppx - 10, ppy + 10], [ppx + pw + 8, ppy + 24], [ppx + pw + 4, ppy - 4], [ppx - 6, ppy + 60]]) { const tw = Math.sin(t * 5 + sx) ; if (tw > 0.2) star4(g, sx, sy2, tw > 0.7 ? 3 : 1, "#fff2b0"); }
    // ---- stage front skirt (normal) / x-ray cross-section
    const fy = sy + 3;
    const front = () => {
      PX.vgrad(g, 0, fy, 640, 360 - fy, "2a1820", "120a10", 6);
      for (let xx = 0; xx < 640; xx += 40) { R(g, xx, fy, 1, 127, "#3a2430"); R(g, xx + 1, fy, 1, 127, "#1a0e14"); }
      R(g, 0, fy + 4, 640, 2, "#3a2028");
      for (let xx = 30; xx < 640; xx += 64) { R(g, xx, fy + 2, 8, 4, "#2a2a30"); R(g, xx + 2, fy + 2, 4, 2, "#ffcf8a"); G(g, xx + 4, fy + 2, 22, "rgba(255,200,120,0.45)"); }
    };
    const xray = () => {
      PX.vgrad(g, 0, fy, 640, 360 - fy, "0c2440", "06101e", 6);
      for (let xx = 0; xx < 640; xx += 16) R(g, xx, fy, 1, 127, "rgba(95,227,232,0.08)");
      for (let yy = fy; yy < 360; yy += 16) R(g, 0, yy, 640, 1, "rgba(95,227,232,0.08)");
      // stage beams (ghosted)
      R(g, 0, fy, 640, 3, "#2f6a8a"); for (let xx = 20; xx < 640; xx += 120) { R(g, xx, fy, 6, 127, "#1a3e5a"); R(g, xx, fy, 1, 127, "#3f8aaa"); }
      // spaghetti wires
      const cols = ["#ff5c5c", "#f7c948", "#3df56b", "#f25ca8", "#5fe3e8", "#f08a3c", "#c8c8d8"];
      for (let wi = 0; wi < 14; wi++) {
        const r = hr(wi + 3), col = cols[wi % cols.length];
        const x0 = 300 + r() * 40, x1 = 40 + r() * 560, y1 = fy + 26 + r() * 70, a1 = r() * 6, a2 = r() * 6, loops = 1 + Math.floor(r() * 3);
        let lx = null, ly = null;
        for (let k = 0; k <= 160; k++) {
          const u = k / 160, bx = PX.lerp(x0, x1, u), byy = PX.lerp(fy + 2, y1, Math.sin(u * 1.57));
          const xx = bx + Math.sin(u * 6.28 * loops + a1) * 30 * Math.sin(u * 3.14), yy = byy + Math.cos(u * 6.28 * loops + a2) * 18 * Math.sin(u * 3.14) + Math.sin(t * 3 + wi + u * 8) * 0.6;
          if (lx !== null) thick(g, lx, ly, xx, yy, 2, col);
          lx = xx; ly = yy;
        }
        R(g, lx - 2, ly - 1, 5, 3, "#d8d8e0"); R(g, lx - 2, ly - 1, 5, 1, "#ffffff");
      }
      // power strip with too many plugs, daisy-chained
      for (let i = 0; i < 2; i++) { const sx = 120 + i * 300, syy = 318 - i * 4; mat(g, sx, syy, 64, 10, "#d8d8d0", -1); for (let k = 0; k < 6; k++) { R(g, sx + 4 + k * 10, syy + 3, 5, 4, "#2a2a30"); R(g, sx + 4 + k * 10, syy - 4, 5, 7, cols[(k + i * 2) % 7]); } R(g, sx + 50, syy + 2, 6, 4, PX.blink(t, 0.3) ? "#ff5c5c" : "#6a2020"); }
      // "???" boxes stacked under the pedestal (crooked)
      const box = (bx, byy, w, h, tilt, lab) => {
        mat(g, bx + tilt, byy, w, h, "#a87a4a", -1); R(g, bx + tilt + w / 2 - 3, byy, 6, h, "#c8a070"); R(g, bx + tilt, byy + 3, w, 1, "#7a5430");
        PX.text(g, lab || "???", bx + tilt + w / 2, byy + h / 2 - 4, { size: 8, col: "#2a1608", align: "center" });
      };
      box(292, fy + 4, 56, 22, 0); box(286, fy + 26, 50, 22, -4); box(300, fy + 48, 58, 24, 3); box(290, fy + 72, 52, 22, -2);
      box(140, fy + 64, 40, 24, 0); box(470, fy + 52, 46, 26, 2);
      // wobbly broom-stick prop + a book wedge
      thick(g, 236, fy + 2, 258, 324, 3, "#8a6a3a"); R(g, 246, 322, 26, 6, "#3d6ab0"); R(g, 246, 322, 26, 1, "#6a9ae0");
      // duct tape patches
      for (const [tx, ty, w] of [[300, fy + 25, 40], [304, fy + 47, 44], [296, fy + 71, 40], [246, fy + 80, 18], [430, fy + 40, 22], [180, fy + 50, 20]]) {
        R(g, tx, ty - 2, w, 5, "#8a9098"); R(g, tx, ty - 2, w, 1, "#c0c6ce"); for (let k = 0; k < w; k += 4) R(g, tx + k, ty + 2, 2, 1, "#6a7078");
      }
      PX.text(g, "X", 437, fy + 34, { size: 8, col: "#8a9098" });
      // sparks
      for (let i = 0; i < 6; i++) {
        const r = hr(i + 60), sx = 120 + r() * 400, syy = fy + 20 + r() * 90, per = 0.6 + r() * 0.8, k = ((t + r() * 3) % per) / per;
        if (k < 0.35) { const sz = k < 0.15 ? 4 : 2; star4(g, sx, syy, sz, "#fff4a0"); G(g, sx, syy, 18, "rgba(255,220,90,0.7)");
          for (let j = 0; j < 4; j++) { const a = j * 1.6 + i; R(g, sx + Math.cos(a) * k * 30, syy + Math.sin(a) * k * 20 + k * k * 20, 1, 1, "#ffd84a"); } }
      }
      G(g, 320, 300, 200, "rgba(95,227,232,0.10)");
    };
    front();
    if (after) {
      g.save(); g.beginPath(); g.rect(0, fy, Math.max(0, scanX), 360 - fy); g.clip(); xray(); g.restore();
      if (xk < 1) { G(g, scanX, 296, 50, "rgba(95,227,232,0.6)"); R(g, scanX - 1, fy, 3, 127, "#c8fbfc"); }
      // x-ray frame corners
      if (xk >= 1) { const fa = 0.6 + 0.4 * Math.sin(t * 6); A(g, fa, () => { for (const [cx, cy, dx, dy] of [[34, fy + 6, 1, 1], [606, fy + 6, -1, 1], [34, 352, 1, -1], [606, 352, -1, -1]]) { R(g, cx, cy, 14 * dx, 2, "#5fe3e8"); R(g, cx, cy, 2, 10 * dy, "#5fe3e8"); } });
        PX.otext(g, "X-RAY", 46, fy + 12, { font: "v", size: 14, col: "#5fe3e8" }); }
    }
    // audience heads in the foreground (phones up, screens glowing)
    PX.par(g, c, 1.15, () => {
      for (let i = 0; i < 17; i++) {
        const r = hr(i + 90), ax = -10 + i * 40 + r() * 16, ay = 342 + r() * 8 + Math.round(Math.sin(t * 3 + i) > 0.6 ? -1 : 0);
        LB().ell(g, ax, ay, 11, 12, "#0a0810"); R(g, ax - 18, ay + 8, 36, 20, "#0a0810"); R(g, ax - 6, ay - 11, 8, 1, "#2a2440");
        if (r() < 0.45 && t > 0.3 + r() * 2) { const hx = ax + 10, hy = ay - 22 - Math.round(r() * 6); R(g, hx - 2, hy + 8, 3, 14, "#0a0810"); R(g, hx - 4, hy, 8, 12, "#1a1c26"); R(g, hx - 3, hy + 1, 6, 10, after && Math.floor(t * 4 + i) % 2 ? "#3a9ab0" : "#5a78b8"); G(g, hx, hy + 6, 14, "rgba(150,190,255,0.35)"); }
      }
    });
    // confetti (front of everything above the stage)
    confetti(g, t, 21, 70, [20, 0, 600, 232], 0);
    PX.particles(g, 683129967, 30, t, [200, 50, 240, 180], { vy: -2, vx: 1, col: "#fff0c8", a: 0.5 });
    PX.vignette(g, 0.5);
  };

  // small robot worker (AI agent head on a little body), feet at (x, y). o.pose: "idle" | "weld" | "shrug"
  const robo = (g, x, y, t, o) => {
    o = o || {}; const pose = o.pose || "idle", bob = pose === "idle" && Math.sin(t * 3 + (o.ph || 0)) > 0.3 ? 1 : 0;
    R(g, x - 4, y - 6, 3, 6, "#4a5868"); R(g, x + 1, y - 6, 3, 6, "#4a5868"); R(g, x - 5, y - 1, 4, 1, "#2a3240"); R(g, x + 1, y - 1, 4, 1, "#2a3240");
    mat(g, x - 6, y - 16 + bob, 12, 10, "#6f93a6", -1); R(g, x - 3, y - 13 + bob, 6, 3, "#16222e"); R(g, x - 2, y - 12 + bob, 1, 1, PX.blink(t + (o.ph || 0), 0.5) ? "#3df56b" : "#1a6a3a");
    if (pose === "shrug") { const k = 0.5 + 0.5 * Math.sin(t * 5); const ay = y - 18 - Math.round(k * 2);
      thick(g, x - 7, y - 14, x - 11, ay, 2, "#8fb4c4"); thick(g, x + 7, y - 14, x + 11, ay, 2, "#8fb4c4"); R(g, x - 14, ay - 1, 4, 2, "#a9cfd9"); R(g, x + 10, ay - 1, 4, 2, "#a9cfd9"); }
    else if (pose === "weld") { thick(g, x + 6, y - 13, x + 11, y - 9, 2, "#8fb4c4"); R(g, x + 11, y - 10, 3, 2, "#3a3f4b"); }
    else { R(g, x - 8, y - 15 + bob, 2, 7, "#8fb4c4"); R(g, x + 6, y - 15 + bob, 2, 7, "#8fb4c4"); }
    bot(g, x, y - 24 + bob - (pose === "shrug" ? Math.round((0.5 + 0.5 * Math.sin(t * 5)) * 1) : 0), 14, t, { eyes: pose === "shrug" ? "shrug" : undefined, ph: o.ph });
  };

  // ======================= eighty_build =======================
  // construction site at sunset: robot cranes build an app-building floor by floor; floor signs at o.at [1.5,3,4.5]
  // ("LOGIN","FORMS","DASHBOARD"), progress sign to 80%. At o.stall (6.0) cranes stop, top 20% = fog + bare scaffolding,
  // a robot shrugs. o.labels to rename the three floors.
  K.eighty_build = (o) => (g, t, d, c) => {
    const at = T(o, "at", [1.5, 3.0, 4.5], d, 8.5), stall = T(o, "stall", 6.0, d, 8.5), labels = o.labels || ["LOGIN", "FORMS", "DASHBOARD"];
    const N = 10, FH = 21, GY = 300, BX = 245, BW = 150, built = 8, sp = (stall - 0.5) / built;
    const fdone = (i) => 0.25 + (i + 1) * sp;                                    // time floor i lands
    const nDone = (tt) => { let n = 0; for (let i = 0; i < built; i++) if (tt >= fdone(i)) n++; return n; };
    const nd = nDone(t), stopped = t >= stall;
    // ---- sky + sun + clouds
    PX.vgrad(g, 0, 0, 640, 250, "241a46", "f0905a", 12);
    G(g, 500, 222, 150, "rgba(255,170,90,0.55)"); PX.circle(g, 500, 222, 26, "#ffcf7a"); PX.circle(g, 500, 222, 22, "#ffe0a0");
    PX.par(g, c, 0.2, () => {
      for (let i = 0; i < 7; i++) { const r = hr(i + 5), cx = ((r() * 760 + t * (3 + r() * 3)) % 760) - 60, cy = 40 + r() * 120, w = 50 + r() * 70;
        LB().ell(g, cx, cy + 1, w / 2, 3, "#8a4a6a"); LB().ell(g, cx, cy, w / 2, 3, i % 2 ? "#c86a7a" : "#d87a7a"); LB().ell(g, cx - 6, cy - 2, w * 0.3, 2, "#f0a888"); }
      for (let i = 0; i < 4; i++) { const bx = ((i * 140 + t * 18) % 700) - 30, byy = 70 + i * 13 + Math.sin(t * 2 + i) * 3, w = Math.sin(t * 8 + i) > 0;
        R(g, bx, byy, 1, 1, "#2a1a30"); R(g, bx - 2, byy + (w ? -1 : 1), 2, 1, "#2a1a30"); R(g, bx + 1, byy + (w ? -1 : 1), 2, 1, "#2a1a30"); }
    });
    // ---- far city silhouette
    PX.par(g, c, 0.35, () => {
      const r = PX.rnd(44); let x = -10;
      while (x < 660) { const w = 14 + r() * 26, h = 30 + r() * 70; R(g, x, 250 - h, w, h + 10, "#4a2a52"); R(g, x, 250 - h, 1, h, "#6a3a5a");
        for (let wy = 254 - h; wy < 246; wy += 6) for (let wx = x + 3; wx < x + w - 3; wx += 5) if (r() < 0.25) R(g, wx, wy, 2, 2, Math.sin(t + wx) > -0.7 ? "#f7b85a" : "#6a3a4a");
        x += w + 2; }
      R(g, 0, 250, 640, 12, "#3a2244");
    });
    // ---- mid: ground, trailer, girder pile, floodlights
    PX.par(g, c, 0.7, () => {
      PX.vgrad(g, 0, 258, 640, 102, "5a3a30", "2a1a1c", 6);
      for (let i = 0; i < 40; i++) { const r = hr(i + 200); R(g, r() * 640, 262 + r() * 40, 2 + r() * 4, 1, "#6a4a3a"); }
      mat(g, 40, 236, 70, 34, "#c8a040", -1); R(g, 40, 236, 70, 3, "#e8c060"); R(g, 50, 244, 16, 10, "#ffcf8a"); G(g, 58, 249, 26, "rgba(255,200,120,0.5)"); R(g, 74, 244, 16, 10, "#3a2a20"); R(g, 46, 270, 8, 4, "#1a1410"); R(g, 96, 270, 8, 4, "#1a1410");
      for (let i = 0; i < 4; i++) { mat(g, 520 + i * 3, 280 - i * 5, 70, 5, "#8a3a2a", -1); }
      for (const fx of [210, 430]) { R(g, fx, 150, 2, 110, "#2a2430"); R(g, fx - 8, 146, 18, 6, "#3a3440"); R(g, fx - 7, 151, 16, 2, "#fff0c0"); }
    });
    for (const fx of [211, 431]) LB().cone(g, fx, 153, 14, 90, 140, "#ffe8b0", 0.2);
    // ---- the building
    const fy = (i) => GY - (i + 1) * FH;
    // scaffolding for unbuilt floors
    for (let i = 0; i < N; i++) {
      if (i < built && t >= fdone(i)) continue;
      const y0 = fy(i); A(g, i >= built ? 1 : 0.35, () => {
        for (let xx = BX; xx <= BX + BW; xx += 17) R(g, xx, y0, 2, FH, "#8a8a9a");
        R(g, BX, y0, BW + 2, 2, "#9a9aaa"); thick(g, BX + 4, y0 + FH - 2, BX + 30, y0 + 2, 1, "#6a6a7a"); thick(g, BX + BW - 30, y0 + 2, BX + BW - 4, y0 + FH - 2, 1, "#6a6a7a");
      });
    }
    // built floors
    const label = (i) => { for (let k = 0; k < 3; k++) if (nDone(at[k]) - 1 === i && t >= at[k]) return k; return -1; };
    for (let i = 0; i < built; i++) {
      const tl = fdone(i); if (t < tl - sp * 1.4) continue;
      let y0 = fy(i), x0 = BX, hang = false;
      if (t < tl) { // carried by a crane: swings in from the side
        const side = i % 2 ? 1 : -1, k = PX.clamp((t - (tl - sp * 1.4)) / (sp * 1.4), 0, 1);
        x0 = BX + side * Math.round((1 - PX.ease(k, "out")) * 150); y0 = Math.round(PX.lerp(60, fy(i), PX.ease(k, "out"))); hang = true;
        PX.line(g, x0 + BW / 2, 66, x0 + BW / 2, y0 - 6, "#2a2a30"); thick(g, x0 + 10, y0, x0 + BW / 2, y0 - 6, 1, "#3a3a40"); thick(g, x0 + BW - 10, y0, x0 + BW / 2, y0 - 6, 1, "#3a3a40");
        R(g, x0 + BW / 2 - 2, y0 - 8, 4, 3, "#f7c948");
      }
      mat(g, x0, y0, BW, FH, "#5a5a72", -1); R(g, x0, y0, BW, 2, "#8a8aa4"); R(g, x0 + BW - 3, y0, 3, FH, "#f0a070");   // sun rim (right)
      // window band like app panels
      const r = hr(i + 30);
      for (let k = 0; k < 7; k++) { const wx = x0 + 4 + k * 21, on = !hang && (Math.sin(t * 2 + k + i * 3) > -0.6);
        R(g, wx, y0 + 5, 17, 11, on ? "#24406a" : "#1a2236"); R(g, wx, y0 + 5, 17, 1, on ? "#5fa0d8" : "#2a3450");
        if (on) { R(g, wx + 2, y0 + 8, 6 + Math.floor(r() * 8), 1, "#9fd8f0"); R(g, wx + 2, y0 + 11, 4 + Math.floor(r() * 6), 1, ["#3df56b", "#f7c948", "#f25ca8"][(k + i) % 3]); } }
      if (!hang && t < tl + 0.35) { const k = (t - tl) / 0.35; for (let j = 0; j < 10; j++) { const s = j < 5 ? -1 : 1; A(g, 1 - k, () => R(g, x0 + BW / 2 + s * (BW / 2 + k * 22 * ((j % 5) / 4 + 0.3)), y0 + FH - 3 - k * 6 * (j % 3), 3, 3, "#c8b8a8")); } }
      const li = label(i);
      if (li >= 0) { const k = PX.p(t, at[li], 0.3, "back"), w = PX.tw(g, labels[li], { size: 8 }) + 10, lx = x0 + BW / 2 - w / 2;
        PX.zoom(g, k, x0 + BW / 2, y0 + FH / 2, () => { R(g, lx - 1, y0 + 2, w + 2, FH - 4, "#0c1020"); R(g, lx, y0 + 3, w, FH - 6, "#1a2a4a"); PX.box(g, lx, y0 + 3, w, FH - 6, "#5fe3e8"); PX.text(g, labels[li], x0 + BW / 2, y0 + 6, { size: 8, col: "#e8fbfc", align: "center" }); });
        if (t - at[li] < 0.5) G(g, x0 + BW / 2, y0 + FH / 2, 50, "rgba(95,227,232,0.5)"); }
    }
    // ground floor entrance
    if (nd > 0) { R(g, BX + 5, GY - 15, 16, 15, "#c89a5a"); R(g, BX + 6, GY - 14, 14, 14, "#ffcf8a"); R(g, BX + 12, GY - 14, 1, 14, "#a07a40"); G(g, BX + 13, GY - 6, 24, "rgba(255,200,120,0.45)"); }
    // welder robots on the newest floor + shrugging robot at the top when stalled
    if (nd > 0 && !stopped) { const y0 = fy(nd - 1); robo(g, BX + 12, y0, t, { pose: "weld", ph: 1 });
      if (Math.sin(t * 25) > 0) { star4(g, BX + 26, y0 - 9, 2, "#fff4a0"); G(g, BX + 26, y0 - 9, 14, "rgba(255,220,120,0.8)"); } }
    if (nd > 0) robo(g, BX + BW - 16, fy(nd - 1), t, { pose: stopped ? "shrug" : "idle", ph: 2 });
    if (stopped) pop(g, t, stall + 0.35, "?", BX + BW - 16, fy(nd - 1) - 50, { size: 16, col: "#f7c948", align: "center" });
    // fog over the top 20% (rolls in at stall)
    const fogA = 0.35 + 0.6 * PX.p(t, stall, 1.0, "io");
    for (let i = 0; i < 16; i++) { const r = hr(i + 70), fx = BX - 60 + ((r() * 290 + t * (5 + r() * 7)) % 290), fyy = fy(N - 1) - 10 + r() * 56;
      A(g, fogA * (0.18 + r() * 0.14), () => { LB().ell(g, fx, fyy, 22 + r() * 26, 5 + r() * 5, i % 3 ? "#b49ac0" : "#d8b8c8"); LB().ell(g, fx + 8, fyy - 2, 14 + r() * 10, 3, "#e8d0d8"); }); }

    // ---- tower cranes with AI-head cabs
    const crane = (tx, side, jy, idx) => {
      // tower lattice
      for (let yy = jy; yy < GY; yy += 8) { R(g, tx - 5, yy, 2, 8, "#d8a030"); R(g, tx + 4, yy, 2, 8, "#b88020"); PX.line(g, tx - 4, yy, tx + 4, yy + 7, "#a87020"); R(g, tx - 5, yy, 11, 1, "#e8b848"); }
      R(g, tx - 12, GY - 4, 25, 6, "#5a5a68");
      // jib toward the building + counter-jib with weight
      const j1 = side > 0 ? tx : tx - 180, jl = 180;
      R(g, j1, jy, jl, 3, "#e0a838"); R(g, j1, jy + 6, jl, 1, "#b88020"); for (let xx = j1; xx < j1 + jl; xx += 6) PX.line(g, xx, jy + 3, xx + 3, jy + 6, "#b88020");
      const cw = side > 0 ? tx - 50 : tx + 10; R(g, cw, jy, 40, 3, "#e0a838"); mat(g, side > 0 ? cw : cw + 26, jy + 3, 14, 12, "#6a6a78", -1);
      PX.line(g, tx, jy - 22, j1 + (side > 0 ? jl - 10 : 10), jy, "#8a7040"); PX.line(g, tx, jy - 22, cw + (side > 0 ? 0 : 40), jy, "#8a7040");
      R(g, tx - 1, jy - 24, 3, 24, "#d8a030");
      // cab = AI head
      const eyes = stopped ? "shrug" : undefined;
      bot(g, tx + side * 2, jy + 16, 22, t, { eyes, ph: idx });
      // idle hook when this crane isn't carrying (or stalled): pendulum
      let carrying = false; for (let i = idx; i < built; i += 2) { const tl = fdone(i); if (t >= tl - sp * 1.4 && t < tl) carrying = true; }
      if (!carrying) { const hx = tx + side * 70 + (stopped ? Math.round(Math.sin(t * 2.2) * 3 * Math.exp(-(t - stall) * 0.6)) : 0), hy = jy + 40 + (stopped ? 0 : Math.round(Math.sin(t * 4 + idx) * 6));
        R(g, hx - 3, jy + 3, 7, 3, "#3a3a44"); PX.line(g, tx + side * 70, jy + 6, hx, hy, "#2a2a30"); R(g, hx - 2, hy, 5, 3, "#f7c948"); R(g, hx, hy + 3, 1, 3, "#f7c948"); }
    };
    crane(150, 1, 54, 0); crane(490, -1, 66, 1);
    // ground life: tyre tracks, a robot hauling a beam (stops at the stall)
    for (let xx = 130; xx < 520; xx += 6) { R(g, xx, 312, 3, 1, "#3a2620"); R(g, xx + 2, 318, 3, 1, "#3a2620"); }
    { const wx = stopped ? PX.lerp(120, 470, (stall % 4.2) / 4.2) : PX.lerp(120, 470, (t % 4.2) / 4.2);
      mat(g, wx - 18, 280 + (stopped ? 0 : Math.round(Math.abs(Math.sin(t * 8)))), 36, 3, "#8a3a2a", -1); robo(g, wx, 312, t, { ph: 4 }); }
    // ---- progress sign (right, on a pole)
    const pct = Math.min(80, nd * 10), sxp = 528, syp = 150;
    R(g, sxp + 30, syp + 40, 4, GY - syp - 40, "#2a2430");
    mat(g, sxp, syp, 64, 44, "#1a1c28", -1); PX.box(g, sxp + 2, syp + 2, 60, 40, "#f7c948");
    PX.text(g, pct + "%", sxp + 32, syp + 8, { size: 16, col: pct >= 80 ? "#3df56b" : "#f7c948", align: "center" });
    R(g, sxp + 6, syp + 30, 52, 6, "#0c0e16"); R(g, sxp + 6, syp + 30, Math.round(52 * pct / 100), 6, pct >= 80 ? "#3df56b" : "#f7c948");
    R(g, sxp + 6 + Math.round(52 * 0.8), syp + 28, 1, 10, "#ff5c5c");
    G(g, sxp + 32, syp + 22, 50, pct >= 80 ? "rgba(61,245,107,0.25)" : "rgba(247,201,72,0.2)");
    // ---- foreground: fence with hazard stripes, cones
    PX.par(g, c, 1.15, () => {
      R(g, -20, 326, 680, 4, "#2a2a30"); for (let xx = -20; xx < 680; xx += 60) R(g, xx, 316, 3, 44, "#3a3a44");
      for (let xx = -20; xx < 680; xx += 12) { thick(g, xx, 344, xx + 6, 336, 3, "#f7c948"); }
      R(g, -20, 334, 680, 1, "#1a1a20"); R(g, -20, 346, 680, 14, "#18141a");
      for (const cx of [90, 600]) { R(g, cx - 7, 340, 14, 3, "#1a1410"); for (let k = 0; k < 14; k++) R(g, cx - Math.round(k / 3), 326 + k, 1 + Math.round(k / 1.5), 1, k % 5 < 2 ? "#f0f0f0" : "#f08a3c"); }
    });
    PX.particles(g, 2528090685, 30, t, [0, 150, 640, 160], { vy: -3, vx: 4, col: "#ffd8a8", a: 0.5 });
    PX.vignette(g, 0.5);
  };

  // ======================= support_email =======================
  // the dev's laptop in a café at night: an inbox; at o.mail (0.8) a new email slides in with a ding, opens at o.open (1.6):
  // "I keep getting logged out" / "At random. Only on my phone." At o.phone (3.0) a phone pops up in the foreground showing
  // the app; "LOGGED OUT" flashes at o.flashes (default phone + [0.5, 1.5, 2.3]).
  K.support_email = (o) => (g, t, d, c) => {
    const tm = T(o, "mail", 0.8, d, 6), top = T(o, "open", 1.6, d, 6), tp = T(o, "phone", 3.0, d, 6);
    const fl = o.flashes || [tp + 0.5 * d / 6, tp + 1.5 * d / 6, tp + 2.3 * d / 6];
    // ---- far: brick wall + rainy window with neon street
    PX.par(g, c, 0.45, () => {
      PX.vgrad(g, 0, 0, 640, 280, "2a1c26", "160f16", 8);
      for (let yy = 0, row = 0; yy < 280; yy += 7, row++) for (let xx = (row % 2) * 9 - 9; xx < 640; xx += 18) { R(g, xx, yy, 17, 6, row % 3 ? "#33212c" : "#3a2632"); R(g, xx, yy, 17, 1, "#46303c"); }
      // window
      const wx = 360, wy = 28, ww = 250, wh = 150;
      R(g, wx - 6, wy - 6, ww + 12, wh + 12, "#1a1014");
      PX.vgrad(g, wx, wy, ww, wh, "141a3a", "2a1c40", 6);
      for (let i = 0; i < 9; i++) { const bx = wx + i * 30 - 8, bh = 50 + ((i * 37) % 60); R(g, bx, wy + wh - bh, 26, bh, "#1c1830"); for (let k = 0; k < 6; k++) if ((i + k) % 3) R(g, bx + 4 + (k % 3) * 7, wy + wh - bh + 6 + Math.floor(k / 3) * 10, 3, 4, "#d8a858"); }
      // neon sign across the street (flickers)
      const nOn = !(Math.floor(t * 7) % 23 === 0);
      if (nOn) { G(g, wx + 70, wy + 50, 50, "rgba(242,92,168,0.6)"); G(g, wx + 190, wy + 70, 40, "rgba(95,227,232,0.5)"); }
      rr(g, wx + 40, wy + 40, 60, 18, 4, nOn ? "#f25ca8" : "#5a2a44"); rr(g, wx + 42, wy + 42, 56, 14, 3, "#1a1020"); for (let k = 0; k < 4; k++) R(g, wx + 48 + k * 12, wy + 46, 8, 6, nOn ? "#f25ca8" : "#5a2a44");
      PX.circle(g, wx + 190, wy + 70, 9, nOn ? "#5fe3e8" : "#2a5a5c"); PX.circle(g, wx + 190, wy + 70, 6, "#1a1020"); R(g, wx + 189, wy + 65, 2, 6, nOn ? "#5fe3e8" : "#2a5a5c");
      // street + reflections
      R(g, wx, wy + wh - 18, ww, 18, "#12101e"); A(g, 0.5, () => { R(g, wx + 50, wy + wh - 16, 40, 2, "#f25ca8"); R(g, wx + 180, wy + wh - 12, 22, 2, "#5fe3e8"); });
      // car light streak passing
      const cx = wx + ((t * 120) % (ww + 200)) - 100; if (cx > wx && cx < wx + ww - 20) { R(g, cx, wy + wh - 22, 20, 5, "#2a2a3a"); R(g, cx + 18, wy + wh - 21, 2, 2, "#fff0b0"); G(g, cx + 20, wy + wh - 20, 18, "rgba(255,230,160,0.6)"); }
      LB().rain(g, t, 8, 60, [wx, wy, ww, wh], { a: 0.35, col: "#8aa0d0" });
      // drops sliding down the glass
      for (let i = 0; i < 10; i++) { const r = hr(i + 300), dx = wx + r() * ww, dy = wy + ((r() * wh + t * (8 + r() * 14)) % wh); R(g, dx, dy, 1, 2, "#9ab0d8"); R(g, dx, dy - 4, 1, 4, "rgba(150,170,220,0.25)"); }
      R(g, wx + ww / 2 - 2, wy, 4, wh, "#1a1014"); R(g, wx - 8, wy + wh + 6, ww + 16, 5, "#3a2a24"); R(g, wx - 8, wy + wh + 6, ww + 16, 1, "#5a4232");
      // chalkboard menu (squiggles only)
      R(g, 60, 40, 120, 90, "#5a3e2a"); R(g, 64, 44, 112, 82, "#1c2420");
      for (let i = 0; i < 7; i++) { const r = hr(i + 400); R(g, 72, 54 + i * 10, 40 + r() * 50, 1, "#c8d0c8"); R(g, 150 + r() * 10, 54 + i * 10, 14, 1, "#e8c870"); }
      PX.circle(g, 162, 112, 6, "#c8d0c8"); PX.circle(g, 162, 112, 4, "#1c2420");
    });
    // ---- mid: counter + espresso machine + pendants
    PX.par(g, c, 0.7, () => {
      mat(g, -10, 196, 330, 70, "#4a2e22", -1); R(g, -10, 192, 330, 5, "#7a5238"); R(g, -10, 192, 330, 1, "#a87a54");
      for (let xx = 10; xx < 320; xx += 40) R(g, xx, 200, 1, 66, "#3a2218");
      // espresso machine
      mat(g, 130, 150, 70, 42, "#6a7484", -1); R(g, 130, 150, 70, 3, "#a8b2c0"); R(g, 136, 158, 58, 10, "#5a6270"); R(g, 150, 168, 6, 10, "#3a3f4b"); R(g, 174, 168, 6, 10, "#3a3f4b");
      R(g, 140, 159, 4, 4, PX.blink(t, 1.3) ? "#3df56b" : "#1a5a2a"); R(g, 147, 159, 4, 4, "#ff5c5c");
      for (let i = 0; i < 4; i++) { const k = (t * 0.6 + i / 4) % 1; A(g, 0.45 * (1 - k), () => R(g, 186 + Math.sin(k * 7 + i) * 3, 146 - k * 30, 3, 3, "#d8dee9")); }
      // jars on shelf
      R(g, 220, 120, 90, 4, "#5a3e2a"); for (let i = 0; i < 5; i++) { R(g, 224 + i * 17, 104, 12, 16, "#3a4a5a"); R(g, 224 + i * 17, 104, 12, 3, "#7a5a3a"); R(g, 225 + i * 17, 110, 10, 9, ["#6a4a2a", "#3a2a1a", "#8a6a3a"][i % 3]); R(g, 224 + i * 17, 107, 1, 12, "#8a9ab0"); }
      // plant at the counter end
      for (let i = 0; i < 6; i++) { const a = -1.2 + i * 0.48 + Math.sin(t * 1.2 + i) * 0.05; for (let k = 0; k < 16; k++) R(g, 290 + Math.sin(a) * k, 176 - Math.cos(a) * k + k * k / 50, 2, 2, k > 10 ? "#4fa865" : "#2f7a46"); }
      mat(g, 283, 176, 16, 16, "#8a4a2c", -1);
    });
    // pendants (hang from ceiling, warm)
    for (const [px, ph] of [[120, 0], [520, 1.3]]) {
      const sw = Math.round(Math.sin(t * 0.9 + ph) * 2), py = 70;
      PX.line(g, px, 0, px + sw, py, "#1a1418"); R(g, px + sw - 12, py, 24, 10, "#2a3a2e"); R(g, px + sw - 14, py + 10, 28, 3, "#3a4a3e"); R(g, px + sw - 14, py + 10, 28, 1, "#6a7a6e"); R(g, px + sw - 9, py + 13, 18, 2, "#ffe2a8");
      G(g, px + sw, py + 20, 110, "rgba(255,190,110,0.45)"); LB().cone(g, px + sw, py + 14, 24, 120, 150, "#ffd89a", 0.11);
    }
    // ---- foreground table
    PX.vgrad(g, 0, 268, 640, 92, "5a3a28", "2a1a12", 6);
    R(g, 0, 266, 640, 3, "#8a5e40"); R(g, 0, 266, 640, 1, "#b88a60");
    for (let i = 0; i < 6; i++) R(g, 40 + i * 110, 280 + (i % 3) * 18, 60, 1, "#4a2e1e");
    G(g, 320, 270, 160, "rgba(140,200,255,0.18)");
    // coffee cup + saucer, croissant
    LB().ell(g, 470, 290, 20, 5, "#8a909c"); LB().ell(g, 470, 289, 17, 3, "#aab0bc");
    R(g, 461, 274, 18, 14, "#c0c6d0"); R(g, 461, 274, 2, 14, "#dfe4ea"); R(g, 476, 274, 3, 14, "#a8b0bc"); R(g, 479, 277, 4, 7, "#c8ccd4"); LB().ell(g, 470, 275, 8, 2, "#5a3420");
    for (let i = 0; i < 3; i++) { const k = (t * 0.7 + i / 3) % 1; A(g, 0.5 * (1 - k), () => R(g, 466 + i * 3 + Math.round(Math.sin(k * 6 + i) * 2), 268 - k * 18, 2, 3, "#e0e4ea")); }
    LB().ell(g, 530, 296, 18, 7, "#c8803a"); LB().ell(g, 530, 294, 15, 5, "#e0a050"); for (let k = -2; k <= 2; k++) R(g, 530 + k * 6, 290, 1, 8, "#a8602a");
    // ---- laptop (screen facing us)
    const LX = 196, LY = 72, LW2 = 248, LH2 = 148;
    G(g, LX + LW2 / 2, LY + LH2 / 2, 200, "rgba(120,180,255,0.22)");
    rr(g, LX - 8, LY - 8, LW2 + 16, LH2 + 16, 5, "#1a1d24"); R(g, LX - 6, LY - 7, LW2 + 12, 1, "#4a505e"); R(g, LX - 7, LY - 6, 1, LH2 + 12, "#3a3f4b");
    // deck (perspective toward the viewer)
    for (let i = 0; i < 30; i++) { const w = LW2 + 16 + i * 2.4; R(g, LX + LW2 / 2 - w / 2, LY + LH2 + 8 + i, w, 1, i === 0 ? "#5a6070" : i < 3 ? "#3a3f4b" : "#2b2f38"); }
    for (let ky = 0; ky < 4; ky++) for (let kx = 0; kx < 18; kx++) { const w = LW2 - 40 + ky * 8, kw = w / 18; R(g, LX + LW2 / 2 - w / 2 + kx * kw + 1, LY + LH2 + 11 + ky * 4, kw - 2, 2, "#454b58"); }
    R(g, LX + LW2 / 2 - 24, LY + LH2 + 29, 48, 8, "#353a45");
    // screen content
    const sx = LX, sy = LY, sw = LW2, shh = LH2;
    R(g, sx, sy, sw, shh, "#161d2b"); R(g, sx, sy, sw, 12, "#2d3a55");
    for (let i = 0; i < 3; i++) R(g, sx + 4 + i * 6, sy + 4, 4, 4, ["#ff5c5c", "#f7c948", "#3df56b"][i]);
    PX.text(g, "INBOX", sx + sw / 2, sy + 1, { font: "v", size: 12, col: "#c9d4e6", align: "center" });
    R(g, sx, sy + 12, 46, shh - 12, "#111723"); for (let i = 0; i < 5; i++) { R(g, sx + 5, sy + 20 + i * 12, 5, 5, ["#3d7cf5", "#9aa4b2", "#9aa4b2", "#9aa4b2", "#9aa4b2"][i]); R(g, sx + 13, sy + 21 + i * 12, 26, 2, i ? "#3a4560" : "#7a9ad8"); }
    const opened = t >= top, mk = PX.p(t, tm, 0.45, "back"), rowH = 20, lx0 = sx + 50;
    if (!opened) {
      // inbox list: existing rows shift down as the new one slides in
      for (let i = 0; i < 6; i++) { const ry = sy + 16 + (i + (t >= tm ? mk : 0)) * rowH; if (ry > sy + shh - rowH) continue; const r = hr(i + 500);
        R(g, lx0, ry, sw - 54, rowH - 2, "#1e2738"); PX.circle(g, lx0 + 9, ry + 9, 6, ["#9a7ad8", "#d89a6a", "#6ab0d8", "#8ac87a", "#d87a8a", "#c8b46a"][i]);
        R(g, lx0 + 20, ry + 5, 40 + r() * 40, 2, "#6a7894"); R(g, lx0 + 20, ry + 11, 80 + r() * 60, 1, "#3e4a62"); R(g, sx + sw - 22, ry + 5, 14, 1, "#3e4a62"); }
      if (t >= tm) { const ry = sy + 16 + Math.round((mk - 1) * rowH);
        R(g, lx0, ry, sw - 54, rowH - 2, "#24395a"); R(g, lx0, ry, 3, rowH - 2, "#5fe3e8"); PX.circle(g, lx0 + 11, ry + 9, 6, "#f08a3c"); R(g, lx0 + 9, ry + 7, 1, 1, "#2a1608"); R(g, lx0 + 13, ry + 7, 1, 1, "#2a1608"); R(g, lx0 + 9, ry + 11, 5, 1, "#2a1608");
        PX.text(g, "I keep getting logged out", lx0 + 22, ry + 1, { font: "v", size: 12, col: "#e8f1f2" }); R(g, lx0 + 22, ry + 13, 110, 1, "#5a6a88"); PX.circle(g, sx + sw - 12, ry + 9, 3, "#5fe3e8"); }
      if (t >= tm && t < tm + 0.7) A(g, 1 - (t - tm) / 0.7, () => R(g, lx0, sy + 16, sw - 54, rowH - 2, "rgba(95,227,232,0.5)"));
    } else {
      // opened message
      const ok = PX.p(t, top, 0.25, "out");
      A(g, ok, () => {
        R(g, lx0, sy + 14, sw - 54, shh - 16, "#1b2333");
        PX.circle(g, lx0 + 12, sy + 28, 8, "#f08a3c"); R(g, lx0 + 9, sy + 26, 1, 2, "#2a1608"); R(g, lx0 + 14, sy + 26, 1, 2, "#2a1608"); R(g, lx0 + 9, sy + 31, 6, 1, "#2a1608");
        R(g, lx0 + 26, sy + 22, 60, 3, "#8a9ac0"); R(g, lx0 + 26, sy + 29, 90, 2, "#46526c");
        R(g, lx0 + 6, sy + 42, sw - 66, 1, "#2e3a52");
        PX.text(g, PX.typed("I keep getting logged out", t, top + 0.15, 30), lx0 + 8, sy + 50, { font: "v", size: 16, col: "#e8f1f2" });
        PX.text(g, PX.typed("At random. Only on my phone.", t, top + 1.05, 30), lx0 + 8, sy + 70, { font: "v", size: 16, col: "#e8f1f2" });
        for (let i = 0; i < 3; i++) R(g, lx0 + 8, sy + 98 + i * 8, 120 - i * 30, 1, "#3a465e");
      });
    }
    R(g, sx, sy, sw, 1, "rgba(255,255,255,0.25)");
    // ding: bell pops above the laptop corner
    if (t >= tm && t < tm + 1.4) { const k = PX.p(t, tm, 0.3, "back"), bx = LX + LW2 + 4, by = LY - 2, wob = Math.round(Math.sin((t - tm) * 30) * 2 * (1 - (t - tm) / 1.4));
      A(g, PX.clamp((tm + 1.4 - t) / 0.3, 0, 1), () => PX.zoom(g, k, bx, by, () => {
        PX.circle(g, bx + wob, by, 9, "#f7c948"); R(g, bx - 10 + wob, by + 5, 21, 4, "#f7c948"); R(g, bx - 3 + wob, by - 12, 6, 3, "#c89a20"); PX.circle(g, bx + wob, by + 10, 3, "#c89a20"); R(g, bx - 5 + wob, by - 5, 2, 7, "#fff0b0");
        for (const s of [-1, 1]) { R(g, bx + s * 15, by - 6, 2, 8, "#f7c948"); R(g, bx + s * 19, by - 9, 2, 12, "#f7c948"); }
      }));
      G(g, bx, by, 34, "rgba(247,201,72,0.5)"); }
    // ---- the dev over the shoulder (bottom-left)
    PX.par(g, c, 1.2, () => {
      const by = Math.round(Math.sin(t * 1.6) * 1);
      LB().ell(g, 70, 372 + by, 130, 60, "#1f5e36"); LB().ell(g, 66, 370 + by, 120, 54, "#2f8a4e"); for (let i = 0; i < 90; i++) R(g, 60 + i * 1.3, 318 + by + Math.round(i * i / 260), 2, 1, "#4fb36a");
      LB().ell(g, 82, 322 + by, 48, 14, "#1f5e36");
      R(g, 50, 304 + by, 64, 6, "#23262f"); R(g, 50, 304 + by, 64, 1, "#4a505e"); R(g, 108, 300 + by, 10, 12, "#2b2f3a"); R(g, 110, 303 + by, 4, 6, "#3df56b");
      LB().ell(g, 70, 262 + by, 42, 48, "#120c08"); LB().ell(g, 66, 258 + by, 38, 44, "#1a120c");
      for (let i = 0; i < 16; i++) { const a = -3.0 + i * 0.2, L2 = 44 + (i % 3) * 3; thick(g, 70 + Math.cos(a) * 36, 262 + by + Math.sin(a) * 42, 70 + Math.cos(a + 0.12) * L2, 262 + by + Math.sin(a + 0.12) * (L2 + 5), 3, "#1a120c"); }
      for (let i = 0; i < 7; i++) { const a = -2.6 + i * 0.3; thick(g, 70 + Math.cos(a) * 18, 262 + by + Math.sin(a) * 22, 70 + Math.cos(a + 0.2) * 34, 262 + by + Math.sin(a + 0.2) * 40, 1, "#3a2a1c"); }
      for (let i = 0; i < 40; i++) { const a = -1.2 + i * 0.05; R(g, 70 + Math.cos(a) * 41, 262 + by + Math.sin(a) * 47, 2, 2, "#5a7aa8"); }
      R(g, 108, 262 + by, 6, 12, "#8a5a38"); R(g, 112, 264 + by, 2, 8, "#c99668");
    });
    // ---- the phone pops up (foreground right, in the dev's hand)
    if (t >= tp) {
      const k = PX.p(t, tp, 0.5, "back"), ppx = 500, ppy = Math.round(PX.lerp(380, 130, k)), pw = 74, ph = 132;
      let fi = -1; for (let i = 0; i < fl.length; i++) if (t >= fl[i] && t < fl[i] + 0.45) fi = i;
      const shk = fi >= 0 ? Math.round(Math.sin(t * 80) * 2) : 0;
      PX.par(g, c, 1.15, () => {
        // hand + sleeve
        const wx = ppx + pw / 2 + 10 + shk, wy = ppy + ph + 18;
        LB().limb(g, 680, 420, wx + 14, wy + 6, 30, "#2f8a4e", "#1f5e36"); LB().limb(g, wx + 30, wy + 30, wx + 14, wy + 6, 4, "#4fb36a");
        LB().limb(g, wx + 6, wy + 2, wx + 22, wy + 10, 22, "#4fb36a");
        R(g, ppx + 8 + shk, ppy + ph - 2, pw - 4, 22, "#a06c44"); R(g, ppx + 8 + shk, ppy + ph - 2, pw - 4, 2, "#c99668");
        for (let i = 0; i < 4; i++) { R(g, ppx + pw - 2 + shk, ppy + 52 + i * 14, 8, 10, "#b07a4e"); R(g, ppx + pw - 2 + shk, ppy + 52 + i * 14, 8, 1, "#c99668"); R(g, ppx + pw + 5 + shk, ppy + 52 + i * 14, 1, 10, "#8a5a38"); }
        G(g, ppx + pw / 2, ppy + ph / 2, 90, fi >= 0 ? "rgba(255,92,92,0.4)" : "rgba(120,180,255,0.3)");
        phone(g, ppx + shk, ppy, pw, ph, () => appScreen(g, ppx + shk, ppy, pw, ph, t, { state: fi >= 0 ? "login" : "app" }));
        R(g, ppx - 6 + shk, ppy + 70, 9, 26, "#b07a4e"); R(g, ppx - 6 + shk, ppy + 70, 9, 2, "#c99668"); R(g, ppx - 6 + shk, ppy + 70, 2, 26, "#c99668");   // thumb
        if (fi >= 0) { const bk = PX.p(t, fl[fi], 0.12, "back"), cx = ppx + pw / 2 + shk, cy = ppy + ph * 0.42;
          PX.zoom(g, bk, cx, cy, () => { R(g, cx - 50, cy - 10, 100, 22, "#5a0e12"); R(g, cx - 49, cy - 9, 98, 20, "#e8453c"); R(g, cx - 49, cy - 9, 98, 1, "#ff9a90"); PX.text(g, "LOGGED OUT", cx, cy - 3, { size: 8, col: "#fff2f0", align: "center" }); });
          G(g, cx, cy, 60, "rgba(255,80,80,0.5)"); }
      });
    }
    PX.particles(g, 1457683801, 26, t, [60, 80, 520, 180], { vy: -2, vx: 1, col: "#ffe2b0", a: 0.5 });
    PX.vignette(g, 0.55);
  };

  // ======================= code_wall =======================
  // the dev opens the project: an endless tower of code streams upward on a giant wall monitor (tiny scroll thumb);
  // HUD "LINES: 4,000" counts up, "LINES YOU READ: 0"; at o.pale (1.6) his face drains, at o.shock (2.6) full shock +
  // sweat and his mug drops. o.lines (4000) final count.
  K.code_wall = (o) => (g, t, d, c) => {
    const tpale = T(o, "pale", 1.6, d, 4.5), tshock = T(o, "shock", 2.6, d, 4.5), total = o.lines || 4000;
    const MX = 48, MY = 26, MW = 372, MH = 222;
    // ---- far: wall, window with night city, posters
    PX.vgrad(g, 0, 0, 640, 300, "151a33", "0b0e1c", 10);
    PX.par(g, c, 0.45, () => {
      R(g, 470, 84, 130, 96, "#222842"); if (PX.core) PX.core.skyline(g, 474, 88, 122, 88, t, 9); R(g, 533, 88, 4, 88, "#222842"); R(g, 466, 180, 138, 5, "#2e3555");
      for (let yy = 88; yy < 176; yy += 5) R(g, 474, yy, 122, 1, "rgba(20,24,44,0.55)");
      R(g, 432, 110, 26, 34, "#2a2440"); R(g, 434, 112, 22, 30, "#3a2a5a"); PX.text(g, "{}", 445, 122, { size: 8, col: "#f25ca8", align: "center" });
    });
    // ---- giant monitor on the wall
    G(g, MX + MW / 2, MY + MH / 2, 330, "rgba(80,170,255,0.22)");
    R(g, MX - 8, MY - 8, MW + 16, MH + 16, "#0e1018"); R(g, MX - 8, MY - 8, MW + 16, 1, "#3a4052"); R(g, MX - 8, MY - 8, 1, MH + 16, "#2a3040");
    R(g, MX, MY, MW, MH, "#0d1117"); R(g, MX, MY, MW, 10, "#161b22"); R(g, MX + 3, MY + 2, 44, 8, "#0d1117"); PX.text(g, "app/", MX + 6, MY + 1, { font: "v", size: 10, col: "#c9d1d9" });
    R(g, MX + 50, MY + 2, 50, 8, "#161b22"); R(g, MX + 104, MY + 2, 40, 8, "#161b22");
    // code stream (upward, accelerating)
    const t0 = 0.35, sc = t < t0 ? 0 : 18 * (t - t0) + 26 * (t - t0) * (t - t0) + (t > tshock ? 30 * (t - tshock) * (t - tshock) : 0);
    const lh = 6, rowsN = Math.ceil((MH - 12) / lh) + 1, first = Math.floor(sc), frac = sc - first, speed = 18 + 52 * Math.max(0, t - t0);
    const TOK = ["#ff7b72", "#d2a8ff", "#c9d1d9", "#a5d6ff", "#7ee787", "#ffa657", "#79c0ff"];
    g.save(); g.beginPath(); g.rect(MX, MY + 10, MW - 8, MH - 10); g.clip();
    for (let i = 0; i < rowsN; i++) {
      const li = first + i, y = MY + 12 + Math.round((i - frac) * lh), r = hr(li * 7 + 3);
      const ind = Math.floor(r() * 4) * 8;
      R(g, MX + 4, y + 2, 10, 1, "#30363d");
      let x = MX + 22 + ind, n = 2 + Math.floor(r() * 8);
      if (r() < 0.12) continue;
      for (let k = 0; k < n && x < MX + MW - 64; k++) { const w = 6 + Math.floor(r() * 34); R(g, x, y + 1, w, 3, TOK[Math.floor(r() * TOK.length)]); x += w + 4; }
      if (speed > 70) A(g, Math.min(0.5, (speed - 70) / 140), () => R(g, MX + 22 + ind, y + 4, Math.min(MW - 60, x - MX - 22 - ind), 3, "#2a6a9a"));   // motion smear
    }
    g.restore();
    // minimap strip (the whole file, squeezed) with a tiny viewport box
    { const mx = MX + MW - 44, my = MY + 12; R(g, mx - 2, my - 2, 36, MH - 14, "#0a0d12");
      for (let yy = 0; yy < MH - 18; yy++) { const r = hr(yy * 13 + Math.floor(sc / 40) * 977); if (r() < 0.2) continue; R(g, mx + Math.floor(r() * 6), my + yy, 4 + Math.floor(r() * 24), 1, TOK[Math.floor(r() * TOK.length)] + "88"); }
      PX.box(g, mx - 2, my + Math.round(Math.min(1, sc / 2400) * (MH - 20)), 36, 3, "#c9d1d9"); }
    // scrollbar with a tiny thumb that barely moves
    R(g, MX + MW - 7, MY + 10, 6, MH - 10, "#161b22"); R(g, MX + MW - 6, MY + 12 + Math.round(Math.min(1, sc / 2400) * (MH - 16)), 4, 2, "#8b949e");
    R(g, MX, MY, MW, 1, "rgba(255,255,255,0.18)");
    // monitor stand + desk below
    R(g, MX + MW / 2 - 6, MY + MH + 8, 12, 14, "#1a1d24");
    R(g, 0, 268, 640, 8, "#3a2a20"); R(g, 0, 268, 640, 1, "#6a4e38"); PX.vgrad(g, 0, 276, 640, 84, "1a1410", "0c0a08", 5);
    R(g, 120, 260, 120, 8, "#2b2f38"); for (let kx = 0; kx < 18; kx++) R(g, 123 + kx * 6.4, 262, 5, 2, "#5a6270");
    if (PX.core) PX.core.mug(g, 270, 258, t);
    for (let i = 0; i < 5; i++) { const a = -1.1 + i * 0.55 + Math.sin(t * 1.4 + i) * 0.05; for (let k = 0; k < 14; k++) R(g, 60 + Math.sin(a) * k, 254 - Math.cos(a) * k + k * k / 40, 2, 2, k > 9 ? "#4fa865" : "#2f7a46"); }
    mat(g, 53, 254, 14, 14, "#8a4a2c", -1);
    G(g, 230, 270, 200, "rgba(80,170,255,0.18)");
    // floor: screen reflection + the office chair he pushed back
    for (let i = 0; i < 10; i++) A(g, 0.08 + 0.02 * Math.sin(t * 3 + i), () => R(g, MX + 20 + i * 8, 290 + i * 6, MW - 40 - i * 16, 2, "#4a9ad8"));
    { const cx = 352; R(g, cx - 24, 236, 48, 44, "#20232c"); R(g, cx - 24, 236, 48, 2, "#3a4050"); R(g, cx - 24, 236, 2, 44, "#2c3040"); R(g, cx - 28, 280, 56, 8, "#262a34"); R(g, cx - 28, 280, 56, 1, "#4a5060");
      R(g, cx - 2, 288, 4, 30, "#1a1c22"); R(g, cx - 26, 318, 52, 3, "#1a1c22"); for (const wx of [-26, -2, 22]) R(g, cx + wx, 321, 4, 3, "#0c0d10"); }
    // ---- the dev (standing right, lit by the screen from the left)
    const pale = PX.clamp((t - tpale) / 0.8, 0, 1), sk = (k) => { const a = [0xb0, 0x7a, 0x4e], b = [0xc4, 0xb8, 0x9a]; return "#" + a.map((v, i) => Math.round(PX.lerp(v, b[i], k)).toString(16).padStart(2, "0")).join(""); };
    const face = t < tpale ? "neutral" : t < tshock ? "sweat" : "shock", shk = shake(t, tshock, 0.4, 2);
    const dropT = tshock + 0.15, mugY = t < dropT ? null : Math.min(352, 268 + 400 * (t - dropT) * (t - dropT));
    const p = dev(g, 520 + shk, 350, { h: 104, skin: sk(pale), face, look: -2, lit: -1, bob: Math.sin(t * 2.4) > 0.5 ? 1 : 0,
      hands: { l: t < tshock ? [494, 318] : [484, 262], r: t < dropT ? [550, 292] : [566, 254] } });
    if (t < dropT) { R(g, 546, 280, 12, 13, "#b8bec8"); R(g, 546, 280, 2, 13, "#d8dde4"); R(g, 558, 283, 3, 6, "#b8bec8"); R(g, 547, 281, 10, 2, "#5a3420"); for (let i = 0; i < 2; i++) { const k = (t * 0.7 + i / 2) % 1; A(g, 0.5 * (1 - k), () => R(g, 550 + i * 3, 275 - k * 14, 2, 3, "#c9d1d9")); } }
    else if (mugY < 352) { R(g, 552 + (t - dropT) * 20, mugY - 14, 12, 14, "#b8bec8"); for (let i = 0; i < 4; i++) R(g, 556 + i * 3, mugY - 18 - i * 3, 2, 2, "#6a3a20"); }
    else { LB().ell(g, 566, 354, 16, 3, "#4a2a18"); R(g, 576, 348, 14, 8, "#c8ccd4"); }
    if (t >= tpale) LB().sweat(g, p.hx + 2, p.hy + 8, t, t >= tshock ? 3 : 1, 9);
    if (t >= tshock) { for (let i = 0; i < 3; i++) { const a = -2.5 + i * 0.5; thick(g, p.hx + Math.cos(a) * 30, p.hy + 4 + Math.sin(a) * 24, p.hx + Math.cos(a) * 38, p.hy + 4 + Math.sin(a) * 30, 2, "#e6edf3"); } }
    G(g, 470, 260, 90, "rgba(80,170,255,0.2)");
    // ---- HUD (game style)
    const n = Math.min(total, Math.round(total * PX.ease((t - t0) / Math.max(0.1, tshock - t0), "in")));
    const hx = 438, hy = 30;
    R(g, hx, hy, 176, 40, "rgba(5,6,10,0.75)"); PX.box(g, hx, hy, 176, 40, "#5fe3e8");
    PX.otext(g, "LINES: " + n.toLocaleString("en-US"), hx + 8, hy + 7, { size: 8, col: n >= total ? "#f7c948" : "#e8f1f2" });
    PX.otext(g, "LINES YOU READ: 0", hx + 8, hy + 24, { size: 8, col: PX.blink(t, 0.6, 0.7) || t < tshock ? "#ff5c5c" : "#7a2a2a" });
    PX.particles(g, 591706100, 24, t, [40, 30, 400, 230], { vy: -4, vx: 0, col: "#9fd8ff", a: 0.45 });
    PX.vignette(g, 0.55);
  };

  // seated person in side profile (the dev's face), (x, y) = hip on the seat, dir 1 = facing right, o.s = scale (native art).
  // o.hat (fedora, o.hatPop px), o.hood 0..1 (1 = hood up, face in shadow), o.face "calm"|"jaw"|"squint", o.arm "table"|"lens"|"drop"
  const sideSit = (g, x, y, dir, t, o) => {
    o = o || {}; const S = o.s || 1, q = (v) => Math.round(v * S);
    const SK = ["#d29a6c", "#b07a4e", "#8a5a38"], HO = ["#4fb36a", "#2f8a4e", "#1f5e36"], HA = ["#3a2a1c", "#1a120c"];
    const X = (dx) => x + dir * q(dx);
    const RX = (dx, y0, w, h, col) => { const a = X(dx), b = a + dir * q(w); R(g, Math.min(a, b), y0, Math.abs(b - a), q(h), col); };   // rect spanning w units forward from dx
    const floorY = o.floor || 330, bob = Math.sin(t * 2.2 + x) > 0.6 ? 1 : 0;
    // chair (behind)
    RX(-20, y - q(26), 4, 30, "#2a2a30"); RX(-20, y - q(26), 4, 1, "#4a4a54"); RX(-20, y + q(2), 34, 4, "#3a3a44"); RX(-20, y + q(2), 34, 1, "#5a5a66");
    RX(-18, y + q(6), 2, (floorY - y) / S - 6, "#22222a"); RX(10, y + q(6), 2, (floorY - y) / S - 6, "#22222a");
    // legs
    RX(-2, y - q(3), 28, 9, "#2b3550"); RX(-2, y - q(3), 28, 1, "#3d4a6a");
    RX(18, y + q(6), 8, (floorY - y) / S - 10, "#253048"); RX(17, floorY - q(4), 14, 4, "#14141a");
    // torso (leans forward, front edge lit by the lamp)
    const H = 34, top = y - q(H) + bob;
    for (let r = 0; r <= q(H); r++) { const yy = y - r + (r > 2 ? bob : 0), lean = (r / q(H)) * 6, w = 20 - (r > q(H) - 3 ? 2 : 0);
      RX(lean - w / 2 + 2, yy, w, 1 / S, HO[1]); RX(lean + w / 2 + 2 - 2.5, yy, 2.5, 1 / S, HO[0]); RX(lean - w / 2 + 2, yy, 3, 1 / S, HO[2]); }
    RX(-2, top + q(10), 1, 20, HO[2]);
    const hood = o.hood || 0, hx = X(10), hy = top - q(15), lit = hood > 0.5 ? 0 : 1;
    const skin = lit ? SK[1] : SK[2];
    // hood: behind the head (slides back + down when dropped) or folded on the back
    const hk = 1 - hood, hbx = hx - dir * q(hk * 13), hby = hy + q(hk * 15);
    if (hood > 0) { rr(g, hbx - q(16), hby - q(18), q(32), q(33), q(11), HO[2]); rr(g, hbx - q(15), hby - q(17), q(30), q(31), q(10), HO[1]); }
    else { rr(g, X(-5) - q(10), top - q(5), q(20), q(10), q(4), HO[2]); R(g, X(-5) - q(8), top - q(5), q(16), 1, HO[0]); }
    // neck
    RX(-3, hy + q(8), 8, 8, SK[2]);
    // head: cranium + jaw + nose
    rr(g, hx - q(11), hy - q(12), q(22), q(22), q(7), skin);
    RX(-3, hy + q(4), 12, 8, skin); RX(9, hy + q(4), 1, 5, skin); RX(-3, hy + q(11), 9, 1, SK[2]);
    RX(10, hy - q(2), 2, 6, skin); RX(12, hy + q(1), 1, 2, skin); RX(10, hy + q(4), 2, 1, SK[2]);
    RX(-11, hy - q(6), 2, 14, SK[2]); RX(8, hy - q(8), 1, 10, SK[0]);
    // face
    const face = o.face || "calm", E = (dx, yy, w, h, col) => RX(dx, hy + q(yy), w, h, col);
    if (face === "jaw") { E(4, -5, 4, 5, "#f2f2f2"); E(6, -4, 2, 3, "#1a1016"); E(3, -8, 5, 1, HA[1]); E(4, -9, 3, 1, HA[1]);
      RX(-3, hy + q(11), 11, 6, skin); E(4, 6, 5, 10, "#2a0e10"); E(5, 13, 3, 2, "#b04a4a"); RX(-3, hy + q(17), 10, 1, SK[2]); }
    else if (face === "squint") { E(4, -1, 4, 1, "#1a1016"); E(3, -4, 5, 1, HA[1]); E(4, -5, 2, 1, HA[1]); E(5, 7, 4, 1, "#5a2a1e"); }
    else { E(5, -3, 2, 3, "#1a1016"); E(6, -3, 1, 1, "#ffffff"); E(3, -6, 5, 1, HA[1]); E(5, 7, 4, 1, "#5a2a1e"); E(8, 6, 1, 1, "#5a2a1e"); }
    // ear
    RX(-2, hy - q(2), 4, 6, SK[2]); RX(-1, hy - q(1), 2, 4, SK[0]);
    // hair: messy cap, back block, fringe, spikes
    rr(g, hx - q(12), hy - q(15), q(24), q(11), q(5), HA[1]); RX(-12, hy - q(8), 7, 13, HA[1]);
    for (let i = 0; i < 7; i++) { R(g, hx - q(11) + q(i * 3.4), hy - q(17) - (i % 2), q(3), q(3), HA[1]); }
    RX(4, hy - q(7), 7, 3, HA[1]); RX(9, hy - q(6), 2, 3, HA[1]); RX(-12, hy - q(1), 3, 3, HA[1]);
    RX(-6, hy - q(15), 9, 1, HA[0]); RX(-2, hy - q(13), 7, 1, HA[0]); RX(2, hy - q(10), 5, 1, HA[0]);
    // headphones around the neck
    RX(-8, hy + q(14), 12, 3, "#23262f"); RX(-4, hy + q(12), 5, 6, "#2b2f3a"); RX(-3, hy + q(13), 3, 4, "#3df56b");
    if (o.hat) { const hb = o.hatPop || 0; rr(g, hx - q(10), hy - q(27) - hb, q(20), q(13), q(3), "#3a3228"); R(g, hx - q(10), hy - q(18) - hb, q(20), q(3), "#1a1612");
      R(g, hx - q(18), hy - q(15) - hb, q(36), q(3), "#4a4034"); R(g, hx - q(18), hy - q(15) - hb, q(36), 1, "#6a5e4c"); RX(-6, hy - q(27) - hb, 8, 1, "#5a4e3e"); }
    if (hood > 0) { // hood front rim (peak over the forehead, edge down to the chin) + face shadow
      A(g, Math.min(1, hood * 1.5), () => {
        A(g, 0.85 * hood, () => RX(-1, hy - q(9), 15, 22, "#060508"));
        rr(g, hbx - q(14), hby - q(18), q(28), q(10), q(5), HO[1]); R(g, hbx - q(13), hby - q(18), q(18), 1, HO[0]);
        for (let k = 0; k < 24; k++) { const fx = hbx + dir * q(12 - Math.max(0, k - 14) * 0.5), fyy = hby - q(10) + q(k); R(g, dir > 0 ? fx - q(3) : fx, fyy, q(3), q(1) + 1, k < 2 ? HO[0] : HO[1]); R(g, dir > 0 ? fx : fx - 1, fyy, 1, q(1) + 1, HO[0]); }
      });
      if (hood > 0.6 && PX.blink(t, 2.6, 0.9)) RX(5, hy - q(3), 2, 1, "#5fe3e8");   // a glint in the dark
    }
    // arms
    const tableY = o.tableY || 244, sx = X(8), sy = top + q(4), aw = q(6), fw = q(5);
    if (o.arm === "lens") { LB().limb(g, sx, sy, X(22), tableY - q(4), aw, HO[1], HO[2]); const ld = Math.sin(t * 1.6) * 3; LB().limb(g, X(22), tableY - q(4), X(38 + ld), tableY - q(8), fw, HO[1], HO[2]); R(g, X(38 + ld) - q(3), tableY - q(11), q(6), q(6), SK[1]); }
    else if (o.arm === "drop") { LB().limb(g, sx, sy, X(14), sy + q(22), aw, HO[1], HO[2]); LB().limb(g, X(14), sy + q(22), X(26), sy + q(30), fw, HO[1], HO[2]); R(g, X(26) - q(3), sy + q(28), q(6), q(5), SK[1]); }
    else { LB().limb(g, sx, sy, X(18), tableY - q(2), aw, HO[1], HO[2]); LB().limb(g, X(18), tableY - q(2), X(36), tableY - q(3), fw, HO[1], HO[2]); R(g, X(36) - q(3), tableY - q(6), q(7), q(5), skin); }
    return { hx, hy };
  };

  // ======================= stranger =======================
  // noir interrogation room (one hanging lamp, venetian-blind shadows): the detective dev studies a code printout; across
  // the table a hooded stranger. At o.reveal (2.8) the hood drops: it's the dev himself; the detective's jaw drops.
  // Label "THE STRANGER IS YOU" (o.label false = no label).
  K.stranger = (o) => (g, t, d, c) => {
    const rv = T(o, "reveal", 2.8, d, 5.0), hk = PX.p(t, rv, 0.45, "back"), revealed = t >= rv;
    const flick = (t > rv - 0.1 && t < rv + 0.25 && Math.floor(t * 30) % 3 === 0) || Math.floor(t * 9) % 41 === 0;
    const lampA = flick ? 0.35 : 1;
    // ---- far: walls + blind shadows + one-way mirror + door
    PX.par(g, c, 0.5, () => {
      PX.vgrad(g, 0, 0, 640, 300, "1e2622", "0e1210", 8);
      for (let xx = 0; xx < 640; xx += 32) R(g, xx, 0, 1, 300, "#18201c");
      // one-way mirror
      R(g, 236, 60, 168, 92, "#2a302c"); R(g, 240, 64, 160, 84, "#0e1416"); A(g, 0.25, () => { thick(g, 250, 140, 300, 70, 6, "#3a4a50"); thick(g, 290, 144, 340, 74, 3, "#3a4a50"); });
      // door + wall clock
      R(g, 520, 100, 70, 200, "#2a2a26"); R(g, 524, 104, 62, 196, "#34342e"); R(g, 524, 104, 62, 1, "#4a4a42"); R(g, 576, 200, 6, 4, "#8a7a4a");
      LB().clock(g, 96, 64, t * 6 + 300, 12);
      // venetian blind light stripes (slanted, from an unseen window at left)
      const op = g.globalCompositeOperation; g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 9; i++) { const y0 = 40 + i * 22; g.globalAlpha = 0.09 * lampA + 0.04; for (let xx = 0; xx < 520; xx++) R(g, xx, y0 + Math.round(xx * 0.32), 1, 9, "#e8d8a8"); }
      g.globalAlpha = 1; g.globalCompositeOperation = op;
    });
    // floor
    PX.vgrad(g, 0, 306, 640, 54, "1a1c18", "0a0a08", 4); for (let i = 0; i < 7; i++) R(g, 0, 310 + i * 7, 640, 1, "#20221e");
    A(g, 0.5, () => LB().ell(g, 320, 340, 190, 10, "#000000"));
    // ---- lamp + cone
    const sw = Math.round(Math.sin(t * 0.8) * 2), lx = 320 + sw, ly = 86;
    PX.line(g, 320, 0, lx, ly, "#14140f");
    LB().cone(g, lx, ly + 12, 34, 280, 240, "#ffe2a0", 0.2 * lampA);
    G(g, lx, 236, 170, `rgba(255,214,150,${0.26 * lampA})`);
    for (let r = 0; r < 12; r++) { const w = 8 + r * 2.2; R(g, lx - w / 2, ly + r, w, 1, r < 2 ? "#4a4a40" : "#2a2c26"); R(g, lx - w / 2, ly + r, 1, 1, "#5a5a4e"); }
    R(g, lx - 18, ly + 12, 36, 2, "#3a3a32"); R(g, lx - 10, ly + 13, 20, 2, lampA > 0.5 ? "#fff0c0" : "#6a6050"); G(g, lx, ly + 14, 30, `rgba(255,236,190,${0.8 * lampA})`);
    // ---- the two figures (behind the table)
    const TY = 252, SC = 1.5;
    const det = sideSit(g, 146, 284, 1, t, { s: SC, floor: 338, tableY: TY, hat: true, face: revealed ? "jaw" : "squint", arm: revealed ? "drop" : "lens", hatPop: revealed && t - rv < 0.4 ? Math.round(8 * (1 - (t - rv) / 0.4)) : 0 });
    const str = sideSit(g, 494, 284, -1, t, { s: SC, floor: 338, tableY: TY, hood: revealed ? 1 - hk : 1, face: "calm" });
    // ---- table (slight top-down perspective)
    R(g, 196, TY, 248, 14, "#3a3a36"); R(g, 192, TY + 14, 256, 5, "#4a4a44"); R(g, 192, TY + 14, 256, 1, "#7a7a6e"); R(g, 198, TY, 244, 1, "#5a5a52");
    for (const lx2 of [200, 434]) { R(g, lx2, TY + 19, 6, 338 - TY - 19, "#2a2a26"); R(g, lx2, TY + 19, 1, 338 - TY - 19, "#4a4a42"); }
    G(g, 320, TY + 6, 120, `rgba(255,220,150,${0.3 * lampA})`);
    // coffee cup (stranger's side), case folder
    R(g, 392, TY + 2, 11, 10, "#8a8478"); R(g, 392, TY + 2, 11, 2, "#3a2418"); R(g, 403, TY + 4, 3, 5, "#8a8478");
    for (let i = 0; i < 2; i++) { const k = (t * 0.6 + i / 2) % 1; A(g, 0.4 * (1 - k), () => R(g, 395 + i * 3 + Math.round(Math.sin(k * 6) * 2), TY - 2 - k * 16, 2, 3, "#c8c4b8")); }
    R(g, 300, TY + 4, 44, 8, "#a8884a"); R(g, 300, TY + 4, 44, 1, "#c8a86a"); R(g, 304, TY + 6, 16, 2, "#e8e4d8");
    // code printout on the table, fanfold hanging over the front edge in a zigzag down to a pile
    const fall = revealed ? PX.clamp((t - rv) / 0.3, 0, 1) : 0;
    R(g, 214, TY + 3, 60, 10, "#a8a494"); R(g, 214, TY + 3, 60, 1, "#c4c0b0");
    for (let i = 0; i < 3; i++) { const py = TY + 19 + i * 20, px = 226 + (i % 2 ? 4 : 0) + Math.round(fall * (i + 1) * 2);
      R(g, px, py, 50, 20, i % 2 ? "#9a9686" : "#aaa696"); R(g, px, py + (i % 2 ? 19 : 0), 50, 1, "#9a9686"); R(g, px, py, 2, 20, "#a8a494"); R(g, px + 48, py, 2, 20, "#a8a494");
      for (let k = 0; k < 6; k++) R(g, px, py + 2 + k * 3, 1, 1, "#7a7666");
      for (let k = 0; k < 5; k++) { const r = hr(i * 9 + k); R(g, px + 5 + Math.floor(r() * 3) * 3, py + 3 + k * 3, 8 + Math.floor(r() * 26), 1, ["#3a5a8a", "#8a3a3a", "#3a6a3a"][k % 3]); } }
    for (let i = 0; i < 4; i++) { R(g, 222 + i, 336 - i * 3, 56, 3, i % 2 ? "#8a8676" : "#9a9686"); R(g, 222 + i, 336 - i * 3, 56, 1, "#b4b0a0"); }
    // magnifier in the detective's hand
    if (!revealed) { const mx = 146 + 66 + Math.round(Math.sin(t * 1.6) * 4.5), my = TY - 6; PX.circle(g, mx, my, 11, "#8a6a3a"); PX.circle(g, mx, my, 9, "#2a3a44"); A(g, 0.45, () => PX.circle(g, mx, my, 9, "#9fd8e8")); R(g, mx - 5, my - 5, 3, 2, "#e8fbfc"); thick(g, mx - 8, my + 8, mx - 4, my + 4, 3, "#5a3a1a"); }
    // ---- reveal: flash + label + shock lines
    if (revealed && t < rv + 0.25) A(g, 1 - (t - rv) / 0.25, () => R(g, 0, 0, 640, 360, "rgba(255,240,210,0.35)"));
    if (revealed) { for (let i = 0; i < 4; i++) { const a = -2.4 + i * 0.4; thick(g, det.hx + Math.cos(a) * 30, det.hy - 14 + Math.sin(a) * 26, det.hx + Math.cos(a) * 40, det.hy - 14 + Math.sin(a) * 34, 2, "#e6edf3"); }
      G(g, str.hx, str.hy, 40, "rgba(255,220,150,0.3)"); }
    if (o.label !== false) pop(g, t, rv + 0.35, "THE STRANGER IS YOU", 320, 30, { size: 16, col: "#ffcf8a", align: "center" });
    PX.particles(g, 3006791469, 34, t, [230, 110, 180, 140], { vy: -2, vx: 1, col: "#ffe8c0", a: 0.55 * lampA });
    PX.vignette(g, 0.62);
  };
  // ======================= iceberg =======================
  // calm night ocean, moon, iceberg tip "BUGS YOU CAN SEE"; at o.dive (1.8) the view pans down under water to the enormous
  // faintly glowing mass: "THE COST YOU CAN'T". Fish, bubbles, light rays. o.labels [top, bottom] to rename.
  K.iceberg = (o) => (g, t, d, c) => {
    const dv = T(o, "dive", 1.8, d, 4.5), labs = o.labels || ["BUGS YOU CAN SEE", "THE COST YOU CAN'T"];
    const WL = 196, PAN = 156, vy = Math.round(PAN * PX.ease((t - dv) / 1.3, "io"));
    const CX = 320;
    // iceberg half-widths per world row
    const ice = (y) => { // returns [left, right] or null
      if (y < 120 || y > 660) return null;
      const r = hr(Math.floor(y / 5) + 900), j = Math.floor(r() * 5) - 2, j2 = Math.floor(r() * 5) - 2;
      if (y < WL) { const k = (y - 120) / (WL - 120), hw = 10 + k * 64 + (y < 150 ? 0 : 0); const sk = Math.round(Math.sin(y * 0.15) * 3);
        return [CX - 6 - hw + j + sk, CX + hw * 0.9 + j2 + sk]; }
      const k = (y - WL) / 400, hw = 74 + 200 * Math.pow(Math.sin(Math.PI * Math.min(0.62, k * 0.8)), 0.6) + 12 * Math.sin(k * 9);
      return [CX - hw - 22 * Math.sin(k * 5) + j * 2, CX + hw * 0.92 + 16 * Math.sin(k * 4 + 1) + j2 * 2];
    };
    g.save(); g.translate(0, -vy);
    // ---- sky
    PX.vgrad(g, 0, -10, 640, WL + 10, "0a0f26", "1e2850", 9);
    for (let i = 0; i < 60; i++) { const r = hr(i + 600); A(g, 0.4 + 0.6 * Math.abs(Math.sin(t * 1.3 + i)), () => R(g, r() * 640, r() * 150, 1, 1, "#e8eefc")); }
    G(g, 470, 62, 90, "rgba(220,230,255,0.35)"); PX.circle(g, 470, 62, 14, "#e8ecd8"); PX.circle(g, 474, 59, 11, "#f4f6e6"); R(g, 465, 64, 3, 2, "#c8ccb8"); R(g, 472, 70, 2, 2, "#c8ccb8");
    PX.par(g, c, 0.3, () => { for (let i = 0; i < 4; i++) { const r = hr(i + 650), cx = ((r() * 760 + t * 6) % 760) - 60, cy = 40 + r() * 70; LB().ell(g, cx, cy, 30 + r() * 30, 3, "#2a3460"); LB().ell(g, cx + 6, cy - 2, 18 + r() * 10, 2, "#3a4678"); } });
    R(g, 0, WL - 3, 640, 3, "#3a4a7a");
    // ---- underwater body
    PX.vgrad(g, 0, WL, 640, 680 - WL, "0c2a46", "02060e", 10);
    // light rays (additive)
    { const op = g.globalCompositeOperation; g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 6; i++) { const x0 = 40 + i * 110 + Math.sin(t * 0.5 + i) * 14; for (let yy = WL; yy < WL + 260; yy += 2) { const k = (yy - WL) / 260; g.globalAlpha = 0.05 * (1 - k); R(g, x0 + (yy - WL) * 0.35, yy, 18 + k * 30, 2, "#9fe8f0"); } }
      g.globalAlpha = 1; g.globalCompositeOperation = op; }
    // deep particles (parallax)
    PX.par(g, c, 0.6, () => PX.particles(g, 3781345303, 50, t, [0, WL + 10, 640, 430], { vy: -3, vx: 2, col: "#7ac8e0", a: 0.4 }));
    // ---- iceberg mass (under water first)
    const glowA = 0.5 + 0.5 * PX.p(t, dv + 0.6, 1.0, "io");
    G(g, CX, 400, 280, `rgba(95,227,232,${0.12 * glowA})`);
    const lc = (a, b, k) => "#" + [0, 2, 4].map((i) => Math.round(PX.lerp(parseInt(a.substr(i, 2), 16), parseInt(b.substr(i, 2), 16), k)).toString(16).padStart(2, "0")).join("");
    for (let y = WL; y <= 660; y++) { const e = ice(y); if (!e) continue; const [l, r] = e.map(Math.round), k = PX.clamp((y - WL) / 420, 0, 1);
      // faceted columns: ridges drift with depth, segments alternate two tones; strata every ~13 rows
      let x0 = l;
      for (let i = 1; i <= 6; i++) { const x1 = i === 6 ? r : Math.round(l + (r - l) * (i / 6) + Math.sin(y * 0.025 + i * 2.1) * 16);
        const tone = (i % 2 ? lc("1d4e68", "081a26", k) : lc("235a76", "0b202e", k)); if (x1 > x0) R(g, x0, y, x1 - x0, 1, tone);
        if (i < 6 && x1 > l && x1 < r) R(g, x1, y, 1, 1, lc("3a7c9a", "123446", k)); x0 = x1; }
      if (y % 13 === 0) for (let xx = l + 6; xx < r - 6; xx += 9) if (hr(xx + y)() < 0.55) R(g, xx, y, 6, 1, lc("143e56", "061420", k));
      R(g, l, y, 2, 1, lc("5aa8c4", "1a3e50", k)); R(g, r - 2, y, 2, 1, lc("3a88a8", "143448", k)); }
    // inner glow + a few faint glowing cracks
    G(g, CX, 360, 170, `rgba(120,235,250,${0.12 * glowA})`);
    A(g, (0.18 + 0.08 * Math.sin(t * 2)) * glowA, () => { for (let i = 0; i < 3; i++) { const r = hr(i + 700); let x = CX - 120 + r() * 240, y = WL + 60 + r() * 160; for (let k = 0; k < 10; k++) { const nx = x + (r() - 0.5) * 20, ny = y + 6 + r() * 10; PX.line(g, x, y, nx, ny, "#5fe3e8"); x = nx; y = ny; } } });
    // fish (small, to show scale) + a distant big shadow cruising
    PX.par(g, c, 0.6, () => { const bx = 760 - ((t * 30) % 1000), byy = WL + 300; A(g, 0.35, () => { LB().ell(g, bx, byy, 34, 8, "#06121c"); R(g, bx + 32, byy - 7, 8, 14, "#06121c"); R(g, bx - 6, byy - 13, 8, 6, "#06121c"); }); });
    const FISH = [".oo..", "ooooo", ".oo.."];
    for (let s2 = 0; s2 < 3; s2++) { const dir = s2 % 2 ? -1 : 1, sy0 = WL + 60 + s2 * 110, sx0 = dir > 0 ? ((t * 24 + s2 * 230) % 840) - 100 : 740 - ((t * 20 + s2 * 170) % 840);
      for (let k = 0; k < 6; k++) { const r = hr(k + s2 * 20 + 800), fx = Math.round(sx0 + (r() - 0.5) * 70), fy = Math.round(sy0 + (r() - 0.5) * 34 + Math.sin(t * 3 + k) * 2), col = s2 === 1 ? "#e89a50" : "#8ab8d0";
        PX.sprite(g, FISH, fx, fy, { o: col }, 1, dir < 0); const tx = dir > 0 ? fx - 2 : fx + 5, wag = Math.sin(t * 14 + k) > 0 ? 0 : 1; R(g, tx, fy + wag, 2, 2, sh(col, -0.25)); R(g, dir > 0 ? fx + 3 : fx + 1, fy + 1, 1, 1, "#0a1420"); } }
    // bubbles from the mass
    for (let i = 0; i < 18; i++) { const r = hr(i + 850), bx = CX - 260 + r() * 520 + Math.sin(t * 2 + i) * 3, per = 3 + r() * 3, k = ((t + r() * per) % per) / per, by = 560 - k * 360;
      if (by > WL + 4) { PX.box(g, bx, by, 3, 3, "#9fe8f0"); R(g, bx + 1, by + 1, 1, 1, "#e8fbfc"); } }
    // ---- waterline seen from below (shimmer) + surface
    for (let xx = 0; xx < 640; xx += 4) R(g, xx, WL + 1 + Math.round(Math.sin(t * 3 + xx * 0.08) * 1), 3, 1, "#5fa8c8");
    // moon reflection on the surface
    for (let i = 0; i < 9; i++) { const w = 26 - i * 2 + Math.round(Math.sin(t * 4 + i) * 4); R(g, 470 - w / 2 + Math.round(Math.sin(t * 2 + i * 1.7) * 3), WL + 2 + i * 3, w, 1, "#c8d4e8"); }
    // ---- iceberg tip (above water), lit from the moon (right)
    for (let y = 120; y < WL; y++) { const e = ice(y); if (!e) continue; const [l, r] = e.map(Math.round), mid = Math.round((l + r) / 2 + 6);
      R(g, l, y, r - l, 1, "#7a9cb8"); R(g, mid, y, r - mid, 1, "#9ebcd2"); R(g, r - 2, y, 2, 1, "#c4d8e6"); R(g, l, y, 2, 1, "#6a8aa4"); }
    for (let i = 0; i < 5; i++) { const y = 136 + i * 11; PX.line(g, CX - 10 + i * 4, y, CX + 2 + i * 6, y + 7, "#7a9cb4"); }
    R(g, CX - 80, WL - 1, 160, 2, "#a8c4d8");
    G(g, CX + 20, 160, 60, "rgba(200,230,255,0.25)");
    // small waves lapping at the tip
    for (let i = 0; i < 6; i++) { const wx = CX - 100 + i * 40 + Math.sin(t * 2 + i) * 4; R(g, wx, WL - 1, 10, 1, "#7a9ad0"); }
    g.restore();
    // ---- labels (screen space)
    if (vy < 120) A(g, PX.clamp(1 - vy / 80, 0, 1), () => pop(g, t, 0.3, labs[0], CX, 92 - vy, { size: 16, col: "#e8f1f2", align: "center" }));
    if (vy < 120) A(g, PX.clamp(1 - vy / 80, 0, 1), () => { const k = PX.clamp((t - 0.5) / 0.3, 0, 1); A(g, k, () => { PX.line(g, CX, 112 - vy, CX, 124 - vy, "#e8f1f2"); R(g, CX - 1, 122 - vy, 3, 2, "#e8f1f2"); }); });
    A(g, PX.clamp(vy / PAN, 0, 1), () => { for (let i = 0; i < 8; i++) A(g, 0.08 * (i + 1), () => R(g, 0, 296 + i * 8, 640, 8, "#02060c")); });
    pop(g, t, dv + 1.25, labs[1], CX, 186, { size: 16, col: "#5fe3e8", align: "center" });
    PX.vignette(g, 0.55);
  };
  // ======================= assembly =======================
  // museum hall at night: a glass case under a spotlight with an old hand-written assembly printout (MOV/ADD/JMP),
  // cobwebs, plaque "HAND-WRITTEN ASSEMBLY"; a guard yawns. The dev walks in with coffee and at o.fine (3.0) gives a
  // thumbs up: "AND WE'RE FINE". o.walk (fine - 1.4) = when he enters.
  K.assembly = (o) => (g, t, d, c) => {
    const tf = T(o, "fine", 3.0, d, 5.0), tw0 = o.walk !== undefined ? o.walk : tf - 1.4;
    // ---- far: hall wall, pilasters, arches, paintings, exit sign, security camera
    PX.par(g, c, 0.4, () => {
      PX.vgrad(g, 0, 0, 640, 280, "1e1c34", "0e0d1c", 9);
      for (let i = 0; i < 6; i++) { const px = -20 + i * 130; R(g, px, 20, 22, 260, "#262440"); R(g, px, 20, 2, 260, "#3a3858"); R(g, px + 19, 20, 3, 260, "#181628"); R(g, px - 4, 16, 30, 6, "#2e2c4a"); R(g, px - 4, 270, 30, 8, "#2e2c4a"); }
      for (let i = 0; i < 5; i++) { const ax = 2 + i * 130 + 65; for (let k = 0; k < 40; k++) { const yy = 40 - Math.round(Math.sqrt(Math.max(0, 1600 - (k - 20) * (k - 20) * 4)) * 0.45); R(g, ax - 20 + k, yy, 1, 2, "#2e2c4a"); } }
      for (const [fx, fy, fw, fh, seed] of [[60, 80, 70, 52, 1], [500, 74, 60, 70, 2]]) {
        R(g, fx - 4, fy - 4, fw + 8, fh + 8, "#5a4a2a"); R(g, fx - 4, fy - 4, fw + 8, 1, "#8a7440");
        PX.vgrad(g, fx, fy, fw, fh, seed === 1 ? "2a3a5a" : "3a2a3a", seed === 1 ? "4a3a2a" : "1a2a3a", 4);
        if (seed === 1) { PX.circle(g, fx + 50, fy + 14, 6, "#8a8060"); for (let k = 0; k < 7; k++) R(g, fx + k * 10, fy + fh - 12 - (k % 3) * 4, 10, 12 + (k % 3) * 4, "#1a2018"); }
        else { LB().ell(g, fx + 30, fy + 30, 12, 15, "#6a5048"); R(g, fx + 16, fy + 44, 28, 26, "#2a2030"); R(g, fx + 25, fy + 26, 3, 2, "#1a1010"); R(g, fx + 33, fy + 26, 3, 2, "#1a1010"); }
        G(g, fx + fw / 2, fy - 6, 40, "rgba(255,210,150,0.25)"); R(g, fx + fw / 2 - 8, fy - 8, 16, 3, "#3a3428");
      }
      R(g, 196, 40, 22, 10, "#0a2a14"); R(g, 198, 42, 18, 6, "#3df56b"); R(g, 203, 43, 3, 4, "#0a2a14"); R(g, 207, 44, 4, 1, "#0a2a14"); G(g, 207, 45, 20, "rgba(61,245,107,0.4)");
      const ca = Math.sin(t * 0.7) * 0.4; R(g, 452, 30, 4, 10, "#3a3a44"); thick(g, 454, 40, 454 + Math.cos(2.4 + ca) * 14, 44 + Math.sin(2.4 + ca) * 4, 6, "#4a4a56"); R(g, 448 + Math.round(Math.cos(2.4 + ca) * 14), 43, 2, 2, PX.blink(t, 1) ? "#ff5c5c" : "#5a1a1a");
    });
    // skylight moon beams (additive diagonal)
    { const op = g.globalCompositeOperation; g.globalCompositeOperation = "lighter";
      for (let i = 0; i < 3; i++) { const x0 = 90 + i * 34; for (let yy = 0; yy < 300; yy += 2) { g.globalAlpha = 0.05 * (1 - yy / 300); R(g, x0 + yy * 0.5, yy, 22, 2, "#a8b8ff"); } }
      g.globalAlpha = 1; g.globalCompositeOperation = op; }
    // ---- floor: polished tiles with reflections
    PX.vgrad(g, 0, 278, 640, 82, "2a2640", "121020", 5);
    for (let k = 0; k < 6; k++) R(g, 0, 282 + k * k * 2.4, 640, 1, "#1a1830");
    for (let xx = -200; xx < 840; xx += 60) PX.line(g, 320 + (xx - 320) * 0.45, 278, xx, 360, "#1a1830");
    for (let i = 0; i < 12; i++) A(g, 0.12 * (1 - i / 12), () => R(g, 236 + i * 2, 290 + i * 5, 168 - i * 4, 5, "#ffd89a"));
    // ---- spotlight onto the case
    LB().cone(g, 320, 0, 20, 220, 250, "#ffe2a8", 0.2);
    G(g, 320, 170, 130, "rgba(255,214,150,0.3)");
    // ---- pedestal + plaque
    mat(g, 236, 214, 168, 72, "#3a3048", -1); R(g, 232, 210, 176, 6, "#4a3e5a"); R(g, 232, 210, 176, 1, "#7a6a90"); R(g, 230, 284, 180, 4, "#2a2236");
    for (let i = 0; i < 4; i++) R(g, 250 + i * 40, 258, 2, 24, "#2e263c");
    R(g, 236, 232, 168, 22, "#6a5420"); R(g, 238, 234, 164, 18, "#a8863a"); R(g, 238, 234, 164, 1, "#d8b860"); R(g, 238, 251, 164, 1, "#6a4e18");
    PX.text(g, "HAND-WRITTEN ASSEMBLY", 320, 235, { font: "v", size: 15, col: "#24180a", align: "center" });
    // case contents: yellowed printout with tractor holes, slightly tilted
    R(g, 246, 118, 148, 92, "#16141e");
    { const px = 270, py = 126, pw = 100, ph = 78;
      for (let r = 0; r < ph; r++) { const off = Math.round(r * 0.06); R(g, px + off, py + r, pw, 1, r % 26 === 0 ? "#7a6c48" : "#958660"); R(g, px + off, py + r, 6, 1, "#837452"); R(g, px + off + pw - 6, py + r, 6, 1, "#837452");
        if (r % 5 === 2) { R(g, px + off + 2, py + r, 2, 2, "#4a4232"); R(g, px + off + pw - 4, py + r, 2, 2, "#4a4232"); } }
      ["MOV AX, 1", "MOV BX, 5", "ADD AX, BX", "CMP AX, 9", "JMP LOOP"].forEach((ln, i) => PX.text(g, ln, px + 12 + Math.round((14 + i * 13) * 0.06), py + 6 + i * 13, { font: "v", size: 13, col: i === 2 ? "#8a1a10" : "#1a1a30" }));
    }
    // glass: tint, edges, reflections
    A(g, 0.1, () => R(g, 242, 112, 156, 98, "#9ac8e8"));
    R(g, 242, 112, 156, 1, "#c8e8f8"); R(g, 242, 112, 1, 98, "#a8d0f0"); R(g, 397, 112, 1, 98, "#5a7a98"); R(g, 238, 108, 164, 4, "#4a4258"); R(g, 238, 108, 164, 1, "#8a7aa0");
    A(g, 0.25, () => { thick(g, 256, 204, 300, 118, 3, "#e8f6ff"); thick(g, 272, 204, 312, 126, 1, "#e8f6ff"); thick(g, 360, 206, 392, 140, 2, "#e8f6ff"); });
    // cobwebs on the top corners + a dangling spider
    const web = (cx, cy, sx, sy) => { for (let k = 0; k < 5; k++) { const a = (k / 4) * 1.57; PX.line(g, cx, cy, cx + sx * Math.cos(a) * 22, cy + sy * Math.sin(a) * 22, "#9a98a8"); }
      for (let r2 = 6; r2 <= 18; r2 += 6) for (let k = 0; k < 4; k++) { const a1 = (k / 4) * 1.57, a2 = ((k + 1) / 4) * 1.57; PX.line(g, cx + sx * Math.cos(a1) * r2, cy + sy * Math.sin(a1) * r2, cx + sx * Math.cos(a2) * (r2 - 1), cy + sy * Math.sin(a2) * (r2 - 1), "#7a7888"); } };
    A(g, 0.8, () => { web(243, 113, 1, 1); web(396, 113, -1, 1); });
    { const sy2 = 138 + Math.round(Math.sin(t * 1.3) * 8); PX.line(g, 380, 113, 380, sy2, "#9a98a8"); R(g, 378, sy2, 5, 4, "#1a1820"); for (let k = 0; k < 3; k++) { R(g, 376, sy2 + k, 2, 1, "#1a1820"); R(g, 383, sy2 + k, 2, 1, "#1a1820"); } }
    G(g, 320, 160, 70, "rgba(255,230,180,0.16)");
    // ---- the guard (right, by the wall), dozing and yawning
    const yp = ((t + 0.8) % 2.8) / 2.8, yawning = yp > 0.15 && yp < 0.55;
    LB().outlined(g, (b) => { const p = LB().person(b, 528, 300, { h: 80, outline: false, skin: "#d8a880", hair: "#8a8a90", shirt: "#2a3a6a", pants: "#1e2840", top: "shirt", face: yawning ? "yawn" : "closed", lit: -1,
        bob: Math.sin(t * 1.6) > 0.5 ? 1 : 0, hands: yawning ? { l: [522, 240], r: [546, 290] } : { l: [514, 288], r: [544, 290] } });
      rr(b, p.hx - p.hw / 2 - 2, p.hy - 4, p.hw + 4, 8, 3, "#1e2a50"); R(b, p.hx - p.hw / 2 - 2, p.hy + 3, p.hw + 7, 2, "#141c38"); R(b, p.hx - 2, p.hy - 2, 4, 3, "#c8a040");
      R(b, p.hx + 6, p.ty + 6, 4, 4, "#c8a040"); R(b, p.hx - 12, p.hip - 2, 4, 10, "#2a2a30"); R(b, p.hx - 12, p.hip + 7, 4, 2, "#ffe8a0"); });
    if (!yawning) { const k = (t * 0.5) % 1; A(g, Math.sin(k * 3.14), () => PX.otext(g, "z", 546 + k * 6, 214 - k * 14, { font: "v", size: 14, col: "#c8d0e8" })); }
    G(g, 520, 230, 60, "rgba(255,214,150,0.12)");
    // ---- velvet ropes + brass posts (foreground)
    PX.par(g, c, 1.1, () => {
      for (const px of [176, 464]) { R(g, px - 2, 262, 5, 50, "#b8963a"); R(g, px - 2, 262, 1, 50, "#e8c870"); R(g, px + 2, 262, 1, 50, "#7a5e20"); PX.circle(g, px, 260, 4, "#d8b04a"); R(g, px - 1, 258, 2, 1, "#fff0b0"); LB().ell(g, px, 312, 10, 3, "#7a5e20"); }
      for (let xx = 178; xx < 462; xx++) { const u = (xx - 178) / 284, yy = 266 + Math.round(Math.sin(u * Math.PI) * 18); R(g, xx, yy, 1, 4, "#8a1a2a"); R(g, xx, yy, 1, 1, "#c03048"); }
    });
    // ---- the dev walks in with coffee, thumbs up at o.fine
    if (t >= tw0) {
      const k = PX.clamp((t - tw0) / (tf - tw0), 0, 1), dx = Math.round(PX.lerp(-40, 116, PX.ease(k, "out"))), walking = k < 1;
      const ph = (t - tw0) * 9, legs = walking ? [Math.round(Math.sin(ph) * 5), Math.round(-Math.sin(ph) * 5)] : [0, 0];
      const thumb = t >= tf, tk = PX.p(t, tf, 0.3, "back");
      const p = dev(g, dx, 346, { h: 92, face: thumb ? "happy" : "smug", lit: 1, legs, bob: walking ? -Math.round(Math.abs(Math.sin(ph)) * 2) : 0,
        hands: { l: [dx - 14, 300], r: thumb ? [dx + 26, Math.round(PX.lerp(300, 272, tk))] : [dx + 16, 318] },
        extra: (b, q) => { const cx = q.hl[0] - 5, cy = q.hl[1] - 12; R(b, cx, cy, 10, 12, "#b8bec8"); R(b, cx, cy, 2, 12, "#d8dde4"); R(b, cx - 1, cy - 1, 12, 2, "#d8dde4"); R(b, cx, cy + 4, 10, 3, "#6a4a2c");
          if (thumb) { const hx = q.hr[0], hy = q.hr[1]; R(b, hx - 1, hy - 8, 3, 6, "#b07a4e"); R(b, hx - 1, hy - 8, 3, 1, "#d29a6c"); } } });
      for (let i = 0; i < 3; i++) { const sk = (t * 0.8 + i / 3) % 1; A(g, 0.5 * (1 - sk), () => R(g, p.hl[0] - 3 + i * 3 + Math.round(Math.sin(sk * 6 + i) * 2), p.hl[1] - 18 - sk * 14, 2, 3, "#d8dee9")); }
      if (thumb && t < tf + 0.5) for (let i = 0; i < 4; i++) { const a = -1.4 + i * 0.6, rk = (t - tf) / 0.5; star4(g, p.hr[0] + Math.cos(a) * (10 + rk * 10), p.hr[1] - 8 + Math.sin(a) * (10 + rk * 10), 2, "#f7c948"); }
    }
    pop(g, t, tf, "AND WE'RE", 142, 196, { size: 16, col: "#3df56b", align: "center" }); pop(g, t, tf + 0.12, "FINE", 142, 216, { size: 16, col: "#3df56b", align: "center" });
    PX.particles(g, 3456789, 30, t, [230, 20, 180, 240], { vy: -2, vx: 1, col: "#ffe8c0", a: 0.55 });
    PX.vignette(g, 0.58);
  };
})();
