from sa_lib import *


# ------------------------------------------------------------------ 1820: two separate clubs
def bolt(h=1.6):
    pts = [(-0.22, 0.95), (0.38, 0.95), (0.06, 0.18), (0.42, 0.18), (-0.3, -0.98), (-0.06, -0.12), (-0.44, -0.12)]
    b = Polygon(*[np.array([x, y, 0]) for x, y in pts], fill_color=GOLD, fill_opacity=1, stroke_color="#fff2c4", stroke_width=2)
    b.height = h
    return b


class TwoThings(Shot):
    def body(self):
        drift(self, 0.03)
        clock = tracker_time(self)
        year = T("1820", 160, GOLD, weight=BOLD)
        yg = VGroup(glow(year.copy(), layers=4, width=1, opacity=0.07)[:-1], year)
        self.play(FadeIn(yg, scale=0.85), run_time=0.5)
        self.play(FadeIn(label("The year 1820")), run_time=0.3)

        L, R = np.array([-3.5, 0.15, 0]), np.array([3.5, 0.15, 0])
        cl = glow(Circle(radius=1.5, color=GOLD, stroke_width=5).move_to(L), layers=5)
        cr = glow(Circle(radius=1.5, color=CYAN, stroke_width=5).move_to(R), layers=5)
        spark = bolt(1.9).move_to(L)
        sg = glow(spark.copy().set_fill(opacity=0), layers=4, width=2, opacity=0.1)[:-1]
        zap = ValueTracker(0)
        rng = np.random.default_rng(3)

        def flicker(m):
            m.set_opacity(1 - zap.get_value() * rng.choice([0, 0, 0.55, 0.85]))

        spark.add_updater(flicker)
        # compass: ring, ticks, needle (coral = north tip)
        ring = Circle(radius=0.95, color=CYAN, stroke_width=3, fill_color="#06121f", fill_opacity=0.8).move_to(R)
        ticks = VGroup(*[Line(R + 0.8 * np.array([np.cos(a), np.sin(a), 0]), R + 0.92 * np.array([np.cos(a), np.sin(a), 0]), color=CYAN, stroke_width=2)
                         for a in np.linspace(0, TAU, 12, endpoint=False)])
        nmark = T("N", 24, CYAN, weight=BOLD).move_to(R + UP * 0.62)
        base = VGroup(Polygon(R + UP * 0.78, R + RIGHT * 0.13, R + LEFT * 0.13, fill_color=CORAL, fill_opacity=1, stroke_width=0),
                      Polygon(R + DOWN * 0.78, R + RIGHT * 0.13, R + LEFT * 0.13, fill_color=INK, fill_opacity=1, stroke_width=0))
        ang = ValueTracker(2.3)
        needle = base.copy()
        needle.add_updater(lambda m: m.become(base.copy().rotate(ang.get_value() + 0.12 * np.sin(1.3 * clock.get_value()) * (ang.get_value() > 0.3), about_point=R)))
        hub = Dot(R, radius=0.07, color=INK)
        ne = T("ELECTRICITY", 40, GOLD, weight=BOLD).move_to(L + DOWN * 2.0)
        nm = T("MAGNETISM", 40, CYAN, weight=BOLD).move_to(R + DOWN * 2.0)
        self.go("0:41.45", yg.animate.scale(0.45).move_to(UP * 2.5), run=0.7)
        self.play(Create(cl), Create(cr), FadeIn(spark, scale=0.6), FadeIn(sg), FadeIn(ring), FadeIn(ticks), FadeIn(nmark), FadeIn(needle), FadeIn(hub),
                  FadeIn(ne, shift=UP * 0.15), FadeIn(nm, shift=UP * 0.15), run_time=0.8)
        # 'zappy stuff'
        self.go("0:45.17", zap.animate.set_value(1), Flash(L, color=GOLD, line_length=0.45, flash_radius=1.55, num_lines=14), run=0.5)
        # needle swings to north with a damped wobble
        self.go("0:47.45", ang.animate(rate_func=lambda a: 1 - np.exp(-5 * a) * np.cos(11 * a)).set_value(0), run=2.6)
        s1 = [T("different stuff", 36).move_to(p + DOWN * 2.62) for p in (L, R)]
        s2 = [T("different rules", 36).move_to(p + DOWN * 3.2) for p in (L, R)]
        self.go("0:51.19", *[FadeIn(m, shift=UP * 0.1) for m in s1], run=0.35)
        self.go("0:52.29", *[FadeIn(m, shift=UP * 0.1) for m in s2], run=0.35)
        wall = glow(Rectangle(width=0.28, height=6.6, stroke_width=0, fill_color=CORAL, fill_opacity=1), CORAL, layers=5, width=4).move_to(DOWN * 0.45)
        wall.shift(UP * 8)
        self.go("0:53.25", FadeOut(yg), wall.animate.shift(DOWN * 8), run=0.3, rate_func=rate_functions.ease_in_quad)
        self.play(Wiggle(wall, scale_value=1.02, rotation_angle=0.025), Flash(wall.get_bottom() + UP * 0.2, color=CORAL, flash_radius=0.5, line_length=0.35), run_time=0.5)


