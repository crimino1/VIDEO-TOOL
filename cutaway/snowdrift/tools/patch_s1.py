"""Patch 1 for the snowdrift world: exposure/contrast, rounded drift, path cleanup, soldier distance, hook framing."""
from pathlib import Path
p = Path(__file__).resolve().parents[1] / "hf/assets/js/world.js"
s = p.read_text(encoding="utf-8")
rep = [
    # --- look: less blown-out snow, visible strata, blue cave
    ("cut: new THREE.MeshStandardMaterial({ map: strataTex(), roughness: 0.85, color: 0xffffff }),",
     "cut: new THREE.MeshStandardMaterial({ map: strataTex(), roughness: 0.85, color: 0xe4ebf4 }),"),
    ("cave: new THREE.MeshStandardMaterial({ map: strataTex(), roughness: 0.9, color: 0xdbe6f2 }),",
     "cave: new THREE.MeshStandardMaterial({ map: strataTex(), roughness: 0.9, color: 0x9fb4cf }),"),
    ("x.fillStyle = `rgba(${150 + hash(i + 5) * 40 | 0},${175 + hash(i + 6) * 40 | 0},${205 + hash(i + 7) * 30 | 0},${0.18 + hash(i + 8) * 0.22})`;",
     "x.fillStyle = `rgba(${120 + hash(i + 5) * 40 | 0},${150 + hash(i + 6) * 40 | 0},${190 + hash(i + 7) * 30 | 0},${0.28 + hash(i + 8) * 0.3})`;"),
    ("R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 1.0;", "R.toneMapping = THREE.ACESFilmicToneMapping; R.toneMappingExposure = 0.82;"),
    ("sun.intensity = lerp(2.2, 0.5, night) * lerp(1, 0.45, storm); hemi.intensity = lerp(0.9, 0.3, night);",
     "sun.intensity = lerp(2.6, 0.5, night) * lerp(1, 0.45, storm); hemi.intensity = lerp(0.55, 0.3, night);"),
    ("moon.visible = night > 0.6; R.toneMappingExposure = lerp(1.0, 1.35, night);", "moon.visible = night > 0.6; R.toneMappingExposure = lerp(0.82, 1.2, night);"),
    ("const sun = new THREE.DirectionalLight(0xf2f5ff, 2.2); sun.position.set(-12, 20, 14);",
     "const sun = new THREE.DirectionalLight(0xfff1dd, 2.6); sun.position.set(-16, 12, 10);"),
    # --- the drift is a mound, not a 40 m ridge: back slab is flat ground, a squashed sphere rounds the drift off behind the cut
    ("const back = new THREE.Mesh(slab(0, 0, -SLAB, 40, false), [MAT.snow, MAT.snow]);",
     "const back = new THREE.Mesh(slabFlat(-SLAB, 40), [MAT.snow, MAT.snow]);\n"
     "const mound = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2), MAT.snow);\n"
     "mound.scale.set(3.4, 2.85, 3.2); mound.position.set(-2.1, 0, -3.4); mound.castShadow = mound.receiveShadow = true; scene.add(mound);"),
    ("function slab(p, p2, z0, depth, withHoles) {",
     "function slabFlat(z0, depth) {\n"
     "  const L = [[-14, -4], [14, -4], [14, 0], [6.6, 0], [6.4, -0.15], [3.6, -0.15], [3.4, 0.0], [-14, 0]];\n"
     "  const g = new THREE.ExtrudeGeometry(new THREE.Shape(L.map(([x, y]) => new THREE.Vector2(x, y))), { depth, bevelEnabled: false }); g.translate(0, 0, z0 - depth); return g;\n"
     "}\nfunction slab(p, p2, z0, depth, withHoles) {"),
    # --- path: drop the cut-face band and the floating surface strip, keep a subtle packed strip flush with the dip
    ("pathCut.position.set(5.0, -0.36, 0.004); scene.add(pathCut);", "pathCut.visible = false;"),
    ("m.position.set(5.0, -0.145, -21.5); m.receiveShadow = true; scene.add(m); }", "m.position.set(5.0, -0.148, -21.5); m.receiveShadow = true; m.visible = false; scene.add(m); }"),
    # --- soldiers stay further back on the path
    ("s.set(name, { x: 4.4 + i * 1.1, y: -0.15, z: lerp(-14, -1.0, sm(C.storm, C.mistake + 1.5, t)) - i * 1.6,",
     "s.set(name, { x: 4.4 + i * 1.1, y: -0.15, z: lerp(-16, -3.6, sm(C.storm, C.mistake + 1.5, t)) - i * 1.4,"),
    # --- hook: hero already in frame, soldiers on his trail in the back
    ("hero.set(P.walk, { x: lerp(8.6, 3.0, k), y: 0, z: -1.3,", "hero.set(P.walk, { x: lerp(6.4, 3.0, k), y: 0, z: -1.3,"),
    ("const hx = t < C.tracks ? lerp(8.6, 3.0, sm(0, C.tracks, t)) : 3.0;", "const hx = t < C.tracks ? lerp(6.4, 3.0, sm(0, C.tracks, t)) : 3.0;"),
    ("const k = sm(0, C.dig, t), x = lerp(-9.5 + i * 1.2, -5.8 + i * 1.2, k), walking = k > 0.01 && k < 0.99;\n      s.set(name, { x, y: 0, z: -7.5 - i * 0.6,",
     "const k = sm(0, C.dig, t), x = lerp(10.5 + i * 1.3, 6.0 + i * 1.3, k), walking = k > 0.01 && k < 0.99;\n      s.set(name, { x, y: 0, z: -8.5 - i * 0.8,"),
]
for a, b in rep:
    assert a in s, a[:80]
    s = s.replace(a, b)
p.write_text(s, encoding="utf-8")
print("patched", len(rep))
