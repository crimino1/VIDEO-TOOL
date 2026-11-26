/* Group C kinds (Cygnus X-1 and the Milky Way): xray, cygx1, galcenter, bhslow.
   Every frame is a pure function of t (ft = o.T0 + t). Black hole + disk ported from strings/k_cosmos.js 'blackhole'. */
(function () {
  const { THREE, M, W, H, seg, smooth, smoother, lerp, clamp, rnd, tex, stage, cam, orbit, canvasTex, glowSprite } = L3;
  const TAU = Math.PI * 2, D2R = Math.PI / 180;
  const once = (f) => { let v; return () => v || (v = f()); };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // orbit camera; sx/sy shift the subject right/up by a fraction of the frame
  function aim(C, tx, ty, tz, dist, az, el, sx, sy) {
    orbit(C, tx, ty, tz, dist, az, el);
    C.setViewOffset(W, H, -(sx || 0) * W, (sy || 0) * H, W, H);
  }
  const shift = (C, sx, sy) => C.setViewOffset(W, H, -(sx || 0) * W, (sy || 0) * H, W, H);
  const ez = (p) => 0.5 * clamp(p, 0, 1) + 0.5 * smooth(p); // eased, but already moving at p = 0 (no frozen start)
  const fadeIO = (ft, a, b, f) => seg(ft, a, a + (f || 0.5)) * (1 - seg(ft, b - (f || 0.5), b));
  const dotTex = once(() => canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  const ADD = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending };
  function pointsMat(o) { return new THREE.PointsMaterial(Object.assign({ map: dotTex(), sizeAttenuation: false, size: 3 }, ADD, o)); }
  // per-point size: geometry needs a float attribute "psize" (multiplies material.size)
  function sizedPoints(m) { m.onBeforeCompile = (s) => { s.vertexShader = "attribute float psize;\n" + s.vertexShader.replace("gl_PointSize = size;", "gl_PointSize = size * psize;"); }; return m; }
  function geoOf(arr, n) { const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(arr || new Float32Array(n * 3), 3)); return g; }
  function lineLoop(n, fn, mat) { const a = new Float32Array((n + 1) * 3); for (let i = 0; i <= n; i++) { const p = fn(i / n); a.set([p[0], p[1], p[2]], i * 3); } return new THREE.Line(geoOf(a), mat); }
  // black quad on the camera for fades (scene must contain the camera)
  function fader(S, C) { const q = new THREE.Mesh(new THREE.PlaneGeometry(6, 6), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: 0, depthTest: false, depthWrite: false })); q.position.z = -1; q.renderOrder = 999; C.add(q); S.add(C); return q.material; }

  // ---------- self-lit star surface: luminance of the sun texture, tinted, limb-darkened ----------
  function starMat(core, edge, gain) {
    return new THREE.ShaderMaterial({
      uniforms: { map: { value: tex("2k_sun.jpg") }, tint: { value: new THREE.Color(core) }, edge: { value: new THREE.Color(edge) }, gain: { value: gain || 1 } },
      vertexShader: `varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vUv=uv; vec4 mv=modelViewMatrix*vec4(position,1.0); vN=normalize(normalMatrix*normal); vV=normalize(-mv.xyz); gl_Position=projectionMatrix*mv; }`,
      fragmentShader: `uniform sampler2D map; uniform vec3 tint, edge; uniform float gain; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
void main(){ vec2 su=vUv*vec2(5.0,2.5); float l=0.4*dot(texture2D(map,vUv).rgb, vec3(0.3,0.59,0.11))+0.6*dot(textureGrad(map,fract(su),dFdx(su),dFdy(su)).rgb, vec3(0.3,0.59,0.11)); float mu=clamp(dot(normalize(vN),normalize(vV)),0.0,1.0);
 float limb=0.3+0.7*pow(mu,0.8); vec3 c=mix(edge, tint, pow(mu,0.6)); float gran=1.0+0.4*(l-0.4);
 gl_FragColor=vec4(c*gain*limb*gran,1.0);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,
    });
  }
  // corona: bright just outside the limb, soft long tail (limb at 1/3 of the sprite radius); dithered against banding
  const coronaTex = once(() => canvasTex(256, 256, (g, w, h) => {
    const id = g.createImageData(w, h), r = rnd(4);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const q = Math.hypot(x - w / 2 + 0.5, y - h / 2 + 0.5) / (w / 2), R = q * 3, v = R < 1 ? 1 : 0.6 * Math.exp(-(R - 1) / 0.12) + 0.3 * Math.exp(-(R - 1) / 0.6);
      const a = clamp(v * (1 - smooth((q - 0.9) / 0.1)) * 255 + (r() - 0.5) * 2, 0, 255), i = (y * w + x) * 4;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = 255; id.data[i + 3] = a;
    }
    g.putImageData(id, 0, 0);
  }));
  // wide soft glow, dithered so the long faint tail does not band
  const wideTex = once(() => canvasTex(256, 256, (g, w, h) => {
    const id = g.createImageData(w, h), r = rnd(6);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const q = Math.min(1, Math.hypot(x - w / 2 + 0.5, y - h / 2 + 0.5) / (w / 2)), i = (y * w + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = 255; id.data[i + 3] = clamp(255 * Math.pow(1 - q, 3) + (r() - 0.5) * 3, 0, 255); }
    g.putImageData(id, 0, 0);
  }));
  function corona(rs, color, op) { const s = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map: coronaTex(), color, opacity: op }, ADD))); s.scale.setScalar(rs * 6); return s; }
  const BLUE = [0xd2e0ff, 0x93aaee], WARM = [0xfff1dc, 0xf0a060];
  function blueStar(rs, gain) {
    const G = new THREE.Group(), mat = starMat(BLUE[0], BLUE[1], gain || 1.0);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(rs, 96, 64), mat);
    const halo = corona(rs, 0xaec6ff, 0.75), halo2 = new THREE.Sprite(new THREE.SpriteMaterial(Object.assign({ map: wideTex(), color: 0x9db6ff, opacity: 0.07 }, ADD))); halo2.scale.setScalar(rs * 8);
    G.add(ball, halo, halo2); G.userData = { ball, mat, halo }; return G;
  }

  // ---------- black hole + accretion disk (port of strings 'blackhole', with Keplerian shear + physical Doppler side) ----------
  function polarRing(rin, rout, ts, ps) { const g = new THREE.RingGeometry(rin, rout, ts, ps), uv = g.attributes.uv; let k = 0; for (let j = 0; j <= ps; j++) for (let i = 0; i <= ts; i++) uv.setXY(k++, i / ts, j / ps); return g; }
  const diskTex = once(() => {
    const w = 1024, h = 256, t = canvasTex(w, h, (g) => {
      const id = g.createImageData(w, h), d = id.data, r = rnd(77), band = [];
      for (let i = 0; i < h; i++) band.push(r()); for (let k = 0; k < 7; k++) for (let i = 1; i < h - 1; i++) band[i] = (band[i - 1] + band[i] + band[i + 1]) / 3;
      const ph = [r() * 6, r() * 6, r() * 6];
      for (let y = 0; y < h; y++) {
        const v = 1 - (y + 0.5) / h, prof = smooth(v / 0.05) * Math.pow(1 - v, 1.7), b = 0.75 + 0.6 * (band[y] - 0.45);
        const c1 = smooth(v / 0.4), c2 = smooth((v - 0.35) / 0.6);
        const R = lerp(lerp(255, 226, c1), 120, c2), G = lerp(lerp(222, 122, c1), 46, c2), B = lerp(lerp(176, 54, c1), 20, c2);
        for (let x = 0; x < w; x++) {
          const u = x / w * TAU, s = 0.88 + 0.08 * Math.sin(5 * u + v * 30 + ph[0]) + 0.05 * Math.sin(13 * u - v * 50 + ph[1]) + 0.03 * Math.sin(31 * u + v * 90 + ph[2]);
          const i = (y * w + x) * 4; d[i] = R; d[i + 1] = G; d[i + 2] = B; d[i + 3] = clamp(255 * prof * b * s, 0, 255);
        }
      }
      g.putImageData(id, 0, 0);
    });
    t.wrapS = THREE.RepeatWrapping; return t;
  });
  const RIN = 1.3, ROUT = 5.4;
  function blackHole() {
    const G = new THREE.Group();
    G.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshBasicMaterial({ color: 0x000000 })));
    const add = Object.assign({ side: THREE.DoubleSide }, ADD);
    const TS = 256, PS = 24, dg = polarRing(RIN, ROUT, TS, PS); dg.rotateX(-Math.PI / 2); dg.setAttribute("color", new THREE.BufferAttribute(new Float32Array(dg.attributes.position.count * 3).fill(1), 3));
    const u0 = Float32Array.from({ length: dg.attributes.uv.count }, (_, i) => dg.attributes.uv.getX(i));
    const disk = new THREE.Mesh(dg, new THREE.MeshBasicMaterial(Object.assign({ map: diskTex(), vertexColors: true, opacity: 0.95 }, add)));
    const lg = polarRing(1.03, 1.75, 256, 8), lc = new Float32Array(lg.attributes.position.count * 3), lp = lg.attributes.position;
    for (let i = 0; i < lp.count; i++) { const s = lp.getY(i) / Math.hypot(lp.getX(i), lp.getY(i)), w = Math.pow(Math.abs(s), 1.6) * (s > 0 ? 1 : 0.4); lc.set([w, w, w], i * 3); }
    lg.setAttribute("color", new THREE.BufferAttribute(lc, 3));
    const lens = new THREE.Mesh(lg, new THREE.MeshBasicMaterial(Object.assign({ map: diskTex(), vertexColors: true, opacity: 0.7 }, add)));
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.016, 256, 1), new THREE.MeshBasicMaterial(Object.assign({ color: 0xffd8b4, opacity: 0.4 }, add)));
    const halo = glowSprite(0xffc890, 3.6, 0.12);
    G.add(disk, lens, ring, halo);
    const bill = [lens, ring], cd = new THREE.Vector3();
    // k: disk light (0 = bare hole), kb: extra brightness, ringK: photon ring, spin: base turn rate, shear: extra inner speed (per shot second)
    G.userData.tick = (ft, C, k, o) => {
      o = o || {};
      const kb = o.kb || 1, spin = o.spin || 0.025, shear = o.shear || 0, ts = o.t || 0, ringK = o.ringK !== undefined ? o.ringK : 0.2 + 0.8 * k;
      const dc = C.position.length(), fs = dc / Math.sqrt(dc * dc - 1); bill.forEach((m) => { m.quaternion.copy(C.quaternion); m.scale.setScalar(fs); });
      cd.copy(C.position).normalize();
      const p = dg.attributes.position, c = dg.attributes.color, uv = dg.attributes.uv;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z), b = (0.72 + 0.42 * (z * cd.x - x * cd.z) / r) * kb;
        c.setXYZ(i, b, b, b); uv.setX(i, u0[i] - ft * spin - ts * shear * (Math.pow(RIN / r, 1.5) - 0.2));
      }
      c.needsUpdate = uv.needsUpdate = true;
      disk.material.opacity = 0.85 * Math.min(k, 1); lens.material.opacity = Math.min(k, 1) * Math.min(kb, 1.3);
      ring.material.opacity = 0.4 * ringK; halo.material.opacity = 0.12 * k * kb;
    };
    return G;
  }

  // ======================================================================= BHSLOW (port of strings blackhole/slow)
  LABK.bhslow = (o) => {
    const C = cam(32), S = stage("space", { seed: 5, stars: 6000 }), bh = blackHole(); S.add(bh);
    const end = o.mode === "end";
    return (t, d) => {
      const ft = o.T0 + t, p = t / d;
      // steady drift (no ease-in): the disk is axisymmetric, so dolly + tilt carry the motion, not the orbit
      if (end) aim(C, 0, 0, 0, lerp(17.8, 14.0, p), lerp(-40, -8, p), lerp(7, 17, p), 0.17, 0.07);
      else aim(C, 0, 0, 0, lerp(18.6, 14.0, p), lerp(18, 50, p), lerp(25, 11, p), 0.17, 0.07);
      bh.userData.tick(ft, C, 1, { t, spin: 0.1, shear: 0.12 });
      return [S, C, []];
    };
  };

  // ======================================================================= CYGNUS constellation (real positions)
  const CYG = [[20.690, 45.28, 1.25], [20.370, 40.26, 2.23], [19.512, 27.96, 3.05], [20.770, 33.97, 2.48], [19.750, 45.13, 2.87], [19.938, 35.08, 3.89], [21.216, 30.23, 3.21], [19.495, 51.73, 3.76], [19.285, 53.37, 3.80]];
  // Deneb, Sadr, Albireo, Gienah, delta, eta, zeta, iota, kappa
  const CYG_L = [[0, 1], [1, 5], [5, 2], [4, 1], [1, 3], [3, 6], [4, 7], [7, 8]];
  const CX1 = [19.973, 35.20]; // Cygnus X-1, on the Swan's neck next to eta Cygni
  const skyXY = (ra, dec) => [-(ra - CX1[0]) * 15 * Math.cos(CX1[1] * D2R), dec - CX1[1]]; // degrees, east left, centred on Cyg X-1
  const CYG_C = [-3.4, 5.5]; // centre of the figure (degrees from Cyg X-1)
  // u = world units per degree; group lies in its XY plane (source at the origin)
  function cygnus(u, seed) {
    const G = new THREE.Group(), r = rnd(seed || 41), mats = [];
    const bk = [[], [], []];
    CYG.forEach(([ra, dec, m]) => { const [x, y] = skyXY(ra, dec); bk[m < 2.6 ? 0 : m < 3.4 ? 1 : 2].push(x * u, y * u, 0); });
    [21, 16, 12.5].forEach((s, i) => { const m = pointsMat({ size: s, color: 0xf6f3ec }); mats.push(m); G.add(new THREE.Points(geoOf(new Float32Array(bk[i])), m)); });
    const fp = [], fc = [];
    for (let i = 0; i < 900; i++) { fp.push((CYG_C[0] + (r() * 2 - 1) * 26) * u, (CYG_C[1] + (r() * 2 - 1) * 22) * u, 0); const b = 0.18 + 0.7 * Math.pow(r(), 3), w = r(); fc.push(b * (0.9 + 0.1 * w), b * 0.95, b * (0.88 + 0.12 * (1 - w))); }
    const fg = geoOf(new Float32Array(fp)); fg.setAttribute("color", new THREE.Float32BufferAttribute(fc, 3));
    const field = new THREE.Points(fg, pointsMat({ size: 3.2, vertexColors: true })); G.add(field);
    const lp = [];
    CYG_L.forEach(([a, b]) => { const A = skyXY(CYG[a][0], CYG[a][1]), B = skyXY(CYG[b][0], CYG[b][1]), dx = B[0] - A[0], dy = B[1] - A[1], g = 0.9 / Math.hypot(dx, dy); lp.push((A[0] + dx * g) * u, (A[1] + dy * g) * u, 0, (B[0] - dx * g) * u, (B[1] - dy * g) * u, 0); });
    const lines = new THREE.LineSegments(geoOf(new Float32Array(lp)), M.line(0xb9c7dc, 0.38)); G.add(lines);
    G.userData = { lines, mats, field, deneb: skyXY(CYG[0][0], CYG[0][1]).map((v) => v * u) };
    return G;
  }
  // faint Milky Way band through Cygnus (runs along the Swan's body, split by the dark Cygnus Rift); returns a mesh in sky-group units
  const bandTex = once(() => canvasTex(1024, 256, (g, w, h) => {
    const id = g.createImageData(w, h), f = fbm3(71), f2 = fbm3(72), r = rnd(73);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const X = x / w, Y = (y + 0.5) / h - 0.5, cl = f(X * 14, Y * 8 + 3), fine = f2(X * 40, Y * 24);
      const glow = Math.exp(-Math.pow(Y / (0.26 + 0.1 * (cl - 0.5)), 2)) * Math.pow(cl, 2.2) * 2.2 * (0.7 + 0.6 * fine);
      const rift = smooth((f(X * 7 + 9, Y * 5 + 1.7) - 0.47 - 3 * Math.abs(Y - 0.03 - 0.06 * (f(X * 3, 5) - 0.5))) / 0.12) * smooth((X - 0.15) / 0.25);
      const a = glow * (1 - 0.8 * rift) * smooth(X / 0.3) * smooth((1 - X) / 0.3), i = (y * w + x) * 4;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = 255; id.data[i + 3] = clamp(a * 180 + (r() - 0.5) * 3, 0, 255);
    }
    g.putImageData(id, 0, 0);
  }));
  function milkyBand(u, op) {
    const A = skyXY(CYG[2][0], CYG[2][1]), B = skyXY(CYG[0][0], CYG[0][1]); // Albireo -> Deneb
    const m = new THREE.Mesh(new THREE.PlaneGeometry(90 * u, 34 * u), new THREE.MeshBasicMaterial(Object.assign({ map: bandTex(), color: 0xd9d2c4, opacity: op }, ADD)));
    m.position.set((A[0] + B[0]) / 2 * u, (A[1] + B[1]) / 2 * u, -1); m.rotation.z = Math.atan2(B[1] - A[1], B[0] - A[0]); m.renderOrder = -1;
    return m;
  }
  // place a sky group at angles (yaw right, pitch up, degrees) from the camera's forward axis f, facing the camera
  function skyPlace(G, from, f, yaw, pitch, dist) {
    const fw = f.clone().normalize(), rt = new THREE.Vector3().crossVectors(fw, V(0, 1, 0)).normalize(), up = new THREE.Vector3().crossVectors(rt, fw);
    const dir = fw.clone().add(rt.multiplyScalar(Math.tan(yaw * D2R))).add(up.multiplyScalar(Math.tan(pitch * D2R))).normalize();
    G.position.copy(from).addScaledVector(dir, dist); G.lookAt(from);
  }

  // ======================================================================= XRAY (Earth's limb, X-rays stopped by the air)
  function atmosphere(R, Hs, cen, sun, k) {
    return new THREE.Mesh(new THREE.SphereGeometry(R + Hs * 8, 384, 192), new THREE.ShaderMaterial(Object.assign({
      uniforms: { cen: { value: cen }, sun: { value: sun }, col: { value: new THREE.Color(0x8fb4ff) }, R: { value: R }, Hs: { value: Hs }, k: { value: k } },
      vertexShader: "varying vec3 vP; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vP=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }",
      fragmentShader: "uniform vec3 cen, sun, col; uniform float R, Hs, k; varying vec3 vP;\nvoid main(){ vec3 d=normalize(vP-cameraPosition); float b=dot(cen-cameraPosition,d); vec3 cp=cameraPosition+d*b; float h=length(cp-cen)-R;\n float g = h>0.0 ? exp(-h/Hs) : 0.4*exp(h/(Hs*4.0));\n float lit=smoothstep(-0.32,0.3,dot(normalize(cp-cen),sun));\n vec3 c=mix(col, vec3(1.0,0.98,0.95), 0.3*exp(-max(h,0.0)/(Hs*0.6)));\n gl_FragColor=vec4(c*g*lit*k,1.0);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}",
    }, ADD)));
  }
  const streakTex = once(() => canvasTex(256, 16, (g, w, h) => {
    const id = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const a = Math.pow(x / w, 2.2) * Math.exp(-Math.pow((y - h / 2 + 0.5) / (h * 0.22), 2)); const i = (y * w + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = 255; id.data[i + 3] = 255 * a; }
    g.putImageData(id, 0, 0);
  }));
  function rocket() {
    const G = new THREE.Group(), white = M.paint(0xdedad2, 0.45), dark = M.paint(0x2b2d31, 0.5), metal = M.steel();
    [white, dark, metal].forEach((m) => (m.envMapIntensity = 0.25));
    const add = (geo, mat, y) => { const m = new THREE.Mesh(geo, mat); m.position.y = y; G.add(m); return m; };
    add(new THREE.CylinderGeometry(0.034, 0.034, 1.1, 32), white, 0);
    add(new THREE.ConeGeometry(0.034, 0.24, 32), white, 0.67);
    add(new THREE.CylinderGeometry(0.0345, 0.0345, 0.07, 32), dark, 0.28);
    add(new THREE.CylinderGeometry(0.0345, 0.0345, 0.04, 32), dark, -0.2);
    add(new THREE.CylinderGeometry(0.022, 0.03, 0.05, 24), metal, -0.575);
    for (let i = 0; i < 4; i++) { const f = add(new THREE.BoxGeometry(0.005, 0.17, 0.085), white, -0.47); const a = i * TAU / 4; f.position.x = Math.cos(a) * 0.075; f.position.z = Math.sin(a) * 0.075; f.rotation.y = -a; }
    const flame = glowSprite(0xffd9b0, 0.3, 0.6); flame.position.y = -0.66; flame.scale.set(0.1, 0.3, 1); G.add(flame);
    G.userData.flame = flame; return G;
  }
  LABK.xray = (o) => {
    const night = o.mode === "cygnus", C = cam(night ? 34 : 30);
    const S = stage("space", { seed: 21, stars: 6000, hemi: night ? 0.05 : 0.04, rim: 0 });
    const R = 30, cen = V(0, -R, 0);
    const sun = (night ? V(0.25, -0.06, -1) : V(-1, 0.32, -0.25)).normalize();
    const key = S.userData.key; key.position.copy(sun).multiplyScalar(40); key.intensity = night ? 0.9 : 3.0;
    const E = new THREE.Group(); E.position.copy(cen); S.add(E);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(R, 384, 192), new THREE.MeshStandardMaterial({ map: tex("8k_earth_daymap.jpg"), roughness: 0.9, metalness: 0, envMapIntensity: 0 }));
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(R * 1.003, 384, 192), new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: tex("2k_earth_clouds.jpg"), transparent: true, opacity: 0.7, depthWrite: false, roughness: 1, envMapIntensity: 0 }));
    E.add(earth, clouds); E.rotation.set(0.35, night ? 2.2 : -1.9, 0.1);
    earth.material.color.setRGB(night ? 0.45 : 0.8, night ? 0.5 : 0.86, night ? 0.65 : 0.95);
    const Hs = 0.1, atm = atmosphere(R, Hs, cen, sun, night ? 0.75 : 1.1); atm.position.copy(cen); S.add(atm);
    const pins = [];
    if (!night) {
      // X-ray streaks raining in from space, each stopped high in the air with a faint flash
      const N = 26, st = [], fl = [], mat = new THREE.MeshBasicMaterial(Object.assign({ map: streakTex(), color: 0xe6ecff, side: THREE.DoubleSide }, ADD));
      for (let i = 0; i < N; i++) { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat.clone()); m.matrixAutoUpdate = false; S.add(m); st.push(m); const f = glowSprite(0xdfe8ff, 0.5, 0); S.add(f); fl.push(f); }
      const r0 = rnd(9), per = [], off = [];
      for (let i = 0; i < N; i++) { per.push(2.6 + 1.8 * r0()); off.push(r0() * 10); }
      const camAt = (t) => V(lerp(-1.2, 1.2, t / 9.28), 6.2, 11.5);
      const look = (t) => V(lerp(-0.6, 0.6, t / 9.28), -1.6, -10);
      const xA = V(), yA = V(), zA = V(), mid = V(), view = V(), stopP = V(), dir = V();
      return (t) => {
        const ft = o.T0 + t; C.position.copy(camAt(t)); C.lookAt(look(t)); C.updateMatrixWorld(); shift(C, 0, 0);
        E.rotation.y = 0.9 + t * 0.006; clouds.rotation.y = t * 0.002;
        for (let i = 0; i < N; i++) {
          const T = ft + off[i], cyc = Math.floor(T / per[i]), tau = T - cyc * per[i], rr = rnd(i * 7919 + cyc * 104729 + 3);
          const ang = lerp(-0.42, 0.42, rr()), dz = lerp(-4, -10.5, rr()), x = lerp(-11, 11, rr());
          // stop point ~0.3 above the surface, just this side of / beyond the limb
          const y = Math.sqrt(Math.max((R + 0.3) * (R + 0.3) - x * x - dz * dz, 0)) - R;
          stopP.set(x, y, dz); const n = stopP.clone().sub(cen).normalize();
          dir.set(-n.x + Math.sin(ang) * 0.5, -n.y, -n.z + (rr() - 0.5) * 0.4).normalize();
          const Lp = 9, len = 2.4, fall = 1.25, s = tau / fall;
          const dh = Math.max(Lp * (1 - s), 0), dtl = Math.max(Lp * (1 - s) + len, 0), L = dtl - dh;
          const m = st[i];
          if (L <= 0.001 || tau > fall * 1.4) { m.visible = false; } else {
            m.visible = true;
            mid.copy(stopP).addScaledVector(dir, -(dh + dtl) / 2); view.copy(C.position).sub(mid).normalize();
            xA.copy(dir); yA.crossVectors(view, xA).normalize(); zA.crossVectors(xA, yA);
            m.matrix.makeBasis(xA.multiplyScalar(L), yA.multiplyScalar(0.045), zA).setPosition(mid);
            m.material.opacity = 0.8 * smooth(tau / 0.25);
          }
          const fa = (tau - fall) / 0.9; fl[i].position.copy(stopP); fl[i].material.opacity = fa > 0 && fa < 1 ? 0.35 * Math.sin(Math.PI * Math.min(fa * 2.5, 1)) * (1 - fa) : 0; fl[i].scale.setScalar(0.35 + 0.4 * clamp(fa, 0, 1));
        }
        const py = Math.sqrt((R + 0.3) * (R + 0.3) - 1 - 36) - R;
        return [S, C, [["air blocks X-rays", -1, py, -6, seg(ft, 763.6, 764.4)]]];
      };
    }
    // night limb, sounding rocket, Cygnus above
    const rk = rocket(); rk.scale.setScalar(0.62); S.add(rk);
    const fill = new THREE.DirectionalLight(0x8fa3c0, 0.35); fill.position.set(2, 3, 10); S.add(fill);
    const TN = 90, trail = new THREE.Line(geoOf(null, TN), new THREE.LineBasicMaterial(Object.assign({ vertexColors: true, opacity: 0.6 }, ADD)));
    trail.geometry.setAttribute("color", new THREE.BufferAttribute(new Float32Array(TN * 3), 3)); S.add(trail);
    const camP = V(0, 6.0, 14);
    const sky = cygnus(300 * Math.tan(D2R) * 0.46); S.add(sky);
    skyPlace(sky, camP, V(0, -4.0, -14), -9, 5.5, 300);
    const src = glowSprite(0xe9efff, 9, 0); sky.add(src);
    const P0 = V(1.25, 2.1, 3.2), dirR = V(0.08, 1, -0.04).normalize();
    const rp = (t) => P0.clone().addScaledVector(dirR, 0.3 * t - 0.005 * t * t);
    return (t) => {
      const ft = o.T0 + t;
      C.position.copy(camP).add(V(lerp(0.3, -0.3, t / 13.5), lerp(0, 0.25, t / 13.5), 0)); C.lookAt(0.2, lerp(2.0, 2.6, smooth(t / 13.5)), 0); C.updateMatrixWorld(); shift(C, 0, 0);
      E.rotation.y = 2.2 + t * 0.004;
      const p = rp(t); rk.position.copy(p); rk.quaternion.setFromUnitVectors(V(0, 1, 0), dirR); rk.rotation.y += 0; // keep upright along path
      rk.userData.flame.material.opacity = 0.55 * (1 - seg(t, 3.5, 6.5));
      const tp = trail.geometry.attributes.position.array, tc = trail.geometry.attributes.color.array;
      for (let i = 0; i < TN; i++) { const f = i / (TN - 1), q = rp(t - 9 * (1 - f)), b = 0.5 * Math.pow(f, 1.6) * (q.y > -0.5 ? 1 : 0); q.addScaledVector(dirR, -0.4); tp.set([q.x, q.y, q.z], i * 3); tc.set([b, b * 0.97, b * 0.93], i * 3); }
      trail.geometry.attributes.position.needsUpdate = trail.geometry.attributes.color.needsUpdate = true;
      const pulse = 0.6 + 0.4 * Math.sin(ft * TAU * 0.9);
      src.material.opacity = seg(ft, 786.0, 786.8) * 0.75 * pulse; src.scale.setScalar(lerp(5, 8, pulse) * seg(ft, 786, 786.8) + 0.01);
      sky.userData.lines.material.opacity = 0.38;
      const sw = sky.localToWorld(V(sky.userData.deneb[0], sky.userData.deneb[1], 0)), sx = sky.localToWorld(V(0, 0, 0));
      return [S, C, [["Cygnus · the Swan", sw.x, sw.y, sw.z, fadeIO(ft, 782.6, 789.6, 0.6)], ["X-ray source", sx.x, sx.y, sx.z, seg(ft, 786.3, 787.0)]]];
    };
  };

  // ======================================================================= CYG X-1 system
  const RS = 6, DS = 18;
  // gas stream from the star's inner point (L1) curving ahead into the disk edge; returns {pts, update}
  // plasma stream: premultiplied "over" blending (emits and absorbs) so overlapping particles converge to their own colour
  // instead of summing to white; thin and faint at the star, wider and orange-red as it spirals in
  function gasStream(N, seed) {
    const r = rnd(seed), base = [], gs = () => (r() + r() + r() - 1.5) / 0.5;
    for (let i = 0; i < N; i++) base.push([r(), gs() * 0.5, gs() * 0.5, r()]);
    const g = geoOf(null, N); g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(N * 4), 4));
    g.setAttribute("psize", new THREE.BufferAttribute(new Float32Array(N), 1));
    const pts = new THREE.Points(g, sizedPoints(new THREE.PointsMaterial({ map: dotTex(), size: 1, vertexColors: true, transparent: true, depthWrite: false, premultipliedAlpha: true })));
    const r0 = DS - RS * 1.0, rate = 0.075, A = [1.0, 0.66, 0.4], B = [0.98, 0.42, 0.16], Cc = [0.85, 0.22, 0.07];
    // faint additive halo from the same particles: the plasma's own soft glow
    const glow = new THREE.Points(g, sizedPoints(new THREE.PointsMaterial(Object.assign({ map: dotTex(), size: 4, vertexColors: true, opacity: 0.035 }, ADD)))); pts.add(glow);
    pts.userData.update2 = (ft, phi, t0, k) => {
      const p = g.attributes.position.array, c = g.attributes.color.array, ps = g.attributes.psize.array, age = (ft - t0) * rate;
      for (let i = 0; i < N; i++) {
        const b0 = base[i], u = (b0[0] + ft * rate) % 1, vis = clamp((age - u) * 30, 0, 1) * k;
        const wd = lerp(0.1, 1.0, Math.pow(u, 0.8)), ht = lerp(0.07, 0.3, u);
        const rad = lerp(r0, ROUT * 0.8, Math.pow(u, 0.85)) + b0[1] * wd, a = phi - 1.2 * Math.pow(u, 1.7) + b0[1] * 0.012;
        p[i * 3] = rad * Math.cos(a); p[i * 3 + 1] = b0[2] * ht; p[i * 3 + 2] = rad * Math.sin(a);
        ps[i] = lerp(0.3, 1.3, Math.pow(u, 0.7)) * (0.7 + 0.6 * b0[3]);
        const off = Math.hypot(b0[1], b0[2] * 1.4);
        const al = vis * smooth(u / 0.07) * (1 - smooth((u - 0.86) / 0.14)) * Math.exp(-off * off * 1.5) * lerp(0.07, 0.12, b0[3]) * lerp(0.55, 1, smooth(u / 0.3));
        const s = u < 0.5 ? u * 2 : (u - 0.5) * 2, X = u < 0.5 ? A : B, Y = u < 0.5 ? B : Cc, gl = lerp(1.25, 1.1, smooth((u - 0.5) / 0.5));
        c[i * 4] = lerp(X[0], Y[0], s) * gl; c[i * 4 + 1] = lerp(X[1], Y[1], s) * gl; c[i * 4 + 2] = lerp(X[2], Y[2], s) * gl; c[i * 4 + 3] = al;
      }
      g.attributes.position.needsUpdate = g.attributes.color.needsUpdate = g.attributes.psize.needsUpdate = true;
    };
    return pts;
  }
  const azS = (phi) => Math.atan2(Math.cos(phi), Math.sin(phi)) / D2R; // orbit-camera azimuth of the star direction
  function placeStar(star, ft, phi) {
    star.position.set(DS * Math.cos(phi), 0, DS * Math.sin(phi)); star.lookAt(0, 0, 0); star.scale.set(1, 1, 1.07);
    star.userData.ball.rotation.y = ft * 0.02;
  }
  const specTex = once(() => canvasTex(1024, 48, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, 0);
    [[0, "#4a2c28"], [0.16, "#6e4636"], [0.32, "#86684a"], [0.46, "#88825f"], [0.6, "#647a6a"], [0.74, "#536c7c"], [0.88, "#4c5478"], [1, "#3a3550"]].forEach(([s, c]) => gr.addColorStop(s, c));
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rnd(5); g.fillStyle = "rgba(10,10,14,.35)"; for (let i = 0; i < 22; i++) { const x = r() * w; if (Math.abs(x - w * 0.5) > 30) g.fillRect(x, 0, 1 + r() * 2, h); }
    const vg = g.createLinearGradient(0, 0, 0, h); vg.addColorStop(0, "rgba(0,0,0,.35)"); vg.addColorStop(0.5, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,.35)"); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  }));

  LABK.cygx1 = (o) => {
    const mode = o.mode, C = cam(32);
    if (mode === "star") {
      // telescope zoom: Cygnus -> a blue point on the Swan's neck -> the supergiant itself
      const S = stage("space", { seed: 31, stars: 7000 });
      S.children.forEach((c) => { if (c.isPoints) c.scale.setScalar(4.5); });
      C.near = 1; C.far = 2000;
      const star = blueStar(1); star.position.set(0, 0, -600); S.add(star);
      const SKS = 1.0, sky = cygnus(1500 * Math.tan(D2R) * SKS, 43); sky.position.set(0, 0, -1500); S.add(sky);
      const band = milkyBand(1500 * Math.tan(D2R) * SKS, 0.2); sky.add(band);
      // faint neighbours that only show once zoomed in
      const nr = rnd(12), np = [], nc = [];
      for (let i = 0; i < 70; i++) { np.push((nr() * 2 - 1) * 9, (nr() * 2 - 1) * 5.5, -1400); const b = 0.25 + 0.6 * Math.pow(nr(), 2); nc.push(b, b * 0.96, b * 0.92); }
      const ng = geoOf(new Float32Array(np)); ng.setAttribute("color", new THREE.Float32BufferAttribute(nc, 3));
      const near = new THREE.Points(ng, pointsMat({ size: 3, vertexColors: true, opacity: 0 })); S.add(near);
      const cen = V(CYG_C[0] * 600 * Math.tan(D2R) * SKS, CYG_C[1] * 600 * Math.tan(D2R) * SKS, -600), tgt = V();
      const dot = new THREE.Points(geoOf(new Float32Array([0, 0, -600])), pointsMat({ size: 19, color: 0xb4c8ff })); dot.renderOrder = 5; S.add(dot);
      return (t, d) => {
        const ft = o.T0 + t, z = smoother((ft - 840.0) / 6.6), z2 = ez((ft - 845.6) / 12.04);
        C.fov = 40 * Math.pow(0.62 / 40, z) * lerp(1, 0.8, z2) * lerp(1, 0.92, t / d); C.updateProjectionMatrix();
        tgt.copy(cen).lerp(V(0, 0, -600), smoother((ft - 839.2) / 5.4));
        C.position.set(lerp(0, 2.2, z2), lerp(0, -0.6, z2), 0); C.lookAt(tgt);
        C.rotateZ(lerp(-4, 3, t / d) * D2R); // slow continuous roll: the field never sits still
        shift(C, 0.15 * smoother((ft - 841.5) / 4.5), 0.03 * smoother((ft - 841.5) / 4.5));
        star.userData.ball.rotation.y = ft * 0.04;
        band.material.opacity = 0.2 * (1 - seg(ft, 840.4, 842.4));
        sky.userData.lines.material.opacity = 0.38 * (1 - seg(ft, 840.6, 842.6));
        near.material.opacity = seg(ft, 842.5, 845.5); dot.material.opacity = 1 - seg(ft, 842.0, 843.6);
        return [S, C, []];
      };
    }
    const S = stage("space", { seed: 33, stars: 7000 });
    const star = blueStar(RS); S.add(star);
    const bh = blackHole(); S.add(bh);
    const showHole = mode === "suspects" || mode === "disk" || mode === "disk2" || mode === "end";
    bh.visible = showHole;
    let stream = null; if (mode === "disk" || mode === "disk2" || mode === "end") { stream = gasStream(6000, 17); S.add(stream); }
    const lineM = (op) => M.line(0xb7c9e2, op);
    const orbitLine = lineLoop(256, (u) => [DS * Math.cos(u * TAU), 0, DS * Math.sin(u * TAU)], lineM(0.12)); S.add(orbitLine);
    orbitLine.visible = mode === "doppler" || mode === "suspects";

    if (mode === "doppler") {
      const Wd = 0.3, p0 = 9.387; // bluest (toward us) near 892
      const bar = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.024), new THREE.MeshBasicMaterial({ map: specTex(), transparent: true, opacity: 0.92, depthTest: false, depthWrite: false }));
      bar.position.set(-0.3, 0.2, -1); bar.renderOrder = 50; C.add(bar); S.add(C);
      const dl = new THREE.Mesh(new THREE.PlaneGeometry(0.0028, 0.024), new THREE.MeshBasicMaterial({ color: 0x07070a, transparent: true, opacity: 0.9, depthTest: false, depthWrite: false })); dl.renderOrder = 51; bar.add(dl);
      const tick = new THREE.Mesh(new THREE.PlaneGeometry(0.0014, 0.012), new THREE.MeshBasicMaterial({ color: 0xf1efe9, transparent: true, opacity: 0.6, depthTest: false, depthWrite: false })); tick.position.set(0, 0.021, 0); tick.renderOrder = 51; bar.add(tick);
      const base = new THREE.Color(BLUE[0]), blue = new THREE.Color(0x9cbcff), red = new THREE.Color(0xf4ddd2), hb = new THREE.Color(0xb8ccff), hc = new THREE.Color(), tmp = new THREE.Color();
      const tc = V(), vel = V();
      return (t, d) => {
        const ft = o.T0 + t, phi = p0 - Wd * t;
        aim(C, 0, 0, 0, lerp(80, 72, smooth(t / d)), lerp(8, 24, t / d), lerp(9, 12, t / d), 0.14, 0.02); C.updateMatrixWorld();
        placeStar(star, ft, phi);
        vel.set(Math.sin(phi), 0, -Math.cos(phi)); tc.copy(C.position).sub(star.position).normalize();
        const vr = vel.dot(tc); // +1 toward camera
        tmp.copy(base).lerp(vr > 0 ? blue : red, Math.abs(vr) * 0.85); star.userData.mat.uniforms.tint.value.copy(tmp);
        star.userData.mat.uniforms.gain.value = 1.0 * (1 + 0.08 * vr);
        star.userData.halo.material.color.copy(hc.copy(hb).lerp(vr > 0 ? blue : red, Math.abs(vr) * 0.6));
        dl.position.x = 0.03 * vr; // blue end is right
        const op = seg(ft, 870.6, 871.6); bar.material.opacity = 0.92 * op; dl.material.opacity = 0.9 * op; tick.material.opacity = 0.6 * op;
        const wp = bar.localToWorld(V(-0.2, 0.0, 0));
        return [S, C, [["spectrum", wp.x, wp.y, wp.z, seg(ft, 872.0, 872.8)]]];
      };
    }
    if (mode === "weigh") {
      const Ww = 0.32, p0 = 1.3, NT = 256;
      const trace = lineLoop(NT, (u) => [DS * Math.cos(p0 - u * TAU), 0, DS * Math.sin(p0 - u * TAU)], lineM(0.5)); S.add(trace);
      const rad = new THREE.Line(geoOf(null, 2), lineM(0)); S.add(rad);
      const mark = lineLoop(64, (u) => [0.9 * Math.cos(u * TAU), 0, 0.9 * Math.sin(u * TAU)], lineM(0)); S.add(mark);
      return (t, d) => {
        const ft = o.T0 + t, phi = p0 - Ww * t;
        aim(C, 0, 0, 0, lerp(84, 74, smooth(t / d)), lerp(-14, 10, t / d), lerp(30, 24, t / d), 0.13, 0.08);
        placeStar(star, ft, phi);
        trace.geometry.setDrawRange(0, clamp(Math.floor(Ww * t / TAU * NT) + 2, 2, NT + 1));
        const rp = rad.geometry.attributes.position.array; rp.set([0, 0, 0, star.position.x * (1 - RS * 1.05 / DS), 0, star.position.z * (1 - RS * 1.05 / DS)]); rad.geometry.attributes.position.needsUpdate = true;
        const mk = fadeIO(ft, 921.6, 937.4, 0.8); rad.material.opacity = 0.32 * mk; mark.material.opacity = 0.55 * mk;
        return [S, C, [["several suns", 0, 0, 0, fadeIO(ft, 934.6, 937.5, 0.5)]]];
      };
    }
    if (mode === "suspects") {
      // candidates at the orbit centre, rejected one by one; the blue star behind
      const normal = new THREE.Group(); normal.add(new THREE.Mesh(new THREE.SphereGeometry(1.1, 64, 48), starMat(WARM[0], WARM[1], 2.0)), glowSprite(0xfff0d8, 9, 0.45), glowSprite(0xffe8c8, 18, 0.08));
      const dwarf = new THREE.Group(); dwarf.add(new THREE.Mesh(new THREE.SphereGeometry(0.2, 48, 32), starMat(0xf2f5ff, 0xc8d6ff, 2.4)), glowSprite(0xeef2ff, 1.6, 0.5));
      const neut = new THREE.Group(); neut.add(new THREE.Mesh(new THREE.SphereGeometry(0.09, 32, 24), starMat(0xe4ebff, 0xaabfff, 2.6)), glowSprite(0xd8e2ff, 0.8, 0.45));
      S.add(normal, dwarf, neut);
      const cands = [[normal, 944.1, 951.6], [dwarf, 952.0, 955.2], [neut, 955.5, 959.4]];
      const setOp = (G, a) => { G.visible = a > 0.002; G.scale.setScalar(lerp(0.6, 1, a)); G.children.forEach((m) => { if (m.isSprite) { m.userData.o = m.userData.o || m.material.opacity; m.material.opacity = m.userData.o * a; } else { m.material.uniforms.gain.value = (m.userData.g = m.userData.g || m.material.uniforms.gain.value) * a; } }); };
      return (t, d) => {
        const ft = o.T0 + t;
        C.fov = 24; C.updateProjectionMatrix(); aim(C, 0, 0, 0, lerp(34, 30, smooth(t / d)), lerp(-130, -122, t / d), lerp(8, 6, t / d), 0.07, 0.0);
        placeStar(star, ft, 0.15 - 0.012 * t); star.userData.mat.uniforms.gain.value = 0.85;
        cands.forEach(([G, a, b]) => setOp(G, fadeIO(ft, a, b, 0.6)));
        neut.rotation.y = ft;
        const hk = seg(ft, 959.8, 961.0); bh.visible = hk > 0; bh.userData.tick(ft, C, 0, { ringK: 1.4 * hk });
        bh.children[0].scale.setScalar(1);
        const pins = [];
        pins.push(["normal star? far too bright", 0, 1.4, 0, fadeIO(ft, 944.4, 951.4, 0.5)]);
        pins.push(["white dwarf? limit 1.4 suns", 0, 0.25, 0, fadeIO(ft, 952.3, 955.1, 0.4)]);
        pins.push(["neutron star? limit 3 suns", 0, 0.15, 0, fadeIO(ft, 955.8, 959.3, 0.4)]);
        pins.push(["black hole", 0, 1.05, 0, seg(ft, 960.2, 960.9)]);
        return [S, C, pins];
      };
    }
    if (mode === "disk") {
      return (t, d) => {
        const ft = o.T0 + t, phi = 1.25 - 0.02 * t;
        placeStar(star, ft, phi); const tg = star.position.clone().multiplyScalar(0.36);
        aim(C, tg.x, 0, tg.z, lerp(41, 33, ez(t / d)), azS(phi) + 110 + 14 * t / d, lerp(19, 13, ez(t / d)), 0, 0);
        stream.userData.update2(ft, phi, 967.0, 1);
        const k = seg(ft, 970.5, 977.5);
        bh.userData.tick(ft, C, k, { ringK: 0.9, t, shear: 0.03 });
        return [S, C, []];
      };
    }
    if (mode === "disk2") {
      const N = 900, br = rnd(23), bb = []; for (let i = 0; i < N; i++) bb.push([br() * 2 - 1, br() * 2 - 1, br() * 2 - 1]);
      const blob = new THREE.Points(geoOf(null, N), new THREE.PointsMaterial(Object.assign({ map: dotTex(), size: 0.11, color: 0xffe6c4, opacity: 0 }, ADD))); S.add(blob);
      const hot = glowSprite(0xfff1dc, 4.2, 0); S.add(hot);
      return (t, d) => {
        const ft = o.T0 + t, phi = 0.3 - 0.02 * t, w = smoother((ft - 1007.7) / 3.6);
        placeStar(star, ft, phi); const tg = star.position.clone().multiplyScalar(0.36 * w);
        const dist = 6.2 * Math.pow(46 / 6.2, Math.pow(w, 0.8)) + 3 * seg(ft, 1011, 1017.48), el = lerp(lerp(8, 12, smooth(t / 17)), 22, w) + 30 * Math.sin(Math.PI * w);
        aim(C, tg.x, 0, tg.z, dist, lerp(lerp(150, 176, smooth(t / 17)), azS(phi) + 122, Math.pow(w, 0.7)), el, lerp(0.0, 0.12, w), lerp(0.02, 0.08, w));
        stream.userData.update2(ft, phi, 0, seg(w, 0.25, 0.7));
        const kb = 1 + 0.4 * seg(ft, 1003.0, 1006.0);
        bh.userData.tick(ft, C, 1, { kb, spin: 0.045, t, shear: 0.05, ringK: lerp(0.35, 0.9, w) });
        hot.material.opacity = 0.16 * seg(ft, 1003.0, 1006.0) * (1 - 0.6 * w);
        // a clump of gas spirals in, brightens, and fades at the horizon
        const tau = ft - 1005.0, bp = blob.geometry.attributes.position.array;
        const rc = lerp(2.7, 1.0, clamp(tau / 2.6, 0, 1) ** 1.6), ac = 2.2 - 3.4 * Math.pow(clamp(tau / 2.6, 0, 1), 1.2) - 0.6 * clamp(tau, 0, 9);
        for (let i = 0; i < N; i++) { const b = bb[i], a = ac + b[0] * 0.3 * (1 + tau * 0.5), rr = rc + b[1] * 0.08 * rc / 2.7 * (1 - 0.5 * Math.abs(b[0])); bp[i * 3] = rr * Math.cos(a); bp[i * 3 + 1] = b[2] * 0.03; bp[i * 3 + 2] = rr * Math.sin(a); }
        blob.geometry.attributes.position.needsUpdate = true;
        blob.material.opacity = seg(tau, 0, 0.5) * (1 - seg(rc, 1.35, 1.03)) * 0.6;
        return [S, C, []];
      };
    }
    // end: wide, whole system, fade to black
    const fm = fader(S, C);
    return (t, d) => {
      const ft = o.T0 + t, phi = 2.0 - 0.03 * t;
      placeStar(star, ft, phi); const tg = star.position.clone().multiplyScalar(0.35);
      aim(C, tg.x, 0, tg.z, lerp(53, 45.5, ez(t / d)), azS(phi) + lerp(108, 124, t / d), lerp(16, 11.5, ez(t / d)), 0.1, 0.08);
      stream.userData.update2(ft, phi, 0, 1);
      bh.userData.tick(ft, C, 1, { t, shear: 0.03 });
      fm.opacity = seg(t, d - 1.5, d - 0.02);
      return [S, C, []];
    };
  };

  // ======================================================================= GALCENTER (the Milky Way's centre)
  const PITCH = Math.tan(13 * D2R);
  const armTheta = (r) => Math.log(Math.max(r, 0.02) / 0.06) / PITCH;
  function vnoise(seed) {
    const r = rnd(seed), G = 64, v = new Float32Array(G * G).map(() => r());
    const at = (i, j) => v[((j % G + G) % G) * G + ((i % G + G) % G)];
    return (x, y) => { const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy); return lerp(lerp(at(i, j), at(i + 1, j), sx), lerp(at(i, j + 1), at(i + 1, j + 1), sx), sy); };
  }
  function fbm3(seed) { const n1 = vnoise(seed), n2 = vnoise(seed + 101), n3 = vnoise(seed + 202); return (x, y) => 0.5 * n1(x, y) + 0.3 * n2(x * 2.1 + 7, y * 2.1 + 3) + 0.2 * n3(x * 4.3 + 1, y * 4.3 + 9); }
  const galTex = once(() => canvasTex(2048, 2048, (g, w, h) => {
    const id = g.createImageData(w, h), d = id.data, n1 = vnoise(3), n2 = vnoise(8), n3 = vnoise(13);
    const fbm = (x, y) => 0.5 * n1(x, y) + 0.3 * n2(x * 2.1 + 7, y * 2.1 + 3) + 0.2 * n3(x * 4.3 + 1, y * 4.3 + 9);
    const bc = Math.cos(0.45), bs = Math.sin(0.45), wrap = (a) => ((a % TAU) + TAU + Math.PI) % TAU - Math.PI;
    const ARMS = [[0, 1], [Math.PI, 1], [Math.PI / 2, 0.45], [-Math.PI / 2, 0.45]];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = (x - w / 2 + 0.5) / (w / 2), dy = (y - h / 2 + 0.5) / (h / 2), r = Math.hypot(dx, dy), i = (y * w + x) * 4;
      if (r > 1) { d[i + 3] = 255; continue; }
      const th = Math.atan2(dy, dx) + 0.9 * (fbm(dx * 3 + 20, dy * 3 + 20) - 0.5) + 0.25 * (fbm(dx * 9 + 2, dy * 9 + 6) - 0.5), at = armTheta(r);
      const clump = 0.35 + 1.3 * Math.pow(fbm(dx * 26 + 40, dy * 26 + 40), 2.2), fine = fbm(dx * 70 + 5, dy * 70 + 5);
      let arm = 0, lane = 0;
      for (const [o, wt] of ARMS) {
        const ad = wrap(th - at - o) * r, wd = 0.05 + 0.07 * Math.sqrt(r);
        arm += wt * Math.exp(-Math.pow(ad / wd, 2)); if (wt === 1) lane += Math.exp(-Math.pow((ad + wd * 0.65) / (wd * 0.75), 2));
      }
      const xr = dx * bc + dy * bs, yr = -dx * bs + dy * bc;
      const bulge = 1.4 * Math.exp(-Math.pow(r / 0.07, 1.1)) + 0.5 * Math.exp(-(Math.pow(xr / 0.19, 2) + Math.pow(yr / 0.07, 2)));
      const disk = Math.exp(-r / 0.3) * smooth(r / 0.1), armL = disk * 1.5 * arm * clump * (0.7 + 0.6 * fine);
      const dust = 1 - 0.5 * clamp(lane * (0.25 + 0.9 * fbm(dx * 14, dy * 14)), 0, 1) * smooth(r / 0.06);
      const edge = 1 - smooth((r - 0.75) / 0.25), knots = Math.max(0, fine - 0.72) * 3 * arm * disk;
      const base = disk * 0.25 * (0.8 + 0.4 * fine);
      const R = (base * 1.0 + armL * 0.8 + bulge * 1.0 + knots * 1.0) * dust * edge;
      const G = (base * 0.92 + armL * 0.86 + bulge * 0.84 + knots * 0.62) * dust * edge;
      const B = (base * 0.8 + armL * 1.0 + bulge * 0.62 + knots * 0.66) * dust * edge;
      const tm = (c) => 255 * (1 - Math.exp(-c * 1.2));
      d[i] = tm(R); d[i + 1] = tm(G); d[i + 2] = tm(B); d[i + 3] = 255;
    }
    g.putImageData(id, 0, 0);
  }));
  // dust lane: ridged, streaky filaments; dense cores dark, thin edges lit warm by the bulge behind (normal blending)
  const dustTex = once(() => canvasTex(512, 256, (g, w, h) => {
    const id = g.createImageData(w, h), f = fbm3(91), f2 = fbm3(93), r = rnd(95);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const X = x / w - 0.5, Y = (y + 0.5) / h - 0.5, wy = Y + 0.12 * (f(X * 3 + 4, 2.5) - 0.5);
      const env = Math.exp(-Math.pow(X / 0.24, 2)) * Math.exp(-Math.pow(wy / 0.16, 2));
      const r1 = 1 - Math.abs(2 * f(X * 5, wy * 22) - 1), r2 = 1 - Math.abs(2 * f2(X * 11 + 3, wy * 40) - 1);
      const dn = clamp(env * (1.3 * Math.pow(r1, 6) + 0.7 * Math.pow(r2, 8)), 0, 1), i = (y * w + x) * 4;
      const k = smooth(dn / 0.5); // 0 thin & lit .. 1 dense & dark
      id.data[i] = lerp(215, 16, k); id.data[i + 1] = lerp(128, 10, k); id.data[i + 2] = lerp(66, 7, k); id.data[i + 3] = clamp(255 * Math.pow(dn, 1.15) + (r() - 0.5) * 2, 0, 255);
    }
    g.putImageData(id, 0, 0);
  }));
  // near-infrared point-spread function: tight core + faint wide skirt
  const psfTex = once(() => canvasTex(64, 64, (g, w, h) => {
    const id = g.createImageData(w, h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const q = Math.hypot(x - w / 2 + 0.5, y - h / 2 + 0.5) / (w / 2), i = (y * w + x) * 4; id.data[i] = id.data[i + 1] = id.data[i + 2] = 255; id.data[i + 3] = clamp(255 * (0.85 * Math.exp(-Math.pow(q / 0.17, 2)) + 0.15 * Math.exp(-Math.pow(q / 0.5, 2))) * (1 - smooth((q - 0.85) / 0.15)), 0, 255); }
    g.putImageData(id, 0, 0);
  }));
  // unresolved starlight of the nuclear cluster, mottled and crossed by dark lanes (additive, warm)
  const irGlowTex = once(() => canvasTex(512, 512, (g, w, h) => {
    const id = g.createImageData(w, h), f = fbm3(81), f2 = fbm3(83), r = rnd(85);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const X = (x + 0.5) / w - 0.5, Y = (y + 0.5) / h - 0.5, q = Math.hypot(X * 0.8, Y * 1.15), i = (y * w + x) * 4;
      const glow = (0.75 / (1 + Math.pow(q / 0.05, 1.4)) + 0.2 * Math.exp(-Math.pow(q / 0.3, 2))) * (0.6 + 0.8 * f(X * 16, Y * 16));
      const lane = clamp(Math.pow(1 - Math.abs(2 * f2(X * 2.5 + 2, (Y + 0.25 * X) * 13) - 1), 12) * 0.8 + Math.pow(1 - Math.abs(2 * f(X * 6 + 5, (Y + 0.25 * X) * 36) - 1), 16) * 0.3, 0, 0.9) * 0.68;
      const v = glow * (1 - lane) * (1 - smooth((q - 0.38) / 0.12));
      id.data[i] = clamp(255 * v * 1.0 + (r() - 0.5) * 2, 0, 255); id.data[i + 1] = clamp(255 * v * 0.66, 0, 255); id.data[i + 2] = clamp(255 * v * 0.42, 0, 255); id.data[i + 3] = 255;
    }
    g.putImageData(id, 0, 0);
  }));
  // Kepler position at time tt for orbit {a,e,T,tp,m}; out = Vector3
  function kepler(o, tt, out) {
    let Mn = TAU * (tt - o.tp) / o.T; Mn = ((Mn % TAU) + TAU + Math.PI) % TAU - Math.PI;
    let E = o.e > 0.8 ? Math.PI * Math.sign(Mn || 1) : Mn;
    for (let k = 0; k < 14; k++) E -= (E - o.e * Math.sin(E) - Mn) / (1 - o.e * Math.cos(E));
    return out.set(o.a * (Math.cos(E) - o.e), o.a * Math.sqrt(1 - o.e * o.e) * Math.sin(E), 0).applyMatrix4(o.m);
  }
  function ellipseAt(o, u, out) { const E = u * TAU; return out.set(o.a * (Math.cos(E) - o.e), o.a * Math.sqrt(1 - o.e * o.e) * Math.sin(E), 0).applyMatrix4(o.m); }

  LABK.galcenter = (o) => {
    const mode = o.mode, C = cam(32);
    if (mode === "approach") {
      const S = stage("space", { seed: 51, stars: 5000 }), GR = 100;
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(2 * GR, 2 * GR), new THREE.MeshBasicMaterial(Object.assign({ map: galTex(), side: THREE.DoubleSide }, ADD)));
      plane.rotation.x = -Math.PI / 2; S.add(plane);
      const r = rnd(52), gauss = () => (r() + r() + r() - 1.5) / 0.5;
      // disk stars along the arms (canvas +x,+y map to world +x,+z after the plane rotation)
      const NA = 9000, ap = new Float32Array(NA * 3), ac = new Float32Array(NA * 3);
      for (let i = 0; i < NA; i++) {
        const rr = 0.08 + 0.85 * Math.pow(r(), 0.9), th = armTheta(rr) + (r() < 0.5 ? 0 : Math.PI) + gauss() * (0.08 + 0.07 * Math.sqrt(rr)) / rr * 1.4;
        ap.set([rr * Math.cos(th) * GR, gauss() * 0.7, rr * Math.sin(th) * GR], i * 3);
        const b = 0.2 + 0.5 * Math.pow(r(), 2.5), blu = r() < 0.6; ac.set(blu ? [b * 0.84, b * 0.9, b] : [b, b * 0.9, b * 0.78], i * 3);
      }
      const dg = geoOf(ap); dg.setAttribute("color", new THREE.BufferAttribute(ac, 3));
      const dstars = new THREE.Points(dg, pointsMat({ size: 2.4, vertexColors: true })); S.add(dstars);
      // bulge + nuclear cluster (what we fly into)
      const NB = 32000, bp = new Float32Array(NB * 3), bcol = new Float32Array(NB * 3);
      for (let i = 0; i < NB; i++) {
        const nuc = i < 4000, s = nuc ? Math.pow(r(), 2.2) * 2.5 : 0.6 + Math.pow(r(), 1.25) * 26, u = r() * 2 - 1, th = r() * TAU, q = Math.sqrt(1 - u * u);
        bp.set([s * q * Math.cos(th), s * u * (nuc ? 0.7 : 0.5), s * q * Math.sin(th)], i * 3);
        const b = 0.3 + 0.7 * Math.pow(r(), 1.6), w = r(); bcol.set([b, b * lerp(0.74, 0.92, w), b * lerp(0.52, 0.85, w)], i * 3);
      }
      const bg = geoOf(bp); bg.setAttribute("color", new THREE.BufferAttribute(bcol, 3));
      const bstars = new THREE.Points(bg, pointsMat({ size: 3.2, vertexColors: true, opacity: 0 })); S.add(bstars);
      const camAt = (s) => { const dist = 300 * Math.pow(7.5 / 300, s), az = lerp(-35, 30, s) * D2R, el = lerp(46, 6, Math.pow(s, 0.85)) * D2R; return V(dist * Math.sin(az) * Math.cos(el), dist * Math.sin(el), dist * Math.cos(az) * Math.cos(el)); };
      // dust filaments in the inner galaxy, seen against the bulge as we close in
      const cr = rnd(54), clouds = [];
      for (let i = 0; i < 26; i++) {
        const s = lerp(0.8, 1.0, cr()), p = camAt(s), dc = p.length(), side = V(cr() - 0.5, 0, cr() - 0.5).normalize().multiplyScalar(dc * lerp(0.22, 0.7, cr()));
        const q = p.clone().multiplyScalar(lerp(0.3, 0.8, cr())).add(side); q.y = q.y * 0.5 + (cr() - 0.5) * 0.8;
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: dustTex(), transparent: true, opacity: 0, depthWrite: false }));
        const sz = q.length() * lerp(0.45, 0.95, cr()); sp.position.copy(q); sp.scale.set(sz, sz * lerp(0.28, 0.42, cr()), 1); sp.material.rotation = (cr() - 0.5) * 0.25; sp.renderOrder = 3; S.add(sp); clouds.push(sp);
      }
      const core = glowSprite(0xffd9b0, 22, 0.3); S.add(core);
      const sgr = glowSprite(0xf6ece4, 0.7, 0); sgr.renderOrder = 4; S.add(sgr);
      return (t, d) => {
        const ft = o.T0 + t, s = 0.93 * smoother(clamp(t / 16.5, 0, 1)) + 0.07 * smooth(clamp((t - 14) / 10.4, 0, 1));
        const P = camAt(s), dist = P.length(); C.position.copy(P); C.lookAt(0, 0, 0);
        shift(C, 0.12 * seg(ft, 1090.5, 1093.0), 0.03 * seg(ft, 1090.5, 1093.0));
        const close = 1 - clamp((dist - 12) / 90, 0, 1);
        plane.material.opacity = 1 - seg(close, 0.25, 0.85); core.material.opacity = lerp(0.3, 0.2, close);
        bstars.material.opacity = 0.2 + 0.8 * seg(close, 0.3, 0.9); dstars.material.opacity = 1 - 0.6 * close;
        clouds.forEach((c) => { const dcam = c.position.distanceTo(P); c.material.opacity = 0.7 * seg(close, 0.6, 0.92) * clamp((dcam - c.scale.x * 0.4) / (c.scale.x * 0.8), 0, 1); });
        sgr.material.opacity = 0.6 * seg(ft, 1090.0, 1093.0) * (0.85 + 0.15 * Math.sin(ft * 1.7));
        plane.rotation.z = ft * 0.002;
        return [S, C, [["Sagittarius A*", 0, 0, 0, seg(ft, 1093.1, 1093.9)]]];
      };
    }
    // orbits / orbits2: S-stars around an empty centre
    const S = stage("space", { seed: 57, stars: 4000 });
    S.children.forEach((c) => { if (c.isPoints) c.material.color.setRGB(1, 0.82, 0.64); });
    // crowded near-infrared field (ESO/Keck look): soft point-spread glows in varied warm colours, densest toward the centre;
    // dimmed inside the S-star zone (3D radius < 11) so the S-stars read clearly in front of it
    const r = rnd(58), IR = 9000, ip = new Float32Array(IR * 3), ic = new Float32Array(IR * 3), is = new Float32Array(IR);
    for (let i = 0; i < IR; i++) {
      const inner = i < 6500, s = inner ? 3 + 52 * Math.pow(r(), 1.3) : 30 + 170 * Math.pow(r(), 0.7), u = r() * 2 - 1, th = r() * TAU, q = Math.sqrt(1 - u * u);
      ip.set([s * q * Math.cos(th), s * u, s * q * Math.sin(th)], i * 3);
      const giant = r() < 0.012 && s > 18, b = giant ? 0.9 + 0.3 * r() : ((inner ? 0.22 : 0.16) + 0.75 * Math.pow(r(), 2.6)) * (s < 11 ? 0.5 : 1), hue = r(), blue = r() < 0.07;
      ic.set(blue ? [b * 0.82, b * 0.88, b] : [b, b * lerp(0.5, 0.86, hue), b * lerp(0.26, 0.66, hue)], i * 3);
      is[i] = giant ? 22 + 12 * r() : 4.5 + 13 * Math.pow(b, 1.3) + 2.5 * r();
    }
    const ig = geoOf(ip); ig.setAttribute("color", new THREE.BufferAttribute(ic, 3)); ig.setAttribute("psize", new THREE.BufferAttribute(is, 1));
    S.add(new THREE.Points(ig, sizedPoints(pointsMat({ map: psfTex(), size: 1, vertexColors: true }))));
    // diffuse glow + dust behind the cluster, kept on the line camera -> centre so Sgr A* always sits in the brightest light
    const glowP = new THREE.Mesh(new THREE.PlaneGeometry(190, 190), new THREE.MeshBasicMaterial(Object.assign({ map: irGlowTex(), opacity: 0.6 }, ADD)));
    glowP.renderOrder = -2; S.add(glowP);
    const orbitM = (rx, ry, rz) => new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(rx, ry, rz, "ZXY"));
    const ORB = [{ a: 9, e: 0.88, T: 24, tp: 1131.9, m: orbitM(0.9, 0, -0.39), s2: true }];
    for (let i = 0; i < 15; i++) { const a = lerp(3.5, 11, Math.pow(r(), 0.8)), e = lerp(0.25, 0.9, r()); ORB.push({ a, e, T: 24 * Math.pow(a / 9, 1.5), tp: 1100 + r() * 60, m: orbitM(r() * TAU, r() * TAU, r() * TAU) }); }
    // only S2 keeps a full (faint) ellipse; every star leaves a dotted trail of past positions, fading out behind it
    const NTR = 22, tmp = V(), objs = ORB.map((ob) => {
      const ell = ob.s2 ? lineLoop(160, (u) => ellipseAt(ob, u, tmp).toArray(), M.line(0xe8dccb, 0.3)) : null; if (ell) S.add(ell);
      const tg = geoOf(null, NTR); tg.setAttribute("color", new THREE.BufferAttribute(new Float32Array(NTR * 3), 3));
      const tr = new THREE.Points(tg, pointsMat({ size: ob.s2 ? 4.5 : 3.5, vertexColors: true })); S.add(tr);
      return { ob, ell, tr };
    });
    const dots = new THREE.Points(geoOf(null, ORB.length), pointsMat({ map: psfTex(), size: 30 })); dots.material.color.setRGB(1.35, 1.42, 1.6); S.add(dots); // hot young B stars: blue-white among red giants
    const s2dot = new THREE.Points(geoOf(null, 1), pointsMat({ map: psfTex(), size: 40, color: 0xf2f5ff })); S.add(s2dot);
    const SSR = 0.9, ss = lineLoop(128, (u) => [SSR * Math.cos(u * TAU), SSR * Math.sin(u * TAU), 0], M.line(0xdfe6f0, 0)); S.add(ss);
    const two = mode === "orbits2";
    return (t, d) => {
      const ft = o.T0 + t;
      let dist, az, el;
      if (two) { dist = lerp(54, 50, t / d); az = lerp(4, 7, t / d); el = 14; }
      else { const push = smoother((ft - 1145.0) / 5.5); dist = lerp(lerp(62, 54, smooth(t / 28)), 24, push) + 4 * seg(ft, 1151, 1157.86); az = lerp(-10, 12, t / d); el = lerp(10, 18, t / d); }
      aim(C, 0, 0, 0, dist, az, el, two ? 0.13 : 0.09, 0.03); ss.quaternion.copy(C.quaternion);
      glowP.position.copy(C.position).normalize().multiplyScalar(-110); glowP.quaternion.copy(C.quaternion);
      const dp = dots.geometry.attributes.position.array;
      objs.forEach(({ ob, ell, tr }, j) => {
        kepler(ob, ft, tmp); dp.set([tmp.x, tmp.y, tmp.z], j * 3);
        const tp = tr.geometry.attributes.position.array, tc = tr.geometry.attributes.color.array, span = ob.T * (ob.s2 ? 0.16 : 0.12);
        for (let i = 0; i < NTR; i++) { const f = i / (NTR - 1); kepler(ob, ft - span * (1 - f), tmp); tp.set([tmp.x, tmp.y, tmp.z], i * 3); const b = (ob.s2 ? 0.8 : 0.6) * Math.pow(f, 1.5); tc.set([b * 0.9, b * 0.93, b], i * 3); }
        tr.geometry.attributes.position.needsUpdate = tr.geometry.attributes.color.needsUpdate = true;
        if (ob.s2) ell.material.opacity = two ? 0.42 : lerp(0.14, 0.45, seg(ft, 1120.86, 1121.8));
      });
      dots.geometry.attributes.position.needsUpdate = true;
      kepler(ORB[0], ft, tmp); s2dot.geometry.attributes.position.array.set([tmp.x, tmp.y, tmp.z]); s2dot.geometry.attributes.position.needsUpdate = true;
      const s2k = two ? 1 : seg(ft, 1120.86, 1121.8); s2dot.material.opacity = s2k;
      ss.material.opacity = two ? 0 : 0.45 * seg(ft, 1144.6, 1146.0);
      const pins = [];
      if (!two) {
        pins.push(["S2", tmp.x, tmp.y, tmp.z, fadeIO(ft, 1121.0, 1141.8, 0.6)]);
        const e = V(-SSR * 0.7, SSR * 0.7, 0).applyQuaternion(C.quaternion);
        pins.push(["about the size of our solar system", e.x, e.y, e.z, fadeIO(ft, 1148.7, 1155.6, 0.6)]);
      }
      return [S, C, pins];
    };
  };
})();
