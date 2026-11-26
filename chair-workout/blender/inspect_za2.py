import bpy
from mathutils import Vector
mus = bpy.data.collections["4: Muscular system"]
def objs(c):
    out = list(c.objects)
    for ch in c.children: out += objs(ch)
    return out
M = [o for o in objs(mus) if o.type == "MESH"]
lo = Vector((9e9,) * 3); hi = Vector((-9e9,) * 3)
for o in M:
    for c in o.bound_box:
        w = o.matrix_world @ Vector(c); lo = Vector(map(min, lo, w)); hi = Vector(map(max, hi, w))
print("MUSBOX", [round(x, 3) for x in lo], [round(x, 3) for x in hi])
print("SUBCOLS", [ch.name for ch in mus.children])
for ch in mus.children:
    print("SUB", ch.name, [g.name for g in ch.children][:12], len(objs(ch)))
names = sorted(o.name for o in M)
print("NAMES", names[:60])
big = sorted(M, key=lambda o: -len(o.data.polygons))[:15]
print("BIG", [(o.name, len(o.data.polygons)) for o in big])
sk = objs(bpy.data.collections["1: Skeletal system"])
print("BONES", [o.name for o in sk if any(k in o.name.lower() for k in ("femur", "humerus", "tibia", "radius", "skull", "cranium", "mandible", "patella"))][:30])
