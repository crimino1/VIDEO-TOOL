"""Render Alien Anatoly poses as transparent stills.
blender -b aa_figure.blend --python aa_render.py -- <out_dir> <pose,pose|all> [w h]"""
import bpy, sys
from pathlib import Path
sys.path.insert(0, str(Path(bpy.data.filepath).parent))
sys.path.insert(0, r"C:\Users\daggu222105\VIDEO-TOOL\chair-workout\blender")
from mathutils import Vector
from rigkit import Body
import room, aa_poses
a = sys.argv[sys.argv.index("--") + 1:]
OUT = Path(a[0]); names = list(aa_poses.POSES) if a[1] == "all" else a[1].split(",")
W, H = (int(a[2]), int(a[3])) if len(a) > 3 else (1080, 1350)
scene = bpy.data.scenes.new("aa")
rig, body = bpy.data.objects["rig"], bpy.data.objects["body"]
for o in (rig, body): scene.collection.objects.link(o)
kd = bpy.data.lights.new("key", "SUN"); kd.energy = 3.2; kd.angle = 0.05; kd.use_shadow = False   # the outline hull would shadow the body
key = bpy.data.objects.new("key", kd); scene.collection.objects.link(key)
w = bpy.data.worlds.new("w"); scene.world = w; w.use_nodes = True
w.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.0
cd = bpy.data.cameras.new("cam"); cam = bpy.data.objects.new("cam", cd); scene.collection.objects.link(cam); scene.camera = cam
scene.render.engine = "BLENDER_EEVEE"; scene.eevee.taa_render_samples = 16
scene.render.resolution_x, scene.render.resolution_y = W, H
scene.view_settings.view_transform = "Standard"; scene.view_settings.look = "None"
scene.render.film_transparent = True
scene.render.image_settings.file_format = "PNG"; scene.render.image_settings.color_mode = "RGBA"
# Freestyle ink: outer contour + silhouettes (arm over chest), no crease noise
scene.render.use_freestyle = False; scene.render.line_thickness_mode = "ABSOLUTE"; scene.render.line_thickness = H / 560
vl = scene.view_layers[0]; vl.use_freestyle = True
fs = vl.freestyle_settings; fs.crease_angle = 2.0
ls = fs.linesets[0] if fs.linesets else fs.linesets.new("ink")
ls.select_by_visibility = True; ls.select_by_edge_types = True
for k in ("select_silhouette", "select_border", "select_external_contour"): setattr(ls, k, True)
for k in ("select_crease", "select_contour", "select_material_boundary", "select_suggestive_contour", "select_ridge_valley", "select_edge_mark"): setattr(ls, k, False)
ls.linestyle.color = (0.02, 0.03, 0.02); ls.linestyle.thickness = H / 560; ls.linestyle.thickness_position = "CENTER"
OUT.mkdir(parents=True, exist_ok=True)
FPS = 24
jobs = []
for n in names:
    if n in aa_poses.ANIMS:
        fn, T, cs = aa_poses.ANIMS[n]
        jobs += [(f"{n}/{f:04d}", (lambda b, fn=fn, t=f / FPS: fn(b, t)), cs) for f in range(round(T * FPS))]
    else:
        fn, cs = aa_poses.POSES[n]; jobs.append((n, fn, cs))
for n, fn, (loc, tgt, lens) in jobs:
    b = Body(rig); fn(b)
    cam.location = loc; room.aim(cam, tgt); cd.lens = lens
    key.location = Vector(loc).normalized().cross(Vector((0, 0, 1))) * 4 + Vector(loc) * 0.4 + Vector((0, 0, 3.0)); room.aim(key, (0, 0, 0.9))   # key from camera-left, above
    bpy.context.view_layer.update()
    scene.render.filepath = str(OUT / f"{n}.png")
    bpy.ops.render.render(write_still=True, scene=scene.name)
    print("DONE", n, flush=True)
