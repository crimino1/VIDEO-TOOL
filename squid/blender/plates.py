"""3D plates for the colossal squid film. Each plate builds one scene; render_plates.py renders it.
PLATES[name] = (setup_function, seconds, frame_step). frame_step 2 renders every other frame (15 fps), later blended to 30."""
import math, random
import bpy
from mathutils import Vector
import squidkit as K
import models as M


def node_world_gradient(sc, top=(0.02, 0.10, 0.16), bottom=(0.0, 0.002, 0.005), haze=0.03):
    """World that is lighter looking up, black looking down."""
    w = bpy.data.worlds.new("grad"); sc.world = w; w.use_nodes = True
    N, L = w.node_tree.nodes, w.node_tree.links
    tc = N.new("ShaderNodeTexCoord"); sep = N.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Generated"], sep.inputs[0])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].position = 0.35; ramp.color_ramp.elements[0].color = (*bottom, 1)
    ramp.color_ramp.elements[1].position = 1.0; ramp.color_ramp.elements[1].color = (*top, 1)
    mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = -1; mr.inputs["From Max"].default_value = 1
    L.new(sep.outputs["Z"], mr.inputs["Value"]); L.new(mr.outputs["Result"], ramp.inputs["Fac"])
    L.new(ramp.outputs["Color"], N["Background"].inputs["Color"])
    if haze:
        vs = N.new("ShaderNodeVolumeScatter"); vs.inputs["Density"].default_value = haze
        vs.inputs["Color"].default_value = (0.4, 0.7, 1.0, 1); vs.inputs["Anisotropy"].default_value = 0.6
        L.new(vs.outputs[0], N["World Output"].inputs["Volume"])
    return w, ramp


def follow(ob, target):
    c = ob.constraints.new("TRACK_TO"); c.target = target; c.track_axis = "TRACK_NEGATIVE_Z"; c.up_axis = "UP_Y"
    return c


def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(e)
    e.location = loc
    if parent: e.parent = parent
    return e


def shake(ob, amp=0.01, speed=0.15, seed=0):
    """Small handheld drift on rotation, from drivers (no Python needed)."""
    for i in range(3):
        base = ob.rotation_euler[i]
        K.add_driver(ob, "rotation_euler", f"{base:.4f}+{amp:.4f}*(sin(frame*{speed:.3f}+{seed + i * 2.1:.2f})+0.5*sin(frame*{speed * 2.7:.3f}+{seed * 1.3 + i:.2f}))", i)


def linear(ob, path="location"):
    if ob.animation_data and ob.animation_data.action:
        for fc in getattr(ob.animation_data.action, "fcurves", []):
            for k in fc.keyframe_points: k.interpolation = "LINEAR"


# ---------------- plates ----------------
def eye_reveal(sc, n):
    K.deep_world(sc, haze=0)
    sq = K.build_squid(spread=0.35, speed=0.6, eye_glow=True)
    eye = (-0.21, 0.27, 0.03)
    cam = K.camera((0.15, 1.75, 0.22), eye, lens=55, fstop=2.2)
    K.key_path(cam, [(1, (0.15, 1.75, 0.22)), (n, (0.0, 1.05, 0.12))])
    tgt = empty("t", eye); follow(cam, tgt); cam.data.dof.focus_object = tgt
    shake(cam, 0.004, 0.05)
    key = K.area((0.6, 1.6, 1.0), eye, 0, 0.8, (0.6, 0.75, 1.0))
    key.data.keyframe_insert("energy", frame=1)
    key.data.energy = 30; key.data.keyframe_insert("energy", frame=int(n * 0.35))
    K.area((-1.0, -0.5, 1.6), eye, 60, 1.5, (0.2, 0.45, 1.0))
    K.plankton(sc, center=(0, 1.0, 0), size=(5, 3, 3), count=260, strength=30)
    K.marine_snow(sc, center=(0, 1, 0), size=(6, 4, 4), count=900, glow=0.15)


