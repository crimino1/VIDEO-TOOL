import sys, os
sys.path.insert(0, os.path.dirname(__file__))
import bpy, squidkit as K, models as M
out = sys.argv[sys.argv.index("--") + 1]
K.clear(); sc = bpy.context.scene
K.deep_world(sc, tint=(0.01, 0.02, 0.04), haze=0)
wh = M.build_whale(); wh.location = (-2, 4, 0)
sub, _ = M.build_sub(); sub.location = (-1, -4, 0)
K.camera((7, -22, 5), (6, 0, 0), lens=30)
K.area((5, -10, 10), (6, 0, 0), energy=6000, size=8, color=(1, 1, 1))
K.render_setup(sc, 960, 540, 16, frames=(1, 60)); sc.frame_set(10)
sc.render.filepath = out; bpy.ops.render.render(write_still=True)
