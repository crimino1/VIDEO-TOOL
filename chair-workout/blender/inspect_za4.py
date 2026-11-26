import bpy
from mathutils import Vector
def objs(c):
    out = list(c.objects)
    for ch in c.children: out += objs(ch)
    return out
sk = [o for o in objs(bpy.data.collections["1: Skeletal system"]) if o.type == "MESH" and len(o.data.polygons) > 0]
def box(o):
    vs = [o.matrix_world @ v.co for v in o.data.vertices]
    lo = Vector(map(min, *zip(*vs))) if False else Vector((min(v.x for v in vs), min(v.y for v in vs), min(v.z for v in vs)))
    hi = Vector((max(v.x for v in vs), max(v.y for v in vs), max(v.z for v in vs)))
    return lo, hi
want = ("vertebra", "femur", "tibia", "humerus", "radius", "ulna", "clavicle", "sacrum", "hip bone", "talus", "calcaneus", "metacarpal", "metatarsal", "phalanx", "cranium", "frontal", "occipital", "mandible", "hyoid", "atlas", "axis", "sternum", "patella", "fibula", "scapula", "coccyx")
for o in sorted(sk, key=lambda o: o.name):
    n = o.name.lower()
    if any(k in n for k in want) and (o.name.endswith(".l") or "." not in o.name or o.name.endswith(".r") is False):
        lo, hi = box(o)
        print("B", o.name, [round(x, 3) for x in lo], [round(x, 3) for x in hi], len(o.data.polygons))
