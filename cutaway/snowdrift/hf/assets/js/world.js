// Snowdrift bunker: the whole film as a pure function of t. Characters are real photo cut-outs (billboards).
// Layout (metres): cut plane z=0 faces the camera. Snow surface y=0, a drift rises to y~3 around x=-2,
// the snow cave is a notch inside the drift (tunnel mouth on its right slope), the packed path runs along z
// at x 3.6..6.4, the second room is a hole under it. Snowpack to y=-4, frozen earth below.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";

const C = window.CUE, W = 1080, H = 1920;
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
let ready; window.__hf.buildReady.world = new Promise((r) => (ready = r));

// ---------- helpers ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
const lerp = (a, b, k) => a + (b - a) * k;
function hash(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function track(keys, t) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
    if (t <= t1) { const k = sm(t0, t1, t); return Array.isArray(v0) ? v0.map((a, j) => lerp(a, v1[j], k)) : lerp(v0, v1, k); }
  }
  return keys[keys.length - 1][1];
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- renderer ----------
const R = new THREE.WebGLRenderer({ canvas: document.getElementById("g3"), antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
R.setPixelRatio(1); R.setSize(W, H, false);
R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.82;
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0xdfe8f2, 25, 70);
const cam = new THREE.PerspectiveCamera(52, W / H, 0.1, 400);

const texL = new THREE.TextureLoader();
function tex(name, rep, srgb) {
  const t = texL.load(`assets/tex/${name}.jpg`); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t;
}
function pbr(name, rep, extra = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({ map: tex(`${name}/diff`, rep, true), normalMap: tex(`${name}/nor`, rep), roughnessMap: tex(`${name}/rough`, rep), roughness: 1, metalness: 0 }, extra));
}
const gltfL = new GLTFLoader();
const loadGLB = (f) => new Promise((res, rej) => gltfL.load(`assets/models/${f}`, res, undefined, rej));

