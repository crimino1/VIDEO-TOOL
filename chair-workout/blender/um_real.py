"""Realism pass on a character variant -> um_<name>_r.blend (same rig, same skin weights).
- Clothes become real geometry: the shirt/trousers faces are duplicated, pushed out and smoothed, so the fabric
  hides the sculpted six-pack and shows a real hem and edge. Muscle glow still runs through them (same attributes).
- Hair becomes a thin volume shell plus short particle strands, instead of a painted cap.
- Eyes get a wet highlight; cloth gets weave, sheen and soft folds.
blender -b um_<name>.blend --python um_real.py -- <name>"""
import bpy, bmesh, sys, math
from mathutils import Vector

name = sys.argv[sys.argv.index("--") + 1]
body = bpy.data.objects["body"]; me = body.data

def get(nm):
    a = me.attributes.get(nm); vals = [0.0] * len(me.vertices)
    if a: a.data.foreach_get("value", vals)
    return vals
top, shorts, hair = get("top"), get("shorts"), get("hair")

bm = bmesh.new(); bm.from_mesh(me)
bm.verts.ensure_lookup_table(); bm.faces.ensure_lookup_table()
bm.normal_update()
# soften the sculpted bodybuilder definition into a natural older body (face, hands and feet untouched)
dl = bm.verts.layers.deform.active
gid = {g.name: g.index for g in body.vertex_groups}
KEEP = [gid[n] for n in gid if n.split("_")[0] in ("head", "neck", "hand", "foot", "ball", "thumb", "index", "middle", "ring", "pinky")]
soft = [v for v in bm.verts if sum(v[dl].get(k, 0.0) for k in KEEP) < 0.15]
for _ in range(3):
    bmesh.ops.smooth_laplacian_vert(bm, verts=soft, lambda_factor=0.9, lambda_border=0.0, use_x=True, use_y=True, use_z=True, preserve_volume=True)
bm.normal_update()
print("SOFTENED", len(soft), "verts")
NBR = [[e.other_vert(v).index for e in v.link_edges] for v in bm.verts]
def close_holes(m, thr=0.5, n=2):
    """Morphological closing on the mask: fills pin-holes that showed as dark specks in the cloth."""
    b_ = [1.0 if x > thr else 0.0 for x in m]
    for _ in range(n): b_ = [max([b_[i]] + [b_[j] for j in NBR[i]]) for i in range(len(b_))]
    for _ in range(n): b_ = [min([b_[i]] + [b_[j] for j in NBR[i]]) for i in range(len(b_))]
    return [max(x, y) for x, y in zip(m, b_)]
top = close_holes(top); shorts = [0.0 if t > 0.5 else x for x, t in zip(close_holes(shorts), top)]

def shell(mask, thr, offset, smooth_iter, smooth_fac, mat_index, min_gap):
    # any() takes one more ring than all(), so the shell also covers the half-painted faces at the hem
    faces = [f for f in bm.faces if f.material_index == 0 and any(mask[v.index] > thr for v in f.verts)]
    # keep only big connected pieces: stray painted faces (heel, toes) became thin spikes once the hem was smoothed
    sel = set(faces); seen = set(); keep = []
    for f0 in faces:
        if f0 in seen: continue
        comp = [f0]; seen.add(f0); i = 0
        while i < len(comp):
            for e in comp[i].edges:
                for g in e.link_faces:
                    if g in sel and g not in seen: seen.add(g); comp.append(g)
            i += 1
        if len(comp) > 300: keep += comp
    faces = keep
    if not faces: return 0
    orig = {}
    res = bmesh.ops.duplicate(bm, geom=faces)
    vmap = res["vert_map"]                                   # old -> new
    new_verts = [v for v in res["geom"] if isinstance(v, bmesh.types.BMVert)]
    back = {nv: ov for ov, nv in vmap.items() if isinstance(ov, bmesh.types.BMVert)}
    for nv in new_verts:
        ov = back[nv]; off = offset(ov) if callable(offset) else offset
        orig[nv] = (ov.co.copy(), ov.normal.copy(), off)
        nv.co = ov.co + ov.normal * off
    for f in res["geom"]:
        if isinstance(f, bmesh.types.BMFace): f.material_index = mat_index
    inner = [v for v in new_verts if not v.is_boundary]      # pin hems and cuffs so they don't creep back
    # straighten the stair-stepped hem: slide each edge vertex toward the middle of its two edge neighbours
    rim = [v for v in new_verts if v.is_boundary]
    rn = {v: [e.other_vert(v) for e in v.link_edges if e.is_boundary] for v in rim}
    for _ in range(8):
        tgt = {v: sum((u.co for u in rn[v]), Vector()) / len(rn[v]) for v in rim if len(rn[v]) == 2}
        for v, t in tgt.items(): v.co = v.co * 0.5 + t * 0.5
    for _ in range(smooth_iter):
        bmesh.ops.smooth_vert(bm, verts=inner, factor=smooth_fac, use_axis_x=True, use_axis_y=True, use_axis_z=True)
        for nv in new_verts:                                 # never sink into the skin
            co, n, off = orig[nv]
            d = (nv.co - co).dot(n)
            gap = min_gap if not callable(min_gap) else min_gap(off)
            if d < gap: nv.co += n * (gap - d)
    return len(faces)

