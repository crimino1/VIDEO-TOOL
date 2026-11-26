"""Render exercise loops of the user's model as transparent PNG frames (resumable: existing frames are skipped).
blender -b um_auto.blend --python render_ex.py -- <out_dir> <names,comma|all> [samples] [w h] [--test]
--test renders 4 frames per exercise at low resolution with Workbench for a quick pose check."""
import bpy, sys, os, time, math
from pathlib import Path
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
import importlib, room, chair_ex
from rigkit import Body
args = sys.argv[sys.argv.index("--") + 1:]
OUT = Path(args[0]); NAMES = chair_ex.ORDER + ["idle"] if args[1] == "all" else args[1].split(",")
S = int(args[2]) if len(args) > 2 and not args[2].startswith("--") else 32
W, H = (int(args[3]), int(args[4])) if len(args) > 4 and not args[3].startswith("--") else (1920, 1080)
TEST = "--test" in args; PEEK = "--peek" in args
FPS = 30

scene = bpy.data.scenes.new("work")
rig, body = bpy.data.objects["rig"], bpy.data.objects["body"]
for o in (rig, body): scene.collection.objects.link(o)
with bpy.data.libraries.load(str(HERE / "figure.blend")) as (src, dst):
    dst.objects = ["chair"]
chair = dst.objects[0]; scene.collection.objects.link(chair)
chair.scale = (1.0, 1.0, 0.87); chair.location = (0, 0.02, 0)
CHAIR_OBJS = [chair] + list(chair.children_recursive)
for o in CHAIR_OBJS[1:]:
    if o.name not in scene.collection.objects: scene.collection.objects.link(o)

def _mat(name, col, rough):
    m = bpy.data.materials.new(name); m.use_nodes = True
    bs = m.node_tree.nodes["Principled BSDF"]; bs.inputs["Base Color"].default_value = (*col, 1); bs.inputs["Roughness"].default_value = rough
    return m
# exercise mat for floor moves (shown only in floor mode)
bpy.ops.mesh.primitive_cube_add(size=1); mat_o = bpy.context.active_object
mat_o.scale = (2.0, 0.68, 0.008); mat_o.location = (0.30, 0.0, 0.004)
bv = mat_o.modifiers.new("b", "BEVEL"); bv.width = 0.003; bv.segments = 2
mat_o.data.materials.append(_mat("yogamat", tuple(float(x) for x in os.environ.get("MAT_COL", "0.10,0.16,0.17").split(",")), 0.8))
for c in list(mat_o.users_collection): c.objects.unlink(mat_o)
scene.collection.objects.link(mat_o)
# shadow catcher: a floor plane that is transparent except where shadow falls
bpy.ops.mesh.primitive_plane_add(size=12, location=(0, 0, 0.0)); catcher = bpy.context.active_object
cm = bpy.data.materials.new("catcher"); cm.use_nodes = True; nt = cm.node_tree; N_, L_ = nt.nodes, nt.links
N_.clear()
dif = N_.new("ShaderNodeBsdfDiffuse"); s2r = N_.new("ShaderNodeShaderToRGB"); bw = N_.new("ShaderNodeRGBToBW")
mr = N_.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = float(os.environ.get("SHADOW_LO", "0.4")); mr.inputs["From Max"].default_value = float(os.environ.get("SHADOW_HI", "2.2"))
mr.inputs["To Min"].default_value = float(os.environ.get("SHADOW_MAX", "0.75")); mr.inputs["To Max"].default_value = 0.0
tr = N_.new("ShaderNodeBsdfTransparent"); em = N_.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (0.02, 0.012, 0.006, 1)
mx = N_.new("ShaderNodeMixShader"); out = N_.new("ShaderNodeOutputMaterial")
L_.new(dif.outputs[0], s2r.inputs[0]); L_.new(s2r.outputs["Color"], bw.inputs[0]); L_.new(bw.outputs[0], mr.inputs["Value"])
tco = N_.new("ShaderNodeTexCoord"); dist = N_.new("ShaderNodeVectorMath"); dist.operation = "DISTANCE"
fade = N_.new("ShaderNodeMapRange"); fade.inputs["From Min"].default_value = 0.8; fade.inputs["From Max"].default_value = 1.7
fade.inputs["To Min"].default_value = 1.0; fade.inputs["To Max"].default_value = 0.0
mul = N_.new("ShaderNodeMath"); mul.operation = "MULTIPLY"
L_.new(tco.outputs["Object"], dist.inputs[0]); L_.new(dist.outputs["Value"], fade.inputs["Value"])
L_.new(mr.outputs["Result"], mul.inputs[0]); L_.new(fade.outputs["Result"], mul.inputs[1])
CATCH_CENTER = dist.inputs[1]
L_.new(mul.outputs[0], mx.inputs[0]); L_.new(tr.outputs[0], mx.inputs[1]); L_.new(em.outputs[0], mx.inputs[2]); L_.new(mx.outputs[0], out.inputs[0])
if os.environ.get("CATCH_DEBUG"):
    L_.new(s2r.outputs["Color"], em.inputs["Color"]); L_.new(em.outputs[0], out.inputs[0])
