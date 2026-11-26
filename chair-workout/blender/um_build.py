"""Turn the user's sculpted man (GLB, single static mesh) into the workout figure:
scale to 1.78 m, fit a game_engine-named rig to measured joints, copy MakeHuman weights (nearest skin),
transfer muscle groups from the fitted anatomy figure (ray projection), apply the white/red/black material.
blender -b --disable-autoexec --python um_build.py -- <model.glb> <za_sculpt3.blend> <out.blend>"""
import bpy, bmesh, sys
from collections import Counter
from pathlib import Path
from mathutils import Vector, bvhtree
HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from rigkit import Body
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService
GLB, ZA, OUT = sys.argv[sys.argv.index("--") + 1:][:3]

for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
scene = bpy.context.scene
bpy.ops.import_scene.gltf(filepath=GLB)
body = [o for o in bpy.data.objects if o.type == "MESH"][0]
mw = body.matrix_world.copy(); body.parent = None; body.matrix_world = mw
bpy.ops.object.select_all(action="DESELECT"); body.select_set(True); bpy.context.view_layer.objects.active = body
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
for o in list(bpy.data.objects):
    if o != body: bpy.data.objects.remove(o, do_unlink=True)
me = body.data; body.name = "body"
zs = [v.co.z for v in me.vertices]; zmin, H = min(zs), max(zs) - min(zs); s = 1.78 / H
xc = sum(v.co.x for v in me.vertices if v.co.z > zmin + 0.5 * H) / max(1, sum(1 for v in me.vertices if v.co.z > zmin + 0.5 * H))
me.transform(__import__("mathutils").Matrix.Translation((-xc, 0, -zmin)))
me.transform(__import__("mathutils").Matrix.Scale(s, 4))
bpy.ops.object.shade_smooth()
# merge split edges so it deforms as one skin
bm = bmesh.new(); bm.from_mesh(me); bmesh.ops.remove_doubles(bm, verts=bm.verts, dist=0.0004)
bmesh.ops.recalc_face_normals(bm, faces=bm.faces); bm.to_mesh(me); bm.free()
print("BODY verts", len(me.vertices), "scale", round(s, 3))

# ---- rig at the measured joints (left side; right mirrored)
J = {"pelvis": ((0, 0.05, 0.95), (0, 0.05, 1.04)), "spine_01": ((0, 0.05, 1.04), (0, 0.05, 1.14)),
     "spine_02": ((0, 0.05, 1.14), (0, 0.06, 1.24)), "spine_03": ((0, 0.06, 1.24), (0, 0.06, 1.47)),
     "neck_01": ((0, 0.06, 1.47), (0, 0.04, 1.57)), "head": ((0, 0.04, 1.57), (0, 0.03, 1.78)),
     "clavicle_l": ((0.02, 0.0, 1.44), (0.185, 0.06, 1.43)), "upperarm_l": ((0.20, 0.06, 1.40), (0.243, 0.065, 1.10)),
     "lowerarm_l": ((0.243, 0.065, 1.10), (0.265, 0.01, 0.86)), "hand_l": ((0.265, 0.01, 0.86), (0.255, -0.01, 0.74)),
     "thigh_l": ((0.095, 0.05, 0.88), (0.105, 0.06, 0.48)), "calf_l": ((0.105, 0.06, 0.48), (0.122, 0.075, 0.085)),
     "foot_l": ((0.122, 0.075, 0.085), (0.13, -0.06, 0.025)), "ball_l": ((0.13, -0.06, 0.025), (0.135, -0.135, 0.02))}
PARENT = {"spine_01": "pelvis", "spine_02": "spine_01", "spine_03": "spine_02", "neck_01": "spine_03", "head": "neck_01",
          "clavicle_l": "spine_03", "upperarm_l": "clavicle_l", "lowerarm_l": "upperarm_l", "hand_l": "lowerarm_l",
          "thigh_l": "pelvis", "calf_l": "thigh_l", "foot_l": "calf_l", "ball_l": "foot_l"}
for n in list(J):
    if n.endswith("_l"):
        r = n[:-2] + "_r"; (h, t) = J[n]; J[r] = ((-h[0], h[1], h[2]), (-t[0], t[1], t[2]))
        p = PARENT[n]; PARENT[r] = p[:-2] + "_r" if p.endswith("_l") else p
ad = bpy.data.armatures.new("rig"); rig = bpy.data.objects.new("rig", ad); scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode="EDIT")
for n, (h, t) in J.items():
    b = ad.edit_bones.new(n); b.head = h; b.tail = t; b.roll = 0.0