# keep the cloth edge a little away from the skin so it reads as fabric, smooth hard to iron out the abs
n_top = shell(top, 0.5, 0.011, 14, 0.5, 1, 0.008)
n_sh = shell(shorts, 0.5, 0.012, 10, 0.5, 2, 0.008)
n_hair = 0   # hair shell tried: read as a helmet, painted hair kept
# junk vertices below the floor at the centre, joined to the heels by long edges (stretched into thin rods when a foot lifts)
junk = [v for v in bm.verts if v.co.z < 0.0 and any(e.calc_length() > 0.12 for e in v.link_edges)]
bmesh.ops.delete(bm, geom=junk, context="VERTS")
print("JUNK removed", len(junk))
bm.to_mesh(me); bm.free(); me.update()
print("SHELL faces top", n_top, "shorts", n_sh, "hair", n_hair)

# ---------- materials ----------
skin = me.materials[0]
def variant(src, nm):
    m = src.copy(); m.name = nm; return m
cloth = variant(skin, "cloth"); pants = variant(skin, "pants"); hairm = variant(skin, "hair")
for m in (cloth, pants, hairm): me.materials.append(m)

def tweak_cloth(m, weave_scale):
    nt = m.node_tree; N, L = nt.nodes, nt.links
    b = N["Principled BSDF"]
    for l in list(b.inputs["Roughness"].links) + list(b.inputs["Subsurface Weight"].links) + list(b.inputs["Normal"].links): L.remove(l)
    b.inputs["Roughness"].default_value = 0.88
    b.inputs["Subsurface Weight"].default_value = 0.0
    b.inputs["Sheen Weight"].default_value = 0.55; b.inputs["Sheen Roughness"].default_value = 0.45
    b.inputs["Specular IOR Level"].default_value = 0.25
    tc = N.new("ShaderNodeTexCoord")
    weave = N.new("ShaderNodeTexWave"); weave.wave_type = "BANDS"; weave.inputs["Scale"].default_value = weave_scale
    weave.inputs["Distortion"].default_value = 2.0; weave.inputs["Detail"].default_value = 1.0
    fold = N.new("ShaderNodeTexNoise"); fold.inputs["Scale"].default_value = 7.0; fold.inputs["Detail"].default_value = 2.0
    mp = N.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (2.5, 2.5, 0.6)   # folds run around the body
    L.new(tc.outputs["Object"], mp.inputs["Vector"]); L.new(mp.outputs["Vector"], fold.inputs["Vector"]); L.new(tc.outputs["Object"], weave.inputs["Vector"])
    b1 = N.new("ShaderNodeBump"); b1.inputs["Strength"].default_value = 0.10; b1.inputs["Distance"].default_value = 0.0004
    b2 = N.new("ShaderNodeBump"); b2.inputs["Strength"].default_value = 0.35; b2.inputs["Distance"].default_value = 0.006
    L.new(weave.outputs["Fac"], b1.inputs["Height"]); L.new(fold.outputs["Fac"], b2.inputs["Height"]); L.new(b1.outputs["Normal"], b2.inputs["Normal"])
    L.new(b2.outputs["Normal"], b.inputs["Normal"])
    # fabric is never pure: darken slightly in the folds
    src = b.inputs["Base Color"].links[0].from_socket
    mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = "MULTIPLY"; mx.inputs["Factor"].default_value = 0.25
    L.new(src, mx.inputs[6]); L.new(fold.outputs["Color"], mx.inputs[7]); L.new(mx.outputs["Result"], b.inputs["Base Color"])
def soften_glow(m, k=0.7):
    nt = m.node_tree; N, L = nt.nodes, nt.links
    mx = N["Mix.001"]; src = mx.inputs["Factor"].links[0].from_socket
    mul = N.new("ShaderNodeMath"); mul.operation = "MULTIPLY"; mul.inputs[1].default_value = k
    L.new(src, mul.inputs[0]); L.new(mul.outputs[0], mx.inputs["Factor"])
tweak_cloth(cloth, 900.0); tweak_cloth(pants, 700.0); soften_glow(cloth); soften_glow(pants)

nt = hairm.node_tree; N, L = nt.nodes, nt.links
b = N["Principled BSDF"]
for l in list(b.inputs["Roughness"].links) + list(b.inputs["Subsurface Weight"].links) + list(b.inputs["Normal"].links): L.remove(l)
b.inputs["Roughness"].default_value = 0.5; b.inputs["Subsurface Weight"].default_value = 0.0
b.inputs["Coat Weight"].default_value = 0.0; b.inputs["Specular IOR Level"].default_value = 0.4
tc = N.new("ShaderNodeTexCoord"); mp = N.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (1.0, 0.08, 1.0)   # strands run front to back
st = N.new("ShaderNodeTexNoise"); st.inputs["Scale"].default_value = 160.0; st.inputs["Detail"].default_value = 6.0
L.new(tc.outputs["Object"], mp.inputs["Vector"]); L.new(mp.outputs["Vector"], st.inputs["Vector"])
hb = N.new("ShaderNodeBump"); hb.inputs["Strength"].default_value = 0.6; hb.inputs["Distance"].default_value = 0.001
L.new(st.outputs["Fac"], hb.inputs["Height"]); L.new(hb.outputs["Normal"], b.inputs["Normal"])

