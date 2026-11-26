/* Lab 3D engine for the physics channel (style v2: real objects, real materials, calm colours).
   One WebGL canvas (#g3). Everything is a pure function of timeline time (hf-seek).
   window.LAB = [[a, b, kind, opts], ...] in film seconds. */
(function () {
  const W = 1920, H = 1080, D2R = Math.PI / 180;
  const R = new THREE.WebGLRenderer({ canvas: document.getElementById("g3"), antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(W, H, false); R.setClearColor(0x0b0c10, 1);
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = (p) => { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); };
  const lerp = (a, b, p) => a + (b - a) * p;
  const seg = (t, a, b) => smooth((t - a) / (b - a));

  // studio reflections: dark room with three softboxes
  const env = (() => {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ color: 0x0d0f14, side: THREE.BackSide })));
    const box = (w, h, x, y, z, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k * 0.96), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
    box(26, 14, -18, 22, 14, 7); box(18, 26, 26, 8, 6, 3.2); box(30, 8, 0, 10, -28, 1.6);
    const p = new THREE.PMREMGenerator(R); const t = p.fromScene(s, 0.03).texture; p.dispose(); return t;
  })();

  function stage() {
    const S = new THREE.Scene(); S.environment = env; S.fog = new THREE.Fog(0x0b0c10, 22, 60);
    const key = new THREE.DirectionalLight(0xfff4e6, 2.2); key.position.set(-7, 12, 8); key.castShadow = true;
    key.shadow.mapSize.set(2048, 2048); const c = key.shadow.camera; c.left = -12; c.right = 12; c.top = 10; c.bottom = -10; c.far = 40; key.shadow.bias = -0.0004; key.shadow.radius = 6;
    S.add(key, new THREE.HemisphereLight(0x8fa3c0, 0x15161a, 0.35));
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x191b21, roughness: 0.82, metalness: 0.0, envMapIntensity: 0.35 }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -2.4; floor.receiveShadow = true; S.add(floor);
    return S;
  }
  const copper = () => new THREE.MeshStandardMaterial({ color: 0xc27a45, metalness: 1, roughness: 0.28 });
  const paint = (c) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.1, roughness: 0.42 });
  function letterTex(ch, bg, fg) {
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    g.fillStyle = bg; g.fillRect(0, 0, 256, 256); g.fillStyle = fg; g.font = "bold 150px Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, 128, 136);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function barMagnet() {
    const g = new THREE.Group();
    const half = (ch, col, x) => {
      const mats = [paint(col), paint(col), paint(col), paint(col), new THREE.MeshStandardMaterial({ map: letterTex(ch, "#" + col.toString(16).padStart(6, "0"), "#f1efe9"), metalness: 0.1, roughness: 0.42 }), paint(col)];
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 0.8), mats); m.position.x = x; m.castShadow = true; g.add(m);
    };
    half("S", 0x2a56a8, -0.75); half("N", 0xb5332b, 0.75);
    // field lines: dipole loops in 8 planes around the axis
    const lm = new THREE.LineBasicMaterial({ color: 0x8db8e8, transparent: true, opacity: 0.5, depthWrite: false });
    const lines = new THREE.Group();
    for (let k = 0; k < 8; k++) for (const L of [2.3, 3.4, 5.0]) {
      const pts = [];
      for (let i = 0; i <= 60; i++) { const th = 0.42 + (Math.PI - 0.84) * i / 60, r = L * Math.sin(th) * Math.sin(th); const x = r * Math.cos(th) * 0.95, rho = r * Math.sin(th), ph = k * Math.PI / 4; pts.push(new THREE.Vector3(x, rho * Math.cos(ph), rho * Math.sin(ph))); }
      lines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lm));
    }
    g.add(lines); g.userData.lines = lm;
    return g;
  }
  function meter() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(new THREE.BoxGeometry(2.6, 1.9, 0.7), new THREE.MeshStandardMaterial({ color: 0x1d1f24, roughness: 0.55, metalness: 0.2 })); body.castShadow = true; g.add(body);
    const c = document.createElement("canvas"); c.width = 768; c.height = 512; const x = c.getContext("2d");
    x.fillStyle = "#ece6d6"; x.fillRect(0, 0, 768, 512); x.strokeStyle = "#22242a"; x.fillStyle = "#22242a"; x.lineWidth = 5;
    x.beginPath(); x.arc(384, 470, 330, Math.PI * 1.22, Math.PI * 1.78); x.stroke();
    for (let i = -5; i <= 5; i++) { const a = -Math.PI / 2 + i * 0.176, r0 = i % 5 === 0 ? 290 : 308; x.lineWidth = i % 5 === 0 ? 6 : 3; x.beginPath(); x.moveTo(384 + r0 * Math.cos(a), 470 + r0 * Math.sin(a)); x.lineTo(384 + 330 * Math.cos(a), 470 + 330 * Math.sin(a)); x.stroke(); }
    x.font = "bold 44px Arial, sans-serif"; x.textAlign = "center"; x.fillText("0", 384, 210); x.fillText("−", 150, 300); x.fillText("+", 618, 300); x.font = "bold 40px Arial, sans-serif"; x.fillText("G", 384, 400);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const face = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.5), new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 })); face.position.z = 0.36; g.add(face);
    const piv = new THREE.Group(); piv.position.set(0, -0.63, 0.38);
    const needle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.05, 0.02), new THREE.MeshStandardMaterial({ color: 0xb5332b, roughness: 0.4 })); needle.position.y = 0.52; piv.add(needle); g.add(piv);
    for (const sx of [-0.8, 0.8]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 20), new THREE.MeshStandardMaterial({ color: 0xc9b26b, metalness: 1, roughness: 0.3 })); p.position.set(sx, 1.05, 0); g.add(p); }
    g.userData.piv = piv; return g;
  }

  // ---------- kind: coil + magnet + galvanometer (Faraday's law) ----------
  function faraday(o) {
    const S = stage(), C = new THREE.PerspectiveCamera(30, W / H, 0.1, 200);
    // circuit path: lead in, helix, lead out to the meter
    const N = 9, RAD = 1.25, LEN = 3.6, hel = [];
    for (let i = 0; i <= N * 40; i++) { const a = i / 40 * 2 * Math.PI; hel.push(new THREE.Vector3(-LEN / 2 + LEN * i / (N * 40), RAD * Math.cos(a + Math.PI), RAD * Math.sin(a + Math.PI))); }
    const MP = new THREE.Vector3(5.2, -1.2, 1.6);
    const inL = [new THREE.Vector3(MP.x - 0.8, MP.y + 1.05, MP.z), new THREE.Vector3(MP.x - 0.9, 0.6, MP.z + 0.9), new THREE.Vector3(1.0, -2.25, 2.6), new THREE.Vector3(-2.2, -2.25, 1.6), new THREE.Vector3(-2.3, -1.9, 0.3)];
    const outL = [new THREE.Vector3(2.3, -1.9, 0.2), new THREE.Vector3(3.0, -2.25, 0.6), new THREE.Vector3(4.6, -2.2, 0.2), new THREE.Vector3(MP.x + 1.3, -0.6, MP.z - 0.4), new THREE.Vector3(MP.x + 0.8, MP.y + 1.05, MP.z)];
    const cIn = new THREE.CatmullRomCurve3(inL.concat([hel[0]])), cHel = new THREE.CatmullRomCurve3(hel), cOut = new THREE.CatmullRomCurve3([hel[hel.length - 1]].concat(outL));
    const tube = (curve, n, r, mat) => { const m = new THREE.Mesh(new THREE.TubeGeometry(curve, n, r, 12, false), mat); m.castShadow = true; S.add(m); return m; };
    const coil = tube(cHel, N * 60, 0.085, copper());
    const l1 = tube(cIn, 80, 0.06, paint(0x8a2a24)), l2 = tube(cOut, 80, 0.06, paint(0x23252b));
    const full = new THREE.CurvePath(); full.add(cIn); full.add(cHel); full.add(cOut);
    const mag = barMagnet(); S.add(mag);
    const met = meter(); met.position.copy(MP); met.rotation.set(-0.12, -0.35, 0); S.add(met);
    // current chevrons along the wire
    const NCH = 64, chev = new THREE.InstancedMesh(new THREE.ConeGeometry(0.15, 0.4, 12), new THREE.MeshBasicMaterial({ color: 0xffe2a8, transparent: true, opacity: 0 }), NCH);
    chev.renderOrder = 5; S.add(chev);
    const dummy = new THREE.Object3D(), up = new THREE.Vector3(0, 1, 0);
    const T = o.t; // [coilIn, pushStart, pushEnd, pullStart, pullEnd]
    const X0 = -9.5, X1 = -1.0;
    const mx = (t) => t < T[3] ? lerp(X0, X1, seg(t, T[1], T[2])) : lerp(X1, X0, seg(t, T[3], T[4]));
    const cpl = (x) => Math.exp(-Math.pow((x + 3.6) / 2.1, 2));
    // G(x) = integral of coupling: chevron travel depends only on where the magnet is
    const GX = []; { let s = 0; for (let i = 0; i <= 400; i++) { const x = X0 + (X1 - X0) * i / 400; s += cpl(x) * (X1 - X0) / 400; GX.push(s); } }
    const G = (x) => { const u = clamp((x - X0) / (X1 - X0), 0, 1) * 400, i = Math.floor(u); return lerp(GX[i], GX[Math.min(400, i + 1)], u - i); };
    const coilIdx = coil.geometry.index.count, l1Idx = l1.geometry.index.count, l2Idx = l2.geometry.index.count;
    return (t, d) => {
      const p = t / d;
      const az = lerp(-24, 14, smooth(p)) * D2R, el = 17 * D2R, dist = lerp(21.5, 19.5, smooth(p));
      C.position.set(1.4 + dist * Math.sin(az) * Math.cos(el), -0.3 + dist * Math.sin(el), dist * Math.cos(az) * Math.cos(el)); C.lookAt(1.4, lerp(-0.5, -3.3, seg(t, 24.0, 26.4)), 0);
      const cin = seg(t, T[0], T[0] + 1.6);
      coil.geometry.setDrawRange(0, Math.floor(coilIdx * cin / 6) * 6);
      const lin = seg(t, T[0] + 1.2, T[0] + 2.2);
      l1.geometry.setDrawRange(0, Math.floor(l1Idx * lin / 6) * 6); l2.geometry.setDrawRange(0, Math.floor(l2Idx * lin / 6) * 6);
      const ms = seg(t, T[0] + 1.6, T[0] + 2.4); met.scale.setScalar(Math.max(0.001, ms)); met.visible = ms > 0.001;
      const x = mx(t), v = (mx(t + 0.02) - mx(t - 0.02)) / 0.04, I = v * cpl(x);
      mag.position.set(x, 0, 0); mag.visible = t > T[1] - 0.6; mag.userData.lines.opacity = 0.5 * seg(t, T[1] - 0.4, T[1] + 0.6);
      met.userData.piv.rotation.z = -clamp(I * 0.42, -0.85, 0.85);
      const ph = G(x) * 0.22, op = clamp(Math.abs(I) * 1.6, 0, 1);
      chev.material.opacity = op; chev.visible = op > 0.01;
      if (chev.visible) for (let i = 0; i < NCH; i++) {
        const u = (((i / NCH + ph) % 1) + 1) % 1, pt = full.getPointAt(u), tg = full.getTangentAt(u).multiplyScalar(I >= 0 ? 1 : -1);
        dummy.position.copy(pt).addScaledVector(tg, 0); dummy.quaternion.setFromUnitVectors(up, tg.normalize()); dummy.scale.setScalar(1); dummy.updateMatrix(); chev.setMatrixAt(i, dummy.matrix);
      }
      chev.instanceMatrix.needsUpdate = true;
      return [S, C];
    };
  }

  const KINDS = { faraday };
  const SHOTS = (window.LAB || []).map(([a, b, k, o]) => ({ a, b, f: KINDS[k](o || {}) }));
  const _render = R.render.bind(R);
  R.render = (S, C) => { if (!S.userData.nc) { S.traverse((m) => { m.frustumCulled = false; }); S.userData.nc = 1; } _render(S, C); };
  let lastT = 0;
  function draw(t) {
    lastT = t; let s = null;
    for (const x of SHOTS) if (t >= x.a && t < x.b) s = x;
    if (!s) { R.clear(); return; }
    const [S, C] = s.f(t - s.a, s.b - s.a); R.render(S, C);
    // object labels: DOM elements pinned to 3D points (window.LAB_PINS = [[elementId, x, y, z], ...])
    for (const [id, x, y, z] of (window.LAB_PINS || [])) { const el = document.getElementById(id); if (!el) continue; const v = new THREE.Vector3(x, y, z).project(C); el.style.left = ((v.x + 1) / 2 * W).toFixed(1) + "px"; el.style.top = ((1 - v.y) / 2 * H).toFixed(1) + "px"; }
  }
  window.addEventListener("hf-seek", (e) => draw(e.detail.time));
  window.LAB_draw = draw; draw(0);
})();
