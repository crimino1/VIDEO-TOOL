"""Builds the anatomy workout figure from Z-Anatomy (CC BY-SA 4.0, based on BodyParts3D CC BY-SA 2.1 JP).
Keeps the visible muscles plus the bones that show at the surface, decimates for a 2 GB GPU, joins into one mesh
with a muscle-group attribute, fits a game_engine-named armature to the skeleton landmarks and skins it.
blender -b --factory-startup --disable-autoexec <Startup.blend> --python za_build.py -- <out.blend>"""
import bpy, bmesh, math, sys
import numpy as np
from mathutils import Vector
OUT = sys.argv[sys.argv.index("--") + 1]

def objs(c):
    out = list(c.objects)
    for ch in c.children: out += objs(ch)
    return out
mus_c = bpy.data.collections["4: Muscular system"]
sk_c = bpy.data.collections["1: Skeletal system"]
sense = [c for c in bpy.data.collections if c.name.startswith("7:")]

DEEP = ("intercostal", "transversus abdominis", "internal abdominal oblique", "bursa", "sheath", "septum", "levatores",
        "interspinales", "intertransvers", "multifidus", "rotatores", "quadratus lumborum", "coccygeus", "pubo", "piriformis",
        "obturator", "gemellus", "quadratus femoris", "perine", "sphincter", "diaphragm", "aryten", "thyro", "crico", "glossus",
        "palat", "uvula", "stapedius", "tympani", "subcostal", "transversus thoracis", "serratus posterior", "semispinalis",
        "longus colli", "longus capitis", "pectoralis minor", "subclavius", "subscapularis", "popliteus", "flexor digitorum profundus",
        "flexor pollicis longus", "pronator quadratus", "supinator", "fascia", "ligament", "pharyn", "constrictor", "lumbar",
        "rectus capitis", "obliquus capitis", "cremaster", "dartos", "tarsal", "retinacul", "vaginal", "salpingo", "levator ani",
        "iliococc", "puborect", "levator veli", "musculus uvulae", "membrane", "septal", "capsule", "investing", "deep ", "aponeuros")
KEEP_FASCIA = ("iliotibial tract",)
GROUPS = [
    ("abs", ("rectus abdominis", "pyramidalis")), ("obliques", ("external abdominal oblique", "serratus anterior")),
    ("chest", ("pectoralis major",)), ("shoulders", ("deltoid",)), ("biceps", ("biceps brachii", "brachialis", "coracobrachialis")),
    ("triceps", ("triceps brachii", "anconeus")),
    ("forearms", ("brachioradialis", "carpi", "digitorum superficialis", "pronator teres", "palmaris longus", "extensor digitorum muscle", "extensor digiti minimi")),
    ("traps", ("trapezius",)), ("back", ("latissimus", "rhomboid", "teres", "infraspinatus", "supraspinatus", "erector", "iliocostalis", "longissimus", "spinalis")),
    ("glutes", ("gluteus",)), ("quads", ("rectus femoris", "vastus")), ("hamstrings", ("biceps femoris", "semitendinosus", "semimembranosus")),
    ("adductors", ("adductor longus", "adductor brevis", "adductor magnus", "gracilis", "pectineus")), ("hipflexors", ("iliopsoas", "psoas major", "iliacus", "tensor fasciae latae", "sartorius")),
    ("calves", ("gastrocnemius", "soleus", "plantaris")), ("shins", ("tibialis anterior", "fibularis longus", "fibularis brevis", "extensor digitorum longus", "extensor hallucis longus")),
    ("neck", ("sternocleidomastoid", "scalene")),
]
GID = {g: i + 1 for i, (g, _) in enumerate(GROUPS)}   # 0 = other muscle, -1 = bone/eye

def group_of(name):
    n = name.lower()
    for g, keys in GROUPS:
        if any(k in n for k in keys): return GID[g]
    return 0

