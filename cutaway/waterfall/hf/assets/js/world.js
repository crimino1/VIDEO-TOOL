// Waterfall hideout: the whole 3D film as a pure function of time t (seconds).
// Layout (metres): cut plane at z=0 faces the camera. Cliff for x<0 (river bed on top at y=7.2),
// falls drop from the lip (0,8) into a pool x 0..7.2 (surface y=0). Upper cave is a notch at the
// cliff face behind the falls, lower room is a hole under the plunge, crack climbs to the ferns.
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import * as SkeletonUtils from "three/addons/utils/SkeletonUtils.js";

const C = window.CUE, W = 1080, H = 1920;
window.__hf = window.__hf || {}; window.__hf.buildReady = window.__hf.buildReady || {};
let ready; window.__hf.buildReady.world = new Promise((r) => (ready = r));

// ---------- helpers ----------
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const sm = (a, b, t) => { const k = clamp((t - a) / (b - a)); return k * k * (3 - 2 * k); };
const lerp = (a, b, k) => a + (b - a) * k;
function hash(i) { const s = Math.sin(i * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); }
function track(keys, t) {           // [[time, value or array]] smoothstep between neighbours
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [t0, v0] = keys[i - 1], [t1, v1] = keys[i];
    if (t <= t1) { const k = sm(t0, t1, t); return Array.isArray(v0) ? v0.map((a, j) => lerp(a, v1[j], k)) : lerp(v0, v1, k); }
  }
  return keys[keys.length - 1][1];
}
const V = (x, y, z) => new THREE.Vector3(x, y, z);

// ---------- renderer ----------
const canvas = document.getElementById("g3");
const R = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
R.setPixelRatio(1); R.setSize(W, H, false);
R.outputColorSpace = THREE.SRGBColorSpace;
R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;
R.shadowMap.enabled = true; R.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(42, W / H, 0.1, 400);

// ---------- loaders ----------
const texL = new THREE.TextureLoader();
function tex(name, rep, srgb) {
  const t = texL.load(`assets/tex/${name}.jpg`);
  t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep, rep); t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}
function pbr(name, rep, extra = {}) {
  return new THREE.MeshStandardMaterial(Object.assign({
    map: tex(`${name}/diff`, rep, true), normalMap: tex(`${name}/nor`, rep), roughnessMap: tex(`${name}/rough`, rep),
    roughness: 1, metalness: 0,
  }, extra));
}
const gltfL = new GLTFLoader();
const loadGLB = (f) => new Promise((res, rej) => gltfL.load(`assets/models/${f}`, res, undefined, rej));

// ---------- terrain ----------
const MAT = {
  cut: pbr("rock_face_03", 0.22),
  side: pbr("rock_face_03", 0.3, { color: 0xb8aa98 }),
  bed: pbr("river_small_rocks", 0.35),
  ground: pbr("forest_ground_04", 0.3),
  moss: pbr("mossy_rock", 0.4, { color: 0x9fb48a }),
  mud: pbr("brown_mud_rocks_01", 0.5),
};
const TOP_FRONT = 8.4, TOP_RIVER = 7.2, TOP_BACK = 8.4, SLAB = 3.0;   // z 0..-1.2 bank, -1.2..-3 river, <-3 far bank
const ZB = 1.2;                                        // depth of the near bank slab
function outline(top, cave) {                           // XY profile, counter-clockwise
  const P = [[-14, -16], [16, -16], [16, 0.25], [7.2, 0.25], [6.2, -0.55], [3.5, -1.05], [1.6, -2.3], [0.9, -2.45], [0.55, -1.2], [0.55, -0.1]];
  if (cave && cave.w > 0.02) P.push([0, -0.1], [0, 0.05], [-cave.w, 0.05], [-cave.w - 0.15, 0.4], [-cave.w, cave.h], [-0.25, cave.h + 0.12], [0, cave.h]);
  else P.push([0, -0.1]);
  P.push([0, top - 0.05], [-0.15, top], [-14, top]);
  return P;
}
function slabGeo(top, cave, room, z0, depth) {
  const s = new THREE.Shape(outline(top, cave).map(([x, y]) => new THREE.Vector2(x, y)));
  if (room && room.w > 0.05) {
    const { x, y, w, h } = room, hole = new THREE.Path();
    hole.moveTo(x - w / 2, y); hole.lineTo(x + w / 2, y); hole.lineTo(x + w / 2 + 0.1, y + h * 0.7); hole.lineTo(x + w / 2 - 0.2, y + h);
    hole.lineTo(x - w / 2 + 0.25, y + h + 0.05); hole.lineTo(x - w / 2 - 0.1, y + h * 0.6); hole.lineTo(x - w / 2, y);
    s.holes.push(hole);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: false, curveSegments: 1 });
  g.translate(0, 0, z0 - depth);
  return g;
}
const front = new THREE.Mesh(slabGeo(TOP_FRONT, null, null, 0, ZB), [MAT.cut, MAT.side]);
const mid = new THREE.Mesh(slabGeo(TOP_RIVER, null, null, -ZB, SLAB - ZB), [MAT.side, MAT.side]);
const back = new THREE.Mesh(slabGeo(TOP_BACK, null, null, -SLAB, 34), [MAT.side, MAT.side]);
for (const m of [front, mid, back]) { m.castShadow = m.receiveShadow = true; scene.add(m); }
let lastCave = "", lastRoom = "";
function setTerrain(cave, room) {
  const kc = cave.w.toFixed(2) + cave.h.toFixed(2), kr = room.w.toFixed(2);
  if (kc === lastCave && kr === lastRoom) return;
  lastCave = kc; lastRoom = kr;
  front.geometry.dispose(); front.geometry = slabGeo(TOP_FRONT, cave, room, 0, ZB);
  mid.geometry.dispose(); mid.geometry = slabGeo(TOP_RIVER, cave, room, -ZB, SLAB - ZB);
}
// grassy top of the bank (right) and cliff top behind the river (left back)
function strip(x0, x1, y, z0, z1, mat) {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2);
  const m = new THREE.Mesh(g, mat); m.position.set((x0 + x1) / 2, y + 0.005, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m); return m;
}
strip(-14, -0.15, TOP_BACK, -37, -SLAB, MAT.ground);
strip(-14, -0.15, TOP_FRONT, -ZB, 0, MAT.ground);
strip(7.2, 16, 0.25, -37, 0, MAT.ground);
strip(-14, 0, TOP_RIVER, -SLAB, -ZB, MAT.bed);                     // river bed on the cliff top
// pool bed surface (top of the basin) so the water has something under it
{
  const s = new THREE.Shape([[0.55, -0.1], [0.55, -1.2], [0.9, -2.45], [1.6, -2.3], [3.5, -1.05], [6.2, -0.55], [7.2, 0.25]].map(([x, y]) => new THREE.Vector2(x, y)));
}
// cave interior back walls get the darker rock (they are the back slab's front face at z=-SLAB)

