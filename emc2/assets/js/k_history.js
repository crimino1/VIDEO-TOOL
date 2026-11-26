/* k_history.js — group C kinds (E = mc² film): patent, paper, snow, letters.
   Each kind: LABK.name = (o) => (t, d) => [scene, camera, pins]; ft = o.T0 + t is film time. Pure functions of t.
   EVENTS (film seconds) — every visible event is keyed off this table, so sound cues can be read straight from it. */
(function () {
  const { THREE, M, seg, smooth, lerp, clamp, rnd, orbit, stage, glowSprite, W, H, D2R } = L3;
  const EV = {
    patent: { notebook: 81.4 },
    paper: { fan: 88.5, read: 91.2, sentence: 94.0, aside: 95.0 },
    letters: { heat: 118.7, bulb: 119.3, ball: 119.9, push: 125.4, pulse0: 127.9, side: 136.7 },
    snow: { lift: 500.4, gone: 504.6 },
  };
  const V3 = THREE.Vector3, TAU = Math.PI * 2, UP = new V3(0, 1, 0);
  const V = (x, y, z) => new V3(x, y, z);
  const fr = (x) => x - Math.floor(x);

  // ---------------------------------------------------------------- camera helpers
  function aim(C, p, dist, az, el, ox, oy) {
    orbit(C, p.x, p.y, p.z, dist, az, el);
    C.near = Math.max(1e-3, dist * 0.02); C.far = Math.max(300, dist * 40);
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
  // camera keys: [[ft, tx, ty, tz, dist, az, el, ox, oy], ...]  (ox/oy optional view offset in px)
  function camKeys(C, K, t) {
    const g = (j) => cr(K.map((k) => [k[0], k[j] || 0]), t);
    aim(C, V(g(1), g(2), g(3)), g(4), g(5), g(6), g(7), g(8));
  }
  const cam = (fov) => new THREE.PerspectiveCamera(fov || 32, W / H, 0.05, 400);

  // ---------------------------------------------------------------- procedural textures (cached, seeded)
  const hash = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 1442695041)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function vn(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s, o) { let f = 0, a = 0.5; for (let i = 0; i < (o || 4); i++) { f += a * vn(x, y, s + i * 17); x *= 2; y *= 2; a *= 0.5; } return f; }
  const TC = window.__khTC || (window.__khTC = {});
  function ctex(key, w, h, fn, aniso) {
    if (key && TC[key]) return TC[key];
    const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso || 16;
    if (key) TC[key] = t; return t;
  }
  function pixTex(key, w, h, fn, lin) {
    if (TC[key]) return TC[key];
    const t = ctex(null, w, h, (g) => { const im = g.createImageData(w, h), D = im.data; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = fn(x, y), i = (y * w + x) * 4; D[i] = c[0]; D[i + 1] = c[1]; D[i + 2] = c[2]; D[i + 3] = c[3] === undefined ? 255 : c[3]; } g.putImageData(im, 0, 0); });
    t.wrapS = t.wrapT = THREE.RepeatWrapping; if (lin) t.colorSpace = THREE.NoColorSpace;
    return (TC[key] = t);
  }
  const rep = (t, x, y) => { const c = t.clone(); c.repeat.set(x, y); c.needsUpdate = true; return c; };
  const woodTex = (key, base, seed) => pixTex(key, 1024, 512, (x, y) => {
    const n = fbm(x / 420, y / 40, seed, 4), ring = 0.5 + 0.5 * Math.sin((y / 512 * 60 + n * 3.2) * Math.PI), fine = vn(x / 3, y / 0.9, seed + 9), streak = fbm(x / 900, y / 6, seed + 5, 3);
    const k = 0.8 + 0.08 * Math.pow(ring, 3) + 0.06 * fine + 0.12 * (streak - 0.5) - 0.08 * fbm(x / 300, y / 200, seed + 3, 2);
    return [base[0] * k, base[1] * k, base[2] * k];
  });
  function wood(key, base, seed, rough, rp) {
    const m = new THREE.MeshStandardMaterial({ map: woodTex(key, base, seed), roughness: rough || 0.55, metalness: 0, bumpMap: woodTex(key, base, seed), bumpScale: 0.6, envMapIntensity: 0.5 });
    if (rp) { m.map = rep(m.map, rp[0], rp[1]); m.bumpMap = m.map; } return m;
  }
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
    if (shadow !== false) { l.castShadow = true; l.shadow.mapSize.set(2048, 2048); l.shadow.bias = -0.0004; l.shadow.normalBias = 0.015; l.shadow.camera.near = 0.5; }
    return l;
  }
  // dim stage: one motivated light is added by each scene
  function darkStage(o) {
    const S = stage("studio", Object.assign({ key: 0.12, hemi: 0.1, rim: 0.18, floorY: -3 }, o || {}));
    S.userData.key.castShadow = false; return S;
  }

  // ---------------------------------------------------------------- PAPER
  // shared grain tile (mottling + fine grain), used as multiply layer and as bump
  const grainCanvas = () => {
    if (TC.__grain) return TC.__grain;
    const n = 512, c = document.createElement("canvas"); c.width = c.height = n; const g = c.getContext("2d"), im = g.createImageData(n, n), D = im.data;
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
      // tileable: sample fbm on a torus-ish wrap by blending
      const f = (xx, yy) => fbm(xx / 64, yy / 64, 3, 5);
      const u = x / n, v = y / n, a = f(x, y) * (1 - u) * (1 - v) + f(x - n, y) * u * (1 - v) + f(x, y - n) * (1 - u) * v + f(x - n, y - n) * u * v;
      const k = 205 + (a - 0.5) * 70 + (hash(x, y, 9) - 0.5) * 36, i = (y * n + x) * 4;
      D[i] = D[i + 1] = D[i + 2] = clamp(k, 0, 255); D[i + 3] = 255;
    }
    g.putImageData(im, 0, 0);
    // fibres
    const r = rnd(41); g.lineCap = "round";
    for (let i = 0; i < 2200; i++) {
      const x = r() * n, y = r() * n, a = r() * TAU, l = 6 + r() * 26, bend = (r() - 0.5) * 10;
      g.strokeStyle = r() < 0.55 ? "rgba(255,255,255,0.22)" : "rgba(60,50,40,0.13)"; g.lineWidth = 0.5 + r() * 1.1;
      for (const ox of [0, -n, n]) for (const oy of [0, -n, n]) { g.beginPath(); g.moveTo(x + ox, y + oy); g.quadraticCurveTo(x + ox + Math.cos(a) * l / 2 - Math.sin(a) * bend, y + oy + Math.sin(a) * l / 2 + Math.cos(a) * bend, x + ox + Math.cos(a) * l, y + oy + Math.sin(a) * l); g.stroke(); }
    }
    return (TC.__grain = c);
  };
  function paperBump() {
    if (TC.__pbump) return TC.__pbump;
    const t = new THREE.CanvasTexture(grainCanvas()); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.NoColorSpace; t.anisotropy = 8;
    return (TC.__pbump = t);
  }
  // aged paper base: tone, mottling, fibres, yellowed edges, foxing
  function agedPaper(g, w, h, seed, o) {
    o = o || {}; const r = rnd(seed), k = w / 1024;
    g.fillStyle = o.tone || "#eee5d0"; g.fillRect(0, 0, w, h);
    g.save(); g.globalCompositeOperation = "multiply"; g.globalAlpha = o.grain || 0.55;
    const pat = g.createPattern(grainCanvas(), "repeat"); g.fillStyle = pat; g.translate(r() * 512, r() * 512); g.scale(k * 1.4, k * 1.4); g.fillRect(-2000, -2000, w / k + 4000, h / k + 4000); g.restore();
    // large soft mottles
    g.save(); g.globalCompositeOperation = "multiply";
    for (let i = 0; i < 14; i++) { const x = r() * w, y = r() * h, rr = (0.15 + r() * 0.35) * w, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(200,170,120,${0.05 + r() * 0.06})`); gr.addColorStop(1, "rgba(200,170,120,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }
    // yellowed edges
    const age = o.age === undefined ? 1 : o.age, e = Math.min(w, h) * 0.09;
    const edge = (x0, y0, x1, y1) => { const gr = g.createLinearGradient(x0, y0, x1, y1); gr.addColorStop(0, `rgba(170,120,60,${0.42 * age})`); gr.addColorStop(0.35, `rgba(190,150,90,${0.12 * age})`); gr.addColorStop(1, "rgba(200,160,100,0)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); };
    edge(0, 0, e, 0); edge(w, 0, w - e, 0); edge(0, 0, 0, e); edge(0, h, 0, h - e);
    // foxing spots
    for (let i = 0; i < (o.fox === undefined ? 10 : o.fox); i++) { const x = r() * w, y = r() * h, rr = (2 + r() * 9) * k, gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(150,95,45,${0.25 + r() * 0.3})`); gr.addColorStop(1, "rgba(150,95,45,0)"); g.fillStyle = gr; g.fillRect(x - rr, y - rr, rr * 2, rr * 2); }
    g.restore();
  }
  // after ink: break the ink up with the paper grain so it sits IN the paper
  function inkIntoPaper(g, w, h, seed) {
    const r = rnd(seed + 5), k = w / 1024;
    g.save(); g.globalCompositeOperation = "screen"; g.globalAlpha = 0.16; const pat = g.createPattern(grainCanvas(), "repeat"); g.fillStyle = pat; g.translate(r() * 512, r() * 512); g.scale(k * 0.7, k * 0.7); g.fillRect(-2000, -2000, w / k * 1.5 + 4000, h / k * 1.5 + 4000); g.restore();
  }
  // a sheet lying flat (XZ plane, +y up), size w x h, gentle curl/wave; tex top = -z
  function sheet(tex, w, h, o) {
    o = o || {}; const nx = o.nx || 40, nz = o.nz || 40, r = rnd(o.seed || 3);
    const geo = new THREE.PlaneGeometry(w, h, nx, nz); geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position, c1 = o.curl === undefined ? 0.04 : o.curl, wv = o.wave === undefined ? 0.008 : o.wave, ph = r() * 6, cx = r() < 0.5 ? -1 : 1;
    for (let i = 0; i < p.count; i++) {
      const u = p.getX(i) / (w / 2), v = p.getZ(i) / (h / 2);
      let y = c1 * Math.pow(Math.max(0, Math.abs(u) - 0.55) / 0.45, 2) * (0.6 + 0.4 * Math.abs(v))           // side edges lift
        + c1 * 0.7 * Math.pow(Math.max(0, cx * u * 0.5 + 0.5 * v * (o.cornerV || 1) - 0.55) / 0.45, 2)      // one corner curls
        + wv * Math.sin(u * 2.2 + ph) * Math.cos(v * 1.7 + ph * 0.7) + wv;
      if (o.folds) for (const f of o.folds) y += f[1] * Math.max(0, 1 - Math.abs(v - f[0]) / 0.06) + f[1] * 0.4 * (Math.abs(v - f[0]) < 0.5 ? 1 - Math.abs(v - f[0]) / 0.5 : 0);
      p.setY(i, y + (o.lift || 0));
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ map: tex, roughness: o.rough || 0.9, metalness: 0, bumpMap: o.bump === false ? null : rep(paperBump(), w * (o.bumpRep || 2), h * (o.bumpRep || 2)), bumpScale: o.bumpScale || 0.5, envMapIntensity: o.env === undefined ? 0.08 : o.env, side: THREE.DoubleSide });
    const m = new THREE.Mesh(geo, mat); m.castShadow = true; m.receiveShadow = true; return m;
  }
  // soft contact shadow under flat objects (multiply-like dark blur)
  function contact(w, h, op, soft) {
    const s = soft || 0.18, t = ctex("contact" + s, 256, 256, (g, W2, H2) => { g.fillStyle = "#000"; g.fillRect(0, 0, W2, H2); g.filter = `blur(${Math.round(W2 * s * 0.5)}px)`; g.fillStyle = "#fff"; const m = W2 * s; g.fillRect(m, m, W2 - 2 * m, H2 - 2 * m); });
    t.colorSpace = THREE.NoColorSpace;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w * (1 + s * 2.4), h * (1 + s * 2.4)).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ alphaMap: t, transparent: true, opacity: op || 0.5, depthWrite: false, color: 0x000000 }));
    m.renderOrder = 1; return m;
  }

  // ---------------------------------------------------------------- tiny math typesetter for printed formulas
  // node: "string" | ["r", ...] row | ["f", num, den] | ["sq", x] | ["^", base, exp] | ["_", base, sub] | ["p", x] parens | ["b", x] braces | ["k", x] brackets
  function mathBox(g, n, fs, F) {
    const font = (it, s) => `${it ? "italic " : ""}${Math.round(s)}px ${F}`;
    if (typeof n === "string") {
      const parts = []; n.replace(/(cos)|([A-Za-zα-ωφ])|([^A-Za-zα-ωφ]+)/g, (m, fn, v) => { parts.push({ s: m, it: !!v }); return m; });
      let w = 0; parts.forEach((p) => { g.font = font(p.it, fs); p.w = g.measureText(p.s).width + (p.it ? fs * 0.05 : 0); w += p.w; });
      return { w, a: fs * 0.7, d: fs * 0.2, draw: (x, y) => { parts.forEach((p) => { g.font = font(p.it, fs); g.fillText(p.s, x, y); x += p.w; }); } };
    }
    const T = n[0];
    if (T === "r") { const bs = n.slice(1).map((c) => mathBox(g, c, fs, F)); return { w: bs.reduce((s, b) => s + b.w, 0), a: Math.max(...bs.map((b) => b.a)), d: Math.max(...bs.map((b) => b.d)), draw: (x, y) => bs.forEach((b) => { b.draw(x, y); x += b.w; }) }; }
    if (T === "f") {
      const sc = fs * 0.86, nu = mathBox(g, n[1], sc, F), de = mathBox(g, n[2], sc, F), w = Math.max(nu.w, de.w) + fs * 0.3, ax = fs * 0.3, gap = fs * 0.14;
      return { w: w + fs * 0.16, a: ax + gap + nu.d + nu.a, d: -ax + gap + de.a + de.d, draw: (x, y) => { x += fs * 0.08; nu.draw(x + (w - nu.w) / 2, y - ax - gap - nu.d); de.draw(x + (w - de.w) / 2, y - ax + gap + de.a); g.fillRect(x, y - ax - fs * 0.03, w, Math.max(1.5, fs * 0.055)); } };
    }
    if (T === "sq") {
      const b = mathBox(g, n[1], fs, F), lw = Math.max(1.5, fs * 0.05), hw = fs * 0.55;
      return { w: b.w + hw + fs * 0.1, a: b.a + fs * 0.18, d: b.d + fs * 0.05, draw: (x, y) => { const top = y - b.a - fs * 0.1, bot = y + b.d; g.save(); g.lineWidth = lw; g.strokeStyle = g.fillStyle; g.beginPath(); g.moveTo(x, bot - (bot - top) * 0.45); g.lineTo(x + hw * 0.25, bot - (bot - top) * 0.52); g.lineTo(x + hw * 0.55, bot); g.lineTo(x + hw, top); g.lineTo(x + hw + b.w + fs * 0.08, top); g.stroke(); g.restore(); b.draw(x + hw + fs * 0.04, y); } };
    }
    if (T === "^" || T === "_") {
      const b = mathBox(g, n[1], fs, F), e = mathBox(g, n[2], fs * 0.62, F), up = T === "^" ? Math.max(fs * 0.38, b.a - e.a * 0.5) : -fs * 0.22;
      return { w: b.w + e.w + fs * 0.04, a: Math.max(b.a, up + e.a), d: Math.max(b.d, -up + e.d), draw: (x, y) => { b.draw(x, y); e.draw(x + b.w + fs * 0.02, y - up); } };
    }
    if (T === "p" || T === "b" || T === "k") {
      const b = mathBox(g, n[1], fs, F), hgt = b.a + b.d, sy = Math.max(1, hgt / (fs * 0.95)), ch = T === "p" ? ["(", ")"] : T === "b" ? ["{", "}"] : ["[", "]"];
      g.font = font(false, fs); const pw = g.measureText(ch[0]).width * 1.05;
      return { w: b.w + pw * 2, a: b.a + fs * 0.04, d: b.d + fs * 0.04, draw: (x, y) => { const mid = y - (b.a - b.d) / 2; g.font = font(false, fs); g.save(); g.translate(0, mid); g.scale(1, sy); g.fillText(ch[0], x, fs * 0.33); g.fillText(ch[1], x + pw + b.w, fs * 0.33); g.restore(); b.draw(x + pw, y); } };
    }
    return mathBox(g, String(n), fs, F);
  }

  // ---------------------------------------------------------------- Annalen der Physik 18 (1905), pp. 639-641 — the real text (German Wikisource transcription)
  const ROMAN = "Century, 'Century Schoolbook', Georgia, serif";
  const A_PAGES = [
    [["h", "Ist die Trägheit eines Körpers von seinem Energieinhalt abhängig?"], ["au", "Von A. {Einstein}."], ["rule"],
      ["p", "Die Resultate einer jüngst in diesen Annalen von mir publizierten elektrodynamischen Untersuchung¹) führen zu einer sehr interessanten Folgerung, die hier abgeleitet werden soll."],
      ["p", "Ich legte dort die {Maxwell-Hertz}schen Gleichungen für den leeren Raum nebst dem {Maxwell}schen Ausdruck für die elektromagnetische Energie des Raumes zugrunde und außerdem das Prinzip:"],
      ["p", "Die Gesetze, nach denen sich die Zustände der physikalischen Systeme ändern, sind unabhängig davon, auf welches von zwei relativ zueinander in gleichförmiger Parallel-Translationsbewegung befindlichen Koordinatensystemen diese Zustandsänderungen bezogen werden (Relativitätsprinzip)."],
      ["p", "Gestützt auf diese Grundlagen²) leitete ich unter anderem das nachfolgende Resultat ab (l. c. § 8):"],
      ["p", "Ein System von ebenen Lichtwellen besitze, auf das Koordinatensystem ($x, y, z$) bezogen, die Energie $l$; die Strahlrichtung (Wellennormale) bilde den Winkel $φ$ mit der $x$-Achse des Systems. Führt man ein neues, gegen das System ($x, y, z$) in gleichförmiger Paralleltranslation begriffenes Koordinatensystem ($ξ, η, ζ$) ein, dessen Ursprung sich mit der Geschwindigkeit $v$ längs der $x$-Achse bewegt, so besitzt die genannte Lichtmenge — im System ($ξ, η, ζ$) gemessen — die Energie:"],
      ["m", ["r", "l* = l", ["f", ["r", "1 − ", ["f", "v", "V"], " cos φ"], ["sq", ["r", "1 − ", ["^", ["p", ["f", "v", "V"]], "2"]]]], ","]],
      ["p", "wobei $V$ die Lichtgeschwindigkeit bedeutet. Von diesem Resultat machen wir im folgenden Gebrauch."],
      ["fn", "¹) A. {Einstein}, Ann. d. Phys. 17. p. 891. 1905.", "²) Das dort benutzte Prinzip der Konstanz der Lichtgeschwindigkeit ist natürlich in den {Maxwell}schen Gleichungen enthalten."]],
    [["p", "Es befinde sich nun im System ($x, y, z$) ein ruhender Körper, dessen Energie — auf das System ($x, y, z$) bezogen — $E₀$ sei. Relativ zu dem wie oben mit der Geschwindigkeit $v$ bewegten System ($ξ, η, ζ$) sei die Energie des Körpers $H₀$."],
      ["p", "Dieser Körper sende in einer mit der $x$-Achse den Winkel $φ$ bildenden Richtung ebene Lichtwellen von der Energie $L/2$ (relativ zu ($x, y, z$) gemessen) und gleichzeitig eine gleich große Lichtmenge nach der entgegengesetzten Richtung. Hierbei bleibt der Körper in Ruhe in bezug auf das System ($x, y, z$). Für diesen Vorgang muß das Energieprinzip gelten und zwar (nach dem Prinzip der Relativität) in bezug auf beide Koordinatensysteme. Nennen wir $E₁$ bez. $H₁$ die Energie des Körpers nach der Lichtaussendung relativ zum System ($x, y, z$) bez. ($ξ, η, ζ$) gemessen, so erhalten wir mit Benutzung der oben angegebenen Relation:"],
      ["m", ["r", "E₀ = E₁ + ", ["k", ["r", ["f", "L", "2"], " + ", ["f", "L", "2"]]], ","]],
      ["m", ["r", "H₀ = H₁ + ", ["k", ["r", ["f", "L", "2"], ["f", ["r", "1 − ", ["f", "v", "V"], " cos φ"], ["sq", ["r", "1 − ", ["^", ["p", ["f", "v", "V"]], "2"]]]], " + ", ["f", "L", "2"], ["f", ["r", "1 + ", ["f", "v", "V"], " cos φ"], ["sq", ["r", "1 − ", ["^", ["p", ["f", "v", "V"]], "2"]]]]]]]],
      ["m", ["r", "= H₁ + ", ["f", "L", ["sq", ["r", "1 − ", ["^", ["p", ["f", "v", "V"]], "2"]]]], "."]],
      ["p", "Durch Subtraktion erhält man aus diesen Gleichungen:"],
      ["m", ["r", "(H₀ − E₀) − (H₁ − E₁) = L", ["b", ["r", ["f", "1", ["sq", ["r", "1 − ", ["^", ["p", ["f", "v", "V"]], "2"]]]], " − 1"]], "."]],
      ["p", "Die beiden in diesem Ausdruck auftretenden Differenzen von der Form $H − E$ haben einfache physikalische Bedeutungen. $H$ und $E$ sind Energiewerte desselben Körpers, bezogen auf zwei relativ zueinander bewegte Koordinatensysteme, wobei der Körper in dem einen System (System ($x, y, z$)) ruht. Es ist also klar, daß die Differenz $H − E$ sich von der kinetischen Energie $K$ des Körpers in bezug auf das andere System (System ($ξ, η, ζ$)) nur durch eine additive Konstante $C$ unterscheiden kann, welche von der Wahl der willkürlichen additiven", 1]],
    [["p", "Konstanten der Energien $H$ und $E$ abhängt. Wir können also setzen:", 0, 1],
      ["m", ["r", "H₀ − E₀ = K₀ + C,"]], ["m", ["r", "H₁ − E₁ = K₁ + C,"]],
      ["p", "da $C$ sich während der Lichtaussendung nicht ändert. Wir erhalten also:"],
      ["m", ["r", "K₀ − K₁ = L", ["b", ["r", ["f", "1", ["sq", ["r", "1 − ", ["^", ["p", ["f", "v", "V"]], "2"]]]], " − 1"]], "."]],
      ["p", "Die kinetische Energie des Körpers in bezug auf ($ξ, η, ζ$) nimmt infolge der Lichtaussendung ab, und zwar um einen von den Qualitäten des Körpers unabhängigen Betrag. Die Differenz $K₀ − K₁$ hängt ferner von der Geschwindigkeit ebenso ab wie die kinetische Energie des Elektrons (l. c. § 10)."],
      ["p", "Unter Vernachlässigung von Größen vierter und höherer Ordnung können wir setzen:"],
      ["m", ["r", "K₀ − K₁ = ", ["f", "L", ["^", "V", "2"]], " ", ["f", ["^", "v", "2"], "2"], "."]],
      ["p", "Aus dieser Gleichung folgt unmittelbar:"],
      ["p", "Gibt ein Körper die Energie $L$ in Form von Strahlung ab, so verkleinert sich seine Masse um $L/V²$. Hierbei ist es offenbar unwesentlich, daß die dem Körper entzogene Energie gerade in Energie der Strahlung übergeht, so daß wir zu der allgemeineren Folgerung geführt werden:", 0, 0, "KEY"],
      ["p", "Die Masse eines Körpers ist ein Maß für dessen Energieinhalt; ändert sich die Energie um $L$, so ändert sich die Masse in demselben Sinne um $L/9.10²⁰$, wenn die Energie in Erg und die Masse in Grammen gemessen wird."],
      ["p", "Es ist nicht ausgeschlossen, daß bei Körpern, deren Energieinhalt in hohem Maße veränderlich ist (z. B. bei den Radiumsalzen), eine Prüfung der Theorie gelingen wird."],
      ["p", "Wenn die Theorie den Tatsachen entspricht, so überträgt die Strahlung Trägheit zwischen den emittierenden und absorbierenden Körpern."],
      ["sig", "{Bern}, September 1905."], ["c", "(Eingegangen 27. September 1905.)"]],
  ];
  // lays out one page on a 2048 x 3100 design grid; returns {key:{y0,y1,x0,x1}} rectangles of tagged paragraphs (design px)
  function annalenPage(g, pi, sc) {
    const PW = 2048, ML = 300, MR = 300, TW = PW - ML - MR, FS = 41, LH = 56, out = {};
    g.save(); g.scale(sc, sc);
    g.fillStyle = "rgba(34,28,24,0.93)"; g.textBaseline = "alphabetic";
    // running head + page number
    g.font = `${FS * 0.9}px ${ROMAN}`; const pn = String(639 + pi);
    if (pi === 0) { g.textAlign = "center"; g.fillText("1905.  № 13.", PW / 2, 236); }
    else { g.textAlign = pi % 2 ? "left" : "right"; g.fillText(pn, pi % 2 ? ML : PW - MR, 236); g.textAlign = "center"; g.letterSpacing = "4px"; g.fillText("A. Einstein.", PW / 2, 236); g.letterSpacing = "0px"; }
    g.textAlign = "left";
    let y = 330;
    const runs = (s) => { // split into [text, style] with $..$ italic math and {..} letterspaced
      const r = []; s.replace(/\$([^$]+)\$|\{([^}]+)\}|([^${}]+)/g, (m, mth, sp, tx) => { if (mth) r.push([mth, "m"]); else if (sp) r.push([sp, "s"]); else r.push([tx, "t"]); return m; }); return r;
    };
    const fontFor = (st, fs) => (st === "m" ? `italic ${fs}px ${ROMAN}` : `${fs}px ${ROMAN}`);
    function para(s, fs, lh, indent, noIndentFirst, last, tag) {
      // tokenise into words carrying style
      const words = []; runs(s).forEach(([tx, st]) => { tx.split(/(\s+)/).forEach((w) => { if (!w) return; if (/^\s+$/.test(w)) words.push(null); else words.push([w, st]); }); });
      // merge adjacent non-space tokens into word groups
      const groups = []; let cur = null; words.forEach((w) => { if (w === null) { if (cur) groups.push(cur); cur = null; } else { (cur = cur || []).push(w); } }); if (cur) groups.push(cur);
      const wW = (gr) => gr.reduce((s, [w, st]) => { g.font = fontFor(st, fs); g.letterSpacing = st === "s" ? `${fs * 0.16}px` : "0px"; const m = g.measureText(w).width; g.letterSpacing = "0px"; return s + m; }, 0);
      g.font = `${fs}px ${ROMAN}`; const sp = g.measureText(" ").width;
      const lines = []; let line = [], lw = 0, first = !noIndentFirst;
      groups.forEach((gr) => { const w = wW(gr), avail = TW - (first && lines.length === 0 ? indent : 0); if (line.length && lw + sp + w > avail) { lines.push([line, lw]); line = []; lw = 0; } lw += (line.length ? sp : 0) + w; line.push([gr, w]); });
      if (line.length) lines.push([line, lw, true]);
      const y0 = y - fs;
      lines.forEach(([ln, lw2, isLast], li) => {
        const x0 = ML + (li === 0 && first ? indent : 0), avail = TW - (li === 0 && first ? indent : 0);
        const gap = isLast && last ? sp : ln.length > 1 ? (avail - ln.reduce((s, q) => s + q[1], 0)) / (ln.length - 1) : sp;
        let x = x0;
        ln.forEach(([gr, w]) => { let xx = x; gr.forEach(([wd, st]) => { g.font = fontFor(st, fs); g.letterSpacing = st === "s" ? `${fs * 0.16}px` : "0px"; g.fillText(wd, xx, y); xx += g.measureText(wd).width; g.letterSpacing = "0px"; }); x += w + gap; });
        y += lh;
      });
      if (tag) out[tag] = { x0: ML, x1: PW - MR, y0, y1: y - lh + fs * 0.35, firstLineY: y0 + fs };
      y += lh * 0.12;
    }
    for (const it of A_PAGES[pi]) {
      const T = it[0];
      if (T === "h") { g.font = `bold ${FS * 1.32}px ${ROMAN}`; g.textAlign = "center"; const words = it[1].split(" "); const l1 = words.slice(0, 5).join(" "), l2 = words.slice(5).join(" "); g.fillText(l1, PW / 2, y + 20); g.fillText(l2, PW / 2, y + 20 + FS * 1.6); g.textAlign = "left"; y += FS * 1.6 * 2 + 30; }
      else if (T === "au") { g.font = `${FS * 1.1}px ${ROMAN}`; g.textAlign = "center"; g.fillText("von A. ", PW / 2 - 110, y); g.letterSpacing = "7px"; g.textAlign = "left"; g.fillText("Einstein.", PW / 2 - 50, y); g.letterSpacing = "0px"; y += 60; }
      else if (T === "rule") { g.fillRect(PW / 2 - 100, y - 8, 200, 3); y += 60; }
      else if (T === "p") para(it[1], FS, LH, 64, it[3], !it[2], it[4]);
      else if (T === "m") { const b = mathBox(g, it[1], FS * 1.05, ROMAN); y += b.a - FS * 0.55; b.draw(PW / 2 - b.w / 2, y); y += b.d + LH * 0.95; }
      else if (T === "sig") { g.font = `${FS}px ${ROMAN}`; g.letterSpacing = "6px"; g.fillText("Bern", ML + 64, y); g.letterSpacing = "0px"; g.fillText(", September 1905.", ML + 64 + 118, y); y += LH * 1.6; }
      else if (T === "c") { g.font = `${FS * 0.92}px ${ROMAN}`; g.textAlign = "center"; g.fillText(it[1], PW / 2, y); g.textAlign = "left"; y += LH; }
      else if (T === "fn") { const fy = 2820 - (it.length - 1) * 52 - 30; g.fillRect(ML, fy - 52, 260, 2); y = fy; for (let i = 1; i < it.length; i++) para(it[i], FS * 0.8, 46, 40, false, true); }
    }
    g.restore();
    return out;
  }

  // ---------------------------------------------------------------- shared desk + room
  function deskTop(S, key, base, seed, w, d) {
    const top = new THREE.Mesh(new THREE.BoxGeometry(w || 40, 0.4, d || 22), wood(key, base, seed, 0.5, [4, 2])); top.position.y = -0.2; top.receiveShadow = true; S.add(top); return top;
  }

  // ================================================================ PAPER (papers / letter / laugh)
  function journalCover(g, w, h) {
    agedPaper(g, w, h, 77, { tone: "#d9cfb8", age: 1.2, fox: 16 });
    g.fillStyle = "rgba(40,34,28,0.9)"; g.textAlign = "center"; const k = w / 1024;
    g.font = `${30 * k}px ${ROMAN}`; g.fillText("1905.                                                № 13.", w / 2, 120 * k);
    g.font = `bold ${92 * k}px ${ROMAN}`; g.letterSpacing = `${6 * k}px`; g.fillText("ANNALEN", w / 2, 300 * k); g.font = `${40 * k}px ${ROMAN}`; g.fillText("DER", w / 2, 370 * k); g.font = `bold ${92 * k}px ${ROMAN}`; g.fillText("PHYSIK.", w / 2, 480 * k); g.letterSpacing = "0px";
    g.fillRect(w / 2 - 180 * k, 530 * k, 360 * k, 3 * k);
    g.font = `${30 * k}px ${ROMAN}`; ["BEGRÜNDET UND FORTGEFÜHRT DURCH", "F. A. C. GREN, L. W. GILBERT, J. C. POGGENDORFF,", "G. UND E. WIEDEMANN."].forEach((s, i) => g.fillText(s, w / 2, (600 + i * 44) * k));
    g.font = `bold ${46 * k}px ${ROMAN}`; g.fillText("VIERTE FOLGE.", w / 2, 820 * k); g.font = `bold ${64 * k}px ${ROMAN}`; g.fillText("BAND 18.", w / 2, 920 * k);
    g.fillRect(w / 2 - 300 * k, 980 * k, 600 * k, 2 * k);
    g.font = `${34 * k}px ${ROMAN}`; g.fillText("HERAUSGEGEBEN VON", w / 2, 1060 * k); g.font = `bold ${48 * k}px ${ROMAN}`; g.fillText("PAUL DRUDE.", w / 2, 1130 * k);
    g.font = `${34 * k}px ${ROMAN}`; g.fillText("LEIPZIG, 1905.", w / 2, 1340 * k); g.fillText("VERLAG VON JOHANN AMBROSIUS BARTH.", w / 2, 1390 * k);
    g.textAlign = "left"; inkIntoPaper(g, w, h, 77);
  }
  function papersScene(o) {
    const S = darkStage({ bg: 0x0a0908, hemi: 0.05, key: 0.05, rim: 0.1 }), C = cam(30);
    S.fog = new THREE.Fog(0x0a0908, 14, 40);
    deskTop(S, "wDeskP", [96, 60, 38], 31);
    const lamp = spot(S, 0xffd9a8, 240, V(-4.5, 9.5, -5.5), V(0.4, 0, -1.0), 0.36, 0.9);
    const PW = 3.1, PH = PW * 1.5137;
    // stack of issues (left/back)
    const coverT = ctex("annCover", 1024, 1550, journalCover);
    const edgeT = ctex("annEdge", 32, 256, (g) => { for (let y = 0; y < 256; y++) { g.fillStyle = `rgb(${200 + (hash(y, 1, 5) * 30 | 0)},${188 + (hash(y, 2, 5) * 28 | 0)},${160 + (hash(y, 3, 5) * 26 | 0)})`; g.fillRect(0, y, 32, 1); } });
    const edgeM = new THREE.MeshStandardMaterial({ map: edgeT, roughness: 0.95 });
    const stack = new THREE.Group(); stack.position.set(-2.5, 0, -1.9); S.add(stack);
    const r = rnd(12); let yy = 0;
    for (let i = 0; i < 6; i++) {
      const th = 0.12 + r() * 0.05, blk = new THREE.Mesh(new THREE.BoxGeometry(PW - 0.04, th - 0.02, PH - 0.04), edgeM);
      const gI = new THREE.Group(); gI.position.set((r() - 0.5) * 0.25, yy, (r() - 0.5) * 0.25); gI.rotation.y = (r() - 0.5) * 0.12; stack.add(gI);
      blk.position.y = th / 2; gI.add(blk);
      const cv = sheet(coverT, PW, PH, { curl: 0.01, wave: 0.003, seed: 20 + i, lift: th - 0.01, nx: 12, nz: 12 }); gI.add(cv);
      yy += th;
    }
    stack.add(at(contact(PW, PH, 0.55, 0.12), 0, 0.003, 0));
    shadowAll(stack);
    // the open issue's three pages
    const keys = [];
    const pages = [0, 1, 2].map((pi) => {
      const res = pi === 2 ? 2048 : 1024;
      const tex = ctex("annPage" + pi + "_" + res, res, Math.round(res * 1.5137), (g, w, h) => { agedPaper(g, w, h, 300 + pi, { tone: "#ebe2cb", age: 0.9, fox: 6 }); keys[pi] = annalenPage(g, pi, w / 2048); inkIntoPaper(g, w, h, 300 + pi); });
      const m = sheet(tex, PW, PH, { curl: pi === 2 ? 0.05 : 0.025, wave: 0.01, seed: 5 + pi, nx: 50, nz: 60, bumpScale: 0.35 });
      const holder = new THREE.Group(); holder.add(m); S.add(holder);
      const cs = at(contact(PW, PH, 0.45, 0.1), 0, -0.004, 0); holder.add(cs);
      return holder;
    });
    if (!keys[2]) keys[2] = TC.__annKey; else TC.__annKey = keys[2];
    // fanned layout (final) and stacked layout (start): pages slide out from under the top issue
    const FAN = [[-0.3, 0.004, -1.3, 0.3], [1.3, 0.07, -1.05, 0.1], [2.95, 0.14, -0.7, -0.05]];
    const START = [-2.5, 0.75, -1.9, 0.0];
    const key = keys[2] && keys[2].KEY;
    // key sentence position on page 3 (local, design px -> page units)
    const kx = (px) => px / 2048 * PW - PW / 2, kz = (py) => py / (2048 * 1.5137) * PH - PH / 2;
    const kLocal = key ? V(kx((key.x0 + key.x1) / 2), 0.03, kz(key.firstLineY + 20)) : V(0, 0.03, 1);
    const kRight = key ? V(kx(key.x1), 0.03, kz(key.firstLineY - 14)) : V(1, 0.03, 1);
    const pageLocal = (pi, lx, lz) => { const f = FAN[pi]; return V(lx, 0.03, lz).applyAxisAngle(UP, f[3]).add(V(f[0], f[1], f[2])); };
    const KS = pageLocal(2, kLocal.x, kLocal.z);
    // the light pool for the key sentence: one soft spot with an elliptical gobo, long axis along the printed line
    const goboT = ctex("poolGobo", 256, 256, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.save(); g.translate(w / 2, h / 2); g.scale(1, 0.34); const gr = g.createRadialGradient(0, 0, 0, 0, 0, w * 0.48); gr.addColorStop(0, "#fff"); gr.addColorStop(0.45, "rgba(255,255,255,0.75)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(-w, -h * 3, w * 2, h * 6); g.restore(); });
    const KP = KS.clone().add(V(0, 0, 0.14)); // the lit ellipse lands ~0.22 up-page of the aim point (measured), so aim lower
    const pool = spot(S, 0xffe2b8, 0, V(KP.x - 0.1, 7.4, KP.z + 0.3), KP, 0.17, 0.2, true);
    pool.map = goboT; pool.shadow.mapSize.set(512, 512); pool.shadow.camera.up.set(Math.sin(-FAN[2][3]), 0, -Math.cos(FAN[2][3]));
    const E = EV.paper, T0 = o.T0;
    // camera keys in film time
    const P3 = pageLocal(2, 0, 0), top3 = pageLocal(2, 0, -PH * 0.32), mid3 = pageLocal(2, 0, PH * 0.05);
    const K = [
      [84.08, -2.7, 0.9, -1.6, 7.2, -30, 40, 0, 40],
      [86.6, -2.2, 0.7, -1.5, 6.6, -18, 44, 0, 30],
      [88.5, 0.2, 0.3, -1.3, 10.5, -8, 50, -330, 190],
      [91.5, 1.1, 0.1, -1.0, 9.0, -3, 54, -360, 210],
      [93.4, 1.6, 0.1, -0.95, 8.2, -1, 55, -380, 220],
      [94.3, mid3.x, 0.1, mid3.z, 4.2, 2, 58, -60, 140],
      [E.aside, KS.x, 0.1, KS.z, 3.7, 3, 60, 0, 240],
      [99.84, KS.x - 0.05, 0.1, KS.z + 0.05, 3.4, 0, 62, 0, 255],
    ];
    return (t) => {
      const ft = T0 + t;
      // pages slide from under the top issue into a fan (88.5 -> 90.3), top page last
      pages.forEach((h, pi) => {
        const k = smooth((ft - E.fan - pi * 0.18) / 1.5), f = FAN[pi], arc = Math.sin(k * Math.PI) * 0.18;
        h.position.set(lerp(START[0], f[0], k), lerp(START[1] + pi * 0.004, f[1], k) + arc, lerp(START[2], f[2], k));
        h.rotation.set(-Math.sin(k * Math.PI) * 0.03, lerp(START[3] + pi * 0.02, f[3], k), Math.sin(k * Math.PI) * 0.04);
        h.visible = ft > E.fan - 0.05;
        h.children[1].visible = k > 0.98;
      });
      const pk = seg(ft, E.sentence, E.aside);
      pool.intensity = 150 * pk;
      lamp.intensity = lerp(240, 70, pk) * lerp(1, 0.02, seg(ft, E.aside - 0.3, 96.4));
      camKeys(C, K, ft);
      return [S, C];
    };
  }

  LABK.paper = (o) => {
    if (o.mode === "papers") return papersScene(o);
    return letterScene(o);
  };
  // ---------------------------------------------------------------- handwriting (illegible steel-nib cursive, procedural strokes — no real or fake words)
  // glyph skeletons in x-height units (y up = negative), joined into one stroke per word
  const GLY = {
    n: [[0, 0], [0.14, -1], [0.26, -0.2], [0.3, 0], [0.42, -0.95], [0.6, -0.9], [0.66, 0], [0.82, -0.35]],
    m: [[0, 0], [0.12, -1], [0.22, 0], [0.32, -0.95], [0.46, -0.9], [0.5, 0], [0.6, -0.95], [0.76, -0.9], [0.8, 0], [0.95, -0.35]],
    e: [[0, 0], [0.32, -0.55], [0.3, -0.85], [0.12, -0.72], [0.1, -0.25], [0.3, 0.02], [0.5, -0.25]],
    l: [[0, 0], [0.34, -1.6], [0.36, -2.25], [0.18, -2.3], [0.14, -1.7], [0.22, -0.2], [0.34, 0.02], [0.5, -0.3]],
    h: [[0, 0], [0.32, -1.6], [0.34, -2.3], [0.16, -2.2], [0.14, -1.4], [0.12, 0], [0.26, -0.9], [0.44, -0.85], [0.46, 0], [0.62, -0.35]],
    o: [[0, 0], [0.2, -0.85], [0.42, -0.98], [0.5, -0.5], [0.32, -0.02], [0.14, -0.3], [0.3, -0.92], [0.62, -0.85]],
    a: [[0, 0], [0.34, -0.9], [0.14, -0.88], [0.06, -0.35], [0.2, -0.02], [0.4, -0.5], [0.42, -0.95], [0.44, -0.1], [0.6, -0.3]],
    g: [[0, 0], [0.34, -0.9], [0.12, -0.85], [0.06, -0.3], [0.24, -0.05], [0.42, -0.95], [0.38, 0.6], [0.24, 1.25], [0.04, 1.1], [0.2, 0.45], [0.55, -0.15]],
    i: [[0, 0], [0.14, -1], [0.2, -0.05], [0.36, -0.35]],
    u: [[0, 0], [0.12, -1], [0.14, -0.1], [0.3, -0.05], [0.4, -1], [0.42, -0.05], [0.58, -0.35]],
    s: [[0, 0], [0.24, -0.5], [0.36, -1.05], [0.22, -0.7], [0.36, -0.2], [0.2, 0.02], [0.02, -0.1], [0.3, 0.0], [0.5, -0.3]],
    d: [[0, 0], [0.34, -0.9], [0.12, -0.85], [0.06, -0.3], [0.22, -0.03], [0.42, -0.6], [0.54, -2.2], [0.44, -2.1], [0.46, -0.1], [0.62, -0.3]],
    r: [[0, 0], [0.14, -0.95], [0.24, -0.6], [0.36, -0.95], [0.38, -0.2], [0.52, -0.4]],
    t: [[0, 0], [0.2, -1.6], [0.18, -0.2], [0.3, 0.0], [0.46, -0.35]],
    z: [[0, 0], [0.14, -0.95], [0.4, -0.95], [0.1, -0.05], [0.42, 0.1], [0.34, 0.9], [0.16, 1.05], [0.3, 0.5], [0.55, -0.2]],
  };
  const FREQ = "eennnmiirrsstthhllaaoouudggz";
  // draws lines of illegible cursive; o: {x, y, w, lh, xh, seed, ink, lines, indent(li), lastShort, pen, slant}
  function handwriting(g, o) {
    const r = rnd(o.seed), xh = o.xh, sl = o.slant === undefined ? 0.42 : o.slant, base = o.pen || xh * 0.08;
    let dip = 1;
    for (let li = 0; li < o.lines; li++) {
      let x = o.x + (o.indent && o.indent(li) ? o.w * 0.08 : 0);
      const y0 = o.y + li * o.lh, xEnd = o.x + o.w * (li === o.lines - 1 && o.lastShort ? 0.35 + r() * 0.3 : 0.94 + r() * 0.05);
      if (li % 4 === 0) dip = 1;
      while (x < xEnd) {
        const nL = 2 + Math.floor(r() * 7), pts = [], dots = []; let cx = x;
        const drift = (r() - 0.5) * xh * 0.12;
        for (let k = 0; k < nL; k++) {
          let ch = FREQ[Math.floor(r() * FREQ.length)];
          if (k === 0 && r() < 0.18) ch = "l";
          const G = GLY[ch], sx = xh * (0.6 + r() * 0.22), sy = xh * (0.95 + r() * 0.2);
          G.forEach(([gx, gy], q) => { if (k > 0 && q === 0) return; pts.push([cx + gx * sx - gy * sy * sl, y0 + drift + gy * sy + (r() - 0.5) * xh * 0.05]); });
          if (ch === "i" || ch === "u") dots.push([cx + sx * 0.2 + 1.5 * sy * sl, y0 + drift - sy * 1.5, ch]);
          cx += G[G.length - 1][0] * sx + xh * 0.04;
        }
        if (cx > o.x + o.w * 1.02) break;
        const sm = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(i - 1, 0)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(i + 2, pts.length - 1)]; for (let s2 = 0; s2 < 6; s2++) { const u = s2 / 6, u2 = u * u, u3 = u2 * u; sm.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * u + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * u2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * u3), 0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * u + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * u2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * u3)]); } } sm.push(pts[pts.length - 1]);
        // steel nib: thick on down-strokes, hairline on up-strokes; ink thins as the pen runs dry
        g.lineCap = "round"; const a0 = o.ink[3] * (0.62 + 0.38 * dip);
        for (let i = 1; i < sm.length; i++) {
          const dx = sm[i][0] - sm[i - 1][0], dy = sm[i][1] - sm[i - 1][1], L = Math.hypot(dx, dy) || 1, down = Math.max(0, dy / L);
          g.strokeStyle = `rgba(${o.ink[0]},${o.ink[1]},${o.ink[2]},${a0 * (0.8 + 0.2 * down)})`; g.lineWidth = base * (0.3 + 1.9 * down * down);
          g.beginPath(); g.moveTo(sm[i - 1][0], sm[i - 1][1]); g.lineTo(sm[i][0], sm[i][1]); g.stroke();
        }
        dots.forEach(([dx2, dy2, ch]) => { g.fillStyle = g.strokeStyle = `rgba(${o.ink[0]},${o.ink[1]},${o.ink[2]},${a0})`; if (ch === "u") { g.lineWidth = base * 0.6; g.beginPath(); g.arc(dx2, dy2 + xh * 0.2, xh * 0.18, 0.2, Math.PI - 0.2); g.stroke(); } else { g.beginPath(); g.arc(dx2, dy2, base * 0.8, 0, TAU); g.fill(); } });
        dip *= 0.965; x = cx + xh * (0.45 + r() * 0.35);
      }
    }
  }
  function flourish(g, x, y, w, xh, seed, ink) {
    handwriting(g, { x, y, w, lh: 0, xh: xh * 1.3, seed, ink, lines: 1, pen: xh * 0.1 });
    g.strokeStyle = `rgba(${ink[0]},${ink[1]},${ink[2]},${ink[3] * 0.8})`; g.lineWidth = xh * 0.07; g.beginPath(); g.moveTo(x, y + xh * 0.9); g.bezierCurveTo(x + w * 0.3, y + xh * 1.4, x + w * 0.7, y + xh * 0.4, x + w * 1.05, y + xh * 0.8); g.stroke();
  }
  const IRON = [42, 30, 22, 0.92];   // iron-gall ink, brown-black

  function letterTex() {
    return ctex("letterPage", 1536, 2048, (g, w, h) => {
      agedPaper(g, w, h, 905, { tone: "#efe7d4", age: 0.7, fox: 8 });
      g.strokeStyle = "rgba(120,140,170,0.14)"; g.lineWidth = 1.5; for (let y = 300; y < h - 120; y += 76) { g.beginPath(); g.moveTo(90, y); g.lineTo(w - 90, y); g.stroke(); }
      handwriting(g, { x: w * 0.6, y: 190, w: w * 0.3, lh: 0, xh: 24, seed: 11, ink: IRON, lines: 1 });
      handwriting(g, { x: 150, y: 290, w: w * 0.35, lh: 0, xh: 27, seed: 12, ink: IRON, lines: 1 });
      handwriting(g, { x: 150, y: 366, w: w - 290, lh: 76, xh: 25, seed: 13, ink: IRON, lines: 19, indent: (li) => li === 0 || li === 7 || li === 13, lastShort: true });
      handwriting(g, { x: w * 0.42, y: 290 + 76 * 20, w: w * 0.3, lh: 0, xh: 24, seed: 14, ink: IRON, lines: 1 });
      flourish(g, w * 0.55, 294 + 76 * 21, w * 0.22, 26, 15, IRON);
      for (const fy of [h / 3, 2 * h / 3]) { const gr = g.createLinearGradient(0, fy - 14, 0, fy + 14); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.45, "rgba(90,70,45,0.16)"); gr.addColorStop(0.55, "rgba(255,255,255,0.18)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(0, fy - 14, w, 28); }
      inkIntoPaper(g, w, h, 905);
    });
  }
  function envelopeTex() {
    return ctex("envelope", 1536, 1024, (g, w, h) => {
      agedPaper(g, w, h, 1905, { tone: "#e3d5b6", age: 1.1, fox: 12 });
      g.strokeStyle = "rgba(110,85,50,0.12)"; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(w / 2, h * 0.55); g.lineTo(w, 0); g.stroke();
      // stamp (Swiss numeral type 'HELVETIA') top right
      g.save(); g.translate(w - 250, 60); g.rotate(0.03);
      g.fillStyle = "#f2ead8"; for (let i = 0; i <= 14; i++) for (const [px, py] of [[i * 12.5, 0], [i * 12.5, 220], [0, i * 15.7], [175, i * 15.7]]) { g.beginPath(); g.arc(px, py, 4.5, 0, TAU); g.fill(); }
      g.fillStyle = "#efe5cf"; g.fillRect(4, 4, 167, 212); g.fillStyle = "#b5473f"; g.fillRect(14, 14, 147, 192); g.fillStyle = "#efe5cf"; g.fillRect(24, 44, 127, 122);
      g.fillStyle = "#b5473f"; g.beginPath(); g.moveTo(52, 62); g.lineTo(124, 62); g.lineTo(124, 112); g.quadraticCurveTo(124, 150, 88, 160); g.quadraticCurveTo(52, 150, 52, 112); g.closePath(); g.fill();
      g.fillStyle = "#efe5cf"; g.fillRect(81, 76, 14, 64); g.fillRect(65, 101, 46, 14);
      g.font = `bold 24px ${ROMAN}`; g.textAlign = "center"; g.fillText("HELVETIA", 88, 37); g.font = `bold 30px ${ROMAN}`; g.fillText("10", 44, 196); g.fillText("10", 132, 196);
      g.restore();
      // postmark 'BERN' / '1905' and wavy cancel lines
      const pmX = w - 400, pmY = 250; g.strokeStyle = "rgba(30,28,34,0.75)"; g.fillStyle = "rgba(30,28,34,0.75)"; g.lineWidth = 7;
      g.beginPath(); g.arc(pmX, pmY, 150, 0, TAU); g.stroke(); g.lineWidth = 4; g.beginPath(); g.arc(pmX, pmY, 98, 0, TAU); g.stroke();
      g.font = `bold 48px ${ROMAN}`; g.textAlign = "center"; const word = "BERN"; for (let i = 0; i < word.length; i++) { const a = -Math.PI / 2 + (i - 1.5) * 0.36; g.save(); g.translate(pmX + Math.cos(a) * 123, pmY + Math.sin(a) * 123); g.rotate(a + Math.PI / 2); g.fillText(word[i], 0, 16); g.restore(); }
      g.font = `bold 46px ${ROMAN}`; g.fillText("1905", pmX, pmY + 16);
      g.lineWidth = 4; for (let k = 0; k < 4; k++) { g.beginPath(); for (let x = pmX + 160; x < w - 40; x += 6) { const y = 120 + k * 34 + Math.sin(x / 26) * 9; if (x === pmX + 160) g.moveTo(x, y); else g.lineTo(x, y); } g.stroke(); }
      g.textAlign = "left";
      handwriting(g, { x: 520, y: 520, w: 700, lh: 92, xh: 30, seed: 21, ink: IRON, lines: 3, lastShort: true, indent: (li) => li > 0 });
      inkIntoPaper(g, w, h, 1905);
    });
  }
  // candle flame: billboard with a procedural teardrop shader (warm, not neon)
  function flameMesh() {
    return new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { uT: { value: 0 }, uA: { value: 1 } },
      vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
      fragmentShader: `uniform float uT, uA; varying vec2 vUv;
        void main(){ vec2 p = vUv - vec2(0.5, 0.18); float y = p.y; float sway = sin(uT * 7.1 + y * 6.0) * 0.012 * y + sin(uT * 13.3) * 0.006 * y;
          p.x -= sway * 4.0; float wdt = 0.16 * sqrt(max(0.0, 1.0 - y / 0.72)) * smoothstep(-0.12, 0.08, y);
          float d = abs(p.x) / max(wdt, 1e-3); float body = smoothstep(1.0, 0.55, d) * smoothstep(0.74, 0.35, y) * smoothstep(-0.13, -0.02, y);
          float core = smoothstep(0.6, 0.0, d) * smoothstep(0.42, 0.08, y) * smoothstep(-0.06, 0.04, y);
          float blue = smoothstep(0.9, 0.3, d) * smoothstep(0.12, -0.02, y) * smoothstep(-0.12, -0.04, y);
          vec3 c = vec3(1.0, 0.55, 0.18) * body * 1.3 + vec3(1.0, 0.86, 0.6) * core * 1.6 + vec3(0.25, 0.35, 0.9) * blue * 0.5;
          gl_FragColor = vec4(c * uA, 1.0);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,
    }));
  }
  function candle(S) {
    const g = new THREE.Group(); S.add(g);
    const brass = new THREE.MeshStandardMaterial({ color: 0xb08d57, metalness: 1, roughness: 0.32, envMapIntensity: 0.6 });
    const V2 = (x, y) => new THREE.Vector2(x, y);
    g.add(new THREE.Mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.62, 0), V2(0.68, 0.05), V2(0.64, 0.1), V2(0.2, 0.12), V2(0.17, 0.4), V2(0.22, 0.46), V2(0, 0.46)], 48), brass));
    const wax = new THREE.MeshStandardMaterial({ color: 0xc4b596, roughness: 0.6, emissive: 0xff9a40, emissiveIntensity: 0 });
    const body = new THREE.Mesh(new THREE.LatheGeometry([V2(0, 0), V2(0.17, 0), V2(0.17, 0.62), V2(0.15, 0.7), V2(0.09, 0.66), V2(0, 0.64)], 40), wax); body.position.y = 0.44; g.add(body);
    const wick = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.01, 0.12, 6), M.matte(0x1a1410)); wick.position.y = 1.14; g.add(wick);
    const flame = flameMesh(); flame.scale.set(0.34, 0.62, 1); flame.position.y = 1.08 + 0.2; g.add(flame);
    const halo = glowSprite(0xffb46a, 1.2, 0.16); halo.position.copy(flame.position); halo.position.y += 0.06; g.add(halo);
    shadowAll(g); flame.castShadow = flame.receiveShadow = false;
    return { g, flame, halo, wax, tip: V(0, 1.28, 0) };
  }
  function dipPen() {
    const g = new THREE.Group();
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 2.0, 24), new THREE.MeshStandardMaterial({ color: 0x2a1a12, roughness: 0.35, envMapIntensity: 0.6 })); holder.rotation.z = Math.PI / 2; g.add(holder);
    const ferrule = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.05, 0.28, 24), new THREE.MeshStandardMaterial({ color: 0xa88a5a, metalness: 1, roughness: 0.3 })); ferrule.rotation.z = Math.PI / 2; ferrule.position.x = 1.14; g.add(ferrule);
    const nibS = new THREE.Shape(); nibS.moveTo(0, -0.045); nibS.quadraticCurveTo(0.2, -0.05, 0.36, 0); nibS.quadraticCurveTo(0.2, 0.05, 0, 0.045); nibS.closePath();
    const nib = new THREE.Mesh(new THREE.ExtrudeGeometry(nibS, { depth: 0.006, bevelEnabled: false }), new THREE.MeshStandardMaterial({ color: 0x55585e, metalness: 1, roughness: 0.25 })); nib.rotation.x = Math.PI / 2; nib.position.set(1.27, 0, 0); g.add(nib);
    shadowAll(g); return g;
  }
  function inkwell() {
    const g = new THREE.Group();
    const glass = new THREE.MeshPhysicalMaterial({ color: 0xd9e4e0, roughness: 0.06, metalness: 0, transmission: 0.85, thickness: 0.4, transparent: true, opacity: 0.6, envMapIntensity: 0.9 });
    const body = new THREE.Mesh(roundBox(0.9, 0.62, 0.9, 0.08), glass); body.position.y = 0.31; g.add(body);
    const ink = new THREE.Mesh(roundBox(0.7, 0.4, 0.7, 0.06), new THREE.MeshStandardMaterial({ color: 0x120c0a, roughness: 0.15 })); ink.position.y = 0.24; g.add(ink);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 0.14, 32), new THREE.MeshStandardMaterial({ color: 0x6e5a3a, metalness: 1, roughness: 0.55 })); cap.position.y = 0.69; g.add(cap);
    shadowAll(g); return g;
  }

  function letterScene(o) {
    const late = o.mode === "laugh";
    const S = darkStage({ bg: 0x090807, hemi: late ? 0.08 : 0.06, key: 0.04, rim: late ? 0.06 : 0.12 }), C = cam(30);
    S.fog = new THREE.Fog(0x090807, 16, 40);
    deskTop(S, "wDeskL", [84, 52, 34], 47);
    const LW = 2.7, LH = 3.6;
    const letter = sheet(letterTex(), LW, LH, { curl: 0.05, wave: 0.008, seed: 9, nx: 40, nz: 60, folds: [[-1 / 3, 0.022]], bumpScale: 0.45 });
    letter.position.set(0.75, 0.012, -1.05); letter.rotation.y = -0.12; S.add(letter);
    const cl0 = contact(LW, LH, 0.5, 0.08); cl0.position.set(0.75, 0.004, -1.05); cl0.rotation.y = -0.12; S.add(cl0);
    const env = sheet(envelopeTex(), 3.0, 2.0, { curl: 0.02, wave: 0.004, seed: 4, nx: 24, nz: 16 });
    env.position.set(2.9, 0.006, -1.7); env.rotation.y = 0.42; S.add(env);
    const ce = contact(3.0, 2.0, 0.45, 0.08); ce.position.set(2.9, 0.002, -1.7); ce.rotation.y = 0.42; S.add(ce);
    const pen = dipPen(); pen.position.set(-0.45, 0.06, 0.45); pen.rotation.y = 0.62; S.add(pen);
    const iw = inkwell(); iw.position.set(-1.3, 0, -2.6); iw.rotation.y = 0.3; S.add(iw);
    const cnd = candle(S); cnd.g.position.set(-2.4, 0, -1.5);
    const flamePos = cnd.tip.clone().add(cnd.g.position);
    // the candle is the one light: an omni point light with soft shadows at the flame
    const cl = new THREE.PointLight(0xffa860, late ? 0 : 34, 0, 2); cl.position.copy(flamePos).add(V(0, 0.08, 0)); S.add(cl);
    const cf = new THREE.PointLight(0xffa860, late ? 0 : 9, 0, 2); cf.position.copy(cl.position); S.add(cf); // unshadowed share: a flame is a volume, so its shadows are soft and never black
    cl.castShadow = !late; cl.shadow.mapSize.set(1024, 1024); cl.shadow.bias = -0.0005; cl.shadow.normalBias = 0.02; cl.shadow.camera.near = 0.05;
    cnd.flame.visible = cnd.halo.visible = !late;
    if (late) {
      // late afternoon sun through a mullioned window (gobo), low and warm, from the right
      const gob = ctex("winGobo", 512, 512, (g, w, h) => { g.fillStyle = "#000"; g.fillRect(0, 0, w, h); g.filter = "blur(6px)"; g.fillStyle = "#fff"; const pw = 150, ph = 190; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) g.fillRect(96 + i * (pw + 22), 50 + j * (ph + 22), pw, ph); });
      const sun = spot(S, 0xffb878, 380, V(9, 5.2, -3.5), V(0.4, 0, 0.0), 0.5, 0.5);
      sun.map = gob;
    }
    const T0 = o.T0;
    const K = late
      ? [[636.52, 1.5, 0, -1.25, 7.6, 4, 47, -120, 120], [640.76, 1.6, 0, -1.3, 7.3, 8, 48, -120, 120]]
      : [[99.84, 0.9, 0, -1.2, 10.4, -16, 46, -300, 200], [105.5, 1.3, 0, -1.25, 9.7, -11, 47, -340, 235], [111.62, 1.7, 0, -1.3, 9.3, -7, 48, -380, 255]];
    return (t) => {
      const ft = T0 + t;
      if (!late) {
        const fl = 0.88 + 0.07 * Math.sin(ft * 9.3) + 0.05 * Math.sin(ft * 23.7 + 1.3) + 0.04 * (vn(ft * 6, 0.5, 3) - 0.5);
        cl.intensity = 28 * fl; cf.intensity = 9 * fl; cnd.flame.material.uniforms.uT.value = ft; cnd.flame.scale.set(0.34, 0.62 * (0.94 + 0.08 * fl), 1);
        cnd.wax.emissiveIntensity = 0.08 * fl;
      }
      camKeys(C, K, ft);
      cnd.flame.quaternion.copy(C.quaternion); // billboard
      return [S, C];
    };
  }

  // ---------------------------------------------------------------- pencil handwriting (readable maths, jittered glyphs)
  const HANDF = "'Segoe Print', 'Ink Free', cursive";
  function pencil(g, str, x, y, fs, seed, col) {
    const r = rnd(seed); col = col || [62, 62, 68];
    for (const ch of str) {
      const sc = 1 + (r() - 0.5) * 0.1, rot = (r() - 0.5) * 0.08, a = 0.72 + r() * 0.22;
      g.save(); g.translate(x, y + (r() - 0.5) * fs * 0.06); g.rotate(rot); g.scale(sc, sc);
      g.font = `${fs}px ${HANDF}`; g.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${a})`; g.fillText(ch, 0, 0);
      g.globalAlpha = 0.35; g.fillText(ch, fs * 0.012, fs * 0.01); g.globalAlpha = 1;
      g.restore();
      g.font = `${fs}px ${HANDF}`; x += g.measureText(ch).width * sc * 0.96;
    }
    return x;
  }
  const GRAPH = [64, 64, 70, 0.8];
  function squared(g, w, h, step, col) { g.strokeStyle = col || "rgba(110,140,170,0.22)"; g.lineWidth = 1.2; for (let x = step / 2; x < w; x += step) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); } for (let y = step / 2; y < h; y += step) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); } }

  // ================================================================ PATENT — Swiss Patent Office, Bern, 1905
  function patentFormTex(seed) {
    return ctex("patForm" + seed, 1024, 1400, (g, w, h) => {
      agedPaper(g, w, h, seed, { tone: "#ece3cc", age: 0.8, fox: 6 });
      g.fillStyle = "rgba(34,30,28,0.9)"; g.textAlign = "center";
      g.font = `bold 34px ${ROMAN}`; g.fillText("SCHWEIZERISCHE EIDGENOSSENSCHAFT", w / 2, 120);
      g.font = `26px ${ROMAN}`; g.fillText("Eidgenössisches Amt für geistiges Eigentum", w / 2, 165);
      g.fillRect(w / 2 - 260, 190, 520, 2);
      g.font = `bold 52px ${ROMAN}`; g.letterSpacing = "8px"; g.fillText("PATENTGESUCH", w / 2, 270); g.letterSpacing = "0px";
      g.textAlign = "left"; g.font = `26px ${ROMAN}`;
      [["Nr.", 330], ["Gegenstand der Erfindung:", 420], ["Name des Erfinders:", 560], ["Wohnort:", 640], ["Beschreibung:", 730]].forEach(([s, y]) => { g.fillText(s, 90, y); g.fillStyle = "rgba(60,50,40,0.35)"; g.fillRect(g.measureText(s).width + 110, y + 6, w - 200 - g.measureText(s).width, 1.5); g.fillStyle = "rgba(34,30,28,0.9)"; });
      handwriting(g, { x: 150, y: 330, w: 220, lh: 0, xh: 20, seed: seed + 1, ink: IRON, lines: 1 });
      handwriting(g, { x: 450, y: 420, w: 470, lh: 60, xh: 20, seed: seed + 2, ink: IRON, lines: 2, lastShort: true });
      handwriting(g, { x: 380, y: 560, w: 400, lh: 0, xh: 20, seed: seed + 3, ink: IRON, lines: 1 });
      handwriting(g, { x: 230, y: 640, w: 300, lh: 0, xh: 20, seed: seed + 4, ink: IRON, lines: 1 });
      handwriting(g, { x: 90, y: 800, w: w - 180, lh: 60, xh: 20, seed: seed + 5, ink: IRON, lines: 8, lastShort: true, indent: (li) => li === 0 });
      inkIntoPaper(g, w, h, seed);
    });
  }
  // sepia ink drawing of a clock mechanism (gear train + anchor escapement + pendulum)
  function drawingTex() {
    return ctex("patDrawing", 1400, 1000, (g, w, h) => {
      agedPaper(g, w, h, 71, { tone: "#efe6cf", age: 1, fox: 9 });
      const ink = "rgba(92,58,32,0.88)"; g.strokeStyle = ink; g.fillStyle = ink; g.lineCap = "round"; g.lineJoin = "round";
      g.lineWidth = 3; g.strokeRect(50, 50, w - 100, h - 100); g.lineWidth = 1.2; g.strokeRect(62, 62, w - 124, h - 124);
      const gear = (cx, cy, R, n, hub) => { g.lineWidth = 2.2; g.beginPath(); for (let i = 0; i <= n * 4; i++) { const a = i / (n * 4) * TAU, k = i % 4, rr = k === 1 || k === 2 ? R : R * 0.9; const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; if (i) g.lineTo(x, y); else g.moveTo(x, y); } g.stroke(); g.lineWidth = 1.2; g.beginPath(); g.arc(cx, cy, R * 0.72, 0, TAU); g.stroke(); for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.3; g.beginPath(); g.moveTo(cx + Math.cos(a) * hub * 1.4, cy + Math.sin(a) * hub * 1.4); g.lineTo(cx + Math.cos(a) * R * 0.72, cy + Math.sin(a) * R * 0.72); g.stroke(); } g.lineWidth = 2; g.beginPath(); g.arc(cx, cy, hub, 0, TAU); g.stroke(); g.beginPath(); g.arc(cx, cy, hub * 0.35, 0, TAU); g.fill(); };
      gear(420, 380, 150, 40, 22); gear(640, 300, 70, 16, 12); gear(760, 420, 105, 30, 16); gear(905, 330, 45, 10, 9);
      // escapement anchor + pendulum
      g.lineWidth = 2.4; g.beginPath(); g.moveTo(905, 250); g.lineTo(960, 200); g.lineTo(1015, 250); g.moveTo(960, 200); g.lineTo(960, 160); g.stroke();
      g.lineWidth = 2; g.beginPath(); g.moveTo(960, 160); g.lineTo(1010, 780); g.stroke(); g.beginPath(); g.ellipse(1012, 800, 46, 30, 0.08, 0, TAU); g.stroke();
      // plates (dashed) and axles
      g.setLineDash([14, 8]); g.lineWidth = 1.2; g.strokeRect(220, 170, 860, 420); g.setLineDash([]);
      for (const [x, y] of [[420, 380], [640, 300], [760, 420], [905, 330]]) { g.beginPath(); g.moveTo(x, 150); g.lineTo(x, 610); g.stroke(); }
      // dimension line + leader labels
      g.lineWidth = 1; g.beginPath(); g.moveTo(270, 660); g.lineTo(570, 660); g.stroke(); g.beginPath(); g.moveTo(270, 650); g.lineTo(270, 670); g.moveTo(570, 650); g.lineTo(570, 670); g.stroke();
      g.font = `italic 30px ${ROMAN}`; [["a", 300, 250], ["b", 660, 210], ["c", 820, 540], ["d", 1040, 190], ["e", 1060, 820]].forEach(([s, x, y]) => g.fillText(s, x, y));
      g.font = `italic 40px ${ROMAN}`; g.fillText("Fig. 1.", 160, 860);
      // side elevation, small
      g.lineWidth = 1.8; g.strokeRect(220, 720, 420, 120); [300, 400, 470, 560].forEach((x, i) => { g.strokeRect(x - 6, 700, 12, 160); g.strokeRect(x - 30 + i * 3, 740, 60 - i * 6, 80); });
      g.font = `italic 30px ${ROMAN}`; g.fillText("Fig. 2.", 680, 860);
      inkIntoPaper(g, w, h, 71);
    });
  }
  // open squared notebook: Einstein's 1905 transformation equations in pencil (from "Zur Elektrodynamik bewegter Körper", § 3)
  function notebookTex() {
    return ctex("notebook", 2048, 1366, (g, w, h) => {
      agedPaper(g, w, h, 1881, { tone: "#efe9d8", age: 0.5, fox: 4 });
      squared(g, w, h, 40);
      const gr = g.createLinearGradient(w / 2 - 60, 0, w / 2 + 60, 0); gr.addColorStop(0, "rgba(0,0,0,0)"); gr.addColorStop(0.5, "rgba(60,45,30,0.14)"); gr.addColorStop(1, "rgba(0,0,0,0)"); g.fillStyle = gr; g.fillRect(w / 2 - 60, 0, 120, h);
      g.save(); g.translate(w / 2, 0); // notes + sketch on the right page
      handwriting(g, { x: 110, y: 150, w: 820, lh: 80, xh: 22, seed: 501, ink: GRAPH, lines: 5, lastShort: true, indent: (li) => li === 0 });
      g.strokeStyle = "rgba(64,64,70,0.75)"; g.lineWidth = 3;
      const ax = (x0, y0, lab1, lab2) => { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x0 + 300, y0); g.moveTo(x0, y0); g.lineTo(x0, y0 - 220); g.stroke(); pencil(g, lab1, x0 + 310, y0 + 14, 40, x0); pencil(g, lab2, x0 - 16, y0 - 236, 40, x0 + 1); };
      ax(160, 900, "x", "y"); ax(520, 980, "ξ", "η");
      g.beginPath(); g.moveTo(560, 1060); g.lineTo(760, 1060); g.stroke(); g.beginPath(); g.moveTo(760, 1060); g.lineTo(735, 1048); g.moveTo(760, 1060); g.lineTo(735, 1072); g.stroke(); pencil(g, "v", 650, 1105, 40, 77);
      handwriting(g, { x: 110, y: 1220, w: 760, lh: 0, xh: 22, seed: 502, ink: GRAPH, lines: 1 });
      g.restore();
      g.save(); g.translate(-w / 2, 0); // the transformation goes on the LEFT page (the right page lies under the files)
      let y = 210; const x0 = w / 2 + 130, fs = 64;
      pencil(g, "ξ = β (x − vt)", x0, y, fs, 601); y += 130;
      pencil(g, "η = y", x0, y, fs, 602); y += 130;
      pencil(g, "ζ = z", x0, y, fs, 603); y += 150;
      let xx = pencil(g, "τ = β ( t − ", x0, y, fs, 604); pencil(g, "v", xx + 10, y - 40, fs * 0.8, 605); g.fillStyle = "rgba(64,64,70,0.8)"; g.fillRect(xx - 4, y - 22, 92, 4); pencil(g, "V²", xx, y + 46, fs * 0.8, 606); pencil(g, "x )", xx + 100, y, fs, 607); y += 190;
      xx = pencil(g, "β = ", x0, y, fs, 608); pencil(g, "1", xx + 150, y - 46, fs * 0.8, 609); g.fillRect(xx, y - 22, 330, 4);
      g.strokeStyle = "rgba(64,64,70,0.8)"; g.lineWidth = 4; g.beginPath(); g.moveTo(xx + 10, y + 40); g.lineTo(xx + 26, y + 34); g.lineTo(xx + 46, y + 68); g.lineTo(xx + 70, y + 8); g.lineTo(xx + 330, y + 6); g.stroke();
      pencil(g, "1 − v²/V²", xx + 84, y + 58, fs * 0.72, 610);
      // underline + a box around the result
      g.lineWidth = 3; g.beginPath(); g.moveTo(x0 - 20, 1180); g.bezierCurveTo(x0 + 200, 1170, x0 + 500, 1192, x0 + 700, 1176); g.stroke();
      handwriting(g, { x: x0, y: 1250, w: 700, lh: 0, xh: 22, seed: 503, ink: GRAPH, lines: 1 });
      g.restore();
      inkIntoPaper(g, w, h, 1881);
    });
  }
  function pocketWatch() {
    const g = new THREE.Group();
    const caseM = new THREE.MeshStandardMaterial({ color: 0xc9b07a, metalness: 1, roughness: 0.22, envMapIntensity: 0.9 });
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.16, 64), caseM); rim.position.y = 0.08; g.add(rim);
    const bez = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.045, 16, 64), caseM); bez.rotation.x = Math.PI / 2; bez.position.y = 0.17; g.add(bez);
    const dialT = ctex("watchDial", 512, 512, (c, w, h) => {
      c.fillStyle = "#e3d9c4"; c.fillRect(0, 0, w, h); const cx = w / 2; c.strokeStyle = "#2a2622"; c.fillStyle = "#2a2622";
      c.lineWidth = 3; c.beginPath(); c.arc(cx, cx, 236, 0, TAU); c.stroke();
      for (let i = 0; i < 60; i++) { const a = i / 60 * TAU; c.lineWidth = i % 5 ? 2 : 4; c.beginPath(); c.moveTo(cx + Math.cos(a) * 226, cx + Math.sin(a) * 226); c.lineTo(cx + Math.cos(a) * (i % 5 ? 214 : 204), cx + Math.sin(a) * (i % 5 ? 214 : 204)); c.stroke(); }
      const RN = ["XII", "I", "II", "III", "IIII", "V", "VI", "VII", "VIII", "IX", "X", "XI"]; c.font = `40px ${ROMAN}`; c.textAlign = "center"; c.textBaseline = "middle";
      RN.forEach((s, i) => { const a = i / 12 * TAU - Math.PI / 2; c.save(); c.translate(cx + Math.cos(a) * 168, cx + Math.sin(a) * 168); c.rotate(a + Math.PI / 2); c.fillText(s, 0, 0); c.restore(); });
      c.beginPath(); c.arc(cx, cx + 110, 52, 0, TAU); c.lineWidth = 1.5; c.stroke();
    });
    const dial = new THREE.Mesh(new THREE.CircleGeometry(0.57, 64).rotateX(-Math.PI / 2), new THREE.MeshStandardMaterial({ map: dialT, roughness: 0.3, envMapIntensity: 0.5 })); dial.position.y = 0.162; g.add(dial);
    const handM = new THREE.MeshStandardMaterial({ color: 0x1a1a22, metalness: 0.6, roughness: 0.3 });
    const hand = (len, wdt) => { const m = new THREE.Mesh(new THREE.BoxGeometry(wdt, 0.006, len).translate(0, 0, -len / 2 + 0.04), handM); m.position.y = 0.172; g.add(m); return m; };
    const hH = hand(0.3, 0.03), hM = hand(0.44, 0.02);
    const hS = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.11).translate(0, 0, -0.04), handM); hS.position.set(0, 0.17, 0.57 * 0.43); g.add(hS);
    const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.1, 24), caseM); crown.rotation.x = Math.PI / 2; crown.position.set(0, 0.08, -0.7); g.add(crown);
    const bow = new THREE.Mesh(new THREE.TorusGeometry(0.11, 0.018, 10, 32), caseM); bow.rotation.x = Math.PI / 2; bow.position.set(0, 0.06, -0.83); g.add(bow);
    // chain: a curve of small links (instanced tori)
    const N = 46, link = new THREE.InstancedMesh(new THREE.TorusGeometry(0.03, 0.009, 6, 14), caseM, N), mm = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler();
    const cc = new THREE.CatmullRomCurve3([V(0, 0.02, -0.93), V(0.25, 0.02, -1.4), V(0.9, 0.02, -1.55), V(1.3, 0.02, -1.1), V(1.7, 0.02, -1.2)]);
    for (let i = 0; i < N; i++) { const p = cc.getPoint(i / (N - 1)), tn = cc.getTangent(i / (N - 1)); e.set(i % 2 ? 0 : Math.PI / 2, Math.atan2(tn.x, tn.z) + Math.PI / 2, 0, "YXZ"); q.setFromEuler(e); mm.compose(p, q, V(1, 1, 1)); link.setMatrixAt(i, mm); }
    g.add(link);
    shadowAll(g);
    return { g, set(ft) { const sec = 10 * 3600 + 21 * 60 + 14 + Math.floor(ft); hS.rotation.y = -(sec % 60) / 60 * TAU; hM.rotation.y = -((sec / 60) % 60) / 60 * TAU; hH.rotation.y = -((sec / 3600) % 12) / 12 * TAU; } };
  }
  // a stack of documents tied with string; returns group (origin at desk)
  function fileStack(w, d, hgt, topTex, seed) {
    const g = new THREE.Group(), r = rnd(seed);
    const edgeT = ctex("fileEdge", 32, 256, (c) => { for (let y = 0; y < 256; y++) { const k = hash(y, 7, 3); c.fillStyle = `rgb(${205 + k * 30 | 0},${192 + k * 28 | 0},${165 + k * 24 | 0})`; c.fillRect(0, y, 32, 1); if (k > 0.85) { c.fillStyle = "rgba(90,70,40,0.4)"; c.fillRect(0, y, 32, 1); } } });
    const edgeM = new THREE.MeshStandardMaterial({ map: edgeT, roughness: 0.95, envMapIntensity: 0.1 });
    let y = 0; const n = Math.max(2, Math.round(hgt / 0.12));
    for (let i = 0; i < n; i++) { const th = hgt / n, b = new THREE.Mesh(new THREE.BoxGeometry(w * (0.97 + r() * 0.03), th * 0.98, d * (0.97 + r() * 0.03)), edgeM); b.position.set((r() - 0.5) * 0.08, y + th / 2, (r() - 0.5) * 0.08); b.rotation.y = (r() - 0.5) * 0.04; g.add(b); y += th; }
    const top = sheet(topTex, w, d, { curl: 0.015, wave: 0.004, seed: seed, lift: y, nx: 16, nz: 20 }); g.add(top);
    // string: two loops around the stack + knot
    const sM = new THREE.MeshStandardMaterial({ color: 0xb59a6a, roughness: 0.9 });
    const loop = (alongX, off) => { const pts = []; const hw = (alongX ? w : d) / 2 + 0.012, hh = y + 0.012; for (const [a, b] of [[-hw, -0.004], [-hw, hh], [hw, hh], [hw, -0.004]]) pts.push(alongX ? V(a, b, off) : V(off, b, a)); const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true, "catmullrom", 0.02), 64, 0.012, 6, true), sM); g.add(m); };
    loop(true, 0.1); loop(false, -0.15);
    const knot = new THREE.Mesh(new THREE.TorusKnotGeometry(0.05, 0.014, 48, 6), sM); knot.position.set(-0.15, y + 0.03, 0.1); knot.rotation.x = Math.PI / 2; g.add(knot);
    for (const s of [-1, 1]) { const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([V(-0.15, y + 0.03, 0.1), V(-0.15 + s * 0.12, y + 0.02, 0.28), V(-0.15 + s * 0.2, y + 0.015, 0.45)]), 16, 0.011, 6), sM); g.add(tail); }
    shadowAll(g); g.userData.h = y; return g;
  }
  LABK.patent = (o) => {
    const S = darkStage({ bg: 0x0d0c0b, hemi: 0.16, key: 0.05, rim: 0.12 }), C = cam(30);
    S.fog = new THREE.Fog(0x0d0c0b, 18, 44);
    S.traverse((m) => { if (m.isHemisphereLight) { m.color.set(0xbfd0e6); m.groundColor.set(0x2a2018); } });
    deskTop(S, "wDeskPat", [128, 88, 56], 53, 26, 8.6).position.z = -1.7;
    // back wall with a tall window (old glass), out of the light's way
    const wallT = pixTex("plaster", 512, 512, (x, y) => { const k = 0.85 + 0.15 * fbm(x / 60, y / 60, 5, 4) + 0.05 * (hash(x, y, 2) - 0.5); return [96 * k, 88 * k, 78 * k]; });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(40, 16), new THREE.MeshStandardMaterial({ map: rep(wallT, 6, 3), roughness: 0.95 })); wall.position.set(0, 6, -6.2); wall.receiveShadow = true; S.add(wall);
    const glassT = ctex("oldGlass", 256, 512, (c, w, h) => { const gr = c.createLinearGradient(0, h, 0, 0); gr.addColorStop(0, "#c9c3b4"); gr.addColorStop(1, "#e9eef2"); c.fillStyle = gr; c.fillRect(0, 0, w, h); c.globalAlpha = 0.08; const rr = rnd(5); for (let i = 0; i < 60; i++) { c.fillStyle = rr() < 0.5 ? "#fff" : "#8a8a80"; c.fillRect(0, rr() * h, w, 1 + rr() * 4); } });
    const WX = -2.2, WW = 3.2, WY0 = 1.2, WH = 6.4;
    // the window is far behind the focus plane: drawn as a soft, out-of-focus plate (panes, mullions, a little glow on the wall)
    const winT = ctex("winPlate", 512, 1024, (c, w, h) => { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); c.filter = "blur(26px)"; const gr = c.createRadialGradient(w / 2, h / 2, 40, w / 2, h / 2, w * 0.9); gr.addColorStop(0, "rgba(255,240,215,0.35)"); gr.addColorStop(1, "rgba(255,240,215,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.filter = "blur(9px)"; const x0 = 96, y0 = 120, pw = (w - 2 * x0 - 14) / 2, ph = (h - 2 * y0 - 3 * 12) / 4; for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) { const g2 = c.createLinearGradient(0, y0 + j * (ph + 12), 0, y0 + j * (ph + 12) + ph); g2.addColorStop(0, "#f2ede4"); g2.addColorStop(1, j > 2 ? "#cfc2a8" : "#e6e2da"); c.fillStyle = g2; c.fillRect(x0 + i * (pw + 14), y0 + j * (ph + 12), pw, ph); } });
    const pane = new THREE.Mesh(new THREE.PlaneGeometry(WW * 1.6, WH * 1.25), new THREE.MeshBasicMaterial({ map: winT, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, color: 0xd8d0c0 })); pane.position.set(WX, WY0 + WH / 2, -6.15); S.add(pane);
    const winOcc = new THREE.Mesh(new THREE.BoxGeometry(WW, WH, 0.05), new THREE.MeshBasicMaterial({ colorWrite: false })); winOcc.position.set(WX, WY0 + WH / 2, -6.3); winOcc.castShadow = false;
    const frameM = new THREE.MeshStandardMaterial({ color: 0x3a2c20, roughness: 0.7 });
    const bar = () => {};
    bar(WW + 0.4, 0.2, WX, WY0); bar(WW + 0.4, 0.2, WX, WY0 + WH); bar(0.2, WH, WX - WW / 2, WY0 + WH / 2); bar(0.2, WH, WX + WW / 2, WY0 + WH / 2); bar(0.1, WH, WX, WY0 + WH / 2);
    for (let k = 1; k < 4; k++) bar(WW, 0.08, WX, WY0 + WH * k / 4);
    // morning sun through the window: one spot with the window's mullions as a gobo
    const gob = ctex("patGobo", 512, 512, (c, w, h) => { c.fillStyle = "#000"; c.fillRect(0, 0, w, h); c.filter = "blur(9px)"; c.fillStyle = "#fff"; const pw = 150, ph = 92; for (let i = 0; i < 2; i++) for (let j = 0; j < 4; j++) c.fillRect(100 + i * (pw + 7), 60 + j * (ph + 6), pw, ph); });
    const sun = spot(S, 0xfff0d8, 1100, V(WX - 0.5, 11, -12), V(0.9, 0, -1.0), 0.25, 0.4);
    // soft skylight from the same window (no sun disc): lights the front of the desk gently
    const sky = spot(S, 0xdfe8f2, 30, V(WX, 6.5, -7.5), V(1.0, 0, 1.0), 0.75, 1, true); sky.shadow.mapSize.set(1024, 1024); sky.shadow.radius = 8; sun.map = gob; sun.shadow.camera.far = 40; sun.shadow.mapSize.set(3072, 3072);
    // desk objects
    const watch = pocketWatch(); watch.g.position.set(-2.6, 0, -0.9); watch.g.rotation.y = 0.5; S.add(watch.g);
    const iw = inkwell(); iw.position.set(-4.1, 0, -2.2); S.add(iw);
    const pen = dipPen(); pen.position.set(-3.2, 0.06, 0.1); pen.rotation.y = -0.4; S.add(pen);
    const dr = sheet(drawingTex(), 3.5, 2.5, { curl: 0.04, wave: 0.006, seed: 17, nx: 30, nz: 24 }); dr.position.set(-0.6, 0.012, -1.3); dr.rotation.y = 0.12; S.add(dr);
    const cd = contact(3.5, 2.5, 0.45, 0.08); cd.position.set(-0.6, 0.004, -1.3); cd.rotation.y = 0.12; S.add(cd);
    const nb = new THREE.Group(); nb.position.set(2.2, 0, 0.9); nb.rotation.y = -0.08; S.add(nb);
    const cover = new THREE.Mesh(new THREE.BoxGeometry(3.7, 0.04, 2.5), new THREE.MeshStandardMaterial({ color: 0x2b2a33, roughness: 0.8 })); cover.position.y = 0.02; cover.receiveShadow = cover.castShadow = true; nb.add(cover);
    const pg = sheet(notebookTex(), 3.6, 2.4, { curl: 0.0, wave: 0.004, seed: 3, nx: 60, nz: 20, lift: 0.045, bumpScale: 0.3 });
    { const p = pg.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const u = p.getX(i) / 1.8; p.setY(i, p.getY(i) + 0.05 * Math.sin(Math.min(1, Math.abs(u) / 0.3) * Math.PI / 2)); } pg.geometry.computeVertexNormals(); }
    nb.add(pg); nb.add(at(contact(3.7, 2.5, 0.45, 0.08), 0, 0.002, 0));
    const pencilG = new THREE.Group(); pencilG.position.set(1.7, 0.12, 1.75); pencilG.rotation.y = 0.35; S.add(pencilG);
    const pb = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 1.8, 6), new THREE.MeshStandardMaterial({ color: 0x3d5a3a, roughness: 0.5 })); pb.rotation.z = Math.PI / 2; pencilG.add(pb);
    const pt = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.22, 16), new THREE.MeshStandardMaterial({ color: 0xd2b088, roughness: 0.75 })); pt.rotation.z = -Math.PI / 2; pt.position.x = 1.01; pencilG.add(pt);
    shadowAll(pencilG);
    const st1 = fileStack(2.6, 3.4, 0.62, patentFormTex(311), 5); st1.position.set(3.4, 0.045, -0.9); st1.rotation.y = 0.06; S.add(st1);
    const st2 = fileStack(2.6, 3.4, 1.1, patentFormTex(312), 6); st2.position.set(5.6, 0, -3.0); st2.rotation.y = -0.12; S.add(st2);
    S.add(at(contact(2.6, 3.4, 0.5, 0.08), 5.6, 0.003, -3.0));
    // dust motes drifting in the sunbeam (faint, warm)
    const DN = 260, dg = new THREE.BufferGeometry(), dp = new Float32Array(DN * 3), dr0 = rnd(77), base = [];
    for (let i = 0; i < DN; i++) { const u = dr0(); base.push([lerp(WX - 0.6, 0.4, u) + (dr0() - 0.5) * 2.6, lerp(6.5, 0.4, u) + (dr0() - 0.5) * 1.4, lerp(-5.8, -0.6, u) + (dr0() - 0.5) * 2.2, dr0() * 10]); }
    dg.setAttribute("position", new THREE.BufferAttribute(dp, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ color: 0xffe6c0, size: 0.025, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(dust);
    const T0 = o.T0, E = EV.patent;
    const K = [
      [77.12, -1.0, 0.9, -2.2, 9.0, 22, 7, 0, 160],
      [79.6, 0.3, 0.5, -1.0, 8.2, 16, 20, 0, 140],
      [E.notebook, 1.4, 0.1, 0.85, 5.2, 4, 54, 0, 60],
      [84.08, 1.3, 0.05, 0.9, 3.7, 0, 62, 0, 20],
    ];
    return (t) => {
      const ft = T0 + t;
      watch.set(ft);
      for (let i = 0; i < DN; i++) { const b = base[i], ph = b[3] + ft * 0.05; dp[i * 3] = b[0] + 0.15 * Math.sin(ph * 2.1); dp[i * 3 + 1] = b[1] + 0.12 * Math.sin(ph * 0.9) + 0.08 * Math.sin(ph * 1.7); dp[i * 3 + 2] = b[2] + 0.12 * Math.cos(ph * 1.3); }
      dg.attributes.position.needsUpdate = true;
      camKeys(C, K, ft);
      return [S, C];
    };
  };

  // ================================================================ LETTERS — E, m, c as real things on a dark studio table
  const castIron = () => {
    const t = pixTex("castIron", 512, 512, (x, y) => { const n = fbm(x / 5, y / 5, 31, 3), m2 = fbm(x / 90, y / 90, 35, 3), sp = hash(x, y, 4); let k = 0.8 + 0.14 * n + 0.18 * (m2 - 0.5) + (sp > 0.992 ? -0.2 : 0); const rust = Math.max(0, fbm(x / 70, y / 70, 33, 3) - 0.6) * 2.2; return [92 * k + 70 * rust, 92 * k + 36 * rust, 96 * k + 12 * rust]; });
    return new THREE.MeshStandardMaterial({ map: t, metalness: 0.45, roughness: 0.62, bumpMap: t, bumpScale: 1.2, envMapIntensity: 0.8 });
  };
  function ironBlock() { const m = new THREE.Mesh(roundBox(1.1, 0.75, 0.75, 0.05), castIron()); m.position.y = 0.375; m.castShadow = m.receiveShadow = true; const g = new THREE.Group(); g.add(m); return g; }
  function woodBlock() { const m = new THREE.Mesh(roundBox(0.62, 0.42, 0.46, 0.03), wood("wBeech", [196, 160, 112], 61, 0.6)); m.position.y = 0.21; m.castShadow = m.receiveShadow = true; const g = new THREE.Group(); g.add(m); return g; }
  function bulb() {
    const g = new THREE.Group();
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.12, 48), wood("wDarkB", [70, 44, 28], 63, 0.5)); base.position.y = 0.06; g.add(base);
    const holder = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.34, 32), new THREE.MeshStandardMaterial({ color: 0x1c1a18, roughness: 0.4 })); holder.position.y = 0.29; g.add(holder);
    const screw = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.16, 32), new THREE.MeshStandardMaterial({ color: 0xb9a57a, metalness: 1, roughness: 0.3 })); screw.position.y = 0.53; g.add(screw);
    const pts = new THREE.SplineCurve([[0.115, 0.6], [0.125, 0.7], [0.19, 0.84], [0.29, 0.98], [0.335, 1.1], [0.325, 1.23], [0.26, 1.34], [0.14, 1.41], [0.001, 1.43]].map(([x, y]) => new THREE.Vector2(x, y))).getPoints(40);
    const glassM = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.04, transmission: 0.95, thickness: 0.05, transparent: true, opacity: 0.35, envMapIntensity: 1.2, emissive: 0xffb060, emissiveIntensity: 0 });
    const glass = new THREE.Mesh(new THREE.LatheGeometry(pts, 48), glassM); g.add(glass);
    const filM = new THREE.MeshStandardMaterial({ color: 0x3a3430, metalness: 0.5, roughness: 0.4, emissive: 0xffa040, emissiveIntensity: 0 });
    const fil = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 40 }, (_, i) => { const u = i / 39, a = u * 14 * TAU; return V(lerp(-0.12, 0.12, u), 1.06 + 0.035 * Math.sin(a), 0.035 * Math.cos(a)); })), 300, 0.006, 5), filM); g.add(fil);
    for (const s of [-1, 1]) g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(V(s * 0.04, 0.62, 0), V(s * 0.12, 1.06, 0)), 1, 0.005, 5), M.steel()));
    shadowAll(g); glass.castShadow = false;
    const pl = new THREE.PointLight(0xffb468, 0, 0, 2); pl.position.y = 1.06; g.add(pl);
    const halo = glowSprite(0xffc890, 1.6, 0); halo.position.y = 1.06; g.add(halo);
    return { g, set(k) { filM.emissiveIntensity = 9 * k; glassM.emissiveIntensity = 0.3 * k; pl.intensity = 30 * k; halo.material.opacity = 0.4 * k; } };
  }
  function lettersTable(S) {
    const top = new THREE.Mesh(new THREE.BoxGeometry(60, 0.4, 30), wood("wTableL", [62, 42, 30], 67, 0.62, [6, 3])); top.position.y = -0.2; top.receiveShadow = true; S.add(top);
    return top;
  }
  LABK.letters = (o) => {
    const mode = o.mode, T0 = o.T0, E = EV.letters;
    const S = darkStage({ bg: 0x0b0b0c, hemi: 0.14, key: 0.08, rim: 0.5 }), C = cam(30);
    S.fog = mode === "c" ? new THREE.Fog(0x0b0b0c, 14, 46) : new THREE.Fog(0x0b0b0c, 7, 17);
    if (mode !== "c") lettersTable(S);
    if (mode === "e") {
      const cnd = candle(S); cnd.g.position.set(0, 0, 0);
      const flamePos = cnd.tip.clone();
      const cl = new THREE.PointLight(0xffa860, 16, 0, 2); cl.position.copy(flamePos).add(V(0, 0.12, 0)); cl.castShadow = true; cl.shadow.mapSize.set(1024, 1024); cl.shadow.bias = -0.0005; cl.shadow.normalBias = 0.02; S.add(cl);
      const cf = new THREE.PointLight(0xffa860, 5, 0, 2); cf.position.copy(cl.position); S.add(cf);
      const key = spot(S, 0xfff2e2, 85, V(-2, 8, 4), V(3.0, 0, 0), 0.4, 0.9); key.shadow.mapSize.set(2048, 2048);
      const b = bulb(); b.g.position.set(2.4, 0, -0.2); S.add(b.g);
      // ramp: a wooden inclined plane with a groove, steel ball at the top
      const RL = 2.4, RH = 0.85, th = Math.asin(RH / RL);
      const ramp = new THREE.Group(); ramp.position.set(4.6, 0, 0.1); S.add(ramp);
      const plank = new THREE.Mesh(new THREE.BoxGeometry(RL, 0.06, 0.4), wood("wRamp", [170, 128, 84], 71, 0.5)); plank.position.set(RL * Math.cos(th) / 2, RH / 2 + 0.02, 0); plank.rotation.z = -th; ramp.add(plank);
      const post = new THREE.Mesh(new THREE.BoxGeometry(0.12, RH, 0.4), wood("wRamp", [170, 128, 84], 71, 0.5)); post.position.set(0.04, RH / 2, 0); ramp.add(post);
      for (const s of [-1, 1]) { const rail = new THREE.Mesh(new THREE.BoxGeometry(RL, 0.04, 0.03), M.brass()); rail.position.set(RL * Math.cos(th) / 2, RH / 2 + 0.07, s * 0.07); rail.rotation.z = -th; ramp.add(rail); }
      shadowAll(ramp);
      const ball = new THREE.Mesh(new THREE.SphereGeometry(0.11, 48, 24), new THREE.MeshStandardMaterial({ color: 0xd0d4da, metalness: 1, roughness: 0.2, envMapIntensity: 2.2 })); ball.castShadow = true; S.add(ball);
      const K = [
        [111.62, 2.6, 0.7, 0.0, 9.6, -18, 12, 0, 120],
        [115.3, 1.4, 0.9, 0.0, 6.4, -14, 10, 0, 140],
        [E.heat, 0.05, 1.2, 0.0, 3.1, -10, 6, -220, 120],
        [E.bulb, 2.4, 1.0, -0.2, 3.5, -4, 8, -200, 120],
        [E.ball, 4.4, 0.6, 0.1, 4.2, 4, 10, -150, 130],
        [120.8, 5.6, 0.35, 0.1, 4.6, 10, 12, -100, 140],
      ];
      const a = 6.0, tR = Math.sqrt(2 * RL / a), vB = a * tR;   // stylised (fast) roll so the motion reads inside 0.9 s
      return (t) => {
        const ft = T0 + t;
        const fl = 0.9 + 0.06 * Math.sin(ft * 9.3) + 0.04 * Math.sin(ft * 23.7 + 1.3);
        const heat = 1 + 0.25 * seg(ft, E.heat - 0.5, E.heat + 0.2);   // the flame draws up a little on "heat"
        cl.intensity = 16 * fl * heat; cf.intensity = 5 * fl * heat; cnd.flame.material.uniforms.uT.value = ft; cnd.flame.scale.set(0.34 * heat, 0.62 * (0.94 + 0.08 * fl) * heat, 1); cnd.wax.emissiveIntensity = 0.08 * fl;
        const on = clamp((ft - E.bulb) / 0.25, 0, 1); b.set(on * on);
        // ball: at rest at the top, released at E.ball, rolls down the ramp and on along the table (rolling friction)
        const tb = ft - E.ball; let s, x, y;
        if (tb <= 0) { s = 0; } else if (tb < tR) { s = 0.5 * a * tb * tb; } else { s = RL + vB * (tb - tR) - 0.5 * 2.0 * (tb - tR) * (tb - tR); }
        if (s <= RL) { x = ramp.position.x + 0.1 + s * Math.cos(th); y = RH + 0.13 - s * Math.sin(th); } else { x = ramp.position.x + RL * Math.cos(th) + (s - RL); y = 0.11; }
        ball.position.set(x, y + 0.02, ramp.position.z); ball.rotation.z = -s / 0.11;
        camKeys(C, K, ft);
        cnd.flame.quaternion.copy(C.quaternion);
        return [S, C];
      };
    }
    if (mode === "m") {
      const key = spot(S, 0xfff2e2, 420, V(-4, 9, 6), V(0.9, 0, 0), 0.4, 0.8);
      const back = spot(S, 0xbcd0e8, 90, V(4, 4.5, -7), V(0.5, 0.6, 0), 0.32, 1, false);
      const iron = ironBlock(); iron.position.set(0.4, 0, -0.75); S.add(iron);
      const wb = woodBlock(); wb.position.set(0.15, 0, 0.75); S.add(wb);
      // pusher: two identical spring pistons on one frame, released together (same force)
      const RX = -0.41, rig = new THREE.Group(); rig.position.set(RX, 0, 0); S.add(rig);
      const steel = new THREE.MeshStandardMaterial({ color: 0x6e7177, metalness: 0.9, roughness: 0.38, envMapIntensity: 0.8 });
      const chrome = new THREE.MeshStandardMaterial({ color: 0xd8dce2, metalness: 1, roughness: 0.12 });
      const plate = new THREE.Mesh(roundBox(0.9, 0.08, 2.6, 0.03), steel); plate.position.set(-0.3, 0.04, 0); rig.add(plate);
      const rods = [];
      for (const z of [-0.75, 0.75]) {
        const hy = z < 0 ? 0.375 : 0.21;
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.14, hy, 0.3), steel); stand.position.set(-0.45, hy / 2 + 0.08, z); rig.add(stand);
        const cyl = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.7, 32), steel); cyl.rotation.z = Math.PI / 2; cyl.position.set(-0.35, hy + 0.08, z); rig.add(cyl);
        const capE = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.05, 32), chrome); capE.rotation.z = Math.PI / 2; capE.position.set(0.0, hy + 0.08, z); rig.add(capE);
        const rodG = new THREE.Group(); rodG.position.set(0.0, hy + 0.08, z); rig.add(rodG);
        const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.5, 20), chrome); rod.rotation.z = Math.PI / 2; rod.position.x = -0.1; rodG.add(rod);
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 0.04, 32), new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.8 })); pad.rotation.z = Math.PI / 2; pad.position.x = 0.17; rodG.add(pad);
        const spr = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(Array.from({ length: 120 }, (_, i) => { const u = i / 119, a = u * 9 * TAU; return V(u, 0.065 * Math.sin(a), 0.065 * Math.cos(a)); })), 360, 0.008, 6), chrome); spr.position.set(0.02, hy + 0.08, z); rig.add(spr);
        rodG.userData.spr = spr; rods.push(rodG);
      }
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 1.7), steel); bar.position.set(-0.75, 0.5, 0); rig.add(bar);
      shadowAll(rig);
      // contact gaps: pad face at rig x + 0.19 + ext; iron face at 0.4-0.55, wood face at 0.15-0.31
      const gapI = (0.4 - 0.55) - (RX + 0.19), gapW = (0.15 - 0.31) - (RX + 0.19);
      const K = [
        [120.8, 0.3, 0.35, 0.0, 6.2, 38, 16, -300, 170],
        [124.6, 0.5, 0.35, 0.1, 5.4, 26, 18, -300, 180],
        [127.72, 1.5, 0.3, 0.4, 6.1, 14, 22, -240, 190],
      ];
      return (t) => {
        const ft = T0 + t, tp = ft - E.push;
        // rods: spring release, 0.12 s stroke; wood rod runs to full stroke, iron rod stalls against the block
        const stroke = (u) => clamp(u / 0.12, 0, 1);
        const extW = (tp > 0 ? Math.min(gapW + 0.25, (gapW + 0.25) * stroke(tp)) : 0) * (1 - seg(ft, 126.6, 127.5) * 0.7);
        const ironMove = tp > 0 ? 0.035 * smooth(clamp((tp - 0.06) / 0.3, 0, 1)) : 0;
        const extI = tp > 0 ? Math.min(gapI + ironMove, (gapW + 0.25) * stroke(tp)) : 0;
        rods[0].position.x = extI; rods[1].position.x = extW;
        rods.forEach((r2) => { r2.userData.spr.scale.x = Math.max(0.02, 0.13 + r2.position.x); });
        iron.position.x = 0.4 + ironMove;
        // wood: shoved for ~0.07 s after contact, then slides and stops under friction (~2.4 units)
        const tc = 0.12 * gapW / (gapW + 0.25), ts = tp - tc, v0 = 4.6, mu = 4.4;
        const xw = ts <= 0 ? 0 : ts < v0 / mu ? v0 * ts - 0.5 * mu * ts * ts : v0 * v0 / (2 * mu);
        wb.position.x = 0.15 + xw; wb.rotation.y = 0.05 * smooth(xw / 2.4);
        camKeys(C, K, ft);
        return [S, C];
      };
    }
    // mode "c": a pulse of light along a very long polished rail
    const S2 = S, HAZE = 0x16181d;
    S2.background = ctex("railSky", 16, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "#07080a"); gr.addColorStop(0.55, "#101216"); gr.addColorStop(0.75, "#16181d"); gr.addColorStop(1, "#16181d"); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
    S2.fog = new THREE.Fog(HAZE, 10, 150);
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(120, 420), new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.32, metalness: 0, envMapIntensity: 0.25 })); floor.rotation.x = -Math.PI / 2; floor.position.set(0, 0, -160); floor.receiveShadow = true; S2.add(floor);
    const railM = new THREE.MeshStandardMaterial({ color: 0xb9bdc4, metalness: 1, roughness: 0.3, envMapIntensity: 0.35 });
    const dark = M.paint(0x24262a, 0.55);
    const rail = new THREE.Group(); S2.add(rail);
    const RLEN = 380, rail0 = 10;
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, RLEN), railM); head.position.set(0, 0.62, rail0 - RLEN / 2); rail.add(head);
    const web = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, RLEN), dark); web.position.set(0, 0.36, rail0 - RLEN / 2); rail.add(web);
    const foot = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.08, RLEN), dark); foot.position.set(0, 0.12, rail0 - RLEN / 2); rail.add(foot);
    const stG = new THREE.BoxGeometry(1.1, 0.1, 0.4), stN = Math.floor(RLEN / 5), stI = new THREE.InstancedMesh(stG, M.paint(0x1c1d20, 0.65), stN), mm = new THREE.Matrix4();
    for (let i = 0; i < stN; i++) { mm.makeTranslation(0, 0.04, rail0 - 2 - i * 5); stI.setMatrixAt(i, mm); } rail.add(stI);
    shadowAll(rail);
    const key = spot(S2, 0xe4ebf4, 200, V(-6, 10, 4), V(-1.2, 0.5, -3), 0.42, 0.9);
    const ironL = spot(S2, 0xf0e6d8, 70, V(-5.5, 4, 2.5), V(-2.5, 0.9, -2.2), 0.3, 0.9, false);
    // the iron block from "m", on a stone plinth beside the rail
    const plinth = new THREE.Mesh(roundBox(1.5, 0.9, 1.2, 0.04), new THREE.MeshStandardMaterial({ map: pixTex("stoneP", 256, 256, (x, y) => { const k = 0.8 + 0.25 * fbm(x / 20, y / 20, 81, 4); return [58 * k, 58 * k, 60 * k]; }), roughness: 0.85 }));
    plinth.position.set(-2.5, 0.45, -2.2); plinth.castShadow = plinth.receiveShadow = true; S2.add(plinth);
    const iron = ironBlock(); iron.position.set(-2.5, 0.9, -2.2); iron.rotation.y = 0.15; S2.add(iron);
    // the pulse: a small hot core with a soft halo, a short bright streak behind it, a long fading wake on the rail, and a moving light
    const pulse = new THREE.Group(); S2.add(pulse);
    const core = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), new THREE.MeshBasicMaterial({ color: 0xfff6e8 })); pulse.add(core);
    const halo = glowSprite(0xfff0dc, 0.8, 0.5); pulse.add(halo);
    const streakT = ctex("pulseTrail", 32, 512, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, "rgba(255,246,232,1)"); gr.addColorStop(0.08, "rgba(255,240,222,0.6)"); gr.addColorStop(1, "rgba(255,240,222,0)"); c.fillStyle = gr; c.fillRect(0, 0, w, h); const g2 = c.createLinearGradient(0, 0, w, 0); g2.addColorStop(0, "rgba(0,0,0,1)"); g2.addColorStop(0.5, "rgba(0,0,0,0)"); g2.addColorStop(1, "rgba(0,0,0,1)"); c.globalCompositeOperation = "destination-out"; c.fillStyle = g2; c.fillRect(0, 0, w, h); });
    const mkStreak = (wd, op) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(wd, 1).translate(0, -0.5, 0), new THREE.MeshBasicMaterial({ map: streakT, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })); m.rotation.set(-Math.PI / 2, 0, 0); return m; };
    const streak = mkStreak(0.08, 1); pulse.add(streak);
    const streakV = mkStreak(0.08, 1); streakV.rotation.set(-Math.PI / 2, 0, Math.PI / 2, "ZYX"); pulse.add(streakV);
    const wake = mkStreak(0.3, 0.22); wake.position.y = -0.075; pulse.add(wake);
    const pl = new THREE.PointLight(0xfff0dc, 0, 9, 2); pl.position.y = 0.25; pulse.add(pl);
    const PERIOD = 1.15, SPEED = 230;
    const K = [
      [127.72, 0.5, 0.9, -12, 9.4, 14, 5, 0, -250],
      [131.0, 0.4, 0.9, -14, 8.8, 11, 5, 0, -260],
      [134.6, 0.2, 0.9, -16, 8.2, 8, 5, 0, -260],
      [E.side, -1.1, 1.0, -2.4, 6.0, 2, 11, 0, 70],
      [140.9, -1.1, 1.0, -2.6, 5.4, 8, 12, 0, 80],
    ];
    return (t) => {
      const ft = T0 + t;
      // repeating pulses, launched from behind the camera; each is gone into the haze in about a second
      const k = (ft - E.pulse0) / PERIOD, tt = (k - Math.floor(k)) * PERIOD, z = rail0 - SPEED * tt;
      const live = ft >= E.pulse0 && tt < 1.0;
      pulse.visible = live; pulse.position.set(0, 0.76, z);
      const sl = Math.min(SPEED * tt, 9), wl = Math.min(SPEED * tt, 70);
      streak.scale.set(1, Math.max(0.01, sl), 1); streakV.scale.set(1, Math.max(0.01, sl), 1); wake.scale.set(1, Math.max(0.01, wl), 1);
      pl.intensity = live ? 70 : 0;
      camKeys(C, K, ft);
      return [S2, C];
    };
  };

  // ================================================================ SNOW — Sweden, Christmas 1938: tight macro on a fallen trunk (1 unit = 10 cm)
  // periodic value noise (tileable textures)
  function vnp(x, y, s, P, Q) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi, u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), m = (a, n) => ((a % n) + n) % n; const h = (a, b) => hash(m(a, P), m(b, Q), s); const a = h(xi, yi), b = h(xi + 1, yi), c = h(xi, yi + 1), d = h(xi + 1, yi + 1); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbmp(x, y, s, P, Q, o) { let f = 0, a = 0.5; for (let i = 0; i < o; i++) { f += a * vnp(x, y, s + i * 13, P, Q); x *= 2; y *= 2; P *= 2; Q *= 2; a *= 0.5; } return f; }
  // pine-log bark on a tile (u along the log, v around it): long furrows and ridges along the axis, flaky plates elongated along the axis
  const BNU = 5, BNV = 30, BLU = 1.0, BLV = 0.16;
  const barkF = (u, v) => {
    const w = fbmp(u * 2, v * 6, 91, 2, 6, 4);
    const ridge = Math.abs(Math.sin((v * 18 + w * 2.4 + fbmp(u * 6, v * 3, 92, 6, 3, 2) * 0.6) * Math.PI)), rid = smooth((ridge - 0.08) / 0.55);
    const X = (u + 0.04 * (w - 0.5)) * BNU, Y = (v + 0.01 * (fbmp(u * 8, v * 8, 94, 8, 8, 2) - 0.5)) * BNV, xi = Math.floor(X), yi = Math.floor(Y); let f1 = 9, f2 = 9, id = 0;
    for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
      const cx = xi + i, cy = yi + j, mx = ((cx % BNU) + BNU) % BNU, my = ((cy % BNV) + BNV) % BNV;
      const d = Math.hypot((cx + hash(mx, my, 201) - X) * BLU, (cy + hash(mx, my, 203) - Y) * BLV);
      if (d < f1) { f2 = f1; f1 = d; id = hash(mx, my, 205); } else if (d < f2) f2 = d;
    }
    const crack = smooth((f2 - f1) / 0.03), fine = fbmp(u * 30, v * 140, 207, 30, 140, 3);
    return [rid * (0.55 + 0.45 * crack) * (0.84 + 0.16 * id) * (0.78 + 0.22 * fine), id, rid];
  };
  const barkH = (u, v) => barkF(u, v)[0];
  function barkTex() {
    return pixTex("barkTile2", 1024, 1024, (x, y) => {
      const u = x / 1024, v = y / 1024, [h, id] = barkF(u, v), n = fbmp(u * 50, v * 90, 99, 50, 90, 3) - 0.5;
      // furrow bottoms dark warm brown, ridge tops weathered grey-brown, a few freshly flaked plates reddish
      let r = lerp(34, 118, h) + 30 * n, g = lerp(26, 104, h) + 26 * n, b = lerp(22, 92, h) + 22 * n;
      const fresh = smooth((id - 0.85) / 0.12) * h; r = lerp(r, 132, fresh * 0.3); g = lerp(g, 92, fresh * 0.3); b = lerp(b, 70, fresh * 0.3);
      const lich = clamp((fbmp(u * 4, v * 7, 97, 4, 7, 4) - 0.58) * 5, 0, 1) * smooth((h - 0.4) / 0.3);
      r = lerp(r, 150, lich * 0.8); g = lerp(g, 160, lich * 0.8); b = lerp(b, 132, lich * 0.8);
      const moss = clamp((fbmp(u * 3, v * 5, 103, 3, 5, 4) - 0.55) * 4, 0, 1) * (1 - smooth((h - 0.2) / 0.4));
      r = lerp(r, 54, moss); g = lerp(g, 78, moss); b = lerp(b, 32, moss);
      return [r, g, b];
    });
  }
  function barkBump() { return pixTex("barkBump2", 512, 512, (x, y) => { const k = 255 * barkH(x / 512, y / 512); return [k, k, k]; }, true); }
  function snowScene(o) {
    const mode = o.mode, T0 = o.T0, night = mode === "end";
    const SKY = night ? 0x0b1220 : 0x1c2a40;
    const S = new THREE.Scene(); S.environment = L3.env;
    S.background = ctex("snowBg" + mode, 1024, 512, (c, w, h) => {
      const gr = c.createLinearGradient(0, 0, 0, h); if (night) { gr.addColorStop(0, "#060a14"); gr.addColorStop(0.6, "#0d1626"); gr.addColorStop(1, "#141e30"); } else { gr.addColorStop(0, "#162238"); gr.addColorStop(0.55, "#2b3d58"); gr.addColorStop(0.8, "#4a4a58"); gr.addColorStop(1, "#5a4c4a"); }
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      // out-of-focus forest: soft dark trunks and a few soft snowy branches (pre-blurred = shallow depth of field)
      c.filter = "blur(18px)"; const r = rnd(night ? 7 : 5);
      for (let i = 0; i < 16; i++) { const x = r() * w, ww = 18 + r() * 50; c.fillStyle = night ? `rgba(4,7,12,${0.5 + r() * 0.4})` : `rgba(14,18,26,${0.45 + r() * 0.4})`; c.fillRect(x, 0, ww, h); }
      for (let i = 0; i < 40; i++) { c.fillStyle = night ? "rgba(120,140,180,0.10)" : "rgba(200,210,230,0.12)"; c.beginPath(); c.ellipse(r() * w, r() * h * 0.7, 30 + r() * 60, 10 + r() * 20, 0, 0, TAU); c.fill(); }
      if (!night) { const g2 = c.createRadialGradient(w * 0.82, h * 0.78, 0, w * 0.82, h * 0.78, w * 0.4); g2.addColorStop(0, "rgba(255,170,110,0.35)"); g2.addColorStop(1, "rgba(255,170,110,0)"); c.fillStyle = g2; c.fillRect(0, 0, w, h); }
    });
    S.fog = new THREE.Fog(SKY, 9, 34);
    // light: cold sky + a low warm rim behind (blue hour), or moonlight at night
    S.add(new THREE.HemisphereLight(night ? 0x8ea6d8 : 0xa9c0e6, night ? 0x1a2030 : 0x30343e, night ? 0.5 : 0.3));
    const sky = new THREE.DirectionalLight(night ? 0xa9bce8 : 0xc6d6f2, night ? 0.75 : 0.55); sky.position.set(-4, 12, 8); sky.castShadow = true; sky.shadow.mapSize.set(2048, 2048); { const c2 = sky.shadow.camera; c2.left = -10; c2.right = 10; c2.top = 8; c2.bottom = -8; c2.far = 40; } sky.shadow.bias = -0.0005; sky.shadow.normalBias = 0.03; S.add(sky);
    const rimL = new THREE.DirectionalLight(night ? 0x6f86b8 : 0xffa868, night ? 0.4 : 1.7); rimL.position.set(6, 2.2, -10); S.add(rimL);
    // ground snow with footprints
    const GW = 36, GD = 18, gx = 220, gz = 110, gGeo = new THREE.PlaneGeometry(GW, GD, gx, gz); gGeo.rotateX(-Math.PI / 2);
    const gp = gGeo.attributes.position, base = new Float32Array(gp.count), foot = new Float32Array(gp.count);
    const prints = []; for (let i = 0; i < 9; i++) prints.push([-12 + i * 2.6 + (i % 2) * 0.4, 3.6 + (i % 2 ? 0.55 : -0.55), 0.42, 0.95]);
    for (let i = 0; i < gp.count; i++) {
      const x = gp.getX(i), z = gp.getZ(i);
      base[i] = 0.25 * (fbm(x * 0.25 + 9, z * 0.25, 101, 4) - 0.5) + 0.04 * (fbm(x * 2, z * 2, 103, 2) - 0.5) + Math.max(0, 1.6 - Math.abs(z)) * 0.25; // drift banked against the trunk
      let d = 0; for (const [px, pz, a, b] of prints) { const q = ((x - px) / b) ** 2 + ((z - pz) / a) ** 2; if (q < 1.6) d = Math.max(d, 0.32 * smooth((1.6 - q) / 1.2)); }
      foot[i] = d;
    }
    const snowMap = pixTex("snowCol", 512, 512, (x, y) => { const k = 0.86 + 0.1 * fbmp(x / 64, y / 64, 125, 8, 8, 4) + 0.06 * (hash(x, y, 11) - 0.5); return [255 * k, 255 * k, 255 * Math.min(1, k * 1.03)]; });
    const snowM = new THREE.MeshStandardMaterial({ map: snowMap, color: night ? 0xc0cadb : 0xd6dde9, roughness: 0.85, metalness: 0, envMapIntensity: 0.25, bumpMap: pixTex("snowBump", 256, 256, (x, y) => { const k = 255 * (0.5 + 0.5 * (fbmp(x / 32, y / 32, 107, 8, 8, 4) - 0.5) + 0.15 * (hash(x, y, 7) - 0.5)); return [k, k, k]; }, true), bumpScale: 1.4 });
    snowM.bumpMap = rep(snowM.bumpMap, 10, 5); snowM.map = rep(snowMap, 10, 5);
    const ground = new THREE.Mesh(gGeo, snowM); ground.receiveShadow = true; ground.position.y = 0; S.add(ground);
    const setGround = (fill) => { for (let i = 0; i < gp.count; i++) gp.setY(i, base[i] - foot[i] * (1 - fill)); gp.needsUpdate = true; gGeo.computeVertexNormals(); };
    setGround(0);
    // trunk: displaced bark cylinder along x (slightly rounded, with a broken end at XE), snow on top
    const R = 1.55, TY = 1.25, X0 = -5.2, XE = 17, TL = XE - X0;   // broken end at X0, facing the trunk-shot camera
    const tGeo = new THREE.CylinderGeometry(R, R, TL, 180, 300, true); tGeo.rotateZ(Math.PI / 2); tGeo.translate((X0 + XE) / 2, 0, 0);
    const barkR = (x, a) => { const u = fr(x / 5), v = fr((a / TAU + 0.5) * 2); return R + 0.11 * barkH(u, v) + 0.06 * (fbm(x * 0.35, a * 1.5, 109, 3) - 0.5) - 0.08 * smooth((X0 + 1.2 - x) / 1.2); };
    { const p = tGeo.attributes.position, uv = tGeo.attributes.uv; for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i), a = Math.atan2(z, y), rr = barkR(x, a); p.setXYZ(i, x, Math.cos(a) * rr, Math.sin(a) * rr); uv.setXY(i, x / 5, (a / TAU + 0.5) * 2); } tGeo.computeVertexNormals(); }
    const bt = barkTex(); const barkM = new THREE.MeshStandardMaterial({ map: bt, roughness: 0.9, bumpMap: barkBump(), bumpScale: 3.0, envMapIntensity: 0.3 });
    const trunk = new THREE.Mesh(tGeo, barkM); trunk.position.y = TY; trunk.castShadow = trunk.receiveShadow = true; S.add(trunk);
    // broken end: weathered grey end grain with rings and radial checks, jagged and splintered
    const endT = ctex("logEnd", 512, 512, (c, w, h) => { const cx = w / 2, r0 = w * 0.48; c.fillStyle = "#3a3028"; c.fillRect(0, 0, w, h); const rr = rnd(171);
      for (let k = 60; k >= 1; k--) { const t2 = k / 60; c.fillStyle = `rgb(${150 - 40 * t2 + (rr() - 0.5) * 18 | 0},${132 - 38 * t2 + (rr() - 0.5) * 16 | 0},${110 - 34 * t2 + (rr() - 0.5) * 14 | 0})`; c.beginPath(); c.arc(cx + (rr() - 0.5) * 4, cx + (rr() - 0.5) * 4, r0 * t2, 0, TAU); c.fill(); }
      c.strokeStyle = "rgba(40,30,24,0.8)"; for (let i = 0; i < 9; i++) { const ang = rr() * TAU, l = r0 * (0.4 + rr() * 0.6); c.lineWidth = 2 + rr() * 4; c.beginPath(); c.moveTo(cx + Math.cos(ang) * r0, cx + Math.sin(ang) * r0); c.lineTo(cx + Math.cos(ang + 0.05) * (r0 - l), cx + Math.sin(ang + 0.05) * (r0 - l)); c.stroke(); }
      const g2 = c.createRadialGradient(cx, cx, r0 * 0.75, cx, cx, r0); g2.addColorStop(0, "rgba(0,0,0,0)"); g2.addColorStop(1, "rgba(30,22,16,0.85)"); c.fillStyle = g2; c.fillRect(0, 0, w, h); });
    const eGeo = new THREE.RingGeometry(0.001, R + 0.1, 96, 20); eGeo.rotateY(-Math.PI / 2);
    { const p = eGeo.attributes.position; for (let i = 0; i < p.count; i++) { const y = p.getY(i), z = p.getZ(i), rr = Math.hypot(y, z), a = Math.atan2(z, y); const brk = 0.45 * Math.max(0, fbm(y * 1.2 + 3, z * 1.2, 173, 4) - 0.38) + 0.08 * Math.max(0, fbm(y * 6, z * 6, 175, 2) - 0.5) * (rr / R); p.setX(i, -(brk + 0.03 * fbm(y * 3, z * 3, 177, 2))); } eGeo.computeVertexNormals(); }
    const endM = new THREE.Mesh(eGeo, new THREE.MeshStandardMaterial({ map: endT, roughness: 0.95, bumpMap: endT, bumpScale: 1.5, side: THREE.DoubleSide })); endM.position.set(X0 + 0.02, TY, 0); endM.castShadow = endM.receiveShadow = true; S.add(endM);
    // snow on the log: a thin granular layer that follows the bark; uneven, lies thicker in the furrows near the crown,
    // breaks up into patches on the flanks, and has a crisp broken edge where the scraps were brushed clear (x around -0.2)
    const NA = 72, NX = 460, cap = new THREE.BufferGeometry(), cp = [], ci = [], cuv = [], A0 = 0.95;
    const clear = (x, a) => { const e = Math.abs(x + 0.2) - 1.25 + 0.35 * (fbm(a * 5 + (x > 0 ? 5 : 0), 0.5, 119, 3) - 0.5); return (night ? 0.35 : 0) + (night ? 0.65 : 1) * smooth(e / 0.12); };
    const snowTh = (x, a) => {
      const prof = Math.max(0, Math.cos(a / A0 * Math.PI / 2)), patch = fbm(x * 1.4, a * 5, 113, 4), grain = fbm(x * 6, a * 22, 117, 2);
      const t0 = 0.17 * Math.pow(prof, 1.1) + 0.17 * (patch - 0.5) + 0.06 * (grain - 0.5) + 0.02 * (hash(Math.round(x * 40), Math.round(a * 90), 179) - 0.5) - 0.12 * (1 - prof);
      return (t0 - 0.03) * clear(x, a) - 0.3 * (1 - clear(x, a)) - 0.25 * smooth((X0 + 0.3 - x) / 0.3);
    };
    for (let ix = 0; ix <= NX; ix++) for (let ia = 0; ia <= NA; ia++) {
      const x = X0 + 0.15 + (XE - X0 - 0.15) * ix / NX, a = -A0 + 2 * A0 * ia / NA, ang = a + Math.PI / 2;
      const rr = barkR(x, Math.atan2(Math.cos(ang), Math.sin(ang))) * 0.35 + (R + 0.07) * 0.65 + 0.02 + snowTh(x, a);
      cp.push(x, TY + Math.sin(ang) * rr, Math.cos(ang) * rr); cuv.push(x / 3, a);
    }
    for (let ix = 0; ix < NX; ix++) for (let ia = 0; ia < NA; ia++) { const a = ix * (NA + 1) + ia, b = a + NA + 1; ci.push(a, b, a + 1, b, b + 1, a + 1); }
    cap.setAttribute("position", new THREE.Float32BufferAttribute(cp, 3)); cap.setAttribute("uv", new THREE.Float32BufferAttribute(cuv, 2)); cap.setIndex(ci); cap.computeVertexNormals();
    // granular snow: fine grain colour + crystal bump, slightly blue, not pure white (no clipping)
    const grainT = pixTex("snowGrain", 512, 512, (x, y) => { const k = 0.8 + 0.12 * fbmp(x / 48, y / 48, 125, 10, 10, 4) + 0.1 * (hash(x, y, 11) - 0.5) + (hash(x, y, 15) > 0.985 ? 0.1 : 0); return [232 * k, 238 * k, 250 * k]; });
    const grainB = pixTex("snowGrainB", 512, 512, (x, y) => { const k = 255 * clamp(0.5 + 0.35 * (fbmp(x / 20, y / 20, 127, 25, 25, 3) - 0.5) + 0.35 * (hash(x, y, 17) - 0.5), 0, 1); return [k, k, k]; }, true);
    const capM = new THREE.MeshStandardMaterial({ map: rep(grainT, 4, 2), color: night ? 0xc4cede : 0xdde3ee, roughness: 0.78, metalness: 0, envMapIntensity: 0.35, bumpMap: rep(grainB, 4, 2), bumpScale: 2.0 });
    const capMesh = new THREE.Mesh(cap, capM); capMesh.castShadow = capMesh.receiveShadow = true; S.add(capMesh);
    // glints: tiny ice crystals on the snow that catch the light (twinkle, seeded)
    const GN = 2600, gg = new THREE.BufferGeometry(), gpos = new Float32Array(GN * 3), gph = new Float32Array(GN), rg = rnd(121);
    let gi = 0;
    for (let tries = 0; gi < GN && tries < GN * 6; tries++) {
      const onCap = gi < 2000, x = onCap ? -4.8 + rg() * 14 : (rg() - 0.5) * 16, a = (rg() - 0.5) * 1.7;
      if (onCap) { const th = snowTh(x, a); if (th < 0.005) continue; const ang = a + Math.PI / 2, rr = R + 0.11 + th; gpos.set([x, TY + Math.sin(ang) * rr, Math.cos(ang) * rr], gi * 3); }
      else gpos.set([x, 0.32, 1.8 + rg() * 5], gi * 3);
      gph[gi] = rg() * 100; gi++;
    }
    gg.setAttribute("position", new THREE.BufferAttribute(gpos, 3)); gg.setAttribute("ph", new THREE.BufferAttribute(gph, 1));
    const glintM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, uniforms: { uT: { value: 0 }, uA: { value: night ? 0.7 : 1.2 } },
      vertexShader: `attribute float ph; uniform float uT; varying float vA; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); float tw = pow(max(0.0, sin(uT * 2.3 + ph) * sin(uT * 0.7 + ph * 1.7)), 8.0); vA = tw * smoothstep(9.0, 3.0, -mv.z); gl_PointSize = 1.5 + 2.5 * tw; gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uA; varying float vA; void main(){ vec2 d = gl_PointCoord - 0.5; float a = smoothstep(0.5, 0.0, length(d)); gl_FragColor = vec4(vec3(0.9, 0.95, 1.0) * a * vA * uA, 1.0);
        #include <colorspace_fragment>
      }` });
    S.add(new THREE.Points(gg, glintM));
    // paper scraps: squared notebook paper with torn edges, lying on the trunk top, pencil on top
    const scrap = (key, draw, seed) => ctex(key, 1024, 760, (c, w, h) => {
      const r = rnd(seed); c.save(); c.beginPath(); const pts = [];
      for (let i = 0; i <= 40; i++) pts.push([30 + (w - 60) * i / 40, 24 + r() * 14]);
      for (let i = 0; i <= 30; i++) pts.push([w - 26 - r() * 10, 24 + (h - 48) * i / 30]);
      for (let i = 40; i >= 0; i--) pts.push([30 + (w - 60) * i / 40, h - 24 - r() * (i % 3 ? 10 : 22)]);
      for (let i = 30; i >= 0; i--) pts.push([24 + r() * 8, 24 + (h - 48) * i / 30]);
      pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); c.clip();
      agedPaper(c, w, h, seed, { tone: "#ece8dc", age: 0.35, fox: 2 }); squared(c, w, h, 34, "rgba(100,130,170,0.28)");
      draw(c, w, h); inkIntoPaper(c, w, h, seed); c.restore();
    });
    const calcT = scrap("scrapCalc", (c) => {
      const P = (str, x, y, fs, sd) => pencilS(c, str, x, y, fs, sd);
      P("Δm ≈ 1/5 · m_{p}", 80, 130, 52, 1);
      P("m_{p} ≈ 1,67·10^{-24} g", 80, 220, 52, 2);
      P("Δm·c² ≈ 1/5 · 1,67·10^{-24} · (3·10^{10})²", 70, 320, 38, 3);
      P("≈ 3·10^{-4} erg", 250, 410, 48, 4);
      P("1 MeV = 1,6·10^{-6} erg", 80, 510, 46, 5);
      const xe = P("Δm·c² ≈ 190 MeV", 70, 625, 50, 6); P("≈ 200 MeV", xe + 24, 625, 50, 7);
      c.strokeStyle = "rgba(60,60,66,0.75)"; c.lineWidth = 4; c.beginPath(); c.moveTo(70, 650); c.bezierCurveTo(300, 662, 600, 640, xe + 270, 652); c.stroke(); c.beginPath(); c.moveTo(80, 664); c.bezierCurveTo(320, 676, 620, 656, xe + 260, 668); c.stroke();
    }, 131);
    const dropT = scrap("scrapDrop", (c, w) => {
      // the liquid-drop picture: a nucleus elongates, necks and splits in two
      c.strokeStyle = "rgba(62,62,68,0.8)"; c.lineWidth = 4;
      const blob = (cx, cy, rx, ry) => { c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, TAU); c.stroke(); };
      blob(170, 300, 95, 95);
      c.beginPath(); for (let i = 0; i <= 64; i++) { const a = i / 64 * TAU, r0 = 1 - 0.38 * Math.pow(Math.sin(a), 2); const x = 470 + Math.cos(a) * 150, y = 300 + Math.sin(a) * 80 * r0; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      blob(745, 300, 72, 72); blob(905, 300, 72, 72);
      for (const [x0, x1] of [[280, 320], [640, 670]]) { c.beginPath(); c.moveTo(x0, 300); c.lineTo(x1, 300); c.moveTo(x1 - 14, 290); c.lineTo(x1, 300); c.lineTo(x1 - 14, 310); c.stroke(); }
      c.beginPath(); c.moveTo(690, 230); c.lineTo(640, 205); c.moveTo(960, 230); c.lineTo(1000, 205); c.stroke();
      handwriting(c, { x: 90, y: 520, w: w - 200, lh: 80, xh: 24, seed: 141, ink: GRAPH, lines: 2, lastShort: true });
    }, 137);
    const noteT = scrap("scrapNote", (c, w) => { handwriting(c, { x: 80, y: 140, w: w - 180, lh: 84, xh: 24, seed: 151, ink: GRAPH, lines: 6, lastShort: true }); }, 149);
    const topY = (z) => TY + Math.sqrt(Math.max(0, (R + 0.16) ** 2 - z * z));
    const mkScrap = (tex, w, d, x, z, rot, seed) => {
      const geo = new THREE.PlaneGeometry(w, d, 30, 24); geo.rotateX(-Math.PI / 2); geo.rotateY(rot);
      const p = geo.attributes.position; for (let i = 0; i < p.count; i++) { const lx = p.getX(i) + x, lz = p.getZ(i) + z; p.setXYZ(i, lx, topY(lz) + 0.02 + 0.012 * Math.sin(lx * 3 + seed), lz); }
      geo.computeVertexNormals();
      const m = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ map: tex, alphaTest: 0.5, roughness: 0.9, envMapIntensity: 0.1, bumpMap: rep(paperBump(), 2, 2), bumpScale: 0.3 }));
      m.castShadow = m.receiveShadow = true; const g = new THREE.Group(); g.add(m); S.add(g); return g;
    };
    const scraps = [mkScrap(noteT, 1.15, 0.85, -0.9, -0.25, 0.35, 1), mkScrap(dropT, 1.15, 0.85, 0.75, -0.15, -0.28, 2), mkScrap(calcT, 1.25, 0.93, -0.05, 0.25, 0.06, 3)];
    const pen = new THREE.Group(); pen.position.set(0.4, topY(0.55) + 0.05, 0.55); pen.rotation.set(0, 0.5, 0.0); S.add(pen);
    const pb = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.3, 6), new THREE.MeshStandardMaterial({ color: 0x6b4f2a, roughness: 0.55 })); pb.rotation.z = Math.PI / 2; pen.add(pb);
    const ptip = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.16, 16), new THREE.MeshStandardMaterial({ color: 0xd7b98e, roughness: 0.7 })); ptip.rotation.z = -Math.PI / 2; ptip.position.x = 0.73; pen.add(ptip);
    shadowAll(pen);
    if (night) pen.visible = false;
    // falling snow with depth of field: near/far flakes are big soft discs, flakes at the focus distance are small and crisp
    const FN = night ? 2600 : 1600, fg = new THREE.BufferGeometry(), fpos = new Float32Array(FN * 3), fseed = new Float32Array(FN), rf = rnd(161);
    for (let i = 0; i < FN; i++) { fpos.set([(rf() - 0.5) * 26, rf() * 12, (rf() - 0.5) * 22 + 2], i * 3); fseed[i] = rf(); }
    fg.setAttribute("position", new THREE.BufferAttribute(fpos, 3)); fg.setAttribute("sd", new THREE.BufferAttribute(fseed, 1));
    const flakeM = new THREE.ShaderMaterial({ transparent: true, depthWrite: false, uniforms: { uT: { value: 0 }, uFocus: { value: 4 }, uWind: { value: 0 }, uA: { value: 1 } },
      vertexShader: `attribute float sd; uniform float uT, uFocus, uWind; varying float vA;
        void main(){ vec3 p = position; float fall = 0.55 + 0.35 * sd; p.y = mod(p.y - uT * fall, 12.0) - 0.5;
          p.x += sin(uT * (0.6 + sd) + sd * 40.0) * 0.18 + uWind * mod(uT * (0.8 + sd), 26.0); p.x = mod(p.x + 13.0, 26.0) - 13.0; p.z += cos(uT * 0.7 + sd * 31.0) * 0.12;
          vec4 mv = modelViewMatrix * vec4(p, 1.0); float dpt = -mv.z; float coc = abs(dpt - uFocus) / max(dpt, 0.1);
          float sz = (0.035 + 0.02 * sd) * 1080.0 / max(dpt, 0.2) * 0.9; gl_PointSize = clamp(sz + coc * 60.0, 1.5, 70.0);
          vA = clamp(1.6 / (1.0 + coc * 7.0), 0.04, 0.9) * smoothstep(0.3, 1.2, dpt) * smoothstep(30.0, 14.0, dpt);
          gl_Position = projectionMatrix * mv; }`,
      fragmentShader: `uniform float uA; varying float vA; void main(){ float r = length(gl_PointCoord - 0.5); float a = smoothstep(0.5, 0.12, r); gl_FragColor = vec4(vec3(0.93, 0.95, 1.0), a * vA * uA);
        #include <colorspace_fragment>
      }` });
    const flakes = new THREE.Points(fg, flakeM); flakes.frustumCulled = false; S.add(flakes);
    const C = cam(night ? 30 : 34);
    // cameras (film time): [ft, tx, ty, tz, dist, az, el, ox, oy]
    const ty = topY(0);
    const K = mode === "trunk"
      ? [[414.92, -3.1, ty - 0.6, 0.9, 4.6, -46, 4, 0, 0], [417.4, -1.8, ty - 0.35, 0.6, 3.3, -46, 9, 0, 0], [419.6, -0.3, ty - 0.05, 0.25, 3.2, -30, 20, 0, 0]]
      : mode === "calc"
        ? [[446.82, 0.05, ty, 0.25, 2.5, 8, 66, 0, 0], [450.0, 0.05, ty, 0.25, 2.2, 4, 70, 0, 0], [450.6, 0.1, ty, 0.3, 3.0, 0, 64, -480, 230], [454.6, 0.1, ty, 0.3, 3.2, -4, 62, -500, 240], [456.12, 0.1, ty, 0.3, 3.1, -6, 62, -470, 220]]
        : [[494.96, -6.0, 0.3, 3.6, 4.2, -40, 26, 0, 0], [497.6, -4.2, 1.2, 2.4, 6.0, -30, 20, 0, 40], [500.4, -1.4, ty, 0.4, 5.6, -18, 18, -150, 90], [506.6, 0.0, ty, 0.2, 5.0, -8, 22, -380, 160]];
    const LIFT = EV.snow.lift, GONE = EV.snow.gone;
    return (t) => {
      const ft = T0 + t;
      if (night) {
        setGround(seg(ft, 494.96, 506.0) * 0.85);
        // the wind takes the scraps one by one: they peel up, tumble and drift off to the right
        scraps.forEach((g, i) => { const t0 = LIFT + i * 0.9, k = clamp((ft - t0) / 3.2, 0, 1), e = k * k; g.position.set(e * 7 + Math.sin(k * 5 + i) * 0.3, e * 2.6 + Math.sin(k * Math.PI) * 0.6, -e * 1.5); g.rotation.set(Math.sin(k * 7 + i) * 0.6 * k, k * (1.5 + i), Math.sin(k * 5) * 0.8 * k); g.visible = ft < t0 + 3.2; });
        flakeM.uniforms.uWind.value = 0.15 + 0.5 * seg(ft, LIFT - 1, LIFT + 1);
      }
      flakeM.uniforms.uT.value = ft; glintM.uniforms.uT.value = ft;
      camKeys(C, K, ft);
      flakeM.uniforms.uFocus.value = cr(K.map((k) => [k[0], k[4]]), ft);   // focus on the camera target
      return [S, C];
    };
  }
  // pencil with simple ^{...} superscripts
  function pencilS(g, str, x, y, fs, seed) {
    const parts = str.split(/([\^_]\{[^}]*\})/); let sd = seed * 31;
    for (const p of parts) { if (!p) continue; if (p[0] === "^") x = pencil(g, p.slice(2, -1), x + 2, y - fs * 0.42, fs * 0.62, sd++) + 4; else if (p[0] === "_") x = pencil(g, p.slice(2, -1), x + 1, y + fs * 0.18, fs * 0.6, sd++) + 3; else x = pencil(g, p, x, y, fs, sd++); }
    return x;
  }
  LABK.snow = (o) => snowScene(o);
})();
