"""Builds the anatomy workout figure: muscular bald male in white clay with sculpted muscle definition, faceless
mannequin head, black shorts, and muscle groups stored as mesh attributes so any exercise lights its own muscles red.
Also builds the grey chair.   blender --background --python build_figure.py"""
import bpy, bmesh, math
from pathlib import Path
from mathutils import Vector
HERE = Path(__file__).resolve().parent
from bl_ext.blender_org.mpfb.services.humanservice import HumanService
from bl_ext.blender_org.mpfb.services.targetservice import TargetService

for o in list(bpy.data.objects):
    bpy.data.objects.remove(o, do_unlink=True)

macro = TargetService.get_default_macro_info_dict()
macro.update(gender=1.0, age=0.6, muscle=1.0, weight=0.38, proportions=1.0, height=0.55)
macro["race"] = {"asian": 0.0, "caucasian": 1.0, "african": 0.0}
body = HumanService.create_human(macro_detail_dict=macro, feet_on_ground=True, scale=0.1)
body.name = "body"
rig = HumanService.add_builtin_rig(body, "game_engine", import_weights=True)
rig.name = "rig"
for m in body.modifiers:
    if m.type == "SUBSURF": m.levels = 1; m.render_levels = 2
if not any(m.type == "SUBSURF" for m in body.modifiers):
    sub = body.modifiers.new("smooth", "SUBSURF"); sub.levels = 1; sub.render_levels = 2

# bake the MakeHuman shape into the mesh so positions and normals are the final rest body
bpy.context.view_layer.objects.active = body
bpy.ops.object.shape_key_remove(all=True, apply_mix=True)
me = body.data
gi = {g.name: g.index for g in body.vertex_groups}

def w(v, *names):
    s = 0.0
    for g in v.groups:
        for n in names:
            if g.group == gi.get(n): s += g.weight
    return min(s, 1.0)
def ss(a, b, x):
    t = max(0.0, min(1.0, (x - a) / (b - a))); return t * t * (3 - 2 * t)
def band(x, a, b, f=0.02):
    return ss(a - f, a + f, x) * (1 - ss(b - f, b + f, x))

# eye spheres stay visible (clay) so the smoothed face has no holes
eye = {v.index for v in me.vertices if w(v, "helper-l-eye", "helper-r-eye") > 0.5}
hg = body.vertex_groups.get("HelperGeometry")
if hg: hg.remove(list(eye))

bone = {bb.name: (rig.matrix_world @ bb.head_local, rig.matrix_world @ bb.tail_local) for bb in rig.data.bones}
hip_z = bone["thigh_l"][0].z; knee_z = bone["calf_l"][0].z
sh = bone["upperarm_l"][0]; neck_z = bone["neck_01"][0].z; head_c = bone["head"][0]
def along(p, name, side):
    a, b_ = bone[f"{name}_{side}"]; d = b_ - a
    t = max(0.0, min(1.0, (p - a).dot(d) / d.length_squared))
    r = p - (a + d * t)
    return t, (r.normalized() if r.length > 1e-6 else Vector((0, -1, 0)))

N = len(me.vertices)
import sys; sys.path.insert(0, str(HERE)); import bellies
G, height, fib = bellies.build(me, w, bone, ss, eye)
bm = bmesh.new(); bm.from_mesh(me); bm.verts.ensure_lookup_table()
nbr = [[e.other_vert(bv).index for e in bv.link_edges] for bv in bm.verts]; bm.free()
def blur(vals, it):
    for _ in range(it):
        vals[:] = [(vals[i] * 2 + sum(vals[j] for j in nbr[i])) / (2 + len(nbr[i])) for i in range(N)]
for k in G: blur(G[k], 2)
blur(height, 2)
for v in me.vertices:
    v.co += v.normal * height[v.index]
# nipples flattened (mannequin)
nip = [v.index for v in me.vertices if w(v, "nipple", "nippleTip") > 0.05]
ring = set(nip)
for _ in range(2): ring |= {j for i in list(ring) for j in nbr[i]}
pos = {i: me.vertices[i].co.copy() for i in ring}
for _ in range(40):
    pos = {i: sum((pos.get(j, me.vertices[j].co) for j in nbr[i]), Vector()) / len(nbr[i]) for i in ring}
for i in ring: me.vertices[i].co = pos[i]