# ------------------------------------------------------------------ Ørsted's class demo, table top in fixed 3D
YAW, PITCH, SC, CEN = -0.28, -0.85, 1.12, np.array([0, -1.0, 0])


def P(p):
    return proj(p, YAW, PITCH, SC, CEN)


def cuboid(x0, x1, y0, y1, z0, z1, color, yaw=YAW, pitch=PITCH, pf=P):
    """Visible faces of a box (shaded), as a VGroup of polygons."""
    c = [[x0, x1], [y0, y1], [z0, z1]]
    faces = VGroup()
    for ax in range(3):
        for side in range(2):
            n = np.zeros(3)
            n[ax] = 1 if side else -1
            if rot_z(n, yaw, pitch) >= 0:
                continue
            o = [(a, b) for a in range(3) for b in range(3) if a < b and ax not in (a, b)][0]
            pts = []
            for u, v in [(0, 0), (1, 0), (1, 1), (0, 1)]:
                q = [0, 0, 0]
                q[ax] = c[ax][side]
                q[o[0]], q[o[1]] = c[o[0]][u], c[o[1]][v]
                pts.append(pf(q))
            shade = {1: interpolate_color(ManimColor(color), WHITE, 0.25), 0: ManimColor(color), 2: interpolate_color(ManimColor(color), BLACK, 0.3)}[ax]
            faces.add(Polygon(*pts, fill_color=shade, fill_opacity=1, stroke_color=WHITE, stroke_width=1.2))
    return faces


def flat_ring(c, r, n=72):
    return [P((c[0] + r * np.cos(a), c[1], c[2] + r * np.sin(a))) for a in np.linspace(0, TAU, n, endpoint=False)]


