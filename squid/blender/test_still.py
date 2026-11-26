"""Look test: args after --: out.png width samples frame"""
import sys, os, time
sys.path.insert(0, os.path.dirname(__file__))
import bpy, squidkit as K
a = sys.argv[sys.argv.index("--") + 1:]
out, w, samples, fr = a[0], int(a[1]), int(a[2]), int(a[3])
K.clear()
sc = bpy.context.scene
K.deep_world(sc)
sq = K.build_squid(spread=0.3)
sq.rotation_euler = (0, 0, 0.5)
K.marine_snow(sc, count=1500)
K.plankton(sc, count=300)
K.camera((-1.2, -5.2, 1.2), (0.3, 0, 0), lens=35, fstop=5.6)
K.spot((-2.5, -4.0, 2.5), (0, 0, 0), energy=1500, size_deg=35)
K.area((2.5, 3, 1.5), (0, 0, 0), energy=120, color=(0.3, 0.5, 1.0))
K.render_setup(sc, w, w * 9 // 16, samples, frames=(1, 300))
sc.frame_set(fr)
sc.render.filepath = out
t = time.time()
bpy.ops.render.render(write_still=True)
print("RENDER_TIME", round(time.time() - t, 1))