# faceless mannequin head: press the face onto a smooth egg shape fitted to the skull
helper = {v.index for v in me.vertices if w(v, "HelperGeometry", "JointCubes") > 0.01} - eye
hv = [v for v in me.vertices if v.index not in helper and v.index not in eye and w(v, "head") > 0.7 and w(v, "ears") < 0.1]
cx, cy, cz = 0.0, -0.055, 1.685   # measured skull centre (height slices of this body)
rx, ryf, ryb, rzu, rzd = 0.082, 0.100, 0.102, 0.110, 0.115
print("HEAD", round(cy, 3), round(cz, 3), round(rx, 3), round(ryf, 3), round(rzu, 3))
for v in hv:
    d = v.co - Vector((cx, cy, cz))
    if d.y > -0.01: continue
    k = math.sqrt((d.x / rx) ** 2 + (d.y / (ryf if d.y < 0 else ryb)) ** 2 + (d.z / (rzu if d.z > 0 else rzd)) ** 2)
    target = Vector((cx, cy, cz)) + d / max(k, 1e-6)
    f = ss(0.15, 0.6, -d.y / ryf) * (1 - ss(-1.0, -1.25, d.z / rzd))
    v.co = v.co.lerp(target, f)
for i in eye: me.vertices[i].co = Vector((cx, cy, cz)) + (me.vertices[i].co - Vector((cx, cy, cz))) * 0.6
me.update()

for k, vals in G.items():
    a = me.attributes.new("m_" + k, "FLOAT", "POINT"); a.data.foreach_set("value", [min(1.0, x) for x in vals])
me.attributes.new("fib", "FLOAT", "POINT").data.foreach_set("value", fib)
me.attributes.new("active", "FLOAT", "POINT").data.foreach_set("value", [0.0] * N)
flat = []
for v in me.vertices: flat += [v.co.x, v.co.y, v.co.z]
me.attributes.new("rest", "FLOAT_VECTOR", "POINT").data.foreach_set("vector", flat)
sh_m = [ss(hip_z - 0.165, hip_z - 0.145, v.co.z) * (1 - ss(hip_z + 0.035, hip_z + 0.05, v.co.z)) * (1 - ss(0.2, 0.24, abs(v.co.x)))
        * (1 - w(v, "lowerarm_l", "lowerarm_r", "hand_l", "hand_r")) for v in me.vertices]
blur(sh_m, 2)
me.attributes.new("shorts", "FLOAT", "POINT").data.foreach_set("value", sh_m)
print("LEVELS", dict(H=round(max(v.co.z for v in me.vertices), 3), hip=round(hip_z, 3), knee=round(knee_z, 3), shoulder=round(sh.z, 3)))