def hover(sc, n):
    K.deep_world(sc, haze=0)
    sq = K.build_squid(spread=0.6, speed=0.7)
    sq.rotation_euler = (0.25, -0.35, 0.3)
    piv = empty("piv", (0.5, 0, 0))
    cam = K.camera((-2.0, -6.5, 1.2), (0.5, 0, 0), lens=32, fstop=5.6)
    cam.parent = piv
    piv.rotation_euler = (0, 0, -0.35); piv.keyframe_insert("rotation_euler", frame=1)
    piv.rotation_euler = (0, 0, 0.25); piv.keyframe_insert("rotation_euler", frame=n)
    follow(cam, empty("t", (0.3, 0, 0)))
    s = K.spot((-1.5, -6.0, 2.2), (0, 0, 0), 1400, 38); s.parent = piv
    K.area((3, 3, 3), (0, 0, 0), 150, 3, (0.25, 0.45, 1.0))
    K.marine_snow(sc, size=(16, 16, 10), count=2500, glow=0.2)
    K.plankton(sc, size=(14, 14, 8), count=250, strength=20)


def swim(sc, n):
    K.deep_world(sc, haze=0)
    sq = K.build_squid(spread=0.08, speed=1.6)
    sq.rotation_euler = (0, 0.05, math.pi)  # mantle leads toward -X, arms trail
    K.key_path(sq, [(1, (5.0, 0, 0)), (n, (-5.0, 0, 0.3))]); linear(sq)
    rig = empty("rig", (4.0, 0, 0))
    K.key_path(rig, [(1, (3.0, 0, 0)), (n, (-3.5, 0, 0.25))]); linear(rig)
    cam = K.camera((0, -6.5, 0.6), (0, 0, 0), lens=35, fstop=4); cam.parent = rig
    shake(cam, 0.006, 0.06)
    s = K.spot((0.5, -5.5, 2.5), (0, 0, 0), 1500, 40); s.parent = rig
    K.area((0, 4, 3), (0, 0, 0), 150, 4, (0.25, 0.45, 1.0)).parent = rig
    K.marine_snow(sc, size=(24, 14, 10), count=4000, glow=0.2)
    K.plankton(sc, size=(22, 12, 8), count=300, strength=20)


def build_club(sc, hooks_m):
    """Close-up tentacle club with separate hooks that swivel."""
    import bmesh
    skin = K.skin_mat("club_skin", base=(0.12, 0.012, 0.012), spot=(0.55, 0.12, 0.04), pale=(0.35, 0.12, 0.10))
    rings = []
    for i in range(121):
        t = i / 120; x = 1.6 * t
        r = 0.05 + 0.035 * math.sin(math.pi * min(1, max(0, (t - 0.25) / 0.7))) - 0.04 * max(0, t - 0.9) * 10 * 0.5
        rings.append((x, r, r * 0.8, 0, 0))
    club = K.mesh_obj("club", K.loft(rings, 32), skin, subsurf=2)
    hooks = []
    for i in range(14):
        t = 0.3 + 0.6 * i / 14
        x = 1.6 * t
        r = 0.05 + 0.035 * math.sin(math.pi * min(1, max(0, (t - 0.25) / 0.7)))
        for side in (-1, 1):
            bm = bmesh.new()
            ret = bmesh.ops.create_cone(bm, cap_ends=True, segments=12, radius1=0.02, radius2=0.0006, depth=0.1)
            for v in ret["verts"]:
                h = (v.co.z + 0.05) / 0.1
                v.co.z = v.co.z + 0.05
                v.co.x += -h * h * h * 0.11          # claw curve
            # sucker ring the hook sits in
            ret2 = bmesh.ops.create_cone(bm, cap_ends=False, segments=16, radius1=0.016, radius2=0.012, depth=0.008)
            hk = K.mesh_obj(f"hook{i}_{side}", bm, hooks_m, subsurf=1)
            hk.parent = club
            hk.location = (x + side * 0.012, side * r * 0.42, -r * 0.8)
            hk.rotation_euler = (math.pi, 0, 0)
            K.add_driver(hk, "rotation_euler", f"{math.pi:.4f}+0.0*frame", 0)
            K.add_driver(hk, "rotation_euler", f"1.1*sin(frame*0.05+{i * 0.7 + side:.2f})", 2)
            hooks.append(hk)
    return club


