/* k_math.js — group B (The Dirac Equation): triangle, matrix, roots.
   One world: a scholar's dark walnut desk with a dark slate slab, one warm lamp (spot, real shadows), glazed ceramic tiles,
   polished brass / steel rods, a warm glass rod, slate tablets with brass-inlaid serif numbers, brass plates, cloth books.
   Pure functions of t. Every timed event is read from EV (film seconds) so the sound pass can be built from it. */
(function () {
  const { THREE, seg, smooth, lerp, clamp, rnd, stage, W, H } = L3;
  const V3 = THREE.Vector3, V = (x, y, z) => new V3(x, y, z), PI = Math.PI;
  const EV = {
    tri: { slide: 249.0, corner: 250.9, brass: 253.7, steel: 259.7, glass: 263.5, engrave: 267.4 },
    sq: { dropA: 269.0, dropB: 269.5, move: 271.6, moveEnd: 276.6 },
    prob: { sign: 286.2, signLock: 287.5 },
    first: { lift: 295.3, rod: 296.6, rodLock: 298.0, funnel: 299.2, jam: 302.3, back: 303.5, settle: 305.2 },
    root: { merge: 307.2, mergeEnd: 310.0, rod5: 310.2, rod34: 311.0, rod34End: 312.1 },
    rrec: { split: 989.3, splitEnd: 991.6 },
    bold: { flip: 320.0, flipStep: 0.55 },
    order: { swap: 331.5, swapEnd: 334.2 },
    book: { s1: 343.0, s1e: 344.0, s2: 344.15, s2e: 345.15 },
    ab: { p1: 352.2, p2: 353.4, rake: 354.4 },
    fit: { lock0: 357.6, lockStep: 0.5, sign: 360.0, signLock: 361.6 },
    four: { row0: 364.6, rowStep: 0.8 },
    parts: { split: 373.1, splitEnd: 375.6 },
    parts2: { up: 438.6, down: 439.2 },
    parts3: { sink: 470.2, sinkEnd: 473.4 },
    pm: { mirror: 449.5, plaque: 452.3 },
    ball: { drop: 460.0, fall: 2.3, ghost: 463.3, ghostEnd: 465.9 },
    rec: { push: 993.2, pushEnd: 995.8 },
  };

  // ------------------------------------------------------------------ camera
  function cr(K, t) {
    const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    let i = 0; while (t >= K[i + 1][0]) i++;
    const a = K[Math.max(i - 1, 0)], b = K[i], c = K[i + 1], d = K[Math.min(i + 2, n - 1)], h = c[0] - b[0], u = (t - b[0]) / h;
    const m1 = i === 0 ? 0 : (c[1] - a[1]) / (c[0] - a[0]) * h, m2 = i + 2 >= n ? 0 : (d[1] - b[1]) / (d[0] - b[0]) * h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * b[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * c[1] + (u3 - u2) * m2;
  }
  // keys: [[ft, tx, ty, tz, dist, az, el, oy], ...]; oy = lens shift as a fraction of frame height (+ moves the subject UP)
  function camKeys(C, K, t) {
    const g = (j) => cr(K.map((k) => [k[0], k[j] || 0]), t);
    const az = g(5) * PI / 180, el = g(6) * PI / 180, d = g(4), tx = g(1), ty = g(2), tz = g(3);
    C.position.set(tx + d * Math.sin(az) * Math.cos(el), ty + d * Math.sin(el), tz + d * Math.cos(az) * Math.cos(el)); C.lookAt(tx, ty, tz);
    const oy = g(7); if (oy) C.setViewOffset(W, H, 0, oy * H, W, H); else C.clearViewOffset();
    C.near = 0.05; C.far = 200; C.updateProjectionMatrix();
  }
  const mkCam = (fov) => new THREE.PerspectiveCamera(fov || 30, W / H, 0.05, 200);

  // ------------------------------------------------------------------ textures (cached for all 21 builders)
  const TC = window.__kmTC || (window.__kmTC = {});
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function vn(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s, o) { let f = 0, a = 0.5; for (let i = 0; i < (o || 4); i++) { f += a * vn(x, y, s + i * 17); x *= 2; y *= 2; a *= 0.5; } return f; }
  function ctex(key, w, h, fn, lin) {
    if (key && TC[key]) return TC[key];
    const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = lin ? THREE.NoColorSpace : THREE.SRGBColorSpace; t.anisotropy = 8;
    if (key) TC[key] = t; return t;
  }
  function pixTex(key, w, h, fn, lin) {
    return ctex(key, w, h, (g) => {
      const im = g.createImageData(w, h), D = im.data;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn(x, y), i = (y * w + x) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = 255; }
      g.putImageData(im, 0, 0);
    }, lin);
  }
  const wrap = (t, rx, ry) => { const c = t.clone(); c.wrapS = c.wrapT = THREE.RepeatWrapping; c.repeat.set(rx, ry); c.needsUpdate = true; return c; };
  // dark Welsh-style slate: blue-grey, cleft mottling, fine grain, faint chalk-worn scratches
  const slateTex = () => ctex("slate", 1024, 1024, (g, w, h) => {
    const im = g.createImageData(w, h), D = im.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const n = fbm(x / 110, y / 110, 3, 4), cleft = fbm(x / 700, y / 22, 9, 3), gr = hash(x, y, 5);
      const k = 0.9 + 0.07 * (n - 0.5) + 0.07 * (cleft - 0.5) + 0.04 * (gr - 0.5), i = (y * w + x) * 4;
      D[i] = 50 * k; D[i + 1] = 54 * k; D[i + 2] = 59 * k; D[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    const r = rnd(77); g.lineCap = "round";
    for (let i = 0; i < 160; i++) { const x = r() * w, y = r() * h, a = r() * PI, l = 20 + r() * 140; g.strokeStyle = `rgba(150,158,166,${0.03 + r() * 0.05})`; g.lineWidth = 0.6 + r(); g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke(); }
  });
  const slateRough = () => pixTex("slateR", 512, 512, (x, y) => { const k = 190 + 30 * (fbm(x / 60, y / 60, 21, 3) - 0.5) + 10 * (hash(x, y, 4) - 0.5); return [k, k, k]; }, true);
  const walnutTex = () => pixTex("walnut", 1024, 512, (x, y) => {
    const n = fbm(x / 420, y / 40, 31, 4), ring = 0.5 + 0.5 * Math.sin((y / 512 * 60 + n * 3.2) * PI), fine = vn(x / 3, y / 0.9, 40), streak = fbm(x / 900, y / 6, 36, 3);
    const k = 0.8 + 0.1 * Math.pow(ring, 3) + 0.06 * fine + 0.14 * (streak - 0.5) - 0.08 * fbm(x / 300, y / 200, 34, 2);
    return [78 * k, 50 * k, 33 * k];
  });
  const panelTex = () => pixTex("panel", 512, 512, (x, y) => {
    const n = fbm(x / 260, y / 26, 51, 4), gx = x % 256, edge = gx < 6 || gx > 250 ? 0.6 : 1, rail = (y % 256) < 8 ? 0.7 : 1;
    const k = (0.82 + 0.16 * (n - 0.5)) * edge * rail; return [46 * k, 31 * k, 22 * k];
  });
  // book cloth (weave) and page edges
  const clothTex = (key, rgb) => pixTex(key, 512, 512, (x, y) => {
    const wv = ((x % 4 < 2) ^ (y % 4 < 2)) ? 1.04 : 0.96, n = fbm(x / 90, y / 90, 61, 3), k = (0.86 + 0.22 * (n - 0.5)) * wv * (0.97 + 0.06 * hash(x, y, 2));
    return [rgb[0] * k, rgb[1] * k, rgb[2] * k];
  });
  const pageTex = () => ctex("pages", 512, 128, (g, w, h) => {
    g.fillStyle = "#d9cdb1"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y++) { g.fillStyle = `rgba(90,70,45,${0.05 + 0.08 * hash(y, 1, 3)})`; g.fillRect(0, y, w, 1); }
  });
  // glyph masks (white on black): serif digits; "^" marks a superscript ("γ^0"), "_" a subscript
  function glyph(text, blur, px) {
    px = px || 150; const key = "g|" + text + "|" + (blur || 0) + "|" + px;
    if (TC[key]) return TC[key];
    const c0 = document.createElement("canvas").getContext("2d");
    const font = (s, it) => `${it ? "italic " : ""}500 ${s}px Georgia, "Times New Roman", serif`;
    const parts = []; let i = 0;
    while (i < text.length) { const ch = text[i]; if (ch === "^" || ch === "_") { parts.push([text[i + 1], ch]); i += 2; } else { parts.push([ch, ""]); i++; } }
    let wsum = 0; for (const p of parts) { c0.font = font(p[1] ? px * 0.6 : px, /[a-zγψσ]/.test(p[0])); p.w = c0.measureText(p[0]).width; wsum += p.w; }
    const pad = Math.round(px * 0.3 + (blur || 0) * 3), w = Math.ceil(wsum + pad * 2), h = Math.round(px * 1.3 + pad);
    const t = ctex(null, w, h, (g) => {
      g.fillStyle = "#000"; g.fillRect(0, 0, w, h); if (blur) g.filter = `blur(${blur}px)`;
      g.fillStyle = "#fff"; g.textBaseline = "alphabetic"; let x = pad;
      for (const p of parts) { g.font = font(p[1] ? px * 0.6 : px, /[a-zγψσ]/.test(p[0])); g.fillText(p[0], x, h / 2 + px * 0.36 + (p[1] === "^" ? -px * 0.42 : p[1] === "_" ? px * 0.12 : 0)); x += p.w; }
    }, true);
    return (TC[key] = { t, a: w / h });
  }
  // matrix bracket mask: tall thin "[" or "]"
  const bracketTex = () => ctex("bracket", 64, 512, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff"; g.fillRect(14, 10, 9, h - 20); g.fillRect(14, 10, 40, 8); g.fillRect(14, h - 18, 40, 8); }, true);
  // engraved square outline + cell grid (for the 'Pythagoras' squares on the slate)
  const gridTex = (n) => ctex("grid" + n, 512, 512, (g, w, h) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 7; g.strokeRect(6, 6, w - 12, h - 12);
    g.lineWidth = 2.5; g.globalAlpha = 0.55; for (let k = 1; k < n; k++) { const p = 6 + (w - 12) * k / n; g.beginPath(); g.moveTo(p, 6); g.lineTo(p, h - 6); g.moveTo(6, p); g.lineTo(w - 6, p); g.stroke(); }
  }, true);
  const streakTex = () => ctex("streak", 256, 64, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); const v = g.createLinearGradient(0, 0, 0, h); v.addColorStop(0, "rgba(0,0,0,1)"); v.addColorStop(0.5, "rgba(0,0,0,0)"); v.addColorStop(1, "rgba(0,0,0,1)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = v; g.fillRect(0, 0, w, h); });

  // ------------------------------------------------------------------ gamma matrices (Dirac representation), complex [re, im]
  const Cx = (re, im) => [re, im || 0], Z = Cx(0), O = Cx(1), N1 = Cx(-1), I_ = Cx(0, 1), NI = Cx(0, -1);
  const cmul = (a, b) => [a[0] * b[0] - a[1] * b[1], a[0] * b[1] + a[1] * b[0]], cadd = (a, b) => [a[0] + b[0], a[1] + b[1]];
  const mmul = (A, B) => A.map((r, i) => B[0].map((_, j) => r.reduce((s, _, k) => cadd(s, cmul(A[i][k], B[k][j])), Z)));
  const G = [
    [[O, Z, Z, Z], [Z, O, Z, Z], [Z, Z, N1, Z], [Z, Z, Z, N1]],          // γ⁰ = diag(1, 1, −1, −1)
    [[Z, Z, Z, O], [Z, Z, O, Z], [Z, N1, Z, Z], [N1, Z, Z, Z]],          // γ¹ = [[0, σ1], [−σ1, 0]]
    [[Z, Z, Z, NI], [Z, Z, I_, Z], [Z, I_, Z, Z], [NI, Z, Z, Z]],        // γ² = [[0, σ2], [−σ2, 0]], σ2 = [[0, −i], [i, 0]]
    [[Z, Z, O, Z], [Z, Z, Z, N1], [N1, Z, Z, Z], [Z, O, Z, Z]],          // γ³ = [[0, σ3], [−σ3, 0]]
  ];
  const fmt = (c) => { const r = Math.round(c[0]), m = Math.round(c[1]); if (m === 0) return r < 0 ? "−" + -r : "" + r; if (r === 0) return m === 1 ? "i" : m === -1 ? "−i" : m + "i"; return r + (m > 0 ? "+" : "−") + Math.abs(m) + "i"; };
  (() => { // self-check: {γμ, γν} = 2 ημν I
    const eta = [1, -1, -1, -1];
    for (let m = 0; m < 4; m++) for (let n = 0; n < 4; n++) {
      const a = mmul(G[m], G[n]), b = mmul(G[n], G[m]);
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const s = cadd(a[i][j], b[i][j]), want = m === n && i === j ? 2 * eta[m] : 0; if (Math.abs(s[0] - want) > 1e-9 || Math.abs(s[1]) > 1e-9) console.error("k_math gamma check failed", m, n, i, j); }
    }
  })();
  const AB = mmul(G[0], G[1]), BA = mmul(G[1], G[0]);   // computed products: γ⁰γ¹ and γ¹γ⁰ = −γ⁰γ¹

  // ------------------------------------------------------------------ geometry + materials
  function roundBox(w, h, d, r) {
    const s = new THREE.Shape(), x = -w / 2 + r, y = -h / 2 + r, ww = w - 2 * r, hh = h - 2 * r;
    s.moveTo(x, y - r); s.lineTo(x + ww, y - r); s.quadraticCurveTo(x + ww + r, y - r, x + ww + r, y); s.lineTo(x + ww + r, y + hh); s.quadraticCurveTo(x + ww + r, y + hh + r, x + ww, y + hh + r);
    s.lineTo(x, y + hh + r); s.quadraticCurveTo(x - r, y + hh + r, x - r, y + hh); s.lineTo(x - r, y); s.quadraticCurveTo(x - r, y - r, x, y - r);
    const g = new THREE.ExtrudeGeometry(s, { depth: d - 2 * r * 0.6, bevelEnabled: true, bevelThickness: r * 0.6, bevelSize: r * 0.5, bevelSegments: 3, curveSegments: 5 });
    g.translate(0, 0, -(d - 2 * r * 0.6) / 2); return g;
  }
  // flat slab: rounded in plan (x/z), bevelled top edge; height h, top at y = h/2
  function slabGeo(w, h, d, r) { const g = roundBox(w, d, h, Math.min(r, h * 0.4)); g.rotateX(-PI / 2); return g; }
  const TS = 0.5, TH = 0.07;                             // tile pitch and tile thickness
  const GEO = {};
  const geo = (k, f) => GEO[k] || (GEO[k] = f());
  const tileGeo = () => geo("tile", () => slabGeo(TS - 0.03, TH, TS - 0.03, 0.022));
  const MAT = {};
  const mat = (k, f) => MAT[k] || (MAT[k] = f());
  const brassM = () => mat("brass", () => new THREE.MeshStandardMaterial({ color: 0xc9a865, metalness: 1, roughness: 0.24 }));
  const brassDull = () => mat("brassD", () => new THREE.MeshStandardMaterial({ color: 0xb59858, metalness: 1, roughness: 0.42 }));
  const steelM = () => mat("steel", () => new THREE.MeshStandardMaterial({ color: 0xc2c6cc, metalness: 1, roughness: 0.2 }));
  const slateM = () => mat("slate", () => new THREE.MeshStandardMaterial({ map: wrap(slateTex(), 3, 3), roughnessMap: wrap(slateRough(), 5, 5),  roughness: 0.78, metalness: 0, envMapIntensity: 0.2 }));
  const slateSmall = () => mat("slateS", () => new THREE.MeshStandardMaterial({ map: slateTex(), roughnessMap: slateRough(), roughness: 0.85, metalness: 0, envMapIntensity: 0.45 }));
  const walnutM = () => mat("walnut", () => new THREE.MeshStandardMaterial({ map: wrap(walnutTex(), 3, 2), bumpMap: wrap(walnutTex(), 3, 2), bumpScale: 0.5, roughness: 0.55, metalness: 0, envMapIntensity: 0.22 }));
  // glazed ceramic: cream (the 9 / mc² tiles), muted blue-grey celadon (the 16 / pc tiles), smoky dark (the mirrored twin)
  const GLAZE = { cream: [0.74, 0.68, 0.56], blue: [0.22, 0.31, 0.37], smoke: [0.13, 0.135, 0.15], bone: [0.66, 0.62, 0.55] };
  const glazeTex = () => { const t = ctex("glaze", 256, 256, (g, w, h) => {
      g.fillStyle = "#fff"; g.fillRect(0, 0, w, h); const r = rnd(5);
      for (let k = 0; k < 900; k++) { g.fillStyle = `rgba(70,60,50,${0.05 + r() * 0.12})`; const s2 = 0.6 + r() * 1.4; g.fillRect(r() * w, r() * h, s2, s2); }
      g.strokeStyle = "rgba(60,50,40,0.10)"; g.lineWidth = 0.7; for (let k = 0; k < 40; k++) { let x = r() * w, y = r() * h; g.beginPath(); g.moveTo(x, y); for (let j = 0; j < 5; j++) { x += (r() - 0.5) * 40; y += (r() - 0.5) * 40; g.lineTo(x, y); } g.stroke(); }
    }); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2.1, 2.1); return t; };
  function glaze(kind, i) {
    return mat("gl" + kind + (i % 5), () => {
      const r = rnd(900 + i % 5 + kind.length * 13), c = GLAZE[kind], v = 0.94 + r() * 0.1;
      return new THREE.MeshPhysicalMaterial({ color: new THREE.Color(c[0] * v, c[1] * v, c[2] * (v + (r() - 0.5) * 0.03)), map: glazeTex(), roughness: 0.38, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.14, envMapIntensity: 0.45 });
    });
  }
  function tile(kind, i) { const m = new THREE.Mesh(tileGeo(), glaze(kind, i)); m.castShadow = m.receiveShadow = true; return m; }
  // decal (engraving / inlay) lying flat, centred at its local origin; style: "brass" inlay, "ink" dark fill, "chalk" pale engraving, "carve" dark carved in tile
  const DSTYLE = {
    brass: () => ({ color: 0xd8b56e, metalness: 1, roughness: 0.28 }),
    ink: () => ({ color: 0x1c1712, metalness: 0.2, roughness: 0.7 }),
    chalk: () => ({ color: 0x7d858c, metalness: 0, roughness: 0.9 }),
    carve: () => ({ color: 0x4a3a2a, metalness: 0, roughness: 0.8 }),
  };
  function decalMat(style, mask, op) {
    return new THREE.MeshStandardMaterial(Object.assign(DSTYLE[style](), { alphaMap: mask, transparent: true, opacity: op === undefined ? 1 : op, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4 }));
  }
  const decalCache = {};
  function decal(text, hgt, style, blur) {
    const gl = glyph(text, blur), k = style + "|" + text + "|" + (blur || 0);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(hgt * gl.a, hgt), decalCache[k] || (decalCache[k] = decalMat(style, gl.t)));
    m.rotation.x = -PI / 2; m.receiveShadow = true; return m;
  }
  // brass square-root sign (stroke outline extruded), lying flat around the region x in [a,b], far edge at z = zf, near edge at z = zn
  function strokeShape(pts, ws) {
    const L = [], R = [], n = pts.length;
    for (let i = 0; i < n; i++) {
      const p = pts[i], a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      const d0 = new THREE.Vector2().subVectors(p, a), d1 = new THREE.Vector2().subVectors(b, p);
      if (i === 0) d0.copy(d1); if (i === n - 1) d1.copy(d0); d0.normalize(); d1.normalize();
      const n0 = new THREE.Vector2(-d0.y, d0.x), nm = new THREE.Vector2(-(d0.y + d1.y), d0.x + d1.x).normalize(), m = Math.min(3, 1 / Math.max(0.2, nm.dot(n0)));
      L.push(p.clone().addScaledVector(nm, ws[i] / 2 * m)); R.push(p.clone().addScaledVector(nm, -ws[i] / 2 * m));
    }
    const s = new THREE.Shape(); s.moveTo(L[0].x, L[0].y); for (let i = 1; i < n; i++) s.lineTo(L[i].x, L[i].y); for (let i = n - 1; i >= 0; i--) s.lineTo(R[i].x, R[i].y); s.closePath(); return s;
  }
  function rootSign(a, b, zn, zf, thick) {
    const g0 = 0.16, hgt = (zn - zf) + 2 * g0, P2 = (x, y) => new THREE.Vector2(x, y);
    const BV = P2(a - g0 - 0.13 * hgt, -(zn + g0)), TL = P2(a - g0, -(zf - g0)), END = P2(b + g0, -(zf - g0));
    const pts = [P2(BV.x - 0.17 * hgt, BV.y + 0.3 * hgt), P2(BV.x - 0.11 * hgt, BV.y + 0.36 * hgt), BV, TL, END, P2(END.x, END.y - 0.07 * hgt)];
    const w = thick || 0.1, ws = [w * 0.55, w * 1.5, w * 0.75, w * 0.75, w * 0.75, w * 0.75];
    const geo2 = new THREE.ExtrudeGeometry(strokeShape(pts, ws), { depth: 0.045, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.01, bevelSegments: 3, curveSegments: 4 });
    geo2.rotateX(-PI / 2);
    const m = new THREE.Mesh(geo2, brassM()); m.castShadow = m.receiveShadow = true; return m;
  }
  function rod(len, material, r) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.01, len - 2 * r), 8, 28), material); m.rotation.z = PI / 2; m.castShadow = m.receiveShadow = true; const g = new THREE.Group(); g.add(m); g.position.y = r; return g; }
  // warm glass rod: clear glass capsule + an inner warm filament that glows
  function glassRod(len, r) {
    const g = new THREE.Group();
    const glass = new THREE.Mesh(new THREE.CapsuleGeometry(r, len - 2 * r, 8, 28), new THREE.MeshPhysicalMaterial({ color: 0xffe9cc, roughness: 0.06, metalness: 0, transmission: 0.92, thickness: r * 2, ior: 1.5, envMapIntensity: 1.6, clearcoat: 1, attenuationColor: new THREE.Color(0xe8b878), attenuationDistance: 0.4 }));
    glass.rotation.z = PI / 2; glass.castShadow = true; g.add(glass);
    const coreM = new THREE.MeshBasicMaterial({ color: 0xffe4b8, transparent: true, opacity: 0.25, depthWrite: false });
    const core = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.4, r * 0.4, len - 2.4 * r, 12), coreM); core.rotation.z = PI / 2; g.add(core);
    const halos = []; for (let k = 0; k < 6; k++) { const h = X3.halo(0xffd9a0, r * 9, 0); h.position.x = (k / 5 - 0.5) * (len - 3 * r); g.add(h); halos.push(h); }
    g.position.y = r;
    g.userData.glow = (v) => { coreM.opacity = 0.3 + 0.7 * v; coreM.color.setRGB(0.75 + 0.25 * v, 0.62 + 0.3 * v, 0.45 + 0.3 * v); halos.forEach((h) => (h.material.opacity = 0.22 * v)); };
    g.userData.glow(0);
    return g;
  }
  // place a rod group along the segment p→q (xz plane)
  function lay(g, p, q) { g.position.x = (p.x + q.x) / 2; g.position.z = (p.z + q.z) / 2; g.rotation.y = -Math.atan2(q.z - p.z, q.x - p.x); }


  // ------------------------------------------------------------------ a real hardbound book: cloth boards, cream page block, rounded-ish spine, gold stamping
  const goldM = () => mat("gold", () => new THREE.MeshStandardMaterial({ color: 0xd9b66e, metalness: 1, roughness: 0.3 }));
  const coverMask = () => ctex("coverMask", 512, 680, (g, w, h) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.strokeStyle = "#fff"; g.lineWidth = 6; g.strokeRect(34, 34, w - 68, h - 68); g.lineWidth = 2; g.strokeRect(50, 50, w - 100, h - 100);
    g.fillStyle = "#fff"; g.textAlign = "center"; g.font = "600 46px Georgia, serif"; g.fillText("PRINCIPLES", w / 2, 250); g.font = "italic 34px Georgia, serif"; g.fillText("of", w / 2, 304); g.font = "600 46px Georgia, serif"; g.fillText("MECHANICS", w / 2, 362);
    g.beginPath(); g.arc(w / 2, 500, 34, 0, PI * 2); g.lineWidth = 4; g.stroke(); g.beginPath(); g.arc(w / 2, 500, 10, 0, PI * 2); g.fill();
  }, true);
  const spineMask = () => ctex("spineMask", 680, 128, (g, w, h) => {
    g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.fillStyle = "#fff";
    for (const x of [30, 44, w - 44, w - 30]) g.fillRect(x, 10, 5, h - 20);
    g.textAlign = "center"; g.textBaseline = "middle"; g.font = "600 40px Georgia, serif"; g.fillText("PRINCIPLES · MECHANICS", w / 2, h / 2 + 2);
  }, true);
  function book(rgb, key, o) {
    o = o || {}; const bw = o.w || 1.5, bt = o.t || 0.32, bd = o.d || 2.0, bo = 0.035;
    const g = new THREE.Group(), cloth = mat("cloth" + key, () => new THREE.MeshStandardMaterial({ map: clothTex("cloth" + key, rgb), roughness: 0.82, metalness: 0, bumpMap: clothTex("cloth" + key, rgb), bumpScale: 0.3 }));
    const pagesM = mat("pagesM", () => new THREE.MeshStandardMaterial({ map: pageTex(), roughness: 0.9, metalness: 0 }));
    const pagesT = mat("pagesT", () => new THREE.MeshStandardMaterial({ color: 0xd9cdb1, roughness: 0.9 }));
    for (const sy of [-1, 1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(bw + 0.06, bo, bd + 0.08), cloth); b.position.set(0.03, sy * (bt / 2 - bo / 2), 0); g.add(b); }
    const pb = new THREE.Mesh(new THREE.BoxGeometry(bw - 0.02, bt - 2 * bo, bd - 0.02), [pagesM, pagesM, pagesT, pagesT, pagesM, pagesM]); pb.position.x = 0.02; g.add(pb);
    const sp = new THREE.Mesh(new THREE.CylinderGeometry(bt / 2, bt / 2, bd + 0.08, 24, 1, false, PI, PI), cloth); sp.rotation.x = PI / 2; sp.scale.set(0.35, 1, 1); sp.position.x = -bw / 2 + 0.01; g.add(sp);
    // gold stamping: front cover + spine
    const fc = new THREE.Mesh(new THREE.PlaneGeometry(bw * 0.86, bd * 0.86), new THREE.MeshStandardMaterial({ color: 0xd9b66e, metalness: 1, roughness: 0.32, alphaMap: coverMask(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
    fc.rotation.x = -PI / 2; fc.position.set(0.05, bt / 2 + 0.001, 0); g.add(fc);
    const sm = new THREE.Mesh(new THREE.PlaneGeometry(bd * 0.92, bt * 0.75), new THREE.MeshStandardMaterial({ color: 0xd9b66e, metalness: 1, roughness: 0.32, alphaMap: spineMask(), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -4 }));
    sm.rotation.y = -PI / 2; sm.position.set(-bw / 2 - bt * 0.175 + 0.004, 0, 0); g.add(sm);
    g.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    g.userData.size = [bw + 0.06 + bt * 0.17, bt, bd + 0.08];
    return g;
  }

  // ------------------------------------------------------------------ the room: walnut desk, slate slab, panelled wall, brass lamp, one warm spot
  function room(o) {
    o = o || {};
    const S = stage("studio", { key: 0.0, hemi: o.hemi !== undefined ? o.hemi : 0.16, rim: o.rim !== undefined ? o.rim : 0.18, floorY: -3, bg: 0x0a0a0c });
    S.fog = new THREE.Fog(0x0a0a0c, o.fogNear || 16, o.fogFar || 40);
    const key = S.userData.key; key.castShadow = false; key.intensity = 0;
    const desk = new THREE.Mesh(new THREE.BoxGeometry(34, 0.5, 18), walnutM()); desk.position.set(0, -0.27, -2); desk.receiveShadow = true; S.add(desk);
    if (o.slate !== false) { const sl = new THREE.Mesh(slabGeo(o.sw || 13, 0.06, o.sd || 8.5, 0.12), slateM()); sl.position.set(o.sx || 0, -0.03, o.sz || 0); sl.receiveShadow = true; S.add(sl); }
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 20), new THREE.MeshStandardMaterial({ map: wrap(panelTex(), 8, 3), roughness: 0.7, metalness: 0 })); wall.position.set(0, 6, -11); wall.receiveShadow = true; S.add(wall);
    // the lamp: brass column + arm + dark brass shade; the spot sits inside the shade
    const lp = o.lamp || V(-3.2, 4.2, -2.6), tg = o.target || V(0, 0, 0);
    const spot = new THREE.SpotLight(0xffd6a0, o.power || 120, 0, o.cone || 0.55, 0.9, 2); spot.position.copy(lp); spot.target.position.copy(tg); S.add(spot, spot.target);
    spot.castShadow = true; spot.shadow.mapSize.set(2048, 2048); spot.shadow.bias = -0.0003; spot.shadow.normalBias = 0.02; spot.shadow.camera.near = 0.5; spot.shadow.radius = 4;
    if (o.lampProp !== false) {
      const L = new THREE.Group(), dir = new V3().subVectors(tg, lp).normalize();
      const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.62, 0.7, 48, 1, true), new THREE.MeshStandardMaterial({ color: 0x3a2e1c, metalness: 0.9, roughness: 0.35, side: THREE.DoubleSide }));
      const inner = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.6, 0.68, 48, 1, true), new THREE.MeshBasicMaterial({ color: 0xf2dcb4, side: THREE.BackSide }));
      const sh = new THREE.Group(); sh.add(shade, inner); const bulb = X3.halo(0xffe2b0, 0.9, 0.7); bulb.position.y = -0.2; sh.add(bulb);
      sh.position.copy(lp).addScaledVector(dir, 0.25); sh.quaternion.setFromUnitVectors(V(0, -1, 0), dir); L.add(sh);
      const base = V(lp.x - dir.x * 1.6, 0, lp.z - dir.z * 1.6);
      const foot = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.58, 0.12, 48), brassDull()); foot.position.set(base.x, 0.06, base.z); L.add(foot);
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, lp.y + 0.3, 16), brassM()); col.position.set(base.x, (lp.y + 0.3) / 2, base.z); L.add(col);
      const top = V(base.x, lp.y + 0.3, base.z), armLen = top.distanceTo(sh.position);
      const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, armLen, 12), brassM()); arm.position.copy(top).add(sh.position).multiplyScalar(0.5); arm.quaternion.setFromUnitVectors(V(0, 1, 0), new V3().subVectors(sh.position, top).normalize()); L.add(arm);
      L.traverse((m) => { if (m.isMesh) m.castShadow = true; }); S.add(L);
    }
    if (o.dress) { // a stack of two books and a brass inkwell at the back of the desk
      const d = o.dress, b1 = book([58, 30, 26], "ox"), b2 = book([34, 48, 40], "gr", { t: 0.26 });
      b1.position.set(d.x, 0.16, d.z); b1.rotation.y = d.r || 0.3; b2.position.set(d.x + 0.1, 0.32 + 0.13, d.z - 0.05); b2.rotation.y = (d.r || 0.3) - 0.22; S.add(b1, b2);
      const ink = new THREE.Group(), body = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.26, 0.24, 32), new THREE.MeshPhysicalMaterial({ color: 0x1a1d22, roughness: 0.1, metalness: 0, clearcoat: 1 })); body.position.y = 0.12; ink.add(body);
      const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.13, 0.08, 32), brassM()); cap.position.y = 0.28; ink.add(cap); ink.position.set(d.x + (d.ix || 1.9), 0, d.z + (d.iz || 0.4)); ink.traverse((m) => { if (m.isMesh) m.castShadow = true; }); S.add(ink);
    }
    return { S, spot };
  }
  const fade = (ft, a, b) => clamp((ft - a) / (b - a), 0, 1);
  const pin = (text, p, op) => [text, p.x, p.y, p.z, op];

  // ------------------------------------------------------------------ tiles in squares
  // local square: n x n cells, corner (x0, z0) = near-left, cells grow +x and −z (away). Returns cell centres [x, z].
  const cells = (n, x0, z0, rotY, ux, uz) => { const out = []; ux = ux || [1, 0]; uz = uz || [0, -1]; for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) out.push([x0 + (i + 0.5) * TS * ux[0] + (j + 0.5) * TS * uz[0], z0 + (i + 0.5) * TS * ux[1] + (j + 0.5) * TS * uz[1], rotY || 0, i, j]); return out; };
  // the 25 cells of a 5x5 target split as 3x3 corner block (cream) + 16 L-shaped (blue), same orientation as given cells
  function split25(c25) { const A = [], B = []; for (const c of c25) (c[3] < 3 && c[4] < 3 ? A : B).push(c); return [A, B]; }
  // move a tile from cell a to cell b with progress p (eased), lifted on an arc
  function moveTile(m, a, b, p, lift, y0) {
    const e = smooth(p); m.position.set(lerp(a[0], b[0], e), (y0 || 0) + TH / 2 + (lift || 0.3) * Math.sin(PI * clamp(p, 0, 1)), lerp(a[1], b[1], e));
    let dr = b[2] - a[2]; while (dr > PI / 2) dr -= PI / 2; while (dr < -PI / 4) dr += PI / 2;  // square symmetry: rotate the short way
    m.rotation.set(0, a[2] + dr * e, 0);
  }
  function setTile(m, c, y) { m.position.set(c[0], (y || 0) + TH / 2, c[1]); m.rotation.set(0, c[2], 0); }

  // ==================================================================== TRIANGLE
  // triangle in tile units: right angle V, brass leg 3 along +x, steel leg 4 along −z, hypotenuse 5
  const TV = V(-1.0, 0, 0.9), TB = V(TV.x + 3 * TS, 0, TV.z), TSv = V(TV.x, 0, TV.z - 4 * TS);
  const TCEN = V((TV.x + TB.x + TSv.x) / 3, 0, (TV.z + TB.z + TSv.z) / 3);   // centroid
  const GAP = 0.07;
  // squares outward: brass square below (+z), steel square to the left (−x), hypotenuse square beyond the hypotenuse
  const SQA = cells(3, TV.x, TV.z + GAP + 3 * TS, 0);                                     // cream 3x3 under the brass leg
  const SQB = cells(4, TV.x - GAP - 4 * TS, TV.z, 0);                                     // blue 4x4 left of the steel leg
  const hd = [(TSv.x - TB.x) / (5 * TS), (TSv.z - TB.z) / (5 * TS)], hn = [-hd[1], hd[0]];  // along hyp (B→Sv), outward normal
  const hn2 = hn[0] * (TCEN.x - TB.x) + hn[1] * (TCEN.z - TB.z) > 0 ? [-hn[0], -hn[1]] : hn;
  const hrot = -Math.atan2(hd[1], hd[0]);
  const SQC = cells(5, TB.x + hn2[0] * GAP, TB.z + hn2[1] * GAP, hrot, hd, hn2);
  const [SQC_A, SQC_B] = split25(SQC);
  SQA.forEach((c, k) => (c.to = SQC_A[k]));
  { // blue tiles: nearest-first greedy assignment into the L cells
    const free = SQC_B.slice(); const order = SQB.map((c, k) => k).sort((a, b) => Math.hypot(SQB[a][0] - TB.x, SQB[a][1] - TB.z) - Math.hypot(SQB[b][0] - TB.x, SQB[b][1] - TB.z));
    for (const k of order) { let bi = 0, bd = 1e9; free.forEach((f, i) => { const d = Math.hypot(f[0] - SQB[k][0], f[1] - SQB[k][1]); if (d < bd) { bd = d; bi = i; } }); SQB[k].to = free.splice(bi, 1)[0]; }
  }

  function triangleKit(S) {
    const brassRod = rod(3 * TS + 0.1, new THREE.MeshStandardMaterial({ color: 0xc9a865, metalness: 1, roughness: 0.24, emissive: 0x3a2a14, emissiveIntensity: 0 }), 0.05);
    const steelRod = rod(4 * TS + 0.1, new THREE.MeshStandardMaterial({ color: 0xc2c6cc, metalness: 1, roughness: 0.2, emissive: 0x2a3038, emissiveIntensity: 0 }), 0.05);
    const glass = glassRod(5 * TS + 0.12, 0.06);
    S.add(brassRod, steelRod, glass);
    const corner = new THREE.Group();
    for (const [w, d, x, z] of [[0.26, 0.06, 0.13, -0.03], [0.06, 0.26, 0.03, -0.13]]) { const cm = new THREE.Mesh(slabGeo(w, 0.02, d, 0.012), brassM()); cm.position.set(x, 0.01, z); cm.castShadow = cm.receiveShadow = true; corner.add(cm); }
    corner.position.set(TV.x + 0.07, 0, TV.z - 0.07); S.add(corner);
    // engraved squares (appear at 'Pythagoras')
    const eng = [];
    const sqDecal = (n, cx, cz, rotY) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(n * TS + 0.04, n * TS + 0.04), decalMat("chalk", gridTex(n), 0)); m.rotation.set(-PI / 2, 0, rotY); m.position.set(cx, 0.002, cz); S.add(m); eng.push(m); return m; };
    const ctr = (C) => C.reduce((s, c) => [s[0] + c[0] / C.length, s[1] + c[1] / C.length], [0, 0]);
    let c = ctr(SQA); sqDecal(3, c[0], c[1], 0); c = ctr(SQB); sqDecal(4, c[0], c[1], 0); c = ctr(SQC); sqDecal(5, c[0], c[1], hrot);
    return { brassRod, steelRod, glass, corner, eng };
  }
  function placeTriangle(K, ft, assemble) {
    const E = EV.tri;
    // rods slide in from loose positions to the triangle edges
    const p = assemble ? seg(ft, E.slide, E.corner - 0.15) : 1;
    const ofs = (k) => (1 - p) * k;
    lay(K.brassRod, V(TV.x - 0.05 + ofs(0.6), 0, TV.z + ofs(1.1)), V(TB.x + 0.05 + ofs(0.9), 0, TV.z + ofs(1.0)));
    lay(K.steelRod, V(TV.x - ofs(1.2), 0, TV.z + 0.05 + ofs(0.2)), V(TV.x - ofs(1.0), 0, TSv.z - 0.05 + ofs(0.6)));
    lay(K.glass, V(TB.x + ofs(1.3), 0, TB.z - ofs(0.4)), V(TSv.x + ofs(1.6), 0, TSv.z - ofs(0.9)));
    const cp = assemble ? fade(ft, E.corner - 0.35, E.corner) : 1;
    K.corner.position.y = (1 - cp) * 0.25; K.corner.visible = cp > 0;
  }

  LABK.triangle = (o) => {
    const mode = o.mode, T0 = o.T0;
    const C = mkCam(30);
    if (mode === "einstein" || mode === "moving") {
      const R = room({ target: mode === "moving" ? V(0.6, 0, 0.2) : V(2.0, 0, 0.0), lamp: mode === "moving" ? V(-0.4, 5.6, -3.4) : V(0.2, 4.6, -3.0), power: mode === "moving" ? 150 : 100, cone: mode === "moving" ? 0.8 : 0.62, rim: 0.08, lampProp: false, dress: { x: 4.6, z: -3.6, r: 0.5, ix: -1.6, iz: 0.9 } });
      const S = R.S, r = 0.3;
      const el = X3.electron(r); S.add(el);
      const halo = X3.halo(0xffe6c4, 2.2, 0.0); S.add(halo);
      const streakM = new THREE.MeshBasicMaterial({ map: streakTex(), color: 0xdfe9f4, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
      const streak = new THREE.Mesh(new THREE.PlaneGeometry(2.6, r * 1.5), streakM); S.add(streak);
      return (t) => {
        const ft = T0 + t;
        let x = 2.3, z = 0.3, sp = 0;
        if (mode === "moving") { const u = (ft - 241.54) / 6.72; x = lerp(-3.4, 4.5, u); z = lerp(0.7, -0.2, u); sp = 1; }
        el.position.set(x, r, z); el.rotation.z = -x / r;
        halo.position.copy(el.position); halo.material.opacity = mode === "einstein" ? 0.32 + 0.06 * Math.sin(ft * 1.3) : 0.12;
        halo.scale.setScalar(mode === "einstein" ? 2.6 + 0.15 * Math.sin(ft * 1.3) : 1.6);
        streak.position.set(x - 1.3 - r * 0.2, r, z + 0.09 * (1.3) * 0); streak.rotation.set(-0.25, -Math.atan2(-0.8, 9), 0); streakM.opacity = 0.32 * sp;
        if (mode === "einstein") camKeys(C, [[229.9, 0.85, 0.3, 0.2, 5.4, -16, 16, 0], [241.6, 0.75, 0.3, 0.2, 4.6, -6, 13, 0]], ft);
        else camKeys(C, [[241.5, -2.0, 0.3, 0.4, 5.6, -24, 14, 0], [248.3, 2.4, 0.3, 0.1, 5.6, -6, 12, 0]], ft);
        return [S, C];
      };
    }
    // tri / squares share the triangle
    if (mode === "tri" || mode === "squares") {
      const R = room({ target: V(-0.3, 0, 0), lamp: V(-4.0, 5.0, -3.8), power: 100, cone: 0.66, dress: { x: 3.2, z: -3.4, r: 0.4 } });
      const S = R.S, K = triangleKit(S);
      const tA = SQA.map((c, k) => { const m = tile("cream", k); S.add(m); return m; });
      const tB = SQB.map((c, k) => { const m = tile("blue", k + 3); S.add(m); return m; });
      const midB = V((TV.x + TB.x) / 2, 0.1, TV.z), midS = V(TV.x, 0.1, (TV.z + TSv.z) / 2), midH = V((TB.x + TSv.x) / 2, 0.12, (TB.z + TSv.z) / 2);
      return (t) => {
        const ft = T0 + t, E = EV.tri;
        placeTriangle(K, ft, mode === "tri");
        const lb = mode === "tri" ? fade(ft, E.brass, E.brass + 0.8) * (1 - 0.6 * fade(ft, E.steel, E.steel + 1)) : 0.4;
        const ls = mode === "tri" ? fade(ft, E.steel, E.steel + 0.8) * (1 - 0.6 * fade(ft, E.glass, E.glass + 1)) : 0.4;
        K.brassRod.children[0].material.emissiveIntensity = 0.9 * lb;
        K.steelRod.children[0].material.emissiveIntensity = 0.9 * ls;
        K.glass.userData.glow(mode === "tri" ? fade(ft, E.glass, E.glass + 1.2) : 1);
        const eg = mode === "tri" ? fade(ft, E.engrave, E.engrave + 1.4) : 1 - 0.7 * fade(ft, EV.sq.moveEnd - 1, EV.sq.moveEnd + 0.5);
        K.eng.forEach((m) => (m.material.opacity = 0.32 * eg));
        const pins = [];
        if (mode === "tri") {
          tA.concat(tB).forEach((m) => (m.visible = false));
          const w = (a, b) => fade(ft, a, a + 0.5) * (1 - fade(ft, b - 0.5, b));
          pins.push(pin("mass, sitting still · mc²", midB, w(E.brass + 0.3, E.steel - 0.1)));
          pins.push(pin("motion · pc", midS, w(E.steel + 0.3, E.glass - 0.1)));
          pins.push(pin("total energy · E", midH, w(E.glass + 0.4, 268.6)));
          camKeys(C, [[248.26, TCEN.x + 0.3, 0, TCEN.z - 0.2, 5.6, -34, 26, 0], [256, TCEN.x + 0.1, 0, TCEN.z - 0.1, 4.9, -16, 27, 0], [263, TCEN.x, 0, TCEN.z, 4.8, 0, 29, 0], [268.9, -0.3, 0, 0.1, 8.6, 12, 44, 0]], ft);
        } else {
          const Q = EV.sq;
          // tiles drop into the small squares one by one, then slide over into the hypotenuse square
          // order of flight: all 25 tiles in one stream, each on its own height so they never pass through each other
          const fly = (m, a, k, n, kind) => {
            const td = (kind ? Q.dropB : Q.dropA) + k * (kind ? 0.1 : 0.12), d = fade(ft, td, td + 0.35);
            const tm = Q.move + n * 0.17, mp = fade(ft, tm, tm + 1.15);
            m.visible = d > 0;
            if (mp > 0) moveTile(m, a, a.to, mp, 0.28 + 0.035 * (n % 9)); else { setTile(m, a); m.position.y += (1 - smooth(d)) * 0.5; }
          };
          tA.forEach((m, k) => fly(m, SQA[k], k, k * 2, 0));
          tB.forEach((m, k) => fly(m, SQB[k], k, k < 7 ? k * 2 + 1 : k + 7, 1));
          const sw = fade(ft, Q.move, Q.moveEnd);   // the lamp pool follows the tiles over to the hypotenuse square
          R.spot.target.position.set(lerp(-0.3, 1.0, sw), 0, lerp(0, -0.9, sw));
          R.spot.intensity = 100 * (1 - 0.3 * fade(ft, 273.2, 274.2));
          camKeys(C, [[268.9, -0.3, 0, 0.1, 8.6, 12, 44, 0], [272.6, 0.0, 0, -0.2, 8.8, 18, 42, 0.08], [274, 0.4, 0, -0.6, 10.4, 22, 32, 0.3], [278.6, 0.7, 0, -0.6, 10.0, 28, 30, 0.31]], ft);
        }
        return [S, C, pins];
      };
    }
    // the 5x5 square family: problem, first, root, recap
    const R = room({ target: V(0.2, 0, -0.2), lamp: V(-3.4, 4.8, -3.0), power: 120, cone: 0.6, lampProp: false, dress: mode === "first" ? null : { x: 3.6, z: -3.6, r: 0.5 } });
    const S = R.S;
    const SQ5 = cells(5, -1.25, 1.25, 0);               // axis-aligned 5x5 centred at origin
    const [S5A, S5B] = split25(SQ5);
    const tiles = [];
    S5A.forEach((c, k) => { const m = tile("cream", k); m.userData.cell = c; S.add(m); tiles.push(m); });
    S5B.forEach((c, k) => { const m = tile("blue", k + 3); m.userData.cell = c; S.add(m); tiles.push(m); });
    tiles.forEach((m) => setTile(m, m.userData.cell));
    let sign = null, sign2 = null, twin = null, plus = null, minus = null, rodE = null, rods = null;
    if (mode === "problem" || mode === "recap") { sign = rootSign(-1.25, 1.25, 1.25, -1.25); S.add(sign); }
    if (mode === "recap") {
      sign2 = rootSign(-1.25, 1.25, 1.25, -1.25); S.add(sign2);
      twin = SQ5.map((c, k) => { const m = tile("smoke", k); S.add(m); return m; });
      plus = new THREE.Group(); const pb1 = new THREE.Mesh(slabGeo(0.34, 0.04, 0.08, 0.02), brassM()), pb2 = pb1.clone(); pb2.rotation.y = PI / 2; plus.add(pb1, pb2); S.add(plus);
      minus = new THREE.Group(); minus.add(new THREE.Mesh(slabGeo(0.34, 0.04, 0.08, 0.02), brassM())); S.add(minus);
      [plus, minus].forEach((g) => g.traverse((m) => { if (m.isMesh) m.castShadow = true; }));
    }
    if (mode === "first" || mode === "root") { rodE = rod(5 * TS, brassM(), 0.05); S.add(rodE); }
    if (mode === "root") { rods = [rod(3 * TS, steelM(), 0.05), rod(4 * TS, steelM(), 0.05)]; S.add(rods[0], rods[1]); }
    // root mode: the 9 and 16 start as separate blocks
    const B9 = cells(3, -3.6, 1.0, 0), B16 = cells(4, 0.9, 1.0, 0);
    const srcOf = (m, k) => (k < 9 ? B9[k] : B16[k - 9]);
    return (t) => {
      const ft = T0 + t;
      let pins = [];
      if (mode === "problem") {
        const E = EV.prob, p = seg(ft, E.sign, E.signLock);
        sign.position.set(lerp(-6.5, 0, p), 0.0 + 0.12 * Math.sin(PI * p), 0); sign.visible = ft > E.sign - 0.05;
        tiles.forEach((m) => setTile(m, m.userData.cell));
        camKeys(C, [[278.5, 0, 0, 0, 6.6, -26, 36, 0], [284.4, 0, 0, -0.1, 6.2, -10, 33, 0], [286.3, -0.3, 0, -0.2, 8.4, -4, 22, 0.33], [290.2, -0.2, 0, -0.2, 8.1, 4, 21, 0.34]], ft);
      } else if (mode === "first") {
        const E = EV.first;
        const lift = 0.035 * fade(ft, E.lift, E.lift + 0.6);
        const rp = seg(ft, E.rod, E.rodLock);
        const rodZ = -0.0, rodX0 = 2.2;
        lay(rodE, V(rodX0 + 4.5 * (1 - rp), 0, rodZ - 1.25), V(rodX0 + 4.5 * (1 - rp), 0, rodZ + 1.25));
        const end = V(rodX0 - 0.35, 0, 1.25 - 0.3);                  // beside the rod's near end: where the tiles try to go
        const rank = tiles.map((m, k) => k).sort((p, q) => Math.hypot(tiles[p].userData.cell[0] - end.x, tiles[p].userData.cell[1] - end.z) - Math.hypot(tiles[q].userData.cell[0] - end.x, tiles[q].userData.cell[1] - end.z));
        const back = smooth(fade(ft, E.back, E.settle));
        rank.forEach((k, r) => {
          const m = tiles[k], c = m.userData.cell, go = smooth(fade(ft, E.funnel + r * 0.07, E.jam + r * 0.03));
          const amt = go * (1 - back), jam = clamp((ft - E.jam) / 0.4, 0, 1) * (1 - back);   // they only get half-way, then jam
          const ex = end.x + (r % 2 ? 0.27 : -0.27);
          const tx = lerp(c[0], ex, 0.6 * amt) + 0.012 * Math.sin(ft * 7 + k) * jam, tz = lerp(c[1], end.z, 0.6 * amt);
          m.position.set(tx, TH / 2 + lift * (1 - back) + amt * Math.floor(r / 2) * TH * 1.04, tz);
          m.rotation.set(0.04 * amt * Math.sin(k * 3.1), c[2] + amt * 0.35 * Math.sin(k * 2.3), 0.04 * amt * Math.cos(k * 1.7));
        });
        R.spot.target.position.set(lerp(0.2, 1.0, fade(ft, 296, 299)), 0, -0.1);
        camKeys(C, [[290.16, -0.2, 0.1, 0, 5.4, -40, 14, 0], [295.3, 0.0, 0.1, 0, 5.2, -30, 13, 0.12], [299.0, 0.6, 0.1, 0, 5.6, -14, 16, 0.12], [305.6, 0.7, 0.1, 0.2, 6.0, 12, 21, 0]], ft);
      } else if (mode === "root") {
        const E = EV.root;
        tiles.forEach((m, k) => { const a = srcOf(m, k), st = E.merge + (k < 9 ? k * 0.1 : 0.5 + (k - 9) * 0.09), p = fade(ft, st, st + 1.3); moveTile(m, a, m.userData.cell, p, 0.22 + 0.075 * (k % 9)); });
        const r5 = seg(ft, E.rod5, E.rod5 + 0.8);
        lay(rodE, V(-1.25 - 3 * (1 - r5), 0, 1.25 + 0.2), V(1.25 - 3 * (1 - r5), 0, 1.25 + 0.2)); rodE.visible = r5 > 0;
        const r34 = seg(ft, E.rod34, E.rod34End), z34 = 1.25 + 0.42, x0 = -1.25;
        lay(rods[0], V(x0 - 5 * (1 - r34), 0, z34), V(x0 + 3 * TS - 5 * (1 - r34), 0, z34));
        lay(rods[1], V(x0 + 3 * TS + 0.02 + 6 * (1 - r34), 0, z34), V(x0 + 7 * TS + 0.02 + 6 * (1 - r34), 0, z34));
        rods.forEach((r) => (r.visible = r34 > 0));
        pins = [pin("√25 = 5", V(1.25, 0.1, 1.45), fade(ft, 310.6, 311.0) * (1 - fade(ft, 311.9, 312.2))), pin("3 + 4 = 7", V(x0 + 7 * TS, 0.1, z34), fade(ft, 311.6, 312.0) * (1 - fade(ft, 312.0, 312.25)))];
        camKeys(C, [[305.6, -0.6, 0, 0.8, 7.6, -12, 34, 0], [309.5, -0.2, 0, 0.6, 6.8, -4, 36, 0], [312.3, 0.0, 0, 0.6, 8.6, 4, 24, 0.26], [317.2, 0.2, 0, 0.6, 8.2, 10, 23, 0.27]], ft);
      } else { // recap: sign over the square, slow push; it splits into a + sign over the square and a − sign over its smoky mirror twin
        const E = EV.rrec, p = seg(ft, E.split, E.splitEnd), dx = 4.7;
        R.spot.target.position.set(lerp(0.2, 0, p), 0, -0.2); R.spot.angle = lerp(0.6, 0.78, p);
        tiles.forEach((m) => { setTile(m, m.userData.cell); m.position.x -= dx / 2 * p; });
        twin.forEach((m, k) => { setTile(m, SQ5[k]); m.position.x += dx / 2 * p; m.position.y -= (1 - fade(ft, E.split + 0.2, E.splitEnd)) * 0.2; m.visible = p > 0.02; });
        sign.position.set(-dx / 2 * p, 0, 0); sign2.position.set(dx / 2 * p, 0.012 * (1 - p), 0); sign2.visible = p > 0.01;
        plus.position.set(-dx / 2 * p - 2.8, 0.02, 0.35); minus.position.set(dx / 2 * p - 2.8, 0.02, 0.35);
        plus.visible = minus.visible = p > 0.3; plus.scale.setScalar(1.5 * fade(ft, E.split + 0.7, E.splitEnd)); minus.scale.setScalar(1.5 * fade(ft, E.split + 0.7, E.splitEnd));
        camKeys(C, [[986.3, -0.5, 0, 0, 7.6, -18, 40, 0], [989.2, -0.4, 0, 0, 6.9, -12, 38, 0], [992.5, -0.5, 0, 0.1, 11.6, -4, 40, 0]], ft);
      }
      return [S, C, pins];
    };
  };

  // ==================================================================== MATRIX
  // a tablet: slate with brass-inlaid entries (or a brass plate with black-filled engraving); flat, top face up, centred at origin
  const TW = 1.7, TP = 0.36, TT = 0.08;
  function tablet(M, o) {
    o = o || {}; const g = new THREE.Group(), plate = o.plate, style = plate ? "ink" : "brass";
    const body = new THREE.Mesh(slabGeo(TW, TT, TW, 0.05), plate ? brassDull() : slateSmall()); body.position.y = TT / 2; body.castShadow = body.receiveShadow = true; g.add(body);
    if (!plate) for (const [w, d, x, z] of [[TW, 0.04, 0, TW / 2 - 0.02], [TW, 0.04, 0, -TW / 2 + 0.02], [0.04, TW, TW / 2 - 0.02, 0], [0.04, TW, -TW / 2 + 0.02, 0]]) { const f = new THREE.Mesh(new THREE.BoxGeometry(w, 0.012, d), brassM()); f.position.set(x, TT + 0.004, z); f.castShadow = true; g.add(f); }
    const y = TT + 0.002, entries = [];
    const mk = (text, hgt, blur, own) => { if (!own) return decal(text, hgt, style, blur); const gl = glyph(text, blur); const m = new THREE.Mesh(new THREE.PlaneGeometry(hgt * gl.a, hgt), decalMat(style, gl.t)); m.rotation.x = -PI / 2; return m; };
    for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
      const txt = fmt(M[i][j]), x = (j - 1.5) * TP, z = (i - 1.5) * TP + 0.06, e = { i, j };
      e.sharp = mk(txt, 0.27, 0, o.own); e.sharp.position.set(x, y, z); g.add(e.sharp);
      if (o.blur) { e.blur = mk(txt, 0.27, 9, true); e.blur.position.set(x, y + 0.0005, z); g.add(e.blur); }
      entries.push(e);
    }
    for (const sx of [-1, 1]) { const b = new THREE.Mesh(new THREE.PlaneGeometry(0.1, 1.5), decalMat(style, bracketTex())); b.rotation.set(-PI / 2, 0, sx > 0 ? PI : 0); b.position.set(sx * 0.76, y, 0.06); g.add(b); }
    if (o.label) { const l = decal(o.label, 0.22, style); l.position.set(-0.62, y, -0.72); g.add(l); }
    g.userData.entries = entries;
    return g;
  }
  const standUp = (g, lean) => { g.rotation.set(PI / 2 - (lean || 0.18), 0, 0); return g; };

  LABK.matrix = (o) => {
    const mode = o.mode, T0 = o.T0, C = mkCam(30);
    if (mode === "bold") {
      // four carved slate blocks 3, 4, 9, 16; each turns over and its underside is a 4x4 gamma grid
      const R = room({ target: V(0.3, 0, -0.2), lamp: V(-2.4, 5.6, -3.6), power: 140, cone: 0.75, lampProp: false, dress: { x: 4.6, z: -3.6, r: 0.5 } });
      const S = R.S, blocks = [], nums = ["3", "4", "9", "16"];
      nums.forEach((n, k) => {
        const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
        const body = new THREE.Mesh(slabGeo(TW, 0.16, TW, 0.05), slateSmall()); body.castShadow = body.receiveShadow = true; inner.add(body);
        const d = decal(n, 1.1, "brass"); d.position.y = 0.081; inner.add(d);
        const tb = tablet(G[k], { label: "γ^" + k }); inner.add(tb); tb.rotation.x = PI; tb.position.y = -0.08;
        g.position.set((k - 1.5) * 2.0, 0.16, 0); S.add(g); blocks.push(inner);
      });
      return (t) => {
        const ft = T0 + t, E = EV.bold;
        blocks.forEach((b, k) => { const p = fade(ft, E.flip + k * E.flipStep, E.flip + k * E.flipStep + 1.1), e = smooth(p); b.rotation.x = PI * e; b.position.y = 0.42 * Math.sin(PI * p) - 0.08 * e; });
        camKeys(C, [[317.1, -0.3, 0, 0.2, 9.6, -16, 32, 0], [324.7, 0.1, 0, 0.0, 8.8, -4, 40, 0]], ft);
        return [S, C];
      };
    }
    if (mode === "grid") {
      const R = room({ target: V(0.2, 0, -0.1), lamp: V(-2.0, 4.6, -2.6), power: 130, cone: 0.5, lampProp: false });
      const S = R.S, tb = tablet(G[2], { blur: true, own: true, label: "γ^2" }); tb.rotation.y = 0.12; S.add(tb);
      return (t) => {
        const ft = T0 + t, f = lerp(-0.6, 3.6, smooth((ft - 324.9) / 6.2));   // focus plane sweeps across the columns
        for (const e of tb.userData.entries) { const w = clamp(Math.abs(e.j + (e.i - 1.5) * 0.25 - f) / 1.4, 0, 1); e.sharp.material.opacity = 1 - w; e.blur.material.opacity = 0.75 * w; }
        camKeys(C, [[324.6, -0.55, 0.05, 0.1, 3.0, -30, 21, 0.14], [331.3, -0.35, 0.05, 0.05, 2.7, 10, 23, 0.14]], ft);
        return [S, C];
      };
    }
    if (mode === "order") {
      const R = room({ target: V(0, 0, 0), lamp: V(-2.6, 5.0, -3.2), power: 110, cone: 0.6, lampProp: false, dress: { x: 3.6, z: -3.2, r: 0.4 } });
      const S = R.S, A = tablet(G[0], { label: "A" }), B = tablet(G[1], { label: "B" }); S.add(A, B);
      return (t) => {
        const ft = T0 + t, E = EV.order, p = seg(ft, E.swap, E.swapEnd), a = PI * p;
        A.position.set(-1.1 * Math.cos(a), 0.12 * Math.sin(a), 0.9 * Math.sin(a)); B.position.set(1.1 * Math.cos(a), 0.0, -0.9 * Math.sin(a));
        camKeys(C, [[331.2, 0, 0, 0.1, 6.0, -12, 38, 0], [334.4, 0, 0, 0.1, 5.6, 6, 40, 0]], ft);
        return [S, C];
      };
    }
    if (mode === "book") {
      // two identical books; same two quarter turns about the desk's fixed axes, opposite order
      const R = room({ target: V(0, 0.6, -1.4), lamp: V(-3.4, 5.0, 3.0), power: 340, cone: 0.5, slate: false, lampProp: false, rim: 0.35, hemi: 0.3 });
      const S = R.S, b1 = book([118, 44, 36], "red"), b2 = book([118, 44, 36], "red"); S.add(b1, b2);
      const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), q = new THREE.Quaternion(), AY = V(0, 1, 0), AX = V(1, 0, 0), cv = new V3();
      const sz = b1.userData.size, corners = [];
      for (const sx of [-1, 1]) for (const sy of [-1, 1]) for (const sz2 of [-1, 1]) corners.push(V(sx * sz[0] / 2, sy * sz[1] / 2, sz2 * sz[2] / 2));
      const rest = (g, quat, lift) => { let mn = 1e9; for (const c of corners) mn = Math.min(mn, cv.copy(c).applyQuaternion(quat).y); g.quaternion.copy(quat); g.position.y = -mn + lift; };
      return (t) => {
        const ft = T0 + t, E = EV.book, a1 = seg(ft, E.s1, E.s1e) * PI / 2, a2 = seg(ft, E.s2, E.s2e) * PI / 2;
        const lift = 0.25 * (Math.sin(PI * fade(ft, E.s1, E.s1e)) + Math.sin(PI * fade(ft, E.s2, E.s2e)));
        // book 1: turn about the vertical, then about left-right.  book 2: the same turns, other order. (world axes: premultiply)
        q.copy(qb.setFromAxisAngle(AX, a2)).multiply(qa.setFromAxisAngle(AY, a1)); rest(b1, q, lift); b1.position.x = -1.7; b1.position.z = -1.2;
        q.copy(qb.setFromAxisAngle(AY, a2)).multiply(qa.setFromAxisAngle(AX, a1)); rest(b2, q, lift); b2.position.x = 1.7; b2.position.z = -1.2;
        camKeys(C, [[342.9, 0, 0.9, -1.2, 11.5, -12, 22, 0.15], [346.5, 0, 0.9, -1.2, 11.0, -4, 22, 0.17], [351.5, 0, 0.9, -1.2, 10.6, 8, 23, 0.19]], ft);
        return [S, C];
      };
    }
    return () => [new THREE.Scene(), C];
  };
})();
