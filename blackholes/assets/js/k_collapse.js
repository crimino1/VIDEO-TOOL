/* Black Holes film, group B (collapse): horizon, starlife, lightband, infall, flicker, funnel.
   LABK.kind = (o) => (t, d) => [scene, camera, pins]; ft = o.T0 + t is film time. Every frame is a pure function of ft. */
(function () {
  const { THREE, M, P, W, H, seg, smooth, lerp, clamp, rnd, tex, stage, cam, orbit, canvasTex, glowSprite } = L3;
  const TAU = Math.PI * 2;
  const once = (f) => { let v; return () => v || (v = f()); };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  const fadeIO = (ft, a, b, f) => seg(ft, a, a + (f || 0.5)) * (1 - seg(ft, b - (f || 0.5), b));
  const frac = (x) => x - Math.floor(x);
  // integral of a linear 0->1 ramp between a and b (for speeds that change without jumps)
  const rampInt = (x, a, b) => (x < a ? 0 : x < b ? (x - a) * (x - a) / (2 * (b - a)) : (b - a) / 2 + (x - b));
  // camera on an orbit; sx/sy shift the subject right/up by a fraction of the frame
  function aim(C, tx, ty, tz, dist, az, el, sx, sy) {
    orbit(C, tx, ty, tz, dist, az, el);
    C.setViewOffset(W, H, -(sx || 0) * W, (sy || 0) * H, W, H);
  }
  const starsOf = (S) => S.children.find((c) => c.isPoints);

  // ---------- shared textures / geometry ----------
  const SPH = once(() => new THREE.SphereGeometry(1, 96, 64));
  const dotTex = once(() => canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  // thin photon ring on a billboard: ring sits at 0.8 of the half-size (scale plane by 1.25*r)
  const photonTex = once(() => canvasTex(512, 512, (g) => { const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.785, "rgba(0,0,0,0)"); gr.addColorStop(0.8, "rgba(255,255,255,1)"); gr.addColorStop(0.83, "rgba(255,255,255,.35)"); gr.addColorStop(0.9, "rgba(255,255,255,.08)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); }));
  // crinkled gold foil (MLI blanket): faceted brightness patches + creases
  const foilTex = once(() => canvasTex(512, 512, (g, w, h) => {
    const r = rnd(29); g.fillStyle = "#b8b8b8"; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 700; i++) { const x = r() * w, y = r() * h, s = 10 + r() * 46, v = 120 + r() * 135 | 0; g.fillStyle = `rgba(${v},${v},${v},.55)`; g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 4; k++) g.lineTo(x + (r() - 0.5) * s * 2, y + (r() - 0.5) * s * 2); g.closePath(); g.fill(); }
    for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(${r() < 0.5 ? "255,255,255" : "40,40,40"},${0.2 + 0.3 * r()})`; g.lineWidth = 1 + r() * 1.5; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 3; k++) { x += (r() - 0.5) * 120; y += (r() - 0.5) * 120; g.lineTo(x, y); } g.stroke(); }
  }));
  const ringDotTex = once(() => canvasTex(64, 64, (g) => { g.strokeStyle = "rgba(235,240,248,.9)"; g.lineWidth = 5; g.beginPath(); g.arc(32, 32, 22, 0, TAU); g.stroke(); }));

  // self-lit star surface with limb darkening (sun texture); uniforms k (brightness), tint, alpha
  function sunMat(tint, k, limb) {
    return new THREE.ShaderMaterial({
      uniforms: { map: { value: tex("2k_sun.jpg") }, tint: { value: new THREE.Color(tint === undefined ? 0xffffff : tint) }, k: { value: k || 1 }, limb: { value: limb === undefined ? 0.6 : limb }, alpha: { value: 1 }, sat: { value: 0.92 } },
      vertexShader: "varying vec2 vUv; varying vec3 vN; varying vec3 vV;\nvoid main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }",
      fragmentShader: "uniform sampler2D map; uniform vec3 tint; uniform float k; uniform float limb; uniform float alpha; uniform float sat; varying vec2 vUv; varying vec3 vN; varying vec3 vV;\nvoid main(){ float mu=clamp(dot(normalize(vN),normalize(vV)),0.0,1.0); vec3 c=pow(texture2D(map,vUv).rgb, vec3(0.88)); c=mix(vec3(dot(c,vec3(0.3,0.59,0.11))), c, sat); float ld=1.0-limb*(1.0-sqrt(mu)); gl_FragColor=vec4(c*tint*k*ld, alpha);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}",
      transparent: true,
    });
  }
  function sunBall(tint, k, limb, sat) { const m = new THREE.Mesh(SPH(), sunMat(tint, k, limb)); if (sat !== undefined) m.material.uniforms.sat.value = sat; return m; }
  // black sphere + thin warm photon ring (billboard, call face(C) each frame)
  function blackHole() {
    const G = new THREE.Group();
    const core = new THREE.Mesh(SPH(), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 1 }));
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), new THREE.MeshBasicMaterial({ map: photonTex(), color: 0xffe2c4, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
    const halo = glowSprite(0xffd2a8, 3.4, 0.05);
    G.add(core, ring, halo);
    G.userData = { core, ring, halo, face: (C) => ring.quaternion.copy(C.quaternion), k: (a) => { core.material.opacity = a; ring.material.opacity = 0.55 * a; halo.material.opacity = 0.05 * a; } };
    return G;
  }
  // a thin flat ribbon in the XY plane through 2D points (constant width), optional per-point colours
  function ribbon(N, w, mat) {
    const g = new THREE.BufferGeometry(), pos = new Float32Array(N * 6), col = new Float32Array(N * 6).fill(1), idx = [];
    for (let i = 0; i < N - 1; i++) { const a = 2 * i; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    g.setIndex(idx); g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.Mesh(g, mat);
    m.userData.set = (P2, C3, n) => {
      n = n || N;
      for (let i = 0; i < N; i++) {
        const j = Math.min(i, n - 1), i0 = Math.max(0, j - 1), i1 = Math.min(n - 1, j + 1);
        const tx = P2[i1 * 2] - P2[i0 * 2], ty = P2[i1 * 2 + 1] - P2[i0 * 2 + 1], l = Math.hypot(tx, ty) || 1, nx = -ty / l * w, ny = tx / l * w, x = P2[j * 2], y = P2[j * 2 + 1];
        pos[i * 6] = x + nx; pos[i * 6 + 1] = y + ny; pos[i * 6 + 2] = 0; pos[i * 6 + 3] = x - nx; pos[i * 6 + 4] = y - ny; pos[i * 6 + 5] = 0;
        if (C3) for (let k = 0; k < 3; k++) col[i * 6 + k] = col[i * 6 + 3 + k] = C3[j * 3 + k];
      }
      g.attributes.position.needsUpdate = true; if (C3) g.attributes.color.needsUpdate = true;
    };
    return m;
  }
  const lineMat = (c, op) => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: op, depthWrite: false, side: THREE.DoubleSide, vertexColors: true, blending: THREE.AdditiveBlending });
  // polar grid (log-spaced circles + radial lines) whose height is y = fy(r) every frame; fades out toward the rim
  function polarGrid(rIn, rOut, nC, nA, mat) {
    const ra = [];
    for (let i = 0; i < nC; i++) { const r = rIn * Math.pow(rOut / rIn, i / (nC - 1)); for (let j = 0; j < 128; j++) ra.push(r, j / 128 * TAU, r, (j + 1) / 128 * TAU); }
    for (let k = 0; k < nA; k++) { const a = k / nA * TAU; for (let j = 0; j < 60; j++) ra.push(rIn * Math.pow(rOut / rIn, j / 60), a, rIn * Math.pow(rOut / rIn, (j + 1) / 60), a); }
    const n = ra.length / 2, g = new THREE.BufferGeometry(), pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const f = Math.pow(1 - clamp((ra[i * 2] - rIn) / (rOut - rIn), 0, 1), 1.3); col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = f; }
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.LineSegments(g, mat);
    m.userData.set = (fy) => { for (let i = 0; i < n; i++) { const r = ra[i * 2], a = ra[i * 2 + 1]; pos[i * 3] = r * Math.cos(a); pos[i * 3 + 1] = fy(r); pos[i * 3 + 2] = r * Math.sin(a); } g.attributes.position.needsUpdate = true; };
    return m;
  }
  // gas temperature ramp: dull red -> orange -> white -> bluish white (x in 0..1)
  const RAMP = [[0, 0.32, 0.06, 0.02], [0.35, 0.95, 0.36, 0.09], [0.65, 1, 0.8, 0.55], [0.85, 1, 0.97, 0.93], [1, 0.8, 0.88, 1]];
  function ramp(x, out) {
    x = clamp(x, 0, 1); let i = 1; while (i < RAMP.length - 1 && x > RAMP[i][0]) i++;
    const a = RAMP[i - 1], b = RAMP[i], p = (x - a[0]) / (b[0] - a[0]);
    out[0] = lerp(a[1], b[1], p); out[1] = lerp(a[2], b[2], p); out[2] = lerp(a[3], b[3], p); return out;
  }
  // blackbody colour (sRGB 0..1) for temperature K (Helland approximation)
  function bb(T) {
    const t = T / 100; let r, g, b;
    r = t <= 66 ? 255 : 329.7 * Math.pow(t - 60, -0.1332);
    g = t <= 66 ? 99.47 * Math.log(t) - 161.1 : 288.1 * Math.pow(t - 60, -0.0755);
    b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5 * Math.log(t - 10) - 305.0;
    return new THREE.Color().setRGB(clamp(r, 0, 255) / 255, clamp(g, 0, 255) / 255, clamp(b, 0, 255) / 255, THREE.SRGBColorSpace);
  }
  // spiralling gas: seeded particles falling from rOut to rIn, closed-form in ft (steady state at any time)
  function gas(seed, N, o) {
    const r = rnd(seed), A = new Float32Array(N * 8);
    for (let i = 0; i < N; i++) {
      const st = o.streams[i % o.streams.length];
      A.set([st + (r() - 0.5) * 2 * o.spread * (0.4 + r()), lerp(o.rOut[0], o.rOut[1], r()), lerp(o.L[0], o.L[1], r()), r() * 50, (r() + r() + r() - 1.5) * o.h, r(), r() * TAU, 0.6 + 0.8 * r()], i * 8);
    }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3)); g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
    const pts = new THREE.Points(g, new THREE.PointsMaterial({ map: dotTex(), size: o.size, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    const c = [0, 0, 0], lr = Math.log(o.rOut[1] / o.rIn);
    // gain: brightness, turb: 0..1 inner turbulence, heat: extra brightness of the hot inner gas
    pts.userData.tick = (ft, gain, turb, heat) => {
      const p = g.attributes.position.array, cl = g.attributes.color.array;
      for (let i = 0; i < N; i++) {
        const a0 = A[i * 8], r0 = A[i * 8 + 1], L = A[i * 8 + 2], off = A[i * 8 + 3], hy = A[i * 8 + 4], jr = A[i * 8 + 5], ph = A[i * 8 + 6], br = A[i * 8 + 7];
        const u = frac((ft + off) / L), rr = o.rIn + (r0 - o.rIn) * Math.pow(1 - u, 0.66);
        const th = a0 + o.swirl * (1 / Math.sqrt(rr) - 1 / Math.sqrt(r0)), inner = clamp(1 - rr / 2.2, 0, 1), tb = turb * inner;
        const jx = tb * 0.12 * Math.sin(ft * 5.3 + ph) + (jr - 0.5) * 0.08 * rr / 3, jz = tb * 0.12 * Math.cos(ft * 4.1 + ph * 1.7);
        p[i * 3] = rr * Math.cos(th) + jx; p[i * 3 + 1] = hy * Math.pow(rr / r0, 1.2) + tb * 0.04 * Math.sin(ft * 6 + ph); p[i * 3 + 2] = rr * Math.sin(th) + jz;
        const x = clamp(Math.log(o.rOut[1] / rr) / lr, 0, 1);
        ramp(x * (1 + 0.12 * heat), c);
        const b = gain * br * (0.18 + 0.82 * Math.pow(x, 1.4)) * (1 + heat * inner * (0.6 + 0.4 * Math.sin(ft * 9 + ph * 3))) * smooth(u / 0.08) * smooth((rr - o.rIn) / (o.rIn * 0.6));
        cl[i * 3] = c[0] * b; cl[i * 3 + 1] = c[1] * b; cl[i * 3 + 2] = c[2] * b;
      }
      g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = true;
    };
    return pts;
  }
  // chevron ">" pointing +x, in the XY plane
  const chevGeo = once(() => { const s = new THREE.Shape(); s.moveTo(-0.5, 0.55); s.lineTo(0.12, 0); s.lineTo(-0.5, -0.55); s.lineTo(-0.28, -0.55); s.lineTo(0.34, 0); s.lineTo(-0.28, 0.55); s.closePath(); return new THREE.ShapeGeometry(s); });
  // rows of chevrons along radial lines in a plane; dir +1 = outward, -1 = inward. tick(phase, rScale, alpha)
  function chevRows(angles, r0, r1, n, size, color, dir) {
    const G = new THREE.Group(), mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 1, depthWrite: false, side: THREE.DoubleSide }), items = [];
    for (const a of angles) for (let k = 0; k < n; k++) { const m = new THREE.Mesh(chevGeo(), mat.clone()); m.scale.setScalar(size); m.rotation.z = a + (dir > 0 ? 0 : Math.PI); G.add(m); items.push([m, a, k]); }
    G.userData.tick = (phase, rs, al) => {
      for (const [m, a, k] of items) {
        const u = frac(k / n + phase), rr = (dir > 0 ? lerp(r0, r1, u) : lerp(r1, r0, u)) * rs;
        m.position.set(rr * Math.cos(a), rr * Math.sin(a), 0); m.material.opacity = al * Math.sin(Math.PI * u) * 0.95;
      }
    };
    return G;
  }

  // ======================================================================= HORIZON
  function hzRadius(o) {
    const S = stage("space", { seed: 11, stars: 6000 }), C = cam(32), RS = 0.6, R0 = 3, A = 4.2;
    const sun = sunBall(0xfff2e2, 1.8); S.add(sun);
    const glow = glowSprite(0xffd2a0, 1, 0.3); S.add(glow);
    const grid = polarGrid(RS, 9, 20, 44, lineMat(0x8db8e8, 0.55)); S.add(grid);
    const hole = blackHole(); hole.scale.setScalar(RS); S.add(hole);
    // the 'special size': a faint dashed circle + faint disc, drawn over the Sun
    const mark = new THREE.Mesh(new THREE.RingGeometry(1, 1.03, 160), new THREE.MeshBasicMaterial({ color: 0xe6eef8, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); mark.renderOrder = 9;
    const markFill = new THREE.Mesh(new THREE.CircleGeometry(1, 96), new THREE.MeshBasicMaterial({ color: 0x9fb8d6, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); markFill.renderOrder = 8;
    const markG = new THREE.Group(); markG.add(markFill, mark); S.add(markG);
    // light paths that leave from near the collapsed Sun and curl back in
    const NP = 7, paths = [], PS = { p: 0, fy: (r) => 0, sy: 0 };
    for (let i = 0; i < NP; i++) {
      const a0 = i / NP * TAU + 0.5, rm = lerp(0.85, 1.45, (i * 0.37) % 1), st = { p: 0 }, v = V(0, 0, 0);
      const fn = (u) => { const s = u * st.p, rr = lerp(0.42, rm, Math.sin(Math.PI * Math.pow(s, 0.8))) + 0.02, a = a0 + 2.2 * s; return v.set(rr * Math.cos(a), PS.fy(Math.max(rr, RS)) + 0.05 + (rr < RS ? (PS.sy - PS.fy(RS)) * (1 - rr / RS) : 0), rr * Math.sin(a)); };
      const l = L3.liveTube(fn, 90, 0.009, new THREE.MeshBasicMaterial({ color: 0xf6e2bc, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      l.userData.st = st; S.add(l); paths.push(l);
    }
    // scale part: the whole Sun crushed into a 3 km ball (true scale: 3 km / 696,000 km)
    const RB = R0 * 3 / 696000, B = V(-4.6, 0.5, 1.2);
    const ball = blackHole(); ball.scale.setScalar(RB); ball.position.copy(B); ball.userData.ring.visible = ball.userData.halo.visible = false; S.add(ball);
    const bg = new THREE.BufferGeometry(); bg.setAttribute("position", new THREE.BufferAttribute(new Float32Array([B.x, B.y, B.z]), 3));
    const ballMark = new THREE.Points(bg, new THREE.PointsMaterial({ map: ringDotTex(), size: 26, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false })); S.add(ballMark);
    const dirB = B.clone().normalize();
    return (t) => {
      const ft = o.T0 + t; let pins = [];
      C.near = 0.05; C.far = 2000;
      if (ft < 392.7) {
        const shr = seg(ft, 382.3, 386.8), R = R0 * Math.pow(0.32 / R0, shr);
        const fy = (r) => -A * RS * (1 / Math.sqrt(r * r + R * R) - 1 / Math.sqrt(81 + R * R));
        const sy = fy(Math.max(R, RS)), k = 1 - seg(ft, 386.6, 388.4);
        grid.visible = true; grid.userData.set(fy); grid.material.opacity = 0.3 + 0.22 * shr;
        sun.visible = k > 0.002; sun.scale.setScalar(R); sun.position.set(0, sy, 0); sun.rotation.y = ft * 0.02; sun.material.uniforms.k.value = 1.8 * k;
        glow.position.copy(sun.position); glow.scale.setScalar(R * 3.4 + 0.4); glow.material.opacity = 0.32 * k;
        hole.visible = true; hole.position.set(0, sy, 0); hole.userData.k(seg(ft, 386.4, 388.2)); hole.userData.face(C);
        markG.visible = true; markG.position.set(0, sy, 0); markG.scale.setScalar(RS); markG.quaternion.copy(C.quaternion);
        const mk = seg(ft, 378.8, 380.0);
        mark.material.opacity = 0.85 * mk * (1 - 0.45 * seg(ft, 388.2, 389.2)); markFill.material.opacity = 0.16 * mk * (1 - seg(ft, 385.5, 387.5));
        PS.fy = fy; PS.sy = sy;
        paths.forEach((l, i) => {
          const t0 = 385.4 + i * 0.42; l.userData.st.p = clamp((ft - t0) / 1.6, 0, 1) + 1e-4; l.visible = ft > t0;
          l.material.opacity = 0.75 * seg(ft, t0, t0 + 0.2) * (1 - seg(ft, t0 + 3.2, t0 + 4.4)) * (1 - seg(ft, 391.6, 392.6));
        });
        ball.visible = ballMark.visible = false;
        aim(C, 0, lerp(-0.2, sy * 0.85, smooth(shr)), 0, lerp(17, 8.6, smooth(shr)) - 0.25 * (ft - 386.8) * (ft > 386.8 ? 1 : 0), -18 + (ft - 376) * 0.9, lerp(9, 31, smooth(shr)), 0.02, 0.02);
        const e = V(1, 0, 0).applyQuaternion(C.quaternion).multiplyScalar(RS * 0.72);
        pins = [["Schwarzschild radius", e.x, sy + e.y + RS * 0.7, e.z, fadeIO(ft, 389.1, 392.6, 0.6)]];
      } else {
        grid.visible = hole.visible = markG.visible = false; paths.forEach((l) => (l.visible = false));
        sun.visible = true; sun.scale.setScalar(R0); sun.position.set(0, 0, 0); sun.rotation.y = ft * 0.02; sun.material.uniforms.k.value = 1.8;
        glow.position.set(0, 0, 0); glow.scale.setScalar(R0 * 3.4); glow.material.opacity = 0.32;
        ball.visible = ballMark.visible = true; ball.userData.face(C);
        const pl = clamp((ft - 392.8) / 8.6, 0, 1), p = 1 - Math.pow(1 - pl, 2.2), dist = Math.exp(lerp(Math.log(RB * 9), Math.log(19), p));
        const w = smooth((Math.log(dist) - Math.log(0.4)) / (Math.log(19) - Math.log(0.4)));
        const tgt = B.clone().lerp(V(-1.6, 0.2, 0.4), Math.pow(w, 2.5));
        const az = lerp(Math.atan2(dirB.x, dirB.z) * 180 / Math.PI - 14, 8, w) + (ft - 392.7) * 0.5;
        aim(C, tgt.x, tgt.y, tgt.z, dist, az, 5 + 7 * w, 0.1 * (1 - w), 0.1 * w);
        // close-up: look 33 deg off the Sun's centre so its limb crosses the frame (upper right lit, lower left dark sky for the caps)
        const dw = C.position.clone().sub(tgt).normalize(), u = B.clone().negate().normalize(), rr = new THREE.Vector3().crossVectors(u, V(0, 1, 0)).normalize();
        const e = rr.clone().add(new THREE.Vector3().crossVectors(rr, u)).normalize(), va = 33 * Math.PI / 180;
        const dir = u.multiplyScalar(-Math.cos(va)).addScaledVector(e, Math.sin(va)).lerp(dw, w).normalize();
        C.position.copy(tgt).addScaledVector(dir, dist); C.lookAt(tgt);
        C.near = dist * 0.02; C.far = 2000 + dist;
        const px = RB / C.position.distanceTo(B) * 540 / Math.tan(16 * Math.PI / 180);
        ballMark.material.opacity = 0.85 * (1 - seg(px, 4, 9));
        pins = [["the whole Sun, crushed", B.x, B.y, B.z, fadeIO(ft, 400.3, 405.2, 0.6)]];
      }
      C.updateProjectionMatrix();
      return [S, C, pins];
    };
  }
  function hzNotwall(o) {
    const S = stage("space", { seed: 12, stars: 6500 }), C = cam(32), RH = 1.15;
    const core = new THREE.Mesh(SPH(), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.94, depthWrite: false })); core.scale.setScalar(0.92); core.renderOrder = 5; S.add(core);
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(2.5, 2.5), new THREE.MeshBasicMaterial({ map: photonTex(), color: 0xffe2c4, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })); ring.scale.setScalar(0.92); S.add(ring);
    // the horizon: a barely visible shimmering boundary
    const shell = new THREE.Mesh(SPH(), new THREE.ShaderMaterial({
      uniforms: { time: { value: 0 }, op: { value: 1 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: "varying vec3 vN; varying vec3 vV; varying vec3 vP;\nvoid main(){ vP=position; vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }",
      fragmentShader: "uniform float time; uniform float op; varying vec3 vN; varying vec3 vV; varying vec3 vP;\nvoid main(){ float mu=clamp(abs(dot(normalize(vN),normalize(vV))),0.0,1.0); float f=pow(1.0-mu,4.0); float sh=0.85+0.15*sin(9.0*vP.y+time*1.1+2.0*sin(5.0*vP.x-time*0.7))*sin(8.0*vP.z-time*0.9); gl_FragColor=vec4(vec3(0.72,0.82,0.95)*f*0.055*sh*op,1.0);\n#include <colorspace_fragment>\n}",
    })); shell.scale.setScalar(RH); shell.renderOrder = 6; S.add(shell);
    // probe: gold-foil bus, white high-gain dish, solar wing, two thin booms, blinking beacon
    const probe = new THREE.Group(), foil = foilTex();
    const gold = new THREE.MeshStandardMaterial({ color: 0xd9a84e, map: foil, bumpMap: foil, bumpScale: 1.4, metalness: 1, roughness: 0.3 });
    const white = M.paint(0xe4e2dc, 0.55), dark = new THREE.MeshStandardMaterial({ color: 0x9a9da3, metalness: 0.8, roughness: 0.4 });
    const bus = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.085, 0.1), gold); probe.add(bus);
    const deck = new THREE.Mesh(new THREE.BoxGeometry(0.104, 0.008, 0.104), dark); deck.position.y = 0.046; probe.add(deck);
    const dish = new THREE.Mesh(new THREE.SphereGeometry(0.1, 32, 8, 0, TAU, 0, 0.75), white); dish.material.side = THREE.DoubleSide; dish.rotation.x = Math.PI; dish.position.y = 0.155; probe.add(dish);
    const feed = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.07, 6), dark); feed.position.y = 0.095; probe.add(feed);
    for (const a of [0, 2.1, 4.2]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0018, 0.075, 4), dark); st.position.set(0.035 * Math.cos(a), 0.08, 0.035 * Math.sin(a)); st.rotation.set(0.45 * Math.sin(a), 0, -0.45 * Math.cos(a)); probe.add(st); }
    const tip = new THREE.Mesh(new THREE.SphereGeometry(0.006, 10, 8), dark); tip.position.y = 0.13; probe.add(tip);
    const cellTex = canvasTex(256, 128, (g, w, h) => { g.fillStyle = "#1a2433"; g.fillRect(0, 0, w, h); g.strokeStyle = "rgba(170,180,195,.55)"; g.lineWidth = 1.5; for (let x = 0; x <= w; x += w / 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += h / 4) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } });
    const panelM = new THREE.MeshStandardMaterial({ map: cellTex, color: 0xb8c4d8, metalness: 0.55, roughness: 0.3 });
    const yoke = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.06, 6), dark); yoke.rotation.z = Math.PI / 2; yoke.position.x = 0.08; probe.add(yoke);
    const panel = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.004, 0.085), panelM); panel.position.x = 0.21; probe.add(panel);
    for (const [len, rx, rz, y] of [[0.3, 0, 2.3, -0.02], [0.22, 0.9, -1.9, -0.03]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.0016, 0.0016, len, 4), dark); b.geometry.translate(0, len / 2, 0); b.rotation.set(rx, 0, rz); b.position.set(-0.05, y, 0.02); probe.add(b); const end = new THREE.Mesh(new THREE.BoxGeometry(0.012, 0.012, 0.012), white); end.position.set(0, len, 0); b.add(end); }
    const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.022, 0.03, 16, 1, true), dark); nozzle.material.side = THREE.DoubleSide; nozzle.position.y = -0.058; probe.add(nozzle);
    const lamp = new THREE.Mesh(new THREE.SphereGeometry(0.005, 8, 6), new THREE.MeshBasicMaterial({ color: 0xffd9a8 })); lamp.position.set(0.05, -0.03, 0.05); probe.add(lamp);
    const beacon = glowSprite(0xffd9a8, 0.06, 0.8); beacon.position.copy(lamp.position); probe.add(beacon);
    lamp.material.transparent = true;
    const mats = [gold, white, dark, panelM];
    probe.scale.setScalar(2.3); S.add(probe);
    const path = (ft) => {   // falls in from upper left; crosses the horizon at 411.7
      const s = (ft - 405.26) / (411.7 - 405.26);
      const rr = s <= 1 ? 3.1 - (3.1 - RH) * Math.pow(Math.max(s, 0), 1.35) : RH - 0.7 * (1 - Math.exp(-(ft - 411.7) / 2.0));
      const a = 2.55 - 0.45 * clamp(s, 0, 1.6), e = 0.38 - 0.12 * clamp(s, 0, 1.6);
      return V(rr * Math.cos(a) * Math.cos(e), rr * Math.sin(e), rr * Math.sin(a) * Math.cos(e));
    };
    return (t) => {
      const ft = o.T0 + t, p = path(ft), cross = path(411.7);
      probe.position.copy(p); probe.rotation.set(0.35 + ft * 0.05, 0.6 + ft * 0.11, 0.25);
      const lit = 1 - 0.97 * seg(ft, 411.2, 414.6), blink = frac(ft * 0.8) < 0.12 ? 1 : 0.06;   // fades into the dark after it crosses
      mats.forEach((m) => { m.color.setScalar(1); m.envMapIntensity = lit; }); gold.color.set(0xd9a84e); panelM.color.set(0xb8c4d8);
      mats.forEach((m) => { m.color.multiplyScalar(lit); m.transparent = true; m.opacity = smooth(lit / 0.25); m.depthWrite = lit > 0.5; });
      beacon.material.opacity = 0.75 * blink * lit; lamp.material.color.set(0xffd9a8).multiplyScalar(0.25 + 0.75 * blink * lit); lamp.material.opacity = smooth(lit / 0.25); probe.visible = lit > 0.035;
      shell.material.uniforms.time.value = ft; ring.quaternion.copy(C.quaternion);
      aim(C, -0.5, 0.2, 0, lerp(6.6, 5.3, smooth(t / 11.8)), 18 + (ft - 405.26) * 1.4, 9, 0.1, 0.05);
      C.near = 0.05; C.far = 2000; C.updateProjectionMatrix();
      return [S, C, [["no wall, no surface", cross.x, cross.y + 0.05, cross.z, fadeIO(ft, 411.4, 416.8, 0.6)]]];
    };
  }
  LABK.horizon = (o) => (o.mode === "notwall" ? hzNotwall(o) : hzRadius(o));

  // ======================================================================= STARLIFE
  const layersTex = once(() => canvasTex(1024, 1024, (g, w) => {
    const c = w / 2, R = c - 2, r = rnd(17);
    const gr = g.createRadialGradient(c, c, 0, c, c, R);
    [[0, "#fff1cf"], [0.14, "#ffe2a0"], [0.24, "#f7bd62"], [0.45, "#e99a45"], [0.68, "#d1702c"], [0.71, "#b8541f"], [0.95, "#93391a"], [0.975, "#d77a33"], [1, "#f3a552"]].forEach(([s, k]) => gr.addColorStop(s, k));
    g.fillStyle = gr; g.beginPath(); g.arc(c, c, R, 0, TAU); g.fill();
    for (let i = 0; i < 70; i++) { const rr = R * (0.24 + 0.44 * r()); g.strokeStyle = `rgba(255,${200 + r() * 40 | 0},150,${0.03 + 0.04 * r()})`; g.lineWidth = 1 + r() * 3; g.beginPath(); g.arc(c, c, rr, 0, TAU); g.stroke(); }
    for (let i = 0; i < 2600; i++) {   // convection cells
      const a = r() * TAU, rr = R * (0.71 + 0.26 * r()), s = 4 + r() * 12;
      g.fillStyle = r() < 0.55 ? `rgba(255,170,90,${0.08 + 0.12 * r()})` : `rgba(70,20,8,${0.1 + 0.15 * r()})`;
      g.beginPath(); g.ellipse(c + rr * Math.cos(a), c + rr * Math.sin(a), s * 1.6, s, a, 0, TAU); g.fill();
    }
  }));
  const coreTex = once(() => canvasTex(512, 512, (g) => { const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, "rgba(255,252,240,1)"); gr.addColorStop(0.3, "rgba(255,236,190,.75)"); gr.addColorStop(0.65, "rgba(255,200,120,.2)"); gr.addColorStop(1, "rgba(255,180,100,0)"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); }));
  // cutaway star: a quarter removed (x>0, z>0) shows the layers; camera should sit near azimuth 45 degrees
  function cutStar() {
    const G = new THREE.Group();
    const shellMat = sunMat(0xffe2c0, 1.45, 0.55);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64, Math.PI, 1.5 * Math.PI), shellMat); G.add(shell);
    const faceMat = new THREE.MeshBasicMaterial({ map: layersTex(), side: THREE.DoubleSide, transparent: true }), coreMat = new THREE.MeshBasicMaterial({ map: coreTex(), side: THREE.DoubleSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });
    const half = new THREE.CircleGeometry(1, 128, -Math.PI / 2, Math.PI), halfCore = new THREE.CircleGeometry(0.42, 64, -Math.PI / 2, Math.PI), faces = [];
    for (const [ry, side] of [[0, 1], [-Math.PI / 2, -1]]) {
      const f = new THREE.Group(); f.rotation.y = ry;
      const fm = new THREE.Mesh(half, faceMat), cm = new THREE.Mesh(halfCore, coreMat); cm.position.z = 0.003 * side; f.add(fm, cm);
      const out = chevRows([-1.05, -0.35, 0.35, 1.05], 0.42, 0.97, 4, 0.1, 0xfff0d8, 1); out.position.z = 0.008 * side; f.add(out);
      G.add(f); faces.push(out);
    }
    const coreGlow = glowSprite(0xfff0d0, 1.1, 0.35); G.add(coreGlow);
    const inward = chevRows([0.39, 1.18, 1.96, 2.75, 3.53, 4.32, 5.11, 5.89], 1.1, 1.55, 3, 0.11, 0xa8c8e8, -1); inward.rotation.y = Math.PI / 4;
    G.userData = { shellMat, faceMat, coreMat, coreGlow, faces, inward };
    return G;
  }
  // state of the cutaway star by film time (shared by balance and dwarf so the cut is seamless)
  function balanceState(ft) {
    return {
      core: 1 - 0.78 * seg(ft, 503.9, 507.4),
      out: seg(ft, 481.9, 482.9) * (1 - seg(ft, 505.6, 508.2)),
      inn: seg(ft, 477.5, 478.5),
      inPh: 0.2 * ft + 0.35 * rampInt(ft, 508.5, 510.5),
      outPh: 0.2 * ft,
      scale: 1 - 0.2 * seg(ft, 510.5, 514.8),
    };
  }
  function balCam(ft) { return [6.5 - 0.02 * (ft - 474.7), 36 + 0.3 * (ft - 474.7), 19 + 0.04 * (ft - 474.7)]; }
  function slBalance(o) {
    const S = stage("space", { seed: 21, stars: 5000 }), C = cam(32), star = cutStar(), U = star.userData; S.add(star, U.inward);
    return (t) => {
      const ft = o.T0 + t, st = balanceState(ft);
      star.scale.setScalar(st.scale);
      U.shellMat.uniforms.k.value = 1.45 * (0.6 + 0.4 * st.core);
      U.coreMat.opacity = st.core; U.coreGlow.material.opacity = 0.35 * st.core; U.coreGlow.scale.setScalar(1.1 * st.scale);
      U.faceMat.color.setRGB(lerp(0.72, 0.95, st.core), lerp(0.36, 0.92, st.core), lerp(0.2, 0.88, st.core));
      U.faces.forEach((f) => f.userData.tick(st.outPh, 1, st.out));
      U.inward.userData.tick(st.inPh, st.scale, st.inn * (1 + 0.25 * seg(ft, 508.5, 510)));
      const [d, az, el] = balCam(ft);
      aim(C, 0, 0, 0, d, az, el, 0, 0);
      const ga = 2.75, pr = 0.35, s = st.scale;
      return [S, C, [["gravity", 1.42 * s * Math.cos(ga) * Math.SQRT1_2, 1.42 * s * Math.sin(ga), -1.42 * s * Math.cos(ga) * Math.SQRT1_2, st.inn * (1 - seg(ft, 503.0, 504.0))],
        ["pressure", 0.8 * Math.cos(pr) * s, 0.8 * Math.sin(pr) * s, 0.01, st.out * (1 - seg(ft, 503.0, 504.0))]]];
    };
  }
  function slDwarf(o) {
    const S = stage("space", { seed: 21, stars: 5000, key: 0.5, rim: 0.2 }), C = cam(32), star = cutStar(), U = star.userData; S.add(star, U.inward);
    const neb = glowSprite(0xffb67a, 1, 0); S.add(neb);
    const RW = 0.12, wd = sunBall(0xe4ecff, 3.4, 0.35, 0.08); wd.material.depthTest = false; wd.renderOrder = 10; S.add(wd);
    const wdGlow = glowSprite(0xe8f0ff, 1, 0.3); S.add(wdGlow);
    const wl = new THREE.PointLight(0xeef3ff, 1.6, 0, 2); S.add(wl);
    const EP = V(0.62, 0, -0.06);
    const earth = new THREE.Mesh(SPH(), new THREE.MeshStandardMaterial({ map: tex("2k_earth_daymap.jpg"), roughness: 0.85, metalness: 0, transparent: true }));
    const clouds = new THREE.Mesh(SPH(), new THREE.MeshStandardMaterial({ map: tex("2k_earth_clouds.jpg"), alphaMap: tex("2k_earth_clouds.jpg"), transparent: true, depthWrite: false, roughness: 1 }));
    clouds.scale.setScalar(1.012); earth.add(clouds); earth.scale.setScalar(RW * 1.06); earth.position.copy(EP); earth.rotation.z = 0.41; S.add(earth);
    // teaspoon of white-dwarf matter, floats in front-left of the camera from 532
    const spoon = new THREE.Group(), steel = new THREE.MeshStandardMaterial({ color: 0xc8cbd0, metalness: 1, roughness: 0.16, side: THREE.DoubleSide });
    const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.05, 48, 16, 0, TAU, Math.PI / 2, Math.PI / 2), steel); bowl.scale.set(1.45, 0.42, 1); spoon.add(bowl);
    const handle = new THREE.Mesh(new THREE.CapsuleGeometry(0.009, 0.2, 6, 16), steel); handle.scale.set(1, 1, 0.35); handle.rotation.z = Math.PI / 2 - 0.12; handle.position.set(-0.175, 0.016, 0); spoon.add(handle);
    const neck = new THREE.Mesh(new THREE.CapsuleGeometry(0.006, 0.03, 4, 12), steel); neck.scale.set(1, 1, 0.35); neck.rotation.z = Math.PI / 2 - 0.3; neck.position.set(-0.075, 0.006, 0); spoon.add(neck);
    const blob = new THREE.Mesh(new THREE.SphereGeometry(0.036, 32, 16), new THREE.MeshBasicMaterial({ color: 0xf2f6ff })); blob.scale.set(1.35, 0.34, 0.95); blob.position.y = -0.002; spoon.add(blob);
    const blobGlow = glowSprite(0xe6eeff, 0.14, 0.4); spoon.add(blobGlow);
    const sl = new THREE.PointLight(0xeef3ff, 0.02, 0, 2); sl.position.y = 0.03; spoon.add(sl);
    const D2R = Math.PI / 180, caz = 36 * D2R, cel = 9 * D2R, ET = V(0.31, 0.02, -0.03);
    const cdir = V(Math.sin(caz) * Math.cos(cel), Math.sin(cel), Math.cos(caz) * Math.cos(cel)), cright = V(Math.cos(caz), 0, -Math.sin(caz)), cup = new THREE.Vector3().crossVectors(cdir, cright).multiplyScalar(-1);
    const SP = ET.clone().addScaledVector(cdir, 0.9).addScaledVector(cright, -0.3).addScaledVector(cup, -0.07);
    const sx = cright.clone().multiplyScalar(Math.cos(0.4)).addScaledVector(cup, -Math.sin(0.4)), sy0 = cup.clone().multiplyScalar(Math.cos(0.75)).addScaledVector(cdir, Math.sin(0.75));
    const sz = new THREE.Vector3().crossVectors(sx, sy0).normalize(), sy = new THREE.Vector3().crossVectors(sz, sx).normalize();
    spoon.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(sx, sy, sz)); S.add(spoon);
    return (t) => {
      const ft = o.T0 + t, st = balanceState(ft), env = seg(ft, 514.9, 518.2);
      star.visible = env < 0.999; star.scale.setScalar(st.scale * (1 + 0.35 * env));
      U.shellMat.uniforms.k.value = 1.45 * (0.6 + 0.4 * st.core); U.shellMat.uniforms.alpha.value = 1 - seg(ft, 514.9, 516.9); U.shellMat.depthWrite = env < 0.01;
      U.faceMat.opacity = 1 - seg(ft, 515.2, 517.2); U.faceMat.color.setRGB(lerp(0.72, 0.95, st.core), lerp(0.36, 0.92, st.core), lerp(0.2, 0.88, st.core));
      U.coreMat.opacity = st.core * (1 - env); U.coreGlow.material.opacity = 0;
      U.faces.forEach((f) => f.userData.tick(st.outPh, 1, 0));
      U.inward.userData.tick(st.inPh, st.scale * (1 - 0.5 * env), st.inn * (1 - seg(ft, 515.0, 516.6)));
      neb.scale.setScalar(2 + 2.5 * env); neb.material.opacity = 0.12 * Math.sin(Math.PI * clamp(env * 0.9 + seg(ft, 518, 523) * 0.1, 0, 1)) * (1 - seg(ft, 519, 523));
      const wk = seg(ft, 515.0, 517.4), wr = lerp(0.3, RW, seg(ft, 515.4, 518.6));
      wd.visible = wk > 0; wd.scale.setScalar(wr); wd.rotation.y = ft * 0.05; wd.material.uniforms.alpha.value = wk;
      wdGlow.scale.setScalar(wr * 5.5); wdGlow.material.opacity = 0.32 * wk; wl.intensity = 1.6 * wk;
      const ek = seg(ft, 518.6, 519.8); earth.visible = ek > 0; earth.material.opacity = ek; clouds.material.opacity = ek; earth.rotation.y = ft * 0.04;
      const sp = seg(ft, 531.8, 534.6); spoon.visible = ft > 531.8; spoon.position.copy(SP).addScaledVector(cright, -0.75 * (1 - sp)).addScaledVector(cup, -0.06 * (1 - sp) + 0.004 * Math.sin(ft * 0.9));
      // camera: from the balance framing, push in to the white dwarf and Earth, then to the spoon
      const [d0, az0, el0] = balCam(ft), pin = seg(ft, 515.0, 519.6);
      const tgt = V(0, 0, 0).lerp(ET, pin).addScaledVector(cright, -0.08 * sp);
      // 519-531.8: extra slow orbit + push-in (bounded so the spoon framing from 531.8 is unchanged)
      const drift = clamp((ft - 519) / 12.8, 0, 1), dr = drift * drift * (3 - 2 * drift) * 0.5 + drift * 0.5;
      const dist = lerp(d0, 2.25, pin) - 0.01 * Math.max(0, ft - 520) - 0.15 * sp - 0.3 * dr * (1 - sp);
      const az = lerp(az0, 18 + (ft - 514.7) * 0.5 + 8 * dr, pin), el = lerp(el0, 9, pin);
      aim(C, tgt.x, tgt.y, tgt.z, dist, az, el, lerp(0.09 * pin, 0.03, sp), lerp(0.07 * pin, 0.03, sp));
      return [S, C, [["size of Earth", EP.x + 0.02, EP.y + RW * 0.9, EP.z, fadeIO(ft, 520.7, 531.6, 0.6)], ["weighs as much as an elephant", spoon.position.x, spoon.position.y + 0.02, spoon.position.z, fadeIO(ft, 534.0, 538.0, 0.6)]]];
    };
  }
  function slNeutron(o) {
    const S = stage("space", { seed: 23, stars: 5000, key: 1.6 }), C = cam(32), starsP = starsOf(S);
    // A: the heavy core keeps collapsing
    const core = sunBall(0xd2e0ff, 2.5, 0.4, 0.1); S.add(core);
    const coreGlow = glowSprite(0xe8f0ff, 1, 0.3); S.add(coreGlow);
    const inward = chevRows([0.3, 1.0, 1.8, 2.5, 3.3, 4.0, 4.8, 5.5], 0.7, 1.3, 4, 0.1, 0x9fc3e6, -1); S.add(inward);
    // B: particle close-up, far away in the same scene
    const PB = V(60, 0, 0), proM = new THREE.MeshPhysicalMaterial({ color: P.proton, roughness: 0.5, sheen: 0.3, sheenColor: 0xd8a898 }), neuM = new THREE.MeshPhysicalMaterial({ color: P.neutron, roughness: 0.5, sheen: 0.3, sheenColor: 0xc8ccd2, transparent: true });
    const proton = new THREE.Mesh(SPH(), proM.clone()); proton.scale.setScalar(0.5); proton.position.copy(PB); S.add(proton);
    const electron = new THREE.Mesh(SPH(), new THREE.MeshPhysicalMaterial({ color: P.electron, roughness: 0.3, emissive: 0x2a4058 })); electron.scale.setScalar(0.11); S.add(electron);
    const eGlow = glowSprite(0xcfe3f6, 0.6, 0.35); S.add(eGlow);
    const flash = glowSprite(0xfff4e6, 1.6, 0); flash.position.copy(PB); S.add(flash);
    const CC = PB.clone().add(V(0, 0, -3.9)), packed = [], rr = rnd(77);
    for (let tries = 0; packed.length < 120 && tries < 30000; tries++) { const q = V(rr() * 2 - 1, rr() * 2 - 1, rr() * 2 - 1).multiplyScalar(3.2); if (q.length() > 3.2) continue; const w = q.add(CC); if (w.distanceTo(PB) < 1.0 || packed.some((x) => x.distanceTo(w) < 0.92)) continue; packed.push(w); }
    const im = new THREE.InstancedMesh(SPH(), neuM, packed.length), mm = new THREE.Matrix4();
    packed.forEach((q, i) => { mm.makeScale(0.47, 0.47, 0.47).setPosition(q); im.setMatrixAt(i, mm); }); S.add(im);
    // C: neutron star over a city of tiny buildings (1 unit = 10 km; buildings exaggerated in height)
    const CP = V(0, -40, 0), ns = sunBall(0xc8d8ff, 2.3, 0.35, 0.1); ns.position.copy(CP).add(V(0, 1.75, 0)); S.add(ns);
    const nsGlow = glowSprite(0xe4eeff, 4.2, 0.28); nsGlow.position.copy(ns.position); S.add(nsGlow);
    const nl = new THREE.PointLight(0xe8f0ff, 4, 0, 2); nl.position.copy(ns.position); S.add(nl);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.5, 96), new THREE.MeshStandardMaterial({ color: 0x23262c, roughness: 0.95, map: canvasTex(512, 512, (g) => { const gr = g.createRadialGradient(256, 256, 0, 256, 256, 256); gr.addColorStop(0, "#fff"); gr.addColorStop(0.8, "#fff"); gr.addColorStop(1, "#000"); g.fillStyle = gr; g.fillRect(0, 0, 512, 512); }) }));
    ground.rotation.x = -Math.PI / 2; ground.position.copy(CP); S.add(ground);
    const bl = [], rb = rnd(31);
    for (let x = -1.2; x <= 1.2; x += 0.034) for (let z = -1.2; z <= 1.2; z += 0.034) {
      const d = Math.hypot(x, z); if (d > 1.15 - 0.08 * rb() || (Math.round(x / 0.034) % 4 === 0) || (Math.round(z / 0.034) % 4 === 0)) continue;
      const hgt = 0.008 + 0.03 * Math.pow(rb(), 3) * (1.6 - d) + (d < 0.25 ? 0.05 * rb() * rb() : 0);
      bl.push([x, z, hgt, rb()]);
    }
    const city = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.75, metalness: 0.05 }), bl.length), col = new THREE.Color();
    bl.forEach(([x, z, h, c], i) => { mm.makeScale(0.024, h, 0.024).setPosition(CP.x + x, CP.y + h / 2, CP.z + z); city.setMatrixAt(i, mm); city.setColorAt(i, col.setRGB(0.26 + 0.14 * c, 0.27 + 0.14 * c, 0.3 + 0.14 * c)); });
    city.castShadow = false; S.add(city);
    return (t) => {
      const ft = o.T0 + t; let pins = [];
      const A = ft < 606.68, Bp = ft >= 606.68 && ft < 613.98, Cp = ft >= 613.98;
      core.visible = coreGlow.visible = inward.visible = A; proton.visible = electron.visible = eGlow.visible = flash.visible = im.visible = Bp;
      ns.visible = nsGlow.visible = ground.visible = city.visible = Cp; nl.intensity = Cp ? 4 : 0; starsP.visible = !Bp;
      if (A) {
        const s = seg(ft, 603.4, 606.9), R = lerp(0.62, 0.42, s) * (1 + 0.006 * Math.sin(ft * 9));
        core.scale.setScalar(R); core.rotation.y = ft * 0.1; core.material.uniforms.k.value = 2.2 + 0.4 * s; coreGlow.scale.setScalar(R * 5); coreGlow.material.opacity = 0.3 + 0.1 * s;
        inward.userData.tick(0.3 * ft + 0.4 * rampInt(ft, 604, 606.7), R / 0.62, 0.9);
        aim(C, 0, 0, 0, lerp(6.2, 5.0, smooth(t / 3.3)), 20 + ft * 0.5 - 300, 12, 0, 0);
      } else if (Bp) {
        const m = seg(ft, 608.7, 610.3), a = ft * 3.2 + 7 * m, re = lerp(1.35, 0.0, Math.pow(m, 1.3));
        electron.position.copy(PB).add(V(re * Math.cos(a), 0.3 * re * Math.sin(a * 0.7), 0.35 + 0.6 * re * Math.abs(Math.sin(a))));
        electron.visible = m < 0.995; eGlow.position.copy(electron.position); eGlow.material.opacity = 0.35 * (1 - m);
        const n = seg(ft, 610.0, 610.8); proton.material.color.setHex(P.proton).lerp(new THREE.Color(P.neutron), n);
        flash.material.opacity = 0.55 * Math.sin(Math.PI * clamp((ft - 610.0) / 0.9, 0, 1));
        neuM.opacity = seg(ft, 610.6, 611.8); im.visible = neuM.opacity > 0.001;
        const back = seg(ft, 611.0, 613.9), tgt = PB.clone().lerp(CC, 0.6 * back);
        aim(C, tgt.x, tgt.y, tgt.z, lerp(3.4, 13, back), 8 + (ft - 606.7) * 1.2, 10 + 6 * back, 0, 0);
        pins = [["electron", electron.position.x, electron.position.y + 0.08, electron.position.z, fadeIO(ft, 607.4, 609.6, 0.5)], ["neutron", PB.x, PB.y + 0.45, PB.z, fadeIO(ft, 610.9, 613.3, 0.5)]];
      } else {
        const spin = 0.15 * ft + 4.5 * rampInt(ft, 622.7, 624.5);
        ns.rotation.y = spin; ns.scale.setScalar(1.0);
        const tgt = CP.clone().add(V(0, 1.15, 0));
        aim(C, tgt.x, tgt.y, tgt.z, lerp(11, 9.8, smooth((ft - 614) / 15)), -20 + (ft - 614) * 1.1, 18, 0.12, 0.1);
        pins = [["size of a city", CP.x + 1.02, CP.y + 0.04, CP.z + 0.3, fadeIO(ft, 619.0, 628.5, 0.6)]];
      }
      return [S, C, pins];
    };
  }
  // dipole field line in the x-y plane of the magnetic frame: r = L sin^2(theta)
  function fieldLines(L, n, mat) {
    const G = new THREE.Group();
    for (let i = 0; i < n; i++) {
      const pts = []; for (let j = 0; j <= 80; j++) { const th = 0.25 + (Math.PI - 0.5) * j / 80, r = L * Math.sin(th) ** 2; pts.push(V(r * Math.sin(th), r * Math.cos(th), 0)); }
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat); l.rotation.y = i / n * TAU; G.add(l);
    }
    return G;
  }
  const beamTex = once(() => canvasTex(64, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.6, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
  function pulsar() {
    const G = new THREE.Group(), star = sunBall(0xc8d8ff, 2.4, 0.35, 0.1); G.add(star);
    const glow = glowSprite(0xe4eeff, 1, 0.3); G.add(glow);
    const mag = new THREE.Group(); mag.rotation.z = 0.42; G.add(mag);
    const bm = new THREE.MeshBasicMaterial({ map: beamTex(), color: 0xcfdcf2, transparent: true, opacity: 0.32, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
    const cone = new THREE.ConeGeometry(0.75, 7, 48, 1, true); cone.translate(0, -3.5, 0);
    for (const s of [1, -1]) { const b = new THREE.Mesh(cone, bm); b.rotation.z = s > 0 ? Math.PI : 0; mag.add(b); }
    const fl = fieldLines(2.4, 10, new THREE.LineBasicMaterial({ color: 0x8db8e8, transparent: true, opacity: 0.22, depthWrite: false })); mag.add(fl);
    G.userData = { star, glow, mag, bm, fl };
    return G;
  }
  function slLimit(o) {
    const S = stage("space", { seed: 25, stars: 6000 }), C = cam(32), ps = pulsar(), U = ps.userData; S.add(ps);
    const RN = 0.42, gasP = gas(41, 2600, { streams: [0.4, 3.3], spread: 0.2, rOut: [4.5, 6.5], rIn: 0.45, L: [3.5, 6], h: 0.3, swirl: 2.0, size: 0.12 }); S.add(gasP);
    const bh = blackHole(); S.add(bh);
    return (t) => {
      const ft = o.T0 + t, col = seg(ft, 650.3, 651.9), dark = seg(ft, 651.0, 652.0);
      const R = RN * lerp(1, 0.55, col) * (1 + 0.04 * seg(ft, 645.3, 648.5) * (1 - col));
      U.star.scale.setScalar(R); U.star.rotation.y = ft * 2.2; U.star.visible = dark < 0.999;
      U.star.material.uniforms.k.value = 2.4 * (1 + 0.25 * seg(ft, 646, 649)) * (1 - dark);
      U.star.material.uniforms.tint.value.setRGB(0.87, lerp(0.91, 0.55, col), lerp(1, 0.35, col));
      U.glow.scale.setScalar(R * 6); U.glow.material.opacity = 0.3 * (1 - dark);
      U.mag.rotation.y = ft * 1.6;
      U.bm.opacity = 0.32 * (1 - seg(ft, 650.4, 651.3)) * (0.9 + 0.1 * Math.sin(ft * 13) * seg(ft, 646, 648));
      U.fl.children.forEach((l) => (l.material.opacity = 0.22 * (1 - seg(ft, 650.4, 651.3))));
      gasP.visible = ft > 644.9; gasP.userData.tick(ft, 0.85 * seg(ft, 645.0, 646.8) * (1 - 0.6 * seg(ft, 652, 655)), 0.3, 0.4);
      bh.visible = col > 0.3; bh.scale.setScalar(lerp(0.05, 0.32, seg(ft, 650.7, 651.8))); bh.userData.k(seg(ft, 650.7, 651.6)); bh.userData.face(C);
      aim(C, 0, 0, 0, lerp(9.5, 7.2, smooth(t / 15.5)), 30 + (ft - 640) * 1.6, lerp(16, 22, smooth(t / 15.5)), 0, 0);
      return [S, C, [["more mass falls in", -2.6, 0.5, 0.6, fadeIO(ft, 645.6, 649.6, 0.6)]]];
    };
  }
  function slCollapse(o) {
    const S = stage("space", { seed: 27, stars: 6000 }), C = cam(32), star = sunBall(0xffe8d0, 1.6, 0.6); S.add(star);
    const glow = glowSprite(0xffd2a0, 1, 0.3); S.add(glow);
    const bh = blackHole(); S.add(bh);
    const RH = 0.55;
    return (t) => {
      const ft = o.T0 + t, p = clamp((ft - 668.56) / (676.6 - 668.56), 0, 1);
      // surface falls ever faster, then freezes and reddens at the horizon (as a distant camera sees it)
      const R = RH + (1.6 - RH) * (1 - Math.pow(p, 1.8)), red = seg(ft, 673.8, 676.6);
      star.scale.setScalar(R); star.rotation.y = ft * 0.04; star.visible = red < 0.995;
      star.material.uniforms.k.value = 1.6 * (1 - red) * (1 + 0.4 * seg(ft, 670.3, 673));
      star.material.uniforms.tint.value.setRGB(1, lerp(0.91, 0.45, red), lerp(0.82, 0.25, red));
      glow.scale.setScalar(R * 3.4); glow.material.opacity = 0.32 * (1 - red);
      const hz = seg(ft, 674.8, 676.0); bh.visible = hz > 0; bh.scale.setScalar(RH * lerp(0.97, 1.0, hz)); bh.userData.k(hz); bh.userData.face(C);
      aim(C, 0, 0, 0, lerp(9.0, 8.0, smooth(t / 9.18)), -10 + (ft - 668.56) * 2.2, 10, 0, 0);
      return [S, C, [["event horizon", RH * 0.75, RH * 0.75, 0, fadeIO(ft, 675.4, 677.7, 0.5)]]];
    };
  }
  LABK.starlife = (o) => ({ balance: slBalance, dwarf: slDwarf, neutron: slNeutron, limit: slLimit, collapse: slCollapse }[o.mode] || slBalance)(o);

  // ======================================================================= LIGHTBAND
  const X0 = -9, X1 = 9, VIS = [1.2, 2.0];
  const specCol = (u) => { const st = [[0, 0.72, 0.15, 0.11], [0.17, 0.85, 0.33, 0.12], [0.33, 0.91, 0.7, 0.23], [0.48, 0.55, 0.77, 0.24], [0.62, 0.18, 0.64, 0.48], [0.76, 0.18, 0.44, 0.76], [0.9, 0.3, 0.25, 0.69], [1, 0.36, 0.17, 0.54]]; let i = 1; while (i < st.length - 1 && u > st[i][0]) i++; const a = st[i - 1], b = st[i], p = clamp((u - a[0]) / (b[0] - a[0]), 0, 1); return [lerp(a[1], b[1], p), lerp(a[2], b[2], p), lerp(a[3], b[3], p)]; };
  const bandTex = once(() => canvasTex(4096, 128, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(40,50,66,.55)"); gr.addColorStop(0.5, "rgba(24,30,42,.42)"); gr.addColorStop(1, "rgba(40,50,66,.55)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const a = (VIS[0] - X0) / (X1 - X0) * w, b = (VIS[1] - X0) / (X1 - X0) * w;
    for (let x = Math.floor(a); x < b; x++) { const c = specCol((x - a) / (b - a)), e = Math.min(1, (x - a) / 10, (b - x) / 10); g.fillStyle = `rgba(${c[0] * 255 | 0},${c[1] * 255 | 0},${c[2] * 255 | 0},${0.68 * e})`; g.fillRect(x, 0, 1, h); }
    g.fillStyle = "rgba(205,218,236,.5)"; g.fillRect(0, 0, w, 2); g.fillRect(0, h - 2, w, 2);
  }));
  LABK.lightband = (o) => {
    const S = stage("space", { seed: 31, stars: 5000 }), C = cam(32);
    const band = new THREE.Mesh(new THREE.PlaneGeometry(X1 - X0, 1.1), new THREE.MeshBasicMaterial({ map: bandTex(), transparent: true, depthWrite: false })); S.add(band);
    // chirped wave: wavelength shrinks exponentially left -> right; sampled evenly in phase
    const L0 = 6, kk = Math.log(L0 / 0.07) / (X1 - X0), PH = TAU / (L0 * kk) * (Math.exp(kk * (X1 - X0)) - 1), NW = 1800;
    const xs = new Float32Array(NW); for (let i = 0; i < NW; i++) xs[i] = X0 + Math.log(1 + (i / (NW - 1)) * PH * L0 * kk / TAU) / kk;
    const wave = ribbon(NW, 0.022, lineMat(0xffffff, 1)); wave.position.z = 0.02; S.add(wave);
    const P2 = new Float32Array(NW * 2), C3 = new Float32Array(NW * 3);
    for (let i = 0; i < NW; i++) { const x = xs[i]; let c = [0.8, 0.84, 0.9]; if (x > VIS[0] && x < VIS[1]) { const s = specCol((x - VIS[0]) / (VIS[1] - VIS[0])); c = [s[0] * 1.3 + 0.1, s[1] * 1.3 + 0.1, s[2] * 1.3 + 0.1]; } C3.set(c, i * 3); }
    const peak = glowSprite(0xfff4e4, 0.9, 0); peak.position.z = 0.03; S.add(peak);
    const SP = V(1.6, -2.9, 0), hot = sunBall(0xffffff, 1.4, 0.45, 0.04); hot.scale.setScalar(0.85); hot.position.copy(SP); S.add(hot);
    const hotGlow = glowSprite(0xffffff, 3.2, 0.3); hotGlow.position.copy(SP); S.add(hotGlow);
    const xOfNm = (nm) => 10.57 - 1.43 * Math.log(nm);
    const labels = [["radio", -6.2, 724.6, 725.9], ["infrared", -0.6, 725.6, 726.55], ["ultraviolet", 2.6, 726.3, 727.4], ["X-rays", 4.6, 727.4, 728.45], ["gamma rays", 6.4, 728.3, 729.6]];
    return (t) => {
      const ft = o.T0 + t;
      for (let i = 0; i < NW; i++) { const ph = (i / (NW - 1)) * PH; P2[i * 2] = xs[i]; P2[i * 2 + 1] = 0.3 * Math.sin(ph - 2.2 * ft); }
      wave.userData.set(P2, C3);
      const T = lerp(1400, 13000, Math.pow(seg(ft, 729.7, 733.2), 1.3)), hk = seg(ft, 729.3, 730.1);
      const c = bb(T); hot.visible = hk > 0; hot.material.uniforms.tint.value.copy(c); hot.material.uniforms.k.value = (0.55 + 1.3 * clamp((T - 1400) / 6000, 0, 1)) * hk; hot.rotation.y = ft * 0.05;
      hotGlow.material.color.copy(c); hotGlow.material.opacity = 0.35 * hk * (0.4 + 0.6 * clamp((T - 1400) / 6000, 0, 1));
      peak.position.x = clamp(xOfNm(2.9e6 / T), X0, X1); peak.material.color.copy(c); peak.material.opacity = 0.5 * hk;
      const out = seg(ft, 722.6, 724.6), down = seg(ft, 729.0, 731.2), _d = 0;
      aim(C, lerp(1.6, 0.2, out) + 0.9 * down, lerp(0.05, 0.1, out) - 1.45 * down, 0, lerp(8.2, 21.5, out) - 2.0 * down + 0.08 * t, 8 - 4 * out + (ft - 719.7) * 0.25, lerp(4, 6, out) + 4 * down, 0, 0.04 * down);
      const pins = [["what our eyes see", 1.6, 0.56, 0, fadeIO(ft, 720.5, 723.7, 0.5)]];
      for (const [s, x, a, b] of labels) pins.push([s, x, 0.56, 0, fadeIO(ft, a, b, 0.25)]);
      pins.push(["hotter → shorter waves", SP.x + 0.75, SP.y + 0.2, 0, fadeIO(ft, 730.4, 733.4, 0.6)]);
      return [S, C, pins.filter((p) => p[4] > 0.001)];
    };
  };

  // ======================================================================= INFALL
  LABK.infall = (o) => {
    const S = stage("space", { seed: 33, stars: 6000 }), C = cam(32);
    const g = gas(51, 10000, { streams: [0.2, 2.3, 4.3], spread: 0.3, rOut: [6.5, 9], rIn: 0.3, L: [7, 11], h: 0.6, swirl: 3.4, size: 0.15 }); S.add(g);
    const bh = blackHole(); bh.scale.setScalar(0.2); S.add(bh);
    const inner = glowSprite(0xe6eeff, 1, 0); S.add(inner);
    return (t) => {
      const ft = o.T0 + t, heat = seg(ft, 756.6, 759.0);
      g.userData.tick(ft, 0.75, heat, 0.6 * heat);
      bh.userData.face(C);
      inner.scale.setScalar(1.6 + 0.6 * heat); inner.material.opacity = 0.1 + 0.25 * heat;
      aim(C, 0, 0, 0, lerp(17, 11.5, smooth(t / 19.3)), 20 + (ft - 742) * 1.3, lerp(40, 30, smooth(t / 19.3)), lerp(0.13, 0.04, seg(ft, 745.5, 748.5)), lerp(0.08, 0.02, seg(ft, 745.5, 748.5)));
      return [S, C, [["thousands of degrees", -4.2, 0.1, 2.2, fadeIO(ft, 751.4, 756.4, 0.6)], ["millions of degrees · X-rays", -0.7, 0.1, -0.7, fadeIO(ft, 757.8, 761.3, 0.6)]]];
    };
  };

  // ======================================================================= FLICKER
  LABK.flicker = (o) => {
    const S = stage("space", { seed: 35, stars: 6000 }), C = cam(32);
    // light curve floating in space
    const GP = V(-10, 0.6, 0), GW = 6, NG = 700, graph = new THREE.Group(); graph.position.copy(GP); S.add(graph);
    const curve = ribbon(NG, 0.012, lineMat(0xffffff, 1)); graph.add(curve); curve.renderOrder = 2;
    const axM = new THREE.LineBasicMaterial({ color: 0x8db8e8, transparent: true, opacity: 0.4 });
    graph.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-GW / 2, 1.5, 0), V(-GW / 2, -0.05, 0), V(GW / 2, -0.05, 0)]), axM));
    for (let i = 1; i < 12; i++) graph.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(-GW / 2 + i * GW / 12, -0.05, 0), V(-GW / 2 + i * GW / 12, -0.12, 0)]), axM));
    const now = glowSprite(0xdfeaff, 0.35, 0.8); graph.add(now);
    const rr = rnd(9), F = Array.from({ length: 9 }, (_, i) => [6 + i * 6 + rr() * 5, rr() * TAU, 0.35 / (1 + i * 0.35)]);
    const lc = (x) => { let v = 0; for (const [f, p, a] of F) v += a * Math.sin(f * x + p); return 0.65 + 0.5 * v; };
    const PG = new Float32Array(NG * 2), CG = new Float32Array(NG * 3);
    for (let i = 0; i < NG; i++) { const f = 0.25 + 0.75 * (i / NG); CG.set([0.82 * f, 0.88 * f, 0.97 * f], i * 3); }
    // the Sun
    const SC = V(2, 0, -2), RS = 3, sun = sunBall(0xfff0dc, 1.5); sun.scale.setScalar(RS); sun.position.copy(SC); S.add(sun);
    const glow = glowSprite(0xffd2a0, RS * 3.4, 0.3); glow.position.copy(SC); S.add(glow);
    const pulse = ribbon(200, 0.035, lineMat(0xffffff, 1)); pulse.material.depthTest = false; pulse.renderOrder = 9; pulse.position.set(0, SC.y, SC.z); S.add(pulse);
    const PP = new Float32Array(400), PC = new Float32Array(600);
    const head = glowSprite(0xfff6e6, 0.7, 0); head.material.depthTest = false; head.renderOrder = 10; S.add(head);
    const TP = V(-2.6, 1.9, -0.6), tiny = glowSprite(0xe8f0ff, 0.5, 0); tiny.position.copy(TP); S.add(tiny);
    const tinyCore = new THREE.Mesh(SPH(), new THREE.MeshBasicMaterial({ color: 0xf4f8ff, transparent: true })); tinyCore.scale.setScalar(0.025); tinyCore.position.copy(TP); S.add(tinyCore);
    return (t) => {
      const ft = o.T0 + t, sc = ft * 1.25;
      for (let i = 0; i < NG; i++) { const x = -GW / 2 + GW * i / (NG - 1); PG[i * 2] = x; PG[i * 2 + 1] = lc(x + sc - GW / 2); }
      curve.userData.set(PG, CG); const v = lc(sc); now.position.set(GW / 2, v, 0.01); now.material.opacity = (0.35 + 0.55 * clamp(v - 0.2, 0, 1)) * (1 - seg(ft, 812.9, 814.2));
      graph.quaternion.copy(C.quaternion); const ga = 1 - seg(ft, 812.9, 814.2); graph.visible = ga > 0.001; curve.material.opacity = ga; axM.opacity = 0.4 * ga;
      sun.rotation.y = ft * 0.02;
      sun.material.uniforms.k.value = 1.5 * (1 + 0.07 * Math.sin(TAU * (ft - 819.4) / 4.5) * seg(ft, 819.4, 820.6));
      // a light pulse crossing the Sun in a real 4.5 s
      const p = clamp((ft - 814.9) / 4.5, 0, 1), n = Math.max(2, Math.round(200 * p)), xl = SC.x - RS * 0.985;
      for (let i = 0; i < 200; i++) { const x = xl + 2 * RS * 0.985 * p * Math.min(i, n - 1) / (n - 1); PP[i * 2] = x; PP[i * 2 + 1] = 0; const f = 0.25 + 0.75 * Math.min(i, n - 1) / (n - 1); PC.set([f, 0.95 * f, 0.86 * f], i * 3); }
      pulse.userData.set(PP, PC); const pa = seg(ft, 814.8, 815.1) * (1 - seg(ft, 819.6, 820.8)); pulse.material.opacity = pa; pulse.visible = pa > 0;
      head.position.set(xl + 2 * RS * 0.985 * p, SC.y, SC.z); head.material.opacity = 0.8 * pa * (p < 1 ? 1 : 0.5);
      // tiny object flickering (irregular, several times a second)
      const tk = seg(ft, 826.1, 826.9), fl = 0.55 + 0.45 * Math.sin(ft * 41) * Math.sin(ft * 27.3 + 1) + 0.15 * Math.sin(ft * 63.1);
      tiny.material.opacity = tk * clamp(fl, 0.15, 1); tiny.scale.setScalar(0.42 + 0.16 * fl); tinyCore.material.opacity = tk;
      const pan = seg(ft, 812.6, 814.6), toTiny = seg(ft, 826.0, 829.5);
      const tgt = GP.clone().add(V(0, 0.75, 0)).lerp(SC.clone().add(V(-0.4, 0, 0)), pan).lerp(V(-0.3, 0.6, -1.4), toTiny);
      aim(C, tgt.x, tgt.y, tgt.z, lerp(8.5, 16.5, pan) + 0.06 * Math.max(0, ft - 815) + 1.2 * toTiny, lerp(-8, 6, pan) + (ft - 809.7) * 0.3, 5, 0.1 * pan - 0.05 * toTiny, 0.09 * pan - 0.03 * toTiny);
      return [S, C, [["flickers many times a second", GP.x - 1.4, GP.y + 1.55, GP.z, fadeIO(ft, 810.3, 814.0, 0.5)],
        ["4.5 seconds to cross the Sun", SC.x - RS * 2.45, SC.y + RS * 0.3, SC.z, fadeIO(ft, 815.2, 821.8, 0.6)],
        ["tiny", TP.x, TP.y + 0.06, TP.z, fadeIO(ft, 828.4, 837.6, 0.6)]]];
    };
  };

  // ======================================================================= FUNNEL (coin in a donation well)
  LABK.funnel = (o) => {
    const S = stage("studio", { floorY: -2.4, key: 2.0 }), C = cam(30);
    const R1 = 1.7, RH = 0.13, K = 0.16, fy = (r) => -K / r + K / R1, dfy = (r) => K / (r * r);
    const prof = []; for (let i = 0; i <= 120; i++) { const r = RH + (R1 - RH) * Math.pow(i / 120, 1.6); prof.push(new THREE.Vector2(r, fy(r))); }
    const plastic = new THREE.MeshPhysicalMaterial({ color: 0x24405c, roughness: 0.22, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.06, side: THREE.DoubleSide, envMapIntensity: 1.1 });
    const funnel = new THREE.Mesh(new THREE.LatheGeometry(prof, 160), plastic); funnel.castShadow = funnel.receiveShadow = true; S.add(funnel);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(R1 + 0.025, 0.035, 16, 160), plastic); lip.rotation.x = Math.PI / 2; lip.castShadow = true; S.add(lip);
    const throatY = fy(RH);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(RH, RH, 0.5, 40, 1, true), plastic); tube.position.y = throatY - 0.25; S.add(tube);
    const holeIn = new THREE.Mesh(new THREE.CircleGeometry(RH * 0.98, 40), new THREE.MeshBasicMaterial({ color: 0x050506 })); holeIn.rotation.x = -Math.PI / 2; holeIn.position.y = throatY - 0.12; S.add(holeIn);
    const base = new THREE.MeshStandardMaterial({ color: 0x2a2c30, roughness: 0.5, metalness: 0.4 });
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.34, 2.4 + throatY - 0.4, 48), base); col.position.y = (throatY - 0.4 - 2.4) / 2; col.castShadow = col.receiveShadow = true; S.add(col);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.85, 0.9, 0.08, 64), base); foot.position.y = -2.36; foot.castShadow = foot.receiveShadow = true; S.add(foot);
    // coin: nickel-silver disc with a raised rim (bump map)
    const RC = 0.085, coinBump = canvasTex(256, 256, (g) => { g.fillStyle = "#777"; g.fillRect(0, 0, 256, 256); g.strokeStyle = "#fff"; g.lineWidth = 14; g.beginPath(); g.arc(128, 128, 118, 0, TAU); g.stroke(); g.lineWidth = 3; g.beginPath(); g.arc(128, 128, 96, 0, TAU); g.stroke(); g.fillStyle = "#bbb"; g.beginPath(); g.arc(128, 128, 48, 0, TAU); g.fill(); g.font = "bold 40px Georgia"; g.textAlign = "center"; g.fillStyle = "#ddd"; g.fillText("1", 128, 142); });
    const coinM = new THREE.MeshStandardMaterial({ color: 0xc8c6c0, metalness: 1, roughness: 0.3, bumpMap: coinBump, bumpScale: 1.5 }), edgeM = new THREE.MeshStandardMaterial({ color: 0xb9b6ae, metalness: 1, roughness: 0.4 });
    const coin = new THREE.Mesh(new THREE.CylinderGeometry(RC, RC, 0.012, 64), [edgeM, coinM, coinM]); coin.castShadow = true; S.add(coin);
    // motion (closed form): r^1.5 falls linearly, angular speed ~ r^-1.5 (faster near the centre)
    const r0 = 1.45, rEnd = 0.3, W0 = 4, q0 = Math.pow(r0, 1.5), cc = (q0 - Math.pow(rEnd, 1.5)) / (1.5 * 10.7);
    const state = (ts) => { const q = Math.max(q0 - 1.5 * cc * ts, 0.05), r = Math.pow(q, 2 / 3); return [r, -(W0 / (1.5 * cc)) * Math.log(q / q0), W0 * (r0 - r) / cc]; };
    const er = V(0, 0, 0), et = V(0, 0, 0), up = V(0, 1, 0), N = V(0, 0, 0), sd = V(0, 0, 0), u = V(0, 0, 0), ax = V(0, 0, 0), z = V(0, 0, 0), mB = new THREE.Matrix4(), qs = new THREE.Quaternion();
    return (t) => {
      const ft = o.T0 + t, ts = ft - 979.5, [r, th, arc] = state(ts);
      er.set(Math.cos(th), 0, Math.sin(th)); et.set(-Math.sin(th), 0, Math.cos(th));
      const sl = dfy(r); sd.copy(er).addScaledVector(up, sl).normalize(); N.copy(up).addScaledVector(er, -sl).normalize();
      const lean = 0.12 + 0.35 * clamp((r0 - r) / (r0 - rEnd), 0, 1);
      u.copy(N).multiplyScalar(Math.cos(lean)).addScaledVector(sd, -Math.sin(lean)).normalize();
      ax.crossVectors(et, u).normalize(); z.crossVectors(et, ax);
      mB.makeBasis(et, ax, z); coin.quaternion.setFromRotationMatrix(mB).multiply(qs.setFromAxisAngle(up, -arc / RC));
      coin.position.set(r * Math.cos(th), fy(r), r * Math.sin(th)).addScaledVector(u, RC).addScaledVector(N, 0.004);
      aim(C, 0, -0.95, 0, lerp(7.6, 7.0, smooth(t / 10.7)), 25 + t * 1.5, lerp(32, 37, smooth(t / 10.7)), 0, 0);
      return [S, C, [["faster near the centre", 0.32, fy(0.32) + 0.05, 0.1, fadeIO(ft, 984.5, 990.0, 0.6)]]];
    };
  };
})();
