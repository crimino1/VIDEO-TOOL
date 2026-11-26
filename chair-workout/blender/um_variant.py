"""Make a character variant of um_look.blend: skin tone, hair colour, optional beard, a T-shirt or tank top, shorts colour.
blender -b um_look.blend --python um_variant.py -- <name>      -> um_<name>.blend
Clothing sits under the red muscle glow, so worked muscles still show through the shirt."""
import bpy, sys, math
from mathutils import Vector

V = {
 # older man: silver hair, short grey beard, navy tee, grey shorts
 "arthur": dict(skin=((0.64, 0.42, 0.31), (0.70, 0.47, 0.35)), hair=((0.30, 0.29, 0.28), (0.60, 0.58, 0.55)), brow=(0.30, 0.28, 0.26),
                beard=(0.40, 0.38, 0.36), top="tee", top_col=(0.030, 0.050, 0.110), shorts=(0.060, 0.060, 0.065), lips=(0.42, 0.18, 0.16)),
 # olive skin, dark hair, sage tank top, charcoal shorts
 "marco": dict(skin=((0.46, 0.29, 0.19), (0.53, 0.34, 0.23)), hair=((0.012, 0.009, 0.007), (0.040, 0.028, 0.018)), brow=(0.018, 0.012, 0.009),
               beard=None, top="tank", top_col=(0.045, 0.085, 0.055), shorts=(0.018, 0.018, 0.020), lips=(0.34, 0.15, 0.12)),
 # deep brown skin, black hair, short black beard, light heather tee, navy shorts
 "daniel": dict(skin=((0.17, 0.095, 0.060), (0.22, 0.125, 0.080)), hair=((0.008, 0.007, 0.006), (0.025, 0.020, 0.016)), brow=(0.010, 0.008, 0.007),
                beard=(0.012, 0.010, 0.008), top="tee", top_col=(0.52, 0.52, 0.51), shorts=(0.018, 0.028, 0.070), lips=(0.17, 0.075, 0.060)),
 # batch 5 -- fair older man, white short hair, blue-grey heather tee, khaki shorts (belly fat)
 "henry": dict(skin=((0.70, 0.47, 0.37), (0.76, 0.53, 0.42)), hair=((0.55, 0.54, 0.52), (0.82, 0.80, 0.77)), brow=(0.50, 0.48, 0.45),
               beard=None, top="tee", top_col=(0.30, 0.36, 0.42), shorts=(0.30, 0.25, 0.17), lips=(0.45, 0.20, 0.18)),
 # East Asian, black hair greying at the sides, white long-sleeve top, black long trousers (Tai Chi)
 "kenji": dict(skin=((0.58, 0.40, 0.27), (0.64, 0.45, 0.31)), hair=((0.015, 0.013, 0.012), (0.20, 0.19, 0.18)), brow=(0.02, 0.016, 0.014),
               beard=None, top="long", top_col=(0.78, 0.77, 0.74), shorts=(0.012, 0.012, 0.014), pants=True, lips=(0.38, 0.17, 0.14)),
 # South Asian, salt-and-pepper hair and short beard, slate-blue tee, charcoal joggers (feet / neuropathy)
 "raj": dict(skin=((0.30, 0.17, 0.10), (0.36, 0.21, 0.13)), hair=((0.05, 0.045, 0.04), (0.45, 0.44, 0.42)), brow=(0.05, 0.04, 0.035),
             beard=(0.075, 0.070, 0.066), top="tee", top_col=(0.060, 0.090, 0.150), shorts=(0.030, 0.030, 0.034), pants=True, lips=(0.26, 0.11, 0.09)),
 # batch 6 -- fair ruddy older man, grey hair, soft blue pyjamas (long sleeves, long trousers) (before bed)
 "walter": dict(skin=((0.68, 0.43, 0.33), (0.74, 0.48, 0.37)), hair=((0.33, 0.32, 0.31), (0.62, 0.60, 0.57)), brow=(0.30, 0.28, 0.26),
                beard=None, top="long", top_col=(0.24, 0.32, 0.44), shorts=(0.20, 0.27, 0.38), pants=True, lips=(0.44, 0.19, 0.17)),
 # Black older man, close grey crop and short grey beard, burgundy tee, grey joggers (get up off the floor)
 "samuel": dict(skin=((0.20, 0.115, 0.075), (0.25, 0.15, 0.10)), hair=((0.20, 0.19, 0.18), (0.45, 0.44, 0.42)), brow=(0.15, 0.14, 0.13),
                beard=(0.32, 0.31, 0.30), top="tee", top_col=(0.20, 0.035, 0.045), shorts=(0.10, 0.10, 0.11), pants=True, lips=(0.19, 0.08, 0.065)),
 # Japanese older man, silver hair, muted olive tee, dark navy shorts (Japanese five)
 "hiro": dict(skin=((0.62, 0.43, 0.30), (0.68, 0.48, 0.34)), hair=((0.25, 0.24, 0.23), (0.58, 0.57, 0.55)), brow=(0.10, 0.09, 0.085),
              beard=None, top="tee", top_col=(0.10, 0.12, 0.065), shorts=(0.018, 0.025, 0.050), lips=(0.40, 0.18, 0.15)),
}
name = sys.argv[sys.argv.index("--") + 1]; c = V[name]
body, rig = bpy.data.objects["body"], bpy.data.objects["rig"]
me = body.data; mw = body.matrix_world; rw = rig.matrix_world
gname = {g.index: g.name for g in body.vertex_groups}
def smooth(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)
ua = {s: (rw @ rig.data.bones[f"upperarm_{s}"].head_local, rw @ rig.data.bones[f"upperarm_{s}"].tail_local) for s in "lr"}

