import bpy, bmesh
body = bpy.data.objects["body"]; me = body.data
bm = bmesh.new(); bm.from_mesh(me)
bd = [e for e in bm.edges if e.is_boundary]
print("BOUNDARY edges", len(bd))
r = bmesh.ops.holes_fill(bm, edges=bd, sides=40)
bmesh.ops.triangulate(bm, faces=r["faces"])
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bm.to_mesh(me); bm.free(); me.update()
bm = bmesh.new(); bm.from_mesh(me); print("BOUNDARY left", sum(1 for e in bm.edges if e.is_boundary)); bm.free()
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath, compress=True); print("SAVED")