// ---------- water ----------
const waterFront = (() => {                           // cross-section of the pool on the cut face
  const pts = [[0.55, 0], [0.55, -1.2], [0.9, -2.45], [1.6, -2.3], [3.5, -1.05], [6.2, -0.55], [7.0, 0]];
  const g = new THREE.ShapeGeometry(new THREE.Shape(pts.map(([x, y]) => new THREE.Vector2(x, y))));
  const m = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false,
    uniforms: { uTop: { value: new THREE.Color(0x3fb6c4) }, uDeep: { value: new THREE.Color(0x0b3c4a) }, uMud: { value: 0 }, uNight: { value: 0 } },
    vertexShader: "varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
    fragmentShader: `varying vec3 vP; uniform vec3 uTop,uDeep; uniform float uMud,uNight;
      void main(){ float k=clamp(-vP.y/2.5,0.0,1.0); vec3 c=mix(uTop,uDeep,k);
        float mud=uMud*smoothstep(3.2,0.6,vP.x); c=mix(c,vec3(0.40,0.28,0.16),mud*0.6);
        c*=mix(1.0,0.25,uNight); float a=mix(0.55,0.8,k); a=max(a,mud*0.7);
        if(vP.y>-0.03) { c=mix(c,vec3(0.85,0.95,1.0),0.5); a=0.9; }
        gl_FragColor=vec4(c,a);} `,
  });
  const mesh = new THREE.Mesh(g, m); mesh.position.z = 0.004; mesh.renderOrder = 5; scene.add(mesh); return mesh;
})();
const surfMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uT: { value: 0 }, uNight: { value: 0 }, uMud: { value: 0 } },
  vertexShader: "varying vec3 vW; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w;}",
  fragmentShader: `varying vec3 vW; uniform float uT,uNight,uMud;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    void main(){ vec2 p=vW.xz*2.2; float r=n(p+vec2(uT*0.6,uT*0.2))*0.6+n(p*2.3-vec2(uT*0.9,0.0))*0.4;
      float foam=smoothstep(2.6,0.4,length(vW.xz-vec2(0.9,-1.5)))*(0.5+0.5*n(p*3.0+uT*2.0));
      vec3 c=mix(vec3(0.16,0.55,0.62),vec3(0.55,0.85,0.9),r*0.6); c=mix(c,vec3(0.95),foam*0.8);
      float mud=uMud*smoothstep(3.4,0.5,length(vW.xz-vec2(1.0,-1.5))); c=mix(c,vec3(0.42,0.29,0.16),mud*0.8);
      c*=mix(1.0,0.22,uNight); gl_FragColor=vec4(c,0.62+foam*0.3+mud*0.2);} `,
});
{ const g = new THREE.PlaneGeometry(7.2, 37); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, surfMat); m.position.set(3.6 + 0.2, 0, -18.5); m.renderOrder = 4; scene.add(m); }
// river on the cliff top: surface + cross-section
const riverMat = surfMat.clone(); riverMat.uniforms = THREE.UniformsUtils.clone(surfMat.uniforms);
{ const g = new THREE.PlaneGeometry(14, SLAB - ZB); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, riverMat); m.position.set(-7, 7.95, -(SLAB + ZB) / 2); m.renderOrder = 4; scene.add(m); }
// the falls: curtain from the lip (0,8) out to the plunge (0.85,0)
const fallsMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, side: THREE.DoubleSide,
  uniforms: { uT: { value: 0 }, uNight: { value: 0 } },
  vertexShader: "varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",
  fragmentShader: `varying vec2 vU; uniform float uT,uNight;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
    float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
    void main(){ vec2 p=vec2(vU.x*26.0, vU.y*3.0+uT*3.2);
      float s=n(vec2(p.x,p.y))*0.55+n(vec2(p.x*2.1,p.y*1.7+uT*1.3))*0.3+n(vec2(p.x*5.0,p.y*4.0))*0.15;
      vec3 c=mix(vec3(0.62,0.82,0.86),vec3(0.98,1.0,1.0),smoothstep(0.35,0.8,s));
      float a=0.62+0.35*smoothstep(0.3,0.75,s); a*=smoothstep(0.0,0.04,vU.x)*smoothstep(1.0,0.96,vU.x);
      a=mix(a,min(1.0,a+0.25),smoothstep(0.2,0.0,vU.y));
      c*=mix(1.0,0.3,uNight); gl_FragColor=vec4(c,a);} `,
});
const falls = (() => {
  const g = new THREE.PlaneGeometry(SLAB - ZB, 8, 24, 48), p = g.attributes.position;
  for (let i = 0; i < p.count; i++) {           // plane in XY -> curtain in YZ, bent outward
    const u = p.getX(i) / (SLAB - ZB) + 0.5, y = p.getY(i) + 4;
    const drop = 8 - y, x = 0.85 * Math.sqrt(drop / 8) + 0.03 * Math.sin(u * 17.0 + y);
    p.setXYZ(i, x, y, -ZB - u * (SLAB - ZB));
  }
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, fallsMat); m.renderOrder = 6; scene.add(m); return m;
})();
// foam + mist sprites (deterministic from t)
function softTex(r, g, b) {
  const c = document.createElement("canvas"); c.width = c.height = 64; const x = c.getContext("2d");
  const gr = x.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, `rgba(${r},${g},${b},1)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`);
  x.fillStyle = gr; x.fillRect(0, 0, 64, 64); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
const FOAM = [], foamTex = softTex(255, 255, 255);
for (let i = 0; i < 70; i++) {
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: foamTex, transparent: true, depthWrite: false, opacity: 0.6 }));
  s.renderOrder = 7; scene.add(s); FOAM.push(s);
}
function foam(t, night) {
  FOAM.forEach((s, i) => {
    const life = 1.6 + hash(i) * 1.4, ph = ((t + hash(i + 9) * 10) % life) / life;
    const z = -ZB - 0.1 - hash(i + 3) * (SLAB - ZB - 0.2), big = i < 18;
    s.position.set(0.85 + (hash(i + 5) - 0.3) * 1.2 + ph * (big ? 0.8 : 1.6), 0.05 + ph * (big ? 1.4 : 0.6), z);
    const sz = (big ? 1.8 : 0.7) * (0.6 + ph);
    s.scale.set(sz, sz, 1);
    s.material.opacity = (big ? 0.22 : 0.55) * Math.sin(Math.PI * ph) * (1 - night * 0.7);
  });
}
// mud cloud
const mudTex = softTex(110, 72, 38), MUD = [];
for (let i = 0; i < 16; i++) { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: mudTex, transparent: true, depthWrite: false, opacity: 0 })); s.renderOrder = 8; scene.add(s); MUD.push(s); }
function mud(t) {
  const grow = sm(C.brown, C.brown + 1.6, t), drift = sm(C.carry, C.carry + 2.2, t), gone = 1 - sm(C.carry + 1.2, C.carry + 3.0, t);
  MUD.forEach((s, i) => {
    const sz = (1.0 + hash(i) * 1.6) * (0.4 + grow * 0.8);
    s.position.set(1.0 + hash(i + 2) * 1.8 + drift * (4 + hash(i) * 4), -0.6 - hash(i + 4) * 1.3, -0.3 - hash(i + 6) * 2.4);
    s.scale.set(sz, sz, 1); s.material.opacity = 0.32 * grow * gone; s.material.color.setScalar(1 - 0.7 * nightAmt(t));
  });
  return grow * gone;
}

