/* Group D kinds: oldpage, landscape, collision, lhc, bhinfo, hologram, finale.  (style v2.1, calm documentary) */
(function () {
  const { THREE, M, P, seg, lerp, clamp, rnd, KF, orbit, cam, stage, tex, canvasTex, glowSprite, liveTube } = L3;
  const TAU = Math.PI * 2;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // integer hash -> 0..1 (pure)
  const hf = (i, k) => { let n = Math.imul((i | 0) + 1, 0x9E3779B1) ^ Math.imul(((k || 0) | 0) + 7, 0x85EBCA77); n ^= n >>> 15; n = Math.imul(n, 0x2C1B3C6D); n ^= n >>> 12; n = Math.imul(n, 0x297A2D39); n ^= n >>> 15; return (n >>> 0) / 4294967296; };
  function vnoise(seed) {
    const h = (i, j) => hf(Math.imul(i, 73856093) ^ Math.imul(j, 19349663), seed);
    return (x, y) => { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
      const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
  }
  let DOT; const dotTex = () => DOT || (DOT = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  let RINGT; const ringTex = () => RINGT || (RINGT = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.8, "rgba(255,255,255,0)"); gr.addColorStop(0.86, "rgba(255,255,255,1)"); gr.addColorStop(0.9, "rgba(255,255,255,.25)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }));
  let DISKT; const diskTex = () => DISKT || (DISKT = canvasTex(1024, 1024, (g) => {
    const r = rnd(5);
    for (let i = 0; i < 260; i++) { const rr = 512 * (0.44 + 0.56 * Math.pow(r(), 1.4)); const a = 0.04 + 0.12 * r() * (1 - (rr / 512 - 0.44) / 0.56); g.strokeStyle = `rgba(255,${190 + 50 * r() | 0},${130 + 70 * r() | 0},${a.toFixed(3)})`; g.lineWidth = 1 + 5 * r(); g.beginPath(); g.arc(512, 512, rr, r() * TAU, r() * TAU + 1 + 4 * r()); g.stroke(); }
    const gr = g.createRadialGradient(512, 512, 225, 512, 512, 512); gr.addColorStop(0, "rgba(255,226,180,.55)"); gr.addColorStop(0.25, "rgba(255,190,130,.22)"); gr.addColorStop(1, "rgba(255,170,110,0)"); g.fillStyle = gr; g.beginPath(); g.arc(512, 512, 512, 0, TAU); g.arc(512, 512, 225, 0, TAU, true); g.fill();
  }));
  // black plane in front of the camera for fades
  function fader(S, C) { S.add(C); const m = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false })); m.position.z = -0.5; m.renderOrder = 999; C.add(m); return m.material; }
  // closed vibrating string: standing wave with n lobes; set m.userData.p.w (phase) each frame
  function sloop(R, rad, mat, segs) {
    const p = { R, n: 3, a: 0.1, z: 0.25, w: 0, ph0: 0 }, v = new THREE.Vector3();
    const m = liveTube((u) => { const th = u * TAU, s = Math.sin(p.n * th + p.ph0), c = Math.cos(p.n * th + p.ph0), r = p.R * (1 + p.a * s * Math.cos(p.w)); return v.set(r * Math.cos(th), p.R * p.z * c * Math.sin(p.w), r * Math.sin(th)); }, segs || 150, rad, mat, true);
    m.userData.p = p; return m;
  }
  // Hanson-style curled (Calabi-Yau cross-section) surface, ~radius 1
  function cyGeo(n, N) {
    const pos = [], idx = [], ca = Math.SQRT1_2, sa = Math.SQRT1_2;
    const cp = (re, im, p, rot) => { const r = Math.pow(Math.hypot(re, im), p), th = Math.atan2(im, re) * p + rot; return [r * Math.cos(th), r * Math.sin(th)]; };
    for (let k1 = 0; k1 < n; k1++) for (let k2 = 0; k2 < n; k2++) {
      const b0 = pos.length / 3;
      for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
        const x = -1 + 2 * i / N, y = (Math.PI / 2) * j / N;
        const z1 = cp(Math.cosh(x) * Math.cos(y), Math.sinh(x) * Math.sin(y), 2 / n, TAU * k1 / n);
        const z2 = cp(Math.sinh(x) * Math.cos(y), Math.cosh(x) * Math.sin(y), 2 / n, TAU * k2 / n);
        pos.push(z1[0] * 0.75, z2[0] * 0.75, (ca * z1[1] + sa * z2[1]) * 0.75);
      }
      for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) { const a = b0 + i * (N + 1) + j, b = a + N + 1; idx.push(a, b, a + 1, b, b + 1, a + 1); }
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx); g.computeVertexNormals(); return g;
  }
  const pearl = () => new THREE.MeshPhysicalMaterial({ color: 0xc3ccd8, roughness: 0.32, metalness: 0.15, clearcoat: 0.6, clearcoatRoughness: 0.25, sheen: 0.6, sheenColor: new THREE.Color(0xdfe6f0), side: THREE.DoubleSide });
  // textured Earth (radius 1) with clouds
  function earth() {
    const g = new THREE.Group();
    const e = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.MeshStandardMaterial({ map: tex("2k_earth_daymap.jpg"), roughness: 0.85, metalness: 0, transparent: true }));
    const c = new THREE.Mesh(new THREE.SphereGeometry(1.006, 96, 64), new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: tex("2k_earth_clouds.jpg"), transparent: true, opacity: 0.85, depthWrite: false, roughness: 1 }));
    g.add(e, c); g.userData.mats = [e.material, c.material]; g.userData.clouds = c; return g;
  }
  // spiral galaxy as soft points, radius 1, disc in the xz plane
  function galaxy(seed, N) {
    const r = rnd(seed), pos = [], col = [];
    const gauss = () => (r() + r() + r() - 1.5) / 1.5;
    for (let i = 0; i < N; i++) {
      let x, y, z, d, warm;
      const pop = r();
      if (pop < 0.16) { d = 0.2 * Math.abs(gauss()); const th = r() * TAU, ph = Math.acos(2 * r() - 1); x = d * Math.sin(ph) * Math.cos(th); z = d * Math.sin(ph) * Math.sin(th); y = d * Math.cos(ph) * 0.55; warm = 1; }
      else if (pop < 0.45) { d = Math.min(1.1, -Math.log(1 - r() * 0.97) * 0.3); const th = r() * TAU; x = d * Math.cos(th); z = d * Math.sin(th); y = gauss() * 0.025; warm = Math.max(0, 0.7 - d); }
      else { d = 0.12 + 0.88 * Math.pow(r(), 0.9); const arm = (i % 4) * Math.PI / 2; const th = arm + Math.log(d * 9 + 0.3) * 2.1 + gauss() * 0.24; x = d * Math.cos(th) + gauss() * 0.03; z = d * Math.sin(th) + gauss() * 0.03; y = gauss() * 0.02; warm = Math.max(0, 0.5 - d) * 0.6; }
      pos.push(x, y, z);
      const b = 0.22 + 0.55 * Math.pow(r(), 3); col.push(b * lerp(0.8, 1.0, warm), b * lerp(0.86, 0.86, warm), b * lerp(1.0, 0.68, warm));
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending }));
    const grp = new THREE.Group(); grp.add(pts);
    const core = glowSprite(0xffe2bc, 0.75, 0.45); grp.add(core);
    const haze = glowSprite(0xc9d4ea, 1.6, 0.05); grp.add(haze);
    grp.userData.fade = (a) => { pts.material.opacity = a; core.material.opacity = 0.4 * a; haze.material.opacity = 0.05 * a; };
    return grp;
  }
  function blackCore(r) { return new THREE.Mesh(new THREE.SphereGeometry(r, 64, 32), new THREE.MeshBasicMaterial({ color: 0x000000 })); }

  // ===================================================================== oldpage
  LABK.oldpage = (o) => {
    const S = stage("studio", { key: 1.1, hemi: 0.08, rim: 0.2, floorY: -3 });
    const key = S.userData.key; key.color.set(0xffe0bc); key.position.set(-9, 8, -5);
    const C = cam(30), fade = fader(S, C);
    // desk
    const wood = canvasTex(2048, 1024, (g, w, h) => {
      g.fillStyle = "#3a2516"; g.fillRect(0, 0, w, h); const r = rnd(11);
      for (let i = 0; i < 1100; i++) { const y = r() * h, dk = r() < 0.6; g.strokeStyle = dk ? `rgba(18,10,5,${0.06 + 0.14 * r()})` : `rgba(96,62,36,${0.05 + 0.1 * r()})`; g.lineWidth = 0.6 + r() * 2.6; g.beginPath(); g.moveTo(0, y); const f1 = 0.002 + r() * 0.003, f2 = r() * 9; for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * f1 + f2) * 9 + Math.sin(x * 0.011 + i) * 1.5); g.stroke(); }
      for (let k = 1; k < 3; k++) { g.fillStyle = "rgba(8,5,2,.75)"; g.fillRect(0, k * h / 3 - 2, w, 3); }
    });
    wood.anisotropy = 8;
    const desk = new THREE.Mesh(new THREE.PlaneGeometry(18, 9), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.5, metalness: 0, envMapIntensity: 0.3 }));
    desk.rotation.x = -Math.PI / 2; desk.receiveShadow = true; S.add(desk);
    // parchment
    const PW = 2048, PH = 1448;
    const base = document.createElement("canvas"); base.width = PW; base.height = PH;
    { const g = base.getContext("2d"), r = rnd(23);
      g.fillStyle = "#d8c7a2"; g.fillRect(0, 0, PW, PH);
      for (let i = 0; i < 180; i++) { const x = r() * PW, y = r() * PH, rr = 40 + 240 * r(), gr = g.createRadialGradient(x, y, 0, x, y, rr); const c = r() < 0.6 ? `rgba(140,98,50,${(0.03 + 0.07 * r()).toFixed(3)})` : `rgba(246,232,200,${(0.05 + 0.08 * r()).toFixed(3)})`; gr.addColorStop(0, c); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
      for (let i = 0; i < 4000; i++) { g.strokeStyle = `rgba(110,80,44,${(0.03 + 0.05 * r()).toFixed(3)})`; g.lineWidth = 1; const x = r() * PW, y = r() * PH, a = r() * TAU, l = 4 + 16 * r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
      const lg = (x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, "rgba(84,52,22,.55)"); gr.addColorStop(1, "rgba(84,52,22,0)"); return gr; };
      g.fillStyle = lg(0, 0, 170, 0); g.fillRect(0, 0, 170, PH); g.fillStyle = lg(PW, 0, PW - 170, 0); g.fillRect(PW - 170, 0, 170, PH);
      g.fillStyle = lg(0, 0, 0, 150); g.fillRect(0, 0, PW, 150); g.fillStyle = lg(0, PH, 0, PH - 150); g.fillRect(0, PH - 150, PW, 150);
      // faint old writing (illegible), above and below the formula
      const scrib = (y0, rows) => { for (let row = 0; row < rows; row++) { let x = 210 + (row === 0 ? 120 : 0); const y = y0 + row * 74; while (x < PW - 260) { const wl = 40 + 150 * r(); g.strokeStyle = `rgba(62,40,20,${(0.16 + 0.1 * r()).toFixed(3)})`; g.lineWidth = 1.8; g.beginPath(); for (let s = 0; s <= wl; s += 2) { const ph = s * 0.55 + x, yy = y - Math.abs(Math.sin(ph)) * 13 * (0.55 + 0.45 * Math.sin(s * 0.11 + row)) - (Math.sin(ph * 0.21 + row) > 0.93 ? 14 * Math.abs(Math.sin(ph)) : 0), xx = x + s - 4 * Math.cos(ph); s === 0 ? g.moveTo(xx, yy) : g.lineTo(xx, yy); } g.stroke(); x += wl + 22 + 18 * r(); } } };
      scrib(200, 5); scrib(1030, 4);
    }
    // the formula, drawn once into an ink layer
    const ink = document.createElement("canvas"); ink.width = PW; ink.height = PH;
    let fx0 = 0, fx1 = PW;
    { const g = ink.getContext("2d"), y = 760; g.fillStyle = g.strokeStyle = "rgba(36,20,9,.93)"; g.shadowColor = "rgba(36,20,9,.45)"; g.shadowBlur = 3;
      const F = (s) => (g.font = `italic ${s}px Georgia, "Times New Roman", serif`);
      const parts = [["B(x, y) = ", 150, 0], ["INT"], ["t", 150, 0], ["x−1", 84, -70], [" (1−t)", 150, 0], ["y−1", 84, -70], [" dt", 150, 0]];
      let w = 0; for (const p of parts) { if (p[0] === "INT") { w += 175; continue; } F(p[1]); w += g.measureText(p[0]).width + (p[1] < 100 ? 12 : 0); }
      let x = (PW - w) / 2; fx0 = x - 20; fx1 = x + w + 20;
      for (const p of parts) {
        if (p[0] === "INT") { const cx = x + 70, yc = y - 45; g.lineWidth = 10; g.lineCap = "round"; g.beginPath(); g.moveTo(cx + 52, yc - 150); g.bezierCurveTo(cx + 16, yc - 190, cx + 5, yc - 120, cx, yc); g.bezierCurveTo(cx - 5, yc + 120, cx - 16, yc + 190, cx - 52, yc + 150); g.stroke(); F(78); g.fillText("1", cx + 48, yc - 160); g.fillText("0", cx - 84, yc + 205); x += 175; continue; }
        F(p[1]); g.fillText(p[0], x, y + p[2]); x += g.measureText(p[0]).width + (p[1] < 100 ? 12 : 0);
      }
    }
    const pc = document.createElement("canvas"); pc.width = PW; pc.height = PH; const pg = pc.getContext("2d");
    const ptex = new THREE.CanvasTexture(pc); ptex.colorSpace = THREE.SRGBColorSpace; ptex.anisotropy = 8;
    let lastP = -1;
    const paint = (p) => { if (p === lastP) return; lastP = p; pg.drawImage(base, 0, 0); const x1 = lerp(fx0, fx1, p); pg.save(); pg.beginPath(); pg.rect(0, 0, x1, PH); pg.clip(); pg.drawImage(ink, 0, 0); pg.restore(); if (p > 0 && p < 1) { pg.save(); pg.globalAlpha = 0.35; pg.beginPath(); pg.rect(x1, 0, 26, PH); pg.clip(); pg.drawImage(ink, 0, 0); pg.restore(); } ptex.needsUpdate = true; };
    const pgeo = new THREE.PlaneGeometry(4.2, 2.97, 70, 50); pgeo.rotateX(-Math.PI / 2);
    { const a = pgeo.attributes.position; for (let i = 0; i < a.count; i++) { const x = a.getX(i), z = a.getZ(i); a.setY(i, 0.012 + 0.09 * Math.pow(Math.abs(x) / 2.1, 6) + 0.03 * Math.pow(Math.abs(z) / 1.485, 6) + 0.006 * Math.sin(x * 2.3 + z * 1.1)); } pgeo.computeVertexNormals(); }
    const page = new THREE.Mesh(pgeo, new THREE.MeshStandardMaterial({ map: ptex, roughness: 0.92, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.25 }));
    page.castShadow = page.receiveShadow = true; page.rotation.y = 0.04; S.add(page);
    // candle (back left), inkwell + quill (right)
    const candle = new THREE.Group(); candle.position.set(-2.9, 0, -1.7); S.add(candle);
    const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.5, 0.05, 48), M.brass()); dish.position.y = 0.025; dish.castShadow = true;
    const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.19, 0.2, 0.6, 40), new THREE.MeshStandardMaterial({ color: 0xb5a586, roughness: 0.75 })); wax.position.y = 0.35; wax.castShadow = true;
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.08, 6), M.matte(0x1a1410)); wick.position.y = 0.68;
    const flameT = canvasTex(64, 128, (g) => { const gr = g.createRadialGradient(32, 84, 2, 32, 74, 60); gr.addColorStop(0, "rgba(255,250,235,1)"); gr.addColorStop(0.35, "rgba(255,206,130,.85)"); gr.addColorStop(1, "rgba(255,150,60,0)"); g.fillStyle = gr; g.beginPath(); g.moveTo(32, 4); g.quadraticCurveTo(58, 80, 32, 124); g.quadraticCurveTo(6, 80, 32, 4); g.fill(); });
    const flame = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameT, transparent: true, depthWrite: false })); flame.position.y = 0.86;
    const halo = glowSprite(0xffc27e, 1.6, 0.16); halo.position.y = 0.8;
    const pl = new THREE.PointLight(0xffb36b, 9, 0, 2); pl.position.set(0.5, 1.5, 0.4);
    candle.add(dish, wax, wick, flame, halo, pl);
    const well = new THREE.Group(); well.position.set(3.0, 0, -1.25); S.add(well);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.34, 0.42, 40), new THREE.MeshPhysicalMaterial({ color: 0x0e1012, roughness: 0.08, metalness: 0.1, clearcoat: 1 })); glass.position.y = 0.21; glass.castShadow = true;
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.15, 0.08, 32), M.brass()); neck.position.y = 0.46;
    const quill = new THREE.Group(); quill.position.set(0, 0.45, 0); quill.rotation.set(0.25, 0, 0.55);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.012, 1.3, 8), M.matte(0xcfc3a6)); shaft.position.y = 0.45;
    const vs = new THREE.Shape(); vs.moveTo(0, 0); vs.bezierCurveTo(0.16, 0.35, 0.2, 1.0, 0.03, 1.5); vs.bezierCurveTo(-0.08, 1.1, -0.1, 0.4, 0, 0);
    const vane = new THREE.Mesh(new THREE.ShapeGeometry(vs, 24), new THREE.MeshStandardMaterial({ color: 0xece4d2, roughness: 0.85, side: THREE.DoubleSide })); vane.position.y = 0.05; vane.scale.setScalar(0.85); vane.castShadow = true;
    quill.add(shaft, vane); well.add(glass, neck, quill);
    const mode = o.mode || "write";
    return (t, d) => {
      const ft = o.T0 + t;
      const fl = 1 + 0.05 * Math.sin(ft * 13.1) + 0.035 * Math.sin(ft * 7.7 + 1.3) + 0.02 * Math.sin(ft * 23.3);
      flame.scale.set(0.15 * (2 - fl), 0.4 * fl, 1); flame.position.x = 0.006 * Math.sin(ft * 5.1); pl.intensity = 9 * fl; halo.material.opacity = 0.28 * fl;
      let p = 1;
      if (mode === "write") { const q = clamp((t - 0.35) / 3.9, 0, 1); p = clamp(q + 0.012 * Math.sin(q * 40) * 4 * q * (1 - q), 0, 1); }
      paint(Math.round(p * 600) / 600);
      if (mode === "write") orbit(C, -0.2, 0, -0.1, KF([[0, 8.2], [d, 7.2]], t), KF([[0, -14], [d, -6]], t), KF([[0, 61], [d, 55]], t));
      else if (mode === "close") orbit(C, 0.05, 0, 0.5, KF([[0, 3.9], [d, 3.45]], t), KF([[0, 8], [d, 1]], t), KF([[0, 26], [d, 23]], t));
      else orbit(C, -0.2, 0, -0.1, KF([[0, 7.0], [d, 13.5]], t), KF([[0, -6], [d, -1]], t), KF([[0, 55], [d, 70]], t));
      fade.opacity = mode === "end" ? seg(t, 3.6, 6.15) : 0;
      return [S, C, []];
    };
  };

  // ===================================================================== landscape
  function landWorld() {
    const S = stage("void", { dust: 0, key: 1.8, hemi: 0.3, rim: 0.45, bg: 0x0d1117 });
    S.userData.key.position.set(-60, 28, 10);
    S.fog = new THREE.FogExp2(0x0d1117, 0.0052);
    const sky = new THREE.Mesh(new THREE.SphereGeometry(900, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, depthWrite: false, map: canvasTex(8, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#07090c"); gr.addColorStop(0.47, "#141a22"); gr.addColorStop(0.53, "#0d1117"); gr.addColorStop(1, "#0d1117"); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); }) }));
    S.add(sky);
    const n = vnoise(31), n2 = vnoise(57);
    const fbm = (nz, x, z) => { let s = 0, a = 0.5, f = 1; for (let i = 0; i < 5; i++) { s += a * nz(x * f, z * f); a *= 0.5; f *= 2.03; } return s; };
    const H = (x, z) => { const b = fbm(n, x * 0.028 + 3.1, z * 0.028 - 1.7); return 24 * b * b + 2.2 * fbm(n2, x * 0.09, z * 0.09); };
    const geo = new THREE.PlaneGeometry(760, 760, 320, 320); geo.rotateX(-Math.PI / 2); geo.translate(0, 0, -150);
    { const a = geo.attributes.position, cols = [], lo = new THREE.Color(0x2c3542), hiC = new THREE.Color(0x6e7b8d), c = new THREE.Color();
      for (let i = 0; i < a.count; i++) { const h = H(a.getX(i), a.getZ(i)); a.setY(i, h); c.copy(lo).lerp(hiC, clamp((h - 2) / 12, 0, 1)); cols.push(c.r, c.g, c.b); }
      geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3)); geo.computeVertexNormals(); }
    S.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.93, metalness: 0, envMapIntensity: 0.35 })));
    // valleys: local minima on a 3-unit grid, thinned to >= 8 apart
    const st = 3, X0 = -330, Z0 = -500, NX = 221, NZ = 231, G = new Float32Array(NX * NZ);
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) G[i * NZ + j] = H(X0 + i * st, Z0 + j * st);
    const cand = [];
    for (let i = 3; i < NX - 3; i++) for (let j = 3; j < NZ - 3; j++) { const h = G[i * NZ + j]; let ok = true;
      for (let di = -1; di <= 1 && ok; di++) for (let dj = -1; dj <= 1; dj++) { if ((di || dj) && (G[(i + di) * NZ + j + dj] <= h || G[(i + 3 * di) * NZ + j + 3 * dj] < h + 0.05)) { ok = false; break; } }
      if (ok) cand.push(V(X0 + i * st, h + 2.1, Z0 + j * st)); }
    const val = []; cand.forEach((p) => { if (val.every((q) => Math.abs(q.x - p.x) > 6 || Math.abs(q.z - p.z) > 6)) val.push(p); });
    const N = val.length;
    const bub = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 24, 16), new THREE.MeshPhysicalMaterial({ color: 0xdfe8f2, transparent: true, opacity: 0.2, roughness: 0.06, metalness: 0, clearcoat: 1, envMapIntensity: 1.8, depthWrite: false }), N);
    S.add(bub);
    const gp = new THREE.BufferGeometry(); gp.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3)); gp.setAttribute("color", new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
    const glows = new THREE.Points(gp, new THREE.PointsMaterial({ size: 7, map: dotTex(), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); S.add(glows);
    const dm = new THREE.Object3D(), warm = new THREE.Color(0xf3e3c3);
    // place bubbles (pos(i) -> Vector3, scale) and glow brightness (b(i) 0..1) relative to camera position cp
    const set = (pos, sc, b, cp) => {
      const pa = gp.attributes.position.array, ca = gp.attributes.color.array;
      for (let i = 0; i < N; i++) { const p = pos(i); dm.position.copy(p); dm.scale.setScalar(sc(i)); dm.updateMatrix(); bub.setMatrixAt(i, dm.matrix);
        pa[i * 3] = p.x; pa[i * 3 + 1] = p.y; pa[i * 3 + 2] = p.z; const dd = p.distanceTo(cp), k = b(i) * (0.3 + 0.7 * Math.exp(-dd / 230)) * clamp(dd / 70, 0.3, 1); ca[i * 3] = warm.r * k; ca[i * 3 + 1] = warm.g * k; ca[i * 3 + 2] = warm.b * k; }
      bub.instanceMatrix.needsUpdate = true; gp.attributes.position.needsUpdate = true; gp.attributes.color.needsUpdate = true;
    };
    // a small inner universe (coloured points + soft core), radius ~0.82
    const universe = (seed, color, np) => { const r = rnd(seed), p = []; for (let i = 0; i < np; i++) { const u = r() * 2 - 1, th = r() * TAU, rr = 0.82 * Math.cbrt(r()), s = Math.sqrt(1 - u * u); p.push(rr * s * Math.cos(th), rr * u * 0.7, rr * s * Math.sin(th)); }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); const grp = new THREE.Group();
      grp.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 3, sizeAttenuation: false, color, transparent: true, opacity: 1, depthWrite: false, blending: THREE.AdditiveBlending })), glowSprite(color, 1.3, 0.3)); return grp; };
    return { S, H, val, N, set, universe, bub };
  }
  LABK.landscape = (o) => {
    const W = landWorld(), { S, H, val, N } = W, C = cam(36), mode = o.mode || "count", BR = 2;
    const camAt = (t) => { const z = 30 - 3.1 * t, x = 8 * Math.sin(t * 0.07); let g = 0; for (let k = 0; k <= 4; k++) g = Math.max(g, H(x, z - k * 5)); return V(x, g, z); };
    if (mode === "count") {
      const c0 = camAt(2.76);
      const order = val.map((v, i) => [v.distanceTo(c0) + 25 * hf(i, 3), i]).sort((a, b) => a[0] - b[0]);
      const tOn = new Float32Array(N); order.forEach(([, i], k) => (tOn[i] = 2.76 + 14 * Math.sqrt(k / N)));
      // close-up: a valley ahead of the late flight path, seen from just above its rim
      const pc = camAt(22); pc.z -= 22;
      const near = val.map((v, i) => [Math.hypot(v.x - pc.x, v.z - pc.z), i]).sort((a, b) => a[0] - b[0]).slice(0, 4).map((a) => a[1]);
      const vc = val[near[0]].clone(), cen = V(0, 0, 0);
      const cols = [0x7fa8d8, 0xd9a050, 0xc07a70, 0x8fb57f, 0xb3a3dd, 0xe6dccb, 0x6fa39a];
      near.forEach((i, k) => { const u = W.universe(70 + k, cols[k], 160); u.position.copy(val[i]); u.scale.setScalar(BR); S.add(u); cen.add(val[i]); u.userData.i = i; near[k] = u; }); cen.divideScalar(near.length);
      const look = cen.clone(), cR = Math.max(...near.map((u) => u.position.distanceTo(cen))), eDir = V(0.3, 0.62, 1).normalize(), isNear = new Uint8Array(N); near.forEach((u) => (isNear[u.userData.i] = 1));
      return (t, d) => {
        const cp = camAt(t), hA = KF([[0, 34], [8.5, 44], [16, 46], [d, 40]], t);
        const fpos = V(cp.x, cp.y + hA, cp.z), ftg = V(cp.x + 2, cp.y + hA - KF([[0, 46], [8.5, 36], [16, 36], [d, 40]], t), cp.z - 85);
        const dr = Math.max(0, t - 21), epos = look.clone().addScaledVector(eDir, cR * 1.5 + 9 - 0.4 * dr); epos.y = Math.max(epos.y, H(epos.x, epos.z) + 5);
        const s = seg(t, 16.8, 21.5); C.position.lerpVectors(fpos, epos, s); C.lookAt(ftg.lerp(look, s));
        W.set((i) => val[i], () => BR, (i) => seg(t, tOn[i], tOn[i] + 0.7) * (isNear[i] ? 0.12 : 1), C.position);
        near.forEach((u) => { u.visible = t > tOn[u.userData.i]; u.rotation.y = t * 0.15; });
        return [S, C, []];
      };
    }
    // "which": high view, then the foam rises
    const tgt = V(10, 0, -110);
    let hi = 0, hd = 1e9; val.forEach((v, i) => { const dd = Math.hypot(v.x - tgt.x, v.z - tgt.z + 15); if (dd < hd) { hd = dd; hi = i; } });
    const hl = new THREE.Group(); hl.add(new THREE.Mesh(new THREE.SphereGeometry(1, 32, 20), new THREE.MeshPhysicalMaterial({ color: 0xf2e6cf, transparent: true, opacity: 0.22, roughness: 0.05, clearcoat: 1, envMapIntensity: 2, depthWrite: false })));
    const uni = W.universe(91, 0xe8c48a, 170); hl.add(uni); const hlg = glowSprite(0xffd9a0, 3.2, 0.12); hl.add(hlg); S.add(hl);
    const pos = (i, ft) => { const v = val[i]; const ts = 593.06 + 4.0 * hf(i, 9), sp = 4 + 7 * hf(i, 4); const rise = hf(i, 5) < 0.9 ? Math.max(0, ft - ts) : 0;
      const r2 = rise * rise / (rise + 1.2); return V(v.x + 3 * Math.sin(ft * 0.4 + i) * Math.min(1, rise * 0.3), v.y + 0.25 * Math.sin(ft * 0.8 + i * 1.7) + r2 * sp, v.z); };
    return (t, d) => {
      const ft = o.T0 + t;
      orbit(C, tgt.x, KF([[0, 4], [10, 8], [d, 30]], t), tgt.z, KF([[0, 180], [10, 160], [d, 125]], t), KF([[0, 6], [d, 14]], t), KF([[0, 34], [10, 30], [d, 18]], t));
      W.set((i) => (i === hi ? V(0, -999, 0) : pos(i, ft)), (i) => BR * (1 + 1.2 * seg(ft, 593 + 4 * hf(i, 9), 600 + 4 * hf(i, 9))), () => 1, C.position);
      const hr = Math.max(0, ft - 593.6), hp = val[hi].clone(); hp.y += hr * hr / (hr + 2) * 3.2; hl.position.copy(hp);
      const hs = 2.2 + 3.3 * seg(t, 10.2, 15.5); hl.scale.setScalar(hs); uni.rotation.y = t * 0.2;
      hlg.material.opacity = 0.12 + 0.16 * seg(t, 11.5, 13.5);
      return [S, C, [["atoms and stars can form", hp.x, hp.y + hs, hp.z, seg(t, 12.6, 13.6)]]];
    };
  };

  // ===================================================================== collision
  LABK.collision = (o) => {
    const S = stage("void", { dust: 400, dustR: 18, key: 1.8, hemi: 0.25, rim: 1.0 }), C = cam(32);
    const steel = new THREE.MeshStandardMaterial({ color: 0xc4c8ce, metalness: 0.9, roughness: 0.42, envMapIntensity: 1.4 });
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 44, 72, 1, true, 50 * Math.PI / 180, 240 * Math.PI / 180), steel); pipe.rotation.z = -Math.PI / 2; S.add(pipe);
    const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 44, 72, 1, true, 50 * Math.PI / 180, 240 * Math.PI / 180), new THREE.MeshStandardMaterial({ color: 0x24272d, metalness: 0.3, roughness: 0.75, side: THREE.BackSide })); inner.rotation.z = -Math.PI / 2; S.add(inner);
    [50, 290].forEach((a) => { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 44, 8), steel); a *= Math.PI / 180; e.rotation.z = -Math.PI / 2; e.position.set(0, -0.485 * Math.sin(a), 0.485 * Math.cos(a)); S.add(e); });
    for (let x = -21; x <= 21; x += 3.5) { if (Math.abs(x) < 1) continue; const f = new THREE.Mesh(new THREE.TorusGeometry(0.53, 0.05, 12, 72), M.steel()); f.rotation.y = Math.PI / 2; f.position.x = x; S.add(f); }
    const beamMat = M.light(0xe6eef8, 0.9);
    const beams = [-1, 1].map((s) => { const g = new THREE.Group(); const streak = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 2.2, 8), beamMat); streak.rotation.z = Math.PI / 2; streak.position.x = s * 1.1; const head = glowSprite(0xe6eef8, 0.45, 0.55); g.add(streak, head); S.add(g); return g; });
    const flash = glowSprite(0xfff1d6, 1, 0); S.add(flash);
    const flashL = new THREE.PointLight(0xffe8c8, 0, 0, 2); S.add(flashL);
    const tracks = [], r = rnd(41);
    for (let k = 0; k < 54; k++) {
      const tight = r() < 0.15, pts = [], phi = r() * TAU, pt = 0.5 + r() * 1.6, vx = (r() * 2 - 1) * 1.1, Rc = tight ? 0.15 + 0.2 * r() : 1.0 + Math.pow(r(), 0.7) * 7, sg = r() < 0.5 ? -1 : 1;
      let vy = pt * Math.cos(phi), vz = pt * Math.sin(phi); const p = V(0, 0, 0), L = tight ? 1.0 + r() : 1.5 + r() * 2.0;
      for (let i = 0; i < 120; i++) { pts.push(p.x, p.y, p.z); const sp = Math.hypot(vx, vy, vz), ds = L / 120; p.x += vx / sp * ds; p.y += vy / sp * ds; p.z += vz / sp * ds; const a = sg * ds / Rc, c = Math.cos(a), s = Math.sin(a); const ny = vy * c - vz * s; vz = vy * s + vz * c; vy = ny; }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
      const ln = new THREE.Line(g, M.line(r() < 0.55 ? 0xf3e3c3 : 0x9ec3e6, 0.45 + 0.4 * r())); ln.userData.sp = 0.6 + r() * 0.9; ln.userData.op = ln.material.opacity; S.add(ln); tracks.push(ln);
    }
    const TC = 2.38;
    return (t, d) => {
      const bx = Math.max(0, 8 * (1 - t / TC));
      beams[0].position.x = -bx; beams[1].position.x = bx; beams.forEach((b) => (b.visible = t < TC + 0.02));
      const fp = t - TC; const fa = fp > 0 ? Math.exp(-fp * 2.4) * Math.min(1, fp * 12) : 0;
      flash.scale.setScalar(0.5 + 1.3 * Math.min(1, Math.max(0, fp) * 3)); flash.material.opacity = 0.32 * fa; flashL.intensity = 12 * fa;
      tracks.forEach((ln) => { ln.geometry.setDrawRange(0, Math.floor(clamp(fp * 150 * ln.userData.sp, 0, 120))); ln.material.opacity = ln.userData.op * (1 - 0.35 * seg(t, 4.5, d)); });
      orbit(C, 0, 0, 0, KF([[0, 11.5], [TC, 6.4], [d, 5.0]], t), KF([[0, 26], [d, 50]], t), KF([[0, 9], [d, 19]], t));
      return [S, C, [["far more energy than any machine", 0.1, 0.75, 0.1, seg(t, 4.9, 5.7)]]];
    };
  };

  // ===================================================================== lhc
  LABK.lhc = (o) => {
    const S = stage("space", { key: 2.6, hemi: 0.08, rim: 0.3 }), C = cam(32);
    S.userData.key.position.set(-6, 10, 3);
    const DC = 4, VW = 2 * DC * Math.tan(16 * Math.PI / 180) * (1920 / 1080);   // view width in units at the target
    // earth with Geneva at the top (+y), north toward -x
    const E = earth(), lat = 46.23 * Math.PI / 180, lon = 6.05 * Math.PI / 180;
    E.quaternion.setFromUnitVectors(V(Math.cos(lon) * Math.cos(lat), Math.sin(lat), -Math.sin(lon) * Math.cos(lat)), V(0, 1, 0));
    const Eg = new THREE.Group(); Eg.add(E); S.add(Eg);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.99, 1.01, 160), new THREE.MeshBasicMaterial({ color: 0xf3e3c3, transparent: true, opacity: 0.85, side: THREE.DoubleSide, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; S.add(ring);
    // solar system (sun at -1 AU along x so Earth's orbit passes through the origin)
    const AU = 23481, sol = new THREE.Group(); S.add(sol);
    const orbits = [0.39, 0.72, 1, 1.52, 5.2, 9.5, 19.2, 30].map((a, i) => { const g = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 181 }, (_, k) => V(a * Math.cos(k * TAU / 180), 0, a * Math.sin(k * TAU / 180)))); const l = new THREE.Line(g, M.line(0x8db8e8, 0.3)); sol.add(l); return l; });
    const pl = new THREE.BufferGeometry(); const pp = []; [0.39, 0.72, 1, 1.52, 5.2, 9.5, 19.2, 30].forEach((a, i) => { const th = i === 2 ? Math.PI : 0.6 + i * 1.9; pp.push(a * Math.cos(th), 0, a * Math.sin(th)); }); pl.setAttribute("position", new THREE.Float32BufferAttribute(pp, 3));
    const planets = new THREE.Points(pl, new THREE.PointsMaterial({ size: 4, sizeAttenuation: false, color: 0xd8d3c8, transparent: true })); sol.add(planets);
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 16), new THREE.MeshBasicMaterial({ map: tex("2k_sun.jpg"), transparent: true })); const sunG = glowSprite(0xffd9a0, 1, 0.5); S.add(sun, sunG);
    // nearby stars and the galaxy
    const nb = (() => { const r = rnd(77), p = []; for (let i = 0; i < 700; i++) { const u = r() * 2 - 1, th = r() * TAU, rr = Math.cbrt(r()), s = Math.sqrt(1 - u * u); p.push(rr * s * Math.cos(th), rr * u * 0.5, rr * s * Math.sin(th)); } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); return new THREE.Points(g, new THREE.PointsMaterial({ size: 2, sizeAttenuation: false, color: 0xe8e6f0, transparent: true, depthWrite: false })); })(); S.add(nb);
    const gal = galaxy(13, 42000); S.add(gal);
    const win = (z, a, b, c, e) => seg(z, a, b) * (1 - seg(z, c, e));
    return (t, d) => {
      const Z = KF([[0, 0.3], [2.24, 0.42], [8.7, 14.35], [d, 14.5]], t), k = VW / Math.pow(10, Z);   // units per Earth radius
      Eg.scale.setScalar(k); Eg.position.set(0, -k, 0); E.rotation.y = 0; E.userData.clouds.rotation.y = t * 0.004;
      const ea = 1 - seg(Z, 3.2, 4.2); E.userData.mats[0].opacity = ea; E.userData.mats[1].opacity = 0.85 * ea; Eg.visible = ea > 0;
      const rr = KF([[0, 0.026], [2.24, 0.03], [8.7, 0.265], [d, 0.272]], t) * VW;
      ring.geometry.dispose(); ring.geometry = new THREE.RingGeometry(rr - 0.0045, rr + 0.0045, 220); ring.position.y = Math.min(0.015 * k, 0.05);
      // solar
      const sa = win(Z, 3.4, 4.4, 7.4, 8.4); sol.visible = sun.visible = sunG.visible = sa > 0;
      sol.scale.setScalar(k * AU); sol.position.set(-k * AU, 0, 0); orbits.forEach((l) => (l.material.opacity = 0.3 * sa)); planets.material.opacity = sa;
      sun.position.set(-k * AU, 0, 0); sun.scale.setScalar(Math.max(k * 109, 0.012)); sun.material.opacity = sa; sunG.position.copy(sun.position); sunG.scale.setScalar(0.22); sunG.material.opacity = 0.5 * sa;
      const na = win(Z, 8.6, 9.6, 11.0, 11.8); nb.visible = na > 0; nb.scale.setScalar(k * 4e10); nb.material.opacity = na;
      const ga = seg(Z, 12.6, 13.6) * clamp(2.2 / (k * 7.4e13), 0, 1); gal.visible = ga > 0; gal.scale.setScalar(k * 7.4e13); gal.userData.fade(ga); gal.rotation.y = -t * 0.02;
      orbit(C, 0, 0, 0, DC, KF([[0, 90], [d, 104]], t), KF([[0, 52], [6, 56], [d, 55]], t));
      return [S, C, [["LHC · 27 km", rr * 0.71, 0, rr * 0.71, seg(t, 0.2, 0.9) * (1 - seg(t, 2.6, 3.2))], ["a collider the size of our galaxy", rr * 0.6, 0, rr * 0.8, seg(t, 7.7, 8.5)]]];
    };
  };

  // ===================================================================== bhinfo
  LABK.bhinfo = (o) => {
    const S = stage("space", { key: 1.2, hemi: 0.1 }), C = cam(32), mode = o.mode || "bits";
    const RB = 1.62, NT = 2400;
    const core = blackCore(1.6); S.add(core);
    const pr = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex(), color: 0xffe2bf, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })); pr.scale.setScalar(2 * 1.98); S.add(pr);
    const disk = new THREE.Mesh(new THREE.RingGeometry(2.0, 4.8, 160, 1), new THREE.MeshBasicMaterial({ map: diskTex(), transparent: true, opacity: 0.4, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }));
    disk.rotation.x = -Math.PI / 2 + 0.2; disk.visible = false; S.add(disk); const lens = glowSprite(0xffd9b0, 6.5, 0.1); lens.position.z = -0.5; S.add(lens);
    const tiles = new THREE.InstancedMesh(new THREE.BoxGeometry(0.058, 0.058, 0.01), new THREE.MeshBasicMaterial({ color: 0xffffff }), NT); S.add(tiles);
    const tp = [], sh = new Float32Array(NT), Ld = V(-0.45, 0.55, 0.7).normalize(), dm = new THREE.Object3D(), col = new THREE.Color();
    for (let i = 0; i < NT; i++) { const y = 1 - 2 * (i + 0.5) / NT, rr = Math.sqrt(1 - y * y), th = i * 2.39996323; const n = V(rr * Math.cos(th), y, rr * Math.sin(th)); tp.push(n); sh[i] = 0.5 + 0.5 * Math.max(0, n.dot(Ld)); }
    const place = (i, s) => { dm.position.copy(tp[i]).multiplyScalar(RB); dm.lookAt(tp[i].x * 9, tp[i].y * 9, tp[i].z * 9); dm.scale.setScalar(Math.max(s, 1e-4)); dm.updateMatrix(); tiles.setMatrixAt(i, dm.matrix); };
    for (let i = 0; i < NT; i++) { place(i, 1); tiles.setColorAt(i, col.setRGB(0, 0, 0)); }
    const bits = (ft) => { for (let i = 0; i < NT; i++) { const x = ft * 0.7 + hf(i, 1) * 9, k = Math.floor(x), f = x - k; const a = hf(i, k + 100) > 0.68 ? 1 : 0, b = hf(i, k + 99) > 0.68 ? 1 : 0; const v = lerp(b, a, clamp(f / 0.18, 0, 1)) * sh[i] * 0.78;
      tiles.setColorAt(i, col.setRGB(lerp(0.035, 0.86, v), lerp(0.038, 0.81, v), lerp(0.045, 0.72, v))); } tiles.instanceColor.needsUpdate = true; };
    if (mode === "bits") {
      return (t, d) => {
        bits(o.T0 + t); disk.rotation.z = t * 0.03;
        orbit(C, 0, -0.75, 0, 9.6, KF([[0, -4], [d, 12]], t), KF([[0, 12], [d, 16]], t));
        const pn = tp[Math.floor(NT * 0.3)]; let best = 0, bv = -9; const cd = C.position.clone().normalize(); for (let i = 0; i < NT; i += 7) { const sc = tp[i].dot(cd) * 0.6 + tp[i].x * 0.5 + tp[i].y * 0.5; if (sc > bv) { bv = sc; best = i; } }
        const q = tp[best].clone().multiplyScalar(RB);
        return [S, C, [["information on the surface", q.x, q.y, q.z, seg(t, 1.0, 1.9)]]];
      };
    }
    // strings: pieces fly in and assemble the horizon; odometer counts the arrangements
    const NP = 60, pieces = [], loopG = new THREE.TorusGeometry(0.13, 0.009, 8, 48), sheetG = new THREE.PlaneGeometry(0.28, 0.2, 4, 3);
    { const a = sheetG.attributes.position; for (let i = 0; i < a.count; i++) a.setZ(i, 0.04 * Math.sin(a.getX(i) * 9)); sheetG.computeVertexNormals(); }
    const loopM = M.light(P.string, 1), sheetM = new THREE.MeshStandardMaterial({ color: 0xcfd8e2, roughness: 0.45, metalness: 0.1, transparent: true, opacity: 0.7, side: THREE.DoubleSide });
    const r = rnd(57);
    for (let k = 0; k < NP; k++) {
      const tgt = tp[Math.floor(((k + 0.5) / NP) * NT)].clone(), jit = V(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1);
      const m = new THREE.Mesh(k % 3 === 2 ? sheetG : loopG, k % 3 === 2 ? sheetM : loopM);
      m.userData = { tgt: tgt.clone().multiplyScalar(RB + 0.02), from: tgt.clone().multiplyScalar(8 + 3 * r()).add(jit.multiplyScalar(3)), ta: 0.5 + 3.4 * hf(k, 5), sp: V(r(), r(), r()) };
      S.add(m); pieces.push(m);
    }
    const tA = new Float32Array(NT); for (let i = 0; i < NT; i++) { let b = 0, bd = 9; pieces.forEach((m, k) => { const dd = tp[i].distanceToSquared(m.userData.tgt.clone().normalize()); if (dd < bd) { bd = dd; b = k; } }); tA[i] = pieces[b].userData.ta + 0.05 + 0.3 * hf(i, 2); }
    // odometer
    const od = new THREE.Group(); od.position.set(3.55, -1.75, 0.9); S.add(od);
    const house = new THREE.Mesh(new THREE.BoxGeometry(2.25, 0.62, 0.3), new THREE.MeshStandardMaterial({ color: 0x2a2d33, metalness: 0.75, roughness: 0.38 })); od.add(house);
    const ND = 7, FIN = [3, 0, 8, 1, 6, 4, 2], oc = document.createElement("canvas"); oc.width = 1024; oc.height = 200; const og = oc.getContext("2d");
    const otex = new THREE.CanvasTexture(oc); otex.colorSpace = THREE.SRGBColorSpace;
    const win = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 0.4), new THREE.MeshStandardMaterial({ map: otex, roughness: 0.5, metalness: 0.1, emissive: 0xffffff, emissiveMap: otex, emissiveIntensity: 0.25 })); win.position.z = 0.152; od.add(win);
    const drawOd = (t) => {
      og.fillStyle = "#0c0d10"; og.fillRect(0, 0, 1024, 200); const sw = 1024 / ND;
      for (let j = 0; j < ND; j++) {
        const tl = 5.05 + j * 0.11, e = clamp((t - 2.36) / (tl - 2.36), 0, 1), K = 6 + j * 2, v = FIN[j] - (10 * K + FIN[j]) * (1 - e) * (1 - e);
        const x0 = j * sw + 6; og.save(); og.beginPath(); og.rect(x0, 8, sw - 12, 184); og.clip(); og.fillStyle = "#1a1c21"; og.fillRect(x0, 8, sw - 12, 184);
        og.fillStyle = "#e9e4d8"; og.font = "600 132px Arial, sans-serif"; og.textAlign = "center"; og.textBaseline = "middle";
        const d0 = Math.floor(v), f = v - d0; for (let q = -1; q <= 1; q++) og.fillText(String(((d0 + q) % 10 + 10) % 10), x0 + (sw - 12) / 2, 104 + (q - f) * 170);
        const gr = og.createLinearGradient(0, 8, 0, 192); gr.addColorStop(0, "rgba(0,0,0,.85)"); gr.addColorStop(0.3, "rgba(0,0,0,0)"); gr.addColorStop(0.7, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,.85)"); og.fillStyle = gr; og.fillRect(x0, 8, sw - 12, 184); og.restore();
      }
      otex.needsUpdate = true;
    };
    return (t, d) => {
      const ft = o.T0 + t; bits(ft); disk.rotation.z = t * 0.03;
      for (let i = 0; i < NT; i++) place(i, seg(t, tA[i], tA[i] + 0.35)); tiles.instanceMatrix.needsUpdate = true;
      const cs = lerp(0.35, 1, seg(t, 0.4, 4.2)); core.scale.setScalar(cs); pr.material.opacity = 0.4 * seg(t, 2.5, 4.5); lens.material.opacity = 0.1 * seg(t, 2.0, 4.8);
      pieces.forEach((m) => { const u = m.userData, p = clamp((t - (u.ta - 1.7)) / 1.7, 0, 1), e = 1 - Math.pow(1 - p, 3); m.position.lerpVectors(u.from, u.tgt, e); m.rotation.set(u.sp.x * 6 * (1 - e) + t * 0.3, u.sp.y * 6 * (1 - e), u.sp.z * 4 * (1 - e)); m.scale.setScalar(Math.max(1e-4, (1 - seg(t, u.ta, u.ta + 0.35)) * Math.min(1, p * 4))); });
      drawOd(t);
      orbit(C, 0.9, -0.25, 0, KF([[0, 11.2], [d, 9.9]], t), KF([[0, -12], [d, 6]], t), KF([[0, 14], [d, 11]], t));
      const op = od.position;
      return [S, C, [["count = Hawking's formula", op.x - 0.4, op.y + 0.32, op.z, seg(t, 5.9, 6.6)]]];
    };
  };

  // ===================================================================== hologram
  function holoBase(S, x0) {
    const g = new THREE.Group(); g.position.x = x0 || 0; S.add(g);
    const CR = 1.6, CH = 4.4;
    const shell = new THREE.Mesh(new THREE.CylinderGeometry(CR, CR, CH, 96, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xaab8c8, transparent: true, opacity: 0.07, roughness: 0.15, metalness: 0, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.2 }));
    g.add(shell);
    const lp = [];
    for (let k = 0; k <= 10; k++) { const y = -CH / 2 + CH * k / 10; for (let i = 0; i < 96; i++) { const a = i * TAU / 96, b = (i + 1) * TAU / 96; lp.push(CR * Math.sin(a), y, CR * Math.cos(a), CR * Math.sin(b), y, CR * Math.cos(b)); } }
    for (let i = 0; i < 36; i++) { const a = i * TAU / 36; lp.push(CR * Math.sin(a), -CH / 2, CR * Math.cos(a), CR * Math.sin(a), CH / 2, CR * Math.cos(a)); }
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3));
    const grid = new THREE.LineSegments(lg, M.line(0xc4d6ea, 0.2)); g.add(grid);
    const PWc = 1024, PHc = 450, pc = document.createElement("canvas"); pc.width = PWc; pc.height = PHc; const pg = pc.getContext("2d");
    const ptex = new THREE.CanvasTexture(pc); ptex.colorSpace = THREE.SRGBColorSpace;
    const pat = new THREE.Mesh(new THREE.CylinderGeometry(CR * 1.003, CR * 1.003, CH, 96, 1, true), new THREE.MeshBasicMaterial({ map: ptex, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); g.add(pat);
    // interior: small black hole + orbiting bodies
    const inside = new THREE.Group(); g.add(inside);
    const bh = new THREE.Group(); inside.add(bh); bh.add(blackCore(0.17));
    const bring = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex(), color: 0xffe2bf, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); bring.scale.setScalar(0.42); bh.add(bring);
    const bdisk = new THREE.Mesh(new THREE.RingGeometry(0.21, 0.5, 96), new THREE.MeshBasicMaterial({ map: diskTex(), transparent: true, opacity: 0.6, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending })); bdisk.rotation.x = -Math.PI / 2 + 0.25; bh.add(bdisk);
    const BO = [[0.55, 0.3, 0.07, 0xb8a58c], [0.82, -0.2, 0.06, 0x8e9aa8], [1.08, 0.12, 0.085, 0xa98a74], [1.3, -0.08, 0.05, 0xc9c4ba]];
    const bodies = BO.map(([rr, tilt, sz, c], i) => { const m = new THREE.Mesh(new THREE.SphereGeometry(sz, 24, 16), new THREE.MeshStandardMaterial({ color: c, roughness: 0.5, metalness: 0.05 }));
      const ol = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(Array.from({ length: 128 }, (_, k) => V(rr * Math.cos(k * TAU / 128), 0, rr * Math.sin(k * TAU / 128)))), M.line(0x8db8e8, 0.2)); ol.rotation.x = tilt; inside.add(m, ol); return { m, ol, rr, tilt, w: 1.1 / Math.pow(rr, 1.5), ph: i * 1.7 }; });
    const bodyPos = (b, ft) => { const a = b.ph + ft * b.w * 0.5; return V(b.rr * Math.cos(a), 0, b.rr * Math.sin(a)).applyAxisAngle(V(1, 0, 0), b.tilt); };
    const drawPat = (ft, I) => {
      pg.fillStyle = "#000"; pg.fillRect(0, 0, PWc, PHc); if (I <= 0.001) { ptex.needsUpdate = true; return; }
      const feats = bodies.map((b) => { const p = bodyPos(b, ft); let u = Math.atan2(p.x, p.z) / TAU; if (u < 0) u += 1; return [u * PWc, (1 - (p.y + CH / 2) / CH) * PHc, 1]; });
      // boundary lattice brightening near each feature's angle (and a band for the black hole)
      for (let i = 0; i < 64; i++) for (let j = 0; j < 22; j++) { const x = (i + 0.5) * PWc / 64, y = (j + 0.5) * PHc / 22; let v = 0.05 + 0.25 * Math.exp(-Math.pow((y - PHc / 2) / 26, 2));
        for (const [fx, fy] of feats) { let dx = Math.abs(x - fx); dx = Math.min(dx, PWc - dx); v += Math.exp(-(dx * dx) / 900 - Math.pow((y - fy) / 70, 2)) * 0.9; }
        v = Math.min(1, v) * I * (0.75 + 0.25 * hf(i * 31 + j, Math.floor(ft * 3))); pg.fillStyle = `rgba(214,228,245,${v.toFixed(3)})`; pg.fillRect(x - 3, y - 3, 6, 6); }
      for (const [fx, fy] of feats) for (const ox of [-PWc, 0, PWc]) { const gr = pg.createRadialGradient(fx + ox, fy, 0, fx + ox, fy, 40); gr.addColorStop(0, `rgba(240,236,226,${(0.75 * I).toFixed(3)})`); gr.addColorStop(1, "rgba(0,0,0,0)"); pg.fillStyle = gr; pg.fillRect(fx + ox - 40, fy - 40, 80, 80); }
      ptex.needsUpdate = true;
    };
    const tick = (ft, I) => { bodies.forEach((b) => b.m.position.copy(bodyPos(b, ft))); bdisk.rotation.z = ft * 0.2; drawPat(ft, I); };
    return { g, CR, CH, shell, grid, pat, inside, bh, bodies, bodyPos, tick };
  }
  LABK.hologram = (o) => {
    const mode = o.mode || "ads", C = cam(32);
    if (mode === "card") {
      const S = stage("studio", { key: 2.0, hemi: 0.3, floorY: -1.7 });
      const card = new THREE.Group(); card.position.set(0, 0.25, 0); S.add(card);
      const w = 3.37, h = 2.13, rc = 0.16, sh = new THREE.Shape();
      sh.moveTo(-w / 2 + rc, -h / 2); sh.lineTo(w / 2 - rc, -h / 2); sh.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + rc); sh.lineTo(w / 2, h / 2 - rc); sh.quadraticCurveTo(w / 2, h / 2, w / 2 - rc, h / 2); sh.lineTo(-w / 2 + rc, h / 2); sh.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - rc); sh.lineTo(-w / 2, -h / 2 + rc); sh.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + rc, -h / 2);
      const body = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.026, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 2, curveSegments: 10 }), new THREE.MeshPhysicalMaterial({ color: 0x1b2b4d, roughness: 0.45, metalness: 0.05, clearcoat: 0.4, clearcoatRoughness: 0.3, envMapIntensity: 0.55 }));
      body.castShadow = true; card.add(body);
      const chipT = canvasTex(256, 200, (g) => { g.fillStyle = "#b9a46c"; g.fillRect(0, 0, 256, 200); g.strokeStyle = "rgba(70,55,25,.75)"; g.lineWidth = 4; g.strokeRect(20, 20, 216, 160); g.beginPath(); g.moveTo(128, 20); g.lineTo(128, 70); g.moveTo(128, 130); g.lineTo(128, 180); g.moveTo(20, 80); g.lineTo(90, 80); g.moveTo(20, 120); g.lineTo(90, 120); g.moveTo(166, 80); g.lineTo(236, 80); g.moveTo(166, 120); g.lineTo(236, 120); g.stroke(); g.strokeRect(90, 70, 76, 60); });
      const chip = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.36, 0.012), [M.brass(), M.brass(), M.brass(), M.brass(), new THREE.MeshStandardMaterial({ map: chipT, metalness: 0.9, roughness: 0.3 }), M.brass()]); chip.position.set(-1.0, 0.18, 0.038); card.add(chip);
      const stT = canvasTex(512, 320, (g) => { g.fillStyle = "#9aa1aa"; g.fillRect(0, 0, 512, 320); for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(${i % 2 ? 230 : 120},${i % 2 ? 234 : 126},${i % 2 ? 240 : 134},.5)`; g.lineWidth = 2; g.beginPath(); g.arc(300, 150, i * 5, 0, TAU); g.stroke(); } });
      const sticker = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.52), new THREE.MeshPhysicalMaterial({ map: stT, metalness: 0.85, roughness: 0.28, emissive: 0xffffff, emissiveMap: stT, emissiveIntensity: 0.07, iridescence: 0.5, iridescenceIOR: 1.3, iridescenceThicknessRange: [250, 420] })); sticker.position.set(1.0, -0.55, 0.037); card.add(sticker);
      // the "picture with depth": a small globe floating out of the sticker
      const globe = new THREE.Group(); card.add(globe); const gl = [];
      for (let k = 1; k < 6; k++) { const la = -Math.PI / 2 + k * Math.PI / 6, y = Math.sin(la), rr = Math.cos(la); for (let i = 0; i < 48; i++) { const a = i * TAU / 48, b = (i + 1) * TAU / 48; gl.push(rr * Math.cos(a), y, rr * Math.sin(a), rr * Math.cos(b), y, rr * Math.sin(b)); } }
      for (let k = 0; k < 8; k++) { const a = k * Math.PI / 8; for (let i = 0; i < 48; i++) { const p = i * TAU / 48, q = (i + 1) * TAU / 48; gl.push(Math.sin(p) * Math.cos(a), Math.cos(p), Math.sin(p) * Math.sin(a), Math.sin(q) * Math.cos(a), Math.cos(q), Math.sin(q) * Math.sin(a)); } }
      const glg = new THREE.BufferGeometry(); glg.setAttribute("position", new THREE.Float32BufferAttribute(gl, 3));
      const gmat = M.line(0xd6e3f2, 0.0); const gls = new THREE.LineSegments(glg, gmat); const gfill = new THREE.Mesh(new THREE.SphereGeometry(0.98, 32, 16), M.light(0xcfe0f2, 0)); const ghalo = glowSprite(0xd6e3f2, 3, 0);
      globe.add(gls, gfill, ghalo); globe.scale.setScalar(0.24);
      const wp = new THREE.Vector3(), nrm = new THREE.Vector3();
      return (t, d) => {
        card.rotation.set(KF([[0, -1.0], [d, -0.5]], t), 0.32 * Math.sin(t * 0.55 - 0.6), 0.05 * Math.sin(t * 0.4));
        card.updateMatrixWorld(true);
        orbit(C, 0.7, 0.25, 0, KF([[0, 5.8], [d, 5.0]], t), KF([[0, 12], [d, 3]], t), KF([[0, 30], [d, 24]], t));
        nrm.set(0, 0, 1).transformDirection(card.matrixWorld); const face = Math.max(0, nrm.dot(wp.copy(C.position).sub(card.position).normalize()));
        const a = seg(t, 1.2, 3.2) * (0.55 + 0.45 * face);
        globe.position.set(1.0, -0.55, 0.06 + 0.32 * seg(t, 1.2, 3.8)); globe.rotation.y = t * 0.5;
        gmat.opacity = 0.75 * a; gfill.material.opacity = 0.06 * a; ghalo.material.opacity = 0.12 * a;
        globe.getWorldPosition(wp);
        return [S, C, [["flat sticker · picture with depth", wp.x, wp.y + 0.25, wp.z, seg(t, 2.6, 3.4)]]];
      };
    }
    const S = stage("void", { dust: 500, dustR: 20, key: 1.8, hemi: 0.3, rim: 1.0 });
    if (mode === "curved") {
      const B = holoBase(S, -2.3); B.inside.visible = false; B.pat.visible = false;
      const gridLines = (f, R, circ, mat) => { const p = []; const N = 14, st = 40; for (let a = 0; a <= N; a++) for (const dir of [0, 1]) { const c = -R + 2 * R * a / N; for (let s = 0; s < st; s++) { const u0 = -R + 2 * R * s / st, u1 = -R + 2 * R * (s + 1) / st; const [x0, z0, x1, z1] = dir ? [c, u0, c, u1] : [u0, c, u1, c]; if (circ && (Math.hypot(x0, z0) > R || Math.hypot(x1, z1) > R)) continue; p.push(x0, f(x0, z0), z0, x1, f(x1, z1), z1); } } const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); return new THREE.LineSegments(g, mat); };
      const sad = gridLines((x, z) => 0.5 * (x * x - z * z) / 1.45, 1.45, true, M.line(0xf3e3c3, 0.7)); B.g.add(sad);
      const flat = gridLines(() => 0, 1.45, false, M.line(0x9ec3e6, 0.6)); flat.position.set(2.4, 0, 0); S.add(flat);
      return (t, d) => {
        sad.rotation.y = t * 0.12; flat.rotation.y = t * 0.12; B.g.rotation.y = t * 0.05;
        orbit(C, 0.05, -0.1, 0, KF([[0, 11.5], [d, 10.2]], t), KF([[0, -6], [d, 8]], t), KF([[0, 21], [d, 26]], t));
        return [S, C, [["his universe", -2.3, 1.0, 0, seg(t, 0.6, 1.4)], ["ours", 2.4, 0.15, 0, seg(t, 1.6, 2.4)]]];
      };
    }
    const B = holoBase(S, 0);
    if (mode === "project") {
      const NR = 72, rp = new Float32Array(NR * 12), rc = new Float32Array(NR * 12);
      const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.BufferAttribute(rp, 3)); rg.setAttribute("color", new THREE.BufferAttribute(rc, 3));
      const rays = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(rays);
      const src = Array.from({ length: NR }, (_, i) => { const a = hf(i, 1) * TAU, y = (hf(i, 2) - 0.5) * B.CH * 0.8; return V(B.CR * Math.sin(a), y, B.CR * Math.cos(a)); });
      const a0 = new THREE.Vector3(), a1 = new THREE.Vector3();
      return (t, d) => {
        const ft = o.T0 + t; B.tick(ft, 1);
        B.bh.scale.setScalar(Math.max(1e-4, seg(t, 0.8, 3.0))); B.bodies.forEach((b, i) => { const s = seg(t, 1.6 + i * 0.7, 3.4 + i * 0.7); b.m.scale.setScalar(Math.max(1e-4, s)); b.ol.material.opacity = 0.2 * s; });
        const on = seg(t, 0.2, 1.2);
        for (let i = 0; i < NR; i++) { const tg = i % 5 === 0 ? V(0, 0, 0) : B.bodyPos(B.bodies[i % 4], ft); const s = (ft * 0.4 + hf(i, 3)) % 1, s2 = Math.min(1, s + 0.22);
          a0.lerpVectors(src[i], tg, s); a1.lerpVectors(src[i], tg, s2); rp.set([src[i].x, src[i].y, src[i].z, tg.x, tg.y, tg.z, a0.x, a0.y, a0.z, a1.x, a1.y, a1.z], i * 12);
          const k = Math.sin(Math.PI * s2) * 0.7 * on, f = 0.06 * on; rc.set([f, f, f * 1.05, f * 0.4, f * 0.4, f * 0.42, 0, 0, 0, 0.97 * k, 0.93 * k, 0.86 * k], i * 12); }
        rg.attributes.position.needsUpdate = true; rg.attributes.color.needsUpdate = true;
        orbit(C, 0, 0, 0, KF([[0, 11.2], [d, 9.9]], t), KF([[0, -22], [d, -6]], t), KF([[0, 13], [d, 9]], t));
        return [S, C, [["projected from the surface", B.CR * 0.72, 1.3, B.CR * 0.69, seg(t, 1.6, 2.4)]]];
      };
    }
    // ads
    return (t, d) => {
      const ft = o.T0 + t; B.tick(ft, 0.12 + 0.88 * seg(t, 6.48, 8.2));
      orbit(C, -0.55, 0, 0, KF([[0, 10.8], [d, 9.9]], t), KF([[0, 16], [d, 36]], t), KF([[0, 16], [d, 11]], t));
      return [S, C, [["gravity inside", 0, 0.2, 0, seg(t, 1.5, 2.3) * (1 - seg(t, 12.5, 13.3))], ["no gravity · on the edge", B.CR * 0.85, 1.55, B.CR * 0.53, seg(t, 7.2, 8.0)]]];
    };
  };

  // ===================================================================== finale
  LABK.finale = (o) => {
    const mode = o.mode || "answer", C = cam(32);
    const sMat = M.light(P.string, 1);
    if (mode === "answer") {
      const S = stage("void", { dust: 700, dustR: 26, key: 1.8, hemi: 0.3, rim: 1.0 });
      const cyg = cyGeo(3, 18), pm = pearl(); pm.color.set(0x98a3b0); pm.roughness = 0.45;
      const mk = (R, rad, n, pos, rot, i) => { const g = new THREE.Group(); g.position.copy(pos); g.rotation.copy(rot); const l = sloop(R, rad, sMat, 150); l.userData.p.n = n; l.userData.p.a = 0.09; l.userData.p.z = i ? 0.12 : 0.2; l.userData.p.ph0 = i; const sh = new THREE.Mesh(cyg, pm); sh.scale.setScalar(R * 0.45); g.add(l, sh); S.add(g); return { g, l, sh, R, w: 2.2 + 0.5 * n }; };
      const main = mk(0.55, 0.0085, 3, V(0, 0, 0), new THREE.Euler(0.35, 0, 0.1), 0);
      const mg = glowSprite(0xfff1d6, 3.0, 0.2); S.add(mg);
      const others = []; const r = rnd(19);
      for (let k = 0; k < 14; k++) { const a = k * TAU / 14 + r() * 0.3, rr = 2.0 + 0.7 * r(); others.push(mk(0.26 + 0.14 * r(), 0.009, 2 + (k % 6), V(rr * Math.cos(a), (r() - 0.5) * 2.4, rr * Math.sin(a) * 0.7), new THREE.Euler(r() * 3, r() * 3, r() * 3), k + 1)); }
      const all = [main, ...others];
      const rip = others[3], ripples = [0, 1, 2].map(() => { const m = new THREE.Mesh(new THREE.RingGeometry(0.985, 1, 128), new THREE.MeshBasicMaterial({ color: 0xcfe0f2, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false })); m.rotation.x = -Math.PI / 2; rip.g.add(m); return m; });
      const book = (c) => { const g = new THREE.Group(), fm = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide }), bm = fm.clone(), W = 7.2, Hh = 9.2, th = 0.05;
        g.add(new THREE.Mesh(new THREE.PlaneGeometry(W, Hh), fm));
        [[0, Hh / 2, W, th], [0, -Hh / 2, W, th], [-W / 2, 0, th, Hh], [W / 2, 0, th, Hh], [-W / 2 + 0.55, 0, th * 0.6, Hh]].forEach(([x, y, w, h]) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), bm); m.position.set(x, y, 0.01); g.add(m); });
        S.add(g); g.userData = { fm, bm }; return g; };
      const bL = book(0x6f9a78), bR = book(0xa5534a), cA = new THREE.Color(0x5f8f6a), cB = new THREE.Color(0x9a4a40), cW = new THREE.Color(0xe8dcc4);
      return (t, d) => {
        const ft = o.T0 + t;
        all.forEach((s, i) => { const p = s.l.userData.p; p.w = ft * s.w; p.a = i === 0 ? 0.11 + 0.03 * Math.sin(ft * 0.7) : 0.09;
          const ap = i === 0 ? 1 : seg(t, 3.56 + 0.13 * (i - 1), 4.4 + 0.13 * (i - 1)); s.g.scale.setScalar(Math.max(1e-4, ap)); s.g.rotation.y += 0; s.l.rotation.y = ft * 0.15;
          const cs = seg(t, 11.1 + 0.07 * i, 12.2 + 0.07 * i); s.sh.visible = cs > 0.001; s.sh.scale.setScalar(Math.max(1e-4, s.R * 0.45 * cs)); s.sh.rotation.set(ft * 0.1 + i, ft * 0.13, 0); });
        ripples.forEach((m, j) => { const ts = 5.72 + j * 0.6 + Math.floor(Math.max(0, t - 5.72) / 4.5) * 4.5 * (t < 11 ? 1 : 0); const q = (t - ts) / 2.6; m.visible = q > 0 && q < 1; m.scale.setScalar(rip.R * (1.1 + 7 * Math.max(0, q))); m.material.opacity = 0.5 * Math.sin(Math.PI * clamp(q, 0, 1)) * (1 - clamp(q, 0, 1) * 0.5); });
        const az = KF([[0, -8], [d, 16]], t), ar = az * Math.PI / 180, rx = Math.cos(ar), rz = -Math.sin(ar), bk = 2.5;
        const bo = seg(t, 14.7, 16.2), bx = lerp(7.8, 0, seg(t, 15.2, 19.8)), mw = seg(t, 19.2, 20.8);
        [[bL, -1, cA], [bR, 1, cB]].forEach(([b, sg, c]) => { b.position.set(sg * bx * rx - Math.sin(ar) * bk * (sg < 0 ? 1.04 : 1), 0, sg * bx * rz - Math.cos(ar) * bk * (sg < 0 ? 1.04 : 1)); b.rotation.y = ar;
          b.userData.fm.opacity = 0.07 * bo; b.userData.bm.opacity = 0.9 * bo; b.userData.fm.color.copy(c).lerp(cW, mw); b.userData.bm.color.copy(c).lerp(cW, mw); });
        mg.material.opacity = 0.2 * (1 - 0.5 * seg(t, 4, 7));
        orbit(C, 0, 0, 0, KF([[0, 3.3], [3.56, 3.6], [6.8, 8.6], [11, 8.0], [14.7, 8.4], [19.5, 18], [d, 18.6]], t), az, KF([[0, 8], [d, 10]], t));
        return [S, C, []];
      };
    }
    // out: string -> atom -> Earth -> stars, quick zoom-out with dissolves; faint ladder of light
    const S = stage("space", { key: 2.2, hemi: 0.15, rim: 0.6 });
    S.add(C);
    const L0 = new THREE.Group(); const st = sloop(0.5, 0.016, sMat, 150); st.userData.p.n = 3; st.userData.p.a = 0.13; st.rotation.x = 0.4; const stG = glowSprite(0xfff1d6, 2.2, 0.16); L0.add(st, stG); S.add(L0);
    const L1 = new THREE.Group(); S.add(L1);
    { const r = rnd(29), pm = new THREE.MeshStandardMaterial({ color: P.proton, roughness: 0.45, metalness: 0.05 }), nm = new THREE.MeshStandardMaterial({ color: P.neutron, roughness: 0.45, metalness: 0.05 }), sg = new THREE.SphereGeometry(0.09, 24, 16);
      for (let i = 0; i < 14; i++) { const m = new THREE.Mesh(sg, i % 2 ? pm : nm); const u = r() * 2 - 1, th = r() * TAU, rr = 0.13 * Math.cbrt(r()), s = Math.sqrt(1 - u * u); m.position.set(rr * s * Math.cos(th), rr * u, rr * s * Math.sin(th)); L1.add(m); }
      const p = []; for (let i = 0; i < 4000; i++) { const u = r() * 2 - 1, th = r() * TAU, rr = 1.4 * Math.pow(-Math.log(1 - r() * 0.98) / 3, 0.8) + 0.2, s = Math.sqrt(1 - u * u); p.push(rr * s * Math.cos(th), rr * u, rr * s * Math.sin(th)); }
      const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); L1.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, color: P.electron, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }))); }
    const L1mats = []; L1.traverse((m) => { if (m.material) { m.material.transparent = true; L1mats.push([m.material, m.material.opacity]); } });
    const L2 = earth(); S.add(L2); L2.rotation.set(0.35, 0, 0.2);
    const L3g = galaxy(17, 36000); S.add(L3g); L3g.rotation.x = 0.5;
    const lad = new THREE.Group(); lad.position.set(0, 0, -12); lad.rotation.x = -0.35; C.add(lad);
    const rungM = M.light(0xf3e3c3, 0), railM = M.light(0xf3e3c3, 0);
    const rungs = Array.from({ length: 14 }, () => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.022), rungM.clone()); lad.add(m); return m; });
    [-0.6, 0.6].forEach((x) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.016, 9), railM); m.position.set(x, 5.5, 0); lad.add(m); });
    const lvl = (t, a, b, c, e) => seg(t, a, b) * (1 - seg(t, c, e));
    return (t, d) => {
      const ft = o.T0 + t;
      st.userData.p.w = ft * 3.2; st.rotation.y = ft * 0.2;
      const s0 = Math.pow(10, -1.2 * Math.max(0, t - 0.45)); L0.scale.setScalar(s0); L0.visible = t < 1.75; stG.material.opacity = 0.16 * (1 - seg(t, 1.0, 1.6)); sMat.opacity = 1 - seg(t, 1.15, 1.7);
      const a1 = lvl(t, 1.15, 1.45, 3.0, 3.4), s1 = 2.6 * Math.pow(10, -0.95 * (t - 1.15)); L1.visible = a1 > 0; L1.scale.setScalar(s1); L1.rotation.y = ft * 0.1; L1mats.forEach(([m, op]) => (m.opacity = op * a1));
      const a2 = lvl(t, 2.85, 3.35, 4.7, 5.2), s2 = 2.3 * Math.pow(10, -0.85 * (t - 2.85)); L2.visible = a2 > 0; L2.scale.setScalar(s2); L2.userData.mats[0].opacity = a2; L2.userData.mats[1].opacity = 0.85 * a2; L2.rotation.y = ft * 0.05;
      const s3 = 8 * Math.pow(10, -0.33 * (t - 4.6)), a3 = seg(t, 4.6, 5.6) * clamp(2.2 / s3, 0, 1); L3g.visible = a3 > 0; L3g.scale.setScalar(s3); L3g.userData.fade(a3); L3g.rotation.y = -ft * 0.03;
      const la = seg(t, 2.81, 4.6) * 0.16, sp = 0.62, dr = (ft * 0.22) % sp;
      rungs.forEach((m, k) => { const y = 1.7 + k * sp + dr; m.position.y = y; m.material.opacity = la * clamp((y - 1.7) / 0.6, 0, 1) * clamp(1 - (y - 1.7) / 8, 0, 1); });
      railM.opacity = la * 0.25;
      orbit(C, 0, 0, 0, 4, KF([[0, 8], [d, 30]], t), KF([[0, 18], [d, 30]], t));
      return [S, C, []];
    };
  };
})();