// ---------- snow cross-section texture (layered snowpack, made in a canvas) ----------
function strataTex() {
  const c = document.createElement("canvas"); c.width = c.height = 1024; const x = c.getContext("2d");
  x.fillStyle = "#f3f6fa"; x.fillRect(0, 0, 1024, 1024);
  for (let i = 0; i < 44; i++) {                       // seasonal layers: faint blue-grey wavy bands
    const y0 = (i / 44) * 1024 + hash(i) * 12, th = 1.5 + hash(i + 3) * 7;
    x.fillStyle = `rgba(${150 + hash(i + 5) * 25 | 0},${168 + hash(i + 6) * 25 | 0},${195 + hash(i + 7) * 20 | 0},${0.12 + hash(i + 8) * 0.16})`;
    x.beginPath(); x.moveTo(0, y0);
    for (let k = 0; k <= 32; k++) x.lineTo(k * 32, y0 + Math.sin(k * 0.35 + i) * 3 + hash(i * 40 + k) * 2);
    for (let k = 32; k >= 0; k--) x.lineTo(k * 32, y0 + th + Math.sin(k * 0.35 + i) * 3);
    x.fill();
  }
  for (let i = 0; i < 2500; i++) { x.fillStyle = `rgba(255,255,255,${hash(i) * 0.9})`; x.fillRect(hash(i + 1) * 1024, hash(i + 2) * 1024, 1.5, 1.5); }
  for (let i = 0; i < 1800; i++) { x.fillStyle = `rgba(120,150,190,${hash(i + 9) * 0.25})`; x.fillRect(hash(i + 11) * 1024, hash(i + 12) * 1024, 2, 2); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(0.16, 0.16); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const MAT = {
  cut: new THREE.MeshStandardMaterial({ map: strataTex(), roughness: 0.85, color: 0xe4ebf4 }),
  snow: pbr("snow_02", 0.35, { color: 0xf4f8ff }),
  earth: pbr("rock_face_03", 0.3, { color: 0x6f6a66 }),
  cave: new THREE.MeshStandardMaterial({ map: strataTex(), roughness: 0.9, color: 0x9fb4cf }),
};

// ---------- terrain ----------
const SLAB = 3.0;                 // depth of the cut slab (cave depth)
const SURF = [[-14, 0], [-5.4, 0.05], [-4.4, 1.0], [-3.5, 2.1], [-2.4, 2.95], [-1.4, 2.85], [-0.4, 2.0], [0.3, 1.2]];
function surfY(x) {               // height of the snow surface at x (outside the notch)
  const P = [...SURF, [0.8, 0.62], [1.5, 0.08], [3.4, 0.0], [3.6, -0.15], [6.4, -0.15], [6.6, 0], [14, 0]];
  for (let i = 1; i < P.length; i++) if (x <= P[i][0]) { const [x0, y0] = P[i - 1], [x1, y1] = P[i]; return lerp(y0, y1, (x - x0) / (x1 - x0)); }
  return 0;
}
const CAVE = { cx: -2.0, floor: 0.15 };
function outline(p) {             // counter-clockwise; p = how far the cave is dug (0..1)
  const L = [[-14, -4], [14, -4], [14, 0], [6.6, 0], [6.4, -0.15], [3.6, -0.15], [3.4, 0.0], [1.5, 0.08]];
  if (p > 0.02) {
    // burrow grows inward from the mouth; the dome opens once it reaches the middle of the drift.
    // Traced with the solid on the left: tunnel floor leftwards, over the dome left-to-right, tunnel ceiling back out.
    const F = CAVE.floor, CEIL = F + 0.7, xl = lerp(0.9, CAVE.cx - 1.55, Math.min(1, p * 1.25));
    const pd = sm(0.35, 1, p), hw = 1.55 * pd, hh = Math.max(0.74, 1.65 * pd);
    L.push([1.12, surfY(1.12)], [0.95, F]);
    if (pd > 0.03) {
      const left = Math.min(xl, CAVE.cx - hw), aEnd = Math.asin(Math.min(1, 0.7 / hh)), N = 16;
      L.push([left, F]);
      if (left < CAVE.cx - hw - 0.01) L.push([left, CEIL], [CAVE.cx - hw, CEIL]);
      for (let i = 0; i <= N; i++) { const a = Math.PI - (Math.PI - aEnd) * (i / N); L.push([CAVE.cx + Math.cos(a) * hw, F + Math.sin(a) * hh]); }
      L.push([0.62, 0.84]);
    } else {
      L.push([xl, F], [xl, CEIL], [0.62, 0.84]);
    }
  } else L.push([0.8, 0.62]);
  for (let i = SURF.length - 1; i >= 0; i--) L.push(SURF[i]);
  return L;
}
function roomHole(p2) {
  if (p2 < 0.03) return null;
  // a low tunnel from under the drift's foot, then the room under the packed path (room grows from its left wall)
  const h = new THREE.Path(), x0 = 1.25, xt = lerp(x0 + 0.1, 3.7, Math.min(1, p2 * 2)), w = 2.6 * sm(0.45, 1, p2);
  h.moveTo(x0, -0.75); h.lineTo(xt, -0.75);
  if (w > 0.05) { h.lineTo(3.7, -2.45); h.lineTo(3.7 + w, -2.45); h.lineTo(3.7 + w, -0.62); h.lineTo(3.7, -0.62); h.lineTo(3.7, -0.32); }
  else h.lineTo(xt, -0.32);
  h.lineTo(x0, -0.32); h.lineTo(x0, -0.75);
  return h;
}
function slabFlat(z0, depth) {
  const L = [[-14, -4], [14, -4], [14, 0], [6.6, 0], [6.4, -0.15], [3.6, -0.15], [3.4, 0.0], [-14, 0]];
  const g = new THREE.ExtrudeGeometry(new THREE.Shape(L.map(([x, y]) => new THREE.Vector2(x, y))), { depth, bevelEnabled: false }); g.translate(0, 0, z0 - depth); return g;
}
function slab(p, p2, z0, depth, withHoles) {
  const s = new THREE.Shape(outline(withHoles ? p : 0).map(([x, y]) => new THREE.Vector2(x, y)));
  if (withHoles) { const h = roomHole(p2); if (h) s.holes.push(h); }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1 }); g.translate(0, 0, z0 - depth); return g;
}
const front = new THREE.Mesh(slab(0, 0, 0, SLAB, true), [MAT.cut, MAT.cave]);
const back = new THREE.Mesh(slabFlat(-SLAB, 40), [MAT.snow, MAT.snow]);
const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, Math.PI, Math.PI, 0, Math.PI / 2), MAT.snow);   // back half only: never inside the cave
mound.scale.set(3.45, 2.9, 3.0); mound.position.set(-2.05, 0, -SLAB);
const moundCap = new THREE.Mesh(new THREE.CircleGeometry(1, 48, 0, Math.PI), MAT.cave);   // the cave's back wall
moundCap.scale.set(3.45, 2.9, 1); moundCap.position.set(-2.05, 0, -SLAB + 0.002); moundCap.receiveShadow = true; scene.add(moundCap); mound.castShadow = mound.receiveShadow = true; scene.add(mound);
const earthF = new THREE.Mesh(new THREE.BoxGeometry(28, 6, SLAB + 40), [MAT.earth, MAT.earth, MAT.earth, MAT.earth, MAT.earth, MAT.earth]);
earthF.position.set(0, -7, -(SLAB + 40) / 2);
for (const m of [front, back, earthF]) { m.castShadow = m.receiveShadow = true; scene.add(m); }
let lastK = "";
function setTerrain(p, p2) {
  const k = p.toFixed(3) + "|" + p2.toFixed(3); if (k === lastK) return; lastK = k;
  front.geometry.dispose(); front.geometry = slab(p, p2, 0, SLAB, true);
}
// snow surface skin (the extrusion's top is the surface already; add a sparkle layer on the flat ground)
{ const g = new THREE.PlaneGeometry(28, 40); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, MAT.snow); m.position.set(0, 0.002, -SLAB - 20); m.receiveShadow = true; scene.add(m); }
// packed path band on the cut face and on the surface
const pathCut = new THREE.Mesh(new THREE.PlaneGeometry(2.8, 0.42), new THREE.MeshBasicMaterial({ color: 0x9aa8ba, transparent: true, opacity: 0.45, depthWrite: false }));
pathCut.visible = false;
{ const g = new THREE.PlaneGeometry(2.8, 43); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: 0xc9d2de, roughness: 0.6 }));
  m.position.set(5.0, -0.148, -21.5); m.receiveShadow = true; m.visible = false; scene.add(m); }

