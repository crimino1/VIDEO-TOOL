"""Colossal squid kit for Blender 5.2: procedural squid, deep-sea world, marine snow, camera and render helpers.
Units are metres. The squid's head sits at the origin, the mantle runs along +X, the arms reach toward -X."""
import bpy, bmesh, math, random
from mathutils import Vector, Euler

TAU = math.tau


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


# ---------- materials ----------
def node_mat(name):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    nt = m.node_tree
    return m, nt, nt.nodes, nt.links, nt.nodes["Principled BSDF"]


def skin_mat(name="skin", base=(0.22, 0.018, 0.02), spot=(0.85, 0.22, 0.06), pale=(0.62, 0.30, 0.26), sss=0.25):
    """Deep red squid skin: chromatophore spots, paler underside, wet coat, fine bump."""
    m, nt, N, L, p = node_mat(name)
    tc = N.new("ShaderNodeTexCoord")
    vor = N.new("ShaderNodeTexVoronoi"); vor.inputs["Scale"].default_value = 38
    L.new(tc.outputs["Object"], vor.inputs["Vector"])
    noi = N.new("ShaderNodeTexNoise"); noi.inputs["Scale"].default_value = 6; noi.inputs["Detail"].default_value = 6
    L.new(tc.outputs["Object"], noi.inputs["Vector"])
    ramp = N.new("ShaderNodeValToRGB")  # spots: small distance = orange dot
    ramp.color_ramp.elements[0].position = 0.0; ramp.color_ramp.elements[0].color = (*spot, 1)
    ramp.color_ramp.elements[1].position = 0.32; ramp.color_ramp.elements[1].color = (*base, 1)
    L.new(vor.outputs["Distance"], ramp.inputs["Fac"])
    mix1 = N.new("ShaderNodeMix"); mix1.data_type = "RGBA"; mix1.blend_type = "MULTIPLY"; mix1.inputs["Factor"].default_value = 0.35
    L.new(ramp.outputs["Color"], mix1.inputs[6]); L.new(noi.outputs["Color"], mix1.inputs[7])
    # underside paler: object Z below 0
    sep = N.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], sep.inputs[0])
    mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0.05; mr.inputs["From Max"].default_value = -0.3
    L.new(sep.outputs["Z"], mr.inputs["Value"])
    mix2 = N.new("ShaderNodeMix"); mix2.data_type = "RGBA"
    L.new(mr.outputs["Result"], mix2.inputs["Factor"]); L.new(mix1.outputs[2], mix2.inputs[6]); mix2.inputs[7].default_value = (*pale, 1)
    L.new(mix2.outputs[2], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.42
    p.inputs["Coat Weight"].default_value = 0.7; p.inputs["Coat Roughness"].default_value = 0.18
    p.inputs["Subsurface Weight"].default_value = sss
    p.inputs["Subsurface Radius"].default_value = (0.9, 0.25, 0.15)
    p.inputs["Subsurface Scale"].default_value = 0.05
    bmp = N.new("ShaderNodeBump"); bmp.inputs["Strength"].default_value = 0.18
    n2 = N.new("ShaderNodeTexNoise"); n2.inputs["Scale"].default_value = 140; n2.inputs["Detail"].default_value = 4
    L.new(tc.outputs["Object"], n2.inputs["Vector"]); L.new(n2.outputs["Fac"], bmp.inputs["Height"])
    L.new(bmp.outputs["Normal"], p.inputs["Normal"])
    return m


def flat_mat(name, color, rough=0.4, emit=None, strength=0.0, metal=0.0, coat=0.0, alpha=1.0):
    m, nt, N, L, p = node_mat(name)
    p.inputs["Base Color"].default_value = (*color, 1)
    p.inputs["Roughness"].default_value = rough
    p.inputs["Metallic"].default_value = metal
    p.inputs["Coat Weight"].default_value = coat
    if emit:
        p.inputs["Emission Color"].default_value = (*emit, 1)
        p.inputs["Emission Strength"].default_value = strength
    if alpha < 1:
        p.inputs["Alpha"].default_value = alpha
        m.surface_render_method = "BLENDED"
    return m


def eye_mat(name="eye", glow=0.0):
    """Eye with the pupil facing local +Z: black pupil, silver-gold iris with radial streaks, dark sclera.
    A separate clear cornea (cornea_mat) sits over it for reflections."""
    m, nt, N, L, p = node_mat(name)
    tc = N.new("ShaderNodeTexCoord")
    sep = N.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], sep.inputs[0])
    nz = N.new("ShaderNodeMath"); nz.operation = "DIVIDE"; nz.inputs[1].default_value = 0.135
    L.new(sep.outputs["Z"], nz.inputs[0])
    xy = N.new("ShaderNodeCombineXYZ"); L.new(sep.outputs["X"], xy.inputs[0]); L.new(sep.outputs["Y"], xy.inputs[1])
    nrm = N.new("ShaderNodeVectorMath"); nrm.operation = "NORMALIZE"; L.new(xy.outputs[0], nrm.inputs[0])
    noi = N.new("ShaderNodeTexNoise"); noi.inputs["Scale"].default_value = 9; noi.inputs["Detail"].default_value = 6
    L.new(nrm.outputs[0], noi.inputs["Vector"])
    iris = N.new("ShaderNodeValToRGB")
    iris.color_ramp.elements[0].color = (0.01, 0.015, 0.025, 1); iris.color_ramp.elements[1].color = (0.12, 0.16, 0.20, 1)
    L.new(noi.outputs["Fac"], iris.inputs["Fac"])
    band = N.new("ShaderNodeMapRange"); band.inputs["From Min"].default_value = 0.45; band.inputs["From Max"].default_value = 0.6
    L.new(nz.outputs[0], band.inputs["Value"])
    pup = N.new("ShaderNodeMapRange"); pup.inputs["From Min"].default_value = 0.74; pup.inputs["From Max"].default_value = 0.77
    pup.inputs["To Min"].default_value = 1; pup.inputs["To Max"].default_value = 0
    L.new(nz.outputs[0], pup.inputs["Value"])
    fac = N.new("ShaderNodeMath"); fac.operation = "MULTIPLY"; L.new(band.outputs[0], fac.inputs[0]); L.new(pup.outputs[0], fac.inputs[1])
    mix = N.new("ShaderNodeMix"); mix.data_type = "RGBA"
    L.new(fac.outputs[0], mix.inputs["Factor"]); mix.inputs[6].default_value = (0.006, 0.004, 0.004, 1); L.new(iris.outputs["Color"], mix.inputs[7])
    L.new(mix.outputs[2], p.inputs["Base Color"])
    p.inputs["Roughness"].default_value = 0.3
    p.inputs["Metallic"].default_value = 0.2
    p.inputs["Coat Weight"].default_value = 1.0; p.inputs["Coat Roughness"].default_value = 0.04; p.inputs["Coat IOR"].default_value = 1.35
    if glow:
        p.inputs["Emission Color"].default_value = (0.35, 0.6, 1.0, 1)
        g = N.new("ShaderNodeMath"); g.operation = "MULTIPLY"; g.inputs[1].default_value = 0.04
        L.new(fac.outputs[0], g.inputs[0]); L.new(g.outputs[0], p.inputs["Emission Strength"])
    return m