def hooks(sc, n):
    K.deep_world(sc, haze=0)
    hm = K.flat_mat("hookm", (0.30, 0.17, 0.06), rough=0.2, coat=1.0)
    club = build_club(sc, hm)
    club.rotation_euler = (math.radians(200), 0, 0)  # hooks face up toward the camera
    K.add_driver(club, "rotation_euler", f"{math.radians(200):.4f}+0.15*sin(frame*0.03)", 0)
    cam = K.camera((0.40, -0.55, 0.14), (0.6, 0, 0.05), lens=50, fstop=4.0)
    K.key_path(cam, [(1, (0.40, -0.55, 0.14)), (n, (1.10, -0.50, 0.12))]); linear(cam)
    tgt = empty("t", (0.6, 0, 0)); K.key_path(tgt, [(1, (0.6, 0, 0)), (n, (1.35, 0, 0))]); linear(tgt)
    follow(cam, tgt); cam.data.dof.focus_object = tgt
    K.spot((0.8, -0.8, 1.2), (0.9, 0, 0), 35, 50, (1.0, 0.85, 0.7), radius=0.05); K.area((0.9, 0.6, 0.5), (0.9, 0, 0.05), 40, 0.6, (0.4, 0.6, 1.0))
    K.area((1.0, 1.0, 0.6), (0.9, 0, 0), 25, 1.0, (0.25, 0.45, 1.0))
    K.marine_snow(sc, center=(0.9, 0, 0), size=(3, 3, 2), count=600, glow=0.1, radius=0.002)


def build_beak(parent, x=-0.47):
    import bmesh
    m = K.flat_mat("beak", (0.035, 0.022, 0.015), rough=0.15, coat=1.0)
    parts = []
    for k, (sz, zoff) in enumerate(((0.17, 0.03), (0.2, -0.03))):
        bm = bmesh.new()
        ret = bmesh.ops.create_cone(bm, cap_ends=True, segments=24, radius1=sz * 0.55, radius2=0.002, depth=sz * 1.2)
        for v in ret["verts"]:
            h = (v.co.z + sz * 0.6) / (sz * 1.2)
            v.co.z += sz * 0.6
            v.co.x += (h * h) * sz * 0.5 * (1 if k == 0 else -1) * -1
        ob = K.mesh_obj(f"beak{k}", bm, m, subsurf=1)
        ob.parent = parent
        ob.location = (x, 0, zoff)
        ob.rotation_euler = (0, -math.pi / 2, 0)  # points along -X out of the mouth
        parts.append(ob)
    K.add_driver(parts[1], "rotation_euler", "-1.5708+0.25*max(0,sin(frame*0.09))", 1)
    K.add_driver(parts[0], "rotation_euler", "-1.5708-0.12*max(0,sin(frame*0.09))", 1)
    return parts


def beak(sc, n):
    K.deep_world(sc, haze=0)
    sq = K.build_squid(spread=0.85, speed=0.7, arm_len=1.3)
    build_beak(sq, x=-0.5)
    import bmesh
    bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=48, radius1=0.24, radius2=0.10, depth=0.08)
    mouth = K.mesh_obj("mouth", bm, K.flat_mat("mouthm", (0.05, 0.008, 0.01), rough=0.5, coat=0.6), subsurf=1)
    mouth.parent = sq; mouth.location = (-0.47, 0, 0); mouth.rotation_euler = (0, -math.pi / 2, 0)
    cam = K.camera((-2.6, 0.9, 0.5), (-0.4, 0, 0), lens=45, fstop=2.8)
    K.key_path(cam, [(1, (-2.6, 0.9, 0.5)), (n, (-1.5, 0.5, 0.25))])
    follow(cam, empty("t", (-0.45, 0, 0)))
    shake(cam, 0.004, 0.05)
    K.spot((-2.4, -0.9, 1.2), (-0.45, 0, 0), 110, 24, (1.0, 0.85, 0.75))
    K.area((-0.5, 1.5, 1.5), (-0.4, 0, 0), 50, 1.5, (0.25, 0.45, 1.0))
    K.marine_snow(sc, center=(-1.5, 0, 0), size=(5, 5, 4), count=900, glow=0.12, radius=0.003)


