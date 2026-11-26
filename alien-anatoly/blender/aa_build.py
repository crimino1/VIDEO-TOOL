"""Build the Alien Anatoly toon figure from the rigged muscle man.
blender -b chair-workout/blender/um_auto.blend --python aa_build.py -- <out.blend>
Green cel shading, black shorts, black outline (inverted hull), faceless egg head."""
import bpy, sys, math
from mathutils import Vector
OUT = sys.argv[sys.argv.index("--") + 1]
body = bpy.data.objects["body"]; me = body.data

# --- faceless head: blend head verts onto an egg (ellipsoid) so nose/lips/eyes/ears vanish
Z0, Z1 = 1.47, 1.565                       # blend band: 0 at Z0 (neck) -> 1 at Z1
head = [v for v in me.vertices if v.co.z > 1.55 and abs(v.co.x) < 0.13]
xs = [v.co.x for v in head]; ys = [v.co.y for v in head]; zs = [v.co.z for v in head]
top = max(zs)
cy = max(ys) - 0.105                        # size depth from the back of the skull, not the nose
c = Vector((0.0, cy, top - 0.125))
r = Vector((0.083, 0.102, 0.128))           # half width, half depth, half height (m)
print("HEAD", min(xs), max(xs), min(ys), max(ys), top, "center", c)
for v in me.vertices:
    z = v.co.z
    if z < Z0 or abs(v.co.x) > 0.16: continue
    w = min(1.0, (z - Z0) / (Z1 - Z0)); w = w * w * (3 - 2 * w)
    d = v.co - c
    if d.length < 1e-6: continue
    k = 1.0 / math.sqrt((d.x / r.x) ** 2 + (d.y / r.y) ** 2 + (d.z / r.z) ** 2)
    v.co = v.co.lerp(c + d * k, w)
# relax the head band a few times so the projected egg has no folds
import bmesh
bm = bmesh.new(); bm.from_mesh(me)
hv = [v for v in bm.verts if v.co.z > Z0 + 0.03 and abs(v.co.x) < 0.16]
for _ in range(6):
    bmesh.ops.smooth_vert(bm, verts=hv, factor=0.5, use_axis_x=True, use_axis_y=True, use_axis_z=True)
bm.to_mesh(me); bm.free()

# --- clean shorts: straight hem at mid-thigh, waistband at the hips, slightly loose
HEM, WAIST = 0.70, 0.985
arm = {body.vertex_groups[n].index for n in ("upperarm_l", "lowerarm_l", "hand_l", "upperarm_r", "lowerarm_r", "hand_r")}
sh = [0.0] * len(me.vertices)
for v in me.vertices:
    if HEM < v.co.z < WAIST and sum(g.weight for g in v.groups if g.group in arm) < 0.3:
        sh[v.index] = 1.0
        v.co += v.normal * 0.006
me.attributes["shorts"].data.foreach_set("value", sh)
me.update()

# --- toon material: diffuse -> shader-to-RGB -> 4 flat bands, times green (or black on the shorts)
GREEN = (0.039, 0.55, 0.035, 1)
SHORTS = (0.012, 0.012, 0.014, 1)
m = bpy.data.materials.new("aa_toon"); m.use_nodes = True
nt = m.node_tree; N = nt.nodes; L = nt.links; N.clear()
out = N.new("ShaderNodeOutputMaterial")
dif = N.new("ShaderNodeBsdfDiffuse"); dif.inputs["Color"].default_value = (1, 1, 1, 1)
s2r = N.new("ShaderNodeShaderToRGB"); L.new(dif.outputs[0], s2r.inputs[0])
ramp = N.new("ShaderNodeValToRGB"); ramp.color_ramp.interpolation = "EASE"   # soft airbrushed bands like the user's drawing
e = ramp.color_ramp.elements
e[0].position, e[0].color = 0.05, (0.42, 0.42, 0.42, 1)
e[1].position, e[1].color = 0.30, (0.66, 0.66, 0.66, 1)
e.new(0.60).color = (1.0, 1.0, 1.0, 1)
e.new(0.95).color = (1.12, 1.12, 1.12, 1)
L.new(s2r.outputs["Color"], ramp.inputs["Fac"])
att = N.new("ShaderNodeAttribute"); att.attribute_name = "shorts"
mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0.45; mr.inputs["From Max"].default_value = 0.55
L.new(att.outputs["Fac"], mr.inputs["Value"])
mix = N.new("ShaderNodeMix"); mix.data_type = "RGBA"
mix.inputs["A"].default_value = GREEN; mix.inputs["B"].default_value = SHORTS
L.new(mr.outputs["Result"], mix.inputs["Factor"])
mul = N.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
L.new(mix.outputs["Result"], mul.inputs["A"]); L.new(ramp.outputs["Color"], mul.inputs["B"])
em = N.new("ShaderNodeEmission"); L.new(mul.outputs["Result"], em.inputs["Color"])
L.new(em.outputs[0], out.inputs["Surface"])

ol = bpy.data.materials.new("aa_outline"); ol.use_nodes = True; ol.use_backface_culling = True
on = ol.node_tree.nodes; on.clear()
o2 = on.new("ShaderNodeOutputMaterial"); oe = on.new("ShaderNodeEmission"); oe.inputs["Color"].default_value = (0, 0, 0, 1)
ol.node_tree.links.new(oe.outputs[0], o2.inputs["Surface"])
me.materials.clear(); me.materials.append(m); me.materials.append(ol)
for p in me.polygons: p.use_smooth = True
if "sharp_face" in me.attributes: me.attributes.remove(me.attributes["sharp_face"])
# outline: Freestyle at render time (aa_render.py); an inverted hull poked through the sculpt as specks
bpy.ops.wm.save_as_mainfile(filepath=OUT)
print("SAVED", OUT)