def cornea_mat(name="cornea"):
    m, nt, N, L, p = node_mat(name)
    p.inputs["Base Color"].default_value = (0, 0, 0, 1)
    p.inputs["Roughness"].default_value = 0.03
    p.inputs["Specular IOR Level"].default_value = 1.0
    p.inputs["Coat Weight"].default_value = 1.0; p.inputs["Coat Roughness"].default_value = 0.01
    p.inputs["Alpha"].default_value = 0.18
    m.surface_render_method = "BLENDED"
    return m


# ---------- mesh helpers ----------
def mesh_obj(name, bm, mat=None, smooth=True, subsurf=1):
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me); bm.free()
    ob = bpy.data.objects.new(name, me)
    bpy.context.scene.collection.objects.link(ob)
    if smooth:
        for poly in me.polygons: poly.use_smooth = True
    if mat: me.materials.append(mat)
    if subsurf:
        s = ob.modifiers.new("sub", "SUBSURF"); s.levels = subsurf; s.render_levels = subsurf
    return ob


def loft(rings, seg=40, cap=True):
    """rings: list of (x, ry, rz, cy, cz). Returns bmesh of a closed tube along X."""
    bm = bmesh.new()
    prev = None
    first = None
    for (x, ry, rz, cy, cz) in rings:
        ring = [bm.verts.new((x, cy + ry * math.cos(TAU * k / seg), cz + rz * math.sin(TAU * k / seg))) for k in range(seg)]
        if prev:
            for k in range(seg):
                bm.faces.new((prev[k], prev[(k + 1) % seg], ring[(k + 1) % seg], ring[k]))
        else:
            first = ring
        prev = ring
    if cap:
        bm.faces.new(list(reversed(first)))
        bm.faces.new(prev)
    return bm


