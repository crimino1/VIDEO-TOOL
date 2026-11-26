"""Patch 2: world edges, cave-follow digging, mud, night light, crack width, soldiers on the near bank."""
from pathlib import Path
p = Path(__file__).resolve().parents[1] / "hf/assets/js/world.js"
s = p.read_text(encoding="utf-8")
rep = [
    # world goes far back so distant trees stand on ground
    ('const back = new THREE.Mesh(slabGeo(TOP_BACK, null, null, -SLAB, 9), [MAT.side, MAT.side]);',
     'const back = new THREE.Mesh(slabGeo(TOP_BACK, null, null, -SLAB, 34), [MAT.side, MAT.side]);'),
    ('strip(-14, -0.15, TOP_BACK, -12, -SLAB, MAT.ground);', 'strip(-14, -0.15, TOP_BACK, -37, -SLAB, MAT.ground);'),
    ('strip(7.2, 16, 0.25, -12, 0, MAT.ground);', 'strip(7.2, 16, 0.25, -37, 0, MAT.ground);'),
    ('{ const g = new THREE.PlaneGeometry(7.2, 12); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, surfMat); m.position.set(3.6 + 0.2, 0, -6);',
     '{ const g = new THREE.PlaneGeometry(7.2, 37); g.rotateX(-Math.PI / 2); const m = new THREE.Mesh(g, surfMat); m.position.set(3.6 + 0.2, 0, -18.5);'),
    ('place(tree, 10, 91, (i) => [-20 + i * 4.2, TOP_BACK - 0.5, -14 - hash(i + 9) * 8], 9, 13);',
     'place(tree, 10, 91, (i) => [-13 + i * 1.3, TOP_BACK, -13 - hash(i + 9) * 14], 9, 13);\n  place(tree, 8, 97, (i) => [8.0 + i * 1.0, 0.25, -13 - hash(i + 19) * 14], 9, 13);'),
    # hero stays inside the growing cave while digging
    ('c.pose([["idle", t, 1]]); c.at(lerp(-0.5, -2.0, sm(C.dig, C.door + 0.8, t)), 0, -1.6, -90);',
     'c.pose([["idle", t, 1]]); c.at(-Math.max(0.35, 2.9 * sm(C.dig + 0.2, C.door + 1.2, t) - 0.75), 0, -1.6, -90);'),
    ('c.pose([["idle", t, 1]]); c.at(lerp(0.9, -0.2, sm(C.deeper, C.mistake, t)), 0, -1.6, -90);',
     'c.pose([["idle", t, 1]]); c.at(0.4 - 1.8 * sm(C.deeper + 0.2, C.mistake, t), 0, -1.6, -90);'),
    # mud sprites: fainter, darker at night
    ('s.scale.set(sz, sz, 1); s.material.opacity = 0.75 * grow * gone;',
     's.scale.set(sz, sz, 1); s.material.opacity = 0.32 * grow * gone; s.material.color.setScalar(1 - 0.7 * nightAmt(t));'),
    # night: brighter moonlight so wide shots read
    ('scene.environmentIntensity = lerp(0.9, 0.12, night);', 'scene.environmentIntensity = lerp(0.9, 0.3, night);'),
    ('sun.intensity = lerp(3.2, 0.25, night);', 'sun.intensity = lerp(3.2, 0.9, night);'),
    ('hemi.intensity = lerp(0.5, 0.08, night);', 'hemi.intensity = lerp(0.5, 0.35, night); hemi.color.setRGB(lerp(0.74, 0.45, night), lerp(0.84, 0.55, night), lerp(1, 0.9, night));'),
    ('R.toneMappingExposure = lerp(1.0, 1.25, night);', 'R.toneMappingExposure = lerp(1.0, 1.45, night);'),
    # thinner crack
    ('pts.push([x, y, 0.022 + 0.016 * hash(i + 4)]);', 'pts.push([x, y, 0.011 + 0.01 * hash(i + 4)]);'),
    # soldiers walk the near bank, right at the cut edge (visible in the hook)
    ('s.at(lerp(-9.5 + i * 1.3, -2.2 - i * 1.3, k), TOP_BACK, -SLAB - 0.8 - i * 0.9, lerp(90, 120, sm(C.shadow - 0.2, C.shadow + 0.4, t)));',
     's.at(lerp(-9.0 + i * 1.3, -3.0 - i * 1.4, k), TOP_FRONT, -0.55 - i * 0.25, lerp(90, 130, sm(C.shadow - 0.2, C.shadow + 0.4, t)));'),
]
for a, b in rep:
    assert a in s, a[:70]
    s = s.replace(a, b)
p.write_text(s, encoding="utf-8")
print("patched", len(rep))
