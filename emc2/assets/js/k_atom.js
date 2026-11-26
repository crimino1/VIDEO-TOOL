/* k_atom.js — group B kinds (E = mc² film): atom, lithium, fission, sun.
   LABK.name = (o) => (t, d) => [scene, camera, pins]; ft = o.T0 + t is film time. Pure functions of t.
   Shared props (balance, nucleon, nucleus) come from window.X3 (k_0shared.js); X3.mats are never mutated here. */
(function () {
  const { THREE, M, P, seg, smooth, lerp, clamp, rnd, orbit, cam, stage, canvasTex, glowSprite, tex, W, H, D2R } = L3;
  const V3 = THREE.Vector3, TAU = Math.PI * 2, UP = new V3(0, 1, 0);
  const SPH = new THREE.SphereGeometry(1, 48, 32);

  // ---------------------------------------------------------------- helpers
  const win = (t, a, b, f) => { f = f || 0.4; return seg(t, a, a + f) * (1 - seg(t, b - f, b)); };
  // camera on an orbit around p; ox/oy shift the picture in pixels (negative ox = subject moves right, positive oy = subject moves up)
  function aim(C, p, dist, az, el, ox, oy) {
    orbit(C, p.x, p.y, p.z, dist, az, el);
    C.near = dist * 0.02; C.far = dist * 400;
    if (ox || oy) C.setViewOffset(W, H, ox || 0, oy || 0, W, H); else C.clearViewOffset();
    C.updateProjectionMatrix();
  }
  // Catmull-Rom through [[t, v], ...] with eased ends (one continuous move)
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
  const pin = (text, v, op, dy) => [text, v.x, v.y + (dy || 0), v.z, op];
  const VS_NV = "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }";
  // feathered additive halo (bright facing the camera, nothing at the silhouette)
  const softHalo = (c, op) => new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color(c) }, op: { value: op } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: VS_NV,
    fragmentShader: "uniform vec3 col; uniform float op; varying vec3 vN; varying vec3 vV; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(col * op * f * f * f, 1.0); }" });
  // fresnel rim (frosted-glass edge)
  const rimMat = (c, op, pw) => new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color(c) }, op: { value: op }, pw: { value: pw || 2 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: VS_NV,
    fragmentShader: "uniform vec3 col; uniform float op; uniform float pw; varying vec3 vN; varying vec3 vV; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(col * op * pow(f, pw), 1.0); }" });

  // value noise + fbm (GLSL), shared by the sun, the core plasma and the proton's energy field
  const NOISE = `
    float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
    float vn(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
      return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
                 mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
    float fbm(vec3 p){ float a = 0.5, s = 0.0; for (int i = 0; i < 5; i++){ s += a * vn(p); p = p * 2.03 + 11.7; a *= 0.5; } return s; }`;
  // soft seething glow ball (additive): cloudy fbm in object space, strongest at the centre of the silhouette
  const plasmaMat = (c) => new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color(c) }, op: { value: 0 }, time: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec3 vP; varying vec3 vN; varying vec3 vV; void main(){ vP = position; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 col; uniform float op; uniform float time; varying vec3 vP; varying vec3 vN; varying vec3 vV;" + NOISE +
      "void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float n = fbm(vP * 2.6 + vec3(0.0, time * 0.6, time * 0.35)); float m = fbm(vP * 5.0 - vec3(time * 0.8, 0.0, time * 0.5)); float v = smoothstep(0.35, 0.85, n) * (0.6 + 0.6 * m); gl_FragColor = vec4(col * op * v * pow(f, 1.6), 1.0); }" });

  // points with clamped screen size and a near fade (safe when the camera dives through them)
  let _dot = null;
  const DOT = () => _dot || (_dot = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.42)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  function dots(pos, color, size, op, o) {
    o = o || {};
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    const n = pos.length / 3, ph = new Float32Array(n), r = rnd(o.seed || 5); for (let i = 0; i < n; i++) ph[i] = r() * 6.283;
    g.setAttribute("ph", new THREE.BufferAttribute(ph, 1));
    const al = new Float32Array(n).fill(1); if (o.al) for (let i = 0; i < n; i++) al[i] = o.al[i];
    g.setAttribute("al", new THREE.BufferAttribute(al, 1));
    const m = new THREE.ShaderMaterial({
      uniforms: { map: { value: DOT() }, col: { value: new THREE.Color(color) }, op: { value: op }, size: { value: size }, maxPx: { value: o.maxPx || 80 }, fade: { value: o.fade || 0 }, time: { value: 0 }, tw: { value: o.tw || 0 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: "uniform float size; uniform float maxPx; uniform float fade; uniform float time; uniform float tw; attribute float ph; attribute float al; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); float d = -mv.z; float px = size * 540.0 / max(d, 1e-9); gl_PointSize = min(px, maxPx); vA = al * (fade > 0.0 ? smoothstep(fade, fade * 3.0, d) : 1.0) * (1.0 - tw + tw * (0.5 + 0.5 * sin(time * (1.3 + fract(ph * 7.1) * 2.0) + ph))); gl_Position = projectionMatrix * mv; }",
      fragmentShader: "uniform sampler2D map; uniform vec3 col; uniform float op; varying float vA; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(col * t.a * op * vA, 1.0); }",
    });
    return new THREE.Points(g, m);
  }
  // tube rebuilt every frame from fn(u) -> V3
  function tube(fn, segs, rad, mat, closed) {
    const curve = new THREE.Curve(); curve.getPoint = (u, out) => (out || new V3()).copy(fn(u));
    const R = typeof rad === "function" ? rad : () => rad;
    const m = new THREE.Mesh(new THREE.BufferGeometry(), mat);
    m.userData.update = () => { if (!m.visible) return; curve.needsUpdate = true; m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(curve, segs, R(), 8, !!closed); };
    m.userData.update(); return m;
  }
  // luminous strand: warm-white core + soft halo; g.userData.fade(k)
  function strand(fn, segs, r, color, haloOp) {
    const g = new THREE.Group(), core = M.light(color || 0xf6e6cc, 1), h1 = softHalo(color || 0xffe2bc, haloOp || 0.25);
    const parts = [tube(fn, segs, r, core), tube(fn, segs, r * 4.5, h1)];
    g.add(...parts);
    g.userData.fade = (k) => { core.opacity = k; h1.uniforms.op.value = (haloOp || 0.25) * k; parts.forEach((p) => (p.visible = k > 0.002)); };
    return g;
  }
  // soft lit backdrop card behind the subject (keeps dark scenes from going murky); place(cam, target, k)
  let _bgt = null;
  const BGT = () => _bgt || (_bgt = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.45, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }));
  function backdrop(S, color, op) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: BGT(), color: color || 0x3a3f4a, transparent: true, opacity: op !== undefined ? op : 1, depthWrite: false, fog: false }));
    m.renderOrder = -10; S.add(m);
    const dir = new V3();
    m.userData.place = (C, p, back, size) => { dir.subVectors(p, C.position).normalize(); m.position.copy(p).addScaledVector(dir, back); m.scale.setScalar(size); m.lookAt(C.position); };
    return m;
  }
  // camera-attached grade: darkens the lower-left (line/cap overlays) and/or the centre block (big/eq overlays). place(C, ox, oy, ll, cc)
  let _gll = null, _gcc = null;
  const GLL = () => _gll || (_gll = canvasTex(512, 288, (g, w, h) => { const gr = g.createRadialGradient(w * 0.18, h * 1.0, 0, w * 0.18, h * 1.0, w * 0.62); gr.addColorStop(0, "rgba(0,0,0,0.92)"); gr.addColorStop(0.55, "rgba(0,0,0,0.6)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
  const GCC = () => _gcc || (_gcc = canvasTex(512, 288, (g, w, h) => { g.save(); g.translate(w / 2, h * 0.475); g.scale(1, 0.5); const gr = g.createRadialGradient(0, 0, 0, 0, 0, w * 0.36); gr.addColorStop(0, "rgba(0,0,0,0.9)"); gr.addColorStop(0.6, "rgba(0,0,0,0.6)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(-w, -h * 2, 2 * w, 4 * h); g.restore(); }));
  function grade(S) {
    const mk = (map) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = 999; m.frustumCulled = false; S.add(m); return m; };
    const ll = mk(GLL()), cc = mk(GCC()), v = new V3();
    return { place(C, ox, oy, kll, kcc) {
      C.updateMatrixWorld();
      const dz = C.near * 4, h = 2 * dz * Math.tan(C.fov * D2R / 2), w = h * C.aspect;
      for (const [m, k] of [[ll, kll], [cc, kcc]]) {
        m.visible = k > 0.002; m.material.opacity = k;
        v.set(((ox || 0) / W) * w, -((oy || 0) / H) * h, -dz).applyMatrix4(C.matrixWorld);
        m.position.copy(v); m.quaternion.copy(C.quaternion); m.scale.set(w * 1.002, h * 1.002, 1);
      }
    } };
  }
  // nucleon positions of an X3.nucleus group: { p: [V3..], n: [V3..], R }
  function nucPts(Z, N, seed, r) {
    const g = X3.nucleus(Z, N, seed, r), mm = new THREE.Matrix4(), out = { p: [], n: [], R: g.userData.R, g };
    const [ip, inn] = g.children;
    for (let i = 0; i < Z; i++) { ip.getMatrixAt(i, mm); out.p.push(new V3().setFromMatrixPosition(mm)); }
    for (let i = 0; i < N; i++) { inn.getMatrixAt(i, mm); out.n.push(new V3().setFromMatrixPosition(mm)); }
    return out;
  }
  const dirOf = (az, el) => new V3(Math.sin(az * D2R) * Math.cos(el * D2R), Math.sin(el * D2R), Math.cos(az * D2R) * Math.cos(el * D2R));
  // integral of seg(t,a,b): ramps a frequency without phase jumps
  const iseg = (t, a, b) => { const L = b - a, p = (t - a) / L; if (p <= 0) return 0; if (p >= 1) return L * (p - 0.5); return L * (p * p * p - p * p * p * p / 2); };
  const quarkMat = (c) => { const m = satin(new THREE.Color(0xf2e8dc).lerp(new THREE.Color(c), 0.5).getHex(), 0.3); m.emissive = new THREE.Color(0xffe2c0).lerp(new THREE.Color(c), 0.3); m.emissiveIntensity = 0.16; return m; };
  const QC = [P.quarkR, P.quarkG, P.quarkB];
  // warm macro "skin-like" surface (abstract): Worley-cell micro-relief (polygonal plates, soft grooves), pores, mottling. Tileable.
  let _skin = null;
  const SKIN = () => _skin || (_skin = canvasTex(768, 768, (g, w, h) => {
    const r = rnd(77), img = g.createImageData(w, h), D = img.data;
    const grid = (n, seed) => { const rr = rnd(seed), pts = []; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) pts.push([(i + 0.15 + 0.7 * rr()) / n, (j + 0.15 + 0.7 * rr()) / n]); return { n, pts }; };
    const G1 = grid(9, 3), G2 = grid(26, 5), G3 = grid(5, 9);
    const worley = (G, x, y) => { const n = G.n, ci = Math.floor(x * n), cj = Math.floor(y * n); let f1 = 9, f2 = 9;
      for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ii = (ci + di + n) % n, jj = (cj + dj + n) % n, q = G.pts[jj * n + ii];
        let dx = q[0] + Math.floor((ci + di) / n) - x, dy = q[1] + Math.floor((cj + dj) / n) - y; dx -= 0; const dd = Math.hypot(dx, dy) * n; if (dd < f1) { f2 = f1; f1 = dd; } else if (dd < f2) f2 = dd; }
      return [f1, f2 - f1]; };
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const u = x / w, v = y / h, [, e1] = worley(G1, u, v), [, e2] = worley(G2, u, v), [m1] = worley(G3, u, v);
      const groove = 1 - 0.2 * Math.exp(-e1 * e1 * 260) - 0.12 * Math.exp(-e2 * e2 * 160);
      const dome = 0.92 + 0.08 * Math.min(1, e2 * 2.2), mott = 0.9 + 0.1 * Math.cos(m1 * 3.1);
      const k = groove * dome * mott, i4 = (y * w + x) * 4;
      D[i4] = 172 * k; D[i4 + 1] = 115 * k * (0.97 + 0.03 * mott); D[i4 + 2] = 102 * k; D[i4 + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    for (let i = 0; i < 90; i++) { const x = r() * w, y = r() * h, s = 1.4 + r() * 1.8; const gr = g.createRadialGradient(x, y, 0, x, y, s * 2.2); gr.addColorStop(0, "rgba(58,28,22,0.6)"); gr.addColorStop(1, "rgba(80,42,32,0)"); g.fillStyle = gr; g.fillRect(x - s * 3, y - s * 3, s * 6, s * 6); }
    for (let i = 0; i < 20000; i++) { g.fillStyle = r() < 0.5 ? "rgba(60,30,20,0.05)" : "rgba(255,226,206,0.05)"; g.fillRect(r() * w, r() * h, 1.2, 1.2); }
  }));
  const _m4 = new THREE.Matrix4(), _q = new THREE.Quaternion(), _s = new V3();
  function setInst(im, i, p, s) { _s.setScalar(s); _m4.compose(p, _q, _s); im.setMatrixAt(i, _m4); }

  // ================================================================ atom
  LABK.atom = (o) => (o.mode === "metal" ? metal(o) : o.mode === "sum" ? sum(o) : ladder(o));

  // ---- the scale ladder: skin -> atoms -> one atom -> nucleus -> proton -> quarks. Modes zoom (in), binding (inside the proton), pullback (out), you (in, slower).
  // Scale is COMPRESSED: nucleus radius = 1/150 of the atom (real ~1/40,000) so the dive does not spend seconds on an invisible speck.
  function ladder(o) {
    const mode = o.mode, T0 = o.T0;
    const RN = 1 / 150, rp = RN / (1.12 * Math.cbrt(12) + 1), L = Math.log;
    // camera: log-distance keys [ft, ln dist], azimuth/elevation and picture offset per mode
    let LD, azF, elF, oxF, oyF;
    if (mode === "zoom") {
      LD = [[287.98, L(110)], [289.0, L(62)], [289.9, L(27)], [290.9, L(6.5)], [291.75, L(2.6)], [292.7, L(0.055)], [294.0, L(0.042)], [295.1, L(4.2 * rp)], [296.3, L(2.7 * rp)], [299.28, L(2.35 * rp)]];
      azF = (ft) => 24 + 2.2 * (ft - 287.98); elF = (ft) => 16 - 0.4 * (ft - 287.98); oxF = () => 0; oyF = () => 0;
    } else if (mode === "binding") {
      LD = [[311.46, L(2.35 * rp)], [315.5, L(2.45 * rp)], [319.4, L(2.55 * rp)], [322.0, L(3.6 * rp)], [323.74, L(5.4 * rp)]];
      azF = (ft) => 50 + 3.2 * (ft - 311.46); elF = (ft) => 12 + 4 * Math.sin((ft - 311.46) * 0.25); oxF = () => 0; oyF = () => 0;
    } else if (mode === "pullback") {
      LD = [[323.74, L(7.5 * rp)], [324.55, L(0.055)], [325.9, L(0.09)], [327.3, L(3.2)], [328.7, L(7)], [330.0, L(20)], [330.9, L(56)]];
      azF = (ft) => 110 - 2.6 * (ft - 323.74); elF = (ft) => 14 + 0.6 * (ft - 323.74); oxF = (ft) => lerp(-740, -620, seg(ft, 324.7, 326.2)); oyF = () => 40;
    } else { // you
      LD = [[616.16, L(110)], [617.4, L(58)], [618.5, L(27)], [619.7, L(7.5)], [620.8, L(2.7)], [622.2, L(0.13)], [623.46, L(0.055)]];
      azF = (ft) => 320 + 1.8 * (ft - 616.16); elF = (ft) => 18 - 0.5 * (ft - 616.16); oxF = () => -230; oyF = () => 70;
    }
    const ft0 = LD[0][0], ftE = LD[LD.length - 1][0];
    const S = stage("void", { dust: 0, key: 2.4, rim: 1.1, hemi: 0.3 }), C = cam(30);
    const bg = backdrop(S, 0x2c3340, 1), gr = grade(S);
    // crossing time of the skin plane (camera dist 28) -> its normal faces the camera there
    let tx = ft0; for (let f = ft0; f <= ftE; f += 0.02) if ((mode === "pullback") === (cr(LD, f) > L(28))) { tx = f; break; }
    const nS = dirOf(azF(tx), elF(tx));
    const skinMap = SKIN().clone(); skinMap.needsUpdate = true; skinMap.wrapS = skinMap.wrapT = THREE.RepeatWrapping; skinMap.repeat.set(6, 6);
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xaaa29b, map: skinMap, bumpMap: skinMap, bumpScale: 2.5, roughness: 0.58, metalness: 0, transparent: true, depthWrite: false, envMapIntensity: 0.4 });
    const skin = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), skinMat); skin.position.copy(nS).multiplyScalar(28); skin.lookAt(nS.clone().multiplyScalar(100)); S.add(skin);
    const skinLight = new THREE.PointLight(0xffe6d2, 0, 0, 2); S.add(skinLight);
    const sLat = new V3().crossVectors(nS, UP).normalize(), sUp = new V3().crossVectors(sLat, nS).normalize();
    // field of neighbouring atoms (jittered lattice in a ball), each a pale haze with a warm speck
    const fp = [], fr = rnd(31);
    for (let x = -24; x <= 24; x += 2.3) for (let y = -24; y <= 24; y += 2.3) for (let z = -24; z <= 24; z += 2.3) {
      const v = new V3(x + (fr() - 0.5) * 1.1, y + (fr() - 0.5) * 1.1, z + (fr() - 0.5) * 1.1), l = v.length();
      if (l > 24 || l < 2.3) continue; fp.push(v.x, v.y, v.z);
    }
    const field = dots(fp, P.electron, 2.0, 0.16, { maxPx: 260, fade: 0.4 }); S.add(field);
    const specks = dots(fp, 0xffd9b0, 0.05, 0.9, { maxPx: 3 }); S.add(specks);
    // the target atom: electron haze (1s, 2s, 2p lobes) + soft glow
    const cp = [], crr = rnd(41);
    for (let i = 0; i < 7000; i++) {
      let d; for (;;) { const u = crr() * 2 - 1, th = crr() * TAU, q = Math.sqrt(1 - u * u); d = new V3(q * Math.cos(th), u, q * Math.sin(th)); if (i % 3 !== 2 || crr() < d.y * d.y) break; }
      const rad = i % 3 === 0 ? -Math.log(1 - crr() * 0.98) * 0.22 : i % 3 === 1 ? 0.55 - Math.log(1 - crr() * 0.98) * 0.25 : 0.25 + 0.55 * (crr() + crr() + crr()) / 1.5;
      cp.push(d.x * rad, d.y * rad, d.z * rad);
    }
    const cloud = dots(cp, P.electron, 0.05, 0.4, { maxPx: 24, fade: 0.03 }); S.add(cloud);
    const haze = glowSprite(P.electron, 3.2, 0.2); S.add(haze);
    const speck = new THREE.Sprite(new THREE.SpriteMaterial({ map: DOT(), color: 0xffe0bc, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: false })); S.add(speck);
    // nucleus: carbon-12 from X3, the dive proton p1 is the one facing the camera at the nucleus stage
    const nuc = nucPts(6, 6, 9, rp); S.add(nuc.g);
    const fNuc = { zoom: 293.3, binding: 311.5, pullback: 325.4, you: 623.0 }[mode];
    const dN = dirOf(azF(fNuc), elF(fNuc));
    let pi = 0; nuc.p.forEach((v, i) => { if (v.dot(dN) > nuc.p[pi].dot(dN)) pi = i; });
    const p1 = nuc.p[pi].clone(); setInst(nuc.g.children[0], pi, p1, 0); nuc.g.children[0].instanceMatrix.needsUpdate = true;
    // own copies of the X3 satin materials on this nucleus so the neighbours can fade (X3.mats untouched)
    const nbM = [X3.mats.proton.clone(), X3.mats.neutron.clone()], nbC = nbM.map((m) => m.color.clone()); nbM.forEach((m) => { m.emissive = new THREE.Color(0xff9c62); m.emissiveIntensity = 0; });
    nuc.g.children[0].material = nbM[0]; nuc.g.children[1].material = nbM[1];
    const nucGlow = glowSprite(0xffd2a0, RN * 3.6, 0); S.add(nucGlow);
    // the dive proton: X3 proton look from afar, translucent shell + rim up close
    const shellMat = X3.mats.proton.clone(); shellMat.transparent = true;
    const shell = ball(shellMat, rp); shell.position.copy(p1); S.add(shell);
    const rim = ball(rimMat(0xffc8a8, 0, 2.2), rp); rim.position.copy(p1); S.add(rim);
    const inner = new THREE.Group(); inner.position.copy(p1); S.add(inner);
    const qM = QC.map((c) => { const m = ball(quarkMat(c), rp * 0.095); inner.add(m); return m; });
    const qGlow = QC.map(() => { const g = glowSprite(0xffe6c8, rp * 0.55, 0); inner.add(g); return g; });
    const qp = [new V3(), new V3(), new V3()], junction = new V3();
    const tst = [0, 1, 2].map(() => ({ A: 0, ph: 0, nrm: new V3(), bi: new V3() }));
    const fluxes = [0, 1, 2].map((i) => {
      const st = tst[i], v = new V3();
      const fn = (u) => { v.lerpVectors(junction, qp[i], u); const sw = Math.sin(Math.PI * u); return v.addScaledVector(st.nrm, st.A * sw * Math.sin(2 * Math.PI * u + st.ph)).addScaledVector(st.bi, 0.6 * st.A * sw * Math.cos(3 * Math.PI * u + st.ph * 1.3)); };
      const g = strand(fn, 40, rp * 0.011, 0xf8e4c8, 0.42); inner.add(g); return g;
    });
    // seething energy inside the proton + motion trails of the quarks
    const ep = [], er = rnd(57);
    while (ep.length < 520 * 3) { const dd = new V3(er() * 2 - 1, er() * 2 - 1, er() * 2 - 1); if (dd.length() > 1) continue; dd.multiplyScalar(rp * 0.92); ep.push(dd.x, dd.y, dd.z); }
    const energy = dots(ep, 0xffd6a6, rp * 0.09, 0.0, { maxPx: 60, tw: 1, seed: 8 }); inner.add(energy);
    const core = glowSprite(0xffd8b0, rp * 2.4, 0); inner.add(core);
    const plasma = ball(plasmaMat(0xffc890), rp * 0.9); inner.add(plasma);
    const NT = 130, trAl = []; for (let q = 0; q < 3; q++) for (let k = 0; k < NT; k++) trAl.push(Math.pow(1 - k / NT, 1.6));
    const trails = dots(new Array(NT * 9).fill(0), 0xfff0dc, rp * 0.15, 0, { maxPx: 60, al: trAl }); inner.add(trails);
    const trPos = trails.geometry.attributes.position;
    const BASE = [0, 1, 2].map((i) => new V3(Math.cos(i * TAU / 3 + 0.4), Math.sin(i * TAU / 3 + 0.4), 0.3 * Math.sin(i * 2.1)).normalize().multiplyScalar(rp * 0.42));
    const FR = [[1.7, 2.3, 1.9], [2.1, 1.6, 2.5], [1.5, 2.6, 2.0]];
    // racing ramps in at 313.7 ("racing around"); phase uses the integral so speed changes never jump
    const race = (ft) => (mode === "binding" ? seg(ft, 312.8, 314.4) : 0);
    const phase = (ft) => (mode === "binding" ? 0.35 * (ft - 311.46) + 1.5 * iseg(ft, 312.8, 314.4) : 0.35 * ft);
    const qv = new V3();
    function quarkAt(i, ft, out) {
      const ph = phase(ft), a = rp * lerp(0.1, 0.3, race(ft)), f = FR[i];
      return out.copy(BASE[i]).multiplyScalar(lerp(1, 0.7, race(ft)))
        .add(qv.set(a * Math.sin(f[0] * ph * Math.PI + i), a * Math.sin(f[1] * ph * Math.PI + i * 2.3), a * Math.sin(f[2] * ph * Math.PI + i * 4.1)));
    }
    const tgt = new V3(), tmp = new V3(), cpos = new V3(), cA = new THREE.Color(0x34405a), cB = new THREE.Color(0x3a2c26);
    return (t, d) => {
      const ft = T0 + t, ld = cr(LD, ft), dist = Math.exp(ld);
      // target: atom centre -> dive proton
      const wq = smooth((L(2.5 * RN) - ld) / (L(2.5 * RN) - L(5 * rp)));
      tgt.set(0, 0, 0).lerp(p1, wq);
      aim(C, tgt, dist, azF(ft), elF(ft), oxF(ft), oyF(ft)); C.updateMatrixWorld();
      // skin (beyond dist 28 it is between camera and atoms)
      const sk = smooth((ld - L(36)) / (L(52) - L(36)));
      skin.visible = sk > 0.003; skinMat.opacity = sk;
      const Dk = Math.max(dist - 28, 1); skinLight.position.copy(nS).multiplyScalar(28 + Dk * 0.3).addScaledVector(sLat, -Dk * 0.9).addScaledVector(sUp, Dk * 0.6); skinLight.intensity = sk * Dk * Dk * 2.2;
      // atoms
      const fk = smooth((ld - L(0.9)) / (L(3) - L(0.9)));
      field.visible = specks.visible = fk > 0.003; field.material.uniforms.op.value = 0.2 * fk; specks.material.uniforms.op.value = 0.85 * fk;
      const ck = smooth((ld - L(0.12)) / (L(1.2) - L(0.12)));
      cloud.visible = ck > 0.003; cloud.material.uniforms.op.value = 0.6 * ck; haze.material.opacity = 0.3 * ck;
      const spk = smooth((ld - L(0.09)) / (L(0.4) - L(0.09))) * (1 - smooth((ld - L(30)) / (L(60) - L(30))));
      speck.material.opacity = 0.45 * spk; speck.scale.setScalar(0.012 + 0.004 * Math.sin(ft * 2.1) ** 2);
      // nucleus glow: locked energy ("you" ends on it), faint elsewhere
      const ng = mode === "you" ? seg(ft, 621.4, 623.0) : 0.25 * smooth((ld - L(0.02)) / (L(0.08) - L(0.02))) * (1 - smooth((ld - L(0.5)) / (L(2) - L(0.5))));
      nucGlow.material.opacity = 0.55 * ng * (0.85 + 0.15 * Math.sin(ft * 2.4));
      const nb = smooth((ld - L(5.5 * rp)) / (L(9 * rp) - L(5.5 * rp)));
      nuc.g.visible = ld < L(2.5) && nb > 0.02; nbM.forEach((m, i) => { const kk = nb * nb; m.color.copy(nbC[i]).multiplyScalar(kk); m.sheen = 0.55 * kk; m.clearcoat = 0.3 * kk; m.envMapIntensity = kk; m.specularIntensity = kk; m.emissiveIntensity = 0.3 * ng * (0.8 + 0.2 * Math.sin(ft * 2.4)); });
      // dive proton
      const pf = smooth((ld - L(3 * rp)) / (L(9 * rp) - L(3 * rp)));
      shellMat.opacity = lerp(0.035, 1, pf); shellMat.depthWrite = pf > 0.98;
      const inn = 1 - pf; inner.visible = inn > 0.003;
      let pulse = 0, gather = 0;
      if (mode === "binding") { gather = seg(ft, 319.4, 321.4); pulse = win(ft, 321.4, 323.2, 0.8); }
      rim.material.uniforms.op.value = (0.55 + 0.45 * pulse) * inn;
      for (let i = 0; i < 3; i++) {
        quarkAt(i, ft, qp[i]); qM[i].position.copy(qp[i]);
        qGlow[i].position.copy(qp[i]); qGlow[i].material.opacity = 0.32 * inn;
      }
      junction.copy(qp[0]).add(qp[1]).add(qp[2]).multiplyScalar(1 / 3);
      for (let i = 0; i < 3; i++) {
        const st = tst[i], len = tmp.subVectors(qp[i], junction).length();
        st.nrm.crossVectors(tmp, UP).normalize(); st.bi.crossVectors(st.nrm, tmp).normalize();
        st.A = len * lerp(0.08, 0.16, race(ft)) * (0.7 + 0.3 * Math.sin(ft * 5.3 + i * 2));
        st.ph = ft * lerp(3, 9, race(ft)) + i * 2.1;
        const flick = 0.82 + 0.18 * Math.sin(ft * 13.7 + i * 1.9) * Math.sin(ft * 7.1 + i);
        fluxes[i].userData.fade(inn * flick);
      }
      energy.material.uniforms.time.value = ft * lerp(1.4, 3, race(ft));
      energy.material.uniforms.op.value = inn * (0.22 + 0.12 * race(ft) + 0.35 * gather);
      energy.scale.setScalar(1 - 0.45 * gather);
      core.material.opacity = inn * (0.12 + 0.3 * gather + 0.35 * pulse);
      plasma.material.uniforms.time.value = ft * lerp(0.5, 1.4, race(ft)); plasma.material.uniforms.op.value = inn * (0.22 + 0.1 * race(ft) + 0.25 * gather); plasma.scale.setScalar(rp * 0.9 * (1 - 0.35 * gather)); plasma.visible = inner.visible;
      // trails (only while racing)
      const tk = race(ft);
      trails.visible = tk > 0.003 && inner.visible; trails.material.uniforms.op.value = 0.16 * tk * inn;
      if (trails.visible) { for (let q = 0; q < 3; q++) for (let k = 0; k < NT; k++) { quarkAt(q, ft - k * 0.0026, cpos); trPos.setXYZ(q * NT + k, cpos.x, cpos.y, cpos.z); } trPos.needsUpdate = true; }
      // backdrop: cool at atom scale, warm at nuclear scale
      bg.material.color.copy(cA).lerp(cB, smooth((L(0.5) - ld) / (L(0.5) - L(0.03))));
      bg.material.opacity = 1 - sk; bg.visible = sk < 0.997;
      bg.userData.place(C, tgt, dist * 3, dist * 6);
      // grade for overlays
      let kll = 0, kcc = 0;
      if (mode === "pullback") kcc = 0.55 * win(ft, 323.9, 330.75, 0.3);
      if (mode === "you") kll = 0.85 * win(ft, 616.85, 623.6, 0.4);
      gr.place(C, oxF(ft), oyF(ft), kll, kcc);
      const pins = [];
      if (mode === "zoom") {
        pins.push(pin("atom", tmp.set(0.5, 0.78, 0), win(ft, 291.0, 292.25, 0.3)));
        pins.push(pin("nucleus", tmp.set(0, RN * 1.05, 0), win(ft, 292.5, 294.1, 0.3)));
        pins.push(pin("proton", tmp.copy(p1).addScaledVector(UP, rp * 1.02), win(ft, 294.5, 295.9, 0.3)));
        pins.push(pin("quarks", tmp.copy(p1).add(qp[0]).addScaledVector(UP, rp * 0.14), win(ft, 296.1, 299.4, 0.4)));
      }
      if (mode === "binding") pins.push(pin("quark", tmp.copy(p1).add(qp[1]).addScaledVector(UP, rp * 0.14), win(ft, 311.7, 313.4, 0.4)));
      return [S, C, pins];
    };
  }

  // dark wooden bench for the balance scenes (top at y = 0)
  function bench(S, w, d) {
    const grain = canvasTex(1024, 256, (g, W2, H2) => { g.fillStyle = "#3a2417"; g.fillRect(0, 0, W2, H2); const r = rnd(19); for (let i = 0; i < 260; i++) { const y = r() * H2; g.strokeStyle = r() < 0.5 ? "rgba(20,10,6,0.35)" : "rgba(120,80,50,0.18)"; g.lineWidth = 0.6 + r() * 2.2; g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= W2; x += 32) g.lineTo(x, y + Math.sin(x * 0.01 + i) * 3 + (r() - 0.5) * 1.5); g.stroke(); } });
    grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(w / 4, d / 1.5);
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.12, d), new THREE.MeshStandardMaterial({ color: 0x9a9a9a, map: grain, roughness: 0.62, metalness: 0, envMapIntensity: 0.18 }));
    m.position.y = -0.06; m.receiveShadow = true; S.add(m); return m;
  }
  // a model proton for the balance: translucent copper satin shell, three quarks joined by soft flux, faint inner glow. upd(ft)
  function protonModel(R) {
    const g = new THREE.Group(), mat = X3.mats.proton.clone(); mat.transparent = true; mat.opacity = 0.42; mat.depthWrite = false;
    const shell = ball(mat, R); shell.castShadow = true; g.add(shell, ball(rimMat(0xffc8a8, 0.5, 2.2), R));
    const qs = QC.map((c) => { const m = ball(quarkMat(c), R * 0.12); g.add(m); return m; }), qp = [new V3(), new V3(), new V3()], jn = new V3();
    const fl = [0, 1, 2].map((i) => { const v = new V3(); const s = strand((u) => v.lerpVectors(jn, qp[i], u), 8, R * 0.012, 0xf8e4c8, 0.35); g.add(s); return s; });
    const pl = ball(plasmaMat(0xffc890), R * 0.85); g.add(pl);
    g.userData.upd = (ft) => {
      for (let i = 0; i < 3; i++) { const a = ft * 0.9 + i * TAU / 3; qp[i].set(Math.cos(a) * R * 0.45, Math.sin(a * 1.3 + i) * R * 0.25, Math.sin(a) * R * 0.45); qs[i].position.copy(qp[i]); }
      jn.copy(qp[0]).add(qp[1]).add(qp[2]).multiplyScalar(1 / 3); fl.forEach((s) => s.userData.fade(0.85));
      pl.material.uniforms.time.value = ft * 0.6; pl.material.uniforms.op.value = 0.28;
    };
    return g;
  }

  // ---- sum (299.28-311.46): proton on the left pan, its three quarks on the right; the arrest drops at "You don't." and the quark pan flies up (≈1 %)
  function sum(o) {
    const T0 = o.T0, F = { q1: 299.95, q2: 300.4, q3: 300.85, release: 303.1 };
    const S = stage("studio", { key: 2.1, rim: 1.2, hemi: 0.25, floorY: -1.2 }), C = cam(30);
    bench(S, 14, 6);
    const bg = backdrop(S, 0x2a2e36, 1), gr = grade(S);
    const b = X3.balance({ s: 1 }); S.add(b.group);
    const prot = protonModel(0.15); prot.position.y = 0.15; b.panL.add(prot);
    const qs = QC.map((c, i) => { const m = ball(quarkMat(c), 0.024); m.castShadow = true; b.panR.add(m); return m; });
    const qxz = [[-0.07, 0.04], [0.07, 0.04], [0, -0.075]];
    // pan arrest posts (hold both pans level until the release)
    const postMat = X3.mats.brassDark, posts = [-0.62, 0.62].map((x) => { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.026, 0.68, 20), postMat); p.position.set(x, 0.34, 0); p.castShadow = true; S.add(p); return p; });
    const tgt = new V3(), tmp = new V3();
    return (t, d) => {
      const ft = T0 + t;
      prot.userData.upd(ft);
      qs.forEach((m, i) => { const k = seg(ft, [F.q1, F.q2, F.q3][i], [F.q1, F.q2, F.q3][i] + 0.55); m.position.set(qxz[i][0], 0.024 + 0.5 * (1 - k), qxz[i][1]); m.visible = ft > [F.q1, F.q2, F.q3][i] - 0.05; });
      const rel = seg(ft, F.release, F.release + 1.5);
      b.set(0.2 * rel);
      posts.forEach((p) => (p.position.y = 0.34 - 0.18 * seg(ft, F.release - 0.1, F.release + 0.5)));
      // camera: close on both pans -> wider for the tilt -> end-on, balance on the right (centre clear 305.7-309.6)
      const k1 = seg(ft, 302.6, 304.2), k2 = seg(ft, 304.0, 305.6);
      tgt.set(0, lerp(0.95, 0.85, k1), 0);
      const dist = lerp(lerp(2.75, 2.5, seg(ft, 299.28, 302.6)), 3.1, k1) + 0.75 * k2 - 0.25 * seg(ft, 306.2, 311.46);
      const az = lerp(lerp(-6, 2, seg(ft, 299.28, 302.6)), 8, k1) + (-70 - 8) * k2 + 4 * seg(ft, 306.2, 311.46);
      const el = lerp(9, 11, k1) + 3 * k2;
      const ox = -600 * k2, oy = 30 * k2;
      aim(C, tgt, dist, az, el, ox, oy); C.updateMatrixWorld();
      bg.userData.place(C, tgt, 4, 7);
      gr.place(C, ox, oy, 0.75 * win(ft, 309.5, 311.6, 0.3), 0.45 * win(ft, 305.5, 309.8, 0.3));
      const pp = win(ft, 299.5, 305.4, 0.4), pq = win(ft, 301.2, 305.4, 0.4);
      return [S, C, [pin("proton", prot.getWorldPosition(tmp), pp, 0.2), pin("3 quarks", qs[2].getWorldPosition(new V3()), pq, 0.16)]];
    };
  }

  // ---- metal (54.78-59.98): a small oxidised uranium slug on a dark steel table, hard top light, slow push-in
  function metal(o) {
    const S = stage("studio", { key: 0.12, hemi: 0.05, rim: 0.35, floorY: -3 }), C = cam(26);
    S.fog = new THREE.Fog(0x0b0c10, 7, 16);
    // brushed steel table top
    const brushed = canvasTex(1024, 1024, (g, w, h) => {
      g.fillStyle = "#5a5e65"; g.fillRect(0, 0, w, h); const r = rnd(11);
      for (let i = 0; i < 2600; i++) { const y = r() * h, a = 0.03 + r() * 0.08; g.fillStyle = r() < 0.5 ? `rgba(255,255,255,${a})` : `rgba(0,0,0,${a})`; g.fillRect(0, y, w, 0.6 + r() * 1.4); }
      for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(30,30,32,${0.05 + r() * 0.08})`; g.lineWidth = 0.5 + r(); g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 300, y + (r() - 0.5) * 40); g.stroke(); }
    });
    brushed.wrapS = brushed.wrapT = THREE.RepeatWrapping; brushed.repeat.set(2, 2);
    const table = new THREE.Mesh(new THREE.BoxGeometry(40, 0.3, 40), new THREE.MeshStandardMaterial({ color: 0x8a9098, map: brushed, metalness: 0.75, roughness: 0.55, envMapIntensity: 0.25 }));
    table.position.y = -0.15; table.receiveShadow = true; S.add(table);
    // the slug: lathe with bevelled edges, mottled dark oxide
    const oxide = canvasTex(1024, 512, (g, w, h) => {
      g.fillStyle = "#6c6d70"; g.fillRect(0, 0, w, h); const r = rnd(23);
      for (let i = 0; i < 1400; i++) { const x = r() * w, y = r() * h, s = 3 + r() * 40; const gr = g.createRadialGradient(x, y, 0, x, y, s); const c = r() < 0.5 ? "22,22,24" : r() < 0.6 ? "84,70,52" : "128,129,132"; gr.addColorStop(0, `rgba(${c},${0.3 + r() * 0.45})`); gr.addColorStop(1, `rgba(${c},0)`); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s); }
      for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(${r() < 0.5 ? "0,0,0" : "170,170,170"},${0.1 + r() * 0.2})`; const s = r() < 0.9 ? 1 : 2; g.fillRect(r() * w, r() * h, s, s); }
    });
    const rough = canvasTex(512, 256, (g, w, h) => { g.fillStyle = "#c8c8c8"; g.fillRect(0, 0, w, h); const r = rnd(5); for (let i = 0; i < 260; i++) { const x = r() * w, y = r() * h, s = 6 + r() * 40, v = r() < 0.5 ? 70 : 245; const gr = g.createRadialGradient(x, y, 0, x, y, s); gr.addColorStop(0, `rgba(${v},${v},${v},0.7)`); gr.addColorStop(1, `rgba(${v},${v},${v},0)`); g.fillStyle = gr; g.fillRect(x - s, y - s, 2 * s, 2 * s); } });
    const R0 = 0.42, Hh = 0.95, b = 0.05, prof = [];
    prof.push(new THREE.Vector2(0, 0), new THREE.Vector2(R0 - b, 0));
    for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + i / 6 * Math.PI / 2; prof.push(new THREE.Vector2(R0 - b + Math.cos(a) * b, b + Math.sin(a) * b)); }
    for (let i = 0; i <= 6; i++) { const a = i / 6 * Math.PI / 2; prof.push(new THREE.Vector2(R0 - b + Math.cos(a) * b, Hh - b + Math.sin(a) * b)); }
    const slugMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: oxide, roughnessMap: rough, bumpMap: oxide, bumpScale: 5, metalness: 0.42, roughness: 1, envMapIntensity: 0.9 });
    const slug = new THREE.Mesh(new THREE.LatheGeometry(prof, 96), slugMat); slug.castShadow = true; slug.receiveShadow = true; S.add(slug);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(R0 - b + 0.001, 96), slugMat); cap.rotation.x = -Math.PI / 2; cap.position.y = Hh; cap.receiveShadow = true; S.add(cap);
    // hard top light
    const spot = new THREE.SpotLight(0xfff1e0, 135, 30, 0.3, 0.55, 2); spot.position.set(1.6, 7.2, -1.2); spot.target.position.set(0, 0, 0);
    spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0002; spot.shadow.radius = 3; S.add(spot, spot.target);
    const back = new THREE.SpotLight(0x9fb4d0, 40, 30, 0.35, 0.8, 2); back.position.set(-1.5, 3.2, -6); back.target.position.set(0, 0.4, 0); S.add(back, back.target);
    const tgt = new V3();
    return (t, d) => {
      const k = smooth(t / d);
      tgt.set(0, 0.42 - 0.05 * k, 0);
      aim(C, tgt, lerp(5.8, 3.8, k), lerp(-20, -4, k), lerp(18, 10, k), 0, 0);
      return [S, C, []];
    };
  }

  // ================================================================ sun
  const SU = { pp1: 520.3, pp2: 520.6, he3a: 521.1, he3b: 521.4, he4: 522.2, light: 529.7 };
  // photosphere: 2k_sun.jpg + animated granulation + limb darkening (tone-mapped, never clipped white)
  const sunMat = () => new THREE.ShaderMaterial({ uniforms: { map: { value: tex("2k_sun.jpg") }, time: { value: 0 }, gain: { value: 2.4 }, fine: { value: 0 } },
    vertexShader: "varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec3 vP; void main(){ vUv = uv; vP = position; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform sampler2D map; uniform float time; uniform float gain; uniform float fine; varying vec2 vUv; varying vec3 vN; varying vec3 vV; varying vec3 vP;" + NOISE +
      "void main(){ vec3 c = texture2D(map, vUv).rgb; vec3 q = normalize(vP); float g = fbm(q * 34.0 + vec3(time * 0.05, -time * 0.04, time * 0.03)); float g2 = fbm(q * 260.0 + vec3(-time * 0.12, time * 0.1, 0.0));" +
      " c *= 0.74 + 0.26 * g + fine * 0.5 * (smoothstep(0.3, 0.7, g2) - 0.5); float mu = clamp(dot(normalize(vN), normalize(vV)), 0.0, 1.0); float limb = 1.0 - 0.62 * (1.0 - pow(mu, 0.9)); vec3 tint = mix(vec3(1.0, 0.5, 0.22), vec3(1.0), pow(mu, 0.45));" +
      " gl_FragColor = vec4(c * limb * tint * gain, 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}" });
  let _cor = null, _str = null, _ring = null;
  const CORONA = () => _cor || (_cor = canvasTex(512, 512, (g) => { const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, "rgba(255,236,200,1)"); gr.addColorStop(0.36, "rgba(255,226,180,0.9)"); gr.addColorStop(0.42, "rgba(255,214,160,0.32)"); gr.addColorStop(0.6, "rgba(255,200,140,0.08)"); gr.addColorStop(1, "rgba(255,190,130,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); }));
  const STREAM = () => _str || (_str = canvasTex(1024, 1024, (g) => { const r = rnd(4); g.translate(512, 512); for (let i = 0; i < 260; i++) { const a = r() * TAU, l = 230 + r() * 270 * r(), w = 1 + r() * 5; const gr = g.createLinearGradient(Math.cos(a) * 190, Math.sin(a) * 190, Math.cos(a) * l, Math.sin(a) * l); gr.addColorStop(0, "rgba(255,225,190," + (0.05 + r() * 0.1) + ")"); gr.addColorStop(1, "rgba(255,225,190,0)"); g.strokeStyle = gr; g.lineWidth = w; g.beginPath(); g.moveTo(Math.cos(a) * 190, Math.sin(a) * 190); g.lineTo(Math.cos(a + (r() - 0.5) * 0.08) * l, Math.sin(a + (r() - 0.5) * 0.08) * l); g.stroke(); } }));
  // a light wavefront seen face-on: thin soft ring, faded on its LEFT side (keeps the overlay block clear)
  const RING = () => _ring || (_ring = canvasTex(512, 512, (g) => { const im = g.createImageData(512, 512); for (let y = 0; y < 512; y++) for (let x = 0; x < 512; x++) { const dx = (x - 256) / 256, dy = (y - 256) / 256, rr = Math.hypot(dx, dy), a = Math.exp(-Math.pow((rr - 0.9) / 0.035, 2)) * smooth((dx / Math.max(rr, 1e-3) + 0.35) / 0.9), i = (y * 512 + x) * 4; im.data[i] = 255; im.data[i + 1] = 196; im.data[i + 2] = 130; im.data[i + 3] = 255 * a; } g.putImageData(im, 0, 0); }));
  const addSprite = (S, map, size, op) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map, color: 0xffffff, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); s.scale.setScalar(size); S.add(s); return s; };
  function makeSun(S, R) {
    const sun = new THREE.Mesh(new THREE.SphereGeometry(R, 128, 64), sunMat()); S.add(sun);
    const cor = addSprite(S, CORONA(), R * 2.78, 0.75), str = addSprite(S, STREAM(), R * 4.6, 0.32), glow = glowSprite(0xffc890, R * 6.5, 0.32); S.add(glow);
    return { sun, cor, str, glow, upd(ft, dist, spin) { sun.rotation.y = ft * (spin || 0.004); sun.material.uniforms.time.value = ft; sun.material.uniforms.fine.value = clamp(1.6 - dist / (R * 1.4), 0, 1); str.material.rotation = ft * 0.003; } };
  }
  LABK.sun = (o) => (o.mode === "core" ? sunCore(o) : sunSpace(o));

  // ---- lose (533.38-549.18) and star (614.38-616.16)
  function sunSpace(o) {
    const mode = o.mode, T0 = o.T0, R = 10;
    const S = stage("space", { seed: 12, stars: 6000 }), C = cam(30);
    const Su = makeSun(S, R);
    const rings = [0, 1, 2, 3].map(() => addSprite(S, RING(), R, 0));
    let prom = null;
    if (mode === "star") {
      // prominence: a loop of plasma strands rising off the limb (H-alpha orange, soft, flowing)
      const pMat = new THREE.ShaderMaterial({ uniforms: { time: { value: 0 }, op: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: "varying vec2 vUv; varying vec3 vN; varying vec3 vV; void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
        fragmentShader: "uniform float time; uniform float op; varying vec2 vUv; varying vec3 vN; varying vec3 vV;" + NOISE + "void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float n = fbm(vec3(vUv.x * 9.0 - time * 0.5, vUv.y * 3.0, time * 0.2)); float e = smoothstep(0.0, 0.12, vUv.x) * smoothstep(1.0, 0.88, vUv.x); gl_FragColor = vec4(vec3(1.0, 0.36, 0.12) * op * e * f * (0.15 + 0.9 * smoothstep(0.35, 0.75, n)), 1.0);\n}" });
      prom = new THREE.Group(); S.add(prom);
      const pr = rnd(66);
      for (let k = 0; k < 14; k++) {
        const hgt = 1.25 + pr() * 0.35, wd = 2.1 + pr() * 0.5, zo = (pr() - 0.5) * 0.35, lean = (pr() - 0.5) * 0.25;
        const curve = new THREE.CatmullRomCurve3([0, 0.12, 0.28, 0.5, 0.72, 0.88, 1].map((u) => new V3((u - 0.5) * wd + lean * Math.sin(u * Math.PI), Math.sin(u * Math.PI) * hgt * (1 + 0.06 * Math.sin(u * 9 + k)), zo + 0.12 * Math.sin(u * 5 + k))));
        prom.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 90, 0.014 + pr() * 0.03, 6, false), pMat));
      }
      prom.userData.mat = pMat;
      // sit on the limb as seen from the camera: point at angle 58 deg on the camera-facing silhouette
      const dirC = dirOf(-18, 6), up = new V3(0, 1, 0), side = new V3().crossVectors(up, dirC).normalize(), u2 = new V3().crossVectors(dirC, side).normalize();
      const a = 58 * D2R, nrm0 = side.clone().multiplyScalar(Math.cos(a)).addScaledVector(u2, Math.sin(a)).normalize();
      // the real silhouette seen from the (close) camera: limb circle centre (R^2/D) c, radius R sqrt(1 - R^2/D^2); feet of the arch sit on it
      const tg0 = nrm0.clone().multiplyScalar(R * 1.04), Cp = tg0.clone().add(dirOf(-16, 6.75).multiplyScalar(7)), D0 = Cp.length(), ch = Cp.clone().normalize();
      const lc = ch.clone().multiplyScalar(R * R / D0), lr = R * Math.sqrt(1 - R * R / (D0 * D0)), Pl = tg0.clone().sub(lc); Pl.addScaledVector(ch, -Pl.dot(ch)).setLength(lr).add(lc);
      const nrm = Pl.clone().normalize(), tg = new V3().crossVectors(ch, nrm).normalize();
      prom.position.copy(Pl).multiplyScalar(0.997); prom.userData.tgt = tg0;
      prom.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(tg, nrm, new V3().crossVectors(tg, nrm)));
    }
    const gr = grade(S), tgt = new V3(), tmp = new V3();
    return (t, d) => {
      const ft = T0 + t;
      if (mode === "star") {
        // close on the limb: the prominence arches into black space
        prom.userData.mat.uniforms.time.value = ft;
        tgt.copy(prom.userData.tgt);
        aim(C, tgt, lerp(7.4, 6.6, t / d), -18 + 4 * (t / d), 6 + 1.5 * (t / d), 0, 0); Su.upd(ft, C.position.length());
        rings.forEach((s) => (s.visible = false)); Su.cor.material.opacity = 0.8; Su.glow.material.opacity = 0.14; Su.sun.material.uniforms.gain.value = 1.3;
        gr.place(C, 0, 0, 0, 0);
        return [S, C, []];
      }
      // lose: whole Sun on the right, slowly turning; faint wavefronts of light leaving; 544.7 pull far back
      const kp = seg(ft, 544.7, 549.18);
      const dist = lerp(103, 90, seg(ft, 533.38, 544.7)) * Math.exp(Math.log(3.6) * kp);
      const ox = lerp(-660, -230, kp), oy = lerp(0, 20, kp);
      tgt.set(0, 0, 0);
      aim(C, tgt, dist, 14 + 1.3 * (ft - 533.38), 4 + 0.25 * (ft - 533.38), ox, oy); C.updateMatrixWorld(); Su.upd(ft, C.position.length(), 0.018);
      rings.forEach((s, i) => { const u = ((ft - 533.38) / 3.6 + i / 4) % 1; s.visible = true; s.scale.setScalar(R * (2.1 + 5 * u)); s.material.opacity = 0.11 * Math.sin(Math.PI * u) * (1 - kp); });
      Su.cor.material.opacity = 0.75; Su.str.material.opacity = 0.3; Su.sun.material.uniforms.gain.value = 2.4;
      gr.place(C, ox, oy, 0.5 * win(ft, 540.4, 544.8, 0.4), 0.3 * win(ft, 534.8, 540.6, 0.4));
      return [S, C, []];
    };
  }

  // ---- core (518.28-533.38): dive through the photosphere into the core; pp chain: 6 protons -> He-4 + 2 protons; balance 4 H vs He; 0.7 % leaves as light
  function sunCore(o) {
    const T0 = o.T0, R = 10, r = 0.12;
    const S = stage("void", { dust: 0, key: 1.4, rim: 0.8, hemi: 0.4 }), C = cam(30);
    S.background = new THREE.Color(0x000000);
    S.add(L3.stars(12, 4000));
    const Su = makeSun(S, R);
    const plasma = new THREE.Mesh(new THREE.SphereGeometry(R * 0.985, 64, 32), new THREE.ShaderMaterial({ uniforms: { op: { value: 1 }, time: { value: 0 } }, side: THREE.BackSide, depthWrite: false,
      vertexShader: "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform float op; uniform float time; varying vec3 vP;" + NOISE + "void main(){ vec3 q = normalize(vP); float n = fbm(q * 3.0 + vec3(time * 0.05, 0.0, -time * 0.04)); float m = fbm(q * 9.0 - vec3(0.0, time * 0.09, 0.0)); float v = 0.45 * n + 0.35 * m; vec3 c = mix(vec3(0.13, 0.025, 0.004), vec3(0.85, 0.36, 0.1), smoothstep(0.3, 0.85, v)); gl_FragColor = vec4(c * op, 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}" }));
    S.add(plasma);
    const heat = dots((() => { const a = [], hr = rnd(71); for (let i = 0; i < 900; i++) a.push((hr() - 0.5) * 9, (hr() - 0.5) * 6, (hr() - 0.5) * 9); return a; })(), 0xffc890, 0.06, 0.4, { maxPx: 14, tw: 1, fade: 0.2 }); S.add(heat);
    const warm = new THREE.PointLight(0xffb070, 0, 0, 2); S.add(warm);
    // the six protons of the pp-I chain (A2 and B2 turn into neutrons)
    const a = 0.083, P0 = (x, y, z) => new V3(x, y, z);
    const K = {
      A1: [[518.28, P0(-1.7, 0.7, 0.3)], [SU.pp1, P0(-0.97, 0.22, 0)], [SU.he3a, P0(-0.82, 0.08, 0.06)], [SU.he4, P0(-a, a, -a)]],
      A2: [[518.28, P0(-0.3, -0.45, -0.45)], [SU.pp1, P0(-0.735, 0.2, 0)], [SU.he3a, P0(-0.6, 0.12, -0.02)], [SU.he4, P0(-a, -a, a)]],
      A3: [[518.28, P0(-1.45, -0.95, 0.5)], [SU.he3a, P0(-0.72, 0.31, 0.1)], [SU.he4, P0(-0.33, 0.14, 0.02)], [524.6, P0(-2.3, 1.6, 0.8)]],
      B1: [[518.28, P0(1.6, -0.75, -0.2)], [SU.pp2, P0(0.97, -0.2, 0)], [SU.he3b, P0(0.82, -0.08, -0.05)], [SU.he4, P0(a, -a, -a)]],
      B2: [[518.28, P0(0.5, 0.62, 0.5)], [SU.pp2, P0(0.735, -0.18, 0)], [SU.he3b, P0(0.6, -0.12, 0.02)], [SU.he4, P0(a, a, a)]],
      B3: [[518.28, P0(1.35, 0.95, -0.45)], [SU.he3b, P0(0.72, -0.31, -0.1)], [SU.he4, P0(0.33, -0.14, -0.02)], [524.6, P0(2.3, -1.6, -0.8)]],
    };
    const bind = { A1: SU.pp1, A2: SU.pp1, A3: SU.he3a, B1: SU.pp2, B2: SU.pp2, B3: SU.he3b };
    const nuc = {};
    for (const k of Object.keys(K)) { const g = new THREE.Group(), p = X3.nucleon("p", r); g.add(p); if (k === "A2" || k === "B2") { const n = X3.nucleon("n", r); g.add(n); g.userData.n = n; } g.userData.p = p; S.add(g); nuc[k] = g; }
    const at = (keys, ft, out) => { if (ft <= keys[0][0]) return out.copy(keys[0][1]); for (let i = 1; i < keys.length; i++) if (ft < keys[i][0]) return out.lerpVectors(keys[i - 1][1], keys[i][1], smooth((ft - keys[i - 1][0]) / (keys[i][0] - keys[i - 1][0]))); return out.copy(keys[keys.length - 1][1]); };
    const ev = [[SU.pp1, P0(-0.85, 0.21, 0), 0.3], [SU.pp2, P0(0.85, -0.19, 0), 0.3], [SU.he3a, P0(-0.72, 0.17, 0.05), 0.32], [SU.he3b, P0(0.72, -0.17, -0.05), 0.32], [SU.he4, P0(0, 0, 0), 0.45]];
    const flashes = ev.map(() => { const s = glowSprite(0xfff0dc, 0.5, 0); S.add(s); return s; });
    // the accounting balance (sits low in the core space, lit by the plasma)
    const BP = new V3(0.4, -2.0, 2.7);
    const b = X3.balance({ s: 1 }); b.group.position.copy(BP); b.group.rotation.y = 0.2; S.add(b.group);
    const rb = 0.05, hB = X3.nucleus(2, 2, 13, rb); hB.position.set(0, hB.userData.R, 0); b.panR.add(hB);
    [[-0.055, -0.04], [0.055, -0.04], [0, 0.06], [0, -0.005]].forEach(([x, z], i) => { const m = X3.nucleon("p", rb); m.position.set(x, rb + (i === 3 ? rb * 1.6 : 0), z); b.panL.add(m); });
    const beam = addSprite(S, STREAM(), 1, 0); const lightUp = glowSprite(0xffe6c8, 0.8, 0); S.add(lightUp);
    const LDK = [[518.28, Math.log(10.85)], [518.95, Math.log(10.25)], [519.3, Math.log(9.3)], [519.95, Math.log(2.7)], [522.3, Math.log(2.2)], [523.4, Math.log(2.4)]];
    const tgt = new V3(), tmp = new V3(), hp = new V3(), gr = grade(S);
    return (t, d) => {
      const ft = T0 + t;
      Su.sun.material.uniforms.gain.value = 1.6;
      for (const k of Object.keys(K)) {
        const g = nuc[k]; at(K[k], ft, g.position);
        const jit = 0.03 * (1 - seg(ft, bind[k] - 0.3, bind[k])) + (k === "A3" || k === "B3" ? 0.02 * seg(ft, SU.he4, SU.he4 + 0.4) : 0);
        g.position.x += jit * Math.sin(ft * 9.1 + k.charCodeAt(0) + k.charCodeAt(1)); g.position.y += jit * Math.sin(ft * 7.7 + k.charCodeAt(1) * 2); g.position.z += jit * Math.cos(ft * 8.3 + k.charCodeAt(1));
        if (g.userData.n) { const isN = ft >= bind[k]; g.userData.n.visible = isN; g.userData.p.visible = !isN; }
      }
      ev.forEach(([te, pos, op], i) => { const f = flashes[i]; f.position.copy(pos); const k = seg(ft, te - 0.06, te + 0.08) * (1 - seg(ft, te + 0.12, te + 0.9)); f.material.opacity = op * k; f.scale.setScalar(lerp(0.3, i === 4 ? 1.6 : 1.0, seg(ft, te, te + 0.9))); });
      // plasma: bright orange-white during fusion, dims to ember for the balance, darker still for the overlay
      const pk = lerp(1, 0.5, seg(ft, 523.2, 524.8)) * lerp(1, 0.75, seg(ft, 529.2, 530.0));
      plasma.material.uniforms.op.value = 1.25 * pk; plasma.material.uniforms.time.value = ft; plasma.visible = pk > 0.003;
      heat.material.uniforms.time.value = ft; heat.material.uniforms.op.value = 0.35 * pk;
      warm.position.set(1.5, 2.5, 3); warm.intensity = 9 * pk;
      // balance: 4 H (left) heavier than He (right) by 0.7 % (tilt magnified)
      b.set(0.1 * seg(ft, 526.4, 528.8));
      hB.getWorldPosition(hp);
      const lk = win(ft, SU.light - 0.1, 533.6, 0.6);
      lightUp.position.copy(hp).add(tmp.set(0, 0.15, 0)); lightUp.material.opacity = 0.5 * lk * (0.85 + 0.15 * Math.sin(ft * 3)); lightUp.scale.setScalar(0.55 + 0.25 * seg(ft, SU.light, SU.light + 1.5));
      beam.position.copy(hp).add(tmp.set(1.5, 1.5, 0)); beam.scale.setScalar(2.6 + 1.0 * seg(ft, SU.light, 533.38)); beam.material.opacity = 0.42 * lk; beam.material.rotation = ft * 0.02;
      // camera: dive (log), orbit the fusion, then the balance on the right
      const kB = seg(ft, 523.2, 524.9), kO = seg(ft, 528.5, 529.7);
      const ld = ft < 523.4 ? (() => { let i = 1; while (i < LDK.length - 1 && ft > LDK[i][0]) i++; const p0 = LDK[i - 1], p1 = LDK[i]; return lerp(p0[1], p1[1], smooth((ft - p0[0]) / (p1[0] - p0[0]))); })() : Math.log(2.4);
      tgt.set(0, 0, 0).lerp(tmp.copy(BP).add(new V3(0, 0.85, 0)), kB);
      const dist = lerp(Math.exp(ld), 2.9, kB) + 0.8 * kO;
      const az = lerp(-10 + 4.5 * (ft - 518.28), 22, kB) + 10 * seg(ft, 524.9, 533.38), el = lerp(lerp(30, 10, seg(ft, 519, 520)), 9, kB);
      aim(C, tgt, dist, az + 48 * kO, el, -600 * kO, 30 * kO); C.near = Math.min(C.near, 0.004); C.updateProjectionMatrix(); C.updateMatrixWorld(); Su.upd(ft, dist);
      const inside = smooth((R * 1.0 - dist) / (R * 0.06)); plasma.material.uniforms.op.value *= inside; heat.material.uniforms.op.value *= inside;
      Su.cor.visible = Su.str.visible = Su.glow.visible = dist > R * 1.01; b.group.visible = ft > 522.6; for (const k in nuc) nuc[k].visible = ft < 524.2;
      gr.place(C, -600 * kO, 30 * kO, 0, 0.38 * win(ft, 529.6, 533.6, 0.4));
      const pins = [pin("hydrogen nuclei", nuc.B3.position, win(ft, 519.9, 521.1, 0.3), r + 0.03), pin("helium", tmp.set(0, a + r + 0.02, 0), win(ft, 522.4, 523.6, 0.3))];
      if (ft > 524) { pins.length = 0; pins.push(pin("4 hydrogen", b.panL.getWorldPosition(new V3()), win(ft, 524.6, 527.2, 0.4), 0.2), pin("helium", hp, win(ft, 524.9, 527.2, 0.4), 0.13), pin("tilt magnified", b.dial.getWorldPosition(new V3()), win(ft, 527.1, 529.5, 0.4), 0.02)); }
      return [S, C, pins];
    };
  }

  // ================================================================ lithium (Cockcroft & Walton 1932): p + Li-7 -> 2 He-4
  const LI = { impact: 351.24, scission: 351.98, fast: 354.4, balance: 357.9 };
  LABK.lithium = (o) => {
    const T0 = o.T0, r = 0.14;
    const S = stage("studio", { key: 2.2, rim: 1.3, hemi: 0.3, floorY: -1.75 }), C = cam(30);
    S.fog = new THREE.Fog(0x0b0c10, 9, 26);
    S.add(L3.dust(13, 900, 12));
    const bg = backdrop(S, 0x4a4552, 1), gr = grade(S);
    // nucleons: Li-7 (3p 4n) + the incoming proton -> compound (4p 4n) -> two He-4 (2p 2n)
    const li = nucPts(3, 4, 11, r), cmp = nucPts(4, 4, 12, r), he = nucPts(2, 2, 13, r);
    const types = ["p", "p", "p", "n", "n", "n", "n", "p"];
    const start = [...li.p, ...li.n].map((v) => v.clone());
    const contact = new V3(-li.R - r * 0.6, 0.06, 0.04); start.push(contact);
    const meshes = types.map((ty) => { const m = X3.nucleon(ty, r); S.add(m); return m; });
    // compound slots: protons to proton slots (nearest), neutrons to neutron slots
    const comp = new Array(8);
    const near = (src, slots) => { const used = []; src.forEach((i) => { let b = -1, bd = 1e9; slots.forEach((s, j) => { if (used.includes(j)) return; const d2 = start[i].distanceToSquared(s); if (d2 < bd) { bd = d2; b = j; } }); used.push(b); comp[i] = slots[b]; }); };
    near([0, 1, 2, 7], cmp.p); near([3, 4, 5, 6], cmp.n);
    const dirA = new V3(1, 0.12, -0.22).normalize(), dHe = he.R * 0.98;
    const side = new Array(8), slot = new Array(8);
    const pS = [0, 1, 2, 7].sort((a, b) => comp[a].dot(dirA) - comp[b].dot(dirA)), nS2 = [3, 4, 5, 6].sort((a, b) => comp[a].dot(dirA) - comp[b].dot(dirA));
    [[pS, he.p], [nS2, he.n]].forEach(([arr, sl]) => arr.forEach((i, k) => { side[i] = k < 2 ? -1 : 1; slot[i] = sl[k % 2]; }));
    const VHE = 0.95;
    const heC = (sd, tau, out) => out.copy(dirA).multiplyScalar(sd * (dHe + VHE * Math.max(0, tau)));
    const flash = glowSprite(0xffe2c0, 1, 0); S.add(flash);
    // warm streaks behind the helium (motion energy)
    const NT = 70, al = []; for (let h = 0; h < 2; h++) for (let k = 0; k < NT; k++) al.push(Math.pow(1 - k / NT, 1.5));
    const trail = dots(new Array(NT * 6).fill(0), 0xffdcb4, 0.3, 0, { maxPx: 50, al }); S.add(trail); const tPos = trail.geometry.attributes.position;
    // the accounting: brass balance on the floor, p + Li-7 (left) vs 2 He-4 (right); left heavier (magnified)
    const B = new V3(2.5, -1.75, 2.5), rb = 0.032;
    const floor = S.children.find((m) => m.isMesh && m.geometry.type === "PlaneGeometry" && m.receiveShadow); floor.material.transparent = true;
    const b = X3.balance({ s: 1 }); b.group.position.copy(B); b.group.rotation.y = -0.35; S.add(b.group);
    const liB = X3.nucleus(3, 4, 11, rb); liB.position.set(-0.03, liB.userData.R, 0); b.panL.add(liB);
    const pB = X3.nucleon("p", rb); pB.position.set(0.1, rb, 0.05); b.panL.add(pB);
    const heB = [X3.nucleus(2, 2, 13, rb), X3.nucleus(2, 2, 14, rb)]; heB.forEach((g, i) => { g.position.set(i ? 0.06 : -0.06, g.userData.R, 0); b.panR.add(g); });
    const tgt = new V3(), tmp = new V3(), cA = new V3(), cB = new V3(), w = new V3();
    const pose = (ft) => {
      const u = clamp((ft - 350.52) / (LI.impact - 350.52), 0, 1), kc = seg(ft, LI.impact, LI.impact + 0.45), tau = ft - LI.scission;
      const wob = ft > LI.impact && tau < 0 ? 0.16 * Math.sin((ft - LI.impact) * 17) * seg(ft, LI.impact, LI.impact + 0.15) : 0;
      for (let i = 0; i < 8; i++) {
        const m = meshes[i];
        if (i === 7 && ft < LI.impact) { m.position.set(lerp(-2.1, contact.x, u), lerp(0.2, contact.y, u), lerp(0.45, contact.z, u)); continue; }
        if (tau < 0) { m.position.lerpVectors(start[i], comp[i], kc); m.position.x *= 1 + wob; m.position.y /= Math.sqrt(1 + wob); m.position.z /= Math.sqrt(1 + wob); }
        else { heC(side[i], tau, w); m.position.copy(slot[i]).add(w); const kk = seg(ft, LI.scission - 0.25, LI.scission + 0.05); if (kk < 1) m.position.lerp(w.copy(comp[i]), 1 - kk); }
      }
      heC(1, tau, cA); heC(-1, tau, cB);
    };
    return (t, d) => {
      const ft = T0 + t;
      pose(ft);
      const tau = ft - LI.scission;
      const fl = seg(ft, LI.scission - 0.15, LI.scission + 0.2) * (1 - seg(ft, LI.scission + 0.3, LI.scission + 1.8));
      flash.material.opacity = 0.42 * fl; flash.scale.setScalar(lerp(1.2, 4.5, seg(ft, LI.scission, LI.scission + 1.8)));
      // streaks: strongest when "moving fast" (354.4-356)
      const tk = tau > 0 ? seg(ft, LI.scission + 0.1, LI.scission + 0.6) * (0.45 + 0.55 * win(ft, LI.fast - 0.2, 356.6, 0.5)) * (1 - seg(ft, 356.5, 357.2)) : 0;
      trail.visible = tk > 0.003; trail.material.uniforms.op.value = 0.3 * tk;
      if (trail.visible) for (let h = 0; h < 2; h++) for (let k = 0; k < NT; k++) { heC(h ? -1 : 1, Math.max(0, tau - k * 0.012), w); tPos.setXYZ(h * NT + k, w.x, w.y, w.z); }
      tPos.needsUpdate = true;
      b.set(0.07 * seg(ft, 358.3, 360.2));
      const fk = seg(ft, 356.6, 357.8); floor.visible = fk > 0.003; floor.material.opacity = fk; b.group.visible = ft > 356.1;
      // camera: collision -> track one helium -> swing to the balance (balance on the right; lower-left clear 358.0-362.6)
      const kA = seg(ft, LI.scission + 0.2, 353.4), kB = seg(ft, 356.4, 357.85);
      tgt.set(0, 0, 0).lerp(cA, kA).lerp(tmp.copy(B).add(new V3(0, 0.8, 0)), kB);
      const dist = lerp(lerp(lerp(4.4, 3.9, seg(ft, 350.52, LI.scission)), 3.3, kA), 3.6, kB) - 0.25 * seg(ft, 358.5, 362.88);
      const az = lerp(lerp(18, 26, seg(ft, 350.52, 352)), 40, seg(ft, 352, 357.1)) + (-8 - 40) * kB + 6 * seg(ft, 358.5, 362.88);
      aim(C, tgt, dist, az, lerp(9, 16, kB), -340 * kB, 40 * kB); C.updateMatrixWorld();
      bg.userData.place(C, tgt, 5 + 3 * kB, 12);
      gr.place(C, -340 * kB, 40 * kB, 0.55 * win(ft, 357.9, 362.9, 0.4), 0);
      const pins = [pin("lithium-7", tmp.set(0, li.R + 0.06, 0), win(ft, 350.62, 351.9, 0.25)), pin("helium-4", tmp.copy(cA).setY(cA.y + he.R + 0.06), win(ft, 352.4, 356.1, 0.4))];
      if (ft > 358) { pins.length = 0; pins.push(pin("lithium-7 + proton", liB.getWorldPosition(tmp), win(ft, 358.1, 360.9, 0.4), 0.17), pin("2 × helium-4", heB[0].getWorldPosition(new V3()), win(ft, 358.3, 360.9, 0.4), 0.14), pin("tilt magnified", b.dial.getWorldPosition(new V3()), win(ft, 360.8, 363.2, 0.4), 0.02)); }
      return [S, C, pins];
    };
  };

  // ================================================================ fission (Meitner & Frisch 1938)
  // U-235 + n -> Ba-141 + Kr-92 + 3 n. Nucleon counts are honest, so barium's RADIUS is ~86 % of uranium's (it has 60 % of the nucleons).
  const FI = { absorb: 401.6, barium: 404.0, scission: 422.54, ghost: 442.74 };
  LABK.fission = (o) => (o.mode === "mass" ? fissionMass(o) : o.mode === "match" ? fissionMatch(o) : fissionSplit(o));

  // uranium whose 235 instanced nucleons (+ the absorbed neutron mesh) can wobble, neck and split into Ba + Kr + 3 n
  function splittable(S, r) {
    const U = nucPts(92, 143, 5, r), Ba = nucPts(56, 85, 6, r), Kr = nucPts(36, 56, 7, r);
    S.add(U.g);
    const ip = U.g.children[0], inn = U.g.children[1];
    const absN = new V3(-0.62, 0.42, 0.66).normalize().multiplyScalar(U.R - r * 0.6), nAbs = X3.nucleon("n", r); S.add(nAbs);
    const RB = Ba.R, RK = Kr.R, dB = (RB + RK) * 92 / 233, dK = (RB + RK) * 141 / 233;
    const srcN = (i) => (i < 143 ? U.n[i] : absN);
    const byX = (arr, f) => arr.slice().sort((a, b) => f(a).x - f(b).x);
    const pIdx = byX([...Array(92).keys()], (i) => U.p[i]);
    const others = [...Array(143).keys()].sort((a, b) => Math.abs(srcN(a).x) - Math.abs(srcN(b).x));
    const emit = [143, others[0], others[1]];
    const nIdx = byX([...Array(144).keys()].filter((i) => !emit.includes(i)), srcN);
    // greedy nearest matching of source nucleons to fragment slots (slots placed at the touching configuration)
    function match(src, pos, slots, cx) {
      const used = new Array(slots.length).fill(false), out = {};
      for (const i of src.slice().sort((a, b) => Math.abs(pos(b).x - cx) - Math.abs(pos(a).x - cx))) {
        let best = -1, bd = 1e9; for (let j = 0; j < slots.length; j++) if (!used[j]) { const dd = pos(i).distanceToSquared(_s.copy(slots[j]).setX(slots[j].x + cx)); if (dd < bd) { bd = dd; best = j; } }
        used[best] = true; out[i] = slots[best];
      }
      return out;
    }
    const tP = Object.assign(match(pIdx.slice(0, 36), (i) => U.p[i], Kr.p, -dK), match(pIdx.slice(36), (i) => U.p[i], Ba.p, dB));
    const tN = Object.assign(match(nIdx.slice(0, 56), srcN, Kr.n, -dK), match(nIdx.slice(56), srcN, Ba.n, dB));
    const side = {}; pIdx.forEach((i, k) => (side["p" + i] = k < 36 ? -1 : 1)); nIdx.forEach((i, k) => (side["n" + i] = k < 56 ? -1 : 1));
    const eDir = [new V3(0.15, 0.92, 0.36), new V3(-0.2, -0.86, 0.47), new V3(0.25, 0.3, -0.92)].map((v) => v.normalize());
    const cB = new V3(), cK = new V3(), p = new V3(), q = new V3();
    const D = (tau) => (tau <= 0 ? 0 : 0.75 * tau * tau / (tau + 0.6));
    // e: quadrupole wobble, k: 0..1 towards the touching fragments, tau: seconds after scission
    function pose(e, k, tau) {
      const Dd = D(tau); cB.set(dB + Dd * 92 / 233, 0, 0); cK.set(-(dK + Dd * 141 / 233), 0, 0);
      const fw = tau > 0 ? 0.12 * Math.exp(-tau / 1.3) * Math.cos(tau * 6.5) : 0.12 * k;    // fragments born stretched, relaxing
      const sx = 1 + e, syz = 1 / Math.sqrt(1 + e);
      const place = (src, slot, sd) => {
        p.set(src.x * sx, src.y * syz, src.z * syz);
        q.copy(slot); q.x *= 1 + fw; q.y /= Math.sqrt(1 + fw); q.z /= Math.sqrt(1 + fw); q.add(sd < 0 ? cK : cB);
        return p.lerp(q, k);
      };
      for (let i = 0; i < 92; i++) setInst(ip, i, place(U.p[i], tP[i], side["p" + i]), r);
      for (let i = 0; i < 143; i++) {
        const ei = emit.indexOf(i);
        if (ei >= 0) { p.set(U.n[i].x * sx, U.n[i].y * syz, U.n[i].z * syz).lerp(_s.set(0, U.n[i].y * 0.5, U.n[i].z * 0.5), k).addScaledVector(eDir[ei], tau > 0 ? 4.2 * tau : 0); setInst(inn, i, p, r); }
        else setInst(inn, i, place(U.n[i], tN[i], side["n" + i]), r);
      }
      nAbs.position.set(absN.x * sx, absN.y * syz, absN.z * syz).lerp(_s.set(0, absN.y * 0.5, absN.z * 0.5), k).addScaledVector(eDir[0], tau > 0 ? 4.2 * tau : 0);
      ip.instanceMatrix.needsUpdate = inn.instanceMatrix.needsUpdate = true;
    }
    const nPos = (j, out) => (j === 0 ? out.copy(nAbs.position) : out.setFromMatrixPosition((inn.getMatrixAt(emit[j], _m4), _m4)));
    return { U, Ba, Kr, pose, cB, cK, nAbs, absN, nPos, R: U.R, RB, RK };
  }

  // ---- barium (397.10-407.68) and split (419.60-432.88)
  function fissionSplit(o) {
    const mode = o.mode, T0 = o.T0, r = 0.1;
    const S = stage("void", { dust: 0, key: 2.4, rim: 1.2, hemi: 0.3 }), C = cam(30);
    const bg = backdrop(S, 0x4b4652, 1), gr = grade(S), bgB = backdrop(S, 0x4e4244, 0), bgK = backdrop(S, 0x4e4244, 0);
    const N = splittable(S, r);
    let baG = null;
    if (mode === "barium") { baG = X3.nucleus(56, 85, 6, r); baG.position.set(3.0, 0, 0); S.add(baG); }
    const flash = glowSprite(0xffe2c0, 1, 0), haloB = glowSprite(0xffd8b0, 1, 0), haloK = glowSprite(0xffd8b0, 1, 0); S.add(flash, haloB, haloK);
    const nGlow = [0, 1, 2].map(() => { const g = glowSprite(0xfff0e0, 0.5, 0); S.add(g); return g; });
    const tgt = new V3(), tmp = new V3();
    return (t, d) => {
      const ft = T0 + t, pins = [];
      if (mode === "barium") {
        // the slow neutron drifts in and is absorbed; a faint shiver; barium revealed beside it
        const a = seg(ft, 397.1, FI.absorb);
        N.nAbs.position.lerpVectors(tmp.set(-2.5, 0.5, 1.3), N.absN, a);
        N.pose(0.035 * seg(ft, FI.absorb, FI.absorb + 0.4) * Math.exp(-Math.max(0, ft - FI.absorb) / 2.5) * Math.sin((ft - FI.absorb) * 7), 0, 0);
        if (ft < FI.absorb) N.nAbs.position.lerpVectors(tmp.set(-2.5, 0.5, 1.3), N.absN, a);
        const k = seg(ft, 403.3, 405.2);
        tgt.set(lerp(-0.9, 1.5, k), 0, 0);
        aim(C, tgt, lerp(lerp(6.4, 5.6, seg(ft, 397.1, 403.3)), 7.6, k) - 0.7 * seg(ft, 405.2, 407.68), lerp(12, 22, seg(ft, 397.1, 403.3)) + 8 * k + 7 * seg(ft, 405.0, 407.68), 10 + 3 * k + 2 * seg(ft, 405.0, 407.68), 0, 0);
        pins.push(pin("uranium", tmp.set(-0.15, N.R + 0.05, 0), win(ft, 401.9, 407.9, 0.4)));
        pins.push(pin("barium", tmp.set(3.0, baG.userData.R - 0.02, 0), win(ft, 404.1, 407.9, 0.4)));
        bg.userData.place(C, tgt, 6, 14);
        gr.place(C, 0, 0, 0, 0);
        return [S, C, pins];
      }
      // split: wobble -> neck -> scission at 422.54 -> fragments fly apart (Kr faster: momentum), 3 neutrons, soft warm light
      const tau = ft - FI.scission;
      const wob = seg(ft, 419.6, 420.5) * (1 - seg(ft, 421.6, 422.4)) * 0.13 * Math.sin((ft - 419.6) * 6.2);
      const k = smooth((ft - 420.6) / (FI.scission - 420.6)) ** 1.4;
      N.pose(wob, k, tau);
      const mid = (N.cB.x + N.cK.x) / 2, half = (N.cB.x - N.cK.x) / 2;
      tgt.set(mid, 0, 0);
      const dist = Math.max(lerp(5.0, 5.6, seg(ft, 419.6, 422.5)), (half + N.RB) / (0.8 * 0.477));
      aim(C, tgt, dist, lerp(24, 4, seg(ft, 419.6, 428.0)), lerp(11, 6, seg(ft, 421, 428)), 0, 0);
      const fl = tau > -0.12 ? seg(ft, FI.scission - 0.12, FI.scission + 0.25) * (1 - seg(ft, FI.scission + 0.4, FI.scission + 2.2)) : 0;
      flash.position.set(0, 0, 0); flash.material.opacity = 0.5 * fl; flash.scale.setScalar(lerp(1.4, 6.5, seg(ft, FI.scission, FI.scission + 2.2)));
      const hk = tau > 0 ? Math.exp(-tau / 2.4) * seg(ft, FI.scission, FI.scission + 0.3) : 0;
      haloB.position.copy(N.cB); haloK.position.copy(N.cK); haloB.material.opacity = haloK.material.opacity = 0.28 * hk; haloB.scale.setScalar(N.RB * 4); haloK.scale.setScalar(N.RK * 4);
      nGlow.forEach((g, j) => { N.nPos(j, g.position); g.material.opacity = tau > 0 ? 0.5 * Math.exp(-tau / 1.2) : 0; });
      pins.push(pin("barium", tmp.copy(N.cB).setY(N.RB + 0.05), win(ft, 424.7, 428.4, 0.4)));
      pins.push(pin("krypton", tmp.copy(N.cK).setY(N.RK + 0.05), win(ft, 424.9, 428.4, 0.4)));
      bg.userData.place(C, tgt, dist * 1.2, dist * 2.8); bg.material.opacity = 1 - 0.55 * seg(ft, 426.5, 428.6);
      const sideK = seg(ft, 424, 428); bgB.userData.place(C, N.cB, N.RB * 6, N.RB * 12); bgK.userData.place(C, N.cK, N.RK * 6, N.RK * 12); bgB.material.opacity = bgK.material.opacity = 0.9 * sideK;
      gr.place(C, 0, 0, 0, 0.3 * win(ft, 428.5, 433.2, 0.4));
      return [S, C, pins];
    };
  }

  // ---- mass (432.88-446.82): U-235 + n on the left pan, Ba + Kr + 3 n on the right; right pan rises a hair (magnified); 442.74 ghost of 1/5 proton
  function fissionMass(o) {
    const T0 = o.T0, r = 0.0145;
    const S = stage("studio", { key: 2.1, rim: 1.2, hemi: 0.25, floorY: -1.2 }), C = cam(30);
    bench(S, 14, 6); const bg = backdrop(S, 0x2a2e36, 1);
    const b = X3.balance({ s: 1.25 }); S.add(b.group);
    const u = X3.nucleus(92, 143, 5, r); u.position.y = u.userData.R; b.panL.add(u);
    const n0 = X3.nucleon("n", r); n0.position.set(0.075, r, 0.135); b.panL.add(n0);
    const ba = X3.nucleus(56, 85, 6, r); ba.position.set(0.056, ba.userData.R, -0.097); b.panR.add(ba);
    const kr = X3.nucleus(36, 56, 7, r); kr.position.set(-0.112, kr.userData.R, 0); b.panR.add(kr);
    [[0.06, 0.135], [0.095, 0.15], [0.07, 0.172]].forEach(([x, z]) => { const m = X3.nucleon("n", r); m.position.set(x, r, z); b.panR.add(m); });
    // the ghost: a fifth of a proton's mass (radius x 0.585), translucent warm
    const gMat = X3.mats.proton.clone(); gMat.transparent = true; gMat.depthWrite = false;
    const ghost = new THREE.Group(), gr0 = r * Math.cbrt(0.2);
    ghost.add(ball(gMat, gr0), ball(rimMat(0xffd2b0, 0.9, 1.6), gr0 * 1.02)); const gGlow = glowSprite(0xffe0c0, gr0 * 6, 0); ghost.add(gGlow);
    b.panR.add(ghost);
    const tgt = new V3(), tmp = new V3(), pR = new V3();
    return (t, d) => {
      const ft = T0 + t;
      b.set(0.055 * seg(ft, 437.2, 440.8));
      const gk = seg(ft, FI.ghost - 0.2, FI.ghost + 0.8);
      ghost.visible = gk > 0.003; ghost.position.set(0, 0.29 + 0.008 * Math.sin(ft * 1.7), 0);
      gMat.opacity = 0.42 * gk; ghost.children[1].material.uniforms.op.value = 0.9 * gk; gGlow.material.opacity = 0.35 * gk;
      b.panR.getWorldPosition(pR);
      const k1 = seg(ft, 432.88, 441.6), k2 = seg(ft, 441.6, 444.2);
      tgt.set(lerp(0, 0, k1), lerp(1.05, 0.95, k1), 0).lerp(tmp.copy(pR).setY(pR.y + 0.17), k2);
      aim(C, tgt, lerp(lerp(4.2, 3.4, k1), 1.05, k2) - 0.08 * seg(ft, 444.2, 446.82), lerp(-14, 10, k1) + 20 * k2 + 3 * seg(ft, 444.2, 446.8), lerp(8, 10, k1) + 6 * k2, 0, 0);
      bg.userData.place(C, tgt, 4, 8);
      const pins = [pin("≈ 1/5 of a proton", tmp.copy(ghost.getWorldPosition(tmp)), win(ft, FI.ghost + 0.4, 447.5, 0.4), gr0 * 1.3)];
      pins.push(pin("uranium", u.getWorldPosition(new V3()), win(ft, 433.4, 439.0, 0.4), u.userData.R + 0.02));
      pins.push(pin("barium + krypton", ba.getWorldPosition(new V3()), win(ft, 434.2, 439.0, 0.4), ba.userData.R + 0.03));
      pins.push(pin("tilt magnified", b.dial.getWorldPosition(new V3()), win(ft, 438.9, 441.6, 0.4), 0.03));
      return [S, C, pins];
    };
  }

  // ---- match (456.12-460.68): fragments flying apart; the ghost between them dissolves into the light they carry
  function fissionMatch(o) {
    const T0 = o.T0, r = 0.1;
    const S = stage("void", { dust: 0, key: 2.4, rim: 1.2, hemi: 0.3 }), C = cam(30);
    const bg = backdrop(S, 0x4b4652, 1), bgB = backdrop(S, 0x5a4c4e, 0.9), bgK = backdrop(S, 0x4e4244, 0.9);
    const ba = X3.nucleus(56, 85, 6, r), kr = X3.nucleus(36, 56, 7, r); S.add(ba, kr);
    const gMat = X3.mats.proton.clone(); gMat.transparent = true; gMat.depthWrite = false;
    const g0 = r * Math.cbrt(0.2), ghost = new THREE.Group(); ghost.add(ball(gMat, g0), ball(rimMat(0xffd2b0, 0.9, 1.6), g0 * 1.02)); S.add(ghost);
    const gGlow = glowSprite(0xffe0c0, g0 * 7, 0); S.add(gGlow);
    const hB = glowSprite(0xffd8b0, 2.6, 0), hK = glowSprite(0xffd8b0, 2.3, 0); S.add(hB, hK);
    // light streaming from the ghost to each fragment
    const NS = 260, sp = new Array(NS * 3).fill(0), sr = rnd(91), sd = [];
    for (let i = 0; i < NS; i++) sd.push([sr(), (sr() - 0.5) * 0.5, (sr() - 0.5) * 0.5, i % 2 ? 1 : -1]);
    const stream = dots(sp, 0xffe2c0, 0.2, 0, { maxPx: 34 }); S.add(stream); const sPos = stream.geometry.attributes.position;
    const tgt = new V3(), tmp = new V3();
    return (t, d) => {
      const ft = T0 + t, xB = 1.25 + 0.42 * (ft - 456.12), xK = -(1.25 * 1.2 + 0.64 * (ft - 456.12));
      ba.position.set(xB, 0, 0); kr.position.set(xK, 0, 0);
      const dis = seg(ft, 457.0, 459.4);
      ghost.visible = dis < 0.997; ghost.scale.setScalar(1 - 0.6 * dis); gMat.opacity = 0.5 * (1 - dis); ghost.children[1].material.uniforms.op.value = 0.9 * (1 - dis);
      gGlow.material.opacity = 0.45 * win(ft, 456.3, 459.8, 0.8);
      const sk = win(ft, 457.0, 460.4, 0.7);
      stream.material.uniforms.op.value = 0.75 * sk;
      for (let i = 0; i < NS; i++) { const [ph, oy, oz, s] = sd[i], u = (ph + (ft - 457) * 0.55) % 1, x = s > 0 ? xB : xK, e = u * u * (3 - 2 * u); sPos.setXYZ(i, x * e, oy * Math.sin(Math.PI * u) * 0.8, oz * Math.sin(Math.PI * u) * 0.8); }
      sPos.needsUpdate = true;
      const hk = 0.12 + 0.22 * seg(ft, 457.4, 459.8);
      hB.position.copy(ba.position); hK.position.copy(kr.position); hB.material.opacity = hK.material.opacity = hk;
      tgt.set((xB + xK) / 2, 0, 0);
      aim(C, tgt, 5.2 + 1.3 * (ft - 456.12), lerp(-16, -4, seg(ft, 456.12, 460.68)), 8, 0, 0);
      bg.userData.place(C, tgt, 7, 18); bgB.userData.place(C, ba.position, 4, 7.5); bgK.userData.place(C, kr.position, 4, 6.8);
      return [S, C, []];
    };
  }
})();