def add_driver(target, path, expr, index=-1):
    fc = target.driver_add(path, index) if index >= 0 else target.driver_add(path)
    fc.driver.type = "SCRIPTED"
    fc.driver.expression = expr
    return fc


# ---------- the squid ----------
def build_squid(name="squid", scale=1.0, mantle=2.5, arm_len=1.5, tent_len=2.3, spread=0.55, speed=1.0, seed=3, eye_glow=False):
    """Returns the root empty. spread: 0 arms bundled forward, 1 arms flared wide like a flower."""
    random.seed(seed)
    root = bpy.data.objects.new(name, None)
    bpy.context.scene.collection.objects.link(root)
    skin = skin_mat(name + "_skin")
    # body: arm crown -> head -> neck -> mantle -> tail point
    rings = []
    n = 90
    for i in range(n + 1):
        x = -0.48 + (mantle + 0.48) * i / n
        if x < -0.40:
            r = 0.20 + (x + 0.48) * 0.9
        elif x < 0.0:
            t = (x + 0.40) / 0.40
            r = 0.27 + 0.07 * math.sin(math.pi * min(1, t * 1.1)) - 0.03 * max(0, t - 0.8) * 5
        else:
            t = x / mantle
            r = 0.52 * (0.80 + 0.20 * math.sin(math.pi / 2 * min(t / 0.3, 1))) * (1 - max(0, (t - 0.22) / 0.78) ** 2.0) ** 0.85 + 0.012
        rings.append((x, r, r * 0.92, 0, 0))
    body = mesh_obj(name + "_body", loft(rings, 48), skin, subsurf=2)
    body.parent = root
    # eyes, dinner-plate size, set into bulges on the head
    eyes = []
    em = eye_mat(name + "_eye", glow=eye_glow)
    lid_m = flat_mat(name + "_lidm", (0.10, 0.012, 0.012), rough=0.75)
    for side in (1, -1):
        bm = bmesh.new()
        bmesh.ops.create_uvsphere(bm, u_segments=48, v_segments=32, radius=0.135)
        e = mesh_obj(name + f"_eye{side}", bm, em, subsurf=0)
        e.location = (-0.21, side * 0.27, 0.03)
        e.rotation_euler = (-side * math.pi / 2, 0, 0)  # local +Z (pupil) faces outward
        e.parent = root
        eyes.append(e)

        # lid ring of skin around the eye
        bm = bmesh.new()
        bmesh.ops.create_cone(bm, cap_ends=False, segments=40, radius1=0.18, radius2=0.122, depth=0.09)
        lid = mesh_obj(name + f"_lid{side}", bm, lid_m, subsurf=1)
        lid.location = (-0.21, side * 0.31, 0.03)
        lid.rotation_euler = (-side * math.pi / 2, 0, 0)
        lid.parent = root
    # fins: one broad rounded paddle across the rear of the mantle
    bm = bmesh.new()
    xs, ys = 26, 30
    grid = []
    x0, x1 = mantle * 0.45, mantle + 0.06
    for i in range(xs + 1):
        u = i / xs
        x = x0 + (x1 - x0) * u
        half = 0.95 * math.sin(math.pi * u) ** 0.7 * (1 - 0.25 * u) + 0.03
        row = []
        for j in range(ys + 1):
            v = j / ys * 2 - 1
            y = v * half
            th = 0.035 * (1 - abs(v) ** 2) + 0.004
            row.append((bm.verts.new((x, y, th)), bm.verts.new((x, y, -th))))
        grid.append(row)
    for i in range(xs):
        for j in range(ys):
            a, b, c, d = grid[i][j], grid[i][j + 1], grid[i + 1][j + 1], grid[i + 1][j]
            bm.faces.new((a[0], d[0], c[0], b[0]))
            bm.faces.new((a[1], b[1], c[1], d[1]))
    for i in range(xs):
        for j in (0, ys):
            a, d = grid[i][j], grid[i + 1][j]
            bm.faces.new((a[0], a[1], d[1], d[0]) if j == 0 else (a[0], d[0], d[1], a[1]))
    fin = mesh_obj(name + "_fin", bm, skin, subsurf=1)
    fin.parent = root
    fin.location = (0, 0, 0.05)
    fd = fin.modifiers.new("flap", "SIMPLE_DEFORM"); fd.deform_method = "BEND"; fd.deform_axis = "X"
    add_driver(fd, "angle", f"sin(frame*{0.11 * speed:.4f})*0.55")
    # arms
    crown_x = -0.46
    arms = []
    hook_m = flat_mat(name + "_hook", (0.08, 0.06, 0.05), rough=0.2, coat=0.8)
    suck_m = flat_mat(name + "_sucker", (0.75, 0.55, 0.45), rough=0.3, coat=0.5)
    for k in range(10):
        tentacle = k in (8, 9)
        ang = TAU * (k + 0.5) / 8 if not tentacle else (math.pi * 0.5 if k == 8 else math.pi * 1.5) + 0.0
        L = tent_len if tentacle else arm_len * (0.9 + 0.2 * random.random())
        arm = build_arm(f"{name}_arm{k}", L, 0.095 if not tentacle else 0.055, skin, hook_m, suck_m, tentacle)
        arm.parent = root
        rr = 0.16
        arm.location = (crown_x, rr * math.cos(ang), rr * math.sin(ang) * 0.9)
        # point along -X, flared out by spread
        flare = (0.10 + 0.9 * spread) if not tentacle else 0.08 + 0.4 * spread
        d = Vector((-math.cos(flare), math.sin(flare) * math.cos(ang), math.sin(flare) * math.sin(ang)))
        rad = Vector((0, math.cos(ang), math.sin(ang)))
        z = (rad - rad.dot(d) * d).normalized()  # local +Z points outward, so the sucker side (-Z) faces in
        y = z.cross(d)
        from mathutils import Matrix
        arm.rotation_euler = Matrix((d, y, z)).transposed().to_euler()
        animate_arm(arm, L, speed, phase=random.random() * 100, tentacle=tentacle)
        arms.append(arm)
    root.scale = (scale, scale, scale)
    return root


