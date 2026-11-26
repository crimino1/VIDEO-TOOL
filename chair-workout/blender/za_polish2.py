"""Polish v2: melt only the muscle body into one smooth sculpted surface, trim it at neck/wrists/ankles, then attach
the realistic MakeHuman head (already in the file) and new MakeHuman hands/feet un-melted with their own weights.
blender -b --disable-autoexec za_figure.blend --python za_polish2.py -- <out.blend>"""
import bpy, bmesh, sys
from collections import Counter
from pathlib import Path
from mathutils import Vector, kdtree
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
from rigkit import Body
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService
OUT = sys.argv[sys.argv.index("--") + 1]
VOXEL = 0.0021
CUT_T = 0.93
scene = bpy.context.scene
body, rig = bpy.data.objects["body"], bpy.data.objects["rig"]
J = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in rig.data.bones}
for pb in rig.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0)
rig.data.pose_position = "REST"
for m in list(body.modifiers): body.modifiers.remove(m)
body.parent = None
GROUPS = dict(body["groups"])
wrist = {s: J[f"lowerarm_{s}"][1] for s in "lr"}; elbow = {s: J[f"lowerarm_{s}"][0] for s in "lr"}
ankle_z = J["calf_l"][1].z

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

def beyond_wrist(co):
    s = "l" if co.x > 0 else "r"; a, b = elbow[s], wrist[s]; d = b - a
    return (co - a).dot(d) / d.length_squared > CUT_T

# ---- split: head piece (grp -1 islands high up) goes to its own object; atlas hands/feet are dropped
gface = [0] * len(body.data.polygons); body.data.attributes["grp"].data.foreach_get("value", gface)
bm = bmesh.new(); bm.from_mesh(body.data); bm.faces.ensure_lookup_table()
glay = bm.faces.layers.int.get("grp")
head_v, drop_v = set(), set()
for isl in islands(bm):
    c = sum((x.co for x in isl), Vector()) / len(isl)
    fs = {f for x in isl for f in x.link_faces}
    is_head = c.z > 1.44 and all(f[glay] == -1 for f in fs)
    if is_head: head_v |= {x.index for x in isl}
    elif c.z < ankle_z + 0.02 or (abs(c.x) > 0.2 and beyond_wrist(c)): drop_v |= {x.index for x in isl}
bm.free()
head = body.copy(); head.data = body.data.copy(); scene.collection.objects.link(head); head.name = "headpiece"
def keep_only(o, keep):
    b2 = bmesh.new(); b2.from_mesh(o.data); b2.verts.ensure_lookup_table()
    bmesh.ops.delete(b2, geom=[v for v in b2.verts if not keep(v.index)], context="VERTS"); b2.to_mesh(o.data); b2.free()
keep_only(head, lambda i: i in head_v)
keep_only(body, lambda i: i not in head_v and i not in drop_v)
print("HEAD verts", len(head.data.vertices), "MUSCLE verts", len(body.data.vertices))

# per-vertex group (majority of non-zero neighbours) on the muscle source
sm = body.data
gface = [0] * len(sm.polygons); sm.attributes["grp"].data.foreach_get("value", gface)
vg = [[] for _ in sm.vertices]
for p, g in zip(sm.polygons, gface):
    for i in p.vertices: vg[i].append(g)
vgrp = [max(set(l), key=l.count) if l else 0 for l in vg]
kd = kdtree.KDTree(len(sm.vertices))
for v in sm.vertices: kd.insert(v.co, v.index)
kd.balance()

# ---- melt the muscles into one surface
sc = bpy.data.objects.new("body_new", sm.copy()); scene.collection.objects.link(sc)
for a in [a.name for a in sc.data.attributes if a.name in ("grp", "fib", "act")]: sc.data.attributes.remove(sc.data.attributes[a])
bpy.ops.object.select_all(action="DESELECT"); sc.select_set(True); bpy.context.view_layer.objects.active = sc
r = sc.modifiers.new("remesh", "REMESH"); r.mode = "VOXEL"; r.voxel_size = VOXEL; r.adaptivity = 0.0
bpy.ops.object.modifier_apply(modifier="remesh")
s2 = sc.modifiers.new("smooth", "SMOOTH"); s2.factor = 0.6; s2.iterations = 4; bpy.ops.object.modifier_apply(modifier="smooth")
d = sc.modifiers.new("dec", "DECIMATE"); d.ratio = min(1.0, 380000 / len(sc.data.polygons)); bpy.ops.object.modifier_apply(modifier="dec")
# trim at neck, wrists, ankles (the attached parts overlap these cuts)
keep_only(sc, lambda i: True)
b3 = bmesh.new(); b3.from_mesh(sc.data); b3.verts.ensure_lookup_table()
cut = [v for v in b3.verts if v.co.z > 1.49 or v.co.z < ankle_z + 0.03 or (abs(v.co.x) > 0.2 and beyond_wrist(v.co))]
bmesh.ops.delete(b3, geom=cut, context="VERTS"); b3.to_mesh(sc.data); b3.free()
for p in sc.data.polygons: p.use_smooth = True
print("SCULPT faces", len(sc.data.polygons))
me2 = sc.data
g2 = []
for v in me2.vertices:
    near = kd.find_n(v.co, 16)
    votes = Counter(vgrp[i] for _, i, _ in near if vgrp[i] != 0)
    g2.append(float(votes.most_common(1)[0][0]) if votes else 0.0)