SURFACE_BONES = ("metacarp", "phalanx", "scaphoid", "lunate", "triquetr", "pisiform", "trapezi", "capitate", "hamate",
                 "metatars", "talus", "calcaneus", "navicular", "cuboid", "cuneiform", "patella", "tibia", "clavicle",
                 "manubrium", "body of sternum", "xiphoid", "frontal bone", "parietal", "occipital", "temporal", "sphenoid",
                 "zygomatic", "maxilla", "nasal bone", "mandible", "lacrimal", "ethmoid", "vomer", "palatine", "inferior nasal concha")

keep = []
for o in objs(mus_c):
    if o.type != "MESH" or not o.data.polygons: continue
    n = o.name.lower()
    if any(k in n for k in DEEP) and not any(k in n for k in KEEP_FASCIA): continue
    keep.append((o, group_of(o.name)))
for o in objs(sk_c):
    if o.type != "MESH" or not o.data.polygons: continue
    n = o.name.lower()
    if any(k in n for k in SURFACE_BONES) and not n.endswith((".t", ".j", ".g")): keep.append((o, -1))
for c in sense:
    for o in objs(c):
        if o.type == "MESH" and o.data.polygons and "eyeball" in o.name.lower(): keep.append((o, -1))
print("KEEP", len(keep), "faces", sum(len(o.data.polygons) for o, _ in keep))

keep_set = {o.name for o, _ in keep}
for o in list(bpy.data.objects):
    if o.name not in keep_set: bpy.data.objects.remove(o, do_unlink=True)
for c in list(bpy.data.collections): bpy.data.collections.remove(c)
scene = bpy.context.scene
for o, _ in keep:
    if o.name not in scene.collection.objects: scene.collection.objects.link(o)
    o.hide_set(False); o.hide_render = False; o.hide_viewport = False
bpy.ops.outliner.orphans_purge(do_recursive=True)

# per object: apply transforms, decimate, fibre coordinate (across the muscle's long axis), group id
for o, gid in keep:
    o.data = o.data.copy() if o.data.users > 1 else o.data
    me = o.data
    me.transform(o.matrix_world); o.matrix_world.identity()
    o.modifiers.clear()
    nf = len(me.polygons)
    target = 600 if gid == -1 else 900
    if nf > target:
        d = o.modifiers.new("dec", "DECIMATE"); d.ratio = max(0.08, min(1.0, max(target, nf * 0.22) / nf))
        bpy.context.view_layer.objects.active = o
        dg = bpy.context.evaluated_depsgraph_get()
        new = bpy.data.meshes.new_from_object(o.evaluated_get(dg)); o.modifiers.clear(); o.data = new; me = new
    co = np.array([v.co[:] for v in me.vertices]) if me.vertices else np.zeros((1, 3))
    if len(co) > 3:
        c = co - co.mean(0); w, v = np.linalg.eigh(c.T @ c); axis2 = v[:, 1]
        fib = (co @ axis2).astype(np.float32)
    else:
        fib = np.zeros(len(co), np.float32)
    a = me.attributes.new("fib", "FLOAT", "POINT"); a.data.foreach_set("value", fib)
    g = me.attributes.new("grp", "INT", "FACE"); g.data.foreach_set("value", [gid] * len(me.polygons))
    for p in me.polygons: p.use_smooth = True

bpy.ops.object.select_all(action="DESELECT")
for o, _ in keep: o.select_set(True)
bpy.context.view_layer.objects.active = keep[0][0]
bpy.ops.object.join()
body = bpy.context.object; body.name = "body"; body.data.name = "anat"
me = body.data
print("JOINED faces", len(me.polygons), "verts", len(me.vertices))
me.attributes.new("act", "FLOAT", "FACE").data.foreach_set("value", [0.0] * len(me.polygons))