def build_arm(name, L, r0, skin, hook_m, suck_m, tentacle):
    """Arm along local +X, sucker side on local -Z. Tentacles get a club with big swivel hooks."""
    seg, n = 14, 110
    rings = []
    for i in range(n + 1):
        t = i / n
        r = r0 * (1 - t) ** 0.75 + 0.004
        if tentacle:
            r = r0 * 0.55 * (1 - t) ** 0.3 + 0.004
            if t > 0.72:  # club
                r *= 1.0 + 0.9 * math.sin(math.pi * (t - 0.72) / 0.28)
        rings.append((L * t, r, r * 0.85, 0, 0))
    bm = loft(rings, seg)
    # suckers (rings) and hooks along the underside
    count = 34 if not tentacle else 18
    for i in range(count):
        t = (0.08 + 0.85 * i / count) if not tentacle else (0.74 + 0.24 * i / count)
        x = L * t
        r = r0 * (1 - t) ** 0.75 + 0.004 if not tentacle else r0 * 0.55 * (1 - t) ** 0.3 * (1.0 + 0.9 * math.sin(math.pi * max(0, t - 0.72) / 0.28)) + 0.004
        for side in (-1, 1):
            y = side * r * 0.45
            z = -r * 0.82
            hook = (0.3 < t < 0.7 and not tentacle and i % 2 == 0) or tentacle
            if hook:
                hs = r * (0.9 if tentacle else 0.55)
                ret = bmesh.ops.create_cone(bm, cap_ends=True, segments=8, radius1=hs * 0.35, radius2=0.0005, depth=hs * 1.3)
                vs = ret["verts"]
                # curve the hook: bend tip toward -X
                for v in vs:
                    h = (v.co.z + hs * 0.65) / (hs * 1.3)
                    v.co.x -= h * h * hs * 0.6
                    v.co.z = -abs(v.co.z + hs * 0.65)  # point downward
                    v.co += Vector((x, y, z))
            else:
                ret = bmesh.ops.create_cone(bm, cap_ends=True, segments=10, radius1=r * 0.17, radius2=r * 0.21, depth=r * 0.16)
                for v in ret["verts"]:
                    v.co.z = -abs(v.co.z) * 0.6
                    v.co += Vector((x, y, z))
    ob = mesh_obj(name, bm, skin, subsurf=1)
    ob.data.materials.append(hook_m)
    # amplitude grows toward the tip
    vg = ob.vertex_groups.new(name="tip")
    for v in ob.data.vertices:
        vg.add([v.index], min(1.0, (v.co.x / L) ** 1.4), "REPLACE")
    return ob


