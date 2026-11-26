/* k_micro.js — group A kinds (String Theory film): atomzoom, fluxtube, particles17, notes, guitar, rubberband.
   Each kind: LABK.name = (o) => (t, d) => [scene, camera, pins]; ft = o.T0 + t is film time. Pure functions of t. */
(function () {
  const { THREE, M, P, seg, smooth, lerp, clamp, rnd, KF, orbit, cam, stage, canvasTex, glowSprite, W, H, D2R } = L3;
  const V3 = THREE.Vector3, TAU = Math.PI * 2, UP = new V3(0, 1, 0);
  const SPH = new THREE.SphereGeometry(1, 48, 32);

  // ---------------------------------------------------------------- helpers
  const win = (t, a, b, f) => { f = f || 0.4; return seg(t, a, a + f) * (1 - seg(t, b - f, b)); };
  // integral of seg(t,a,b) from -inf to t: lets a frequency ramp without phase jumps
  const iseg = (t, a, b) => { const L = b - a, p = (t - a) / L; if (p <= 0) return 0; if (p >= 1) return L * (p - 0.5); return L * (p * p * p - p * p * p * p / 2); };
  const dirOf = (az, el) => new V3(Math.sin(az * D2R) * Math.cos(el * D2R), Math.sin(el * D2R), Math.cos(az * D2R) * Math.cos(el * D2R));
  // camera on an orbit; ox/oy shift the picture (negative ox = subject moves right, positive oy = subject moves up)
  function aim(C, p, dist, az, el, ox, oy) {
    orbit(C, p.x, p.y, p.z, dist, az, el);
    C.near = Math.max(1e-4, dist * 0.01); C.far = Math.max(300, dist * 30);
    if (ox || oy) C.setViewOffset(W, H, ox || 0, oy || 0, W, H); else C.clearViewOffset();
    C.updateProjectionMatrix();
  }
  // Catmull-Rom through [[t, v], ...] with eased ends (one continuous move, no stops at keys)
  function cr(K, t) {
    const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    let i = 0; while (t >= K[i + 1][0]) i++;
    const a = K[Math.max(i - 1, 0)], b = K[i], c = K[i + 1], d = K[Math.min(i + 2, n - 1)], h = c[0] - b[0], u = (t - b[0]) / h;
    const m1 = i === 0 ? 0 : (c[1] - a[1]) / (c[0] - a[0]) * h, m2 = i + 2 >= n ? 0 : (d[1] - b[1]) / (d[0] - b[0]) * h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * b[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * c[1] + (u3 - u2) * m2;
  }
  const satin = (c, r) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r !== undefined ? r : 0.4, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.35, sheen: 0.7, sheenRoughness: 0.45, sheenColor: new THREE.Color(0xffffff).lerp(new THREE.Color(c), 0.5) });
  const ball = (mat, r) => { const m = new THREE.Mesh(SPH, mat); m.scale.setScalar(r); return m; };
  const haloMat = (c, op) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending });
  // feathered additive halo: bright where the tube faces the camera, fading to nothing at its silhouette
  const softHalo = (c, op) => new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color(c) }, op: { value: op } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 col; uniform float op; varying vec3 vN; varying vec3 vV; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(col * op * f * f * f, 1.0); }" });
  // fresnel rim (frosted-glass edge) and soft beam; additive, op is a uniform
  const rimMat = (c, op) => new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color(c) }, op: { value: op } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 col; uniform float op; varying vec3 vN; varying vec3 vV; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(col * op * f * f, 1.0); }" });
  const beamMat = (c) => new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color(c) }, op: { value: 0 } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); vY = uv.y; gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 col; uniform float op; varying vec3 vN; varying vec3 vV; varying float vY; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(col * op * f * f * f * smoothstep(0.0, 0.3, vY), 1.0); }" });
  // tube rebuilt every frame from fn(u) -> V3; rad may be a function (live radius)
  function tube(fn, segs, rad, mat, closed) {
    const curve = new THREE.Curve(); curve.getPoint = (u, out) => (out || new V3()).copy(fn(u));
    const R = typeof rad === "function" ? rad : () => rad;
    const m = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    m.userData.update = () => { if (!m.visible) return; m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(curve, segs, R(), 10, !!closed); };
    m.userData.update(); return m;
  }
  const staticTube = (a, b, r, mat) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, r, 10), mat);
  // luminous strand: warm-white core + two very soft halos. g.userData.fade(k) sets its brightness 0..1
  function strand(fn, segs, r, closed, color) {
    const g = new THREE.Group(), core = M.light(color || P.string, 1), h1 = softHalo(color || 0xffe6c4, 0.22);
    const parts = [tube(fn, segs, r, core, closed), tube(fn, segs, r * 4, h1, closed)];
    g.add(...parts);
    g.userData.fade = (k) => { core.opacity = k; h1.uniforms.op.value = 0.22 * k; parts.forEach((p) => (p.visible = k > 0.002)); };
    return g;
  }
  // closed loop in local XY. st.R radius, st.modes = [[n, amp(rel), phase, offset]]: standing waves (radial + out of plane)
  function loopFn(st) {
    const v = new V3();
    return (u) => {
      const a = u * TAU; let dr = 0, dz = 0;
      for (const m of st.modes) { if (!m[1]) continue; const s = m[0] * a + (m[3] || 0); dr += m[1] * Math.sin(s) * Math.cos(m[2]); dz += m[1] * 0.7 * Math.cos(s) * Math.sin(m[2]); }
      const r = st.R * (1 + dr); return v.set(r * Math.cos(a), r * Math.sin(a), st.R * dz);
    };
  }
  // open string along local x, length st.L, free ends (cos modes) like a string-theory open string
  function openFn(st) {
    const v = new V3();
    return (u) => {
      let dy = 0, dz = 0;
      for (const m of st.modes) { if (!m[1]) continue; const s = Math.cos(m[0] * Math.PI * u); dy += m[1] * s * Math.cos(m[2]); dz += m[1] * 0.5 * s * Math.sin(m[2]); }
      return v.set((u - 0.5) * st.L, dy, dz);
    };
  }
  let _dot = null;
  const DOT = () => _dot || (_dot = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  function limb(a, b, r, mat) { const d = new V3().subVectors(b, a), L = d.length(); const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, L), 6, 18), mat); m.position.addVectors(a, b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(UP, d.normalize()); return m; }
  const pin = (text, v, op, dy) => [text, v.x, v.y + (dy || 0), v.z, op];

  // standard model in table layout: [col, row, mass MeV, type]  (type 0 quark, 1 lepton, 2 gauge boson, 3 Higgs)
  const SM17 = [[0, 0, 2.2, 0], [0, 1, 4.7, 0], [0, 2, 0.511, 1], [0, 3, 1e-6, 1], [1, 0, 1270, 0], [1, 1, 95, 0], [1, 2, 105.7, 1], [1, 3, 1e-6, 1],
    [2, 0, 172700, 0], [2, 1, 4180, 0], [2, 2, 1777, 1], [2, 3, 1e-6, 1], [3, 0, 0, 2], [3, 1, 0, 2], [3, 2, 91188, 2], [3, 3, 80379, 2], [4.2, 1.5, 125100, 3]];
  const SMC = [0x9a6b5f, 0x6d8a78, 0x5f7796, 0xb09868];
  const I_UP = 0, I_E = 2, I_PHOTON = 13, I_TOP = 8;

  // ================================================================ atomzoom
  LABK.atomzoom = (o) => {
    const full = o.mode === "full", T0 = o.T0, EL = 14;
    const azAt = (ft) => 28 + 1.0 * (ft - 178.28);
    const S = stage("void", { dust: 600, seed: 21 }), C = cam(30);
    // electron cloud: 1s-like haze + two p lobes, seeded points
    const r = rnd(41), pos = [];
    for (let i = 0; i < 9000; i++) {
      let d;
      for (;;) { const u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u); d = new V3(s * Math.cos(th), u, s * Math.sin(th)); if (i % 3 || r() < d.y * d.y) break; }
      const rad = i % 3 ? 1.15 - Math.log(1 - r() * 0.985) * 1.6 : 2.8 + (r() + r() + r() - 1.5) * 1.5;
      pos.push(d.x * rad, d.y * rad, d.z * rad);
    }
    const cg = new THREE.BufferGeometry(); cg.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    const cMat = new THREE.PointsMaterial({ map: DOT(), color: P.electron, size: 0.17, transparent: true, opacity: 0.32, depthWrite: false, blending: THREE.AdditiveBlending });
    S.add(new THREE.Points(cg, cMat));
    const haze = glowSprite(P.electron, 17, 0.16); S.add(haze);
    // nucleus: 6 protons + 6 neutrons, the dive proton p1 sits on the camera side
    const dDive = dirOf(azAt(183.4), EL), p1 = dDive.clone().multiplyScalar(0.3);
    const nuc = [p1], rr = rnd(7); let guard = 0;
    while (nuc.length < 12 && guard++ < 20000) { const c = new V3(rr() * 2 - 1, rr() * 2 - 1, rr() * 2 - 1).multiplyScalar(0.34); if (c.length() <= 0.34 && nuc.every((n) => n.distanceTo(c) > 0.25)) nuc.push(c); }
    const pMat = satin(P.proton), nMat = satin(P.neutron), p1Mat = satin(P.proton); p1Mat.transparent = true; pMat.transparent = nMat.transparent = true;
    const nucM = nuc.map((c, i) => { const m = ball(i === 0 ? p1Mat : i % 2 ? nMat : pMat, 0.16); m.position.copy(c); S.add(m); return m; });
    // three quarks inside p1, q1 faces the camera
    const dQ = dirOf(azAt(185.2), EL), e1 = new V3().crossVectors(dQ, UP).normalize(), e2 = new V3().crossVectors(e1, dQ).normalize();
    const eq = e1.clone().multiplyScalar(0.8).addScaledVector(e2, 0.6).normalize();
    const qCol = [P.quarkR, P.quarkG, P.quarkB];
    const qPos = [0, 1, 2].map((i) => p1.clone().addScaledVector(dQ, 0.075 * Math.cos(i * TAU / 3)).addScaledVector(eq, 0.075 * Math.sin(i * TAU / 3)));
    const qMat = qCol.map((c) => satin(c)); qMat[0].transparent = true;
    const qM = qPos.map((p, i) => { const m = ball(qMat[i], 0.028); m.position.copy(p); S.add(m); return m; });
    const q1 = qPos[0];
    // the string inside the quark
    const lst = { R: 0.0125, modes: [[2, 0, 0, 0], [3, 0, 0, 1.1]] };
    const loop = strand(loopFn(lst), 160, 0.0005, true);
    loop.position.copy(q1); loop.quaternion.setFromUnitVectors(new V3(0, 0, 1), dQ); loop.rotateX(0.45); S.add(loop);
    const qGlow = glowSprite(0xffe9c8, 0.05, 0); qGlow.position.copy(q1); S.add(qGlow);
    const LD = [[178.28, Math.log(25)], [180.96, Math.log(20)], [182.3, Math.log(2.4)], [183.5, Math.log(0.7)], [184.6, Math.log(0.2)], [186.5, Math.log(0.125)], [190.9, Math.log(0.11)]];
    const tgt = new V3(), tmp = new V3();
    return (t, d) => {
      const ft = T0 + t; let dist, az, el = EL, ld;
      // tiny life in the nucleus (not p1: the dive target must hold still)
      for (let i = 1; i < nucM.length; i++) nucM[i].position.set(nuc[i].x + 0.006 * Math.sin(ft * 1.3 + i), nuc[i].y + 0.006 * Math.sin(ft * 1.1 + i * 2.1), nuc[i].z + 0.006 * Math.cos(ft * 1.2 + i));
      if (full) {
        ld = cr(LD, ft); dist = Math.exp(ld); az = azAt(ft);
        const w1 = smooth((Math.log(2.6) - ld) / (Math.log(2.6) - Math.log(0.75))), w2 = smooth((Math.log(0.6) - ld) / (Math.log(0.6) - Math.log(0.2)));
        tgt.copy(p1).multiplyScalar(w1).lerp(q1, w2);
      } else { dist = lerp(4.9, 3.7, smooth(t / d)); ld = Math.log(dist); az = 205 + 2.4 * t; el = 17 - t * 0.8; tgt.set(0, 0, 0); }
      const ck = smooth((ld - Math.log(1.2)) / (Math.log(8) - Math.log(1.2)));
      cMat.opacity = (full ? 0.32 : 0.2) * ck; haze.material.opacity = 0.16 * ck;
      const nf = smooth((ld - Math.log(0.4)) / (Math.log(1.0) - Math.log(0.4)));
      pMat.opacity = nMat.opacity = nf; pMat.depthWrite = nMat.depthWrite = nf > 0.98; for (let i = 1; i < nucM.length; i++) nucM[i].visible = nf > 0.01;
      const pf = smooth((ld - Math.log(0.3)) / (Math.log(0.75) - Math.log(0.3)));
      p1Mat.opacity = lerp(0.1, 1, pf); p1Mat.depthWrite = pf > 0.98;
      const qf = 1 - seg(ft, 185.0, 185.95);
      qMat[0].opacity = qf; qMat[0].emissive.setHex(0xf0b090); qMat[0].emissiveIntensity = 0.55 * seg(ft, 184.7, 185.5); qM[0].scale.setScalar(0.028 * (0.5 + 0.5 * qf)); qM[0].visible = qf > 0.01;
      qGlow.material.opacity = 0.5 * win(ft, 184.9, 187.2, 0.9);
      loop.userData.fade(seg(ft, 185.3, 186.6));
      const vib = seg(ft, 188.36, 189.4);
      lst.modes[0][1] = 0.035 + 0.11 * vib; lst.modes[0][2] = 0.8 * ft + 7.5 * iseg(ft, 188.36, 189.4);
      lst.modes[1][1] = 0.075 * vib; lst.modes[1][2] = 1.0 * ft + 9.5 * iseg(ft, 188.36, 189.4);
      aim(C, tgt, dist, az, el, full ? 0 : -60, 0);
      const pins = [];
      if (full) {
        pins.push(pin("atom", tmp.set(2.6, 3.4, 1.2), win(ft, 178.6, 180.9)));
        pins.push(pin("nucleus", tmp.set(0, 0.42, 0), win(ft, 181.9, 183.1, 0.3)));
        pins.push(pin("proton", tmp.copy(p1).addScaledVector(UP, 0.16), win(ft, 183.2, 184.4, 0.3)));
        pins.push(pin("quark", tmp.copy(q1).addScaledVector(UP, 0.03), win(ft, 184.45, 185.5, 0.3)));
        pins.push(pin("string", tmp.copy(q1).addScaledVector(UP, 0.016), win(ft, 186.3, 191.5)));
      }
      return [S, C, pins];
    };
  };

  // ================================================================ fluxtube
  LABK.fluxtube = (o) => {
    const mode = o.mode, T0 = o.T0;
    const S = stage("void", { dust: 500, seed: 33 }), C = cam(30);
    const bagMat = new THREE.MeshPhysicalMaterial({ color: 0xc79b88, roughness: 0.22, metalness: 0, transparent: true, opacity: 0.14, depthWrite: false, clearcoat: 1, clearcoatRoughness: 0.15 });
    const bag = ball(bagMat, 2.3); S.add(bag);
    const a0 = mode === "string" ? TAU / 3 : Math.PI / 2;      // in "string" quark 2 points right (+x)
    const base = [0, 1, 2].map((i) => { const a = a0 + i * TAU / 3; return new V3(Math.cos(a) * 1.15, Math.sin(a) * 1.15, 0); });
    const qM = [P.quarkR, P.quarkG, P.quarkB].map((c, i) => { const m = ball(satin(c), 0.34); S.add(m); return m; });
    const qp = base.map((p) => p.clone()), junction = new V3();
    const tst = [0, 1, 2].map(() => ({ A: 0.03, n: 1, ph: 0, nrm: new V3() }));
    const ZZ = new V3(0, 0, 1);
    if (mode !== "quarks") for (let i = 0; i < 3; i++) {
      const st = tst[i], v = new V3();
      const fn = (u) => { v.lerpVectors(junction, qp[i], u); const s = st.A * Math.sin(st.n * Math.PI * u); return v.addScaledVector(st.nrm, s * Math.cos(st.ph)).addScaledVector(ZZ, 0.6 * s * Math.sin(st.ph)); };
      S.add(strand(fn, mode === "string" ? 160 : 48, 0.055, false, 0xf2d6a8));
    }
    // gluon beads (rival picture)
    const beads = [];
    if (mode === "quarks") for (let k = 0; k < 7; k++) {
      const g = new THREE.Group(), m = ball(M.light(0xeedcbc, 1), 0.055), s = glowSprite(0xffe2bc, 0.5, 0.25);
      g.add(m, s); S.add(g); beads.push({ g, m, s });
    }
    const hash = (a, b) => { let h = (a * 374761393 + b * 668265263) >>> 0; h = ((h ^ (h >>> 13)) * 1274126177) >>> 0; return (h ^ (h >>> 16)) >>> 0; };
    const tgt = new V3(), tmp = new V3(), mid = new V3();
    return (t, d) => {
      const ft = T0 + t;
      for (let i = 0; i < 3; i++) qp[i].set(base[i].x + 0.035 * Math.sin(ft * 1.4 + i * 2), base[i].y + 0.035 * Math.cos(ft * 1.1 + i), 0.04 * Math.sin(ft * 0.9 + i * 1.7));
      junction.set(0, 0, 0);
      let dist = lerp(9.4, 7.6, smooth(t / Math.max(d, 6))), az = 15 + 3.2 * t, el = 14 + 3 * Math.sin(t * 0.3), ox = -150, oy = 30;
      tgt.set(0, 0, 0);
      for (let i = 0; i < 3; i++) { const st = tst[i]; st.A = 0.035; st.n = 1; st.ph = 3.5 * ft + i * 2; st.nrm.set(-qp[i].y, qp[i].x, 0).normalize(); }
      if (mode === "string") {
        const k = seg(t, 0.1, 1.9);
        qp[2].copy(base[2]).multiplyScalar(1 + 4.4 * k);
        junction.copy(base[2]).multiplyScalar(-0.12 * k);
        const st = tst[2]; st.nrm.set(-qp[2].y, qp[2].x, 0).normalize();
        st.A = 0.035 + 0.3 * seg(t, 1.4, 2.3); st.n = 3; st.ph = 3.5 * ft + 11 * iseg(t, 1.4, 2.3);
        bagMat.opacity = lerp(0.14, 0.04, k);
        mid.lerpVectors(junction, qp[2], 0.5);
        tgt.lerpVectors(new V3(), mid, k); dist = lerp(9.2, 12.5, k); az = lerp(10, 2, k) + 1.5 * t; el = 12; ox = 0; oy = 120;
      }
      if (mode === "quarks") {
        beads.forEach((b, k) => {
          const T = 0.85 + 0.13 * k, x = (t + k * 0.37) / T, c = Math.floor(x), u = x - c, h = hash(c + 11, k + 3);
          const a = h % 3, bb = (a + 1 + ((h >>> 3) & 1)) % 3;
          const A = qp[a], B = qp[bb], ue = smooth(u);
          b.g.position.lerpVectors(A, B, ue);
          b.g.position.z += 0.45 * Math.sin(Math.PI * ue) * ((h >>> 5) & 1 ? 1 : -1);
          b.g.position.addScaledVector(tmp.set(-(A.y + B.y), A.x + B.x, 0).normalize(), -0.25 * Math.sin(Math.PI * ue));
          const f = smooth(u / 0.18) * smooth((1 - u) / 0.18);
          b.m.material.opacity = f; b.s.material.opacity = 0.25 * f; b.m.scale.setScalar(0.055 * (0.4 + 0.6 * f));
        });
      }
      qM.forEach((m, i) => m.position.copy(qp[i]));
      aim(C, tgt, dist, az, el, ox, oy);
      const pins = [], top = qp[mode === "string" ? 0 : 0];
      if (mode === "glue") {
        const s1 = Math.min(1.0, d * 0.15), s2 = Math.min(2.4, d * 0.35);
        pins.push(pin("quarks", tmp.copy(top), win(t, s1, d + 1), 0.36));
        pins.push(pin("the glue", tmp.lerpVectors(junction, qp[2], 0.55), win(t, s2, d + 1), 0.06));
      }
      if (mode === "quarks") pins.push(pin("quarks and gluons", tmp.copy(top), win(t, 0.8, d + 1), 0.36));
      return [S, C, pins];
    };
  };

  // ================================================================ particles17
  LABK.particles17 = (o) => {
    const T0 = o.T0, partners = o.mode === "partners", sp = 1.1;
    const S = stage("void", { dust: 600, seed: 51 }), C = cam(30);
    const dots = SM17.map(([c, r, m, ty]) => {
      const base = new V3((c - 2) * sp, 0, (r - 1.5) * sp), mat = satin(SMC[ty], 0.32); mat.transparent = true;
      const mesh = ball(mat, 0.14); S.add(mesh);
      const h = m <= 0 ? 0 : Math.max(0.05, 0.28 * (Math.log10(m) + 1.3));
      return { base, mat, mesh, h, ty };
    });
    const barGeo = new THREE.CylinderGeometry(0.026, 0.026, 1, 12).translate(0, 0.5, 0), barMat = M.paint(0xd6cfbf, 0.45);
    const footGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.012, 32), footMat = M.steel(); footMat.transparent = true;
    if (!partners) dots.forEach((dt) => { dt.bar = new THREE.Mesh(barGeo, barMat); dt.foot = new THREE.Mesh(footGeo, footMat); dt.bar.position.copy(dt.base); dt.foot.position.copy(dt.base); S.add(dt.bar, dt.foot); });
    let spot, cone, spotT;
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xdfe6ee, roughness: 0.32, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.25, transparent: true, opacity: 0, depthWrite: false });
    const ringPts = []; for (let i = 0; i < 72; i++) ringPts.push(new V3(Math.cos(i / 72 * TAU) * 0.3, Math.sin(i / 72 * TAU) * 0.3, 0));
    const ringGeo = new THREE.BufferGeometry().setFromPoints(ringPts), dashMat = new THREE.LineDashedMaterial({ color: 0xd9dee6, dashSize: 0.07, gapSize: 0.05, transparent: true, opacity: 0, depthWrite: false });
    const POFF = new V3(0.47, 0.2, 0.0);
    if (partners) {
      dots.forEach((dt) => {
        const gm = glass.clone(); gm.color.set(SMC[dt.ty]).lerp(new THREE.Color(0xffffff), 0.55); dt.gm = gm; dt.rim = rimMat(new THREE.Color(SMC[dt.ty]).lerp(new THREE.Color(0xffffff), 0.6), 0);
        dt.pm = ball(gm, 0.3); dt.pm.add(new THREE.Mesh(SPH, dt.rim)); dt.pm.position.copy(dt.base).add(POFF); S.add(dt.pm);
        dt.ring = new THREE.LineLoop(ringGeo, dashMat); dt.ring.computeLineDistances(); dt.ring.position.copy(dt.pm.position); S.add(dt.ring);
      });
      spot = new THREE.SpotLight(0xfff1dc, 7, 0, 0.17, 0.75, 0); spotT = new THREE.Object3D(); spot.target = spotT; S.add(spot, spotT);
      const cg = new THREE.ConeGeometry(1.6, 11, 48, 1, true).translate(0, -5.5, 0);
      cone = new THREE.Mesh(cg, beamMat(0xfff1dc));
      S.add(cone);
    }
    const center = new V3(0.15, 0, 0), tgt = new V3(), tmp = new V3(), dirv = new V3();
    return (t, d) => {
      const ft = T0 + t;
      let dist, az, el, ox = -130, oy = 40;
      if (!partners) {
        const b = seg(ft, 173.04, 176.2), push = seg(ft, 166.44, 168.7) * (1 - seg(ft, 171.48, 173.4));
        dots.forEach((dt, i) => {
          const a = seg(ft, 156.2 + i * 0.2, 156.75 + i * 0.2), g = seg(ft, 173.1 + i * 0.07, 175.3 + i * 0.07);
          dt.mat.opacity = a; dt.mesh.visible = a > 0.002; dt.mesh.scale.setScalar(0.14 * (0.7 + 0.3 * a));
          const y = dt.h * g; dt.mesh.position.set(dt.base.x, dt.base.y + y, dt.base.z);
          dt.bar.scale.y = Math.max(1e-4, y); dt.bar.visible = y > 0.002; footMat.opacity = b; dt.foot.visible = b > 0.01;
        });
        tgt.copy(center).lerp(dots[I_E].mesh.position, push); tgt.y += 0.55 * b;
        dist = lerp(9.6, 1.5, push) + 1.4 * b; az = -10 + 0.45 * t + 18 * b; el = lerp(lerp(52, 38, push), 31, b);
        aim(C, tgt, dist, az, el, ox, oy);
        const up = (i) => tmp.copy(dots[i].mesh.position).add(new V3(0, 0.14, 0));
        return [S, C, [pin("electron", up(I_E), win(ft, 161.9, 164.4)), pin("quark", up(I_UP), win(ft, 162.7, 165.3)),
          pin("photon", up(I_PHOTON), win(ft, 165.5, 167.1)), pin("a point · no size", up(I_E), win(ft, 168.3, 171.3))]];
      }
      // partners
      const fo = seg(ft, 646.1, 646.9);
      dots.forEach((dt, i) => {
        const a = seg(t, 0.05 * i, 0.7 + 0.05 * i); dt.mat.opacity = a; dt.mesh.position.copy(dt.base); dt.mesh.scale.setScalar(0.14 * (0.7 + 0.3 * a));
        const p = seg(ft, 636.3 + i * 0.07, 637.0 + i * 0.07); dt.pm.scale.setScalar(0.3 * (0.6 + 0.4 * p)); dt.pm.visible = p > 0.002 && fo < 0.999;
        dt.pm.position.copy(dt.base).add(POFF); dt.pm.position.y += 0.03 * Math.sin(ft * 0.8 + i);
        dt.ring.position.copy(dt.pm.position); dt.ring.visible = fo > 0.002;
      });
      dots.forEach((dt) => { dt.gm.opacity = 0.2 * (1 - fo); dt.rim.uniforms.op.value = 0.75 * (1 - fo); }); dashMat.opacity = 0.8 * fo;
      dist = 10.6; az = -22 + 1.5 * t; el = 40; tgt.copy(center); tgt.y += 0.15;
      aim(C, tgt, dist, az, el, ox, oy);
      dots.forEach((dt) => dt.ring.quaternion.copy(C.quaternion));
      const sw = seg(ft, 641.9, 645.6), sv = win(ft, 641.7, 645.9, 0.5);
      spotT.position.set(lerp(-3.4, 3.4, sw), 0.2, lerp(-1.6, 1.4, sw) * 0.4);
      spot.position.set(spotT.position.x * 0.4 - 0.5, 8, 2); spot.intensity = 7 * sv;
      cone.position.copy(spot.position); dirv.subVectors(spotT.position, spot.position).normalize(); cone.quaternion.setFromUnitVectors(new V3(0, -1, 0), dirv);
      cone.material.uniforms.op.value = 0.2 * sv; cone.visible = sv > 0.002;
      const pp = dots[I_TOP].pm.position;
      return [S, C, [pin("heavier partner", tmp.copy(pp).add(new V3(0, 0.3, 0)), win(ft, 637.8, 641.5)), pin("not found", tmp.copy(pp).add(new V3(0, 0.3, 0)), win(ft, 646.4, 649))]];
    };
  };

  // ================================================================ notes
  LABK.notes = (o) => {
    const mode = o.mode, T0 = o.T0;
    const S = stage("void", { dust: 650, seed: 61 }), C = cam(30);
    const tgt = new V3(), tmp = new V3();
    if (mode === "one" || mode === "ghost") {
      const st = { L: 4.6, modes: [[1, 0, 0], [2, 0, 0], [3, 0, 0]] };
      const sg = new THREE.Group(), s = strand(openFn(st), 160, 0.03, false); sg.add(s); S.add(sg);
      const ends = [glowSprite(0xffe9c8, 0.35, 0.3), glowSprite(0xffe9c8, 0.35, 0.3)]; sg.add(...ends);
      let gst, gl, gg;
      if (mode === "ghost") { gst = { R: 0.01, modes: [[2, 0.08, 0, 0], [3, 0.04, 0, 1]] }; gg = new THREE.Group(); gl = strand(loopFn(gst), 96, 0.022, true); gg.add(gl); S.add(gg); }
      const LP0 = new V3(0, 0.05, 0), LP1 = new V3(2.7, 1.45, -1.3);
      return (t, d) => {
        const ft = T0 + t;
        st.modes[0][1] = 0.17; st.modes[0][2] = 2.1 * ft; st.modes[1][1] = 0.12; st.modes[1][2] = 3.3 * ft + 1; st.modes[2][1] = 0.05; st.modes[2][2] = 4.7 * ft + 2;
        sg.rotation.y = 0.22 * Math.sin(0.3 * ft); sg.rotation.z = 0.06 * Math.sin(0.23 * ft);
        const f0 = openFn(st); ends[0].position.copy(f0(0)); ends[1].position.copy(f0(1));
        if (mode === "one") {
          s.userData.fade(1);
          aim(C, tgt.set(0, 0, 0), lerp(8.6, 7.6, t / d), 22 + 3 * t, 9 + 0.5 * t, -90, 90);
          return [S, C, []];
        }
        // ghost: a small closed loop pinches off the middle and drifts away alone
        const sf = 1 - seg(ft, 279.3, 281.2);
        s.userData.fade(sf); ends.forEach((e) => (e.material.opacity = 0.3 * sf));
        const g = seg(ft, 276.5, 277.4), mv = seg(ft, 276.7, 281.0);
        gst.R = Math.max(0.005, 0.34 * g); gst.modes[0][2] = 4.6 * ft; gst.modes[1][2] = 5.9 * ft;
        gl.userData.fade(seg(ft, 276.45, 276.9));
        gg.position.lerpVectors(LP0, LP1, mv); gg.position.y += 0.06 * Math.sin(ft * 0.9);
        gg.rotation.set(0.5 + 0.2 * Math.sin(ft * 0.5), 1.1 * Math.max(0, ft - 276.5), 0);
        const fl = seg(ft, 277.4, 281.0);
        tgt.lerpVectors(new V3(0, 0, 0), LP1, fl);
        aim(C, tgt, lerp(9.0, 5.2, fl), 14 + 1.6 * t, 8, lerp(-60, -40, fl), 60);
        tmp.copy(gg.position); tmp.y += 0.38;
        return [S, C, [pin("mass: zero", tmp, win(ft, 277.8, 280.9)), pin("?", tmp, win(ft, 281.4, 290))]];
      };
    }
    if (mode === "particles") {
      const sp = 3.2, loops = SM17.map(([c, r], i) => {
        const st = { R: 1.1, modes: [] }, g = strand(loopFn(st), 140, 0.028, true);
        g.position.set((c - 2) * sp, (1.5 - r) * sp, 0); S.add(g);
        const n = 2 + (i * 5) % 6; st.modes.push([n, 0.07 + 0.03 * (i % 3), 0, i], [n + 1, 0.035, 0, i * 2]);
        return { st, g, n, w: 2.2 + 0.4 * n, i };
      });
      const main = loops[I_PHOTON], ms = main.st;
      ms.modes = [[2, 0, 0, 0], [3, 0, 0, 0.6], [5, 0, 0, 1.2]];
      const gridC = new V3(0.5, 0, 0);
      return (t, d) => {
        const ft = T0 + t;
        const idle = 1 - seg(ft, 204.4, 205.2), wA = seg(ft, 204.4, 205.2) * (1 - seg(ft, 208.1, 208.8)), wB = seg(ft, 208.1, 208.8) * (1 - seg(ft, 212.2, 212.9)), wC = seg(ft, 212.2, 212.9);
        ms.modes[0][1] = 0.03 * idle + 0.16 * wA; ms.modes[0][2] = 3.0 * ft;
        ms.modes[1][1] = 0.12 * wB; ms.modes[1][2] = 4.0 * ft;
        ms.modes[2][1] = 0.075 * wC; ms.modes[2][2] = 5.3 * ft;
        main.g.userData.fade(1);
        main.g.rotation.set(0.12 * Math.sin(ft * 0.4), 0.25 * Math.sin(ft * 0.27), 0);
        loops.forEach((L) => {
          if (L === main) return;
          const a = seg(ft, 214.6 + L.i * 0.09, 215.4 + L.i * 0.09); L.g.userData.fade(a);
          L.st.modes[0][2] = L.w * ft; L.st.modes[1][2] = (L.w + 0.9) * ft + 1;
          L.g.rotation.set(0.15 * Math.sin(ft * 0.3 + L.i), 0.3 * Math.sin(ft * 0.21 + L.i * 1.3), 0);
        });
        const pb = seg(ft, 214.26, 217.4);
        tgt.lerpVectors(main.g.position, gridC, pb);
        aim(C, tgt, lerp(6.8, 32, pb), lerp(-14 + 1.5 * (ft - 202.3), 4 + 0.3 * (ft - 214), pb), lerp(6, 3, pb), lerp(0, -200, pb), lerp(0, 85, pb));
        tmp.copy(main.g.position); tmp.y += 1.3;
        return [S, C, [pin("electron", tmp, win(ft, 204.9, 208.2)), pin("quark", tmp, win(ft, 208.6, 212.3)), pin("photon", tmp, win(ft, 212.7, 214.6))]];
      };
    }
    // energy: one loop; the harder it vibrates, the heavier the sphere beside it
    const st = { R: 1.0, modes: [[2, 0, 0, 0], [4, 0, 0, 0.7], [6, 0, 0, 1.9]] };
    const lg = strand(loopFn(st), 180, 0.026, true); lg.position.set(-1.5, 0.3, 0); S.add(lg);
    const sm = ball(satin(0x8e8a86, 0.36), 1); sm.position.set(2.1, 0.3, 0); S.add(sm);
    return (t, d) => {
      const ft = T0 + t;
      const e = 0.12 + 0.5 * seg(ft, 219.5, 222.7) + 0.38 * seg(ft, 226.6, 228.8);
      const ie = 0.12 * t + 0.5 * iseg(ft, 219.5, 222.7) + 0.38 * iseg(ft, 226.6, 228.8);
      st.modes[0][1] = 0.04 + 0.1 * e; st.modes[0][2] = 2.6 * t + 10 * ie;
      st.modes[1][1] = 0.07 * smooth(e * 1.3 - 0.2); st.modes[1][2] = 3.4 * t + 13 * ie;
      st.modes[2][1] = 0.05 * smooth((e - 0.55) * 2.5); st.modes[2][2] = 4.2 * t + 17 * ie;
      lg.userData.fade(1); lg.rotation.set(0.15 * Math.sin(ft * 0.35), 0.35 * Math.sin(ft * 0.22), 0);
      const r = 0.2 + 0.62 * e; sm.scale.setScalar(r); sm.rotation.y = ft * 0.2;
      aim(C, tgt.set(0.3, 0.3, 0), 9.2, -10 + 1.4 * t, 6, -40, 120);
      return [S, C, [pin("energy", tmp.set(-1.5, 0.3 + 1.2, 0), win(ft, 220.4, 223.3)), pin("mass", tmp.set(2.1, 0.3 + r, 0), win(ft, 223.4, 231))]];
    };
  };

  // ================================================================ guitar
  LABK.guitar = (o) => {
    const T0 = o.T0, S = stage("studio", { floorY: -1.08, key: 2.3 }), C = cam(30);
    const XN = -6.5, XS = 5.5, LEN = XS - XN, fretX = (n) => XN + LEN * (1 - Math.pow(2, -n / 12));
    const FB1 = 1.45, FBT = 0.14, FBW = 1.04, yN = 0.235, yS = 0.27, sy = (x) => lerp(yN, yS, (x - XN) / LEN);
    const zN = (i) => (i - 2.5) * 0.135, zS = (i) => (i - 2.5) * 0.2;
    const rose = canvasTex(2048, 256, (g, w, h) => {
      g.fillStyle = "#3a2318"; g.fillRect(0, 0, w, h); const r = rnd(9);
      for (let i = 0; i < 280; i++) { const y = r() * h, a = r() * 3; g.strokeStyle = (r() < 0.55 ? "rgba(18,9,5," : "rgba(96,56,34,") + (0.12 + r() * 0.35) + ")"; g.lineWidth = 0.6 + r() * 2.6; g.beginPath(); for (let x = 0; x <= w; x += 32) g.lineTo(x, y + Math.sin(x * 0.003 + i) * a); g.stroke(); }
      g.fillStyle = "#e9e3d6";
      const dot = (x, y) => { g.beginPath(); g.arc(x, y, 15, 0, TAU); g.fill(); };
      for (const n of [3, 5, 7, 9, 12, 15]) { const px = ((fretX(n - 1) + fretX(n)) / 2 - XN) / (FB1 - XN) * w; if (n === 12) { dot(px, h * 0.3); dot(px, h * 0.7); } else dot(px, h / 2); }
    });
    const spruce = canvasTex(1024, 1024, (g, w, h) => {
      g.fillStyle = "#a97c4a"; g.fillRect(0, 0, w, h); const r = rnd(12);
      for (let i = 0; i < 420; i++) { const y = r() * h; g.strokeStyle = "rgba(110,74,38," + (0.08 + r() * 0.22) + ")"; g.lineWidth = 0.6 + r() * 1.8; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (r() - 0.5) * 6); g.stroke(); }
    });
    spruce.wrapS = spruce.wrapT = THREE.RepeatWrapping; spruce.repeat.set(0.1, 0.17);
    const roseMat = new THREE.MeshStandardMaterial({ map: rose, roughness: 0.55, metalness: 0 }), darkWood = M.paint(0x2c1a12, 0.45);
    const fb = new THREE.Mesh(new THREE.BoxGeometry(FB1 - XN, FBT, FBW), [darkWood, darkWood, roseMat, darkWood, darkWood, darkWood]);
    fb.position.set((XN + FB1) / 2, FBT / 2, 0); fb.castShadow = fb.receiveShadow = true; S.add(fb);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.6 - XN, 40, 1, false, Math.PI / 2, Math.PI).rotateZ(-Math.PI / 2).rotateX(-Math.PI / 2).scale(1, 1.1, 0.98), M.paint(0x5e3420, 0.45)); neck.position.set((XN + 0.6) / 2, 0.001, 0); neck.castShadow = true; S.add(neck);
    const head = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 1.25), darkWood); head.position.set(XN - 1.05, 0.02, 0); head.castShadow = true; S.add(head);
    const steel = M.steel(), bronze = new THREE.MeshStandardMaterial({ color: 0xb48a5c, metalness: 1, roughness: 0.3 });
    const fretGeo = new THREE.CylinderGeometry(0.022, 0.022, FBW, 12).rotateX(Math.PI / 2);
    for (let n = 1; fretX(n) < FB1 - 0.05; n++) { const f = new THREE.Mesh(fretGeo, steel); f.position.set(fretX(n), FBT, 0); S.add(f); }
    const bone = M.paint(0xe8dfc8, 0.4);
    const nut = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.1, FBW), bone); nut.position.set(XN, FBT + 0.045, 0); S.add(nut);
    // body: spline outline, extruded, spruce top
    const prof = [[0.55, 0.9], [1.2, 1.7], [2.4, 2.02], [3.6, 1.78], [4.5, 1.62], [5.5, 2.1], [7.0, 2.6], [8.6, 2.42], [9.7, 1.65], [10.15, 0.7]];
    const sh = new THREE.Shape(); sh.moveTo(0.45, 0);
    sh.splineThru([...prof.map(([x, w]) => new THREE.Vector2(x, w)), new THREE.Vector2(10.28, 0), ...prof.slice().reverse().map(([x, w]) => new THREE.Vector2(x, -w)), new THREE.Vector2(0.45, 0)]);
    const bodyGeo = new THREE.ExtrudeGeometry(sh, { depth: 1.0, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 80 });
    const body = new THREE.Mesh(bodyGeo, [new THREE.MeshStandardMaterial({ map: spruce, roughness: 0.42, metalness: 0 }), M.paint(0x3b2216, 0.35)]);
    body.rotation.x = -Math.PI / 2; body.position.y = -1.04; body.castShadow = body.receiveShadow = true; S.add(body);
    const hole = new THREE.Mesh(new THREE.CircleGeometry(0.82, 64), M.matte(0x0c0907)); hole.rotation.x = -Math.PI / 2; hole.position.set(2.4, 0.003, 0); S.add(hole);
    const ros = canvasTex(512, 512, (g) => { for (let i = 0; i < 18; i++) { g.beginPath(); g.arc(256, 256, 256 - i * 2.3, 0, TAU); g.lineWidth = 2.3; g.strokeStyle = i % 3 === 0 ? "#1c120c" : i % 3 === 1 ? "#d8c6a0" : "#6b4428"; g.stroke(); } });
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.87, 1.02, 64), new THREE.MeshStandardMaterial({ map: ros, roughness: 0.5 })); ring.rotation.x = -Math.PI / 2; ring.position.set(2.4, 0.004, 0); S.add(ring);
    const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 2.2), darkWood); bridge.position.set(XS + 0.2, 0.05, 0); bridge.castShadow = true; S.add(bridge);
    const saddle = new THREE.Mesh(new THREE.BoxGeometry(0.05, yS - 0.11, 1.25), bone); saddle.position.set(XS, 0.1 + (yS - 0.11) / 2, 0); S.add(saddle);
    const rad = [0.026, 0.022, 0.019, 0.016, 0.0125, 0.01];
    for (let i = 0; i < 6; i++) {
      const pb = ball(bone, 0.05); pb.position.set(XS + 0.33, 0.12, zS(i)); S.add(pb);
      const side = i < 3 ? -1 : 1, k = i < 3 ? 2 - i : i - 3, post = new V3(XN - 0.45 - 0.55 * k, 0.2, side * 0.4);
      const pm = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.22, 16), steel); pm.position.copy(post); S.add(pm);
      const mat = i < 4 ? bronze : steel;
      S.add(staticTube(new V3(XN, yN, zN(i)), post.clone().setY(0.25), rad[i], mat));
      if (i !== 4) { const s = staticTube(new V3(XN, yN, zN(i)), new V3(XS, yS, zS(i)), rad[i], mat); s.castShadow = true; S.add(s); }
    }
    // the plucked string (index 4, plain steel)
    const X5 = fretX(5), XP = X5 - 0.16, fs = { Ao: 0, Af: 0, po: 0, pf: 0, P: 0 }, sv = new V3(), r4 = rad[4];
    const disp = (u, x) => { const so = Math.sin(Math.PI * u), sf = Math.sin(Math.PI * clamp((x - X5) / (XS - X5), 0, 1)); return [fs.Ao * so, fs.Af * sf, so, sf]; };
    const sfn = (u) => {
      const x = lerp(XN, XS, u); let yP;
      if (x < XP) yP = lerp(yN, FBT + 0.035 + r4, (x - XN) / (XP - XN)); else if (x < X5) yP = FBT + 0.03 + r4; else yP = lerp(FBT + 0.024 + r4, yS, (x - X5) / (XS - X5));
      const [eo, ef] = disp(u, x);
      const y = lerp(sy(x), yP, fs.P) + 0.25 * (eo * Math.sin(fs.po) + ef * Math.sin(fs.pf));
      return sv.set(x, y, lerp(zN(4), zS(4), u) + eo * Math.cos(fs.po) + ef * Math.cos(fs.pf));
    };
    const pstr = tube(sfn, 260, r4, new THREE.MeshStandardMaterial({ color: 0xd4d7dc, metalness: 1, roughness: 0.2 }), false); pstr.castShadow = true; S.add(pstr);
    // blur envelope ribbon
    const NR = 160, rg = new THREE.PlaneGeometry(1, 1, NR, 1), rpos = rg.attributes.position;
    const ribMat = new THREE.MeshBasicMaterial({ color: 0xf3ead8, transparent: true, opacity: 0.3, depthWrite: false, side: THREE.DoubleSide });
    const rib = new THREE.Mesh(rg, ribMat); S.add(rib);
    // fretting hand reaching over from the bass side; index fingertip presses string 4 behind fret 5
    const skin = new THREE.MeshPhysicalMaterial({ color: 0xc08a6e, roughness: 0.6, metalness: 0, sheen: 0.4, sheenColor: new THREE.Color(0xf0c0a8) });
    const fg = new THREE.Group(), hv = (x, y, z) => new V3(x, y, z);
    const zT = lerp(zN(4), zS(4), (XP - XN) / LEN), yT = sy(XP) + r4 + 0.095;
    const chain = (pts, r0) => { for (let i = 0; i < pts.length - 1; i++) fg.add(limb(pts[i], pts[i + 1], r0 - i * 0.01, skin)); };
    chain([hv(-0.06, 0.92, -0.62), hv(-0.03, 0.98, -0.12), hv(-0.01, 0.64, 0.17), hv(0, yT, zT)], 0.115);
    chain([hv(0.36, 0.95, -0.66), hv(0.37, 1.05, -0.2), hv(0.38, 0.85, 0.05), hv(0.38, 0.6, 0.12)], 0.115);
    chain([hv(0.7, 0.92, -0.7), hv(0.72, 1.0, -0.28), hv(0.73, 0.82, -0.06), hv(0.73, 0.62, 0.0)], 0.11);
    chain([hv(1.0, 0.86, -0.72), hv(1.03, 0.92, -0.38), hv(1.04, 0.76, -0.2), hv(1.04, 0.6, -0.12)], 0.095);
    const palm = ball(skin, 1); palm.scale.set(0.66, 0.2, 0.5); palm.position.set(0.47, 0.98, -1.02); palm.rotation.x = 0.3; fg.add(palm);
    fg.add(limb(hv(0.5, 1.1, -1.35), hv(1.3, 2.5, -5.5), 0.27, skin));
    fg.add(limb(hv(0.95, 1.85, -3.0), hv(1.6, 3.0, -6.5), 0.36, M.matte(0x2b3140)));
    fg.traverse((m) => (m.castShadow = true)); S.add(fg);
    const tgt = new V3(), tmp = new V3();
    const K = { tx: [[190.9, 2.4], [192.6, 0.6], [194.2, -0.4], [196.6, -1.3], [199.3, -0.7], [201.8, -0.5]],
      tz: [[190.9, 0], [199.3, 0.1], [201.8, 1.1]],
      dist: [[190.9, 5.0], [192.6, 6.0], [194.2, 9.6], [196.6, 8.7], [199.3, 9.4], [201.8, 15.2]],
      az: [[190.9, 40], [192.6, 31], [194.2, 18], [199.3, 13], [201.8, 4]],
      el: [[190.9, 20], [192.6, 23], [194.2, 30], [199.3, 34], [201.8, 64]] };
    return (t, d) => {
      const ft = T0 + t;
      fs.Ao = 0.17 * seg(ft, 192.66, 192.82) * Math.exp(-Math.max(0, ft - 192.82) * 0.28) * (1 - seg(ft, 195.8, 196.4));
      fs.Af = 0.15 * seg(ft, 196.96, 197.12) * Math.exp(-Math.max(0, ft - 197.12) * 0.24);
      fs.po = TAU * 2.0 * (ft - 192.68); fs.pf = TAU * 2.67 * (ft - 196.98); fs.P = seg(ft, 195.75, 196.5);
      for (let i = 0; i <= NR; i++) {
        const u = i / NR, x = lerp(XN, XS, u), [eo, ef] = disp(u, x), e = eo + ef, z0 = lerp(zN(4), zS(4), u);
        let y = sy(x); if (fs.P > 0.5 && x > X5) y = lerp(FBT + 0.024 + r4, yS, (x - X5) / (XS - X5));
        rpos.setXYZ(i, x, y, z0 + e); rpos.setXYZ(i + NR + 1, x, y, z0 - e);
      }
      rpos.needsUpdate = true; rg.computeBoundingSphere(); rib.visible = fs.Ao + fs.Af > 0.004;
      const fd = seg(ft, 195.6, 196.5);
      fg.visible = ft > 194.6; fg.position.set(XP, lerp(2.4, 0, fd) - 0.025 * fs.P, -lerp(1.8, 0, fd));
      tgt.set(KF(K.tx, ft) + 0.04 * t, 0.25, KF(K.tz, ft));
      aim(C, tgt, KF(K.dist, ft), KF(K.az, ft), KF(K.el, ft), 0, ft > 199.3 ? 60 * seg(ft, 199.3, 201.8) : 0);
      return [S, C, [pin("one note", tmp.set(-0.5, sy(-0.5) + 0.05, lerp(zN(4), zS(4), 0.5)), win(ft, 193.0, 195.6)),
        pin("another note", tmp.set(1.0, sy(1.0) + 0.05, lerp(zN(4), zS(4), 0.625)), win(ft, 197.3, 199.6))]];
    };
  };

  // ================================================================ rubberband
  LABK.rubberband = (o) => {
    const T0 = o.T0, S = stage("studio", { floorY: 0, key: 2.4 }), C = cam(30);
    const floor = S.children.find((m) => m.isMesh && m.geometry.type === "PlaneGeometry"); floor.material.transparent = true;
    const st = { ft: 0 }, v = new V3();
    const shape = (u) => {
      const ft = st.ft, a = u * TAU, ca = Math.cos(a), sa = Math.sin(a);
      const X = seg(ft, 30.1, 31.8), K = seg(ft, 35.68, 37.1);
      const rr = 1 + 0.1 * Math.sin(2 * a + 0.6) + 0.05 * Math.sin(3 * a + 1.9);
      let x = lerp(rr * ca, 2.5 * ca, X), y = lerp(rr * sa, 0.42 * sa, X), z = 0;
      // plucked wiggle along the two long sides (ends held still)
      const W = 0.17 * seg(ft, 32.8, 32.98) * Math.exp(-Math.max(0, ft - 32.98) * 0.9) + 0.12 * seg(ft, 34.2, 34.38) * Math.exp(-Math.max(0, ft - 34.38) * 0.9) + 0.012 * X;
      const s = (ca + 1) / 2, env = Math.sin(Math.PI * s), side = sa >= 0 ? 0 : 0.9, ph = 12.5 * ft;
      y += W * X * (0.6 * env * Math.cos(ph + side) + 0.25 * Math.sin(2 * Math.PI * s) * Math.cos(1.7 * ph));
      z += W * X * env * Math.sin(ph + side);
      // luminous loop: a small circle with gentle standing waves
      const m = 0.025 * Math.sin(2 * a) * Math.cos(2.1 * ft) + 0.018 * Math.sin(3 * a + 1) * Math.cos(2.9 * ft);
      const fz = 2.1 * (0.03 * Math.cos(2 * a) * Math.sin(2.1 * ft) + 0.02 * Math.cos(3 * a + 1) * Math.sin(2.9 * ft));
      return v.set(lerp(x, 2.1 * (1 + m) * ca, K), lerp(y, 2.1 * (1 + m) * sa, K), lerp(z, fz, K));
    };
    const band = new THREE.Group(); S.add(band);
    const rubber = new THREE.MeshPhysicalMaterial({ color: 0xb98a5a, roughness: 0.6, metalness: 0, sheen: 0.35, sheenColor: new THREE.Color(0xe8c49a), clearcoat: 0.08, transparent: true });
    const rb = tube(shape, 240, () => lerp(0.055, 0.02, seg(st.ft, 35.68, 36.7)), rubber, true); rb.castShadow = true; band.add(rb);
    const lum = strand(shape, 240, 0.012, true); band.add(lum);
    const tgt = new V3();
    const K = { ty: [[21.58, 0.1], [29.6, 0.15], [31.4, 1.05], [35.6, 1.1], [37.4, 1.42]],
      dist: [[21.58, 7.2], [29.6, 5.9], [31.4, 7.4], [35.6, 7.2], [37.4, 7.4]],
      az: [[21.58, -26], [29.6, -8], [35.6, 4], [41.42, 10]],
      el: [[21.58, 38], [29.6, 30], [31.4, 16], [35.6, 14], [37.4, 5]],
      ox: [[21.58, -170], [29.6, -170], [31.4, 0]], oy: [[21.58, 0], [41.42, 0]] };
    return (t, d) => {
      const ft = T0 + t; st.ft = ft;
      const L = seg(ft, 29.78, 31.0), Kk = seg(ft, 35.68, 37.1);
      band.position.set(0, lerp(lerp(0.056, 1.1, L), 1.55, Kk) + 0.04 * Kk * Math.sin(ft * 0.7), 0);
      band.rotation.set(lerp(lerp(-Math.PI / 2, -0.42, L), -1.22, Kk), 0.06 * Kk * Math.sin(ft * 0.4), 0.25 * (1 - L));
      rubber.opacity = 1 - seg(ft, 35.95, 36.8); rb.visible = rubber.opacity > 0.002;
      lum.userData.fade(seg(ft, 35.9, 36.9));
      floor.material.opacity = 1 - seg(ft, 35.9, 37.5); floor.visible = floor.material.opacity > 0.002;
      aim(C, tgt.set(0, KF(K.ty, ft), 0), KF(K.dist, ft), KF(K.az, ft), KF(K.el, ft), KF(K.ox, ft), KF(K.oy, ft));
      return [S, C, []];
    };
  };
})();
