"""Polish v3: one seamless sculpted surface. The realistic head, hands and feet get their openings closed, then
EVERYTHING (muscles + head + hands + feet) is voxel-melted together, so there are no seams. Weights, muscle groups,
fibres and black shorts are carried onto the new surface.
blender -b --disable-autoexec za_figure.blend --python za_polish3.py -- <out.blend>"""
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
VOXEL = 0.0017
scene = bpy.context.scene
body, rig = bpy.data.objects["body"], bpy.data.objects["rig"]
J = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in rig.data.bones}
for pb in rig.pose.bones: pb.location = (0, 0, 0); pb.rotation_quaternion = (1, 0, 0, 0)
rig.data.pose_position = "REST"
for m in list(body.modifiers): body.modifiers.remove(m)
body.parent = None
GROUPS = dict(body["groups"]); MAT = body.data.materials[0]
wrist = {s: J[f"lowerarm_{s}"][1] for s in "lr"}; elbow = {s: J[f"lowerarm_{s}"][0] for s in "lr"}
ankle_z = J["calf_l"][1].z; hip_z = J["thigh_l"][0].z

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
def tpar(co):
    s = "l" if co.x > 0 else "r"; a, b = elbow[s], wrist[s]; d = b - a
    return (co - a).dot(d) / d.length_squared
def keep_only(o, keep):
    b2 = bmesh.new(); b2.from_mesh(o.data); b2.verts.ensure_lookup_table()
    bmesh.ops.delete(b2, geom=[v for v in b2.verts if not keep(v)], context="VERTS"); b2.to_mesh(o.data); b2.free()
def close_holes(o):
    b2 = bmesh.new(); b2.from_mesh(o.data)
    bmesh.ops.holes_fill(b2, edges=[e for e in b2.edges if e.is_boundary], sides=0)
    b2.to_mesh(o.data); b2.free()

# ---- head piece out, atlas hands/feet dropped
bm = bmesh.new(); bm.from_mesh(body.data); glay = bm.faces.layers.int.get("grp")
head_v, drop_v = set(), set()
for isl in islands(bm):
    c = sum((x.co for x in isl), Vector()) / len(isl)
    fs = {f for x in isl for f in x.link_faces}
    if c.z > 1.44 and all(f[glay] == -1 for f in fs): head_v |= {x.index for x in isl}
    elif c.z < ankle_z + 0.02 or (abs(c.x) > 0.2 and tpar(c) > 0.93): drop_v |= {x.index for x in isl}
bm.free()
head = body.copy(); head.data = body.data.copy(); scene.collection.objects.link(head); head.name = "headpiece"
keep_only(head, lambda v: v.index in head_v)
keep_only(body, lambda v: v.index not in head_v and v.index not in drop_v and not (abs(v.co.x) > 0.19 and tpar(v.co) > 0.95) and v.co.z > ankle_z + 0.015)

# ---- realistic hands and feet
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
helper = [gi.get("HelperGeometry", -9), gi.get("JointCubes", -9)]
def keepv(v):
    if any(g.group in helper and g.weight > 0.01 for g in v.groups): return False
    return (abs(v.co.x) > 0.17 and tpar(v.co) > 0.88) or v.co.z < ankle_z + 0.03
keepset = {v.index for v in proxy.data.vertices if keepv(v)}
keep_only(proxy, lambda bv: bv.index in keepset)
for g in list(proxy.vertex_groups):
    if g.name not in J: proxy.vertex_groups.remove(g)
bpy.data.objects.remove(prig, do_unlink=True)
close_holes(proxy); close_holes(head)

# ---- one source mesh with weights and groups
for o in (proxy, head):
    m = o.data
    if "grp" in m.attributes: m.attributes.remove(m.attributes["grp"])
    m.attributes.new("grp", "INT", "FACE").data.foreach_set("value", [-1] * len(m.polygons))
bpy.ops.object.select_all(action="DESELECT")
for o in (body, head, proxy): o.select_set(True)
bpy.context.view_layer.objects.active = body; bpy.ops.object.join()
src = body; src.name = "src"; sm = src.data
gface = [0] * len(sm.polygons); sm.attributes["grp"].data.foreach_get("value", gface)
vg = [[] for _ in sm.vertices]
for p, g in zip(sm.polygons, gface):
    for i in p.vertices: vg[i].append(g)
vgrp = [max(set(l), key=l.count) if l else 0 for l in vg]
kd = kdtree.KDTree(len(sm.vertices))
for v in sm.vertices: kd.insert(v.co, v.index)
kd.balance()

