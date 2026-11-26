"""Helpers for the sb_* scenes (field lines, particles on paths, coils). No Shot classes here."""
from common import *


def field_loops(a=1.3, phis=(40, 62, 84, 108, 132), eps=0.22, ds=0.025, both=True):
    """Closed field lines of a bar magnet along x, N pole at -a, S at +a (two-pole model).
    Each loop: N -> outside -> S -> straight back through the magnet -> N (the flow direction of B)."""
    N, S = np.array([-a, 0.0]), np.array([a, 0.0])

    def B(p):
        d1, d2 = p - N, p - S
        b = d1 / np.linalg.norm(d1) ** 3 - d2 / np.linalg.norm(d2) ** 3
        return b / np.linalg.norm(b)

    loops = []
    for ph in np.radians(phis):
        for sg in ((1, -1) if both else (1,)):
            p = N + eps * np.array([np.cos(ph), sg * np.sin(ph)])
            pts = [p.copy()]
            for _ in range(6000):
                p = p + B(p + B(p) * ds / 2) * ds
                pts.append(p.copy())
                if np.linalg.norm(p - S) < eps:
                    break
            pts.append(pts[0])
            loops.append(np.column_stack([np.array(pts), np.zeros(len(pts))]))
    return loops


def poly(pts, color=CYAN, width=3, opacity=1.0):
    m = VMobject(stroke_color=color, stroke_width=width, stroke_opacity=opacity)
    m.set_points_as_corners(np.asarray(pts, float))
    return m


def _cum(pts):
    return np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(pts, axis=0), axis=1))])


def flow(pts, n=10, speed=1.0, color=GOLD, r=0.055, arrows=False, opacity=1.0):
    """Particles running along polyline pts (wrapping end -> start).
    speed: number, ValueTracker or callable, in units/s; the sign sets the direction."""
    pts = np.asarray(pts, float)
    cum = _cum(pts)
    L = cum[-1]
    sp = speed.get_value if isinstance(speed, ValueTracker) else (speed if callable(speed) else (lambda: speed))
    if arrows:
        items = [VMobject(fill_color=color, fill_opacity=opacity, stroke_width=0) for _ in range(n)]
    else:
        items = [VGroup(Dot(radius=r * 2.6, color=color, fill_opacity=0.16 * opacity), Dot(radius=r, color=color, fill_opacity=opacity)) for _ in range(n)]
    g = VGroup(*items)
    g.s0 = 0.0

    def xy(s):
        s = s % L
        return np.column_stack([np.interp(s, cum, pts[:, 0]), np.interp(s, cum, pts[:, 1]), np.zeros(len(s))])

    def up(m, dt):
        m.s0 += sp() * dt
        s = m.s0 + np.arange(n) * L / n
        P = xy(s)
        if arrows:
            d = xy(s + 0.04 * np.sign(sp() or 1)) - P
            for i, a in enumerate(m):
                t = d[i] / (np.linalg.norm(d[i]) + 1e-9)
                nn = np.array([-t[1], t[0], 0])
                a.set_points_as_corners([P[i] + t * 0.15, P[i] - t * 0.09 + nn * 0.1, P[i] - t * 0.09 - nn * 0.1, P[i] + t * 0.15])
        else:
            for i, d in enumerate(m):
                d.move_to(P[i])

    up(g, 0)
    g.add_updater(up)
    return g


def coil_pts(turns=6, R=1.0, half=1.8, yaw=-0.25, pitch=0.25, scale=1.0, center=ORIGIN, axis="x", n_per=64, th0=np.pi):
    """Helix in 3D projected with proj(). Returns (screen points, depth>0 = front).
    axis x: (x, -R cos th, R sin th) starting at the bottom. axis y: (R cos th, y, -R sin th), current up = CCW from above."""
    th = np.linspace(0, 2 * np.pi * turns, int(turns * n_per) + 1)
    u = np.linspace(-half, half, len(th))
    if axis == "x":
        P3 = np.column_stack([u, -R * np.cos(th), R * np.sin(th)])
    else:
        P3 = np.column_stack([R * np.cos(th + th0), u, -R * np.sin(th + th0)])
    scr = np.array([proj(p, yaw, pitch, scale, center) for p in P3])
    # depth toward viewer in proj's frame (same rotations as proj)
    x, y, z = P3.T
    c, s = np.cos(yaw), np.sin(yaw)
    z2 = -s * x + c * z
    c, s = np.cos(pitch), np.sin(pitch)
    depth = s * y + c * z2
    return scr, depth


def coil(turns=6, R=1.0, half=1.8, color=COPPER, width=6, glow_c=GOLD, **k):
    """Copper helix split into (back, front) VGroups so things can pass through it. Also returns screen points."""
    scr, depth = coil_pts(turns, R, half, **k)
    back, front = VGroup(), VGroup()
    front_flag = depth > 0
    i = 0
    while i < len(scr) - 1:
        j = i
        while j < len(scr) - 1 and front_flag[j + 1] == front_flag[i]:
            j += 1
        seg = scr[i:j + 2]
        if len(seg) >= 2:
            if front_flag[i]:
                front.add(glow(poly(seg, color, width), glow_c, layers=3, opacity=0.12))
            else:
                back.add(poly(seg, color, width * 0.7, 0.55))
        i = j + 1
    return back, front, scr


def gauss_pulse(t, w=1.0):
    return np.exp(-(t / w) ** 2)


def label_arrow(a, b, color=GOLD):
    """Section label 'A -> B' with a drawn arrow (Inter has no arrow glyph)."""
    ta = Text(a.upper(), font=SANS, font_size=22, color=color, weight=BOLD)
    tb = Text(b.upper(), font=SANS, font_size=22, color=color, weight=BOLD)
    ar = Arrow(LEFT * 0.25, RIGHT * 0.25, buff=0, color=color, stroke_width=3, max_tip_length_to_length_ratio=0.4)
    return VGroup(ta, ar, tb).arrange(RIGHT, buff=0.12).to_edge(UP, buff=0.42)


def drive(scene, fn):
    """Run fn(dt) every frame (the camera frame is not in the scene, so its own updaters never run)."""
    m = Mobject()
    m.add_updater(lambda _m, dt: fn(dt))
    scene.add(m)
    return m
