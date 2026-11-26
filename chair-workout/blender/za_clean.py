"""Remove atlas leftovers from the joined body (label text, stray parts outside the body) and save."""
import bpy, bmesh
body = bpy.data.objects["body"]; me = body.data
bm = bmesh.new(); bm.from_mesh(me)
# connected islands: drop islands whose centre lies outside the standing body, and tiny far-off fragments
bm.verts.ensure_lookup_table()
seen = set(); kill = []
for v in bm.verts:
    if v.index in seen: continue
    stack = [v]; isl = []
    seen.add(v.index)
    while stack:
        x = stack.pop(); isl.append(x)
        for e in x.link_edges:
            o = e.other_vert(x)
            if o.index not in seen: seen.add(o.index); stack.append(o)
    c = sum((x.co for x in isl), isl[0].co * 0) / len(isl)
    if abs(c.x) > 0.42 or c.z < -0.02 or c.z > 1.76: kill += isl
print("REMOVE", len(kill), "verts")
bmesh.ops.delete(bm, geom=kill, context="VERTS"); bm.to_mesh(me); bm.free()
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath, compress=True); print("SAVED")
