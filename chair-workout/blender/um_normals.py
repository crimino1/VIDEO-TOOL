import bpy, bmesh
body = bpy.data.objects["body"]; me = body.data
print("CUSTOM NORMALS before", me.has_custom_normals)
bpy.context.view_layer.objects.active = body; body.select_set(True)
bpy.ops.mesh.customdata_custom_splitnormals_clear()
for a in [a.name for a in me.attributes if a.name in ("sharp_face", "sharp_edge")]: me.attributes.remove(me.attributes[a])
# flip faces that disagree with their neighbours
bm = bmesh.new(); bm.from_mesh(me); bm.faces.ensure_lookup_table(); bm.normal_update()
flipped = 0
for _ in range(3):
    for f in bm.faces:
        ns = [g.normal for e in f.edges for g in e.link_faces if g is not f]
        if ns and f.normal.dot(sum(ns, f.normal * 0)) < 0: f.normal_flip(); flipped += 1
    bm.normal_update()
bm.to_mesh(me); bm.free()
for p in me.polygons: p.use_smooth = True
print("CUSTOM NORMALS after", me.has_custom_normals, "flipped", flipped)
m = me.materials[0]
for n in m.node_tree.nodes:   # crisper red edge from the soft mask
    if n.type == "MAP_RANGE" and n.inputs["Value"].links and n.inputs["Value"].links[0].from_node.type == "ATTRIBUTE" and n.inputs["Value"].links[0].from_node.attribute_name == "act":
        n.inputs["From Min"].default_value = 0.42; n.inputs["From Max"].default_value = 0.58; print("ACT RANGE set")
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath, compress=True); print("SAVED")