if hasattr(cm, "surface_render_method"): cm.surface_render_method = "BLENDED"
catcher.data.materials.append(cm)
for c in list(catcher.users_collection): c.objects.unlink(catcher)
scene.collection.objects.link(catcher)
catcher.hide_render = os.environ.get("CATCHER", "1") != "1"

# bed for lying moves (BED=1): mattress top at the mat height, so every floor pose works unchanged
BED = os.environ.get("BED") == "1"; bed_objs = []
if BED:
    def box(name, size, loc, mat, bevel=0.0, seg=3):
        bpy.ops.mesh.primitive_cube_add(size=1); o = bpy.context.active_object; o.name = name
        o.scale = size; o.location = loc
        if bevel: bm_ = o.modifiers.new("b", "BEVEL"); bm_.width = bevel; bm_.segments = seg
        o.data.materials.append(mat)
        for c in list(o.users_collection): c.objects.unlink(o)
        scene.collection.objects.link(o); bed_objs.append(o); return o
    sheet = _mat("sheet", tuple(float(x) for x in os.environ.get("SHEET_COL", "0.80,0.78,0.74").split(",")), 0.85)
    st_ = sheet.node_tree.nodes; nz = st_.new("ShaderNodeTexNoise"); nz.inputs["Scale"].default_value = 60.0; bp = st_.new("ShaderNodeBump"); bp.inputs["Strength"].default_value = 0.08
    sheet.node_tree.links.new(nz.outputs["Fac"], bp.inputs["Height"]); sheet.node_tree.links.new(bp.outputs["Normal"], st_["Principled BSDF"].inputs["Normal"])
    frame_m = _mat("bedframe", tuple(float(x) for x in os.environ.get("FRAME_COL", "0.20,0.13,0.08").split(",")), 0.55)
    blanket = _mat("blanket", tuple(float(x) for x in os.environ.get("BLANKET_COL", "0.36,0.42,0.48").split(",")), 0.9)
    BZ = MAT_TOP = 0.008
    box("mattress", (2.18, 1.50, 0.24), (0.21, 0.0, BZ - 0.12), sheet, 0.05, 4)
    box("base", (2.24, 1.56, 0.20), (0.21, 0.0, BZ - 0.24 - 0.10), frame_m, 0.01)
    box("headboard", (0.07, 1.62, 0.95), (-0.92, 0.0, BZ - 0.44 + 0.475), frame_m, 0.02)
    # no folded blanket: straight legs reach the foot of the bed and went through it
    for x_ in (-0.86, 1.28):
        for y_ in (-0.72, 0.72): box("leg", (0.06, 0.06, 0.10), (x_, y_, BZ - 0.44 - 0.05 + 0.0), frame_m)

import bmesh
me = body.data
b_ = bmesh.new(); b_.from_mesh(me); b_.verts.ensure_lookup_table()
NB = [[e.other_vert(v).index for e in v.link_edges] for v in b_.verts]; b_.free()
GRP = [0.0] * len(me.vertices); me.attributes["grp"].data.foreach_get("value", GRP)
def set_muscles(names):
    ids = {body["groups"][n] for n in names}
    act = [1.0 if round(x) in ids else 0.0 for x in GRP]
    for _ in range(9):
        act = [(act[i] * 2 + sum(act[j] for j in NB[i])) / (2 + len(NB[i])) for i in range(len(act))]
    me.attributes["act"].data.foreach_set("value", act); me.update()

def light(name, loc, energy, size, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, "AREA"); d.energy = energy; d.size = size; d.color = color
    o = bpy.data.objects.new(name, d); scene.collection.objects.link(o); o.location = loc
    room.aim(o, (0, 0, 0.8)); return o
