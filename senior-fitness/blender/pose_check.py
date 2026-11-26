"""Fast contact frames for checking movements. args after --: name,name,... (or all)"""
import bpy, sys
from pathlib import Path
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
import room, rigkit, exercises, scene_setup
names = sys.argv[sys.argv.index("--") + 1]
names = list(exercises.EXERCISES) if names == "all" else names.split(",")
scene = bpy.context.scene
body = rigkit.Body(bpy.data.objects["rig"])
chair = scene_setup.base()
scene.render.engine = "BLENDER_EEVEE"
scene.eevee.taa_render_samples = 4
scene.render.resolution_x, scene.render.resolution_y = 480, 270
cam = None
for name in names:
    fn, dur, spec = exercises.get(name)
    cam = scene_setup.place(spec, chair, cam)
    for i in range(8):
        fn(body, dur * i / 8); bpy.context.view_layer.update()
        scene.render.filepath = str(HERE / "out" / f"pose_{name}_{i}.png")
        bpy.ops.render.render(write_still=True)
    print("POSED", name)
