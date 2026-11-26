/* EP2 Builder B scenes: gauge, recog, test, waiting, goldilocks, eighty, projects_ladder, academy, practice_rooms.
   Full illustrated environments, native-resolution characters (LB.person), 3 depth layers, glow + vignette. */
(function () {
  const { K } = PX;
  const R = PX.rect, cl = PX.clamp, lerp = PX.lerp;
  const LB = (PX.learn = {});

  // ---------- helpers ----------
  // option time with default scaled to shot length (def given for typical length typ)
  const T = (o, k, def, d, typ) => (o[k] !== undefined ? o[k] : Array.isArray(def) ? def.map((v) => (v * d) / typ) : (def * d) / typ);
  // colour shade: f < 1 darker, f > 1 toward white
  const SH = {};
  const sh = (LB.sh = (hex, f) => {
    const k = hex + f; if (SH[k]) return SH[k];
    const n = parseInt(hex.slice(1), 16), m = (v) => Math.round(f < 1 ? v * f : v + (255 - v) * (f - 1));
    return (SH[k] = "#" + [m(n >> 16), m((n >> 8) & 255), m(n & 255)].map((v) => Math.min(255, v).toString(16).padStart(2, "0")).join(""));
  });
  const frac = (x) => x - Math.floor(x);
  // thick limb by stamping squares along a line (dark offset = shade)
  const limb = (LB.limb = (g, x1, y1, x2, y2, w, col, dark) => {
    const n = Math.max(1, Math.round(Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1))));
    const o = Math.floor(w / 2);
    if (dark) for (let i = 0; i <= n; i++) R(g, Math.round(x1 + ((x2 - x1) * i) / n) - o + 1, Math.round(y1 + ((y2 - y1) * i) / n) - o + 1, w, w, dark);
    for (let i = 0; i <= n; i++) R(g, Math.round(x1 + ((x2 - x1) * i) / n) - o, Math.round(y1 + ((y2 - y1) * i) / n) - o, w, w, col);
  });
  const ell = (LB.ell = (g, cx, cy, rx, ry, col) => {
    g.fillStyle = col;
    for (let y = -ry; y <= ry; y++) { const w = Math.round(rx * Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry)))); g.fillRect(Math.round(cx - w), Math.round(cy + y), 2 * w + 1, 1); }
  });
  // additive light cone made of 1px rows (crisp pixel edges)
  const cone = (LB.cone = (g, x, y, w0, w1, h, col, a) => {
    const op = g.globalCompositeOperation, oa = g.globalAlpha; g.globalCompositeOperation = "lighter";
    for (let i = 0; i < h; i++) {
      const k = i / h, w = w0 + (w1 - w0) * k;
      g.globalAlpha = oa * a * 0.5 * (1 - k * 0.55); R(g, x - w / 2, y + i, w, 1, col);
      g.globalAlpha = oa * a * 0.5 * (1 - k * 0.7); R(g, x - w * 0.36, y + i, w * 0.72, 1, col);
    }
    g.globalAlpha = oa; g.globalCompositeOperation = op;
  });
  const star4 = (LB.star4 = (g, x, y, r, col) => {
    R(g, x, y - r, 1, 2 * r + 1, col); R(g, x - r, y, 2 * r + 1, 1, col);
    if (r > 2) { R(g, x - 1, y - 1, 3, 3, col); }
  });
  const DROP = [".c.", "cwc", "ccd", ".d."];
  const drop = (LB.drop = (g, x, y) => PX.sprite(g, DROP, x, y, { c: "#7fd0ff", w: "#e6f8ff", d: "#3f8fc8" }));
  // sweat drops flying off a head at (x, y), cycle
  const sweat = (LB.sweat = (g, x, y, t, n, seed) => {
    const r = PX.rnd(seed || 5);
    for (let i = 0; i < (n || 2); i++) {
      const ph = r(), side = r() < 0.5 ? -1 : 1, k = frac(t * 0.9 + ph);
      drop(g, x + side * (6 + k * 10), y + k * k * 22 - 4);
    }
  });
  // shadow blob
  const shadow = (g, cx, cy, rx, a) => PX.alpha(g, a === undefined ? 0.45 : a, () => ell(g, cx, cy, rx, Math.max(1, Math.round(rx / 4)), "#000000"));

  // offscreen buffer for 1px dark outlines around characters (draw fn into buffer, stamp silhouette 4x, then art)
  let BUF = null, SIL = null;
  const outlined = (LB.outlined = (g, fn, col) => {
    if (!BUF) { BUF = document.createElement("canvas"); BUF.width = 640; BUF.height = 360; SIL = document.createElement("canvas"); SIL.width = 640; SIL.height = 360; }
    const b = BUF.getContext("2d"), s = SIL.getContext("2d");
    b.setTransform(1, 0, 0, 1, 0, 0); b.clearRect(0, 0, 640, 360); b.globalAlpha = 1;
    const res = fn(b);
    s.globalCompositeOperation = "source-over"; s.clearRect(0, 0, 640, 360); s.drawImage(BUF, 0, 0);
    s.globalCompositeOperation = "source-in"; s.fillStyle = col || "#120e1c"; s.fillRect(0, 0, 640, 360); s.globalCompositeOperation = "source-over";
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) g.drawImage(SIL, dx, dy);
    g.drawImage(BUF, 0, 0);
    return res;
  });

  /* Front-facing person, native resolution, outlined. (x, y) = feet centre (standing) or hip line (o.seated).
     o: h (height, 40-110), skin, hair, shirt, pants, shoe, hairStyle "short"|"long"|"bun"|"spiky"|"bald",
     face "neutral"|"happy"|"smug"|"sweat"|"yawn"|"strain"|"focus"|"shock"|"flat"|"closed"|"sad",
     al / ar = hand offset from shoulder [dx,dy] or [[elbow],[hand]], lit = 1 (light from right) | -1,
     look = eye dx, legs = [ldx, rdx] foot offsets, seated, floor (seated feet y), red = face redness 0..1,
     bob, noLegs, outline (false = none). returns {hl, hr, hx, hy, hw, hh, ty, hip, tw, ey} */
  const personRaw = (g, x, y, o) => {
    const h = o.h || 60, lit = o.lit || 1;
    const skin = o.skin || "#e0a878", hair = o.hair || "#3a2416", shirt = o.shirt || "#3f6fd0", pants = o.pants || "#2d3550", shoe = o.shoe || "#1c1c26";
    const hh = Math.round(h * 0.3), hw = 2 * Math.round(hh * 0.48), th = Math.round(h * 0.28), tw = 2 * Math.round(h * 0.145);
    const nk = Math.max(1, Math.round(h * 0.03)), legH = h - hh - nk - th;
    const bob = Math.round(o.bob || 0);
    const hip = o.seated ? y : y - legH;
    const ty = hip - th + bob, hy = ty - nk - hh;
    x = Math.round(x);
    const lw = tw / 2 - 1, aw = Math.max(3, Math.round(h * 0.08));
    // legs
    if (o.noLegs) { /* hidden behind something */ }
    else if (o.seated) {
      const fl = o.floor !== undefined ? o.floor : hip + Math.round(legH * 0.7);
      R(g, x - tw / 2, hip, tw, 4, sh(pants, 1.1)); R(g, x - tw / 2, hip, tw, 1, sh(pants, 1.3));
      for (const s of [-1, 1]) { const lx = s < 0 ? x - tw / 2 + 1 : x + 1; R(g, lx, hip + 4, lw, fl - hip - 6, pants); R(g, s * lit < 0 ? lx : lx + lw - 1, hip + 4, 1, fl - hip - 6, sh(pants, 0.7));
        R(g, lx - 1, fl - 3, lw + 2, 3, shoe); R(g, lx - 1, fl - 3, lw + 2, 1, sh(shoe, 1.6)); }
    } else {
      const lg = o.legs || [0, 0];
      for (const s of [-1, 1]) {
        const hx0 = x + s * Math.round(tw / 4), fx = hx0 + (s < 0 ? lg[0] : lg[1]);
        limb(g, hx0, hip + 1, fx, y - 3, lw, pants, sh(pants, 0.68));
        const sx = fx - Math.ceil(lw / 2) - (s < 0 ? 1 : 0);
        R(g, sx, y - 3, lw + 1, 3, shoe); R(g, sx + (s < 0 ? -1 : 1), y - 2, lw + 1, 2, shoe); R(g, sx, y - 3, lw + 1, 1, sh(shoe, 1.7));
      }
      R(g, x - tw / 2 + 1, hip - 1 + bob, tw - 2, 3, sh(pants, 0.9));
    }
    const shL = [x - tw / 2 + 1, ty + 2], shR = [x + tw / 2 - 2, ty + 2];
    // torso: rounded shoulders, side shade, light edge, hem
    for (let r = 0; r < th; r++) {
      const w = tw - (r === 0 ? 4 : r === 1 ? 2 : 0) - Math.round((2 * r) / th);
      const lx = x - Math.floor(w / 2);
      R(g, lx, ty + r, w, 1, shirt);
      R(g, lit > 0 ? lx : lx + w - 3, ty + r, 3, 1, sh(shirt, 0.72));
      R(g, lit > 0 ? lx + w - 1 : lx, ty + r, 1, 1, sh(shirt, 1.3));
    }
    R(g, x - tw / 2 + 3, ty, tw - 6, 1, sh(shirt, 1.25));
    R(g, x - tw / 2 + 2, ty + th - 2, tw - 4, 2, sh(shirt, 0.8));
    if (o.stripe) R(g, x - tw / 2 + 1, ty + Math.round(th * 0.4), tw - 2, Math.max(1, Math.round(h / 40)), o.stripe);
    const top = o.top || "hoodie";
    if (top === "hoodie") {
      R(g, x - Math.round(tw / 4), ty + Math.round(th * 0.58), Math.round(tw / 2), Math.round(th * 0.28), sh(shirt, 0.84)); R(g, x - Math.round(tw / 4), ty + Math.round(th * 0.58), Math.round(tw / 2), 1, sh(shirt, 0.66));
      R(g, x - Math.round(hw / 2) - 1, ty - 1, hw + 2, 3, sh(shirt, 0.62)); R(g, x - Math.round(hw / 2), ty - 2, hw, 1, sh(shirt, 0.8));
      if (h >= 50) { R(g, x - 3, ty + 2, 1, Math.round(th * 0.3), sh(shirt, 1.45)); R(g, x + 2, ty + 2, 1, Math.round(th * 0.26), sh(shirt, 1.45)); }
    } else if (top === "tee") { R(g, x - 3, ty, 6, 2, sh(skin, 0.85)); R(g, x - 2, ty + 2, 4, 1, sh(skin, 0.85)); R(g, x - 4, ty, 1, 2, sh(shirt, 0.7)); R(g, x + 3, ty, 1, 2, sh(shirt, 0.7)); }
    else { R(g, x - 2, ty, 4, 2, sh(skin, 0.85)); R(g, x - 1, ty + 2, 2, 1, sh(skin, 0.85)); }
    // neck
    const nw = Math.max(2, Math.round(hw / 5));
    R(g, x - nw, ty - nk, 2 * nw, nk, sh(skin, 0.78));
    const hst = o.hairStyle || "short";
    if (hst === "long") { R(g, x - hw / 2 - 2, hy + 3, hw + 4, hh + Math.round(h * 0.1), sh(hair, 0.75)); }
    // head (rounded)
    const red = o.red || 0, sk = red > 0 ? `rgb(${Math.round(lerp(parseInt(skin.slice(1, 3), 16), 240, red))},${Math.round(lerp(parseInt(skin.slice(3, 5), 16), 100, red))},${Math.round(lerp(parseInt(skin.slice(5, 7), 16), 90, red))})` : skin;
    const cut = hw >= 12 ? 2 : 1;
    for (let r = 0; r < hh; r++) {
      const ins = r === 0 || r === hh - 1 ? cut + (r === hh - 1 ? 1 : 0) : (r === 1 || r === hh - 2) && cut > 1 ? 1 : 0;
      R(g, x - hw / 2 + ins, hy + r, hw - 2 * ins, 1, sk);
    }
    R(g, lit > 0 ? x - hw / 2 : x + hw / 2 - 2, hy + 2, 2, hh - 4, sh(skin, 0.8));
    R(g, lit > 0 ? x - hw / 2 + 2 : x + hw / 2 - 3, hy + hh - 3, 1, 2, sh(skin, 0.8));
    R(g, lit > 0 ? x + hw / 2 - 1 : x - hw / 2, hy + 3, 1, hh - 7, sh(skin, 1.15));
    R(g, x - hw / 2 + 3, hy + hh - 2, hw - 6, 1, sh(skin, 0.82));
    R(g, x - hw / 2 - 1, hy + Math.round(hh * 0.45), 1, Math.max(2, Math.round(hh / 7)), sh(skin, 0.85)); R(g, x + hw / 2, hy + Math.round(hh * 0.45), 1, Math.max(2, Math.round(hh / 7)), sh(skin, 0.85));
    // hair
    const hd = sh(hair, 0.68), hl = sh(hair, 1.5), cap = Math.round(hh * 0.3);
    if (hst !== "bald") {
      R(g, x - hw / 2, hy - 1, hw, cap + 1, hair); R(g, x - hw / 2 + 2, hy - 2, hw - 4, 1, hair);
      if (hh > 18) R(g, x - hw / 2 + 3, hy - 3, hw - 6, 1, hair);
      R(g, x - hw / 2 - 1, hy + 1, 2, Math.round(hh * 0.42), hair); R(g, x + hw / 2 - 1, hy + 1, 2, Math.round(hh * 0.42), hair);
      for (let i = 0; i < hw - 2; i += 3) R(g, x - hw / 2 + 1 + i, hy + cap, 2, 1 + (Math.floor(i / 3) % 2) + (i < hw / 3 ? 1 : 0), hair);
      R(g, lit > 0 ? x : x - hw / 2 + 2, hy - (hh > 18 ? 2 : 1), Math.round(hw / 2) - 2, 1, hl);
      R(g, lit > 0 ? x + 1 : x - hw / 2 + 2, hy, Math.round(hw / 3), 1, sh(hair, 1.25));
      R(g, lit > 0 ? x - hw / 2 : x + hw / 2 - 2, hy, 2, cap, hd);
    } else { R(g, lit > 0 ? x + 1 : x - hw / 2 + 2, hy + 1, Math.round(hw / 3), 1, sh(skin, 1.25)); }
    if (hst === "bun") { PX.circle(g, x, hy - 4, Math.max(2, Math.round(hh / 5)), hair); R(g, x, hy - 6, 2, 1, hl); }
    if (hst === "spiky") for (let i = -2; i <= 2; i++) { R(g, x + i * Math.round(hw / 5) - 1, hy - 4 - (i % 2 ? 0 : 1), 3, 4, hair); R(g, x + i * Math.round(hw / 5), hy - 4 - (i % 2 ? 0 : 1), 1, 1, hl); }
    if (hst === "long") { R(g, x - hw / 2 - 2, hy + 1, 2, hh + 3, hair); R(g, x + hw / 2, hy + 1, 2, hh + 3, hair); }
    // face
    const ey = hy + Math.round(hh * 0.5), ex = Math.max(2, Math.round(hw * 0.22)), lk = o.look || 0, big = h >= 52, huge = h >= 80;
    const es = big ? 2 : 1, ehh = huge ? 3 : big ? 2 : 1, ink = "#1a1016", my = hy + Math.round(hh * 0.78);
    const f = o.face || "neutral";
    const eyeX = (s) => x + s * ex + lk - (s < 0 ? es : 0) + (s > 0 ? 0 : 0);
    const eyes = () => { for (const s of [-1, 1]) { R(g, eyeX(s), ey, es, ehh, ink); if (huge) R(g, eyeX(s) + 1, ey, 1, 1, "#e8f0ff"); } };
    const brow = (dy, tilt) => { for (const s of [-1, 1]) { const bx = eyeX(s) - 1; R(g, bx, ey - 2 - dy, es + 2, 1, sh(hair, 0.8)); if (tilt) R(g, s * tilt > 0 ? bx + es + 1 : bx, ey - 1 - dy, 1, 1, sh(hair, 0.8)); } };
    if (huge && f !== "strain") R(g, x + (lit > 0 ? -1 : 0), ey + ehh + 1, 1, 2, sh(skin, 0.78));
    if (f === "happy") {
      for (const s of [-1, 1]) { const cx = eyeX(s) + (es > 1 ? 1 : 0); R(g, cx - 1, ey + 1, 1, 1, ink); R(g, cx, ey, 1, 1, ink); R(g, cx + 1, ey + 1, 1, 1, ink); }
      R(g, x - 2, my, 5, 1, ink); R(g, x - 3, my - 1, 1, 1, ink); R(g, x + 3, my - 1, 1, 1, ink); if (big) R(g, x - 1, my + 1, 3, 1, "#b0404a");
    } else if (f === "smug") {
      for (const s of [-1, 1]) { R(g, eyeX(s) - 1, ey, es + 2, 1, ink); R(g, eyeX(s), ey + 1, es, 1, ink); }
      R(g, x - 2, my, 3, 1, ink); R(g, x + 1, my - 1, 2, 1, ink); R(g, x + 3, my - 2, 1, 1, ink);
      R(g, eyeX(-1) - 1, ey - 3, es + 2, 1, sh(hair, 0.8)); R(g, eyeX(1) - 1, ey - 2, es + 2, 1, sh(hair, 0.8));
    } else if (f === "sweat" || f === "shock") {
      const ew = huge ? 4 : 3;
      for (const s of [-1, 1]) { const cx = x + s * ex + lk - (s < 0 ? ew - 1 : 0); R(g, cx, ey - 1, ew, ew, "#f2f2f2"); R(g, cx + (s < 0 ? ew - 2 : 0) + (huge ? 0 : 0), ey + (huge ? 0 : 0), huge ? 2 : 1, huge ? 2 : 1, ink); }
      if (f === "shock") { R(g, x - 1, my - 1, 3, 3, ink); } else { for (let i = -3; i <= 3; i++) R(g, x + i, my + (i % 2 ? 0 : -1), 1, 1, ink); }
      for (const s of [-1, 1]) { const bx = x + s * ex - (s < 0 ? ew : -0); R(g, bx, ey - 3 - (s < 0 ? 0 : 0), ew + 1, 1, sh(hair, 0.8)); R(g, s < 0 ? bx + ew : bx, ey - 4, 1, 1, sh(hair, 0.8)); }
    } else if (f === "yawn") {
      for (const s of [-1, 1]) R(g, eyeX(s) - 1, ey + 1, es + 2, 1, ink);
      R(g, x - 2, my - 2, 5, 5, ink); R(g, x - 1, my + 1, 3, 1, "#c0505a");
    } else if (f === "strain") {
      for (const s of [-1, 1]) { const cx = x + s * (ex + 1) - (s < 0 ? 1 : 0); R(g, cx - s, ey - 1, 1, 1, ink); R(g, cx, ey, 1, 1, ink); R(g, cx - s, ey + 1, 1, 1, ink); }
      R(g, x - 3, my - 1, 7, 3, "#f0f0f0"); R(g, x - 3, my, 7, 1, ink); R(g, x - 4, my - 1, 1, 3, ink); R(g, x + 4, my - 1, 1, 3, ink);
    } else if (f === "focus") {
      eyes(); for (const s of [-1, 1]) { const bx = eyeX(s) - 1; R(g, bx, ey - 2, es + 2, 1, ink); R(g, s < 0 ? bx + es + 1 : bx, ey - 1, 1, 1, ink); }
      R(g, x - 1, my, 3, 1, ink);
    } else if (f === "flat") {
      for (const s of [-1, 1]) { const cx = x + s * ex - (s < 0 ? 1 : 0); R(g, cx - 1, ey - 1, 1, 1, ink); R(g, cx + 1, ey - 1, 1, 1, ink); R(g, cx, ey, 1, 1, ink); R(g, cx - 1, ey + 1, 1, 1, ink); R(g, cx + 1, ey + 1, 1, 1, ink); }
      R(g, x - 2, my, 5, 1, ink);
    } else if (f === "closed") {
      for (const s of [-1, 1]) R(g, eyeX(s) - (big ? 1 : 0), ey + 1, es + (big ? 1 : 0), 1, ink);
      R(g, x - 1, my, 3, 1, ink);
    } else if (f === "sad") {
      eyes(); brow(1, 1); R(g, x - 2, my, 4, 1, ink); R(g, x - 3, my + 1, 1, 1, ink); R(g, x + 2, my + 1, 1, 1, ink);
    } else { eyes(); R(g, x - 1, my, 3, 1, ink); }
    if (o.blush || red > 0.3) for (const s of [-1, 1]) R(g, x + s * (ex + 2) - (s < 0 ? 1 : 0), my - 2, 2, 1, "#e0707a");
    // arms (in front)
    const hand = (sp, a, s) => {
      a = a || [s * 2, th - 3];
      const pts = Array.isArray(a[0]) ? a : [a];
      let px0 = sp[0], py0 = sp[1];
      const tee = (o.top || "hoodie") === "tee";
      pts.forEach((p, i) => { const nx = sp[0] + p[0], ny = sp[1] + p[1];
        if (tee) { limb(g, px0, py0, nx, ny, aw - 1, skin, sh(skin, 0.75)); if (i === 0) limb(g, px0, py0, lerp(px0, nx, 0.55), lerp(py0, ny, 0.55), aw + 1, sh(shirt, 0.95), sh(shirt, 0.62)); }
        else limb(g, px0, py0, nx, ny, aw, sh(shirt, 0.93), sh(shirt, 0.6));
        px0 = nx; py0 = ny; });
      return [Math.round(px0), Math.round(py0)];
    };
    const absA = (sp, tgt, s) => { const dx = tgt[0] - sp[0], dy = tgt[1] - sp[1], L = Math.hypot(dx, dy) || 1, bend = Math.max(0, 0.9 * th - L / 2) * 0.8 + 2; return [[Math.round(dx / 2 + s * bend * Math.abs(dy) / L), Math.round(dy / 2 + bend * Math.abs(dx) / L * 0.5)], [dx, dy]]; };
    const hl2 = hand(shL, o.hands && o.hands.l ? absA(shL, o.hands.l, -1) : o.al, -1), hr2 = hand(shR, o.hands && o.hands.r ? absA(shR, o.hands.r, 1) : o.ar, 1);
    const hs = aw + (huge ? 1 : 0);
    for (const hp of [hl2, hr2]) {
      const hx = hp[0] - Math.floor(hs / 2), hy2 = hp[1] - Math.floor(hs / 2);
      R(g, hx, hy2 + 1, hs, hs - 1, skin); R(g, hx + 1, hy2, hs - 2, hs, skin); R(g, hx, hy2 + hs - 1, hs, 1, sh(skin, 0.75)); R(g, hx + 1, hy2, hs - 2, 1, sh(skin, 1.15));
    }
    return { hl: hl2, hr: hr2, hx: x, hy, hw, hh, ty, hip, tw, ey };
  };
  const person = (LB.person = (g, x, y, o) => {
    o = o || {};
    if (o.outline === false) return personRaw(g, x, y, o);
    return outlined(g, (b) => personRaw(b, x, y, o), o.outline);
  });

  // weather particles
  const rain = (LB.rain = (g, t, seed, n, box, o) => {
    o = o || {}; const r = PX.rnd(seed), [bx, by, bw, bh] = box, vy = o.vy || 260, vx = o.vx || -40, len = o.len || 6;
    g.globalAlpha = o.a || 0.5;
    for (let i = 0; i < n; i++) {
      const x0 = r() * bw, y0 = r() * bh, sp = 0.8 + r() * 0.4;
      const y = by + ((((y0 + vy * sp * t) % bh) + bh) % bh), x = bx + ((((x0 + vx * sp * t + (vx * (y - by)) / vy) % bw) + bw) % bw);
      PX.line(g, x, y, x + (vx * len) / vy, y + len, o.col || "#9fb8e8");
    }
    g.globalAlpha = 1;
  });
  const snow = (LB.snow = (g, t, seed, n, box, o) => {
    o = o || {}; const r = PX.rnd(seed), [bx, by, bw, bh] = box;
    for (let i = 0; i < n; i++) {
      const x0 = r() * bw, y0 = r() * bh, sp = 0.6 + r() * 0.8, sz = r() < 0.25 ? 2 : 1, ph = r() * 6.28;
      const y = by + ((((y0 + (o.vy || 22) * sp * t) % bh) + bh) % bh), x = bx + ((((x0 + Math.sin(t * 1.3 + ph) * 6 + (o.vx || 4) * t) % bw) + bw) % bw);
      g.globalAlpha = (o.a || 0.85) * (sz > 1 ? 1 : 0.7); R(g, x, y, sz, sz, o.col || "#e8eefc");
    }
    g.globalAlpha = 1;
  });
  const LEAF = ["#e0782c", "#c9502a", "#f0a43c", "#a8642a"];
  const leaves = (LB.leaves = (g, t, seed, n, box) => {
    const r = PX.rnd(seed), [bx, by, bw, bh] = box;
    for (let i = 0; i < n; i++) {
      const x0 = r() * bw, y0 = r() * bh, sp = 0.6 + r() * 0.6, ph = r() * 6.28, col = LEAF[i % 4];
      const y = by + ((((y0 + 30 * sp * t) % bh) + bh) % bh), x = bx + ((((x0 + Math.sin(t * 2 + ph) * 12 - 25 * t) % bw) + bw) % bw);
      const s = Math.sin(t * 5 + ph);
      if (s > 0.3) R(g, x, y, 3, 2, col); else if (s < -0.3) R(g, x, y, 2, 3, col); else R(g, x, y, 2, 2, col);
      R(g, x, y, 1, 1, sh(col, 1.3));
    }
  });

  // ================= gauge: car dashboard, CONFIDENCE vs SKILL =================
  K.gauge = (o) => {
    const RD = PX.rnd(41);
    const lamps = [...Array(6)].map((_, i) => ({ ph: i / 6 + RD() * 0.05, side: i % 2 ? 1 : -1 }));
    return (g, t, d, c) => {
      const wrong = T(o, "wrong", 2.0, d, 3.8), swing = T(o, "swing", 0.35, d, 3.8);
      const HY = 112, DY = 176;
      // ---- far: night city through the windshield ----
      PX.par(g, c, 0.3, () => {
        PX.core.skyline(g, -20, -8, 680, HY + 8, t, 9);
        PX.vgrad(g, -20, HY, 680, 80, "1d1a38", "0e0d1e", 4);
        PX.glow(g, 320, HY, 160, "rgba(255,150,90,0.25)", 1);
      });
      // ---- mid: road rushing toward us, streetlights passing ----
      PX.par(g, c, 0.6, () => {
        for (let y = HY; y < DY + 10; y++) { const k = (y - HY) / (DY - HY), hw = 6 + k * 520; R(g, 320 - hw, y, 2 * hw, 1, k < 0.5 ? "#15141f" : "#1b1a26"); R(g, 320 - hw, y, 2, 1, "#3a3550"); R(g, 320 + hw - 2, y, 2, 1, "#3a3550"); }
        // roadside: verges + guard rail posts rushing by
        for (let y = HY; y < DY + 10; y++) { const k = (y - HY) / (DY - HY), hw = 6 + k * 520; R(g, 320 - hw - 3 - k * 60, y, 3 + k * 60, 1, "#1a1830"); R(g, 320 + hw, y, 3 + k * 60, 1, "#1a1830"); }
        for (let i = 0; i < 10; i++) {
          const u = frac(i / 10 + t * 0.9), k = Math.pow(u, 2.3), y = HY + k * (DY + 10 - HY), hw = 6 + k * 520, ph = 1 + k * 14, w = Math.max(1, k * 4);
          for (const s of [-1, 1]) { const px = 320 + s * (hw + 4 + k * 30); R(g, px - w / 2, y - ph, w, ph, "#3a3a52"); R(g, px - w / 2, y - ph, w, 1, "#ff6a4a"); }
        }
        for (const s of [-1, 1]) for (let y = HY; y < DY + 10; y++) { const k = (y - HY) / (DY - HY), hw = 6 + k * 520; R(g, 320 + s * (hw + 4 + k * 30) - (s < 0 ? 1 : 0), y - 1 - k * 14, 1, 1, "#6a6a88"); }
        // car ahead: tail lights
        const cxA = 300 + Math.sin(t * 0.6) * 6, cyA = HY + 18;
        R(g, cxA - 11, cyA - 8, 22, 9, "#0c0c16"); R(g, cxA - 9, cyA - 11, 18, 4, "#12121e"); R(g, cxA - 11, cyA - 4, 4, 2, "#ff3030"); R(g, cxA + 7, cyA - 4, 4, 2, "#ff3030");
        PX.glow(g, cxA - 9, cyA - 3, 12, "rgba(255,40,40,0.7)", 1); PX.glow(g, cxA + 9, cyA - 3, 12, "rgba(255,40,40,0.7)", 1);
        for (let i = 0; i < 7; i++) {
          const u = frac(i / 7 + t * 0.9), k = Math.pow(u, 2.3), y = HY + k * (DY + 10 - HY), w = 1 + k * 8, ln = 1 + k * 18;
          R(g, 320 - w / 2, y, w, ln, "#c9b86a");
        }
        for (const L of lamps) {
          const u = frac(L.ph + t * 0.42), k = Math.pow(u, 2.6), bx = 320 + L.side * (20 + k * 760), by = HY + k * (DY - HY + 60), ph = 6 + k * 300;
          const w = Math.max(1, Math.round(1 + k * 6));
          R(g, bx - w / 2, by - ph, w, ph, "#262a3a"); R(g, bx - w / 2 - L.side * w * 3, by - ph, w * 4, Math.max(1, w), "#30344a");
          R(g, bx - L.side * w * 3 - w, by - ph + w, w * 2, Math.max(1, w / 2), "#ffe0a0");
          PX.glow(g, bx - L.side * w * 3, by - ph + w, 10 + k * 70, "rgba(255,200,120,0.5)", 1);
        }
      });
      // light sweep on the dashboard when a lamp passes overhead
      let sweep = 0; for (const L of lamps) { const u = frac(L.ph + t * 0.42); if (u > 0.82) sweep = Math.max(sweep, Math.sin(((u - 0.82) / 0.18) * Math.PI)); }
      // ---- near: dashboard ----
      const dash = (x) => DY + Math.round(Math.pow((x - 320) / 320, 2) * -14);
      for (let x = 0; x < 640; x++) { const y0 = dash(x); R(g, x, y0, 1, 360 - y0, "#151826"); R(g, x, y0, 1, 1, "#4a4f68"); R(g, x, y0 + 1, 1, 2, "#262a3c"); }
      PX.vgrad(g, 0, 300, 640, 60, "151826", "07080d", 5);
      PX.alpha(g, 0.25 * sweep, () => PX.vgrad(g, 0, DY - 14, 640, 60, "ffd9a0", "151826", 4));
      // cluster hood
      const cx0 = 92, cw = 456, cy0 = 182, chh = 150;
      R(g, cx0 - 4, cy0 - 6, cw + 8, chh + 6, "#0e1019"); R(g, cx0 - 4, cy0 - 6, cw + 8, 1, "#3c4157"); R(g, cx0, cy0, cw, chh, "#07080e");
      R(g, cx0 - 4, cy0 - 6, 1, chh + 6, "#262a3c");
      // side vents + clock display
      for (const vx of [14, 560]) { R(g, vx, 214, 66, 40, "#0b0c14"); R(g, vx, 214, 66, 1, "#363a50"); for (let i = 0; i < 6; i++) { R(g, vx + 3, 218 + i * 6, 60, 2, "#22263a"); R(g, vx + 3, 218 + i * 6, 60, 1, "#3a3f58"); } }
      R(g, 566, 268, 54, 18, "#06100c"); R(g, 566, 268, 54, 1, "#2a3a34");
      PX.text(g, PX.blink(t, 1) ? "11:47" : "11 47", 593, 268, { font: "v", size: 18, col: "#5fe3a8", align: "center" }); PX.glow(g, 593, 277, 26, "rgba(95,227,168,0.25)", 1);
      R(g, 22, 270, 50, 14, "#0b0c14"); for (let i = 0; i < 5; i++) R(g, 26 + i * 9, 274, 6, 6, i === 2 ? "#f7c948" : "#2a2e40");
      // gauges
      const sw2 = (t - swing) / 1.2;
      let vc = 0.04 + (sw2 > 0 ? (sw2 < 1 ? PX.ease(sw2, "back") : 1) * 0.96 : 0);
      if (sw2 >= 0.8) vc = 0.975 + 0.03 * Math.sin(t * 47) + 0.012 * Math.sin(t * 83);
      vc = Math.min(vc, 1.03);
      const vs = 0.05 + 0.012 * PX.smooth((t - swing) / 2) + 0.006 * Math.sin(t * 9) * (t > swing ? 1 : 0);
      const shake = sw2 >= 0.8 ? Math.round(Math.sin(t * 61)) : 0;
      const gauge = (gx, gy, r, v, label, hot) => {
        PX.circle(g, gx, gy, r + 5, "#2a2e40"); PX.circle(g, gx, gy, r + 4, "#4a5068"); PX.circle(g, gx, gy, r + 3, "#1a1d2a"); PX.circle(g, gx, gy, r, "#0c1124");
        PX.circle(g, gx, gy + 2, r - 3, "#0e1530");
        PX.glow(g, gx, gy, r, "rgba(70,140,255,0.16)", 1);
        // rim highlight (top-right), shade (bottom-left)
        for (let a = -2.4; a < -0.2; a += 0.02) R(g, gx + Math.cos(a) * (r + 4), gy + Math.sin(a) * (r + 4), 1, 1, "#8a90b0");
        // red zone band
        for (let vv = 0.78; vv <= 1; vv += 0.004) { const a = Math.PI * 0.75 + vv * Math.PI * 1.5; for (let rr = r - 9; rr < r - 3; rr++) R(g, gx + Math.cos(a) * rr, gy + Math.sin(a) * rr, 1, 1, hot ? (PX.blink(t, 0.25) ? "#ff4040" : "#b02028") : "#7a1a22"); }
        if (hot) PX.glow(g, gx + r * 0.62, gy + r * 0.25, 40, "rgba(255,60,60,0.45)", 1);
        for (let i = 0; i <= 40; i++) {
          const a = Math.PI * 0.75 + (i / 40) * Math.PI * 1.5, maj = i % 5 === 0, r1 = maj ? r - 14 : r - 9;
          PX.line(g, gx + Math.cos(a) * r1, gy + Math.sin(a) * r1, gx + Math.cos(a) * (r - 3), gy + Math.sin(a) * (r - 3), maj ? "#d8e4ff" : "#6a7aa8");
          if (maj && i % 10 === 0) PX.text(g, String(i / 4), gx + Math.cos(a) * (r - 23), gy + Math.sin(a) * (r - 23) - 5, { font: "v", size: 12, col: "#9fb0e0", align: "center" });
        }
        PX.text(g, label, gx, gy - 30, { size: 8, col: "#ffd27a", align: "center" });
        // needle
        const a = Math.PI * 0.75 + v * Math.PI * 1.5, ca = Math.cos(a), sa = Math.sin(a), nx = -sa, ny = ca;
        const tipx = gx + ca * (r - 6), tipy = gy + sa * (r - 6);
        PX.glow(g, (gx + tipx) / 2, (gy + tipy) / 2, 34, "rgba(255,120,60,0.35)", 1);
        for (const k of [-1, 0, 1]) PX.line(g, gx - ca * 10 + nx * k, gy - sa * 10 + ny * k, tipx + nx * k * 0.3, tipy + ny * k * 0.3, k === 0 ? "#ffd0a0" : "#ff7a3a");
        PX.glow(g, tipx, tipy, 10, "rgba(255,170,90,0.9)", 1);
        PX.circle(g, gx, gy, 7, "#2a2e40"); PX.circle(g, gx, gy, 5, "#14172a"); R(g, gx - 2, gy - 4, 3, 1, "#8a90b0");
      };
      g.save(); g.translate(shake, 0);
      gauge(208, 262, 66, vc, "CONFIDENCE", vc > 0.78);
      g.restore();
      gauge(432, 262, 66, vs, "SKILL", false);
      // digital readouts
      R(g, 186, 300, 44, 13, "#0a1a10"); PX.text(g, vc > 0.95 ? (PX.blink(t, 0.3) ? "MAX!" : "") : String(Math.round(vc * 100)), 208, 300, { font: "v", size: 14, col: "#ff6a5a", align: "center" });
      R(g, 410, 300, 44, 13, "#0a1a10"); PX.text(g, String(Math.round(vs * 100)) + "%", 432, 300, { font: "v", size: 14, col: "#5fe39a", align: "center" });
      // centre column: indicators + warning
      const blinkT = PX.blink(t, 0.7);
      PX.sprite(g, ["..g.", ".gg.", "gggg", ".gg.", "..g."], 300, 196, { g: blinkT ? "#3df56b" : "#173a22" });
      PX.sprite(g, [".g..", ".gg.", "gggg", ".gg.", ".g.."], 336, 196, { g: "#173a22" });
      if (blinkT) PX.glow(g, 302, 198, 12, "rgba(61,245,107,0.6)", 1);
      R(g, 316, 196, 8, 5, "#14223a"); R(g, 317, 197, 6, 3, t > 1.2 ? "#3d7cf5" : "#14223a");
      const on = t >= wrong, wb = on && PX.blink(t - wrong, 0.4, 0.6);
      const wx = 320, wy = 222;
      R(g, wx - 30, wy - 6, 60, 48, "#0c0e16"); R(g, wx - 30, wy - 6, 60, 1, "#2a2e40");
      const tri = (col) => { for (let i = 0; i < 14; i++) R(g, wx - Math.floor(i * 0.8), wy + i, 1 + Math.floor(i * 0.8) * 2, 1, col); };
      tri(wb ? "#ff5040" : "#2a1416"); R(g, wx - 1, wy + 4, 2, 6, wb ? "#2a0a0a" : "#1a0c0e"); R(g, wx - 1, wy + 11, 2, 2, wb ? "#2a0a0a" : "#1a0c0e");
      if (wb) { PX.glow(g, wx, wy + 8, 50, "rgba(255,70,50,0.7)", 1); PX.glow(g, wx, wy + 8, 120, "rgba(255,60,40,0.18)", 1); }
      if (on) {
        const pk = PX.p(t, wrong, 0.25, "back");
        PX.alpha(g, pk, () => { PX.otext(g, "WRONG", wx, wy + 19, { size: 8, col: wb ? "#ff8070" : "#a03028", align: "center" }); PX.otext(g, "METER", wx, wy + 29, { size: 8, col: wb ? "#ff8070" : "#a03028", align: "center" }); });
      }
      // ---- foreground: steering wheel arc, A-pillars, mirror + swinging air freshener ----
      for (let x = 150; x < 490; x++) {
        const dx = x - 320, yy = 540 - Math.sqrt(Math.max(0, 230 * 230 - dx * dx));
        R(g, x, yy, 1, 16, "#0d0e14"); R(g, x, yy, 1, 2, "#3a3e52"); R(g, x, yy + 2, 1, 2, "#22252f");
      }
      R(g, 306, 330, 28, 30, "#0d0e14"); R(g, 306, 330, 28, 1, "#2e3244");
      for (let y = 0; y < DY + 4; y++) { const w = Math.round(34 - y * 0.14); R(g, 0, y, w, 1, "#090a10"); R(g, w, y, 1, 1, "#2c3044"); R(g, 640 - w, y, w, 1, "#090a10"); R(g, 640 - w - 1, y, 1, 1, "#2c3044"); }
      PX.alpha(g, 0.06, () => { for (let i = 0; i < 40; i++) { R(g, 600 - i * 3, 12 + i * 4, 26, 4, "#c8d4ff"); R(g, 640 - i * 3, 12 + i * 4, 8, 4, "#c8d4ff"); } });
      R(g, 0, 0, 640, 9, "#0b0c12"); R(g, 0, 9, 640, 1, "#2a2e40");
      R(g, 316, 9, 8, 8, "#14161e"); R(g, 262, 16, 116, 22, "#14161e"); R(g, 264, 18, 112, 18, "#262a3e"); PX.vgrad(g, 265, 19, 110, 16, "2a2f4a", "3a2a40", 3); R(g, 265, 19, 110, 1, "#6a7090");
      PX.glow(g, 300 + Math.sin(t * 3) * 30, 28, 14, "rgba(255,200,140,0.5)", 1);
      const sa2 = Math.sin(t * 2.4) * 0.28 + (sw2 > 0 && sw2 < 1.2 ? Math.sin(t * 20) * 0.1 : 0), ax = 344, ay = 38;
      const ex2 = ax + Math.sin(sa2) * 26, ey2 = ay + Math.cos(sa2) * 26;
      PX.line(g, ax, ay, ex2, ey2, "#8a8a9a");
      for (let i = 0; i < 12; i++) { const w = 2 + Math.floor((i % 4) * 1.5) + Math.floor(i / 4); R(g, ex2 - w, ey2 + i, w * 2, 1, i % 4 === 0 ? "#2f8a4a" : "#3fbf62"); R(g, ex2 - w, ey2 + i, 1, 1, "#1f5a30"); }
      R(g, ex2 - 1, ey2 + 12, 2, 3, "#6a4a2a");
      PX.particles(g, 17, 22, t, [100, 190, 440, 140], { vy: -2, vx: 1, col: "#a8c0ff", a: 0.5 });
      PX.vignette(g, 0.55);
    };
  };

  // ---------- shared environment bits ----------
  // wooden floor boards from y to 360 (perspective-ish spacing)
  const floor = (LB.floor = (g, y, col, seed) => {
    col = col || "#4a3324"; R(g, 0, y, 640, 360 - y, col);
    let yy = y, k = 3, i = 0; const r = PX.rnd(seed || 4);
    while (yy < 360) { R(g, 0, yy, 640, 1, sh(col, 0.72)); const off = Math.floor(r() * 60);
      for (let x = off; x < 640; x += 70 + (i % 3) * 14) R(g, x, yy, 1, k, sh(col, 0.75));
      R(g, 0, yy + 1, 640, 1, sh(col, 1.12)); yy += k; k += 2; i++; }
  });
  const pendant = (LB.pendant = (g, x, y, t, a, len) => {
    len = len || 18; R(g, x, 0, 1, len, "#2a2a36"); R(g, x - 9, len, 18, 6, "#2e3140"); R(g, x - 11, len + 6, 22, 3, "#3a3e52"); R(g, x - 11, len + 6, 22, 1, "#5a5f78");
    R(g, x - 7, len + 9, 14, 2, a > 0.3 ? "#ffe2a8" : "#5a5040");
  });
  const clock = (LB.clock = (g, x, y, t, r) => {
    r = r || 9; PX.circle(g, x, y, r + 1, "#2a2a36"); PX.circle(g, x, y, r, "#dcd6c8"); PX.circle(g, x + 1, y + 1, r - 2, "#cfc8b8");
    for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; R(g, x + Math.cos(a) * (r - 2), y + Math.sin(a) * (r - 2), 1, 1, "#5a5a66"); }
    const am = ((Math.floor(t) % 60) / 60) * 6.283 - 1.57, ah = -0.6;
    PX.line(g, x, y, x + Math.cos(ah) * (r - 5), y + Math.sin(ah) * (r - 5), "#2a2a36");
    PX.line(g, x, y, x + Math.cos(am) * (r - 2), y + Math.sin(am) * (r - 2), "#c03030");
  });

  // ================= recog: classroom, RECOGNITION vs RECALL =================
  K.recog = (o) => (g, t, d, c) => {
    const labels = T(o, "labels", 5.0, d, 8), tags = T(o, "tags", 6.5, d, 8), tick = T(o, "tick", 1.3, d, 8);
    // ---- far: wall, window with night city, clock, poster ----
    PX.par(g, c, 0.5, () => {
      PX.vgrad(g, -30, -20, 700, 260, "2a3058", "1c2142", 8);
      R(g, -30, 214, 700, 40, "#3a2a22"); R(g, -30, 214, 700, 2, "#5a4232"); R(g, -30, 230, 700, 1, "#2a1e18");
      for (let x = -20; x < 680; x += 40) R(g, x, 216, 1, 38, "#2a1e18");
      R(g, 280, 50, 76, 142, "#3a3f5c"); PX.core.skyline(g, 284, 54, 68, 134, t, 21); R(g, 316, 54, 4, 134, "#3a3f5c"); R(g, 284, 118, 68, 3, "#3a3f5c");
      R(g, 276, 190, 84, 5, "#4a5070"); R(g, 276, 190, 84, 1, "#6a7090");
      R(g, 290, 200, 56, 12, "#30344a"); for (let i = 0; i < 9; i++) R(g, 293 + i * 6, 201, 3, 10, "#3e4360");
      clock(g, 318, 30, t * 6, 10);
      R(g, 568, 66, 48, 62, "#1e2238"); R(g, 570, 68, 44, 58, "#3a2f5c"); PX.text(g, "{ }", 592, 80, { size: 8, col: "#f7c948", align: "center" });
      R(g, 578, 100, 28, 2, "#8a7ab0"); R(g, 578, 106, 22, 2, "#8a7ab0"); R(g, 578, 112, 25, 2, "#8a7ab0");
    });
    // pendant lights + cones (the right one flickers)
    const flick = PX.blink(t, 2.3, 0.93) || t % 2.3 < 0.04 ? 1 : 0.35;
    PX.par(g, c, 0.7, () => { pendant(g, 150, 0, t, 1, 14); pendant(g, 486, 0, t, flick, 14); });
    cone(g, 150, 25, 22, 230, 230, "#ffcf8a", 0.16);
    cone(g, 486, 25, 22, 230, 230, "#ffcf8a", 0.16 * flick);
    PX.glow(g, 150, 30, 60, "rgba(255,207,138,0.45)", 1); PX.glow(g, 486, 30, 60, `rgba(255,207,138,${0.45 * flick})`, 1);
    // ---- mid: whiteboard ----
    const bx = 24, by = 66, bw = 244, bh = 150;
    R(g, bx - 4, by - 4, bw + 8, bh + 8, "#8a92a8"); R(g, bx - 4, by - 4, bw + 8, 1, "#c8d0e0"); R(g, bx - 4, by + bh + 3, bw + 8, 1, "#5a6078");
    PX.vgrad(g, bx, by, bw, bh, "b4c0d2", "98a4ba", 5);
    PX.alpha(g, 0.15, () => { for (let i = 0; i < 6; i++) R(g, bx + 130 + i * 4, by + 4 + i * 6, 30, 3, "#ffffff"); });
    R(g, bx + 10, by + bh + 4, bw - 20, 4, "#6a7088"); R(g, bx + 40, by + bh + 1, 14, 3, "#c03030"); R(g, bx + 58, by + bh + 1, 14, 3, "#3060c0");
    const ink = "#1e2a5a";
    PX.text(g, "WHAT DOES THIS", bx + 12, by + 12, { size: 8, col: ink }); PX.text(g, "PRINT?", bx + 12, by + 24, { size: 8, col: ink });
    R(g, bx + 12, by + 40, 120, 18, "#2a3040"); PX.text(g, "print(2 + 3*4)", bx + 17, by + 41, { font: "v", size: 16, col: "#a8e8b0" });
    const OX = bx + 176, OY = by + 90;
    PX.text(g, "PICK ONE:", OX, OY - 14, { font: "v", size: 12, col: "#3a4a7a" });
    [["A", "20"], ["B", "14"], ["C", "24"]].forEach(([L2, v], i) => {
      const oy = OY + i * 20;
      R(g, OX, oy, 14, 14, ink); R(g, OX + 1, oy + 1, 12, 12, "#d8e0ea");
      PX.text(g, L2 + ")" + v, OX + 20, oy + 3, { size: 8, col: ink });
    });
    // doodles on the board
    PX.line(g, bx + 14, by + 74, bx + 60, by + 74, "#c03030"); PX.text(g, "QUIZ 3", bx + 14, by + 64, { font: "v", size: 12, col: "#c03030" });
    PX.text(g, "2+12=14 ?", bx + 16, by + 96, { font: "v", size: 14, col: "#5a6a9a" });
    const tk = cl((t - tick) / 0.3, 0, 1);
    if (tk > 0) {
      const ox = OX, oy = OY + 20;
      const p1 = Math.min(1, tk * 2.5), p2 = cl((tk - 0.4) / 0.6, 0, 1);
      for (const k of [0, 1]) { PX.line(g, ox + 2 + k, oy + 7, ox + 2 + k + 4 * p1, oy + 7 + 4 * p1, "#1fae4a"); if (p2 > 0) PX.line(g, ox + 6 + k, oy + 11, ox + 6 + k + 10 * p2, oy + 11 - 14 * p2, "#1fae4a"); }
      if (t > tick + 0.3) { const gk = 1 - cl((t - tick - 0.3) / 1.2, 0, 1); PX.glow(g, ox + 8, oy + 6, 30, `rgba(61,245,107,${0.2 + 0.5 * gk})`, 1); }
    }
    // ---- floor ----
    floor(g, 254, "#3e2c22", 7);
    PX.glow(g, 150, 290, 110, "rgba(255,190,120,0.18)", 1); PX.glow(g, 486, 290, 110, `rgba(255,190,120,${0.18 * flick})`, 1);
    // ---- LEFT student at the board ----
    const sx = 172, bobL = Math.round(Math.sin(t * 2.2) * 0.6);
    const reach = PX.p(t, tick - 0.45, 0.35, "back") * (1 - PX.p(t, tick + 0.9, 0.35, "out"));
    const smug = t > tick + 0.35;
    shadow(g, sx, 302, 22);
    const toss = (tt) => (tt > 0 && tt < 0.6 ? -Math.sin((tt / 0.6) * Math.PI) * 18 : 0);
    const tossY = toss(t - (tick + 2.0)) + toss(t - (tick + 3.4));
    const L1 = person(g, sx, 302, {
      h: 100, shirt: "#2f9a72", pants: "#2a2f48", hair: "#3a2416", hairStyle: "spiky", skin: "#e0a878", lit: -1, bob: bobL,
      face: smug ? "smug" : "neutral", look: reach > 0.2 ? 1 : 0,
      ar: [[lerp(3, 14, reach), lerp(14, -20, reach)], [lerp(2, 24, reach), lerp(28, -46, reach)]],
      al: smug && reach < 0.3 ? [[-10, 10], [-2, 22]] : [-3, 28],
    });
    const mh = reach > 0.1 ? L1.hr : L1.hr;
    if (reach > 0.1) { R(g, mh[0] + 1, mh[1] - 8, 3, 9, "#20242e"); R(g, mh[0] + 1, mh[1] - 10, 3, 2, "#1fae4a"); }
    else { const my = mh[1] - 6 + tossY; R(g, mh[0] - 1, my, 3, 8, "#20242e"); R(g, mh[0] - 1, my, 3, 2, "#1fae4a"); }
    if (smug && t < tick + 1.4) { const k = (t - tick - 0.35) / 1.05; star4(g, L1.hx + 9, L1.ey - 3, k < 0.5 ? 3 : 2, "#fff6c8"); PX.glow(g, L1.hx + 9, L1.ey - 3, 10, "rgba(255,240,180,0.7)", 1); }
    // ---- RIGHT: desk + exam + sweating student ----
    const dx0 = 380, dy0 = 250, dw = 230;
    const RS = { h: 100, shirt: "#2f9a72", pants: "#2a2f48", hair: "#3a2416", hairStyle: "spiky", skin: "#e0a878", lit: -1 };
    const tremble = Math.round(Math.sin(t * 37) * 0.6);
    // empty desks in the back row
    PX.par(g, c, 0.8, () => { for (const ex2 of [300, 380]) { R(g, ex2 + 10, 226, 30, 12, "#22263a"); R(g, ex2 + 10, 226, 30, 1, "#34384e"); R(g, ex2, 238, 54, 5, "#4a3426"); R(g, ex2, 238, 54, 1, "#6a4c36"); R(g, ex2 + 3, 243, 3, 16, "#2e2018"); R(g, ex2 + 48, 243, 3, 16, "#2e2018"); } });
    R(g, 454, 224, 68, 30, "#262a3a"); R(g, 454, 224, 68, 2, "#3a3f56"); R(g, 454, 224, 2, 30, "#30354a");
    const R1 = person(g, 488, 254, { ...RS, seated: true, face: t > tick + 0.2 ? "sweat" : "neutral", red: cl((t - 2) / 5, 0, 0.45), bob: Math.round(Math.sin(t * 5.5) * 0.6),
      ar: [[-6, 18], [-16 + tremble, 32]], al: [[-8, 18], [-20, 28]] });
    R(g, dx0, dy0, dw, 54, "#7a5236"); R(g, dx0, dy0, dw, 2, "#a8784e"); R(g, dx0, dy0 + 2, 2, 52, "#9a6a44");
    for (let i = 0; i < 4; i++) R(g, dx0 + 8, dy0 + 12 + i * 12, dw - 16, 1, "#6a4630");
    R(g, dx0 - 2, dy0 + 54, dw + 4, 6, "#5a3a26"); R(g, dx0 - 2, dy0 + 54, dw + 4, 1, "#8a5e40"); R(g, dx0 + 6, dy0 + 60, 8, 50, "#3a2618"); R(g, dx0 + dw - 14, dy0 + 60, 8, 50, "#3a2618");
    // pencil case, eraser, water bottle
    R(g, 572, 262, 26, 9, "#5a6ac0"); R(g, 572, 262, 26, 2, "#7a8ae0"); R(g, 574, 266, 22, 1, "#f7c948");
    R(g, 396, 286, 10, 6, "#e88aa0"); R(g, 396, 286, 10, 2, "#f8b0c0");
    R(g, 584, 226, 10, 34, "#3a9ab0"); R(g, 584, 226, 3, 34, "#6ac8dc"); R(g, 585, 220, 8, 6, "#2a4a5a"); R(g, 584, 240, 10, 8, "#e0e8f0");
    const px0 = 420, py0 = 257;
    R(g, px0 + 3, py0 + 3, 132, 44, "rgba(0,0,0,0.35)"); R(g, px0, py0, 132, 44, "#e8e2d2"); R(g, px0, py0, 132, 1, "#fffaf0"); R(g, px0 + 131, py0, 1, 44, "#b8b0a0");
    PX.text(g, "WRITE IT FROM", px0 + 66, py0 + 4, { size: 8, col: "#3a2a5a", align: "center" }); PX.text(g, "SCRATCH", px0 + 66, py0 + 14, { size: 8, col: "#3a2a5a", align: "center" });
    for (let i = 0; i < 3; i++) R(g, px0 + 8, py0 + 28 + i * 6, 116, 1, "#a8b8d8");
    R(g, px0 + 6, py0 + 2, 1, 40, "#e09090");
    const r7 = PX.rnd(77);
    for (let i = 0; i < 4; i++) { const st = 2.6 + i * 1.3, sx2 = px0 + 30 + r7() * 70, sy2 = py0 + 24 + r7() * 14; if (t > st) { R(g, sx2, sy2, 3, 2, "#a8c8e8"); R(g, sx2 + 1, sy2 - 1, 1, 1, "#d8ecff"); } }
    const ph = R1.hr; R(g, ph[0] - 1, ph[1] - 12, 3, 13, "#f7c948"); R(g, ph[0] - 1, ph[1] - 12, 1, 13, "#ffe08a"); R(g, ph[0] - 1, ph[1] - 14, 3, 2, "#e07a8a"); R(g, ph[0], ph[1] + 1, 1, 2, "#3a3030");
    R(g, ph[0] - 3, ph[1] - 2, 5, 4, RS.skin);
    if (t > tick + 0.2) sweat(g, R1.hx, R1.hy + 4, t, 3, 9);
    for (const qt of [2.2, 3.8]) if (t > qt) { const k = PX.p(t, qt, 0.3, "back"), a = 1 - cl((t - qt - 1.2) / 0.4, 0, 1); if (a > 0) PX.alpha(g, a, () => PX.otext(g, "?", R1.hx + (qt > 3 ? -24 : 20), R1.hy - 6 - 10 * k, { size: 16, col: "#ff8a8a", align: "center" })); }
    // ---- labels + tags ----
    PX.particles(g, 12, 30, t, [40, 40, 560, 200], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.45 });
    const lab = (txt, x, at, col) => { if (t < at) return; const k = PX.p(t, at, 0.35, "back"); PX.alpha(g, Math.min(1, (t - at) * 5), () => PX.otext(g, txt, x, 30 - 10 * (1 - k), { size: 16, col, align: "center" })); };
    lab("RECOGNITION", 146, labels, "#5fe3e8"); lab("RECALL", 490, labels + 0.25, "#f7c948");
    const tag = (txt, x, at, col) => {
      if (t < at) return; const k = PX.p(t, at, 0.5, "back"), sw3 = Math.sin((t - at) * 6) * Math.exp(-(t - at) * 3) * 3;
      const w = PX.tw(g, txt, { size: 8 }) + 18, y = 54 - 12 * (1 - k), x0 = x - w / 2 + sw3;
      PX.line(g, x, 48, x0 + 6, y + 4, "#c8c0a8");
      R(g, x0 + 1, y + 1, w, 15, "rgba(0,0,0,.4)"); R(g, x0, y, w, 15, col); R(g, x0, y, w, 1, sh(col, 1.3)); R(g, x0, y + 14, w, 1, sh(col, 0.6));
      R(g, x0 + 4, y + 5, 4, 4, "#1a1e30"); PX.text(g, txt, x0 + 12, y + 4, { size: 8, col: "#141826" });
    };
    tag("TUTORIAL", 146, tags, "#5fe3e8"); tag("YOUR JOB", 490, tags + 0.2, "#f7c948");
    PX.vignette(g, 0.5);
  };

  // fairy-light string across a wall: y = sag curve
  const fairy = (LB.fairy = (g, x0, x1, y, sag, t, n, seed) => {
    const cols = ["#ffcf8a", "#f25ca8", "#5fe3e8", "#f7c948", "#3df56b"], r = PX.rnd(seed || 3);
    for (let x = x0; x <= x1; x++) { const k = (x - x0) / (x1 - x0); R(g, x, y + Math.sin(k * Math.PI) * sag, 1, 1, "#2a2a3a"); }
    for (let i = 0; i < n; i++) {
      const k = (i + 0.5) / n, x = x0 + (x1 - x0) * k, yy = y + Math.sin(k * Math.PI) * sag + 2, col = cols[i % cols.length];
      const on = 0.55 + 0.45 * Math.sin(t * (1.5 + r() * 2) + i * 1.7);
      R(g, x, yy - 1, 1, 1, "#3a3a4a"); R(g, x - 1, yy, 3, 3, sh(col, 0.4 + 0.6 * on)); R(g, x - 1, yy, 1, 1, sh(col, 1.3));
      PX.glow(g, x, yy + 1, 9, col, 0.35 * on);
    }
  });
  const flag = (LB.flag = (g, x, y, t, lines, col) => {   // pole base at (x,y), cloth waving to the right
    R(g, x - 6, y - 3, 13, 3, "#3a3f4b"); R(g, x - 6, y - 3, 13, 1, "#5a6070");
    R(g, x, y - 66, 2, 63, "#c8ccd8"); R(g, x, y - 66, 1, 63, "#ffffff"); PX.circle(g, x + 1, y - 68, 2, "#f7c948");
    const fw = 96, fh = 28;
    for (let i = 0; i < fw; i++) { const wv = Math.round(Math.sin(t * 5 - i * 0.12) * 2 * (i / fw)); const shade = Math.sin(t * 5 - i * 0.12 + 1) > 0.5 ? 1.12 : Math.sin(t * 5 - i * 0.12 + 1) < -0.5 ? 0.85 : 1;
      R(g, x + 2 + i, y - 64 + wv, 1, fh, sh(col, shade)); }
    PX.glow(g, x + 50, y - 50, 70, col, 0.35);
    lines.forEach((ln, i) => PX.text(g, ln, x + 2 + fw / 2, y - 60 + i * 11 + Math.round(Math.sin(t * 5 - 5) * 1), { size: 8, col: "#13202a", align: "center" }));
  });

  // ================= test: laptop at night, close the tutorial, struggle first =================
  K.test = (o) => (g, t, d, c) => {
    const close = T(o, "close", 2.0, d, 17), blank = T(o, "blank", 3.5, d, 17), peek = T(o, "peek", 6.0, d, 17), timer = T(o, "timer", 9.6, d, 17), flg = T(o, "flag", 13.5, d, 17);
    // ---- far: wall, window, fairy lights, shelf ----
    PX.par(g, c, 0.45, () => {
      PX.vgrad(g, -30, -20, 700, 290, "1e2244", "121630", 9);
      R(g, 14, 40, 128, 132, "#2e3350"); PX.core.skyline(g, 19, 45, 118, 122, t, 31); R(g, 76, 45, 4, 122, "#2e3350"); R(g, 10, 170, 136, 5, "#3e4466");
      R(g, 8, 36, 6, 150, "#5a3a5a"); R(g, 142, 36, 6, 150, "#5a3a5a");   // curtains
      R(g, 506, 70, 110, 4, "#4a3626"); R(g, 506, 74, 110, 2, "#2c1f15");
      ["#7a3a4a", "#3a5a8a", "#4a7a5a", "#8a6a3a", "#5a4a8a"].forEach((col, i) => { const hh = 16 + (i * 5) % 8; R(g, 512 + i * 8, 70 - hh, 7, hh, col); R(g, 512 + i * 8, 70 - hh, 1, hh, sh(col, 1.3)); });
      R(g, 580, 52, 18, 18, "#3d6b4a"); R(g, 584, 46, 4, 8, "#4d8b5a"); R(g, 576, 62, 26, 8, "#7a4a2c");
      R(g, 520, 100, 70, 52, "#1a1e34"); R(g, 523, 103, 64, 46, "#5a2f4a"); PX.circle(g, 555, 122, 12, "#f25ca8"); PX.circle(g, 555, 122, 8, "#5a2f4a"); R(g, 530, 140, 50, 3, "#f7c948");
    });
    PX.par(g, c, 0.6, () => fairy(g, 150, 506, 18, 14, t, 18, 4));
    // lamp light
    PX.glow(g, 66, 196, 120, "rgba(255,190,110,0.45)", 1);
    // ---- desk ----
    R(g, 0, 244, 640, 12, "#5a3e2b"); R(g, 0, 244, 640, 2, "#7a573d"); R(g, 0, 256, 640, 104, "#120e14"); R(g, 0, 256, 640, 3, "#2a1d16");
    PX.vgrad(g, 0, 318, 640, 42, "1a1626", "2a2236", 4); R(g, 0, 318, 640, 1, "#2e2840");
    R(g, 24, 256, 10, 104, "#2a1f17"); R(g, 606, 256, 10, 104, "#2a1f17"); R(g, 24, 256, 2, 104, "#3a2a1f");
    // waste basket full of crumpled attempts
    R(g, 74, 314, 34, 30, "#3a3f56"); R(g, 74, 314, 34, 2, "#5a6078"); for (let i = 0; i < 5; i++) R(g, 78 + i * 7, 318, 1, 24, "#2a2e40");
    for (const [cx2, cy2] of [[82, 310], [94, 308], [104, 312], [88, 304]]) { PX.circle(g, cx2, cy2, 5, "#c8c4b8"); R(g, cx2 - 2, cy2 - 2, 2, 1, "#ffffff"); R(g, cx2, cy2, 3, 1, "#8a8678"); }
    PX.circle(g, 126, 340, 5, "#c8c4b8"); R(g, 124, 338, 2, 1, "#fff");
    R(g, 520, 300, 36, 44, "#3a2a4a"); R(g, 520, 300, 36, 3, "#5a4a6a"); R(g, 528, 314, 20, 12, "#2a1e38"); R(g, 524, 296, 28, 5, "#2a1e38");   // backpack
    PX.line(g, 600, 256, 586, 330, "#0a0a10"); PX.line(g, 601, 256, 587, 330, "#1a1a24");
    // lamp
    R(g, 40, 238, 30, 6, "#2b2f38"); R(g, 52, 186, 4, 52, "#3a3f4b"); R(g, 40, 176, 30, 12, "#3a3f4b"); R(g, 40, 176, 30, 1, "#5a6070"); R(g, 42, 187, 26, 2, "#ffd28a");
    // ---- laptop ----
    const SX = 178, SY = 52, SW = 284, SH = 166;
    const lit = t >= flg ? 1 : 0;
    R(g, SX - 8, SY - 8, SW + 16, SH + 14, "#22252e"); R(g, SX - 8, SY - 8, SW + 16, 1, "#4a505e"); R(g, SX - 8, SY - 8, 1, SH + 14, "#3a3f4b"); R(g, SX + SW + 7, SY - 8, 1, SH + 14, "#16181e");
    R(g, SX + SW / 2 - 1, SY - 5, 2, 2, "#0a0a0e");
    g.save(); g.beginPath(); g.rect(SX, SY, SW, SH); g.clip();
    PX.vgrad(g, SX, SY, SW, SH, "2a3c6a", "3a2a5a", 6);   // wallpaper
    for (let i = 0; i < 5; i++) PX.circle(g, SX + 40 + i * 52, SY + 130 - (i % 2) * 20, 30, sh("#2e3d70", 1 + i * 0.04));
    // taskbar
    R(g, SX, SY + SH - 12, SW, 12, "#151a2c"); R(g, SX, SY + SH - 12, SW, 1, "#2e3654");
    const icons = [["#5fe3e8", 0], ["#f25ca8", 1], ["#3df56b", 2], ["#ff5c5c", 3]];
    icons.forEach(([col, i]) => { const ix = SX + 150 + i * 22; R(g, ix, SY + SH - 10, 14, 9, sh(col, 0.5)); R(g, ix + 2, SY + SH - 8, 10, 5, col); });
    // red "play" icon = tutorial
    const tubeX = SX + 150 + 3 * 22;
    R(g, tubeX + 5, SY + SH - 8, 2, 5, "#ffffff"); R(g, tubeX + 7, SY + SH - 7, 1, 3, "#ffffff");
    // window manager
    const win = (x, y, w, h, title, active) => {
      R(g, x + 2, y + 3, w, h, "rgba(0,0,0,0.4)");
      R(g, x, y, w, h, "#0d1117"); R(g, x, y, w, 10, active ? "#232a3a" : "#1a1f2a"); R(g, x, y, w, 1, "#3a4258");
      PX.text(g, title, x + 5, y + 1, { font: "v", size: 10, col: "#c9d1d9" });
      R(g, x + w - 9, y + 2, 6, 6, "#c0392b"); R(g, x + w - 8, y + 4, 4, 1, "#ffd0d0"); R(g, x + w - 7, y + 3, 1, 4, "#ffd0d0") ;
    };
    // cursor path
    let cur = null, clickAt = null;
    if (t < close + 0.15) {
      const k = PX.p(t, close - 1.0, 0.9, "io");
      cur = [lerp(SX + 150, SX + SW - 12, k), lerp(SY + 120, SY + 13, k)];
      if (t > close) clickAt = close;
    }
    const shrink = PX.p(t, close + 0.05, 0.4, "in");
    if (t < close + 0.45) {
      // tutorial player window (shrinks toward the taskbar icon)
      const W0 = SW - 16, H0 = SH - 24, w = lerp(W0, 14, shrink), h = lerp(H0, 8, shrink), x = lerp(SX + 8, tubeX, shrink), y = lerp(SY + 6, SY + SH - 10, shrink);
      if (shrink < 0.05) {
        win(x, y, w, h, "TUTORIAL 2X - learn python fast", true);
        // player
        const px = x + 6, py = y + 14, pw = w - 12, ph = h - 32;
        PX.vgrad(g, px, py, pw, ph, "1c2a3a", "0f1824", 4);
        R(g, px + 8, py + 8, 100, 64, "#aeb8c8"); R(g, px + 8, py + 8, 100, 1, "#d8e0ea");
        for (let i = 0; i < 5; i++) R(g, px + 14, py + 16 + i * 10, 40 + ((i * 23) % 40), 2, "#3a5aa0");
        person(g, px + 160, py + ph + 4, { h: 70, shirt: "#c05a3a", face: PX.blink(t, 0.25) ? "happy" : "neutral", hairStyle: "short", hair: "#2a1a10", noLegs: true, ar: [[10, 4], [20, -10]], al: [-2, 18], lit: -1 });
        R(g, px + 4, py + 4, 20, 10, "#f7c948"); PX.text(g, "2X", px + 7, py + 5, { size: 8, col: "#1a1420" });
        // controls
        const by2 = y + h - 16;
        R(g, px, by2, pw, 3, "#2a3040"); R(g, px, by2, pw * (0.22 + t * 0.06), 3, "#ff5c5c"); R(g, px + pw * (0.22 + t * 0.06) - 2, by2 - 1, 5, 5, "#ffffff");
        R(g, px + 2, by2 + 6, 2, 6, "#c9d1d9"); R(g, px + 6, by2 + 6, 2, 6, "#c9d1d9");
        PX.text(g, "04:12 / 3:58:00", px + 14, by2 + 5, { font: "v", size: 10, col: "#8b949e" });
      } else { R(g, x, y, w, h, "#232a3a"); R(g, x, y, w, 1, "#5a6480"); }
    }
    // editor opens (grows from the dock), blank file
    const ed = PX.p(t, blank - 0.5, 0.45, "back");
    const lines = [];
    if (t >= blank - 0.5) {
      const W0 = SW - 16, H0 = SH - 24, w = lerp(30, W0, ed), h = lerp(10, H0, ed), x = SX + 8 + (W0 - w) / 2, y = SY + 6 + (H0 - h) * 0.9;
      if (ed > 0.85) {
        win(x, y, w, h, "", true);
        R(g, x + 3, y + 1, 50, 9, "#0d1117"); PX.text(g, "solve.py", x + 7, y + 1, { font: "v", size: 10, col: "#e6edf3" });
        R(g, x + 56, y + 1, 50, 9, "#161b22"); PX.text(g, "tutorial", x + 60, y + 1, { font: "v", size: 10, col: "#6e7681" });
        // gag: types a letter, deletes it
        let txt = []; const typing2 = (t > blank + 0.9 && t < blank + 1.9) || t >= flg + 0.4;
        const gagA = blank + 1.0, gagB = blank + 1.8;
        if (t > gagA && t < gagB) txt = [{ seg: [["d", "#ff7b72"]] }];
        if (t >= flg + 0.4) {
          const l1 = "def solve(nums):", l2 = "    seen = set()", n = Math.floor((t - flg - 0.4) * 12);
          txt = [{ seg: [["def", "#ff7b72"], [" solve", "#d2a8ff"], ["(nums):", "#c9d1d9"]].map(([s2, col], i, arr) => { const st = arr.slice(0, i).reduce((a, b) => a + b[0].length, 0); return [s2.slice(0, cl(n - st, 0, s2.length)), col]; }) }];
          if (n > l1.length + 2) txt.push({ ind: 1, seg: [["seen = ", "#c9d1d9"], ["set", "#79c0ff"], ["()", "#c9d1d9"]].map(([s2, col], i, arr) => { const st = l1.length + 3 + arr.slice(0, i).reduce((a, b) => a + b[0].length, 0); return [s2.slice(0, cl(n - st, 0, s2.length)), col]; }) });
        }
        // big-type editor: line numbers + code + fat blinking cursor
        R(g, x, y + 10, w, h - 10, "#0d1117"); R(g, x, y + 10, 22, h - 10, "#0b0f15");
        const nL = Math.max(1, txt.length);
        for (let i = 0; i < 6; i++) PX.text(g, String(i + 1), x + 17, y + 16 + i * 16, { font: "v", size: 16, col: i < nL ? "#6e7681" : "#262c36", align: "right" });
        let cx = x + 28, cy = y + 16;
        txt.forEach((ln, i) => { let lx = x + 28 + (ln.ind || 0) * 16; for (const [s2, col] of ln.seg) lx += PX.text(g, s2, lx, y + 16 + i * 16, { font: "v", size: 16, col }); cx = lx; cy = y + 16 + i * 16; });
        R(g, x + 22, cy - 1, w - 22, 16, "rgba(255,255,255,0.04)");
        if (PX.blink(t, 1.0, 0.55) || typing2) { R(g, cx + 1, cy + 1, 7, 13, "#e6edf3"); PX.glow(g, cx + 4, cy + 7, 12, "rgba(230,237,243,0.4)", 1); }
        PX.text(g, "# write it yourself", x + 18, y + h - 12, { font: "v", size: 10, col: "#3a4250" });
      } else { R(g, x, y, w, h, "#232a3a"); R(g, x, y, w, 1, "#5a6480"); }
    }
    // cursor
    if (cur) { PX.sprite(g, ["k....", "kk...", "kwk..", "kwwk.", "kwwwk", "kwwkk", "kkwk.", "...k."], cur[0], cur[1], { k: "#0a0a0e", w: "#ffffff" }); }
    if (clickAt !== null) { const k = (t - clickAt) / 0.15; PX.alpha(g, 1 - k, () => { const r = Math.round(3 + k * 8); PX.box(g, SX + SW - 12 - r, SY + 12 - r, r * 2, r * 2, "#ffffff"); }); }
    g.restore();
    // screen glow (stronger once learning starts)
    const fl = PX.p(t, flg + 0.2, 0.5, "out");
    PX.glow(g, 320, 140, 200, `rgba(90,150,255,${0.18 + 0.2 * fl})`, 1);
    if (t > flg + 0.2 && t < flg + 1.2) PX.glow(g, 320, 130, 160, `rgba(160,255,200,${0.35 * (1 - (t - flg - 0.2))})`, 1);
    // laptop deck + keyboard
    for (let r = 0; r < 22; r++) { const w = SW + 24 + r * 2; R(g, 320 - w / 2, SY + SH + 6 + r, w, 1, r < 2 ? "#4a505e" : "#2b2f38"); }
    for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 22; kx++) R(g, 320 - 132 + kx * 12 - ky * 2, SY + SH + 9 + ky * 5, 10, 3, "#1a1d24");
    PX.glow(g, 320, 236, 120, "rgba(90,150,255,0.12)", 1);
    // ---- desk props ----
    PX.core.mug(g, 128, 234, t);
    // kitchen timer
    const tOn = t >= timer, tk = PX.p(t, timer, 0.3, "back"), hop = tOn ? Math.round(-Math.sin(Math.min(1, (t - timer) / 0.3) * Math.PI) * 8) : 0;
    const kx0 = 146, ky0 = 210 + hop;
    ell(g, kx0 + 22, ky0 + 18, 22, 18, "#c0392b"); ell(g, kx0 + 22, ky0 + 16, 20, 15, "#e04a3a"); R(g, kx0 + 8, ky0 + 5, 10, 2, "#ff8a7a");
    R(g, kx0 + 18, ky0 - 4, 8, 4, "#3a8a3a"); R(g, kx0 + 20, ky0 - 7, 4, 3, "#4aaa4a");
    R(g, kx0 + 6, ky0 + 12, 32, 13, "#101a12"); R(g, kx0 + 6, ky0 + 12, 32, 1, "#2a3a2a");
    let secs = tOn ? Math.min(600, Math.floor(((t - timer) / 3.6) * 600)) : 0;
    const disp = tOn ? `${String(Math.floor(secs / 60)).padStart(2, "0")}:${String(secs % 60).padStart(2, "0")}` : "00:00";
    const done10 = secs >= 600;
    PX.text(g, disp, kx0 + 22, ky0 + 11, { font: "v", size: 16, col: tOn ? (done10 && PX.blink(t, 0.3) ? "#ff8a5a" : "#7dff9a") : "#1f3a24", align: "center" });
    if (tOn) PX.glow(g, kx0 + 22, ky0 + 18, 30, done10 ? "rgba(255,120,80,0.5)" : "rgba(100,255,140,0.35)", 1);
    if (tOn && !done10 && PX.blink(t, 0.2)) { R(g, kx0 + 44, ky0 + 6, 2, 2, "#ffe08a"); R(g, kx0 - 2, ky0 + 8, 2, 2, "#ffe08a"); }
    // ---- the coder (from behind) ----
    const bob = Math.round(Math.sin(t * 1.6) * 1);
    const stuck = t >= timer;
    const typing = (t > blank + 0.9 && t < blank + 1.9) || t >= flg + 0.4;
    PX.core.coder(g, 330, 270 + bob, t, { typing });
    // hand covering the tutorial icon
    const hk = PX.p(t, peek + 0.5, 0.35, "back") * (1 - PX.p(t, timer - 0.4, 0.3, "in"));
    if (hk > 0.01) {
      const sx2 = 364, sy2 = 276 + bob, hx = lerp(372, tubeX + 7, hk), hy = lerp(300, SY + SH - 6, hk), ex = lerp(376, tubeX + 26, hk), ey = lerp(296, 252, hk);
      limb(g, sx2, sy2, ex, ey, 13, "#2f4a86", "#22356a"); limb(g, ex, ey, hx, hy + 6, 11, "#2f4a86", "#22356a");
      R(g, hx - 9, hy - 6, 18, 14, "#c98a5a"); R(g, hx - 9, hy - 9, 4, 4, "#c98a5a"); R(g, hx - 4, hy - 10, 4, 4, "#c98a5a"); R(g, hx + 1, hy - 10, 4, 4, "#c98a5a"); R(g, hx + 6, hy - 8, 3, 4, "#c98a5a");
      R(g, hx - 9, hy + 6, 18, 2, "#a8704a"); R(g, hx - 9, hy - 6, 1, 12, "#e0a878");
    }
    // stuck: scratching head + sweat + "..."
    if (stuck && t < flg) {
      const sc = Math.round(Math.sin(t * 14) * 3);
      limb(g, 292, 274 + bob, 276, 246 + bob, 13, "#2f4a86", "#22356a"); limb(g, 276, 246 + bob, 312 + sc, 232 + bob, 11, "#2f4a86", "#22356a");
      R(g, 310 + sc, 226 + bob, 12, 9, "#c98a5a"); R(g, 310 + sc, 226 + bob, 12, 1, "#e0a878"); for (let i = 0; i < 3; i++) R(g, 312 + sc + i * 4, 235 + bob, 2, 2, "#a8704a");
      sweat(g, 330, 232 + bob, t, 3, 13);
      const qk = PX.p(t, timer + 1.2, 0.3, "back");
      if (qk > 0) { const bx2 = 392, by3 = 194; PX.circle(g, bx2, by3, Math.round(17 * qk), "#1a1e2a"); PX.circle(g, bx2, by3, Math.round(16 * qk), "#e6edf3"); PX.circle(g, bx2 - 20, by3 + 20, 4, "#e6edf3"); PX.circle(g, bx2 - 28, by3 + 28, 2, "#e6edf3");
        const dots = Math.floor((t - timer) * 2.5) % 4; if (qk > 0.8) for (let i = 0; i < 3; i++) R(g, bx2 - 10 + i * 8, by3 - 2, 4, 4, i < dots ? "#0d1117" : "#9aa4b2"); }
    }
        // ---- sticky note on the bezel ----
    if (t >= peek) {
      const k = PX.p(t, peek, 0.22, "in"), y = lerp(-50, SY - 14, k), sq = t - peek > 0.22 && t - peek < 0.36 ? 2 : 0;
      const flut = t - peek > 1.5 ? Math.round(Math.sin(t * 3) * 1) : 0;
      R(g, SX - 20 + 3, y + 3, 66, 40 - sq, "rgba(0,0,0,0.45)");
      R(g, SX - 20, y + sq, 66, 40 - sq, "#f7d34a"); R(g, SX - 20, y + sq, 66, 6, "#e8c03a"); R(g, SX - 20 + 60, y + 34 + flut, 6, 6 - flut, "#d8b030");
      PX.text(g, "NO", SX + 13, y + 12 + sq, { size: 8, col: "#3a2a10", align: "center" }); PX.text(g, "PEEKING", SX + 13, y + 24 + sq, { size: 8, col: "#3a2a10", align: "center" });
      if (t - peek > 0.2 && t - peek < 0.6) { const pk = (t - peek - 0.2) / 0.4; PX.alpha(g, 1 - pk, () => { for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.28; R(g, SX + 13 + Math.cos(a) * (36 + pk * 14), SY + 6 + Math.sin(a) * (20 + pk * 10), 2, 2, "#ffe9a0"); } }); }
    }
    // ---- flag ----
    if (t >= flg) {
      const k = PX.p(t, flg, 0.45, "back"), y = lerp(-20, 244, Math.min(1, k));
      flag(g, 498, y, t, ["LEARNING", "STARTS HERE"], "#3df56b");
      if (t - flg > 0.3 && t - flg < 0.9) { const pk = (t - flg - 0.3) / 0.6; PX.alpha(g, 1 - pk, () => { for (let i = 0; i < 8; i++) R(g, 498 + (i - 4) * (4 + pk * 8), 240 - pk * 6 - (i % 2) * 3, 3, 2, "#c8b090"); }); }
    }
    PX.particles(g, 11, 26, t, [20, 110, 160, 130], { vy: -3, vx: 2, col: "#ffe2b0", a: 0.6 });
    PX.vignette(g, 0.55);
  };

  // ================= waiting: lonely bus stop at night, seasons flicker by =================
  K.waiting = (o) => {
    const WR = PX.rnd(55);
    const far = [...Array(30)].map(() => [WR() * 680 - 20, 40 + WR() * 70, 14 + WR() * 26]);
    return (g, t, d, c) => {
      const buses = T(o, "buses", [0.45, 2.35], d, 3.9), s1 = T(o, "snow", 1.3, d, 3.9), s2 = T(o, "leaves", 2.6, d, 3.9);
      // season with flicker at the boundaries
      const flick = (b) => Math.abs(t - b) < 0.14 && Math.floor(t * 30) % 2 === 0;
      let season = t < s1 ? 0 : t < s2 ? 1 : 2;
      if (flick(s1)) season = season === 0 ? 1 : 0; if (flick(s2)) season = season === 1 ? 2 : 1;
      const wet = season === 0, snowy = season === 1, fall = season === 2;
      const RY = 236, SY2 = 292;
      // ---- far: sky + skyline ----
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -30, -20, 700, 200, snowy ? "1a2038" : "0e1228", snowy ? "3a3a5a" : fall ? "3a2840" : "24223e", 8);
        for (const [x, h2, w] of far) { R(g, x, 170 - h2, w, h2 + 10, "#141a30"); for (let wy = 174 - h2; wy < 172; wy += 6) for (let wx = x + 2; wx < x + w - 2; wx += 5) if ((wx * 7 + wy * 3) % 11 < 2) R(g, wx, wy, 2, 2, "#c8a050"); }
        PX.alpha(g, 0.35, () => PX.vgrad(g, -30, 140, 700, 40, "2a2a48", "3a3858", 3));
      });
      // ---- mid: shops across the street ----
      PX.par(g, c, 0.6, () => {
        R(g, -30, 150, 700, RY - 150, "#1c1a2e");
        const shops = [[-20, 120, "#2a2440"], [100, 140, "#241f38"], [240, 150, "#2c2642"], [390, 130, "#221e36"], [520, 150, "#2a2440"]];
        shops.forEach(([x, w, col], i) => {
          R(g, x, 120 - (i % 2) * 18, w, RY - 120 + (i % 2) * 18, col); R(g, x, 120 - (i % 2) * 18, w, 2, sh(col, 1.4));
          for (let k = 0; k < 3; k++) R(g, x + 10 + k * (w / 3), 132 - (i % 2) * 18, 16, 20, (i + k) % 3 === 0 ? "#6a5a3a" : "#151325");
          R(g, x + 8, 190, w - 16, RY - 190, "#121020"); for (let yy = 192; yy < RY; yy += 4) R(g, x + 8, yy, w - 16, 1, "#1e1b30");
          if (snowy) R(g, x, 118 - (i % 2) * 18, w, 3, "#d8e0f0");
        });
        // neon sign (flickers)
        const nOn = !(t % 1.7 > 1.55 && t % 1.7 < 1.62) && !(t % 2.9 > 0.4 && t % 2.9 < 0.45);
        R(g, 262, 162, 92, 20, "#120e1c"); PX.text(g, "NOODLES", 308, 166, { size: 8, col: nOn ? "#ff7ac0" : "#4a2a3a", align: "center" });
        if (nOn) PX.glow(g, 308, 170, 70, "rgba(242,92,168,0.45)", 1);
        R(g, 420, 168, 40, 14, "#120e1c"); PX.text(g, "24H", 440, 170, { size: 8, col: "#5fe3e8", align: "center" }); PX.glow(g, 440, 174, 30, "rgba(95,227,232,0.35)", 1);
      });
      // ---- road (wet = reflections) ----
      PX.vgrad(g, 0, RY, 640, SY2 - RY, wet ? "1a1a2c" : "1e1e2c", wet ? "121220" : "16161f", 4);
      if (snowy) { PX.alpha(g, 0.5, () => PX.vgrad(g, 0, RY, 640, SY2 - RY, "8a92b0", "5a6280", 3)); }
      for (let x = -40; x < 680; x += 60) R(g, x + ((t * 0) % 60), 263, 30, 2, snowy ? "#a8b0c8" : "#8a8460");
      if (wet) {
        PX.alpha(g, 0.5, () => { R(g, 290, RY, 36, 56, "#5a2a48"); R(g, 300, RY + 4, 16, 50, "#8a3a6a"); R(g, 428, RY, 24, 56, "#1a4a5a"); });
        for (const [rx, col] of [[308, "rgba(242,92,168,0.3)"], [440, "rgba(95,227,232,0.25)"], [200, "rgba(255,200,120,0.35)"]]) for (let i = 0; i < 4; i++) PX.glow(g, rx, RY + 10 + i * 12, 16, col, 1);
      }
      // ---- buses (behind the sidewalk) ----
      for (const bt of buses) {
        if (t < bt - 0.1 || t > bt + 1.2) continue;
        const k = (t - bt) / 1.05, x0 = lerp(660, -280, k), y0 = 196;
        PX.glow(g, x0 + 110, 250, 160, "rgba(255,210,140,0.18)", 1);
        R(g, x0, y0 + 4, 240, 70, "#2a6a8a"); R(g, x0 + 4, y0, 232, 6, "#2a6a8a"); R(g, x0 + 4, y0, 232, 1, "#5aa0c0"); R(g, x0, y0 + 4, 240, 1, "#4a8aaa");
        R(g, x0, y0 + 56, 240, 18, "#1e4e68"); R(g, x0, y0 + 50, 240, 4, "#f25ca8");
        for (let i = 0; i < 7; i++) { const wx = x0 + 44 + i * 27; R(g, wx, y0 + 14, 22, 26, "#d8a860"); R(g, wx, y0 + 14, 22, 2, "#f0c888"); if ((i * 5) % 3 !== 0) { PX.circle(g, wx + 11, y0 + 30, 5, "#3a2a2a"); R(g, wx + 5, y0 + 34, 12, 6, "#3a2a2a"); } }
        R(g, x0 + 4, y0 + 12, 32, 34, "#9ad0e8"); R(g, x0 + 6, y0 + 14, 10, 30, "#c8ecff");
        R(g, x0 + 6, y0 + 3, 100, 10, "#0a0a0e"); PX.text(g, "NOT YET", x0 + 56, y0 + 4, { size: 8, col: "#ffb03a", align: "center" }); PX.glow(g, x0 + 56, y0 + 8, 40, "rgba(255,176,58,0.5)", 1);
        R(g, x0 - 2, y0 + 58, 6, 6, "#fff2c0"); PX.glow(g, x0, y0 + 60, 40, "rgba(255,240,190,0.8)", 1); cone(g, x0 - 40, y0 + 56, 4, 70, 30, "#fff2c0", 0.12);
        R(g, x0 + 236, y0 + 56, 4, 8, "#ff3030"); PX.glow(g, x0 + 238, y0 + 60, 18, "rgba(255,50,50,0.7)", 1);
        for (const wx of [x0 + 48, x0 + 190]) { PX.circle(g, wx, y0 + 74, 11, "#101014"); PX.circle(g, wx, y0 + 74, 5, "#6a7080"); const a = -t * 30; R(g, wx + Math.cos(a) * 3, y0 + 74 + Math.sin(a) * 3, 2, 2, "#202024"); }
        // speed lines + spray
        for (let i = 0; i < 6; i++) R(g, x0 + 250 + i * 14, y0 + 10 + i * 11, 30 - i * 3, 1, "rgba(200,220,255,0.35)");
        if (wet) { const r = PX.rnd(Math.floor(t * 20)); for (let i = 0; i < 18; i++) R(g, x0 + 190 + r() * 60, y0 + 70 - r() * 18, 2, 1, "#9fb8e8"); }
      }
      // ---- sidewalk ----
      R(g, 0, SY2, 640, 68, snowy ? "#8a90a8" : "#34344a"); R(g, 0, SY2, 640, 3, snowy ? "#e0e6f4" : "#5a5a74"); R(g, 0, SY2 + 3, 640, 2, "#20202e");
      for (let x = 0; x < 640; x += 40) R(g, x, SY2 + 5, 1, 63, snowy ? "#7a8098" : "#2a2a3c");
      R(g, 0, SY2 + 30, 640, 1, snowy ? "#7a8098" : "#2a2a3c");
      if (snowy) { const r = PX.rnd(3); for (let i = 0; i < 60; i++) R(g, r() * 640, SY2 + 5 + r() * 60, 3, 1, "#c8d0e4"); }
      if (fall) { const r = PX.rnd(8); for (let i = 0; i < 70; i++) R(g, r() * 640, SY2 + 4 + r() * 62, 3, 2, LEAF[i % 4]); }
      // puddle
      if (!snowy) {
        ell(g, 236, 330, 52, 8, wet ? "#202848" : "#262a40"); ell(g, 236, 330, 48, 6, wet ? "#2a3458" : "#2a2e48");
        PX.glow(g, 210, 330, 30, "rgba(255,210,140,0.45)", 1);
        if (wet) for (let i = 0; i < 3; i++) { const k = frac(t * 1.2 + i * 0.33), rx = Math.round(2 + k * 12); PX.alpha(g, 1 - k, () => { PX.box(g, 220 + i * 14 - rx, 330 - Math.round(rx / 4), rx * 2, Math.max(2, Math.round(rx / 2)), "#8aa0d8"); }); }
      } else ell(g, 236, 330, 52, 8, "#9aa6c0");
      // tree on the sidewalk (changes with season)
      R(g, 54, 196, 8, SY2 - 186, "#2a1e1a"); R(g, 54, 196, 2, SY2 - 186, "#4a3428"); PX.line(g, 58, 230, 36, 200, "#2a1e1a"); PX.line(g, 58, 220, 82, 192, "#2a1e1a");
      if (wet) { for (const [cx2, cy2, r2] of [[58, 170, 30], [36, 190, 20], [82, 186, 22]]) { PX.circle(g, cx2, cy2, r2, "#1e3a2e"); PX.circle(g, cx2 + 3, cy2 - 3, r2 - 6, "#2a4a3a"); } }
      else if (snowy) { for (const [x1, y1, x2, y2] of [[58, 200, 40, 160], [58, 196, 76, 158], [40, 160, 30, 150], [76, 158, 88, 146], [58, 190, 58, 150]]) { PX.line(g, x1, y1, x2, y2, "#2a1e1a"); PX.line(g, x1, y1 - 1, x2, y2 - 1, "#e0e8f8"); } }
      else { for (const [cx2, cy2, r2] of [[58, 170, 30], [36, 190, 20], [82, 186, 22]]) { PX.circle(g, cx2, cy2, r2, "#8a3a1e"); PX.circle(g, cx2 + 3, cy2 - 3, r2 - 6, "#c0602a"); PX.circle(g, cx2 + 6, cy2 - 6, r2 - 14, "#e08a3a"); } }
      // ---- streetlight + cone ----
      R(g, 176, 70, 5, SY2 - 66, "#2a2e3c"); R(g, 176, 70, 1, SY2 - 66, "#4a5068"); R(g, 176, 66, 34, 4, "#2a2e3c"); R(g, 198, 70, 20, 6, "#3a3f50"); R(g, 200, 76, 16, 2, "#ffe8b0");
      cone(g, 208, 78, 14, 190, SY2 - 70, "#ffd79a", 0.2);
      PX.glow(g, 208, 78, 40, "rgba(255,220,150,0.9)", 1); PX.glow(g, 208, SY2 + 10, 100, "rgba(255,200,130,0.3)", 1);
      if (snowy) R(g, 176, 63, 34, 3, "#e8eefc");
      // ---- bus shelter ----
      const SX2 = 350;
      R(g, SX2, 160, 4, SY2 - 158, "#3a3f50"); R(g, SX2 + 176, 160, 4, SY2 - 158, "#3a3f50");
      PX.alpha(g, 0.22, () => { R(g, SX2 + 4, 168, 172, 92, "#8ab0d0"); }); R(g, SX2 + 4, 168, 172, 1, "#a8c8e0");
      R(g, SX2 - 8, 152, 196, 10, "#2e3344"); R(g, SX2 - 8, 152, 196, 2, "#4a5068"); if (snowy) R(g, SX2 - 8, 148, 196, 5, "#e8eefc");
      // lit ad panel
      R(g, SX2 + 120, 172, 50, 84, "#2a2e3c"); R(g, SX2 + 123, 175, 44, 78, "#e8b86a"); PX.vgrad(g, SX2 + 123, 175, 44, 78, "f0c878", "d0884a", 4);
      PX.circle(g, SX2 + 145, 205, 12, "#7a3a2a"); R(g, SX2 + 133, 222, 24, 4, "#7a3a2a"); R(g, SX2 + 130, 236, 30, 3, "#5a2a1a"); R(g, SX2 + 134, 243, 22, 3, "#5a2a1a");
      PX.glow(g, SX2 + 145, 214, 60, "rgba(255,190,110,0.35)", 1);
      // bench
      R(g, SX2 + 14, 262, 96, 5, "#5a4232"); R(g, SX2 + 14, 262, 96, 1, "#7a5a44"); R(g, SX2 + 20, 267, 4, 24, "#2a2e3c"); R(g, SX2 + 100, 267, 4, 24, "#2a2e3c");
      // READY stop sign
      R(g, 262, 118, 3, SY2 - 114, "#5a6070"); R(g, 262, 118, 1, SY2 - 114, "#8a90a0");
      R(g, 235, 100, 56, 24, "#1a1e2a"); R(g, 236, 101, 54, 22, "#3df56b"); R(g, 238, 103, 50, 18, "#1f9a46"); R(g, 238, 103, 50, 1, "#5fff8a");
      PX.text(g, "READY", 263, 108, { size: 8, col: "#eafff0", align: "center" }); PX.glow(g, 263, 112, 30, "rgba(61,245,107,0.3)", 1);
      R(g, 250, 134, 26, 12, "#e8eef4"); R(g, 252, 136, 22, 6, "#2a6a8a"); R(g, 254, 142, 4, 3, "#1a1a1a"); R(g, 268, 142, 4, 3, "#1a1a1a");
      if (snowy) R(g, 235, 97, 56, 3, "#e8eefc");
      // ---- the waiting person ----
      const checking = (t % 1.6) < 0.9, busNear = buses.some((b) => t > b + 0.2 && t < b + 0.8);
      const tap = Math.round(Math.max(0, Math.sin(t * 12)) * 2);
      const px = 312, base = SY2 + 26;
      shadow(g, px, base, 18, 0.5);
      const P = person(g, px, base, {
        h: 74, shirt: snowy ? "#5a4a7a" : "#3a5a7a", pants: "#2a2a3a", hair: "#4a2a1a", hairStyle: "short", skin: "#c88a60", lit: -1,
        face: busNear ? "sad" : checking ? "focus" : "flat", look: busNear ? 2 : checking ? -1 : 0,
        al: checking ? [[-10, 8], [2, -2]] : [-2, 20], ar: wet ? [[8, 6], [10, -2]] : [2, 20], legs: [0, -tap],
        bob: Math.round(Math.sin(t * 2) * 0.5),
      });
      // watch on the left wrist
      R(g, P.hl[0] - 2, P.hl[1] + 2, 5, 3, "#c8ccd8"); R(g, P.hl[0] - 1, P.hl[1] + 2, 3, 2, checking ? "#5fe3e8" : "#3a4050");
      // scarf
      R(g, px - 7, P.ty - 1, 14, 4, "#c03a3a"); R(g, px + 2, P.ty + 3, 4, 10, "#c03a3a"); R(g, px - 7, P.ty - 1, 14, 1, "#e05a5a");
      if (wet) { // umbrella
        const ux = P.hr[0], uy = P.hr[1];
        R(g, ux, uy - 46, 1, 48, "#2a2a30");
        for (let r = 0; r < 14; r++) { const w = Math.round(Math.sqrt(1 - Math.pow(1 - r / 14, 2)) * 34); R(g, ux - w, uy - 58 + r, w * 2, 1, r < 2 ? "#4a6aa0" : "#2a4a80"); }
        for (let i = -3; i <= 3; i++) R(g, ux + i * 10 - 1, uy - 45, 3, 2, "#1e3a6a");
        R(g, ux - 34, uy - 46, 68, 1, "#1e3a6a");
      }
      if (snowy && t % 1.4 < 0.6) { const k = (t % 1.4) / 0.6; PX.alpha(g, 0.6 * (1 - k), () => PX.circle(g, px + 8 + k * 8, P.hy + 18 - k * 6, Math.round(2 + k * 3), "#d8e0f0")); }
      // ---- weather (front) ----
      if (wet) { rain(g, t, 7, 140, [0, 0, 640, 360], { a: 0.4 }); PX.alpha(g, 1, () => rain(g, t, 8, 40, [130, 80, 160, 210], { a: 0.8, col: "#ffe8c0" })); }
      if (snowy) snow(g, t, 9, 160, [0, 0, 640, 360]);
      if (fall) leaves(g, t, 10, 40, [0, 0, 640, 360]);
      PX.vignette(g, 0.55);
    };
  };

  // barbell centred at (x, y): bar length L, plates = [h, col] per side
  const barbell = (LB.barbell = (g, x, y, L, plates) => {
    R(g, x - L / 2, y - 1, L, 3, "#8a90a0"); R(g, x - L / 2, y - 1, L, 1, "#d0d6e0"); R(g, x - L / 2, y + 1, L, 1, "#5a6070");
    let off = L / 2 - 4;
    for (const [ph, col] of plates || []) {
      for (const sgn of [-1, 1]) { const px = sgn < 0 ? x - off : x + off - 5; R(g, px, y - ph / 2, 5, ph, col); R(g, px, y - ph / 2, 1, ph, sh(col, 1.35)); R(g, px + 4, y - ph / 2, 1, ph, sh(col, 0.6)); R(g, px, y - ph / 2, 5, 1, sh(col, 1.3)); }
      off -= 6;
    }
  });

  // ================= goldilocks: three lifting stations on a stage =================
  K.goldilocks = (o) => {
    const CR = PX.rnd(66);
    const crowd = [...Array(70)].map((_, i) => [CR() * 660 - 10, 108 + Math.floor(i / 23) * 18 + CR() * 4, CR() * 6.28, CR() < 0.5 ? "#2a2440" : "#30284a"]);
    const flashes = [...Array(14)].map(() => [CR() * 600 + 20, 100 + CR() * 50, CR() * 8]);
    return (g, t, d, c) => {
      const at = T(o, "at", [0.3, 2.8, 5.5], d, 8.2);
      const ST = [116, 320, 524], FY = 282;
      // ---- far: arena wall, crowd, flashes ----
      PX.par(g, c, 0.4, () => {
        PX.vgrad(g, -30, -20, 700, 190, "0c0e20", "1a1a36", 7);
        for (let i = 0; i < 9; i++) { R(g, -20 + i * 80, 0, 2, 96, "#16182c"); }
        R(g, -30, 96, 700, 4, "#2a2a48");
        for (let row = 0; row < 3; row++) R(g, -30, 112 + row * 18, 700, 10, row % 2 ? "#14142a" : "#181830");
        for (const [x, y, ph, col] of crowd) { const b = Math.round(Math.max(0, Math.sin(t * 4 + ph)) * 2); PX.circle(g, x, y - b, 4, col); R(g, x - 5, y + 3 - b, 11, 6, col); }
        for (const [x, y, ph] of flashes) { const k = frac(t * 0.6 + ph / 8); if (k < 0.05) { PX.glow(g, x, y, 12, "rgba(255,255,255,0.8)", 1); R(g, x, y, 2, 2, "#ffffff"); } }
        // scoreboard
        R(g, 270, 20, 100, 40, "#0a0a14"); R(g, 270, 20, 100, 1, "#3a3a58"); R(g, 268, 18, 104, 2, "#2a2a40");
        PX.text(g, "0:" + String(Math.floor(t) % 60).padStart(2, "0") + "." + (Math.floor(t * 10) % 10), 320, 28, { font: "v", size: 22, col: "#ff7a3a", align: "center" });
        PX.glow(g, 320, 40, 50, "rgba(255,122,58,0.25)", 1);
      });
      // light rig truss
      PX.par(g, c, 0.7, () => {
        R(g, 0, 6, 640, 6, "#2a2c3c"); for (let x = 0; x < 640; x += 8) PX.line(g, x, 6, x + 8, 11, "#3a3d50");
        ST.forEach((x) => { R(g, x - 8, 12, 16, 10, "#20222e"); R(g, x - 6, 22, 12, 3, "#3a3d50"); });
      });
      // ---- stage ----
      R(g, 0, 160, 640, FY - 160, "#120f1e");
      // barrier wall with scrolling LED board
      R(g, 0, 214, 640, 56, "#16142a"); R(g, 0, 214, 640, 2, "#3a3658"); R(g, 0, 222, 640, 22, "#0a0a14");
      for (let x = 0; x < 640; x += 3) for (let y = 224; y < 242; y += 3) { const u = Math.floor((x + t * 60) / 3), v = (y - 224) / 3; const on = ((u >> 3) % 6 < 3) ? ((u + v) % 4 === 0) : (v === 2 || v === 3) && (u % 8 < 6); R(g, x, y, 2, 2, on ? ((u >> 3) % 6 < 3 ? "#f25ca8" : "#5fe3e8") : "#16162a"); }
      PX.glow(g, 160, 233, 120, "rgba(242,92,168,0.12)", 1); PX.glow(g, 480, 233, 120, "rgba(95,227,232,0.12)", 1);
      // dumbbell racks at the sides
      for (const rx of [8, 572]) { R(g, rx, 248, 60, 4, "#3a3f50"); R(g, rx + 2, 252, 3, 18, "#2a2e3c"); R(g, rx + 55, 252, 3, 18, "#2a2e3c"); for (let i = 0; i < 5; i++) { R(g, rx + 4 + i * 11, 242, 3, 6, "#5a6070"); R(g, rx + 7 + i * 11, 244, 3, 2, "#8a90a0"); R(g, rx + 10 + i * 11, 242, 3, 6, "#5a6070"); } }
      R(g, 0, FY - 12, 640, 40, "#5a3e2c"); for (let i = 0; i < 4; i++) R(g, 0, FY - 12 + i * 10, 640, 1, "#3e2a1e"); R(g, 0, FY - 12, 640, 1, "#8a6244");
      R(g, 0, FY + 28, 640, 4, "#9a7050"); R(g, 0, FY + 32, 640, 30, "#1c1410"); for (let x = 20; x < 640; x += 60) R(g, x, FY + 34, 30, 2, "#2a1e16");
      // spotlights
      const act = at.map((a) => t >= a), cur = act.lastIndexOf(true);
      ST.forEach((x, i) => {
        const on = i === cur ? 1 : act[i] ? 0.45 : 0.2, fl = i === cur ? PX.p(t, at[i], 0.25, "out") : 1, a = on * fl;
        cone(g, x, 24, 10, 150, FY + 6 - 24, "#ffe8c0", 0.26 * a);
        PX.glow(g, x, 24, 16, `rgba(255,240,200,${0.9 * a})`, 1);
        ell(g, x, FY + 6, 70, 9, `rgba(255,230,180,${0.1 + 0.18 * a})`);
        R(g, x - 52, FY + 2, 104, 10, "#1e1a28"); R(g, x - 52, FY + 2, 104, 1, "#3a3448");
      });
      // ---- station 1: TOO EASY (feather barbell, yawning) ----
      {
        const x = ST[0], a0 = at[0], up = PX.p(t, a0 + 0.3, 0.35, "back");
        const by = lerp(FY - 22, FY - 76, up), bx = x + 2;
        const P = person(g, x - 2, FY + 6, { h: 70, shirt: "#3a8ac0", pants: "#24243a", hair: "#2a1a10", hairStyle: "spiky", skin: "#d8a070",
          face: t > a0 + 0.6 && (t - a0) % 2.2 < 1.2 ? "yawn" : t > a0 + 0.6 ? "closed" : "flat", hands: { r: [bx + 10, by + 2] }, al: [[-4, 10], [4, 14]], lit: 1 });
        barbell(g, bx + 10, by, 46, [[5, "#5a6070"]]);
        const fx = bx + 26, fy = by - 4 + (t > a0 + 1 ? Math.round(Math.sin(t * 3) * 1) : 0);
        PX.line(g, fx - 6, fy + 2, fx + 6, fy - 2, "#e8e0d0"); for (let i = -5; i <= 5; i++) { R(g, fx + i, fy - 2 - Math.round(i * 0.33) - 1, 1, 2, "#f4efe4"); R(g, fx + i, fy + 1 - Math.round(i * 0.33), 1, 1, "#c8c0b0"); }
        if (t > a0 + 0.8) for (let i = 0; i < 3; i++) { const k = frac(t * 0.5 + i / 3); PX.alpha(g, 1 - k, () => PX.otext(g, i % 2 ? "z" : "Z", P.hx + 12 + k * 14 + i * 2, P.hy - 4 - k * 26, { size: 8, col: "#a8c8ff" })); }
      }
      // ---- station 2: TOO HARD (boulder flattens the lifter) ----
      {
        const x = ST[1], a1 = at[1], tr = t - a1, drop = tr > 0.9, lx = x - 34;
        const fk = drop ? Math.min(1, (tr - 0.9) / 0.22) : 0;
        const rockX = lerp(x + 10, lx + 6, PX.ease(fk, "in")), rockY = drop ? lerp(FY - 70, FY - 34, PX.ease(fk, "in")) - Math.sin(fk * Math.PI) * 14 : FY - 70 + (tr > 0 && tr < 0.9 ? Math.round(Math.sin(t * 40)) : 0);
        const shake = drop && tr < 1.3 ? Math.round(Math.sin(t * 70) * 2) : 0;
        g.save(); g.translate(shake, 0);
        if (!drop || fk < 0.9) {
          const strain = tr > 0;
        // boulder behind/next to the lifter first
          barbell(g, x + 10, FY - 40, 76, [[16, "#4a4a5a"]]);
          const P2 = person(g, lx, FY + 6, { h: 70, shirt: "#c04a4a", pants: "#24243a", hair: "#5a2a1a", hairStyle: "short", skin: "#e0a878",
            face: strain ? "strain" : "sweat", red: strain ? 0.6 : 0, hands: strain ? { l: [x - 26, FY - 38], r: [x - 22, FY - 38] } : undefined, ar: [3, 16], al: [-3, 16], legs: strain ? [-5, 5] : [0, 0], bob: strain ? 4 : 0, lit: 1, look: 2 });
          if (!strain) sweat(g, lx, FY - 52, t, 2, 3);
        } else {
          // flattened lifter: pancake + limbs sticking out
          const q = lx + 6;
          R(g, q - 34, FY + 1, 68, 5, "#c04a4a"); R(g, q - 34, FY + 1, 68, 1, "#e06a6a");
          R(g, q - 46, FY + 2, 12, 3, "#e0a878"); R(g, q + 34, FY + 2, 12, 3, "#e0a878"); R(g, q - 48, FY + 1, 3, 4, "#e0a878"); R(g, q + 45, FY + 1, 3, 4, "#e0a878");
          R(g, q - 20, FY + 5, 8, 3, "#1c1c26"); R(g, q + 14, FY + 5, 8, 3, "#1c1c26");
          barbell(g, x + 10, FY - 2, 76, [[16, "#4a4a5a"]]);
        }
        // boulder on the bar
        { const x = rockX;
        PX.circle(g, x, rockY, 38, "#4a3e3a"); PX.circle(g, x - 4, rockY - 4, 33, "#6a5a52"); PX.circle(g, x - 10, rockY - 12, 18, "#7e6c62"); PX.circle(g, x - 14, rockY - 18, 6, "#9a887a");
        PX.line(g, x + 8, rockY - 20, x + 18, rockY - 4, "#3a302c"); PX.line(g, x + 18, rockY - 4, x + 12, rockY + 10, "#3a302c"); PX.line(g, x - 20, rockY + 10, x - 6, rockY + 18, "#3a302c");
        R(g, x - 30, rockY + 22, 20, 3, "#3a2e2a"); PX.text(g, "999KG", x + 2, rockY + 2, { font: "v", size: 14, col: "#2a221e", align: "center" }); }
        g.restore();
        if (drop) {
          const k = (tr - 1.1) / 0.7;
          if (k > 0 && k < 1) PX.alpha(g, 1 - k, () => { for (let i = 0; i < 14; i++) { const a = Math.PI + (i / 13) * Math.PI; PX.circle(g, rockX + Math.cos(a) * (30 + k * 40), FY + Math.sin(a) * (8 + k * 14), Math.round(5 - k * 3), "#8a7a6a"); } });
          if (tr > 1.1) for (let i = 0; i < 3; i++) { const a = t * 4 + (i * 6.28) / 3; star4(g, Math.round(rockX + Math.cos(a) * 22), Math.round(rockY - 46 + Math.sin(a) * 5), 2, "#f7c948"); }
        }
      }
      // ---- station 3: JUST RIGHT (strain, then lift with sparkle) ----
      {
        const x = ST[2], a2 = at[2], tr = t - a2, lift = PX.p(t, a2 + 1.4, 0.4, "back"), straining = tr > 0 && tr < 1.4;
        const shakeB = straining ? Math.round(Math.sin(t * 50)) : 0;
        const by = tr <= 0 ? FY - 6 : straining ? FY - 24 - Math.min(10, tr * 8) + shakeB : lerp(FY - 34, FY - 80, lift);
        person(g, x, FY + 6, { h: 70, shirt: "#3aa86a", pants: "#24243a", hair: "#1a1a2a", hairStyle: "bun", skin: "#b07a50",
          face: tr <= 0 ? "neutral" : straining ? "strain" : "happy", red: straining ? Math.min(0.7, tr * 0.6) : 0,
          hands: tr > 0 ? { l: [x - 14, by + 1], r: [x + 14, by + 1] } : undefined, legs: straining ? [-6, 6] : [-2, 2], bob: straining ? 3 : 0, lit: -1 });
        barbell(g, x, by, 64, [[18, "#3d7cf5"], [12, "#2a5ab0"]]);
        if (straining) sweat(g, x, FY - 60, t, 2, 21);
        if (tr > 1.6) {
          const k = tr - 1.6;
          for (let i = 0; i < 8; i++) { const a = (i / 8) * 6.28 + k, r = 30 + Math.min(1, k * 2) * 12 + Math.sin(t * 6 + i) * 3; star4(g, Math.round(x + Math.cos(a) * r), Math.round(by + 10 + Math.sin(a) * r * 0.7), i % 2 ? 2 : 3, i % 3 ? "#f7c948" : "#fff6c8"); }
          PX.glow(g, x, by + 10, 60, "rgba(61,245,107,0.35)", 1);
        }
      }
      // ---- hanging signs ----
      const signs = [["TOO EASY", "#5fe3e8"], ["TOO HARD", "#ff5c5c"], ["JUST RIGHT", "#3df56b"]];
      ST.forEach((x, i) => {
        const k = PX.p(t, at[i] - 0.1, 0.45, "back"), y = lerp(-30, 58, k), sw = Math.sin((t - at[i]) * 5) * Math.exp(-(t - at[i]) * 2) * 3, lit = i === cur;
        const [txt, col] = signs[i], w = PX.tw(g, txt, { size: 8 }) + 16;
        PX.line(g, x - w / 2 + 6, 12, x - w / 2 + 6 + sw, y, "#5a5a70"); PX.line(g, x + w / 2 - 6, 12, x + w / 2 - 6 + sw, y, "#5a5a70");
        R(g, x - w / 2 + sw, y, w, 18, "#0e0e18"); PX.box(g, x - w / 2 + sw, y, w, 18, lit ? col : sh(col, 0.5));
        PX.text(g, txt, x + sw, y + 5, { size: 8, col: lit ? col : sh(col, 0.6), align: "center" });
        if (lit) PX.glow(g, x, y + 9, 50, col, 0.35);
      });
      PX.particles(g, 31, 40, t, [20, 30, 600, 250], { vy: -4, vx: 1, col: "#ffe8c0", a: 0.5 });
      PX.vignette(g, 0.55);
    };
  };

  const candle = (LB.candle = (g, x, y, t, h) => {   // base at (x, y)
    h = h || 16; R(g, x - 3, y - h, 7, h, "#e8dcc0"); R(g, x - 3, y - h, 2, h, "#fff4dc"); R(g, x + 2, y - h, 2, h, "#c8b898"); R(g, x - 6, y - 2, 13, 3, "#8a6a3a"); R(g, x - 6, y - 2, 13, 1, "#b08a50");
    const fl = Math.round(Math.sin(t * 13) + Math.sin(t * 7.3)), fx = x + (Math.sin(t * 9) > 0.6 ? 1 : 0);
    R(g, fx - 1, y - h - 7 + (fl > 1 ? -1 : 0), 3, 6, "#ffb040"); R(g, fx, y - h - 9 + (fl > 1 ? -1 : 0), 1, 3, "#ffd070"); R(g, fx, y - h - 5, 1, 3, "#fff2c0");
    PX.glow(g, fx, y - h - 5, 34 + fl * 2, "rgba(255,180,90,0.55)", 1);
  });

  // ================= eighty: adventurer's tent, map 80% charted, 20% dragons =================
  K.eighty = (o) => {
    const ER = PX.rnd(80);
    const trees = [...Array(46)].map(() => [96 + ER() * 350, 172 + ER() * 136]);
    const fogB = [...Array(26)].map(() => [ER(), ER(), 6 + ER() * 14, ER() * 6.28]);
    const eyes = [[490, 200, 3.0], [520, 280, 3.6], [478, 252, 4.2], [530, 226, 4.8]];
    return (g, t, d, c) => {
      const grow = T(o, "grow", 6.5, d, 9.9), rev = T(o, "reveal", 0.3, d, 9.9);
      const MX0 = 96, MX1 = 548, MY0 = 166, MY1 = 316, FX = MX0 + 0.8 * (MX1 - MX0);
      const sw = Math.sin(t * 1.3) * 3, LX = 320 + sw, LY = 52;
      // ---- far: tent opening with night outside ----
      PX.par(g, c, 0.3, () => {
        PX.vgrad(g, -30, -20, 700, 380, "120c16", "1e140e", 6);
        PX.vgrad(g, 50, 30, 120, 210, "0c1430", "1a2244", 5);
        const r = PX.rnd(5); for (let i = 0; i < 30; i++) { const x = 50 + r() * 120, y = 40 + r() * 80; g.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t + i)); R(g, x, y, 1, 1, "#fff"); } g.globalAlpha = 1;
        for (let x = 50; x < 170; x++) { const h2 = 20 + Math.sin(x * 0.08) * 8 + Math.sin(x * 0.21) * 4; R(g, x, 140 - h2, 1, h2 + 100, "#0a0e1e"); }
        PX.glow(g, 118, 134, 24, "rgba(255,140,60,0.6)", 1); R(g, 116, 131, 4, 3, "#ffb050");
      });
      // ---- mid: peaked tent canvas, seams radiating from the ridge, door opening on the left ----
      PX.par(g, c, 0.6, () => {
        for (let y = -10; y < 240; y++) {
          const half = 30 + Math.max(0, y) * 2.1, xl = 320 - half, xr = 320 + half;
          R(g, -30, y, 700, 1, "#22161a");
          const ohw = y > 40 ? ((y - 40) / 160) * 50 : -1;
          if (ohw < 0) R(g, xl, y, xr - xl, 1, "#46302a");
          else { R(g, xl, y, 110 - ohw - xl, 1, "#46302a"); R(g, 110 + ohw, y, xr - 110 - ohw, 1, "#46302a"); }
        }
        for (const bx of [-260, -60, 120, 320, 520, 700, 900]) { PX.line(g, 320, 0, bx, 240, "#36241f"); PX.line(g, 321, 0, bx + 1, 240, "#5a4034"); }
        // roof panel edges
        PX.line(g, 290, 0, -30, 152, "#5a4034"); PX.line(g, 350, 0, 670, 152, "#5a4034");
        // tied-back door flaps
        for (let y = 40; y < 240; y++) { const ohw = ((y - 40) / 160) * 50, bulge = Math.round(Math.sin(((y - 40) / 200) * Math.PI) * 6);
          R(g, 110 - ohw - 4 - bulge, y, 4 + bulge, 1, "#5e4436"); R(g, 110 - ohw - 1, y, 1, 1, "#7a5a46"); R(g, 110 + ohw, y, 4 + bulge, 1, "#5e4436"); R(g, 110 + ohw, y, 1, 1, "#2e1e1a"); }
        R(g, 72, 120, 10, 3, "#8a6a3a"); R(g, 140, 120, 10, 3, "#8a6a3a");
        // hanging rope + sword + shield on the right wall
        R(g, 560, 70, 3, 70, "#8a8a9a"); R(g, 554, 66, 15, 4, "#6a4a2a"); R(g, 559, 140, 5, 6, "#4a3a2a"); R(g, 561, 70, 1, 70, "#d0d0e0");
        PX.circle(g, 600, 110, 18, "#5a3a24"); PX.circle(g, 600, 110, 15, "#8a2a2a"); PX.circle(g, 600, 110, 5, "#c8a050"); R(g, 598, 94, 4, 32, "#c8a050");
        // progress chart pinned to the canvas
        const pk = PX.p(t, rev + 0.3, 2.2, "out"), fill = 0.8 * pk;
        R(g, 186, 74, 268, 50, "#76623e"); R(g, 186, 74, 268, 1, "#9a845a"); R(g, 186, 123, 268, 1, "#8a7048");
        R(g, 196, 70, 4, 6, "#8a2a2a"); R(g, 440, 70, 4, 6, "#8a2a2a");
        R(g, 196, 86, 248, 26, "#2a2018"); R(g, 198, 88, 244 * fill, 22, "#3fae5a"); R(g, 198, 88, 244 * fill, 2, "#7aee8a"); R(g, 198, 108, 244 * fill, 2, "#2a7a3a");
        R(g, 198 + 244 * 0.8, 88, 244 * 0.2, 22, "#140e18"); for (let i = 0; i < 6; i++) R(g, 198 + 244 * 0.8 + 4 + i * 8, 90 + (i % 2) * 8, 3, 3, "#2a1a30");
        if (pk > 0.3) PX.text(g, Math.round(fill * 100) + "% KNOWN", 198 + 244 * fill / 2, 95, { size: 8, col: "#0e2414", align: "center" });
        if (pk > 0.9) PX.text(g, "20%", 198 + 244 * 0.9, 95, { size: 8, col: "#ff6a5a", align: "center" });
      });
      // lantern (swinging) + light
      R(g, 320, 0, 1, 34, "#3a3a3a"); PX.line(g, 320, 34, LX, LY - 14, "#5a5a5a");
      R(g, LX - 7, LY - 14, 14, 3, "#2a2420"); R(g, LX - 6, LY - 11, 12, 18, "#ffcf7a"); R(g, LX - 6, LY - 11, 2, 18, "#3a3028"); R(g, LX + 4, LY - 11, 2, 18, "#3a3028"); R(g, LX - 1, LY - 11, 2, 18, "#3a3028");
      R(g, LX - 8, LY + 7, 16, 3, "#2a2420"); R(g, LX - 2, LY - 4, 3, 6, "#fff4c0");
      PX.glow(g, LX, LY, 190, "rgba(255,160,70,0.22)", 1); PX.glow(g, LX, LY, 36, "rgba(255,210,140,0.7)", 1);
      // ---- table ----
      for (let y = 146; y < 336; y++) { const k = (y - 146) / 190, w = 540 + k * 140; R(g, 320 - w / 2, y, w, 1, (y % 13 === 0) ? "#2e1e14" : "#3e2a1c"); R(g, 320 - w / 2, y, 2, 1, "#5a3e28"); }
      R(g, 50, 146, 540, 1, "#6a4a30");
      R(g, 0, 336, 640, 10, "#3a2616"); R(g, 0, 336, 640, 1, "#7a5638"); R(g, 0, 346, 640, 14, "#160e08");
      PX.glow(g, LX, 240, 240, "rgba(255,170,90,0.1)", 1);
      // ---- map parchment ----
      R(g, MX0 + 4, MY0 + 5, MX1 - MX0, MY1 - MY0, "rgba(0,0,0,0.45)");
      R(g, MX0, MY0, MX1 - MX0, MY1 - MY0, "#76623e"); R(g, MX0 + 6, MY0 + 5, MX1 - MX0 - 12, MY1 - MY0 - 10, "#857048"); R(g, MX0, MY0, MX1 - MX0, 1, "#a08a5c");
      const r9 = PX.rnd(9); for (let i = 0; i < 90; i++) R(g, MX0 + r9() * (MX1 - MX0), MY0 + r9() * (MY1 - MY0), 2, 1, "#74603a");
      // rolled ends
      for (const [rx, dir] of [[MX0 - 8, 1], [MX1, -1]]) { R(g, rx, MY0 - 4, 8, MY1 - MY0 + 8, "#76623e"); R(g, rx + (dir > 0 ? 0 : 6), MY0 - 4, 2, MY1 - MY0 + 8, "#8a6a40"); R(g, rx + (dir > 0 ? 5 : 1), MY0 - 4, 1, MY1 - MY0 + 8, "#c8ae78"); }
      // charted land, revealed by an ink front sweeping left -> right
      const front = MX0 + (FX - MX0) * PX.p(t, rev, 2.4, "io");
      g.save(); g.beginPath(); g.rect(MX0, MY0, front - MX0, MY1 - MY0); g.clip();
      // coast/sea
      R(g, MX0, MY0, 60, MY1 - MY0, "#4e6a68"); for (let y = MY0; y < MY1; y += 6) R(g, MX0 + 4 + ((y * 7) % 20), y, 8, 1, "#3e5856");
      for (let y = MY0; y < MY1; y++) R(g, MX0 + 56 + Math.round(Math.sin(y * 0.15) * 6 + Math.sin(y * 0.05) * 8), y, 3, 1, "#5a6a4a");
      for (const [cx2, cy2, r2] of [[190, 214, 40], [300, 262, 46], [380, 200, 36], [240, 290, 26], [420, 280, 30]]) { ell(g, cx2, cy2, r2, Math.round(r2 * 0.55), "#66764a"); ell(g, cx2 + 4, cy2 + 2, r2 - 8, Math.round(r2 * 0.4), "#5a6a42"); }
      for (const [tx, ty] of trees) { R(g, tx, ty, 3, 3, "#4a6a3a"); R(g, tx + 1, ty - 1, 1, 1, "#6a8a4a"); }
      for (const [mx, my] of [[260, 200], [276, 196], [292, 204], [350, 240], [366, 236]]) { for (let i = 0; i < 9; i++) R(g, mx - i, my + i, 2 * i + 1, 1, i < 3 ? "#f0e8d8" : "#8a6a48"); R(g, mx, my + 4, 1, 5, "#5a4028"); }
      PX.line(g, 150, MY0, 180, 230, "#4a7aa0"); PX.line(g, 180, 230, 232, 250, "#4a7aa0"); PX.line(g, 232, 250, 300, 300, "#4a7aa0"); PX.line(g, 233, 250, 301, 300, "#4a7aa0");
      for (const [hx, hy] of [[206, 262], [336, 284], [404, 222]]) { R(g, hx, hy, 7, 5, "#a8483a"); R(g, hx - 1, hy - 2, 9, 2, "#6a2a22"); R(g, hx + 3, hy + 2, 2, 3, "#3a2018"); }
      for (let i = 0; i < 26; i++) { const k = i / 26; if (i % 2 === 0) R(g, lerp(206, 446, k), 262 + Math.sin(k * 6) * 18 - k * 30, 2, 2, "#7a2a22"); }
      g.restore();
      if (front < FX - 1) { R(g, front, MY0, 2, MY1 - MY0, "#2a1a10"); PX.glow(g, front, (MY0 + MY1) / 2, 40, "rgba(255,200,120,0.25)", 1); }
      // compass rose
      const cx3 = 130, cy3 = 290; PX.circle(g, cx3, cy3, 12, "#76623e"); for (const [dx, dy] of [[0, -1], [1, 0], [0, 1], [-1, 0]]) PX.line(g, cx3, cy3, cx3 + dx * 14, cy3 + dy * 14, "#5a3a22"); R(g, cx3 - 1, cy3 - 19, 3, 3, "#8a2a2a");
      // fog of the unknown 20%
      const gt = t - grow, treeK = PX.p(t, grow + 1.0, 1.0, "out"), clearR = treeK * 34;
      const TX = 503, TY = 270;
      g.save(); g.beginPath(); g.rect(FX - 10, MY0 - 6, MX1 - FX + 22, MY1 - MY0 + 12); g.clip();
      R(g, FX, MY0, MX1 - FX, MY1 - MY0, "#1a1220");
      for (const [u, v, r2, ph] of fogB) {
        const fx = FX - 4 + u * (MX1 - FX + 8) + Math.sin(t * 0.6 + ph) * 6, fy = MY0 + v * (MY1 - MY0) + Math.cos(t * 0.5 + ph) * 4;
        if (Math.hypot(fx - TX, fy - TY) < clearR + r2 * 0.4) continue;
        PX.circle(g, fx, fy, Math.round(r2), Math.sin(ph) > 0 ? "#2a2034" : "#22182c");
        PX.circle(g, fx - 2, fy - 2, Math.max(1, Math.round(r2 * 0.5)), "#33283e");
      }
      for (let y = MY0; y < MY1; y++) R(g, FX - 6 + Math.round(Math.sin(y * 0.2 + t * 2) * 3), y, 6, 1, "#2a2034");
      if (clearR > 0) { ell(g, TX, TY, Math.round(clearR), Math.round(clearR * 0.8), "#6a6044"); ell(g, TX, TY + 2, Math.round(clearR * 0.75), Math.round(clearR * 0.55), "#5e7048"); for (let i = 0; i < 8; i++) R(g, TX - clearR * 0.6 + ((i * 37) % Math.max(1, Math.round(clearR * 1.2))), TY - 8 + ((i * 13) % 20), 3, 3, "#3e5a34"); }
      g.restore();
      // monster eyes
      for (const [ex, ey, et] of eyes) {
        if (t < et) continue;
        if (treeK > 0.2 && Math.hypot(ex - TX, ey - TY) < 60) continue;
        const bl = (t + et * 3) % 2.6 < 0.12, k = PX.p(t, et, 0.3, "out");
        if (!bl) { R(g, ex - 5, ey, 4, Math.round(2 * k) + 1, "#ff3a3a"); R(g, ex + 2, ey, 4, Math.round(2 * k) + 1, "#ff3a3a"); R(g, ex - 4, ey, 1, 1, "#fff0a0"); R(g, ex + 3, ey, 1, 1, "#fff0a0"); }
        PX.glow(g, ex, ey + 1, 14, "rgba(255,60,60,0.6)", bl ? 0.2 : k);
      }
      // a tentacle pokes out of the fog and retreats (gag)
      const tk2 = t - (grow - 1.2);
      if (tk2 > 0 && tk2 < 1.0) { const e = Math.sin((tk2 / 1.0) * Math.PI); for (let i = 0; i < 14 * e; i++) { const x = FX + 6 - i * 2, y = 210 + Math.sin(i * 0.6 + t * 8) * 4; R(g, x, y, 4 - (i > 9 ? 1 : 0), 4 - (i > 9 ? 1 : 0), "#5a2a6a"); R(g, x, y, 2, 1, "#8a4a9a"); } }
      // HERE BE DRAGONS
      const hb = PX.p(t, 4.5 * d / 9.9, 0.5, "out") * (1 - 0.6 * treeK);
      if (hb > 0) PX.alpha(g, hb, () => { PX.otext(g, "HERE BE", (FX + MX1) / 2, MY0 + 6, { size: 8, col: "#ff8a6a", align: "center", outline: "#140a10" }); PX.otext(g, "DRAGONS", (FX + MX1) / 2, MY0 + 17, { size: 8, col: "#ff8a6a", align: "center", outline: "#140a10" }); });
      // sapling -> glowing tree
      if (gt > 0) {
        const s1 = PX.p(t, grow, 0.5, "back"), s2 = treeK;
        const trunkH = Math.round(6 + 26 * s2 + 4 * s1);
        PX.glow(g, TX, TY - trunkH / 2, 30 + 46 * s2, "rgba(95,227,180,0.32)", 1);
        R(g, TX - 1, TY - trunkH, 3, trunkH, "#6a4a2a"); R(g, TX - 1, TY - trunkH, 1, trunkH, "#9a7a4a");
        if (s2 < 0.3) { R(g, TX - 4, TY - trunkH - 2, 4, 2, "#6aee8a"); R(g, TX + 1, TY - trunkH - 3, 4, 2, "#6aee8a"); }
        else {
          const cr = Math.round(6 + 14 * s2), cy4 = TY - trunkH - cr + 6;
          PX.circle(g, TX, cy4, cr, "#2a9a6a"); PX.circle(g, TX - Math.round(cr * 0.5), cy4 + 4, Math.round(cr * 0.7), "#2a8a5e"); PX.circle(g, TX + Math.round(cr * 0.5), cy4 + 3, Math.round(cr * 0.7), "#2a8a5e");
          PX.circle(g, TX + 2, cy4 - 3, Math.round(cr * 0.6), "#5fe3b0"); PX.circle(g, TX + 3, cy4 - 5, Math.round(cr * 0.3), "#a8ffd8");
          for (let i = 0; i < 6; i++) { const a = t * 1.5 + i; R(g, TX + Math.cos(a) * (cr + 6), cy4 + Math.sin(a) * (cr * 0.7 + 4), 1, 1, "#c8fff0"); }
        }
      }
      // GROWTH arrows
      const ga = PX.p(t, grow + 1.6, 0.4, "back");
      if (ga > 0) {
        for (const [ax, ph] of [[TX - 34, 0], [TX + 34, 0.5]]) { const y = TY - 30 - ((t * 20 + ph * 20) % 20); PX.alpha(g, ga, () => { for (let i = 0; i < 5; i++) R(g, ax - i, y + i, 2 * i + 1, 1, "#3df56b"); R(g, ax - 1, y + 5, 3, 8, "#3df56b"); }); }
        PX.alpha(g, ga, () => PX.otext(g, "GROWTH", TX, TY + 10, { size: 8, col: "#3df56b", align: "center" }));
      }
      // ---- foreground props ----
      candle(g, 70, 318, t, 18);
      R(g, 572, 300, 14, 14, "#1a1a2a"); R(g, 572, 300, 14, 2, "#3a3a5a"); R(g, 574, 296, 10, 4, "#2a2a3a");
      PX.line(g, 580, 296, 600, 262, "#e8e0d0"); PX.line(g, 581, 296, 601, 262, "#c8c0b0"); for (let i = 0; i < 10; i++) R(g, 590 + i, 280 - i * 1.7, 3, 1, "#f4efe4");
      for (const [cx2, cy2] of [[110, 330], [118, 332], [114, 327]]) { ell(g, cx2, cy2, 4, 2, "#c8a030"); R(g, cx2 - 2, cy2 - 1, 2, 1, "#ffe080"); }
      R(g, 470, 322, 46, 4, "#8a8a9a"); R(g, 470, 322, 46, 1, "#d0d0e0"); R(g, 460, 320, 12, 8, "#5a3a24"); R(g, 457, 319, 3, 10, "#c8a050");
      PX.particles(g, 21, 30, t, [120, 40, 400, 200], { vy: -3, vx: 1, col: "#ffd8a0", a: 0.55 });
      PX.vignette(g, 0.55);
    };
  };

  // cloud bank: circles with a flat bottom, moon-lit top edge
  const cloud = (LB.cloud = (g, x, y, w, col, hl) => {
    const n = Math.max(3, Math.round(w / 14));
    for (let i = 0; i < n; i++) { const cx = x + (i + 0.5) * (w / n), r = Math.round(8 + Math.sin(i * 2.1 + x) * 3 + (i > 0 && i < n - 1 ? 5 : 0)); PX.circle(g, cx, y - r * 0.4, r, col); PX.circle(g, cx - 2, y - r * 0.4 - 2, Math.max(1, r - 3), hl); PX.circle(g, cx, y - r * 0.4 + 1, Math.max(1, r - 3), col); }
    R(g, x, y - 2, w, 6, col);
  });
  // climber seen from behind on a ladder (feet at x, y), phase = climbing cycle
  const climber = (LB.climber = (g, x, y, ph, o) => outlined(g, (b) => {
    o = o || {}; const shirt = o.shirt || "#e0703a", pants = "#2d3550", skin = "#d8a070", hair = "#2a1a10";
    const a = Math.round(Math.sin(ph * Math.PI) * 5), lg = -a;
    limb(b, x - 4, y - 18, x - 5, y - 3 + Math.min(0, lg), 5, pants, sh(pants, 0.7)); limb(b, x + 4, y - 18, x + 5, y - 3 + Math.min(0, -lg), 5, pants, sh(pants, 0.7));
    R(b, x - 7, y - 3 + Math.min(0, lg), 5, 3, "#1c1c26"); R(b, x + 3, y - 3 + Math.min(0, -lg), 5, 3, "#1c1c26");
    R(b, x - 8, y - 34, 16, 17, shirt); R(b, x - 8, y - 34, 3, 17, sh(shirt, 0.72)); R(b, x + 6, y - 34, 2, 17, sh(shirt, 1.25)); R(b, x - 6, y - 35, 12, 1, sh(shirt, 1.2));
    if (o.pack) { R(b, x - 6, y - 32, 12, 12, "#5a3a6a"); R(b, x - 6, y - 32, 12, 2, "#7a5a8a"); }
    limb(b, x - 7, y - 32, x - 12, y - 46 - a, 4, shirt, sh(shirt, 0.7)); limb(b, x + 7, y - 32, x + 12, y - 46 + a, 4, shirt, sh(shirt, 0.7));
    R(b, x - 14, y - 49 - a, 4, 4, skin); R(b, x + 10, y - 49 + a, 4, 4, skin);
    R(b, x - 2, y - 37, 4, 3, sh(skin, 0.8));
    R(b, x - 6, y - 48, 12, 11, hair); R(b, x - 5, y - 49, 10, 1, hair); R(b, x - 4, y - 48, 6, 1, sh(hair, 1.6)); R(b, x - 7, y - 43, 1, 3, skin); R(b, x + 6, y - 43, 1, 3, skin);
  }));

  // ================= projects_ladder: a ladder through the clouds, 4 project islands =================
  K.projects_ladder = (o) => {
    const LR = PX.rnd(123), H = 1360;
    const stars = [...Array(170)].map(() => [LR() * 640, LR() * 900, LR() * 6.28, LR() < 0.15 ? 2 : 1]);
    const cloudsFar = [...Array(14)].map((_, i) => [LR() * 700 - 60, 120 + i * 85 + LR() * 30, 60 + LR() * 80]);
    const cloudsNear = [...Array(7)].map((_, i) => [LR() * 700 - 80, 200 + i * 190, 90 + LR() * 70]);
    const ISL = [[160, 1080, "DOWNLOADS CLEANER"], [480, 800, "PRICE SCRAPER"], [160, 520, "MULTIPLAYER GAME"], [480, 240, "MINI GIT"]];
    const skyAt = (wy) => { const k = cl(wy / H, 0, 1), A = [7, 10, 30], B = [24, 26, 66], Cc = [70, 42, 88]; const m = k < 0.6 ? A.map((v, i) => lerp(v, B[i], k / 0.6)) : B.map((v, i) => lerp(v, Cc[i], (k - 0.6) / 0.4)); return `rgb(${m.map(Math.round).join(",")})`; };
    return (g, t, d, c) => {
      const at = T(o, "at", [3.0, 7.8, 12.6, 17.0], d, 22.8), climb = T(o, "climb", 19, d, 22.8);
      const camKF = [[0, H - 360], [0.8, H - 360]], clKF = [[0, H - 64], [0.8, H - 64]];
      ISL.forEach(([, iy], k) => { camKF.push([at[k] - 0.25, iy - 210], [at[k] + 1.3, iy - 210]); clKF.push([at[k] - 0.1, iy + 4], [at[k] + 1.4, iy + 4]); });
      camKF.push([climb - 0.3, -40]); clKF.push([climb - 0.1, 104]);
      const camT = PX.KF(camKF, t), clY = PX.KF(clKF, t), clV = Math.abs(PX.KF(clKF, t + 0.05) - clY);
      const Y = (wy) => Math.round(wy - camT);
      // ---- sky (world-height gradient) ----
      for (let y = 0; y < 360; y += 4) R(g, 0, y, 640, 4, skyAt(camT + y));
      // ---- far: stars, moon, far clouds ----
      PX.par(g, c, 0.2, () => {
        for (const [x, wy, ph, sz] of stars) { const y = wy - camT * 0.5 + 40; if (y < -2 || y > 362) continue; g.globalAlpha = 0.35 + 0.65 * Math.abs(Math.sin(t * 1.4 + ph)); R(g, x, y, sz, sz, "#ffffff"); }
        g.globalAlpha = 1;
        const my = 70 - camT * 0.08 + 60; PX.circle(g, 540, my, 16, "#f4f1d0"); PX.circle(g, 545, my - 3, 14, "#e4e0b8"); PX.glow(g, 540, my, 60, "rgba(240,235,200,0.25)", 1);
      });
      PX.par(g, c, 0.5, () => {
        for (const [x, wy, w] of cloudsFar) { const y = wy - camT * 0.7 + 260, xx = ((x + t * 6) % 760) - 60; if (y < -40 || y > 400) continue; cloud(g, xx, y, w, "#2a2a52", "#3a3a6a"); }
        for (const [fx, fwy, fw] of [[60, 300, 40], [560, 520, 56], [90, 820, 34], [600, 1000, 44], [40, 1180, 50], [520, 160, 36]]) { const y = fwy - camT * 0.6 + 200 + Math.sin(t * 0.8 + fx) * 2; if (y < -40 || y > 400) continue;
          for (let r = 0; r < fw * 0.6; r++) { const w = Math.round(fw * Math.pow(1 - r / (fw * 0.6), 1.3)); R(g, fx - w, y + r, w * 2, 1, "#1e1c3a"); } ell(g, fx, y, fw, 4, "#24304a"); R(g, fx - 4, y - 10, 2, 10, "#1e1c3a"); PX.circle(g, fx - 3, y - 12, 5, "#1e2a3a"); }
      });
      // ground: hills + far city at the bottom of the world
      const gy = Y(H - 60);
      if (gy < 380) {
        for (let x = 0; x < 640; x++) { const hh2 = 30 + Math.sin(x * 0.02) * 10 + Math.sin(x * 0.07) * 4; R(g, x, gy - hh2 + 20, 1, 400, "#1a1630"); }
        { const r = PX.rnd(44); let bx = -4; while (bx < 640) { const bw = 10 + Math.floor(r() * 20), bh = 12 + r() * 34; R(g, bx, gy + 14 - bh, bw, bh + 10, r() < 0.5 ? "#141833" : "#191d3d");
            for (let wy = gy + 18 - bh; wy < gy + 12; wy += 5) for (let wx = bx + 2; wx < bx + bw - 2; wx += 4) if (r() < 0.3) R(g, wx, wy, 2, 2, Math.sin(t * 0.5 + wx + wy) > -0.8 ? "#f7c948" : "#3a3a20"); bx += bw + 1; } }
        for (let x = 0; x < 640; x++) { const hh2 = 14 + Math.sin(x * 0.012 + 1) * 10; R(g, x, gy + 20 - hh2, 1, 400, "#1e2a24"); R(g, x, gy + 20 - hh2, 1, 1, "#3a5a40"); }
        ell(g, 320, gy + 22, 60, 10, "#22322a"); R(g, 300, gy + 10, 4, 12, "#4a301c"); R(g, 338, gy + 10, 4, 12, "#4a301c");
        for (const [lx, lc] of [[220, "#ffcf8a"], [430, "#ffcf8a"]]) { R(g, lx, gy - 6, 2, 26, "#2a2e3c"); R(g, lx - 2, gy - 9, 6, 4, "#3a3f50"); PX.glow(g, lx + 1, gy - 7, 24, "rgba(255,207,138,0.6)", 1); }
      }
      // ---- ladder ----
      const top = Y(80), bot = Y(H - 40);
      const y0 = Math.max(-4, top), y1 = Math.min(364, bot);
      if (y1 > y0) {
        for (const rx of [300, 338]) { R(g, rx, y0, 4, y1 - y0, "#7a5232"); R(g, rx, y0, 1, y1 - y0, "#b0804e"); R(g, rx + 3, y0, 1, y1 - y0, "#4a301c"); }
        for (let wy = Math.ceil((camT - 10) / 14) * 14; wy < camT + 370; wy += 14) {
          if (wy < 80 || wy > H - 40) continue; const y = Y(wy), passed = wy > clY;
          R(g, 304, y, 34, 3, passed ? "#9a6a40" : "#6a4628"); R(g, 304, y, 34, 1, passed ? "#d8a060" : "#9a7048");
          if (passed && wy < clY + 200) PX.alpha(g, 1 - (wy - clY) / 200, () => R(g, 304, y + 3, 34, 1, "#5fe3e8"));
        }
        if (top > -20) { PX.glow(g, 320, top, 50, "rgba(247,201,72,0.4)", 1); }
      }
      // ---- islands ----
      const island = (cx, wy, k, pal, sil) => {
        const y = Y(wy), r0 = PX.rnd(cx + wy);
        // rocky underside: jagged rows, dithered strata, lit left edge
        for (let r = 0; r < 70; r++) {
          const base = 94 * Math.pow(1 - r / 70, 1.25), wl = Math.round(base + Math.sin(r * 0.9 + cx) * 4 + Math.sin(r * 2.3) * 2), wr = Math.round(base + Math.cos(r * 0.7 + wy) * 4 + Math.sin(r * 1.7 + 1) * 2);
          if (wl + wr <= 2) continue;
          const yy = y + 6 + r, band = Math.floor(r / 7) % 2;
          R(g, cx - wl, yy, wl + wr, 1, band ? pal[2] : pal[3]);
          if (!sil) { for (let x = cx - wl + (r % 2); x < cx + wr; x += 6) R(g, x, yy, 1, 1, band ? pal[3] : pal[2]); R(g, cx - wl, yy, 3, 1, pal[4]); R(g, cx + wr - 3, yy, 3, 1, sh("#1a1426", 1)); }
        }
        if (!sil) {
          for (let i = 0; i < 7; i++) { const dx = -70 + i * 22 + Math.round(r0() * 8), ln = 8 + Math.round(r0() * 18); for (let j = 0; j < ln; j++) R(g, cx + dx + Math.round(Math.sin(j * 0.5 + i) * 1.5), y + 10 + j, 1, 1, pal[1]); }
          for (const [dx, dy] of [[-34, 26], [8, 38], [36, 22], [-12, 50]]) { R(g, cx + dx, y + dy, 3, 3, pal[5]); R(g, cx + dx, y + dy, 1, 1, "#e8ffff"); PX.glow(g, cx + dx + 1, y + dy + 1, 8, "rgba(95,227,232,0.6)", 1); }
        }
        ell(g, cx, y + 5, 97, 9, sil ? pal[1] : "#2e2a20"); ell(g, cx, y + 3, 96, 9, pal[1]); ell(g, cx, y + 1, 94, 8, pal[0]); R(g, cx - 82, y - 5, 164, 1, pal[6]);
        { const q = (col) => (sil ? pal[0] : col), r1 = PX.rnd(cx * 3 + wy);
          for (let i = 0; i < 26; i++) { const gx2 = cx - 86 + i * 6.6 + Math.round(r1() * 3); R(g, gx2, y - 6 - Math.round(r1() * 3), 1, 3, pal[6]); }
          for (const [dx, col] of [[-78, "#f25ca8"], [-52, "#f7c948"], [70, "#f25ca8"], [82, "#ffffff"]]) { R(g, cx + dx, y - 4, 2, 2, q(col)); }
          const tx2 = cx < 320 ? cx - 84 : cx + 78; R(g, tx2, y - 18, 3, 16, q("#4a3020")); PX.circle(g, tx2 + 1, y - 24, 8, q("#2a6a3a")); PX.circle(g, tx2 + 3, y - 27, 5, q("#3a8a4a")); R(g, tx2 + 3, y - 30, 2, 1, q("#7ac87a"));
        }
      };
      const PAL = ["#3a8a4a", "#2a6a3a", "#4a3a4a", "#3a2e40", "#5a4a5a", "#5fe3e8", "#7ac87a"], SIL = ["#1a1830", "#161428", "#161428", "#141226", "#161428", "#1a1830", "#1a1830"];
      ISL.forEach(([cx, wy, title], k) => {
        const y = Y(wy); if (y < -120 || y > 440) return;
        const rk = PX.p(t, at[k], 0.5, "out");
        // bridge plank to the ladder
        const bx0 = cx < 320 ? cx + 80 : 342, bx1 = cx < 320 ? 300 : cx - 80;
        island(cx, wy, rk, PAL);
        if (rk < 1) PX.alpha(g, 1 - rk, () => island(cx, wy, rk, SIL, true));
        R(g, Math.min(bx0, bx1), y - 1, Math.abs(bx1 - bx0), 4, rk > 0 ? "#7a5232" : "#1a1830"); R(g, Math.min(bx0, bx1), y - 1, Math.abs(bx1 - bx0), 1, rk > 0 ? "#b0804e" : "#1a1830");
        if (t < at[k]) return;
        const lt = t - at[k];
        // unlock ring
        if (lt < 0.8) PX.alpha(g, 1 - lt / 0.8, () => { const r = Math.round(20 + lt * 140); for (let i = 0; i < 24; i++) { const a = (i / 24) * 6.28; R(g, cx + Math.cos(a) * r, y - 20 + Math.sin(a) * r * 0.5, 2, 2, "#fff6c8"); } });
        PX.glow(g, cx, y - 26, 80, "rgba(95,227,232,0.18)", rk);
        const pop = PX.p(t, at[k] + 0.1, 0.4, "back");
        PX.alpha(g, Math.min(1, lt * 4), () => {
          // title on a hanging sign
          const tw2 = PX.tw(g, title, { size: 8 }) + 14, sy = y - 86 + Math.round((1 - pop) * -10);
          R(g, cx - tw2 / 2 + 6, sy + 15, 2, 70, "#5a3a24"); R(g, cx + tw2 / 2 - 8, sy + 15, 2, 70, "#5a3a24");
          R(g, cx - tw2 / 2, sy, tw2, 16, "#4a3020"); R(g, cx - tw2 / 2, sy, tw2, 1, "#8a6040"); R(g, cx - tw2 / 2, sy + 15, tw2, 1, "#2a1a10");
          PX.text(g, title, cx, sy + 4, { size: 8, col: "#f7c948", align: "center" });
          if (k === 0) { // DOWNLOADS CLEANER: files fly from a messy pile into folders
            const fcols = ["#f7c948", "#5fe3e8", "#f25ca8"];
            fcols.forEach((col, i) => { const fx = cx + 14 + i * 24, fy = y - 18; R(g, fx, fy - 3, 8, 3, sh(col, 0.75)); R(g, fx, fy, 18, 14, sh(col, 0.85)); R(g, fx, fy + 2, 18, 12, col); R(g, fx, fy + 2, 18, 1, sh(col, 1.3)); PX.text(g, ["IMG", "DOC", "ZIP"][i], fx + 9, fy + 3, { font: "v", size: 10, col: "#1a1420", align: "center" }); });
            const r = PX.rnd(17), left = Math.max(0, 9 - Math.floor(lt * 2.2));
            for (let i = 0; i < left; i++) { const px2 = cx - 74 + r() * 50, py2 = y - 10 - r() * 14; R(g, px2, py2, 7, 9, "#d8dee8"); R(g, px2, py2, 7, 2, fcols[i % 3]); R(g, px2 + 5, py2, 2, 2, "#8a90a0"); }
            for (let i = 0; i < 3; i++) { const ph2 = frac(lt * 1.1 + i / 3), tgt = cx + 18 + (i % 3) * 24, sx2 = cx - 50; const fx = lerp(sx2, tgt, ph2), fy = y - 14 - Math.sin(ph2 * Math.PI) * 34; R(g, fx, fy, 7, 9, "#d8dee8"); R(g, fx, fy, 7, 2, fcols[i]); }
          } else if (k === 1) { // PRICE SCRAPER: price tag drops, phone buzzes
            const sw2 = Math.sin(t * 3) * 3, tx = cx - 40 + sw2, ty = y - 40, cyc = lt % 3, drp = cyc > 1.2;
            R(g, cx - 54, y - 64, 30, 2, "#8a8a9a"); R(g, cx - 54, y - 64, 2, 64, "#6a6a7a"); PX.line(g, cx - 40, y - 62, tx, ty, "#c8c8d0");
            R(g, tx - 14, ty, 32, 18, "#e8c060"); R(g, tx - 14, ty, 32, 1, "#ffe090"); R(g, tx - 10, ty + 7, 3, 3, "#3a2a10");
            PX.text(g, drp ? "$59" : "$99", tx + 4, ty + 3, { size: 8, col: drp ? "#1a7a3a" : "#5a2a10", align: "center" });
            if (drp) { const dk = PX.p(cyc, 1.2, 0.3, "back"); for (let i = 0; i < 5; i++) R(g, tx + 24 - i, ty + 4 + dk * 6 - 5 + i, 2 * i + 1, 1, "#ff5c5c"); R(g, tx + 23, ty - 6 + dk * 6, 3, 6, "#ff5c5c"); }
            const buzz = drp && cyc < 2.2, bxp = cx + 40 + (buzz ? Math.round(Math.sin(t * 60)) : 0);
            R(g, bxp - 7, y - 30, 14, 26, "#1a1d24"); R(g, bxp - 6, y - 28, 12, 20, buzz ? "#3a7a5a" : "#20303a"); R(g, bxp - 2, y - 7, 4, 2, "#3a3f4b");
            if (buzz) { for (const s of [-1, 1]) { R(g, bxp + s * 11, y - 24, 1, 6, "#c8e8ff"); R(g, bxp + s * 14, y - 26, 1, 10, "#c8e8ff"); }
              R(g, bxp - 16, y - 50, 32, 14, "#e8eef4"); R(g, bxp - 3, y - 36, 5, 3, "#e8eef4"); PX.text(g, "-40%", bxp, y - 47, { font: "v", size: 12, col: "#1a7a3a", align: "center" }); PX.glow(g, bxp, y - 20, 24, "rgba(95,227,160,0.5)", 1); }
          } else if (k === 2) { // MULTIPLAYER GAME: two windows passing a ball
            for (const s of [-1, 1]) { const wx = cx + s * 54 - 20, wy2 = y - 42; R(g, wx + 18, wy2 + 34, 4, 8, "#3a3f4b"); R(g, wx, wy2, 40, 34, "#0d1117"); R(g, wx, wy2, 40, 6, "#232a3a"); R(g, wx + 33, wy2 + 1, 4, 4, "#c0392b");
              const pyy = wy2 + 14 + Math.round(Math.sin(t * 3 + s) * 6); R(g, s < 0 ? wx + 4 : wx + 33, pyy, 3, 10, s < 0 ? "#5fe3e8" : "#f25ca8"); }
            const bp = frac(lt * 0.8), dir = Math.floor(lt * 0.8) % 2 ? -1 : 1, u = dir > 0 ? bp : 1 - bp;
            const bxx = lerp(cx - 30, cx + 30, u), byy = y - 30 - Math.sin(u * Math.PI) * 30;
            for (let i = 1; i < 5; i++) { const uu = cl(u - dir * i * 0.04, 0, 1); PX.alpha(g, 0.5 - i * 0.1, () => R(g, lerp(cx - 30, cx + 30, uu) - 1, y - 30 - Math.sin(uu * Math.PI) * 30 - 1, 3, 3, "#f7c948")); }
            PX.circle(g, bxx, byy, 3, "#f7c948"); R(g, bxx - 1, byy - 2, 2, 1, "#fff6c8"); PX.glow(g, bxx, byy, 14, "rgba(247,201,72,0.6)", 1);
          } else { // MINI GIT: commit graph lighting node by node
            const gy2 = y - 22, n = 7, lit = Math.floor(lt * 2.4);
            R(g, cx - 72, gy2, 144, 2, "#5a6078");
            PX.line(g, cx - 72 + 2 * 24, gy2, cx - 72 + 3 * 24, gy2 - 22, "#8a5ab0"); R(g, cx - 72 + 3 * 24, gy2 - 22, 48, 2, "#8a5ab0"); PX.line(g, cx - 72 + 5 * 24, gy2 - 22, cx - 72 + 6 * 24, gy2, "#8a5ab0");
            const nodes = [...Array(n)].map((_, i) => [cx - 72 + i * 24, gy2, i]).concat([[cx - 72 + 3 * 24, gy2 - 22, 3.5], [cx - 72 + 5 * 24, gy2 - 22, 4.5]]);
            for (const [nx, ny, ord] of nodes) { const on = (lit % 10) >= ord; const col = ny < gy2 ? "#f25ca8" : "#3df56b"; PX.circle(g, nx, ny + 1, 4, "#1a1d24"); PX.circle(g, nx, ny + 1, 3, on ? col : "#3a3f4b"); if (on) PX.glow(g, nx, ny + 1, 12, col, 0.5); }
            PX.text(g, "main", cx - 74, gy2 + 6, { font: "v", size: 10, col: "#8a90a0" }); PX.text(g, "feature", cx - 2, gy2 - 34, { font: "v", size: 10, col: "#c08ad0" });
          }
        });
      });
      // ---- climber ----
      const clyS = Y(clY), moving = clV > 0.3;
      climber(g, 320, clyS, moving ? clY / 14 : 0.5, { pack: true });
      // ---- flag at the top ----
      if (t >= climb) {
        const k = PX.p(t, climb, 0.45, "back");
        flag(g, 352, lerp(Y(80) - 80, Y(80) + 2, k), t, ["CLIMB A", "RUNG"], "#f7c948");
        if (t - climb < 0.8) PX.alpha(g, 1 - (t - climb) / 0.8, () => { for (let i = 0; i < 16; i++) { const a = (i / 16) * 6.28, r = (t - climb) * 90; star4(g, Math.round(400 + Math.cos(a) * r), Math.round(Y(80) - 40 + Math.sin(a) * r * 0.6), 1, "#fff6c8"); } });
      }
      // ---- near clouds (in front, fast parallax) ----
      for (const [x, wy, w] of cloudsNear) { const y = wy - camT * 1.25 + 420, xx = ((x - t * 10) % 820 + 820) % 820 - 100; if (y < -40 || y > 420) continue; PX.alpha(g, 0.85, () => cloud(g, xx, y, w, "#3a3a66", "#5a5a8a")); }
      PX.particles(g, 41, 30, t, [0, 0, 640, 360], { vy: 8, vx: 2, col: "#c8d0ff", a: 0.35 });
      PX.vignette(g, 0.5);
    };
  };

  // old street lantern on a post (base at x, y)
  const lantern = (LB.lantern = (g, x, y, t, h, snowy) => {
    h = h || 90;
    R(g, x - 4, y - 6, 9, 6, "#1e2230"); R(g, x - 1, y - h, 3, h - 6, "#262a3a"); R(g, x - 1, y - h, 1, h - 6, "#3e4458");
    R(g, x - 6, y - h - 2, 13, 2, "#262a3a"); R(g, x - 5, y - h - 16, 11, 14, "#ffd890"); R(g, x - 5, y - h - 16, 1, 14, "#2a2e3c"); R(g, x + 5, y - h - 16, 1, 14, "#2a2e3c"); R(g, x, y - h - 16, 1, 14, "#c8a060");
    R(g, x - 7, y - h - 19, 15, 3, "#262a3a"); R(g, x - 4, y - h - 22, 9, 3, "#262a3a"); R(g, x - 1, y - h - 25, 3, 3, "#262a3a");
    if (snowy) R(g, x - 7, y - h - 21, 15, 2, "#e8eefc");
    const fl = 0.9 + 0.1 * Math.sin(t * 9 + x);
    PX.glow(g, x, y - h - 9, 50, `rgba(255,210,140,${0.75 * fl})`, 1); PX.glow(g, x, y - h - 9, 16, "rgba(255,240,200,0.9)", 1);
  });

  // ================= academy: Berlin music academy at dusk, snow =================
  K.academy = (o) => {
    const AR = PX.rnd(90);
    const winOn = [...Array(40)].map(() => AR());
    return (g, t, d, c) => {
      const sign = T(o, "sign", 1.2, d, 6.0);
      const GY = 292;
      // ---- far: dusk sky, distant city, tower ----
      PX.par(g, c, 0.25, () => {
        PX.vgrad(g, -30, -20, 700, 120, "141838", "3a2a5c", 6); PX.vgrad(g, -30, 100, 700, 120, "3a2a5c", "a0505a", 6); PX.vgrad(g, -30, 220, 700, 80, "a0505a", "d07a50", 4);
        const r = PX.rnd(4); for (let i = 0; i < 40; i++) { const x = r() * 640, y = r() * 110; g.globalAlpha = (0.3 + 0.7 * Math.abs(Math.sin(t + i))) * (1 - y / 120); R(g, x, y, 1, 1, "#fff"); } g.globalAlpha = 1;
        // TV tower + domes + roofs
        R(g, 580, 70, 3, 180, "#2a1e36"); PX.circle(g, 581, 112, 8, "#2a1e36"); R(g, 580, 50, 2, 20, "#2a1e36"); if (PX.blink(t, 1.2, 0.4)) { R(g, 580, 48, 2, 2, "#ff3a3a"); PX.glow(g, 581, 49, 8, "rgba(255,60,60,0.8)", 1); }
        PX.circle(g, 40, 200, 20, "#2a1e36"); R(g, 39, 168, 2, 14, "#2a1e36"); R(g, 20, 200, 40, 50, "#2a1e36");
        for (let x = -10; x < 660; x += 18) { const h2 = 30 + ((x * 13) % 30); R(g, x, 250 - h2, 16, h2, "#2e2240"); for (let wy = 254 - h2; wy < 246; wy += 7) if ((x + wy) % 3 === 0) R(g, x + 5, wy, 2, 3, "#c8904a"); }
      });
      // ---- mid: academy facade ----
      PX.par(g, c, 0.75, () => {
        const X0 = 96, X1 = 544, FY = 96;
        const stone = "#5a4a5e", stoneD = "#3e3248", stoneL = "#7a6878";
        // wings
        R(g, X0, FY + 20, X1 - X0, GY - FY - 20, stone); R(g, X0, FY + 20, X1 - X0, 3, stoneL);
        R(g, X0 - 4, FY + 14, X1 - X0 + 8, 6, stoneD); R(g, X0 - 4, FY + 14, X1 - X0 + 8, 1, stoneL); R(g, X0 - 6, FY + 10, X1 - X0 + 12, 4, "#e8eefc");
        R(g, X0, 186, X1 - X0, 4, stoneD); R(g, X0, 186, X1 - X0, 1, stoneL);
        for (let x = X0; x < X1; x += 2) if ((x >> 1) % 2) R(g, x, FY + 20, 1, 2, stoneD);
        // pilasters
        for (const px of [X0, X0 + 64, X1 - 70, X1 - 6]) { R(g, px, FY + 20, 6, GY - FY - 20, stoneL); R(g, px + 5, FY + 20, 1, GY - FY - 20, stoneD); }
        // arched windows (two floors)
        let wi = 0;
        const win = (wx, wy, w, h) => {
          const on = t > winOn[wi] * 1.6, flick = 0.85 + 0.15 * Math.sin(t * 3 + wi * 1.7), id = wi++;
          R(g, wx - 1, wy - 1, w + 2, h + 2, stoneD); R(g, wx, wy + w / 2, w, h - w / 2, on ? "#e8a858" : "#2a2238");
          for (let r = 0; r < w / 2; r++) { const ww = Math.round(Math.sqrt((w / 2) ** 2 - (w / 2 - r) ** 2)); R(g, wx + w / 2 - ww, wy + r, ww * 2, 1, on ? "#e8a858" : "#2a2238"); }
          if (on) { R(g, wx + 1, wy + w / 2, w - 2, 2, "#ffd890"); PX.glow(g, wx + w / 2, wy + h / 2, w * 1.6, `rgba(255,190,110,${0.35 * flick})`, 1); }
          R(g, wx + w / 2, wy + 2, 1, h - 2, stoneD); R(g, wx, wy + h * 0.55, w, 1, stoneD);
          R(g, wx - 2, wy + h, w + 4, 2, stoneL); R(g, wx - 2, wy + h - 1, w + 4, 1, "#e8eefc");
          // violin student silhouette bowing
          if (on && id % 3 !== 1) {
            const sx = wx + w / 2 + (id % 2 ? -2 : 2), sy = wy + h - 2, bw = Math.sin(t * (3.5 + (id % 4) * 0.6) + id) * 5;
            const sil = "#3a2018";
            R(g, sx - 4, sy - 13, 8, 13, sil); PX.circle(g, sx, sy - 17, 3, sil);
            R(g, sx - 7, sy - 15, 6, 3, sil); R(g, sx - 10, sy - 14, 3, 2, sil);
            PX.line(g, sx - 9 + bw, sy - 20, sx - 3 + bw, sy - 8, "#4a2a20"); R(g, sx + 2, sy - 11, 4, 2, sil);
          }
        };
        for (const fy of [124, 200]) { for (const wx of [X0 + 14, X0 + 38, X0 + 76, X0 + 100]) win(wx, fy, 14, 44); for (const wx of [X1 - 114, X1 - 90, X1 - 52, X1 - 28]) win(wx, fy, 14, 44); }
        // central portico
        const PX0 = 222, PX1 = 418;
        R(g, PX0 - 6, FY + 4, PX1 - PX0 + 12, GY - FY - 4, "#4a3c50");
        // pediment
        for (let r = 0; r < 34; r++) { const w = Math.round(((PX1 - PX0 + 20) / 2) * (r / 34)); R(g, 320 - w, FY - 34 + r, 2 * w, 1, r === 33 ? stoneD : stone); R(g, 320 - w, FY - 34 + r, 2, 1, "#e8eefc"); }
        PX.circle(g, 320, FY - 12, 8, stoneD); PX.circle(g, 320, FY - 12, 6, stone); R(g, 317, FY - 17, 1, 10, "#c8a050"); R(g, 323, FY - 17, 1, 10, "#c8a050"); R(g, 316, FY - 8, 9, 2, "#c8a050");
        R(g, PX0 - 10, FY, PX1 - PX0 + 20, 8, stoneL); R(g, PX0 - 10, FY + 8, PX1 - PX0 + 20, 2, stoneD); R(g, PX0 - 10, FY - 2, PX1 - PX0 + 20, 2, "#e8eefc");
        R(g, PX0 - 4, FY + 10, PX1 - PX0 + 8, 12, "#4a3c50"); PX.text(g, "AKADEMIE DER MUSIK", 320, FY + 12, { font: "v", size: 12, col: "#c8b890", align: "center" });
        // doors + windows behind columns
        R(g, 300, 222, 40, 62, "#2a1a14"); for (let r = 0; r < 20; r++) { const ww = Math.round(Math.sqrt(400 - (20 - r) ** 2)); R(g, 320 - ww, 202 + r, ww * 2, 1, "#e8a858"); } R(g, 300, 222, 40, 62, "#c88848"); R(g, 304, 226, 14, 56, "#8a5028"); R(g, 322, 226, 14, 56, "#8a5028"); R(g, 319, 222, 2, 62, "#3a2014");
        PX.glow(g, 320, 250, 60, "rgba(255,180,100,0.4)", 1);
        win(244, 136, 14, 40); win(382, 136, 14, 40);
        // columns
        for (let i = 0; i < 6; i++) {
          const cx = PX0 + 8 + i * 36;
          R(g, cx - 5, FY + 25, 12, GY - FY - 39, "#76667a"); R(g, cx - 5, FY + 25, 3, GY - FY - 39, "#968698"); R(g, cx + 5, FY + 25, 2, GY - FY - 39, "#4a3c50");
          for (let k = 0; k < 3; k++) R(g, cx - 1 + k * 2, FY + 27, 1, GY - FY - 43, "#66586c");
          R(g, cx - 7, FY + 24, 16, 4, "#968698"); R(g, cx - 7, GY - 18, 16, 4, "#968698"); R(g, cx - 7, FY + 23, 16, 1, "#c8cce0");
        }
        // steps
        for (let i = 0; i < 4; i++) { R(g, PX0 - 14 - i * 6, GY - 14 + i * 4, PX1 - PX0 + 28 + i * 12, 4, i % 2 ? "#6a5a6e" : "#5e4e62"); R(g, PX0 - 14 - i * 6, GY - 14 + i * 4, PX1 - PX0 + 28 + i * 12, 1, "#e8eefc"); }
        // snow on the roof line + ledges
        R(g, X0 - 6, FY + 8, 120, 3, "#e8eefc"); R(g, X1 - 114, FY + 8, 120, 3, "#e8eefc");
      });
      // ---- street ----
      R(g, 0, GY, 640, 68, "#3a3a52"); PX.vgrad(g, 0, GY, 640, 68, "8a90b0", "4a4e6a", 5);
      for (let y = GY + 4; y < 360; y += 6) for (let x = (y % 12) / 2; x < 640; x += 12) R(g, x, y, 10, 1, "#6a7090");
      R(g, 0, GY + 30, 640, 2, "#5a5a70"); R(g, 0, GY + 40, 640, 2, "#5a5a70"); R(g, 0, GY + 30, 640, 1, "#a8b0c8");
      // little boxy 90s car with snow on the roof
      { const cx = 470, cy = GY + 26; R(g, cx, cy - 18, 70, 14, "#7aa0a8"); R(g, cx + 12, cy - 30, 40, 13, "#7aa0a8"); R(g, cx + 15, cy - 28, 15, 10, "#2a3a4a"); R(g, cx + 33, cy - 28, 16, 10, "#2a3a4a"); R(g, cx + 12, cy - 33, 40, 3, "#e8eefc"); R(g, cx, cy - 18, 70, 1, "#a8d0d8");
        R(g, cx, cy - 6, 70, 3, "#3a4a50"); PX.circle(g, cx + 14, cy - 3, 6, "#141418"); PX.circle(g, cx + 56, cy - 3, 6, "#141418"); PX.circle(g, cx + 14, cy - 3, 2, "#6a6a70"); PX.circle(g, cx + 56, cy - 3, 2, "#6a6a70");
        R(g, cx + 66, cy - 16, 4, 4, "#ffe8a0"); PX.glow(g, cx + 68, cy - 14, 12, "rgba(255,230,160,0.5)", 1); }
      // passer-by with an instrument case (walks left -> right)
      { const wx = 96 + t * 34, ph = Math.floor(t * 6) % 2;
        person(g, wx, GY + 34, { h: 52, shirt: "#3a3050", pants: "#22202e", hair: "#2a1a10", hairStyle: "short", skin: "#d0a080", face: "neutral", lit: -1, legs: ph ? [-3, 3] : [2, -2], al: [-2, 14], ar: [3, 12] });
        R(g, wx + 6, GY + 4, 9, 22, "#5a2a1e"); R(g, wx + 6, GY + 4, 9, 2, "#7a3a2a"); R(g, wx + 8, GY + 12, 5, 3, "#c8a050"); }
      // street lamps
      for (const lx of [64, 196, 588]) { lantern(g, lx, GY + 22, t, 92, true); cone(g, lx, GY + 22 - 92 - 4, 10, 90, 96, "#ffd79a", 0.12); }
      // snow (brighter flakes near lamps)
      snow(g, t, 12, 150, [0, 0, 640, 360], { vy: 18, a: 0.75 });
      for (const lx of [64, 196, 588]) snow(g, t, lx, 20, [lx - 40, GY - 110, 80, 130], { vy: 18, col: "#fff2d0", a: 1 });
      // sign caption plate
      if (t >= sign) {
        const k = PX.p(t, sign, 0.35, "back"), txt = PX.typed("BERLIN, EARLY 90s", t, sign + 0.3, 18), w = 186;
        const x = 30, y = 316 + Math.round((1 - k) * 20);
        R(g, x + 2, y + 2, w, 22, "rgba(0,0,0,0.5)"); R(g, x, y, w, 22, "#141624"); R(g, x, y, 3, 22, "#f7c948"); R(g, x, y, w, 1, "#3a3e58");
        PX.text(g, txt, x + 12, y + 7, { size: 8, col: "#f0e6c8" });
        if (txt.length < 17 && PX.blink(t, 0.3)) R(g, x + 12 + PX.tw(g, txt, { size: 8 }), y + 6, 6, 9, "#f7c948");
      }
      PX.vignette(g, 0.5);
    };
  };

  const NOTE = [".##", ".#.", ".#.", "##.", "##."], NOTE2 = ["####", "#..#", "#..#", "#.##", "#.##", "##..", "##.."], HEART = [".#.#.", "#####", ".###.", "..#.."];
  // floating music notes + hearts rising from (x, y)
  const notes = (LB.notes = (g, x, y, t, seed, hearts) => {
    const r = PX.rnd(seed);
    for (let i = 0; i < 4; i++) {
      const ph = r(), k = frac(t * 0.45 + ph), sx = x + Math.sin(k * 6 + i) * 8 + (r() - 0.5) * 20, sy = y - k * 40;
      const isH = hearts && i % 3 === 2, col = isH ? "#f25ca8" : i % 2 ? "#f7c948" : "#5fe3e8";
      PX.alpha(g, Math.min(1, (1 - k) * 2) * Math.min(1, k * 6), () => PX.sprite(g, isH ? HEART : i % 2 ? NOTE2 : NOTE, sx, sy, { "#": col }));
    }
  });

  // ================= practice_rooms: doll-house cross-section of 6 practice rooms =================
  K.practice_rooms = (o) => (g, t, d, c) => {
    const focus = T(o, "focus", 5.0, d, 12.6), count = o.count || 37;
    const BX0 = 66, BX1 = 574, BY0 = 46, GY = 302;
    const COLS = [[BX0 + 8, 160], [BX0 + 172, 164], [BX0 + 340, 160]], ROWS = [[BY0 + 8, 116], [BY0 + 132, 116]];
    const fk = PX.p(t, focus, 0.5, "out");
    const sway = Math.round(Math.sin(t * 3.2) * 1);   // everyone sways to the same tune
    // ---- far: night sky + hills ----
    PX.par(g, c, 0.3, () => {
      PX.vgrad(g, -30, -20, 700, 330, "0c1024", "2a2448", 8);
      const r = PX.rnd(14); for (let i = 0; i < 60; i++) { const x = r() * 680 - 20, y = r() * 220; g.globalAlpha = 0.3 + 0.7 * Math.abs(Math.sin(t * 1.2 + i)); R(g, x, y, 1, 1, "#fff"); } g.globalAlpha = 1;
      PX.circle(g, 600, 50, 12, "#f4f1d0"); PX.circle(g, 604, 47, 10, "#e4e0b8");
      for (let x = -30; x < 680; x++) { const h2 = 30 + Math.sin(x * 0.015) * 14 + Math.sin(x * 0.05) * 5; R(g, x, GY - h2, 1, h2 + 10, "#141a2c"); }
    });
    // ---- mid: trees beside the building ----
    PX.par(g, c, 0.7, () => {
      for (const [tx, s2] of [[30, 1], [610, 1.1], [600, 0.8]]) { R(g, tx - 2, GY - 40 * s2, 5, 40 * s2, "#2a1e1a"); PX.circle(g, tx, GY - 54 * s2, Math.round(22 * s2), "#1a2e2a"); PX.circle(g, tx + 4, GY - 58 * s2, Math.round(14 * s2), "#22403a"); }
    });
    // ---- building shell ----
    for (let r = 0; r < 30; r++) { const w = Math.round(((BX1 - BX0) / 2 + 12) * (r / 30)); R(g, 320 - w, BY0 - 30 + r, 2 * w, 1, r % 6 === 5 ? "#4a2a2a" : "#5a3232"); }
    R(g, 470, BY0 - 30, 14, 22, "#4a2a2a"); R(g, 468, BY0 - 32, 18, 3, "#3a2020");
    for (let i = 0; i < 3; i++) { const k = frac(t * 0.4 + i / 3); PX.alpha(g, 0.4 * (1 - k), () => PX.circle(g, 477 + Math.sin(k * 5 + i) * 4, BY0 - 36 - k * 30, Math.round(3 + k * 5), "#8a8aa0")); }
    R(g, BX0 - 4, BY0 - 2, BX1 - BX0 + 8, 4, "#3a2020");
    R(g, BX0, BY0, BX1 - BX0, GY - BY0, "#6a3a30");
    for (let y = BY0; y < GY; y += 4) for (let x = BX0 + ((y / 4) % 2) * 6; x < BX1; x += 12) R(g, x, y, 1, 4, "#5a302a");
    // ---- rooms ----
    const WALLS = ["#7a5a4a", "#5a6a7a", "#7a6a4a", "#6a5a7a", "#1a1c2c", "#5a7a6a"];
    const rooms = [];
    ROWS.forEach(([ry, rh], ri) => COLS.forEach(([rx, rw], ci) => rooms.push({ x: rx, y: ry, w: rw, h: rh, i: ri * 3 + ci })));
    for (const rm of rooms) {
      const { x, y, w, h, i } = rm, dark = i === 4, wall = WALLS[i];
      PX.vgrad(g, x, y, w, h - 10, sh(wall, 1.05), sh(wall, 0.8), 4);
      if (!dark) for (let xx = x + 6; xx < x + w; xx += 12) R(g, xx, y, 1, h - 10, sh(wall, 0.92));
      R(g, x, y + h - 10, w, 10, dark ? "#2a2018" : "#7a5236"); R(g, x, y + h - 10, w, 1, dark ? "#3a2c20" : "#a8784e"); for (let xx = x + 10; xx < x + w; xx += 22) R(g, xx, y + h - 9, 1, 9, dark ? "#1a140e" : "#5a3a26");
      // inner shadow under the ceiling
      R(g, x, y, w, 3, "rgba(0,0,0,0.35)");
      if (!dark) {
        // ceiling lamp + warm light
        R(g, x + w / 2, y, 1, 8, "#2a2a30"); R(g, x + w / 2 - 6, y + 8, 13, 4, "#e8c890"); PX.glow(g, x + w / 2, y + 14, 70, "rgba(255,200,130,0.35)", 1);
        // wall frame
        R(g, x + 12, y + 22, 22, 16, "#3a2a20"); R(g, x + 14, y + 24, 18, 12, ["#4a7aa0", "#a07a4a", "#7aa04a", "#a04a6a", "", "#6a4aa0"][i]);
      }
    }
    // floors between rows + outer walls (cut edges)
    R(g, BX0, BY0 + 124, BX1 - BX0, 8, "#3a2020"); R(g, BX0, BY0 + 124, BX1 - BX0, 1, "#8a5a4a");
    for (const [rx] of COLS.slice(1)) R(g, rx - 6, BY0 + 6, 6, GY - BY0 - 6, "#4a2a26");
    R(g, BX0, BY0, 8, GY - BY0, "#4a2a26"); R(g, BX1 - 8, BY0, 8, GY - BY0, "#4a2a26"); R(g, BX0, BY0, 1, GY - BY0, "#8a5a4a");
    // ---- happy students ----
    const P0 = { h: 58, pants: "#2a2a3a", lit: 1 };
    const stand = (rm) => [rm.x + rm.w / 2, rm.y + rm.h - 8];
    { // room 0: violinist
      const rm = rooms[0], [x, fy] = stand(rm), bw = Math.round(Math.sin(t * 6) * 7);
      const P = person(g, x + sway, fy, { ...P0, shirt: "#c05a4a", hair: "#3a2416", hairStyle: "long", skin: "#e0a878", face: "happy", al: [[-10, -2], [-16, -8]], ar: [[8, 6], [-2 + bw, 2]] });
      R(g, P.hx - 12, P.ty + 1, 10, 6, "#8a4a2a"); R(g, P.hx - 12, P.ty + 1, 10, 1, "#c07a4a"); PX.line(g, P.hx - 14, P.ty + 4, P.hx - 22, P.ty - 4, "#3a2014");
      PX.line(g, P.hr[0], P.hr[1], P.hr[0] - 20, P.hr[1] - 4, "#d8c8a0");
      notes(g, x + 10, rm.y + 50, t, 1, true);
    }
    { // room 1: keyboard player (seated behind the keys)
      const rm = rooms[1], x = rm.x + rm.w / 2, fy = rm.y + rm.h - 8, hp = Math.round(Math.sin(t * 9) * 2);
      R(g, x - 10, fy - 24, 20, 3, "#3a2a20");
      const P = person(g, x + sway, fy - 20, { ...P0, seated: true, floor: fy, shirt: "#4a8ac0", hair: "#1a1a2a", hairStyle: "bun", skin: "#b07a50", face: "happy", hands: { l: [x - 12 + hp, fy - 30], r: [x + 12 - hp, fy - 30] } });
      R(g, x - 34, fy - 30, 68, 8, "#1a1a20"); R(g, x - 32, fy - 29, 64, 4, "#e8e4d8"); for (let k = 0; k < 15; k++) if (k % 7 !== 2 && k % 7 !== 6) R(g, x - 30 + k * 4 + 2, fy - 29, 2, 2, "#1a1a20");
      R(g, x - 32, fy - 30, 64, 1, "#4a4a5a"); PX.line(g, x - 26, fy - 22, x + 22, fy - 8, "#2a2a30"); PX.line(g, x + 26, fy - 22, x - 22, fy - 8, "#2a2a30");
      notes(g, x, rm.y + 50, t, 2, true);
    }
    { // room 2: cellist
      const rm = rooms[2], x = rm.x + rm.w / 2, fy = rm.y + rm.h - 8, bw = Math.round(Math.sin(t * 5) * 9);
      R(g, x - 10, fy - 20, 22, 4, "#3a2a20"); R(g, x - 8, fy - 16, 2, 16, "#3a2a20"); R(g, x + 8, fy - 16, 2, 16, "#3a2a20");
      const P = person(g, x + sway, fy - 18, { ...P0, seated: true, floor: fy, shirt: "#3a9a6a", hair: "#5a2a1a", hairStyle: "short", skin: "#e0a878", face: "happy", hands: { l: [x - 4, fy - 44], r: [x + 6 + bw, fy - 24] } });
      ell(g, x, fy - 16, 9, 12, "#8a4a2a"); ell(g, x, fy - 28, 7, 8, "#8a4a2a"); R(g, x - 1, fy - 52, 3, 30, "#3a2014"); R(g, x - 3, fy - 28, 1, 2, "#2a1008"); R(g, x + 3, fy - 28, 1, 2, "#2a1008"); R(g, x - 5, fy - 20, 2, 8, "#a86a3a");
      PX.line(g, x - 14 + bw, fy - 22, x + 16 + bw, fy - 25, "#d8c8a0");
      notes(g, x + 14, rm.y + 50, t, 3, true);
    }
    { // room 3: flutist
      const rm = rooms[3], [x, fy] = stand(rm);
      const P = person(g, x + sway, fy, { ...P0, shirt: "#c0a03a", hair: "#2a1a10", hairStyle: "spiky", skin: "#c88a60", face: "closed", hands: { l: [x + 2 + sway, fy - 46], r: [x + 12 + sway, fy - 46] } });
      R(g, P.hx - 2, P.hy + P.hh - 3, 26, 2, "#c8ccd8"); R(g, P.hx - 2, P.hy + P.hh - 3, 26, 1, "#ffffff");
      notes(g, x + 22, rm.y + 50, t, 4, true);
    }
    { // room 5: guitarist
      const rm = rooms[5], x = rm.x + rm.w / 2, fy = rm.y + rm.h - 8, st = Math.round(Math.sin(t * 8) * 2);
      R(g, x - 10, fy - 20, 22, 4, "#3a2a20"); R(g, x - 8, fy - 16, 2, 16, "#3a2a20"); R(g, x + 8, fy - 16, 2, 16, "#3a2a20");
      person(g, x + sway, fy - 18, { ...P0, seated: true, floor: fy, shirt: "#8a5ac0", hair: "#c8a050", hairStyle: "long", skin: "#f0c8a0", face: "happy", hands: { l: [x - 16, fy - 34], r: [x + 6, fy - 26 + st] } });
      ell(g, x + 6, fy - 24, 9, 7, "#c88a4a"); ell(g, x + 6, fy - 24, 3, 3, "#3a2014"); PX.line(g, x, fy - 27, x - 22, fy - 36, "#5a3a20"); PX.line(g, x, fy - 26, x - 22, fy - 35, "#5a3a20");
      notes(g, x + 10, rm.y + 50, t, 6, true);
    }
    // ---- the focused student in the dark room ----
    const fr = rooms[4];
    {
      const x = fr.x + 62, fy = fr.y + fr.h - 8, sx = fr.x + 116;
      // desk lamp on a small table
      R(g, fr.x + 134, fy - 30, 24, 3, "#4a3426"); R(g, fr.x + 137, fy - 27, 2, 27, "#3a2a1e"); R(g, fr.x + 153, fy - 27, 2, 27, "#3a2a1e");
      R(g, fr.x + 144, fy - 46, 2, 16, "#3a3f4b"); R(g, fr.x + 136, fy - 52, 12, 6, "#3a3f4b"); R(g, fr.x + 137, fy - 46, 10, 1, "#ffd28a");
      cone(g, fr.x + 141, fy - 46, 8, 70, 38, "#ffcf8a", 0.3); PX.glow(g, fr.x + 141, fy - 40, 50, "rgba(255,190,110,0.5)", 1);
      // music stand with the 2 hard bars
      R(g, sx, fy - 30, 2, 30, "#3a3f4b"); R(g, sx - 8, fy - 2, 18, 2, "#3a3f4b");
      R(g, sx - 18, fy - 56, 38, 26, "#d8d0bc"); R(g, sx - 18, fy - 56, 38, 1, "#f0e8d4");
      for (let k = 0; k < 4; k++) R(g, sx - 16, fy - 52 + k * 3, 34, 1, "#8a8478");
      const loopFlash = frac(t * 3) < 0.5;
      R(g, sx - 6, fy - 53, 18, 12, loopFlash ? "rgba(247,201,72,0.55)" : "rgba(247,201,72,0.3)"); R(g, sx + 2, fy - 53, 1, 12, "#5a5448");
      for (let k = 0; k < 5; k++) R(g, sx - 4 + k * 3, fy - 50 + ((k * 7) % 4) * 2, 2, 2, "#2a2420");
      R(g, sx - 7, fy - 54, 1, 14, "#c03030"); R(g, sx + 13, fy - 54, 1, 14, "#c03030");
      for (let k = 0; k < 4; k++) R(g, sx - 16 + k * 3, fy - 38, 2, 2, "#6a645a");
      // the student: short fast repeating bow, intense focus
      const bw = Math.round(Math.sin(t * 19) * 4);
      const P = person(g, x, fy, { ...P0, shirt: "#5a6a9a", hair: "#2a1a10", hairStyle: "short", skin: "#d8a070", face: "focus", look: 2, lit: 1, al: [[-10, -2], [-16, -8]], ar: [[8, 6], [-2 + bw, 2]] });
      R(g, P.hx - 12, P.ty + 1, 10, 6, "#8a4a2a"); R(g, P.hx - 12, P.ty + 1, 10, 1, "#c07a4a"); PX.line(g, P.hx - 14, P.ty + 4, P.hx - 22, P.ty - 4, "#3a2014");
      PX.line(g, P.hr[0], P.hr[1], P.hr[0] - 20, P.hr[1] - 4, "#d8c8a0");
      // repetition counter
      const n = t < focus ? 1 + Math.floor((t / focus) * (count - 1)) : count + Math.floor((t - focus) / 0.9);
      const bump = frac(t < focus ? (t / focus) * (count - 1) : (t - focus) / 0.9) < 0.15 ? 1 : 0;
      PX.otext(g, "x" + n, x + 4, fr.y + 14 - bump, { size: 16, col: "#f7c948", align: "center" });
      // a moth around the lamp
      const ma = t * 5; R(g, fr.x + 141 + Math.cos(ma) * 10, fy - 52 + Math.sin(ma * 1.3) * 6, 2, 1, "#c8c0b0");
    }
    // ---- ground: grass, path, bushes ----
    R(g, 0, GY, 640, 58, "#1a2a22"); R(g, 0, GY, 640, 2, "#2e4a36"); R(g, BX0 - 6, GY, BX1 - BX0 + 12, 4, "#3a2a2a");
    for (let x = 4; x < 640; x += 7) R(g, x, GY - 2 - (x % 3), 1, 3, "#2e4a36");
    for (const bx2 of [96, 250, 400, 540]) { PX.circle(g, bx2, GY + 2, 9, "#1e3a2a"); PX.circle(g, bx2 + 3, GY - 1, 5, "#2a4a36"); }
    PX.particles(g, 61, 14, t, [0, GY - 40, 640, 60], { vy: -2, vx: 3, col: "#c8ff8a", a: 0.7, tw: 4 });
    // ---- focus beat: others dim, spotlight ----
    if (fk > 0) {
      PX.alpha(g, 0.74 * fk, () => {
        R(g, 0, 0, 640, fr.y, "#05060c"); R(g, 0, fr.y + fr.h, 640, 360 - fr.y - fr.h, "#05060c"); R(g, 0, fr.y, fr.x, fr.h, "#05060c"); R(g, fr.x + fr.w, fr.y, 640 - fr.x - fr.w, fr.h, "#05060c");
      });
      cone(g, fr.x + 62, fr.y + 2, 12, 70, fr.h - 10, "#fff2d0", 0.2 * fk);
      PX.glow(g, fr.x + 62, fr.y + 60, 80, "rgba(255,240,200,0.18)", fk);
      const lk = PX.p(t, focus + 0.3, 0.4, "back");
      if (lk > 0) PX.alpha(g, Math.min(1, (t - focus - 0.3) * 4), () => {
        const y = GY + 16 + Math.round((1 - lk) * 10);
        PX.otext(g, "PRACTICED THE HARD PARTS", 320, y, { size: 8, col: "#f7c948", align: "center" });
      });
    }
    PX.vignette(g, 0.5);
  };

})();