// ---------- sky, light ----------
const sun = new THREE.DirectionalLight(0xfff1dc, 3.2);
sun.position.set(-14, 22, 16); sun.target.position.set(0, 2, -2); scene.add(sun, sun.target);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 16, bottom: -12, near: 1, far: 70 }); sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03;
const hemi = new THREE.HemisphereLight(0xbcd6ff, 0x3a3020, 0.5); scene.add(hemi);
let dayBG = null, envDay = null;
const nightBG = new THREE.Color(0x0a1424);
const moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(250, 250, 240), transparent: true, depthWrite: false, fog: false }));
moon.scale.set(3, 3, 1); moon.position.set(-9, 26, -40); scene.add(moon);
const candle = new THREE.PointLight(0xffa04a, 0, 7, 1.6); candle.castShadow = false; scene.add(candle);
const fire = new THREE.PointLight(0xff8a3a, 0, 10, 1.6); fire.position.set(10.2, 1.0, -1.6); scene.add(fire);

// ---------- props ----------
const PROPS = {};
function addCandle(name) {
  const g = new THREE.Group();
  const wax = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.16, 12), new THREE.MeshStandardMaterial({ color: 0xf2ead6, roughness: 0.6 }));
  wax.position.y = 0.08; g.add(wax);
  const fl = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(255, 190, 90), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  fl.position.y = 0.21; fl.scale.set(0.12, 0.2, 1); g.add(fl); g.userData.flame = fl;
  scene.add(g); PROPS[name] = g; return g;
}
addCandle("candle");
const campfire = new THREE.Group();
for (let i = 0; i < 5; i++) {
  const l = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 0.8, 8), new THREE.MeshStandardMaterial({ color: 0x3b2716, roughness: 0.9 }));
  l.rotation.z = Math.PI / 2 - 0.3; l.rotation.y = i * 1.25; l.position.y = 0.12; campfire.add(l);
}
const FLAMES = [];
for (let i = 0; i < 8; i++) { const f = new THREE.Sprite(new THREE.SpriteMaterial({ map: softTex(255, 150, 60), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })); campfire.add(f); FLAMES.push(f); }
campfire.position.set(10.2, 0.25, -1.6); campfire.visible = false; scene.add(campfire);
const bed = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.2, 4, 12).rotateZ(Math.PI / 2), MAT.moss); bed.scale.set(1, 0.3, 1); bed.visible = false; scene.add(bed);
const waterHole = new THREE.Mesh(new THREE.CircleGeometry(0.32, 24), new THREE.MeshStandardMaterial({ color: 0x1d5866, roughness: 0.15, metalness: 0.1 }));
waterHole.rotation.x = -Math.PI / 2; waterHole.visible = false; scene.add(waterHole);
const fish = new THREE.Mesh(new THREE.SphereGeometry(0.1, 12, 8), new THREE.MeshStandardMaterial({ color: 0xc9b98a, roughness: 0.4, metalness: 0.3 }));
fish.scale.set(1.8, 0.7, 0.5); fish.visible = false; scene.add(fish);
const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0, 0, 0), V(0, 1, 0)]), new THREE.LineBasicMaterial({ color: 0xdddddd }));
line.visible = false; scene.add(line);
const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.014, 1.5, 6), new THREE.MeshStandardMaterial({ color: 0x5a4024 })); rod.visible = false; scene.add(rod);
const basket = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.26, 14, 1, true), new THREE.MeshStandardMaterial({ color: 0x8a6a3c, roughness: 0.9, side: THREE.DoubleSide }));
basket.visible = false; scene.add(basket);
const crack = new THREE.Mesh(new THREE.BufferGeometry(), new THREE.MeshBasicMaterial({ color: 0x1c130c })); crack.position.z = 0.006; scene.add(crack);
function setCrack(p) {
  const pts = []; const y0 = 2.45, y1 = TOP_FRONT - 0.05, n = 28;
  for (let i = 0; i <= n; i++) { const k = i / n; if (k > p) break; const y = lerp(y0, y1, k); const x = -1.9 + 0.35 * Math.sin(k * 9.0) + 0.12 * (hash(i) - 0.5); pts.push([x, y, 0.011 + 0.01 * hash(i + 4)]); }
  const pos = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const [xa, ya, wa] = pts[i], [xb, yb, wb] = pts[i + 1];
    pos.push(xa - wa, ya, 0, xa + wa, ya, 0, xb + wb, yb, 0, xa - wa, ya, 0, xb + wb, yb, 0, xb - wb, yb, 0);
  }
  crack.geometry.dispose(); crack.geometry = new THREE.BufferGeometry(); crack.geometry.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
}