# ---------- armature fitted to the skeleton landmarks (left side; right mirrored) ----------
J = {"pelvis": ((0, 0.03, 0.905), (0, 0.03, 1.0)), "spine_01": ((0, 0.03, 1.0), (0, 0.03, 1.10)),
     "spine_02": ((0, 0.03, 1.10), (0, 0.045, 1.19)), "spine_03": ((0, 0.045, 1.19), (0, 0.045, 1.44)),
     "neck_01": ((0, 0.045, 1.44), (0, 0.02, 1.545)), "head": ((0, 0.02, 1.545), (0, 0.02, 1.71)),
     "clavicle_l": ((0.015, -0.03, 1.40), (0.165, 0.03, 1.39)), "upperarm_l": ((0.175, 0.03, 1.38), (0.225, 0.025, 1.095)),
     "lowerarm_l": ((0.225, 0.025, 1.095), (0.265, 0.005, 0.862)), "hand_l": ((0.265, 0.005, 0.862), (0.272, -0.025, 0.772)),
     "thigh_l": ((0.09, 0.015, 0.862), (0.09, 0.02, 0.44)), "calf_l": ((0.09, 0.02, 0.44), (0.077, 0.035, 0.07)),
     "foot_l": ((0.077, 0.035, 0.07), (0.088, -0.07, 0.02)), "ball_l": ((0.088, -0.07, 0.02), (0.09, -0.13, 0.015))}
PARENT = {"spine_01": "pelvis", "spine_02": "spine_01", "spine_03": "spine_02", "neck_01": "spine_03", "head": "neck_01",
          "clavicle_l": "spine_03", "upperarm_l": "clavicle_l", "lowerarm_l": "upperarm_l", "hand_l": "lowerarm_l",
          "thigh_l": "pelvis", "calf_l": "thigh_l", "foot_l": "calf_l", "ball_l": "foot_l"}
for n in list(J):
    if n.endswith("_l"):
        r = n[:-2] + "_r"; (h, t) = J[n]; J[r] = ((-h[0], h[1], h[2]), (-t[0], t[1], t[2]))
        p = PARENT[n]; PARENT[r] = p[:-2] + "_r" if p.endswith("_l") else p
arm_d = bpy.data.armatures.new("rig"); rig = bpy.data.objects.new("rig", arm_d); scene.collection.objects.link(rig)
bpy.context.view_layer.objects.active = rig; bpy.ops.object.mode_set(mode="EDIT")
eb = arm_d.edit_bones
for n, (h, t) in J.items():
    b = eb.new(n); b.head = h; b.tail = t
    b.roll = 0.0
for n, p in PARENT.items():
    eb[n].parent = eb[p]
    if (Vector(eb[n].head) - Vector(eb[p].tail)).length < 1e-4: eb[n].use_connect = True
bpy.ops.object.mode_set(mode="OBJECT")

# ---------- skinning: inverse distance to bone segments, side-aware, top 3 bones ----------
names = list(J)
H = np.array([J[n][0] for n in names]); T = np.array([J[n][1] for n in names])
co = np.array([v.co[:] for v in me.vertices])
d = T - H; L2 = (d * d).sum(1)
t = np.clip(((co[:, None, :] - H[None]) * d[None]).sum(2) / L2[None], 0, 1)
dist = np.linalg.norm(co[:, None, :] - (H[None] + t[..., None] * d[None]), axis=2)
side = np.array([1 if n.endswith("_l") else (-1 if n.endswith("_r") else 0) for n in names])
x = co[:, 0:1]
bad = ((side[None] == 1) & (x < -0.015)) | ((side[None] == -1) & (x > 0.015))
dist[bad] = 9.0
wts = 1.0 / (dist ** 6 + 1e-12)
for n in ("ball_l", "ball_r"):  # toes follow the foot unless very close
    wts[:, names.index(n)] *= 0.5
top = np.argsort(-wts, axis=1)[:, :3]
vg = {n: body.vertex_groups.new(name=n) for n in names}
rows = np.arange(len(co))[:, None]
tw = wts[rows, top]; tw = tw / tw.sum(1, keepdims=True)
for k in range(3):
    for bi, n in enumerate(names):
        idx = np.where((top[:, k] == bi) & (tw[:, k] > 0.02))[0]
        if len(idx):
            # group by weight value is too slow; add vertex by vertex in chunks
            for i, wv in zip(idx.tolist(), tw[idx, k].tolist()):
                vg[n].add([i], wv, "REPLACE")