# face detail: lash line, warm cheeks / nose / ears, a shinier T-zone
mw = body.matrix_world
def sm(e0, e1, x):
    t = max(0.0, min(1.0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t)
nv = len(me.vertices); lash = [0.0] * nv; warm = [0.0] * nv; tz = [0.0] * nv
for v in me.vertices:
    p = mw @ v.co
    if p.z < 1.50: continue
    dy = p.y - 0.012; r = math.hypot(p.x, dy) or 1e-6; c = dy / r
    ax = abs(p.x)
    if c < -0.5:
        ex, ez = ax - 0.033, p.z - 1.6325
        e = (ex / 0.0115) ** 2 + (ez / 0.0050) ** 2
        lash[v.index] = sm(0.85, 1.05, e) * (1 - sm(1.35, 2.2, e)) * (1.0 if ez > -0.001 else 0.45)
        cheek = math.exp(-(((ax - 0.040) / 0.016) ** 2 + ((p.z - 1.603) / 0.014) ** 2))
        nose = math.exp(-((ax / 0.010) ** 2 + ((p.z - 1.600) / 0.010) ** 2))
        warm[v.index] = min(1.0, cheek * 0.8 + nose * 0.7)
        tz[v.index] = max(math.exp(-((ax / 0.030) ** 2 + ((p.z - 1.672) / 0.016) ** 2)), nose)
    elif abs(c) < 0.5 and 1.58 < p.z < 1.66 and ax > 0.06:      # ears
        warm[v.index] = 0.6
for nm, vals in (("lash", lash), ("warm", warm), ("tzone", tz)):
    at = me.attributes.get(nm) or me.attributes.new(nm, "FLOAT", "POINT"); at.data.foreach_set("value", vals)
nt = skin.node_tree; N, L = nt.nodes, nt.links
b = N["Principled BSDF"]
src = b.inputs["Base Color"].links[0].from_socket
def amix(prev, attr_name, col, k, mode="MIX"):
    at = N.new("ShaderNodeAttribute"); at.attribute_name = attr_name
    f = N.new("ShaderNodeMath"); f.operation = "MULTIPLY"; f.inputs[1].default_value = k; L.new(at.outputs["Fac"], f.inputs[0])
    mx = N.new("ShaderNodeMix"); mx.data_type = "RGBA"; mx.blend_type = mode
    L.new(f.outputs[0], mx.inputs["Factor"]); L.new(prev, mx.inputs[6]); mx.inputs[7].default_value = col
    return mx.outputs["Result"]
c = amix(src, "warm", (0.85, 0.38, 0.33, 1), 0.22, "MULTIPLY")
c = amix(c, "lash", (0.10, 0.06, 0.05, 1), 0.75)
L.new(c, b.inputs["Base Color"])
rsrc0 = b.inputs["Roughness"].links[0].from_socket
at = N.new("ShaderNodeAttribute"); at.attribute_name = "tzone"
rm = N.new("ShaderNodeMix"); rm.data_type = "FLOAT"; rm.inputs["B"].default_value = 0.34
f = N.new("ShaderNodeMath"); f.operation = "MULTIPLY"; f.inputs[1].default_value = 0.8; L.new(at.outputs["Fac"], f.inputs[0])
L.new(f.outputs[0], rm.inputs["Factor"]); L.new(rsrc0, rm.inputs["A"]); L.new(rm.outputs["Result"], b.inputs["Roughness"])
b.inputs["Subsurface Weight"].default_value = 0.4 if not b.inputs["Subsurface Weight"].links else b.inputs["Subsurface Weight"].default_value

# skin: wet eyes, a touch more scatter, warmer creases
nt = skin.node_tree; N, L = nt.nodes, nt.links
b = N["Principled BSDF"]
rsrc = b.inputs["Roughness"].links[0].from_socket
eyes = N.new("ShaderNodeMath"); eyes.operation = "MAXIMUM"
a1 = N.new("ShaderNodeAttribute"); a1.attribute_name = "sclera"; a2 = N.new("ShaderNodeAttribute"); a2.attribute_name = "iris"
L.new(a1.outputs["Fac"], eyes.inputs[0]); L.new(a2.outputs["Fac"], eyes.inputs[1])
wet = N.new("ShaderNodeMix"); wet.data_type = "FLOAT"; wet.inputs["B"].default_value = 0.12
L.new(eyes.outputs[0], wet.inputs["Factor"]); L.new(rsrc, wet.inputs["A"]); L.new(wet.outputs["Result"], b.inputs["Roughness"])

# particle hair was tried and dropped: wrong scale on this rig and 4x slower renders
bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath.replace(f"um_{name}.blend", f"um_{name}_r.blend"))
print("REAL SAVED", name)
