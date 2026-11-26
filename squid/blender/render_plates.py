"""args after --: name[,name...] width samples [test-frames]   e.g.  hover 1600 16   or   hover 960 12 0.1,0.5,0.9
Full renders write frames/<name>/f####.png and skip frames that exist, so a stopped render resumes.
Test mode writes test/<name>_<t>.png at the given fractions of the plate."""
import sys, os, time
sys.path.insert(0, os.path.dirname(__file__))
import bpy, squidkit as K
from plates import PLATES
a = sys.argv[sys.argv.index("--") + 1:]
names, w, samples = a[0].split(","), int(a[1]), int(a[2])
tests = [float(x) for x in a[3].split(",")] if len(a) > 3 else None
here = os.path.dirname(os.path.abspath(__file__))
for name in names:
    fn, secs, step = PLATES[name]
    n = secs * 30
    K.clear(); sc = bpy.context.scene
    fn(sc, n)
    K.render_setup(sc, w, w * 9 // 16, samples, frames=(1, n))
    if tests:
        for t in tests:
            f = max(1, int(n * t)); sc.frame_set(f)
            sc.render.filepath = os.path.join(here, "test", f"{name}_{int(t * 100):02d}.png")
            bpy.ops.render.render(write_still=True)
        continue
    out = os.path.join(here, "frames", name); os.makedirs(out, exist_ok=True)
    t0 = time.time(); done = 0
    order = list(range(1, n + 1, step))
    if os.environ.get("REVERSE"): order.reverse()
    for f in order:
        p = os.path.join(out, f"f{f:04d}.png")
        if os.path.exists(p): continue
        sc.frame_set(f); sc.render.filepath = p
        bpy.ops.render.render(write_still=True)
        done += 1
        if done % 10 == 0:
            print(f"PROGRESS {name} {f}/{n} {(time.time() - t0) / done:.1f}s/frame", flush=True)
    print(f"DONE {name}", flush=True)
print("ALL DONE", flush=True)