def animate_arm(arm, L, speed, phase, tentacle, curl=0.9, sway=0.35):
    """Bends the arm along a guide curve whose points move with time: a slow curl toward the sucker side
    plus a travelling wave. Point k sits at s=k/n along the arm; drivers give it a closed-form position."""
    n = 10
    cu = bpy.data.curves.new(arm.name + "_path", "CURVE"); cu.dimensions = "3D"
    sp = cu.splines.new("POLY"); sp.points.add(n)
    path = bpy.data.objects.new(arm.name + "_path", cu)
    bpy.context.scene.collection.objects.link(path)
    path.parent = arm.parent
    path.location, path.rotation_euler = arm.location.copy(), arm.rotation_euler.copy()
    path.hide_render = True
    w = 0.045 * speed
    c0 = curl * (0.6 if tentacle else 1.0)
    for k in range(n + 1):
        sk = k / n
        sp.points[k].co = (L * 1.08 * sk, 0, 0, 1)
        # curl bends toward -Z (sucker side), breathing slowly; sway moves side to side as a travelling wave
        cz = f"-{L:.3f}*({sk ** 2:.4f})*({c0:.3f}+0.35*sin(frame*{w * 0.6:.4f}+{phase:.2f}))*0.5"
        sy = f"{L:.3f}*{sway:.3f}*{sk ** 1.5:.4f}*sin(frame*{w:.4f}-{sk * 4:.3f}+{phase * 1.3:.2f})"
        sz2 = f"{L:.3f}*0.18*{sk ** 1.5:.4f}*sin(frame*{w * 0.8:.4f}-{sk * 3:.3f}+{phase * 0.7:.2f})"
        sx = f"{L * 1.08 * sk:.4f}*(1-0.10*{sk:.3f}*({c0:.3f}+0.35*sin(frame*{w * 0.6:.4f}+{phase:.2f})))"
        for i, e in enumerate((sx, sy, cz + "+" + sz2)):
            fc = cu.driver_add(f"splines[0].points[{k}].co", i)
            fc.driver.type = "SCRIPTED"; fc.driver.expression = e
    m = arm.modifiers.new("follow", "CURVE"); m.object = path; m.deform_axis = "POS_X"
    arm.modifiers.move(len(arm.modifiers) - 1, 0)


# ---------- world ----------
def deep_world(scene, tint=(0.0015, 0.004, 0.009), haze=0.035, haze_color=(0.35, 0.6, 1.0)):
    w = bpy.data.worlds.new("deep"); scene.world = w
    w.use_nodes = True
    N, L = w.node_tree.nodes, w.node_tree.links
    N["Background"].inputs["Color"].default_value = (*tint, 1)
    N["Background"].inputs["Strength"].default_value = 1.0
    if haze:
        vs = N.new("ShaderNodeVolumeScatter")
        vs.inputs["Density"].default_value = haze
        vs.inputs["Color"].default_value = (*haze_color, 1)
        vs.inputs["Anisotropy"].default_value = 0.6
        L.new(vs.outputs[0], N["World Output"].inputs["Volume"])
    return w


def marine_snow(scene, center=(0, 0, 0), size=(14, 14, 10), count=2500, glow=0.25, seed=1, color=(0.75, 0.85, 1.0), radius=0.0035, drift=(0, 0, -0.004)):
    """Tiny drifting specks. drift: metres per frame for the whole cloud."""
    random.seed(seed)
    bm = bmesh.new()
    for _ in range(count):
        c = Vector((center[0] + (random.random() - .5) * size[0], center[1] + (random.random() - .5) * size[1], center[2] + (random.random() - .5) * size[2]))
        rr = radius * (0.4 + random.random() ** 3 * 2.2)
        ret = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=rr)
        for v in ret["verts"]: v.co += c
    m = flat_mat("snow", color, rough=0.9, emit=color, strength=glow)
    ob = mesh_obj("snow", bm, m, smooth=False, subsurf=0)
    for i, axis in enumerate("xyz"):
        if drift[i]:
            add_driver(ob, "location", f"{center[i]}+frame*{drift[i]}", i)
    return ob


