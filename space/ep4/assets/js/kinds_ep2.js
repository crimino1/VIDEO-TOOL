/* EP2 kinds: universe scale ladder. Loaded after space.js; uses window.SPK (engine internals). Units are per-kind and stated at each kind. */
(function () {
  const { THREE, K, VS, W, H, D2R, rnd, lerp, clamp, smooth, ease, V, KF, tex, TEX, starfield, planet, BODIES, lightPlanet, place, sunRel } = window.SPK;
  const newCam = (fov) => { const c = window.SPK.newCam(fov); c.far = 1e6; c.near = 0.01; c.updateProjectionMatrix(); return c; };
  const follow = (st, C) => { if (st) st.position.copy(C.position); };

  // soft round points with per-point size and colour
  const PT_VS = `attribute float size; attribute vec3 color; uniform float scale; uniform float isFlat; uniform float minS; varying vec3 vC; varying float vA;
  void main(){ vC=color; vec4 mv=modelViewMatrix*vec4(position,1.); float s = isFlat>0.5 ? size : size*scale/(-mv.z); vA = clamp(s/minS,0.0,1.0); gl_PointSize=clamp(s,minS,7.0); gl_Position=projectionMatrix*mv; }`;
  const PT_FS = `uniform float op; varying vec3 vC; varying float vA;
  void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d); if(r>0.5) discard; float a=smoothstep(0.5,0.0,r); a=a*a; gl_FragColor=vec4(vC, a*op*vA); }`;
  function pointsMat(o) {
    o = o || {};
    return new THREE.ShaderMaterial({ vertexShader: PT_VS, fragmentShader: PT_FS, transparent: true, depthWrite: false,
      blending: o.normal ? THREE.NormalBlending : THREE.AdditiveBlending,
      uniforms: { scale: { value: o.scale || 900 }, isFlat: { value: o.flat ? 1 : 0 }, minS: { value: o.minS || 1.2 }, op: { value: o.op !== undefined ? o.op : 1 } } });
  }
  function pointCloud(pos, col, size, o) {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3)); g.setAttribute("size", new THREE.Float32BufferAttribute(size, 1));
    const m = new THREE.Points(g, pointsMat(o)); m.frustumCulled = false; return m;
  }
  const gauss = (r) => { let u = 0; for (let i = 0; i < 4; i++) u += r(); return (u - 2) / 0.577; };
  const FADE = (o, t) => (o.opK ? KF(o.opK, t) : 1);
  const lerpV3 = (a, b, p) => new THREE.Vector3(lerp(a[0], b[0], p), lerp(a[1], b[1], p), lerp(a[2], b[2], p));

  // ---- realistic Earth: day/night/clouds/atmosphere ----
  const EARTH_FS = `uniform sampler2D day; uniform sampler2D night; uniform sampler2D clouds; uniform vec3 sun; uniform vec3 camP; uniform float cRot;
  varying vec3 vN; varying vec3 vP; varying vec2 vUv;
  void main(){
    vec3 n=normalize(vN); float d=dot(n,sun);
    vec3 dc=pow(texture2D(day,vUv).rgb,vec3(2.2)); vec3 nc=pow(texture2D(night,vUv).rgb,vec3(2.2));
    float cl=texture2D(clouds,vec2(vUv.x+cRot,vUv.y)).r;
    float lit=smoothstep(-0.08,0.25,d);
    vec3 col=dc*(0.04+1.3*max(d,0.))*lit;
    col=mix(col, vec3(0.9)*(0.06+1.25*max(d,0.))*lit, cl*0.8);
    col+=nc*vec3(1.0,0.78,0.5)*1.5*(1.-smoothstep(-0.18,0.05,d))*(1.-cl*0.8);
    vec3 v=normalize(camP-vP); vec3 h=normalize(sun+v); float ocean=(dc.b>dc.r*1.1 && dc.b>dc.g)?1.:0.; col+=vec3(1.)*pow(max(dot(n,h),0.),60.)*0.3*ocean*lit*(1.-cl);
    float fr=pow(1.-clamp(dot(n,v),0.,1.),2.6); col+=vec3(0.30,0.55,1.0)*fr*0.8*smoothstep(-0.25,0.35,d);
    gl_FragColor=vec4(pow(max(col,0.),vec3(1./2.2)),1.);
  }`;
  const ATMO_FS = `uniform vec3 sun; uniform vec3 camP; varying vec3 vN; varying vec3 vP;
  void main(){ vec3 n=normalize(vN); vec3 v=normalize(camP-vP); float fr=pow(1.-abs(dot(n,v)),3.0); float d=dot(n,sun); float a=fr*smoothstep(-0.35,0.25,d)*0.8; gl_FragColor=vec4(vec3(0.35,0.6,1.0),a); }`;
  function earthPlus() {
    const g = new THREE.Group();
    const ct = tex("2k_earth_clouds.jpg", true); ct.wrapS = THREE.RepeatWrapping;
    const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: EARTH_FS, uniforms: {
      day: { value: tex("2k_earth_daymap.jpg", true) }, night: { value: tex("2k_earth_nightmap.jpg", true) }, clouds: { value: ct },
      sun: { value: new THREE.Vector3(1, 0, 0) }, camP: { value: new THREE.Vector3() }, cRot: { value: 0 } } });
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 192, 128), mat); g.add(body);
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(1.025, 128, 96), new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: ATMO_FS, transparent: true, depthWrite: false, side: THREE.BackSide,
      blending: THREE.AdditiveBlending, uniforms: { sun: { value: new THREE.Vector3(1, 0, 0) }, camP: { value: new THREE.Vector3() } } }));
    g.add(atmo);
    g.userData = { body, mat, atmo };
    g.userData.light = (sd, C, t) => { mat.uniforms.sun.value.copy(sd); mat.uniforms.camP.value.copy(C.position); mat.uniforms.cRot.value = t * 0.002;
      atmo.material.uniforms.sun.value.copy(sd); atmo.material.uniforms.camP.value.copy(C.position); };
    return g;
  }
  // ---- Sun / star surface ----
  const SUN_FS = `uniform sampler2D map; uniform vec3 camP; uniform vec3 tint; uniform float gain; uniform float rep; uniform float t;
  varying vec3 vN; varying vec3 vP; varying vec2 vUv;
  void main(){ vec3 n=normalize(vN); vec3 v=normalize(camP-vP); float mu=clamp(dot(n,v),0.,1.);
    vec3 c=pow(texture2D(map,vUv*rep+vec2(t*0.002,0.)).rgb,vec3(2.2));
    float g=dot(c,vec3(.3,.6,.1)); vec3 base=mix(vec3(1.0,0.52,0.12),vec3(1.0,0.80,0.46),clamp(0.25+0.55*g,0.,1.)); vec3 col=tint*base*(0.22+0.78*pow(mu,0.55))*gain;
    gl_FragColor=vec4(pow(col,vec3(1./2.2)),1.); }`;
  function glowTex() {
    if (TEX._glow) return TEX._glow;
    const c = document.createElement("canvas"); c.width = c.height = 256; const g = c.getContext("2d");
    const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.2, "rgba(255,255,255,.45)"); gr.addColorStop(0.5, "rgba(255,255,255,.08)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const t = new THREE.CanvasTexture(c); TEX._glow = t; return t;
  }
  function starBall(o) {
    o = o || {}; const g = new THREE.Group();
    const st = tex("2k_sun.jpg", true); st.wrapS = st.wrapT = THREE.RepeatWrapping;
    const mat = new THREE.ShaderMaterial({ vertexShader: VS, fragmentShader: SUN_FS, uniforms: { map: { value: st }, camP: { value: new THREE.Vector3() },
      tint: { value: new THREE.Color(...(o.tint || [1, 1, 1])) }, gain: { value: o.gain || 1.1 }, rep: { value: o.rep || 1 }, t: { value: 0 } } });
    const body = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96), mat); g.add(body);
    const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(...(o.halo || [1.0, 0.75, 0.45])), transparent: true, opacity: o.haloOp !== undefined ? o.haloOp : 0.35, blending: THREE.AdditiveBlending, depthWrite: false }));
    halo.scale.setScalar(o.haloS || 3.2); g.add(halo);
    g.userData = { body, mat, halo };
    g.userData.light = (sd, C, t) => { mat.uniforms.camP.value.copy(C.position); mat.uniforms.t.value = t; };
    return g;
  }
  function orbitLine(r, col, op, seg) {
    const n = seg || 256, pts = []; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; pts.push(new THREE.Vector3(r * Math.cos(a), 0, r * Math.sin(a))); }
    const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: col || 0x8090a8, transparent: true, opacity: op || 0.5, depthWrite: false })); l.frustumCulled = false; return l;
  }
  // a dot that stays a few px wide at any distance
  function marker(col, px) { const c = new THREE.Color(col); return pointCloud([0, 0, 0], [c.r, c.g, c.b], [px || 10], { flat: true, minS: 1 }); }
  window.SPK.marker = marker; window.SPK.earthPlus = earthPlus; window.SPK.starBall = starBall;

  // ---- Earth hero. dist, el, az, sx, sy, sun [az, el], rot (deg/s); moon: [x,y,z] in Earth radii ----
  K.earth = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov), E = earthPlus(); S.add(E); starfield(S, o.stars);
    let M = null; if (o.moon) { M = planet("moon"); M.scale.setScalar(0.273); S.add(M); }
    return (t, d) => {
      const p = ease(t / d, o.ease), az = V(o, "az", p, 0);
      place(C, new THREE.Vector3(), o.distK ? KF(o.distK, t) : V(o, "dist", p, 4), V(o, "el", p, 8), az, V(o, "roll", p, 0), V(o, "sx", p, 0), V(o, "sy", p, 0));
      E.userData.body.rotation.y = (o.rot0 || 0) + (o.rot !== undefined ? o.rot : 3) * D2R * t;
      const sn = o.sun || [-70, 8], sd = sunRel(az, sn[0], sn[1]); E.userData.light(sd, C, t);
      if (M) { M.position.set(...o.moon); lightPlanet(M, sd, C); }
      return [S, C];
    };
  };

  // ---- planets in the Earth–Moon gap. units: 1000 km. Earth centre 0, Moon centre 384.4 ----
  // polar diameters (poles turned along the line): 364,800 km of planets in a 376,300 km surface-to-surface gap
  BODIES.mercury = ["2k_mercury.jpg", { gain: 1.3 }, 1];
  BODIES.venus = ["2k_venus_atmosphere.jpg", { gain: 1.25 }, 1];
  K.gap = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 30); starfield(S, 0.7);
    const E = earthPlus(); E.scale.setScalar(6.371); S.add(E);
    const Mo = planet("moon"); Mo.scale.setScalar(1.737); Mo.position.x = 384.4; S.add(Mo);
    const P = [["mercury", 4.879, 1], ["venus", 12.104, 1], ["mars", 6.752, 1], ["jupiter", 133.708, 0.935], ["saturn", 108.728, 0.902], ["uranus", 49.946, 0.977], ["neptune", 48.682, 0.983]];
    const total = P.reduce((a, q) => a + q[1], 0), room = 384.4 - 6.371 - 1.737, gapEach = (room - total) / (P.length + 1);
    let x = 6.371 + gapEach; const items = [];
    for (const [k, dpol, ob] of P) {
      const g = planet(k, { rings: false }); g.scale.setScalar(dpol / 2 / ob); g.rotation.z = Math.PI / 2;
      g.position.x = x + dpol / 2; x += dpol + gapEach; S.add(g); items.push(g);
    }
    return (t, d) => {
      const p = ease(t / d, o.ease);
      const cx = o.cxK ? KF(o.cxK, t) : V(o, "cx", p, 192), dist = o.distK ? KF(o.distK, t) : V(o, "dist", p, 760);
      C.position.set(cx, V(o, "cy", p, 30), dist); C.up.set(0, 1, 0); C.lookAt(cx, 0, 0); C.clearViewOffset();
      const sd = new THREE.Vector3(-0.25, 0.3, 1).normalize();
      E.userData.light(sd, C, t); E.userData.body.rotation.y = 2.2 + t * 0.02; lightPlanet(Mo, sd, C);
      const f = o.lineK ? KF(o.lineK, t) : 1;
      items.forEach((g, i) => { lightPlanet(g, sd, C); g.userData.body.rotation.y = t * 0.03 + i; g.visible = f > (i + 0.5) / items.length; });
      return [S, C];
    };
  };

  // ---- Sun with Earth for scale, optional fill with Earth-sized dots. units: Earth radius ----
  K.sun = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 30); starfield(S, 0.6);
    const Su = starBall({ haloS: 3.0, haloOp: 0.3 }); Su.scale.setScalar(109); S.add(Su);
    if (o.img) { // real SDO photo of the Sun as a camera-facing disk (sphere silhouette is a disk anyway)
      Su.userData.body.visible = false;
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex(o.img), transparent: true, depthWrite: false }));
      sp.scale.setScalar(2 / (o.diskFrac || 0.797)); Su.add(sp); Su.userData.photo = sp; Su.userData.halo.material.opacity = 0.12;
    }
    const E = earthPlus(); E.position.set(...(o.earthAt || [-150, 0, 40])); S.add(E);
    let fill = null, glass = null, N = 0;
    if (o.fill) {
      const r = rnd(13), pts = []; N = o.fill;
      for (let i = 0; i < N; i++) { let x, y, z; do { x = r() * 2 - 1; y = r() * 2 - 1; z = r() * 2 - 1; } while (x * x + y * y + z * z > 1); pts.push([x * 106, y * 106, z * 106]); }
      pts.sort((a, b) => a[1] - b[1]);
      const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), sz = new Float32Array(N);
      for (let i = 0; i < N; i++) { pos.set(pts[i], i * 3); const k = 0.7 + 0.3 * r(); col.set([0.25 * k, 0.5 * k, 0.95 * k], i * 3); sz[i] = 1.4; }
      fill = pointCloud(pos, col, sz, { scale: 450, minS: 0.8, op: 0.45 }); S.add(fill);
      glass = new THREE.Mesh(new THREE.SphereGeometry(109, 96, 64), new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.08, depthWrite: false, side: THREE.BackSide })); S.add(glass);
    }
    return (t, d) => {
      const p = ease(t / d, o.ease), az = V(o, "az", p, 0);
      const tgt = o.lookK ? lerpV3(o.lookK[0], o.lookK[1], ease(t / d, "inout")) : new THREE.Vector3(...(o.lookAt || [0, 0, 0]));
      place(C, tgt, o.distK ? KF(o.distK, t) : V(o, "dist", p, 600), V(o, "el", p, 6), az, 0, V(o, "sx", p, 0), V(o, "sy", p, 0));
      const sd = new THREE.Vector3().subVectors(new THREE.Vector3(), E.position).normalize(); E.userData.light(sd, C, t); E.userData.body.rotation.y = t * 0.05;
      Su.userData.light(sd, C, t); Su.userData.body.rotation.y = t * 0.01;
      if (fill) { const f = o.fillK ? KF(o.fillK, t) : 1; fill.geometry.setDrawRange(0, Math.floor(N * f)); const gk = o.glassK ? KF(o.glassK, t) : 0; Su.visible = gk < 0.5; glass.visible = gk >= 0.5; fill.visible = gk >= 0.5; }
      return [S, C];
    };
  };

  // ---- Betelgeuse in place of the Sun. units: AU. star radius from rK (3.6 AU ~ 770 solar radii) ----
  K.betel = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 30); starfield(S, 0.7);
    const orbits = [0.387, 0.723, 1.0, 1.524, 5.203];
    const lines = orbits.map((r) => { const l = orbitLine(r, 0x9aa6b8, 0.55); S.add(l); return l; });
    const pl = orbits.map((r, i) => { const m = marker(i === 2 ? 0x6fa8ff : 0xd8d2c6, i === 4 ? 9 : 6); const a = 1.1 + i * 1.3; m.position.set(r * Math.cos(a), 0, r * Math.sin(a)); S.add(m); return m; });
    const sun = marker(0xfff1d0, 12); S.add(sun);
    const B = starBall({ tint: [1.0, 0.62, 0.45], gain: 1.35, rep: 3, haloS: 2.4, haloOp: 0.22, halo: [1.0, 0.5, 0.25] }); S.add(B);
    return (t, d) => {
      const p = ease(t / d, o.ease), az = V(o, "az", p, 20);
      place(C, new THREE.Vector3(), o.distK ? KF(o.distK, t) : V(o, "dist", p, 22), V(o, "el", p, 38), az, 0, V(o, "sx", p, 0), V(o, "sy", p, 0));
      const rr = o.rK ? KF(o.rK, t) : V(o, "r", p, 3.6); B.scale.setScalar(Math.max(rr, 0.0001)); B.visible = rr > 0.001; B.userData.light(null, C, t); B.userData.body.rotation.y = t * 0.02;
      orbits.forEach((r, i) => { const inside = rr > r; pl[i].visible = !inside; lines[i].material.opacity = inside ? 0.12 : 0.55; });
      sun.visible = rr < 0.02;
      return [S, C];
    };
  };

  // ---- light circling the Earth: n loops over [t0, t0+dur] ----
  K.lightloop = (o) => {
    const S = new THREE.Scene(), C = newCam(30), E = earthPlus(); S.add(E); starfield(S, 0.6);
    const NTR = 420, tp = new Float32Array(NTR * 3), tc = new Float32Array(NTR * 3), ts = new Float32Array(NTR);
    const trail = pointCloud(tp, tc, ts, { flat: true, minS: 0.5 }); S.add(trail);
    const tilt = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.45, 0, 0.2));
    const P = (a) => new THREE.Vector3(1.05 * Math.cos(a), 0, 1.05 * Math.sin(a)).applyQuaternion(tilt);
    return (t, d) => {
      const p = ease(t / d, o.ease), az = V(o, "az", p, 0);
      place(C, new THREE.Vector3(), V(o, "dist", p, 5.2), V(o, "el", p, 14), az, 0, V(o, "sx", p, 0), 0);
      const sd = sunRel(az, -60, 10); E.userData.light(sd, C, t); E.userData.body.rotation.y = 1.5 + t * 0.03;
      const f = clamp((t - (o.t0 || 0.5)) / (o.dur || 3), 0, 1), A = f * (o.n || 7) * Math.PI * 2, on = f > 0 && f < 1 ? 1 : 0;
      const pos = trail.geometry.attributes.position, col = trail.geometry.attributes.color, sz = trail.geometry.attributes.size;
      for (let i = 0; i < NTR; i++) { const u = i / NTR, q = P(Math.max(A - u * 1.6, 0)); pos.setXYZ(i, q.x, q.y, q.z); const k = Math.pow(1 - u, 2) * on; col.setXYZ(i, k, k * 0.96, k * 0.88); sz.setX(i, 3 + 7 * (1 - u)); }
      pos.needsUpdate = col.needsUpdate = sz.needsUpdate = true;
      return [S, C];
    };
  };

  // ---- solar system at true distances, light spreading from the Sun (lightK = radius in AU). units: AU ----
  K.lightsys = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 30); const ST = starfield(S, 0.6);
    const R = [0.387, 0.723, 1, 1.524, 5.203, 9.537, 19.19, 30.07];
    R.forEach((r, i) => { S.add(orbitLine(r, i === 2 ? 0x6fa8ff : 0x7d8899, i === 7 ? 0.6 : 0.4, 512)); const m = marker(i === 2 ? 0x6fa8ff : 0xd8d2c6, 5); const a = 0.6 + i * 0.9; m.position.set(r * Math.cos(a), 0, r * Math.sin(a)); S.add(m); });
    S.add(marker(0xfff1d0, 11));
    const vdir = new THREE.Vector3(Math.cos(-0.9) * Math.cos(0.6), Math.sin(0.6), Math.sin(-0.9) * Math.cos(0.6));
    const voy = marker(0xe4cd92, 8); voy.position.copy(vdir).multiplyScalar(173); S.add(voy);
    const vline = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), vdir.clone().multiplyScalar(173)]), new THREE.LineDashedMaterial({ color: 0xe4cd92, dashSize: 2, gapSize: 2, transparent: true, opacity: 0.45 }));
    vline.computeLineDistances(); vline.frustumCulled = false; S.add(vline);
    const shell = orbitLine(1, 0xfff1d0, 0.85, 512); S.add(shell);
    const shell2 = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshBasicMaterial({ color: 0xfff1d0, transparent: true, opacity: 0.012, depthWrite: false, side: THREE.BackSide })); S.add(shell2);
    return (t, d) => {
      const p = ease(t / d, o.ease), az = V(o, "az", p, 10);
      place(C, new THREE.Vector3(), o.distK ? KF(o.distK, t) : V(o, "dist", p, 6), V(o, "el", p, 50), az, 0, V(o, "sx", p, 0), V(o, "sy", p, 0));
      const lr = o.lightK ? KF(o.lightK, t) : 0; shell.scale.setScalar(Math.max(lr, 1e-3)); shell2.scale.setScalar(Math.max(lr, 1e-3)); shell.visible = shell2.visible = lr > 0.01;
      voy.visible = vline.visible = !!o.voy;
      follow(ST, C); return [S, C];
    };
  };

  // ---- Milky Way particle model. units: 1000 light years; Sun at r = 26 ----
  let GAL = null;
  function galaxyCloud() {
    if (GAL) return GAL;
    const r = rnd(42), pos = [], col = [], sz = [];
    const warm = [1.0, 0.86, 0.68], white = [0.95, 0.95, 1.0], blue = [0.66, 0.76, 1.0], hii = [1.0, 0.62, 0.66];
    const push = (x, y, z, c, s, k) => { pos.push(x, y, z); col.push(c[0] * k, c[1] * k, c[2] * k); sz.push(s); };
    for (let i = 0; i < 26000; i++) { const x = gauss(r) * 5.5, z = gauss(r) * 1.8, y = gauss(r) * 1.1, a = 0.45; push(x * Math.cos(a) - z * Math.sin(a), y, x * Math.sin(a) + z * Math.cos(a), warm, 0.9 + r() * 1.2, 0.32 + 0.3 * r()); }
    const arms = [[0, 1.0], [Math.PI, 1.0], [Math.PI / 2, 0.55], [Math.PI * 1.5, 0.55]], kk = 1 / Math.tan(12.5 * D2R);
    for (const [ph0, wt] of arms) for (let i = 0; i < 52000 * wt; i++) {
      const rr = 4 + Math.pow(r(), 0.85) * 48, th = ph0 + Math.log(rr / 4) * kk * 0.98 + gauss(r) * 0.11, sp = 0.9 + rr * 0.04;
      const c = r() < 0.05 ? hii : (r() < 0.5 ? blue : white); push(rr * Math.cos(th) + gauss(r) * sp, gauss(r) * 0.35, rr * Math.sin(th) + gauss(r) * sp, c, 0.8 + r() * 1.4, (0.75 + 0.7 * r()) * Math.exp(-rr / 70));
    }
    for (let i = 0; i < 50000; i++) { const rr = -Math.log(r() + 1e-6) * 11; if (rr > 55) continue; const th = r() * Math.PI * 2; push(rr * Math.cos(th), gauss(r) * 0.5, rr * Math.sin(th), r() < 0.5 ? warm : white, 0.6 + r(), 0.22 + 0.25 * r()); }
    GAL = { pos, col, sz }; return GAL;
  }
  const SUN_GAL = new THREE.Vector3(26 * Math.cos(2.6), 0.05, 26 * Math.sin(2.6));
  K.galaxy = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 35); const ST = starfield(S, 0.5);
    const g = galaxyCloud(), G = new THREE.Group(); S.add(G);
    const cloud = pointCloud(g.pos, g.col, g.sz, { scale: o.ps || 150, minS: 0.9, op: 0.55 }); G.add(cloud);
    if (o.art) {
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(o.artSize || 110, o.artSize || 110), new THREE.MeshBasicMaterial({ map: tex(o.art), transparent: true, opacity: o.artOp || 0.85, blending: THREE.AdditiveBlending, depthWrite: false }));
      pl.rotation.x = -Math.PI / 2; pl.rotation.z = o.artRot || 0; G.add(pl);
    }
    const you = marker(0xe4cd92, 13); you.position.copy(SUN_GAL); G.add(you);
    if (o.marks) { // scattered wanderers: small warm dots through the disk (illustrative)
      const r = rnd(321), mp = [], mc = [], ms = [];
      for (let i = 0; i < o.marks; i++) { const rr = 3 + Math.pow(r(), 0.7) * 46, th = r() * Math.PI * 2; mp.push(rr * Math.cos(th), gauss(r) * 1.2, rr * Math.sin(th)); mc.push(1.0, 0.5, 0.36); ms.push(5.0); }
      G.add(pointCloud(mp, mc, ms, { flat: true, minS: 1, op: 0.9, normal: true }));
    }
    let ring = null; if (o.lap) { ring = orbitLine(26, 0xe4cd92, 0.5, 512); ring.rotation.y = -2.6; G.add(ring); }
    return (t, d) => {
      const p = ease(t / d, o.ease), az = V(o, "az", p, 0);
      const tgt = SUN_GAL.clone().multiplyScalar(V(o, "toSun", p, 0));
      place(C, tgt, o.distK ? KF(o.distK, t) : V(o, "dist", p, 140), V(o, "el", p, 50), az, 0, V(o, "sx", p, 0), V(o, "sy", p, 0));
      G.rotation.y = -(o.spin !== undefined ? o.spin : 0.4) * D2R * t;
      cloud.material.uniforms.op.value = FADE(o, t) * (o.op || 0.55);
      you.visible = !!o.you;
      if (ring) { const f = o.lapK ? KF(o.lapK, t) : 1; ring.geometry.setDrawRange(0, Math.floor(513 * f)); const a = 2.6 + f * Math.PI * 2; you.position.set(26 * Math.cos(a), 0.05, 26 * Math.sin(a)); }
      follow(ST, C); return [S, C];
    };
  };

  // ---- Local Group: Milky Way + Andromeda + dwarfs. units: 1000 ly ----
  K.localgroup = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 35); const ST = starfield(S, 0.5);
    const g = galaxyCloud(); const mw = pointCloud(g.pos, g.col, g.sz, { scale: 2000, minS: 0.9, op: 0.16 }); mw.rotation.x = 0.4; S.add(mw);
    const anPos = new THREE.Vector3(2500, 300, -400);
    const ag = pointCloud(g.pos, g.col, g.sz.map((x) => x * 1.2), { scale: 2000, minS: 0.9, op: 0.16 }); ag.scale.setScalar(1.4); ag.rotation.set(1.2, 0.3, 0.5); ag.position.copy(anPos); S.add(ag);
    const r = rnd(77), dp = [], dc = [], ds = [];
    for (let i = 0; i < 70; i++) { const near = r() < 0.5 ? new THREE.Vector3() : anPos; dp.push(near.x + gauss(r) * 300, near.y + gauss(r) * 200, near.z + gauss(r) * 300); dc.push(0.85, 0.82, 0.75); ds.push(8 + r() * 18); }
    S.add(pointCloud(dp, dc, ds, { scale: 400, minS: 1.2, op: 0.7 }));
    const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(), anPos.clone()]), new THREE.LineDashedMaterial({ color: 0xe4cd92, dashSize: 40, gapSize: 40, transparent: true, opacity: 0 }));
    line.computeLineDistances(); line.frustumCulled = false; S.add(line);
    return (t, d) => {
      const p = ease(t / d, o.ease), tgt = new THREE.Vector3().lerpVectors(new THREE.Vector3(), anPos, V(o, "mid", p, 0.5));
      place(C, tgt, o.distK ? KF(o.distK, t) : V(o, "dist", p, 5000), V(o, "el", p, 25), V(o, "az", p, 0), 0, V(o, "sx", p, 0), V(o, "sy", p, 0));
      line.material.opacity = 0.5 * (o.lineK ? KF(o.lineK, t) : 0); mw.rotation.y = t * 0.004; ag.rotation.z = 0.5 + t * 0.003;
      follow(ST, C); return [S, C];
    };
  };

  // ---- cosmic web; the Laniakea basin outlined by hlK. units: million ly ----
  let WEB = null;
  function webCloud() {
    if (WEB) return WEB;
    const r = rnd(99), nodes = [];
    for (let i = 0; i < 90; i++) nodes.push(new THREE.Vector3((r() - 0.5) * 2400, (r() - 0.5) * 1400, (r() - 0.5) * 2400));
    nodes[0].set(0, 0, 0);
    const pos = [], col = [], sz = [];
    const push = (v, k, s) => { pos.push(v.x, v.y, v.z); const c = 0.55 + 0.45 * r(); col.push(0.8 * k * c, 0.83 * k * c, 0.95 * k); sz.push(s); };
    nodes.forEach((a, i) => {
      const near = nodes.map((b, j) => [a.distanceTo(b), j]).filter((x) => x[1] !== i).sort((x, y) => x[0] - y[0]).slice(0, 3);
      for (const [dd, j] of near) {
        const b = nodes[j], n = Math.floor(dd * 1.6);
        for (let q = 0; q < n; q++) { const u = r(), v = new THREE.Vector3().lerpVectors(a, b, u), sp = 10 + 22 * Math.sin(u * Math.PI); v.x += gauss(r) * sp; v.y += gauss(r) * sp; v.z += gauss(r) * sp; push(v, 0.75, 3 + r() * 5); }
      }
      for (let q = 0; q < 900; q++) push(a.clone().add(new THREE.Vector3(gauss(r), gauss(r), gauss(r)).multiplyScalar(26)), 1.05, 4 + r() * 6);
    });
    WEB = { pos, col, sz }; return WEB;
  }
  K.web = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 40), wb = webCloud(); const ST = starfield(S, 0.4);
    S.add(pointCloud(wb.pos, wb.col, wb.sz, { scale: 600, minS: 0.9, op: 0.5 }));
    const hl = orbitLine(250, 0xe4cd92, 0, 256); S.add(hl);
    const you = marker(0xe4cd92, 9); S.add(you);
    return (t, d) => {
      const p = ease(t / d, o.ease);
      place(C, new THREE.Vector3(), o.distK ? KF(o.distK, t) : V(o, "dist", p, 2400), V(o, "el", p, 20), V(o, "az", p, 0) + t * (o.spin || 0.6), 0, V(o, "sx", p, 0), V(o, "sy", p, 0));
      hl.material.opacity = 0.6 * (o.hlK ? KF(o.hlK, t) : 0); hl.quaternion.copy(C.quaternion); hl.rotateX(Math.PI / 2); you.visible = !!o.you;
      follow(ST, C); return [S, C];
    };
  };

  // ---- a tiny patch of sky becomes a deep field image. patch is 1 x 1 at z = -100; zK = camera distance from the patch ----
  K.deepfield = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 40); const SF = starfield(S, 0.9);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex(o.img || "assets/img/hudf.jpg"), transparent: true, opacity: 1, depthWrite: false }));
    pl.position.set(0, 0, -100); S.add(pl);
    const fr = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints([[-0.52, -0.52], [0.52, -0.52], [0.52, 0.52], [-0.52, 0.52]].map(([x, y]) => new THREE.Vector3(x, y, -99.9))), new THREE.LineBasicMaterial({ color: 0xe4cd92, transparent: true, opacity: 0.9 }));
    fr.frustumCulled = false; S.add(fr);
    return (t, d) => {
      const z = o.zK ? KF(o.zK, t) : V(o, "z", ease(t / d, o.ease), 2);
      C.position.set(0, 0, -100 + z); C.up.set(0, 1, 0); C.lookAt(0, 0, -100); C.clearViewOffset();
      SF.position.copy(C.position); SF.rotation.set(t * 0.006, t * 0.012, 0);
      pl.material.opacity = o.imgK ? KF(o.imgK, t) : 1; fr.material.opacity = 0.9 * (o.frameK ? KF(o.frameK, t) : 1);
      return [S, C];
    };
  };

  // ---- observable universe: galaxies in a sphere, the CMB as its wall, more universe beyond. units: billion ly; radius 46.5 ----
  K.observable = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 40); const ST = starfield(S, 0.2);
    const r = rnd(5), N = 120000, pos = new Float32Array(N * 3), col = new Float32Array(N * 3), sz = new Float32Array(N);
    for (let i = 0; i < N; i++) { let x, y, z; do { x = r() * 2 - 1; y = r() * 2 - 1; z = r() * 2 - 1; } while (x * x + y * y + z * z > 1); const k = 0.4 + 0.6 * r(); pos.set([x * 46, y * 46, z * 46], i * 3); col.set([0.85 * k, 0.86 * k, 0.95 * k], i * 3); sz[i] = 1.5 + r() * 2; }
    const gal = pointCloud(pos, col, sz, { scale: 110, minS: 0.9, op: 0.6 }); S.add(gal);
    const NB = 90000, bp = new Float32Array(NB * 3), bc = new Float32Array(NB * 3), bs = new Float32Array(NB);
    for (let i = 0; i < NB; i++) { const u = r() * 2 - 1, th = r() * Math.PI * 2, s2 = Math.sqrt(1 - u * u), rr = 47 + Math.pow(r(), 0.6) * 120; bp.set([rr * s2 * Math.cos(th), rr * u, rr * s2 * Math.sin(th)], i * 3); const k = 0.3 + 0.5 * r(); bc.set([0.7 * k, 0.72 * k, 0.8 * k], i * 3); bs[i] = 1.5 + r() * 2; }
    const beyond = pointCloud(bp, bc, bs, { scale: 70, minS: 0.9, op: 0 }); S.add(beyond);
    const cmb = new THREE.Mesh(new THREE.SphereGeometry(46.5, 128, 96), new THREE.MeshBasicMaterial({ map: tex(o.cmb || "assets/img/cmb_sphere.jpg"), transparent: true, opacity: 0.55, depthWrite: false, side: THREE.DoubleSide }));
    S.add(cmb);
    const you = marker(0xe4cd92, 9); S.add(you);
    return (t, d) => {
      const p = ease(t / d, o.ease);
      place(C, new THREE.Vector3(), o.distK ? KF(o.distK, t) : V(o, "dist", p, 140), V(o, "el", p, 15), V(o, "az", p, 0) + t * (o.spin || 1.2), 0, V(o, "sx", p, 0), V(o, "sy", p, 0));
      cmb.material.opacity = 0.34 * (o.cmbK ? KF(o.cmbK, t) : 1); beyond.material.uniforms.op.value = 0.3 * (o.beyondK ? KF(o.beyondK, t) : 0);
      gal.material.uniforms.op.value = 0.6 * (o.galK ? KF(o.galK, t) : 1); you.visible = o.you !== false;
      follow(ST, C); return [S, C];
    };
  };

  // ---- Voyager: NASA model from assets/js/voyager_mesh.js if present, else a simple stand-in ----
  function voyagerModel() {
    const g = new THREE.Group(), VM = window.VOYAGER_MESH;
    if (VM) {
      const dec = (b64, T) => { const bin = atob(b64), u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new T(u.buffer); };
      for (const part of VM.parts) {
        const geo = new THREE.BufferGeometry();
        geo.setAttribute("position", new THREE.BufferAttribute(dec(part.pos, Float32Array), 3));
        if (part.nrm) geo.setAttribute("normal", new THREE.BufferAttribute(dec(part.nrm, Float32Array), 3));
        if (part.idx) geo.setIndex(new THREE.BufferAttribute(dec(part.idx, Uint32Array), 1));
        if (!part.nrm) geo.computeVertexNormals();
        g.add(new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: new THREE.Color(...part.color), roughness: part.rough !== undefined ? part.rough : 0.55, metalness: part.metal || 0.2, side: THREE.DoubleSide })));
      }
      const box = new THREE.Box3().setFromObject(g), sz = box.getSize(new THREE.Vector3()), cen = box.getCenter(new THREE.Vector3());
      const inner = new THREE.Group(); while (g.children.length) inner.add(g.children[0]); inner.position.copy(cen).multiplyScalar(-1);
      g.add(inner); g.scale.setScalar(6 / Math.max(sz.x, sz.y, sz.z)); return g;
    }
    const white = new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: 0.45 }), dark = new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.6, metalness: 0.4 }), gold = new THREE.MeshStandardMaterial({ color: 0xb8913a, roughness: 0.35, metalness: 0.7 });
    const dish = new THREE.Mesh(new THREE.SphereGeometry(2.4, 64, 16, 0, Math.PI * 2, 0, 0.42), white); dish.rotation.x = Math.PI; dish.position.y = 2.6; g.add(dish);
    const bus = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.6, 10), dark); bus.position.y = 0.5; g.add(bus);
    const rec = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 0.03, 32), gold); rec.rotation.z = Math.PI / 2; rec.position.set(1.02, 0.5, 0); g.add(rec);
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 13, 6), dark); boom.rotation.z = Math.PI / 2; boom.position.set(-6.5, 0.6, 0.6); g.add(boom);
    return g;
  }
  K.voyager = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 30); starfield(S, 0.9);
    const V1 = voyagerModel(); S.add(V1);
    const sunPt = marker(0xfff1d0, 10); sunPt.position.set(-300, 40, -900); S.add(sunPt);
    const L = new THREE.DirectionalLight(0xfff4e6, 3.2); S.add(L); const L2 = new THREE.DirectionalLight(0x9fb3d6, 0.5); S.add(L2); S.add(new THREE.AmbientLight(0x8090b0, 0.35));
    return (t, d) => {
      const p = ease(t / d, o.ease), az = V(o, "az", p, 30) * D2R, dist = o.distK ? KF(o.distK, t) : V(o, "dist", p, 14);
      C.position.set(dist * Math.sin(az), V(o, "cy", p, 1.5), dist * Math.cos(az)); C.up.set(0, 1, 0); C.lookAt(0, 0, 0);
      const sx = V(o, "sx", p, 0); if (sx) C.setViewOffset(W, H, -sx, 0, W, H); else C.clearViewOffset();
      V1.rotation.set(o.pitch || 0.15, (o.yaw !== undefined ? o.yaw : -0.6) + t * 0.01, 0.05);
      L.position.set(C.position.x * 0.4 - 8, 6, C.position.z * 0.4 + 4); L2.position.set(-C.position.x, -3, -C.position.z);
      return [S, C];
    };
  };
})();
