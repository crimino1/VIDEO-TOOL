"""Final-look stills. args after --: exercise res samples t1,t2,... [cx cy cz tx ty tz lens]"""
import bpy, sys, time
from pathlib import Path
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
import room, rigkit, exercises, scene_setup
a = sys.argv[sys.argv.index("--") + 1:]
name, res, samples, times = a[0], int(a[1]), int(a[2]), [float(v) for v in a[3].split(",")]
scene = bpy.context.scene
body = rigkit.Body(bpy.data.objects["rig"])
fn, dur, spec = exercises.get(name)
spec = dict(spec)
if len(a) > 4:
    v = [float(x) for x in a[4:11]]; spec["cam"] = (tuple(v[:3]), tuple(v[3:6]), v[6])
scene_setup.place(spec, scene_setup.base())
room.eevee(scene, res * 16 // 9, res, samples)
for t in times:
    fn(body, t); bpy.context.view_layer.update()
    scene.render.filepath = str(HERE / "out" / f"look_{name}_{t:05.2f}.png")
    s = time.time(); bpy.ops.render.render(write_still=True); print("RENDER", t, round(time.time() - s, 1))