// ---------- characters ----------
const ACT = {};          // clip library by name (retargetable Mixamo clips)
function inPlace(clip) {
  const c = clip.clone();
  c.tracks = c.tracks.filter((tr) => !tr.name.endsWith(".position") || tr.name.startsWith("mixamorigHips"));
  for (const tr of c.tracks) if (tr.name === "mixamorigHips.position") {
    const v = tr.values, x0 = v[0], z0 = v[2]; for (let i = 0; i < v.length; i += 3) { v[i] = x0; v[i + 2] = z0; }
  }
  return c;
}
function restQuats(root) { const m = {}; root.traverse((b) => { if (b.isBone) m[b.name] = b.quaternion.clone(); }); return m; }
let RT_MODE = "pre";                               // "none" | "hips" | "pre" | "post"
function retarget(clip, srcRest, dstRest, mode = RT_MODE) {   // drop root motion; fix rest-pose differences
  const c = clip.clone(); c.tracks = c.tracks.map((t) => t.clone()); const q = new THREE.Quaternion(), a = new THREE.Quaternion();
  c.tracks = c.tracks.filter((tr) => tr.name.endsWith(".quaternion"));
  for (const tr of c.tracks) {
    const bone = tr.name.split(".")[0], sR = srcRest[bone], dR = dstRest[bone]; if (!sR || !dR) continue;
    if (mode === "none" || (mode === "hips" && bone !== "mixamorigHips")) continue;
    const v = tr.values;
    if (mode === "post") { const k = sR.clone().invert().multiply(dR); for (let i = 0; i < v.length; i += 4) { q.fromArray(v, i); a.copy(q).multiply(k); a.toArray(v, i); } }
    else { const k = dR.clone().multiply(sR.clone().invert()); for (let i = 0; i < v.length; i += 4) { q.fromArray(v, i); a.copy(k).multiply(q); a.toArray(v, i); } }
  }
  return c;
}
class Char {
  constructor(src, height, tint, lib) {
    this.lib = lib || ACT;
    this.root = new THREE.Group(); this.obj = SkeletonUtils.clone(src.scene); this.root.add(this.obj);
    this.obj.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false;
      if (tint) { m.material = m.material.clone(); m.material.color.multiply(new THREE.Color(tint)); } } });
    this.obj.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(this.obj, true), h = box.max.y - box.min.y;
    this.obj.scale.multiplyScalar(height / h); this.obj.position.y = -box.min.y * height / h;
    this.mixer = new THREE.AnimationMixer(this.obj); this.actions = {};
    this.bones = {}; this.obj.traverse((b) => { if (b.isBone) this.bones[b.name.replace("mixamorig", "")] = b; });
    scene.add(this.root);
  }
  sampler(n) {                 // per clip: [[bone, interpolant, isQuat]]
    this.smp = this.smp || {};
    if (!this.smp[n]) {
      const byName = {}; this.obj.traverse((b) => { if (b.isBone) byName[b.name] = b; });
      this.smp[n] = this.lib[n].tracks.map((tr) => { const [bn, prop] = tr.name.split("."); const b = byName[bn];
        return b && (prop === "quaternion" || prop === "position") ? [b, tr.createInterpolant(), prop === "quaternion"] : null; }).filter(Boolean);
    }
    return this.smp[n];
  }
  pose(list) {                 // list: [[clipName, time, weight], ...]; rest pose first, then sampled clips blended
    if (!this.restQ) { this.restQ = []; this.obj.traverse((b) => { if (b.isBone) this.restQ.push([b, b.quaternion.clone(), b.position.clone()]); }); }
    for (const [b, q, p] of this.restQ) { b.quaternion.copy(q); b.position.copy(p); }
    let acc = 0; const q = new THREE.Quaternion(), v = new THREE.Vector3();
    for (const [n, tt, w] of list) {
      if (w <= 0.001) continue;
      const k = w / (acc + w), T = ((tt % this.lib[n].duration) + this.lib[n].duration) % this.lib[n].duration;
      for (const [b, it, isQ] of this.sampler(n)) {
        const r = it.evaluate(T);
        if (isQ) { q.fromArray(r); if (acc === 0) b.quaternion.copy(q); else b.quaternion.slerp(q, k); }
        else { v.fromArray(r); if (acc === 0) b.position.copy(v); else b.position.lerp(v, k); }
      }
      acc += w;
    }
  }
  rot(bone, x, y = 0, z = 0) {   // extra local rotation in degrees
    const b = this.bones[bone]; if (!b) return;
    b.quaternion.multiply(new THREE.Quaternion().setFromEuler(new THREE.Euler(x * Math.PI / 180, y * Math.PI / 180, z * Math.PI / 180)));
  }
  at(x, y, z, yawDeg = 0, pitchDeg = 0, rollDeg = 0) {
    this.root.position.set(x, y, z); this.root.rotation.set(pitchDeg * Math.PI / 180, yawDeg * Math.PI / 180, rollDeg * Math.PI / 180, "YXZ"); this.root.updateMatrixWorld(true);
  }
  wpos(bone) { const v = V(0, 0, 0); this.bones[bone].getWorldPosition(v); return v; }
}
let hero, soldiers = [], dog, otter, dogClips = {};

