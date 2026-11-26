import bpy
from collections import Counter
from mathutils import Vector
def objs(c):
    out = list(c.objects)
    for ch in c.children: out += objs(ch)
    return out
def cen(o):
    return sum((o.matrix_world @ Vector(c) for c in o.bound_box), Vector()) / 8
M = [o for o in objs(bpy.data.collections["4: Muscular system"]) if o.type == "MESH"]
suf = Counter(); polys = Counter()
for o in M:
    s = o.name.rsplit(".", 1)[-1] if "." in o.name else "-"; suf[s] += 1; polys[s] += len(o.data.polygons)
print("SUF", dict(suf), dict(polys))
for n in ["Rectus abdominis muscle.l", "Gluteus maximus muscle.l", "Rectus femoris muscle.l", "Biceps brachii muscle.l", "Deltoid muscle.l", "Acromial part of deltoid muscle.l"]:
    o = bpy.data.objects.get(n)
    print("OBJ", n, [round(x, 3) for x in cen(o)] if o else None, len(o.data.polygons) if o else 0, o.hide_render if o else None, o.visible_get() if o else None)
far = [o.name for o in M if cen(o).x < -0.4][:10]; print("FAR", far)
print("SAMPLE_R", [o.name for o in M if o.name.endswith(".r")][100:140])
sk = [o for o in objs(bpy.data.collections["1: Skeletal system"]) if o.type == "MESH" and len(o.data.polygons) > 0]
print("SKSUF", Counter(o.name.rsplit(".", 1)[-1] if "." in o.name else "-" for o in sk))
print("SKBIG", sorted([(o.name, len(o.data.polygons)) for o in sk], key=lambda x: -x[1])[:25])
