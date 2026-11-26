/* Physics channel 3D core (style v2.1, documentary). Load order: three.min.js, core3d.js, k_*.js (kinds), boot3d.js.
   A kind registers  LABK.name = (o) => (t, d) => [scene, camera]   — t = seconds since the shot started, d = shot length.
   Everything must be a pure function of t (no Date, no unseeded random, no accumulated state between frames).
   Shots: window.LAB = [[a, b, "kind", opts], ...] in part seconds. opts.pins = [["elementId", x, y, z], ...] pins DOM labels to 3D points. */
(function () {
  const W = 1920, H = 1080, D2R = Math.PI / 180;
  const R = new THREE.WebGLRenderer({ canvas: document.getElementById("g3"), antialias: true, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.setSize(W, H, false); R.setClearColor(0x0b0c10, 1);
  R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.05;
  R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFSoftShadowMap;

  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = (p) => { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); };
  const smoother = (p) => { p = clamp(p, 0, 1); return p * p * p * (p * (p * 6 - 15) + 10); };
  const lerp = (a, b, p) => a + (b - a) * p;
  const seg = (t, a, b) => smooth((t - a) / (b - a));          // 0..1 eased between times a and b
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const KF = (arr, t) => { if (!Array.isArray(arr)) return arr; if (t <= arr[0][0]) return arr[0][1]; for (let i = 1; i < arr.length; i++) if (t < arr[i][0]) { const p = smooth((t - arr[i - 1][0]) / (arr[i][0] - arr[i - 1][0])); return lerp(arr[i - 1][1], arr[i][1], p); } return arr[arr.length - 1][1]; };

  const loader = new THREE.TextureLoader(), TEX = {};
  // build-ready: resolves once every texture requested through tex() (or L3.hold()) has loaded and boot3d has run
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  let readyRes, pending = 0, booted = false, done = false;
  window.__hf.buildReady.lab = new Promise((r) => (readyRes = r));
  const check = () => { if (!done && booted && pending === 0) { done = true; readyRes(); if (window.LAB_draw) window.LAB_draw(window.__labT || 0); } };
  const hold = () => { pending++; let once = false; return () => { if (once) return; once = true; pending--; check(); }; };
  const booting = () => { booted = true; check(); };
  function tex(name) {
    if (!TEX[name]) { const rel = hold(); const t = loader.load("assets/tex/" + name, rel, undefined, (e) => { console.error("texture failed", name); rel(); }); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; TEX[name] = t; }
    return TEX[name];
  }

  // studio reflections: dark room with three soft boxes
  const env = (() => {
    const s = new THREE.Scene();
    s.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ color: 0x0d0f14, side: THREE.BackSide })));
    const box = (w, h, x, y, z, k) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(k, k, k * 0.96), side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); s.add(m); };
    box(26, 14, -18, 22, 14, 7); box(18, 26, 26, 8, 6, 3.2); box(30, 8, 0, 10, -28, 1.6);
    const p = new THREE.PMREMGenerator(R); const t = p.fromScene(s, 0.03).texture; p.dispose(); return t;
  })();

  // ---------- stages ----------
  // "studio": dark floor + soft key light with shadows (tabletop objects)
  // "void": no floor, soft key + rim, faint drifting dust (abstract / microscopic)
  // "space": black with stars (cosmic)
  function stage(kind, o) {
    o = o || {};
    const S = new THREE.Scene(); S.environment = env;
    const bg = o.bg !== undefined ? o.bg : (kind === "space" ? 0x000000 : 0x0b0c10);
    S.background = new THREE.Color(bg);
    const key = new THREE.DirectionalLight(0xfff4e6, o.key || 2.2); key.position.set(-7, 12, 8);
    S.add(key, new THREE.HemisphereLight(0x8fa3c0, 0x15161a, o.hemi !== undefined ? o.hemi : 0.35));
    const rim = new THREE.DirectionalLight(0x9fb6d6, o.rim !== undefined ? o.rim : 0.9); rim.position.set(8, 4, -10); S.add(rim);
    S.userData.key = key;
    if (kind === "studio") {
      S.fog = new THREE.Fog(bg, 22, 60);
      key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
      const c = key.shadow.camera; c.left = -12; c.right = 12; c.top = 10; c.bottom = -10; c.far = 40; key.shadow.bias = -0.0004; key.shadow.radius = 6;
      const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), new THREE.MeshStandardMaterial({ color: 0x191b21, roughness: 0.82, metalness: 0, envMapIntensity: 0.35 }));
      floor.rotation.x = -Math.PI / 2; floor.position.y = o.floorY !== undefined ? o.floorY : -2.4; floor.receiveShadow = true; S.add(floor);
    }
    if (kind === "void") S.add(dust(o.seed || 7, o.dust !== undefined ? o.dust : 900, o.dustR || 30));
    if (kind === "space") S.add(stars(o.seed || 3, o.stars || 5000));
    return S;
  }
  function stars(seed, n) {
    const g = new THREE.BufferGeometry(), p = [], c = [], r = rnd(seed);
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      p.push(400 * s * Math.cos(th), 400 * u, 400 * s * Math.sin(th));
      const b = 0.25 + 0.75 * Math.pow(r(), 3), w = r(); c.push(b * (0.85 + 0.15 * w), b * (0.9 + 0.1 * w), b);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, depthWrite: false }));
  }
  function dust(seed, n, rad) {
    const g = new THREE.BufferGeometry(), p = [], r = rnd(seed);
    for (let i = 0; i < n; i++) p.push((r() * 2 - 1) * rad, (r() * 2 - 1) * rad * 0.6, (r() * 2 - 1) * rad);
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size: 1.4, sizeAttenuation: false, color: 0x8a93a6, transparent: true, opacity: 0.35, depthWrite: false }));
  }

  // ---------- materials ----------
  const M = {
    copper: () => new THREE.MeshStandardMaterial({ color: 0xc27a45, metalness: 1, roughness: 0.28 }),
    steel: () => new THREE.MeshStandardMaterial({ color: 0xb8bcc4, metalness: 1, roughness: 0.32 }),
    brass: () => new THREE.MeshStandardMaterial({ color: 0xc9b26b, metalness: 1, roughness: 0.3 }),
    paint: (c, r) => new THREE.MeshStandardMaterial({ color: c, metalness: 0.1, roughness: r !== undefined ? r : 0.42 }),
    matte: (c) => new THREE.MeshStandardMaterial({ color: c, metalness: 0, roughness: 0.85 }),
    glass: (c, op) => new THREE.MeshPhysicalMaterial({ color: c || 0xffffff, metalness: 0, roughness: 0.08, transmission: 0.9, thickness: 0.4, transparent: true, opacity: op || 0.35 }),
    // energy / light: the only self-lit material; keep it warm-white, not neon
    light: (c, op) => new THREE.MeshBasicMaterial({ color: c || 0xfff1d6, transparent: true, opacity: op !== undefined ? op : 1, depthWrite: false }),
    line: (c, op) => new THREE.LineBasicMaterial({ color: c || 0x8db8e8, transparent: true, opacity: op !== undefined ? op : 0.5, depthWrite: false }),
  };
  // quiet palette (style v2.1): real-material objects; these only for abstract things
  const P = { bg: 0x0b0c10, ink: 0xf1efe9, fieldLine: 0x8db8e8, warm: 0xe2a84b, string: 0xf3e3c3, quarkR: 0xb5544a, quarkG: 0x5f8f6a, quarkB: 0x4f6fa3, proton: 0xc0634f, neutron: 0x8b929e, electron: 0x9ec3e6 };

  function canvasTex(w, h, fn) { const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
  function glowSprite(color, size, op) {
    const t = canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, color: color || 0xfff1d6, transparent: true, opacity: op !== undefined ? op : 0.6, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.setScalar(size || 1); return s;
  }
  // a tube whose path is recomputed every frame: fn(u) -> THREE.Vector3, u in 0..1
  function liveTube(fn, segs, radius, mat, closed) {
    const curve = new THREE.Curve(); curve.getPoint = (u, out) => (out || new THREE.Vector3()).copy(fn(u));
    const m = new THREE.Mesh(new THREE.TubeGeometry(curve, segs, radius, 10, !!closed), mat);
    m.userData.update = () => { curve.needsUpdate = true; m.geometry.dispose(); m.geometry = new THREE.TubeGeometry(curve, segs, radius, 10, !!closed); };
    return m;
  }
  // orbit camera: az/el in degrees around target at dist
  function orbit(C, tx, ty, tz, dist, az, el) {
    az *= D2R; el *= D2R;
    C.position.set(tx + dist * Math.sin(az) * Math.cos(el), ty + dist * Math.sin(el), tz + dist * Math.cos(az) * Math.cos(el)); C.lookAt(tx, ty, tz);
  }
  const cam = (fov) => new THREE.PerspectiveCamera(fov || 32, W / H, 0.01, 2000);

  window.L3 = { hold, booting, THREE, R, W, H, D2R, clamp, smooth, smoother, lerp, seg, rnd, KF, tex, env, stage, stars, dust, M, P, canvasTex, glowSprite, liveTube, orbit, cam };
  window.LABK = {};
})();
