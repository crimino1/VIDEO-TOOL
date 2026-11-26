"""Final frames. args after --: name,name,... res samples. Existing frames are skipped, so it can resume."""
import bpy, sys, time, math
from pathlib import Path
HERE = Path(bpy.data.filepath).parent
sys.path.insert(0, str(HERE))
import room, rigkit, exercises, scene_setup
a = sys.argv[sys.argv.index("--") + 1:]
names, res, samples = a[0].split(","), int(a[1]), int(a[2])
FPS = 24
scene = bpy.context.scene
body = rigkit.Body(bpy.data.objects["rig"])
chair = scene_setup.base()
room.eevee(scene, res * 16 // 9, res, samples)
cam = None
for name in names:
    fn, dur, spec = exercises.get(name)
    cam = scene_setup.place(spec, chair, cam)
    out = HERE / "frames" / name; out.mkdir(parents=True, exist_ok=True)
    n = max(1, round(dur * FPS))
    start = time.time(); done = 0
    for f in range(n):
        path = out / f"{f:04d}.png"
        if path.exists(): continue
        fn(body, f / FPS); bpy.context.view_layer.update()
        scene.render.filepath = str(path)
        bpy.ops.render.render(write_still=True); done += 1
        if done % 12 == 1: print(f"PROGRESS {name} {f + 1}/{n} {(time.time() - start) / done:.1f}s/frame", flush=True)
    print(f"DONE {name} {n} frames", flush=True)
print("ALL DONE", flush=True)
