"""Sample render: seated knee raise with hands behind the head, abs/obliques/quads lit red. Transparent PNG.
blender -b figure.blend --python sample_still.py -- <out.png> [w h samples]"""
import bpy, sys, time
from pathlib import Path
from mathutils import Vector
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
from rigkit import Body
import room

args = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
OUT = args[0] if args else str(HERE / "out" / "sample.png")
W, H, S = (int(args[1]), int(args[2]), int(args[3])) if len(args) >= 4 else (1920, 1080, 32)

scene = bpy.context.scene
rig, body, chair = bpy.data.objects["rig"], bpy.data.objects["body"], bpy.data.objects["chair"]

def set_muscles(names, level=1.0):
    me = body.data
    vals = [0.0] * len(me.vertices)
    for n in names:
        src = [0.0] * len(me.vertices); me.attributes["m_" + n].data.foreach_get("value", src)
        vals = [max(a, b * level) for a, b in zip(vals, src)]
    me.attributes["active"].data.foreach_set("value", vals); me.update()

# ---- pose: sitting near the front of the seat, right knee up, hands behind the head
b = Body(rig)
SEAT_TOP = 0.483
b.hips((0, -0.02, SEAT_TOP + 0.10), pitch=4)
b.spine(pitch=-2, neck=-2, head=-3)
for s, sx in (("l", 1), ("r", -1)):
    up = s == "r"
    ankle = (sx * 0.13, -0.36 if up else -0.47, 0.33 if up else 0.085)
    b.foot(s, ankle, pitch=-15 if up else 0, knee=(sx * 0.15, -1.2, 1.0 if up else 0.6))
    b.shoulder(s, up=3)
    sh = b.pos(f"upperarm_{s}")
    b.hand(s, sh + Vector((sx * 0.56, -0.06, 0.02)), elbow=sh + Vector((sx * 0.3, 0.2, -0.3)), up=(sx, -0.1, 0))
    b.curl(s, 6)
bpy.context.view_layer.update()
set_muscles(["abs", "obliques", "quads", "shoulders"])

# ---- light, camera, render
for o in list(bpy.data.objects):
    if o.type in ("LIGHT", "CAMERA"): bpy.data.objects.remove(o, do_unlink=True)
def light(name, loc, energy, size, color=(1, 1, 1)):
    d = bpy.data.lights.new(name, "AREA"); d.energy = energy; d.size = size; d.color = color
    o = bpy.data.objects.new(name, d); scene.collection.objects.link(o); o.location = loc
    room.aim(o, (0, 0, 0.8)); return o
light("key", (-1.6, -2.2, 2.5), 260, 1.4, (1.0, 0.97, 0.93))
light("fill", (2.2, -1.4, 1.3), 70, 3.0, (0.92, 0.95, 1.0))
light("rim", (1.2, 2.0, 2.2), 300, 1.0)
w = bpy.data.worlds.new("w") if not scene.world else scene.world
scene.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Color"].default_value = (0.55, 0.57, 0.6, 1)
w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.18
cam = room.build_camera((-1.55, -3.75, 1.12), (0.0, -0.10, 0.70), 41)
room.eevee(scene, W, H, S)
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"; scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"; scene.view_settings.look = "Medium High Contrast"; scene.view_settings.exposure = -1.1
scene.render.filepath = OUT
t = time.time(); bpy.ops.render.render(write_still=True); print("RENDER SECONDS", round(time.time() - t, 1))
