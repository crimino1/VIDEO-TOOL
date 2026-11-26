"""Patch 3: smooth day/night sky (no texture swap), flat moss bed, closer ending camera."""
from pathlib import Path
import re
p = Path(__file__).resolve().parents[1] / "hf/assets/js/world.js"
s = p.read_text(encoding="utf-8")
rep = [
    ("scene.background = night > 0.5 ? nightBG : dayBG; scene.environment = envDay;",
     "scene.background = dayBG; scene.backgroundIntensity = lerp(1.0, 0.045, night); scene.environment = envDay;"),
    ("hemi.intensity = lerp(0.5, 0.35, night);", "hemi.intensity = lerp(0.5, 0.35, night); moon.material.opacity = sm(0.55, 0.9, night);"),
    ("moon.visible = night > 0.5;", "moon.visible = night > 0.55;"),
    ("const bed = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.2, 4, 12), MAT.moss); bed.scale.set(1, 0.28, 1); bed.rotation.z = Math.PI / 2; bed.visible = false; scene.add(bed);",
     "const bed = new THREE.Mesh(new THREE.CapsuleGeometry(0.42, 1.2, 4, 12).rotateZ(Math.PI / 2), MAT.moss); bed.scale.set(1, 0.3, 1); bed.visible = false; scene.add(bed);"),
]
for a, b in rep:
    assert a in s, a[:70]
    s = s.replace(a, b)
K_OLD_START = s.index("    [C.mistake + 0.4,")
K_OLD_END = s.index("  ];", K_OLD_START)
s = s[:K_OLD_START] + """    [C.mistake + 0.4, [4.2, -0.6, 16.0], [1.4, -2.4, -1.8], 60],
    [C.louder + 0.7, [12.4, 1.8, 6.8], [10.2, 0.8, -1.6], 46],
    [C.louder + 2.0, [12.0, 1.6, 6.6], [10.0, 0.8, -1.6], 46],
    [C.nothing - 0.2, [2.2, -3.6, 7.6], [-0.2, -4.6, -1.6], 50],
    [C.moss + 0.2, [1.8, -4.0, 5.4], [-0.3, -4.9, -1.6], 50],
    [C.fish + 0.6, [1.6, -4.3, 4.6], [0.3, -5.0, -1.4], 48],
    [C.congrats + 0.3, [2.6, -2.6, 10.0], [0.3, -3.6, -1.6], 54],
    [C.end + 0.6, [3.2, -1.4, 13.6], [0.5, -2.8, -1.8], 56],
""" + s[K_OLD_END:]
p.write_text(s, encoding="utf-8")
print("patched")