n = len(me.vertices)
top = [0.0] * n; beard = [0.0] * n
lips = [0.0] * n; me.attributes["lips"].data.foreach_get("value", lips)
shorts = [0.0] * n; me.attributes["shorts"].data.foreach_get("value", shorts)
for v in me.vertices:
    p = mw @ v.co
    w = {gname[g.group]: g.weight for g in v.groups}
    if c.get("pants"):                                                    # long trousers down to just above the ankle
        legw = sum(w.get(k, 0) for k in ("thigh_l", "thigh_r", "calf_l", "calf_r"))
        if legw > 0.5 and p.z > 0.115:
            shorts[v.index] = max(shorts[v.index], smooth(0.115, 0.135, p.z))
    if c["top"] == "long" and 0.70 < p.z < 1.50:                          # long sleeves to the wrist
        for s_ in "lr":
            if w.get(f"lowerarm_{s_}", 0) + w.get(f"upperarm_{s_}", 0) > 0.5:
                la = rw @ rig.data.bones[f"lowerarm_{s_}"].head_local, rw @ rig.data.bones[f"lowerarm_{s_}"].tail_local
                d_ = la[1] - la[0]; t_ = (p - la[0]).dot(d_) / d_.length_squared
                top[v.index] = max(top[v.index], 1 - smooth(0.86, 0.92, t_))
    if c["top"] and 0.90 < p.z < 1.50:
        limb = sum(w.get(k, 0) for k in ("upperarm_l", "upperarm_r", "lowerarm_l", "lowerarm_r", "hand_l", "hand_r"))
        legs = sum(w.get(k, 0) for k in ("thigh_l", "thigh_r", "calf_l", "calf_r"))
        f = 1.0 if (limb < 0.5 and (legs < 0.5 or p.z > 0.99)) else 0.0
        for s in "lr":                                                    # sleeves
            a, b = ua[s]; d = b - a
            t = (p - a).dot(d) / d.length_squared
            if w.get(f"upperarm_{s}", 0) > 0.3:
                sleeve = {"tee": 0.34, "long": 2.0}.get(c["top"], -1)
                f = max(f, 1 - smooth(sleeve - 0.04, sleeve + 0.03, t))
        f *= smooth(0.945, 0.965, p.z)                                    # hem over the waistband
        f *= 1 - smooth(0.6, 0.9, w.get("neck_01", 0) + w.get("head", 0))   # was 0.25-0.5: left holes over the traps
        front = p.y < 0.03
        ax = abs(p.x)
        if c["top"] in ("tee", "long"):                                             # round crew neck
            zc = (1.460 - 6.0 * max(0.0, 0.075 - ax) ** 2) if front else 1.475
            f *= 1 - smooth(zc - 0.006, zc + 0.004, p.z) * (1 - smooth(0.085, 0.105, ax))   # neck hole only; shoulders stay covered
        else:                                                             # tank: scoop neck, narrow straps, open arm holes
            zc = (1.445 - 9.0 * max(0.0, 0.085 - ax) ** 2) if front else (1.455 - 8.0 * max(0.0, 0.08 - ax) ** 2)
            f *= 1 - smooth(zc - 0.006, zc + 0.004, p.z)
            f *= 1 - smooth(0.125, 0.14, ax) * smooth(1.27, 1.31, p.z)
            f *= 1 - min(1.0, (w.get("upperarm_l", 0) + w.get("upperarm_r", 0)) * 3) * smooth(0.12, 0.15, ax)
            strap = smooth(0.062, 0.072, ax) * (1 - smooth(0.112, 0.122, ax)) * smooth(1.28, 1.30, p.z) * (1 - smooth(1.47, 1.49, p.z))
            f = max(f, strap * (1 - smooth(0.25, 0.5, w.get("neck_01", 0) + w.get("head", 0))))
        top[v.index] = max(top[v.index], f) if c["top"] == "long" else f
        shorts[v.index] *= 1 - top[v.index]
    if c["beard"] and 1.495 < p.z < 1.61:
        dy = p.y - 0.012; r = math.hypot(p.x, dy) or 1e-6; cc = dy / r
        if cc < 0.15:
            ax = abs(p.x)
            upper = 1.586 + 0.30 * max(0.0, ax - 0.020)                    # moustache under the nose, rising to the cheeks
            f = (1 - smooth(upper - 0.002, upper + 0.004, p.z)) * smooth(1.497, 1.512, p.z)
            f *= 1 - smooth(0.0, 0.5, lips[v.index])
            f *= 1 - smooth(-0.05, 0.15, cc) * smooth(1.575, 1.60, p.z)  # clear in front of the ears
            beard[v.index] = f
