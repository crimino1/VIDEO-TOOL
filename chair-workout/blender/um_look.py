"""Upgrade the thin figure's look -> um_look.blend (same mesh and rig as um_thin.blend):
painted hair, eyebrows, eyes and lips (point attributes from head geometry), natural skin with tone variation,
pore bump, softer sheen. blender -b um_thin.blend --python um_look.py"""
import bpy, math
from mathutils import Vector

body = bpy.data.objects["body"]; me = body.data; mw = body.matrix_world
CY = 0.012                              # head centre (front of face is -Y)

def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)

n = len(me.vertices)
hair = [0.0] * n; brow = [0.0] * n; sclera = [0.0] * n; iris = [0.0] * n; lips = [0.0] * n
for v in me.vertices:
    p = mw @ v.co
    if p.z < 1.55: continue
    dy = p.y - CY; r = math.hypot(p.x, dy) or 1e-6
    c = dy / r                                   # -1 front, 0 side, +1 back
    th = 1.660 + (0.038 * -c if c < 0 else -0.075 * c)
    hair[v.index] = smooth(th - 0.003, th + 0.004, p.z)
    if c < -0.55:                                # face
        ax = abs(p.x)
        zb = 1.6595 - 3.4 * (ax - 0.027) ** 2
        if 0.009 < ax < 0.057:
            taper = smooth(0.009, 0.016, ax) * (1 - smooth(0.048, 0.057, ax))
            hw = 0.0044 - 0.0022 * smooth(0.014, 0.056, ax)
            brow[v.index] = 0.97 * taper * (1 - smooth(hw * 0.45, hw * 1.25, abs(p.z - zb)))
        ex, ez = ax - 0.033, p.z - 1.6325       # eye centre
        e = (ex / 0.0115) ** 2 + (ez / 0.0050) ** 2
        sclera[v.index] = 1 - smooth(0.75, 1.0, e)
        d = math.hypot(ex, ez)
        iris[v.index] = 1 - smooth(0.0042, 0.0056, d)
        if ax < 0.024:
            lz = p.z - 1.5705
            lips[v.index] = (1 - smooth(0.016, 0.024, ax)) * (1 - smooth(0.0035, 0.0060, abs(lz)))
for name, vals in (("hair", hair), ("brow", brow), ("sclera", sclera), ("iris", iris), ("lips", lips)):
    a = me.attributes.get(name) or me.attributes.new(name, "FLOAT", "POINT")
    a.data.foreach_set("value", vals)

m = me.materials[0]; nt = m.node_tree; N, L = nt.nodes, nt.links
bsdf = N["Principled BSDF"]
def node(t, x, y, **kw):
    nd = N.new(t); nd.location = (x, y)
    for k, val in kw.items(): setattr(nd, k, val)
    return nd
def attr(name, y):
    a = node("ShaderNodeAttribute", -1600, y); a.attribute_name = name; return a.outputs["Fac"]

# skin tone with gentle variation (redder in places, like real skin)
noise = node("ShaderNodeTexNoise", -1600, 600); noise.inputs["Scale"].default_value = 9.0; noise.inputs["Detail"].default_value = 3.0
ramp = node("ShaderNodeValToRGB", -1350, 600)
ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[0].color = (0.64, 0.42, 0.31, 1)
ramp.color_ramp.elements[1].position = 0.70; ramp.color_ramp.elements[1].color = (0.70, 0.47, 0.35, 1)
L.new(noise.outputs["Fac"], ramp.inputs["Fac"])
old_rgb = N["Color"]
for l in list(old_rgb.outputs[0].links):
    L.new(ramp.outputs["Color"], l.to_socket)

# painted features, layered on top of the final base colour
src = bsdf.inputs["Base Color"].links[0].from_socket
def layer(prev, fac_socket, color, y):
    mx = node("ShaderNodeMix", -300, y); mx.data_type = "RGBA"
    mx.inputs["B"].default_value = color
    L.new(fac_socket, mx.inputs["Factor"]); L.new(prev, mx.inputs["A"]); return mx.outputs["Result"]
