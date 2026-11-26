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
old = bpy.context.scene
scene = bpy.data.scenes.new("work")   # fresh scene: the atlas scene carries settings that blank EEVEE
rig, body = bpy.data.objects["rig"], bpy.data.objects["body"]
for o in (rig, body): scene.collection.objects.link(o)

# chair from the first figure file
if False:
    with bpy.data.libraries.load(str(HERE / "figure.blend")) as (src, dst):
        dst.objects = ["chair"]
    scene.collection.objects.link(dst.objects[0])

def set_muscles(names):
    ids = {body["groups"][n] for n in names}
    me = body.data
    if me.attributes["grp"].domain == "POINT":
        g = [0.0] * len(me.vertices); me.attributes["grp"].data.foreach_get("value", g)
        act = [1.0 if round(x) in ids else 0.0 for x in g]
        import bmesh as _bm
        b_ = _bm.new(); b_.from_mesh(me); b_.verts.ensure_lookup_table()
        nb = [[e.other_vert(v).index for e in v.link_edges] for v in b_.verts]; b_.free()
        for _ in range(3):   # soft border -> smooth red outline after the shader threshold
            act = [(act[i] * 2 + sum(act[j] for j in nb[i])) / (2 + len(nb[i])) for i in range(len(act))]
        me.attributes["act"].data.foreach_set("value", act)
    else:
        g = [0] * len(me.polygons); me.attributes["grp"].data.foreach_get("value", g)
        me.attributes["act"].data.foreach_set("value", [1.0 if x in ids else 0.0 for x in g])
    me.update()

rig.data.pose_position = 'REST'
set_muscles(["chest", "abs", "biceps", "quads"])

for o in list(bpy.data.objects):
    if o.type in ("LIGHT", "CAMERA"): bpy.data.objects.remove(o, do_unlink=True)
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
cd = bpy.data.cameras.new("cam"); cd.lens = 41; cam = bpy.data.objects.new("cam", cd); scene.collection.objects.link(cam)
cam.location = (-0.35, -1.2, 1.62); room.aim(cam, (0.0, 0.0, 1.62)); scene.camera = cam
room.eevee(scene, W, H, S); scene.render.use_freestyle = False; scene.render.use_compositing = False; scene.render.use_sequencer = False
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"; scene.render.image_settings.color_mode = "RGBA"
scene.view_settings.view_transform = "Standard"; scene.view_settings.look = "Medium High Contrast"; scene.view_settings.exposure = -0.9
scene.render.filepath = OUT
t = time.time(); bpy.ops.render.render(write_still=True, scene=scene.name); print("RENDER SECONDS", round(time.time() - t, 1))
