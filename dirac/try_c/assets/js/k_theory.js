/* k_theory.js — group F ("The Dirac Equation"): LABK.theories (fast, clock, mass, quantum, wave, spectrum, slow), LABK.gold (atom, bars).
   LABK.name = (o) => (t, d) => [scene, camera, pins]; ft = o.T0 + t is film time. Pure functions of t; only the shot's own mode is built.
   Shared props (electron, nucleon, nucleus) come from window.X3; X3.mats are never mutated here. */
(function () {
  const { THREE, M, P, seg, smooth, lerp, clamp, rnd, cam, stage, canvasTex, glowSprite, W, H, D2R } = L3;
  const V3 = THREE.Vector3, TAU = Math.PI * 2;

  // ---------------------------------------------------------------- helpers
  const win = (t, a, b, f) => { f = f || 0.4; return seg(t, a, a + f) * (1 - seg(t, b - f, b)); };
  // orbit camera around p; ox/oy shift the picture in pixels (positive ox = subject moves LEFT, positive oy = subject moves UP)
  function aim(C, p, dist, az, el, ox, oy) {
    L3.orbit(C, p.x, p.y, p.z, dist, az, el);
    C.near = Math.max(0.005, dist * 0.02); C.far = dist * 400;
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
  const VS_NV = "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }";
  // feathered additive glow body (bright facing the camera, nothing at the silhouette)
  const softHalo = (c, op) => new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color(c) }, op: { value: op } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexShader: VS_NV,
    fragmentShader: "uniform vec3 col; uniform float op; varying vec3 vN; varying vec3 vV; void main(){ float f = abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(col * op * f * f * f, 1.0); }" });

  // soft points: clamped screen size, near fade, twinkle, slow drift (jit/js) and a travelling wave (wk, wamp, wsp)
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
      uniforms: { map: { value: DOT() }, col: { value: new THREE.Color(color) }, op: { value: op }, size: { value: size }, maxPx: { value: o.maxPx || 80 }, fade: { value: o.fade || 0 }, time: { value: 0 }, tw: { value: o.tw || 0 },
        jit: { value: o.jit || 0 }, js: { value: o.js || 1 }, wk: { value: new V3(1, 0, 0) }, wamp: { value: 0 }, wsp: { value: 3 } },
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: `uniform float size; uniform float maxPx; uniform float fade; uniform float time; uniform float tw; uniform float jit; uniform float js; uniform vec3 wk; uniform float wamp; uniform float wsp;
        attribute float ph; attribute float al; varying float vA;
        void main(){
          vec3 p = position; float tt = time * js;
          p += jit * vec3(sin(tt * (0.37 + 0.3 * fract(ph * 3.1)) + ph), sin(tt * (0.29 + 0.3 * fract(ph * 5.7)) + ph * 1.7), sin(tt * (0.33 + 0.3 * fract(ph * 2.3)) + ph * 2.9));
          float w = sin(dot(p, wk) - time * wsp);
          p += normalize(wk) * (wamp * 0.035 * w);
          vec4 mv = modelViewMatrix * vec4(p, 1.0); float d = -mv.z; float px = size * 540.0 / max(d, 1e-9); gl_PointSize = min(px, maxPx);
          vA = al * (fade > 0.0 ? smoothstep(fade, fade * 3.0, d) : 1.0) * (1.0 - tw + tw * (0.5 + 0.5 * sin(time * (1.3 + fract(ph * 7.1) * 2.0) + ph))) * (1.0 + wamp * 0.9 * w);
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: "uniform sampler2D map; uniform vec3 col; uniform float op; varying float vA; void main(){ vec4 t = texture2D(map, gl_PointCoord); gl_FragColor = vec4(col * t.a * op * max(vA, 0.0), 1.0); }",
    });
    return new THREE.Points(g, m);
  }
  // hydrogen-like orbital samples: "1s" r^2 e^(-2r/a); "2p" r^4 e^(-r/a) cos^2(theta) about `axis` ("x"|"y"|"z")
  function orbPts(seed, n, kind, a, axis, out) {
    const r = rnd(seed); out = out || [];
    const lg = (k) => { let p = 1; for (let i = 0; i < k; i++) p *= r() + 1e-7; return -Math.log(p); };
    for (let i = 0; i < n; i++) {
      let x, y, z;
      for (;;) { const u = r() * 2 - 1, th = r() * TAU, q = Math.sqrt(1 - u * u); x = q * Math.cos(th); y = u; z = q * Math.sin(th);
        if (kind !== "2p") break; const c = axis === "x" ? x : axis === "z" ? z : y; if (r() < c * c) break; }
      const rad = kind === "2p" ? a * lg(5) : a * 0.5 * lg(3);
      out.push(x * rad, y * rad, z * rad);
    }
    return out;
  }
  // camera-attached grade: darkens the lower-left (line/cap overlays) and/or the centre block (big/eq overlays)
  let _gll = null, _gcc = null;
  const GLL = () => _gll || (_gll = canvasTex(512, 288, (g, w, h) => { const gr = g.createRadialGradient(w * 0.2, h * 1.0, 0, w * 0.2, h * 1.0, w * 0.6); gr.addColorStop(0, "rgba(0,0,0,0.85)"); gr.addColorStop(0.55, "rgba(0,0,0,0.5)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
  const GCC = () => _gcc || (_gcc = canvasTex(512, 288, (g, w, h) => { g.save(); g.translate(w / 2, h * 0.475); g.scale(1, 0.5); const gr = g.createRadialGradient(0, 0, 0, 0, 0, w * 0.38); gr.addColorStop(0, "rgba(0,0,0,0.85)"); gr.addColorStop(0.6, "rgba(0,0,0,0.55)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(-w, -h * 2, 2 * w, 4 * h); g.restore(); }));
  function grade(S) {
    const mk = (map) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map, transparent: true, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = 999; S.add(m); return m; };
    const ll = mk(GLL()), cc = mk(GCC()), v = new V3();
    return { place(C, kll, kcc) {
      C.updateMatrixWorld();
      const dz = C.near * 4, h = 2 * dz * Math.tan(C.fov * D2R / 2), w = h * C.aspect;
      const ox = C.view && C.view.enabled ? C.view.offsetX : 0, oy = C.view && C.view.enabled ? C.view.offsetY : 0;
      for (const [m, k] of [[ll, kll], [cc, kcc]]) {
        m.visible = k > 0.002; m.material.opacity = k;
        v.set((ox / W) * w, -(oy / H) * h, -dz).applyMatrix4(C.matrixWorld);
        m.position.copy(v); m.quaternion.copy(C.quaternion); m.scale.set(w * 1.002, h * 1.002, 1);
      }
    } };
  }
  const spot = (S, col, inten, pos, tgt, ang, pen, shadow) => {
    const l = new THREE.SpotLight(col, inten, 0, ang || 0.5, pen === undefined ? 0.8 : pen, 2); l.position.copy(pos); l.target.position.copy(tgt); S.add(l, l.target);
    if (shadow) { l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.bias = -0.0002; l.shadow.radius = 5; l.shadow.camera.near = 0.3; l.shadow.camera.far = 40; }
    return l;
  };
  const shade = (o) => { o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } }); return o; };
  // noise canvas (grain / brushed metal / plaster)
  function noiseTex(w, h, base, amt, seed, streak) {
    return canvasTex(w, h, (c) => {
      c.fillStyle = base; c.fillRect(0, 0, w, h); const r = rnd(seed || 3);
      for (let i = 0; i < w * h / 6; i++) { const k = r(); c.fillStyle = k > 0.5 ? `rgba(255,255,255,${amt * r()})` : `rgba(0,0,0,${amt * r()})`; if (streak) c.fillRect(r() * w, r() * h, 4 + r() * streak, 1); else c.fillRect(r() * w, r() * h, 1 + r() * 2, 1 + r() * 2); }
    });
  }

  // ---------------------------------------------------------------- shared real materials (own instances)
  const brassW = new THREE.MeshStandardMaterial({ color: 0xd2b26e, metalness: 1, roughness: 0.22 });
  const brassDk = new THREE.MeshStandardMaterial({ color: 0x9c7c45, metalness: 1, roughness: 0.34 });
  const blued = new THREE.MeshStandardMaterial({ color: 0x23335a, metalness: 0.85, roughness: 0.26 });
  const walnut = new THREE.MeshStandardMaterial({ color: 0x4a2c1a, metalness: 0, roughness: 0.5 });
  const steelP = new THREE.MeshStandardMaterial({ color: 0xa9aeb5, metalness: 1, roughness: 0.16 });
  const blackEnamel = new THREE.MeshStandardMaterial({ color: 0x111215, metalness: 0.2, roughness: 0.32 });

  // ---------------------------------------------------------------- pocket watch (face +z, centre at origin, radius 0.5)
  let _dial = null;
  const DIAL = () => _dial || (_dial = canvasTex(1024, 1024, (c, w) => {
    const R = w / 2, g = c.createRadialGradient(R * 0.8, R * 0.7, R * 0.1, R, R, R); g.addColorStop(0, "#f5f0e4"); g.addColorStop(1, "#ddd3bd"); c.fillStyle = g; c.fillRect(0, 0, w, w);
    c.translate(R, R); c.strokeStyle = "#1c1a17"; c.fillStyle = "#1c1a17";
    c.lineWidth = 3; c.beginPath(); c.arc(0, 0, R * 0.93, 0, TAU); c.stroke(); c.beginPath(); c.arc(0, 0, R * 0.86, 0, TAU); c.stroke();
    for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; c.lineWidth = i % 5 ? 3 : 8; c.beginPath(); c.moveTo(Math.sin(a) * R * 0.86, -Math.cos(a) * R * 0.86); c.lineTo(Math.sin(a) * R * (i % 5 ? 0.93 : 0.95), -Math.cos(a) * R * (i % 5 ? 0.93 : 0.95)); c.stroke(); }
    const RN = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"];
    c.font = "86px Georgia, 'Times New Roman', serif"; c.textAlign = "center"; c.textBaseline = "middle";
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; c.save(); c.translate(Math.sin(a) * R * 0.7, -Math.cos(a) * R * 0.7); c.rotate(a); c.fillText(RN[i], 0, 0); c.restore(); }
    c.font = "italic 30px Georgia, serif"; c.fillStyle = "rgba(28,26,23,.75)"; c.fillText("Chronometer", 0, R * 0.34);
    const v = c.createRadialGradient(0, 0, R * 0.6, 0, 0, R); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(60,40,10,.18)"); c.fillStyle = v; c.fillRect(-R, -R, w, w);
  }));
  const handShape = (len, wid) => { const s = new THREE.Shape(); s.moveTo(-wid * 0.35, -len * 0.12); s.lineTo(wid * 0.35, -len * 0.12); s.lineTo(wid * 0.5, len * 0.55); s.lineTo(wid, len * 0.72); s.lineTo(0, len); s.lineTo(-wid, len * 0.72); s.lineTo(-wid * 0.5, len * 0.55); s.closePath(); return new THREE.ShapeGeometry(s); };
  const W_HOUR = handShape(0.24, 0.028), W_MIN = handShape(0.36, 0.022);
  const W_SEC = (() => { const s = new THREE.Shape(); s.moveTo(-0.008, -0.11); s.lineTo(0.008, -0.11); s.lineTo(0.0045, 0.43); s.lineTo(-0.0045, 0.43); s.closePath(); return new THREE.ShapeGeometry(s); })();
  const W_CASE = new THREE.LatheGeometry([[0, -0.075], [0.36, -0.075], [0.46, -0.064], [0.5, -0.035], [0.512, 0], [0.505, 0.03], [0.488, 0.054], [0.466, 0.066], [0.452, 0.064], [0.45, 0.056]].map(([x, y]) => new THREE.Vector2(x, y)), 96);
  const crystalM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.03, transparent: true, opacity: 0.16, clearcoat: 1, clearcoatRoughness: 0.02, envMapIntensity: 2.4, depthWrite: false });
  function watch() {
    const g = new THREE.Group();
    const cs = new THREE.Mesh(W_CASE, brassW); cs.rotation.x = Math.PI / 2; g.add(cs);
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.452, 96), new THREE.MeshStandardMaterial({ map: DIAL(), roughness: 0.3, metalness: 0 })); dial.position.z = 0.056; g.add(dial);
    const hh = new THREE.Mesh(W_HOUR, blued); hh.position.z = 0.06; hh.rotation.z = -(10 + 8 / 60) / 12 * TAU; g.add(hh);
    const mh = new THREE.Mesh(W_MIN, blued); mh.position.z = 0.062; mh.rotation.z = -8 / 60 * TAU; g.add(mh);
    const sh = new THREE.Mesh(W_SEC, blued); sh.position.z = 0.065; g.add(sh);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.01, 24), brassW); cap.rotation.x = Math.PI / 2; cap.position.z = 0.068; g.add(cap);
    const th = Math.asin(0.455 / 2), cry = new THREE.Mesh(new THREE.SphereGeometry(2, 64, 8, 0, TAU, 0, th), crystalM); cry.rotation.x = Math.PI / 2; cry.position.z = 0.062 - 2 * Math.cos(th); g.add(cry);
    const pend = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.045, 0.07, 32), brassW); pend.position.y = 0.535; g.add(pend);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.06, 40), brassDk); crown.position.y = 0.595; g.add(crown);
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.115, 0.014, 12, 64), brassW); bow.position.y = 0.66; g.add(bow);
    shade(g); cry.castShadow = false;
    return { g, sec: (s) => { sh.rotation.z = -s / 60 * TAU; } };
  }
  // walnut watch stand with a brass hook; the watch hangs from its bow. returns { g, watch }
  function watchStand() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.07, 0.42), walnut); base.position.y = 0.035; g.add(base);
    const post = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.03, 1.33, 24), brassW); post.position.set(0, 0.715, -0.15); g.add(post);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.2, 16), brassW); arm.rotation.x = Math.PI / 2; arm.position.set(0, 1.36, -0.06); g.add(arm);
    const w = watch(); w.g.position.set(0, 1.36 - 0.775, 0.0); g.add(w.g);
    shade(g); return { g, watch: w };
  }
  // 15 cm steel rule (3 units long along x), marks on top
  let _rule = null;
  const RULE = () => _rule || (_rule = canvasTex(2048, 192, (c, w, h) => {
    const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#d9dce0"); g.addColorStop(0.5, "#c3c7cc"); g.addColorStop(1, "#d2d5d9"); c.fillStyle = g; c.fillRect(0, 0, w, h);
    const r = rnd(9); for (let i = 0; i < 2500; i++) { c.fillStyle = `rgba(${r() > 0.5 ? 255 : 0},${r() > 0.5 ? 255 : 0},255,${0.04 * r()})`; c.fillRect(r() * w, r() * h, 30 + r() * 120, 1); }
    c.fillStyle = "#24262a"; const x0 = 40, sc = (w - 80) / 150;
    for (let mm = 0; mm <= 150; mm++) { const L = mm % 10 === 0 ? 70 : mm % 5 === 0 ? 48 : 30; c.fillRect(x0 + mm * sc - 1.5, 0, 3, L); }
    c.font = "bold 40px Arial, sans-serif"; c.textAlign = "center"; for (let cm = 1; cm < 15; cm++) c.fillText(String(cm), x0 + cm * 10 * sc, 120);
  }));
  function rule() {
    const m = new THREE.Mesh(new THREE.BoxGeometry(3.06, 0.014, 0.29), [steelP, steelP, new THREE.MeshStandardMaterial({ map: RULE(), metalness: 1, roughness: 0.3 }), steelP, steelP, steelP]);
    m.castShadow = m.receiveShadow = true; return m;
  }

  // ================================================================ theories / fast
  function buildFast(o) {
    const T0 = o.T0, S = stage("studio", { key: 1.7, hemi: 0.45, rim: 1.4, floorY: -0.7 }), C = cam(30);
    S.fog = new THREE.Fog(0x1f2530, 7, 30);
    // far backdrop: a soft cool glow where the rail vanishes (depth, keeps the frame from going murky)
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(90, 40), new THREE.MeshBasicMaterial({ map: canvasTex(256, 128, (c, w, h) => { const g = c.createRadialGradient(w * 0.5, h * 0.55, 0, w * 0.5, h * 0.55, w * 0.55); g.addColorStop(0, "#2e3542"); g.addColorStop(0.35, "#1f2530"); g.addColorStop(1, "#0b0c10"); c.fillStyle = g; c.fillRect(0, 0, w, h); }), fog: false, depthWrite: false }));
    bd.renderOrder = -5; S.add(bd);
    const x0 = -30, L = 150, rodG = new THREE.CylinderGeometry(0.018, 0.018, L, 14); rodG.rotateZ(Math.PI / 2);
    const rail = new THREE.MeshStandardMaterial({ color: 0x737980, metalness: 1, roughness: 0.2 });
    for (const z of [-0.06, 0.06]) { const m = new THREE.Mesh(rodG, rail); m.position.set(x0 + L / 2, 0, z); m.castShadow = true; S.add(m); }
    // black lacquered beam under the rods, walnut sleepers every 1.5, brass posts every 3
    const beam = new THREE.Mesh(new THREE.BoxGeometry(L, 0.06, 0.26), new THREE.MeshStandardMaterial({ color: 0x0e0f12, roughness: 0.55, metalness: 0, envMapIntensity: 0.25 })); beam.position.set(x0 + L / 2, -0.07, 0); beam.receiveShadow = beam.castShadow = true; S.add(beam);
    const nS = Math.floor(L / 1.5), sl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.07, 0.035, 0.22), brassDk, nS), mm = new THREE.Matrix4();
    for (let i = 0; i < nS; i++) { mm.makeTranslation(x0 + i * 1.5, -0.025, 0); sl.setMatrixAt(i, mm); } sl.castShadow = true; S.add(sl);
    const nP = Math.floor(L / 3), po = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.028, 0.034, 0.6, 16), brassW, nP);
    for (let i = 0; i < nP; i++) { mm.makeTranslation(x0 + i * 3 + 0.75, -0.4, 0); po.setMatrixAt(i, mm); } po.castShadow = true; S.add(po);
    // the chaser: the film's electron, rolling on the rods
    const rb = 0.075, ball = X3.electron(rb); ball.position.y = Math.sqrt((rb + 0.018) ** 2 - 0.06 ** 2); S.add(ball);
    // light pulse: warm-white core + soft body + long fading tail, and a real light that rakes the rails
    const pulse = new THREE.Group(); pulse.position.y = 0.13; S.add(pulse);
    // streak sprite: bright head on the right, long fading tail; rotated each frame to lie along the rail on screen
    const stT = canvasTex(512, 64, (c, w, h) => { const g = c.createLinearGradient(0, 0, w, 0); g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(0.75, "rgba(255,255,255,.35)"); g.addColorStop(0.93, "rgba(255,255,255,1)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, w, h);
      c.globalCompositeOperation = "destination-in"; const v = c.createLinearGradient(0, 0, 0, h); v.addColorStop(0, "rgba(0,0,0,0)"); v.addColorStop(0.5, "rgba(0,0,0,1)"); v.addColorStop(1, "rgba(0,0,0,0)"); c.fillStyle = v; c.fillRect(0, 0, w, h); });
    const mkSt = (col, op) => { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: stT, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(sp); return sp; };
    const stCore = mkSt(0xfff4e6, 1.0), stGlow = mkSt(0xffc58a, 0.45);
    const hal = glowSprite(0xffe2bc, 0.35, 0.3); pulse.add(hal);
    const ca = new V3(), cb = new V3();
    const placeStreak = (sp, len, hgt) => {
      ca.set(pulse.position.x + 0.1, pulse.position.y, 0).applyMatrix4(C.matrixWorldInverse); len = Math.min(len, pulse.position.x - C.position.x - 0.8); cb.set(pulse.position.x - len, pulse.position.y, 0).applyMatrix4(C.matrixWorldInverse);
      const zm = (ca.z + cb.z) / 2; ca.multiplyScalar(zm / ca.z); cb.multiplyScalar(zm / cb.z);
      sp.position.set(pulse.position.x + 0.1 - len / 2, pulse.position.y, 0);
      sp.scale.set(Math.hypot(ca.x - cb.x, ca.y - cb.y) * 1.0, hgt, 1); sp.material.rotation = Math.atan2(ca.y - cb.y, ca.x - cb.x);
    };
    const pl = new THREE.PointLight(0xffd9a8, 1.6, 4, 2); pulse.add(pl);
    const cB = 13.0, cL = 14.4;   // ball and light speeds (units/s): light pulls ahead slowly
    return (t) => {
      const ft = T0 + t, bx = cB * t, lx = 1.5 + cL * t;
      ball.position.x = bx; ball.rotation.z = -bx / rb;
      pulse.position.x = lx;
      const u = smooth(t / 4.26), ox = lerp(-1.55, -1.45, u), oz = lerp(1.0, 1.25, u), oy = lerp(0.4, 0.52, u);
      C.position.set(bx + ox, oy, oz); C.lookAt(bx + 2.2, 0.0, -0.35);
      bd.position.set(bx + 40, 2, -6); bd.lookAt(C.position);
      C.updateMatrixWorld(); placeStreak(stCore, 0.9, 0.022); placeStreak(stGlow, 2.6, 0.12); C.near = 0.02; C.far = 200; C.clearViewOffset(); C.updateProjectionMatrix();
      return [S, C, []];
    };
  }

  // ================================================================ theories / clock
  function buildClock(o) {
    const T0 = o.T0, S = stage("studio", { key: 0.0, hemi: 0.14, rim: 0.7, floorY: 0 });
    const C = cam(30), G = grade(S);
    const key = spot(S, 0xffeedd, 110, new V3(-3, 6.5, 5), new V3(0.4, 0.9, -0.4), 0.6, 0.85, true);
    spot(S, 0xffe8d0, 30, new V3(1, 3, 7), new V3(0.4, 1.0, -0.4), 0.7, 1);
    spot(S, 0xa8bcd8, 20, new V3(5, 4.5, 3), new V3(0, 1.4, 0.3), 0.6, 0.9);
    spot(S, 0xffe6c8, 110, new V3(-2.0, 0.9, 6.5), new V3(0.5, 0.72, 0.45), 0.4, 0.9);
    // the rest tier: a long walnut shelf behind and above the rail, watch + rule at rest
    // the rest tier: a wall shelf directly above the rail (same depth as the carriage, so the two rules compare honestly)
    const shelfY = 1.78, shelfZ = 0.45;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(14, 0.07, 0.8), walnut); shelf.position.set(0, shelfY - 0.035, shelfZ - 0.04); shade(shelf); S.add(shelf);
    for (const x of [-3.2, 3.6]) { const br = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.3, 0.7), brassDk); br.position.set(x, shelfY - 0.22, shelfZ - 0.1); shade(br); S.add(br); }
    const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 12), new THREE.MeshStandardMaterial({ color: 0x2b2a29, map: noiseTex(1024, 512, "#bdbdbd", 0.05, 21), roughness: 0.95 })); back.position.set(0, 4, -0.5); back.receiveShadow = true; S.add(back);
    const rest = watchStand(); rest.g.position.set(0.35, shelfY, shelfZ - 0.02); S.add(rest.g);
    const rRest = rule(); rRest.position.set(0.35, shelfY + 0.007, shelfZ + 0.24); S.add(rRest);
    // the moving tier: twin steel rods on the floor, a carriage with the identical stand + rule, Lorentz-contracted along x (gamma = 2)
    const rodG = new THREE.CylinderGeometry(0.02, 0.02, 40, 12); rodG.rotateZ(Math.PI / 2);
    for (const z of [-0.22, 0.22]) { const m = new THREE.Mesh(rodG, steelP); m.position.set(0, 0.02, 0.45 + z); m.castShadow = true; S.add(m); }
    const car = new THREE.Group(); S.add(car);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.62), blackEnamel); deck.position.y = 0.09; car.add(deck);
    const trim = new THREE.Mesh(new THREE.BoxGeometry(1.02, 0.015, 0.64), brassDk); trim.position.y = 0.125; car.add(trim);
    for (const x of [-0.36, 0.36]) for (const z of [-0.22, 0.22]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 24), brassW); wh.rotation.x = Math.PI / 2; wh.position.set(x, 0.06, z); car.add(wh); }
    const mov = watchStand(); mov.g.position.y = 0.13; car.add(mov.g);
    const rMov = rule(); rMov.position.set(0, 0.137, 0.0); rMov.scale.set(1, 1, 1); S.add(rMov);
    shade(car);
    const gam = 2, X0 = -3.3, X1 = 3.9, dur = 5.6;
    const xAt = (t) => lerp(X0, X1, t / dur);
    const tgt = new V3();
    return (t) => {
      const ft = T0 + t, x = xAt(t);
      car.position.set(x, 0, 0.45); car.scale.set(1 / gam, 1, 1);
      rMov.position.set(x, 0.137, 0.45 + 0.24); rMov.scale.set(1 / gam, 1, 1);
      // ticking: rest watch 5 beats/s on a quick dial, moving watch at 1/gamma
      const tick = (s) => Math.floor(s);
      rest.watch.sec(tick(t * 6)); mov.watch.sec(tick(t * 6 / gam));
      // camera: slow pan following the carriage part-way + gentle push
      tgt.set(lerp(-0.4, 1.0, smooth(t / dur)), 1.55, 0.3);
      aim(C, tgt, lerp(9.4, 8.8, smooth(t / dur)), lerp(-7, 5, smooth(t / dur)), 7, 0, 95);
      G.place(C, 0.8 * win(ft, 145.0, 149.8, 0.6), 0);
      return [S, C, []];
    };
  }

  // ================================================================ theories / mass (brass plaque on a stone wall, upper third)
  function buildMass(o) {
    const T0 = o.T0, S = stage("studio", { key: 0.0, hemi: 0.1, rim: 0.0, floorY: -3 }), C = cam(30), G = grade(S);
    const wallT = noiseTex(2048, 1024, "#2a2724", 0.05, 41);
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(14, 8), new THREE.MeshStandardMaterial({ map: wallT, bumpMap: wallT, bumpScale: 0.6, roughness: 0.92 })); wall.receiveShadow = true; S.add(wall);
    // engraving: canvas used as bump + darkened fill (black wax in the grooves, as on real plaques)
    const eng = (fill) => canvasTex(2048, 768, (c, w, h) => {
      c.fillStyle = fill ? "#ffffff" : "#ffffff"; c.fillRect(0, 0, w, h);
      c.fillStyle = fill ? "#2a2116" : "#000000"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = "italic 360px Georgia, 'Times New Roman', serif"; c.fillText("E = mc²", w / 2, h * 0.43);
      c.font = "64px Georgia, serif"; c.fillText("A L B E R T   E I N S T E I N   ·   1 9 0 5", w / 2, h * 0.82);
      c.strokeStyle = fill ? "#2a2116" : "#000"; c.lineWidth = 6; c.strokeRect(70, 60, w - 140, h - 120);
      if (fill) { const r = rnd(4); for (let i = 0; i < 4000; i++) { c.fillStyle = `rgba(80,60,20,${0.05 * r()})`; c.fillRect(r() * w, r() * h, 60 * r(), 1); } }
    });
    const pW = 3.2, pH = 1.2;
    const shp = new THREE.Shape(); const rr = 0.06; shp.moveTo(-pW / 2 + rr, -pH / 2); shp.lineTo(pW / 2 - rr, -pH / 2); shp.quadraticCurveTo(pW / 2, -pH / 2, pW / 2, -pH / 2 + rr); shp.lineTo(pW / 2, pH / 2 - rr); shp.quadraticCurveTo(pW / 2, pH / 2, pW / 2 - rr, pH / 2); shp.lineTo(-pW / 2 + rr, pH / 2); shp.quadraticCurveTo(-pW / 2, pH / 2, -pW / 2, pH / 2 - rr); shp.lineTo(-pW / 2, -pH / 2 + rr); shp.quadraticCurveTo(-pW / 2, -pH / 2, -pW / 2 + rr, -pH / 2);
    const pg = new THREE.ExtrudeGeometry(shp, { depth: 0.03, bevelEnabled: true, bevelSize: 0.018, bevelThickness: 0.015, bevelSegments: 4, curveSegments: 8 });
    const mapE = eng(true), bumpE = eng(false);
    for (const tx of [mapE, bumpE]) { tx.repeat.set(1 / pW, 1 / pH); tx.offset.set(0.5, 0.5); tx.wrapS = tx.wrapT = THREE.ClampToEdgeWrapping; }
    bumpE.colorSpace = THREE.NoColorSpace;
    const plaqueM = new THREE.MeshStandardMaterial({ color: 0xe6c88a, map: mapE, bumpMap: bumpE, bumpScale: 3, metalness: 1, roughness: 0.26, envMapIntensity: 1.6 });
    const plaque = new THREE.Mesh(pg, plaqueM); plaque.position.set(0, 1.6, 0.01); plaque.castShadow = true; S.add(plaque);
    for (const [x, y] of [[-1.48, 0.5], [1.48, 0.5], [-1.48, -0.5], [1.48, -0.5]]) { const sc = new THREE.Mesh(new THREE.SphereGeometry(0.035, 16, 8, 0, TAU, 0, Math.PI / 2), brassDk); sc.rotation.x = Math.PI / 2; sc.position.set(x, 1.6 + y, 0.06); S.add(sc); }
    // a raking light sweeping across the plaque (motivated: a lamp to the left moving slowly) + soft fill
    const rake = spot(S, 0xffe6c4, 70, new V3(-4, 2.4, 1.2), new V3(0, 1.6, 0), 0.6, 1.0, true);
    spot(S, 0xfff0e0, 6, new V3(1.5, -1, 6), new V3(0, 0.8, 0), 0.7, 1);
    return (t) => {
      const ft = T0 + t, u = smooth(t / 3.18);
      rake.position.set(lerp(-4.2, -2.2, u), lerp(2.6, 2.0, u), lerp(0.9, 1.6, u)); rake.target.position.set(lerp(-0.6, 0.9, u), 1.6, 0);
      const tgt = new V3(lerp(-0.1, 0.2, u), 0.0, 0);
      aim(C, tgt, lerp(10.4, 9.6, u), lerp(-10, -4, u), lerp(-4, -2, u), 0, 0);
      G.place(C, 0, 0.5 * win(ft, 150.3, 153.0, 0.3));
      return [S, C, []];
    };
  }

  // ================================================================ theories / quantum, slow (hydrogen 1s cloud)
  function buildCloud(o) {
    const T0 = o.T0, slow = o.mode === "slow", S = stage("void", { key: 1.3, rim: 1.0, hemi: 0.22, dust: 500 }), C = cam(32), G = grade(S);
    S.background = new THREE.Color(0x0c0e13);
    const pts = orbPts(101, 18000, "1s", 0.4);
    const cloud = dots(pts, 0xa8c6e6, 0.024, 0.26, { maxPx: 22, fade: 0.05, tw: 0.55, jit: slow ? 0.07 : 0.025, js: slow ? 0.35 : 1.2, seed: 12 }); S.add(cloud);
    const soft = dots(orbPts(103, 9000, "1s", 0.4), 0x9dbde2, 0.11, 0.045, { maxPx: 60, fade: 0.05, tw: 0.3, jit: slow ? 0.1 : 0.04, js: slow ? 0.3 : 0.8, seed: 13 }); S.add(soft);
    const haze = glowSprite(0x9fbde0, 3.2, 0.12); S.add(haze);
    const haze2 = glowSprite(0xc6dcf2, 1.0, 0.1); S.add(haze2);
    const proton = X3.nucleon("p", 0.018); S.add(proton);
    const pg = glowSprite(0xffd8b0, 0.12, 0.3); S.add(pg);
    // soft lit backdrop far behind (keeps the void from going murky)
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(60, 34), new THREE.MeshBasicMaterial({ map: canvasTex(256, 144, (c, w, h) => { const g = c.createRadialGradient(w * 0.62, h * 0.45, 0, w * 0.62, h * 0.45, w * 0.6); g.addColorStop(0, "#313a49"); g.addColorStop(1, "#0d1015"); c.fillStyle = g; c.fillRect(0, 0, w, h); }), fog: false, depthWrite: false }));
    bd.position.z = -14; bd.renderOrder = -5; S.add(bd);
    const tgt = new V3();
    return (t, d) => {
      const ft = T0 + t, u = smooth(t / d);
      const U = cloud.material.uniforms; U.time.value = ft; const U2 = soft.material.uniforms; U2.time.value = ft;
      if (slow) {
        cloud.rotation.y = soft.rotation.y = 0.04 * ft; U.wamp.value = 0; U.tw.value = 0.35;
        tgt.set(0, 0, 0); aim(C, tgt, lerp(3.6, 3.2, u), lerp(-14, 6, u), lerp(10, 4, u), -330, -60);
        G.place(C, 0.75 * win(ft, 178.2, 183.8, 0.6), 0);
        bd.position.set(C.position.x * -0.0, 0, -14);
        return [S, C, [["Schrödinger: slow electrons", -0.5, 0.42, 0.1, win(ft, 179.0, 183.4, 0.6)]]];
      }
      // quantum: shimmering cloud, a wave rolls through it from 159.6 ("behave like waves"), more flicker on "nothing is ever quite certain"
      cloud.rotation.y = soft.rotation.y = 0.12 * ft; U2.wk.value.set(7.5, 2.0, 1.5); U2.wsp.value = 6.0; U2.wamp.value = 0.5 * seg(ft, 159.6, 161.6);
      U.wk.value.set(7.5, 2.0, 1.5); U.wsp.value = 6.0; U.wamp.value = 0.22 + 0.55 * seg(ft, 159.6, 161.6);
      U.tw.value = 0.45 + 0.35 * seg(ft, 162.2, 163.4);
      haze.material.opacity = 0.13 + 0.03 * Math.sin(ft * 1.7);
      tgt.set(0, 0, 0); aim(C, tgt, cr([[0, 3.9], [11, 3.0]], t), lerp(-24, 18, u), lerp(12, 4, u), lerp(-300, -120, seg(ft, 157.5, 160)), -30);
      G.place(C, 0.7 * win(ft, 154.0, 158.6, 0.6), 0);
      return [S, C, []];
    };
  }

  // ================================================================ theories / wave (1s and 2p orbitals)
  function buildWave(o) {
    const T0 = o.T0, S = stage("void", { key: 1.3, rim: 1.0, hemi: 0.22, dust: 500 }), C = cam(32);
    S.background = new THREE.Color(0x0c0e13);
    const mk = (kind, a, axis, n, x, seed) => {
      const g = new THREE.Group(); g.position.x = x;
      const c = dots(orbPts(seed, n, kind, a, axis), 0xa8c6e6, 0.04, 0.24, { maxPx: 20, fade: 0.05, tw: 0.4, jit: 0.02, seed });
      const sft = dots(orbPts(seed + 50, Math.round(n * 0.5), kind, a, axis), 0x9dbde2, 0.17, 0.045, { maxPx: 70, fade: 0.05, tw: 0.3, jit: 0.04, seed: seed + 1 });
      g.add(c, sft, X3.nucleon("p", 0.025), glowSprite(0xffd8b0, 0.12, 0.3)); S.add(g); return { g, c, sft };
    };
    const s1 = mk("1s", 0.3, "y", 9000, -2.0, 201);
    const p2 = mk("2p", 0.17, "y", 16000, 1.0, 202); p2.c.material.uniforms.op.value = 0.36; p2.sft.material.uniforms.op.value = 0.07;
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(80, 45), new THREE.MeshBasicMaterial({ map: canvasTex(256, 144, (c, w, h) => { const g = c.createRadialGradient(w * 0.55, h * 0.45, 0, w * 0.55, h * 0.45, w * 0.6); g.addColorStop(0, "#2c3442"); g.addColorStop(1, "#0d1015"); c.fillStyle = g; c.fillRect(0, 0, w, h); }), fog: false, depthWrite: false }));
    bd.position.z = -16; bd.renderOrder = -5; S.add(bd);
    const tgt = new V3();
    return (t, d) => {
      const ft = T0 + t, u = smooth(t / d);
      for (const o2 of [s1, p2]) { o2.c.material.uniforms.time.value = o2.sft.material.uniforms.time.value = ft; }
      p2.g.rotation.z = 0.35; p2.g.rotation.y = 0.15 * ft;
      tgt.set(-0.35, 0, 0); aim(C, tgt, lerp(8.0, 7.3, u), lerp(-16, 2, u), lerp(12, 8, u), 0, 0);
      bd.lookAt(C.position);
      const op = win(ft, 169.0, 171.2, 0.5);
      return [S, C, [["1s", -2.15, 0.55, 0, op], ["2p", 1.25, 1.05, 0, op]]];
    };
  }

  // ================================================================ theories / spectrum (glass prism, hydrogen Balmer lines)
  function buildSpectrum(o) {
    const T0 = o.T0, S = stage("studio", { key: 0.0, hemi: 0.25, rim: 0.6, floorY: -1.2 }), C = cam(30), G = grade(S);
    S.fog = new THREE.Fog(0x0b0c10, 9, 30);
    // bench: dark oiled oak top
    const grain = noiseTex(1024, 1024, "#2c2c2f", 0.07, 18);
    grain.wrapS = grain.wrapT = THREE.RepeatWrapping; grain.repeat.set(4, 2);
    const bench = new THREE.Mesh(new THREE.BoxGeometry(24, 0.12, 12), new THREE.MeshStandardMaterial({ color: 0x6a6a6a, map: grain, envMapIntensity: 0.3, roughness: 0.6, metalness: 0 })); bench.position.y = -0.06; bench.receiveShadow = true; S.add(bench);
    const key = spot(S, 0xffe8cc, 70, new V3(0.0, 5.0, -3.2), new V3(0.4, 0, -0.5), 0.5, 1.0, true);
    spot(S, 0xa8bcd8, 8, new V3(-5, 2.0, -4), new V3(-1, 0.3, -1), 0.5, 1);
    // --- optics in 2D (u along the bench, v across it); exact Snell refraction through a 60 degree dense-flint prism
    const s = 0.62, Hh = 0.62, B1 = [-s / 2, -s * 0.2887], B2 = [s / 2, -s * 0.2887], AP = [0, s * 0.5774];
    const LINES = [[656, 1.6421, 0xff3b2a, 1.0], [486, 1.6612, 0x2fc6ff, 0.55], [434, 1.6728, 0x6e48ff, 0.35]];   // nm, n (SF2-like flint), colour, strength
    const sub = (a, b) => [a[0] - b[0], a[1] - b[1]], dot = (a, b) => a[0] * b[0] + a[1] * b[1], nrm = (a) => { const l = Math.hypot(a[0], a[1]); return [a[0] / l, a[1] / l]; };
    const hit = (p, d, a, b) => { const e = sub(b, a), den = d[0] * e[1] - d[1] * e[0]; const w = sub(a, p); const tt = (w[0] * e[1] - w[1] * e[0]) / den; return [p[0] + d[0] * tt, p[1] + d[1] * tt]; };
    const refr = (d, n, eta) => { const c = -dot(n, d), k = 1 - eta * eta * (1 - c * c); return nrm([eta * d[0] + (eta * c - Math.sqrt(k)) * n[0], eta * d[1] + (eta * c - Math.sqrt(k)) * n[1]]); };
    const fL = nrm([-(AP[1] - B1[1]), AP[0] - B1[0]]), fR = nrm([AP[1] - B2[1], -(AP[0] - B2[0])]);   // outward normals of the two faces
    const iAng = 55.4 * D2R, dIn = [Math.cos(iAng - 30 * D2R), Math.sin(iAng - 30 * D2R)];
    const mid = [(B1[0] + AP[0]) / 2 - 0.02, (B1[1] + AP[1]) / 2 - 0.035], src = [mid[0] - dIn[0] * 1.25, mid[1] - dIn[1] * 1.25];
    const pIn = hit(src, dIn, B1, AP);
    const rays = LINES.map(([nm, n]) => { const di = refr(dIn, fL, 1 / n), pOut = hit(pIn, di, AP, B2), dOut = refr(di, [-fR[0], -fR[1]], n); return { di, pOut, dOut }; });
    // card perpendicular to the red ray, 3.4 from the exit
    const cardD = 3.4, red = rays[0], cardC = [red.pOut[0] + red.dOut[0] * cardD, red.pOut[1] + red.dOut[1] * cardD], cardN = [-red.dOut[0], -red.dOut[1]], cardT = [-cardN[1], cardN[0]];
    const onCard = rays.map((r) => { const tt = dot(sub(cardC, r.pOut), cardN) / dot(r.dOut, cardN); return [r.pOut[0] + r.dOut[0] * tt, r.pOut[1] + r.dOut[1] * tt]; });
    const rig = new THREE.Group(); S.add(rig);
    const P3 = (p, y) => new V3(p[0], y, -p[1]);
    const yC = 0.34;   // beam height above the bench
    // prism: real transmissive flint glass (beams are opaque emissive so they survive the transmission pass)
    const tri = new THREE.Shape(); tri.moveTo(B1[0], B1[1]); tri.lineTo(B2[0], B2[1]); tri.lineTo(AP[0], AP[1]); tri.closePath();
    const prG = new THREE.ExtrudeGeometry(tri, { depth: Hh, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 4 }); prG.rotateX(-Math.PI / 2);
    const prism = new THREE.Mesh(prG, new THREE.MeshPhysicalMaterial({ color: 0xf4f8f6, roughness: 0.02, metalness: 0, transmission: 1, thickness: 0.35, ior: 1.65, specularIntensity: 1, envMapIntensity: 1.0, attenuationColor: new THREE.Color(0xdfeee8), attenuationDistance: 3 }));
    prism.position.y = 0.006; rig.add(prism);
    // lamp: black enamel housing with vents and a brass slit plate (pale pink hydrogen glow in the slit)
    const lampDir = Math.atan2(dIn[1], dIn[0]), lp = [src[0] - dIn[0] * 0.25, src[1] - dIn[1] * 0.25];
    const lamp = new THREE.Group(); lamp.position.copy(P3(lp, 0)); lamp.rotation.y = lampDir; rig.add(lamp);
    const hous = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.62, 40), blackEnamel); hous.position.set(-0.12, yC + 0.08, 0); lamp.add(hous);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.21, 0.08, 40), blackEnamel); cap.position.set(-0.12, yC + 0.43, 0); lamp.add(cap);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 16), brassDk); stem.position.set(-0.12, 0.1 - 0.0, 0); lamp.add(stem);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.2, 0.03, 40), blackEnamel); foot.position.set(-0.12, 0.015, 0); lamp.add(foot);
    const plate = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.36, 0.3), brassW); plate.position.set(0.1, yC, 0); lamp.add(plate);
    const slit = new THREE.Mesh(new THREE.PlaneGeometry(0.012, 0.2), M.light(0xffd6ea, 1)); slit.rotation.y = Math.PI / 2; slit.position.set(0.111, yC, 0); lamp.add(slit);
    const slitG = glowSprite(0xffcfe6, 0.18, 0.4); slitG.position.set(0.13, yC, 0); lamp.add(slitG);
    shade(lamp); slit.castShadow = false;
    // beams: thin vertical ribbons (opaque-emissive core + faint additive dust glow)
    const ribbon = (a, b, col, hgt, core, glow) => {
      const g = new THREE.Group(), A = P3(a, yC), Bp = P3(b, yC), L = A.distanceTo(Bp);
      const c = new THREE.Mesh(new THREE.PlaneGeometry(L, hgt), new THREE.MeshBasicMaterial({ color: new THREE.Color(col).multiplyScalar(core), side: THREE.DoubleSide, toneMapped: false })); c.userData.base = c.material.color.clone(); g.add(c);
      const gl = new THREE.Mesh(new THREE.PlaneGeometry(L, hgt * 2.2), new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: glow, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide, map: canvasTex(8, 64, (cc, w, h) => { const gr = cc.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.5, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); cc.fillStyle = gr; cc.fillRect(0, 0, w, h); }) })); g.add(gl);
      g.position.copy(A).add(Bp).multiplyScalar(0.5); g.rotation.y = Math.atan2(-(Bp.z - A.z), Bp.x - A.x);
      rig.add(g); return { g, c, gl };
    };
    const bIn = ribbon(src, pIn, 0xffe6f0, 0.007, 0.5, 0.05);
    const bInside = rays.map((r, i) => ribbon(pIn, r.pOut, LINES[i][2], 0.004, 0.3 * LINES[i][3], 0.03));
    const bOut = rays.map((r, i) => ribbon(r.pOut, onCard[i], LINES[i][2], 0.005, 0.38 * LINES[i][3], 0.05 * LINES[i][3]));
    // dark card on a small brass stand, with the three slit images
    const card = new THREE.Group(); card.position.copy(P3(cardC, 0)); card.rotation.y = Math.atan2(cardN[0], -cardN[1]); rig.add(card);
    const cardM = new THREE.MeshStandardMaterial({ color: 0x1a1a1c, roughness: 0.92 });
    const board = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.62, 0.02), cardM); board.position.y = yC + 0.03; card.add(board);
    const clip = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.06, 0.06), brassDk); clip.position.y = yC - 0.29; card.add(clip);
    const cstem = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, yC - 0.29, 16), brassW); cstem.position.y = (yC - 0.29) / 2; card.add(cstem);
    const cfoot = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.025, 32), brassDk); cfoot.position.y = 0.012; card.add(cfoot);
    shade(card);
    const marks = onCard.map((p, i) => {
      const off = dot(sub(p, cardC), cardT);
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.011, 0.2), new THREE.MeshBasicMaterial({ color: LINES[i][2], toneMapped: false })); m.userData.base = m.material.color.clone(); m.position.set(off, yC, 0.0115); card.add(m);
      const gw = glowSprite(LINES[i][2], 0.16, 0.22 * LINES[i][3]); gw.position.set(off, yC, 0.02); card.add(gw);
      const lt = new THREE.PointLight(LINES[i][2], 0.06 * LINES[i][3], 1.2, 2); lt.position.set(off, yC, 0.12); card.add(lt);
      return { m, gw, off };
    });
    rig.rotation.y = Math.atan2(rays[0].dOut[1], rays[0].dOut[0]); rig.position.set(-1.4, 0, -0.4); rig.updateMatrixWorld();
    const tgt = new V3(), cc = P3(cardC, yC).applyMatrix4(rig.matrixWorld), pc = new V3(0, yC, 0).applyMatrix4(rig.matrixWorld);
    return (t, d) => {
      const ft = T0 + t, u = smooth(t / d);
      // the light shimmers very slightly (discharge lamp)
      const fl = 0.95 + 0.05 * Math.sin(ft * 9.1) * Math.sin(ft * 3.3);
      bOut.forEach((b) => { b.c.material.color.copy(b.c.userData.base).multiplyScalar(fl); });
      marks.forEach((m) => { m.m.material.color.copy(m.m.userData.base).multiplyScalar(fl); });
      tgt.copy(pc).lerp(cc, lerp(-0.22, 0.74, u)); tgt.y = yC - 0.02;
      aim(C, tgt, lerp(4.6, 3.5, u), lerp(-24, -72, u), lerp(26, 18, u), -60, 120);
      G.place(C, 0.8 * win(ft, 171.6, 174.4, 0.4), 0);
      return [S, C, []];
    };
  }

  // ================================================================ gold / atom (gold-197: dense nucleus, racing inner electrons, calm outer cloud)
  function buildGoldAtom(o) {
    const T0 = o.T0, S = stage("void", { key: 1.5, rim: 1.2, hemi: 0.2, dust: 600 }), C = cam(32), G = grade(S);
    S.background = new THREE.Color(0x0c0e13);
    const nuc = X3.nucleus(79, 118, 7, 0.0095); S.add(nuc);
    const ng = glowSprite(0xffd2a0, 0.3, 0.3); S.add(ng);
    const bd = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: canvasTex(256, 144, (c, w, h) => { const g = c.createRadialGradient(w * 0.66, h * 0.48, 0, w * 0.66, h * 0.48, w * 0.62); g.addColorStop(0, "#3d4859"); g.addColorStop(0.55, "#1d232d"); g.addColorStop(1, "#0e1116"); c.fillStyle = g; c.fillRect(0, 0, w, h); }), fog: false, depthWrite: false, depthTest: false }));
    bd.renderOrder = -5; S.add(bd);
    // inner shell haze (1s/2s/2p: tight, dense) + outer 6s cloud (huge, calm)
    const inner = dots(orbPts(301, 7000, "1s", 0.1), 0xb4cfec, 0.024, 0.45, { maxPx: 16, fade: 0.03, tw: 0.8, jit: 0.008, js: 4, seed: 6 }); S.add(inner);
    const outer = dots(orbPts(302, 14000, "1s", 1.5), 0xa8c6e6, 0.07, 0.2, { maxPx: 26, fade: 0.6, tw: 0.4, jit: 0.04, js: 0.4, seed: 7 }); S.add(outer);
    const outerS = dots(orbPts(303, 7000, "1s", 1.5), 0x9dbde2, 0.35, 0.04, { maxPx: 90, fade: 0.8, tw: 0.3, jit: 0.06, js: 0.3, seed: 8 }); S.add(outerS);
    const oh = glowSprite(0x9fbde0, 11, 0.07); S.add(oh);
    // racing electrons: short smeared arcs on many tilted planes (no rings, no balls): heads move ~2.5 rev/s
    const NE = 18, NT = 110, rr = rnd(77), E = [];
    for (let k = 0; k < NE; k++) {
      const a = new V3(rr() * 2 - 1, rr() * 2 - 1, rr() * 2 - 1).normalize(), b = new V3(rr() * 2 - 1, rr() * 2 - 1, rr() * 2 - 1).cross(a).normalize(), c = new V3().crossVectors(a, b);
      E.push({ a, b, c, R: k < 2 ? 0.11 + 0.02 * rr() : 0.16 + 0.13 * rr(), w: (k < 2 ? 3.0 : 2.0) * TAU * (0.85 + 0.3 * rr()), ph: rr() * TAU, pr: 0.6 + rr() });
    }
    const al = []; for (let k = 0; k < NE; k++) for (let i = 0; i < NT; i++) al.push(Math.pow(1 - i / NT, 1.8));
    const streak = dots(new Array(NE * NT * 3).fill(0), 0xdbe9f8, 0.03, 0.3, { maxPx: 20, al, seed: 9 }); S.add(streak);
    const sp = streak.geometry.attributes.position, tv = new V3(), ax = new V3(), q = new THREE.Quaternion();
    const tgt = new V3();
    return (t, d) => {
      const ft = T0 + t;
      for (const m of [inner, outer, outerS, streak]) m.material.uniforms.time.value = ft;
      // streaks: each head sweeps its plane; the plane itself precesses slowly so the paths fill a cloud, not rings
      for (let k = 0; k < NE; k++) {
        const e = E[k]; ax.copy(e.c); q.setFromAxisAngle(e.a, e.pr * 0.4 * ft);
        for (let i = 0; i < NT; i++) {
          const ang = e.ph + e.w * ft - i * 0.018;
          tv.copy(e.a).multiplyScalar(Math.cos(ang) * e.R).addScaledVector(e.b, Math.sin(ang) * e.R).applyQuaternion(q);
          sp.setXYZ(k * NT + i, tv.x, tv.y, tv.z);
        }
      }
      sp.needsUpdate = true;
      const vis = seg(ft, 185.4, 187.6);   // racing becomes legible as the camera nears
      streak.material.uniforms.op.value = 0.3 * vis;
      nuc.rotation.y = 0.15 * ft;
      // camera dive: whole atom -> into the inner shells, the atom moves right for the "big" title
      const dist = Math.exp(cr([[184.1, Math.log(16)], [186.6, Math.log(10)], [189.0, Math.log(2.3)], [192.8, Math.log(1.95)]], ft));
      const ox = cr([[184.1, 0], [187.5, 0], [189.0, -560], [192.8, -600]], ft), oy = cr([[184.1, 0], [189.0, 30], [192.8, 30]], ft);
      tgt.set(0, 0, 0); aim(C, tgt, dist, lerp(-20, 25, smooth((ft - 184.1) / 8.7)), lerp(14, 6, smooth((ft - 184.1) / 8.7)), ox, oy);
      const ok = 1 - 0.75 * seg(ft, 187.0, 189.0); outer.material.uniforms.op.value = 0.2 * ok; outerS.material.uniforms.op.value = 0.04 * ok;
      oh.material.opacity = 0.07 * (1 - seg(ft, 186.5, 188.8));
      bd.position.copy(C.position).addScaledVector(C.getWorldDirection(tv), C.far * 0.5); bd.scale.set(C.far * 0.5 * 2.4, C.far * 0.5 * 1.4, 1); bd.quaternion.copy(C.quaternion);
      G.place(C, 0, 0.45 * win(ft, 188.9, 192.6, 0.5));
      return [S, C, []];
    };
  }

  // ================================================================ gold / bars (gold vs silver on dark velvet)
  function buildBars(o) {
    const T0 = o.T0, S = stage("studio", { key: 0.0, hemi: 0.08, rim: 0.0, floorY: -0.5 }), C = cam(28), G = grade(S);
    // velvet: soft folds, sheen
    const vg = new THREE.PlaneGeometry(60, 40, 300, 200); vg.rotateX(-Math.PI / 2);
    const vp = vg.attributes.position; for (let i = 0; i < vp.count; i++) { const x = vp.getX(i), z = vp.getZ(i), r2 = x * x * 0.25 + z * z * 0.6; vp.setY(i, (r2 > 2.2 ? 0.03 * Math.sin(x * 1.3 + z * 0.5) * Math.min(1, (r2 - 2.2) * 0.4) + 0.015 * Math.sin(z * 2.1 - x * 0.6) * Math.min(1, (r2 - 2.2) * 0.4) : 0)); }
    vg.computeVertexNormals();
    const velvet = new THREE.Mesh(vg, new THREE.MeshPhysicalMaterial({ color: 0x0c0e15, roughness: 1, metalness: 0, sheen: 0.8, sheenRoughness: 0.5, sheenColor: new THREE.Color(0x2f3a52), envMapIntensity: 0.4, map: noiseTex(512, 512, "#c8c8c8", 0.12, 33) }));
    velvet.material.map.wrapS = velvet.material.map.wrapT = THREE.RepeatWrapping; velvet.material.map.repeat.set(28, 18);
    velvet.receiveShadow = true; S.add(velvet);
    // cast/minted ingot: rounded-rect top, tapered sides, stamped top
    const bar = (Lb, Wb, Hb, metal, stamp) => {
      const r = 0.06, s = new THREE.Shape(); s.moveTo(-Lb / 2 + r, -Wb / 2); s.lineTo(Lb / 2 - r, -Wb / 2); s.quadraticCurveTo(Lb / 2, -Wb / 2, Lb / 2, -Wb / 2 + r); s.lineTo(Lb / 2, Wb / 2 - r); s.quadraticCurveTo(Lb / 2, Wb / 2, Lb / 2 - r, Wb / 2); s.lineTo(-Lb / 2 + r, Wb / 2); s.quadraticCurveTo(-Lb / 2, Wb / 2, -Lb / 2, Wb / 2 - r); s.lineTo(-Lb / 2, -Wb / 2 + r); s.quadraticCurveTo(-Lb / 2, -Wb / 2, -Lb / 2 + r, -Wb / 2);
      const g = new THREE.ExtrudeGeometry(s, { depth: Hb - 0.06, bevelEnabled: true, bevelSize: 0.03, bevelThickness: 0.03, bevelSegments: 6, curveSegments: 10 });
      g.rotateX(-Math.PI / 2); g.translate(0, 0.03, 0);
      const p = g.attributes.position; for (let i = 0; i < p.count; i++) { const k = 1 - 0.1 * clamp(p.getY(i) / Hb, 0, 1); p.setX(i, p.getX(i) * k); p.setZ(i, p.getZ(i) * k); }
      const tx = canvasTex(1024, 512, (c, w, h) => { c.fillStyle = "#fff"; c.fillRect(0, 0, w, h); c.fillStyle = "#000"; c.textAlign = "center"; c.textBaseline = "middle";
        c.font = "bold 70px Georgia, serif"; c.fillText(stamp[0], w / 2, h * 0.3); c.font = "bold 96px Georgia, serif"; c.fillText(stamp[1], w / 2, h * 0.53); c.font = "54px Georgia, serif"; c.fillText(stamp[2], w / 2, h * 0.74);
        c.lineWidth = 5; c.strokeRect(w * 0.16, h * 0.13, w * 0.68, h * 0.74); });
      tx.colorSpace = THREE.NoColorSpace; tx.repeat.set(1 / Lb, 1 / Wb); tx.offset.set(0.5, 0.5); tx.rotation = 0;
      const m = new THREE.Mesh(g, new THREE.MeshPhysicalMaterial({ color: metal, metalness: 1, roughness: 0.24, bumpMap: tx, bumpScale: 2, clearcoat: 0, envMapIntensity: 0.6 }));
      m.castShadow = m.receiveShadow = true; return m;
    };
    const gold = new THREE.Color().setRGB(1.0, 0.766, 0.336, THREE.LinearSRGBColorSpace), silver = new THREE.Color().setRGB(0.972, 0.96, 0.915, THREE.LinearSRGBColorSpace);
    const gBar = bar(1.16, 0.52, 0.2, gold, ["FINE GOLD", "999.9", "1 KILO"]); gBar.position.set(0.55, 0, 0.05); gBar.rotation.y = 0.12; S.add(gBar);
    const sBar = bar(1.16, 0.52, 0.2, silver, ["FINE SILVER", "999.0", "1 KILO"]); sBar.position.set(-0.75, 0, -0.08); sBar.rotation.y = -0.06; S.add(sBar);
    // light: a soft overhead key with shadows, a cool back rim, and the moving rake (198.8)
    spot(S, 0xfff2e2, 22, new V3(-1.5, 5.5, 2.5), new V3(0, 0, 0), 0.5, 0.9, true);
    spot(S, 0xb8c8e0, 30, new V3(2.5, 2.2, -4.5), new V3(0, 0.1, 0), 0.5, 0.9);
    const rake = spot(S, 0xffefd8, 0, new V3(-3, 0.8, 1.5), new V3(0.55, 0.1, 0.05), 0.26, 1.0, false);
    // a few large soft reflectors in the environment (what polished metal shows): faint warm cards out of frame
    for (const [x, y, z, k] of [[-3, 3, 3, 0.22], [3, 2.5, 2, 0.12], [0, 4, -3, 0.12]]) { const c = new THREE.Mesh(new THREE.PlaneGeometry(3, 1.6), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k * 0.96, k * 0.9), side: THREE.DoubleSide })); c.position.set(x, y, z); c.lookAt(0, 0, 0); S.add(c); }
    const tgt = new V3();
    return (t, d) => {
      const ft = T0 + t, u = (ft - 192.8) / 13.62;
      // rake sweeps across the gold bar 198.8 -> 201.8
      const rk = seg(ft, 198.6, 201.8), rOn = win(ft, 198.5, 202.6, 0.6);
      rake.intensity = 55 * rOn; rake.position.set(lerp(-1.6, 2.8, rk), 0.95, lerp(1.3, 0.9, rk)); rake.target.position.set(lerp(0.15, 0.95, rk), 0.2, 0.05);
      // camera: low dolly across from the silver to the gold, easing into a two-shot
      tgt.set(cr([[192.8, -0.75], [198.8, 0.2], [203.4, 0.05], [206.42, -0.05]], ft), cr([[192.8, 0.08], [198.6, 0.08], [199.4, -0.08], [203.2, -0.08], [204.4, 0.08]], ft), 0);
      const dist = cr([[192.8, 2.6], [198.8, 2.7], [203.4, 3.1], [206.42, 3.4]], ft), az = cr([[192.8, -28], [198.8, 4], [203.4, 10], [206.42, 6]], ft), el = cr([[192.8, 16], [206.42, 24]], ft);
      aim(C, tgt, dist, az, el, 0, -cr([[192.8, 40], [198.4, 70], [199.1, 250], [203.2, 250], [204.2, 110], [206.42, 100]], ft));
      G.place(C, 0.7 * win(ft, 198.9, 203.2, 0.6), 0);
      const pOp = win(ft, 194.4, 198.3, 0.6);
      return [S, C, [["silver", sBar.position.x - 0.25, 0.22, sBar.position.z, pOp], ["gold", gBar.position.x - 0.3, 0.22, gBar.position.z, pOp]]];
    };
  }

  LABK.theories = (o) => ({ fast: buildFast, clock: buildClock, mass: buildMass, quantum: buildCloud, slow: buildCloud, wave: buildWave, spectrum: buildSpectrum }[o.mode] || buildCloud)(o);
  LABK.gold = (o) => (o.mode === "bars" ? buildBars : buildGoldAtom)(o);
})();
