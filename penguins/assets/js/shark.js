// Flat cartoon great white shark for the flat rig. Drawn facing left in a 1000-unit body, mirrored for dir=+1.
(() => {
  const { trace, fill, ell, circ, line, clamp } = FL;
  const S = {
    body: "M 0 12 C 8 -30 60 -64 150 -80 C 280 -102 420 -104 540 -86 C 650 -70 740 -42 822 -24 L 862 -26 C 902 -72 952 -132 1008 -182 C 994 -112 972 -50 952 -6 C 972 30 992 70 1002 106 C 962 82 906 42 864 24 L 822 26 C 740 44 640 72 520 84 C 380 96 240 90 140 72 C 60 58 10 42 0 12 Z",
    belly: "M 14 34 C 70 44 140 40 196 32 L 222 44 L 252 30 L 290 42 L 330 28 C 420 32 520 44 600 36 L 648 46 C 700 42 760 36 830 26 L 840 240 L -20 240 Z",
    fin: "M 352 -98 C 392 -172 424 -232 446 -266 C 468 -212 500 -142 564 -88 Z",
    fin2: "M 752 -46 L 774 -76 L 798 -38 Z",
    pelvic: "M 596 78 L 632 116 L 660 74 Z",
    pec: "M 232 58 C 272 120 326 182 408 222 C 396 160 356 100 322 60 Z",
    mouth: "M 34 34 Q 110 58 196 38",
    jaw: "M 30 36 C 70 60 140 74 200 54 L 196 40 Q 110 58 34 34 Z",
  };
  // o: {x, y, len, dir, ang, beat, amp, ph, open (0..1 jaw), belly (true = upside-down roll handled by ang), pale}
  FL.shark = (ctx, t, o) => {
    const k = (o.len ?? 600) / 1000, dir = o.dir ?? 1, ph = t * Math.PI * 2 * (o.beat ?? 0.9) + (o.ph ?? 0), amp = o.amp ?? 0.03;
    const wv = (x, y) => { const u = clamp(x / 1000, 0, 1.05); return [x, y + amp * 1000 * Math.sin(ph - u * 4.6) * u * u]; };
    // the tail sweeps side to side: in side view the lobes get narrower and wider
    const sweep = 0.75 + 0.25 * Math.cos(ph);
    const tail = (x, y) => { const p = wv(x, y); if (x > 850) p[0] = 850 + (x - 850) * sweep; return p; };
    ctx.save(); ctx.translate(o.x, o.y); ctx.rotate(o.ang ?? 0); ctx.scale(-dir * k, k * (o.roll ? Math.cos(o.roll) : 1)); ctx.translate(-470, 0);
    const top = o.top || "#6f8597", base = o.base || "#526779", under = o.under || "#f2f5f7";
    ctx.save(); ctx.translate(26, -4); fill(ctx, S.pec, "#3d4f5f", wv); ctx.restore();
    fill(ctx, S.fin, top, wv); fill(ctx, S.body, top, tail); fill(ctx, S.fin2, top, wv);
    ctx.save(); trace(ctx, S.body, tail); trace(ctx, S.fin, wv, false); ctx.clip();
    ctx.save(); ctx.translate(-6, 14); fill(ctx, S.body, base, tail); fill(ctx, S.fin, base, wv); ctx.restore();
    ctx.restore();
    ctx.save(); trace(ctx, S.body, tail); ctx.clip();
    fill(ctx, S.belly, under, wv);
    ctx.save(); ctx.translate(0, 24); fill(ctx, S.belly, "#d5dfe6", wv); ctx.restore();
    ctx.restore();
    fill(ctx, S.pelvic, base, wv);
    // gills
    for (let i = 0; i < 5; i++) { const x = 238 + i * 17; const a = wv(x, -42), b = wv(x - 8, 6), c = wv(x + 4, 40); ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.quadraticCurveTo(b[0], b[1], c[0], c[1]); ctx.lineWidth = 6; ctx.strokeStyle = "rgba(30,44,56,0.55)"; ctx.lineCap = "round"; ctx.stroke(); }
    // mouth: closed line, or an open jaw with teeth
    const op = o.open ?? 0;
    if (op > 0.02) {
      ctx.save(); const hinge = wv(196, 40); ctx.translate(hinge[0], hinge[1]); ctx.rotate(-op * 0.35 * -1); ctx.translate(-hinge[0], -hinge[1]);
      fill(ctx, S.jaw, "#7a2f36", wv);
      for (let i = 0; i < 7; i++) { const x = 46 + i * 21, p = wv(x, 44 + i * 1.5); trace(ctx, `M ${p[0] - 7} ${p[1]} L ${p[0]} ${p[1] - 14} L ${p[0] + 7} ${p[1]} Z`); ctx.fillStyle = "#ffffff"; ctx.fill(); }
      ctx.restore();
      for (let i = 0; i < 7; i++) { const x = 44 + i * 21, p = wv(x, 34 + i * 0.6); trace(ctx, `M ${p[0] - 7} ${p[1]} L ${p[0]} ${p[1] + 14} L ${p[0] + 7} ${p[1]} Z`); ctx.fillStyle = "#ffffff"; ctx.fill(); }
    }
    trace(ctx, S.mouth, wv); ctx.lineWidth = 5; ctx.strokeStyle = "#26323d"; ctx.lineCap = "round"; ctx.stroke();
    { const [ex, ey] = wv(96, -20); circ(ctx, ex, ey, 11, "#0b0f14"); circ(ctx, ex - 3, ey - 4, 3.5, "#ffffff"); }
    { const [nx, ny] = wv(30, -6); circ(ctx, nx, ny, 4, "rgba(20,30,40,0.5)"); }
    fill(ctx, S.pec, base, wv);
    if (o.liver) {   // see-through liver: a big orange organ along the belly
      const a = o.liver;
      trace(ctx, "M 240 10 C 300 -20 420 -26 520 -6 C 560 10 560 40 520 56 C 420 76 300 70 250 50 C 220 40 220 22 240 10 Z", wv);
      ctx.fillStyle = `rgba(240,140,60,${0.92 * a})`; ctx.fill();
      trace(ctx, "M 270 14 C 330 -6 420 -10 500 4", wv); ctx.lineWidth = 6; ctx.strokeStyle = `rgba(255,214,150,${0.8 * a})`; ctx.stroke();
    }
    ctx.restore();
  };
  FL.sharkPt = (o, bx, by = 0) => { const k = (o.len ?? 600) / 1000, dir = o.dir ?? 1, a = o.ang ?? 0; const lx = -dir * k * (bx - 470), ly = k * by; return [o.x + lx * Math.cos(a) - ly * Math.sin(a), o.y + lx * Math.sin(a) + ly * Math.cos(a)]; };
})();