# ---------- materials ----------
def clay():
    m = bpy.data.materials.new("clay"); m.use_nodes = True
    nt = m.node_tree; Nn, L = nt.nodes, nt.links
    bsdf = Nn["Principled BSDF"]
    if "Subsurface Weight" in bsdf.inputs:
        bsdf.inputs["Subsurface Weight"].default_value = 0.06
        bsdf.inputs["Subsurface Radius"].default_value = (0.3, 0.15, 0.1)
    fibat = Nn.new("ShaderNodeAttribute"); fibat.attribute_name = "fib"
    rest = Nn.new("ShaderNodeCombineXYZ"); L.new(fibat.outputs["Fac"], rest.inputs["X"])
    wave = Nn.new("ShaderNodeTexWave"); wave.wave_profile = "SIN"; wave.bands_direction = "X"
    wave.inputs["Scale"].default_value = 160; wave.inputs["Distortion"].default_value = 0.6; wave.inputs["Detail"].default_value = 2
    L.new(rest.outputs["Vector"], wave.inputs["Vector"])
    fib = Nn.new("ShaderNodeValToRGB")
    fib.color_ramp.elements[0].color = (0.30, 0.02, 0.015, 1); fib.color_ramp.elements[1].color = (0.80, 0.08, 0.04, 1)
    fib.color_ramp.elements[0].position = 0.2; fib.color_ramp.elements[1].position = 0.75
    L.new(wave.outputs["Fac"], fib.inputs["Fac"])
    at = Nn.new("ShaderNodeAttribute"); at.attribute_name = "active"
    mr = Nn.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0.3; mr.inputs["From Max"].default_value = 0.6
    L.new(at.outputs["Fac"], mr.inputs["Value"])
    mix = Nn.new("ShaderNodeMix"); mix.data_type = "RGBA"
    L.new(mr.outputs["Result"], mix.inputs["Factor"]); mix.inputs["A"].default_value = (0.50, 0.51, 0.53, 1)
    L.new(fib.outputs["Color"], mix.inputs["B"])
    shorts = Nn.new("ShaderNodeAttribute"); shorts.attribute_name = "shorts"
    sr = Nn.new("ShaderNodeMapRange"); sr.inputs["From Min"].default_value = 0.45; sr.inputs["From Max"].default_value = 0.55
    L.new(shorts.outputs["Fac"], sr.inputs["Value"])
    mix2 = Nn.new("ShaderNodeMix"); mix2.data_type = "RGBA"
    L.new(sr.outputs["Result"], mix2.inputs["Factor"]); L.new(mix.outputs["Result"], mix2.inputs["A"]); mix2.inputs["B"].default_value = (0.02, 0.02, 0.022, 1)
    ao = Nn.new("ShaderNodeAmbientOcclusion"); ao.inputs["Distance"].default_value = 0.05; ao.samples = 32
    gm = Nn.new("ShaderNodeMapRange"); gm.inputs["To Min"].default_value = 0.2
    L.new(ao.outputs["AO"], gm.inputs["Value"])
    comb = Nn.new("ShaderNodeCombineColor")
    for k in ("Red", "Green", "Blue"): L.new(gm.outputs["Result"], comb.inputs[k])
    mul = Nn.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
    L.new(mix2.outputs["Result"], mul.inputs["A"]); L.new(comb.outputs["Color"], mul.inputs["B"])
    L.new(mul.outputs["Result"], bsdf.inputs["Base Color"])
    rough = Nn.new("ShaderNodeMapRange"); rough.inputs["To Min"].default_value = 0.5; rough.inputs["To Max"].default_value = 0.85
    L.new(sr.outputs["Result"], rough.inputs["Value"]); L.new(rough.outputs["Result"], bsdf.inputs["Roughness"])
    return m

def plain(name, color, rough=0.7, metal=0.0):
    m = bpy.data.materials.new(name); m.use_nodes = True
    b = m.node_tree.nodes["Principled BSDF"]
    b.inputs["Base Color"].default_value = (*color, 1); b.inputs["Roughness"].default_value = rough; b.inputs["Metallic"].default_value = metal
    return m

me.materials.clear()
me.materials.append(clay())

# ---------- chair (simple grey metal frame, black seat, slatted back) ----------
grey = plain("chair_frame", (0.52, 0.54, 0.56), 0.35, 0.6)
black = plain("chair_seat", (0.03, 0.03, 0.035), 0.55)
def box(name, loc, size, m, bevel=0.006):
    bpy.ops.mesh.primitive_cube_add(location=loc); o = bpy.context.object; o.name = name
    o.scale = (size[0] / 2, size[1] / 2, size[2] / 2); bpy.ops.object.transform_apply(scale=True)
    if bevel:
        b = o.modifiers.new("bevel", "BEVEL"); b.width = bevel; b.segments = 3
    o.data.materials.append(m); return o
SEAT = 0.46
parts = [box("seat", (0, 0, SEAT), (0.46, 0.44, 0.045), black, 0.012)]
for x in (-0.205, 0.205):
    for y in (-0.19, 0.19):
        parts.append(box("leg", (x, y, (SEAT - 0.02) / 2), (0.024, 0.024, SEAT - 0.02), grey))
    parts.append(box("post", (x, 0.205, SEAT + 0.24), (0.024, 0.024, 0.48), grey))
    parts.append(box("stretcher", (x, 0, 0.12), (0.018, 0.38, 0.018), grey))
parts.append(box("rail_top", (0, 0.205, SEAT + 0.47), (0.43, 0.026, 0.05), grey))
parts.append(box("rail_mid", (0, 0.205, SEAT + 0.12), (0.43, 0.022, 0.03), grey))
for x in (-0.09, 0, 0.09):
    parts.append(box("slat", (x, 0.205, SEAT + 0.295), (0.03, 0.016, 0.32), grey))
bpy.ops.object.select_all(action="DESELECT")
for p in parts: p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]; bpy.ops.object.join()
bpy.context.object.name = "chair"

bpy.ops.wm.save_as_mainfile(filepath=str(HERE / "figure.blend"))
print("SAVED")