// pose library. Directions are in the character's own frame: +z forward, +y up, +x the character's left.
const _v0 = new THREE.Vector3(), _v1 = new THREE.Vector3(), _q0 = new THREE.Quaternion(), _q1 = new THREE.Quaternion(), _q2 = new THREE.Quaternion();
function aim(c, bone, child, dir, k = 1) {
  const b = c.bones[bone], ch = c.bones[child]; if (!b || !ch || k <= 0) return;
  c.root.updateMatrixWorld(true);
  b.getWorldPosition(_v0); ch.getWorldPosition(_v1); const cur = _v1.sub(_v0).normalize();
  c.root.getWorldQuaternion(_q2); const want = new THREE.Vector3(...dir).normalize().applyQuaternion(_q2);
  _q0.setFromUnitVectors(cur, want); if (k < 1) _q0.slerp(_q1.identity(), 1 - k);
  b.parent.getWorldQuaternion(_q1); const wb = _q1.clone().multiply(b.quaternion);
  b.quaternion.copy(_q1.invert().multiply(_q0.multiply(wb)));
  b.updateMatrixWorld(true);
}
const mixd = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));
function ground(c, floor, parts = ["LeftToeBase", "RightToeBase", "LeftFoot", "RightFoot", "LeftLeg", "RightLeg"], pad = 0.05) {
  c.root.updateMatrixWorld(true); let m = Infinity;
  for (const n of parts) if (c.bones[n]) { c.bones[n].getWorldPosition(_v0); m = Math.min(m, _v0.y); }
  c.root.position.y += floor + pad - m; c.root.updateMatrixWorld(true);
}
const P = {
  kneel(c) {          // left foot planted forward, right knee on the ground
    aim(c, "LeftUpLeg", "LeftLeg", [0.1, -0.15, 1]); aim(c, "LeftLeg", "LeftFoot", [0, -1, 0.05]);
    aim(c, "RightUpLeg", "RightLeg", [-0.05, -1, 0.25]); aim(c, "RightLeg", "RightFoot", [0, -0.12, -1]);
  },
  sitLong(c) {        // sitting on the floor, legs out in front
    aim(c, "LeftUpLeg", "LeftLeg", [0.08, -0.05, 1]); aim(c, "LeftLeg", "LeftFoot", [0.05, -0.15, 1]);
    aim(c, "RightUpLeg", "RightLeg", [-0.08, -0.05, 1]); aim(c, "RightLeg", "RightFoot", [-0.05, -0.15, 1]);
  },
  sitCross(c) {       // soldiers by the fire: knees up
    aim(c, "LeftUpLeg", "LeftLeg", [0.35, 0.35, 1]); aim(c, "LeftLeg", "LeftFoot", [-0.1, -1, 0.15]);
    aim(c, "RightUpLeg", "RightLeg", [-0.35, 0.35, 1]); aim(c, "RightLeg", "RightFoot", [0.1, -1, 0.15]);
  },
  dig(c, t) {         // two-handed pick: raise, then strike down in front, 0.9 s
    const s = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / 0.9);
    c.rot("Spine", -12 - 14 * (1 - s)); c.rot("Spine1", -6);
    aim(c, "RightArm", "RightForeArm", mixd([0.2, -0.55, 0.85], [0.15, 0.95, 0.35], s)); aim(c, "RightForeArm", "RightHand", mixd([0.35, -0.2, 1], [0.25, 1, 0.1], s));
    aim(c, "LeftArm", "LeftForeArm", mixd([-0.2, -0.55, 0.85], [-0.15, 0.95, 0.35], s)); aim(c, "LeftForeArm", "LeftHand", mixd([-0.35, -0.2, 1], [-0.25, 1, 0.1], s));
  },
  carry(c) {
    aim(c, "RightArm", "RightForeArm", [0.15, -0.75, 0.55]); aim(c, "RightForeArm", "RightHand", [0.35, 0.05, 1]);
    aim(c, "LeftArm", "LeftForeArm", [-0.15, -0.75, 0.55]); aim(c, "LeftForeArm", "LeftHand", [-0.35, 0.05, 1]);
  },
  reachUp(c, t) {     // chisel at the ceiling
    const s = 0.5 + 0.5 * Math.sin(t * Math.PI * 2 / 0.5);
    aim(c, "RightArm", "RightForeArm", [-0.1, 1, 0.25]); aim(c, "RightForeArm", "RightHand", [0.1, 1, 0.2 + 0.35 * s]);
    aim(c, "LeftArm", "LeftForeArm", [0.15, 0.85, 0.3]); aim(c, "LeftForeArm", "LeftHand", [-0.15, 0.9, 0.35]);
    c.rot("Head", 22); c.rot("Spine1", 8);
  },
  cough(c, t) {
    const s = Math.max(0, Math.sin(t * 9));
    c.rot("Spine", -10 - 14 * s); c.rot("Spine1", -6 * s);
    aim(c, "RightArm", "RightForeArm", [0.3, -0.7, 0.55]); aim(c, "RightForeArm", "RightHand", [0.45, 0.85, 0.25]);
  },
  point(c, k) { aim(c, "RightArm", "RightForeArm", [-0.15, -0.35, 1], k); aim(c, "RightForeArm", "RightHand", [-0.1, -0.35, 1], k); },
  ear(c, k) { aim(c, "RightArm", "RightForeArm", [-0.95, 0.05, 0.15], k); aim(c, "RightForeArm", "RightHand", [0.35, 0.95, 0], k); c.rot("Head", 0, 0, -12 * k); },
  rodHold(c) {
    aim(c, "RightArm", "RightForeArm", [0.1, -0.55, 0.8]); aim(c, "RightForeArm", "RightHand", [0.2, 0.25, 1]);
    aim(c, "LeftArm", "LeftForeArm", [-0.1, -0.6, 0.75]); aim(c, "LeftForeArm", "LeftHand", [-0.15, 0.2, 1]);
  },
  armsDown(c) {
    aim(c, "RightArm", "RightForeArm", [-0.12, -1, 0.05]); aim(c, "RightForeArm", "RightHand", [-0.05, -1, 0.1]);
    aim(c, "LeftArm", "LeftForeArm", [0.12, -1, 0.05]); aim(c, "LeftForeArm", "LeftHand", [0.05, -1, 0.1]);
  },
  hugKnees(c) {
    aim(c, "RightArm", "RightForeArm", [0.15, -0.6, 0.75]); aim(c, "RightForeArm", "RightHand", [0.5, 0.1, 0.85]);
    aim(c, "LeftArm", "LeftForeArm", [-0.15, -0.6, 0.75]); aim(c, "LeftForeArm", "LeftHand", [-0.5, 0.1, 0.85]);
  },
};
const FLOOR_UP = 0.05, FLOOR_LOW = -5.4;   // upper cave floor, lower room floor

