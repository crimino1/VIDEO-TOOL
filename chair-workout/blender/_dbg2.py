"""Sample still of the Z-Anatomy figure: seated knee raise, arms out; abs/obliques/quads/hip flexors/shoulders lit.
blender -b za_figure.blend --python za_sample.py -- <out.png> [w h samples]"""
import bpy, sys, time
from pathlib import Path
from mathutils import Vector
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
from rigkit import Body
import room

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = args[0]
W, H, S = (int(args[1]), int(args[2]), int(args[3])) if len(args) >= 4 else (1920, 1080, 48)
scene = bpy.context.scene
rig, body = bpy.data.objects["rig"], bpy.data.objects["body"]

# chair from the first figure file
if "chair" not in bpy.data.objects:
    with bpy.data.libraries.load(str(HERE / "figure.blend")) as (src, dst):
        dst.objects = ["chair"]
    scene.collection.objects.link(dst.objects[0])

def set_muscles(names):
    ids = {body["groups"][n] for n in names}
    me = body.data; g = [0] * len(me.polygons); me.attributes["grp"].data.foreach_get("value", g)
    me.attributes["act"].data.foreach_set("value", [1.0 if x in ids else 0.0 for x in g]); me.update()

SEAT_TOP = 0.483
b = Body(rig)
b.hips((0, -0.03, SEAT_TOP + 0.085 + 0.043), pitch=3)
b.spine(pitch=-2, neck=-2, head=-2)
for s, sx in (("l", 1), ("r", -1)):
    up = s == "r"
    ankle = (sx * 0.12, -0.33 if up else -0.42, 0.30 if up else 0.07)
    b.foot(s, ankle, pitch=-15 if up else 0, knee=(sx * 0.14, -1.2, 1.0 if up else 0.6))
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, sh + Vector((sx * 0.52, -0.05, 0.02)), elbow=sh + Vector((sx * 0.3, 0.2, -0.3)), up=(sx, -0.1, 0))
bpy.context.view_layer.update()
set_muscles(["abs", "obliques", "quads", "hipflexors", "shoulders"])

for o in list(bpy.data.objects):
    if o.type in ("LIGHT", "CAMERA"): bpy.data.objects.remove(o, do_unlink=True)
def light(name, loc, energy, size, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, "AREA"); d.energy = energy; d.size = size; d.color = color
    o = bpy.data.objects.new(name, d); scene.collection.objects.link(o); o.location = loc
    room.aim(o, (0, 0, 0.8)); return o
light("key", (-1.6, -2.2, 2.5), 260, 1.4, (1.0, 0.97, 0.93))
light("fill", (2.2, -1.4, 1.3), 70, 3.0, (0.92, 0.95, 1.0))
light("rim", (1.2, 2.0, 2.2), 300, 1.0)
w = scene.world or bpy.data.worlds.new("w"); scene.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.55, 0.57, 0.6, 1)
w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.18
room.build_camera((-1.45, -3.55, 1.08), (0.0, -0.10, 0.68), 41)
room.eevee(scene, W, H, S); scene.render.use_freestyle = False; scene.render.use_compositing = False; scene.render.engine = "BLENDER_WORKBENCH"; print("PASSES", scene.view_layers[0].use_pass_combined, scene.render.use_border, scene.render.border_min_x, scene.render.border_max_x, scene.render.use_crop_to_border, scene.render.resolution_percentage, scene.camera.data.clip_start, scene.camera.data.clip_end, scene.camera.data.type)
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"; scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"; scene.view_settings.look = "Medium High Contrast"; scene.view_settings.exposure = -0.9
scene.render.filepath = OUT
t = time.time(); bpy.ops.render.render(write_still=True); print("RENDER SECONDS", round(time.time() - t, 1))
