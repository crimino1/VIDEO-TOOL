// Vertical (1080x1920) flat scenes for the orca short. Each VS.name(ctx, t, o) is a pure function of t (seconds from the scene start).
const VS = {};
(() => {
  const { orca, orcaPt, shark, sharkPt, smooth, clamp, lerp, rng, trace, fill, vgrad, ell, circ, line } = FL;
  const VW = 1080, VH = 1920, TAU = Math.PI * 2;
  const font = (w, s) => `${w} ${s}px Fredoka, sans-serif`;

  function water(ctx, t, cols, raysA = 0.16) {
    ctx.fillStyle = vgrad(ctx, 0, VH, cols); ctx.fillRect(-200, -200, VW + 400, VH + 400);
    for (let i = 0; i < 5; i++) {   // soft light shafts from the surface
      const x = 80 + i * 230 + Math.sin(t * 0.4 + i * 2.1) * 30, w1 = 30 + (i % 3) * 25, w2 = 120 + (i % 2) * 90;
      const g = ctx.createLinearGradient(0, 0, 0, VH * 0.85); g.addColorStop(0, `rgba(210,245,255,${raysA})`); g.addColorStop(1, "rgba(210,245,255,0)");
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(x - w1, -50); ctx.lineTo(x + w1, -50); ctx.lineTo(x - 160 + w2, VH * 0.85); ctx.lineTo(x - 160 - w2, VH * 0.85); ctx.closePath(); ctx.fill();
    }
    const r = rng(7); ctx.fillStyle = "rgba(255,255,255,0.32)";   // marine snow
    for (let i = 0; i < 70; i++) { const x = ((r() * 1300 - t * (5 + r() * 9)) % 1300 + 1300) % 1300 - 110, y = ((r() * 2100 + t * (4 + r() * 6)) % 2100) - 90; ctx.beginPath(); ctx.arc(x, y, 1.6 + r() * 2.6, 0, TAU); ctx.fill(); }
  }
  function chip(ctx, x, y, txt, a, col = "rgba(8,32,52,0.78)", fg = "#ffffff", size = 54) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a; ctx.font = font(700, size); const w = ctx.measureText(txt).width + 64, h = size + 40;
    ctx.translate(0, (1 - a) * 24); ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2); ctx.fill();
    ctx.fillStyle = fg; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(txt, x, y + 2); ctx.restore();
  }
  function meter(ctx, x, y, w, label, v, a, col) {
    if (a <= 0) return;
    ctx.save(); ctx.globalAlpha = a;
    ctx.fillStyle = "rgba(8,32,52,0.78)"; ctx.beginPath(); ctx.roundRect(x, y, w, 170, 34); ctx.fill();
    ctx.font = font(600, 38); ctx.fillStyle = "#bfe9f7"; ctx.fillText(label, x + 36, y + 58);
    ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.beginPath(); ctx.roundRect(x + 36, y + 90, w - 72, 46, 23); ctx.fill();
    ctx.fillStyle = col; ctx.beginPath(); ctx.roundRect(x + 36, y + 90, Math.max(46, (w - 72) * v), 46, 23); ctx.fill();
    ctx.restore();
  }

  // Flat ocean sunfish (Mola), facing left, body about 500 units long. o: {x, y, len, ang, wig}
  const MOLA = {
    body: "M -250 0 C -250 -120 -170 -205 -40 -215 C 90 -222 190 -175 235 -95 C 262 -40 262 40 235 95 C 190 175 90 222 -40 215 C -170 205 -250 120 -250 0 Z",
    dorsal: "M 40 -190 C 70 -300 110 -420 150 -500 C 200 -420 215 -300 200 -150 Z",
    anal: "M 40 190 C 70 300 110 420 150 500 C 200 420 215 300 200 150 Z",
    clavus: "M 225 -120 C 275 -110 285 -70 265 -40 C 300 -20 300 20 265 40 C 285 70 275 110 225 120 Z",
    belly: "M -250 20 C -230 120 -150 200 -40 215 C 90 222 190 175 235 95 C 245 70 250 50 252 30 Z",
    pec: "M -40 -10 C -10 -40 30 -40 40 -5 C 30 20 -10 20 -40 -10 Z",
  };
  function mola(ctx, t, o) {
    const k = (o.len ?? 500) / 500, wig = o.wig ?? 1;
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.ang ?? 0); ctx.scale(k, k);
    const fl = Math.sin(t * 2.6) * 0.12 * wig;   // dorsal and anal fins sweep in turn
    ctx.save(); ctx.translate(150, -180); ctx.rotate(fl); ctx.translate(-150, 180); fill(ctx, MOLA.dorsal, "#7f8f9c"); ctx.restore();
    ctx.save(); ctx.translate(150, 180); ctx.rotate(-fl); ctx.translate(-150, -180); fill(ctx, MOLA.anal, "#7f8f9c"); ctx.restore();
    fill(ctx, MOLA.clavus, "#8b9ba7");
    fill(ctx, MOLA.body, "#a9b8c3");
    ctx.save(); trace(ctx, MOLA.body); ctx.clip(); fill(ctx, MOLA.belly, "#dfe7ec");
    ctx.fillStyle = "rgba(255,255,255,0.18)"; for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(-120 + (i % 3) * 110, -110 + Math.floor(i / 3) * 90, 26, 0, TAU); ctx.fill(); }
    ctx.restore();
    ctx.save(); ctx.translate(-30, 0); ctx.rotate(Math.sin(t * 5) * 0.25 * wig); fill(ctx, MOLA.pec, "#8b9ba7"); ctx.restore();
    circ(ctx, -165, -45, 24, "#ffffff"); circ(ctx, -168, -45, 15, "#0b0f14"); circ(ctx, -173, -51, 5, "#ffffff");
    ell(ctx, -246, 8, 14, 18, 0, "#5d6b76");
    ctx.restore();
  }

  // 1. "which sends it into a trance": an orca nudges the shark belly-up; its muscle tension drains away
  VS.trance = (ctx, t, o) => {
    const d = o.d || 1.6;
    water(ctx, t, ["#2c9fd6", "#14639f", "#082f5a"]);
    const roll = smooth(0.02, 0.32, t) * Math.PI, calm = smooth(0.4, d, t);
    const sx = 560, sy = 900 + Math.sin(t * 6) * 10 * (1 - calm);
    // the orca rises under the shark and holds it there with its snout
    const oo = { x: 520 - (1 - smooth(0, 0.8, t)) * 120, y: 1190, len: 820, dir: 1, ang: -0.32, beat: 0.9 };
    orca(ctx, t, oo);
    shark(ctx, t, { x: sx, y: sy, len: 860, dir: -1, roll, ang: Math.sin(t * 5) * 0.06 * (1 - calm), beat: 0, ph: t * TAU * lerp(2, 0, calm), amp: lerp(0.05, 0.003, calm) });
    chip(ctx, VW / 2, 330, "TONIC IMMOBILITY", smooth(0.15, 0.5, t));
    meter(ctx, 140, 1560, 800, "SHARK MUSCLE TENSION", lerp(1, 0.06, calm), smooth(0.1, 0.4, t), calm > 0.6 ? "#7fd6a0" : "#ff8a5c");
  };

  // 2. "then they go straight for its liver": x-ray shark, the liver lights up, an orca closes in on it
  VS.liver = (ctx, t, o) => {
    const d = o.d || 2.1;
    ctx.fillStyle = vgrad(ctx, 0, VH, ["#123e5c", "#0c2c45", "#071a2b"]); ctx.fillRect(-200, -200, VW + 400, VH + 400);
    ctx.strokeStyle = "rgba(120,200,240,0.08)"; ctx.lineWidth = 2;
    for (let x = 0; x <= VW; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, VH); ctx.stroke(); }
    for (let y = 0; y <= VH; y += 90) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(VW, y); ctx.stroke(); }
    const zoom = lerp(1, 1.08, t / d); ctx.save(); ctx.translate(VW / 2, 860); ctx.scale(zoom, zoom); ctx.translate(-VW / 2, -860);
    const so = { x: 560, y: 860, len: 1000, dir: 1, beat: 0.4, amp: 0.012 }, lv = smooth(0.2, 0.8, t);
    ctx.save(); ctx.globalAlpha = 0.55; shark(ctx, t, so); ctx.restore();
    const clear = { top: "rgba(0,0,0,0)", base: "rgba(0,0,0,0)", under: "rgba(0,0,0,0)" };
    ctx.save(); ctx.shadowColor = "rgba(255,170,80,0.9)"; ctx.shadowBlur = 50 * lv; shark(ctx, t, { ...so, ...clear, liver: lv }); ctx.restore();
    const p = sharkPt(so, 400, 25), pu = 1 + 0.08 * Math.sin(t * 7);
    if (lv > 0.05) { ctx.beginPath(); ctx.arc(p[0], p[1], 190 * pu, 0, TAU); ctx.setLineDash([22, 16]); ctx.lineWidth = 7; ctx.strokeStyle = `rgba(255,190,110,${lv})`; ctx.stroke(); ctx.setLineDash([]); }
    ctx.restore();
    // the orca's path: in from below, aimed at the liver
    const k = smooth(0.6, d, t);
    if (k > 0) { ctx.save(); ctx.globalAlpha = 0.95; orca(ctx, t, { x: lerp(-300, 360, k), y: lerp(1750, 1330, k), len: 700, dir: 1, ang: -0.55, beat: 1.4 }); ctx.restore(); }
    chip(ctx, VW / 2, 330, "LIVER", smooth(0.3, 0.6, t), "rgba(240,140,60,0.92)");
    // share of body weight
    const u = smooth(0.7, 1.6, t);
    if (u > 0) {
      ctx.save(); ctx.globalAlpha = smooth(0.6, 0.9, t);
      ctx.font = font(700, 50); ctx.fillStyle = "#ffd9a8"; ctx.textAlign = "center"; ctx.fillText("UP TO 25% OF ITS BODY WEIGHT", VW / 2, 470);
      ctx.fillStyle = "rgba(255,255,255,0.14)"; ctx.beginPath(); ctx.roundRect(190, 510, 700, 46, 23); ctx.fill();
      ctx.fillStyle = "#f08c3c"; ctx.beginPath(); ctx.roundRect(190, 510, Math.max(46, 700 * 0.25 * u), 46, 23); ctx.fill();
      ctx.restore();
    }
  };

  // 3. "one orca holds a sunfish still, and another rams it at full speed"; o.hit = impact time
  VS.sunfish = (ctx, t, o) => {
    const d = o.d || 4.3, hit = o.hit ?? 3.5;
    const shake = t > hit ? Math.exp(-(t - hit) * 7) * 22 : 0;
    ctx.save(); ctx.translate(Math.sin(t * 70) * shake, Math.cos(t * 63) * shake);
    water(ctx, t, ["#36b4e6", "#1a80c2", "#0c4f88"], 0.2);
    const jolt = t > hit ? smooth(hit, hit + 0.25, t) : 0;
    const mx = 600 + jolt * 70, my = 860 + Math.sin(t * 1.7) * 10 + jolt * 30, mang = 0.08 * Math.sin(t * 2) + jolt * 0.25;
    // orca A grips the sunfish's lower fin from below
    const fin = [mx + 150 * 0.85, my + 470 * 0.85];
    const A = { x: 0, y: 0, len: 760, dir: 1, ang: -0.95, beat: 0.5, amp: 0.03 };
    { const s = orcaPt({ ...A, x: 0, y: 0 }, 0, 25); A.x = fin[0] - s[0] + Math.sin(t * 3) * 6; A.y = fin[1] - s[1] + 20; }
    orca(ctx, t, A);
    mola(ctx, t, { x: mx, y: my, len: 420, ang: mang, wig: t < hit ? 1.4 : 0.3 });
    // orca B charges down from the top left; its snout reaches the sunfish's flank at t = hit
    const tgt = [mx - 222, my - 40], from = [-120, 60];
    const B = { len: 800, dir: 1, ang: 0.62, beat: 2.2, amp: 0.06 };
    const kb = clamp((t - (hit - 1.5)) / 1.5, 0, 1.05), kk = kb * kb * (3 - 2 * Math.min(kb, 1)) ;
    const sn = orcaPt({ ...B, x: 0, y: 0 }, 0, 20), bx = lerp(from[0], tgt[0], kk) - sn[0], by = lerp(from[1], tgt[1], kk) - sn[1];
    if (kb > 0) {
      if (t < hit) for (let i = 0; i < 6; i++) {   // speed lines behind it
        const q = orcaPt({ ...B, x: bx, y: by }, 700 + i * 40, -120 + i * 50); line(ctx, [q, [q[0] - 260 * Math.cos(B.ang), q[1] - 260 * Math.sin(B.ang)]], 6, "rgba(255,255,255,0.45)");
      }
      orca(ctx, t, { ...B, x: bx, y: by });
    }
    // impact: flash ring and burst of bubbles
    if (t > hit) {
      const u = t - hit, a = Math.max(0, 1 - u / 0.6);
      ctx.beginPath(); ctx.arc(tgt[0], tgt[1], 60 + u * 700, 0, TAU); ctx.lineWidth = 16 * a + 2; ctx.strokeStyle = `rgba(255,255,255,${a})`; ctx.stroke();
      const r = rng(11); for (let i = 0; i < 40; i++) { const an = r() * TAU, sp = 300 + r() * 600, s = 6 + r() * 16; circ(ctx, tgt[0] + Math.cos(an) * sp * u, tgt[1] + Math.sin(an) * sp * u - u * 120, s * (1 - u * 0.4), `rgba(255,255,255,${0.7 * Math.max(0, 1 - u)})`); }
    }
    ctx.restore();
    chip(ctx, VW / 2, 300, "ONE ORCA HOLDS IT", smooth(0.15, 0.5, t) * (1 - smooth(hit - 1.4, hit - 1.1, t)));
    chip(ctx, VW / 2, 300, "ANOTHER RAMS IT", smooth(hit - 1.1, hit - 0.8, t), "rgba(225,70,60,0.92)");
  };
})();