// ---------- sky, light ----------
const sun = new THREE.DirectionalLight(0xfff1dd, 2.6); sun.position.set(-16, 12, 10); sun.target.position.set(0, 0, -2);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 14, bottom: -10, near: 1, far: 70 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; scene.add(sun, sun.target);
const hemi = new THREE.HemisphereLight(0xdbe8ff, 0x8a96a8, 0.9); scene.add(hemi);
let skyTex = null, envTex = null;
const candle = new THREE.PointLight(0xffa04a, 0, 6, 1.5); scene.add(candle);
function softTex(r, g, b) {
  const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(255, 170, 80), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 }));
glow.position.set(-2.0, 1.6, 0.2); glow.scale.set(7.5, 5.5, 1); glow.renderOrder = 9; scene.add(glow);
const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(250, 250, 240), transparent: true, depthWrite: false, fog: false }));
moon.scale.set(3, 3, 1); moon.position.set(-8, 22, -40); scene.add(moon);

// ---------- props ----------
const flameTex = softTex(255, 190, 90);
const candleG = new THREE.Group();
{ const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.16, 12), new THREE.MeshStandardMaterial({ color: 0xf2ead6, roughness: 0.6 })); wax.position.y = 0.08; candleG.add(wax);
  const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: flameTex, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); fl.position.y = 0.21; fl.scale.set(0.13, 0.22, 1); candleG.add(fl); candleG.userData.fl = fl; }
scene.add(candleG);
const woodM = new THREE.MeshStandardMaterial({ color: 0x5b3f26, roughness: 0.9 });
const LOGS = [];
for (let i = 0; i < 7; i++) { const l = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.12, SLAB, 10), woodM); l.rotation.x = Math.PI / 2; l.position.z = -SLAB / 2; l.castShadow = true; scene.add(l); LOGS.push(l); }
const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 2.2, 6), woodM); scene.add(stick);
const vent = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0x2a3340 })); vent.position.z = 0.005; scene.add(vent);
const bedM = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.12, 0.9), new THREE.MeshStandardMaterial({ color: 0x2f4a2a, roughness: 1 })); scene.add(bedM);
const steel = new THREE.MeshStandardMaterial({ color: 0x9aa3ad, roughness: 0.35, metalness: 0.8 });
const POLES = [0, 1].map(() => { const m = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 2.6, 6), steel); scene.add(m); return m; });
const branch = new THREE.Group();          // pine branch the hero sweeps with
{ const m = new THREE.MeshStandardMaterial({ color: 0x2c4a2c, roughness: 1 });
  const st = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.02, 1.1, 5), woodM); st.rotation.z = 0.0; branch.add(st);
  for (let i = 0; i < 9; i++) { const n = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.35, 5), m); n.position.set((hash(i) - 0.5) * 0.15, -0.45 + i * 0.05, 0); n.rotation.z = (i % 2 ? 1 : -1) * 1.1; branch.add(n); } }