light("key", (-1.6, -2.2, 2.5), 260, 1.4, (1.0, 0.97, 0.93))
light("fill", (2.2, -1.4, 1.3), 70, 3.0, (0.92, 0.95, 1.0))
light("rim", (1.2, 2.0, 2.2), 300, 1.0)
w = bpy.data.worlds.new("w"); scene.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.55, 0.57, 0.6, 1)
w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.18
if os.environ.get("HDRI"):            # image-based light: soft, realistic fill and reflections
    wn = w.node_tree.nodes; env = wn.new("ShaderNodeTexEnvironment"); env.image = bpy.data.images.load(os.environ["HDRI"])
    mp = wn.new("ShaderNodeMapping"); tc = wn.new("ShaderNodeTexCoord"); mp.inputs["Rotation"].default_value[2] = math.radians(float(os.environ.get("HDRI_ROT", "0")))
    w.node_tree.links.new(tc.outputs["Generated"], mp.inputs["Vector"]); w.node_tree.links.new(mp.outputs["Vector"], env.inputs["Vector"])
    w.node_tree.links.new(env.outputs["Color"], wn["Background"].inputs["Color"])
    wn["Background"].inputs["Strength"].default_value = float(os.environ.get("HDRI_STR", "0.55"))
    for lo in scene.collection.objects:
        if lo.type == "LIGHT" and lo.name.startswith("fill"): lo.data.energy *= 0.35
cd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", cd); scene.collection.objects.link(cam); scene.camera = cam
CAMS = {False: ((-1.75, -3.35, 1.0), (0.0, -0.14, 0.66), 41), True: ((-1.75, -3.55, 1.1), (0.0, -0.18, 0.86), 33),
        "floor": ((-0.55, -3.3, 1.45), (0.12, 0.0, 0.18), 36)}
if TEST:
    scene.render.engine = "BLENDER_WORKBENCH"; scene.display.shading.light = "STUDIO"; scene.display.shading.color_type = "ATTRIBUTE" if False else "MATERIAL"
    scene.render.resolution_x, scene.render.resolution_y = W, H
else:
    room.eevee(scene, W, H, S)
    if os.environ.get("RT") == "0" and hasattr(scene.eevee, "use_raytracing"): scene.eevee.use_raytracing = False
    if os.environ.get("FAST_SHADOW") == "1":
        for k, v in (("shadow_ray_count", 1), ("shadow_step_count", 4)):
            if hasattr(scene.eevee, k): setattr(scene.eevee, k, v)
    vt = os.environ.get("VIEW", "AgX|AgX - Punchy|-0.6").split("|")   # before 2026-11-12: Standard|Medium High Contrast|-0.9
    scene.view_settings.view_transform = vt[0]; scene.view_settings.look = vt[1]; scene.view_settings.exposure = float(vt[2])
scene.render.use_freestyle = False; scene.render.use_compositing = False; scene.render.use_sequencer = False
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"; scene.render.image_settings.color_mode = "RGBA"

from batch6_ex import EXTRA
for name in NAMES:
    fn, T, muscles, standing, _ = chair_ex.EXERCISES[name]
    loc, tgt, lens = CAMS[standing]
    floor = standing == "floor"
    ex = EXTRA.get(name, {})
    for o in CHAIR_OBJS: o.hide_render = floor or (standing is True and not name.startswith("sit_to_stand")) or (os.environ.get("NO_CHAIR") == "1")
    chair.location = (0, 0.02, 0); chair.rotation_euler = (0, 0, 0)
    if "chair" in ex:
        (cx, cy, cz), rz = ex["chair"]
        for o in CHAIR_OBJS: o.hide_render = False
        chair.location = (cx, cy, cz)                 # world position and z rotation (degrees)
        chair.rotation_euler = (0, 0, math.radians(rz))
    if "cam" in ex: loc, tgt, lens = ex["cam"]
    mat_o.hide_render = not floor or BED
    for o in bed_objs: o.hide_render = not floor
    catcher.location.z = -0.54 if (BED and floor) else 0.0
    CATCH_CENTER.default_value = {"floor": (0.3, 0, 0), True: (0, -0.3, 0), False: (0, -0.15, 0)}[standing]
    if os.environ.get("LOOK_CAM"): loc, tgt, lens = eval(os.environ["LOOK_CAM"])
    cam.location = loc; room.aim(cam, tgt); cd.lens = lens
    set_muscles(muscles)
    n = max(1, round(T * FPS)) if name != "idle" else 1
    PN = int(os.environ.get("PEEK_N", "4")); frames = [i * n // PN for i in range(PN)] if TEST or PEEK else range(n)
    d = OUT / name; d.mkdir(parents=True, exist_ok=True)
    t0 = time.time()
    for f in frames:
        path = d / f"{f:04d}.png"
        if path.exists() and not (TEST or PEEK): continue
        import rigkit
        rigkit.BREATH = (f / FPS, n / FPS) if os.environ.get("BREATH", "1") == "1" and name != "idle" else None
        b = Body(rig)
        fn(b, f / FPS)
        bpy.context.view_layer.update()
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True, scene=scene.name)
    print("DONE", name, len(list(frames)), "frames", round(time.time() - t0, 1), "s", flush=True)
