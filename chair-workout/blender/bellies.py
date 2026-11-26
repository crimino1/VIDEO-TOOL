"""Anatomical muscle bellies for build_figure.py. Each belly is a soft dome on the rest body, placed either around a
limb bone (t along the bone 0..1, angle around it: 0 front, +90 outer side, 180 back) or on the torso (x from the
centre line, z height). Left side is given; the right side is mirrored. Returns per-group masks, a height offset per
vertex and a fibre coordinate per vertex (stripes run along each muscle)."""
import math
from mathutils import Vector

# limb bellies: (name, group, bone, t_centre, t_half, angle_centre, angle_half, depth_m)
LIMB = [
    ("delt_front", "shoulders", "upperarm", 0.10, 0.22, 35, 45, 0.010),
    ("delt_side", "shoulders", "upperarm", 0.10, 0.24, 95, 45, 0.011),
    ("delt_rear", "shoulders", "upperarm", 0.10, 0.22, 150, 40, 0.009),
    ("biceps", "biceps", "upperarm", 0.60, 0.30, -5, 55, 0.012),
    ("tri_long", "triceps", "upperarm", 0.52, 0.32, -160, 40, 0.010),
    ("tri_lat", "triceps", "upperarm", 0.45, 0.28, 140, 35, 0.009),
    ("brachiorad", "forearms", "lowerarm", 0.22, 0.24, 55, 45, 0.008),
    ("flexors", "forearms", "lowerarm", 0.30, 0.30, -55, 55, 0.007),
    ("extensors", "forearms", "lowerarm", 0.32, 0.30, 140, 50, 0.006),
    ("rect_fem", "quads", "thigh", 0.55, 0.46, 5, 45, 0.011),
    ("vast_lat", "quads", "thigh", 0.58, 0.42, 72, 45, 0.011),
    ("vast_med", "quads", "thigh", 0.80, 0.20, -50, 45, 0.013),
    ("adductor", "adductors", "thigh", 0.30, 0.30, -100, 40, 0.007),
    ("bi_fem", "hamstrings", "thigh", 0.55, 0.38, 150, 32, 0.009),
    ("semiten", "hamstrings", "thigh", 0.55, 0.38, -150, 32, 0.009),
    ("gastro_med", "calves", "calf", 0.30, 0.24, -152, 38, 0.012),
    ("gastro_lat", "calves", "calf", 0.27, 0.22, 148, 36, 0.011),
    ("soleus", "calves", "calf", 0.58, 0.14, 180, 70, 0.006),
    ("tibialis", "shins", "calf", 0.35, 0.30, 32, 24, 0.006),
]
# torso bellies: (name, group, x_centre, z_centre, x_half, z_half, facing 'front'|'back'|'side', depth_m, fibre)
TORSO = [("pec", "chest", 0.095, 1.325, 0.092, 0.072, "front", 0.013, "fan"),
         ("obliq", "obliques", 0.118, 1.10, 0.042, 0.095, "side", 0.007, "diag"),
         ("trap", "traps", 0.07, 1.47, 0.095, 0.075, "back", 0.008, "x"),
         ("lat", "back", 0.11, 1.27, 0.065, 0.13, "back", 0.009, "x"),
         ("glute", "glutes", 0.085, 0.915, 0.088, 0.088, "back", 0.010, "x")]
for col, (xc, xh) in enumerate([(0.034, 0.029)]):
    for row, (zc, zh) in enumerate([(1.232, 0.028), (1.17, 0.027), (1.107, 0.027), (1.035, 0.038)]):
        TORSO.append((f"abs{row}", "abs", xc, zc, xh, zh, "front", 0.007, "x"))

def build(me, vg_weight, bone, ss, eye):
    N = len(me.vertices)
    groups = sorted({b[1] for b in LIMB} | {b[1] for b in TORSO})
    G = {g: [0.0] * N for g in groups}
    height = [0.0] * N
    fib = [0.0] * N
    best = [0.0] * N
    for v in me.vertices:
        if v.index in eye: continue
        c, n = v.co, v.normal; i = v.index
        s = "l" if c.x > 0 else "r"; sx = 1 if s == "l" else -1
        torso_w = vg_weight(v, "spine_01", "spine_02", "spine_03", "pelvis", "clavicle_l", "clavicle_r", "neck_01")
        cands = []
        for name, grp, bn, tc, th, ac, ah, depth in LIMB:
            bw = vg_weight(v, f"{bn}_{s}")
            if bn == "upperarm" and grp == "shoulders": bw = max(bw, vg_weight(v, f"clavicle_{s}") * 0.8)
            if bw < 0.25: continue
            a, b = bone[f"{bn}_{s}"]; d = (b - a); L = d.length; du = d / L
            t = (c - a).dot(du) / L
            r = c - (a + du * t * L)
            front = Vector((0, -1, 0)); front = (front - du * front.dot(du)).normalized()
            out = du.cross(front) * (-sx if bn in ("upperarm", "lowerarm", "thigh", "calf") else 1)
            if out.dot(Vector((sx, 0, 0))) < 0: out = -out
            ang = math.degrees(math.atan2(r.dot(out), r.dot(front)))
            da = (ang - ac + 180) % 360 - 180
            rr = ((t - tc) / th) ** 2 + (da / ah) ** 2
            if rr < 1.8:
                cands.append((rr, grp, depth * bw, ang * r.length * 0.0174533 * 1.0))
        for name, grp, xc, zc, xh, zh, facing, depth, fstyle in TORSO:
            f = {"front": ss(0.05, 0.4, -n.y), "back": ss(0.05, 0.4, n.y), "side": ss(0.1, 0.5, abs(n.x) + 0.4 * max(0.0, -n.y))}[facing]
            if f < 0.05 or torso_w < 0.3: continue
            rr = ((abs(c.x) - xc) / xh) ** 2 + ((c.z - zc) / zh) ** 2
            if name == "pec":  # flatter top edge, rounder bottom
                rr = ((abs(c.x) - xc) / xh) ** 2 + (((c.z - zc) / zh) ** 2 if c.z < zc else ((c.z - zc) / (zh * 1.35)) ** 2)
            if rr < 1.8:
                fc = {"x": c.x, "fan": math.atan2(c.z - 1.42, abs(c.x) - 0.2) * 0.12, "diag": (c.x * sx + c.z) * 0.7}[fstyle]
                cands.append((rr, grp, depth * f * min(1.0, torso_w * 1.4), fc))
        for rr, grp, depth, fc in cands:
            dome = math.sqrt(max(0.0, 1.0 - min(rr, 1.0)))         # rounded muscle belly
            mask = 1.0 - ss(1.1, 1.6, rr)
            G[grp][i] = max(G[grp][i], mask)
            height[i] += depth * dome
            if mask > best[i]: best[i] = mask; fib[i] = fc
    return G, height, fib