c = src
c = layer(c, attr("lips", -200), (0.42, 0.17, 0.15, 1), -200)
c = layer(c, attr("sclera", -350), (0.50, 0.46, 0.43, 1), -350)
c = layer(c, attr("iris", -500), (0.035, 0.022, 0.016, 1), -500)
c = layer(c, attr("brow", -650), (0.052, 0.034, 0.022, 1), -650)
hn = node("ShaderNodeTexNoise", -1600, -1600); hn.inputs["Scale"].default_value = 120.0; hn.inputs["Detail"].default_value = 4.0
hm = node("ShaderNodeMath", -1300, -1600, operation="MULTIPLY_ADD")
L.new(attr("hair", -1700), hm.inputs[0]); hm.inputs[1].default_value = 1.6
hs = node("ShaderNodeMath", -1300, -1750, operation="MULTIPLY"); L.new(hn.outputs["Fac"], hs.inputs[0]); hs.inputs[1].default_value = -0.6
L.new(hs.outputs[0], hm.inputs[2])
hcl = node("ShaderNodeClamp", -1100, -1600); L.new(hm.outputs[0], hcl.inputs["Value"])
hcol = node("ShaderNodeValToRGB", -1100, -1800)
hcol.color_ramp.elements[0].color = (0.030, 0.019, 0.012, 1); hcol.color_ramp.elements[1].color = (0.095, 0.062, 0.038, 1)
L.new(hn.outputs["Fac"], hcol.inputs["Fac"])
mxh = node("ShaderNodeMix", -300, -800); mxh.data_type = "RGBA"
L.new(hcl.outputs["Result"], mxh.inputs["Factor"]); L.new(c, mxh.inputs["A"]); L.new(hcol.outputs["Color"], mxh.inputs["B"])
c = mxh.outputs["Result"]
L.new(c, bsdf.inputs["Base Color"])

# hair and brows are rougher and don't scatter light like skin
hr = node("ShaderNodeMath", -300, -1000, operation="MAXIMUM")
L.new(attr("hair", -950), hr.inputs[0]); L.new(attr("brow", -1050), hr.inputs[1])
rough = node("ShaderNodeMapRange", -100, -1000)
rough.inputs["To Min"].default_value = 0.52; rough.inputs["To Max"].default_value = 0.85
L.new(hr.outputs[0], rough.inputs["Value"]); L.new(rough.outputs["Result"], bsdf.inputs["Roughness"])
ss = node("ShaderNodeMapRange", -100, -1200)
ss.inputs["To Min"].default_value = 0.35; ss.inputs["To Max"].default_value = 0.0
L.new(hr.outputs[0], ss.inputs["Value"]); L.new(ss.outputs["Result"], bsdf.inputs["Subsurface Weight"])

# pores / hair strands: fine bump
pn = node("ShaderNodeTexNoise", -600, -1400); pn.inputs["Scale"].default_value = 900.0; pn.inputs["Detail"].default_value = 2.0
bump = node("ShaderNodeBump", -300, -1400); bump.inputs["Strength"].default_value = 0.06; bump.inputs["Distance"].default_value = 0.0005
L.new(pn.outputs["Fac"], bump.inputs["Height"]); L.new(bump.outputs["Normal"], bsdf.inputs["Normal"])

bsdf.inputs["Subsurface Radius"].default_value = (1.0, 0.4, 0.25)
bsdf.inputs["Subsurface Scale"].default_value = 0.012
bsdf.inputs["Specular IOR Level"].default_value = 0.32
bsdf.inputs["Sheen Weight"].default_value = 0.08
N["Map Range"].inputs["To Min"].default_value = 0.5          # lighter baked AO: fewer dark specks
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath.replace("um_thin.blend", "um_look.blend"))
print("LOOK SAVED")
