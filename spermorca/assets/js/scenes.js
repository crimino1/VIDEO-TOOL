// Story scenes. Each is SC.name(ctx, t, o): t = seconds since the scene started, o = cue times and options from build.py.
const SC = (() => {
  const { W, H, clamp, lerp, smooth, ease, easeIn, rng, water, waterColor, snow, vignette, animal, bubbles, click, path } = OC;
  const S = {};
  OC.SP.squid = { img: "img_squid", headRight: true, bend: 0.55, amp: 0.05, len: 1 };
  const shake = (t, t0, k = 14, d = 0.6) => { const a = t - t0; if (a < 0 || a > d) return [0, 0]; const f = (1 - a / d) * k; return [Math.sin(a * 90) * f, Math.cos(a * 70) * f * 0.7]; };

  // ---------- 1. twelve sperm whales rising out of the dark ----------
  S.rise = (ctx, t, o = {}) => {
    const d = o.d || 10, k = smooth(0, d, t);
    const depth = lerp(o.depth0 ?? 0.75, o.depth1 ?? 0.45, k);
    const surf = o.surface ? lerp(o.surface[0], o.surface[1], k) : undefined;
    water(ctx, t, { depth, surfaceY: surf, sunX: 1150 });
    snow(ctx, t, { count: 220, rise: 4, seed: 3 });
    if (o.blue) animal(ctx, "blue", { x: 1300 - t * 14, y: (surf ?? 0) + 80, len: 1000, t, beat: 0.12, fog: 0.12, depth: 0.2, light: 0.3, flip: true });
    const n = o.n || 12, r = rng(21), order = [];
    for (let i = 0; i < n; i++) order.push({ i, z: 0.15 + r() * 0.85, a: (r() - 0.5) * 0.12, b: r() });
    order.sort((p, q) => p.z - q.z);
    const start = o.start ?? 1250, end = o.end ?? 640;
    for (const { i, z, a, b } of order) {
      const lane = i - (n - 1) / 2;
      const x = 960 + lane * 150 * (0.6 + z * 0.6) + (z - 0.5) * 120 + (o.drift || 0) * t;
      const y = lerp(start + z * 120 + b * 80, end - (1 - z) * 160, ease(0, d * 1.05, t) * (o.riseK ?? 1));
      animal(ctx, "sperm", { key: "r" + i, x, y, len: 240 + z * 340, angle: -1.22 + a, t, beat: 0.28 + b * 0.08, phase: i * 1.7,
        fog: lerp(0.85, 0.3, z) * (1 - k * 0.3), depth, silhouette: o.silhouette ?? 0.4, light: 0.04 });
    }
    vignette(ctx, 0.6);
  };

  // ---------- 2. a pod swimming side-on near the surface (hunting formation) ----------
  S.pod = (ctx, t, o = {}) => {
    const surf = o.surfaceY ?? 90;
    water(ctx, t, { depth: o.depth ?? 0.3, surfaceY: surf, sunX: 700 });
    snow(ctx, t, { count: 160, rise: 0, drift: -30 * (o.speed ?? 1), seed: 8 });
    if (o.prey) animal(ctx, o.prey, { x: 1500 + Math.sin(t * 0.3) * 30 + (o.preyDx || 0) * t, y: surf + 120, len: o.preyLen || 900, t, beat: 0.14, fog: 0.2, depth: 0.25, light: 0.3, flip: o.preyFlip });
    const n = o.n || 8, r = rng(o.seed || 31), whales = [];
    for (let i = 0; i < n; i++) whales.push({ i, z: 0.2 + r() * 0.8, dx: r(), dy: r(), b: r() });
    whales.sort((p, q) => p.z - q.z);
    for (const w of whales) {
      const x = -300 + (w.dx * 900) + t * 60 * (o.speed ?? 1) + (o.x0 || 0);
      const y = surf + 140 + w.dy * 520 * (o.spreadY ?? 1);
      const lead = o.leader && w.i === 0;
      animal(ctx, o.species || "sperm", { key: "p" + w.i, x: lead ? x + 300 : x, y, len: (o.len || 380) * (0.55 + w.z * 0.6), angle: Math.sin(t * 0.4 + w.i) * 0.03, t, beat: 0.4 + w.b * 0.1, phase: w.i,
        fog: lerp(0.65, 0.12, w.z), depth: o.depth ?? 0.3, light: 0.22, flip: o.flip });
    }
    vignette(ctx, 0.5);
  };

  // ---------- 3. size line-up to scale ----------
  // o.items = [[species, metres, appearTime], ...]; o.pxPerM
  S.lineup = (ctx, t, o) => {
    water(ctx, t, { depth: 0.35, sunX: 960 });
    snow(ctx, t, { count: 120, rise: 0, drift: 6, seed: 4 });
    const ppm = o.pxPerM || 60;
    let y = o.y0 || 200;
    for (const [sp, m, at, label] of o.items) {
      const k = ease(at, at + 0.9, t); if (k <= 0) { y += (o.gap || 150); continue; }
      const len = m * ppm, x = (o.x0 || 160) + len / 2;
      animal(ctx, sp, { key: "l" + sp + m, x: x - (1 - k) * 80, y, len, t, beat: 0.3, fog: 0.1, depth: 0.3, light: 0.25, alpha: k, flip: OC.SP[sp].headRight === false });
      y += o.gap || 150;
    }
    // metre ruler along the bottom
    ctx.save(); ctx.strokeStyle = "rgba(220,235,245,0.8)"; ctx.lineWidth = 3; ctx.beginPath(); const rx = o.x0 || 160, ry = H - 70;
    ctx.moveTo(rx, ry); ctx.lineTo(rx + 28 * ppm, ry); ctx.stroke();
    for (let m = 0; m <= 28; m += 2) { ctx.beginPath(); ctx.moveTo(rx + m * ppm, ry - (m % 10 ? 8 : 16)); ctx.lineTo(rx + m * ppm, ry); ctx.stroke(); }
    ctx.restore();
  };

  // ---------- 4. breathe, fluke up, dive straight down ----------
  S.dive = (ctx, t, o = {}) => {
    const d = o.d || 18, tDive = o.tDive ?? 4.5;
    const cam = easeIn(tDive, d, t) * 2400;          // camera sinks with the whale
    const depth = clamp(0.1 + cam / 2600);
    water(ctx, t, { depth, surfaceY: 160 - cam, sunX: 1100 });
    snow(ctx, t, { count: 220, rise: 2 + 10 * smooth(tDive, tDive + 3, t), seed: 6 });
    const tilt = smooth(tDive - 1.2, tDive + 1.2, t) * 1.45;        // nose down
    const x = 960 + Math.sin(t * 0.3) * 20, y = lerp(250, 470, smooth(tDive - 1, tDive + 2.5, t)) + 0;
    animal(ctx, "sperm", { x, y, len: 820, angle: tilt, t, beat: 0.35, ampK: 1 + smooth(tDive - 1, tDive, t) * 0.8, fog: lerp(0.12, 0.55, depth), depth, light: lerp(0.3, 0.02, depth), silhouette: depth * 0.4 });
    if (t < tDive) bubbles(ctx, t, x + 380, 170 - cam, { t0: 0.3, span: tDive - 0.8, count: 30, w: 30 });
    vignette(ctx, 0.5 + depth * 0.3);
  };

  // ---------- 5. echolocation clicks in the dark ----------
  S.clicks = (ctx, t, o = {}) => {
    water(ctx, t, { depth: 0.92, rays: false });
    snow(ctx, t, { count: 180, rise: 1, drift: -10, seed: 9, alpha: 0.6 });
    const wx = 520 + t * 12, wy = 520;
    animal(ctx, "sperm", { x: wx, y: wy, len: 900, t, beat: 0.3, fog: 0.55, depth: 0.95, light: 0.02, silhouette: 0.3 });
    let sx = 1560 - t * 6, sy = 500 + Math.sin(t * 0.7) * 30, sLen = 420;
    if (o.suck) { const k = OC.easeIn(o.tSuck ?? 4, (o.tSuck ?? 4) + 1.6, t); sx = lerp(sx, wx + 430, k); sy = lerp(sy, wy + 40, k); sLen = lerp(420, 60, k); }
    const echoK = o.echo ?? 1;
    animal(ctx, "squid", { x: sx, y: sy, len: sLen, t, beat: 0.5, fog: 0.75 - 0.3 * echoK * smooth(o.tEcho ?? 2, (o.tEcho ?? 2) + 0.5, t), depth: 0.95, light: 0.1, flip: false });
    const every = o.every ?? 0.55;
    for (let c = 0; c < 40; c++) {
      const t0 = 0.4 + c * every; if (t0 > t) break;
      click(ctx, t, wx + 450, wy - 30, t0, { speed: 900, life: 1.3, spread: 0.32 });
      if (t0 + 1.0 < t && echoK) click(ctx, t, sx - 150, sy, t0 + 1.0, { dir: Math.PI, speed: 700, life: 1.2, spread: 0.35, color: `rgba(240,170,80,${0.8 * clamp(1 - (t - t0 - 1.0) / 1.2)})`, width: 4 });
    }
    vignette(ctx, 0.75);
  };

  // ---------- 6. the Essex: a bull rams the ship, turns, rams again ----------
  function hull(ctx, x, y, s, tiltA) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(tiltA); ctx.scale(s, s);
    const g = ctx.createLinearGradient(0, -20, 0, 160);
    g.addColorStop(0, "#3b2a1c"); g.addColorStop(1, "#140d08");
    ctx.fillStyle = g; ctx.beginPath();
    ctx.moveTo(-420, -10); ctx.quadraticCurveTo(-380, 120, -200, 150); ctx.lineTo(260, 150); ctx.quadraticCurveTo(400, 120, 450, -10); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.lineWidth = 3;
    for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(-400 + i * 10, i * 30); ctx.lineTo(430 - i * 12, i * 30); ctx.stroke(); }
    ctx.fillStyle = "#0c0805"; ctx.fillRect(-220, 150, 470, 18);   // keel
    ctx.restore();
  }
  S.essex = (ctx, t, o = {}) => {
    const t1 = o.t1 ?? 3.5, t2 = o.t2 ?? 9.0, tSink = o.tSink ?? 11;
    const [sx, sy] = shake(t, t1, 18), [sx2, sy2] = shake(t, t2, 22);
    ctx.save(); ctx.translate(sx + sx2, sy + sy2);
    water(ctx, t, { depth: 0.2, surfaceY: 200, sunX: 600 });
    snow(ctx, t, { count: 140, rise: 0, drift: 8, seed: 12 });
    const sink = smooth(tSink, tSink + 6, t);
    hull(ctx, 1150, 205 + sink * 160, 1, -0.02 - sink * 0.18 + Math.sin(t * 0.8) * 0.01);
    // whale: charges from the left, hits, swings away, comes back
    let p;
    if (t < t1) p = { x: lerp(-500, 820, easeIn(0, t1, t)), y: lerp(560, 330, smooth(0, t1, t)), a: -0.25 };
    else if (t < t2 - 2) { const k = smooth(t1, t2 - 2, t); p = { x: lerp(820, 300, k), y: lerp(330, 640, k), a: lerp(-0.25, 0.4, k), flip: k > 0.5 }; }
    else p = { x: lerp(300, 850, easeIn(t2 - 2, t2, t)), y: lerp(640, 360, smooth(t2 - 2, t2, t)), a: -0.3 };
    if (t > t2) { const k = smooth(t2, t2 + 3, t); p = { x: lerp(850, 600, k), y: lerp(360, 560, k), a: 0.3 }; }
    animal(ctx, "sperm", { x: p.x, y: p.y, len: 760, angle: p.a, t, beat: t < t1 || (t > t2 - 2 && t < t2) ? 0.8 : 0.35, ampK: 1.4, fog: 0.15, depth: 0.25, light: 0.28, flip: !!p.flip });
    if (t > t1) bubbles(ctx, t, 820, 260, { t0: t1, span: 0.6, count: 50, w: 160, seed: 2 });
    if (t > t2) bubbles(ctx, t, 860, 280, { t0: t2, span: 0.6, count: 60, w: 180, seed: 4 });
    ctx.restore();
    vignette(ctx, 0.5);
  };

  // ---------- 7. two bulls ramming head to head ----------
  S.rams = (ctx, t, o = {}) => {
    const tHit = o.tHit ?? 2.2;
    const [sx, sy] = shake(t, tHit, 16);
    ctx.save(); ctx.translate(sx, sy);
    water(ctx, t, { depth: 0.4, sunX: 960 });
    snow(ctx, t, { count: 160, rise: 0, drift: 4, seed: 14 });
    const k = easeIn(0, tHit, t), back = smooth(tHit, tHit + 1.5, t);
    animal(ctx, "sperm", { key: "a", x: lerp(-200, 560, k) - back * 140, y: 560, len: 760, t, beat: 0.7, fog: 0.2, depth: 0.4, light: 0.2 });
    animal(ctx, "sperm", { key: "b", x: lerp(2120, 1360, k) + back * 140, y: 540, len: 740, t, beat: 0.7, fog: 0.25, depth: 0.4, light: 0.2, flip: true, phase: 2 });
    if (t > tHit) bubbles(ctx, t, 960, 540, { t0: tHit, span: 0.5, count: 50, w: 120 });
    ctx.restore(); vignette(ctx, 0.55);
  };

  // ---------- 8. family at the surface: some dive, others babysit the calf ----------
  S.babysit = (ctx, t, o = {}) => {
    water(ctx, t, { depth: 0.25, surfaceY: 120, sunX: 1100 });
    snow(ctx, t, { count: 150, rise: 0, drift: 6, seed: 16 });
    const tDive = o.tDive ?? 2.0;
    const r = rng(5);
    for (let i = 0; i < 4; i++) {          // mothers leaving for the deep
      const dk = easeIn(tDive + i * 0.4, tDive + i * 0.4 + 6, t);
      animal(ctx, "sperm", { key: "m" + i, x: 300 + i * 360 + dk * 200, y: 300 + i * 30 + dk * 1100, len: 560, angle: dk * 1.2, t, beat: 0.35, phase: i, fog: 0.2 + dk * 0.6, depth: 0.3 + dk * 0.5, light: 0.2 });
    }
    // the sitters and the calf stay just under the surface
    animal(ctx, "sperm", { key: "s1", x: 820 + Math.sin(t * 0.3) * 20, y: 260, len: 600, t, beat: 0.25, fog: 0.1, depth: 0.2, light: 0.3, flip: true });
    animal(ctx, "sperm", { key: "s2", x: 1250 + Math.sin(t * 0.25) * 20, y: 330, len: 560, t, beat: 0.25, phase: 2, fog: 0.15, depth: 0.2, light: 0.3, flip: true });
    animal(ctx, "sperm", { key: "calf", x: 1000 + Math.sin(t * 0.5) * 30, y: 360, len: 250, t, beat: 0.6, phase: 1, fog: 0.08, depth: 0.2, light: 0.35, flip: true });
    vignette(ctx, 0.45);
  };

  // ---------- 9. longline: whales strip black cod off the hooks as the line comes up ----------
  S.longline = (ctx, t, o = {}) => {
    water(ctx, t, { depth: 0.35, surfaceY: 80, sunX: 400 });
    snow(ctx, t, { count: 150, rise: 0, drift: 4, seed: 18 });
    // boat hull at the surface, line running down and to the right
    ctx.save(); ctx.fillStyle = "#11171c"; ctx.beginPath(); ctx.moveTo(180, 70); ctx.lineTo(560, 70); ctx.quadraticCurveTo(540, 150, 420, 160); ctx.lineTo(240, 160); ctx.closePath(); ctx.fill();
    const haul = t * 22;
    ctx.strokeStyle = "rgba(230,240,245,0.8)"; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(480, 150); ctx.lineTo(1900, 1000); ctx.stroke();
    for (let i = 0; i < 16; i++) {
      const u = ((i * 110 + haul) % 1700) / 1700, x = lerp(1900, 480, u), y = lerp(1000, 150, u);
      const taken = o.steal && (i % 3 === 0) && u > 0.35;
      ctx.strokeStyle = "rgba(220,230,235,0.7)"; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + 40); ctx.stroke();
      if (!taken) { ctx.fillStyle = "#2b2f33"; ctx.beginPath(); ctx.ellipse(x, y + 70, 12, 34, 0, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.moveTo(x - 10, y + 104); ctx.lineTo(x, y + 92); ctx.lineTo(x + 10, y + 104); ctx.fill(); }
    }
    ctx.restore();
    if (o.steal) {
      animal(ctx, "sperm", { key: "w1", x: 1250 + Math.sin(t * 0.4) * 60, y: 700, len: 640, angle: -0.5, t, beat: 0.4, fog: 0.25, depth: 0.35, light: 0.2, flip: true });
      animal(ctx, "sperm", { key: "w2", x: 820 + Math.sin(t * 0.35) * 50, y: 520, len: 520, angle: -0.55, t, beat: 0.4, phase: 2, fog: 0.4, depth: 0.35, light: 0.2, flip: true });
    }
    vignette(ctx, 0.5);
  };

  // ---------- top-down shapes for formation scenes ----------
  // a whale seen from above: real skin texture from the illustration, squared head for sperm whales, flexing flukes
  const pats = {};
  function skin(ctx, kind) {
    if (pats[kind]) return pats[kind];
    const img = document.getElementById(kind === "orca" ? "img_orca" : kind === "blue" ? "img_blue" : "img_sperm");
    if (!img || !img.naturalWidth) return null;
    const c = document.createElement("canvas"); c.width = 400; c.height = 160;
    const g = c.getContext("2d"); const iw = img.naturalWidth, ih = img.naturalHeight;
    g.drawImage(img, iw * 0.35, ih * (kind === "orca" ? 0.42 : 0.35), iw * 0.25, ih * 0.25, 0, 0, 400, 160);
    pats[kind] = ctx.createPattern(c, "repeat"); return pats[kind];
  }
  function topWhale(ctx, x, y, len, ang, kind, t, ph = 0) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
    const wmax = len * (kind === "orca" ? 0.11 : kind === "blue" ? 0.07 : 0.095);
    const hw = (u) => {     // u: 0 tail stock .. 1 head front
      if (kind === "sperm") return wmax * (u < 0.12 ? 0.22 + u * 2 : u < 0.6 ? 0.46 + 0.54 * Math.sin((u - 0.12) / 0.48 * Math.PI / 2) : u < 0.95 ? 1 - (u - 0.6) * 0.15 : (0.95 - (u - 0.95) * 4) );
      return wmax * Math.sin(Math.PI * Math.pow(Math.max(0.02, u), kind === "orca" ? 0.8 : 0.7)) * (u < 0.1 ? 0.3 + u * 7 : 1);
    };
    const x0 = -len / 2 + len * 0.18, x1 = len / 2, N = 40;
    ctx.beginPath();
    for (let i = 0; i <= N; i++) { const u = i / N; ctx.lineTo(lerp(x0, x1, u), -hw(u)); }
    for (let i = N; i >= 0; i--) { const u = i / N; ctx.lineTo(lerp(x0, x1, u), hw(u)); }
    ctx.closePath();
    ctx.save(); ctx.clip();
    ctx.fillStyle = kind === "orca" ? "#0d0f12" : kind === "blue" ? "#61788a" : "#2c2f33"; ctx.fillRect(-len, -len, len * 2, len * 2);
    const p = skin(ctx, kind);
    if (p && kind !== "orca") { ctx.globalAlpha = 0.85; ctx.fillStyle = p; ctx.fillRect(-len, -len, len * 2, len * 2); ctx.globalAlpha = 1; }
    if (kind === "orca") {        // grey saddle behind the fin and the white eye patches showing at the sides
      ctx.fillStyle = "rgba(170,175,180,0.55)"; ctx.beginPath(); ctx.ellipse(-len * 0.02, 0, len * 0.08, wmax * 0.55, 0, 0, 6.283); ctx.fill();
      ctx.fillStyle = "rgba(235,238,240,0.9)"; for (const s_ of [-1, 1]) { ctx.beginPath(); ctx.ellipse(len * 0.3, s_ * wmax * 0.82, len * 0.06, wmax * 0.2, 0, 0, 6.283); ctx.fill(); }
    }
    const sh = ctx.createLinearGradient(0, -wmax, 0, wmax);
    sh.addColorStop(0, "rgba(0,0,0,0.55)"); sh.addColorStop(0.45, "rgba(255,255,255,0.12)"); sh.addColorStop(0.55, "rgba(255,255,255,0.12)"); sh.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = sh; ctx.fillRect(-len, -wmax, len * 2, wmax * 2);
    ctx.restore();
    if (kind === "orca") { ctx.strokeStyle = "#000"; ctx.lineWidth = Math.max(2, len * 0.02); ctx.beginPath(); ctx.moveTo(len * 0.12, 0); ctx.lineTo(-len * 0.06, 0); ctx.stroke(); }
    // flukes, flexing with the beat
    const fl = 0.75 + 0.25 * Math.sin(t * 3 + ph);
    ctx.save(); ctx.translate(x0, 0); ctx.scale(fl, 1);
    ctx.fillStyle = kind === "orca" ? "#0d0f12" : kind === "blue" ? "#5a7082" : "#2a2d31";
    ctx.beginPath(); ctx.moveTo(4, 0); ctx.quadraticCurveTo(-len * 0.08, -wmax * 1.7, -len * 0.16, -wmax * 2.4); ctx.quadraticCurveTo(-len * 0.12, -wmax * 0.5, -len * 0.19, 0);
    ctx.quadraticCurveTo(-len * 0.12, wmax * 0.5, -len * 0.16, wmax * 2.4); ctx.quadraticCurveTo(-len * 0.08, wmax * 1.7, 4, 0); ctx.fill(); ctx.restore();
    ctx.restore();
  }
  function topWater(ctx, t) {
    const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 1200);
    g.addColorStop(0, "#1d5b78"); g.addColorStop(1, "#06202e"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 14; i++) {              // moving caustic bands seen from above
      ctx.strokeStyle = `rgba(150,220,240,${0.02 + 0.015 * Math.sin(t + i)})`; ctx.lineWidth = 60;
      ctx.beginPath(); for (let x = -100; x <= W + 100; x += 40) ctx.lineTo(x, i * 90 + Math.sin(x * 0.006 + t * 0.6 + i) * 40); ctx.stroke();
    }
    ctx.restore();
  }

  // ---------- 10. the marguerite: heads in, tails out, orcas circling ----------
  S.marguerite = (ctx, t, o = {}) => {
    topWater(ctx, t);
    const cx = 960, cy = 540, form = smooth(0.5, o.tForm ?? 3, t);
    const pull = o.tPull ? smooth(o.tPull, o.tPull + 2, t) - smooth(o.tBack ?? 1e9, (o.tBack ?? 1e9) + 2.5, t) : 0;
    for (let i = 0; i < 9; i++) {
      const a = i / 9 * 6.283 + 0.2, rr = lerp(380 + (i % 3) * 60, 175, form);
      let x = cx + Math.cos(a) * rr + (1 - form) * (i * 37 % 200 - 100), y = cy + Math.sin(a) * rr;
      if (i === 4 && pull) { x += Math.cos(a) * 260 * pull; y += Math.sin(a) * 260 * pull; }
      topWhale(ctx, x, y, 330, a + Math.PI, "sperm", t * (0.5 + form), i);    // heads to the centre
    }
    if (o.helpers && pull) for (const j of [3, 5]) {
      const a = j / 9 * 6.283 + 0.2, k = smooth(o.tPull + 0.8, o.tPull + 2, t) - smooth(o.tBack, o.tBack + 2.5, t);
      topWhale(ctx, cx + Math.cos(a) * (175 + 200 * k), cy + Math.sin(a) * (175 + 200 * k), 320, a + Math.PI, "sperm", t, j);
    }
    const orcaK = smooth(o.tOrcas ?? 1, (o.tOrcas ?? 1) + 2, t);
    for (let i = 0; i < 12; i++) {
      const a = t * (0.25 + (i % 3) * 0.05) + i / 12 * 6.283, rr = 560 + Math.sin(t * 0.8 + i) * 80 - (o.attack ? 120 * Math.max(0, Math.sin(t * 0.9 + i * 1.3)) : 0);
      ctx.globalAlpha = orcaK;
      topWhale(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.75, 170, a + Math.PI / 2, "orca", t * 2, i);
      ctx.globalAlpha = 1;
    }
    vignette(ctx, 0.6);
  };

  // ---------- 11. deep foraging: a family spread out in a long line, clicking ----------
  S.forage = (ctx, t, o = {}) => {
    water(ctx, t, { depth: 0.9, rays: false });
    snow(ctx, t, { count: 200, rise: 0, drift: -14, seed: 22, alpha: 0.7 });
    for (let i = 0; i < 6; i++) {
      const z = i / 5, x = 200 + i * 300 + t * 20, y = 300 + Math.sin(i * 1.7) * 160 + z * 200;
      animal(ctx, "sperm", { key: "f" + i, x, y, len: 260 + z * 260, t, beat: 0.3, phase: i, fog: 0.7 - z * 0.3, depth: 0.92, silhouette: 0.3, light: 0.02 });
      for (let c = 0; c < 30; c++) { const t0 = 0.3 + c * 0.9 + i * 0.27; if (t0 > t) break; click(ctx, t, x + (130 + z * 130), y, t0, { speed: 500, life: 1.4, spread: 0.3, width: 3 }); }
    }
    vignette(ctx, 0.75);
  };

  // ---------- 12. surface race: orca bursts away, sperm whale falls behind ----------
  S.race = (ctx, t, o = {}) => {
    water(ctx, t, { depth: 0.25, surfaceY: 110, sunX: 900 });
    snow(ctx, t, { count: 140, rise: 0, drift: -50, seed: 24 });
    animal(ctx, "orca", { x: 300 + easeIn(0.5, 6, t) * 1900 + t * 30, y: 380, len: 420, t, beat: 1.2, fog: 0.1, depth: 0.25, light: 0.3 });
    animal(ctx, "sperm", { x: 200 + t * 70, y: 680, len: 780, t, beat: 0.6, fog: 0.15, depth: 0.25, light: 0.25 });
    vignette(ctx, 0.5);
  };

  // ---------- 13. cornering a blue whale at the surface, from above ----------
  S.surround = (ctx, t, o = {}) => {
    topWater(ctx, t);
    const cx = 960 + t * 8, cy = 540;
    topWhale(ctx, cx, cy, 620, 0, "blue", t * 0.6);
    const close = smooth(0.5, o.tClose ?? 5, t);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * 6.283, rr = lerp(900, 420 + (i % 2) * 60, close);
      topWhale(ctx, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.7, 300, a + Math.PI, "sperm", t, i);
    }
    if (o.tBreath !== undefined) {         // the blue whale's blow when it has to breathe
      const k = t - o.tBreath; if (k > 0 && k < 2.5) { ctx.fillStyle = `rgba(240,248,255,${0.6 * (1 - k / 2.5)})`; ctx.beginPath(); ctx.arc(cx + 230, cy, 40 + k * 60, 0, 6.283); ctx.fill(); }
    }
    vignette(ctx, 0.6);
  };

  // ---------- 14. a 40-tonne ram into a humpback's side ----------
  S.ram = (ctx, t, o = {}) => {
    const tHit = o.tHit ?? 2.5;
    const [sx, sy] = shake(t, tHit, 24, 0.8);
    ctx.save(); ctx.translate(sx, sy);
    water(ctx, t, { depth: 0.25, surfaceY: 90, sunX: 1200 });
    snow(ctx, t, { count: 160, rise: 0, drift: -6, seed: 26 });
    const push = smooth(tHit, tHit + 1.2, t);
    animal(ctx, "hump", { x: 1250 + push * 60, y: 330 - push * 30, len: 900, angle: push * -0.12, t, beat: 0.3 + push * 0.6, fog: 0.15, depth: 0.25, light: 0.3 });
    animal(ctx, "sperm", { x: lerp(-300, 830, easeIn(0, tHit, t)) - push * 40, y: lerp(800, 520, smooth(0, tHit, t)), len: 820, angle: -0.35, t, beat: 0.9, ampK: 1.4, fog: 0.15, depth: 0.25, light: 0.25 });
    if (t > tHit) bubbles(ctx, t, 1150, 430, { t0: tHit, span: 0.6, count: 70, w: 200 });
    ctx.restore(); vignette(ctx, 0.5);
  };

  // ---------- 15. the big bang: a ring of whales firing sound at once ----------
  S.bigbang = (ctx, t, o = {}) => {
    topWater(ctx, t);
    const cx = 960, cy = 540, tFire = o.tFire ?? 2.5;
    topWhale(ctx, cx, cy, 520, 0.1, "blue", t * 0.5);
    for (let i = 0; i < 12; i++) {
      const a = i / 12 * 6.283, rr = 430;
      const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr * 0.72;
      topWhale(ctx, x, y, 260, a + Math.PI, "sperm", t, i);
      for (let c = 0; c < 6; c++) {
        const t0 = tFire + c * 0.6, age = t - t0; if (age < 0 || age > 1.2) continue;
        ctx.strokeStyle = `rgba(160,230,255,${0.9 * (1 - age / 1.2)})`; ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(x, y, 20 + age * 380, a + Math.PI - 0.35, a + Math.PI + 0.35); ctx.stroke();
      }
    }
    const blast = t - tFire;
    if (blast > 0) { ctx.fillStyle = `rgba(200,240,255,${0.18 * Math.max(0, Math.sin(blast * 5.2)) * clamp(1 - blast / 4)})`; ctx.fillRect(0, 0, W, H); }
    vignette(ctx, 0.6);
  };

  // ---------- 16. orcas veer away from a sperm whale pod ----------
  S.avoid = (ctx, t, o = {}) => {
    water(ctx, t, { depth: 0.3, surfaceY: 100, sunX: 900 });
    snow(ctx, t, { count: 140, rise: 0, drift: 0, seed: 28 });
    for (let i = 0; i < 5; i++) animal(ctx, "sperm", { key: "s" + i, x: 250 + i * 70 + t * 40, y: 380 + i * 110, len: 600 - i * 40, t, beat: 0.35, phase: i, fog: 0.15 + i * 0.08, depth: 0.3, light: 0.25 });
    const turn = smooth(o.tTurn ?? 2, (o.tTurn ?? 2) + 2.5, t);
    for (let i = 0; i < 6; i++) {
      const x = lerp(1900, 1350, smooth(0, o.tTurn ?? 2, t)) + turn * 500 + i * 60, y = 330 + i * 100 - turn * 120;
      animal(ctx, "orca", { key: "o" + i, x, y, len: 260, angle: turn * -0.35, t, beat: 0.9, phase: i, fog: 0.2 + i * 0.06, depth: 0.3, light: 0.25, flip: turn < 0.5 });
    }
    vignette(ctx, 0.5);
  };

  // ---------- 17. the whale pump: feed deep, rise, release nutrients, plankton blooms ----------
  S.pump = (ctx, t, o = {}) => {
    const tUp = o.tUp ?? 3, tRelease = o.tRelease ?? 8;
    const rise = smooth(tUp, tRelease, t);
    const camY = (1 - rise) * 1400;
    water(ctx, t, { depth: lerp(0.85, 0.2, rise), surfaceY: 140 + camY, sunX: 1000 });
    snow(ctx, t, { count: 180, rise: -6 * (1 - rise), seed: 30 });
    animal(ctx, "sperm", { x: 900, y: 560, len: 820, angle: lerp(-1.1, 0, smooth(tRelease - 2, tRelease, t)), t, beat: 0.35, fog: lerp(0.6, 0.12, rise), depth: lerp(0.85, 0.2, rise), light: lerp(0.02, 0.3, rise) });
    if (t > tRelease) {
      const r = rng(9), age = t - tRelease;
      ctx.save();
      for (let i = 0; i < 160; i++) {       // nutrient plume, then green plankton spreading through the sunlit water
        const born = r() * 2, a = age - born; if (a < 0) continue;
        const x = 520 + r() * 260 + a * (r() - 0.5) * 140, y = 520 - a * (20 + r() * 50);
        ctx.fillStyle = `rgba(150,110,60,${0.5 * clamp(1 - a / 5)})`; ctx.beginPath(); ctx.arc(x, y, 3 + a * 3, 0, 6.283); ctx.fill();
      }
      const bloom = smooth(tRelease + 2, tRelease + 8, t);
      for (let i = 0; i < 500 * bloom; i++) {
        const x = r() * W, y = 150 + r() * 400;
        ctx.fillStyle = `rgba(120,230,140,${0.35 * bloom * r()})`; ctx.beginPath(); ctx.arc(x, y, 1 + r() * 2.5, 0, 6.283); ctx.fill();
      }
      ctx.restore();
    }
    vignette(ctx, 0.5);
  };

  // ---------- 18. the ocean's layers: a thin sunlit lid over a vast dark ----------
  S.layers = (ctx, t, o = {}) => {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#3d9dc0"); g.addColorStop(0.16, "#145a7a"); g.addColorStop(0.3, "#06202e"); g.addColorStop(1, "#000");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    OC.rays(ctx, t, 0.8, 0, 900);
    snow(ctx, t, { count: 160, rise: 1, seed: 32, alpha: 0.6 });
    animal(ctx, "orca", { x: 500 + t * 30, y: 110, len: 260, t, beat: 0.8, fog: 0.05, depth: 0.1, light: 0.3 });
    animal(ctx, "orca", { key: "o2", x: 700 + t * 30, y: 150, len: 220, t, beat: 0.8, phase: 1, fog: 0.1, depth: 0.1, light: 0.3 });
    const dk = smooth(o.tDive ?? 1, (o.tDive ?? 1) + 8, t);
    animal(ctx, "sperm", { x: 1300 + dk * 80, y: lerp(260, 880, dk), len: 520, angle: lerp(0.2, 1.3, smooth(0, 2, t)), t, beat: 0.35, fog: lerp(0.15, 0.6, dk), depth: lerp(0.2, 0.9, dk), light: 0.1 });
    if (o.squid) animal(ctx, "squid", { x: 1500, y: 960, len: 380, t, beat: 0.5, fog: 0.7, depth: 0.95, alpha: smooth(2, 4, t) });
    ctx.strokeStyle = "rgba(255,255,255,0.35)"; ctx.setLineDash([12, 12]); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, H * 0.2); ctx.lineTo(W, H * 0.2); ctx.stroke(); ctx.setLineDash([]);
  };

  // ---------- 19. a lone whale sinking into the dark (ending) ----------
  S.descend = (ctx, t, o = {}) => {
    const d = o.d || 12, k = smooth(0, d, t);
    water(ctx, t, { depth: lerp(0.4, 0.95, k), sunX: 1000 });
    snow(ctx, t, { count: 200, rise: 3, seed: 34 });
    animal(ctx, "sperm", { x: 960, y: lerp(380, 820, k), len: lerp(800, 380, k), angle: 1.15, t, beat: 0.3, fog: lerp(0.2, 0.8, k), depth: lerp(0.4, 0.95, k), light: 0.05, silhouette: k * 0.5 });
    vignette(ctx, 0.6 + k * 0.3);
  };

  // ---------- 20. wave washing: orcas charge side by side, dive, the wave sweeps the seal off ----------
  S.wavewash = (ctx, t, o = {}) => {
    const tDive = o.tDive ?? 4.5;
    const surf = 430;
    water(ctx, t, { depth: 0.2, surfaceY: surf, sunX: 1100 });
    // sky and ice above the surface line
    const sky = ctx.createLinearGradient(0, 0, 0, surf); sky.addColorStop(0, "#9fb9c9"); sky.addColorStop(1, "#dfe9ee");
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, surf - 8);
    const wave = Math.max(0, Math.sin(clamp((t - tDive) / 2.2) * Math.PI)) * 120;
    ctx.fillStyle = "#f3f8fa"; ctx.beginPath(); ctx.moveTo(1180, surf - 8); ctx.lineTo(1230, surf - 60); ctx.lineTo(1660, surf - 60); ctx.lineTo(1710, surf - 8); ctx.fill(); ctx.fillStyle = "rgba(170,200,215,0.9)"; ctx.fillRect(1180, surf - 8, 530, 40);
    // the wave rolling over the floe
    ctx.fillStyle = "rgba(190,225,240,0.9)"; ctx.beginPath(); ctx.moveTo(0, surf);
    for (let x = 0; x <= W; x += 20) { const c = 900 + (t - tDive) * 380; ctx.lineTo(x, surf - wave * Math.exp(-Math.pow((x - c) / 260, 2))); }
    ctx.lineTo(W, surf + 20); ctx.lineTo(0, surf + 20); ctx.fill();
    // seal on the ice, swept off after the wave passes
    const off = smooth(tDive + 1.2, tDive + 2.6, t);
    ctx.save(); ctx.translate(lerp(1440, 1800, off), lerp(surf - 78, surf + 40, off)); ctx.rotate(off * 1.2);
    ctx.fillStyle = "#6a6f72"; ctx.beginPath(); ctx.ellipse(0, 0, 70, 20, 0, 0, 6.283); ctx.fill(); ctx.beginPath(); ctx.arc(62, -8, 16, 0, 6.283); ctx.fill(); ctx.restore();
    for (let i = 0; i < 4; i++) {
      const dv = smooth(tDive - 0.3, tDive + 0.8, t);
      const x = lerp(-300, 860, smooth(0, tDive, t)) + dv * 300 + i * 70, y = surf + 80 + i * 95 + dv * 260;
      animal(ctx, "orca", { key: "w" + i, x: x - i * 40, y, len: 360, angle: dv * 0.7, t, beat: 1.1, phase: i, fog: 0.1 + i * 0.07, depth: 0.2, light: 0.3 });
    }
    snow(ctx, t, { count: 80, rise: 0, drift: 10, seed: 36, alpha: 0.5 });
  };
  return S;
})();