class Oersted(Shot):
    def body(self):
        drift(self, 0.035)
        clock = tracker_time(self)
        self.add(label("The class demo"))
        table = Polygon(*[P(q) for q in [(-5.5, 0, -1.9), (5.5, 0, -1.9), (5.5, 0, 3.2), (-5.5, 0, 3.2)]], fill_color="#0c1a2c", fill_opacity=0.9,
                        stroke_color=FAINT, stroke_width=2)
        bat = VGroup(cuboid(-0.8, 0, 0, 0.6, 2.05, 2.75, CYAN), cuboid(0, 0.8, 0, 0.6, 2.05, 2.75, GOLD))
        top = lambda x: P((x, 0.6, 2.4)) + UP * 0.02
        bl = VGroup(T("−", 40, "#05101c", weight=BOLD).move_to(top(-0.4)), T("+", 40, "#05101c", weight=BOLD).move_to(top(0.4)))
        path3 = [(0.8, 0.3, 2.4), (4.3, 0.03, 2.4), (4.3, 0.03, 0), (4.3, 0.5, 0), (-4.3, 0.5, 0), (-4.3, 0.03, 0), (-4.3, 0.03, 2.4), (-0.8, 0.3, 2.4)]
        pts = np.array([P(q) for q in path3])
        wire = VMobject(stroke_color=COPPER, stroke_width=6).set_points_as_corners(pts)
        wire_g = glow(wire.copy(), COPPER, layers=3, opacity=0.08)
        self.play(FadeIn(table), run_time=0.4)
        self.play(FadeIn(bat), FadeIn(bl), Create(wire_g), run_time=1.3)

        # compass under the wire, needle along the wire (north = +x)
        C = np.array([0.0, 0.02, 0.0])
        rim = Polygon(*flat_ring(C, 1.15), fill_color="#06121f", fill_opacity=0.95, stroke_color=CYAN, stroke_width=4)
        rim_g = glow(rim.copy(), CYAN, layers=4, opacity=0.08)[:-1]
        ticks = VGroup(*[Line(P(C + 0.95 * np.array([np.cos(a), 0, np.sin(a)])), P(C + 1.1 * np.array([np.cos(a), 0, np.sin(a)])), color=CYAN, stroke_width=2)
                         for a in np.linspace(0, TAU, 12, endpoint=False)])
        ang = ValueTracker(0.0)
        shake = ValueTracker(0.0)
        rng = np.random.default_rng(7)

        def needle_pts(a):
            d, s = np.array([np.cos(a), 0, np.sin(a)]), np.array([-np.sin(a), 0, np.cos(a)])
            tip, tail, w = C + 0.95 * d, C - 0.95 * d, 0.15
            return [P(tip), P(C + w * s), P(C - w * s)], [P(tail), P(C + w * s), P(C - w * s)]

        nn = Polygon(*needle_pts(0)[0], fill_color=CORAL, fill_opacity=1, stroke_width=0)
        ns = Polygon(*needle_pts(0)[1], fill_color=INK, fill_opacity=1, stroke_width=0)

        def up_needle(m):
            a = ang.get_value() + shake.get_value() * (0.05 * np.sin(23 * clock.get_value()) + 0.03 * rng.standard_normal())
            n_, s_ = needle_pts(a)
            nn.set_points_as_corners([*n_, n_[0]])
            ns.set_points_as_corners([*s_, s_[0]])

        needle = VGroup(nn, ns)
        needle.add_updater(up_needle)
        hub = Dot(P(C), radius=0.06, color=INK)
        cmp = VGroup(rim_g, rim, ticks, needle, hub)
        self.go("1:00.83", FadeIn(cmp, scale=0.8), run=0.6)
        # wire drawn over the compass (it is above it)
        self.remove(wire_g)
        self.add(wire_g)
        self.play(ang.animate.set_value(0.06), run_time=1.2, rate_func=there_and_back)

        # current: gold dots stream along the wire
        seg = np.linalg.norm(np.diff(pts, axis=0), axis=1)
        cum = np.concatenate([[0], np.cumsum(seg)])
        total = cum[-1]
        n = int(total / 0.6)
        flow = ValueTracker(0)
        dots = VGroup(*[glow_dot(GOLD, r=0.06, layers=3) for _ in range(n)])
        base_op = [m.get_fill_opacity() for m in dots[0]]

        def up_dots(g):
            off = 1.9 * clock.get_value()
            for i, d in enumerate(g):
                s = (i * total / n + off) % total
                j = min(np.searchsorted(cum, s, side="right") - 1, len(seg) - 1)
                d.move_to(pts[j] + (pts[j + 1] - pts[j]) * (s - cum[j]) / seg[j])
                for k, sub in enumerate(d):
                    sub.set_fill(opacity=base_op[k] * flow.get_value())

        up_dots(dots)
        dots.add_updater(up_dots)
        self.add(dots)
        cur = H("current", 44, GOLD).move_to(P((-3.0, 0, -1.2)))
        self.go("1:03.63", flow.animate.set_value(1), FadeIn(cur), run=0.8)
        # the needle swings 90 degrees (to +z, away from us) with an overshoot wobble
        tgt = P(C) + RIGHT * 1.3 + DOWN * 0.45
        lab = H("it moved!", 54, CORAL).move_to([4.2, -3.0, 0])
        arr = doodle_arrow(lab.get_left() + LEFT * 0.15, tgt, CORAL, width=5, angle=-0.8)
        # swing (1.6 s) with the doodle landing on 1:08.07 inside it
        self.go("1:07.35", ang.animate(rate_func=lambda a: 1 - np.exp(-4.5 * a) * np.cos(10 * a)).set_value(PI / 2),
                Succession(Wait(0.72), AnimationGroup(Write(lab), Create(arr), run_time=0.5), Wait(0.38)), run=1.6)
        self.go("1:09.17", shake.animate.set_value(1), run=0.4)


# ------------------------------------------------------------------ Faraday: magnet, coil, field lines
MAG_C = np.array([-1.5, -0.15, 0])
POLE = 1.55
BOX = (-6.7, 6.7, -3.25, 3.15)


def _field(p):
    n, s = MAG_C + LEFT * POLE, MAG_C + RIGHT * POLE
    a, b = p - n, p - s
    return a / np.linalg.norm(a) ** 3 - b / np.linalg.norm(b) ** 3


def _trace(p, sign, end):
    out = [p.copy()]
    for _ in range(4000):
        f = _field(p)
        p = p + sign * 0.025 * f / np.linalg.norm(f)
        out.append(p.copy())
        if np.linalg.norm(p - end) < 0.1 or not (BOX[0] < p[0] < BOX[1] and BOX[2] < p[1] < BOX[3]):
            return np.array(out), np.linalg.norm(p - end) < 0.1
    return np.array(out), False