scene.add(branch);
// footprints: dark ovals on the snow surface
const PRINTS = [];
{ const g = new THREE.CircleGeometry(0.11, 12); g.scale(1, 0.55, 1); g.rotateX(-Math.PI / 2);
  for (let i = 0; i < 18; i++) { const m = new THREE.Mesh(g, new THREE.MeshBasicMaterial({ color: 0x8796ad, transparent: true, opacity: 0, depthWrite: false })); m.position.set(8.4 - i * 0.42, surfY(8.4 - i * 0.42) + 0.012, -1.3 + (i % 2 ? 0.14 : -0.14)); m.renderOrder = 3; scene.add(m); PRINTS.push(m); } }
// snow chunks thrown while digging + falling snow
const chunkTex = softTex(255, 255, 255);
const CHUNKS = Array.from({ length: 26 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: chunkTex, transparent: true, depthWrite: false })); s.renderOrder = 8; scene.add(s); return s; });
const FLAKES = Array.from({ length: 520 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: chunkTex, transparent: true, depthWrite: false, fog: false })); s.renderOrder = 10; scene.add(s); return s; });
function snowfall(t, storm, center) {
  FLAKES.forEach((s, i) => {
    const sp = 0.6 + hash(i) * 0.6 + storm * 1.6, Hh = 12;
    const y = center.y + 7 - (((t * sp + hash(i + 3) * Hh) % Hh));
    const x = center.x + (hash(i + 5) - 0.5) * 16 + Math.sin(t * 0.7 + i) * 0.3 + storm * ((t * 2.5 + hash(i + 7) * 16) % 16 - 8);
    const z = center.z + (hash(i + 9) - 0.5) * 14;
    s.position.set(x, y, z); const sz = 0.035 + hash(i + 11) * 0.05; s.scale.set(sz, sz, 1);
    s.material.opacity = (0.55 + 0.4 * storm) * (i < 260 + storm * 260 ? 1 : 0);
  });
}
function chunks(t, active, origin) {
  CHUNKS.forEach((s, i) => {
    const per = 0.9, ph = ((t + hash(i) * per) % per) / per, burst = Math.floor((t + hash(i) * per) / per);
    const vx = 1.2 + hash(i + burst * 3) * 1.4, vy = 1.6 + hash(i + 7 + burst) * 1.4;
    s.position.set(origin.x + vx * ph * 0.9, origin.y + vy * ph - 4.9 * ph * ph * 0.8, origin.z + (hash(i + 2) - 0.5) * 0.6);
    const sz = 0.05 + hash(i + 4) * 0.09; s.scale.set(sz, sz, 1); s.material.opacity = active * (1 - ph) * 0.95;
  });
}

// ---------- photo cut-out characters ----------
const CHAR = {};                 // name -> {tex, aspect}
function loadChar(n) { return new Promise((res) => texL.load(`assets/chars/${n}.png`, (t) => { t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; CHAR[n] = { tex: t, aspect: t.image.width / t.image.height }; res(); }, undefined, () => res())); }
class Cut {                       // a photo billboard that stands on its bottom edge; turns to face the camera (yaw only)
  constructor(height) {
    this.h = height; this.root = new THREE.Group(); this.pivot = new THREE.Group(); this.root.add(this.pivot);
    this.mat = new THREE.MeshLambertMaterial({ transparent: true, alphaTest: 0.35, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), this.mat); this.mesh.position.y = 0.5; this.pivot.add(this.mesh);
    this.shadow = new THREE.Mesh(new THREE.CircleGeometry(0.5, 20).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ color: 0x1a2533, transparent: true, opacity: 0.25, depthWrite: false }));
    this.shadow.renderOrder = 2; this.root.add(this.shadow); scene.add(this.root);
  }
  set(name, o = {}) {             // o: x,y,z, h, flip, tilt (deg, around the facing axis), bob, scaleY, shadow, vis
    const c = CHAR[name]; this.root.visible = !!c && o.vis !== false; if (!c) return;
    if (this.mat.map !== c.tex) { this.mat.map = c.tex; this.mat.needsUpdate = true; }
    const h = o.h || this.h, w = h * c.aspect;
    this.mesh.scale.set(w * (o.flip ? -1 : 1), h * (o.scaleY || 1), 1); this.mesh.position.y = h * (o.scaleY || 1) / 2 + (o.bob || 0);
    this.root.position.set(o.x, o.y, o.z);
    this.root.rotation.y = Math.atan2(cam.position.x - o.x, cam.position.z - o.z);
    this.pivot.rotation.z = (o.tilt || 0) * Math.PI / 180;
    this.shadow.scale.set(w * 0.55, 1, 0.35); this.shadow.material.opacity = o.shadow ?? 0.25;
    this.mat.color.setScalar(o.dim ?? 1);
  }
}
const hero = new Cut(1.75), soldiers = [new Cut(1.85), new Cut(1.85)], fox = new Cut(0.42);
const walkBob = (t, rate = 1.9) => Math.abs(Math.sin(t * rate * Math.PI)) * 0.045;
const walkTilt = (t, rate = 1.9) => Math.sin(t * rate * Math.PI) * 2.2;

