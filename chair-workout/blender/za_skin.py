"""Re-skin the Z-Anatomy figure with proper weights: build a MakeHuman body, pose it so its joints sit on the anatomy
skeleton's joints, then copy each vertex's bone weights from the nearest skin point onto the muscles.
blender -b --disable-autoexec za_figure.blend --python za_skin.py"""
import bpy, sys
from pathlib import Path
from mathutils import Vector
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
from rigkit import Body
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService

scene = bpy.context.scene
body, rig = bpy.data.objects["body"], bpy.data.objects["rig"]
# leftover atlas labels
for o in list(bpy.data.objects):
    if o.type in ("FONT", "CURVE") or o.name.endswith(".g"): bpy.data.objects.remove(o, do_unlink=True)
scene.render.use_freestyle = False

J = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in rig.data.bones}

macro = TargetService.get_default_macro_info_dict()
macro.update(gender=1.0, age=0.6, muscle=0.9, weight=0.45, proportions=1.0, height=0.55)
macro["race"] = {"asian": 0.0, "caucasian": 1.0, "african": 0.0}
proxy = HumanService.create_human(macro_detail_dict=macro, feet_on_ground=True, scale=0.1)
prig = HumanService.add_builtin_rig(proxy, "game_engine", import_weights=True)
proxy.name, prig.name = "proxy", "proxy_rig"
bpy.context.view_layer.objects.active = proxy
bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
# drop helper geometry so only the real skin gives weights
gi = {g.name: g.index for g in proxy.vertex_groups}
import bmesh
bm = bmesh.new(); bm.from_mesh(proxy.data); dl = bm.verts.layers.deform.active
kill = [v for v in bm.verts if any(k in v[dl] and v[dl][k] > 0.01 for k in (gi.get("HelperGeometry", -9), gi.get("JointCubes", -9)))]
bmesh.ops.delete(bm, geom=kill, context="VERTS"); bm.to_mesh(proxy.data); bm.free()
proxy.modifiers.remove(proxy.modifiers["Hide helpers"]) if "Hide helpers" in proxy.modifiers else None

# scale the proxy to the anatomy's height, then pose it onto the anatomy joints
ph = max((prig.matrix_world @ b.tail_local).z for b in prig.data.bones if b.name == "head")
k = J["head"][1].z / ph
prig.scale = (k, k, k); bpy.context.view_layer.update()
inv = 1.0 / k
b = Body(prig)
b.hips(J["pelvis"][0] * inv)
for s, sx in (("l", 1), ("r", -1)):
    ankle = J[f"calf_{s}"][1] * inv; knee = J[f"calf_{s}"][0] * inv
    b.foot(s, ankle, knee=knee + Vector((0, -0.6, 0)))
    wrist = J[f"lowerarm_{s}"][1] * inv; elbow = J[f"lowerarm_{s}"][0] * inv
    b.hand(s, wrist, elbow=elbow + Vector((0, 0.6, 0)), up=(J[f"hand_{s}"][1] - J[f"hand_{s}"][0]))
bpy.context.view_layer.update()
bpy.context.view_layer.objects.active = proxy
for m in list(proxy.modifiers):
    if m.type == "ARMATURE": bpy.ops.object.modifier_apply(modifier=m.name)
    elif m.type == "SUBSURF": proxy.modifiers.remove(m)
proxy.parent = None
proxy.data.transform(prig.matrix_world); proxy.matrix_world.identity()

# fingers -> hand (the anatomy rig has no finger bones)
FING = ("thumb", "index", "middle", "ring", "pinky")
names = {g.index: g.name for g in proxy.vertex_groups}
hand = {s: proxy.vertex_groups[f"hand_{s}"] for s in "lr"}
for v in proxy.data.vertices:
    add = {"l": 0.0, "r": 0.0}
    for g in v.groups:
        n = names[g.group]
        if n.split("_")[0] in FING: add[n[-1]] += g.weight
    for s in "lr":
        if add[s] > 0: hand[s].add([v.index], min(1.0, add[s]), "ADD")
for g in list(proxy.vertex_groups):
    if g.name not in J: proxy.vertex_groups.remove(g)

# copy weights onto the anatomy
for g in list(body.vertex_groups): body.vertex_groups.remove(g)
for n in J: body.vertex_groups.new(name=n)
dt = body.modifiers.new("dt", "DATA_TRANSFER"); dt.object = proxy
dt.use_vert_data = True; dt.data_types_verts = {"VGROUP_WEIGHTS"}; dt.vert_mapping = "POLYINTERP_NEAREST"
dt.layers_vgroup_select_src = "ALL"; dt.layers_vgroup_select_dst = "NAME"
bpy.ops.object.select_all(action="DESELECT"); body.select_set(True); bpy.context.view_layer.objects.active = body
arm = body.modifiers.get("Armature")
body.modifiers.move(len(body.modifiers) - 1, 0)
bpy.ops.object.modifier_apply(modifier="dt")
bpy.ops.object.vertex_group_normalize_all(lock_active=False)
print("GROUPS", len(body.vertex_groups), [g.name for g in body.vertex_groups][:6])
bpy.data.objects.remove(proxy, do_unlink=True); bpy.data.objects.remove(prig, do_unlink=True)
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath, compress=True)
print("SAVED")