// ---------- staging: everything as a function of t ----------
// yaw: 0 faces the camera (+z), 90 faces the falls (+x), -90 faces into the cliff (-x)
function stageHero(t) {
  const c = hero;
  if (t < C.dig) {                                   // wading in, then standing behind the curtain
    const k = sm(0.0, C.shadow, t), stop = sm(C.shadow - 0.4, C.shadow + 0.2, t);
    c.pose([["walk", t * 0.8, 1 - stop], ["idle", t, stop]]);
    c.at(lerp(3.4, 0.3, k), lerp(-1.02, -0.1, sm(0.4, C.shadow, t)), -1.6, lerp(-90, -30, stop));
    if (k < 1) c.rot("Spine", -8);
  } else if (t < C.brown) {                          // digging the upper cave
    c.pose([["idle", t, 1]]); c.at(-Math.max(0.35, 2.9 * sm(C.dig + 0.2, C.door + 1.2, t) - 0.75), 0, -1.6, -90);
    P.kneel(c); P.dig(c, t); ground(c, FLOOR_UP);
  } else if (t < C.dogs) {                           // carries dirt to the falls at night and back
    const k = sm(C.night - 0.2, C.night + 1.1, t), back = sm(C.carry + 0.5, C.carry + 1.7, t);
    const moving = (k > 0.02 && k < 0.98) || (back > 0.02 && back < 0.98);
    c.pose([["walk", t, moving ? 1 : 0], ["idle", t, moving ? 0 : 1]]);
    c.at(lerp(lerp(-1.7, 0.2, k), -1.5, back), FLOOR_UP, -1.6, back > 0.02 ? -90 : 90);
    if (back < 0.5) P.carry(c);
    basket.visible = t >= C.brown + 0.3 && back < 0.9;
    const hp = c.wpos("RightHand").add(c.wpos("LeftHand")).multiplyScalar(0.5);
    const tip = sm(C.carry - 0.35, C.carry + 0.25, t) * (1 - back);
    basket.position.copy(hp).add(V(0.08, -0.06, 0)); basket.rotation.set(0, 0, -tip * 1.7);
  } else if (t < C.stale) {                          // out through the water and back in
    const out = sm(C.dogs - 0.4, C.dogs + 0.6, t), inn = sm(C.through + 0.1, C.scent + 0.6, t);
    c.pose([["walk", t * 0.9, 1]]);
    c.at(lerp(lerp(-0.8, 1.7, out), -1.6, inn), lerp(FLOOR_UP, -0.6, out * (1 - inn)), -1.6, inn > 0.02 ? -90 : 90);
    c.rot("Spine", -18); c.rot("Spine1", -8);
  } else if (t < C.chip) {                           // stale air: coughing by the candle
    c.pose([["idle", t, 1]]); c.at(-1.7, FLOOR_UP, -1.5, 25); P.cough(c, t);
  } else if (t < C.camp) {                           // chisels the vent
    c.pose([["idle", t, 1]]); c.at(-1.95, FLOOR_UP, -1.3, 10); P.reachUp(c, t);
  } else if (t < C.deeper) {                         // inside, quiet, while they camp
    c.pose([["idle", t, 1]]); c.at(-1.6, FLOOR_UP, -1.6, 30); P.sitLong(c); P.hugKnees(c);
    ground(c, FLOOR_UP, ["Hips", "LeftFoot", "RightFoot"], 0.1);
  } else if (t < C.louder) {                         // digs the lower room
    c.pose([["idle", t, 1]]); c.at(0.4 - 1.8 * sm(C.deeper + 0.2, C.mistake, t), 0, -1.6, -90);
    P.kneel(c); P.dig(c, t); ground(c, FLOOR_LOW);
  } else if (t < C.moss) {                           // asleep on the moss bed
    c.pose([["idle", 0.4, 1]]); c.at(0.25, 0, -1.6, 90, -90, 0); P.armsDown(c);
    c.rot("Spine2", -2 * Math.sin(t * 2.2));
    ground(c, -5.18, ["Hips", "Spine1", "Head"], 0.1);
  } else {                                           // fishing, sitting on the bed
    c.pose([["idle", t, 1]]); c.at(-0.9, 0, -1.7, 40); P.sitLong(c); P.rodHold(c);
    ground(c, -5.18, ["Hips"], 0.1);
  }
  if (t < C.brown || t >= C.dogs) basket.visible = false;
}
function stageSoldiers(t) {
  const night = t >= C.camp - 0.3;
  soldiers.forEach((s, i) => {
    s.root.visible = true;
    if (night) {                                     // camp by the fire on the bank
      const ang = [2.6, 0.5, -0.9][i], r = 1.25, x = 10.2 + Math.cos(ang) * r, z = -1.6 + Math.sin(ang) * r;
      const yaw = Math.atan2(10.2 - x, -1.6 - z) * 180 / Math.PI;     // face the fire
      s.pose([["sidle", t + i * 1.7, 1]]); s.at(x, 0, z, yaw); P.sitCross(s); P.hugKnees(s);
      if (i === 0) P.ear(s, sm(C.listen - 0.3, C.listen + 0.4, t));
      if (i === 2) s.rot("Head", 0, 12 * Math.sin(t * 0.8), 0);
      ground(s, 0.25, ["Hips", "LeftFoot", "RightFoot"], 0.1);
      return;
    }
    if (t >= C.dogs - 0.5) {                         // with the dog along the far bank
      const kd = sm(C.dogs - 0.5, C.scent + 0.5, t), w2 = kd > 0.02 && kd < 0.98;
      s.pose([["swalk", t + i * 0.37, w2 ? 1 : 0], ["sidle", t + i, w2 ? 0 : 1]]);
      s.at(lerp(13.8 + i * 1.3, 8.9 + i * 1.3, kd), 0.25, -1.4 - i * 1.1, -90);
      return;
    }
    // walk along the cliff top behind the river, stop near the lip, one points down
    const k = sm(0, C.shadow + 0.2, t), walking = k > 0.02 && k < 0.98;
    s.pose([["swalk", t + i * 0.37, walking ? 1 : 0], ["sidle", t + i, walking ? 0 : 1]]);
    s.at(lerp(-3.0 - i * 1.15, -1.0 - i * 1.15, k), TOP_FRONT, -0.45 - i * 0.3, lerp(90, 130, sm(C.shadow - 0.2, C.shadow + 0.4, t)));
    if (i === 0) P.point(s, sm(C.shadow, C.shadow + 0.5, t) * (1 - sm(C.dig + 1, C.dig + 2, t)));
  });
}
function stageDog(t) {
  if (!dog) return;
  const on = t >= C.dogs - 0.5 && t < C.camp; dog.root.visible = on;
  if (!on) return;
  const k = sm(C.dogs - 0.5, C.through + 1.0, t), lost = sm(C.scent - 0.2, C.scent + 0.6, t);
  const clip = lost > 0.5 ? "Idle" : (k < 1 ? "Walk" : "Idle_2_HeadLow");
  dog.mixer.stopAllAction(); const a = dog.mixer.clipAction(dogClips[clip]); a.play(); a.time = (t * 1.0) % dogClips[clip].duration; dog.mixer.update(0);
  dog.root.position.set(lerp(12.0, 7.6, k), 0.25, -0.7); dog.root.rotation.set(0, lerp(-Math.PI / 2, -Math.PI / 2 + 0.6, lost), 0);
}
function stageOtter(t) {
  if (!otter) return;
  const on = t >= C.otter - 0.4; otter.visible = on; if (!on) return;
  const pop = sm(C.otter - 0.4, C.otter + 0.3, t), grab = sm(C.fish - 0.2, C.fish + 0.4, t), dive = sm(C.congrats + 0.4, C.congrats + 1.2, t) * 0;
  otter.position.set(0.55, -5.42 + 0.35 * pop - 0.1 * Math.sin(t * 3), -1.0); otter.rotation.set(0, -0.6 + grab * 0.8, 0);
  otter.visible = pop > 0.01;
}
function stageProps(t, night) {
  // candle: upper cave from the dig onwards, lower room at the end
  const lower = t >= C.deeper + 1.5;
  const cv = PROPS.candle; cv.visible = t >= C.door;
  cv.position.set(lower ? 1.25 : -2.35, lower ? -5.4 : 0.05, -2.2);
  const stale = sm(C.stale, C.stale + 0.6, t) * (1 - sm(C.chip + 1.0, C.ferns, t));
  const flick = 0.85 + 0.15 * Math.sin(t * 23) * Math.sin(t * 7.3);
  cv.userData.flame.scale.set(0.12 * (1 - stale * 0.6), 0.2 * (1 - stale * 0.65) * flick, 1);
  cv.userData.flame.material.color.setRGB(1 - stale * 0.5, 1 - stale * 0.2, 1);
  candle.visible = cv.visible; candle.position.copy(cv.position).add(V(0, 0.3, 0.3));
  candle.intensity = cv.visible ? (night ? 7 : 4) * flick * (1 - stale * 0.7) : 0;
  // crack / vent
  setCrack(sm(C.chip, C.ferns + 0.2, t));
  // camp
  campfire.visible = t >= C.camp - 0.3;
  FLAMES.forEach((f, i) => { const ph = ((t * 1.6 + hash(i) * 3) % 1); f.position.set((hash(i + 1) - 0.5) * 0.35, 0.15 + ph * 0.7, (hash(i + 2) - 0.5) * 0.35); const s = 0.55 * (1 - ph) + 0.12; f.scale.set(s, s * 1.4, 1); f.material.opacity = 0.9 * (1 - ph); });
  fire.intensity = campfire.visible ? 18 * (0.85 + 0.15 * Math.sin(t * 17)) : 0;
  // lower room furniture
  const cosy = t >= C.louder - 0.5;
  bed.visible = cosy; bed.position.set(-0.6, -5.3, -1.6);
  waterHole.visible = t >= C.deeper + 2.0; waterHole.position.set(0.55, -5.36, -1.0);
  rod.visible = line.visible = t >= C.moss;
  if (rod.visible) {
    const h = hero.wpos("RightHand"); const tip = V(0.5, -4.5, -1.0);
    rod.position.copy(h).lerp(tip, 0.5); rod.lookAt(tip); rod.rotateX(Math.PI / 2);
    const bob = 0.03 * Math.sin(t * 2.5);
    line.geometry.setFromPoints([tip, V(0.55, -5.36 + bob, -1.0)]);
  }
  fish.visible = t >= C.otter - 0.3 && t < C.congrats + 2.5;
  if (fish.visible) {
    const grab = sm(C.fish - 0.2, C.fish + 0.4, t);
    const onLine = V(0.55, -5.25 + 0.05 * Math.sin(t * 4), -1.0);
    const inMouth = otter ? otter.position.clone().add(V(0.12, 0.28, 0.05)) : onLine;
    fish.position.copy(onLine).lerp(inMouth, grab);
  }
}
// ---------- camera: one continuous move, keyed to the voice ----------
function camAt(t) {
  const K = [
    [0.0, [4.4, 5.0, 11.8], [-0.3, 3.6, -1.8], 54],
    [3.0, [5.6, 4.6, 12.5], [0.2, 4.0, -2.0], 56],
    [5.6, [4.6, 3.2, 10.0], [0.0, 2.6, -2.0], 54],
    [C.dig + 0.8, [2.2, 1.8, 6.6], [-1.3, 1.0, -1.5], 50],
    [C.door + 0.2, [0.9, 1.3, 5.0], [-1.0, 1.0, -1.8], 52],
    [C.secret + 0.6, [3.4, 1.8, 6.8], [0.3, 1.0, -1.8], 52],
    [C.brown + 0.4, [5.6, 1.4, 8.4], [2.2, -0.8, -1.8], 52],
    [C.night + 0.8, [3.8, 2.0, 7.4], [0.4, 0.6, -1.8], 52],
    [C.carry + 1.4, [7.4, 1.6, 9.6], [3.6, -0.4, -1.6], 52],
    [C.dogs + 0.4, [12.0, 2.4, 9.6], [9.0, 0.6, -1.2], 50],
    [C.through + 0.6, [7.0, 2.0, 9.6], [3.0, 0.2, -1.6], 52],
    [C.scent + 0.6, [4.2, 1.8, 7.4], [0.0, 0.6, -1.7], 52],
    [C.stale + 0.3, [0.4, 1.4, 4.4], [-1.6, 1.0, -1.8], 50],
    [C.chip + 0.4, [0.2, 2.4, 5.6], [-1.8, 2.6, -1.6], 50],
    [C.ferns, [-0.4, 7.4, 7.0], [-1.9, 7.6, -1.0], 50],
    [C.vent + 0.8, [1.6, 5.0, 11.5], [-1.6, 4.4, -1.2], 56],
    [C.camp + 0.6, [9.0, 4.0, 15.0], [5.0, 1.0, -1.8], 56],
    [C.listen + 0.6, [12.2, 2.0, 7.4], [10.2, 0.9, -1.6], 48],
    [C.deeper + 0.5, [3.6, -1.8, 9.6], [0.0, -3.8, -1.6], 54],
    [C.mistake + 0.4, [4.2, -0.6, 16.0], [1.4, -2.4, -1.8], 60],
    [C.louder + 0.7, [12.4, 1.8, 6.8], [10.2, 0.8, -1.6], 46],
    [C.louder + 2.0, [12.0, 1.6, 6.6], [10.0, 0.8, -1.6], 46],
    [C.nothing - 0.2, [2.2, -3.6, 7.6], [-0.2, -4.6, -1.6], 50],
    [C.moss + 0.2, [1.8, -4.0, 5.4], [-0.3, -4.9, -1.6], 50],
    [C.fish + 0.6, [1.6, -4.3, 4.6], [0.3, -5.0, -1.4], 48],
    [C.congrats + 0.3, [2.6, -2.6, 10.0], [0.3, -3.6, -1.6], 54],
    [C.end + 0.6, [3.2, -1.4, 13.6], [0.5, -2.8, -1.8], 56],
  ];
  const p = track(K.map(([a, b]) => [a, b]), t), q = track(K.map(([a, , c]) => [a, c]), t), f = track(K.map(([a, , , d]) => [a, d]), t);
  cam.position.set(...p); cam.lookAt(...q); cam.fov = f; cam.updateProjectionMatrix();
}
// ---------- screen anchors for the overlay ----------
const ANCH = document.documentElement.style;
function anchor(name, v) {
  const p = v.clone().project(cam);
  ANCH.setProperty(`--${name}-x`, ((p.x + 1) / 2 * W).toFixed(1) + "px");
  ANCH.setProperty(`--${name}-y`, ((1 - p.y) / 2 * H).toFixed(1) + "px");
}

