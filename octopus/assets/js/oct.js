// Blue-ringed octopus film: flat-style explainer scenes (Unseen By Eye). Built on FL (flat.js). Pure functions of scene time t.
const OC = (() => {
  const { W, H, clamp, lerp, smooth, rng, ell, circ, line, vgrad, rays, bubbles, person, shade, rock, coral, kelp, starfish, shell } = FL;
  const eo = (k) => 1 - Math.pow(1 - clamp(k), 3);
  const pulse = (t, a, b) => smooth(a, a + 0.25, t) * (1 - smooth(b - 0.25, b, t));
  const font = (px, w = 700) => `${w} ${px}px Fredoka, sans-serif`;
  function label(ctx, txt, x, y, px = 44, col = "#ffffff", a = 1, align = "center", bg = null) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.font = font(px); ctx.textAlign = align; ctx.textBaseline = "middle";
    if (bg) { const w = ctx.measureText(txt).width + px * 1.1, h = px * 1.45, x0 = align === "center" ? x - w / 2 : align === "left" ? x - px * 0.55 : x - w + px * 0.55;
      ctx.fillStyle = bg; ctx.beginPath(); ctx.roundRect(x0, y - h / 2, w, h, h / 2); ctx.fill(); }
    ctx.fillStyle = "rgba(10,40,70,0.35)"; ctx.fillText(txt, x, y + px * 0.08);
    ctx.fillStyle = col; ctx.fillText(txt, x, y); ctx.restore();
  }
  // flat underwater backdrop: teal gradient, rays, soft sand, drifting bubbles
  function sea(ctx, t, o = {}) {
    ctx.fillStyle = vgrad(ctx, 0, H, o.cols || ["#0e6fa8", "#1a93c7", "#58c3df"]); ctx.fillRect(0, 0, W, H);
    rays(ctx, t, 6, 300, 300, -240, o.rays ?? 0.16);
    if (o.sand !== false) { ctx.fillStyle = o.sandCol || "#e6c98f"; ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, (o.sandY ?? 900) + Math.sin(x * 0.006) * 18); ctx.lineTo(W, H); ctx.fill();
      ctx.fillStyle = shade(o.sandCol || "#e6c98f", -0.08); ctx.beginPath(); ctx.moveTo(0, H); for (let x = 0; x <= W; x += 40) ctx.lineTo(x, (o.sandY ?? 900) + 50 + Math.sin(x * 0.009 + 1) * 14); ctx.lineTo(W, H); ctx.fill(); }
    bubbles(ctx, t, 18, 11);
  }
  function dark(ctx, o = {}) { ctx.fillStyle = vgrad(ctx, 0, H, o.cols || ["#08243d", "#0b3556", "#0e4a72"]); ctx.fillRect(0, 0, W, H); }

  // ---------------- the octopus ----------------
  const BASE = "#c9a256", BASED = "#5e4120", RING = "#22b8ff";
  // o = {x, y (mantle centre), s, flash 0..1 (rings lit), dark 0..1 (skin darkens), rot, arm: "spread"|"walk"|"wrap"|"tuck", wrapX, wrapY, eggs 0..1, glow: {arms, skin, eggs, gland}, look}
  function octo(ctx, t, o) {
    const s = o.s ?? 1, fl = clamp(o.flash ?? 0), dk = clamp(o.dark ?? fl * 0.85);
    const skin = mixc(BASE, BASED, dk * 0.75), skinD = shade(skin, -0.22);
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.rot ?? 0); ctx.scale(s * (o.flip ? -1 : 1), s);
    const arms = [];
    for (let k = 0; k < 8; k++) {
      const side = k < 4 ? -1 : 1, idx = k < 4 ? k : 7 - k;          // 0 = front-most
      let a0 = side * (0.25 + idx * 0.32), len = 215 - idx * 12, curl = side * (0.9 + 0.25 * Math.sin(t * 1.3 + k));
      const wig = Math.sin(t * 2.1 + k * 1.7);
      if (o.arm === "walk") { a0 += Math.sin(t * 3.2 + k * 1.3) * 0.18; curl = side * (0.5 + 0.35 * Math.sin(t * 3.2 + k)); }
      if (o.arm === "tuck") { a0 *= 0.55; len *= 0.75; curl = side * 2.2; }
      const pts = [];
      for (let i = 0; i <= 18; i++) {
        const u = i / 18; let ang = a0 + curl * u * u + wig * 0.15 * u;
        if (o.arm === "wrap" && o.wrapX !== undefined) {   // reach toward a point and curl around it
          const tx = (o.wrapX - o.x) / s, ty = (o.wrapY - o.y) / s, wa = Math.atan2(tx, ty) + (k - 3.5) * 0.12;
          ang = lerp(ang, wa + Math.sin(u * 5 + k) * 0.6 * u, clamp(o.wrapK ?? 1));
        }
        const prev = pts[i - 1] || [0, 40];
        const step = len / 18;
        pts.push(i ? [prev[0] + Math.sin(ang) * step, prev[1] + Math.cos(ang) * step] : [Math.sin(a0) * 30, 40]);
      }
      arms.push({ pts, idx, k, w0: 40 - idx * 2 });
    }
    const drawArm = (A, back) => {
      const { pts, w0 } = A; const L = [], R = [];
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i], q = pts[Math.min(pts.length - 1, i + 1)], r0 = pts[Math.max(0, i - 1)];
        const dx = q[0] - r0[0], dy = q[1] - r0[1], l = Math.hypot(dx, dy) || 1, w = w0 * (1 - i / pts.length * 0.9) * 0.5;
        L.push([p[0] - dy / l * w, p[1] + dx / l * w]); R.push([p[0] + dy / l * w, p[1] - dx / l * w]);
      }
      ctx.beginPath(); L.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.closePath();
      ctx.fillStyle = back ? skinD : skin; ctx.fill();
      // rings along the arm
      for (const u of [0.2, 0.38, 0.55, 0.7]) { const i = Math.round(u * (pts.length - 1)); ringAt(ctx, pts[i][0], pts[i][1], w0 * (1 - u * 0.9) * 0.36, fl, back); }
      if (o.glow && o.glow.arms) { ctx.save(); ctx.globalAlpha = o.glow.arms * 0.55; ctx.fillStyle = "#c86bff"; ctx.beginPath(); L.forEach((p, i) => i ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); for (let i = R.length - 1; i >= 0; i--) ctx.lineTo(R[i][0], R[i][1]); ctx.fill(); ctx.restore(); }
    };
    arms.filter((A) => A.idx >= 2).forEach((A) => drawArm(A, true));
    // egg cluster held under the arms
    if (o.eggs) { const r = rng(5); for (let i = 0; i < 70; i++) { const ex = (r() - 0.5) * 150, ey = 60 + r() * 90 + Math.sin(t * 2 + i) * 2; ell(ctx, ex, ey, 9, 12, r(), `rgba(255,236,190,${0.9 * o.eggs})`); ell(ctx, ex - 2, ey - 3, 3, 4, 0, `rgba(255,255,255,${0.7 * o.eggs})`);
      if (o.glow && o.glow.eggs) ell(ctx, ex, ey, 11, 14, 0, `rgba(200,107,255,${0.45 * o.glow.eggs})`); } }
    // mantle
    const br = 1 + Math.sin(t * 1.8) * 0.03;
    ctx.save(); ctx.scale(1, br);
    ctx.beginPath(); ctx.moveTo(-70, 40); ctx.bezierCurveTo(-110, -40, -80, -175, 0, -180); ctx.bezierCurveTo(80, -175, 110, -40, 70, 40); ctx.closePath(); ctx.fillStyle = skin; ctx.fill();
    ctx.beginPath(); ctx.moveTo(-70, 40); ctx.bezierCurveTo(-110, -40, -80, -175, 0, -180); ctx.bezierCurveTo(-40, -150, -55, -40, -30, 40); ctx.closePath(); ctx.fillStyle = skinD; ctx.fill();
    for (const [rx, ry, rr] of [[-35, -120, 14], [20, -140, 13], [45, -85, 14], [-50, -60, 13], [0, -80, 15], [-10, -30, 12], [40, -25, 12], [-20, -160, 10], [55, -140, 9]]) ringAt(ctx, rx, ry, rr, fl, false);
    if (o.glow && o.glow.skin) { ctx.globalAlpha = o.glow.skin * 0.5; ctx.beginPath(); ctx.moveTo(-70, 40); ctx.bezierCurveTo(-110, -40, -80, -175, 0, -180); ctx.bezierCurveTo(80, -175, 110, -40, 70, 40); ctx.fillStyle = "#c86bff"; ctx.fill(); ctx.globalAlpha = 1; }
    ctx.restore();
    // eyes
    for (const ex of [-38, 38]) { ell(ctx, ex, 22, 20, 17, 0, shade(skin, 0.25)); ell(ctx, ex + (o.look ?? 0) * 4, 24, 12, 8, 0, "#1b1208"); circ(ctx, ex + 5, 19, 3.5, "#ffffff"); }
    // salivary gland glow (bacteria scene)
    if (o.glow && o.glow.gland) { const g = ctx.createRadialGradient(0, 45, 0, 0, 45, 60); g.addColorStop(0, `rgba(160,255,120,${0.8 * o.glow.gland})`); g.addColorStop(1, "rgba(160,255,120,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 45, 60, 0, 6.283); ctx.fill(); }
    arms.filter((A) => A.idx < 2).forEach((A) => drawArm(A, false));
    ctx.restore();
  }
  function ringAt(ctx, x, y, r, fl, back) {
    ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.lineWidth = r * 0.5; ctx.strokeStyle = back ? "rgba(40,24,8,0.55)" : "rgba(40,24,8,0.75)"; ctx.stroke();
    if (fl > 0.02) {
      ctx.save(); ctx.globalAlpha = fl * (back ? 0.75 : 1);
      ctx.shadowColor = RING; ctx.shadowBlur = r * 1.6 * fl;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.lineWidth = r * 0.42; ctx.strokeStyle = RING; ctx.stroke();
      ctx.restore();
    }
  }
  function mixc(a, b, k) {
    const p = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
    const A = p(a), B = p(b); return "#" + A.map((v, i) => Math.round(lerp(v, B[i], k)).toString(16).padStart(2, "0")).join("");
  }
  const flashK = (t, on, off = 1e9, rate = 2.2) => { const k = smooth(on, on + 0.35, t) * (1 - smooth(off, off + 0.4, t)); return k * (0.78 + 0.22 * Math.sin(t * rate * 6.283)); };

  // ---------------- flat human body (paralysis diagrams) ----------------
  // front view, centred at x; zones light up: lips, tongue, arms, legs, chest; numb = grey-blue overlay
  function body(ctx, t, x, y, h, z, o = {}) {
    const sk = "#f2c39b", sh = "#3d7bd6", pa = "#2c3e66";
    const u = h / 100; ctx.save(); ctx.translate(x, y);
    const zone = (k) => clamp(z[k] ?? 0);
    const tint = (base, k) => mixc(base, "#8fa6c4", k * 0.85);
    // legs
    for (const sx of [-1, 1]) { ctx.beginPath(); ctx.roundRect(sx * 9 * u - 5.5 * u, -46 * u, 11 * u, 46 * u, 5 * u); ctx.fillStyle = tint(pa, zone("legs")); ctx.fill(); ell(ctx, sx * 10 * u, -1 * u, 7 * u, 3 * u, 0, "#222a3a"); }
    // arms
    const droop = (o.limp ?? 0) * 0.25;
    for (const sx of [-1, 1]) { ctx.save(); ctx.translate(sx * 17 * u, -78 * u); ctx.rotate(sx * (0.18 - droop)); ctx.beginPath(); ctx.roundRect(-4.5 * u, 0, 9 * u, 38 * u, 4.5 * u); ctx.fillStyle = tint(sh, zone("arms")); ctx.fill(); circ(ctx, 0, 40 * u, 4.6 * u, tint(sk, zone("arms"))); ctx.restore(); }
    // torso
    ctx.beginPath(); ctx.roundRect(-17 * u, -82 * u, 34 * u, 40 * u, 8 * u); ctx.fillStyle = tint(sh, zone("chest") * 0.6); ctx.fill();
    // lungs and diaphragm inside the chest
    if (o.lungs) { const br = o.breath ?? (0.5 + 0.5 * Math.sin(t * 2.2)); for (const sx of [-1, 1]) ell(ctx, sx * 7.5 * u, -66 * u, (5.5 + br * 1.5) * u, (10 + br * 2) * u, 0, `rgba(255,140,150,${0.85 - zone("chest") * 0.4})`);
      line(ctx, [[-14 * u, (-54 + br * 2) * u], [0, (-57 + br * 2) * u], [14 * u, (-54 + br * 2) * u]], 2.2 * u, zone("chest") > 0.5 ? "#7d8ba3" : "#ff5a5a"); }
    // neck and head
    ctx.beginPath(); ctx.roundRect(-4 * u, -88 * u, 8 * u, 8 * u, 2 * u); ctx.fillStyle = tint(sk, zone("lips") * 0.5); ctx.fill();
    circ(ctx, 0, -97 * u, 11 * u, tint(sk, Math.max(zone("lips"), zone("face")) * 0.6));
    ctx.beginPath(); ctx.arc(0, -99 * u, 11.5 * u, Math.PI * 1.02, Math.PI * 1.98); ctx.fillStyle = "#3a2618"; ctx.fill();
    for (const sx of [-1, 1]) circ(ctx, sx * 4 * u, -97 * u, 1.3 * u, "#2a1a12");
    // lips: tingle glow, tongue
    const lp = zone("lips"); ell(ctx, 0, -91 * u, 3.8 * u, 1.4 * u, 0, mixc("#c8504a", "#7f8fb0", lp));
    if (lp > 0.05) { for (let i = 0; i < 6; i++) { const a = i / 6 * 6.283 + t * 3; circ(ctx, Math.cos(a) * 6 * u, -91 * u + Math.sin(a) * 3 * u, 0.9 * u * lp, `rgba(255,230,120,${0.8 * lp})`); } }
    // brain awake glow
    if (o.brain) { const g = ctx.createRadialGradient(0, -100 * u, 0, 0, -100 * u, 14 * u); g.addColorStop(0, `rgba(255,236,140,${0.9 * o.brain})`); g.addColorStop(1, "rgba(255,236,140,0)"); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, -100 * u, 14 * u, 0, 6.283); ctx.fill();
      ell(ctx, 0, -101 * u, 7 * u, 5 * u, 0, `rgba(255,170,190,${o.brain})`); }
    ctx.restore();
  }

  // ---------------- scenes ----------------
  const S = {};
  // the hook: symptoms spread through a body. o.z = keyframes per zone: {lips:[t], tongue:[t], arms:[t], legs:[t], chest:[t]}, brain from o.brain
  S.paralysis = (ctx, t, o) => {
    dark(ctx, { cols: ["#071d33", "#0a2c4a", "#0c3c63"] });
    const z = {}; for (const k of ["lips", "face", "arms", "legs", "chest"]) z[k] = o[k] !== undefined ? smooth(o[k], o[k] + 0.8, t) : 0;
    const limp = o.chest !== undefined ? smooth(o.chest, o.chest + 1.5, t) : 0;
    body(ctx, t, 960, 1000, 860, z, { lungs: true, breath: limp > 0.5 ? 0.1 : undefined, limp, brain: o.brain !== undefined ? smooth(o.brain, o.brain + 0.8, t) : 0 });
    const L = o.labels || {};
    for (const [k, [txt, x, y]] of Object.entries(L)) { const a = o[k] !== undefined ? smooth(o[k], o[k] + 0.4, t) : 0; label(ctx, txt, x, y, 46, "#173a55", a, "center", "#fffdf6"); }
  };
  // Indo-Pacific range map
  const MAP = {
    asia: [[95, 22], [100, 14], [104, 10], [106, 8.5], [109, 12], [108, 16], [107, 21], [111, 21.5], [117, 23.5], [121, 28], [122, 31], [121, 35], [126, 38], [129, 35], [130, 42], [135, 45], [140, 50], [150, 60], [80, 60], [80, 22]],
    malay: [[100, 13], [101, 6], [103, 1.5], [104, 1.3], [103.5, 5], [102, 7], [100.5, 11]],
    sumatra: [[95.3, 5.6], [98, 4], [104, -2], [106, -5.8], [104.5, -5.9], [100, -1], [97, 2]],
    java: [[105.5, -6], [108, -6.8], [111, -6.5], [114.5, -7.6], [114, -8.6], [108, -7.8], [105.5, -6.8]],
    borneo: [[109, 1.5], [110, -2], [114, -3.5], [116.5, -3], [118, 1], [119, 5], [117, 7], [115, 5], [111, 2.5]],
    sulawesi: [[119, 0], [120, -5.5], [121.5, -4], [123, -5], [122, -3], [121, -1], [123, 0.5], [125, 1.5], [120.5, 1]],
    luzon: [[120, 18.5], [122, 18.5], [122, 14], [124, 13], [121.5, 13.5], [120.5, 15]],
    mindanao: [[122, 8], [124, 9], [126.5, 9], [126, 6.5], [124, 6], [122, 7]],
    visayas: [[122, 11.5], [124, 11.8], [125, 11], [123.5, 9.6], [122.2, 10]],
    newguinea: [[131, -1], [135, -3], [138, -1.6], [141, -2.6], [145, -4], [147, -6], [150.5, -10.5], [147, -10], [143, -9], [141, -9], [138, -8], [137, -5], [134, -4], [132, -2.5]],
    australia: [[113.5, -22], [114, -26], [115, -34], [118, -35], [124, -33.8], [129, -31.6], [134, -32.6], [138, -35.5], [140, -38], [144, -38.5], [147, -38.5], [150, -37.5], [153.5, -28], [153, -25], [149, -20.5], [146, -18.5], [145.5, -15], [143.5, -14], [142.5, -10.7], [141.5, -13], [141.5, -17], [139.5, -17.5], [136, -15], [137, -12], [132, -11.2], [130.5, -12.5], [129, -15], [126, -14], [122, -17.5], [121, -19.5], [117, -20.7]],
    tasmania: [[145, -40.8], [148.3, -40.9], [148, -43], [146.5, -43.6], [145.2, -42]],
    honshu: [[130.9, 34], [133, 34.4], [135, 33.5], [137, 34.6], [140, 35], [141, 37], [142, 39.5], [141.5, 41.4], [140, 40.5], [139.5, 38], [137, 37], [135.5, 35.6], [132, 35.3]],
    kyushu: [[129.7, 33.3], [131.8, 33.6], [131.4, 31.4], [130.2, 31.3]],
    shikoku: [[132.4, 33.3], [134.7, 33.8], [134.4, 34.3], [132.7, 33.9]],
    taiwan: [[120.2, 23], [121, 25.2], [121.9, 24.6], [120.8, 22]],
    hainan: [[108.7, 19.2], [110.5, 20], [111, 19], [109.5, 18.2]],
  };
  const PRJ = (lon, lat, v) => [(lon - v.lon0) / (v.lon1 - v.lon0) * W, (v.lat1 - lat) / (v.lat1 - v.lat0) * H];
  S.map = (ctx, t, o) => {
    const v = { lon0: lerp(92, o.zl0 ?? 92, smooth(0, o.zd ?? 1, t)), lon1: 162, lat0: -46, lat1: 40, ...o.view };
    if (o.zoom) { const k = smooth(o.zoom[0], o.zoom[1], t); v.lon0 = lerp(92, o.zoom[2], k); v.lon1 = lerp(162, o.zoom[3], k); v.lat0 = lerp(-46, o.zoom[4], k); v.lat1 = lerp(40, o.zoom[5], k); }
    ctx.fillStyle = vgrad(ctx, 0, H, ["#1a8fd0", "#35aee0"]); ctx.fillRect(0, 0, W, H);
    // range: a glowing coastal band drawn as thick strokes of the coasts in the zone, revealed over time
    const rk = smooth(o.range ?? 1.0, (o.range ?? 1.0) + 2.5, t);
    const land = (pts, col) => { ctx.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = PRJ(lo, la, v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.fillStyle = col; ctx.fill(); };
    const inRange = ["sumatra", "java", "borneo", "sulawesi", "luzon", "mindanao", "visayas", "newguinea", "australia", "kyushu", "shikoku", "taiwan", "malay", "tasmania", "honshu"];
    if (rk > 0) { ctx.save(); ctx.lineJoin = "round"; ctx.lineWidth = 46 * (v.lon1 - v.lon0 < 50 ? 1.6 : 1); ctx.strokeStyle = `rgba(80,230,255,${0.55 * rk})`; ctx.shadowColor = "#5ff0ff"; ctx.shadowBlur = 30;
      for (const k of inRange) { if (k === "honshu") continue; const pts = MAP[k].filter(([lo, la]) => la < 34 - (k === "australia" ? 0 : 0) && la > -44 + (1 - rk) * 0); ctx.beginPath(); MAP[k].forEach(([lo, la], i) => { const [x, y] = PRJ(lo, la, v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.stroke(); } ctx.restore(); }
    for (const [k, pts] of Object.entries(MAP)) land(pts, k === "asia" ? "#7fc48b" : "#8fd29a");
    for (const [k, pts] of Object.entries(MAP)) { ctx.save(); ctx.beginPath(); pts.forEach(([lo, la], i) => { const [x, y] = PRJ(lo, la, v); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.closePath(); ctx.lineWidth = 3; ctx.strokeStyle = "#5aa86b"; ctx.stroke(); ctx.restore(); }
    for (const [txt, lo, la, at, col] of o.pins || []) {
      const a = smooth(at, at + 0.4, t); if (a <= 0) continue; const [x, y] = PRJ(lo, la, v);
      ctx.save(); ctx.globalAlpha = a; circ(ctx, x, y, 12 + 6 * Math.sin(t * 4), "rgba(255,90,80,0.35)"); circ(ctx, x, y, 9, col || "#ff5a4f"); circ(ctx, x, y, 4, "#ffffff"); ctx.restore();
      label(ctx, txt, x + (o.labelDx ?? 0), y - 48, 42, "#173a55", a, "center", "#fffdf6");
    }
    if (o.title) label(ctx, o.title, W / 2, 90, 58, "#ffffff", smooth(0.2, 0.7, t));
  };
  // size: golf ball, octopus, open hand
  S.size = (ctx, t, o) => {
    sea(ctx, t, { sandY: 860 });
    const k1 = smooth(0.2, 0.8, t), k2 = smooth(o.hand ?? 2.6, (o.hand ?? 2.6) + 0.8, t);
    // golf ball
    ctx.save(); ctx.globalAlpha = k1; circ(ctx, 520, 760, 62, "#ffffff"); const r = rng(2); for (let i = 0; i < 40; i++) { const a = r() * 6.283, d = Math.sqrt(r()) * 52; circ(ctx, 520 + Math.cos(a) * d, 760 + Math.sin(a) * d, 4, "#e1e6ec"); } ctx.restore();
    label(ctx, "GOLF BALL", 520, 880, 40, "#173a55", k1, "center", "#fffdf6");
    octo(ctx, t, { x: 1180, y: 770, s: 0.42, flash: 0.15, arm: "walk" });
    label(ctx, "BODY", 1180, 880, 40, "#173a55", k1, "center", "#fffdf6");
    if (k2 > 0) { // open hand outline behind the spread arms
      ctx.save(); ctx.globalAlpha = 0.85 * k2; ctx.translate(1180, 760); ctx.fillStyle = "rgba(255,226,196,0.35)"; ctx.strokeStyle = "#fff4e6"; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.ellipse(0, 40, 130, 150, 0, 0, 6.283); ctx.fill(); ctx.stroke();
      for (const [a, l] of [[-0.95, 170], [-0.35, 230], [0, 250], [0.33, 230], [0.7, 190]]) { ctx.save(); ctx.rotate(a); ctx.beginPath(); ctx.roundRect(-26, -l - 60, 52, l, 26); ctx.fill(); ctx.stroke(); ctx.restore(); }
      ctx.restore(); label(ctx, "ARMS SPREAD: HAND-SIZED", 1180, 330, 44, "#173a55", k2, "center", "#fffdf6");
    }
  };
  // warning: octopus on a rock, calm then rings pulse on
  S.flash = (ctx, t, o) => {
    sea(ctx, t, { cols: ["#0b4f7c", "#126c9b", "#2f94b8"], sandY: 870, sandCol: "#b9a27a" });
    rock(ctx, 960, 900, 900, 220, "#6f7c86", "#8c99a3");
    const f = flashK(t, o.on ?? 1.2, o.off ?? 1e9);
    octo(ctx, t, { x: 960, y: 640, s: 1.05, flash: f, arm: "spread", look: Math.sin(t) });
    if (o.bg) { ctx.fillStyle = `rgba(0,10,25,${0.35 * f})`; }
  };
  // how the rings flash: skin cross-section with mirror cells and muscles
  S.ring = (ctx, t, o) => {
    dark(ctx);
    const relax = o.tight ?? 3, darkT = o.darkT ?? 9;
    const tight = smooth(relax, relax + 0.8, t), dk = smooth(darkT, darkT + 1, t);
    // left: close-up of one ring on skin
    ctx.save(); ctx.beginPath(); ctx.arc(520, 540, 330, 0, 6.283); ctx.clip();
    ctx.fillStyle = mixc("#c9a256", "#3e2a14", dk); ctx.fillRect(190, 210, 660, 660);
    const r0 = 150; ctx.beginPath(); ctx.arc(520, 540, r0, 0, 6.283); ctx.lineWidth = 70; ctx.strokeStyle = "#2b1a0a"; ctx.stroke();
    ctx.save(); ctx.globalAlpha = tight; ctx.shadowColor = RING; ctx.shadowBlur = 50 * tight; ctx.beginPath(); ctx.arc(520, 540, r0, 0, 6.283); ctx.lineWidth = 46 * (0.4 + 0.6 * tight); ctx.strokeStyle = RING; ctx.stroke(); ctx.restore();
    // skin folds covering the ring when relaxed
    ctx.globalAlpha = 1 - tight; ctx.beginPath(); ctx.arc(520, 540, r0, 0, 6.283); ctx.lineWidth = 60; ctx.strokeStyle = mixc("#9a7a3e", "#3e2a14", dk); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.restore();
    ctx.beginPath(); ctx.arc(520, 540, 330, 0, 6.283); ctx.lineWidth = 8; ctx.strokeStyle = "#fffdf6"; ctx.stroke();
    // zoom line to the right panel
    line(ctx, [[640, 400], [1080, 250]], 4, "rgba(255,253,246,0.6)"); line(ctx, [[640, 400], [1080, 830]], 4, "rgba(255,253,246,0.6)");
    // right: section through the ring: muscles squeeze the skin away to expose a stack of mirror plates
    const px = 1080, pw = 760, py = 250, ph = 580;
    ctx.save(); ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 30); ctx.clip();
    ctx.fillStyle = "#123c5e"; ctx.fillRect(px, py, pw, ph);
    const mid = px + pw / 2, open = 60 + 150 * tight;
    // mirror stack
    for (let i = 0; i < 9; i++) { const y = py + 260 + i * 26; ctx.fillStyle = i % 2 ? "#9ad8ff" : "#d9f2ff"; ctx.beginPath(); ctx.roundRect(mid - 120, y, 240, 14, 7); ctx.fill(); }
    // light in and blue light out
    const lk = smooth(o.light ?? 1.0, (o.light ?? 1.0) + 0.6, t);
    for (let i = 0; i < 4; i++) { const x = mid - 90 + i * 60; ctx.globalAlpha = lk; line(ctx, [[x - 80, py + 20], [x, py + 255]], 6, "#fff6c8");
      ctx.globalAlpha = lk * tight; ctx.shadowColor = RING; ctx.shadowBlur = 25; line(ctx, [[x, py + 255], [x + 80, py + 20]], 8, RING); ctx.shadowBlur = 0; ctx.globalAlpha = 1; }
    // skin flaps (pigment) slide over the stack when the muscles relax
    const skinC = mixc("#b08a48", "#3e2a14", dk);
    ctx.fillStyle = skinC; ctx.fillRect(px, py + 200, mid - open - px, 300); ctx.fillRect(mid + open, py + 200, px + pw - mid - open, 300);
    // muscles: red bands either side that bunch up as they tighten
    for (const sx of [-1, 1]) { const mx = mid + sx * (open + 40 + 30 * tight); ctx.fillStyle = "#e0565a"; ctx.beginPath(); ctx.ellipse(mx, py + 350, 34 + 22 * tight, 120 - 30 * tight, 0, 0, 6.283); ctx.fill();
      for (let j = -2; j <= 2; j++) line(ctx, [[mx - 20 - 10 * tight, py + 350 + j * 30], [mx + 20 + 10 * tight, py + 350 + j * 30]], 3, "#b83b40"); }
    ctx.restore();
    ctx.beginPath(); ctx.roundRect(px, py, pw, ph, 30); ctx.lineWidth = 6; ctx.strokeStyle = "#fffdf6"; ctx.stroke();
    label(ctx, "MIRROR CELLS", mid, py + ph + 52, 40, "#173a55", smooth(o.mirror ?? 0.5, (o.mirror ?? 0.5) + 0.4, t), "center", "#fffdf6");
    label(ctx, "MUSCLES", px + 120, py - 40, 40, "#173a55", smooth(o.musc ?? 2.2, (o.musc ?? 2.2) + 0.4, t), "center", "#fffdf6");
    label(ctx, tight > 0.5 ? "TIGHTEN: BLUE SHOWS" : "RELAXED: BLUE HIDDEN", px + pw - 220, py - 40, 36, tight > 0.5 ? "#0b6aa8" : "#173a55", smooth(o.musc ?? 2.2, (o.musc ?? 2.2) + 0.4, t), "center", "#fffdf6");
    if (dk > 0.05) label(ctx, "SKIN DARKENS", 520, 950, 40, "#173a55", dk, "center", "#fffdf6");
  };
  // 1954, Darwin: a man on the rocks, the octopus crawls onto his shoulder and bites
  S.darwin = (ctx, t, o) => {
    // dusk shore
    ctx.fillStyle = vgrad(ctx, 0, 620, ["#f7b267", "#f79d65", "#f4845f"]); ctx.fillRect(0, 0, W, 620);
    circ(ctx, 1500, 430, 90, "#ffe8a3");
    ctx.fillStyle = vgrad(ctx, 600, H, ["#3a86b5", "#205a85"]); ctx.fillRect(0, 600, W, H);
    for (let i = 0; i < 8; i++) line(ctx, [[i * 260 + (t * 20) % 260 - 100, 640 + i % 3 * 30], [i * 260 + (t * 20) % 260 + 40, 640 + i % 3 * 30]], 5, "rgba(255,255,255,0.35)");
    rock(ctx, 760, 1010, 1300, 260, "#6a5446", "#85695a"); rock(ctx, 1560, 1040, 700, 200, "#5d4a3d", "#77604f");
    const man = { x: 820, y: 900, h: 520, skin: "#d9a577", shirt: "#e9f1f7", shirt2: "#cbd8e2", pants: "#4a5d78", shoe: "#3a2a20", hair: "#3b2a1c", hairStyle: "short", look: 0.2 };
    const bite = o.bite ?? 3.5, slump = smooth(bite + (o.slump ?? 4), bite + (o.slump ?? 4) + 1.5, t);
    ctx.save(); ctx.translate(820, 900); ctx.rotate(-slump * 0.25); ctx.translate(-820, -900);
    person(ctx, t, { ...man, reach: smooth(0, 1, t) * (1 - smooth(1.5, 2.2, t)) });
    ctx.restore();
    // octopus path: from the rock up the arm to the shoulder
    const k = smooth(0.6, bite - 0.2, t), ox = lerp(1000, 845, k), oy = lerp(890, 505, k);
    octo(ctx, t, { x: ox, y: oy, s: 0.16, flash: smooth(bite - 0.4, bite, t), arm: "walk", rot: -0.4 * k });
    if (t > bite && t < bite + 0.4) { ctx.fillStyle = `rgba(255,255,255,${0.5 * (1 - (t - bite) / 0.4)})`; ctx.fillRect(0, 0, W, H); }
    if (t > bite) { const a = smooth(bite, bite + 0.3, t) * (1 - smooth(bite + 1.6, bite + 2.2, t)); for (let i = 0; i < 8; i++) { const ang = i / 8 * 6.283; line(ctx, [[850 + Math.cos(ang) * 30, 478 + Math.sin(ang) * 30], [850 + Math.cos(ang) * 52, 478 + Math.sin(ang) * 52]], 6, `rgba(255,255,255,${a})`); } }
    if (o.year) label(ctx, o.year, 300, 120, 64, "#ffffff", smooth(0.1, 0.6, t) * (1 - smooth(4, 4.6, t)));
  };
  // countdown clock: o.to = hours label at end
  S.clock = (ctx, t, o) => {
    dark(ctx);
    const k = smooth(0.4, (o.dur ?? 3) , t), cx = 960, cy = 500, R = 260;
    circ(ctx, cx, cy, R + 18, "#fffdf6"); circ(ctx, cx, cy, R, o.bad ? "#ffe7e2" : "#e6f7ff");
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R - 20, -Math.PI / 2, -Math.PI / 2 + k * 6.283 * (o.turns ?? 1)); ctx.closePath(); ctx.fillStyle = o.bad ? "rgba(230,80,70,0.45)" : "rgba(60,170,230,0.45)"; ctx.fill();
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; line(ctx, [[cx + Math.cos(a) * (R - 30), cy + Math.sin(a) * (R - 30)], [cx + Math.cos(a) * (R - 8), cy + Math.sin(a) * (R - 8)]], 8, "#173a55"); }
    const ha = -Math.PI / 2 + k * 6.283 * (o.turns ?? 1); line(ctx, [[cx, cy], [cx + Math.cos(ha) * (R - 60), cy + Math.sin(ha) * (R - 60)]], 16, "#173a55"); circ(ctx, cx, cy, 18, "#173a55");
    label(ctx, o.text || "", cx, 870, 72, "#ffffff", smooth(0.6, 1.1, t));
  };
  // tetrodotoxin vs cyanide, then 20 people
  S.toxin = (ctx, t, o) => {
    dark(ctx);
    const k = smooth(0.3, 1.6, t);
    const bar = (x, hgt, col, txt, sub) => { ctx.fillStyle = "rgba(255,255,255,0.08)"; ctx.beginPath(); ctx.roundRect(x - 110, 200, 220, 640, 20); ctx.fill(); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - 110, 840 - hgt * k, 220, hgt * k, 20); ctx.fill(); label(ctx, txt, x, 900, 50, "#ffffff", 1); label(ctx, sub, x, 960, 34, "#bfe3f5", k); };
    if (o.people === undefined || t < o.people) {
      bar(660, 60, "#9aa9b8", "CYANIDE", "strong poison");
      bar(1260, 620, "#c86bff", "TETRODOTOXIN", "much stronger");
      label(ctx, "HOW TOXIC (RELATIVE)", 960, 120, 52, "#ffffff", smooth(0, 0.5, t));
    } else {
      const tt = t - o.people;
      label(ctx, "ENOUGH TO KILL MORE THAN 20 ADULTS", 960, 130, 54, "#ffffff", smooth(0, 0.5, tt));
      for (let i = 0; i < 20; i++) { const a = smooth(0.3 + i * 0.08, 0.6 + i * 0.08, tt), x = 300 + (i % 10) * 147, y = 470 + Math.floor(i / 10) * 330;
        ctx.save(); ctx.globalAlpha = a; circ(ctx, x, y - 120, 32, "#fffdf6"); ctx.beginPath(); ctx.roundRect(x - 45, y - 82, 90, 150, 30); ctx.fillStyle = "#fffdf6"; ctx.fill(); ctx.restore(); }
      octo(ctx, tt, { x: 960, y: 980, s: 0.28, flash: 0.9, arm: "walk" });
    }
  };
  // bacteria in the salivary glands make the toxin
  S.bacteria = (ctx, t, o) => {
    sea(ctx, t, { cols: ["#0b4f7c", "#126c9b", "#2f94b8"], sand: false });
    const zk = smooth(o.zoom ?? 1.2, (o.zoom ?? 1.2) + 1.0, t);
    octo(ctx, t, { x: 560, y: 600, s: 1.0, flash: 0.2, arm: "spread", glow: { gland: zk } });
    if (zk > 0) {
      line(ctx, [[560, 650], [1150, 300]], 4, `rgba(255,253,246,${zk * 0.7})`); line(ctx, [[560, 650], [1150, 900]], 4, `rgba(255,253,246,${zk * 0.7})`);
      ctx.save(); ctx.globalAlpha = zk; ctx.beginPath(); ctx.arc(1420, 600, 300, 0, 6.283); ctx.clip(); ctx.fillStyle = "#3b7a4e"; ctx.fillRect(1100, 280, 650, 650);
      const r = rng(8); for (let i = 0; i < 40; i++) { const bx = 1180 + r() * 480, by = 360 + r() * 480, a = r() * 6.283 + Math.sin(t * 2 + i) * 0.3; ctx.save(); ctx.translate(bx + Math.sin(t + i) * 6, by + Math.cos(t * 1.3 + i) * 6); ctx.rotate(a); ctx.beginPath(); ctx.roundRect(-22, -8, 44, 16, 8); ctx.fillStyle = "#a6f26b"; ctx.fill(); ctx.restore(); }
      // toxin particles streaming out
      const tk = smooth(o.toxin ?? 3, (o.toxin ?? 3) + 1, t);
      for (let i = 0; i < 50; i++) { const u = ((t * 0.3 + i / 50) % 1); circ(ctx, 1420 + Math.cos(i * 2.4) * u * 280, 600 + Math.sin(i * 2.4) * u * 280, 6, `rgba(200,107,255,${tk * (1 - u)})`); }
      ctx.restore(); ctx.beginPath(); ctx.arc(1420, 600, 300, 0, 6.283); ctx.lineWidth = 8; ctx.strokeStyle = `rgba(255,253,246,${zk})`; ctx.stroke();
      label(ctx, "BACTERIA", 1420, 960, 46, "#173a55", zk, "center", "#fffdf6");
    }
    if (o.home) { label(ctx, "THEY GET A HOME", 560, 160, 48, "#173a55", smooth(o.home, o.home + 0.4, t), "center", "#fffdf6"); label(ctx, "IT GETS A WEAPON", 560, 250, 48, "#173a55", smooth(o.weapon, o.weapon + 0.4, t), "center", "#fffdf6"); }
  };
  // toxin all through the body: arms, skin, eggs light up in turn
  S.everywhere = (ctx, t, o) => {
    sea(ctx, t, { cols: ["#0b4f7c", "#126c9b", "#2f94b8"], sandY: 930 });
    const ga = smooth(o.arms, o.arms + 0.5, t), gs = smooth(o.skin, o.skin + 0.5, t), ge = smooth(o.eggs, o.eggs + 0.5, t);
    octo(ctx, t, { x: 960, y: 560, s: 1.1, flash: 0.3, arm: "spread", eggs: ge, glow: { arms: ga, skin: gs, eggs: ge } });
    label(ctx, "ARMS", 380, 760, 46, "#173a55", ga, "center", "#fffdf6"); label(ctx, "SKIN", 960, 220, 46, "#173a55", gs, "center", "#fffdf6"); label(ctx, "EGGS", 1520, 820, 46, "#173a55", ge, "center", "#fffdf6");
  };
  // sodium gates in a nerve; tetrodotoxin plugs them and the signal stops
  S.nerve = (ctx, t, o) => {
    dark(ctx, { cols: ["#0a1f35", "#10304f", "#143e66"] });
    const block = o.block ?? 99, stop = smooth(block + 0.4, block + 1.2, t);
    const y0 = 420, y1 = 660;
    // membrane: two lipid rows with gates every 260 px
    for (const y of [y0, y1]) for (let x = 0; x < W; x += 26) { circ(ctx, x, y, 11, "#ffcf8a"); line(ctx, [[x, y + (y === y0 ? 10 : -10)], [x, y + (y === y0 ? 40 : -40)]], 4, "#ffcf8a"); }
    const gates = []; for (let g = 0; g < 6; g++) gates.push(160 + g * 320);
    for (const gx of gates) { for (const y of [y0, y1]) { ctx.fillStyle = "#4fd1a5"; ctx.beginPath(); ctx.roundRect(gx - 40, y - 34, 26, 68, 10); ctx.roundRect(gx + 14, y - 34, 26, 68, 10); ctx.fill(); } }
    // sodium ions flowing in through open gates (top), fewer when blocked
    for (let i = 0; i < 70; i++) { const gx = gates[i % 6], u = ((t * 0.6 + i * 0.137) % 1), x = gx + Math.sin(i) * 8;
      const yy = u < 0.5 ? lerp(160, y0, u * 2) : lerp(y0, y0 + 110, (u - 0.5) * 2); const a = u < 0.5 ? 1 : 1 - stop;
      if (u > 0.5 && stop > 0.95) continue;
      circ(ctx, x + (u < 0.5 ? Math.cos(i) * 60 * (1 - u * 2) : 0), u < 0.5 ? yy : yy, 13, `rgba(255,230,90,${a})`); ctx.font = font(14); ctx.fillStyle = `rgba(80,60,0,${a})`; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText("Na+", x + (u < 0.5 ? Math.cos(i) * 60 * (1 - u * 2) : 0), yy); }
    // tetrodotoxin plugs drop into the gates
    if (t > block) for (const [n, gx] of gates.entries()) { const k = eo((t - block - n * 0.12) / 0.5); const y = lerp(120, y0 - 6, k); ctx.fillStyle = "#c86bff"; ctx.beginPath(); ctx.roundRect(gx - 16, y - 22, 32, 44, 12); ctx.fill(); }
    // the electrical signal travelling along the axon
    const sx = ((t * 520) % (W + 400)) - 200, ok = 1 - stop;
    const g = ctx.createRadialGradient(sx, (y0 + y1) / 2, 0, sx, (y0 + y1) / 2, 140); g.addColorStop(0, `rgba(120,230,255,${0.9 * ok})`); g.addColorStop(1, "rgba(120,230,255,0)"); ctx.fillStyle = g; ctx.fillRect(sx - 160, y0 + 30, 320, y1 - y0 - 60);
    label(ctx, "SODIUM GATES", 960, 90, 54, "#ffffff", smooth(0.2, 0.7, t));
    label(ctx, "NERVE SIGNAL", 300, (y0 + y1) / 2, 40, "#173a55", smooth(0.8, 1.2, t) * ok, "center", "#fffdf6");
    if (t > block) label(ctx, "TETRODOTOXIN BLOCKS THE GATES", 960, 940, 50, "#ffffff", smooth(block + 0.3, block + 0.8, t));
  };
  // brain stays awake while the body is switched off
  S.aware = (ctx, t, o) => {
    dark(ctx);
    body(ctx, t, 960, 1010, 880, { lips: 1, face: 1, arms: 1, legs: 1, chest: 1 }, { lungs: true, breath: 0.1, limp: 1, brain: smooth(0.4, 1.2, t) * (0.85 + 0.15 * Math.sin(t * 3)) });
    label(ctx, "AWARE", 960, 140, 58, "#173a55", smooth(1, 1.5, t), "center", "#ffe98c");
  };
  // keep them breathing: chest rising with a breathing bag, a clock running to 24 h, the nerves coming back
  S.recover = (ctx, t, o) => {
    dark(ctx);
    const rec = smooth(o.rec ?? 4, (o.rec ?? 4) + 3, t);
    const br = 0.5 + 0.5 * Math.sin(t * 2.4);
    body(ctx, t, 620, 1010, 820, { lips: 1 - rec, face: 1 - rec, arms: 1 - rec, legs: 1 - rec, chest: 1 - rec }, { lungs: true, breath: br, limp: 1 - rec });
    // bag valve
    const bx = 620, by = 1010 - 820 * 0.93; ctx.save(); ctx.translate(bx + 120, by - 10); ctx.rotate(-0.4); ell(ctx, 0, 0, 70 - br * 18, 44 - br * 10, 0, "#3b4a5e"); ctx.restore();
    // clock
    const cx = 1420, cy = 470, R = 220, k = smooth(0.5, o.dur ?? 9, t);
    circ(ctx, cx, cy, R + 14, "#fffdf6"); circ(ctx, cx, cy, R, "#e6f7ff");
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, R - 16, -Math.PI / 2, -Math.PI / 2 + k * 6.283); ctx.closePath(); ctx.fillStyle = "rgba(60,170,230,0.45)"; ctx.fill();
    const ha = -Math.PI / 2 + k * 6.283 * 2; line(ctx, [[cx, cy], [cx + Math.cos(ha) * (R - 50), cy + Math.sin(ha) * (R - 50)]], 12, "#173a55"); circ(ctx, cx, cy, 14, "#173a55");
    label(ctx, "OFTEN WITHIN A DAY", cx, cy + R + 80, 48, "#ffffff", smooth(1, 1.5, t));
    label(ctx, "KEEP THEM BREATHING", 620, 100, 52, "#173a55", smooth(0.2, 0.6, t), "center", "#fffdf6");
  };
  // the hunt: crab walks, octopus pounces, wraps, bites; crab stops
  S.hunt = (ctx, t, o) => {
    sea(ctx, t, { cols: ["#0d4468", "#145d88", "#2b7ea6"], sandY: 860, sandCol: "#bfa57a", rays: 0.1 });
    rock(ctx, 420, 900, 700, 260, "#59656f", "#74818b");
    const pounce = o.pounce ?? 1.5, bite = o.bite ?? 3.0;
    const stopK = smooth(bite + 0.2, bite + 1.2, t);
    // crab
    const cxp = lerp(1500, 1180, smooth(0, pounce, t)), cyp = 880;
    ctx.save(); ctx.translate(cxp, cyp);
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) { const a = sx * (0.5 + i * 0.25) + Math.sin(t * 9 + i) * 0.15 * (1 - stopK); line(ctx, [[sx * 40, -10], [sx * 40 + Math.sin(a) * 70 * sx, -10 + 30 + i * 8], [sx * 40 + Math.sin(a) * 110 * sx, 30 + i * 10]], 9, "#d8572a"); }
    ell(ctx, 0, -30, 80, 52, 0, "#e86a33"); ell(ctx, -15, -45, 40, 20, 0, "#f59060");
    for (const sx of [-1, 1]) { line(ctx, [[sx * 50, -50], [sx * 95, -95]], 12, "#d8572a"); ell(ctx, sx * 108, -110, 26, 18, sx * 0.5, "#e86a33"); circ(ctx, sx * 22, -84, 8, "#2a1a10"); }
    ctx.restore();
    // octopus: hides on the rock, then leaps and wraps the crab
    const k = smooth(pounce, pounce + 0.6, t);
    octo(ctx, t, { x: lerp(560, cxp, k), y: lerp(760, cyp - 120, k) - Math.sin(Math.PI * k) * 160, s: 0.75, flash: smooth(pounce - 0.3, pounce, t) * 0.9, arm: k > 0.6 ? "wrap" : "walk", wrapX: cxp, wrapY: cyp, wrapK: smooth(pounce + 0.4, pounce + 0.9, t) });
    if (t > bite && t < bite + 0.35) { ctx.fillStyle = `rgba(255,255,255,${0.45 * (1 - (t - bite) / 0.35)})`; ctx.fillRect(0, 0, W, H); }
    if (stopK > 0.3) label(ctx, "PARALYSED", cxp, 640, 46, "#173a55", stopK, "center", "#fffdf6");
  };
  // three hearts and blue (copper) blood
  S.hearts = (ctx, t, o) => {
    sea(ctx, t, { cols: ["#0b4f7c", "#126c9b", "#2f94b8"], sand: false });
    octo(ctx, t, { x: 700, y: 640, s: 1.45, flash: 0.15, arm: "tuck" });
    const beat = (ph) => 1 + 0.18 * Math.max(0, Math.sin(t * 7 + ph)) ** 4;
    const hk = smooth(0.3, 0.8, t);
    const heart = (x, y, s, col, a) => { ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.scale(s, s); ctx.beginPath(); ctx.moveTo(0, 18); ctx.bezierCurveTo(-40, -10, -22, -42, 0, -22); ctx.bezierCurveTo(22, -42, 40, -10, 0, 18); ctx.fillStyle = col; ctx.fill(); ctx.restore(); };
    heart(700 - 95, 470, 1.4 * beat(0), "#ff5a6e", hk); heart(700 + 95, 470, 1.4 * beat(0.4), "#ff5a6e", hk); heart(700, 400, 2.0 * beat(1.2), "#ff2f50", smooth(o.third ?? 2.5, (o.third ?? 2.5) + 0.4, t));
    label(ctx, "GILL HEART", 380, 330, 40, "#173a55", hk, "center", "#fffdf6"); label(ctx, "GILL HEART", 1020, 330, 40, "#173a55", hk, "center", "#fffdf6");
    label(ctx, "BODY HEART", 700, 200, 44, "#173a55", smooth(o.third ?? 2.5, (o.third ?? 2.5) + 0.4, t), "center", "#fffdf6");
    // blue blood: copper vs iron
    const bk = smooth(o.blood ?? 6, (o.blood ?? 6) + 0.6, t);
    if (bk > 0) { for (let i = 0; i < 3; i++) { const u = (t * 0.4 + i / 3) % 1; circ(ctx, 1380 + Math.cos(u * 6.283) * 160, 560 + Math.sin(u * 6.283) * 160, 26, `rgba(70,140,255,${bk})`); }
      ctx.save(); ctx.globalAlpha = bk; circ(ctx, 1380, 560, 110, "#d98a4b"); ctx.font = font(96); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fffdf6"; ctx.fillText("Cu", 1380, 566); ctx.restore();
      label(ctx, "COPPER, NOT IRON: BLUE BLOOD", 1380, 820, 42, "#173a55", bk, "center", "#fffdf6"); }
  };
  // neurons: most of them in the arms
  S.neurons = (ctx, t, o) => {
    dark(ctx, { cols: ["#071a2e", "#0b2a47", "#0e3a60"] });
    octo(ctx, t, { x: 960, y: 520, s: 1.35, flash: 0.0, dark: 0.6, arm: "spread" });
    const r = rng(12), k = smooth(0.3, 1.2, t);
    for (let i = 0; i < 260; i++) { const brain = i < 80; let x, y; if (brain) { x = 960 + (r() - 0.5) * 120; y = 470 + (r() - 0.5) * 90; } else { const a = r() * 6.283, d = 160 + r() * 260; x = 960 + Math.sin(a) * d * 1.1; y = 600 + Math.abs(Math.cos(a)) * d * 0.9; }
      const fl = 0.5 + 0.5 * Math.sin(t * (3 + r() * 4) + i); circ(ctx, x, y, 5 + fl * 3, `rgba(255,236,120,${k * (0.4 + 0.6 * fl)})`); }
    label(ctx, "BRAIN", 960, 260, 44, "#173a55", k, "center", "#fffdf6");
    label(ctx, "MOST NEURONS: IN THE ARMS", 960, 990, 50, "#ffffff", smooth(o.arms ?? 2, (o.arms ?? 2) + 0.5, t));
  };
  // a mother carrying her eggs; later the hatchlings drift away
  S.eggs = (ctx, t, o) => {
    sea(ctx, t, { cols: ["#0f5a8a", "#1a7fb0", "#47a9cf"], sandY: 880 });
    for (const x of [200, 1700]) coral(ctx, t, x, 900, 1.2, "#ff8a7a", "#e0605a", x);
    const hatch = o.hatch ?? 99, hk = smooth(hatch, hatch + 1.5, t);
    octo(ctx, t, { x: 960, y: 540 + Math.sin(t * 0.8) * 10, s: 1.15, flash: 0.15, arm: "tuck", eggs: 1 - hk });
    if (hk > 0) { const r = rng(21); for (let i = 0; i < 30; i++) { const u = clamp((t - hatch) / 6 + r() * 0.1), a = r() * 6.283; octo(ctx, t + i, { x: 960 + Math.cos(a) * u * (300 + r() * 500), y: 650 - u * 380 * r() + Math.sin(a) * u * 200, s: 0.06, flash: 0.6, arm: "walk" }); } }
    if (o.count !== undefined) label(ctx, "50 TO 100 EGGS", 960, 140, 56, "#173a55", smooth(o.count, o.count + 0.4, t), "center", "#fffdf6");
  };
  // end card
  S.end = (ctx, t, o) => {
    sea(ctx, t, { cols: ["#0f5a8a", "#1a7fb0", "#47a9cf"], sandY: 900 });
    octo(ctx, t, { x: 1500, y: 700, s: 0.6, flash: flashK(t, 0.6), arm: "walk" });
    ctx.save(); ctx.globalAlpha = smooth(0.2, 0.8, t); ctx.font = font(150); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillStyle = "#0d5f96"; ctx.fillText("UNSEEN BY EYE", 860, 470 + 11); ctx.fillStyle = "#ffffff"; ctx.fillText("UNSEEN BY EYE", 860, 470); ctx.restore();
    const b = smooth(0.9, 1.4, t); ctx.save(); ctx.globalAlpha = b; ctx.fillStyle = "#b8342b"; ctx.beginPath(); ctx.roundRect(660, 640 + 10, 400, 110, 55); ctx.fill(); ctx.fillStyle = "#ff5b4f"; ctx.beginPath(); ctx.roundRect(660, 640, 400, 110, 55); ctx.fill();
    ctx.font = font(62); ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillStyle = "#fff"; ctx.fillText("SUBSCRIBE", 860, 697); ctx.restore();
  };
  // generic: one flat octopus on the reef (camouflage, hiding) with rings at a set level
  S.reefocto = (ctx, t, o) => {
    sea(ctx, t, { cols: ["#0f5a8a", "#1a7fb0", "#47a9cf"], sandY: 860, sandCol: o.sand || "#d9c08c" });
    for (const [x, c] of [[260, "#ff8a7a"], [1650, "#ffb25b"]]) coral(ctx, t, x, 880, 1.1, c, shade(c, -0.2), x);
    rock(ctx, 1100, 900, 620, 220, "#7a6a55", "#958268");
    octo(ctx, t, { x: lerp(o.x0 ?? 1000, o.x1 ?? 1000, smooth(0, o.d ?? 4, t)), y: 720, s: 0.8, flash: o.flash ?? 0.08, dark: 0, arm: "walk" });
  };

  return { S, octo, body, label };
})();
// entry used by the build: PZ-style call OC.S[name](ctx, t, opts)
const SC2 = new Proxy({}, { get: (_, k) => (ctx, t, o) => { ctx.save(); OC.S[k](ctx, t, o || {}); ctx.restore(); } });
