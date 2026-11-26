"""Make a slimmer, skin-toned copy of um_auto.blend -> um_thin.blend.
Each vertex moves toward the axis of the bones it is weighted to (rest pose), so the rig and poses are unchanged."""
import bpy
from mathutils import Vector
SHRINK = {"pelvis": 0.85, "spine_01": 0.77, "spine_02": 0.79, "spine_03": 0.84, "neck_01": 0.9, "head": 1.0,
          "clavicle": 0.86, "upperarm": 0.74, "lowerarm": 0.82, "hand": 1.0, "thigh": 0.78, "calf": 0.84, "foot": 1.0, "ball": 1.0}
SKIN = (0.75, 0.46, 0.33, 1)          # light European skin, linear
def factor(n): return SHRINK.get(n, SHRINK.get(n.rsplit("_", 1)[0], 1.0))
body, rig = bpy.data.objects["body"], bpy.data.objects["rig"]
mw, mwi, rw = body.matrix_world, body.matrix_world.inverted(), rig.matrix_world
seg = {b.name: (rw @ b.head_local, rw @ b.tail_local) for b in rig.data.bones}
gname = {g.index: g.name for g in body.vertex_groups}
for v in body.data.vertices:
    p = mw @ v.co; acc = Vector(); tw = 0.0
    for g in v.groups:
        n = gname[g.group]
        if n not in seg or g.weight <= 0: continue
        a, b = seg[n]; d = b - a
        t = max(0.0, min(1.0, (p - a).dot(d) / d.length_squared)); c = a + d * t
        acc += (c + (p - c) * factor(n)) * g.weight; tw += g.weight
    if tw > 0: v.co = mwi @ (acc / tw)
body.data.update()
m = body.data.materials[0].copy(); m.name = "skin"; body.data.materials[0] = m
nt = m.node_tree; rgb = nt.nodes.new("ShaderNodeRGB"); rgb.outputs[0].default_value = SKIN
nt.links.new(rgb.outputs[0], nt.nodes["Mix.001"].inputs["A"])
bsdf = nt.nodes["Principled BSDF"]
bsdf.inputs["Subsurface Weight"].default_value = 0.25
bsdf.inputs["Subsurface Radius"].default_value = (1.0, 0.35, 0.2)
bsdf.inputs["Subsurface Scale"].default_value = 0.01
bsdf.inputs["Roughness"].default_value = 0.5
nt.nodes["Map Range.002"].inputs["To Max"].default_value = 0.72   # softer red glow on skin
print("DIMS", tuple(round(x, 3) for x in body.dimensions))
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath.replace("um_auto.blend", "um_thin.blend"))
