"""Polish the anatomy figure into one smooth sculpted surface.
1) swap the atlas hands/feet (bones and tendons) for realistic MakeHuman hands/feet fitted to the same joints
2) voxel-remesh the whole body (muscles + head + hands + feet) into one watertight surface, smooth it, decimate
3) copy bone weights (nearest surface) and per-vertex muscle group / fibre attributes onto the new surface
blender -b --disable-autoexec za_figure.blend --python za_polish.py -- <out.blend>"""
import bpy, bmesh, sys
from pathlib import Path
from mathutils import Vector, kdtree
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
from rigkit import Body
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService
OUT = sys.argv[sys.argv.index("--") + 1]
VOXEL = 0.0021

scene = bpy.context.scene
body, rig = bpy.data.objects["body"], bpy.data.objects["rig"]
J = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in rig.data.bones}
for pb in rig.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0)
rig.data.pose_position = "REST"

def islands(bm):
    bm.verts.ensure_lookup_table(); seen = set(); out = []
    for v in bm.verts:
        if v.index in seen: continue
        stack = [v]; isl = []; seen.add(v.index)
        while stack:
            x = stack.pop(); isl.append(x)
            for e in x.link_edges:
                o = e.other_vert(x)
                if o.index not in seen: seen.add(o.index); stack.append(o)
        out.append(isl)
    return out

# ---- 1) remove atlas hands and feet
wrist_l, ankle_l = J["lowerarm_l"][1], J["calf_l"][1]
bm = bmesh.new(); bm.from_mesh(body.data)
kill = []
for isl in islands(bm):
    c = sum((x.co for x in isl), Vector()) / len(isl)
    hand = abs(c.x) > 0.20 and c.z < wrist_l.z + 0.005
    foot = c.z < ankle_l.z + 0.02
    if hand or foot: kill += isl
bmesh.ops.delete(bm, geom=kill, context="VERTS"); bm.to_mesh(body.data); bm.free()
print("ATLAS HANDS/FEET REMOVED", len(kill))

# ---- realistic hands/feet from a MakeHuman body posed onto the same joints
macro = TargetService.get_default_macro_info_dict()
macro.update(gender=1.0, age=0.55, muscle=0.9, weight=0.4, proportions=1.0, height=0.55)
macro["race"] = {"asian": 0.0, "caucasian": 1.0, "african": 0.0}
proxy = HumanService.create_human(macro_detail_dict=macro, feet_on_ground=True, scale=0.1)
prig = HumanService.add_builtin_rig(proxy, "game_engine", import_weights=True)
bpy.context.view_layer.objects.active = proxy
bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
ph = (prig.matrix_world @ prig.data.bones["head"].tail_local).z
k = J["head"][1].z / ph
prig.scale = (k, k, k); bpy.context.view_layer.update(); inv = 1.0 / k
b = Body(prig)
b.hips(J["pelvis"][0] * inv)
for s in "lr":
    b.foot(s, J[f"calf_{s}"][1] * inv, knee=J[f"calf_{s}"][0] * inv + Vector((0, -0.6, 0)),
           pitch=0)
    b.hand(s, J[f"lowerarm_{s}"][1] * inv, elbow=J[f"lowerarm_{s}"][0] * inv + Vector((0, 0.6, 0)),
           up=(J[f"hand_{s}"][1] - J[f"hand_{s}"][0]))
    b.curl(s, 8)
bpy.context.view_layer.update()
bpy.ops.object.select_all(action="DESELECT"); proxy.select_set(True); bpy.context.view_layer.objects.active = proxy
for m in list(proxy.modifiers):
    if m.type == "ARMATURE": bpy.ops.object.modifier_apply(modifier=m.name)
    else: proxy.modifiers.remove(m)
mw = proxy.matrix_world.copy(); proxy.parent = None; proxy.matrix_world = mw
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
# fingers -> hand
FING = ("thumb", "index", "middle", "ring", "pinky")
names = {g.index: g.name for g in proxy.vertex_groups}
for v in proxy.data.vertices:
    add = {"l": 0.0, "r": 0.0}
    for g in v.groups:
        n = names[g.group]
        if n.split("_")[0] in FING: add[n[-1]] += g.weight
    for s in "lr":
        if add[s] > 0: proxy.vertex_groups[f"hand_{s}"].add([v.index], min(1.0, add[s]), "ADD")
gi = {g.name: g.index for g in proxy.vertex_groups}
def wsum(v, ns): return sum(g.weight for g in v.groups if g.group in [gi.get(n, -9) for n in ns])
bm = bmesh.new(); bm.from_mesh(proxy.data); dl = bm.verts.layers.deform.active
helper = [gi.get("HelperGeometry", -9), gi.get("JointCubes", -9)]
def keep(v):
    if any(h in v[dl] and v[dl][h] > 0.01 for h in helper): return False
    hw = sum(v[dl].get(gi[n], 0.0) for n in ("hand_l", "hand_r"))
    fw = sum(v[dl].get(gi[n], 0.0) for n in ("foot_l", "foot_r", "ball_l", "ball_r"))
    hand = hw > 0.5 and abs(v.co.x) > 0.2
    foot = (fw > 0.5 or v.co.z < ankle_l.z - 0.01) and v.co.z < ankle_l.z + 0.035
    return hand or foot
