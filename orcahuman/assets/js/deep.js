// Deep-sea rig: real animal photo cut-outs animated on canvas, with depth of field, ROV-style light and bioluminescence.
// Every function is a pure function of time t, so any frame renders on its own.
const DP = (() => {
  const { W, H, clamp, lerp, smooth, ease, easeIn, rng } = OC;
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const bufs = {};
  function buf(key, w, h) {
    let c = bufs[key];
    if (!c) { c = document.createElement("canvas"); bufs[key] = c; }
    w = Math.max(2, Math.ceil(w)); h = Math.max(2, Math.ceil(h));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    return c;
  }
  // a soft round sprite for bokeh and glows (white, fades to clear)
  let DISC;
  function disc() {
    if (DISC) return DISC;
    DISC = document.createElement("canvas"); DISC.width = DISC.height = 128;
    const c = DISC.getContext("2d"), g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.35, "rgba(255,255,255,0.55)"); g.addColorStop(1, "rgba(255,255,255,0)");
    c.fillStyle = g; c.fillRect(0, 0, 128, 128); return DISC;
  }
  const im = (id) => { const i = document.getElementById(id); return i && i.complete && i.naturalWidth ? i : null; };

  // ---------------- camera ----------------
  // o.cam = {z0, z1, x0, x1, y0, y1, shake: [[t, amp, dur], ...]}; call cam() after save(), draw the world, then restore()
  function cam(ctx, t, d, c = {}) {
    const k = smooth(0, d, t);
    const z = lerp(c.z0 ?? 1, c.z1 ?? 1.06, k);
    let x = lerp(c.x0 ?? 0, c.x1 ?? 0, k), y = lerp(c.y0 ?? 0, c.y1 ?? 0, k);
    for (const [t0, a, du] of c.shake || []) {
      const age = t - t0; if (age < 0 || age > du) continue;
      const f = a * (1 - age / du);
      x += Math.sin(age * 71) * f; y += Math.cos(age * 53) * f;
    }
    ctx.translate(W / 2 + x, H / 2 + y); ctx.scale(z, z); ctx.translate(-W / 2, -H / 2);
  }

  // ---------------- water ----------------
  // depth 0 = sunlit, 1 = pitch black. Shallow water uses the ocean rig's rays and surface.
  function bg(ctx, t, o = {}) {
    const d = clamp(o.depth ?? 0.6);
    if (d < 0.5) { OC.water(ctx, t, { depth: d * 1.3, surfaceY: o.surfaceY, sunX: o.sunX ?? 900, rays: o.rays ?? true }); }
    else {
      const k = (d - 0.5) / 0.5;
      const top = [Math.round(lerp(10, 2, k)), Math.round(lerp(38, 6, k)), Math.round(lerp(58, 12, k))];
      const bot = [Math.round(lerp(2, 0, k)), Math.round(lerp(10, 2, k)), Math.round(lerp(20, 5, k))];
      const g = ctx.createLinearGradient(0, 0, 0, H);
      g.addColorStop(0, rgb(o.top || top)); g.addColorStop(1, rgb(o.bot || bot));
      ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
    }
    if (o.haze) {    // a soft pool of light, as if from a submersible's lamps
      const [hx, hy, hr, hk] = o.haze;
      const g = ctx.createRadialGradient(hx, hy, 0, hx, hy, hr);
      g.addColorStop(0, `rgba(120,170,200,${0.22 * hk})`); g.addColorStop(1, "rgba(120,170,200,0)");
      ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
    }
  }
  // seafloor: soft sediment with a lit pool, a few stones and gentle drifting silt
  function floor(ctx, t, o = {}) {
    const y0 = o.y ?? 760, r = rng(o.seed ?? 21);
    const g = ctx.createLinearGradient(0, y0 - 40, 0, H);
    const c = o.color || [72, 70, 58];
    g.addColorStop(0, rgb(c, 0)); g.addColorStop(0.12, rgb(c.map((v) => v * 0.55), 0.9)); g.addColorStop(1, rgb(c.map((v) => v * 0.25), 1));
    ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-200, y0);
    for (let x = -200; x <= W + 200; x += 40) ctx.lineTo(x, y0 + Math.sin(x * 0.004 + 1.3) * 18 + Math.sin(x * 0.011) * 7);
    ctx.lineTo(W + 200, H + 200); ctx.lineTo(-200, H + 200); ctx.fill();
    for (let i = 0; i < (o.stones ?? 26); i++) {   // pebbles and burrows
      const x = r() * W, y = y0 + 30 + r() * (H - y0), s = (4 + r() * 16) * (0.5 + (y - y0) / (H - y0));
      ctx.fillStyle = `rgba(20,18,14,${0.25 + r() * 0.3})`; ctx.beginPath(); ctx.ellipse(x, y, s, s * 0.4, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = `rgba(200,190,160,${0.05 + r() * 0.06})`; ctx.beginPath(); ctx.ellipse(x - s * 0.2, y - s * 0.12, s * 0.6, s * 0.2, 0, 0, 6.283); ctx.fill();
    }
    if (o.light) {    // the lamp pool on the sediment
      const [lx, lw, lk] = o.light;
      const lg = ctx.createRadialGradient(lx, y0 + 140, 0, lx, y0 + 140, lw);
      lg.addColorStop(0, `rgba(230,225,200,${0.28 * lk})`); lg.addColorStop(1, "rgba(230,225,200,0)");
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.fillStyle = lg; ctx.fillRect(-200, y0 - 60, W + 400, H - y0 + 260); ctx.restore();
    }
  }
  // marine snow in three depths: fine far specks, mid flakes, and big soft out-of-focus discs near the lens.
  // o: {seed, count, rise (px/s up = we sink), drift (px/s), alpha, light: [x, y, r] brightens flakes near a lamp, near: count of bokeh}
  function snow(ctx, t, o = {}) {
    const r = rng(o.seed ?? 11), D = disc(), n = o.count ?? 260, A = o.alpha ?? 1;
    const L = o.light;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const z = r(), size = 0.6 + z * z * 2.8, sp = 0.35 + z * 1.1;
      const x = ((r() * (W + 300) + t * (o.drift ?? 6) * sp) % (W + 300) + W + 300) % (W + 300) - 150;
      const y = ((r() * (H + 300) - t * (o.rise ?? 8) * sp + Math.sin(t * 0.5 + i) * 6) % (H + 300) + H + 300) % (H + 300) - 150;
      let a = (0.12 + 0.4 * z) * A;
      if (L) { const dd = Math.hypot(x - L[0], y - L[1]); a *= 0.25 + 1.6 * clamp(1 - dd / L[2]); }
      ctx.globalAlpha = clamp(a);
      ctx.fillStyle = "#d4e6f0"; ctx.beginPath(); ctx.arc(x, y, size, 0, 6.283); ctx.fill();
    }
    // near-lens bokeh
    const nn = o.near ?? 12;
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < nn; i++) {
      const s = 26 + r() * 70, sp = 1.6 + r() * 1.4;
      const x = ((r() * (W + 400) + t * (o.drift ?? 6) * sp * 2.2) % (W + 400) + W + 400) % (W + 400) - 200;
      const y = ((r() * (H + 400) - t * (o.rise ?? 8) * sp * 2.2) % (H + 400) + H + 400) % (H + 400) - 200;
      let a = (0.05 + r() * 0.07) * A;
      if (L) { const dd = Math.hypot(x - L[0], y - L[1]); a *= 0.4 + 1.4 * clamp(1 - dd / (L[2] * 1.3)); }
      ctx.globalAlpha = clamp(a); ctx.drawImage(D, x - s, y - s, s * 2, s * 2);
    }
    ctx.restore();
  }
  // twinkling bioluminescent sparks (blue-green), each flashing on its own rhythm
  function biolum(ctx, t, o = {}) {
    const r = rng(o.seed ?? 31), D = disc(), n = o.count ?? 40;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < n; i++) {
      const x = r() * W + Math.sin(t * 0.2 + i) * 20, y = r() * H + Math.cos(t * 0.17 + i) * 14;
      const per = 2 + r() * 5, ph = r() * per, age = ((t + ph) % per) / per;
      const f = age < 0.15 ? age / 0.15 : Math.max(0, 1 - (age - 0.15) / 0.35);
      if (f <= 0) continue;
      const s = 6 + r() * 14, col = r() < 0.75 ? [90, 220, 255] : [120, 255, 190];
      ctx.globalAlpha = f * (o.alpha ?? 0.8);
      ctx.drawImage(tint(D, col), x - s, y - s, s * 2, s * 2);
      ctx.fillStyle = rgb([230, 255, 255], f); ctx.beginPath(); ctx.arc(x, y, 1.3, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }
  const tints = {};
  function tint(src, col) {
    const k = col.join(",");
    if (tints[k]) return tints[k];
    const c = document.createElement("canvas"); c.width = src.width; c.height = src.height;
    const x = c.getContext("2d"); x.drawImage(src, 0, 0); x.globalCompositeOperation = "source-in"; x.fillStyle = rgb(col); x.fillRect(0, 0, c.width, c.height);
    tints[k] = c; return c;
  }
  // a glowing point (lure, photophore). col [r,g,b], r radius, k strength 0..1
  function glow(ctx, x, y, R, col, k = 1) {
    if (k <= 0) return;
    const D = disc();
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = clamp(0.55 * k); ctx.drawImage(tint(D, col), x - R * 3, y - R * 3, R * 6, R * 6);
    ctx.globalAlpha = clamp(0.9 * k); ctx.drawImage(tint(D, col), x - R, y - R, R * 2, R * 2);
    ctx.globalAlpha = clamp(k); ctx.drawImage(tint(D, [255, 255, 255]), x - R * 0.35, y - R * 0.35, R * 0.7, R * 0.7);
    ctx.restore();
  }
  // a cone of light from (x, y) along angle a. spread = half-angle, col [r,g,b]
  function beam(ctx, x, y, a, len, spread, col, k = 1) {
    if (k <= 0) return;
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (const [sk, ak] of [[1, 0.35], [0.55, 0.5], [0.22, 0.6]]) {
      const g = ctx.createRadialGradient(x, y, 0, x, y, len);
      g.addColorStop(0, rgb(col, 0.5 * ak * k)); g.addColorStop(0.5, rgb(col, 0.18 * ak * k)); g.addColorStop(1, rgb(col, 0));
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, len, a - spread * sk, a + spread * sk); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }
  // darkness everywhere except a pool of light: the ROV lamp look. k = how dark outside
  function torch(ctx, x, y, R, k = 0.85) {
    const g = ctx.createRadialGradient(x, y, R * 0.15, x, y, R);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,2,5,${k})`);
    ctx.fillStyle = g; ctx.fillRect(-300, -300, W + 600, H + 600);
  }
  function vignette(ctx, k = 0.55) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.32, W / 2, H / 2, H * 0.98);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }

  // ---------------- animals ----------------
  // Swim a photo cut-out by warping it in vertical strips (a travelling body wave), then light it.
  // o: {img, len px, t, beat Hz, amp (fraction of len), bend (0..1 where the wave starts, from the head), headRight, phase,
  //     hi (light from above), lo (shade below), fog [r,g,b,a], dark 0..1, sil (pure black silhouette 0..1), tintCol [r,g,b,a], vert (wave runs vertical: squid/jelly)}
  // returns the lit layer canvas, drawn centred by draw()
  function body(o) {
    const img = im(o.img); if (!img) return null;
    const iw = img.naturalWidth, ih = img.naturalHeight, sc = o.len / iw, h = ih * sc;
    const amp = (o.amp ?? 0.05) * o.len, pad = Math.ceil(amp * 1.6 + 4);
    const L = buf("b_" + (o.key || o.img), o.len + 4, h + pad * 2), c = L.getContext("2d");
    c.globalCompositeOperation = "source-over"; c.clearRect(0, 0, L.width, L.height);
    const N = Math.max(18, Math.min(150, Math.round(o.len / 8))), sw = iw / N, bend = o.bend ?? 0.4, beat = o.beat ?? 0.6, ph = o.phase ?? 0;
    for (let i = 0; i < N; i++) {
      const u = (o.headRight ?? true) ? 1 - (i + 0.5) / N : (i + 0.5) / N;     // 0 head .. 1 tail tip
      const kk = clamp((u - bend) / (1 - bend)), f = kk * kk;
      const dy = amp * f * Math.sin(6.283 * beat * o.t + ph - u * (o.waves ?? 2.6)) + amp * 0.12 * Math.sin(6.283 * beat * o.t + ph);
      c.drawImage(img, i * sw, 0, sw + 0.9, ih, 2 + i * sw * sc, pad + dy, (sw + 0.9) * sc, h);
    }
    c.globalCompositeOperation = "source-atop";
    if (o.tintCol) { c.fillStyle = rgb(o.tintCol, o.tintCol[3]); c.fillRect(0, 0, L.width, L.height); }
    const lg = c.createLinearGradient(0, pad, 0, pad + h);
    lg.addColorStop(0, `rgba(200,230,245,${o.hi ?? 0.12})`); lg.addColorStop(0.5, "rgba(0,0,0,0)"); lg.addColorStop(1, `rgba(0,6,12,${o.lo ?? 0.4})`);
    c.fillStyle = lg; c.fillRect(0, 0, L.width, L.height);
    if (o.fog) { c.fillStyle = rgb(o.fog, o.fog[3]); c.fillRect(0, 0, L.width, L.height); }
    if (o.dark) { c.fillStyle = `rgba(0,3,7,${o.dark})`; c.fillRect(0, 0, L.width, L.height); }
    if (o.sil) { c.fillStyle = `rgba(0,0,0,${o.sil})`; c.fillRect(0, 0, L.width, L.height); }
    c.globalCompositeOperation = "source-over";
    L._sc = sc; L._pad = pad;
    return L;
  }
  // draw an animal at (x, y) centre. o adds: angle, flip, alpha, blur (depth of field), rim [r,g,b,a] edge glow, shadowY (soft shadow on the floor), scale
  function beast(ctx, t, o) {
    const L = body({ ...o, t }); if (!L) return null;
    const bob = Math.sin(t * 6.283 * (o.beat ?? 0.6) * 0.5 + (o.phase ?? 0)) * (o.bob ?? 4);
    const ang = (o.angle || 0) + Math.sin(t * 6.283 * (o.beat ?? 0.6) * 0.5 + 1) * (o.pitch ?? 0.012);
    const s = o.scale ?? 1;
    if (o.shadowY !== undefined) {
      const sg = ctx.createRadialGradient(o.x, o.shadowY, 0, o.x, o.shadowY, o.len * 0.5 * s);
      sg.addColorStop(0, `rgba(0,0,0,${0.35 * (o.alpha ?? 1)})`); sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save(); ctx.translate(0, 0); ctx.scale(1, 1); ctx.fillStyle = sg;
      ctx.beginPath(); ctx.ellipse(o.x, o.shadowY, o.len * 0.5 * s, o.len * 0.06 * s, 0, 0, 6.283); ctx.fill(); ctx.restore();
    }
    ctx.save();
    ctx.translate(o.x, o.y + bob); ctx.rotate(ang); ctx.scale(s * (o.flip ? -1 : 1), s);
    ctx.globalAlpha = o.alpha ?? 1;
    if (o.rim) {      // a soft glow around the edge so a black animal reads against black water
      const R = buf("rim", L.width, L.height), rc = R.getContext("2d");
      rc.globalCompositeOperation = "source-over"; rc.clearRect(0, 0, R.width, R.height); rc.drawImage(L, 0, 0);
      rc.globalCompositeOperation = "source-in"; rc.fillStyle = rgb(o.rim, 1); rc.fillRect(0, 0, R.width, R.height);
      ctx.save(); ctx.globalCompositeOperation = "lighter"; ctx.globalAlpha = (o.alpha ?? 1) * o.rim[3]; ctx.filter = `blur(${o.rimBlur ?? 10}px)`;
      ctx.drawImage(R, -L.width / 2, -L.height / 2 - 3); ctx.restore();
    }
    if (o.blur) ctx.filter = `blur(${o.blur}px)`;
    ctx.drawImage(L, -L.width / 2, -L.height / 2);
    ctx.restore();
    return { L, sc: L._sc * s, pad: L._pad };
  }
  // where a point of the source photo (u, v in 0..1) ends up on screen for an animal drawn by beast() (ignores the body wave)
  function at(o, u, v) {
    const img = im(o.img); if (!img) return { x: o.x, y: o.y };
    const sc = (o.len / img.naturalWidth) * (o.scale ?? 1), w = img.naturalWidth * sc, h = img.naturalHeight * sc;
    let dx = (u - 0.5) * w, dy = (v - 0.5) * h;
    if (o.flip) dx = -dx;
    const a = o.angle || 0, c = Math.cos(a), s = Math.sin(a);
    return { x: o.x + dx * c - dy * s, y: o.y + dx * s + dy * c };
  }
  // draw a still cut-out (no body wave), centred, with a slow breathe: for sponges, tunicates, tripods
  function still(ctx, o) {
    const img = im(o.img); if (!img) return;
    const w = o.w ?? o.h * img.naturalWidth / img.naturalHeight, h = o.h ?? o.w * img.naturalHeight / img.naturalWidth;
    const L = buf("s_" + (o.key || o.img), w + 4, h + 4), c = L.getContext("2d");
    c.globalCompositeOperation = "source-over"; c.clearRect(0, 0, L.width, L.height); c.drawImage(img, 2, 2, w, h);
    c.globalCompositeOperation = "source-atop";
    const lg = c.createLinearGradient(0, 0, 0, h);
    lg.addColorStop(0, `rgba(200,230,245,${o.hi ?? 0.1})`); lg.addColorStop(0.6, "rgba(0,0,0,0)"); lg.addColorStop(1, `rgba(0,6,12,${o.lo ?? 0.35})`);
    c.fillStyle = lg; c.fillRect(0, 0, L.width, L.height);
    if (o.fog) { c.fillStyle = rgb(o.fog, o.fog[3]); c.fillRect(0, 0, L.width, L.height); }
    ctx.save(); ctx.globalAlpha = o.alpha ?? 1; ctx.translate(o.x, o.y); ctx.rotate(o.angle || 0); ctx.scale(o.flip ? -1 : 1, 1);
    if (o.blur) ctx.filter = `blur(${o.blur}px)`;
    ctx.drawImage(L, -L.width / 2, -L.height / 2); ctx.restore();
  }
  // a school of small fish (lanternfish cut-outs). o: {img, n, cx, cy, rx, ry, len, dir (1 right / -1 left), speed, seed, flee: [t0, x, y], fog, alpha, eaten: [t, x, y]}
  function school(ctx, t, o) {
    const r = rng(o.seed ?? 41), n = o.n ?? 18;
    for (let i = 0; i < n; i++) {
      const bx = (r() - 0.5) * 2 * (o.rx ?? 300), by = (r() - 0.5) * 2 * (o.ry ?? 120), ph = r() * 6.28, sz = 0.7 + r() * 0.6;
      let x = (o.cx ?? 960) + bx + (o.dir ?? 1) * t * (o.speed ?? 30) + Math.sin(t * 0.9 + ph) * 18;
      let y = (o.cy ?? 540) + by + Math.cos(t * 0.7 + ph) * 12;
      let flip = (o.dir ?? 1) < 0, a = 0;
      if (o.flee && t > o.flee[0]) {    // scatter away from the strike point
        const age = t - o.flee[0], dx = x - o.flee[1], dy = y - o.flee[2], dd = Math.hypot(dx, dy) + 1;
        const push = 420 * ease(0, 1.2, age) / Math.max(0.6, dd / 300);
        x += dx / dd * push; y += dy / dd * push; flip = dx < 0; a = Math.atan2(dy, Math.abs(dx)) * 0.5;
      }
      if (o.eaten && t > o.eaten[0] && Math.hypot(x - o.eaten[1], y - o.eaten[2]) < (o.eaten[3] ?? 160)) continue;
      beast(ctx, t, { img: o.img || "img_lantern", key: "sch" + (o.seed ?? 41) + "_" + (i % 4), x, y, len: (o.len ?? 60) * sz, beat: 2.2 + r(), amp: 0.08, bend: 0.35,
        headRight: o.headRight ?? false, flip: (o.headRight ?? false) ? flip : !flip, angle: a, phase: ph, fog: o.fog, alpha: o.alpha ?? 0.9, bob: 2, hi: 0.2, lo: 0.3 });
    }
  }
  // tiny pale crustaceans drifting and twitching (amphipods, copepods). o: {n, seed, cx, cy, rx, ry, size, col, suck: [t0, x, y] drawn into a mouth}
  function shrimp(ctx, t, o = {}) {
    const r = rng(o.seed ?? 51), n = o.n ?? 40, col = o.col || [235, 200, 185];
    ctx.save();
    for (let i = 0; i < n; i++) {
      const ph = r() * 9, sz = (o.size ?? 9) * (0.6 + r() * 0.8);
      let x = (o.cx ?? 960) + (r() - 0.5) * 2 * (o.rx ?? 700) + Math.sin(t * 0.6 + ph) * 30 + (o.drift ?? 0) * t;
      let y = (o.cy ?? 600) + (r() - 0.5) * 2 * (o.ry ?? 300) + Math.cos(t * 0.5 + ph) * 18;
      const jerk = Math.max(0, Math.sin(t * 3 + ph * 3)) ** 8 * 10; x += jerk;
      if (o.suck && t > o.suck[0]) {
        const age = t - o.suck[0], dx = o.suck[1] - x, dy = o.suck[2] - y, dd = Math.hypot(dx, dy);
        const reach = o.suck[3] ?? 220; if (dd < reach) { const k = ease(0, 0.5 + dd / 600, age); if (k > 0.97) continue; x += dx * k; y += dy * k; }
      }
      if (o.stick) {    // caught on a hook: stops at its stick point after t
        const s = o.stick[i % o.stick.length]; if (s && t > s[0]) { const k = ease(s[0], s[0] + 1.2, t); x = lerp(x, s[1], k); y = lerp(y, s[2], k); }
      }
      const a = Math.sin(t * 2 + ph) * 0.4;
      ctx.save(); ctx.translate(x, y); ctx.rotate(a);
      ctx.fillStyle = rgb(col, 0.8); ctx.strokeStyle = rgb(col, 0.55); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.ellipse(0, 0, sz, sz * 0.38, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.moveTo(sz * 0.8, -sz * 0.1); ctx.quadraticCurveTo(sz * 1.6, -sz * 0.9, sz * 2.1, -sz * 0.6); ctx.stroke();
      for (let l = -2; l <= 2; l++) { ctx.beginPath(); ctx.moveTo(l * sz * 0.3, sz * 0.3); ctx.lineTo(l * sz * 0.3 + Math.sin(t * 12 + l + ph) * 2, sz * 0.75); ctx.stroke(); }
      ctx.fillStyle = "rgba(20,10,10,0.8)"; ctx.beginPath(); ctx.arc(sz * 0.75, -sz * 0.05, sz * 0.12, 0, 6.283); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
  return { W, H, clamp, lerp, smooth, ease, easeIn, rng, rgb, buf, disc, tint, im, cam, bg, floor, snow, biolum, glow, beam, torch, vignette, body, beast, at, still, school, shrimp };
})();