def sub_dark(sc, n):
    K.deep_world(sc, tint=(0.0008, 0.002, 0.004), haze=0)
    sub, lens_m = M.build_sub(lights_on=False)
    sub.rotation_euler = (0, 0.02, 0.0)
    K.add_driver(sub, "location", "0.06*sin(frame*0.02)", 2)
    inside = K.point((0.4, 0, 0.1), 6, (1.0, 0.55, 0.25), 0.2)
    piv = empty("piv", (1.7, 0, 0))
    cam = K.camera((-4.5, -6.0, 1.2), (1.5, 0, 0), lens=35, fstop=4); cam.parent = piv
    piv.rotation_euler = (0, 0, -0.2); piv.keyframe_insert("rotation_euler", frame=1)
    piv.rotation_euler = (0, 0, 0.25); piv.keyframe_insert("rotation_euler", frame=n)
    follow(cam, empty("t", (1.5, 0, 0)))
    K.area((1.5, 4, 4), (1.5, 0, 0), 250, 6, (0.2, 0.4, 1.0)); K.area((-3, -5, 2), (1.5, 0, 0), 60, 4, (0.3, 0.5, 1.0))
    K.plankton(sc, center=(1.5, 0, 0), size=(12, 12, 7), count=700, strength=35)
    K.marine_snow(sc, center=(1.5, 0, 0), size=(14, 14, 8), count=1500, glow=0.08)


def sub_lights(sc, n):
    K.deep_world(sc, tint=(0.001, 0.003, 0.006), haze=0)
    sub, lens_m = M.build_sub(lights_on=True)
    K.key_path(sub, [(1, (2.0, 0, 0)), (n, (-2.0, 0, -0.4))]); linear(sub)
    for (y, z) in ((0.75, 0.55), (-0.75, 0.55), (0.8, -0.5), (-0.8, -0.5)):
        s = K.spot((0.15, y, z), (-10, y * 3, z - 2.0), 4000, 28, (1.0, 0.95, 0.85), 0.4, 0.05); s.parent = sub
        K.beam(sub, (0.12, y, z), (-10, y * 3 - y, -2.0 + 0 * z), 9, 1.9, 0.35)
    cam = K.camera((2.5, -7.0, 1.0), (0.0, 0, -0.2), lens=30, fstop=0)
    K.area((4, -3, 4), (0, 0, 0), 300, 4, (0.6, 0.75, 1.0))
    shake(cam, 0.004, 0.05)
    K.area((1.5, 4, 4), (0, 0, 0), 40, 6, (0.2, 0.4, 1.0))
    K.marine_snow(sc, center=(-3, 0, 0), size=(20, 14, 10), count=4500, glow=0.15)


def glow_mat(empties):
    """Plankton that lights up near the moving whale: emission falls off with distance to each trail empty."""
    m = bpy.data.materials.new("wakeglow"); m.use_nodes = True
    N, L = m.node_tree.nodes, m.node_tree.links
    N.remove(N["Principled BSDF"])
    em = N.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (0.15, 0.75, 1.0, 1)
    total = None
    for e, r, s in empties:
        tc = N.new("ShaderNodeTexCoord"); tc.object = e
        ln = N.new("ShaderNodeVectorMath"); ln.operation = "LENGTH"; L.new(tc.outputs["Object"], ln.inputs[0])
        mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0; mr.inputs["From Max"].default_value = r
        mr.inputs["To Min"].default_value = s; mr.inputs["To Max"].default_value = 0
        L.new(ln.outputs["Value"], mr.inputs["Value"])
        if total is None: total = mr.outputs["Result"]
        else:
            ad = N.new("ShaderNodeMath"); ad.operation = "ADD"; L.new(total, ad.inputs[0]); L.new(mr.outputs["Result"], ad.inputs[1]); total = ad.outputs[0]
    base = N.new("ShaderNodeMath"); base.operation = "ADD"; base.inputs[1].default_value = 0.02
    L.new(total, base.inputs[0])
    L.new(base.outputs[0], em.inputs["Strength"])
    L.new(em.outputs[0], N["Material Output"].inputs["Surface"])
    return m


