// New scenes for "The Only Animal Orcas Won't Hunt": a photo-card menu wall, the view from below, sonar vision, the tank, the sailboat rudder and the kayak.
// Extends SC from orca.js. Everything is a pure function of t.
(() => {
  const { W, H, clamp, lerp, smooth, ease, rng, rgb } = DP;
  const im = DP.im;
  const ORC = { a: "img_orca_a", b: "img_orca_b", c: "img_orca_c" };
  function orca(ctx, t, h) {
    const p = h.path ? OC.path(h.path, t) : { x: h.x, y: h.y, a: 0 };
    return DP.beast(ctx, t, { img: ORC[h.v || "b"], key: (h.v || "b") + (h.len | 0) + (h.k || ""), len: h.len ?? 800, headRight: true, bend: 0.42, amp: h.amp ?? 0.045,
      beat: h.beat ?? 0.55, waves: 1.6, x: p.x, y: p.y + Math.sin(t * 0.8 + (h.seed || 0)) * 5, angle: (h.flip ? -p.a : p.a) * 0.5 + (h.angle || 0), flip: h.flip,
      alpha: h.alpha ?? 1, fog: h.fog, dark: h.dark, sil: h.sil, rim: h.rim, blur: h.blur, hi: 0.16, lo: 0.38 });
  }
  function rr(ctx, x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  // ================= the menu wall: photo cards fly onto a board; the camera follows the newest =================
  // o.cards = [{img, label, t}], o.cols, o.cw/ch card size, o.you = t when the last empty "YOU" card appears, o.fall = t when everything dims except YOU
  SC.cards = (ctx, t, o) => {
    const cols = o.cols ?? 6, cw = o.cw ?? 380, ch = o.ch ?? 250, gx = 60, gy = 90;
    const pos = (i) => ({ x: (i % cols) * (cw + gx), y: Math.floor(i / cols) * (ch + gy) });
    const n = o.cards.length + (o.you !== undefined ? 1 : 0);
    // camera: centre on the newest card, easing between them; zoom out to show the whole wall at o.wide
    let shown = 0; for (const c of o.cards) if (t >= c.t) shown++;
    if (o.you !== undefined && t >= o.you) shown = n;
    const target = (i) => { const p = pos(Math.max(0, i)); return { x: p.x + cw / 2, y: p.y + ch / 2 }; };
    let cx = 0, cy = 0;
    {
      const idx = Math.max(0, shown - 1), prevT = idx > 0 ? (o.cards[idx - 1]?.t ?? 0) : 0, curT = idx < o.cards.length ? o.cards[idx].t : o.you;
      const a = target(Math.max(0, idx - 1)), b = target(idx), k = ease(curT, curT + 0.6, t);
      cx = lerp(a.x, b.x, k); cy = lerp(a.y, b.y, k);
    }
    const rows = Math.ceil(n / cols), wallW = cols * (cw + gx) - gx, wallH = rows * (ch + gy) - gy;
    const wk = o.wide !== undefined ? smooth(o.wide, o.wide + 1.4, t) : 0;
    const z = lerp(o.zoom ?? 1.25, Math.min(W / (wallW + 160), H / (wallH + 160)), wk);
    cx = lerp(cx, wallW / 2, wk); cy = lerp(cy, wallH / 2, wk);
    // backdrop: dark slate with soft vignette and drifting dust
    const g = ctx.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, W * 0.8);
    g.addColorStop(0, "#14232c"); g.addColorStop(1, "#05090c"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(z, z); ctx.translate(-cx, -cy);
    const dimAll = o.fall !== undefined ? smooth(o.fall, o.fall + 1, t) : 0;
    for (let i = 0; i < n; i++) {
      const isYou = i === o.cards.length;
      const tc = isYou ? o.you : o.cards[i].t; if (t < tc) continue;
      const k = ease(tc, tc + 0.55, t), p = pos(i), r = rng(i * 7 + 3);
      const tilt = (r() - 0.5) * 0.08 * (1 - 0.3 * k) + (1 - k) * 0.4, sc = lerp(1.6, 1, k);
      ctx.save(); ctx.translate(p.x + cw / 2, p.y + ch / 2 + (1 - k) * -120); ctx.rotate(tilt); ctx.scale(sc, sc);
      ctx.globalAlpha = clamp(k * 1.5) * (isYou ? 1 : 1 - 0.75 * dimAll);
      ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 30; ctx.shadowOffsetY = 14;
      ctx.fillStyle = "#f4f1ea"; rr(ctx, -cw / 2 - 10, -ch / 2 - 10, cw + 20, ch + 58, 8); ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.save(); rr(ctx, -cw / 2, -ch / 2, cw, ch, 4); ctx.clip();
      if (isYou) {
        const yg = ctx.createLinearGradient(0, -ch / 2, 0, ch / 2); yg.addColorStop(0, "#2a6f86"); yg.addColorStop(1, "#0b2433"); ctx.fillStyle = yg; ctx.fillRect(-cw / 2, -ch / 2, cw, ch);
        const di = im("img_diver_sil"); if (di) { const dh = ch * 0.85, dw = dh * di.naturalWidth / di.naturalHeight; ctx.globalAlpha *= 0.95; ctx.drawImage(di, -dw / 2, -dh / 2, dw, dh); }
      } else {
        const ph = im(o.cards[i].img);
        if (ph) { const s2 = Math.max(cw / ph.naturalWidth, ch / ph.naturalHeight) * (1 + 0.04 * (t - tc)); ctx.drawImage(ph, -ph.naturalWidth * s2 / 2, -ph.naturalHeight * s2 / 2, ph.naturalWidth * s2, ph.naturalHeight * s2); }
      }
      ctx.restore();
      ctx.fillStyle = isYou ? "#c0392b" : "#1d2a30"; ctx.font = "bold 34px 'League Gothic', Impact, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(isYou ? "YOU" : o.cards[i].label, 0, ch / 2 + 38);
      ctx.restore();
    }
    ctx.restore();
    DP.vignette(ctx, 0.55);
  };

  // ================= the view from below: bright surface, silhouettes, an orca gliding under =================
  // o.items = [{kind: "seal"|"surfer"|"kayak"|"boat", x, s (scale), t0, label}], o.orcas = [...], o.window (Snell's window centre x)
  function surferSil(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#06121a";
    ctx.beginPath(); ctx.ellipse(0, 0, 150, 22, 0, 0, 6.283); ctx.fill();                                 // board
    ctx.beginPath(); ctx.ellipse(10, 8, 80, 24, 0, 0, 6.283); ctx.fill();                                 // body lying on it
    ctx.beginPath(); ctx.arc(95, 4, 20, 0, 6.283); ctx.fill();                                            // head
    for (const sgn of [-1, 1]) {                                                                          // paddling arms
      const a = Math.sin(t * 3 + (sgn > 0 ? 0 : Math.PI)) * 0.6;
      ctx.save(); ctx.translate(60, 14 * sgn); ctx.rotate(1.2 * sgn + a * 0.4); ctx.fillRect(0, -7, 85, 14); ctx.restore();
    }
    ctx.fillRect(-90, 10, 100, 12); ctx.fillRect(-95, -2, 100, 12);                                       // legs
    ctx.restore();
  }
  function kayakSil(ctx, x, y, s, t) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#06121a";
    ctx.beginPath(); ctx.moveTo(-230, 0); ctx.quadraticCurveTo(0, 34, 230, 0); ctx.quadraticCurveTo(0, -10, -230, 0); ctx.fill();
    const a = Math.sin(t * 1.6) * 0.5; ctx.save(); ctx.rotate(a); ctx.fillRect(-140, -4, 280, 8); ctx.fillRect(-160, -14, 28, 28); ctx.fillRect(132, -14, 28, 28); ctx.restore();
    ctx.restore();
  }
  function boatSil(ctx, x, y, s, t, rudA) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s); ctx.fillStyle = "#081820";
    ctx.beginPath(); ctx.moveTo(-420, 0); ctx.quadraticCurveTo(-60, 80, 380, 0); ctx.closePath(); ctx.fill();   // hull
    ctx.beginPath(); ctx.moveTo(-60, 40); ctx.lineTo(-20, 230); ctx.lineTo(60, 230); ctx.lineTo(60, 40); ctx.fill();   // keel
    ctx.save(); ctx.translate(300, 20); ctx.rotate(rudA || 0); ctx.fillRect(-14, 0, 28, 160); ctx.restore();      // rudder
    ctx.restore();
  }
  SC.below = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    const sy = o.sy ?? 250;                                                     // the surface line seen from below
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#9fd8ea"); g.addColorStop(sy / H, "#4aa3c2"); g.addColorStop(0.55, "#145a75"); g.addColorStop(1, "#03141d");
    ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
    const wx = o.window ?? 960;                                                  // Snell's window: the bright disc overhead
    const sw = ctx.createRadialGradient(wx, sy - 200, 50, wx, sy - 200, 900);
    sw.addColorStop(0, "rgba(255,255,255,0.85)"); sw.addColorStop(0.4, "rgba(220,245,255,0.35)"); sw.addColorStop(1, "rgba(220,245,255,0)");
    ctx.fillStyle = sw; ctx.fillRect(-200, -200, W + 400, H + 400);
    // rippling caustic band along the underside of the surface
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    const r = rng(4);
    for (let i = 0; i < 140; i++) { const x = (r() * (W + 400) + t * 25 * (0.5 + r())) % (W + 400) - 200, y = sy + (r() - 0.5) * 40; ctx.fillStyle = `rgba(255,255,255,${0.06 + 0.1 * r()})`; ctx.fillRect(x, y, 30 + r() * 80, 2); }
    OC.rays(ctx, t, 0.9, sy, wx);
    ctx.restore();
    // silhouettes at the surface
    for (const it of o.items || []) {
      if (it.t0 !== undefined && t < it.t0) continue;
      const a = it.t0 !== undefined ? smooth(it.t0, it.t0 + 0.6, t) : 1, x = (it.x ?? 960) + (it.vx ?? 0) * t, y = sy + (it.dy ?? 8) + Math.sin(t * 1.2 + x) * 3;
      ctx.save(); ctx.globalAlpha = a;
      if (it.kind === "seal") {
        const s = im("img_harbor_seal");
        if (s) { const w2 = 470 * (it.s ?? 1), h2 = w2 * s.naturalHeight / s.naturalWidth; DP.beast(ctx, t, { img: "img_harbor_seal", key: "seal_sil", x, y: y + h2 * 0.25, len: w2, headRight: true, amp: 0.02, beat: 0.6, sil: 0.92, flip: it.flip, alpha: a }); }
      } else if (it.kind === "surfer") surferSil(ctx, x, y + 14, 1.45 * (it.s ?? 1), t);
      else if (it.kind === "kayak") kayakSil(ctx, x, y + 6, it.s ?? 1, t);
      else if (it.kind === "boat") boatSil(ctx, x, y, it.s ?? 1, t, it.rud ? Math.sin(Math.max(0, t - it.rud) * 6) * 0.35 * smooth(it.rud, it.rud + 0.5, t) : 0);
      ctx.restore();
    }
    for (const h of o.orcas || []) orca(ctx, t, { fog: [20, 70, 95, 0.25], ...h });
    DP.snow(ctx, t, { count: 140, rise: 1, drift: 8, near: 8, alpha: 0.6, seed: 19 });
    ctx.restore(); DP.vignette(ctx, 0.5);
  };

  // ================= sonar vision: an echolocation sweep reveals what's inside =================
  // o.target = "seal" | "human"; o.t0 sweep start; the image is drawn as a glowing cyan X-ray with inner features
  SC.sonar = (ctx, t, o) => {
    ctx.fillStyle = "#020a0f"; ctx.fillRect(0, 0, W, H);
    // faint grid like a sonar display
    ctx.strokeStyle = "rgba(60,200,220,0.07)"; ctx.lineWidth = 1;
    for (let x = 0; x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
    for (let y = 0; y < H; y += 80) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
    const ox = o.ox ?? 140, oy = o.oy ?? 540;
    // the clicks: rings leaving the orca's head on the left
    for (let k = 0; k < 30; k++) OC.click(ctx, t, ox, oy, (o.t0 ?? 0.3) + k * 0.6, { dir: 0, spread: 0.55, speed: 1100, life: 1.6, width: 3, color: "rgba(120,240,255,0.55)" });
    // the sweep line position: everything left of it has been "seen"
    const sx = lerp(ox, W + 100, clamp((t - (o.t0 ?? 0.3)) / 1.6));
    const tx = o.tx ?? 1100, ty = o.ty ?? 540;
    const img = im(o.target === "human" ? "img_diver_sil" : "img_harbor_seal");
    if (img) {
      const w2 = o.target === "human" ? 560 : 820, h2 = w2 * img.naturalHeight / img.naturalWidth;
      const L = DP.buf("son_" + o.target, w2 + 40, h2 + 40), c = L.getContext("2d");
      c.globalCompositeOperation = "source-over"; c.clearRect(0, 0, L.width, L.height); c.drawImage(img, 20, 20, w2, h2);
      c.globalCompositeOperation = "source-in"; c.fillStyle = "rgba(40,190,220,0.35)"; c.fillRect(0, 0, L.width, L.height);
      ctx.save(); ctx.beginPath(); ctx.rect(0, 0, sx, H); ctx.clip();
      ctx.globalCompositeOperation = "lighter";
      ctx.filter = "blur(10px)"; ctx.drawImage(L, tx - L.width / 2, ty - L.height / 2); ctx.filter = "none";
      ctx.drawImage(L, tx - L.width / 2, ty - L.height / 2);
      const pulse = 0.6 + 0.4 * Math.sin(t * 4);
      if (o.target === "seal") {        // a thick even layer of blubber: warm outer band around a darker core
        const B = DP.buf("son_bl", L.width, L.height), b = B.getContext("2d");
        b.globalCompositeOperation = "source-over"; b.clearRect(0, 0, B.width, B.height); b.drawImage(L, 0, 0);
        b.globalCompositeOperation = "source-in"; b.fillStyle = `rgba(255,180,80,${0.75 * pulse})`; b.fillRect(0, 0, B.width, B.height);
        ctx.globalCompositeOperation = "lighter"; ctx.drawImage(B, tx - B.width / 2, ty - B.height / 2);
        const C = DP.buf("son_core", L.width, L.height), cc = C.getContext("2d");
        cc.globalCompositeOperation = "source-over"; cc.clearRect(0, 0, C.width, C.height); cc.drawImage(L, 0, 0);
        cc.globalCompositeOperation = "source-in"; cc.fillStyle = "rgba(6,40,52,1)"; cc.fillRect(0, 0, C.width, C.height);
        ctx.globalCompositeOperation = "source-over"; const k2 = 0.8;
        ctx.drawImage(C, tx - C.width * k2 / 2, ty - C.height * k2 / 2, C.width * k2, C.height * k2);
      } else {                          // a human: dense bones (lines) and air in odd places (lungs glowing)
        ctx.strokeStyle = `rgba(230,250,255,${0.7 * pulse})`; ctx.lineWidth = 6; ctx.lineCap = "round";
        const bx = tx - w2 / 2, by = ty - h2 / 2, P = (u, v) => [bx + u * w2, by + v * h2];
        for (const [a, b2] of [[[0.47, 0.18], [0.36, 0.55]], [[0.36, 0.55], [0.18, 0.8]], [[0.36, 0.55], [0.1, 0.92]], [[0.45, 0.25], [0.7, 0.42]], [[0.45, 0.25], [0.3, 0.12]]]) {
          ctx.beginPath(); ctx.moveTo(...P(...a)); ctx.lineTo(...P(...b2)); ctx.stroke();
        }
        for (const [u, v] of [[0.43, 0.3], [0.5, 0.33]]) { const [x, y] = P(u, v); const lg = ctx.createRadialGradient(x, y, 0, x, y, 40); lg.addColorStop(0, `rgba(255,120,120,${0.8 * pulse})`); lg.addColorStop(1, "rgba(255,120,120,0)"); ctx.fillStyle = lg; ctx.fillRect(x - 40, y - 40, 80, 80); }
      }
      ctx.restore();
    }
    // the sweep line
    ctx.fillStyle = "rgba(120,240,255,0.35)"; ctx.fillRect(sx - 2, 0, 4, H);
    const sg = ctx.createLinearGradient(sx - 160, 0, sx, 0); sg.addColorStop(0, "rgba(120,240,255,0)"); sg.addColorStop(1, "rgba(120,240,255,0.12)"); ctx.fillStyle = sg; ctx.fillRect(sx - 160, 0, 160, H);
    // scanlines
    ctx.fillStyle = "rgba(0,0,0,0.18)"; for (let y = 0; y < H; y += 4) ctx.fillRect(0, y, W, 1);
    DP.vignette(ctx, 0.7);
  };

  // ================= the tank: a bare concrete pool, flat light, one orca circling =================
  SC.tank = (ctx, t, o) => {
    ctx.save(); DP.cam(ctx, t, o.d, o.cam);
    const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#9fc4cc"); g.addColorStop(1, "#4d7b86"); ctx.fillStyle = g; ctx.fillRect(-200, -200, W + 400, H + 400);
    // painted wall tiles and the pool floor in perspective
    ctx.strokeStyle = "rgba(255,255,255,0.12)"; ctx.lineWidth = 2;
    for (let x = -200; x < W + 200; x += 120) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 720); ctx.stroke(); }
    for (let y = 0; y < 720; y += 120) { ctx.beginPath(); ctx.moveTo(-200, y); ctx.lineTo(W + 200, y); ctx.stroke(); }
    ctx.fillStyle = "#6f9aa3"; ctx.beginPath(); ctx.moveTo(-200, 720); ctx.lineTo(W + 200, 720); ctx.lineTo(W + 200, H + 200); ctx.lineTo(-200, H + 200); ctx.fill();
    for (let k = 0; k < 9; k++) { const x = lerp(-600, W + 600, k / 8); ctx.beginPath(); ctx.moveTo(lerp(-200, W + 200, k / 8), 720); ctx.lineTo(x, H + 200); ctx.stroke(); }
    // a drain grate and the shadow of the viewing window frame
    ctx.fillStyle = "rgba(40,60,66,0.5)"; ctx.fillRect(900, 880, 120, 40);
    ctx.save(); ctx.globalCompositeOperation = "lighter"; const r = rng(2);
    for (let i = 0; i < 60; i++) { const x = (r() * W + t * 20) % W, y = 720 + r() * 360; ctx.fillStyle = `rgba(255,255,255,${0.05 + 0.06 * r()})`; ctx.beginPath(); ctx.ellipse(x, y, 30 + r() * 60, 4, 0, 0, 6.283); ctx.fill(); }
    ctx.restore();
    // one orca circling: crosses one way, turns, comes back smaller (far side)
    const ph = (t * (o.speed ?? 0.12)) % 1, far = ph > 0.5, k = far ? (ph - 0.5) * 2 : ph * 2;
    orca(ctx, t, { v: o.v || "a", len: far ? 520 : 820, x: far ? lerp(W + 300, -300, k) : lerp(-400, W + 400, k), y: far ? 430 : 560, flip: far, fog: far ? [120, 160, 170, 0.35] : undefined, beat: 0.35, k: far ? "f" : "n" });
    ctx.restore(); DP.vignette(ctx, 0.45);
    ctx.fillStyle = "rgba(160,190,195,0.12)"; ctx.fillRect(0, 0, W, H);   // flat, cold light
  };
})();
