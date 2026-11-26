/* EP2 Builder E: shipping / users / growth scenes.
   recruiter, tuition, bill, jenga, users_break, level_up, taste_gap, doubt, books_24h, long_road */
(function () {
  const { K, C } = PX;
  const R = PX.rect, G = PX.glow;

  // ---------------- helpers ----------------
  // shade a #rrggbb colour: k<0 darker, k>0 lighter
  const sh = (hex, k) => {
    const n = parseInt(hex.slice(1), 16), f = (v) => Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k);
    return "#" + ((1 << 24) | (f(n >> 16) << 16) | (f((n >> 8) & 255) << 8) | f(n & 255)).toString(16).slice(1);
  };
  // well-mixed per-item random stream (PX.rnd with nearby seeds gives near-identical first values)
  const hr = (i) => PX.rnd(((i + 1) * 2654435761) >>> 0);
  // rounded rect, radius r (pixel stepped)
  const rr = (g, x, y, w, h, r, col) => {
    x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
    for (let i = 0; i < h; i++) {
      const k = i < r ? r - i - 0.5 : i >= h - r ? i - (h - r) + 0.5 : 0;
      const ins = k ? Math.round(r - Math.sqrt(Math.max(0, r * r - k * k))) : 0;
      R(g, x + ins, y + i, w - 2 * ins, 1, col);
    }
  };
  // block with 3 shades: lit side highlight (L=-1 light from left), far side shadow, bottom shadow
  const mat = (g, x, y, w, h, base, L) => {
    R(g, x, y, w, h, base);
    const hi = sh(base, 0.22), lo = sh(base, -0.32);
    if ((L || -1) < 0) { R(g, x, y, 1, h, hi); R(g, x + w - 2, y, 2, h, lo); } else { R(g, x + w - 1, y, 1, h, hi); R(g, x, y, 2, h, lo); }
    R(g, x, y, w, 1, hi); R(g, x, y + h - 1, w, 1, lo);
  };
  const shake = (t, t0, dur, amp) => (t >= t0 && t < t0 + dur ? Math.round(Math.sin(t * 90) * amp * (1 - (t - t0) / dur)) : 0);
  // draw any picture into a small offscreen canvas and paste it rotated with nearest-neighbour (crisp pixels)
  const OFF = document.createElement("canvas"), OG = OFF.getContext("2d");
  const rot = (g, w, h, cx, cy, ang, fn) => {
    OFF.width = w; OFF.height = h; OG.clearRect(0, 0, w, h); fn(OG);
    const img = OG.getImageData(0, 0, w, h).data, ca = Math.cos(ang), sa = Math.sin(ang);
    const ext = Math.ceil(Math.sqrt(w * w + h * h) / 2) + 1;
    for (let yy = -ext; yy <= ext; yy++) for (let xx = -ext; xx <= ext; xx++) {
      const u = Math.floor(ca * xx + sa * yy + w / 2), v = Math.floor(-sa * xx + ca * yy + h / 2);
      if (u < 0 || v < 0 || u >= w || v >= h) continue;
      const i = (v * w + u) * 4; if (img[i + 3] < 128) continue;
      g.fillStyle = `rgb(${img[i]},${img[i + 1]},${img[i + 2]})`; g.fillRect(Math.round(cx) + xx, Math.round(cy) + yy, 1, 1);
    }
  };
  // big rubber stamp (rotated text in a double frame), scale-in slam at t0
  const stamp = (g, t, t0, txt, cx, cy, o) => {
    if (t < t0) return;
    o = o || {}; const col = o.col || "#e8453c", sz = o.size || 32, k = PX.p(t, t0, 0.18, "in");
    PX.text(g, "", 0, 0, {});
    const tw = Math.ceil(PX.tw(g, txt, { size: sz })) + 20, th = sz + 18;
    const over = 1 + (1 - k) * 1.4;
    if (k < 1) { PX.alpha(g, k, () => R(g, cx - tw * over / 2, cy - th * over / 2, tw * over, th * over, "rgba(232,69,60,.25)")); return; }
    rot(g, tw, th, cx, cy, o.ang === undefined ? -0.12 : o.ang, (q) => {
      q.fillStyle = col; q.fillRect(0, 0, tw, 3); q.fillRect(0, th - 3, tw, 3); q.fillRect(0, 0, 3, th); q.fillRect(tw - 3, 0, 3, th);
      q.fillRect(5, 5, tw - 10, 1); q.fillRect(5, th - 6, tw - 10, 1); q.fillRect(5, 5, 1, th - 10); q.fillRect(tw - 6, 5, 1, th - 10);
      q.font = `${sz}px "Press Start 2P"`; q.textBaseline = "top"; q.textAlign = "center"; q.fillText(txt, tw / 2, 10);
      // worn ink: knock out a few pixels
      const r = PX.rnd(5); q.clearRect(0, 0, 0, 0); for (let i = 0; i < tw * th / 30; i++) q.clearRect(Math.floor(r() * tw), Math.floor(r() * th), 1 + Math.floor(r() * 2), 1);
    });
    // ink splats
    const r = PX.rnd(17); for (let i = 0; i < 10; i++) R(g, cx + (r() - 0.5) * tw * 1.3, cy + (r() - 0.5) * th * 1.6, 1 + r() * 2, 1 + r() * 2, col);
  };

  // front-facing person, native resolution. anchor (x, y) = centre of the waist. o.h = head size (px).
  // o.face: calm happy smug bored shock sad strain yawn grin  o.arms: down up desk hold raise lift
  const fig = (g, x, y, o) => {
    o = o || {}; const hs = o.h || 20, t = o.t || 0, L = o.lit || -1, ph = o.ph || 0;
    const skin = o.skin || "#e0a878", s1 = sh(skin, 0.22), s3 = sh(skin, -0.3);
    const shirt = o.shirt || "#3f6fb0", hair = o.hair || "#2a1a12", pants = o.pants || "#2b3550";
    const tw = Math.round(hs * 1.4), th = Math.round(hs * 1.2), legH = Math.round(hs * 1.3), legW = Math.round(hs * 0.34);
    const aw = Math.max(3, Math.round(hs * 0.28)), al = Math.round(hs * 1.15), hw = hs, hh = Math.round(hs * 1.05), nh = Math.max(2, Math.round(hs * 0.12));
    const by = o.still ? 0 : Math.sin(t * 2.6 + ph) > 0.4 ? 1 : 0;   // breathing
    x = Math.round(x); y = Math.round(y);
    // legs
    if (!o.seated) {
      const wk = o.walk ? Math.round(Math.sin(o.walk) * 2) : 0;
      for (const [lx, lift] of [[x - legW - 1, wk], [x + 1, -wk]]) {
        const ly = y, lh = legH - Math.max(0, lift);
        R(g, lx, ly, legW, lh, pants); R(g, lx + (L < 0 ? 0 : legW - 1), ly, 1, lh, sh(pants, 0.2)); R(g, lx + (L < 0 ? legW - 1 : 0), ly, 1, lh, sh(pants, -0.3));
        R(g, lx - 1, ly + lh - 3, legW + 2, 3, o.shoe || "#1c1c24"); R(g, lx - 1, ly + lh - 3, legW + 2, 1, "#3a3a48");
      }
    }
    const ty = y - th + by;
    // arms behind/beside torso
    const armC = o.sleeve || shirt, aHi = sh(armC, 0.2), aLo = sh(armC, -0.3);
    const arm = (ax, ay, w, h, hand) => { R(g, ax, ay, w, h, armC); R(g, ax, ay, 1, h, L < 0 ? aHi : aLo); R(g, ax + w - 1, ay, 1, h, L < 0 ? aLo : aHi); if (hand) R(g, hand[0], hand[1], aw, 3, skin); };
    const lx0 = x - (tw >> 1) - aw + 1, rx0 = x + (tw >> 1) - 1, sy = ty + 1;
    const pose = o.arms || "down";
    const side = (left) => { const ax = left ? lx0 : rx0; arm(ax, sy, aw, al, [ax, sy + al]); };
    const up = (left, bend) => { const ax = (left ? lx0 - 2 : rx0 + 2); arm(ax, sy - al + 2, aw, al, [ax, sy - al - 1]); };
    if (pose === "down") { side(true); side(false); }
    else if (pose === "up") { up(true); up(false); }
    else if (pose === "raise") { side(true); up(false); }
    else if (pose === "desk") { arm(lx0, sy, aw, al - 4, null); arm(rx0, sy, aw, al - 4, null); R(g, lx0, sy + al - 4, aw + 6, aw, armC); R(g, rx0 - 6, sy + al - 4, aw + 6, aw, armC); R(g, lx0 + aw + 4, sy + al - 4, 3, aw, skin); R(g, rx0 - 7, sy + al - 4, 3, aw, skin); }
    else if (pose === "lift") { const ex = (tw >> 1) + aw + 3; R(g, x - ex, sy + 1, ex - (tw >> 1) + 2, aw, armC); R(g, x + (tw >> 1) - 2, sy + 1, ex - (tw >> 1) + 2, aw, armC);
      arm(x - ex, sy - al + aw + 2, aw, al - aw, [x - ex, sy - al + aw - 1]); arm(x + ex - aw, sy - al + aw + 2, aw, al - aw, [x + ex - aw, sy - al + aw - 1]); }
    // torso
    for (let r = 0; r < th; r++) { const w = tw - Math.round((r / th) * 2), xx = x - (w >> 1); R(g, xx, ty + r, w, 1, shirt);
      R(g, L < 0 ? xx : xx + w - 1, ty + r, 1, 1, sh(shirt, 0.22)); R(g, L < 0 ? xx + w - 2 : xx, ty + r, 2, 1, sh(shirt, -0.3)); }
    R(g, x - (tw >> 1) + 1, ty, tw - 2, 1, sh(shirt, 0.25));
    if (o.jacket) { R(g, x - 3, ty, 6, Math.round(th * 0.55), o.inner || "#d8dce6"); for (let r = 0; r < th * 0.55; r++) { R(g, x - 3 - (r >> 2), ty + r, 1, 1, sh(shirt, -0.45)); R(g, x + 2 + (r >> 2), ty + r, 1, 1, sh(shirt, -0.45)); } }
    if (o.tie) { R(g, x - 1, ty + 1, 3, Math.round(th * 0.6), o.tie); R(g, x - 2, ty + 1, 5, 2, sh(o.tie, -0.2)); }
    if (!o.jacket && !o.tie) { R(g, x - 3, ty, 7, 2, s3); R(g, x - 2, ty, 5, 1, skin); }
    if (o.logo) R(g, x + 3, ty + 5, 3, 3, o.logo);
    if (pose === "hold") { const hy = ty + Math.round(th * 0.45); arm(lx0, sy, aw, hy - sy, null); arm(rx0, sy, aw, hy - sy, null);
      R(g, lx0, hy, (tw >> 1) + aw - 3, aw, armC); R(g, x + 2, hy, (tw >> 1) + aw - 3, aw, armC); R(g, x - 4, hy, 3, aw, skin); R(g, x + 1, hy, 3, aw, skin); }
    // neck + head
    const hy = ty - nh - hh, hx = x - (hw >> 1);
    R(g, x - Math.round(hs * 0.18), ty - nh - 1, Math.round(hs * 0.36), nh + 1, s3);
    if (o.hairStyle === "long") { R(g, hx - 2, hy + 3, hw + 4, hh + 3, sh(hair, -0.15)); }
    const hr = Math.max(3, Math.round(hs * 0.26)); rr(g, hx, hy, hw, hh, hr, skin);
    R(g, L < 0 ? hx + hw - 2 : hx, hy + 3, 2, hh - 6, s3); R(g, L < 0 ? hx : hx + hw - 1, hy + 4, 1, hh - 8, s1);
    R(g, hx + 3, hy + hh - 1, hw - 6, 1, s3);
    R(g, hx - 1, hy + Math.round(hh * 0.45), 2, Math.round(hh * 0.25), L < 0 ? skin : s3); R(g, hx + hw - 1, hy + Math.round(hh * 0.45), 2, Math.round(hh * 0.25), L < 0 ? s3 : skin);
    // hair
    const hs2 = o.hairStyle || "short", hHi = sh(hair, 0.25), fr = Math.round(hh * 0.3);
    if (hs2 !== "bald") {
      rr(g, hx - 1, hy - 2, hw + 2, fr + 3 + hr, hr + 1, hair); R(g, hx + 1, hy + fr, hw - 2, hr, skin);
      if (hs >= 22) for (let i = 0; i < hw; i += 2) R(g, hx + i, hy + fr + 1, 1 + (i % 4 === 0 ? 1 : 0), (i * 7) % 3 === 0 ? 2 : 1, hair);
      else for (let i = 1; i < hw - 1; i += 3) R(g, hx + i, hy + fr, 2, 1, hair);
      R(g, hx - 1, hy + 1, 2, Math.round(hh * 0.45), hair); R(g, hx + hw - 1, hy + 1, 2, Math.round(hh * 0.45), hair);
      R(g, L < 0 ? hx + 2 : hx + hw - 8, hy - 1, 6, 1, hHi);
      if (hs2 === "bun") { PX.circle(g, x + 1, hy - 4, 4, hair); R(g, x - 1, hy - 7, 3, 1, hHi); }
      if (hs2 === "spiky") for (let i = 0; i < 5; i++) { const sx = hx + 1 + i * Math.round(hw / 5); R(g, sx, hy - 4, 2, 3, hair); R(g, sx, hy - 5, 1, 1, hair); }
      if (hs2 === "long") { R(g, hx - 2, hy + 1, 3, hh + 4, hair); R(g, hx + hw - 1, hy + 1, 3, hh + 4, hair); }
      if (hs2 === "cap") { rr(g, hx - 2, hy - 3, hw + 4, fr + 3, 3, o.capCol || "#c0392b"); R(g, hx - 2, hy + fr - 1, hw + 7, 2, sh(o.capCol || "#c0392b", -0.3)); }
    } else { R(g, hx - 1, hy + 4, 2, 5, hair); R(g, hx + hw - 1, hy + 4, 2, 5, hair); R(g, hx + 4, hy + 1, 4, 1, s1); }
    // face
    const face = o.face || "calm", ex = Math.round(hw * 0.22), ey = hy + Math.round(hh * 0.5), my = hy + Math.round(hh * 0.78);
    const big = hs >= 28, EW = big ? 3 : 2, eh = big ? 4 : hs >= 18 ? 3 : 2, ink = "#1a1016", MW = big ? 2 : 0;
    const blink = !o.noBlink && PX.blink(t + ph * 1.3, 3.3, 0.05);
    const eyes = (kind) => {
      for (const s of [-1, 1]) { const exx = x + s * ex - (s < 0 ? EW - 1 : 0);
        if (kind === "closed" || blink) R(g, exx - 1, ey + eh - 2, EW + 2, 1, ink);
        else if (kind === "half") { R(g, exx - 1, ey, EW + 2, 1, s3); R(g, exx, ey + 1, EW, eh - 1, ink); if (big) R(g, exx - 1, ey + 1, EW + 2, 1, ink); }
        else if (kind === "wide") { R(g, exx - 1, ey - 1, EW + 2, eh + 2, "#f2f2f2"); R(g, exx, ey, EW - 1 || 1, 2, ink); }
        else if (kind === "squeeze") { const d0 = s < 0 ? 0 : EW; R(g, exx + (s < 0 ? -1 : EW), ey, 1, 1, ink); R(g, exx, ey + 1, EW, 1, ink); R(g, exx + (s < 0 ? -1 : EW), ey + 2, 1, 1, ink); }
        else { R(g, exx, ey, EW, eh, ink); R(g, exx, ey, 1, 1, "#ffffff"); }
      }
    };
    const brow = (tilt) => { for (const s of [-1, 1]) { const bx = x + s * ex - (s < 0 ? EW : 0) - 1; for (let i = 0; i < EW + 2; i++) { const inner = s < 0 ? i : EW + 1 - i; R(g, bx + i, ey - 3 - (big ? 1 : 0) + Math.round(tilt * (inner - (EW + 1) / 2) * 0.5), 1, big ? 2 : 1, sh(hair, 0.1)); } } };
    const m = (w, h, col, dy) => R(g, x - (w >> 1), my + (dy || 0), w, h, col);
    if (face === "calm") { eyes(); m(4 + MW, 1, s3); }
    else if (face === "happy") { eyes(); m(6 + MW, 1, ink); R(g, x - 4 - MW / 2, my - 1, 1, 1, ink); R(g, x + 3 + MW / 2, my - 1, 1, 1, ink); }
    else if (face === "grin") { eyes("closed"); R(g, x - 4 - MW / 2, my - 1, 8 + MW, 3 + MW / 2, ink); R(g, x - 3 - MW / 2, my - 1, 6 + MW, 1, "#f2f2f2"); }
    else if (face === "smug") { eyes("half"); R(g, x - 2 - MW / 2, my, 4 + MW, 1, ink); R(g, x + 2 + MW / 2, my - 1, 2, 1, ink); }
    else if (face === "bored") { eyes("half"); m(4 + MW, 1, ink); }
    else if (face === "shock") { eyes("wide"); brow(-1); R(g, x - 2 - MW / 2, my - 1, 4 + MW, 4 + MW, ink); R(g, x - 1 - MW / 2, my, 2 + MW, 2 + MW, "#7a2a2a"); }
    else if (face === "sad") { eyes(); brow(1); m(4 + MW, 1, ink, 1); R(g, x - 3 - MW / 2, my + 2, 1, 1, ink); R(g, x + 2 + MW / 2, my + 2, 1, 1, ink); }
    else if (face === "strain") { eyes("squeeze"); brow(-1); R(g, x - 4 - MW / 2, my - 1, 8 + MW, 3, "#f2f2f2"); R(g, x - 4 - MW / 2, my, 8 + MW, 1, ink); }
    else if (face === "yawn") { eyes("closed"); R(g, x - 2 - MW / 2, my - 2, 4 + MW, 5 + MW, ink); R(g, x - 1 - MW / 2, my + 1, 2 + MW, 2 + MW / 2, "#b04a4a"); }
    if (o.blush) { R(g, x - ex - 3 - MW, my - 2, 2 + MW / 2, 1, "#f08080"); R(g, x + ex + 1 + MW, my - 2, 2 + MW / 2, 1, "#f08080"); }
    if (o.glasses) { for (const s of [-1, 1]) { const gx = x + s * ex - (s < 0 ? EW + 1 : 1) - 0; PX.box(g, gx - (big ? 1 : 0), ey - 1 - (big ? 1 : 0), EW + 3 + (big ? 2 : 0), eh + 2 + (big ? 2 : 0), o.glasses); } R(g, x - ex + 2, ey, ex * 2 - 4, 1, o.glasses); if (o.glint) R(g, x + ex + EW - 1, ey - 1, 1, 1, "#ffffff"); }
    if (o.sweat) { const k = ((t * 0.9 + ph) % 1); const sx = hx + hw + 1, syy = hy + 4 + Math.round(k * 8); PX.alpha(g, 1 - k * 0.6, () => { R(g, sx, syy, 2, 3, "#8fd3ff"); R(g, sx, syy - 1, 1, 1, "#8fd3ff"); R(g, sx, syy, 1, 1, "#e8f7ff"); }); }
    return { headTop: hy, headX: hx, hw, hh, ty, tw, sy, aw, al, lx0, rx0 };
  };

  // generic interior wall + floor (cool night base)
  const wallFloor = (g, floorY, o) => {
    o = o || {};
    PX.vgrad(g, 0, 0, 640, floorY, o.w0 || "1c2246", o.w1 || "10142c", 10);
    R(g, 0, floorY - 6, 640, 6, o.base || "#262a44"); R(g, 0, floorY - 6, 640, 1, "#3a4064");
    PX.vgrad(g, 0, floorY, 640, 360 - floorY, o.f0 || "2a2236", o.f1 || "120e18", 6);
    if (o.planks !== false) for (let yy = floorY + 6, i = 0; yy < 360; yy += 6 + i * 2, i++) { R(g, 0, yy, 640, 1, "rgba(0,0,0,.25)"); for (let xx = (i * 37) % 60; xx < 640; xx += 60 + i * 8) R(g, xx, yy - 5 - i, 1, 5 + i, "rgba(0,0,0,.2)"); }
  };
  // window with city night outside (uses PX.core.skyline when present)
  const cityWin = (g, x, y, w, h, t, seed, o) => {
    o = o || {};
    R(g, x - 5, y - 5, w + 10, h + 10, o.frame || "#2c3252");
    if (PX.core && PX.core.skyline) PX.core.skyline(g, x, y, w, h, t, seed || 4); else PX.vgrad(g, x, y, w, h, "1a1f4a", "3b2a5c", 6);
    R(g, x + (w >> 1) - 2, y, 4, h, o.frame || "#2c3252"); R(g, x - 8, y + h + 5, w + 16, 5, sh(o.frame || "#2c3252", 0.15)); R(g, x - 8, y + h + 5, w + 16, 1, "#5a6290");
    R(g, x - 5, y - 5, w + 10, 1, "#454c78");
  };
  const plant = (g, x, y, t, s) => {
    s = s || 1; const pot = "#8a4a2c";
    for (let i = 0; i < 7; i++) { const a = -1.4 + i * 0.47 + Math.sin(t * 1.3 + i) * 0.05, len = (14 + (i % 3) * 5) * s;
      for (let k = 0; k < len; k++) { const px = x + Math.cos(a - 1.57 + 1.57) * 0 + Math.sin(a) * k, py = y - Math.cos(a) * k + (k * k) / (len * 3);
        R(g, px, py, 2, 2, k > len * 0.6 ? "#4fa865" : i % 2 ? "#2f7a46" : "#3a8c52"); } }
    R(g, x - 7 * s, y, 14 * s, 11 * s, pot); R(g, x - 8 * s, y, 16 * s, 3, sh(pot, 0.2)); R(g, x + 4 * s, y + 3, 3 * s, 8 * s, sh(pot, -0.3));
  };
  const lampDesk = (g, x, y, t, col) => {   // x,y = base centre on the desk; light hits at left/right of the shade
    R(g, x - 10, y - 4, 20, 4, "#2b2f38"); R(g, x - 10, y - 4, 20, 1, "#4a505c");
    R(g, x - 1, y - 30, 3, 26, "#3a3f4b"); R(g, x, y - 30, 1, 26, "#5a6070");
    R(g, x - 10, y - 40, 22, 11, col || "#3d5a4a"); R(g, x - 10, y - 40, 22, 1, sh(col || "#3d5a4a", 0.3)); R(g, x - 8, y - 29, 18, 2, "#ffe0a0");
  };
  const fly = (g, x, y, t, ph, col) => { const w = Math.sin(t * 9 + ph) > 0; R(g, x, y, 1, 1, col); if (w) { R(g, x - 2, y - 1, 2, 1, col); R(g, x + 1, y - 1, 2, 1, col); } else { R(g, x - 2, y + 1, 2, 1, col); R(g, x + 1, y + 1, 2, 1, col); } };

  // ================= recruiter =================
  // office: recruiter flipping portfolio pages, wall stopwatch counts to o.secs (6), pages fly into a bin.
  // o.secs (6) final count; o.flips (7) pages flipped over the shot
  K.recruiter = (o) => {
    const secs = o.secs === undefined ? 6 : o.secs;
    return (g, t, d, c) => {
      const run = PX.clamp(t / (d * 0.86), 0, 1), nf = o.flips || 7, per = (d * 0.86) / nf;
      // wall + carpet
      wallFloor(g, 270, { w0: "1b2244", w1: "111630", f0: "1d2a33", f1: "0c1218", planks: false });
      for (let yy = 274; yy < 360; yy += 3) for (let xx = (yy % 2) * 2; xx < 640; xx += 4) R(g, xx, yy, 1, 1, "rgba(255,255,255,.035)");
      // far: window with blinds, framed art, certificate
      PX.par(g, c, 0.5, () => {
        cityWin(g, 34, 40, 150, 120, t, 8, { frame: "#2a3052" });
        for (let yy = 40; yy < 160; yy += 6) { R(g, 34, yy, 150, 2, "#3b4470"); R(g, 34, yy, 150, 1, "#59639a"); }
        R(g, 180, 40, 1, 92, "#8a90b0"); R(g, 179, 132, 3, 4, "#c9cde0");
        R(g, 222, 52, 46, 34, "#3a2a1c"); R(g, 225, 55, 40, 28, "#2a3a5c"); PX.vgrad(g, 225, 55, 40, 28, "2c4a78", "e08a5a", 5);
        for (let i = 0; i < 13; i++) { const hh = 6 + Math.abs(Math.sin(i * 1.7)) * 12; R(g, 225 + i * 3, 83 - hh, 3, hh, "#1c2a44"); }
        R(g, 384, 50, 30, 38, "#c9b27a"); R(g, 386, 52, 26, 34, "#d8d0b8"); for (let i = 0; i < 5; i++) R(g, 390, 58 + i * 5, 18 - (i % 2) * 6, 1, "#9a8f78"); PX.circle(g, 399, 81, 3, "#c0392b");
      });
      // mid: filing cabinet, plant, water cooler
      PX.par(g, c, 0.75, () => {
        mat(g, 52, 190, 44, 82, "#4a5470", -1); for (let i = 0; i < 3; i++) { R(g, 56, 196 + i * 26, 36, 22, "#3e475f"); R(g, 56, 196 + i * 26, 36, 1, "#6a7494"); R(g, 68, 204 + i * 26, 12, 3, "#9aa4c0"); }
        R(g, 58, 178, 30, 12, "#a08050"); R(g, 58, 178, 30, 1, "#c0a070"); R(g, 60, 174, 26, 4, "#b8bcc6"); R(g, 62, 170, 22, 4, "#c8a85a");
        plant(g, 598, 246, t, 1.4);
        R(g, 536, 206, 26, 66, "#8a90a4"); R(g, 536, 206, 2, 66, "#a8aec0"); R(g, 558, 206, 4, 66, "#5a6074");
        rr(g, 538, 172, 22, 34, 5, "#2f68b0"); R(g, 541, 176, 3, 24, "#5a94d8"); R(g, 554, 176, 4, 26, "#24508a");
        const bub = (t * 0.6) % 1; R(g, 548, 200 - bub * 22, 2, 2, "#8ab8f0");
        R(g, 546, 224, 6, 4, "#2a2e3a"); R(g, 540, 216, 3, 4, "#b03030"); R(g, 555, 216, 3, 4, "#3050b0");
      });
      G(g, 170, 200, 170, "rgba(255,190,110,0.5)");
      // stopwatch on the wall (big). dial = 10 s per turn
      const sx = 470, sy = 112, srad = 36, sec = run * secs, done = run >= 1;
      PX.par(g, c, 0.62, () => {
        G(g, sx, sy, 64, done ? "rgba(255,90,90,0.4)" : "rgba(95,227,232,0.16)");
        R(g, sx - 6, sy - srad - 10, 12, 6, "#7a8094"); R(g, sx - 3, sy - srad - 14, 6, 4, "#a9adb8"); R(g, sx + 20, sy - srad - 4, 7, 6, "#7a8094");
        PX.circle(g, sx, sy, srad + 4, "#3a4058"); PX.circle(g, sx, sy, srad + 2, "#8a92a8"); PX.circle(g, sx, sy, srad, "#cfcabb"); PX.circle(g, sx + 2, sy + 2, srad - 3, "#bdb7a6");
        PX.circle(g, sx - 10, sy - 12, 6, "#dcd8ca");
        for (let i = 0; i < 60; i++) { const a = (i / 60) * 6.283 - 1.571, bg = i % 6 === 0, r0 = bg ? srad - 7 : srad - 4;
          R(g, sx + Math.cos(a) * r0, sy + Math.sin(a) * r0, bg ? 2 : 1, bg ? 2 : 1, bg ? "#2a2a34" : "#7a7668"); }
        const ang = (sec / 10) * 6.283 - 1.571;
        for (let k = 0; k <= 50; k++) { const a = -1.571 + (ang + 1.571) * (k / 50); for (let q = 6; q < srad - 8; q += 2) R(g, sx + Math.cos(a) * q, sy + Math.sin(a) * q, 1, 1, "rgba(255,92,92,.4)"); }
        PX.line(g, sx, sy, sx + Math.cos(ang) * (srad - 6), sy + Math.sin(ang) * (srad - 6), "#c82a2a");
        PX.line(g, sx + 1, sy, sx + 1 + Math.cos(ang) * (srad - 7), sy + Math.sin(ang) * (srad - 7), "#c82a2a");
        PX.circle(g, sx, sy, 3, "#2a2a34");
        R(g, sx - 16, sy + 13, 32, 12, "#1a1d24"); PX.text(g, sec.toFixed(1), sx, sy + 13, { font: "v", size: 14, col: done && PX.blink(t, 0.3) ? "#ff5c5c" : "#5fe3e8", align: "center" });
      });
      PX.alpha(g, 0.45, () => R(g, 150, 330, 340, 8, "#000"));
      // recruiter (seated behind desk)
      const dy = 252, flipping = t < d * 0.86;
      const flipI = Math.min(nf - 1, Math.floor(t / per)), fk = ((t / per) % 1 + 1) % 1, bored = t > per * 2;
      R(g, 290, dy - 74, 60, 80, "#2a2430"); rr(g, 288, dy - 78, 64, 14, 5, "#3a3240"); R(g, 292, dy - 77, 40, 1, "#5a4e62");
      fig(g, 320, dy + 4, { h: 32, t, seated: true, shirt: "#5a3a6a", jacket: true, inner: "#d8dce6", hair: "#6a3a1c", hairStyle: "bun", skin: "#e8b48a", glasses: "#2a2a34", glint: true, arms: "hold", face: done ? "smug" : bored ? "bored" : "calm" });
      // portfolio: open folder with pages, right page flips left
      const pw = 30, px0 = 320 - pw - 1, py0 = dy - 30;
      R(g, px0 - 3, py0 - 2, pw * 2 + 8, 36, "#2a3a6a"); R(g, px0 - 3, py0 - 2, pw * 2 + 8, 1, "#4a5a9a"); R(g, px0 - 3, py0 + 33, pw * 2 + 8, 1, "#1a2448");
      const page = (x, y, w, i, shade) => { R(g, x, y, w, 32, shade || "#dcdad0"); R(g, x, y, w, 1, "#f4f2ea"); R(g, x + w - 1, y, 1, 32, "#b8b6ae"); const r = hr(i * 13 + 7);
        R(g, x + 3, y + 3, 8, 9, ["#7aa0c8", "#c88a8a", "#8ac48a", "#c8b47a"][i % 4]); R(g, x + 3, y + 3, 8, 1, "#ffffff");
        for (let k = 0; k < 7; k++) R(g, x + (k < 2 ? 13 : 3), y + 4 + k * 3 + (k >= 2 ? 6 : 0), Math.round((w - (k < 2 ? 16 : 6)) * (0.5 + r() * 0.5)), 1, "#7a7f8e"); };
      page(px0, py0, pw, flipI); page(px0 + pw + 2, py0, pw, flipI + 1);
      R(g, px0 + pw, py0 - 1, 2, 34, "#1a2650");
      if (fk < 0.3 && flipping) { const k = fk / 0.3, w = Math.max(1, Math.round(pw * Math.abs(1 - 2 * k))), lift = Math.round(Math.sin(k * 3.14) * 6);
        R(g, k < 0.5 ? px0 + pw + 2 : px0 + pw - w, py0 - lift, w, 32, k < 0.5 ? "#ecebe4" : "#b8b6ae"); }
      R(g, px0 - 6, py0 + 12, 6, 7, "#e8b48a"); R(g, px0 - 6, py0 + 12, 6, 1, "#f4cba8"); R(g, px0 + 2 * pw + 2, py0 + 12, 6, 7, "#d49a70");
      // desk (front view)
      R(g, 140, dy, 360, 8, "#6a4a32"); R(g, 140, dy, 360, 1, "#9a7050"); R(g, 140, dy + 8, 360, 3, "#3a2618");
      mat(g, 148, dy + 11, 344, 70, "#4a3424", -1);
      for (let i = 0; i < 9; i++) R(g, 156 + ((i * 53) % 230), dy + 16 + i * 7, 30 + (i % 3) * 20, 1, "#402c1e");
      R(g, 400, dy + 11, 2, 70, "#2e2016"); R(g, 402, dy + 11, 1, 70, "#5e4432");
      for (let i = 0; i < 3; i++) { R(g, 408, dy + 15 + i * 22, 78, 19, "#523a28"); R(g, 408, dy + 15 + i * 22, 78, 1, "#6e5038"); R(g, 408, dy + 33 + i * 22, 78, 1, "#2e2016"); R(g, 438, dy + 22 + i * 22, 18, 3, "#b89a5a"); R(g, 438, dy + 22 + i * 22, 18, 1, "#e8d08a"); }
      G(g, 200, dy + 6, 90, "rgba(255,190,110,0.25)");
      // desk items: lamp, inbox stack (shrinks), monitor back, mug, nameplate
      lampDesk(g, 178, dy + 1, t, "#2f5a48");
      const stack = Math.max(2, 18 - Math.floor(t / per) * 2);
      R(g, 206, dy - 4, 42, 5, "#3a3f4b"); R(g, 206, dy - 4, 42, 1, "#5a606e");
      for (let i = 0; i < stack; i++) { R(g, 208 + ((i * 3) % 4) - 1, dy - 5 - i * 2, 38, 2, i % 2 ? "#a8a498" : "#8a867c"); R(g, 208 + ((i * 3) % 4) - 1, dy - 5 - i * 2, 1, 2, "#c8c4b8"); }
      R(g, 208, dy - 6 - stack * 2, 38, 1, "#b8b4a8");
      G(g, 430, dy - 34, 80, "rgba(90,160,255,0.25)");
      mat(g, 396, dy - 50, 74, 46, "#262a36", 1); R(g, 396, dy - 50, 74, 1, "#6a8ac8"); R(g, 469, dy - 50, 1, 46, "#5a7ab8"); R(g, 427, dy - 4, 12, 4, "#22262f"); R(g, 420, dy - 1, 26, 2, "#2a2e3a");
      R(g, 476, dy - 10, 9, 10, "#b8bec9"); R(g, 485, dy - 8, 3, 5, "#b8bec9"); R(g, 476, dy - 10, 9, 2, "#6b4226"); R(g, 476, dy - 10, 1, 10, "#d8dee9");
      for (let i = 0; i < 3; i++) { const k = (t * 0.7 + i / 3) % 1; PX.alpha(g, 0.5 * (1 - k), () => R(g, 479 + Math.round(Math.sin(k * 6 + i) * 2), dy - 14 - k * 14, 2, 3, "#c9d1d9")); }
      R(g, 290, dy + 24, 60, 12, "#c9a24a"); R(g, 291, dy + 25, 58, 10, "#2a2218"); PX.text(g, "HIRING", 320, dy + 25, { font: "v", size: 11, col: "#e8c86a", align: "center" });
      // flying pages -> bin (foreground, bottom right)
      const bx = 556, byy = 292;
      let inBin = 0;
      const flyers = [];
      for (let i = 0; i < nf; i++) {
        const t0 = per * i + per * 0.3, k = (t - t0) / 0.7;
        if (k >= 1) { inBin++; continue; } if (k < 0) continue;
        const e = PX.ease(k, "io"), fx = PX.lerp(px0 + pw + 16, bx, e), fy = PX.lerp(py0 + 10, byy - 6, e) - Math.sin(k * 3.14) * 80;
        flyers.push([fx, fy, Math.floor(t * 14 + i) % 4]);
      }
      PX.par(g, c, 1.12, () => {
        const pile = Math.min(inBin, 9);
        for (let i = 0; i < pile; i++) { const r = hr(i + 40); R(g, bx - 16 + r() * 14, byy - 2 - i * 3, 18, 8, i % 2 ? "#d4d2ca" : "#bcbab2"); R(g, bx - 16 + r() * 14, byy - 2 - i * 3, 18, 1, "#ecebe4"); }
        if (inBin > 6) { R(g, bx - 40, 346, 18, 7, "#bcbab2"); R(g, bx + 28, 350, 16, 6, "#c8c6be"); }
        R(g, bx - 26, byy, 52, 70, "#353b4a"); R(g, bx - 26, byy, 52, 3, "#7a8294"); R(g, bx - 26, byy + 3, 52, 1, "#20242e");
        for (let xx = bx - 23; xx < bx + 24; xx += 5) R(g, xx, byy + 4, 1, 66, "#5a6274"); for (let yy = byy + 10; yy < byy + 70; yy += 8) R(g, bx - 26, yy, 52, 1, "#4a5262");
        R(g, bx - 26, byy, 2, 70, "#6a7284"); R(g, bx + 21, byy, 5, 70, "#22262f");
        if (inBin > 0) { const lk = (t - (per * (inBin - 1) + per * 0.3 + 0.7)) / 0.4; if (lk < 1 && lk >= 0) for (let i = 0; i < 6; i++) { const a = -2.6 + i * 0.4; R(g, bx + Math.cos(a) * (14 + lk * 18), byy - 6 + Math.sin(a) * (8 + lk * 14), 2, 2, "#d0ccc0"); } }
      });
      for (const [fx, fy, fr] of flyers) { const ws = [[16, 18], [18, 9], [5, 18], [14, 14]][fr];
        R(g, fx - ws[0] / 2, fy - ws[1] / 2, ws[0], ws[1], fr === 2 ? "#a8a69e" : "#dcdad2"); R(g, fx - ws[0] / 2, fy - ws[1] / 2, ws[0], 1, "#f4f2ea");
        if (fr !== 2) { R(g, fx - ws[0] / 2 + 2, fy - ws[1] / 2 + 2, 4, Math.min(5, ws[1] - 4), "#7aa0c8"); R(g, fx - ws[0] / 2 + 7, fy - ws[1] / 2 + 3, ws[0] - 9, 1, "#7a7f8e"); } }
      if (t > d * 0.45) PX.alpha(g, PX.p(t, d * 0.45, 0.3), () => PX.otext(g, `${secs} SEC`, sx, sy + srad + 12, { size: 16, col: done ? "#ff5c5c" : "#f7c948", align: "center" }));
      PX.particles(g, 12, 22, t, [110, 130, 180, 120], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.6 });
      PX.vignette(g, 0.5);
    };
  };

  // ================= tuition =================
  // small tuition-centre classroom after school; the teacher's laptop (foreground) fills a fees table row by row.
  // o.rows: [[name, paid], ...] (6 rows); o.fill: [t0, t1] when the statuses fill (default [0.4, d*0.85])
  K.tuition = (o) => {
    const rows = o.rows || [["AARAV", 1], ["MEI", 1], ["OMAR", 0], ["PRIYA", 1], ["LEO", 0], ["ZARA", 1]];
    const kids = [
      // back row (small)
      { x: 112, y: 204, h: 15, shirt: "#c0504a", hair: "#2a1a12", skin: "#c98a5a", hs: "short", act: "write" },
      { x: 178, y: 204, h: 15, shirt: "#4a8a5a", hair: "#1a1a1a", skin: "#e8c09a", hs: "long", act: "hand" },
      { x: 262, y: 204, h: 15, shirt: "#d0a040", hair: "#5a3a1a", skin: "#a86b3c", hs: "spiky", act: "write" },
      { x: 328, y: 204, h: 15, shirt: "#6a5aa0", hair: "#2a1a12", skin: "#e0a878", hs: "bun", act: "sleep" },
      // front row
      { x: 82, y: 248, h: 19, shirt: "#3a7ab0", hair: "#1a1a1a", skin: "#d9a066", hs: "short", act: "write" },
      { x: 190, y: 248, h: 19, shirt: "#b04a7a", hair: "#3a2216", skin: "#f2c9a0", hs: "long", act: "write" },
      { x: 298, y: 248, h: 19, shirt: "#5aa08a", hair: "#2a1a12", skin: "#8a5a3a", hs: "short", act: "pencil" },
    ];
    return (g, t, d, c) => {
      const f0 = o.fill ? o.fill[0] : 0.4, f1 = o.fill ? o.fill[1] : d * 0.85, n = rows.length;
      const per = (f1 - f0) / n, done = Math.max(0, Math.min(n, Math.floor((t - f0) / per)));
      // back wall + floor
      wallFloor(g, 214, { w0: "232a4a", w1: "171c36", f0: "2a2a3a", f1: "15141e" });
      PX.par(g, c, 0.45, () => {
        // window at dusk (warm accent)
        R(g, 500, 48, 104, 92, "#2a3050"); PX.vgrad(g, 504, 52, 96, 84, "2a2a5a", "f08a5a", 7);
        PX.circle(g, 560, 122, 10, "#ffcf8a"); G(g, 560, 122, 40, "rgba(255,170,90,0.45)");
        for (let i = 0; i < 12; i++) { const h = 8 + ((i * 37) % 22); R(g, 504 + i * 8, 136 - h, 8, h, i % 2 ? "#2a2240" : "#322848"); if (i % 3 === 0) R(g, 506 + i * 8, 136 - h + 3, 2, 2, "#ffcf8a"); }
        R(g, 550, 52, 3, 84, "#2a3050"); R(g, 504, 92, 96, 3, "#2a3050"); R(g, 496, 140, 112, 5, "#3a4066"); R(g, 496, 140, 112, 1, "#5a6290");
        // whiteboard with maths
        R(g, 132, 36, 300, 120, "#5a6078"); R(g, 132, 36, 300, 1, "#8a90a8"); R(g, 135, 39, 294, 114, "#c8ccd4"); PX.vgrad(g, 135, 39, 294, 114, "7a8090", "626878", 5);
        R(g, 128, 156, 308, 4, "#6a7088"); R(g, 150, 153, 10, 3, "#d84040"); R(g, 164, 153, 10, 3, "#3060c0"); R(g, 420, 152, 12, 4, "#3a3a44");
        PX.text(g, "x² + 3x = 10", 150, 50, { font: "v", size: 20, col: "#2a4a8a" });
        PX.text(g, "(x+5)(x-2) = 0", 150, 74, { font: "v", size: 20, col: "#2a4a8a" });
        PX.text(g, "x = 2", 150, 100, { font: "v", size: 20, col: "#b03030" }); PX.box(g, 146, 100, 52, 20, "#b03030");
        // little parabola graph
        R(g, 330, 50, 1, 90, "#5a6070"); R(g, 300, 120, 110, 1, "#5a6070");
        for (let i = -40; i <= 40; i++) { const yy = 120 - (1600 - i * i) / 40; R(g, 360 + i, yy, 2, 1, "#2a8a5a"); }
        // clock
        PX.circle(g, 468, 70, 15, "#3a4060"); PX.circle(g, 468, 70, 13, "#d8d4c8"); for (let i = 0; i < 12; i++) R(g, 468 + Math.cos(i * 0.5236) * 10, 70 + Math.sin(i * 0.5236) * 10, 1, 1, "#3a3a44");
        PX.line(g, 468, 70, 468 + Math.cos(t * 0.6 - 1.57) * 10, 70 + Math.sin(t * 0.6 - 1.57) * 10, "#c03030"); PX.line(g, 468, 70, 474, 72, "#2a2a34"); PX.line(g, 468, 70, 466, 63, "#2a2a34");
        // posters
        R(g, 40, 60, 60, 76, "#30406a"); R(g, 43, 63, 54, 70, "#3a5a8a"); PX.text(g, "A+", 70, 78, { size: 16, col: "#f7c948", align: "center" }); for (let i = 0; i < 4; i++) R(g, 50, 106 + i * 6, 40 - i * 6, 2, "#8ab0d8");
        R(g, 40, 160, 80, 6, "#4a3626"); for (let i = 0; i < 9; i++) R(g, 44 + i * 8, 144 + (i % 3), 6, 16 - (i % 3), ["#c0392b", "#2980b9", "#27ae60", "#d35400", "#8e44ad"][i % 5]);
      });
      // ceiling tube light
      R(g, 220, 0, 200, 6, "#3a3f58"); R(g, 226, 6, 188, 2, "#b8c8e8"); G(g, 320, 10, 220, "rgba(200,220,255,0.18)");
      G(g, 560, 120, 120, "rgba(255,160,90,0.18)");
      // students + their desks (mid layer)
      PX.par(g, c, 0.8, () => {
        for (const k of kids) {
          const ph = k.x * 0.07, hand = k.act === "hand" && t > 1.2, sleep = k.act === "sleep";
          const nod = k.act === "write" ? (Math.sin(t * 5 + ph) > 0.6 ? 1 : 0) : 0;
          fig(g, k.x, k.y + nod + (sleep ? 3 : 0), { h: k.h, t, ph, seated: true, shirt: k.shirt, hair: k.hair, skin: k.skin, hairStyle: k.hs, glasses: k.glasses,
            arms: hand ? "raise" : "desk", face: sleep ? "yawn" : k.act === "pencil" ? "calm" : hand ? "happy" : "calm", noBlink: sleep });
          if (k.act === "pencil") { R(g, k.x + 2, k.y - Math.round(k.h * 1.5), 1, 7, "#f7c948"); R(g, k.x + 2, k.y - Math.round(k.h * 1.5), 1, 1, "#ff9090"); }
          const dw = Math.round(k.h * 3.2), dh = Math.round(k.h * 1.4);
          R(g, k.x - dw / 2, k.y - 1, dw, 3, "#a8784a"); R(g, k.x - dw / 2, k.y - 1, dw, 1, "#c8986a"); R(g, k.x - dw / 2 + 2, k.y + 2, dw - 4, dh, "#6a4a32"); R(g, k.x - dw / 2 + 2, k.y + 2, dw - 4, 1, "#4a3222");
          R(g, k.x - dw / 2 + 2, k.y + 2, 2, dh, "#7a5a40");
          if (k.act === "write") { R(g, k.x - 6, k.y - 3, 12, 2, "#e0dcd0"); R(g, k.x + 2 + Math.round(Math.sin(t * 7 + ph) * 3), k.y - 6, 1, 4, "#f7c948"); }
          if (sleep) { const z = (t * 0.8 + ph) % 1; PX.alpha(g, 1 - z, () => PX.text(g, "z", k.x + 9 + z * 6, k.y - 30 - z * 12, { font: "v", size: 12, col: "#c8d0ff" })); }
        }
      });
      // teacher's desk (foreground)
      PX.par(g, c, 1.05, () => {
        R(g, -20, 290, 680, 8, "#7a5638"); R(g, -20, 290, 680, 1, "#a87a52"); R(g, -20, 298, 680, 62, "#3e2a1c");
        for (let i = 0; i < 6; i++) R(g, (i * 113) % 600, 304 + i * 9, 60 + (i % 3) * 30, 1, "#4a3424");
        // books + apple + mug on the left
        mat(g, 22, 270, 60, 8, "#3a6aa0", -1); mat(g, 26, 262, 54, 8, "#a04a3a", -1); mat(g, 20, 278, 64, 12, "#2a8a6a", -1);
        PX.circle(g, 104, 282, 7, "#c83030"); R(g, 100, 278, 3, 3, "#e86060"); R(g, 104, 272, 1, 4, "#4a2a1a"); R(g, 105, 272, 4, 2, "#3a8a3a");
        // laptop
        const lx = 384, ly = 168, lw = 204, lh = 118;
        G(g, lx + lw / 2, ly + lh / 2, 170, "rgba(110,180,255,0.24)");
        R(g, lx - 6, ly - 6, lw + 12, lh + 10, "#2a2e38"); R(g, lx - 6, ly - 6, lw + 12, 1, "#5a6070"); R(g, lx - 6, ly - 6, 1, lh + 10, "#4a505c");
        R(g, lx - 18, ly + lh + 4, lw + 36, 6, "#3a3f4b"); R(g, lx - 18, ly + lh + 4, lw + 36, 1, "#6a7080"); R(g, lx - 22, ly + lh + 10, lw + 44, 3, "#22252e");
        R(g, lx, ly, lw, lh, "#141c2a"); R(g, lx, ly, lw, 14, "#1e2a40");
        PX.text(g, "FEES · NOVEMBER", lx + 8, ly + 1, { font: "v", size: 14, col: "#c9d1d9" });
        R(g, lx + lw - 30, ly + 4, 6, 6, "#3df56b"); R(g, lx + lw - 20, ly + 4, 6, 6, "#f7c948"); R(g, lx + lw - 10, ly + 4, 6, 6, "#ff5c5c");
        R(g, lx + 6, ly + 18, lw - 12, 12, "#24324a"); PX.text(g, "NAME", lx + 12, ly + 18, { font: "v", size: 13, col: "#8aa0c0" }); PX.text(g, "FEE", lx + 92, ly + 18, { font: "v", size: 13, col: "#8aa0c0" }); PX.text(g, "STATUS", lx + 126, ly + 18, { font: "v", size: 13, col: "#8aa0c0" });
        rows.forEach(([nm, paid], i) => {
          const ry = ly + 31 + i * 12, cur = i === done && t >= f0 && t < f1;
          if (cur) R(g, lx + 6, ry, lw - 12, 12, "#2a3a5a"); else if (i % 2) R(g, lx + 6, ry, lw - 12, 12, "#18223a");
          PX.text(g, nm, lx + 12, ry, { font: "v", size: 13, col: "#c9d1d9" }); PX.text(g, "$40", lx + 92, ry, { font: "v", size: 13, col: "#7d8590" });
          if (i < done) { const k = PX.p(t, f0 + per * (i + 1), 0.2, "back"), col = paid ? "#3df56b" : "#ff5c5c";
            PX.zoom(g, 1, 0, 0, () => {});
            const sx = lx + 128, sy2 = ry + 2;
            if (paid) { for (let j = 0; j < 3; j++) R(g, sx + j, sy2 + 4 + j, 2, 1, col); for (let j = 0; j < 6; j++) R(g, sx + 3 + j, sy2 + 6 - j, 2, 1, col); }
            else { for (let j = 0; j < 7; j++) { R(g, sx + j, sy2 + j, 2, 1, col); R(g, sx + 6 - j, sy2 + j, 2, 1, col); } }
            PX.alpha(g, PX.clamp(k, 0, 1), () => PX.text(g, paid ? "PAID" : "UNPAID", sx + 14, ry, { font: "v", size: 13, col }));
            if (k < 1) G(g, sx + 4, sy2 + 4, 14, paid ? "rgba(61,245,107,0.6)" : "rgba(255,92,92,0.6)");
          }
        });
        const paidN = rows.slice(0, done).filter((r) => r[1]).length;
        R(g, lx + 6, ly + lh - 12, lw - 12, 10, "#1e2a40"); PX.text(g, `PAID ${paidN}/${n}`, lx + 12, ly + lh - 13, { font: "v", size: 13, col: "#3df56b" });
        const unpaidN = rows.slice(0, done).filter((r) => !r[1]).length; if (unpaidN) PX.text(g, `OWED $${unpaidN * 40}`, lx + lw - 12, ly + lh - 13, { font: "v", size: 13, col: "#ff5c5c", align: "right" });
        // cursor hopping to the next status cell
        if (t >= f0 - 0.2) { const ci = Math.min(n - 1, done), k = PX.p(((t - f0) % per + per) % per, 0, per * 0.5, "out"), tx = lx + 132, ty2 = ly + 37 + ci * 12;
          const cx = PX.lerp(tx + 30, tx, k), cy = PX.lerp(ty2 - 13, ty2, k);
          PX.sprite(g, ["k.....", "kk....", "kwk...", "kwwk..", "kwwwk.", "kwwkk.", "kk.wk."], cx, cy, { k: "#0b0f18", w: "#e8edf2" }); }
        // keyboard deck hint + hands (teacher)
        for (let i = 0; i < 14; i++) R(g, lx + 6 + i * 15, ly + lh + 5, 12, 2, "#2a2e38");
        // pen cup + papers on the right
        R(g, 340, 262, 18, 28, "#3a5a8a"); R(g, 340, 262, 2, 28, "#5a7aaa"); R(g, 344, 248, 2, 16, "#f7c948"); R(g, 349, 252, 2, 12, "#ff5c5c"); R(g, 353, 250, 2, 14, "#5fe3e8");
        R(g, 600, 280, 52, 10, "#a8a498"); R(g, 602, 276, 48, 4, "#98948a"); R(g, 600, 280, 52, 1, "#c8c4b8");
      });
      PX.particles(g, 21, 20, t, [200, 20, 240, 150], { vy: 2, vx: 1, col: "#dfe8ff", a: 0.4 });
      PX.vignette(g, 0.5);
    };
  };

  // ================= bill =================
  // cutaway house at night: family in the kitchen, swinging ceiling bulb, a "WHOSE TURN?" app on the fridge
  // spins avatars and lands on YOU at o.you (d*0.55); electricity meter spinning on the outside wall.
  K.bill = (o) => {
    const AV = [["MOM", "#c05a8a", "#5a2a1a", "long"], ["DAD", "#4a7a5a", "#2a1a12", "short"], ["KID", "#d0a040", "#3a2216", "spiky"], ["YOU", "#3a6ab0", "#1a1a1a", "short"]];
    return (g, t, d, c) => {
      const tyou = o.you === undefined ? d * 0.55 : o.you, landed = t >= tyou;
      // sky
      PX.vgrad(g, 0, 0, 640, 300, "0c1026", "2a2450", 9);
      const r = PX.rnd(9);
      for (let i = 0; i < 70; i++) { const x = r() * 640, y = r() * 200; PX.alpha(g, 0.3 + 0.7 * Math.abs(Math.sin(t * 1.2 + i)), () => R(g, x, y, 1, 1, "#dfe6ff")); }
      PX.par(g, c, 0.25, () => { PX.circle(g, 560, 50, 14, "#e8e4c4"); PX.circle(g, 565, 46, 12, "#d4d0b0"); G(g, 560, 50, 60, "rgba(230,230,200,0.25)");
        for (let x = -20; x < 660; x += 2) { const h = 30 + Math.sin(x * 0.012) * 14 + Math.sin(x * 0.041) * 6; R(g, x, 300 - h, 2, h, "#161a36"); } });
      PX.par(g, c, 0.5, () => {
        for (let x = -20; x < 660; x += 2) { const h = 14 + Math.sin(x * 0.02 + 2) * 8; R(g, x, 300 - h, 2, h, "#1c2040"); }
        // far houses with lit windows
        for (const [hx, w, h] of [[20, 50, 34], [574, 56, 40]]) { R(g, hx, 300 - h, w, h, "#20244a"); for (let i = 0; i < w; i++) R(g, hx + i, 300 - h - Math.min(i, w - i) * 0.5, 1, Math.min(i, w - i) * 0.5, "#262a52");
          R(g, hx + 10, 300 - h + 10, 8, 8, PX.blink(t + hx, 4, 0.8) ? "#f7c948" : "#3a3a20"); R(g, hx + w - 18, 300 - h + 10, 8, 8, "#f7c948"); G(g, hx + w - 14, 300 - h + 14, 16, "rgba(247,201,72,0.4)"); }
      });
      // ground
      R(g, 0, 300, 640, 60, "#141c1a"); R(g, 0, 300, 640, 2, "#22302a"); for (let x = 0; x < 640; x += 3) R(g, x, 298 + ((x * 7) % 3), 1, 3, "#1e2a24");
      // power pole + wire
      R(g, 604, 120, 5, 180, "#2a2220"); R(g, 590, 128, 34, 3, "#2a2220");
      for (let i = 0; i <= 40; i++) { const k = i / 40, x = PX.lerp(592, 520, k), y = PX.lerp(128, 168, k) + Math.sin(k * 3.14) * 10; R(g, x, y, 1, 1, "#4a4440"); }
      // ---- house ----
      const X0 = 120, X1 = 520, CEIL = 150, FL = 296, mid = 320;
      // roof + attic
      for (let y = 56; y < CEIL; y++) { const k = (y - 56) / (CEIL - 56), hw = 20 + k * 200; R(g, mid - hw, y, hw * 2, 1, "#5a2a2a"); if (y > 62) R(g, mid - hw + 7, y, hw * 2 - 14, 1, "#1a1424"); }
      for (let y = 56; y < CEIL; y += 4) { const k = (y - 56) / (CEIL - 56), hw = 20 + k * 200; R(g, mid - hw, y, 7, 1, "#7a3a34"); R(g, mid + hw - 7, y, 7, 1, "#3a1a1c"); }
      R(g, mid - 22, 52, 44, 5, "#7a3a34");
      R(g, mid - 1, 62, 2, CEIL - 62, "#2a1e2a"); R(g, mid - 120, 118, 240, 2, "#2a1e2a");
      mat(g, 200, 128, 26, 18, "#6a5040", -1); mat(g, 226, 136, 18, 10, "#5a4434", -1); R(g, 200, 136, 26, 1, "#4a3428");
      R(g, 390, 104, 18, 18, "#2a3060"); R(g, 392, 106, 14, 14, "#3a4a8a"); R(g, 398, 106, 2, 14, "#2a3060"); G(g, 399, 113, 26, "rgba(200,210,255,0.25)");
      // cobweb
      for (let i = 0; i < 6; i++) PX.line(g, mid - 200 + 14, CEIL - 4, mid - 200 + 14 + Math.cos(-1.4 + i * 0.25) * 18, CEIL - 4 + Math.sin(-1.4 + i * 0.25) * 18, "#3a3448");
      // ceiling slab + walls (cut section)
      R(g, X0 - 6, CEIL - 4, X1 - X0 + 12, 6, "#c8b8a0"); R(g, X0 - 6, CEIL - 4, X1 - X0 + 12, 1, "#e8d8c0");
      R(g, X0 - 6, CEIL, 6, FL - CEIL, "#b8a890"); R(g, X1, CEIL, 6, FL - CEIL, "#a89880");
      R(g, X0 - 8, FL, X1 - X0 + 16, 10, "#6a6070"); R(g, X0 - 8, FL, X1 - X0 + 16, 1, "#8a8090");
      // kitchen interior
      PX.vgrad(g, X0, CEIL + 2, X1 - X0, 80, "4a3a5a", "3a2e4a", 5);
      for (let x = X0 + 8; x < X1; x += 16) R(g, x, CEIL + 2, 1, 80, "rgba(255,255,255,.05)");
      R(g, X0, CEIL + 82, X1 - X0, FL - CEIL - 82, "#5a4a5a");
      for (let y = CEIL + 82; y < FL - 30; y += 7) for (let x = X0 + ((y / 7) % 2) * 5; x < X1; x += 10) R(g, x, y, 1, 7, "#4a3c4a"), R(g, X0, y, X1 - X0, 1, "#4a3c4a");
      R(g, X0, FL - 30, X1 - X0, 30, "#4a3428"); for (let x = X0; x < X1; x += 12) R(g, x, FL - 30, 1, 30, "#3a281e"); R(g, X0, FL - 30, X1 - X0, 1, "#6a4a38");
      // window in the kitchen (night outside)
      R(g, 150, 170, 50, 40, "#6a5a6a"); PX.vgrad(g, 153, 173, 44, 34, "141a3a", "2a2a5a", 4); R(g, 174, 173, 2, 34, "#6a5a6a"); R(g, 146, 210, 58, 4, "#7a6a7a");
      R(g, 150, 170, 10, 40, "#8a4a5a"); R(g, 190, 170, 10, 40, "#8a4a5a");
      // counter + stove + kettle on the left
      mat(g, X0, 232, 120, 36, "#6a5040", -1); R(g, X0, 228, 120, 5, "#a8a0a8"); R(g, X0, 228, 120, 1, "#d0c8d0");
      for (let i = 0; i < 3; i++) { R(g, X0 + 6 + i * 38, 238, 34, 26, "#5a4234"); R(g, X0 + 20 + i * 38, 248, 6, 2, "#c8b070"); }
      mat(g, X0 + 4, 166, 40, 26, "#6a5040", -1); mat(g, X0 + 74, 166, 44, 26, "#6a5040", -1);
      R(g, X0 + 70, 218, 20, 10, "#c83a3a"); R(g, X0 + 70, 218, 20, 2, "#e86a6a"); R(g, X0 + 89, 220, 5, 3, "#c83a3a"); R(g, X0 + 77, 214, 6, 4, "#2a2a2a");
      for (let i = 0; i < 4; i++) { const k = (t * 0.8 + i / 4) % 1; PX.alpha(g, 0.6 * (1 - k), () => R(g, X0 + 94 + k * 10 + Math.sin(k * 8 + i) * 2, 214 - k * 26, 3, 3, "#d8d0e0")); }
      // ceiling bulb (swinging) + its warm light
      const sw = Math.sin(t * 1.6) * 0.12, bx = mid + Math.sin(sw) * 40, byy = CEIL + Math.cos(sw) * 40;
      PX.line(g, mid, CEIL, bx, byy - 4, "#2a2a2a");
      G(g, bx, byy + 30, 230, "rgba(255,190,110,0.34)"); G(g, bx, byy + 4, 40, "rgba(255,230,160,0.8)");
      R(g, bx - 3, byy - 5, 6, 4, "#5a5a5a"); PX.circle(g, bx, byy + 2, 5, "#ffe7a0"); R(g, bx - 2, byy, 2, 2, "#fff8e0");
      // table + family
      const face = (who) => (!landed ? (Math.sin(t * 2 + who) > 0.7 ? "happy" : "calm") : who === 3 ? "shock" : who === 2 ? "grin" : "smug");
      fig(g, 268, 264, { h: 16, t, ph: 1, seated: true, shirt: AV[0][1], hair: AV[0][2], hairStyle: "long", skin: "#e8b48a", arms: landed ? "raise" : "desk", face: face(0) });
      fig(g, 352, 264, { h: 17, t, ph: 2, seated: true, shirt: AV[1][1], hair: AV[1][2], hairStyle: "short", skin: "#c98a5a", arms: "desk", face: face(1) });
      R(g, 228, 262, 160, 5, "#8a5a3a"); R(g, 228, 262, 160, 1, "#b07a52"); R(g, 236, 267, 4, 29, "#5a3a26"); R(g, 376, 267, 4, 29, "#5a3a26");
      R(g, 256, 258, 12, 4, "#d8d0c8"); R(g, 344, 258, 12, 4, "#d8d0c8"); R(g, 300, 252, 14, 10, "#a84a3a"); R(g, 300, 252, 14, 2, "#c86a5a");
      const kidY = 276 - (landed ? Math.abs(Math.round(Math.sin(t * 9) * 4)) : 0);
      fig(g, 206, kidY, { h: 13, t, ph: 3, shirt: AV[2][1], hair: AV[2][2], hairStyle: "spiky", skin: "#d9a066", arms: landed ? "up" : "down", face: face(2) });
      fig(g, 418, 271, { h: 17, t, ph: 4, shirt: AV[3][1], hair: AV[3][2], skin: "#e0a878", arms: landed ? "up" : "down", face: face(3), sweat: landed });
      // fridge with app screen
      const fx = 448, fy = 180, fw = 62, fh = 116;
      mat(g, fx, fy, fw, fh, "#7a8496", -1); R(g, fx, fy + 40, fw, 2, "#5a6474"); R(g, fx + fw - 6, fy + 10, 2, 22, "#d8e0ec"); R(g, fx + fw - 6, fy + 50, 2, 40, "#d8e0ec");
      R(g, fx + 4, fy + 46, 8, 8, "#e85a5a"); R(g, fx + 14, fy + 50, 6, 10, "#f7c948"); R(g, fx + 6, fy + 60, 12, 14, "#b8b098");
      const sx = fx + 6, sy = fy + 4, sW = fw - 16, sH = 32;
      R(g, sx - 1, sy - 1, sW + 2, sH + 2, "#1a1d24"); R(g, sx, sy, sW, sH, "#0e1626");
      G(g, sx + sW / 2, sy + sH / 2, 40, landed ? "rgba(255,92,92,0.35)" : "rgba(95,227,232,0.3)");
      PX.text(g, "WHOSE TURN?", sx + sW / 2, sy, { font: "v", size: 10, col: "#c9d1d9", align: "center" });
      const spins = 3 * 4 + 3, p = landed ? spins : PX.ease(PX.clamp(t / tyou, 0, 1), "out") * spins;
      g.save(); g.beginPath(); g.rect(sx, sy + 9, sW, sH - 9); g.clip();
      for (let k = -1; k <= 1; k++) { const idx = ((Math.floor(p) + k) % 4 + 4) % 4, ox = sx + sW / 2 + (k - (p % 1)) * 26, oy = sy + 20, av = AV[idx];
        PX.circle(g, ox, oy, 8, av[1]); PX.circle(g, ox, oy - 1, 5, "#e0b088"); R(g, ox - 5, oy - 7, 10, 3, av[2]); R(g, ox - 3, oy - 2, 1, 2, "#1a1016"); R(g, ox + 2, oy - 2, 1, 2, "#1a1016");
        PX.text(g, av[0], ox, oy + 6, { font: "v", size: 8, col: "#c9d1d9", align: "center" }); }
      g.restore();
      R(g, sx + sW / 2, sy + 9, 1, 3, "#f7c948");
      if (landed && PX.blink(t, 0.3)) PX.box(g, sx, sy, sW, sH, "#ff5c5c");
      // electricity meter on the outside wall (right)
      const mx = 548, my = 200;
      R(g, X1 + 6, 190, 50, 2, "#3a3a40");
      mat(g, mx, my, 34, 48, "#4a5060", -1); PX.circle(g, mx + 17, my + 17, 12, "#2a2e38"); PX.circle(g, mx + 17, my + 17, 10, "#8a94a4"); R(g, mx + 9, my + 9, 6, 3, "#c8d0dc");
      const spin = t * (landed ? 16 : 7);
      R(g, mx + 8, my + 18, 18, 3, "#3a3f4b"); R(g, mx + 8 + Math.round(((spin * 3) % 18 + 18) % 18), my + 18, 3, 3, "#ff5c5c");
      G(g, mx + 17, my + 17, 20, "rgba(160,200,255,0.18)");
      const kwh = 4821 + Math.floor(t * (landed ? 38 : 9) + Math.max(0, t - tyou) * 30);
      R(g, mx + 4, my + 32, 26, 10, "#0e1a10"); PX.text(g, String(kwh).padStart(5, "0"), mx + 17, my + 31, { font: "v", size: 11, col: "#3df56b", align: "center" });
      if (landed) for (let i = 0; i < 3; i++) { const k = ((t - tyou) * 2 + i / 3) % 1; PX.alpha(g, 1 - k, () => R(g, mx + 30 + k * 10, my + 6 - k * 8 + i * 6, 2, 1, "#f7c948")); }
      // foreground: bushes + fence
      PX.par(g, c, 1.15, () => {
        for (let x = -20; x < 660; x += 22) { R(g, x, 318, 4, 42, "#1a1c22"); R(g, x, 318, 4, 1, "#2a2e38"); R(g, x + 1, 315, 2, 3, "#1a1c22"); }
        R(g, -20, 326, 680, 3, "#1a1c22"); R(g, -20, 342, 680, 3, "#1a1c22");
        for (const [bx2, br] of [[30, 26], [80, 18], [600, 28], [556, 16]]) { PX.circle(g, bx2, 352, br, "#0e1a14"); PX.circle(g, bx2 - br * 0.3, 350 - br * 0.3, br * 0.6, "#142a1e"); }
      });
      if (landed) { const k = PX.p(t, tyou, 0.35, "back"); PX.zoom(g, Math.max(0.01, k), mid, 34, () => PX.otext(g, "WHOSE TURN? → YOU", mid, 26, { size: 16, col: "#f7c948", align: "center" })); }
      else PX.otext(g, "WHOSE TURN?", mid, 26, { size: 16, col: "#c9d1d9", align: "center" });
      PX.particles(g, 33, 16, t, [140, 160, 360, 120], { vy: -2, vx: 1, col: "#ffe2b0", a: 0.5 });
      PX.vignette(g, 0.5);
    };
  };

  // ================= jenga =================
  // an app as a tall tower of UI blocks on a table; a giant user finger pokes one block at o.poke (2.0)
  // and the tower collapses in stepped physics with dust. o.label ("YOUR APP"), o.user ("1 REAL USER")
  const UIB = (q, w, h, type, seed) => {
    const r = hr(seed), base = { nav: "#2a3458", btn: "#34406a", input: "#3a4670", img: "#2e3a60", toggle: "#3a3a66", list: "#30406a", avatar: "#36406c", chart: "#2c3a5e", search: "#3a4674" }[type] || "#34406a";
    R(q, 0, 0, w, h, base); R(q, 0, 0, w, 1, sh(base, 0.35)); R(q, 0, 0, 1, h, sh(base, 0.2)); R(q, 0, h - 2, w, 2, sh(base, -0.4)); R(q, w - 2, 0, 2, h, sh(base, -0.3));
    const m = 4, cy = h >> 1;
    if (type === "nav") { for (let i = 0; i < 3; i++) R(q, m + i * 5, cy - 1, 3, 3, ["#ff5c5c", "#f7c948", "#3df56b"][i]); for (let i = 0; i < 3; i++) R(q, w - 12, cy - 4 + i * 3, 8, 1, "#c9d1d9"); R(q, m + 18, cy - 1, Math.max(4, w - 40), 2, "#6a7aa8"); }
    else if (type === "btn") { const bw = Math.min(40, w - 10), col = r() < 0.5 ? "#f25ca8" : "#2fb3b8"; rr(q, (w - bw) / 2, 3, bw, h - 7, 3, col); R(q, (w - bw) / 2 + 3, 4, bw - 6, 1, sh(col, 0.35)); R(q, w / 2 - 6, cy - 1, 12, 2, "#f2f2f2"); }
    else if (type === "input") { R(q, m, 4, w - 2 * m, h - 9, "#9aa2b8"); R(q, m, 4, w - 2 * m, 1, "#5a6280"); R(q, m + 3, cy - 1, Math.min(20, w - 16), 2, "#4a5270"); R(q, m + 25, 6, 1, h - 13, "#1a1f30"); }
    else if (type === "img") { R(q, m, 3, w - 2 * m, h - 7, "#3a6a9a"); for (let i = 0; i < w - 2 * m; i++) { const hh = Math.max(0, 7 - Math.abs(i - (w - 2 * m) * 0.4) * 0.35); R(q, m + i, h - 4 - hh, 1, hh, "#2a7a5a"); } PX.circle(q, w - m - 6, 7, 2, "#f7c948"); }
    else if (type === "toggle") { rr(q, m, cy - 4, 18, 8, 4, "#3df56b"); PX.circle(q, m + 13, cy, 3, "#f2f2f2"); R(q, m + 24, cy - 1, w - m * 2 - 26, 2, "#8a9ac8"); }
    else if (type === "list") { for (let i = 0; i < 3; i++) { R(q, m, 3 + i * 4, 3, 2, "#5fe3e8"); R(q, m + 5, 3 + i * 4, (w - 16) * (0.5 + r() * 0.5), 2, "#8a9ac8"); } }
    else if (type === "avatar") { PX.circle(q, m + 5, cy, 5, "#f7c948"); PX.circle(q, m + 5, cy - 1, 2, "#8a5a3a"); R(q, m + 14, cy - 3, w - 26, 2, "#c9d1d9"); R(q, m + 14, cy + 1, (w - 26) * 0.6, 2, "#6a7aa8"); }
    else if (type === "chart") { for (let i = 0; i < (w - 8) / 5; i++) { const hh = 3 + Math.floor(r() * (h - 8)); R(q, m + i * 5, h - 3 - hh, 3, hh, i % 2 ? "#5fe3e8" : "#8a5cf6"); } }
    else if (type === "search") { R(q, m, 4, w - 2 * m, h - 9, "#4a5684"); PX.circle(q, m + 6, cy - 1, 3, "#c9d1d9"); PX.circle(q, m + 6, cy - 1, 2, "#4a5684"); R(q, m + 8, cy + 1, 2, 2, "#c9d1d9"); R(q, m + 14, cy - 1, w - 30, 2, "#8a9ac8"); }
  };
  K.jenga = (o) => {
    const TYPES = ["nav", "btn", "input", "img", "toggle", "list", "avatar", "chart", "search"];
    const TOP = 304, LH = 18, NL = 11, CX = 320, TW = 96, HIT = 4;
    const blocks = [];
    for (let j = 0; j < NL; j++) {
      if (j % 2 === 0 || j === HIT) blocks.push({ j, x: CX, w: TW });
      else { blocks.push({ j, x: CX - 25, w: 46 }); blocks.push({ j, x: CX + 25, w: 46 }); }
    }
    blocks.forEach((b, i) => { b.y = TOP - b.j * LH - LH / 2; b.type = b.j === NL - 1 ? "nav" : TYPES[(i * 5 + 2) % TYPES.length]; b.seed = i * 7 + 3; });
    // precomputed fall: heightmap of table + stub, blocks land in order of height
    const GR = 1100, hm = new Array(640).fill(TOP), rnd = PX.rnd(31);
    for (let x = CX - TW / 2; x < CX + TW / 2; x++) hm[x] = TOP - HIT * LH;
    const pivot = { x: CX - TW / 2, y: TOP - (HIT + 1) * LH }, TIP = -0.38;
    const fallers = blocks.filter((b) => b.j > HIT);
    fallers.forEach((b, i) => { b.vx = -40 - rnd() * 150 + (rnd() < 0.3 ? 200 : 0); b.vy = -30 - rnd() * 60; b.om = (rnd() - 0.5) * 9; b.del = rnd() * 0.08 + (b.j - HIT) * 0.015; });
    const hit = blocks.find((b) => b.j === HIT); hit.vx = -50; hit.vy = 0; hit.om = -1.2; hit.del = 0;
    const land = (b, x0, y0, xt) => {
      let lo = 999; b.xf = xt;
      if (xt > 560 || xt < 80) lo = 440;
      else for (let x = Math.round(xt - b.w / 2); x < xt + b.w / 2; x++) lo = Math.min(lo, hm[PX.clamp(x, 0, 639)]);
      b.yf = lo - LH / 2;
      const dy = b.yf - y0; b.tau = (-b.vy + Math.sqrt(b.vy * b.vy + 2 * GR * Math.max(1, dy))) / GR; b.vx = (b.xf - x0) / b.tau;
      if (lo < 400) for (let x = Math.round(b.xf - b.w / 2); x < b.xf + b.w / 2; x++) hm[PX.clamp(x, 0, 639)] = Math.min(hm[PX.clamp(x, 0, 639)], b.yf - LH / 2);
    };
    const XT = [230, 402, 470, 120, 528, 172, 318, 640, 432];
    // tilted start pose for the upper tower
    const tilt = (b, a) => { const dx = b.x - pivot.x, dy = b.y - pivot.y; return [pivot.x + dx * Math.cos(a) - dy * Math.sin(a), pivot.y + dx * Math.sin(a) + dy * Math.cos(a)]; };
    land(hit, CX - 70, hit.y, 160);
    fallers.slice().sort((a, b) => a.j - b.j).forEach((b, i) => { const [x0, y0] = tilt(b, TIP); b.x0 = x0; b.y0 = y0; land(b, x0, y0, XT[i]); });
    blocks.forEach((b) => { b.af = Math.round((b.om * (b.tau || 0.5)) / Math.PI) * Math.PI + (rnd() - 0.5) * 0.12; });
    return (g, t, d, c) => {
      const tp = o.poke === undefined ? Math.min(2.0, d * 0.32) : o.poke, tc = tp + 0.35, tf = tc + 0.3;
      const tq = t > tc ? tc + Math.floor((t - tc) * 12) / 12 : t;     // stepped physics clock
      // room
      wallFloor(g, 250, { w0: "1a2042", w1: "10142a", f0: "1a1622", f1: "0c0a10" });
      PX.par(g, c, 0.45, () => {
        cityWin(g, 60, 50, 120, 100, t, 12);
        for (let i = 0; i < 26; i++) { const r = hr(i + 3), x = 60 + r() * 120, y = 50 + (((r() * 100 + t * 90) % 100) + 100) % 100; R(g, x, y, 1, 3, "rgba(160,190,255,.35)"); }
        R(g, 470, 60, 70, 50, "#2a2240"); R(g, 473, 63, 64, 44, "#3a2a5a"); for (let i = 0; i < 6; i++) R(g, 480 + i * 9, 100 - (i * 13) % 30, 6, (i * 13) % 30 + 4, i % 2 ? "#f25ca8" : "#5fe3e8");
        R(g, 480, 120, 50, 6, "#4a3626"); for (let i = 0; i < 6; i++) R(g, 484 + i * 7, 106 + (i % 2) * 2, 5, 14 - (i % 2) * 2, ["#c0392b", "#2980b9", "#27ae60", "#8e44ad"][i % 4]);
      });
      PX.par(g, c, 0.7, () => { plant(g, 590, 248, t, 1.6); R(g, 33, 150, 4, 100, "#2a2e3a"); R(g, 24, 248, 22, 4, "#2a2e3a"); rr(g, 18, 128, 34, 24, 4, "#6a4a5a"); R(g, 18, 128, 34, 1, "#8a6a7a"); R(g, 20, 151, 30, 2, "#ffd8a0"); G(g, 35, 170, 90, "rgba(255,190,120,0.35)"); });
      // lamp above (hanging) light on the tower
      R(g, 319, 0, 2, 26, "#2a2a30"); rr(g, 300, 26, 40, 12, 4, "#3a4a3a"); R(g, 304, 37, 32, 2, "#ffe0a0");
      G(g, 320, 120, 230, "rgba(255,200,130,0.35)"); G(g, 320, 40, 30, "rgba(255,230,170,0.7)");
      // screen shake on impacts
      const sk = t > tf + 0.2 && t < tf + 0.9 ? Math.round(Math.sin(t * 70) * 2 * (1 - (t - tf - 0.2) / 0.7)) : 0;
      g.save(); g.translate(sk, Math.abs(sk) > 1 ? 1 : 0);
      // table
      R(g, 60, TOP, 520, 8, "#7a5638"); R(g, 60, TOP, 520, 1, "#a87a52"); R(g, 60, TOP + 8, 520, 4, "#4a3222"); R(g, 80, TOP + 12, 10, 50, "#4a3222"); R(g, 550, TOP + 12, 10, 50, "#4a3222");
      PX.alpha(g, 0.35, () => R(g, CX - 70, TOP - 1, 140, 2, "#000"));
      R(g, 96, TOP - 12, 10, 12, "#b8bec9"); R(g, 106, TOP - 10, 3, 6, "#b8bec9"); R(g, 96, TOP - 12, 10, 2, "#6b4226"); R(g, 96, TOP - 12, 1, 12, "#d8dee9");
      for (let i = 0; i < 3; i++) { const k = (t * 0.7 + i / 3) % 1; PX.alpha(g, 0.5 * (1 - k), () => R(g, 99 + Math.round(Math.sin(k * 6 + i) * 2), TOP - 16 - k * 14, 2, 3, "#c9d1d9")); }
      R(g, 500, TOP - 2, 22, 2, "#d8c050"); R(g, 524, TOP - 2, 20, 2, "#e07aa8");
      // tower
      const sway = t < tp ? Math.round(Math.sin(t * 2.2) * 0.6) : 0;
      const drawB = (b, x, y, a) => {
        if (Math.abs(a) < 0.02) { g.save(); g.translate(Math.round(x - b.w / 2), Math.round(y - LH / 2)); UIB(g, b.w, LH, b.type, b.seed); g.restore(); }
        else rot(g, b.w, LH, x, y, a, (q) => UIB(q, b.w, LH, b.type, b.seed));
      };
      const dust = [];
      for (const b of blocks) {
        let x = b.x, y = b.y, a = 0;
        if (b === hit) {
          if (t >= tp) { const k = PX.p(t, tp, 0.35, "out"); x = b.x - 70 * k; }
          if (tq >= tc) { const tt = Math.min(tq - tc, b.tau); x = (b.x - 70) + b.vx * tt; y = b.y + b.vy * tt + 0.5 * GR * tt * tt; a = b.om * tt;
            if (tq - tc >= b.tau) { x = b.xf; y = b.yf; a = b.af; dust.push([b.xf, b.yf + LH / 2, tq - tc - b.tau, b.w]); } }
        } else if (b.j > HIT) {
          if (t >= tc && tq < tf) { const k = PX.ease((tq - tc) / 0.3, "in");[x, y] = tilt(b, TIP * k); a = TIP * k; }
          else if (tq >= tf) { const tt = Math.max(0, tq - tf - b.del); if (tt < b.tau) { x = b.x0 + b.vx * tt; y = b.y0 + b.vy * tt + 0.5 * GR * tt * tt; a = TIP + b.om * tt; }
            else { const ts = tt - b.tau, hop = ts < 0.25 ? Math.round(Math.sin((ts / 0.25) * Math.PI) * 4) : 0; x = b.xf; y = b.yf - hop; a = b.af; dust.push([b.xf, b.yf + LH / 2, ts, b.w]); } }
          else x += sway * (b.j / NL);
        }
        drawB(b, x, y, a);
      }
      // dust puffs
      for (const [x, y, ts, w] of dust) if (ts < 0.7) { const k = ts / 0.7; PX.alpha(g, 0.7 * (1 - k), () => { for (let i = 0; i < 5; i++) PX.circle(g, x - w / 2 + (i + 0.5) * (w / 5) + (i - 2) * k * 10, y - 2 - k * 8, 2 + Math.round(k * 5), "#b8b0c0"); }); }
      g.restore();
      // giant finger from the right
      const fin = t < tp ? PX.p(t, tp - 0.6, 0.6, "back") : 1, out = t > tc + 0.5 ? PX.p(t, tc + 0.5, 0.8, "in") : 0;
      let tipX = PX.lerp(680, CX + TW / 2, fin); if (t >= tp) tipX = CX + TW / 2 - 70 * PX.p(t, tp, 0.35, "out"); tipX += out * 360;
      const fy = TOP - HIT * LH - LH / 2;
      if (tipX < 660) {
        const sk1 = "#d89c72", sk2 = "#bb7f56", sk3 = "#94593a", X = Math.round(tipX), Y = Math.round(fy);
        // sleeve + cuff
        R(g, X + 176, Y - 36, 120, 74, "#34528c"); R(g, X + 176, Y - 36, 120, 2, "#4c6eb0"); R(g, X + 176, Y + 34, 120, 4, "#243a66");
        for (const k of [196, 220]) R(g, X + k, Y - 30, 1, 60, "#2a4478");
        rr(g, X + 166, Y - 32, 16, 66, 4, "#8a90b4"); R(g, X + 167, Y - 31, 3, 64, "#a8aed0"); R(g, X + 178, Y - 31, 3, 64, "#6a7094"); R(g, X + 172, Y - 4, 4, 4, "#d8c070");
        // hand (back of hand), curled fingers below, thumb on top
        rr(g, X + 96, Y - 22, 80, 50, 14, sk2); rr(g, X + 98, Y - 22, 76, 30, 12, sk1); R(g, X + 110, Y + 22, 60, 5, sk3);
        for (let i = 0; i < 3; i++) { rr(g, X + 88 + i * 4, Y + 6 + i * 6, 34, 9, 4, i % 2 ? sk2 : sh(sk2, 0.06)); R(g, X + 90 + i * 4, Y + 14 + i * 6, 30, 1, sk3); }
        rr(g, X + 74, Y - 20, 52, 13, 6, sk1); R(g, X + 76, Y - 9, 48, 2, sk3); rr(g, X + 76, Y - 19, 12, 7, 3, "#eebfa8");
        // index finger
        rr(g, X, Y - 10, 112, 21, 9, sk2); rr(g, X, Y - 10, 112, 15, 8, sk1); R(g, X + 9, Y + 6, 100, 4, sk3); R(g, X + 8, Y - 10, 98, 1, "#f2c6a2");
        rr(g, X + 3, Y - 8, 17, 9, 4, "#eebfa8"); R(g, X + 5, Y - 7, 11, 1, "#f8dccc"); R(g, X + 3, Y, 17, 1, "#b87a5a"); R(g, X + 3, Y - 8, 2, 8, "#f6d6c4");
        for (const kx of [42, 80]) { R(g, X + kx, Y - 6, 1, 3, sk3); R(g, X + kx + 2, Y - 7, 1, 5, sk3); R(g, X + kx + 4, Y - 6, 1, 3, sk3); }
        if (out < 0.2) PX.otext(g, o.user || "1 REAL USER", Math.min(540, tipX + 110), fy - 46, { size: 8, col: "#5fe3e8", align: "center" });
      }
      if (t < tc + 0.2) PX.alpha(g, 1 - PX.p(t, tc, 0.2), () => PX.otext(g, o.label || "YOUR APP", CX, TOP - NL * LH - 24, { size: 16, col: "#f7c948", align: "center" }));
      if (t >= tp && t < tp + 0.35) { const k = (t - tp) / 0.35; for (let i = 0; i < 6; i++) { const a = -1 + i * 0.4; R(g, CX + TW / 2 + Math.cos(a) * (6 + k * 14), fy + Math.sin(a) * (6 + k * 14), 2, 2, "#f7c948"); } }
      if (t > tf + 0.6) { const k = PX.p(t, tf + 0.6, 0.3, "back"); PX.zoom(g, Math.max(0.01, k), CX, 70, () => PX.otext(g, "OOPS.", CX, 62, { size: 16, col: "#ff5c5c", align: "center" })); }
      PX.particles(g, 41, 24, t, [200, 60, 240, 200], { vy: -3, vx: 1, col: "#ffe2b0", a: 0.55 });
      PX.vignette(g, 0.55);
    };
  };

  // ================= users_break =================
  // a dark ops room: three big wall screens light up one after another at o.at [0.2, 2.9, 5.9]:
  // 1 a name field gets a smiley glyph -> red error; 2 "PROCESSING..." + back-arrow click -> "CHARGED TWICE";
  // 3 an old cracked phone where the layout overflows and breaks. o.caps = 3 captions.
  const smiley = (g, x, y) => PX.sprite(g, [".yyyyy.", "yyyyyyy", "yykyky y".replace(" ", ""), "yyyyyyy", "ykyyyky", "yykkkyy", ".yyyyy."], x, y, { y: "#f7c948", k: "#3a2a10" });
  const cursorS = (g, x, y, down) => PX.sprite(g, ["k.....", "kk....", "kwk...", "kwwk..", "kwwwk.", "kwwkk.", "kk.wk.", "....k."], Math.round(x), Math.round(y) + (down ? 1 : 0), { k: "#0b0f18", w: down ? "#f7c948" : "#e8edf2" });
  K.users_break = (o) => {
    const caps = o.caps || ["WEIRD INPUT", "IMPATIENT USER", "OLD PHONE"];
    return (g, t, d, c) => {
      const at = o.at || [0.2, d * 0.315, d * 0.64];
      // back wall: bricks + small monitor grid
      PX.vgrad(g, 0, 0, 640, 300, "141a32", "0c1020", 8);
      PX.par(g, c, 0.4, () => {
        for (let y = 0; y < 300; y += 8) for (let x = ((y / 8) % 2) * 12 - 12; x < 660; x += 24) { R(g, x, y, 23, 7, (x * 7 + y) % 3 ? "#161c34" : "#181f3a"); }
        const r = PX.rnd(5);
        for (let row = 0; row < 4; row++) for (let col = 0; col < 12; col++) {
          const x = 4 + col * 54, y = 14 + row * 62, f = r();
          R(g, x, y, 48, 38, "#1e2236"); R(g, x + 3, y + 3, 42, 30, "#0a0e18");
          const kind = Math.floor(f * 4), ph = f * 9;
          if (kind === 0) for (let i = 0; i < 8; i++) R(g, x + 5 + i * 5, y + 30 - (((Math.sin(t * 2 + i + ph) + 1) * 10) | 0), 3, ((Math.sin(t * 2 + i + ph) + 1) * 10) | 0, "#1f4a52");
          else if (kind === 1) { for (let i = 0; i < 40; i++) R(g, x + 4 + i, y + 18 + Math.round(Math.sin(t * 3 + i * 0.4 + ph) * 6), 1, 1, "#2a6a4a"); }
          else if (kind === 2) for (let i = 0; i < 5; i++) R(g, x + 6, y + 6 + i * 5, 10 + ((i * 13 + Math.floor(t * 3 + ph)) % 24), 2, "#2a3a5a");
          else { R(g, x + 3, y + 3 + ((t * 20 + ph * 10) % 30), 42, 1, "#20263a"); }
          if (PX.blink(t + ph, 2.4, 0.5)) R(g, x + 42, y + 34, 2, 2, f > 0.8 ? "#ff5c5c" : "#3df56b");
        }
      });
      const S = [[62, 50], [240, 50], [418, 50]], SW = 160, SH = 168;
      // each big screen
      S.forEach(([sx, sy], i) => {
        const a0 = at[i], lt = t - a0, on = lt >= 0, cur = on && (i === 2 || t < at[i + 1]);
        R(g, sx - 3, sy + SH + 2, 6, 40, "#22263a"); R(g, sx + SW - 3, sy + SH + 2, 6, 40, "#22263a");
        if (on) G(g, sx + SW / 2, sy + SH / 2, 150, lt > [1.7, 1.9, 1.4][i] ? "rgba(255,80,80,0.3)" : "rgba(110,170,255,0.25)", cur ? 1 : 0.45);
        mat(g, sx - 6, sy - 6, SW + 12, SH + 12, "#2a2e3e", -1);
        const X = sx, Y = sy, W = SW, H = SH;
        R(g, X, Y, W, H, "#080b14");
        if (!on) { R(g, X + 8, Y + 8, 30, 2, "#141a2a"); R(g, X + 8, Y + 8, 2, 20, "#141a2a"); return; }
        const pw = PX.p(lt, 0, 0.25, "out");
        if (pw < 1) { const hh = Math.max(1, Math.round(H * pw)); R(g, X, Y + (H - hh) / 2, W, hh, "#7a90b8"); return; }
        g.save(); g.beginPath(); g.rect(X, Y, W, H); g.clip();
        if (i === 0) {
          // phone sign-up form, smiley typed into NAME -> red error
          PX.vgrad(g, X, Y, W, H, "26305a", "1a1e3a", 5);
          const px = X + 45, py = Y + 14, pw2 = 70, ph = 140, err = lt > 1.7, shk = err ? shake(t, a0 + 1.7, 0.4, 3) : 0;
          rr(g, px - 4 + shk, py - 4, pw2 + 8, ph + 8, 8, "#1a1c24"); R(g, px + shk, py, pw2, ph, err ? "#3a1a22" : "#e8eaf0");
          R(g, px + shk, py, pw2, ph, err ? "#3a1a22" : "#6e7286"); R(g, px + shk, py, pw2, 14, err ? "#c03040" : "#4a6ad0");
          PX.text(g, err ? "ERROR" : "SIGN UP", px + pw2 / 2 + shk, py + 1, { font: "v", size: 13, col: "#f2f2f2", align: "center" });
          PX.text(g, "NAME", px + 6 + shk, py + 22, { font: "v", size: 11, col: err ? "#ff9a9a" : "#4a5068" });
          R(g, px + 6 + shk, py + 33, pw2 - 12, 16, err ? "#5a2030" : "#9a9cac"); PX.box(g, px + 6 + shk, py + 33, pw2 - 12, 16, err ? "#ff5c5c" : "#8a90a8");
          if (lt > 0.6) { const k = PX.p(lt, 0.6, 0.25, "back"); if (k > 0.5) smiley(g, px + 10 + shk, py + 37); if (lt < 1.7 && PX.blink(t, 0.6)) R(g, px + 19 + shk, py + 36, 1, 10, "#1a1f30"); }
          else if (PX.blink(t, 0.6)) R(g, px + 10 + shk, py + 36, 1, 10, "#1a1f30");
          PX.text(g, "EMAIL", px + 6 + shk, py + 54, { font: "v", size: 11, col: err ? "#ff9a9a" : "#4a5068" }); R(g, px + 6 + shk, py + 65, pw2 - 12, 16, err ? "#5a2030" : "#9a9cac");
          rr(g, px + 10 + shk, py + 92, pw2 - 20, 16, 4, err ? "#802030" : "#3df56b"); PX.text(g, "SUBMIT", px + pw2 / 2 + shk, py + 94, { font: "v", size: 12, col: "#10241a", align: "center" });
          if (err) { const k = PX.p(lt, 1.7, 0.3, "back"); PX.zoom(g, Math.max(0.01, k), X + W / 2, Y + 120, () => { rr(g, X + 20, Y + 108, W - 40, 26, 4, "#d83a3a"); R(g, X + 22, Y + 109, W - 44, 1, "#ff8a8a");
            PX.text(g, "INVALID NAME", X + W / 2, Y + 107, { font: "v", size: 14, col: "#fff0f0", align: "center" }); PX.text(g, "500: UNICODE?!", X + W / 2, Y + 119, { font: "v", size: 12, col: "#ffd0d0", align: "center" }); });
            if (lt < 2.0) PX.alpha(g, 0.4 * (1 - (lt - 1.7) / 0.3), () => R(g, X, Y, W, H, "#ff2020")); }
          if (lt < 1.8) { const k = PX.p(lt, 0.9, 0.5, "io"); cursorS(g, PX.lerp(X + 140, px + 40, k), PX.lerp(Y + 150, py + 98, k), lt > 1.45 && lt < 1.65); }
        } else if (i === 1) {
          // browser checkout: PROCESSING..., impatient back click, charged twice
          R(g, X, Y, W, H, "#5e6478"); R(g, X, Y, W, 16, "#2a2e3e"); R(g, X + 4, Y + 4, 8, 8, lt > 1.2 && lt < 1.6 ? "#f7c948" : "#5a6070");
          PX.text(g, "<", X + 6, Y + 2, { font: "v", size: 14, col: "#e8edf2" }); R(g, X + 18, Y + 4, W - 24, 9, "#3a3f52"); PX.text(g, "shop/checkout", X + 22, Y + 3, { font: "v", size: 10, col: "#9aa4b8" });
          PX.text(g, "CHECKOUT", X + 10, Y + 22, { font: "v", size: 16, col: "#2a2e3e" });
          R(g, X + 10, Y + 42, 40, 32, "#8a5cf6"); R(g, X + 10, Y + 42, 40, 1, "#aa8cff"); R(g, X + 20, Y + 50, 20, 14, "#c8b0ff");
          PX.text(g, "HEADPHONES", X + 56, Y + 44, { font: "v", size: 12, col: "#2a2e3e" }); PX.text(g, "$49.00", X + 56, Y + 56, { font: "v", size: 14, col: "#2a6a3a" });
          const twice = lt > 1.9;
          if (!twice) { rr(g, X + 20, Y + 90, W - 40, 22, 5, lt > 0.5 ? "#6a7290" : "#2a8a4a");
            if (lt < 0.5) PX.text(g, "PAY $49", X + W / 2, Y + 93, { font: "v", size: 16, col: "#f2f2f2", align: "center" });
            else { const dots = ".".repeat(1 + (Math.floor(lt * 4) % 3)); PX.text(g, "PROCESSING" + dots, X + 40, Y + 94, { font: "v", size: 14, col: "#f2f2f2" });
              for (let k = 0; k < 8; k++) { const a = k * 0.785 + lt * 8; R(g, X + 30 + Math.cos(a) * 5, Y + 101 + Math.sin(a) * 5, 2, 2, k === 0 ? "#f2f2f2" : "#9aa4c0"); } } }
          else {
            for (let k = 0; k < 2; k++) { const kk = PX.p(lt, 1.9 + k * 0.35, 0.3, "back"), ry = Y + 80 + k * 10;
              PX.alpha(g, PX.clamp(kk * 2, 0, 1), () => { R(g, X + 26 + k * 8, ry + (1 - kk) * 30, 92, 40, "#8a887e"); R(g, X + 26 + k * 8, ry + (1 - kk) * 30, 92, 1, "#ffffff");
                PX.text(g, "RECEIPT", X + 32 + k * 8, ry + 2 + (1 - kk) * 30, { font: "v", size: 11, col: "#5a6070" }); PX.text(g, "-$49.00", X + 32 + k * 8, ry + 14 + (1 - kk) * 30, { font: "v", size: 14, col: "#c03040" }); }); }
            if (lt > 2.7) { const k = PX.p(lt, 2.7, 0.3, "back"); PX.zoom(g, Math.max(0.01, k), X + W / 2, Y + 146, () => { rr(g, X + 14, Y + 136, W - 28, 20, 4, "#d83a3a"); PX.text(g, "CHARGED TWICE", X + W / 2, Y + 137, { font: "v", size: 16, col: "#fff0f0", align: "center" }); }); }
          }
          // cursor: clicks PAY, then hammers the back arrow
          { const k1 = PX.p(lt, 0, 0.4, "io"), k2 = PX.p(lt, 0.8, 0.4, "io"); let cx = PX.lerp(X + 120, X + W / 2, k1), cy = PX.lerp(Y + 150, Y + 100, k1);
            cx = PX.lerp(cx, X + 7, k2); cy = PX.lerp(cy, Y + 6, k2); if (lt < 2.6) cursorS(g, cx, cy, (lt > 0.42 && lt < 0.55) || (lt > 1.2 && lt < 1.6 && PX.blink(t, 0.12))); }
        } else {
          // old cracked phone: layout overflows and breaks
          PX.vgrad(g, X, Y, W, H, "3a2a4a", "1e1a2e", 5);
          const px = X + 50, py = Y + 22, pw2 = 60, ph = 112;
          rr(g, px - 8, py - 12, pw2 + 16, ph + 26, 6, "#5a5048"); R(g, px - 8, py - 12, pw2 + 16, 2, "#7a7064"); R(g, px + pw2 / 2 - 8, py - 8, 16, 2, "#2a2420"); PX.circle(g, px + pw2 / 2, py + ph + 7, 4, "#3a342e");
          R(g, px, py, pw2, ph, "#77746a");
          const br = PX.clamp((lt - 0.6) / 1.6, 0, 1), r = PX.rnd(77);
          // elements: header, image, title, text lines, buttons; drift + overflow as br grows
          const sl = (k) => Math.round(br * k);
          R(g, px, py, pw2 + sl(30), 12, "#4a6ad0"); PX.text(g, "WELCOME BACK!!", px + 3, py, { font: "v", size: 12, col: "#f2f2f2" });
          R(g, px + 4 + sl(-14), py + 16 + sl(6), 52 + sl(40), 30, "#6a8ab0"); for (let k = 0; k < 40 + sl(30); k++) R(g, px + 4 + sl(-14) + k, py + 42 + sl(6) - Math.abs(Math.sin(k * 0.2)) * 8, 1, 4, "#3a6a4a");
          PX.text(g, "Your order is on the way", px + 3 + sl(8), py + 50 + sl(14), { font: "v", size: 12, col: "#2a2e3e" });
          for (let k = 0; k < 4; k++) R(g, px + 3 + sl(k * 9 - 10), py + 64 + k * 5 + sl(k * 4), 54 + sl(k * 12), 2, "#6a6e7e");
          rr(g, px + 4 + sl(26), py + 90 + sl(18), 52, 14, 3, "#3df56b"); PX.text(g, "TRACK", px + 30 + sl(26), py + 91 + sl(18), { font: "v", size: 12, col: "#10241a", align: "center" });
          rr(g, px + 4 + sl(-30), py + 96 + sl(30), 52, 14, 3, "#f25ca8"); PX.text(g, "CANCEL", px + 30 + sl(-30), py + 97 + sl(30), { font: "v", size: 12, col: "#2a1020", align: "center" });
          if (br > 0.5) for (let k = 0; k < 6; k++) R(g, px + r() * pw2, py + r() * ph, 4 + r() * 18, 2, PX.blink(t + k, 0.2) ? "#ff5c5c" : "#5fe3e8");
          // crack lines over the glass
          PX.line(g, px + 8, py, px + 26, py + 40, "#f2f2f2"); PX.line(g, px + 26, py + 40, px + 18, py + 70, "#f2f2f2"); PX.line(g, px + 26, py + 40, px + 58, py + 52, "#e2e2e2");
          PX.line(g, px + 26, py + 40, px + 40, py + 112, "#d2d2d2"); PX.line(g, px + 26, py + 40, px, py + 30, "#e2e2e2");
          if (br > 0.4) { const k = PX.p(lt, 1.4, 0.3, "back"); PX.zoom(g, Math.max(0.01, k), X + W / 2, Y + 150, () => { rr(g, X + 24, Y + 140, W - 48, 20, 4, "#d83a3a"); PX.text(g, "LAYOUT BROKE", X + W / 2, Y + 141, { font: "v", size: 16, col: "#fff0f0", align: "center" }); }); }
        }
        // glass reflection + scanline
        PX.alpha(g, 0.08, () => { for (let k = 0; k < 40; k++) R(g, X + 10 + k, Y + 4 + k * 2, 2, 2, "#ffffff"); });
        R(g, X, Y + ((t * 40) % H), W, 1, "rgba(255,255,255,.06)");
        g.restore();
        if (!cur) PX.alpha(g, 0.45, () => R(g, X, Y, W, H, "#05060a"));
        PX.alpha(g, PX.p(lt, 0.2, 0.3), () => PX.otext(g, caps[i], X + W / 2, Y + SH + 12, { size: 8, col: cur ? "#f7c948" : "#8a90a8", align: "center" }));
      });
      // foreground: desk edge, keyboards, mugs, two watchers (backs of heads) lit by the active screen
      const act = t >= at[2] ? 2 : t >= at[1] ? 1 : 0, alt = t - at[act], red = alt > [1.7, 1.9, 1.4][act];
      const rim = red ? "#ff7a7a" : "#8ab8ff";
      PX.par(g, c, 1.12, () => {
        R(g, -20, 300, 680, 70, "#1a1620"); R(g, -20, 300, 680, 3, "#3a3040"); R(g, -20, 300, 680, 1, sh(rim, -0.4));
        for (let i = 0; i < 2; i++) { const kx = 120 + i * 300; R(g, kx, 306, 110, 14, "#22222c"); for (let k = 0; k < 16; k++) R(g, kx + 4 + k * 6.5, 309, 5, 3, "#3a3a48"), R(g, kx + 4 + k * 6.5, 314, 5, 3, "#3a3a48"); }
        R(g, 270, 304, 10, 12, "#8a3a3a"); R(g, 280, 306, 3, 6, "#8a3a3a"); R(g, 270, 304, 10, 2, "#3a2010");
        for (const [hx, hy, hr, hair] of [[200, 318, 26, "#140e0c"], [452, 322, 24, "#1c1410"]]) {
          R(g, hx - hr * 1.6, hy + hr * 0.6, hr * 3.2, 60, "#161420"); R(g, hx - hr * 1.6, hy + hr * 0.6, hr * 3.2, 2, sh(rim, -0.5));
          PX.circle(g, hx, hy, hr, hair); PX.circle(g, hx - 3, hy - 4, hr - 6, sh(hair, 0.08));
          for (let k = -hr + 6; k < hr - 6; k++) R(g, hx + k, hy - Math.round(Math.sqrt(hr * hr - k * k)), 1, 1, rim);
          R(g, hx - hr - 2, hy - 2, 3, 8, "#3a2a24"); R(g, hx + hr - 1, hy - 2, 3, 8, "#3a2a24");
          for (let k = 0; k < 7; k++) R(g, hx - 12 + k * 4, hy - hr - 2 + (k % 2) * 2, 2, 4, hair);
          if (hx > 300) { for (let k = -hr - 2; k <= hr + 2; k++) R(g, hx + k, hy - Math.round(Math.sqrt(Math.max(0, (hr + 3) * (hr + 3) - k * k))), 1, 2, "#3a3f58"); rr(g, hx - hr - 6, hy - 6, 7, 14, 3, "#4a5070"); rr(g, hx + hr - 1, hy - 6, 7, 14, 3, "#4a5070"); R(g, hx + hr + 1, hy - 4, 2, 10, rim); }
        }
      });
      if (red && alt < 0.6) { const sweat = (alt / 0.6); PX.alpha(g, 1 - sweat, () => { PX.otext(g, "!", 230, 270 - sweat * 6, { size: 16, col: "#ff5c5c" }); PX.otext(g, "!", 476, 276 - sweat * 6, { size: 16, col: "#ff5c5c" }); }); }
      PX.vignette(g, 0.55);
    };
  };

  // ================= level_up =================
  // RPG clearing at night: bug creatures fly at the coder-hero (keyboard sword), get slashed into XP orbs that
  // fill the HUD XP bar; at o.lvl (5.0) a light pillar + "LEVEL UP" banner "EDGE-CASE VISION".
  const bugSpr = (g, x, y, t, ph, hl) => {
    x = Math.round(x); y = Math.round(y);
    const wf = Math.sin(t * 30 + ph) > 0, eye = hl || "#ff5c5c";
    PX.alpha(g, 0.5, () => { rr(g, x - 15, y - 10 + (wf ? 0 : 5), 12, 6, 3, "#a8c8f0"); rr(g, x + 4, y - 10 + (wf ? 0 : 5), 12, 6, 3, "#a8c8f0"); });
    const lg = Math.sin(t * 20 + ph) > 0 ? 1 : 0;
    for (let i = 0; i < 3; i++) { const yy = y - 1 + i * 4; R(g, x - 13, yy + (i === 1 ? lg : 0), 4, 1, "#2a1024"); R(g, x - 14, yy + 1 + (i === 1 ? lg : 0), 1, 2, "#2a1024"); R(g, x + 10, yy + (i === 1 ? 1 - lg : 0), 4, 1, "#2a1024"); R(g, x + 14, yy + 1 + (i === 1 ? 1 - lg : 0), 1, 2, "#2a1024"); }
    rr(g, x - 10, y - 6, 21, 16, 6, "#5a1e4e"); rr(g, x - 9, y - 6, 19, 11, 5, "#8a3272"); R(g, x, y - 5, 1, 14, "#3a1030");
    R(g, x - 6, y - 4, 4, 2, "#c86aa8"); R(g, x - 7, y - 2, 2, 2, "#c86aa8"); R(g, x + 3, y + 2, 2, 2, "#6a2458"); R(g, x - 5, y + 4, 2, 2, "#6a2458");
    rr(g, x - 6, y - 12, 13, 8, 3, "#2a1024"); R(g, x - 4, y - 10, 3, 3, eye); R(g, x + 2, y - 10, 3, 3, eye); R(g, x - 4, y - 10, 1, 1, "#ffe0e0"); R(g, x + 2, y - 10, 1, 1, "#ffe0e0");
    R(g, x - 2, y - 6, 5, 1, "#1a0814"); R(g, x - 1, y - 5, 1, 1, "#f2f2f2"); R(g, x + 1, y - 5, 1, 1, "#f2f2f2");
    PX.line(g, x - 3, y - 12, x - 7, y - 18, "#2a1024"); PX.line(g, x + 3, y - 12, x + 7, y - 18, "#2a1024"); R(g, x - 8, y - 19, 2, 2, eye); R(g, x + 7, y - 19, 2, 2, eye);
    G(g, x, y - 9, 12, "rgba(255,80,80,0.35)");
  };
  K.level_up = (o) => {
    const N = 10, rnd = PX.rnd(23), BUGS = [];
    for (let i = 0; i < N; i++) { const left = i % 2 === 0; BUGS.push({ left, y0: 70 + rnd() * 140, wob: 10 + rnd() * 20, ph: rnd() * 6, lane: rnd() }); }
    return (g, t, d, c) => {
      const lvl = o.lvl === undefined ? Math.min(5.0, d * 0.68) : o.lvl, X = 320, Y = 262;
      const hits = BUGS.map((b, i) => 0.6 + (lvl - 0.9) * Math.pow(i / (N - 1), 0.85));
      const up = t >= lvl;
      // sky + moon
      PX.vgrad(g, 0, 0, 640, 240, "0a0e24", "28264e", 9);
      const r = PX.rnd(4); for (let i = 0; i < 60; i++) { const x = r() * 640, y = r() * 160; PX.alpha(g, 0.3 + 0.7 * Math.abs(Math.sin(t + i * 1.7)), () => R(g, x, y, 1, 1, "#e8ecff")); }
      PX.par(g, c, 0.2, () => { PX.circle(g, 470, 62, 18, "#bcb89e"); PX.circle(g, 476, 57, 15, "#a8a48c"); G(g, 470, 62, 80, "rgba(220,220,190,0.25)");
        for (let x = -20; x < 660; x += 2) { const h = 70 + Math.sin(x * 0.01) * 26 + Math.sin(x * 0.033) * 10; R(g, x, 250 - h, 2, h, "#151a38"); } });
      // far pines
      const pine = (x, y, h, col, hi) => { for (let k = 0; k < h; k++) { const w = Math.round((k / h) * h * 0.42 * (0.7 + 0.3 * ((k % 6) / 6))); R(g, x - w, y - h + k, 2 * w + 1, 1, col); if (hi && k % 6 === 5) R(g, x - w, y - h + k, w, 1, hi); } R(g, x - 1, y, 3, 6, "#120e14"); };
      PX.par(g, c, 0.4, () => { for (let i = 0; i < 14; i++) pine(-10 + i * 50 + ((i * 17) % 20), 236, 50 + ((i * 29) % 30), "#141c30"); });
      PX.par(g, c, 0.65, () => {
        for (let i = 0; i < 9; i++) { if (i === 4) continue; pine(10 + i * 78, 262, 80 + ((i * 37) % 40), "#14241e", "#1e3a2c"); }
        // ruined stone arch behind the hero
        for (const sx of [262, 366]) { mat(g, sx, 140, 14, 124, "#4a4c60", sx < 300 ? -1 : 1); for (let y = 146; y < 262; y += 12) R(g, sx, y, 14, 1, "#36384a"); }
        for (let k = 0; k <= 40; k++) { const a = Math.PI + (k / 40) * Math.PI, x = 320 + Math.cos(a) * 52, y = 142 + Math.sin(a) * 34; R(g, x - 6, y - 4, 12, 9, "#4a4c60"); R(g, x - 6, y - 4, 12, 1, "#6a6c84"); }
        R(g, 316, 104, 8, 10, "#5a5c74"); PX.text(g, "◆", 320, 104, { font: "v", size: 10, col: up ? "#5fe3e8" : "#3a3c50", align: "center" });
        // torches
        for (const tx of [222, 418]) { R(g, tx - 2, 200, 4, 50, "#3a2a1c"); R(g, tx - 5, 196, 10, 6, "#5a4030");
          const fl = Math.sin(t * 13 + tx) * 1.5; PX.circle(g, tx, 190 + fl * 0.3, 5, "#f08a3c"); PX.circle(g, tx, 189, 3, "#f7c948"); R(g, tx, 182 + fl, 1, 4, "#ffe0a0");
          G(g, tx, 190, 70 + fl * 3, "rgba(255,150,60,0.4)"); }
      });
      // ground + rune circle
      PX.vgrad(g, 0, 250, 640, 110, "1c2a24", "0c1410", 6);
      for (let i = 0; i < 80; i++) { const rr2 = hr(i + 100), x = rr2() * 640, y = 256 + rr2() * 100; R(g, x, y, 1, 2 + rr2() * 2, "#2a4a34"); R(g, x + 1, y + 1, 1, 2, "#24402c"); }
      for (let k = 0; k < 120; k++) { const a = (k / 120) * 6.283, x = X + Math.cos(a) * 70, y = 292 + Math.sin(a) * 16; R(g, x, y, 2, 1, up ? "#5fe3e8" : "#3a6a6a"); }
      for (let k = 0; k < 8; k++) { const a = (k / 8) * 6.283 + t * 0.5, x = X + Math.cos(a) * 60, y = 292 + Math.sin(a) * 13; R(g, x - 1, y - 1, 3, 2, up ? "#f7c948" : "#2a5a5a"); }
      G(g, X, 292, 90, up ? "rgba(95,227,232,0.35)" : "rgba(95,227,232,0.12)");
      // light pillar on level up
      if (up) { const k = PX.p(t, lvl, 0.4, "out"), fade = 1 - PX.p(t, lvl + 1.2, 1.0, "in") * 0.6;
        PX.alpha(g, k * fade, () => { R(g, X - 22, 0, 44, 296, "rgba(95,227,232,0.18)"); R(g, X - 12, 0, 24, 296, "rgba(200,250,255,0.22)"); R(g, X - 4, 0, 8, 296, "rgba(255,255,255,0.25)"); });
        G(g, X, 200, 140, "rgba(120,240,255,0.45)", fade);
        for (let i = 0; i < 24; i++) { const a = i * 0.785 + (t - lvl) * 3, rad = 30 + ((i * 7) % 20), y = 290 - (((t - lvl) * 60 + i * 13) % 200); R(g, X + Math.cos(a) * rad, y, 2, 2, i % 3 ? "#5fe3e8" : "#f7c948"); }
      }
      // hero: cape, body, keyboard sword
      const lastHit = hits.filter((h) => h <= t).pop(), sinceHit = lastHit === undefined ? 9 : t - lastHit, slash = sinceHit < 0.18;
      const cape = Math.round(Math.sin(t * 3) * 2);
      for (let k = 0; k < 44; k++) { const w = 18 + Math.round(k * 0.35); R(g, X - w + cape * (k / 44), Y - 26 + k, w * 2, 1, k % 9 === 8 ? "#8a2030" : "#a82a3a"); }
      const hf = fig(g, X, Y, { h: 22, t, shirt: "#2f4a86", sleeve: "#2f4a86", pants: "#2a2a3a", hair: "#1a120c", skin: "#d9a066", arms: slash ? "down" : "raise",
        face: up ? "grin" : slash ? "strain" : "happy", lit: -1 });
      R(g, hf.headX - 1, hf.headTop + 4, hf.hw + 2, 2, "#c83a3a"); R(g, hf.headX + hf.hw, hf.headTop + 5, 5, 1, "#c83a3a"); R(g, hf.headX + hf.hw + 2, hf.headTop + 6, 4, 1, "#a82a3a");
      R(g, X - 16, Y - 2, 32, 3, "#6a4a2a"); R(g, X - 2, Y - 2, 4, 3, "#f7c948");
      if (up) { const ey = hf.headTop + Math.round(hf.hh * 0.5); R(g, hf.headX + 2, ey - 1, hf.hw - 4, 5, "#1a2a3a"); R(g, hf.headX + 3, ey, hf.hw - 6, 2, "#5fe3e8"); G(g, X, ey + 1, 26, "rgba(95,227,232,0.8)"); R(g, hf.headX + 4, ey, 3, 1, "#e8ffff"); }
      // keyboard sword
      const kb = (x, y, horiz) => { if (horiz) { R(g, x, y, 54, 9, "#2a2e3a"); R(g, x, y, 54, 1, "#6a7080"); for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) R(g, x + 3 + i * 6, y + 2 + j * 3, 5, 2, up ? `hsl(${(t * 200 + i * 30) % 360},80%,60%)` : "#8a92a4"); }
        else { R(g, x, y, 9, 50, "#2a2e3a"); R(g, x, y, 1, 50, "#6a7080"); for (let i = 0; i < 8; i++) for (let j = 0; j < 2; j++) R(g, x + 2 + j * 3, y + 3 + i * 6, 2, 5, up ? `hsl(${(t * 200 + i * 30) % 360},80%,60%)` : "#8a92a4"); R(g, x - 4, y + 48, 17, 3, "#c8a050"); } };
      if (slash) { kb(X - 60, Y - 34, true); for (let k = 0; k < 14; k++) { const a = -2.6 + k * 0.17, rad = 46; R(g, X + Math.cos(a) * rad, Y - 30 + Math.sin(a) * rad * 0.6, 3, 2, k % 2 ? "#e8ffff" : "#5fe3e8"); } }
      else kb(hf.rx0 + 2, hf.sy - hf.al - 52, false);
      if (up) G(g, hf.rx0 + 6, hf.sy - hf.al - 30, 40, "rgba(255,240,150,0.5)");
      // bugs: fly in, get slashed into XP orbs that fly to the bar
      const barX = 64, barY = 30, barW = 180;
      let xp = 0;
      BUGS.forEach((b, i) => {
        const th = hits[i], t0 = th - 1.4;
        if (t < t0) return;
        if (t < th) { const k = (t - t0) / 1.4, e = PX.ease(k, "in"), sx = b.left ? -20 : 660, tx = X + (b.left ? -22 : 22), ty = Y - 34;
          const x = PX.lerp(sx, tx, e), y = PX.lerp(b.y0, ty, e) + Math.sin(t * 6 + b.ph) * b.wob * (1 - e); bugSpr(g, x, y, t, b.ph); return; }
        const k = (t - th) / 0.6;
        if (k < 0.25) { const kk = k / 0.25; for (let j = 0; j < 8; j++) { const a = j * 0.785; R(g, X + (b.left ? -22 : 22) + Math.cos(a) * kk * 14, Y - 34 + Math.sin(a) * kk * 14, 2, 2, j % 2 ? "#f7c948" : "#ffffff"); } }
        if (k < 1) { const e = PX.ease(k, "in"), ox = PX.lerp(X + (b.left ? -22 : 22), barX + barW * Math.min(1, (i + 1) / N), e), oy = PX.lerp(Y - 34, barY + 4, e) - Math.sin(k * 3.14) * 40;
          PX.circle(g, ox, oy, 3, "#3df56b"); R(g, ox - 1, oy - 1, 2, 2, "#d8ffe0"); G(g, ox, oy, 14, "rgba(61,245,107,0.7)"); }
        if (k < 1.3) PX.alpha(g, 1 - PX.clamp((k - 0.6) / 0.7, 0, 1), () => PX.otext(g, "+10 XP", X + (b.left ? -50 : 50), Y - 60 - k * 16, { font: "v", size: 14, col: "#3df56b", align: "center" }));
        if (k >= 1) xp++;
      });
      // lurking bugs revealed by edge-case vision
      if (up) for (const [bx, by] of [[118, 236], [528, 222], [70, 290], [586, 300]]) { const k = PX.p(t, lvl + 0.4, 0.3, "back"), s = 12 + Math.round((1 - k) * 10);
        bugSpr(g, bx, by + Math.sin(t * 3 + bx) * 2, t, bx); for (const [dx, dy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { R(g, bx + dx * s - (dx > 0 ? 4 : 0), by + dy * s - (dy > 0 ? 0 : 0), 5, 1, "#ff5c5c"); R(g, bx + dx * s - (dx > 0 ? 0 : 0), by + dy * s - (dy > 0 ? 4 : 0), 1, 5, "#ff5c5c"); } }
      // fireflies
      PX.particles(g, 61, 22, t, [0, 150, 640, 160], { vy: -4, vx: 3, col: "#d8ff8a", a: 0.8, tw: 3 });
      // HUD
      const fill = up ? 1 : Math.min(0.97, xp / N);
      R(g, 14, 14, 240, 38, "rgba(8,10,24,.75)"); PX.box(g, 14, 14, 240, 38, "#5a6290"); R(g, 15, 15, 238, 1, "#8a92c0");
      PX.text(g, up ? "LV 8" : "LV 7", 22, 22, { size: 8, col: up && PX.blink(t, 0.25) ? "#ffffff" : "#f7c948" });
      R(g, barX, barY, barW, 8, "#1a2030"); R(g, barX, barY, Math.round(barW * fill), 8, up ? (PX.blink(t, 0.2) ? "#e8ffe8" : "#3df56b") : "#2fbf55"); R(g, barX, barY, Math.round(barW * fill), 2, "#8affa8");
      for (let k = 1; k < 10; k++) R(g, barX + k * 18, barY, 1, 8, "#0c1018"); PX.box(g, barX - 1, barY - 1, barW + 2, 10, "#8a92c0");
      PX.text(g, "XP", barX, barY - 11, { font: "v", size: 12, col: "#8affa8" }); PX.text(g, `${Math.round(fill * 100)}/100`, barX + barW, barY - 11, { font: "v", size: 12, col: "#c9d1d9", align: "right" });
      for (let k = 0; k < 3; k++) PX.sprite(g, [".rr.rr.", "rrrrrrr", "rrrrrrr", ".rrrrr.", "..rrr..", "...r..."], 22 + k * 9, 36, { r: "#ff5c5c" });
      // level-up banner
      if (up) { const k = PX.p(t, lvl, 0.4, "back"), y = PX.lerp(-60, 54, k);
        R(g, 160, y, 320, 54, "#2a1440"); R(g, 160, y, 320, 2, "#f7c948"); R(g, 160, y + 52, 320, 2, "#f7c948"); R(g, 150, y + 10, 12, 34, "#4a2060"); R(g, 478, y + 10, 12, 34, "#4a2060");
        R(g, 140, y + 14, 10, 26, "#3a1850"); R(g, 490, y + 14, 10, 26, "#3a1850");
        PX.otext(g, "LEVEL UP!", 320, y + 8, { size: 16, col: "#f7c948", align: "center" });
        PX.otext(g, "EDGE-CASE VISION", 320, y + 32, { size: 8, col: "#5fe3e8", align: "center" }); }
      PX.vignette(g, 0.55);
    };
  };

  // ================= taste_gap =================
  // dark lightboard studio: a glass board with neon edges; a presenter behind it points a laser that draws the chart.
  // SKILL (cyan) starts at o.skill (0.5), TASTE (yellow) at o.taste (6.5) rises faster; SKILL keeps creeping with a
  // "YOU" dot; the area between shades + "THE GAP" at o.gap (23.6); tiny climbers inside at o.climbers (d*0.9).
  K.taste_gap = (o) => {
    const OX = 116, OY = 252, CW = 384, CH = 166;
    const sk = (u) => OY - CH * (0.12 * u + 0.88 * u * u * u), ta = (u) => OY - CH * (0.85 * (1 - Math.exp(-4.5 * u)) + 0.15 * u);
    const px = (u) => OX + CW * u;
    const drawCurve = (g, f, u0, u1, col, dim, dotted) => {
      for (let x = Math.round(px(u0)); x <= px(u1); x++) {
        const u = (x - OX) / CW, y = f(u), y2 = f(u + 1 / CW);
        if (dotted && (x >> 2) % 2) continue;
        const top = Math.min(y, y2), h = Math.max(2, Math.abs(y2 - y) + 2);
        PX.alpha(g, 0.25, () => R(g, x - 1, top - 1, 3, h + 2, dim));
        R(g, x, top, 1, h, col);
      }
    };
    return (g, t, d, c) => {
      const tS = o.skill === undefined ? 0.5 : o.skill, tT = o.taste === undefined ? d * 0.217 : o.taste, tG = o.gap === undefined ? d * 0.787 : o.gap, tC = o.climbers === undefined ? d * 0.9 : o.climbers;
      const tS2 = tT + 5.5, tS3 = Math.max(tS2 + 1, tG - 1.6);
      // skill progress: 0 -> 0.45 (first draw), then creeps 0.45 -> 0.75 (tS2 .. tS3)
      const uS = t < tS ? 0 : t < tS2 ? 0.45 * PX.ease((t - tS) / Math.min(5, tT - tS - 0.3), "io") : 0.45 + 0.3 * PX.ease((t - tS2) / (tS3 - tS2), "io");
      const uT = t < tT ? 0 : PX.ease((t - tT) / 4.8, "io");
      const drawingS = (t > tS && t < tS + Math.min(5, tT - tS - 0.3)) || (t > tS2 && t < tS3), drawingT = t > tT && t < tT + 4.8;
      // studio: back wall with acoustic panels, light pools
      PX.vgrad(g, 0, 0, 640, 300, "121628", "0a0c16", 8);
      PX.par(g, c, 0.4, () => {
        for (let row = 0; row < 6; row++) for (let col = 0; col < 16; col++) { const x = 8 + col * 40, y = 14 + row * 44; R(g, x, y, 36, 40, "#141a2e"); for (let k = 0; k < 4; k++) R(g, x + 2, y + 4 + k * 10, 32, 3, "#181f36"); R(g, x, y, 36, 1, "#1e2640"); }
        G(g, 160, 70, 130, "rgba(140,90,255,0.12)"); G(g, 500, 60, 140, "rgba(60,200,255,0.10)");
      });
      // softbox lights on stands
      PX.par(g, c, 0.6, () => {
        for (const [sx, col] of [[40, "#c8b088"], [600, "#88a8c8"]]) { R(g, sx - 1, 120, 3, 180, "#2a2e3a"); PX.line(g, sx, 296, sx - 14, 304, "#2a2e3a"); PX.line(g, sx, 296, sx + 14, 304, "#2a2e3a");
          R(g, sx - 22, 64, 44, 56, "#1a1e28"); R(g, sx - 19, 67, 38, 50, sh(col, -0.35)); R(g, sx - 19, 67, 38, 2, col); G(g, sx, 92, 70, col === "#c8b088" ? "rgba(255,210,150,0.22)" : "rgba(150,200,255,0.2)"); }
      });
      // floor
      PX.vgrad(g, 0, 300, 640, 60, "10121c", "06070c", 4);
      // presenter behind the glass (right side)
      const pX = 556 + Math.round(Math.sin(t * 0.4) * 3), pY = 270;
      const pointing = drawingS || drawingT || (t > tG - 0.2 && t < tG + 2.2);
      const pf = fig(g, pX, pY, { h: 24, t, shirt: "#3a2a5a", sleeve: "#3a2a5a", pants: "#1e1e2a", hair: "#2a1a10", hairStyle: "short", skin: "#c98a5a", glasses: "#1a1a22",
        arms: pointing ? "raise" : "down", face: t > tC ? "grin" : t > tG ? "happy" : drawingT ? "smug" : "calm", lit: -1 });
      // glass board: frame posts, tinted pane, reflections, neon edges
      const GX = 70, GY = 30, GW = 520, GH = 262;
      for (const fx of [GX - 6, GX + GW + 2]) { R(g, fx, GY - 4, 4, GH + 54, "#3a3f4e"); R(g, fx, GY - 4, 1, GH + 54, "#6a7080"); R(g, fx - 10, GY + GH + 48, 24, 3, "#2a2e3a"); }
      PX.alpha(g, 0.16, () => R(g, GX, GY, GW, GH, "#2a4a6a"));
      PX.alpha(g, 0.05, () => { for (let k = 0; k < 3; k++) for (let i = 0; i < 160; i++) R(g, GX + 30 + k * 150 + i, GY + i * 1.6, 14 - k * 3, 2, "#ffffff"); });
      const fl = PX.blink(t, 7.3, 0.02) ? 0.4 : 1;
      R(g, GX, GY, GW, 2, "#f25ca8"); R(g, GX, GY + GH - 2, GW, 2, "#5fe3e8"); R(g, GX, GY, 1, GH, "#a07ac8"); R(g, GX + GW - 1, GY, 1, GH, "#a07ac8");
      G(g, GX + GW / 2, GY, 300, "rgba(242,92,168,0.22)", fl); G(g, GX + GW / 2, GY + GH, 300, "rgba(95,227,232,0.2)");
      PX.alpha(g, 0.12, () => { R(g, GX, GY + GH + 14, GW, 2, "#5fe3e8"); R(g, GX + 40, GY + GH + 20, GW - 80, 1, "#5fe3e8"); });   // floor reflection
      // axes (handwritten neon white-blue)
      R(g, OX, OY - CH - 14, 2, CH + 16, "#c8d8f0"); R(g, OX, OY, CW + 18, 2, "#c8d8f0");
      for (let k = 0; k < 3; k++) { R(g, OX + CW + 14 - k, OY - 2 - k, 1, 2 * k + 6, "#c8d8f0"); R(g, OX - 2 - k + 1, OY - CH - 14 + k, 2 * k + 2, 1, "#c8d8f0"); }
      G(g, OX + CW / 2, OY, 120, "rgba(200,220,255,0.08)");
      PX.text(g, "TIME", OX + CW + 18, OY - 16, { font: "v", size: 16, col: "#a8b8d8", align: "right" });
      PX.text(g, "GOOD", OX - 6, OY - CH - 18, { font: "v", size: 14, col: "#a8b8d8", align: "right" });
      for (let k = 1; k <= 4; k++) R(g, OX + k * (CW / 5), OY - 2, 1, 6, "#8898b8");
      // the gap: dithered fill between curves, sweeping left -> right
      if (t >= tG) {
        const k = PX.p(t, tG, 1.2, "io"), uMax = 0.75 * k;
        for (let x = OX + 2; x < px(uMax); x++) { const u = (x - OX) / CW, y0 = Math.ceil(ta(u)) + 2, y1 = Math.floor(sk(u)) - 2;
          for (let y = y0; y < y1; y++) if ((x + y) % 2 === 0) R(g, x, y, 1, 1, (y + Math.floor(t * 8)) % 9 === 0 ? "#ff8ac8" : "#9a3a72"); }
        G(g, px(0.35), (ta(0.35) + sk(0.35)) / 2, 90, "rgba(242,92,168,0.25)", k);
      }
      // curves
      if (uT > 0) drawCurve(g, ta, 0, uT, "#f7c948", "#f7c948");
      if (uS > 0) drawCurve(g, sk, 0, uS, "#5fe3e8", "#5fe3e8");
      if (t > tC) drawCurve(g, sk, 0.75, 0.75 + 0.25 * PX.p(t, tC, 1.5, "io"), "#5fe3e8", "#5fe3e8", true);
      // tips glow + laser from the presenter's hand
      const tips = []; if (drawingS) tips.push([px(uS), sk(uS)]); if (drawingT) tips.push([px(uT), ta(uT)]);
      if (t > tG - 0.2 && t < tG + 2.2) { const a = (t - tG) * 4; tips.push([px(0.33) + Math.cos(a) * 28, (ta(0.33) + sk(0.33)) / 2 + Math.sin(a) * 14]); }
      for (const [x, y] of tips) { G(g, x, y, 18, "rgba(255,255,255,0.7)"); if (pointing) { const hx = pf.rx0 + 3, hy = pf.sy - pf.al; PX.alpha(g, 0.35, () => PX.line(g, hx, hy, x, y, "#ff5c5c")); R(g, x - 1, y - 1, 3, 3, "#ff8a8a"); } }
      if (pointing) R(g, pf.rx0 + 1, pf.sy - pf.al - 4, 4, 6, "#2a2a34");
      // line labels
      if (uS > 0.2) PX.alpha(g, PX.clamp((uS - 0.2) * 6, 0, 1), () => PX.otext(g, "SKILL", px(uS) + 6, sk(uS) + 2, { size: 8, col: "#5fe3e8" }));
      if (uT > 0.6) PX.alpha(g, PX.clamp((uT - 0.6) * 5, 0, 1), () => PX.otext(g, "TASTE", px(Math.min(uT, 0.82)) - 10, ta(Math.min(uT, 0.82)) - 16, { size: 8, col: "#f7c948" }));
      // YOU dot creeping along the skill line + gap measure
      if (t > tS2 && t < tG + 0.6) {
        const a = PX.clamp((t - tS2) / 0.4, 0, 1) * (1 - PX.clamp((t - tG) / 0.6, 0, 1)), x = px(uS), y = sk(uS), yt = ta(uS);
        PX.alpha(g, a, () => { PX.circle(g, x, y, 3, "#e8ffff"); const pr = 4 + ((t * 10) % 8); for (let k = 0; k < 16; k++) R(g, x + Math.cos(k * 0.39) * pr, y + Math.sin(k * 0.39) * pr, 1, 1, "#5fe3e8");
          for (let yy = yt + 4; yy < y - 6; yy += 4) R(g, x, yy, 1, 2, "#f25ca8"); R(g, x - 2, yt + 4, 5, 1, "#f25ca8"); R(g, x - 2, y - 7, 5, 1, "#f25ca8");
          PX.otext(g, "YOU", x, y + 8, { font: "v", size: 14, col: "#e8ffff", align: "center" }); });
      }
      if (t >= tG) { const k = PX.p(t, tG + 0.6, 0.4, "back"); PX.zoom(g, Math.max(0.01, k), px(0.36), (ta(0.36) + sk(0.36)) / 2, () => PX.otext(g, "THE GAP", px(0.36), (ta(0.36) + sk(0.36)) / 2 - 8, { size: 16, col: "#ff8ac8", align: "center" })); }
      // climbers on ropes inside the gap
      if (t >= tC) for (const [u, ph] of [[0.12, 0], [0.24, 1.7], [0.52, 3.1], [0.64, 4.4]]) {
        const x = Math.round(px(u)), yb = sk(u) - 2, yt = ta(u) + 3, k = PX.p(t, tC + ph * 0.1, 0.4, "out"), lenR = (yb - yt) * k;
        R(g, x, yb - lenR, 1, lenR, "#d8c8a0");
        const climb = 0.25 + 0.5 * (0.5 + 0.5 * Math.sin((t - tC) * 1.4 + ph)), cy = Math.round(yb - (yb - yt) * climb * k), st = Math.floor(t * 6 + ph) % 2;
        const CL = ["..s....", "..s..s.", "..hhh.s", "..hhh..", ".bcccb.", ".bbbbb.", ".bbbbb.", "..ccc..", "..p.p..", ".p...p.", ".k...k."];
        if (k > 0.5) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) PX.sprite(g, CL, x - 3 + ox, cy + oy, { h: "#120818", s: "#120818", c: "#120818", b: "#120818", p: "#120818", k: "#120818" }, 1, st === 1);
        if (k > 0.5) PX.sprite(g, ["..s....", "..s..s.", "..hhh.s", "..hhh..", ".bcccb.", ".bbbbb.", ".bbbbb.", "..ccc..", "..p.p..", ".p...p.", ".k...k."], x - 3, cy, { h: "#3a2416", s: "#e0a878", c: "#4a5a8a", b: ["#f7c948", "#3df56b", "#f25ca8", "#ff9a3a"][Math.round(ph) % 4], p: "#5a6080", k: "#1a1a22" }, 1, st === 1);
      }
      // foreground: camera on tripod with REC light
      PX.par(g, c, 1.15, () => {
        PX.line(g, 40, 300, 10, 362, "#1a1c24"); PX.line(g, 41, 300, 11, 362, "#1a1c24"); PX.line(g, 40, 300, 70, 362, "#1a1c24"); PX.line(g, 41, 300, 71, 362, "#1a1c24"); R(g, 38, 290, 5, 70, "#1a1c24");
        rr(g, 8, 262, 60, 30, 4, "#1e2028"); R(g, 8, 262, 60, 1, "#3a3e4c"); rr(g, 64, 268, 18, 18, 4, "#16181e"); PX.circle(g, 73, 277, 6, "#0a0c10"); PX.circle(g, 72, 276, 2, "#3a4a6a");
        if (PX.blink(t, 1.2, 0.6)) { R(g, 14, 266, 4, 4, "#ff3a3a"); G(g, 16, 268, 10, "rgba(255,60,60,0.8)"); }
        PX.text(g, "REC", 22, 264, { font: "v", size: 10, col: "#8a8e9c" });
      });
      PX.particles(g, 71, 30, t, [60, 20, 520, 280], { vy: -2, vx: 1.5, col: "#c8d8ff", a: 0.35 });
      PX.vignette(g, 0.55);
    };
  };

  // ================= doubt =================
  // side view of the coder's room at night: wobbly code with a red X, thought bubble "I'M BAD AT THIS";
  // at o.leave (d*0.6) the coder gets up and walks to the door; at o.opposite (d-0.4) freeze-frame + stamp.
  // side-view person, anchor (x, y) = feet on the floor (or seat point when sitting). dir 1 = facing right.
  const sideFig = (g, x, y, o) => {
    const dir = o.dir || 1, t = o.t || 0, hood = "#2f4a86", hl = "#4466aa", dk = "#22356a", pants = "#2a2e44", skin = "#c98a5a", hair = "#1a120c";
    const F = (dx, dy, w, h, col) => R(g, dir > 0 ? x + dx : x - dx - w, y + dy, w, h, col);   // mirror helper (dx from anchor)
    const sit = o.pose === "sit", ph = o.walk || 0, step = Math.sin(ph), slump = o.slump || 0;
    let hipY;
    if (sit) {
      hipY = -2;
      F(-4, -6, 22, 7, pants); F(-4, -6, 22, 1, sh(pants, 0.2));      // thighs forward
      F(14, 0, 6, 22, pants); F(13, 20, 10, 4, "#15151c");             // shins + shoe
    } else {
      hipY = -28;
      const legs = [[step * 7, sh(pants, -0.2)], [-step * 7, pants]];
      for (const [s, col] of legs) { for (let k = 0; k < 26; k++) { const kk = k / 26, ox = Math.round(s * kk); F(-3 + ox, hipY + k, 6, 1, col); } F(-3 + Math.round(s) - 1, -3, 10, 3, "#15151c"); }
    }
    // torso (hunched by slump)
    const ty = hipY - 26 + Math.round(slump * 3), lean = Math.round(slump * 4);
    for (let r = 0; r < 26; r++) { const k = r / 26, ox = Math.round((1 - k) * lean); F(-8 + ox, ty + r, 15, 1, hood); F(-8 + ox, ty + r, 3, 1, dk); F(5 + ox, ty + r, 2, 1, hl); }
    F(-9 + lean, ty - 1, 13, 4, dk);                                  // hood on the back
    // head
    const hx = lean + 2, hy = ty - 20 + Math.round(slump * 4);
    rr(g, dir > 0 ? x + hx - 8 : x - hx - 10, y + hy, 18, 19, 5, skin);
    F(hx + 9, hy + 9, 2, 3, sh(skin, -0.1));                          // nose
    rr(g, dir > 0 ? x + hx - 9 : x - hx - 9, y + hy - 2, 18, 9, 4, hair); F(hx - 9, hy, 6, 12, hair); F(hx - 3, hy + 6, 3, 4, sh(skin, -0.25));
    F(hx - 1, hy - 1, 7, 1, sh(hair, 0.3));
    const face = o.face || "calm", ey = y + hy + 8, exx = dir > 0 ? x + hx + 4 : x - hx - 6;
    if (face === "sad") { R(g, exx, ey + 1, 2, 2, "#1a1016"); R(g, exx - (dir > 0 ? 1 : -1), ey - 2, 3, 1, hair); R(g, dir > 0 ? x + hx + 3 : x - hx - 7, y + hy + 15, 4, 1, "#1a1016"); R(g, dir > 0 ? x + hx + 2 : x - hx - 3, y + hy + 16, 1, 1, "#1a1016"); }
    else if (face === "calm") { R(g, exx, ey, 2, 3, "#1a1016"); R(g, exx, ey, 1, 1, "#ffffff"); R(g, dir > 0 ? x + hx + 4 : x - hx - 7, y + hy + 15, 3, 1, "#7a4a2a"); }
    else { R(g, exx, ey + 1, 2, 1, "#1a1016"); R(g, dir > 0 ? x + hx + 3 : x - hx - 6, y + hy + 15, 3, 1, "#1a1016"); }
    // arm
    if (sit && o.typing) { const tp = Math.round(Math.sin(t * 20)); F(-2 + lean, ty + 4, 6, 12, hood); F(2 + lean, ty + 14 + tp, 16, 5, hood); F(18 + lean, ty + 14 + tp, 4, 4, skin); }
    else if (sit) { F(-2 + lean, ty + 4, 6, 14, hood); F(2 + lean, ty + 16, 14, 5, hood); F(15 + lean, ty + 16, 4, 4, skin); }
    else { const sw = Math.round(-step * 5); F(-3 + lean, ty + 3, 6, 10, dk); F(-3 + lean + Math.round(sw * 0.5), ty + 12, 6, 10, hood); F(-2 + lean + sw, ty + 21, 4, 4, skin); }
    return { headX: dir > 0 ? x + hx : x - hx, headY: y + hy };
  };
  K.doubt = (o) => {
    const CODE2 = ["def totl(nums):", "  t = 0", "  for i in range(len(nums)+1):", "    t = t + nums[i]", "  retrun t", "print(totl([1,2,3])"];
    return (g, tReal, d, c) => {
      const tLeave = o.leave === undefined ? d * 0.605 : o.leave, tOpp = o.opposite === undefined ? Math.max(0, d - 0.4) : o.opposite, tThink = o.think === undefined ? d * 0.13 : o.think;
      const frozen = tReal >= tOpp, t = Math.min(tReal, tOpp);
      const FL = 300;
      // wall + floor
      wallFloor(g, FL, { w0: "1c2140", w1: "121630", f0: "2a2030", f1: "120e16" });
      for (let x = 0; x < 640; x += 32) R(g, x, 0, 1, FL - 6, "rgba(255,255,255,.025)");
      // window with rain (parallax far)
      PX.par(g, c, 0.55, () => {
        cityWin(g, 300, 70, 120, 96, t, 21);
        for (let i = 0; i < 34; i++) { const r = hr(i + 9), x = 300 + r() * 120, y = 70 + (((r() * 96 + t * 120) % 96) + 96) % 96; R(g, x, y, 1, 4, "rgba(170,200,255,.4)"); }
        R(g, 292, 64, 136, 4, "#3a3050"); R(g, 296, 66, 18, 108, "#5a3a5a"); R(g, 406, 66, 18, 108, "#5a3a5a"); R(g, 296, 66, 2, 108, "#7a5a7a");
        // poster + clock
        R(g, 200, 76, 56, 70, "#2a2848"); R(g, 203, 79, 50, 64, "#3a3060"); PX.text(g, "SHIP", 228, 92, { size: 8, col: "#f25ca8", align: "center" }); PX.text(g, "IT", 228, 104, { size: 8, col: "#5fe3e8", align: "center" }); R(g, 214, 120, 28, 16, "#4a4a8a");
        PX.circle(g, 450, 60, 13, "#3a4060"); PX.circle(g, 450, 60, 11, "#c8c4b8"); PX.line(g, 450, 60, 450 + Math.cos(t * 1.05 - 1.57) * 9, 60 + Math.sin(t * 1.05 - 1.57) * 9, "#c03030"); PX.line(g, 450, 60, 456, 63, "#2a2a34");
      });
      // door (right) + hallway light when open
      const DX = 476, DW = 56, DY = 168;
      const walkStart = tLeave + 0.5, walkEnd = walkStart + Math.max(1.5, (tOpp - walkStart) * 0.75), openT = walkEnd - 0.7;
      const open = PX.p(t, openT, 0.5, "out");
      R(g, DX - 6, DY - 6, DW + 12, FL - DY + 6, "#3a2a24"); R(g, DX - 6, DY - 6, DW + 12, 1, "#5a4434");
      if (open > 0) { PX.vgrad(g, DX, DY, DW, FL - DY, "e8b070", "a86a3a", 5); R(g, DX + 8, DY + 20, 14, FL - DY - 20, "#c08850"); G(g, DX + DW / 2, DY + 70, 140, "rgba(255,190,110,0.5)", open);
        PX.alpha(g, 0.35 * open, () => { for (let k = 0; k < 40; k++) R(g, DX - k * 1.2, FL + k, DW + k * 2.4, 1, "#ffcf8a"); }); }
      const pw = Math.round(DW * (1 - open * 0.85));
      mat(g, DX, DY, pw, FL - DY, "#6a4a36", -1); if (pw > 20) { R(g, DX + 6, DY + 10, pw - 12, 40, "#5a3e2c"); R(g, DX + 6, DY + 60, pw - 12, 60, "#5a3e2c"); R(g, DX + pw - 10, DY + 66, 4, 4, "#d8b860"); }
      // shelf with a sleeping cat above the desk
      PX.par(g, c, 0.8, () => {
        R(g, 56, 110, 120, 5, "#5a3e2b"); R(g, 56, 110, 120, 1, "#7a573d");
        for (let i = 0; i < 6; i++) R(g, 62 + i * 7, 92 + (i % 2) * 2, 6, 18 - (i % 2) * 2, ["#c0392b", "#2980b9", "#27ae60", "#8e44ad", "#d35400", "#16a085"][i]);
        rr(g, 118, 98, 30, 12, 5, "#e08a3c"); R(g, 120, 98, 26, 2, "#f0a85c"); rr(g, 140, 94, 12, 10, 4, "#e08a3c"); R(g, 141, 92, 3, 3, "#e08a3c"); R(g, 148, 92, 3, 3, "#e08a3c");
        R(g, 143, 99, 2, 1, "#3a2010"); R(g, 147, 99, 2, 1, "#3a2010");
        const tail = Math.round(Math.sin(t * 2) * 3); for (let k = 0; k < 10; k++) R(g, 118 - k, 106 - Math.round(Math.sin(k * 0.4) * tail), 2, 2, "#c06a2c");
        if (Math.floor(t * 0.7) % 2 === 0) PX.text(g, "z", 156, 82 - ((t * 6) % 6), { font: "v", size: 12, col: "#a8b0e0" });
      });
      // desk + monitor (screen turned toward us) + lamp
      G(g, 140, 200, 120, "rgba(90,170,255,0.25)");
      R(g, 56, 236, 170, 6, "#6a4a32"); R(g, 56, 236, 170, 1, "#9a7050"); R(g, 62, 242, 6, 58, "#4a3222"); R(g, 214, 242, 6, 58, "#4a3222"); R(g, 64, 250, 60, 30, "#4a3424");
      R(g, 84, 146, 112, 80, "#1a1d24"); R(g, 84, 146, 112, 1, "#3a3f4b"); R(g, 134, 226, 12, 8, "#1a1d24"); R(g, 120, 233, 40, 3, "#22262f");
      const SX = 88, SY = 150, SW2 = 104, SH2 = 72;
      R(g, SX, SY, SW2, SH2, "#0d1117"); R(g, SX, SY, SW2, 8, "#161b22"); PX.text(g, "totl.py", SX + 3, SY - 1, { font: "v", size: 9, col: "#c9d1d9" });
      CODE2.forEach((ln, i) => { const wob = (k) => Math.round(Math.sin(t * 3 + i * 1.3 + k * 0.5) * 1.5);
        for (let k = 0; k < ln.length; k++) PX.text(g, ln[k], SX + 3 + k * 3.4, SY + 10 + i * 9 + wob(k), { font: "v", size: 9, col: i === 4 ? "#ff7b72" : k < 4 && i !== 1 ? "#d2a8ff" : "#c9d1d9" }); });
      for (let x = SX + 6; x < SX + 40; x += 2) R(g, x, SY + 54 + (x % 4 === 0 ? 0 : 1), 1, 1, "#ff5c5c");
      const xs = [[d * 0.06, SX + 74, SY + 30, 16], [d * 0.4, SX + 40, SY + 42, 10], [d * 0.48, SX + 88, SY + 54, 8]];
      for (const [tx, cx, cy, s] of xs) if (t >= tx) { const k = PX.p(t, tx, 0.25, "back"), ss = Math.round(s * k);
        for (let j = -ss; j <= ss; j++) { R(g, cx + j - 1, cy + j - 1, 3, 3, "#ff4d4d"); R(g, cx + j - 1, cy - j - 1, 3, 3, "#ff4d4d"); } G(g, cx, cy, s * 2, "rgba(255,80,80,0.5)"); }
      lampDesk(g, 206, 236, t, "#5a3a4a"); G(g, 204, 206, 70, "rgba(255,190,110,0.35)");
      R(g, 60, 226, 9, 10, "#b8bec9"); R(g, 69, 228, 3, 5, "#b8bec9"); R(g, 60, 226, 9, 2, "#6b4226");
      for (let i = 0; i < 3; i++) { const k = (t * 0.7 + i / 3) % 1; PX.alpha(g, 0.5 * (1 - k), () => R(g, 63 + Math.round(Math.sin(k * 6 + i) * 2), 222 - k * 14, 2, 3, "#c9d1d9")); }
      R(g, 88, 232, 60, 4, "#2b2f38"); for (let k = 0; k < 9; k++) R(g, 90 + k * 6, 233, 5, 1, "#5a6270");
      // rug + waste bin with crumpled attempts
      PX.alpha(g, 0.5, () => { rr(g, 230, 302, 200, 14, 6, "#3a2a4a"); });
      for (let k = 0; k < 3; k++) R(g, 240 + k * 64, 306, 40, 1, "#4a3a5a");
      R(g, 380, 270, 22, 30, "#3a3f4b"); R(g, 380, 270, 22, 2, "#5a6070"); R(g, 380, 270, 2, 30, "#4a505c");
      const balls = [[384, 266], [392, 264], [388, 260], [372, 296], [410, 297], [352, 298], [424, 294]], nB = 3 + Math.min(4, Math.floor(t / (d * 0.12)));
      balls.slice(0, nB).forEach(([bx, by], i) => { PX.circle(g, bx, by, 3, "#a8a49a"); R(g, bx - 2, by - 2, 2, 1, "#c8c4b8"); R(g, bx, by, 2, 1, "#7a776e"); });
      // chair (stays) + coder
      const standing = t >= tLeave, upK = PX.p(t, tLeave, 0.45, "back");
      const chairX = 262 + (standing ? Math.round(PX.p(t, tLeave, 0.6, "out") * 10) : 0);
      R(g, chairX + 10, 196, 6, 50, "#23262e"); R(g, chairX + 10, 196, 6, 2, "#3a3f4b"); R(g, chairX - 14, 244, 32, 6, "#2d313a"); R(g, chairX - 14, 244, 32, 1, "#4a505c");
      R(g, chairX, 250, 3, 36, "#1a1c22"); R(g, chairX - 16, 286, 36, 3, "#1a1c22"); PX.circle(g, chairX - 14, 291, 2, "#111"); PX.circle(g, chairX + 18, 291, 2, "#111");
      let cx = 252, slump = PX.clamp((t - tThink - 1.6) / 1.2, 0, 1) * (standing ? 0 : 1);
      if (!standing) sideFig(g, cx, 244, { pose: "sit", dir: -1, t, typing: t < tThink + 1.2 || (t > d * 0.38 && t < d * 0.47), face: t > d * 0.06 ? "sad" : "calm", slump });
      else {
        const k = PX.clamp((t - walkStart) / (walkEnd - walkStart), 0, 1), wx = PX.lerp(cx + 6, DX + DW / 2 - 4, k) + (t > walkEnd ? Math.min(14, (t - walkEnd) * 16) : 0);
        const walking = t > walkStart, ph = walking ? (t - walkStart) * 9 : 0;
        if (upK < 1 && !walking) sideFig(g, cx + 6, FL - Math.round((1 - upK) * 30) * 0, { pose: "stand", dir: 1, t, face: "sad", slump: 0.6 * (1 - upK) + 0.4 });
        else sideFig(g, wx, FL - (walking && Math.sin(ph) > 0.7 ? 1 : 0), { pose: "stand", dir: 1, t, walk: ph, face: "sad", slump: 0.4 });
        if (open > 0.3 && wx > DX - 20) G(g, wx, FL - 50, 30, "rgba(255,200,130,0.35)");
      }
      // thought bubble
      if (t >= tThink && t < tLeave) { const k = PX.p(t, tThink, 0.4, "back"), bx = 300, by = 120;
        PX.zoom(g, Math.max(0.01, k), 262, 190, () => {
          PX.circle(g, 262, 196, 3, "#b4bccb"); PX.circle(g, 272, 182, 5, "#b4bccb");
          rr(g, bx - 56, by - 20, 132, 40, 14, "#b4bccb"); PX.circle(g, bx - 40, by - 18, 14, "#b4bccb"); PX.circle(g, bx + 50, by - 16, 14, "#b4bccb"); PX.circle(g, bx + 6, by - 22, 16, "#b4bccb");
          R(g, bx - 42, by + 16, 110, 2, "#a8b0c0");
          PX.text(g, "I'M BAD AT THIS", bx + 10, by - 6, { size: 8, col: "#2a2034", align: "center" }); }); }
      // sigh puff
      if (t > d * 0.5 && t < d * 0.58) { const k = (t - d * 0.5) / (d * 0.08); PX.alpha(g, 1 - k, () => { PX.circle(g, 226 - k * 16, 196 - k * 8, 3 + Math.round(k * 4), "#a8b0c8"); PX.text(g, "haah", 214 - k * 16, 178 - k * 10, { font: "v", size: 12, col: "#a8b0c8", align: "center" }); }); }
      PX.particles(g, 81, 18, t, [160, 160, 120, 100], { vy: -2, vx: 1, col: "#ffe2b0", a: 0.5 });
      PX.vignette(g, 0.55);
      // freeze-frame: desaturate, flash, stamp
      if (frozen) {
        const op = g.globalCompositeOperation; g.globalCompositeOperation = "saturation"; g.fillStyle = "#808080"; PX.alpha(g, 0.85, () => g.fillRect(0, 0, 640, 360)); g.globalCompositeOperation = op;
        PX.alpha(g, 0.25, () => R(g, 0, 0, 640, 360, "#2a2010"));
        if (tReal - tOpp < 0.12) PX.alpha(g, 0.6 * (1 - (tReal - tOpp) / 0.12), () => R(g, 0, 0, 640, 360, "#ffffff"));
        for (const [x0, y0, sx, sy] of [[8, 8, 1, 1], [632, 8, -1, 1], [8, 352, 1, -1], [632, 352, -1, -1]]) { R(g, sx > 0 ? x0 : x0 - 20, y0 - (sy > 0 ? 0 : 1), 20, 2, "#e8e4d8"); R(g, x0 - (sx > 0 ? 0 : 1), sy > 0 ? y0 : y0 - 20, 2, 20, "#e8e4d8"); }
        const sh2 = tReal - tOpp < 0.3 ? shake(tReal, tOpp + 0.18, 0.25, 4) : 0;
        stamp(g, tReal, tOpp + 0.06, "IT MEANS THE OPPOSITE", 320 + sh2, 150, { size: 16, ang: -0.08 });
      }
    };
  };

  // ================= books_24h =================
  // bookstore shelf under warm pendant lights: three face-out "learn it fast" books; at o.stamp (2.5) a red
  // "NOPE" stamp slams across them. o.titles: 3 arrays of title lines.
  const spineRow = (g, x0, x1, yb, hmin, hmax, seed, dim) => {
    const r = hr(seed), cols = ["#7a2e2e", "#2e4a7a", "#2e6a4a", "#6a4a2a", "#5a2e6a", "#7a6a2e", "#2e5a6a", "#4a4a5a", "#8a4a2e"];
    let x = x0;
    while (x < x1) {
      const w = 6 + Math.floor(r() * 8), h = hmin + Math.floor(r() * (hmax - hmin)), col = sh(cols[Math.floor(r() * cols.length)], dim || 0), lean = r() < 0.06;
      if (x + w > x1) break;
      R(g, x, yb - h, w, h, col); R(g, x, yb - h, 1, h, sh(col, 0.25)); R(g, x + w - 1, yb - h, 1, h, sh(col, -0.35));
      R(g, x + 1, yb - h + 4, w - 2, 2, sh(col, 0.35)); R(g, x + 1, yb - 8, w - 2, 2, sh(col, 0.35));
      for (let k = 0; k < 3; k++) R(g, x + Math.floor(w / 2) - 1, yb - h + 10 + k * 4, 2, 2, sh(col, 0.45));
      x += w + (lean ? 3 : 0) + (r() < 0.1 ? 1 : 0);
    }
  };
  K.books_24h = (o) => {
    const titles = o.titles || [["C++", "IN 24", "HOURS"], ["PYTHON", "IN A", "DAY"], ["AI IN A", "WEEK-", "END"]];
    return (g, t, d, c) => {
      const tSt = o.stamp === undefined ? Math.min(2.5, d * 0.44) : o.stamp, hit = t >= tSt + 0.18;
      const skx = shake(t, tSt + 0.18, 0.35, 4);
      g.save(); g.translate(skx, Math.abs(skx) > 2 ? 1 : 0);
      // back of the store: far shelves (dim) + wall
      PX.vgrad(g, -10, -10, 660, 380, "1a1420", "0e0a12", 6);
      PX.par(g, c, 0.4, () => {
        for (let row = 0; row < 3; row++) { const yb = 60 + row * 70; R(g, -10, yb, 660, 4, "#2a1e18"); spineRow(g, -10, 650, yb, 24, 40, 50 + row, -0.55); }
      });
      // pendant lamps
      const sway = Math.sin(t * 1.3) * 2;
      for (const lx of [180, 460]) { const x = lx + sway; R(g, lx, -10, 1, 34, "#2a2420"); rr(g, x - 16, 22, 32, 14, 6, "#2a3a30"); R(g, x - 16, 22, 32, 1, "#4a6a54"); R(g, x - 12, 35, 24, 2, "#ffe0a0");
        G(g, x, 40, 34, "rgba(255,225,160,0.8)"); G(g, x, 130, 190, "rgba(255,180,100,0.32)"); }
      // main bookshelf
      R(g, 0, 50, 640, 260, "#3a2618");
      for (const yb of [86, 222, 300]) { R(g, 0, yb, 640, 8, "#6a4630"); R(g, 0, yb, 640, 1, "#9a6e4a"); R(g, 0, yb + 8, 640, 3, "#24160e"); }
      R(g, 0, 50, 640, 3, "#24160e");
      spineRow(g, 6, 634, 86, 26, 34, 11, -0.6);
      spineRow(g, 6, 136, 222, 70, 110, 12, -0.55); spineRow(g, 504, 634, 222, 70, 110, 13, -0.55);
      spineRow(g, 6, 634, 300, 48, 72, 14, -0.6);
      // shelf price-tag strip
      for (let x = 20; x < 640; x += 64) { R(g, x, 223, 22, 7, "#d8c890"); R(g, x + 2, 225, 10, 1, "#6a5a3a"); }
      // light falloff toward the shelf ends (lamps light the centre)
      { const gr = g.createLinearGradient(0, 0, 640, 0); gr.addColorStop(0, "rgba(5,3,8,0.55)"); gr.addColorStop(0.25, "rgba(5,3,8,0)"); gr.addColorStop(0.75, "rgba(5,3,8,0)"); gr.addColorStop(1, "rgba(5,3,8,0.55)"); g.fillStyle = gr; g.fillRect(-10, 0, 660, 360); }
      // featured books (face out)
      const art = (i, x, y) => {
        if (i === 0) { PX.circle(g, x, y, 13, "#c8d0e0"); PX.circle(g, x, y, 11, "#2a4a8a"); for (let k = 0; k < 12; k++) R(g, x + Math.cos(k * 0.52) * 9, y + Math.sin(k * 0.52) * 9, 1, 1, "#c8d0e0");
          const a = t * 6; PX.line(g, x, y, x + Math.cos(a) * 8, y + Math.sin(a) * 8, "#f7c948"); PX.line(g, x, y, x + 5, y - 2, "#c8d0e0"); }
        else if (i === 1) { for (let k = 0; k < 30; k++) { const xx = x - 15 + k, yy = y + Math.round(Math.sin(k * 0.35 + t * 3) * 5); R(g, xx, yy, 2, 4, k % 4 < 2 ? "#f7c948" : "#d8a830"); } R(g, x + 15, y - 2, 5, 5, "#f7c948"); R(g, x + 17, y - 1, 1, 1, "#1a1a1a"); R(g, x + 20, y + 1, 3, 1, "#ff5c5c"); }
        else { rr(g, x - 12, y - 10, 24, 20, 4, "#9aa4c0"); R(g, x - 7, y - 4, 5, 4, "#5fe3e8"); R(g, x + 3, y - 4, 5, 4, "#5fe3e8"); R(g, x - 5, y + 4, 10, 2, "#3a4060"); R(g, x - 1, y - 16, 2, 6, "#9aa4c0"); PX.circle(g, x, y - 17, 2, PX.blink(t, 0.5) ? "#ff5c5c" : "#7a2a2a"); }
      };
      const covers = [["#2a4a8a", 0], ["#2e6a3a", 1], ["#5a2a7a", 2]];
      covers.forEach(([col, i]) => {
        const cx = 196 + i * 124, cy = 158, w = 100, h = 124, bob = 0;
        R(g, cx - w / 2 + 4, cy + h / 2 - 2, w, 4, "#1a100a");                                    // shadow on shelf
        R(g, cx - w / 2 - 4, cy - h / 2 + 4, 4, h - 2, sh(col, -0.45));                            // spine depth
        R(g, cx - w / 2, cy - h / 2 + bob, w, h, col); R(g, cx - w / 2, cy - h / 2, w, 1, sh(col, 0.35)); R(g, cx - w / 2, cy - h / 2, 1, h, sh(col, 0.2)); R(g, cx + w / 2 - 2, cy - h / 2, 2, h, sh(col, -0.3));
        R(g, cx - w / 2 + 6, cy - h / 2 + 6, w - 12, 2, "#e8c870"); R(g, cx - w / 2 + 6, cy + h / 2 - 8, w - 12, 2, "#e8c870");
        titles[i].forEach((ln, k) => PX.text(g, ln, cx, cy - h / 2 + 14 + k * 12, { size: 8, col: "#efe4c8", align: "center" }));
        art(i, cx, cy + 22);
        PX.text(g, "MASTER IT FAST!", cx, cy + h / 2 - 22, { font: "v", size: 11, col: "#e8c870", align: "center" });
        // bestseller seal
        const sx = cx + w / 2 - 12, sy = cy - h / 2 + 46; PX.circle(g, sx, sy, 10, "#d8a830"); PX.circle(g, sx, sy, 8, "#f7c948"); for (let k = 0; k < 10; k++) R(g, sx + Math.cos(k * 0.63) * 10, sy + Math.sin(k * 0.63) * 10, 2, 2, "#d8a830");
        PX.text(g, "#1", sx, sy - 4, { font: "v", size: 10, col: "#5a3a10", align: "center" });
        // promo shine sweep before the stamp
        if (!hit) { const k = ((t * 0.6 + i * 0.3) % 1.6) - 0.3; if (k > 0 && k < 1) PX.alpha(g, 0.18, () => { for (let yy = 0; yy < h; yy++) R(g, cx - w / 2 + k * (w + 40) - 20 - yy * 0.3, cy - h / 2 + yy, 6, 1, "#ffffff"); }); }
        // little acrylic stand
        R(g, cx - 20, cy + h / 2 - 2, 40, 2, "#8a9aaa");
        if (hit) PX.alpha(g, 0.25, () => R(g, cx - w / 2, cy - h / 2, w, h, "#1a0a0a"));
      });
      // hanging sign
      PX.par(g, c, 0.9, () => { R(g, 300, 0, 1, 14, "#4a3a2a"); R(g, 340, 0, 1, 14, "#4a3a2a"); rr(g, 282, 12, 76, 22, 3, "#1e2a24"); R(g, 284, 14, 72, 18, "#24322a");
        PX.text(g, "LEARN FAST", 320, 15, { font: "v", size: 14, col: "#d8e0c8", align: "center" }); });
      // foreground: table with stacked books (spines facing us)
      PX.par(g, c, 1.15, () => {
        R(g, -20, 312, 680, 60, "#4a3020"); R(g, -20, 312, 680, 2, "#7a5438");
        const stack = [[40, "#6a2e2e", 120], [46, "#2e4a6a", 108], [36, "#4a6a2e", 116]];
        let y = 312; stack.forEach(([hh, col, w], k) => { const x = 30 + k * 4; y -= 12; R(g, x, y, w, 12, col); R(g, x, y, w, 1, sh(col, 0.3)); R(g, x + 6, y + 4, w - 30, 3, sh(col, 0.4)); });
        y = 312; [["#5a2e6a", 130], ["#7a5a2a", 120]].forEach(([col, w], k) => { const x = 490 + k * 6; y -= 13; R(g, x, y, w, 13, col); R(g, x, y, w, 1, sh(col, 0.3)); R(g, x + 8, y + 5, w - 40, 3, sh(col, 0.4)); });
        rr(g, 260, 302, 120, 12, 3, "#c8b890"); PX.text(g, "ALL 50% OFF", 320, 302, { font: "v", size: 12, col: "#5a3a1a", align: "center" });
      });
      PX.particles(g, 91, 30, t, [100, 40, 440, 200], { vy: -2, vx: 1, col: "#ffe2b0", a: 0.6 });
      // NOPE stamp
      if (t >= tSt) {
        stamp(g, t, tSt, "NOPE", 320, 180, { size: 48, ang: -0.07 });
        if (hit && t < tSt + 0.8) { const k = (t - tSt - 0.18) / 0.62; for (let i = 0; i < 14; i++) { const a = i * 0.45, rr2 = 70 + k * 90; PX.alpha(g, 1 - k, () => R(g, 320 + Math.cos(a) * rr2 * 1.6, 180 + Math.sin(a) * rr2 * 0.7, 3, 3, "#e8453c")); } }
      }
      g.restore();
      PX.vignette(g, 0.55);
    };
  };

  // ================= long_road =================
  // a long winding road through hills to a sunrise; milestones YEAR 1..YEAR 10 recede; a calm walker with a
  // backpack (from behind); birds; label at o.free (3.0) "NOBODY EXPECTS GREAT BY NEXT MONTH" (o.text: 2 lines).
  K.long_road = (o) => {
    const HZ = 176, lines = o.text || ["NOBODY EXPECTS GREAT", "BY NEXT MONTH"];
    const cxp = (p) => 320 + 110 * (1 - p) * (1 - p) * Math.sin(3.2 * (1 - p)) - 30 * (1 - p);
    return (g, t, d, c) => {
      const tF = o.free === undefined ? Math.min(3.0, d * 0.35) : o.free;
      const sunY = 186 - 22 * PX.ease(t / d, "out");
      // sky
      PX.vgrad(g, 0, 0, 640, 60, "0c1030", "1c1a48", 4); PX.vgrad(g, 0, 60, 640, 60, "1c1a48", "4a2a6a", 5); PX.vgrad(g, 0, 120, 640, 60, "4a2a6a", "c8607a", 6);
      PX.vgrad(g, 0, 150, 640, 30, "c8607a", "f0a060", 4);
      const r = PX.rnd(14); for (let i = 0; i < 50; i++) { const x = r() * 640, y = r() * 90; PX.alpha(g, (1 - y / 90) * (0.4 + 0.6 * Math.abs(Math.sin(t + i))) * (1 - t / d * 0.6), () => R(g, x, y, 1, 1, "#e8ecff")); }
      // sun (behind the far hills) + glow
      PX.par(g, c, 0.15, () => {
        G(g, 320, sunY, 260, "rgba(255,170,90,0.45)"); G(g, 320, sunY, 90, "rgba(255,220,150,0.6)");
        PX.circle(g, 320, sunY, 24, "#ffc070"); PX.circle(g, 320, sunY, 20, "#ffd890");
        for (let k = 0; k < 4; k++) R(g, 296, sunY + 6 + k * 5, 48, 1 + (k >> 1), "#f09060");
        // clouds lit from below
        for (const [cx0, cy, w, sp] of [[80, 70, 70, 3], [430, 52, 90, 2], [250, 100, 60, 4], [560, 112, 50, 3]]) { const x = ((cx0 + t * sp) % 760) - 60;
          rr(g, x, cy, w, 10, 5, "#5a3a72"); rr(g, x + 10, cy - 6, w * 0.5, 10, 5, "#5a3a72"); R(g, x + 4, cy + 8, w - 8, 2, "#f0907a"); R(g, x + 12, cy - 6, w * 0.3, 1, "#8a5a8a"); }
      });
      // hills: 3 layers with sunrise rim light
      const hill = (depth, base, amp, f, ph, col, rim) => PX.par(g, c, depth, () => { for (let x = -30; x < 670; x += 2) { const h = amp * (0.6 + 0.4 * Math.sin(x * f + ph)) + amp * 0.3 * Math.sin(x * f * 2.7 + ph * 2); const y = base - h; R(g, x, y, 2, 380 - y, col); R(g, x, y, 2, 1, rim); } });
      hill(0.3, 182, 22, 0.012, 1, "#5a3a6a", "#e89a7a");
      hill(0.5, 196, 26, 0.017, 3, "#3a2a52", "#c87a6a");
      // trees on the mid hill
      PX.par(g, c, 0.5, () => { for (let i = 0; i < 12; i++) { const x = 20 + i * 55 + ((i * 23) % 30), y = 190 - 14 * Math.abs(Math.sin(x * 0.017 + 3)); R(g, x, y - 10, 2, 10, "#2a1e3a"); PX.circle(g, x + 1, y - 13, 5, "#2e2448"); R(g, x - 2, y - 17, 4, 1, "#a86a6a"); } });
      // ground plane with the road (pseudo-3D rows), bands scroll as the walker advances
      const speed = 1.1;
      for (let y = HZ + 1; y < 360; y++) {
        const p = (y - HZ) / (360 - HZ), z = 1 / p, band = Math.floor(z * 2.2 + t * speed) % 2;
        const fog = 1 - Math.min(1, p * 3);
        const gcol = band ? "#24382c" : "#203226", rcol = band ? "#3e3a4a" : "#383444";
        R(g, 0, y, 640, 1, gcol);
        const cx = cxp(p), w = 4 + 230 * p;
        R(g, cx - w, y, w * 2, 1, rcol);
        R(g, cx - w, y, Math.max(1, w * 0.04), 1, "#7a7088"); R(g, cx + w - Math.max(1, w * 0.04), y, Math.max(1, w * 0.04), 1, "#7a7088");
        if (band) R(g, cx - Math.max(1, w * 0.02), y, Math.max(1, w * 0.04), 1, "#d8c070");
        if (fog > 0) PX.alpha(g, fog * 0.6, () => R(g, 0, y, 640, 1, "#a86a7a"));
      }
      // milestones receding
      const ms = [];
      for (let i = 0; i < 10; i++) { const z = 1.7 + i * 1.45 - t * 0.12, p = 1 / z; if (p > 0.95 || p < 0.03) continue; ms.push([i, p]); }
      ms.sort((a, b) => a[1] - b[1]).forEach(([i, p]) => {
        const y = HZ + p * (360 - HZ), side = i % 2 ? 1 : -1, w = 4 + 230 * p, x = cxp(p) + side * (w + 8 + 30 * p);
        const ph = Math.max(3, Math.round(70 * p)), pw = Math.max(1, Math.round(5 * p));
        R(g, x - pw / 2, y - ph, pw, ph, "#5a4a3a"); R(g, x - pw / 2, y - ph, 1, ph, "#c8906a");
        const sw = Math.max(4, Math.round(110 * p)), shh = Math.max(2, Math.round(34 * p));
        R(g, x - sw / 2, y - ph - shh, sw, shh, "#2a5a3a"); R(g, x - sw / 2, y - ph - shh, sw, 1, "#e8a87a"); PX.box(g, x - sw / 2, y - ph - shh, sw, shh, "#d8d0b0");
        const label = `YEAR ${i + 1}`;
        const fit = [[{ size: 8 }, 8], [{ font: "v", size: 16 }, 12], [{ font: "v", size: 12 }, 9], [{ font: "v", size: 10 }, 7]].find(([f, hgt]) => PX.tw(g, label, f) <= sw - 4 && hgt <= shh);
        if (fit) PX.text(g, label, x, y - ph - shh + Math.round((shh - fit[1]) / 2) - (fit[0].font ? 2 : 0), { ...fit[0], col: "#e8e0c8", align: "center" });
        else if (sw > 6) R(g, x - sw / 2 + 2, y - ph - shh / 2, sw - 4, 1, "#c8c0a0");
      });
      // walker (from behind) on the road
      const wp = 0.74, wy = HZ + wp * (360 - HZ), wx = Math.round(cxp(wp) - 30), ph = t * 5.5, bob = Math.sin(ph * 2) > 0 ? 1 : 0, lg = Math.round(Math.sin(ph) * 3);
      PX.alpha(g, 0.35, () => rr(g, wx - 12, wy - 2, 24, 5, 2, "#0a0a14"));
      R(g, wx - 6, wy - 22 + lg * 0, 5, 20 - Math.max(0, lg), "#2a3048"); R(g, wx + 1, wy - 22, 5, 20 - Math.max(0, -lg), "#2a3048");
      R(g, wx - 7, wy - 3 - Math.max(0, lg), 7, 3, "#1a1a20"); R(g, wx, wy - 3 - Math.max(0, -lg), 7, 3, "#1a1a20");
      const by = wy - 50 - bob;
      R(g, wx - 9, by + 8, 18, 22, "#3a6a8a"); R(g, wx - 9, by + 8, 18, 1, "#f0a878");   // jacket + rim light
      R(g, wx - 12, by + 10 - lg, 4, 16, "#3a6a8a"); R(g, wx + 8, by + 10 + lg, 4, 16, "#2e5470"); R(g, wx - 12, by + 25 - lg, 4, 3, "#c98a5a"); R(g, wx + 8, by + 25 + lg, 4, 3, "#c98a5a");
      rr(g, wx - 8, by + 6, 16, 22, 3, "#8a5a3a"); R(g, wx - 8, by + 6, 16, 2, "#e8a070"); R(g, wx - 6, by + 14, 12, 8, "#7a4a2e"); R(g, wx - 2, by + 16, 4, 2, "#c8a050");
      rr(g, wx - 9, by + 2, 18, 6, 3, "#6a8a5a"); R(g, wx - 9, by + 2, 18, 1, "#c8d0a0");                      // bedroll
      PX.circle(g, wx, by - 4, 7, "#2a1a12"); R(g, wx - 5, by - 10, 10, 1, "#e89a6a"); R(g, wx - 8, by - 5, 2, 4, "#c98a5a"); R(g, wx + 6, by - 5, 2, 4, "#c98a5a");
      // birds
      for (let i = 0; i < 6; i++) { const x = ((i * 70 + t * (14 + i * 2)) % 760) - 60, y = 60 + i * 9 + Math.sin(t * 1.5 + i) * 4, up = Math.sin(t * 8 + i * 1.3) > 0;
        R(g, x, y, 1, 1, "#2a1e3a"); if (up) { R(g, x - 3, y - 2, 3, 1, "#2a1e3a"); R(g, x + 1, y - 2, 3, 1, "#2a1e3a"); } else { R(g, x - 3, y, 3, 1, "#2a1e3a"); R(g, x + 1, y, 3, 1, "#2a1e3a"); R(g, x - 4, y + 1, 1, 1, "#2a1e3a"); R(g, x + 4, y + 1, 1, 1, "#2a1e3a"); } }
      // foreground grass + flowers
      PX.par(g, c, 1.15, () => {
        for (let i = 0; i < 70; i++) { const rr2 = hr(i + 300), x = rr2() * 680 - 20, side = Math.abs(x - 320) > 150; if (!side) continue; const h = 8 + rr2() * 18, sw = Math.sin(t * 1.8 + x * 0.05) * 2;
          for (let k = 0; k < h; k++) R(g, x + Math.round(sw * (k / h)), 360 - k, 1, 1, k > h - 3 ? "#5a8a4a" : "#2a4a30"); if (rr2() < 0.2) { R(g, x + sw - 1, 360 - h - 2, 3, 3, ["#f25ca8", "#f7c948", "#e8e0f0"][i % 3]); } }
      });
      PX.particles(g, 101, 26, t, [100, 100, 440, 150], { vy: -2, vx: 2, col: "#ffd8a0", a: 0.5 });
      if (t >= tF) { const k = PX.p(t, tF, 0.6, "out");
        PX.alpha(g, k, () => { PX.otext(g, lines[0], 320, 34 - (1 - k) * 6, { size: 16, col: "#ffe0b0", align: "center" }); if (lines[1]) PX.otext(g, lines[1], 320, 56 - (1 - k) * 6, { size: 16, col: "#f7c948", align: "center" }); }); }
      PX.vignette(g, 0.45);
    };
  };

  // @@KINDS-END
})();
