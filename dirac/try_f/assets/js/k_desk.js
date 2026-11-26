/* k_desk.js — group D ("The Dirac Equation"): eqpaper (Dirac's Cambridge study at night, 14 modes) and stone (his floor stone in Westminster Abbey).
   LABK.name = (o) => (t, d) => [scene, camera]; ft = o.T0 + t is film time. Pure functions of t.
   One study is built once and shared by every eqpaper shot (each frame sets all of its state); one abbey floor for both stone shots.
   EV = sound/visual event times in FILM seconds. Helpers adapted from emc2/assets/js/k_history.js. */
(function () {
  const { THREE, seg, smooth, lerp, clamp, rnd, orbit, stage, glowSprite, W, H } = L3;
  const EV = {
    flicker: 61.06,       // strange: the lamp dips once ("so strange")
    strike: 607.62,       // guess: 'hole = proton?' struck through ("It didn't work")
    clockA: 111.46, clockB: 120.40,   // clock: the minute hand sweeps one full hour
  };
  const V = (x, y, z) => new THREE.Vector3(x, y, z), TAU = Math.PI * 2;

  // ---------------------------------------------------------------- camera helpers (keys in SHOT seconds)
  function aim(C, p, dist, az, el, ox, oy) {
    orbit(C, p.x, p.y, p.z, dist, az, el);
    C.near = Math.max(0.01, dist * 0.03); C.far = 400;
    if (ox || oy) C.setViewOffset(W, H, ox || 0, oy || 0, W, H); else C.clearViewOffset();
    C.updateProjectionMatrix();
  }
  function cr(K, t) {
    const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    let i = 0; while (t >= K[i + 1][0]) i++;
    const a = K[Math.max(i - 1, 0)], b = K[i], c = K[i + 1], d = K[Math.min(i + 2, n - 1)], h = c[0] - b[0], u = (t - b[0]) / h;
    const m1 = i === 0 ? (c[1] - b[1]) * 0.5 : (c[1] - a[1]) / (c[0] - a[0]) * h, m2 = i + 2 >= n ? (c[1] - b[1]) * 0.5 : (d[1] - b[1]) / (d[0] - b[0]) * h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * b[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * c[1] + (u3 - u2) * m2;
  }
  // K: [[t, tx, ty, tz, dist, az, el, ox, oy], ...]
  function camKeys(C, K, t, out) { const g = (j) => cr(K.map((k) => [k[0], k[j] || 0]), t), p = V(g(1), g(2), g(3)); aim(C, p, g(4), g(5), g(6), g(7), g(8)); if (out) out.copy(p); }

  // ---------------------------------------------------------------- procedural textures (cached, seeded)
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function vn(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s, o) { let f = 0, a = 0.5; for (let i = 0; i < (o || 4); i++) { f += a * vn(x, y, s + i * 17); x *= 2; y *= 2; a *= 0.5; } return f; }
  const TC = window.__kdTC || (window.__kdTC = {});
  function ctex(key, w, h, fn, lin) {
    if (key && TC[key]) return TC[key];
    const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = lin ? THREE.NoColorSpace : THREE.SRGBColorSpace; t.anisotropy = 16;
    if (key) TC[key] = t; return t;
  }
  function pixTex(key, w, h, fn, lin) {
    if (TC[key]) return TC[key];
    const t = ctex(null, w, h, (g) => { const im = g.createImageData(w, h), D = im.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn(x, y), i = (y * w + x) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = 255; } g.putImageData(im, 0, 0); }, lin);
    t.wrapS = t.wrapT = THREE.RepeatWrapping;
    return (TC[key] = t);
  }
  const rep = (t, x, y) => { const c = t.clone(); c.repeat.set(x, y); c.needsUpdate = true; return c; };

  // ---------------------------------------------------------------- depth-of-field on textures: mip bias grows with distance from the focus plane
  const FOC = { uFocus: { value: 5 }, uBlur: { value: 0 } };
  function focusMat(m) {
    m.onBeforeCompile = (sh) => {
      sh.uniforms.uFocus = FOC.uFocus; sh.uniforms.uBlur = FOC.uBlur;
      sh.fragmentShader = "uniform float uFocus;\nuniform float uBlur;\n" + sh.fragmentShader.replace("#include <map_fragment>",
        `#ifdef USE_MAP
          float fz = vViewPosition.z;
          float fb = min(log2(1.0 + uBlur * abs(fz - uFocus) / max(fz, 0.01)), 7.0);
          vec2 tsz = vec2(textureSize(map, 0)), du = dFdx(vMapUv * tsz), dv = dFdy(vMapUv * tsz);
          float lod0 = max(0.5 * log2(max(dot(du, du), dot(dv, dv))), 0.0);
          diffuseColor *= mix(texture2D(map, vMapUv), textureLod(map, vMapUv, lod0 + fb), smoothstep(0.0, 0.6, fb));
        #endif`);
    };
    m.customProgramCacheKey = () => "kdFocus";
    return m;
  }
  const setFocus = (C, p, blur) => { FOC.uFocus.value = C.position.distanceTo(p); FOC.uBlur.value = blur; };

  // ---------------------------------------------------------------- shared bits
  const at = (m, x, y, z) => { m.position.set(x, y, z); return m; };
  const shadowAll = (o, cast, recv) => o.traverse((m) => { if (m.isMesh) { m.castShadow = cast !== false; m.receiveShadow = recv !== false; } });
  function roundBox(w, h, d, r) {
    const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
    s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y); s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
    s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r * 0.6, bevelEnabled: true, bevelThickness: r * 0.6, bevelSize: r * 0.5, bevelSegments: 4, curveSegments: 6 });
    g.translate(0, 0, -(d - 2 * r * 0.6) / 2); return g;
  }
  function spot(S, col, inten, pos, tgt, ang, pen, shadow) {
    const l = new THREE.SpotLight(col, inten, 0, ang, pen === undefined ? 0.8 : pen, 2); l.position.copy(pos); l.target.position.copy(tgt); S.add(l, l.target);
    if (shadow !== false) { l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.bias = -0.0003; l.shadow.normalBias = 0.012; l.shadow.camera.near = 0.3; l.shadow.radius = 5; }
    return l;
  }
  const woodTex = (key, base, seed) => pixTex(key, 1024, 512, (x, y) => {
    const n = fbm(x / 420, y / 40, seed, 4), ring = 0.5 + 0.5 * Math.sin((y / 512 * 60 + n * 3.2) * Math.PI), fine = vn(x / 3, y / 0.9, seed + 9), streak = fbm(x / 900, y / 6, seed + 5, 3);
    const k = 0.8 + 0.08 * Math.pow(ring, 3) + 0.06 * fine + 0.12 * (streak - 0.5) - 0.08 * fbm(x / 300, y / 200, seed + 3, 2);
    return [base[0] * k, base[1] * k, base[2] * k];
  });
  function wood(key, base, seed, rough, rp, env) {
    const m = new THREE.MeshStandardMaterial({ map: woodTex(key, base, seed), roughness: rough || 0.55, metalness: 0, bumpMap: woodTex(key, base, seed), bumpScale: 0.6, envMapIntensity: env === undefined ? 0.5 : env });
    if (rp) { m.map = rep(m.map, rp[0], rp[1]); m.bumpMap = m.map; } return focusMat(m);
  }

  // ---------------------------------------------------------------- paper
  const grainCanvas = () => {
    if (TC.__grain) return TC.__grain;
    const n = 256, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d"), im = g.createImageData(n, n), D = im.data;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      const f = (xx, yy) => fbm(xx / 40, yy / 40, 3, 4), u = x / n, v = y / n;
      const a = f(x, y) * (1 - u) * (1 - v) + f(x - n, y) * u * (1 - v) + f(x, y - n) * (1 - u) * v + f(x - n, y - n) * u * v;
      const k = 205 + (a - 0.5) * 70 + (hash(x, y, 9) - 0.5) * 36, i = (y * n + x) * 4; D[i] = D[i + 1] = D[i + 2] = clamp(k, 0, 255); D[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    const r = rnd(41); g.lineCap = "round";
    for (let i = 0; i < 700; i++) { const x = r() * n, y = r() * n, a = r() * TAU, l = 5 + r() * 18; g.strokeStyle = r() < 0.55 ? "rgba(255,255,255,0.22)" : "rgba(60,50,40,0.13)"; g.lineWidth = 0.5 + r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
    return (TC.__grain = c);
  };
  function paperBump() {
    if (TC.__pbump) return TC.__pbump;
    const t = new THREE.CanvasTexture(grainCanvas()); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; return (TC.__pbump = t);
  }
  // a sheet lying flat (XZ plane, +y up), size w x h; texture top = -z
  function sheet(tex, w, h, o) {
    o = o || {}; const nx = o.nx || 30, nz = o.nz || 40, r = rnd(o.seed || 3);
    const geo = new THREE.PlaneGeometry(w, h, nx, nz); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position, c1 = o.curl === undefined ? 0.035 : o.curl, wv = o.wave === undefined ? 0.006 : o.wave, ph = r() * 6, cx = r() < 0.5 ? -1 : 1;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / (w / 2), v = p.getZ(i) / (h / 2);
      let y = c1 * Math.pow(Math.max(0, Math.abs(u) - 0.6) / 0.4, 2) * (0.6 + 0.4 * Math.abs(v)) + c1 * 0.7 * Math.pow(Math.max(0, cx * u * 0.5 + 0.5 * v - 0.55) / 0.45, 2) + wv * Math.sin(u * 2.2 + ph) * Math.cos(v * 1.7 + ph * 0.7) + wv;
      if (o.gutter) y += o.gutter * Math.sin(Math.min(1, Math.abs(u) / 0.25) * Math.PI / 2);
      p.setY(i, y + (o.lift || 0));
    }
    geo.computeVertexNormals();
    const mat = focusMat(new THREE.MeshStandardMaterial({ map: tex, roughness: 0.88, metalness: 0, bumpMap: rep(paperBump(), w * 1.6, h * 1.6), bumpScale: 0.35, envMapIntensity: 0.08, side: THREE.DoubleSide }));
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m;
  }
  function contact(w, h, op, soft) {
    const s = soft || 0.1, t = ctex("contact" + s, 256, 256, (g, W2, H2) => { g.fillStyle = "#000"; g.fillRect(0, 0, W2, H2); g.filter = `blur(${Math.round(W2 * s * 0.5)}px)`; g.fillStyle = "#fff"; const m = W2 * s; g.fillRect(m, m, W2 - 2 * m, H2 - 2 * m); }, true);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * (1 + s * 2.4), h * (1 + s * 2.4)).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ alphaMap: t, transparent: true, opacity: op || 0.5, depthWrite: false, color: 0x000000 }));
    m.renderOrder = 1; return m;
  }

  // ---------------------------------------------------------------- handwriting (real maths, per-glyph jitter, iron-gall blue-black ink)
  const HF = "'Segoe Print', 'Ink Free', cursive";
  const INK = [24, 28, 50];
  const SUBS = { "₀": "0", "₁": "1", "₂": "2", "₃": "3", "₄": "4" }, SUPS = { "²": "2", "³": "3", "⁴": "4" };
  function toks(str) {
    const out = [];
    for (let i = 0; i < str.length; i++) {
      const c = str[i];
      if (SUBS[c]) out.push([SUBS[c], "_"]); else if (SUPS[c]) out.push([SUPS[c], "^"]);
      else if ((c === "_" || c === "^") && i + 1 < str.length) { if (str[i + 1] === "{") { const j = str.indexOf("}", i); for (const cc of str.slice(i + 2, j)) out.push([cc, c]); i = j; } else { out.push([str[i + 1], c]); i++; } }
      else out.push([c, ""]);
    }
    return out;
  }
  function hw(g, str, x, y, px, seed, o) {
    o = o || {}; const r = rnd(seed || 1), col = o.col || INK, font = o.font || HF;
    for (const [ch, m] of toks(str)) {
      const fs = px * (m ? 0.62 : 1), dy = m === "_" ? px * 0.24 : m === "^" ? -px * 0.42 : 0;
      const sc = 1 + (r() - 0.5) * 0.08, rot = (r() - 0.5) * 0.07, a = (o.a || 0.92) * (0.8 + r() * 0.2);
      g.save(); g.translate(x, y + dy + (r() - 0.5) * px * 0.04); g.rotate(rot + (o.rot || 0)); g.scale(sc, sc);
      g.font = `${fs}px ${font}`; g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`; g.fillText(ch, 0, 0);
      g.globalAlpha = 0.3; g.fillText(ch, fs * 0.016, fs * 0.012); g.restore();
      g.font = `${fs}px ${font}`; x += g.measureText(ch).width * sc * (o.tight || 0.96);
    }
    return x;
  }
  function stroke(g, pts, w, seed, a, col) {
    const r = rnd(seed); col = col || INK; g.save(); g.lineCap = "round"; g.lineJoin = "round"; g.strokeStyle = `rgba(${col[0]},${col[1]},${col[2]},${a || 0.85})`; g.lineWidth = w;
    g.beginPath(); pts.forEach(([x, y], i) => { const jx = x + (r() - 0.5) * w * 0.8, jy = y + (r() - 0.5) * w * 0.8; if (i) g.lineTo(jx, jy); else g.moveTo(jx, jy); }); g.stroke(); g.restore();
  }
  const wobLine = (x0, y0, x1, y1, n, amp, seed) => { const r = rnd(seed), out = []; for (let i = 0; i <= n; i++) { const u = i / n; out.push([lerp(x0, x1, u), lerp(y0, y1, u) + Math.sin(u * 5 + seed) * amp + (r() - 0.5) * amp]); } return out; };
  function frac(g, num, den, x, y, px, seed) {
    g.font = `${px}px ${HF}`; const w = Math.max(g.measureText(num).width, g.measureText(den).width) + px * 0.3;
    hw(g, num, x + (w - g.measureText(num).width) / 2, y - px * 0.55, px, seed); hw(g, den, x + (w - g.measureText(den).width) / 2, y + px * 0.62, px, seed + 1);
    stroke(g, wobLine(x, y - px * 0.28, x + w, y - px * 0.3, 6, px * 0.02, seed), px * 0.06, seed); return x + w + px * 0.15;
  }
  function bracket(g, x, y0, y1, dir, px, seed) { const k = px * 0.22 * dir; stroke(g, [[x + k, y0], [x, y0 + px * 0.1], [x - k * 0.1, (y0 + y1) / 2], [x, y1 - px * 0.1], [x + k, y1]], px * 0.07, seed); }
  function matrix(g, rows, x, y, px, seed) {   // y = baseline of the first row
    const cw = px * 1.15, rh = px * 1.12, n = rows.length, y0 = y - px * 0.95, y1 = y + (n - 1) * rh + px * 0.35;
    bracket(g, x, y0, y1, 1, px, seed); x += px * 0.45;
    rows.forEach((row, i) => row.forEach((e, j) => { g.font = `${px}px ${HF}`; const ew = g.measureText(e).width; hw(g, e, x + j * cw + (cw - ew) / 2 - (e.length > 1 ? px * 0.1 : 0), y + i * rh, px, seed + i * 7 + j); }));
    x += rows[0].length * cw + px * 0.15; bracket(g, x, y0, y1, -1, px, seed + 3); return x + px * 0.4;
  }
  // paper via X3.paperTex (the film's shared paper), then ink drawn onto its canvas
  function page(key, w, h, seed, draw) {
    if (TC[key]) return TC[key];
    const t = X3.paperTex([], { w, h, seed });
    const g = t.image.getContext("2d"), k = w / 1024;
    g.save(); g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.28; g.fillStyle = g.createPattern(grainCanvas(), "repeat"); g.fillRect(0, 0, w, h); g.restore();
    g.save(); g.scale(k, k); draw(g, 1024, h / k); g.restore();
    t.anisotropy = 16; t.needsUpdate = true; return (TC[key] = t);
  }
  const RHO3 = [["1", "0", "0", "0"], ["0", "1", "0", "0"], ["0", "0", "−1", "0"], ["0", "0", "0", "−1"]];   // Dirac's ρ₃ (= β)
  const RHO1 = [["0", "0", "1", "0"], ["0", "0", "0", "1"], ["1", "0", "0", "0"], ["0", "1", "0", "0"]];   // ρ₁ (= [[0, I], [I, 0]])
  // the key page: his 1928 working, top to bottom (design 1024 x 1400)
  const EQY = 935;   // baseline of the big equation (design px)
  const texEq = () => page("pgEq", 2048, 2800, 51, (g) => {
    hw(g, "§ 2.", 92, 120, 34, 1, { a: 0.7 });
    hw(g, "E² = m²c⁴ + p²c²", 120, 215, 62, 2);
    let x = hw(g, "p₀² − p² − m²c² = 0", 120, 318, 44, 3);
    x = hw(g, "p₀ = √(p² + m²c²) ?", x + 50, 318, 34, 4, { a: 0.75 });
    stroke(g, wobLine(565, 306, x, 302, 8, 3, 5), 3.2, 5, 0.8);
    hw(g, "( p₀ + α₁p₁ + α₂p₂ + α₃p₃ + βmc ) ψ = 0", 120, 425, 38, 6);
    hw(g, "γ_μγ_ν + γ_νγ_μ = 2δ_{μν}", 140, 520, 46, 7);
    x = hw(g, "ρ₃ =", 120, 640, 38, 8); x = matrix(g, RHO3, x + 18, 640, 34, 9);
    x = hw(g, "ρ₁ =", x + 70, 640, 38, 10); matrix(g, RHO1, x + 18, 640, 34, 11);
    x = hw(g, X3.EQ1928, 100, EQY, 54, 12);
    stroke(g, wobLine(100, EQY + 28, x + 10, EQY + 22, 10, 2.5, 13), 4, 13, 0.85);
    stroke(g, wobLine(110, EQY + 44, x, EQY + 40, 10, 2.5, 14), 3.2, 14, 0.8);
    x = hw(g, "ih", 120, 1085, 50, 15); x = frac(g, "∂ψ", "∂t", x + 10, 1085, 46, 16); hw(g, "= Hψ", x + 10, 1085, 50, 17);
    hw(g, "ψ = ( ψ₁, ψ₂, ψ₃, ψ₄ )", 560, 1085, 40, 18);
    hw(g, "W = ± √(m²c⁴ + c²p²)", 120, 1215, 44, 19);
    hw(g, "two signs —", 600, 1215, 30, 20, { a: 0.7 }); hw(g, "keep both", 620, 1258, 30, 21, { a: 0.7 });
  });
  const MISC = ["H = c(α, p) + βmc²", "β² = 1    α_rβ + βα_r = 0", "(σ, p)² = p²", "σ₁σ₂ = iσ₃", "W² = c²p² + m²c⁴", "ψ = e^{i(px − Wt)/h}", "p₀ = W/c + e/c A₀", "(σ, H) e h/2mc", "j = c ψ̄ αψ", "ρ₁ρ₂ = iρ₃", "∑ ψ̄ψ = 1", "α_r = ρ₁σ_r"];
  const texMisc = (i) => page("pgMisc" + i, 1024, 1400, 60 + i, (g) => {
    const r = rnd(70 + i); let y = 140 + r() * 40;
    while (y < 1300) {
      const s = MISC[Math.floor(r() * MISC.length)], x0 = 90 + r() * 120, px = 30 + r() * 12, xe = hw(g, s, x0, y, px, 80 + i * 31 + y);
      if (r() < 0.18) stroke(g, wobLine(x0 - 8, y - px * 0.3, xe, y - px * 0.34, 6, 2, y), 2.6, y, 0.8);
      if (r() < 0.25 && xe < 700) hw(g, MISC[Math.floor(r() * MISC.length)], xe + 60, y, px * 0.8, 9 + y, { a: 0.75 });
      y += 70 + r() * 70;
    }
  });
  const texBlank = (i) => page("pgBlank" + i, 1024, 1400, 90 + i, () => {});
  const texSea = () => page("pgSea", 2048, 2800, 53, (g) => {
    hw(g, "1929", 820, 120, 36, 31, { a: 0.75 });
    hw(g, "E", 140, 205, 46, 32);
    stroke(g, [[170, 1260], [170, 230]], 3.5, 33); stroke(g, [[155, 255], [170, 225], [186, 255]], 3.5, 34);
    hw(g, "+mc²", 210, 420, 40, 35);
    stroke(g, wobLine(300, 410, 860, 410, 8, 2, 36), 3, 36, 0.85);
    hw(g, "empty", 520, 380, 30, 37, { a: 0.7 });
    hw(g, "no levels", 450, 520, 32, 38, { a: 0.6 });
    hw(g, "−mc²", 210, 640, 40, 39);
    // the staircase: each level one step lower and a little wider, every place filled
    const r = rnd(40);
    for (let k = 0; k < 7; k++) {
      const y = 640 + k * 88, x0 = 300 - k * 22, x1 = 880 - k * 4;
      stroke(g, wobLine(x0, y, x1, y, 8, 1.5, 41 + k), 3, 41 + k, 0.85);
      if (k < 6) stroke(g, [[x0, y], [x0 - 22, y + 88]], 2.6, 50 + k, 0.7);
      for (let x = x0 + 26; x < x1 - 14; x += 44) {
        g.save(); g.strokeStyle = `rgba(${INK.join(",")},0.82)`; g.lineWidth = 2.6; g.beginPath(); g.ellipse(x + (r() - 0.5) * 4, y - 19 + (r() - 0.5) * 3, 15 + r() * 2, 14 + r() * 2, r(), 0, TAU); g.stroke();
        g.fillStyle = `rgba(${INK.join(",")},0.22)`; g.fill(); g.restore();
      }
    }
    hw(g, "⋮", 560, 1290, 60, 60);
    hw(g, "all full", 700, 1300, 36, 61);
    hw(g, "one per place (Pauli)", 300, 1370, 30, 62, { a: 0.75 });
  });
  const texGuess = () => page("pgGuess", 2048, 2800, 55, (g) => {
    hw(g, "a hole in the sea:", 120, 230, 40, 71);
    hw(g, "charge +e,  energy +", 140, 320, 38, 72);
    hw(g, "moves like a positive particle", 140, 405, 36, 73);
    stroke(g, [[140, 470], [900, 466]], 2.4, 74, 0.5);
    hw(g, "hole = proton ?", 210, 640, 78, 75);
    hw(g, "m_p = 1836 m_e", 160, 900, 40, 76, { a: 0.8 });
    hw(g, "?", 560, 900, 40, 77, { a: 0.8 });
    hw(g, "(Weyl: same mass)", 220, 1000, 32, 78, { a: 0.7 });
  });
  const GUESS = { x0: 190, x1: 800, y: 616 };   // where the strike runs (design px)
  const texTry = () => page("pgTry", 2048, 2800, 57, (g) => {
    hw(g, "ρ = |ψ|² − ...", 120, 210, 40, 81);
    let x = hw(g, "ρ = i h/2mc² ( ψ*∂ψ/∂t − ψ∂ψ*/∂t )", 120, 310, 36, 82);
    stroke(g, wobLine(110, 298, x, 296, 9, 3, 83), 3, 83, 0.8);
    hw(g, "can be < 0 ?", 160, 410, 36, 84);
    x = hw(g, "∂²ψ/∂t² = c²∇²ψ − ...", 120, 520, 36, 85);
    stroke(g, wobLine(110, 510, x, 506, 9, 3, 86), 3, 86, 0.8);
    stroke(g, wobLine(110, 526, x, 522, 9, 3, 87), 2.4, 87, 0.7);
    x = hw(g, "P = −0.3", 330, 760, 84, 88);
    g.save(); g.strokeStyle = `rgba(${INK.join(",")},0.85)`; g.lineWidth = 4.2; g.beginPath();
    for (let i = 0; i <= 60; i++) { const a = -0.4 + i / 60 * (TAU + 0.5), rr = 1 + 0.04 * Math.sin(i * 0.7); const px = 515 + Math.cos(a) * 250 * rr, py = 735 + Math.sin(a) * 92 * rr; if (i) g.lineTo(px, py); else g.moveTo(px, py); }
    g.stroke(); g.restore();
    stroke(g, [[300, 650], [470, 735], [740, 830]], 5, 89, 0.85); stroke(g, [[310, 840], [560, 735], [735, 645]], 5, 90, 0.85);
    hw(g, "negative probability", 260, 950, 36, 91); hw(g, "— nonsense", 330, 1010, 36, 92);
    hw(g, "second order in t: wrong", 160, 1170, 34, 93, { a: 0.8 });
  });
  const texRel = () => page("pgRel", 2048, 1400, 58, (g, w) => {   // 2-page notebook spread, design 1024 x 700 per... (two pages side by side)
    gutter(g, w, 700);
    hw(g, "Relativität", 560, 110, 46, 101);
    stroke(g, wobLine(560, 128, 820, 124, 6, 2, 102), 2.6, 102, 0.7);
    // light clock: two mirrors, the beam zig-zags while the clock moves
    for (const yy of [210, 520]) stroke(g, [[600, yy], [960, yy]], 4, 103 + yy);
    stroke(g, [[620, 520], [700, 210], [780, 520], [860, 210], [940, 520]], 2.6, 105, 0.85);
    for (const [ax, ay, bx, by] of [[660, 365, 700, 210], [820, 365, 860, 210]]) { const a = Math.atan2(by - ay, bx - ax); stroke(g, [[bx - 18 * Math.cos(a - 0.4), by - 18 * Math.sin(a - 0.4)], [bx, by], [bx - 18 * Math.cos(a + 0.4), by - 18 * Math.sin(a + 0.4)]], 2.6, ax); }
    hw(g, "c", 712, 360, 34, 106); hw(g, "v →", 760, 590, 34, 107);
    hw(g, "t' = t / √(1 − v²/c²)", 560, 650, 30, 108);
    hw(g, "c = const.", 80, 150, 34, 109); hw(g, "E = mc²", 80, 260, 40, 110); hw(g, "ds² = c²dt² − dx²", 80, 370, 32, 111); hw(g, "(Einstein 1905)", 80, 470, 28, 112, { a: 0.7 });
  });
  const texQM = () => page("pgQM", 2048, 1400, 59, (g, w) => {
    gutter(g, w, 700);
    hw(g, "Quantenmechanik", 545, 110, 44, 121);
    stroke(g, wobLine(545, 128, 880, 124, 6, 2, 122), 2.6, 122, 0.7);
    stroke(g, [[560, 380], [980, 380]], 2, 123, 0.6);
    const pts = []; for (let i = 0; i <= 120; i++) { const x = 570 + i * 3.4, u = (x - 770) / 110; pts.push([x, 380 - 120 * Math.exp(-u * u) * Math.cos(u * 6.2)]); } stroke(g, pts, 3, 124, 0.85);
    hw(g, "ψ", 600, 270, 44, 125); hw(g, "Δx", 750, 560, 32, 126);
    hw(g, "ih ∂ψ/∂t = Hψ", 560, 650, 32, 127);
    hw(g, "(Schrödinger 1926)", 80, 150, 28, 128, { a: 0.7 }); hw(g, "|ψ|² ≥ 0", 80, 260, 36, 129); hw(g, "p = −ih ∂/∂x", 80, 370, 34, 130); hw(g, "first order in t", 80, 480, 30, 131);
  });
  function gutter(g, w, h) { const gr = g.createLinearGradient(w / 2 - 50, 0, w / 2 + 50, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(60,45,30,0.2)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(w / 2 - 50, 0, 100, h); g.strokeStyle = "rgba(120,140,170,0.16)"; g.lineWidth = 1.2; for (let y = 90; y < h - 30; y += 46) { g.beginPath(); g.moveTo(30, y); g.lineTo(w / 2 - 30, y); g.moveTo(w / 2 + 30, y); g.lineTo(w - 30, y); g.stroke(); } }

  // printed journal pages (Proc. Roy. Soc. A 117, 1928) — title block is real, the body is greeked
  const SERIF = "Century, 'Bookman Old Style', Georgia, serif";
  function greek(g, x0, y0, wid, lines, fs, lh, seed) {
    const r = rnd(seed), SY = ["the", "of", "and", "con", "tion", "ing", "er", "ic", "al", "an", "re", "de", "ent", "ar", "ti", "ve", "pro", "qu", "ma", "ter", "st", "es", "on", "is", "be", "which", "ory", "ly", "in", "at"]; g.font = `${fs}px ${SERIF}`;
    for (let li = 0; li < lines; li++) {
      const words = []; let w = 0; const ind = li % 9 === 0 ? fs * 1.6 : 0;
      while (true) { let s = ""; const n = 1 + Math.floor(r() * 3); for (let k = 0; k < n; k++) s += SY[Math.floor(r() * SY.length)]; const ww = g.measureText(s).width; if (w + ww + fs * 0.3 > wid - ind && words.length) break; words.push([s, ww]); w += ww + fs * 0.3; }
      const last = li % 9 === 8 || li === lines - 1, gap = last ? fs * 0.3 : (wid - ind - words.reduce((s, q) => s + q[1], 0)) / Math.max(1, words.length - 1);
      let x = x0 + ind; const ws = last ? words.slice(0, Math.max(2, Math.floor(words.length * 0.5))) : words;
      ws.forEach(([s, ww]) => { g.fillText(s, x, y0 + li * lh); x += ww + gap; });
    }
  }
  const texJournal = () => page("pgJour", 2048, 1440, 61, (g, w) => {
    g.fillStyle = "rgba(30,26,22,0.92)"; g.textAlign = "center";
    // left page: end of the previous paper
    g.font = `16px ${SERIF}`; g.fillText("609", 70, 52);
    greek(g, 60, 90, 400, 26, 13, 21, 5);
    // right page: Dirac's paper
    g.font = `15px ${SERIF}`; g.fillText("[ 610 ]", 768, 52);
    g.font = `bold 27px ${SERIF}`; g.fillText("The Quantum Theory of the Electron.", 768, 110);
    g.font = `17px ${SERIF}`; g.fillText("By P. A. M. DIRAC, St. John's College, Cambridge.", 768, 148);
    g.font = `italic 13px ${SERIF}`; g.fillText("(Communicated by R. H. Fowler, F.R.S.—Received January 2, 1928.)", 768, 176);
    g.fillRect(708, 192, 120, 1.5);
    g.font = `15px ${SERIF}`; g.fillText("§ 1. Introduction.", 768, 222);
    g.textAlign = "left"; greek(g, 566, 252, 404, 19, 13, 21, 7);
    g.textAlign = "center"; g.font = `italic 13px ${SERIF}`; g.fillText("Proc. Roy. Soc. A, vol. 117 (1928)", 768, 680);
    g.textAlign = "left";
    gutter(g, w, 0);
    const gr = g.createLinearGradient(w / 2 - 60, 0, w / 2 + 60, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(60,45,30,0.28)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(w / 2 - 60, 0, 120, 720);
  });
  const texTelegram = () => ctex("telegram", 1600, 1100, (g, w, h) => {
    g.fillStyle = "#d9c9a3"; g.fillRect(0, 0, w, h);
    g.save(); g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.45; g.fillStyle = g.createPattern(grainCanvas(), "repeat"); g.fillRect(0, 0, w, h); g.restore();
    const red = "rgba(120,44,36,0.88)"; g.fillStyle = red; g.strokeStyle = red; g.textAlign = "center";
    g.font = `bold 64px ${SERIF}`; g.fillText("POST OFFICE TELEGRAM", w / 2, 120);
    g.lineWidth = 3; g.strokeRect(50, 160, w - 100, h - 220); g.lineWidth = 1.5; g.beginPath(); g.moveTo(50, 260); g.lineTo(w - 50, 260); g.stroke();
    g.font = `22px ${SERIF}`; g.textAlign = "left"; g.fillText("Office of Origin and Service Instructions", 70, 200); g.fillText("Handed in at", 70, 240); g.fillText("Received here at", w - 420, 240); g.fillText("TO", 70, 330);
    const tape = (s, x, y, fs) => { g.font = `bold ${fs}px 'Courier New', monospace`; const tw = g.measureText(s).width; g.fillStyle = "#f1ece0"; g.fillRect(x - 12, y - fs * 0.95, tw + 24, fs * 1.3); g.fillStyle = "rgba(30,28,30,0.9)"; g.fillText(s, x, y); };
    tape("STOCKHOLM", 300, 242, 30);
    tape("PROFESSOR P A M DIRAC ST JOHNS COLLEGE CAMBRIDGE", 140, 340, 34);
    tape("NOBEL PRIZE PHYSICS 1933", 220, 520, 58);
    tape("ROYAL SWEDISH ACADEMY OF SCIENCES", 220, 640, 34);
    const vg = g.createRadialGradient(w / 2, h / 2, h * 0.4, w / 2, h / 2, w * 0.7); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(90,60,25,0.3)"); g.fillStyle = vg; g.fillRect(0, 0, w, h);
  });

  // ---------------------------------------------------------------- desk objects
  function dipPen() {
    const g = new THREE.Group();
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.065, 1.9, 24), new THREE.MeshStandardMaterial({ color: 0x1e1410, roughness: 0.32, envMapIntensity: 0.7 })); holder.rotation.z = Math.PI / 2; g.add(holder);
    const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.066, 0.052, 0.26, 24), new THREE.MeshStandardMaterial({ color: 0xa88a5a, metalness: 1, roughness: 0.3 })); ferrule.rotation.z = Math.PI / 2; ferrule.position.x = 1.08; g.add(ferrule);
    const nibS = new THREE.Shape(); nibS.moveTo(0, -0.05); nibS.quadraticCurveTo(0.2, -0.055, 0.36, 0); nibS.quadraticCurveTo(0.2, 0.055, 0, 0.05); nibS.closePath();
    const nib = new THREE.Mesh(new THREE.ExtrudeGeometry(nibS, { depth: 0.006, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x4a4d52, metalness: 1, roughness: 0.22 })); nib.rotation.x = Math.PI / 2; nib.position.set(1.2, 0, 0); g.add(nib);
    shadowAll(g); return g;
  }
  function inkwell() {
    const g = new THREE.Group();
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xd9e4e0, roughness: 0.05, metalness: 0, transmission: 0.85, thickness: 0.4, transparent: true, opacity: 0.6, envMapIntensity: 1 });
    const body = new THREE.Mesh(roundBox(0.8, 0.55, 0.8, 0.08), glass); body.position.y = 0.275; g.add(body);
    const ink = new THREE.Mesh(roundBox(0.62, 0.34, 0.62, 0.06), new THREE.MeshStandardMaterial({ color: 0x0b0a10, roughness: 0.1 })); ink.position.y = 0.21; g.add(ink);
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.2, 0.14, 32), new THREE.MeshStandardMaterial({ color: 0x8a6d3b, metalness: 1, roughness: 0.4 })); neck.position.y = 0.6; g.add(neck);
    shadowAll(g); body.castShadow = false; return g;
  }
  function pencilObj() {
    const g = new THREE.Group();
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.6, 6), new THREE.MeshStandardMaterial({ color: 0x2f3b2c, roughness: 0.5 })); b.rotation.z = Math.PI / 2; g.add(b);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.04, 0.2, 16), new THREE.MeshStandardMaterial({ color: 0xd2b088, roughness: 0.75 })); tip.rotation.z = -Math.PI / 2; tip.position.x = 0.9; g.add(tip);
    const lead = new THREE.Mesh(new THREE.ConeGeometry(0.012, 0.06, 8), new THREE.MeshStandardMaterial({ color: 0x222226, roughness: 0.4, metalness: 0.4 })); lead.rotation.z = -Math.PI / 2; lead.position.x = 1.02; g.add(lead);
    shadowAll(g); return g;
  }
  // brass carriage clock, dial faces +z; set(minutesSinceMidnight)
  function carriageClock() {
    const g = new THREE.Group(), br = new THREE.MeshStandardMaterial({ color: 0xd2b47a, metalness: 1, roughness: 0.3, envMapIntensity: 2.2 }), brD = new THREE.MeshStandardMaterial({ color: 0x6e5630, metalness: 1, roughness: 0.4 });
    const box = (w, h, d, x, y, z, m) => { const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m || br); b.position.set(x, y, z); g.add(b); return b; };
    box(1.12, 0.1, 0.9, 0, 0.05, 0); box(1.04, 0.06, 0.82, 0, 0.13, 0);
    box(1.08, 0.08, 0.86, 0, 1.42, 0); box(1.0, 0.06, 0.78, 0, 1.49, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) { const c = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.22, 16), br); c.position.set(sx * 0.47, 0.77, sz * 0.36); g.add(c); }
    box(0.86, 1.18, 0.6, 0, 0.77, -0.02, brD);   // movement case inside the glass
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, transmission: 0.9, thickness: 0.05, transparent: true, opacity: 0.25, envMapIntensity: 1.2 });
    for (const sx of [-1, 1]) { const p = new THREE.Mesh(new THREE.PlaneGeometry(0.72, 1.18), glass); p.rotation.y = sx * Math.PI / 2; p.position.set(sx * 0.47, 0.77, 0); g.add(p); }
    const dialT = ctex("clockDial", 512, 512, (c, w) => {
      c.fillStyle = "#ece4d0"; c.fillRect(0, 0, w, w); const cx = w / 2; c.strokeStyle = "#2a2622"; c.fillStyle = "#2a2622";
      c.lineWidth = 3; c.beginPath(); c.arc(cx, cx, 236, 0, TAU); c.stroke();
      for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; c.lineWidth = i % 5 ? 2 : 4; c.beginPath(); c.moveTo(cx + Math.cos(a) * 226, cx + Math.sin(a) * 226); c.lineTo(cx + Math.cos(a) * (i % 5 ? 214 : 204), cx + Math.sin(a) * (i % 5 ? 214 : 204)); c.stroke(); }
      const RN = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"]; c.font = `42px ${SERIF}`; c.textAlign = "center"; c.textBaseline = "middle";
      RN.forEach((s, i) => { const a = i / 12 * TAU - Math.PI / 2; c.save(); c.translate(cx + Math.cos(a) * 166, cx + Math.sin(a) * 166); c.rotate(a + Math.PI / 2); c.fillText(s, 0, 0); c.restore(); });
    });
    const engr = ctex("clockEngr", 256, 256, (c, w) => { c.fillStyle = "#c9a96c"; c.fillRect(0, 0, w, w); c.strokeStyle = "rgba(90,60,25,0.22)"; c.lineWidth = 1.2; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(w / 2, w / 2, 20 + i * 14, 0, TAU); c.stroke(); } for (let i = 0; i < 24; i++) { const a = i / 24 * TAU; c.beginPath(); c.moveTo(w / 2 + Math.cos(a) * 30, w / 2 + Math.sin(a) * 30); c.quadraticCurveTo(w / 2 + Math.cos(a + 0.3) * 90, w / 2 + Math.sin(a + 0.3) * 90, w / 2 + Math.cos(a) * 125, w / 2 + Math.sin(a) * 125); c.stroke(); } });
    const plate = box(0.9, 1.22, 0.04, 0, 0.77, 0.31, new THREE.MeshStandardMaterial({ map: engr, bumpMap: engr, bumpScale: 0.4, metalness: 0.65, roughness: 0.42, envMapIntensity: 1.6 }));
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.36, 64), new THREE.MeshStandardMaterial({ map: dialT, roughness: 0.3, envMapIntensity: 0.5 })); dial.position.set(0, 0.82, 0.335); g.add(dial);
    const bez = new THREE.Mesh(new THREE.TorusGeometry(0.37, 0.025, 12, 64), br); bez.position.set(0, 0.82, 0.335); g.add(bez);
    const handM = new THREE.MeshStandardMaterial({ color: 0x14141a, metalness: 0.6, roughness: 0.3 });
    const hand = (len, wd, z) => { const piv = new THREE.Group(); piv.position.set(0, 0.82, z); const m = new THREE.Mesh(new THREE.BoxGeometry(wd, len, 0.006).translate(0, len / 2 - 0.04, 0), handM); piv.add(m); g.add(piv); return piv; };
    const hH = hand(0.2, 0.026, 0.345), hM = hand(0.3, 0.016, 0.352);
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.022, 16, 8), br); cap.position.set(0, 0.82, 0.356); g.add(cap);
    // carrying handle folded down on top
    const hd = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.024, 10, 40, Math.PI), br); hd.rotation.x = -Math.PI / 2 + 0.12; hd.position.set(0, 1.54, 0); g.add(hd);
    shadowAll(g); glass.depthWrite = false;
    return { g, set(min) { hM.rotation.z = -(min % 60) / 60 * TAU; hH.rotation.z = -((min / 60) % 12) / 12 * TAU; } };
  }
  // green-shaded brass banker's lamp; shade axis along x, opening down-forward (+z). Returns light-related handles.
  function bankersLamp() {
    const g = new THREE.Group(), br = new THREE.MeshStandardMaterial({ color: 0xbf9d5e, metalness: 1, roughness: 0.25, envMapIntensity: 1 });
    const V2 = (x, y) => new THREE.Vector2(x, y);
    const base = new THREE.Mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.82, 0), V2(0.86, 0.04), V2(0.82, 0.1), V2(0.6, 0.16), V2(0.5, 0.26), V2(0.2, 0.32), V2(0.12, 0.42), V2(0, 0.42)], 64), br); g.add(base);
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 2.7, 24), br); stem.position.y = 1.75; g.add(stem);
    const knuck = new THREE.Mesh(new THREE.SphereGeometry(0.1, 24, 12), br); knuck.position.y = 3.1; g.add(knuck);
    const yoke = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-1.15, 3.12, 0.12), V(-1.0, 3.25, 0.1), V(0, 3.2, 0), V(1.0, 3.25, 0.1), V(1.15, 3.12, 0.12)]), 40, 0.035, 8), br); g.add(yoke);
    const L = 2.3, R = 0.6, sh = new THREE.Group(); sh.position.set(0, 3.05, 0.25); sh.rotation.x = 0.18; g.add(sh);
    const cyl = (r, side, m) => { const geo = new THREE.CylinderGeometry(r, r, L, 64, 1, true, -0.35, Math.PI + 0.85); geo.rotateZ(Math.PI / 2); const me = new THREE.Mesh(geo, m); sh.add(me); return me; };
    const outerM = new THREE.MeshPhysicalMaterial({ color: 0x1c4a32, roughness: 0.12, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.08, emissive: 0x0f3a1f, emissiveIntensity: 0.55, envMapIntensity: 1.2 });
    const innerM = new THREE.MeshStandardMaterial({ color: 0xf2ead8, roughness: 0.6, emissive: 0xffe2b0, emissiveIntensity: 0.9, side: THREE.BackSide });
    const outer = cyl(R, 0, outerM), inner = cyl(R - 0.02, 1, innerM);
    for (const sx of [-1, 1]) { const ring = new THREE.Mesh(new THREE.TorusGeometry(R + 0.01, 0.03, 8, 48, Math.PI + 0.85), br); ring.rotation.y = Math.PI / 2; ring.rotation.x = 0; ring.rotation.order = "YXZ"; ring.rotateZ(-0.35); ring.position.x = sx * L / 2; sh.add(ring);
      const cap = new THREE.Mesh(new THREE.CircleGeometry(R, 48, -0.35 + Math.PI / 2, Math.PI + 0.85), br); cap.rotation.y = sx * Math.PI / 2; cap.position.x = sx * L / 2; sh.add(cap); }
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 16), new THREE.MeshBasicMaterial({ color: 0xffe7c0 })); bulb.position.set(0, -0.12, 0.05); sh.add(bulb);
    shadowAll(g); sh.traverse((m) => { if (m.isMesh) m.castShadow = false; });
    // a short pull chain
    const chain = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.7, 6), br); chain.position.set(0.45, 2.55, 0.55); g.add(chain);
    const bead = new THREE.Mesh(new THREE.SphereGeometry(0.04, 12, 8), br); bead.position.set(0.45, 2.2, 0.55); g.add(bead);
    return { g, shade: sh, outerM, innerM, bulb };
  }
  function crumple(seed, tex) {
    const geo = new THREE.IcosahedronGeometry(1, 22), p = geo.attributes.position, r = rnd(seed), sq = [0.85 + r() * 0.3, 0.75 + r() * 0.2, 0.85 + r() * 0.3];
    // crumpled paper = many flat facets with sharp ridges (intersection of random planes) plus a few folded-in creases
    const NP = 170, pn = [], pd = [], cr2 = [];
    for (let i = 0; i < NP; i++) { const u = r() * 2 - 1, th = r() * TAU, q = Math.sqrt(1 - u * u); pn.push(V(q * Math.cos(th), u, q * Math.sin(th))); pd.push(0.86 + r() * 0.14); }
    for (let i = 0; i < 0; i++) { const u = r() * 2 - 1, th = r() * TAU, q = Math.sqrt(1 - u * u); cr2.push([V(q * Math.cos(th), u, q * Math.sin(th)), 0.015 + r() * 0.025]); }
    for (let i = 0; i < p.count; i++) { const v = V(p.getX(i), p.getY(i), p.getZ(i)).normalize(); let k = 2;
      for (let j = 0; j < NP; j++) { const c = v.dot(pn[j]); if (c > 1e-3) k = Math.min(k, pd[j] / c); }
      const a2 = v.x * 1.7 + v.z * 1.0, b2 = v.y * 1.8 - v.z * 0.6, ridn = 1 - Math.abs(vn(a2 + 9, b2, seed + 7) * 2 - 1), ridn2 = 1 - Math.abs(vn(a2 * 2.3, b2 * 2.3 + 4, seed + 9) * 2 - 1);
      k *= 1 - 0.07 * Math.pow(ridn, 4) - 0.02 * Math.pow(ridn2, 4);
      p.setXYZ(i, v.x * k * sq[0], v.y * k * sq[1], v.z * k * sq[2]); }
    geo.computeVertexNormals();
    const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, flatShading: true, envMapIntensity: 0.1 })); m.castShadow = m.receiveShadow = true; return m;
  }

  // ---------------------------------------------------------------- the study (built once)
  const KP = V(0.4, 0, 0.6), KPR = -0.06;   // key page centre + yaw
  const PW = 2.1, PH = 2.97;
  // design px on a key page -> world point
  const onPage = (dx, dy, y) => V((dx / 1024 - 0.5) * PW, y || 0.02, (dy / 1400 - 0.5) * PH).applyAxisAngle(V(0, 1, 0), KPR).add(KP);
  let DESK = null;
  function buildDesk() {
    const S = stage("studio", { key: 1e-4, hemi: 0.2, rim: 0.0, floorY: -7.6, bg: 0x0b0a09 });
    S.userData.key.castShadow = false; S.fog = new THREE.Fog(0x0b0a09, 26, 60);
    S.traverse((m) => { if (m.isHemisphereLight) { m.color.set(0x8796b0); m.groundColor.set(0x1c140e); } });
    // desk
    const top = new THREE.Mesh(new THREE.BoxGeometry(17, 0.45, 8.2), wood("wOak", [74, 48, 30], 31, 0.42, [3, 1.5], 0.15)); top.position.set(0, -0.225, -0.2); top.receiveShadow = true; top.castShadow = true; S.add(top);
    const body = wood("wOakB", [52, 34, 22], 37, 0.6, [2, 1]);
    for (const sx of [-1, 1]) { const ped = new THREE.Mesh(new THREE.BoxGeometry(4.4, 7.1, 7.4), body); ped.position.set(sx * 5.8, -4.0, -0.4); ped.receiveShadow = true; S.add(ped); }
    // back wall: dark plaster, a chalkboard (left) and a tall window (right), both soft, far behind the focus plane
    const wallT = pixTex("plasterD", 512, 512, (x, y) => { const k = 0.85 + 0.15 * fbm(x / 60, y / 60, 5, 4) + 0.05 * (hash(x, y, 2) - 0.5); return [70 * k, 62 * k, 54 * k]; });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshStandardMaterial({ map: rep(wallT, 6, 3), roughness: 0.95 })); wall.position.set(0, 4, -11); wall.receiveShadow = true; S.add(wall);
    const chalkT = ctex("chalkBoard", 1024, 600, (g, w, h) => {
      g.fillStyle = "#1d2321"; g.fillRect(0, 0, w, h);
      g.save(); g.globalAlpha = 0.18; g.fillStyle = "#cfd6cf"; for (let i = 0; i < 18; i++) { g.beginPath(); g.ellipse(80 + i * 55, 300 + Math.sin(i) * 120, 140, 40, 0.2, 0, TAU); g.fill(); } g.restore();   // old erased chalk
      g.filter = "blur(4px)"; const c = "rgba(225,228,220,0.8)";
      hw(g, "E² = p²c² + m²c⁴", 70, 140, 64, 201, { col: [228, 230, 222], a: 0.8 });
      hw(g, "(α, p) c + βmc²", 110, 270, 54, 202, { col: [228, 230, 222], a: 0.7 });
      hw(g, "αβ + βα = 0", 600, 200, 54, 203, { col: [228, 230, 222], a: 0.7 });
      g.strokeStyle = c; g.lineWidth = 6; g.beginPath(); g.moveTo(560, 330); g.lineTo(980, 330); g.stroke();
      hw(g, "ψ → ψ'", 640, 420, 54, 204, { col: [228, 230, 222], a: 0.6 }); hw(g, "spin ½", 120, 450, 54, 205, { col: [228, 230, 222], a: 0.6 });
    });
    const board = new THREE.Mesh(new THREE.PlaneGeometry(10, 5.6), new THREE.MeshStandardMaterial({ map: chalkT, roughness: 0.9, emissive: 0xffffff, emissiveMap: chalkT, emissiveIntensity: 0.05 })); board.position.set(5, 4.2, -10.9); S.add(board);
    const frameM = wood("wFrame", [60, 40, 26], 41, 0.6);
    for (const [w2, h2, x, y] of [[10.5, 0.3, 5, 1.25], [10.5, 0.3, 5, 7.15], [0.3, 6.2, -0.1, 4.2], [0.3, 6.2, 10.1, 4.2]]) { const b = new THREE.Mesh(new THREE.BoxGeometry(w2, h2, 0.2), frameM); b.position.set(x, y, -10.85); S.add(b); }
    const winT = ctex("nightWin", 512, 1024, (c, w, h) => {
      c.fillStyle = "#000"; c.fillRect(0, 0, w, h);
      c.filter = "blur(6px)"; const x0 = 60, y0 = 70, pw = (w - 2 * x0 - 20) / 2, ph = (h - 2 * y0 - 3 * 18) / 4;
      for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) { const gr = c.createLinearGradient(0, y0, 0, h - y0); gr.addColorStop(0, "#36507a"); gr.addColorStop(0.6, "#22344f"); gr.addColorStop(1, "#141d2c"); c.fillStyle = gr; c.fillRect(x0 + i * (pw + 20), y0 + j * (ph + 18), pw, ph); }
      // college roofline with pinnacles, dark against the night sky
      c.filter = "blur(5px)"; c.fillStyle = "#0a0d12"; c.beginPath(); c.moveTo(0, h); c.lineTo(0, 760); for (let x = 0; x <= w; x += 64) { c.lineTo(x, 760); c.lineTo(x + 8, 700); c.lineTo(x + 16, 760); } c.lineTo(w, h); c.fill();
      c.fillRect(300, 560, 40, 300); c.beginPath(); c.moveTo(296, 560); c.lineTo(320, 470); c.lineTo(344, 560); c.fill();
      c.fillStyle = "rgba(255,214,150,0.55)"; c.fillRect(110, 820, 18, 26); c.fillRect(380, 850, 16, 22);   // two far lit windows
      const mg = c.createRadialGradient(380, 200, 0, 380, 200, 120); mg.addColorStop(0, "rgba(200,215,235,0.45)"); mg.addColorStop(1, "rgba(200,215,235,0)"); c.fillStyle = mg; c.fillRect(0, 0, w, h);
    });
    const win = new THREE.Mesh(new THREE.PlaneGeometry(5, 10), new THREE.MeshBasicMaterial({ map: winT, color: 0xb0b8c8 })); win.position.set(-7.5, 4.6, -10.95); S.add(win);
    // a shelf of books on the right wall-end, barely lit
    const shelf = new THREE.Group(); shelf.position.set(14, 1.5, -10.4); S.add(shelf);
    const r = rnd(9), cols = [0x3a2a22, 0x2c3330, 0x4a3524, 0x2a2730, 0x51402c, 0x302822, 0x3c2f2a];
    for (let row = 0; row < 3; row++) { let x = -3; const pl = new THREE.Mesh(new THREE.BoxGeometry(6.4, 0.12, 1.2), frameM); pl.position.set(0, row * 2.2 - 0.06, 0); shelf.add(pl); while (x < 3) { const bw = 0.18 + r() * 0.2, bh = 1.3 + r() * 0.6, b = new THREE.Mesh(new THREE.BoxGeometry(bw, bh, 0.9 + r() * 0.2), new THREE.MeshStandardMaterial({ color: cols[Math.floor(r() * cols.length)], roughness: 0.7 })); b.position.set(x + bw / 2, row * 2.2 + bh / 2, 0); b.rotation.z = r() < 0.06 ? 0.15 : 0; shelf.add(b); x += bw + 0.02; } }

    // the lamp (the only key light) + its weak unshadowed bounce, and cool moonlight from the window
    const lamp = bankersLamp(); lamp.g.position.set(-3.1, 0, -2.1); lamp.g.rotation.y = 0.32; S.add(lamp.g);
    const lampPos = V(-2.85, 2.72, -1.55);
    const key = spot(S, 0xffcf96, 22, lampPos, V(0.5, 0, 0.5), 0.62, 0.8, true); key.shadow.camera.far = 30;
    const fill = new THREE.PointLight(0xffc890, 1.6, 0, 2); fill.position.copy(lampPos).add(V(0, 0.3, 0)); S.add(fill);
    const moon = new THREE.DirectionalLight(0x98a6bc, 0.3); moon.position.set(-10, 10, -14); S.add(moon);
    const halo = glowSprite(0xffe2b0, 1.4, 0.08); halo.position.copy(lampPos).add(V(0, 0.25, 0)); S.add(halo);

    // props
    const P = {};
    P.key = sheet(texEq(), PW, PH, { seed: 7, curl: 0.03, nx: 40, nz: 56 }); P.key.position.copy(KP).add(V(0, 0.03, 0)); P.key.rotation.y = KPR; S.add(P.key);
    P.keyC = contact(PW, PH, 0.5, 0.08); P.keyC.position.copy(KP).add(V(0, 0.004, 0)); P.keyC.rotation.y = KPR; S.add(P.keyC);
    // spread papers (grouped so a mode can hide them)
    P.papers = new THREE.Group(); S.add(P.papers);
    [[-6.3, 1.9, 0.28, 0], [1.7, -1.75, -0.22, 1], [3.2, 1.0, 0.12, 2], [-1.0, -1.6, 0.5, 3], [-5.0, 0.6, -0.1, 4]].forEach(([x, z, ry, i]) => {
      const s = sheet(texMisc(i % 4), PW, PH, { seed: 11 + i, curl: 0.012, wave: 0.003 }); s.position.set(x, 0.006 + i * 0.002, z); s.rotation.y = ry; P.papers.add(s);
      const c = contact(PW, PH, 0.4, 0.08); c.position.set(x, 0.003, z); c.rotation.y = ry; P.papers.add(c);
    });
    const pile = new THREE.Group(); pile.position.set(-5.2, 0, -1.6); pile.rotation.y = 0.2; P.papers.add(pile);
    for (let i = 0; i < 9; i++) { const s = sheet(texMisc((i + 1) % 4), PW, PH, { seed: 30 + i, curl: 0.02, nx: 8, nz: 10 }); s.position.set((r() - 0.5) * 0.2, i * 0.025, (r() - 0.5) * 0.2); s.rotation.y = (r() - 0.5) * 0.2; pile.add(s); }
    P.ink = inkwell(); P.ink.position.set(2.2, 0, -1.2); S.add(P.ink);
    P.pen = dipPen(); P.pen.position.set(2.65, 0.065, -0.1); P.pen.rotation.y = -1.9; S.add(P.pen);
    P.pencil = pencilObj(); P.pencil.position.set(-1.9, 0.045, -0.3); P.pencil.rotation.y = 2.6; S.add(P.pencil);
    P.clock = carriageClock(); P.clock.g.position.set(4.6, 0, -1.9); P.clock.g.rotation.y = -0.7; S.add(P.clock.g); P.clock.g.add(at(contact(1.15, 0.92, 0.7, 0.12), 0, 0.003, 0));
    // strike-through for 'guess' (an ink stroke revealed left to right)
    const strikeT = ctex("strikeT", 1024, 64, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); stroke(g, wobLine(10, 34, w - 10, 28, 14, 3, 301), 9, 301, 1, [255, 255, 255]); }, true);
    const sw = (GUESS.x1 - GUESS.x0) / 1024 * PW, sMat = new THREE.MeshBasicMaterial({ color: 0x1a1d30, alphaMap: strikeT.clone(), transparent: true, opacity: 0.88, depthWrite: false });
    sMat.alphaMap.needsUpdate = true;
    P.strike = new THREE.Mesh(new THREE.PlaneGeometry(sw, 0.07).rotateX(-Math.PI / 2).translate(sw / 2, 0, 0), sMat);
    P.strike.position.copy(onPage(GUESS.x0, GUESS.y, 0.052)); P.strike.rotation.y = KPR; P.strike.renderOrder = 3; S.add(P.strike);
    // need: two open notebooks either side of a blank page
    const notebook = (tex, seed) => { const g2 = new THREE.Group(); const cover = new THREE.Mesh(new THREE.BoxGeometry(3.25, 0.05, 2.3), new THREE.MeshStandardMaterial({ color: 0x2a2620, roughness: 0.8 })); cover.position.y = 0.025; g2.add(cover); const pg = sheet(tex, 3.15, 2.18, { curl: 0, wave: 0.004, seed, nx: 60, nz: 20, lift: 0.05, gutter: 0.06 }); g2.add(pg); g2.add(at(contact(3.25, 2.3, 0.45, 0.08), 0, 0.003, 0)); shadowAll(cover); return g2; };
    P.qm = notebook(texQM(), 5); P.qm.position.set(-2.4, 0, 0.85); P.qm.rotation.y = 0.14; S.add(P.qm);
    P.rel = notebook(texRel(), 6); P.rel.position.set(3.2, 0, 0.7); P.rel.rotation.y = -0.12; S.add(P.rel);
    // tries: crumpled attempts
    P.balls = new THREE.Group(); S.add(P.balls);
    [[-1.6, 0.3, 0.42], [-2.5, 1.9, 0.36], [2.3, 0.9, 0.4], [-0.9, 2.6, 0.3], [1.5, 2.7, 0.34], [-3.2, -0.6, 0.38], [3.1, -0.2, 0.33]].forEach(([x, z, s], i) => { const b = crumple(400 + i, texMisc(i % 4)); b.scale.setScalar(s); b.position.set(x, s * 0.8, z); b.rotation.set(i, i * 2.1, i * 0.7); P.balls.add(b); });
    // published: the bound volume open at Dirac's paper
    P.journal = new THREE.Group(); P.journal.position.set(0.4, 0, 0.5); P.journal.rotation.y = -0.05; S.add(P.journal);
    { const clothT = pixTex("cloth", 256, 256, (x, y) => { const k = 0.85 + 0.1 * ((x + y) % 4 < 2 ? 1 : 0) + 0.1 * fbm(x / 30, y / 30, 9, 3); return [30 * k, 44 * k, 50 * k]; });
      const boards = new THREE.Mesh(new THREE.BoxGeometry(4.7, 0.08, 3.25), new THREE.MeshStandardMaterial({ map: clothT, roughness: 0.85 })); boards.position.y = 0.04; P.journal.add(boards);
      const edgeT = ctex("pageEdge", 32, 256, (c) => { for (let y = 0; y < 256; y++) { const k = hash(y, 7, 3); c.fillStyle = `rgb(${205 + k * 30 | 0},${192 + k * 28 | 0},${165 + k * 24 | 0})`; c.fillRect(0, y, 32, 1); } });
      for (const sx of [-1, 1]) { const blk = new THREE.Mesh(new THREE.BoxGeometry(2.24, 0.2, 3.08), new THREE.MeshStandardMaterial({ map: edgeT, roughness: 0.95 })); blk.position.set(sx * 1.14, 0.19, 0); P.journal.add(blk); }
      const pg = sheet(texJournal(), 4.5, 3.1, { curl: 0, wave: 0.003, seed: 3, nx: 80, nz: 20, lift: 0.3, gutter: 0.12 });
      { const p = pg.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / 2.25; p.setY(i, p.getY(i) - 0.035 * Math.pow(1 - Math.min(1, Math.abs(u) / 0.14), 2)); } pg.geometry.computeVertexNormals(); }
      P.journal.add(pg); P.journal.add(at(contact(4.7, 3.25, 0.55, 0.08), 0, 0.003, 0)); shadowAll(boards); }
    // refuse: the telegram
    P.tele = sheet(texTelegram(), 2.6, 1.79, { seed: 21, curl: 0.008, wave: 0.002 }); P.tele.position.set(-1.95, 0.008, 0.9); P.tele.rotation.y = 0.16; S.add(P.tele);
    P.teleC = contact(2.6, 1.79, 0.45, 0.08); P.teleC.position.set(-1.9, 0.006, 0.9); P.teleC.rotation.y = 0.16; S.add(P.teleC);
    return { S, key, fill, halo, lamp, P };
  }

  // per-mode set-up: page texture, visible props, camera keys [t, tx,ty,tz, dist, az, el, ox, oy], focus (world point fn) + blur
  const T = { eq: texEq, sea: texSea, guess: texGuess, try: texTry, blank: () => texBlank(0) };
  const PE = onPage(512, EQY - 20), PTOP = onPage(330, 230), PGAM = onPage(300, 505), PDT = onPage(260, 1075);
  const PTRY = onPage(515, 740), PHOLE = onPage(500, 630), PSEA = onPage(560, 905);
  const CLK = V(4.384, 0.82, -1.644), JT = V(1.5, 0.3, 0.45), TELE = V(-1.9, 0, 0.9), INKT = V(2.2, 0.6, -1.2);
  const BASE = ["papers", "ink", "pen", "pencil", "clock"];
  const MODE = {
    reveal: { page: "eq", show: BASE, blur: 1.2, K: [[0, PE.x, 0, PE.z - 0.3, 6.6, -12, 58, -300, 170], [6.82, PE.x, 0, PE.z - 0.2, 5.3, -6, 62, -370, 200]] },
    // low across the page: focus racks from the first line (far) to the big equation (near)
    strange: { page: "eq", show: BASE, blur: 9, lamp: 0.85, K: [[0, PE.x - 0.1, 0, PE.z - 0.5, 3.4, 14, 17], [6.26, PE.x + 0.15, 0, PE.z - 0.6, 3.0, 2, 19]],
      focus: (t) => PTOP.clone().lerp(PE, seg(t, 0.5, 2.0)) },
    symbols: { page: "eq", show: BASE, blur: 30, lamp: 0.6, K: [[0, PGAM.x, 0, PGAM.z, 1.35, -24, 30], [1.8, PGAM.x + 0.25, 0, PGAM.z + 0.25, 1.3, -18, 32], [4.86, PDT.x + 0.1, 0, PDT.z, 1.25, -10, 34]] },
    clock: { page: "eq", show: ["papers", "pen", "pencil", "clock"], blur: 3, focus: () => CLK,
      K: [[0, CLK.x, CLK.y, CLK.z, 2.5, -44, 6], [2.4, CLK.x, CLK.y, CLK.z, 2.75, -41, 7], [4.25, CLK.x, CLK.y - 0.05, CLK.z, 5.9, -38, 10, -730, -40], [4.65, CLK.x, CLK.y - 0.05, CLK.z, 5.88, -38.4, 10.1, -731, -40], [8.94, CLK.x, CLK.y - 0.05, CLK.z, 5.6, -44, 11, -740, -40]] },
    mind: { page: "eq", show: BASE, blur: 0.6, lamp: 1.25, K: [[0, 0.5, 1.2, -1.5, 15, 22, 14, -140, 190], [9.08, 0.5, 1.2, -1.5, 13.8, 12, 13, -160, 190]] },
    need: { page: "blank", show: ["qm", "rel", "ink", "clock"], blur: 2, lamp: 0.75,
      K: [[0, -2.4, 0, 0.85, 3.9, -10, 56], [4.6, -2.0, 0, 0.85, 3.7, -6, 58], [5.5, 0.4, 0, 0.6, 4.8, 0, 58], [6.4, 3.0, 0, 0.7, 3.9, 4, 58], [8.0, 3.3, 0, 0.7, 3.2, 8, 57], [10.26, 0.5, 0, 0.6, 8.8, 0, 60]] },
    tries: { page: "try", show: ["papers", "balls", "ink", "clock"], blur: 3, focus: () => PTRY,
      K: [[0, PTRY.x - 1.2, 0.2, PTRY.z + 0.8, 4.2, -38, 24], [2.8, PTRY.x, 0, PTRY.z, 3.0, -14, 52], [4.9, PTRY.x, 0, PTRY.z, 2.7, -8, 56]] },
    properly: { page: "blank", show: ["papers", "ink", "pen", "clock"], blur: 2, standPen: true, lamp: 0.85, focus: () => INKT,
      K: [[0, 1.2, 0.8, -0.2, 6.8, -22, 26], [2.28, 1.5, 0.85, -0.5, 6.0, -16, 25]] },
    published: { page: null, show: ["papers", "ink", "pen", "clock", "journal"], blur: 1.4, lamp: 0.85, focus: () => JT,
      K: [[0, 0.7, 0.3, 0.4, 9.2, -12, 58, -330, 190], [5.54, 0.8, 0.3, 0.4, 8.0, -6, 61, -350, 200]] },
    sea: { page: "sea", show: BASE, blur: 1.2, focus: () => PSEA, K: [[0, KP.x, 0, KP.z, 7.2, -8, 64, -540, 40], [6.94, KP.x, 0, KP.z, 6.7, -3, 67, -540, 40]] },
    guess: { page: "guess", show: ["papers", "ink", "pen", "pencil", "clock", "strike"], blur: 2.5, focus: () => PHOLE,
      K: [[0, PHOLE.x, 0, PHOLE.z, 3.5, -10, 56], [4.14, PHOLE.x, 0, PHOLE.z, 2.9, -4, 60]] },
    logic: { page: "eq", show: BASE, blur: 1, lamp: 1.25, K: [[0, -1.0, 0.6, -0.1, 4.6, -32, 34], [5.7, 0.2, 0, -0.6, 16.5, -12, 38]] },
    refuse: { page: "blank", show: ["papers", "ink", "pen", "clock", "tele"], blur: 2, penAt: [0.9, 0.08, 0.6, 2.3],
      K: [[0, TELE.x, 0, TELE.z, 3.6, -14, 58], [2.6, TELE.x + 0.5, 0, TELE.z, 4.4, -8, 58], [5.38, -0.75, 0, 0.8, 6.0, -2, 60]] },
    recap: { page: "eq", show: BASE, blur: 1.4, K: [[0, PE.x, 0, PE.z, 2.7, -6, 62], [10.12, KP.x, 0, KP.z - 0.2, 7.6, -14, 52]] },
  };
  const DEF = MODE.reveal;
  const ALL = ["papers", "ink", "pen", "pencil", "clock", "qm", "rel", "balls", "journal", "tele", "strike"];

  LABK.eqpaper = (o) => {
    if (!DESK) DESK = buildDesk();
    const D = DESK, P = D.P, C = new THREE.PerspectiveCamera(30, W / H, 0.05, 400), mode = o.mode, cfg = MODE[mode] || DEF, T0 = o.T0;
    const pageTex = cfg.page ? T[cfg.page]() : null, tgt = V();
    return (t) => {
      const ft = T0 + t;
      ALL.forEach((k) => { const v = cfg.show.indexOf(k) >= 0; if (P[k].g) P[k].g.visible = v; else P[k].visible = v; });
      P.key.visible = P.keyC.visible = !!pageTex; if (pageTex) P.key.material.map = pageTex;
      P.teleC.visible = P.tele.visible;
      // the pen: lying beside the inkwell, standing dipped in it ('properly') or across the unwritten reply ('refuse')
      if (cfg.standPen) { P.pen.rotation.set(0, 0.9, -0.9); P.pen.position.copy(INKT).add(V(0, -0.2, 0)).sub(V(1.45, 0, 0).applyEuler(P.pen.rotation)); }
      else if (cfg.penAt) { P.pen.rotation.set(0, cfg.penAt[3], 0); P.pen.position.set(cfg.penAt[0], cfg.penAt[1], cfg.penAt[2]); }
      else { P.pen.rotation.set(0, -1.9, 0); P.pen.position.set(2.65, 0.065, -0.1); }
      // strike-through: drawn left to right on "It didn't work"
      const sk = clamp((ft - EV.strike) / 0.45, 0, 1); P.strike.scale.x = Math.max(1e-3, sk); P.strike.material.alphaMap.repeat.x = Math.max(1e-3, sk); P.strike.visible = P.strike.visible && sk > 0;
      // lamp: steady; warmer + brighter for the recap; one soft dip for 'strange'
      let li = 1; if (mode === "strange") { const u = ft - EV.flicker; li = 1 - 0.45 * Math.exp(-Math.pow((u - 0.08) / 0.07, 2)) - 0.25 * Math.exp(-Math.pow((u - 0.32) / 0.06, 2)); }
      if (mode === "recap") li = 1.0; li *= cfg.lamp || 1;
      D.key.intensity = 48 * li; D.fill.intensity = 4 * li; D.lamp.innerM.emissiveIntensity = 0.9 * li; D.halo.material.opacity = 0.08 * li;
      D.key.color.set(mode === "recap" ? 0xffbf78 : 0xffcf96);
      P.clock.set(mode === "clock" ? 23 * 60 + 60 * seg(ft, EV.clockA + 0.3, EV.clockB - 0.2) : 25 * 60 + 10 + ft / 60);
      camKeys(C, cfg.K, t, tgt);
      setFocus(C, cfg.focus ? cfg.focus(t) : tgt, cfg.blur || 0);
      return [D.S, C];
    };
  };

  // ================================================================ STONE — Westminster Abbey, the nave floor near Newton's monument
  const SL = { w: 9, h: 5.5 };               // the slab (x, z), text faces +z
  const EQ_Z = 1.25;                          // equation row on the slab (world z)
  const slabTex = () => {
    if (TC.slab) return TC.slab;
    const w = 3072, h = Math.round(w * SL.h / SL.w), noise = pixTex("stoneN", 256, 256, (x, y) => { const k = 200 + 40 * (fbm(x / 22, y / 22, 13, 4) - 0.5) + 30 * (hash(x, y, 3) - 0.5); return [k, k, k]; });
    const lines = [["PAUL ADRIEN MAURICE DIRAC", 0.24, `118px 'Times New Roman', Georgia, serif`, 16], ["1902–1984", 0.37, `104px 'Times New Roman', Georgia, serif`, 14], [X3.EQ, 0.72, `italic 270px 'Times New Roman', Georgia, serif`, 6]];
    const mask = document.createElement("canvas"); mask.width = w; mask.height = h; const m = mask.getContext("2d");
    m.fillStyle = "#fff"; m.textAlign = "center"; m.textBaseline = "alphabetic";
    for (const [s, y, f, ls] of lines) { m.font = f; m.letterSpacing = ls + "px"; m.fillText(s, w / 2, y * h); }
    const blur = (px) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const g = c.getContext("2d"); g.filter = `blur(${px}px)`; g.drawImage(mask, 0, 0); return c; };
    const b1 = blur(2), b2 = blur(7);
    // colour: pale grey stone, carved letters darker (grime + shade)
    const col = ctex("slabCol", w, h, (g) => {
      g.fillStyle = "#c6c3bb"; g.fillRect(0, 0, w, h);
      g.save(); g.globalCompositeOperation = "multiply"; g.fillStyle = g.createPattern(noise.image, "repeat"); g.globalAlpha = 0.5; g.scale(3, 3); g.fillRect(0, 0, w, h); g.restore();
      const r = rnd(17); g.save(); g.globalCompositeOperation = "multiply";
      for (let i = 0; i < 30; i++) { const x = r() * w, y = r() * h, rr = 200 + r() * 600, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(150,140,125,${0.08 + r() * 0.1})`); gr.addColorStop(1, "rgba(150,140,125,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
      g.strokeStyle = "rgba(120,115,105,0.07)"; for (let i = 0; i < 6; i++) { g.lineWidth = 1 + r() * 2; g.beginPath(); let x = r() * w, y = r() * h; g.moveTo(x, y); for (let k = 0; k < 30; k++) { x += (r() - 0.3) * 90; y += (r() - 0.5) * 60; g.lineTo(x, y); } g.stroke(); }
      g.restore();
      const pg = g.createLinearGradient(0, h, 0, 0); pg.addColorStop(0, "rgba(255,255,250,0.10)"); pg.addColorStop(0.4, "rgba(255,255,250,0)"); g.fillStyle = pg; g.fillRect(0, 0, w, h);
      const tint = (src, color, alpha, dx, dy) => { const c = document.createElement("canvas"); c.width = w; c.height = h; const q = c.getContext("2d"); q.drawImage(src, 0, 0); q.globalCompositeOperation = "source-in"; q.fillStyle = color; q.fillRect(0, 0, w, h); g.globalAlpha = alpha; g.drawImage(c, dx || 0, dy || 0); g.globalAlpha = 1; };
      tint(b1, "#55524b", 0.5); tint(mask, "#3a3833", 0.3, 2, 3);
      const vg = g.createRadialGradient(w / 2, h / 2, h * 0.3, w / 2, h / 2, w * 0.6); vg.addColorStop(0, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(40,35,30,0.25)"); g.fillStyle = vg; g.fillRect(0, 0, w, h);
    });
    const bump = ctex("slabBump", w, h, (g) => { g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "multiply"; g.globalAlpha = 0.25; g.fillStyle = g.createPattern(noise.image, "repeat"); g.fillRect(0, 0, w, h);
      g.globalCompositeOperation = "difference"; g.globalAlpha = 0.55; g.drawImage(b2, 0, 0); g.globalAlpha = 0.55; g.drawImage(b1, 0, 0); }, true);
    return (TC.slab = { col, bump });
  };
  // the floor around: worn ledger stones (pale limestone, dark Purbeck marble), grout lines
  const FLOOR = 56, FPX = 4096;
  const floorTex = () => {
    if (TC.floor) return TC.floor;
    const k = FPX / FLOOR, noise = pixTex("stoneN2", 256, 256, (x, y) => { const v = 200 + 50 * (fbm(x / 18, y / 18, 23, 4) - 0.5) + 30 * (hash(x, y, 5) - 0.5); return [v, v, v]; });
    const r = rnd(29), stones = [];
    let z = -FLOOR / 2; const rowsZ = [];
    while (z < FLOOR / 2) { let hh = 3.5 + r() * 3; if (z < -SL.h / 2 && z + hh > -SL.h / 2) hh = -SL.h / 2 - z; if (Math.abs(z + SL.h / 2) < 1e-6) hh = SL.h; rowsZ.push([z, hh]); z += hh; }
    for (const [z0, hh] of rowsZ) {
      let x = -FLOOR / 2 - r() * 4; const slabRow = Math.abs(z0 + SL.h / 2) < 1e-6;
      while (x < FLOOR / 2) { let ww = 3 + r() * 6; if (slabRow && x < -SL.w / 2 && x + ww > -SL.w / 2) ww = -SL.w / 2 - x; if (slabRow && Math.abs(x + SL.w / 2) < 1e-6) { x += SL.w; continue; }
        stones.push([x, z0, ww, hh, r() < 0.22, r()]); x += ww; }
    }
    const col = ctex("floorCol", FPX, FPX, (g) => {
      g.fillStyle = "#1a1917"; g.fillRect(0, 0, FPX, FPX);
      for (const [x, z0, ww, hh, dark, s] of stones) {
        const X = (x + FLOOR / 2) * k, Y = (z0 + FLOOR / 2) * k, Wd = ww * k, Hd = hh * k, gap = 5;
        const base = dark ? [62 + s * 14, 58 + s * 12, 54 + s * 10] : [150 + s * 30, 144 + s * 26, 132 + s * 22];
        g.fillStyle = `rgb(${base.map((v) => v | 0).join(",")})`; g.fillRect(X + gap, Y + gap, Wd - 2 * gap, Hd - 2 * gap);
        g.save(); g.beginPath(); g.rect(X + gap, Y + gap, Wd - 2 * gap, Hd - 2 * gap); g.clip();
        g.globalCompositeOperation = "multiply"; g.globalAlpha = dark ? 0.35 : 0.55; g.fillStyle = g.createPattern(noise.image, "repeat"); g.translate(s * 256, s * 300); g.scale(2.4, 2.4); g.fillRect(-500, -500, FPX, FPX); g.setTransform(1, 0, 0, 1, 0, 0);
        const rr = rnd(Math.floor(s * 1e6) + 1);
        for (let i = 0; i < 5; i++) { const cx = X + rr() * Wd, cy = Y + rr() * Hd, ra = 60 + rr() * 220, gr = g.createRadialGradient(cx, cy, 0, cx, cy, ra); gr.addColorStop(0, `rgba(110,95,80,${0.1 + rr() * 0.15})`); gr.addColorStop(1, "rgba(110,95,80,0)"); g.fillStyle = gr; g.fillRect(cx - ra, cy - ra, ra * 2, ra * 2); }
        g.globalCompositeOperation = "source-over"; g.globalAlpha = 1;
        if (dark) { g.strokeStyle = "rgba(200,195,185,0.10)"; for (let i = 0; i < 4; i++) { g.lineWidth = 1 + rr() * 2; g.beginPath(); let px = X + rr() * Wd, py = Y + rr() * Hd; g.moveTo(px, py); for (let q = 0; q < 12; q++) { px += (rr() - 0.5) * 60; py += (rr() - 0.5) * 60; g.lineTo(px, py); } g.stroke(); } }
        else if (rr() < 0.35) { g.strokeStyle = "rgba(60,55,48,0.22)"; g.lineWidth = 3; g.strokeRect(X + Wd * 0.12, Y + Hd * 0.12, Wd * 0.76, Hd * 0.76); }   // a worn-away old inscription
        g.restore();
        g.strokeStyle = "rgba(0,0,0,0.35)"; g.lineWidth = 2; g.strokeRect(X + gap, Y + gap, Wd - 2 * gap, Hd - 2 * gap);
      }
    });
    const bump = ctex("floorBump", 1024, 1024, (g) => { const s = 1024 / FPX; g.fillStyle = "#000"; g.fillRect(0, 0, 1024, 1024); g.fillStyle = "#c8c8c8"; for (const [x, z0, ww, hh] of stones) g.fillRect((x + FLOOR / 2) * k * s + 2, (z0 + FLOOR / 2) * k * s + 2, ww * k * s - 4, hh * k * s - 4); g.globalCompositeOperation = "multiply"; g.fillStyle = g.createPattern(noise.image, "repeat"); g.fillRect(0, 0, 1024, 1024); }, true);
    return (TC.floor = { col, bump });
  };
  function shaftMat(op) {
    return new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      uniforms: { uOp: { value: op }, uCol: { value: new THREE.Color(0xc9d6ea) } },
      vertexShader: `varying vec3 vN; varying vec3 vV; varying float vY; void main(){ vY = uv.y; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uOp; uniform vec3 uCol; varying vec3 vN; varying vec3 vV; varying float vY;
        void main(){ float f = pow(abs(dot(normalize(vN), normalize(vV))), 2.5); float a = f * smoothstep(0.0, 0.25, vY) * smoothstep(1.0, 0.7, vY) * uOp; gl_FragColor = vec4(uCol * a, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }` });
  }
  let STONE = null;
  const WIN = V(-30, 62, -26), LAND = V(0.6, 0, 1.7);     // the high window and where its light lands
  function buildStone() {
    const S = stage("studio", { key: 1e-4, hemi: 0.11, rim: 0, floorY: -60, bg: 0x08090b });
    S.userData.key.castShadow = false; S.fog = new THREE.Fog(0x08090b, 30, 110);
    S.traverse((m) => { if (m.isHemisphereLight) { m.color.set(0x8a9ab4); m.groundColor.set(0x1a1816); } });
    const F = floorTex(), SLT = slabTex();
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(FLOOR, FLOOR).rotateX(-Math.PI / 2), focusMat(new THREE.MeshStandardMaterial({ map: F.col, bumpMap: F.bump, bumpScale: 1.2, roughness: 0.62, metalness: 0, envMapIntensity: 0.1 })));
    floor.receiveShadow = true; S.add(floor);
    const slab = new THREE.Mesh(new THREE.PlaneGeometry(SL.w, SL.h).rotateX(-Math.PI / 2), focusMat(new THREE.MeshStandardMaterial({ map: SLT.col, bumpMap: SLT.bump, bumpScale: 1.6, roughness: 0.5, metalness: 0, envMapIntensity: 0.3 })));
    slab.position.y = 0.004; slab.receiveShadow = true; S.add(slab);
    // brass fillets around two neighbouring ledgers
    const brass = new THREE.MeshStandardMaterial({ color: 0xa88a52, metalness: 1, roughness: 0.38, envMapIntensity: 0.8 });
    for (const [cx, cz, w2, h2] of [[-9.6, -0.2, 5.2, 4.0], [10.2, 4.6, 5.6, 3.4]]) for (const [x, z, a, b] of [[cx, cz - h2 / 2, w2, 0.07], [cx, cz + h2 / 2, w2, 0.07], [cx - w2 / 2, cz, 0.07, h2], [cx + w2 / 2, cz, 0.07, h2]]) { const m = new THREE.Mesh(new THREE.BoxGeometry(a, 0.012, b), brass); m.position.set(x, 0.004, z); m.receiveShadow = true; S.add(m); }
    // clustered gothic piers, far and dim
    const pierM = new THREE.MeshStandardMaterial({ color: 0x4a4743, roughness: 0.9 });
    for (const [x, z] of [[-17, -20], [17, -20], [-17, 6], [17, 6], [-17, 30], [17, 30]]) { const g = new THREE.Group(); g.position.set(x, 0, z); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, c = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 90, 20), pierM); c.position.set(Math.cos(a) * 1.1, 45, Math.sin(a) * 1.1); g.add(c); } const core = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 90, 24), pierM); core.position.y = 45; g.add(core); const plinth = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.5, 1.6, 8), pierM); plinth.position.y = 0.8; g.add(plinth); shadowAll(g); S.add(g); }
    // the window light: one cool spot through three lancets (gobo), shafts in the air, dust
    const gob = ctex("lancetGobo", 512, 512, (c, w, h) => { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); c.filter = "blur(5px)"; c.fillStyle = "#fff"; for (let i = 0; i < 3; i++) { const x = 120 + i * 100, wd = 70; c.beginPath(); c.moveTo(x, 440); c.lineTo(x, 170); c.quadraticCurveTo(x, 90, x + wd / 2, 60); c.quadraticCurveTo(x + wd, 90, x + wd, 170); c.lineTo(x + wd, 440); c.closePath(); c.fill(); } }, true);
    const sun = spot(S, 0xdbe5f5, 2600, WIN, LAND, 0.08, 0.35, true); sun.map = gob; sun.shadow.camera.far = 150; sun.shadow.camera.near = 40;
    const rake = spot(S, 0xd8e2f2, 0, V(-11, 1.1, -2.5), V(1.5, 0, EQ_Z + 0.3), 0.2, 0.6, true); rake.shadow.camera.near = 2; rake.shadow.camera.far = 30;
    const shafts = new THREE.Group(); S.add(shafts);
    const dir = LAND.clone().sub(WIN), len = dir.length(); dir.normalize();
    const q = new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), dir.clone().negate());
    const sMats = [];
    for (let i = 0; i < 3; i++) { const m = shaftMat(0.12); sMats.push(m); const me = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.9, len, 24, 1, true), m); me.quaternion.copy(q); me.position.copy(WIN).add(LAND).multiplyScalar(0.5).add(V((i - 1) * 1.7, 0, (i - 1) * 0.6)); shafts.add(me); }
    const DN = 700, dg = new THREE.BufferGeometry(), dp = new Float32Array(DN * 3), dr = rnd(31), base = [];
    for (let i = 0; i < DN; i++) { const u = dr(), p = WIN.clone().lerp(LAND, 0.3 + 0.5 * u); base.push([p.x + (dr() - 0.5) * 6, p.y + (dr() - 0.5) * 2, p.z + (dr() - 0.5) * 3, dr() * 10]); }
    dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xdfe7f5, size: 0.035, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(dust);
    return { S, sun, rake, sMats, dust, dg, dp, base, DN };
  }
  const SLABK = {
    slab: { K: [[0, -12, 24, -10, 30, 62, -12], [2.8, 0, 0, -1.0, 23, 8, 48, 0, -300], [3.6, 0, 0, -0.95, 22.6, 7.3, 48.3, 0, -301], [9.06, 0, 0, -0.6, 21.5, 2, 50, 0, -300]], blur: 1.2, focus: () => V(0, 0, 0) },
    close: { K: [[0, 0.2, 0, EQ_Z, 7.0, 14, 30, -230, 170], [10.96, 0.4, 0, EQ_Z, 5.6, 8, 28, -250, 180]], blur: 3, focus: () => V(0.3, 0, EQ_Z) },
  };
  LABK.stone = (o) => {
    if (!STONE) STONE = buildStone();
    const D = STONE, C = new THREE.PerspectiveCamera(30, W / H, 0.05, 400), cfg = SLABK[o.mode] || SLABK.slab, close = o.mode === "close", tgt = V();
    return (t) => {
      const ft = o.T0 + t;
      for (let i = 0; i < D.DN; i++) { const b = D.base[i], ph = b[3] + ft * 0.06; D.dp[i * 3] = b[0] + 0.3 * Math.sin(ph * 1.7); D.dp[i * 3 + 1] = b[1] + 0.25 * Math.sin(ph * 0.8); D.dp[i * 3 + 2] = b[2] + 0.25 * Math.cos(ph * 1.1); }
      D.dg.attributes.position.needsUpdate = true;
      D.rake.intensity = close ? 420 : 0;
      D.sun.intensity = close ? 0 : 2600;
      D.sMats.forEach((m) => { m.uniforms.uOp.value = close ? 0.0 : 0.045; });
      camKeys(C, cfg.K, t, tgt);
      setFocus(C, cfg.focus ? cfg.focus(t) : tgt, cfg.blur || 0);
      return [D.S, C];
    };
  };
})();