// ---------- frame ----------
function nightAmt(t) {
  return Math.max(sm(C.night - 0.2, C.night + 0.6, t) * (1 - sm(C.dogs - 0.9, C.dogs - 0.2, t)), sm(C.camp - 0.6, C.camp + 0.3, t) * (1 - sm(C.congrats + 0.6, C.end, t) * 0));
}
let built = false;
function draw(t) {
  if (!built) return;
  const night = nightAmt(t);
  // sky + light
  scene.background = dayBG; scene.backgroundIntensity = lerp(1.0, 0.045, night); scene.environment = envDay;
  scene.environmentIntensity = lerp(0.9, 0.3, night);
  sun.intensity = lerp(3.2, 0.9, night); sun.color.setRGB(lerp(1, 0.55, night), lerp(0.95, 0.65, night), lerp(0.86, 1.0, night));
  hemi.intensity = lerp(0.5, 0.35, night); moon.material.opacity = sm(0.55, 0.9, night); hemi.color.setRGB(lerp(0.74, 0.45, night), lerp(0.84, 0.55, night), lerp(1, 0.9, night)); moon.visible = night > 0.55;
  R.toneMappingExposure = lerp(1.0, 1.45, night);
  for (const m of [fallsMat, surfMat, riverMat]) { m.uniforms.uT.value = t; m.uniforms.uNight.value = night; }
  waterFront.material.uniforms.uNight.value = night;
  const mu = mud(t); waterFront.material.uniforms.uMud.value = mu; surfMat.uniforms.uMud.value = mu;
  foam(t, night);
  // terrain growth
  const pc = sm(C.dig + 0.2, C.door + 1.2, t), pr = sm(C.deeper + 0.2, C.mistake, t);
  setTerrain({ w: 2.9 * pc, h: 0.05 + 2.25 * clamp(pc * 1.5) }, { x: -0.2, y: -5.4, w: 3.6 * pr, h: 2.0 * clamp(pr * 1.4) });
  stageHero(t); stageSoldiers(t); stageDog(t); stageOtter(t); stageProps(t, night);
  camAt(t);
  // overlay anchors
  anchor("secret", V(0.6, 0.9, -0.2)); anchor("vent", V(-1.95, 4.6, 0)); anchor("hero", hero.wpos("Head"));
  if (dog) anchor("dog", dog.root.position.clone().add(V(0, 0.8, 0))); anchor("fire", V(10.2, 1.4, -1.6));
  anchor("lip", V(0.2, 8.4, -1.5));
  R.render(scene, cam);
}
window.addEventListener("hf-seek", (e) => draw(e.detail.time));
window.WORLD_draw = draw;


