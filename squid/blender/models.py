"""Sperm whale and submersible for the squid film."""
import bpy, bmesh, math
from squidkit import TAU, mesh_obj, node_mat, flat_mat, add_driver


def superloft(rings, seg=48):
    """rings: (x, half_width, half_height, cz, exponent). exponent above 2 gives a boxy section."""
    bm = bmesh.new(); prev = first = None
    for (x, a, b, cz, p) in rings:
        ring = []
        for k in range(seg):
            t = TAU * k / seg
            c, s_ = math.cos(t), math.sin(t)
            y = a * math.copysign(abs(c) ** (2 / p), c)
            z = cz + b * math.copysign(abs(s_) ** (2 / p), s_)
            ring.append(bm.verts.new((x, y, z)))
        if prev:
            for k in range(seg): bm.faces.new((prev[k], prev[(k + 1) % seg], ring[(k + 1) % seg], ring[k]))
        else: first = ring
        prev = ring
    bm.faces.new(list(reversed(first))); bm.faces.new(prev)
    return bm


def whale_mat(name="whale"):
    m, nt, N, L, p = node_mat(name)
    tc = N.new("ShaderNodeTexCoord")
    noi = N.new("ShaderNodeTexNoise"); noi.inputs["Scale"].default_value = 3; noi.inputs["Detail"].default_value = 8
    L.new(tc.outputs["Object"], noi.inputs["Vector"])
    ramp = N.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.035, 0.032, 0.033, 1); ramp.color_ramp.elements[1].color = (0.12, 0.11, 0.105, 1)
    L.new(noi.outputs["Fac"], ramp.inputs["Fac"]); L.new(ramp.outputs["Color"], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.45; p.inputs["Coat Weight"].default_value = 0.4; p.inputs["Coat Roughness"].default_value = 0.3
    wav = N.new("ShaderNodeTexWave"); wav.wave_type = "BANDS"; wav.bands_direction = "X"; wav.inputs["Scale"].default_value = 9
    wav.inputs["Distortion"].default_value = 6; wav.inputs["Detail"].default_value = 4
    L.new(tc.outputs["Object"], wav.inputs["Vector"])
    bmp = N.new("ShaderNodeBump"); bmp.inputs["Strength"].default_value = 0.25; bmp.inputs["Distance"].default_value = 0.02
    L.new(wav.outputs["Fac"], bmp.inputs["Height"]); L.new(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def build_whale(name="whale", length=15.0, speed=1.0):
    """Sperm whale along +X: snout tip at x=0, fluke at x=length. Fluke beat by drivers."""
    root = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(root)
    mat = whale_mat(name + "_skin")
    Lh = length
    rings = []
    n = 80
    for i in range(n + 1):
        u = i / n; x = u * Lh
        if u < 0.33:      # the boxy head, about a third of the body, blunt at the front
            v = u / 0.33
            g = 0.62 + 0.38 * math.sin(math.pi / 2 * min(1, v * 7))
            a, b, p, cz = 0.95 * g, 1.25 * g, 3.4 - 0.9 * v, 0.15
        else:
            v = (u - 0.33) / 0.67
            a = (0.95 + 0.18 * math.sin(math.pi * min(1, v * 1.6))) * (1 - v ** 2.2) ** 0.9 + 0.06 * v
            b = (1.25 + 0.10 * math.sin(math.pi * min(1, v * 1.6))) * (1 - v ** 2.0) ** 1.1 + 0.05 * v
            p, cz = 2.5 - 0.5 * v, 0.15 * (1 - v)
        rings.append((x, a, b, cz, p))
    body = mesh_obj(name + "_body", superloft(rings), mat, subsurf=2); body.parent = root
    jr = []
    for i in range(31):
        u = i / 30; x = 0.6 + u * Lh * 0.26
        jr.append((x, 0.22 * math.sin(math.pi * min(1, u * 1.3)) ** 0.5 + 0.03, 0.12, -1.1 + 0.25 * u, 2.2))
    jaw = mesh_obj(name + "_jaw", superloft(jr, 24), mat, subsurf=1); jaw.parent = root
    fl = []
    for i in range(25):
        u = i / 24; x = Lh * (0.94 + 0.08 * u)
        fl.append((x, 1.9 * math.sin(math.pi * u) ** 0.6 * (1 - 0.3 * u) + 0.05, 0.07 * (1 - u) + 0.01, 0.0, 2.0))
    fluke = mesh_obj(name + "_fluke", superloft(fl, 24), mat, subsurf=1); fluke.parent = root
    for side in (1, -1):
        pr = [(u * 1.6, 0.35 * math.sin(math.pi * u) ** 0.6 + 0.02, 0.05, 0, 2.0) for u in [i / 12 for i in range(13)]]
        fp = mesh_obj(name + f"_flip{side}", superloft(pr, 16), mat, subsurf=1); fp.parent = root
        fp.location = (Lh * 0.36, side * 0.85, -0.6); fp.rotation_euler = (side * 0.5, 0.3, side * 0.9)
    # tail beat: an empty sits at mid-body so the bend only moves the rear half
    piv = bpy.data.objects.new(name + "_pivot", None); bpy.context.scene.collection.objects.link(piv)
    piv.parent = root; piv.location = (Lh * 0.5, 0, 0)
    for ob in (body, fluke):
        d = ob.modifiers.new("beat", "SIMPLE_DEFORM"); d.deform_method = "BEND"; d.deform_axis = "Y"
        d.origin = piv
        d.limits = (0.5, 1.0)
        add_driver(d, "angle", f"0.5*sin(frame*{0.07 * speed:.4f})")
    return root


def build_sub(name="sub", lights_on=True):
    """Small deep-sea submersible: white hull, acrylic dome at the front (-X end), lamps, thrusters."""
    root = bpy.data.objects.new(name, None); bpy.context.scene.collection.objects.link(root)
    white = flat_mat(name + "_white", (0.75, 0.74, 0.70), rough=0.35, coat=0.6)
    orange = flat_mat(name + "_orange", (0.55, 0.16, 0.03), rough=0.45, coat=0.3)
    dark = flat_mat(name + "_dark", (0.03, 0.03, 0.035), rough=0.5, metal=0.5)
    glass = flat_mat(name + "_glass", (0.6, 0.75, 0.85), rough=0.02, alpha=0.25)
    hull = mesh_obj(name + "_hull", superloft([(x, r, r * 0.85, 0, 2.2) for x, r in
                    [(0, 0.05), (0.15, 0.7), (0.5, 0.95), (1.5, 1.0), (2.6, 0.9), (3.2, 0.5), (3.5, 0.08)]], 40), white, subsurf=2)
    hull.parent = root
    top = mesh_obj(name + "_fin", superloft([(x, 0.08, h, 0.76 + h * 0.4, 2) for x, h in [(1.4, 0.04), (1.8, 0.22), (2.6, 0.2), (2.9, 0.04)]], 16), orange, subsurf=1)
    top.parent = root
    bm = bmesh.new(); bmesh.ops.create_uvsphere(bm, u_segments=40, v_segments=24, radius=0.75)
    dome = mesh_obj(name + "_dome", bm, glass, subsurf=0); dome.parent = root; dome.location = (0.25, 0, 0.05)
    lens_m = flat_mat(name + "_lensm", (1, 1, 1), emit=(1, 0.95, 0.85), strength=40 if lights_on else 0)
    lamps = []
    for (y, z) in ((0.75, 0.55), (-0.75, 0.55), (0.8, -0.5), (-0.8, -0.5)):
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=True, segments=16, radius1=0.12, radius2=0.09, depth=0.25)
        lamp = mesh_obj(name + "_lamp", bm, dark, subsurf=0); lamp.parent = root
        lamp.location = (0.35, y, z); lamp.rotation_euler = (0, math.pi / 2, 0)
        bm = bmesh.new(); bmesh.ops.create_circle(bm, cap_ends=True, segments=16, radius=0.085)
        lens = mesh_obj(name + "_lens", bm, lens_m, subsurf=0)
        lens.parent = root; lens.location = (0.215, y, z); lens.rotation_euler = (0, math.pi / 2, 0)
        lamps.append(lens)
    for (y, z) in ((1.05, -0.2), (-1.05, -0.2)):
        bm = bmesh.new(); bmesh.ops.create_cone(bm, cap_ends=False, segments=24, radius1=0.3, radius2=0.3, depth=0.5)
        th = mesh_obj(name + "_thr", bm, dark, subsurf=0); th.parent = root; th.location = (2.8, y, z); th.rotation_euler = (0, math.pi / 2, 0)
    for y in (0.6, -0.6):
        sk = mesh_obj(name + "_skid", superloft([(x, 0.05, 0.05, -1.05, 2) for x in (0.3, 3.0)], 12), dark, subsurf=0); sk.parent = root; sk.location.y = y
    return root, lens_m
