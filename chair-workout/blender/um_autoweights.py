"""Automatic (bone heat) weights computed on a watertight voxel copy, then copied back onto the original mesh."""
import bpy, sys
OUT = sys.argv[sys.argv.index("--") + 1]
scene = bpy.context.scene
body, rig = bpy.data.objects["body"], bpy.data.objects["rig"]
for m in list(body.modifiers): body.modifiers.remove(m)
body.parent = None
for pb in rig.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0)
cp = bpy.data.objects.new("heat", body.data.copy()); scene.collection.objects.link(cp)
for g in list(cp.vertex_groups): cp.vertex_groups.remove(g)
bpy.ops.object.select_all(action="DESELECT"); cp.select_set(True); bpy.context.view_layer.objects.active = cp
r = cp.modifiers.new("r", "REMESH"); r.mode = "VOXEL"; r.voxel_size = 0.006; bpy.ops.object.modifier_apply(modifier="r")
d = cp.modifiers.new("d", "DECIMATE"); d.ratio = min(1.0, 40000 / len(cp.data.polygons)); bpy.ops.object.modifier_apply(modifier="d")
print("HEAT mesh faces", len(cp.data.polygons))
bpy.ops.object.select_all(action="DESELECT"); cp.select_set(True); rig.select_set(True); bpy.context.view_layer.objects.active = rig
bpy.ops.object.parent_set(type="ARMATURE_AUTO")
print("HEAT verts without weights", sum(1 for v in cp.data.vertices if not v.groups), "of", len(cp.data.vertices))
for g in list(body.vertex_groups): body.vertex_groups.remove(g)
for g in cp.vertex_groups: body.vertex_groups.new(name=g.name)
bpy.ops.object.select_all(action="DESELECT"); body.select_set(True); bpy.context.view_layer.objects.active = body
dt = body.modifiers.new("dt", "DATA_TRANSFER"); dt.object = cp
dt.use_vert_data = True; dt.data_types_verts = {"VGROUP_WEIGHTS"}; dt.vert_mapping = "POLYINTERP_NEAREST"
dt.layers_vgroup_select_src = "ALL"; dt.layers_vgroup_select_dst = "NAME"
bpy.ops.object.modifier_apply(modifier="dt")
bpy.ops.object.vertex_group_normalize_all(lock_active=False)
print("BODY verts without weights", sum(1 for v in body.data.vertices if not v.groups))
bpy.data.objects.remove(cp, do_unlink=True)
a = body.modifiers.new("Armature", "ARMATURE"); a.object = rig; body.parent = rig
bpy.ops.wm.save_as_mainfile(filepath=OUT, compress=True); print("SAVED")
