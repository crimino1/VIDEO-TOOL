// Story scenes for the Mariana Trench film. A real diver (photo cut-out) falls through the ocean's zones.
// SC.name(ctx, t, o): t = seconds since the scene started; o = options and cue times from build.py.
const SC = (() => {
  const { W, H, clamp, lerp, smooth, ease, easeIn, rng, water, waterColor, snow, vignette, animal, bubbles, click } = OC;
  Object.assign(OC.SP, {
    angler: { img: "img_angler", headRight: false, bend: 0.55, amp: 0.05 }, fang: { img: "img_fang", headRight: false, bend: 0.5, amp: 0.06 },
    hatchet: { img: "img_hatchet", headRight: false, bend: 0.6, amp: 0.03 }, lantern: { img: "img_lantern", headRight: false, bend: 0.5, amp: 0.07 },
    vampire: { img: "img_vampire", headRight: false, bend: 0.6, amp: 0.03 }, snail: { img: "img_snail", headRight: false, bend: 0.35, amp: 0.07 },
  });
  const S = {};

  // the diver: a real photo cut-out with a slow tumble, bob, breathing bubbles and an optional suit light
  function diver(ctx, t, o) {
    const img = document.getElementById(o.img || "img_fall");
    if (!img || !img.naturalWidth) return;
    const h = o.h || 520, w = img.naturalWidth * h / img.naturalHeight;
    const x = o.x ?? 960, y = (o.y ?? 520) + Math.sin(t * 0.8) * 10;
    const rot = (o.rot ?? 0) + Math.sin(t * 0.35) * (o.sway ?? 0.06);
    if (o.lamp) {     // suit light: a soft cone of light out in front
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      const lx = x + (o.lampDx ?? 40), ly = y - h * 0.25, a0 = o.lampAngle ?? 1.2;
      const g = ctx.createRadialGradient(lx, ly, 10, lx, ly, 900);
      g.addColorStop(0, `rgba(230,240,255,${0.28 * o.lamp})`); g.addColorStop(1, "rgba(230,240,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(lx, ly); ctx.arc(lx, ly, 900, a0 - 0.35, a0 + 0.35); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    // draw into its own layer so the water tint only touches the diver, not the water around it
    let L = document.getElementById("__diverLayer");
    if (!L) { L = document.createElement("canvas"); L.id = "__diverLayer"; }
    const lw = Math.ceil(w) + 4, lh = Math.ceil(h) + 4;
    if (L.width !== lw || L.height !== lh) { L.width = lw; L.height = lh; }
    const c = L.getContext("2d");
    c.globalCompositeOperation = "source-over"; c.clearRect(0, 0, lw, lh);
    c.drawImage(img, 2, 2, w, h);
    if (o.fog) { c.globalCompositeOperation = "source-atop"; c.fillStyle = `rgba(${waterColor(o.depth ?? 0.5).join(",")},${o.fog})`; c.fillRect(0, 0, lw, lh); }
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.globalAlpha = o.alpha ?? 1;
    ctx.drawImage(L, -lw / 2, -lh / 2);
    ctx.restore();
    if (o.breath !== false) bubbles(ctx, t, x + (o.bx ?? 0), y - h * 0.42, { t0: 0, span: 1e3, count: 400, w: 20, seed: 3 });
  }

  // ---------- falling through the water: depth runs from o.d0 to o.d1 (0 surface .. 1 abyss) ----------
  S.fall = (ctx, t, o = {}) => {
    const d = o.d || 10, k = smooth(0, d, t);
    const depth = lerp(o.d0 ?? 0.1, o.d1 ?? 0.3, k);
    const surf = o.surface ? lerp(o.surface[0], o.surface[1], k) : undefined;
    water(ctx, t, { depth, surfaceY: surf, sunX: 900, rays: depth < 0.75 });
    snow(ctx, t, { count: o.snow ?? 200, rise: o.rise ?? 7, seed: 5, alpha: o.lamp ? 1 : 0.7 });
    if (o.fish) for (const f of o.fish) {
      const p = clamp((t - f.t0) / (f.dur || 6));
      if (p <= 0 || p >= 1) continue;
      animal(ctx, f.sp, { key: f.sp + f.t0, x: lerp(f.x0, f.x1, p), y: lerp(f.y0, f.y1 ?? f.y0, p), len: f.len, t, beat: f.beat ?? 0.8, fog: f.fog ?? 0.3, depth, light: 0.15, flip: f.flip, alpha: Math.min(1, p * 6, (1 - p) * 6) });
    }
    if (o.school) school(ctx, t, o.school, depth);
    const push = 1 + (o.push ?? 0.12) * k;      // slow camera push toward the diver
    diver(ctx, t, { img: o.img || "img_fall", h: (o.h || 560) * push, x: (o.x ?? 960) + (o.dx || 0) * k, y: o.y ?? 520, rot: (o.rot ?? 0.15) + (o.spin || 0) * k, lamp: o.lamp ? smooth(o.lampT ?? 0, (o.lampT ?? 0) + 0.6, t) : 0, fog: lerp(0.05, 0.55, depth) * (o.lamp ? 0.5 : 1), depth });
    vignette(ctx, 0.45 + depth * 0.4);
  };
  // a silver school sweeping past (tuna / lanternfish as specks)
  function school(ctx, t, s, depth) {
    const r = rng(s.seed || 4), n = s.n || 160;
    for (let i = 0; i < n; i++) {
      const p = (t - (s.t0 || 0)) / (s.dur || 4) + r() * 0.3 - 0.15;
      if (p < 0 || p > 1) continue;
      const x = lerp(-200, W + 200, p) + Math.sin(i) * 60, y = (s.y || 400) + (r() - 0.5) * (s.h || 300) + Math.sin(p * 6 + i) * 20;
      const len = (s.len || 26) * (0.7 + r() * 0.6);
      ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(p * 8 + i) * 0.1);
      if (s.glow) { ctx.fillStyle = `rgba(120,200,255,${0.8 * (0.5 + 0.5 * Math.sin(t * 6 + i))})`; ctx.beginPath(); ctx.arc(0, 0, 3, 0, 6.283); ctx.fill(); }
      else { const g = ctx.createLinearGradient(0, -len * 0.2, 0, len * 0.2); g.addColorStop(0, "#c9d8e2"); g.addColorStop(1, "#5d7383");
        ctx.fillStyle = g; ctx.beginPath(); ctx.ellipse(0, 0, len / 2, len * 0.16, 0, 0, 6.283); ctx.fill();
        ctx.beginPath(); ctx.moveTo(-len / 2, 0); ctx.lineTo(-len * 0.7, -len * 0.18); ctx.lineTo(-len * 0.7, len * 0.18); ctx.fill(); }
      ctx.restore();
    }
  }

  // ---------- floating at the surface, seen from just below ----------
  S.surface = (ctx, t, o = {}) => {
    water(ctx, t, { depth: 0.05, surfaceY: 240, sunX: 1100 });
    snow(ctx, t, { count: 90, rise: 0, drift: 5, seed: 7, alpha: 0.5 });
    diver(ctx, t, { img: "img_fall", h: 500, x: 960, y: 420 + smooth(o.tLet ?? 1e9, (o.tLet ?? 1e9) + 4, t) * 200, rot: 0.1, fog: 0.05, depth: 0.05 });
    vignette(ctx, 0.35);
  };

  // ---------- the night migration: day/night cycle and a living layer rising and sinking ----------
  S.migration = (ctx, t, o = {}) => {
    const d = o.d || 14, cyc = t / d;                  // 0..1: day -> night -> day
    const night = Math.sin(Math.PI * clamp(cyc * 1.25 - 0.1));
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgb(${lerp(70, 8, night) | 0},${lerp(150, 20, night) | 0},${lerp(190, 45, night) | 0})`); g.addColorStop(0.2, `rgb(${lerp(20, 4, night) | 0},${lerp(80, 14, night) | 0},${lerp(110, 30, night) | 0})`);
    g.addColorStop(1, "#010407"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // sun / moon arc over the surface line
    const sx = lerp(200, 1700, clamp(cyc)), sy = 70 - Math.sin(Math.PI * clamp(cyc)) * 0;
    ctx.fillStyle = night > 0.5 ? `rgba(230,235,255,${night})` : `rgba(255,240,180,${1 - night})`; ctx.beginPath(); ctx.arc(sx, 60 + night * 10, 26, 0, 6.283); ctx.fill();
    ctx.fillStyle = "rgba(200,230,240,0.5)"; ctx.fillRect(0, 118, W, 3);
    const r = rng(2), layerY = lerp(820, 300, night);
    for (let i = 0; i < 900; i++) {
      const x = r() * W, y = layerY + (r() - 0.5) * 180 + Math.sin(t * 0.8 + i) * 6;
      ctx.fillStyle = `rgba(150,215,255,${0.25 + 0.5 * r() * (0.6 + 0.4 * night)})`; ctx.beginPath(); ctx.arc(x, y, 1.2 + r() * 1.8, 0, 6.283); ctx.fill();
    }
    vignette(ctx, 0.45);
  };

  // ---------- hatchetfish counter-illumination seen from below ----------
  S.hatchet = (ctx, t, o = {}) => {
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#2b5f78"); g.addColorStop(1, "#04121b"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    snow(ctx, t, { count: 120, rise: 0, drift: 4, seed: 9, alpha: 0.5 });
    const on = smooth(o.tOn ?? 3, (o.tOn ?? 3) + 1.5, t);
    animal(ctx, "hatchet", { x: 960 + Math.sin(t * 0.4) * 40, y: 420, len: 620, t, beat: 0.6, fog: 0.05, depth: 0.4, light: 0.1, silhouette: 0.85 * (1 - on) });
    if (on > 0) {
      ctx.save(); ctx.globalCompositeOperation = "lighter";
      for (let i = 0; i < 14; i++) { const x = 760 + i * 30 + Math.sin(t * 0.4) * 40; ctx.fillStyle = `rgba(150,210,255,${0.7 * on})`; ctx.beginPath(); ctx.arc(x, 520 - Math.abs(i - 7) * 4, 6, 0, 6.283); ctx.fill(); }
      ctx.restore();
    }
    vignette(ctx, 0.4);
  };

  // ---------- anglerfish lure: a small fish drifts to the light and the jaws snap ----------
  S.angler = (ctx, t, o = {}) => {
    water(ctx, t, { depth: 0.95, rays: false });
    snow(ctx, t, { count: 140, rise: 1, seed: 11, alpha: 0.5 });
    const tSnap = o.tSnap ?? 6;
    const ax = 1050, ay = 560;
    animal(ctx, "angler", { x: ax, y: ay, len: 560, t, beat: 0.3, fog: 0.45, depth: 0.95, light: 0.05, silhouette: 0.2 });
    // the lure glow above and in front of the mouth
    const lx = ax - 290, ly = ay - 210, pulse = 0.75 + 0.25 * Math.sin(t * 2.2);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const gl = ctx.createRadialGradient(lx, ly, 0, lx, ly, 160); gl.addColorStop(0, `rgba(140,220,255,${0.9 * pulse})`); gl.addColorStop(1, "rgba(140,220,255,0)");
    ctx.fillStyle = gl; ctx.fillRect(lx - 160, ly - 160, 320, 320); ctx.restore();
    const fx = lerp(300, lx - 40, smooth(0.5, tSnap, t)), fy = lerp(380, ly + 60, smooth(0.5, tSnap, t));
    if (t < tSnap + 0.05) animal(ctx, "lantern", { x: fx, y: fy, len: 120, t, beat: 2, fog: 0.4, depth: 0.95, light: 0.3, flip: true });
    if (t > tSnap && t < tSnap + 0.25) { ctx.fillStyle = "rgba(255,255,255,0.18)"; ctx.fillRect(0, 0, W, H); }
    vignette(ctx, 0.7);
  };

  // ---------- decompression: gas leaving the blood as bubbles, like a shaken soda ----------
  S.bends = (ctx, t, o = {}) => {
    ctx.fillStyle = "#06121a"; ctx.fillRect(0, 0, W, H);
    // a blood vessel, cut open
    const y0 = 380, y1 = 700;
    const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "#5a0f14"); g.addColorStop(0.5, "#9b1d24"); g.addColorStop(1, "#5a0f14");
    ctx.fillStyle = g; ctx.fillRect(0, y0, W, y1 - y0);
    ctx.strokeStyle = "#c9787a"; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(0, y0); ctx.lineTo(W, y0); ctx.moveTo(0, y1); ctx.lineTo(W, y1); ctx.stroke();
    const fizz = smooth(o.tFizz ?? 2, (o.tFizz ?? 2) + 3, t);
    const r = rng(6);
    for (let i = 0; i < 260; i++) {
      const born = (o.tFizz ?? 2) + r() * 4, age = t - born; if (age < 0 || r() > fizz + 0.05) continue;
      const x = (r() * W + t * 120) % W, y = y0 + 20 + r() * (y1 - y0 - 40);
      const rad = 3 + Math.min(age, 3) * (2 + r() * 6);
      ctx.strokeStyle = "rgba(230,245,255,0.85)"; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x, y, rad, 0, 6.283); ctx.stroke();
    }
    // flowing cells
    for (let i = 0; i < 60; i++) { const x = (r() * W + t * 200) % W, y = y0 + 30 + r() * (y1 - y0 - 60); ctx.fillStyle = "rgba(200,40,50,0.8)"; ctx.beginPath(); ctx.ellipse(x, y, 16, 9, 0, 0, 6.283); ctx.fill(); }
    vignette(ctx, 0.5);
  };

  // ---------- standing on the bottom of Challenger Deep: ooze puffs up, amphipods arrive ----------
  S.bottom = (ctx, t, o = {}) => {
    ctx.fillStyle = "#010305"; ctx.fillRect(0, 0, W, H);
    const lampK = smooth(o.lampOn ?? 0.3, (o.lampOn ?? 0.3) + 0.6, t) * (1 - smooth(o.lampOff ?? 1e9, (o.lampOff ?? 1e9) + 0.3, t));
    // seafloor lit by the suit light
    const fl = ctx.createRadialGradient(960, 900, 50, 960, 900, 1100);
    fl.addColorStop(0, `rgba(150,140,120,${0.75 * lampK})`); fl.addColorStop(1, "rgba(20,20,18,0)");
    ctx.fillStyle = fl; ctx.fillRect(0, 640, W, 440);
    const r = rng(14);
    for (let i = 0; i < 260; i++) { const x = r() * W, y = 680 + r() * 400; ctx.fillStyle = `rgba(110,100,85,${0.4 * lampK * r()})`; ctx.beginPath(); ctx.ellipse(x, y, 6 + r() * 20, 2 + r() * 4, 0, 0, 6.283); ctx.fill(); }
    // the ooze cloud kicked up on landing
    const land = o.tLand ?? 1.5, puff = t - land;
    if (puff > 0) for (let i = 0; i < 70; i++) {
      const a = r() * Math.PI, sp = 60 + r() * 200, life = clamp(1 - puff / 7);
      const x = 960 + Math.cos(a) * sp * Math.min(puff, 3) * (r() < 0.5 ? -1 : 1), y = 860 - Math.sin(a) * sp * 0.4 * Math.min(puff, 3);
      ctx.fillStyle = `rgba(170,160,140,${0.12 * life * lampK})`; ctx.beginPath(); ctx.arc(x, y, 30 + puff * 25, 0, 6.283); ctx.fill();
    }
    snow(ctx, t, { count: 160, rise: -1, drift: 3, seed: 17, alpha: lampK });
    const dy = land > 0 ? lerp(-500, 0, smooth(0, land, t)) : 0;
    const img = document.getElementById("img_kneel");
    if (img && img.naturalWidth) {
      const hh = 600, ww = img.naturalWidth * hh / img.naturalHeight;
      ctx.save(); ctx.globalAlpha = 0.06 + 0.94 * lampK; ctx.drawImage(img, 960 - ww / 2, 300 + dy, ww, hh); ctx.restore();
    }
    if (o.amphipods) {     // pale shrimp-like scavengers crawling in toward the light
      for (let i = 0; i < 40; i++) {
        const p = clamp((t - (o.amphipods + r() * 3)) / 8); if (p <= 0) continue;
        const sx = r() < 0.5 ? -50 : W + 50, x = lerp(sx, 700 + r() * 520, p), y = 820 + r() * 220;
        ctx.save(); ctx.translate(x, y); ctx.rotate(sx < 0 ? 0 : Math.PI); ctx.fillStyle = `rgba(235,225,205,${0.9 * lampK})`;
        ctx.beginPath(); ctx.ellipse(0, 0, 18, 7, 0, 0, 6.283); ctx.fill(); for (let l = 0; l < 4; l++) ctx.fillRect(-10 + l * 6, 5, 2, 7 + Math.sin(t * 12 + l + i) * 2); ctx.restore();
      }
    }
    vignette(ctx, 0.6);
  };

  // ---------- a vertical rise back to the light ----------
  S.ascent = (ctx, t, o = {}) => {
    const d = o.d || 12, k = smooth(0, d, t);
    const depth = lerp(o.d0 ?? 0.95, o.d1 ?? 0.05, k);
    water(ctx, t, { depth, surfaceY: o.surface ? lerp(o.surface[0], o.surface[1], k) : undefined, sunX: 960, rays: depth < 0.8 });
    snow(ctx, t, { count: 200, rise: -7, seed: 21, alpha: 0.7 });
    diver(ctx, t, { img: "img_head", h: 560, x: 960, y: 540, rot: Math.PI, fog: lerp(0.05, 0.6, depth), depth, lamp: depth > 0.7 ? 1 : 0, lampAngle: -1.57 });
    vignette(ctx, 0.4 + depth * 0.4);
  };
  return S;
})();
