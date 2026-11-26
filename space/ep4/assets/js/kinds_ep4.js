/* EP4 kinds. K.well: spacetime as a thin warm-grey grid sheet bent by a mass (no labels).
   Units: grid half-size 10, mass radius ~0.7. Options: mass "earth"|"sun"|"none", depth/depthK (well depth),
   dist/el/az(+0/1, K), roll, sx, look [x,y,z], fov, cell (grid spacing), spin (mass deg/s). */
(function () {
  const { THREE, K, V, KF, ease, place, starfield, newCam, D2R, earthPlus, starBall, sunRel } = window.SPK;
  const N = 41, SEG = 160, HALF = 10;
  function grid() {
    const lines = 2 * N, pos = new Float32Array(lines * SEG * 2 * 3), col = new Float32Array(lines * SEG * 2 * 3);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3)); g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const m = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 1, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.frustumCulled = false;
    m.userData.set = (depth, a, cam) => {
      let k = 0;
      const y = (x, z) => -depth * a / Math.sqrt(x * x + z * z + a * a);
      for (let dir = 0; dir < 2; dir++) for (let i = 0; i < N; i++) {
        const c = -HALF + (2 * HALF) * i / (N - 1);
        for (let s = 0; s < SEG; s++) for (let e = 0; e < 2; e++) {
          const u = -HALF + (2 * HALF) * (s + e) / SEG, x = dir ? c : u, z = dir ? u : c, yy = y(x, z);
          pos[k] = x; pos[k + 1] = yy; pos[k + 2] = z;
          // fade with distance from centre and from camera: no hard grid edge
          const r = Math.sqrt(x * x + z * z) / HALF, dc = Math.hypot(x - cam.position.x, yy - cam.position.y, z - cam.position.z);
          const f = Math.max(0, 1 - r * r) * Math.min(1, 9 / dc) * 0.55;
          col[k] = 0.86 * f; col[k + 1] = 0.81 * f; col[k + 2] = 0.72 * f; k += 3;
        }
      }
      g.attributes.position.needsUpdate = true; g.attributes.color.needsUpdate = true;
    };
    return m;
  }
  K.well = (o) => {
    const S = new THREE.Scene(), C = newCam(o.fov || 34); starfield(S, o.stars !== undefined ? o.stars : 0.5);
    const G = grid(); S.add(G);
    let M = null;
    if (o.mass === "earth") M = earthPlus();
    else if (o.mass === "sun") M = starBall({ haloS: 2.6, haloOp: 0.28, tint: [1.0, 0.62, 0.32], gain: 1.5 });
    const R = o.r || 0.7;
    if (M) { M.scale.setScalar(R); S.add(M); }
    let lastD = -1, lastCam = new THREE.Vector3(1e9, 0, 0);
    return (t, d) => {
      const p = ease(t / d, o.ease), az = o.azK ? KF(o.azK, t) : V(o, "az", p, 0);
      const depth = o.depthK ? KF(o.depthK, t) : V(o, "depth", p, 3);
      const look = o.look ? new THREE.Vector3(...o.look) : new THREE.Vector3(0, -depth * 0.5, 0);
      place(C, look, o.distK ? KF(o.distK, t) : V(o, "dist", p, 14), o.elK ? KF(o.elK, t) : V(o, "el", p, 22), az, V(o, "roll", p, 0), V(o, "sx", p, 0), V(o, "sy", p, 0));
      if (Math.abs(depth - lastD) > 1e-4 || C.position.distanceTo(lastCam) > 0.02) { G.userData.set(depth, o.wa || 1.2, C); lastD = depth; lastCam.copy(C.position); }
      if (M) {
        const yb = -depth * (o.wa || 1.2) / Math.sqrt((o.wa || 1.2) ** 2);
        M.position.set(0, (o.massY !== undefined ? o.massY : yb + R * 0.85) + (o.dropK ? KF(o.dropK, t) : 0), 0);
        M.visible = (o.massK ? KF(o.massK, t) : 1) > 0.5;
        if (M.userData.body) M.userData.body.rotation.y = (o.spin !== undefined ? o.spin : 4) * D2R * t;
        const sn = o.sun || [-60, 25], sd = sunRel(az, sn[0], sn[1]); M.userData.light(sd, C, t);
      }
      return [S, C];
    };
  };
})();