mod = body.modifiers.new("Armature", "ARMATURE"); mod.object = rig
body.parent = rig

# ---------- material ----------
m = bpy.data.materials.new("anat"); m.use_nodes = True
Nn, Lk = m.node_tree.nodes, m.node_tree.links
bsdf = Nn["Principled BSDF"]; bsdf.inputs["Roughness"].default_value = 0.45
if "Subsurface Weight" in bsdf.inputs:
    bsdf.inputs["Subsurface Weight"].default_value = 0.05
fa = Nn.new("ShaderNodeAttribute"); fa.attribute_name = "fib"
cx = Nn.new("ShaderNodeCombineXYZ"); Lk.new(fa.outputs["Fac"], cx.inputs["X"])
wave = Nn.new("ShaderNodeTexWave"); wave.bands_direction = "X"; wave.inputs["Scale"].default_value = 260
wave.inputs["Distortion"].default_value = 1.5; wave.inputs["Detail"].default_value = 1
Lk.new(cx.outputs["Vector"], wave.inputs["Vector"])
fib = Nn.new("ShaderNodeValToRGB")
fib.color_ramp.elements[0].color = (0.32, 0.02, 0.015, 1); fib.color_ramp.elements[1].color = (0.82, 0.10, 0.05, 1)
Lk.new(wave.outputs["Fac"], fib.inputs["Fac"])
wfib = Nn.new("ShaderNodeValToRGB")   # faint fibres on the white muscles too
wfib.color_ramp.elements[0].color = (0.50, 0.50, 0.52, 1); wfib.color_ramp.elements[1].color = (0.62, 0.62, 0.64, 1)
Lk.new(wave.outputs["Fac"], wfib.inputs["Fac"])
ga = Nn.new("ShaderNodeAttribute"); ga.attribute_name = "grp"
isbone = Nn.new("ShaderNodeMath"); isbone.operation = "LESS_THAN"; isbone.inputs[1].default_value = -0.5
Lk.new(ga.outputs["Fac"], isbone.inputs[0])
mb = Nn.new("ShaderNodeMix"); mb.data_type = "RGBA"
Lk.new(isbone.outputs[0], mb.inputs["Factor"]); Lk.new(wfib.outputs["Color"], mb.inputs["A"]); mb.inputs["B"].default_value = (0.60, 0.58, 0.54, 1)
aa = Nn.new("ShaderNodeAttribute"); aa.attribute_name = "act"
mr = Nn.new("ShaderNodeMix"); mr.data_type = "RGBA"
Lk.new(aa.outputs["Fac"], mr.inputs["Factor"]); Lk.new(mb.outputs["Result"], mr.inputs["A"]); Lk.new(fib.outputs["Color"], mr.inputs["B"])
ao = Nn.new("ShaderNodeAmbientOcclusion"); ao.inputs["Distance"].default_value = 0.03; ao.samples = 16
gm = Nn.new("ShaderNodeMapRange"); gm.inputs["To Min"].default_value = 0.35
Lk.new(ao.outputs["AO"], gm.inputs["Value"])
cc = Nn.new("ShaderNodeCombineColor")
for k in ("Red", "Green", "Blue"): Lk.new(gm.outputs["Result"], cc.inputs[k])
mul = Nn.new("ShaderNodeMix"); mul.data_type = "RGBA"; mul.blend_type = "MULTIPLY"; mul.inputs["Factor"].default_value = 1.0
Lk.new(mr.outputs["Result"], mul.inputs["A"]); Lk.new(cc.outputs["Color"], mul.inputs["B"])
Lk.new(mul.outputs["Result"], bsdf.inputs["Base Color"])
me.materials.clear(); me.materials.append(m)
for p in me.polygons: p.material_index = 0

# group names for the render script
body["groups"] = {g: GID[g] for g, _ in GROUPS}
bpy.ops.wm.save_as_mainfile(filepath=OUT, compress=True)
print("SAVED", OUT)
