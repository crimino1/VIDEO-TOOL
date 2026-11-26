// Unseen Kingdom 2 shorts: animation taste test. Everything drawn in code: original host, alligator, swamp.
// UK2.draw(ctx, t) paints frame t (seconds) on a 1080x1920 canvas. Deterministic: seeded random only.
(function () {
  const W = 1080, H = 1920, GROUND = 1560, HS = 0.95, GS = 1.05;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const sm = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
  const eo = (k) => 1 - Math.pow(1 - clamp(k), 3);
  const back = (k) => { k = clamp(k); const c = 1.9; return 1 + (c + 1) * Math.pow(k - 1, 3) + c * Math.pow(k - 1, 2); };
  function rng(s) { return function () { s |= 0; s = (s + 0x6D2B79F5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  const INK = "#2a1a12";

  function P(ctx, pts, close = true) { ctx.beginPath(); ctx.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]); if (close) ctx.closePath(); }
  function fs(ctx, fill, lw = 6, ink = INK) { ctx.fillStyle = fill; ctx.fill(); if (lw) { ctx.lineWidth = lw; ctx.strokeStyle = ink; ctx.lineJoin = "round"; ctx.stroke(); } }
  function E(ctx, x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, Math.max(0.1, rx), Math.max(0.1, ry), rot, 0, Math.PI * 2); }
  function seg(ctx, pts, w, col, ink = INK, lw = 6) {
    ctx.lineCap = "round"; ctx.lineJoin = "round";
    P(ctx, pts, false); ctx.lineWidth = w + lw * 2; ctx.strokeStyle = ink; ctx.stroke();
    ctx.lineWidth = w; ctx.strokeStyle = col; ctx.stroke();
  }
  const rot = (p, c, a) => { const dx = p[0] - c[0], dy = p[1] - c[1]; return [c[0] + dx * Math.cos(a) - dy * Math.sin(a), c[1] + dx * Math.sin(a) + dy * Math.cos(a)]; };

  // ---------------- swamp background (screen space, parallax by camera x) ----------------
  function trees(ctx, off, baseY, sc, col, col2, seed, spacing) {
    const i0 = Math.floor((off - 700) / spacing), i1 = Math.floor((off + W + 700) / spacing);
    for (let i = i0; i <= i1; i++) {
      const r = rng(i * 7919 + seed);
      const x = i * spacing + r() * spacing * 0.6 - off, h = (330 + r() * 260) * sc, tw = (16 + r() * 10) * sc;
      ctx.fillStyle = col;
      ctx.beginPath(); ctx.moveTo(x - tw * 2.4, baseY); ctx.quadraticCurveTo(x - tw * 0.8, baseY - h * 0.12, x - tw * 0.6, baseY - h);
      ctx.lineTo(x + tw * 0.6, baseY - h); ctx.quadraticCurveTo(x + tw * 0.8, baseY - h * 0.12, x + tw * 2.4, baseY); ctx.closePath(); ctx.fill();
      for (let k = 0; k < 4; k++) {   // flat crown pads
        const cy = baseY - h - 10 * sc + k * 46 * sc, cw = (70 + r() * 70) * sc;
        ctx.fillStyle = k % 2 ? col2 : col; E(ctx, x + (r() - 0.5) * 50 * sc, cy, cw, 26 * sc); ctx.fill();
      }
      ctx.strokeStyle = col2; ctx.lineWidth = 3 * sc;   // hanging moss
      for (let k = 0; k < 5; k++) { const mx = x + (r() - 0.5) * 120 * sc, my = baseY - h + 30 * sc; ctx.beginPath(); ctx.moveTo(mx, my); ctx.lineTo(mx + 3, my + (40 + r() * 70) * sc); ctx.stroke(); }
    }
  }
  function bg(ctx, camX, t) {
    const g = ctx.createLinearGradient(0, 0, 0, 1150);
    g.addColorStop(0, "#8fc6d6"); g.addColorStop(0.55, "#cfe6dc"); g.addColorStop(1, "#f3e7c4");
    ctx.fillStyle = g; ctx.fillRect(-600, -600, W + 1200, 1800);
    const sg = ctx.createRadialGradient(760, 760, 10, 760, 760, 420);
    sg.addColorStop(0, "rgba(255,246,214,0.9)"); sg.addColorStop(1, "rgba(255,246,214,0)");
    ctx.fillStyle = sg; ctx.fillRect(200, 300, 1200, 900);
    trees(ctx, camX * 0.12, 1000, 0.55, "#a7c3ae", "#b6cdb9", 11, 150);
    trees(ctx, camX * 0.3, 1080, 0.8, "#7fa585", "#8fb294", 23, 210);
    trees(ctx, camX * 0.5, 1150, 1.05, "#57805c", "#668f69", 37, 300);
    // water
    const wg = ctx.createLinearGradient(0, 1130, 0, 1300);
    wg.addColorStop(0, "#9ec3b3"); wg.addColorStop(1, "#5d8c7d");
    ctx.fillStyle = wg; ctx.fillRect(-600, 1130, W + 1200, 200);
    const off = camX * 0.6, r0 = Math.floor((off - 800) / 90);
    ctx.strokeStyle = "rgba(255,255,255,0.45)"; ctx.lineWidth = 4; ctx.lineCap = "round";
    for (let i = r0; i < r0 + 30; i++) { const r = rng(i * 131 + 5); const x = i * 90 - off + Math.sin(t * 1.3 + i) * 8, y = 1150 + r() * 130, l = 30 + r() * 70; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke(); }
    // grassy bank, irregular top edge
    const bo = camX, bg2 = ctx.createLinearGradient(0, 1260, 0, H);
    bg2.addColorStop(0, "#94ad52"); bg2.addColorStop(0.35, "#6f8f3c"); bg2.addColorStop(1, "#4a6a2a");
    ctx.fillStyle = bg2; ctx.beginPath(); ctx.moveTo(-600, H + 100);
    for (let x = -600; x <= W + 600; x += 30) { const wx = x + bo; ctx.lineTo(x, 1285 + Math.sin(wx * 0.011) * 14 + Math.sin(wx * 0.037) * 6); }
    ctx.lineTo(W + 600, H + 100); ctx.closePath(); ctx.fill();
    // reeds at the water's edge and grass tufts on the bank
    const i0 = Math.floor((bo - 800) / 70);
    for (let i = i0; i < i0 + 42; i++) {
      const r = rng(i * 977 + 3), x = i * 70 + r() * 40 - bo;
      if (r() < 0.45) {
        const hgt = 90 + r() * 90, sway = Math.sin(t * 1.6 + i) * 6;
        ctx.strokeStyle = "#5c7a33"; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, 1300); ctx.quadraticCurveTo(x + sway * 0.5, 1300 - hgt * 0.5, x + sway, 1300 - hgt); ctx.stroke();
        if (r() < 0.5) { ctx.fillStyle = "#6b4a2b"; E(ctx, x + sway, 1300 - hgt + 10, 7, 22); ctx.fill(); }
      }
      const ty = 1340 + r() * 520, tx = x + r() * 30;
      ctx.strokeStyle = r() < 0.5 ? "#5a7a30" : "#86a447"; ctx.lineWidth = 4;
      for (let k = -2; k <= 2; k++) { ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx + k * 6, ty - 14, tx + k * 11, ty - 26 - r() * 12); ctx.stroke(); }
    }
    for (let i = i0; i < i0 + 14; i++) {   // mud patches
      const r = rng(i * 211 + 9), x = i * 220 + r() * 120 - bo;
      ctx.fillStyle = "rgba(92,74,44,0.25)"; E(ctx, x, 1400 + r() * 380, 70 + r() * 60, 14 + r() * 10); ctx.fill();
    }
  }
  function foreground(ctx, camX, t) {   // soft out-of-focus grass for depth
    ctx.save(); ctx.filter = "blur(7px)";
    const off = camX * 1.35, i0 = Math.floor((off - 600) / 46);
    for (let i = i0; i < i0 + 40; i++) {
      const r = rng(i * 557 + 1), x = i * 46 - off, h = 120 + r() * 170, s = Math.sin(t * 1.8 + i * 0.7) * 10;
      ctx.fillStyle = r() < 0.5 ? "#3d5a22" : "#4f6f2b";
      ctx.beginPath(); ctx.moveTo(x - 14, H + 20); ctx.quadraticCurveTo(x + s * 0.4, H - h * 0.5, x + s, H - h); ctx.quadraticCurveTo(x + 6 + s * 0.4, H - h * 0.5, x + 16, H + 20); ctx.fill();
    }
    ctx.restore();
  }

  // ---------------- the host: original character (curly hair, mustard hoodie, teal trousers) ----------------
  // o: {t, dir, run (phase or null), face, look, turn, mouth, pose:{l,r}, lean, blink}
  function host(ctx, x, y, s, o) {
    const t = o.t, dir = o.dir || 1, run = o.run;
    const SK = "#e8b48a", SKD = "#c98e66", HO = "#f2b33d", HOD = "#d39327", PA = "#2f6f73", PAD = "#225356", SH = "#f4f1ea", SO = "#c94b3a", HA = "#3a2418";
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    let bob = run != null ? -Math.abs(Math.sin(run)) * 24 : Math.sin(t * 2.3) * 3;
    const lean = (run != null ? dir * 0.17 : 0) + (o.lean || 0);
    E(ctx, 0, 4, run != null ? 100 : 125, 22); ctx.fillStyle = "rgba(20,30,10,0.3)"; ctx.fill();
    const hipY = -315 + bob, L1 = 152, L2 = 148;
    function leg(side) {
      const hx = run != null ? (side ? -12 : 12) : (side ? -42 : 42);
      let a, k;
      if (run != null) { const p = run + (side ? Math.PI : 0); a = Math.sin(p) * 0.95; k = 0.2 + 1.0 * Math.max(0, Math.sin(p + 1.7)); }
      else { a = 0; k = 0; }
      const kx = hx + Math.sin(a) * L1 * dir, ky = hipY + Math.cos(a) * L1;
      const fx = kx + Math.sin(a - k) * L2 * dir, fy = Math.min(-20, ky + Math.cos(a - k) * L2);
      seg(ctx, [[hx, hipY], [kx, ky], [fx, fy]], 54, side ? PAD : PA);
      const sx = run != null ? fx + dir * 16 : fx + (side ? -8 : 8);
      E(ctx, sx, fy + 2, 40, 21, run != null ? (a - k) * 0.5 * dir : 0); fs(ctx, SH);
      E(ctx, sx, fy + 15, 38, 7, run != null ? (a - k) * 0.5 * dir : 0); fs(ctx, SO, 4);
    }
    function arm(side, front) {
      // side 1 = screen right, -1 = screen left. Angles from straight down; + = outward.
      const sx = (run != null ? 30 : 96) * side, sy = -458 + bob;
      let ex, ey, wx, wy; const U = 122, F = 116;
      if (run != null) {
        const ar = Math.sin(run + (side > 0 ? 0 : Math.PI)) * 0.95, fa = ar + 1.5;
        ex = sx + Math.sin(ar) * U * dir; ey = sy + Math.cos(ar) * U; wx = ex + Math.sin(fa) * F * dir; wy = ey + Math.cos(fa) * F;
      } else {
        const p = (side > 0 ? o.pose.r : o.pose.l) || [0.2, -0.15];
        ex = sx + side * Math.sin(p[0]) * U; ey = sy + Math.cos(p[0]) * U; wx = ex + side * Math.sin(p[0] + p[1]) * F; wy = ey + Math.cos(p[0] + p[1]) * F;
      }
      const c = front ? HO : HOD;
      seg(ctx, [[sx, sy], [ex, ey], [wx, wy]], 46, c);
      E(ctx, wx + (wx - ex) * 0.18, wy + (wy - ey) * 0.18, 25, 25); fs(ctx, front ? SK : SKD, 5);
    }
    leg(1); leg(0);
    ctx.save(); ctx.translate(0, hipY); ctx.rotate(lean); ctx.translate(0, -hipY);
    if (run != null) arm(-dir, false);
    const b = bob;
    E(ctx, 0, -488 + b, 98, 40); fs(ctx, HOD, 5);   // hood behind the neck
    ctx.beginPath(); ctx.moveTo(-98, -478 + b); ctx.quadraticCurveTo(0, -502 + b, 98, -478 + b); ctx.quadraticCurveTo(116, -392 + b, 92, -296 + b);
    ctx.lineTo(-92, -296 + b); ctx.quadraticCurveTo(-116, -392 + b, -98, -478 + b); fs(ctx, HO);
    ctx.save(); ctx.clip(); ctx.fillStyle = "rgba(180,110,20,0.28)"; ctx.fillRect(40, -520 + b, 90, 240); ctx.restore();
    P(ctx, [[-60, -385 + b], [60, -385 + b], [70, -330 + b], [-70, -330 + b]]); fs(ctx, HOD, 4);
    P(ctx, [[-94, -322 + b], [94, -322 + b], [92, -294 + b], [-92, -294 + b]]); fs(ctx, HOD, 5);
    ctx.strokeStyle = SH; ctx.lineWidth = 5; ctx.lineCap = "round";
    for (const sx of [-18, 18]) { ctx.beginPath(); ctx.moveTo(sx, -474 + b); ctx.lineTo(sx * 1.25, -412 + b + Math.sin(t * 3 + sx) * 3); ctx.stroke(); E(ctx, sx * 1.25, -408 + b, 6, 6); fs(ctx, SH, 3); }
    // head
    const turn = o.turn || 0, hy = -628 + b, fx = turn * 26;
    P(ctx, [[-22, -520 + b], [22, -520 + b], [22, -478 + b], [-22, -478 + b]]); fs(ctx, SKD, 5);
    E(ctx, -104 - turn * 14, hy + 8, 20, 28); fs(ctx, SK, 5);
    E(ctx, 104 - turn * 14, hy + 8, 20, 28); fs(ctx, SK, 5);
    E(ctx, 0, hy, 108, 118); fs(ctx, SK);
    E(ctx, 0, hy - 78, 96, 52); ctx.fillStyle = HA; ctx.fill();
    for (let i = 0; i <= 11; i++) {   // curly mop
      const an = Math.PI * (1.02 + i * 0.087), cx = Math.cos(an) * 98, cy = hy - 12 + Math.sin(an) * 104;
      E(ctx, cx, cy, 40, 38); fs(ctx, HA, 5);
    }
    for (const [cx, cy] of [[-40, -88], [0, -98], [42, -86]]) { E(ctx, cx + fx * 0.4, hy + cy, 34, 30); fs(ctx, HA, 5); }
    ctx.strokeStyle = "rgba(255,255,255,0.18)"; ctx.lineWidth = 6;
    ctx.beginPath(); ctx.arc(-30, hy - 112, 20, Math.PI * 1.1, Math.PI * 1.6); ctx.stroke();
    // face
    const face = o.face || "talk", look = o.look || 0;
    const blink = ((t + 0.4) % 3.3) < 0.11 ? 0.12 : 1;
    const big = face === "shock" ? 1.22 : 1;
    for (const sd of [-1, 1]) {
      const ex = fx + sd * 40, ey = hy + 6;
      E(ctx, ex, ey, 24 * big, 30 * big * blink); fs(ctx, "#ffffff", 5);
      if (blink > 0.5) {
        ctx.save(); E(ctx, ex, ey, 24 * big, 30 * big); ctx.clip();
        E(ctx, ex + look * 10, ey + 3, face === "shock" ? 9 : 13, face === "shock" ? 9 : 14); ctx.fillStyle = "#1d120c"; ctx.fill();
        E(ctx, ex + look * 10 + 4, ey - 3, 4, 4); ctx.fillStyle = "#fff"; ctx.fill();
        if (face === "smug" || face === "tired") { ctx.fillStyle = SK; ctx.fillRect(ex - 30, ey - 40, 60, face === "smug" ? 34 : 28); ctx.strokeStyle = INK; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(ex - 26, ey - 6); ctx.lineTo(ex + 26, ey - 6); ctx.stroke(); }
        ctx.restore();
      }
      // brows
      let y1 = hy - 38, y2 = hy - 40;
      if (face === "shock") { y1 = hy - 56; y2 = hy - 60; }
      if (face === "worried") { y1 = sd < 0 ? hy - 36 : hy - 50; y2 = sd < 0 ? hy - 50 : hy - 36; }
      if (face === "smug") { y1 = sd < 0 ? hy - 50 : hy - 34; y2 = sd < 0 ? hy - 56 : hy - 32; }
      ctx.strokeStyle = HA; ctx.lineWidth = 12; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(ex - 22, y1); ctx.quadraticCurveTo(ex, Math.min(y1, y2) - 8, ex + 22, y2); ctx.stroke();
    }
    ctx.strokeStyle = SKD; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(fx + 2, hy + 24); ctx.quadraticCurveTo(fx + 14, hy + 40, fx - 2, hy + 46); ctx.stroke();
    E(ctx, fx - 62, hy + 40, 18, 11); ctx.fillStyle = "rgba(230,110,100,0.35)"; ctx.fill();
    E(ctx, fx + 62, hy + 40, 18, 11); ctx.fill();
    const my = hy + 70, m = o.mouth ?? 0;
    if (face === "shock" || face === "yell") {
      const ry = face === "shock" ? 30 : 16 + 12 * m;
      E(ctx, fx, my, face === "shock" ? 20 : 26, ry); fs(ctx, "#6e1f1b", 5);
      E(ctx, fx, my + ry * 0.5, 13, ry * 0.35); ctx.fillStyle = "#e0707a"; ctx.fill();
    } else if (face === "smug") {
      if (m > 0.15) { ctx.beginPath(); ctx.moveTo(fx - 30, my - 4); ctx.quadraticCurveTo(fx, my + 16 + m * 18, fx + 34, my - 12); ctx.quadraticCurveTo(fx, my + 2, fx - 30, my - 4); fs(ctx, "#6e1f1b", 5); }
      else { ctx.strokeStyle = INK; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(fx - 30, my - 2); ctx.quadraticCurveTo(fx + 2, my + 14, fx + 36, my - 14); ctx.stroke(); }
    } else if (face === "tired") {
      E(ctx, fx, my, 18, 10 + 6 * m); fs(ctx, "#6e1f1b", 5);
    } else {   // talk / worried
      const op = 6 + 30 * m;
      ctx.beginPath(); ctx.moveTo(fx - 34, my - 6); ctx.quadraticCurveTo(fx, my + 2, fx + 34, my - 6); ctx.quadraticCurveTo(fx, my + op, fx - 34, my - 6); fs(ctx, "#6e1f1b", 5);
      if (m > 0.25) { ctx.save(); ctx.clip(); E(ctx, fx, my + op * 0.8, 18, 10); ctx.fillStyle = "#e0707a"; ctx.fill(); ctx.fillStyle = "#fff"; ctx.fillRect(fx - 26, my - 10, 52, 9); ctx.restore(); }
    }
    if (run == null) { arm(-1, true); arm(1, true); } else arm(dir, true);
    ctx.restore(); ctx.restore();
  }

  // ---------------- the alligator, side view facing left ----------------
  function gator(ctx, x, y, s, o) {
    ctx.save(); ctx.translate(x, y + (o.low || 0)); ctx.scale(s, s);
    const sw = o.sway || 0, wp = o.walk || 0, wa = o.walkAmt || 0, jaw = o.jaw || 0;
    const bob = -Math.abs(Math.sin(wp)) * 7 * wa;
    const sway = (x) => (x < 230 ? 0 : sw * Math.pow((x - 230) / 490, 2));
    const topY = (x) => bob + (x < 230 ? -118 - 32 * Math.sin(Math.PI * (x + 170) / 400) : lerp(-118, -46, Math.pow((x - 230) / 490, 0.9)) + sway(x));
    const botY = (x) => bob + (x < 230 ? -30 + 16 * Math.sin(Math.PI * (x + 170) / 400) : lerp(-30, -40, (x - 230) / 490) + sway(x));
    E(ctx, 160, 6, 440, 26); ctx.fillStyle = "rgba(20,30,10,0.32)"; ctx.fill();
    function leg(lx, ph, col) {
      const swg = Math.sin(ph) * 26 * wa, lift = Math.max(0, Math.cos(ph)) * 12 * wa;
      seg(ctx, [[lx, botY(lx) - 8], [lx - 6 + swg * 0.5, -26 - lift], [lx - 26 + swg, -8 - lift]], 36, col, "#1e2412", 5);
      for (let k = 0; k < 3; k++) { E(ctx, lx - 44 + swg + k * 9, -4 - lift, 9, 6); fs(ctx, col, 3, "#1e2412"); }
    }
    leg(-95, wp + Math.PI, "#3a4622"); leg(185, wp, "#3a4622");
    const pts = [];
    for (let xx = -178; xx <= 720; xx += 14) pts.push([xx, topY(xx)]);
    pts.push([736, (topY(720) + botY(720)) / 2]);
    for (let xx = 720; xx >= -178; xx -= 14) pts.push([xx, botY(xx)]);
    const g = ctx.createLinearGradient(0, -150, 0, 0);
    g.addColorStop(0, "#33401e"); g.addColorStop(0.45, "#56662f"); g.addColorStop(0.75, "#8b8850"); g.addColorStop(1, "#c3b77e");
    P(ctx, pts); fs(ctx, g, 5, "#1e2412");
    ctx.save(); P(ctx, pts); ctx.clip();
    for (let row = 0; row < 3; row++) for (let xx = -140; xx < 640; xx += 30) {
      const yy = lerp(topY(xx), botY(xx), 0.22 + row * 0.17);
      ctx.fillStyle = "rgba(26,34,12,0.28)"; ctx.beginPath(); ctx.roundRect(xx + (row % 2) * 14, yy - 6, 22, 11, 4); ctx.fill();
    }
    ctx.restore();
    for (let xx = -130; xx <= 700; xx += 30) {   // back scutes
      const h = xx < 230 ? 18 : 18 * (1 - (xx - 230) / 540), yy = topY(xx);
      P(ctx, [[xx - 10, yy + 3], [xx, yy - h], [xx + 10, yy + 3]]); fs(ctx, "#2c3818", 3, "#1e2412");
    }
    leg(-115, wp, "#4c5a2a"); leg(160, wp + Math.PI, "#4c5a2a");
    // head
    const hg = [-178, -72 + bob];
    const up = jaw * 0.42, dn = -jaw * 0.42;
    if (jaw > 0.02) {
      const ut = rot([-424, -74 + bob], hg, up), lt = rot([-418, -64 + bob], hg, dn);
      P(ctx, [hg, ut, lt]); fs(ctx, "#c4636c", 4, "#1e2412");
      E(ctx, hg[0] - 30, hg[1] + 2, 26, 14 * jaw); ctx.fillStyle = "#6b2228"; ctx.fill();
      E(ctx, (ut[0] + lt[0]) / 2 + 70, (ut[1] + lt[1]) / 2 + 8, 60, 10 * jaw); ctx.fillStyle = "#e58a92"; ctx.fill();
    }
    ctx.save(); ctx.translate(hg[0], hg[1]); ctx.rotate(dn); ctx.translate(-hg[0], -hg[1]);
    P(ctx, [[-178, -72], [-300, -68], [-418, -64], [-424, -52], [-405, -40], [-300, -36], [-200, -28], [-160, -38]].map(p => [p[0], p[1] + bob])); fs(ctx, "#8b8850", 5, "#1e2412");
    for (let xx = -404; xx <= -214; xx += 24) { P(ctx, [[xx - 6, -64 + bob], [xx, -78 + bob], [xx + 6, -64 + bob]]); fs(ctx, "#f4f0dc", 2, "#5a5640"); }
    ctx.restore();
    ctx.save(); ctx.translate(hg[0], hg[1]); ctx.rotate(up); ctx.translate(-hg[0], -hg[1]);
    for (let xx = -406; xx <= -206; xx += 24) { P(ctx, [[xx - 7, -76 + bob], [xx, -60 + bob], [xx + 7, -76 + bob]]); fs(ctx, "#f4f0dc", 2, "#5a5640"); }
    const hgr = ctx.createLinearGradient(0, -150 + bob, 0, -72 + bob); hgr.addColorStop(0, "#3a4822"); hgr.addColorStop(1, "#617036");
    P(ctx, [[-150, -112], [-196, -140], [-236, -134], [-300, -112], [-380, -102], [-406, -110], [-430, -92], [-428, -74], [-300, -74], [-178, -74], [-150, -86]].map(p => [p[0], p[1] + bob])); fs(ctx, hgr, 5, "#1e2412");
    E(ctx, -408, -106 + bob, 9, 6); fs(ctx, "#2c3818", 3, "#1e2412");
    E(ctx, -212, -136 + bob, 27, 19); fs(ctx, "#4a5a2a", 4, "#1e2412");
    E(ctx, -214, -140 + bob, 13, 10); fs(ctx, "#e6c445", 3, "#1e2412");
    E(ctx, -214, -140 + bob, 3, 9); ctx.fillStyle = "#111"; ctx.fill();
    if (o.lid) { ctx.save(); E(ctx, -214, -140 + bob, 14, 11); ctx.clip(); ctx.fillStyle = "#4a5a2a"; ctx.fillRect(-232, -154 + bob, 40, 22 * o.lid); ctx.restore(); ctx.strokeStyle = "#1e2412"; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-228, -151 + bob + 22 * o.lid); ctx.lineTo(-200, -151 + bob + 22 * o.lid); ctx.stroke(); }
    ctx.restore();
    ctx.restore();
  }

  // ---------------- overlays ----------------
  function speedLines(ctx, t, a) {
    const r = rng(Math.floor(t * 12) * 31 + 7);
    ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = "#ffffff";
    for (let i = 0; i < 40; i++) {
      const an = r() * Math.PI * 2, r0 = 430 + r() * 220, r1 = 1400, w = 0.01 + r() * 0.018;
      ctx.beginPath(); ctx.moveTo(540 + Math.cos(an) * r0, 900 + Math.sin(an) * r0);
      ctx.lineTo(540 + Math.cos(an - w) * r1, 900 + Math.sin(an - w) * r1); ctx.lineTo(540 + Math.cos(an + w) * r1, 900 + Math.sin(an + w) * r1); ctx.fill();
    }
    ctx.restore();
  }
  function gauge(ctx, x, y, sc, val) {
    ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc);
    E(ctx, 0, 6, 150, 150); ctx.fillStyle = "rgba(0,0,0,0.35)"; ctx.fill();
    E(ctx, 0, 0, 150, 150); fs(ctx, "#1f2b31", 8, "#0e1416");
    E(ctx, 0, 0, 132, 132); fs(ctx, "#f4f1ea", 4, "#0e1416");
    const a0 = Math.PI * 0.75, a1 = Math.PI * 2.25;
    ctx.strokeStyle = "#d24a3a"; ctx.lineWidth = 14; ctx.beginPath(); ctx.arc(0, 0, 112, lerp(a0, a1, 0.75), a1); ctx.stroke();
    ctx.strokeStyle = "#1f2b31"; ctx.lineCap = "round";
    for (let i = 0; i <= 20; i++) { const a = lerp(a0, a1, i / 20), r0 = i % 5 ? 104 : 94; ctx.lineWidth = i % 5 ? 4 : 8; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.lineTo(Math.cos(a) * 120, Math.sin(a) * 120); ctx.stroke(); }
    ctx.fillStyle = "#1f2b31"; ctx.font = '700 30px "Fredoka"'; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const n of [5, 10, 15]) { const a = lerp(a0, a1, n / 20); ctx.fillText(String(n), Math.cos(a) * 70, Math.sin(a) * 70); }
    const an = lerp(a0, a1, clamp(val / 20));
    ctx.strokeStyle = "#d24a3a"; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(-Math.cos(an) * 18, -Math.sin(an) * 18); ctx.lineTo(Math.cos(an) * 100, Math.sin(an) * 100); ctx.stroke();
    E(ctx, 0, 0, 14, 14); fs(ctx, "#1f2b31", 0);
    ctx.font = '700 46px "Fredoka"'; ctx.fillText(String(Math.round(val)), 0, 62); ctx.font = '700 22px "Fredoka"'; ctx.fillText("MPH", 0, 96);
    ctx.restore();
  }
  // [start, word, key, end]
  const WORDS = [
    [0.15, "WHAT"], [0.42, "DO"], [0.62, "YOU"], [0.82, "DO"], [1.05, "IF"], [1.25, "A"], [1.45, "GATOR", 1], [2.0, "CHASES"], [2.45, "YOU?", 1, 3.2],
    [4.45, "NOPE!", 1, 5.2],
    [5.35, "RUN"], [5.65, "IN"], [5.85, "A"], [6.05, "STRAIGHT", 1], [6.6, "LINE", 0, 7.1],
    [7.3, "ZIGZAG?"], [7.95, "MYTH.", 1, 8.8],
    [9.0, "GATORS"], [9.4, "TOP"], [9.65, "OUT"], [9.85, "AT"], [10.05, "10", 1], [10.45, "MPH", 0, 10.95],
    [11.1, "ONLY"], [11.4, "SHORT"], [11.7, "BURSTS", 1, 12.3],
    [12.45, "BYE"], [12.8, "BYE,"], [13.15, "BIG"], [13.45, "LIZARD", 1, 14.6],
  ];
  function wordAt(t) {
    for (let i = 0; i < WORDS.length; i++) {
      const w = WORDS[i], end = w[3] != null ? w[3] : WORDS[i + 1][0];
      if (t >= w[0] && t < end) return { w: w[1], key: !!w[2], a: w[0], end };
    }
    return null;
  }
  function caption(ctx, t) {
    const w = wordAt(t); if (!w) return;
    const sc = (w.key ? 1.3 : 1) * (0.55 + 0.45 * back((t - w.a) / 0.1));
    ctx.save(); ctx.translate(540, 1190); ctx.scale(sc, sc);
    ctx.font = '700 84px "Fredoka"'; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.lineJoin = "round";
    ctx.shadowColor = "rgba(0,0,0,0.5)"; ctx.shadowBlur = 16; ctx.shadowOffsetY = 6;
    ctx.lineWidth = 16; ctx.strokeStyle = "#111"; ctx.strokeText(w.w, 0, 0);
    ctx.shadowColor = "transparent"; ctx.fillStyle = "#ffffff"; ctx.fillText(w.w, 0, 0);
    ctx.restore();
  }
  function talkAmt(t) { const w = wordAt(t); if (!w) return 0; return 0.15 + 0.85 * Math.abs(Math.sin((t - w.a) * Math.PI / Math.max(0.2, w.end - w.a) * 1.6)); }

  // ---------------- the scene timeline ----------------
  function hostX(t) {
    if (t < 5.2) return 430 - 25 * sm(3.45, 3.65, t);
    if (t < 10.6) return 405 - 520 * (t - 5.2);
    return 405 - 520 * 5.4 - 90 * eo((t - 10.6) / 0.4);
  }
  function hostRun(t) {
    if (t < 5.2 || t >= 11.0) return null;
    if (t < 10.6) return (t - 5.2) * 13;
    const tau = t - 10.6; return 5.4 * 13 + 13 * (tau - tau * tau / 0.8);
  }
  const G94 = 1150 - 600 * 3.8;
  function gatorX(t) {
    if (t < 2.6) return 2100;
    if (t < 3.2) return lerp(1900, 1150, back((t - 2.6) / 0.6));
    if (t < 5.6) return 1150;
    if (t < 9.4) return 1150 - 600 * (t - 5.6);
    const tau = Math.min(t - 9.4, 1.4); return G94 - (600 * tau - 600 * tau * tau / 2.8);
  }
  function gatorJaw(t) {
    if (t < 3.4) return 0;
    if (t < 4.25) return Math.min(1, (t - 3.4) / 0.07) * (1 - sm(4.0, 4.25, t) * 0.85);
    if (t < 5.6) return 0.15;
    if (t < 9.4) return 0.15 + 0.85 * Math.pow(Math.max(0, Math.sin((t - 5.6) * 7.5)), 0.5);
    if (t < 10.8) return lerp(0.5, 0.25, sm(9.4, 10.8, t));
    return 0.22 + 0.07 * Math.sin(t * 7);
  }
  function camX(t) {
    if (t < 5.2) return 640;
    if (t < 10.6) return lerp(640, hostX(t) + 300, sm(5.2, 5.8, t));
    return hostX(t) + lerp(300, 260, sm(10.6, 11.6, t));
  }

  function draw(ctx, t) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
    const cx = camX(t), hx = hostX(t) - cx + 540, gx = gatorX(t) - cx + 540;
    const headY = GROUND - 628 * HS;
    // camera: screen = (p - F) * z + C
    let z = 1, F = [540, 960], C = [540, 960];
    if (t >= 3.4 && t < 4.4) { const gh = [gx - 300 * GS, GROUND + 60 - 100 * GS]; z = 1 + 0.14 * eo((t - 3.4) / 0.25); F = gh; C = gh; }
    if (t >= 4.4 && t < 5.2) { z = 2.25 + 0.2 * (t - 4.4) / 0.8; F = [hx, headY + 40]; C = [540, 880]; }
    if (t >= 12.6) { z = 1 + 0.07 * sm(12.6, 14.6, t); F = [hx, headY]; C = F; }
    let shx = 0, shy = 0;
    if (t >= 3.4 && t < 3.8) { const r = rng(Math.floor(t * 30) + 99), k = 1 - (t - 3.4) / 0.4; shx = (r() - 0.5) * 30 * k; shy = (r() - 0.5) * 30 * k; }
    ctx.translate(C[0] + shx, C[1] + shy); ctx.scale(z, z); ctx.translate(-F[0], -F[1]);
    bg(ctx, cx, t);

    // host acting
    const run = hostRun(t), o = { t, run, dir: run != null ? -1 : 1, face: "talk", look: 0, turn: 0, mouth: 0, pose: { l: [0.18, -0.12], r: [0.18, -0.12] } };
    if (t < 3.2) {
      o.mouth = talkAmt(t); o.pose.r = [0.42 + 0.12 * Math.sin(t * 5), -2.1 + 0.25 * Math.sin(t * 7)];
      o.look = lerp(0, 1, sm(2.7, 2.9, t)); o.turn = 0.3 * sm(2.7, 2.9, t);
    } else if (t < 5.2) {
      o.face = t < 3.45 ? "talk" : "shock"; o.look = 1; o.turn = 0.25; o.lean = -0.08 * sm(3.45, 3.6, t);
      const k = sm(3.45, 3.6, t); o.pose.l = [lerp(0.18, 0.95, k), lerp(-0.12, -2.55, k)]; o.pose.r = [lerp(0.18, 0.95, k), lerp(-0.12, -2.55, k)];
    } else if (t < 11.0) {
      o.face = t < 10.4 ? "yell" : "worried"; o.mouth = Math.abs(Math.sin(t * 9)); o.look = -1; o.turn = 0.55;
      if (run == null || t > 10.6) o.face = "worried";
    } else if (t < 11.5) {
      o.face = "tired"; o.mouth = 0.5 + 0.5 * Math.sin(t * 14); o.turn = 0.2; o.look = 0.6;
      o.pose.l = [0.5, -0.4]; o.pose.r = [0.5, -0.4];
    } else {
      o.face = "smug"; o.mouth = talkAmt(t); o.turn = 0.35; o.look = 0.8;
      o.pose.l = [0.95, -0.65];   // hand on hip
      const wv = sm(12.35, 12.55, t);
      o.pose.r = wv > 0 ? [lerp(0.42, 2.45, wv), lerp(-2.1, 0.5 + 0.4 * Math.sin(t * 11), wv)] : [0.42 + 0.1 * Math.sin(t * 5), -2.1];
    }
    host(ctx, hx, GROUND, HS, o);

    // gator acting
    const gxW = gatorX(t), moving = (t > 2.6 && t < 3.2) || (t > 5.6 && t < 10.8);
    const walk = t < 5 ? (1900 - gxW) / 55 : (1150 - gxW) / 55;
    const walkAmt = moving ? (t > 9.4 ? 1 - sm(9.4, 10.8, t) : 1) : 0;
    const tired = sm(10.6, 11.2, t);
    gator(ctx, gx, GROUND + 60, GS, { jaw: gatorJaw(t), walk, walkAmt, sway: Math.sin(t * 5) * 46 * walkAmt + Math.sin(t * 1.4) * 14, lid: 0.55 * tired, low: 10 * tired });
    foreground(ctx, cx, t);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (t >= 4.4 && t < 5.2) speedLines(ctx, t, 0.85);
    if (t >= 9.0 && t < 11.0) {
      const p = back((t - 9.0) / 0.3) * (1 - sm(10.8, 11.0, t)), v = 10 * eo((t - 9.4) / 0.6) + (t > 10 ? Math.sin(t * 30) * 0.4 * (1 - sm(10, 10.5, t)) : 0);
      gauge(ctx, 790, 620, 0.9 * Math.max(0.01, p), Math.max(0, v));
    }
    caption(ctx, t);
    const fade = Math.max(1 - clamp(t / 0.3), sm(14.6, 15.0, t));
    if (fade > 0) { ctx.fillStyle = `rgba(0,0,0,${fade})`; ctx.fillRect(0, 0, W, H); }
  }
  window.UK2 = { draw };
})();
