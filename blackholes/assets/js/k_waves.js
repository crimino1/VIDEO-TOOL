/* Group D kinds: merger (gravitational waves, LIGO), eht (Event Horizon Telescope).
   Pure functions of film time ft = o.T0 + t, so shots split around an insert continue seamlessly. */
(function () {
  const { THREE, M, W, H, seg, smooth, smoother, lerp, clamp, rnd, KF, tex, stage, cam, orbit, canvasTex, glowSprite } = L3;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const once = (f) => { let v; return () => v || (v = f()); };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const sq = (x) => x * x;
  // camera on an orbit; sx/sy shift the subject right/up by a fraction of the frame
  function aim(C, tx, ty, tz, dist, az, el, sx, sy) {
    orbit(C, tx, ty, tz, dist, az, el);
    C.setViewOffset(W, H, -(sx || 0) * W, (sy || 0) * H, W, H);
  }
  const fadeIO = (ft, a, b, f) => seg(ft, a, a + (f || 0.5)) * (1 - seg(ft, b - (f || 0.5), b));
  const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  // a point on the camera plane through p: offsets in camera right/up units
  const camPt = (C, p, rx, uy) => { const r = V(1, 0, 0).applyQuaternion(C.quaternion), u = V(0, 1, 0).applyQuaternion(C.quaternion); return p.clone().addScaledVector(r, rx).addScaledVector(u, uy); };
  const P3 = (s, v, op) => [s, v.x, v.y, v.z, op];
  // static tube revealed by fraction f (light travelling along it)
  function revealTube(pts, r, mat, segs) {
    const curve = new THREE.CatmullRomCurve3(pts), n = segs || pts.length * 2, g = new THREE.TubeGeometry(curve, n, r, 6, false), m = new THREE.Mesh(g, mat);
    m.userData.show = (f) => { g.setDrawRange(0, Math.floor(clamp(f, 0, 1) * n) * 36); m.visible = f > 0; };
    return m;
  }
  const ringTex = once(() => canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 96, 128, 128, 126); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.7, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }));

  // ======================================================================= MERGER: space-time sheet
  const gridTex = once(() => {
    const n = 210, draw = (g, w, h, base, col, lw) => { g.fillStyle = base; g.fillRect(0, 0, w, h); g.strokeStyle = col; g.lineWidth = lw; const c = w / n; for (let i = 0; i <= n; i++) { const x = Math.round(i * c) + 0.5; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); } };
    const map = canvasTex(2048, 2048, (g, w, h) => draw(g, w, h, "#0c0e12", "rgba(150,175,205,.15)", 0.9));
    const em = canvasTex(2048, 2048, (g, w, h) => draw(g, w, h, "#000", "#fff", 0.9));
    map.anisotropy = em.anisotropy = 16; return { map, em };
  });
  const SZ = 92, SEG = 400, RFADE = [38, 46];
  const sheetGeo = once(() => {
    const g = new THREE.PlaneGeometry(SZ, SZ, SEG, SEG); g.rotateX(-Math.PI / 2);
    const p = g.attributes.position.array, n = p.length / 3, R = new Float32Array(n), TH = new Float32Array(n), X = new Float32Array(n), Z = new Float32Array(n);
    for (let i = 0; i < n; i++) { X[i] = p[i * 3]; Z[i] = p[i * 3 + 2]; R[i] = Math.hypot(X[i], Z[i]); TH[i] = Math.atan2(Z[i], X[i]); }
    const col = new Float32Array(n * 4).fill(1); g.setAttribute("color", new THREE.BufferAttribute(col, 4));
    g.userData = { R, TH, X, Z, n };
    return g;
  });
  const sheetMat = once(() => { const G = gridTex(); return new THREE.MeshStandardMaterial({ map: G.map, emissiveMap: G.em, emissive: 0x5d7da3, emissiveIntensity: 0.07, roughness: 0.5, envMapIntensity: 0.35, metalness: 0, vertexColors: true, transparent: true, side: THREE.DoubleSide }); });

  // closed-form inspiral: orbital phase, angular speed, separation (tm = merger time)
  function inspiral(tm, K, amin, tau0) {
    const wm = 0.625 * K * Math.pow(tau0, -0.375), phm = -K * Math.pow(tau0, 0.625);
    return {
      tm, wm,
      phi: (t) => t < tm ? -K * Math.pow(tm - t + tau0, 0.625) : phm + wm * (t - tm),
      om: (t) => t < tm ? 0.625 * K * Math.pow(tm - t + tau0, -0.375) : wm,
      sep: (t) => t < tm ? amin * Math.pow((tm - t + tau0) / tau0, 0.25) : amin * (1 - smooth((t - tm) / 0.22)),
    };
  }
  // black hole: black shadow out to a thin soft photon ring, faint warm halo
  const bhGeo = once(() => new THREE.SphereGeometry(1, 64, 32));
  const prTex = once(() => canvasTex(512, 512, (g, w) => {
    const id = g.createImageData(w, w), d = id.data;
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { const r = Math.hypot(x + 0.5 - w / 2, y + 0.5 - w / 2) / (w / 2), v = r < 0.8 ? Math.exp(-sq((r - 0.8) / 0.012)) : Math.exp(-sq((r - 0.8) / 0.02)) + 0.22 * Math.exp(-(r - 0.8) / 0.05); const i = (y * w + x) * 4; d[i] = 255; d[i + 1] = 236; d[i + 2] = 212; d[i + 3] = clamp(255 * v, 0, 255) * (1 - smooth((r - 0.9) / 0.1)); }
    g.putImageData(id, 0, 0);
  }));
  const shTex = once(() => canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(0,0,0,1)"); gr.addColorStop(0.79, "rgba(0,0,0,1)"); gr.addColorStop(0.82, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }));
  function hole() {
    const G = new THREE.Group(), core = new THREE.Mesh(bhGeo(), new THREE.MeshBasicMaterial({ color: 0x000000 }));
    const disc = new THREE.Sprite(new THREE.SpriteMaterial({ map: shTex(), color: 0x000000, transparent: true }));
    const ring = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map: prTex(), color: 0xffffff, opacity: 0.9 }, add)));
    disc.scale.setScalar(3.05); ring.scale.setScalar(3.05);
    const halo = glowSprite(0xffd9b0, 3.4, 0.08);
    G.add(core, disc, ring, halo);
    G.userData.tick = (C, r, k) => { G.scale.setScalar(r); G.visible = r > 0.01; ring.material.opacity = 0.9 * k; halo.material.opacity = 0.08 * k; };
    return G;
  }
  const C_W = 2;   // wave speed on the sheet (units/s)

  function mergerSheet(o) {
    const masses = o.mode === "masses";
    const S = stage("space", { seed: 21, stars: 4000, key: 1.9, hemi: 0.25, rim: 1.0 });
    const geo = sheetGeo(), sheet = new THREE.Mesh(geo, sheetMat()); sheet.renderOrder = -1; S.add(sheet);
    // the sheet fades into the dark with distance from the camera (fog range follows the camera distance; stars unfogged)
    S.fog = new THREE.Fog(0x000000, 10, 30); S.children.forEach((c) => { if (c.isPoints) c.material.fog = false; });
    const cfg = masses
      ? { I: inspiral(1278.8, 3.75, 0.7, 0.25), m1: 0.34, m2: 0.28, mf: 0.56, te: -1e9, A0: 0.15, w0: 0.85 }
      : { I: inspiral(1204.86, 4.77, 0.85, 0.25), m1: 0.4, m2: 0.4, mf: 0.6, te: 1180.82, A0: 0.16, w0: 0.9 };
    const I = cfg.I, tm = I.tm, Apk = Math.min(0.26, cfg.A0 * Math.pow(I.wm / cfg.w0, 2 / 3)), TE2 = 1289.54;
    const b1 = hole(), b2 = hole(), bf = hole(); S.add(b1, b2, bf);
    const wave = new THREE.Mesh(new THREE.RingGeometry(0.99, 1.0, 256, 1).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial(Object.assign({ color: 0xfff1d6, opacity: 0, depthTest: false }, add)));
    wave.renderOrder = 5; S.add(wave);
    const wave2 = wave.clone(); wave2.material = wave.material.clone(); S.add(wave2);
    const flash = glowSprite(0xfff3e2, 4, 0); flash.material.depthTest = false; flash.renderOrder = 6; S.add(flash);
    const C = cam(32);
    const emis = (tr) => tr < tm ? Math.min(0.26, cfg.A0 * Math.pow(I.om(tr) / cfg.w0, 2 / 3)) : Apk * Math.exp(-(tr - tm) / 0.45);
    return (t) => {
      const ft = o.T0 + t, a = I.sep(ft), ph = I.phi(ft), mt = cfg.m1 + cfg.m2;
      const p1 = [a * cfg.m2 / mt * Math.cos(ph), a * cfg.m2 / mt * Math.sin(ph)], p2 = [-a * cfg.m1 / mt * Math.cos(ph), -a * cfg.m1 / mt * Math.sin(ph)];
      const gm = smooth((ft - tm + 0.03) / 0.25), r1 = cfg.m1 * (1 - gm), r2 = cfg.m2 * (1 - gm), rf = cfg.mf * lerp(0.7, 1, gm) * (ft > tm - 0.03 ? 1 : 0);
      const wells = [[p1[0], p1[1], r1], [p2[0], p2[1], r2], [0, 0, rf]];
      const nfR = Math.max(2.4, a * 0.5 + 1.4);
      const { R, TH, X, Z, n } = geo.userData, pos = geo.attributes.position.array, col = geo.attributes.color.array;
      const height = (x, z, r, th, out) => {
        let y = 0;
        for (const [wx, wz, wr] of wells) if (wr > 0) y -= 1.1 * wr / (1 + (sq(x - wx) + sq(z - wz)) / sq(1.6 * wr));
        const tr = ft - r / C_W; let h = 0;
        if (tr > cfg.te) {
          const E = smooth((tr - cfg.te) / 1.2), A = emis(tr);
          if (A > 1e-4) h += E * A * Math.cos(2 * th - 2 * I.phi(tr));
          const b = tr - tm; if (b > -1 && b < 1.5) h += 0.12 * Math.exp(-sq(b / 0.32)) * Math.cos(TAU * 1.2 * b);
        }
        if (masses) { const b = ft - r / 1.2 - TE2; if (b > -2 && b < 2) h += 0.17 * Math.exp(-sq(b / 0.7)) * Math.cos(TAU * 0.55 * b); }
        h *= smooth(r / nfR) / (1 + 0.07 * r);
        if (out) out[0] = h;
        return y + h;
      };
      const hv = [0];
      for (let i = 0; i < n; i++) {
        const r = R[i];
        pos[i * 3 + 1] = height(X[i], Z[i], r, TH[i], hv);
        const b = 1 + Math.min(0.8, 4 * Math.abs(hv[0]));
        col[i * 4] = col[i * 4 + 1] = col[i * 4 + 2] = b; col[i * 4 + 3] = 1 - smooth((r - RFADE[0]) / (RFADE[1] - RFADE[0]));
      }
      geo.attributes.position.needsUpdate = geo.attributes.color.needsUpdate = true; geo.computeVertexNormals();
      const hAt = (x, z) => height(x, z, Math.hypot(x, z), Math.atan2(z, x));

      // camera
      let tx = 0, ty = 0, dist, az, el, sx = 0, sy = 0;
      if (!masses) {
        dist = KF([[1175.84, 17], [1191, 15], [1204.86, 12.5], [1210, 17], [1213, 22], [1219, 52], [1222.54, 64]], ft);
        el = KF([[1175.84, 34], [1194.32, 36], [1204.86, 40], [1213, 44], [1219, 58], [1222.54, 64]], ft);
        az = 24 - (ft - 1175.84) * 1.15;
      } else {
        dist = KF([[1264.14, 13], [1278.8, 11], [1285.4, 12], [1294.2, 13], [1303.9, 34]], ft);
        el = KF([[1264.14, 26], [1278.8, 31], [1285.4, 27], [1294.2, 27], [1303.9, 44]], ft);
        az = 18 - (ft - 1264.14) * 0.9;
        const calm = seg(ft, 1284.8, 1286.2) * (1 - seg(ft, 1293.6, 1296.5));
        sx = lerp(0.04, 0.2, calm); sy = lerp(0.02, 0.17, calm);
      }
      aim(C, tx, ty, 0, dist, az, el, sx, sy);
      S.fog.near = dist * 0.8; S.fog.far = dist * 2.1;

      // holes
      const lift = (r) => r * 1.6;
      b1.position.set(p1[0], hAt(p1[0], p1[1]) + lift(r1), p1[1]); b2.position.set(p2[0], hAt(p2[0], p2[1]) + lift(r2), p2[1]);
      bf.position.set(0, hAt(0, 0) + lift(rf), 0);
      b1.userData.tick(C, r1, 1); b2.userData.tick(C, r2, 1); bf.userData.tick(C, rf, 1);
      // merger ring + flash
      const dt = ft - tm, Rw = Math.max(0.01, C_W * dt);
      wave.scale.setScalar(Rw); wave.position.y = 0.05;
      wave.material.opacity = dt > 0 ? 0.3 * Math.exp(-dt / 12) * smooth(Rw / 1.2) : 0;
      flash.material.opacity = dt > -0.1 ? 0.22 * Math.exp(-sq((dt - 0.12) / 0.45)) : 0; flash.position.set(0, rf + 0.2, 0);
      let pins = [];
      if (masses) {
        const d2 = ft - TE2, R2 = Math.max(0.01, 1.2 * d2);
        wave2.scale.setScalar(R2); wave2.position.y = 0.05;
        wave2.material.opacity = d2 > 0 ? 0.42 * Math.exp(-d2 / 4.5) * smooth(R2 / 1.2) : 0;
        const pa = 0.95, pin36 = fadeIO(ft, 1270.2, 1277.6, 0.5), pin62 = fadeIO(ft, 1282.2, 1286.0, 0.5);
        pins.push(["36 suns", b1.position.x, b1.position.y + r1 * 1.3, b1.position.z, pin36 * pa], ["29 suns", b2.position.x, b2.position.y + r2 * 1.3, b2.position.z, pin36 * pa]);
        pins.push(["62 suns", 0, bf.position.y + rf * 1.3, 0, pin62]);
        if (ft > 1294) {   // anchor glides along the far-left stretch of the energy ring
          const a = az * D2R, fx = -Math.sin(a) - 0.55 * Math.cos(a), fz = -Math.cos(a) + 0.55 * Math.sin(a), fn = Math.hypot(fx, fz);
          const q = V(R2 * fx / fn, 0.05, R2 * fz / fn), sp = q.clone().project(C), vis = smooth((0.92 - Math.abs(sp.x)) / 0.1) * smooth((0.8 - sp.y) / 0.1);
          pins.push(P3("three suns of energy", q, fadeIO(ft, 1294.3, 1301.5, 0.6) * vis));
        }
      }
      return [S, C, pins];
    };
  }

  // ======================================================================= MERGER: LIGO detector
  const groundTex = once(() => {
    const t = canvasTex(1024, 1024, (g, w, h) => {
      g.fillStyle = "rgb(121,104,89)"; g.fillRect(0, 0, w, h); const r = rnd(61);
      for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${150 + r() * 30 | 0},${125 + r() * 25 | 0},${100 + r() * 20 | 0},${0.12 + r() * 0.18})`; const s = 2 + r() * 10; g.fillRect(r() * w, r() * h, s, s * (0.5 + r())); }
      for (let i = 0; i < 26000; i++) { g.fillStyle = `rgba(${66 + r() * 20 | 0},${68 + r() * 16 | 0},${56 + r() * 12 | 0},${0.25 + r() * 0.35})`; const s = 1 + r() * 2.6; g.beginPath(); g.arc(r() * w, r() * h, s, 0, TAU); g.fill(); }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(160, 160); t.anisotropy = 16; return t;
  });
  function ligo(o) {
    const S = new THREE.Scene(); S.environment = L3.env;
    const haze = new THREE.Color(0xa9b5c0); S.background = haze; S.fog = new THREE.Fog(haze, 90, 1300);
    // sky dome
    const sg = new THREE.SphereGeometry(1800, 32, 16), sp = sg.attributes.position, sc = new Float32Array(sp.count * 3);
    for (let i = 0; i < sp.count; i++) { const y = sp.getY(i) / 1800, k = smooth(y / 0.35); const c = new THREE.Color(0xb3bfca).lerp(new THREE.Color(0x6f93bd), k); sc.set([c.r, c.g, c.b], i * 3); }
    sg.setAttribute("color", new THREE.BufferAttribute(sc, 3));
    S.add(new THREE.Mesh(sg, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false })));
    const sun = new THREE.DirectionalLight(0xfff0dc, 2.7); sun.position.set(-40, 70, 25); sun.target.position.set(-18, 0, -18); S.add(sun, sun.target);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, near: 1, far: 200 }); sun.shadow.bias = -0.0005; sun.shadow.radius = 3;
    sun.position.add(sun.target.position);
    S.add(new THREE.HemisphereLight(0xc4d6ea, 0x6e5c49, 0.85));
    // ground with large-scale colour variation
    const gg = new THREE.PlaneGeometry(2600, 2600, 160, 160); gg.rotateX(-Math.PI / 2);
    const gp = gg.attributes.position, gc = new Float32Array(gp.count * 3);
    for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), z = gp.getZ(i), v = 0.9 + 0.07 * Math.sin(x * 0.031 + 1.3) * Math.sin(z * 0.027) + 0.05 * Math.sin(x * 0.11 - z * 0.07) + 0.04 * Math.sin(z * 0.19 + x * 0.05); gc.set([v, v * 0.99, v * 0.97], i * 3); }
    gg.setAttribute("color", new THREE.BufferAttribute(gc, 3));
    const ground = new THREE.Mesh(gg, new THREE.MeshStandardMaterial({ map: groundTex(), vertexColors: true, roughness: 0.97, metalness: 0, envMapIntensity: 0.2 })); ground.receiveShadow = true; S.add(ground);
    // distant ridges
    const rr = rnd(8), N = 260, rp = [], ri = [];
    let hh = 20; const hs = [];
    for (let i = 0; i <= N; i++) { hh = clamp(hh + (rr() - 0.5) * 9, 4, 70); hs.push(hh); }
    for (let i = 0; i <= N; i++) { const a = i / N * TAU, R = 900 + 150 * Math.sin(a * 3 + 1), h = hs[i] * (0.4 + 0.6 * Math.pow(Math.sin(a * 2 + 0.5) * 0.5 + 0.5, 2)); rp.push(R * Math.cos(a), -2, R * Math.sin(a), R * Math.cos(a), h, R * Math.sin(a)); if (i < N) { const k = i * 2; ri.push(k, k + 1, k + 2, k + 1, k + 3, k + 2); } }
    const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.Float32BufferAttribute(rp, 3)); rg.setIndex(ri); rg.computeVertexNormals();
    S.add(new THREE.Mesh(rg, new THREE.MeshStandardMaterial({ color: 0x6e6460, roughness: 1, side: THREE.DoubleSide })));
    // detector: corner at origin, arm X along -x, arm Y along -z
    const concrete = new THREE.MeshStandardMaterial({ color: 0xdcd8cf, roughness: 0.82, transparent: true });
    const white = M.paint(0xe9e9e6, 0.6), blue = M.paint(0x2c5a94, 0.45), grey = M.matte(0x8f8a82), pad = M.matte(0xa59f95);
    const sh = (m) => { m.castShadow = m.receiveShadow = true; return m; };
    const box = (w, h, d, mat, x, y, z) => { const m = sh(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat)); m.position.set(x, y + h / 2, z); S.add(m); return m; };
    const armGeo = new THREE.BoxGeometry(1, 0.09, 0.15); armGeo.translate(-0.5, 0.045, 0);
    const armX = sh(new THREE.Mesh(armGeo, concrete)); S.add(armX);
    const armY = sh(new THREE.Mesh(armGeo, concrete)); armY.rotation.y = -Math.PI / 2; S.add(armY);
    const beamM = new THREE.MeshBasicMaterial({ color: 0xff3a2a, transparent: true, opacity: 0 });
    const bg = new THREE.CylinderGeometry(0.02, 0.02, 1, 8); bg.rotateZ(Math.PI / 2); bg.translate(-0.5, 0.045, 0);
    const beamX = new THREE.Mesh(bg, beamM), beamY = new THREE.Mesh(bg, beamM); beamY.rotation.y = -Math.PI / 2; S.add(beamX, beamY);
    const roadM = M.matte(0xa08b72), rgeo = new THREE.PlaneGeometry(1, 0.07); rgeo.rotateX(-Math.PI / 2); rgeo.translate(-0.5, 0.004, 0);
    const roadX = new THREE.Mesh(rgeo, roadM); roadX.position.z = 0.3; roadX.scale.x = 41; roadX.receiveShadow = true;
    const roadY = new THREE.Mesh(rgeo, roadM); roadY.rotation.y = -Math.PI / 2; roadY.position.x = 0.3; roadY.scale.x = 41; roadY.receiveShadow = true; S.add(roadX, roadY);
    // corner station
    const padM = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.9).rotateX(-Math.PI / 2), pad); padM.position.set(0.95, 0.006, 0.7); padM.receiveShadow = true; S.add(padM);
    box(0.95, 0.12, 0.42, blue, 0.55, 0, 0.32); box(0.95, 0.07, 0.42, white, 0.55, 0.12, 0.32); box(0.42, 0.24, 0.3, white, 0.28, 0, 0.2);
    box(0.5, 0.08, 0.3, white, 1.5, 0, 0.85); box(0.3, 0.07, 0.22, blue, 1.25, 0, 0.35); box(0.22, 0.06, 0.16, white, 0.2, 0, 1.2);
    const tank = sh(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.1, 24), M.paint(0x34507a, 0.5))); tank.position.set(1.75, 0.05, 0.25); S.add(tank);
    // mid and end stations (end ones move with the arm length)
    box(0.3, 0.12, 0.22, white, -20, 0, 0.05); box(0.22, 0.12, 0.3, white, 0.05, 0, -20);
    const endX = new THREE.Group(), endY = new THREE.Group(); S.add(endX, endY);
    for (const [g, rot] of [[endX, 0], [endY, -Math.PI / 2]]) { const m = sh(new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.17, 0.3), white)); m.position.set(-0.15, 0.085, 0.04); g.add(m); const p2 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.7).rotateX(-Math.PI / 2), pad); p2.position.set(-0.1, 0.006, 0.12); p2.receiveShadow = true; g.add(p2); g.rotation.y = rot; }
    // chirp trace: rises in pitch and stops
    const cp = [];
    for (let i = 0; i <= 1400; i++) { const s = i / 1400, tc = 0.93, tau = Math.max(tc - s, 0) + 0.004, ph = -38 * Math.pow(tau, 0.625) + (s > tc ? 60 * (s - tc) : 0), A = s < tc ? 0.18 * Math.pow(tau / tc, -0.27) : 0.18 * Math.pow(0.004 / tc, -0.27) * Math.exp(-(s - tc) / 0.012); cp.push(V(lerp(-7, 7, s), Math.min(A, 1.25) * Math.sin(ph * 2.2), 0)); }
    const chirp = revealTube(cp, 0.045, new THREE.MeshBasicMaterial({ color: 0xf6ead6, transparent: true, opacity: 0.95, fog: false }), 1400);
    const chirpG = new THREE.Group(); chirpG.add(chirp); S.add(chirpG);
    const C = cam(32); C.far = 3000; C.updateProjectionMatrix();
    return (t) => {
      const ft = o.T0 + t;
      const env = seg(ft, 1239.06, 1239.9) * (1 - seg(ft, 1244.4, 1245.6)), e = 0.08 * env * Math.sin(TAU * 0.55 * (ft - 1239.06));
      const Lx = 40 * (1 + e), Ly = 40 * (1 - e);
      armX.scale.x = beamX.scale.x = Lx; armY.scale.x = beamY.scale.x = Ly;
      endX.position.set(-Lx, 0, 0); endY.position.set(0, 0, -Ly);
      const cut = seg(ft, 1235.6, 1236.8) * (1 - seg(ft, 1246.0, 1247.5));
      concrete.opacity = 1 - 0.68 * cut; concrete.depthWrite = cut < 0.05; beamM.opacity = 0.95 * cut;
      // camera
      const K5 = (a) => KF([[1230.72, a[0]], [1235.5, a[1]], [1238.3, a[2]], [1241.0, a[3]], [1245.0, a[4]], [1247.5, a[5]], [1257.26, a[6]]], ft);
      const tx = K5([-9, -5, -6, -14, -15, -18, -18]), tz = K5([-13, -8, -6, -14, -15, -18, -18]);
      const dist = K5([36, 20, 17, 64, 68, 80, 78]), az = K5([20, 28, 40, 45, 45, 45, 40]), el = K5([13, 12, 16, 34, 35, 30, 29]);
      const lay = seg(ft, 1245.0, 1247.5);
      aim(C, tx, 0, tz, dist, az, el, 0.1 * lay, 0.08 * lay);
      C.updateMatrixWorld(); chirpG.position.copy(camPt(C, V(tx, 0, tz), 8, 10)); chirpG.quaternion.copy(C.quaternion); chirpG.scale.setScalar(1.7);
      chirp.userData.show(seg(ft, 1252.0, 1255.0));
      chirp.visible = ft > 1252.0;
      chirp.material.opacity = 0.95 * seg(ft, 1251.9, 1252.3);
      const pins = [
        ["4 km", 0, 0.12, -20, fadeIO(ft, 1231.4, 1236.0, 0.5)],
        ["laser beams", -5, 0.06, 0, fadeIO(ft, 1236.9, 1239.4, 0.4)],
        ["less than the width of a proton", -Lx, 0.2, 0, fadeIO(ft, 1240.4, 1245.4, 0.5)],
      ];
      return [S, C, pins];
    };
  }

  LABK.merger = (o) => (o.mode === "ligo" ? ligo(o) : mergerSheet(o));

  // ======================================================================= EHT
  // the EHT image look: blurred ring, afmhot colour map, brighter below
  const ehtTex = once(() => canvasTex(512, 512, (g, w, h) => {
    const id = g.createImageData(w, h), d = id.data, r = rnd(12), lumps = [];
    for (let i = 0; i < 6; i++) lumps.push([r() * TAU, 0.15 + 0.2 * r()]);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (x + 0.5) / w - 0.5, dy = (y + 0.5) / h - 0.5, rr = Math.hypot(dx, dy) * 2, th = Math.atan2(dy, dx);
      let b = 0.6 + 0.42 * Math.cos(th - 1.75) + 0.12 * Math.cos(th - 3.3);
      for (const [a, k] of lumps) b += k * 0.4 * Math.exp(-sq(Math.atan2(Math.sin(th - a), Math.cos(th - a)) / 0.5));
      let v = b * Math.exp(-sq((rr - 0.4) / 0.13)) * 0.72 + 0.14 * Math.exp(-sq(rr / 0.62)) + 0.05 * Math.exp(-sq((rr - 0.7) / 0.25)) * (0.6 + 0.4 * Math.cos(th + 2.3));
      v = clamp(v, 0, 1.2);
      const i = (y * w + x) * 4;
      d[i] = clamp(255 * 2 * v * 0.98, 0, 255); d[i + 1] = clamp(255 * (2 * v - 0.55), 0, 255); d[i + 2] = clamp(255 * (2 * v - 1.25), 0, 255);
      d[i + 3] = 255 * clamp(1 - smooth((rr - 0.78) / 0.22), 0, 1);
    }
    g.putImageData(id, 0, 0);
  }));
  // accretion disk texture (warm), ported from strings blackhole
  function polarRing(rin, rout, ts, ps) { const g = new THREE.RingGeometry(rin, rout, ts, ps), uv = g.attributes.uv; let k = 0; for (let j = 0; j <= ps; j++) for (let i = 0; i <= ts; i++) uv.setXY(k++, i / ts, j / ps); return g; }
  const diskTex = once(() => {
    const w = 1024, h = 256, t = canvasTex(w, h, (g) => {
      const id = g.createImageData(w, h), d = id.data, r = rnd(77), band = [];
      for (let i = 0; i < h; i++) band.push(r()); for (let k = 0; k < 7; k++) for (let i = 1; i < h - 1; i++) band[i] = (band[i - 1] + band[i] + band[i + 1]) / 3;
      const ph = [r() * 6, r() * 6, r() * 6];
      for (let y = 0; y < h; y++) {
        const v = 1 - (y + 0.5) / h, prof = smooth(v / 0.05) * Math.pow(1 - v, 1.7), b = 0.75 + 0.6 * (band[y] - 0.45);
        const c1 = smooth(v / 0.4), c2 = smooth((v - 0.35) / 0.6);
        const R = lerp(lerp(255, 236, c1), 130, c2), G = lerp(lerp(214, 118, c1), 40, c2), B = lerp(lerp(160, 44, c1), 16, c2);
        for (let x = 0; x < w; x++) {
          const u = x / w * TAU, s = 0.86 + 0.09 * Math.sin(5 * u + v * 30 + ph[0]) + 0.06 * Math.sin(13 * u - v * 50 + ph[1]) + 0.04 * Math.sin(31 * u + v * 90 + ph[2]);
          const i = (y * w + x) * 4; d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = clamp(255 * prof * b * s, 0, 255);
        }
      }
      g.putImageData(id, 0, 0);
    });
    t.wrapS = THREE.RepeatWrapping; return t;
  });
  const galTex = once(() => canvasTex(128, 128, (g) => {
    g.translate(64, 64); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 60); gr.addColorStop(0, "rgba(255,248,236,1)"); gr.addColorStop(0.12, "rgba(255,240,220,.6)"); gr.addColorStop(0.5, "rgba(200,210,235,.14)"); gr.addColorStop(1, "rgba(200,210,235,0)");
    g.scale(1, 0.45); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 60, 0, TAU); g.fill();
  }));
  // giant elliptical galaxy with its jet
  const m87Tex = once(() => canvasTex(512, 512, (g, w, h) => {
    const id = g.createImageData(w, h), d = id.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (x + 0.5) / w - 0.5, dy = ((y + 0.5) / h - 0.5) / 0.86, r = Math.hypot(dx, dy) / 0.5;
      let v = Math.exp(-7.67 * (Math.pow(r / 0.2 + 1e-4, 0.25) - 1)) / 2140;
      v = clamp(v, 0, 1) * Math.pow(1 - smooth(r), 3);
      const i = (y * w + x) * 4, k = Math.pow(v, 0.2);
      d[i] = 255; d[i + 1] = 238 - 18 * (1 - k); d[i + 2] = 214 - 40 * (1 - k); d[i + 3] = clamp(255 * 1.5 * k, 0, 255);
    }
    g.putImageData(id, 0, 0);
    g.translate(w / 2, h / 2); g.rotate(-0.42);
    for (let i = 0; i < 40; i++) { const s = i / 40; g.fillStyle = `rgba(205,222,255,${0.05 * (1 - s)})`; g.beginPath(); g.ellipse(14 + s * 84, 0, 5 + 3 * s, 2.2, 0, 0, TAU); g.fill(); }
    for (const [k, b] of [[38, 0.14], [62, 0.1], [88, 0.07]]) { const gr = g.createRadialGradient(k, 0, 0, k, 0, 6); gr.addColorStop(0, `rgba(225,235,255,${b})`); gr.addColorStop(1, "rgba(225,235,255,0)"); g.fillStyle = gr; g.fillRect(k - 6, -6, 12, 12); }
  }));
  function cloudPts(seed, n, sig, color, size) {
    const r = rnd(seed), p = new Float32Array(n * 3), gss = () => (r() + r() + r() + r() - 2) * 0.87;
    for (let i = 0; i < n; i++) p.set([gss() * sig, gss() * sig * 0.86, gss() * sig * 0.3], i * 3);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color, size: size || 1.5, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  }
  const spr = (map, color, s, op) => { const m = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map, color: color || 0xffffff, opacity: op === undefined ? 1 : op }, add))); m.scale.setScalar(s); return m; };
  function earthMesh(R) {
    const G = new THREE.Group();
    const e = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 64), new THREE.MeshStandardMaterial({ map: tex("2k_earth_daymap.jpg"), roughness: 0.85, metalness: 0, envMapIntensity: 0.05 }));
    const c = new THREE.Mesh(new THREE.SphereGeometry(R * 1.006, 128, 64), new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: tex("2k_earth_clouds.jpg"), transparent: true, opacity: 0.8, depthWrite: false, roughness: 1, envMapIntensity: 0.05 }));
    const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.03, 96, 48), new THREE.ShaderMaterial({
      vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }",
      fragmentShader: "varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - max(dot(vN, vV), 0.0), 2.6); gl_FragColor = vec4(vec3(0.42,0.62,0.95)*f*0.9, f); }",
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    G.add(e, c, atm); G.userData = { e, c };
    return G;
  }
  // unit vector of lat/lon in a three.js SphereGeometry frame (lon 0 faces +x)
  const ll = (lat, lon, r) => { lat *= D2R; lon *= D2R; return V(Math.cos(lat) * Math.cos(lon) * r, Math.sin(lat) * r, -Math.cos(lat) * Math.sin(lon) * r); };

  function ehtOrange(o) {
    const S = stage("space", { seed: 31, stars: 5000 }), C = cam(32);
    // background galaxies
    const r = rnd(4);
    for (let i = 0; i < 70; i++) { const s = spr(galTex(), [0xfff1dc, 0xdfe6f4, 0xf4e6d6][i % 3], 0.1 + 0.25 * r(), 0.3 + 0.4 * r()); s.material.rotation = r() * 3; s.position.set((r() - 0.5) * 36, (r() - 0.5) * 20, -30 - r() * 20); S.add(s); }
    const Gm = new THREE.Group(); S.add(Gm);
    const gal = spr(m87Tex(), 0xffffff, 1.9, 1), core = spr(glowSprite().material.map, 0xfff0dc, 0.09, 0.7), nuc = spr(glowSprite().material.map, 0xffb470, 0.005, 0);
    const ring = spr(ehtTex(), 0xffffff, 2.4e-4, 0); ring.material.depthTest = false; ring.renderOrder = 4;
    const gcs = cloudPts(5, 900, 0.45, 0xffe2c4, 1.2), inner = cloudPts(6, 1800, 0.028, 0xffe8cc, 1.3), gas = cloudPts(7, 900, 0.0016, 0xffa860, 1.6);
    Gm.add(gal, gcs, core, inner, nuc, gas, ring);
    // the Moon with an orange on it, and Earth behind the camera's later pull-back
    const moon = new THREE.Mesh(new THREE.SphereGeometry(1.5, 128, 64), new THREE.MeshStandardMaterial({ map: tex("2k_moon.jpg"), roughness: 1, metalness: 0, color: 0x000000, envMapIntensity: 0.0 }));
    moon.rotation.y = -Math.PI / 2; S.add(moon);
    const oP = ll(12, -16, 1.5).applyAxisAngle(V(0, 1, 0), -Math.PI / 2), orange = new THREE.Mesh(new THREE.SphereGeometry(0.0055, 16, 12), M.paint(0xf08a22, 0.55)); orange.position.copy(oP.clone().multiplyScalar(1.0025)); S.add(orange);
    const earth = earthMesh(5.5); earth.position.set(-15, -1.2, -4); earth.userData.e.rotation.y = earth.userData.c.rotation.y = -30 * D2R; S.add(earth);
    const sun = S.userData.key; sun.position.set(-6, 3, 9); sun.intensity = 2.6;
    return (t) => {
      const ft = o.T0 + t;
      const zp = smoother((ft - 1312.02) / 5.6), L = Math.log10(1 + 0.28 * seg(ft, 1307.84, 1312.02)) * (1 - zp) + zp * 3.6 + 0.07 * Math.max(0, ft - 1317.62);
      const Z = Math.pow(10, L), lg = L;
      Gm.scale.setScalar(Z);
      const out = 1 - seg(ft, 1321.4, 1322.5);
      gal.material.opacity = (1 - seg(lg, 0.55, 1.15)) * out;
      core.material.opacity = 0.75 * (1 - seg(lg, 1.9, 2.5)) * out;
      gcs.material.opacity = 0.3 * (1 - seg(lg, 1.2, 1.8)) * out;
      inner.material.opacity = 0.42 * seg(lg, 0.7, 1.2) * (1 - seg(lg, 2.3, 2.8)) * out;
      nuc.material.opacity = 0.8 * seg(lg, 1.8, 2.4) * (1 - seg(lg, 2.95, 3.3)) * out;
      gas.material.opacity = 0.6 * seg(lg, 2.3, 2.8) * (1 - seg(lg, 3.15, 3.45)) * out;
      ring.material.opacity = seg(lg, 2.85, 3.3) * out; ring.material.rotation = 0.03 * Math.sin(ft * 0.4);
      Gm.visible = out > 0;
      const mk = seg(ft, 1321.6, 1322.8); moon.material.color.setScalar(mk); orange.visible = mk > 0.5; moon.visible = mk > 0;
      moon.rotation.y = -Math.PI / 2 + 0.004 * (ft - 1322);
      earth.userData.e.rotation.y = -30 * D2R + 0.01 * (ft - 1326); earth.userData.c.rotation.y = -30 * D2R + 0.012 * (ft - 1326);
      earth.visible = ft > 1325;
      // camera: fixed on M87 while zooming (scale does the zoom); then the Moon; then pull back to Earth
      let pins = [];
      const mo = seg(ft, 1321.3, 1323.8), pb = seg(ft, 1326.6, 1330.6), oc = oP.clone();
      const tgt = V(lerp(0.35 * oc.x * mo, -6.5, pb), lerp(0.35 * oc.y * mo, -0.6, pb), lerp(0, -1.5, pb));
      const dist = lerp(lerp(10 - 0.25 * seg(ft, 1307.84, 1321.6), lerp(8.4, 7.0, seg(ft, 1321.6, 1326.6)), mo), 24, pb);
      // slow drift from the 1312.00 hand-over (centred) that flows on into the Moon move
      const dz = Math.max(0, ft - 1312.0), daz = -0.6 * dz, del = 0.25 * dz, dsx = 0.07 * seg(ft, 1316.0, 1321.6), dsy = 0.035 * seg(ft, 1316.0, 1321.6);
      aim(C, tgt.x, tgt.y, tgt.z, dist, lerp(lerp(daz, -6, mo), 14, pb), lerp(lerp(del, 4, mo), 6, pb), lerp(lerp(dsx, 0.19, mo), 0.04, pb), dsy * (1 - mo));
      if (ft < 1321.6) pins.push(["M87", 0.22, 0.14, 0, fadeIO(ft, 1308.6, 1312.4, 0.5)]);
      else pins.push(P3("an orange", orange.position, fadeIO(ft, 1322.9, 1326.6, 0.5)));
      return [S, C, pins];
    };
  }

  const SITES = [["Hawaii", 19.82, -155.47, 1333.5], ["Arizona", 32.7, -109.89, 1334.3], ["Mexico", 18.98, -97.31, 1335.1], ["Chile", -23.03, -67.75, 1335.9], ["Spain", 37.07, -3.39, 1336.7], ["South Pole", -89.99, 0, 1337.5]];
  function ehtEarth(o) {
    const S = stage("space", { seed: 41, stars: 5000, key: 2.4, hemi: 0.18 }), C = cam(32), RE = 3;
    S.userData.key.position.set(-4, 3, 10);
    const E = earthMesh(RE); S.add(E);
    const spin = new THREE.Group(); E.userData.e.add(spin);   // sites ride on the Earth mesh
    const dotMap = glowSprite().material.map;
    const sites = SITES.map(([name, lat, lon, t0]) => {
      const p = ll(lat, lon, RE * 1.004), dot = spr(dotMap, 0xfff2dc, 0.16, 0), core = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 8), new THREE.MeshBasicMaterial({ color: 0xfff6ea, transparent: true, opacity: 0 }));
      dot.position.copy(p); core.position.copy(p); const tick = spr(ringTex(), 0xfff0dc, 0.2, 0); tick.position.copy(p);
      spin.add(dot, core, tick);
      return { name, p, t0, dot, core, tick };
    });
    // baselines: each new site links to the earlier ones
    const arcs = [], arcM = new THREE.MeshBasicMaterial({ color: 0xf3e6cf, transparent: true, opacity: 0.42, depthWrite: false });
    const LINKS = [[0, 1], [1, 2], [0, 2], [2, 3], [1, 3], [3, 5], [2, 4], [3, 4], [4, 1]];
    LINKS.forEach(([i, j]) => { const a = sites[i], b = sites[j];
      const pa = a.p.clone().normalize(), pb = b.p.clone().normalize(), ang = pa.angleTo(pb), pts = [];
      for (let k = 0; k <= 48; k++) { const s = k / 48, q = new THREE.Vector3().copy(pa).multiplyScalar(Math.sin((1 - s) * ang) / Math.sin(ang)).addScaledVector(pb, Math.sin(s * ang) / Math.sin(ang)); pts.push(q.normalize().multiplyScalar(RE * (1.006 + 0.035 * Math.sin(Math.PI * s)))); }
      const m = revealTube(pts, 0.007, arcM, 96); spin.add(m); arcs.push({ m, t0: Math.max(a.t0, b.t0) + 0.15 + 0.1 * i });
    });
    // one Earth-sized dish: faint rim + gradient
    const dish = new THREE.Group(); S.add(dish);
    const rim = new THREE.Mesh(new THREE.RingGeometry(RE * 1.05, RE * 1.058, 256, 1), new THREE.MeshBasicMaterial(Object.assign({ color: 0xe9eef6, opacity: 0, side: THREE.DoubleSide, depthTest: false }, add)));
    const fill = new THREE.Mesh(new THREE.CircleGeometry(RE * 1.05, 128), new THREE.MeshBasicMaterial(Object.assign({ map: canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.75, "rgba(255,255,255,.08)"); gr.addColorStop(1, "rgba(255,255,255,.5)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }), color: 0xbcd0ea, opacity: 0, side: THREE.DoubleSide, depthTest: false }, add)));
    const rib = new THREE.Mesh(new THREE.RingGeometry(RE * 0.7, RE * 0.705, 256, 1), rim.material);
    dish.add(fill, rim, rib);
    const v = new THREE.Vector3(), camDir = new THREE.Vector3();
    return (t) => {
      const ft = o.T0 + t;
      const lonC = KF([[1330.6, -112], [1333.6, -104], [1336.2, -84], [1338.6, -70], [1345.74, -70], [1354.36, -60]], ft);
      const latC = KF([[1330.6, 12], [1335.3, 8], [1337.0, -6], [1338.6, -16], [1345.74, -16], [1354.36, -9]], ft);
      E.userData.e.rotation.y = -(90 + lonC) * D2R; E.userData.c.rotation.y = E.userData.e.rotation.y + 0.004 * (ft - 1330);
      const dist = KF([[1330.6, 14.6], [1339, 13.2], [1345.74, 14.2], [1354.36, 14.6]], ft);
      const sx = KF([[1330.6, 0.05], [1339, 0.06], [1345.74, 0.12], [1351, 0.17]], ft);
      aim(C, 0, 0, 0, dist, 0, latC, sx, 0.0);
      C.updateMatrixWorld(); camDir.copy(C.position).normalize(); E.updateMatrixWorld(true);
      const pins = [];
      sites.forEach((s, i) => {
        const on = seg(ft, s.t0, s.t0 + 0.4), w = s.dot.getWorldPosition(v), face = smooth((w.clone().normalize().dot(camDir) - 0.05) / 0.15);
        const tk = ft > 1345.9 ? (ft - 1345.9) % 1 : 1, tickOn = seg(ft, 1345.8, 1346.2) * (1 - seg(ft, 1350.5, 1351.5));
        s.dot.material.opacity = 0.75 * on; s.core.material.opacity = on;
        s.dot.scale.setScalar(0.16 * (1 + 0.6 * Math.exp(-tk * 6) * tickOn));
        s.tick.scale.setScalar(0.12 + 0.55 * tk); s.tick.material.opacity = 0.75 * (1 - tk) * tickOn * on;
        if (i < SITES.length) pins.push([s.name, w.x, w.y, w.z, fadeIO(ft, s.t0 + 0.1, s.t0 + 1.55, 0.3) * face]);
        if (s.name === "Chile") pins.push(["atomic clocks", w.x, w.y, w.z, fadeIO(ft, 1346.1, 1350.2, 0.5) * face]);
      });
      arcs.forEach((a) => a.m.userData.show(seg(ft, a.t0, a.t0 + 0.9)));
      // dish plane just in front of the globe, sized to its limb
      { const d = C.position.length(), dd = d - RE * 1.1; dish.position.copy(camDir).multiplyScalar(RE * 1.1); dish.scale.setScalar(dd * Math.tan(Math.asin(RE / d)) / RE); dish.quaternion.copy(C.quaternion); }
      const dk = seg(ft, 1348.1, 1349.6) * (1 - 0.35 * seg(ft, 1351, 1353));
      rim.material.opacity = 0.55 * dk; fill.material.opacity = 0.5 * dk;
      return [S, C, pins.filter((p) => p[4] > 0.001)];
    };
  }

  // light rays bending around a Schwarzschild black hole (M = 1, horizon r = 2), integrated once; scene scale 0.5
  function rayPaths() {
    const bs = [-6.6, -4.2, -2.6, -1, 1, 2.6, 4.2, 5.35, 6.6, 11];
    return bs.map((b) => {
      let x = -30, y = b, vx = 1, vy = 0; const h2 = b * b, pts = [V(x * 0.5, y * 0.5, 0)], dl = 0.01; let fell = false, len = 0;
      for (let i = 0; i < 20000; i++) {
        const acc = (px, py) => { const r = Math.hypot(px, py), k = -3 * h2 / Math.pow(r, 5); return [k * px, k * py]; };
        const [ax, ay] = acc(x, y); const mx = x + vx * dl / 2, my = y + vy * dl / 2, mvx = vx + ax * dl / 2, mvy = vy + ay * dl / 2;
        const [bx, by] = acc(mx, my); x += mvx * dl; y += mvy * dl; vx += bx * dl; vy += by * dl; len += Math.hypot(mvx, mvy) * dl;
        if (i % 25 === 0) pts.push(V(x * 0.5, y * 0.5, 0));
        const r = Math.hypot(x, y); if (r < 2.02) { fell = true; break; } if (x > 34 || r > 44) break;
      }
      pts.push(V(x * 0.5, y * 0.5, 0));
      return { b, pts, fell, len: len * 0.5 };
    });
  }
  function ehtShadow(o) {
    const S = stage("space", { seed: 51, stars: 5000 }), C = cam(32), RS = 2.6;
    const starPts = S.children.find((m) => m.isPoints); starPts.material.transparent = true; starPts.renderOrder = -2;
    const BH = new THREE.Group(); S.add(BH);
    BH.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshBasicMaterial({ color: 0x000000 })));
    const shadow = new THREE.Mesh(new THREE.CircleGeometry(RS, 128), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1 })); BH.add(shadow);
    const pring = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map: prTex(), color: 0xffb27a, opacity: 0.7 }, add))); pring.scale.setScalar(RS * 2.5); BH.add(pring);
    const dg = polarRing(3.0, 10, 256, 12); dg.rotateX(-Math.PI / 2); dg.setAttribute("color", new THREE.BufferAttribute(new Float32Array(dg.attributes.position.count * 3).fill(1), 3));
    const disk = new THREE.Mesh(dg, new THREE.MeshBasicMaterial(Object.assign({ map: diskTex(), color: 0xffaa66, vertexColors: true, opacity: 1, side: THREE.DoubleSide }, add))); BH.add(disk);
    const eht = new THREE.Sprite(new THREE.SpriteMaterial({ map: ehtTex(), transparent: true, opacity: 0, depthWrite: false, depthTest: false })); eht.scale.setScalar(RS * 1.12 / 0.2); eht.renderOrder = 8; S.add(eht);
    const pred = new THREE.Mesh(new THREE.RingGeometry(RS * 1.11, RS * 1.122, 256, 1), new THREE.MeshBasicMaterial({ color: 0xa9c8ee, transparent: true, opacity: 0, depthWrite: false, depthTest: false, side: THREE.DoubleSide })); pred.renderOrder = 9; S.add(pred);
    const rayM = new THREE.MeshBasicMaterial({ color: 0xffe9cc, transparent: true, opacity: 0, depthWrite: false });
    const rays = rayPaths().map((p) => ({ ...p, m: revealTube(p.pts, 0.018, rayM, Math.min(600, p.pts.length * 2)) }));
    rays.forEach((r) => S.add(r.m));
    const rx = new THREE.Vector3(), fw = new THREE.Vector3();
    return (t) => {
      const ft = o.T0 + t;
      // views: face-on (M87 is seen ~17 deg from its axis) -> side diagram for the rays -> face-on again
      const side = seg(ft, 1393.0, 1395.0) * (1 - seg(ft, 1398.9, 1401.8));
      const el = lerp(73, 7, side), az = lerp(-6 + 0.5 * (ft - 1381.64), 0, side);
      const dist = lerp(KF([[1381.64, 27], [1392.6, 22.5], [1398.9, 23], [1405.76, 21]], ft), 22, side);
      const sx = lerp(KF([[1381.64, 0], [1388.6, 0], [1390.8, 0.11]], ft), 0.1, side), sy = lerp(0, 0.12, side);
      aim(C, 0, 0, 0, dist, az, el, sx, sy);
      // blur into the EHT picture and back
      const pic = seg(ft, 1384.0, 1386.2) * (1 - seg(ft, 1393.0, 1394.2)) + seg(ft, 1401.2, 1403.4);
      eht.material.opacity = pic; eht.material.rotation = 0.02 * Math.sin(ft * 0.5);
      starPts.material.opacity = 1 - 0.8 * pic;
      // disk: rotation, brighter where gas comes toward us
      diskTex().offset.x = -ft * 0.03;
      rx.set(1, 0, 0).applyQuaternion(C.quaternion); fw.set(0, 0, 1).applyQuaternion(C.quaternion);
      const fo = 1 - side, dx = lerp(rx.x, -fw.x, fo * 0.8), dz = lerp(rx.z, -fw.z, fo * 0.8), dn = Math.hypot(dx, dz) || 1;
      const p = dg.attributes.position, c = dg.attributes.color;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), b = 0.75 + 0.6 * (x * dx + z * dz) / dn / Math.hypot(x, z); c.setXYZ(i, b, b, b); }
      c.needsUpdate = true;
      const k3 = 1 - Math.min(1, 1.8 * pic);  // fade the 3D disk out before the photo look takes over (overlap tinted green)
      disk.material.opacity = 0.95 * k3 * (1 - 0.45 * side);
      shadow.quaternion.copy(C.quaternion); pred.quaternion.copy(C.quaternion);
      shadow.material.opacity = 1 - seg(side, 0, 0.35); shadow.visible = shadow.material.opacity > 0.01; pring.material.opacity = 0.8 * k3 * (1 - side);
      // rays: light travels left to right; those inside the shadow radius fall in
      const rv = seg(ft, 1394.5, 1394.9) * (1 - seg(ft, 1399.0, 1400.4));
      rayM.opacity = 0.62 * rv;
      rays.forEach((r, i) => r.m.userData.show(rv > 0 ? ((ft - 1394.6 - 0.02 * Math.abs(r.b)) * 11) / r.len : 0));
      pred.material.opacity = 0.7 * seg(ft, 1397.4, 1398.4) * (1 - 0.3 * pic);
      const pins = [];
      const q1 = camPt(C, V(0, 0, 0), -RS * 1.05, RS * 0.55), q0 = camPt(C, V(0, 0, 0), 0, 0), q2 = camPt(C, V(0, 0, 0), -RS * 0.72, RS * 0.72);
      pins.push(P3("radio light from hot gas", q1, fadeIO(ft, 1384.1, 1390.4, 0.6)));
      pins.push(P3("shadow", q0, fadeIO(ft, 1391.3, 1393.4, 0.4)));
      pins.push(P3("matches Einstein's prediction", q2, seg(ft, 1399.0, 1399.6)));
      return [S, C, pins];
    };
  }

  LABK.eht = (o) => (o.mode === "orange" ? ehtOrange(o) : o.mode === "earth" ? ehtEarth(o) : ehtShadow(o));
})();
