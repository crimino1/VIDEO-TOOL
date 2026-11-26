"""1) Side-clean the weights (no left-side point follows right-side bones and vice versa).
2) Replace the bony atlas head with a realistic MakeHuman head (same white material), fitted to the skull.
blender -b --disable-autoexec za_figure.blend --python za_head.py"""
import bpy, bmesh, sys
from pathlib import Path
from mathutils import Vector
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
from rigkit import Body
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService
from bl_ext.blender_org.mpfb.services.locationservice import LocationService

scene = bpy.context.scene
body, rig = bpy.data.objects["body"], bpy.data.objects["rig"]
J = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in rig.data.bones}
me = body.data

# ---- 1) side-clean weights
gname = {g.index: g.name for g in body.vertex_groups}
for v in me.vertices:
    if abs(v.co.x) < 0.02: continue
    wrong = "_r" if v.co.x > 0 else "_l"
    bad = [g for g in v.groups if gname[g.group].endswith(wrong)]
    if not bad: continue
    for g in bad: body.vertex_groups[gname[g.group]].remove([v.index])
    tot = sum(g.weight for g in v.groups)
    if tot < 1e-6:
        side = "_l" if v.co.x > 0 else "_r"
        body.vertex_groups["thigh" + side if v.co.z < 0.9 else "spine_01"].add([v.index], 1.0, "REPLACE")
    else:
        for g in v.groups: g.weight /= tot

# ---- 2) remove the atlas head (islands whose centre is above the neck)
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
seen = set(); kill = []
for v in bm.verts:
    if v.index in seen: continue
    stack = [v]; isl = []; seen.add(v.index)
    while stack:
        x = stack.pop(); isl.append(x)
        for e in x.link_edges:
            o = e.other_vert(x)
            if o.index not in seen: seen.add(o.index); stack.append(o)
    c = sum((x.co for x in isl), Vector()) / len(isl)
    if c.z > 1.505 and abs(c.x) < 0.11: kill += isl
bmesh.ops.delete(bm, geom=kill, context="VERTS"); bm.to_mesh(me); bm.free()
print("HEAD PARTS REMOVED", len(kill))

# ---- realistic head from MakeHuman, posed onto the anatomy skeleton (same fit as za_skin.py)
macro = TargetService.get_default_macro_info_dict()
macro.update(gender=1.0, age=0.55, muscle=0.9, weight=0.4, proportions=1.0, height=0.55)
macro["race"] = {"asian": 0.0, "caucasian": 1.0, "african": 0.0}
proxy = HumanService.create_human(macro_detail_dict=macro, feet_on_ground=True, scale=0.1)
prig = HumanService.add_builtin_rig(proxy, "game_engine", import_weights=True)
data = Path(LocationService.get_user_data())
eyes = HumanService.add_mhclo_asset(str(data / "eyes/high-poly/high-poly.mhclo"), proxy, asset_type="Eyes", subdiv_levels=0, material_type="MAKESKIN")
bpy.context.view_layer.objects.active = proxy
bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
ph = (prig.matrix_world @ prig.data.bones["head"].tail_local).z
k = J["head"][1].z / ph
prig.scale = (k, k, k); bpy.context.view_layer.update()
inv = 1.0 / k
b = Body(prig)
b.hips(J["pelvis"][0] * inv)
b.spine()
bpy.context.view_layer.update()
def bake(o):
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
    if o.data.shape_keys: bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
    for m in list(o.modifiers):
        if m.type == "ARMATURE": bpy.ops.object.modifier_apply(modifier=m.name)
        else: o.modifiers.remove(m)
    mw = o.matrix_world.copy(); o.parent = None; o.matrix_world = mw
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
bake(proxy); bake(eyes)

# keep only the head and upper neck of the proxy
gi = {g.name: g.index for g in proxy.vertex_groups}
def w(v, *ns): return sum(g.weight for g in v.groups if g.group in [gi.get(n, -9) for n in ns])
bm = bmesh.new(); bm.from_mesh(proxy.data); dl = bm.verts.layers.deform.active
helper = [gi.get("HelperGeometry", -9), gi.get("JointCubes", -9)]
drop = [v for v in bm.verts if any(h in v[dl] and v[dl][h] > 0.01 for h in helper)
        or (sum(v[dl].get(gi.get(n, -9), 0.0) for n in ("head", "neck_01")) < 0.35) or v.co.z < 1.45]
bmesh.ops.delete(bm, geom=drop, context="VERTS"); bm.to_mesh(proxy.data); bm.free()
# fit to the atlas skull: match head height around the skull centre
skull_c = (J["head"][0] + J["head"][1]) / 2
zs = [v.co.z for v in proxy.data.vertices]; top = max(zs)
s = (J["head"][1].z - 1.50) / (top - 1.50)
for o in (proxy, eyes):
    for v in o.data.vertices:
        v.co = Vector((v.co.x * s, J["head"][0].y + (v.co.y - J["head"][0].y) * s, 1.50 + (v.co.z - 1.50) * s))
print("HEAD FIT scale", round(s, 3))
bpy.ops.object.select_all(action="DESELECT"); proxy.select_set(True); eyes.select_set(True)
bpy.context.view_layer.objects.active = proxy; bpy.ops.object.join()
head = proxy
# attributes the body material expects; grp -1 = solid white (no fibres)
hm = head.data
hm.attributes.new("fib", "FLOAT", "POINT").data.foreach_set("value", [0.0] * len(hm.vertices))
hm.attributes.new("grp", "INT", "FACE").data.foreach_set("value", [-1] * len(hm.polygons))
hm.attributes.new("act", "FLOAT", "FACE").data.foreach_set("value", [0.0] * len(hm.polygons))
for p in hm.polygons: p.use_smooth = True
for g in list(head.vertex_groups):
    if g.name not in ("head", "neck_01", "spine_03"): head.vertex_groups.remove(g)
hm.materials.clear(); hm.materials.append(body.data.materials[0])
sm = head.modifiers.new("sub", "SUBSURF"); sm.levels = 1; sm.render_levels = 1
bpy.ops.object.modifier_apply(modifier="sub")
bpy.data.objects.remove(prig, do_unlink=True)

bpy.ops.object.select_all(action="DESELECT"); head.select_set(True); body.select_set(True)
bpy.context.view_layer.objects.active = body; bpy.ops.object.join()
bpy.ops.object.vertex_group_normalize_all(lock_active=False)
# make bone/head white match the muscle white
mat = body.data.materials[0]
for n in mat.node_tree.nodes:
    if n.type == "MIX" and n.inputs["B"].default_value[:3] == (0.6000000238418579, 0.5799999833106995, 0.5400000214576721):
        n.inputs["B"].default_value = (0.58, 0.58, 0.60, 1)
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath, compress=True)
print("SAVED")
