/* k_cosmos.js — group E kinds for "The Dirac Equation": spin, ladder, cosmos, bang.
   LABK.name = (o) => (t, d) => [scene, camera, pins]; ft = o.T0 + t is FILM time; every time constant below is in film seconds.
   Pure functions of t, seeded randomness only. Electrons / positrons / nuclei / balance come from window.X3 (k_0shared.js).
   Annihilation everywhere = one soft warm-white flash + two thin gamma beams in opposite directions (annih()). */
(function () {
  const { THREE, M, W, H, seg, smooth, lerp, clamp, rnd, tex, stage, cam, orbit, canvasTex, glowSprite } = L3;
  const V3 = THREE.Vector3, TAU = Math.PI * 2;
  const win = (t, a, b, f) => { f = f || 0.4; return seg(t, a, a + f) * (1 - seg(t, b - f, b)); };
  const fr = (x) => x - Math.floor(x);

  // ---------------------------------------------------------------- camera
  // sx/sy: shift the subject right/up by a fraction of the frame (keeps the overlay corner free)
  function aim(C, tx, ty, tz, dist, az, el, sx, sy) {
    orbit(C, tx, ty, tz, dist, az, el);
    C.near = Math.max(0.004, dist * 0.02); C.far = Math.max(600, dist * 80);
    C.userData.ox = -(sx || 0); C.userData.oy = sy || 0;
    if (sx || sy) C.setViewOffset(W, H, -(sx || 0) * W, (sy || 0) * H, W, H); else C.clearViewOffset();
    C.updateProjectionMatrix();
  }
  function cr(K, t) {
    const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    let i = 0; while (t >= K[i + 1][0]) i++;
    const a = K[Math.max(i - 1, 0)], b = K[i], c = K[i + 1], d = K[Math.min(i + 2, n - 1)], h = c[0] - b[0], u = (t - b[0]) / h;
    const m1 = i === 0 ? 0 : (c[1] - a[1]) / (c[0] - a[0]) * h, m2 = i + 2 >= n ? 0 : (d[1] - b[1]) / (d[0] - b[0]) * h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * b[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * c[1] + (u3 - u2) * m2;
  }
  // keys: [[ft, tx, ty, tz, dist, az, el, sx?, sy?], ...] -> one continuous eased move
  const keyed = (K) => { const ch = []; for (let j = 1; j <= 8; j++) ch.push(K.map((k) => [k[0], k[j] || 0])); return ch; };
  function camKeys(C, ch, t) { const g = (j) => cr(ch[j - 1], t); aim(C, g(1), g(2), g(3), g(4), g(5), g(6), g(7), g(8)); }

  // ---------------------------------------------------------------- procedural textures (module cache: builders run once per shot)
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function vn(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s, o) { let f = 0, a = 0.5; for (let i = 0; i < (o || 4); i++) { f += a * vn(x, y, s + i * 17); x *= 2; y *= 2; a *= 0.5; } return f; }
  const TC = {};
  const cached = (key, fn) => TC[key] || (TC[key] = fn());
  function pixTex(key, w, h, fn, rep) {
    return cached(key, () => {
      const t = canvasTex(w, h, (g) => { const im = g.createImageData(w, h), D = im.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn(x, y), i = (y * w + x) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = 255; } g.putImageData(im, 0, 0); });
      t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = 8; return t;
    });
  }
  const DOT = () => cached("dot", () => canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.6)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  const SOFT = () => cached("soft", () => canvasTex(128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.5, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); }));
  const hazeTex = (seed) => cached("haze" + seed, () => canvasTex(256, 256, (g) => {
    const im = g.createImageData(256, 256), D = im.data;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const dx = (x - 127.5) / 127.5, dy = (y - 127.5) / 127.5, r = Math.sqrt(dx * dx + dy * dy), n = fbm(x / 34, y / 34, seed, 5);
      const a = Math.pow(clamp(1 - r, 0, 1), 1.5) * clamp(0.35 + 1.1 * (n - 0.3), 0, 1.2); const i = (y * 256 + x) * 4; D[i] = D[i + 1] = D[i + 2] = 255; D[i + 3] = 255 * clamp(a, 0, 1);
    }
    g.putImageData(im, 0, 0);
  }));
  const RAY = () => cached("ray", () => canvasTex(8, 256, (g) => { const gr = g.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.7, "rgba(255,255,255,.5)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); }));

  // ---------------------------------------------------------------- geometry helpers
  const STREAK_G = (() => { const g = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true); g.translate(0, 0.5, 0); return g; })();
  const UPV = new V3(0, 1, 0);
  function placeStreak(m, a, b, w) { const d = b.clone().sub(a), L = d.length(); m.visible = L > 1e-5; if (!m.visible) return; m.position.copy(a); m.quaternion.setFromUnitVectors(UPV, d.multiplyScalar(1 / L)); m.scale.set(w, L, w); }
  function roundBox(w, h, d, r) {
    const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
    s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y); s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
    s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r * 0.6, bevelEnabled: true, bevelThickness: r * 0.6, bevelSize: r * 0.5, bevelSegments: 4, curveSegments: 6 });
    g.translate(0, 0, -(d - 2 * r * 0.6) / 2); return g;
  }
  const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
  const shadowAll = (o) => o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
  const box = (w, h, d, mat) => new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  const cyl = (r1, r2, h, mat, sg) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, sg || 32), mat);
  // gradient backdrop sphere (keeps "dark" scenes from going murky black)
  function backdrop(S, top, mid, bot, R) {
    const m = new THREE.Mesh(new THREE.SphereGeometry(R || 300, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, depthWrite: false, map: canvasTex(64, 512, (g) => { const gr = g.createLinearGradient(0, 0, 0, 512); gr.addColorStop(0, top); gr.addColorStop(0.5, mid); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, 64, 512); }), dithering: true }));
    S.add(m); return m;
  }
  // camera-attached grade: lower-left darkening (for caption windows) and a black fade
  function grade(S, C) {
    S.add(C);
    const mk = (map, color) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map, color: color || 0xffffff, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false, toneMapped: false })); m.renderOrder = 999; m.position.z = -0.5; C.add(m); return m; };
    const ll = mk(cached("llgrad", () => canvasTex(320, 180, (g) => { const gr = g.createRadialGradient(40, 172, 0, 40, 172, 230); gr.addColorStop(0, "rgba(0,0,0,.92)"); gr.addColorStop(0.55, "rgba(0,0,0,.6)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, 0, 320, 180); })));
    const bl = mk(null, 0x000000);
    return (llOp, blackOp) => {
      const h = 2 * 0.5 * Math.tan(C.fov * Math.PI / 360), w = h * C.aspect, ox = C.userData.ox || 0, oy = C.userData.oy || 0;
      for (const m of [ll, bl]) { m.scale.set(w * 1.02, h * 1.02, 1); m.position.x = ox * w; m.position.y = -oy * h; }
      ll.material.opacity = llOp || 0; ll.visible = llOp > 0.003; bl.material.opacity = blackOp || 0; bl.visible = blackOp > 0.003;
    };
  }
  const dustOf = (S) => S.children.find((c) => c.isPoints);

  // ---------------------------------------------------------------- annihilation: soft intense warm-white flash + two thin gamma beams
  function annih(S, o) {
    o = o || {};
    const core = glowSprite(0xfff1dc, 1, 0), halo = glowSprite(0xffdcae, 1, 0), wide = glowSprite(0xffc890, 1, 0);
    S.add(wide, halo, core);
    const light = new THREE.PointLight(0xffe2bc, 0, 0, 2); S.add(light);
    const mk = (col, op) => { const m = new THREE.Mesh(STREAK_G, new THREE.MeshBasicMaterial({ map: RAY(), color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending, fog: false })); m.visible = false; S.add(m); return m; };
    const beam = [mk(0xfff2e0, 0.9), mk(0xfff2e0, 0.9)], sheath = [mk(0xffdcb0, 0.2), mk(0xffdcb0, 0.2)], tips = [glowSprite(0xfff2dc, 0.1, 0), glowSprite(0xfff2dc, 0.1, 0)];
    tips.forEach((s) => S.add(s));
    const tip = new V3(), tail = new V3();
    // a = seconds since contact; k = flash size (world); r = beam tip distance; L = beam length; w = beam width; fade 0..1 (beams); gain scales the flash
    return (a, pos, dir, k, r, L, w, fade, gain) => {
      gain = gain === undefined ? 1 : gain;
      const fk = a < -0.06 ? 0 : (a < 0 ? smooth((a + 0.06) / 0.06) : Math.exp(-a * (o.decay || 2.6)));
      const slow = a < -0.06 ? 0 : (a < 0 ? smooth((a + 0.06) / 0.06) : Math.exp(-a * (o.decay2 || 1.3)));
      for (const s of [core, halo, wide]) s.position.copy(pos);
      core.material.opacity = 0.62 * fk * gain; core.scale.setScalar(k * (0.32 + 0.3 * (1 - fk)));
      halo.material.opacity = 0.4 * fk * gain; halo.scale.setScalar(k * (1.0 + 0.7 * (1 - fk)));
      wide.material.opacity = 0.13 * slow * gain; wide.scale.setScalar(k * (2.6 + 2.4 * (1 - slow)));
      core.visible = halo.visible = wide.visible = fk + slow > 0.002;
      light.position.copy(pos); light.intensity = (o.light || 0) * fk * gain;
      const on = a > 0.02 && fade > 0.003;
      for (let s = 0; s < 2; s++) {
        beam[s].visible = sheath[s].visible = tips[s].visible = on; if (!on) continue;
        const sg = s ? -1 : 1;
        tip.copy(pos).addScaledVector(dir, sg * r); tail.copy(pos).addScaledVector(dir, sg * Math.max(0, r - L));
        placeStreak(beam[s], tail, tip, w); placeStreak(sheath[s], tail, tip, w * 4);
        beam[s].material.opacity = 0.9 * fade; sheath[s].material.opacity = 0.16 * fade;
        tips[s].position.copy(tip); tips[s].scale.setScalar(w * 30); tips[s].material.opacity = 0.55 * fade;
      }
    };
  }

  // ================================================================= COSMOS
  // flash (69.50-76.10): contact 72.30; meet (812.08-824.68): contact 816.00
  function meetScene(o, slow) {
    const TM = slow ? 816.0 : 72.3, T0 = o.T0;
    const S = stage("void", { dust: 650, dustR: slow ? 5 : 8, key: 1.7, rim: 1.6, hemi: 0.3, seed: slow ? 23 : 21, bg: 0x0c0e13 });
    backdrop(S, "#141820", "#36404f", "#12161d");
    const r = 0.1, e = X3.electron(r), p = X3.positron(r); S.add(e, p);
    const F = annih(S, {}), C = cam(32), dust = dustOf(S), G = grade(S, C);
    const dir = new V3(Math.cos(0.36), Math.sin(0.36), slow ? -0.45 : -0.2).normalize(), mid = new V3(), pd = new V3();
    const KC = keyed(slow
      ? [[812.08, 0, 0, 0, 1.35, 26, 9], [814.5, 0, 0, 0, 1.12, 10, 7], [816.0, 0, 0, 0, 1.0, 2, 6], [818.0, 0, 0, 0, 1.9, -6, 5], [820.4, 0, 0, 0, 3.4, -10, 4], [824.68, 0, 0, 0, 4.4, -14, 3]]
      : [[69.5, 0, 0, 0, 2.7, 16, 8], [72.3, 0, 0, 0, 2.0, 4, 5], [74.0, 0, 0, 0, 2.3, -2, 4], [76.1, 0, 0, 0, 2.6, -6, 3]]);
    return (t) => {
      const ft = T0 + t;
      const u = clamp((ft - T0) / (TM - T0), 0, 1), d0 = slow ? 0.78 : 1.0;
      const sep = 2 * r + (d0 - 2 * r) * Math.pow(1 - u, slow ? 1.3 : 1.45), ph = 0.3 + (slow ? 0.7 : 0.5) * u * u;
      pd.set(Math.cos(ph), Math.sin(ph) * 0.45, Math.sin(ph) * 0.15).normalize().multiplyScalar(sep / 2);
      e.position.copy(pd).negate(); p.position.copy(pd);
      const vis = 1 - seg(ft, TM - 0.01, TM + 0.06);
      e.scale.setScalar(r * vis); p.scale.setScalar(r * vis); e.visible = p.visible = vis > 0.002;
      camKeys(C, KC, ft);
      const a = ft - TM, dist = C.position.length();
      const rr = slow ? dist * (0.08 + 0.75 * smooth(a / 3.6)) * (a > 0 ? 1 : 0) : 2.4 * Math.max(0, a - 0.02);
      const fade = slow ? 1 - seg(ft, 819.0, 820.2) : 1 - seg(ft, 72.95, 73.35);
      mid.set(0, 0, 0);
      F(a, mid, dir, slow ? 0.75 : 0.85, rr, slow ? Math.min(rr, 0.45 * dist) : Math.min(rr, 0.55), 0.0024 * dist, fade);
      dust.rotation.y = ft * 0.012; dust.rotation.x = ft * 0.004;
      G(0, 0);
      const pinOp = slow ? [win(ft, 812.3, 815.3, 0.4), win(ft, 812.8, 815.3, 0.4)] : [win(ft, 69.7, 71.7, 0.35), win(ft, 70.0, 71.7, 0.35)];
      return [S, C, [["electron", e.position.x, e.position.y + 0.11, e.position.z, pinOp[0]], ["positron", p.position.x, p.position.y + 0.11, p.position.z, pinOp[1]]]];
    };
  }

  // anti-hydrogen: antiproton + soft warm positron cloud
  function antiH(S, s) {
    const g = new THREE.Group(), core = X3.antiNucleon(0.3 * s); g.add(core);
    const cl = new THREE.Sprite(new THREE.SpriteMaterial({ map: hazeTex(5), color: 0xf0cfa4, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending })); cl.scale.setScalar(2.6 * s); g.add(cl);
    const cl2 = glowSprite(0xf3d6b0, 1.4 * s, 0.22); g.add(cl2);
    S.add(g); return { g, set: (op, rot) => { g.visible = op > 0.003; cl.material.opacity = 0.4 * op; cl2.material.opacity = 0.22 * op; core.scale.setScalar(0.3 * s * Math.max(op, 0.001)); cl.material.rotation = rot; } };
  }

  // drop (831.56-839.44): ALPHA-g vertical trap, release 835.1, atoms reach the bottom counters ~837.3-838.5
  function dropScene(o) {
    const S = stage("studio", { key: 1.4, rim: 1.4, hemi: 0.28, floorY: -4.6, bg: 0x0d0f13 });
    backdrop(S, "#0b0d11", "#1c222c", "#0d0f13");
    const C = cam(32);
    const key = S.userData.key; key.position.set(-8, 10, 9);
    const TH0 = Math.PI * 0.18, THL = Math.PI * 2 - 0.62 * Math.PI;   // cut-away window faces the camera (+z)
    const steel = new THREE.MeshStandardMaterial({ color: 0xaeb3ba, metalness: 1, roughness: 0.34, side: THREE.DoubleSide });
    const steelIn = new THREE.MeshStandardMaterial({ color: 0x4a4f57, metalness: 0.8, roughness: 0.5, side: THREE.DoubleSide });
    const windTex = pixTex("coilwind", 64, 512, (x, y) => { const k = 0.78 + 0.22 * Math.pow(Math.abs(Math.sin(y * Math.PI / 4)), 0.6) + 0.06 * (vn(x / 6, y / 2, 3) - 0.5); return [199 * k, 122 * k, 72 * k]; }, [10, 1]);
    const copper = new THREE.MeshStandardMaterial({ color: 0xffffff, map: windTex, metalness: 1, roughness: 0.33, side: THREE.DoubleSide });
    const gold = new THREE.MeshStandardMaterial({ color: 0xc9a764, metalness: 1, roughness: 0.25, side: THREE.DoubleSide });
    const T = new THREE.Group(); S.add(T);
    const HH = 8.6;
    // outer cryostat shell + flanges
    T.add(new THREE.Mesh(new THREE.CylinderGeometry(1.45, 1.45, HH, 96, 1, true, TH0, THL), steel));
    T.add(new THREE.Mesh(new THREE.CylinderGeometry(1.4, 1.4, HH, 96, 1, true, TH0, THL), steelIn));
    for (const y of [-HH / 2, HH / 2, -1.4, 1.6]) { const f = new THREE.Mesh(new THREE.CylinderGeometry(1.62, 1.62, 0.16, 96, 1, false, TH0, THL), steel); f.position.y = y; T.add(f); }
    // copper coil stack
    for (let i = 0; i < 17; i++) { const y = -3.9 + i * 0.49, c = new THREE.Mesh(new THREE.CylinderGeometry(0.98, 0.98, 0.36, 96, 1, true, TH0 + 0.12, THL - 0.24), copper); c.position.y = y; T.add(c); const ci = new THREE.Mesh(new THREE.CylinderGeometry(0.8, 0.8, 0.36, 96, 1, true, TH0 + 0.12, THL - 0.24), copper); ci.position.y = y; T.add(ci); const cap = new THREE.Mesh(new THREE.RingGeometry(0.8, 0.98, 96, 1, TH0 + 0.12, THL - 0.24), copper); cap.rotation.x = -Math.PI / 2; cap.position.y = y + 0.18; T.add(cap); }
    // electrode stack (gold-plated rings) around the bore
    for (let i = 0; i < 40; i++) { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.17, 72, 1, true, TH0 + 0.2, THL - 0.4), gold); e.position.y = -3.9 + i * 0.2; T.add(e); }
    // bottom detector ring (counters): dark scintillator bars with glow faces
    const NB = 36, bars = [], barMat = new THREE.MeshStandardMaterial({ color: 0x24272d, metalness: 0.4, roughness: 0.5 });
    const glowMat = new THREE.MeshBasicMaterial({ map: DOT(), color: 0xffe6c4, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    for (let i = 0; i < NB; i++) {
      const a = (i + 0.5) / NB * TAU; if (((a - TH0) % TAU + TAU) % TAU > THL) continue;
      const b = box(0.1, 0.9, 0.12, barMat); b.position.set(Math.sin(a) * 0.62, -3.75, Math.cos(a) * 0.62); b.rotation.y = a; T.add(b);
      const gm = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.2), glowMat.clone()); gm.position.set(Math.sin(a) * 0.55, -3.75, Math.cos(a) * 0.55); gm.rotation.y = a + Math.PI; T.add(gm);
      bars.push({ a, gm });
    }
    shadowAll(T);
    const inner = new THREE.PointLight(0xdfe6f0, 3.5, 0, 2); inner.position.set(0, 0.6, 0.9); S.add(inner);
    const inner2 = new THREE.PointLight(0xdfe6f0, 2.5, 0, 2); inner2.position.set(0, -2.6, 0.9); S.add(inner2);
    // anti-hydrogen atoms: held at y~0.6, released at 835.1, fall (g) with small thermal drift
    const RL = 835.1, NA = 12, ra = rnd(83), atoms = [];
    for (let i = 0; i < NA; i++) {
      const p0 = new V3((ra() - 0.5) * 0.36, 0.6 + (ra() - 0.5) * 0.5, (ra() - 0.5) * 0.36), v0 = new V3((ra() - 0.5) * 0.12, (ra() - 0.5) * 0.5, (ra() - 0.5) * 0.12);
      const gacc = 1.25 + ra() * 0.35, yb = -3.55;
      // time to reach yb: p0.y + v0.y*s - g/2 s^2 = yb
      const A = gacc / 2, B = -v0.y, Cc = yb - p0.y, sHit = (-B + Math.sqrt(B * B - 4 * A * Cc)) / (2 * A);
      atoms.push({ p0, v0, gacc, sHit, tHit: RL + sHit, ph: ra() * TAU, h: antiH(S, 0.07), flash: annih(S, { light: 0.6, decay: 3.2 }), bar: (ra() * bars.length) | 0 });
    }
    const KC = keyed([[831.56, 0, 0.5, 0, 3.6, 8, 4, 0, 0], [834.6, 0, 0.3, 0, 4.2, 2, 2, 0, 0], [836.6, 0, -1.4, 0, 7.5, -6, 5, 0.18, 0], [838.2, 0, -1.2, 0, 13.0, -10, 6, 0.36, 0.0], [839.44, 0, -1.2, 0, 13.6, -11, 6, 0.36, 0.0]]);
    const pp = new V3(), dirUp = new V3(0, 1, 0), G = grade(S, C);
    return (t) => {
      const ft = o.T0 + t;
      camKeys(C, KC, ft);
      const dist = cr(KC[3], ft);
      bars.forEach((b) => (b.gm.material.opacity = 0));
      atoms.forEach((A, i) => {
        const s = Math.max(0, ft - RL), ss = Math.min(s, A.sHit), hold = ft < RL;
        if (hold) pp.set(A.p0.x + 0.05 * Math.sin(ft * 1.3 + A.ph), A.p0.y + 0.05 * Math.sin(ft * 0.9 + A.ph * 2), A.p0.z + 0.05 * Math.cos(ft * 1.1 + A.ph));
        else pp.set(A.p0.x + A.v0.x * ss, A.p0.y + A.v0.y * ss - A.gacc / 2 * ss * ss, A.p0.z + A.v0.z * ss);
        A.h.g.position.copy(pp);
        const gone = seg(ft, A.tHit - 0.02, A.tHit + 0.08);
        A.h.set(1 - gone, ft * 0.4 + A.ph);
        const a = ft - A.tHit;
        A.flash(a, pp, dirUp, 0.35, 0, 0, 0.001, 0, 1);
        if (a > 0) { const b = bars[A.bar]; b.gm.material.opacity = Math.min(0.9, b.gm.material.opacity + 0.8 * Math.exp(-a * 2.2)); }
      });
      G(0, 0);
      const c0 = atoms[0].h.g.position;
      return [S, C, [["anti-hydrogen", c0.x, c0.y + 0.08, c0.z, win(ft, 832.0, 835.0, 0.4)]]];
    };
  }

  // potassium (848.46-851.70): K-40 nucleus emits one positron (849.35) + a faint neutrino streak
  function potassiumScene(o) {
    const S = stage("void", { dust: 500, dustR: 6, key: 1.9, rim: 1.6, hemi: 0.3, seed: 31, bg: 0x0c0e13 });
    backdrop(S, "#0a0c10", "#1d232d", "#0a0c10");
    const C = cam(32), nuc = X3.nucleus(19, 21, 4, 0.1); S.add(nuc);
    const R0 = nuc.userData.R, po = X3.positron(0.085); S.add(po);
    const TE = 849.35, pDir = new V3(-0.62, 0.72, 0.3).normalize(), nDir = new V3(0.85, -0.25, -0.45).normalize();
    const F = annih(S, { light: 1.2, decay: 3 });   // small emission glint only (no beams)
    const nu = new THREE.Mesh(STREAK_G, new THREE.MeshBasicMaterial({ map: RAY(), color: 0xe8ecf2, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(nu);
    const KC = keyed([[848.46, 0, 0, 0, 3.3, -12, 8, 0.12, 0.04], [851.7, 0, 0.1, 0, 2.75, 4, 10, 0.1, 0.02]]);
    const pp = new V3(), a0 = new V3(), b0 = new V3(), dust = dustOf(S), G = grade(S, C);
    return (t) => {
      const ft = o.T0 + t;
      camKeys(C, KC, ft);
      nuc.rotation.y = ft * 0.18; nuc.rotation.x = 0.3 + 0.05 * Math.sin(ft);
      const a = ft - TE, s = Math.max(0, a);
      const dpos = R0 * 0.85 + 0.62 * s + 0.08 * s * s;
      pp.copy(pDir).multiplyScalar(dpos); po.position.copy(pp); po.visible = a > -0.02; po.scale.setScalar(0.085 * seg(ft, TE - 0.03, TE + 0.08));
      nuc.position.copy(pDir).multiplyScalar(-0.03 * smooth(s / 0.5));
      a0.copy(pDir).multiplyScalar(R0 * 0.9);
      F(a, a0, pDir, 0.5, 0, 0, 0.001, 0, 0.7);
      const nr = 3.2 * s; a0.copy(nDir).multiplyScalar(R0 + Math.max(0, nr - 1.4)); b0.copy(nDir).multiplyScalar(R0 + nr);
      if (a > 0.02) { placeStreak(nu, a0, b0, 0.0035); nu.material.opacity = 0.32 * (1 - seg(ft, 850.4, 851.1)); } else nu.visible = false;
      dust.rotation.y = ft * 0.012;
      G(0, 0);
      return [S, C, [["positron", pp.x, pp.y + 0.1, pp.z, win(ft, 850.0, 851.6, 0.35)]]];
    };
  }

  // tiny (858.02-867.92): jeweller's precision balance under a glass dome on velvet, display 0.000 g
  function tinyScene(o) {
    const S = stage("studio", { key: 2.0, rim: 1.3, hemi: 0.22, floorY: 0, bg: 0x0b0c10 });
    const key = S.userData.key; key.position.set(-5, 8, 4); key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 4; key.shadow.camera.bottom = -4; key.shadow.camera.updateProjectionMatrix();
    backdrop(S, "#0a0b0f", "#15181e", "#0b0c10");
    // velvet cloth with soft folds
    const cg = new THREE.PlaneGeometry(9, 7, 160, 120), cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), y = cp.getY(i), r = Math.hypot(x, y); cp.setZ(i, 0.05 * Math.sin(x * 1.3 + y * 0.6) * smooth((r - 1.4) / 2) + 0.04 * fbm(x * 0.8 + 9, y * 0.8 + 9, 5, 3) + (r > 3 ? -0.06 * (r - 3) : 0)); }
    cg.computeVertexNormals();
    const velvet = new THREE.MeshPhysicalMaterial({ color: 0x1b2030, roughness: 0.95, metalness: 0, sheen: 1, sheenRoughness: 0.45, sheenColor: new THREE.Color(0x6f7d9c) });
    const cloth = new THREE.Mesh(cg, velvet); cloth.rotation.x = -Math.PI / 2; cloth.position.y = 0.01; cloth.receiveShadow = true; S.add(cloth);
    const B = new THREE.Group(); S.add(B);
    const body = new THREE.MeshStandardMaterial({ color: 0x23262c, metalness: 0.5, roughness: 0.42 });
    const brushed = new THREE.MeshStandardMaterial({ color: 0xc4c8cf, metalness: 1, roughness: 0.3, map: pixTex("brushed", 512, 512, (x, y) => { const k = 0.9 + 0.1 * (vn(x / 200, y / 0.7, 4) - 0.5) * 2 + 0.04 * (vn(x / 30, y / 0.5, 8) - 0.5); return [220 * k, 222 * k, 226 * k]; }) });
    const base = new THREE.Mesh(roundBox(1.25, 0.26, 0.95, 0.06), body); base.position.set(0, 0.14, 0); B.add(base);
    const top = new THREE.Mesh(roundBox(1.12, 0.03, 0.62, 0.012), brushed); top.position.set(0, 0.285, -0.1); B.add(top);
    const post = cyl(0.03, 0.03, 0.07, brushed); post.position.set(0, 0.33, -0.1); B.add(post);
    const pan = cyl(0.25, 0.24, 0.016, brushed, 64); pan.position.set(0, 0.37, -0.1); B.add(pan);
    const rim = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.006, 8, 64), brushed); rim.rotation.x = Math.PI / 2; rim.position.set(0, 0.378, -0.1); B.add(rim);
    // front sloped panel with display and buttons
    const panelTex = canvasTex(1024, 256, (g) => {
      g.fillStyle = "#1a1c21"; g.fillRect(0, 0, 1024, 256);
      g.fillStyle = "#0d0f0e"; g.fillRect(250, 50, 520, 156);
      const gr = g.createLinearGradient(0, 50, 0, 206); gr.addColorStop(0, "#1c231f"); gr.addColorStop(1, "#141a17"); g.fillStyle = gr; g.fillRect(262, 62, 496, 132);
      g.fillStyle = "#d9dccb"; g.font = "bold 104px 'Courier New', monospace"; g.textAlign = "right"; g.textBaseline = "middle"; g.fillText("0.000", 680, 132);
      g.font = "bold 50px Arial, sans-serif"; g.fillText("g", 740, 140);
      g.fillStyle = "#8b8f97"; g.font = "600 26px Arial, sans-serif"; g.textAlign = "center";
      for (const [lab, x] of [["ON/OFF", 120], ["TARE", 900]]) { g.fillStyle = "#2c3038"; g.beginPath(); g.arc(x, 112, 40, 0, TAU); g.fill(); g.fillStyle = "#8b8f97"; g.fillText(lab, x, 190); }
      g.fillStyle = "#6c7079"; g.font = "600 22px Arial, sans-serif"; g.fillText("max 50 g   d = 0.001 g", 512, 232);
    });
    const panel = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.275), new THREE.MeshStandardMaterial({ map: panelTex, metalness: 0.2, roughness: 0.45, emissive: 0xffffff, emissiveMap: panelTex, emissiveIntensity: 0.05 }));
    panel.position.set(0, 0.15, 0.481); B.add(panel);
    const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.535, 0.142), new THREE.MeshBasicMaterial({ map: canvasTex(512, 136, (g) => { g.fillStyle = "#121815"; g.fillRect(0, 0, 512, 136); g.fillStyle = "#e6e4d2"; g.font = "bold 108px 'Courier New', monospace"; g.textAlign = "right"; g.textBaseline = "middle"; g.fillText("0.000", 430, 72); g.font = "bold 52px Arial, sans-serif"; g.fillText("g", 490, 80); }), color: 0xb9b8ac }));
    lcd.position.set(0, 0.149, 0.483); B.add(lcd);
    for (const fx of [-0.42, 0.42]) { const bt = cyl(0.04, 0.042, 0.02, body, 24); bt.rotation.x = Math.PI / 2; bt.position.set(fx * 1.09 / 0.84 * 0.84, 0.16, 0.49); B.add(bt); }
    for (const [fx, fz] of [[-0.52, -0.4], [0.52, -0.4], [-0.52, 0.4], [0.52, 0.4]]) { const ft = cyl(0.04, 0.05, 0.03, body, 16); ft.position.set(fx, 0.012, fz); B.add(ft); }
    shadowAll(B);
    // glass bell jar
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.1, clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 2.2, side: THREE.DoubleSide, depthWrite: false });
    const D = new THREE.Group(); S.add(D);
    const JR = 0.95, JH = 0.75;
    D.add(at(new THREE.Mesh(new THREE.CylinderGeometry(JR, JR, JH, 96, 1, true), glass), 0, JH / 2 + 0.02, 0));
    D.add(at(new THREE.Mesh(new THREE.SphereGeometry(JR, 96, 32, 0, TAU, 0, Math.PI / 2), glass), 0, JH + 0.02, 0));
    const knobM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transparent: true, opacity: 0.35, clearcoat: 1, envMapIntensity: 2 });
    D.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.08, 32, 16), knobM), 0, JH + JR + 0.07, 0));
    const lip = new THREE.Mesh(new THREE.TorusGeometry(JR, 0.018, 12, 128), knobM); lip.rotation.x = Math.PI / 2; lip.position.y = 0.025; D.add(lip);
    const spot = new THREE.SpotLight(0xffe9cf, 30, 14, 0.42, 0.6, 2); spot.position.set(-2.2, 5.2, 2.6); spot.target.position.set(0, 0.3, 0); S.add(spot, spot.target); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024);
    const C = cam(30);
    const KC = keyed([[858.02, 0, 0.3, 0.1, 2.2, 10, 16, 0, 0], [861.0, 0, 0.6, 0, 5.4, 18, 13, 0.27, -0.24], [867.92, 0, 0.6, 0, 5.0, 24, 12, 0.29, -0.25]]);
    const G = grade(S, C);
    return (t) => { const ft = o.T0 + t; camKeys(C, KC, ft); G(0, 0); return [S, C, [["empty pan", 0, 0.4, -0.1, win(ft, 858.4, 860.6, 0.4)]]]; };
  }

  LABK.cosmos = (o) => {
    const m = o.mode;
    if (m === "meet") return meetScene(o, true);
    if (m === "drop") return dropScene(o);
    if (m === "potassium") return potassiumScene(o);
    if (m === "tiny") return tinyScene(o);
    return meetScene(o, false);
  };
})();
