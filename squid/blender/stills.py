"""Side-view cutouts with transparent background for the 2D scenes: args after -- out_dir"""
import sys, os, math
sys.path.insert(0, os.path.dirname(__file__))
import bpy, squidkit as K, models as M
out = sys.argv[sys.argv.index("--") + 1]
os.makedirs(out, exist_ok=True)


def shoot(name, setup, ortho, center, w=2400, h=1000, frame=40):
    K.clear(); sc = bpy.context.scene
    K.deep_world(sc, tint=(0.02, 0.03, 0.05), haze=0)
    setup()
    cd = bpy.data.cameras.new("cam"); cd.type = "ORTHO"; cd.ortho_scale = ortho
    cam = bpy.data.objects.new("cam", cd); sc.collection.objects.link(cam)
    cam.location = (center[0], -30, center[1]); cam.rotation_euler = (math.pi / 2, 0, 0); sc.camera = cam
    K.area((center[0] - 3, -12, center[1] + 10), (center[0], 0, center[1]), 9000, 12, (1, 0.97, 0.92))
    K.area((center[0] + 6, 10, center[1] + 4), (center[0], 0, center[1]), 4000, 10, (0.5, 0.7, 1.0))
    K.render_setup(sc, w, h, 32, frames=(1, 100))
    sc.render.film_transparent = True
    sc.render.image_settings.color_mode = "RGBA"
    sc.frame_set(frame)
    sc.render.filepath = os.path.join(out, name + ".png")
    bpy.ops.render.render(write_still=True)


def colossal():
    sq = K.build_squid(spread=0.06, speed=0.4, arm_len=1.5, tent_len=2.2)
    sq.rotation_euler = (math.pi / 2, 0, 0)  # side on, eye toward camera


def giant():
    sq = K.build_squid(spread=0.04, speed=0.4, mantle=2.0, arm_len=2.6, tent_len=9.0)
    sq.scale = (1, 0.55, 0.55)
    sq.rotation_euler = (math.pi / 2, 0, 0)


def whale():
    wh = M.build_whale(speed=0.0001)
    wh.rotation_euler = (0, 0, 0)


shoot("colossal_side", colossal, 6.4, (-0.2, 0), 2600, 1000)
# shoot("giant_side", giant, 13.5, (-3.6, 0), 3000, 900)
# shoot("sperm_side", whale, 17, (7.8, 0), 2600, 1000)
print("STILLS DONE")
