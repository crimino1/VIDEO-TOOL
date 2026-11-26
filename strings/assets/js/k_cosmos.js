/* Group B kinds (gravity, cosmos, rule books): books, trampoline, orbitgps, jitter, blackhole, graviton, scale.
   Every frame is a pure function of t. Heavy textures are cached at module level and shared between shots. */
(function () {
  const { THREE, M, P, W, H, seg, smooth, lerp, clamp, rnd, KF, tex, stage, cam, orbit, canvasTex, glowSprite, liveTube } = L3;
  const TAU = Math.PI * 2;
  const once = (f) => { let v; return () => v || (v = f()); };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // camera on an orbit; sx/sy shift the subject right/up by a fraction of the frame (keeps lower-left free for text)
  function aim(C, tx, ty, tz, dist, az, el, sx, sy) {
    orbit(C, tx, ty, tz, dist, az, el);
    C.setViewOffset(W, H, -(sx || 0) * W, (sy || 0) * H, W, H);
  }
  const fadeIO = (ft, a, b, f) => seg(ft, a, a + (f || 0.5)) * (1 - seg(ft, b - (f || 0.5), b));

  // ---------- shared pieces ----------
  // fabric/space-time grid: colour map + line-only emissive map
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
  function sheet(size, segs, mat) {
    const g = new THREE.PlaneGeometry(size, size, segs, segs); g.rotateX(-Math.PI / 2);
    const m = new THREE.Mesh(g, mat), base = g.attributes.position.array.slice();
    m.userData.set = (fn) => { const p = g.attributes.position.array; for (let i = 0; i < p.length; i += 3) p[i + 1] = fn(base[i], base[i + 2]); g.attributes.position.needsUpdate = true; g.computeVertexNormals(); };
    return m;
  }
  const dotTex = once(() => canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  // electron probability cloud (1s-like radial density), deterministic
  function cloudPos(r, a) { const rad = -a * Math.log((r() + 1e-6) * (r() + 1e-6) * (r() + 1e-6)) / 2, u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u); return [rad * s * Math.cos(th), rad * u, rad * s * Math.sin(th)]; }
  function cloud(seed, n, a, op) {
    const r = rnd(seed), p = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) p.set(cloudPos(r, a), i * 3);
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ color: P.electron, size: 1.7, sizeAttenuation: false, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
  }
  function nucleus(seed, n, rad, rs) {
    const G = new THREE.Group(), r = rnd(seed), gs = new THREE.SphereGeometry(rs, 24, 16);
    const mp = new THREE.MeshPhysicalMaterial({ color: P.proton, roughness: 0.5, sheen: 0.3, sheenColor: 0xd8a898, transparent: true }), mn = new THREE.MeshPhysicalMaterial({ color: P.neutron, roughness: 0.5, sheen: 0.3, sheenColor: 0xc8ccd2, transparent: true });
    for (let i = 0; i < n; i++) { const d = V(r() * 2 - 1, r() * 2 - 1, r() * 2 - 1).normalize().multiplyScalar(rad * Math.cbrt(r())); const m = new THREE.Mesh(gs, i % 2 ? mn : mp); m.position.copy(d); G.add(m); }
    G.userData.mats = [mp, mn];
    return G;
  }
  // closed luminous string loop; st = {amp, w, ph} read every frame
  function loop(R, rad, st, q, c) {
    const v = new THREE.Vector3();
    const fn = (u) => {
      const th = u * TAU, a = st.amp, w = st.w;
      const rr = R * (1 + a * 0.16 * Math.sin(3 * th + st.ph) * Math.cos(w) + a * 0.07 * Math.sin(5 * th - st.ph) * Math.sin(1.3 * w));
      v.set(rr * Math.cos(th), R * a * 0.13 * Math.sin(2 * th + st.ph) * Math.cos(0.8 * w), rr * Math.sin(th));
      if (q) v.applyQuaternion(q);
      return c ? v.add(c) : v;
    };
    return liveTube(fn, 128, rad, M.light(P.string, 0.95), true);
  }
  const quat = (x, y, z) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));

  // ======================================================================= BOOKS
  const bookTex = (() => {
    const cache = {};
    return (key, cloth, lines, seed) => {
      if (cache[key]) return cache[key];
      const Wc = 768, Hc = 1024, r = rnd(seed), wear = [];
      for (let i = 0; i < 260; i++) wear.push([r() * Wc, r() * Hc, 1 + r() * 3.5]);
      const lay = (g, bg, ink) => {
        g.fillStyle = bg; g.fillRect(0, 0, Wc, Hc);
        g.strokeStyle = ink; g.lineWidth = 6; g.strokeRect(48, 48, Wc - 96, Hc - 96); g.lineWidth = 2; g.strokeRect(66, 66, Wc - 132, Hc - 132);
        g.fillStyle = ink; g.textAlign = "center"; g.textBaseline = "middle"; g.font = "700 72px Georgia, 'Times New Roman', serif"; g.letterSpacing = "7px";
        lines.forEach((s, i) => g.fillText(s, Wc / 2 + 3, 330 + i * 100));
        g.fillRect(Wc / 2 - 130, 330 + lines.length * 100 - 10, 260, 3);
        g.save(); g.translate(Wc / 2, 330 + lines.length * 100 - 9); g.rotate(Math.PI / 4); g.fillRect(-9, -9, 18, 18); g.restore();
        g.fillRect(Wc / 2 - 60, Hc - 170, 120, 2);
      };
      const map = canvasTex(Wc, Hc, (g) => {
        lay(g, cloth, "#c8a45e");
        const id = g.getImageData(0, 0, Wc, Hc), d = id.data;            // cloth weave + worn edges
        for (let y = 0; y < Hc; y++) for (let x = 0; x < Wc; x++) {
          const i = (y * Wc + x) * 4, e = Math.min(x, y, Wc - 1 - x, Hc - 1 - y), worn = Math.pow(Math.max(0, 1 - e / 20), 1.5) * (0.25 + 0.75 * r()) * (0.6 + 0.4 * Math.sin(x * 0.011 + 1.3) * Math.sin(y * 0.007 + 0.4));
          const n = (r() - 0.5) * 16 + ((x + y) % 4 < 2 ? 4 : -4);
          for (let k = 0; k < 3; k++) d[i + k] = clamp(d[i + k] + n + worn * (140 - d[i + k]) * 0.4, 0, 255);
        }
        g.putImageData(id, 0, 0);
        g.fillStyle = cloth; wear.forEach(([x, y, s]) => { g.globalAlpha = 0.8; g.fillRect(x, y, s, s * 0.6); }); g.globalAlpha = 1;
      });
      const rm = canvasTex(Wc, Hc, (g) => { lay(g, "rgb(0,235,0)", "rgb(0,80,255)"); g.fillStyle = "rgb(0,235,0)"; wear.forEach(([x, y, s]) => g.fillRect(x, y, s, s * 0.6)); });
      const bump = canvasTex(Wc, Hc, (g) => { lay(g, "#fff", "#000"); });
      const spine = canvasTex(1024, 160, (g, w, h) => {
        g.fillStyle = cloth; g.fillRect(0, 0, w, h);
        const r2 = rnd(seed + 1); for (let i = 0; i < 3000; i++) { g.fillStyle = r2() < 0.5 ? "rgba(255,255,255,.05)" : "rgba(0,0,0,.12)"; g.fillRect(r2() * w, r2() * h, 2, 1); }
        g.fillStyle = "#c8a45e"; g.fillRect(40, 20, 4, h - 40); g.fillRect(52, 20, 2, h - 40); g.fillRect(w - 44, 20, 4, h - 40); g.fillRect(w - 54, 20, 2, h - 40);
        g.font = "700 46px Georgia, serif"; g.letterSpacing = "6px"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(lines.join(" "), w / 2, h / 2 + 2);
      });
      return (cache[key] = { map, rm, bump, spine });
    };
  })();
  const pageTex = once(() => canvasTex(512, 128, (g, w, h) => { g.fillStyle = "#e4d9bf"; g.fillRect(0, 0, w, h); const r = rnd(9); for (let y = 0; y < h; y++) { g.fillStyle = `rgba(90,70,40,${0.05 + r() * 0.12})`; g.fillRect(0, y, w, 1); y += r() < 0.5 ? 1 : 0; } const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(80,60,30,.25)"); gr.addColorStop(0.2, "rgba(0,0,0,0)"); gr.addColorStop(0.8, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(80,60,30,.25)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }));
  const woodTex = once(() => {
    const t = canvasTex(2048, 1024, (g, w, h) => {
      const r = rnd(41), pl = 6;
      for (let k = 0; k < pl; k++) {
        const y0 = k * h / pl, tone = 0.8 + 0.35 * r();
        g.fillStyle = `rgb(${58 * tone | 0},${38 * tone | 0},${25 * tone | 0})`; g.fillRect(0, y0, w, h / pl);
        for (let i = 0; i < 90; i++) {
          const y = y0 + r() * h / pl, ph = r() * 6, amp = 1 + r() * 5, fr = 0.001 + r() * 0.004;
          g.strokeStyle = r() < 0.7 ? `rgba(18,10,5,${0.06 + 0.12 * r()})` : `rgba(120,85,55,${0.06 + 0.1 * r()})`; g.lineWidth = 0.6 + r() * 2;
          g.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x * fr + ph) * amp; x ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke();
        }
        g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(0, y0, w, 3);
      }
    });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / 14, 1 / 8); t.offset.set(0.5, 0.5); t.anisotropy = 8; return t;
  });

  function makeBook(key, cloth, lines, seed) {
    const T = bookTex(key, cloth, lines, seed), Wb = 2.3, Lb = 3.1, Tb = 0.5, bt = 0.06;
    const clothM = new THREE.MeshStandardMaterial({ color: cloth, roughness: 0.92 });
    const coverM = new THREE.MeshStandardMaterial({ map: T.map, roughnessMap: T.rm, metalnessMap: T.rm, roughness: 1, metalness: 1, bumpMap: T.bump, bumpScale: 1.2 });
    const spineM = new THREE.MeshStandardMaterial({ map: T.spine, roughness: 0.85 });
    const pageM = new THREE.MeshStandardMaterial({ map: pageTex(), roughness: 0.95 }), paperM = new THREE.MeshStandardMaterial({ color: 0xe4d9bf, roughness: 0.95 });
    const G = new THREE.Group(), sh = (m) => { m.castShadow = m.receiveShadow = true; return m; };
    const back = sh(new THREE.Mesh(new THREE.BoxGeometry(Wb, bt, Lb), clothM)); back.position.y = bt / 2; G.add(back);
    const pages = sh(new THREE.Mesh(new THREE.BoxGeometry(Wb - 0.1, Tb - 2 * bt, Lb - 0.12), [pageM, paperM, paperM, paperM, pageM, pageM])); pages.position.set(-0.02, Tb / 2, 0); G.add(pages);
    const spine = sh(new THREE.Mesh(new THREE.BoxGeometry(bt, Tb, Lb), [clothM, spineM, clothM, clothM, clothM, clothM])); spine.position.set(-Wb / 2 + bt / 2, Tb / 2, 0); G.add(spine);
    const hinge = new THREE.Group(); hinge.position.set(-Wb / 2, Tb - bt / 2, 0); G.add(hinge);
    const front = sh(new THREE.Mesh(new THREE.BoxGeometry(Wb, bt, Lb), [clothM, clothM, coverM, clothM, clothM, clothM])); front.position.x = Wb / 2; hinge.add(front);
    G.userData.hinge = hinge;
    return G;
  }
  function tableHalves(seed) {
    const r = rnd(seed), seam = [];
    for (let z = -4; z <= 4.001; z += 0.2) seam.push([(r() - 0.5) * 0.12 + Math.sin(z * 1.7) * 0.06, z]);
    const mk = (side) => {
      const s = new THREE.Shape(); s.moveTo(7 * side, -4); s.lineTo(7 * side, 4);
      for (let i = seam.length - 1; i >= 0; i--) s.lineTo(seam[i][0], seam[i][1]);
      // shape winding differs per side; Extrude handles both
      const g = new THREE.ExtrudeGeometry(s, { depth: 0.28, bevelEnabled: false }); g.rotateX(Math.PI / 2);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ map: woodTex(), roughness: 0.55, metalness: 0, envMapIntensity: 0.6 })); m.receiveShadow = m.castShadow = true; return m;
    };
    return [mk(-1), mk(1)];
  }

  LABK.books = (o) => {
    const mode = o.mode || "intro";
    const S = stage("studio", { floorY: -3.2, key: 2.0, hemi: 0.3 });
    S.userData.key.position.set(-6, 11, 7);
    const [tl, tr] = tableHalves(17); S.add(tl, tr);
    const gr = makeBook("gr", "#22382c", ["GENERAL", "RELATIVITY"], 3), qm = makeBook("qm", "#5a1f1f", ["QUANTUM", "MECHANICS"], 4);
    S.add(gr, qm);
    const spot = new THREE.SpotLight(0xffe2bd, 0, 14, 0.26, 0.6, 0); spot.position.set(-2.0, 7.5, 2.2); spot.target = gr; S.add(spot);
    const C = cam(30);
    return (t, d) => {
      const ft = o.T0 + t;
      let gx = -1.45, qx = 1.45, open = 0, gap = 0;
      if (mode === "clash") { const s = seg(ft, 104.9, 106.5); gx -= 0.55 * s; qx += 0.55 * s; gap = 0.06 * seg(ft, 105.15, 106.7); }
      if (mode === "quantum") open = 0.5 * smooth((ft - 87.5) / 2.3);
      gr.position.set(gx - gap, 0, 0.05); gr.rotation.y = 0.07; qm.position.set(qx + gap, 0, -0.05); qm.rotation.y = -0.05;
      tl.position.x = -gap; tr.position.x = gap;
      qm.userData.hinge.rotation.z = open; gr.userData.hinge.rotation.z = 0;
      spot.intensity = mode === "intro" ? 5 * seg(ft, 63.4, 65.0) : 0;
      if (mode === "intro") {
        const s = seg(ft, 58.8, 62.6), u = (ft - 58.8) / 6.3;
        const p = V(lerp(-4.6, 0.3, s) + 0.5 * u, lerp(1.5, 3.9, s), lerp(4.0, 7.3, s));
        C.position.copy(p); C.lookAt(lerp(-2.0, 0.1, s) + 0.25 * u, 0.2, lerp(0.3, -0.2, s));
        C.setViewOffset(W, H, -0.04 * W * s, 0.07 * H * s, W, H);
      } else if (mode === "quantum") {
        aim(C, 1.45, 0.4, -0.25, lerp(5.9, 5.1, t / d), lerp(-12, -2, t / d), lerp(46, 40, t / d), 0, 0);
      } else {
        aim(C, 0, 0.2, 0, lerp(9.4, 8.5, smooth(t / d)), lerp(-6, 4, t / d), lerp(34, 38, t / d), 0, 0.03);
      }
      return [S, C, []];
    };
  };

  // ======================================================================= TRAMPOLINE
  const fabric = once(() => gridTex(28, "#1b1f26", "rgba(186,198,214,.5)", 2.5, true));
  LABK.trampoline = (o) => {
    const S = stage("void", { dust: 500, key: 2.4, hemi: 0.28 });
    const key = S.userData.key; key.position.set(-6, 14, 7); key.castShadow = true; key.shadow.mapSize.set(2048, 2048);
    Object.assign(key.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 50 }); key.shadow.bias = -0.0006; key.shadow.radius = 4;
    const F = fabric();
    const sh = sheet(14, 150, new THREE.MeshPhysicalMaterial({ map: F.map, emissiveMap: F.em, emissive: 0x1a212c, roughness: 0.9, sheen: 0.25, sheenColor: 0x4a5568, envMapIntensity: 0.4, side: THREE.DoubleSide }));
    sh.receiveShadow = true; S.add(sh);
    const steel = M.steel(), barG = new THREE.CylinderGeometry(0.09, 0.09, 14.2, 20);
    for (let i = 0; i < 4; i++) { const b = new THREE.Mesh(barG, steel), a = i * Math.PI / 2; b.rotation.set(0, a, Math.PI / 2); b.position.set(Math.sin(a) * 7.05, 0, Math.cos(a) * 7.05); S.add(b); }
    const legG = new THREE.CylinderGeometry(0.07, 0.07, 4, 16);
    for (const [x, z] of [[-7.05, -7.05], [7.05, -7.05], [-7.05, 7.05], [7.05, 7.05]]) { const l = new THREE.Mesh(legG, steel); l.position.set(x, -2, z); S.add(l); const k = new THREE.Mesh(new THREE.SphereGeometry(0.12, 16, 12), steel); k.position.set(x, 0, z); S.add(k); }
    // bowling ball
    const Rb = 0.85, swirl = canvasTex(1024, 512, (g, w, h) => { g.fillStyle = "#1a2846"; g.fillRect(0, 0, w, h); const r = rnd(12); for (let i = 0; i < 90; i++) { g.strokeStyle = `rgba(${60 + r() * 60 | 0},${90 + r() * 60 | 0},${150 + r() * 70 | 0},${0.08 + r() * 0.14})`; g.lineWidth = 2 + r() * 10; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += (r() - 0.5) * 300; y += (r() - 0.5) * 120; g.quadraticCurveTo(x + 60, y - 40, x, y); } g.stroke(); } });
    const ball = new THREE.Group();
    const bm = new THREE.Mesh(new THREE.SphereGeometry(Rb, 64, 48), new THREE.MeshPhysicalMaterial({ map: swirl, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.04, metalness: 0 })); bm.castShadow = true; ball.add(bm);
    const holeM = new THREE.MeshStandardMaterial({ color: 0x050608, roughness: 0.9 });
    for (const [a, b, s] of [[-0.28, 0.5, 0.11], [0.28, 0.5, 0.11], [0, 0.05, 0.13]]) { const h = new THREE.Mesh(new THREE.CircleGeometry(s, 24), holeM); const n = V(a, b + 0.35, 0.75).normalize(); h.position.copy(n.clone().multiplyScalar(Rb + 0.002)); h.lookAt(n.clone().multiplyScalar(3)); ball.add(h); }
    S.add(ball);
    const marble = new THREE.Mesh(new THREE.SphereGeometry(0.2, 32, 24), new THREE.MeshPhysicalMaterial({ color: 0xd9dee6, roughness: 0.08, clearcoat: 1, metalness: 0 })); marble.castShadow = true; S.add(marble);
    const C = cam(32);
    return (t, d) => {
      const ft = o.T0 + t, tf0 = 72.05, tc = 72.75;
      let D = 0, yb;
      if (ft < tc) { const s = clamp((ft - tf0) / (tc - tf0), 0, 1); yb = lerp(10, Rb, s * s); }
      else { D = 2.7 * KF([[0, 0], [0.6, 1.05], [1.2, 1]], ft - tc); yb = -D + Rb; }
      const h = (x, z) => {
        const r2 = x * x + z * z, e = smooth((7 - Math.abs(x)) / 2.2) * smooth((7 - Math.abs(z)) / 2.2);
        let y = -D * Math.pow(1 + r2 / 2.4, -1.5) * e;
        if (D > 0 && r2 < Rb * Rb) y = Math.min(y, yb - Math.sqrt(Rb * Rb - r2));
        return y;
      };
      sh.userData.set(h);
      ball.position.set(0, yb, 0); ball.visible = ft > 71.95; ball.rotation.set(0.25, -0.3 + 0.15 * clamp(ft - tf0, 0, 1), 0);
      marble.visible = ft > 76.2;
      let mx = 0, mz = 0;
      if (marble.visible) { const u = ft - 76.2, r = lerp(6.4, 2.7, smooth(u / 1.8)), a = 0.55 + 1.9 * u + 0.25 * u * u / (1 + u); mx = r * Math.cos(a); mz = r * Math.sin(a); marble.position.set(mx, h(mx, mz) + 0.22, mz); }
      aim(C, 0, -0.8, 0, lerp(18, 14.5, smooth(t / d)), lerp(-24, 8, t / d), lerp(35, 31, t / d), 0, 0);
      const pins = [["space-time", -4.2, h(-4.2, 3.2), 3.2, fadeIO(ft, 74.7, 77.7, 0.5)], ["gravity", 0, yb + Rb, 0, seg(ft, 77.6, 78.1)]];
      return [S, C, pins];
    };
  };

  // ======================================================================= ORBITS + GPS
  const bandTex = once(() => canvasTex(512, 256, (g, w, h) => { const r = rnd(21); const cols = ["#cdb490", "#a9835e", "#e0cfb0", "#8f6a4c", "#d8c1a0", "#b89670"]; for (let y = 0; y < h; y += 2) { const k = Math.floor((y / h) * 14 + Math.sin(y * 0.09) * 0.6); g.fillStyle = cols[Math.abs(k) % cols.length]; g.fillRect(0, y, w, 2); } for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(255,255,255,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 20 + r() * 60, 1); } }));
  const panelTex = once(() => canvasTex(256, 96, (g, w, h) => { g.fillStyle = "#161d2e"; g.fillRect(0, 0, w, h); g.strokeStyle = "#7c8696"; g.lineWidth = 1.5; for (let x = 0; x <= w; x += 16) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = 0; y <= h; y += 16) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }));
  function ringLine(r, op, n) { const pts = []; for (let i = 0; i < (n || 160); i++) { const a = i / (n || 160) * TAU; pts.push(V(r * Math.cos(a), 0, r * Math.sin(a))); } return new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), M.line(P.fieldLine, op)); }
  function satellite() {
    const G = new THREE.Group();
    G.add(new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.1, 0.14), new THREE.MeshStandardMaterial({ color: 0xc9a85a, metalness: 1, roughness: 0.45 })));
    const pm = new THREE.MeshStandardMaterial({ map: panelTex(), metalness: 0.6, roughness: 0.35 }), pg = new THREE.BoxGeometry(0.34, 0.006, 0.12), rod = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.6, 6), M.steel());
    rod.rotation.z = Math.PI / 2; G.add(rod);
    for (const s of [-1, 1]) { const p = new THREE.Mesh(pg, pm); p.position.x = s * 0.25; G.add(p); }
    return G;
  }
  LABK.orbitgps = (o) => {
    // A: the solar system
    const A = stage("space", { key: 0.001, hemi: 0.03, rim: 0.0001, seed: 4 });
    const sun = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 32), new THREE.MeshBasicMaterial({ map: tex("2k_sun.jpg"), color: 0xf4e2c8 })); A.add(sun, glowSprite(0xffe2b8, 7.5, 0.32));
    A.add(new THREE.PointLight(0xfff1e0, 3.2, 0, 0));
    const moonT = tex("2k_moon.jpg");
    const defs = [[3.0, 0.12, new THREE.MeshStandardMaterial({ map: moonT, color: 0xb8aa98, roughness: 1 })], [4.3, 0.22, M.matte(0xdcc9a0)], [5.8, 0.24, new THREE.MeshStandardMaterial({ map: tex("2k_earth_daymap.jpg"), roughness: 0.8 })],
      [7.4, 0.17, new THREE.MeshStandardMaterial({ map: moonT, color: 0xd08a64, roughness: 1 })], [10.4, 0.58, new THREE.MeshStandardMaterial({ map: bandTex(), roughness: 0.9 })]];
    const planets = defs.map(([r, s, m], i) => { const p = new THREE.Mesh(new THREE.SphereGeometry(s * 1.4, 48, 24), m); A.add(p, ringLine(r, 0.26, 200)); return { p, r, w: 0.9 * Math.pow(r / 3, -1.5), a0: i * 1.9 + 0.4 }; });
    // B: Earth and GPS satellites
    const B = stage("space", { key: 2.6, hemi: 0.05, rim: 0.25, seed: 9 });
    B.userData.key.position.set(10, 3, 3);
    const earth = new THREE.Mesh(new THREE.SphereGeometry(2, 96, 48), new THREE.MeshStandardMaterial({ map: tex("2k_earth_daymap.jpg"), roughness: 0.85, envMapIntensity: 0.04 }));
    const clouds = new THREE.Mesh(new THREE.SphereGeometry(2.025, 96, 48), new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: tex("2k_earth_clouds.jpg"), transparent: true, depthWrite: false, roughness: 1, envMapIntensity: 0.04 }));
    earth.rotation.z = 0.41; B.add(earth, clouds, glowSprite(0x8db8e8, 5.4, 0.22));
    const sats = [];
    for (let i = 0; i < 6; i++) {
      const pl = new THREE.Group(); pl.rotation.set(0, i * Math.PI / 3, 0.96); const rr = 3.5 + 0.08 * (i % 2);
      pl.add(ringLine(rr, 0.22, 200)); const s = satellite(); pl.add(s); B.add(pl);
      sats.push({ pl, s, rr, a0: i * 2.2 + (i % 2) * 0.8 });
    }
    const satPos = (k, ft) => { const q = sats[k], a = q.a0 + 0.42 * ft; q.s.position.set(q.rr * Math.cos(a), 0, q.rr * Math.sin(a)); q.pl.updateMatrixWorld(true); q.s.lookAt(0, 0, 0); return q.s.getWorldPosition(V()); };
    const C = cam(32), camB = (t) => aim(C, 0, 0, 0, lerp(13.2, 11.6, smooth((t - 3.18) / 4.4)), lerp(-30, -14, (t - 3.18) / 4.4), lerp(14, 10, (t - 3.18) / 4.4), 0, 0);
    // pin the satellite that sits best on the near side at the pin time
    camB(4.6); let best = 0, bd = -1e9; sats.forEach((q, k) => { const p = satPos(k, 84.1); const v = p.clone().project(C); const sc = p.dot(C.position) - 40 * (Math.abs(v.x) > 0.7 || Math.abs(v.y) > 0.7); if (sc > bd) { bd = sc; best = k; } });
    return (t, d) => {
      const ft = o.T0 + t;
      if (ft < 82.68) {
        planets.forEach((q) => { const a = q.a0 + q.w * (ft - 79) * 0.8; q.p.position.set(q.r * Math.cos(a), 0, -q.r * Math.sin(a)); q.p.rotation.y = ft * 0.3; });
        sun.rotation.y = ft * 0.02;
        aim(C, 0, 0, 0, lerp(31, 27, smooth(t / 3.18)), lerp(8, 20, t / 3.18), lerp(33, 27, t / 3.18), 0, 0);
        return [A, C, []];
      }
      earth.rotation.y = 2.2 + ft * 0.05; clouds.rotation.y = 2.2 + ft * 0.056;
      let bp; sats.forEach((q, k) => { const p = satPos(k, ft); if (k === best) bp = p; });
      camB(t);
      return [B, C, [["GPS satellites", bp.x, bp.y, bp.z, seg(ft, 83.7, 84.2)]]];
    };
  };

  // ======================================================================= JITTER (quantum uncertainty)
  LABK.jitter = (o) => {
    const el = o.mode === "electron";
    const S = stage("void", { dust: 400, key: 1.8, hemi: 0.3 });
    const a = 0.5, cl = cloud(31, el ? 18000 : 9000, a, el ? 0.5 : 0.55); S.add(cl);
    const haze = glowSprite(0xb9d3ee, 3.2, 0.08); S.add(haze);
    const nuc = nucleus(5, 10, 0.06, 0.042); nuc.visible = !el; S.add(nuc);
    const dot = new THREE.Group(); dot.add(new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 12), M.light(0xf6f9ff)), glowSprite(0xdfeaff, el ? 0.15 : 0.24, 0.8)); S.add(dot);
    const ghost = glowSprite(0xdfeaff, 0.18, 0.4); S.add(ghost);
    const C = cam(32), step = el ? 0.11 : 0.2;
    const posAt = (k) => { const r = rnd(k * 7919 + 17); r(); r(); return cloudPos(r, a); };
    return (t, d) => {
      const ft = o.T0 + t, k = Math.floor(ft / step), f = ft / step - k, p = posAt(k), q = posAt(k - 1);
      dot.position.set(p[0], p[1], p[2]); ghost.position.set(q[0], q[1], q[2]); ghost.material.opacity = 0.45 * (1 - smooth(f * 1.6));
      cl.rotation.y = ft * 0.03; nuc.rotation.y = ft * 0.15; nuc.rotation.x = ft * 0.07;
      if (el) aim(C, 0, 0, 0, lerp(3.6, 2.9, smooth(t / d)), lerp(30, 40, t / d), 12, 0.12, 0.03);
      else aim(C, 0, 0, 0, lerp(6.6, 5.0, smooth(t / d)), lerp(-10, 25, t / d), lerp(9, 16, t / d), 0.14 * (1 - seg(ft, 94.6, 96.5)), 0.03);
      const pins = el ? [] : [["uncertain", 0.85, 0.75, 0.2, seg(ft, 97.0, 97.5)]];
      return [S, C, pins];
    };
  };

  // ======================================================================= BLACK HOLE
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
  function blackHole() {
    const G = new THREE.Group();
    G.add(new THREE.Mesh(new THREE.SphereGeometry(1, 64, 32), new THREE.MeshBasicMaterial({ color: 0x000000 })));
    const add = { transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide };
    const dg = polarRing(1.3, 5.4, 256, 10); dg.rotateX(-Math.PI / 2); dg.setAttribute("color", new THREE.BufferAttribute(new Float32Array(dg.attributes.position.count * 3).fill(1), 3));
    const disk = new THREE.Mesh(dg, new THREE.MeshBasicMaterial(Object.assign({ map: diskTex(), vertexColors: true, opacity: 0.95 }, add)));
    const lg = polarRing(1.03, 1.75, 256, 8), lc = new Float32Array(lg.attributes.position.count * 3), lp = lg.attributes.position;
    for (let i = 0; i < lp.count; i++) { const s = lp.getY(i) / Math.hypot(lp.getX(i), lp.getY(i)), w = Math.pow(Math.abs(s), 1.6) * (s > 0 ? 1 : 0.4); lc.set([w, w, w], i * 3); }
    lg.setAttribute("color", new THREE.BufferAttribute(lc, 3));
    const lens = new THREE.Mesh(lg, new THREE.MeshBasicMaterial(Object.assign({ map: diskTex(), vertexColors: true, opacity: 0.7 }, add)));
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.0, 1.016, 256, 1), new THREE.MeshBasicMaterial(Object.assign({ color: 0xffe2c0, opacity: 0.6 }, add)));
    const halo = glowSprite(0xffc890, 3.6, 0.12);
    G.add(disk, lens, ring, halo);
    const bill = [lens, ring];
    // per frame: texture spin, billboards, Doppler-brighter approaching side, overall brightness k
    G.userData.tick = (ft, C, k) => {
      diskTex().offset.x = -ft * 0.025;
      const dc = C.position.length(), fs = dc / Math.sqrt(dc * dc - 1); bill.forEach((m) => { m.quaternion.copy(C.quaternion); m.scale.setScalar(fs); });
      const rx = new THREE.Vector3(1, 0, 0).applyQuaternion(C.quaternion), p = dg.attributes.position, c = dg.attributes.color;
      for (let i = 0; i < p.count; i++) { const x = p.getX(i), z = p.getZ(i), b = 0.72 + 0.42 * (x * rx.x + z * rx.z) / Math.hypot(x, z); c.setXYZ(i, b, b, b); }
      c.needsUpdate = true;
      disk.material.opacity = 0.85 * k; lens.material.opacity = 1.0 * k; ring.material.opacity = 0.6 * (0.2 + 0.8 * k); halo.material.opacity = 0.12 * k;
    };
    return G;
  }
  LABK.blackhole = (o) => {
    const mode = o.mode || "slow", C = cam(32);
    if (mode === "bang") {
      const S = stage("space", { seed: 12 }), N = 5000, r = rnd(91), K = 140, cen = [], base = new Float32Array(N * 3), heat = new Float32Array(N);
      for (let i = 0; i < K; i++) { const u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u), rr = Math.cbrt(r()); cen.push([rr * s * Math.cos(th), rr * u, rr * s * Math.sin(th)]); }
      for (let i = 0; i < N; i++) { const c = r() < 0.3 ? [0, 0, 0] : cen[(r() * K) | 0], sp = c[0] === 0 && c[1] === 0 ? 0.6 : 0.16, g = () => (r() + r() + r() - 1.5) * sp; base.set([c[0] + g(), c[1] + g(), c[2] + g()], i * 3); heat[i] = r(); }
      const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3)); geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
      const pts = new THREE.Points(geo, new THREE.PointsMaterial({ map: dotTex(), size: 0.6, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(pts);
      const flash = glowSprite(0xfff6e8, 1, 1); S.add(flash);
      return (t, d) => {
        const R = 0.08 + 4.4 * (1 - Math.exp(-1.5 * t)), cool = smooth(t / 2.4), dens = clamp((R / 3.6) * (R / 3.6), 0.12, 1), p = geo.attributes.position.array, c = geo.attributes.color.array;
        for (let i = 0; i < N; i++) {
          const x = base[i * 3], y = base[i * 3 + 1], z = base[i * 3 + 2], rr = Math.hypot(x, y, z), T = clamp(1 - cool * (0.55 + 0.6 * rr) + 0.15 * heat[i], 0, 1);
          p[i * 3] = x * R; p[i * 3 + 1] = y * R; p[i * 3 + 2] = z * R;
          const b = (0.05 + 0.14 * T) * dens; c[i * 3] = b * lerp(0.75, 1, T); c[i * 3 + 1] = b * lerp(0.32, 0.95, T * T); c[i * 3 + 2] = b * lerp(0.14, 0.88, T * T * T);
        }
        geo.attributes.position.needsUpdate = geo.attributes.color.needsUpdate = true;
        flash.scale.setScalar(0.6 + 4 * smooth(t / 0.8)); flash.material.opacity = 0.75 * (1 - smooth(t / 0.9));
        pts.rotation.y = t * 0.08;
        aim(C, 0, 0, 0, lerp(14, 17, smooth(t / d)), lerp(10, 22, t / d), 10, 0.12, 0.04);
        return [S, C, []];
      };
    }
    const S = stage("space", { seed: 5, stars: 6000 }), bh = blackHole(); S.add(bh);
    let star = null, point = null, trail = null;
    const spiral = (s, j) => { const rr = 6.6 * Math.pow(1 - s, 1.25), an = 0.35 + 2.0 * smooth(s) + j; return [rr * Math.cos(an), 0.9 * (1 - s), rr * Math.sin(an) * 0.8]; };
    if (mode === "hole") {
      star = new THREE.Group(); const sm = new THREE.Mesh(new THREE.SphereGeometry(0.55, 48, 32), new THREE.MeshBasicMaterial({ map: tex("2k_sun.jpg"), color: 0xfff0dc })); star.add(sm, glowSprite(0xffe0b8, 2.6, 0.38)); S.add(star);
      const tg = new THREE.BufferGeometry(); tg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(600 * 3), 3));
      trail = new THREE.Points(tg, new THREE.PointsMaterial({ map: dotTex(), color: 0xf0a868, size: 0.09, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(trail);
      point = glowSprite(0xfff6ea, 0.5, 0); point.material.depthTest = false; point.renderOrder = 10; S.add(point);
    }
    return (t, d) => {
      const ft = o.T0 + t; let k = 1, pins = [];
      if (mode === "hole") {
        const s = clamp((ft - 119.36) / 3.3, 0, 1); star.position.fromArray(spiral(s, 0));
        const tp = trail.geometry.attributes.position.array, rj = rnd(5);
        for (let i = 0; i < 600; i++) { const f = i / 600, q = spiral(clamp(s + (1 - s) * f * Math.min(1, s * 4) + 0.01 * rj(), 0, 1), 0.05 * (rj() - 0.5) * (1 - f)); tp[i * 3] = q[0] + 0.1 * (rj() - 0.5); tp[i * 3 + 1] = q[1] + 0.06 * (rj() - 0.5); tp[i * 3 + 2] = q[2] + 0.1 * (rj() - 0.5); }
        trail.geometry.attributes.position.needsUpdate = true; trail.material.opacity = 0.55 * seg(ft, 119.5, 120.3) * (1 - seg(ft, 122.4, 123.4));
        star.lookAt(0, 0, 0); const sc = lerp(1, 0.02, Math.pow(s, 1.6)), st = 1 + 0.5 * Math.sin(Math.PI * Math.pow(s, 0.8));
        star.scale.set(sc / Math.sqrt(st), sc / Math.sqrt(st), sc * st); star.visible = s < 0.995;
        star.children[0].rotation.y = ft * 0.2;
        point.material.opacity = seg(ft, 121.8, 122.4) * (0.85 + 0.15 * Math.sin(ft * 5)); point.scale.setScalar(0.45);
        aim(C, 0, 0, 0, lerp(16, 12.5, smooth(t / 5)) - 3 * seg(ft, 122.8, 125.2), lerp(-16, 2, t / d), lerp(11, 8, t / d), 0, 0);
        const sp = star.position;
        pins = [["whole stars", sp.x, sp.y + 0.6 * sc, sp.z, fadeIO(ft, 119.7, 121.9, 0.4)], ["smaller than an atom", 0, 0, 0, seg(ft, 123.4, 123.9)]];
      } else if (mode === "infinity") {
        const s = smooth((ft - 127.74) / 4.6);
        aim(C, 0, 0, 0, lerp(17, 4.6, s) - 0.5 * seg(ft, 132.3, 138), lerp(-10, 6, t / d), lerp(9, 4, s), 0, lerp(0, 0.06, s));
        k = 1 - 0.7 * seg(ft, 131.4, 132.6);
      } else {
        aim(C, 0, 0, 0, lerp(12.5, 11.2, smooth(t / d)), lerp(18, 50, t / d), lerp(20, 13, t / d), 0.07, 0.05);
      }
      bh.userData.tick(ft, C, k);
      return [S, C, pins];
    };
  };

  // ======================================================================= GRAVITON (string sends ripples through space-time)
  const spaceGrid = once(() => gridTex(48, "#13161c", "rgba(141,184,232,.5)", 1.6, false));
  LABK.graviton = (o) => {
    const ins = o.mode === "insist";
    const S = stage("void", { dust: 600, key: 1.7, hemi: 0.22, rim: 1.1 });
    const G = spaceGrid(), SZ = 36;
    const sh = sheet(SZ, ins ? 240 : 210, new THREE.MeshStandardMaterial({ map: G.map, emissiveMap: G.em, emissive: 0x5e7fa6, emissiveIntensity: 0.32, roughness: 0.85, metalness: 0, side: THREE.DoubleSide }));
    S.add(sh);
    const k = TAU / (ins ? 3.4 : 2.4), w = TAU * (ins ? 0.7 : 0.9), c = w / k, A0 = ins ? 0.14 : 0.27;
    const src = ins
      ? [[-1, 1.5], [-7, -5], [6, -6], [-10, 3], [8.5, 1], [1, -11], [-3, -1 - 8], [12, -8]].map(([x, z], i) => ({ x, z, t0: 316 + i * 0.9, y: 1.3 + 0.2 * (i % 3), R: 0.5, ph: i * 1.7 }))
      : [{ x: 0, z: 0, t0: 310.56, y: 1.45, R: 0.6, ph: 0 }];
    src.forEach((q, i) => {
      q.st = { amp: 0, w: 0, ph: q.ph }; q.c = V(q.x, q.y, q.z);
      S.add(loop(q.R, 0.035, q.st, quat(0.35 + 0.2 * (i % 2), i, 0.15), q.c));
      q.glow = glowSprite(0xfff1d6, 2.0, 0.14); S.add(q.glow);
    });
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.35, 40, 28), new THREE.MeshPhysicalMaterial({ color: 0xc9ccd2, roughness: 0.32, metalness: 0.2, sheen: 0.4 })); if (!ins) S.add(ball);
    const C = cam(32);
    return (t, d) => {
      const ft = o.T0 + t;
      const lift = ins ? (ft < 330.4 ? seg(ft, 329.04, 330.2) : Math.exp(-3.4 * (ft - 330.4)) * Math.cos(7.5 * (ft - 330.4))) : 0;
      const boost = ins ? 1 + 0.8 * seg(ft, 331.0, 332.5) : 1;
      src.forEach((q, i) => {
        q.amp = (ins ? 1 : seg(ft, 310.4, 311.3)) * (i === 0 ? 1 - Math.max(0, lift) : 1) * boost;
        q.st.amp = 0.35 + 0.65 * (ins ? 1 : seg(ft, 310.4, 311.3)); if (!ins && ft < 310.4) q.st.amp = 0.12;
        q.st.w = (ins || ft > 310.4 ? w : 1.2) * ft * 0.9 + i;
        q.c.y = q.y + (i === 0 ? 2.6 * lift : 0) + 0.06 * Math.sin(ft * 0.9 + i);
        q.glow.position.copy(q.c);
      });
      const h = (x, z) => {
        let y = 0;
        for (const q of src) {
          const dx = x - q.x, dz = z - q.z, r = Math.sqrt(dx * dx + dz * dz), tau = ft - q.t0;
          if (tau <= 0 || q.amp <= 0) continue;
          const fr = smooth((c * tau - r) / 1.6); if (fr <= 0) continue;
          y += A0 * q.amp * Math.sin(k * r - w * tau) * fr / (1 + (ins ? 0.45 : 0.3) * r) * smooth((SZ / 2 - Math.max(Math.abs(x), Math.abs(z))) / 2);
        }
        if (lift) { const dx = x - src[0].x, dz = z - src[0].z; y += lift * 3.0 * Math.exp(-(dx * dx + dz * dz) / 3.2); }
        return y;
      };
      sh.userData.set(h);
      if (ins) {
        aim(C, 0, 0, -2, lerp(31, 26, smooth(t / d)), lerp(-14, 10, t / d), lerp(31, 27, t / d), 0.05, 0.05);
        return [S, C, []];
      }
      const bx = 6.4 - 0.35 * seg(ft, 313.6, 318), bz = 2.6 - 0.12 * seg(ft, 313.6, 318);
      ball.position.set(bx, h(bx, bz) + 0.35, bz);
      aim(C, 2.2, 0.5, 1.0, lerp(15, 11.8, smooth(t / d)), lerp(26, 8, t / d), lerp(25, 19, t / d), 0.07, 0.04);
      const q = src[0];
      return [S, C, [["graviton", q.c.x, q.c.y + 0.6, q.c.z, seg(ft, 310.6, 311.1) * (1 - seg(ft, 316.5, 317.2))]]];
    };
  };

  // ======================================================================= SCALE (atom -> universe, string -> tree)
  const galTex = once(() => canvasTex(128, 128, (g) => {
    g.translate(64, 64); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 60); gr.addColorStop(0, "rgba(255,248,236,1)"); gr.addColorStop(0.12, "rgba(255,240,220,.6)"); gr.addColorStop(0.5, "rgba(200,210,235,.14)"); gr.addColorStop(1, "rgba(200,210,235,0)");
    g.scale(1, 0.45); g.fillStyle = gr; g.beginPath(); g.arc(0, 0, 60, 0, TAU); g.fill();
  }));
  function galaxies(seed, n, R, avoid) {
    const G = new THREE.Group(), r = rnd(seed), mats = [];
    for (let i = 0; i < 6; i++) mats.push(new THREE.SpriteMaterial({ map: galTex(), color: [0xfff1dc, 0xdfe6f4, 0xf4e6d6][i % 3], rotation: i * 0.9, transparent: true, depthWrite: false, opacity: 0.6, blending: THREE.AdditiveBlending }));
    for (let i = 0; i < n; i++) {
      const u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u), rr = R * Math.cbrt(0.03 + 0.97 * r()), p = V(rr * s * Math.cos(th), rr * u, rr * s * Math.sin(th));
      if (avoid && Math.hypot(p.x, p.y) < avoid && p.z > 0) continue;
      const sp = new THREE.Sprite(mats[i % 6]); sp.position.copy(p); sp.scale.setScalar(R * (0.035 + 0.06 * r())); G.add(sp);
    }
    G.userData.mats = mats; return G;
  }
  function starPts(seed, n, R) {
    const r = rnd(seed), p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u), rr = R * Math.cbrt(r()); p.set([rr * s * Math.cos(th), rr * u, rr * s * Math.sin(th)], i * 3); const b = 0.3 + 0.7 * Math.pow(r(), 3); c.set([b, b * 0.97, b * 0.93], i * 3); }
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("color", new THREE.BufferAttribute(c, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size: 1.6, sizeAttenuation: false, vertexColors: true, transparent: true, depthWrite: false }));
  }
  function tree() {
    const G = new THREE.Group(), bark = M.matte(0x5b4433), leaf = new THREE.MeshStandardMaterial({ color: 0x55703f, roughness: 0.9, flatShading: false }), r = rnd(33);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.19, 1.7, 14), bark); trunk.position.y = 0.85; G.add(trunk);
    for (const [a, l] of [[0.7, 0.7], [-0.6, 0.6]]) { const b = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.07, l, 8), bark); b.position.set(Math.sin(a) * l * 0.35, 1.45, 0); b.rotation.z = -a; G.add(b); }
    for (const [x, y, z, s] of [[0, 2.35, 0, 0.72], [-0.5, 2.0, 0.15, 0.55], [0.52, 2.05, -0.1, 0.58], [0.1, 1.85, 0.45, 0.5], [-0.15, 1.95, -0.45, 0.5], [0.15, 2.65, 0.1, 0.45]]) {
      const g = new THREE.SphereGeometry(s, 32, 20), p = g.attributes.position;
      for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)), n = 1 + 0.08 * Math.sin(v.x * 9 + x * 3) * Math.sin(v.y * 8) + 0.05 * Math.sin(v.z * 12 + y); v.multiplyScalar(n); p.setXYZ(i, v.x, v.y, v.z); }
      g.computeVertexNormals(); const m = new THREE.Mesh(g, leaf); m.position.set(x, y, z); G.add(m);
    }
    return G;   // top ~3.1
  }
  LABK.scale = (o) => {
    // A: an atom blown up to the size of the visible universe
    const A = stage("void", { dust: 0, bg: 0x000000, key: 1.8, hemi: 0.3 });
    const a0 = 0.06, atom = new THREE.Group(), cl = cloud(44, 6000, 1, 0.42), nuc = nucleus(8, 14, 0.2, 0.11), haze = glowSprite(0xb9d3ee, 9, 0.12);
    atom.add(cl, nuc, haze); A.add(atom);
    const gal = galaxies(61, 170, 100, 10), stars = starPts(62, 7000, 140); A.add(gal, stars);
    const rim = new THREE.Mesh(new THREE.RingGeometry(1, 1.006, 256, 1), new THREE.MeshBasicMaterial({ color: 0xbcd3ec, transparent: true, depthWrite: false, opacity: 0 })); A.add(rim);
    // B: a tree and a string of the same height
    const B = stage("space", { seed: 15, stars: 5000, key: 2.0, hemi: 0.35 });
    B.add(galaxies(63, 90, 300, 0));
    const tr = tree(); tr.position.set(-1.35, 0, 0); B.add(tr);
    const isle = new THREE.Mesh(new THREE.SphereGeometry(3.2, 64, 16, 0, TAU, 0, 0.55), new THREE.MeshStandardMaterial({ color: 0x252d1d, roughness: 1 })); isle.scale.y = 0.3; isle.position.y = -0.96; B.add(isle);
    const st = { amp: 1, w: 0, ph: 0.5 }, strLoop = loop(1.5, 0.022, st, quat(Math.PI / 2, 0, 0), V(1.55, 1.58, 0)); B.add(strLoop);
    const sg = glowSprite(0xfff1d6, 3.8, 0.12); sg.position.set(1.55, 1.58, 0); B.add(sg);
    const C = cam(32); C.near = 0.002; C.updateProjectionMatrix();
    return (t, d) => {
      const ft = o.T0 + t;
      if (ft < 236.52) {
        const e = smooth((ft - 231.5) / 3.4), S = a0 * Math.exp(e * Math.log(44 / a0)), dist = 0.55 * Math.exp(e * Math.log(440 / 0.55));
        atom.scale.setScalar(S); atom.rotation.y = ft * 0.05;
        nuc.scale.setScalar(1 - 0.9 * seg(e, 0.05, 0.3)); nuc.userData.mats.forEach((m) => (m.opacity = 1 - seg(e, 0.15, 0.3))); nuc.visible = e < 0.3;
        haze.material.opacity = 0.12 * (1 - seg(e, 0.3, 0.8));
        const vis = seg(e, 0.1, 0.65); gal.userData.mats.forEach((m) => (m.opacity = 0.65 * vis)); stars.material.opacity = vis;
        aim(C, 0, 0, 0, dist * (1 + 0.04 * Math.sin(ft * 0.4)), lerp(-8, 14, t / 6.2), lerp(6, 16, e), 0, 0);
        rim.quaternion.copy(C.quaternion); rim.scale.setScalar(S * 1.05 * 2.2); rim.material.opacity = 0.35 * seg(ft, 233.8, 234.6);
        const rr = S * 2.31, up = V(0, 1, 0).applyQuaternion(C.quaternion), rt = V(1, 0, 0).applyQuaternion(C.quaternion), pp = up.multiplyScalar(rr * 0.6).add(rt.multiplyScalar(rr * 0.8));
        return [A, C, [["one atom = the visible universe", pp.x, pp.y, pp.z, seg(ft, 234.5, 235.0)]]];
      }
      st.w = ft * 4.2; st.amp = 0.38;
      tr.rotation.y = 0.3;
      const u = (ft - 236.52) / 3.94;
      aim(C, 0.1, 1.55, 0, lerp(10.5, 9.2, smooth(u)), lerp(-14, 6, u), lerp(9, 6, u), 0, -0.02);
      return [B, C, [["a string", 1.55, 3.1, 0, seg(ft, 237.8, 238.3)], ["about as tall as a tree", -1.35, 3.05, 0, seg(ft, 238.98, 239.5)]]];
    };
  };
})();