// ---------- staging ----------
// hero poses (photo names): walk, kneel, sit, lie. Swapping these files changes the man everywhere.
const P = { walk: "hero_walk", kneel: "hero_kneel", sit: "hero_sit", lie: "hero_lie" };
function stageHero(t, night) {
  const dim = lerp(1, 0.55, night);
  if (t < C.tracks) {                                   // walks in from the right, leaving footprints
    const k = sm(0, C.tracks, t);
    hero.set(P.walk, { x: lerp(6.4, 3.0, k), y: 0, z: -1.3, bob: walkBob(t), tilt: walkTilt(t), flip: true, dim });
  } else if (t < C.freeze) {                            // walks backwards to the drift, sweeping the tracks away
    const k = sm(C.tracks, C.freeze - 0.2, t), x = lerp(3.0, 1.35, k);
    hero.set(P.walk, { x, y: surfY(x), z: -1.3, bob: walkBob(t, 1.2) * 0.7, tilt: -walkTilt(t, 1.2), flip: false, dim });
  } else if (t < C.dig) {                               // cold: shivers by the drift
    hero.set(P.walk, { x: 1.35, y: surfY(1.35), z: -1.3, tilt: Math.sin(t * 40) * 1.2, flip: false, dim });
  } else if (t < C.stale) {                             // kneels and digs the cave, moving in as it grows
    const p = sm(C.dig + 0.1, C.cave + 0.2, t), x = lerp(1.15, CAVE.cx + 0.4, p);
    const s = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / 0.9);
    hero.set(P.kneel, { x, y: x > 0.95 ? surfY(x) : CAVE.floor, z: -1.4, h: 1.15, tilt: -6 + 10 * s, bob: -0.03 * s, flip: false, dim });
  } else if (t < C.stick) {                             // stale air: sits, breathing hard
    hero.set(P.sit, { x: CAVE.cx - 0.3, y: CAVE.floor, z: -1.5, h: 1.15, scaleY: 1 + 0.02 * Math.sin(t * 7), dim });
  } else if (t < C.night) {                             // kneels under the dome top, pushes the stick up
    hero.set(P.kneel, { x: CAVE.cx + 0.25, y: CAVE.floor, z: -1.45, h: 1.15, tilt: 4 * Math.sin(t * 5), flip: false, dim });
  } else if (t < C.newroom) {                           // inside: sits by the candle, looks up at the poles
    hero.set(P.sit, { x: CAVE.cx - 0.35, y: CAVE.floor, z: -1.5, h: 1.15, scaleY: 1 + 0.008 * Math.sin(t * 3), dim: lerp(1, 0.9, night) });
  } else if (t < C.bed) {                               // digs the room under the path
    const s = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / 0.9), k = sm(C.newroom, C.mistake, t);
    hero.set(P.kneel, { x: lerp(2.6, 5.5, k), y: lerp(-0.75, -2.45, sm(C.newroom + 0.8, C.newroom + 2.0, t)), z: -1.4, h: 1.05, tilt: -6 + 10 * s, flip: true, dim: 0.95 });
  } else {                                              // asleep on the pine bed in the new room
    hero.set(P.lie, { x: 4.4, y: -2.33, z: -1.5, h: 0.55, scaleY: 1 + 0.015 * Math.sin(t * 2.2), shadow: 0.15, dim: 0.95 });
  }
}
function stageSoldiers(t, night) {
  const dim = lerp(1, 0.5, night);
  soldiers.forEach((s, i) => {
    const name = i ? "soldier_b" : "soldier_a";
    if (t < C.night) {                                   // hook: on the far ridge, walking the treeline
      const k = sm(0, C.dig, t), x = lerp(10.5 + i * 1.3, 6.0 + i * 1.3, k), walking = k > 0.01 && k < 0.99;
      s.set(name, { x, y: 0, z: -8.5 - i * 0.8, bob: walking ? walkBob(t + i * 0.3, 1.7) : 0, tilt: walking ? walkTilt(t + i * 0.3, 1.7) * 0.6 : 0, dim });
      POLES[i].visible = false;
    } else if (t < C.storm) {                            // on top of the drift, stabbing poles
      const k = sm(C.soldiers - 0.3, C.soldiers + 1.6, t), x = lerp(-6.5 + i * 1.6, -2.9 + i * 1.6, k);
      const vis = t >= C.soldiers - 0.4;
      s.set(name, { x, y: surfY(x), z: -1.9 - i * 0.5, bob: k < 1 ? walkBob(t + i * 0.3, 1.7) : 0, dim, vis });
      const stabT = (t - C.stab) / 1.1 + i * 0.5, down = t > C.stab ? Math.max(0, Math.sin(stabT * Math.PI)) : 0;
      const hitLog = t > C.logs + 0.8;
      const depth = hitLog ? Math.min(down, 0.62) : down;         // with logs the pole stops on the wood
      POLES[i].visible = vis && t > C.stab - 0.3;
      POLES[i].position.set(x + 0.35, surfY(x + 0.35) + 1.3 - depth * 1.15, -1.2 - i * 0.5);
    } else {                                             // storm, then walking the packed path above the new room
      const k = ((t - C.storm) * 0.35 + i * 0.5) % 1;
      s.set(name, { x: 4.4 + i * 1.1, y: -0.15, z: lerp(-16, -3.6, sm(C.storm, C.mistake + 1.5, t)) - i * 1.4, bob: walkBob(t + i * 0.4, 1.7), tilt: walkTilt(t + i * 0.4, 1.7) * 0.6, dim });
      POLES[i].visible = false;
    }
  });
}
function stageProps(t, night, storm) {
  // footprints: appear behind the walking hero, then the sweep wipes them
  const hx = t < C.tracks ? lerp(6.4, 3.0, sm(0, C.tracks, t)) : 3.0;
  const sweep = sm(C.tracks, C.freeze - 0.3, t);
  PRINTS.forEach((m) => { const behind = m.position.x > hx + 0.2 ? 1 : 0; const wiped = m.position.x < lerp(8.8, 1.2, 1 - sweep) ? 0 : 1; m.material.opacity = 0.55 * behind * (t < C.tracks ? 1 : 1 - sweep); });
  branch.visible = t >= C.tracks - 0.2 && t < C.freeze;
  if (branch.visible) { const x = lerp(3.0, 1.35, sweep) + 0.55; branch.position.set(x, surfY(x) + 0.5, -1.15); branch.rotation.set(0, 0, 0.6 + 0.5 * Math.sin(t * 9)); }
  // candle: lit from the cave onwards (out at the "by day" beat until the storm, then in the new room)
  const inNew = t >= C.bed - 0.3;
  candleG.visible = t >= C.cave - 0.5;
  candleG.position.set(inNew ? 5.6 : CAVE.cx - 1.05, inNew ? -2.45 : CAVE.floor, -2.1);
  const fl = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.3); candleG.userData.fl.scale.set(0.13, 0.22 * fl, 1);
  candle.position.copy(candleG.position).add(V(0, 0.4, 0.6)); candle.intensity = candleG.visible ? (night > 0.5 ? 7 : 3.5) * fl : 0;
  // the whole drift glows at night
  glow.material.opacity = 0.55 * night * (t < C.byday + 0.4 ? 1 : 0) * (candleG.visible ? 1 : 0);
  // vent: a thin channel from the dome top up through the drift + the stick
  const pv = sm(C.stick, C.vent + 0.2, t), top = CAVE.floor + 1.65, sy = surfY(CAVE.cx + 0.05);
  const y1 = lerp(top, sy, pv), w = 0.03;
  vent.geometry.dispose(); vent.geometry = new THREE.BufferGeometry();
  vent.geometry.setAttribute("position", new THREE.Float32BufferAttribute([CAVE.cx - w, top - 0.02, 0, CAVE.cx + w, top - 0.02, 0, CAVE.cx + w, y1, 0, CAVE.cx - w, top - 0.02, 0, CAVE.cx + w, y1, 0, CAVE.cx - w, y1, 0], 3));
  vent.visible = t >= C.stick;
  stick.visible = t >= C.stick - 0.2 && t < C.night;
  stick.position.set(CAVE.cx + 0.05, lerp(top - 0.6, sy + 0.1, pv), -1.2);
  // logs fill the roof one by one
  LOGS.forEach((l, i) => { const a = Math.PI * (0.18 + 0.64 * i / (LOGS.length - 1)); l.position.x = CAVE.cx + Math.cos(a) * 1.42; l.position.y = CAVE.floor + Math.sin(a) * 1.52;
    l.visible = t >= C.logs + 0.15 * i; });
  // pine bed + fox in the new room
  bedM.visible = t >= C.bed - 0.2; bedM.position.set(4.4, -2.39, -1.6);
  fox.set("fox", { x: 3.1, y: -2.45, z: -1.2, h: 0.42, vis: t >= C.fox - 0.3, scaleY: 1 + 0.02 * Math.sin(t * 2.6), shadow: 0.15, dim: 0.95 });
  // digging chunks
  const digA = (t > C.dig && t < C.cave) ? 1 : (t > C.newroom && t < C.mistake ? 1 : 0);
  const o = t < C.stale ? V(lerp(1.15, CAVE.cx + 0.4, sm(C.dig + 0.1, C.cave + 0.2, t)) + 0.3, 0.6, -1.0) : V(lerp(2.6, 5.5, sm(C.newroom, C.mistake, t)) + 0.4, -0.9, -1.0);
  chunks(t, digA, o);
}
// ---------- camera ----------
function camAt(t) {
  const K = [
    [0.0, [9.0, 3.4, 13.0], [3.2, 1.2, -2.2], 54],
    [C.tracks, [6.0, 2.4, 9.2], [2.0, 0.9, -1.6], 50],
    [C.dig + 0.5, [3.0, 2.0, 7.2], [-0.4, 1.0, -1.6], 48],
    [C.outside + 0.4, [1.4, 1.8, 7.0], [-1.6, 1.2, -1.6], 50],
    [C.cave + 0.4, [1.0, 1.9, 6.4], [-1.9, 1.1, -1.6], 50],
    [C.stick + 0.4, [0.4, 2.6, 6.6], [-2.0, 1.8, -1.6], 50],
    [C.vent + 0.6, [1.6, 3.4, 9.4], [-1.8, 2.2, -1.6], 54],
    [C.glow + 0.4, [4.0, 4.2, 13.0], [-1.6, 1.7, -2.0], 56],
    [C.soldiers + 0.6, [3.2, 3.8, 11.0], [-2.4, 2.2, -1.8], 54],
    [C.wood + 0.4, [1.2, 2.4, 7.4], [-2.0, 1.9, -1.6], 50],
    [C.storm + 0.6, [5.4, 3.8, 13.5], [0.6, 1.0, -2.2], 56],
    [C.newroom + 0.6, [6.2, 0.6, 9.2], [3.6, -1.0, -1.6], 52],
    [C.packed, [7.6, 1.2, 11.0], [4.6, -0.6, -2.2], 56],
    [C.bed + 0.4, [6.0, -1.2, 6.4], [4.4, -1.9, -1.6], 48],
    [C.tunnel, [5.0, -1.4, 5.8], [3.6, -2.0, -1.4], 46],
    [C.congrats + 0.3, [6.4, 0.4, 12.0], [2.6, -0.6, -2.0], 56],
    [C.end + 0.6, [6.6, 1.6, 16.5], [1.4, -0.2, -2.0], 58],
  ];
  const p = track(K.map(([a, b]) => [a, b]), t), q = track(K.map(([a, , c]) => [a, c]), t), f = track(K.map(([a, , , d]) => [a, d]), t);
  cam.position.set(...p); cam.lookAt(...q); cam.fov = f; cam.updateProjectionMatrix();
}
// ---------- overlay anchors ----------
const ANCH = document.documentElement.style;
function anchor(name, v) { const p = v.clone().project(cam); ANCH.setProperty(`--${name}-x`, ((p.x + 1) / 2 * W).toFixed(1) + "px"); ANCH.setProperty(`--${name}-y`, ((1 - p.y) / 2 * H).toFixed(1) + "px"); }
// ---------- frame ----------
function nightAmt(t) { return sm(C.night - 0.3, C.night + 0.5, t) * (1 - sm(C.byday - 0.2, C.byday + 0.5, t)); }
let built = false;
function draw(t) {
  if (!built) return;
  camAt(t);                                             // camera first: billboards face it
  const night = nightAmt(t), storm = sm(C.storm - 0.3, C.storm + 0.8, t) * (1 - sm(C.bed - 0.5, C.bed + 1.0, t));
  scene.background = skyTex; scene.backgroundIntensity = lerp(1, 0.05, night) * lerp(1, 0.6, storm); scene.environment = envTex;
  scene.environmentIntensity = lerp(0.9, 0.25, night) * lerp(1, 0.75, storm);
  sun.intensity = lerp(2.6, 0.5, night) * lerp(1, 0.45, storm); hemi.intensity = lerp(0.55, 0.3, night);
  hemi.color.setRGB(lerp(0.86, 0.45, night), lerp(0.91, 0.55, night), 1);
  scene.fog.color.setRGB(lerp(0.87, 0.06, night), lerp(0.91, 0.09, night), lerp(0.95, 0.16, night));
  scene.fog.near = lerp(25, 6, storm); scene.fog.far = lerp(70, 30, storm);
  moon.visible = night > 0.6; R.toneMappingExposure = lerp(0.82, 1.2, night);
  setTerrain(sm(C.dig + 0.1, C.cave + 0.2, t), sm(C.newroom + 0.1, C.mistake - 0.2, t));
  stageHero(t, night); stageSoldiers(t, night); stageProps(t, night, storm);
  snowfall(t, storm, cam.position.clone().add(V(-2, -1, -7)));
  anchor("cave", V(CAVE.cx + 0.6, 1.3, -0.2)); anchor("vent", V(CAVE.cx, 2.4, 0)); anchor("hero", hero.root.position.clone().add(V(0, 1.2, 0)));
  anchor("out", V(0.9, 1.9, -0.5)); anchor("in", V(CAVE.cx - 0.4, 1.0, -0.4)); anchor("pole", V(-2.2, 2.0, -1.2)); anchor("lip", V(0, 2.5, -1));
  R.render(scene, cam);
}
window.addEventListener("hf-seek", (e) => draw(e.detail.time));
window.WORLD_draw = draw;