def glow_wake(sc, n):
    K.deep_world(sc, tint=(0.0003, 0.0008, 0.0015), haze=0.0)
    wh = M.build_whale(speed=0.9)
    wh.location = (22, 0, 0); wh.keyframe_insert("location", frame=1)
    wh.location = (-26, 0, 1.5); wh.keyframe_insert("location", frame=n); linear(wh)
    trail = [(empty(f"e{i}", (7 + i * 7, 0, 0), wh), r, s) for i, (r, s) in enumerate(((5.5, 40), (5.0, 26), (4.5, 16), (4.0, 9), (3.5, 5)))]
    # glowing specks
    import bmesh
    random.seed(9)
    bm = bmesh.new()
    for _ in range(16000):
        c = Vector(((random.random() - .5) * 80, (random.random() - .5) * 14, (random.random() - .5) * 14 + 0.5))
        ret = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.03 + random.random() * 0.04)
        for v in ret["verts"]: v.co += c
    K.mesh_obj("wake", bm, glow_mat(trail), smooth=False, subsurf=0)
    K.camera((-4, -34, -3), (-2, 0, 0.5), lens=30)
    K.point((0, 0, 20), 0, (0.2, 0.4, 1.0))


def whale_dive(sc, n):
    node_world_gradient(sc, top=(0.03, 0.16, 0.24), haze=0.035)
    wh = M.build_whale(speed=1.0)
    wh.rotation_euler = (0, math.radians(68), 0.3)   # head down
    d = Vector((-math.cos(math.radians(68)), 0, -math.sin(math.radians(68))))
    p0 = Vector((-2, 4, 14)); p1 = p0 + d * 26
    K.key_path(wh, [(1, tuple(p0)), (n, tuple(p1))]); linear(wh)
    cam = K.camera((-14, -16, -6), (-6, 4, 0), lens=26)
    tgt = empty("t", (-4, 4, 6)); K.key_path(tgt, [(1, (-4, 4, 8)), (n, (-10, 4, -12))])
    follow(cam, tgt); shake(cam, 0.003, 0.04)
    sun = K.area((0, 0, 60), (0, 0, 0), 60000, 30, (0.6, 0.85, 1.0))
    K.marine_snow(sc, center=(-6, 2, -2), size=(30, 30, 40), count=6000, glow=0.1, radius=0.01)


