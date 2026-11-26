import bpy, sys
from mathutils import Vector
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[-1])
o = [x for x in bpy.data.objects if x.type == "MESH"][0]
co = [o.matrix_world @ v.co for v in o.data.vertices]
zmin = min(c.z for c in co); zmax = max(c.z for c in co); H = zmax - zmin
s = 1.78 / H
co = [Vector(((c.x) * s, (c.y) * s, (c.z - zmin) * s)) for c in co]
print("H raw", round(H, 3), "scale", round(s, 3))
def sl(z0, z1, f=lambda c: True):
    p = [c for c in co if z0 <= c.z < z1 and f(c)]
    if not p: return None
    return len(p), [round(min(c.x for c in p), 3), round(max(c.x for c in p), 3)], [round(min(c.y for c in p), 3), round(max(c.y for c in p), 3)], [round(sum(c.x for c in p) / len(p), 3), round(sum(c.y for c in p) / len(p), 3)]
for z in [0.02, 0.06, 0.10, 0.30, 0.45, 0.50, 0.55, 0.70, 0.80, 0.85, 0.90, 0.95, 1.0, 1.05, 1.1, 1.2, 1.3, 1.35, 1.40, 1.45, 1.5, 1.55, 1.6, 1.7, 1.75]:
    print("Z", z, "all", sl(z, z + 0.01), "L", sl(z, z + 0.01, lambda c: c.x > 0.0))
# arm: lateral points
for z in [0.75, 0.80, 0.85, 0.9, 0.95, 1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35, 1.4, 1.45]:
    print("ARM", z, sl(z, z + 0.01, lambda c: c.x > 0.17))