for n, p in PARENT.items():
    ad.edit_bones[n].parent = ad.edit_bones[p]
    if (Vector(ad.edit_bones[n].head) - Vector(ad.edit_bones[p].tail)).length < 1e-4: ad.edit_bones[n].use_connect = True
bpy.ops.object.mode_set(mode="OBJECT")
J = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in ad.bones}

def fit_mpfb():
    macro = TargetService.get_default_macro_info_dict()
    macro.update(gender=1.0, age=0.5, muscle=1.0, weight=0.5, proportions=1.0, height=0.6)
    macro["race"] = {"asian": 0.0, "caucasian": 1.0, "african": 0.0}
    px = HumanService.create_human(macro_detail_dict=macro, feet_on_ground=True, scale=0.1)
    pr = HumanService.add_builtin_rig(px, "game_engine", import_weights=True)
    bpy.context.view_layer.objects.active = px; bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
    k = J["head"][1].z / (pr.matrix_world @ pr.data.bones["head"].tail_local).z
    pr.scale = (k, k, k); bpy.context.view_layer.update(); inv = 1.0 / k
    b = Body(pr); b.hips(J["pelvis"][0] * inv)
    for sd in "lr":
        b.foot(sd, J[f"calf_{sd}"][1] * inv, knee=J[f"calf_{sd}"][0] * inv + Vector((0, -0.6, 0)))
        b.hand(sd, J[f"lowerarm_{sd}"][1] * inv, elbow=J[f"lowerarm_{sd}"][0] * inv + Vector((0, 0.6, 0)), up=(J[f"hand_{sd}"][1] - J[f"hand_{sd}"][0]))
    bpy.context.view_layer.update()
    bpy.ops.object.select_all(action="DESELECT"); px.select_set(True); bpy.context.view_layer.objects.active = px
    for m in list(px.modifiers):
        if m.type == "ARMATURE": bpy.ops.object.modifier_apply(modifier=m.name)
        else: px.modifiers.remove(m)
    w = px.matrix_world.copy(); px.parent = None; px.matrix_world = w
    bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
    names = {g.index: g.name for g in px.vertex_groups}
    for v in px.data.vertices:
        add = {"l": 0.0, "r": 0.0}
        for g in v.groups:
            n = names[g.group]
            if n.split("_")[0] in ("thumb", "index", "middle", "ring", "pinky"): add[n[-1]] += g.weight
        for sd in "lr":
            if add[sd] > 0: px.vertex_groups[f"hand_{sd}"].add([v.index], min(1.0, add[sd]), "ADD")
    gi = {g.name: g.index for g in px.vertex_groups}
    b2 = bmesh.new(); b2.from_mesh(px.data); dl = b2.verts.layers.deform.active
    hl = [gi.get("HelperGeometry", -9), gi.get("JointCubes", -9)]
    bmesh.ops.delete(b2, geom=[v for v in b2.verts if any(h in v[dl] and v[dl][h] > 0.01 for h in hl)], context="VERTS"); b2.to_mesh(px.data); b2.free()
    for g in list(px.vertex_groups):
        if g.name not in J: px.vertex_groups.remove(g)
    bpy.data.objects.remove(pr, do_unlink=True)
    return px
proxy = fit_mpfb()
for n in J: body.vertex_groups.new(name=n)
bpy.ops.object.select_all(action="DESELECT"); body.select_set(True); bpy.context.view_layer.objects.active = body
dt = body.modifiers.new("dt", "DATA_TRANSFER"); dt.object = proxy
dt.use_vert_data = True; dt.data_types_verts = {"VGROUP_WEIGHTS"}; dt.vert_mapping = "POLYINTERP_NEAREST"
dt.layers_vgroup_select_src = "ALL"; dt.layers_vgroup_select_dst = "NAME"
bpy.ops.object.modifier_apply(modifier="dt")
# side clean
gname = {g.index: g.name for g in body.vertex_groups}
for v in me.vertices:
    if abs(v.co.x) < 0.02: continue
    wrong = "_r" if v.co.x > 0 else "_l"
    for g in [g for g in v.groups if gname[g.group].endswith(wrong)]: body.vertex_groups[gname[g.group]].remove([v.index])
bpy.ops.object.vertex_group_normalize_all(lock_active=False)
bpy.data.objects.remove(proxy, do_unlink=True)

# ---- muscle groups from the anatomy figure, fitted onto this body
with bpy.data.libraries.load(ZA) as (src, dst):
    dst.objects = ["body", "rig"]
