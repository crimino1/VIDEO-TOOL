/* k_chamber.js — group A of "The Dirac Equation": LABK.chamber (Carl Anderson's 1932 cloud chamber) and LABK.anti (particles and their twins).
   Each kind: LABK.name = (o) => (t, d) => [scene, camera, pins]; ft = o.T0 + t is film time. Pure functions of t.
   CHARGE RULE (matches assets/img/positron.jpg, seen from the window side): positive charges circulate COUNTER-clockwise (R > 0 in X3.trackPath),
   electrons CLOCKWISE (R < 0), whatever their heading. In the opening (bend/bend2/other) every trail runs UPWARD, so the odd positive trail in "other"
   has the real photograph's shape (it cuts in at 42.62). Neutral beads (no charge colour) in "ambig" and "lead"; the warm positron only from "up".
   EV = event times in FILM seconds; every visible event is keyed off this table so the sound pass can read it. */
(function () {
  const { THREE, seg, smooth, lerp, clamp, rnd, W, H } = L3;
  const EV = {
    trail: { a: 22.45, b: 23.95 },                                   // straight droplet trails form (0.4 s each)
    bend: { on: 29.62, a: 30.95, b: 31.75 },                          // magnet on (ammeter rises, copper warms), bent trails form
    bend2: { a: 32.75, b: 33.55, c: 34.45, d: 35.35 },               // electron trails, all curving clockwise
    other: { e: 36.95, p: 38.2 },                                     // a last electron, then THE trail curving the other way
    ambig: { dn0: 672.4, dn1: 675.7, up0: 678.4, up1: 681.95 },        // neutral light runs the arc down, then up
    lead: { s0: 683.3, s1: 685.75, b0: 686.9, hit: 688.3, b1: 690.9 }, // lead plate slides in, bead crosses it, slows
    track: { lo: 697.7, up: 701.3 },                                  // pins: gentle curve / tighter curve
    up: { b0: 707.55, hit: 709.25, b1: 711.3 },                       // positron bead travels the real track upward through the plate
    real: { glow: 746.0, fade: 749.3 },
    proof: { form: 1003.35 },
    rays: [10.7, 11.4, 12.0, 12.6, 13.1, 13.6],                       // streak starts (each ~1.7 s to reach the air)
    pairs: { e: 780.8, p: 784.9, n: 787.1 },                         // pairs light up (electron pair already in at the cut)
    antih: { in0: 802.5, in1: 805.0 },
  };
  const V3 = THREE.Vector3, TAU = Math.PI * 2, V = (x, y, z) => new V3(x, y, z), ZERO = V(0, 0, 0);
  const lin = (t, a, b) => clamp((t - a) / (b - a), 0, 1);

  // ---------------------------------------------------------------- camera
  function cr(K, t) {
    const n = K.length; if (t <= K[0][0]) return K[0][1]; if (t >= K[n - 1][0]) return K[n - 1][1];
    let i = 0; while (t >= K[i + 1][0]) i++;
    const a = K[Math.max(i - 1, 0)], b = K[i], c = K[i + 1], d = K[Math.min(i + 2, n - 1)], h = c[0] - b[0], u = (t - b[0]) / h;
    const m1 = i === 0 ? (c[1] - b[1]) * 0.5 : (c[1] - a[1]) / (c[0] - a[0]) * h, m2 = i + 2 >= n ? (c[1] - b[1]) * 0.5 : (d[1] - b[1]) / (d[0] - b[0]) * h;
    const u2 = u * u, u3 = u2 * u;
    return (2 * u3 - 3 * u2 + 1) * b[1] + (u3 - 2 * u2 + u) * m1 + (-2 * u3 + 3 * u2) * c[1] + (u3 - u2) * m2;
  }
  // K rows: [ft, px, py, pz, tx, ty, tz, ox, oy, fov]  (positions relative to base; ox/oy = view offset in px, negative ox puts the subject right)
  function camAt(C, K, ft, base) {
    const g = (j, d) => cr(K.map((k) => [k[0], k[j] === undefined ? d : k[j]]), ft), b = base || ZERO;
    C.position.set(b.x + g(1), b.y + g(2), b.z + g(3)); C.lookAt(b.x + g(4), b.y + g(5), b.z + g(6));
    C.fov = g(9, 30); const ox = g(7, 0), oy = -g(8, 0);
    if (ox || oy) C.setViewOffset(W, H, ox, oy, W, H); else C.clearViewOffset();
    C.updateProjectionMatrix();
  }
  const cam = (near, far) => new THREE.PerspectiveCamera(30, W / H, near || 0.05, far || 200);

  // ---------------------------------------------------------------- textures (file-local cache)
  const TC = {};
  function ctex(key, w, h, fn, o) {
    if (TC[key]) return TC[key];
    const c = document.createElement("canvas"); c.width = w; c.height = h; fn(c.getContext("2d"), w, h);
    const t = new THREE.CanvasTexture(c); t.anisotropy = 8;
    if (o && o.data) t.colorSpace = THREE.NoColorSpace; else t.colorSpace = THREE.SRGBColorSpace;
    if (o && o.rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(o.rep[0], o.rep[1]); }
    return (TC[key] = t);
  }
  function speckle(g, w, h, n, seed, a, col) { const r = rnd(seed); for (let i = 0; i < n; i++) { g.fillStyle = `rgba(${col || "0,0,0"},${a * (0.3 + r())})`; const s = 1 + r() * 3; g.fillRect(r() * w, r() * h, s, s); } }
  function blotch(g, w, h, n, seed, rgb, a, rmin, rmax) {
    const r = rnd(seed);
    for (let i = 0; i < n; i++) { const x = r() * w, y = r() * h, rr = rmin + r() * (rmax - rmin), gr = g.createRadialGradient(x, y, 0, x, y, rr); gr.addColorStop(0, `rgba(${rgb},${a * (0.4 + r() * 0.6)})`); gr.addColorStop(1, `rgba(${rgb},0)`); g.fillStyle = gr; g.fillRect(x - rr, y - rr, 2 * rr, 2 * rr); }
  }
  // varnished copper windings on a coil face (concentric turns, mapped onto RingGeometry UVs); same canvas is the bump map
  const copperFace = (bump) => ctex(bump ? "cuB" : "cuF", 2048, 2048, (g, w) => {
    const c = w / 2, r = rnd(5);
    g.fillStyle = bump ? "#000" : "#1c120b"; g.fillRect(0, 0, w, w);
    for (let rr = c * 0.24; rr < c * 0.995; rr += 26) {
      const k = 0.78 + 0.3 * r();
      if (bump) { for (let j = 0; j < 9; j++) { const v = Math.round(255 * Math.sin((j + 0.5) / 9 * Math.PI)); g.strokeStyle = `rgb(${v},${v},${v})`; g.lineWidth = 2.6; g.beginPath(); g.arc(c, c, rr + 1 + j * 2.4, 0, TAU); g.stroke(); } }
      else {
        for (let j = 0; j < 9; j++) { const s = Math.sin((j + 0.5) / 9 * Math.PI), kk = k * (0.62 + 0.45 * s); g.strokeStyle = `rgb(${Math.min(255, 176 * kk) | 0},${Math.min(255, 98 * kk) | 0},${Math.min(255, 56 * kk) | 0})`; g.lineWidth = 2.6; g.beginPath(); g.arc(c, c, rr + 1 + j * 2.4, 0, TAU); g.stroke(); }
      }
    }
    if (!bump) { blotch(g, w, w, 260, 7, "40,22,10", 0.35, 20, 120); blotch(g, w, w, 60, 8, "70,90,60", 0.08, 30, 90); speckle(g, w, w, 9000, 9, 0.12); }
  }, bump ? { data: true } : null);
  // shellacked cotton tape wound round the coil (axial strips on the sides and the bore)
  const tapeTex = (bump) => ctex(bump ? "tapeB" : "tape", 512, 256, (g, w, h) => {
    const r = rnd(3); g.fillStyle = bump ? "#808080" : "#2a211a"; g.fillRect(0, 0, w, h);
    for (let x = 0; x < w; x += 16) { const k = 0.85 + r() * 0.3;
      if (bump) { const gr = g.createLinearGradient(x, 0, x + 16, 0); gr.addColorStop(0, "#5a5a5a"); gr.addColorStop(0.2, "#b0b0b0"); gr.addColorStop(1, "#6a6a6a"); g.fillStyle = gr; g.fillRect(x, 0, 16, h); }
      else { g.fillStyle = `rgb(${44 * k | 0},${34 * k | 0},${26 * k | 0})`; g.fillRect(x, 0, 16, h); g.fillStyle = "rgba(0,0,0,.5)"; g.fillRect(x, 0, 2, h); g.fillStyle = "rgba(120,100,75,.25)"; g.fillRect(x + 2, 0, 2, h); } }
    if (!bump) { speckle(g, w, h, 5000, 3, 0.1, "120,105,85"); blotch(g, w, h, 40, 4, "0,0,0", 0.3, 10, 60); blotch(g, w, h, 20, 5, "110,80,50", 0.12, 10, 50); }
  }, { rep: [16, 1], data: !!bump });
  // the same tape seen on a coil FACE: every wrap is a radial strip (narrow at the bore), mapped onto RingGeometry UVs
  const faceTex = (bump) => ctex(bump ? "faceB" : "face", 2048, 2048, (g, w) => {
    const c = w / 2, r = rnd(19), n = 260; g.fillStyle = bump ? "#808080" : "#2a211a"; g.fillRect(0, 0, w, w);
    for (let i = 0; i < n; i++) { const a0 = i / n * TAU, a1 = (i + 1.08) / n * TAU, k = 0.82 + r() * 0.34;
      g.beginPath(); g.moveTo(c + Math.cos(a0) * c * 0.2, c + Math.sin(a0) * c * 0.2); g.lineTo(c + Math.cos(a0) * c, c + Math.sin(a0) * c); g.lineTo(c + Math.cos(a1) * c, c + Math.sin(a1) * c); g.lineTo(c + Math.cos(a1) * c * 0.2, c + Math.sin(a1) * c * 0.2); g.closePath();
      g.fillStyle = bump ? `rgb(${150 * k | 0},${150 * k | 0},${150 * k | 0})` : `rgb(${46 * k | 0},${35 * k | 0},${26 * k | 0})`; g.fill();
      g.strokeStyle = bump ? "#303030" : "rgba(0,0,0,.55)"; g.lineWidth = 2; g.beginPath(); g.moveTo(c + Math.cos(a0) * c * 0.2, c + Math.sin(a0) * c * 0.2); g.lineTo(c + Math.cos(a0) * c, c + Math.sin(a0) * c); g.stroke(); }
    if (!bump) { blotch(g, w, w, 160, 20, "0,0,0", 0.3, 30, 160); blotch(g, w, w, 60, 21, "120,85,50", 0.1, 30, 120); speckle(g, w, w, 16000, 22, 0.1, "140,120,95"); }
  }, bump ? { data: true } : null);
  const brickTex = () => ctex("brick", 1024, 1024, (g, w, h) => {
    const r = rnd(12), bh = 48, bw = 150, m = 7;
    g.fillStyle = "#4a443d"; g.fillRect(0, 0, w, h);
    for (let y = 0, row = 0; y < h; y += bh + m, row++) for (let x = -(row % 2) * (bw / 2); x < w; x += bw + m) {
      const k = 0.7 + r() * 0.45, hue = r();
      g.fillStyle = `rgb(${(108 + hue * 30) * k | 0},${(58 + hue * 12) * k | 0},${(42 + hue * 6) * k | 0})`; g.fillRect(x, y, bw, bh);
      g.fillStyle = `rgba(0,0,0,${0.15 + r() * 0.2})`; g.fillRect(x, y + bh - 6, bw, 6);
    }
    speckle(g, w, h, 30000, 13, 0.12); speckle(g, w, h, 8000, 14, 0.08, "220,200,170"); blotch(g, w, h, 30, 15, "20,14,10", 0.35, 60, 260);
  }, { rep: [5, 2.2] });
  const plasterTex = () => ctex("plaster", 512, 512, (g, w, h) => { g.fillStyle = "#6d6253"; g.fillRect(0, 0, w, h); blotch(g, w, h, 90, 21, "40,32,24", 0.25, 30, 140); blotch(g, w, h, 60, 22, "160,145,120", 0.12, 20, 90); speckle(g, w, h, 14000, 23, 0.08); }, { rep: [3, 2] });
  const woodTex = (key, base, rep) => ctex(key, 1024, 512, (g, w, h) => {
    const r = rnd(key.length * 7 + 3); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 260; i++) { const y = r() * h, a = 0.04 + r() * 0.12, amp = 2 + r() * 6, f = 0.002 + r() * 0.01, ph = r() * 9; g.strokeStyle = r() < 0.6 ? `rgba(0,0,0,${a})` : `rgba(255,220,170,${a * 0.5})`; g.lineWidth = 0.6 + r() * 1.8; g.beginPath(); for (let x = 0; x <= w; x += 16) { const yy = y + Math.sin(x * f + ph) * amp; if (x) g.lineTo(x, yy); else g.moveTo(x, yy); } g.stroke(); }
    speckle(g, w, h, 5000, 31, 0.06);
  }, { rep: rep || [1, 1] });
  const planksTex = () => ctex("planks", 1024, 1024, (g, w, h) => {
    const r = rnd(41), ph = 128; g.fillStyle = "#2a1c13"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += ph) {
      const k = 0.75 + r() * 0.4; g.fillStyle = `rgb(${62 * k | 0},${42 * k | 0},${28 * k | 0})`; g.fillRect(0, y + 2, w, ph - 4);
      for (let i = 0; i < 40; i++) { const yy = y + 4 + r() * (ph - 8); g.strokeStyle = `rgba(0,0,0,${0.05 + r() * 0.12})`; g.lineWidth = 1 + r() * 2; g.beginPath(); g.moveTo(0, yy); g.bezierCurveTo(w * 0.3, yy + (r() - 0.5) * 14, w * 0.6, yy + (r() - 0.5) * 14, w, yy); g.stroke(); }
      const cut = r() * w; g.fillStyle = "rgba(0,0,0,.6)"; g.fillRect(cut, y, 3, ph);
    }
    blotch(g, w, h, 40, 42, "0,0,0", 0.3, 40, 200); blotch(g, w, h, 30, 43, "150,120,90", 0.06, 40, 160);
  }, { rep: [5, 5] });
  const ironTex = () => ctex("iron", 512, 512, (g, w, h) => { g.fillStyle = "#2e3331"; g.fillRect(0, 0, w, h); blotch(g, w, h, 80, 51, "10,12,12", 0.4, 10, 80); blotch(g, w, h, 40, 52, "90,80,60", 0.1, 10, 50); speckle(g, w, h, 12000, 53, 0.12); }, { rep: [2, 2] });
  const slateTex = () => ctex("slate", 512, 512, (g, w, h) => { g.fillStyle = "#1d1f22"; g.fillRect(0, 0, w, h); blotch(g, w, h, 70, 61, "60,64,70", 0.15, 20, 120); speckle(g, w, h, 9000, 62, 0.1, "160,160,160"); });
  const dialTex = () => ctex("dial", 512, 512, (g, w) => {
    const c = w / 2; g.fillStyle = "#e6dcc4"; g.fillRect(0, 0, w, w); blotch(g, w, w, 30, 71, "120,90,40", 0.12, 20, 120);
    g.strokeStyle = "#1c1915"; g.fillStyle = "#1c1915"; g.lineWidth = 3; g.beginPath(); g.arc(c, c + 70, 190, -Math.PI * 0.78, -Math.PI * 0.22); g.stroke();
    g.font = "19px Georgia, serif"; g.textAlign = "center"; g.textBaseline = "middle";
    for (let i = 0; i <= 50; i++) { const a = -Math.PI * 0.78 + i / 50 * Math.PI * 0.56, L = i % 10 === 0 ? 30 : i % 5 === 0 ? 20 : 11; g.lineWidth = i % 10 === 0 ? 3 : 1.5; g.beginPath(); g.moveTo(c + Math.cos(a) * 190, c + 70 + Math.sin(a) * 190); g.lineTo(c + Math.cos(a) * (190 - L), c + 70 + Math.sin(a) * (190 - L)); g.stroke(); if (i % 10 === 0) g.fillText(String(i / 10 * 200), c + Math.cos(a) * 140, c + 70 + Math.sin(a) * 140); }
    g.font = "bold 24px Georgia, serif"; g.fillText("AMPERES", c, c + 120); g.font = "italic 17px Georgia, serif"; g.fillText("D.C. AMMETER · No. 3", c, c + 160);
    g.strokeStyle = "#8a7a58"; g.lineWidth = 10; g.beginPath(); g.arc(c, c, c - 6, 0, TAU); g.stroke();
  });
  const softDot = () => ctex("dot", 64, 64, (g) => { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.35, "rgba(255,255,255,.35)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); });
  // the glass plate's emulsion border (dense dark negative around the round chamber image)
  const emulsionTex = () => ctex("emul", 1024, 860, (g, w, h) => {
    g.fillStyle = "#2b2620"; g.fillRect(0, 0, w, h); blotch(g, w, h, 60, 81, "70,60,46", 0.25, 30, 160); blotch(g, w, h, 30, 82, "10,8,6", 0.4, 30, 140);
    const r = rnd(83); g.strokeStyle = "rgba(190,180,160,.12)"; for (let i = 0; i < 40; i++) { g.lineWidth = 0.5 + r(); g.beginPath(); const x = r() * w, y = r() * h; g.moveTo(x, y); g.lineTo(x + (r() - 0.5) * 220, y + (r() - 0.5) * 60); g.stroke(); }
    speckle(g, w, h, 5000, 84, 0.2, "200,190,170");
    g.fillStyle = "rgba(225,215,190,.5)"; g.font = "italic 34px Georgia, serif"; g.fillText("Aug. 2 · 1932", 46, h - 40); // scratched into the emulsion, as plates were
  });

  // ---------------------------------------------------------------- materials (shared, created once)
  let MAT = null;
  function mats() {
    if (MAT) return MAT;
    const std = (o) => new THREE.MeshStandardMaterial(o);
    MAT = {
      face: new THREE.MeshPhysicalMaterial({ color: 0x8a7c70, map: faceTex(false), bumpMap: faceTex(true), bumpScale: 1.6, roughness: 0.62, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.45 }),
      tape: new THREE.MeshPhysicalMaterial({ map: tapeTex(false), bumpMap: tapeTex(true), bumpScale: 1.4, roughness: 0.62, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.45 }),
      bore: new THREE.MeshPhysicalMaterial({ map: tapeTex(false), roughness: 0.7, metalness: 0, color: 0x9a9088, side: THREE.BackSide }),
      cu: std({ color: 0xb8714a, metalness: 1, roughness: 0.3, emissive: 0xff7a30, emissiveIntensity: 0 }),
      iron: std({ map: ironTex(), roughness: 0.58, metalness: 0.45, color: 0xbfc4c0 }),
      steel: std({ color: 0x9a9fa4, roughness: 0.34, metalness: 1 }),
      brass: X3.mats.brass, brassDark: X3.mats.brassDark,
      bronze: std({ color: 0x6a4c2c, roughness: 0.42, metalness: 1 }),
      pipe: std({ color: 0xb36f45, roughness: 0.33, metalness: 1 }),
      hose: std({ color: 0x141312, roughness: 0.6, metalness: 0 }),
      brick: std({ map: brickTex(), bumpMap: brickTex(), bumpScale: 1.5, roughness: 0.92 }),
      plaster: std({ map: plasterTex(), roughness: 0.95 }),
      floor: std({ map: planksTex(), roughness: 0.62, metalness: 0, envMapIntensity: 0.4 }),
      oak: std({ map: woodTex("oak", "#3d281a", [1, 1]), roughness: 0.5, metalness: 0 }),
      oakDark: std({ map: woodTex("oakD", "#24170f", [1, 1]), roughness: 0.45, metalness: 0 }),
      black: std({ color: 0x121212, roughness: 0.45, metalness: 0.3 }),
      bellows: std({ color: 0x0f0e0d, roughness: 0.75, metalness: 0 }),
      slate: std({ map: slateTex(), roughness: 0.38, metalness: 0 }),
      lead: std({ color: 0x55585c, roughness: 0.55, metalness: 0.65 }),
      velvet: new THREE.MeshBasicMaterial({ color: 0x070708 }),   // black velvet: unlit so the warm key through the bore leaves no patch
      window: new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.04, transparent: true, opacity: 0.06, clearcoat: 1, envMapIntensity: 0.9, depthWrite: false }),
      glassPlate: new THREE.MeshPhysicalMaterial({ color: 0x8fa89c, metalness: 0, roughness: 0.08, transparent: true, opacity: 0.2, envMapIntensity: 1.2, depthWrite: false }),
      dial: std({ map: dialTex(), roughness: 0.5 }),
      ink: X3.mats.ink,
    };
    return MAT;
  }

  // ---------------------------------------------------------------- chamber geometry and tracks (chamber units: 1 = 10 cm; visible window radius RC)
  const RC = 0.85;
  // circles fitted to the real track in positron.jpg (disc-normalised: centre 0,0, radius 1; y up). Upper arc tighter: ratio 2.3.
  const ARC_LO = { cx: -1.646, cy: 0.221, R: 1.585 }, ARC_UP = { cx: -0.743, cy: 0.195, R: 0.696 };
  function arcY(A, y0, y1, n) { const out = []; for (let i = 0; i <= n; i++) { const y = lerp(y0, y1, i / n); out.push(V((A.cx + Math.sqrt(A.R * A.R - (y - A.cy) * (y - A.cy))) * RC, y * RC, 0)); } return out; }
  const PH = { lo: arcY(ARC_LO, -0.84, -0.05, 90), up: arcY(ARC_UP, 0.05, 0.72, 90) };   // the photograph's track: below / above the plate
  const PHjoin = PH.lo.concat(PH.up);
  function clipDisc(pts, r) { const out = []; let on = false; for (const p of pts) { if (Math.hypot(p.x, p.y) < r) { out.push(p); on = true; } else if (on) break; } return out; }
  const arc = (x0, y0, dirDeg, R, len) => clipDisc(X3.trackPath(x0 * RC, y0 * RC, dirDeg * Math.PI / 180, R * RC, len * RC, 160), RC * 0.985);
  // arc-length sampler
  function sampler(pts) { const acc = [0]; for (let i = 1; i < pts.length; i++) acc.push(acc[i - 1] + pts[i].distanceTo(pts[i - 1])); const L = acc[acc.length - 1];
    return { L, at(u, out) { const d = clamp(u, 0, 1) * L; let j = 0; while (j < acc.length - 2 && acc[j + 1] < d) j++; const k = (d - acc[j]) / Math.max(1e-9, acc[j + 1] - acc[j]); return (out || new V3()).lerpVectors(pts[j], pts[j + 1], k); } }; }

  // a droplet trail = crisp X3.trail beads + a wider haze trail that takes over as the droplets diffuse
  function track(G, pts, o) {
    o = o || {};
    const warm = !!o.warm, size = o.size || 0.0042, dens = (o.dens || 420) * 1.9;
    const m1 = new THREE.MeshStandardMaterial({ color: warm ? 0xf6e7cf : 0xf2f2ee, roughness: 0.35, metalness: 0, emissive: warm ? 0x3c2c18 : 0x2c2c2a, transparent: true });
    const m2 = new THREE.MeshBasicMaterial({ color: warm ? 0xd9c7aa : 0xc9ccce, transparent: true, opacity: 0, depthWrite: false });
    const a = X3.trail(pts, { seed: o.seed || 3, density: dens, size, mat: m1 });
    const b = X3.trail(pts, { seed: (o.seed || 3) + 17, density: dens * 0.4, size: size * 1.9, jitter: size * 8, mat: m2 });
    a.mesh.frustumCulled = b.mesh.frustumCulled = false; G.add(a.mesh, b.mesh);
    const tf = o.tf !== undefined ? o.tf : -1e9, fd = o.fd || 0.4, floor = o.floor !== undefined ? o.floor : 0.3, life = o.life || 7;
    return {
      pts, S: sampler(pts),
      set(ft, k) {   // k: extra multiplier (0..1) for fades
        const u = lin(ft, tf, tf + fd), age = Math.max(0, ft - tf - fd), kk = k === undefined ? 1 : k;
        a.set(u); b.set(u);
        m1.opacity = kk * lerp(1, floor, smooth(age / life)); m2.opacity = kk * 0.12 * smooth(age / 1.5) * lerp(1, 0.5, smooth(age / (life * 1.5)));
        a.mesh.visible = a.mesh.visible && m1.opacity > 0.003; b.mesh.visible = b.mesh.visible && m2.opacity > 0.003;
      },
    };
  }
  // soft additive ribbon along a path (the "glowing faint warm" positron track)
  function glowLine(G, pts, col, r, op) {
    const curve = new THREE.CatmullRomCurve3(pts), m = new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: op, blending: THREE.AdditiveBlending, depthWrite: false });
    const mesh = new THREE.Mesh(new THREE.TubeGeometry(curve, 200, r, 8, false), m); mesh.frustumCulled = false; G.add(mesh); return { mesh, m };
  }
  // neutral travelling light (no charge colour) / the warm positron
  function bead(G, kind) {
    const g = new THREE.Group();
    if (kind === "pos") { g.add(X3.positron(0.04)); const h = X3.halo(0xffdcb0, 0.3, 0.45); g.add(h); g.userData.h = h; }
    else { g.add(new THREE.Mesh(new THREE.SphereGeometry(0.014, 16, 12), new THREE.MeshBasicMaterial({ color: 0xf5f3ee }))); const h = L3.glowSprite(0xf2f1ee, 0.16, 0.5); g.add(h); g.userData.h = h; }
    g.visible = false; G.add(g); return g;
  }

  // mist inside the chamber: fbm in the shader (domain-warped), brightest on the arc-lamp side (-x)
  const MIST_V = "varying vec3 vP; void main(){ vP = position; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }";
  const MIST_F = `varying vec3 vP; uniform float uT, uOp, uSeed; uniform vec3 uCol;
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7)) + uSeed) * 43758.5453); }
    float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f); return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
    float fbm(vec2 p){ float s = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ s += a*n(p); p = p*2.03 + vec2(1.7, 9.2); a *= 0.5; } return s; }
    void main(){
      vec2 p = vP.xy; vec2 q = p*2.4 + vec2(uT*0.045, -uT*0.02);
      vec2 w = vec2(fbm(q + vec2(0.0, uT*0.05)), fbm(q + vec2(5.2, 1.3) - uT*0.035));
      float d = smoothstep(0.42, 0.95, fbm(q*1.2 + 2.2*w));
      float r = length(p) / 0.86; float edge = 1.0 - smoothstep(0.8, 1.0, r);
      float side = mix(1.0, 0.3, clamp((p.x + 0.86) / 1.72, 0.0, 1.0));
      gl_FragColor = vec4(uCol * d * edge * side * uOp, 1.0);
    }`;
  function mistMat(seed) { return new THREE.ShaderMaterial({ vertexShader: MIST_V, fragmentShader: MIST_F, uniforms: { uT: { value: 0 }, uOp: { value: 1 }, uSeed: { value: seed }, uCol: { value: new THREE.Color(0.115, 0.12, 0.125) } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }); }

  // ---------------------------------------------------------------- the 1932 lab (built once, shared by every lab shot; each frame sets all mutable state)
  const CH = V(0, 5.6, 0);
  let LAB = null;
  function lab() {
    if (LAB) return LAB;
    const Mt = mats(), S = new THREE.Scene(); S.environment = L3.env; S.background = new THREE.Color(0x0a0807); S.fog = new THREE.Fog(0x0a0807, 20, 46);
    const add = (geo, mat, x, y, z, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (p || S).add(m); return m; };
    // room
    const floor = add(new THREE.PlaneGeometry(40, 40), Mt.floor, 0, 0, 4); floor.rotation.x = -Math.PI / 2;
    add(new THREE.PlaneGeometry(40, 18), Mt.brick, 0, 9, -6);
    const lw = add(new THREE.PlaneGeometry(30, 18), Mt.plaster, -12, 9, 6); lw.rotation.y = Math.PI / 2;
    const rw = add(new THREE.PlaneGeometry(30, 18), Mt.plaster, 12.5, 9, 6); rw.rotation.y = -Math.PI / 2;
    // ---- magnet: two coil stacks (axis z, standing like wheels), chamber in the gap
    const MG = new THREE.Group(); MG.position.copy(CH); S.add(MG);
    const RO = 4.3, RB = 1.12;
    function coil(z0, z1) {
      const dz = z1 - z0, zc = (z0 + z1) / 2;
      const f1 = add(new THREE.RingGeometry(RB, RO, 160, 1), Mt.face, 0, 0, z1, MG);
      const f2 = add(new THREE.RingGeometry(RB, RO, 160, 1), Mt.face, 0, 0, z0, MG); f2.rotation.y = Math.PI;
      // copper leads: two heavy bus bars out of the top of the stack, bolted brass clamps
      for (const x of [-0.42, 0.42]) { add(new THREE.BoxGeometry(0.16, 1.3, 0.5), Mt.cu, x, RO + 0.55, zc, MG); add(new THREE.BoxGeometry(0.3, 0.22, 0.6), Mt.brass, x, RO + 0.25, zc, MG); add(new THREE.BoxGeometry(0.3, 0.18, 0.6), Mt.brass, x, RO + 1.05, zc, MG); }
      const sh = add(new THREE.CylinderGeometry(RO, RO, dz, 160, 1, true), Mt.tape, 0, 0, zc, MG); sh.rotation.x = Math.PI / 2;
      const bo = add(new THREE.CylinderGeometry(RB, RB, dz, 96, 1, true), Mt.bore, 0, 0, zc, MG); bo.rotation.x = Math.PI / 2;
      for (const z of [z0 + 0.03, z1 - 0.03]) { const band = add(new THREE.TorusGeometry(RO + 0.01, 0.045, 8, 160), Mt.steel, 0, 0, z, MG); }
    }
    coil(0.32, 1.25); coil(-1.5, -0.32);
    // iron frame: base, saddles, four columns, top beam, tie rods with brass nuts
    add(new THREE.BoxGeometry(11.6, 1.0, 4.6), Mt.iron, 0, 0.5 - CH.y, -0.12, MG);
    for (const z of [0.78, -0.91]) add(new THREE.BoxGeometry(3.4, 0.5, 1.0), Mt.iron, 0, 1.25 - CH.y, z, MG);
    add(new THREE.BoxGeometry(11.6, 0.9, 4.6), Mt.iron, 0, 10.45 - CH.y, -0.12, MG);
    for (const x of [-5.0, 5.0]) for (const z of [-1.9, 1.65]) {
      add(new THREE.CylinderGeometry(0.3, 0.3, 9.1, 40), Mt.iron, x, 5.5 - CH.y, z, MG);
      for (const y of [1.0, 10.0]) add(new THREE.CylinderGeometry(0.45, 0.45, 0.18, 6), Mt.brassDark, x, y - CH.y + (y < 5 ? 0.09 : -0.09), z, MG);
    }
    for (let k = 0; k < 8; k++) { const a = (k + 0.5) / 8 * TAU, x = Math.cos(a) * (RO + 0.28), y = Math.sin(a) * (RO + 0.28);
      const rod = add(new THREE.CylinderGeometry(0.06, 0.06, 3.1, 12), Mt.steel, x, y, -0.12, MG); rod.rotation.x = Math.PI / 2;
      for (const z of [1.42, -1.66]) { const nut = add(new THREE.CylinderGeometry(0.12, 0.12, 0.1, 6), Mt.brass, x, y, z, MG); nut.rotation.x = Math.PI / 2; }
      for (const z of [1.3, -1.55]) { const lug = add(new THREE.BoxGeometry(0.34, 0.34, 0.12), Mt.iron, Math.cos(a) * (RO + 0.18), Math.sin(a) * (RO + 0.18), z, MG); lug.rotation.z = a; }
    }
    // water cooling: copper pipes from the coil tops up to the ceiling, brass couplings, rubber hoses, valve wheels
    const tube = (pts, r, mat) => { const m = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 80, r, 12, false), mat, 0, 0, 0, MG); return m; };
    for (const [z, s] of [[0.8, 1], [-0.95, -1]]) {
      tube([V(-0.9, RO - 0.1, z), V(-1.0, RO + 0.6, z), V(-1.2, RO + 1.0, z), V(-2.8, RO + 1.4, z + 0.3 * s), V(-6.5, RO + 1.5, z + 0.5 * s), V(-9, RO + 2.5, z)], 0.075, Mt.pipe);
      tube([V(0.9, RO - 0.1, z), V(1.0, RO + 0.7, z), V(1.4, RO + 1.25, z), V(3.4, RO + 1.6, z + 0.2 * s), V(7, RO + 2.0, z + 0.4 * s), V(10, RO + 2.6, z)], 0.075, Mt.pipe);
      for (const x of [-1.0, 1.0]) { const cpl = add(new THREE.CylinderGeometry(0.12, 0.12, 0.22, 16), Mt.brass, x * 0.95, RO + 0.25, z, MG); }
    }
    tube([V(4.2, RO - 1.2, -1.0), V(4.9, RO - 2.2, -2.4), V(5.4, -2.5, -3.4), V(5.6, -CH.y + 0.05, -3.8)], 0.06, Mt.hose);
    const wheel = add(new THREE.TorusGeometry(0.22, 0.03, 8, 32), Mt.brass, -2.8, RO + 1.75, 1.1, MG);
    add(new THREE.CylinderGeometry(0.035, 0.035, 0.32, 8), Mt.brass, -2.8, RO + 1.58, 1.1, MG);
    // ---- the chamber in the gap
    const CHG = new THREE.Group(); CHG.position.copy(CH); S.add(CHG);
    const body = add(new THREE.CylinderGeometry(1.1, 1.1, 0.6, 96, 1, true), Mt.bronze, 0, 0, -0.06, CHG); body.rotation.x = Math.PI / 2;
    const inner = add(new THREE.CylinderGeometry(0.87, 0.87, 0.42, 96, 1, true), new THREE.MeshStandardMaterial({ color: 0x1a1612, roughness: 0.6, metalness: 0.5, side: THREE.BackSide }), 0, 0, 0.02, CHG); inner.rotation.x = Math.PI / 2;
    add(new THREE.RingGeometry(0.85, 1.11, 128, 1), Mt.brass, 0, 0, 0.235, CHG);
    add(new THREE.TorusGeometry(0.855, 0.022, 12, 128), Mt.brass, 0, 0, 0.236, CHG);
    add(new THREE.TorusGeometry(1.1, 0.03, 12, 128), Mt.brassDark, 0, 0, 0.22, CHG);
    for (let k = 0; k < 16; k++) { const a = k / 16 * TAU, b = add(new THREE.CylinderGeometry(0.032, 0.032, 0.035, 6), Mt.steel, Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0.25, CHG); b.rotation.x = Math.PI / 2; }
    const back = add(new THREE.CircleGeometry(0.9, 96), Mt.velvet, 0, 0, -0.18, CHG); back.castShadow = false;
    const win = new THREE.Mesh(new THREE.CircleGeometry(0.86, 96), Mt.window); win.position.z = 0.215; CHG.add(win);
    const mist = [];
    [[-0.13, 1.3], [-0.06, 2.7], [0.02, 4.1], [0.1, 5.9], [0.16, 7.7]].forEach(([z, s]) => { const m = mistMat(s), me = new THREE.Mesh(new THREE.CircleGeometry(0.86, 64), m); me.position.z = z; me.renderOrder = 2; CHG.add(me); mist.push(m); });
    const IN = new THREE.Group(); CHG.add(IN);                 // per-shot tracks/beads live here (chamber-local, z = 0 plane)
    const plate = add(new THREE.BoxGeometry(2 * RC + 0.1, 0.075, 0.36), Mt.lead, 0, 0, 0, CHG);
    // arc-lamp light from the left through the gap (cool, no shadows), plus the lamp housing and its faint beam in the dusty air
    const arcSpot = new THREE.SpotLight(0xe8eef6, 55, 0, 0.42, 0.6, 2); arcSpot.position.set(CH.x - 2.4, CH.y + 0.25, 0); arcSpot.target.position.set(CH.x + 0.6, CH.y, 0); S.add(arcSpot, arcSpot.target);
    const LP = new THREE.Group(); LP.position.set(-7.4, CH.y, 0); S.add(LP);
    add(new THREE.BoxGeometry(1.3, 1.4, 1.1), Mt.black, 0, 0, 0, LP);
    add(new THREE.CylinderGeometry(0.2, 0.26, 0.9, 24), Mt.black, 0, 1.1, 0, LP);
    add(new THREE.CylinderGeometry(0.34, 0.34, 0.12, 24), Mt.black, 0, 1.6, 0, LP);
    const lens = add(new THREE.CylinderGeometry(0.24, 0.24, 0.7, 32), Mt.brass, 1.0, 0.05, 0, LP); lens.rotation.z = Math.PI / 2;
    const lensG = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), new THREE.MeshBasicMaterial({ color: 0xf4f1ea })); lensG.position.set(1.36, 0.05, 0); lensG.rotation.y = Math.PI / 2; LP.add(lensG);
    add(new THREE.CylinderGeometry(0.08, 0.08, CH.y - 0.7, 12), Mt.black, 0, -(CH.y - 0.7) / 2 - 0.7, 0, LP);
    add(new THREE.CylinderGeometry(0.7, 0.8, 0.12, 32), Mt.iron, 0, -CH.y + 0.06, 0, LP);
    const beamMat = new THREE.MeshBasicMaterial({ map: ctex("beam", 256, 16, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(255,255,255,.9)"); gr.addColorStop(1, "rgba(255,255,255,.15)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); }), color: 0xcfd8e0, transparent: true, opacity: 0.05, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide });
    const beam = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.75, 5.5, 32, 1, true), beamMat); beam.rotation.z = Math.PI / 2; beam.position.set(-7.4 + 1.36 + 2.75, CH.y + 0.05, 0); beam.geometry.rotateY(0); S.add(beam);
    // swap UVs so the gradient runs along the beam
    { const uv = beam.geometry.attributes.uv; for (let i = 0; i < uv.count; i++) { const u = uv.getX(i), v = uv.getY(i); uv.setXY(i, 1 - v, u); } }
    const lampPt = new THREE.PointLight(0xdfe6ee, 4, 0, 2); lampPt.position.set(-5.8, CH.y + 0.1, 0.4); S.add(lampPt);
    // ---- plate camera on its stand, facing the window
    const PC = new THREE.Group(); PC.position.set(0, CH.y, 7.6); S.add(PC);
    add(new THREE.BoxGeometry(1.35, 1.35, 0.55), Mt.oak, 0, 0, 0.75, PC);
    add(new THREE.BoxGeometry(1.2, 1.2, 0.06), Mt.oakDark, 0, 0, 1.06, PC);
    for (let k = 0; k < 9; k++) { const s = lerp(1.18, 0.86, k / 8); add(new THREE.BoxGeometry(s, s, 0.085), k % 2 ? Mt.bellows : Mt.black, 0, 0, 0.42 - k * 0.085, PC); }
    add(new THREE.BoxGeometry(1.05, 1.05, 0.12), Mt.oak, 0, 0, -0.38, PC);
    const lb = add(new THREE.CylinderGeometry(0.24, 0.26, 0.5, 40), Mt.brass, 0, 0, -0.68, PC); lb.rotation.x = Math.PI / 2;
    const lg = add(new THREE.CircleGeometry(0.2, 32), new THREE.MeshPhysicalMaterial({ color: 0x0a0c10, roughness: 0.02, metalness: 0, clearcoat: 1 }), 0, 0, -0.94, PC); lg.rotation.y = Math.PI;
    for (const x of [-0.7, 0.7]) add(new THREE.BoxGeometry(0.06, 0.2, 2.0), Mt.brassDark, x, -0.72, 0.1, PC);
    add(new THREE.BoxGeometry(1.1, 0.1, 2.1), Mt.oakDark, 0, -0.82, 0.1, PC);
    add(new THREE.CylinderGeometry(0.2, 0.24, CH.y - 1.4, 24), Mt.oakDark, 0, -(CH.y - 1.4) / 2 - 0.87, 0.2, PC);
    for (let k = 0; k < 3; k++) { const a = k / 3 * TAU + 0.5, leg = add(new THREE.BoxGeometry(0.16, 0.12, 1.5), Mt.oakDark, Math.sin(a) * 0.62, -CH.y + 0.06, 0.2 + Math.cos(a) * 0.62, PC); leg.rotation.y = a; }
    // ---- bench with glass plates and a plate box (right)
    const BN = new THREE.Group(); BN.position.set(8.0, 0, 1.8); BN.rotation.y = -0.35; S.add(BN);
    add(new THREE.BoxGeometry(4.2, 0.16, 1.9), Mt.oak, 0, 3.2, 0, BN);
    for (const x of [-1.9, 1.9]) for (const z of [-0.8, 0.8]) add(new THREE.BoxGeometry(0.14, 3.12, 0.14), Mt.oakDark, x, 1.56, z, BN);
    add(new THREE.BoxGeometry(1.0, 0.5, 0.75), Mt.oakDark, -1.1, 3.53, -0.2, BN);
    for (let k = 0; k < 7; k++) { const gp = add(new THREE.BoxGeometry(0.03, 0.62, 0.8), Mt.glassPlate, 0.2 + k * 0.09, 3.6, -0.1, BN); gp.rotation.z = -0.12; gp.castShadow = false; }
    add(new THREE.BoxGeometry(0.9, 0.06, 0.9), Mt.oakDark, 0.47, 3.31, -0.1, BN);
    for (let k = 0; k < 5; k++) { const gp = add(new THREE.BoxGeometry(0.85, 0.012, 0.7), Mt.glassPlate, 1.45 + k * 0.01, 3.29 + k * 0.014, 0.35 - k * 0.012, BN); gp.rotation.y = k * 0.05; gp.castShadow = false; }
    // pendant lamp above the bench (warm practical)
    const pend = new THREE.Group(); pend.position.set(7.2, 8.3, 1.3); S.add(pend);
    add(new THREE.ConeGeometry(0.55, 0.42, 32, 1, true), new THREE.MeshStandardMaterial({ color: 0x2e3b33, roughness: 0.4, metalness: 0.4, side: THREE.DoubleSide }), 0, 0, 0, pend);
    { const bu = new THREE.Mesh(new THREE.SphereGeometry(0.13, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffd9a0 })); bu.position.y = -0.15; pend.add(bu); }
    add(new THREE.CylinderGeometry(0.01, 0.01, 9.7, 6), Mt.black, 0, 4.9, 0, pend);
    const pendL = new THREE.PointLight(0xffc887, 26, 0, 2); pendL.position.set(7.2, 8.0, 1.3); S.add(pendL);
    // ---- control panel with the ammeter (front right of the magnet)
    const PN = new THREE.Group(); PN.position.set(4.4, 0, 3.6); PN.rotation.y = -0.42; S.add(PN);
    add(new THREE.BoxGeometry(1.7, 2.3, 0.1), Mt.slate, 0, 4.0, 0, PN);
    for (const x of [-0.7, 0.7]) add(new THREE.BoxGeometry(0.1, 2.9, 0.1), Mt.iron, x, 1.45, -0.1, PN);
    const meter = new THREE.Group(); meter.position.set(0, 4.45, 0.07); PN.add(meter);
    const mcase = add(new THREE.CylinderGeometry(0.46, 0.46, 0.16, 64), Mt.brass, 0, 0, 0.06, meter); mcase.rotation.x = Math.PI / 2;
    const face = add(new THREE.CircleGeometry(0.4, 64), Mt.dial, 0, 0, 0.145, meter);
    const mglass = new THREE.Mesh(new THREE.CircleGeometry(0.41, 64), Mt.window); mglass.position.z = 0.17; meter.add(mglass);
    const needle = new THREE.Group(); needle.position.set(0, -0.11, 0.152); meter.add(needle);
    add(new THREE.BoxGeometry(0.008, 0.34, 0.004), Mt.ink, 0, 0.17, 0, needle);
    add(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), Mt.ink, 0, 0, 0.004, needle).rotation.x = Math.PI / 2;
    // knife switch (closed) and a pilot lamp
    add(new THREE.BoxGeometry(0.6, 0.35, 0.05), Mt.black, 0, 3.5, 0.07, PN);
    for (const x of [-0.12, 0.12]) { add(new THREE.BoxGeometry(0.04, 0.44, 0.03), Mt.pipe, x, 3.55, 0.13, PN); }
    add(new THREE.CylinderGeometry(0.035, 0.035, 0.36, 12), Mt.black, 0, 3.78, 0.16, PN).rotation.z = Math.PI / 2;
    const pilotM = new THREE.MeshStandardMaterial({ color: 0x3a120a, emissive: 0xff6a2a, emissiveIntensity: 0, roughness: 0.3 });
    add(new THREE.SphereGeometry(0.05, 16, 12), pilotM, 0.55, 4.95, 0.09, PN);
    add(new THREE.CylinderGeometry(0.07, 0.07, 0.05, 16), Mt.brass, 0.55, 4.95, 0.06, PN).rotation.x = Math.PI / 2;
    // ---- lights: warm tungsten key from above-left (the only shadow caster), cool rim, low fill
    const key = new THREE.SpotLight(0xffd2a0, 900, 0, 0.55, 0.85, 2); key.position.set(-5, 14, 9.5); key.target.position.set(0.5, 4.8, 0); S.add(key, key.target);
    key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02; key.shadow.camera.near = 4; key.shadow.camera.far = 40;
    const rim = new THREE.DirectionalLight(0x9fb3cc, 0.55); rim.position.set(7, 9, -10); S.add(rim);
    S.add(new THREE.HemisphereLight(0xffe0bd, 0x120d09, 0.3));
    const wash = new THREE.SpotLight(0xffc68a, 260, 0, 0.7, 1, 2); wash.position.set(6, 12, 4); wash.target.position.set(-2, 6, -6); S.add(wash, wash.target);
    const glowL = new THREE.PointLight(0xff8a3c, 0, 6, 2); glowL.position.set(CH.x, CH.y - 2, 2.2); S.add(glowL);

    LAB = {
      S, IN, plate, mist, needle, pilotM, glowL, arcSpot, beamMat, cur: null,
      meterPos: () => meter.getWorldPosition(new V3()),
      // set the whole lab state from film time (magnet current, plate) + this shot's own group
      use(G, ft, o) {
        o = o || {};
        if (LAB.cur !== G) { if (LAB.cur) IN.remove(LAB.cur); IN.add(G); LAB.cur = G; }
        const amp = seg(ft, EV.bend.on, EV.bend.on + 0.9), settle = amp * (1 + 0.035 * Math.sin(Math.max(0, ft - EV.bend.on - 0.9) * 7) * Math.exp(-Math.max(0, ft - EV.bend.on - 0.9) * 2.5));
        needle.rotation.z = lerp(0.88, -0.3, settle);
        Mt.cu.emissiveIntensity = 0.05 * amp; glowL.intensity = 0; pilotM.emissiveIntensity = 2.2 * amp;
        const px = ft < EV.lead.s0 ? null : lerp(-2 * RC - 0.3, 0, seg(ft, EV.lead.s0, EV.lead.s1));
        plate.visible = px !== null; if (px !== null) plate.position.x = px;
        for (const m of mist) { m.uniforms.uT.value = ft; m.uniforms.uOp.value = o.mist !== undefined ? o.mist : 1; }
        arcSpot.intensity = o.arc !== undefined ? o.arc : 55;
      },
    };
    S.traverse((m) => { m.frustumCulled = false; });
    return LAB;
  }
  const W2 = (p) => V(CH.x + p.x, CH.y + p.y, CH.z + p.z);   // chamber-local -> world (chamber is not rotated)

  // ---------------------------------------------------------------- photo: Anderson's glass plate held up to a lamp
  function photoScene(o) {
    const Mt = mats(), S = new THREE.Scene(); S.environment = L3.env; S.background = new THREE.Color(0x080706); S.fog = new THREE.Fog(0x080706, 8, 22);
    const add = (geo, mat, x, y, z, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (p || S).add(m); return m; };
    const PW = 1.9, PHh = 1.6, DR = 0.64;
    const PL = new THREE.Group(); S.add(PL);
    // emulsion (dark negative border) + the round image; light comes through from behind (self-lit, below clipping)
    const em = new THREE.Mesh(new THREE.PlaneGeometry(PW, PHh), new THREE.MeshBasicMaterial({ map: emulsionTex(), color: 0x9a8a72 })); em.position.z = 0.004; PL.add(em);
    const ptex = L3.tex("anderson_plate.jpg"), s = 0.962;
    ptex.repeat.set(s * 940 / 960, s * 940 / 946.5); ptex.offset.set(0.5 - ptex.repeat.x / 2, (1 - 946 / 1893) - ptex.repeat.y / 2);
    const disc = new THREE.Mesh(new THREE.CircleGeometry(DR, 160), new THREE.MeshBasicMaterial({ map: ptex, color: 0xcdbfa6 })); disc.position.set(0.12, 0.04, 0.006); PL.add(disc);
    const edge = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.012, PHh + 0.012, 0.014), new THREE.MeshPhysicalMaterial({ color: 0x9fc4b0, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.55, envMapIntensity: 1.5 })); edge.position.z = -0.009; PL.add(edge);
    // wooden frame holding the plate
    const fr = new THREE.Group(); PL.add(fr);
    for (const x of [-PW / 2 - 0.07, PW / 2 + 0.07]) add(new THREE.BoxGeometry(0.12, PHh + 0.5, 0.16), Mt.oakDark, x, -0.12, 0, fr);
    add(new THREE.BoxGeometry(PW + 0.3, 0.12, 0.2), Mt.oakDark, 0, -PHh / 2 - 0.08, 0, fr);
    add(new THREE.BoxGeometry(PW + 0.3, 0.08, 0.14), Mt.oakDark, 0, PHh / 2 + 0.06, 0, fr);
    add(new THREE.BoxGeometry(PW + 1.0, 0.1, 0.9), Mt.oak, 0, -PHh / 2 - 0.38, 0.05, fr);
    for (const x of [-PW / 2 - 0.07, PW / 2 + 0.07]) add(new THREE.BoxGeometry(0.1, 0.22, 0.6), Mt.oakDark, x, -PHh / 2 - 0.22, 0, fr);
    // the lamp behind: opal globe in a dark housing, its spill lights the frame edges
    const lampG = new THREE.Mesh(new THREE.CircleGeometry(0.72, 64), new THREE.MeshBasicMaterial({ color: 0xffe6c2 })); lampG.position.set(0.12, 0.04, -0.75); S.add(lampG);
    add(new THREE.CylinderGeometry(1.3, 1.3, 0.5, 64, 1, true), Mt.black, 0.12, 0.04, -1.0).rotation.x = Math.PI / 2;
    const halo = L3.glowSprite(0xffd9a8, 4.4, 0.5); halo.position.set(0.12, 0.04, -0.7); S.add(halo);
    const back = new THREE.PointLight(0xffd6a0, 6, 0, 2); back.position.set(0.12, 0.04, -0.55); S.add(back);
    const fill = new THREE.SpotLight(0xffc890, 5, 0, 0.35, 0.9, 2); fill.position.set(-2.0, 0.6, 3.0); fill.target.position.set(0.3, -0.5, 0); S.add(fill, fill.target);
    add(new THREE.PlaneGeometry(16, 9), new THREE.MeshStandardMaterial({ map: plasterTex(), color: 0x55504a, roughness: 0.95 }), 0, 1, -4.5);
    const tb = add(new THREE.PlaneGeometry(14, 10), new THREE.MeshStandardMaterial({ map: woodTex("oakD", "#24170f"), color: 0x6a5a4c, roughness: 0.8, envMapIntensity: 0.15 }), 0, -PHh / 2 - 0.43, 1); tb.rotation.x = -Math.PI / 2;
    // dust in the light (drifting motes, brighter on the lamp axis)
    const N = 420, r = rnd(91), base = [], pos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) base.push([(r() - 0.5) * 3.0, (r() - 0.5) * 2.2, 0.1 + r() * 1.7, r() * TAU, 0.3 + r() * 0.7]);
    const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const dust = new THREE.Points(dg, new THREE.PointsMaterial({ map: softDot(), color: 0xffe4c0, size: 0.008, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending })); S.add(dust);
    const C = cam(0.05, 60);
    return (t) => {
      const ft = o.T0 + t;
      PL.rotation.set(-0.06 + 0.012 * Math.sin(ft * 0.7), 0.1 + 0.015 * Math.sin(ft * 0.45 + 1), 0.006 * Math.sin(ft * 0.6));
      for (let i = 0; i < N; i++) { const b = base[i]; pos[i * 3] = b[0] + 0.05 * Math.sin(ft * 0.21 * b[4] + b[3]) + 0.02 * ft; pos[i * 3 + 1] = b[1] + 0.06 * Math.sin(ft * 0.17 + b[3] * 2) + 0.012 * ft * b[4]; pos[i * 3 + 2] = b[2]; }
      dg.attributes.position.needsUpdate = true;
      camAt(C, [[0, -1.0, -0.95, 5.6, -0.1, 0.1, 0, -330, -60, 30], [8.16, -0.55, -0.6, 4.0, 0.0, 0.08, 0, -360, -70, 30]], ft);
      return [S, C];
    };
  }

  // ---------------------------------------------------------------- plates: glass plates on the bench by the window
  function platesScene(o) {
    const Mt = mats(), S = new THREE.Scene(); S.environment = L3.env; S.background = new THREE.Color(0x0b0a09); S.fog = new THREE.Fog(0x0b0a09, 10, 26);
    const add = (geo, mat, x, y, z, p) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (p || S).add(m); return m; };
    add(new THREE.BoxGeometry(6, 0.14, 2.4), new THREE.MeshStandardMaterial({ map: woodTex("bench", "#3a2618", [1, 1]), roughness: 0.48 }), 0, -0.07, 0);
    add(new THREE.PlaneGeometry(10, 6), Mt.plaster, 0, 1.8, -1.4);
    // window in the left wall: frame bars cast the shadow pattern
    const wall = new THREE.Group(); wall.position.set(-3.2, 0, 0); S.add(wall);
    for (const [y0, y1] of [[-2, 0.5], [3.2, 6]]) add(new THREE.BoxGeometry(0.2, y1 - y0, 6), Mt.plaster, 0, (y0 + y1) / 2, 0, wall);
    for (const z of [-3, -1.25, 1.25, 3]) add(new THREE.BoxGeometry(0.22, 2.7, z === -3 || z === 3 ? 1.5 : 0.08), Mt.oakDark, 0, 1.85, z, wall);
    for (const y of [0.55, 1.85, 3.15]) add(new THREE.BoxGeometry(0.22, 0.07, 6), Mt.oakDark, 0, y, 0, wall);
    add(new THREE.BoxGeometry(0.06, 2.7, 0.06), Mt.oakDark, 0, 1.85, 0, wall);
    const sun = new THREE.DirectionalLight(0xfff1dc, 3.2); sun.position.set(-9, 6.5, 2.5); sun.target.position.set(0.3, 0, 0); S.add(sun, sun.target);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); const sc = sun.shadow.camera; sc.left = -5; sc.right = 5; sc.top = 5; sc.bottom = -5; sc.near = 1; sc.far = 25; sun.shadow.bias = -0.0004; sun.shadow.radius = 3;
    S.add(new THREE.HemisphereLight(0xcfd8e6, 0x1a120c, 0.22));
    const rimL = new THREE.SpotLight(0xffc890, 8, 0, 0.6, 0.9, 2); rimL.position.set(3, 2.5, -2.5); rimL.target.position.set(0, 0, 0); S.add(rimL, rimL.target);
    // stack of plates, one face-up showing a track, a plate box and a dark-slide holder
    const ptex = L3.tex("anderson_plate.jpg");
    const stack = new THREE.Group(); stack.position.set(0.1, 0, 0.1); S.add(stack);
    const r = rnd(101);
    for (let k = 0; k < 9; k++) { const p = add(new THREE.BoxGeometry(1.2, 0.02, 1.0), Mt.glassPlate, (r() - 0.5) * 0.06, 0.012 + k * 0.022, (r() - 0.5) * 0.05, stack); p.rotation.y = (r() - 0.5) * 0.08; p.castShadow = false; }
    const em = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 0.98), new THREE.MeshStandardMaterial({ map: emulsionTex(), color: 0x6d6250, roughness: 0.3, metalness: 0 })); em.rotation.x = -Math.PI / 2; em.position.set(0, 0.215, 0); stack.add(em);
    const dimg = new THREE.Mesh(new THREE.CircleGeometry(0.37, 96), new THREE.MeshStandardMaterial({ map: ptex, color: 0x8e8574, roughness: 0.25, metalness: 0 })); dimg.rotation.x = -Math.PI / 2; dimg.position.set(0.05, 0.217, 0.02); stack.add(dimg);
    for (let k = 0; k < 6; k++) { const p = add(new THREE.BoxGeometry(0.02, 0.9, 1.1), Mt.glassPlate, 1.25 + k * 0.07, 0.48, -0.45, S); p.rotation.z = -0.1; p.castShadow = false; }
    add(new THREE.BoxGeometry(0.9, 0.08, 1.3), Mt.oakDark, 1.43, 0.04, -0.45);
    add(new THREE.BoxGeometry(1.3, 0.4, 1.05), Mt.oakDark, -1.35, 0.2, -0.35);
    add(new THREE.BoxGeometry(1.32, 0.06, 1.07), Mt.oak, -1.35, 0.43, -0.35);
    add(new THREE.BoxGeometry(0.9, 0.05, 0.7), Mt.black, -1.9, 0.025, 0.55).rotation.y = 0.3;
    const C = cam(0.05, 60);
    return (t) => {
      const ft = o.T0 + t;
      camAt(C, [[722.8, -1.6, 1.25, 2.6, -0.3, 0.12, 0.0, 0, 0, 34], [726.74, 0.7, 1.05, 2.45, 0.55, 0.15, -0.1, 0, 0, 34]], ft);
      return [S, C];
    };
  }

  // ---------------------------------------------------------------- rays: cosmic rays slanting into Earth's night-side atmosphere
  function raysScene(o) {
    const S = new THREE.Scene(); S.background = new THREE.Color(0x000000); S.add(L3.stars(3, 4500));
    const RE = 10, earth = new THREE.Mesh(new THREE.SphereGeometry(RE, 160, 96), new THREE.MeshStandardMaterial({ map: L3.tex("2k_earth_daymap.jpg"), emissiveMap: L3.tex("2k_earth_nightmap.jpg"), emissive: 0xffc890, emissiveIntensity: 0.12, roughness: 0.85, metalness: 0 }));
    earth.rotation.set(0.35, 2.3, 0); S.add(earth);
    const sun = new THREE.DirectionalLight(0xfff2e0, 2.6); sun.position.set(14, 4, -30); S.add(sun);
    S.add(new THREE.AmbientLight(0x22324a, 0.06));
    const atmo = new THREE.Mesh(new THREE.SphereGeometry(RE * 1.016, 128, 64), new THREE.ShaderMaterial({
      uniforms: { uSun: { value: sun.position.clone().normalize() } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
      vertexShader: "varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: "uniform vec3 uSun; varying vec3 vN; varying vec3 vW; void main(){ vec3 V = normalize(cameraPosition - vW); float f = pow(1.0 - abs(dot(-vN, V)), 5.0); float lit = 0.18 + 0.82 * smoothstep(-0.35, 0.5, dot(-vN, uSun)); gl_FragColor = vec4(vec3(0.33, 0.55, 0.95) * f * lit * 1.6, 1.0); }",
    })); S.add(atmo);
    const atmo2 = new THREE.Mesh(new THREE.SphereGeometry(RE * 1.004, 128, 64), new THREE.ShaderMaterial({
      uniforms: { uSun: { value: sun.position.clone().normalize() } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: "varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }",
      fragmentShader: "uniform vec3 uSun; varying vec3 vN; varying vec3 vW; void main(){ vec3 V = normalize(cameraPosition - vW); float f = pow(1.0 - max(dot(vN, V), 0.0), 3.0); float lit = 0.12 + 0.88 * smoothstep(-0.25, 0.45, dot(vN, uSun)); gl_FragColor = vec4(vec3(0.3, 0.5, 0.9) * f * lit * 0.8, 1.0); }",
    })); S.add(atmo2);
    // streaks: thin warm-white quads, bright head, long fading tail; each slants down and dies in the upper air with a faint glow
    const stTex = ctex("streak", 256, 32, (g, w, h) => { const gr = g.createLinearGradient(0, 0, w, 0); gr.addColorStop(0, "rgba(255,255,255,0)"); gr.addColorStop(0.85, "rgba(255,255,255,.55)"); gr.addColorStop(1, "rgba(255,255,255,1)"); g.fillStyle = gr; g.fillRect(0, 0, w, h); const vg = g.createLinearGradient(0, 0, 0, h); vg.addColorStop(0, "rgba(0,0,0,1)"); vg.addColorStop(0.5, "rgba(0,0,0,0)"); vg.addColorStop(1, "rgba(0,0,0,1)"); g.globalCompositeOperation = "destination-out"; g.fillStyle = vg; g.fillRect(0, 0, w, h); });
    const C = cam(0.1, 2000);
    const r = rnd(77), streaks = EV.rays.map((t0, i) => {
      // end points on the limb as seen from the opening camera (n . c = R/d), spread round the top of the disc
      const c = V(4.8, 13.6, 12.6), d = c.length(); c.normalize(); const up = V(0, 1, 0).addScaledVector(c, -c.y).normalize(), side = new V3().crossVectors(c, up);
      const ph = -0.75 + i * 0.3 + r() * 0.08, k = RE / d, n = c.clone().multiplyScalar(k).addScaledVector(up, Math.sqrt(1 - k * k) * Math.cos(ph)).addScaledVector(side, Math.sqrt(1 - k * k) * Math.sin(ph)).normalize();
      const end = n.clone().multiplyScalar(RE * 1.012), dir = n.clone().negate().addScaledVector(side, 0.55 + r() * 0.2).addScaledVector(c, -0.25).normalize(), start = end.clone().addScaledVector(dir, -(5 + r() * 3));
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: stTex, color: 0xfff0dc, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      const fl = L3.glowSprite(0xfff0dc, 0.5, 0); fl.position.copy(end); S.add(m, fl);
      return { t0, dur: 1.6 + r() * 0.5, start, end, dir, m, fl, len: 2.2 + r() * 1.2 };
    });
    const q = new THREE.Quaternion(), mx = new THREE.Matrix4(), xa = new V3(), ya = new V3(), za = new V3();
    return (t) => {
      const ft = o.T0 + t;
      camAt(C, [[11.5, 4.8, 13.6, 12.6, -1.5, 8.0, -1.0, 0, 0, 34], [14.98, 3.9, 13.0, 12.1, -1.2, 8.3, -1.2, 0, 0, 34]], ft);
      for (const s of streaks) {
        const u = (ft - s.t0) / s.dur, on = u > 0 && u < 1.35;
        s.m.visible = on && u < 1.05; s.fl.material.opacity = 0.35 * Math.max(0, 1 - Math.abs(u - 1.08) / 0.25) * (u > 0.9 ? 1 : 0);
        if (!s.m.visible) continue;
        const head = s.start.clone().lerp(s.end, clamp(u, 0, 1)), L = s.len * clamp(u * 3, 0.2, 1), mid = head.clone().addScaledVector(s.dir, -L / 2);
        xa.copy(s.dir); za.subVectors(C.position, mid).normalize(); ya.crossVectors(za, xa).normalize(); za.crossVectors(xa, ya);
        mx.makeBasis(xa, ya, za); q.setFromRotationMatrix(mx); s.m.quaternion.copy(q); s.m.position.copy(mid); s.m.scale.set(L, 0.05, 1);
        s.m.material.opacity = 0.75 * smooth(u * 4) * (1 - smooth((u - 0.85) / 0.2));
      }
      return [S, C];
    };
  }

  // ---------------------------------------------------------------- LABK.chamber
  LABK.chamber = (o) => {
    const mode = o.mode || "track";
    if (mode === "photo") return photoScene(o);
    if (mode === "plates") return platesScene(o);
    if (mode === "rays") return raysScene(o);
    const L = lab(), G = new THREE.Group(), C = cam(0.05, 120), T = [];
    let K = null, base = CH, mistOp = 0.85, extra = null;
    const photoTrack = (o2) => { T.push(track(G, PH.lo, Object.assign({ seed: 5, dens: 380 }, o2))); T.push(track(G, PH.up, Object.assign({ seed: 6, dens: 470 }, o2, { tf: (o2.tf || 0) + (o2.fd || 0) * 0.5 }))); };
    // camera on the window axis (chamber-local); ox < 0 puts the disc right of centre
    if (mode === "box") {
      base = ZERO; mistOp = 1.15;
      K = [[14.98, 3.4, 7.4, 17.5, 0.0, 5.3, 0.6, 0, 0, 36], [18.4, 2.0, 6.5, 11.2, 0.1, 5.5, 0.4, -80, -20, 33], [21.84, 0.8, 5.95, 6.4, 0.1, 5.6, 0.2, -230, -90, 30]];
    } else if (mode === "trail") {
      T.push(track(G, arc(-0.62, -0.85, 66, 40, 2.4), { tf: EV.trail.a, seed: 21 }));
      T.push(track(G, arc(0.12, -0.92, 74, -40, 2.4), { tf: EV.trail.b, seed: 22 }));
      K = [[21.84, 0.35, 0.18, 4.6, 0.05, 0.0, 0, -120, -20], [25.54, 0.12, 0.08, 3.7, 0.0, 0.0, 0, -150, -30]];
    } else if (mode === "bend") {
      base = ZERO;
      T.push(track(G, arc(-0.25, -0.88, 112, -0.85, 2.6), { tf: EV.bend.a, seed: 31 }));
      T.push(track(G, arc(0.35, -0.86, 98, -1.15, 2.6), { tf: EV.bend.b, seed: 32 }));
      K = [[28.6, 5.35, 4.75, 6.1, 3.7, 4.5, 3.45, 0, 0, 30], [30.1, 4.6, 5.05, 6.9, 2.5, 4.75, 2.6, 0, 0, 30], [32.6, 2.2, 5.6, 6.45, 0.25, 5.55, 0.2, -60, 0, 30]];
    } else if (mode === "bend2") {
      [[-0.4, -0.86, 108, -0.8, 31], [0.05, -0.9, 96, -1.05, 33], [-0.62, -0.7, 82, -0.62, 34], [0.42, -0.84, 112, -1.3, 35]].forEach(([x, y, d, R, s], i) => T.push(track(G, arc(x, y, d, R, 2.6), { tf: EV.bend2[["a", "b", "c", "d"][i]], seed: s })));
      K = [[32.6, 0.3, 0.2, 4.75, 0.02, 0.06, 0, -230, -95], [36.62, 0.05, 0.08, 4.25, -0.02, 0.06, 0, -250, -105]];
      extra = (ft) => { const p = T[1].S.at(0.62), op = seg(ft, 33.9, 34.5) * (1 - seg(ft, 35.9, 36.4)); return [["electron", CH.x + p.x, CH.y + p.y, CH.z, op]]; };
    } else if (mode === "other") {
      [[-0.4, -0.86, 108, -0.8, 31, 32.75], [0.05, -0.9, 96, -1.05, 33, 33.55], [0.42, -0.84, 112, -1.3, 35, 35.35], [0.2, -0.88, 104, -0.7, 36, EV.other.e]].forEach(([x, y, d, R, s, tf]) => T.push(track(G, arc(x, y, d, R, 2.6), { tf, seed: s })));
      T.push(track(G, arc(-0.47, -0.86, 64, 1.2, 2.3), { tf: EV.other.p, fd: 0.55, seed: 41, warm: true, floor: 0.75 }));
      K = [[36.62, 0.2, 0.12, 4.6, 0.0, 0.05, 0, -230, -95], [38.4, 0.05, 0.06, 4.1, -0.1, 0.06, 0, -250, -100], [42.62, -0.15, 0.1, 3.55, -0.2, 0.1, 0, -270, -120]];
    } else if (mode === "ambig") {
      T.push(track(G, PHjoin, { seed: 51, dens: 420, floor: 0.85 }));
      const b = bead(G, "n"); extra = (ft) => {
        const dn = lin(ft, EV.ambig.dn0, EV.ambig.dn1), up = lin(ft, EV.ambig.up0, EV.ambig.up1), S1 = T[0].S;
        const mov = ft < EV.ambig.up0 - 0.5 ? (dn > 0 && dn < 1 ? 1 - smooth(dn) : -1) : (up > 0 && up < 1 ? smooth(up) : -1);
        b.visible = mov >= 0; if (b.visible) { S1.at(mov, b.position); const f = Math.min(1, Math.min(mov, 1 - mov) * 12); b.userData.h.material.opacity = 0.5 * f; b.scale.setScalar(0.4 + 0.6 * f); }
        return [];
      };
      K = [[670.56, 0.15, 0.0, 4.9, 0.0, 0.0, 0, -120, -20], [676.5, 0.0, 0.05, 4.35, 0.0, 0.0, 0, -110, -20], [682.88, -0.15, 0.1, 3.95, 0.0, 0.0, 0, -100, -20]];
    } else if (mode === "lead") {
      const upA = arc(0.3, 0.86, -76, -1.6, 1.4).filter((p) => p.y > 0.04 * RC);
      const last = upA[upA.length - 1], prev = upA[upA.length - 2], dir = Math.atan2(last.y - prev.y, last.x - prev.x);
      const yb = -0.045 * RC, xb = last.x + (yb - last.y) / Math.tan(dir);
      const loA = clipDisc(X3.trackPath(xb, yb, dir, -0.58 * RC, 1.05 * RC, 120), RC * 0.985);
      T.push(track(G, upA, { tf: EV.lead.b0, fd: EV.lead.hit - EV.lead.b0, seed: 61, dens: 300, floor: 0.8, life: 9 }));
      T.push(track(G, loA, { tf: EV.lead.hit + 0.05, fd: EV.lead.b1 - EV.lead.hit, seed: 62, dens: 760, floor: 0.8, life: 9 }));
      const b = bead(G, "n"); extra = (ft) => {
        const u1 = lin(ft, EV.lead.b0, EV.lead.hit), u2 = lin(ft, EV.lead.hit + 0.05, EV.lead.b1);
        b.visible = u1 > 0 && u2 < 1; if (b.visible) { if (u2 > 0) T[1].S.at(u2, b.position); else T[0].S.at(u1, b.position); b.userData.h.material.opacity = 0.5 * Math.min(1, u1 * 8, (1 - u2) * 8); }
        return [];
      };
      K = [[682.88, 0.25, 0.1, 4.9, 0.05, 0.0, 0, -230, -90], [688.0, 0.1, 0.05, 4.4, 0.0, 0.0, 0, -220, -80], [691.6, 0.15, -0.1, 3.9, 0.1, -0.18, 0, -200, -40], [695.2, 0.2, -0.2, 3.4, 0.15, -0.25, 0, -180, -10]];
    } else if (mode === "track") {
      photoTrack({ floor: 0.9 });
      K = [[695.2, -0.05, -0.75, 3.1, -0.2, -0.4, 0, 0, 0], [699.0, -0.1, -0.55, 3.0, -0.2, -0.3, 0, 0, 0], [702.6, -0.12, 0.2, 2.75, -0.12, 0.32, 0, 0, 0], [707.1, -0.08, 0.32, 2.55, -0.1, 0.36, 0, 0, 0]];
      extra = (ft) => { const a = PH.lo[50], b = PH.up[48];
        return [["gentle curve", CH.x + a.x, CH.y + a.y, CH.z, seg(ft, EV.track.lo, EV.track.lo + 0.5) * (1 - seg(ft, 700.6, 701.1))], ["tighter curve", CH.x + b.x, CH.y + b.y, CH.z, seg(ft, EV.track.up, EV.track.up + 0.5) * (1 - seg(ft, 705.6, 706.1))]]; };
    } else if (mode === "up") {
      photoTrack({ floor: 0.85 });
      const b = bead(G, "pos"), S1 = sampler(PH.lo), S2 = sampler(PH.up);
      extra = (ft) => { const u1 = lin(ft, EV.up.b0, EV.up.hit), u2 = lin(ft, EV.up.hit + 0.08, EV.up.b1);
        b.visible = u1 > 0 && u2 < 1; if (b.visible) { if (u2 > 0) S2.at(u2, b.position); else S1.at(u1, b.position); b.position.z = 0.02; b.userData.h.material.opacity = 0.42 * Math.min(1, u1 * 6, (1 - u2) * 6); }
        return []; };
      K = [[707.1, 0.4, -0.2, 4.4, 0.0, 0.0, 0, -260, -100], [712.76, 0.15, 0.1, 3.9, -0.05, 0.05, 0, -280, -110]];
    } else if (mode === "real") {
      photoTrack({ floor: 0.9, warm: true });
      const g1 = glowLine(G, PHjoin.filter((p) => Math.abs(p.y) > 0.04 * RC), 0xffd7a6, 0.02, 0);
      extra = (ft) => { g1.m.opacity = 0.3 * seg(ft, EV.real.glow, EV.real.glow + 1.4) * (1 - seg(ft, EV.real.fade, EV.real.fade + 1.5)); g1.mesh.visible = g1.m.opacity > 0.002; return []; };
      K = [[745.26, 0.3, 0.15, 4.5, 0.0, 0.05, 0, -240, -95], [751.0, 0.0, 0.05, 4.1, 0.0, 0.05, 0, -255, -105]];
    } else if (mode === "proof") {
      photoTrack({ tf: EV.proof.form, fd: 0.8, floor: 0.85, life: 10 });
      K = [[1001.44, 0.12, 0.05, 3.3, 0.0, 0.05, 0, -210, -90], [1006.94, 0.6, 0.35, 6.4, 0.1, 0.05, 0, -330, -130]];
      mistOp = 1.0;
    }
    return (t) => {
      const ft = o.T0 + t;
      L.use(G, ft, { mist: mistOp });
      let fade = 1;
      if (mode === "real") fade = 1 - 0.65 * seg(ft, EV.real.fade, EV.real.fade + 1.6);
      for (const tr of T) tr.set(ft, fade);
      const pins = extra ? extra(ft) : [];
      camAt(C, K, ft, base);
      return [L.S, C, pins];
    };
  };

  // ---------------------------------------------------------------- LABK.anti: particles and their antiparticle twins
  LABK.anti = (o) => {
    const mode = o.mode || "pairs";
    const S = L3.stage("void", { key: 1.1, rim: 1.5, hemi: 0.12, dust: 600, seed: 23, dustR: 22 });
    const C = cam(0.05, 200);
    const keyS = new THREE.SpotLight(0xfff1de, 130, 0, 0.6, 0.9, 2); keyS.position.set(-4, 7, 7); keyS.target.position.set(0, 0, 0); S.add(keyS, keyS.target);
    // soft backdrop light far behind (a calm grey-blue bloom, lifts the void without a floor)
    { const bd = L3.glowSprite(0x7d8698, 30, 0.16); bd.position.set(0, 1.5, -14); S.add(bd); }
    const mk = (fn, r) => { const m = fn(r); m.material = m.material.clone(); m.material.transparent = true; return m; };
    const antiN = (r) => { const m = X3.nucleon("n", r); m.material = m.material.clone(); m.material.color.set(0x5f596e); m.material.sheenColor = new THREE.Color(0xc8c0e0); m.material.transparent = true; return m; };
    if (mode === "antih") {
      const g = new THREE.Group(); S.add(g);
      const ap = X3.antiNucleon(0.2); g.add(ap);
      const pos = X3.positron(0.07); g.add(pos);
      const cloud = (n, a, col, seed, size) => {
        const r = rnd(seed), p = new Float32Array(n * 3);
        for (let i = 0; i < n; i++) { const rr = Math.min(1.9, -a * Math.log(1 - r() * 0.995)), u = r() * 2 - 1, th = r() * TAU, s = Math.sqrt(1 - u * u); p[i * 3] = rr * s * Math.cos(th); p[i * 3 + 1] = rr * u; p[i * 3 + 2] = rr * s * Math.sin(th); }
        const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(p, 3));
        return new THREE.Points(geo, new THREE.PointsMaterial({ map: softDot(), color: col, size, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
      };
      const pc = cloud(900, 0.42, 0xffd2a0, 7, 0.42); g.add(pc);
      const ph = X3.halo(0xffd9b0, 2.6, 0); g.add(ph);
      const hg = new THREE.Group(); hg.position.set(3.4, 0.5, -2.6); S.add(hg);
      hg.add(X3.nucleon("p", 0.2)); const ec = cloud(900, 0.42, 0x9fbad6, 9, 0.42); ec.material.opacity = 0.07; hg.add(ec);
      { const eh = X3.halo(0xa9c2de, 2.4, 0.1); hg.add(eh); }
      const pl = new THREE.PointLight(0xffd8b0, 0, 4, 2); g.add(pl);
      return (t) => {
        const ft = o.T0 + t, u = seg(ft, EV.antih.in0, EV.antih.in1);
        const ang = ft * 1.1, rad = lerp(2.4, 0.45, u), yy = lerp(0.9, 0.1, u) * Math.cos(ft * 0.8);
        pos.position.set(Math.cos(ang) * rad, yy, Math.sin(ang) * rad); pos.visible = u < 0.98;
        pos.scale.setScalar(0.07 * (1 - 0.6 * smooth((u - 0.6) / 0.4)));
        pc.material.opacity = 0.09 * smooth((u - 0.3) / 0.7); ph.material.opacity = 0.16 * smooth((u - 0.3) / 0.7); pc.rotation.y = ft * 0.08; ec.rotation.y = -ft * 0.07;
        pl.intensity = 0.8 * smooth((u - 0.4) / 0.6);
        camAt(C, [[802.18, 1.2, 1.1, 7.6, 0.9, -0.55, -0.5, 0, 0, 30], [807.16, 0.2, 0.9, 6.2, 1.0, -0.45, -0.6, 0, 0, 30]], ft);
        const pins = [];
        return [S, C, pins];
      };
    }
    // pairs / antiproton: each particle left of a faint vertical glass pane, its twin at the mirror position right of it
    const glassM = new THREE.MeshPhysicalMaterial({ color: 0xdde6ee, metalness: 0, roughness: 0.05, transparent: true, opacity: 0.1, clearcoat: 1, envMapIntensity: 1.8, depthWrite: false });
    const edgeM = new THREE.MeshStandardMaterial({ color: 0xb4ccc2, roughness: 0.1, metalness: 0, transparent: true, opacity: 0.55 });
    const ZM = 0.72, rowX = { e: -4.2, p: 0, n: 4.2 };
    for (const k in rowX) { const g = new THREE.Mesh(new THREE.BoxGeometry(0.025, 2.2, 1.5), glassM); g.position.x = rowX[k]; S.add(g);
      for (const z of [-0.75, 0.75]) { const e = new THREE.Mesh(new THREE.BoxGeometry(0.014, 2.2, 0.014), edgeM); e.position.set(rowX[k], 0, z); S.add(e); } }
    const P = [
      { k: "e", a: mk(X3.electron, 0.3), b: mk(X3.positron, 0.3), na: "electron", nb: "positron" },
      { k: "p", a: mk(X3.nucleon.bind(null, "p"), 0.42), b: mk(X3.antiNucleon, 0.42), na: "proton", nb: "antiproton" },
      { k: "n", a: mk(X3.nucleon.bind(null, "n"), 0.42), b: antiN(0.42), na: "neutron", nb: "antineutron" },
    ];
    for (const q of P) { q.a.position.set(rowX[q.k] - ZM, 0, 0); q.b.position.set(rowX[q.k] + ZM, 0, 0); S.add(q.a, q.b); }
    return (t, d) => {
      const ft = o.T0 + t, pins = [];
      for (const q of P) {
        const a = mode === "pairs" ? seg(ft, EV.pairs[q.k], EV.pairs[q.k] + 1.3) : 1;
        for (const m of [q.a, q.b]) { m.visible = a > 0.002; m.material.opacity = a; m.scale.setScalar((q.k === "e" ? 0.3 : 0.42) * (0.85 + 0.15 * a)); }
        q.a.position.y = 0.04 * Math.sin(ft * 0.6 + rowX[q.k]); q.b.position.y = q.a.position.y;
        if (mode === "pairs") { const pa = seg(ft, EV.pairs[q.k] + 0.5, EV.pairs[q.k] + 1.0) * (1 - seg(ft, EV.pairs[q.k] + 2.3, EV.pairs[q.k] + 2.7)) * (q.k === "n" ? (1 - seg(ft, 789.1, 789.6)) : 1);
          if (pa > 0) { pins.push([q.na, q.a.position.x, q.a.position.y + (q.k === "e" ? 0.3 : 0.42), 0, pa], [q.nb, q.b.position.x, q.b.position.y + (q.k === "e" ? 0.3 : 0.42), 0, pa]); } }
      }
      if (mode === "pairs") camAt(C, [[781.48, -2.6, 0.7, 5.6, -4.2, 0.1, 0, 0, 0, 30], [785.0, 1.0, 0.8, 6.0, -0.5, 0.0, 0, 0, 0, 30], [788.0, 5.0, 0.9, 6.6, 3.0, 0.0, 0, 0, 0, 30], [790.6, 3.4, 2.2, 13.0, 0.2, -0.9, 0, 0, 0, 30], [794.46, 2.6, 2.6, 14.5, -0.1, -1.1, 0, 0, 0, 30]], ft);
      else { // antiproton: close slow orbit around the proton / antiproton pair
        const az = lerp(-14, 16, (ft - 794.46) / 7.72) * Math.PI / 180, dist = lerp(4.6, 4.0, (ft - 794.46) / 7.72);
        camAt(C, [[0, Math.sin(az) * dist, 0.6, Math.cos(az) * dist, 0, -0.35, 0, 0, 0, 30]], ft);
        const pa = seg(ft, 796.1, 796.6) * (1 - seg(ft, 797.9, 798.35));
        if (pa > 0) pins.push(["proton", -ZM, 0.45, 0, pa], ["antiproton", ZM, 0.45, 0, seg(ft, 797.2, 797.7) * (1 - seg(ft, 797.9, 798.35))]);
      }
      return [S, C, pins];
    };
  };
})();
/*DBG*/(function () { for (const k of ["chamber", "anti"]) { const f = LABK[k]; LABK[k] = (o) => { try { const fr = f(o); return (t, d) => { try { return fr(t, d); } catch (e) { dbg(e); return [new THREE.Scene(), new THREE.PerspectiveCamera()]; } }; } catch (e) { dbg(e); return () => [new THREE.Scene(), new THREE.PerspectiveCamera()]; } }; }
  function dbg(e) { const d = document.createElement("div"); d.style.cssText = "position:absolute;left:20px;top:20px;color:#ff0;font:28px monospace;z-index:99;white-space:pre-wrap;width:1800px"; d.textContent = "ERR " + e.message + "\n" + (e.stack || "").slice(0, 600); document.body.appendChild(d); } })();
