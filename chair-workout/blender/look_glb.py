import bpy, sys, math
from mathutils import Vector
sys.path.insert(0, r"C:\Users\daggu222105\VIDEO-TOOL\chair-workout\blender"); import room
for o in list(bpy.data.objects): bpy.data.objects.remove(o, do_unlink=True)
bpy.ops.import_scene.gltf(filepath=sys.argv[-2])
sc = bpy.context.scene; sc.render.engine = "BLENDER_WORKBENCH"; sc.display.shading.light = "STUDIO"; sc.display.shading.show_cavity = True
sc.render.resolution_x, sc.render.resolution_y = 1600, 900
cd = bpy.data.cameras.new("c"); cam = bpy.data.objects.new("c", cd); sc.collection.objects.link(cam); sc.camera = cam
cd.type = "ORTHO"; cd.ortho_scale = 3.9
out = sys.argv[-1]
for name, loc in (("front", (0, -5, 0)), ("side", (5, 0, 0)), ("q", (3.5, -3.5, 0.6))):
    cam.location = loc; cam.location = (loc[0], loc[1], loc[2] - 0.02); room.aim(cam, (0, 0, -0.02))
    sc.render.filepath = out + f"_{name}.png"; bpy.ops.render.render(write_still=True)
