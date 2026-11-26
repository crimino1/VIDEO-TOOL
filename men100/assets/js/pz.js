// "Could 100 Men Beat Every Prehistoric Predator?" canvas rig.
// Real photo/paleoart cut-outs (hidden <img id> in the page) puppeted over photo backgrounds, a crowd of 100 drawn men,
// a running "men standing" counter, size charts and the tier board. Every function is a pure function of scene time t.
const PZ = (() => {
  const W = 1920, H = 1080;
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const sm = (e0, e1, x) => { const k = clamp((x - e0) / (e1 - e0)); return k * k * (3 - 2 * k); };
  const eio = (k) => k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
  const eo = (k) => 1 - Math.pow(1 - k, 3);
  const back = (k, s = 1.7) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
  function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const im = (id) => { const i = document.getElementById(id); return i && i.complete && i.naturalWidth ? i : null; };
  const bufs = {};
  function buf(key, w, h) {
    let c = bufs[key]; if (!c) { c = document.createElement("canvas"); bufs[key] = c; }
    w = Math.max(2, Math.ceil(w)); h = Math.max(2, Math.ceil(h));
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    return c;
  }
  // keyframes: number, or [[t, v], ...] eased between keys (in-out); [[t, v, "lin"]] for linear into that key
  function kf(v, t, def = 0) {
    if (v === undefined || v === null) return def;
    if (typeof v === "number") return v;
    if (!v.length) return def;
    if (t <= v[0][0]) return v[0][1];
    for (let i = 1; i < v.length; i++) {
      if (t <= v[i][0]) {
        const a = v[i - 1], b = v[i], k = (t - a[0]) / Math.max(1e-6, b[0] - a[0]);
        const e = b[2] === "lin" ? k : b[2] === "out" ? eo(k) : b[2] === "back" ? back(k) : eio(k);
        return lerp(a[1], b[1], e);
      }
    }
    return v[v.length - 1][1];
  }
  const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const mix = (h, c2, k) => { const a = hex(h); return `rgb(${Math.round(lerp(a[0], c2[0], k))},${Math.round(lerp(a[1], c2[1], k))},${Math.round(lerp(a[2], c2[2], k))})`; };

  // ---------------- camera ----------------
  // c = {z, x, y (keyframes; x/y are the world point at screen centre offset), shake: [[t, amp, dur]], hand: px of handheld drift}
  function cam(ctx, t, c = {}) {
    const z = kf(c.z, t, 1);
    let x = kf(c.x, t, 0), y = kf(c.y, t, 0);
    for (const [t0, a, du] of c.shake || []) {
      const age = t - t0; if (age < 0 || age > du) continue;
      const f = a * Math.pow(1 - age / du, 1.5);
      x += Math.sin(age * 83) * f; y += Math.cos(age * 61) * f;
    }
    if (c.hand) { x += Math.sin(t * 0.9) * c.hand + Math.sin(t * 2.3) * c.hand * 0.3; y += Math.cos(t * 0.7) * c.hand * 0.6; }
    ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-W / 2 - x, -H / 2 - y);
    return { z, x, y };
  }

  // ---------------- backgrounds ----------------
  // photo background (pre-scaled 2300x1300 jpg in a hidden img). o = {img, par (parallax 0..1 against camera x), dim, warm}
  function bg(ctx, t, o, cx = 0) {
    const i = im(o.img);
    ctx.fillStyle = "#0d0f10"; ctx.fillRect(-600, -400, W + 1200, H + 800);
    if (i) {
      const s = Math.max((W + 400) / i.naturalWidth, (H + 240) / i.naturalHeight) * (o.scale || 1);
      const w = i.naturalWidth * s, h = i.naturalHeight * s;
      const px = (o.par ?? 0.4) * cx;
      ctx.drawImage(i, W / 2 - w / 2 + px + kf(o.dx, t, 0), H / 2 - h / 2 + (o.dy || 0), w, h);
    }
    if (o.dim) { ctx.fillStyle = `rgba(0,0,0,${o.dim})`; ctx.fillRect(-600, -400, W + 1200, H + 800); }
  }
  function vignette(ctx, k = 0.5) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.0);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function grade(ctx, col, a) { if (!a) return; ctx.fillStyle = col; ctx.globalAlpha = a; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1; }

  // ---------------- animals ----------------
  // o = {img, h (display height px) | w, x, y (ground point under the animal's centre), flip, walk: steps/s, bob px,
  //      breathe, lunge: [[t0, dur, dist]], open: keyframes 0..1 with jaw: {hx, hy, poly:[[u,v]...], max, dir},
  //      fall: t0, hit: [t...], angle, alpha, blur, shade, tint [r,g,b,a], warp: {beat, amp, waves, bend, head:"left"|"right"}, shadow}
  function layerOf(o, i, w, h, t) {
    const pad = o.warp ? Math.ceil((o.warp.amp ?? 0.05) * Math.max(w, h) * 1.6 + 6) : 4;
    const L = buf("L_" + (o.key || o.img), w + 8, h + pad * 2), c = L.getContext("2d");
    c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = "source-over"; c.clearRect(0, 0, L.width, L.height);
    if (o.warp) {
      const N = Math.max(24, Math.min(160, Math.round(w / 7))), iw = i.naturalWidth, ih = i.naturalHeight, sw = iw / N, sc = w / iw;
      const wp = o.warp, amp = (wp.amp ?? 0.05) * w, bend = wp.bend ?? 0.3, beat = wp.beat ?? 0.5;
      for (let k = 0; k < N; k++) {
        const u = wp.head === "left" ? (k + 0.5) / N : 1 - (k + 0.5) / N;
        const kk = clamp((u - bend) / (1 - bend)), f = kk * kk;
        const dy = amp * f * Math.sin(6.283 * beat * t - u * (wp.waves ?? 2.4)) + amp * 0.1 * Math.sin(6.283 * beat * t);
        c.drawImage(i, k * sw, 0, sw + 0.9, ih, 4 + k * sw * sc, pad + dy, (sw + 0.9) * sc, h);
      }
    } else if (o.jaw && kf(o.open, t, 0) > 0.001) {
      const j = o.jaw, ang = kf(o.open, t, 0) * (j.max ?? 0.38) * (j.dir ?? 1);
      const px = (u) => 4 + u * w, py = (v) => pad + v * h;
      const poly = (cc) => { cc.beginPath(); j.poly.forEach(([u, v], n) => n ? cc.lineTo(px(u), py(v)) : cc.moveTo(px(u), py(v))); cc.closePath(); };
      // mouth interior behind, the upper head with the jaw removed, then the jaw turned about the hinge
      const M = buf("M_" + (o.key || o.img), L.width, L.height), mc = M.getContext("2d");
      mc.setTransform(1, 0, 0, 1, 0, 0); mc.globalCompositeOperation = "source-over"; mc.clearRect(0, 0, M.width, M.height);
      mc.drawImage(i, 4, pad, w, h); mc.globalCompositeOperation = "destination-in"; poly(mc); mc.fill();
      c.save(); poly(c); c.fillStyle = "#2a0a08"; c.fill();
      c.translate(px(j.hx), py(j.hy)); c.rotate(-ang * 0.35); c.translate(-px(j.hx), -py(j.hy)); poly(c); c.fillStyle = "#4a1410"; c.fill(); c.restore();
      c.save(); c.drawImage(i, 4, pad, w, h); c.globalCompositeOperation = "destination-out"; poly(c); c.fill(); c.restore();
      c.save(); c.translate(px(j.hx), py(j.hy)); c.rotate(ang); c.translate(-px(j.hx), -py(j.hy)); c.drawImage(M, 0, 0); c.restore();
    } else {
      c.drawImage(i, 4, pad, w, h);
    }
    c.globalCompositeOperation = "source-atop";
    const lg = c.createLinearGradient(0, pad, 0, pad + h);
    lg.addColorStop(0, `rgba(255,240,220,${o.hi ?? 0.04})`); lg.addColorStop(0.55, "rgba(0,0,0,0)"); lg.addColorStop(1, `rgba(10,6,2,${o.shade ?? 0.3})`);
    c.fillStyle = lg; c.fillRect(0, 0, L.width, L.height);
    if (o.tint) { c.fillStyle = `rgba(${o.tint[0]},${o.tint[1]},${o.tint[2]},${o.tint[3]})`; c.fillRect(0, 0, L.width, L.height); }
    for (const th of o.hit || []) { const a = t - th; if (a >= 0 && a < 0.35) { c.fillStyle = `rgba(255,255,255,${0.35 * (1 - a / 0.35)})`; c.fillRect(0, 0, L.width, L.height); } }
    if (o.dark) { c.fillStyle = `rgba(0,0,0,${kf(o.dark, t, 0)})`; c.fillRect(0, 0, L.width, L.height); }
    c.globalCompositeOperation = "source-over";
    L._pad = pad;
    return L;
  }
  function beastGeo(o, t) {
    let id = o.img;
    for (const [ts, sid] of o.swap || []) if (t >= ts) id = sid;
    const i = im(id); if (!i) return null;
    if (id !== o.img) o = { ...o, img: id };
    const s = kf(o.s, t, 1);
    const h = (o.h ? kf(o.h, t, 100) : kf(o.w, t, 100) * i.naturalHeight / i.naturalWidth) * s, w = h * i.naturalWidth / i.naturalHeight;
    return { i, w, h };
  }
  function beast(ctx, t, o) {
    if (o.snake) return snake(ctx, t, o);
    const g = beastGeo(o, t); if (!g) return null;
    if (g.i.id !== o.img) o = { ...o, img: g.i.id };
    const { i, w, h } = g;
    let x = kf(o.x, t, W / 2), y = kf(o.y, t, 900), ang = kf(o.angle, t, 0);
    const dir = o.flip ? -1 : 1;            // +1: the animal faces right in the photo as used
    const walk = kf(o.walk, t, 0);
    if (walk) { const ph = t * walk * Math.PI; y -= Math.abs(Math.sin(ph)) * (o.bob ?? h * 0.025); ang += Math.sin(ph * 2) * 0.012; }
    for (const [t0, du, dist] of o.lunge || []) {
      const a = (t - t0) / du; if (a < 0 || a > 1) continue;
      const k = a < 0.3 ? back(a / 0.3, 2.2) : 1 - eio((a - 0.3) / 0.7);
      x += dir * dist * k; y -= dist * 0.12 * Math.sin(Math.PI * Math.min(1, a / 0.3)); ang += dir * -0.05 * k;
    }
    for (const th of o.hit || []) { const a = t - th; if (a >= 0 && a < 0.3) { x += Math.sin(a * 90) * 10 * (1 - a / 0.3); } }
    let sy = 1 + Math.sin(t * 2.2 + (o.ph || 0)) * (o.breathe ?? 0.008), sx = 1;
    if (o.fall !== undefined) { const k = eio(clamp((t - o.fall) / 1.1)); ang += dir * k * (o.fallAng ?? 0.42); y += k * h * 0.12; }
    if (o.shadow !== false) {
      const sw = w * (o.shw ?? 0.42), sg = ctx.createRadialGradient(x, y, 0, x, y, sw);
      sg.addColorStop(0, `rgba(0,0,0,${0.5 * kf(o.alpha, t, 1)})`); sg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save(); ctx.translate(x, y); ctx.scale(1, 0.12); ctx.translate(-x, -y); ctx.fillStyle = sg; ctx.beginPath(); ctx.arc(x, y, sw, 0, 6.283); ctx.fill(); ctx.restore();
    }
    const L = layerOf({ ...o, key: o.key || o.img }, i, w, h, t);
    ctx.save();
    ctx.globalAlpha = kf(o.alpha, t, 1);
    ctx.translate(x, y - (o.foot ?? 0.04) * -h); ctx.rotate(ang); ctx.scale(sx * dir, sy);
    if (o.blur) ctx.filter = `blur(${kf(o.blur, t, 0)}px)`;
    ctx.drawImage(L, -L.width / 2, -L.height + L._pad - (o.foot ?? 0.04) * h);
    ctx.restore();
    return { x, y, w, h };
  }

  // ---------------- Titanoboa, drawn: a thick tapered body along a travelling wave, anaconda colouring ----------------
  // o = {snake: true, x, y (head ground point), len px, wid px, dir (1 head right), amp, waves, speed, coil 0..1, pinned (0..1 stiffens), alpha}
  let SCALES = null;
  function snake(ctx, t, o) {
    const N = 120, len = kf(o.len, t, 900), wid = o.wid ?? 60, dir = o.dir ?? 1, x0 = kf(o.x, t, 900), y0 = kf(o.y, t, 900);
    const amp = (o.amp ?? 0.08) * len * (1 - kf(o.pinned, t, 0) * 0.85), wv = o.waves ?? 1.6, sp = o.speed ?? 0.8;
    const pts = [];
    for (let k = 0; k <= N; k++) {
      const u = k / N, x = x0 - dir * u * len;
      const y = y0 - wid * 0.5 + Math.sin(u * wv * 6.283 - t * sp * 6.283) * amp * Math.min(1, u * 3) + Math.sin(t * 9 + u * 30) * kf(o.writhe, t, 0) * 8;
      pts.push([x, y, wid * (u < 0.06 ? 0.75 + u * 4 : 1 - Math.pow(Math.max(0, u - 0.45) / 0.55, 1.6) * 0.92) * 0.5]);
    }
    const side = (s) => pts.map(([x, y, r], k) => { const p = pts[Math.min(N, k + 1)], q = pts[Math.max(0, k - 1)]; const dx = p[0] - q[0], dy = p[1] - q[1], l = Math.hypot(dx, dy) || 1; return [x - dy / l * r * s, y + dx / l * r * s]; });
    const top = side(-1), bot = side(1);
    ctx.save(); ctx.globalAlpha = kf(o.alpha, t, 1);
    // ground shadow
    ctx.fillStyle = "rgba(0,0,0,.35)"; ctx.beginPath(); pts.forEach(([x, y, r], k) => k ? ctx.lineTo(x, y0 + 6) : ctx.moveTo(x, y0 + 6)); ctx.lineWidth = wid * 0.9; ctx.strokeStyle = "rgba(0,0,0,.25)"; ctx.filter = "blur(8px)"; ctx.stroke(); ctx.filter = "none";
    const body = new Path2D(); top.forEach(([x, y], k) => k ? body.lineTo(x, y) : body.moveTo(x, y)); for (let k = N; k >= 0; k--) body.lineTo(bot[k][0], bot[k][1]); body.closePath();
    const yMid = y0 - wid * 0.5, g = ctx.createLinearGradient(0, yMid - wid * 0.6 - amp, 0, yMid + wid * 0.6 + amp);
    g.addColorStop(0, "#4f5530"); g.addColorStop(0.4, "#5a5a2e"); g.addColorStop(0.75, "#3a3820"); g.addColorStop(1, "#16150b");
    ctx.fillStyle = g; ctx.fill(body);
    ctx.save(); ctx.clip(body);
    // anaconda blotches: black ovals with ochre rims, staggered along the back
    const rr = rng(77);
    for (let k = 3; k < N - 4; k += 3) { const [x, y, r] = pts[k]; const oy = (k % 6 ? 0.32 : -0.28) * r + (rr() - 0.5) * r * 0.2, ax = r * (0.32 + rr() * 0.14), ay = r * (0.22 + rr() * 0.08);
      ctx.fillStyle = "rgba(170,130,50,.55)"; ctx.beginPath(); ctx.ellipse(x, y + oy, ax * 1.3, ay * 1.35, rr() * 0.6 - 0.3, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(12,10,5,.85)"; ctx.beginPath(); ctx.ellipse(x, y + oy, ax, ay, rr() * 0.6 - 0.3, 0, 6.283); ctx.fill(); }
    // scale texture
    if (!SCALES) { SCALES = document.createElement("canvas"); SCALES.width = 24; SCALES.height = 16; const sc = SCALES.getContext("2d"); sc.strokeStyle = "rgba(0,0,0,.35)"; sc.lineWidth = 1.2;
      for (const [cx, cy] of [[0, 0], [12, 8], [24, 0], [0, 16], [24, 16]]) { sc.beginPath(); sc.ellipse(cx, cy, 7, 5, 0, 0, 6.283); sc.stroke(); } sc.fillStyle = "rgba(255,255,220,.07)"; sc.fillRect(0, 0, 24, 3); }
    const pat = ctx.createPattern(SCALES, "repeat"); const k0 = Math.max(0.5, wid / 90); pat.setTransform(new DOMMatrix([k0, 0, 0, k0, 0, 0]));
    ctx.fillStyle = pat; ctx.fill(body);
    ctx.strokeStyle = "rgba(190,170,110,.35)"; ctx.lineWidth = wid * 0.18; ctx.beginPath(); bot.forEach(([x, y], k) => { const p = pts[k]; const yy = lerp(p[1], y, 0.6); k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }); ctx.stroke();
    ctx.strokeStyle = "rgba(255,250,210,.18)"; ctx.lineWidth = wid * 0.08; ctx.beginPath(); top.forEach(([x, y], k) => { const p = pts[k]; const yy = lerp(p[1], y, 0.55); k ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy); }); ctx.stroke();
    ctx.restore();
    // head: wedge with eye
    const [hx, hy, hr] = pts[0];
    ctx.fillStyle = "#4c4e2b"; ctx.beginPath(); ctx.ellipse(hx + dir * hr * 0.9, hy, hr * 1.6, hr * 0.9, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#e3c45a"; ctx.beginPath(); ctx.arc(hx + dir * hr * 1.4, hy - hr * 0.35, hr * 0.22, 0, 6.283); ctx.fill();
    ctx.fillStyle = "#0b0b05"; ctx.beginPath(); ctx.ellipse(hx + dir * hr * 1.4, hy - hr * 0.35, hr * 0.07, hr * 0.18, 0, 0, 6.283); ctx.fill();
    ctx.restore();
    return { x: x0, y: y0, w: len, h: wid };
  }
  // side-view water: o = {top colour, bot colour, surf y, murk}; draws over the background, behind nothing
  function water(ctx, t, o) {
    const sy = o.surf ?? 380;
    const g = ctx.createLinearGradient(0, sy, 0, H); g.addColorStop(0, o.top || "#3d4a2c"); g.addColorStop(1, o.bot || "#0e130b");
    ctx.fillStyle = g; ctx.fillRect(-600, sy, W + 1200, H + 400);
    ctx.fillStyle = "rgba(255,255,230,.12)";
    for (let k = 0; k < 7; k++) { ctx.beginPath(); for (let x = -600; x <= W + 600; x += 30) { const y = sy + k * 3 + Math.sin(x * 0.01 + t * 1.5 + k) * 4; x === -600 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); } ctx.lineTo(W + 600, sy + 30); ctx.lineTo(-600, sy + 30); ctx.fill(); }
    const r = rng(9);
    for (let k = 0; k < 120; k++) { const x = r() * W, y = sy + 40 + r() * (H - sy), dr = (t * 12 * (0.3 + r())) % 80; ctx.fillStyle = `rgba(200,200,160,${0.05 + r() * 0.12})`; ctx.fillRect(x + dr * 0.3, y - dr, 2, 2); }
  }
  // heads and shoulders of men treading water at the surface. o = {n, x0, x1, surf, seed, gone: [[t, x, r]] (pulled under near x within r)}
  function swimmers(ctx, t, o) {
    const r = rng(o.seed ?? 5), sy = o.surf ?? 380, below = o.below ?? [30, 60, 40];
    for (let k = 0; k < (o.n ?? 30); k++) {
      const x = lerp(o.x0 ?? 200, o.x1 ?? 1700, r()), s = 0.75 + r() * 0.45, ph = r() * 6.283, sd = r();
      const col0 = { skin: SKIN[Math.floor(r() * SKIN.length)], shirt: SHIRT[Math.floor(r() * SHIRT.length)], pants: PANTS[Math.floor(r() * PANTS.length)], hair: HAIR[Math.floor(r() * HAIR.length)] };
      let sink = 0;
      for (const [gt, gx, gr] of o.gone || []) if (Math.abs(x - gx) < gr && t > gt) sink = Math.max(sink, eo(clamp((t - gt - Math.abs(x - gx) / gr * 0.3) / 0.6)));
      if (sink >= 1) continue;
      const h = (o.h ?? 120) * s, y = sy + h * 0.86 + Math.sin(t * 2.2 + ph) * 4 + sink * h * 0.8;
      const c = (hx, e = 0) => { const a = hex(hx); return `rgb(${a[0] * (0.75 - e) | 0},${a[1] * (0.75 - e) | 0},${a[2] * (0.75 - e) | 0})`; };
      const col = { skin: c(col0.skin), shirt: c(col0.shirt), shirtD: c(col0.shirt, 0.2), pants: c(col0.pants), pantsD: c(col0.pants, 0.2), hair: c(col0.hair) };
      const pid = PPL.stand[Math.floor(sd * 997) % PPL.stand.length], PS = sprite(pid, 0.2, 0, [0, 0, 0]);
      const draw = () => { ctx.save(); ctx.translate(x, y); if (PS) { const w = h * PS.width / PS.height; ctx.rotate(Math.sin(t * 1.7 + ph) * 0.06 + (sink > 0 ? sink * 1.2 : 0)); ctx.scale(sd > 0.5 ? 1 : -1, 1); ctx.drawImage(PS, -w / 2, -h, w, h); }
        else { ctx.scale((sd > 0.5 ? 1 : -1) * h / 100, h / 100); figure(ctx, { pose: sink > 0 ? "flung" : "run", ph: ph + t * 2.4 }, col); } ctx.restore(); };
      ctx.save(); ctx.globalAlpha = 1 - sink;
      ctx.save(); ctx.beginPath(); ctx.rect(x - h, sy, h * 2, h * 2); ctx.clip(); ctx.globalAlpha *= 0.32; draw();
      ctx.globalCompositeOperation = "source-atop"; ctx.restore();
      ctx.save(); ctx.beginPath(); ctx.rect(x - h, sy - h * 2, h * 2, h * 2); ctx.clip(); draw(); ctx.restore();
      ctx.strokeStyle = "rgba(255,255,255,.45)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(x, sy + 2, h * (0.16 + Math.sin(t * 3 + ph) * 0.03), h * 0.03, 0, 0, 6.283); ctx.stroke();
      ctx.restore();
    }
  }

  // ---------------- the hundred men ----------------
  const SKIN = ["#c4936e", "#9c6a4a", "#dcb08e", "#74492f", "#b07b56", "#e3bc9a", "#8a5a3c"];
  const SHIRT = ["#5d6b74", "#7a5b45", "#4f5f4a", "#8a8576", "#3e4752", "#9b6b4c", "#6a6f7a", "#a39a86", "#59493f", "#7d8a8f", "#b3a58c", "#46535c"];
  const PANTS = ["#2e333a", "#3d3a35", "#4a4e57", "#2a2c2f", "#5a5144", "#383f48"];
  const HAIR = ["#1c1714", "#2e2219", "#4a3626", "#121212", "#6b5440", "#8a8178"];
  // one figure, feet at (0,0), 100 units tall. p = {run 0..1, ph phase, pose: stand|run|push|cheer|flung|down|throw, item}
  function figure(ctx, p, col) {
    // side-view person, 100 units tall, feet at 0, facing +x. Tapered limbs with joint caps, a shaped torso and a face profile.
    const run = p.pose === "run" || p.pose === "push", sw = run ? Math.sin(p.ph) : 0;
    const lean = p.pose === "run" ? 0.18 : p.pose === "push" ? 0.34 : p.pose === "throw" ? 0.12 : 0;
    const seg = (x0, y0, x1, y1, w0, w1, c) => {
      const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      ctx.fillStyle = c; ctx.beginPath();
      ctx.moveTo(x0 + nx * w0, y0 + ny * w0); ctx.lineTo(x1 + nx * w1, y1 + ny * w1); ctx.lineTo(x1 - nx * w1, y1 - ny * w1); ctx.lineTo(x0 - nx * w0, y0 - ny * w0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(x0, y0, w0, 0, 6.283); ctx.arc(x1, y1, w1, 0, 6.283); ctx.fill();
    };
    const pt = (x, y, a, l) => [x + Math.sin(a) * l, y + Math.cos(a) * l];
    // leg: hip -> knee -> ankle, angles from straight down (positive swings forward)
    const leg = (hx, hy, a, bend, cp, cs) => {
      const k = pt(hx, hy, a, 24), an = pt(k[0], k[1], a - bend, 23);
      seg(hx, hy, k[0], k[1], 4.6, 3.4, cp); seg(k[0], k[1], an[0], an[1], 3.3, 2.2, cp);
      ctx.fillStyle = cs; ctx.beginPath(); ctx.ellipse(an[0] + 2.6, an[1] + 0.6, 5.2, 2.1, a - bend - 0, 0, 6.283); ctx.fill();
    };
    const arm = (sx, sy, a, bend, cs, ck) => {
      const e = pt(sx, sy, a, 16.5), h = pt(e[0], e[1], a + bend, 15);
      seg(sx, sy, e[0], e[1], 3.1, 2.5, cs); seg(e[0], e[1], h[0], h[1], 2.4, 1.9, ck === "sleeve" ? cs : col.skin);
      ctx.fillStyle = col.skin; ctx.beginPath(); ctx.ellipse(h[0], h[1], 2.3, 2.7, 0, 0, 6.283); ctx.fill();
      return h;
    };
    ctx.save(); ctx.rotate(lean * 0.45);
    const bob = run ? Math.abs(Math.sin(p.ph)) * 2.5 : Math.sin(p.ph) * 0.4;
    ctx.translate(0, -bob);
    const hip = [0, -50], sh = [lean * 18 + 1, -81];
    let lb, lf, kb, kf2, ab, af, eb, ef;
    if (p.pose === "flung") { lb = -0.9; kb = 0.9; lf = 0.8; kf2 = 0.2; ab = 2.6; eb = 0.4; af = 3.6; ef = -0.4; }
    else if (run) { lb = -sw * 0.75; kb = 0.25 + Math.max(0, sw) * 1.1; lf = sw * 0.75; kf2 = 0.25 + Math.max(0, -sw) * 1.1; ab = sw * 0.8; eb = -0.9; af = -sw * 0.8; ef = -0.9; if (p.pose === "push") { ab = 1.9; eb = -0.35; af = 2.1; ef = -0.25; lb = -0.5; lf = 0.35; kb = 0.3; kf2 = 0.5; } }
    else if (p.pose === "cheer") { lb = -0.08; kb = 0.05; lf = 0.1; kf2 = 0.05; ab = Math.PI - 0.35 + Math.sin(p.ph * 2) * 0.12; eb = 0.25; af = Math.PI + 0.25 - Math.sin(p.ph * 2) * 0.12; ef = -0.2; }
    else if (p.pose === "throw") { lb = -0.45; kb = 0.15; lf = 0.4; kf2 = 0.2; ab = -0.6; eb = -0.5; af = Math.PI * 0.62; ef = -0.3; }
    else if (p.item) { lb = -0.07; kb = 0.06; lf = 0.07; kf2 = 0.04; ab = 0.35; eb = -1.2; af = 0.75; ef = -1.5; }
    else { lb = -0.06 + Math.sin(p.ph) * 0.02; kb = 0.05; lf = 0.07; kf2 = 0.05; ab = 0.22 + Math.sin(p.ph) * 0.04; eb = -0.25; af = -0.16 - Math.sin(p.ph) * 0.04; ef = -0.3; }
    // far limbs first, darker
    leg(hip[0] - 1, hip[1], lb, kb, col.pantsD, "#1b1a18");
    arm(sh[0] - 1.5, sh[1] + 2, ab, eb, col.shirtD, "sleeve");
    // torso: shoulders, chest, waist, hips
    ctx.fillStyle = col.shirt; ctx.beginPath();
    ctx.moveTo(sh[0] - 5.5, sh[1] - 1.5);
    ctx.quadraticCurveTo(sh[0] + 1, sh[1] - 4, sh[0] + 6.5, sh[1] + 0.5);       // shoulder line
    ctx.quadraticCurveTo(sh[0] + 9, sh[1] + 9, sh[0] + 6, sh[1] + 18);          // chest
    ctx.quadraticCurveTo(hip[0] + 4.5, hip[1] - 8, hip[0] + 5.8, hip[1] + 1);   // belly to waist
    ctx.lineTo(hip[0] - 5.8, hip[1] + 1);
    ctx.quadraticCurveTo(hip[0] - 6.5, hip[1] - 12, sh[0] - 7.5, sh[1] + 8);   // back
    ctx.closePath(); ctx.fill();
    const sg = ctx.createLinearGradient(sh[0] - 8, 0, sh[0] + 9, 0);
    sg.addColorStop(0, "rgba(0,0,0,0.32)"); sg.addColorStop(0.5, "rgba(0,0,0,0)"); sg.addColorStop(0.85, "rgba(255,225,180,0.10)"); sg.addColorStop(1, "rgba(255,225,180,0.26)");
    ctx.fillStyle = sg; ctx.fill();
    ctx.fillStyle = col.pants; ctx.beginPath(); ctx.moveTo(hip[0] - 6, hip[1] - 2); ctx.lineTo(hip[0] + 6, hip[1] - 2); ctx.lineTo(hip[0] + 5.5, hip[1] + 5); ctx.lineTo(hip[0] - 5.5, hip[1] + 5); ctx.fill();
    // neck and head with a face profile
    seg(sh[0] + 0.5, sh[1] - 1, sh[0] + 1.6, sh[1] - 6, 2.6, 2.4, col.skin);
    const hx = sh[0] + 2, hy = sh[1] - 12.5;
    ctx.fillStyle = col.skin; ctx.beginPath();
    ctx.ellipse(hx, hy, 5.4, 6.6, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(hx + 4.6, hy - 2); ctx.lineTo(hx + 6.9, hy + 1.3); ctx.lineTo(hx + 4.8, hy + 2.1); ctx.fill();                 // nose
    ctx.beginPath(); ctx.ellipse(hx + 1.5, hy + 5.3, 3.6, 2, 0, 0, 6.283); ctx.fill();                                                    // jaw
    ctx.fillStyle = "rgba(0,0,0,0.18)"; ctx.beginPath(); ctx.ellipse(hx - 1.3, hy + 0.6, 1.4, 2, 0, 0, 6.283); ctx.fill();               // ear
    ctx.fillStyle = col.hair; ctx.beginPath(); ctx.ellipse(hx - 0.8, hy - 2.6, 5.7, 4.6, -0.25, Math.PI * 0.82, Math.PI * 2.08); ctx.fill();
    ctx.beginPath(); ctx.ellipse(hx - 3, hy - 0.5, 2.8, 4.2, 0, 0, 6.283); ctx.fill();
    // near limbs
    leg(hip[0] + 1, hip[1], lf, kf2, col.pants, "#24221f");
    const hand = arm(sh[0] + 1, sh[1] + 2, af, ef, col.shirt, "skin");
    if (p.item === "spear") {
      ctx.strokeStyle = "#6e5233"; ctx.lineWidth = 1.8; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(hand[0] - 30, hand[1] + 30); ctx.lineTo(hand[0] + 34, hand[1] - 40); ctx.stroke();
      ctx.fillStyle = "#b9b3a6"; const tx = hand[0] + 34, ty = hand[1] - 40; ctx.beginPath(); ctx.moveTo(tx + 6, ty - 8); ctx.lineTo(tx - 2.5, ty - 0.5); ctx.lineTo(tx + 1.8, ty + 2.5); ctx.closePath(); ctx.fill();
    } else if (p.item === "torch") {
      ctx.strokeStyle = "#5a3e24"; ctx.lineWidth = 2.4; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(hand[0] - 2, hand[1] + 7); ctx.lineTo(hand[0] + 6, hand[1] - 20); ctx.stroke();
      const fx = hand[0] + 7, fy = hand[1] - 26, fl = 1 + Math.sin(p.ph * 3.1) * 0.15;
      const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, 24 * fl); g.addColorStop(0, "rgba(255,240,180,1)"); g.addColorStop(0.3, "rgba(255,150,40,.9)"); g.addColorStop(1, "rgba(255,80,0,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, 24 * fl, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }
  // front-facing person for standing crowds (reads wider than a profile at small sizes)
  function frontFigure(ctx, p, col) {
    const seg = (x0, y0, x1, y1, w0, w1, c) => {
      const dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1, nx = -dy / l, ny = dx / l;
      ctx.fillStyle = c; ctx.beginPath(); ctx.moveTo(x0 + nx * w0, y0 + ny * w0); ctx.lineTo(x1 + nx * w1, y1 + ny * w1); ctx.lineTo(x1 - nx * w1, y1 - ny * w1); ctx.lineTo(x0 - nx * w0, y0 - ny * w0); ctx.closePath(); ctx.fill();
      ctx.beginPath(); ctx.arc(x0, y0, w0, 0, 6.283); ctx.arc(x1, y1, w1, 0, 6.283); ctx.fill();
    };
    const sway = Math.sin(p.ph) * 0.6;
    ctx.save(); ctx.translate(sway * 0.3, 0);
    // legs and shoes
    seg(-4, -50, -4.6, -26, 4.6, 3.4, col.pants); seg(-4.6, -26, -4.8, -3, 3.3, 2.3, col.pants);
    seg(4, -50, 4.6, -26, 4.6, 3.4, col.pantsD); seg(4.6, -26, 4.8, -3, 3.3, 2.3, col.pantsD);
    ctx.fillStyle = "#1e1c1a"; ctx.beginPath(); ctx.ellipse(-5.2, -1.4, 3.4, 1.8, 0, 0, 6.283); ctx.ellipse(5.2, -1.4, 3.4, 1.8, 0, 0, 6.283); ctx.fill();
    // arms
    const up = p.pose === "cheer", wv = Math.sin(p.ph * 2) * 0.1;
    const armL = up ? [[-10.5, -79], [-15, -94 + wv * 20], [-14, -108]] : [[-10.5, -78], [-13, -64], [-13.2, -50]];
    const armR = up ? [[10.5, -79], [15, -94 - wv * 20], [14, -108]] : [[10.5, -78], [13, -64], [13.2, -50]];
    seg(armL[0][0], armL[0][1], armL[1][0], armL[1][1], 3.1, 2.6, col.shirtD); seg(armL[1][0], armL[1][1], armL[2][0], armL[2][1], 2.5, 2, col.skin);
    seg(armR[0][0], armR[0][1], armR[1][0], armR[1][1], 3.1, 2.6, col.shirtD); seg(armR[1][0], armR[1][1], armR[2][0], armR[2][1], 2.5, 2, col.skin);
    ctx.fillStyle = col.skin; ctx.beginPath(); ctx.arc(armL[2][0], armL[2][1], 2.4, 0, 6.283); ctx.arc(armR[2][0], armR[2][1], 2.4, 0, 6.283); ctx.fill();
    // torso
    ctx.fillStyle = col.shirt; ctx.beginPath();
    ctx.moveTo(-11, -80); ctx.quadraticCurveTo(0, -84, 11, -80); ctx.quadraticCurveTo(10, -64, 7.8, -50); ctx.lineTo(-7.8, -50); ctx.quadraticCurveTo(-10, -64, -11, -80); ctx.closePath(); ctx.fill();
    const g = ctx.createLinearGradient(-11, 0, 11, 0); g.addColorStop(0, "rgba(0,0,0,.3)"); g.addColorStop(0.45, "rgba(0,0,0,0)"); g.addColorStop(0.9, "rgba(255,225,180,.12)"); g.addColorStop(1, "rgba(255,225,180,.25)");
    ctx.fillStyle = g; ctx.fill();
    ctx.fillStyle = col.pants; ctx.fillRect(-8, -52, 16, 5);
    // neck, head, hair
    seg(0, -81, 0, -86, 2.7, 2.6, col.skin);
    ctx.fillStyle = col.skin; ctx.beginPath(); ctx.ellipse(0, -93, 5.6, 6.9, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.ellipse(-5.6, -92.5, 1.2, 1.9, 0, 0, 6.283); ctx.ellipse(5.6, -92.5, 1.2, 1.9, 0, 0, 6.283); ctx.fill();
    ctx.fillStyle = col.hair; ctx.beginPath(); ctx.ellipse(0, -96.5, 6, 4.3, 0, Math.PI * 0.95, Math.PI * 2.05); ctx.fill();
    ctx.fillStyle = "rgba(0,0,0,.25)"; ctx.fillRect(-3.2, -93.5, 2, 0.9); ctx.fillRect(1.2, -93.5, 2, 0.9);
    if (p.item === "spear") { ctx.strokeStyle = "#6e5233"; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.moveTo(13.2, -30); ctx.lineTo(13.4, -120); ctx.stroke(); ctx.fillStyle = "#b9b3a6"; ctx.beginPath(); ctx.moveTo(13.4, -130); ctx.lineTo(11, -119); ctx.lineTo(15.8, -119); ctx.fill(); }
    else if (p.item === "torch") { ctx.strokeStyle = "#5a3e24"; ctx.lineWidth = 2.4; ctx.beginPath(); ctx.moveTo(13.2, -44); ctx.lineTo(15, -72); ctx.stroke();
      const fx = 15, fy = -78, fl = 1 + Math.sin(p.ph * 3.1) * 0.15, gg = ctx.createRadialGradient(fx, fy, 0, fx, fy, 22 * fl); gg.addColorStop(0, "rgba(255,240,180,1)"); gg.addColorStop(0.3, "rgba(255,150,40,.9)"); gg.addColorStop(1, "rgba(255,80,0,0)"); ctx.fillStyle = gg; ctx.beginPath(); ctx.arc(fx, fy, 22 * fl, 0, 6.283); ctx.fill(); }
    ctx.restore();
  }
  // crowd. o = {n, seed, x0, x1, y0, y1 (ground band), hFar, hNear, face (1 right, -1 left), form: "field"|"line",
  //   acts: [{t, kind: walk|ring|flee|cheer|stand|scatter, x, y, rx, ry, dx, dy, dur}], fling: [[t, x, y, n]], item, dim, fog [r,g,b], alive: n shown}
  function crowdState(o, t) {
    const r = rng(o.seed ?? 7), n = o.n ?? 100, men = [];
    for (let i = 0; i < n; i++) {
      let x, y;
      if (o.form === "line") { const rows = o.rows ?? 4, per = Math.ceil(n / rows), row = i % rows, c = Math.floor(i / rows); x = lerp(o.x0, o.x1, (c + 0.5 + (row % 2) * 0.5) / per) + (r() - 0.5) * 14; y = lerp(o.y0, o.y1, rows > 1 ? row / (rows - 1) : 0.5) + (r() - 0.5) * 10; }
      else { x = lerp(o.x0, o.x1, r()); y = lerp(o.y0, o.y1, Math.sqrt(r())); }
      men.push({ i, bx: x, by: y, h: 1 + (r() - 0.5) * 0.14, skin: SKIN[Math.floor(r() * SKIN.length)], shirt: SHIRT[Math.floor(r() * SHIRT.length)], pants: PANTS[Math.floor(r() * PANTS.length)], hair: HAIR[Math.floor(r() * HAIR.length)], ph: r() * 6.283, sp: 0.85 + r() * 0.3, seed: r() });
    }
    return men;
  }
  function manAt(o, m, t) {
    let x = m.bx, y = m.by, moving = 0, pose = "stand", face = o.face ?? 1;
    for (const a of o.acts || []) {
      if (t < a.t) break;
      let tx = x, ty = y;
      if (a.kind === "walk") { tx = x + (a.dx || 0); ty = y + (a.dy || 0); }
      else if (a.kind === "ring") {
        const ang = Math.atan2((m.by - (a.y ?? 900)) * 2, m.bx - (a.x ?? 960)) + (m.seed - 0.5) * 0.5;
        const rr = 0.55 + m.seed * 0.6;
        tx = a.x + Math.cos(ang) * a.rx * rr; ty = a.y + Math.sin(ang) * a.ry * rr;
      } else if (a.kind === "flee") { const d = Math.sign(x - (a.x ?? 960)) || 1; tx = x + d * (a.dist ?? 900) * (0.7 + m.seed * 0.6); ty = y + (m.seed - 0.5) * 60; }
      else if (a.kind === "to") { tx = a.x + (m.bx - (o.x0 + o.x1) / 2) * (a.k ?? 0.3); ty = a.y + (m.by - (o.y0 + o.y1) / 2) * (a.k ?? 0.3); }
      const du = (a.dur ?? 1.5) * (a.kind === "walk" ? 1 : 0.8 + m.seed * 0.4);
      const k = clamp((t - a.t) / du);
      if (k < 1) { moving = a.kind === "walk" ? 0.5 : 1; if (Math.abs(tx - x) > 2) face = Math.sign(tx - x); }
      const e = a.kind === "walk" ? k : eo(k);
      x = lerp(x, tx, e); y = lerp(y, ty, e);
      if (k >= 1) { if (a.kind === "ring") { pose = "push"; face = Math.sign(a.x - x) || face; } else if (a.kind === "cheer") pose = "cheer"; else if (a.kind === "flee") face = Math.sign(tx - (a.x ?? 960)) || face; }
      if (a.kind === "cheer") pose = "cheer";
      if (a.kind === "stand") pose = "stand";
      if (a.kind === "face") face = a.face;
      if (a.kind === "throw" && t - a.t < 1.2) pose = "throw";
    }
    if (moving) pose = "run";
    return { x, y, pose, face, moving };
  }
  function crowd(ctx, t, o, layer, splitY) {
    const men = crowdState(o, t), hF = o.hFar ?? 60, hN = o.hNear ?? 110;
    // who gets thrown, in order: nearest standing men to each strike point at that moment
    const flung = {};
    for (const [ft, fx, fy, fn] of o.fling || []) {
      const cand = men.filter((m) => !(m.i in flung)).map((m) => { const p = manAt(o, m, ft); return [m, p, (p.x - fx) ** 2 + ((p.y - fy) * 2.2) ** 2]; }).sort((a, b) => a[2] - b[2]).slice(0, fn);
      cand.forEach(([m, p], k) => { flung[m.i] = { t: ft + k * 0.07, p, d: Math.sign(p.x - fx) || (m.seed > 0.5 ? 1 : -1), dist: 140 + m.seed * 220, up: 120 + m.seed * 160, spin: (m.seed > 0.5 ? 1 : -1) * (2.5 + m.seed * 2) }; });
    }
    const draw = [];
    for (const m of men) {
      if (o.alive !== undefined && m.i >= kf(o.alive, t, 100) && !(m.i in flung)) continue;
      let p = manAt(o, m, t), rot = 0, alpha = 1, pose = p.pose, x = p.x, y = p.y, lift = 0;
      const f = flung[m.i];
      if (f && t >= f.t) {
        const a = clamp((t - f.t) / 0.75);
        x = f.p.x + f.d * f.dist * eo(a); y = f.p.y + 25 * a; lift = Math.sin(Math.PI * a) * f.up;
        rot = a < 1 ? f.spin * a * 1.6 : f.d * 1.5; pose = a < 1 ? "flung" : "down"; alpha = a < 1 ? 1 : 0.9;
      } else if (p.pose === "push") { x += Math.sin(t * 9 + m.ph) * 3; lift = Math.abs(Math.sin(t * 7 + m.ph)) * 3; }
      if (layer === "back" && y >= splitY) continue;
      if (layer === "front" && y < splitY) continue;
      draw.push({ m, x, y, rot, alpha, pose, face: p.face, lift, run: p.moving });
    }
    draw.sort((a, b) => a.y - b.y);
    const dim = o.dim ?? 0.5, fog = o.fog ?? [120, 115, 105];
    for (const d of draw) {
      const k = clamp((d.y - o.y0) / Math.max(1, o.y1 - o.y0)), h = lerp(hF, hN, k) * d.m.h * (o.hs ?? 1);
      const haze = (1 - k) * (o.haze ?? 0.25);
      const c = (hx, extra = 0) => { const a = hex(hx); const dd = dim + extra; const v = a.map((x, n) => lerp(x * (1 - dd), fog[n], haze)); return `rgb(${v[0] | 0},${v[1] | 0},${v[2] | 0})`; };
      const col = { skin: c(d.m.skin), shirt: c(d.m.shirt), shirtD: c(d.m.shirt, 0.25), pants: c(d.m.pants), pantsD: c(d.m.pants, 0.25), hair: c(d.m.hair) };
      const fp = { pose: d.pose === "down" ? "stand" : d.pose, ph: d.m.ph + t * (d.run ? 11 * d.m.sp : 1.2), item: o.item && d.pose !== "flung" && d.pose !== "down" ? (o.item === "mix" ? (d.m.seed < 0.2 ? "torch" : "spear") : o.item) : null };
      if (photoMan(ctx, t, d, h, fp, dim, haze, fog)) continue;
      // contact shadow
      ctx.fillStyle = `rgba(0,0,0,${0.2 * d.alpha})`; ctx.beginPath(); ctx.ellipse(d.x, d.y, h * 0.11, h * 0.025, 0, 0, 6.283); ctx.fill();
      ctx.save(); ctx.globalAlpha = d.alpha; ctx.translate(d.x, d.y - d.lift);
      if (d.pose === "down") { ctx.translate(0, -h * 0.06); ctx.rotate(d.rot); ctx.translate(0, h * 0.06); }
      else if (d.rot) { ctx.translate(0, -h * 0.5); ctx.rotate(d.rot); ctx.translate(0, h * 0.5); }
      ctx.scale(d.face * h / 100, h / 100);
      if ((d.pose === "stand" || d.pose === "cheer") && !d.rot && (d.m.seed * 7.3) % 1 < (o.front ?? 0.55)) frontFigure(ctx, fp, col); else figure(ctx, fp, col);
      ctx.restore();
    }
  }

  // ---------------- real people: photo cut-outs (Pexels) puppeted as whole pieces, like the animals ----------------
  // groups of hidden <img id>; NAT facing: 1 right, -1 left, 0 front
  const PPL = {
    stand: ["h_stand_0", "h_stand_1", "h_stand_2", "h_stand_5", "h_stand_6", "h_stand_8", "h_stand_10", "h_stand_11", "h_casual_2", "h_casual_4", "h_casual_11", "h_walk_9", "h_walk_1", "h_walk_0", "h_arms_10"],
    side: ["h_side_0", "h_side_4", "h_side_7", "h_side_9", "h_walk_5"],
    run: ["h_run_2", "h_run_6", "h_run_3", "h_walk_5", "h_run_2", "h_run_6"],
    cheer: ["h_arms_8", "h_arms_9"],
  };
  const PNAT = { h_run_3: -1 };
  const spriteCache = {};
  // a person sprite scaled to <= 320 px tall, darkened and hazed to sit in the plate (levels quantised so they cache)
  function sprite(id, dim, haze, fog) {
    const i = im(id); if (!i) return null;
    const qd = Math.round(dim * 10) / 10, qh = Math.round(haze * 10) / 10, key = `${id}|${qd}|${qh}|${fog}`;
    if (spriteCache[key]) return spriteCache[key];
    const s = Math.min(1, 320 / i.naturalHeight), c = document.createElement("canvas");
    c.width = Math.ceil(i.naturalWidth * s); c.height = Math.ceil(i.naturalHeight * s);
    const x = c.getContext("2d"); x.drawImage(i, 0, 0, c.width, c.height);
    x.globalCompositeOperation = "source-atop";
    const g = x.createLinearGradient(0, 0, 0, c.height); g.addColorStop(0, "rgba(255,235,200,0.06)"); g.addColorStop(0.6, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(10,6,2,0.3)");
    x.fillStyle = g; x.fillRect(0, 0, c.width, c.height);
    if (qd > 0) { x.fillStyle = `rgba(0,0,0,${qd})`; x.fillRect(0, 0, c.width, c.height); }
    if (qh > 0) { x.fillStyle = `rgba(${fog[0]},${fog[1]},${fog[2]},${qh})`; x.fillRect(0, 0, c.width, c.height); }
    spriteCache[key] = c; return c;
  }
  function photoMan(ctx, t, d, h, fp, dim, haze, fog) {
    const m = d.m, pick = (arr) => arr[Math.floor(m.seed * 997) % arr.length];
    let id, rot = d.rot || 0, lift = d.lift, sx = 1, extra = 0;
    const pose = d.pose;
    if (pose === "run" && d.run < 1) { id = pick(PPL.side.concat(PPL.stand)); lift += Math.abs(Math.sin(fp.ph * 0.35)) * h * 0.015; rot += Math.sin(fp.ph * 0.7) * 0.02; }
    else if (pose === "run") { id = pick(PPL.run); lift += Math.abs(Math.sin(fp.ph * 0.5)) * h * 0.05; rot += Math.sin(fp.ph) * 0.04; }
    else if (pose === "push") { id = pick(PPL.side.concat(PPL.run)); rot += d.face * 0.2; }
    else if (pose === "throw") { id = pick(PPL.side); rot += d.face * 0.12; }
    else if (pose === "cheer") { id = m.seed < 0.5 ? pick(PPL.cheer) : pick(PPL.stand); lift += Math.abs(Math.sin(fp.ph * 2.2)) * h * 0.06; }
    else id = (m.seed * 3.7) % 1 < 0.25 ? pick(PPL.side) : pick(PPL.stand);
    const nat = PNAT[id] ?? 1;
    const S = sprite(id, Math.min(0.75, dim * 0.7), haze, fog); if (!S) return false;
    const w = h * S.width / S.height;
    if (PPL.stand.includes(id) || PPL.cheer.includes(id)) sx = (m.seed > 0.5 ? 1 : -1); else sx = d.face * nat;
    ctx.fillStyle = `rgba(0,0,0,${0.22 * d.alpha})`; ctx.beginPath(); ctx.ellipse(d.x, d.y, w * 0.45, h * 0.025, 0, 0, 6.283); ctx.fill();
    ctx.save(); ctx.globalAlpha = d.alpha; ctx.translate(d.x, d.y - lift);
    if (pose === "down") { ctx.translate(0, -h * 0.05); ctx.rotate(rot); ctx.translate(0, h * 0.05); }
    else if (rot) { ctx.translate(0, -h * 0.5); ctx.rotate(rot); ctx.translate(0, h * 0.5); }
    ctx.scale(sx, 1);
    ctx.drawImage(S, -w / 2, -h, w, h);
    ctx.restore();
    // weapons on top (drawn, held at hand height)
    if (fp.item && pose !== "flung" && pose !== "down") {
      const f = d.face, hx = d.x + f * w * 0.32, hy = d.y - lift - h * 0.5;
      if (fp.item === "spear") {
        const a = pose === "throw" ? -0.25 : pose === "run" || pose === "push" ? -0.55 : -1.35;
        const L = h * 1.15, dx = Math.cos(a) * L * f, dy = Math.sin(a) * L;
        ctx.strokeStyle = "#6e5233"; ctx.lineWidth = Math.max(1.5, h * 0.018); ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(hx - dx * 0.35, hy - dy * 0.35); ctx.lineTo(hx + dx * 0.65, hy + dy * 0.65); ctx.stroke();
        const tx = hx + dx * 0.65, ty = hy + dy * 0.65, ux = dx / L, uy = dy / L, pw = h * 0.03;
        ctx.fillStyle = "#b9b3a6"; ctx.beginPath(); ctx.moveTo(tx + ux * h * 0.08, ty + uy * h * 0.08); ctx.lineTo(tx - uy * pw, ty + ux * pw); ctx.lineTo(tx + uy * pw, ty - ux * pw); ctx.closePath(); ctx.fill();
      } else {
        ctx.strokeStyle = "#5a3e24"; ctx.lineWidth = Math.max(1.8, h * 0.022); ctx.beginPath(); ctx.moveTo(hx, hy + h * 0.05); ctx.lineTo(hx + f * h * 0.06, hy - h * 0.25); ctx.stroke();
        const fx = hx + f * h * 0.065, fy = hy - h * 0.3, fl = (1 + Math.sin(fp.ph * 3.1) * 0.15) * h * 0.22;
        const g = ctx.createRadialGradient(fx, fy, 0, fx, fy, fl); g.addColorStop(0, "rgba(255,240,180,1)"); g.addColorStop(0.3, "rgba(255,150,40,.9)"); g.addColorStop(1, "rgba(255,80,0,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(fx, fy, fl, 0, 6.283); ctx.fill();
      }
    }
    return true;
  }

  // ---------------- effects ----------------
  function dust(ctx, t, puffs) {   // puffs: [[t0, x, y, size]]
    for (const [t0, x, y, s] of puffs || []) {
      const a = t - t0; if (a < 0 || a > 2.2) continue;
      const r = rng(Math.round(x * 7 + y)), k = a / 2.2;
      for (let n = 0; n < 9; n++) {
        const dx = (r() - 0.5) * s * 2.2 * eo(Math.min(1, a / 1.2)), dy = -r() * s * 0.6 * eo(Math.min(1, a / 1.2)), rr = s * (0.35 + r() * 0.5) * (0.6 + k);
        const g = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, rr);
        g.addColorStop(0, `rgba(170,150,120,${0.32 * (1 - k)})`); g.addColorStop(1, "rgba(170,150,120,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x + dx, y + dy, rr, 0, 6.283); ctx.fill();
      }
    }
  }
  function speedLines(ctx, t, k, cx = W / 2, cy = H / 2) {
    if (k <= 0) return;
    const r = rng(Math.floor(t * 20) + 3);
    ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.55 * k})`;
    for (let n = 0; n < 70; n++) {
      const a = r() * 6.283, r0 = 520 + r() * 260, r1 = r0 + 260 + r() * 400;
      ctx.lineWidth = 1.5 + r() * 4; ctx.beginPath(); ctx.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0 * 0.7); ctx.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1 * 0.7); ctx.stroke();
    }
    ctx.restore();
  }
  function flash(ctx, t, times, col = "255,255,255") { for (const t0 of times || []) { const a = t - t0; if (a >= 0 && a < 0.25) { ctx.fillStyle = `rgba(${col},${0.45 * (1 - a / 0.25)})`; ctx.fillRect(0, 0, W, H); } } }
  function grass(ctx, t, o) {   // blurred foreground grass strip for depth
    const r = rng(o.seed ?? 3); ctx.save(); ctx.filter = `blur(${o.blur ?? 6}px)`;
    for (let n = 0; n < (o.n ?? 160); n++) {
      const x = r() * (W + 400) - 200 + (o.par ?? 0) , h = 80 + r() * (o.h ?? 220), sway = Math.sin(t * 1.6 + x * 0.01) * 10 + Math.sin(t * 3.7 + n) * 3;
      ctx.strokeStyle = o.col ? o.col : `rgba(${60 + r() * 50 | 0},${55 + r() * 40 | 0},${25 + r() * 20 | 0},0.95)`; ctx.lineWidth = 4 + r() * 8;
      ctx.beginPath(); ctx.moveTo(x, H + 20); ctx.quadraticCurveTo(x + sway * 0.4, H - h * 0.5, x + sway, H - h); ctx.stroke();
    }
    ctx.restore();
  }

  // ---------------- HUD: men standing counter ----------------
  function hud(ctx, t, o) {   // o = {count: keyframes (stepped), x, y, a}
    const a = kf(o.a, t, 1); if (a <= 0) return;
    let v = 100, last = -9;
    if (typeof o.count === "number") v = o.count;
    else for (const [t0, c] of o.count || []) if (t >= t0) { if (c !== v) last = t0; v = c; }
    const x = o.x ?? 70, y = o.y ?? 70, pulse = clamp(1 - (t - last) / 0.6);
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(10,10,10,.55)"; rr(ctx, x, y, 300, 118, 14); ctx.fill();
    ctx.font = "26px Anton, sans-serif"; ctx.fillStyle = "#d8d2c6"; ctx.textBaseline = "top"; ctx.fillText("MEN STANDING", x + 24, y + 14);
    ctx.font = `${62 + pulse * 10}px Anton, sans-serif`; ctx.fillStyle = pulse > 0 ? mix("#ffffff", [255, 70, 50], pulse) : "#ffffff";
    ctx.fillText(String(v), x + 24, y + 44 - pulse * 6);
    // little row of figures
    const n = Math.round(v / 10);
    for (let k = 0; k < 10; k++) { ctx.fillStyle = k < n ? "#e9e2d4" : "rgba(255,255,255,.18)"; ctx.beginPath(); ctx.arc(x + 160 + k * 13, y + 64, 4, 0, 6.283); ctx.fill(); ctx.fillRect(x + 156 + k * 13, y + 70, 8, 16); }
    ctx.restore();
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // ---------------- size chart ----------------
  // o = {img, m (animal length in metres, or height with by:"h"), flip, name, lab, man: 1.75, t0 animal in, foot: fraction}
  function manSil(ctx, x, y, h, col) {
    ctx.save(); ctx.translate(x, y); ctx.scale(h / 100, h / 100); ctx.fillStyle = col;
    ctx.beginPath(); ctx.ellipse(0, -91, 7.5, 9, 0, 0, 6.283); ctx.fill();
    ctx.beginPath(); ctx.moveTo(-11, -80); ctx.lineTo(11, -80); ctx.lineTo(14, -45); ctx.lineTo(9, -45); ctx.lineTo(8, 0); ctx.lineTo(1.5, 0); ctx.lineTo(0, -40); ctx.lineTo(-1.5, 0); ctx.lineTo(-8, 0); ctx.lineTo(-9, -45); ctx.lineTo(-14, -45); ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  function size(ctx, t, o) {
    ctx.fillStyle = "#14171a"; ctx.fillRect(0, 0, W, H);
    const i = im(o.img), ground = 880, man = o.man ?? 1.75;
    let ppm = o.ppm;
    if (!ppm && i) { const asp = i.naturalWidth / i.naturalHeight; const animW = o.by === "h" ? o.m * asp : o.m, animH = o.by === "h" ? o.m : o.m / asp; ppm = Math.min(1350 / animW, 640 / Math.max(animH, man)); }
    ppm = ppm || 100;
    // grid in metres
    const z = kf(o.z, t, 1);
    ctx.save(); ctx.translate(W / 2, ground); ctx.scale(z, z); ctx.translate(-W / 2, -ground);
    ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = 1.5;
    for (let gx = 0; gx <= W / ppm + 40; gx++) { const X = 240 + gx * ppm; if (X > W * 2) break; ctx.beginPath(); ctx.moveTo(X, ground - 4000); ctx.lineTo(X, ground); ctx.stroke(); }
    for (let gy = 0; gy * ppm < 4000; gy++) { const Y = ground - gy * ppm; ctx.beginPath(); ctx.moveTo(-2000, Y); ctx.lineTo(W * 2, Y); ctx.stroke(); }
    ctx.fillStyle = "rgba(255,255,255,.25)"; ctx.fillRect(-2000, ground, W * 4, 3);
    const ma = sm(0, 0.5, t);
    manSil(ctx, 180, ground, man * ppm, `rgba(232,226,214,${ma})`);
    if (i) {
      const k = eo(clamp((t - (o.t0 ?? 0.5)) / 0.9));
      const w = o.by === "h" ? o.m * ppm * i.naturalWidth / i.naturalHeight : o.m * ppm, h = w * i.naturalHeight / i.naturalWidth;
      const x = 300 + w / 2 + (1 - k) * 300;
      ctx.save(); ctx.globalAlpha = k; ctx.translate(x, ground + h * (o.foot ?? 0.03)); ctx.scale(o.flip ? -1 : 1, 1);
      ctx.drawImage(i, -w / 2, -h, w, h); ctx.restore();
      // length bracket
      const lk = sm((o.t0 ?? 0.5) + 0.8, (o.t0 ?? 0.5) + 1.5, t);
      if (lk > 0) {
        ctx.globalAlpha = lk; ctx.strokeStyle = "#ffd36b"; ctx.lineWidth = 4; const by = ground + 40;
        ctx.beginPath(); ctx.moveTo(x - w / 2, by - 14); ctx.lineTo(x - w / 2, by); ctx.lineTo(x + w / 2, by); ctx.lineTo(x + w / 2, by - 14); ctx.stroke();
        ctx.font = "64px Anton, sans-serif"; ctx.textAlign = "center"; ctx.fillStyle = "#ffd36b"; ctx.fillText(o.lab, x, by + 80); ctx.globalAlpha = 1; ctx.textAlign = "left";
      }
    }
    ctx.restore();
    ctx.font = "40px Anton, sans-serif"; ctx.fillStyle = `rgba(232,226,214,${ma})`; ctx.fillText("1.75 m", 130, 960);
  }

  // ---------------- tier board ----------------
  const ROWS = [["NOT EVEN CLOSE", "#c8423a"], ["MEN LOSE", "#e07a36"], ["BLOODY WIN", "#e9b03f"], ["WIN WITH LOSSES", "#c9cf58"], ["EASY WIN", "#69bd66"]];
  // o = {tiles: [{img, name, row, t (drop time; <=0 already placed), move: [[t, row]]}], z, focus [x, y]}
  function board(ctx, t, o) {
    ctx.fillStyle = "#16181b"; ctx.fillRect(0, 0, W, H);
    const z = kf(o.z, t, 1), fx = kf(o.fx, t, W / 2), fy = kf(o.fy, t, H / 2);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-fx, -fy);
    const X0 = 150, Y0 = 70, RH = 172, LW = 300, TW = 150;
    ROWS.forEach(([lab, col], r) => {
      const y = Y0 + r * (RH + 8);
      ctx.fillStyle = col; rr(ctx, X0, y, LW, RH, 10); ctx.fill();
      ctx.fillStyle = "#24272b"; rr(ctx, X0 + LW + 8, y, 1310, RH, 10); ctx.fill();
      ctx.fillStyle = "#121314"; ctx.font = "44px Anton, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const words = lab.split(" "); const lines = words.length > 2 ? [words.slice(0, 2).join(" "), words.slice(2).join(" ")] : [lab];
      lines.forEach((ln, k) => ctx.fillText(ln, X0 + LW / 2, y + RH / 2 + (k - (lines.length - 1) / 2) * 48));
    });
    ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
    // slot positions: count tiles per row in order of arrival
    const slotOf = (tile, tt) => {
      let row = tile.row; for (const [mt, mr] of tile.move || []) if (tt >= mt) row = mr;
      return row;
    };
    const order = o.tiles.slice().sort((a, b) => (a.t ?? -1) - (b.t ?? -1));
    const pos = (tile, tt) => {
      const row = slotOf(tile, tt);
      let n = 0; for (const u of order) { if (u === tile) break; if ((u.t ?? -1) <= tt && slotOf(u, tt) === row) n++; }
      return [X0 + LW + 22 + n * (TW + 14), Y0 + row * (RH + 8) + (RH - TW) / 2];
    };
    const drawTile = (tile, x, y, s, glow) => {
      const i = im(tile.img);
      ctx.save(); ctx.translate(x + TW / 2, y + TW / 2); ctx.scale(s, s);
      if (glow) { ctx.shadowColor = "rgba(255,220,140,.8)"; ctx.shadowBlur = 30 * glow; }
      ctx.fillStyle = "#3a3f45"; rr(ctx, -TW / 2, -TW / 2, TW, TW, 10); ctx.fill(); ctx.shadowBlur = 0;
      ctx.save(); rr(ctx, -TW / 2, -TW / 2, TW, TW, 10); ctx.clip();
      const g = ctx.createLinearGradient(0, -TW / 2, 0, TW / 2); g.addColorStop(0, "#5a6168"); g.addColorStop(1, "#2b2f34"); ctx.fillStyle = g; ctx.fillRect(-TW / 2, -TW / 2, TW, TW);
      if (i) { const k = Math.min((TW - 14) / i.naturalWidth, (TW - 40) / i.naturalHeight); const w = i.naturalWidth * k, h = i.naturalHeight * k; ctx.drawImage(i, -w / 2, TW / 2 - 34 - h, w, h); }
      ctx.fillStyle = "rgba(0,0,0,.6)"; ctx.fillRect(-TW / 2, TW / 2 - 32, TW, 32);
      ctx.fillStyle = "#fff"; ctx.font = `${tile.name.length > 11 ? 19 : 23}px Anton, sans-serif`; ctx.textAlign = "center"; ctx.fillText(tile.name.toUpperCase(), 0, TW / 2 - 9);
      ctx.restore(); ctx.restore();
    };
    for (const tile of order) {
      const t0 = tile.t ?? -1;
      const pre = tile.pre ?? 1.4;
      if (t < t0 - pre) continue;
      let [x, y] = pos(tile, t), s = 1, glow = 0;
      if (t < t0) {     // big preview in the middle, then glide into place
        const a = clamp((t - (t0 - pre)) / Math.min(0.5, pre * 0.4)), g = eio(clamp((t - (t0 - pre * 0.5)) / (pre * 0.5)));
        const [tx, ty] = pos(tile, t0 + 0.01);
        x = lerp(W / 2 - TW / 2, tx, g); y = lerp(H / 2 - TW / 2 + 40, ty, g); s = lerp(2.4 * back(a), 1, g); glow = 1 - g;
      }
      for (const [mt, mr] of tile.move || []) { const a = (t - mt) / 0.9; if (a >= 0 && a < 1) { let pr = tile.row; for (const [m2, r2] of tile.move) if (m2 < mt) pr = r2; const p0 = [x, Y0 + pr * (RH + 8) + (RH - TW) / 2]; const [tx, ty] = pos(tile, mt + 1); x = lerp(p0[0], tx, eio(a)); y = lerp(p0[1], ty, eio(a)) - Math.sin(Math.PI * a) * 60; s = 1 + Math.sin(Math.PI * a) * 0.25; glow = Math.sin(Math.PI * a); } }
      const land = t - t0; if (land >= 0 && land < 0.25) s *= 1 + 0.08 * Math.sin(Math.PI * land / 0.25);
      drawTile(tile, x, y, s, glow);
    }
    ctx.restore();
  }

  // ---------------- a whole scene from options ----------------
  // o = {bg, cam, beasts: [..], crowd, split (y where men pass in front of the beast; default beast y), hud, dust, grass, speed: [[t0, t1]], flash, grade: [col, a], vig, text}
  function scene(ctx, t, o) {
    ctx.save();
    const c = cam(ctx, t, o.cam || {});
    if (o.bg) bg(ctx, t, o.bg, c.x);
    if (o.water) water(ctx, t, o.water);
    for (const b of o.under || []) beast(ctx, t, b);
    if (o.swim) swimmers(ctx, t, o.swim);
    const bs = o.beasts || [];
    const split = o.split ?? (bs.length ? kf(bs[0].y, t, 900) : 9999);
    if (o.crowd) crowd(ctx, t, o.crowd, "back", split);
    for (const b of bs) beast(ctx, t, b);
    if (o.crowd) crowd(ctx, t, o.crowd, "front", split);
    if (o.crowd2) crowd(ctx, t, o.crowd2, "all", 0);
    dust(ctx, t, o.dust);
    if (o.grass) grass(ctx, t, { ...o.grass, par: -c.x * 0.3 });
    ctx.restore();
    if (o.grade) grade(ctx, o.grade[0], o.grade[1]);
    for (const [a, b] of o.speed || []) speedLines(ctx, t, sm(a, a + 0.12, t) * (1 - sm(b - 0.12, b, t)));
    flash(ctx, t, o.flash);
    vignette(ctx, o.vig ?? 0.5);
    if (o.hud) hud(ctx, t, o.hud);
  }

  return { W, H, kf, scene, board, size, beast, crowd, hud, cam, bg, vignette, speedLines, dust, grass, flash, figure };
})();
