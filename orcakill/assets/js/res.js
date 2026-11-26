// Scenes for "Orcas Kill These Animals and Never Eat Them" (Southern Residents and porpoises), flat cartoon style.
// Adds porpoises, Chinook salmon and a cat to the rig, then new scenes to FL.RAW; FL.wrapScenes() at the end gives them the documentary camera.
(() => {
  const { W, H, clamp, lerp, smooth, rng, trace, fill, vgrad, ell, circ, line, band, rays, bubbles, cloud, gull, kelp, fish, person, orca, orcaPt, K, P, actors, water, sky, sea, snow, screen, topOrca, shade } = FL;
  const TAU = Math.PI * 2, RAW = FL.RAW;
  const pt = (c) => (o, bx, by = 0) => { const k = (o.len ?? 600) / 1000, dir = o.dir ?? 1, a = o.ang ?? 0; const lx = -dir * k * (bx - c), ly = k * by * (o.roll ? Math.cos(o.roll) : 1); return [o.x + lx * Math.cos(a) - ly * Math.sin(a), o.y + lx * Math.sin(a) + ly * Math.cos(a)]; };

  // ---------- porpoises and dolphins (side view, facing left in 1000 units) ----------
  const PB = "M 0 34 C 0 -40 70 -104 200 -116 C 360 -128 520 -102 650 -62 C 740 -36 800 -20 850 -12 L 880 -16 C 920 -62 970 -92 1012 -88 C 992 -52 966 -20 950 0 C 966 20 992 52 1012 88 C 970 92 920 62 880 16 L 850 12 C 780 32 680 82 540 106 C 400 126 220 122 110 102 C 40 88 0 66 0 34 Z";
  const BEAK = "M 40 10 C 0 0 -90 6 -120 22 C -90 40 -20 50 40 50 Z";
  function porpoise(ctx, t, o) {
    const kind = o.kind || "harbor", k = (o.len ?? 300) / 1000, dir = o.dir ?? 1, ph = (o.ph ?? 0) + t * TAU * (o.beat ?? 0) , amp = o.amp ?? 0.04;
    const wv = (x, y) => { const u = clamp(x / 1000, 0, 1.05); return [x, y + amp * 1000 * Math.sin(ph - u * 4.4) * u * u]; };
    const C = { harbor: ["#5f6f7c", "#47555f", "#d6dee3"], dall: ["#1d232c", "#12171d", "#f3f6f8"], bottlenose: ["#8193a1", "#6a7c8a", "#e3e9ed"] }[kind];
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.ang ?? 0); ctx.scale(-dir * k, k * (o.roll ? Math.cos(o.roll) : 1)); ctx.translate(-480, 0);
    const fin = kind === "harbor" ? "M 410 -116 L 512 -226 L 596 -98 Z" : (kind === "dall" ? "M 420 -116 C 470 -170 520 -220 560 -232 C 560 -180 580 -130 620 -92 Z" : "M 400 -116 C 460 -180 520 -250 580 -266 C 560 -200 580 -140 640 -86 Z");
    ctx.save(); ctx.translate(24, -6); fill(ctx, "M 170 70 C 180 112 210 142 252 148 C 258 118 242 88 224 70 Z", C[1], wv); ctx.restore();
    if (kind === "bottlenose") fill(ctx, BEAK, C[0], wv);
    fill(ctx, fin, C[0], wv); fill(ctx, PB, C[0], wv);
    ctx.save(); trace(ctx, PB, wv); ctx.clip();
    ctx.save(); ctx.translate(-6, 16); fill(ctx, PB, C[1], wv); ctx.restore();
    if (kind === "dall") fill(ctx, "M 300 40 C 360 -20 470 -40 600 -20 C 660 0 680 40 640 80 C 520 110 380 110 300 90 Z", C[2], wv);
    else fill(ctx, "M -10 40 C 120 80 300 96 480 90 C 640 80 760 46 860 14 L 860 220 L -20 220 Z", C[2], wv);
    ctx.restore();
    if (kind === "dall") { fill(ctx, "M 520 -200 C 540 -215 555 -228 560 -232 C 560 -212 562 -200 566 -190 Z", "#e9eef1", wv); }
    { const [ex, ey] = wv(kind === "bottlenose" ? 100 : 90, -24); circ(ctx, ex, ey, 10, "#0b0f14"); circ(ctx, ex - 3, ey - 3, 3, "#fff"); }
    trace(ctx, kind === "bottlenose" ? "M -110 24 Q -40 34 40 28" : "M 10 40 Q 50 52 96 46", wv); ctx.lineWidth = 5; ctx.strokeStyle = "rgba(10,14,20,0.6)"; ctx.lineCap = "round"; ctx.stroke();
    fill(ctx, "M 170 70 C 180 112 210 142 252 148 C 258 118 242 88 224 70 Z", C[1], wv);
    ctx.restore();
  }
  // ---------- Chinook salmon ----------
  function salmon(ctx, t, o) {
    const k = (o.len ?? 200) / 1000, dir = o.dir ?? 1, ph = (o.ph ?? 0) + t * TAU * (o.beat ?? 0);
    const wv = (x, y) => { const u = clamp(x / 1000, 0, 1.05); return [x, y + 60 * Math.sin(ph - u * 5) * u * u * (o.amp ?? 1)]; };
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.ang ?? 0); ctx.scale(-dir * k, k * (o.roll ? Math.cos(o.roll) : 1)); ctx.translate(-480, 0);
    const body = "M 0 10 C 30 -70 160 -130 330 -134 C 520 -138 690 -90 820 -36 L 870 -30 L 1000 -130 C 980 -60 960 -20 950 0 C 960 20 980 60 1000 130 L 870 30 L 820 36 C 690 90 520 130 330 128 C 160 126 30 80 0 10 Z";
    fill(ctx, body, o.dead ? "#8796a0" : "#4f7d78", wv);
    ctx.save(); trace(ctx, body, wv); ctx.clip();
    fill(ctx, "M -20 20 C 200 50 500 60 900 10 L 900 200 L -20 200 Z", o.dead ? "#c9ced2" : "#e8eef2", wv);
    fill(ctx, "M 120 -6 C 300 30 600 40 860 -4 C 600 40 300 44 120 -6 Z", "rgba(240,130,150,0.75)", wv);
    const r = rng(3); for (let i = 0; i < 26; i++) { const p = wv(250 + r() * 600, -110 + r() * 80); circ(ctx, p[0], p[1], 8 + r() * 6, "rgba(20,30,40,0.55)"); }
    ctx.restore();
    fill(ctx, "M 390 -130 C 420 -176 460 -192 500 -188 L 492 -124 Z", "#3f6662", wv); fill(ctx, "M 720 -76 C 730 -96 748 -104 760 -100 L 756 -70 Z", "#3f6662", wv);
    fill(ctx, "M 330 110 C 360 170 400 190 440 186 L 420 120 Z", "#9fb3c0", wv);
    { const [ex, ey] = wv(90, -30); circ(ctx, ex, ey, 16, "#eef3f6"); circ(ctx, ex, ey, o.dead ? 4 : 9, "#0b0f14"); if (o.dead) { line(ctx, [[ex - 10, ey - 10], [ex + 10, ey + 10]], 4, "#0b0f14"); line(ctx, [[ex + 10, ey - 10], [ex - 10, ey + 10]], 4, "#0b0f14"); } }
    trace(ctx, "M 10 20 Q 70 44 150 30", wv); ctx.lineWidth = 7; ctx.strokeStyle = "#2b3b47"; ctx.stroke();
    ctx.restore();
  }
  FL.porpoise = porpoise; FL.salmon = salmon;
  const calfDraw = (ctx, t, o) => orca(ctx, t, { ...o, calf: true });
  Object.assign(FL.DRAW, { porpoise, salmon, calf: calfDraw });
  Object.assign(FL.PT, { porpoise: pt(480), salmon: pt(480), calf: orcaPt });
  Object.assign(FL.CEN, { porpoise: 480, salmon: 480, calf: 460 });

  // ---------- the Salish Sea above water: misty layered islands with conifers, a snowy volcano ----------
  function salishBack(ctx, t, hz, o = {}) {
    const S = o.sky || "pnw";
    const skies = { pnw: ["#9cc5d8", "#c7dde6", "#e6eef1"], dusk: ["#6f7fa8", "#c99a9e", "#f2c99a"], grey: ["#9aabb5", "#c3cdd2", "#dfe5e8"], sun: ["#7cc8ea", "#b8e3f3", "#e3f5fb"] };
    ctx.fillStyle = vgrad(ctx, 0, hz, skies[S] || skies.pnw); ctx.fillRect(-300, -300, W + 600, hz + 300);
    if (o.clouds !== false) for (let i = 0; i < 4; i++) cloud(ctx, ((i * 620 + t * 7) % 2500) - 250, 110 + (i % 2) * 70, 1.3 + (i % 3) * 0.3, "rgba(255,255,255,0.75)");
    // snowy volcano (Mount Baker) far behind
    const mx = o.mountX ?? 1350;
    fill(ctx, `M ${mx - 520} ${hz} L ${mx - 60} ${hz - 300} C ${mx - 20} ${hz - 326} ${mx + 20} ${hz - 326} ${mx + 60} ${hz - 300} L ${mx + 560} ${hz} Z`, S === "dusk" ? "#8e86a6" : "#a9bccb");
    fill(ctx, `M ${mx - 140} ${hz - 214} L ${mx - 60} ${hz - 300} C ${mx - 20} ${hz - 326} ${mx + 20} ${hz - 326} ${mx + 60} ${hz - 300} L ${mx + 150} ${hz - 206} L ${mx + 90} ${hz - 226} L ${mx + 40} ${hz - 196} L ${mx - 10} ${hz - 230} L ${mx - 70} ${hz - 196} Z`, "#f4f7f9");
    // island ridges, each with a fringe of conifers
    const ridge = (y, amp, seed, col, treeCol, scale) => {
      ctx.beginPath(); ctx.moveTo(-300, hz + 2);
      const r = rng(seed), pts = [];
      for (let x = -300; x <= W + 300; x += 40) { const yy = y - amp * (0.5 + 0.5 * Math.sin(x * 0.004 + seed) * Math.sin(x * 0.0013 + seed * 2)); pts.push([x, yy]); ctx.lineTo(x, yy); }
      ctx.lineTo(W + 300, hz + 2); ctx.closePath(); ctx.fillStyle = col; ctx.fill();
      for (const [x, yy] of pts) { if (yy > hz - 6) continue; for (let j = 0; j < 2; j++) { const tx = x + r() * 40, th = (18 + r() * 22) * scale; fill(ctx, `M ${tx - th * 0.32} ${yy + 6} L ${tx} ${yy - th} L ${tx + th * 0.32} ${yy + 6} Z`, treeCol); } }
    };
    ridge(hz - 30, 70, 2, "#8fa9a6", "#7f9a97", 0.8);
    ridge(hz - 10, 90, 5, "#5f8079", "#4f7069", 1.0);
    if (o.near !== false) ridge(hz + 2, 60, 9, "#3d5f55", "#2f4f46", 1.25);
    ctx.fillStyle = "rgba(230,240,244,0.35)"; ctx.fillRect(-300, hz - 40, W + 600, 40);   // haze at the waterline
  }
  FL.salishBack = salishBack;

  // Split-level view: above the surface (Salish islands, boats) and below it (orcas, porpoises), at once.
  RAW.split = (ctx, t, o) => {
    const wl = o.wl ?? 470;
    salishBack(ctx, t, wl, o);
    ctx.fillStyle = vgrad(ctx, wl, H, ["#3f9db4", "#22708b", "#0f3f57"]); ctx.fillRect(-300, wl, W + 600, H - wl + 300);
    rays(ctx, t, 5, 300, 320, -200, 0.12, H); snow(ctx, t, 40, 6);
    // whale-watching boat or sailboat above
    if (o.boat) {
      const b = o.boat, bx = b.x + (b.vx || 0) * t, by = wl + Math.sin(t * 1.2) * 4, bs = b.s ?? 0.7;
      ctx.save(); ctx.translate(bx, by - 8); ctx.rotate(Math.sin(t) * 0.015); ctx.scale(bs * (b.dir || 1), bs);
      ctx.fillStyle = "#e9eef1"; ctx.fillRect(-250, -220, 360, 104); ctx.fillStyle = "#cfd8de"; ctx.fillRect(40, -220, 70, 104); ctx.fillStyle = "#e0573f"; ctx.fillRect(-262, -236, 384, 18);
      for (let i = 0; i < 5; i++) { ctx.fillStyle = "#33505f"; ctx.fillRect(-232 + i * 58, -196, 42, 32); }
      const pt_ = b.point !== undefined ? smooth(b.point, b.point + 0.5, t) : 0, bn = b.binoc !== undefined ? smooth(b.binoc, b.binoc + 0.6, t) : 0;
      [["#f2c39b", "#ff6b6b", "#3b2416", "short"], ["#d9a074", "#ffd166", "#22140c", "long"], ["#a86d45", "#5fb3e6", "#1c120c", "short"], ["#f1c7a0", "#9b6ade", "#5a3a22", "long"]].forEach(([sk, sh, hr, hs], i) =>
        person(ctx, t, { x: -320 + i * 76, y: -104, h: 118, skin: sk, shirt: sh, hair: hr, hairStyle: hs, pants: "#3b4a63", skirt: hs === "long" ? "#3b4a63" : undefined, shoe: "#222", w: 0, ph: i * 1.7, point: i % 2 ? pt_ : 0, binoc: i % 2 ? 0 : bn, look: 0.1 }));
      fill(ctx, "M -420 -110 L 330 -100 C 350 -70 340 -30 300 10 L -340 14 C -390 -20 -415 -70 -420 -110 Z", "#f5f7f9");
      fill(ctx, "M -420 -110 L 330 -100 L 332 -84 L -414 -92 Z", "#e0573f");
      fill(ctx, "M -372 -20 L 322 -26 C 316 -10 308 0 300 10 L -340 14 C -354 4 -364 -8 -372 -20 Z", "#1f4f7a");
      ctx.restore();
    }
    if (o.sail) {   // a sailboat with keel and rudder below the surface; the rudder can be knocked off
      const s = o.sail, bx = s.x + (s.vx || 0) * t, by = wl, k = s.s ?? 1, snap = s.snap !== undefined ? smooth(s.snap, s.snap + 0.4, t) : 0;
      ctx.save(); ctx.translate(bx, by + Math.sin(t * 1.1) * 4); ctx.scale(k, k);
      fill(ctx, "M -40 -40 L -40 -420 L 160 -60 Z", "#f6f2e8"); fill(ctx, "M -60 -50 L -60 -340 L -220 -60 Z", "#e8e2d4"); line(ctx, [[-50, -30], [-50, -440]], 8, "#8a8f94");
      fill(ctx, "M -300 -40 L 280 -40 C 270 0 240 20 200 26 L -240 26 C -280 10 -296 -14 -300 -40 Z", "#ffffff"); fill(ctx, "M -296 -22 L 276 -22 L 270 -10 L -290 -10 Z", "#2f8fb8");
      fill(ctx, "M -40 26 L 40 26 L 20 200 L -20 200 Z", "#3d4a55");
      ctx.save(); ctx.translate(180 + snap * 60, 26 + snap * 160); ctx.rotate(snap * 1.2); fill(ctx, "M -14 0 L 14 0 L 18 130 L -10 130 Z", "#c94a3d"); ctx.restore();
      ctx.restore();
    }
    const P_ = actors(ctx, t, o.actors || [], "#22708b");
    // tint the parts below the surface, then draw the bright waterline and foam
    ctx.save(); ctx.globalAlpha = 0.18; ctx.fillStyle = "#1c6f8c"; ctx.fillRect(-300, wl + 6, W + 600, H - wl + 300); ctx.restore();
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.beginPath(); ctx.moveTo(-300, wl - 3);
    for (let x = -300; x <= W + 300; x += 20) ctx.lineTo(x, wl + Math.sin(x * 0.02 + t * 2) * 3 - 3);
    for (let x = W + 300; x >= -300; x -= 20) ctx.lineTo(x, wl + Math.sin(x * 0.02 + t * 2) * 3 + 5);
    ctx.closePath(); ctx.fill();
    // splashes where actors break the surface
    for (const [i, p] of Object.entries(P_)) { if (Math.abs(p.y - wl) < p.len * 0.12) { const r = rng(+i + 3); for (let j = 0; j < 6; j++) { const a = (t * 1.2 + j / 6 + r()) % 1; circ(ctx, p.x + (r() - 0.5) * p.len * 0.6, wl - a * 40, 6 * (1 - a), `rgba(255,255,255,${0.8 * (1 - a)})`); } } }
    if (o.blow) for (const [t0, i] of o.blow) { const p = P_[i]; if (!p) continue; const u = (t - t0) / 1.4; if (u < 0 || u > 1) continue; const [bx, by] = orcaPt(p, 200, -120); const r = rng(Math.floor(t0 * 7)); for (let j = 0; j < 14; j++) { const a = -Math.PI / 2 + (r() - 0.5) * 0.7, d = u * (90 + r() * 90); circ(ctx, bx + Math.cos(a) * d, Math.min(wl, by) + Math.sin(a) * d * 1.5, (9 + r() * 9) * (1 - u * 0.5), `rgba(255,255,255,${0.85 * (1 - u)})`); } }
    for (let i = 0; i < (o.gulls ?? 2); i++) { const r = rng(70 + i); gull(ctx, t, ((r() * 1800 + t * 40) % 2200) - 150, 120 + r() * 160, 0.7, i); }
  };

  // A flat, stylised map of the Salish Sea: islands and channels, labels drawn as HTML; an optional travelling route.
  RAW.salish = (ctx, t, o) => {
    ctx.fillStyle = "#5cc4e6"; ctx.fillRect(-300, -300, W + 600, H + 600);
    const r0 = rng(4); for (let i = 0; i < 60; i++) { const x = ((r0() * 2300 + t * 6) % 2300) - 180, y = r0() * H; line(ctx, [[x, y], [x + 22, y - 4], [x + 44, y]], 3, "rgba(255,255,255,0.22)"); }
    // land pieces: forest green with a sand rim, a soft shadow, and conifers dotted inside
    const lands = [];
    const L = (d) => { const p2 = new Path2D(d); lands.push(p2); ctx.save(); ctx.translate(7, 10); ctx.fillStyle = "rgba(0,70,100,0.22)"; ctx.fill(p2); ctx.restore(); ctx.fillStyle = "#9ccc84"; ctx.fill(p2); ctx.lineWidth = 16; ctx.strokeStyle = "#f2d9a2"; ctx.stroke(p2); ctx.lineWidth = 3; ctx.strokeStyle = "#d4ae68"; ctx.stroke(p2); };
    L("M -300 -300 L 2220 -300 L 2220 120 C 1980 160 1820 90 1640 150 C 1500 196 1420 120 1300 150 C 1180 180 1120 250 1060 230 C 980 200 900 120 760 110 C 620 100 520 40 380 -20 L -300 -300 Z");
    L("M 2220 120 C 2100 200 2060 320 2080 460 C 2100 600 2000 720 2040 860 C 2070 960 2140 1040 2220 1100 L 2220 1400 L 1500 1400 C 1560 1300 1600 1180 1540 1080 C 1480 980 1560 900 1640 860 C 1720 820 1760 700 1740 600 C 1720 500 1840 420 1900 330 C 1960 240 2080 180 2220 120 Z");
    L("M -300 1400 L 1200 1400 C 1180 1300 1100 1240 1000 1210 C 860 1170 700 1180 560 1120 C 420 1060 360 960 260 900 L -300 900 Z");
    L("M -300 -100 C -100 -60 60 40 200 160 C 340 280 400 420 440 560 C 480 700 420 820 300 880 C 160 950 -80 900 -300 860 Z");
    for (const [x, y, rx, ry] of [[1040, 520, 120, 80], [1220, 470, 90, 60], [1160, 620, 110, 70], [960, 680, 70, 46], [1320, 600, 60, 40], [1100, 400, 50, 34], [880, 560, 44, 30]])
      L(`M ${x - rx} ${y} C ${x - rx} ${y - ry} ${x + rx * 0.4} ${y - ry * 1.2} ${x + rx} ${y - ry * 0.2} C ${x + rx * 1.1} ${y + ry * 0.7} ${x - rx * 0.2} ${y + ry * 1.1} ${x - rx} ${y} Z`);
    { const r = rng(17); for (let i = 0; i < 520; i++) { const x = -100 + r() * 2120, y = -100 + r() * 1280; if (!lands.some((p2) => ctx.isPointInPath(p2, x, y))) continue; if (lands.some((p2) => ctx.isPointInStroke && false)) continue; const h = 14 + r() * 12; fill(ctx, `M ${x - h * 0.4} ${y} L ${x} ${y - h} L ${x + h * 0.4} ${y} Z`, r() < 0.5 ? "#5f9a5c" : "#6fae68"); } }
    // mountain icons on the mainland, city dots and names
    for (const [x, y] of [[1980, 560], [1900, 980], [180, 520]]) { fill(ctx, `M ${x - 70} ${y} L ${x} ${y - 90} L ${x + 70} ${y} Z`, "#8aa3b0"); fill(ctx, `M ${x - 24} ${y - 60} L ${x} ${y - 90} L ${x + 24} ${y - 60} L ${x + 10} ${y - 54} L ${x - 8} ${y - 62} Z`, "#ffffff"); }
    ctx.font = "700 40px Fredoka, sans-serif"; ctx.textAlign = "center";
    const lab = (txt, x, y, col = "#2f5a3a") => { ctx.fillStyle = "rgba(255,255,255,0.75)"; ctx.fillText(txt, x + 2, y + 3); ctx.fillStyle = col; ctx.fillText(txt, x, y); };
    if (o.labels !== false) { lab("BRITISH COLUMBIA", 1000, 110); lab("WASHINGTON", 1780, 1180); lab("VANCOUVER ISLAND", 210, 620); ctx.font = "600 30px Fredoka, sans-serif"; lab("SAN JUAN ISLANDS", 1100, 790, "#1f5f7a");
      for (const [nm, x, y] of [["Vancouver", 1500, 175], ["Victoria", 470, 780], ["Seattle", 1700, 1000]]) { circ(ctx, x, y, 11, "#ff5b4f"); circ(ctx, x, y, 5, "#fff"); ctx.font = "600 30px Fredoka, sans-serif"; lab(nm, x, y - 22, "#173a55"); } }
    ctx.textAlign = "start";
    // the route (a mother carrying her calf: 17 days, ~1,600 km)
    if (o.route !== undefined) {
      const pts = [[1180, 700], [900, 760], [700, 600], [560, 380], [420, 200], [650, 300], [900, 420], [1140, 560], [1420, 740], [1600, 600], [1300, 520], [1000, 800], [820, 960], [1100, 900], [1260, 760]];
      const u = smooth(o.route, o.route + (o.routeDur ?? 6), t), n = (pts.length - 1) * u;
      ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i <= Math.floor(n); i++) ctx.lineTo(pts[i][0], pts[i][1]);
      const j = Math.floor(n), f = n - j; let hx = pts[0][0], hy = pts[0][1]; if (j < pts.length - 1) { hx = lerp(pts[j][0], pts[j + 1][0], f); hy = lerp(pts[j][1], pts[j + 1][1], f); ctx.lineTo(hx, hy); } else { hx = pts[pts.length - 1][0]; hy = pts[pts.length - 1][1]; }
      ctx.setLineDash([18, 12]); ctx.lineWidth = 8; ctx.strokeStyle = "#ff6b5b"; ctx.stroke(); ctx.setLineDash([]);
      topOrca(ctx, t, hx, hy, 90, 0, 0);
      screen(ctx, () => { ctx.fillStyle = "rgba(10,40,60,0.78)"; ctx.beginPath(); ctx.roundRect(60, 60, 380, 120, 24); ctx.fill(); ctx.font = "600 32px Fredoka, sans-serif"; ctx.fillStyle = "#bfe9f7"; ctx.fillText("DAY", 90, 106); ctx.font = "700 60px Fredoka, sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText(String(Math.max(1, Math.ceil(u * 17))), 90, 162); });
    }
    for (const [x, y, tt] of o.pins || []) { if (t < tt) continue; const u = clamp((t - tt) / 0.5), dr = (1 - u) * -100; ctx.save(); ctx.translate(x, y + dr); fill(ctx, "M 0 0 C -14 -24 -34 -44 -34 -66 C -34 -90 -18 -104 0 -104 C 18 -104 34 -90 34 -66 C 34 -44 14 -24 0 0 Z", "#ff5b4f"); circ(ctx, 0, -68, 13, "#fff"); ctx.restore(); }
    if (o.pods) for (const [t0, x0, y0, vx, vy, n] of o.pods) { const u = t - t0; if (u < 0) continue; for (let i = 0; i < n; i++) topOrca(ctx, t, x0 + vx * u + (i % 3) * 50, y0 + vy * u + Math.floor(i / 3) * 40 + (i % 2) * 20, 70, Math.atan2(vy, vx), i); }
  };

  // Records: one dot per incident along 1962-2020; red dots are deaths; a counter of porpoises eaten stays at zero.
  RAW.records = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#2b9fd6", "#176fae", "#0c477c"]); ctx.fillRect(-300, -300, W + 600, H + 600); snow(ctx, t, 30, 8);
    const x0 = 200, x1 = 1720, y0 = 640, Y = (yr) => x0 + (x1 - x0) * (yr - 1962) / (2020 - 1962);
    line(ctx, [[x0, y0], [x1, y0]], 6, "rgba(255,255,255,0.85)");
    ctx.font = "700 40px Fredoka, sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center";
    for (const yr of [1962, 1980, 2000, 2020]) { line(ctx, [[Y(yr), y0 - 14], [Y(yr), y0 + 14]], 5, "#fff"); ctx.fillText(String(yr), Y(yr), y0 + 64); }
    ctx.textAlign = "start";
    const r = rng(11), yrs = []; for (let i = 0; i < 78; i++) { const k = r(); yrs.push(1962 + Math.floor(k < 0.15 ? k * 120 : 1990 + (k - 0.15) / 0.85 * 30 - 1962)); }
    yrs.sort((a, b) => a - b); const count = {}; const dead = new Set(); const rr = rng(5); while (dead.size < 28) dead.add(Math.floor(rr() * 78));
    const shown = Math.floor(smooth(o.t0 ?? 0.5, (o.t0 ?? 0.5) + (o.dur ?? 4), t) * 78); let nd = 0;
    yrs.forEach((yr, i) => { if (i >= shown) return; const c = (count[yr] = (count[yr] || 0) + 1); const red = o.red !== undefined && t > o.red && dead.has(i); if (red) nd++; circ(ctx, Y(yr), y0 - 30 - c * 30, 12, red ? "#ff6b5b" : "#fffdf6"); });
    screen(ctx, () => {
      const box = (x, lab, val, col) => { ctx.fillStyle = "rgba(10,40,60,0.75)"; ctx.beginPath(); ctx.roundRect(x, 760, 420, 150, 26); ctx.fill(); ctx.font = "600 32px Fredoka, sans-serif"; ctx.fillStyle = "#bfe9f7"; ctx.fillText(lab, x + 30, 806); ctx.font = "700 72px Fredoka, sans-serif"; ctx.fillStyle = col; ctx.fillText(String(val), x + 30, 884); };
      box(260, "INCIDENTS", shown, "#ffffff"); if (o.red !== undefined && t > o.red) box(750, "PORPOISES DIED", nd, "#ff8a7a"); if (o.eaten !== undefined && t > o.eaten) box(1240, "PORPOISES EATEN", 0, "#ffd166");
    });
  };

  // The three pods: J, K and L, each a family of top-down orcas with a count.
  RAW.pods = (ctx, t, o) => {
    ctx.fillStyle = "#3aaedb"; ctx.fillRect(-300, -300, W + 600, H + 600);
    const r0 = rng(3); for (let i = 0; i < 60; i++) { const x = ((r0() * 2300 + t * 10) % 2300) - 180, y = r0() * H; line(ctx, [[x, y], [x + 22, y - 4], [x + 44, y]], 3, "rgba(255,255,255,0.22)"); }
    const pods = o.counts || [["J", 25, 360], ["K", 15, 960], ["L", 36, 1560]];
    pods.forEach(([nm, n, cx], pi) => {
      const a = smooth(0.3 + pi * 0.5, 0.9 + pi * 0.5, t);
      ctx.save(); ctx.globalAlpha = a;
      ctx.fillStyle = "rgba(255,253,246,0.18)"; ctx.beginPath(); ctx.roundRect(cx - 260, 230, 520, 640, 40); ctx.fill();
      const shown = Math.floor(n * a);
      ctx.font = "700 76px Fredoka, sans-serif"; ctx.fillStyle = "#fffdf6"; ctx.textAlign = "center"; ctx.fillText(nm + " POD", cx, 320); ctx.font = "700 56px Fredoka, sans-serif"; ctx.fillStyle = "#ffd166"; ctx.fillText(String(shown), cx, 840); ctx.textAlign = "start";
      for (let i = 0; i < shown; i++) { const col = i % 4, row = Math.floor(i / 4); topOrca(ctx, t, cx - 165 + col * 110 + Math.sin(t + i) * 4, 380 + row * 46 + Math.cos(t * 0.8 + i) * 3, 96, 0, i); }
      ctx.restore();
    });
    if (o.k14 !== undefined && t > o.k14) { const a = smooth(o.k14, o.k14 + 0.5, t); ctx.save(); ctx.globalAlpha = a; ctx.lineWidth = 10; ctx.strokeStyle = "#ffd166"; ctx.beginPath(); ctx.roundRect(960 - 270, 220, 540, 660, 44); ctx.stroke(); ctx.restore(); }
  };

  // Diet: a donut, 80% Chinook, with a big salmon.
  RAW.diet = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#2b9fd6", "#176fae", "#0c477c"]); ctx.fillRect(-300, -300, W + 600, H + 600); snow(ctx, t, 30, 8);
    const cx = 620, cy = 560, R = 300, u = smooth(o.t0 ?? 0.5, (o.t0 ?? 0.5) + 1.6, t);
    ctx.lineWidth = 120; ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
    ctx.strokeStyle = "#ff8a6b"; ctx.lineCap = "butt"; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * 0.8 * u); ctx.stroke();
    ctx.font = "700 130px Fredoka, sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center"; ctx.fillText(Math.round(80 * u) + "%", cx, cy + 46); ctx.textAlign = "start";
    salmon(ctx, t, { x: 1380, y: 560, len: 720, dir: -1, beat: 0.9, amp: 0.6 });
  };

  // The river: salmon swim upstream; then a dam, fishing boats and a town arrive, and the run thins out.
  RAW.river = (ctx, t, o) => {
    sky(ctx, "day", 380); salishBack(ctx, t, 380, { clouds: true, near: false, mountX: 1500 });
    // land and river
    fill(ctx, "M -300 380 L 2220 380 L 2220 1400 L -300 1400 Z", "#79b06a");
    fill(ctx, "M 860 380 C 900 520 760 640 820 780 C 880 920 700 1000 640 1400 L 1240 1400 C 1180 1100 1340 940 1240 780 C 1160 650 1040 540 980 380 Z", "#4fb3d6");
    fill(ctx, "M 900 380 C 930 500 820 640 870 780 C 920 900 790 1000 760 1400 L 900 1400 C 920 1080 1060 930 980 780 C 920 660 960 520 940 380 Z", "rgba(255,255,255,0.18)");
    const dam = o.dam !== undefined ? smooth(o.dam, o.dam + 0.8, t) : 0, town = o.town !== undefined ? smooth(o.town, o.town + 1.2, t) : 0, boats = o.boats !== undefined ? smooth(o.boats, o.boats + 0.8, t) : 0;
    // salmon heading upstream; fewer once the dam and town arrive
    const n = Math.round(lerp(18, 4, Math.max(dam, town * 0.8)));
    for (let i = 0; i < n; i++) { const r = rng(30 + i), u = ((t * 0.08 + r()) % 1), y = lerp(1180, 420, u), x = 1000 + Math.sin(u * 6 + r() * 3) * 90 - u * 60; if (dam > 0.5 && y < 640) continue; salmon(ctx, t, { x, y, len: 70, dir: 1, ang: -Math.PI / 2 - 0.2, beat: 2.2, ph: i }); }
    if (dam > 0) { ctx.save(); ctx.globalAlpha = dam; ctx.fillStyle = "#b9c1c6"; ctx.fillRect(760, 600, 560, 70); ctx.fillStyle = "#8f989e"; ctx.fillRect(760, 600, 560, 16); for (let i = 0; i < 5; i++) { ctx.fillStyle = "#e7f6fb"; ctx.fillRect(820 + i * 100, 670, 40, 60 + Math.sin(t * 6 + i) * 8); } ctx.restore(); }
    if (town > 0) { ctx.save(); ctx.globalAlpha = town; const r = rng(4); for (let i = 0; i < 14; i++) { const x = (i % 2 ? 300 : 1400) + (r() - 0.5) * 360, y = 720 + r() * 360, w = 80 + r() * 60, h = 60 + r() * 50; ctx.fillStyle = ["#e9d7b9", "#d9b8a0", "#cfd9e0"][i % 3]; ctx.fillRect(x, y - h, w, h); fill(ctx, `M ${x - 10} ${y - h} L ${x + w / 2} ${y - h - 40} L ${x + w + 10} ${y - h} Z`, "#b5533f"); ctx.fillStyle = "#4b6b80"; ctx.fillRect(x + w * 0.35, y - h * 0.6, w * 0.25, h * 0.3); } ctx.restore(); }
    if (boats > 0) { ctx.save(); ctx.globalAlpha = boats; for (let i = 0; i < 2; i++) { const x = 200 + i * 1300 + Math.sin(t * 0.6 + i) * 20, y = 420; fill(ctx, `M ${x - 90} ${y} L ${x + 90} ${y} L ${x + 70} ${y + 30} L ${x - 70} ${y + 30} Z`, "#f4f6f8"); ctx.fillStyle = "#e0573f"; ctx.fillRect(x - 30, y - 34, 50, 34); line(ctx, [[x + 40, y - 10], [x + 160, y + 80]], 3, "#59636d"); } ctx.restore(); }
  };

  // A simple falling line chart (o.pts are 0..1 values), drawn in at o.t0.
  RAW.line = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#2b9fd6", "#176fae", "#0c477c"]); ctx.fillRect(-300, -300, W + 600, H + 600); snow(ctx, t, 30, 2);
    const x0 = 260, x1 = 1660, y0 = 820, y1 = 260, pts = o.pts || [0.9, 0.95, 0.8, 0.7, 0.62, 0.55, 0.4, 0.42, 0.33, 0.3], u = smooth(o.t0 ?? 0.4, (o.t0 ?? 0.4) + 2.4, t);
    line(ctx, [[x0, y1 - 20], [x0, y0], [x1 + 30, y0]], 6, "rgba(255,255,255,0.85)");
    ctx.font = "700 40px Fredoka, sans-serif"; ctx.fillStyle = "#fff"; ctx.textAlign = "center"; (o.labels || ["1980", "2000", "2020"]).forEach((lb, i, a) => ctx.fillText(lb, lerp(x0, x1, i / (a.length - 1)), y0 + 60)); ctx.textAlign = "start";
    const P2 = pts.map((v, i) => [lerp(x0, x1, i / (pts.length - 1)), lerp(y0, y1, v)]);
    const n = (P2.length - 1) * u, j = Math.floor(n); const draw = P2.slice(0, j + 1); if (j < P2.length - 1) draw.push([lerp(P2[j][0], P2[j + 1][0], n - j), lerp(P2[j][1], P2[j + 1][1], n - j)]);
    line(ctx, draw, 12, o.col || "#ff8a6b"); const hd = draw[draw.length - 1]; circ(ctx, hd[0], hd[1], 16, "#fff");
    if (o.icon === "salmon") salmon(ctx, t, { x: hd[0] + 10, y: hd[1] - 70, len: 170, dir: -1, beat: 1 });
  };

  // Peanut head: a healthy orca and a thin one, side by side, with a measuring line on the neck.
  RAW.peanut = (ctx, t, o) => {
    water(ctx, t, { tone: "blue" });
    const thinK = smooth(o.t0 ?? 0.6, (o.t0 ?? 0.6) + 2, t);
    orca(ctx, t, { x: 960, y: o.single ? 560 : 360, len: 1100, dir: 1, beat: 0.45, amp: 0.03 });
    if (!o.single) orca(ctx, t, { x: 960, y: 800, len: 1100, dir: 1, beat: 0.4, amp: 0.03, thin: thinK, ph: 2 });
    if (t > (o.t0 ?? 0.6) + 1) { const a = smooth((o.t0 ?? 0.6) + 1, (o.t0 ?? 0.6) + 1.6, t); ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([14, 10]); ctx.lineWidth = 5; ctx.strokeStyle = "#ffd166"; ctx.beginPath(); ctx.arc(960 + 470 * 1.1 - 255 * 1.1 + 40, 800 - 120, 80, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); ctx.setLineDash([]); ctx.restore(); }
  };

  // Drone over a surfacing orca (top-down), with calipers measuring its width.
  RAW.dronemeasure = (ctx, t, o) => {
    ctx.fillStyle = vgrad(ctx, 0, H, ["#2a8fae", "#1e7a99", "#166886"]); ctx.fillRect(-300, -300, W + 600, H + 600);
    const r = rng(6); for (let i = 0; i < 80; i++) { const x = ((r() * 2400 + t * 12) % 2400) - 240, y = r() * H, w = 30 + r() * 50; line(ctx, [[x, y], [x + w / 2, y - 4], [x + w, y]], 3, "rgba(255,255,255,0.18)"); }
    const x = 900 + t * 18, y = 560;
    topOrca(ctx, t, x, y, 760, 0, 0);
    if (o.thin) { ctx.save(); ctx.globalCompositeOperation = "source-atop"; ctx.restore(); }
    const k = smooth(0.6, 1.4, t);
    screen(ctx, () => {
      ctx.strokeStyle = "rgba(255,255,255,0.9)"; ctx.lineWidth = 6;
      for (const [cx, cy, dx, dy] of [[80, 80, 1, 1], [W - 80, 80, -1, 1], [80, H - 80, 1, -1], [W - 80, H - 80, -1, -1]]) { ctx.beginPath(); ctx.moveTo(cx, cy + dy * 90); ctx.lineTo(cx, cy); ctx.lineTo(cx + dx * 90, cy); ctx.stroke(); }
      if (Math.floor(t * 1.5) % 2 === 0) circ(ctx, 150, 140, 16, "#ff4b3e"); ctx.font = "700 40px Fredoka, sans-serif"; ctx.fillStyle = "#fff"; ctx.fillText("REC", 180, 154); ctx.fillText("ALT 40 M", W - 340, 154);
    });
    // calipers across the head, the neck and the body
    for (const [bx, wd, lab] of [[300, 112, "HEAD"], [440, 116, "NECK"], [560, 124, "BODY"]]) {
      const px = x + (bx - 500) * 0.76 * -1 + 0, half = wd * 0.76 * k;
      ctx.save(); ctx.globalAlpha = k; line(ctx, [[px, y - half], [px, y + half]], 5, "#ffd166"); line(ctx, [[px - 16, y - half], [px + 16, y - half]], 5, "#ffd166"); line(ctx, [[px - 16, y + half], [px + 16, y + half]], 5, "#ffd166"); ctx.restore();
    }
  };

  // Ten calves; most fade to grey (pregnancies that fail).
  RAW.calves = (ctx, t, o) => {
    water(ctx, t, { tone: "dark" });
    const n = o.n ?? 10, lost = o.lost ?? 7;
    for (let i = 0; i < n; i++) {
      const x = 260 + (i % 5) * 350, y = 380 + Math.floor(i / 5) * 320, fade = i < lost ? smooth((o.t0 ?? 1) + i * 0.25, (o.t0 ?? 1) + i * 0.25 + 0.6, t) : 0;
      ctx.save(); ctx.globalAlpha = 1 - fade * 0.75; orca(ctx, t, { x, y: y + Math.sin(t + i) * 8, len: 260, dir: 1, beat: 0.8, calf: true, ph: i }); ctx.restore();
    }
  };

  // Two menus for two kinds of orca.
  RAW.menus = (ctx, t, o) => {
    water(ctx, t, { tone: "blue" });
    const card = (x, title, items, a, orcaY) => {
      ctx.save(); ctx.globalAlpha = a; ctx.translate(0, (1 - a) * 40);
      ctx.fillStyle = "#fffdf6"; ctx.beginPath(); ctx.roundRect(x - 330, 200, 660, 760, 30); ctx.fill();
      ctx.fillStyle = "#173a55"; ctx.font = "700 72px Fredoka, sans-serif"; ctx.textAlign = "center"; ctx.fillText(title, x, 300);
      line(ctx, [[x - 240, 330], [x + 240, 330]], 4, "#173a55");
      items.forEach(([nm, draw], i) => { ctx.fillStyle = "#173a55"; ctx.font = "600 50px Fredoka, sans-serif"; ctx.fillText(nm, x + 70, 430 + i * 130); draw(x - 180, 412 + i * 130); });
      ctx.textAlign = "start"; ctx.restore();
    };
    card(500, "RESIDENTS", [["CHINOOK", (x, y) => salmon(ctx, t, { x, y, len: 150, dir: -1, beat: 1 })], ["CHINOOK", (x, y) => salmon(ctx, t, { x, y, len: 150, dir: -1, beat: 1, ph: 1 })], ["MORE CHINOOK", (x, y) => salmon(ctx, t, { x, y, len: 150, dir: -1, beat: 1, ph: 2 })], ["", () => {}]], smooth(o.t1 ?? 0.3, (o.t1 ?? 0.3) + 0.6, t));
    card(1420, "BIGG'S", [["SEALS", (x, y) => FL.seal(ctx, t, { x, y, len: 150, dir: 1, beat: 1 })], ["SEA LIONS", (x, y) => FL.seal(ctx, t, { x, y, len: 170, dir: 1, beat: 1.2 })], ["PORPOISES", (x, y) => porpoise(ctx, t, { x, y, len: 160, dir: -1, beat: 1 })], ["", () => {}]], smooth(o.t2 ?? 1.2, (o.t2 ?? 1.2) + 0.6, t));
  };

  // Kitchen: someone eating a salmon dinner, the neighbour's cat watching. A cat is not on the menu.
  RAW.kitchen = (ctx, t, o) => {
    ctx.fillStyle = "#f6e7cf"; ctx.fillRect(-300, -300, W + 600, H + 600);
    ctx.fillStyle = "#e9d3b0"; ctx.fillRect(-300, 760, W + 600, 600);
    // window with a sea view
    ctx.fillStyle = "#fffdf6"; ctx.fillRect(1180, 160, 560, 380); ctx.save(); ctx.beginPath(); ctx.rect(1200, 180, 520, 340); ctx.clip(); salishBack(ctx, t, 420, { clouds: true, near: false, mountX: 1500 }); ctx.fillStyle = "#4fb3d6"; ctx.fillRect(1200, 420, 520, 120); ctx.restore(); line(ctx, [[1460, 180], [1460, 520]], 10, "#fffdf6");
    // table
    ctx.fillStyle = "#b07a4c"; ctx.fillRect(420, 640, 760, 36); ctx.fillRect(460, 676, 30, 260); ctx.fillRect(1110, 676, 30, 260);
    ell(ctx, 800, 632, 150, 22, 0, "#ffffff"); salmon(ctx, 0, { x: 800, y: 612, len: 200, dir: -1, dead: true, amp: 0 });
    person(ctx, t, { x: 560, y: 940, h: 420, skin: "#e9b98f", hair: "#3a2416", hairStyle: "short", shirt: "#3a8fd6", pants: "#5b5f6a", shoe: "#3a2a20", w: 0, look: 0.15 });
    // cat on the floor looking up
    const cx = 1240, cy = 930, tail = Math.sin(t * 2) * 0.4;
    ctx.save(); ctx.translate(cx, cy);
    ctx.save(); ctx.translate(60, -10); ctx.rotate(tail); line(ctx, [[0, 0], [60, -40], [80, -110]], 18, "#e8913e"); ctx.restore();
    fill(ctx, "M -60 0 C -70 -90 -20 -150 20 -150 C 70 -150 90 -80 80 0 Z", "#e8913e");
    circ(ctx, 0, -180, 56, "#e8913e"); fill(ctx, "M -46 -214 L -40 -270 L -8 -228 Z", "#e8913e"); fill(ctx, "M 46 -214 L 40 -270 L 8 -228 Z", "#e8913e");
    circ(ctx, -20, -186, 9, "#2b1a10"); circ(ctx, 20, -186, 9, "#2b1a10"); fill(ctx, "M -8 -166 L 8 -166 L 0 -156 Z", "#ff8fa0");
    for (const s of [-1, 1]) for (let i = 0; i < 3; i++) line(ctx, [[s * 14, -160], [s * 70, -170 + i * 12]], 3, "rgba(80,50,30,0.6)");
    for (let i = 0; i < 3; i++) line(ctx, [[-40 + i * 10, -120 + i * 30], [-10 + i * 10, -120 + i * 30]], 6, "#c9732a");
    ctx.restore();
  };

  // The salmon hat: an orca at the surface balancing a dead salmon on its head; o.copies = number of others who copy it.
  RAW.hat = (ctx, t, o) => {
    const wl = 560; salishBack(ctx, t, wl, { sky: o.sky || "sun" });
    ctx.fillStyle = vgrad(ctx, wl, H, ["#3f9db4", "#22708b", "#0f3f57"]); ctx.fillRect(-300, wl, W + 600, H - wl + 300);
    const list = [{ x: 960, len: 900, ph: 0 }, { x: 420, len: 640, ph: 1.4, t0: 1.2 }, { x: 1500, len: 620, ph: 2.8, t0: 2.2 }].slice(0, 1 + (o.copies ?? 0));
    for (const w of list) {
      if (t < (w.t0 ?? 0)) continue;
      const up = Math.sin(t * 0.7 + w.ph) * 0.5 + 0.5, x = w.x + Math.sin(t * 0.3 + w.ph) * 30, y = wl + w.len * 0.04 - up * w.len * 0.05;
      const oo = { x, y, len: w.len, dir: 1, ang: -0.12, beat: 0.2, amp: 0.01, ph: w.ph };
      ctx.save(); ctx.beginPath(); ctx.rect(-300, -300, W + 600, wl + 300); ctx.clip(); orca(ctx, t, oo); const hp = orcaPt(oo, 120, -150); salmon(ctx, t, { x: hp[0], y: hp[1] - w.len * 0.01, len: w.len * 0.36, dir: 1, ang: -0.12 + Math.sin(t * 1.5 + w.ph) * 0.05, dead: true, amp: 0 }); ctx.restore();
      ell(ctx, x, wl + 4, w.len * 0.45, 10, 0, "rgba(255,255,255,0.75)");
    }
    ctx.fillStyle = "rgba(255,255,255,0.85)"; ctx.fillRect(-300, wl - 2, W + 600, 5);
    for (let i = 0; i < 2; i++) gull(ctx, t, ((i * 900 + t * 40) % 2200) - 150, 160 + i * 60, 0.8, i);
  };

  // A young porpoise beside an adult Chinook salmon: the same size.
  RAW.samesize = (ctx, t, o) => {
    water(ctx, t, { tone: "blue" });
    const b = smooth(1.4, 2.2, t), m = smooth(2.6, 3.8, t);
    porpoise(ctx, t, { x: lerp(560, 960, m), y: 380, len: 760, dir: 1, beat: 0.8, ph: 0 });
    ctx.save(); ctx.globalAlpha = b; salmon(ctx, t, { x: lerp(1360, 960, m), y: 720, len: 760, dir: 1, beat: 1.4 }); ctx.restore();
    if (m > 0.9) { const k = smooth(3.6, 4.2, t); ctx.save(); ctx.globalAlpha = k; ctx.setLineDash([16, 12]); for (const x of [960 - 380, 960 + 380]) line(ctx, [[x, 220], [x, 880]], 6, "#ffd166"); ctx.setLineDash([]); ctx.restore(); }
  };

  // Outline morph: a newborn orca calf's silhouette becomes a porpoise's.
  RAW.morph = (ctx, t, o) => {
    water(ctx, t, { tone: "dark" });
    const m = smooth(o.t0 ?? 1.2, (o.t0 ?? 1.2) + 1.6, t);
    ctx.save(); ctx.globalAlpha = 1 - m; orca(ctx, t, { x: 960, y: 560, len: 900, dir: 1, beat: 0.4, calf: true }); ctx.restore();
    ctx.save(); ctx.globalAlpha = m; porpoise(ctx, t, { x: 960, y: 560, len: 900, dir: 1, beat: 0.4, ph: 0 }); ctx.restore();
  };

  // Four whales, five incidents each; three of them female.
  RAW.four = (ctx, t, o) => {
    water(ctx, t, { tone: "blue" });
    for (let i = 0; i < 4; i++) {
      const a = smooth(0.3 + i * 0.4, 0.8 + i * 0.4, t), x = 300 + i * 440, y = 520;
      ctx.save(); ctx.globalAlpha = a; orca(ctx, t, { x, y: y + Math.sin(t + i) * 10, len: 380, dir: 1, beat: 0.6, ph: i });
      ctx.fillStyle = "#fffdf6"; ctx.beginPath(); ctx.roundRect(x - 80, 700, 160, 90, 45); ctx.fill(); ctx.font = "700 56px Fredoka, sans-serif"; ctx.fillStyle = "#173a55"; ctx.textAlign = "center"; ctx.fillText("×5", x, 765);
      if (o.fem !== undefined && t > o.fem && i < 3) { const b = smooth(o.fem + i * 0.2, o.fem + i * 0.2 + 0.4, t); ctx.globalAlpha = a * b; ctx.lineWidth = 9; ctx.strokeStyle = "#ff8fb8"; ctx.beginPath(); ctx.arc(x, 330, 34, 0, TAU); ctx.stroke(); line(ctx, [[x, 364], [x, 420]], 9, "#ff8fb8"); line(ctx, [[x - 24, 396], [x + 24, 396]], 9, "#ff8fb8"); }
      ctx.textAlign = "start"; ctx.restore();
    }
  };

  // Many porpoises against few orcas: the population comparison.
  RAW.compare = (ctx, t, o) => {
    water(ctx, t, { tone: "blue", snow: 20 });
    const a = smooth(0.3, 1.6, t), b = smooth(o.t1 ?? 2.4, (o.t1 ?? 2.4) + 1.4, t);
    for (let i = 0; i < Math.floor(160 * a); i++) { const r = rng(i + 9), x = 80 + r() * 900, y = 120 + r() * 840; porpoise(ctx, t, { x: x + Math.sin(t + i) * 6, y, len: 70, dir: r() < 0.5 ? 1 : -1, beat: 1.2, ph: i }); }
    for (let i = 0; i < Math.floor(76 * b); i++) { const col = i % 8, row = Math.floor(i / 8); orca(ctx, t, { x: 1150 + col * 88, y: 170 + row * 82, len: 76, dir: 1, beat: 0.6, ph: i }); }
  };

  // Herring carousel (Norway): orcas circle a ball of fish and slap it with their tails.
  RAW.carousel = (ctx, t, o) => {
    water(ctx, t, { tone: "dark" });
    const cx = 960, cy = 560;
    for (let i = 0; i < 220; i++) { const r = rng(i), a = r() * TAU + t * (0.6 + r() * 0.4), rr = 40 + r() * 190 * (0.9 + 0.1 * Math.sin(t * 2)); const x = cx + Math.cos(a) * rr * 1.3, y = cy + Math.sin(a) * rr * 0.8; ctx.save(); ctx.translate(x, y); ctx.rotate(a + Math.PI / 2); ell(ctx, 0, 0, 12, 4, 0, "rgba(220,235,245,0.9)"); ctx.restore(); }
    for (let i = 0; i < 3; i++) { const a = t * 0.5 + i * TAU / 3, x = cx + Math.cos(a) * 520, y = cy + Math.sin(a) * 300; orca(ctx, t, { x, y, len: 520, dir: Math.sin(a) > 0 ? -1 : 1, beat: 0.9, ph: i }); }
    const sl = (t % 3) / 3; if (sl < 0.3) { const u = sl / 0.3; ctx.beginPath(); ctx.arc(cx, cy, 60 + u * 400, 0, TAU); ctx.lineWidth = 8; ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - u)})`; ctx.stroke(); }
    bubbles(ctx, t, 20, 4, 600, 1300);
  };

  // Beach hunt (Argentina): an orca surges onto the sand for a sea lion pup, then slides back.
  RAW.beachhunt = (ctx, t, o) => {
    const hz = 420; sky(ctx, "day", hz); cloud(ctx, 400 + t * 6, 160, 1.2); cloud(ctx, 1500, 120, 1);
    sea(ctx, t, "day", hz);
    fill(ctx, "M -300 1400 L -300 760 C 300 700 900 640 1500 620 C 1800 610 2000 600 2220 590 L 2220 1400 Z", "#e8c98e");
    const sw = Math.sin(t * 1.4); ctx.save(); ctx.globalAlpha = 0.85; band(ctx, 650 + sw * 16, 8, [[0.006, 1]], t, 664 + sw * 16, "#ffffff", -300, 2220); ctx.restore();
    const go = o.go ?? 1.5, u = clamp((t - go) / 1.2), back = clamp((t - go - 2.2) / 1.6), surge = Math.sin(Math.min(1, u) * Math.PI / 2) * (1 - back);
    for (let i = 0; i < 4; i++) { const x = 600 + i * 220, y = 740 - i * 6; if (i === 1 && surge > 0.85) continue; FL.seal(ctx, t, { x, y, len: 150, dir: i % 2 ? 1 : -1, beat: 0.6, ph: i }); }
    const ox = lerp(1500, 860, surge), oy = lerp(720, 730, surge);
    orca(ctx, t, { x: ox, y: oy, len: 700, dir: -1, ang: lerp(0.05, -0.08, surge), beat: 0.8, amp: 0.04 });
    if (surge > 0.85) { const m = orcaPt({ x: ox, y: oy, len: 700, dir: -1, ang: -0.08 }, 20, 40); FL.seal(ctx, t, { x: m[0], y: m[1], len: 130, dir: 1, ang: 0.6, beat: 3 }); }
    if (u > 0 && u < 1) { const r = rng(5); for (let i = 0; i < 16; i++) { const a = (u + r()) % 1; circ(ctx, ox + 200 + r() * 200, 700 - a * 120, 10 * (1 - a), `rgba(255,255,255,${1 - a})`); } }
  };

  RAW.endres = (ctx, t, o) => {
    water(ctx, t, { tone: "blue" });
    [[520, 900, 700, 0], [880, 960, 380, 1], [300, 980, 420, 2]].forEach(([x, y, len, i]) => orca(ctx, t, { x: x + t * 22, y, len, dir: 1, beat: 0.6, ph: i * 2, calf: i === 1 }));
    for (let i = 0; i < 6; i++) { const r = rng(i + 40); salmon(ctx, t, { x: 1400 + r() * 400 - t * 30, y: 820 + r() * 160, len: 110, dir: -1, beat: 1.4, ph: i }); }
    bubbles(ctx, t, 16, 5);
  };

  FL.wrapScenes();
})();