// ---------- vegetation ----------
async function plant(name) {
  try { const g = await loadGLB(`${name}/${name}_1k.gltf`); g.scene.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; if (m.material) { m.material.side = THREE.DoubleSide; if (m.material.map) m.material.alphaTest = 0.5; } } }); return g.scene; } catch (e) { return null; }
}
function place(src, n, seed, fx, h0, h1, tint) {
  if (!src) return; src.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(src), sh = Math.max(0.001, b.max.y - b.min.y);
  for (let i = 0; i < n; i++) { const p = fx(i); if (!p) continue; const o = src.clone(); const s = lerp(h0, h1, hash(seed + i)) / sh;
    o.scale.setScalar(s); o.position.set(p[0], p[1] - b.min.y * s, p[2]); o.rotation.y = hash(seed + i * 3) * 6.28;
    if (tint) o.traverse((m) => { if (m.isMesh) { m.material = m.material.clone(); m.material.color.multiply(new THREE.Color(tint)); } });
    scene.add(o); }
}
async function vegetation() {
  const [pine, rocks] = await Promise.all(["pine_tree_01", "rock_moss_set_01"].map(plant));
  place(pine, 14, 11, (i) => [-13 + i * 1.6 + hash(i) * 0.8, 0, -6.0 - hash(i + 40) * 9], 7, 12, 0xcfdbe6);
  place(pine, 12, 61, (i) => [-14 + i * 2.3, 0, -18 - hash(i + 70) * 14], 9, 14, 0xd6e0ea);
  place(pine, 4, 81, (i) => [8.5 + i * 1.3, 0, -4.5 - hash(i + 9) * 4], 6, 9, 0xcfdbe6);
  place(rocks, 2, 71, (i) => [[9.5, 0, -3.2], [-7.5, 0, -4.0]][i], 0.5, 0.8, 0xe6eef6);
}
// ---------- build ----------
(async () => {
  const [hdr] = await Promise.all([new HDRLoader().loadAsync("assets/hdri/snow_field_puresky.hdr"),
    ...["hero_walk", "hero_kneel", "hero_sit", "hero_lie", "soldier_a", "soldier_b", "fox"].map(loadChar)]);
  hdr.mapping = THREE.EquirectangularReflectionMapping; skyTex = hdr;
  envTex = new THREE.PMREMGenerator(R).fromEquirectangular(hdr).texture;
  await vegetation();
  await R.compileAsync(scene, cam);
  built = true; draw(0); ready();
  window.__W = { scene, cam, R, hero, soldiers, THREE };
})();
