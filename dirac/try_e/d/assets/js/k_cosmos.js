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
    if (S.fog) S.fog.color.set(mid);
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
      const vis = 1 - seg(ft, TM - 0.01, TM + 0.06);
      pd.multiplyScalar(vis); e.position.copy(pd).negate(); p.position.copy(pd);
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
    const cl = new THREE.Sprite(new THREE.SpriteMaterial({ map: hazeTex(5), color: 0xf0cfa4, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); cl.scale.setScalar(2.6 * s); g.add(cl);
    const cl2 = glowSprite(0xf3d6b0, 1.4 * s, 0.22); g.add(cl2);
    S.add(g); return { g, set: (op, rot) => { g.visible = op > 0.003; cl.material.opacity = 0.6 * op; cl2.material.opacity = 0.22 * op; core.scale.setScalar(0.3 * s * Math.max(op, 0.001)); cl.material.rotation = rot; } };
  }

  // drop (831.56-839.44): ALPHA-g vertical trap, release 835.1, atoms reach the bottom counters ~837.3-838.5
  function dropScene(o) {
    const S = stage("studio", { key: 1.4, rim: 1.4, hemi: 0.28, floorY: -4.6, bg: 0x0d0f13 });
    backdrop(S, "#12161c", "#303846", "#14171d");
    const C = cam(32);
    const key = S.userData.key; key.position.set(-8, 10, 9);
    const GAP = 0.6 * Math.PI;   // cut-away wedge facing the camera (+z)
    // solid ring sector (closed, with cut faces): hole centred on +z, height h, centred on y=0
    const sector = (rIn, rOut, h, gap) => {
      const a0 = -Math.PI / 2 + gap / 2, a1 = a0 + TAU - gap, sh = new THREE.Shape();
      sh.absarc(0, 0, rOut, a0, a1, false); sh.lineTo(rIn * Math.cos(a1), rIn * Math.sin(a1)); sh.absarc(0, 0, rIn, a1, a0, true); sh.closePath();
      const g = new THREE.ExtrudeGeometry(sh, { depth: h, bevelEnabled: false, curveSegments: 72 }); g.rotateX(-Math.PI / 2); g.translate(0, -h / 2, 0); return g;
    };
    const steel = new THREE.MeshStandardMaterial({ color: 0xaeb3ba, metalness: 1, roughness: 0.36 });
    const steelIn = new THREE.MeshStandardMaterial({ color: 0x5a5f67, metalness: 0.8, roughness: 0.5 });
    const copper = new THREE.MeshStandardMaterial({ color: 0xc27a48, metalness: 1, roughness: 0.38 });
    const insul = new THREE.MeshStandardMaterial({ color: 0x2a2620, metalness: 0, roughness: 0.7 });
    const gold = new THREE.MeshStandardMaterial({ color: 0xc2a468, metalness: 1, roughness: 0.42 });
    const T = new THREE.Group(); S.add(T);
    const HH = 8.6;
    // outer cryostat wall + flanges
    T.add(new THREE.Mesh(sector(1.36, 1.45, HH, GAP), steel));
    for (const y of [-HH / 2, HH / 2, -1.4, 1.6]) { const f = new THREE.Mesh(sector(1.36, 1.6, 0.16, GAP), steel); f.position.y = y; T.add(f); }
    // copper coil stack (windings on dark insulating formers)
    for (let i = 0; i < 17; i++) { const y = -3.9 + i * 0.49; T.add(at(new THREE.Mesh(sector(0.8, 0.98, 0.34, GAP), copper), 0, y, 0)); T.add(at(new THREE.Mesh(sector(0.76, 1.02, 0.06, GAP), insul), 0, y + 0.2, 0)); }
    T.add(new THREE.Mesh(sector(0.66, 0.72, HH - 0.6, GAP), steelIn));
    // electrode stack (gold-plated rings) around the bore
    for (let i = 0; i < 40; i++) T.add(at(new THREE.Mesh(sector(0.46, 0.5, 0.16, GAP), gold), 0, -3.9 + i * 0.2, 0));
    // bottom detector ring (counters): dark scintillator bars with glow faces
    const NB = 36, bars = [], barMat = new THREE.MeshStandardMaterial({ color: 0x24272d, metalness: 0.4, roughness: 0.5 });
    const glowMat = new THREE.MeshBasicMaterial({ map: DOT(), color: 0xffe6c4, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    for (let i = 0; i < NB; i++) {
      const a = (i + 0.5) / NB * TAU, aw = Math.atan2(Math.sin(a), Math.cos(a)); if (Math.abs(aw) < GAP / 2) continue;
      const b = box(0.1, 0.9, 0.12, barMat); b.position.set(Math.sin(a) * 0.58, -3.75, Math.cos(a) * 0.58); b.rotation.y = a; T.add(b);
      const gm = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 1.2), glowMat.clone()); gm.position.set(Math.sin(a) * 0.52, -3.75, Math.cos(a) * 0.52); gm.rotation.y = a + Math.PI; T.add(gm);
      bars.push({ a, gm });
    }
    shadowAll(T);
    const inner = new THREE.PointLight(0xdfe6f0, 1.6, 0, 2); inner.position.set(0, 0.6, 2.2); S.add(inner);
    const inner2 = new THREE.PointLight(0xdfe6f0, 1.4, 0, 2); inner2.position.set(0, -2.6, 2.2); S.add(inner2);
    // anti-hydrogen atoms: held at y~0.6, released at 835.1, fall (g) with small thermal drift
    const RL = 835.1, NA = 12, ra = rnd(83), atoms = [];
    for (let i = 0; i < NA; i++) {
      const p0 = new V3((ra() - 0.5) * 0.36, 0.6 + (ra() - 0.5) * 0.5, (ra() - 0.5) * 0.36), v0 = new V3((ra() - 0.5) * 0.12, (ra() - 0.5) * 0.5, (ra() - 0.5) * 0.12);
      const gacc = 1.25 + ra() * 0.35, yb = -3.55;
      // time to reach yb: p0.y + v0.y*s - g/2 s^2 = yb
      const A = gacc / 2, B = -v0.y, Cc = yb - p0.y, sHit = (-B + Math.sqrt(B * B - 4 * A * Cc)) / (2 * A);
      atoms.push({ p0, v0, gacc, sHit, tHit: RL + sHit, ph: ra() * TAU, h: antiH(S, 0.12), flash: annih(S, { light: 0.6, decay: 3.2 }), bar: (ra() * bars.length) | 0 });
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
        A.flash(a, pp, dirUp, 0.3, 0, 0, 0.001, 0, 0.45);
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
    backdrop(S, "#141820", "#36404f", "#12161d");
    const C = cam(32), nuc = X3.nucleus(19, 21, 4, 0.1); S.add(nuc);
    const R0 = nuc.userData.R, po = X3.positron(0.085); S.add(po);
    const TE = 849.35, pDir = new V3(-0.92, 0.3, 0.22).normalize(), nDir = new V3(0.85, -0.25, -0.45).normalize();
    const F = annih(S, { light: 1.2, decay: 3 });   // small emission glint only (no beams)
    const nu = new THREE.Mesh(STREAK_G, new THREE.MeshBasicMaterial({ map: RAY(), color: 0xe8ecf2, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(nu);
    const KC = keyed([[848.46, 0, 0, 0, 3.3, -12, 8, 0.12, 0.04], [851.7, 0, 0.1, 0, 2.75, 4, 10, 0.1, 0.02]]);
    const pp = new V3(), a0 = new V3(), b0 = new V3(), dust = dustOf(S), G = grade(S, C);
    return (t) => {
      const ft = o.T0 + t;
      camKeys(C, KC, ft);
      nuc.rotation.y = ft * 0.18; nuc.rotation.x = 0.3 + 0.05 * Math.sin(ft);
      const a = ft - TE, s = Math.max(0, a);
      const dpos = R0 * 0.85 + 0.34 * s;
      pp.copy(pDir).multiplyScalar(dpos); po.position.copy(pp); po.visible = a > -0.02; po.scale.setScalar(0.085 * seg(ft, TE - 0.03, TE + 0.08));
      nuc.position.copy(pDir).multiplyScalar(-0.03 * smooth(s / 0.5));
      a0.copy(pDir).multiplyScalar(R0 * 0.9);
      F(a, a0, pDir, 0.4, 0, 0, 0.001, 0, 0.4);
      const nr = 3.2 * s; a0.copy(nDir).multiplyScalar(R0 + Math.max(0, nr - 1.4)); b0.copy(nDir).multiplyScalar(R0 + nr);
      if (a > 0.02) { placeStreak(nu, a0, b0, 0.0035); nu.material.opacity = 0.32 * (1 - seg(ft, 850.4, 851.1)); } else nu.visible = false;
      dust.rotation.y = ft * 0.012;
      G(0, 0);
      return [S, C, [["positron", pp.x, pp.y + 0.1, pp.z, win(ft, 850.0, 851.6, 0.35)]]];
    };
  }

  // tiny (858.02-867.92): jeweller's precision balance under a glass dome on velvet, display 0.000 g
  function tinyScene(o) {
    const S = stage("studio", { key: 2.0, rim: 1.3, hemi: 0.22, floorY: -1.5, bg: 0x0b0c10 });
    const key = S.userData.key; key.position.set(-5, 8, 4); key.shadow.camera.left = -4; key.shadow.camera.right = 4; key.shadow.camera.top = 4; key.shadow.camera.bottom = -4; key.shadow.camera.updateProjectionMatrix();
    backdrop(S, "#0a0b0f", "#15181e", "#0b0c10");
    // velvet cloth with soft folds
    const cg = new THREE.PlaneGeometry(26, 20, 260, 200), cp = cg.attributes.position;
    for (let i = 0; i < cp.count; i++) { const x = cp.getX(i), y = cp.getY(i), r = Math.hypot(x, y); cp.setZ(i, 0.05 * Math.sin(x * 1.3 + y * 0.6) * smooth((r - 1.4) / 2) + 0.04 * fbm(x * 0.8 + 9, y * 0.8 + 9, 5, 3) + 0.12 * Math.sin(x * 0.45 + 1.3) * Math.sin(y * 0.38) * smooth((r - 2.5) / 3)); }
    cg.computeVertexNormals();
    const velvet = new THREE.MeshPhysicalMaterial({ color: 0x15171d, roughness: 0.95, metalness: 0, sheen: 1, sheenRoughness: 0.5, sheenColor: new THREE.Color(0x4a5268), envMapIntensity: 0.4 });
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
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.03, transmission: 1, thickness: 0.02, ior: 1.5, envMapIntensity: 0.32, side: THREE.DoubleSide });
    const D = new THREE.Group(); S.add(D);
    const JR = 0.95, JH = 0.75;
    D.add(at(new THREE.Mesh(new THREE.CylinderGeometry(JR, JR, JH, 96, 1, true), glass), 0, JH / 2 + 0.02, 0));
    D.add(at(new THREE.Mesh(new THREE.SphereGeometry(JR, 96, 32, 0, TAU, 0, Math.PI / 2), glass), 0, JH + 0.02, 0));
    const knobM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, transmission: 1, thickness: 0.15, ior: 1.5, envMapIntensity: 1.4 });
    D.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.08, 32, 16), knobM), 0, JH + JR + 0.07, 0));
    const lip = new THREE.Mesh(new THREE.TorusGeometry(JR, 0.018, 12, 128), knobM); lip.rotation.x = Math.PI / 2; lip.position.y = 0.025; D.add(lip);
    const spot = new THREE.SpotLight(0xffe9cf, 30, 14, 0.42, 0.6, 2); spot.position.set(-2.2, 5.2, 2.6); spot.target.position.set(0, 0.3, 0); S.add(spot, spot.target); spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024);
    const C = cam(30);
    const KC = keyed([[858.02, 0, 0.3, 0.1, 2.2, 10, 16, 0, 0], [861.0, 0, 0.75, 0, 7.6, 18, 12, 0.32, -0.2], [867.92, 0, 0.75, 0, 7.0, 24, 11, 0.33, -0.21]]);
    const G = grade(S, C);
    return (t) => { const ft = o.T0 + t; camKeys(C, KC, ft); G(0, 0); return [S, C, [["empty pan", 0, 0.4, -0.1, win(ft, 858.4, 860.6, 0.4)]]]; };
  }


  // ================================================================= SPIN
  // cut-away electron: the X3 satin shell with a wedge removed (facing +z) and a small painted bar magnet inside along local +y (N up)
  const magTex = (lab, bg, fg) => cached("mag" + lab, () => canvasTex(128, 256, (g) => { g.fillStyle = bg; g.fillRect(0, 0, 128, 256); const r = rnd(lab.charCodeAt(0)); for (let i = 0; i < 900; i++) { g.fillStyle = "rgba(0,0,0," + (0.03 + r() * 0.05) + ")"; g.fillRect(r() * 128, r() * 256, 1 + r() * 2, 1 + r() * 2); } g.fillStyle = fg; g.font = "bold 92px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText(lab, 64, 128); }));
  function spinElectron(r) {
    const g = new THREE.Group(), W0 = Math.PI * 0.62, ps = Math.PI / 2 + W0 / 2, pl = TAU - W0;
    const shell = new THREE.Mesh(new THREE.SphereGeometry(r, 72, 48, ps, pl), X3.mats.electron); g.add(shell);
    const innerMat = new THREE.MeshPhysicalMaterial({ color: 0x55697d, roughness: 0.55, metalness: 0, sheen: 0.5, sheenColor: new THREE.Color(0x9fb4c8), side: THREE.BackSide });
    const inner = new THREE.Mesh(new THREE.SphereGeometry(r * 0.94, 72, 48, ps, pl), innerMat); g.add(inner);
    const cutMat = new THREE.MeshPhysicalMaterial({ color: 0x8ea3b7, roughness: 0.5, metalness: 0, sheen: 0.6, sheenColor: new THREE.Color(0xdcecff), side: THREE.DoubleSide });
    for (const pc of [ps, ps + pl]) { const ring = new THREE.Mesh(new THREE.RingGeometry(r * 0.94, r, 48, 1, -Math.PI / 2, Math.PI), cutMat); ring.rotation.y = pc + Math.PI; g.add(ring); }
    const mag = new THREE.Group(); g.add(mag);
    const mN = new THREE.MeshStandardMaterial({ map: magTex("N", "#9c3a30", "#efe6da"), metalness: 0.25, roughness: 0.38 });
    const mS = new THREE.MeshStandardMaterial({ map: magTex("S", "#8f949c", "#1f2228"), metalness: 0.35, roughness: 0.36 });
    const bw = r * 0.2, bh = r * 0.62;
    mag.add(at(box(bw, bh, bw, mN), 0, bh / 2, 0), at(box(bw, bh, bw, mS), 0, -bh / 2, 0));
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return { g, mag, shell, inner };
  }
  // dip compass on a brass stand: dial faces +z, needle rotation.z = 0 points the N end up
  function dipCompass(s, standH) {
    const g = new THREE.Group(), brass = X3.mats.brass;
    const dial = cached("dial", () => canvasTex(256, 256, (c) => { c.fillStyle = "#e9e1cc"; c.beginPath(); c.arc(128, 128, 128, 0, TAU); c.fill(); c.strokeStyle = "#2a2622"; for (let i = 0; i < 72; i++) { const a = i / 72 * TAU, l = i % 6 === 0 ? 22 : 11; c.lineWidth = i % 6 === 0 ? 3 : 1.5; c.beginPath(); c.moveTo(128 + Math.cos(a) * 118, 128 + Math.sin(a) * 118); c.lineTo(128 + Math.cos(a) * (118 - l), 128 + Math.sin(a) * (118 - l)); c.stroke(); } c.lineWidth = 1; c.beginPath(); c.arc(128, 128, 92, 0, TAU); c.stroke(); }));
    g.add(new THREE.Mesh(new THREE.CircleGeometry(0.3 * s, 64), new THREE.MeshStandardMaterial({ map: dial, roughness: 0.45 })));
    g.add(new THREE.Mesh(new THREE.TorusGeometry(0.31 * s, 0.035 * s, 16, 72), brass));
    const back = cyl(0.33 * s, 0.33 * s, 0.05 * s, brass, 64); back.rotation.x = Math.PI / 2; back.position.z = -0.03 * s; g.add(back);
    const needle = new THREE.Group(); needle.position.z = 0.02 * s; g.add(needle);
    const half = (col, sg) => { const sh = new THREE.Shape(); sh.moveTo(-0.022 * s, 0); sh.lineTo(0, sg * 0.25 * s); sh.lineTo(0.022 * s, 0); sh.closePath(); return new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.008 * s, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: col, metalness: 0.6, roughness: 0.32 })); };
    needle.add(half(0x9c3a30, 1), half(0x2c3440, -1));
    const cap = cyl(0.022 * s, 0.022 * s, 0.03 * s, brass, 24); cap.rotation.x = Math.PI / 2; cap.position.z = 0.03 * s; g.add(cap);
    const gl = new THREE.Mesh(new THREE.CircleGeometry(0.3 * s, 64), new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.03, transparent: true, opacity: 0.08, envMapIntensity: 1.4, depthWrite: false })); gl.position.z = 0.045 * s; g.add(gl);
    const rod = cyl(0.018 * s, 0.018 * s, standH, brass, 16); rod.position.y = -0.33 * s - standH / 2; g.add(rod);
    const foot = cyl(0.16 * s, 0.19 * s, 0.05 * s, X3.mats.wood, 48); foot.position.y = -0.33 * s - standH; g.add(foot);
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    return { g, needle };
  }
  // needle angle for a compass straight below a dipole tilted by th (rotation.z): field there ~ (sin th, 2 cos th)
  const needleAng = (th) => Math.atan2(-Math.sin(th), 2 * Math.cos(th));

  function magnetScene(o) {
    const S = stage("studio", { key: 2.0, rim: 1.4, hemi: 0.3, floorY: -1.3, bg: 0x0d0f13 });
    backdrop(S, "#0f1217", "#262d38", "#0f1217");
    const key = S.userData.key; key.position.set(-6, 9, 7);
    const r = 0.55, A = spinElectron(r), B = spinElectron(r); A.g.position.set(0, 0.6, 0); B.g.position.set(2.7, 0.6, 0); S.add(A.g, B.g);
    const cA = dipCompass(1, 0.55), cB = dipCompass(1, 0.55); cA.g.position.set(0, -0.42, 0.05); cB.g.position.set(2.7, -0.42, 0.05); S.add(cA.g, cB.g);
    const thA = (ft) => lerp(1.9, 0, seg(ft, 382.3, 388.4)) + 0.08 * Math.sin(ft * 2.1) * (1 - seg(ft, 386, 389.5));
    const thB = (ft) => Math.PI + lerp(-1.4, 0, seg(ft, 388.8, 391.7)) + 0.07 * Math.sin(ft * 2.4 + 1) * (1 - seg(ft, 390, 392.4));
    const KC = keyed([[382.02, 0.1, 0.25, 0, 5.4, -20, 7, 0.18, 0], [386.0, 0.05, 0.2, 0, 4.9, -12, 6, 0.18, 0], [389.0, 0.2, 0.2, 0, 4.8, -4, 6, 0.16, 0], [392.4, 1.35, 0.15, 0, 6.6, 6, 6, 0, 0], [393.74, 1.35, 0.15, 0, 6.4, 9, 6, 0, 0]]);
    const C = cam(32), G = grade(S, C);
    return (t) => {
      const ft = o.T0 + t;
      A.g.rotation.set(0, 0.12 * Math.sin(ft * 0.5), thA(ft)); B.g.rotation.set(0, -0.1 * Math.sin(ft * 0.45), thB(ft));
      cA.needle.rotation.z = needleAng(thA(ft - 0.25)); cB.needle.rotation.z = needleAng(thB(ft - 0.25));
      camKeys(C, KC, ft); G(0, 0);
      return [S, C, [["electron", 0, 0.6 + r + 0.05, 0, win(ft, 382.4, 384.5, 0.4)], ["compass", 0.3, -0.42, 0.1, win(ft, 389.0, 390.9, 0.4)],
        ["spin up", 0, 0.6 + r + 0.05, 0, win(ft, 391.4, 393.6, 0.4)], ["spin down", 2.7, 0.6 + r + 0.05, 0, win(ft, 391.9, 393.6, 0.4)]]];
    };
  }

  // Stern-Gerlach: oven -> slits -> knife-edge magnet -> glass plate; the ribbon beam splits into two lip-shaped deposits
  function experimentScene(o) {
    const S = stage("studio", { key: 1.9, rim: 1.4, hemi: 0.3, floorY: -1.25, bg: 0x0d0f13 });
    backdrop(S, "#0f1217", "#262d38", "#0f1217");
    const key = S.userData.key; key.position.set(-5, 9, 8);
    const iron = new THREE.MeshStandardMaterial({ color: 0x2e3238, metalness: 0.55, roughness: 0.5 });
    const steelM = new THREE.MeshStandardMaterial({ color: 0xb9bdc4, metalness: 1, roughness: 0.28, map: pixTex("brushed", 512, 512, (x, y) => { const k = 0.9 + 0.1 * (vn(x / 200, y / 0.7, 4) - 0.5) * 2 + 0.04 * (vn(x / 30, y / 0.5, 8) - 0.5); return [220 * k, 222 * k, 226 * k]; }) });
    const copper = M.copper(); copper.roughness = 0.4;
    const R = new THREE.Group(); S.add(R);
    R.add(at(box(7.6, 0.12, 0.7, iron), -0.6, -1.05, 0));
    const oven = cyl(0.24, 0.24, 0.7, steelM, 48); oven.rotation.z = Math.PI / 2; oven.position.set(-3.6, 0, 0); R.add(oven);
    const ovCap = cyl(0.27, 0.27, 0.06, steelM, 48); ovCap.rotation.z = Math.PI / 2; ovCap.position.set(-3.23, 0, 0); R.add(ovCap);
    R.add(at(box(0.08, 0.95, 0.22, iron), -3.6, -0.55, 0));
    const ovGlow = glowSprite(0xffc890, 0.25, 0.35); ovGlow.position.set(-3.19, 0, 0); S.add(ovGlow);
    for (const x of [-2.75, -2.25]) { R.add(at(box(0.03, 0.34, 0.7, steelM), x, 0.19, 0), at(box(0.03, 0.34, 0.7, steelM), x, -0.19, 0), at(box(0.05, 0.6, 0.08, iron), x, -0.72, 0)); }
    const x0 = -1.6, x1 = 1.0, Lm = x1 - x0, xm = (x0 + x1) / 2;
    R.add(at(box(Lm, 0.5, 1.1, iron), xm, 0.95, -0.15), at(box(Lm, 0.5, 1.1, iron), xm, -0.95, -0.15), at(box(Lm, 2.4, 0.4, iron), xm, 0, -0.85));
    for (const y of [0.55, -0.55]) { const c = new THREE.Mesh(roundBox(Lm * 0.8, 0.3, 0.95, 0.08), copper); c.position.set(xm, y, -0.12); R.add(c); }
    const knife = new THREE.Shape(); knife.moveTo(-0.32, 0.42); knife.lineTo(0.32, 0.42); knife.lineTo(0.05, 0.13); knife.lineTo(-0.05, 0.13); knife.closePath();
    const kg = new THREE.ExtrudeGeometry(knife, { depth: Lm, bevelEnabled: false }); kg.rotateY(Math.PI / 2); const kn = new THREE.Mesh(kg, steelM); kn.position.set(x0, 0, 0); R.add(kn);
    const groove = new THREE.Shape(); groove.moveTo(-0.34, -0.42); groove.lineTo(0.34, -0.42); groove.lineTo(0.34, -0.13); groove.lineTo(0.1, -0.13); groove.lineTo(0.06, -0.2); groove.lineTo(-0.06, -0.2); groove.lineTo(-0.1, -0.13); groove.lineTo(-0.34, -0.13); groove.closePath();
    const gg = new THREE.ExtrudeGeometry(groove, { depth: Lm, bevelEnabled: false }); gg.rotateY(Math.PI / 2); const gr = new THREE.Mesh(gg, steelM); gr.position.set(x0, 0, 0); R.add(gr);
    const XP = 2.25;
    const glassM = new THREE.MeshPhysicalMaterial({ color: 0xdfe8e4, roughness: 0.05, metalness: 0, transparent: true, opacity: 0.22, clearcoat: 1, envMapIntensity: 1.3, depthWrite: false });
    R.add(at(box(0.02, 1.0, 0.9, glassM), XP, 0.05, 0));
    for (const y of [0.57, -0.47]) R.add(at(box(0.05, 0.05, 0.98, X3.mats.brass), XP, y, 0));
    for (const z of [-0.47, 0.47]) R.add(at(box(0.05, 1.08, 0.05, X3.mats.brass), XP, 0.05, z));
    R.add(at(box(0.08, 0.55, 0.08, iron), XP, -0.77, 0));
    shadowAll(R);
    // beam of silver atoms: up/down per atom; deflection grows inside the magnet; the split is smaller at the ribbon ends (the real "lips" pattern)
    const N = 520, rb = rnd(51), atoms = [], kdef = 0.0165;
    for (let i = 0; i < N; i++) atoms.push({ t0: 391.3 + i * (9.6 / N) + rb() * 0.01, s: rb() < 0.5 ? 1 : -1, z: (rb() - 0.5) * 0.4, j: (rb() - 0.5) * 0.012, jz: (rb() - 0.5) * 0.01 });
    const yAt = (A, x) => { const f = Math.max(0.12, 1 - Math.pow(A.z / 0.21, 2)), u = clamp(x - x0, 0, Lm); let y = kdef * u * u; if (x > x1) y += 2 * kdef * Lm * (x - x1); return A.s * y * f + A.j; };
    const agM = new THREE.MeshStandardMaterial({ color: 0xe6e3dc, metalness: 0.4, roughness: 0.3, emissive: 0x3a3833 });
    const beam = new THREE.InstancedMesh(new THREE.SphereGeometry(0.011, 10, 8), agM, N); S.add(beam);
    const depM = new THREE.MeshStandardMaterial({ color: 0xd8d2c4, metalness: 0.5, roughness: 0.35, emissive: 0x2e2b26 });
    const dep = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.011, 0.011, 0.004, 10), depM, N); S.add(dep);
    const mm = new THREE.Matrix4(), qq = new THREE.Quaternion().setFromAxisAngle(new V3(0, 0, 1), Math.PI / 2), q0 = new THREE.Quaternion(), vv = new V3(), one = new V3(1, 1, 1), zero = new V3(0, 0, 0), VEL = 1.7, XS = -3.2;
    const KC = keyed([[393.74, -1.4, 0.05, 0, 5.8, 32, 14], [396.6, 0.2, 0.05, 0, 5.0, 24, 11], [398.6, 1.6, 0.05, 0, 2.9, 48, 8], [400.84, 2.1, 0.05, 0, 2.2, 66, 6]]);
    const C = cam(32), G = grade(S, C);
    return (t) => {
      const ft = o.T0 + t;
      for (let i = 0; i < N; i++) {
        const A = atoms[i], x = XS + VEL * (ft - A.t0);
        if (x < XS || x > XP - 0.012) mm.compose(zero, q0, zero); else { vv.set(x, yAt(A, x), A.z + A.jz); mm.compose(vv, q0, one); }
        beam.setMatrixAt(i, mm);
        if (x >= XP - 0.012) { vv.set(XP - 0.012, yAt(A, XP), A.z + A.jz); mm.compose(vv, qq, one); } else mm.compose(zero, qq, zero);
        dep.setMatrixAt(i, mm);
      }
      beam.instanceMatrix.needsUpdate = true; dep.instanceMatrix.needsUpdate = true;
      ovGlow.material.opacity = 0.3 + 0.04 * Math.sin(ft * 3);
      camKeys(C, KC, ft); G(0, 0);
      const yU = 2 * kdef * Lm * (XP - x1) + kdef * Lm * Lm;
      return [S, C, [["silver atoms", -2.0, 0.02, 0, win(ft, 393.9, 395.8, 0.4)], ["magnet", xm, 0.75, 0.4, win(ft, 395.2, 397.4, 0.4)],
        ["spin up", XP, 0.05 + yU, 0, win(ft, 398.5, 400.7, 0.4)], ["spin down", XP, 0.05 - yU, 0, win(ft, 398.9, 400.7, 0.4)]]];
    };
  }

  // ---- the "equation" as a mechanism: brass plate, gear train, balance wheel. bolted = spin part bolted on from outside; appears = grows from inside
  function gearGeo(n, m, thick, spokes) {
    const rp = n * m / 2, ra = rp + m, rf = rp - 1.25 * m, step = TAU / n, sh = new THREE.Shape();
    for (let i = 0; i < n; i++) { const c = i * step; [[rf, c - step * 0.3], [ra, c - step * 0.16], [ra, c + step * 0.16], [rf, c + step * 0.3]].forEach(([r, a], k) => { const x = r * Math.cos(a), y = r * Math.sin(a); if (i === 0 && k === 0) sh.moveTo(x, y); else sh.lineTo(x, y); }); }
    sh.closePath();
    const ri = Math.max(rf * 0.28, 0.05), ro = rf * 0.8;
    if (spokes && ro - ri > 0.06) for (let k = 0; k < spokes; k++) { const a0 = k / spokes * TAU + 0.16, a1 = (k + 1) / spokes * TAU - 0.16, h = new THREE.Path(); h.absarc(0, 0, ro, a0, a1, false); h.lineTo(ri * Math.cos(a1), ri * Math.sin(a1)); h.absarc(0, 0, ri, a1, a0, true); h.closePath(); sh.holes.push(h); }
    const g = new THREE.ExtrudeGeometry(sh, { depth: thick, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 20 }); g.translate(0, 0, -thick / 2);
    return { g, rp };
  }
  function mechanism(S) {
    const M0 = new THREE.Group(); S.add(M0);
    const brass = new THREE.MeshStandardMaterial({ color: 0xdcbc7c, metalness: 0.9, roughness: 0.36, envMapIntensity: 1.8 }), steel = new THREE.MeshStandardMaterial({ color: 0xb7bbc2, metalness: 1, roughness: 0.3, envMapIntensity: 1.5 });
    const blued = new THREE.MeshStandardMaterial({ color: 0x2b3f63, metalness: 1, roughness: 0.3 });
    const ruby = new THREE.MeshPhysicalMaterial({ color: 0x8c1f2a, roughness: 0.1, metalness: 0, clearcoat: 1 });
    const perl = pixTex("perlage", 768, 512, (x, y) => { let k = 0; for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) { const row = Math.floor(y / 38) + j, cx = (Math.floor(x / 44) + i) * 44 + 22 + (((row % 2) + 2) % 2) * 22, cy = row * 38 + 19, d = Math.hypot(x - cx, y - cy); if (d < 30) k = Math.max(k, 0.5 + 0.5 * Math.sin(d * 0.9 + Math.atan2(y - cy, x - cx) * 2)); } const v = 0.86 + 0.1 * k; return [214 * v, 186 * v, 128 * v]; });
    const plateM = new THREE.MeshStandardMaterial({ color: 0xffffff, map: perl, metalness: 0.85, roughness: 0.42, envMapIntensity: 1.6 });
    const plate = new THREE.Mesh(roundBox(5.6, 3.1, 0.08, 0.06), plateM); plate.position.set(0, 0, -0.04); M0.add(plate);
    const baseW = new THREE.Mesh(roundBox(6.2, 0.35, 1.3, 0.05), X3.mats.wood); baseW.position.set(0, -1.75, 0.1); M0.add(baseW);
    for (const [x, y] of [[-2.6, 1.35], [2.6, 1.35], [-2.6, -1.35], [2.6, -1.35]]) { const sc = cyl(0.06, 0.06, 0.04, blued, 24); sc.rotation.x = Math.PI / 2; sc.position.set(x, y, 0.02); M0.add(sc); M0.add(at(box(0.1, 0.012, 0.02, X3.mats.ink), x, y, 0.045)); }
    const m = 0.045, T = 0.05;
    const addGear = (n, x, y, z, spokes) => { const { g, rp } = gearGeo(n, m, T, spokes); const me = new THREE.Mesh(g, brass); me.position.set(x, y, z); M0.add(me); const arb = cyl(0.025, 0.025, z + 0.08, steel, 16); arb.rotation.x = Math.PI / 2; arb.position.set(x, y, (z + 0.08) / 2 - 0.02); M0.add(arb); M0.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.03, 16, 8), ruby), x, y, 0.01)); return { me, n, rp, x, y, z }; };
    // child c meshes parent p at world angle al: c turns -(np/nc) as fast; phase puts a gap of c opposite a tooth of p
    const meshTo = (p, nc, al, z, spokes) => { const d = p.rp + nc * m / 2, c = addGear(nc, p.x + d * Math.cos(al), p.y + d * Math.sin(al), z, spokes); c.al = al; c.par = p; return c; };
    const G0 = addGear(64, -1.3, -0.1, 0.08, 5);
    const G1 = meshTo(G0, 16, 0.25, 0.08, 0);
    const G1b = addGear(40, G1.x, G1.y, 0.16, 5);
    const G2 = meshTo(G1b, 14, -0.9, 0.16, 0);
    const G2b = addGear(30, G2.x, G2.y, 0.24, 4);
    const bal = new THREE.Group(); bal.position.set(-2.0, 1.05, 0.14); M0.add(bal);
    bal.add(new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.022, 12, 72), brass));
    for (let k = 0; k < 3; k++) { const sp = box(0.72, 0.02, 0.012, brass); sp.rotation.z = k * Math.PI / 3; bal.add(sp); }
    const spiral = []; for (let i = 0; i <= 200; i++) { const a = i / 200 * TAU * 4.5, rr = 0.04 + i / 200 * 0.2; spiral.push(new V3(rr * Math.cos(a), rr * Math.sin(a), 0.02)); }
    bal.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(spiral), 400, 0.004, 6, false), blued));
    M0.traverse((q) => { if (q.isMesh) { q.castShadow = true; q.receiveShadow = true; } });
    // phases: parent at rotation ph_p has a tooth at angle al when ph_p = al (mod step); the child needs a gap at al+pi
    G0.ph0 = 0;
    G1.ph0 = G1.al + Math.PI - Math.PI / G1.n + (G0.n / G1.n) * (G1.al - G0.ph0); G1b.ph0 = 0;
    G2.ph0 = G2.al + Math.PI - Math.PI / G2.n + (G1b.n / G2.n) * (G2.al - G1b.ph0);
    const set = (ft) => {
      const th = ft * 0.25;
      G0.me.rotation.z = G0.ph0 + th;
      const t1 = -th * G0.n / G1.n; G1.me.rotation.z = G1.ph0 + t1; G1b.me.rotation.z = G1b.ph0 + t1;
      const t2 = -t1 * G1b.n / G2.n; G2.me.rotation.z = G2.ph0 + t2; G2b.me.rotation.z = t2; G2b.t = t2;
      bal.rotation.z = 1.9 * Math.sin(ft * TAU * 0.5);
    };
    return { M0, set, G2b, m, T, brass, steel };
  }
  function boltedScene(o, seamless) {
    const S = stage("studio", { key: 2.1, rim: 1.4, hemi: 0.28, floorY: -1.92, bg: 0x0d0f13 });
    backdrop(S, "#0f1217", "#262d38", "#0f1217");
    const key = S.userData.key; key.position.set(-5, 8, 9);
    const Mc = mechanism(S), G2b = Mc.G2b;
    // the spin part: a gear + a cut-away electron on its shaft
    const nS = seamless ? 22 : 18, mS = seamless ? Mc.m : Mc.m * 1.22;
    const sg = gearGeo(nS, mS, Mc.T, seamless ? 4 : 0).g;
    const al = 0.45, dS = G2b.rp + nS * Mc.m / 2 + (seamless ? 0 : 0.035);
    const cx = G2b.x + dS * Math.cos(al), cy = G2b.y + dS * Math.sin(al);
    const spinG = new THREE.Mesh(sg, seamless ? Mc.brass : new THREE.MeshStandardMaterial({ color: 0x8d9097, metalness: 0.85, roughness: 0.48 }));
    const part = new THREE.Group(); S.add(part);
    spinG.position.set(cx, cy, 0.24); part.add(spinG);
    const E = spinElectron(0.36); E.g.position.set(cx, cy, 0.9); part.add(E.g);
    const shaft = cyl(0.03, 0.03, 0.32, Mc.steel, 16); shaft.rotation.x = Math.PI / 2; shaft.position.set(cx, cy, 0.4); part.add(shaft);
    const bolts = [];
    if (!seamless) {
      // clumsy bracket: zinc-grey L-plate, crooked, four hex bolts with washers, bolted over the plate edge
      const zinc = new THREE.MeshStandardMaterial({ color: 0x7c8088, metalness: 0.8, roughness: 0.55 });
      const br = new THREE.Group(); br.position.set(cx + 0.1, cy, 0.12); br.rotation.z = 0.07; part.add(br);
      br.add(at(box(1.25, 0.95, 0.05, zinc), 0.35, 0, 0.0), at(box(0.06, 0.95, 0.5, zinc), 0.95, 0, -0.22));
      const hexG = new THREE.CylinderGeometry(0.055, 0.055, 0.05, 6), washG = new THREE.CylinderGeometry(0.075, 0.075, 0.012, 24);
      for (const [x, y] of [[-0.12, 0.36], [0.82, 0.36], [-0.12, -0.36], [0.82, -0.36]]) { const b = new THREE.Group(); b.position.set(x, y, 0.03); const h = new THREE.Mesh(hexG, zinc); h.rotation.x = Math.PI / 2; h.position.z = 0.03; const w = new THREE.Mesh(washG, zinc); w.rotation.x = Math.PI / 2; b.add(h, w); br.add(b); bolts.push(b); }
    }
    part.traverse((q) => { if (q.isMesh) { q.castShadow = true; q.receiveShadow = true; } });
    const C = cam(32), G = grade(S, C);
    const KC = seamless
      ? keyed([[407.54, 0.6, 0.0, 0.3, 7.6, -16, 8, 0.2, 0.12], [411.0, 1.0, 0.0, 0.3, 6.4, -8, 8, 0.2, 0.12], [414.0, 1.7, 0.0, 0.5, 4.4, 4, 8, 0.06, 0], [419.0, 2.0, 0.0, 0.6, 3.5, 14, 9, 0.02, 0]])
      : keyed([[400.84, 0.4, 0.0, 0.2, 7.8, -14, 8], [403.6, 1.2, 0.0, 0.3, 5.8, -4, 8], [407.54, 1.9, 0.0, 0.4, 4.4, 10, 9]]);
    const phS = al + Math.PI - Math.PI / nS;   // G2b sits at rotation 0 + t2; its tooth 0 faces al when t2 = al
    return (t) => {
      const ft = o.T0 + t;
      Mc.set(ft);
      const base = phS + (G2b.n / nS) * (al - G2b.t) - (G2b.n / nS) * al + (G2b.n / nS) * al;
      if (seamless) {
        // grows out of the plate 409.0-410.6 (meshing all the way); electron 410.6-412.0; its magnet 412.7-414.2; settles pointing up 415.0-417.6
        const grow = seg(ft, 409.0, 410.6);
        part.position.z = lerp(-0.42, 0, grow); spinG.scale.setScalar(lerp(0.75, 1, grow)); spinG.visible = grow > 0.001;
        const eg = seg(ft, 410.6, 412.0); E.g.visible = shaft.visible = eg > 0.001; E.g.scale.setScalar(Math.max(0.001, eg)); shaft.scale.set(1, Math.max(0.001, eg), 1);
        E.mag.scale.setScalar(Math.max(0.001, seg(ft, 412.7, 414.2)));
        spinG.rotation.z = base;
        E.g.rotation.set(0, 0.25 * Math.sin(ft * 0.4), lerp(0.9, 0, seg(ft, 415.0, 417.6)) * (0.7 + 0.3 * Math.cos(ft * 1.1)));
      } else {
        // slides in 401.9-402.9, bolts screw in 403.0-404.0; then the mismatched gear grinds (stick-slip, wobble)
        part.position.x = lerp(0.9, 0, seg(ft, 401.9, 402.9));
        bolts.forEach((b, i) => { const u = seg(ft, 403.0 + i * 0.22, 403.35 + i * 0.22); b.position.z = 0.03 + 0.12 * (1 - u); b.rotation.z = -6 * u; });
        const slip = 0.18 * (Math.floor(ft * 2.2) - ft * 2.2);
        spinG.rotation.z = base + (ft > 404.0 ? slip : 0); spinG.position.z = 0.24 + 0.012 * Math.sin(ft * 9);
        E.g.rotation.set(0.15 * Math.sin(ft * 3.1), 0, 0.9 + 0.25 * Math.sin(ft * 2.3));
      }
      camKeys(C, KC, ft); G(seamless ? 0.9 * win(ft, 407.0, 412.6, 0.6) : 0, 0);
      return [S, C, seamless ? [["spin", cx + 0.1, cy + 0.38, 0.9, win(ft, 414.4, 417.8, 0.5)]] : [["spin, bolted on", cx + 0.5, cy + 0.6, 0.3, win(ft, 404.6, 407.2, 0.5)]]];
    };
  }

  LABK.spin = (o) => {
    const m = o.mode;
    if (m === "experiment") return experimentScene(o);
    if (m === "bolted") return boltedScene(o, false);
    if (m === "appears") return boltedScene(o, true);
    return magnetScene(o);
  };


  // ================================================================= LADDER (negative energy as an endless stone staircase)
  const STEP_RISE = 0.3, STEP_RUN = 0.5, NSTEP = 70, SW = 2.6;
  const stoneTex = () => pixTex("stone2", 512, 512, (x, y) => { const n = fbm(x / 90, y / 90, 21, 5), f = vn(x / 2.5, y / 2.5, 23), v = fbm(x / 14, y / 30, 25, 3); const k = 0.72 + 0.22 * n + 0.07 * f + 0.06 * (v - 0.5); return [118 * k, 111 * k, 100 * k]; });
  const wallTex = () => pixTex("ashlar", 512, 512, (x, y) => { const row = Math.floor(y / 128), bx = (x + (row % 2) * 128) % 256, by = y % 128, joint = bx < 5 || by < 5 ? 0.45 : 1, n = fbm(x / 50, y / 50, 31 + row, 5); const k = (0.62 + 0.28 * n + 0.05 * vn(x / 3, y / 3, 33)) * joint; return [120 * k, 113 * k, 102 * k]; });
  // step j top: y = -j*rise, z in [-j*run, -(j-1)*run] ; j = 0 is the landing (z 0..2.4)
  const stepPos = (j) => j <= 0 ? new V3(0.15, 0, 0.55) : new V3(0.15 * Math.cos(j * 1.7) * 0.6, -j * STEP_RISE, -(j - 0.5) * STEP_RUN);
  function stairs(S, o) {
    o = o || {};
    const stone = new THREE.MeshStandardMaterial({ map: stoneTex(), roughness: 0.88, metalness: 0 });
    const land = box(SW, 0.6, 2.4, stone); land.position.set(0, -0.3, 1.2); land.receiveShadow = land.castShadow = true; S.add(land);
    const st = new THREE.InstancedMesh(new THREE.BoxGeometry(SW, 0.9, STEP_RUN + 0.02), stone, NSTEP), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new V3(1, 1, 1), p = new V3();
    for (let j = 1; j <= NSTEP; j++) { p.set(0, -j * STEP_RISE - 0.45, -(j - 0.5) * STEP_RUN); mm.compose(p, q, sc); st.setMatrixAt(j - 1, mm); }
    st.receiveShadow = st.castShadow = true; S.add(st);
    // nosing edge (slightly worn darker lip) for definition
    const lipM = new THREE.MeshStandardMaterial({ color: 0x8c857a, roughness: 0.8 });
    const lip = new THREE.InstancedMesh(new THREE.BoxGeometry(SW + 0.02, 0.04, 0.05), lipM, NSTEP);
    for (let j = 1; j <= NSTEP; j++) { p.set(0, -j * STEP_RISE - 0.02, -(j - 1) * STEP_RUN - 0.02); mm.compose(p, q, sc); lip.setMatrixAt(j - 1, mm); }
    S.add(lip);
    // left wall of ashlar blocks
    const wallM = new THREE.MeshStandardMaterial({ map: wallTex(), roughness: 0.9 });
    const NW = 16, wl = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, 6, 3), wallM, NW);
    for (let k = 0; k < NW; k++) { p.set(-SW / 2 - 0.2, 1.2 - k * 1.8, 1.0 - k * 3); mm.compose(p, q, sc); wl.setMatrixAt(k, mm); }
    wl.receiveShadow = true; S.add(wl);
    // the light above the landing (the atom's normal home)
    const spot = new THREE.SpotLight(0xffe2bc, o.spot || 30, 0, o.angle || 0.42, 0.85, 2); spot.position.set(0.9, 5.4, 2.2); spot.target.position.set(0, -0.4, 0.4);
    spot.castShadow = true; spot.shadow.mapSize.set(1024, 1024); spot.shadow.bias = -0.0005; S.add(spot, spot.target);
    S.fog = new THREE.FogExp2(0x0b0c10, o.fog || 0.13);
    return { spot, st };
  }
  // electron hop path: hops[k] = landing time on step k+1 (from step k); dur = flight time
  function hopper(hops, r) {
    return (ft) => {
      let j = 0; while (j < hops.length && ft >= hops[j]) j++;
      const base = stepPos(j); base.y += r;
      if (j < hops.length) {
        const prev = j === 0 ? -1 : hops[j - 1], dur = Math.min(0.55, (hops[j] - prev) * 0.75), t0 = hops[j] - dur;
        if (ft > t0) { const u = (ft - t0) / dur, a = stepPos(j), b = stepPos(j + 1); a.y += r; b.y += r; const pz = lerp(a.z, b.z, u), px = lerp(a.x, b.x, u), py = lerp(a.y, b.y, u) + 4 * 0.1 * u * (1 - u) * (0.6 + dur); return { p: new V3(px, py, pz), j }; }
      }
      return { p: base, j };
    };
  }
  // a pool of small warm photon flashes at the step contacts
  function photonFlashes(S, hops, n) {
    const sp = [], lights = [];
    for (let i = 0; i < hops.length; i++) { const s = glowSprite(0xffd9a6, 0.6, 0); S.add(s); sp.push(s); }
    for (let i = 0; i < 3; i++) { const l = new THREE.PointLight(0xffd2a0, 0, 3.5, 2); S.add(l); lights.push(l); }
    return (ft, r) => {
      const act = [];
      hops.forEach((h, i) => { const a = ft - h, k = a < 0 ? 0 : Math.exp(-a * 4.5) * smooth(a / 0.03 + 0.01); const p = stepPos(i + 1); sp[i].position.set(p.x, p.y + 0.06, p.z); sp[i].material.opacity = 0.75 * k; sp[i].scale.setScalar(0.35 + 0.5 * (1 - k)); sp[i].visible = k > 0.003; if (k > 0.01) act.push([k, p]); });
      act.sort((a, b) => b[0] - a[0]);
      lights.forEach((l, i) => { if (act[i]) { l.position.set(act[i][1].x, act[i][1].y + 0.25, act[i][1].z); l.intensity = 9 * act[i][0]; } else l.intensity = 0; });
    };
  }
  function ladderScene(o, mode) {
    const S = stage("void", { dust: 0, key: 0.12, rim: 0.45, hemi: 0.1, bg: 0x0c0e12 });
    const r = 0.13, el = X3.electron(r); S.add(el);
    const C = cam(34), G = grade(S, C);
    let hops = [], KC, beads = null;
    if (mode === "down") {
      hops = [481.55, 482.15, 482.75];
      KC = keyed([[477.94, 0.3, -0.2, 0.2, 5.6, 28, 30], [481.0, 0.2, -0.4, -0.1, 5.0, 22, 32], [483.98, 0.1, -0.7, -0.6, 4.4, 16, 33]]);
    } else if (mode === "fall") {
      hops = [492.6, 493.75, 495.1, 495.95, 496.65, 497.25, 497.78, 498.25, 498.68, 499.06, 499.4, 499.7, 499.97, 500.2];
    } else {
      // either: rows of faint electron beads on every step below (the sea, foreshadowed)
      const NB = 5 * 40; beads = new THREE.InstancedMesh(new THREE.SphereGeometry(0.11, 24, 16), X3.mats.electron, NB);
      const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = new V3(1, 1, 1), p = new V3(), rr = rnd(17);
      for (let j = 1; j <= 40; j++) for (let k = 0; k < 5; k++) { p.set(-0.95 + k * 0.475 + (rr() - 0.5) * 0.06, -j * STEP_RISE + 0.11, -(j - 0.5) * STEP_RUN + (rr() - 0.5) * 0.08); mm.compose(p, q, sc); beads.setMatrixAt((j - 1) * 5 + k, mm); }
      S.add(beads);
      const faint = new THREE.DirectionalLight(0xaebfd6, 0.0); faint.position.set(2, 3, 6); S.add(faint); beads.userData.l = faint;
      KC = keyed([[510.24, 0.1, 0.1, 0.6, 4.4, 24, 22], [512.4, 0.1, -0.2, 0.2, 4.2, 18, 30], [515.86, 0.0, -2.6, -3.6, 4.6, 8, 52]]);
    }
    const st = stairs(S, { spot: mode === "fall" ? 26 : 32, fog: mode === "either" ? 0.1 : 0.13 });
    const path = hopper(hops, r), fl = photonFlashes(S, hops);
    return (t) => {
      const ft = o.T0 + t;
      const h = path(ft); el.position.copy(h.p);
      fl(ft, r);
      if (mode === "fall") {
        const lag = path(ft - 0.45).p;
        // reveal: the stairs below are lit softly at first, the camera then follows the electron down into the dark
        aim(C, lag.x * 0.5, lag.y - 0.3, lag.z - 0.4, 4.6 + 0.08 * Math.max(0, -lag.y), lerp(24, 10, seg(ft, 488, 500)), lerp(28, 40, seg(ft, 488, 495)));
        G(0.85 * win(ft, 497.9, 500.4, 0.4), 0);
      } else {
        camKeys(C, KC, ft); G(0, 0);
        if (beads) beads.userData.l.intensity = 0.7 * seg(ft, 511.8, 513.5);
      }
      const pins = mode === "down" ? [["the lowest step it can reach", h.p.x, h.p.y + 0.15, h.p.z, win(ft, 482.9, 483.95, 0.3)]] : [];
      return [S, C, pins];
    };
  }

  // collapse (500.06-507.08): many atoms, each electron cloud falls into its nucleus with a burst of light (cascade 501.6-504.9), then darkness
  function collapseScene(o) {
    const S = stage("void", { dust: 500, dustR: 14, key: 1.4, rim: 1.0, hemi: 0.25, seed: 41, bg: 0x0b0d11 });
    backdrop(S, "#0e1116", "#262d38", "#0e1116");
    const C = cam(34), rr = rnd(43), atoms = [], NAt = 22;
    const cloudM = (seed) => new THREE.SpriteMaterial({ map: seed < 10 ? SOFT() : hazeTex(seed), color: 0xa9c4e2, transparent: true, opacity: 0.4, depthWrite: false, blending: THREE.AdditiveBlending });
    for (let i = 0; i < NAt; i++) {
      const p = new V3((rr() - 0.5) * 11, (rr() - 0.5) * 5.6, -rr() * 9 + 1.5), g = new THREE.Group(); g.position.copy(p); S.add(g);
      const nuc = X3.nucleon("p", 0.06); g.add(nuc);
      const c1 = new THREE.Sprite(cloudM(7)); c1.scale.setScalar(1.3); g.add(c1);
      const c2 = new THREE.Sprite(cloudM(12 + (i % 3))); c2.scale.setScalar(0.8); g.add(c2);
      const fl = glowSprite(0xffe2bc, 1, 0); g.add(fl);
      const wide = glowSprite(0xffcf98, 1, 0); g.add(wide);
      atoms.push({ g, c1, c2, fl, wide, tc: 501.6 + 3.3 * Math.pow(rr(), 0.8), ph: rr() * TAU });
    }
    const KC = keyed([[500.06, 0, 0, -1, 7.0, -8, 4], [503.5, 0, 0, -1, 6.2, 0, 3], [507.08, 0, 0, -1, 5.6, 8, 2]]);
    const blaze = glowSprite(0xffd9a8, 30, 0); blaze.position.set(0, 0, -6); S.add(blaze);
    const dust = dustOf(S), G = grade(S, C);
    return (t) => {
      const ft = o.T0 + t; let tot = 0;
      atoms.forEach((A) => {
        const u = seg(ft, A.tc - 0.35, A.tc), a = ft - A.tc;
        const s = lerp(1, 0.04, u * u);
        A.c1.scale.setScalar(1.3 * s * (1 + 0.04 * Math.sin(ft * 1.3 + A.ph))); A.c2.scale.setScalar(0.8 * s);
        A.c1.material.opacity = 0.32 * (1 - u * 0.6) * (a > 0.1 ? 0 : 1); A.c2.material.opacity = 0.22 * (a > 0.1 ? 0 : 1); A.g.children[0].visible = a < 1.4;
        A.c1.material.rotation = ft * 0.2 + A.ph + u * 6; A.c2.material.rotation = -ft * 0.3 - u * 8;
        const k = a < 0 ? 0 : Math.exp(-a * 1.6) * smooth(a / 0.08);
        A.fl.material.opacity = 0.85 * k; A.fl.scale.setScalar(0.6 + 1.4 * (1 - k));
        A.wide.material.opacity = 0.22 * k; A.wide.scale.setScalar(3 + 3 * (1 - k));
        tot += k;
      });
      blaze.material.opacity = Math.min(0.3, 0.035 * tot) * (1 - seg(ft, 505.6, 506.8));
      dust.rotation.y = ft * 0.01;
      camKeys(C, KC, ft); G(0, 0.0);
      return [S, C, []];
    };
  }

  LABK.ladder = (o) => {
    if (o.mode === "collapse") return collapseScene(o);
    return ladderScene(o, o.mode === "fall" ? "fall" : o.mode === "either" ? "either" : "down");
  };

  LABK.cosmos = (o) => {
    const m = o.mode;
    if (m === "meet") return meetScene(o, true);
    if (m === "drop") return dropScene(o);
    if (m === "potassium") return potassiumScene(o);
    if (m === "tiny") return tinyScene(o);
    return meetScene(o, false);
  };
})();
