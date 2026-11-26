/* Shared props for "The Dirac Equation" film (loaded before every other k_*.js because of its name).
   Every kind that shows these MUST use them, so the film has one look.

   X3.electron(r)              -> Mesh: satin pale steel-blue sphere (the electron, everywhere in the film)
   X3.positron(r)              -> Mesh: the SAME satin sphere in warm ivory-amber (its mirror twin: anti-electron / hole made real)
   X3.nucleon("p"|"n", r)      -> Mesh (proton warm copper-red, neutron pale warm grey); X3.nucleus(Z, N, seed, r) -> instanced Group, userData.R = radius
   X3.antiNucleon(r)           -> Mesh: antiproton = proton material but cool slate-violet satin (only for antiproton / anti-hydrogen shots)
   X3.halo(color, size, op)    -> soft additive glow sprite (calm, never neon). Use for energy, gamma flashes, the "hole" in the sea.
   X3.trail(pts, o)            -> cloud-chamber droplet trail along a THREE.Vector3[] polyline (o.seed, o.density droplets per unit, o.size, o.jitter).
                                  returns { mesh, set(u) }: set(0..1) reveals the trail from its start (call every frame). Droplets are small matte white beads.
   X3.trackPath(x0, y0, dir, R, len, n) -> Vector3[] circular arc in the XY plane starting at (x0,y0) heading `dir` (radians), radius R: R > 0 turns LEFT (counter-clockwise, the positron in the real photo), R < 0 turns right; arc length len
   X3.paperTex(lines, o)       -> CanvasTexture of aged cream paper with ink handwriting. lines = [[text, x, y, px, opts?]] in a 1024x1400 canvas (o.w, o.h to change).
                                  font: italic Georgia (Greek letters ok). opts: {color, font, align}
   X3.EQ = "iγ·∂ψ = mψ"         the Dirac equation in the modern shorthand carved in Westminster Abbey. X3.EQ1928 = the long form for the 1928 page.
   X3.balance({s})             -> brass two-pan balance (see e=mc² film): {group, panL, panR, set(rad) positive = LEFT pan down, pointer, dial, beam}
   X3.mats                     -> shared materials (brass, wood, enamel, ink, electron, positron, proton, neutron, droplet) */