// ---------- vegetation (Poly Haven CC0, loaded if present) ----------
async function plant(name) {
  if (!name) return null;
  try { const g = await loadGLB(`${name}/${name}_1k.gltf`); g.scene.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true;
      if (m.material) { m.material.side = THREE.DoubleSide; if (m.material.map) m.material.alphaTest = 0.5; } } }); return g.scene; } catch (e) { return null; }
}
function place(src, n, seed, fx, h0, h1) {     // fx(i) -> [x,y,z]; height from h0..h1 (metres)
  if (!src) return;
  src.updateMatrixWorld(true); const b = new THREE.Box3().setFromObject(src), sh = Math.max(0.001, b.max.y - b.min.y);
  for (let i = 0; i < n; i++) {
    const p = fx(i); if (!p) continue; const o = src.clone(); const s = lerp(h0, h1, hash(seed + i)) / sh;
    o.scale.setScalar(s); o.position.set(p[0], p[1] - b.min.y * s, p[2]); o.rotation.y = hash(seed + i * 3) * 6.28; scene.add(o);
  }
}
async function vegetation() {
  const [pine, fir, fern, shrub, rocks, boulder, grass, moss, trunk] = await Promise.all(
    ["pine_tree_01", null, "fern_02", "shrub_01", "rock_moss_set_01", "boulder_01", "grass_medium_01", "moss_01", "dead_tree_trunk"].map(plant));
  const tree = pine || fir;
  place(tree, 12, 11, (i) => [-13 + i * 1.0 + hash(i) * 0.6, TOP_BACK, -4.6 - hash(i + 40) * 6.5], 7, 11);
  place(tree, 9, 61, (i) => [8.4 + i * 0.85 + hash(i + 2) * 0.5, 0.25, -4.5 - hash(i + 70) * 6.5], 7, 10.5);
  place(tree, 10, 91, (i) => [-13 + i * 1.3, TOP_BACK, -13 - hash(i + 9) * 14], 9, 13);
  place(tree, 8, 97, (i) => [8.0 + i * 1.0, 0.25, -13 - hash(i + 19) * 14], 9, 13);
  place(fern, 9, 21, (i) => [-2.6 + i * 0.32, TOP_FRONT, -0.25 - hash(i + 5) * 0.75], 0.5, 0.9);   // ferns over the vent exit
  place(fern, 10, 31, (i) => [-12 + i * 1.1, TOP_BACK, -3.3 - hash(i + 1) * 0.6], 0.45, 0.8);
  place(fern, 8, 37, (i) => [7.6 + hash(i) * 2.0, 0.25, -0.3 - hash(i + 2) * 3.5], 0.4, 0.8);
  place(grass || shrub, 16, 41, (i) => [-13 + i * 0.75, TOP_FRONT, -0.15 - hash(i + 11) * 0.9], 0.25, 0.5);
  place(grass || shrub, 18, 47, (i) => [7.4 + hash(i + 3) * 7.5, 0.25, -0.2 - hash(i + 13) * 6], 0.25, 0.55);
  place(shrub, 5, 51, (i) => [-11 + i * 2.1, TOP_BACK, -3.8 - hash(i) * 1.2], 0.7, 1.2);
  place(rocks, 3, 71, (i) => [[1.5, -2.25, -3.2], [4.5, -0.85, -5.0], [6.4, 0.0, -2.8]][i], 0.6, 1.0);
  place(boulder, 2, 81, (i) => [[7.8, 0.25, -3.6], [-6.0, TOP_BACK, -4.0]][i], 0.8, 1.3);
  place(moss, 4, 85, (i) => [-2.4 + i * 0.6, 0.05, -2.4], 0.05, 0.1);
  place(trunk, 1, 95, () => [12.6, 0.25, -2.6], 0.5, 0.6);
}

// ---------- build ----------
(async () => {
  const [hdr, mich, sold, xbot, shep, ott] = await Promise.all([
    new HDRLoader().loadAsync("assets/hdri/kloofendal_48d_partly_cloudy_puresky.hdr"),
    loadGLB("Michelle.glb"), loadGLB("Soldier.glb"), loadGLB("Xbot.glb"), loadGLB("shepherd.glb").catch(() => null), loadGLB("otter.glb").catch(() => null),
  ]);
  hdr.mapping = THREE.EquirectangularReflectionMapping; dayBG = hdr;
  const pm = new THREE.PMREMGenerator(R); envDay = pm.fromEquirectangular(hdr).texture;
  scene.backgroundIntensity = 1.0;
  for (const a of sold.animations) ACT["s" + a.name.toLowerCase()] = inPlace(a);
  for (const a of xbot.animations) ACT[a.name.toLowerCase()] = inPlace(a);
  const mR = restQuats(mich.scene), sR = restQuats(sold.scene), xR = restQuats(xbot.scene);
  const HACT = {};
  const buildH = (mode) => { for (const a of sold.animations) HACT["s" + a.name.toLowerCase()] = retarget(a, sR, mR, mode);
    for (const a of xbot.animations) HACT[a.name.toLowerCase()] = retarget(a, xR, mR, mode); };
  buildH(RT_MODE);
  hero = new Char(mich, 1.66, null, HACT);
  window.__RT = (mode) => { buildH(mode); hero.smp = {}; };
  for (let i = 0; i < 3; i++) soldiers.push(new Char(sold, 1.82));
  if (shep) {
    dog = { root: new THREE.Group() }; const o = SkeletonUtils.clone(shep.scene); o.updateMatrixWorld(true);
    const box = new THREE.Box3().setFromObject(o, true), L = Math.max(box.max.x - box.min.x, box.max.z - box.min.z);
    o.scale.multiplyScalar(1.05 / L); o.position.y = -box.min.y * 1.05 / L; dog.root.add(o); scene.add(dog.root);
    o.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.frustumCulled = false; } });
    dog.mixer = new THREE.AnimationMixer(o); for (const a of shep.animations) dogClips[a.name.replace("AnimalArmature|", "")] = a;
  }
  if (ott) {
    otter = new THREE.Group(); const o = ott.scene; o.updateMatrixWorld(true); const box = new THREE.Box3().setFromObject(o, true), L = Math.max(box.max.x - box.min.x, box.max.y - box.min.y, box.max.z - box.min.z);
    o.scale.multiplyScalar(0.55 / L); o.position.y = -box.min.y * 0.55 / L; otter.add(o); scene.add(otter);
  }
  await vegetation();
  await R.compileAsync(scene, cam);
  built = true; draw(0); ready();
  window.__W = { scene, hero, soldiers, dog, otter, cam, THREE, P, R, built: () => built, setBuilt: (v) => { built = v; } };   // inspection handle (debug only)
})();
