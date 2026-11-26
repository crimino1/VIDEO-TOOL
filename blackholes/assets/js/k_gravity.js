/* Group A kinds (gravity basics): notebook, escape, shrink, darkstar, spacetime, trampoline, lightbend.
   Every frame is a pure function of film time ft = o.T0 + t. Static textures are cached at module level. */
(function () {
  const { THREE, M, P, W, H, seg, smooth, lerp, clamp, rnd, KF, tex, stage, cam, orbit, canvasTex, glowSprite, liveTube } = L3;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const once = (f) => { let v; return () => v || (v = f()); };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // camera on an orbit; sx/sy shift the subject right/up by a fraction of the frame (keeps lower-left free for text)
  function aim(C, tx, ty, tz, dist, az, el, sx, sy) {
    orbit(C, tx, ty, tz, dist, az, el);
    C.setViewOffset(W, H, -(sx || 0) * W, (sy || 0) * H, W, H);
  }
  const fadeIO = (ft, a, b, f) => seg(ft, a, a + (f || 0.5)) * (1 - seg(ft, b - (f || 0.5), b));
  // keyframed camera: list of [ft, tx, ty, tz, dist, az, el, sx, sy]
  function camKF(C, keys, ft) {
    const v = []; for (let i = 1; i < 9; i++) v.push(KF(keys.map((k) => [k[0], k[i]]), ft));
    aim(C, ...v);
  }

  // ---------- shared shaders ----------
  const SH_END = "\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n";
  const VS = "varying vec2 vUv; varying vec3 vN; varying vec3 vW; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position, 1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }";
  const sunTex = once(() => { const t = tex("2k_sun.jpg"); t.wrapS = THREE.RepeatWrapping; return t; });
  // self-lit star surface with limb darkening; k = brightness
  function starMat(tint) {
    return new THREE.ShaderMaterial({
      uniforms: { map: { value: sunTex() }, tint: { value: new THREE.Color(tint || 0xffffff) }, k: { value: 1 }, off: { value: 0 } },
      vertexShader: VS,
      fragmentShader: "uniform sampler2D map; uniform vec3 tint; uniform float k; uniform float off; varying vec2 vUv; varying vec3 vN; varying vec3 vW;\nvoid main(){ vec3 v = normalize(cameraPosition - vW); float mu = max(dot(normalize(vN), v), 0.0); vec3 tx = texture2D(map, vUv + vec2(off, 0.0)).rgb; float lu = dot(tx, vec3(0.3, 0.55, 0.15)); float ld = pow(mu, 0.5); vec3 c = mix(vec3(0.9, 0.26, 0.05), vec3(1.0, 0.6, 0.24), ld) * (0.35 + 1.0 * lu) * (0.3 + 0.7 * ld) * 1.6 * tint; gl_FragColor = vec4(c * k, 1.0);" + SH_END + "}",
    });
  }
  // soft atmosphere halo just outside a planet's limb (back faces of a larger shell), lit side only
  function atmMat(R, sunDir, col) {
    return new THREE.ShaderMaterial({
      uniforms: { col: { value: new THREE.Color(col || 0x6f9be0) }, sun: { value: sunDir.clone() }, c: { value: V(0, 0, 0) }, R: { value: R }, k: { value: 1 } },
      vertexShader: VS,
      fragmentShader: "uniform vec3 col; uniform vec3 sun; uniform vec3 c; uniform float R; uniform float k; varying vec3 vW; varying vec3 vN; varying vec2 vUv;\nvoid main(){ vec3 o = cameraPosition; vec3 dir = normalize(vW - o); float tt = dot(c - o, dir); vec3 p = o + dir * tt; float d = length(p - c); float g = exp(-max(d - R, 0.0) / (0.028 * R)) * 0.9; float l = smoothstep(-0.35, 0.5, dot(normalize(p - c), sun)); gl_FragColor = vec4(col * g * l * k, 1.0);" + SH_END + "}",
      side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
  }
  function earthG(r, sunDir) {
    const G = new THREE.Group();
    const e = new THREE.Mesh(new THREE.SphereGeometry(r, 128, 64), new THREE.MeshStandardMaterial({ map: tex("2k_earth_daymap.jpg"), roughness: 0.82, metalness: 0, envMapIntensity: 0.04 }));
    const cl = new THREE.Mesh(new THREE.SphereGeometry(r * 1.008, 128, 64), new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: tex("2k_earth_clouds.jpg"), transparent: true, depthWrite: false, roughness: 1, envMapIntensity: 0.04 }));
    const atm = new THREE.Mesh(new THREE.SphereGeometry(r * 1.12, 64, 32), atmMat(r, sunDir));
    G.add(e, cl, atm); G.userData = { e, cl, atm };
    G.userData.spin = (ft) => { e.rotation.y = 1.8 + ft * 0.025; cl.rotation.y = 1.8 + ft * 0.029; };
    return G;
  }
  // dense star backdrop with a faint galactic band (so black disks read as holes in the sky)
  function starSky(seed, n, k) {
    const r = rnd(seed), p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      let u = r() * 2 - 1; if (r() < 0.45) u = (r() + r() + r() - 1.5) * 0.22;
      const th = r() * TAU, s2 = Math.sqrt(1 - u * u), v = V(s2 * Math.cos(th), u, s2 * Math.sin(th)).applyEuler(new THREE.Euler(0.5, 0.2, 0.9)).multiplyScalar(600);
      p.set([v.x, v.y, v.z], i * 3); const b = k * (0.12 + 0.88 * Math.pow(r(), 4)), w = r(); c.set([b * (0.85 + 0.15 * w), b * (0.9 + 0.08 * w), b], i * 3);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size: 1.5, sizeAttenuation: false, vertexColors: true, depthWrite: false, fog: false }));
  }
  const dotTex = once(() => canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  // a soft ring profile (for photon / lensing rings and coronae)
  const ringTex = once(() => canvasTex(512, 512, (g, w) => {
    const id = g.createImageData(w, w), d = id.data;
    for (let y = 0; y < w; y++) for (let x = 0; x < w; x++) { const r = Math.hypot(x - w / 2 + 0.5, y - w / 2 + 0.5) / (w / 2), a = Math.exp(-Math.pow((r - 0.5) / 0.012, 2)) + 0.35 * Math.exp(-Math.pow((r - 0.5) / 0.06, 2)) * (r > 0.5 ? 1 : 0.4); const i = (y * w + x) * 4; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = clamp(a * 255, 0, 255); }
    g.putImageData(id, 0, 0);
  }));

  // fabric / space-time grid: colour map + line-only emissive map
  function gridTex(n, bg, line, lw, weave) {
    const draw = (g, w, h, base, col) => {
      g.fillStyle = base; g.fillRect(0, 0, w, h);
      if (weave && base !== "#000") { const r = rnd(5); for (let i = 0; i < 26000; i++) { g.fillStyle = r() < 0.5 ? "rgba(255,255,255,.035)" : "rgba(0,0,0,.08)"; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1); } }
      g.strokeStyle = col; g.lineWidth = lw; const c = w / n;
      for (let i = 0; i <= n; i++) { const x = Math.round(i * c) + 0.5; g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); }
    };
    const map = canvasTex(2048, 2048, (g, w, h) => draw(g, w, h, bg, line));
    const em = canvasTex(2048, 2048, (g, w, h) => draw(g, w, h, "#000", "#fff"));
    map.anisotropy = em.anisotropy = 8;
    return { map, em };
  }
  // a square sheet in XZ whose height is set every frame from fn(x, z)
  function sheet(size, segs, mat, normals) {
    const g = new THREE.PlaneGeometry(size, size, segs, segs); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, mat), base = g.attributes.position.array.slice();
    m.userData.base = base;
    m.userData.set = (fn) => { const p = g.attributes.position.array; for (let i = 0; i < p.length; i += 3) p[i + 1] = fn(base[i], base[i + 2]); g.attributes.position.needsUpdate = true; if (normals !== false) g.computeVertexNormals(); };
    return m;
  }
  // additive line-only grid sheet that fades out towards its edges (abstract space)
  const spaceGrid = once(() => gridTex(64, "#000", "#fff", 1.8, false));
  function gridSheet(size, segs, col, op) {
    const mat = new THREE.MeshBasicMaterial({ color: col || P.fieldLine, map: spaceGrid().em, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true, side: THREE.DoubleSide });
    const m = sheet(size, segs, mat, false), b = m.userData.base, cols = new Float32Array(b.length);
    for (let i = 0; i < b.length; i += 3) { const r = Math.hypot(b[i], b[i + 2]) / (size / 2), f = 1 - smooth((r - 0.45) / 0.55); cols[i] = cols[i + 1] = cols[i + 2] = f; }
    m.geometry.setAttribute("color", new THREE.BufferAttribute(cols, 3));
    return m;
  }

  // ======================================================================= TRAMPOLINE (ported from strings k_cosmos, re-timed)
  const fabric = once(() => gridTex(28, "#1b1f26", "rgba(186,198,214,.5)", 2.5, true));
  LABK.trampoline = (o) => {
    const S = stage("void", { dust: 500, key: 2.4, hemi: 0.28 });
    const key = S.userData.key; key.position.set(-6, 14, 7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 50 }); key.shadow.bias = -0.0006; key.shadow.radius = 4;
    const F = fabric();
    const shM = new THREE.MeshPhysicalMaterial({ map: F.map, emissiveMap: F.em, emissive: 0x1a212c, roughness: 0.9, sheen: 0.25, sheenColor: 0x4a5568, envMapIntensity: 0.4, side: THREE.DoubleSide, transparent: true });
    const sh = sheet(14, 150, shM); sh.receiveShadow = true; S.add(sh);
    const steel = new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 1, roughness: 0.32, transparent: true }), frame = new THREE.Group(), barG = new THREE.CylinderGeometry(0.09, 0.09, 14.2, 20);
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(barG, steel), a = i * Math.PI / 2; b.rotation.set(0, a, Math.PI / 2); b.position.set(Math.sin(a) * 7.05, 0, Math.cos(a) * 7.05); frame.add(b); }
    const legG = new THREE.CylinderGeometry(0.07, 0.07, 4, 16), knobG = new THREE.SphereGeometry(0.12, 16, 12);
    for (const [x, z] of [[-7.05, -7.05], [7.05, -7.05], [-7.05, 7.05], [7.05, 7.05]]) { const l = new THREE.Mesh(legG, steel); l.position.set(x, -2, z); frame.add(l); const k = new THREE.Mesh(knobG, steel); k.position.set(x, 0, z); frame.add(k); }
    S.add(frame);
    // bowling ball
    const Rb = 0.85, swirl = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#1a2846"; g.fillRect(0, 0, w, h); const r = rnd(12); for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(${60 + r() * 60 | 0},${90 + r() * 60 | 0},${150 + r() * 70 | 0},${0.08 + r() * 0.14})`; g.lineWidth = 2 + r() * 10; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 300; y += (r() - 0.5) * 120; g.quadraticCurveTo(x + 60, y - 40, x, y); } g.stroke(); } });
    const ball = new THREE.Group();
    const bm = new THREE.Mesh(new THREE.SphereGeometry(Rb, 64, 48), new THREE.MeshPhysicalMaterial({ map: swirl, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04, metalness: 0 })); bm.castShadow = true; ball.add(bm);
    const holeM = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.9 });
    for (const [a, b, s] of [[-0.28, 0.5, 0.11], [0.28, 0.5, 0.11], [0, 0.05, 0.13]]) { const h = new THREE.Mesh(new THREE.CircleGeometry(s, 24), holeM); const n = V(a, b + 0.35, 0.75).normalize(); h.position.copy(n.clone().multiplyScalar(Rb + 0.002)); h.lookAt(n.clone().multiplyScalar(3)); ball.add(h); }
    S.add(ball);
    const marble = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xd9dee6, roughness: 0.08, clearcoat: 1, metalness: 0 })); marble.castShadow = true; S.add(marble);
    // 3D lattice of grid lines that bends towards the ball in every direction
    const latM = new THREE.LineBasicMaterial({ color: P.fieldLine, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true });
    const sp = 1.4, nL = 8, half = (nL - 1) / 2, ext = sp * (half + 0.9), NS = 60, lat = [];
    for (let ax = 0; ax < 3; ax++) for (let i = 0; i < nL; i++) for (let j = 0; j < nL; j++) {
      const a = (i - half) * sp, b = (j - half) * sp;
      for (let s = 0; s < NS; s++) for (const q of [s, s + 1]) { const c = -ext + 2 * ext * q / NS, p = ax === 0 ? [c, a, b] : ax === 1 ? [a, c, b] : [a, b, c]; lat.push(p); }
    }
    const latBase = new Float32Array(lat.flat()), latG = new THREE.BufferGeometry(), latCol = new Float32Array(latBase.length);
    for (let i = 0; i < latBase.length; i += 3) { const r = Math.hypot(latBase[i], latBase[i + 1], latBase[i + 2]); latCol[i] = latCol[i + 1] = latCol[i + 2] = 1 - smooth((r - 2.2) / 4.2); }
    latG.setAttribute("position", new THREE.BufferAttribute(new Float32Array(latBase.length), 3)); latG.setAttribute("color", new THREE.BufferAttribute(latCol, 3));
    const lattice = new THREE.LineSegments(latG, latM); S.add(lattice);
    const C = cam(32);
    const T0 = 277.0, TC = 277.7, TM = 280.26, TD = 290.94;
    return (t, d) => {
      const ft = o.T0 + t;
      let D = 0, yb;
      if (ft < TC) { const s = clamp((ft - T0) / (TC - T0), 0, 1); yb = lerp(10, Rb, s * s); }
      else { D = 2.7 * KF([[0, 0], [0.6, 1.05], [1.2, 1]], ft - TC); yb = -D + Rb; }
      const h = (x, z) => {
        const r2 = x * x + z * z, e = smooth((7 - Math.abs(x)) / 2.2) * smooth((7 - Math.abs(z)) / 2.2);
        let y = -D * Math.pow(1 + r2 / 2.4, -1.5) * e;
        if (D > 0 && r2 < Rb * Rb) y = Math.min(y, yb - Math.sqrt(Rb * Rb - r2));
        return y;
      };
      const dis = seg(ft, TD, TD + 1.8);             // sheet dissolves
      sh.userData.set(h); shM.opacity = 1 - dis; steel.opacity = 1 - seg(ft, TD, TD + 1.0); sh.visible = frame.visible = dis < 0.999;
      ball.position.set(0, yb, 0); ball.visible = ft > T0 - 0.05; ball.rotation.set(0.25, -0.3 + 0.15 * clamp(ft - T0, 0, 1) + 0.03 * Math.max(0, ft - TD), 0);
      // marble: rolls in, curves round the dip, keeps circling (rises to the ball's height once the sheet is gone)
      marble.visible = ft > TM;
      if (marble.visible) {
        const u = ft - TM, r = lerp(6.4, 2.9, smooth(u / 2.2)), a = 0.55 + 1.55 * u + 0.2 * u * u / (1 + u), mx = r * Math.cos(a), mz = r * Math.sin(a);
        const lift = seg(ft, TD + 0.3, TD + 3.0), tilt = 0.35 * lift;
        marble.position.set(mx, lerp(h(mx, mz) + 0.22, yb + mz * Math.sin(tilt), lift), mz * lerp(1, Math.cos(tilt), lift));
      }
      // lattice
      const bend = seg(ft, TD + 0.8, TD + 3.6), lo = seg(ft, TD + 0.3, TD + 2.0);
      latM.opacity = 0.44 * lo; lattice.visible = lo > 0.001;
      if (lattice.visible) {
        const p = latG.attributes.position.array;
        for (let i = 0; i < latBase.length; i += 3) {
          const x = latBase[i], y = latBase[i + 1], z = latBase[i + 2], r = Math.hypot(x, y, z);
          const rr = lerp(r, Rb + (r - Rb) * (1 - 0.66 * Math.exp(-(r - Rb) / 2.8)), bend), f = rr / r;
          p[i] = x * f; p[i + 1] = y * f + yb; p[i + 2] = z * f;
        }
        latG.attributes.position.needsUpdate = true;
      }
      // camera: high view -> low along the sheet (286.6) -> pull back round the lattice (290.94) -> calm
      camKF(C, [[275.38, 0, -0.8, 0, 23, -8, 36, 0, 0], [283.5, 0, -0.9, 0, 17, -4, 31, 0, 0], [286.6, 0, -0.9, 0, 13, 6, 20, 0, 0], [289.0, 0, -1.5, 0, 9.4, 12, 21, 0, 0],
        [291.2, 0, -1.4, 0, 10, 16, 18, 0, 0], [294.5, 0, yb, 0, 15.5, 32, 16, 0, 0], [302.7, 0, yb, 0, 15.0, 50, 19, 0, 0]], ft);
      return [S, C, []];
    };
  };
  // ======================================================================= SPACETIME (Newton's tug -> curved space; light follows the curve)
  LABK.spacetime = (o) => {
    const mode = o.mode || "tug", lightM = mode === "light";
    const S = stage("space", { key: 0.0001, hemi: 0.02, rim: 0, seed: 41, stars: 6000 });
    const Rs = lightM ? 1.1 : 1.2, sun = new THREE.Mesh(new THREE.SphereGeometry(Rs, 96, 48), starMat()); S.add(sun);
    const halo = glowSprite(0xffe2b8, Rs * 4.2, 0.28); S.add(halo);
    const sunL = new THREE.PointLight(0xfff1e0, 3.0, 0, 0); S.add(sunL);
    const grid = gridSheet(34, 240, P.fieldLine, 0.42); S.add(grid);
    const well = (D) => (x, z) => -Rs - D * Math.pow(1 + (x * x + z * z) / 2.0, -0.5);
    const C = cam(32);
    if (lightM) {
      // light beam along the curved sheet: z(x) = z0 - a/2 (sqrt(x^2+b^2) + x)  (straight in, bent towards the star, straight out)
      const D = 3.2, h = well(D), b = 2.0, al = 0.16, z0 = 3.0, x0 = -13, x1 = 13;
      const path = (u) => { const x = lerp(x0, x1, u), z = z0 - al / 2 * (Math.sqrt(x * x + b * b) + x); return V(x, h(x, z) + 0.05, z); };
      const head = { u: 0 };
      const beam = liveTube((u) => path(u * head.u), 220, 0.028, M.light(0xffe9c8, 0.95)); S.add(beam);
      const hg = glowSprite(0xfff1d6, 0.9, 0.7); S.add(hg);
      grid.userData.set(h);
      return (t, d) => {
        const ft = o.T0 + t;
        sun.position.y = halo.position.y = sunL.position.y = -Rs - D + Rs + 0.2;
        sun.material.uniforms.off.value = ft * 0.004;
        head.u = clamp(0.12 + (ft - 302.68) / 3.6, 0.001, 1);
        const hp = path(head.u); hg.position.copy(hp); hg.material.opacity = 0.7 * (1 - seg(head.u, 0.93, 1));
        camKF(C, [[302.68, 0, -2.4, 0, 21, -14, 50, 0.1, 0.04], [308.1, 0, -2.4, 0, 18.5, -2, 44, 0.1, 0.04]], ft);
        const pp = path(0.56);
        return [S, C, [["light follows the curve", pp.x, pp.y, pp.z, fadeIO(ft, 304.3, 308.6, 0.5)]]];
      };
    }
    // tug: Earth orbits the Sun; a straight 'tug' line joins them, then the grid takes over
    const sunDir = V(1, 0, 0), earth = earthG(0.36, sunDir); S.add(earth);
    earth.userData.atm.material.uniforms.R.value = 0.36;
    const tugG = new THREE.BufferGeometry().setFromPoints([V(), V()]), tug = new THREE.Line(tugG, M.line(0xf3e3c3, 0.6)); S.add(tug);
    const rE = 5.6;
    return (t, d) => {
      const ft = o.T0 + t;
      const s = seg(ft, 268.0, 271.6), D = 3.2 * s, h = well(D);
      grid.material.opacity = 0.42 * seg(ft, 267.4, 268.6); grid.visible = ft > 267.3;
      grid.userData.set(h);
      const sy = lerp(0, -Rs - D + Rs + 0.2, s);
      sun.position.y = halo.position.y = sunL.position.y = sy;
      sun.material.uniforms.off.value = ft * 0.004;
      const a = -0.3 * (ft - 265.26), ex = rE * Math.cos(a), ez = -rE * Math.sin(a) * 0.92;
      const ey = lerp(0, h(ex, ez) + 0.36 + 0.05, s);
      earth.position.set(ex, ey, ez); earth.userData.spin(ft * 4);
      const dir = V(ex, ey - sy, ez).normalize(); earth.userData.atm.material.uniforms.sun.value.copy(dir).negate(); earth.userData.atm.material.uniforms.c.value.copy(earth.position);
      const p0 = V(0, sy, 0).addScaledVector(dir, Rs + 0.1), p1 = earth.position.clone().addScaledVector(dir, -0.45);
      tugG.attributes.position.setXYZ(0, p0.x, p0.y, p0.z); tugG.attributes.position.setXYZ(1, p1.x, p1.y, p1.z); tugG.attributes.position.needsUpdate = true;
      tug.material.opacity = 0.6 * (1 - seg(ft, 267.3, 268.4)); tug.visible = tug.material.opacity > 0.001;
      camKF(C, [[258.96, 0, -0.2, 0, 19, -10, 16, 0, 0], [267.0, 0, -0.5, 0, 18, -2, 20, 0, 0], [271.6, 0, -1.8, 0, 19, 6, 34, 0, 0], [275.38, 0, -1.8, 0, 18, 12, 38, 0, 0]], ft);
      const m = p0.clone().lerp(p1, 0.72);
      return [S, C, [["an invisible tug", m.x, m.y, m.z, fadeIO(ft, 262.98, 267.6, 0.5)]]];
    };
  };
  // ======================================================================= DARK STAR (Michell's star that holds its own light; a star circling nothing)
  LABK.darkstar = (o) => {
    const mode = o.mode || "light", C = cam(32);
    const S = stage("space", { key: 0.0001, hemi: 0.0, rim: 0, seed: 51, stars: 4000 });
    S.add(starSky(52, 26000, 1));
    if (mode === "binary") {
      const star = new THREE.Mesh(new THREE.SphereGeometry(0.42, 64, 32), starMat(0xfff4e2)), glow = glowSprite(0xffe8c8, 2.6, 0.38);
      S.add(star, glow);
      const N = 120, pts = [], Ro = 3.2, ecc = 0.18, orb = (a) => { const r = Ro * (1 - ecc * ecc) / (1 + ecc * Math.cos(a)); return V(r * Math.cos(a), 0, -r * Math.sin(a)); };
      for (let i = 0; i < N; i++) pts.push(orb(i / N * TAU));
      const dots = new THREE.Points(new THREE.BufferGeometry().setFromPoints(pts), new THREE.PointsMaterial({ map: dotTex(), color: 0xc9d6e6, size: 0.15, transparent: true, opacity: 0.5, depthWrite: false }));
      const tilt = new THREE.Group(); tilt.rotation.set(0.12, 0, 0.08); tilt.add(dots); S.add(tilt);
      // Kepler-ish angle: faster near the focus
      const ang = (ft) => { const M0 = (ft - 204.04) * TAU / 13.5 + 2.2; let E = M0; for (let k = 0; k < 6; k++) E = M0 + ecc * Math.sin(E); return 2 * Math.atan2(Math.sqrt(1 + ecc) * Math.sin(E / 2), Math.sqrt(1 - ecc) * Math.cos(E / 2)); };
      return (t, d) => {
        const ft = o.T0 + t, p = orb(ang(ft)).applyEuler(tilt.rotation);
        star.position.copy(p); glow.position.copy(p); star.rotation.y = ft * 0.1;
        camKF(C, [[204.04, -Ro * ecc, 0, 0, 13.5, -18, 24, 0.12, 0.05], [220.2, -Ro * ecc, 0, 0, 12.0, 6, 28, 0.12, 0.05]], ft);
        return [S, C, [["moving around nothing", 0, 0, 0, fadeIO(ft, 211.4, 218.0, 0.6)]]];
      };
    }
    // light: a huge star; its light climbs, stops and falls back; then the star goes dark
    const Rst = 3, star = new THREE.Mesh(new THREE.SphereGeometry(Rst, 128, 64), starMat()), halo = glowSprite(0xffc890, Rst * 3.4, 0.5);
    const rim = new THREE.Mesh(new THREE.PlaneGeometry(Rst * 4.06, Rst * 4.06), new THREE.MeshBasicMaterial({ map: ringTex(), color: 0xffd2a0, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
    S.add(star, halo, rim);
    const NR = 22, rr = rnd(77), rays = [];
    for (let i = 0; i < NR; i++) rays.push({ ph: rr(), a: (i + rr() * 0.8) / NR * TAU, hmax: 0.7 + 1.0 * rr(), T: 4.2 + 2.2 * rr(), lat: (rr() < 0.5 ? -1 : 1) * (0.8 + 1.4 * rr()), gap: 0.3 + rr() * 1.4 });
    const NT = 18, segN = NR * NT, pos = new Float32Array(segN * 2 * 3), col = new Float32Array(segN * 2 * 3);
    const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.BufferAttribute(pos, 3)); rg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const rayL = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(rayL);
    const hp = new Float32Array(NR * 3), hc = new Float32Array(NR * 3), hg = new THREE.BufferGeometry();
    hg.setAttribute("position", new THREE.BufferAttribute(hp, 3)); hg.setAttribute("color", new THREE.BufferAttribute(hc, 3));
    const heads = new THREE.Points(hg, new THREE.PointsMaterial({ map: dotTex(), size: 0.22, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(heads);
    const cR = V(), cU = V(), cF = V(), tmp = V();
    return (t, d) => {
      const ft = o.T0 + t, k = 1 - seg(ft, 191.6, 198.6);
      star.material.uniforms.k.value = Math.pow(k, 1.3); star.material.uniforms.tint.value.setRGB(1, lerp(0.3, 1, k * k), lerp(0.12, 1, k * k * k)); star.material.uniforms.off.value = ft * 0.003; halo.material.opacity = 0.5 * k * k;
      camKF(C, [[180.08, 0, 0, 0, 19, -10, 8, 0.1, 0.03], [196.0, 0, 0, 0, 17.5, 0, 9, 0.11, 0.04], [200.5, 0, 0, 0, 17.2, 3, 9, 0.12, 0.1], [204.04, 0, 0, 0, 16.8, 6, 10, 0.12, 0.1]], ft);
      rim.material.opacity = 0.22 * seg(ft, 195, 199); rim.quaternion.copy(C.quaternion);
      C.updateMatrixWorld(); cR.setFromMatrixColumn(C.matrixWorld, 0); cU.setFromMatrixColumn(C.matrixWorld, 1); cF.copy(C.position).normalize();
      // rays launched from the visible limb, arcing back down (Newtonian corpuscles)
      for (let i = 0; i < NR; i++) {
        const q = rays[i], per = q.T + q.gap, u = (ft / per + q.ph) % 1, tau = u * per;
        const n = tmp.copy(cR).multiplyScalar(Math.cos(q.a)).addScaledVector(cU, Math.sin(q.a)).addScaledVector(cF, 0.12).normalize();
        const tg = V().crossVectors(cF, n).normalize();
        const bright = (tau < q.T ? 1 : 0) * smooth(tau / 0.25) * smooth((q.T - tau) / 0.3) * (0.3 + 0.7 * k);
        const at = (s) => { s = clamp(s, 0, q.T); const x = s / q.T, h = q.hmax * 4 * x * (1 - x); return n.clone().multiplyScalar(Rst + h).addScaledVector(tg, q.lat * x); };
        for (let j = 0; j < NT; j++) {
          const s0 = tau - 2.4 * (j + 1) / NT, s1 = tau - 2.4 * j / NT, a0 = at(s0), a1 = at(s1), b0 = bright * (1 - (j + 1) / NT) * 0.8, b1 = bright * (1 - j / NT) * 0.8, o6 = (i * NT + j) * 6;
          pos.set([a0.x, a0.y, a0.z, a1.x, a1.y, a1.z], o6); col.set([b0, b0 * 0.8, b0 * 0.56, b1, b1 * 0.8, b1 * 0.56], o6);
        }
        const hpnt = at(tau); hp.set([hpnt.x, hpnt.y, hpnt.z], i * 3); hc.set([bright, bright * 0.9, bright * 0.75], i * 3);
      }
      rg.attributes.position.needsUpdate = rg.attributes.color.needsUpdate = hg.attributes.position.needsUpdate = hg.attributes.color.needsUpdate = true;
      const pinP = cR.clone().multiplyScalar(Rst * 0.72).addScaledVector(cU, Rst * 0.72);
      return [S, C, [["dark star", pinP.x, pinP.y, pinP.z, fadeIO(ft, 200.9, 204.6, 0.6)]]];
    };
  };
  // ======================================================================= LIGHTBEND (1919 eclipse: starlight bends past the Sun)
  const coronaTex = once(() => canvasTex(1024, 1024, (g, w) => {
    const c = w / 2, r0 = w * 0.14, r = rnd(19);
    const gr = g.createRadialGradient(c, c, r0 * 0.98, c, c, w / 2); gr.addColorStop(0, "rgba(255,246,232,.95)"); gr.addColorStop(0.02, "rgba(255,240,220,.4)"); gr.addColorStop(0.12, "rgba(235,228,220,.1)"); gr.addColorStop(0.4, "rgba(220,220,225,.025)"); gr.addColorStop(1, "rgba(220,220,225,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
    g.globalCompositeOperation = "lighter";
    for (let i = 0; i < 300; i++) {
      const a = r() * TAU, l = r0 * (0.6 + 2.2 * Math.pow(r(), 2.5) * (0.6 + 0.4 * Math.abs(Math.cos(a)))), wd = 0.004 + 0.02 * r();
      const lg = g.createRadialGradient(c, c, r0, c, c, r0 + l); lg.addColorStop(0, "rgba(255,244,228,.05)"); lg.addColorStop(1, "rgba(255,244,228,0)");
      g.fillStyle = lg; g.beginPath(); g.moveTo(c, c); g.arc(c, c, r0 + l, a - wd, a + wd); g.closePath(); g.fill();
    }
  }));
  LABK.lightbend = (o) => {
    const S = stage("space", { key: 2.2, hemi: 0.02, rim: 0, seed: 61, stars: 3000 });
    S.userData.key.position.set(-10, 6, 4);
    S.add(starSky(62, 22000, 0.9));
    const moon = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 48), new THREE.MeshBasicMaterial({ color: 0x020203 })); S.add(moon);
    const cor = new THREE.Mesh(new THREE.PlaneGeometry(1 / 0.14, 1 / 0.14), new THREE.MeshBasicMaterial({ map: coronaTex(), transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(cor);
    // path (in the XY plane, passing above the Sun): straight from the star, bent towards the Sun near closest approach, straight to Earth
    const xS = -7, xE = 6.5, b = 1.1, al = 0.2, Y = 1.4, y0 = Y + al * b / 2, s0 = -(y0 - al / 2 * (Math.sqrt(xE * xE + b * b) + xE)) / xE;
    const yf = (x) => y0 - al / 2 * (Math.sqrt(x * x + b * b) + x) + s0 * x, slopeE = s0 - al / 2 * (xE / Math.sqrt(xE * xE + b * b) + 1);
    const path = (u) => { const x = lerp(xS, xE, u); return V(x, yf(x), 0); };
    const pts = []; for (let i = 0; i <= 300; i++) pts.push(path(i / 300));
    const curve = new THREE.CatmullRomCurve3(pts), tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 300, 0.015, 8, false), M.light(0xffdcae, 0.9)); S.add(tube);
    const ghostP = V(xS, slopeE * (xS - xE), 0), trueP = path(0);
    const dl = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(xE, 0, 0), ghostP]), new THREE.LineDashedMaterial({ color: 0xdfe6f0, dashSize: 0.25, gapSize: 0.22, transparent: true, opacity: 0.5, depthWrite: false }));
    dl.computeLineDistances(); S.add(dl);
    const star = glowSprite(0xfff4e4, 1.3, 0.95), ghost = glowSprite(0xfff4e4, 1.1, 0.45); star.position.copy(trueP); ghost.position.copy(ghostP); S.add(star, ghost);
    const sunDir = V(-1, 0, 0), earth = earthG(0.45, sunDir); earth.position.set(xE, 0, 0); earth.userData.atm.material.uniforms.c.value.copy(earth.position); S.add(earth);
    // chevrons travelling along the path towards Earth
    const NC = 26, cp = new Float32Array(NC * 4 * 3), cg = new THREE.BufferGeometry(); cg.setAttribute("position", new THREE.BufferAttribute(cp, 3));
    const chev = new THREE.LineSegments(cg, new THREE.LineBasicMaterial({ color: 0xffe2bc, transparent: true, opacity: 0.85, depthWrite: false })); S.add(chev);
    const C = cam(32), up = V(0, 0, 1), dc = V();
    return (t, d) => {
      const ft = o.T0 + t, rev = seg(ft, 321.3, 323.6);
      tube.geometry.setDrawRange(0, Math.floor(rev * 300) * 8 * 6);
      earth.userData.spin(ft);
      const sh = seg(ft, 323.2, 324.2); dl.material.opacity = 0.5 * sh; ghost.material.opacity = 0.45 * sh;
      camKF(C, [[321.26, -0.3, 1.0, 0, 18, -6, 5, 0, 0], [326.0, -0.3, 1.0, 0, 17, 4, 6, 0, 0], [330.8, 0.2, 1.5, 0, 6.0, 16, 4, 0, 0], [335.96, 0.3, 1.5, 0, 5.0, 24, 3, 0, 0]], ft);
      cor.quaternion.copy(C.quaternion); dc.copy(C.position); const fs = dc.length() / Math.sqrt(dc.lengthSq() - 1); cor.scale.setScalar(fs); moon.scale.setScalar(fs * 0.995);
      const ch = seg(ft, 322.2, 323.4);
      for (let i = 0; i < NC; i++) {
        const u = ((i / NC + ft * 0.035) % 1) * rev, p = curve.getPointAt(clamp(u, 0, 1)), tg = curve.getTangentAt(clamp(u, 0.001, 0.999)), side = V().crossVectors(tg, up).normalize();
        const sc = 0.12, a = p.clone().addScaledVector(tg, -sc).addScaledVector(side, sc * 0.7), bb = p.clone().addScaledVector(tg, -sc).addScaledVector(side, -sc * 0.7), o12 = i * 12;
        cp.set([a.x, a.y, a.z, p.x, p.y, p.z, bb.x, bb.y, bb.z, p.x, p.y, p.z], o12);
      }
      cg.attributes.position.needsUpdate = true; chev.material.opacity = 0.8 * ch;
      const pf = 1 - seg(ft, 326.4, 327.4);
      return [S, C, [["true position", trueP.x, trueP.y, trueP.z, seg(ft, 322.0, 322.6) * pf], ["where we see it", ghostP.x, ghostP.y, ghostP.z, seg(ft, 323.6, 324.2) * pf]]];
    };
  };
  // ======================================================================= ESCAPE (escape velocity)
  // 2D Newtonian flight from the surface of a unit planet (GM = 1): launch at f x escape speed, angle a from vertical
  function flight(f, a, tMax, rMax) {
    const v0 = f * Math.SQRT2, dt = 0.002, pts = [[0, 1]]; let x = 0, y = 1, vx = v0 * Math.sin(a), vy = v0 * Math.cos(a), t = 0, landed = false;
    while (t < tMax) {
      let r3 = Math.pow(x * x + y * y, 1.5); vx -= 0.5 * dt * x / r3; vy -= 0.5 * dt * y / r3;
      x += dt * vx; y += dt * vy; r3 = Math.pow(x * x + y * y, 1.5); vx -= 0.5 * dt * x / r3; vy -= 0.5 * dt * y / r3;
      t += dt; pts.push([x, y]);
      if (t > 0.02 && x * x + y * y < 1) { landed = true; break; }
      if (rMax && x * x + y * y > rMax * rMax) break;
    }
    return { pts, dt, T: t, landed };
  }
  const fAt = (F, tau) => { const i = clamp(tau / F.dt, 0, F.pts.length - 1), i0 = Math.floor(i), i1 = Math.min(i0 + 1, F.pts.length - 1), u = i - i0; return [lerp(F.pts[i0][0], F.pts[i1][0], u), lerp(F.pts[i0][1], F.pts[i1][1], u)]; };
  // a throw drawn in the world: planet centre c, radius R, launch normal N and tangent T; k = tau per film second
  function makeThrow(S, F, c, R, N, T, t0, k, op, tOff) {
    const NP = 240, pos = new Float32Array(NP * 3), g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const line = new THREE.Line(g, new THREE.LineBasicMaterial({ color: 0xf2e6d2, transparent: true, opacity: 0, depthWrite: false })); S.add(line);
    const head = glowSprite(0xfff4e4, 0.18 * R, 0); S.add(head);
    const w = (p) => V(c.x + R * (p[0] * T.x + p[1] * N.x), c.y + R * (p[0] * T.y + p[1] * N.y), c.z + R * (p[0] * T.z + p[1] * N.z));
    return {
      pos: (ft) => w(fAt(F, (ft - t0) * k)),
      set(ft) {
        const tau = (ft - t0) * k, live = ft >= t0;
        line.visible = head.visible = live; if (!live) return;
        const te = Math.min(tau, F.T);
        for (let i = 0; i < NP; i++) { const p = w(fAt(F, te * i / (NP - 1))); pos.set([p.x, p.y, p.z], i * 3); }
        g.attributes.position.needsUpdate = true;
        const fade = Math.max(F.landed ? seg(tau, F.T, F.T + 1.4 * k) : seg(tau, F.T - 2.5 * k, F.T), tOff ? seg(ft, tOff - 1.2, tOff) : 0);
        line.material.opacity = (op || 0.55) * (1 - fade);
        head.position.copy(w(fAt(F, te))); head.material.opacity = 0.9 * (tau < F.T ? 1 : 0) * (1 - fade);
      },
    };
  }
  const kFor = (F, dur) => F.T / dur;
  // a rough grey stone
  const stoneTex = once(() => canvasTex(512, 256, (g, w, h) => { const r = rnd(23); g.fillStyle = "#77746e"; g.fillRect(0, 0, w, h); for (let i = 0; i < 9000; i++) { const v = 70 + r() * 90 | 0; g.fillStyle = `rgba(${v},${v - 3},${v - 8},${0.15 + r() * 0.3})`; g.fillRect(r() * w, r() * h, 1 + r() * 3, 1 + r() * 2); } }));
  function stoneGeo(rad, seed) {
    const g = new THREE.IcosahedronGeometry(rad, 5), p = g.attributes.position, r = rnd(seed), K = [];
    for (let i = 0; i < 14; i++) { const hi = i >= 7; K.push([V(r() - 0.5, r() - 0.5, r() - 0.5).normalize(), hi ? 7 + r() * 9 : 1.5 + r() * 3.5, r() * 6, hi ? 0.012 + r() * 0.012 : 0.05 + r() * 0.06]); }
    for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)), n = v.clone().normalize(); let d = 1; for (const [kd, f, ph, a] of K) d += a * Math.sin(n.dot(kd) * f + ph); v.copy(n).multiplyScalar(rad * d); v.y *= 0.72; v.z *= 0.88; p.setXYZ(i, v.x, v.y, v.z); }
    g.computeVertexNormals(); return g;
  }
  const grassTex = once(() => { const t = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#2a3520"; g.fillRect(0, 0, w, h); const r = rnd(8); for (let i = 0; i < 50000; i++) { const x = r() * w, y = r() * h, l = 3 + r() * 9, c = r(); g.strokeStyle = c < 0.55 ? `rgba(${70 + r() * 40 | 0},${88 + r() * 40 | 0},${40 + r() * 20 | 0},.45)` : `rgba(${28 + r() * 20 | 0},${36 + r() * 18 | 0},20,.55)`; g.lineWidth = 1; g.beginPath(); g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 3, y - l); g.stroke(); } }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(70, 70); t.anisotropy = 8; return t; });
  const duskTex = once(() => canvasTex(2048, 1024, (g, w, h) => {
    const hz = h / 2, gr = g.createLinearGradient(0, 0, 0, hz);
    gr.addColorStop(0, "#0d1426"); gr.addColorStop(0.45, "#1f2a48"); gr.addColorStop(0.75, "#4a4a66"); gr.addColorStop(0.9, "#9a7268"); gr.addColorStop(0.97, "#d89a6c"); gr.addColorStop(1, "#e7ad7a");
    g.fillStyle = gr; g.fillRect(0, 0, w, hz); g.fillStyle = "#3a3330"; g.fillRect(0, hz, w, h - hz);
    const sx = w * 0.62, sg = g.createRadialGradient(sx, hz, 0, sx, hz, h * 0.45); sg.addColorStop(0, "rgba(255,190,130,.55)"); sg.addColorStop(0.4, "rgba(230,140,100,.18)"); sg.addColorStop(1, "rgba(200,120,100,0)");
    g.fillStyle = sg; g.fillRect(0, 0, w, hz);

  }));
  const treeTex = once(() => canvasTex(4096, 256, (g, w, h) => {
    const r = rnd(4); g.fillStyle = "#12150f"; g.fillRect(0, h - 18, w, 18);
    for (let x = -20; x <= w + 20; x += 6 + r() * 16) { const n = 0.5 + 0.5 * Math.sin(x * 0.0021) * Math.sin(x * 0.0009 + 2), rad = (10 + 34 * n) * (0.55 + 0.6 * r()); g.beginPath(); g.ellipse(x, h - 14 - rad * 0.7, rad * (0.8 + 0.5 * r()), rad, 0, 0, TAU); g.fill();
      if (r() < 0.25) { g.fillRect(x - 1.5, h - 14 - rad * 1.4, 3, rad); g.beginPath(); g.ellipse(x, h - 14 - rad * 1.55, rad * 0.45, rad * 0.6, 0, 0, TAU); g.fill(); } }
  }));
  function tossScene(o, C) {
    C.fov = 42; C.updateProjectionMatrix();
    const S = stage("void", { dust: 0, bg: 0x1a1d28, key: 2.2, hemi: 1.0, rim: 0.0 });
    const fill = new THREE.DirectionalLight(0x9aa6cc, 1.1); fill.position.set(2, 4, 10); S.add(fill);
    S.fog = new THREE.Fog(0x2e2a2c, 14, 110);
    const key = S.userData.key; key.color.set(0xffb27a); key.position.set(-14, 3, -30);
    S.children.forEach((c) => { if (c.isHemisphereLight) { c.color.set(0x6a78a8); c.groundColor.set(0x2a2a1c); } });
    const sky = new THREE.Mesh(new THREE.SphereGeometry(300, 64, 32), new THREE.MeshBasicMaterial({ map: duskTex(), side: THREE.BackSide, fog: false, depthWrite: false })); sky.rotation.y = 0.3; S.add(sky);
    const trees = new THREE.Mesh(new THREE.CylinderGeometry(150, 150, 14, 96, 1, true, Math.PI - 1.0, 2.0), new THREE.MeshBasicMaterial({ map: treeTex(), transparent: true, side: THREE.BackSide, fog: false, depthWrite: false, color: 0x8a8a8a }));
    trees.position.set(0, 6.6, 0); S.add(trees);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ map: grassTex(), color: 0x6a7258, roughness: 1 })); ground.rotation.x = -Math.PI / 2; S.add(ground);
    const bg = new THREE.BufferGeometry(), bp = [], N = 26000;
    for (let k = 0; k < 4; k++) { const y0 = k / 4, y1 = (k + 1) / 4, w0 = 0.03 * (1 - y0), w1 = 0.03 * (1 - y1), c0 = 0.12 * y0 * y0, c1 = 0.12 * y1 * y1; bp.push(-w0, y0, c0, w0, y0, c0, w1, y1, c1, -w0, y0, c0, w1, y1, c1, -w1, y1, c1); }
    bg.setAttribute("position", new THREE.Float32BufferAttribute(bp, 3)); bg.computeVertexNormals();
    const blades = new THREE.InstancedMesh(bg, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.85, side: THREE.DoubleSide }), N), r = rnd(31), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
    for (let i = 0; i < N; i++) {
      const z = 4.2 - Math.pow(r(), 1.7) * 50, x = (r() - 0.5) * (14 + 1.1 * (4.2 - z)), s = (0.08 + 0.2 * r()) * (1 + 0.03 * (4.2 - z));
      q.setFromEuler(new THREE.Euler((r() - 0.5) * 0.5, r() * TAU, (r() - 0.5) * 0.5)); m4.compose(V(x, 0, z), q, V(s, s * (0.8 + r() * 0.7), s)); blades.setMatrixAt(i, m4);
      col.setRGB(0.09 + 0.06 * r(), 0.12 + 0.07 * r(), 0.06 + 0.03 * r()); blades.setColorAt(i, col);
    }
    S.add(blades);
    const stone = new THREE.Mesh(stoneGeo(0.11, 5), new THREE.MeshStandardMaterial({ map: stoneTex(), bumpMap: stoneTex(), bumpScale: 2, color: 0xa29d94, roughness: 0.95 })); S.add(stone);
    // throw 1: one slow-motion parabola, apex 45.0, back at hand height 49.3; a quick catch, then a harder throw 2
    // that is still climbing at the cut (the camera tilts up after it, so the stone never leaves the frame)
    const H1 = 2.4, y0 = 0.3, G1 = 2 * (H1 - y0) / (4.32 * 4.32), TL = 49.4, V2 = 3.0, CA = 49.15, CB = 49.6;
    const p1 = (ft) => [H1 - 0.5 * G1 * (ft - 45) * (ft - 45), -G1 * (ft - 45)];
    const p2 = (ft) => [y0 + V2 * (ft - TL) - 0.5 * G1 * (ft - TL) * (ft - TL), V2 - G1 * (ft - TL)];
    const [ya, va] = p1(CA), [yb, vb] = p2(CB), hc = CB - CA;
    const yAt = (ft) => {
      if (ft <= CA) return p1(ft)[0];
      if (ft >= CB) return p2(ft)[0];
      const s = (ft - CA) / hc, s2 = s * s, s3 = s2 * s;   // Hermite catch: position and speed continuous
      return (2 * s3 - 3 * s2 + 1) * ya + (s3 - 2 * s2 + s) * hc * va + (-2 * s3 + 3 * s2) * yb + (s3 - s2) * hc * vb;
    };
    const SZ = 4.0, CY = 0.9, P0 = 8.95 * D2R;
    // camera pitch: base framing, pushed just enough to keep the stone between 15 deg below and 12 deg above centre; box-filtered in time so it glides
    const pitchAt = (ft, camZ) => { const e = Math.atan2(yAt(ft) - CY, camZ - SZ); return P0 + Math.max(0, e - P0 - 12 * D2R) - Math.max(0, P0 - 15 * D2R - e); };
    return (t, d) => {
      const ft = o.T0 + t, y = yAt(ft), u = ft - 40.0 + 1.6 * Math.max(0, ft - TL);
      stone.position.set(0.05, y, SZ); stone.rotation.set(0.6 + u * 1.1, 0.3 + u * 0.7, u * 0.35);
      const cz = 7.3 - 0.05 * t;
      let pitch = 0; for (let k = -5; k <= 5; k++) pitch += pitchAt(ft + k * 0.14, cz) / 11;
      C.clearViewOffset(); C.position.set(-0.25 + 0.05 * t, CY, cz); C.lookAt(0.12, CY + Math.tan(pitch) * cz, 0);
      return [S, C, []];
    };
  }
  LABK.escape = (o) => {
    const mode = o.mode || "intro", C = cam(32);
    if (mode === "toss") return tossScene(o, C);
    const S = stage("space", { key: 2.8, hemi: 0.015, rim: 0, seed: 21, stars: 7000 });
    const sunDir = V(0.55, 0.45, 0.7).normalize(); S.userData.key.position.copy(sunDir).multiplyScalar(40);
    const earth = earthG(2, sunDir); earth.rotation.z = 0.41; S.add(earth);
    if (mode === "intro") return (t, d) => {
      const ft = o.T0 + t; earth.userData.spin(ft);
      aim(C, 0, 0, 0, lerp(8.8, 8.0, smooth(t / d)), lerp(-26, -14, t / d), lerp(14, 10, t / d), 0, 0);
      return [S, C, []];
    };
    // throws
    const P2c = V(9, 1.6, -3), P2R = 1.6;
    const p2 = new THREE.Mesh(new THREE.SphereGeometry(P2R, 96, 48), new THREE.MeshStandardMaterial({ map: tex("2k_moon.jpg"), bumpMap: tex("2k_moon.jpg"), bumpScale: 1.5, color: 0x8a7462, roughness: 1, envMapIntensity: 0.03 }));
    p2.position.copy(P2c); S.add(p2);
    const basis = (az, ang) => { const right = V(Math.cos(az * D2R), 0, -Math.sin(az * D2R)), toCam = V(Math.sin(az * D2R), 0, Math.cos(az * D2R)), N = right.clone().multiplyScalar(Math.cos(ang * D2R)).addScaledVector(V(0, 1, 0), Math.sin(ang * D2R)).addScaledVector(toCam, 0.2).normalize(); const T = right.clone().addScaledVector(N, -right.dot(N)).normalize(); return [N, T]; };
    const [N1, T1] = basis(-8, 100), [N2, T2] = basis(-8, 98), A = 18 * D2R;
    const thr = (f, c, R, N, T, t0, dur) => { const F = flight(f, A, 50); return makeThrow(S, F, c, R, N, T, t0, kFor(F, dur)); };
    const throws = [thr(0.5, V(), 2, N1, T1, 50.8, 2.4), thr(0.64, V(), 2, N1, T1, 52.5, 3.0), thr(0.76, V(), 2, N1, T1, 54.4, 3.7), thr(0.86, V(), 2, N1, T1, 56.5, 4.8)];
    // the escaping throw: reaches 4.6 planet radii at the pin time (65.7)
    const Fe = flight(1.12, A, 400, 14); let ie = 0; while (ie < Fe.pts.length - 1 && Math.hypot(Fe.pts[ie][0], Fe.pts[ie][1]) < 3.4) ie++;
    const esc = makeThrow(S, Fe, V(), 2, N1, T1, 59.5, ie * Fe.dt / 6.2, 0.6, 69.6); throws.push(esc);
    // the denser planet: the same throw (half its escape speed) falls back fast; a faster one escapes
    throws.push(thr(0.5, P2c, P2R, N2, T2, 80.0, 1.9));
    const Fe2 = flight(1.15, A, 400, 16); let i2 = 0; while (i2 < Fe2.pts.length - 1 && Math.hypot(Fe2.pts[i2][0], Fe2.pts[i2][1]) < 5) i2++;
    throws.push(makeThrow(S, Fe2, P2c, P2R, N2, T2, 83.0, i2 * Fe2.dt / 4.5, 0.6, 89.5));
    return (t, d) => {
      const ft = o.T0 + t; earth.userData.spin(ft); p2.rotation.y = ft * 0.02; p2.visible = ft > 71.5;
      throws.forEach((q) => q.set(ft));
      camKF(C, [[50.7, -0.3, 2.0, 0, 10.5, -8, 6, 0, 0], [56.0, -0.2, 2.6, 0, 15, -8, 7, 0, 0], [59.5, 0, 3.0, 0, 18.5, -8, 8, 0, 0], [64.5, 0.8, 3.5, 0, 24, -8, 9, 0, 0], [67.8, 1.0, 4.2, 0, 25.5, -8, 9, 0, 0],
        [69.3, 0, 0, 0, 22, -8, 8, 0.33, 0], [76.8, 0, 0, 0, 20, -6, 8, 0.33, 0], [80.0, 4.5, 1.0, -1.5, 16.5, -8, 8, 0, 0.06], [87.5, 4.5, 1.2, -1.5, 17.5, -10, 8, 0.04, 0.2], [93.16, 4.5, 1.2, -1.5, 17, -12, 8, 0.04, 0.2]], ft);
      const ep = esc.pos(Math.min(ft, 68.3));
      return [S, C, [["escape velocity", ep.x, ep.y, ep.z, fadeIO(ft, 65.7, 68.3, 0.4)]]];
    };
  };
  // ======================================================================= SHRINK (Earth squeezed at constant mass -> marble-sized black hole)
  function marble(R) {
    const G = new THREE.Group();
    G.add(new THREE.Mesh(new THREE.SphereGeometry(R, 96, 64), new THREE.MeshPhysicalMaterial({ color: 0xcfe3ea, roughness: 0.14, metalness: 0, transmission: 0.82, thickness: R * 0.8, ior: 1.45, envMapIntensity: 0.4, clearcoat: 0.6, clearcoatRoughness: 0.18 })));
    // ponytail: one soft inner swirl core seen through the glass (twisted ribbons read as broken geometry)
    const core = canvasTex(512, 256, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, w, 0);
      gr.addColorStop(0, "#3f6890"); gr.addColorStop(0.35, "#9fc0dc"); gr.addColorStop(0.55, "#b98552"); gr.addColorStop(0.75, "#5d86ad"); gr.addColorStop(1, "#3f6890");
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
    });
    const inner = new THREE.Mesh(new THREE.SphereGeometry(R * 0.55, 64, 32), new THREE.MeshStandardMaterial({ map: core, roughness: 0.45, metalness: 0 }));
    inner.scale.set(1, 0.35, 1); inner.rotation.set(0.5, 0, 0.35);
    G.add(inner);
    return G;
  }
  const kmFmt = (v) => { const e = Math.pow(10, Math.floor(Math.log10(v)) - 1); return Math.round(Math.round(v / e) * e).toLocaleString("en-US"); };
  LABK.shrink = (o) => {
    const S = stage("space", { key: 3.0, hemi: 0.012, rim: 0, seed: 31, stars: 3000 });
    S.add(starSky(32, 24000, 0.95));
    const sunDir = V(-0.6, 0.35, 0.72).normalize(); S.userData.key.position.copy(sunDir).multiplyScalar(40);
    const E = earthG(1, sunDir); E.rotation.z = 0.41; S.add(E);
    const em = E.userData.e.material, cm = E.userData.cl.material, am = E.userData.atm.material;
    // former-size rings: one each time Earth gets 10x smaller (they expand outwards as the camera eases in)
    const circ = []; for (let i = 0; i < 200; i++) { const a = i / 200 * TAU; circ.push(V(Math.cos(a), Math.sin(a), 0)); }
    const cg = new THREE.BufferGeometry().setFromPoints(circ), rings = [];
    for (let k = 0; k < 9; k++) { const l = new THREE.LineLoop(cg, M.line(P.fieldLine, 0)); S.add(l); rings.push(l); }
    const mb = marble(1); S.add(mb);
    const hole = new THREE.Mesh(new THREE.SphereGeometry(1.004, 96, 48), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0 })); S.add(hole);
    // photon ring for the dark phase
    const pr = new THREE.Mesh(new THREE.PlaneGeometry(4 * 1.32, 4 * 1.32), new THREE.MeshBasicMaterial({ map: ringTex(), color: 0xffe0b8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(pr);
    // light rays that leave the surface and fall back (129.6)
    const rays = [], rr = rnd(9);
    for (let i = 0; i < 14; i++) { const F = flight(0.5 + 0.14 * rr(), (rr() - 0.5) * 70 * D2R, 50); rays.push({ F, ang: -60 + i * 21 + rr() * 10, t0: 129.6 + i * 0.22 + rr() * 0.2, dur: 1.4 + 0.5 * rr() }); }
    const NP = 120, rp = new Float32Array(rays.length * (NP - 1) * 6), rc = new Float32Array(rays.length * (NP - 1) * 6), rgeo = new THREE.BufferGeometry();
    rgeo.setAttribute("position", new THREE.BufferAttribute(rp, 3)); rgeo.setAttribute("color", new THREE.BufferAttribute(rc, 3));
    const rayL = new THREE.LineSegments(rgeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(rayL);
    const C = cam(32), cR = V(), cU = V();
    const LM = Math.log(6371e3 / 0.009), T1 = 99.54, T2 = 123.6;
    const Lf = (ft) => LM * smooth((ft - T1) / (T2 - T1));
    return (t, d) => {
      const ft = o.T0 + t, L = Lf(ft);
      E.userData.spin(ft);
      // on-screen size: true shrink at first, then the camera eases in and keeps Earth a good size
      const g = KF([[T1, 1], [103.5, 0.62], [T2, 0.62], [126, 0.5]], ft), side = seg(ft, 122.8, 125.6);
      const az = lerp(-8, 14, (ft - 93.16) / 46.74), el = lerp(10, 6, (ft - 93.16) / 46.74);
      aim(C, 1.25 * side, 0.15 * side, 0, 5.4 / g, az, el, 0.1 * side, 0.08 * side);
      C.updateMatrixWorld(); cR.setFromMatrixColumn(C.matrixWorld, 0); cU.setFromMatrixColumn(C.matrixWorld, 1);
      rings.forEach((l, k) => { const r = Math.exp(L - k * Math.LN10); l.visible = L >= k * Math.LN10 && r < 7; l.scale.setScalar(r * 1.012); l.quaternion.copy(C.quaternion); l.material.opacity = 0.42 * seg(r, 1.0, 1.25) * (1 - seg(r, 2.2, 6.5)); });
      // marble floats in from the right
      const mx = lerp(5.5, 2.5, smooth((ft - 123.0) / 2.6)); mb.visible = ft > 122.9;
      mb.position.copy(cR).multiplyScalar(mx).addScaledVector(cU, 0.35 + 0.05 * Math.sin(ft * 0.7)); mb.rotation.set(0.3 + ft * 0.05, ft * 0.12, 0.2);
      // goes dark
      const dk = seg(ft, 131.7, 133.4);
      em.color.setScalar(1 - dk); em.envMapIntensity = 0.04 * (1 - dk); cm.opacity = 1 - dk; am.uniforms.k.value = 1 - dk;
      hole.material.opacity = dk; hole.visible = dk > 0;
      pr.quaternion.copy(C.quaternion); pr.material.opacity = 0.28 * seg(ft, 132.2, 134.2);
      // rays in the screen plane
      for (let i = 0; i < rays.length; i++) {
        const q = rays[i], a = (90 + q.ang) * D2R, N = cR.clone().multiplyScalar(Math.cos(a)).addScaledVector(cU, Math.sin(a)), T = cR.clone().multiplyScalar(Math.sin(a)).addScaledVector(cU, -Math.cos(a));
        const per = q.dur * 1.6, n = Math.floor((ft - q.t0) / per), fl = ft < q.t0 || q.t0 + n * per > 134.6 ? -1 : ft - q.t0 - n * per;   // relaunched until 134.6
        const tau = clamp(fl / q.dur, 0, 1.6) * q.F.T, te = Math.min(tau, q.F.T), fade = (fl >= 0 ? 1 : 0) * (1 - seg(tau, q.F.T, q.F.T * 1.4));
        for (let j = 0; j < NP - 1; j++) {
          const s0 = te * j / (NP - 1), s1 = te * (j + 1) / (NP - 1), p0 = fAt(q.F, s0), p1 = fAt(q.F, s1), b0 = fade * 0.85 * Math.pow(j / (NP - 1), 1.5), b1 = fade * 0.85 * Math.pow((j + 1) / (NP - 1), 1.5), o6 = (i * (NP - 1) + j) * 6;
          rp.set([p0[0] * T.x + p0[1] * N.x, p0[0] * T.y + p0[1] * N.y, p0[0] * T.z + p0[1] * N.z, p1[0] * T.x + p1[1] * N.x, p1[0] * T.y + p1[1] * N.y, p1[0] * T.z + p1[1] * N.z], o6);
          rc.set([b0, b0 * 0.84, b0 * 0.6, b1, b1 * 0.84, b1 * 0.6], o6);
        }
      }
      rgeo.attributes.position.needsUpdate = rgeo.attributes.color.needsUpdate = true;
      // pins
      const v = 11.2 * Math.exp(L / 2), pe = cR.clone().multiplyScalar(-0.6).addScaledVector(cU, 0.72);
      const txt = ft > 124.0 ? "escape speed > light speed" : "escape speed " + kmFmt(Math.min(v, 299792)) + " km/s";
      const pm = mb.position.clone().addScaledVector(cU, 0.75);
      return [S, C, [[txt, pe.x, pe.y, pe.z, fadeIO(ft, 100.2, 125.2, 0.5)], ["about 9 mm", pm.x, pm.y, pm.z, fadeIO(ft, 125.6, 131.4, 0.6)]]];
    };
  };
  // ======================================================================= NOTEBOOK (old pages on a desk / shelf, handwriting revealed by film time)
  const PW = 1200, PH = 1600, SUN = { sun: 1 };
  const FONT = (st, px) => `${st}${px}px Georgia, "Times New Roman", serif`;
  // rich text: strings, [text, scale, dy] sub/superscripts, {f: [num, den]} fractions, SUN = the solar symbol drawn by hand
  function rich(g, x, y, parts, size, st, dry) {
    for (const p of parts) {
      if (typeof p === "string") { g.font = FONT(st, size); if (!dry) g.fillText(p, x, y); x += g.measureText(p).width; }
      else if (p === SUN) { if (!dry) { g.save(); g.strokeStyle = g.fillStyle; g.lineWidth = Math.max(1.5, size * 0.055); g.beginPath(); g.arc(x + size * 0.34, y - size * 0.3, size * 0.27, 0, TAU); g.stroke(); g.beginPath(); g.arc(x + size * 0.34, y - size * 0.3, size * 0.06, 0, TAU); g.fill(); g.restore(); } x += size * 0.72; }
      else if (p.f) {
        const s2 = size * 0.72, wn = rich(g, 0, 0, p.f[0], s2, st, true), wd = rich(g, 0, 0, p.f[1], s2, st, true), w = Math.max(wn, wd) + size * 0.3;
        if (!dry) { rich(g, x + (w - wn) / 2, y - size * 0.44, p.f[0], s2, st); rich(g, x + (w - wd) / 2, y + size * 0.4, p.f[1], s2, st); g.fillRect(x, y - size * 0.3, w, Math.max(2, size * 0.045)); }
        x += w + size * 0.08;
      } else x = rich(g, x, y + p[2] * size, [p[0]], size * p[1], st, dry);
    }
    return x;
  }
  function paper(g, seed, base, age, ruled) {
    g.fillStyle = base; g.fillRect(0, 0, PW, PH);
    const id = g.getImageData(0, 0, PW, PH), d = id.data, r = rnd(seed);
    for (let i = 0; i < d.length; i += 4) { const n = (r() - 0.5) * 14; d[i] += n; d[i + 1] += n; d[i + 2] += n * 0.9; }
    g.putImageData(id, 0, 0);
    for (let i = 0; i < 18 * age; i++) { const x = r() * PW, y = r() * PH, rad = 20 + r() * 160, gr = g.createRadialGradient(x, y, 0, x, y, rad); gr.addColorStop(0, `rgba(120,80,30,${0.05 + 0.08 * r()})`); gr.addColorStop(1, "rgba(120,80,30,0)"); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    for (let i = 0; i < 60 * age; i++) { g.fillStyle = `rgba(110,70,30,${0.08 + 0.15 * r()})`; g.beginPath(); g.arc(r() * PW, r() * PH, 1 + r() * 4, 0, TAU); g.fill(); }
    if (ruled) { g.strokeStyle = "rgba(90,120,160,.28)"; g.lineWidth = 2; for (let y = 230; y < PH - 60; y += 70) { g.beginPath(); g.moveTo(0, y); g.lineTo(PW, y); g.stroke(); } g.strokeStyle = "rgba(170,70,60,.35)"; g.beginPath(); g.moveTo(130, 0); g.lineTo(130, PH); g.stroke(); }
    const edge = (x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(95,60,25,${0.35 * age})`); gr.addColorStop(1, "rgba(95,60,25,0)"); g.fillStyle = gr; g.fillRect(0, 0, PW, PH); };
    edge(0, 0, 90, 0); edge(PW, 0, PW - 90, 0); edge(0, 0, 0, 90); edge(0, PH, 0, PH - 90);
  }
  const INK = "rgba(36,26,16,0.93)";
  // a page: static ink on the base, timed items revealed left to right, timed marks (circle / underline) drawn by progress
  const pageCache = {};
  function page(key, build) {
    if (pageCache[key]) return pageCache[key];
    const mk = () => { const c = document.createElement("canvas"); c.width = PW; c.height = PH; return c; };
    const base = mk(), ink = mk(), work = mk(), bg = base.getContext("2d"), ig = ink.getContext("2d"), wg = work.getContext("2d");
    const items = [], marks = [];
    bg.fillStyle = ig.fillStyle = INK; bg.textBaseline = ig.textBaseline = "alphabetic";
    const api = {
      bg, ig,
      put: (x, y, parts, size, st) => { bg.fillStyle = INK; return rich(bg, x, y, parts, size, st); },
      write: (x, y, parts, size, t0, t1, st) => { ig.fillStyle = INK; const x1 = rich(ig, x, y, parts, size, st || "italic "); items.push({ x: x - 8, y: y - size * 1.15, w: x1 - x + 16, h: size * 1.95, t0, t1 }); return x1; },
      circle: (cx, cy, rx, ry, t0, t1) => marks.push({ c: 1, cx, cy, rx, ry, t0, t1 }),
      line: (x0, y0, x1, y1, t0, t1) => marks.push({ c: 0, x0, y0, x1, y1, t0, t1 }),
    };
    build(api);
    const T = new THREE.CanvasTexture(work); T.colorSpace = THREE.SRGBColorSpace; T.anisotropy = 8;
    let last = null;
    T.userData.set = (ft) => {
      const pr = items.map((q) => clamp((ft - q.t0) / (q.t1 - q.t0), 0, 1)).concat(marks.map((q) => clamp((ft - q.t0) / (q.t1 - q.t0), 0, 1)));
      const sig = pr.map((v) => v.toFixed(3)).join(","); if (sig === last) return; last = sig;   // cache only: same input -> same pixels
      wg.globalAlpha = 1; wg.drawImage(base, 0, 0);
      items.forEach((q, i) => { const p = pr[i]; if (p <= 0) return; const w = q.w * p; wg.drawImage(ink, q.x, q.y, w, q.h, q.x, q.y, w, q.h); });
      wg.strokeStyle = INK; wg.lineCap = "round";
      marks.forEach((q, i) => {
        const p = pr[items.length + i]; if (p <= 0) return; wg.lineWidth = 4; wg.beginPath();
        if (q.c) { const a0 = -2.2, n = 80; for (let k = 0; k <= n * p; k++) { const a = a0 + (k / n) * (TAU + 0.5), wob = 1 + 0.03 * Math.sin(a * 3 + 1); const x = q.cx + q.rx * wob * Math.cos(a), y = q.cy + q.ry * wob * Math.sin(a) - 4 * (k / n); k ? wg.lineTo(x, y) : wg.moveTo(x, y); } }
        else { wg.moveTo(q.x0, q.y0); for (let k = 1; k <= 30 * p; k++) wg.lineTo(lerp(q.x0, q.x1, k / 30), lerp(q.y0, q.y1, k / 30) + 1.5 * Math.sin(k * 0.7)); }
        wg.stroke();
      });
      T.needsUpdate = true;
    };
    return (pageCache[key] = T);
  }
  // wrapped body text (printed); returns positions of words for underlining
  function wrapText(g, text, x, y, w, lh, size, st) {
    g.font = FONT(st, size); const words = text.split(" "), lines = []; let cur = [];
    for (const wd of words) { const tw = g.measureText(cur.concat(wd).join(" ")).width; if (tw > w && cur.length) { lines.push(cur); cur = [wd]; } else cur.push(wd); }
    lines.push(cur); const pos = {};
    lines.forEach((ln, li) => {
      const ww = ln.map((s) => g.measureText(s).width), gap = li < lines.length - 1 ? (w - ww.reduce((a, b) => a + b, 0)) / Math.max(1, ln.length - 1) : g.measureText(" ").width; let xx = x;
      ln.forEach((s, k) => { g.fillText(s, xx, y + li * lh); pos[s] = pos[s] || [xx, y + li * lh, ww[k]]; xx += ww[k] + gap; });
    });
    return pos;
  }
  const PAGES = {
    field: () => page("field", (a) => {
      paper(a.bg, 11, "#e9dcbd", 0.8, false);
      a.put(140, 200, ["Die Feldgleichungen der Gravitation."], 50, "italic ");
      a.put(640, 266, ["Von A. Einstein."], 34, "italic ");
      ["Bei der Aufstellung der Gleichungen des", "Gravitationsfeldes gehen wir von der Forderung", "aus, dass sie für beliebige Koordinaten gelten.", "So finden wir die gesuchten Feldgleichungen:"].forEach((s, i) => a.put(140, 380 + i * 62, [s], 36, "italic "));
      a.write(150, 760, ["G", ["μν", 0.55, 0.28], " = ", { f: [["8πG"], ["c", ["4", 0.6, -0.5]]] }, " T", ["μν", 0.55, 0.28]], 92, 9.7, 14.6);
      a.write(140, 960, ["Hierin bedeutet T", ["μν", 0.55, 0.28], " den Energietensor der Materie,"], 36, 15.0, 17.6);
      a.write(140, 1022, ["und G den Krümmungstensor."], 36, 17.6, 19.0);
      a.write(140, 1110, ["Die Krümmung des Raumes folgt aus der Materie."], 36, 19.1, 21.4);
    }),
    michell: () => page("michell", (a) => {
      paper(a.bg, 12, "#e2cfa5", 1.4, false);
      const g = a.bg; g.fillStyle = "rgba(30,22,14,.92)"; g.textAlign = "center";
      g.font = FONT("", 34); g.letterSpacing = "6px"; g.fillText("PHILOSOPHICAL TRANSACTIONS, 1784.", PW / 2, 130); g.letterSpacing = "0px";
      g.fillRect(150, 152, PW - 300, 3); g.fillRect(150, 160, PW - 300, 1.2);
      g.font = FONT("italic ", 32); g.fillText("On the Means of discovering the Distance, Magnitude, &c.", PW / 2, 224); g.fillText("of the Fixed Stars. By the Rev. John Michell, B.D. F.R.S.", PW / 2, 266);
      g.textAlign = "left";
      const body = "If the semi-diameter of a sphere of the same density with the sun were to exceed that of the sun in the proportion of 500 to 1, a body falling from an infinite height towards it would have acquired at its surface a greater velocity than that of light, and consequently, supposing light to be attracted by the same force in proportion to its vis inertiae, with other bodies, all light emitted from such a body would be made to return towards it by its own proper gravity. Such bodies could never be seen by us; yet if any other luminous body should happen to revolve about them, we might from the motions of this revolving body infer the existence of the central one.";
      const pos = wrapText(g, body, 150, 330, PW - 300, 44, 30, "");
      // the hand underline under 'dark stars,'
      g.strokeStyle = "rgba(70,40,20,.85)"; g.lineWidth = 3.5; g.lineCap = "round";
      for (const wd of ["dark", "stars,"]) { const p = pos[wd]; if (p) { g.beginPath(); g.moveTo(p[0] - 4, p[1] + 9); g.quadraticCurveTo(p[0] + p[2] / 2, p[1] + 13, p[0] + p[2] + 6, p[1] + 8); g.stroke(); } }
      // hand-drawn sketch: a great star, light leaving and curving back
      const cx = PW / 2, cy = 1300, R = 105; g.strokeStyle = "rgba(60,36,18,.85)"; g.lineWidth = 3;
      g.beginPath(); for (let k = 0; k <= 90; k++) { const t = k / 90 * TAU, rr = R * (1 + 0.012 * Math.sin(t * 7)); k ? g.lineTo(cx + rr * Math.cos(t), cy + rr * Math.sin(t)) : g.moveTo(cx + rr, cy); } g.stroke();
      for (let k = 0; k < 6; k++) {
        const a = -Math.PI / 2 + (k - 2.5) * 0.55, s = k < 3 ? -1 : 1, x0 = cx + R * Math.cos(a), y0 = cy + R * Math.sin(a), h = 210 + 40 * (k % 2);
        const xm = cx + (R + h) * Math.cos(a) + s * 70 * Math.sin(a), ym = cy + (R + h) * Math.sin(a) - s * 70 * Math.cos(a), x1 = cx + R * Math.cos(a + s * 0.5), y1 = cy + R * Math.sin(a + s * 0.5);
        g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo(xm, ym, x1, y1); g.stroke();
        const ang = Math.atan2(y1 - ym, x1 - xm); g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 - 18 * Math.cos(ang - 0.35), y1 - 18 * Math.sin(ang - 0.35)); g.moveTo(x1, y1); g.lineTo(x1 - 18 * Math.cos(ang + 0.35), y1 - 18 * Math.sin(ang + 0.35)); g.stroke();
      }
      g.font = FONT("italic ", 30); g.fillStyle = "rgba(60,36,18,.85)"; g.fillText("Fig. 1", cx + R + 70, cy + R + 30);
    }),
    schwarz: () => page("schwarz", (a) => {
      paper(a.bg, 13, "#ebe2cc", 0.7, false);
      const g = a.bg; g.strokeStyle = "rgba(120,100,70,.18)"; g.lineWidth = 3; [PH / 3, 2 * PH / 3].forEach((y) => { g.beginPath(); g.moveTo(0, y); g.lineTo(PW, y); g.stroke(); });
      a.put(790, 150, ["22. Dez. 1915"], 34, "italic ");
      a.put(120, 250, ["Sehr geehrter Herr Einstein!"], 46, "italic ");
      a.put(120, 340, ["Um mit Ihrer Gravitationstheorie vertraut zu werden,"], 34, "italic ");
      a.put(120, 396, ["habe ich das Feld eines Massenpunktes berechnet:"], 34, "italic ");
      a.write(120, 540, ["ds", ["2", 0.6, -0.5], " = −(1 − ", { f: [["r", ["s", 0.6, 0.25]], ["r"]] }, ") c", ["2", 0.6, -0.5], "dt", ["2", 0.6, -0.5]], 62, 352.4, 356.6);
      a.write(220, 690, ["+ ", { f: [["dr", ["2", 0.6, -0.5]], ["1 − r", ["s", 0.6, 0.25], "/r"]] }, " + r", ["2", 0.6, -0.5], "(dθ", ["2", 0.6, -0.5], " + sin", ["2", 0.6, -0.5], "θ dφ", ["2", 0.6, -0.5], ")"], 62, 356.7, 360.4);
      a.write(120, 820, ["Dabei ist"], 34, 360.5, 361.1);
      const x1 = a.write(380, 930, ["r", ["s", 0.6, 0.25], " = ", { f: [["2GM"], ["c", ["2", 0.6, -0.5]]] }], 80, 361.2, 363.3);
      a.circle((380 + x1) / 2, 912, (x1 - 380) / 2 + 60, 100, 363.5, 365.0);
      a.write(120, 1120, ["Wie Sie sehen, geht alles recht einfach."], 34, 365.0, 366.4);
      a.write(700, 1260, ["Ihr K. Schwarzschild"], 38, 366.4, 367.4);
    }),
    chandra: () => page("chandra", (a) => {
      paper(a.bg, 14, "#efe6cf", 0.6, true);
      a.put(170, 150, ["S.S. Pilsna  ·  Aug. 1930"], 40, "italic ");
      a.put(170, 286, ["P = K ρ", ["4/3", 0.55, -0.55], "   (electrons near light speed)"], 40, "italic ");
      a.put(170, 356, ["M = 5.76 μ", ["e", 0.55, 0.28], ["−2", 0.55, -0.55], " M", SUN], 40, "italic ");
      a.write(170, 496, ["μ", ["e", 0.55, 0.28], " = 2"], 44, 564.6, 565.5);
      a.write(170, 566, ["M = 5.76 / 4 = 1.44 M", SUN], 44, 565.6, 567.8);
      const x1 = a.write(260, 706, ["≈ 1.4 M", SUN], 64, 567.9, 569.0);
      a.circle((260 + x1) / 2, 686, (x1 - 260) / 2 + 46, 62, 569.1, 570.4);
      a.write(170, 846, ["above this, nothing can hold it up."], 40, 570.6, 573.0);
    }),
  };
  const woodTex = once(() => {
    const t = canvasTex(2048, 1024, (g, w, h) => {
      const r = rnd(41), pl = 5;
      for (let k = 0; k < pl; k++) {
        const y0 = k * h / pl, tone = 0.8 + 0.3 * r();
        g.fillStyle = `rgb(${54 * tone | 0},${35 * tone | 0},${22 * tone | 0})`; g.fillRect(0, y0, w, h / pl);
        for (let i = 0; i < 110; i++) { const y = y0 + r() * h / pl, ph = r() * 6, amp = 1 + r() * 5, fr = 0.001 + r() * 0.004; g.strokeStyle = r() < 0.7 ? `rgba(18,10,5,${0.06 + 0.12 * r()})` : `rgba(120,85,55,${0.05 + 0.08 * r()})`; g.lineWidth = 0.6 + r() * 2; g.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x * fr + ph) * amp; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
        g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(0, y0, w, 3);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 4); t.anisotropy = 8; return t;
  });
  function sheetMesh(map, seed, flat) {
    const g = new THREE.PlaneGeometry(3, 4, 30, 40); g.rotateX(-Math.PI / 2); const p = g.attributes.position, r = rnd(seed), ph = r() * 6;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i); p.setY(i, flat ? 0 : 0.012 * (1 + Math.sin(x * 1.4 + z * 0.6 + ph)) + 0.05 * Math.pow(smooth((Math.abs(x) - 1.1) / 0.4), 2) + 0.03 * smooth((z - 1.6) / 0.4)); }
    g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map, roughness: 0.92, metalness: 0, side: THREE.DoubleSide, envMapIntensity: 0.25 })); m.receiveShadow = true; m.castShadow = true; return m;
  }
  const plainTex = once(() => canvasTex(300, 400, (g) => { paper(g, 15, "#ddd0b0", 1, false); }));
  function pen() {
    const G = new THREE.Group(), lac = new THREE.MeshPhysicalMaterial({ color: 0x0e0f11, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08 }), gold = new THREE.MeshStandardMaterial({ color: 0xb89a5a, metalness: 1, roughness: 0.3 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, 1.15, 32), lac); G.add(body);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.047, 0.047, 0.05, 32), gold); band.position.y = 0.2; G.add(band);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.036, 0.03, 0.18, 32), lac); grip.position.y = -0.66; G.add(grip);
    const nib = new THREE.Mesh(new THREE.ConeGeometry(0.028, 0.16, 32), gold); nib.position.y = -0.83; nib.rotation.x = Math.PI; G.add(nib);
    G.children.forEach((m) => (m.castShadow = true)); G.rotation.set(0, 0, Math.PI / 2); return G;
  }
  function inkwell() {
    const G = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.34, 0.46), new THREE.MeshPhysicalMaterial({ color: 0x18201d, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.4 })); glass.position.y = 0.17; G.add(glass);
    const inkB = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.22, 0.38), new THREE.MeshStandardMaterial({ color: 0x07080d, roughness: 0.15 })); inkB.position.y = 0.12; G.add(inkB);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 32), new THREE.MeshStandardMaterial({ color: 0xa88a52, metalness: 1, roughness: 0.32 })); cap.position.y = 0.39; G.add(cap);
    G.children.forEach((m) => (m.castShadow = true)); return G;
  }
  function books() {
    const G = new THREE.Group(), r = rnd(71), cols = [0x3b2a20, 0x2a3328, 0x4a2622, 0x2d2c35, 0x553d26, 0x30261d];
    let x = -4.2;
    while (x < 4.4) { const w = 0.22 + 0.2 * r(), h = 1.9 + 0.7 * r(), d = 1.3 + 0.2 * r(); const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color: cols[(r() * cols.length) | 0], roughness: 0.85 })); m.position.set(x + w / 2, h / 2, -2.7 - d / 2 + 0.6 * r() * 0.2); m.rotation.y = (r() - 0.5) * 0.04; m.castShadow = m.receiveShadow = true; G.add(m);
      const band = new THREE.Mesh(new THREE.BoxGeometry(w * 1.01, 0.03, 0.02), new THREE.MeshStandardMaterial({ color: 0x9c8452, metalness: 0.8, roughness: 0.45 })); band.position.set(x + w / 2, h * (0.78 + 0.08 * r()), m.position.z + d / 2 + 0.005); G.add(band); x += w + 0.01; }
    return G;
  }
  LABK.notebook = (o) => {
    const mode = o.mode || "field", C = cam(30);
    const S = stage("studio", { floorY: -3, key: 0.18, hemi: 0.06, rim: 0.12 });
    S.background = new THREE.Color(0x070605); S.fog = new THREE.Fog(0x070605, 9, 22);
    const desk = new THREE.Group(); S.add(desk);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(14, 10), new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.5, metalness: 0, envMapIntensity: 0.35 })); top.rotation.x = -Math.PI / 2; top.receiveShadow = true; desk.add(top);
    const key = mode === "michell" || mode === "michell2" || mode === "end" ? "michell" : mode === "schwarz2" ? "schwarz" : mode;
    const T = PAGES[key](); const pg = sheetMesh(T, 3); pg.position.y = 0.01; pg.rotation.y = 0.05; desk.add(pg);
    const under = sheetMesh(plainTex(), 7, true); under.position.set(0.14, 0.003, 0.12); under.rotation.y = -0.07; desk.add(under);
    const shelf = key === "michell";
    if (shelf) desk.add(books()); else { const p = pen(); p.position.set(2.05, 0.045, 0.7); p.rotation.y = 0.55; desk.add(p); const w = inkwell(); w.position.set(-2.35, 0, -1.55); desk.add(w); }
    // warm lamp
    const lamp = new THREE.SpotLight(0xffe0b4, 0, 0, 0.55, 0.85, 0); lamp.position.set(-2.6, 6.2, 2.4); lamp.target = pg; lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.0004; lamp.shadow.radius = 5; S.add(lamp);
    if (shelf) lamp.position.set(-3.6, 5.0, 3.4);
    return (t, d) => {
      const ft = o.T0 + t; T.userData.set(ft);
      let I = 6, rock = 0;
      if (mode === "field") { I = 6 * (1 - 0.6 * seg(ft, 21.3, 23.4)); camKF(C, [[9.2, 0.05, 0, -0.25, 6.4, -6, 58, 0.16, 0.08], [23.42, 0.05, 0, -0.35, 5.6, 4, 64, 0.16, 0.08]], ft); }
      else if (mode === "michell") { I = 3.0; camKF(C, [[242.3, 0, 0, -0.4, 8.2, -4, 40, 0.22, 0.15], [249.16, 0, 0, -0.4, 7.4, 4, 42, 0.22, 0.15]], ft); }
      else if (mode === "michell2") { I = 6.5; camKF(C, [[1422.58, 0, 0, -0.4, 7.6, 8, 46, 0.22, 0.15], [1424.2, 0, 0, -0.4, 7.1, 14, 48, 0.22, 0.15]], ft); }
      else if (mode === "end") { I = 4.5 * (1 - seg(ft, 1462.5, 1469.6)); camKF(C, [[1459.9, 0, 0, -0.4, 7.4, -4, 46, 0.2, 0.13], [1470, 0, 0, -0.4, 13.5, 6, 40, 0.2, 0.13]], ft); }
      else if (mode === "schwarz") camKF(C, [[352.0, 0.05, 0, -0.35, 6.2, -6, 58, 0, 0.05], [367.52, 0.05, 0, -0.3, 5.4, 5, 63, 0, 0.05]], ft);
      else if (mode === "schwarz2") camKF(C, [[441.36, 0.05, 0, -0.3, 7.8, 10, 55, 0.2, 0.15], [448.84, 0.05, 0, -0.3, 7.3, 18, 57, 0.2, 0.15]], ft);
      else if (mode === "chandra") { rock = 1; camKF(C, [[564.44, 0.1, 0, -0.25, 9.0, -5, 46, 0, 0.27], [574.9, 0.1, 0, -0.25, 8.5, 3, 48, 0, 0.27]], ft); }
      lamp.intensity = I; pg.material.color.setScalar(mode === "end" ? 1 - 0.92 * seg(ft, 1463.5, 1469.8) : 1); under.material.color.copy(pg.material.color);
      if (rock) { desk.rotation.set(0.012 * Math.sin(ft * 0.8), 0, 0.02 * Math.sin(ft * 0.55)); lamp.position.x = -2.6 + 0.25 * Math.sin(ft * 0.55 + 0.6); } else desk.rotation.set(0, 0, 0);
      return [S, C, []];
    };
  };
})();