za_body, za_rig = dst.objects
za_body.name, za_rig.name = "za_body", "za_rig"
for o in (za_body, za_rig): scene.collection.objects.link(o)
GROUPS = dict(za_body["groups"]); MAT = za_body.data.materials[0]
ZJ = {b.name: (b.head_local.copy(), b.tail_local.copy()) for b in za_rig.data.bones}
k = J["head"][1].z / ZJ["head"][1].z
za_rig.scale = (k * 1.08, k * 1.06, k); bpy.context.view_layer.update()   # this body is broader than the atlas man
inv = Vector((1 / (k * 1.08), 1 / (k * 1.06), 1 / k))
def lc(p): return Vector((p.x * inv.x, p.y * inv.y, p.z * inv.z))
zb = Body(za_rig); zb.hips(lc(J["pelvis"][0])); zb.spine()
for sd in "lr":
    zb.foot(sd, lc(J[f"calf_{sd}"][1]), knee=lc(J[f"calf_{sd}"][0]) + Vector((0, -0.6, 0)))
    zb.hand(sd, lc(J[f"lowerarm_{sd}"][1]), elbow=lc(J[f"lowerarm_{sd}"][0]) + Vector((0, 0.6, 0)))
bpy.context.view_layer.update()
dg = bpy.context.evaluated_depsgraph_get(); ev = za_body.evaluated_get(dg); zm = ev.to_mesh()
ZP = [ev.matrix_world @ v.co for v in zm.vertices]
zg = [0.0] * len(zm.vertices); zm.attributes["grp"].data.foreach_get("value", zg)
zpolys = [tuple(p.vertices) for p in zm.polygons]
ev.to_mesh_clear()
tree = bvhtree.BVHTree.FromPolygons(ZP, zpolys)
g2 = []
for v in me.vertices:
    best = None
    for d in (-v.normal, v.normal):
        hit = tree.ray_cast(v.co + d * -0.001, d, 0.08)
        if hit[0] is not None and (best is None or hit[3] < best[3]): best = hit
    if best is None: best = tree.find_nearest(v.co, 0.1)
    if best is None or best[2] is None: g2.append(0.0); continue
    vs = zpolys[best[2]]
    g2.append(Counter(zg[i] for i in vs).most_common(1)[0][0])
b4 = bmesh.new(); b4.from_mesh(me); b4.verts.ensure_lookup_table()
nbr = [[e.other_vert(x).index for e in x.link_edges] for x in b4.verts]; b4.free()
for _ in range(9):
    g2 = [Counter([g2[i]] * 2 + [g2[j] for j in nbr[i]]).most_common(1)[0][0] for i in range(len(g2))]
# hands, feet, head, hair stay plain white
for i, v in enumerate(me.vertices):
    if v.co.z > 1.56 or v.co.z < 0.10 or (abs(v.co.x) > 0.22 and v.co.z < 0.87): g2[i] = -1.0
ABS = float(GROUPS["abs"]); OBL = float(GROUPS["obliques"])
for i, v in enumerate(me.vertices):
    if abs(v.co.x) < 0.085 and 1.0 < v.co.z < 1.30 and v.co.y < 0.0 and g2[i] in (0.0, OBL): g2[i] = ABS
me.attributes.new("grp", "FLOAT", "POINT").data.foreach_set("value", g2)
me.attributes.new("fib", "FLOAT", "POINT").data.foreach_set("value", [v.co.x * 0.7 + v.co.z * 0.15 for v in me.vertices])
me.attributes.new("act", "FLOAT", "POINT").data.foreach_set("value", [0.0] * len(me.vertices))
def ssf(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)
gidx = {g.name: g.index for g in body.vertex_groups}
hipb = {gidx[n] for n in ("pelvis", "thigh_l", "thigh_r", "spine_01")}
def hipw(v): return sum(g.weight for g in v.groups if g.group in hipb)
sh = [ssf(0.70, 0.72, v.co.z) * (1 - ssf(0.975, 0.99, v.co.z)) * ssf(0.5, 0.8, hipw(v)) for v in me.vertices]
b6 = bmesh.new(); b6.from_mesh(me); b6.verts.ensure_lookup_table()
for _ in range(2):
    sh = [(sh[x.index] * 2 + sum(sh[e.other_vert(x).index] for e in x.link_edges)) / (2 + len(x.link_edges)) for x in b6.verts]
b6.free()
me.attributes.new("shorts", "FLOAT", "POINT").data.foreach_set("value", sh)
me.materials.clear(); me.materials.append(MAT)
body["groups"] = GROUPS
bpy.data.objects.remove(za_body, do_unlink=True); bpy.data.objects.remove(za_rig, do_unlink=True)
a = body.modifiers.new("Armature", "ARMATURE"); a.object = rig; body.parent = rig
bpy.ops.outliner.orphans_purge(do_recursive=True)
bpy.ops.wm.save_as_mainfile(filepath=OUT, compress=True)
print("SAVED", OUT, "groups found", Counter(g2).most_common(8))