# two passes of neighbour majority to clean specks
b4 = bmesh.new(); b4.from_mesh(me2); b4.verts.ensure_lookup_table()
nbr = [[e.other_vert(x).index for e in x.link_edges] for x in b4.verts]; b4.free()
for _ in range(5):
    g2 = [Counter([g2[i]] * 2 + [g2[j] for j in nbr[i]]).most_common(1)[0][0] for i in range(len(g2))]
me2.attributes.new("grp", "FLOAT", "POINT").data.foreach_set("value", g2)
me2.attributes.new("fib", "FLOAT", "POINT").data.foreach_set("value", [v.co.x * 0.7 + v.co.z * 0.15 for v in me2.vertices])
me2.attributes.new("act", "FLOAT", "POINT").data.foreach_set("value", [0.0] * len(me2.vertices))
for n in J: sc.vertex_groups.new(name=n)
dt = sc.modifiers.new("dt", "DATA_TRANSFER"); dt.object = body
dt.use_vert_data = True; dt.data_types_verts = {"VGROUP_WEIGHTS"}; dt.vert_mapping = "POLYINTERP_NEAREST"
dt.layers_vgroup_select_src = "ALL"; dt.layers_vgroup_select_dst = "NAME"
bpy.ops.object.modifier_apply(modifier="dt")
mat = sm.materials[0]
bpy.data.objects.remove(body, do_unlink=True)

# ---- realistic hands and feet from a MakeHuman body fitted to the joints
macro = TargetService.get_default_macro_info_dict()
macro.update(gender=1.0, age=0.55, muscle=0.9, weight=0.4, proportions=1.0, height=0.55)
macro["race"] = {"asian": 0.0, "caucasian": 1.0, "african": 0.0}
proxy = HumanService.create_human(macro_detail_dict=macro, feet_on_ground=True, scale=0.1)
prig = HumanService.add_builtin_rig(proxy, "game_engine", import_weights=True)
bpy.context.view_layer.objects.active = proxy
bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
k = J["head"][1].z / (prig.matrix_world @ prig.data.bones["head"].tail_local).z
prig.scale = (k, k, k); bpy.context.view_layer.update(); inv = 1.0 / k
b = Body(prig); b.hips(J["pelvis"][0] * inv)
for s in "lr":
    b.foot(s, J[f"calf_{s}"][1] * inv, knee=J[f"calf_{s}"][0] * inv + Vector((0, -0.6, 0)))
    b.hand(s, J[f"lowerarm_{s}"][1] * inv, elbow=J[f"lowerarm_{s}"][0] * inv + Vector((0, 0.6, 0)), up=(J[f"hand_{s}"][1] - J[f"hand_{s}"][0]))
    b.curl(s, 8)
bpy.context.view_layer.update()
bpy.ops.object.select_all(action="DESELECT"); proxy.select_set(True); bpy.context.view_layer.objects.active = proxy
for m in list(proxy.modifiers):
    if m.type == "ARMATURE": bpy.ops.object.modifier_apply(modifier=m.name)
    else: proxy.modifiers.remove(m)
mw = proxy.matrix_world.copy(); proxy.parent = None; proxy.matrix_world = mw
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
names = {g.index: g.name for g in proxy.vertex_groups}
FING = ("thumb", "index", "middle", "ring", "pinky")
for v in proxy.data.vertices:
    add = {"l": 0.0, "r": 0.0}
    for g in v.groups:
        n = names[g.group]
        if n.split("_")[0] in FING: add[n[-1]] += g.weight
    for s in "lr":
        if add[s] > 0: proxy.vertex_groups[f"hand_{s}"].add([v.index], min(1.0, add[s]), "ADD")
