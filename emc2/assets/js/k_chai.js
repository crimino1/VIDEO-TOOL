/* k_chai.js — group A of the E = mc² film: LABK.chai, LABK.props, LABK.balance.
   Units: 1 = 10 cm, table top at y = 0. Everything is a pure function of film time ft = o.T0 + t.
   Shallow focus: each set lives in two scenes. The back scene B is rendered every frame with the shot camera into a small render target and
   blurred; a full-screen OPAQUE quad shows it behind the main scene S (opaque, so the transmissive chai glass refracts it), and the main-scene
   copies of the set (table, desk) dissolve into it with distance from the focus plane (dofify). Subjects live only in S and stay sharp.
   Glass: the chai glass is real transmission (thick, green tint, 14 flutes); jars over it are thin alpha-blended reflective shells, because in
   r160 the transmission buffer holds opaque objects only and a transmissive jar would overwrite the glass behind it. */
(function () {
  const { THREE, seg, smooth, lerp, clamp, rnd, canvasTex, W, H, R } = L3;
  const V3 = THREE.Vector3, TAU = Math.PI * 2, V = (x, y, z) => new V3(x, y, z);
  const win = (t, a, b, f) => { f = f || 0.4; return seg(t, a, a + f) * (1 - seg(t, b - f, b)); };
  const once = (fn) => { let v; return () => v || (v = fn()); };

  // film times of visible events (also the sound-cue list in the report)
  const EV = {
    sealLower: 10.66, sealDown: 12.15, sealCut: 15.42,
    divideCut: 204.5, divideTwitch: 206.2,
    addDip: [233.3, 236.8], addRise: [239.2, 241.5], addSettle: 241.5,
    springWind: 248.35, recapCut: 608.85,
    coolSteamGone: 631.0, endFade: 644.2,
  };

  // ---------------------------------------------------------------- camera helpers (from electricity k_energy.js)
  function aim(C, p, dist, az, el, ox, oy) {
    L3.orbit(C, p.x, p.y, p.z, dist, az, el);
    C.near = Math.max(0.02, dist * 0.02); C.far = Math.max(300, dist * 40);
    if (ox || oy) C.setViewOffset(W, H, ox || 0, oy || 0, W, H); else C.clearViewOffset();
    C.updateProjectionMatrix();
  }
  function cr(K, t) {
    const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    let i = 0; while (t >= K[i + 1][0]) i++;
    const a = K[Math.max(i - 1, 0)], b = K[i], c = K[i + 1], d = K[Math.min(i + 2, n - 1)], h = c[0] - b[0], u = (t - b[0]) / h;
    const m1 = i === 0 ? (c[1] - b[1]) * 0.5 : (c[1] - a[1]) / (c[0] - a[0]) * h, m2 = i + 2 >= n ? (c[1] - b[1]) * 0.5 : (d[1] - b[1]) / (d[0] - b[0]) * h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * b[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * c[1] + (u3 - u2) * m2;
  }
  // keys: [[ft, tx, ty, tz, dist, az, el, ox, oy], ...]  (ox/oy = view offset in px, optional)
  function camKeys(C, K, t) {
    const g = (j) => cr(K.map((k) => [k[0], k[j] || 0]), t);
    aim(C, V(g(1), g(2), g(3)), g(4), g(5), g(6), g(7), g(8));
  }
  const cam = (fov) => new THREE.PerspectiveCamera(fov || 30, W / H, 0.05, 400);

  // ---------------------------------------------------------------- procedural textures (cached, seeded; from k_energy.js)
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function vn(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s, o) { let f = 0, a = 0.5; for (let i = 0; i < (o || 4); i++) { f += a * vn(x, y, s + i * 17); x *= 2; y *= 2; a *= 0.5; } return f; }
  const TC = {};
  function pixTex(key, w, h, fn, srgb) {
    if (TC[key]) return TC[key];
    const t = canvasTex(w, h, (g) => { const im = g.createImageData(w, h), D = im.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn(x, y), i = (y * w + x) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = c[3] === undefined ? 255 : c[3]; } g.putImageData(im, 0, 0); });
    t.wrapS = t.wrapT = THREE.MirroredRepeatWrapping; t.anisotropy = 8; if (srgb === false) t.colorSpace = THREE.NoColorSpace;
    return (TC[key] = t);
  }
  const ctex = (key, w, h, fn) => TC[key] || (TC[key] = (() => { const t = canvasTex(w, h, fn); t.anisotropy = 8; return t; })());
  const woodTex = (key, base, seed, w, h) => pixTex(key, w || 1024, h || 512, (x, y) => {
    const gy = y / 11 + 7 * fbm(x / 520, y / 90, seed, 3) + 2.2 * fbm(x / 140, y / 30, seed + 2, 2), ring = 0.5 + 0.5 * Math.sin(gy * 2.1), fine = vn(x / 2.5, y / 0.8, seed + 9), streak = fbm(x / 700, y / 5, seed + 5, 3);
    const k = 0.8 + 0.07 * Math.pow(ring, 4) + 0.025 * fine + 0.1 * (streak - 0.5) - 0.1 * (fbm(x / 260, y / 160, seed + 3, 3) - 0.5);
    return [base[0] * k, base[1] * k, base[2] * k];
  });
  const rep = (t, x, y) => { const c = t.clone(); c.needsUpdate = true; c.repeat.set(x, y); return c; };

  // ---------------------------------------------------------------- shallow focus: blurred back scene + full-screen backdrop
  const FSV = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const RT = once(() => {
    const o = { type: THREE.HalfFloatType, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false };
    const a = new THREE.WebGLRenderTarget(960, 540, o), b = new THREE.WebGLRenderTarget(960, 540, Object.assign({ depthBuffer: false }, o));
    const mat = new THREE.ShaderMaterial({
      uniforms: { tSrc: { value: null }, uDir: { value: new THREE.Vector2() } }, vertexShader: FSV, depthTest: false, depthWrite: false, toneMapped: false,
      fragmentShader: "uniform sampler2D tSrc; uniform vec2 uDir; varying vec2 vUv; void main(){ vec4 c = texture2D(tSrc, vUv) * 0.2270270;" +
        " c += (texture2D(tSrc, vUv + uDir * 1.3846154) + texture2D(tSrc, vUv - uDir * 1.3846154)) * 0.3162162;" +
        " c += (texture2D(tSrc, vUv + uDir * 3.2307692) + texture2D(tSrc, vUv - uDir * 3.2307692)) * 0.0702703; gl_FragColor = c; }",
    });
    const q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); q.frustumCulled = false;
    const qs = new THREE.Scene(); qs.add(q);
    return { a, b, mat, qs, oc: new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1) };
  });
  function blurBack(B, C, rad) {
    const T = RT(), prev = R.getRenderTarget();
    R.setRenderTarget(T.a); R.render(B, C);
    for (let i = 0; i < 3; i++) {
      const r = rad * (0.6 + 0.4 * i);
      T.mat.uniforms.tSrc.value = T.a.texture; T.mat.uniforms.uDir.value.set(r / 640, 0); R.setRenderTarget(T.b); R.render(T.qs, T.oc);
      T.mat.uniforms.tSrc.value = T.b.texture; T.mat.uniforms.uDir.value.set(0, r / 360); R.setRenderTarget(T.a); R.render(T.qs, T.oc);
    }
    R.setRenderTarget(prev);
  }
  function backdrop() {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: { tSrc: { value: RT().a.texture } }, vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }",
      fragmentShader: "uniform sampler2D tSrc; varying vec2 vUv; void main(){ gl_FragColor = vec4(texture2D(tSrc, vUv).rgb, 1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}",
      depthTest: false, depthWrite: false,
    }));
    m.renderOrder = -1000; m.frustumCulled = false; return m;
  }
  function fader() {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
      uniforms: { uA: { value: 0 } }, vertexShader: FSV, fragmentShader: "uniform float uA; void main(){ gl_FragColor = vec4(0.0, 0.0, 0.0, uA); }",
      transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
    }));
    m.renderOrder = 10000; m.frustumCulled = false;
    m.set = (k) => { m.material.uniforms.uA.value = clamp(k, 0, 1); m.visible = k > 0.001; };
    m.set(0); return m;
  }
  // main-scene set materials dissolve into the blurred backdrop with distance from the focus plane
  const DOFU = { uBg: { value: null }, uFD: { value: 4 }, uD0: { value: 0.4 }, uD1: { value: 3 } };
  function dofify(mat) {
    DOFU.uBg.value = RT().a.texture;
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, DOFU);
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec4 vClipP; varying float vVZ;")
        .replace("#include <project_vertex>", "#include <project_vertex>\nvClipP = gl_Position; vVZ = -mvPosition.z;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nuniform sampler2D uBg; uniform float uFD, uD0, uD1; varying vec4 vClipP; varying float vVZ;")
        .replace("#include <opaque_fragment>", "float dofK = smoothstep(uD0, uD1, abs(vVZ - uFD));\noutgoingLight = mix(outgoingLight, texture2D(uBg, vClipP.xy / vClipP.w * 0.5 + 0.5).rgb, dofK);\n#include <opaque_fragment>");
    };
    mat.customProgramCacheKey = () => "dof";
    return mat;
  }

  // ---------------------------------------------------------------- environment maps (rooms with a window), PMREM
  const ENV = {};
  function roomEnv(kind) {
    if (ENV[kind]) return ENV[kind];
    const cfg = {
      kitchen: { wall: [0.07, 0.055, 0.04], win: [2.4, 2.15, 1.85], winPos: [14, 17, -19], winS: [20, 14], fill: 0.35, strips: 3, floor: [0.07, 0.045, 0.03] },
      dim: { wall: [0.02, 0.016, 0.012], win: [0.5, 0.45, 0.4], winPos: [-14, 8, -22], winS: [20, 14], fill: 0.12, strips: 1, floor: [0.025, 0.017, 0.012] },
      late: { wall: [0.06, 0.05, 0.04], win: [2.6, 2.45, 2.2], winPos: [12, 15, -20], winS: [22, 16], fill: 0.22, strips: 2, floor: [0.08, 0.055, 0.04] },
      lab: { wall: [0.05, 0.046, 0.04], win: [0.9, 0.9, 0.9], winPos: [-16, 18, 6], winS: [12, 10], fill: 0.5, floor: [0.03, 0.02, 0.014] },
      stove: { wall: [0.04, 0.035, 0.03], win: [1.8, 1.75, 1.7], winPos: [16, 8, -14], winS: [12, 12], fill: 0.25, floor: [0.02, 0.02, 0.02] },
      desk: { wall: [0.1, 0.075, 0.05], win: [2.2, 1.9, 1.5], winPos: [-12, 10, 10], winS: [14, 12], fill: 0.3, floor: [0.06, 0.04, 0.025] },
    }[kind];
    const s = new THREE.Scene(), col = (a) => new THREE.Color(a[0], a[1], a[2]);
    s.add(new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.MeshBasicMaterial({ color: col(cfg.wall), side: THREE.BackSide })));
    const panel = (w, h, p, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: col(c), side: THREE.DoubleSide })); m.position.set(p[0], p[1], p[2]); m.lookAt(0, 0, 0); s.add(m); };
    panel(cfg.winS[0], cfg.winS[1], cfg.winPos, cfg.win);
    panel(30, 10, [6, 14, 22], [cfg.fill, cfg.fill * 0.95, cfg.fill * 0.88]);
    panel(5, 22, [-12, 6, 18], [cfg.fill * 3.2, cfg.fill * 3.0, cfg.fill * 2.7]);
    if (cfg.strips) { panel(1.6, 40, [9, -2, 17], [cfg.strips, cfg.strips * 0.96, cfg.strips * 0.9]); panel(1.2, 40, [-6, -2, 19], [cfg.strips * 0.7, cfg.strips * 0.68, cfg.strips * 0.64]); }
    const fl = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.MeshBasicMaterial({ color: col(cfg.floor) })); fl.rotation.x = -Math.PI / 2; fl.position.y = -1; s.add(fl);
    const p = new THREE.PMREMGenerator(R); ENV[kind] = p.fromScene(s, 0.02).texture; p.dispose();
    return ENV[kind];
  }

  // ---------------------------------------------------------------- lathe with flutes and seam-welded normals
  // P = [[r, y, ribWeight?], ...] travelling so the surface normal is on the right of the path in the (r, y) plane
  function lathe(P, segs, ribA, ribN, planarR) {
    const n = P.length, cols = segs + 1, pos = new Float32Array(n * cols * 3), uv = new Float32Array(n * cols * 2), idx = [];
    const L = [0]; for (let k = 1; k < n; k++) L[k] = L[k - 1] + Math.hypot(P[k][0] - P[k - 1][0], P[k][1] - P[k - 1][1]);
    for (let k = 0; k < n; k++) for (let j = 0; j <= segs; j++) {
      const th = j / segs * TAU, rib = P[k][2] ? P[k][2] * ribA * (Math.abs(Math.cos(ribN * th / 2)) - 0.6) : 0, r = P[k][0] + rib, i = k * cols + j;
      pos[i * 3] = r * Math.sin(th); pos[i * 3 + 1] = P[k][1]; pos[i * 3 + 2] = r * Math.cos(th);
      if (planarR) { uv[i * 2] = 0.5 + pos[i * 3] / planarR * 0.5; uv[i * 2 + 1] = 0.5 + pos[i * 3 + 2] / planarR * 0.5; }
      else { uv[i * 2] = j / segs; uv[i * 2 + 1] = L[k] / L[n - 1]; }
    }
    for (let k = 0; k < n - 1; k++) for (let j = 0; j < segs; j++) { const a = k * cols + j, b = a + cols; idx.push(a, a + 1, b, a + 1, b + 1, b); }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("uv", new THREE.BufferAttribute(uv, 2)); g.setIndex(idx); g.computeVertexNormals();
    const N = g.attributes.normal, t = V(0, 0, 0);
    for (let k = 0; k < n; k++) { const a = k * cols, b = a + segs; t.set(N.getX(a) + N.getX(b), N.getY(a) + N.getY(b), N.getZ(a) + N.getZ(b)).normalize(); N.setXYZ(a, t.x, t.y, t.z); N.setXYZ(b, t.x, t.y, t.z); }
    return g;
  }
  const arc = (cx, cy, r, a0, a1, n) => { const o = []; for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; o.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } return o; };

  // ================================================================= THE CHAI GLASS
  // a small ribbed cutting-chai glass: 8.6 cm tall, 5 cm base, 6.6 cm rim, thick base, 14 flutes on the lower 60 %
  const GH = 0.86, FY = 0.66;
  const gR = (y) => 0.25 + 0.078 * Math.pow(clamp(y / GH, 0, 1), 1.3);
  const gRi = (y) => gR(y) - 0.024;
  const ribMask = (y) => smooth((y - 0.012) / 0.04) * (1 - smooth((y - 0.47) / 0.12));
  const GEO = once(() => {
    const P = [[0, 0.007], [0.12, 0.004], [0.2, 0.0012], [0.232, 0], [0.245, 0.005]];
    for (let i = 0; i <= 44; i++) { const y = 0.013 + (0.85 - 0.013) * i / 44; P.push([gR(y), y, ribMask(y)]); }
    const yl = 0.852, rc = gR(yl) - 0.012; arc(rc, yl, 0.012, 0, Math.PI, 10).slice(1).forEach((p) => P.push(p));
    for (let i = 1; i <= 30; i++) { const y = yl - (yl - 0.15) * i / 30; P.push([gRi(y), y]); }
    P.push([gRi(0.15) - 0.008, 0.124], [gRi(0.15) - 0.03, 0.112], [0.12, 0.108], [0, 0.11]);
    const glass = lathe(P, 224, 0.022, 14);
    const T = [[0, 0.114], [gRi(0.15) - 0.032, 0.114], [gRi(0.15) - 0.011, 0.124]];
    for (let i = 0; i <= 20; i++) { const y = 0.15 + (FY - 0.15) * i / 20; T.push([gRi(y) - 0.0015, y]); }
    const tea = lathe(T, 96);
    const rT = gRi(FY) - 0.0015;
    const top = lathe([[rT, FY + 0.005], [rT - 0.004, FY + 0.0022], [rT - 0.012, FY + 0.0006], [rT - 0.03, FY], [rT * 0.5, FY], [0, FY]], 96, 0, 0, rT);
    return { glass, tea, top, rT, sph: new THREE.SphereGeometry(1, 14, 10) };
  });
  const glassMat = once(() => {
    const m = new THREE.MeshPhysicalMaterial({ color: 0xf4faf2, roughness: 0.035, metalness: 0, transmission: 1, thickness: 0.09, ior: 1.52, attenuationColor: new THREE.Color(0xc8e2c9), attenuationDistance: 0.3, specularIntensity: 1, envMapIntensity: 1.0 });
    m.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace("#include <opaque_fragment>",
        "float edgeK = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 2.2);\noutgoingLight *= mix(vec3(1.0), vec3(0.5, 0.68, 0.56), edgeK * 0.6);\n#include <opaque_fragment>");
    };
    m.customProgramCacheKey = () => "chaiGlass";
    return m;
  });
  // milky masala chai: opaque caramel; the top has froth at the meniscus (hot) or a faint skin (cool)
  const teaSide = once(() => new THREE.MeshPhysicalMaterial({ color: 0xb98150, roughness: 0.5, sheen: 0.6, sheenRoughness: 0.5, sheenColor: new THREE.Color(0xd59a64), envMapIntensity: 0.6 }));
  function teaTopTex(cool) {
    return ctex(cool ? "teaTopC" : "teaTopH", 1024, 1024, (g, w, h) => {
      const r = rnd(cool ? 77 : 41), c = w / 2;
      g.fillStyle = cool ? "#9c6a40" : "#a5703f"; g.fillRect(0, 0, w, h);
      const gr = g.createRadialGradient(c, c, 0, c, c, c); gr.addColorStop(0, "rgba(70,38,16,0.0)"); gr.addColorStop(0.8, "rgba(70,38,16,0.10)"); gr.addColorStop(1, "rgba(200,160,115,0.35)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      // milk swirls
      g.lineCap = "round";
      for (let i = 0; i < 26; i++) { const a = r() * TAU, rr = c * (0.15 + 0.6 * r()); g.strokeStyle = `rgba(${cool ? "205,165,120" : "214,176,130"},${0.04 + 0.06 * r()})`; g.lineWidth = 6 + 30 * r(); g.beginPath(); g.arc(c, c, rr, a, a + 0.6 + 1.6 * r()); g.stroke(); }
      if (cool) { // skin: a soft wrinkled network
        g.strokeStyle = "rgba(222,190,150,0.16)";
        for (let i = 0; i < 140; i++) { let x = r() * w, y = r() * h; g.lineWidth = 1 + 2.5 * r(); g.beginPath(); g.moveTo(x, y); for (let k = 0; k < 8; k++) { x += (r() - 0.5) * 60; y += (r() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
      }
      // froth of tiny bubbles gathered at the rim, mostly on one side
      const nb = cool ? 120 : 900;
      for (let i = 0; i < nb; i++) { const a = (r() < 0.7 ? 2.2 + (r() - 0.5) * 2.6 : r() * TAU), rr = c * (0.84 + 0.16 * Math.sqrt(r())), x = c + Math.cos(a) * rr, y = c + Math.sin(a) * rr, s = 1.5 + 5 * r() * r(); g.fillStyle = `rgba(232,200,160,${0.25 + 0.35 * r()})`; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); g.fillStyle = "rgba(255,240,220,0.5)"; g.beginPath(); g.arc(x - s * 0.3, y - s * 0.3, s * 0.3, 0, TAU); g.fill(); }
      // masala specks
      for (let i = 0; i < 70; i++) { const a = r() * TAU, rr = c * Math.sqrt(r()) * 0.9; g.fillStyle = `rgba(55,30,14,${0.25 + 0.3 * r()})`; g.beginPath(); g.arc(c + Math.cos(a) * rr, c + Math.sin(a) * rr, 0.8 + 1.6 * r(), 0, TAU); g.fill(); }
    });
  }
  const teaTop = (cool) => (cool ? teaTopC : teaTopH)();
  const teaTopH = once(() => new THREE.MeshPhysicalMaterial({ map: teaTopTex(false), roughness: 0.32, clearcoat: 0.3, clearcoatRoughness: 0.12, envMapIntensity: 0.3 }));
  const teaTopC = once(() => new THREE.MeshPhysicalMaterial({ map: teaTopTex(true), roughness: 0.5, clearcoat: 0.12, clearcoatRoughness: 0.3, envMapIntensity: 0.25 }));
  const bubMat = once(() => new THREE.MeshPhysicalMaterial({ color: 0xcfa678, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.1 }));
  function chaiGlass(o) {
    o = o || {};
    const G = GEO(), g = new THREE.Group();
    const glass = new THREE.Mesh(G.glass, glassMat()); glass.renderOrder = 1;
    const tea = new THREE.Mesh(G.tea, teaSide()); tea.castShadow = true;
    const top = new THREE.Mesh(G.top, teaTop(o.cool));
    const n = o.cool ? 8 : 30, bub = new THREE.InstancedMesh(G.sph, bubMat(), n), r = rnd(o.seed || 5), mm = new THREE.Matrix4();
    for (let i = 0; i < n; i++) { const a = i < n * 0.75 ? 2.2 + (r() - 0.5) * 2.4 : r() * TAU, rr = G.rT * (i < n * 0.75 ? 0.86 + 0.11 * r() : 0.3 + 0.5 * r()), s = 0.0035 + 0.008 * r() * r(); mm.makeScale(s, s * 0.7, s).setPosition(Math.cos(a) * rr, FY + 0.001, -Math.sin(a) * rr); bub.setMatrixAt(i, mm); }
    g.add(tea, top, bub, glass);
    return { g, glass, tea, top, bub };
  }

  // ================================================================= STEAM: layered noise-textured ribbons (shader, pure in uT)
  const NOISE = `float h3(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float n3(vec3 x){ vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z); }
  float fbm3(vec3 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a * n3(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; } return s; }`;
  const VSUV = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
  const STEAM_FS = `uniform float uT, uSeed, uOp, uW, uH, uSpread, uSpeed, uCurl, uTop, uDrift; uniform vec3 uCol; varying vec2 vUv;
  ${NOISE}
  void main(){
    float y = vUv.y * uH, x = (vUv.x - 0.5) * uW, t = uT * uSpeed, yn = y / uH;
    vec3 q = vec3(x * 2.4, y * 1.5 - t, uSeed + uT * 0.11);
    float wx = fbm3(q * 1.3) - 0.5, wy = fbm3(q * 1.3 + vec3(5.2, 1.3, 2.7)) - 0.5;
    float cx = (fbm3(vec3(uSeed * 3.1, y * 0.9 - t * 0.55, uT * 0.05)) - 0.5) * uCurl * (0.25 + y) + uDrift * y * y;
    float xx = x - cx + wx * (0.08 + 0.32 * y);
    float wd = uSpread * (0.35 + 2.2 * yn);
    float colm = exp(-xx * xx / (wd * wd));
    float f = fbm3(vec3(xx / wd * 1.3, y * 3.2 - t * 1.7 + wy * 1.6, uSeed * 1.7 + uT * 0.2));
    float fil = pow(1.0 - abs(2.0 * f - 1.0), 3.0);
    float body = smoothstep(0.38, 0.85, fbm3(vec3(xx * 3.5, y * 2.0 - t * 1.25, uSeed + 3.0)));
    float d = colm * (0.5 * fil + 0.35 * body + 0.5 * fil * body);
    d *= smoothstep(0.0, 0.07, yn) * (1.0 - smoothstep(uTop * 0.45, uTop, yn));
    d *= smoothstep(0.0, 0.15, vUv.x) * smoothstep(1.0, 0.85, vUv.x);
    gl_FragColor = vec4(uCol * (0.8 + 0.35 * fil), clamp(d * uOp, 0.0, 1.0));
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
  // o: {n, w, h, spread, speed, curl, col, op, top, drift, seed, spreadXZ}
  function steam(o) {
    o = Object.assign({ n: 5, w: 1.1, h: 1.5, spread: 0.12, speed: 0.5, curl: 0.9, col: 0xf3ece2, op: 0.5, top: 1, drift: 0, seed: 1, xz: 0.06 }, o || {});
    const g = new THREE.Group(), r = rnd(o.seed * 31 + 7), planes = [];
    const geo = new THREE.PlaneGeometry(o.w, o.h); geo.translate(0, o.h / 2, 0);
    for (let i = 0; i < o.n; i++) {
      const m = new THREE.ShaderMaterial({
        uniforms: { uT: { value: 0 }, uSeed: { value: o.seed * 10 + i * 3.7 }, uOp: { value: 0 }, uW: { value: o.w }, uH: { value: o.h }, uSpread: { value: o.spread * (0.75 + 0.5 * r()) },
          uSpeed: { value: o.speed * (0.85 + 0.3 * r()) }, uCurl: { value: o.curl * (0.7 + 0.6 * r()) }, uTop: { value: o.top * (0.8 + 0.2 * r()) }, uDrift: { value: o.drift }, uCol: { value: new THREE.Color(o.col) } },
        vertexShader: VSUV, fragmentShader: STEAM_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      });
      const p = new THREE.Mesh(geo, m); p.position.set((r() - 0.5) * 2 * o.xz, 0, (r() - 0.5) * 2 * o.xz); p.renderOrder = 5; p.userData.k = 0.7 + 0.3 * r(); planes.push(p); g.add(p);
    }
    const wp = V(0, 0, 0);
    g.set = (ft, C, k) => {
      g.visible = k > 0.002; if (!g.visible) return;
      g.updateWorldMatrix(true, false); g.getWorldPosition(wp);
      const yaw = Math.atan2(C.position.x - wp.x, C.position.z - wp.z);
      for (const p of planes) { p.rotation.y = yaw; p.material.uniforms.uT.value = ft; p.material.uniforms.uOp.value = k * o.op * p.userData.k; }
    };
    g.col = (c) => planes.forEach((p) => p.material.uniforms.uCol.value.set(c));
    return g;
  }

  // ================================================================= SETS (environment in S, blurred copy in B)
  const cookie = once(() => ctex("cookie", 256, 256, (g, w, h) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.filter = "blur(5px)"; g.fillStyle = "#fff";
    const m = 22, cx = 0.33 * w, cy = 0.36 * h, b = 7; g.fillRect(m, m, cx - m - b, cy - m - b); g.fillRect(cx + b, m, w - m - cx - b, cy - m - b); g.fillRect(m, cy + b, cx - m - b, h - m - cy - b); g.fillRect(cx + b, cy + b, w - m - cx - b, h - m - cy - b);
  }));
  const steel = once(() => new THREE.MeshStandardMaterial({ color: 0xc9ccd1, metalness: 1, roughness: 0.2 }));
  const steelBrushed = once(() => new THREE.MeshStandardMaterial({ color: 0xb9bcc2, metalness: 1, roughness: 0.34 }));
  function lightsInto(sc, L, shadow) {
    const key = new THREE.SpotLight(L.keyCol || 0xffe0b8, L.key, 0, L.angle || 0.34, L.pen !== undefined ? L.pen : 0.65, 0);
    key.position.fromArray(L.keyPos); key.target.position.fromArray(L.keyTgt || [0, 0, 0]); sc.add(key, key.target);
    key.castShadow = true; key.shadow.mapSize.set(shadow ? 2048 : 256, shadow ? 2048 : 256); key.shadow.camera.near = L.near || 4; key.shadow.camera.far = L.far || 40; key.shadow.bias = -0.00015; key.shadow.normalBias = 0.01;
    if (L.cookie !== false) key.map = cookie();
    const hemi = new THREE.HemisphereLight(L.sky || 0xffe8cc, L.ground || 0x3a2416, L.hemi !== undefined ? L.hemi : 0.3); sc.add(hemi);
    const fill = new THREE.DirectionalLight(L.fillCol || 0xffe6cc, L.fill !== undefined ? L.fill : 0.25); fill.position.fromArray(L.fillPos || [4, 5, 9]); sc.add(fill);
    let rim = null; if (L.rim) { rim = new THREE.DirectionalLight(L.rimCol || 0xcfdcef, L.rim); rim.position.fromArray(L.rimPos || [6, 4, -8]); sc.add(rim); }
    sc.environment = roomEnv(L.env || "kitchen");
    return { key, hemi, fill, rim };
  }
  // kitchen props for the blurred background
  function kitchenBack(B, o) {
    const add = (m, x, y, z) => { m.position.set(x, y, z); B.add(m); return m; };
    // back wall: tiled splash + warm plaster, window upper left
    const tiles = ctex("tiles", 1024, 512, (g, w, h) => { g.fillStyle = "#2a2a26"; g.fillRect(0, 0, w, h); const r = rnd(9); for (let i = 0; i < 8; i++) for (let j = 0; j < 4; j++) { const v = 62 + r() * 14; g.fillStyle = `rgb(${v},${v + 12},${v + 4})`; g.fillRect(i * 128 + 3, j * 128 + 3, 122, 122); } });
    const tl = add(new THREE.Mesh(new THREE.PlaneGeometry(60, 3.4), new THREE.MeshStandardMaterial({ map: rep(tiles, 7.5, 0.85), roughness: 0.25 })), 0, 1.7, -11);
    tl.material.map.wrapS = tl.material.map.wrapT = THREE.RepeatWrapping;
    const plaster = pixTex("plaster", 512, 512, (x, y) => { const k = 0.9 + 0.12 * (fbm(x / 60, y / 60, 3, 4) - 0.5) + 0.04 * (hash(x, y, 2) - 0.5); return [150 * k, 122 * k, 92 * k]; });
    const wallM = new THREE.MeshStandardMaterial({ map: rep(plaster, 6, 3), roughness: 0.9 });
    const wx0 = 1.5, wx1 = 11.5, wy0 = 4.2, wy1 = 13.4;
    add(new THREE.Mesh(new THREE.PlaneGeometry(30 + wx0, 30), wallM), (-30 + wx0) / 2, 3.4 + 15, -11);
    add(new THREE.Mesh(new THREE.PlaneGeometry(30 - wx1, 30), wallM), (30 + wx1) / 2, 3.4 + 15, -11);
    add(new THREE.Mesh(new THREE.PlaneGeometry(wx1 - wx0, wy0 - 3.4), wallM), (wx0 + wx1) / 2, (wy0 + 3.4) / 2, -11);
    add(new THREE.Mesh(new THREE.PlaneGeometry(wx1 - wx0, 33.4 - wy1), wallM), (wx0 + wx1) / 2, (wy1 + 33.4) / 2, -11);
    // the window: bright soft morning outside (sky + foliage), wooden frame and mullions, sill with a tulsi pot
    const outside = ctex("outside", 512, 512, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#f3efe4"); gr.addColorStop(0.55, "#efe6d2"); gr.addColorStop(1, "#c9c19c"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      const r = rnd(12); for (let i = 0; i < 70; i++) { g.fillStyle = `rgba(${70 + r() * 40},${95 + r() * 40},${50 + r() * 25},${0.25 + r() * 0.35})`; g.beginPath(); g.arc(r() * w, h * (0.45 + r() * 0.6), 20 + r() * 60, 0, TAU); g.fill(); }
    });
    const winM = new THREE.MeshBasicMaterial({ map: outside, color: new THREE.Color(o.win, o.win * 0.97, o.win * 0.9) });
    const winMesh = add(new THREE.Mesh(new THREE.PlaneGeometry(wx1 - wx0, wy1 - wy0), winM), (wx0 + wx1) / 2, (wy0 + wy1) / 2, -11.6);
    const frameM = new THREE.MeshStandardMaterial({ color: 0x4a3324, roughness: 0.6 });
    const bar = (w, h, x, y, z, d) => add(new THREE.Mesh(new THREE.BoxGeometry(w, h, d || 0.35), frameM), x, y, z);
    bar(wx1 - wx0 + 0.6, 0.45, (wx0 + wx1) / 2, wy1, -11.3); bar(wx1 - wx0 + 0.6, 0.45, (wx0 + wx1) / 2, wy0, -11.3);
    bar(0.45, wy1 - wy0, wx0, (wy0 + wy1) / 2, -11.3); bar(0.45, wy1 - wy0, wx1, (wy0 + wy1) / 2, -11.3);
    bar(0.22, wy1 - wy0, (wx0 + wx1) / 2, (wy0 + wy1) / 2, -11.4, 0.2); bar(wx1 - wx0, 0.22, (wx0 + wx1) / 2, (wy0 + wy1) / 2 + 0.6, -11.4, 0.2);
    bar(wx1 - wx0 + 1.4, 0.25, (wx0 + wx1) / 2, wy0 - 0.25, -10.6, 1.2);
    const pot = add(new THREE.Mesh(lathe([[0, 0], [0.55, 0], [0.7, 0.9], [0.75, 0.95], [0.6, 0.95], [0, 0.9]], 32), new THREE.MeshStandardMaterial({ color: 0x9a4f2e, roughness: 0.85 })), wx1 - 2.2, wy0, -10.5);
    const leafM = new THREE.MeshStandardMaterial({ color: 0x3f5a2a, roughness: 0.7 }); const lr = rnd(4);
    for (let i = 0; i < 16; i++) { const l = new THREE.Mesh(GEO().sph, leafM); l.scale.set(0.35, 0.18, 0.22); l.position.set(wx1 - 2.2 + (lr() - 0.5) * 1.4, wy0 + 1.1 + lr() * 1.6, -10.5 + (lr() - 0.5) * 0.8); l.rotation.set(lr() * 3, lr() * 3, lr() * 3); B.add(l); }
    // steel tiffin (3 tiers + lid + side bars + handle)
    const tif = new THREE.Group(); const tierP = [[0, 0], [0.62, 0], [0.66, 0.04], [0.66, 0.5], [0.7, 0.53], [0.66, 0.56], [0, 0.56]];
    for (let i = 0; i < 3; i++) { const m = new THREE.Mesh(lathe(tierP, 48), steel()); m.position.y = i * 0.56; tif.add(m); }
    const lid = new THREE.Mesh(lathe([[0, 0], [0.68, 0], [0.6, 0.12], [0.2, 0.2], [0, 0.2]], 48), steel()); lid.position.y = 1.68; tif.add(lid);
    for (const s of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.3, 0.14), steelBrushed()); b.position.set(s * 0.74, 1.15, 0); tif.add(b); }
    const hdl = new THREE.Mesh(new THREE.TorusGeometry(0.74, 0.04, 8, 32, Math.PI), steelBrushed()); hdl.position.y = 2.3; tif.add(hdl);
    tif.scale.setScalar(1.15); add(tif, o.tiffin ? o.tiffin[0] : 3.6, 0, o.tiffin ? o.tiffin[1] : -5.2);
    // kettle
    const ket = new THREE.Group();
    ket.add(new THREE.Mesh(lathe([[0, 0], [0.85, 0], [1.0, 0.25], [1.05, 0.7], [0.9, 1.2], [0.55, 1.45], [0.35, 1.5], [0.36, 1.56], [0.12, 1.62], [0.1, 1.75], [0, 1.78]], 48), steel()));
    const sp = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(0.85, 0.35, 0), V(1.35, 0.7, 0), V(1.6, 1.25, 0), V(1.8, 1.45, 0)]), 24, 0.09, 10), steel()); ket.add(sp);
    const kh = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.06, 8, 24, Math.PI), new THREE.MeshStandardMaterial({ color: 0x1c1712, roughness: 0.5 })); kh.position.y = 1.5; kh.rotation.y = Math.PI / 2; ket.add(kh);
    ket.rotation.y = 2.6; add(ket, o.kettle ? o.kettle[0] : -6.8, 0, o.kettle ? o.kettle[1] : -7.5);
    // hanging ladles on a rail
    if (!o.noLadles) add(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 7, 8), steelBrushed()), -6.0, 7.4, -10.8).rotation.z = Math.PI / 2;
    for (let i = 0; i < (o.noLadles ? 0 : 5); i++) { const lg = new THREE.Group(); const hh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 2.6, 6), steel()); hh.position.y = -1.3; lg.add(hh); const bowl = new THREE.Mesh(new THREE.SphereGeometry(0.35 + 0.1 * (i % 2), 20, 10, 0, TAU, Math.PI / 2, Math.PI / 2), steel()); bowl.position.y = -2.6; lg.add(bowl); add(lg, -8.6 + i * 1.3, 7.4, -10.7); }
    // brass lota
    if (!o.noLota) add(new THREE.Mesh(lathe([[0, 0], [0.4, 0], [0.62, 0.35], [0.6, 0.62], [0.3, 0.85], [0.28, 1.0], [0.38, 1.08], [0, 1.08]], 40), new THREE.MeshStandardMaterial({ color: 0xc19a55, metalness: 1, roughness: 0.3 })), -2.4, 0, -9.0);
    return { winM };
  }
  // dark lab: wood-panelled wall, glass cabinet of bottles, brass instruments, tall window right (cool rim light)
  function labBack(B) {
    const add = (m, x, y, z) => { m.position.set(x, y, z); B.add(m); return m; };
    const panel = ctex("panel", 1024, 1024, (g, w, h) => { g.fillStyle = "#2a1c13"; g.fillRect(0, 0, w, h); const r = rnd(5); for (let i = 0; i < 8; i++) { const v = 34 + r() * 10; g.fillStyle = `rgb(${v + 8},${v},${v - 8})`; g.fillRect(i * 128 + 4, 0, 120, h); g.fillStyle = "rgba(0,0,0,0.5)"; g.fillRect(i * 128, 0, 4, h); } g.fillStyle = "rgba(0,0,0,0.35)"; g.fillRect(0, h * 0.42, w, 10); });
    const wallM = new THREE.MeshStandardMaterial({ map: rep(panel, 4, 1.5), roughness: 0.6 }); wallM.map.wrapS = wallM.map.wrapT = THREE.RepeatWrapping;
    add(new THREE.Mesh(new THREE.PlaneGeometry(26, 30), wallM), -11, 15, -9);
    add(new THREE.Mesh(new THREE.PlaneGeometry(26, 30), wallM), 21, 15, -9);
    add(new THREE.Mesh(new THREE.PlaneGeometry(10, 4), wallM), 3, 2, -9); add(new THREE.Mesh(new THREE.PlaneGeometry(10, 14), wallM), 3, 23, -9);
    const sky = ctex("labsky", 256, 256, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#dfe6ee"); gr.addColorStop(1, "#b9c3cc"); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
    add(new THREE.Mesh(new THREE.PlaneGeometry(10, 12), new THREE.MeshBasicMaterial({ map: sky, color: new THREE.Color(0.75, 0.78, 0.82) })), 3, 10, -9.4);
    const frameM = new THREE.MeshStandardMaterial({ color: 0x1c130d, roughness: 0.6 });
    for (const x of [-2, 3, 8]) add(new THREE.Mesh(new THREE.BoxGeometry(0.35, 12, 0.3), frameM), x, 10, -9.1);
    for (const y of [4, 10, 16]) add(new THREE.Mesh(new THREE.BoxGeometry(10.3, 0.3, 0.3), frameM), 3, y, -9.1);
    // cabinet with shelves of bottles
    const cab = new THREE.Group(); add(cab, -9, 5.5, -8.4);
    cab.add(new THREE.Mesh(new THREE.BoxGeometry(7, 11, 0.2), new THREE.MeshStandardMaterial({ color: 0x120c08, roughness: 0.7 })));
    const glassy = [0x2e4a3a, 0x5a3a1c, 0x8a8f94, 0x40362c].map((c) => new THREE.MeshPhysicalMaterial({ color: c, roughness: 0.15, clearcoat: 1, metalness: 0.1 }));
    const r = rnd(31);
    for (let s = 0; s < 4; s++) { add(new THREE.Mesh(new THREE.BoxGeometry(6.6, 0.12, 1.4), frameM), -9, 1.5 + s * 2.6, -7.6); for (let i = 0; i < 7; i++) { const h = 0.8 + r() * 1.3, rr = 0.2 + r() * 0.25; add(new THREE.Mesh(new THREE.CylinderGeometry(rr * 0.5, rr, h, 20), glassy[(r() * 4) | 0]), -11.8 + i * 0.85 + r() * 0.2, 1.56 + s * 2.6 + h / 2, -7.6 + (r() - 0.5) * 0.6); } }
    for (const x of [-12.6, -5.4]) add(new THREE.Mesh(new THREE.BoxGeometry(0.3, 11, 1.6), frameM), x, 5.5, -7.6);
    // brass instruments on the bench far back
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.7, 1.1, 32), X3.mats.brassDark), -3.6, 0.55, -7.2);
    return {};
  }
  // warm study: bookshelf, a lamp glowing far left
  function deskBack(B) {
    const add = (m, x, y, z) => { m.position.set(x, y, z); B.add(m); return m; };
    const r = rnd(44), bookM = [0x5a3a2a, 0x2f3d34, 0x6b5a3e, 0x3a2c2a, 0x7a6a52, 0x283040].map((c) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }));
    const shelfM = new THREE.MeshStandardMaterial({ color: 0x3b2618, roughness: 0.6 });
    for (let s = 0; s < 3; s++) { add(new THREE.Mesh(new THREE.BoxGeometry(6, 0.18, 1.6), shelfM), -10, 3.2 + s * 2.6, -2.7); let x = -12.8; while (x < -7.3) { const w = 0.18 + r() * 0.22, h = 1.4 + r() * 0.8; add(new THREE.Mesh(new THREE.BoxGeometry(w, h, 1.2), bookM[(r() * 6) | 0]), x + w / 2, 3.29 + s * 2.6 + h / 2, -2.7); x += w + 0.02; } }
    const lampM = new THREE.MeshBasicMaterial({ color: new THREE.Color(2.2, 1.6, 0.9) });
    add(new THREE.Mesh(new THREE.SphereGeometry(0.35, 20, 12), lampM), -6.5, 2.6, 0.5);
    add(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.9, 0.8, 24, 1, true), new THREE.MeshStandardMaterial({ color: 0x2a3a30, roughness: 0.5, side: THREE.DoubleSide })), -6.5, 2.9, 0.5);
    return {};
  }
  const STY = {
    kitchen: { L: { key: 2.6, keyPos: [7.5, 6.0, -10], keyTgt: [0, 0, 0], angle: 0.3, env: "kitchen", hemi: 0.16, fill: 0.45, fillPos: [-4, 3, 9] },
      tex: () => woodTex("woodK", [128, 84, 52], 11, 2048, 1024), rep: [3, 3], plane: [60, 26, 2], rough: 0.5 },
    lab: { L: { key: 4.2, keyCol: 0xffe3c4, keyPos: [-6, 10, 8], keyTgt: [0, 2.4, -0.5], angle: 0.48, pen: 0.85, cookie: false, env: "lab", hemi: 0.14, sky: 0xcfd8e4, ground: 0x1a120c, fill: 0.35, fillPos: [7, 3, 9], rim: 1.0, rimPos: [7, 9, -8] },
      tex: () => woodTex("woodL", [86, 54, 34], 23, 2048, 1024), rep: [2.5, 2.5], plane: [60, 26, 4], rough: 0.42 },
    desk: { L: { key: 2.4, keyCol: 0xffd9ae, keyPos: [-7, 7.5, 5], keyTgt: [1, 1.5, -1], angle: 0.5, pen: 0.8, cookie: false, env: "desk", hemi: 0.1, fill: 0.25, fillPos: [6, 4, 8], rim: 0.6, rimPos: [6, 5, -6] },
      tex: () => woodTex("woodD", [120, 78, 46], 37, 2048, 1024), rep: [2, 2], plane: [30, 9, 1], rough: 0.45 },
    slate: { L: { key: 2.2, keyCol: 0xfff0dc, keyPos: [-4, 8, 3], keyTgt: [0, 0, 0], angle: 0.42, pen: 0.9, cookie: false, env: "lab", hemi: 0.06, fill: 0.15, rim: 0.9, rimPos: [5, 3, -6] },
      tex: () => pixTex("slate", 1024, 1024, (x, y) => { const k = 0.85 + 0.4 * (fbm(x / 70, y / 22, 51, 5) - 0.5) + 0.12 * (hash(x, y, 9) - 0.5) + 0.16 * (fbm(x / 300, y / 300, 52, 2) - 0.5); return [64 * k, 68 * k, 72 * k]; }), rep: [9, 7], plane: [40, 30, 0], rough: 0.72 },
  };
  function makeSet(style, o) {
    o = o || {};
    const sty = STY[style], S = new THREE.Scene(), B = new THREE.Scene(); B.background = new THREE.Color(0x0b0c10);
    S.add(backdrop()); const fade = fader(); S.add(fade);
    const L = Object.assign({}, sty.L, o.L || {});
    const lS = lightsInto(S, L, true), lB = lightsInto(B, L, false);
    const tt = sty.tex(), pl = sty.plane;
    const mk = () => new THREE.MeshPhysicalMaterial({ map: rep(tt, sty.rep[0], sty.rep[1]), bumpMap: rep(tt, sty.rep[0], sty.rep[1]), bumpScale: 0.6, roughness: sty.rough, clearcoat: 0.15, clearcoatRoughness: 0.4, envMapIntensity: 0.35 });
    const tS = new THREE.Mesh(new THREE.PlaneGeometry(pl[0], pl[1]), dofify(mk())); tS.rotation.x = -Math.PI / 2; tS.position.z = pl[2]; tS.receiveShadow = true; S.add(tS);
    const tB = new THREE.Mesh(tS.geometry, mk()); tB.rotation.x = -Math.PI / 2; tB.position.z = pl[2]; tB.receiveShadow = true; B.add(tB);
    const back = style === "kitchen" ? kitchenBack(B, { win: o.win !== undefined ? o.win : 1.5, tiffin: o.tiffin, kettle: o.kettle, noLadles: o.noLadles, noLota: o.noLota })
      : style === "lab" ? labBack(B) : style === "desk" ? deskBack(B) : {};
    const set = {
      S, B, fade, lS, lB, back, blur: o.blur || 2.2,
      focus(fd, d0, d1) { DOFU.uFD.value = fd; DOFU.uD0.value = d0; DOFU.uD1.value = d1; },
      // call last in the frame function, after the camera is placed
      draw(C, blur) { blurBack(B, C, blur !== undefined ? blur : set.blur); },
      keyI(k) { lS.key.intensity = lB.key.intensity = k; },
      // a static environment mesh in both scenes; the main copy (dofified material) dissolves with focus
      both(mesh, matFn) { mesh.receiveShadow = true; S.add(mesh); const m2 = new THREE.Mesh(mesh.geometry, matFn()); m2.position.copy(mesh.position); m2.rotation.copy(mesh.rotation); m2.scale.copy(mesh.scale); B.add(m2); return mesh; },
    };
    return set;
  }

  // ================================================================= OBJECTS shared by the chai and balance kinds
  const fwd = V(0, 0, 0);
  // set the focus plane on point p (distance along the view axis); d0/d1 = sharp band / fully blurred band (units)
  function focusOn(st, C, p, d0, d1) { C.getWorldDirection(fwd); st.focus(Math.max(0.1, fwd.dot(V(p.x - C.position.x, p.y - C.position.y, p.z - C.position.z))), d0, d1); }

  // thin alpha-blended reflective glass shell (bell jars): rgb = reflections only, alpha rises with Fresnel
  function shellMat(a0, a1) {
    const m = new THREE.MeshPhysicalMaterial({ color: 0x000000, roughness: 0.04, metalness: 0, specularIntensity: 1, envMapIntensity: 3.0, transparent: true, depthWrite: false,
      blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneMinusSrcAlphaFactor });
    m.onBeforeCompile = (sh) => {
      sh.fragmentShader = sh.fragmentShader.replace("#include <opaque_fragment>", "#include <opaque_fragment>\nfloat fk = pow(1.0 - abs(dot(normalize(normal), normalize(vViewPosition))), 3.0);\n" +
        `gl_FragColor.a = mix(${a0.toFixed(3)}, ${a1.toFixed(3)}, fk);\ngl_FragColor.rgb += vec3(0.012, 0.016, 0.013) * fk;`);
    };
    m.customProgramCacheKey = () => "shell" + a0 + a1;
    return m;
  }
  // bell jar (cloche): straight wall + elliptic dome + knob; fits inside the X3 hanger wires at s = 4.5
  const CLR0 = 0.48, CLH1 = 0.55, CLH = 1.35, CLT = 0.01;
  const CLGEO = once(() => {
    const P = [[CLR0 - CLT - 0.004, 0], [CLR0 + 0.004, 0], [CLR0, 0.02]];
    for (let i = 0; i <= 6; i++) P.push([CLR0, 0.03 + (CLH1 - 0.03) * i / 6]);
    for (let i = 1; i <= 26; i++) { const a = i / 26 * 1.445; P.push([CLR0 * Math.cos(a), CLH1 + (CLH - CLH1) * Math.sin(a)]); }
    P.push([0.068, CLH + 0.03], [0.072, CLH + 0.062], [0.056, CLH + 0.09], [0.026, CLH + 0.1], [0, CLH + 0.102], [0, CLH - CLT]);
    for (let i = 25; i >= 0; i--) { const a = i / 26 * Math.PI / 2; P.push([(CLR0 - CLT) * Math.cos(a), CLH1 + (CLH - CLT - CLH1) * Math.sin(a)]); }
    P.push([CLR0 - CLT, 0.02], [CLR0 - CLT - 0.004, 0]);
    const Q = []; for (let i = 0; i <= 8; i++) Q.push([CLR0 - CLT - 0.003, 0.22 + (CLH1 - 0.22) * i / 8]);
    for (let i = 1; i <= 24; i++) { const a = i / 24 * Math.PI / 2; Q.push([(CLR0 - CLT - 0.003) * Math.cos(a), CLH1 + (CLH - CLT - 0.003 - CLH1) * Math.sin(a)]); }
    return { shell: lathe(P, 120), cond: lathe(Q, 72) };
  });
  const condTex = once(() => ctex("cond", 512, 512, (g, w, h) => {
    const gr = g.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.45, "rgba(255,255,255,0.12)"); gr.addColorStop(1, "rgba(255,255,255,0.42)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rnd(23);
    for (let i = 0; i < 2600; i++) { const v = Math.pow(r(), 0.6), y = h * (1 - v), x = r() * w; if (r() > v + 0.15) continue; const s = 0.5 + 2.0 * r() * r(); g.fillStyle = `rgba(255,255,255,${0.12 + 0.22 * r()})`; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); }
  }));
  function cloche() {
    const G = CLGEO(), g = new THREE.Group();
    const shell = new THREE.Mesh(G.shell, shellMat(0.035, 0.6)); shell.renderOrder = 8;
    const cm = new THREE.MeshStandardMaterial({ map: condTex(), transparent: true, opacity: 0, depthWrite: false, roughness: 0.3, side: THREE.DoubleSide, color: 0xf2efe8 });
    const cond = new THREE.Mesh(G.cond, cm); cond.renderOrder = 7;
    g.add(cond, shell);
    g.setCond = (k) => { cm.opacity = clamp(k, 0, 1); cond.visible = k > 0.003; };
    g.setCond(0);
    return g;
  }
  // a chai unit: glass + free steam + (optional) bell jar with its own enclosed steam
  function chaiUnit(o) {
    o = o || {};
    const cg = chaiGlass({ cool: o.cool, seed: o.seed }), g = cg.g;
    const free = steam(Object.assign({ seed: o.seed || 3 }, o.steam || {})); free.position.y = FY; g.add(free);
    let jar = null, inner = null;
    if (o.jar) {
      jar = cloche(); g.add(jar);
      inner = steam({ seed: (o.seed || 3) + 50, n: 4, w: 0.82, h: 0.66, spread: 0.13, speed: 0.28, curl: 1.3, op: 0.8, top: 1 }); inner.position.y = FY; g.add(inner);
    }
    return { g, cg, free, jar, inner };
  }
  // the X3 balance at the size this kind uses (glass + jar fit between the hanger wires), with shadows
  function bigBalance() {
    const b = X3.balance({ s: 4.5 });
    b.group.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return b;
  }
  // classic brass calibration weight (uses the shared X3 brass, not mutated)
  const WGEO = once(() => lathe([[0, 0], [0.29, 0], [0.31, 0.02], [0.31, 0.37], [0.29, 0.4], [0.13, 0.42], [0.11, 0.47], [0.11, 0.51], [0.16, 0.55], [0.165, 0.61], [0.12, 0.66], [0, 0.67]], 64));
  function brassWeight(s) { const m = new THREE.Mesh(WGEO(), X3.mats.brass); m.scale.setScalar(s || 1); m.castShadow = true; m.receiveShadow = true; return m; }

  // kitchen digital scale: black body, brushed steel platform, LCD on the front face
  function kitchenScale(text) {
    const g = new THREE.Group();
    const rr = (w, d, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -d / 2); s.lineTo(w / 2 - r, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); s.lineTo(w / 2, d / 2 - r); s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); s.lineTo(-w / 2 + r, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); s.lineTo(-w / 2, -d / 2 + r); s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2); return s; };
    const ex = (sh, h, bev) => { const e = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 4, curveSegments: 10 }); e.rotateX(-Math.PI / 2); return e; };
    const body = new THREE.Mesh(ex(rr(1.95, 1.7, 0.18), 0.22, 0.03), new THREE.MeshPhysicalMaterial({ color: 0x17181a, roughness: 0.35, clearcoat: 0.6, clearcoatRoughness: 0.25 }));
    body.position.y = 0.03; g.add(body);
    const plate = new THREE.Mesh(ex(rr(1.75, 1.32, 0.14), 0.025, 0.008), steelBrushed()); plate.position.set(0, 0.285, -0.12); g.add(plate);
    const bez = new THREE.Mesh(new THREE.PlaneGeometry(0.86, 0.2), new THREE.MeshPhysicalMaterial({ color: 0x0b0b0c, roughness: 0.15, clearcoat: 1 })); bez.position.set(0, 0.155, 0.881); g.add(bez);
    const lcdM = new THREE.MeshStandardMaterial({ map: X3.lcd(text, 512, 128), roughness: 0.3, emissive: 0x2a3326, emissiveIntensity: 0.25 });
    const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.56, 0.14), lcdM); lcd.position.set(-0.1, 0.155, 0.883); g.add(lcd);
    for (let i = 0; i < 2; i++) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.012, 20), new THREE.MeshStandardMaterial({ color: 0x9a9da3, metalness: 0.6, roughness: 0.4 })); b.rotation.x = Math.PI / 2; b.position.set(0.25 + i * 0.1, 0.155, 0.884); g.add(b); }
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    g.top = 0.31; return g;
  }

  // ---------------------------------------------------------------- gas stove, steel saucepan, simmering chai, blue flames
  const FLAME_FS = `uniform float uT, uSeed, uOp; uniform vec3 uA, uB; varying vec2 vUv;
  ${NOISE}
  void main(){
    float y = vUv.y, x = vUv.x - 0.5;
    float hgt = 0.72 + 0.28 * n3(vec3(uSeed, uT * 7.0, 0.0));
    float yy = y / hgt;
    x += (n3(vec3(uSeed * 2.0, y * 5.0 - uT * 11.0, 1.0)) - 0.5) * 0.16 * yy;
    float w = 0.62 * sqrt(max(yy, 0.0)) * max(1.0 - yy, 0.0) + 0.015;
    float outer = smoothstep(w, w * 0.25, abs(x)) * smoothstep(0.0, 0.05, y);
    float yi = yy * 2.2, wi = 0.5 * sqrt(max(yi, 0.0)) * max(1.0 - yi, 0.0);
    float inner = smoothstep(wi + 0.002, wi * 0.2, abs(x)) * step(yi, 1.0);
    vec3 col = uA * outer * (0.55 + 0.45 * (1.0 - yy)) + uB * inner;
    gl_FragColor = vec4(col * uOp, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
  const FIRE_FS = `uniform float uT, uSeed, uOp; uniform vec3 uA, uB; varying vec2 vUv;
  ${NOISE}
  void main(){
    vec2 p = vec2(vUv.x - 0.5, vUv.y);
    float n = fbm3(vec3(p.x * 4.0, p.y * 3.0 - uT * 3.2, uSeed + uT * 0.4));
    float n2 = fbm3(vec3(p.x * 9.0, p.y * 7.0 - uT * 5.5, uSeed * 2.0));
    float w = 0.27 * (1.0 - p.y) + 0.02;
    float body = (1.0 - smoothstep(0.0, w, abs(p.x + (n - 0.5) * 0.85 * p.y))) * smoothstep(0.5, 0.34, abs(p.x));
    float tongues = smoothstep(0.25, 0.7, fbm3(vec3(p.x * 7.0, p.y * 2.4 - uT * 4.2, uSeed * 3.0)) + 0.5 * (1.0 - p.y));
    float heat = body * tongues * smoothstep(1.0, 0.05, p.y + (n2 - 0.5) * 0.6) * smoothstep(0.0, 0.08, p.y);
    float f = clamp(heat * 1.7 - 0.28, 0.0, 1.0);
    vec3 col = mix(vec3(0.55, 0.11, 0.02), uA, smoothstep(0.0, 0.55, f));
    col = mix(col, uB, smoothstep(0.6, 1.0, f));
    gl_FragColor = vec4(col * f * 0.85 * uOp, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }`;
  function flameSet(n, rad, w, h, seed, cols, fs) {
    const pts = Array.isArray(n) ? n : null; if (pts) n = pts.length;
    const g = new THREE.Group(), geo = new THREE.PlaneGeometry(w, h); geo.translate(0, h / 2, 0); const list = [];
    for (let i = 0; i < n; i++) {
      const m = new THREE.ShaderMaterial({ uniforms: { uT: { value: 0 }, uSeed: { value: seed + i * 1.37 }, uOp: { value: 0 }, uA: { value: new THREE.Vector3().fromArray(cols[0]) }, uB: { value: new THREE.Vector3().fromArray(cols[1]) } },
        vertexShader: VSUV, fragmentShader: fs || FLAME_FS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
      const f = new THREE.Mesh(geo, m), a = i / n * TAU; if (pts) f.position.copy(pts[i]); else f.position.set(Math.cos(a) * rad, 0, Math.sin(a) * rad); f.userData.d = pts ? V(0, 0, 0) : V(Math.cos(a), 0, Math.sin(a)); f.renderOrder = 6; list.push(f); g.add(f);
    }
    const wp = V(0, 0, 0);
    g.set = (ft, C, k) => { g.visible = k > 0.002; if (!g.visible) return; g.updateWorldMatrix(true, false); g.getWorldPosition(wp); const rv = V(1, 0, 0).applyQuaternion(C.quaternion); for (const f of list) { f.rotation.set(0, Math.atan2(C.position.x - wp.x - f.position.x, C.position.z - wp.z - f.position.z), -0.75 * f.userData.d.dot(rv)); f.material.uniforms.uT.value = ft; f.material.uniforms.uOp.value = k; } };
    return g;
  }
  function stoveUnit() {
    const g = new THREE.Group(), TOP = 0.75;
    const enamel = new THREE.MeshPhysicalMaterial({ color: 0x161616, roughness: 0.4, clearcoat: 0.45, clearcoatRoughness: 0.3, envMapIntensity: 0.45 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(6.4, TOP, 4.0), enamel); body.position.set(1.6, TOP / 2, 0.3); g.add(body);
    const iron = new THREE.MeshStandardMaterial({ color: 0x1d1d1f, metalness: 0.7, roughness: 0.62 });
    const alu = new THREE.MeshStandardMaterial({ color: 0x8d8f93, metalness: 0.9, roughness: 0.45 });
    const brassCap = new THREE.MeshStandardMaterial({ color: 0x6d5a3a, metalness: 0.9, roughness: 0.5 });
    for (const bx of [0, 3.3]) {
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.02, 48), new THREE.MeshStandardMaterial({ color: 0x2a2a2c, metalness: 0.8, roughness: 0.4 })); bowl.position.set(bx, TOP + 0.01, 0); g.add(bowl);
      const head = new THREE.Mesh(lathe([[0, 0], [0.4, 0], [0.42, 0.04], [0.4, 0.1], [0.36, 0.12], [0, 0.12]], 48), alu); head.position.set(bx, TOP + 0.02, 0); g.add(head);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.32, 0.03, 40), brassCap); cap.position.set(bx, TOP + 0.155, 0); g.add(cap);
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.95, 0.035, 8, 48), iron); ring.rotation.x = Math.PI / 2; ring.position.set(bx, TOP + 0.12, 0); g.add(ring);
      for (let k = 0; k < 4; k++) { const a = k * Math.PI / 2 + Math.PI / 4, f = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.08, 0.06), iron); f.position.set(bx + Math.cos(a) * 0.72, TOP + 0.2, Math.sin(a) * 0.72); f.rotation.y = -a; g.add(f); const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.18, 0.06), iron); leg.position.set(bx + Math.cos(a) * 0.96, TOP + 0.09, Math.sin(a) * 0.96); g.add(leg); }
    }
    for (const kx of [0, 3.3]) { const kn = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.22, 32), new THREE.MeshStandardMaterial({ color: 0x222224, metalness: 0.3, roughness: 0.4 })); kn.rotation.x = Math.PI / 2; kn.position.set(kx, TOP * 0.5, 2.38); g.add(kn); }
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    g.panY = TOP + 0.24; g.flameY = TOP + 0.13;
    return g;
  }
  const PAN_R = 0.72, PAN_H = 0.62, TEA_Y = 0.4;
  function saucepan() {
    const g = new THREE.Group(), T = 0.02, P = [[0, 0], [PAN_R - 0.06, 0], [PAN_R - 0.01, 0.03], [PAN_R, 0.08]];
    for (let i = 1; i <= 8; i++) P.push([PAN_R + 0.02 * i / 8, 0.08 + (PAN_H - 0.1) * i / 8]);
    arc(PAN_R + 0.02 - 0.015, PAN_H - 0.02, 0.015, 0, Math.PI, 8).slice(1).forEach((p) => P.push(p));
    for (let i = 1; i <= 8; i++) P.push([PAN_R + 0.02 - 0.03 - 0.02 * i / 8, PAN_H - 0.02 - (PAN_H - 0.1) * i / 8]);
    P.push([PAN_R - 0.04, T + 0.02], [PAN_R - 0.08, T], [0, T]);
    const body = new THREE.Mesh(lathe(P, 96), new THREE.MeshStandardMaterial({ color: 0xc2c5ca, metalness: 1, roughness: 0.24 })); g.add(body);
    const hm = new THREE.MeshStandardMaterial({ color: 0xb8bbc1, metalness: 1, roughness: 0.3 });
    const handle = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.035, 0.16), hm); handle.position.set(PAN_R + 0.85, PAN_H - 0.02 + 0.2, 0); handle.rotation.z = 0.24; g.add(handle);
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.035, 24), hm); tip.position.set(PAN_R + 1.68, PAN_H + 0.39, 0); tip.rotation.z = 0.24; g.add(tip);
    // simmering chai surface: a dense disc displaced every frame
    const rS = PAN_R - 0.005, Q = []; for (let i = 0; i <= 26; i++) Q.push([rS * (1 - i / 26), TEA_Y]);
    const sg = lathe(Q, 120, 0, 0, rS), base = sg.attributes.position.array.slice();
    const surfTex = ctex("simmer", 1024, 1024, (c, w, h) => {
      c.fillStyle = "#9e6a3c"; c.fillRect(0, 0, w, h); const r = rnd(8);
      for (let i = 0; i < 60; i++) { c.fillStyle = `rgba(220,186,140,${0.05 + 0.12 * r()})`; c.beginPath(); c.ellipse(r() * w, r() * h, 30 + 120 * r(), 12 + 40 * r(), r() * 3, 0, TAU); c.fill(); }
      for (let i = 0; i < 1500; i++) { const a = r() * TAU, rr = w / 2 * (0.75 + 0.25 * Math.sqrt(r())); c.fillStyle = `rgba(236,210,170,${0.2 + 0.4 * r()})`; c.beginPath(); c.arc(w / 2 + Math.cos(a) * rr, h / 2 + Math.sin(a) * rr, 1.5 + 5 * r() * r(), 0, TAU); c.fill(); }
    });
    surfTex.center.set(0.5, 0.5);
    const surf = new THREE.Mesh(sg, new THREE.MeshPhysicalMaterial({ map: surfTex, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.15, envMapIntensity: 0.6 })); g.add(surf);
    const NB = 40, bub = new THREE.InstancedMesh(GEO().sph, bubMat(), NB), mm = new THREE.Matrix4(); g.add(bub);
    const pos = sg.attributes.position;
    g.simmer = (ft, k) => {
      for (let i = 0; i < pos.count; i++) {
        const x = base[i * 3], z = base[i * 3 + 2], rn = Math.hypot(x, z) / rS;
        const y = 0.006 * Math.sin(x * 9 + ft * 2.1) * Math.sin(z * 8 - ft * 1.7) + 0.004 * Math.sin((x + z) * 15 + ft * 3.3) + 0.012 * smooth((rn - 0.75) / 0.25) * (0.6 + 0.4 * Math.sin(ft * 1.3 + x * 4));
        pos.setY(i, TEA_Y + y * k);
      }
      pos.needsUpdate = true; sg.computeVertexNormals();
      surfTex.rotation = ft * 0.06;
      for (let i = 0; i < NB; i++) {
        const P2 = 0.6 + 0.9 * hash(i, 1, 7), ph = hash(i, 2, 7) * P2, cyc = Math.floor((ft + ph) / P2), u = (ft + ph) / P2 - cyc;
        const a = hash(i, cyc, 11) * TAU, rr = rS * (0.35 + 0.6 * Math.sqrt(hash(i, cyc, 13))), s = (0.008 + 0.022 * hash(i, cyc, 17)) * smooth(u / 0.7) * (u < 0.86 ? 1 : 0) * k;
        mm.makeScale(s + 1e-5, s * 0.75 + 1e-5, s + 1e-5).setPosition(Math.cos(a) * rr, TEA_Y + 0.004, Math.sin(a) * rr); bub.setMatrixAt(i, mm);
      }
      bub.instanceMatrix.needsUpdate = true;
    };
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  }

  // ================================================================= LABK.chai
  // the same glass in every mode; kitchen counter by a window (light from back-right through a 4-pane window), blurred tiffin/kettle/ladles behind
  LABK.chai = (o) => {
    const mode = o.mode, T0 = o.T0, C = cam(30);
    const late = mode === "cool" || mode === "end";
    const st = makeSet("kitchen", mode === "title" ? { win: 0.1, noLadles: true, kettle: [-14, -9], L: { key: 1.8, keyCol: 0xffc890, env: "dim", hemi: 0.09, fill: 0.4 } } : mode === "scale" ? { kettle: [-9.5, -9], L: { key: 3.2, fill: 0.6, hemi: 0.2 } } : mode === "divide" ? { noLota: true }
      : late ? { win: 1.8, L: { key: 2.8, keyCol: 0xffe6c8, keyPos: [5.5, 7.5, -9], keyTgt: [0.6, 0, -1.5], angle: 0.2, env: "late", hemi: mode === "cool" ? 0.09 : 0.05, fill: mode === "cool" ? 0.4 : 0.24, fillPos: [-3, 2.5, 9] } } : {});
    const S = st.S, kS = st.lS.key, kB = st.lB.key;
    const setKey = (pos, ang, I) => { for (const k of [kS, kB]) { if (pos) k.position.fromArray(pos); if (ang) k.angle = ang; if (I !== undefined) k.intensity = I; } };
    const P = (txt, p, a) => [txt, p.x, p.y, p.z, a];
    const wpos = (obj, dy) => { obj.updateWorldMatrix(true, false); const v = V(0, dy || 0, 0); return obj.localToWorld(v); };

    // ---------------- single glass on the table (hot / seal A / title / cool / end)
    const unit = chaiUnit({ cool: late, jar: mode === "seal", seed: 3, steam: mode === "title" ? { op: 0.6, h: 1.9, col: 0xa89a88 } : {} });
    S.add(unit.g);

    if (mode === "hot") return (t) => {
      const ft = T0 + t;
      camKeys(C, [[4.44, 0.02, 0.68, 0, 3.7, -18, 8], [8.4, 0, 0.66, 0, 3.05, -6, 6]], ft);
      unit.free.set(ft, C, 1);
      focusOn(st, C, V(0, 0.5, 0), 0.5, 2.4); st.draw(C);
      return [S, C, []];
    };

    if (mode === "title") return (t) => {
      const ft = T0 + t, p = smooth((ft - 25.18) / 3.9), q = seg(ft, 28.0, 32.32);
      C.position.set(lerp(0.3, 0.05, p), lerp(0.92, 2.15, p) + 0.12 * q, lerp(2.5, 1.35, p));
      C.near = 0.02; C.far = 300; C.clearViewOffset(); C.updateProjectionMatrix();
      C.lookAt(0, lerp(0.72, 2.3, p) + 0.15 * q, lerp(0, -3.0, p));
      unit.free.set(ft, C, 1 - 0.45 * seg(ft, 28.0, 29.6));
      focusOn(st, C, V(0, 0.9 + 1.2 * p, 0), 0.5, 2.5); st.draw(C, 2.6);
      return [S, C, []];
    };

    const shim = late ? steam({ seed: 91, n: 3, w: 2.6, h: 2.4, spread: 0.32, speed: 0.22, curl: 1.6, col: 0xffd9a8, op: 1, drift: 0.3 }) : null;
    if (shim) S.add(shim);
    if (late) return (t) => {
      const ft = T0 + t;
      if (mode === "cool") {
        camKeys(C, [[623.46, 0.0, 0.62, 0, 4.2, -14, 8.5], [636.52, 0.0, 0.6, 0, 3.45, -6, 7]], ft);
        unit.free.set(ft, C, 0.4 * (1 - seg(ft, 623.6, EV.coolSteamGone)));
        shim.set(ft, C, 0.16 * win(ft, 629.4, 636.4, 1.8)); shim.position.set(0.15 + (ft - 629.4) * 0.07, FY + 0.05 + (ft - 629.4) * 0.03, -0.1);
      } else {
        camKeys(C, [[640.76, 0.0, 0.6, 0, 3.9, 8, 7.5, -250, 70], [645.4, 0.0, 0.6, 0, 3.6, 13, 7, -250, 70]], ft);
        unit.free.set(ft, C, 0); shim.set(ft, C, 0);
        const a = seg(ft, 640.76, 645.4);
        setKey([lerp(5.5, 4.4, a), lerp(7.5, 6.6, a), lerp(-9, -9.8, a)], null, lerp(2.8, 2.0, a));
        st.fade.set(seg(ft, EV.endFade, 645.4));
      }
      focusOn(st, C, V(0, 0.45, 0), 0.5, 2.4); st.draw(C);
      return [S, C, []];
    };

    if (mode === "seal") {
      // B: the balance with a sealed HOT cup (left) and a sealed COLD cup (right)
      const b = bigBalance(); S.add(b.group);
      const hot = chaiUnit({ jar: true, seed: 7 }), cold = chaiUnit({ jar: true, cool: true, seed: 9 });
      b.panL.add(hot.g); b.panR.add(cold.g); cold.jar.setCond(0.05); hot.jar.setCond(1);
      return (t) => {
        const ft = T0 + t, A = ft < EV.sealCut;
        unit.g.visible = A; b.group.visible = !A;
        let pins = [];
        if (A) {
          const lw = seg(ft, EV.sealLower, EV.sealDown);
          unit.jar.position.y = lerp(2.7, 0, lw) + 0.004 * Math.sin(Math.min(1, Math.max(0, (ft - EV.sealDown) / 0.25)) * Math.PI) * 0;
          unit.free.set(ft, C, 1 - seg(ft, 11.3, 12.3));
          unit.inner.set(ft, C, seg(ft, 11.7, 12.9));
          unit.jar.setCond(0.85 * seg(ft, 12.3, 15.3));
          setKey(null, 0.3);
          camKeys(C, [[8.4, 0, 0.66, 0, 3.05, -6, 6, 0], [10.66, 0, 0.76, 0, 3.7, -4, 7, -390], [EV.sealCut, 0, 0.8, 0, 4.6, 4, 9, -360]], ft);
          focusOn(st, C, V(0, 0.5, 0), 0.5, 2.4); st.draw(C);
        } else {
          b.set(0);
          hot.free.set(ft, C, 0); hot.inner.set(ft, C, 1); cold.free.set(ft, C, 0); cold.inner.set(ft, C, 0);
          setKey(null, 0.42);
          camKeys(C, [[EV.sealCut, 0, 3.7, 0, 11.0, -8, 7], [19.0, 0, 3.65, 0, 10.0, -2, 8]], ft);
          focusOn(st, C, V(0, 3.5, 0), 2.5, 8); st.draw(C, 1.6);
          const pa = win(ft, 15.9, 18.85, 0.45);
          pins = [P("hot", wpos(hot.g, 1.5), pa), P("cold", wpos(cold.g, 1.5), pa)];
        }
        return [S, C, pins];
      };
    }

    if (mode === "scale") {
      unit.g.visible = false;
      const sc = kitchenScale("250 g"); S.add(sc);
      const u2 = chaiUnit({ jar: true, seed: 11 }); u2.g.position.y = sc.top; sc.add(u2.g); u2.jar.setCond(0.8);
      return (t) => {
        const ft = T0 + t;
        u2.free.set(ft, C, 0); u2.inner.set(ft, C, 1);
        camKeys(C, [[19.0, 0, 0.9, 0, 5.6, 30, 9, -450, 20], [25.18, 0, 0.88, 0, 5.2, 16, 8, -440, 20]], ft);
        focusOn(st, C, V(0, 0.6, 0), 0.6, 2.6); st.draw(C);
        return [S, C, []];
      };
    }

    if (mode === "heavier" || mode === "heavier2") {
      unit.g.visible = false;
      const b = bigBalance(); S.add(b.group);
      const u2 = chaiUnit({ seed: 13 }); b.panL.add(u2.g);
      const w1 = brassWeight(1); b.panR.add(w1);
      const glow = L3.glowSprite(0xffa45c, 1.5, 0); b.panL.add(glow); glow.position.set(0, 0.12, -0.35);
      const pl = new THREE.PointLight(0xffa050, 0, 2.5, 2); pl.position.set(0, 0.25, -0.45); b.panL.add(pl);
      const a0 = mode === "heavier" ? 52.12 : 251.56, a1 = mode === "heavier" ? 54.78 : 254.5;
      return (t) => {
        const ft = T0 + t, heat = seg(ft, a0 + 0.05, a0 + 1.0), dip = seg(ft, a0 + 0.7, a1 - 0.15);
        b.set(0.022 * dip);
        glow.material.opacity = 0.42 * heat; pl.intensity = 3.0 * heat;
        u2.free.set(ft, C, 0.3 + 0.7 * seg(ft, a0 + 0.2, a0 + 1.6));
        setKey(null, 0.42);
        if (mode === "heavier") camKeys(C, [[a0, -2.2, 3.85, 0, 6.8, -24, 8], [a1, -2.0, 3.8, 0, 5.8, -15, 7]], ft);
        else camKeys(C, [[a0, -1.7, 3.6, 0, 7.6, 22, 4], [a1, -1.9, 3.55, 0, 6.6, 15, 7]], ft);
        focusOn(st, C, wpos(u2.g, 0.4), 1.2, 6); st.draw(C, 1.8);
        const pins = [P("tilt magnified", wpos(b.panL, 1.25), win(ft, a0 + 1.1, a1 + 1, 0.4))];
        return [S, C, pins];
      };
    }

    if (mode === "divide") {
      unit.g.visible = false;
      // A: stove, saucepan of simmering chai on a blue gas flame
      const stv = stoveUnit(); S.add(stv);
      const pan = saucepan(); pan.position.y = stv.panY; stv.add(pan);
      const fl = flameSet(44, 0.39, 0.11, 0.17, 5, [[0.06, 0.13, 0.5], [0.22, 0.36, 0.8]]); fl.position.y = stv.flameY; stv.add(fl);
      const blue = new THREE.PointLight(0x6a86ff, 0, 1.4, 2); blue.position.y = stv.flameY + 0.06; stv.add(blue);
      const ps = steam({ seed: 21, n: 6, w: 2.0, h: 2.0, spread: 0.28, speed: 0.5, curl: 1.0, op: 0.45 }); ps.position.y = stv.panY + TEA_Y; stv.add(ps);
      // B: the glass on the balance pan; the magnified needle barely twitches
      const b = bigBalance(); S.add(b.group);
      const u2 = chaiUnit({ seed: 15 }); b.panL.add(u2.g); const w1 = brassWeight(1); b.panR.add(w1);
      return (t) => {
        const ft = T0 + t, A = ft < EV.divideCut;
        stv.visible = A; b.group.visible = !A;
        if (A) {
          pan.simmer(ft, 1); fl.set(ft, C, 1); blue.intensity = 0.0; ps.set(ft, C, 1);
          setKey(null, 0.34);
          camKeys(C, [[195.78, 0, stv.panY + 0.4, 0, 4.4, -14, 30], [199.4, 0, stv.panY + 0.32, 0, 3.9, -6, 20], [204.5, 0, stv.panY - 0.05, 0, 3.2, 6, 4]], ft);
          focusOn(st, C, V(0, stv.panY + 0.2, 0), 0.6, 3); st.draw(C);
        } else {
          const tw = Math.exp(-Math.pow((ft - EV.divideTwitch) / 0.35, 2)) - 0.45 * Math.exp(-Math.pow((ft - EV.divideTwitch - 0.7) / 0.4, 2));
          b.set(0.006 * tw);
          u2.free.set(ft, C, 0.8);
          setKey(null, 0.42);
          camKeys(C, [[204.5, -1.0, 2.35, 0, 7.4, -18, 6, -250, 0], [214.68, -1.0, 2.35, 0, 6.6, -12, 6, -250, 0]], ft);
          focusOn(st, C, V(-0.5, 2.6, 0), 1.5, 6); st.draw(C, 1.8);
        }
        const pins = A ? [] : [P("magnified needle", b.dial.localToWorld(V(-0.5, 0.05, 0)), win(ft, 205.3, 209.6, 0.4))];
        return [S, C, pins];
      };
    }
    return (t) => { st.draw(C); return [S, C, []]; };
  };

  // ================================================================= LABK.props — real-material still life
  function rrect(w, d, r) { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -d / 2); s.lineTo(w / 2 - r, -d / 2); s.quadraticCurveTo(w / 2, -d / 2, w / 2, -d / 2 + r); s.lineTo(w / 2, d / 2 - r); s.quadraticCurveTo(w / 2, d / 2, w / 2 - r, d / 2); s.lineTo(-w / 2 + r, d / 2); s.quadraticCurveTo(-w / 2, d / 2, -w / 2, d / 2 - r); s.lineTo(-w / 2, -d / 2 + r); s.quadraticCurveTo(-w / 2, -d / 2, -w / 2 + r, -d / 2); return s; }
  function slab(w, d, h, r, bev) { const e = new THREE.ExtrudeGeometry(rrect(w, d, r), { depth: h, bevelEnabled: true, bevelThickness: bev, bevelSize: bev, bevelSegments: 8, curveSegments: 16 }); e.rotateX(-Math.PI / 2); e.translate(0, bev, 0); return e; }
  const decal = (tex, w, d, rough) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), new THREE.MeshStandardMaterial({ map: tex, transparent: true, roughness: rough || 0.6, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); m.rotation.x = -Math.PI / 2; m.receiveShadow = true; return m; };
  function mug() {
    const g = new THREE.Group(), glaze = new THREE.MeshPhysicalMaterial({ color: 0xf1ede4, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.8 });
    const print = ctex("mugprint", 1024, 320, (c, w, h) => {
      c.fillStyle = "#f1ede4"; c.fillRect(0, 0, w, h); c.fillStyle = "#1e1d1b"; c.textAlign = "center"; c.textBaseline = "middle";
      c.font = "italic 600 104px Georgia, 'Times New Roman', serif"; c.fillText("E = mc²", w / 2, h * 0.52);
    });
    const outer = []; for (let i = 0; i <= 12; i++) outer.push([0.42, 0.08 + 0.82 * i / 12]);
    const ow = new THREE.Mesh(lathe(outer, 96), new THREE.MeshPhysicalMaterial({ map: print, roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 0.8 })); ow.rotation.y = Math.PI; g.add(ow);
    const rest = [[0.42, 0.9]]; arc(0.4, 0.9, 0.02, 0, Math.PI, 8).slice(1).forEach((p) => rest.push(p)); rest.push([0.38, 0.12], [0.3, 0.09], [0, 0.09]);
    g.add(new THREE.Mesh(lathe(rest, 96), glaze));
    g.add(new THREE.Mesh(lathe([[0, 0.004], [0.34, 0], [0.4, 0.025], [0.42, 0.08]], 96), new THREE.MeshStandardMaterial({ color: 0xb9ab97, roughness: 0.8 })));
    const cof = new THREE.Mesh(new THREE.CircleGeometry(0.381, 64), new THREE.MeshPhysicalMaterial({ color: 0x2a160b, roughness: 0.1, clearcoat: 1 })); cof.rotation.x = -Math.PI / 2; cof.position.y = 0.76; g.add(cof);
    const h = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.055, 14, 40, Math.PI), glaze); h.rotation.z = -Math.PI / 2; h.scale.set(0.9, 1.15, 1); h.position.set(0.41, 0.5, 0); g.add(h);
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  }
  function tshirt() {
    const g = new THREE.Group(), W2 = 2.7, D2 = 3.0;
    const knit = pixTex("knit", 256, 256, (x, y) => { const k = 0.92 + 0.1 * (hash(x, y, 3) - 0.5) + 0.04 * Math.sin(x * 1.9) + 0.05 * (fbm(x / 30, y / 30, 5, 3) - 0.5); return [116 * k, 118 * k, 122 * k]; });
    const cm = new THREE.MeshPhysicalMaterial({ map: rep(knit, 6, 6), roughness: 0.95, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(0x8d9198) });
    const L = [[0, 0, 0], [0.12, 0.025, -0.025], [0.24, -0.012, 0.012]];
    L.forEach(([y, dx, rz], i) => { const s = new THREE.Mesh(slab(W2 - i * 0.03, D2 - i * 0.02, 0.07, 0.28, 0.05), cm); s.position.set(dx, y, 0); s.rotation.y = rz; g.add(s); });
    const tex = ctex("teetop", 900, 1000, (c, w, h) => {
      c.fillStyle = "#76797e"; c.fillRect(0, 0, w, h); const r = rnd(4);
      for (let i = 0; i < 16000; i++) { const v = 98 + r() * 52; c.fillStyle = `rgba(${v},${v + 2},${v + 6},0.22)`; c.fillRect(r() * w, r() * h, 1 + r() * 2, 2 + r() * 4); }
      const gr = c.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.32, w / 2, h / 2, Math.max(w, h) * 0.66); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(0,0,0,0.3)"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.fillStyle = "#4b4d52"; c.beginPath(); c.ellipse(w / 2, 0, 150, 118, 0, 0, Math.PI); c.fill();
      c.strokeStyle = "#8b8e94"; c.lineWidth = 34; c.beginPath(); c.ellipse(w / 2, 0, 168, 136, 0, 0, Math.PI); c.stroke();
      c.strokeStyle = "rgba(60,62,66,0.45)"; c.lineWidth = 2; for (let a = 0.05; a < Math.PI; a += 0.035) { c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * 152, Math.sin(a) * 120); c.lineTo(w / 2 + Math.cos(a) * 185, Math.sin(a) * 153); c.stroke(); }
      c.strokeStyle = "rgba(48,50,54,0.45)"; c.lineWidth = 3; c.beginPath(); c.moveTo(w / 2 - 186, 26); c.lineTo(36, 64); c.moveTo(w / 2 + 186, 26); c.lineTo(w - 36, 64); c.stroke();
      c.strokeStyle = "rgba(40,42,46,0.16)"; c.lineWidth = 22; c.beginPath(); c.moveTo(120, 300); c.quadraticCurveTo(205, 600, 140, 950); c.moveTo(w - 120, 280); c.quadraticCurveTo(w - 215, 620, w - 150, 960); c.stroke();
      c.fillStyle = "rgba(238,237,231,0.95)"; c.textAlign = "center"; c.textBaseline = "middle"; c.font = "800 178px 'Arial Black', 'Segoe UI', Arial, sans-serif"; c.fillText("E=mc²", w / 2, h * 0.52);
      for (let i = 0; i < 2200; i++) { c.fillStyle = `rgba(118,121,126,${0.3 + 0.5 * r()})`; c.fillRect(w * 0.15 + r() * w * 0.7, h * 0.42 + r() * h * 0.2, 1 + 2 * r(), 1 + 1.5 * r()); }
    });
    const top = new THREE.Mesh(new THREE.PlaneGeometry(W2 - 0.12, D2 - 0.1), new THREE.MeshPhysicalMaterial({ map: tex, roughness: 0.95, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(0x8d9198) }));
    top.rotation.set(-Math.PI / 2, 0, L[2][2]); top.position.set(L[2][1], 0.413, 0); g.add(top);
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return g;
  }
  const chalkTex = once(() => ctex("chalk", 1024, 744, (c, w, h) => {
    c.fillStyle = "#1f2622"; c.fillRect(0, 0, w, h); const r = rnd(17);
    for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(200,205,195,${0.012 + 0.025 * r()})`; c.beginPath(); c.ellipse(r() * w, r() * h, 60 + 200 * r(), 20 + 70 * r(), r() * 3, 0, TAU); c.fill(); }
    c.fillStyle = "rgba(236,234,224,0.92)"; c.textAlign = "center"; c.textBaseline = "middle";
    c.font = "700 200px 'Segoe Print', 'Ink Free', 'Bradley Hand', Georgia, serif"; c.save(); c.translate(w / 2, h * 0.52); c.rotate(-0.04); c.fillText("E = mc²", 0, 0); c.restore();
    c.globalCompositeOperation = "destination-out"; for (let i = 0; i < 9000; i++) { c.fillStyle = `rgba(0,0,0,${0.3 + 0.6 * r()})`; c.fillRect(r() * w, r() * h, 1 + 1.6 * r(), 1 + 1.6 * r()); }
    c.globalCompositeOperation = "source-over"; c.fillStyle = "#1f2622"; c.globalAlpha = 1; c.globalCompositeOperation = "destination-over"; c.fillRect(0, 0, w, h);
  }));
  LABK.props = (o) => {
    const mode = o.mode, T0 = o.T0, C = cam(30);
    if (mode === "tile") {
      const st = makeSet("slate", { blur: 2.4 }), S = st.S;
      const tile = new THREE.Group(); S.add(tile);
      const enamel = new THREE.MeshPhysicalMaterial({ color: 0xe9e1cf, roughness: 0.32, clearcoat: 1, clearcoatRoughness: 0.1, envMapIntensity: 0.7 });
      const body = new THREE.Mesh(slab(1.7, 1.7, 0.22, 0.14, 0.06), enamel); body.castShadow = true; body.receiveShadow = true; tile.add(body);
      const tex = ctex("mt", 1024, 1024, (c, w, h) => {
        c.clearRect(0, 0, w, h); c.fillStyle = "#26231f"; c.textBaseline = "alphabetic";
        c.font = "600 104px 'Segoe UI', Arial, sans-serif"; c.textAlign = "left"; c.fillText("109", 92, 190);
        c.textAlign = "center"; c.font = "700 400px 'Segoe UI', Arial, sans-serif"; c.fillText("Mt", w / 2, 640);
        c.font = "500 96px 'Segoe UI', Arial, sans-serif"; c.fillText("Meitnerium", w / 2, 800); c.font = "400 74px 'Segoe UI', Arial, sans-serif"; c.fillText("[278]", w / 2, 910);
        c.strokeStyle = "rgba(38,35,31,0.5)"; c.lineWidth = 6; c.strokeRect(46, 46, w - 92, h - 92);
      });
      const d = decal(tex, 1.66, 1.66, 0.4); d.position.y = 0.341; tile.add(d);
      tile.rotation.y = -0.12;
      return (t) => {
        const ft = T0 + t;
        camKeys(C, [[506.6, 0, 0.25, 0.05, 5.4, -16, 52], [511.56, 0, 0.27, 0.05, 4.3, -7, 44]], ft);
        focusOn(st, C, V(0, 0.3, 0), 0.6, 3); st.draw(C);
        return [S, C, []];
      };
    }
    // mug: dolly across a desk — mug (32.3), folded t-shirt (35.2), then up to a framed chalkboard poster on the wall (37.5)
    const st = makeSet("desk", { blur: 2.4 }), S = st.S;
    const plaster = pixTex("plasterD", 512, 512, (x, y) => { const k = 0.9 + 0.1 * (fbm(x / 50, y / 50, 8, 4) - 0.5) + 0.04 * (hash(x, y, 2) - 0.5); return [112 * k, 92 * k, 72 * k]; });
    const wallMat = () => new THREE.MeshStandardMaterial({ map: rep(plaster, 6, 4), roughness: 0.9 });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(36, 24), dofify(wallMat())); wall.position.set(0, 12, -3.5); st.both(wall, wallMat);
    const m = mug(); m.position.set(-3.3, 0, 0.7); m.rotation.y = -0.15; S.add(m);
    const ts = tshirt(); ts.position.set(0.6, 0, 0.6); ts.rotation.y = 0.1; S.add(ts);
    // framed chalkboard poster
    const pg = new THREE.Group(); pg.position.set(3.6, 3.75, -3.46); S.add(pg);
    const frameM = dofify(new THREE.MeshStandardMaterial({ color: 0x2a1a10, roughness: 0.45 }));
    const bw = 4.4, bh = 3.2, fw = 0.2;
    for (const [w, h, x, y] of [[bw + 2 * fw, fw, 0, bh / 2 + fw / 2], [bw + 2 * fw, fw, 0, -bh / 2 - fw / 2], [fw, bh, -bw / 2 - fw / 2, 0], [fw, bh, bw / 2 + fw / 2, 0]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.16), frameM); b.position.set(x, y, 0.08); b.castShadow = true; pg.add(b); }
    const board = new THREE.Mesh(new THREE.PlaneGeometry(bw, bh), dofify(new THREE.MeshStandardMaterial({ map: chalkTex(), roughness: 0.85 }))); board.position.z = 0.03; board.receiveShadow = true; pg.add(board);
    return (t) => {
      const ft = T0 + t;
      camKeys(C, [[32.32, -3.35, 0.5, 0.7, 3.5, -20, 12], [35.0, -1.4, 0.4, 0.6, 4.2, -10, 24], [36.3, 0.7, 0.35, 0.5, 4.6, -2, 34], [37.9, 3.2, 3.4, -2.9, 8.8, 3, 7], [43.16, 3.55, 3.75, -3.4, 8.0, 9, 3]], ft);
      const fp = V(-3.3, 0.5, 0.7).lerp(V(0.6, 0.35, 0.6), seg(ft, 34.9, 35.6)).lerp(V(3.6, 3.75, -3.4), seg(ft, 37.0, 37.8));
      focusOn(st, C, fp, 0.5, 3.0); st.draw(C);
      return [S, C, []];
    };
  };

  // ================================================================= LABK.balance — the brass balance on a dark lab bench
  const dotTex = once(() => ctex("dot", 64, 64, (c) => { const g = c.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(0.5, "rgba(255,255,255,0.5)"); g.addColorStop(1, "rgba(255,255,255,0)"); c.fillStyle = g; c.fillRect(0, 0, 64, 64); }));
  // warm energy motes flowing into (dir = +1) or out of (dir = -1) a point; pure in ft
  function motes(n, seed) {
    const T = 5, N = n * T, geo = new THREE.BufferGeometry(), pos = new Float32Array(N * 3), col = new Float32Array(N * 4);
    geo.setAttribute("position", new THREE.BufferAttribute(pos, 3)); geo.setAttribute("color", new THREE.BufferAttribute(col, 4));
    const p = new THREE.Points(geo, new THREE.PointsMaterial({ map: dotTex(), size: 0.42, sizeAttenuation: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, vertexColors: true }));
    p.renderOrder = 9;
    const r = rnd(seed), P0 = []; for (let i = 0; i < n; i++) { const u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u), R = 1.3 + r() * 1.1; P0.push([s * Math.cos(th) * R, Math.abs(u) * R * 0.8 + 0.1, s * Math.sin(th) * R, r(), 0.5 + r()]); }
    // set(ft, a, b, dir, k): motes launched between a and b (dir +1 = into the origin, -1 = out and up), each travels ~1.2 s and draws a short light trail
    p.set = (ft, a, b, dir, k) => {
      let any = false;
      for (let i = 0; i < n; i++) {
        const q = P0[i], t0 = a + q[3] * (b - a - 1.2);
        for (let j = 0; j < T; j++) {
          const u = (ft - t0) / (1.1 * q[4]) - j * 0.013, idx = i * T + j;
          let x = 0, y = 0, z = 0, al = 0;
          if (u > 0 && u < 1 && k > 0) { const e = dir > 0 ? 1 - smooth(u) : smooth(u), sw = (dir > 0 ? 1 - u : u) * 1.4; const c = Math.cos(sw), s = Math.sin(sw); x = (q[0] * c - q[2] * s) * e; z = (q[0] * s + q[2] * c) * e; y = (dir > 0 ? q[1] : q[1] + 0.8 * u) * e + 0.28; al = Math.sin(Math.PI * u) * k * (1 - j / T); any = true; }
          pos[idx * 3] = x; pos[idx * 3 + 1] = y; pos[idx * 3 + 2] = z; col[idx * 4] = 1.0; col[idx * 4 + 1] = 0.46; col[idx * 4 + 2] = 0.16; col[idx * 4 + 3] = al * 0.42;
        }
      }
      geo.attributes.position.needsUpdate = true; geo.attributes.color.needsUpdate = true; p.visible = any;
    };
    return p;
  }
  // brushed steel box with a lid seam that glows faintly when it holds extra energy
  function steelBox() {
    const g = new THREE.Group();
    const sm = new THREE.MeshStandardMaterial({ color: 0xb4b8be, metalness: 1, roughness: 0.36, emissive: 0xffa040, emissiveIntensity: 0 });
    const body = new THREE.Mesh(slab(0.72, 0.6, 0.44, 0.04, 0.02), sm); g.add(body);
    const lid = new THREE.Mesh(slab(0.76, 0.64, 0.06, 0.05, 0.015), sm); lid.position.y = 0.5; g.add(lid);
    const seamM = new THREE.MeshBasicMaterial({ color: 0x1a1612 });
    const seam = new THREE.Mesh(new THREE.BoxGeometry(0.735, 0.012, 0.615), seamM); seam.position.y = 0.492; g.add(seam);
    const halo = L3.glowSprite(0xffc890, 1.5, 0); halo.position.y = 0.3; g.add(halo);
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    g.setE = (e) => { sm.emissiveIntensity = 0.025 * e; seamM.color.setRGB(0.1 + 1.6 * e, 0.085 + 1.0 * e, 0.07 + 0.45 * e); halo.material.opacity = 0.32 * e; halo.visible = e > 0.01; };
    g.setE(0);
    return g;
  }
  const barkTex = once(() => ctex("bark", 512, 256, (c, w, h) => { c.fillStyle = "#3b2a1c"; c.fillRect(0, 0, w, h); const r = rnd(66); for (let i = 0; i < 260; i++) { const y = r() * h; c.strokeStyle = `rgba(${r() < 0.5 ? "15,10,6" : "92,70,48"},${0.3 + 0.4 * r()})`; c.lineWidth = 1 + 4 * r(); c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= w; x += 32) c.lineTo(x, y + (r() - 0.5) * 8); c.stroke(); } }));
  const emberTex = once(() => ctex("ember", 512, 256, (c, w, h) => { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); const r = rnd(67); for (let i = 0; i < 90; i++) { const y = r() * h; c.strokeStyle = `rgba(255,${120 + r() * 80},40,${0.4 + 0.6 * r()})`; c.lineWidth = 0.8 + 1.5 * r(); const x0 = r() * w; c.beginPath(); c.moveTo(x0, y); c.lineTo(x0 + (r() - 0.5) * 60, y + (r() - 0.5) * 10); c.stroke(); } }));
  LABK.balance = (o) => {
    const mode = o.mode, T0 = o.T0, C = cam(30);
    const st = makeSet("lab", { blur: 1.8, L: mode === "recap" ? { fill: 0.9, fillPos: [9, 4, 6] } : {} }), S = st.S;
    const b = bigBalance(); S.add(b.group);
    const w1 = brassWeight(1.15); b.panR.add(w1);
    const P = (txt, p, a) => [txt, p.x, p.y, p.z, a];
    const wpos = (obj, x, y, z) => { obj.updateWorldMatrix(true, false); return obj.localToWorld(V(x || 0, y || 0, z || 0)); };
    const dialPin = (a) => P("tilt magnified", wpos(b.dial, -0.5, 0.05, 0), a);

    if (mode === "add" || mode === "recap") {
      const box = steelBox(); b.panL.add(box);
      const mo = motes(90, mode === "add" ? 5 : 9); b.panL.add(mo);
      return (t) => {
        const ft = T0 + t; let E, tilt, pins = [];
        if (mode === "add") {
          const ein = seg(ft, 233.3, 236.8), eout = seg(ft, 239.2, 241.5);
          E = ein * (1 - eout); tilt = 0.03 * ein - 0.052 * eout + 0.0025 * Math.sin((ft - 241.5) * 5) * Math.exp(-Math.max(0, ft - 241.5) * 2.5) * (ft > 241.5 ? 1 : 0);
          if (ft < 239.1) mo.set(ft, 233.0, 237.4, 1, 1); else mo.set(ft, 239.1, 242.2, -1, 1);
          camKeys(C, [[227.02, 0, 3.25, 0, 15.0, -14, 8], [232.6, -1.2, 4.5, 0, 10.8, -9, 8], [235.9, -1.25, 4.5, 0, 10.5, -7, 8], [238.4, -1.2, 3.75, 0, 10.4, -5, 9], [243.0, -0.4, 3.65, 0, 12.6, -1, 9]], ft);
          pins = [P("steel box", wpos(box, 0, 0.7, 0), win(ft, 227.4, 231.2, 0.5)), dialPin(win(ft, 236.9, 240.2, 0.5))];
        } else {
          const A = ft < EV.recapCut;
          if (A) { const eo = seg(ft, 606.1, 608.2); E = 1 - eo; tilt = 0.024 - 0.038 * eo; mo.set(ft, 606.0, 608.6, -1, 1);
            camKeys(C, [[605.9, -1.4, 3.2, 0, 8.4, 18, 6], [608.85, -1.5, 3.2, 0, 7.8, 12, 7]], ft); }
          else { const ei = seg(ft, 609.2, 611.3); E = ei; tilt = 0.03 * ei; mo.set(ft, 609.0, 611.7, 1, 1);
            camKeys(C, [[608.85, -1.4, 3.3, 0, 8.4, -36, 6], [611.96, -1.5, 3.3, 0, 7.6, -28, 7]], ft); }
          pins = [dialPin(win(ft, 606.3, 611.7, 0.4) * 0.9)];
        }
        b.set(tilt); box.setE(E);
        focusOn(st, C, wpos(b.panL, 0, 0.4, 0), 2, 8); st.draw(C);
        return [S, C, pins];
      };
    }

    if (mode === "spring") {
      const sg = new THREE.Group(); b.panL.add(sg);
      const stM = new THREE.MeshStandardMaterial({ color: 0xaeb3ba, metalness: 1, roughness: 0.3 });
      const base = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.05, 48), stM); base.position.y = 0.025; sg.add(base);
      const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 1.0, 16), stM); rod.position.y = 0.5; sg.add(rod);
      const top = new THREE.Mesh(new THREE.CylinderGeometry(0.33, 0.33, 0.045, 48), stM); sg.add(top);
      const nut = new THREE.Group(); nut.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.08, 6), X3.mats.brass));
      for (const s of [-1, 1]) { const ear = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.12, 0.025), X3.mats.brass); ear.position.set(s * 0.13, 0.03, 0); nut.add(ear); }
      sg.add(nut);
      let hs = 0.62; const turns = 7;
      const coil = L3.liveTube((u) => V(Math.cos(u * turns * TAU) * 0.22, 0.05 + 0.02 + u * (hs - 0.04), Math.sin(u * turns * TAU) * 0.22), 280, 0.022, new THREE.MeshStandardMaterial({ color: 0x9da2a8, metalness: 1, roughness: 0.28 }));
      sg.add(coil);
      sg.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
      return (t) => {
        const ft = T0 + t, w = seg(ft, EV.springWind, 250.2);
        hs = lerp(0.62, 0.36, w);
        top.position.y = 0.05 + hs + 0.022; nut.position.y = top.position.y + 0.065; nut.rotation.y = w * 3.4 * TAU;
        b.set(0.02 * seg(ft, 249.0, 251.3));
        camKeys(C, [[248.04, -2.4, 3.5, 0, 5.4, -22, 8], [251.56, -2.3, 3.45, 0, 4.6, -12, 7]], ft);
        focusOn(st, C, wpos(b.panL, 0, 0.35, 0), 1, 5); st.draw(C);
        return [S, C, [P("wound spring", wpos(sg, 0.1, 0.95, 0), win(ft, 248.25, 250.1, 0.4)), P("tilt magnified", wpos(b.panL, -0.75, 0.75, 0), win(ft, 249.7, 252, 0.4))]];
      };
    }

    if (mode === "log") {
      const jar = cloche(); b.panL.add(jar); jar.children[0].material.color.set(0x5a534b);
      const lg = new THREE.Group(); lg.position.y = 0.11; b.panL.add(lg);
      const logM = new THREE.MeshStandardMaterial({ map: barkTex(), roughness: 0.9, emissive: 0xffffff, emissiveMap: emberTex(), emissiveIntensity: 0 });
      const log = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.11, 0.62, 24), logM); log.rotation.z = Math.PI / 2; log.castShadow = true; lg.add(log);
      const ash = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 0x5f5b56, roughness: 1 }), 70), mm = new THREE.Matrix4(), ar = rnd(71), AP = [];
      for (let i = 0; i < 70; i++) AP.push([(ar() - 0.5) * 0.7, (ar() - 0.5) * 0.5, 0.01 + 0.03 * ar(), ar() * 3, ar()]);
      b.panL.add(ash);
      const fire = flameSet([V(-0.14, 0, 0.02), V(-0.02, 0, -0.03), V(0.09, 0, 0.03), V(0.17, 0, -0.01)], 0, 0.4, 0.6, 13, [[1.0, 0.42, 0.09], [1.0, 0.66, 0.26]], FIRE_FS); fire.position.y = 0.05; lg.add(fire);
      const smoke = steam({ seed: 61, n: 4, w: 0.85, h: 1.0, spread: 0.14, speed: 0.35, curl: 1.6, col: 0x8f8880, op: 0.55 }); smoke.position.y = 0.42; b.panL.add(smoke);
      const fl = new THREE.PointLight(0xff9548, 0, 7, 2); fl.position.y = 0.45; b.panL.add(fl);
      const glow = L3.glowSprite(0xffa050, 1.2, 0); glow.position.y = 0.4; b.panL.add(glow);
      return (t) => {
        const ft = T0 + t, burn = seg(ft, 262.42, 270.78), flick = 0.85 + 0.1 * Math.sin(ft * 17.3) + 0.05 * Math.sin(ft * 29.1);
        const k = (1 - 0.35 * burn) * flick;
        fire.set(ft, C, k); smoke.set(ft, C, 0.6 + 0.4 * burn);
        fl.intensity = 4.5 * k; glow.material.opacity = 0.22 * k;
        logM.emissiveIntensity = (0.2 + 0.6 * burn) * flick; logM.color.setScalar(1 - 0.75 * burn); lg.scale.set(1, 1 - 0.18 * burn, 1 - 0.18 * burn);
        for (let i = 0; i < 70; i++) { const q = AP[i], s = q[4] < 0.25 + 0.75 * burn ? 1 : 0; mm.makeRotationY(q[3]); mm.scale(V(q[2] * 1.1 * s + 1e-5, 0.005 * s + 1e-5, q[2] * 0.8 * s + 1e-5)); mm.setPosition(q[0], 0.015, q[1]); ash.setMatrixAt(i, mm); }
        ash.instanceMatrix.needsUpdate = true;
        jar.setCond(0.25 + 0.45 * burn);
        b.set(-0.02 * seg(ft, 263.2, 270.3));
        camKeys(C, [[262.42, -2.3, 3.75, 0, 5.8, -18, 6], [270.78, -2.2, 3.7, 0, 4.8, -7, 8]], ft);
        focusOn(st, C, wpos(b.panL, 0, 0.4, 0), 1, 5); st.draw(C);
        return [S, C, [P("sealed jar", wpos(b.panL, 0.1, 1.55, 0), win(ft, 262.7, 266.4, 0.4)), P("rise magnified", wpos(b.panL, 0.6, 1.25, 0), win(ft, 266.7, 271.2, 0.4))]];
      };
    }
    return (t) => { st.draw(C); return [S, C, []]; };
  };
})();