def battle(sc, n):
    """Side view of the sperm whale's head with the squid clamped on its flank, arms spread over the head."""
    K.deep_world(sc, tint=(0.0005, 0.0012, 0.0025), haze=0)
    wh = M.build_whale(speed=2.0, length=13)
    wh.location = (0, 0, 0)
    K.add_driver(wh, "rotation_euler", "0.10*sin(frame*0.11)+0.05*sin(frame*0.27)", 0)
    K.add_driver(wh, "rotation_euler", "0.08*sin(frame*0.08+1)", 1)
    K.add_driver(wh, "rotation_euler", "0.22*sin(frame*0.07+2)+0.06*sin(frame*0.23)", 2)
    sq = K.build_squid(spread=0.85, speed=3.2, arm_len=1.8, tent_len=3.0)
    sq.parent = wh
    sq.location = (2.4, -2.3, 0.5)
    sq.rotation_euler = (math.radians(15), math.radians(-20), math.radians(-62))  # arms into the whale's flank, mantle out
    K.add_driver(sq, "rotation_euler", f"{math.radians(15):.3f}+0.22*sin(frame*0.19)", 0)
    K.add_driver(sq, "rotation_euler", f"{math.radians(-62):.3f}+0.18*sin(frame*0.15+1)", 2)
    cam = K.camera((3.5, -8.0, 4.2), (1.8, -1.2, 0.4), lens=30, fstop=4)
    follow(cam, empty("t", (1.8, -1.2, 0.4)))
    shake(cam, 0.018, 0.21, seed=3)
    K.spot((-1.0, -7.5, 4.0), (2, -1, 0), 1600, 38, (0.75, 0.88, 1.0))
    K.area((6, -2, 4), (2, 0, 0), 250, 5, (0.25, 0.45, 1.0))
    K.plankton(sc, center=(2, -2, 0), size=(14, 10, 8), count=1400, strength=45)
    K.marine_snow(sc, center=(2, -3, 0), size=(16, 12, 10), count=2500, glow=0.12)
    sc.render.use_motion_blur = True


def strike(sc, n):
    K.deep_world(sc, haze=0)
    sq = K.build_squid(spread=0.5, speed=2.5, tent_len=2.8)
    sq.rotation_euler = (0, 0, math.pi)       # arms face the camera at -X... flipped so arms point at +X
    p = [(1, (-6, 0, 0)), (int(n * 0.45), (-5.5, 0, 0)), (int(n * 0.55), (-1.8, 0, 0)), (n, (-1.5, 0, 0.1))]
    K.key_path(sq, p)
    cam = K.camera((1.6, -0.4, 0.3), (-3, 0, 0), lens=28, fstop=0)
    shake(cam, 0.012, 0.3, seed=1)
    K.spot((1.4, -0.8, 1.4), (-4, 0, 0), 1500, 40)
    K.marine_snow(sc, center=(-3, 0, 0), size=(10, 8, 6), count=2000, glow=0.15)
    K.plankton(sc, center=(-3, 0, 0), size=(10, 8, 6), count=300, strength=25)
    sc.render.use_motion_blur = True


def descent(sc, n):
    w, ramp = node_world_gradient(sc, top=(0.10, 0.45, 0.60), bottom=(0.01, 0.08, 0.13), haze=0.02)
    # fade the water from blue to black as the camera sinks
    for el, (c1, c2) in zip(ramp.color_ramp.elements, (((0.01, 0.08, 0.13), (0, 0, 0)), ((0.10, 0.45, 0.60), (0, 0.002, 0.005)))):
        el.color = (*c1, 1); el.keyframe_insert("color", frame=1)
        el.color = (*c2, 1); el.keyframe_insert("color", frame=int(n * 0.85))
    cam = K.camera((0, 0, 0), (0, 3, -1.5), lens=24)
    K.key_path(cam, [(1, (0, 0, 0)), (n, (0, 0, -60))])
    sun = K.area((0, 2, 30), (0, 2, 0), 40000, 20, (0.6, 0.9, 1.0))
    sun.data.keyframe_insert("energy", frame=1); sun.data.energy = 0; sun.data.keyframe_insert("energy", frame=int(n * 0.7))
    K.marine_snow(sc, center=(0, 2, -30), size=(12, 12, 75), count=16000, glow=0.15, radius=0.008)


PLATES = {
    "eye_reveal": (eye_reveal, 16, 2),
    "hover": (hover, 20, 2),
    "swim": (swim, 16, 2),
    "hooks": (hooks, 12, 2),
    "beak": (beak, 10, 2),
    "sub_dark": (sub_dark, 18, 2),
    "sub_lights": (sub_lights, 12, 2),
    "glow_wake": (glow_wake, 16, 2),
    "whale_dive": (whale_dive, 16, 2),
    "battle": (battle, 14, 1),
    "strike": (strike, 6, 1),
    "descent": (descent, 20, 2),
}
