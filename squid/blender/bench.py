import sys, os, time
sys.path.insert(0, os.path.dirname(__file__))
import bpy, squidkit as K
a = sys.argv[sys.argv.index("--") + 1:]
w, samples, haze = int(a[0]), int(a[1]), float(a[2])
K.clear(); sc = bpy.context.scene
K.deep_world(sc, haze=haze)
sq = K.build_squid(spread=0.3); sq.rotation_euler = (0, 0, 0.5)
K.marine_snow(sc, count=1500); K.plankton(sc, count=300)
K.camera((-1.2, -5.2, 1.2), (0.3, 0, 0), lens=35, fstop=5.6)
K.spot((-2.5, -4.0, 2.5), (0, 0, 0), energy=1500, size_deg=35)
K.area((2.5, 3, 1.5), (0, 0, 0), energy=120, color=(0.3, 0.5, 1.0))
K.render_setup(sc, w, w * 9 // 16, samples, frames=(1, 6))
sc.render.filepath = "//test/bench/f"
t = time.time(); bpy.ops.render.render(animation=True); print("PERFRAME", w, samples, haze, round((time.time() - t) / 6, 2))
