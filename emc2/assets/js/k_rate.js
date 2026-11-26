/* k_rate.js — group D kinds for "Nobody Explained E = mc² Like THIS!": exchange, paperclip, hiroshima, pet.
   LABK.name = (o) => (t, d) => [scene, camera, pins]; ft = o.T0 + t is FILM time. Every time constant below is in film seconds.
   Units: 1 = 10 cm (same as X3.paperclip / X3.balance). Pure functions of t, seeded randomness only. */
(function () {
  const { THREE, M, seg, smooth, smoother, lerp, clamp, rnd, orbit, stage, canvasTex, glowSprite, W, H } = L3;
  const V3 = THREE.Vector3, TAU = Math.PI * 2;
  const win = (t, a, b, f) => { f = f || 0.4; return seg(t, a, a + f) * (1 - seg(t, b - f, b)); };
  const fr = (x) => x - Math.floor(x);

  // ---------------------------------------------------------------- camera
  function aim(C, tx, ty, tz, dist, az, el, oy, ox) {
    orbit(C, tx, ty, tz, dist, az, el);
    C.near = Math.max(0.004, dist * 0.02); C.far = Math.max(200, dist * 60);
    if (oy || ox) C.setViewOffset(W, H, (ox || 0) * W, (oy || 0) * H, W, H); else C.clearViewOffset();
    C.updateProjectionMatrix();
  }
  // Catmull-Rom through [[t, v], ...]: one continuous move, eased ends
  function cr(K, t) {
    const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    let i = 0; while (t >= K[i + 1][0]) i++;
    const a = K[Math.max(i - 1, 0)], b = K[i], c = K[i + 1], d = K[Math.min(i + 2, n - 1)], h = c[0] - b[0], u = (t - b[0]) / h;
    const m1 = i === 0 ? 0 : (c[1] - a[1]) / (c[0] - a[0]) * h, m2 = i + 2 >= n ? 0 : (d[1] - b[1]) / (d[0] - b[0]) * h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * b[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * c[1] + (u3 - u2) * m2;
  }
  // keys: [[ft, tx, ty, tz, dist, az, el, oy?], ...]
  function camKeys(C, K, t) { const g = (j) => cr(K.map((k) => [k[0], k[j] || 0]), t); aim(C, g(1), g(2), g(3), g(4), g(5), g(6), g(7)); }

  // ---------------------------------------------------------------- procedural textures (cached at module level: builders run once per shot)
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function vn(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s, o) { let f = 0, a = 0.5; for (let i = 0; i < (o || 4); i++) { f += a * vn(x, y, s + i * 17); x *= 2; y *= 2; a *= 0.5; } return f; }
  const TC = {};
  function pixTex(key, w, h, fn, rep, data) {
    if (TC[key]) return TC[key];
    const t = canvasTex(w, h, (g) => { const im = g.createImageData(w, h), D = im.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn(x, y), i = (y * w + x) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = 255; } g.putImageData(im, 0, 0); });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; if (rep) t.repeat.set(rep[0], rep[1]); t.anisotropy = 8;
    if (data) t.colorSpace = THREE.NoColorSpace;
    return (TC[key] = t);
  }
  const cached = (key, fn) => TC[key] || (TC[key] = fn());
  const woodTex = (key, base, seed) => pixTex(key, 1024, 512, (x, y) => {
    const n = fbm(x / 420, y / 40, seed, 4), ring = 0.5 + 0.5 * Math.sin((y / 512 * 60 + n * 3.2) * Math.PI), fine = vn(x / 3, y / 0.9, seed + 9), streak = fbm(x / 900, y / 6, seed + 5, 3);
    const k = 0.8 + 0.1 * Math.pow(ring, 3) + 0.06 * fine + 0.14 * (streak - 0.5) - 0.08 * fbm(x / 300, y / 200, seed + 3, 2);
    return [base[0] * k, base[1] * k, base[2] * k];
  });
  function woodMat(key, base, seed, rep, rough) {
    const t = woodTex(key, base, seed).clone(); t.repeat.set(rep[0], rep[1]); t.needsUpdate = true;
    return new THREE.MeshStandardMaterial({ map: t, roughness: rough || 0.5, metalness: 0, envMapIntensity: 0.8 });
  }
  // brushed metal: fine streaks along x + a few scratches
  const brushedTex = (key, base, seed, amp) => pixTex(key, 1024, 1024, (x, y) => {
    let k = 1 + (amp || 0.08) * ((vn(x / 260, y / 0.6, seed) - 0.5) * 1.4 + (vn(x / 40, y / 0.4, seed + 3) - 0.5) * 0.6) + 0.05 * (fbm(x / 200, y / 200, seed + 7, 3) - 0.5);
    const sc = fr((x * 0.013 + y * 0.002) + vn(x / 90, y / 90, seed + 11) * 0.6); if (sc < 0.004 && hash(Math.floor(x / 60), Math.floor(y / 60), seed) > 0.6) k += 0.12;
    return [base[0] * k, base[1] * k, base[2] * k];
  });
  let _dot; const DOT = () => _dot || (_dot = canvasTex(64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.3, "rgba(255,255,255,.7)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }));
  // soft noisy haze puff (for particles / steam-like glows)
  const hazeTex = (seed) => cached("haze" + seed, () => canvasTex(256, 256, (g) => {
    const im = g.createImageData(256, 256), D = im.data;
    for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
      const dx = (x - 127.5) / 127.5, dy = (y - 127.5) / 127.5, r = Math.sqrt(dx * dx + dy * dy), n = fbm(x / 34, y / 34, seed, 5);
      const a = Math.pow(clamp(1 - r, 0, 1), 1.5) * clamp(0.35 + 1.1 * (n - 0.3), 0, 1.2); const i = (y * 256 + x) * 4; D[i] = D[i + 1] = D[i + 2] = 255; D[i + 3] = 255 * clamp(a, 0, 1);
    }
    g.putImageData(im, 0, 0);
  }));

  // ---------------------------------------------------------------- geometry helpers
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
  const cyl = (r1, r2, h, mat, seg) => new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg || 32), mat);
  // a rod between two points
  function rodBetween(a, b, r, mat) { const m = cyl(r, r, a.distanceTo(b), mat, 16); m.position.copy(a).add(b).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), b.clone().sub(a).normalize()); return m; }
  // a thin streak (unit cylinder, base at 0) placed from a to b
  const STREAK_G = (() => { const g = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true); g.translate(0, 0.5, 0); return g; })();
  function placeStreak(m, a, b, w) { const d = b.clone().sub(a), L = d.length(); m.visible = L > 1e-5; if (!m.visible) return; m.position.copy(a); m.quaternion.setFromUnitVectors(new V3(0, 1, 0), d.multiplyScalar(1 / L)); m.scale.set(w, L, w); }
  // floor of a studio stage -> custom material
  function setFloor(S, mat) { const f = S.children.find((m) => m.isMesh); if (f) f.material = mat; return f; }
  // full-frame veil glued to the camera (additive warm wash or black fade)
  function veil(S, C, additive) {
    const t = additive ? canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 10, 128, 128, 180); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0.15)"); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); }) : null;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(4, 4), new THREE.MeshBasicMaterial({ color: additive ? 0xffc890 : 0x0b0c10, map: t, transparent: true, opacity: 0, depthTest: false, depthWrite: false, fog: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending }));
    m.renderOrder = 999; C.add(m); if (!C.parent) S.add(C);
    return (k) => { m.position.set(0, 0, -C.near * 1.5); m.scale.set(C.near * 1.5 * 1.8, C.near * 1.5, 1); m.material.opacity = clamp(k, 0, 1); m.visible = k > 0.002; };
  }

  // soft out-of-focus back wall with a pool of light (lifts the frame off pure black, documentary feel)
  function backdrop(S, z, y, w, h, inner, outer, cx, cy) {
    const t = canvasTex(512, 256, (g) => { const gr = g.createRadialGradient(256 * (cx || 1), 256 * (cy || 0.55), 10, 256, 128, 300); gr.addColorStop(0, inner); gr.addColorStop(1, outer); g.fillStyle = gr; g.fillRect(0, 0, 512, 256); const lg = g.createLinearGradient(0, 120, 0, 256); lg.addColorStop(0, "rgba(11,12,16,0)"); lg.addColorStop(1, "rgba(11,12,16,0.95)"); g.fillStyle = lg; g.fillRect(0, 0, 512, 256); });
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, fog: false, depthWrite: false })); m.position.set(0, y, z); m.renderOrder = -1; S.add(m); return m;
  }

  // ---------------------------------------------------------------- warm light pouring out of an opening (exchange machine)
  function beamMat() {
    return new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending,
      uniforms: { uCol: { value: new THREE.Color(0xffc98e) }, uOp: { value: 0 }, uT: { value: 0 } },
      vertexShader: `varying vec2 vUv; varying vec3 vN, vV, vW; void main(){ vUv = uv; vec4 wp = modelMatrix * vec4(position, 1.0); vW = wp.xyz; vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
      fragmentShader: `uniform vec3 uCol; uniform float uOp, uT; varying vec2 vUv; varying vec3 vN, vV, vW;
        void main(){ float f = abs(dot(normalize(vN), normalize(vV))); float along = vUv.y;
          float shimmer = 0.85 + 0.15 * sin(vW.x * 7.0 - uT * 1.7 + vUv.x * 18.0) * sin(vUv.x * 11.0 + uT * 0.9);
          float a = pow(f, 2.2) * pow(1.0 - along, 1.7) * smoothstep(0.0, 0.06, along) * uOp * shimmer;
          gl_FragColor = vec4(uCol, a);
          #include <colorspace_fragment>
        }`,
    });
  }
  function lightSpill(S, pos, len, r0, r1, seed) {
    const g = new THREE.Group(); g.position.copy(pos); S.add(g);
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(r1, r0, len, 48, 1, true), beamMat());
    cone.geometry.rotateZ(-Math.PI / 2); cone.geometry.translate(len / 2, 0, 0); g.add(cone);
    const cone2 = new THREE.Mesh(new THREE.CylinderGeometry(r1 * 1.8, r0 * 1.4, len * 1.3, 48, 1, true), beamMat());
    cone2.geometry.rotateZ(-Math.PI / 2); cone2.geometry.translate(len * 0.65, -0.05, 0); g.add(cone2);
    const glow = glowSprite(0xffcf98, 0.9, 0); g.add(glow);
    const glow2 = glowSprite(0xffb877, 2.6, 0); glow2.position.x = 0.4; g.add(glow2);
    const pl = new THREE.PointLight(0xffbf80, 0, 0, 2); pl.position.set(0.18, 0.05, 0); g.add(pl);
    const pl2 = new THREE.PointLight(0xffc68c, 0, 0, 2); pl2.position.set(len * 0.45, 0.3, 0.2); g.add(pl2);
    // slow motes drifting out with the light
    const N = 70, r = rnd(seed || 5), ph = [], pg = new THREE.BufferGeometry(), pp = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) ph.push([r(), r() * TAU, Math.sqrt(r()), 0.12 + r() * 0.2]);
    pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ map: DOT(), color: 0xffd9a8, size: 0.035, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(pts);
    return (k, ft, big) => {
      big = big || 1;
      cone.material.uniforms.uOp.value = 0.32 * k; cone.material.uniforms.uT.value = ft;
      cone2.material.uniforms.uOp.value = 0.12 * k * big; cone2.material.uniforms.uT.value = ft * 0.7;
      glow.material.opacity = 0.55 * k; glow.scale.setScalar(0.7 + 0.25 * big);
      glow2.material.opacity = 0.16 * k * big; glow2.scale.setScalar(2.2 * big);
      pl.intensity = 2.2 * k * big; pl2.intensity = 2.6 * k * big * big;
      pts.material.opacity = 0.75 * k; pts.visible = k > 0.01; cone.visible = cone2.visible = glow.visible = glow2.visible = k > 0.002;
      for (let i = 0; i < N; i++) { const [p0, a, rr, sp] = ph[i], u = fr(p0 + ft * sp), x = u * len * 0.95, rad = lerp(r0, r1, u) * rr * 0.8; pp[i * 3] = x; pp[i * 3 + 1] = Math.sin(a + ft * 0.3) * rad * 0.7 + u * 0.05; pp[i * 3 + 2] = Math.cos(a + ft * 0.3) * rad; }
      pg.attributes.position.needsUpdate = true;
    };
  }

  // ================================================================= COINS (real milled edges + embossed faces)
  const COIN_R = 0.135, COIN_T = 0.02;   // 27 mm x 2 mm
  function arcText(g, text, cx, cy, rad, a0, a1, up) {
    const n = text.length;
    for (let i = 0; i < n; i++) { const a = a0 + (a1 - a0) * (i + 0.5) / n; g.save(); g.translate(cx + rad * Math.cos(a), cy + rad * Math.sin(a)); g.rotate(a + (up ? Math.PI / 2 : -Math.PI / 2)); g.fillText(text[i], 0, 0); g.restore(); }
  }
  function coinFace(kind) {
    return cached("coin_" + kind, () => {
      const S = 512, c = document.createElement("canvas"); c.width = c.height = S; const g = c.getContext("2d");
      g.fillStyle = "rgb(70,70,70)"; g.fillRect(0, 0, S, S);
      g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = "rgb(235,235,235)"; g.strokeStyle = "rgb(235,235,235)";
      // raised rim
      g.lineWidth = 22; g.beginPath(); g.arc(256, 256, 244, 0, TAU); g.stroke();
      if (kind === "inr") {
        g.lineWidth = 5; g.strokeStyle = "rgb(25,25,25)"; g.beginPath(); g.arc(256, 256, 160, 0, TAU); g.stroke(); g.strokeStyle = "rgb(235,235,235)";
        for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i - 4.5) * 0.13; if (Math.abs(i - 4.5) > 4.6) continue; g.lineWidth = 6; g.beginPath(); g.moveTo(256 + Math.cos(a) * 172, 256 + Math.sin(a) * 172); g.lineTo(256 + Math.cos(a) * 214, 256 + Math.sin(a) * 214); g.stroke(); }
        g.font = "600 150px 'Nirmala UI','Segoe UI Symbol','Segoe UI',Arial,sans-serif"; g.fillText("₹", 256, 196);
        g.font = "700 118px Georgia,'Times New Roman',serif"; g.fillText("10", 256, 318);
        g.font = "600 40px Georgia,serif"; arcText(g, "INDIA", 256, 256, 195, Math.PI * 0.72, Math.PI * 0.28, false);
        g.font = "600 30px Georgia,serif"; arcText(g, "2019", 256, 256, 196, -Math.PI * 0.12, Math.PI * 0.08, true);
      } else {
        g.font = "700 46px Georgia,'Times New Roman',serif"; arcText(g, "UNITED STATES OF AMERICA", 256, 256, 196, -Math.PI * 0.94, -Math.PI * 0.06, true);
        g.font = "700 50px Georgia,serif"; arcText(g, "ONE DOLLAR", 256, 256, 198, Math.PI * 0.78, Math.PI * 0.22, false);
        g.font = "700 200px Georgia,'Times New Roman',serif"; g.fillText("$1", 256, 262);
        g.font = "700 30px Georgia,serif"; for (const s of [-1, 1]) arcText(g, "★", 256, 256, 198, s > 0 ? Math.PI * 0.06 : Math.PI * 0.94, s > 0 ? Math.PI * 0.12 : Math.PI * 0.88, false);
      }
      // soften to a minted bevel
      const b = document.createElement("canvas"); b.width = b.height = S; const bg = b.getContext("2d"); bg.filter = "blur(2.2px)"; bg.drawImage(c, 0, 0);
      const rel = bg.getImageData(0, 0, S, S).data, col = new ImageData(S, S), D = col.data;
      const steel = [196, 200, 204], gold = kind === "inr" ? [202, 168, 98] : [196, 160, 88];
      for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
        const i = (y * S + x) * 4, rr = Math.hypot(x - 255.5, y - 255.5) / 256, h = rel[i] / 255;
        const base = kind === "inr" && rr > 0.625 ? steel : gold, k = 0.62 + 0.5 * h - 0.06 * (hash(x, y, 3) - 0.5);
        D[i] = clamp(base[0] * k, 0, 255); D[i + 1] = clamp(base[1] * k, 0, 255); D[i + 2] = clamp(base[2] * k, 0, 255); D[i + 3] = 255;
      }
      const cc = document.createElement("canvas"); cc.width = cc.height = S; cc.getContext("2d").putImageData(col, 0, 0);
      const map = new THREE.CanvasTexture(cc); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8;
      const bump = new THREE.CanvasTexture(b); bump.colorSpace = THREE.NoColorSpace; bump.anisotropy = 8;
      return { map, bump };
    });
  }
  const reedTex = () => cached("reeds", () => { const t = canvasTex(1024, 8, (g) => { for (let i = 0; i < 160; i++) { const gr = g.createLinearGradient(i * 6.4, 0, i * 6.4 + 6.4, 0); gr.addColorStop(0, "#202020"); gr.addColorStop(0.5, "#f0f0f0"); gr.addColorStop(1, "#202020"); g.fillStyle = gr; g.fillRect(i * 6.4, 0, 6.4, 8); } }); t.colorSpace = THREE.NoColorSpace; t.wrapS = THREE.RepeatWrapping; return t; });
  function coinKit(kind) {
    return cached("kit_" + kind, () => {
      const geo = new THREE.CylinderGeometry(COIN_R, COIN_R, COIN_T, 96, 1); geo.rotateX(Math.PI / 2);   // faces +z / -z
      const f = coinFace(kind);
      const face = new THREE.MeshStandardMaterial({ map: f.map, bumpMap: f.bump, bumpScale: 2.2, metalness: 1, roughness: 0.3 });
      const edge = new THREE.MeshStandardMaterial({ color: kind === "inr" ? 0xc4c8cc : 0xc6a35c, bumpMap: reedTex(), bumpScale: 2.5, metalness: 1, roughness: 0.28 });
      return { geo, mats: [edge, face, face] };
    });
  }
  const coin = (kind) => { const k = coinKit(kind), m = new THREE.Mesh(k.geo, k.mats); m.castShadow = true; m.receiveShadow = true; return m; };

  // ================================================================= ODOMETER (17 drums: 90 000 000 000 000 000)
  const DR = 0.12, DWID = 0.07;
  function digitTex(blur) {
    return cached("digits" + (blur ? "b" : ""), () => {
      const CW = 1000, CH = 2 * Math.round(CW * DWID / (TAU * DR)), ky = CH / (CW * DWID / (TAU * DR));   // canvas y is ky times denser than x
      const t = canvasTex(CW, CH, (g) => {
        g.fillStyle = "#121212"; g.fillRect(0, 0, CW, CH);
        const lg = g.createLinearGradient(0, 0, 0, CH); lg.addColorStop(0, "rgba(255,255,255,0.0)"); lg.addColorStop(0.5, "rgba(255,255,255,0.04)"); lg.addColorStop(1, "rgba(255,255,255,0.0)"); g.fillStyle = lg; g.fillRect(0, 0, CW, CH);
        g.textAlign = "center"; g.textBaseline = "middle"; g.font = "700 104px Arial,Helvetica,sans-serif";
        for (let d = 0; d < 10; d++) {
          const cx = (d + 0.5) * CW / 10, offs = blur ? Array.from({ length: 17 }, (_, i) => (i - 8) * 0.055) : [0];
          for (const o of offs) { g.save(); g.translate(cx + o * CW / 10, CH / 2); g.rotate(Math.PI / 2); g.scale(ky * 0.74, 1); g.fillStyle = blur ? "rgba(236,228,210,0.11)" : "#ece4d2"; g.fillText(String(d), 0, 6); g.restore(); }
        }
      });
      t.anisotropy = 8; return t;
    });
  }
  function odometer(n) {
    const g = new THREE.Group(), geo = new THREE.CylinderGeometry(DR, DR, DWID, 64, 1, true); geo.rotateZ(Math.PI / 2);
    const mS = new THREE.MeshStandardMaterial({ map: digitTex(false), roughness: 0.45, metalness: 0 }), mB = new THREE.MeshStandardMaterial({ map: digitTex(true), roughness: 0.45, metalness: 0 });
    const pitch = DWID + 0.022, gap = 0.05, groups = Math.floor((n - 1) / 3), total = n * pitch + groups * gap, drums = [];
    for (let k = 0; k < n; k++) { // k = 0 rightmost
      const x = total / 2 - pitch / 2 - k * pitch - Math.floor(k / 3) * gap;
      const m = new THREE.Mesh(geo, mS); m.position.x = x; g.add(m); drums.push(m);
      // brass axle collars between drums
    }
    // thin brass group pins
    const pinMat = X3.mats.brass;
    for (let j = 1; j <= groups; j++) { const x = total / 2 - j * 3 * pitch - (j - 0.5) * gap; const p = new THREE.Mesh(new THREE.SphereGeometry(0.009, 12, 8), pinMat); p.position.set(x, -0.055, DR + 0.002); g.add(p); }
    function pos(v, k) {
      const p10 = Math.pow(10, k), x = v / p10, d = Math.floor(x) % 10;
      if (k === 0) return x - 10 * Math.floor(x / 10);
      const lower = v - Math.floor(x) * p10; return d + clamp(lower - (p10 - 1), 0, 1);
    }
    function set(v, vdot) {
      for (let k = 0; k < n; k++) {
        const sp = Math.abs(vdot || 0) / Math.pow(10, k), m = drums[k];
        m.material = sp > 9 ? mB : mS;
        m.rotation.x = TAU * (pos(v, k) + 0.5) / 10 + (sp > 9 ? fr(v / Math.pow(10, k + 1)) * TAU : 0);
      }
    }
    return { group: g, set, width: total };
  }

  // ================================================================= GEARS
  function gearGeo(n, m, th, holes) {
    const rp = n * m / 2, rr = rp - m * 1.1, rt = rp + m * 0.9, s = new THREE.Shape(), da = TAU / n;
    for (let i = 0; i < n; i++) {
      const a0 = i * da, P = [[rr, a0], [rr, a0 + da * 0.2], [rt, a0 + da * 0.34], [rt, a0 + da * 0.56], [rr, a0 + da * 0.7]];
      P.forEach(([r, a], j) => { const x = r * Math.cos(a), y = r * Math.sin(a); if (!i && !j) s.moveTo(x, y); else s.lineTo(x, y); });
    }
    s.closePath();
    const hole = new THREE.Path(); hole.absarc(0, 0, Math.max(0.012, rr * 0.1), 0, TAU, true); s.holes.push(hole);
    for (let k = 0; k < (holes || 0); k++) { const a = k / holes * TAU, h = new THREE.Path(); h.absarc(Math.cos(a) * rr * 0.56, Math.sin(a) * rr * 0.56, rr * 0.24, 0, TAU, true); s.holes.push(h); }
    const g = new THREE.ExtrudeGeometry(s, { depth: th, bevelEnabled: true, bevelThickness: th * 0.18, bevelSize: th * 0.14, bevelSegments: 2, curveSegments: 18 });
    g.translate(0, 0, -th / 2); return { g, rp, da };
  }

  // ================================================================= THE EXCHANGE MACHINE
  // film-time schedule (sound cues read straight off these)
  const XR = { t0: 142.6, dt: 0.6, n: 14, speed: 0.9, per: 3 };          // rupee coin i leaves the hopper at t0 + i*dt; 3 rupees -> 1 dollar
  const RATE = { cubeOut: 155.0, cubeIn: 157.25, light: 157.75, plaque: 162.0 };
  const HUGE = { a: 166.6, c: 171.4, b: 173.3, end: 175.7, v0: 1420 };
  const RECAP = { cubeOut: 588.4, cubeIn: 589.95, light: 590.7 };
  const C_VAL = 299792458, C2_VAL = 9e16;
  function hugeVal(ft) {
    if (ft <= HUGE.a) return HUGE.v0;
    if (ft < HUGE.c) { const u = smooth((ft - HUGE.a) / (HUGE.c - HUGE.a)); return Math.pow(10, lerp(Math.log10(HUGE.v0), Math.log10(C_VAL), u)); }
    if (ft < HUGE.b) return C_VAL;
    if (ft < HUGE.end) { const u = smoother((ft - HUGE.b) / (HUGE.end - HUGE.b)); return Math.pow(10, lerp(Math.log10(C_VAL), Math.log10(C2_VAL), u)); }
    return C2_VAL;
  }

  function machine(o) {
    const mode = o.mode, night = mode === "recap";
    const S = stage("studio", { floorY: 0, key: night ? 1.4 : 3.0, hemi: night ? 0.5 : 0.45, rim: night ? 1.1 : 1.2, bg: night ? 0x06080c : 0x0b0c10 });
    if (night) backdrop(S, -9, 4, 44, 16, "#3c4c6c", "#0b0e15", 0.7, 0.6); else backdrop(S, -9, 4, 44, 16, "#5a4a3c", "#121113", 0.8, 0.6);
    S.fog = new THREE.Fog(night ? 0x06080c : 0x0b0c10, 12, 34);
    const key = S.userData.key; key.position.set(-5, 10, 8); if (night) { key.color.set(0x9fb4d8); key.position.set(-6, 8, -7); }
    S.children.forEach((l) => { if (l.isHemisphereLight) { l.color.set(night ? 0x6a7a96 : 0xb9a58c); l.groundColor.set(0x1a1512); } });
    if (mode === "huge") { key.intensity = 1.6; const cs = new THREE.SpotLight(0xffe8c8, 7, 7, 0.36, 0.85, 1.4); cs.position.set(0.3, 2.4, 3.6); cs.target.position.set(0, 0.55, 0.9); S.add(cs, cs.target); }
    const plaqueSpot = new THREE.SpotLight(0xffe6c4, night ? 0 : 5, 6, 0.16, 0.7, 1.5); plaqueSpot.position.set(0.4, 3.6, 2.2); plaqueSpot.target.position.set(0, 2.15, -0.55); S.add(plaqueSpot, plaqueSpot.target);
    const tm = woodMat("tableWood", [96, 62, 42], 21, [24, 24], 0.58); tm.envMapIntensity = night ? 0.12 : 0.3; setFloor(S, tm);
    const C = L3.cam(30);
    const brass = X3.mats.brass, brassD = X3.mats.brassDark;
    const walnut = woodMat("walnut", [104, 66, 42], 7, [0.32, 0.32], 0.55); walnut.envMapIntensity = 0.28; const walnutD = woodMat("walnutD", [62, 38, 25], 8, [0.3, 0.3], 0.62); walnutD.envMapIntensity = 0.45;
    const black = new THREE.MeshStandardMaterial({ color: 0x0c0c0d, roughness: 0.6 });
    const bezelMat = new THREE.MeshStandardMaterial({ color: 0xd0b072, metalness: 1, roughness: 0.42, envMapIntensity: 1.6 });
    const G = new THREE.Group(); S.add(G);
    // cabinet
    const cab = new THREE.Mesh(roundBox(3.6, 1.5, 1.8, 0.07), walnut); cab.position.y = 0.89; G.add(cab);
    G.add(at(new THREE.Mesh(roundBox(3.78, 0.14, 1.98, 0.03), brassD), 0, 0.07, 0));
    G.add(at(new THREE.Mesh(roundBox(3.74, 0.07, 1.94, 0.025), walnutD), 0, 1.665, 0));
    // brass stringing (inlay) on the front panel above the counter
    const strMat = new THREE.MeshStandardMaterial({ color: 0xb59a5e, metalness: 1, roughness: 0.4 });
    for (const [w, h, x, y] of [[3.2, 0.012, 0, 1.5], [3.2, 0.012, 0, 0.92], [0.012, 0.58, -1.6, 1.21], [0.012, 0.58, 1.6, 1.21]]) G.add(at(box(w, h, 0.004, strMat), x, y, 0.902));
    // crest + engraved c² plaque
    const cs = new THREE.Shape(); cs.moveTo(-1.2, 0); cs.lineTo(1.2, 0); cs.lineTo(1.2, 0.62); cs.quadraticCurveTo(0, 1.02, -1.2, 0.62); cs.closePath();
    const crestG = new THREE.ExtrudeGeometry(cs, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 3, curveSegments: 24 });
    const crest = new THREE.Mesh(crestG, walnutD); crest.position.set(0, 1.70, -0.68); G.add(crest);
    const plaqueTex = cached("plaque", () => {
      const c = document.createElement("canvas"); c.width = 1024; c.height = 512; const g = c.getContext("2d");
      g.fillStyle = "#fff"; g.fillRect(0, 0, 1024, 512);
      g.strokeStyle = "#000"; g.lineWidth = 8; g.strokeRect(34, 34, 956, 444); g.lineWidth = 3; g.strokeRect(54, 54, 916, 404);
      g.fillStyle = "#000"; g.textAlign = "center"; g.textBaseline = "alphabetic"; g.font = "italic 400 330px Georgia,'Times New Roman',serif"; g.fillText("c", 470, 372);
      g.font = "400 170px Georgia,'Times New Roman',serif"; g.fillText("2", 628, 228);
      for (const s of [-1, 1]) { g.beginPath(); g.arc(512 + s * 410, 256, 14, 0, TAU); g.fill(); }
      const b = document.createElement("canvas"); b.width = 1024; b.height = 512; const bg = b.getContext("2d"); bg.filter = "blur(1.6px)"; bg.drawImage(c, 0, 0);
      const src = bg.getImageData(0, 0, 1024, 512), col = bg.createImageData(1024, 512);
      for (let i = 0; i < src.data.length; i += 4) { const h = src.data[i] / 255, px = (i / 4) % 1024, py = Math.floor(i / 4 / 1024), n = 0.9 + 0.1 * vn(px / 300, py / 2, 4); col.data[i] = (70 + 140 * h) * n; col.data[i + 1] = (50 + 112 * h) * n; col.data[i + 2] = (22 + 62 * h) * n; col.data[i + 3] = 255; }
      const cc = document.createElement("canvas"); cc.width = 1024; cc.height = 512; cc.getContext("2d").putImageData(col, 0, 0);
      const map = new THREE.CanvasTexture(cc); map.colorSpace = THREE.SRGBColorSpace; map.anisotropy = 8; const bump = new THREE.CanvasTexture(b); bump.colorSpace = THREE.NoColorSpace;
      return { map, bump };
    });
    const plaqueFace = new THREE.MeshStandardMaterial({ map: plaqueTex.map, bumpMap: plaqueTex.bump, bumpScale: 3, metalness: 1, roughness: 0.34, color: 0xfff2d8 });
    const plaque = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.5, 0.02), [brass, brass, brass, brass, plaqueFace, brass]); plaque.position.set(0, 2.13, -0.535); G.add(plaque);
    for (const sx of [-1, 1]) G.add(at(new THREE.Mesh(new THREE.SphereGeometry(0.018, 12, 8), brassD), sx * 0.45, 2.13, -0.52));
    // odometer in a brass bezel, low on the front
    const odo = odometer(17), OG = new THREE.Group(); OG.position.set(0, 0.62, 0.9); G.add(OG);
    odo.group.position.z = -0.062; OG.add(odo.group);
    const bz = new THREE.Shape(); bz.moveTo(-1.16, -0.13); bz.lineTo(1.16, -0.13); bz.lineTo(1.16, 0.13); bz.lineTo(-1.16, 0.13); bz.closePath();
    const hl = new THREE.Path(); hl.moveTo(-1.08, -0.05); hl.lineTo(-1.08, 0.05); hl.lineTo(1.08, 0.05); hl.lineTo(1.08, -0.05); hl.closePath(); bz.holes.push(hl);
    OG.add(new THREE.Mesh(new THREE.ExtrudeGeometry(bz, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 3 }), bezelMat));
    OG.add(at(box(2.2, 0.12, 0.004, black), 0, 0, 0.004)); for (const sy of [-1, 1]) OG.add(at(box(2.17, 0.004, 0.1, black), 0, sy * 0.049, 0.035));
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(2.16, 0.1), new THREE.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.07, roughness: 0.04, metalness: 0, depthWrite: false })); glass.position.z = 0.066; OG.add(glass);
    // gear window on the left side face
    const GW = new THREE.Group(); GW.position.set(-1.80, 0, 0); GW.rotation.y = -Math.PI / 2; G.add(GW);
    GW.add(at(box(1.24, 0.86, 0.004, new THREE.MeshStandardMaterial({ color: 0x15100c, roughness: 0.7 })), 0, 0.88, 0.004));
    for (const [w, h, x, y] of [[1.36, 0.07, 0, 1.31], [1.36, 0.07, 0, 0.45], [0.07, 0.93, -0.66, 0.88], [0.07, 0.93, 0.66, 0.88]]) GW.add(at(box(w, h, 0.07, brass), x, y, 0.035));
    const gm = 0.0135, gears = [], gdef = [[40, -0.12, 0.86, 5], [20, 0, 0, 0], [28, -70, 0, 4], [16, 150, 0, 0]], par = [-1, 0, 1, 0];
    gdef.forEach(([n, a, y, holes], i) => {
      const gg = gearGeo(n, gm, 0.022, holes), mesh = new THREE.Mesh(gg.g, i % 2 ? brassD : brass); let px = a, py = y;
      if (i > 0) { const p = gears[par[i]], d = p.rp + gg.rp, an = a * Math.PI / 180; px = p.x + d * Math.cos(an); py = p.y + d * Math.sin(an); }
      mesh.position.set(px, py, 0.03); GW.add(mesh);
      const hub = cyl(0.022, 0.022, 0.05, brassD, 16); hub.rotation.x = Math.PI / 2; hub.position.set(px, py, 0.03); GW.add(hub);
      const g = { mesh, n, rp: gg.rp, da: gg.da, x: px, y: py, ratio: 1, phase: 0 };
      if (i > 0) { const p = gears[par[i]], phi = Math.atan2(py - p.y, px - p.x); g.ratio = -p.ratio * p.n / n; const angS = (phi - 0.45 * p.da - p.phase) / p.ratio; g.phase = phi + Math.PI - 0.95 * g.da - g.ratio * angS; }
      gears.push(g);
    });
    const gGlass = new THREE.Mesh(new THREE.PlaneGeometry(1.24, 0.86), glass.material); gGlass.position.set(0, 0.88, 0.064); GW.add(gGlass);
    const setGears = (ang) => gears.forEach((g) => (g.mesh.rotation.z = g.phase + g.ratio * ang));
    // input: hopper tube + inclined rail + coin acceptor on top
    const ZR = 0.35, R0 = new V3(-3.17, 2.23, ZR), R1 = new V3(-1.47, 1.80, ZR), dIn = R1.clone().sub(R0).normalize(), nIn = new V3(-dIn.y, dIn.x, 0);
    const hop = cyl(0.17, 0.17, 2.7, brass, 48); hop.position.set(-3.38, 1.35, ZR); G.add(hop);
    G.add(at(cyl(0.2, 0.2, 0.05, brassD, 48), -3.38, 2.72, ZR)); G.add(at(cyl(0.26, 0.3, 0.06, brassD, 48), -3.38, 0.03, ZR));
    for (const yy of [0.5, 1.2, 1.9]) G.add(at(cyl(0.178, 0.178, 0.03, brassD, 48), -3.38, yy, ZR));
    const hood = new THREE.Mesh(roundBox(0.2, 0.42, 0.3, 0.02), brassD); hood.position.set(-3.18, 2.42, ZR); G.add(hood);
    G.add(at(box(0.004, 0.3, 0.2, black), -3.079, 2.4, ZR));
    const railLen = R0.distanceTo(R1), railAng = Math.atan2(dIn.y, dIn.x);
    const railBar = box(railLen, 0.03, 0.07, brass); railBar.position.copy(R0).add(R1).multiplyScalar(0.5).addScaledVector(nIn, -0.015); railBar.rotation.z = railAng; G.add(railBar);
    const back = box(railLen, 0.17, 0.008, brassD); back.position.copy(R0).add(R1).multiplyScalar(0.5).addScaledVector(nIn, 0.085); back.position.z = ZR - 0.032; back.rotation.z = railAng; G.add(back);
    const postA = new V3(-2.35, 0, ZR); G.add(rodBetween(postA, new V3(-2.35, R0.y + (R1.y - R0.y) * ((-2.35 - R0.x) / (R1.x - R0.x)) - 0.03, ZR), 0.016, brassD)); G.add(at(cyl(0.07, 0.08, 0.025, brassD, 32), -2.35, 0.012, ZR));
    const acc = new THREE.Mesh(roundBox(0.5, 0.5, 0.46, 0.03), brass); acc.position.set(-1.22, 1.95, ZR); G.add(acc);
    G.add(at(box(0.004, 0.34, 0.24, black), -1.472, 1.94, ZR));
    G.add(at(cyl(0.06, 0.06, 0.03, brassD, 24), -1.22, 2.215, ZR));
    // output: exit mouth on the right side, rail down to a coin queue
    const mouth = new THREE.Group(); mouth.position.set(1.8, 0.86, ZR); G.add(mouth);
    mouth.add(at(box(0.06, 0.42, 0.34, brass), 0.03, 0, 0)); mouth.add(at(box(0.004, 0.32, 0.24, black), 0.062, 0, 0));
    const O0 = new V3(1.86, 0.69, ZR), O1 = new V3(2.75, 0.38, ZR), O2 = new V3(4.2, 0.38, ZR);
    const d1 = O1.clone().sub(O0).normalize(), n1 = new V3(-d1.y, d1.x, 0), up = new V3(0, 1, 0);
    const outBar1 = box(O0.distanceTo(O1), 0.03, 0.07, brass); outBar1.position.copy(O0).add(O1).multiplyScalar(0.5).addScaledVector(n1, -0.015); outBar1.rotation.z = Math.atan2(d1.y, d1.x); G.add(outBar1);
    const outBar2 = box(O1.distanceTo(O2) + 0.02, 0.03, 0.07, brass); outBar2.position.copy(O1).add(O2).multiplyScalar(0.5).add(new V3(0, -0.015, 0)); G.add(outBar2);
    const back2 = box(O1.distanceTo(O2), 0.17, 0.008, brassD); back2.position.copy(O1).add(O2).multiplyScalar(0.5).add(new V3(0, 0.085, ZR * 0 - 0.032)); G.add(back2);
    const back1 = box(O0.distanceTo(O1), 0.17, 0.008, brassD); back1.position.copy(O0).add(O1).multiplyScalar(0.5).addScaledVector(n1, 0.085); back1.position.z = ZR - 0.032; back1.rotation.z = Math.atan2(d1.y, d1.x); G.add(back1);
    const stop = new THREE.Mesh(roundBox(0.05, 0.22, 0.12, 0.012), brassD); stop.position.set(4.225, 0.48, ZR); G.add(stop);
    for (const px of [2.5, 3.5]) { const yTop = px < O1.x ? O0.y + (O1.y - O0.y) * (px - O0.x) / (O1.x - O0.x) : O1.y; G.add(rodBetween(new V3(px, 0, ZR), new V3(px, yTop - 0.03, ZR), 0.016, brassD)); G.add(at(cyl(0.07, 0.08, 0.025, brassD, 32), px, 0.012, ZR)); }
    shadowAll(G); glass.castShadow = gGlass.castShadow = false;
    // coin paths (centre lines)
    const inA = R0.clone().addScaledVector(nIn, COIN_R).addScaledVector(dIn, -0.22), inB = R1.clone().addScaledVector(nIn, COIN_R).addScaledVector(dIn, 0.45), inLen = inA.distanceTo(inB);
    const bend = 0.16, outPts = [O0.clone().addScaledVector(n1, COIN_R).addScaledVector(d1, -0.5), O0.clone().addScaledVector(n1, COIN_R), O1.clone().addScaledVector(n1, COIN_R).addScaledVector(d1, -bend), O1.clone().add(n1.clone().add(up).normalize().multiplyScalar(COIN_R)), O1.clone().addScaledVector(up, COIN_R).add(new V3(bend, 0, 0)), O2.clone().addScaledVector(up, COIN_R)];
    const outCurve = new THREE.CatmullRomCurve3(outPts, false, "centripetal"), outLen = outCurve.getLength();
    const vis0 = 0.22, tInOf = (i) => XR.t0 + i * XR.dt + (inLen - 0.45 + 0.02) / XR.speed;
    const rupees = [], dollars = [], nD = Math.floor(XR.n / XR.per);
    for (let i = 0; i < XR.n; i++) { const m = coin("inr"); G.add(m); rupees.push(m); }
    for (let j = 0; j < nD; j++) { const m = coin("usd"); G.add(m); dollars.push(m); }
    const tOutOf = (j) => tInOf(j * XR.per + XR.per - 1) + 0.7;
    const tmp = new V3();
    function coinsAt(ft) {
      for (let i = 0; i < XR.n; i++) {
        const s = (ft - (XR.t0 + i * XR.dt)) * XR.speed, m = rupees[i];
        m.visible = s > 0 && s < inLen; if (!m.visible) continue;
        m.position.copy(inA).addScaledVector(dIn, s); m.rotation.set(0, 0, -s / COIN_R);
      }
      for (let j = 0; j < nD; j++) {
        const sStop = outLen - (COIN_R + 0.006) - j * (2 * COIN_R + 0.004), tau = ft - tOutOf(j), m = dollars[j];
        const vv = 1.0, sFree = tau * vv + 0.25 * tau * tau, s = sFree >= sStop - 0.04 ? sStop - 0.04 * Math.exp(-(sFree - (sStop - 0.04)) / 0.04) : sFree;
        m.visible = tau > 0; if (!m.visible) continue;
        outCurve.getPointAt(clamp(s / outLen, 0, 1), tmp); m.position.copy(tmp); m.rotation.set(0, 0, -s / COIN_R);
      }
    }
    const rupeeValue = (ft) => { let v = 1280; for (let i = 0; i < XR.n; i++) v += 10 * smooth((ft - tInOf(i)) / 0.35); return v; };
    const gearAngle = (ft) => { let a = 0; for (let i = 0; i < XR.n; i++) a += 0.7 * smooth((ft - tInOf(i) + 0.05) / 0.5); return a; };
    // the "mass" cube (rate, recap)
    const cubeMat = new THREE.MeshPhysicalMaterial({ color: 0x30333a, roughness: 0.36, metalness: 0.0, clearcoat: 0.55, clearcoatRoughness: 0.35, sheen: 0.6, sheenColor: new THREE.Color(0x8a8fa0), sheenRoughness: 0.4 });
    const CS = 0.15, cube = new THREE.Mesh(new THREE.BoxGeometry(CS, CS, CS, 1, 1, 1), cubeMat); cube.castShadow = true; G.add(cube);
    const cubeA = R0.clone().addScaledVector(nIn, CS / 2).addScaledVector(dIn, -0.25), cubeB = R1.clone().addScaledVector(nIn, CS / 2).addScaledVector(dIn, 0.4), cubeLen = cubeA.distanceTo(cubeB);
    function cubeAt(ft, tOut, tIn) {
      const u = (ft - tOut) / (tIn - tOut), s = u < 0.25 ? 0.5 * u * u / 0.25 : u - 0.125;   // eases off the hood, then slides at constant speed
      const sl = s * (cubeLen - 0.4 + 0.065) / 0.875;
      cube.visible = u > 0 && sl < cubeLen; cube.position.copy(cubeA).addScaledVector(dIn, sl); cube.position.z = ZR + 0.037; cube.rotation.set(0, 0, railAng);
    }
    const spill = lightSpill(S, new V3(1.87, 0.86, ZR), night ? 3.4 : 2.6, 0.13, night ? 1.5 : 1.0, 9);
    const wash = new THREE.SpotLight(0xffc68c, 0, 9, 0.75, 0.9, 1.6); wash.position.set(1.95, 0.95, ZR); wash.target.position.set(4.5, 0, 0.6); S.add(wash, wash.target);
    if (night) { const moon = new THREE.DirectionalLight(0x7f96c0, 1.1); moon.position.set(-8, 5, -3); S.add(moon); const fillN = new THREE.DirectionalLight(0x8a9cc0, 0.9); fillN.position.set(3, 4, 8); S.add(fillN); }
    let K;
    if (mode === "money") K = [[145.72, -2.55, 2.04, 0.35, 1.5, -14, 7], [147.6, -1.72, 1.84, 0.4, 2.0, -22, 4], [149.6, 0.0, 0.74, 0.9, 2.7, 4, 6], [151.2, 3.0, 0.62, 0.35, 3.1, 20, 10], [153.84, 3.4, 0.56, 0.35, 2.7, 27, 11]];
    else if (mode === "rate") K = [[153.84, -1.1, 1.45, 0.1, 6.6, -30, 13], [155.5, -2.5, 2.05, 0.35, 2.9, -14, 9], [157.0, -1.6, 1.9, 0.35, 2.8, -6, 9], [158.7, 1.7, 0.9, 0.35, 4.0, 12, 10], [160.6, 0.6, 1.4, 0.0, 6.6, 6, 12], [162.0, 0, 2.13, -0.53, 3.3, 0, 5, 0.33], [165.96, 0, 2.13, -0.53, 2.95, 3, 4, 0.33]];
    else if (mode === "huge") K = [[165.96, 0.66, 0.62, 0.95, 0.92, 36, 8], [168.6, 0.52, 0.62, 0.95, 0.86, 30, 7], [171.4, 0.42, 0.62, 0.95, 1.0, 21, 6], [172.2, 0.38, 0.63, 0.95, 1.12, 18, 6], [173.2, 0, 1.05, 0.9, 3.4, -7, 3], [179.14, 0.05, 1.05, 0.9, 3.1, 6, 4]];
    else K = [[586.52, 0.6, 1.2, 0.3, 7.6, -20, 12], [588.7, -2.1, 1.98, 0.35, 2.7, -14, 9], [589.9, -1.25, 1.8, 0.35, 3.1, -6, 9], [591.5, 1.2, 0.9, 0.3, 6.0, 6, 11], [593.6, 1.9, 0.72, 0.3, 6.6, 14, 13], [597.82, 2.1, 0.72, 0.3, 6.0, 20, 13]];
    return (t) => {
      const ft = o.T0 + t;
      camKeys(C, K, ft);
      let val = 1420, vdot = 0, gear = gearAngle(ft), light = 0, big = 1;
      coinsAt(mode === "money" ? ft : 160);
      cube.visible = false;
      if (mode === "money") { val = rupeeValue(ft); vdot = (rupeeValue(ft + 0.02) - val) / 0.02; }
      else if (mode === "rate") { cubeAt(ft, RATE.cubeOut, RATE.cubeIn); gear = gearAngle(160) + 1.6 * Math.max(0, ft - RATE.cubeIn) * seg(ft, RATE.cubeIn, RATE.cubeIn + 0.6); light = seg(ft, RATE.light, RATE.light + 1.0) * (1 - 0.25 * seg(ft, 163, 165.9)); }
      else if (mode === "huge") { val = hugeVal(ft); vdot = (hugeVal(ft + 0.02) - val) / 0.02; gear = gearAngle(160) + 3 * Math.log10(Math.max(val, 1)) - 3 * Math.log10(HUGE.v0); }
      else { val = C2_VAL; cubeAt(ft, RECAP.cubeOut, RECAP.cubeIn); gear = 2.4 * Math.max(0, ft - RECAP.cubeIn) * seg(ft, RECAP.cubeIn, RECAP.cubeIn + 0.6); light = seg(ft, RECAP.light, RECAP.light + 1.6); big = 1.9; }
      odo.set(val, vdot); setGears(gear);
      spill(light, ft, big); wash.intensity = light * (night ? 9 : 4) * big;
      return [S, C, []];
    };
  }
  LABK.exchange = (o) => machine(o);

  // ================================================================= PRECISION LAB SCALE + the paperclip
  function labScale() {
    const g = new THREE.Group();
    const bodyMat = new THREE.MeshStandardMaterial({ map: brushedTex("anthr", [44, 44, 46], 5, 0.05), metalness: 0.3, roughness: 0.5, envMapIntensity: 0.6 });
    const steel = new THREE.MeshStandardMaterial({ map: brushedTex("steelPlate", [206, 209, 213], 6, 0.05), metalness: 1, roughness: 0.26 });
    const panTex = cached("panTex", () => { const t = pixTex("panRad", 512, 512, (x, y) => { const r = Math.hypot(x - 256, y - 256), a = Math.atan2(y - 256, x - 256); const k = 0.9 + 0.08 * (vn(r / 0.8, a * 3, 9) - 0.5) * 2 + 0.03 * vn(r / 6, a * 40, 3); return [158 * k, 160 * k, 163 * k]; }); t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; return t; });
    const panMat = new THREE.MeshStandardMaterial({ map: panTex, metalness: 1, roughness: 0.34 });
    const rubber = new THREE.MeshStandardMaterial({ color: 0x141414, roughness: 0.9 });
    const gloss = new THREE.MeshPhysicalMaterial({ color: 0x0d0e10, roughness: 0.18, clearcoat: 1, clearcoatRoughness: 0.1 });
    const body = new THREE.Mesh(roundBox(1.5, 0.22, 1.9, 0.06), bodyMat); body.position.y = 0.14; g.add(body);
    for (const [x, z] of [[-0.6, -0.8], [0.6, -0.8], [-0.6, 0.8], [0.6, 0.8]]) g.add(at(cyl(0.06, 0.07, 0.03, rubber, 24), x, 0.015, z));
    g.add(at(new THREE.Mesh(roundBox(1.32, 0.02, 1.16, 0.008), steel), 0, 0.26, -0.3));
    const PAN_Y = 0.3;
    g.add(at(cyl(0.06, 0.08, 0.04, steel, 32), 0, 0.27, -0.3));
    const pan = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.016, 96), [steel, panMat, panMat]); pan.position.set(0, PAN_Y - 0.008, -0.3); g.add(pan);
    const lip = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.008, 10, 96), steel); lip.rotation.x = Math.PI / 2; lip.position.set(0, PAN_Y, -0.3); g.add(lip);
    // sloped display strip at the front
    const strip = new THREE.Mesh(roundBox(1.36, 0.05, 0.42, 0.02), gloss); strip.position.set(0, 0.255, 0.66); strip.rotation.x = 0.22; g.add(strip);
    const lcdMat = new THREE.MeshStandardMaterial({ map: X3.lcd("1.000 g", 512, 150), roughness: 0.35, metalness: 0, emissive: 0x222622, emissiveIntensity: 1 });
    const lcdT = { one: lcdMat.map, zero: X3.lcd("0.000 g", 512, 150) }; lcdMat.emissiveMap = lcdMat.map;
    const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.6, 0.175), lcdMat); lcd.position.set(0.24, 0.0362, 0.01); lcd.rotation.x = -Math.PI / 2; strip.add(lcd);
    const keyMat = new THREE.MeshStandardMaterial({ color: 0x2c2e32, metalness: 0.4, roughness: 0.45 });
    for (const x of [-0.46, -0.3]) { const k = cyl(0.045, 0.045, 0.016, keyMat, 32); k.position.set(x, 0.038, 0.01); strip.add(k); }
    // bubble level + its bezel, a real-instrument detail
    const bub = new THREE.Mesh(new THREE.SphereGeometry(0.05, 24, 12, 0, TAU, 0, Math.PI / 2), new THREE.MeshPhysicalMaterial({ color: 0xe8f0e0, roughness: 0.05, transmission: 0.6, transparent: true, opacity: 0.5, clearcoat: 1 })); bub.scale.y = 0.4; bub.position.set(0.55, 0.252, 0.32); g.add(bub);
    const bubR = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.008, 8, 32), steel); bubR.rotation.x = Math.PI / 2; bubR.position.set(0.55, 0.252, 0.32); g.add(bubR);
    shadowAll(g);
    const clip = X3.paperclip(1), clipMat = X3.mats.clip.clone(); clipMat.transparent = true; clip.traverse((m) => { if (m.isMesh) { m.material = clipMat; m.castShadow = true; } });
    clip.position.set(0.0, PAN_Y, -0.3); clip.rotation.y = 0.5; g.add(clip);
    return { group: g, clip, clipMat, lcdMat, lcdT, PAN_Y, panPos: new V3(0, PAN_Y, -0.3) };
  }
  // warm light flood from a point (dissolve or "would release")
  function flood(S, C, centre, srcMesh, seed) {
    const g = new THREE.Group(); g.position.copy(centre); S.add(g);
    const core = glowSprite(0xffd6a6, 0.2, 0), halo = glowSprite(0xffc88e, 1, 0), halo2 = glowSprite(0xffb070, 3, 0); g.add(halo2, halo, core);
    [core, halo, halo2].forEach((sp) => { sp.material.depthTest = false; sp.renderOrder = 5; });
    const pl = new THREE.PointLight(0xffc488, 0, 0, 2); pl.position.y = 0.9; g.add(pl);
    const shell = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.ShaderMaterial({ transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, uniforms: { uOp: { value: 0 }, uCol: { value: new THREE.Color(0xffc48a) } },
      vertexShader: `varying vec3 vN, vV; void main(){ vec4 wp = modelMatrix * vec4(position, 1.0); vN = normalize(mat3(modelMatrix) * normal); vV = normalize(cameraPosition - wp.xyz); gl_Position = projectionMatrix * viewMatrix * wp; }`,
      fragmentShader: `uniform float uOp; uniform vec3 uCol; varying vec3 vN, vV; void main(){ float f = 1.0 - abs(dot(normalize(vN), normalize(vV))); float a = pow(f, 3.0) * uOp; gl_FragColor = vec4(uCol, a);
        #include <colorspace_fragment>
      }` }));
    g.add(shell);
    // particles: start on the clip wire, drift outward
    const r = rnd(seed || 3), src = [];
    srcMesh.updateMatrixWorld(true);
    srcMesh.traverse((m) => { if (m.isMesh) { const pa = m.geometry.attributes.position, mw = m.matrixWorld; for (let i = 0; i < pa.count; i += 3) src.push(new V3().fromBufferAttribute(pa, i).applyMatrix4(mw).sub(centre)); } });
    const N = src.length, pg = new THREE.BufferGeometry(), pp = new Float32Array(N * 3), dir = [];
    for (let i = 0; i < N; i++) { const d = src[i].clone().setY(0); if (d.lengthSq() < 1e-6) d.set(r() - 0.5, 0, r() - 0.5); d.normalize().multiplyScalar(0.6 + r() * 0.8); d.y = 0.25 + r() * 1.1; d.x += (r() - 0.5) * 0.6; d.z += (r() - 0.5) * 0.6; dir.push([d, r()]); }
    pg.setAttribute("position", new THREE.BufferAttribute(pp, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ map: DOT(), color: 0xffc98e, size: 0.013, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending })); g.add(pts);
    const wash = veil(S, C, true);
    // k: overall light 0..1; wave: 0..1 expansion of the shell; part: 0..1 particle travel (negative = hidden)
    return (k, wave, part, veilK) => {
      core.material.opacity = 0.36 * k; core.scale.setScalar(0.1 + 0.18 * k);
      halo.material.opacity = 0.17 * k; halo.scale.setScalar(0.5 + 1.4 * k);
      halo2.material.opacity = 0.06 * k; halo2.scale.setScalar(2 + 3 * k);
      pl.intensity = 0.5 * k;   // kept high + weak: a close light turns the steel pan into a clipped white disc
      shell.visible = wave > 0.001 && wave < 0.999; shell.scale.setScalar(0.05 + 7 * wave); shell.material.uniforms.uOp.value = 0.35 * Math.sin(Math.PI * wave) * (1 - wave * 0.5);
      pts.visible = part > 0 && part < 1;
      if (pts.visible) { const e = 1 - Math.pow(1 - part, 2.2); pts.material.opacity = 0.9 * (1 - smooth((part - 0.45) / 0.55)); for (let i = 0; i < N; i++) { const [d, q] = dir[i], s = e * (0.6 + q * 0.8); pp[i * 3] = src[i].x + d.x * s; pp[i * 3 + 1] = src[i].y + d.y * s; pp[i * 3 + 2] = src[i].z + d.z * s; } pg.attributes.position.needsUpdate = true; }
      wash(veilK || 0);
    };
  }
  const CLIP = { glow: 184.1, gone: 185.25, zero: 185.6 };
  LABK.paperclip = (o) => {
    const mode = o.mode;
    const S = stage("studio", { floorY: 0, key: 2.0, hemi: 0.3, rim: 0.6 });
    S.children.forEach((l) => { if (l.isDirectionalLight && l !== S.userData.key) l.color.set(0xe8dccb); });
    S.fog = new THREE.Fog(0x0b0c10, 6, 22);
    const key = S.userData.key; key.position.set(-4, 9, 5); const sc = key.shadow.camera; sc.left = -3; sc.right = 3; sc.top = 3; sc.bottom = -3; sc.near = 1; sc.far = 25; sc.updateProjectionMatrix(); key.shadow.radius = 3; key.shadow.bias = -0.0002;
    setFloor(S, new THREE.MeshStandardMaterial({ map: (() => { const t = pixTex("slate", 512, 512, (x, y) => { const k = 0.85 + 0.3 * (fbm(x / 70, y / 50, 31, 5) - 0.5) + 0.1 * (hash(x, y, 2) - 0.5); return [52 * k, 47 * k, 43 * k]; }).clone(); t.repeat.set(40, 40); t.needsUpdate = true; return t; })(), roughness: 0.55, metalness: 0, envMapIntensity: 0.35 }));
    S.children.forEach((l) => { if (l.isHemisphereLight) { l.color.set(0xb9a58c); l.groundColor.set(0x1a1512); } });
    backdrop(S, -7, 4, 40, 16, "#4e4034", "#100f10", 0.75, 0.6);
    const C = L3.cam(30);
    const L = labScale(); S.add(L.group); L.group.rotation.y = -0.18;
    const warm = new THREE.SpotLight(0xffe2c0, 3.5, 10, 0.5, 0.8, 1.5); warm.position.set(2.2, 3.2, 2.4); warm.target = L.clip; S.add(warm);
    const centre = new V3(); L.clip.updateMatrixWorld(true); L.clip.getWorldPosition(centre); centre.y += 0.01;
    const fl = flood(S, C, centre, L.clip, 17);
    let K;
    if (mode === "gram") K = [[179.14, 0.12, 0.27, 0.12, 1.75, -30, 19], [181.8, 0.08, 0.28, 0.02, 1.5, -20, 22], [184.1, 0.02, 0.3, -0.18, 1.2, -10, 27], [185.4, 0.0, 0.3, -0.1, 1.8, -6, 27, -0.1], [186.4, 0.0, 0.27, 0.2, 3.3, -3, 29, -0.31], [189.04, 0.0, 0.27, 0.2, 3.45, 3, 28, -0.31]];
    else K = [[597.82, 0.05, 0.3, -0.28, 1.5, -42, 13], [601.6, 0.0, 0.3, -0.3, 1.3, -14, 15], [605.9, 0.0, 0.32, -0.32, 1.55, 22, 17]];
    return (t) => {
      const ft = o.T0 + t;
      camKeys(C, K, ft);
      let k = 0, wave = 0, part = -1, vk = 0, clipOp = 1, emis = 0;
      if (mode === "gram") {
        emis = seg(ft, CLIP.glow, CLIP.glow + 0.8); clipOp = 1 - seg(ft, CLIP.glow + 0.55, CLIP.gone);
        k = seg(ft, CLIP.glow + 0.3, 185.2) * (1 - seg(ft, 185.4, 186.65)); wave = clamp((ft - 184.85) / 1.9, 0, 1); part = (ft - 184.55) / 2.0; vk = 0.2 * win(ft, 184.7, 186.4, 0.7);
        L.lcdMat.map = L.lcdMat.emissiveMap = ft < CLIP.zero ? L.lcdT.one : L.lcdT.zero; warm.intensity = 3.5 * (1 - 0.6 * seg(ft, 185, 186.5));
      } else {
        k = 1.25 * seg(ft, 602.4, 603.6) * (1 - seg(ft, 604.6, 605.85)); wave = clamp((ft - 602.9) / 2.4, 0, 1); vk = 0.2 * win(ft, 602.8, 605.6, 0.9); emis = 0.45 * k;
        L.lcdMat.map = L.lcdMat.emissiveMap = L.lcdT.one;
      }
      L.clipMat.opacity = clipOp; L.clip.visible = clipOp > 0.003; L.clipMat.emissive.setRGB(1.0 * emis, 0.72 * emis, 0.42 * emis);
      fl(k, wave, part, vk);
      return [S, C, []];
    };
  };

  // ================================================================= HIROSHIMA: true sizes, sombre
  // 15 cm cube = 64 kg of uranium (19 g/cm³); 3.6 cm cube = 0.89 kg (< 1 kg split); a paperclip ≈ the 0.7 g that vanished
  LABK.hiroshima = (o) => {
    const S = stage("studio", { floorY: 0, key: 1.1, hemi: 0.12, rim: 1.6, bg: 0x08090b });
    S.fog = new THREE.Fog(0x171b22, 5, 13);
    S.children.forEach((l) => { if (l.isHemisphereLight) { l.color.set(0x9aa6b8); l.groundColor.set(0x101012); } });
    const key = S.userData.key; key.color.set(0xdfe6f0); key.position.set(-2.5, 9, 4); const sc = key.shadow.camera; sc.left = -4; sc.right = 4; sc.top = 4; sc.bottom = -4; sc.near = 2; sc.far = 25; sc.updateProjectionMatrix(); key.shadow.radius = 4; key.shadow.bias = -0.0003;
    const tTex = brushedTex("steelTable", [70, 73, 78], 41, 0.12).clone(); tTex.repeat.set(30, 30); tTex.needsUpdate = true;
    setFloor(S, new THREE.MeshStandardMaterial({ map: tTex, metalness: 0.35, roughness: 0.66, envMapIntensity: 0.07 }));
    const pool = new THREE.SpotLight(0xd8e2f0, 16, 12, 0.36, 1.0, 1.6); pool.position.set(0.1, 6.5, 1.0); pool.target.position.set(0.2, 0, 0.2); pool.castShadow = true; pool.shadow.mapSize.set(2048, 2048); pool.shadow.radius = 4; pool.shadow.bias = -0.0003; S.add(pool, pool.target);
    const back = new THREE.DirectionalLight(0xb8c6dc, 1.2); back.position.set(2, 3, -6); S.add(back);   // edge light: cube silhouettes read
    const rimL = S.children.find((l) => l.isDirectionalLight && l !== key && l !== back);
    const panSpot = new THREE.SpotLight(0xdde6f2, 0, 7, 0.3, 1.0, 1.4); panSpot.position.set(1.2, 4.2, 1.6); panSpot.target.position.set(1.65, 0, 0.55); panSpot.castShadow = true; panSpot.shadow.mapSize.set(1024, 1024); S.add(panSpot, panSpot.target);
    // faint cool gradient far behind the final view (top third only), so the ending is sombre but not black
    const farT = canvasTex(16, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#08090b"); gr.addColorStop(0.55, "#232a35"); gr.addColorStop(1, "#171b22"); g.fillStyle = gr; g.fillRect(0, 0, 16, 256); });
    const far = new THREE.Mesh(new THREE.PlaneGeometry(30, 5), new THREE.MeshBasicMaterial({ map: farT, fog: false, depthWrite: false })); far.position.set(1.65 + 9 * 0.83, 2.0, 0.55 - 9 * 0.56); far.lookAt(1.65 - 0.83, 2.0, 0.55 + 0.56); far.renderOrder = -1; S.add(far);
    const C = L3.cam(30);
    const uTex = pixTex("uranium2", 512, 512, (x, y) => {
      const n = fbm(x / 90, y / 90, 61, 5), m = fbm(x / 9, y / 9, 62, 3), ox = smooth((n - 0.45) / 0.25), br = smooth((fbm(x / 140, y / 140, 63, 3) - 0.6) / 0.12);
      const base = [84, 86, 88], dark = [56, 57, 58], bronze = [88, 80, 66]; const k = 0.94 + 0.1 * (m - 0.5) + 0.05 * (hash(x, y, 9) - 0.5);
      return [0, 1, 2].map((c) => lerp(lerp(base[c], dark[c], ox * 0.38), bronze[c], br * 0.3) * k);
    });
    const uMat = new THREE.MeshStandardMaterial({ map: uTex, metalness: 0.7, roughness: 0.48, envMapIntensity: 1.0 });
    // roundBox grows by r in x/y, so pass w - r: exact 15 cm and 3.6 cm cubes
    const big = new THREE.Mesh(roundBox(1.5 - 0.02, 1.5 - 0.02, 1.5, 0.02), uMat); big.position.set(-1.05, 0.75 + 0.005, -0.25); big.rotation.y = 0.32; big.castShadow = big.receiveShadow = true; S.add(big);
    const small = new THREE.Mesh(roundBox(0.36 - 0.008, 0.36 - 0.008, 0.36, 0.008), uMat); small.position.set(0.55, 0.18 + 0.002, 0.4); small.rotation.y = -0.22; small.castShadow = small.receiveShadow = true; S.add(small);
    // precision weighing pan: a shallow stainless dish on three small feet
    const steel = new THREE.MeshStandardMaterial({ color: 0xa4a8ae, metalness: 1, roughness: 0.32 });
    const panG = new THREE.Group(); panG.position.set(1.65, 0, 0.55); S.add(panG);
    for (let i = 0; i < 3; i++) { const a = i / 3 * TAU + 0.4; panG.add(at(cyl(0.022, 0.026, 0.03, steel, 16), Math.cos(a) * 0.26, 0.015, Math.sin(a) * 0.26)); }
    const dish = new THREE.Mesh(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.36, 0.0), new THREE.Vector2(0.4, 0.012), new THREE.Vector2(0.415, 0.03), new THREE.Vector2(0.405, 0.032), new THREE.Vector2(0.39, 0.016), new THREE.Vector2(0.35, 0.006), new THREE.Vector2(0, 0.006)], 96), steel);
    dish.position.y = 0.03; panG.add(dish);
    shadowAll(panG);
    const clip = X3.paperclip(1); clip.position.set(0, 0.036, 0.0); clip.rotation.y = 0.9; panG.add(clip);
    const K = [[471.4, -1.0, 0.8, -0.2, 5.6, -22, 16], [474.3, -0.55, 0.55, 0.0, 4.6, -12, 18], [475.7, 0.3, 0.3, 0.25, 3.1, -18, 21], [477.4, 1.1, 0.18, 0.45, 2.5, -30, 20, -0.12], [478.6, 1.55, 0.1, 0.55, 2.0, -46, 18, -0.24], [484.96, 1.62, 0.07, 0.55, 1.45, -56, 15, -0.26]];
    const cTop = new V3(-0.65, 1.5, 0.3), sTop = new V3(0.55, 0.36, 0.4);
    return (t) => {
      const ft = o.T0 + t;
      camKeys(C, K, ft);
      const dim = seg(ft, 477.0, 478.3); pool.intensity = 16 * (1 - 0.75 * dim); panSpot.intensity = 11 * dim; key.intensity = 1.1 * (1 - 0.8 * dim); rimL.intensity = 1.6 * (1 - 0.85 * dim); back.intensity = 1.2 * (1 - 0.7 * dim);
      return [S, C, [["64 kg uranium", cTop.x, cTop.y, cTop.z, win(ft, 471.7, 474.7, 0.5)], ["less than 1 kg split", sTop.x, sTop.y, sTop.z, win(ft, 475.0, 477.4, 0.5)]]];
    };
  };

  // ================================================================= PET: annihilation -> two back-to-back gamma rays -> detector ring -> image
  const PET = { t0: 566.96, meet: 571.15, hit: 577.95, lor0: 578.45, img0: 578.4, img1: 585.8 };
  LABK.pet = (o) => {
    const S = stage("void", { dust: 400, dustR: 14, key: 1.8, rim: 1.2, hemi: 0.35, seed: 13, bg: 0x0d0f14 });
    S.fog = new THREE.Fog(0x12161d, 1, 40);
    S.add(new THREE.Mesh(new THREE.SphereGeometry(80, 32, 16), new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false, depthWrite: false, map: canvasTex(16, 256, (g) => { const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, "#0d1016"); gr.addColorStop(0.5, "#2a3241"); gr.addColorStop(1, "#0d1016"); g.fillStyle = gr; g.fillRect(0, 0, 16, 256); }) })));
    const C = L3.cam(32);
    const RIN = 4.0, NA = 56, NZ = 4, AZ = 0.42, ZL = NZ * AZ + (NZ - 1) * 0.04;
    // detector ring: LYSO crystal blocks (pixelated), PMT modules behind, white housing (front cover removed)
    const lyso = canvasTex(128, 128, (g) => { g.fillStyle = "#93a3b2"; g.fillRect(0, 0, 128, 128); g.strokeStyle = "rgba(40,52,66,.22)"; g.lineWidth = 1.5; for (let i = 0; i <= 8; i++) { g.beginPath(); g.moveTo(i * 16, 0); g.lineTo(i * 16, 128); g.stroke(); g.beginPath(); g.moveTo(0, i * 16); g.lineTo(128, i * 16); g.stroke(); } });
    const crysMat = new THREE.MeshPhysicalMaterial({ map: lyso, color: 0xa9b8c6, roughness: 0.12, metalness: 0.1, clearcoat: 1, clearcoatRoughness: 0.08, envMapIntensity: 1.5 });
    const pmtMat = new THREE.MeshStandardMaterial({ color: 0x2b2e34, metalness: 0.7, roughness: 0.38 });
    const nB = NA * NZ, crys = new THREE.InstancedMesh(new THREE.BoxGeometry(0.4, 0.4, 0.42), crysMat, nB), pmt = new THREE.InstancedMesh(new THREE.BoxGeometry(0.38, 0.38, 0.5), pmtMat, nB);
    const glowM = new THREE.InstancedMesh(new THREE.PlaneGeometry(0.44, 0.44), new THREE.MeshBasicMaterial({ map: DOT(), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, color: 0xffffff }), nB);
    const mm = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new V3(1, 1, 1), BLK = [];
    for (let a = 0; a < NA; a++) for (let z = 0; z < NZ; z++) {
      const ang = (a + 0.5) / NA * TAU, zz = -ZL / 2 + AZ / 2 + z * (AZ + 0.04), i = a * NZ + z, ca = Math.cos(ang), sa = Math.sin(ang);
      const m4 = new THREE.Matrix4().lookAt(new V3(0, 0, 0), new V3(-ca, -sa, 0), new V3(0, 0, 1)); q.setFromRotationMatrix(m4);
      mm.compose(new V3(ca * (RIN + 0.21), sa * (RIN + 0.21), zz), q, one); crys.setMatrixAt(i, mm);
      mm.compose(new V3(ca * (RIN + 0.7), sa * (RIN + 0.7), zz), q, one); pmt.setMatrixAt(i, mm);
      const qf = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().lookAt(new V3(0, 0, 0), new V3(ca, sa, 0), new V3(0, 0, 1)));
      mm.compose(new V3(ca * (RIN - 0.012), sa * (RIN - 0.012), zz), qf, one); glowM.setMatrixAt(i, mm); glowM.setColorAt(i, new THREE.Color(0, 0, 0));
      BLK.push({ ang, zz });
    }
    crys.castShadow = pmt.castShadow = true; crys.receiveShadow = pmt.receiveShadow = true;
    S.add(crys, pmt, glowM);
    const white = new THREE.MeshPhysicalMaterial({ color: 0xe8e8e4, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.25, metalness: 0 });
    const HZ = 1.45, ROUT = 5.9;
    const shellO = new THREE.Mesh(new THREE.CylinderGeometry(ROUT, ROUT, 2 * HZ, 128, 1, true), white); shellO.rotation.x = Math.PI / 2; S.add(shellO);
    const shellI = new THREE.Mesh(new THREE.CylinderGeometry(5.05, 5.05, 2 * HZ, 128, 1, true), new THREE.MeshStandardMaterial({ color: 0x3a3d43, roughness: 0.6, side: THREE.BackSide })); shellI.rotation.x = Math.PI / 2; S.add(shellI);
    for (const s of [-1, 1]) { const tor = new THREE.Mesh(new THREE.TorusGeometry(ROUT - 0.12, 0.14, 16, 160), white); tor.position.z = s * HZ; S.add(tor); }
    const backW = new THREE.Mesh(new THREE.RingGeometry(RIN - 0.1, ROUT - 0.05, 160, 1), white); backW.position.z = -HZ - 0.02; backW.rotation.y = Math.PI; S.add(backW);
    const backLip = new THREE.Mesh(new THREE.TorusGeometry(RIN - 0.1, 0.1, 12, 160), white); backLip.position.z = -HZ; S.add(backLip);
    const frontW = new THREE.Mesh(new THREE.RingGeometry(5.25, ROUT - 0.05, 160, 1), white); frontW.position.z = HZ + 0.02; S.add(frontW);
    for (const s of [-1, 1]) { const ringPl = new THREE.Mesh(new THREE.RingGeometry(RIN + 0.95, 5.05, 160, 1, 0, TAU), new THREE.MeshStandardMaterial({ color: 0x23262b, roughness: 0.55, metalness: 0.4, side: THREE.DoubleSide })); ringPl.position.z = s * (ZL / 2 + 0.06); S.add(ringPl); }
    [shellO, backW, frontW].forEach((m) => { m.receiveShadow = true; });
    const key = S.userData.key; key.position.set(-6, 9, 10);
    const fill = new THREE.PointLight(0xdfe6f0, 6, 0, 2); fill.position.set(0, 0, 2.5); S.add(fill);
    // brain made of points (stylised FDG image): cortex shell with folds, two hemispheres, bright deep nuclei
    const NP = 12000, rr = rnd(77), pos = new Float32Array(NP * 3), aT = new Float32Array(NP), aB = new Float32Array(NP), ax = [0.74, 0.92, 0.64];
    const nuclei = [[0.2, 0.12, 0.02, 0.11], [-0.2, 0.12, 0.02, 0.11], [0.09, -0.08, 0.0, 0.09], [-0.09, -0.08, 0.0, 0.09]];
    for (let i = 0; i < NP; i++) {
      let x, y, z, b;
      if (rr() < 0.07) { const nu = nuclei[(rr() * 4) | 0]; do { x = rr() * 2 - 1; y = rr() * 2 - 1; z = rr() * 2 - 1; } while (x * x + y * y + z * z > 1); x = nu[0] + x * nu[3]; y = nu[1] + y * nu[3] * 1.3; z = nu[2] + z * nu[3]; b = 0.55 + 0.15 * rr(); }
      else for (;;) {
        x = rr() * 2 - 1; y = rr() * 2 - 1; z = rr() * 2 - 1; const qn = Math.sqrt(x * x + y * y + z * z); if (qn > 1) continue;
        const fold = 0.5 + 0.5 * Math.sin(8 * Math.atan2(y, x) + 6 * z + 4 * fbm(x * 3 + 5, z * 3 + y * 2 + 5, 7, 3));
        const pAcc = qn < 0.5 ? 0.06 : 0.1 + 0.9 * smooth((qn - 0.74) / 0.2) * (0.35 + 0.65 * fold);
        if (Math.abs(x) < 0.05 && qn > 0.4) continue; if (rr() > pAcc) continue;
        x *= ax[0]; y *= ax[1]; z *= ax[2]; if (y < -0.45 && Math.abs(z) < 0.2 && z < 0) continue; b = 0.35 + 0.5 * smooth((qn - 0.7) / 0.3) * fold + 0.1 * rr(); break;
      }
      pos[i * 3] = x * 0.8; pos[i * 3 + 1] = y * 0.8; pos[i * 3 + 2] = z * 0.8; aT[i] = PET.img0 + (PET.img1 - PET.img0) * Math.sqrt(rr()); aB[i] = b;
    }
    const bg = new THREE.BufferGeometry(); bg.setAttribute("position", new THREE.BufferAttribute(pos, 3)); bg.setAttribute("aT", new THREE.BufferAttribute(aT, 1)); bg.setAttribute("aB", new THREE.BufferAttribute(aB, 1));
    const brainMat = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, uMap: { value: DOT() }, uS: { value: 1 }, uK: { value: 1 } },
      vertexShader: `attribute float aT, aB; uniform float uT, uS; varying float vA, vB; void main(){ float age = uT - aT; vA = smoothstep(0.0, 0.25, age) * (1.0 + 2.5 * exp(-max(age, 0.0) * 6.0)); vB = aB; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = uS * (0.034 + 0.014 * aB) * 1080.0 / (-mv.z) * 0.9; gl_Position = projectionMatrix * mv; if (age < 0.0) gl_PointSize = 0.0; }`,
      fragmentShader: `uniform sampler2D uMap; uniform float uK; varying float vA, vB; void main(){ vec4 t = texture2D(uMap, gl_PointCoord); vec3 c = mix(vec3(0.89, 0.5, 0.2), vec3(1.0, 0.86, 0.66), vB); float a = t.a * vA * (0.1 + 0.2 * vB) * uK; gl_FragColor = vec4(c, a);
        #include <colorspace_fragment>
      }` });
    const brain = new THREE.Points(bg, brainMat); S.add(brain);
    // soft body of the image: the same events drawn again as wide, faint sprites so the picture reads smooth, not speckled
    const glowMat = brainMat.clone(); glowMat.uniforms = THREE.UniformsUtils.clone(brainMat.uniforms); glowMat.uniforms.uS.value = 4.5; glowMat.uniforms.uK.value = 0.1; glowMat.uniforms.uMap.value = DOT();
    const brainGlow = new THREE.Points(bg, glowMat); S.add(brainGlow);
    // particles: positron (cool white haze) and electron (pale blue haze)
    function hazeBall(col, seed) {
      const g = new THREE.Group(), sp = [];
      for (let i = 0; i < 4; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: hazeTex(seed + i), color: col, transparent: true, depthWrite: false, opacity: 0.5, blending: THREE.AdditiveBlending })); s.scale.setScalar(0.07 + i * 0.04); g.add(s); sp.push(s); }
      const core = glowSprite(col, 0.03, 0.4); g.add(core); sp.push(core); S.add(g);
      return { g, set: (op, ft) => { g.visible = op > 0.003; sp.forEach((s, i) => { s.material.opacity = op * (i === 4 ? 0.4 : 0.5 - i * 0.09); if (i < 4) s.material.rotation = ft * (0.25 + i * 0.13) * (i % 2 ? -1 : 1); }); } };
    }
    const pos1 = hazeBall(0xeef2fa, 21), ele = hazeBall(0x9ec3e6, 31);
    const flash = glowSprite(0xc9d8ee, 0.3, 0), flash2 = glowSprite(0xb9cbe6, 1, 0); S.add(flash, flash2);
    // gamma rays: thin bright core + soft sheath, gradient fading toward the source
    const rayTex = canvasTex(8, 256, (g) => { const gr = g.createLinearGradient(0, 256, 0, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.75, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, 8, 256); });
    const mkRay = (col, op) => { const m = new THREE.Mesh(STREAK_G, new THREE.MeshBasicMaterial({ map: rayTex, color: col, transparent: true, opacity: op, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(m); return m; };
    const main = [mkRay(0xf4f7ff, 0.95), mkRay(0xf4f7ff, 0.95)], mainS = [mkRay(0xb8cdf0, 0.25), mkRay(0xb8cdf0, 0.25)], tips = [glowSprite(0xe8f0ff, 0.2, 0.7), glowSprite(0xe8f0ff, 0.2, 0.7)]; tips.forEach((s) => S.add(s));
    const DIR0 = new V3(Math.cos(0.32), Math.sin(0.32), 0);
    // later events (lines of response): start inside the brain, random direction in the ring plane, chords to the ring
    const ev = [], er = rnd(91), NEV = 64;
    for (let j = 0; j < NEV; j++) {
      const i = (er() * NP) | 0, p = new V3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]), th = er() * Math.PI, d = new V3(Math.cos(th), Math.sin(th), 0);
      const b = p.x * d.x + p.y * d.y, c = p.x * p.x + p.y * p.y - RIN * RIN, s = Math.sqrt(b * b - c), hA = p.clone().addScaledVector(d, -b + s), hB = p.clone().addScaledVector(d, -b - s);
      ev.push({ t: PET.lor0 + 5.8 * Math.pow(j / NEV, 0.72), p, hA, hB });
    }
    const blockOf = (h) => { const a = ((Math.atan2(h.y, h.x) / TAU + 1) % 1) * NA | 0, z = clamp(Math.floor((h.z + ZL / 2) / (AZ + 0.04)), 0, NZ - 1); return a * NZ + z; };
    ev.forEach((e) => { e.bA = blockOf(e.hA); e.bB = blockOf(e.hB); });
    const firstA = blockOf(DIR0.clone().multiplyScalar(RIN)), firstB = blockOf(DIR0.clone().multiplyScalar(-RIN));
    const NL = 8, lr = [], ls = [];
    for (let i = 0; i < NL * 2; i++) { lr.push(mkRay(0xeef3ff, 0.6)); }
    for (let i = 0; i < NL; i++) { const s = glowSprite(0xeef3ff, 0.12, 0); S.add(s); ls.push(s); }
    const inten = new Float32Array(nB), gcol = new THREE.Color();
    // camera: log-distance keys; the ray tips ride with the pull-back and reach the ring at PET.hit
    const KD = [[566.96, Math.log(0.9)], [571.2, Math.log(0.6)], [573.5, Math.log(1.3)], [575.8, Math.log(4.2)], [577.95, Math.log(12.2)], [579.4, Math.log(13.4)], [580.2, Math.log(12.8)], [582.3, Math.log(4.7)], [586.52, Math.log(4.2)]];
    const KA = [[566.96, 18], [571.2, 30], [575, 24], [578.5, 26], [580.2, 30], [582.3, 4], [586.52, 0]], KE = [[566.96, 6], [571.2, 9], [575, 13], [578.5, 17], [580.2, 18], [582.3, 5], [586.52, 3]];
    const KT = [[566.96, 0], [586.52, 0]], KY = [[566.96, 0], [586.52, 0]], KO = [[566.96, 0], [580.2, 0], [582.3, 0.05], [586.52, 0.05]], KX = [[566.96, 0], [580.2, 0], [582.3, -0.1], [586.52, -0.1]];
    const d0 = Math.exp(cr(KD, PET.meet + 0.1));
    const tipR = (ft) => clamp((Math.exp(cr(KD, ft)) - d0) / ((12.2 - d0) / RIN), 0, RIN);
    const va = new V3(), vb = new V3();
    return (t) => {
      const ft = o.T0 + t;
      aim(C, cr(KT, ft), cr(KY, ft), 0, Math.exp(cr(KD, ft)), cr(KA, ft), cr(KE, ft), cr(KO, ft), cr(KX, ft));
      S.fog.near = 0.6 * Math.exp(cr(KD, ft)); S.fog.far = 6 + 4 * Math.exp(cr(KD, ft));
      // approach: a slow drift together with a gentle mutual spiral
      const u = clamp((ft - PET.t0) / (PET.meet - PET.t0), 0, 1), sep = 0.2 * Math.pow(1 - u, 1.3), ph = 0.25 + 2.2 * u * u;
      pos1.g.position.set(-Math.cos(ph) * sep, -Math.sin(ph) * sep * 0.55, Math.sin(ph) * sep * 0.4); ele.g.position.set(Math.cos(ph) * sep, Math.sin(ph) * sep * 0.55, -Math.sin(ph) * sep * 0.4);
      const vanish = 1 - seg(ft, PET.meet - 0.12, PET.meet + 0.2);
      pos1.set(vanish, ft); ele.set(vanish, ft);
      const fk = Math.exp(-Math.max(0, ft - PET.meet) * 2.6) * seg(ft, PET.meet - 0.1, PET.meet + 0.05);
      flash.material.opacity = 0.24 * fk; flash.scale.setScalar(0.1 + 0.25 * (1 - fk)); flash2.material.opacity = 0.16 * fk; flash2.scale.setScalar(0.35 + 0.8 * (1 - fk));
      // first pair
      const dCam = Math.exp(cr(KD, ft)), r = tipR(ft), firstOn = ft > PET.meet && ft < PET.hit + 0.9, fade = 1 - seg(ft, PET.hit + 0.15, PET.hit + 0.85);
      for (let s = 0; s < 2; s++) {
        const sg = s ? -1 : 1, tip = DIR0.clone().multiplyScalar(sg * r), tail = DIR0.clone().multiplyScalar(sg * Math.max(0, r - Math.max(0.25, r * 0.6)));
        main[s].visible = mainS[s].visible = tips[s].visible = firstOn;
        if (firstOn) { placeStreak(main[s], tail, tip, 0.0022 * dCam); placeStreak(mainS[s], tail, tip, 0.009 * dCam); main[s].material.opacity = 0.95 * fade; mainS[s].material.opacity = 0.22 * fade; tips[s].position.copy(tip); tips[s].scale.setScalar(0.05 * dCam); tips[s].material.opacity = 0.5 * fade * (r < RIN ? 1 : 0.6); }
      }
      // detector glows
      inten.fill(0);
      const hitK = (te) => (ft >= te ? Math.exp(-(ft - te) / 0.55) : 0);
      inten[firstA] += 1.0 * hitK(PET.hit); inten[firstB] += 1.0 * hitK(PET.hit);
      let li = 0;
      for (const e of ev) {
        const age = ft - e.t; if (age < -0.01) continue;
        const reach = clamp(age / 0.14, 0, 1);
        inten[e.bA] += hitK(e.t + 0.14); inten[e.bB] += hitK(e.t + 0.14);
        if (age < 0.5 && li < NL) {
          const op = 0.5 * (1 - smooth((age - 0.15) / 0.35));
          va.copy(e.p).lerp(e.hA, reach); vb.copy(e.p).lerp(e.hB, reach);
          placeStreak(lr[li * 2], e.p, va, 0.0016 * dCam); placeStreak(lr[li * 2 + 1], e.p, vb, 0.0016 * dCam); lr[li * 2].material.opacity = lr[li * 2 + 1].material.opacity = op;
          ls[li].position.copy(e.p); ls[li].scale.setScalar(0.03 * dCam); ls[li].material.opacity = 0.7 * Math.exp(-age * 5); li++;
        }
      }
      for (let i = li; i < NL; i++) { lr[i * 2].visible = lr[i * 2 + 1].visible = false; ls[i].material.opacity = 0; }
      // background twinkle of the many unseen pairs while the image fills in
      const busy = seg(ft, 579.5, 581.5), fq = Math.floor(ft * 14);
      for (let i = 0; i < nB; i++) { const hsh = hash(i, fq, 5); if (hsh > 0.93) inten[i] += busy * 0.45 * (hsh - 0.93) / 0.07; }
      for (let i = 0; i < nB; i++) { const k = Math.min(0.85, inten[i]); gcol.setRGB(0.4 * k, 0.58 * k, 0.88 * k); glowM.setColorAt(i, gcol); }
      glowM.instanceColor.needsUpdate = true;
      brainMat.uniforms.uT.value = ft; brainMat.uniforms.uK.value = 0.7; glowMat.uniforms.uT.value = ft;
      const pp = pos1.g.position, pe = ele.g.position, tipA = DIR0.clone().multiplyScalar(r * 0.92), hb = BLK[firstA], hp = new V3(Math.cos(hb.ang) * (RIN - 0.05), Math.sin(hb.ang) * (RIN - 0.05), hb.zz);
      return [S, C, [["positron", pp.x, pp.y + 0.02, pp.z, win(ft, 567.3, 569.0, 0.4)], ["electron", pe.x, pe.y + 0.02, pe.z, win(ft, 569.1, 570.6, 0.4)],
        ["gamma ray", tipA.x, tipA.y, tipA.z, win(ft, 573.8, 576.9, 0.5)], ["detector crystals", hp.x, hp.y, hp.z, win(ft, 578.2, 580.6, 0.5)]]];
    };
  };
})();