bmesh.ops.delete(bm, geom=[v for v in bm.verts if not keep(v)], context="VERTS"); bm.to_mesh(proxy.data); bm.free()
for g in list(proxy.vertex_groups):
    if g.name not in J: proxy.vertex_groups.remove(g)
pm = proxy.data
pm.attributes.new("fib", "FLOAT", "POINT").data.foreach_set("value", [0.0] * len(pm.vertices))
pm.attributes.new("grp", "INT", "FACE").data.foreach_set("value", [-1] * len(pm.polygons))
pm.attributes.new("act", "FLOAT", "FACE").data.foreach_set("value", [0.0] * len(pm.polygons))
bpy.data.objects.remove(prig, do_unlink=True)
for m in list(body.modifiers): body.modifiers.remove(m)
body.parent = None
bpy.ops.object.select_all(action="DESELECT"); proxy.select_set(True); body.select_set(True)
bpy.context.view_layer.objects.active = body; bpy.ops.object.join()
src = body; src.name = "src"
print("SOURCE verts", len(src.data.vertices))

# per-vertex group id and fibre value on the source (faces -> verts)
sm = src.data
gface = [0] * len(sm.polygons); sm.attributes["grp"].data.foreach_get("value", gface)
fib = [0.0] * len(sm.vertices); sm.attributes["fib"].data.foreach_get("value", fib)
vgrp = [None] * len(sm.vertices)
for p, g in zip(sm.polygons, gface):
    for i in p.vertices:
        if vgrp[i] is None or g > 0: vgrp[i] = g
kd = kdtree.KDTree(len(sm.vertices))
for v in sm.vertices: kd.insert(v.co, v.index)
kd.balance()

# ---- 2) one smooth surface
new_me = sm.copy(); sculpt = bpy.data.objects.new("body", new_me); scene.collection.objects.link(sculpt)
for g in list(sculpt.vertex_groups): sculpt.vertex_groups.remove(g)
for a in list(new_me.attributes):
    if a.name in ("grp", "fib", "act"): new_me.attributes.remove(a)
bpy.ops.object.select_all(action="DESELECT"); sculpt.select_set(True); bpy.context.view_layer.objects.active = sculpt
r = sculpt.modifiers.new("remesh", "REMESH"); r.mode = "VOXEL"; r.voxel_size = VOXEL; r.adaptivity = 0.0; r.use_smooth_shade = True
bpy.ops.object.modifier_apply(modifier="remesh")
print("REMESH verts", len(sculpt.data.vertices))
sm2 = sculpt.modifiers.new("smooth", "SMOOTH"); sm2.factor = 0.6; sm2.iterations = 4
bpy.ops.object.modifier_apply(modifier="smooth")
nf = len(sculpt.data.polygons)
d = sculpt.modifiers.new("dec", "DECIMATE"); d.ratio = min(1.0, 420000 / nf)
bpy.ops.object.modifier_apply(modifier="dec")
for p in sculpt.data.polygons: p.use_smooth = True
print("FINAL faces", len(sculpt.data.polygons))

# ---- 3) attributes and weights
me2 = sculpt.data
g2, f2 = [], []
for v in me2.vertices:
    co, i, dist = kd.find(v.co)
    g2.append(float(vgrp[i] if vgrp[i] is not None else 0)); f2.append(fib[i])
me2.attributes.new("grp", "FLOAT", "POINT").data.foreach_set("value", g2)
me2.attributes.new("fib", "FLOAT", "POINT").data.foreach_set("value", f2)
me2.attributes.new("act", "FLOAT", "POINT").data.foreach_set("value", [0.0] * len(me2.vertices))
for n in J: sculpt.vertex_groups.new(name=n)
dt = sculpt.modifiers.new("dt", "DATA_TRANSFER"); dt.object = src
dt.use_vert_data = True; dt.data_types_verts = {"VGROUP_WEIGHTS"}; dt.vert_mapping = "POLYINTERP_NEAREST"
dt.layers_vgroup_select_src = "ALL"; dt.layers_vgroup_select_dst = "NAME"
bpy.ops.object.modifier_apply(modifier="dt")
bpy.ops.object.vertex_group_normalize_all(lock_active=False)
me2.materials.clear(); me2.materials.append(sm.materials[0])
sculpt["groups"] = src["groups"] if "groups" in src else {}
bpy.data.objects.remove(src, do_unlink=True)
arm = sculpt.modifiers.new("Armature", "ARMATURE"); arm.object = rig
sculpt.parent = rig
rig.data.pose_position = "POSE"
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT, compress=True)
print("SAVED", OUT)
