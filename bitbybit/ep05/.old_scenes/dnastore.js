/* EP4 Builder D: DNA data storage (2017). Documentary palette PX.D only; shades are derived with mix(). */
(function () {
  const { K, D } = PX;
  const R = PX.rect;

  // ---------- colour helpers (derive everything from PX.D) ----------
  const H2 = (c) => c.match(/\w\w/g).map((v) => parseInt(v, 16));
  const mix = (a, b, k) => { const A = H2(a), B = H2(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * k).toString(16).padStart(2, "0")).join(""); };
  const dk = (c, k) => mix(c, D.n0, k);
  const lt = (c, k) => mix(c, D.cream, k);
  const WOOD = [mix(D.lampD, D.rust[2], 0.4), mix(D.rust[2], D.amber[2], 0.4), mix(D.rust[2], D.n1, 0.5)];
  const SKIN = [mix(D.rose[0], D.amber[1], 0.35), mix(D.rose[1], D.amber[2], 0.5), mix(D.rose[2], D.amber[2], 0.6)];
  const BEIGE = [mix(D.paper, D.paperD, 0.4), mix(D.paperD, D.n4, 0.38), mix(D.paperD, D.n3, 0.68), mix(D.n3, D.n2, 0.4)];   // old plastic
  const COAT = [lt(D.cream, 0.4), D.cream, mix(D.cream, D.n6, 0.45), mix(D.n6, D.n4, 0.4)];
  const MAPLE = [lt(D.paper, 0.1), mix(D.paperD, D.lampD, 0.45), mix(D.lampD, D.rust[2], 0.55)];
  const SH = (a) => `rgba(0,0,0,${a})`;
  const A = PX.alpha;
  const label = (g, s, x, y, a, col, size) => A(g, a, () => PX.otext(g, s, x, y, { col: col || D.cream, align: "center", outline: D.n0, size: size || 8 }));
  const shadow = (g, x, y, w, h, a) => { // soft oval contact shadow
    for (let i = 0; i < 3; i++) A(g, a * (0.45 + i * 0.25), () => { const k = 1 - i * 0.22; const ww = Math.round(w * k), hh = Math.max(1, Math.round(h * k)); R(g, x + (w - ww) / 2 + 2, y + (h - hh) / 2, ww - 4, hh, SH(0.5)); R(g, x + (w - ww) / 2, y + (h - hh) / 2 + 1, ww, Math.max(1, hh - 2), SH(0.5)); });
  };
  const lampCone = (g, x, y, w0, w1, h, a) => { // faint light cone (pixel rows)
    for (let r = 0; r < h; r += 1) { const w = w0 + (w1 - w0) * (r / h); A(g, a * (1 - r / h) * 0.8, () => R(g, x - w / 2, y + r, w, 1, D.lamp)); }
  };

  // generic night wall with panelling
  const wall = (g, y0, y1, top, bot) => { PX.vgrad(g, 0, y0, 640, y1 - y0, top || D.n2, bot || D.n1, 10); };

  // DNA helix (vertical) between y0..y1 at cx; amp half-width; ph phase; k = 0..1 how much is built (from bottom)
  const helix = (g, cx, y0, y1, t, o) => {
    o = o || {}; const amp = o.amp || 16, per = o.per || 46, k = o.k === undefined ? 1 : o.k, ph = (o.ph || 0) + t * (o.spin === undefined ? 1.2 : o.spin);
    const seq = o.seq || "ACGTTGCAAGCTTCGAGATCCTAG", n = Math.floor((y1 - y0) * k);
    const ys = [];
    for (let i = 0; i <= n; i += 1) {
      const y = y1 - i, a = ph + (i / per) * Math.PI * 2, s = Math.sin(a), cz = Math.cos(a);
      if (i % 7 === 3) ys.push([y, s, cz, Math.floor(i / 7)]);
      for (const sg of [1, -1]) { const x = cx + sg * s * amp, z = sg * cz; R(g, x - 1, y, 3, 1, z > 0 ? D.cream : D.n6); if (z > 0) R(g, x - 1, y, 1, 1, lt(D.cream, 0.6)); }
    }
    for (const [y, s, cz, j] of ys) {
      const b = seq[j % seq.length], pair = { A: "T", T: "A", C: "G", G: "C" }[b];
      const xa = cx - s * amp, xb = cx + s * amp, mid = (xa + xb) / 2;
      const front = Math.abs(s) > 0.2 ? 1 : 0.5;
      A(g, 0.55 + 0.45 * front, () => { R(g, Math.min(xa, mid), y, Math.abs(mid - xa), 2, D.dna[b]); R(g, Math.min(xb, mid), y, Math.abs(xb - mid), 2, D.dna[pair]); });
    }
  };

  // the researcher, close bust (~150 px to the counter): x = centre, y = top of bun; o.brow 0..1, o.look, o.wide (eyes), o.o (mouth O)
  const bust = (g, x, y, t, o) => {
    o = o || {}; const sk = SKIN, hair = [D.n4, D.n2, D.n1];
    const CT = [mix(COAT[1], COAT[2], 0.35), mix(COAT[2], COAT[3], 0.5), COAT[3], mix(COAT[3], D.n2, 0.45)];
    const by = Math.round((Math.sin(t * 1.6) + 1) * 0.5);
    // coat: shoulders widen to the counter
    for (let r = 0; r < 96; r++) { const w = Math.round(30 + 54 * Math.sqrt(Math.min(r + 2, 22) / 22) + r * 0.08), yy = y + 62 + r + by;
      R(g, x - w / 2, yy, w, 1, CT[1]); R(g, x - w / 2, yy, 3, 1, CT[0]); R(g, x + w / 2 - 10, yy, 10, 1, CT[2]); }
    
    // arm seams + shirt V + lapels
    PX.line(g, x - 30, y + 80 + by, x - 34, y + 158, CT[2]); PX.line(g, x + 30, y + 80 + by, x + 34, y + 158, CT[3]);
    for (let r = 0; r < 30; r++) { const w = Math.max(1, 18 - Math.round(r * 0.6)); R(g, x - w / 2, y + 62 + r + by, w, 1, D.teal[2]); }
    R(g, x - 4, y + 62 + by, 8, 2, D.teal[1]);
    for (let r = 0; r < 34; r++) { R(g, x - 10 + Math.round(r * 0.3) - 3, y + 62 + r + by, 3, 1, CT[0]); R(g, x + 10 - Math.round(r * 0.3), y + 62 + r + by, 3, 1, CT[2]); }
    R(g, x + 14, y + 104 + by, 14, 14, CT[2]); R(g, x + 14, y + 104 + by, 14, 1, CT[3]); R(g, x + 17, y + 100 + by, 2, 6, D.steel[1]); R(g, x + 21, y + 101 + by, 2, 5, D.rust[1]);
    // neck
    R(g, x - 7, y + 52, 14, 12 + by, sk[1]); R(g, x - 7, y + 52, 14, 4, sk[2]); R(g, x + 3, y + 52, 4, 12, sk[2]);
    // ears
    R(g, x - 19, y + 34, 4, 10, sk[1]); R(g, x + 15, y + 34, 4, 10, sk[2]); R(g, x - 18, y + 36, 1, 6, sk[2]);
    // face
    for (let r = 0; r < 36; r++) { const w = r < 24 ? 32 : 32 - Math.round((r - 24) * 1.7), yy = y + 20 + r; R(g, x - w / 2, yy, w, 1, sk[1]); R(g, x + w / 2 - 5, yy, 5, 1, sk[2]); R(g, x - w / 2, yy, 2, 1, sk[0]); }
    // hair: bun + cap with side part
    PX.circle(g, x + 3, y + 7, 7, hair[1]); R(g, x - 1, y + 2, 5, 2, hair[0]); R(g, x + 6, y + 9, 3, 2, hair[2]);
    PX.circle(g, x, y + 28, 18, hair[1]);
    for (let r = 0; r < 36; r++) { const w = r < 24 ? 32 : 32 - Math.round((r - 24) * 1.7); if (r > 9) R(g, x - w / 2 + 2, y + 20 + r, w - 4, 1, sk[1]); if (r > 9) R(g, x + w / 2 - 6, y + 20 + r, 4, 1, sk[2]); }
    R(g, x - 16, y + 22, 3, 18, hair[1]); R(g, x + 13, y + 22, 3, 16, hair[2]);
    for (let k = 0; k < 14; k++) R(g, x - 13 + k, y + 29 - Math.round(k * 0.35), 1, 2, hair[1]);   // swept fringe
    R(g, x - 10, y + 14, 12, 1, hair[0]); R(g, x - 13, y + 17, 6, 1, hair[0]);
    // brows / eyes / glasses
    const b = o.brow || 0, bu = Math.round(b * 4), lk = Math.round(o.look || 0), wide = o.wide || 0;
    for (const sg of [-1, 1]) { const ex = x + sg * 7;
      R(g, ex - 4, y + 31 - bu, 8, 2, hair[2]); R(g, sg < 0 ? ex - 5 : ex + 4, y + 32 - Math.round(bu * 0.5), 1, 2, hair[2]);
      const blink = PX.blink(t + 0.4, 4.1, 0.04), eh = blink ? 1 : 3 + Math.round(wide);
      R(g, ex - 3, y + 38 - Math.round(wide * 0.5), 6, eh, blink ? sk[2] : D.cream); if (!blink) { R(g, ex - 1 + lk, y + 38, 2, Math.min(eh, 3), D.ink); }
      PX.box(g, ex - 6, y + 35, 12, 9, D.n1); R(g, ex - 5, y + 36, 1, 1, D.lamp); }
    R(g, x - 1, y + 37, 2, 1, D.n1); R(g, x - 19, y + 37, 1, 2, D.n1); R(g, x + 18, y + 37, 1, 2, D.n1);
    // nose, mouth
    R(g, x + 1, y + 41, 1, 7, sk[2]); R(g, x - 2, y + 47, 4, 1, sk[2]);
    if (o.o) { R(g, x - 2, y + 50, 4, 4, dk(sk[2], 0.5)); R(g, x - 1, y + 51, 2, 2, dk(sk[2], 0.7)); } else { R(g, x - 4, y + 51, 8, 1, dk(sk[2], 0.35)); R(g, x - 3, y + 52, 6, 1, sk[0]); }
  };

  // a soft desk lamp glow + dust
  const dust = (g, t, box, seed, n) => PX.particles(g, seed || 5, n || 22, t, box, { vy: -2.5, vx: 1.5, col: D.lamp, a: 0.45, tw: 1.3 });

  // ===================================================================================================
  // bits_bases (12): printing-house desk; wood type A C G T, bit sorts, ledger A=00 C=01 G=10 T=11
  K.bits_bases = (o) => {
    let KS, T0, T2, TM;
    const B = "ACGT", BITS = ["00", "01", "10", "11"];
    const rr = PX.rnd(41), grain = [...Array(26)].map(() => [rr() * 640, 200 + rr() * 160, 20 + rr() * 90]);
    const drawers = [...Array(40)].map(() => rr());
    return (g, t, d, c) => {
      { const k = d / 12; KS = Math.min(1, k); T0 = o.four ?? 0.5 * k; T2 = o.two ?? 4.5 * k; TM = o.map ?? 7.0 * k; }
      // far: plaster wall, night window, type cabinet
      PX.par(g, c, 0.4, () => {
        wall(g, -20, 210, D.n2, D.n1);
        R(g, 34, 34, 104, 120, dk(WOOD[2], 0.4)); PX.vgrad(g, 40, 40, 92, 108, dk(D.steel[2], 0.25), dk(D.steel[2], 0.55), 6);
        for (let i = 0; i < 9; i++) A(g, 0.5, () => R(g, 44 + ((i * 37) % 84), 46 + ((i * 53) % 60), 1, 1, D.n6));
        R(g, 84, 40, 3, 108, dk(WOOD[2], 0.4)); R(g, 40, 92, 92, 3, dk(WOOD[2], 0.4)); R(g, 30, 152, 112, 5, dk(WOOD[1], 0.45));
        A(g, 0.18, () => { PX.line(g, 48, 44, 70, 88, D.steel[0]); PX.line(g, 92, 98, 110, 140, D.steel[0]); });
        // type cabinet with many shallow drawers
        R(g, 420, 30, 210, 176, dk(WOOD[2], 0.35)); R(g, 420, 30, 210, 2, dk(WOOD[0], 0.45));
        for (let row = 0; row < 10; row++) for (let col = 0; col < 4; col++) {
          const x = 426 + col * 51, y = 36 + row * 17, j = drawers[row * 4 + col];
          R(g, x, y, 48, 14, dk(WOOD[1], 0.62 - j * 0.08)); R(g, x, y, 48, 1, dk(WOOD[0], 0.5)); R(g, x, y + 13, 48, 1, dk(WOOD[2], 0.6));
          R(g, x + 19, y + 5, 10, 4, dk(D.amber[2], 0.5)); R(g, x + 19, y + 5, 10, 1, dk(D.amber[1], 0.45));
          if (j > 0.82) R(g, x + 2, y + 13, 44, 2, dk(WOOD[2], 0.7));
        }
      });
      // mid: drying line with printed sheets, pendant lamp
      PX.par(g, c, 0.65, () => {
        PX.line(g, 150, 64, 400, 70, D.n4);
        for (let i = 0; i < 4; i++) { const x = 168 + i * 58, y = 66 + i * 1.4, sw = Math.round(Math.sin(t * 0.8 + i) * 1);
          R(g, x + sw, y, 34, 44, dk(D.paper, 0.55)); R(g, x + sw, y, 34, 1, dk(D.paper, 0.4));
          for (let l = 0; l < 5; l++) R(g, x + 5 + sw, y + 8 + l * 6, 18 + ((i + l) % 3) * 4, 2, dk(D.ink, 0.1));
          R(g, x + 15 + sw, y - 2, 4, 4, dk(WOOD[1], 0.3)); }
      });
      // pendant lamp
      R(g, 299, -10, 2, 40, D.n4); R(g, 288, 30, 24, 6, D.n4); for (let r = 0; r < 12; r++) { const w = 26 + r * 2.6; R(g, 300 - w / 2, 36 + r, w, 1, r < 2 ? D.n5 : mix(D.n4, D.moss[2], 0.35)); }
      R(g, 270, 36, 4, 1, D.n6); R(g, 284, 48, 32, 2, D.lamp); R(g, 292, 50, 16, 1, lt(D.lamp, 0.5));
      lampCone(g, 300, 50, 54, 330, 160, 0.06);
      // back ledge of the desk: ink bottles, paper stack, type tray
      PX.par(g, c, 0.85, () => {
        R(g, 0, 182, 640, 16, dk(WOOD[2], 0.45)); R(g, 0, 182, 640, 1, dk(WOOD[0], 0.4));
        for (let i = 0; i < 3; i++) { const x = 168 + i * 16; R(g, x, 166, 11, 16, dk(D.teal[2], 0.35 + i * 0.1)); R(g, x + 3, 162, 5, 4, D.n2); R(g, x + 1, 168, 1, 10, dk(D.teal[0], 0.5)); }
        R(g, 232, 170, 46, 12, dk(D.paper, 0.45)); R(g, 234, 166, 44, 4, dk(D.paper, 0.38)); R(g, 232, 170, 46, 1, dk(D.paper, 0.3));
        R(g, 300, 172, 90, 10, dk(WOOD[1], 0.35)); for (let i = 0; i < 8; i++) R(g, 303 + i * 11, 174, 9, 5, dk(WOOD[2], 0.5));
      });
      // desk (dark wood, warm lamp pool)
      const DESK = [mix(WOOD[1], D.n2, 0.35), mix(WOOD[2], D.n2, 0.35), mix(WOOD[2], D.n1, 0.6)];
      R(g, 0, 196, 640, 164, DESK[1]); R(g, 0, 196, 640, 1, DESK[0]); R(g, 0, 197, 640, 3, DESK[2]);
      for (const [gx, gy, gw] of grain) R(g, gx, gy, gw, 1, DESK[2]);
      PX.glow(g, 300, 262, 250, D.lampD, 0.42);
      // props: brayer on an ink slab
      R(g, 498, 318, 112, 22, D.n2); R(g, 498, 318, 112, 1, D.n4); R(g, 504, 322, 80, 14, D.n1); A(g, 0.4, () => R(g, 510, 324, 60, 1, D.n5));
      R(g, 516, 306, 52, 10, D.n3); R(g, 516, 306, 52, 2, D.n5); R(g, 568, 309, 34, 4, DESK[0]); R(g, 568, 309, 34, 1, lt(DESK[0], 0.2));
      // composing stick
      R(g, 18, 316, 150, 12, D.n4); R(g, 18, 316, 150, 1, D.n6); R(g, 18, 316, 5, 20, D.n4); R(g, 23, 318, 143, 8, D.n2);
      for (let i = 0; i < 10; i++) R(g, 26 + i * 9, 318, 8, 8, i % 3 ? D.n5 : D.n6);
      // ledger (right)
      const lx = 380, ly = 208;
      shadow(g, lx - 6, ly + 108, 236, 12, 0.5);
      R(g, lx - 4, ly - 2, 232, 118, dk(D.rust[2], 0.35));
      R(g, lx, ly, 110, 112, D.paper); R(g, lx + 114, ly, 110, 112, D.paper); R(g, lx + 108, ly, 8, 112, D.paperD);
      R(g, lx + 110, ly, 4, 112, dk(D.paperD, 0.15)); R(g, lx, ly, 110, 1, lt(D.paper, 0.4)); R(g, lx + 114, ly, 110, 1, lt(D.paper, 0.4));
      for (let l = 0; l < 9; l++) { R(g, lx + 3, ly + 14 + l * 11, 104, 1, mix(D.paper, D.steel[1], 0.25)); R(g, lx + 117, ly + 14 + l * 11, 104, 1, mix(D.paper, D.steel[1], 0.25)); }
      R(g, lx + 18, ly + 2, 1, 108, mix(D.paper, D.rust[1], 0.4)); R(g, lx + 132, ly + 2, 1, 108, mix(D.paper, D.rust[1], 0.4));
      for (let i = 0; i < 40; i++) A(g, 0.006, () => R(g, lx + 120 + i * 2.6, ly, 224 - 120 - i * 2.6, 112, SH(1)));
      A(g, 0.1, () => R(g, lx, ly, 224, 112, SH(1)));
      // left page: pencil helix sketch + scribbles
      A(g, 0.55, () => { for (let i = 0; i < 70; i++) { const y = ly + 20 + i, a = i / 22 * Math.PI; R(g, lx + 60 + Math.sin(a) * 12, y, 1, 1, D.n4); R(g, lx + 60 - Math.sin(a) * 12, y, 1, 1, D.n4); if (i % 8 === 4) R(g, lx + 60 - Math.abs(Math.sin(a) * 12), y, Math.abs(Math.sin(a) * 24), 1, D.n6); }
        for (let l = 0; l < 3; l++) R(g, lx + 24, ly + 15 + l * 11 + 70, 30 + l * 9, 1, D.n5); });
      // the four blocks
      const bx = (i) => 66 + i * 76, by = 214;
      for (let i = 0; i < 4; i++) {
        const ta = T0 + i * 0.45 * KS, p = PX.p(t, ta, 0.4, "out");
        if (t < ta) continue;
        const x = bx(i), y = Math.round(by - (1 - p) * 16), b = B[i], foc = t >= TM + i * 1.1 * KS && t < TM + i * 1.1 * KS + 1.6;
        A(g, p, () => {
          A(g, 0.5 * p, () => { R(g, x - 2, by + 42, 58, 6, SH(0.6)); R(g, x + 2, by + 47, 52, 2, SH(0.4)); });
          for (let s = 1; s <= 6; s++) { R(g, x + s, y - s, 46, 1, s === 6 ? lt(MAPLE[0], 0.3) : MAPLE[0]); R(g, x + 45 + s, y - s + 1, 1, 46, MAPLE[2]); }
          R(g, x, y, 46, 46, MAPLE[1]); R(g, x, y, 46, 1, lt(MAPLE[0], 0.2)); R(g, x, y, 1, 46, MAPLE[0]); R(g, x, y + 45, 46, 1, MAPLE[2]);
          for (let gq = 0; gq < 4; gq++) R(g, x + 4 + gq * 10, y + 4 + ((gq * 13 + i * 7) % 38), 7, 1, mix(MAPLE[1], MAPLE[2], 0.4));
          const la = PX.p(t, ta + 0.25, 0.4, "out");
          A(g, la, () => { PX.text(g, b, x + 24, y + 9, { size: 32, col: dk(D.dna[b], 0.55), align: "center" }); PX.text(g, b, x + 23, y + 8, { size: 32, col: D.dna[b], align: "center" });
            A(g, 0.5, () => PX.text(g, b, x + 22, y + 7, { size: 32, col: lt(D.dna[b], 0.35), align: "center" })); PX.text(g, b, x + 23, y + 8, { size: 32, col: D.dna[b], align: "center" }); });
          if (foc) PX.glow(g, x + 23, y + 22, 50, D.lamp, 0.22 * Math.sin(PX.clamp((t - TM - i * 1.1) / 1.6, 0, 1) * Math.PI));
        });
        // bit sorts (pair) in front of each block
        for (let j = 0; j < 2; j++) {
          const ts = T2 + (0.5 + i * 0.32 + j * 0.12) * KS; if (t < ts) continue;
          const q = PX.p(t, ts, 0.3, "back"), sx = x + 8 + j * 18, sy = 272 + Math.round((1 - q) * -8);
          A(g, PX.clamp((t - ts) / 0.2, 0, 1), () => {
            shadow(g, sx - 2, 290, 18, 4, 0.5);
            R(g, sx + 2, sy - 3, 13, 3, D.n7); R(g, sx, sy, 13, 18, D.n6); R(g, sx + 13, sy - 3, 2, 18, D.n4); R(g, sx, sy, 13, 1, lt(D.n7, 0.4)); R(g, sx, sy + 17, 13, 1, D.n4);
            PX.text(g, BITS[i][j], sx + 7, sy + 1, { font: "v", size: 18, col: D.ink, align: "center" });
          });
        }
      }
      // ledger entries written one by one, pen follows
      let pen = null;
      for (let i = 0; i < 4; i++) {
        const tl = TM + i * 1.1 * KS; if (t < tl) continue;
        const s = `${B[i]} = ${BITS[i]}`, n = PX.clamp(Math.floor((t - tl) * 9 / KS), 0, s.length), y = ly + 6 + i * 22, x0 = lx + 140;
        let x = x0;
        for (let k = 0; k < n; k++) { const ch = s[k]; x += PX.text(g, ch, x, y, { font: "v", size: 22, col: k === 0 ? dk(D.dna[B[i]], 0.15) : D.ink }); }
        if (n < s.length) pen = [x, y + 14];
        if (n === s.length && t < tl + 1.0 * KS) pen = [x + 2, y + 14 - Math.round(PX.p(t, tl + s.length / 9 * KS, 0.4) * 6)];
      }
      if (pen) { const [px, py] = pen; shadow(g, px + 6, py + 4, 30, 4, 0.4); PX.line(g, px, py, px + 34, py - 44, D.n2); PX.line(g, px + 1, py, px + 35, py - 44, D.n1); R(g, px, py - 2, 2, 2, D.amber[2]); R(g, px + 22, py - 30, 3, 3, D.amber[2]); }
      // label
      if (t >= T2) { const a = PX.p(t, T2, 0.5); label(g, "4 OPTIONS = 2 BITS", 300, 128 - Math.round((1 - a) * 4), a, D.cream); }
      dust(g, t, [200, 60, 200, 150], 7, 24);
      PX.vignette(g, 0.55);
    };
  };

  // ---------- shared props ----------
  // lab-coat arm reaching in from the upper left, gloved fingers pinching at (x, y)
  const hand = (g, x, y) => {
    const GL = [D.steel[0], D.steel[1], D.steel[2]], x0 = x - 220, y0 = y - 140, x1 = x - 16, y1 = y - 6;
    for (let i = 0; i <= 80; i++) { const k = i / 80, cx = PX.lerp(x0, x1, k), cy = PX.lerp(y0, y1, k);
      R(g, cx, cy - 9, 3, 18, mix(COAT[3], D.n3, 0.3)); R(g, cx, cy - 9, 3, 3, COAT[3]); R(g, cx, cy + 6, 3, 3, D.n3); if (i % 23 === 11) R(g, cx, cy - 5, 2, 8, COAT[3]); }
    R(g, x1 - 4, y1 - 8, 5, 16, COAT[0]); R(g, x1 - 1, y1 - 8, 2, 16, COAT[2]);   // cuff
    R(g, x1 + 1, y1 - 6, 12, 11, GL[1]); R(g, x1 + 1, y1 - 6, 12, 2, GL[0]); R(g, x1 + 1, y1 + 4, 12, 1, GL[2]);
    R(g, x1 + 12, y1 - 5, 6, 3, GL[1]); R(g, x1 + 12, y1 - 5, 6, 1, GL[0]);   // index finger over the cap
    R(g, x1 + 12, y1 + 1, 5, 3, GL[2]); R(g, x1 + 16, y1 + 1, 1, 3, GL[1]);   // thumb under
  };
  const mug = (g, x, y, t) => {
    R(g, x, y, 11, 12, D.n6); R(g, x, y, 2, 12, D.n7); R(g, x + 9, y, 2, 12, D.n5); R(g, x + 11, y + 3, 3, 6, D.n5); R(g, x + 12, y + 4, 1, 4, D.n2);
    R(g, x + 1, y, 9, 2, mix(D.rust[2], D.n1, 0.5)); A(g, 0.4, () => R(g, x - 1, y + 12, 15, 2, SH(1)));
    for (let i = 0; i < 4; i++) { const k = (t * 0.45 + i / 4) % 1; A(g, 0.35 * Math.sin(k * Math.PI), () => R(g, x + 4 + Math.round(Math.sin(k * 7 + i) * 2), y - 3 - k * 20, 2, 3, D.n7)); }
  };
  // old beige CRT monitor; screen area returned. x,y = body top-left, w,h = body size
  const crt = (g, x, y, w, h) => {
    A(g, 0.5, () => R(g, x - 4, y + h + 10, w + 8, 5, SH(1)));
    R(g, x + w / 2 - 22, y + h, 44, 8, BEIGE[2]); R(g, x + w / 2 - 34, y + h + 7, 68, 6, BEIGE[1]); R(g, x + w / 2 - 34, y + h + 7, 68, 1, BEIGE[0]); R(g, x + w / 2 - 34, y + h + 12, 68, 1, BEIGE[3]);
    R(g, x + 2, y, w - 4, h, BEIGE[1]); R(g, x, y + 2, w, h - 4, BEIGE[1]);
    R(g, x + 2, y, w - 4, 1, BEIGE[0]); R(g, x, y + 2, 1, h - 4, BEIGE[0]); R(g, x + w - 3, y + 2, 3, h - 4, BEIGE[2]); R(g, x + 2, y + h - 3, w - 4, 3, BEIGE[2]);
    const sx = x + 14, sy = y + 10, sw = w - 28, sh = h - 30;
    R(g, sx - 4, sy - 4, sw + 8, sh + 8, BEIGE[2]); R(g, sx - 4, sy + sh + 3, sw + 8, 1, BEIGE[0]); R(g, sx - 4, sy - 4, sw + 8, 1, BEIGE[3]);
    R(g, sx - 1, sy - 1, sw + 2, sh + 2, D.n0); R(g, sx, sy, sw, sh, D.n1);
    for (let i = 0; i < 6; i++) R(g, x + w - 40 + i * 5, y + h - 14, 3, 1, BEIGE[3]);
    R(g, x + 18, y + h - 14, 5, 3, D.moss[1]); R(g, x + 18, y + h - 14, 2, 1, D.moss[0]);
    return [sx, sy, sw, sh];
  };
  // glass over a screen: curvature highlight + vignette
  const glassOver = (g, sx, sy, sw, sh) => {
    A(g, 0.08, () => { R(g, sx + 4, sy + 3, sw * 0.5, 2, D.cream); R(g, sx + 3, sy + 4, 2, sh * 0.4, D.cream); });
    A(g, 0.35, () => { R(g, sx, sy, sw, 1, SH(1)); R(g, sx, sy + sh - 1, sw, 1, SH(1)); R(g, sx, sy, 1, sh, SH(1)); R(g, sx + sw - 1, sy, 1, sh, SH(1)); });
  };
  // night lab backdrop: glass-door cabinets + window with blinds (far), shelf (mid), bench top at by
  const labBack = (g, c, t, by, o) => {
    o = o || {};
    PX.par(g, c, 0.4, () => {
      wall(g, -20, by + 10, mix(D.n2, D.teal[2], 0.18), D.n1);
      for (let y = by - 70; y < by; y += 10) R(g, 0, y, 640, 1, dk(D.n2, 0.25));
      for (let x = 0; x < 640; x += 14) R(g, x + ((Math.floor(x / 14) % 2) * 0), by - 70, 1, 70, dk(D.n2, 0.25));
      // cabinets
      const cx0 = o.cabX ?? 0, cw = o.cabW ?? 400;
      R(g, cx0, 14, cw, 104, dk(WOOD[2], 0.5)); R(g, cx0, 118, cw, 3, dk(WOOD[1], 0.5));
      const rr = PX.rnd(17);
      for (let dx = cx0 + 6; dx < cx0 + cw - 40; dx += 66) {
        R(g, dx, 20, 60, 92, dk(D.teal[2], 0.62)); PX.box(g, dx, 20, 60, 92, dk(WOOD[1], 0.45));
        for (let sh = 0; sh < 3; sh++) { const sy = 46 + sh * 30; R(g, dx + 1, sy, 58, 2, dk(WOOD[1], 0.55));
          for (let b = 0; b < 5; b++) { const bh = 8 + Math.floor(rr() * 12), bw = 5 + Math.floor(rr() * 4), bx = dx + 4 + b * 11, kind = rr();
            const col = kind < 0.4 ? dk(D.amber[2], 0.45) : kind < 0.7 ? dk(D.glass, 0.6) : dk(D.paper, 0.6);
            R(g, bx, sy - bh, bw, bh, col); R(g, bx + 1, sy - bh - 2, bw - 2, 2, dk(D.n4, 0.2)); R(g, bx, sy - bh, 1, bh, lt(col, 0.12)); } }
        A(g, 0.08, () => { PX.line(g, dx + 10, 24, dx + 30, 70, D.glass); PX.line(g, dx + 34, 60, dx + 50, 100, D.glass); });
      }
      // window with blinds
      if (o.window !== false) { const wx = o.winX ?? 448;
        R(g, wx - 4, 22, 150, 112, dk(D.n4, 0.2)); PX.vgrad(g, wx, 26, 142, 104, dk(D.steel[2], 0.35), dk(D.steel[2], 0.7), 6);
        for (let i = 0; i < 12; i++) R(g, wx + ((i * 41) % 136), 30 + ((i * 29) % 50), 1, 1, D.n6);
        for (let y = 28; y < 128; y += 6) { R(g, wx, y, 142, 3, dk(D.n5, 0.35)); R(g, wx, y, 142, 1, dk(D.n6, 0.3)); }
        R(g, wx + 70, 26, 1, 104, D.n3); }
    });
    PX.par(g, c, 0.7, () => {
      R(g, 0, by - 46, 640, 4, dk(D.n4, 0.25)); R(g, 0, by - 46, 640, 1, dk(D.n6, 0.3));
      const r = PX.rnd(23);
      for (let x = 12; x < 630; x += 18 + Math.floor(r() * 30)) { if (o.gap && x > o.gap[0] && x < o.gap[1]) continue; const h = 10 + Math.floor(r() * 12), w = 6 + Math.floor(r() * 6), k = r();
        const col = k < 0.35 ? dk(D.amber[2], 0.3) : k < 0.6 ? dk(D.glass, 0.45) : k < 0.8 ? dk(D.teal[2], 0.25) : dk(D.paper, 0.45);
        R(g, x, by - 46 - h, w, h, col); R(g, x, by - 46 - h, 1, h, lt(col, 0.15)); R(g, x + 1, by - 48 - h, w - 2, 2, D.n2); if (k > 0.8) R(g, x + 1, by - 40 - h, w - 2, 4, dk(D.cream, 0.5)); }
    });
    // bench
    R(g, 0, by, 640, 360 - by, D.n2); R(g, 0, by, 640, 6, D.n3); R(g, 0, by, 640, 1, D.n5); R(g, 0, by + 6, 640, 2, D.n1);
    for (let x = 30; x < 640; x += 150) { R(g, x, by + 18, 136, 360, dk(D.n2, 0.2)); PX.box(g, x, by + 18, 136, 300, D.n3); R(g, x + 60, by + 26, 16, 3, D.n5); }
  };

  // ===================================================================================================
  // file_bits (14): old monitor on a desk; photo / music / film icons -> 1s and 0s -> A C G T -> helix
  K.file_bits = (o) => {
    let KS, TB, TL, TH;
    const B = "ACGT", BITS = ["00", "01", "10", "11"];
    const hv = (r, c) => (((r * 73856093) ^ (c * 19349663) ^ 0x5bd1e995) >>> 0) % 4;
    const rr = PX.rnd(9), order = [...Array(3 * 18 * 15)].map(() => rr());
    const books = [...Array(30)].map(() => [rr(), rr(), rr()]);
    return (g, t, d, c) => {
      { const k = d / 14; KS = Math.min(1, k); TB = o.bits ?? 1.5 * k; TL = o.letters ?? 6.0 * k; TH = o.helix ?? 10.0 * k; }
      // far wall: bookshelf left, cork board right (echoes photo / music / film)
      PX.par(g, c, 0.4, () => {
        wall(g, -20, 320, mix(D.n2, D.plum[2], 0.15), D.n1);
        R(g, 22, 30, 150, 240, dk(WOOD[2], 0.45));
        for (let s = 0; s < 4; s++) { const sy = 86 + s * 58; R(g, 26, sy, 142, 4, dk(WOOD[1], 0.5));
          let bx = 30; for (let i = 0; i < 12 && bx < 160; i++) { const [a, b2, cc] = books[(s * 7 + i) % 30], bw = 6 + Math.floor(a * 6), bh = 30 + Math.floor(b2 * 20);
            const col = dk([D.rust[2], D.teal[2], D.moss[2], D.paperD, D.steel[2], D.n4][Math.floor(cc * 6)], 0.58); R(g, bx, sy - bh, bw, bh, col); R(g, bx, sy - bh, 1, bh, lt(col, 0.12)); R(g, bx + 1, sy - bh + 6, bw - 2, 1, dk(col, 0.3)); bx += bw + (a > 0.85 ? 4 : 1); } }
        R(g, 448, 54, 160, 110, dk(WOOD[1], 0.45)); R(g, 452, 58, 152, 102, dk(mix(D.paperD, D.rust[2], 0.4), 0.45));
        R(g, 464, 68, 40, 30, dk(D.cream, 0.45)); R(g, 467, 71, 34, 20, dk(D.steel[2], 0.3)); PX.circle(g, 494, 76, 3, dk(D.amber[1], 0.4)); for (let i = 0; i < 14; i++) R(g, 467 + i, 91 - Math.min(i, 13 - i), 1, Math.min(i, 13 - i), dk(D.moss[2], 0.4));
        R(g, 520, 64, 34, 44, dk(D.paper, 0.45)); for (let l = 0; l < 5; l++) R(g, 523, 70 + l * 7, 28, 1, dk(D.ink, 0.2)); R(g, 530, 74, 3, 3, dk(D.ink, 0.2)); R(g, 541, 81, 3, 3, dk(D.ink, 0.2));
        R(g, 470, 118, 110, 22, dk(D.n3, 0.2)); for (let i = 0; i < 18; i++) { R(g, 472 + i * 6, 120, 3, 2, dk(D.cream, 0.55)); R(g, 472 + i * 6, 136, 3, 2, dk(D.cream, 0.55)); } for (let i = 0; i < 4; i++) R(g, 476 + i * 26, 124, 22, 10, dk(D.steel[1], 0.45));
        for (const [px, py] of [[484, 66], [536, 62], [500, 116]]) R(g, px, py, 2, 2, dk(D.rust[1], 0.3));
      });
      // mid: desk lamp + plant
      PX.par(g, c, 0.75, () => {
        R(g, 540, 300, 40, 6, D.n3); R(g, 540, 300, 40, 1, D.n5); PX.line(g, 560, 300, 548, 236, D.n4); PX.line(g, 561, 300, 549, 236, D.n3); PX.line(g, 548, 236, 506, 214, D.n4);
        for (let r = 0; r < 14; r++) R(g, 494 - r * 0.5, 210 + r, 26 + r, 1, r < 2 ? D.n5 : mix(D.n4, D.rust[2], 0.3)); R(g, 492, 223, 32, 2, D.lamp);
        R(g, 186, 270, 22, 30, mix(D.rust[2], D.n2, 0.3)); R(g, 186, 270, 22, 2, D.rust[2]);
        for (let i = 0; i < 7; i++) { const a = -1.3 + i * 0.43, sw = Math.sin(t * 0.9 + i) * 1.2; for (let k = 0; k < 22; k++) R(g, 197 + Math.sin(a) * k * 0.9 + sw * k / 22, 270 - Math.cos(a) * k * 1.2, 2, 2, k > 16 ? D.moss[1] : D.moss[2]); }
      });
      PX.glow(g, 508, 300, 140, D.lampD, 0.35); lampCone(g, 508, 225, 30, 120, 80, 0.05);
      // desk
      R(g, 0, 304, 640, 56, mix(WOOD[2], D.n2, 0.3)); R(g, 0, 304, 640, 1, mix(WOOD[1], D.n2, 0.2)); R(g, 0, 305, 640, 2, mix(WOOD[2], D.n1, 0.5));
      // monitor
      const [sx, sy, sw, sh] = crt(g, 220, 158, 200, 140);
      PX.glow(g, 320, 230, 170, mix(D.teal[0], D.cream, 0.5), 0.1);
      // ---- screen content ----
      g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
      R(g, sx, sy, sw, sh, mix(D.n1, D.teal[2], 0.25));
      const icons = [[sx + 10, sy + 34], [sx + 54, sy + 34], [sx + 98, sy + 34]];
      const dis = PX.clamp((t - TB) / 1.4, 0, 1);
      if (dis < 1) {
        const [ax, ay] = icons[0]; R(g, ax, ay, 34, 28, D.cream); PX.vgrad(g, ax + 2, ay + 2, 30, 24, mix(D.steel[1], D.cream, 0.2), D.steel[1], 4); PX.circle(g, ax + 24, ay + 8, 3, D.amber[0]);
        for (let i = 0; i < 30; i++) { const hh = Math.max(0, 11 - Math.abs(i - 10) * 1.1), h2 = Math.max(0, 8 - Math.abs(i - 23) * 0.9); R(g, ax + 2 + i, ay + 26 - Math.max(hh, h2), 1, Math.max(hh, h2), hh > h2 ? D.moss[2] : D.moss[1]); }
        const [bx, by2] = icons[1]; R(g, bx + 10, by2 + 20, 7, 6, D.cream); R(g, bx + 22, by2 + 17, 7, 6, D.cream); R(g, bx + 15, by2 + 3, 2, 20, D.cream); R(g, bx + 27, by2 + 1, 2, 19, D.cream); R(g, bx + 15, by2 + 1, 14, 3, D.cream); R(g, bx + 15, by2 + 5, 14, 2, D.cream);
        const [fx, fy] = icons[2]; R(g, fx, fy + 2, 34, 24, D.n4); for (let i = 0; i < 8; i++) { R(g, fx + 2 + i * 4, fy + 4, 2, 2, D.cream); R(g, fx + 2 + i * 4, fy + 22, 2, 2, D.cream); }
        for (let i = 0; i < 3; i++) { R(g, fx + 2 + i * 11, fy + 8, 9, 12, D.steel[1]); R(g, fx + 3 + i * 11, fy + 15, 7, 5, D.steel[2]); }
        A(g, PX.p(t, 0.1, 0.5) * (1 - Math.min(1, dis * 2)), () => { PX.text(g, "PHOTO", icons[0][0] + 17, sy + 66, { font: "v", size: 10, col: D.n7, align: "center" }); PX.text(g, "SONG", icons[1][0] + 17, sy + 66, { font: "v", size: 10, col: D.n7, align: "center" }); PX.text(g, "MOVIE", icons[2][0] + 17, sy + 66, { font: "v", size: 10, col: D.n7, align: "center" }); });
        if (dis > 0) { let n = 0; const bg = mix(D.n1, D.teal[2], 0.25);
          for (let k = 0; k < 3; k++) for (let yy = 0; yy < 18; yy++) for (let xx = 0; xx < 18; xx++) { if (order[n++] < dis) R(g, icons[k][0] - 1 + xx * 2, icons[k][1] - 1 + yy * 2, 2, 2, bg); } }
      }
      // bits grid
      const cw = 17, ch = 11, ox = sx + 3, oy = sy + 3;
      if (t >= TB) {
        const scroll = Math.floor(Math.max(0, Math.min(t, TL) - TB - 1.4) * 5);
        const dimG = t >= TH ? 0.5 : 1; g.globalAlpha = dimG;
        for (let r = 0; r < 9; r++) for (let cc = 0; cc < 8; cc++) {
          const idx = r * 8 + cc, tf = TH + (71 - idx) * 0.03 * KS; if (t > tf + 0.05) continue;
          const appear = TB + 1.0 + ((cc * 5 + r * 3) % 11) * 0.07; if (t < appear) continue;
          const v = hv(r + scroll, cc), tc = TL + (r * 0.22 + cc * 0.025) * KS, x = ox + cc * cw, y = oy + r * ch;
          if (t < tc) PX.text(g, BITS[v], x + 2, y, { font: "v", size: 12, col: (r + scroll) % 3 === 0 ? D.cream : D.n7 });
          else { const k = PX.p(t, tc, 0.25); if (k < 1) A(g, 1 - k, () => R(g, x + 1, y + 1, 14, 10, D.cream)); PX.text(g, B[v], x + 5, y, { font: "v", size: 12, col: lt(D.dna[B[v]], 0.15) }); }
        }
        g.globalAlpha = 1;
        if (t >= TL && t < TL + 2.4 * KS) { const yy = oy + Math.min(9, (t - TL) / (0.22 * KS)) * ch; A(g, 0.5, () => R(g, sx, yy, sw, 1, D.amber[0])); }
      }
      glassOver(g, sx, sy, sw, sh);
      g.restore();
      // keyboard + props
      R(g, 250, 318, 140, 20, BEIGE[2]); R(g, 252, 316, 136, 18, BEIGE[1]); R(g, 252, 316, 136, 1, BEIGE[0]);
      for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 16; kx++) R(g, 256 + kx * 8, 319 + ky * 5, 7, 4, ky === 2 && kx > 4 && kx < 11 ? BEIGE[0] : lt(BEIGE[1], 0.2));
      A(g, 0.4, () => R(g, 248, 338, 146, 3, SH(1)));
      mug(g, 456, 292, t);
      // film canister
      R(g, 112, 296, 44, 10, D.n4); R(g, 112, 296, 44, 2, D.n6); R(g, 112, 305, 44, 1, D.n3); R(g, 120, 293, 28, 3, D.n5); A(g, 0.4, () => R(g, 110, 306, 50, 2, SH(1)));
      // ---- helix rising out of the screen ----
      if (t >= TH) {
        const hk = PX.clamp((t - TH - 0.3 * KS) / (2.6 * KS), 0, 1), y1 = 236, y0 = 22;
        A(g, 0.35 * hk, () => PX.glow(g, 320, 150, 110, mix(D.lamp, D.cream, 0.5), 0.4));
        helix(g, 320, y0, y1, t, { k: hk, amp: 22, per: 70 });
        for (let idx = 0; idx < 72; idx++) {
          const tf = TH + (71 - idx) * 0.03 * KS, p = PX.clamp((t - tf) / 0.7, 0, 1); if (p <= 0 || p >= 1) continue;
          const r = Math.floor(idx / 8), cc = idx % 8, v = hv(r + Math.floor(Math.max(0, TL - TB - 1.4) * 5), cc);
          const x0 = ox + cc * cw + 5, yA = oy + r * ch, ty = y1 - PX.clamp((tf + 0.7 - TH - 0.3 * KS) / (2.6 * KS), 0, 1) * (y1 - y0), tx = 320, e = PX.ease(p, "io");
          const x = PX.lerp(x0, tx, e), y = PX.lerp(yA, ty, e) - Math.sin(e * Math.PI) * 10;
          A(g, 1 - p * p, () => PX.otext(g, B[v], x, y, { font: "v", size: 12, col: D.dna[B[v]], outline: D.n1 }));
        }
      }
      dust(g, t, [420, 200, 180, 100], 13, 14);
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // order_vial (9.5): printer spits 72,000 strand rows, envelope ORDER goes up a pneumatic tube, a vial comes back
  K.order_vial = (o) => {
    let KS, TC, TS, TV;
    const BY = 252;
    const rows = [...Array(60)].map((_, i) => { const r = PX.rnd(100 + i); return [...Array(14)].map(() => "ACGT"[Math.floor(r() * 4)]); });
    const tubeX = 474;
    return (g, t, d, c) => {
      t = Math.max(t, 0);
      { const k = d / 9.5; KS = Math.min(1, k); TC = o.count ?? 1.0 * k; TS = o.send ?? 4.0 * k; TV = o.vial ?? 6.5 * k; }
      labBack(g, c, t, BY, { cabW: 380, winX: 404, gap: [440, 520] });
      // gooseneck bench lamp (warm pool on the bench)
      R(g, 300, BY - 4, 26, 4, D.n4); R(g, 300, BY - 4, 26, 1, D.n6);
      for (let i = 0; i < 90; i++) { const k = i / 90; R(g, 312 + Math.sin(k * 2.2) * 26, BY - 4 - k * 70, 2, 2, k > 0.5 ? D.n5 : D.n4); }
      R(g, 322, BY - 84, 30, 10, D.n4); R(g, 322, BY - 84, 30, 1, D.n6); R(g, 325, BY - 75, 24, 2, D.lamp);
      lampCone(g, 337, BY - 73, 24, 150, 70, 0.07);
      PX.glow(g, 330, BY - 10, 200, D.lampD, 0.38);
      // pneumatic tube: brass pipe from ceiling into a receiver box
      const BR = [lt(D.amber[2], 0.25), D.amber[2], dk(D.amber[2], 0.45)];
      R(g, tubeX - 7, -10, 14, 182, BR[1]); R(g, tubeX - 7, -10, 3, 182, BR[0]); R(g, tubeX + 4, -10, 3, 182, BR[2]);
      for (const y of [30, 120]) { R(g, tubeX - 9, y, 18, 4, BR[2]); R(g, tubeX - 9, y, 18, 1, BR[0]); }
      R(g, tubeX - 6, 50, 12, 60, mix(D.glass, D.n2, 0.55)); R(g, tubeX - 5, 50, 2, 60, lt(D.glass, 0.2)); // glass section
      // receiver box
      R(g, tubeX - 30, 168, 60, 84, D.n4); R(g, tubeX - 30, 168, 60, 1, D.n6); R(g, tubeX + 27, 168, 3, 84, D.n3);
      R(g, tubeX - 22, 180, 44, 56, D.n2); PX.box(g, tubeX - 22, 180, 44, 56, D.n5);
      const capY = (() => { // capsule position (centre y); null if hidden
        if (t >= TS && t < TS + 0.9) return PX.lerp(208, -40, PX.ease((t - TS) / 0.9, "in"));
        if (t >= TV - 0.6 && t < TV) return PX.lerp(-40, 212, PX.ease((t - TV + 0.6) / 0.6, "in"));
        if (t >= TV) return 212; if (t >= TS - 0.5 && t < TS) return 208; return null; })();
      const doorOpen = (t > TS - 0.9 && t < TS) || (t > TV + 0.1 && t < TV + 1.2) ? 1 : 0;
      if (capY !== null) { const y = Math.round(capY), open = t > TV + 0.2;
        R(g, tubeX - 6, y - 16, 12, 32, mix(D.glass, D.n3, 0.35)); R(g, tubeX - 5, y - 15, 2, 30, lt(D.glass, 0.3)); R(g, tubeX - 7, y - 18, 14, 4, BR[1]); R(g, tubeX - 7, y + 14, 14, 4, BR[1]);
        if (t < TS + 0.9) R(g, tubeX - 3, y - 10, 6, 20, D.paper); }
      A(g, 0.3, () => R(g, tubeX - 21, 181, 42, 54, D.glass)); A(g, 0.15, () => PX.line(g, tubeX - 18, 184, tubeX - 4, 230, D.cream));
      R(g, tubeX + 14, 204, 3, 8, D.n6);
      // dot-matrix printer (left) with fanfold paper draping over the bench
      const px0 = 70, feed = PX.clamp(t / Math.max(TS - 0.8, 1), 0, 1);
      const scroll = t < TS - 0.8 ? t * 22 : (TS - 0.8) * 22;
      // hanging paper in front of bench
      R(g, px0 + 18, BY - 2, 84, 112, D.paperD); R(g, px0 + 18, BY - 2, 84, 112, mix(D.paper, D.n4, 0.35));
      g.save(); g.beginPath(); g.rect(px0 + 18, BY - 2, 84, 112); g.clip();
      for (let i = 0; i < 26; i++) { const y = BY + 2 + i * 5 + (scroll % 5) - 5, row = rows[(Math.floor(scroll / 5) - i + 600) % 60];
        row.forEach((b, j) => R(g, px0 + 26 + j * 5, y, 4, 2, mix(D.dna[b], D.paperD, 0.45))); }
      for (let i = 0; i < 22; i++) { R(g, px0 + 20, BY + 4 + i * 6 + (scroll % 6) - 6, 2, 2, D.n4); R(g, px0 + 98, BY + 4 + i * 6 + (scroll % 6) - 6, 2, 2, D.n4); }
      g.restore();
      // fanfold pile on the floor (grows)
      const pile = Math.round(feed * 16);
      for (let i = 0; i < pile; i++) { const y = 352 - i * 2; R(g, px0 + 12 + (i % 2) * 3, y, 96, 2, i % 2 ? D.paper : D.paperD); }
      // printer body
      A(g, 0.5, () => R(g, px0 - 4, BY - 2, 128, 4, SH(1)));
      R(g, px0, BY - 44, 120, 42, BEIGE[1]); R(g, px0, BY - 44, 120, 1, BEIGE[0]); R(g, px0 + 117, BY - 44, 3, 42, BEIGE[2]); R(g, px0, BY - 6, 120, 4, BEIGE[2]);
      R(g, px0 + 14, BY - 52, 92, 10, BEIGE[2]); R(g, px0 + 14, BY - 52, 92, 1, BEIGE[0]); R(g, px0 + 18, BY - 30, 84, 4, D.n2);
      const head = px0 + 22 + Math.abs(((t * 160) % 160) - 80); if (t < TS - 0.8) R(g, Math.min(head, px0 + 96), BY - 32, 6, 6, D.n4);
      R(g, px0 + 8, BY - 16, 4, 3, t < TS - 0.8 && PX.blink(t, 0.4) ? D.moss[0] : D.moss[2]); R(g, px0 + 100, BY - 18, 10, 6, BEIGE[2]);
      // paper going up from printer top and curling back
      R(g, px0 + 20, BY - 76, 80, 26, D.paper); R(g, px0 + 20, BY - 76, 80, 1, lt(D.paper, 0.3)); R(g, px0 + 20, BY - 78, 80, 3, D.paperD);
      for (let i = 0; i < 4; i++) { const row = rows[((Math.floor(scroll / 5) + i) % 60 + 60) % 60]; row.forEach((b, j) => R(g, px0 + 26 + j * 5, BY - 72 + i * 5, 4, 2, mix(D.dna[b], D.paper, 0.3))); }
      // envelope: appears on the bench, flap folds, then rides the capsule
      const envIn = TS - 1.6;
      if (t >= envIn && t < TS + 0.1) {
        const p = PX.p(t, envIn, 0.6), fl = PX.p(t, TS - 1.0, 0.3), mv = PX.p(t, TS - 0.5, 0.45, "io");
        const ex = PX.lerp(PX.lerp(250, 300, p), tubeX - 25, mv), ey = PX.lerp(BY - 34, 196, mv), sc = 1 - mv * 0.6;
        A(g, p * (1 - PX.p(t, TS - 0.05, 0.12, "lin")), () => {
          const w = Math.round(84 * sc), h = Math.round(46 * sc);
          A(g, 0.4, () => R(g, ex - 2, ey + h, w + 4, 3, SH(1)));
          R(g, ex, ey, w, h, D.paper); R(g, ex, ey, w, 1, lt(D.paper, 0.4)); R(g, ex + w - 2, ey, 2, h, D.paperD); R(g, ex, ey + h - 1, w, 1, D.paperD);
          for (let k = 0; k < w / 2; k++) { const fy = Math.round(k * (h * 0.55) / (w / 2) * (1 - fl * 2)); R(g, ex + k, ey + Math.max(0, fy), 1, 1, D.paperD); R(g, ex + w - 1 - k, ey + Math.max(0, fy), 1, 1, D.paperD); }
          if (sc > 0.8) { PX.text(g, "ORDER", ex + w / 2, ey + h / 2 + 2, { size: 8, col: D.rust[2], align: "center" }); PX.box(g, ex + w / 2 - 26, ey + h / 2, 52, 13, D.rust[2]); }
        });
      }
      // vial on the bench + magnifier
      if (t >= TV + 0.4 * KS) {
        const p = PX.p(t, TV + 0.4 * KS, 0.5 * KS, "io"), vx = Math.round(PX.lerp(tubeX - 22, 404, p)), vy = BY - 16;
        A(g, p, () => { A(g, 0.4, () => R(g, vx - 2, vy + 15, 12, 2, SH(1))); R(g, vx, vy, 8, 15, mix(D.glass, D.n3, 0.4)); R(g, vx + 1, vy, 1, 15, lt(D.glass, 0.4)); R(g, vx - 1, vy - 4, 10, 5, D.rust[2]); R(g, vx - 1, vy - 4, 10, 1, D.rust[1]); R(g, vx + 1, vy + 10, 6, 4, mix(D.glass, D.cream, 0.2)); });
        const m = PX.p(t, TV + 1.1 * KS, 0.9 * KS, "out"); if (m > 0) {
          const mx = Math.round(PX.lerp(600, vx - 6, m)), my = Math.round(PX.lerp(110, vy - 34, m) + Math.sin(t * 1.4) * 2), rL = 30;
          PX.line(g, mx + 20, my + 20, mx + 58, my + 66, WOOD[2]); for (let w = 0; w < 5; w++) PX.line(g, mx + 22 + w, my + 20, mx + 58 + w, my + 64, w < 2 ? WOOD[0] : WOOD[1]);
          g.save(); g.beginPath(); g.arc(mx, my, rL, 0, Math.PI * 2); g.clip();
          R(g, mx - rL, my - rL, rL * 2, rL * 2, D.n2); PX.glow(g, mx, my, rL, D.lampD, 0.25);
          // magnified vial bottom (native drawing, bigger)
          const bx = Math.round(mx - 14), byy = Math.round(my - 40);
          R(g, bx, byy, 28, 60, mix(D.glass, D.n3, 0.6)); R(g, bx + 3, byy, 3, 60, mix(D.glass, D.n3, 0.2)); R(g, bx + 24, byy, 2, 60, dk(D.glass, 0.4));
          R(g, bx + 3, byy + 36, 22, 18, mix(D.glass, D.n3, 0.35)); R(g, bx + 3, byy + 36, 22, 1, mix(D.glass, D.cream, 0.3)); R(g, bx + 2, byy + 54, 24, 2, dk(D.glass, 0.3));
          R(g, bx + 12, byy + 50, 3, 2, mix(D.cream, D.paperD, 0.3)); R(g, bx + 13, byy + 49, 1, 1, D.cream); A(g, 0.3 + 0.2 * Math.sin(t * 2.2), () => PX.box(g, bx + 9, byy + 46, 9, 8, D.amber[0]));
          g.restore();
          for (let a = 0; a < 260; a++) { const an = a / 260 * Math.PI * 2; R(g, mx + Math.cos(an) * (rL + 1.5) - 1, my + Math.sin(an) * (rL + 1.5) - 1, 3, 3, an > 3.4 && an < 5.6 ? BR[0] : an > 0.3 && an < 2.4 ? BR[2] : BR[1]); }
          A(g, 0.18, () => PX.line(g, mx - 16, my - 18, mx - 4, my - 24, D.cream));
        }
      }
      if (t >= TC) label(g, "72,000 STRANDS", 130, 150, PX.p(t, TC, 0.5));
      dust(g, t, [120, 120, 260, 120], 31, 18);
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // sequencer (7): benchtop sequencer; vial loaded, base traces scroll, "0 ERRORS"
  K.sequencer = (o) => {
    let KS, TL, TD;
    const BY = 276;
    const seq = (() => { const r = PX.rnd(77); return [...Array(200)].map(() => "ACGT"[Math.floor(r() * 4)]); })();
    return (g, t, d, c) => {
      { const k = d / 7; KS = Math.min(1, k); TL = o.load ?? 0.5 * k; TD = o.done ?? 4.0 * k; }
      labBack(g, c, t, BY, {});
      PX.glow(g, 320, 250, 260, D.lampD, 0.25);
      // under-cabinet light strip
      // sequencer body
      const x = 176, y = 140, w = 292, h = 136;
      A(g, 0.5, () => R(g, x - 6, BY - 2, w + 12, 5, SH(1)));
      R(g, x, y + 20, w, h - 20, BEIGE[1]); R(g, x, y + 20, w, 1, BEIGE[0]); R(g, x + w - 4, y + 20, 4, h - 20, BEIGE[2]); R(g, x, y + h - 6, w, 6, BEIGE[2]);
      for (let r = 0; r < 20; r++) R(g, x + 6 + r * 0.6, y + r, w - 12 - r * 0.6, 1, r < 1 ? BEIGE[0] : mix(BEIGE[0], BEIGE[1], 0.5 + r * 0.02));
      R(g, x, y + 20, 4, h - 20, lt(BEIGE[1], 0.15));
      R(g, x + 6, y + 20, w - 12, 1, BEIGE[2]); R(g, x + 140, y + 21, 1, h - 27, BEIGE[2]); R(g, x + 141, y + 21, 1, h - 27, BEIGE[0]);
      for (let i = 0; i < 4; i++) { R(g, x + 178 + i * 16, y + 118, 10, 6, BEIGE[2]); R(g, x + 178 + i * 16, y + 118, 10, 1, BEIGE[0]); }
      R(g, x + w + 2, y + 60, 4, 40, BEIGE[2]);
      // vents + brand strip (blank)
      for (let i = 0; i < 10; i++) R(g, x + 20 + i * 6, y + 40, 3, 24, BEIGE[2]);
      R(g, x + 20, y + 74, 80, 2, D.teal[2]);
      // loading drawer
      const tray = PX.clamp(t < TL + 0.9 ? PX.p(t, TL - 0.3, 0.4) : 1 - PX.p(t, TL + 0.9, 0.6, "io"), 0, 1);
      const dx = x + 26, dy = y + 92;
      R(g, dx - 2, dy - 2, 88, 22, BEIGE[3]); R(g, dx, dy, 84, 18, D.n1);
      const tx = dx + 6, ty = dy + 4 + 0, tz = Math.round(tray * 26);
      R(g, tx, ty + tz - 4, 72, 10, BEIGE[2]); R(g, tx, ty + tz - 4, 72, 1, BEIGE[0]); R(g, tx + 30, ty + tz - 3, 12, 6, D.n2);
      // vial: carried in by a gloved hand, dropped into the tray, rides in
      const vialP = PX.p(t, TL - 0.4, 0.7, "io");
      const vx = PX.lerp(120, tx + 33, vialP), vyy = PX.lerp(150, ty + tz - 12, vialP);
      if (t < TL + 0.9) {
        R(g, vx, vyy, 6, 12, mix(D.glass, D.n3, 0.35)); R(g, vx + 1, vyy, 1, 12, lt(D.glass, 0.4)); R(g, vx - 1, vyy - 3, 8, 4, D.rust[2]);
        if (t < TL + 0.35) { const out = PX.p(t, TL + 0.1, 0.25, "in"); hand(g, vx + 3 - out * 80, vyy - 1 - out * 40); }
      } else if (tray > 0.05) { R(g, tx + 33, ty + tz - 12, 6, 12, mix(D.glass, D.n3, 0.35)); R(g, tx + 32, ty + tz - 15, 8, 4, D.rust[2]); }
      R(g, dx - 2, dy + 18, 88, 2, BEIGE[2]);
      // status LED
      const run = t > TL + 1.4 && t < TD, done = t >= TD;
      R(g, x + 120, y + 100, 6, 4, done ? D.moss[0] : run && PX.blink(t, 0.6) ? D.amber[0] : D.n4); if (done || run) PX.glow(g, x + 123, y + 102, 8, done ? D.moss[1] : D.amber[1], 0.4);
      // screen (slanted panel on the right)
      const sx = x + 150, sy = y + 34, sw = 126, sh = 76;
      R(g, sx - 5, sy - 5, sw + 10, sh + 10, BEIGE[2]); R(g, sx - 5, sy + sh + 4, sw + 10, 1, BEIGE[0]); R(g, sx - 1, sy - 1, sw + 2, sh + 2, D.n0);
      R(g, sx, sy, sw, sh, D.n1);
      g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
      if (t < TL + 1.4) { A(g, 0.8, () => PX.text(g, t > TL + 0.2 ? "LOADING" : "READY", sx + sw / 2, sy + 32, { font: "v", size: 14, col: D.n7, align: "center" })); if (t > TL + 0.2) for (let i = 0; i < 3; i++) if (Math.floor(t * 3) % 4 > i) R(g, sx + 80 + i * 4, sy + 42, 2, 2, D.n7); }
      else if (t < TD) {
        for (let gy2 = sy + 14; gy2 < sy + sh; gy2 += 12) R(g, sx, gy2, sw, 1, D.n2);
        const sp = 40, off = (t - TL - 1.4) * sp;
        // peaks: each base a gaussian bump in its colour
        for (const b of "ACGT") { let prev = null;
          for (let xx = 0; xx < sw; xx++) { const s = (xx + off) / 9; let v = 0;
            for (let k = Math.floor(s) - 1; k <= Math.floor(s) + 1; k++) if (k >= 0 && seq[k % 200] === b) { const dd = s - k - 0.5; v = Math.max(v, Math.exp(-dd * dd * 7) * (0.6 + 0.4 * (((k * 37) % 10) / 10))); }
            const yy = Math.round(sy + sh - 6 - v * 50); if (prev !== null) PX.line(g, sx + xx - 1, prev, sx + xx, yy, D.dna[b]); prev = yy; } }
        for (let k = Math.floor(off / 9); k < (off + sw) / 9; k++) { const xx = sx + (k + 0.5) * 9 - off; PX.text(g, seq[k % 200], xx, sy + 3, { font: "v", size: 10, col: D.dna[seq[k % 200]], align: "center" }); }
      } else {
        const k = PX.p(t, TD, 0.4);
        A(g, k, () => { PX.text(g, "0 ERRORS", sx + sw / 2, sy + 30, { size: 8, col: D.moss[0], align: "center" }); R(g, sx + 26, sy + 46, (sw - 52) * PX.p(t, TD + 0.1, 0.8), 2, D.moss[2]); });
        PX.glow(g, sx + sw / 2, sy + 34, 50, D.moss[1], 0.12 * k);
      }
      glassOver(g, sx, sy, sw, sh);
      g.restore();
      PX.glow(g, sx + sw / 2, sy + sh / 2, 90, t >= TD ? D.moss[2] : mix(D.teal[0], D.cream, 0.5), 0.08);
      // bench props: tube rack + pipette + notebook
      R(g, 70, BY - 18, 70, 18, D.n4); R(g, 70, BY - 18, 70, 1, D.n6); for (let i = 0; i < 6; i++) { R(g, 74 + i * 11, BY - 34, 6, 22, mix(D.glass, D.n3, 0.45)); R(g, 74 + i * 11, BY - 36, 6, 3, [D.rust[2], D.teal[2], D.moss[2], D.amber[2], D.n5, D.rust[2]][i]); R(g, 75 + i * 11, BY - 33, 1, 18, lt(D.glass, 0.2)); }
      R(g, 486, BY - 8, 88, 8, D.paper); R(g, 486, BY - 8, 88, 1, lt(D.paper, 0.3)); for (let l = 0; l < 3; l++) R(g, 494, BY - 6 + l * 2, 50, 1, D.n6);
      PX.line(g, 520, BY - 10, 600, BY - 36, D.n6); PX.line(g, 520, BY - 9, 600, BY - 35, D.n5); R(g, 596, BY - 42, 8, 10, D.steel[2]);
      dust(g, t, [140, 100, 360, 160], 37, 20);
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // boot_mine (5): old beige PC boots (from DNA), a generic mine-sweeping game, a flag, a small confetti pop
  K.boot_mine = (o) => {
    let KS, TBo, TP;
    const BY = 286;
    const BOOT = ["SYSTEM CHECK ... OK", "MEMORY ... OK", "READING FROM DNA ... OK", "LOADING", ""];
    const GW = 9, GH = 6, mine = (i, j) => ((i * 7 + j * 13) % 11) === 3;
    const rev = []; { const cx = 3, cy = 2; for (let i = 0; i < GW; i++) for (let j = 0; j < GH; j++) { const dd = Math.abs(i - cx) + Math.abs(j - cy) * 1.3; if (!mine(i, j) && dd < 4.6) rev.push([i, j, dd]); } }
    const near = (i, j) => { let n = 0; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) if ((a || b) && i + a >= 0 && j + b >= 0 && i + a < GW && j + b < GH && mine(i + a, j + b)) n++; return n; };
    const flag = [6, 4];
    const conf = (() => { const r = PX.rnd(55); return [...Array(46)].map(() => [r(), r(), r(), Math.floor(r() * 5)]); })();
    return (g, t, d, c) => {
      { const k = d / 5; KS = Math.min(1, k); TBo = o.boot ?? 1.5 * k; TP = o.party ?? 3.5 * k; }
      labBack(g, c, t, BY, { winX: 470, cabW: 420 });
      PX.glow(g, 320, 260, 240, D.lampD, 0.25);
      const [sx, sy, sw, sh] = crt(g, 218, 120, 204, 150);
      // desktop case under the monitor is behind; draw a tower to the right
      R(g, 448, 166, 58, 120, BEIGE[1]); R(g, 448, 166, 58, 1, BEIGE[0]); R(g, 503, 166, 3, 120, BEIGE[2]); R(g, 456, 182, 42, 6, BEIGE[2]); R(g, 456, 196, 42, 6, BEIGE[2]); R(g, 462, 184, 14, 2, D.n2);
      R(g, 470, 262, 8, 6, BEIGE[2]); R(g, 490, 264, 4, 3, D.moss[1]); A(g, 0.5, () => R(g, 444, 286, 66, 4, SH(1)));
      g.save(); g.beginPath(); g.rect(sx, sy, sw, sh); g.clip();
      R(g, sx, sy, sw, sh, D.n0);
      if (t < TBo) {
        BOOT.forEach((s, i) => { const ti = 0.05 + i * 0.28; if (t > ti) PX.text(g, PX.typed(s, t, ti, 60), sx + 6, sy + 6 + i * 11, { font: "v", size: 11, col: i === 2 ? D.amber[0] : D.n7 }); });
        if (PX.blink(t, 0.5)) R(g, sx + 6, sy + 6 + 5 * 11, 5, 8, D.n7);
      } else {
        const bg = mix(D.teal[2], D.n2, 0.25); R(g, sx, sy, sw, sh, bg);
        for (let i = 0; i < 3; i++) { R(g, sx + 8, sy + 8 + i * 24, 14, 12, i === 1 ? D.paper : D.n6); R(g, sx + 8, sy + 8 + i * 24, 14, 1, D.cream); R(g, sx + 6, sy + 22 + i * 24, 18, 2, mix(bg, D.cream, 0.4)); }
        R(g, sx, sy + sh - 10, sw, 10, BEIGE[1]); R(g, sx, sy + sh - 10, sw, 1, BEIGE[0]); R(g, sx + 2, sy + sh - 8, 22, 6, BEIGE[0]); R(g, sx + 2, sy + sh - 3, 22, 1, BEIGE[3]);
        // game window
        const wo = PX.p(t, TBo + 0.25, 0.35, "out");
        if (wo > 0) {
          const cs = 11, ww = GW * cs + 8, wh = GH * cs + 22, wx = Math.round(sx + sw / 2 - ww / 2 + 8), wy = Math.round(sy + 8);
          const sc = 0.3 + 0.7 * wo;
          const W2 = Math.round(ww * sc), H2b = Math.round(wh * sc), X2 = Math.round(wx + (ww - W2) / 2), Y2 = Math.round(wy + (wh - H2b) / 2);
          A(g, 0.5, () => R(g, X2 + 3, Y2 + 3, W2, H2b, SH(1)));
          R(g, X2, Y2, W2, H2b, BEIGE[1]); R(g, X2, Y2, W2, 10, D.steel[2]); R(g, X2, Y2, W2, 1, D.steel[1]); PX.box(g, X2, Y2, W2, H2b, BEIGE[3]);
          if (wo >= 1) {
            R(g, wx + ww - 9, wy + 2, 6, 6, BEIGE[1]); R(g, wx + 4, wy + 13, ww - 8, 6, BEIGE[2]);
            const gx = wx + 4, gy = wy + 21, t0 = TBo + 0.9;
            for (let i = 0; i < GW; i++) for (let j = 0; j < GH; j++) {
              const x = gx + i * cs, y = gy + j * cs, r = rev.find((q) => q[0] === i && q[1] === j), open = r && t > t0 + r[2] * 0.12;
              if (open) { R(g, x, y, cs, cs, BEIGE[2]); R(g, x, y, cs, 1, BEIGE[3]); R(g, x, y, 1, cs, BEIGE[3]);
                const n = near(i, j); const pc = [null, D.steel[2], D.moss[2], D.rust[2]][Math.min(n, 3)]; for (let k = 0; k < n; k++) R(g, x + 3 + k * 3, y + 5, 2, 2, pc); }
              else { R(g, x, y, cs, cs, BEIGE[1]); R(g, x, y, cs, 1, BEIGE[0]); R(g, x, y, 1, cs, BEIGE[0]); R(g, x + cs - 1, y, 1, cs, BEIGE[3]); R(g, x, y + cs - 1, cs, 1, BEIGE[3]); }
              if (i === flag[0] && j === flag[1] && t > TP - 0.6) { const fp = PX.p(t, TP - 0.6, 0.25, "back"); R(g, x + 5, y + 2, 1, 7, D.ink); R(g, x + 2, y + 8, 7, 1, D.ink); R(g, x + 6 - Math.round(4 * fp), y + 2, Math.round(4 * fp), 3, D.rust[1]); }
            }
            // cursor
            const path = [[t0 - 0.4, gx + 60, gy + 60], [t0, gx + 3 * cs + 5, gy + 2 * cs + 5], [TP - 0.9, gx + 3 * cs + 5, gy + 2 * cs + 5], [TP - 0.6, gx + flag[0] * cs + 6, gy + flag[1] * cs + 6], [d, gx + flag[0] * cs + 14, gy + flag[1] * cs + 12]];
            let cx = path[0][1], cy = path[0][2]; for (let k = 1; k < path.length; k++) if (t >= path[k - 1][0]) { const e = PX.ease((t - path[k - 1][0]) / (path[k][0] - path[k - 1][0]), "io"); cx = PX.lerp(path[k - 1][1], path[k][1], e); cy = PX.lerp(path[k - 1][2], path[k][2], e); }
            PX.sprite(g, ["k.....", "kk....", "kwk...", "kwwk..", "kwwwk.", "kwwwwk", "kwwkkk", "kk.wk.", "k..wk."], cx, cy, { k: D.n0, w: D.cream });
          }
        }
      }
      glassOver(g, sx, sy, sw, sh);
      g.restore();
      PX.glow(g, 320, 200, 140, mix(D.teal[0], D.cream, 0.5), 0.08);
      // keyboard
      R(g, 244, 298, 152, 20, BEIGE[2]); R(g, 246, 296, 148, 18, BEIGE[1]); R(g, 246, 296, 148, 1, BEIGE[0]);
      for (let ky = 0; ky < 3; ky++) for (let kx = 0; kx < 17; kx++) R(g, 250 + kx * 8, 299 + ky * 5, 7, 4, lt(BEIGE[1], 0.2));
      R(g, 412, 304, 12, 8, BEIGE[1]); R(g, 412, 304, 12, 1, BEIGE[0]);
      // party popper (left, on the bench) + confetti
      const ppx = 150, ppy = BY - 3;
      A(g, 0.45, () => R(g, ppx - 4, ppy, 30, 3, SH(1)));
      for (let r = 0; r < 26; r++) { const w = 2 + Math.round(r * 0.42); for (let k = 0; k < w; k++) R(g, ppx + r * 0.85 - k * 0.5, ppy - r * 0.55 - k * 0.85, 2, 1, (Math.floor(r / 4) % 2 ? D.paper : D.rust[1])); }
      const mouth = [ppx + 18, ppy - 26];
      if (t < TP) R(g, mouth[0] - 1, mouth[1] - 1, 3, 3, D.amber[1]);
      if (t >= TP) {
        const e = t - TP;
        conf.forEach(([a, b, s2, ci], i) => {
          const ang = -1.15 + a * 0.75, sp = 80 + b * 80, tt2 = e * (0.8 + s2 * 0.35), drag = 1 - Math.exp(-tt2 * 2.2);
          const x = mouth[0] + Math.cos(ang) * sp * drag / 2.2 * 1.6, y = mouth[1] + Math.sin(ang) * sp * drag / 2.2 + 22 * tt2 * tt2 + Math.sin(tt2 * 5 + i) * 3;
          if (y > BY + 2) return;
          const col = [D.cream, D.amber[0], D.moss[0], D.teal[0], D.rose[0]][ci];
          const fl = Math.floor(t * 7 + i) % 3; A(g, PX.clamp(2.2 - e * 0.6, 0, 1), () => R(g, x, y, fl === 0 ? 3 : fl === 1 ? 2 : 1, fl === 2 ? 1 : 2, col));
        });
        for (let k = 0; k < 3; k++) { const p = PX.ease(PX.clamp(e * 1.6, 0, 1), "out"), n = Math.floor(46 * p);
          for (let s2 = 0; s2 < n; s2++) { const u = s2 / 46; R(g, mouth[0] + u * (60 + k * 22), mouth[1] - u * (34 - k * 10) + u * u * (40 + e * 14) + Math.sin(u * 14 + k * 2) * 3, 1, 2, [D.moss[1], D.amber[1], D.rose[1]][k]); } }
      }
      dust(g, t, [140, 100, 360, 160], 41, 16);
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // gram_scale (14): analytical balance with a pinch of DNA ("1 GRAM"), paperclip for size; behind the glass an endless
  // warehouse of data racks fading into fog. Labels 215 PETABYTES / 215 MILLION GIGABYTES
  K.gram_scale = (o) => {
    let KS, TP, TG, TC;
    const BY = 268, VX = 320, VY = 128;
    const FOG = mix(D.n3, D.steel[2], 0.35);
    return (g, t, d, c) => {
      { const k = d / 14; KS = Math.min(1, k); TP = o.pb ?? 2.5 * k; TG = o.gb ?? 7.0 * k; TC = o.clip ?? 7.0 * k; }
      // ---- far: warehouse (one-point perspective) ----
      PX.par(g, c, 0.35, () => {
        PX.vgrad(g, -20, -20, 680, VY + 20, dk(FOG, 0.5), FOG, 6); PX.vgrad(g, -20, VY, 680, 300 - VY, FOG, dk(FOG, 0.6), 6);
        // floor lines + ceiling light strips
        for (let k = -2; k <= 2; k++) PX.line(g, VX + k * 3, VY + 2, VX + k * 120, 300, dk(FOG, 0.3));
        for (let z = 18; z >= 1; z -= 0.9) { const s = 1 / z, y = VY - 186 * s, w = 70 * s, on = PX.p(t, TP + (z - 1) / 17 * 4.5, 0.4);
          A(g, 0.15 + (0.25 + 0.6 * s) * on, () => R(g, VX - w / 2, y, w, Math.max(1, 3 * s), mix(D.lamp, FOG, 1 - s * (0.4 + 0.6 * on))));
          if (on > 0) A(g, 0.12 * on * s, () => R(g, VX - w, VY + 160 * s, w * 2, Math.max(1, 2 * s), D.lamp)); }
        // rack walls left and right of a long aisle (near racks reach the frame edges)
        for (const side of [-1, 1]) for (let i = 40; i >= 0; i--) {
          const z0 = 1 + i * 0.45, z1 = z0 + 0.45, x0 = VX + side * 250 / z0, x1 = VX + side * 250 / z1;
          const top = VY - 190 / z0, bot = VY + 170 / z0, top1 = VY - 190 / z1, bot1 = VY + 170 / z1, f = PX.clamp(1 - 1.25 / Math.pow(z0, 0.8), 0, 1);
          const xa = Math.min(x0, x1), w = Math.abs(x0 - x1);
          if (w < 0.6) continue;
          const body = mix(D.n2, FOG, f), face = mix(D.n1, FOG, f), edge = mix(D.n5, FOG, f);
          // cabinet face as a trapezoid (column by column)
          for (let xx = 0; xx < w; xx++) { const k = side > 0 ? 1 - xx / w : xx / w, tt2 = PX.lerp(top1, top, k), bb = PX.lerp(bot1, bot, k); R(g, xa + xx, tt2, 1, bb - tt2, xx % Math.max(2, Math.round(w / 3)) === 0 ? body : face); }
          R(g, side < 0 ? xa : xa + w - 1, top, 1, bot - top, edge);
          // LEDs (dim, slow, a few per unit)
          const rows = Math.max(2, Math.round(22 / z0));
          for (let r = 0; r < rows; r++) { const k = 0.5, ty = PX.lerp(top1, top, k), by = PX.lerp(bot1, bot, k), ly = ty + 6 / z0 + r * (by - ty - 10 / z0) / rows;
            for (let q = 0; q < 2; q++) { const on = Math.sin(t * (0.5 + ((i * 7 + r * 3 + q) % 5) * 0.22) + i * 1.3 + r * 1.7 + q * 2) > -0.1;
              const col = ((i + r + q) % 5 === 0) ? D.amber[1] : D.moss[1];
              const wave = t > TG ? Math.abs(z0 - ((t - TG) * 4) % 24) < 0.7 : false;
              if (on || wave) R(g, xa + w * (0.3 + q * 0.3), ly, Math.max(1, Math.round(3 / z0)), Math.max(1, Math.round(2 / z0)), wave ? mix(D.amber[0], FOG, f * 0.6) : mix(col, FOG, f * 0.85)); } }
        }
        // drifting fog bands
        for (let b = 0; b < 4; b++) A(g, 0.12, () => R(g, ((t * (4 + b * 2) + b * 170) % 900) - 300, VY - 30 + b * 22, 300, 10 + b * 4, FOG));
      });
      // ---- glass wall: mullions + reflections ----
      PX.par(g, c, 0.8, () => {
        A(g, 0.04, () => R(g, 0, 0, 640, BY, D.glass));
        for (const mx of [-6, 206, 420, 634]) { R(g, mx, 0, 12, BY, D.n2); R(g, mx, 0, 2, BY, D.n4); R(g, mx + 10, 0, 2, BY, D.n1); }
        R(g, 0, 0, 640, 8, D.n2); R(g, 0, 7, 640, 1, D.n4);
        A(g, 0.035, () => { for (const [x, w] of [[60, 18], [96, 6], [470, 24], [506, 8]]) for (let y = 8; y < BY; y += 1) R(g, x + y * 0.35, y, w, 1, D.cream); });
      });
      // ---- bench ----
      R(g, 0, BY, 640, 92, D.n2); R(g, 0, BY, 640, 8, D.n3); R(g, 0, BY, 640, 1, D.n5); R(g, 0, BY + 8, 640, 2, D.n1);
      for (let x = 30; x < 640; x += 150) { PX.box(g, x, BY + 20, 136, 300, D.n3); R(g, x + 60, BY + 28, 16, 3, D.n5); }
      PX.glow(g, 320, BY - 10, 210, D.lampD, 0.38);
      // props: tube rack (left), spatula, notebook (right)
      A(g, 0.5, () => R(g, 116, BY - 1, 66, 3, SH(1))); R(g, 118, BY - 14, 62, 14, D.n4); R(g, 118, BY - 14, 62, 1, D.n6);
      for (let i = 0; i < 5; i++) { R(g, 123 + i * 11, BY - 28, 6, 18, mix(D.glass, D.n3, 0.45)); R(g, 124 + i * 11, BY - 27, 1, 14, lt(D.glass, 0.2)); R(g, 123 + i * 11, BY - 31, 6, 4, i === 2 ? D.amber[2] : D.n5); R(g, 124 + i * 11, BY - 15, 4, 4, mix(D.glass, D.cream, 0.2)); }
      PX.line(g, 200, BY - 2, 236, BY - 6, D.n6); R(g, 234, BY - 8, 6, 3, D.n7);
      A(g, 0.5, () => R(g, 470, BY - 1, 92, 3, SH(1))); R(g, 472, BY - 7, 88, 7, D.paperD); R(g, 472, BY - 7, 88, 1, D.paper); R(g, 515, BY - 7, 2, 7, D.n5);
      for (let l = 0; l < 3; l++) { R(g, 478, BY - 5 + l * 2, 30, 1, D.n6); R(g, 522, BY - 5 + l * 2, 30, 1, D.n6); }
      PX.line(g, 540, BY - 9, 580, BY - 16, D.amber[2]);
      // ---- analytical balance ----
      const bx = 248, bw = 144;
      A(g, 0.5, () => R(g, bx - 6, BY - 2, bw + 12, 5, SH(1)));
      R(g, bx, BY - 34, bw, 34, BEIGE[1]); R(g, bx, BY - 34, bw, 1, BEIGE[0]); R(g, bx + bw - 4, BY - 34, 4, 34, BEIGE[2]); R(g, bx, BY - 4, bw, 4, BEIGE[3]);
      // display
      R(g, bx + 10, BY - 26, 64, 16, D.n0); R(g, bx + 11, BY - 25, 62, 14, mix(D.n1, D.amber[2], 0.12));
      PX.text(g, "1 GRAM", bx + 42, BY - 23, { font: "v", size: 14, col: D.amber[0], align: "center" }); PX.glow(g, bx + 42, BY - 18, 24, D.amber[1], 0.12);
      for (let i = 0; i < 3; i++) { R(g, bx + 88 + i * 16, BY - 22, 10, 8, BEIGE[2]); R(g, bx + 88 + i * 16, BY - 22, 10, 1, BEIGE[0]); }
      // draft shield (glass box) with pan
      const gx = bx + 14, gy = BY - 112, gw = bw - 28, gh = 78;
      R(g, gx, gy, gw, 3, BEIGE[2]); R(g, gx, gy, gw, 1, BEIGE[0]);
      R(g, VX - 2, BY - 50, 4, 16, D.n5); R(g, VX - 22, BY - 52, 44, 3, D.n7); R(g, VX - 20, BY - 49, 40, 1, D.n5);
      R(g, VX - 10, BY - 54, 20, 2, D.paper); R(g, VX - 12, BY - 55, 3, 1, D.paper); R(g, VX + 10, BY - 55, 3, 1, D.paper);
      // the pinch of DNA (fluffy white precipitate)
      const fl = [[0, 0], [1, 0], [2, 0], [-1, 0], [0, -1], [1, -1], [-2, 0], [3, 0], [2, -1], [0, -2]];
      for (const [px, py] of fl) R(g, VX + px, BY - 55 + py, 1, 1, py < -1 ? D.n7 : D.cream);
      A(g, 0.25 + 0.15 * Math.sin(t * 1.3), () => PX.glow(g, VX, BY - 54, 10, D.cream, 0.3));
      A(g, 0.16, () => R(g, gx + 2, gy + 3, gw - 4, gh - 3, D.glass));
      R(g, gx, gy, 2, gh, BEIGE[2]); R(g, gx + gw - 2, gy, 2, gh, BEIGE[3]); R(g, gx + gw / 2, gy + 3, 1, gh - 3, mix(D.glass, D.n4, 0.4));
      A(g, 0.25, () => { PX.line(g, gx + 8, gy + 8, gx + 22, gy + 40, D.cream); PX.line(g, gx + 12, gy + 6, gx + 26, gy + 38, D.cream); PX.line(g, gx + gw - 26, gy + 20, gx + gw - 14, gy + 50, D.cream); });
      // ---- paperclip for size ----
      if (t >= TC - 0.3) {
        const p = PX.p(t, TC - 0.3, 0.5, "out"), cx = 404, cy = Math.round(BY - 6 - (1 - p) * 30);
        A(g, PX.clamp((t - TC + 0.3) / 0.2, 0, 1), () => {
          A(g, 0.4 * p, () => R(g, cx - 1, BY - 1, 30, 2, SH(1)));
          const ST = [D.n7, D.n6, D.n5];
          R(g, cx, cy, 26, 1, ST[0]); R(g, cx, cy + 5, 26, 1, ST[1]); R(g, cx - 1, cy + 1, 1, 4, ST[1]); R(g, cx + 26, cy + 1, 1, 4, ST[2]);
          R(g, cx + 4, cy + 2, 18, 1, ST[1]); R(g, cx + 22, cy + 2, 1, 2, ST[2]); R(g, cx + 3, cy + 1, 1, 3, ST[1]); R(g, cx + 6, cy + 3, 16, 1, ST[2]);
          R(g, cx + 2, cy, 6, 1, lt(D.n7, 0.5));
        });
      }
      // ---- labels ----
      if (t >= TP) label(g, "215 PETABYTES", 320, 40, PX.p(t, TP, 0.5));
      if (t >= TG) label(g, "215 MILLION GIGABYTES", 320, 58, PX.p(t, TG, 0.5), D.amber[0]);
      dust(g, t, [200, 120, 240, 140], 47, 18);
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // deep_time (7.5): museum cross-section: DNA vial safe in deep permafrost ice; a hard drive near the top rusts away
  K.deep_time = (o) => {
    let KS, TD, TH;
    const PX0 = 84, PX1 = 556, PY0 = 34, PY1 = 304, GY = 74, IY = 116, RY = 250;
    const r = PX.rnd(61), peb = [...Array(40)].map(() => [r(), r(), r()]), bub = [...Array(70)].map(() => [r(), r(), r()]);
    const frag = [...Array(16)].map(() => [r(), r(), r()]);
    const VX = 246, VY = 190, HX = 404, HY = 86;
    return (g, t, d, c) => {
      { const k = d / 7.5; KS = Math.min(1, k); TD = o.dna ?? 0.5 * k; TH = o.hdd ?? 4.5 * k; }
      // museum wall + floor (far)
      PX.par(g, c, 0.5, () => { wall(g, -20, 330, D.n2, D.n1); for (let x = -40; x < 680; x += 64) R(g, x, -20, 1, 360, dk(D.n2, 0.25)); });
      R(g, 0, 322, 640, 38, D.n1); R(g, 0, 322, 640, 1, D.n3);
      PX.glow(g, 320, 0, 300, D.lampD, 0.22);
      R(g, 120, 4, 400, 3, D.n3); for (const lx of [200, 440]) { R(g, lx - 4, 7, 8, 6, D.n4); R(g, lx - 3, 13, 6, 2, D.lamp); lampCone(g, lx, 15, 6, 150, 120, 0.05); }
      // frame
      A(g, 0.5, () => R(g, PX0 - 2, PY1 + 6, PX1 - PX0 + 12, 6, SH(1)));
      R(g, PX0 - 8, PY0 - 8, PX1 - PX0 + 16, PY1 - PY0 + 16, WOOD[2]); R(g, PX0 - 8, PY0 - 8, PX1 - PX0 + 16, 2, WOOD[0]); R(g, PX0 - 8, PY0 - 8, 2, PY1 - PY0 + 16, WOOD[1]);
      g.save(); g.beginPath(); g.rect(PX0, PY0, PX1 - PX0, PY1 - PY0); g.clip();
      // sky
      PX.vgrad(g, PX0, PY0, PX1 - PX0, GY - PY0, dk(D.steel[2], 0.45), mix(D.steel[2], D.n3, 0.4), 4);
      PX.particles(g, 3, 40, t, [PX0, PY0, PX1 - PX0, GY - PY0], { vy: 8, vx: -3, col: D.n7, a: 0.6, tw: 1 });
      // ground surface: grass + shrub
      R(g, PX0, GY - 2, PX1 - PX0, 3, D.moss[2]); for (let x = PX0; x < PX1; x += 3) R(g, x, GY - 2 - ((x * 7) % 4), 1, 2 + ((x * 7) % 4), x % 2 ? D.moss[2] : mix(D.moss[2], D.moss[1], 0.4));
      for (let i = 0; i < 8; i++) PX.line(g, 520, GY - 2, 520 + Math.sin(i) * 12, GY - 10 - (i % 3) * 4, dk(WOOD[2], 0.2));
      // soil
      const SOIL = [mix(mix(D.rust[2], D.paperD, 0.25), D.n3, 0.4), mix(mix(D.rust[2], D.paperD, 0.2), D.n2, 0.55), mix(D.rust[2], D.n1, 0.7)];
      R(g, PX0, GY + 1, PX1 - PX0, IY - GY - 1, SOIL[1]); R(g, PX0, GY + 1, PX1 - PX0, 8, SOIL[0]); R(g, PX0, IY - 8, PX1 - PX0, 8, SOIL[2]);
      for (const [a, b, s] of peb) R(g, PX0 + a * (PX1 - PX0), GY + 6 + b * (IY - GY - 10), 2 + s * 3, 2, s > 0.5 ? D.n5 : SOIL[0]);
      for (let i = 0; i < 6; i++) { let x = 120 + i * 80, y = GY; for (let k = 0; k < 18; k++) { x += Math.sin(k * 0.7 + i) * 1.4; y += 1.3; R(g, x, y, 1, 1, dk(WOOD[2], 0.1)); } }
      // permafrost ice bands
      const bands = [[IY, 22, 0.55], [IY + 22, 18, 0.42], [IY + 40, 30, 0.5], [IY + 70, 14, 0.36], [IY + 84, 26, 0.44], [IY + 110, RY - IY - 110, 0.3]];
      bands.forEach(([y, h, k], i) => { const col = mix(mix(D.glass, D.steel[2], 0.45 + (i % 2) * 0.12), D.n2, k); R(g, PX0, y, PX1 - PX0, h, col); R(g, PX0, y, PX1 - PX0, 1, lt(col, 0.1));
        for (let x = PX0; x < PX1; x += 2) { const w = Math.round(Math.sin(x * 0.03 + i * 2) * 1.5); R(g, x, y + h - 1 + w, 2, 1, dk(col, 0.22)); } });
      for (let i = 0; i < 7; i++) { let x = PX0 + 40 + i * 66, y = IY + 4 + (i % 3) * 20; for (let k = 0; k < 18; k++) { x += ((k * 7 + i) % 3) - 1; y += 2; A(g, 0.35, () => R(g, x, y, 1, 2, D.glass)); } }
      for (const [a, b, s2] of bub) { const bx = PX0 + a * (PX1 - PX0), by = IY + 4 + b * (RY - IY - 8); A(g, 0.3 + 0.25 * s2, () => { R(g, bx, by, s2 > 0.7 ? 2 : 1, s2 > 0.7 ? 2 : 1, D.glass); if (s2 > 0.85) R(g, bx + 1, by - 4, 1, 1, D.glass); }); }
      // bedrock strata
      for (let i = 0; i < 4; i++) { const y = RY + i * 14, col = [mix(D.n4, D.paperD, 0.1), mix(D.n4, D.n3, 0.5), D.n3, mix(D.n3, D.n2, 0.5)][i];
        R(g, PX0, y, PX1 - PX0, 14, col); for (let x = PX0; x < PX1; x += 4) R(g, x, y + Math.round(Math.sin(x * 0.05 + i) * 2), 4, 1, lt(col, 0.08)); }
      for (let i = 0; i < 5; i++) { let x = 120 + i * 92 + (i * 37) % 30, y = RY + 3; for (let k = 0; k < 9 + (i * 5) % 8; k++) { x += ((k * 5 + i * 3) % 5) - 2; y += 3; R(g, x, y, 1, 3, D.n2); } }
      for (let i = 0; i < 26; i++) R(g, PX0 + ((i * 97) % (PX1 - PX0)), RY + 4 + ((i * 31) % 46), 3 + (i % 3), 2, i % 2 ? D.n5 : D.n2);
      // depth ruler (ticks only)
      R(g, PX0 + 8, GY, 1, PY1 - GY, D.n6); for (let y = GY; y < PY1; y += 12) R(g, PX0 + 8, y, (y - GY) % 48 === 0 ? 6 : 3, 1, D.n6);
      // ---- the DNA vial, safe in the deep ice ----
      const vg = PX.p(t, TD, 0.8);
      PX.glow(g, VX + 4, VY + 8, 34, D.teal[0], 0.16 + 0.1 * vg);
      R(g, VX - 10, VY - 10, 28, 46, mix(D.glass, D.steel[2], 0.3)); A(g, 0.5, () => { R(g, VX - 10, VY - 10, 28, 1, lt(D.glass, 0.3)); R(g, VX - 10, VY - 10, 1, 46, lt(D.glass, 0.2)); });
      R(g, VX - 1, VY + 2, 10, 28, mix(D.glass, D.n3, 0.45)); R(g, VX, VY + 2, 2, 28, lt(D.glass, 0.35)); R(g, VX + 8, VY + 2, 1, 28, dk(D.glass, 0.35));
      R(g, VX - 2, VY - 4, 12, 7, D.rust[2]); R(g, VX - 2, VY - 4, 12, 1, D.rust[1]); R(g, VX - 2, VY + 2, 12, 1, dk(D.rust[2], 0.4));
      R(g, VX + 1, VY + 24, 6, 5, mix(D.glass, D.cream, 0.25)); R(g, VX - 1, VY + 30, 10, 1, dk(D.glass, 0.4));
      for (const [fx, fy] of [[-8, 4], [-6, 20], [14, 10], [12, 28], [-9, 30], [15, -6]]) { R(g, VX + fx, VY + fy, 3, 1, D.cream); R(g, VX + fx + 1, VY + fy - 1, 1, 3, D.cream); }
      for (let i = 0; i < 6; i++) { const ph = t * 1.5 + i * 1.3; if (Math.sin(ph) > 0.75) R(g, VX - 8 + ((i * 11) % 26), VY - 6 + ((i * 7) % 40), 1, 1, D.cream); }
      // ---- the hard drive near the top: rusts, then crumbles ----
      const rust = PX.clamp((t - 1.0) / Math.max(TH - 1.0, 0.1), 0, 1), cr = PX.clamp((t - TH) / 1.4, 0, 1);
      if (cr < 1) {
        const ST = [D.n7, D.n6, D.n5];
        g.save();
        if (cr > 0) { g.beginPath(); g.rect(HX - 4, HY - 8 + Math.round(cr * 22), 46, 40); g.clip(); }
        R(g, HX, HY, 38, 22, ST[1]); R(g, HX, HY, 38, 1, ST[0]); R(g, HX + 36, HY, 2, 22, ST[2]); R(g, HX + 4, HY + 4, 18, 10, D.paperD); R(g, HX + 6, HY + 6, 12, 1, D.n5); R(g, HX + 6, HY + 9, 8, 1, D.n5);
        R(g, HX + 26, HY + 6, 6, 6, ST[2]); for (let i = 0; i < 6; i++) R(g, HX + 4 + i * 5, HY + 18, 3, 2, D.amber[2]);
        const rr = PX.rnd(5); for (let i = 0; i < 70; i++) { const x = rr() * 38, y = rr() * 22, th = rr(); if (th < rust) R(g, HX + x, HY + y, 2, 2, th < rust * 0.5 ? D.rust[2] : D.rust[1]); }
        g.restore();
      }
      if (cr > 0) for (const [a, b, s] of frag) { const e = PX.ease(cr, "out"), x = HX + a * 38 + (a - 0.5) * 10 * e, y = HY + 6 + b * 16 + e * (8 + s * 14);
        A(g, 1 - cr * 0.7, () => R(g, x, y, s > 0.5 ? 3 : 2, 2, s > 0.6 ? D.rust[2] : mix(D.rust[2], D.n5, 0.5))); }
      if (cr > 0) A(g, 0.6 * cr, () => { for (let i = 0; i < 12; i++) R(g, HX + 2 + i * 3, HY + 22 + (i % 3), 3, 1, D.rust[2]); });
      g.restore();
      // glass over the diorama
      A(g, 0.05, () => { PX.line(g, PX0 + 40, PY0, PX0 + 140, PY1, D.cream); PX.line(g, PX0 + 52, PY0, PX0 + 152, PY1, D.cream); });
      // brass plaque under the frame
      R(g, 290, PY1 + 10, 60, 8, D.amber[2]); R(g, 290, PY1 + 10, 60, 1, D.amber[1]); for (let i = 0; i < 3; i++) R(g, 296 + i * 16, PY1 + 13, 12, 1, dk(D.amber[2], 0.4));
      // labels
      if (t >= TD) label(g, "HUNDREDS OF THOUSANDS OF YEARS", 330, 238, PX.p(t, TD, 0.6), D.teal[0]);
      if (t >= TH) label(g, "10 YEARS", HX + 19, HY - 16, PX.p(t, TH, 0.5), D.rust[0]);
      // foreground: brass stanchions + velvet rope
      for (const sx of [40, 600]) { R(g, sx - 2, 300, 5, 60, D.amber[2]); R(g, sx - 2, 300, 1, 60, D.amber[1]); PX.circle(g, sx, 298, 4, D.amber[1]); R(g, sx - 1, 296, 2, 1, D.amber[0]); }
      for (let x = 42; x < 598; x += 1) { const y = 304 + Math.round(Math.sin((x - 42) / 556 * Math.PI) * 26); R(g, x, y, 1, 4, D.plum[2]); R(g, x, y, 1, 1, D.plum[1]); }
      PX.vignette(g, 0.5);
    };
  };

  // ===================================================================================================
  // price_tag (9.5): lab supply counter; a "2 MB" file card; a receipt prints WRITE $7,000 / READ $2,000; eyebrows rise
  K.price_tag = (o) => {
    let KS, TW, TR;
    const BY = 252;
    const r = PX.rnd(71), boxes = [...Array(30)].map(() => [r(), r(), r()]);
    return (g, t, d, c) => {
      { const k = d / 9.5; KS = Math.min(1, k); TW = o.write ?? 2.5 * k; TR = o.read ?? 4.5 * k; }
      // far: supply shelves
      PX.par(g, c, 0.45, () => {
        wall(g, -20, BY, mix(D.n2, D.moss[2], 0.12), D.n1);
        for (let s = 0; s < 3; s++) { const sy = 70 + s * 56; R(g, 20, sy, 600, 4, dk(WOOD[1], 0.5)); R(g, 20, sy + 4, 600, 2, dk(WOOD[2], 0.6));
          let x = 26; for (let i = 0; i < 14 && x < 600; i++) { const [a, b, k] = boxes[(s * 9 + i) % 30], w = 22 + Math.floor(a * 26), h = 18 + Math.floor(b * 22);
            const col = dk([D.paperD, D.paper, D.steel[2], D.n5, D.teal[2]][Math.floor(k * 5)], 0.66); R(g, x, sy - h, w, h, col); R(g, x, sy - h, w, 1, lt(col, 0.15)); R(g, x + 4, sy - h + 6, w - 8, 5, dk(D.cream, 0.55)); x += w + 3 + Math.floor(a * 6); } }
        // wall clock (ticks only)
        PX.circle(g, 560, 34, 13, dk(D.cream, 0.5)); PX.circle(g, 560, 34, 11, dk(D.cream, 0.35)); for (let k = 0; k < 12; k++) R(g, 560 + Math.cos(k / 6 * Math.PI) * 9, 34 + Math.sin(k / 6 * Math.PI) * 9, 1, 1, D.n2);
        PX.line(g, 560, 34, 560 + Math.cos(t * 0.3) * 7, 34 + Math.sin(t * 0.3) * 7, D.n1); PX.line(g, 560, 34, 556, 29, D.n1);
      });
      // pendant lamp over the counter
      R(g, 359, -10, 2, 46, D.n4); for (let rr2 = 0; rr2 < 10; rr2++) { const w = 18 + rr2 * 3; R(g, 360 - w / 2, 36 + rr2, w, 1, rr2 < 2 ? D.n5 : mix(D.n4, D.moss[2], 0.35)); } R(g, 346, 46, 28, 2, D.lamp);
      lampCone(g, 360, 48, 40, 300, 200, 0.05);
      // the researcher behind the counter
      const brow = PX.KF([[0, 0], [TW + 0.3, 0], [TW + 0.6, 0.55], [TR + 0.3, 0.55], [TR + 0.6, 1]], t);
      const look = t > TW - 0.3 ? -1 : 0;
      bust(g, 476, 96, t, { brow, look, wide: PX.p(t, TR + 0.3, 0.3), o: t > TR + 0.5 && t < TR + 3.2 });
      { const gp = (t - TR - 2.2) / 0.5; if (gp > 0 && gp < 1) for (const ex of [469, 483]) { const gx = ex - 6 + Math.round(gp * 12); R(g, gx, 131, 1, 9, D.cream); R(g, gx + 1, 131, 1, 9, D.lamp); } }
      mug(g, 400, BY - 12, t);
      PX.glow(g, 360, 200, 220, D.lampD, 0.3);
      // counter
      R(g, 0, BY, 640, 108, mix(WOOD[2], D.n1, 0.55)); R(g, 0, BY, 640, 10, WOOD[1]); R(g, 0, BY, 640, 1, WOOD[0]); R(g, 0, BY + 10, 640, 2, dk(WOOD[2], 0.5));
      for (let x = 20; x < 640; x += 120) { PX.box(g, x, BY + 22, 104, 140, dk(WOOD[2], 0.45)); R(g, x + 1, BY + 23, 102, 1, mix(WOOD[2], D.n2, 0.2)); }
      // service bell
      R(g, 560, BY - 3, 26, 3, D.n4); for (let rr2 = 0; rr2 < 8; rr2++) { const w = 20 - Math.round(rr2 * rr2 * 0.25); R(g, 573 - w / 2, BY - 3 - rr2, w, 1, rr2 < 2 ? D.amber[2] : D.amber[1]); } R(g, 572, BY - 13, 2, 3, D.n5); R(g, 568, BY - 8, 3, 2, D.amber[0]);
      // file card "2 MB"
      const fx = 108, fy = BY - 54;
      A(g, 0.5, () => R(g, fx - 2, BY - 2, 48, 3, SH(1)));
      R(g, fx, fy, 44, 54, D.paper); R(g, fx, fy, 44, 1, lt(D.paper, 0.4)); R(g, fx + 42, fy, 2, 54, D.paperD);
      for (let k = 0; k < 10; k++) R(g, fx + 34 + k, fy, 10 - k, 1, k < 10 ? D.n2 : D.paper);
      for (let k = 0; k < 10; k++) R(g, fx + 34, fy + k, k + 1, 1, D.paperD);
      PX.text(g, "2 MB", fx + 22, fy + 22, { size: 8, col: D.ink, align: "center" }); for (let l = 0; l < 3; l++) R(g, fx + 8, fy + 36 + l * 4, 26 - l * 6, 1, D.n6);
      // receipt printer + paper
      const px0 = 222, slot = BY - 30;
      const feed = 10 * PX.p(t, 0.4, 0.5) + 22 * PX.p(t, TW - 0.15, 0.35) + 22 * PX.p(t, TR - 0.15, 0.35) + 26 * PX.p(t, TR + 0.7, 0.6);
      const lines = [[3, "dash"], [12, "WRITE $7,000", TW], [34, "READ $2,000", TR], [50, "dash"], [62, "tear"]];
      const top = slot - 4 - feed;
      R(g, px0 + 4, top, 92, slot - top, D.paper); R(g, px0 + 4, top, 1, slot - top, lt(D.paper, 0.4)); R(g, px0 + 94, top, 2, slot - top, D.paperD);
      for (let x = 0; x < 92; x += 4) R(g, px0 + 4 + x, top - 1, 2, 1, D.paper);
      for (const [at, s, tt] of lines) { const y = slot - 4 - (feed - at); if (y < top || y > slot - 10) continue;
        if (s === "dash") { for (let x = 8; x < 86; x += 4) R(g, px0 + 4 + x, y + 4, 2, 1, D.n6); }
        else if (s !== "tear" && t >= tt) PX.text(g, s, px0 + 50, y, { font: "v", size: 16, col: D.ink, align: "center" }); }
      A(g, 0.5, () => R(g, px0 - 2, BY - 2, 104, 4, SH(1)));
      R(g, px0, slot, 100, 30, D.n3); R(g, px0, slot, 100, 1, D.n5); R(g, px0 + 97, slot, 3, 30, D.n2); R(g, px0 + 8, slot + 2, 84, 3, D.n1);
      R(g, px0 + 10, slot + 16, 5, 3, t < TR + 1.3 ? (PX.blink(t, 0.5) ? D.moss[0] : D.moss[2]) : D.moss[1]);
      // labels: none (the receipt carries the numbers)
      dust(g, t, [220, 60, 280, 170], 53, 20);
      PX.vignette(g, 0.55);
    };
  };

  // ===================================================================================================
  // fountain (10): courtyard at dusk; droplets carry letters; some are lost, the bucket still fills and the picture
  // reassembles (error correction); a phone streaming video catches the same droplets
  K.fountain = (o) => {
    let KS, TL, TR, TP;
    const G = 120, SX = 320, SY = 184;
    const r = PX.rnd(83), LET = [...Array(400)].map(() => "ACGT"[Math.floor(r() * 4)] + "ACGT"[Math.floor(r() * 4)]);
    const DT = 0.16;
    const BK = [452, 268], PH = [158, 236];
    const tileOrd = [...Array(48)].map((_, i) => [i, r()]).sort((a, b) => a[1] - b[1]).map((q) => q[0]);
    // droplet k: side, launch time, velocities, fate
    const drop = (k) => {
      const t0 = k * DT, right = k % 2 === 0, j = PX.rnd(500 + k)();
      const vy = -70 - j * 6, tl = (-vy + Math.sqrt(vy * vy + 2 * G * (262 - SY))) / G;
      let tx, fate;
      if (right) { const lost = t0 >= TL && (k % 6 === 2 || k % 6 === 4) && k % 12 !== 4; tx = lost ? BK[0] + 54 + j * 30 : BK[0] + (j - 0.5) * 8; fate = lost ? "lost" : "bucket"; }
      else { const ph = t0 >= TP - 1.6; tx = ph ? PH[0] + 19 + (j - 0.5) * 6 : SX - 50 - j * 20; fate = ph ? "phone" : "basin"; }
      return { t0, vy, tl, vx: (tx - SX) / tl, fate, s: LET[k % 400] };
    };
    let DROPS = [], dKey = -1;   // rebuilt only when d changes (pure function of d)
    const landed = (t) => DROPS.filter((q) => q.fate === "bucket" && t >= q.t0 + q.tl).length;
    return (g, t, d, c) => {
      { const k = d / 10; KS = Math.min(1, k); TL = o.lost ?? 2.0 * k; TR = o.rebuild ?? 5.0 * k; TP = o.phone ?? 7.0 * k; }
      if (dKey !== d) { dKey = d; DROPS = [...Array(Math.ceil(d / DT) + 1)].map((_, k) => drop(k)); }
      // sky
      PX.vgrad(g, 0, 0, 640, 200, mix(D.n2, D.steel[2], 0.45), mix(mix(D.rose[2], D.amber[2], 0.45), D.n3, 0.35), 10);
      PX.particles(g, 9, 14, t, [0, 0, 640, 70], { vy: 0, col: D.n7, a: 0.5, tw: 0.8 });
      // far: old stone buildings + tower
      PX.par(g, c, 0.35, () => {
        const B1 = mix(D.n2, D.steel[2], 0.25);
        R(g, -20, 120, 680, 120, B1);
        for (const [x, w, h] of [[-20, 120, 40], [100, 90, 20], [190, 60, 70], [250, 140, 30], [390, 80, 54], [470, 190, 26]]) { R(g, x, 120 - h, w, h, B1); R(g, x, 120 - h, w, 1, lt(B1, 0.08)); }
        R(g, 206, 30, 28, 30, B1); for (let k = 0; k < 14; k++) R(g, 206 + k, 30 - k, 28 - 2 * k, 1, B1);
        const wins = [[30, 100], [60, 100], [128, 116], [214, 70], [270, 104], [300, 104], [410, 84], [440, 84], [500, 108], [560, 108], [600, 108]];
        wins.forEach(([x, y], i) => { const lit = i === 3 || i === 7 || i === 9; R(g, x, y, 8, 12, lit ? D.lampD : dk(B1, 0.3)); for (let k = 0; k < 4; k++) R(g, x + k, y - 3 + Math.min(k, 3 - k) * 0, 8 - 2 * k, 1, lit ? D.lampD : dk(B1, 0.3));
          if (lit) { R(g, x + 1, y + 1, 6, 4, D.lamp); PX.glow(g, x + 4, y + 6, 14, D.lampD, 0.25); } });
      });
      // mid: colonnade + cypress trees
      PX.par(g, c, 0.65, () => {
        const S = [mix(D.n4, D.paperD, 0.15), D.n3, D.n2];
        R(g, -20, 150, 680, 100, S[1]); R(g, -20, 150, 680, 6, S[0]);
        for (let x = -10; x < 660; x += 56) { R(g, x + 10, 170, 36, 80, S[2]); PX.circle(g, x + 28, 172, 18, S[2]); R(g, x + 10, 172, 36, 4, S[2]); R(g, x + 46, 156, 10, 94, S[0]); R(g, x + 46, 156, 2, 94, lt(S[0], 0.12)); }
        for (const tx of [40, 600]) { for (let k = 0; k < 70; k++) { const w = Math.round(Math.sin(k / 70 * Math.PI) * 12 + 2); R(g, tx - w / 2 + Math.sin(t * 0.7 + k * 0.1) * (k / 70), 250 - k * 1.3, w, 2, k % 7 < 2 ? D.moss[2] : dk(D.moss[2], 0.3)); } }
      });
      // paving
      R(g, 0, 248, 640, 112, mix(D.n3, D.paperD, 0.12)); R(g, 0, 248, 640, 1, D.n4);
      for (let k = -8; k <= 8; k++) PX.line(g, 320 + k * 40, 248, 320 + k * 110, 360, D.n2);
      for (const y of [262, 280, 304, 334]) R(g, 0, y, 640, 1, D.n2);
      // lamp post (left)
      R(g, 66, 150, 4, 98, D.n1); R(g, 60, 246, 16, 4, D.n1); R(g, 58, 138, 20, 4, D.n1); R(g, 61, 126, 14, 12, D.lampD); R(g, 63, 128, 10, 8, D.lamp); R(g, 60, 122, 16, 4, D.n1);
      PX.glow(g, 68, 132, 80, D.lampD, 0.4); PX.glow(g, 68, 250, 90, D.lampD, 0.18);
      // fountain: round basin (oval rim + water), column, top bowl
      const ST = [mix(D.paperD, D.n5, 0.35), mix(D.n5, D.paperD, 0.2), D.n4, D.n3];
      const ell = (cx, cy, rx, ry, col, fill) => { for (let yy = -ry; yy <= ry; yy++) { const w = Math.round(rx * Math.sqrt(1 - (yy * yy) / (ry * ry))); if (fill) R(g, cx - w, cy + yy, 2 * w + 1, 1, col); else { R(g, cx - w, cy + yy, 2, 1, col); R(g, cx + w - 1, cy + yy, 2, 1, col); } } };
      A(g, 0.4, () => ell(SX, 300, 108, 9, SH(1), true));
      for (let xx = -100; xx <= 100; xx++) { const k = Math.sqrt(1 - (xx * xx) / (100 * 100)), yb = Math.round(268 + 14 * k), h = 26;
        R(g, SX + xx, yb, 1, h, xx > 70 ? ST[2] : xx < -80 ? ST[0] : ST[1]); R(g, SX + xx, yb + h - 2, 1, 2, ST[3]); if (xx % 25 === 0) R(g, SX + xx, yb + 4, 1, h - 6, ST[2]); }
      ell(SX, 268, 100, 14, ST[0], true); ell(SX, 268, 92, 11, mix(D.teal[2], D.n2, 0.35), true);
      for (let k = 0; k < 14; k++) { const ph = t * 1.4 + k * 1.7, rr2 = (ph % 3) / 3; A(g, 0.5 * (1 - rr2), () => ell(SX + ((k * 37) % 120) - 60, 268 + ((k * 13) % 10) - 5, Math.round(3 + rr2 * 12), Math.max(1, Math.round(1 + rr2 * 3)), D.teal[0], false)); }
      // column with base + ring
      R(g, SX - 14, 254, 28, 8, ST[1]); R(g, SX - 14, 254, 28, 1, ST[0]); R(g, SX + 8, 254, 6, 8, ST[2]);
      R(g, SX - 7, 200, 14, 54, ST[1]); R(g, SX - 7, 200, 3, 54, ST[0]); R(g, SX + 3, 200, 4, 54, ST[2]); R(g, SX - 10, 226, 20, 4, ST[0]); R(g, SX - 10, 229, 20, 1, ST[3]);
      for (let k = 0; k < 9; k++) { const w = 56 - k * 4; R(g, SX - w / 2, 188 + k, w, 1, k === 0 ? ST[0] : k > 5 ? ST[2] : ST[1]); }
      ell(SX, 188, 28, 3, mix(D.teal[2], D.n2, 0.3), true); R(g, SX - 2, SY - 6, 4, 8, D.teal[1]);
      // fine spray: thin arcs of tiny droplets + curtain from the top bowl
      for (let k = 0; k < 90; k++) { const side = k % 2 ? 1 : -1, ph = ((t * 0.9 + k * 0.137) % 1), vx = side * (30 + (k % 7) * 6), vy = -58 - (k % 5) * 3, e = ph * 1.6;
        const x = SX + vx * e, y = SY + vy * e + 0.5 * G * e * e; if (y > 266) continue; A(g, 0.55, () => R(g, x, y, 1, 1, D.glass)); }
      for (let k = 0; k < 24; k++) { const x = SX + (k < 12 ? -28 - (k % 3) : 26 + (k % 3)), y = 190 + ((t * 60 + k * 23) % 72); if (y < 262) A(g, 0.35, () => R(g, x, y, 1, 3, D.glass)); }
      // bucket (right) + its water level
      const lv = PX.clamp(landed(t) / 22, 0, 1);
      const bx = BK[0] - 16, by = BK[1] - 6;
      A(g, 0.4, () => R(g, bx - 2, by + 30, 36, 3, SH(1)));
      R(g, bx, by, 32, 30, mix(WOOD[1], D.n3, 0.35)); R(g, bx, by, 3, 30, mix(WOOD[0], D.n3, 0.3)); R(g, bx + 28, by, 4, 30, mix(WOOD[2], D.n2, 0.3)); R(g, bx - 1, by + 6, 34, 2, D.n5); R(g, bx - 1, by + 22, 34, 2, D.n5);
      R(g, bx + 2, by - 2, 28, 3, mix(D.teal[2], D.n1, 0.4)); if (lv > 0) { R(g, bx + 3, by - 1, 26, 2, D.teal[1]); A(g, lv, () => R(g, bx + 5, by - 1, 10, 1, D.teal[0])); }
      PX.line(g, bx, by, bx + 16, by - 18, D.n5); PX.line(g, bx + 32, by, bx + 16, by - 18, D.n5);
      // picture on an easel, rebuilt tile by tile
      const ex = 508, ey = 150, tw = 10, th = 9;
      PX.line(g, ex + 10, ey + 50, ex - 4, 270, WOOD[2]); PX.line(g, ex + 60, ey + 50, ex + 76, 270, WOOD[2]); PX.line(g, ex + 36, ey + 50, ex + 40, 266, WOOD[2]);
      R(g, ex - 4, ey - 4, 88, 63, WOOD[2]); R(g, ex - 4, ey - 4, 88, 1, WOOD[0]); R(g, ex, ey, 80, 54, D.n2);
      const got = Math.floor(landed(t) * 48 / 22), reb = PX.clamp((t - TR) / 1.1, 0, 1);
      for (let n = 0; n < 48; n++) {
        const k = tileOrd[n], tx = k % 8, ty = Math.floor(k / 8);
        const on = n < Math.min(got, 48) * 0.7 || reb * 48 > n; if (!on) { A(g, 0.5, () => PX.box(g, ex + tx * tw, ey + ty * th, tw, th, D.n3)); continue; }
        // the picture: dusk sky, sun, hills (same photo as on the monitor)
        for (let yy = 0; yy < th; yy++) for (let xx = 0; xx < tw; xx += 2) { const X = tx * tw + xx, Y = ty * th + yy;
          const hill = 54 - Math.max(18 - Math.abs(X - 22) * 0.7, 12 - Math.abs(X - 60) * 0.5, 4);
          let col = Y > hill ? (Y > hill + 6 ? D.moss[2] : D.moss[1]) : mix(D.steel[1], D.cream, Y / 70);
          if ((X - 58) * (X - 58) + (Y - 14) * (Y - 14) < 36) col = D.amber[0];
          R(g, ex + X, ey + Y, 2, 1, col); }
        if (reb > 0 && reb * 48 > n && reb * 48 < n + 6 && n >= got * 0.7) A(g, 0.5, () => R(g, ex + tx * tw, ey + ty * th, tw, th, D.cream));
      }
      // phone on a little stand (left), streaming video once the droplets reach it
      if (t >= TP - 1.0) {
        const a = PX.p(t, TP - 1.0, 0.6), x = PH[0], y = PH[1] + Math.round((1 - a) * 10);
        A(g, a, () => {
          A(g, 0.4, () => R(g, x - 4, 270, 46, 3, SH(1))); R(g, x + 10, 254, 18, 16, D.n2); R(g, x + 4, 268, 30, 3, D.n2);
          R(g, x, y - 26, 38, 62, D.n1); R(g, x, y - 26, 38, 1, D.n4); R(g, x + 1, y - 26, 1, 62, D.n3);
          const sx = x + 3, sy = y - 20, sw = 32, sh = 48;
          const on = PX.p(t, TP, 0.4);
          R(g, sx, sy, sw, sh, D.n0);
          A(g, on, () => {
            for (let yy = 0; yy < 30; yy++) R(g, sx, sy + 6 + yy, sw, 1, yy > 20 ? D.moss[2] : mix(D.steel[1], D.cream, yy / 40));
            const cx = sx + ((t * 6) % (sw + 20)) - 10; R(g, cx, sy + 12, 10, 3, D.cream); R(g, cx + 3, sy + 10, 5, 2, D.cream);
            for (let k = 0; k < sw; k++) R(g, sx + k, sy + 26 - Math.round(Math.max(0, 5 - Math.abs(k - 12 - Math.sin(t) * 2) * 0.6)), 1, 2, D.moss[1]);
            R(g, sx + 2, sy + 40, sw - 4, 2, D.n3); R(g, sx + 2, sy + 40, (sw - 4) * PX.clamp((t - TP) / 4, 0, 1), 2, D.rust[1]);
          });
        });
      }
      // droplets
      for (const q of DROPS) {
        const e = t - q.t0; if (e < 0) continue;
        const land = q.tl, x = SX + q.vx * Math.min(e, land), y = SY + q.vy * Math.min(e, land) + 0.5 * G * Math.min(e, land) ** 2;
        if (e < land) {
          const lostLook = q.fate === "lost" && e > land * 0.55;
          A(g, lostLook ? 0.75 : 0.95, () => {
            const body = mix(D.glass, D.teal[2], lostLook ? 0.75 : 0.5);
            PX.circle(g, x, y, 6, dk(body, 0.25)); PX.circle(g, x, y, 5, body); R(g, x - 1, y - 8, 2, 2, body); R(g, x, y - 9, 1, 1, body);
            R(g, x - 3, y - 4, 2, 1, lt(D.glass, 0.4)); R(g, x - 4, y - 3, 1, 2, lt(D.glass, 0.4));
            PX.text(g, q.s, x, y - 5, { font: "v", size: 10, col: lostLook ? D.n5 : D.n0, align: "center" });
          });
          A(g, 0.25, () => R(g, x - q.vx * 0.03, y - (q.vy + G * e) * 0.03, 2, 2, D.glass));
        } else if (e < land + 0.8) {
          const k = (e - land) / 0.8;
          if (q.fate === "lost") { A(g, 1 - k, () => { for (let s = 0; s < 6; s++) R(g, x + Math.cos(s) * k * 10, 262 - Math.sin(s * 0.5 + 0.3) * k * 7, 2, 1, D.glass);
            PX.text(g, q.s[0], x - 6 - k * 8, 262 - k * 4, { font: "v", size: 10, col: D.n6 }); PX.text(g, q.s[1], x + 4 + k * 8, 262 - k * 3, { font: "v", size: 10, col: D.n6 }); R(g, x - 6, 264, 12, 1, mix(D.n3, D.teal[2], 0.4)); }); }
          else if (k < 0.4) A(g, 1 - k / 0.4, () => { R(g, x - 3, y - 2, 1, 2, D.glass); R(g, x + 3, y - 2, 1, 2, D.glass); R(g, x, y - 4, 1, 2, D.glass); });
        }
      }
      PX.vignette(g, 0.5);
    };
  };
})();
