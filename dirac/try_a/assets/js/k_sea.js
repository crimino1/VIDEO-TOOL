/* k_sea.js — group C of "The Dirac Equation": LABK.sea, the Dirac sea as an endless dark cinema.
   One cinema world is built once (lazily) and shared by every sea shot; each frame starts with base(), which resets every
   mutable thing (lights, fog, props, touched instances), so a frame is a pure function of t.
   Units: 1 = 1 m. The zero line is the curved front edge of a dark wooden stage at y = 0 (radius 6 around O = (0, 0, OZ)).
   Rows of velvet seats circle O and step DOWN away from the stage (-z), facing it; one electron sits in every seat.
   Shared props (electron, positron, proton, antiproton, halo, balance) come from window.X3; X3 materials are never mutated
   (fades use .clone()). */
(() => {
  const { THREE, M, seg, smooth, lerp, clamp, KF } = L3;
  const V = (x, y, z) => new THREE.Vector3(x, y, z);

  // ---- beat table, FILM seconds (drives the animation; this is the sound designer's EVENT TIMES list)
  const EV = {
    twinsWarm: [66.2, 68.6],                       // the reflection warms into the ivory positron twin
    pauliTouch: 533.3,                             // intruder reaches the taken seat and is held off
    cantTry: [552.0, 554.0], cantTry2: [554.4, 555.6], cantUp: [555.6, 557.0],
    knockFlash: 565.5, knockRise: [565.8, 568.0], knockHole: 570.3,
    hop0: 584.5, hopDt: 0.95, hopLen: 0.62,        // 7 hops: hop k starts at hop0 + k*hopDt
    pour: [615.8, 619.0], level: 619.5,
    fallGo: 625.8, annihilate: 629.0,
    hFlash: [635.3, 636.05, 636.75, 637.4, 638.0],
    leapForm: [640.6, 642.4], leapRise: [642.4, 645.4],
    apFade: [655.9, 657.9],
    dim: [868.8, 876.5],
  };

  // ---- cinema geometry
  const OZ = 6, STAGE_R = 6, R0 = 7.25, DR = 0.95, RISE = 0.4, Y0 = -0.95, NR = 46, A = 0.7, SW = 0.56, AIS = 0.33, AISW = 0.56;
  const ER = 0.2, EY = 0.665, EZ = 0.06;           // electron radius and its seat-local centre (sitting on the cushion)
  const rowR = (r) => R0 + r * DR, rowY = (r) => Y0 - r * RISE;

  // merge [geometry, materialIndex] parts into one geometry with one group per material
  function merge(parts, nMat) {
    const P = [], N = [], U = [], g = new THREE.BufferGeometry();
    for (let m = 0; m < nMat; m++) {
      const s = P.length / 3;
      for (const [geo, mi] of parts) {
        if (mi !== m) continue;
        const q = geo.index ? geo.toNonIndexed() : geo, p = q.attributes.position.array, n = q.attributes.normal.array, u = q.attributes.uv ? q.attributes.uv.array : null;
        for (let i = 0; i < p.length; i++) { P.push(p[i]); N.push(n[i]); }
        for (let i = 0; i < p.length / 3 * 2; i++) U.push(u ? u[i] : 0);
      }
      g.addGroup(s, P.length / 3 - s, m);
    }
    g.setAttribute("position", new THREE.Float32BufferAttribute(P, 3));
    g.setAttribute("normal", new THREE.Float32BufferAttribute(N, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(U, 2));
    return g;
  }
  const box = (w, h, d, x, y, z, sx, sy, sz) => { const g = new THREE.BoxGeometry(w, h, d, sx || 1, sy || 1, sz || 1); g.translate(x, y, z); return g; };

  // one cinema seat, local frame: floor at y = 0, facing +z. groups: 0 velvet, 1 wood, 2 iron, 3 brass
  function seatGeo() {
    const cush = new THREE.BoxGeometry(0.48, 0.12, 0.46, 10, 2, 10), p = cush.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i) / 0.24, z = p.getZ(i) / 0.23, y = p.getY(i);
      const b = Math.max(0, 1 - x * x) * Math.max(0, 1 - z * z);
      if (y > 0) p.setY(i, y + 0.035 * b - 0.012 * (x * x * x * x)); else p.setY(i, y - 0.01 * b);
      if (y > 0 && z > 0.7) p.setY(i, p.getY(i) - 0.02 * (z - 0.7) / 0.3);   // rolled front edge
    }
    cush.computeVertexNormals(); cush.translate(0, 0.41, 0.05);
    const back = new THREE.BoxGeometry(0.5, 0.4, 0.1, 24, 10, 1), q = back.attributes.position;
    for (let i = 0; i < q.count; i++) {
      const x = q.getX(i) / 0.25, y = q.getY(i) / 0.2, z = q.getZ(i);
      if (z > 0) {
        const pil = Math.sqrt(Math.max(0, 1 - x * x)) * Math.sqrt(Math.max(0, 1 - 0.7 * y * y));
        const pleat = Math.pow(Math.abs(Math.cos(x * Math.PI * 2)), 0.6);                 // four vertical channels
        q.setZ(i, z + 0.04 * pil * (0.55 + 0.45 * pleat));
      } else q.setZ(i, z - 0.012 * Math.max(0, 1 - x * x));
      if (y > 0.8) q.setY(i, q.getY(i) - 0.02 * x * x);                                   // softened top corners
    }
    back.computeVertexNormals(); back.rotateX(-0.1); back.translate(0, 0.61, -0.2);
    const parts = [[cush, 0], [back, 0]];
    for (const sx of [-1, 1]) {
      parts.push([box(0.03, 0.045, 0.4, sx * 0.265, 0.64, 0.02), 1]);
      parts.push([box(0.026, 0.62, 0.36, sx * 0.265, 0.31, -0.03), 2]);
      parts.push([box(0.031, 0.05, 0.016, sx * 0.265, 0.64, 0.226), 3]);                  // brass armrest caps
    }
    parts.push([box(0.09, 0.034, 0.008, 0, 0.375, 0.282), 3]);                             // brass number plaque
    parts.push([box(0.46, 0.05, 0.06, 0, 0.12, -0.18), 2]);                                // under-seat rail
    return merge(parts, 4);
  }

  let W = null;
  function world() {
    if (W) return W;
    const S = new THREE.Scene();
    const mkEnv = (k) => {
      const e = new THREE.Scene(), bx = (w, h, x, y, z, c) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); e.add(m); };
      e.add(new THREE.Mesh(new THREE.SphereGeometry(50, 32, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(0x0b0909).multiplyScalar(k), side: THREE.BackSide })));
      bx(30, 16, 4, 30, 18, new THREE.Color(2.2 * k, 1.8 * k, 1.4 * k)); bx(40, 5, 0, 6, -40, new THREE.Color(0.35, 0.4, 0.5)); bx(14, 10, -30, 10, 10, new THREE.Color(0.5 * k, 0.42 * k, 0.34 * k));
      const pm = new THREE.PMREMGenerator(L3.R), tx = pm.fromScene(e, 0.03).texture; pm.dispose(); return tx;
    };
    const envN = mkEnv(0.55), envD = mkEnv(0.18);
    S.environment = envN;
    const BG = 0x0a0809; S.background = new THREE.Color(BG); S.fog = new THREE.Fog(BG, 8, 40);

    // ---- materials
    const velTex = L3.canvasTex(256, 256, (c, w, h) => {
      c.fillStyle = "#e9e9e9"; c.fillRect(0, 0, w, h); const r = L3.rnd(31);
      for (let i = 0; i < 900; i++) { const v = 200 + Math.floor(r() * 55); c.fillStyle = `rgba(${v},${v},${v},0.25)`; c.beginPath(); c.arc(r() * w, r() * h, 3 + r() * 14, 0, 7); c.fill(); }
    });
    velTex.wrapS = velTex.wrapT = THREE.RepeatWrapping;
    const velvet = new THREE.MeshPhysicalMaterial({ color: 0x5a0d18, map: velTex, roughness: 0.8, metalness: 0, sheen: 1, sheenRoughness: 0.38, sheenColor: new THREE.Color(0xa8424c), envMapIntensity: 0.25 });
    const wood = new THREE.MeshStandardMaterial({ color: 0x3e2617, roughness: 0.38, metalness: 0, envMapIntensity: 0.7 });
    const iron = new THREE.MeshStandardMaterial({ color: 0x1c1b1d, roughness: 0.45, metalness: 0.7, envMapIntensity: 0.6 });
    const brass = X3.mats.brass;
    const carpet = new THREE.MeshStandardMaterial({ color: 0x241417, roughness: 1, metalness: 0, envMapIntensity: 0.12 });
    const plankTex = L3.canvasTex(1024, 1024, (c, w, h) => {
      const r = L3.rnd(77); c.fillStyle = "#3a281c"; c.fillRect(0, 0, w, h);
      for (let k = 0; k < 16; k++) {
        const y0 = k * 64, tone = 46 + Math.floor(r() * 18); c.fillStyle = `rgb(${tone + 10},${tone - 4},${tone - 18})`; c.fillRect(0, y0, w, 62);
        for (let i = 0; i < 40; i++) { c.strokeStyle = `rgba(20,10,4,${0.08 + r() * 0.12})`; c.lineWidth = 1 + r() * 2; c.beginPath(); const yy = y0 + r() * 62; c.moveTo(0, yy); c.bezierCurveTo(w * 0.3, yy + (r() - 0.5) * 8, w * 0.7, yy + (r() - 0.5) * 8, w, yy + (r() - 0.5) * 6); c.stroke(); }
        c.fillStyle = "rgba(8,4,2,.8)"; c.fillRect(0, y0 + 62, w, 2); c.fillRect(Math.floor(r() * w), y0, 2, 62);
      }
    });
    plankTex.wrapS = plankTex.wrapT = THREE.RepeatWrapping; plankTex.repeat.set(3, 3);
    const stageMat = new THREE.MeshStandardMaterial({ map: plankTex, color: 0x9a8a80, roughness: 0.55, metalness: 0, envMapIntensity: 0.25 });
    const apronMat = new THREE.MeshStandardMaterial({ color: 0x120c0a, roughness: 0.7, envMapIntensity: 0.3 });

    // ---- seats + electrons (instanced)
    const seats = [], rows = [];
    for (let r = 0; r < NR; r++) {
      const R = rowR(r), list = [], add = (arc) => { list.push(seats.length); seats.push({ r, phi: arc / R, R, y: rowY(r) }); };
      // centre block centred; side blocks start at the aisle edge and run outward (straight aisles, ragged outer ends)
      const half = AIS * R - AISW, nc = Math.floor(2 * half / SW);
      for (let k = 0; k < nc; k++) add(-half + SW / 2 + (2 * half - nc * SW) / 2 + k * SW);
      for (const sx of [-1, 1]) { const a0 = AIS * R + AISW, ns = Math.floor((A * R - a0) / SW); for (let k = 0; k < ns; k++) add(sx * (a0 + SW / 2 + k * SW)); }
      list.sort((a, b) => seats[a].phi - seats[b].phi);
      rows.push(list);
    }
    const NS = seats.length;
    const seatG = seatGeo();
    const seatI = new THREE.InstancedMesh(seatG, [velvet, wood, iron, brass], NS);
    const eGeo = new THREE.SphereGeometry(1, 26, 16);
    const crowd = new THREE.InstancedMesh(eGeo, X3.mats.electron, NS);
    const m4 = new THREE.Matrix4(), qY = new THREE.Quaternion(), one = V(1, 1, 1), up = V(0, 1, 0);
    const seatPos = (s) => V(s.R * Math.sin(s.phi), s.y, OZ - s.R * Math.cos(s.phi));
    const toWorld = (s, lx, ly, lz) => { const c = Math.cos(-s.phi), sn = Math.sin(-s.phi), p = seatPos(s); return V(p.x + lx * c + lz * sn, p.y + ly, p.z - lx * sn + lz * c); };
    const ePos = seats.map((s) => toWorld(s, 0, EY, EZ));
    for (let i = 0; i < NS; i++) {
      const s = seats[i]; qY.setFromAxisAngle(up, -s.phi);
      m4.compose(seatPos(s), qY, one); seatI.setMatrixAt(i, m4);
      m4.compose(ePos[i], qY, V(ER, ER, ER)); crowd.setMatrixAt(i, m4);
    }
    seatI.castShadow = seatI.receiveShadow = true; crowd.castShadow = true; crowd.receiveShadow = true;
    S.add(seatI, crowd);
    const crowdBase = crowd.instanceMatrix.array.slice(), dirty = new Set();
    const setE = (i, p, sc) => { m4.compose(p, qY.identity(), V(sc, sc, sc)); crowd.setMatrixAt(i, m4); dirty.add(i); crowd.instanceMatrix.needsUpdate = true; };
    const resetCrowd = () => { if (!dirty.size) return; for (const i of dirty) for (let k = 0; k < 16; k++) crowd.instanceMatrix.array[i * 16 + k] = crowdBase[i * 16 + k]; dirty.clear(); crowd.instanceMatrix.needsUpdate = true; };
    const seatNear = (r, phi) => rows[r].reduce((b, i) => (Math.abs(seats[i].phi - phi) < Math.abs(seats[b].phi - phi) ? i : b), rows[r][0]);

    // hero brass plaques with real engraved numbers on the front rows' centre block (close-ups)
    const plaqueGeo = new THREE.PlaneGeometry(0.086, 0.031);
    for (let r = 0; r < 4; r++) {
      const list = rows[r];
      list.forEach((i, k) => {
        const s = seats[i]; if (Math.abs(s.phi) > 0.3) return;
        const num = String(k + 1);
        const tx = L3.canvasTex(192, 72, (c, w, h) => {
          const g = c.createLinearGradient(0, 0, 0, h); g.addColorStop(0, "#d8bd7c"); g.addColorStop(1, "#9c7f45"); c.fillStyle = g; c.fillRect(0, 0, w, h);
          c.font = "bold 54px Georgia, serif"; c.textAlign = "center"; c.textBaseline = "middle";
          c.fillStyle = "rgba(255,240,200,.55)"; c.fillText(num, w / 2 + 1, h / 2 + 3); c.fillStyle = "#2b1d0c"; c.fillText(num, w / 2, h / 2 + 1);
        });
        const pm = new THREE.Mesh(plaqueGeo, new THREE.MeshStandardMaterial({ map: tx, metalness: 0.85, roughness: 0.32, envMapIntensity: 1 }));
        pm.position.copy(toWorld(s, 0, 0.375, 0.2875)); pm.rotation.y = -s.phi; S.add(pm);
      });
    }

    // ---- floor treads (one merged carpet geometry)
    const treadParts = [];
    for (let r = 0; r < NR; r++) {
      const R = rowR(r), a = A + 0.06;
      const g = new THREE.RingGeometry(R - DR / 2, R + DR / 2, 96, 1, Math.PI / 2 - a, 2 * a); g.rotateX(-Math.PI / 2); g.translate(0, rowY(r), OZ); treadParts.push([g, 0]);
      const rz = new THREE.CylinderGeometry(R - DR / 2, R - DR / 2, RISE, 96, 1, true, Math.PI - a, 2 * a); rz.translate(0, rowY(r) + RISE / 2, OZ); treadParts.push([rz, 0]);
    }
    const treads = new THREE.Mesh(merge(treadParts, 1), carpet); treads.material = carpet; treads.receiveShadow = true;
    treads.geometry.clearGroups(); S.add(treads);
    // side walls of the hall: dark velvet drapes beyond the seat block, to frame the darkness
    const drapeMat = new THREE.MeshStandardMaterial({ color: 0x1a0709, roughness: 0.9, envMapIntensity: 0.1, side: THREE.DoubleSide });
    for (const sx of [-1, 1]) {
      const gg = new THREE.PlaneGeometry(58, 30, 120, 1), p = gg.attributes.position;
      for (let i = 0; i < p.count; i++) p.setZ(i, 0.12 * Math.sin(p.getX(i) * 9));
      gg.computeVertexNormals();
      const ang = sx * (A + 0.1), d = new THREE.Mesh(gg, drapeMat);
      d.position.set(Math.sin(ang) * 38, -8, OZ - Math.cos(ang) * 38); d.rotation.y = Math.PI / 2 - ang; S.add(d);
    }

    // aisle lamps: small warm lamps low on the aisle-end standards, receding into the dark
    const lampPts = [];
    for (let r = 0; r < NR; r++) for (const sx of [-1, 1]) for (const side of [-1, 1]) {
      const R = rowR(r), phi = sx * AIS + side * (AISW - 0.02) / R;
      if (side === 1 && sx === 1) continue; if (side === -1 && sx === -1) continue;   // one lamp per aisle per row
      lampPts.push(V(R * Math.sin(phi), rowY(r) + 0.16, OZ - R * Math.cos(phi) + 0.0));
    }
    const lampI = new THREE.InstancedMesh(new THREE.BoxGeometry(0.05, 0.03, 0.05), M.light(0xffc988, 1), lampPts.length);
    lampPts.forEach((p, i) => { m4.makeTranslation(p.x, p.y, p.z); lampI.setMatrixAt(i, m4); }); S.add(lampI);
    const glowTex = L3.canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
    const lampGlowG = new THREE.BufferGeometry().setFromPoints(lampPts);
    const lampGlowM = new THREE.PointsMaterial({ map: glowTex, color: 0xffb870, size: 0.55, sizeAttenuation: true, transparent: true, opacity: 0.45, depthWrite: false, blending: THREE.AdditiveBlending });
    S.add(new THREE.Points(lampGlowG, lampGlowM));

    // ---- stage (above the zero line): dark oak deck, brass nosing, warm inlay strip = the zero line
    const deck = new THREE.Mesh(new THREE.CylinderGeometry(STAGE_R, STAGE_R, 0.3, 160), stageMat); deck.position.set(0, -0.15, OZ); deck.receiveShadow = true; S.add(deck);
    const nose = new THREE.Mesh(new THREE.CylinderGeometry(STAGE_R + 0.012, STAGE_R + 0.012, 0.05, 160, 1, true), brass); nose.position.set(0, -0.025, OZ); S.add(nose);
    const apron = new THREE.Mesh(new THREE.CylinderGeometry(STAGE_R, STAGE_R, -Y0 - 0.3 + 0.02, 160, 1, true), apronMat); apron.position.set(0, (Y0 - 0.3) / 2, OZ); S.add(apron);
    const AL = A + 0.25;
    const lineG = new THREE.TorusGeometry(STAGE_R - 0.05, 0.011, 6, 200, 2 * AL); lineG.rotateX(-Math.PI / 2); lineG.rotateY(Math.PI / 2 - AL); lineG.translate(0, 0.004, OZ);
    const lineMat = M.light(0xffd9a6, 0.95); const zeroLine = new THREE.Mesh(lineG, lineMat); S.add(zeroLine);
    const lineGlowPts = []; for (let i = 0; i <= 120; i++) { const ph = -AL + 2 * AL * i / 120; lineGlowPts.push(V((STAGE_R - 0.05) * Math.sin(ph), 0.01, OZ - (STAGE_R - 0.05) * Math.cos(ph))); }
    const lineGlowM = new THREE.PointsMaterial({ map: glowTex, color: 0xffc98c, size: 0.5, transparent: true, opacity: 0.22, depthWrite: false, blending: THREE.AdditiveBlending });
    S.add(new THREE.Points(new THREE.BufferGeometry().setFromPoints(lineGlowPts), lineGlowM));
    const zeroAt = (phi) => V((STAGE_R - 0.05) * Math.sin(phi), 0.004, OZ - (STAGE_R - 0.05) * Math.cos(phi));

    // dust motes in the open air above the line
    const dr = L3.rnd(91), dp = [];
    for (let i = 0; i < 500; i++) dp.push(V((dr() - 0.5) * 14, dr() * 5 + 0.1, (dr() - 0.5) * 10 - 1));
    const dustM = new THREE.PointsMaterial({ map: glowTex, color: 0xd9c4a4, size: 0.035, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending });
    const dust = new THREE.Points(new THREE.BufferGeometry().setFromPoints(dp), dustM); S.add(dust);

    // ---- lights
    const hemi = new THREE.HemisphereLight(0x7a8cab, 0x0c0808, 0.3); S.add(hemi);
    const key = new THREE.SpotLight(0xfff0e2, 1, 0, 0.62, 1, 2); key.position.set(2.5, 14, 7); key.target.position.set(0.6, -4, -7);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0003; key.shadow.normalBias = 0.02; key.shadow.camera.near = 5; key.shadow.camera.far = 70;
    S.add(key, key.target);
    const foot = new THREE.SpotLight(0xffe0c0, 1, 12, 1.1, 1, 2); foot.position.set(0, -0.08, -0.15); foot.target.position.set(0, -2.4, -4); S.add(foot, foot.target);
    const rim = new THREE.DirectionalLight(0xc4d0e4, 1); rim.position.set(-4, 10, -40); rim.target.position.set(0, -6, 0); S.add(rim, rim.target);
    const hero = new THREE.SpotLight(0xe9eef5, 0, 0, 0.35, 0.85, 2); hero.castShadow = true; hero.shadow.mapSize.set(2048, 2048); hero.shadow.bias = -0.0002; hero.shadow.normalBias = 0.01; hero.shadow.camera.near = 1; hero.shadow.camera.far = 30;
    S.add(hero, hero.target);
    const camL = new THREE.PointLight(0xffe2c4, 0, 10, 2); S.add(camL);
    const glowL = new THREE.PointLight(0xffd6a0, 0, 2.2, 2); S.add(glowL);

    // ---- hero props
    const heroE = X3.electron(ER), heroE2 = X3.electron(ER), pos1 = X3.positron(ER);
    const holeHalo = X3.halo(0xffdcb0, 0.9, 0), heroHalo = X3.halo(0xfff0dc, 1, 0);
    const protonA = X3.nucleon("p", 0.13), protonHalo = X3.halo(0xffc0a0, 0.8, 0);
    const antiP = X3.antiNucleon(0.3), antiMat = antiP.material.clone(); antiMat.transparent = true; antiP.material = antiMat;
    const protonB = X3.nucleon("p", 0.3);
    S.add(heroE, heroE2, pos1, holeHalo, heroHalo, protonA, protonHalo, antiP, protonB);

    // electron cloud (hydrogen 1s): soft pale-blue haze of points
    const cr = L3.rnd(13), cp = [];
    for (let i = 0; i < 700; i++) { const u = cr() * 2 - 1, th = cr() * Math.PI * 2, q = Math.sqrt(1 - u * u), rr = -Math.log(1 - cr() * 0.97) * 0.16; cp.push(V(q * Math.cos(th) * rr, u * rr, q * Math.sin(th) * rr)); }
    const cloudG = new THREE.BufferGeometry().setFromPoints(cp);
    const mkCloud = (op) => new THREE.Points(cloudG, new THREE.PointsMaterial({ map: glowTex, color: 0xa8c6e6, size: 0.07, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending }));
    const atoms = [];
    for (let k = 0; k < 5; k++) {
      const g = new THREE.Group(), p = X3.nucleon("p", 0.06), c = mkCloud(0.4), h = X3.halo(0xffc6a8, 0.35, 0.25);
      g.add(p, c, h); g.userData = { p, c, h }; S.add(g); atoms.push(g);
    }
    const bigCloud = mkCloud(0.42); bigCloud.scale.setScalar(1.9); S.add(bigCloud);

    // flashes: soft warm-white bloom + two thin gamma beams in opposite directions
    const beamGeo = new THREE.CylinderGeometry(0.008, 0.008, 1, 6, 1, true); beamGeo.translate(0, 0.5, 0);
    function makeFlash() {
      const g = new THREE.Group(), core = X3.halo(0xfff3e0, 1, 0), wide = X3.halo(0xffe2bc, 1, 0), bm = M.light(0xfff6ea, 0);
      const b1 = new THREE.Mesh(beamGeo, bm), b2 = new THREE.Mesh(beamGeo, bm), h1 = X3.halo(0xfff3e0, 0.25, 0), h2 = X3.halo(0xfff3e0, 0.25, 0);
      const L = new THREE.PointLight(0xffe8cc, 0, 6, 2);
      g.add(core, wide, b1, b2, h1, h2, L); S.add(g);
      const qq = new THREE.Quaternion();
      return {
        g, hide() { g.visible = false; L.intensity = 0; },
        set(u, pos, dir, sc, noBeams) {        // u = seconds since the flash
          sc = sc || 1; b1.visible = b2.visible = h1.visible = h2.visible = !noBeams; g.visible = u > -0.05; if (!g.visible) { L.intensity = 0; return; }
          g.position.copy(pos);
          const pk = smooth(u / 0.12) * Math.exp(-Math.max(0, u - 0.12) * 2.2);
          core.material.opacity = 0.9 * pk; core.scale.setScalar(sc * (0.5 + 0.5 * smooth(u / 0.2)));
          wide.material.opacity = 0.35 * pk; wide.scale.setScalar(sc * (1.6 + 1.2 * smooth(u / 0.8)));
          L.intensity = 6 * pk * sc;
          const len = Math.max(0.001, 7 * clamp(u, 0, 3)), bo = u < 0 ? 0 : 0.85 * smooth(u / 0.06) * (1 - seg(u, 0.9, 2.2));
          bm.opacity = bo; qq.setFromUnitVectors(V(0, 1, 0), dir); b1.quaternion.copy(qq); b1.scale.set(1, len, 1);
          qq.setFromUnitVectors(V(0, 1, 0), dir.clone().negate()); b2.quaternion.copy(qq); b2.scale.set(1, len, 1);
          h1.position.copy(dir).multiplyScalar(len); h2.position.copy(dir).multiplyScalar(-len); h1.material.opacity = h2.material.opacity = 0.7 * bo;
        },
      };
    }
    const flashes = [0, 1, 2, 3, 4].map(makeFlash);

    // ---- the balance on a black lacquer plinth on the stage (mass mode)
    const BAL = V(-1.2, 0, 2.2);
    const balG = new THREE.Group(); balG.position.copy(BAL); S.add(balG);
    const plinth = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.75, 0.6), new THREE.MeshStandardMaterial({ color: 0x0e0d0f, roughness: 0.25, metalness: 0, envMapIntensity: 0.8 }));
    plinth.position.y = 0.375; plinth.castShadow = plinth.receiveShadow = true; balG.add(plinth);
    const bal = X3.balance({ s: 1 }); bal.group.position.y = 0.75; bal.group.rotation.y = Math.PI; balG.add(bal.group);
    bal.group.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    const balProton = X3.nucleon("p", 0.1); balProton.position.y = 0.1; bal.panL.add(balProton);
    const NB = 1836, BR = 0.0072, br = L3.rnd(1836), heap = [];
    while (heap.length < NB) {
      const x = (br() * 2 - 1) * 0.165, z = (br() * 2 - 1) * 0.165, rho = Math.hypot(x, z); if (rho > 0.165) continue;
      const hmax = 0.125 * (1 - (rho / 0.165) ** 2), y = br() * hmax; heap.push(V(x, y + BR, z));
    }
    heap.sort((a, b) => a.y - b.y);
    const landT = heap.map((_, i) => EV.pour[0] + 0.45 + (EV.pour[1] - EV.pour[0] - 0.5) * Math.pow(i / NB, 0.85) + (br() - 0.5) * 0.08);
    const beads = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 8, 6), X3.mats.electron, NB); beads.castShadow = true; bal.panR.add(beads);

    const objs = { heroE, heroE2, pos1, holeHalo, heroHalo, protonA, protonHalo, antiP, protonB, bigCloud, balG };
    function base() {
      resetCrowd(); S.environment = envN;
      for (const k in objs) objs[k].visible = false;
      for (const a of atoms) a.visible = false;
      for (const f of flashes) f.hide();
      key.intensity = 470; foot.intensity = 3; rim.intensity = 0.9; hemi.intensity = 0.55; hero.intensity = 0; hero.angle = 0.35; camL.intensity = 0; camL.distance = 10; glowL.intensity = 0;
      S.fog.near = 8; S.fog.far = 40; lineMat.opacity = 0.95; lineGlowM.opacity = 0.22; lampGlowM.opacity = 0.45; lampI.material.opacity = 1;
      velvet.sheen = 1; dust.visible = true; dustM.opacity = 0.5; antiMat.opacity = 1;
      holeHalo.material.opacity = 0; heroHalo.material.opacity = 0; protonHalo.material.opacity = 0;
      bigCloud.material.opacity = 0.42;
    }
    W = { S, envN, envD, seats, rows, ePos, NS, seatNear, setE, toWorld, zeroAt, base, key, foot, rim, hemi, hero, camL, glowL, lineMat, lineGlowM, lampGlowM, lampI, dust, dustM, velvet,
      heroE, heroE2, pos1, holeHalo, heroHalo, protonA, protonHalo, antiP, antiMat, protonB, atoms, bigCloud, flashes, balG, bal, BAL, heap, landT, beads, NB, BR };
    return W;
  }

  // ---------------------------------------------------------------- helpers for the modes
  const look = (C, p, t) => { C.position.copy(p); C.lookAt(t); };
  const LV = (a, b, u) => V(lerp(a[0], b[0], u), lerp(a[1], b[1], u), lerp(a[2], b[2], u));
  const bob = (ft, k) => 0.012 * Math.sin(ft * 1.7 + k * 2.1);
  // a world point that sits at screen (nx, ny in -1..1) at distance dist, seen from a camera at pos looking at tgt
  const _cm = L3.cam(32);
  const atScreen = (pos, tgt, nx, ny, dist) => { _cm.position.copy(pos); _cm.lookAt(tgt); _cm.updateMatrixWorld(); const v = V(nx, ny, 0.5).unproject(_cm).sub(pos).normalize(); return pos.clone().addScaledVector(v, dist); };
  const aim = (L, p, t) => { L.position.copy(p); L.target.position.copy(t); };

  function holeAt(w, i, ft, amt) {           // warm glow on an empty seat cushion
    const s = w.seats[i], p = w.toWorld(s, 0, 0.55, 0.06);
    w.holeHalo.visible = amt > 0.001; w.holeHalo.position.copy(p); w.holeHalo.material.opacity = 0.55 * amt * (0.92 + 0.08 * Math.sin(ft * 2.3));
    w.holeHalo.scale.setScalar(0.85);
    w.glowL.position.copy(w.toWorld(s, 0, 0.62, 0.22)); w.glowL.intensity = 1.6 * amt;
  }

  // ---------------------------------------------------------------- modes on the shared cinema
  const MODES = {
    // first view: from the stage, over the warm edge, the full house stepping down into the dark
    full(w, C, ft, t, d) {
      const u = smooth(t / d);
      look(C, LV([4.4, 6.4, 5.6], [3.6, 5.8, 4.3], u), LV([-1.6, -4.8, -7.5], [-1.4, -5.2, -7.5], u));
      return [["zero energy", ...w.zeroAt(-0.42).toArray(), seg(t, 0.8, 1.8) * (1 - seg(t, d - 0.6, d))]];
    },
    // close: an electron tries to sit on a seat already taken
    pauli(w, C, ft, t, d) {
      const i = w.seatNear(0, 0.1), s = w.seats[i], e = w.ePos[i];
      const tT = EV.pauliTouch, yTop = e.y + 0.95, yHold = e.y + 2 * ER + 0.035;
      let y;
      if (ft < tT) y = lerp(yTop, yHold, smooth((ft - 531.96) / (tT - 531.96)));
      else y = yHold + 0.07 * Math.sin(Math.min(1, (ft - tT) / 0.5) * Math.PI / 2) * (1 - 0.25 * seg(ft, tT + 0.5, tT + 2)) + bob(ft, 1) * seg(ft, tT + 0.4, tT + 1);
      w.heroE.visible = true; w.heroE.position.set(e.x, y, e.z);
      const uu = smooth(t / d), cam = w.toWorld(s, lerp(-0.1, 0.05, uu), lerp(2.55, 2.4, uu), lerp(2.9, 2.55, uu));
      look(C, cam, w.toWorld(s, -0.5, 0.75, -0.1));
      C.fov = 30; C.updateProjectionMatrix();
      w.hero.intensity = 9; aim(w.hero, w.toWorld(s, 1.2, 2.8, 1.4), V(e.x, e.y + 0.2, e.z));
      return [];
    },
    // crane out over the rows and down the rake, every seat full, into the dark
    fill(w, C, ft, t, d) {
      const u = smooth(t / d), u2 = L3.smoother(t / d);
      const z = lerp(0.6, -19, u2), y = lerp(2.6, -4.4, u2), p = V(lerp(0.6, 1.6, u), y, z);
      look(C, p, V(p.x - 0.6, y - lerp(3.8, 4.0, u), z - lerp(5.2, 5.8, u)));
      // a soft house light travels with the crane from the upper right (the left side falls into shadow)
      const lm = seg(ft, 547.6, 549.0);   // the left drops into shadow for the overlay line
      w.camL.intensity = lerp(26, 34, u) * (1 - lm); w.camL.distance = 12; w.camL.position.set(p.x + lerp(3.2, 4.6, u), y + 0.6, z - 4.6);
      w.hero.intensity = 120 * lm; w.hero.angle = 0.42; aim(w.hero, V(p.x + 4.5, y + 3, z - 1), V(p.x + 1.6, y - 4.4, z - 7.5));
      if (lm > 0.5) w.S.environment = w.envD;
      w.hemi.intensity = lerp(0.55, 0.3, u) * (1 - 0.8 * lm); w.key.intensity = 470 * (1 - 0.7 * lm); w.S.fog.near = lerp(8, 4, u); w.S.fog.far = lerp(40, 21, u);
      return [];
    },
    // an electron above the line tries to drop in; no empty seat, it stays up
    cant(w, C, ft, t, d) {
      const i1 = w.seatNear(1, 0.05), i2 = w.seatNear(2, 0.0), s1 = w.seats[i1], e1 = w.ePos[i1], e2 = w.ePos[i2];
      const p0 = w.toWorld(s1, 0.45, 2.3, 2.3), h1 = V(e1.x, e1.y + 2 * ER + 0.05, e1.z), h2 = V(e2.x, e2.y + 2 * ER + 0.05, e2.z), p3 = w.toWorld(s1, 0.1, 2.0, 1.2);
      let p;
      if (ft < EV.cantTry[1]) p = p0.clone().lerp(h1, smooth((ft - EV.cantTry[0]) / (EV.cantTry[1] - EV.cantTry[0])));
      else if (ft < EV.cantTry2[1]) { const v = smooth((ft - EV.cantTry2[0]) / (EV.cantTry2[1] - EV.cantTry2[0])); p = h1.clone().lerp(h2, v); p.y += Math.sin(v * Math.PI) * 0.45; }
      else p = h2.clone().lerp(p3, smooth((ft - EV.cantUp[0]) / (EV.cantUp[1] - EV.cantUp[0])));
      p.y += bob(ft, 2);
      w.heroE.visible = true; w.heroE.position.copy(p);
      const u = smooth(t / d);
      look(C, w.toWorld(s1, lerp(0.5, 0.2, u), lerp(3.1, 2.85, u), lerp(4.4, 3.9, u)), w.toWorld(s1, -0.25, 0.75, -0.4));
      w.hero.intensity = 10; aim(w.hero, w.toWorld(s1, 1.4, 3.6, 2.0), V(e1.x, e1.y, e1.z - 0.5));
      return [["no empty seat", e2.x, e2.y + ER, e2.z, seg(ft, 554.6, 555.1) * (1 - seg(ft, 556.4, 557.0))]];
    },
    // wide from above: the full sea looks perfectly smooth and uniform
    smooth(w, C, ft, t, d) {
      const u = smooth(t / d);
      look(C, V(lerp(-3, 2, u), 15.5, lerp(-1, -3, u)), V(lerp(-1, 1, u), -6, -16));
      C.fov = 34; C.updateProjectionMatrix();
      w.S.fog.near = 12; w.S.fog.far = 44; w.key.intensity = 1100; w.hemi.intensity = 0.8;
      return [];
    },
    // a warm flash knocks one electron up out of its seat, leaving the empty seat (the hole)
    knock(w, C, ft, t, d) {
      const i = w.seatNear(1, 0.06), e = w.ePos[i];
      const rise = smooth((ft - EV.knockRise[0]) / (EV.knockRise[1] - EV.knockRise[0]));
      const top = V(e.x + 0.15, 1.15, e.z + 0.5);
      const p = e.clone().lerp(top, rise); p.y += Math.sin(rise * Math.PI) * 0.15 + bob(ft, 3) * seg(ft, 567.6, 568.6);
      w.setE(i, e, 0); w.heroE.visible = true; w.heroE.position.copy(p);
      w.flashes[0].set(ft - EV.knockFlash, e, V(0, 1, 0), 0.45, true);   // energy in: a soft bloom, no gamma beams
      holeAt(w, i, ft, seg(ft, EV.knockHole - 0.5, EV.knockHole + 0.4));
      const ty = KF([[564.68, -0.7], [565.8, -0.6], [568.2, 0.25], [569.6, 0.15], [570.6, -0.6]], ft);
      const u = smooth(t / d);
      look(C, V(lerp(4.2, 3.4, u), lerp(1.3, 1.0, u), lerp(1.8, 1.0, u)), V(e.x - 0.2, ty, e.z));
      w.hero.intensity = 26; aim(w.hero, V(2.5, 5, 2.2), V(e.x, e.y, e.z));
      return [["electron", p.x, p.y + ER, p.z, seg(ft, 568.1, 568.6) * (1 - seg(ft, 569.8, 570.3))],
              ["hole", e.x, e.y - 0.05, e.z, seg(ft, 570.6, 571.2) * (1 - seg(ft, 573.5, 574.0))]];
    },
    // the hole travels: neighbours hop seat to seat, the gap rises toward the line like a bubble
    hole(w, C, ft, t, d) {
      const path = [[7, 0.02], [6, 0.06], [5, 0.04], [5, 0.0], [4, 0.03], [3, 0.0], [2, 0.03], [1, 0.06]].map(([r, ph]) => w.seatNear(r, ph));
      const nH = path.length - 1;
      // path[0] starts empty; hop j: the electron of path[j+1] hops into path[j] (it keeps its own instance slot)
      w.setE(path[0], w.ePos[path[0]], 0);
      for (let j = 0; j < nH; j++) {
        const a = EV.hop0 + j * EV.hopDt; if (ft < a) continue;
        const v = smooth(clamp((ft - a) / EV.hopLen, 0, 1)), src = path[j + 1], dst = path[j];
        const p = w.ePos[src].clone().lerp(w.ePos[dst], v); p.y += 4 * v * (1 - v) * (w.seats[src].r !== w.seats[dst].r ? 0.8 : 0.32);
        w.setE(src, p, ER);
      }
      // glow: sits at the current hole, slides to the next one as the neighbour leaves
      const kk = clamp(Math.floor((ft - EV.hop0) / EV.hopDt), -1, nH - 1);
      const hv = kk < 0 ? 0 : smooth(clamp((ft - EV.hop0 - kk * EV.hopDt) / EV.hopLen, 0, 1));
      const from = kk < 0 ? path[0] : path[kk], to = kk < 0 ? path[0] : path[kk + 1];
      const gp = w.toWorld(w.seats[from], 0, 0.55, 0.06).lerp(w.toWorld(w.seats[to], 0, 0.55, 0.06), hv);
      w.holeHalo.visible = true; w.holeHalo.position.copy(gp); w.holeHalo.material.opacity = 0.6 * (0.92 + 0.08 * Math.sin(ft * 2.3)); w.holeHalo.scale.setScalar(0.85);
      w.glowL.position.copy(gp).add(V(0, 0.1, 0.15)); w.glowL.intensity = 1.6;
      const u = smooth(t / d);
      const g0 = w.ePos[path[0]], g1 = w.ePos[path[nH]];
      const tgt = g0.clone().lerp(g1, smooth((ft - EV.hop0 + 0.5) / (nH * EV.hopDt + 0.5)));
      look(C, V(tgt.x + lerp(4.6, 4.0, u), tgt.y + lerp(3.2, 2.8, u), tgt.z + lerp(3.6, 3.2, u)), tgt);
      w.hero.intensity = 30; aim(w.hero, V(3, 6, 2), tgt);
      return [["hole", gp.x, gp.y - 0.1, gp.z, seg(t, 0.6, 1.2) * (1 - seg(ft, 589.4, 590.0))]];
    },
    // a hydrogen-like atom above the line; the hole glows in a seat below — is it a proton?
    proton(w, C, ft, t, d) {
      const i = w.seatNear(1, -0.05), e = w.ePos[i];
      w.setE(i, e, 0); holeAt(w, i, ft, 1);
      const P = V(e.x + 0.9, 0.95, e.z + 1.6);
      w.protonA.visible = w.bigCloud.visible = w.protonHalo.visible = true;
      w.protonA.position.copy(P); w.bigCloud.position.copy(P); w.bigCloud.rotation.y = ft * 0.15; w.bigCloud.rotation.x = 0.3;
      w.protonHalo.position.copy(P); w.protonHalo.material.opacity = 0.32 + 0.04 * Math.sin(ft * 1.9); w.protonHalo.scale.setScalar(0.75);
      const u = smooth(t / d);
      look(C, V(P.x + lerp(1.6, 2.4, u), P.y + lerp(0.9, 1.1, u), P.z + lerp(3.4, 3.0, u)), V(lerp(P.x - 0.1, P.x - 0.4, u), lerp(0.25, 0.2, u), lerp(P.z - 1.2, P.z - 1.0, u)));
      w.hero.intensity = 24; aim(w.hero, V(P.x + 2, 4.5, P.z + 2), V(P.x, 0, P.z - 0.8));
      return [["hole", e.x, e.y - 0.05, e.z, seg(t, 0.8, 1.4) * (1 - seg(ft, 600.0, 600.6))],
              ["proton", P.x, P.y + 0.13, P.z, seg(ft, 601.5, 602.1) * (1 - seg(t, d - 0.5, d))]];
    },
    // honest scale: one proton balances ~1,836 electrons
    mass(w, C, ft, t, d) {
      w.balG.visible = true; w.dust.visible = true;
      let n = 0; const m = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V(w.BR, w.BR, w.BR), p = V();
      for (let i = 0; i < w.NB; i++) {
        const tl = w.landT[i], h = w.heap[i];
        if (ft >= tl) { p.copy(h); n++; }
        else {
          const tf = 0.5, tau = ft - (tl - tf); if (tau < 0) { sc.setScalar(0); m.compose(p.set(0, 0, 0), q, sc); w.beads.setMatrixAt(i, m); sc.setScalar(w.BR); continue; }
          const v = tau / tf, yy = lerp(1.6, h.y, v * v), k = v * v * v;
          p.set(lerp(0.01 * Math.sin(i), h.x, k), yy, lerp(0.01 * Math.cos(i), h.z, k));
        }
        m.compose(p, q, sc); w.beads.setMatrixAt(i, m);
      }
      w.beads.instanceMatrix.needsUpdate = true;
      const th0 = 0.2, after = Math.max(0, ft - EV.pour[1]);
      const rad = th0 * (1 - n / w.NB) + (n === w.NB ? 0.012 * Math.exp(-after * 1.6) * Math.cos(after * 3.4) : 0);
      w.bal.set(rad);
      const B = w.BAL, by = 0.75;
      // camera: from the sea side looking back at the stage; close on the pans -> low/right so the centre is dark
      const mv = smooth((ft - 617.4) / 2.0), u = smooth(t / d);
      const cam = LV([B.x + 0.1, by + 1.15, B.z - 2.9], [B.x - 1.75, by + 0.55, B.z - 3.1], mv);
      cam.x += 0.15 * u;
      const tg = LV([B.x, by + 0.85, B.z], [B.x + 1.55, by + 0.95, B.z + 0.4], mv);
      look(C, cam, tg); C.fov = 32; C.updateProjectionMatrix();
      w.key.intensity = 300; w.foot.intensity = 3;
      w.hero.intensity = 40; aim(w.hero, V(B.x - 1.5, 4.6, B.z - 1.8), V(B.x, by + 0.8, B.z));
      const pk = seg(ft, 616.0, 616.6) * (1 - seg(ft, 618.6, 619.1));
      const pl = w.bal.panL.getWorldPosition(V()), pr = w.bal.panR.getWorldPosition(V());
      return [["1 proton", pl.x, pl.y + 0.2, pl.z, pk], ["1,836 electrons", pr.x, pr.y + 0.14, pr.z, pk]];
    },
    // an electron falls into the hole; both vanish in a warm-white flash with two gamma rays
    fall(w, C, ft, t, d) {
      const i = w.seatNear(1, 0.06), e = w.ePos[i], tA = EV.annihilate;
      const p0 = V(e.x + 0.25, 1.05, e.z + 0.9);
      if (ft < tA) {
        w.setE(i, e, 0); holeAt(w, i, ft, 1 - seg(ft, tA - 0.15, tA));
        const v = smooth((ft - EV.fallGo) / (tA - EV.fallGo)), p = p0.clone().lerp(e, v); p.y += bob(ft, 4) * (1 - v);
        w.heroE.visible = true; w.heroE.position.copy(p);
      } else {
        // after the flash: the seat is part of the smooth, full sea again (no electron above, no glow)
        w.setE(i, e, ER * seg(ft, tA + 0.25, tA + 0.9));
      }
      w.flashes[0].set(ft - tA, e, V(0.82, 0.3, -0.48).normalize(), 1);
      const u = smooth(t / d), pb = smooth((ft - tA) / 3);
      look(C, V(lerp(4.2, 3.8, u) + 1.2 * pb, lerp(1.4, 1.2, u) + 0.6 * pb, lerp(1.8, 1.3, u) + 1.4 * pb), V(e.x - 0.1, lerp(-0.1, -0.5, smooth((ft - EV.fallGo) / 3)), e.z));
      w.hero.intensity = 26; aim(w.hero, V(2.5, 5, 2.2), V(e.x, e.y, e.z));
      return [["electron", ...(ft < tA ? w.heroE.position.clone().add(V(0, ER, 0)).toArray() : [0, 0, 0]), seg(t, 0.4, 1.0) * (1 - seg(ft, 627.4, 627.9))],
              ["hole", e.x, e.y - 0.05, e.z, seg(t, 0.6, 1.2) * (1 - seg(ft, 627.4, 627.9))]];
    },
    // if holes were protons, every hydrogen atom would flash out of existence
    hydrogen(w, C, ft, t, d) {
      const spots = [[-1.6, 1.3, -0.6], [0.2, 1.7, -1.6], [1.7, 1.15, -0.2], [-0.4, 0.9, 0.6], [1.1, 2.1, -3.0]];
      const dirs = [[1, 0.2, 0.3], [0.3, 1, -0.4], [-0.6, 0.4, 0.7], [0.9, -0.2, -0.4], [0.2, 0.6, 0.8]];
      w.atoms.forEach((a, k) => {
        const tf = EV.hFlash[k], s = spots[k];
        a.visible = ft < tf + 0.1; a.position.set(s[0], s[1] + bob(ft, k) * 3, s[2]); a.userData.c.rotation.y = ft * 0.2 + k;
        a.userData.c.material.opacity = 0.4 * (1 - seg(ft, tf - 0.05, tf + 0.1));
        w.flashes[k].set(ft - tf, a.position, V(...dirs[k]).normalize(), 0.7);
      });
      const u = smooth(t / d);
      look(C, V(lerp(-1.2, 0.6, u), lerp(2.6, 2.4, u), lerp(6.2, 5.6, u)), V(lerp(0.0, 0.3, u), 0.9, -1.0));
      w.hero.intensity = 20; aim(w.hero, V(0, 6, 4), V(0, 1, -1));
      return [["hydrogen", ...w.atoms[2].position.clone().add(V(0, 0.35, 0)).toArray(), seg(t, 0.3, 0.9) * (1 - seg(ft, 636.2, 636.6))]];
    },
    // the hole lifts out of the sea as a real, separate particle: the positron
    leap(w, C, ft, t, d) {
      const i = w.seatNear(1, -0.04), e = w.ePos[i];
      w.setE(i, e, 0);
      const form = smooth((ft - EV.leapForm[0]) / (EV.leapForm[1] - EV.leapForm[0])), rise = smooth((ft - EV.leapRise[0]) / (EV.leapRise[1] - EV.leapRise[0]));
      holeAt(w, i, ft, 1 - 0.75 * form);
      const top = V(e.x - 0.25, 1.05, e.z + 1.3), p = e.clone().lerp(top, rise); p.y += bob(ft, 5) * rise;
      w.pos1.visible = form > 0.001; w.pos1.position.copy(p); w.pos1.scale.setScalar(ER * (0.3 + 0.7 * form));
      w.heroHalo.visible = true; w.heroHalo.position.copy(p); w.heroHalo.material.color.set(0xffe2c0); w.heroHalo.material.opacity = 0.35 * form * (1 - 0.6 * rise); w.heroHalo.scale.setScalar(0.9);
      const u = smooth(t / d);
      look(C, V(lerp(3.2, 2.6, u), lerp(0.9, 1.5, u), lerp(2.2, 2.6, u)), V(lerp(e.x, e.x - 0.1, u), KF([[639.76, -0.55], [642.4, -0.45], [645.6, 0.55]], ft), e.z + 0.4 * rise));
      w.hero.intensity = 26; aim(w.hero, V(2.2, 5, 3), p);
      return [["a new particle", p.x, p.y + ER, p.z, seg(ft, 645.6, 646.2) * (1 - seg(t, d - 0.4, d))]];
    },
    // electron and positron side by side, identical in size
    anti(w, C, ft, t, d) {
      const c = V(0.4, 1.2, -0.4), az = lerp(-18, 22, smooth(t / d)) * Math.PI / 180;
      const pe = V(c.x - 0.36, c.y + bob(ft, 1), c.z), pp = V(c.x + 0.36, c.y + bob(ft, 2), c.z);
      w.heroE.visible = w.pos1.visible = true; w.heroE.position.copy(pe); w.pos1.position.copy(pp); w.pos1.scale.setScalar(ER);
      const dist = lerp(2.9, 2.5, smooth(t / d));
      look(C, V(c.x + dist * Math.sin(az), c.y + 0.45, c.z + dist * Math.cos(az)), V(c.x, c.y - 0.12, c.z));
      w.hero.intensity = 24; aim(w.hero, V(c.x - 1.5, c.y + 4, c.z + 2.5), c);
      const op = seg(t, 0.5, 1.1) * (1 - seg(t, d - 0.4, d));
      return [["electron  −", pe.x, pe.y + ER, pe.z, op], ["positron  +", pp.x, pp.y + ER, pp.z, op]];
    },
    // beside the proton, its dark slate-violet twin fades in
    antiproton(w, C, ft, t, d) {
      const c = V(0.4, 1.25, -0.4), u = smooth(t / d), az = lerp(14, -6, u) * Math.PI / 180;
      w.protonB.visible = w.antiP.visible = true;
      w.protonB.position.set(c.x - 0.42, c.y + bob(ft, 1), c.z); w.antiP.position.set(c.x + 0.42, c.y + bob(ft, 3), c.z);
      const f = smooth((ft - EV.apFade[0]) / (EV.apFade[1] - EV.apFade[0])); w.antiMat.opacity = f; w.antiP.visible = f > 0.002;
      look(C, V(c.x + 3.0 * Math.sin(az), c.y + 0.5, c.z + 3.0 * Math.cos(az)), V(c.x, c.y - 0.1, c.z));
      w.hero.intensity = 24; aim(w.hero, V(c.x - 1.5, c.y + 4, c.z + 2.5), c);
      return [["proton", c.x - 0.42, c.y + 0.3, c.z, seg(t, 0.3, 0.9) * (1 - seg(t, d - 0.4, d))], ["antiproton", c.x + 0.42, c.y + 0.3, c.z, seg(ft, 657.4, 658.0) * (1 - seg(t, d - 0.4, d))]];
    },
    // the endless cinema dims and dissolves into darkness; only the warm positron stays lit
    sea(w, C, ft, t, d) {
      const k = smooth((ft - EV.dim[0]) / (EV.dim[1] - EV.dim[0])), u = smooth(t / d);
      const P = atScreen(V(5.0 * 0.55 + 4.2 * 0.45, 5.8 * 0.55 + 5.0 * 0.45, 8.0 * 0.55 + 6.8 * 0.45), V(-0.95, -2.5, -5.6), 0.2, 0.3, 5.5); P.y += bob(ft, 2);
      w.pos1.visible = true; w.pos1.position.copy(P); w.pos1.scale.setScalar(ER);
      w.heroHalo.visible = true; w.heroHalo.position.copy(P); w.heroHalo.material.color.set(0xffe2c0); w.heroHalo.material.opacity = 0.18 + 0.12 * k; w.heroHalo.scale.setScalar(0.9);
      w.key.intensity = 650 * (1 - k); w.foot.intensity = 6 * (1 - k); w.hemi.intensity = 0.25 * (1 - 0.85 * k); w.rim.intensity = 0.9 * (1 - 0.8 * k);
      w.S.fog.far = lerp(40, 16, k); w.S.fog.near = lerp(8, 9, k); if (k > 0.5) w.S.environment = w.envD;
      w.lineMat.opacity = 0.95 * (1 - k); w.lineGlowM.opacity = 0.22 * (1 - k); w.lampGlowM.opacity = 0.45 * (1 - k); w.dustM.opacity = 0.5 * (1 - 0.6 * k);
      w.hero.intensity = 22; aim(w.hero, V(P.x + 0.6, P.y + 3.2, P.z + 2.6), P);
      look(C, V(lerp(5.0, 4.2, u), lerp(5.8, 5.0, u), lerp(8.0, 6.8, u)), V(lerp(-1.4, -0.4, u), lerp(-3.6, -1.2, u), lerp(-7, -4, u)));
      return [];
    },
  };

  // ---------------------------------------------------------------- twins: a separate small scene
  function twins(o) {
    const S = new THREE.Scene(); S.environment = L3.env; S.background = new THREE.Color(0x07080a);
    const back = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), new THREE.MeshStandardMaterial({ color: 0x2a2c31, roughness: 0.95 })); back.position.set(0, 0, -7); S.add(back);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 60), new THREE.MeshPhysicalMaterial({ color: 0x040405, roughness: 0.1, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true, opacity: 0.66, envMapIntensity: 0.8 }));
    floor.rotation.x = -Math.PI / 2; S.add(floor);
    const R = 0.36, Y = 0.62;
    const e = X3.electron(R); e.position.y = Y; S.add(e);
    const tm = X3.mats.electron.clone(), twin = new THREE.Mesh(e.geometry, tm); twin.scale.setScalar(R); twin.position.y = -Y; S.add(twin);
    const cE = X3.mats.electron.color.clone(), cP = X3.mats.positron.color.clone(), sE = X3.mats.electron.sheenColor.clone(), sP = X3.mats.positron.sheenColor.clone();
    const mk = (y, ty, I, col) => { const L = new THREE.SpotLight(col, I, 0, 0.5, 0.9, 2); L.position.set(-2.2, y, 2.6); L.target.position.set(0, ty, 0); S.add(L, L.target); return L; };
    mk(4.2, Y, 30, 0xfff0de); mk(-4.2, -Y, 30, 0xfff0de);                 // key + its mirror image (so the twin is lit like a reflection)
    const bl = (y) => { const L = new THREE.SpotLight(0xd8dde6, 60, 0, 0.6, 1, 2); L.position.set(1.5, y, -1); L.target.position.set(0, y * 0.2, -7); S.add(L, L.target); };
    bl(5); bl(-5);                                                         // soft pool on the backdrop above and in the mirror
    const r1 = new THREE.DirectionalLight(0xbfcde2, 1.2); r1.position.set(3, 2, -6); S.add(r1);
    const r2 = new THREE.DirectionalLight(0xbfcde2, 1.2); r2.position.set(3, -2, -6); S.add(r2);
    S.add(new THREE.HemisphereLight(0x4a5260, 0x4a5260, 0.25));
    const C = L3.cam(30);
    return (t, d) => {
      const ft = o.T0 + t, k = smooth((ft - EV.twinsWarm[0]) / (EV.twinsWarm[1] - EV.twinsWarm[0])), u = smooth(t / d);
      const b = 0.015 * Math.sin(ft * 1.4);
      e.position.y = Y + b; twin.position.y = -Y - b;
      tm.color.copy(cE).lerp(cP, k); tm.sheenColor.copy(sE).lerp(sP, k);
      floor.material.opacity = lerp(0.66, 0.5, k);
      L3.orbit(C, 0, 0, 0, lerp(3.9, 3.3, u), lerp(-16, -6, u), lerp(4, 2.5, u));
      return [S, C, []];
    };
  }

  LABK.sea = (o) => {
    if (o.mode === "twins") return twins(o);
    const w = world(), C = L3.cam(32), f = MODES[o.mode];
    if (!f) { console.error("sea: unknown mode", o.mode); return () => [w.S, C, []]; }
    return (t, d) => {
      w.base(); C.fov = 32; C.updateProjectionMatrix();
      const pins = f(w, C, o.T0 + t, t, d) || [];
      return [w.S, C, pins];
    };
  };
})();