(() => {
  const { THREE, M, P } = L3;
  const brass = new THREE.MeshStandardMaterial({ color: 0xc8a96a, metalness: 1, roughness: 0.26 });
  const brassPan = new THREE.MeshStandardMaterial({ color: 0xbf9f62, metalness: 1, roughness: 0.38 });  // pans: less mirror-white from above
  const brassDark = new THREE.MeshStandardMaterial({ color: 0x8a6d3b, metalness: 1, roughness: 0.38 });
  const wood = new THREE.MeshStandardMaterial({ color: 0x3b2417, metalness: 0, roughness: 0.55 });
  const enamel = new THREE.MeshStandardMaterial({ color: 0xece4d2, metalness: 0, roughness: 0.4 });
  const ink = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, metalness: 0, roughness: 0.6 });

  function balance(o) {
    o = o || {}; const s = o.s || 1, arm = 0.62 * s, top = 1.32 * s;
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.9 * s, 0.09 * s, 0.42 * s), wood); base.position.y = 0.045 * s; g.add(base);
    const plinth = new THREE.Mesh(new THREE.CylinderGeometry(0.11 * s, 0.14 * s, 0.06 * s, 48), brass); plinth.position.y = 0.12 * s; g.add(plinth);
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.025 * s, 0.032 * s, top - 0.15 * s, 32), brass); col.position.y = 0.15 * s + (top - 0.15 * s) / 2; g.add(col);
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04 * s, 32, 16), brass); knob.position.y = top + 0.06 * s; g.add(knob);
    // dial plate behind the pointer
    const dialTex = L3.canvasTex(256, 256, (c, w, h) => {
      c.fillStyle = "#8c8068"; c.fillRect(0, 0, w, h); c.strokeStyle = "#1e1a14"; c.lineWidth = 3;
      c.beginPath(); c.arc(128, 40, 170, Math.PI * 0.35, Math.PI * 0.65); c.stroke();
      for (let i = -5; i <= 5; i++) { const a = Math.PI / 2 + i * 0.03; c.lineWidth = i === 0 ? 4 : 2; c.beginPath(); c.moveTo(128 + Math.cos(a) * 160, 40 + Math.sin(a) * 160); c.lineTo(128 + Math.cos(a) * (i % 5 === 0 ? 135 : 147), 40 + Math.sin(a) * (i % 5 === 0 ? 135 : 147)); c.stroke(); }
    });
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.13 * s, 48, Math.PI * 1.2, Math.PI * 0.6), new THREE.MeshStandardMaterial({ map: dialTex, roughness: 0.5 }));
    dial.position.set(0, 0.42 * s, 0.035 * s); g.add(dial);
    // beam (pivots at the top of the column)
    const beam = new THREE.Group(); beam.position.y = top; g.add(beam);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(2 * arm, 0.035 * s, 0.03 * s), brass); beam.add(bar);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05 * s, 0.05 * s, 0.05 * s, 32), brassDark); hub.rotation.x = Math.PI / 2; beam.add(hub);
    for (const sx of [-1, 1]) { const tip = new THREE.Mesh(new THREE.SphereGeometry(0.022 * s, 16, 12), brass); tip.position.x = sx * arm; beam.add(tip); }
    const pointer = new THREE.Mesh(new THREE.CylinderGeometry(0.004 * s, 0.008 * s, top - 0.32 * s, 8), ink); pointer.position.y = -(top - 0.32 * s) / 2; beam.add(pointer);
    // hangers + pans (not children of the beam, so they stay level)
    function hanger() {
      const h = new THREE.Group(), L = 0.62 * s;
      for (let k = 0; k < 3; k++) {
        const a = k * Math.PI * 2 / 3, rr = 0.16 * s;
        const wire = new THREE.Mesh(new THREE.CylinderGeometry(0.0035 * s, 0.0035 * s, Math.hypot(L, rr), 6), brassDark);
        wire.position.set(Math.cos(a) * rr / 2, -L / 2, Math.sin(a) * rr / 2);
        wire.rotation.z = Math.atan2(Math.cos(a) * rr, L) * 1; wire.rotation.x = -Math.atan2(Math.sin(a) * rr, L);
        h.add(wire);
      }
      const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.19 * s, 0.16 * s, 0.025 * s, 64), brassPan); pan.position.y = -L; h.add(pan);
      const seat = new THREE.Group(); seat.position.y = -L + 0.0125 * s; h.add(seat);
      return { h, seat };
    }
    const L = hanger(), R = hanger(); g.add(L.h, R.h);
    // rotation.z > 0 is counter-clockwise seen from +z: right tip up, left tip down (= positive means LEFT pan heavier)
    function set(rad) {
      beam.rotation.z = rad;
      L.h.position.set(-arm * Math.cos(rad), top - arm * Math.sin(rad), 0);
      R.h.position.set(arm * Math.cos(rad), top + arm * Math.sin(rad), 0);
    }
    set(0);
    return { group: g, panL: L.seat, panR: R.seat, set, pointer, dial, beam };
  }

  const sph = new THREE.SphereGeometry(1, 40, 24);
  const matP = new THREE.MeshPhysicalMaterial({ color: P.proton, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.5, sheen: 0.6, sheenColor: new THREE.Color(0xffc9b0) });
  const matN = new THREE.MeshPhysicalMaterial({ color: 0xb9b4ab, roughness: 0.45, metalness: 0, clearcoat: 0.3, clearcoatRoughness: 0.5, sheen: 0.5, sheenColor: new THREE.Color(0xffffff) });
  function nucleon(type, r) { const m = new THREE.Mesh(sph, type === "p" ? matP : matN); m.scale.setScalar(r || 0.1); m.castShadow = true; return m; }
  function nucleus(Z, N, seed, r) {
    r = r || 0.1; const n = Z + N, R = r * 1.12 * Math.cbrt(n), rnd = L3.rnd(seed || 1), pts = [];
    // sunflower-in-ball packing, then shuffle which are protons
    for (let i = 0; i < n; i++) { const f = (i + 0.5) / n, rad = R * Math.cbrt(f) * 0.92, y = 1 - 2 * rnd(), th = Math.PI * (3 - Math.sqrt(5)) * i, q = Math.sqrt(1 - y * y); pts.push(new THREE.Vector3(Math.cos(th) * q * rad, y * rad, Math.sin(th) * q * rad)); }
    const idx = pts.map((_, i) => i); for (let i = n - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    const g = new THREE.Group(), ip = new THREE.InstancedMesh(sph, matP, Z), inn = new THREE.InstancedMesh(sph, matN, N), mm = new THREE.Matrix4(), sc = new THREE.Vector3(r, r, r), q0 = new THREE.Quaternion();
    for (let k = 0; k < n; k++) { mm.compose(pts[idx[k]], q0, sc); if (k < Z) ip.setMatrixAt(k, mm); else inn.setMatrixAt(k - Z, mm); }
    ip.castShadow = inn.castShadow = true; g.add(ip, inn); g.userData.R = R + r; return g;
  }

  const elMat = new THREE.MeshPhysicalMaterial({ color: 0x9fb4c8, roughness: 0.36, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.4, sheen: 0.7, sheenColor: new THREE.Color(0xdcecff) });
  const poMat = new THREE.MeshPhysicalMaterial({ color: 0xd9b48a, roughness: 0.36, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.4, sheen: 0.7, sheenColor: new THREE.Color(0xfff0dc) });
  const apMat = new THREE.MeshPhysicalMaterial({ color: 0x7d7894, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.5, sheen: 0.6, sheenColor: new THREE.Color(0xd8d4ff) });
  const ball = (mat, r) => { const m = new THREE.Mesh(sph, mat); m.scale.setScalar(r || 0.1); m.castShadow = true; return m; };
  const electron = (r) => ball(elMat, r), positron = (r) => ball(poMat, r), antiNucleon = (r) => ball(apMat, r);
  const halo = (color, size, op) => L3.glowSprite(color || 0xfff1d6, size || 1, op !== undefined ? op : 0.5);

  const dropMat = new THREE.MeshStandardMaterial({ color: 0xf2f2ee, roughness: 0.35, metalness: 0, emissive: 0x2a2a28 });
  const dropGeo = new THREE.SphereGeometry(1, 8, 6);
  function trail(pts, o) {
    o = o || {}; const rnd = L3.rnd(o.seed || 11), dens = o.density || 160, size = o.size || 0.006, jit = o.jitter !== undefined ? o.jitter : size * 1.6;
    let L = 0; const acc = [0]; for (let i = 1; i < pts.length; i++) { L += pts[i].distanceTo(pts[i - 1]); acc.push(L); }
    const n = Math.max(2, Math.round(L * dens)), mesh = new THREE.InstancedMesh(dropGeo, o.mat || dropMat, n), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), sc = new THREE.Vector3();
    let j = 0;
    for (let k = 0; k < n; k++) {
      const d = (k + rnd() * 0.8) / n * L; while (j < acc.length - 2 && acc[j + 1] < d) j++;
      const u = (d - acc[j]) / Math.max(1e-9, acc[j + 1] - acc[j]); v.lerpVectors(pts[j], pts[j + 1], u);
      v.x += (rnd() - 0.5) * jit; v.y += (rnd() - 0.5) * jit; v.z += (rnd() - 0.5) * jit; sc.setScalar(size * (0.55 + rnd() * 0.9)); mm.compose(v, q, sc); mesh.setMatrixAt(k, mm);
    }
    mesh.count = n;
    return { mesh, set: (u) => { mesh.count = Math.max(0, Math.min(n, Math.round(n * u))); mesh.visible = mesh.count > 0; } };
  }
  function trackPath(x0, y0, dir, R, len, n) {
    n = n || 120; const out = [], s = Math.sign(R) || 1, r = Math.abs(R);
    const cx = x0 - s * r * Math.sin(dir), cy = y0 + s * r * Math.cos(dir);
    for (let i = 0; i <= n; i++) { const a = dir - s * Math.PI / 2 + s * (len * i / n) / r; out.push(new THREE.Vector3(cx + r * Math.cos(a), cy + r * Math.sin(a), 0)); }
    return out;
  }
  function paperTex(lines, o) {
    o = o || {}; const W = o.w || 1024, H = o.h || 1400;
    return L3.canvasTex(W, H, (c) => {
      const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, "#e9dfc8"); g.addColorStop(1, "#d9cbab"); c.fillStyle = g; c.fillRect(0, 0, W, H);
      const r = L3.rnd(o.seed || 5); for (let i = 0; i < 2600; i++) { c.fillStyle = `rgba(90,70,40,${0.02 + r() * 0.04})`; c.fillRect(r() * W, r() * H, 1 + r() * 3, 1 + r() * 3); }
      const vg = c.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.3, W / 2, H / 2, Math.max(W, H) * 0.75); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(80,55,25,.28)"); c.fillStyle = vg; c.fillRect(0, 0, W, H);
      for (const [t, x, y, px, op] of lines) { const p = op || {}; c.fillStyle = p.color || "rgba(28,32,48,.9)"; c.font = p.font || `italic ${px}px Georgia, "Times New Roman", serif`; c.textAlign = p.align || "left"; c.textBaseline = "alphabetic"; c.fillText(t, x, y); }
    });
  }
  window.X3 = { balance, nucleon, nucleus, electron, positron, antiNucleon, halo, trail, trackPath, paperTex, EQ: "iγ·∂ψ = mψ", EQ1928: "{ p₀ + ρ₁(σ, p) + ρ₃ mc } ψ = 0",
    mats: { brass, brassDark, wood, enamel, ink, electron: elMat, positron: poMat, proton: matP, neutron: matN, droplet: dropMat } };
})();
