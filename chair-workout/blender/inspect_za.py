import bpy, sys
from collections import Counter
def walk(c, d=0):
    objs = [o for o in c.objects]
    tris = 0
    for o in objs:
        if o.type == "MESH": tris += len(o.data.polygons)
    print("C" + "  " * d, c.name, "| objects", len(objs), "| faces", tris)
    if d < 2:
        for ch in c.children: walk(ch, d + 1)
walk(bpy.context.scene.collection)
types = Counter(o.type for o in bpy.data.objects); print("TYPES", dict(types), "total faces", sum(len(o.data.polygons) for o in bpy.data.objects if o.type == "MESH"))
