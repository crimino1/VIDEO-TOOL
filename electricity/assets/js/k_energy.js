/* k_energy.js — group B kinds (Electricity film): poynting, textbook, room, bill, generator.
   Each kind: LABK.name = (o) => (t, d) => [scene, camera, pins]; ft = o.T0 + t is film time. Pure functions of t.
   Poynting convention: wire A (red, z = -A) carries current +x (source -> bulb), wire B (black, z = +A) returns it (-x).
   A is the + side, so E points from A to B (+z between the wires); B rings circle each wire by the right-hand rule
   (between the wires B points -y); S = E x B points +x (source -> bulb) everywhere around the pair, and turns radially
   into the bulb filament from the side. The code computes E, B and S from these rules and asserts S.x > 0. */
(function () {
  const { THREE, M, P, seg, smooth, lerp, clamp, rnd, orbit, stage, canvasTex, glowSprite, W, H, D2R } = L3;
  const V3 = THREE.Vector3, TAU = Math.PI * 2, UP = new V3(0, 1, 0);
  const V = (x, y, z) => new V3(x, y, z);
  const win = (t, a, b, f) => { f = f || 0.4; return seg(t, a, a + f) * (1 - seg(t, b - f, b)); };
  const fr = (x) => x - Math.floor(x);

  // ---------------------------------------------------------------- camera helpers
  function aim(C, p, dist, az, el, ox, oy) {
    orbit(C, p.x, p.y, p.z, dist, az, el);
    C.near = Math.max(1e-3, dist * 0.02); C.far = Math.max(300, dist * 40);
    if (ox || oy) C.setViewOffset(W, H, ox || 0, oy || 0, W, H); else C.clearViewOffset();
    C.updateProjectionMatrix();
  }
  // Catmull-Rom through [[t, v], ...] (one continuous move, no stops at inner keys)
  function cr(K, t) {
    const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    let i = 0; while (t >= K[i + 1][0]) i++;
    const a = K[Math.max(i - 1, 0)], b = K[i], c = K[i + 1], d = K[Math.min(i + 2, n - 1)], h = c[0] - b[0], u = (t - b[0]) / h;
    const m1 = i === 0 ? (c[1] - b[1]) * 0.5 : (c[1] - a[1]) / (c[0] - a[0]) * h, m2 = i + 2 >= n ? (c[1] - b[1]) * 0.5 : (d[1] - b[1]) / (d[0] - b[0]) * h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * b[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * c[1] + (u3 - u2) * m2;
  }
  // camera keys: [[t, tx, ty, tz, dist, az, el], ...]
  function camKeys(C, K, t, ox, oy) {
    const g = (j) => cr(K.map((k) => [k[0], k[j]]), t);
    aim(C, V(g(1), g(2), g(3)), g(4), g(5), g(6), ox, oy);
  }
  const cam = (fov) => new THREE.PerspectiveCamera(fov || 32, W / H, 0.05, 400);

  // ---------------------------------------------------------------- procedural textures (cached, seeded)
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function vn(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s, o) { let f = 0, a = 0.5; for (let i = 0; i < (o || 4); i++) { f += a * vn(x, y, s + i * 17); x *= 2; y *= 2; a *= 0.5; } return f; }
  const TC = {};
  function pixTex(key, w, h, fn, rep) {
    if (TC[key]) return TC[key];
    const t = canvasTex(w, h, (g) => { const im = g.createImageData(w, h), D = im.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn(x, y), i = (y * w + x) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = 255; } g.putImageData(im, 0, 0); });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = 8;
    return (TC[key] = t);
  }
  // warm wood: grain along x
  const woodTex = (key, base, seed) => pixTex(key, 1024, 512, (x, y) => {
    const n = fbm(x / 420, y / 40, seed, 4), ring = 0.5 + 0.5 * Math.sin((y / 512 * 60 + n * 3.2) * Math.PI), fine = vn(x / 3, y / 0.9, seed + 9), streak = fbm(x / 900, y / 6, seed + 5, 3);
    const k = 0.8 + 0.08 * Math.pow(ring, 3) + 0.06 * fine + 0.12 * (streak - 0.5) - 0.08 * fbm(x / 300, y / 200, seed + 3, 2);
    return [base[0] * k, base[1] * k, base[2] * k];
  });
  const noiseTex = (key, base, amp, sc, seed) => pixTex(key, 512, 512, (x, y) => { const k = 1 + amp * (fbm(x / sc, y / sc, seed, 5) - 0.5) * 2 + amp * 0.4 * (hash(x, y, seed) - 0.5); return [base[0] * k, base[1] * k, base[2] * k]; });
  const wood = (key, base, seed, rough, rep) => { const m = new THREE.MeshStandardMaterial({ map: woodTex(key, base, seed), roughness: rough || 0.55, metalness: 0 }); if (rep) { m.map = m.map.clone(); m.map.repeat.set(rep[0], rep[1]); m.map.needsUpdate = true; } return m; };

  // ---------------------------------------------------------------- geometry helpers
  function curveOf(fn) { const c = new THREE.Curve(); c.getPoint = (u, out) => (out || new V3()).copy(fn(u)); return c; }
  const tubeAlong = (pts, r, mat, segs, closed) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, !!closed), segs || 64, r, 12, !!closed), mat);
  const rod = (a, b, r, mat, rs) => new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(a, b), 1, r, rs || 12), mat);
  // merge indexed geometries; g.userData.a = {name: [values...]} constant per geometry
  function mergeG(list) {
    let nv = 0, ni = 0; for (const g of list) { nv += g.attributes.position.count; ni += g.index.count; }
    const pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3), uv = new Float32Array(nv * 2), idx = new Uint32Array(ni), ex = {};
    const names = Object.keys(list[0].userData.a || {});
    names.forEach((n) => (ex[n] = new Float32Array(nv * list[0].userData.a[n].length)));
    let vo = 0, io = 0;
    for (const g of list) {
      const c = g.attributes.position.count;
      pos.set(g.attributes.position.array, vo * 3); nor.set(g.attributes.normal.array, vo * 3); uv.set(g.attributes.uv.array, vo * 2);
      const ia = g.index.array; for (let i = 0; i < ia.length; i++) idx[io + i] = ia[i] + vo;
      names.forEach((n) => { const val = g.userData.a[n], k = val.length; for (let i = 0; i < c; i++) for (let j = 0; j < k; j++) ex[n][(vo + i) * k + j] = val[j]; });
      vo += c; io += ia.length; g.dispose();
    }
    const m = new THREE.BufferGeometry();
    m.setAttribute("position", new THREE.BufferAttribute(pos, 3)); m.setAttribute("normal", new THREE.BufferAttribute(nor, 3)); m.setAttribute("uv", new THREE.BufferAttribute(uv, 2));
    names.forEach((n) => m.setAttribute(n, new THREE.BufferAttribute(ex[n], list[0].userData.a[n].length)));
    m.setIndex(new THREE.BufferAttribute(idx, 1));
    return m;
  }
  // rounded box via extruded rounded rectangle (w x h profile, depth d along z), centred
  function roundBox(w, h, d, r) {
    const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
    s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y); s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
    s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r * 0.6, bevelEnabled: true, bevelThickness: r * 0.6, bevelSize: r * 0.5, bevelSegments: 4, curveSegments: 6 });
    g.translate(0, 0, -(d - 2 * r * 0.6) / 2); return g;
  }
  const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
  const shadowAll = (o, cast, recv) => o.traverse((m) => { if (m.isMesh) { m.castShadow = cast !== false; m.receiveShadow = recv !== false; } });

  // field-line material (thin tubes): B rings grow out of the wire (uGrow=1), E lines draw on along their length (uGrow=0).
  // a soft pulse runs along each line in the field direction; uFront hides everything beyond x = uFront (switch-on front)
  function fieldMat(col, op, grow) {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false,
      uniforms: { uCol: { value: new THREE.Color(col) }, uOp: { value: op }, uT: { value: 0 }, uRev: { value: 0 }, uFront: { value: 99 }, uDash: { value: 2 }, uGrow: { value: grow ? 1 : 0 }, uBase: { value: 0.45 } },
      vertexShader: `attribute float aK; attribute vec3 aO; uniform float uRev, uGrow; varying float vS, vK, vX; varying vec3 vN, vV;
        void main(){ vS = uv.x; vK = aK; float g = smoothstep(aK, aK + 0.35, uRev * 1.35);
          vec3 p = mix(position, mix(aO, position, max(g, 0.002)), uGrow);
          vec4 wp = modelMatrix * vec4(p, 1.0); vX = wp.x; vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz);
          gl_Position = projectionMatrix * viewMatrix * wp; }`,
      fragmentShader: `uniform vec3 uCol; uniform float uOp, uT, uRev, uFront, uDash, uGrow, uBase; varying float vS, vK, vX; varying vec3 vN, vV;
        void main(){ float g = smoothstep(vK, vK + 0.35, uRev * 1.35);
          float a = uGrow > 0.5 ? g : smoothstep(g + 0.001, g - 0.06, vS) * step(0.001, g);
          a *= smoothstep(uFront + 0.05, uFront - 0.45, vX);
          float d = fract(vS * uDash - uT); float pulse = 0.5 + 0.5 * pow(sin(3.14159 * d), 6.0);
          float f = abs(dot(normalize(vN), normalize(vV))); float edge = 0.55 + 0.45 * f;
          gl_FragColor = vec4(uCol * (0.85 + 0.5 * pulse), uOp * a * edge * (uBase + (1.0 - uBase) * pulse));
          #include <colorspace_fragment>
        }`,
    });
  }
  const bez = (a, b, c, d, u, out) => { const v = 1 - u; return out.set(0, 0, 0).addScaledVector(a, v * v * v).addScaledVector(b, 3 * v * v * u).addScaledVector(c, 3 * v * u * u).addScaledVector(d, u * u * u); };

  // incandescent bulb in a bakelite batten holder on a small wooden base. g.userData.set(on) lights it.
  function bulbLamp(night) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.64, 0.12, 48), wood("woodDark", [92, 58, 36], 5, 0.5)); base.position.y = 0.06; g.add(base);
    const bak = M.paint(0x2a1d16, 0.38);
    const body = new THREE.Mesh(new THREE.LatheGeometry([[0.001, 0.12], [0.34, 0.12], [0.34, 0.2], [0.3, 0.24], [0.28, 0.6], [0.3, 0.64], [0.3, 0.7], [0.27, 0.74], [0.26, 1.18], [0.22, 1.25], [0.001, 1.25]].map(([r, y]) => new THREE.Vector2(r, y)), 48), bak);
    g.add(body);
    for (let i = 0; i < 2; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16), M.steel()); s.rotation.x = Math.PI / 2; s.position.set(0, 0.42 + i * 0.16, 0.3); g.add(s); }
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.17, 0.32, 40), M.brass()); cap.position.y = 1.4; g.add(cap);
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.16, clearcoat: 1, clearcoatRoughness: 0.05, envMapIntensity: 1.6, emissive: 0xffb36b, emissiveIntensity: 0, depthWrite: false });
    const prof = new THREE.SplineCurve([[0.17, 1.52], [0.2, 1.62], [0.32, 1.76], [0.46, 1.92], [0.5, 2.06], [0.47, 2.22], [0.36, 2.38], [0.2, 2.47], [0.001, 2.5]].map(([r, y]) => new THREE.Vector2(r, y))).getPoints(60);
    const bulb = new THREE.Mesh(new THREE.LatheGeometry(prof, 72), glass);
    bulb.castShadow = false; g.add(bulb);
    // stem + supports + coiled filament
    const stemM = new THREE.MeshPhysicalMaterial({ color: 0xe8ecef, roughness: 0.1, transmission: 0.6, transparent: true, opacity: 0.8 });
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, 0.4, 20), stemM); stem.position.y = 1.72; g.add(stem);
    const wm = M.steel();
    g.add(rod(V(-0.02, 1.85, 0), V(-0.15, 2.04, 0), 0.006, wm), rod(V(0.02, 1.85, 0), V(0.15, 2.04, 0), 0.006, wm));
    const filM = new THREE.MeshBasicMaterial({ color: 0xffe2b0 });
    const fil = new THREE.Mesh(new THREE.TubeGeometry(curveOf((u) => { const a = u * 22 * TAU, x = lerp(-0.15, 0.15, u), sag = -0.03 * Math.sin(Math.PI * u); return V(x, 2.04 + sag + 0.014 * Math.cos(a), 0.014 * Math.sin(a)); }), 300, 0.0035, 6), filM);
    g.add(fil);
    const halo = glowSprite(0xffd8a0, 1.3, 0); halo.position.y = 2.03; g.add(halo);
    const halo2 = glowSprite(0xffb870, 2.4, 0); halo2.position.y = 2.03; g.add(halo2);
    const L = new THREE.PointLight(0xffc27a, 0, 0, 2); L.position.set(0, 2.03, 0); L.castShadow = true; L.shadow.mapSize.set(1024, 1024); L.shadow.bias = -0.002; L.shadow.radius = 4; g.add(L);
    shadowAll(body); shadowAll(base); cap.castShadow = true;
    g.userData.F = V(0, 2.04, 0);
    g.userData.set = (on) => {
      const k = clamp(on, 0, 1);
      filM.color.setRGB(lerp(0.12, 1.0, k), lerp(0.05, 0.86, Math.pow(k, 1.3)), lerp(0.03, 0.62, Math.pow(k, 2)));
      halo.material.opacity = 0.42 * k; halo2.material.opacity = 0.1 * k; L.intensity = (night ? 16 : 12) * k; L.visible = k > 0.001;
      glass.emissiveIntensity = 0.04 * k; glass.opacity = 0.1 + 0.03 * k;
    };
    g.userData.set(0);
    return g;
  }

  // ================================================================ POYNTING (hero)
  LABK.poynting = (o) => {
    const mode = o.mode, night = mode === "energy";
    const S = stage("studio", night ? { key: 0.3, hemi: 0.08, rim: 0.3, bg: 0x07080b, floorY: -3 } : { key: 0.8, hemi: 0.18, rim: 0.5, floorY: -3 });
    if (night) S.userData.key.color.set(0x9fb2d8);
    const C = cam(30);
    // table top
    const top = new THREE.Mesh(new THREE.BoxGeometry(30, 0.4, 14), wood("woodTable", [96, 62, 40], 11, 0.62, [5, 3])); top.position.y = -0.2; top.receiveShadow = true; S.add(top);
    const A = 0.32, h = 0.9, XS = -3.55, XE = 3.6, BX = 4.6, R0 = 0.055;
    // source: plain grey enclosure with two brass binding posts and a toggle switch on top
    const src = new THREE.Group(); src.position.set(-4.6, 0, 0); S.add(src);
    const boxM = new THREE.MeshStandardMaterial({ color: 0x6b6f75, metalness: 0.35, roughness: 0.48, map: noiseTex("greyPaint", [255, 255, 255], 0.04, 40, 4) });
    const box = new THREE.Mesh(roundBox(1.8, 1.5, 1.6, 0.08), boxM); box.position.y = 0.8; src.add(box);
    for (const [fx, fz] of [[-0.75, -0.65], [0.75, -0.65], [-0.75, 0.65], [0.75, 0.65]]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.05, 20), M.matte(0x111111)); f.position.set(fx, 0.03, fz); src.add(f); }
    for (const [z, col] of [[-A, 0x8e2a22], [A, 0x1b1b1d]]) {
      const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.05, 28), M.paint(col, 0.35)); ring.rotation.z = Math.PI / 2; ring.position.set(0.92, h, z); src.add(ring);
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.2, 6), M.brass()); post.rotation.z = Math.PI / 2; post.position.set(1.02, h, z); src.add(post);
    }
    const sw = new THREE.Group(); sw.position.set(0.25, 1.55, 0.35); src.add(sw);
    const swBase = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.15, 0.08, 6), M.steel()); sw.add(swBase);
    const lever = new THREE.Group(); sw.add(lever);
    const lv = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.03, 0.34, 16), M.steel()); lv.position.y = 0.17; lever.add(lv);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 16, 12), M.steel()); knob.position.y = 0.34; lever.add(knob);
    shadowAll(src);
    // wires: A (red, +, current +x) at z=-A; B (black, return) at z=+A
    const insA = M.paint(0x8e2a22, 0.42), insB = M.paint(0x1e1e21, 0.4);
    const wirePts = (z) => [V(XS, h, z), V(-1, h, z), V(XE - 0.4, h, z), V(XE, h, z), V(4.05, h, z * 0.6), V(4.3, h, z * 0.42)];
    const cutA = -1.15, cutB = 0.25;
    const wA = tubeAlong(wirePts(-A), R0, insA, 220); S.add(wA);
    if (mode === "fields") {
      // B wire with a cutaway window (front half of the insulation removed) showing the solid copper core
      const p = wirePts(A);
      S.add(tubeAlong([V(XS, h, A), V((XS + cutA) / 2, h, A), V(cutA, h, A)], R0, insB, 40));
      S.add(tubeAlong([V(cutB, h, A), V(1, h, A)].concat(p.slice(2)), R0, insB, 160));
      const half = new THREE.Mesh(new THREE.CylinderGeometry(R0, R0, cutB - cutA, 32, 1, true, Math.PI * 0.42, Math.PI * 1.16), new THREE.MeshStandardMaterial({ color: 0x1e1e21, roughness: 0.4, side: THREE.DoubleSide }));
      half.rotation.z = Math.PI / 2; half.position.set((cutA + cutB) / 2, h, A); S.add(half);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(R0 * 0.7, R0 * 0.7, cutB - cutA + 0.02, 32), M.copper()); core.rotation.z = Math.PI / 2; core.position.set((cutA + cutB) / 2, h, A); S.add(core);
      for (const x of [cutA, cutB]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R0 * 0.82, R0 * 0.2, 8, 32), insB); ring.rotation.y = Math.PI / 2; ring.position.set(x, h, A); S.add(ring); }
    } else S.add(tubeAlong(wirePts(A), R0, insB, 220));
    S.traverse((m) => { if (m.isMesh && !m.castShadow && m.geometry.type === "TubeGeometry") m.castShadow = true; });
    // two small wooden standoffs carrying the wires
    for (const x of [-2.35, 1.9]) {
      const blk = new THREE.Mesh(roundBox(0.32, h - 0.02, 1.15, 0.04), wood("woodLight", [150, 108, 70], 3, 0.55)); blk.position.set(x, (h - 0.02) / 2 - 0.02, 0); blk.rotation.y = Math.PI / 2; blk.castShadow = blk.receiveShadow = true; S.add(blk);
    }
    const lamp = bulbLamp(night); lamp.position.set(BX, 0, 0); S.add(lamp);
    const F = lamp.userData.F.clone().add(lamp.position);

    // ----- exact two-wire fields in the cross-section (z, y about the pair centre)
    function fields(z, y) {
      const E = V(0, 0, 0), B = V(0, 0, 0);
      for (const [z0, q] of [[-A, 1], [A, -1]]) { const dz = z - z0, dy = y, r2 = dz * dz + dy * dy; E.add(V(0, q * dy / r2, q * dz / r2)); B.add(V(1, 0, 0).multiplyScalar(q).cross(V(0, dy, dz)).multiplyScalar(1 / r2)); }
      return { E, B, S: E.clone().cross(B) };
    }
    for (const [z, y] of [[0, 0], [0, 0.5], [-0.8, 0.1], [0.6, -0.4], [0, -0.3]]) console.assert(fields(z, y).S.x > 0, "Poynting must point source -> bulb");

    // ----- field lines (tubes, merged): stations along the wires
    const stations = []; for (let i = 0; i < 9; i++) stations.push(lerp(-2.95, 3.0, i / 8));
    const bList = [], eList = [];
    const ringR = 0.0065;
    stations.forEach((x, si) => {
      // B: Apollonius circles around each wire (exact for antiparallel currents), drawn in the B direction
      [[-A, 1], [A, -1]].forEach(([z0, q]) => [2.3, 1.6, 1.12].forEach((mu, ri) => {
        const cz = Math.sign(z0) * A / Math.tanh(mu), rr = A / Math.sinh(mu);
        let pt = (u) => V(x, h + rr * Math.sin(u * TAU), cz + rr * Math.cos(u * TAU));
        const p0 = pt(0), p1 = pt(0.01), f = fields(p0.z, p0.y - h).B;
        if (p1.clone().sub(p0).dot(f) < 0) { const pp = pt; pt = (u) => pp(1 - u); }
        const g = new THREE.TubeGeometry(curveOf(pt), 64, ringR, 5, true);
        g.userData.a = { aK: [0.08 + ri * 0.28 + si * 0.012], aO: [x, h, z0] }; bList.push(g);
      }));
      // E: circles through both wires, from A (+) to B (−)
      for (const c of [1e3, 2.2, -2.2, 0.75, -0.75]) {
        const cy = c * A, rr = Math.sqrt(A * A + cy * cy), a0 = Math.atan2(0 - cy, -A), a1 = Math.atan2(0 - cy, A);
        // minor arc from A to B
        let da = a1 - a0; while (da > Math.PI) da -= TAU; while (da < -Math.PI) da += TAU;
        const pt = Math.abs(c) > 100 ? (u) => V(x, h, lerp(-A + R0, A - R0, u)) : (u) => { const a = a0 + da * lerp(0.06, 0.94, u); return V(x, h + cy + rr * Math.sin(a), rr * Math.cos(a)); };
        const g = new THREE.TubeGeometry(curveOf(pt), 40, ringR * 1.05, 5, false);
        g.userData.a = { aK: [0.05 + (Math.abs(c) > 100 ? 0 : Math.abs(c) > 1 ? 0.18 : 0.38) + si * 0.012], aO: [x, h, 0] }; eList.push(g);
      }
      // E reaching out: upper loop (major arc) from A over the top to B
      { const cy = -0.9 * A, rr = Math.sqrt(A * A + cy * cy), a0 = Math.atan2(-cy, -A), a1 = Math.atan2(-cy, A); let da = a1 - a0; if (da > 0) da -= TAU;
        const pt = (u) => { const a = a0 + da * lerp(0.04, 0.96, u); return V(x, h + cy + rr * Math.sin(a), rr * Math.cos(a)); };
        // pick the arc that goes over the top
        const mid = pt(0.5); const pt2 = mid.y > h ? pt : (u) => { const a = a0 + (da + TAU) * lerp(0.04, 0.96, u); return V(x, h + cy + rr * Math.sin(a), rr * Math.cos(a)); };
        const g = new THREE.TubeGeometry(curveOf(pt2), 60, ringR * 1.05, 5, false); g.userData.a = { aK: [0.62 + si * 0.012], aO: [x, h, 0] }; eList.push(g); }
    });
    const bMat = fieldMat(0xa9c8ec, 0.6, true), eMat = fieldMat(0xf3cf9a, 0.95, false);
    bMat.uniforms.uDash.value = 2; eMat.uniforms.uDash.value = 1.5;
    const bMesh = new THREE.Mesh(mergeG(bList), bMat), eMesh = new THREE.Mesh(mergeG(eList), eMat);
    bMesh.renderOrder = eMesh.renderOrder = 3; S.add(bMesh, eMesh);

    // ----- energy flow (Poynting streamlines): parallel to the wires in the space around the pair, then turning into the
    // filament from the side. Static amber tubes that draw on from the source; soft pulses travel along them toward the bulb.
    const r = rnd(1884), ST = [], Eref = fields(0, 0).E.lengthSq();
    while (ST.length < 36) {
      const z = (r() * 2 - 1) * 0.9, y = (r() * 2 - 1) * 0.55;
      if (h + y < 0.15) continue;
      if (Math.hypot(z + A, y) < R0 * 2.6 || Math.hypot(z - A, y) < R0 * 2.6) continue;
      const e2 = fields(z, y).E.lengthSq() / Eref;
      if (r() > Math.min(1, 0.1 + e2 * 0.9)) continue;
      const side = Math.abs(z) < 0.1 ? (r() < 0.5 ? -1 : 1) : Math.sign(z), phi = (72 + r() * 34) * D2R;
      ST.push({ z, y, dir: V(-Math.cos(phi), (r() - 0.5) * 0.35, side * Math.sin(phi)).normalize(), lift: r(), k: r() });
    }
    const X1 = 2.7, straightL = X1 - XS, sList = [];
    ST.forEach((s) => {
      const P0 = V(X1, h + s.y, s.z), P1 = V(X1 + 0.8, h + s.y + 0.1 + 0.15 * s.lift, s.z + s.dir.z * 0.25), P2 = F.clone().addScaledVector(s.dir, 0.9), P3 = F.clone().addScaledVector(s.dir, 0.04);
      const f = straightL / (straightL + 2.4), tmp = V(0, 0, 0);
      const g = new THREE.TubeGeometry(curveOf((u) => u < f ? V(lerp(XS, X1, u / f), h + s.y, s.z) : bez(P0, P1, P2, P3, (u - f) / (1 - f), tmp).clone()), 140, 0.0075, 5, false);
      g.userData.a = { aK: [0], aO: [0, 0, 0] }; sList.push(g);
    });
    const sMat = fieldMat(0xe2a050, 0.6, false); sMat.uniforms.uDash.value = 12; sMat.uniforms.uBase.value = 0.1; sMat.blending = THREE.AdditiveBlending;
    const sMesh = new THREE.Mesh(mergeG(sList), sMat); sMesh.renderOrder = 4; S.add(sMesh);
    function drawStreaks(ft, k, front) { sMesh.visible = k > 0.001; sMat.uniforms.uRev.value = k; sMat.uniforms.uT.value = ft * 1.1; sMat.uniforms.uFront.value = front; }
    const dum = new THREE.Object3D();

    // ----- electrons in the cutaway copper core: they only jiggle (thermal + tiny 50 Hz shuffle, shown slowed)
    let elec = null, EL = [];
    if (mode === "fields") {
      const er = rnd(77); for (let i = 0; i < 110; i++) { const a = er() * TAU, rr = Math.sqrt(er()) * R0 * 0.55; EL.push({ x: lerp(cutA + 0.05, cutB - 0.05, er()), y: h + rr * Math.sin(a), z: A + rr * Math.cos(a) * 0.6 + R0 * 0.25, p: er() * 50, q: er() * 50 }); }
      elec = new THREE.InstancedMesh(new THREE.SphereGeometry(0.0075, 10, 8), new THREE.MeshBasicMaterial({ color: 0xcfe2f4 }), EL.length); S.add(elec);
    }
    // ----- speed mode: the switch-on front + a magnified inset of electrons that barely twitch
    let front = null, inset = null;
    if (mode === "speed") {
      front = new THREE.Group(); S.add(front);
      const fm = new THREE.MeshBasicMaterial({ color: 0xffe9c8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      for (const z of [-A, A]) for (const rr of [0.12, 0.22, 0.34]) { const tr = new THREE.Mesh(new THREE.TorusGeometry(rr, 0.006, 6, 64), fm); tr.rotation.y = Math.PI / 2; tr.position.set(0, h, z); front.add(tr); }
      const gs = glowSprite(0xffe2b8, 1.6, 0); gs.position.set(0, h, 0); front.add(gs); front.userData = { fm, gs };
      // inset: a round magnified window (brass rim, dark glass) holding a copper lattice and its electrons
      inset = new THREE.Group(); S.add(inset);
      const rim = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.025, 12, 96), M.brass()); inset.add(rim);
      const back = new THREE.Mesh(new THREE.CircleGeometry(0.62, 64), new THREE.MeshStandardMaterial({ color: 0x0d0f13, roughness: 0.6, metalness: 0.2 })); back.position.z = -0.08; inset.add(back);
      const atoms = [], ir = rnd(5);
      for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) { const x = i * 0.13 + (j % 2 ? 0.065 : 0), y = j * 0.1126; if (Math.hypot(x, y) < 0.54) atoms.push([x, y]); }
      const at = new THREE.InstancedMesh(new THREE.SphereGeometry(0.042, 24, 16), new THREE.MeshStandardMaterial({ color: 0xc27a45, metalness: 0.9, roughness: 0.32 }), atoms.length);
      atoms.forEach(([x, y], i) => { dum.position.set(x, y, -0.04); dum.quaternion.identity(); dum.scale.setScalar(1); dum.updateMatrix(); at.setMatrixAt(i, dum.matrix); }); inset.add(at);
      const ie = []; for (let i = 0; i < 30; i++) { const a = ir() * TAU, rr = Math.sqrt(ir()) * 0.5; ie.push({ x: rr * Math.cos(a), y: rr * Math.sin(a), p: ir() * 40, q: ir() * 40 }); }
      const ei = new THREE.InstancedMesh(new THREE.SphereGeometry(0.014, 12, 10), new THREE.MeshBasicMaterial({ color: 0xd6e7f7 }), ie.length); inset.add(ei);
      const lead = new THREE.Mesh(new THREE.CylinderGeometry(0.004, 0.004, 1, 6), M.light(0xdcd9d1, 0.5)); S.add(lead);
      inset.userData = { ie, ei, lead };
    }

    // ----- timing per mode
    const T0 = o.T0;
    function state(ft) {
      if (mode === "fields") return { bulb: 1, b: seg(ft, 269.92, 273.2), e: seg(ft, 275.2, 278.4), s: seg(ft, 280.1, 281.6), front: 99, sw: 1 };
      if (mode === "speed") { const sw = seg(ft, 296.1, 296.28), fx = lerp(-3.7, 4.4, clamp((ft - 296.3) / 0.62, 0, 1)), arr = ft >= 296.92; return { bulb: arr ? seg(ft, 296.92, 296.98) : 0, b: ft > 296.3 ? 1 : 0, e: ft > 296.3 ? 1 : 0, s: seg(ft, 296.3, 296.9), front: ft > 296.3 ? fx : -99, sw, fx }; }
      if (mode === "energy") return { bulb: 1, b: 1, e: 1, s: 1, front: 99, sw: 1 };
      return { bulb: 1, b: 0, e: 0, s: 0, front: 99, sw: 1 };
    }
    // camera keys [t, tx, ty, tz, dist, az, el]
    const KEYS = {
      intro: [[0, 0.0, 1.0, 0, 13.8, 25, 22], [6.3, 0.2, 1.0, 0, 12.8, 18, 19]],
      fields: [[-5.5, -1.0, 1.0, 0, 14.2, 36, 22], [-2.8, -0.5, 1.0, 0, 13.4, 28, 24], [0, 0, 1.0, 0, 12.6, 21, 25], [2.6, -0.3, 0.92, 0.2, 6.0, 26, 20], [4.8, -0.55, 0.8, 0.32, 2.3, 30, 15], [9.8, -0.25, 0.8, 0.32, 2.0, 42, 13],
        [12.8, 0.2, 0.95, 0.1, 4.6, 55, 16], [16.5, 0.6, 0.95, 0, 4.0, 70, 13], [20.4, 0.8, 0.95, 0, 4.4, 80, 15], [23.0, 1.8, 1.15, 0, 7.6, 44, 20], [26.0, 3.9, 1.35, 0, 5.6, 30, 12], [28.7, 4.1, 1.35, 0, 5.1, 18, 9]],
      speed: [[0, -0.4, 1.05, 0, 9.0, -62, 16], [1.2, -0.2, 1.05, 0, 8.8, -58, 16], [4.5, 0.6, 1.1, 0, 8.2, -46, 20], [9.0, 1.6, 1.0, 0, 7.8, -37, 12], [12.0, 2.0, 1.0, 0, 7.6, -34, 8], [16.3, 2.4, 1.0, 0, 7.3, -31, 6]],
      energy: [[0, 2.2, 1.25, 0, 8.6, 34, 18], [5.9, 2.8, 1.35, 0, 7.4, 20, 16]],
    };
    const K = KEYS[mode] || KEYS.intro;
    const ox = { intro: 20, fields: 0, speed: -70, energy: -80 }[mode] || 0, oy = { intro: 30, energy: 30, speed: 10 }[mode] || 0;
    return (t, d) => {
      const ft = T0 + t, st = state(ft);
      camKeys(C, K, mode === "fields" ? ft - 259.46 : t, ox, mode === "speed" ? lerp(oy, 110, seg(t, 9.5, 11.3)) : oy);
      lamp.userData.set(st.bulb);
      lever.rotation.z = lerp(0.55, -0.55, st.sw);
      bMat.uniforms.uRev.value = st.b; eMat.uniforms.uRev.value = st.e;
      bMat.uniforms.uT.value = ft * 0.35; eMat.uniforms.uT.value = ft * 0.3;
      bMat.uniforms.uFront.value = eMat.uniforms.uFront.value = st.front;
      bMesh.visible = st.b > 0.001; eMesh.visible = st.e > 0.001;
      drawStreaks(ft, st.s, st.front);
      if (elec) EL.forEach((e, i) => { const j = 0.006; dum.position.set(e.x + j * Math.sin(ft * 9.1 + e.p) + 0.003 * Math.sin(ft * TAU * 0.7), e.y + j * 0.6 * Math.sin(ft * 7.3 + e.q), e.z + j * 0.4 * Math.cos(ft * 8.2 + e.p)); dum.quaternion.identity(); dum.scale.setScalar(1); dum.updateMatrix(); elec.setMatrixAt(i, dum.matrix); });
      if (elec) elec.instanceMatrix.needsUpdate = true;
      if (front) {
        const k = st.fx !== undefined && ft > 296.3 ? win(ft, 296.3, 297.3, 0.12) : 0;
        front.visible = k > 0.001; front.position.x = st.fx || 0; front.userData.fm.opacity = 0.6 * k; front.userData.gs.material.opacity = 0.35 * k;
        // inset beside the wire, facing the camera
        const IY = lerp(2.1, 1.92, seg(t, 9.5, 11.3)), P0 = V(0.6, IY, -0.3); inset.position.copy(P0); inset.lookAt(C.position);
        const ik = seg(t, 3.6, 4.6) * lerp(0.8, 0.7, seg(t, 9.5, 11.3)); inset.scale.setScalar(Math.max(0.001, ik)); inset.visible = ik > 0.001;
        const { ie, ei, lead } = inset.userData, nudge = seg(ft, 296.3, 296.6) * (1 - seg(ft, 296.6, 297.2));
        ie.forEach((e, i) => { const sh = 0.012 * Math.sin(ft * TAU * 0.6) * seg(ft, 296.3, 297) + 0.01 * nudge; dum.position.set(e.x + 0.008 * Math.sin(ft * 11 + e.p) + sh, e.y + 0.008 * Math.sin(ft * 9.4 + e.q), 0); dum.quaternion.identity(); dum.scale.setScalar(1); dum.updateMatrix(); ei.setMatrixAt(i, dum.matrix); });
        ei.instanceMatrix.needsUpdate = true;
        const a = V(0.6, h + 0.06, -A), b = P0.clone().addScaledVector(V(0, -1, 0), 0.62 * ik);
        lead.visible = ik > 0.05; lead.position.copy(a).add(b).multiplyScalar(0.5); lead.scale.set(1, Math.max(0.001, a.distanceTo(b)), 1); lead.quaternion.setFromUnitVectors(UP, b.clone().sub(a).normalize());
        lead.material.opacity = 0.45 * ik;
      }
      // pins
      const pins = [];
      if (mode === "fields") {
        pins.push(["magnetic field", stations[3], h + 0.33, -A - 0.05, win(ft, 270.6, 278.2, 0.6)]);
        pins.push(["electric field", stations[6], h - 0.2, 0, win(ft, 275.8, 282.2, 0.6)]);
        pins.push(["energy", 3.35, 1.25, 0.25, win(ft, 283.0, 288.2, 0.6)]);
      }
      if (mode === "speed") { const rt = V(0, 0, 0).setFromMatrixColumn(C.matrixWorld, 0); pins.push(["electrons", 0.6 + rt.x * 0.5, lerp(2.1, 1.92, seg(t, 9.5, 11.3)) - 0.1 + rt.y * 0.5, -0.3 + rt.z * 0.55, win(t, 4.8, 15.6, 0.6)]); }
      return [S, C, pins];
    };
  };

  // ================================================================ GENERATOR / faraday (ported from maxwell3d lab3d.js, kind 'faraday')
  function letterTex(ch, bg, fg) {
    return canvasTex(256, 256, (g) => { g.fillStyle = bg; g.fillRect(0, 0, 256, 256); g.fillStyle = fg; g.font = "bold 150px Arial, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(ch, 128, 136); });
  }
  function barMagnet() {
    const g = new THREE.Group();
    const half = (ch, col, x) => {
      const mats = [M.paint(col), M.paint(col), M.paint(col), M.paint(col), new THREE.MeshStandardMaterial({ map: letterTex(ch, "#" + col.toString(16).padStart(6, "0"), "#f1efe9"), metalness: 0.1, roughness: 0.42 }), M.paint(col)];
      const m = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.8, 0.8), mats); m.position.x = x; m.castShadow = true; g.add(m);
    };
    half("S", 0x2a56a8, -0.75); half("N", 0xb5332b, 0.75);
    const lm = fieldMat(0x8db8e8, 0.4, true); lm.uniforms.uRev.value = 1; lm.uniforms.uDash.value = 1;
    const list = [];
    for (let k = 0; k < 8; k++) for (const L of [2.3, 3.4, 5.0]) {
      const ph = k * Math.PI / 4;
      const gg = new THREE.TubeGeometry(curveOf((u) => { const th = 0.42 + (Math.PI - 0.84) * u, rr = L * Math.sin(th) * Math.sin(th); const x = rr * Math.cos(th) * 0.95, rho = rr * Math.sin(th); return V(x, rho * Math.cos(ph), rho * Math.sin(ph)); }), 60, 0.012, 5, false);
      gg.userData.a = { aK: [0], aO: [0, 0, 0] }; list.push(gg);
    }
    const lines = new THREE.Mesh(mergeG(list), lm); g.add(lines); g.userData.lines = lm;
    return g;
  }
  function meter() {
    const g = new THREE.Group();
    const body = new THREE.Mesh(roundBox(2.6, 1.9, 0.7, 0.06), new THREE.MeshStandardMaterial({ color: 0x1d1f24, roughness: 0.55, metalness: 0.2 })); body.castShadow = true; g.add(body);
    const t = canvasTex(768, 512, (x) => {
      x.fillStyle = "#ece6d6"; x.fillRect(0, 0, 768, 512); x.strokeStyle = "#22242a"; x.fillStyle = "#22242a"; x.lineWidth = 5;
      x.beginPath(); x.arc(384, 470, 330, Math.PI * 1.22, Math.PI * 1.78); x.stroke();
      for (let i = -5; i <= 5; i++) { const a = -Math.PI / 2 + i * 0.176, r0 = i % 5 === 0 ? 290 : 308; x.lineWidth = i % 5 === 0 ? 6 : 3; x.beginPath(); x.moveTo(384 + r0 * Math.cos(a), 470 + r0 * Math.sin(a)); x.lineTo(384 + 330 * Math.cos(a), 470 + 330 * Math.sin(a)); x.stroke(); }
      x.font = "bold 44px Arial, sans-serif"; x.textAlign = "center"; x.fillText("0", 384, 210); x.fillText("−", 150, 300); x.fillText("+", 618, 300); x.font = "bold 40px Arial, sans-serif"; x.fillText("G", 384, 400);
    });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.5), new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 })); face.position.z = 0.36; g.add(face);
    const gl = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 1.5), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 1, transparent: true, opacity: 0.25 })); gl.position.z = 0.42; g.add(gl);
    const piv = new THREE.Group(); piv.position.set(0, -0.63, 0.38);
    const needle = new THREE.Mesh(new THREE.BoxGeometry(0.035, 1.05, 0.02), new THREE.MeshStandardMaterial({ color: 0xb5332b, roughness: 0.4 })); needle.position.y = 0.52; piv.add(needle); g.add(piv);
    for (const sx of [-0.8, 0.8]) { const p = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.3, 20), M.brass()); p.position.set(sx, 1.05, 0); g.add(p); }
    g.userData.piv = piv; return g;
  }
  function faradayScene(o) {
    const S = stage("studio"), C = cam(30);
    const N = 9, RAD = 1.25, LEN = 3.6, hel = [];
    for (let i = 0; i <= N * 40; i++) { const a = i / 40 * TAU; hel.push(V(-LEN / 2 + LEN * i / (N * 40), RAD * Math.cos(a + Math.PI), RAD * Math.sin(a + Math.PI))); }
    const MP = V(5.2, -1.2, 1.6);
    const inL = [V(MP.x - 0.8, MP.y + 1.05, MP.z), V(MP.x - 0.9, 0.6, MP.z + 0.9), V(1.0, -2.25, 2.6), V(-2.2, -2.25, 1.6), V(-2.3, -1.9, 0.3)];
    const outL = [V(2.3, -1.9, 0.2), V(3.0, -2.25, 0.6), V(4.6, -2.2, 0.2), V(MP.x + 1.3, -0.6, MP.z - 0.4), V(MP.x + 0.8, MP.y + 1.05, MP.z)];
    const cIn = new THREE.CatmullRomCurve3(inL.concat([hel[0]])), cHel = new THREE.CatmullRomCurve3(hel), cOut = new THREE.CatmullRomCurve3([hel[hel.length - 1]].concat(outL));
    const tube = (curve, n, r, mat) => { const m = new THREE.Mesh(new THREE.TubeGeometry(curve, n, r, 12, false), mat); m.castShadow = true; S.add(m); return m; };
    tube(cHel, N * 60, 0.085, M.copper()); tube(cIn, 80, 0.06, M.paint(0x8a2a24)); tube(cOut, 80, 0.06, M.paint(0x23252b));
    // a wooden former under the coil so it rests on something real
    const former = new THREE.Mesh(new THREE.CylinderGeometry(1.12, 1.12, LEN + 0.4, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x8a6a48, roughness: 0.7, side: THREE.DoubleSide, map: woodTex("woodLight", [150, 108, 70], 3) }));
    former.rotation.z = Math.PI / 2; S.add(former);
    for (const sx of [-1.4, 1.4]) { const st = new THREE.Mesh(roundBox(0.5, 1.2, 1.6, 0.05), wood("woodDark", [92, 58, 36], 5, 0.5)); st.position.set(sx, -1.8, 0); st.castShadow = st.receiveShadow = true; S.add(st); }
    const mag = barMagnet(); S.add(mag);
    const met = meter(); met.position.copy(MP); met.rotation.set(-0.12, -0.35, 0); S.add(met);
    // current marks: chevrons inside the coil only; they NUDGE by the charge displaced (∝ flux change), never stream
    const NCH = 36, chev = new THREE.InstancedMesh(new THREE.ConeGeometry(0.085, 0.24, 12), new THREE.MeshBasicMaterial({ color: 0xf5cf96, transparent: true, opacity: 0 }), NCH);
    chev.renderOrder = 5; S.add(chev);
    const dum = new THREE.Object3D();
    // magnet x(t): on screen at t=0 near the coil mouth, pushed in 3.6-5.9 (needle peak ~5.0), pulled out 7.6-9.4
    const X0 = -5.9, X1 = -1.0, TP = [3.6, 5.9, 7.6, 9.4];
    const mx = (t) => t < TP[0] ? -6.7 + 0.8 * clamp(t / TP[0], -1, 1) : t < TP[2] ? lerp(X0, X1, seg(t, TP[0], TP[1])) : lerp(X1, X0 - 0.3, seg(t, TP[2], TP[3])) - 0.2 * Math.max(0, t - TP[3]);
    const cpl = (x) => Math.exp(-Math.pow((x + 3.6) / 2.1, 2));
    const GX = []; { let s = 0; for (let i = 0; i <= 400; i++) { const x = -8.5 + 8 * i / 400; s += cpl(x) * 8 / 400; GX.push(s); } }
    const G = (x) => { const u = clamp((x + 8.5) / 8, 0, 1) * 400, i = Math.floor(u); return lerp(GX[i], GX[Math.min(400, i + 1)], u - i); };
    return (t, d) => {
      const p = t / d;
      const az = lerp(-22, 10, p * 0.35 + 0.65 * smooth(p)), el = 17, dist = lerp(23, 20.5, p);
      aim(C, V(0.3, -0.5, 0), dist, az, el, 0, -30);
      const x = mx(t), v = (mx(t + 0.02) - mx(t - 0.02)) / 0.04, I = v * cpl(x);
      mag.position.set(x, 0, 0);
      met.userData.piv.rotation.z = -clamp(I * 0.42, -0.85, 0.85) + 0.012 * Math.sin(t * 7.0) * clamp(Math.abs(I), 0, 1);
      const shift = (G(x) - G(X0)) * 0.012, op = clamp(0.25 + Math.abs(I) * 1.4, 0, 1) * seg(t, 3.2, 4.0) * (1 - seg(t, 9.8, 10.8)) + 0.0;
      chev.material.opacity = op; chev.visible = op > 0.01;
      if (chev.visible) for (let i = 0; i < NCH; i++) {
        const u = clamp(0.04 + 0.92 * i / (NCH - 1) + shift, 0, 1), pt = cHel.getPointAt(u), tg = cHel.getTangentAt(u).multiplyScalar(I >= 0 ? 1 : -1);
        pt.add(V(0, pt.y, pt.z).normalize().multiplyScalar(0.16));
        dum.position.copy(pt); dum.quaternion.setFromUnitVectors(UP, tg.normalize()); dum.scale.setScalar(1); dum.updateMatrix(); chev.setMatrixAt(i, dum.matrix);
      }
      chev.instanceMatrix.needsUpdate = true;
      return [S, C, [["galvanometer", MP.x - 0.3, MP.y + 1.2, MP.z, win(t, 6.0, 10.4, 0.6)]]];
    };
  }

  LABK.generator = (o) => (o.mode === "faraday" ? faradayScene(o) : stationScene(o));

  // ================================================================ ROOM: where the energy goes
  // single warm ramp "infrared" tint patched into standard materials: hotter (orange) near the bulb, faint dark red elsewhere
  const HU = { uHeat: { value: 0 }, uBulb: { value: new V3() } };
  function heatPatch(m) {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uHeat = HU.uHeat; sh.uniforms.uBulb = HU.uBulb;
      sh.vertexShader = sh.vertexShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP;").replace("#include <project_vertex>", "#include <project_vertex>\nvWP = (modelMatrix * vec4(transformed, 1.0)).xyz;");
      sh.fragmentShader = sh.fragmentShader.replace("#include <common>", "#include <common>\nvarying vec3 vWP; uniform float uHeat; uniform vec3 uBulb;")
        .replace("#include <emissivemap_fragment>", "#include <emissivemap_fragment>\n float hk = uHeat * exp(-distance(vWP, uBulb) * 0.7); totalEmissiveRadiance += mix(vec3(0.3, 0.03, 0.0), vec3(0.95, 0.42, 0.1), clamp(hk * 1.4, 0.0, 1.0)) * hk * 0.6; diffuseColor.rgb *= 1.0 - 0.2 * uHeat;");
    };
    return m;
  }
  const tileTex = () => pixTex("tiles", 1024, 1024, (x, y) => {
    const tx = Math.floor(x / 256), ty = Math.floor(y / 256), gx = x % 256, gy = y % 256, grout = gx < 3 || gy < 3;
    if (grout) return [120, 112, 100];
    const v = 0.93 + 0.06 * hash(tx, ty, 3), m = fbm(x / 90 + tx * 7, y / 140, 31 + tx + ty * 4, 5), vein = Math.pow(1 - Math.abs(Math.sin((x * 0.6 + y + m * 260) / 60)), 18) * 0.12;
    const k = v * (0.92 + 0.12 * m) - vein; return [212 * k, 202 * k, 186 * k];
  });
  const plasterTex = () => noiseTex("plaster", [214, 203, 186], 0.035, 60, 21);
  const fabricTex = (key, base) => pixTex(key, 256, 256, (x, y) => { const k = 0.9 + 0.06 * Math.sin(x * 1.9) * Math.sin(y * 1.9) + 0.08 * (fbm(x / 30, y / 30, 5, 3) - 0.5); return [base[0] * k, base[1] * k, base[2] * k]; });

  function ledBulb() {
    // LED bulb hanging dome-down from a white batten holder (metres)
    const g = new THREE.Group();
    const white = heatPatch(new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.45 }));
    const neck = new THREE.Mesh(new THREE.LatheGeometry(new THREE.SplineCurve([[0.012, 0.0], [0.016, -0.006], [0.02, -0.03], [0.029, -0.052], [0.031, -0.058]].map(([r, y]) => new THREE.Vector2(r, y))).getPoints(24), 48), white); g.add(neck);
    const alu = new THREE.Mesh(new THREE.CylinderGeometry(0.0315, 0.0315, 0.004, 48), new THREE.MeshStandardMaterial({ color: 0xc8ccd2, metalness: 1, roughness: 0.3 })); alu.position.y = -0.058; g.add(alu);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.0115, 0.0115, 0.022, 32), new THREE.MeshStandardMaterial({ color: 0xd8dade, metalness: 1, roughness: 0.25 })); cap.position.y = 0.011; g.add(cap);
    const domeM = new THREE.MeshStandardMaterial({ color: 0xf6f3ee, roughness: 0.6, emissive: 0xfff1de, emissiveIntensity: 1.1 });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.031, 48, 24, 0, TAU, Math.PI * 0.42, Math.PI * 0.58), domeM); dome.position.y = -0.052; g.add(dome);
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.022, 0.06, 32), white); holder.position.y = 0.05; g.add(holder);
    const cord = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 1, 10), heatPatch(new THREE.MeshStandardMaterial({ color: 0xe9e6df, roughness: 0.5 }))); cord.position.y = 0.58; g.add(cord);
    const halo = glowSprite(0xfff0dc, 0.22, 0.35); halo.position.y = -0.07; g.add(halo);
    g.userData.C = V(0, -0.075, 0);
    return g;
  }
  // fresnel shell for light wavefronts
  const shellMat = () => new THREE.ShaderMaterial({ uniforms: { col: { value: new THREE.Color(0xfff0dc) }, op: { value: 0 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: "varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 col; uniform float op; varying vec3 vN; varying vec3 vV; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); gl_FragColor = vec4(col * op * pow(f, 1.6) * (1.0 - f) * 3.2, 1.0); }" });

  function roomLight(o) {
    const S = stage("void", { dust: 0, key: 0, hemi: 0, rim: 0.02, bg: 0x030405 }), C = cam(38); S.environment = null;
    const W2 = 2.3, D2 = 2.6, HT = 3.0;
    const wallM = heatPatch(new THREE.MeshStandardMaterial({ color: 0xffffff, map: plasterTex(), roughness: 0.92 }));
    const ceilM = heatPatch(new THREE.MeshStandardMaterial({ color: 0xf4f2ee, roughness: 0.95 }));
    const floorT = tileTex().clone(); floorT.repeat.set(1.9, 2.2); floorT.needsUpdate = true;
    const floorM = heatPatch(new THREE.MeshStandardMaterial({ map: floorT, roughness: 0.32, metalness: 0 }));
    // room shell from inward-facing planes
    for (const [w, h, m, x, y, z, rx, ry] of [[W2 * 2, D2 * 2, floorM, 0, 0, 0, -Math.PI / 2, 0], [W2 * 2, D2 * 2, ceilM, 0, HT, 0, Math.PI / 2, 0], [W2 * 2, HT, wallM, 0, HT / 2, -D2, 0, 0], [W2 * 2, HT, wallM, 0, HT / 2, D2, 0, Math.PI],
      [D2 * 2, HT, wallM, -W2, HT / 2, 0, 0, Math.PI / 2], [D2 * 2, HT, wallM, W2, HT / 2, 0, 0, -Math.PI / 2]]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(w, h), m); pl.position.set(x, y, z); pl.rotation.set(rx, ry, 0, "YXZ"); pl.receiveShadow = true; S.add(pl); }
    const woodD = heatPatch(wood("woodRoom", [110, 72, 46], 13, 0.5)), woodL = heatPatch(wood("woodLam", [160, 120, 84], 17, 0.45));
    const add = (geo, mat, x, y, z, ry) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (ry) m.rotation.y = ry; m.castShadow = m.receiveShadow = true; S.add(m); return m; };
    // bed against the back wall
    add(new THREE.BoxGeometry(1.7, 0.3, 2.05), woodD, -0.55, 0.25, -1.55);
    add(new THREE.BoxGeometry(1.75, 1.0, 0.07), woodD, -0.55, 0.62, -2.56);
    add(roundBox(1.6, 0.2, 1.98, 0.06), heatPatch(new THREE.MeshStandardMaterial({ color: 0xf1ede4, roughness: 0.9, map: fabricTex("sheet", [240, 236, 228]) })), -0.55, 0.5, -1.55);
    const duvet = add(roundBox(1.66, 0.12, 1.35, 0.055), heatPatch(new THREE.MeshPhysicalMaterial({ color: 0x5b7472, roughness: 0.85, sheen: 0.6, sheenColor: new THREE.Color(0x9fb3b0), map: fabricTex("duvet", [255, 255, 255]) })), -0.55, 0.62, -1.18);
    duvet.rotation.x = -0.02;
    for (const x of [-0.95, -0.15]) { const pl = add(new THREE.SphereGeometry(0.5, 32, 16), heatPatch(new THREE.MeshPhysicalMaterial({ color: 0xece5d6, roughness: 0.9, sheen: 0.5, sheenColor: new THREE.Color(0xffffff) })), x, 0.67, -2.25); pl.scale.set(0.68, 0.16, 0.36); }
    // nightstand + book + water glass
    add(roundBox(0.5, 0.55, 0.42, 0.02), woodD, 0.65, 0.275, -2.3);
    add(new THREE.BoxGeometry(0.44, 0.006, 0.006), new THREE.MeshStandardMaterial({ color: 0x3a2a1c }), 0.65, 0.4, -2.085);
    add(new THREE.BoxGeometry(0.22, 0.035, 0.16), heatPatch(M.paint(0x6d3b2f, 0.6)), 0.58, 0.57, -2.28, 0.3);
    add(new THREE.CylinderGeometry(0.032, 0.028, 0.11, 24, 1, true), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.25, side: THREE.DoubleSide }), 0.78, 0.61, -2.22);
    // wardrobe on the right wall, chair, rug
    add(roundBox(0.6, 2.1, 1.4, 0.02), woodL, W2 - 0.31, 1.05, -1.5);
    add(new THREE.BoxGeometry(0.01, 1.9, 0.004), new THREE.MeshStandardMaterial({ color: 0x5a4632 }), W2 - 0.615, 1.1, -1.5);
    for (const z of [-1.58, -1.42]) add(new THREE.CylinderGeometry(0.008, 0.008, 0.18, 12), M.steel(), W2 - 0.63, 1.15, z);
    add(new THREE.BoxGeometry(1.6, 0.012, 1.1), heatPatch(new THREE.MeshStandardMaterial({ color: 0x8a5a48, roughness: 0.95, map: fabricTex("rug", [200, 160, 140]) })), -0.4, 0.006, 0.05);
    const chair = new THREE.Group(); chair.position.set(1.25, 0, 0.3); chair.rotation.y = -1.9; S.add(chair);
    const cAdd = (geo, x, y, z) => { const m = new THREE.Mesh(geo, woodD); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; chair.add(m); };
    cAdd(new THREE.BoxGeometry(0.44, 0.04, 0.42), 0, 0.45, 0); for (const [x, z] of [[-0.19, -0.18], [0.19, -0.18], [-0.19, 0.18], [0.19, 0.18]]) cAdd(new THREE.BoxGeometry(0.035, 0.45, 0.035), x, 0.225, z);
    for (const x of [-0.19, 0.19]) cAdd(new THREE.BoxGeometry(0.035, 0.5, 0.035), x, 0.7, -0.18); cAdd(new THREE.BoxGeometry(0.42, 0.12, 0.025), 0, 0.88, -0.18);
    // window on the left wall: night outside, frame, curtains
    const win3 = new THREE.Group(); win3.position.set(-W2 + 0.01, 1.55, 0.6); win3.rotation.y = Math.PI / 2; S.add(win3);
    const night = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 1.3), new THREE.MeshBasicMaterial({ map: canvasTex(256, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#060a14"); gr.addColorStop(0.75, "#101a2c"); gr.addColorStop(1, "#1d2230"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); const rr = rnd(9); for (let i = 0; i < 40; i++) { g.fillStyle = "rgba(255," + (190 + rr() * 50 | 0) + ",120," + (0.4 + rr() * 0.5) + ")"; g.fillRect(rr() * 256, 190 + rr() * 50, 1.5, 1.5); } }) })); win3.add(night);
    const frM = heatPatch(new THREE.MeshStandardMaterial({ color: 0xece8e0, roughness: 0.5 }));
    for (const [w, h, x, y] of [[1.4, 0.06, 0, 0.67], [1.4, 0.06, 0, -0.67], [0.06, 1.4, 0.67, 0], [0.06, 1.4, -0.67, 0], [0.04, 1.3, 0, 0]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.06), frM); f.position.set(x, y, 0.03); win3.add(f); }
    const curtM = heatPatch(new THREE.MeshPhysicalMaterial({ color: 0xc9b89a, roughness: 0.9, sheen: 0.5, sheenColor: new THREE.Color(0xffffff), side: THREE.DoubleSide }));
    for (const sx of [-1, 1]) { const cg = new THREE.PlaneGeometry(0.55, 2.2, 40, 1), pp = cg.attributes.position; for (let i = 0; i < pp.count; i++) pp.setZ(i, 0.04 * Math.sin(pp.getX(i) * 34) + 0.06); cg.computeVertexNormals(); const c = new THREE.Mesh(cg, curtM); c.position.set(sx * 0.82, -0.2, 0.05); c.castShadow = c.receiveShadow = true; win3.add(c); }
    // ceiling fan (slowly turning), picture frame, skirting
    const fan = new THREE.Group(); fan.position.set(-1.0, 2.62, -0.9); S.add(fan);
    const fanM = heatPatch(new THREE.MeshStandardMaterial({ color: 0xe9e5dc, roughness: 0.4, metalness: 0.1 }));
    { const rodm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.36, 12), fanM); rodm.position.y = 0.2; fan.add(rodm); const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.08, 0.1, 32), fanM); fan.add(hub); }
    const blades = new THREE.Group(); fan.add(blades);
    for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(roundBox(0.55, 0.012, 0.11, 0.004), fanM); b.position.set(Math.cos(i * TAU / 3) * 0.36, -0.03, Math.sin(i * TAU / 3) * 0.36); b.rotation.y = -i * TAU / 3; b.rotation.x = 0.08; b.castShadow = true; blades.add(b); }
    const pic = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.44, 0.025), woodD); pic.position.set(-0.55, 1.6, -2.585); S.add(pic);
    const art = new THREE.Mesh(new THREE.PlaneGeometry(0.54, 0.36), heatPatch(new THREE.MeshStandardMaterial({ roughness: 0.8, map: canvasTex(256, 170, (g) => { const gr = g.createLinearGradient(0, 0, 0, 170); gr.addColorStop(0, "#b9c4c6"); gr.addColorStop(0.55, "#d9cdb4"); gr.addColorStop(0.56, "#7d8a72"); gr.addColorStop(1, "#5d6a55"); g.fillStyle = gr; g.fillRect(0, 0, 256, 170); g.fillStyle = "#6f7d73"; g.beginPath(); g.moveTo(0, 100); g.lineTo(70, 60); g.lineTo(130, 92); g.lineTo(190, 52); g.lineTo(256, 95); g.lineTo(256, 170); g.lineTo(0, 170); g.fill(); }) }))); art.position.set(-0.55, 1.6, -2.571); S.add(art);
    for (const [w, d, x, z, ry] of [[W2 * 2, 0, 0, -D2 + 0.006, 0], [D2 * 2, 0, -W2 + 0.006, 0, Math.PI / 2], [D2 * 2, 0, W2 - 0.006, 0, Math.PI / 2]]) { const sk = new THREE.Mesh(new THREE.BoxGeometry(w, 0.08, 0.012), frM); sk.position.set(x, 0.04, z); sk.rotation.y = ry; S.add(sk); }
    // the bulb, light and wavefronts
    const bulb = ledBulb(); bulb.position.set(0, 2.42, 0.25); S.add(bulb); shadowAll(bulb, false, true);
    const BC = bulb.userData.C.clone().add(bulb.position); HU.uBulb.value.copy(BC);
    const L = new THREE.PointLight(0xffdcb4, 2.6, 0, 2); L.position.copy(BC).add(V(0, -0.02, 0)); L.castShadow = true; L.shadow.mapSize.set(2048, 2048); L.shadow.bias = -0.006; L.shadow.normalBias = 0.02; L.shadow.radius = 5; L.shadow.camera.near = 0.05; S.add(L);
    const moon = new THREE.DirectionalLight(0x7f96c4, 0.05); moon.position.set(-8, 3, 1); S.add(moon);
    S.add(new THREE.HemisphereLight(0x0c0b0a, 0x6a5a48, 0.14)); // faint bounce from the lit floor onto the ceiling
    const shells = []; for (let i = 0; i < 12; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), shellMat()); m.position.copy(BC); m.renderOrder = 6; S.add(m); shells.push(m); }
    const T0 = o.T0, E0 = 437.12, GAP = 0.42, SP = 1.35;
    const K = [[0, BC.x, BC.y - 0.01, BC.z, 0.5, 28, -10], [2.2, BC.x, BC.y - 0.05, BC.z, 1.1, 18, -6], [6.4, 0.0, 1.45, -0.6, 3.5, 36, 6], [14, -0.1, 1.35, -0.7, 3.45, 30, 7], [20.7, -0.2, 1.3, -0.8, 3.3, 22, 8]];
    return (t, d) => {
      const ft = T0 + t;
      const ox = -380 * win(t, 1.0, 6.6, 1.6), oy = 110 * win(t, 1.0, 6.6, 1.6);
      camKeys(C, K, t, ox, oy);
      const kmax = Math.floor((ft - E0) / GAP);
      shells.forEach((m, j) => {
        const k = kmax - j, r = (ft - E0 - k * GAP) * SP;
        const ok = ft > E0 && k >= 0 && r > 0.02 && r < 6;
        m.visible = ok; if (!ok) return;
        m.scale.setScalar(r); m.material.uniforms.op.value = 0.09 * smooth(r / 0.15) * (1 - smooth((r - 0.6) / 2.2));
      });
      HU.uHeat.value = seg(ft, 450.02, 454.5); blades.rotation.y = ft * 1.4;
      return [S, C];
    };
  }

  // ---- house exterior at night: heat leaking out as faint warm rising air
  const softTex = () => TC.soft || (TC.soft = canvasTex(128, 128, (g) => { const im = g.createImageData(128, 128), D = im.data; for (let y = 0; y < 128; y++) for (let x = 0; x < 128; x++) { const dx = (x - 63.5) / 63.5, dy = (y - 63.5) / 63.5, r = Math.sqrt(dx * dx + dy * dy), n = fbm(x / 18, y / 18, 3, 4); const a = Math.pow(clamp(1 - r, 0, 1), 1.6) * (0.55 + 0.9 * (n - 0.35)); const i = (y * 128 + x) * 4; D[i] = D[i + 1] = D[i + 2] = 255; D[i + 3] = 255 * clamp(a, 0, 1); } g.putImageData(im, 0, 0); }));
  function roomHeat(o) {
    const S = stage("void", { dust: 0, key: 0, hemi: 0.1, rim: 0.12, bg: 0x070a12 }), C = cam(34); S.environment = null;
    // sky dome with a faint city glow at the horizon
    S.add(new THREE.Mesh(new THREE.SphereGeometry(300, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, depthWrite: false, map: canvasTex(16, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, "#04060c"); gr.addColorStop(0.42, "#0a1020"); gr.addColorStop(0.495, "#2a2421"); gr.addColorStop(0.52, "#0b0c10"); gr.addColorStop(1, "#050506"); g.fillStyle = gr; g.fillRect(0, 0, 16, 512); }) })));
    S.add(L3.stars(12, 1500));
    const moon = new THREE.DirectionalLight(0x8ea4cc, 0.3); moon.position.set(-20, 30, 15); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); Object.assign(moon.shadow.camera, { left: -25, right: 25, top: 25, bottom: -25, far: 120 }); S.add(moon);
    S.fog = new THREE.Fog(0x090c14, 35, 150);
    const gT = noiseTex("asphalt", [40, 39, 38], 0.25, 20, 8).clone(); gT.repeat.set(60, 60); gT.needsUpdate = true;
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0xffffff, map: gT, roughness: 0.95 }));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; S.add(ground);
    const plas = (c) => new THREE.MeshStandardMaterial({ color: c, map: noiseTex("ext", [255, 255, 255], 0.08, 30, 41), roughness: 0.9 });
    const add = (geo, mat, x, y, z, par) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (par || S).add(m); return m; };
    const winTex = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 40, 4, 32, 32, 46); gr.addColorStop(0, "#ffffff"); gr.addColorStop(1, "#8a6a50"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    const glowWin = (k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffc27a).multiplyScalar(k), map: winTex });
    const plumes = [];
    function house(x, z, w, h, d, col, lit, seed, main) {
      const g = new THREE.Group(); g.position.set(x, 0, z); S.add(g);
      add(new THREE.BoxGeometry(w, h, d), plas(col), 0, h / 2, 0, g);
      const pm = plas(col);
      add(new THREE.BoxGeometry(w + 0.1, 0.8, 0.18), pm, 0, h + 0.4, d / 2 - 0.04, g); add(new THREE.BoxGeometry(w + 0.1, 0.8, 0.18), pm, 0, h + 0.4, -d / 2 + 0.04, g);
      add(new THREE.BoxGeometry(0.18, 0.8, d), pm, w / 2 - 0.04, h + 0.4, 0, g); add(new THREE.BoxGeometry(0.18, 0.8, d), pm, -w / 2 + 0.04, h + 0.4, 0, g);
      const rr = rnd(seed), floors = Math.round(h / 3.1), per = Math.max(1, Math.round(w / 3.2));
      for (let f = 0; f < floors; f++) for (let i = 0; i < per; i++) {
        const wx = -w / 2 + (i + 0.5) * w / per, wy = 1.6 + f * 3.1, on = lit && rr() < (main ? 0.85 : 0.55), k = on ? 0.55 + 0.6 * rr() : 0.03;
        add(new THREE.PlaneGeometry(1.3, 1.4), glowWin(k), wx, wy, d / 2 + 0.01, g).castShadow = false;
        add(new THREE.BoxGeometry(1.6, 0.08, 0.5), pm, wx, wy + 0.85, d / 2 + 0.22, g);
        for (let b = 0; b < 4; b++) add(new THREE.BoxGeometry(0.025, 1.4, 0.025), M.paint(0x2b2b2e, 0.5), wx - 0.48 + b * 0.32, wy, d / 2 + 0.05, g);
        if (on) { plumes.push({ x: x + wx, y: wy + 0.9, z: z + d / 2 + 0.4, s: rr() * 100 }); if (main) { const pl = new THREE.PointLight(0xffb36a, 0.9 * k, 7, 2); pl.position.set(x + wx, wy, z + d / 2 + 1.0); S.add(pl); } }
      }
      for (let i = 0; i < (main ? 7 : 3); i++) plumes.push({ x: x + (rr() - 0.5) * w * 0.8, y: h + 0.8, z: z + (rr() - 0.5) * d * 0.6, s: rr() * 100, roof: 1 });
      return g;
    }
    house(0, 0, 8, 6.2, 7, 0xd8ccb4, true, 3, true);
    // a sodium street lamp on the pavement
    { const pole = M.paint(0x3a3c40, 0.5); add(new THREE.CylinderGeometry(0.08, 0.1, 6.5, 12), pole, 6.2, 3.25, 6.5); add(new THREE.BoxGeometry(1.4, 0.08, 0.08), pole, 5.6, 6.45, 6.5);
      const lampH = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.14, 0.3), new THREE.MeshBasicMaterial({ color: 0xffb35a })); lampH.position.set(5.0, 6.36, 6.5); S.add(lampH);
      const sl = new THREE.SpotLight(0xffa850, 60, 22, 0.9, 0.7, 2); sl.position.set(5.0, 6.3, 6.5); sl.target.position.set(4.5, 0, 6.0); sl.castShadow = true; sl.shadow.mapSize.set(1024, 1024); S.add(sl, sl.target);
      const gs = glowSprite(0xffb060, 2.2, 0.35); gs.position.set(5.0, 6.3, 6.5); S.add(gs);
      add(new THREE.BoxGeometry(40, 0.18, 2.2), new THREE.MeshStandardMaterial({ color: 0x5a5852, roughness: 0.9 }), 0, 0.09, 6.2); }
    // water tank on the roof, door, balcony slab + railing
    add(new THREE.CylinderGeometry(0.7, 0.7, 1.2, 32), M.paint(0x161618, 0.55), 2.2, 7.0, -1.5);
    add(new THREE.BoxGeometry(1.1, 2.2, 0.08), wood("woodDoor", [90, 56, 34], 23, 0.6), -2.6, 1.1, 3.52);
    add(new THREE.BoxGeometry(8.2, 0.16, 1.2), plas(0xd0c4ac), 0, 3.1, 4.05);
    for (let i = 0; i < 22; i++) add(new THREE.BoxGeometry(0.03, 0.9, 0.03), M.paint(0x2b2b2e, 0.5), -3.9 + i * 0.37, 3.62, 4.6);
    add(new THREE.BoxGeometry(8.2, 0.05, 0.05), M.paint(0x2b2b2e, 0.5), 0, 4.08, 4.6);
    house(-13, -5, 7, 9.3, 8, 0xb8b0a2, true, 7); house(12.5, -4, 7.5, 6.2, 7, 0xc9bda8, true, 11); house(-3, -20, 9, 12.4, 8, 0xa9a297, true, 13); house(12, -22, 8, 9.3, 8, 0xbdb2a0, true, 17); house(-16, -24, 8, 6.2, 8, 0xb0a898, true, 19);
    // distant city lights
    { const gg = new THREE.BufferGeometry(), p = [], c = [], r = rnd(99); for (let i = 0; i < 2600; i++) { const a = r() * Math.PI - Math.PI, dd = 40 + Math.pow(r(), 0.7) * 160; p.push(Math.cos(a) * dd * 1.6, 0.3 + r() * (r() < 0.1 ? 12 : 2.5), Math.sin(a) * dd - 10); const w = r() < 0.7; c.push(1, w ? 0.72 : 0.92, w ? 0.42 : 0.82); }
      gg.setAttribute("position", new THREE.Float32BufferAttribute(p, 3)); gg.setAttribute("color", new THREE.Float32BufferAttribute(c, 3)); S.add(new THREE.Points(gg, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, vertexColors: true, transparent: true, opacity: 0.85, depthWrite: false }))); }
    // rising warm air: soft noisy sprites, very faint
    const mk = (c) => plumes.map(() => { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: c, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(m); return m; });
    const sp = mk(0xffa868), sp2 = mk(0xff9a5a);
    const T0 = o.T0;
    return (t, d) => {
      const ft = T0 + t, p = t / d;
      aim(C, V(0.5, 5.2, -2), lerp(34, 30, p), lerp(22, 10, p * 0.4 + 0.6 * smooth(p)), lerp(11, 14, p), 0, 30);
      plumes.forEach((pl, i) => [sp[i], sp2[i]].forEach((m, j) => {
        const q = fr(pl.s * 0.137 + j * 0.5 + ft * (pl.roof ? 0.09 : 0.12)), rise = (pl.roof ? 6 : 3.2) * q;
        m.position.set(pl.x + Math.sin(ft * 0.7 + pl.s + q * 3) * 0.35 * q, pl.y + rise, pl.z + (pl.roof ? 0 : 0.4 * q));
        m.scale.setScalar((pl.roof ? 2.6 : 1.5) + q * 3.6); m.material.rotation = pl.s + q * 1.5;
        m.material.opacity = (pl.roof ? 0.2 : 0.22) * Math.sin(Math.PI * q);
      }));
      return [S, C];
    };
  }

  // ---- Earth's night side from orbit (continuous by film time across space and space2)
  function roomSpace(o) {
    const S = stage("space", { stars: 6000, key: 0, hemi: 0, rim: 0 }), C = cam(30);
    const sun = V(-0.6, 0.22, -0.77).normalize(), RE = 5;
    const earthM = new THREE.ShaderMaterial({
      uniforms: { day: { value: L3.tex("2k_earth_daymap.jpg") }, night: { value: L3.tex("2k_earth_nightmap.jpg") }, clouds: { value: L3.tex("2k_earth_clouds.jpg") }, sunDir: { value: sun }, uIR: { value: 1 } },
      vertexShader: "varying vec2 vUv; varying vec3 vN; varying vec3 vP; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.0); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }",
      fragmentShader: `uniform sampler2D day, night, clouds; uniform vec3 sunDir; uniform float uIR; varying vec2 vUv; varying vec3 vN; varying vec3 vP;
        void main(){ vec3 n = normalize(vN); float ndl = dot(n, sunDir); vec3 v = normalize(cameraPosition - vP);
          vec3 dayC = texture2D(day, vUv).rgb; float cl = texture2D(clouds, vUv).r;
          vec3 col = dayC * max(ndl, 0.0) * 1.5;
          float nk = smoothstep(0.08, -0.18, ndl);
          vec3 lights = texture2D(night, vUv).rgb; lights = pow(lights, vec3(1.2)) * vec3(1.0, 0.8, 0.52) * 4.2 * (1.0 - cl * 0.6);
          col += lights * nk;
          col = mix(col, vec3(0.95) * max(ndl, 0.0) * 1.35 + vec3(0.012, 0.016, 0.026) * nk, cl * 0.75);
          float fres = pow(1.0 - max(dot(n, v), 0.0), 2.5);
          col += vec3(0.32, 0.55, 1.0) * fres * smoothstep(-0.12, 0.45, ndl) * 0.9;
          col += vec3(0.5, 0.17, 0.05) * fres * nk * uIR * 0.16;
          gl_FragColor = vec4(col, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
    const earth = new THREE.Mesh(new THREE.SphereGeometry(RE, 128, 64), earthM); S.add(earth);
    // outer atmosphere halo (blue on the day limb, faint warm on the night side)
    const atm = new THREE.Mesh(new THREE.SphereGeometry(RE * 1.035, 96, 48), new THREE.ShaderMaterial({ uniforms: { sunDir: { value: sun } }, side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: "varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.0); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }",
      fragmentShader: "uniform vec3 sunDir; varying vec3 vN; varying vec3 vP; void main(){ vec3 v = normalize(cameraPosition - vP); float f = pow(max(dot(normalize(vN), v), 0.0), 5.0); float d = dot(-normalize(vN), sunDir); vec3 c = mix(vec3(0.5, 0.17, 0.05) * 0.35, vec3(0.35, 0.6, 1.0), smoothstep(-0.3, 0.5, d)); gl_FragColor = vec4(c * f * 1.1, 1.0); }" }));
    S.add(atm);
    // infrared leaving: faint warm shells drifting outward from the night side
    const irM = () => new THREE.ShaderMaterial({ uniforms: { op: { value: 0 }, sunDir: { value: sun } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: "varying vec3 vN; varying vec3 vP; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 wp = modelMatrix * vec4(position,1.0); vP = wp.xyz; gl_Position = projectionMatrix * viewMatrix * wp; }",
      fragmentShader: "uniform float op; uniform vec3 sunDir; varying vec3 vN; varying vec3 vP; void main(){ vec3 v = normalize(cameraPosition - vP); float f = 1.0 - abs(dot(normalize(vN), v)); float night = smoothstep(0.3, -0.4, dot(normalize(vN), sunDir)); gl_FragColor = vec4(vec3(0.85, 0.38, 0.14) * op * pow(f, 1.6) * (1.0 - f * 0.6) * night, 1.0); }" });
    const shells = []; for (let i = 0; i < 5; i++) { const m = new THREE.Mesh(new THREE.SphereGeometry(1, 96, 48), irM()); S.add(m); shells.push(m); }
    const T0 = o.T0, two = o.mode === "space2";
    return (t, d) => {
      const ft = T0 + t, p = t / d;
      earth.rotation.y = (two ? -151 : -166) * D2R + t * 0.5 * D2R;
      if (!two) aim(C, V(0, 0, 0), lerp(31, 28.5, p), lerp(-4, 4, p), lerp(24, 21, p), -330, 40);
      else aim(C, V(0, 0, 0), lerp(29, 27, p), lerp(14, 20, p), lerp(18, 16, p), -150, 0);
      shells.forEach((m, i) => { const q = fr(ft * 0.11 + i / shells.length); m.scale.setScalar(RE * (1.0 + q * 0.6)); m.material.uniforms.op.value = 0.16 * Math.sin(Math.PI * q) * (1 - q * 0.5); });
      return [S, C];
    };
  }
  LABK.room = (o) => (o.mode === "light" ? roomLight(o) : o.mode === "heat" ? roomHeat(o) : roomSpace(o));

  // ================================================================ shared: paper
  function paperBase(g, w, h, seed) {
    g.fillStyle = "#f2ede0"; g.fillRect(0, 0, w, h);
    const r = rnd(seed); g.globalAlpha = 0.05; for (let i = 0; i < 2600; i++) { g.fillStyle = r() < 0.5 ? "#8a7a60" : "#ffffff"; g.fillRect(r() * w, r() * h, 1 + r() * 2.5, 0.6 + r() * 0.8); } g.globalAlpha = 1;
  }
  // wrap text lines (Georgia) into a box; returns next y
  function para(g, text, x, y, w, lh, font, col) {
    g.font = font; g.fillStyle = col || "#2b2824"; let line = "";
    for (const word of text.split(" ")) { const tst = line ? line + " " + word : word; if (g.measureText(tst).width > w && line) { g.fillText(line, x, y); y += lh; line = word; } else line = tst; }
    if (line) { g.fillText(line, x, y); y += lh; } return y;
  }
  function arrowHead(g, x, y, ang, s) { g.save(); g.translate(x, y); g.rotate(ang); g.beginPath(); g.moveTo(s, 0); g.lineTo(-s * 0.7, -s * 0.6); g.lineTo(-s * 0.35, 0); g.lineTo(-s * 0.7, s * 0.6); g.closePath(); g.fill(); g.restore(); }

  // ================================================================ TEXTBOOK
  LABK.textbook = (o) => {
    const S = stage("studio", { key: 0.55, hemi: 0.16, rim: 0.3, floorY: -0.05 }), C = cam(30);
    S.userData.key.position.set(-6, 11, 5); S.userData.key.color.set(0xffe9cc);
    const fl = o.mode === "flip";
    if (fl) { S.environment = null; S.userData.key.intensity = 0.1; S.traverse((m) => { if (m.isHemisphereLight) m.intensity = 0.06; }); }
    const lamp = new THREE.SpotLight(0xffe2bc, fl ? 170 : 150, 30, fl ? 0.18 : 0.34, 1, 2); lamp.position.set(4.6, 8.2, -4.6); lamp.target.position.set(fl ? 3.1 : 2.5, 0, fl ? -1.0 : -0.5); lamp.castShadow = true; lamp.shadow.mapSize.set(2048, 2048); lamp.shadow.bias = -0.0005; S.add(lamp, lamp.target);
    const desk = new THREE.Mesh(new THREE.BoxGeometry(30, 0.3, 16), wood("woodDesk", [118, 80, 50], 29, 0.55, [4, 2])); desk.position.y = -0.15; desk.receiveShadow = true; S.add(desk);
    const PW = 4.0, PH = 5.2, H0 = 0.22, TW = 1024, TH = 1331;
    // right page: text + circuit figure (conventional current arrows from + to −)
    const FIG = { x0: 300, x1: 840, y0: 470, y1: 840, cell: 560 };
    const right = canvasTex(TW, TH, (g) => {
      paperBase(g, TW, TH, 3);
      g.fillStyle = "#6b6358"; g.font = "italic 26px Georgia"; g.textAlign = "right"; g.fillText("Electricity", TW - 80, 70); g.textAlign = "left";
      g.fillStyle = "#1f2a44"; g.font = "bold 40px Georgia"; g.fillText("12.2  Electric Current and Circuit", 90, 150);
      let y = para(g, "A continuous, closed path along which charge can flow is called an electric circuit. When the switch is closed, the cell drives a current through the wires and the bulb glows. By convention, the direction of current is taken as the direction in which positive charges would move, from the positive terminal of the cell to its negative terminal.", 90, 210, 850, 40, "28px Georgia");
      // figure frame
      g.strokeStyle = "#cfc6b4"; g.lineWidth = 2; g.strokeRect(150, 400, 760, 540);
      g.strokeStyle = "#1d1d1f"; g.fillStyle = "#1d1d1f"; g.lineWidth = 6; g.lineCap = "round";
      const { x0, x1, y0, y1, cell } = FIG;
      g.beginPath(); g.moveTo(cell - 18, y0); g.lineTo(x0, y0); g.lineTo(x0, y1); g.lineTo(560, y1); g.moveTo(620, y1); g.lineTo(x1, y1); g.lineTo(x1, 700); g.moveTo(x1, 610); g.lineTo(x1, y0); g.lineTo(cell + 22, y0); g.stroke();
      // cell: long thin (+) and short thick (−)
      g.lineWidth = 4; g.beginPath(); g.moveTo(cell + 22, y0 - 46); g.lineTo(cell + 22, y0 + 46); g.stroke(); g.lineWidth = 10; g.beginPath(); g.moveTo(cell - 18, y0 - 24); g.lineTo(cell - 18, y0 + 24); g.stroke();
      g.font = "bold 34px Georgia"; g.fillText("+", cell + 34, y0 - 30); g.fillText("−", cell - 52, y0 - 30);
      // bulb symbol on the right wire
      g.lineWidth = 5; g.beginPath(); g.arc(x1, 655, 45, 0, TAU); g.stroke(); g.beginPath(); g.moveTo(x1 - 32, 623); g.lineTo(x1 + 32, 687); g.moveTo(x1 + 32, 623); g.lineTo(x1 - 32, 687); g.stroke();
      // plug key at the bottom
      g.beginPath(); g.arc(590, y1, 30, 0, TAU); g.stroke(); g.beginPath(); g.arc(590, y1, 8, 0, TAU); g.fill();
      // conventional current arrows (+ -> around -> −)
      g.fillStyle = "#1d1d1f"; arrowHead(g, 720, y0, 0, 22); arrowHead(g, x1, 560, Math.PI / 2, 22); arrowHead(g, 450, y1, Math.PI, 22); arrowHead(g, x0, 640, -Math.PI / 2, 22);
      g.font = "italic 34px Georgia"; g.fillText("I", 712, y0 - 22); g.fillText("I", x1 + 22, 568); g.fillText("I", 440, y1 + 48); g.fillText("I", x0 - 40, 650);
      g.font = "26px Georgia"; g.fillText("Cell", cell - 26, y0 + 92); g.fillText("Bulb", x1 - 120, 662); g.fillText("Key", 568, y1 - 46);
      g.fillStyle = "#2b2824"; g.font = "italic 25px Georgia"; g.fillText("Figure 12.1  A simple electric circuit. Arrows show the direction of current.", 170, 985);
      y = para(g, "Note that the current in the circuit flows from the positive terminal of the cell, through the bulb, back to the negative terminal. The same current flows through every part of a simple circuit, and its value is measured in amperes.", 90, 1050, 850, 40, "28px Georgia");
      g.fillStyle = "#6b6358"; g.font = "24px Georgia"; g.textAlign = "center"; g.fillText("203", TW / 2, TH - 50); g.textAlign = "left";
    });
    const left = canvasTex(TW, TH, (g) => {
      paperBase(g, TW, TH, 5);
      g.fillStyle = "#6b6358"; g.font = "italic 26px Georgia"; g.fillText("Science", 80, 70);
      let y = para(g, "We use electricity every day: to light our homes, to run fans and to charge our phones. But what exactly flows in a wire, and why does a bulb glow the moment we close a switch? In this chapter we study electric current, the circuits that carry it and the effects it produces.", 90, 150, 850, 40, "28px Georgia");
      g.fillStyle = "#e9e1cf"; g.fillRect(90, y + 10, 850, 330); g.fillStyle = "#1f2a44"; g.font = "bold 30px Georgia"; g.fillText("Activity 12.1", 120, y + 60);
      y = para(g, "Take a dry cell, a small torch bulb in a holder, a switch and some connecting wires. Connect them as shown in Figure 12.1. Close the switch and observe the bulb. Now open the switch. What do you notice? Record your observations in your notebook.", 120, y + 110, 790, 40, "27px Georgia");
      y = para(g, "Electric charge is a basic property of matter. Charges of the same kind repel each other, while unlike charges attract. The amount of charge flowing through a cross-section of a wire per unit time is called the electric current. If a net charge Q flows in time t, the current I is given by I = Q / t. The SI unit of current is the ampere (A).", 90, y + 90, 850, 40, "28px Georgia");
      g.fillStyle = "#6b6358"; g.font = "24px Georgia"; g.textAlign = "center"; g.fillText("202", TW / 2, TH - 50); g.textAlign = "left";
    });
    // curved page geometry: rises from the spine and flattens out
    const hgt = (dx) => H0 * Math.sin(Math.min(Math.abs(dx) / 0.85, 1) * Math.PI / 2) + 0.01;
    function page(tex, side) {
      const gg = new THREE.PlaneGeometry(PW, PH, 64, 1); gg.rotateX(-Math.PI / 2); const p = gg.attributes.position;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i) + PW / 2; p.setX(i, side * x); p.setY(i, hgt(x)); }
      if (side < 0) { const uv = gg.attributes.uv; for (let i = 0; i < uv.count; i++) uv.setX(i, 1 - uv.getX(i)); gg.index.array.reverse(); }
      gg.computeVertexNormals();
      const m = new THREE.Mesh(gg, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.82 })); m.receiveShadow = true; m.castShadow = true; return m;
    }
    const book = new THREE.Group(); S.add(book); book.rotation.y = 0.04;
    book.add(page(right, 1), page(left, -1));
    const edgeT = canvasTex(16, 128, (g) => { for (let y = 0; y < 128; y++) { g.fillStyle = y % 3 ? "#e9e2d2" : "#cfc5b0"; g.fillRect(0, y, 16, 1); } });
    const edgeM = new THREE.MeshStandardMaterial({ map: edgeT, roughness: 0.9 });
    for (const s of [-1, 1]) {
      const blk = new THREE.Mesh(new THREE.BoxGeometry(PW - 0.85, H0 - 0.005, PH - 0.02), edgeM); blk.position.set(s * (0.85 + (PW - 0.85) / 2), (H0 - 0.005) / 2 + 0.01, 0); blk.castShadow = blk.receiveShadow = true; book.add(blk);
      const cov = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.12, 0.04, PH + 0.16), new THREE.MeshStandardMaterial({ color: 0x24375a, roughness: 0.7 })); cov.position.set(s * (PW + 0.12) / 2, 0.0, 0); cov.castShadow = cov.receiveShadow = true; book.add(cov);
    }
    // a Natraj-style pencil (red/black stripes)
    const pen = new THREE.Group(); pen.position.set(5.4, 0.07, 0.6); pen.rotation.y = 0.5; S.add(pen);
    const stripes = canvasTex(64, 8, (g) => { for (let i = 0; i < 6; i++) { g.fillStyle = i % 2 ? "#151515" : "#a8241c"; g.fillRect(i * 64 / 6, 0, 64 / 6 + 1, 8); } });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.0, 6), new THREE.MeshStandardMaterial({ map: stripes, roughness: 0.45 })); body.rotation.z = Math.PI / 2; pen.add(body);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.36, 24), new THREE.MeshStandardMaterial({ color: 0xd8b48a, roughness: 0.7 })); tip.rotation.z = -Math.PI / 2; tip.position.x = 1.68; pen.add(tip);
    const lead = new THREE.Mesh(new THREE.ConeGeometry(0.022, 0.11, 16), new THREE.MeshStandardMaterial({ color: 0x2a2a2c, metalness: 0.5, roughness: 0.35 })); lead.rotation.z = -Math.PI / 2; lead.position.x = 1.81; pen.add(lead);
    shadowAll(pen);
    // figure pixel -> 3D on the right page (flat part)
    const P3 = (px, py, lift) => { const x = px / TW * PW; return V(x, hgt(x) + (lift || 0.004), -PH / 2 + py / TH * PH).applyAxisAngle(UP, book.rotation.y); };
    // highlighter strokes over the printed arrows (mode arrows)
    const hl = [], hm = new THREE.MeshBasicMaterial({ color: 0xf0dc58, transparent: true, opacity: 0.0, depthWrite: false });
    const AR = [[720, FIG.y0, 0], [FIG.x1, 560, 90], [450, FIG.y1, 180], [FIG.x0, 640, -90]];
    if (o.mode === "arrows") AR.forEach(([x, y, a], i) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1).rotateX(-Math.PI / 2).translate(0.5, 0, 0), hm.clone()); m.position.copy(P3(x - 60 * Math.cos(a * D2R), y - 60 * Math.sin(a * D2R), 0.006)); m.rotation.y = -a * D2R + book.rotation.y; m.userData.len = 120 / TW * PW; hl.push(m); S.add(m);
    });
    // electron dots printed-diagram style, moving AGAINST the arrows (mode flip): − terminal -> left wire -> bottom -> right (bulb) -> + terminal
    const loop = [[FIG.cell - 30, FIG.y0], [FIG.x0, FIG.y0], [FIG.x0, FIG.y1], [FIG.x1, FIG.y1], [FIG.x1, FIG.y0], [FIG.cell + 34, FIG.y0]];
    const segL = []; let tot = 0; for (let i = 1; i < loop.length; i++) { const l = Math.hypot(loop[i][0] - loop[i - 1][0], loop[i][1] - loop[i - 1][1]); segL.push(l); tot += l; }
    const along = (u) => { let d = u * tot; for (let i = 0; i < segL.length; i++) { if (d <= segL[i]) { const k = d / segL[i]; return [lerp(loop[i][0], loop[i + 1][0], k), lerp(loop[i][1], loop[i + 1][1], k)]; } d -= segL[i]; } return loop[loop.length - 1]; };
    const dots = [];
    if (o.mode === "flip") for (let i = 0; i < 26; i++) { const m = new THREE.Mesh(new THREE.CircleGeometry(0.038, 24).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ color: 0x2c5d9e, roughness: 0.6, transparent: true, opacity: 0 })); S.add(m); dots.push(m); }
    const T0 = o.T0;
    const KEYS = {
      arrows: [[0, 0.2, 0.1, 0.2, 10.5, -8, 58], [2.8, 1.4, 0.15, 0.1, 7.6, -3, 60], [5.7, 2.15, 0.2, -0.1, 5.4, 4, 63]],
      flip: [[-3.8, 1.9, 0.2, -0.35, 6.4, 18, 58], [-1.6, 2.1, 0.2, -0.22, 5.5, 13, 60], [0, 2.2, 0.2, -0.15, 4.9, 9, 62], [5.8, 2.15, 0.2, -0.1, 5.0, -5, 60]],
    };
    const K = KEYS[o.mode] || KEYS.arrows;
    return (t, d) => {
      const ft = T0 + t;
      const tt = o.mode === "flip" ? ft - 189.18 : t;
      camKeys(C, K, tt, o.mode === "flip" ? lerp(-120, -230, seg(tt, 1.5, 3.4)) : -60, o.mode === "flip" ? lerp(60, 170, seg(tt, 1.5, 3.4)) : 20);
      hl.forEach((m, i) => { const k = seg(t, 2.2 + i * 0.55, 2.75 + i * 0.55); m.scale.set(Math.max(0.001, m.userData.len * k), 1, 0.17); m.material.opacity = 0.42 * Math.min(1, k * 4); m.visible = k > 0.001; });
      dots.forEach((m, i) => { const u = fr(i / dots.length + ft * 0.07), [px, py] = along(u); m.position.copy(P3(px, py, 0.007)); m.material.opacity = seg(ft, 188.0 + (i % 5) * 0.1, 188.7 + (i % 5) * 0.1) * smooth(u / 0.03) * (1 - smooth((u - 0.97) / 0.03)); });
      return [S, C];
    };
  };

  // ================================================================ BILL (units = kWh)
  LABK.bill = (o) => {
    const S = stage("studio", { key: 1.4, hemi: 0.25, rim: 0.5, floorY: -0.05 }), C = cam(30);
    S.userData.key.position.set(-5, 12, 7);
    const top = new THREE.Mesh(new THREE.BoxGeometry(34, 0.3, 16), wood("woodBill", [86, 56, 36], 37, 0.5, [4, 2])); top.position.y = -0.15; top.receiveShadow = true; S.add(top);
    const BW = 4.2, BH = 5.94, TW = 1240, TH = 1754;
    const UC = { x: 760, y: 700 }; // units consumed cell centre (px)
    const billT = canvasTex(TW, TH, (g) => {
      paperBase(g, TW, TH, 11);
      g.fillStyle = "#33506e"; g.fillRect(60, 60, TW - 120, 120);
      g.fillStyle = "#f4f1e8"; g.font = "bold 54px Arial"; g.fillText("ELECTRICITY BILL", 100, 140); g.font = "26px Arial"; g.textAlign = "right"; g.fillText("Domestic  ·  LT-1  ·  Consumer copy", TW - 100, 132); g.textAlign = "left";
      g.fillStyle = "#2b2b2b"; g.font = "26px Arial";
      const info = [["Consumer No.", "1102 3394 571"], ["Bill No.", "0087 6612"], ["Bill Date", "05-11-2026"], ["Due Date", "20-11-2026"], ["Sanctioned Load", "2 kW"], ["Meter No.", "04817726"]];
      info.forEach(([k, v], i) => { const x = 100 + (i % 2) * 540, y = 250 + Math.floor(i / 2) * 52; g.fillStyle = "#6a6a6a"; g.fillText(k, x, y); g.fillStyle = "#1e1e1e"; g.font = "bold 26px Arial"; g.fillText(v, x + 230, y); g.font = "26px Arial"; });
      g.fillStyle = "#33506e"; g.font = "bold 28px Arial"; g.fillText("METER READING", 100, 470);
      g.strokeStyle = "#9aa3ad"; g.lineWidth = 2;
      const cols = [100, 360, 620, 900, TW - 100];
      g.strokeRect(100, 500, TW - 200, 260); g.beginPath(); g.moveTo(100, 590); g.lineTo(TW - 100, 590); cols.slice(1, -1).forEach((x) => { g.moveTo(x, 500); g.lineTo(x, 760); }); g.stroke();
      g.fillStyle = "#e6e9ec"; g.fillRect(621, 501, 278, 88); g.fillStyle = "#4a4a4a"; g.font = "24px Arial";
      [["Previous Reading", "06-10-2026"], ["Present Reading", "05-11-2026"], ["Units Consumed", "kWh"], ["Multiplying Factor", ""]].forEach(([a, b], i) => { g.fillText(a, cols[i] + 18, 538); g.fillText(b, cols[i] + 18, 570); });
      g.fillStyle = "#1e1e1e"; g.font = "bold 44px Arial"; g.fillText("18,342", 130, 690); g.fillText("18,529", 390, 690); g.fillText("1", 930, 690);
      g.strokeStyle = "#33506e"; g.lineWidth = 5; g.strokeRect(624, 594, 272, 162); g.font = "bold 64px Arial"; g.fillStyle = "#16324f"; g.fillText("187", 690, 700);
      g.fillStyle = "#33506e"; g.font = "bold 28px Arial"; g.fillText("CHARGES", 100, 840);
      g.font = "26px Arial"; g.fillStyle = "#2b2b2b";
      [["Energy charges  0 – 100 units @ 3.50", "350.00"], ["Energy charges  101 – 187 units @ 4.95", "430.65"], ["Fixed charges", "120.00"], ["Electricity duty", "45.04"]].forEach(([a, b], i) => { const y = 890 + i * 50; g.fillText(a, 100, y); g.textAlign = "right"; g.fillText(b, TW - 100, y); g.textAlign = "left"; g.fillStyle = "#d4d8dc"; g.fillRect(100, y + 16, TW - 200, 1.5); g.fillStyle = "#2b2b2b"; });
      g.font = "bold 36px Arial"; g.fillText("Amount payable", 100, 1140); g.textAlign = "right"; g.fillText("₹ 946", TW - 100, 1140); g.textAlign = "left";
      g.fillStyle = "#33506e"; g.font = "bold 26px Arial"; g.fillText("CONSUMPTION HISTORY (units)", 100, 1240);
      const hist = [142, 128, 151, 196, 238, 255, 231, 210, 198, 176, 164, 187];
      hist.forEach((v, i) => { g.fillStyle = i === 11 ? "#33506e" : "#a9b4bf"; const hh = v * 1.1; g.fillRect(110 + i * 84, 1530 - hh, 52, hh); });
      g.fillStyle = "#2b2b2b"; for (let i = 0; i < 90; i++) { const r = hash(i, 3, 7); g.fillRect(100 + i * 7.2, 1590, r < 0.5 ? 2.5 : 4.5, 80); }
      g.font = "22px Arial"; g.fillStyle = "#6a6a6a"; g.fillText("Pay online or at any authorised collection centre before the due date.", 100, 1715);
      // fold shading
      for (const fy of [TH / 3, 2 * TH / 3]) { const gr = g.createLinearGradient(0, fy - 30, 0, fy + 30); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(80,60,40,0.09)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, fy - 30, TW, 60); }
    });
    const bg = new THREE.PlaneGeometry(BW, BH, 2, 60); bg.rotateX(-Math.PI / 2);
    { const p = bg.attributes.position; for (let i = 0; i < p.count; i++) { const v = (p.getZ(i) + BH / 2) / BH; p.setY(i, 0.012 + 0.05 * Math.max(0, 1 - Math.abs(v - 1 / 3) * 3) + 0.02 * Math.max(0, (v - 2 / 3) * 3)); } bg.computeVertexNormals(); }
    const bill = new THREE.Mesh(bg, new THREE.MeshStandardMaterial({ map: billT, roughness: 0.85 })); bill.rotation.y = 0.1; bill.position.set(0.2, 0, 1.6); bill.receiveShadow = bill.castShadow = true; S.add(bill);
    const BP = (px, py) => V(px / TW * BW - BW / 2, 0.05, py / TH * BH - BH / 2).applyAxisAngle(UP, 0.1).add(bill.position);
    // bowl heater (left): chrome parabolic dish, ceramic core with a glowing nichrome coil, wire guard
    const heater = new THREE.Group(); heater.position.set(-5.0, 0, -0.6); heater.rotation.y = 0.7; heater.scale.setScalar(0.85); S.add(heater);
    const chrome = new THREE.MeshStandardMaterial({ color: 0xd9dde2, metalness: 1, roughness: 0.14 }), dark = M.paint(0x232428, 0.5);
    heater.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.0, 0.16, 48), dark), 0, 0.08, 0));
    heater.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.12, 1.2, 16), chrome), 0, 0.75, -0.1));
    const head = new THREE.Group(); head.position.set(0, 2.05, 0); head.rotation.x = -0.12; heater.add(head);
    const dishPts = []; for (let i = 0; i <= 30; i++) { const r = 0.02 + 1.35 * i / 30; dishPts.push(new THREE.Vector2(r, 0.32 * r * r)); }
    const dish = new THREE.Mesh(new THREE.LatheGeometry(dishPts, 72), new THREE.MeshStandardMaterial({ color: 0xc4c8cd, metalness: 1, roughness: 0.22, side: THREE.DoubleSide, envMapIntensity: 0.7 })); dish.rotation.x = Math.PI / 2; head.add(dish);
    const core = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 0.62, 32), M.matte(0xe4dccb)); core.rotation.x = Math.PI / 2; core.position.z = 0.36; head.add(core);
    const coilM = new THREE.MeshStandardMaterial({ color: 0x5a4a40, roughness: 0.5, metalness: 0.4, emissive: 0xff5a14, emissiveIntensity: 0 });
    const coil = new THREE.Mesh(new THREE.TubeGeometry(curveOf((u) => { const a = u * 13 * TAU, z = 0.08 + 0.58 * u, r = lerp(0.255, 0.18, u); return V(r * Math.cos(a), r * Math.sin(a), z); }), 500, 0.02, 6), coilM); head.add(coil);
    const guardM = M.steel();
    for (const r of [0.35, 0.65, 0.95, 1.25]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(r, 0.012, 6, 96), guardM); ring.position.z = 0.32 * 1.35 * 1.35 + 0.08 - (1.35 - r) * 0.05; head.add(ring); }
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; head.add(rod(V(0.1 * Math.cos(a), 0.1 * Math.sin(a), 0.7), V(1.33 * Math.cos(a), 1.33 * Math.sin(a), 0.58), 0.01, guardM, 6)); }
    shadowAll(heater);
    const hL = new THREE.PointLight(0xff8a3c, 0, 0, 2); hL.position.set(0, 0, 0.9); head.add(hL);
    const hGlow = glowSprite(0xff9a50, 2.4, 0); hGlow.position.set(0, 0, 0.6); head.add(hGlow);
    // table clock (between heater and bill)
    const clock = new THREE.Group(); clock.position.set(-3.0, 0, 1.0); clock.rotation.y = 0.3; S.add(clock);
    const caseM = new THREE.MeshStandardMaterial({ color: 0xb9bcc0, metalness: 1, roughness: 0.32 });
    const cs = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.3, 64), caseM); cs.rotation.x = Math.PI / 2; cs.position.y = 0.75; clock.add(cs);
    for (const sx of [-0.35, 0.35]) clock.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.25, 12), caseM), sx, 0.12, 0));
    const faceT = canvasTex(512, 512, (g) => { g.fillStyle = "#f1ece0"; g.beginPath(); g.arc(256, 256, 256, 0, TAU); g.fill(); g.fillStyle = "#1e1e1e"; g.strokeStyle = "#1e1e1e"; for (let i = 0; i < 60; i++) { const a = i / 60 * TAU, r0 = i % 5 ? 222 : 205; g.lineWidth = i % 5 ? 3 : 7; g.beginPath(); g.moveTo(256 + r0 * Math.sin(a), 256 - r0 * Math.cos(a)); g.lineTo(256 + 236 * Math.sin(a), 256 - 236 * Math.cos(a)); g.stroke(); } g.font = "bold 54px Arial"; g.textAlign = "center"; g.textBaseline = "middle"; for (let i = 1; i <= 12; i++) { const a = i / 12 * TAU; g.fillText(String(i), 256 + 168 * Math.sin(a), 256 - 168 * Math.cos(a)); } });
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.54, 64), new THREE.MeshStandardMaterial({ map: faceT, roughness: 0.6 })); face.position.set(0, 0.75, 0.152); clock.add(face);
    const handM = M.paint(0x1a1a1a, 0.4);
    const mkHand = (len, w, z, mat) => { const pv = new THREE.Group(); pv.position.set(0, 0.75, z); const hnd = new THREE.Mesh(new THREE.BoxGeometry(w, len, 0.01), mat); hnd.position.y = len * 0.42; pv.add(hnd); clock.add(pv); return pv; };
    const hourH = mkHand(0.3, 0.04, 0.158, handM), minH = mkHand(0.44, 0.026, 0.163, handM), secH = mkHand(0.46, 0.008, 0.168, M.paint(0xa8241c, 0.4));
    const blurM = new THREE.MeshBasicMaterial({ color: 0x1a1a1a, transparent: true, opacity: 0, depthWrite: false });
    const blur = new THREE.Mesh(new THREE.CircleGeometry(0.4, 48), blurM); blur.position.set(0, 0.75, 0.162); clock.add(blur);
    const glassC = new THREE.Mesh(new THREE.CircleGeometry(0.56, 64), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, transparent: true, opacity: 0.12, clearcoat: 1 })); glassC.position.set(0, 0.75, 0.18); clock.add(glassC);
    shadowAll(clock);
    // 10 W LED bulb (right) standing in a batten holder
    const led = new THREE.Group(); led.position.set(5.3, 0, -0.6); S.add(led);
    led.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.55, 0.1, 48), wood("woodDark", [92, 58, 36], 5, 0.5)), 0, 0.05, 0));
    led.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.27, 0.8, 40), M.paint(0xefece6, 0.4)), 0, 0.5, 0));
    const ledBody = new THREE.Mesh(new THREE.LatheGeometry(new THREE.SplineCurve([[0.13, 0.0], [0.16, 0.1], [0.24, 0.32], [0.3, 0.42]].map(([r, y]) => new THREE.Vector2(r, y))).getPoints(20), 48), M.paint(0xf4f2ee, 0.45)); ledBody.position.y = 0.92; led.add(ledBody);
    const ledDomeM = new THREE.MeshStandardMaterial({ color: 0xf2efe8, roughness: 0.55, emissive: 0xfff2de, emissiveIntensity: 0 });
    const ledDome = new THREE.Mesh(new THREE.SphereGeometry(0.3, 48, 24, 0, TAU, 0, Math.PI * 0.6), ledDomeM); ledDome.position.y = 1.36; led.add(ledDome);
    shadowAll(led);
    const lL = new THREE.PointLight(0xfff0dc, 0, 0, 2); lL.position.set(0, 1.5, 0.2); led.add(lL);
    const lGlow = glowSprite(0xfff2e0, 1.6, 0); lGlow.position.set(0, 1.45, 0); led.add(lGlow);
    const T0 = o.T0, U = BP(UC.x, UC.y), A0 = BP(380, 260), A1 = BP(560, 520);
    const K = [[0, A0.x, 0.05, A0.z, 5.6, -14, 64], [3.8, A1.x, 0.05, A1.z, 4.8, -6, 62], [7.6, U.x, 0.05, U.z, 3.6, 4, 60], [9.3, U.x, 0.1, U.z - 0.15, 3.9, 6, 56],
      [11.4, -0.1, 3.4, 0, 14.4, 2, 12], [14.5, 0, 3.4, 0, 14.1, 1, 12], [17.4, 0.0, 3.4, 0, 13.9, 0, 12], [20.0, 0.3, 3.4, 0, 13.6, -2, 12], [22.0, 0.4, 3.4, 0, 13.4, -3, 12]];
    return (t, d) => {
      const ft = T0 + t;
      camKeys(C, K, t, 0, 0);
      const heat = seg(ft, 323.42, 324.6) * (1 - seg(ft, 329.2, 330.8)), on = seg(ft, 329.4, 329.65);
      coilM.emissiveIntensity = 2.2 * heat; coilM.emissive.setRGB(1, lerp(0.18, 0.4, heat), lerp(0.02, 0.1, heat)); hL.intensity = 9 * heat; hGlow.material.opacity = 0.22 * heat;
      ledDomeM.emissiveIntensity = 1.3 * on; lL.intensity = 7 * on; lGlow.material.opacity = 0.3 * on;
      // clock: 9:00 start; one hour sweeps during the heater; time-lapse (100 hours) during the LED
      const h1 = seg(ft, 323.6, 329.2), lapse = clamp((ft - 329.6) / 4.3, 0, 1);
      const minutes = 60 * h1 + 6000 * lapse * lapse * 0.6 + 6000 * lapse * 0.4;
      const tm = 9 * 60 + minutes;
      hourH.rotation.z = -(tm / 720) * TAU; minH.rotation.z = -(tm / 60) * TAU; secH.rotation.z = -Math.floor(ft) / 60 * TAU - (ft > 329.6 ? lapse * 400 : 0);
      const bl = seg(ft, 329.6, 330.2); minH.visible = bl < 0.6; secH.visible = bl < 0.3; blurM.opacity = 0.18 * bl;
      return [S, C];
    };
  };

  // ================================================================ GENERATOR / station
  function stationScene(o) {
    const S = stage("studio", { key: 0.7, hemi: 0.2, rim: 0.6, floorY: 0, bg: 0x0d0e11 }), C = cam(34);
    S.fog = new THREE.Fog(0x0d0e11, 30, 90);
    S.userData.key.position.set(-10, 22, 12);
    const fl = noiseTex("concrete", [74, 73, 70], 0.14, 24, 51).clone(); fl.repeat.set(10, 10); fl.needsUpdate = true;
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 120), new THREE.MeshStandardMaterial({ map: fl, roughness: 0.75, metalness: 0 })); floor.rotation.x = -Math.PI / 2; floor.position.y = 0.002; floor.receiveShadow = true; S.add(floor);
    // overhead hall lights
    for (const x of [-14, -2, 10]) { const l = new THREE.PointLight(0xffe6c4, 90, 40, 2); l.position.set(x, 13, 4); S.add(l); }
    const add = (geo, mat, x, y, z, par) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (par || S).add(m); return m; };
    const steel = new THREE.MeshStandardMaterial({ color: 0xb5b9bf, metalness: 1, roughness: 0.3 }), paintG = M.paint(0x4f5d57, 0.5), clad = new THREE.MeshStandardMaterial({ color: 0xc7cacd, metalness: 0.8, roughness: 0.38 });
    const SH = 2.4; // shaft height
    // boiler (left): steel-clad wall with furnace viewports and a steam drum on top
    const panelT = canvasTex(256, 512, (g) => { g.fillStyle = "#7f858b"; g.fillRect(0, 0, 256, 512); g.fillStyle = "#6c7177"; for (let x = 0; x < 256; x += 32) g.fillRect(x, 0, 3, 512); for (let y = 0; y < 512; y += 128) g.fillRect(0, y, 256, 4); });
    add(new THREE.BoxGeometry(6, 11, 6), new THREE.MeshStandardMaterial({ map: panelT, metalness: 0.6, roughness: 0.5 }), -16, 5.5, -0.5);
    const portM = new THREE.MeshBasicMaterial({ color: 0xff7a2a });
    const ports = [3.0, 5.0].map((y, i) => { const m = new THREE.Mesh(new THREE.CircleGeometry(0.28, 32), portM.clone()); m.position.set(-16 + (i - 0.5) * 2.2, y, 2.51); S.add(m); add(new THREE.TorusGeometry(0.3, 0.06, 8, 32), steel, m.position.x, y, 2.52); return m; });
    const portL = new THREE.PointLight(0xff7a2a, 3, 8, 2); portL.position.set(-16, 4, 3.6); S.add(portL);
    const drum = add(new THREE.CylinderGeometry(1.0, 1.0, 6.4, 40), steel, -16, 11.8, -0.5); drum.rotation.x = Math.PI / 2;
    add(new THREE.CylinderGeometry(0.15, 0.15, 0.8, 16), steel, -15.2, 13.0, 0.4);
    // main steam pipe (insulated cladding) from the drum down to the turbine inlet
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-15, 12.3, -0.5), V(-12, 12.3, -0.5), V(-9.2, 11.5, -0.5), V(-8.4, 8, -0.5), V(-8.2, 5.2, 0), V(-7.0, SH + 1.5, 0)]), 80, 0.36, 16), clad, 0, 0, 0);
    // turbine: lower casing halves (cutaway), rotor shaft, blade stages
    const half = (r, x0, x1, mat) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, x1 - x0, 64, 1, true, Math.PI / 2, Math.PI), mat); m.material.side = THREE.DoubleSide; m.rotation.z = Math.PI / 2; m.position.set((x0 + x1) / 2, SH, 0); m.castShadow = m.receiveShadow = true; S.add(m); return m; };
    half(1.5, -7.2, -2.6, paintG.clone()); half(2.5, -2.6, 2.8, paintG.clone());
    for (const [x, r] of [[-7.2, 1.5], [-2.6, 2.5], [2.8, 2.5]]) { const fl2 = new THREE.Mesh(new THREE.RingGeometry(0.35, r + 0.12, 64, 1, Math.PI, Math.PI), paintG); fl2.rotation.y = Math.PI / 2; fl2.position.set(x, SH, 0); fl2.material.side = THREE.DoubleSide; S.add(fl2); }
    add(new THREE.BoxGeometry(10.4, SH - 0.2, 3.0), M.paint(0x3c4044, 0.7), -2.2, (SH - 0.2) / 2, 0);
    const rotor = new THREE.Group(); rotor.position.set(0, SH, 0); S.add(rotor);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.32, 19, 32), steel); shaft.rotation.z = Math.PI / 2; shaft.position.x = 1.5; shaft.castShadow = true; rotor.add(shaft);
    const bladeM = new THREE.MeshStandardMaterial({ color: 0xc9ccd0, metalness: 1, roughness: 0.26 });
    const stages = [[-6.6, 0.7, 48], [-5.6, 0.85, 52], [-4.6, 1.0, 56], [-3.5, 1.15, 60], [-1.8, 1.5, 64], [-0.4, 1.75, 68], [1.0, 1.95, 72], [2.2, 2.1, 76]];
    const dm = new THREE.Object3D();
    stages.forEach(([x, L, n]) => {
      const disk = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.22, 48), steel); disk.rotation.z = Math.PI / 2; disk.position.x = x; disk.castShadow = true; rotor.add(disk);
      const bg = new THREE.BoxGeometry(0.05, L, 0.26); bg.translate(0, 0.55 + L / 2, 0);
      const im = new THREE.InstancedMesh(bg, bladeM, n); im.castShadow = true;
      for (let i = 0; i < n; i++) { dm.position.set(x, 0, 0); dm.rotation.set(i / n * TAU, 0, 0); dm.rotateY(0.55); dm.updateMatrix(); im.setMatrixAt(i, dm.matrix); }
      rotor.add(im);
    });
    // generator: stator casing (lower half, cutaway) with copper winding bars; rotor = the spinning magnet
    half(2.3, 3.6, 10.4, paintG.clone());
    add(new THREE.BoxGeometry(7.0, SH - 0.2, 3.6), M.paint(0x3c4044, 0.7), 7.0, (SH - 0.2) / 2, 0);
    const cu = M.copper();
    const nb = 40, bar = new THREE.BoxGeometry(5.8, 0.16, 0.2), bars = new THREE.InstancedMesh(bar, cu, nb); bars.castShadow = true;
    for (let i = 0; i < nb; i++) { const a = Math.PI * (0.52 + 1.12 * i / (nb - 1)); dm.position.set(7.0, SH + 1.62 * Math.sin(a), 1.62 * Math.cos(a)); dm.rotation.set(-a, 0, 0); dm.updateMatrix(); bars.setMatrixAt(i, dm.matrix); }
    S.add(bars);
    for (const x of [4.05, 9.95]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(1.62, 0.2, 16, 72, Math.PI * 1.12), cu); ring.rotation.z = Math.PI * 0.52; ring.rotation.y = Math.PI / 2; ring.position.set(x, SH, 0); ring.castShadow = true; S.add(ring); }
    const statorCore = new THREE.Mesh(new THREE.CylinderGeometry(2.05, 2.05, 5.6, 64, 1, true, Math.PI / 2, Math.PI), new THREE.MeshStandardMaterial({ color: 0x5a5e63, metalness: 0.8, roughness: 0.45, side: THREE.DoubleSide })); statorCore.rotation.z = Math.PI / 2; statorCore.position.set(7.0, SH, 0); S.add(statorCore);
    const magN = M.paint(0x7a3a33, 0.5), magS = M.paint(0x3a4d66, 0.5);
    const rN = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 5.4, 48, 1, false, 0, Math.PI), magN), rS = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 5.4, 48, 1, false, Math.PI, Math.PI), magS);
    for (const m of [rN, rS]) { m.rotation.z = Math.PI / 2; m.position.x = 7.0; m.castShadow = true; rotor.add(m); }
    for (let i = 0; i < 10; i++) { const s2 = new THREE.Mesh(new THREE.BoxGeometry(5.42, 0.08, 0.12), cu); const a = (i < 5 ? 0.5 + i * 0.22 : Math.PI + 0.5 + (i - 5) * 0.22); s2.position.set(7.0, 1.24 * Math.sin(a), 1.24 * Math.cos(a)); s2.rotation.x = a; rotor.add(s2); }
    add(new THREE.CylinderGeometry(0.9, 0.9, 1.2, 40), paintG, 11.4, SH, 0).rotation.z = Math.PI / 2;
    // bearing pedestals
    for (const x of [-7.8, 3.2, 10.7]) add(new THREE.BoxGeometry(0.8, SH, 1.4), M.paint(0x3c4044, 0.6), x, SH / 2, 0);
    // back wall columns for scale
    for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(1.0, 18, 1.0), M.paint(0x34373b, 0.8), -20 + i * 8, 9, -9);
    // steam: soft sprites venting from the drum and flowing through the turbine blades
    const st = [], sr = rnd(8);
    for (let i = 0; i < 28; i++) { const m = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(), color: 0xf2f2f0, transparent: true, opacity: 0, depthWrite: false })); S.add(m); st.push({ m, s: sr(), vent: i < 10, r: 0.4 + sr() * 1.2, a: sr() * TAU }); }
    const T0 = o.T0;
    const K = [[0, -14.0, 9.2, 0, 25, 30, 9], [2.6, -4.6, 3.2, 0, 10.5, 24, 30], [5.4, 6.6, 2.8, 0, 10.0, 22, 30], [8.3, 6.4, 2.9, 0, 11.5, 24, 28], [14.1, -2.0, 4.0, 0, 33, 30, 20]];
    return (t, d) => {
      const ft = T0 + t;
      camKeys(C, K, t, 0, 0);
      rotor.rotation.x = ft * 2.2;
      ports.forEach((m, i) => m.material.color.setRGB(1, 0.42 + 0.06 * Math.sin(ft * 7 + i * 2) + 0.04 * Math.sin(ft * 13.7 + i), 0.15));
      portL.intensity = 3 + 0.5 * Math.sin(ft * 9);
      st.forEach((p) => {
        if (p.vent) { const q = fr(p.s + ft * 0.35); p.m.position.set(-15.2 + q * 1.2 + 0.3 * Math.sin(ft + p.s * 9), 13.4 + q * 3.2, 0.4 + q * 0.6); p.m.scale.setScalar(0.8 + q * 3.2); p.m.material.opacity = 0.55 * Math.sin(Math.PI * q); }
        else { const q = fr(p.s + ft * 0.4), x = lerp(-7.0, 2.6, q), a = p.a + ft * 2.2 * 0.3; p.m.position.set(x, SH + p.r * Math.sin(a) * 0.6 + 0.6, p.r * Math.cos(a) * 0.6); p.m.scale.setScalar(0.5 + q * 1.4); p.m.material.opacity = 0.18 * Math.sin(Math.PI * q); }
      });
      const pins = [["steam", -15.2, 14.6, 0.4, win(t, 0.6, 3.4, 0.5)], ["turbine", -3.5, SH + 2.8, -0.6, win(t, 2.8, 5.6, 0.5)], ["magnet", 6.0, SH + 1.3, 0.2, win(t, 5.4, 9.6, 0.5)], ["copper coils", 8.6, SH + 1.0, 1.7, win(t, 6.2, 9.8, 0.5)]];
      return [S, C, pins];
    };
  }

})();