def field_lines():
    """Hand-wobbly white field lines of the bar magnet (VGroup), out of N (left), round into S (right)."""
    n, s = MAG_C + LEFT * POLE, MAG_C + RIGHT * POLE
    rng = np.random.default_rng(11)
    lines = VGroup()
    for deg in [24, 42, 62, 86, 114, 148]:
        for sg in (1, -1):
            a = np.radians(deg) * sg
            pts, closed = _trace(n + 0.12 * np.array([np.cos(a), np.sin(a), 0]), 1, s)
            parts = [pts]
            if not closed:  # mirror half that comes back into S from the right
                b = PI - a
                back, _ = _trace(s + 0.12 * np.array([np.cos(b), np.sin(b), 0]), -1, n)
                parts.append(back)
            for q in parts:
                q = q[::3]
                tan = np.gradient(q, axis=0)
                nor = np.column_stack([-tan[:, 1], tan[:, 0], 0 * tan[:, 0]])
                nor /= np.linalg.norm(nor, axis=1, keepdims=True) + 1e-9
                u = np.arange(len(q)) * 0.075
                ph = rng.uniform(0, TAU, 2)
                q = q + nor * (0.03 * np.sin(2.1 * u + ph[0]) + 0.015 * np.sin(5.3 * u + ph[1]))[:, None]
                lines.add(VMobject(stroke_color=INK, stroke_width=3, stroke_opacity=0.92).set_points_smoothly(q))
    return lines


def filings():
    rng = np.random.default_rng(5)
    g = VGroup()
    while len(g) < 200:
        p = np.array([rng.uniform(-6.3, 6.3), rng.uniform(-3.0, 2.9), 0])
        if abs(p[1] - MAG_C[1]) < 0.85 and abs(p[0] - MAG_C[0]) < 2.5:
            continue
        f = _field(p)
        d = f / np.linalg.norm(f) * 0.07
        g.add(Line(p - d, p + d, color="#c8d0e0", stroke_width=3, stroke_opacity=0.75))
    return g


def coil():
    c = np.array([4.7, -0.15, 0])
    th = np.linspace(0, TAU * 7, 700)
    u = th / th[-1]
    pts = np.column_stack([c[0] - 0.95 + 1.9 * u + 0.16 * np.sin(th), c[1] + 0.72 * np.cos(th), 0 * th])
    m = VMobject(stroke_color=COPPER, stroke_width=5).set_points_smoothly(pts)
    return glow(m, GOLD, layers=4, opacity=0.07)


def notebook():
    g = VGroup(*[Line([-8, y, 0], [8, y, 0], color=FAINT, stroke_width=1.5, stroke_opacity=0.55) for y in np.arange(-3.85, 3.9, 0.55)])
    g.add(Line([-6.2, -5, 0], [-6.2, 5, 0], color=CORAL, stroke_width=1.5, stroke_opacity=0.25))
    return g


def magnet():
    return bar_magnet(4.0, 0.95).move_to(MAG_C).set_z_index(2)


class FaradayLines(Shot):
    def body(self):
        drift(self, 0.03)
        nb = notebook()
        self.add(nb)
        mg = magnet()
        self.play(FadeIn(mg, shift=UP * 0.2), run_time=0.5)
        for t in ("1:30.05", "1:30.75"):  # poked
            self.go(t, mg.animate(rate_func=there_and_back).shift(RIGHT * 0.25).rotate(-0.06), run=0.45)
        cl = coil()
        self.go("1:31.54", Create(cl), run=1.4)
        fl = field_lines()
        self.go("1:33.44", LaggedStart(*[Create(l) for l in fl], lag_ratio=0.12), run=1.6)
        self.go("1:35.10", LaggedStart(*[FadeIn(f, scale=0.3) for f in filings()], lag_ratio=0.004), run=1.3)


class ToMath(Shot):
    def body(self):
        drift(self, 0.03, start=0.97)
        nb, mg, cl, fl, fi = notebook(), magnet(), coil(), field_lines(), filings()
        self.add(nb, cl, fl, fi, mg)
        pic = portrait("maxwell", h=2.7).move_to([5.0, 0.55, 0])
        name = VGroup(T("James Clerk", 30), T("Maxwell", 30, weight=BOLD)).arrange(DOWN, buff=0.1).next_to(pic, DOWN, buff=0.25)
        sketch = VGroup(fl, mg)
        self.play(FadeOut(cl), FadeOut(fi), sketch.animate.scale(0.6, about_point=ORIGIN).shift(LEFT * 2.3), nb.animate.set_opacity(0.35),
                  FadeIn(pic, shift=LEFT * 0.4), FadeIn(name, shift=LEFT * 0.4), run_time=0.7)
        e = maxwell_eqs(46, buff_h=0.8, buff_v=0.85).move_to([-1.35, 0.2, 0])
        self.go("1:38.95", Transform(fl, e), FadeOut(mg), run=0.8)
        g = eq_glow(e, layers=3, opacity=0.06)
        self.go("1:39.83", FadeIn(g), fl.animate(rate_func=there_and_back).scale(1.06), run=0.6)