gi = {g.name: g.index for g in proxy.vertex_groups}
b5 = bmesh.new(); b5.from_mesh(proxy.data); dl = b5.verts.layers.deform.active
helper = [gi.get("HelperGeometry", -9), gi.get("JointCubes", -9)]
def keepv(v):
    if any(h in v[dl] and v[dl][h] > 0.01 for h in helper): return False
    s = "l" if v.co.x > 0 else "r"; a, bb = elbow[s], wrist[s]; dd = bb - a
    t = (v.co - a).dot(dd) / dd.length_squared
    hand = abs(v.co.x) > 0.17 and t > 0.86
    foot = v.co.z < ankle_z + 0.06
    return hand or foot
bmesh.ops.delete(b5, geom=[v for v in b5.verts if not keepv(v)], context="VERTS"); b5.to_mesh(proxy.data); b5.free()
for g in list(proxy.vertex_groups):
    if g.name not in J: proxy.vertex_groups.remove(g)
bpy.data.objects.remove(prig, do_unlink=True)
print("HANDS+FEET verts", len(proxy.data.vertices))

# head piece and hands/feet: attributes as solid white, weights kept, smooth shading
for o in (proxy, head):
    m = o.data
    for a in [a.name for a in m.attributes if a.name in ("grp", "fib", "act")]: m.attributes.remove(m.attributes[a])
    m.attributes.new("grp", "FLOAT", "POINT").data.foreach_set("value", [-1.0] * len(m.vertices))
    m.attributes.new("fib", "FLOAT", "POINT").data.foreach_set("value", [0.0] * len(m.vertices))
    m.attributes.new("act", "FLOAT", "POINT").data.foreach_set("value", [0.0] * len(m.vertices))
    for p in m.polygons: p.use_smooth = True
    for mo in list(o.modifiers): o.modifiers.remove(mo)
    o.parent = None
    sub = o.modifiers.new("sub", "SUBSURF"); sub.levels = 1
    bpy.ops.object.select_all(action="DESELECT"); o.select_set(True); bpy.context.view_layer.objects.active = o
    bpy.ops.object.modifier_apply(modifier="sub")
bpy.ops.object.select_all(action="DESELECT")
for o in (sc, proxy, head): o.select_set(True)
bpy.context.view_layer.objects.active = sc; bpy.ops.object.join()
sc.name = "body"; sc.data.materials.clear(); sc.data.materials.append(mat)
bpy.ops.object.vertex_group_normalize_all(lock_active=False)
sc["groups"] = GROUPS
hip_z = J["thigh_l"][0].z
def ssf(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)
sh = [ssf(hip_z - 0.20, hip_z - 0.18, v.co.z) * (1 - ssf(hip_z + 0.075, hip_z + 0.09, v.co.z)) * (1 - ssf(0.20, 0.23, abs(v.co.x))) for v in sc.data.vertices]
sc.data.attributes.new("shorts", "FLOAT", "POINT").data.foreach_set("value", sh)
nt = mat.node_tree; N, L = nt.nodes, nt.links
bsdf = N["Principled BSDF"]; src_link = bsdf.inputs["Base Color"].links[0]; src = src_link.from_socket
sa = N.new("ShaderNodeAttribute"); sa.attribute_name = "shorts"
sr = N.new("ShaderNodeMapRange"); sr.inputs["From Min"].default_value = 0.45; sr.inputs["From Max"].default_value = 0.55
L.new(sa.outputs["Fac"], sr.inputs["Value"])
mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"; L.new(sr.outputs["Result"], mx.inputs["Factor"]); L.new(src, mx.inputs["A"]); mx.inputs["B"].default_value = (0.015, 0.015, 0.018, 1)
L.new(mx.outputs["Result"], bsdf.inputs["Base Color"])
a = sc.modifiers.new("Armature", "ARMATURE"); a.object = rig; sc.parent = rig
rig.data.pose_position = "POSE"
# sharper red edge and a softer stripe on the melted surface
for n in mat.node_tree.nodes:
    if n.type == "TEX_WAVE": n.inputs["Scale"].default_value = 220; n.inputs["Distortion"].default_value = 1.0
    if n.type == "VALTORGB" and n.color_ramp.elements[1].color[0] > 0.7:
        n.color_ramp.elements[0].color = (0.55, 0.06, 0.035, 1); n.color_ramp.elements[1].color = (0.80, 0.11, 0.06, 1)
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT, compress=True)
print("SAVED", OUT)
