/* Shared props for the E = mc² film (loaded before every other k_*.js because of its name).
   window.X3 = { balance, nucleon, nucleus, paperclip, lcd }. Every kind that shows these MUST use them, so the film has one look.

   const b = X3.balance({ s: 1 });   // brass two-pan balance, ~1.6 units tall at s=1, pans at x = ±0.62*s, origin = base centre on the bench
   scene.add(b.group); b.panL.add(obj); b.panR.add(obj);   // objects ride on the pans (pan top surface at local y = 0)
   b.set(rad);   // tilt the beam (positive = LEFT pan goes DOWN); pans stay level and hang straight. Call every frame (pure function of t).
   b.pointer     // needle under the pivot follows the tilt; b.dial is the scale plate behind it (magnified look: pass larger angles than reality, say so on screen)

   X3.nucleon("p"|"n", r)       -> Mesh (satin sphere: proton warm copper-red, neutron pale warm grey). Shares materials/geometry.
   X3.nucleus(Z, N, seed, r)    -> Group of Z protons + N neutrons packed in a ball (instanced: cheap even for uranium 92+143). group.userData.R = radius.
   X3.paperclip(s)              -> Group, a real steel paperclip ~3.2 cm long at s=1 (units: 1 = 10 cm when used on the balance)
   X3.lcd(text, w, h)           -> CanvasTexture of a grey-green LCD reading `text` (for kitchen / lab scales) */
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

  const clipMat = new THREE.MeshStandardMaterial({ color: 0xc9ccd2, metalness: 1, roughness: 0.22 });
  function paperclip(s) {
    // Gem clip: inner leg, middle loop, outer loop (straights + true semicircles), lying flat in XZ; ~0.33*s long, 0.09*s wide
    s = s || 1; const L = 0.33 * s, w = 0.0034 * s, P2 = [];
    const line = (x0, y0, x1, y1) => { for (let k = 0; k <= 12; k++) { const u = k / 12; P2.push([x0 + (x1 - x0) * u, y0 + (y1 - y0) * u]); } };
    const arc = (cx, cy, r, a0, a1) => { for (let k = 1; k <= 24; k++) { const a = a0 + (a1 - a0) * k / 24; P2.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]); } };
    line(0.30, -0.035, 0.86, -0.035); arc(0.86, 0.025, 0.06, -Math.PI / 2, Math.PI / 2);
    line(0.86, 0.085, 0.11, 0.085); arc(0.11, -0.025, 0.11, Math.PI / 2, Math.PI * 1.5);
    line(0.11, -0.135, 0.865, -0.135); arc(0.865, 0, 0.135, -Math.PI / 2, Math.PI / 2);
    line(0.865, 0.135, 0.24, 0.135);
    const pts = []; for (const [x, y] of P2) { const v = new THREE.Vector3((x - 0.5) * L, 0, y * L); if (!pts.length || pts[pts.length - 1].distanceTo(v) > 1e-6) pts.push(v); }
    const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, false, "centripetal", 0.5), 400, w, 10, false), clipMat);
    m.castShadow = true; m.position.y = w;
    const g = new THREE.Group(); g.add(m); return g;
  }
  function lcd(text, w, h) {
    return L3.canvasTex(w || 512, h || 160, (c, W, H) => {
      c.fillStyle = "#9aa58f"; c.fillRect(0, 0, W, H);
      const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, "rgba(255,255,255,.12)"); gr.addColorStop(1, "rgba(0,0,0,.12)"); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      c.fillStyle = "rgba(20,26,18,.88)"; c.font = `600 ${Math.round(H * 0.62)}px "Courier New", monospace`; c.textAlign = "right"; c.textBaseline = "middle"; c.fillText(text, W - H * 0.25, H * 0.54);
    });
  }
  window.X3 = { balance, nucleon, nucleus, paperclip, lcd, mats: { brass, brassDark, wood, enamel, proton: matP, neutron: matN, clip: clipMat } };
})();