def plankton(scene, center=(0, 0, 0), size=(10, 10, 6), count=500, seed=5, color=(0.2, 0.65, 1.0), strength=25, blink=True):
    """Bioluminescent sparks: emissive specks that flash on and off at random."""
    random.seed(seed)
    bm = bmesh.new()
    for _ in range(count):
        c = Vector((center[0] + (random.random() - .5) * size[0], center[1] + (random.random() - .5) * size[1], center[2] + (random.random() - .5) * size[2]))
        ret = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.008 + random.random() * 0.012)
        for v in ret["verts"]: v.co += c
    m = bpy.data.materials.new("plankton"); m.use_nodes = True
    N, Lk = m.node_tree.nodes, m.node_tree.links
    N.remove(N["Principled BSDF"])
    em = N.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (*color, 1)
    if blink:
        # each speck flashes when a slow 4D noise at its position crosses a threshold
        tc = N.new("ShaderNodeTexCoord")
        noi = N.new("ShaderNodeTexNoise"); noi.noise_dimensions = "4D"; noi.inputs["Scale"].default_value = 3.0
        Lk.new(tc.outputs["Object"], noi.inputs["Vector"])
        add_driver(noi.inputs["W"], "default_value", "frame*0.02")
        mr = N.new("ShaderNodeMapRange"); mr.inputs["From Min"].default_value = 0.56; mr.inputs["From Max"].default_value = 0.66
        mr.inputs["To Max"].default_value = strength
        Lk.new(noi.outputs["Fac"], mr.inputs["Value"]); Lk.new(mr.outputs["Result"], em.inputs["Strength"])
    else:
        em.inputs["Strength"].default_value = strength
    Lk.new(em.outputs[0], N["Material Output"].inputs["Surface"])
    ob = mesh_obj("plankton", bm, m, smooth=False, subsurf=0)
    return ob


# ---------- camera, lights, render ----------
def camera(loc, target, lens=35, fstop=0, focus=None):
    cd = bpy.data.cameras.new("cam"); cd.lens = lens
    c = bpy.data.objects.new("cam", cd); bpy.context.scene.collection.objects.link(c)
    c.location = loc
    aim(c, target)
    if fstop:
        cd.dof.use_dof = True; cd.dof.aperture_fstop = fstop
        cd.dof.focus_distance = focus or (Vector(target) - Vector(loc)).length
    bpy.context.scene.camera = c
    return c


