/* Space 3D engine for HyperFrames. One WebGL canvas per part (#g3, lowest z).
   build.py writes SPS = [[a, b, kind, opts], ...] in part seconds; on every seek the active shot is drawn.
   Units: Saturn equatorial radius = 1. Everything is a pure function of time. */
(function () {
  const W = 1920, H = 1080, D2R = Math.PI / 180;
  const R = new THREE.WebGLRenderer({ canvas: document.getElementById("g3"), antialias: true, preserveDrawingBuffer: true, alpha: false });
  R.setPixelRatio(1); R.setSize(W, H, false); R.setClearColor(0x000000, 1);
  R.outputColorSpace = THREE.SRGBColorSpace;

  // ---------- helpers ----------
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  const lerp = (a, b, p) => a + (b - a) * p;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const smooth = (p) => { p = clamp(p, 0, 1); return p * p * (3 - 2 * p); };
  const ease = (p, e) => e === "lin" ? clamp(p, 0, 1) : e === "out" ? 1 - Math.pow(1 - clamp(p, 0, 1), 2.2) : e === "in" ? Math.pow(clamp(p, 0, 1), 2) : smooth(p);
  // opts value k0..k1 over the shot (or a single value k)
  const V = (o, k, p, def) => (o[k + "0"] !== undefined ? lerp(o[k + "0"], o[k + "1"] !== undefined ? o[k + "1"] : o[k + "0"], p) : (o[k] !== undefined ? o[k] : def));
  // keyframed value: o[k] = [[t, v], ...] in shot seconds
  const KF = (arr, t) => { if (!Array.isArray(arr)) return arr; if (t <= arr[0][0]) return arr[0][1]; for (let i = 1; i < arr.length; i++) if (t < arr[i][0]) { const p = smooth((t - arr[i - 1][0]) / (arr[i][0] - arr[i - 1][0])); return lerp(arr[i - 1][1], arr[i][1], p); } return arr[arr.length - 1][1]; };

  const loader = new THREE.TextureLoader(); const TEX = {};
  function tex(name, srgbRaw) {
    if (!TEX[name]) { const t = loader.load("assets/tex/" + name); t.colorSpace = srgbRaw ? THREE.NoColorSpace : THREE.SRGBColorSpace; t.anisotropy = 8; TEX[name] = t; }
    return TEX[name];
  }
  window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
  let readyRes; window.__hf.buildReady.space = new Promise((r) => (readyRes = r));
  THREE.DefaultLoadingManager.onLoad = () => { readyRes(); draw(lastT); };

  // ---------- shaders ----------
  const VS = `varying vec3 vN; varying vec3 vP; varying vec2 vUv; varying vec3 vL;
  void main(){ vUv=uv; vL=position; vec4 wp=modelMatrix*vec4(position,1.); vP=wp.xyz; vN=normalize(mat3(modelMatrix)*normal); gl_Position=projectionMatrix*viewMatrix*wp; }`;
  const BODY_FS = `uniform sampler2D map; uniform sampler2D ringTex; uniform vec3 sun; uniform vec3 rc; uniform vec3 rn; uniform vec3 tint; uniform vec3 camP;
  uniform float rIn; uniform float rOut; uniform float useRing; uniform float gamma; uniform float amb; uniform float gain; uniform float sat; uniform float rim; uniform vec3 rimCol; uniform float ringOp; uniform float drain;
  varying vec3 vN; varying vec3 vP; varying vec2 vUv;
  void main(){
    vec3 c=pow(texture2D(map,vUv).rgb,vec3(2.2));
    float g=dot(c,vec3(.299,.587,.114)); c=mix(vec3(g),c,sat); c=pow(c,vec3(gamma))*tint;
    vec3 n=normalize(vN); float d=dot(n,sun);
    float sh=smoothstep(-0.03,0.30,d)*(0.30+0.70*clamp(d,0.,1.));
    if(useRing>0.5){ float dn=dot(sun,rn); if(abs(dn)>1e-4){ float s=-dot(vP-rc,rn)/dn; if(s>0.){ vec3 q=vP+s*sun; float r=length(q-rc);
      if(r>rIn && r<rOut){ float a=texture2D(ringTex,vec2((r-rIn)/(rOut-rIn),.5)).a*ringOp*smoothstep(drain,drain+0.06,r); sh*=1.-.82*a; } } } }
    vec3 v=normalize(camP-vP); float fr=pow(1.-clamp(dot(n,v),0.,1.),3.)*rim*smoothstep(-0.2,0.4,d);
    vec3 col=c*(sh*gain+amb)+rimCol*fr;
    gl_FragColor=vec4(pow(max(col,0.),vec3(1./2.2)),1.);
  }`;
  const RING_FS = `uniform sampler2D ringTex; uniform vec3 sun; uniform vec3 pc; uniform vec3 rn; uniform vec3 camP;
  uniform float rIn; uniform float rOut; uniform float op; uniform float drain; uniform float pr; uniform float gain; uniform float faint; uniform vec3 fcol; uniform float dirt;
  varying vec3 vP; varying vec3 vL;
  void main(){
    float r=length(vL.xy); float u=(r-rIn)/(rOut-rIn); if(u<0.||u>1.) discard;
    vec4 t=texture2D(ringTex,vec2(u,.5)); vec3 c=pow(t.rgb,vec3(2.2)); float a=t.a; c=mix(c,vec3(0.018,0.017,0.016),dirt);
    if(faint>0.){ c=fcol; a=faint*(0.55+0.45*sin(u*40.))*smoothstep(0.,.15,u)*smoothstep(1.,.7,u); }
    a*=op*smoothstep(drain,drain+0.06,r);
    vec3 oc=vP-pc; float b=dot(oc,sun); float cc=dot(oc,oc)-pr*pr; float h=b*b-cc; float lit=(h>0. && b<0.)?0.05:1.;
    float sS=dot(sun,rn); float sV=dot(camP-vP,rn); float face=(sS*sV>0.)?1.0:(0.18+0.55*(1.-t.a));
    vec3 col=c*lit*face*gain;
    gl_FragColor=vec4(pow(max(col,0.),vec3(1./2.2)),a);
  }`;
  const GLASS_FS = `uniform vec3 camP; uniform vec3 col; uniform float op; varying vec3 vN; varying vec3 vP;
  void main(){ vec3 n=normalize(vN); vec3 v=normalize(camP-vP); float f=pow(1.-abs(dot(n,v)),2.5); gl_FragColor=vec4(col, (0.06+0.8*f)*op); }`;

  function bodyMat(texName, o) {
    o = o || {};
    return new THREE.ShaderMaterial({
      vertexShader: VS, fragmentShader: BODY_FS,
      uniforms: {
        map: { value: tex(texName, true) }, ringTex: { value: tex("2k_saturn_ring_alpha.png", true) },
        sun: { value: new THREE.Vector3(1, 0, 0) }, rc: { value: new THREE.Vector3() }, rn: { value: new THREE.Vector3(0, 1, 0) }, camP: { value: new THREE.Vector3() },
        tint: { value: new THREE.Color(...(o.tint || [1, 1, 1])) }, rIn: { value: 1.24 }, rOut: { value: 2.27 }, useRing: { value: o.ring ? 1 : 0 },
        gamma: { value: o.gamma || 1 }, amb: { value: o.amb !== undefined ? o.amb : 0.012 }, gain: { value: o.gain || 1.25 }, sat: { value: o.sat !== undefined ? o.sat : 1 },
        rim: { value: o.rim || 0 }, rimCol: { value: new THREE.Color(...(o.rimCol || [0.4, 0.6, 1])) }, ringOp: { value: 1 }, drain: { value: 0 },
      },
    });
  }

  // ---------- shared pieces ----------
  function stars(seed, n, minS, maxS, bright) {
    const g = new THREE.BufferGeometry(), p = [], c = [], r = rnd(seed);
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u);
      p.push(400 * s * Math.cos(th), 400 * u, 400 * s * Math.sin(th));
      const b = (0.25 + 0.75 * Math.pow(r(), 3)) * bright, w = r();
      c.push(b * (0.85 + 0.15 * w), b * (0.9 + 0.1 * w), b);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(c, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size: (minS + maxS) / 2, sizeAttenuation: false, vertexColors: true, depthWrite: false }));
  }
  function starfield(scene, k) {
    const grp = new THREE.Group();
    grp.add(stars(11, 5000, 1.1, 1.1, 0.75 * (k || 1)));
    grp.add(stars(12, 400, 2.0, 2.0, 1.0 * (k || 1)));
    scene.add(grp); return grp;
  }
  function ringMesh(o) {
    o = o || {};
    const rIn = o.rIn || 1.24, rOut = o.rOut || 2.27;
    const m = new THREE.ShaderMaterial({
      vertexShader: VS, fragmentShader: RING_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: {
        ringTex: { value: tex("2k_saturn_ring_alpha.png", true) }, sun: { value: new THREE.Vector3(1, 0, 0) }, pc: { value: new THREE.Vector3() }, rn: { value: new THREE.Vector3(0, 1, 0) },
        camP: { value: new THREE.Vector3() }, rIn: { value: rIn }, rOut: { value: rOut }, op: { value: 1 }, drain: { value: 0 }, pr: { value: o.pr || 0.97 }, gain: { value: o.gain || 1.9 },
        faint: { value: o.faint || 0 }, dirt: { value: 0 }, fcol: { value: new THREE.Color(...(o.fcol || [0.35, 0.3, 0.26])) },
      },
    });
    const mesh = new THREE.Mesh(new THREE.RingGeometry(rIn, rOut, 512, 1), m);
    mesh.rotation.x = -Math.PI / 2; return mesh;
  }
  // a planet group: body (+ rings). kind: saturn | earth | jupiter | ...
  const BODIES = {
    saturn: ["2k_saturn.jpg", { ring: true, gain: 1.35 }, 0.902],
    jupiter: ["2k_jupiter.jpg", { gain: 1.3 }, 0.935], earth: ["2k_earth_daymap.jpg", { gain: 1.4, rim: 0.9, rimCol: [0.35, 0.6, 1.0] }, 1],
    moon: ["2k_moon.jpg", { gain: 1.3, sat: 0 }, 1], mars: ["2k_mars.jpg", { gain: 1.35, rim: 0.25, rimCol: [1, 0.6, 0.4] }, 1],
    uranus: ["2k_uranus.jpg", { gain: 1.3 }, 0.977], neptune: ["2k_neptune.jpg", { gain: 1.3 }, 0.983],
    mimas: ["2k_moon.jpg", { gain: 1.6, sat: 0, gamma: 0.7, tint: [0.95, 0.95, 0.97] }, 1],
    enceladus: ["2k_moon.jpg", { gain: 2.4, sat: 0, gamma: 0.35, tint: [0.92, 0.97, 1.0] }, 1],
    titan: ["2k_venus_atmosphere.jpg", { gain: 1.4, sat: 1.2, gamma: 1.3, tint: [1.0, 0.72, 0.35], rim: 0.6, rimCol: [1, 0.6, 0.25] }, 1],
    chrysalis: ["2k_moon.jpg", { gain: 1.7, sat: 0, gamma: 0.6, tint: [0.9, 0.93, 1.0] }, 1],
    phobos: ["2k_moon.jpg", { gain: 1.1, sat: 0, gamma: 1.4, tint: [0.75, 0.68, 0.6] }, 1],
  };
  function planet(kind, o) {
    o = o || {};
    const b = BODIES[kind], g = new THREE.Group();
    const mat = bodyMat(b[0], Object.assign({}, b[1], o.mat || {}));
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 160, 96), mat);
    body.scale.set(1, b[2], 1); g.add(body);
    g.userData = { body, mat, rings: null };
    if (kind === "saturn" && o.rings === false) mat.uniforms.useRing.value = 0;
    if (kind === "saturn" && o.rings !== false) { const r = ringMesh(o.ringOpts); g.add(r); g.userData.rings = r; }
    if (o.bigRing) { const r = ringMesh({ gain: 1.6 }); g.add(r); g.userData.rings = r; }
    if (o.faintRing) { const r = ringMesh(Object.assign({ faint: o.faintRing, rIn: 1.3, rOut: o.faintOut || 1.9, gain: 1.0 }, o.ringOpts || {})); g.add(r); g.userData.rings = r; }
    if (o.lumpy) { // irregular moon (Phobos): displace sphere
      const pos = body.geometry.attributes.position, r = rnd(7);
      const bumps = Array.from({ length: 14 }, () => [r() * 2 - 1, r() * 2 - 1, r() * 2 - 1, (r() - 0.5) * 0.35]);
      const v = new THREE.Vector3();
      for (let i = 0; i < pos.count; i++) {
        v.fromBufferAttribute(pos, i).normalize(); let k = 1;
        for (const q of bumps) { const d = v.x * q[0] + v.y * q[1] + v.z * q[2]; k += q[3] * Math.exp(-6 * (1 - d / Math.hypot(q[0], q[1], q[2]))); }
        pos.setXYZ(i, v.x * k * 1.25, v.y * k * 0.9, v.z * k);
      }
      body.geometry.computeVertexNormals();
    }
    return g;
  }
  // per-frame uniforms for a planet group
  function lightPlanet(g, sunDir, cam, o) {
    o = o || {};
    const u = g.userData, c = new THREE.Vector3(); g.getWorldPosition(c);
    const rn = new THREE.Vector3(0, 1, 0).applyQuaternion(g.getWorldQuaternion(new THREE.Quaternion()));
    const sc = g.getWorldScale(new THREE.Vector3()).x;
    const M = u.mat.uniforms; M.sun.value.copy(sunDir); M.rc.value.copy(c); M.rn.value.copy(rn); M.camP.value.copy(cam.position);
    M.rIn.value = 1.24 * sc; M.rOut.value = 2.27 * sc; M.ringOp.value = o.ringOp !== undefined ? o.ringOp : 1; M.drain.value = (o.drain || 0) * sc;
    if (u.rings) {
      const Q = u.rings.material.uniforms; Q.sun.value.copy(sunDir); Q.pc.value.copy(c); Q.rn.value.copy(rn); Q.camP.value.copy(cam.position);
      Q.op.value = o.ringOp !== undefined ? o.ringOp : 1; Q.drain.value = o.drain || 0; Q.dirt.value = o.dirt || 0; Q.pr.value = 0.96 * sc;
    }
  }
  // camera on a sphere around target: dist, el (deg above ring plane), az (deg); roll (deg); px shift of the subject on screen
  function place(cam, target, dist, el, az, roll, sx, sy) {
    const e = el * D2R, a = az * D2R;
    cam.position.set(target.x + dist * Math.cos(e) * Math.sin(a), target.y + dist * Math.sin(e), target.z + dist * Math.cos(e) * Math.cos(a));
    cam.up.set(Math.sin((roll || 0) * D2R), Math.cos((roll || 0) * D2R), 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), a);
    cam.lookAt(target);
    if (sx || sy) cam.setViewOffset(W, H, -(sx || 0), -(sy || 0), W, H); else cam.clearViewOffset();
  }
  // sun direction relative to the camera: az offset from the camera direction, el above ring plane
  function sunRel(camAz, sAz, sEl) {
    const a = (camAz + sAz) * D2R, e = sEl * D2R;
    return new THREE.Vector3(Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)).normalize();
  }
  const newCam = (fov) => new THREE.PerspectiveCamera(fov || 30, W / H, 0.005, 2000);

  // ---------- shot kinds ----------
  const K = {};

  // Saturn hero: dist, el, az, roll, sx, sy, sun [az, el], rot (deg/s), ringOp, drain, moons [{k, r, a, ph, sp, y}]
  K.sat = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov), sat = planet("saturn", o.p || {});
    S.add(sat); starfield(S, o.stars);
    const moons = (o.moons || []).map((m) => { const g = planet(m.k); g.scale.setScalar(m.r); S.add(g); return [g, m]; });
    let extra = null; if (o.extra && K[o.extra]) extra = K[o.extra + "_add"] && K[o.extra + "_add"](S, sat, o);
    return (t, d) => {
      const p = ease(t / d, o.ease);
      const el = o.elK ? KF(o.elK, t) : V(o, "el", p, 20), az = o.azK ? KF(o.azK, t) : V(o, "az", p, 0), dist = o.distK ? KF(o.distK, t) : V(o, "dist", p, 7);
      place(C, sat.position, dist, el, az, V(o, "roll", p, 0), V(o, "sx", p, 0), V(o, "sy", p, 0));
      sat.userData.body.rotation.y = (o.rot !== undefined ? o.rot : 2) * D2R * t + (o.rot0 || 0);
      const sn = o.sun || [-60, 12], sd = sunRel(az, sn[0], sn[1]);
      lightPlanet(sat, sd, C, { ringOp: o.ringOpK ? KF(o.ringOpK, t) : V(o, "ringOp", p, 1), drain: o.drainK ? KF(o.drainK, t) : V(o, "drain", p, 0), dirt: o.dirtK ? KF(o.dirtK, t) : 0 });
      for (const [g, m] of moons) {
        const a = (m.ph + m.sp * t) * D2R; g.position.set(m.a * Math.sin(a), m.y || 0, m.a * Math.cos(a)); lightPlanet(g, sd, C);
      }
      if (extra) extra(t, d, sd, C);
      return [S, C];
    };
  };

  // any single body: k, dist, el, az, sx, sy, sun, rot, faint ring, second body
  K.body = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov), g = planet(o.k, o.p || {});
    if (o.tilt) g.rotation.z = o.tilt * D2R;
    S.add(g); starfield(S, o.stars);
    const sats = (o.sats || []).map((m) => { const q = planet(m.k, m.p || {}); q.scale.setScalar(m.r); S.add(q); return [q, m]; });
    return (t, d) => {
      const p = ease(t / d, o.ease), az = V(o, "az", p, 0);
      place(C, new THREE.Vector3(), V(o, "dist", p, 5), V(o, "el", p, 5), az, V(o, "roll", p, 0), V(o, "sx", p, 0), V(o, "sy", p, 0));
      g.userData.body.rotation.y = (o.rot !== undefined ? o.rot : 4) * D2R * t + (o.rot0 || 0) * D2R;
      const sn = o.sun || [-60, 10], sd = sunRel(az, sn[0], sn[1]); lightPlanet(g, sd, C);
      for (const [q, m] of sats) {
        const a = (m.ph + (m.sp || 0) * t) * D2R, rr = m.aK ? KF(m.aK, t) : m.a;
        q.position.set(rr * Math.sin(a), m.y || 0, rr * Math.cos(a)); q.userData.body.rotation.y = t * 0.2;
        q.visible = m.until === undefined || t < m.until; lightPlanet(q, sd, C);
      }
      return [S, C];
    };
  };

  // a row of bodies (size compare, giants): items [{k, r, x, p}], camera fixed
  K.row = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 25); starfield(S, o.stars);
    const items = o.items.map((it) => { const g = planet(it.k, it.p || {}); g.scale.setScalar(it.r); g.position.set(it.x, it.y || 0, 0); if (it.tilt) g.rotation.z = it.tilt * D2R; S.add(g); return [g, it]; });
    return (t, d) => {
      const p = ease(t / d, o.ease);
      C.position.set(V(o, "cx", p, 0), V(o, "cy", p, 0.6), V(o, "dist", p, 12)); C.up.set(0, 1, 0); C.lookAt(V(o, "cx", p, 0), 0, 0);
      const sd = new THREE.Vector3(...(o.sunV || [-1, 0.25, 0.6])).normalize();
      for (const [g, it] of items) { g.userData.body.rotation.y = t * 0.06 + (it.rot0 || 0); lightPlanet(g, sd, C); g.visible = it.from === undefined || t >= it.from; }
      return [S, C];
    };
  };

  // Saturn as glass filling with Earths (count0 -> count over fillT seconds)
  K.earths = (o) => {
    const S = new THREE.Scene(), C = newCam(30); starfield(S);
    const glass = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 64), new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: GLASS_FS, transparent: true, depthWrite: false, side: THREE.DoubleSide,
      uniforms: { camP: { value: new THREE.Vector3() }, col: { value: new THREE.Color(0.95, 0.85, 0.6) }, op: { value: 1 } } }));
    glass.scale.set(1, 0.902, 1); S.add(glass);
    const sat = planet("saturn", { rings: false }); sat.scale.set(1.001, 1.001, 1.001); S.add(sat);
    const er = 0.081, pts = [], r = rnd(5);
    const s = er * 2.02; // fcc lattice
    for (let i = -14; i <= 14; i++) for (let j = -14; j <= 14; j++) for (let k = -14; k <= 14; k++) {
      if ((i + j + k) & 1) continue;
      const x = i * s / Math.SQRT2, y = j * s / Math.SQRT2, z = k * s / Math.SQRT2;
      if (x * x + (y / 0.902) * (y / 0.902) + z * z < (0.96 - er) * (0.96 - er)) pts.push([x, y, z, y + r() * 0.08]);
    }
    pts.sort((a, b) => a[3] - b[3]);
    const N = Math.min(o.count || 760, pts.length);
    const em = new THREE.MeshStandardMaterial({ map: tex("2k_earth_daymap.jpg"), roughness: 0.9 });
    const inst = new THREE.InstancedMesh(new THREE.SphereGeometry(er, 24, 16), em, N);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    for (let i = 0; i < N; i++) { q.setFromEuler(new THREE.Euler(r() * 6, r() * 6, r() * 6)); m4.compose(new THREE.Vector3(pts[i][0], pts[i][1], pts[i][2]), q, new THREE.Vector3(1, 1, 1)); inst.setMatrixAt(i, m4); }
    S.add(inst);
    const L = new THREE.DirectionalLight(0xffffff, 2.6); S.add(L); S.add(new THREE.AmbientLight(0xffffff, 0.35));
    return (t, d) => {
      const p = ease(t / d, o.ease), az = V(o, "az", p, 0);
      place(C, new THREE.Vector3(), V(o, "dist", p, 4.4), V(o, "el", p, 12), az, 0, V(o, "sx", p, 0), 0);
      const sd = sunRel(az, -50, 20); L.position.copy(sd.clone().multiplyScalar(10));
      glass.material.uniforms.camP.value.copy(C.position);
      const sk = KF(o.solid || [[0, 0]], t); // 0 = glass, 1 = solid Saturn
      sat.visible = sk > 0.5; lightPlanet(sat, sd, C); glass.visible = !sat.visible;
      const f = clamp((t - (o.fill0 || 0.3)) / (o.fillT || 4), 0, 1);
      inst.count = Math.floor(N * Math.pow(f, 0.85)); inst.visible = !sat.visible;
      return [S, C];
    };
  };

  // flying through the ring particles, Saturn behind
  K.fly = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 50); starfield(S, 0.6);
    const sat = planet("saturn", { rings: false }); sat.scale.setScalar(60); sat.position.set(-40, -6, -260); S.add(sat);
    const r = rnd(9), N = o.n || 5000, geo = new THREE.SphereGeometry(1, 12, 9);
    const pos = geo.attributes.position, v = new THREE.Vector3();
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const k = 0.9 + 0.1 * Math.sin(v.x * 3.1 + v.y * 2.3) * Math.cos(v.z * 2.7); pos.setXYZ(i, v.x * k, v.y * k, v.z * k); }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ color: 0xe6ecf2, roughness: 0.6, metalness: 0.0 });
    const inst = new THREE.InstancedMesh(geo, mat, N), m4 = new THREE.Matrix4(), q = new THREE.Quaternion();
    const LEN = 200, data = [];
    for (let i = 0; i < N; i++) {
      const z = -r() * LEN, y = (r() - 0.5) * (o.thick || 2.6) + (r() - 0.5) * 0.4; let x = (r() - 0.5) * 60;
      const sz = 0.02 + Math.pow(r(), 7) * (o.big || 0.9);
      const camY = o.y !== undefined ? o.y : 0.25;
      if (Math.abs(x) < 1.0 + sz * 2 && Math.abs(y - camY) < 0.5 + sz * 2) x += (x < 0 ? -1 : 1) * (1.2 + sz * 2.5);
      data.push([x, y, z, sz, r() * 6, r() * 6, (r() - 0.5) * 0.6, 0.7 + r() * 0.6, 0.6 + r() * 0.5]);
    }
    S.add(inst);
    const dg = new THREE.BufferGeometry(), dp = [];
    for (let i = 0; i < 16000; i++) dp.push((r() - 0.5) * 70, (r() - 0.5) * 2.2, -r() * LEN);
    dg.setAttribute("position", new THREE.Float32BufferAttribute(dp, 3));
    S.add(new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xcfd8e6, size: 0.05, transparent: true, opacity: 0.8, depthWrite: false })));
    const L = new THREE.DirectionalLight(0xfff4e6, 3.0); L.position.set(-5, 3, 2); S.add(L); S.add(new THREE.AmbientLight(0x8899aa, 0.25));
    return (t, d) => {
      const p = ease(t / d, o.ease || "lin"), z = V(o, "z", p, 0) - (o.speed || 2.5) * t;
      C.position.set(V(o, "x", p, 0), V(o, "y", p, 0.25), z); C.up.set(Math.sin((o.roll || 0) * D2R), 1, 0); C.lookAt(C.position.x - 0.15, C.position.y - V(o, "look", p, 0.05), z - 10);
      for (let i = 0; i < N; i++) { const a = data[i]; q.setFromEuler(new THREE.Euler(a[4] + t * a[6], a[5] + t * a[6], 0)); m4.compose(new THREE.Vector3(a[0], a[1], a[2]), q, new THREE.Vector3(a[3] * a[7], a[3] * a[8], a[3])); inst.setMatrixAt(i, m4); }
      inst.instanceMatrix.needsUpdate = true;
      lightPlanet(sat, L.position.clone().normalize(), C, {});
      return [S, C];
    };
  };

  // ring rain: Saturn + dipole field lines + grains sliding down them. lines draw in from t0 over 2 s; grains from tg
  K.sat_rain_add = (S, sat, o) => {
    const grp = new THREE.Group(); S.add(grp);
    const Ls = o.Ls || [1.35, 1.6, 1.9, 2.2], merid = o.merid || 10, lines = [], col = new THREE.Color(o.lineCol || 0xdeef45);
    const pathOf = (L, ph) => { const pts = []; const th0 = Math.asin(Math.sqrt(1 / L)); for (let i = 0; i <= 120; i++) { const th = th0 + (Math.PI - 2 * th0) * i / 120; const r = L * Math.sin(th) * Math.sin(th);
      pts.push(new THREE.Vector3(r * Math.sin(th) * Math.cos(ph), r * Math.cos(th), r * Math.sin(th) * Math.sin(ph))); } return pts; };
    for (let m = 0; m < merid; m++) for (const L of Ls) {
      const ph = (m / merid) * Math.PI * 2; const pts = pathOf(L, ph);
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const ln = new THREE.Line(g, new THREE.LineBasicMaterial({ color: col, transparent: true, opacity: 0.55, depthWrite: false })); grp.add(ln); lines.push(ln);
    }
    const r = rnd(3), NG = o.grains || 900, gp = new Float32Array(NG * 3), gd = [];
    for (let i = 0; i < NG; i++) gd.push([Ls[0] + r() * (Ls[Ls.length - 1] - Ls[0]) * 0.7, r() * Math.PI * 2, r(), r() < 0.5 ? 1 : -1, 0.35 + r() * 0.5]);
    const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(gp, 3));
    const grains = new THREE.Points(gg, new THREE.PointsMaterial({ color: o.grainCol || 0x9fdcff, size: 3.0, sizeAttenuation: false, transparent: true, opacity: 0.95, depthWrite: false }));
    S.add(grains);
    return (t, d, sd, C) => {
      const t0 = o.lt0 || 0.3, f = clamp((t - t0) / 2.2, 0, 1);
      for (const ln of lines) { ln.geometry.setDrawRange(0, Math.floor(121 * f)); ln.material.opacity = 0.55 * (o.lineOpK ? KF(o.lineOpK, t) : 1); }
      const tg = o.tg !== undefined ? o.tg : 1.5;
      for (let i = 0; i < NG; i++) {
        const [L, ph, off, hemi, sp] = gd[i]; let u = ((t - tg) * sp * 0.25 + off) % 1; if (t < tg) u = -1;
        const th0 = Math.asin(Math.sqrt(1 / L)); const thE = Math.PI / 2; const th = u < 0 ? thE : thE - hemi * (thE - th0) * Math.pow(u, 1.6);
        const rr = L * Math.sin(th) * Math.sin(th); const k = u < 0 ? 999 : 1;
        gp[i * 3] = rr * Math.sin(th) * Math.cos(ph) * k; gp[i * 3 + 1] = rr * Math.cos(th) * k; gp[i * 3 + 2] = rr * Math.sin(th) * Math.sin(ph) * k;
      }
      gg.attributes.position.needsUpdate = true;
    };
  };
  K.sat_rain = (o) => K.sat(Object.assign({ extra: "sat_rain" }, o));

  // Cassini's 22 Grand Finale orbits around Saturn: ellipses through the gap
  K.sat_orbits_add = (S, sat, o) => {
    const grp = new THREE.Group(); S.add(grp); const n = o.norb || 22, lines = [];
    for (let i = 0; i < n; i++) {
      const pts = [], rp = 1.04, ra = o.ra || 9, a = (rp + ra) / 2, e = (ra - rp) / (ra + rp);
      for (let k = 0; k <= 400; k++) { const nu = -Math.PI + 2 * Math.PI * k / 400; const r = a * (1 - e * e) / (1 + e * Math.cos(nu)); pts.push(new THREE.Vector3(r * Math.cos(nu), 0, r * Math.sin(nu))); }
      const g = new THREE.BufferGeometry().setFromPoints(pts);
      const ln = new THREE.Line(g, new THREE.LineBasicMaterial({ color: i === n - 1 ? 0xff2d55 : 0xdeef45, transparent: true, opacity: 0.5, depthWrite: false }));
      ln.rotation.x = 62 * D2R; ln.rotation.y = (o.orbAz || 30) * D2R + i * (o.orbStep || 2.2) * D2R; grp.add(ln); lines.push(ln);
    }
    return (t) => { const f = clamp((t - (o.lt0 || 0.3)) / (o.ldur || 3), 0, 1); const m = f * n; lines.forEach((ln, i) => { ln.visible = i < m; ln.geometry.setDrawRange(0, i < Math.floor(m) ? 401 : Math.floor(401 * (m - i))); }); };
  };
  K.sat_orbits = (o) => K.sat(Object.assign({ extra: "sat_orbits" }, o));


  // material pouring from the innermost ring straight into the equator
  K.sat_pour_add = (S, sat, o) => {
    const r = rnd(8), N = o.grains || 2500, gp = new Float32Array(N * 3), gd = [];
    for (let i = 0; i < N; i++) gd.push([r() * Math.PI * 2, r(), 0.4 + r() * 0.6, (r() - 0.5) * 0.012]);
    const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(gp, 3));
    S.add(new THREE.Points(gg, new THREE.PointsMaterial({ color: 0xbfe6ff, size: 2.4, sizeAttenuation: false, transparent: true, opacity: 0.9, depthWrite: false })));
    return (t) => {
      for (let i = 0; i < N; i++) {
        const [ph, off, sp, y] = gd[i]; const u = ((t * sp * 0.18 + off) % 1);
        const rr = 1.26 - 0.27 * Math.pow(u, 1.4), a = ph + u * 2.2;
        gp[i * 3] = rr * Math.sin(a); gp[i * 3 + 1] = y * (1 - u); gp[i * 3 + 2] = rr * Math.cos(a);
      }
      gg.attributes.position.needsUpdate = true;
    };
  };
  K.sat_pour = (o) => K.sat(Object.assign({ extra: "sat_pour" }, o));

  // Cassini model (procedural)
  function cassini() {
    const g = new THREE.Group();
    const white = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.5 }), gold = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.35, metalness: 0.6 }), dark = new THREE.MeshStandardMaterial({ color: 0x333333, roughness: 0.6 });
    const dish = new THREE.Mesh(new THREE.SphereGeometry(2, 48, 12, 0, Math.PI * 2, 0, 0.5), white); dish.rotation.x = Math.PI; dish.position.y = 2.4; g.add(dish);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 3.2, 24), gold); body.position.y = 0.2; g.add(body);
    const bus = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.7, 10), dark); bus.position.y = 1.6; g.add(bus);
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 9, 6), dark); boom.rotation.z = Math.PI / 2; boom.position.set(4.5, 1.2, 0); g.add(boom);
    const rtg = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.2, 12), dark); rtg.rotation.z = 0.7; rtg.position.set(-1.2, -1.2, 0.5); g.add(rtg);
    const prb = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.9, 0.5, 20), white); prb.rotation.z = Math.PI / 2; prb.position.set(1.0, 0.0, 0); g.add(prb);
    const eng = new THREE.Mesh(new THREE.ConeGeometry(0.45, 0.9, 16), dark); eng.position.y = -1.85; g.add(eng);
    return g;
  }
  // Grand Finale dive: Cassini in front of Saturn's limb with the ring edge above
  K.dive = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 40); starfield(S, 0.8);
    const sat = planet("saturn"); sat.scale.setScalar(100); S.add(sat);
    const cas = cassini(); cas.scale.setScalar(o.cs || 0.12); S.add(cas);
    const L = new THREE.DirectionalLight(0xfff2e0, 3.2); S.add(L); S.add(new THREE.AmbientLight(0x6677aa, 0.25));
    return (t, d) => {
      const p = ease(t / d, o.ease || "lin");
      const ang = (V(o, "ang", p, 0) + (o.angSp || 0.02) * t) , rad = 100 * V(o, "rad", p, 1.07), h = V(o, "h", p, 0.6);
      const P = new THREE.Vector3(rad * Math.sin(ang), h, rad * Math.cos(ang));
      const fwd = new THREE.Vector3(Math.cos(ang), 0, -Math.sin(ang));
      C.position.copy(P).addScaledVector(fwd, -V(o, "back", p, 3)).add(new THREE.Vector3(0, V(o, "camUp", p, 0.25), 0)).addScaledVector(P.clone().normalize(), V(o, "out", p, 0.6));
      C.up.set(0, 1, 0); C.lookAt(P.clone().addScaledVector(fwd, 6).add(new THREE.Vector3(0, V(o, "lookY", p, 0), 0)).addScaledVector(P.clone().normalize(), V(o, "lookIn", p, -1.5)));
      cas.position.copy(P); cas.lookAt(P.clone().add(P.clone().normalize())); cas.rotateX(Math.PI / 2); cas.rotation.z += t * 0.05;
      const sd = new THREE.Vector3(...(o.sunV || [0.3, 0.35, 1])).normalize(); L.position.copy(sd).multiplyScalar(10);
      lightPlanet(sat, sd, C, {});
      return [S, C];
    };
  };
  K.cassini = (o) => { // spacecraft hero against stars with Saturn behind
    const S = new THREE.Scene(), C = newCam(o.fov || 35); starfield(S);
    const sat = planet("saturn"); sat.scale.setScalar(o.ss || 8); sat.position.set(...(o.sp || [-14, -3, -40])); S.add(sat);
    const cas = cassini(); S.add(cas);
    const L = new THREE.DirectionalLight(0xfff2e0, 3.4); S.add(L); S.add(new THREE.AmbientLight(0x6677aa, 0.3));
    return (t, d) => {
      const p = ease(t / d, o.ease);
      const az = V(o, "az", p, 30) * D2R, dist = V(o, "dist", p, 14);
      C.position.set(dist * Math.sin(az), V(o, "cy", p, 2), dist * Math.cos(az)); C.up.set(0, 1, 0); C.lookAt(0, 0.5, 0);
      cas.rotation.y = t * 0.08; cas.rotation.z = -0.25; cas.position.y = Math.sin(t * 0.4) * 0.1;
      const sd = new THREE.Vector3(...(o.sunV || [-1, 0.4, 0.6])).normalize(); L.position.copy(sd).multiplyScalar(10);
      lightPlanet(sat, sd, C, {});
      if (o.burn) { const b = clamp((t - o.burn) / 2, 0, 1); cas.visible = b < 1; }
      return [S, C];
    };
  };

  // a moon torn apart into a disk around a planet: planet k, moon m. tBreak, spread over the rest. scale years by `speed`
  K.breakup = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 30); starfield(S);
    const P = planet(o.k || "saturn", { rings: false }); S.add(P);
    const M = planet(o.m || "chrysalis", o.mp || {}); M.scale.setScalar(o.mr || 0.12); S.add(M);
    const r = rnd(21), N = o.n || 9000, gp = new Float32Array(N * 3), dat = [];
    const rIn = o.rIn || 1.3, rOut = o.rOut || 2.3;
    for (let i = 0; i < N; i++) {
      const u = r(), v = r(), w = r(); const rr = Math.cbrt(u) * (o.mr || 0.12), th = Math.acos(2 * v - 1), ph = w * Math.PI * 2;
      const fall = r() < (o.fallFrac || 0.0);
      dat.push([rr * Math.sin(th) * Math.cos(ph), rr * Math.cos(th), rr * Math.sin(th) * Math.sin(ph), rIn + Math.pow(r(), 0.8) * (rOut - rIn), r() * Math.PI * 2, (r() - 0.5) * 0.5, fall, r()]);
    }
    const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(gp, 3));
    const pts = new THREE.Points(gg, new THREE.PointsMaterial({ color: o.pcol || 0xdde6f0, size: o.psize || 2.2, sizeAttenuation: false, transparent: true, opacity: 0.95, depthWrite: false }));
    S.add(pts);
    let rgrp = null; if (o.formRing) { rgrp = planet("saturn"); rgrp.remove(rgrp.userData.body); S.add(rgrp); }
    // moon path: approach on a spiral, radius a(t) shrinking to rb at tBreak
    const tb = o.tBreak || 3, a0 = o.a0 || 4.5, rb = o.rb || 1.6;
    return (t, d) => {
      const p = ease(t / d, o.ease), az = V(o, "az", p, 0);
      place(C, new THREE.Vector3(), V(o, "dist", p, 9), V(o, "el", p, 25), az, 0, V(o, "sx", p, 0), V(o, "sy", p, 0));
      const sd = sunRel(az, (o.sun || [-60, 15])[0], (o.sun || [-60, 15])[1]); lightPlanet(P, sd, C);
      P.userData.body.rotation.y = t * 0.05;
      const q = clamp(t / tb, 0, 1), am = lerp(a0, rb, Math.pow(q, 1.3)), angM = (o.ph || 0) + 2.2 * q * Math.PI * 0.9;
      const mc = new THREE.Vector3(am * Math.sin(angM), (o.my || 0.15) * (1 - q), am * Math.cos(angM));
      M.position.copy(mc); M.visible = t < tb; lightPlanet(M, sd, C); M.userData.body.rotation.y = t * 0.3;
      const after = Math.max(0, t - tb), sp = o.spread || 1.0;
      for (let i = 0; i < N; i++) {
        const D = dat[i]; let x, y, z;
        if (t < tb) { x = 999; y = 999; z = 999; }
        else {
          const k = clamp(after * sp / 5, 0, 1), ke = 1 - Math.pow(1 - k, 2);                   // 0 at break -> 1 settled disk
          const rr = lerp(rb, D[3], ke);
          const om = 1.0 / Math.pow(rr, 1.5);
          const ang = angM + (D[4] - Math.PI) * ke * 1.0 + om * after * sp * 1.6 + (D[0] / rb) * (1 - ke) * 3;
          const yy = lerp(D[1] + mc.y, D[5] * 0.02, ke);
          if (D[6]) { const f = clamp(after * sp / 2.5, 0, 1); const r2 = lerp(rb, 0.6, f); x = r2 * Math.sin(ang); z = r2 * Math.cos(ang); y = yy; if (f >= 1) { x = 999; } }
          else { x = rr * Math.sin(ang) + D[0] * (1 - ke); z = rr * Math.cos(ang) + D[2] * (1 - ke); y = yy; }
        }
        gp[i * 3] = x; gp[i * 3 + 1] = y; gp[i * 3 + 2] = z;
      }
      gg.attributes.position.needsUpdate = true;
      if (rgrp) { const f = clamp((after - (o.ringAt || 5)) / 2, 0, 1); rgrp.visible = f > 0; lightPlanet(rgrp, sd, C, { ringOp: f }); pts.material.opacity = 0.95 * (1 - f * 0.85); }
      return [S, C];
    };
  };

  // micrometeoroid hits an ice chunk: flash, plasma, charged particles fly off. tHit
  K.impact = (o) => {
    const S = new THREE.Scene(), C = newCam(35); starfield(S, 0.5);
    const geo = new THREE.SphereGeometry(1, 96, 64), pos = geo.attributes.position, v = new THREE.Vector3(), r = rnd(4);
    for (let i = 0; i < pos.count; i++) { v.fromBufferAttribute(pos, i); const n = 1 + 0.12 * Math.sin(v.x * 4 + 1) * Math.cos(v.y * 5) + 0.06 * Math.sin(v.z * 9); pos.setXYZ(i, v.x * n * 1.3, v.y * n, v.z * n); }
    geo.computeVertexNormals();
    const chunk = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xe8eef5, roughness: 0.45, flatShading: false })); S.add(chunk);
    const L = new THREE.DirectionalLight(0xfff4e8, 3); L.position.set(-3, 2, 3); S.add(L); S.add(new THREE.AmbientLight(0x8899bb, 0.3));
    const hit = new THREE.Vector3(0.55, 0.78, 0.45);
    const streak = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.02, 1, 6), new THREE.MeshBasicMaterial({ color: 0xfff1c0 })); S.add(streak);
    const flash = new THREE.Sprite(new THREE.SpriteMaterial({ color: 0xffd28a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); S.add(flash);
    const NP = 1400, pp = new Float32Array(NP * 3), pd = [];
    for (let i = 0; i < NP; i++) { const a = r() * Math.PI * 2, b = r() * 1.2; pd.push([Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b), 0.5 + r() * 2.5]); }
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    const pm = new THREE.PointsMaterial({ color: 0xff9a5a, size: 3, sizeAttenuation: false, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false });
    S.add(new THREE.Points(pg, pm));
    const th = o.tHit || 1.5, dir = new THREE.Vector3(1, 1.4, 0.9).normalize();
    return (t, d) => {
      place(C, new THREE.Vector3(0.2, -0.2, 0), V(o, "dist", ease(t / d), 8), 18, 20 + t * 2, 0, 0, 0);
      chunk.rotation.y = t * 0.05;
      const k = (th - t) / 0.35; streak.visible = k > 0 && k < 1.2;
      if (streak.visible) { const len = 3; const pos2 = hit.clone().addScaledVector(dir, Math.max(0, k) * 6 + len / 2); streak.position.copy(pos2); streak.scale.set(1, len, 1); streak.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir); }
      const a = t - th; flash.visible = a > 0 && a < 1.2; flash.position.copy(hit); const fs = a < 0.15 ? a / 0.15 : Math.max(0, 1 - (a - 0.15) / 1.0); flash.scale.setScalar(0.2 + 1.6 * fs); flash.material.opacity = fs;
      for (let i = 0; i < NP; i++) { const q = pd[i]; const s = a > 0 ? q[3] * Math.pow(a, 0.6) : 999; pp[i * 3] = hit.x + q[0] * s * (a > 0 ? 1 : 0) + (a > 0 ? 0 : 999); pp[i * 3 + 1] = hit.y + q[1] * s; pp[i * 3 + 2] = hit.z + q[2] * s; }
      pg.attributes.position.needsUpdate = true;
      pm.color.setHSL(lerp(0.08, 0.6, clamp(a / 2.5, 0, 1)), 1, lerp(0.6, 0.75, clamp(a / 2.5, 0, 1))); pm.opacity = clamp(1 - (a - 2.5) / 2, 0, 1);
      return [S, C];
    };
  };

  // ---------- driver ----------
  const SHOTS = (window.SPS || []).map(([a, b, k, o]) => ({ a, b, k, o, f: K[k] ? K[k](o) : null }));
  // dynamic geometry: bounding spheres go stale, so never frustum-cull
  const _render = R.render.bind(R);
  R.render = (S, C) => { if (!S.userData.nc) { S.traverse((m) => { m.frustumCulled = false; }); S.userData.nc = 1; } _render(S, C); };
  if (SHOTS.some((s) => !s.f)) console.error("unknown 3D kind", SHOTS.filter((s) => !s.f).map((s) => s.k));
  let lastT = 0;
  function draw(t) {
    lastT = t;
    let s = null;
    for (const x of SHOTS) if (t >= x.a && t < x.b) s = x;
    if (!s) { let best = 1e9; for (const x of SHOTS) { const dd = t < x.a ? x.a - t - 0.01 : t - x.b; if (dd < 0.8 && dd < best) { best = dd; s = x; } } }
    if (!s || !s.f) { R.clear(); return; }
    const tt = t - s.a, [S, C] = s.f(Math.max(tt, -0.8), s.b - s.a);
    R.render(S, C);
  }
  window.addEventListener("hf-seek", (e) => draw(e.detail.time));
  window.SP_draw = draw;
  draw(0);
})();
