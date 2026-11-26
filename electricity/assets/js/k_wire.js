/* k_wire.js — group A kinds (Electricity film): switch3d, wire, pipe, marbles.
   Each kind: LABK.name = (o) => (t, d) => [scene, camera, pins]; ft = o.T0 + t is film time. Pure functions of t. */
(function () {
  const { THREE, M, P, seg, smooth, lerp, clamp, rnd, KF, orbit, cam, stage, canvasTex, glowSprite, W, H, D2R } = L3;
  const V3 = THREE.Vector3, TAU = Math.PI * 2;
  const SPH = new THREE.SphereGeometry(1, 28, 18);

  // ---------------------------------------------------------------- helpers
  const win = (t, a, b, f) => { f = f || 0.4; return seg(t, a, a + f) * (1 - seg(t, b - f, b)); };
  function aim(C, p, dist, az, el, ox, oy) {
    orbit(C, p.x, p.y, p.z, dist, az, el);
    C.near = Math.max(1e-4, dist * 0.02); C.far = Math.max(60, dist * 40);
    if (ox || oy) C.setViewOffset(W, H, ox || 0, oy || 0, W, H); else C.clearViewOffset();
    C.updateProjectionMatrix();
  }
  // camera from position to target
  function look(C, px, py, pz, tx, ty, tz, near, oy) {
    C.position.set(px, py, pz); C.lookAt(tx, ty, tz); if (oy) C.setViewOffset(W, H, 0, oy, W, H); else C.clearViewOffset();
    C.near = near || 0.02; C.far = Math.max(400, C.near * 20000); C.updateProjectionMatrix();
  }
  // Catmull-Rom through [[t, v], ...] with eased ends
  function cr(K, t) {
    const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    let i = 0; while (t >= K[i + 1][0]) i++;
    const a = K[Math.max(i - 1, 0)], b = K[i], c = K[i + 1], d = K[Math.min(i + 2, n - 1)], h = c[0] - b[0], u = (t - b[0]) / h;
    const m1 = i === 0 ? 0 : (c[1] - a[1]) / (c[0] - a[0]) * h, m2 = i + 2 >= n ? 0 : (d[1] - b[1]) / (d[0] - b[0]) * h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * b[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * c[1] + (u3 - u2) * m2;
  }
  const satin = (c, r) => new THREE.MeshPhysicalMaterial({ color: c, roughness: r !== undefined ? r : 0.4, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.35, sheen: 0.7, sheenRoughness: 0.45, sheenColor: new THREE.Color(0xffffff).lerp(new THREE.Color(c), 0.5) });
  const phys = (o) => new THREE.MeshPhysicalMaterial(o);
  let _dot; const DOT = () => _dot || (_dot = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.75)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  const pin = (text, v, op) => [text, v.x, v.y, v.z, op];
  // full-frame fader glued to the camera (dips, fades to black)
  function fader(S, C, color) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: color || 0x0b0c10, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false }));
    m.renderOrder = 999; m.frustumCulled = false; C.add(m); S.add(C);
    return (k, col) => { m.position.set(0, 0, -C.near * 1.5); m.scale.setScalar(C.near * 1.5); m.material.opacity = clamp(k, 0, 1); if (col !== undefined) m.material.color.set(col); m.visible = k > 0.001; };
  }
  // noise-ish canvas helpers
  function speckle(g, w, h, n, seed, cols, rmin, rmax) { const r = rnd(seed); for (let i = 0; i < n; i++) { g.fillStyle = cols[(r() * cols.length) | 0]; const x = r() * w, y = r() * h, s = rmin + r() * (rmax - rmin); g.globalAlpha = 0.04 + r() * 0.1; g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill(); } g.globalAlpha = 1; }

  // electron motion: smooth thermal wander (3 sines per axis), all pure in ft
  function jitterSet(n, seed, amp) {
    const r = rnd(seed), J = new Float32Array(n * 18);
    for (let i = 0; i < n * 6; i++) { J[i * 3] = (0.6 + r() * 2.0) * TAU; J[i * 3 + 1] = r() * TAU; J[i * 3 + 2] = amp * (0.5 + r() * 0.5) / 2.2; }
    return (i, ft, k, out) => { // k scales amplitude
      let o = i * 18; const s = (q) => J[q + 2] * Math.sin(J[q] * ft + J[q + 1]);
      out[0] = k * (s(o) + s(o + 3)); out[1] = k * (s(o + 6) + s(o + 9)); out[2] = k * (s(o + 12) + s(o + 15)); return out;
    };
  }

  // ================================================================= MICRO: copper lattice + electron sea
  // units: 1 = one FCC cell. Corridor along x at y=z=0.25 left clear for travelling shots.
  function micro(o) {
    o = o || {};
    const S = stage("void", { dust: 0, key: 2.6, rim: 1.2, hemi: 0.22 });
    S.fog = new THREE.Fog(0x0b0c10, o.fogN || 1.6, o.fogF || 8);
    const NX = o.nx || 12, NY = o.ny || 4, NZ = o.nz || 4, CY = 0.25, CZ = 0.25, CR = o.corridor === false ? -1 : (o.corridor || 1.0);
    const basis = [[0, 0, 0], [0.5, 0.5, 0], [0.5, 0, 0.5], [0, 0.5, 0.5]], pos = [];
    for (let x = -NX; x < NX; x++) for (let y = -NY; y < NY; y++) for (let z = -NZ; z < NZ; z++) for (const b of basis) {
      const px = x + b[0], py = y + b[1], pz = z + b[2];
      if (Math.hypot(py - CY, pz - CZ) < CR) continue;
      pos.push(px, py, pz);
    }
    const na = pos.length / 3;
    const cu = phys({ color: 0xc7814f, metalness: 0.85, roughness: 0.4, clearcoat: 0.25, clearcoatRoughness: 0.5, envMapIntensity: 1.15 });
    const atoms = new THREE.InstancedMesh(SPH, cu, na), mtx = new THREE.Matrix4(), ar = o.atomR || 0.15;
    // atoms vibrate a tiny bit (thermal): written per frame
    S.add(atoms);
    // electrons
    const r = rnd(o.seed || 41), ne = o.ne || Math.round(na * 1.5), home = new Float32Array(ne * 3);
    for (let i = 0; i < ne; i++) {
      let x, y, z; do { x = (r() * 2 - 1) * NX; y = (r() * 2 - 1) * NY; z = (r() * 2 - 1) * NZ; } while (Math.hypot(y - CY, z - CZ) < CR * 0.75);
      home[i * 3] = x; home[i * 3 + 1] = y; home[i * 3 + 2] = z;
    }
    const jit = jitterSet(ne, (o.seed || 41) + 7, 0.34), ajit = jitterSet(na, 99, 0.03);
    const eg = new THREE.BufferGeometry(), ep = new Float32Array(ne * 3);
    eg.setAttribute("position", new THREE.BufferAttribute(ep, 3));
    const eMat = new THREE.PointsMaterial({ size: 0.11, map: DOT(), color: 0xdde9f6, transparent: true, depthWrite: false, opacity: 0.95 });
    const hMat = new THREE.PointsMaterial({ size: 0.36, map: DOT(), color: 0x9ec3e6, transparent: true, depthWrite: false, opacity: 0.14, blending: THREE.AdditiveBlending });
    S.add(new THREE.Points(eg, eMat), new THREE.Points(eg, hMat));
    // tagged electrons (years): a little warmer and larger
    const tagIdx = (o.tagAt || []).map((p) => nearestE({ home }, p)), tags = tagIdx.map(() => { const s = new THREE.Mesh(SPH, new THREE.MeshBasicMaterial({ color: 0xf3e6cf, fog: true })); s.material = new THREE.MeshStandardMaterial({ color: 0xf6ead6, emissive: 0xe8c890, emissiveIntensity: 0.7, roughness: 0.3 }); s.scale.setScalar(0.06); const h = glowSprite(0xf0dcb8, 0.32, 0.45); s.add(h); h.scale.setScalar(6); S.add(s); return s; });
    const tmp = [0, 0, 0], C = cam(o.fov || 44);
    const fade = fader(S, C);
    const self = {
      S, C, fade, key: S.userData.key, home, tags, tagIdx,
      // gx: collective displacement along x (AC shuffle), jk: jitter scale
      set(ft, gx, jk) {
        for (let i = 0; i < na; i++) { ajit(i, ft, 1, tmp); mtx.makeScale(ar, ar, ar).setPosition(pos[i * 3] + tmp[0], pos[i * 3 + 1] + tmp[1], pos[i * 3 + 2] + tmp[2]); atoms.setMatrixAt(i, mtx); }
        atoms.instanceMatrix.needsUpdate = true;
        for (let i = 0; i < ne; i++) { jit(i, ft, jk, tmp); ep[i * 3] = home[i * 3] + tmp[0] + gx; ep[i * 3 + 1] = home[i * 3 + 1] + tmp[1]; ep[i * 3 + 2] = home[i * 3 + 2] + tmp[2]; }
        eg.attributes.position.needsUpdate = true;
        tagIdx.forEach((k, j) => tags[j].position.set(ep[k * 3], ep[k * 3 + 1], ep[k * 3 + 2]));
      },
      ePos(i) { return new V3(ep[i * 3], ep[i * 3 + 1], ep[i * 3 + 2]); },
      // nearest electron index to a point (build-time helper for tags)
    };
    return self;
  }
  // index of electron whose home is nearest p
  const nearestE = (m, p) => { let b = 0, bd = 1e9; for (let i = 0; i < m.home.length / 3; i++) { const d = (m.home[i * 3] - p[0]) ** 2 + (m.home[i * 3 + 1] - p[1]) ** 2 + (m.home[i * 3 + 2] - p[2]) ** 2; if (d < bd) { bd = d; b = i; } } return b; };

  // AC shuffle shown slowed: visual freq (Hz) and amplitude in cells
  const AC_F = 0.8, AC_A = 0.42;
  const acX = (ft, amp) => amp * AC_A * Math.sin(TAU * AC_F * ft);

  // ================================================================= WIRE
  const WIRE = {};
  WIRE.inside = (o) => {
    const m = micro({ nx: 16 });
    return (t, d) => {
      const ft = o.T0 + t;
      m.set(ft, 0, 1);
      const p = seg(t, 0, d);
      const x = lerp(-9, 7, p * 0.85 + t / d * 0.15);
      look(m.C, x, 0.25 + 0.06 * Math.sin(t * 0.7), 0.25 + 0.05 * Math.cos(t * 0.5), x + 3, 0.0 + 0.3 * Math.sin(t * 0.4), 0.6, 0.01);
      m.C.rotateZ(0.08 * Math.sin(t * 0.3));
      m.fade(0);
      return [m.S, m.C, []];
    };
  };

  // front view of the lattice block (shuffle reads left-right); slow drift always on
  function frontCam(m, t, dist, az, el, tx, ty, ox, oy) {
    const p = new V3(tx || 0, ty || 0, 3.2);
    aim(m.C, p, dist, az + 2.2 * Math.sin(t * 0.21), el + 1.2 * Math.sin(t * 0.17 + 1), ox, oy);
  }
  // thin bracket showing the swing: ticks at a and b (x), height y, depth z
  function bracket(S) {
    const mat = M.light(0xf1e6d2, 0.75), g = new THREE.Group();
    const cyl = new THREE.CylinderGeometry(1, 1, 1, 8);
    const bar = new THREE.Mesh(cyl, mat), t1 = new THREE.Mesh(cyl, mat), t2 = new THREE.Mesh(cyl, mat);
    bar.rotation.z = Math.PI / 2; g.add(bar, t1, t2); S.add(g);
    return (a, b, y, z, r, h, op) => {
      g.visible = op > 0.01; mat.opacity = 0.75 * op;
      bar.position.set((a + b) / 2, y + h, z); bar.scale.set(r, Math.max(1e-4, b - a), r);
      t1.position.set(a, y + h / 2, z); t1.scale.set(r, h, r); t2.position.set(b, y + h / 2, z); t2.scale.set(r, h, r);
    };
  }
  const MARK = [1.6, 0.4, 3.62];   // front-face electron used as the marker

  WIRE.years = (o) => {
    const m2 = micro({ corridor: false, nx: 10, tagAt: [[1.3, 0.9, 3.6], [2.8, -0.2, 3.3], [0.4, -0.6, 3.5], [3.6, 1.2, 3.1]] });
    const key = m2.key, hemi = m2.S.children.find((c) => c.isHemisphereLight);
    const day = new THREE.Color(0xfff0dc), night = new THREE.Color(0x5d76a3), tmpc = new THREE.Color();
    return (t, d) => {
      const ft = o.T0 + t;
      m2.set(ft, 0, 1);
      const ph = 0.5 - 0.5 * Math.cos(TAU * (t + 0.6) / 2.7);     // 1 = day
      key.color.copy(tmpc.copy(night).lerp(day, ph)); key.intensity = lerp(1.3, 3.0, ph);
      const a = TAU * (t + 0.6) / 2.7; key.position.set(-10 * Math.cos(a), 6 + 6 * Math.sin(a), 8);
      hemi.intensity = lerp(0.12, 0.3, ph);
      frontCam(m2, t, lerp(5.6, 4.6, seg(t, 0, d)), lerp(22, 36, seg(t, 0, d)), 16, 1.6, 0.3, -240, 100);
      const pins = [pin("the same electrons", m2.tags[0].position, win(t, 2.4, d - 0.4, 0.8))];
      return [m2.S, m2.C, pins];
    };
  };

  WIRE.still = (o) => {
    const m = micro({ corridor: false, nx: 10 });
    return (t, d) => {
      const ft = o.T0 + t;
      const env = 1 - seg(ft, 385.62, 385.98);
      const jk = lerp(1, 0.45, seg(ft, 385.7, 387.5));
      m.set(ft, acX(ft, env), jk);
      m.key.intensity = lerp(2.6, 1.7, seg(ft, 385.6, 389));
      const sl = seg(ft, 390.5, 393.3);   // 'They just sit.' lower-left: lattice eases up-right
      frontCam(m, t, lerp(5.4, 4.6, seg(t, 0, d)), lerp(36, 30, seg(t, 0, d)), 15 + 4 * sl, 1.2, 0.2, -300 - 160 * sl, 150 + 110 * sl);
      return [m.S, m.C, []];
    };
  };

  WIRE.ac = (o) => {
    const m2 = micro({ corridor: false, nx: 10, tagAt: [MARK] }), mk = m2.tagIdx[0];
    const br = bracket(m2.S), h0 = new V3(m2.home[mk * 3], m2.home[mk * 3 + 1], m2.home[mk * 3 + 2]);
    const U = micron();
    return (t, d) => {
      const ft = o.T0 + t;
      if (ft < 137.06) {
        const on = seg(ft, 119.6, 120.6);
        m2.set(ft, acX(ft, on), 1);
        const bp = h0.x; // bracket around the marker's home
        br(bp - AC_A, bp + AC_A, h0.y + 0.22, h0.z, 0.006, 0.12, win(ft, 121.5, 137.0, 0.8));
        frontCam(m2, t, lerp(5.2, 3.0, seg(ft, 119, 136.5)), lerp(18, 30, seg(t, 0, 18)), 12, MARK[0] - 0.4, 0.3, 0, 0);
        m2.fade(seg(ft, 136.65, 137.06));
        const pins = [pin("50 times a second", new V3(bp, h0.y + 0.36, h0.z), win(ft, 122.0, 130, 0.8))];
        return [m2.S, m2.C, pins];
      }
      // micrometre scale: the swing is about 1 µm; then the hair (70 µm) for scale
      const sw = 0.5 * Math.sin(TAU * AC_F * ft);
      const pb = seg(ft, 140.6, 144.6);
      U.set(ft, sw);
      U.br(-0.5, 0.5, 0.95, 0, 0.012, 0.25, win(ft, 137.5, 146.5, 0.6));
      const dist = Math.exp(lerp(Math.log(6), Math.log(280), pb)), az = lerp(-24, -8, seg(ft, 137, 146.76)) + 10 * pb, el = lerp(24, 34, pb);
      U.glint(Math.max(1, dist / 7));
      aim(U.C, new V3(lerp(0, -40, pb * pb), 0.6, lerp(0, -30, pb * pb)), dist, az, el, 0, -lerp(400, 80, pb * pb));
      U.fade(1 - seg(ft, 137.06, 137.5));
      const pins = [pin("human hair", new V3(-60, 72, -60), win(ft, 143.6, 146.6, 0.6))];
      return [U.S, U.C, pins];
    };
  };

  // dive between the room (cm) and the copper window: p 0 = wide shot, 1 = touching the copper
  const CU_DIP = 0x5e3219;
  function diveCam(R, p, wide, target, te) {
    const w = R.window, q = Math.pow(p, te || 1), tg = new V3(lerp(target.x, w.x, q), lerp(target.y, w.y, q), lerp(target.z, w.z, q));
    const d0 = new V3().subVectors(wide, target), L0 = d0.length(); d0.normalize();
    const dir = d0.clone().lerp(new V3(0.18, 0.08, 1).normalize(), smooth(p)).normalize();
    const dist = Math.exp(lerp(Math.log(L0), Math.log(0.35), p));
    look(R.C, tg.x + dir.x * dist, tg.y + dir.y * dist, tg.z + dir.z * dist, tg.x, tg.y, tg.z, Math.max(0.004, dist * 0.02));
  }
  WIRE.zoom = (o) => {
    const R = room({ cut: true, fov: 34 }), m = micro({ nx: 16, fogN: 1.2, fogF: 6.5 });
    const wide = new V3(22, 15, 100), tgt = new V3(0, 22, 0);
    return (t, d) => {
      const ft = o.T0 + t;
      if (ft < 10.45) {
        R.rock(0); R.lights(0, 1, 0.3, 2.2);
        const drift = 1 - 0.06 * (ft - 6.68) / 2.3;
        const p = Math.pow(seg(ft, 8.9, 10.45), 1.6);
        diveCam(R, p, new V3(wide.x * drift, wide.y, wide.z * drift), tgt);
        R.fade(seg(ft, 10.0, 10.45), CU_DIP);
        return [R.S, R.C, []];
      }
      m.set(ft, 0, 1);
      const x = lerp(-8.5, -5.2, seg(ft, 10.45, o.T0 + d)) + 0.25 * (ft - 10.45) / 8;
      look(m.C, x, 0.25 + 0.05 * Math.sin(ft * 0.6), 0.25 + 0.04 * Math.cos(ft * 0.5), x + 4, 0.25 + 0.2 * Math.sin(ft * 0.3), 0.25 + 0.3 * Math.cos(ft * 0.23), 0.01);
      m.fade(1 - seg(ft, 10.45, 11.1), CU_DIP);
      return [m.S, m.C, []];
    };
  };
  WIRE.answer = (o) => {
    const R = room({ cut: true, fov: 34 }), m = micro({ corridor: false, nx: 10 });
    const wide = new V3(-30, 18, 112), tgt = new V3(-18, 22, 0);
    return (t, d) => {
      const ft = o.T0 + t;
      if (ft < 750.3) {
        const env = 1 - seg(ft, 748.4, 748.8);
        m.set(ft, acX(ft, env), lerp(1, 0.45, seg(ft, 748.5, 749.6)));
        const pb = seg(ft, 749.0, 750.3);
        frontCam(m, t, lerp(5.0, 4.4, seg(t, 0, 8)) + 6 * pb * pb, lerp(34, 28, seg(t, 0, 9)), 15, 1.4, 0.3, -300, 150);
        m.fade(seg(ft, 749.85, 750.3), CU_DIP);
        return [m.S, m.C, []];
      }
      R.rock(0); R.lights(0, 1, 0.2, 1.6);
      const p = 0.6 * (1 - Math.pow(seg(ft, 750.3, o.T0 + d + 0.6), 0.7));
      diveCam(R, p, wide, tgt, 0.2);
      R.fade(1 - seg(ft, 750.3, 750.8), CU_DIP);
      return [R.S, R.C, []];
    };
  };

  // ================================================================= TABLE: 1.5 mm² wire on a wooden table, heater, steel ruler (units: mm)
  let _woodT, _rulerT;
  const woodTex = () => _woodT || (_woodT = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#3a2618"; g.fillRect(0, 0, w, h); const r = rnd(61);
    for (let i = 0; i < 260; i++) { const y = r() * h, a = 2 + r() * 10; g.strokeStyle = (r() < 0.5 ? "rgba(20,10,5," : "rgba(110,72,44,") + (0.08 + r() * 0.22) + ")"; g.lineWidth = 0.8 + r() * 3.5; g.beginPath(); for (let x = -10; x <= w + 10; x += 24) g.lineTo(x, y + Math.sin(x * 0.004 + i) * a + Math.sin(x * 0.017 + i * 3) * a * 0.3); g.stroke(); }
    speckle(g, w, h, 3000, 62, ["#1a0e07", "#5a3b25"], 0.5, 1.6);
  }));
  const rulerTex = () => _rulerT || (_rulerT = canvasTex(4096, 128, (g, w, h) => {
    // 4096 px = 100 mm -> 40.96 px per mm; canvas top = the edge next to the wire
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#b9bcc0"); gr.addColorStop(1, "#a6a9ae"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rnd(5); for (let i = 0; i < 900; i++) { g.strokeStyle = "rgba(255,255,255," + r() * 0.08 + ")"; g.lineWidth = 0.6; const y = r() * h; g.beginPath(); g.moveTo(0, y); g.lineTo(w, y + (r() - 0.5) * 4); g.stroke(); }
    g.fillStyle = "#1d1e20";
    for (let mm = 0; mm <= 100; mm++) { const x = mm * 40.96, L = mm % 10 === 0 ? 30 : mm % 5 === 0 ? 22 : 15; g.fillRect(x - 1.6, 0, 3.2, L); }
    for (let k = 0; k < 100; k++) { const x = (k + 0.5) * 40.96; g.fillRect(x - 1, 0, 2, 9); }
    g.font = "bold 22px Arial"; g.textAlign = "center"; for (let c = 1; c < 10; c++) g.fillText(String(c + 14), c * 409.6, 56);
  }));

  function table(o) {
    o = o || {};
    const S = stage("studio", { floorY: -40, key: 2.4, hemi: 0.22, rim: 0.7 });
    S.fog = new THREE.Fog(0x0b0c10, 900, 3200);
    const key = S.userData.key; key.position.set(-500, 900, 600); key.target.position.set(250, 0, 0); S.add(key.target);
    const sc = key.shadow.camera; sc.left = -500; sc.right = 500; sc.top = 400; sc.bottom = -400; sc.near = 200; sc.far = 2500; key.shadow.bias = -0.0003; key.shadow.radius = 5;
    S.children.forEach((c) => { if (c.isDirectionalLight && c !== key) c.position.multiplyScalar(80); });
    const C = cam(o.fov || 32), fade = fader(S, C);
    const wt = woodTex().clone(); wt.needsUpdate = true; wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(3, 2);
    const top = new THREE.Mesh(new THREE.PlaneGeometry(1800, 1100), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.62, metalness: 0, bumpMap: wt, bumpScale: 0.4, envMapIntensity: 0.35 }));
    top.rotation.x = -Math.PI / 2; top.position.set(250, 0, 0); top.receiveShadow = true; S.add(top);
    const red = new THREE.MeshPhysicalMaterial({ color: 0x9c2119, roughness: 0.42, clearcoat: 0.25, clearcoatRoughness: 0.4, envMapIntensity: 0.45 });
    const redCut = new THREE.MeshStandardMaterial({ color: 0xb53a2c, roughness: 0.7 });
    const cu = new THREE.MeshStandardMaterial({ color: 0xd2895a, metalness: 1, roughness: 0.22, envMapIntensity: 1.3 });
    const RO = 1.45, RC = 0.69, Y = RO;
    const G = { S, C, fade, key, RO, RC, Y };
    const cyl = (r, x0, x1, mat, open, ts, tl) => { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, x1 - x0, 48, 1, !!open, ts || 0, tl || TAU), mat); m.rotation.z = Math.PI / 2; m.position.set((x0 + x1) / 2, Y, 0); m.castShadow = true; m.receiveShadow = true; S.add(m); return m; };
    // wire from the cut end (x = 0) to the heater (x = 560); cutaway 150..172: top half of the insulation removed, copper cut lengthwise
    const CX0 = 150, CX1 = 172;
    cyl(RO, 0, CX0, red, true); cyl(RO, CX1, 560, red, true);
    cyl(RO, CX0, CX1, red, true, Math.PI, Math.PI);
    cyl(RC, 0, CX0, cu, true); cyl(RC, CX1, 560, cu, true);
    cyl(RC, CX0, CX1, cu, true, Math.PI, Math.PI);
    const faceM = new THREE.MeshStandardMaterial({ color: 0xb06c44, metalness: 0.55, roughness: 0.5, envMapIntensity: 0.7 });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(CX1 - CX0, 2 * RC), faceM);
    face.rotation.x = -Math.PI / 2; face.position.set((CX0 + CX1) / 2, Y, 0); face.receiveShadow = true; S.add(face);
    [-1, 1].forEach((sd) => { const st = new THREE.Mesh(new THREE.PlaneGeometry(CX1 - CX0, RO - RC), new THREE.MeshStandardMaterial({ color: 0x7e1c15, roughness: 0.8 })); st.rotation.x = -Math.PI / 2; st.position.set((CX0 + CX1) / 2, Y - 0.005, sd * (RO + RC) / 2); S.add(st); });
    [CX0, CX1].forEach((x, i) => { const dd = new THREE.Mesh(new THREE.CircleGeometry(RO, 48, 0, Math.PI), redCut); dd.rotation.y = i ? -Math.PI / 2 : Math.PI / 2; dd.position.set(x, Y, 0); S.add(dd); const dc = new THREE.Mesh(new THREE.CircleGeometry(RC, 48, 0, Math.PI), faceM); dc.rotation.copy(dd.rotation); dc.position.set(x + (i ? -0.02 : 0.02), Y, 0); S.add(dc); });
    // cross-section at the cut end
    const endR = new THREE.Mesh(new THREE.RingGeometry(RC, RO, 64), redCut); endR.rotation.y = -Math.PI / 2; endR.position.set(-0.03, Y, 0);
    const endC = new THREE.Mesh(new THREE.CircleGeometry(RC, 64), new THREE.MeshStandardMaterial({ color: 0xc9845a, metalness: 0.65, roughness: 0.32, envMapIntensity: 1.2 })); endC.rotation.y = -Math.PI / 2; endC.position.set(-0.04, Y, 0);
    S.add(endR, endC);
    G.cut = [CX0, CX1]; G.end = new V3(0, Y, 0);
    // steel ruler beside the cutaway (its 0 mm is at x = 146; labels 15, 16 ... at x = 156, 166 ...)
    const rt = rulerTex(); rt.anisotropy = 16;
    const rul = new THREE.Mesh(new THREE.BoxGeometry(100, 0.8, 24), [0, 1, 2, 3, 4, 5].map((i) => i === 2 ? new THREE.MeshStandardMaterial({ map: rt, metalness: 0.75, roughness: 0.38, envMapIntensity: 1.0 }) : new THREE.MeshStandardMaterial({ color: 0x9da1a6, metalness: 0.8, roughness: 0.35 })));
    rul.position.set(196, 0.4, RO + 0.6 + 12); rul.receiveShadow = true; rul.castShadow = true; S.add(rul);
    G.ruler = rul;
    // heater at the far end: polished reflector, ceramic rod, coiled element
    const Hh = new THREE.Group(); Hh.position.set(640, 0, 0); S.add(Hh);
    const chrome = new THREE.MeshStandardMaterial({ color: 0xd5d7da, metalness: 1, roughness: 0.28, envMapIntensity: 1.3, emissive: 0xff6a20, emissiveIntensity: 0, side: THREE.DoubleSide });
    const refl = new THREE.Mesh(new THREE.CylinderGeometry(70, 70, 420, 48, 1, true, 0, Math.PI), chrome); refl.rotation.x = Math.PI / 2; refl.position.set(30, 90, 0);
    const body = new THREE.MeshStandardMaterial({ color: 0x2b2d30, metalness: 0.6, roughness: 0.45 });
    const capL = new THREE.Mesh(new THREE.BoxGeometry(80, 150, 14), body); capL.position.set(10, 75, -214); const capR = capL.clone(); capR.position.z = 214;
    const foot = new THREE.Mesh(new THREE.BoxGeometry(140, 12, 460), body); foot.position.set(10, 6, 0);
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(9, 9, 410, 32), new THREE.MeshStandardMaterial({ color: 0xd9d2c3, roughness: 0.8 })); rod.rotation.x = Math.PI / 2; rod.position.set(0, 90, 0);
    const coilM = new THREE.MeshStandardMaterial({ color: 0x8a8580, metalness: 0.6, roughness: 0.45, emissive: 0xff5a14, emissiveIntensity: 0 });
    const hel = new THREE.Curve(); hel.getPoint = (u, out) => (out || new V3()).set(11 * Math.cos(u * TAU * 70), 11 * Math.sin(u * TAU * 70), (u - 0.5) * 400);
    const coil = new THREE.Mesh(new THREE.TubeGeometry(hel, 2400, 1.6, 6), coilM); coil.position.set(0, 90, 0);
    const box = new THREE.Mesh(new THREE.BoxGeometry(60, 40, 50), body); box.position.set(-40, 20, 0);
    [refl, capL, capR, foot, rod, coil, box].forEach((m) => { m.castShadow = true; m.receiveShadow = true; Hh.add(m); });
    const hglow = new THREE.PointLight(0xff7a30, 0, 0, 1.6); hglow.position.set(-40, 90, 0); Hh.add(hglow);
    const hs = glowSprite(0xff8a40, 300, 0); hs.position.set(-5, 90, 0); hs.scale.set(120, 520, 1); Hh.add(hs);
    G.heater = Hh;
    G.heat = (k) => { coilM.emissiveIntensity = 2.4 * k; coilM.color.setRGB(lerp(0.54, 0.9, k), lerp(0.52, 0.45, k), lerp(0.5, 0.3, k)); hglow.intensity = 2.5e4 * k; hs.material.opacity = 0.14 * k; chrome.emissiveIntensity = 0.22 * k; };
    // electrons on the cut copper face (honest model, not to scale) + one marker electron
    const NE = 1400, r = rnd(83), home = new Float32Array(NE * 3);
    for (let i = 0; i < NE; i++) { home[i * 3] = CX0 + 0.4 + r() * (CX1 - CX0 - 0.8); home[i * 3 + 1] = Y + 0.012; home[i * 3 + 2] = (r() * 2 - 1) * (RC - 0.06); }
    const jit = jitterSet(NE, 84, 0.07), eg = new THREE.BufferGeometry(), ep = new Float32Array(NE * 3); eg.setAttribute("position", new THREE.BufferAttribute(ep, 3));
    const eMat = new THREE.PointsMaterial({ size: 0.065, map: DOT(), color: 0xdde9f6, transparent: true, depthWrite: false, opacity: 0.95 });
    const hMat = new THREE.PointsMaterial({ size: 0.2, map: DOT(), color: 0x9ec3e6, transparent: true, depthWrite: false, opacity: 0.16, blending: THREE.AdditiveBlending });
    const pe = new THREE.Points(eg, eMat), ph = new THREE.Points(eg, hMat); S.add(pe, ph);
    const mk = new THREE.Mesh(SPH, new THREE.MeshStandardMaterial({ color: 0xf6ead6, emissive: 0xe8c890, emissiveIntensity: 0.8, roughness: 0.3 })); mk.scale.setScalar(0.03); S.add(mk);
    const mkg = glowSprite(0xf0dcb8, 0.2, 0.5); mk.add(mkg); mkg.scale.setScalar(7);
    const tmp = [0, 0, 0];
    // gx: collective shift (mm), jk: jitter scale, mx: marker x (mm) or null, vis: 0..1
    G.electrons = (ft, gx, jk, mx, vis) => {
      pe.visible = ph.visible = vis > 0.01; eMat.opacity = 0.95 * vis; hMat.opacity = 0.16 * vis;
      for (let i = 0; i < NE; i++) { jit(i, ft, jk, tmp); ep[i * 3] = home[i * 3] + tmp[0] + gx; ep[i * 3 + 1] = home[i * 3 + 1]; ep[i * 3 + 2] = home[i * 3 + 2] + tmp[2]; }
      eg.attributes.position.needsUpdate = true;
      mk.visible = mx !== null && vis > 0.01; if (mx !== null) { jit(7, ft, jk, tmp); mk.position.set(mx + tmp[0], Y + 0.02, 0.15 + tmp[2]); }
    };
    return G;
  }

  WIRE.drift = (o) => {
    const T = table({ fov: 30 });
    const P = (x, y, z) => new V3(x, y, z);
    // camera keys: [film time, position, target]
    const K = [
      [70.56, P(300, 60, 140), P(230, 1, 0)],
      [74.5, P(120, 34, 90), P(60, 1.5, 0)],
      [78.4, P(-9, 4.2, 6.5), P(0, 1.45, 0)],
      [85.6, P(-6.5, 3.6, -4.8), P(0, 1.45, 0)],
      [87.0, P(-70, 60, -40), P(60, 2, 0)],
      [89.2, P(-120, 330, 560), P(400, 40, 0)],
      [91.6, P(-40, 260, 470), P(390, 40, 0)],
      [93.0, P(160.4, 8.6, -5.4), P(161.4, 1.45, 1.4)],
      [97.54, P(160.9, 8.0, -5.0), P(162.1, 1.45, 1.4)],
    ];
    const lk = (ft) => { // interpolate in log-distance so the dives feel even
      let i = 0; while (i < K.length - 2 && ft >= K[i + 1][0]) i++;
      const a = K[i], b = K[i + 1], u = smooth(clamp((ft - a[0]) / (b[0] - a[0]), 0, 1));
      const tg = a[2].clone().lerp(b[2], u), da = a[1].clone().sub(a[2]), db = b[1].clone().sub(b[2]);
      const la = da.length(), lb = db.length(), dir = da.normalize().lerp(db.normalize(), u).normalize();
      return [tg.clone().add(dir.multiplyScalar(Math.exp(lerp(Math.log(la), Math.log(lb), u)))), tg];
    };
    return (t, d) => {
      const ft = o.T0 + t;
      T.heat(seg(ft, 87.6, 89.4));
      const mx = T.cut[0] + 11 + 0.2 * (ft - 93.0);          // marker creeps 0.2 mm per second
      T.electrons(ft, 0.2 * (ft - 93.0), 1, mx, seg(ft, 92.2, 93.2));
      const [p, tg] = lk(ft);
      const sway = 0.012 * p.distanceTo(tg);
      look(T.C, p.x + sway * Math.sin(ft * 0.4), p.y + sway * 0.5 * Math.sin(ft * 0.31), p.z, tg.x, tg.y, tg.z, Math.max(0.05, p.distanceTo(tg) * 0.02), 230 * seg(ft, 91.8, 93.0));
      T.fade(0);
      const pins = [
        pin("1.5 mm²", P(0, T.Y + T.RO + 0.1, 0), win(ft, 80.3, 85.5, 0.6)),
        pin("1000 W heater", P(640, 175, -120), win(ft, 88.0, 92.4, 0.6)),
        pin("4 amps", P(320, 3, 0), win(ft, 89.9, 92.4, 0.5)),
      ];
      return [T.S, T.C, pins];
    };
  };

  // soft warm energy wash flowing along x outside the wire: two broad bands, no particles
  function energyWash(S, x0, x1, y, rad) {
    const mat = new THREE.ShaderMaterial({ uniforms: { t: { value: 0 }, op: { value: 0 }, col: { value: new THREE.Color(0xeec48a) } }, transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      vertexShader: "varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: "uniform float t; uniform float op; uniform vec3 col; varying vec2 vU; void main(){ float a = sin(3.14159*vU.y); a = a*a; float e = smoothstep(0.0,0.15,vU.x)*smoothstep(1.0,0.85,vU.x); float p = 0.5 + 0.5*sin(18.0*(vU.x - t)); float q = 0.5 + 0.5*sin(7.0*(vU.x - 0.6*t) + 1.3); gl_FragColor = vec4(col * op * a * e * (0.35 + 0.65*p*q), 1.0); }" });
    const g = new THREE.Group(), bands = [-1, 1].map((sg) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(x1 - x0, rad * 0.95), mat); m.userData.sg = sg; g.add(m); return m; });
    S.add(g);
    // the bands sit either side of the wire and turn to face the camera (about the wire axis)
    return (ft, op, cp) => {
      mat.uniforms.t.value = ft * 0.08; mat.uniforms.op.value = op; g.visible = op > 0.002;
      const vy = cp.y - y, vz = cp.z, L = Math.hypot(vy, vz) || 1, ny = vy / L, nz = vz / L;
      bands.forEach((m) => { const sg = m.userData.sg; m.position.set((x0 + x1) / 2, y - nz * rad * sg, ny * rad * sg); m.rotation.set(Math.atan2(-ny, nz), 0, 0); });
    };
  }
  WIRE.stay = (o) => {
    const T = table({ fov: 30 }), ew = energyWash(T.S, T.cut[0] - 40, T.cut[1] + 40, T.Y, 3.1);
    T.ruler.visible = false; T.heater.visible = false; T.key.intensity = 1.1; T.S.children.forEach((c) => { if (c.isHemisphereLight) c.intensity = 0.12; });
    return (t, d) => {
      const ft = o.T0 + t;
      const sh = 0.16 * Math.sin(TAU * AC_F * ft);               // 50 Hz shuffle, shown slowed
      T.electrons(ft, sh, 1, null, 1); T.heat(0);
      const p = seg(ft, 344.28, 353.5);
      const tg = new V3(lerp(161, 158, seg(t, 0, d)), T.Y, 0);
      const dist = lerp(5, 13, p), az = lerp(-150, -128, seg(t, 0, d)), el = lerp(50, 20, p);
      aim(T.C, tg, dist, az, el, 0, -lerp(0, 120, p));
      ew(ft, 0.6 * seg(ft, 347.5, 351), T.C.position);
      T.fade(0);
      return [T.S, T.C, []];
    };
  };

  // ================================================================= MICRON: polished copper surface, one electron's swing, a human hair (units: µm)
  let _brushT, _hairT;
  const brushTex = () => _brushT || (_brushT = canvasTex(1024, 1024, (g, w, h) => { g.fillStyle = "#7a7a7a"; g.fillRect(0, 0, w, h); const r = rnd(71); for (let i = 0; i < 2600; i++) { g.strokeStyle = "rgba(" + (r() < 0.5 ? "255,255,255," : "0,0,0,") + (0.03 + r() * 0.08) + ")"; g.lineWidth = 0.5 + r() * 1.5; const y = r() * h, x = r() * w, L = 60 + r() * 400; g.beginPath(); g.moveTo(x, y); g.lineTo(x + L, y + (r() - 0.5) * 6); g.stroke(); } }));
  const hairTex = () => _hairT || (_hairT = canvasTex(1024, 256, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#5a3d24"); gr.addColorStop(0.5, "#8a6440"); gr.addColorStop(1, "#5a3d24"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const r = rnd(72); g.strokeStyle = "rgba(40,24,12,.45)"; g.lineWidth = 2;
    for (let x = 0; x < w + 40; x += 22 + r() * 10) { g.beginPath(); let y = 0; g.moveTo(x, 0); while (y < h) { y += 16; g.lineTo(x + Math.sin(y * 0.05 + x) * 6 + (r() - 0.5) * 4, y); } g.stroke(); }
    speckle(g, w, h, 1500, 73, ["#2a180c", "#b08a60"], 0.5, 2);
  }));
  function micron() {
    const S = stage("void", { dust: 0, key: 1.7, rim: 0, hemi: 0.25 });
    S.fog = new THREE.Fog(0x0b0c10, 400, 1400);
    const C = cam(34), fade = fader(S, C);
    const bt = brushTex(); bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.set(8, 8);
    const surf = new THREE.Mesh(new THREE.PlaneGeometry(1600, 1600), new THREE.MeshStandardMaterial({ color: 0xb87650, metalness: 0.7, roughness: 0.6, bumpMap: bt, bumpScale: 0.06, envMapIntensity: 0.18 }));
    surf.rotation.x = -Math.PI / 2; surf.receiveShadow = true; S.add(surf);
    const key = S.userData.key; key.castShadow = true; key.position.set(-300, 600, 400); const sc = key.shadow.camera; sc.left = -300; sc.right = 300; sc.top = 300; sc.bottom = -300; sc.near = 100; sc.far = 2000; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004;
    const NE = 900, r = rnd(91), home = new Float32Array(NE * 3);
    for (let i = 0; i < NE; i++) { home[i * 3] = (r() * 2 - 1) * 40; home[i * 3 + 1] = 0.15 + r() * 1.2; home[i * 3 + 2] = (r() * 2 - 1) * 40; }
    const jit = jitterSet(NE, 92, 0.35), eg = new THREE.BufferGeometry(), ep = new Float32Array(NE * 3); eg.setAttribute("position", new THREE.BufferAttribute(ep, 3));
    const eMat = new THREE.PointsMaterial({ size: 0.12, map: DOT(), color: 0xdde9f6, transparent: true, depthWrite: false, opacity: 0.9 });
    S.add(new THREE.Points(eg, eMat));
    const mk = new THREE.Mesh(SPH, new THREE.MeshStandardMaterial({ color: 0xf6ead6, emissive: 0xe8c890, emissiveIntensity: 0.8, roughness: 0.3 })); mk.scale.setScalar(0.07); S.add(mk);
    const mkg = glowSprite(0xf0dcb8, 0.5, 0.5); mkg.material.depthTest = false; mk.add(mkg); mkg.scale.setScalar(7);
    const br = bracket(S);
    // the hair: 70 µm thick, lying on the copper; its cut end shows cuticle, cortex and medulla
    const ht = hairTex(); ht.wrapS = THREE.RepeatWrapping; ht.repeat.set(3, 1);
    const hairM = new THREE.MeshPhysicalMaterial({ map: ht, bumpMap: ht, bumpScale: 0.6, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.35, sheen: 0.4, sheenColor: new THREE.Color(0xd8b48a) });
    const hair = new THREE.Mesh(new THREE.CylinderGeometry(35, 35, 900, 64, 1, true), hairM); hair.rotation.z = Math.PI / 2; hair.rotation.y = 0.18; hair.position.set(-400, 35, -70); hair.castShadow = false; hair.receiveShadow = true; S.add(hair);
    const capT = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 4, 128, 128, 128); gr.addColorStop(0, "#2c1a0c"); gr.addColorStop(0.12, "#3c2614"); gr.addColorStop(0.2, "#9a7048"); gr.addColorStop(0.85, "#8a6038"); gr.addColorStop(0.92, "#c8a070"); gr.addColorStop(1, "#6a4a2c"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); speckle(g, 256, 256, 600, 74, ["#4a2e18", "#c09868"], 0.5, 1.5); });
    const cap = new THREE.Mesh(new THREE.CircleGeometry(35, 64), new THREE.MeshStandardMaterial({ map: capT, roughness: 0.7 }));
    cap.position.set(0, 450, 0); cap.rotation.x = -Math.PI / 2; hair.add(cap);
    const tmp = [0, 0, 0];
    return { S, C, fade, br, glint(k) { mkg.scale.setScalar(7 * k); }, set(ft, swing) {
      for (let i = 0; i < NE; i++) { jit(i, ft, 1, tmp); ep[i * 3] = home[i * 3] + tmp[0] + swing; ep[i * 3 + 1] = home[i * 3 + 1] + tmp[1] * 0.3; ep[i * 3 + 2] = home[i * 3 + 2] + tmp[2]; }
      eg.attributes.position.needsUpdate = true;
      mk.position.set(swing, 0.6, 0);
    } };
  }

  // ================================================================= ROOM: bedroom wall, modular switch, bulb (units: cm)
  // switch plate centre at origin, wall surface z = 0. o.cut: plaster cutaway with conduit + wires to the bulb. o.mech: switch internals.
  function rrect(w, h, r) { const s = new THREE.Shape(), x = -w / 2, y = -h / 2; s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r); s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h); s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r); s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y); return s; }
  function rpath(w, h, r, cx, cy) { const p = new THREE.Path(), x = cx - w / 2, y = cy - h / 2; p.moveTo(x + r, y); p.lineTo(x + w - r, y); p.quadraticCurveTo(x + w, y, x + w, y + r); p.lineTo(x + w, y + h - r); p.quadraticCurveTo(x + w, y + h, x + w - r, y + h); p.lineTo(x + r, y + h); p.quadraticCurveTo(x, y + h, x, y + h - r); p.lineTo(x, y + r); p.quadraticCurveTo(x, y, x + r, y); return p; }
  // rough-edged rectangular hole (broken plaster)
  function jagged(X0, X1, Y0, Y1, st, amp, seed) {
    const hole = new THREE.Path(), r = rnd(seed), pts = [];
    for (let y = Y0; y <= Y1; y += st) pts.push([X1 + (r() - 0.5) * amp, y]);
    for (let x = X1; x >= X0; x -= st) pts.push([x, Y1 + (r() - 0.5) * amp]);
    for (let y = Y1; y >= Y0; y -= st) pts.push([X0 + (r() - 0.5) * amp, y]);
    for (let x = X0; x <= X1; x += st) pts.push([x, Y0 + (r() - 0.5) * amp]);
    hole.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach((q) => hole.lineTo(q[0], q[1])); return hole;
  }
  let _wallT, _brickT, _plateT, _cookie, _cemT;
  const cementTex = () => _cemT || (_cemT = canvasTex(512, 512, (g, w, h) => { g.fillStyle = "#77706a"; g.fillRect(0, 0, w, h); speckle(g, w, h, 16000, 44, ["#4a4440", "#9a928a", "#6a5f55", "#b0a89e"], 0.6, 3.2); }));
  const wallTex = () => _wallT || (_wallT = canvasTex(1024, 1024, (g, w, h) => {
    g.fillStyle = "#d3c5ad"; g.fillRect(0, 0, w, h); const r = rnd(9);
    g.filter = "blur(40px)";
    for (let i = 0; i < 40; i++) { g.fillStyle = r() < 0.5 ? "rgba(170,152,126,.10)" : "rgba(236,226,208,.10)"; const x = r() * w, y = r() * h, rr = 60 + r() * 160; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { g.beginPath(); g.arc(x + a * w, y + b * h, rr, 0, TAU); g.fill(); } }
    g.filter = "none"; speckle(g, w, h, 14000, 5, ["#b5a68f", "#e2d7c4", "#c2b39b"], 0.6, 2.2);
  }));
  const brickTex = () => _brickT || (_brickT = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#8f8a80"; g.fillRect(0, 0, w, h); const r = rnd(12), bw = 128, bh = 48;
    for (let row = 0; row * bh < h; row++) for (let c = -1; c * bw < w; c++) { const x = c * bw + (row % 2) * bw / 2, y = row * bh, k = r(); g.fillStyle = `rgb(${104 + k * 26 | 0},${74 + k * 16 | 0},${62 + k * 10 | 0})`; g.fillRect(x + 4, y + 4, bw - 8, bh - 8); }
    speckle(g, w, h, 5000, 13, ["#3b2418", "#b07a5a", "#6a4430"], 0.6, 3);
  }));
  const plateTex = () => _plateT || (_plateT = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#efe9dc"; g.fillRect(0, 0, w, h);
    const gr = g.createRadialGradient(w / 2, h / 2, w * 0.2, w / 2, h / 2, w * 0.75); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(150,130,90,.22)"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    const sm = g.createRadialGradient(w * 0.4, h * 0.62, 4, w * 0.4, h * 0.62, w * 0.16); sm.addColorStop(0, "rgba(120,100,70,.13)"); sm.addColorStop(1, "rgba(120,100,70,0)"); g.fillStyle = sm; g.fillRect(0, 0, w, h);
    speckle(g, w, h, 600, 21, ["#a89878", "#ffffff"], 0.5, 2);
  }));
  // moonlight through a window: soft panes (spotlight cookie)
  const cookie = () => _cookie || (_cookie = canvasTex(512, 512, (g, w, h) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.filter = "blur(6px)"; g.fillStyle = "#fff"; g.fillRect(70, 50, 372, 412);
    g.fillStyle = "#000"; g.fillRect(196, 0, 9, h); g.fillRect(318, 0, 9, h); g.fillRect(0, 176, w, 9); g.fillRect(0, 318, w, 9);
    g.filter = "blur(40px)"; g.fillStyle = "rgba(0,0,0,.55)"; g.beginPath(); g.ellipse(430, 256, 70, 300, 0.1, 0, TAU); g.fill();
  }));
  // half pipe along a straight vertical run (conduit with its front half cut away)
  function halfPipe(x, y0, y1, z, r, mat) { const g = new THREE.CylinderGeometry(r, r, y1 - y0, 32, 1, true, Math.PI / 2, Math.PI); const m = new THREE.Mesh(g, mat); m.position.set(x, (y0 + y1) / 2, z); return m; }

  function room(o) {
    o = o || {};
    const S = stage("void", { dust: 0, key: 1e-4, rim: 0, hemi: 0.05, bg: 0x07080b });
    const C = cam(o.fov || 34); const fade = fader(S, C);
    const env = 0.35;
    const shape = new THREE.Shape(); shape.moveTo(-160, -110); shape.lineTo(160, -110); shape.lineTo(160, 150); shape.lineTo(-160, 150); shape.lineTo(-160, -110);
    if (o.cut) shape.holes.push(jagged(-7, 7, 6.5, 43, 2.2, 1.4, 31));
    if (o.mech) shape.holes.push(jagged(-6.5, 9.5, -6.5, 6, 1.3, 0.9, 77));
    const wt = wallTex(); wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(1 / 140, 1 / 140);
    const wallM = new THREE.MeshStandardMaterial({ map: wt, bumpMap: wt, bumpScale: 0.25, roughness: 0.92, metalness: 0, envMapIntensity: env * 0.6 });
    const wall = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 3.2, bevelEnabled: false, curveSegments: 4 }), wallM);
    wall.position.z = -3.2; wall.receiveShadow = true; S.add(wall);
    const G = { S, C, fade };
    if (o.cut) {
      const bt = brickTex(); bt.wrapS = bt.wrapT = THREE.RepeatWrapping; bt.repeat.set(1 / 23, 1 / 9);
      const brick = new THREE.Mesh(new THREE.PlaneGeometry(40, 70), new THREE.MeshStandardMaterial({ map: bt, bumpMap: bt, bumpScale: 0.8, roughness: 0.95, envMapIntensity: env * 0.5 }));
      brick.position.set(0, 25, -3.19); brick.receiveShadow = true; S.add(brick);
      const pvc = new THREE.MeshStandardMaterial({ color: 0x9a9a95, roughness: 0.55, metalness: 0, side: THREE.DoubleSide, envMapIntensity: env });
      const cd = halfPipe(0, 4, 47, -1.75, 1.25, pvc); cd.receiveShadow = true; S.add(cd);
      // wires: red (phase) and black; the red one has a small cutaway window showing its copper at y = 31
      const red = new THREE.MeshPhysicalMaterial({ color: 0xa3221b, roughness: 0.38, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: env * 1.4 });
      const blk = new THREE.MeshPhysicalMaterial({ color: 0x1c1c1e, roughness: 0.4, clearcoat: 0.5, clearcoatRoughness: 0.3, envMapIntensity: env * 1.4 });
      const cu = new THREE.MeshStandardMaterial({ color: 0xd08a58, metalness: 1, roughness: 0.3, envMapIntensity: 1.2 });
      const wr = 0.14, WX = -0.33, WZ = -1.3;
      const seg1 = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr, 26, 20), red); seg1.position.set(WX, 17, WZ);
      const seg2 = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr, 15, 20), red); seg2.position.set(WX, 39.5, WZ);
      const wn = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr, 2, 24, 1, true, Math.PI * 0.32, Math.PI * 1.36), red); wn.position.set(WX, 31, WZ);
      const core = new THREE.Mesh(new THREE.CylinderGeometry(wr * 0.5, wr * 0.5, 6.2, 24), cu); core.position.set(WX, 31, WZ);
      const bw = new THREE.Mesh(new THREE.CylinderGeometry(wr, wr, 43, 20), blk); bw.position.set(-WX, 25.5, WZ - 0.05);
      [seg1, seg2, wn, core, bw].forEach((m) => { m.castShadow = true; m.receiveShadow = true; S.add(m); });
      G.window = new V3(WX, 31, WZ + wr * 0.3);
    }
    // switch plate (Indian 2-module: two rockers, two screws)
    const plateM = new THREE.MeshPhysicalMaterial({ map: plateTex(), roughness: 0.32, clearcoat: 0.6, clearcoatRoughness: 0.25, envMapIntensity: env, transparent: true, opacity: 1 });
    const ps = rrect(8.6, 8.6, 0.7); ps.holes.push(rpath(4.7, 4.7, 0.3, 0, 0));
    const plate = new THREE.Mesh(new THREE.ExtrudeGeometry(ps, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.18, bevelSize: 0.2, bevelSegments: 4, curveSegments: 10 }), plateM);
    const uvA = plate.geometry.attributes.uv; for (let i = 0; i < uvA.count; i++) uvA.setXY(i, uvA.getX(i) / 9 + 0.5, uvA.getY(i) / 9 + 0.5);
    plate.position.z = 0.18; plate.castShadow = true; plate.receiveShadow = true; S.add(plate);
    const modM = new THREE.MeshPhysicalMaterial({ color: 0xe6e0d2, roughness: 0.45, clearcoat: 0.3, envMapIntensity: env, transparent: true, opacity: 1 });
    const bed = new THREE.Mesh(new THREE.BoxGeometry(4.7, 4.7, 0.4), modM); bed.position.z = 0.1; bed.castShadow = true; S.add(bed);
    const rockG = new THREE.ExtrudeGeometry(rrect(2.05, 4.3, 0.25), { depth: 0.35, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.1, bevelSegments: 3, curveSegments: 8 });
    const rockM = new THREE.MeshPhysicalMaterial({ color: 0xf2ede2, roughness: 0.3, clearcoat: 0.7, clearcoatRoughness: 0.2, envMapIntensity: env, transparent: true, opacity: 1 });
    const rockers = [-1.12, 1.12].map((x, i) => {
      const p = new THREE.Group(); p.position.set(x, 0, 0.45); const m = new THREE.Mesh(rockG, rockM); m.castShadow = true; p.add(m);
      const dotM = new THREE.MeshStandardMaterial({ color: i ? 0x8c8c86 : 0xd2552c, roughness: 0.5, emissive: i ? 0 : 0x5a1806, transparent: true });
      const dot = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.16, 0.05), dotM); dot.position.set(0, 1.55, 0.48); p.add(dot);
      S.add(p); return p;
    });
    const screwM = new THREE.MeshStandardMaterial({ color: 0xbdbab2, metalness: 0.6, roughness: 0.38, envMapIntensity: 1, transparent: true });
    const slotM = new THREE.MeshStandardMaterial({ color: 0x3a3936, roughness: 0.6, transparent: true });
    [-3.45, 3.45].forEach((x) => { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 0.16, 24), screwM); s.rotation.x = Math.PI / 2; s.position.set(x, 0, 0.74); const sl = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.07, 0.05), slotM); sl.position.set(x, 0, 0.82); sl.rotation.z = x > 0 ? 0.6 : -0.3; S.add(s, sl); });
    if (o.mech) {
      // grey PVC back box (open front/right/top) in a cement cavity + the left module's contacts, cut open
      const ct = cementTex(); const boxM = new THREE.MeshStandardMaterial({ color: 0x34352f, roughness: 0.7, roughnessMap: ct, bumpMap: ct, bumpScale: 0.12, envMapIntensity: env, side: THREE.DoubleSide });
      const bb = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 7.2), boxM); bb.position.z = -4.6; bb.receiveShadow = true;
      const bl = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 7.2), boxM); bl.rotation.y = Math.PI / 2; bl.position.set(-3.6, 0, -2.3);
      const bo = new THREE.Mesh(new THREE.PlaneGeometry(7.2, 4.6), boxM); bo.rotation.x = -Math.PI / 2; bo.position.set(0, -3.6, -2.3); bo.receiveShadow = true;
      S.add(bb, bl, bo);
      const bt2 = cementTex().clone(); bt2.needsUpdate = true; bt2.wrapS = bt2.wrapT = THREE.RepeatWrapping; bt2.repeat.set(1 / 9, 1 / 9);
      const cav = new THREE.Mesh(new THREE.PlaneGeometry(22, 18), new THREE.MeshStandardMaterial({ map: bt2, color: 0x6a645c, bumpMap: bt2, bumpScale: 0.8, roughness: 0.95, envMapIntensity: env * 0.5 })); cav.position.set(1.5, 0, -3.19); cav.receiveShadow = true; S.add(cav);
      const brass = new THREE.MeshStandardMaterial({ color: 0xd2ad62, metalness: 0.92, roughness: 0.27, envMapIntensity: 1.5 });
      const silver = new THREE.MeshStandardMaterial({ color: 0xd6d4cf, metalness: 1, roughness: 0.22, envMapIntensity: 1.1 });
      const steel = new THREE.MeshStandardMaterial({ color: 0x9a9a98, metalness: 1, roughness: 0.35, envMapIntensity: 1.0 });
      const ht = cementTex(); const housing = new THREE.MeshStandardMaterial({ color: 0x24221f, roughness: 0.78, bumpMap: ht, bumpScale: 0.04, envMapIntensity: env });
      const ivory = new THREE.MeshPhysicalMaterial({ color: 0xd9d0bd, roughness: 0.42, clearcoat: 0.3, envMapIntensity: env });
      const g = new THREE.Group(); g.position.set(-1.12, 0, 0); S.add(g);
      const hl = new THREE.Mesh(new THREE.BoxGeometry(0.12, 4.2, 4.0), housing); hl.position.set(-0.95, 0, -2.0); hl.receiveShadow = true; g.add(hl);
      // fixed contact: brass bar along z with a silver button on top
      const fb = new THREE.Mesh(new THREE.BoxGeometry(0.75, 0.12, 2.2), brass); fb.position.set(0, -0.5, -2.35); fb.castShadow = fb.receiveShadow = true;
      const fbtn = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.12, 28), silver); fbtn.position.set(0, -0.38, -1.45);
      // moving contact: brass leaf on a hinge, silver button underneath
      const piv = new THREE.Group(); piv.position.set(0, 0.2, -3.0);
      const leaf = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.1, 2.0), brass); leaf.position.set(0, 0, 0.95); leaf.castShadow = leaf.receiveShadow = true;
      const lbtn = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.24, 0.12, 28), silver); lbtn.position.set(0, -0.11, 1.55);
      const tipP = new THREE.Object3D(); tipP.position.set(0, -0.17, 1.55); piv.add(leaf, lbtn, tipP);
      // spring pressing on the leaf from the rocker
      const hel = new THREE.Curve(); hel.getPoint = (u, out) => (out || new V3()).set(0.17 * Math.cos(u * TAU * 7), u, 0.17 * Math.sin(u * TAU * 7));
      const spring = new THREE.Mesh(new THREE.TubeGeometry(hel, 220, 0.025, 6), steel); g.add(spring);
      const plunger = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.0, 16), ivory); g.add(plunger);
      const term = (y) => { const b = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.7, 0.7), brass); b.position.set(0, y, -3.45); b.castShadow = true; const s = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 20), steel); s.position.set(0, y + 0.4, -3.45); g.add(b, s); };
      term(-0.5); term(0.45);
      g.add(fb, fbtn, piv);
      const redM = new THREE.MeshPhysicalMaterial({ color: 0xa3221b, roughness: 0.38, clearcoat: 0.5, envMapIntensity: env * 1.4 });
      const blkM = new THREE.MeshPhysicalMaterial({ color: 0x222224, roughness: 0.4, clearcoat: 0.5, envMapIntensity: env * 1.4 });
      const cuM = new THREE.MeshStandardMaterial({ color: 0xd08a58, metalness: 1, roughness: 0.3 });
      const wire = (pts, mat, rr) => { const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts.map((q) => new V3(q[0], q[1], q[2]))), 60, rr, 14), mat); m.castShadow = true; g.add(m); return m; };
      wire([[0, -0.5, -3.75], [0, -0.5, -3.95]], cuM, 0.07); wire([[0, -0.5, -3.9], [0.1, -0.7, -4.3], [0.8, -2.4, -4.45], [1.6, -3.4, -4.4]], redM, 0.14);
      wire([[0, 0.45, -3.75], [0, 0.45, -3.95]], cuM, 0.07); wire([[0, 0.45, -3.9], [0.1, 0.8, -4.3], [0.9, 2.4, -4.45], [1.7, 3.4, -4.4]], blkM, 0.14);
      const ml = new THREE.SpotLight(0xe9e4da, 0, 0, 0.17, 0.85, 0); ml.position.set(14, 10, 16); ml.target.position.set(-1.1, -0.2, -2.4); ml.castShadow = true; ml.shadow.mapSize.set(1024, 1024); ml.shadow.bias = -0.0004; ml.shadow.camera.near = 5; ml.shadow.camera.far = 60; S.add(ml, ml.target); G.mlight = ml;
      // warm rim from behind-above: specular edges on the brass and the spring
      const rim = new THREE.SpotLight(0xffc68a, 0, 0, 0.22, 0.8, 0); rim.position.set(-9, 9, -12); rim.target.position.set(-1.1, -0.1, -2.2); S.add(rim, rim.target); G.rimL = rim;
      // contacts: k = 1 closed, 0 open (gap about 3 mm)
      G.contacts = (k) => {
        piv.rotation.x = lerp(0.03, 0.218, k);
        const sy = 0.2 - Math.sin(piv.rotation.x) * 0.9;
        spring.position.set(0, sy + 0.05, -2.1); spring.scale.set(1, 1.1 - sy * 0.4, 1);
        plunger.position.set(0, sy + 1.6, -2.1);
      };
      G.leafAxis = (u, out, qo) => { g.updateWorldMatrix(true, true); out.set(0, 0, lerp(0.1, 1.55, u)).applyMatrix4(piv.matrixWorld); piv.getWorldQuaternion(qo); };
      G.gap = () => { g.updateWorldMatrix(true, true); const a = new V3(), b = new V3(); fbtn.getWorldPosition(a); a.y += 0.06; tipP.getWorldPosition(b); return [a, b]; };
    }
    G.plate = plate; G.rockers = rockers;
    // ghosting the plate (cutaway): plate, module, rockers, screws and a plaster patch over the hole fade out
    const gm = [plateM, modM, rockM, screwM, slotM, ...rockers.map((rk) => rk.children[1].material)], gobj = [];
    S.traverse((m) => { if (m.isMesh && gm.includes(m.material)) gobj.push(m); });
    let patch = null;
    if (o.mech) { const pm = wallM.clone(); pm.transparent = true; patch = new THREE.Mesh(new THREE.PlaneGeometry(17.5, 14), pm); patch.position.set(1.5, -0.25, 0.01); patch.receiveShadow = true; S.add(patch); }
    G.ghostK = (k) => { gm.forEach((m) => { m.opacity = 1 - 0.96 * k; m.depthWrite = k < 0.5; }); gobj.forEach((m) => (m.visible = k < 0.995)); if (patch) { patch.material.opacity = 1 - k; patch.visible = k < 0.995; } };
    // bulb on a wall bracket above
    const holderM = new THREE.MeshPhysicalMaterial({ color: 0xece6da, roughness: 0.35, clearcoat: 0.5, envMapIntensity: env });
    const base = new THREE.Mesh(new THREE.CylinderGeometry(3.6, 3.8, 1.6, 40), holderM); base.rotation.x = Math.PI / 2; base.position.set(0, 50, 0.8);
    const arm = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.8, 4.5, 32), holderM); arm.position.set(0, 48.2, 3.2); arm.rotation.x = -0.5;
    const bulbM = new THREE.MeshPhysicalMaterial({ color: 0xf4efe6, roughness: 0.55, emissive: 0xffc27a, emissiveIntensity: 0, envMapIntensity: env });
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(3.0, 40, 28), bulbM); bulb.position.set(0, 44.2, 5.6); bulb.scale.set(1, 1.15, 1);
    const glow = glowSprite(0xffd7a0, 14, 0); glow.position.copy(bulb.position);
    [base, arm, bulb].forEach((m) => { m.castShadow = true; S.add(m); }); S.add(glow);
    // lights: moonlight through the window (cool, patterned), the room bulb (warm), a faint cool fill, a soft light on the cutaway
    const moon = new THREE.SpotLight(0x8ea6d0, 1, 0, 0.3, 0.35, 0); moon.map = cookie(); moon.castShadow = true; moon.shadow.mapSize.set(2048, 2048); moon.shadow.bias = -0.0003; moon.shadow.radius = 2.5; moon.shadow.camera.near = 100; moon.shadow.camera.far = 900;
    moon.position.set(-260, 150, 260); moon.target.position.set(o.mt ? o.mt[0] : 10, o.mt ? o.mt[1] : 10, 0); S.add(moon, moon.target);
    const lamp = new THREE.PointLight(0xffc48a, 0, 0, 2); lamp.position.set(0, 40, 14); S.add(lamp);
    const fill = new THREE.DirectionalLight(0x8496b0, 0.06); fill.position.set(20, 10, 80); S.add(fill);
    const insp = new THREE.SpotLight(0xd8dde6, 0, 0, 0.3, 1, 0); insp.position.set(25, 40, 140); insp.target.position.set(0, 24, -2); S.add(insp, insp.target);
    // on: bulb 0..1, mo: moon 0..1, fi: fill, ins: cutaway light; G.mk drives the mechanism light
    G.lights = (on, mo, fi, ins) => {
      insp.intensity = ins || 0; if (G.mlight) { G.mlight.intensity = G.mk || 0; G.rimL.intensity = 1.4 * (G.mk || 0); }
      lamp.intensity = 5200 * on; bulbM.emissiveIntensity = 2.2 * on; bulbM.color.setScalar(lerp(0.55, 1, on)); glow.material.opacity = 0.22 * on;
      moon.intensity = 1.25 * (mo === undefined ? 1 : mo); fill.intensity = fi === undefined ? 0.06 : fi;
    };
    // rocker: 1 = on (bottom pressed, as in India), 0 = off
    G.rock = (k) => { rockers[0].rotation.x = lerp(-0.13, 0.13, k); rockers[1].rotation.x = 0.13; };
    return G;
  }

  // ================================================================= SWITCH3D
  const SW = {};
  SW.press = (o) => {
    const R = room({ fov: 30, mt: [29, -16] });
    return (t, d) => {
      const ft = o.T0 + t;
      R.rock(1 - seg(ft, 1.56, 1.66));
      R.lights(ft < 2.2 ? 1 : 0, 1);
      const p = seg(t, 0, d) * 0.85 + t / d * 0.15;
      look(R.C, lerp(14, 9, p), lerp(6, 3.5, p), lerp(42, 27, p), lerp(-1.5, -0.5, p), lerp(2.5, 1.2, p), 0, 0.3);
      R.fade(0);
      return [R.S, R.C, []];
    };
  };
  // camera around the mechanism (cm)
  const MECH_T = new V3(-1.1, -0.15, -2.2);
  SW.cutaway = (o) => {
    const R = room({ fov: 30, mech: true });
    return (t, d) => {
      const ft = o.T0 + t;
      const ok = 1 - seg(ft, 369.94, 370.02);           // the spring snaps the contacts apart
      R.contacts(ok); R.rock(ok);
      R.ghostK(seg(ft, 363.0, 365.0));
      R.mk = lerp(0.6, 5, seg(ft, 362.8, 365.2)) * lerp(1, 0.8, seg(ft, 369.9, 371));
      R.lights(ok, lerp(0.8, 0.1, seg(ft, 362.6, 364.5)), 0.05);
      const az = cr([[362.46, 8], [365.4, 40], [372, 47], [378.6, 42], [380.6, 38]], ft);
      const el = cr([[362.46, 6], [365.4, 18], [372, 14], [380.6, 20]], ft);
      const dist = cr([[362.46, 26], [365.4, 7.0], [369.9, 5.9], [376.2, 4.7], [378.7, 5.2], [380.6, 6.6]], ft);
      const q = seg(ft, 362.5, 365.4), tg = new V3(lerp(-1.6, MECH_T.x, q), lerp(0.4, MECH_T.y, q), lerp(0, MECH_T.z, q));
      aim(R.C, tg, dist, az, el, 0, 0);
      R.fade(0);
      const [a, b] = R.gap(), mid = a.clone().lerp(b, 0.5);
      const pins = [pin("brass contacts", new V3(-1.12, -0.5, -1.0), win(ft, 365.6, 369.6, 0.6)), pin("air gap", mid.clone().add(new V3(0, 0.05, 0.2)), win(ft, 370.6, o.T0 + d - 0.3, 0.6))];
      return [R.S, R.C, pins];
    };
  };
  SW.spark = (o) => {
    const R = room({ fov: 30, mech: true });
    const arcM = M.light(0xe4ecff, 1), arcV = new V3(), seed = { k: 0, a: new V3(), b: new V3(0, 1, 0) };
    const arcPt = (u) => {
      const r = rnd(seed.k * 7 + 3); let ox = 0, oz = 0;
      for (let i = 1; i <= 3; i++) { const s = Math.sin(Math.PI * u * i) / i; ox += (r() - 0.5) * 0.16 * s; oz += (r() - 0.5) * 0.16 * s; }
      return arcV.lerpVectors(seed.a, seed.b, u).add(new V3(ox, 0, oz));
    };
    const arc = L3.liveTube(arcPt, 30, 0.022, arcM);
    const arcH = new THREE.MeshBasicMaterial({ color: 0x9fb8ff, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const arcHalo = L3.liveTube(arcPt, 30, 0.07, arcH);
    const halo = glowSprite(0xa8bfff, 1.6, 0), hot = new THREE.PointLight(0xaec4ff, 0, 0, 2);
    R.S.add(arc, arcHalo, halo, hot);
    const ringM = new THREE.MeshBasicMaterial({ color: 0xa9c6e8, transparent: true, opacity: 0, depthWrite: false });
    const rings = [0, 1, 2, 3].map(() => { const m = new THREE.Mesh(new THREE.TorusGeometry(1, 0.012, 8, 96), ringM); R.S.add(m); return m; });
    const q = new THREE.Quaternion();
    return (t, d) => {
      const ft = o.T0 + t;
      const ok = 1 - seg(ft, 395.42, 395.5);
      R.contacts(ok); R.rock(ok); R.ghostK(1);
      R.mk = lerp(0.6, 0.42, seg(ft, 396, 399)) * (1 - 0.85 * seg(ft, 406.5, 410.5));
      R.lights(0, 0.25, 0.02);
      const [a, b] = R.gap(); seed.a.copy(a); seed.b.copy(b);
      const f = Math.floor(ft * 30);
      const fl = (x) => 0.55 + 0.45 * rnd(f * 13 + x)();
      const arc1 = ft >= 395.5 && ft < 396.3 ? fl(1) * (1 - 0.6 * seg(ft, 396.0, 396.3)) : 0;
      const arc2 = ft >= 405.0 && ft < 405.3 ? fl(2) : 0;
      const A = Math.max(arc1, arc2);
      seed.k = f; arc.visible = arcHalo.visible = A > 0; arcM.opacity = A; arcH.opacity = 0.3 * A;
      halo.position.lerpVectors(a, b, 0.5); halo.material.opacity = 0.4 * A; hot.position.copy(halo.position); hot.intensity = 8 * A;
      // magnetic rings around the current path (the brass leaf) collapse into the gap, 403.66 -> 405.0
      ringM.opacity = 0.5 * win(ft, 403.7, 405.05, 0.3);
      rings.forEach((m, i) => {
        const p = seg(ft, 403.7 + i * 0.1, 405.0), rr = lerp(0.55 + i * 0.22, 0.04, p * p);
        m.visible = ft > 403.6 && ft < 405.1;
        R.leafAxis(0.15 + i * 0.25, m.position, q); m.position.lerp(halo.position, p * p); m.quaternion.copy(q); m.scale.set(rr, rr, 1);
      });
      const az = cr([[395, 48], [399, 42], [403.6, 36], [405.4, 33], [411.56, 28]], ft);
      const el = cr([[395, 10], [403.6, 16], [411.56, 22]], ft);
      const dist = cr([[395, 3.3], [398, 3.9], [403.6, 5.0], [405.2, 4.1], [411.56, 4.8]], ft);
      aim(R.C, MECH_T.clone().add(new V3(0, -0.05, 0.4)), dist, az, el, 0, 0);
      R.fade(0.88 * seg(ft, 407.5, 411.4));
      return [R.S, R.C, []];
    };
  };
  SW.end = (o) => {
    const R = room({ fov: 30, mt: [29, -16] });
    return (t, d) => {
      R.rock(0); R.lights(0, 1);
      const p = t / d;
      look(R.C, lerp(-14, -9, p), lerp(2, 0.5, p), lerp(52, 38, p), lerp(-9, -6, p), lerp(-4.5, -3.2, p), 0, 0.3);
      R.fade(seg(t, d - 1.5, d - 0.05));
      return [R.S, R.C, []];
    };
  };
  LABK.switch3d = ((o) => (SW[o.mode] || SW.press)(o));

  // ================================================================= JOURNEY: a paper map on a table, plant -> house, a bead inching along (units: cm)
  let _mapT;
  const mapTex = () => _mapT || (_mapT = canvasTex(2048, 1024, (g, w, h) => {
    g.fillStyle = "#e6dcc4"; g.fillRect(0, 0, w, h); const r = rnd(101);
    for (let i = 0; i < 70; i++) { g.fillStyle = ["rgba(150,165,120,.16)", "rgba(185,170,120,.14)", "rgba(130,150,110,.12)"][i % 3]; g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) g.lineTo(x + (r() - 0.3) * 260, y + (r() - 0.3) * 160); g.fill(); }
    g.strokeStyle = "rgba(140,110,70,.28)"; g.lineWidth = 1.4;
    for (let c = 0; c < 9; c++) { const cx = 300 + r() * 1500, cy = 150 + r() * 700; for (let k = 1; k < 7; k++) { g.beginPath(); for (let a = 0; a <= TAU + 0.01; a += 0.1) { const rr = k * 26 * (1 + 0.25 * Math.sin(a * 3 + c) + 0.1 * Math.sin(a * 7 + k)); g.lineTo(cx + Math.cos(a) * rr * 1.6, cy + Math.sin(a) * rr); } g.stroke(); } }
    g.strokeStyle = "rgba(95,125,150,.55)"; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 820); for (let x = 0; x <= w; x += 40) g.lineTo(x, 760 - 220 * Math.sin(x / w * 3.2) + 30 * Math.sin(x * 0.02)); g.stroke();
    g.strokeStyle = "rgba(120,110,100,.5)"; g.lineWidth = 3; for (let k = 0; k < 7; k++) { g.beginPath(); const y0 = r() * h; g.moveTo(0, y0); for (let x = 0; x <= w; x += 60) g.lineTo(x, y0 + Math.sin(x * 0.004 + k) * 90 + (r() - 0.5) * 10); g.stroke(); }
    speckle(g, w, h, 6000, 102, ["#bfb296", "#f4ecda"], 0.6, 2.4);
  }));
  WIRE.journey = (o) => {
    const S = stage("studio", { floorY: -20, key: 0.5, hemi: 0.1, rim: 0.3 });
    S.fog = new THREE.Fog(0x0b0c10, 400, 1200);
    const pool = new THREE.SpotLight(0xfff0dc, 9e4, 0, 0.42, 1, 2); pool.position.set(-30, 260, 160); pool.target.position.set(0, 0, 16); pool.castShadow = true; pool.shadow.mapSize.set(2048, 2048); pool.shadow.bias = -0.0004; pool.shadow.camera.near = 100; pool.shadow.camera.far = 600; S.add(pool, pool.target);
    const key = S.userData.key; key.position.set(-160, 300, 180); const sc = key.shadow.camera; sc.left = -160; sc.right = 160; sc.top = 120; sc.bottom = -120; sc.near = 50; sc.far = 900; key.shadow.bias = -0.0004;
    S.children.forEach((c) => { if (c.isDirectionalLight && c !== key) c.position.multiplyScalar(20); });
    const C = cam(30), fade = fader(S, C);
    const mt = mapTex(); mt.anisotropy = 16;
    const map = new THREE.Mesh(new THREE.PlaneGeometry(220, 110), new THREE.MeshStandardMaterial({ map: mt, color: 0xc4bcae, roughness: 0.85, bumpMap: mt, bumpScale: 0.05, envMapIntensity: 0.2 }));
    map.rotation.x = -Math.PI / 2; map.receiveShadow = true; S.add(map);
    const wt = woodTex().clone(); wt.needsUpdate = true; wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(4, 3); const tbl = new THREE.Mesh(new THREE.PlaneGeometry(600, 400), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.6, envMapIntensity: 0.3 })); tbl.rotation.x = -Math.PI / 2; tbl.position.y = -0.05; tbl.receiveShadow = true; S.add(tbl);
    // route: plant (left) to house (right), 200 km on the map
    const route = new THREE.CatmullRomCurve3([[-88, 18], [-60, 26], [-35, 14], [-10, 22], [15, 10], [40, 18], [62, 8], [84, 14]].map((q) => new V3(q[0], 0.35, q[1])));
    const cable = new THREE.Mesh(new THREE.TubeGeometry(route, 300, 0.35, 12), new THREE.MeshPhysicalMaterial({ color: 0x9c2119, roughness: 0.4, clearcoat: 0.3, envMapIntensity: 0.5 })); cable.castShadow = true; S.add(cable);
    const concrete = new THREE.MeshStandardMaterial({ color: 0xa9a59c, roughness: 0.85 }), dark = new THREE.MeshStandardMaterial({ color: 0x5b5d60, roughness: 0.7 });
    const plant = new THREE.Group(); plant.position.set(-96, 0, 18); S.add(plant);
    const prof = []; for (let i = 0; i <= 20; i++) { const y = i / 20 * 14; prof.push(new THREE.Vector2(4.6 - 2.2 * Math.sin(Math.PI * Math.min(1, y / 11)) * 0.8 + (y > 11 ? (y - 11) * 0.25 : 0), y)); }
    const tower = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), new THREE.MeshStandardMaterial({ color: 0xb3afa6, roughness: 0.9, side: THREE.DoubleSide })); tower.position.set(-6, 0, -6);
    const hall = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 7), concrete); hall.position.set(4, 3, 0);
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 20, 24), concrete); stack.position.set(9, 10, -4);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.2, 24), new THREE.MeshStandardMaterial({ color: 0x9c3a2c, roughness: 0.7 })); band.position.set(9, 18.6, -4);
    const roofH = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.4, 7.4), dark); roofH.position.set(4, 6.2, 0);
    [tower, hall, stack, band, roofH].forEach((m) => { m.castShadow = true; m.receiveShadow = true; plant.add(m); });
    const steam = glowSprite(0xe8e6e0, 16, 0.12); steam.material.blending = THREE.NormalBlending; steam.position.set(-6, 19, -6); plant.add(steam);
    const house = new THREE.Group(); house.position.set(92, 0, 14); S.add(house);
    const walls = new THREE.Mesh(new THREE.BoxGeometry(5, 3.6, 4.2), new THREE.MeshStandardMaterial({ color: 0xe0d6c2, roughness: 0.8 })); walls.position.y = 1.8;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(4.1, 2.4, 4), new THREE.MeshStandardMaterial({ color: 0x9a4a32, roughness: 0.75 })); roof.position.y = 4.8; roof.rotation.y = Math.PI / 4;
    const winM = new THREE.MeshStandardMaterial({ color: 0x2a2a2a, emissive: 0xffc070, emissiveIntensity: 0.6 }); const wnd = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1), winM); wnd.position.set(-0.8, 1.9, 2.11);
    [walls, roof].forEach((m) => { m.castShadow = true; m.receiveShadow = true; house.add(m); }); house.add(wnd);
    // the electron: a small pale glass bead on the cable
    const bead = new THREE.Mesh(SPH, new THREE.MeshPhysicalMaterial({ color: 0xdbe8f5, emissive: 0x6f8fb0, emissiveIntensity: 0.5, roughness: 0.15, clearcoat: 1 })); bead.scale.setScalar(0.85); bead.castShadow = true; S.add(bead);
    const bg = glowSprite(0xcfe0f2, 5, 0.35); bead.add(bg); bg.scale.setScalar(5);
    return (t, d) => {
      const ft = o.T0 + t;
      const pr = clamp((ft - 100.6) / (108.0 - 100.6), 0, 1);
      const bp = route.getPointAt(pr * 0.985 + 0.004); bead.position.set(bp.x, 1.1, bp.z);
      steam.position.y = 19 + 1.5 * Math.sin(ft * 0.7); steam.material.opacity = 0.1 + 0.03 * Math.sin(ft * 1.1);
      const tx = lerp(-40, 30, seg(t, 0, d)) * 0.7 + bp.x * 0.3;
      aim(C, new V3(tx, 0, 10), lerp(170, 150, seg(t, 0, d)), lerp(-12, 6, seg(t, 0, d)), lerp(46, 40, seg(t, 0, d)), 0, -170);
      fade(0);
      const yr = 1 + Math.floor(pr * 29.999);
      const pins = [pin("power plant", new V3(-96, 21, 14), win(ft, 100.0, 101.8, 0.4)), pin("year " + yr, bp.clone().setY(2), win(ft, 101.4, 108.3, 0.5))];
      return [S, C, pins];
    };
  };

  // ================================================================= PIPE: the water-pipe picture, as an honest tabletop model (units: cm)
  // power-plant model: cooling tower, turbine hall, chimney (s = scale)
  function plantModel(s) {
    const g = new THREE.Group(), concrete = new THREE.MeshStandardMaterial({ color: 0xa9a59c, roughness: 0.85 }), dark = new THREE.MeshStandardMaterial({ color: 0x5b5d60, roughness: 0.7 });
    const prof = []; for (let i = 0; i <= 20; i++) { const y = i / 20 * 14; prof.push(new THREE.Vector2(4.6 - 1.76 * Math.sin(Math.PI * Math.min(1, y / 11)) + (y > 11 ? (y - 11) * 0.25 : 0), y)); }
    const tower = new THREE.Mesh(new THREE.LatheGeometry(prof, 48), new THREE.MeshStandardMaterial({ color: 0xb3afa6, roughness: 0.9, side: THREE.DoubleSide })); tower.position.set(-6, 0, -6);
    const hall = new THREE.Mesh(new THREE.BoxGeometry(10, 6, 7), concrete); hall.position.set(4, 3, 0);
    const stack = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 1.3, 20, 24), concrete); stack.position.set(9, 10, -4);
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 1.2, 24), new THREE.MeshStandardMaterial({ color: 0x9c3a2c, roughness: 0.7 })); band.position.set(9, 18.6, -4);
    const roofH = new THREE.Mesh(new THREE.BoxGeometry(10.4, 0.4, 7.4), dark); roofH.position.set(4, 6.2, 0);
    [tower, hall, stack, band, roofH].forEach((m) => { m.castShadow = true; m.receiveShadow = true; g.add(m); });
    g.scale.setScalar(s || 1); return g;
  }
  const glassM = () => new THREE.MeshPhysicalMaterial({ color: 0xe4ecf2, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.04, transparent: true, opacity: 0.07, depthWrite: false, envMapIntensity: 1.6, side: THREE.DoubleSide });
  const waterM = () => new THREE.MeshPhysicalMaterial({ color: 0x3f8a9c, roughness: 0.05, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.55, depthWrite: false, envMapIntensity: 0.9, emissive: 0x0c2a33, emissiveIntensity: 0.6 });
  function pipeStage() {
    const S = stage("studio", { floorY: -30, key: 2.2, hemi: 0.22, rim: 0.9 });
    S.fog = new THREE.Fog(0x0b0c10, 300, 900);
    const key = S.userData.key; key.position.set(-120, 260, 160); const sc = key.shadow.camera; sc.left = -150; sc.right = 150; sc.top = 120; sc.bottom = -120; sc.near = 50; sc.far = 800; key.shadow.bias = -0.0004;
    S.children.forEach((c) => { if (c.isDirectionalLight && c !== key) c.position.multiplyScalar(20); });
    const wt = woodTex().clone(); wt.needsUpdate = true; wt.wrapS = wt.wrapT = THREE.RepeatWrapping; wt.repeat.set(5, 3.5);
    const tbl = new THREE.Mesh(new THREE.PlaneGeometry(600, 400), new THREE.MeshStandardMaterial({ map: wt, roughness: 0.7, bumpMap: wt, bumpScale: 0.3, envMapIntensity: 0.15 })); tbl.rotation.x = -Math.PI / 2; tbl.receiveShadow = true; S.add(tbl);
    const C = cam(32), fade = fader(S, C);
    return { S, C, fade, key };
  }
  // straight glass pipe along x with a water column [a, b] and bubbles
  function glassPipe(S, x0, x1, y, z, r, nb) {
    const g = new THREE.Mesh(new THREE.CylinderGeometry(r, r, x1 - x0, 48, 1, true), glassM()); g.rotation.z = Math.PI / 2; g.position.set((x0 + x1) / 2, y, z); g.renderOrder = 2; S.add(g);
    const rimM = new THREE.MeshPhysicalMaterial({ color: 0xdfe8ee, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.45, envMapIntensity: 2 });
    [x0, x1].forEach((x) => { const rg = new THREE.Mesh(new THREE.TorusGeometry(r, r * 0.07, 10, 48), rimM); rg.rotation.y = Math.PI / 2; rg.position.set(x, y, z); S.add(rg); });
    const w = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.9, r * 0.9, 1, 40), waterM()); w.rotation.z = Math.PI / 2; S.add(w);
    const bm = new THREE.MeshPhysicalMaterial({ color: 0xf2f6f8, roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.55, envMapIntensity: 2.4, depthWrite: false });
    const r0 = rnd(Math.round(Math.abs(x0) * 7 + 991)), bubs = [];
    for (let i = 0; i < (nb || 0); i++) { const b = new THREE.Mesh(SPH, bm); b.scale.setScalar(r * (0.06 + r0() * 0.1)); b.userData.u = r0(); b.userData.dy = (r0() * 0.5 + 0.35) * r; b.userData.dz = (r0() - 0.5) * r * 0.8; S.add(b); bubs.push(b); }
    const L0 = x1 - x0;
    // a, b: water from x = a to b; s: bubble travel along +x
    return (a, b, s) => {
      w.visible = b - a > 0.05; w.scale.set(1, Math.max(0.001, b - a), 1); w.position.set((a + b) / 2, y - r * 0.02, z);
      bubs.forEach((bb) => { const u = ((bb.userData.u * L0 + s) % L0 + L0) % L0, x = x0 + u; bb.visible = x > a + 0.5 && x < b - 0.5; bb.position.set(x, y + bb.userData.dy * 0.6, z + bb.userData.dz); });
    };
  }
  // material colours toward grey (the picture "freezes")
  function desat(S) {
    const list = []; S.traverse((m) => { if (m.isMesh && m.material && m.material.color) list.push([m.material, m.material.color.clone()]); });
    const c = new THREE.Color();
    return (k) => list.forEach(([mt, orig]) => { const l = orig.r * 0.3 + orig.g * 0.59 + orig.b * 0.11; mt.color.copy(orig).lerp(c.setRGB(l, l, l), k); });
  }
  const PIPE = {};
  PIPE.drain = (o) => {
    const B = pipeStage(), S = B.S;
    const X0 = -70, X1 = 90, Y = 6, R = 2.2;
    const pipe = glassPipe(S, X0, X1, Y, 0, R, 30);
    // the red wire it starts as (same size, fades out)
    const redM = new THREE.MeshPhysicalMaterial({ color: 0x9c2119, roughness: 0.42, clearcoat: 0.3, transparent: true, opacity: 1, envMapIntensity: 0.5 });
    const wire = new THREE.Mesh(new THREE.CylinderGeometry(R, R, X1 - X0, 48), redM); wire.rotation.z = Math.PI / 2; wire.position.set((X0 + X1) / 2, Y, 0); wire.castShadow = true; S.add(wire);
    const woodM = new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.7 });
    [-50, 10, 70].forEach((x) => { const c = new THREE.Mesh(new THREE.BoxGeometry(3, Y - R * 0.6, 7), woodM); c.position.set(x, (Y - R * 0.6) / 2, 0); c.castShadow = c.receiveShadow = true; S.add(c); });
    // the near end pours into a beaker; the far end runs to a power-plant model
    const beaker = new THREE.Mesh(new THREE.CylinderGeometry(4.2, 4.2, 9, 48, 1, true), glassM()); beaker.position.set(X0 - 3, 4.5, 0); beaker.renderOrder = 2; S.add(beaker);
    const bw = new THREE.Mesh(new THREE.CylinderGeometry(3.95, 3.95, 1, 40), waterM()); S.add(bw);
    const stream = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.5, 1, 16), waterM()); S.add(stream);
    const plant = plantModel(1.1); plant.position.set(X1 + 16, 0, -4); S.add(plant);
    return (t, d) => {
      const ft = o.T0 + t;
      const morph = seg(ft, 19.2, 20.8);
      redM.opacity = 1 - morph; wire.visible = morph < 0.999; redM.depthWrite = morph < 0.5;
      let a = X0, b = X1, s = 0, out = 0;
      if (ft < 24.7) {                       // idea 1: it drains out of the near end
        b = lerp(X1, X0, seg(ft, 22.0, 24.4)); out = ft > 22.0 && ft < 24.5 ? 1 : 0;
        s = -60 * seg(ft, 22.0, 24.4);
      } else if (ft < 27.2) {                // idea 2: it rushes back to the power plant
        a = lerp(X0, X1, seg(ft, 24.95, 26.9)); s = 140 * (ft - 24.8);
      } else {                               // idea 3: the flow simply stops
        const q = clamp(ft - 27.4, 0, 1);
        s = 40 * Math.min(ft - 27.2, 0.2) + 40 * (q - q * q / 2);
      }
      if (morph > 0.02) pipe(a, b, s); else pipe(0, 0, 0);
      const lvl = ft < 24.7 ? 0.6 + 6.5 * seg(ft, 22.2, 24.6) : 0.6;
      bw.scale.set(1, lvl, 1); bw.position.set(X0 - 3, 0.05 + lvl / 2, 0);
      stream.visible = out > 0 && morph > 0.5; stream.scale.set(1, Math.max(0.1, Y - lvl - 0.2), 1); stream.position.set(X0 - 1.8, (Y + lvl) / 2, 0);
      // each idea has its own framing; short dips between them
      const C = B.C;
      if (ft < 24.7) aim(C, new V3(lerp(-30, -52, seg(ft, 18.66, 24.6)), 4, 0), lerp(70, 52, seg(ft, 18.66, 24.6)), lerp(30, 38, seg(ft, 18.66, 24.6)), 16, -160, 110);
      else if (ft < 27.2) aim(C, new V3(lerp(0, 40, seg(ft, 24.8, 27.2)), 6, 0), lerp(120, 105, seg(ft, 24.8, 27.2)), lerp(-58, -50, seg(ft, 24.8, 27.2)), 12, -120, 120);
      else aim(C, new V3(10, 5, 0), lerp(95, 120, seg(ft, 27.2, 30)), lerp(22, 30, seg(ft, 27.2, 30)), lerp(18, 24, seg(ft, 27.2, 30)), -120, 140);
      B.fade(Math.max(win(ft, 24.5, 24.95, 0.2), win(ft, 27.05, 27.4, 0.15)));
      return [S, C, []];
    };
  };
  PIPE.myth = (o) => {
    const B = pipeStage(), S = B.S;
    const XP = -55, XH = 50, Y = 9, R = 1.6;
    const plant = plantModel(1.4); plant.position.set(XP - 14, 0, -6); S.add(plant);
    // pump: red housing with a spinning brass impeller behind a glass face
    const pumpM = new THREE.MeshStandardMaterial({ color: 0x8e2a22, roughness: 0.45, metalness: 0.2 });
    const pump = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.4, 2.4, 40), pumpM); pump.rotation.x = Math.PI / 2; pump.position.set(XP, Y - 1.5, 0); pump.castShadow = true; S.add(pump);
    const pumpFace = new THREE.Mesh(new THREE.CircleGeometry(2.8, 40), glassM()); pumpFace.position.set(XP, Y - 1.5, 1.25); S.add(pumpFace);
    const imp = new THREE.Group(); imp.position.set(XP, Y - 1.5, 1.0); S.add(imp);
    const brassM = new THREE.MeshStandardMaterial({ color: 0xc9a865, metalness: 0.8, roughness: 0.3 });
    for (let i = 0; i < 6; i++) { const v = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.35, 0.3), brassM); v.rotation.z = i * Math.PI / 3; v.position.set(Math.cos(i * Math.PI / 3) * 1.2, Math.sin(i * Math.PI / 3) * 1.2, 0); imp.add(v); }
    const pumpBase = new THREE.Mesh(new THREE.BoxGeometry(8, Y - 4.9, 5), new THREE.MeshStandardMaterial({ color: 0x3a3c40, roughness: 0.6 })); pumpBase.position.set(XP, (Y - 4.9) / 2, 0); pumpBase.castShadow = true; S.add(pumpBase);
    const pipe = glassPipe(S, XP + 3, XH, Y, 0, R, 26);
    // model house with a bulb-shaped glass tank on top, and a brass tap before it (the "switch")
    const house = new THREE.Group(); house.position.set(XH + 9, 0, 0); S.add(house);
    const walls = new THREE.Mesh(new THREE.BoxGeometry(14, 11, 12), new THREE.MeshStandardMaterial({ color: 0xd9cfbb, roughness: 0.8 })); walls.position.y = 5.5;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(11, 6, 4), new THREE.MeshStandardMaterial({ color: 0x9a4a32, roughness: 0.75 })); roof.position.y = 14; roof.rotation.y = Math.PI / 4;
    [walls, roof].forEach((m) => { m.castShadow = m.receiveShadow = true; house.add(m); });
    const drop = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 10, 32, 1, true), glassM()); drop.position.set(XH, Y + 5, 0); S.add(drop);
    const bulbG = new THREE.LatheGeometry([[0, 0], [1.4, 0.2], [1.6, 2.2], [4.2, 5.5], [4.8, 8.4], [4.0, 11.2], [2.2, 12.6], [0, 12.9]].map((q) => new THREE.Vector2(q[0], q[1])), 48);
    const bulbGM = glassM(); bulbGM.emissive = new THREE.Color(0xffc680); bulbGM.emissiveIntensity = 0;
    const bulbT = new THREE.Mesh(bulbG, bulbGM); bulbT.position.set(XH, Y + 10, 0); S.add(bulbT);
    const bulbW = new THREE.Mesh(new THREE.SphereGeometry(4.3, 40, 24), waterM()); S.add(bulbW);
    const warm = new THREE.PointLight(0xffc680, 0, 0, 2); warm.position.set(XH, Y + 18, 4); S.add(warm);
    const tapX = XH - 14, tap = new THREE.Group(); tap.position.set(tapX, Y + R, 0); S.add(tap);
    const tbody = new THREE.Mesh(new THREE.CylinderGeometry(R * 1.25, R * 1.25, 3.2, 32), brassM); tbody.rotation.z = Math.PI / 2; tbody.position.set(tapX, Y, 0); S.add(tbody);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.2, 16), brassM); stem.position.y = 1.0; tap.add(stem);
    const handle = new THREE.Mesh(new THREE.BoxGeometry(5, 0.5, 0.9), new THREE.MeshStandardMaterial({ color: 0x8e2a22, roughness: 0.5 })); handle.position.y = 2.1; tap.add(handle);
    [-30, 0, 25].forEach((x) => { const c = new THREE.Mesh(new THREE.BoxGeometry(2, Y - R, 5), new THREE.MeshStandardMaterial({ color: 0x6a4a30, roughness: 0.7 })); c.position.set(x, (Y - R) / 2, 0); c.castShadow = true; S.add(c); });
    const ds = desat(S);
    return (t, d) => {
      const ftR = o.T0 + t, ft = Math.min(ftR, 70.0);          // 70.0: the picture freezes
      imp.rotation.z = -(8 * Math.max(0, ft - 60.8) - 4.8 * Math.max(0, ft - 67.5)) * seg(ft, 60.8, 61.8);
      const front = lerp(XP + 3, XH, seg(ft, 61.0, 63.6));                 // water reaches the house
      const speed = 18 + 40 * seg(ft, 64.1, 64.8);
      const sT = ft < 61 ? 0 : (ft < 67.5 ? speed * (ft - 61) : speed * 6.5 + speed * 0.4 * Math.min(1, ft - 67.5));
      pipe(XP + 3, front, sT);
      // the bulb tank fills, then "uses it up": its level falls while it glows
      const fill = seg(ft, 63.7, 65.6) * (1 - 0.55 * seg(ft, 65.8, 67.9));
      bulbW.visible = fill > 0.02; bulbW.scale.set(1, Math.max(0.02, fill), 1); bulbW.position.set(XH, Y + 10 + 4.3 * fill + 1.2, 0);
      const gl = seg(ft, 65.8, 66.6) * (1 - seg(ft, 67.6, 68.4)); warm.intensity = 2600 * gl; bulbGM.emissiveIntensity = 3.5 * gl; bulbGM.opacity = 0.07 + 0.18 * gl;
      tap.rotation.y = lerp(0, Math.PI / 2, seg(ft, 67.5, 68.2));
      ds(0.65 * seg(ftR, 70.0, 70.4));
      aim(B.C, new V3(lerp(-2, 4, seg(ft, 57.24, 70)), 9, 0), lerp(168, 150, seg(ft, 57.24, 70)), lerp(12, 24, seg(ft, 57.24, 70)), lerp(19, 14, seg(ft, 57.24, 70)), -lerp(50, 0, seg(ft, 57.24, 62)), 70);
      B.fade(0);
      return [S, B.C, []];
    };
  };
  LABK.pipe = ((o) => (PIPE[o.mode] || PIPE.myth)(o));

  // ================================================================= MARBLES: a clear acrylic tube packed with glass marbles (units: cm)
  LABK.marbles = ((o) => {
    const B = pipeStage(), S = B.S;
    const N = 22, r = 0.8, RI = 0.86, RO = 1.0, X0 = -17.6, X1 = X0 + 2 * r * N, YC = RO;   // tube lies on the table
    const YM = YC - RI + r;                                                                  // marble centre height inside the tube
    // acrylic tube
    const acr = new THREE.MeshPhysicalMaterial({ color: 0xeef3f6, roughness: 0.03, clearcoat: 1, clearcoatRoughness: 0.03, transparent: true, opacity: 0.1, depthWrite: false, envMapIntensity: 1.8, side: THREE.DoubleSide });
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(RO, RO, X1 - X0, 64, 1, true), acr); tube.rotation.z = Math.PI / 2; tube.position.set((X0 + X1) / 2, YC, 0); tube.renderOrder = 3; S.add(tube);
    const rimM = new THREE.MeshPhysicalMaterial({ color: 0xe6eef2, roughness: 0.08, clearcoat: 1, transparent: true, opacity: 0.4, envMapIntensity: 2 });
    [X0, X1].forEach((x) => { const rg = new THREE.Mesh(new THREE.RingGeometry(RI, RO, 64), rimM); rg.rotation.y = Math.PI / 2; rg.position.set(x, YC, 0); S.add(rg); });
    // wooden track in front of the mouth, brass push rod
    const woodM = new THREE.MeshStandardMaterial({ color: 0x7a5636, roughness: 0.6 });
    const track = new THREE.Mesh(new THREE.BoxGeometry(12, YM - r, 2.2), woodM); track.position.set(X0 - 6, (YM - r) / 2, 0); track.castShadow = track.receiveShadow = true; S.add(track);
    const brass = new THREE.MeshStandardMaterial({ color: 0xc9a865, metalness: 0.85, roughness: 0.28, envMapIntensity: 1.2 });
    const rod = new THREE.Group(); S.add(rod);
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 16, 24), brass); shaft.rotation.z = Math.PI / 2; shaft.position.x = -8 - 0.15; shaft.castShadow = true;
    const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.3, 32), brass); tip.rotation.z = Math.PI / 2; tip.castShadow = true;
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.7, 24, 16), new THREE.MeshStandardMaterial({ color: 0x3a2a1c, roughness: 0.5 })); knob.position.x = -16.3;
    rod.add(shaft, tip, knob);
    // marbles: tinted glass shell + twisted coloured vanes (cat's eye)
    const vaneG = new THREE.PlaneGeometry(1.7 * r, 0.7 * r, 16, 3); { const p = vaneG.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i) * (1 - 0.55 * Math.pow(Math.abs(x) / (0.85 * r), 2)), a = x / (1.7 * r) * 2.8; p.setXYZ(i, x, y * Math.cos(a), y * Math.sin(a)); } vaneG.computeVertexNormals(); }
    const tints = [0xf4f8fa, 0xdcefe2, 0xdbe6f6, 0xf6ead6, 0xeef4f6, 0xe2f0e6], vcols = [0xc8402a, 0x2a64b8, 0xe0a020, 0x2f9a58, 0xf0ece0, 0x9a3a8a, 0x1f8a9a];
    const rr = rnd(222), marbles = [];
    for (let i = 0; i < N + 2; i++) {
      const g = new THREE.Group(), tint = tints[(rr() * tints.length) | 0], vc = vcols[(rr() * vcols.length) | 0];
      const shell = new THREE.Mesh(SPH, new THREE.MeshPhysicalMaterial({ color: tint, roughness: 0.0, metalness: 0, transmission: 1, thickness: 1.2, ior: 1.5, clearcoat: 1, clearcoatRoughness: 0.0, envMapIntensity: 1.6 }));
      shell.scale.setScalar(r); shell.castShadow = true; shell.renderOrder = 2; g.add(shell);
      const core = new THREE.Group(); core.rotation.set(rr() * TAU, rr() * TAU, rr() * TAU); g.add(core);
      const vm = new THREE.MeshStandardMaterial({ color: vc, roughness: 0.3, side: THREE.DoubleSide, emissive: vc, emissiveIntensity: 0.16 });
      for (let k = 0; k < 3; k++) { const v = new THREE.Mesh(vaneG, vm); v.rotation.x = k * TAU / 3; core.add(v); }
      S.add(g); marbles.push({ g });
    }
    // warm light that comes up on the left end at "voltage"
    const push = new THREE.SpotLight(0xffd29a, 0, 0, 0.35, 1, 2); push.position.set(X0 - 14, 26, 18); push.target.position.set(X0 - 3, 0, 0); S.add(push, push.target);
    // shift of the whole row in marble diameters: first shove (midpoint at 217.32 = pop), gentle second shove from 221
    const shiftAt = (ft) => KF([[215.4, 0], [217.32, 0.5], [217.95, 1.0], [220.9, 1.0], [221.9, 1.5], [222.5, 2.0]], ft);
    const popT = [217.32, 221.9];
    const place = (m, x, y, z, roll) => { m.g.position.set(x, y, z); m.g.rotation.set(0, 0, -roll); };
    return (t, d) => {
      const ft = o.T0 + t;
      const s = shiftAt(ft);
      // order along x: loose L2, L1 (on the track), then M0 .. M(N-1) in the tube
      for (let j = 0; j < N + 2; j++) {
        const m = marbles[j];
        let x = X0 + r + 2 * r * (j - 2) + 2 * r * s, y = YM, z = 0, roll = 2 * s;
        const k = N + 1 - j;                                       // 0 = last marble, 1 = second to last
        if (k <= 1 && ft > popT[k]) {                              // popped: drops off the lip and rolls away, slowing down
          const te = ft - popT[k], v0 = k ? 6 : 10, a = 5.5, tt = Math.min(te, v0 / a), dist = v0 * tt - 0.5 * a * tt * tt;
          x = X1 + 0.05 + dist; y = lerp(YM, r, smooth(te / 0.18)); z = dist * 0.22 * (k ? -1 : 1); roll = 2 * (0.5 + k) + dist / r;
        }
        place(m, x, y, z, roll);
      }
      // rod: approaches the loose marbles (214.5 -> 215.4), pushes with them, eases back a little between shoves
      const lead = X0 + r + 2 * r * (-2) + 2 * r * s - r;          // left edge of the last loose marble
      const back = 3.2 * (1 - seg(ft, 214.5, 215.4)) + 1.2 * win(ft, 218.4, 220.9, 0.8);
      rod.position.set(lead - 0.15 - back, YM, 0);
      push.intensity = 3200 * seg(ft, 204.7, 206.2);
      // camera: slow move along the tube, wide for the shove so both ends are in frame, then to the far end
      const cx = cr([[200.06, 12], [205.9, 2], [210.4, -8], [214.3, -2], [217.0, 4], [219.5, 16], [224.56, 19]], ft);
      const dist = cr([[200.06, 11], [205.9, 15], [210.4, 17], [214.3, 44], [217.0, 44], [219.5, 26], [224.56, 23]], ft);
      const az = cr([[200.06, 24], [205.9, 32], [210.4, 40], [214.3, 22], [217.0, 20], [219.5, 30], [224.56, 38]], ft);
      const el = cr([[200.06, 8], [210.4, 9], [214.3, 18], [224.56, 14]], ft);
      aim(B.C, new V3(cx, YC, 0), dist, az, el, -lerp(0, 220, seg(ft, 219.4, 220.9)), lerp(0, 150, seg(ft, 219.4, 220.9)) - 300 * win(ft, 205.4, 210.9, 1.0));
      B.fade(0);
      return [S, B.C, []];
    };
  });

  LABK.wire = ((o) => (WIRE[o.mode] || WIRE.inside)(o));
})();