def aim(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat("-Z", "Y").to_euler()


def key_path(ob, keys, prop="location"):
    """keys: list of (frame, value). Smooth bezier keys."""
    for f, v in keys:
        setattr(ob, prop, v)
        ob.keyframe_insert(prop, frame=f)


def spot(loc, target, energy=800, size_deg=40, color=(0.85, 0.92, 1.0), blend=0.6, radius=0.1):
    ld = bpy.data.lights.new("spot", "SPOT"); ld.energy = energy; ld.color = color
    ld.spot_size = math.radians(size_deg); ld.spot_blend = blend; ld.shadow_soft_size = radius
    o = bpy.data.objects.new("spot", ld); bpy.context.scene.collection.objects.link(o)
    o.location = loc; aim(o, target)
    return o


def point(loc, energy=100, color=(0.4, 0.6, 1.0), radius=0.2):
    ld = bpy.data.lights.new("pt", "POINT"); ld.energy = energy; ld.color = color; ld.shadow_soft_size = radius
    o = bpy.data.objects.new("pt", ld); bpy.context.scene.collection.objects.link(o); o.location = loc
    return o


def area(loc, target, energy=200, size=2.0, color=(0.5, 0.7, 1.0)):
    ld = bpy.data.lights.new("area", "AREA"); ld.energy = energy; ld.color = color; ld.size = size
    o = bpy.data.objects.new("area", ld); bpy.context.scene.collection.objects.link(o)
    o.location = loc; aim(o, target)
    return o


def render_setup(scene, w=1920, h=1080, samples=24, fps=30, frames=(1, 150), volumes=True):
    scene.render.engine = "BLENDER_EEVEE"
    scene.render.resolution_x, scene.render.resolution_y = w, h
    scene.render.resolution_percentage = 100
    scene.render.fps = fps
    scene.frame_start, scene.frame_end = frames
    e = scene.eevee
    e.taa_render_samples = samples
    for k, v in (("use_raytracing", False), ("volumetric_tile_size", "2"), ("volumetric_samples", 64), ("volumetric_end", 40.0),
                 ("use_volumetric_shadows", False), ("use_bloom", True), ("bloom_intensity", 0.05), ("use_gtao", True)):
        if hasattr(e, k):
            try: setattr(e, k, v)
            except Exception: pass
    scene.view_settings.view_transform = "AgX"
    scene.view_settings.look = "AgX - High Contrast"
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    # glare for glowing things (compositor bloom)
    try:
        scene.use_nodes = True
        tree = scene.node_tree if hasattr(scene, "node_tree") and scene.node_tree else None
        if tree:
            rl = tree.nodes.get("Render Layers"); comp = tree.nodes.get("Composite")
            g = tree.nodes.new("CompositorNodeGlare"); g.glare_type = "FOG_GLOW"; g.quality = "MEDIUM"
            if hasattr(g, "threshold"): g.threshold = 0.6
            if hasattr(g, "size"): g.size = 7
            tree.links.new(rl.outputs["Image"], g.inputs["Image"]); tree.links.new(g.outputs["Image"], comp.inputs["Image"])
    except Exception as ex:
        print("no compositor glare:", ex)



def beam(parent, loc, direction, length=9.0, radius=1.6, strength=1.2, color=(1.0, 0.93, 0.82)):
    """Fake light shaft: a cone that glows along its axis and fades at the far end and at grazing edges.
    Cleaner than EEVEE volumetrics, which band into a dotted pattern on this machine."""
    import bmesh
    from mathutils import Vector
    bm = bmesh.new()
    bmesh.ops.create_cone(bm, cap_ends=False, segments=48, radius1=0.06, radius2=radius, depth=length)
    for v in bm.verts: v.co.z += length / 2  # apex at origin, opening toward +Z
    m = bpy.data.materials.new("beam"); m.use_nodes = True
    N, L = m.node_tree.nodes, m.node_tree.links
    N.remove(N["Principled BSDF"])
    tc = N.new("ShaderNodeTexCoord"); sep = N.new("ShaderNodeSeparateXYZ"); L.new(tc.outputs["Object"], sep.inputs[0])
    along = N.new("ShaderNodeMapRange"); along.inputs["From Min"].default_value = 0; along.inputs["From Max"].default_value = length
    along.inputs["To Min"].default_value = 1; along.inputs["To Max"].default_value = 0
    L.new(sep.outputs["Z"], along.inputs["Value"])
    lw = N.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.7
    edge = N.new("ShaderNodeMath"); edge.operation = "SUBTRACT"; edge.inputs[0].default_value = 1
    L.new(lw.outputs["Facing"], edge.inputs[1])
    f = N.new("ShaderNodeMath"); f.operation = "MULTIPLY"; L.new(along.outputs[0], f.inputs[0]); L.new(edge.outputs[0], f.inputs[1])
    f2 = N.new("ShaderNodeMath"); f2.operation = "POWER"; f2.inputs[1].default_value = 2.4; L.new(f.outputs[0], f2.inputs[0])
    em = N.new("ShaderNodeEmission"); em.inputs["Color"].default_value = (*color, 1); em.inputs["Strength"].default_value = strength
    tr = N.new("ShaderNodeBsdfTransparent")
    mix = N.new("ShaderNodeMixShader"); L.new(f2.outputs[0], mix.inputs[0]); L.new(tr.outputs[0], mix.inputs[1]); L.new(em.outputs[0], mix.inputs[2])
    L.new(mix.outputs[0], N["Material Output"].inputs["Surface"])
    m.surface_render_method = "BLENDED"; m.use_backface_culling = False
    ob = mesh_obj("beam", bm, m, smooth=True, subsurf=0)
    ob.parent = parent; ob.location = loc
    ob.rotation_euler = Vector(direction).to_track_quat("Z", "Y").to_euler()
    return ob
