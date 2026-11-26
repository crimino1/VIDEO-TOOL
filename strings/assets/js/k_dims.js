/* Group C kinds: dims, hose, curled, five, soupcan, brane, puzzle.  ft = o.T0 + t is film time. */
(function () {
  const { THREE, M, P, seg, smooth, lerp, clamp, rnd, KF, orbit, cam, stage, glowSprite, canvasTex } = L3;
  // like L3.liveTube, but drops the cached arc lengths each frame (shapes here start degenerate or change length)
  function liveTube(fn, segs, radius, mat, closed) {
    const curve = new THREE.Curve(); curve.getPoint = (u, out) => (out || new THREE.Vector3()).copy(fn(u));
    const mk = () => { curve.needsUpdate = true; return new THREE.TubeGeometry(curve, segs, radius, 10, !!closed); };
    const m = new THREE.Mesh(mk(), mat);
    m.userData.update = () => { if (!m.visible) return; m.geometry.dispose(); m.geometry = mk(); };
    return m;
  }
  const PI = Math.PI, TAU = 2 * PI;
  const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
  // opacity window: fade in from a, fade out ending at b (film seconds)
  const win = (ft, a, b, f) => { f = f || 0.5; return seg(ft, a, a + f) * (b === undefined ? 1 : 1 - seg(ft, b - f, b)); };
  const orb = (tx, ty, tz, dist, az, el) => { const C = new THREE.Object3D(); orbit(C, tx, ty, tz, dist, az, el); return { p: C.position.clone(), t: V3(tx, ty, tz) }; };
  const mixCam = (C, A, B, k) => { C.position.lerpVectors(A.p, B.p, k); C.lookAt(new THREE.Vector3().lerpVectors(A.t, B.t, k)); };
  const between = (m, a, b) => { const d = new THREE.Vector3().subVectors(b, a), L = d.length() || 1e-4; m.position.addVectors(a, b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(V3(0, 1, 0), d.divideScalar(L)); m.scale.set(1, L, 1); };

  // ---------- Calabi-Yau quintic cross-section (Hanson): z1^n + z2^n = 1 ----------
  // z1 = e^(2πi k1/n) cosh(ξ)^(2/n), z2 = e^(2πi k2/n) sinh(ξ)^(2/n), ξ = a + ib, a∈[-1,1], b∈[0,π/2]; 3D = (Re z1, Re z2, cosα Im z1 + sinα Im z2)
  function cyGeo(n, sg, alpha) {
    const per = (sg + 1) * (sg + 1), idx = [];
    for (let p = 0; p < n * n; p++) for (let i = 0; i < sg; i++) for (let j = 0; j < sg; j++) {
      const a = p * per + i * (sg + 1) + j, b = a + sg + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * n * per * 3), 3)); g.setIndex(idx);
    g.userData = { n, sg }; cyFill(g, alpha); return g;
  }
  function cyFill(g, alpha) {
    const { n, sg } = g.userData, pos = g.attributes.position.array, e = 2 / n, ca = Math.cos(alpha), sa = Math.sin(alpha);
    let k = 0;
    for (let k1 = 0; k1 < n; k1++) for (let k2 = 0; k2 < n; k2++) {
      const p1 = TAU * k1 / n, p2 = TAU * k2 / n;
      for (let i = 0; i <= sg; i++) {
        const b = (i / sg) * PI / 2, cb = Math.cos(b), sb = Math.sin(b);
        for (let j = 0; j <= sg; j++) {
          const a = 0.78 * (-1 + 2 * j / sg), ch = Math.cosh(a), sh = Math.sinh(a);
          const ar = ch * cb, ai = sh * sb, br = sh * cb, bi = ch * sb;   // cosh(a+ib), sinh(a+ib)
          const r1 = Math.pow(ar * ar + ai * ai, e / 2), t1 = Math.atan2(ai, ar) * e + p1;
          const r2 = Math.pow(br * br + bi * bi, e / 2), t2 = Math.atan2(bi, br) * e + p2;
          pos[k++] = r1 * Math.cos(t1); pos[k++] = r2 * Math.cos(t2); pos[k++] = ca * r1 * Math.sin(t1) + sa * r2 * Math.sin(t2);
        }
      }
    }
    g.attributes.position.needsUpdate = true; g.computeVertexNormals();
  }
  const pearl = (o) => new THREE.MeshPhysicalMaterial(Object.assign({ color: 0x8c99aa, roughness: 0.42, metalness: 0.1, sheen: 0.6, sheenColor: new THREE.Color(0xd4dfec), sheenRoughness: 0.5, clearcoat: 0.2, clearcoatRoughness: 0.4, envMapIntensity: 0.8, side: THREE.DoubleSide }, o || {}));
  const ringTex = () => canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.78, "rgba(255,255,255,0)"); gr.addColorStop(0.9, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });

  // =====================================================================  dims
  LABK.dims = (o) => (o.mode === "kaluza" ? dimsKaluza : dimsCount)(o, stage("void", { seed: 21, dust: 700 }), cam(34));

  function dimsCount(o, S, C) {
    const dot = new THREE.Mesh(new THREE.SphereGeometry(0.055, 24, 16), M.light(P.ink)), halo = glowSprite(0xfff1d6, 0.9, 0.3);
    S.add(dot, halo);
    const steel = M.steel();
    const shaftG = new THREE.CylinderGeometry(0.02, 0.02, 1, 16); shaftG.translate(0, 0.5, 0);
    const headG = new THREE.ConeGeometry(0.06, 0.2, 24); headG.translate(0, 0.1, 0);
    const AX = [V3(1, 0, 0), V3(0, 1, 0), V3(0, 0, 1)], LEN = 1.6;
    const arrows = AX.map((d) => { const g = new THREE.Group(), s = new THREE.Mesh(shaftG, steel), h = new THREE.Mesh(headG, steel); g.add(s, h); g.quaternion.setFromUnitVectors(V3(0, 1, 0), d); S.add(g); return { g, s, h, d }; });
    // six more directions with nowhere to go: they curl into small loops at the point
    const DIRS = [[1, 1, -1], [-1, 1, 1], [-1, 1, -1], [1, -0.6, 1], [-1, -0.7, 1], [1, -0.5, -1]], R0 = 0.3, LF = TAU * R0;
    const st = { ft: 0 };
    const curls = DIRS.map((a, i) => {
      const d = V3(a[0], a[1], a[2]).normalize(), n = new THREE.Vector3().crossVectors(d, V3(0, 1, 0)).normalize().applyAxisAngle(d, i * 0.9);
      const c = { d, n, g: 0, c: 0, j: 0, ph: i * 1.7 };
      c.m = liveTube((u) => {
        const s = u * LF * Math.max(c.g, 0.01), an = s / R0, k = c.c;
        const p = d.clone().multiplyScalar(s * 1.1 * (1 - k));
        p.addScaledVector(n, R0 * (1 - Math.cos(an)) * k).addScaledVector(d, R0 * Math.sin(an) * k);
        if (c.j > 0) { const f = st.ft; p.x += c.j * 0.035 * Math.sin(41 * f + c.ph + u * 9); p.y += c.j * 0.035 * Math.sin(37 * f + 2 * c.ph + u * 7); p.z += c.j * 0.035 * Math.sin(29 * f + 3 * c.ph + u * 11); }
        return p;
      }, 56, 0.017, steel);
      S.add(c.m); return c;
    });
    const pulse = new THREE.Sprite(new THREE.SpriteMaterial({ map: ringTex(), color: 0xcfe0f2, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(pulse);
    const WORDS = ["four", "five", "six", "seven", "eight", "nine"];
    return (t) => {
      const ft = o.T0 + t; st.ft = ft;
      const on = seg(ft, 353.3, 354.1);
      dot.scale.setScalar(Math.max(on, 0.001)); halo.material.opacity = 0.3 * on;
      const pins = [];
      arrows.forEach((a, i) => {
        const L = LEN * seg(ft, 358.22 + i * 0.55, 359.1 + i * 0.55);
        a.g.visible = L > 0.01; a.s.scale.set(1, Math.max(L - 0.2, 0.001), 1); a.h.position.y = Math.max(L - 0.2, 0);
        a.h.scale.setScalar(clamp(L / 0.3, 0, 1));
        const tip = a.d.clone().multiplyScalar(L + 0.08);
        pins.push([["one", "two", "three"][i], tip.x, tip.y, tip.z, win(ft, 358.6 + i * 0.6, 359.8 + i * 0.6 + (i === 2 ? 0.6 : 0))]);
      });
      curls.forEach((c, i) => {
        const t0 = 361.34 + i * 0.45;
        c.g = seg(ft, t0, t0 + 0.5); c.c = seg(ft, t0 + 0.3, t0 + 1.0); c.j = seg(ft, 368.02, 368.6) * (0.7 + 0.3 * Math.sin(ft * 5 + i));
        c.m.visible = c.g > 0.02;
        const far = c.n.clone().multiplyScalar(2 * R0 * c.c).addScaledVector(c.d, 0.55 * c.g * (1 - c.c));
        pins.push([WORDS[i], far.x, far.y, far.z, win(ft, t0 + 0.5, t0 + 1.35, 0.25)]);
      });
      // time: a slow pulse from the point
      const tp = ft - 364.26;
      if (tp > 0) { const ph = (tp / 2.4) % 1; pulse.scale.setScalar(0.3 + 3.2 * smooth(ph)); pulse.material.opacity = 0.32 * (1 - ph) * seg(tp, 0, 0.6); dot.scale.setScalar(1 + 0.35 * (1 - ph) * seg(tp, 0, 0.6)); }
      else pulse.material.opacity = 0;
      pins.push(["9 + time = 10", -0.45, 0.62, 0.1, win(ft, 365.5, 370.4, 0.6)]);
      const ty = KF([[370.2, 0.42], [371.8, -0.3]], ft);
      orbit(C, 0.38, ty, 0.38, KF([[349.86, 9.5], [353.3, 8.2], [358.2, 6.6], [364, 6.0], [370, 6.2], [375.98, 6.6]], ft), lerp(26, 60, (ft - 349.86) / 26.12), lerp(22, 15, (ft - 349.86) / 26.12));
      return [S, C, pins.filter((p) => p[4] > 0.01)];
    };
  }

  function dimsKaluza(o, S, C) {
    const NX = 9, NZ = 6, SP = 1.15, RR = 0.17;
    const dotG = new THREE.SphereGeometry(0.035, 12, 8), dotM = M.light(P.ink);
    const ringG = new THREE.TorusGeometry(RR, 0.006, 6, 56), ringM = M.light(P.fieldLine, 0.8);
    const beadG = new THREE.SphereGeometry(0.032, 14, 10), beadM = M.light(0xf6e7c8);
    const pts = [];
    for (let i = 0; i < NX; i++) for (let j = 0; j < NZ; j++) {
      const x = (i - (NX - 1) / 2) * SP, z = (j - (NZ - 1) / 2) * SP;
      const d = new THREE.Mesh(dotG, dotM), r = new THREE.Mesh(ringG, ringM), b = new THREE.Mesh(beadG, beadM);
      S.add(d, r, b); pts.push({ x, z, d, r, b, i, j });
    }
    // faint grid lines between the points so the ripple reads as space itself
    const SUB = 8, nSeg = ((NX - 1) * NZ + NX * (NZ - 1)) * SUB;
    const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(nSeg * 6), 3));
    const lines = new THREE.LineSegments(lg, M.line(P.fieldLine, 0.18)); S.add(lines);
    const disp = (x, z, ft) => {
      const tt = ft - 390.5; if (tt <= 0) return 0;
      const r = Math.hypot(x + 6.5, z + 4), front = tt * 3.0, beh = front - r;
      return 0.42 * smooth(beh / 1.5) * Math.exp(-Math.max(0, beh) * 0.09) * Math.sin(1.5 * beh);
    };
    return (t) => {
      const ft = o.T0 + t;
      const tt = Math.max(0, ft - 390.5), spin = 3.2 * tt * tt / (tt + 1);
      pts.forEach((p) => {
        const y = disp(p.x, p.z, ft), sc = seg(ft, 387.0 + p.i * 0.14 + p.j * 0.05, 387.7 + p.i * 0.14 + p.j * 0.05);
        p.d.position.set(p.x, y, p.z);
        p.r.position.set(p.x, y + RR * sc, p.z); p.r.scale.setScalar(Math.max(sc, 0.001));
        const a = -PI / 2 + spin + (tt > 0 ? Math.hypot(p.x + 6.5, p.z + 4) * 0.35 : 0) * seg(tt, 0, 1);
        p.b.position.set(p.x + RR * sc * Math.cos(a), y + RR * sc + RR * sc * Math.sin(a), p.z); p.b.visible = sc > 0.5;
      });
      const A = lg.attributes.position.array; let k = 0;
      const put = (x0, z0, x1, z1) => { for (let s = 0; s < SUB; s++) { const a = s / SUB, b = (s + 1) / SUB, xa = lerp(x0, x1, a), za = lerp(z0, z1, a), xb = lerp(x0, x1, b), zb = lerp(z0, z1, b); A[k++] = xa; A[k++] = disp(xa, za, ft); A[k++] = za; A[k++] = xb; A[k++] = disp(xb, zb, ft); A[k++] = zb; } };
      const gx = (i) => (i - (NX - 1) / 2) * SP, gz = (j) => (j - (NZ - 1) / 2) * SP;
      for (let j = 0; j < NZ; j++) for (let i = 0; i < NX - 1; i++) put(gx(i), gz(j), gx(i + 1), gz(j));
      for (let i = 0; i < NX; i++) for (let j = 0; j < NZ - 1; j++) put(gx(i), gz(j), gx(i), gz(j + 1));
      lg.attributes.position.needsUpdate = true;
      const pg = pts[5 * NZ + 3], pe = pts[3 * NZ + 1];
      const pins = [
        ["gravity", pg.d.position.x, pg.d.position.y, pg.d.position.z, win(ft, 391.2, 393.9)],
        ["electromagnetism", pe.b.position.x, pe.b.position.y, pe.b.position.z, win(ft, 393.4, 396.8)],
      ];
      const p = (ft - 386.78) / 10.12;
      orbit(C, 0.3, 0, 0.5, lerp(10.4, 8.6, smooth(p)), lerp(-18, 10, p), lerp(30, 22, p));
      return [S, C, pins];
    };
  }

  // =====================================================================  hose
  function makeAnt() {
    const g = new THREE.Group();
    const shell = new THREE.MeshPhysicalMaterial({ color: 0x1a120d, roughness: 0.32, metalness: 0, clearcoat: 0.9, clearcoatRoughness: 0.2 });
    const legM = new THREE.MeshStandardMaterial({ color: 0x21170f, roughness: 0.5 });
    const ball = new THREE.SphereGeometry(1, 20, 14);
    [[0.12, 0.072, 0.042, 0.04, 0.042], [0.025, 0.07, 0.05, 0.026, 0.03], [-0.115, 0.08, 0.07, 0.05, 0.055]].forEach(([x, y, rx, ry, rz]) => { const m = new THREE.Mesh(ball, shell); m.position.set(x, y, 0); m.scale.set(rx, ry, rz); m.castShadow = true; g.add(m); });
    const cyl = new THREE.CylinderGeometry(0.006, 0.005, 1, 6);
    const legs = [];
    for (let s = -1; s <= 1; s += 2) for (let k = 0; k < 3; k++) {
      const a = new THREE.Mesh(cyl, legM), b = new THREE.Mesh(cyl, legM); a.castShadow = b.castShadow = true; g.add(a, b);
      legs.push({ a, b, s, k, hip: V3(0.05 - k * 0.032, 0.065, s * 0.02), ph: ((k % 2) ^ (s > 0 ? 1 : 0)) * PI });
    }
    const ants = [-1, 1].map((s) => { const a = new THREE.Mesh(cyl, legM), b = new THREE.Mesh(cyl, legM); g.add(a, b); return { a, b, s }; });
    g.userData.pose = (walk) => {
      legs.forEach((l) => {
        const sw = Math.sin(walk + l.ph), lift = Math.max(0, Math.cos(walk + l.ph));
        const foot = V3(l.hip.x + (l.k - 1) * -0.05 + 0.035 * sw, 0.004 + 0.022 * lift, l.s * 0.15);
        const knee = V3((l.hip.x + foot.x) / 2, 0.12, l.s * 0.095);
        between(l.a, l.hip, knee); between(l.b, knee, foot);
      });
      ants.forEach((an, i) => { const base = V3(0.155, 0.09, an.s * 0.018), mid = V3(0.19, 0.15 + 0.008 * Math.sin(walk * 0.5 + i), an.s * 0.05), tip = V3(0.25, 0.13, an.s * 0.075); between(an.a, base, mid); between(an.b, mid, tip); });
    };
    return g;
  }

  LABK.hose = (o) => {
    const S = stage("studio", { bg: 0x9aa5ab, key: 2.6, hemi: 0.9, rim: 0.4, floorY: -20 }), C = cam(32);
    S.fog = new THREE.Fog(0x9aa5ab, 45, 190);
    S.children.forEach((c) => { if (c.isHemisphereLight) { c.color.set(0xc4d4e6); c.groundColor.set(0x3b4a2c); } });
    const key = S.userData.key, sc = key.shadow.camera; key.position.set(-9, 14, 6); key.shadow.mapSize.set(4096, 4096);
    sc.left = -30; sc.right = 30; sc.top = 30; sc.bottom = -30; sc.far = 60; sc.updateProjectionMatrix();
    // grass
    const r = rnd(5);
    const grassT = canvasTex(512, 512, (g, w, h) => {
      g.fillStyle = "#2f4427"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 14000; i++) { const x = r() * w, y = r() * h, l = 3 + r() * 9, a = (r() - 0.5) * 1.2, v = r(); g.strokeStyle = `rgba(${48 + v * 46 | 0},${70 + v * 52 | 0},${36 + v * 26 | 0},${0.5 + r() * 0.5})`; g.lineWidth = 1 + r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.sin(a) * l, y - Math.cos(a) * l); g.stroke(); }
    });
    grassT.wrapS = grassT.wrapT = THREE.RepeatWrapping; grassT.repeat.set(90, 90);
    const gg = new THREE.PlaneGeometry(400, 400, 100, 100), col = [];
    const gp = gg.attributes.position;
    for (let i = 0; i < gp.count; i++) { const x = gp.getX(i), y = gp.getY(i), v = 0.82 + 0.12 * Math.sin(x * 0.07 + 1.3) * Math.sin(y * 0.05) + 0.08 * Math.sin(x * 0.19 + y * 0.13); col.push(v, v * 1.0, v * 0.95); }
    gg.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    const ground = new THREE.Mesh(gg, new THREE.MeshStandardMaterial({ map: grassT, vertexColors: true, roughness: 0.95, envMapIntensity: 0.3 }));
    ground.rotation.x = -PI / 2; ground.receiveShadow = true; S.add(ground);
    // hose: smooth tube, fine ribs from a bump map; slightly lifted where the ant walks so it can pass underneath
    const HR = 0.5, RIB = 0.01;
    const hy = (x) => HR + 0.22 * Math.exp(-(x / 5) * (x / 5));
    const hz = (x) => 2.2 * Math.sin(x * 0.03) + 0.8 * Math.sin(x * 0.071 + 1) - 0.8 * Math.sin(1);
    const path = new THREE.Curve(); path.getPoint = (u, out) => { const x = lerp(-70, 70, u); return (out || new THREE.Vector3()).set(x, hy(x), hz(x)); };
    const ribT = canvasTex(64, 4, (g, w, h) => { for (let x = 0; x < w; x++) { const v = Math.pow(0.5 + 0.5 * Math.cos(TAU * x / w), 2) * 255 | 0; g.fillStyle = `rgb(${v},${v},${v})`; g.fillRect(x, 0, 1, h); } });
    ribT.colorSpace = THREE.NoColorSpace; ribT.wrapS = ribT.wrapT = THREE.RepeatWrapping; ribT.repeat.set(1100, 1);
    const hg = new THREE.TubeGeometry(path, 1400, HR, 28, false);
    const hose = new THREE.Mesh(hg, new THREE.MeshPhysicalMaterial({ color: 0x2c6032, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.35, bumpMap: ribT, bumpScale: 1.6 }));
    hose.castShadow = true; hose.receiveShadow = true; S.add(hose);
    const ant = makeAnt(); S.add(ant);
    const surf = (x, phi) => {   // point on hose surface, outward normal, along-tangent, around-tangent
      const c = V3(x, hy(x), hz(x)), T = V3(1, (hy(x + 0.01) - hy(x - 0.01)) / 0.02, (hz(x + 0.01) - hz(x - 0.01)) / 0.02).normalize();
      const U = V3(0, 1, 0).addScaledVector(T, -T.y).normalize(), Sd = new THREE.Vector3().crossVectors(T, U);
      const N = U.clone().multiplyScalar(Math.cos(phi)).addScaledVector(Sd, Math.sin(phi));
      const A = U.clone().multiplyScalar(-Math.sin(phi)).addScaledVector(Sd, Math.cos(phi));
      return { p: c.addScaledVector(N, HR * (1 + RIB * 0.7)), N, T, A };
    };
    const mtx = new THREE.Matrix4();
    return (t) => {
      const ft = o.T0 + t;
      // ant: walks along (to 412.7), turns, then circles the hose
      const X0 = -3.4, X1 = 0, tw0 = 408.2, tw1 = 412.7, tc = 413.1, w = 1.25;
      const x = lerp(X0, X1, clamp((ft - tw0) / (tw1 - tw0), 0, 1));
      const phi = ft > tc ? (ft - tc) * w / (HR * 1.04) : 0;
      const s = surf(x, phi), turn = smooth((ft - tw1) / (tc - tw1));
      const fwd = s.T.clone().multiplyScalar(1 - turn).addScaledVector(s.A, turn).normalize();
      const up = s.N, side = new THREE.Vector3().crossVectors(fwd, up).normalize(); fwd.crossVectors(up, side);
      mtx.makeBasis(fwd, up, side); ant.quaternion.setFromRotationMatrix(mtx); ant.position.copy(s.p);
      ant.userData.pose(ft < tw0 ? 0 : (ft - tw0) * 14);
      // camera: aerial -> swoop to the ant -> along the axis -> pull up
      const tgt = V3(KF([[410.2, 0], [412.3, s.p.x]], ft), KF([[410.2, 0], [412.3, s.p.y]], ft), KF([[410.2, 0], [412.3, s.p.z]], ft));
      if (ft > 412.3) tgt.copy(s.p).multiplyScalar(1 - seg(ft, 413.2, 414.2)).addScaledVector(V3(0, hy(0), hz(0)), seg(ft, 413.2, 414.2));
      if (ft > 416.2) tgt.multiplyScalar(1 - seg(ft, 416.2, 418.5));
      const dist = KF([[398.96, 72], [410.2, 62], [412.3, 3.2], [413.2, 3.1], [414.5, 3.5], [416.2, 3.7], [418.52, 34]], ft);
      const az = KF([[398.96, 0], [410.2, 6], [412.3, 28], [413.2, 30], [414.6, 26], [416.2, 22], [418.52, 10]], ft);
      const el = KF([[398.96, 84], [410.2, 80], [412.3, 20], [413.2, 14], [414.6, 6], [416.2, 8], [418.52, 70]], ft);
      S.fog.near = lerp(14, 80, clamp(dist / 60, 0, 1)); S.fog.far = lerp(70, 260, clamp(dist / 60, 0, 1));
      orbit(C, tgt.x, tgt.y, tgt.z, dist, az, el);
      const lx = -11, top = ant.position.clone().addScaledVector(up, 0.16);
      const pins = [
        ["a line", lx, hy(lx) + HR, hz(lx), win(ft, 406.6, 410.2)],
        ["one way", top.x, top.y, top.z, win(ft, 410.9, 412.8)],
        ["and around", top.x, top.y, top.z, win(ft, 413.4, 416.1)],
      ];
      return [S, C, pins];
    };
  };

  // =====================================================================  curled
  LABK.curled = (o) => {
    const S = stage("void", { seed: 33, dust: 600 }), C = cam(32);
    const bigG = cyGeo(5, 28, PI / 4), big = new THREE.Mesh(bigG, pearl()); S.add(big);
    big.castShadow = big.receiveShadow = true;   // self-shadow makes the folds read
    const key = S.userData.key, ksc = key.shadow.camera; key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0006; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
    ksc.left = ksc.bottom = -2.2; ksc.right = ksc.top = 2.2; ksc.near = 1; ksc.far = 40; ksc.updateProjectionMatrix();
    const halo = glowSprite(0xdfe8f4, 6, 0); S.add(halo);
    const st = { ft: 0, on: 0, w: 1, w5: 0 };
    const loopM = M.light(P.string, 1);
    const loop = liveTube((u) => {
      const th = TAU * u * st.w, f = st.ft, A = 0.09 * st.on;
      const rr = 1.62 + A * ((1 - st.w5) * Math.sin(3 * th + 2.3 * f) + st.w5 * Math.sin(5 * th - 3.1 * f));
      const p = V3(rr * Math.cos(th), A * 0.8 * Math.sin(4 * th + 1.7 * f), rr * Math.sin(th));
      return p.applyAxisAngle(V3(1, 0, 0), 1.05).applyAxisAngle(V3(0, 1, 0), 0.5);
    }, 160, 0.016, loopM);
    S.add(loop);
    const loopGlow = glowSprite(0xfff1d6, 4.2, 0); S.add(loopGlow);

    if (o.mode === "one") {
      const sky = L3.stars(91, 8000); sky.material.transparent = true; S.add(sky);
      loop.visible = false;
      return (t) => {
        const ft = o.T0 + t, p = t / 13.3;
        cyFill(bigG, PI / 4 + 0.12 * Math.sin(ft * 0.35));
        big.rotation.set(0.35 + 0.08 * Math.sin(ft * 0.2), 0.16 * t + 0.6, 0.1);
        const u = seg(ft, 553.98, 555.6);
        sky.material.opacity = u; halo.material.opacity = 0.07 * u;
        orbit(C, 0, 0, 0, lerp(8.2, 6.9, smooth(p)), lerp(-14, 12, p), lerp(14, 8, p));
        return [S, C, [["our universe", 0.5, 1.15, 0.2, win(ft, 554.6, 558.4, 0.7)]]];
      };
    }

    // grid: a lattice of points, each sprouting a tiny curled shape
    const cells = [];
    for (let i = -2; i <= 2; i++) for (let j = -1; j <= 1; j++) for (let k = -2; k <= 0; k++) if (i || j || k) cells.push(V3(i * 2.4, j * 2.1, k * 2.4));
    const smallM = pearl({ transparent: true }), small = new THREE.InstancedMesh(cyGeo(5, 12, PI / 4), smallM, cells.length);
    const dotM = M.light(P.ink, 1), dots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.04, 10, 8), dotM, cells.length + 1);
    S.add(small, dots);
    const rr = rnd(77), rot = cells.map(() => [rr() * TAU, rr() * TAU, rr() * TAU, 0.1 + rr() * 0.2]);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), one = V3(1, 1, 1), sv = new THREE.Vector3();
    const TINY = 0.24;
    return (t) => {
      const ft = o.T0 + t;
      const fadeOthers = 1 - seg(ft, 426.0, 427.3);
      cells.forEach((c, n) => {
        const r = rot[n], a = seg(ft, 420.4 + c.length() * 0.12, 421.2 + c.length() * 0.12);
        e.set(r[0] + r[3] * t, r[1] + r[3] * 0.7 * t, r[2]); q.setFromEuler(e);
        m4.compose(c, q, sv.setScalar(Math.max(TINY * a, 1e-4))); small.setMatrixAt(n, m4);
        m4.compose(c, q.identity(), sv.setScalar(Math.max(1 - a * 0.6, 0.3) * seg(ft, 418.6, 419.6) + 1e-4)); dots.setMatrixAt(n, m4);
      });
      m4.compose(V3(0, 0, 0), q.identity(), sv.setScalar((1 - seg(ft, 420.4, 421.2) * 0.6) * seg(ft, 418.6, 419.6) + 1e-4)); dots.setMatrixAt(cells.length, m4);
      small.instanceMatrix.needsUpdate = dots.instanceMatrix.needsUpdate = true;
      smallM.opacity = fadeOthers; dotM.opacity = fadeOthers; small.visible = fadeOthers > 0.01; dots.visible = fadeOthers > 0.01;
      // the chosen one grows as the camera pushes in; its form shifts slightly once the string arrives
      const grow = seg(ft, 426.0, 428.8), sc = TINY * seg(ft, 420.4, 421.2) * (1 - grow) + grow;
      const shift = Math.max(0, ft - 428.82);
      st.w5 = 0.5 - 0.5 * Math.cos(shift * 0.75);
      cyFill(bigG, PI / 4 + 0.2 * Math.sin(shift * 0.75) * seg(ft, 428.8, 430));
      big.scale.setScalar(Math.max(sc, 1e-4)); big.rotation.set(0.4 + 0.1 * t * (1 - grow) + 0.02 * t, 0.16 * t, 0.12);
      st.ft = ft; st.on = seg(ft, 429.6, 430.6); st.w = Math.max(0.002, seg(ft, 428.82, 430.0));
      loop.visible = ft > 428.82; loopM.opacity = seg(ft, 428.82, 429.3); loopGlow.material.opacity = 0.05 * st.on;
      halo.material.opacity = 0.05 * grow;
      const tx = KF([[431, 0], [434.5, -1.1]], ft);
      const dist = KF([[418.52, 17], [425.84, 13.5], [428.7, 7.4], [438.54, 7.9]], ft);
      orbit(C, tx, KF([[431, 0], [434.5, -0.15]], ft), 0, dist, KF([[418.52, -14], [425.84, -6], [428.7, -2], [438.54, 22]], ft), KF([[418.52, 16], [425.84, 12], [428.7, 10], [438.54, 14]], ft));
      big.updateMatrixWorld();
      const sp = big.localToWorld(V3(0.2, 0.9, 0.3)), lp = V3(1.62, 0, 0).applyAxisAngle(V3(1, 0, 0), 1.05).applyAxisAngle(V3(0, 1, 0), 0.5);
      return [S, C, [
        ["shape", sp.x, sp.y, sp.z, win(ft, 429.3, 431.4)],
        ["particles", lp.x, lp.y, lp.z, win(ft, 431.5, 433.8)],
        ["masses", lp.x, lp.y, lp.z, win(ft, 433.9, 436.4)],
      ]];
    };
  };

  // =====================================================================  five
  // five distinct string forms; returns { groups, update(ft, t) }
  function stringForms(S) {
    const st = { ft: 0 }, forms = [];
    const mkTube = (grp, mat, fn, closed) => { const m = liveTube(fn, 72, 0.022, mat, closed); grp.add(m); return m; };
    const NAMES = ["Type I", "Type IIA", "Type IIB", "Heterotic SO(32)", "Heterotic E8×E8"];
    const bead = new THREE.SphereGeometry(0.05, 16, 12), pm = pearl({ color: 0xd8dde4 });
    for (let k = 0; k < 5; k++) {
      const g = new THREE.Group(), mat = M.light(P.string, 1), ph = k * 1.3;
      const glow = glowSprite(0xfff1d6, 1.6, 0); g.add(glow);
      const f = { g, mat, glow, name: NAMES[k], extra: [] };
      if (k === 0) {
        mkTube(g, mat, (u) => { const w = st.ft; return V3((u - 0.5) * 1.3, 0.13 * Math.sin(PI * u) * Math.sin(5.1 * w + ph) + 0.05 * Math.sin(TAU * u) * Math.cos(7.3 * w), 0.04 * Math.sin(3 * PI * u) * Math.sin(4 * w)); });
        [-0.65, 0.65].forEach((x) => { const e = new THREE.Mesh(bead, mat); e.position.x = x; e.scale.setScalar(0.7); g.add(e); });
      } else if (k === 1) {
        mkTube(g, mat, (u) => { const th = TAU * u, w = st.ft, rr = 0.45 + 0.05 * Math.sin(3 * th + 4 * w + ph); return V3(rr * Math.cos(th), rr * Math.sin(th), 0.04 * Math.sin(2 * th - 3 * w)); }, true);
      } else if (k === 2) {
        mkTube(g, mat, (u) => { const th = TAU * u, w = st.ft, a = 1 + 0.06 * Math.sin(4 * th + 5 * w); return V3(0.62 * Math.sin(th) * a, 0.34 * Math.sin(2 * th) * a, 0.17 * Math.cos(th)); }, true);
      } else if (k === 3) {
        mkTube(g, mat, (u) => { const th = TAU * u, w = st.ft, rr = 0.34 + 0.03 * Math.sin(3 * th + 4.4 * w); return V3(-0.17 + rr * Math.cos(th), rr * Math.sin(th), 0); }, true);
        mkTube(g, mat, (u) => { const th = TAU * u, w = st.ft, rr = 0.34 + 0.03 * Math.sin(3 * th - 3.8 * w); return V3(0.17 + rr * Math.cos(th), 0, rr * Math.sin(th)); }, true);
      } else {
        const R = (th, w) => 0.45 + 0.04 * Math.sin(2 * th + 3.6 * w);
        mkTube(g, mat, (u) => { const th = TAU * u, w = st.ft; return V3(R(th, w) * Math.cos(th), R(th, w) * Math.sin(th), 0.03 * Math.sin(3 * th - 2 * w)); }, true);
        for (let b = 0; b < 5; b++) { const e = new THREE.Mesh(bead, pm); g.add(e); f.extra.push(e); }
        f.beads = (w) => f.extra.forEach((e, b) => { const th = b * TAU / 5 + 0.5 * w; e.position.set(R(th, w) * Math.cos(th), R(th, w) * Math.sin(th), 0.03 * Math.sin(3 * th - 2 * w)); });
      }
      S.add(g); forms.push(f);
    }
    return { forms, set: (ft) => { st.ft = ft; forms.forEach((f) => f.beads && f.beads(ft)); } };
  }

  LABK.five = (o) => {
    const S = stage("void", { seed: 51, dust: 700 }), C = cam(32), F = stringForms(S), fs = F.forms;
    if (o.mode === "merge") {
      // the hidden deeper object: a soft frosted, slowly breathing form
      const bg = new THREE.SphereGeometry(1.25, 96, 64), bp = bg.attributes.position, nv = new THREE.Vector3();
      for (let i = 0; i < bp.count; i++) { nv.fromBufferAttribute(bp, i).normalize(); const f = 1 + 0.07 * Math.sin(3 * nv.x + 1) * Math.sin(2.5 * nv.y + 2) + 0.05 * Math.sin(4 * nv.z + nv.x * 2); bp.setXYZ(i, nv.x * 1.25 * f, nv.y * 1.25 * f, nv.z * 1.25 * f); }
      bg.computeVertexNormals();
      const cy = new THREE.Mesh(bg, new THREE.MeshPhysicalMaterial({ color: 0xd9e1ea, roughness: 0.62, metalness: 0, transparent: true, opacity: 0, depthWrite: false, emissive: 0x262d36, sheen: 1, sheenColor: new THREE.Color(0xeef3f8), sheenRoughness: 0.6 }));
      const cyHalo = glowSprite(0xe6eef8, 5.5, 0); S.add(cy, cyHalo);
      const lines = fs.map(() => { const lg = new THREE.BufferGeometry().setFromPoints([V3(0, 0, 0), V3(0, 0, 0)]), l = new THREE.Line(lg, M.line(P.fieldLine, 0)); S.add(l); return l; });
      const shadowC = new THREE.Color(0x3c434e), warm = new THREE.Color(P.string);
      return (t) => {
        const ft = o.T0 + t; F.set(ft);
        const d = seg(ft, 496.7, 498.9), sh = seg(ft, 497.0, 499.2);
        fs.forEach((f, k) => {
          const a = PI / 2 + k * TAU / 5, R = lerp(2.2, 4.1, d);
          f.g.position.set(R * Math.cos(a), R * Math.sin(a) * lerp(0.9, 0.58, d) + 0.1, -1.2 * d);
          f.g.rotation.set(0.25 * Math.sin(ft * 0.4 + k), 0.4 * Math.sin(ft * 0.3 + k) * (1 - sh), 0);
          f.g.scale.set(1, 1, Math.max(1 - 0.9 * sh, 0.1));
          f.mat.color.copy(warm).lerp(shadowC, sh); f.mat.opacity = 1 - 0.35 * sh; f.glow.material.opacity = 0.12 * (1 - sh);
          f.extra.forEach((e) => (e.visible = sh < 0.5));
          const lp = lines[k].geometry.attributes.position; lp.setXYZ(1, f.g.position.x, f.g.position.y, f.g.position.z); lp.needsUpdate = true; lines[k].material.opacity = 0.22 * sh;
        });
        cy.material.opacity = 0.5 * sh; cy.scale.setScalar(0.8 + 0.25 * sh + 0.02 * Math.sin(ft * 2)); cy.rotation.set(0.4, 0.3 * t, 0.1); cyHalo.material.opacity = 0.3 * sh;
        orbit(C, 0, 0.1, 0, lerp(11.6, 10.6, t / 3.14), lerp(-4, 4, t / 3.14), lerp(5, 8, t / 3.14));
        return [S, C, [["one deeper thing", 0.3, 1.25, 0, win(ft, 497.7, 500.2, 0.6)]]];
      };
    }
    const APP = [467.9, 469.0, 469.5, 470.0, 470.3], GL = [462.6, 463.5, 464.3, 465.0, 465.7];
    const bubM = new THREE.MeshPhysicalMaterial({ color: 0xdfe7f0, roughness: 0.06, metalness: 0, transparent: true, opacity: 0.06, depthWrite: false, clearcoat: 1, envMapIntensity: 2.5 });
    const bubG = new THREE.SphereGeometry(0.95, 48, 32), rr = rnd(12);
    const bubs = fs.map((f, k) => {
      const b = new THREE.Mesh(bubG, bubM.clone()), pg = new THREE.BufferGeometry(), pp = [];
      for (let i = 0; i < 40; i++) { const u = rr() * 2 - 1, th = rr() * TAU, s = Math.sqrt(1 - u * u), rad = 0.35 + 0.5 * Math.cbrt(rr()); pp.push(rad * s * Math.cos(th), rad * u, rad * s * Math.sin(th)); }
      pg.setAttribute("position", new THREE.Float32BufferAttribute(pp, 3));
      const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: [0xcfd8e6, 0xe8dcc8, 0xd6e2dc, 0xdcd4e4, 0xe6e0d0][k], size: 2, sizeAttenuation: false, transparent: true, opacity: 0, depthWrite: false }));
      b.add(pts); S.add(b); return { b, pts };
    });
    const glints = fs.map(() => { const s = glowSprite(0xfff1d6, 0.5, 0); S.add(s); return s; });
    return (t) => {
      const ft = o.T0 + t; F.set(ft);
      const pins = [];
      fs.forEach((f, k) => {
        const a = PI / 2 + k * TAU / 5, pos = V3(2.45 * Math.cos(a), 2.45 * Math.sin(a) - 0.2, 0.35 * Math.sin(k * 2.1));
        const ap = seg(ft, APP[k], APP[k] + 0.7);
        f.g.position.copy(pos); f.g.visible = ap > 0.01; f.g.scale.setScalar(Math.max(0.6 + 0.4 * ap, 0.01));
        f.g.rotation.set(0.25 * Math.sin(ft * 0.3 + k), 0.5 * Math.sin(ft * 0.21 + k * 1.7), 0.1 * Math.sin(ft * 0.4 + k));
        f.mat.opacity = ap; f.glow.material.opacity = 0.12 * ap; f.extra.forEach((e) => e.scale.setScalar(Math.max(ap, 0.01)));
        glints[k].position.copy(pos); glints[k].material.opacity = 0.5 * win(ft, GL[k], APP[k] + 0.6, 0.5);
        const bs = seg(ft, 473.1 + k * 0.22, 474.0 + k * 0.22);
        bubs[k].b.position.copy(pos); bubs[k].b.visible = bs > 0.01; bubs[k].b.scale.setScalar(Math.max(0.7 + 0.3 * bs, 0.01)); bubs[k].b.material.opacity = 0.07 * bs;
        bubs[k].b.rotation.y = 0.1 * t + k; bubs[k].pts.material.opacity = 0.75 * bs;
        const nx = k < 4 ? APP[k + 1] + 0.35 : 472.4;
        const op = Math.max(win(ft, APP[k] + 0.15, nx, 0.3), win(ft, 475.0 + k * 1.3, 476.25 + k * 1.3, 0.3));
        pins.push([f.name, pos.x, pos.y + 0.62, pos.z, op]);
      });
      const p = (ft - 460.62) / 21.5;
      orbit(C, 0, 0.25, 0, lerp(14.6, 13.0, smooth(p)), lerp(-22, 22, p), lerp(9, 4, p));
      return [S, C, pins.filter((x) => x[4] > 0.01)];
    };
  };

  // =====================================================================  soupcan
  LABK.soupcan = (o) => {
    const S = stage("studio", { bg: 0xb9b4aa, key: 0.9, hemi: 0.65, rim: 0.25, floorY: -20 }), C = cam(32);
    S.fog = null; const key = S.userData.key; key.castShadow = false;
    const white = new THREE.MeshStandardMaterial({ color: 0xd9d5cd, roughness: 0.92, envMapIntensity: 0.25 });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), white); floor.rotation.x = -PI / 2; floor.receiveShadow = true;
    const WZ = -1.6, wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), white); wall.position.set(0, 10, WZ); wall.receiveShadow = true;
    S.add(floor, wall);
    // can: lathe steel body with beads, rolled rims, lid rings; paper label
    const R = 0.52, H = 1.5, prof = [V3(0, 0.012), V3(R - 0.06, 0.012), V3(R - 0.03, 0.004), V3(R - 0.008, 0.0), V3(R + 0.006, 0.02), V3(R + 0.008, 0.05), V3(R, 0.075)];
    for (let y = 0.08; y < H - 0.08; y += 0.01) prof.push(V3(R - 0.006 * (0.5 + 0.5 * Math.cos(TAU * (y - 0.08) / 0.09)), y));
    prof.push(V3(R, H - 0.07), V3(R + 0.01, H - 0.035), V3(R + 0.012, H - 0.005), V3(R - 0.01, H + 0.004), V3(R - 0.03, H - 0.006), V3(R - 0.045, H - 0.03), V3(0.36, H - 0.03), V3(0.34, H - 0.02), V3(0.32, H - 0.03), V3(0.22, H - 0.03), V3(0.2, H - 0.022), V3(0.18, H - 0.03), V3(0, H - 0.03));
    const can = new THREE.Group();
    const body = new THREE.Mesh(new THREE.LatheGeometry(prof.map((v) => new THREE.Vector2(v.x, v.y)), 96), new THREE.MeshStandardMaterial({ color: 0xd2d5da, metalness: 0.85, roughness: 0.3, envMapIntensity: 2.2, side: THREE.DoubleSide }));
    const labT = canvasTex(1024, 256, (g, w, h) => {
      g.fillStyle = "#e7ddc6"; g.fillRect(0, 0, w, h); const r = rnd(9);
      for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(120,100,70,${r() * 0.05})`; g.fillRect(r() * w, r() * h, 2, 2); }
      g.fillStyle = "#8f2b23"; g.fillRect(0, h * 0.26, w, h * 0.09);
      g.fillStyle = "rgba(143,43,35,.8)"; g.fillRect(0, h * 0.39, w, 3); g.fillRect(0, h * 0.86, w, 2);
    });
    const label = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.004, R + 0.004, 1.16, 96, 1, true), new THREE.MeshStandardMaterial({ map: labT, roughness: 0.72 }));
    label.position.y = 0.75; body.castShadow = label.castShadow = true; body.receiveShadow = label.receiveShadow = true;
    can.add(body, label); S.add(can);
    const spot = (ang) => { const s = new THREE.SpotLight(0xfff3e2, 0, 0, ang, 0.55, 0); s.castShadow = true; s.shadow.mapSize.set(2048, 2048); s.shadow.bias = -0.0004; s.shadow.radius = 5; s.shadow.camera.near = 0.5; s.shadow.camera.far = 30; S.add(s, s.target); s.target.position.set(0, 0.6, 0); return s; };
    const s1 = spot(0.42), s2 = spot(0.36); s2.position.set(0, 5.25, 0);
    const dirH = V3(-0.6, 0, 0.8), RL = 4.5, CC = V3(0, 0.75, 0);
    return (t) => {
      const ft = o.T0 + t;
      const sw = seg(ft, 504.96, 506.8), phi = lerp(90, 6, sw) * PI / 180;
      s1.position.copy(CC).addScaledVector(dirH, RL * Math.cos(phi)).add(V3(0, RL * Math.sin(phi), 0));
      s1.target.position.set(lerp(0, 0.9, sw), lerp(0.4, 0.7, sw), lerp(0, -1.2, sw));
      s1.intensity = 5.5 * seg(ft, 501.54, 502.2);
      s2.intensity = 5.0 * seg(ft, 508.42, 509.3);
      key.intensity = lerp(0.9, 0.4, seg(ft, 501.54, 502.2));
      // shadow centre on the wall (can centre projected along the light)
      const L = s1.position, d = CC.clone().sub(L), wk = (WZ - L.z) / d.z, wc = L.clone().addScaledVector(d, wk);
      const az = KF([[499.74, 30], [501.54, 25], [504.96, 16], [508.42, 34], [511.26, 50]], ft);
      const el = KF([[499.74, 15], [501.54, 22], [503.6, 50], [504.96, 46], [507.2, 18], [508.42, 22], [511.26, 34]], ft);
      const dist = KF([[499.74, 7.2], [501.54, 6.3], [504.96, 6.0], [508.42, 7.8], [511.26, 8.4]], ft);
      const tx = KF([[505.5, 0], [507.5, 0.6], [508.42, 0.55], [510.8, 0.1]], ft);
      orbit(C, tx, KF([[504.96, 0.45], [507.5, 0.8], [508.42, 0.8], [510.8, 0.3]], ft), KF([[505.5, 0], [507.5, -0.5]], ft), dist, az, el);
      return [S, C, [
        ["circle", R * 1.15, 0.01, R * 0.8, win(ft, 502.6, 505.0)],
        ["rectangle", wc.x + 0.55, wc.y + 0.6, WZ + 0.01, win(ft, 506.5, 508.4)],
      ]];
    };
  };

  // =====================================================================  brane
  LABK.brane = (o) => {
    const S = stage("void", { seed: 61, dust: 800, key: 1.8 }), C = cam(32);
    const edge = canvasTex(256, 256, (g, w, h) => { const im = g.createImageData(w, h); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const ex = Math.min(x, w - 1 - x) / (w * 0.22), ey = Math.min(y, h - 1 - y) / (h * 0.22), a = smooth(Math.min(ex, ey)) * 255, i = (y * w + x) * 4; im.data[i] = im.data[i + 1] = im.data[i + 2] = a; im.data[i + 3] = 255; } g.putImageData(im, 0, 0); });
    edge.colorSpace = THREE.NoColorSpace;
    // frosted sheet with a fine woven grid (one tile = one unit) so the undulation reads
    const gridT = canvasTex(128, 128, (g, w, h) => { g.fillStyle = "rgba(205,214,226,0.16)"; g.fillRect(0, 0, w, h); g.fillStyle = "rgba(235,240,248,0.55)"; g.fillRect(0, 0, w, 2); g.fillRect(0, 0, 2, h); });
    gridT.wrapS = gridT.wrapT = THREE.RepeatWrapping; gridT.repeat.set(18, 11); gridT.anisotropy = 8;
    const sheet = (ph) => {
      const g = new THREE.PlaneGeometry(18, 11, 108, 66); g.rotateX(-PI / 2);
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xc9d3de, map: gridT, roughness: 0.55, metalness: 0, transparent: true, opacity: 0.9, alphaMap: edge, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 0.6 }));
      m.userData = { ph, base: g.attributes.position.array.slice() }; S.add(m); return m;
    };
    const hgt = (x, z, ft, ph) => 0.28 * Math.sin(0.33 * x + 0.5 * ft + ph) + 0.2 * Math.sin(0.41 * z - 0.37 * ft + 1 + ph) + 0.1 * Math.sin(0.6 * (x + z) + 0.8 * ft);
    const upd = (m, y0, ft) => { const a = m.geometry.attributes.position.array, b = m.userData.base; for (let i = 0; i < a.length; i += 3) a[i + 1] = y0 + hgt(b[i], b[i + 2], ft, m.userData.ph); m.geometry.attributes.position.needsUpdate = true; m.geometry.computeVertexNormals(); };
    const lo = sheet(0), hi = sheet(2.1);
    const st = { ft: 0, yHi: 6 }, strM = M.light(P.string, 1), strHi = M.light(P.string, 0);
    const endG = new THREE.SphereGeometry(0.035, 12, 8), rr = rnd(42);
    const arcs = [];
    const mkArc = (upper) => {
      const a = { ax: (rr() - 0.5) * 9, az: (rr() - 0.5) * 4.5, L: 0.9 + rr() * 0.8, H: 0.5 + rr() * 0.35, ph: rr() * TAU, ps: 0.12 + rr() * 0.12, upper };
      const ends = (ft) => {
        const cx = a.ax + 1.3 * Math.sin(a.ps * ft + a.ph), cz = a.az + 0.9 * Math.cos(a.ps * 0.8 * ft + a.ph), ang = a.ph + 0.15 * ft;
        const dx = Math.cos(ang) * a.L / 2, dz = Math.sin(ang) * a.L / 2; return [cx - dx, cz - dz, cx + dx, cz + dz];
      };
      const mat = upper ? strHi : strM, sgn = upper ? -1 : 1;
      a.m = liveTube((u) => {
        const f = st.ft, e = ends(f), x = lerp(e[0], e[2], u), z = lerp(e[1], e[3], u), y0 = (upper ? st.yHi : 0) + hgt(x, z, f, upper ? 2.1 : 0);
        return V3(x, y0 + sgn * (a.H * Math.sin(PI * u) + 0.08 * Math.sin(TAU * u) * Math.sin(6 * f + a.ph)), z + 0.05 * Math.sin(PI * u) * Math.cos(5 * f + a.ph));
      }, 48, 0.02, mat);
      a.e = [new THREE.Mesh(endG, mat), new THREE.Mesh(endG, mat)];
      a.place = (ft) => { const e = ends(ft), y = upper ? st.yHi : 0; a.e[0].position.set(e[0], y + hgt(e[0], e[1], ft, upper ? 2.1 : 0), e[1]); a.e[1].position.set(e[2], y + hgt(e[2], e[3], ft, upper ? 2.1 : 0), e[3]); };
      S.add(a.m, a.e[0], a.e[1]); arcs.push(a); return a;
    };
    for (let i = 0; i < 5; i++) mkArc(false);
    for (let i = 0; i < 2; i++) mkArc(true);
    const loops = [0, 1, 2].map((i) => {
      const L = { x: (rr() - 0.5) * 8, y: 1.3 + rr() * 1.2, z: (rr() - 0.5) * 4, r: 0.28 + rr() * 0.15, ph: rr() * TAU };
      L.m = liveTube((u) => { const th = TAU * u, f = st.ft, rad = L.r * (1 + 0.1 * Math.sin(3 * th + 4 * f + L.ph)); return V3(rad * Math.cos(th), rad * Math.sin(th), 0.04 * Math.sin(2 * th - 3 * f)); }, 56, 0.018, strM, true);
      S.add(L.m); return L;
    });
    return (t) => {
      const ft = o.T0 + t; st.ft = ft;
      const up = seg(ft, 518.38, 520.6); st.yHi = lerp(7, 3.4, up);
      upd(lo, 0, ft); upd(hi, st.yHi, ft); hi.visible = up > 0.01; hi.material.opacity = 0.38 * up; strHi.opacity = up;
      arcs.forEach((a) => { a.place(ft); a.m.visible = a.e[0].visible = a.e[1].visible = !a.upper || up > 0.01; });
      loops.forEach((L, i) => { L.m.position.set(L.x + 0.9 * Math.sin(0.07 * ft + L.ph), L.y + 0.25 * Math.sin(0.3 * ft + L.ph) + 0.9 * up * (i % 2), L.z + 0.6 * Math.cos(0.05 * ft + L.ph)); L.m.rotation.set(0.4 * ft * 0.3 + L.ph, 0.25 * ft + L.ph, 0); });
      const tgtY = lerp(0.5, 1.7, up);
      const dist = KF([[511.26, 15.5], [518.38, 16.5], [520.8, 19], [528.44, 20], [533.0, 27]], ft);
      orbit(C, 0, tgtY, 0, dist, lerp(-28, 6, t / 21.74), KF([[511.26, 26], [518.38, 28], [521, 22], [528.44, 22], [533, 26]], ft));
      const a0 = arcs[1], e = [a0.e[0].position, a0.e[1].position], apex = e[0].clone().add(e[1]).multiplyScalar(0.5); apex.y += a0.H;
      return [S, C, [
        ["11 dimensions", -0.5, hgt(-0.5, 3, ft, 0), 3, win(ft, 514.76, 518.3)],
        ["membrane", -3.5, st.yHi + hgt(-3.5, 1.5, ft, 2.1), 1.5, win(ft, 519.8, 523.4)],
        ["string", apex.x, apex.y, apex.z, win(ft, 523.5, 527.4)],
      ]];
    };
  };

  // =====================================================================  puzzle
  LABK.puzzle = (o) => {
    const S = stage("studio", { floorY: -8, key: 2.4 }), C = cam(30);
    const key = S.userData.key; key.position.set(-6, 12, 7);
    const r = rnd(8);
    const wood = canvasTex(2048, 1024, (g, w, h) => {
      g.fillStyle = "#3f2c1f"; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 520; i++) { const y0 = r() * h, a = 2 + r() * 10, f = 0.002 + r() * 0.004, ph = r() * TAU, v = r(); g.strokeStyle = `rgba(${v < 0.5 ? "28,18,11" : "96,70,48"},${0.12 + r() * 0.25})`; g.lineWidth = 0.6 + r() * 2.4; g.beginPath(); for (let x = 0; x <= w; x += 16) g.lineTo(x, y0 + a * Math.sin(x * f + ph) + 3 * Math.sin(x * f * 5.3 + ph)); g.stroke(); }
    });
    wood.wrapS = wood.wrapT = THREE.RepeatWrapping; wood.repeat.set(2, 2); wood.offset.set(0.5, 0); wood.anisotropy = 8;   // tile seams at x = ±15, out of view
    const table = new THREE.Mesh(new THREE.BoxGeometry(60, 0.5, 40), new THREE.MeshStandardMaterial({ map: wood, roughness: 0.62, envMapIntensity: 0.5 }));
    table.position.y = -0.25; table.receiveShadow = true; S.add(table);
    // puzzle: 12 x 8 pieces, only the border assembled
    const NX = 12, NY = 8, SZ = 0.9, WT = NX * SZ, HT = NY * SZ;
    const art = canvasTex(1536, 1024, (g, w, h) => {
      const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#8b97a3"); gr.addColorStop(0.55, "#a8a495"); gr.addColorStop(1, "#7d7262"); g.fillStyle = gr; g.fillRect(0, 0, w, h);
      for (let i = 0; i < 260; i++) { const x = r() * w, y = r() * h, rad = 20 + r() * 120, v = r(); const rg = g.createRadialGradient(x, y, 0, x, y, rad); rg.addColorStop(0, v < 0.5 ? "rgba(60,70,82,.16)" : "rgba(214,204,180,.16)"); rg.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = rg; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
      g.strokeStyle = "rgba(50,46,40,.18)"; g.lineWidth = 1.2; for (let i = 0; i < 70; i++) { g.beginPath(); const y = r() * h; for (let x = 0; x <= w; x += 24) g.lineTo(x, y + 18 * Math.sin(x * 0.006 + i)); g.stroke(); }
    });
    art.repeat.set(1 / WT, 1 / HT); art.offset.set(0.5, 0.5);
    const capM = new THREE.MeshStandardMaterial({ map: art, roughness: 0.88 }), sideM = new THREE.MeshStandardMaterial({ color: 0x8e877b, roughness: 0.95 });
    const sg = () => (r() < 0.5 ? -1 : 1);
    const vE = [], hE = [];
    for (let i = 0; i <= NX; i++) { vE[i] = []; hE[i] = []; for (let j = 0; j <= NY; j++) { vE[i][j] = sg(); hE[i][j] = sg(); } }
    const edgeTo = (sh, x0, y0, x1, y1, s) => {
      if (!s) { sh.lineTo(x1, y1); return; }
      const dx = x1 - x0, dy = y1 - y0, nx = dy * s, ny = -dx * s, Pt = (a, b) => [x0 + dx * a + nx * b, y0 + dy * a + ny * b];
      sh.lineTo(...Pt(0.36, 0));
      sh.bezierCurveTo(...Pt(0.42, 0.03), ...Pt(0.27, 0.23), ...Pt(0.5, 0.24));
      sh.bezierCurveTo(...Pt(0.73, 0.23), ...Pt(0.58, 0.03), ...Pt(0.64, 0));
      sh.lineTo(x1, y1);
    };
    const ext = { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelOffset: -0.014, bevelSegments: 2, curveSegments: 10 };
    for (let i = 0; i < NX; i++) for (let j = 0; j < NY; j++) {
      if (!(i === 0 || j === 0 || i === NX - 1 || j === NY - 1)) continue;
      const x0 = i * SZ - WT / 2, y0 = j * SZ - HT / 2, x1 = x0 + SZ, y1 = y0 + SZ, sh = new THREE.Shape();
      sh.moveTo(x0, y0);
      edgeTo(sh, x0, y0, x1, y0, j === 0 ? 0 : -hE[i][j]);
      edgeTo(sh, x1, y0, x1, y1, i === NX - 1 ? 0 : vE[i + 1][j]);
      edgeTo(sh, x1, y1, x0, y1, j === NY - 1 ? 0 : hE[i][j + 1]);
      edgeTo(sh, x0, y1, x0, y0, i === 0 ? 0 : -vE[i][j]);
      const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, ext), [capM, sideM]);
      m.rotation.x = -PI / 2; m.position.set((r() - 0.5) * 0.012, 0.012, (r() - 0.5) * 0.012); m.rotation.z = (r() - 0.5) * 0.008;
      m.castShadow = m.receiveShadow = true; S.add(m);
    }
    return (t) => {
      const ft = o.T0 + t;
      const A = orb(0, 0, 0.4, lerp(14, 11.2, seg(ft, 533, 539.5)), lerp(-40, -24, (ft - 533) / 6.5), lerp(34, 27, (ft - 533) / 6.5));
      const gx = lerp(-4.8, 3.4, seg(ft, 538.0, 543.8)), G = { p: V3(gx - 2.1, 1.3, HT / 2 + 2.3), t: V3(gx + 0.6, 0.05, HT / 2 - 0.5) };
      const T = { p: V3(-0.4, lerp(14.2, 15.2, seg(ft, 543.3, 545.6)), 2.3), t: V3(-0.4, 0, -0.15) };
      const k1 = seg(ft, 537.4, 539.6), k2 = seg(ft, 543.1, 545.4);
      const AB = { p: new THREE.Vector3().lerpVectors(A.p, G.p, k1), t: new THREE.Vector3().lerpVectors(A.t, G.t, k1) };
      mixCam(C, AB, T, k2);
      return [S, C, [["edges and corners", WT / 2 - 0.45, 0.08, HT / 2 - 0.45, win(ft, 541.5, 543.6)]]];
    };
  };
})();