# ---- melt everything
sc = bpy.data.objects.new("body", sm.copy()); scene.collection.objects.link(sc)
for g in list(sc.vertex_groups): sc.vertex_groups.remove(g)
for a in [a.name for a in sc.data.attributes if a.name in ("grp", "fib", "act")]: sc.data.attributes.remove(sc.data.attributes[a])
bpy.ops.object.select_all(action="DESELECT"); sc.select_set(True); bpy.context.view_layer.objects.active = sc
r = sc.modifiers.new("remesh", "REMESH"); r.mode = "VOXEL"; r.voxel_size = VOXEL; r.adaptivity = 0.0
bpy.ops.object.modifier_apply(modifier="remesh")
s2 = sc.modifiers.new("smooth", "SMOOTH"); s2.factor = 0.5; s2.iterations = 3; bpy.ops.object.modifier_apply(modifier="smooth")
d = sc.modifiers.new("dec", "DECIMATE"); d.ratio = min(1.0, 480000 / len(sc.data.polygons)); bpy.ops.object.modifier_apply(modifier="dec")
for p in sc.data.polygons: p.use_smooth = True
print("SCULPT faces", len(sc.data.polygons))
me2 = sc.data
g2 = []
for v in me2.vertices:
    near = kd.find_n(v.co, 16)
    votes = Counter(vgrp[i] for _, i, _ in near if vgrp[i] != 0)
    g2.append(float(votes.most_common(1)[0][0]) if votes else 0.0)
b4 = bmesh.new(); b4.from_mesh(me2); b4.verts.ensure_lookup_table()
nbr = [[e.other_vert(x).index for e in x.link_edges] for x in b4.verts]; b4.free()
for _ in range(5):
    g2 = [Counter([g2[i]] * 2 + [g2[j] for j in nbr[i]]).most_common(1)[0][0] for i in range(len(g2))]
ABS, OBL = float(GROUPS["abs"]), float(GROUPS["obliques"])
for i, v in enumerate(me2.vertices):   # the six-pack lies under the oblique sheet in this atlas: claim it by position
    if abs(v.co.x) < 0.075 and 0.975 < v.co.z < 1.27 and v.co.y < -0.02 and g2[i] in (0.0, OBL):
        g2[i] = ABS
def ssf(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)
sh = [ssf(hip_z - 0.20, hip_z - 0.18, v.co.z) * (1 - ssf(hip_z + 0.075, hip_z + 0.09, v.co.z)) * (1 - ssf(0.20, 0.23, abs(v.co.x))) for v in me2.vertices]
front = [s for v, s in zip(me2.vertices, sh) if v.co.y < -0.05 and 0.72 < v.co.z < 0.85]
print("SHORTS front mean", round(sum(front) / max(1, len(front)), 2), "n", len(front))
me2.attributes.new("grp", "FLOAT", "POINT").data.foreach_set("value", g2)
me2.attributes.new("fib", "FLOAT", "POINT").data.foreach_set("value", [v.co.x * 0.7 + v.co.z * 0.15 for v in me2.vertices])
me2.attributes.new("act", "FLOAT", "POINT").data.foreach_set("value", [0.0] * len(me2.vertices))
me2.attributes.new("shorts", "FLOAT", "POINT").data.foreach_set("value", sh)
for n in J: sc.vertex_groups.new(name=n)
dt = sc.modifiers.new("dt", "DATA_TRANSFER"); dt.object = src
dt.use_vert_data = True; dt.data_types_verts = {"VGROUP_WEIGHTS"}; dt.vert_mapping = "POLYINTERP_NEAREST"
dt.layers_vgroup_select_src = "ALL"; dt.layers_vgroup_select_dst = "NAME"
bpy.ops.object.modifier_apply(modifier="dt")
bpy.ops.object.vertex_group_normalize_all(lock_active=False)
bpy.data.objects.remove(src, do_unlink=True)

# ---- material: subtle fibres, deeper red, black shorts at the end of the colour chain
nt = MAT.node_tree; N, L = nt.nodes, nt.links
for n in list(N):
    if n.type == "ATTRIBUTE" and n.attribute_name == "shorts": N.remove(n)
for n in N:
    if n.type == "TEX_WAVE": n.inputs["Scale"].default_value = 220; n.inputs["Distortion"].default_value = 1.0
    if n.type == "VALTORGB" and n.color_ramp.elements[1].color[0] > 0.7:
        n.color_ramp.elements[0].color = (0.55, 0.06, 0.035, 1); n.color_ramp.elements[1].color = (0.80, 0.11, 0.06, 1)
bsdf = N["Principled BSDF"]; src_sock = bsdf.inputs["Base Color"].links[0].from_socket
sa = N.new("ShaderNodeAttribute"); sa.attribute_name = "shorts"
sr = N.new("ShaderNodeMapRange"); sr.inputs["From Min"].default_value = 0.45; sr.inputs["From Max"].default_value = 0.55
L.new(sa.outputs["Fac"], sr.inputs["Value"])
mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"
L.new(sr.outputs["Result"], mx.inputs["Factor"]); L.new(src_sock, mx.inputs["A"]); mx.inputs["B"].default_value = (0.015, 0.015, 0.018, 1)
L.new(mx.outputs["Result"], bsdf.inputs["Base Color"])
me2.materials.clear(); me2.materials.append(MAT)
sc["groups"] = GROUPS
a = sc.modifiers.new("Armature", "ARMATURE"); a.object = rig; sc.parent = rig
rig.data.pose_position = "POSE"
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT, compress=True)
print("SAVED", OUT)