for nm, vals in (("top", top), ("beard", beard), ("shorts", shorts)):
    a = me.attributes.get(nm) or me.attributes.new(nm, "FLOAT", "POINT"); a.data.foreach_set("value", vals)

nt = me.materials[0].node_tree; N, L = nt.nodes, nt.links
def at(x, y, t):
    return min((nd for nd in N if nd.type == t), key=lambda nd: (nd.location.x - x) ** 2 + (nd.location.y - y) ** 2)
skin = at(-1350, 600, "VALTORGB")
skin.color_ramp.elements[0].color = (*c["skin"][0], 1); skin.color_ramp.elements[1].color = (*c["skin"][1], 1)
hcol = at(-1100, -1800, "VALTORGB")
hcol.color_ramp.elements[0].color = (*c["hair"][0], 1); hcol.color_ramp.elements[1].color = (*c["hair"][1], 1)
at(-300, -650, "MIX").inputs[7].default_value = (*c["brow"], 1)
at(-300, -200, "MIX").inputs[7].default_value = (*c["lips"], 1)
N["Mix.003"].inputs[7].default_value = (*c["shorts"], 1)
bsdf = N["Principled BSDF"]
def attr(nm, x, y):
    a = N.new("ShaderNodeAttribute"); a.attribute_name = nm; a.location = (x, y); return a.outputs["Fac"]
# shirt under the muscle glow
if c["top"]:
    tm = N.new("ShaderNodeMix"); tm.data_type = "RGBA"; tm.location = (-1100, 600)
    tm.inputs[7].default_value = (*c["top_col"], 1)
    L.new(attr("top", -1350, 450), tm.inputs["Factor"])
    for l in list(skin.outputs["Color"].links):
        L.new(tm.outputs["Result"], l.to_socket)
    L.new(skin.outputs["Color"], tm.inputs[6])
    # cloth is rough and does not scatter like skin
    hr = at(-300, -1000, "MATH")
    mx = N.new("ShaderNodeMath"); mx.operation = "MAXIMUM"; mx.location = (-150, -1100)
    L.new(hr.outputs[0], mx.inputs[0]); L.new(attr("top", -400, -1150), mx.inputs[1])
    for l in list(hr.outputs[0].links):
        if l.to_node != mx: L.new(mx.outputs[0], l.to_socket)
# beard: stubble-textured colour on top of everything
if c["beard"]:
    noise = N.new("ShaderNodeTexNoise"); noise.inputs["Scale"].default_value = 260.0; noise.location = (-600, -2000)
    st = N.new("ShaderNodeMapRange"); st.location = (-400, -2000); st.inputs["From Min"].default_value = 0.35; st.inputs["From Max"].default_value = 0.6
    st.inputs["To Min"].default_value = 0.55; st.inputs["To Max"].default_value = 0.95
    L.new(noise.outputs["Fac"], st.inputs["Value"])
    bf = N.new("ShaderNodeMath"); bf.operation = "MULTIPLY"; bf.location = (-250, -2000)
    L.new(attr("beard", -600, -2150), bf.inputs[0]); L.new(st.outputs["Result"], bf.inputs[1])
    bm = N.new("ShaderNodeMix"); bm.data_type = "RGBA"; bm.location = (-100, -900)
    src = bsdf.inputs["Base Color"].links[0].from_socket
    L.new(src, bm.inputs[6]); bm.inputs[7].default_value = (*c["beard"], 1); L.new(bf.outputs[0], bm.inputs["Factor"])
    L.new(bm.outputs["Result"], bsdf.inputs["Base Color"])
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath.replace("um_look.blend", f"um_{name}.blend"))
print("VARIANT SAVED", name, "top verts", sum(1 for x in top if x > 0.5), "beard verts", sum(1 for x in beard if x > 0.5))
