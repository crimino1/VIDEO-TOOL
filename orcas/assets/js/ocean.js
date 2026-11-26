// Ocean rig: underwater light, drifting particles and swimming animals drawn on canvas.
// Every function is a pure function of time t (seconds), so any frame renders on its own.
const OC = (() => {
  const W = 1920, H = 1080;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (a, b, t) => { const u = clamp((t - a) / (b - a || 1e-6)); return u * u * (3 - 2 * u); };
  const ease = (a, b, t) => { const u = clamp((t - a) / (b - a || 1e-6)); return 1 - Math.pow(1 - u, 3); };
  const easeIn = (a, b, t) => { const u = clamp((t - a) / (b - a || 1e-6)); return u * u * u; };
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s + 0x6d2b79f5) | 0; let x = Math.imul(s ^ (s >>> 15), 1 | s); x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x; return ((x ^ (x >>> 14)) >>> 0) / 4294967296; }; }
  const mix = (c1, c2, k) => c1.map((v, i) => Math.round(lerp(v, c2[i], k)));
  const rgb = (c, a = 1) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

  // species: image id, which way the head points, where the body starts to bend, how much the tail moves
  const SP = {
    sperm: { img: "img_sperm", headRight: true, bend: 0.42, amp: 0.045, len: 1 },
    orca: { img: "img_orca", headRight: true, bend: 0.45, amp: 0.06, len: 1 },
    blue: { img: "img_blue", headRight: true, bend: 0.5, amp: 0.035, len: 1 },
    hump: { img: "img_hump", headRight: false, bend: 0.5, amp: 0.04, len: 1 },
    gray: { img: "img_gray", headRight: false, bend: 0.5, amp: 0.04, len: 1 },
    shark: { img: "img_shark", headRight: true, bend: 0.4, amp: 0.07, len: 1 },
  };
  const layers = {};
  function layer(key, w, h) {
    let c = layers[key];
    if (!c) { c = document.createElement("canvas"); layers[key] = c; }
    if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
    return c;
  }

  // ---------------- water ----------------
  // depth 0 = just under the surface, 1 = the abyss
  const TOP0 = [58, 150, 182], TOP1 = [3, 14, 24], BOT0 = [10, 62, 88], BOT1 = [0, 2, 5];
  function waterColor(depth) { return mix(mix(TOP0, BOT0, 0.6), mix(TOP1, BOT1, 0.5), clamp(depth)); }
  function water(ctx, t, o = {}) {
    const d = clamp(o.depth ?? 0.3);
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, rgb(mix(TOP0, TOP1, d)));
    g.addColorStop(1, rgb(mix(BOT0, BOT1, Math.min(1, d * 1.2 + 0.15))));
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const surf = o.surfaceY;   // y of the surface on screen, if it is in view
    if (surf !== undefined && surf > -200) surface(ctx, t, surf, d);
    if ((o.rays ?? true) && d < 0.85) rays(ctx, t, 1 - d / 0.85, surf ?? -50, o.sunX ?? 960);
  }
  function rays(ctx, t, k, top, sunX) {
    const r = rng(7);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const x0 = sunX - 900 + r() * 1800, w0 = 30 + r() * 90, sway = Math.sin(t * (0.15 + r() * 0.2) + i) * 60;
      const len = 700 + r() * 600, spread = 120 + r() * 220, a = (0.05 + r() * 0.07) * k;
      const g = ctx.createLinearGradient(0, top, 0, top + len);
      g.addColorStop(0, `rgba(190,235,255,${a})`); g.addColorStop(1, "rgba(190,235,255,0)");
      ctx.fillStyle = g; ctx.beginPath();
      ctx.moveTo(x0 + sway, top); ctx.lineTo(x0 + sway + w0, top);
      ctx.lineTo(x0 + sway * 2 + w0 + spread, top + len); ctx.lineTo(x0 + sway * 2 - spread * 0.4, top + len); ctx.fill();
    }
    ctx.restore();
  }
  function surface(ctx, t, y, d) {
    // the underside of the surface: bright, rippling, with the sun's disc smeared through it
    ctx.save();
    const g = ctx.createLinearGradient(0, y - 120, 0, y + 60);
    g.addColorStop(0, "rgba(200,240,255,0.95)"); g.addColorStop(0.6, "rgba(120,200,230,0.55)"); g.addColorStop(1, "rgba(80,160,200,0)");
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.moveTo(0, -10);
    for (let x = 0; x <= W; x += 20) ctx.lineTo(x, y + Math.sin(x * 0.012 + t * 1.3) * 7 + Math.sin(x * 0.031 - t * 2.1) * 4);
    ctx.lineTo(W, -10); ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    const r = rng(3);
    for (let i = 0; i < 70; i++) {   // caustic glints along the surface
      const x = (r() * W + t * (20 + r() * 30)) % W, yy = y + (r() - 0.6) * 24;
      ctx.fillStyle = `rgba(255,255,255,${0.08 + 0.12 * (0.5 + 0.5 * Math.sin(t * 3 + i))})`;
      ctx.fillRect(x, yy, 20 + r() * 50, 2);
    }
    const sg = ctx.createRadialGradient(W * 0.62, y - 30, 0, W * 0.62, y - 30, 420);
    sg.addColorStop(0, "rgba(255,255,240,0.55)"); sg.addColorStop(1, "rgba(255,255,240,0)");
    ctx.fillStyle = sg; ctx.fillRect(0, y - 450, W, 900);
    ctx.restore();
  }
  // drifting marine snow; rise > 0 makes it rise past the camera (camera sinking)
  function snow(ctx, t, o = {}) {
    const r = rng(o.seed ?? 11), n = o.count ?? 260, rise = o.rise ?? 6, drift = o.drift ?? 4;
    ctx.save();
    for (let i = 0; i < n; i++) {
      const z = r(), size = 0.6 + z * z * 3.2, sp = 0.4 + z;
      const x = ((r() * (W + 200) + t * drift * sp) % (W + 200)) - 100;
      let y = ((r() * (H + 200) - t * rise * 10 * sp) % (H + 200)); if (y < 0) y += H + 200; y -= 100;
      ctx.fillStyle = `rgba(210,232,245,${(0.15 + 0.45 * z) * (o.alpha ?? 1)})`;
      ctx.beginPath(); ctx.arc(x, y, size, 0, 6.283); ctx.fill();
    }
    ctx.restore();
  }
  function vignette(ctx, k = 0.55) {
    const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95);
    g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, `rgba(0,0,0,${k})`);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function bubbles(ctx, t, x, y, o = {}) {
    const r = rng(o.seed ?? 5), n = o.count ?? 30;
    ctx.save(); ctx.strokeStyle = "rgba(220,245,255,0.7)"; ctx.lineWidth = 1.5;
    for (let i = 0; i < n; i++) {
      const born = (o.t0 ?? 0) + r() * (o.span ?? 2), age = t - born; if (age < 0 || age > 4) continue;
      const bx = x + (r() - 0.5) * (o.w ?? 60) + Math.sin(age * 4 + i) * 6, by = y - age * (60 + r() * 80);
      ctx.globalAlpha = clamp(1 - age / 4); ctx.beginPath(); ctx.arc(bx, by, 2 + r() * 6, 0, 6.283); ctx.stroke();
    }
    ctx.restore();
  }
  // a sonar click: a bright arc that travels and fades
  function click(ctx, t, x, y, t0, o = {}) {
    const age = t - t0; if (age < 0 || age > (o.life ?? 1.6)) return;
    const R = 30 + age * (o.speed ?? 700), a = clamp(1 - age / (o.life ?? 1.6));
    ctx.save(); ctx.strokeStyle = o.color ?? `rgba(127,224,255,${0.9 * a})`; ctx.lineWidth = o.width ?? 5;
    const dir = o.dir ?? 0, spread = o.spread ?? 0.45;
    ctx.beginPath(); ctx.arc(x, y, R, dir - spread, dir + spread); ctx.stroke(); ctx.restore();
  }

  // ---------------- animals ----------------
  // o: {x, y (centre), len (px), angle (rad, 0 = facing its natural way), t, beat (Hz), ampK, fog 0..1, depth, flip, alpha, light}
  function animal(ctx, sp, o) {
    const S = SP[sp], img = document.getElementById(S.img);
    if (!img || !img.complete || !img.naturalWidth) return;
    const iw = img.naturalWidth, ih = img.naturalHeight, scale = o.len / iw, h = ih * scale;
    const pad = Math.ceil(o.len * 0.12);
    const L = layer(sp + (o.key || ""), Math.ceil(o.len) + 2, Math.ceil(h + pad * 2));
    const c = L.getContext("2d");
    c.clearRect(0, 0, L.width, L.height);
    const N = Math.max(24, Math.min(140, Math.round(o.len / 9)));
    const beat = o.beat ?? 0.35, amp = (o.ampK ?? 1) * S.amp * o.len, ph = (o.phase ?? 0);
    const sw = iw / N;
    for (let i = 0; i < N; i++) {
      const u = S.headRight ? 1 - i / N : i / N;            // 0 at the head, 1 at the tail tip
      const k = clamp((u - S.bend) / (1 - S.bend));
      const f = k * k;
      const dy = amp * f * Math.sin(6.283 * beat * o.t + ph - u * 2.4) + amp * 0.25 * Math.sin(6.283 * beat * o.t + ph) * (1 - u) * 0.3;
      c.drawImage(img, i * sw, 0, sw + 0.8, ih, i * sw * scale, pad + dy, (sw + 0.8) * scale, h);
    }
    // light from above, then the water between us and the animal
    c.globalCompositeOperation = "source-atop";
    const lg = c.createLinearGradient(0, pad, 0, pad + h);
    lg.addColorStop(0, `rgba(190,225,240,${o.light ?? 0.18})`); lg.addColorStop(0.55, "rgba(0,0,0,0)"); lg.addColorStop(1, "rgba(0,10,20,0.35)");
    c.fillStyle = lg; c.fillRect(0, 0, L.width, L.height);
    const fog = clamp(o.fog ?? 0.15);
    if (fog > 0) { c.fillStyle = rgb(o.fogColor || waterColor(o.depth ?? 0.4), fog); c.fillRect(0, 0, L.width, L.height); }
    if (o.silhouette) { c.fillStyle = `rgba(3,10,16,${o.silhouette})`; c.fillRect(0, 0, L.width, L.height); }
    c.globalCompositeOperation = "source-over";
    ctx.save();
    ctx.globalAlpha = o.alpha ?? 1;
    ctx.translate(o.x, o.y); ctx.rotate(o.angle || 0);
    if (o.flip) ctx.scale(-1, 1);
    ctx.drawImage(L, -L.width / 2, -L.height / 2);
    ctx.restore();
  }
  // a point moving along a path given as [[t, x, y], ...] with smooth easing between keys; returns {x, y, angle}
  function path(keys, t) {
    if (t <= keys[0][0]) return { x: keys[0][1], y: keys[0][2], a: 0 };
    for (let i = 0; i < keys.length - 1; i++) {
      const [t0, x0, y0] = keys[i], [t1, x1, y1] = keys[i + 1];
      if (t <= t1) {
        const u = smooth(t0, t1, t);
        return { x: lerp(x0, x1, u), y: lerp(y0, y1, u), a: Math.atan2(y1 - y0, Math.abs(x1 - x0) + 1e-6) };
      }
    }
    const k = keys[keys.length - 1]; return { x: k[1], y: k[2], a: 0 };
  }
  return { W, H, clamp, lerp, smooth, ease, easeIn, rng, water, waterColor, rays, surface, snow, vignette, bubbles, click, animal, path, SP };
})();
