"""Builder 10: start of Chapter 4. Average vs instantaneous speed (a chalk car with its distance-time graph,
a speedometer), average rate of change = slope of a secant, the slope at one point, the h table,
the secant swinging into the tangent, the limit definition, and using it on x^2 at 3 and at any x."""
from common import *

LIM0 = r"\lim_{h\to 0}"
sq = lambda x: x * x


# ---------------------------------------------------------------- local helpers

def fr(top, bot, size=64, color=CHALK):
    """Hand-built fraction so single pieces can be coloured or struck: .n (numerator parts), .bar, .d."""
    n = M(*top, size=size, color=color) if isinstance(top, (list, tuple)) else M(top, size=size, color=color)
    d = M(*bot, size=size, color=color) if isinstance(bot, (list, tuple)) else M(bot, size=size, color=color)
    w = max(n.width, d.width) + 0.2
    bar = Line([-w / 2, 0, 0], [w / 2, 0, 0], color=color, stroke_width=4)
    n.next_to(bar, UP, buff=0.13)
    d.next_to(bar, DOWN, buff=0.13)
    g = VGroup(n, bar, d)
    g.n, g.bar, g.d = n, bar, d
    return g


def def_row(lhs, top, bot, size=64, center=ORIGIN):
    """lhs = lim_{h->0} fraction, all level with the fraction bar. .l .e .lim .f"""
    l = M(lhs, size=size, color=PINK)
    e = M("=", size=size)
    lim = M(LIM0, size=size)
    f = fr(top, bot, size)
    l.next_to(e, LEFT, buff=0.22)
    lim.next_to(e, RIGHT, buff=0.22)
    f.next_to(lim, RIGHT, buff=0.18)
    by = f.bar.get_y()
    e.shift(UP * (by - e.get_y()))
    l.shift(UP * (by - l.get_y()))
    lim.shift(UP * (by - lim[0][0:3].get_y() + 0.04))
    g = VGroup(l, e, lim, f)
    g.shift(np.array(center, float) - g.get_center())
    g.l, g.e, g.lim, g.f = l, e, lim, f
    return g


def frac_at(row, top, bot, size=64):
    """A new fraction placed where row's fraction sits (same left edge, same bar height)."""
    f = fr(top, bot, size)
    f.shift(row.f.bar.get_center() - f.bar.get_center())
    f.shift(RIGHT * (row.f.get_left()[0] - f.get_left()[0]))
    return f


def morph_frac(row, new, pairs=None, extra=()):
    """Animations turning row.f into new (pairs = [(old part, new part)] for the numerator); row.f becomes new."""
    old = row.f
    anims = [ReplacementTransform(old.bar, new.bar), ReplacementTransform(old.d, new.d)]
    if pairs is None:
        anims.append(ReplacementTransform(old.n, new.n))
    else:
        anims += [ReplacementTransform(a, b) for a, b in pairs]
    row.f = new
    return anims + list(extra)


_DG = {}


def digits(s, size=48, color=CHALK):
    """A number built from cached glyphs (cheap to redraw every frame, no new LaTeX per value)."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.035, aligned_edge=DOWN)
    return g


def sec_line(ax, f, x, h, color=ORG, back=2.0, front=1.0, width=5):
    """Line through (x, f(x)) and (x+h, f(x+h)); about `back` units behind P, at least `front` past Q (screen units).
    As h -> 0 it becomes the tangent, centred on P."""
    p, q = np.array(ax.c2p(x, f(x))), np.array(ax.c2p(x + h, f(x + h)))
    dist = np.linalg.norm(q - p)
    if dist < 1e-4:
        q = np.array(ax.c2p(x + 1e-3, f(x) + slope(f, x) * 1e-3))
    d = (q - p) / np.linalg.norm(q - p)
    return Line(p - d * back, p + d * max(front + dist, back), color=color, stroke_width=width).set_z_index(3)


def arrow_to(p, q, color=YEL):
    return Arrow(np.array(p, float), np.array(q, float), buff=0.08, color=color, stroke_width=3, tip_length=0.15,
                 max_tip_length_to_length_ratio=0.35)


def ring(mob, color=ORG, buff=0.12):
    return Circle(radius=max(mob.width, mob.height) / 2 + buff, color=color, stroke_width=4).move_to(mob)


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


# ---------------------------------------------------------------- drawings

def car():
    """Side view of a small car, facing right, wheels resting on y = 0."""
    body = VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners(
        [[-0.78, 0.14, 0], [0.78, 0.14, 0], [0.8, 0.38, 0], [0.42, 0.44, 0], [0.2, 0.7, 0], [-0.4, 0.7, 0],
         [-0.6, 0.44, 0], [-0.8, 0.4, 0], [-0.78, 0.14, 0]])
    win = VGroup(Line([-0.5, 0.44, 0], [0.36, 0.44, 0], color=DIM, stroke_width=3),
                 Line([-0.08, 0.44, 0], [-0.08, 0.68, 0], color=DIM, stroke_width=3))
    light = Line([0.7, 0.3, 0], [0.8, 0.3, 0], color=YEL, stroke_width=4)
    wheels = VGroup(*[Circle(radius=0.15, stroke_color=CHALK, stroke_width=4, fill_color=config.background_color,
                             fill_opacity=1).move_to([x, 0.15, 0]) for x in (-0.45, 0.45)])
    hubs = VGroup(*[Dot([x, 0.15, 0], radius=0.035, color=DIM) for x in (-0.45, 0.45)])
    return VGroup(body, win, light, wheels, hubs)


def stopwatch(c, r=1.25):
    c = np.array(c, float)
    g = VGroup(Circle(radius=r, color=CHALK, stroke_width=5).move_to(c),
               Line(c + UP * r, c + UP * (r + 0.2), color=CHALK, stroke_width=6),
               RoundedRectangle(width=0.4, height=0.16, corner_radius=0.05, color=CHALK, stroke_width=4).move_to(c + UP * (r + 0.28)))
    for k in range(12):
        a = PI / 2 - k * TAU / 12
        u = np.array([np.cos(a), np.sin(a), 0])
        g.add(Line(c + u * (r - (0.22 if k % 3 == 0 else 0.13)), c + u * (r - 0.03), color=DIM, stroke_width=3))
    return g


# the trip: 120 km in 2 h, slow at traffic lights, fast on the highway, stopped for snacks
_TK = [0.00, 0.05, 0.12, 0.17, 0.36, 0.41, 0.45, 0.55, 1.05, 1.12, 1.17, 1.40, 1.45, 1.55, 1.95, 2.00]
_VK = [30, 45, 40, 5, 5, 40, 70, 100, 100, 60, 0, 0, 40, 75, 75, 50]
_TT = np.linspace(0, 2, 2001)
_VV = np.interp(_TT, _TK, _VK)
_DD = np.concatenate([[0], np.cumsum((_VV[1:] + _VV[:-1]) / 2 * np.diff(_TT))])
_DD *= 120 / _DD[-1]


def dist(t):
    return float(np.interp(t, _TT, _DD))


RY, X0, X1 = 1.0, -5.5, 5.5          # road height, start and end of the trip on screen


def trip_axes():
    ax = axes((0, 2.4, 1), (0, 165, 60), x_length=5.4, y_length=2.9, center=(-2.6, -1.75, 0), nums=False,
              x_label="t", y_label="d")
    ax.labels.add(M(r"2\,\text{h}", size=34, color=DIM).next_to(ax.c2p(2, 0), DOWN, buff=0.12),
                  M("120", size=34, color=DIM).next_to(ax.c2p(0, 120), LEFT, buff=0.12))
    return ax


def dial_angle(v):
    return (210 - v / 140 * 240) * DEGREES


DC, DR_ = np.array([-3.0, -1.15, 0]), 2.1   # speedometer centre and radius


def speedometer():
    g = VGroup(Arc(radius=DR_, start_angle=210 * DEGREES, angle=-240 * DEGREES, arc_center=DC, color=CHALK, stroke_width=5))
    for v in range(0, 141, 20):
        a = dial_angle(v)
        u = np.array([np.cos(a), np.sin(a), 0])
        g.add(Line(DC + u * (DR_ - 0.22), DC + u * (DR_ - 0.02), color=CHALK, stroke_width=4))
        g.add(M(str(v), size=30, color=DIM).move_to(DC + u * (DR_ - 0.55)))
        if v < 140:
            a2 = dial_angle(v + 10)
            u2 = np.array([np.cos(a2), np.sin(a2), 0])
            g.add(Line(DC + u2 * (DR_ - 0.13), DC + u2 * (DR_ - 0.02), color=DIM, stroke_width=3))
    g.add(M(r"\text{km/h}", size=34, color=DIM).move_to(DC + DOWN * 0.75))
    return g


def needle(v):
    a = dial_angle(v)
    return VGroup(Line(DC, DC + 1.65 * np.array([np.cos(a), np.sin(a), 0]), color=ORG, stroke_width=6),
                  Dot(DC, radius=0.1, color=ORG))


# x^2 board shared by AvgEx, Problem and the table
def sq_axes():
    return axes((0, 5, 1), (0, 20, 4), x_length=5.2, y_length=5.0, center=(-3.5, -0.75, 0))


def sq_curve(ax):
    return curve(ax, sq, (0, 4.4))


# ================================================================ the big question

class K10_Question(Shot):
    def body(self):
        self.title("Where Calculus Begins", "59:47.66")
        ps = [pill("Functions", BLUE, 42), pill("Limits", YEL, 42), pill("Derivatives", PINK, 42)]
        row = VGroup(*ps).arrange(RIGHT, buff=1.0).move_to([0, 0.3, 0])
        arrs = [Arrow(ps[i].get_right(), ps[i + 1].get_left(), buff=0.15, color=DIM, stroke_width=4, tip_length=0.2) for i in range(2)]
        self.go("59:50.60", FadeIn(ps[0], shift=UP * 0.15), run=0.5)
        self.go("59:51.28", GrowArrow(arrs[0]), FadeIn(ps[1], shift=UP * 0.15), run=0.5)
        self.go("59:52.20", GrowArrow(arrs[1]), run=0.4)
        self.go("59:53.40", FadeIn(ps[2], shift=UP * 0.15), run=0.5)
        self.play(Circumscribe(ps[2], color=PINK, buff=0.12), run_time=0.8)
        # how fast, right now: a stopwatch running, then frozen at one instant
        self.wipe("59:55.30", run=0.35)
        c = np.array([-3.0, -0.75, 0])
        sw = stopwatch(c)
        clock = tracker_time(self)
        hand = always_redraw(lambda: Line(c, c + 1.0 * np.array([np.cos(PI / 2 - 1.6 * clock.get_value()),
                                                                 np.sin(PI / 2 - 1.6 * clock.get_value()), 0]),
                                          color=ORG, stroke_width=6))
        hub = Dot(c, radius=0.08, color=ORG).set_z_index(2)
        q = H("how fast?", 54, PINK).move_to([2.6, 0.3, 0])
        self.go("59:55.66", Create(sw), FadeIn(hand), FadeIn(hub), FadeIn(q, shift=UP * 0.15), run=0.7)
        now = H("right now", 50, YEL).next_to(q, DOWN, buff=0.45)
        self.go("59:57.22", FadeIn(now, shift=UP * 0.15), run=0.5)
        self.at("59:58.82")
        hand.clear_updaters()
        clock.clear_updaters()
        a = PI / 2 - 1.6 * clock.get_value()
        tip = c + 1.0 * np.array([np.cos(a), np.sin(a), 0])
        mark = Dot(tip, radius=0.11, color=PINK).set_z_index(3)
        self.play(FadeIn(mark, scale=0.5), hand.animate.set_color(PINK), run_time=0.4)
        u = under(now, YEL)
        self.go("59:59.40", Create(u), run=0.5)


# ================================================================ average speed: the car and its graph

class K10_Average(Shot):
    def body(self):
        self.title("Average Speed", "1:00:03.28")
        road = VGroup(Line([-6.5, RY, 0], [6.5, RY, 0], color=CHALK, stroke_width=4),
                      Line([X0, RY - 0.1, 0], [X0, RY + 0.1, 0], color=DIM, stroke_width=3),
                      Line([X1, RY - 0.1, 0], [X1, RY + 0.1, 0], color=DIM, stroke_width=3))
        u = ValueTracker(0)
        auto = car()
        auto.add_updater(lambda m: m.move_to([X0 + dist(u.get_value()) / 120 * (X1 - X0), RY + m.height / 2, 0]))
        self.go("1:00:04.96", Create(road), FadeIn(auto), run=0.6)
        km = M(r"120\ \text{km}", size=40, color=ORG).move_to([0, RY - 0.45, 0])
        dim = VGroup(arrow_to(km.get_left() + LEFT * 0.1, [X0, RY - 0.45, 0], DIM),
                     arrow_to(km.get_right() + RIGHT * 0.1, [X1, RY - 0.45, 0], DIM))
        self.go("1:00:05.66", FadeIn(km), GrowArrow(dim[0]), GrowArrow(dim[1]), run=0.6)
        ax = trip_axes()
        self.go("1:00:06.40", Create(ax), FadeIn(ax.labels), run=0.6)
        trace = always_redraw(lambda: ax.plot(dist, x_range=[0, max(u.get_value(), 0.01), 0.01], color=BLUE, stroke_width=5))
        dot = always_redraw(lambda: pt(ax, u.get_value(), dist(u.get_value()), YEL))
        self.add(trace, dot)
        self.go("1:00:07.00", u.animate.set_value(2), run=2.0, rate_func=linear)
        auto.clear_updaters()
        trace.clear_updaters()
        dot.clear_updaters()
        # average speed = 120 / 2
        r1 = M(r"\text{average speed}", "=", r"\frac{\Delta d}{\Delta t}", size=50).move_to([4.0, -0.45, 0])
        r1[0].set_color(YEL)
        r2 = M(r"\frac{120\,\text{km}}{2\,\text{h}}", "=", r"60\ \text{km/h}", size=54).move_to([4.15, -2.25, 0])
        r2[2].set_color(ORG)
        self.go("1:00:09.10", Write(r1[0]), run=0.6)
        self.go("1:00:09.98", Write(r2[0]), run=1.0)
        self.go("1:00:11.86", Write(r2[1]), Write(r2[2]), run=0.8)
        rr = rise_run(ax, 0, 0, 2, 120, color=PINK, size=34)
        dd_l = M(r"\Delta d = 120", size=34, color=PINK).next_to(rr[1], RIGHT, buff=0.12)
        dt_l = M(r"\Delta t = 2\,\text{h}", size=34, color=PINK).next_to(ax.c2p(1, 0), DOWN, buff=0.2)
        self.go("1:00:14.10", Create(rr[1]), FadeIn(dd_l), run=0.6)
        self.go("1:00:15.74", rr[0].animate.set_color(PINK), FadeIn(dt_l), run=0.6)
        self.add(rr[0])
        self.go("1:00:19.60", Write(r1[1]), Write(r1[2]), run=0.8)
        # but you were not going 60 the whole time
        chord = DashedLine(ax.c2p(0, 0), ax.c2p(2, 120), color=DIM, stroke_width=3, dash_length=0.1)
        self.go("1:00:21.54", FadeOut(rr), FadeOut(dt_l), FadeOut(dd_l), run=0.4)
        self.play(Create(chord), run_time=0.7)
        self.go("1:00:23.40", Circumscribe(trace, color=BLUE, buff=0.1, stroke_width=3), run=1.0)

        def piece(a, b, text, lab_pos, aim_t):
            seg_ = ax.plot(dist, x_range=[a, b, 0.005], color=YEL, stroke_width=8).set_z_index(4)
            lab = H(text, 36, YEL).move_to(lab_pos)
            aim = ax.c2p(aim_t, dist(aim_t))
            return VGroup(seg_, lab, arrow_to(lab.get_bottom() if lab_pos[1] > aim[1] else lab.get_top(), aim))
        p1 = piece(0.15, 0.38, "traffic lights", ax.c2p(0.62, 110), 0.27)
        p2 = piece(0.55, 1.05, "highway", ax.c2p(0.4, 72), 0.75)
        p3 = piece(1.17, 1.40, "snack stop", ax.c2p(1.3, 140), 1.29)
        self.go("1:00:25.48", Create(p1[0]), FadeIn(p1[1]), GrowArrow(p1[2]), run=0.6)
        self.go("1:00:27.36", FadeOut(p1), Create(p2[0]), FadeIn(p2[1]), GrowArrow(p2[2]), run=0.6)
        self.go("1:00:29.30", FadeOut(p2), Create(p3[0]), FadeIn(p3[1]), GrowArrow(p3[2]), run=0.6)
        self.go("1:00:30.84", FadeOut(p3), chord.animate.set_color(ORG), run=0.5)
        self.play(Circumscribe(r2[2], color=ORG, buff=0.1), run_time=0.9)


# ================================================================ the speedometer: right now

class K10_Speedo(Shot):
    def body(self):
        self.title("The Speedometer", "1:00:33.22")
        v = ValueTracker(30)
        dial = speedometer()
        ndl = always_redraw(lambda: needle(v.get_value()))
        read = always_redraw(lambda: digits(str(int(round(v.get_value()))), 56, ORG).move_to(DC + DOWN * 1.55))
        self.go("1:00:33.66", Create(dial), FadeIn(ndl), FadeIn(read), run=0.9)
        self.go("1:00:34.60", v.animate.set_value(58), run=0.7)
        self.play(v.animate.set_value(49), run_time=0.6)
        self.go("1:00:36.14", v.animate.set_value(72), run=0.6)
        ndl.clear_updaters()
        read.clear_updaters()
        self.play(read.animate.set_color(PINK), ndl.animate.set_color(PINK), run_time=0.3)
        # average vs right now
        la = H("trip average", 38, DIM).move_to([3.6, 1.35, 0])
        va = M(r"60\ \text{km/h}", size=52, color=DIM).next_to(la, DOWN, buff=0.2)
        lb = H("right now", 42, PINK).move_to([3.6, -0.35, 0])
        vb = M(r"72\ \text{km/h}", size=60, color=PINK).next_to(lb, DOWN, buff=0.2)
        self.go("1:00:38.56", FadeIn(la), Write(va), run=0.6)
        self.go("1:00:40.36", FadeIn(lb), TransformFromCopy(read, vb), run=0.7)
        lb2 = H("instantaneous speed", 42, YEL).move_to(lb)
        self.go("1:00:42.80", ReplacementTransform(lb, lb2), run=0.6)
        self.go("1:00:44.90", Circumscribe(VGroup(read, ndl), Circle, color=PINK, buff=0.15), run=0.9)
        der = pill("the derivative", PINK, 40).next_to(vb, DOWN, buff=0.45)
        self.go("1:00:47.10", FadeIn(der, shift=UP * 0.15), run=0.5)
        # how do we calculate that with maths?
        self.go("1:00:49.30", FadeOut(VGroup(la, va, lb2, vb, der)), run=0.5)
        f = VGroup(M(r"\text{speed}", "=", size=60), fr([r"\Delta d"], [r"\Delta t"], size=60)).arrange(RIGHT, buff=0.25)
        f[0].shift(UP * (f[1].bar.get_y() - f[0][1].get_y()))
        f.move_to([3.4, 0.5, 0])
        self.go("1:00:51.74", Write(f), run=0.8)
        z = M(r"\Delta t", "=", r"0\ ?", size=52, color=RED).move_to([3.4, -1.5, 0])
        self.go("1:00:52.64", f[1].d.animate.set_color(RED), Create(ring(f[1].d, RED, 0.08)), FadeIn(z, shift=UP * 0.15), run=0.6)


# ================================================================ average rate of change = slope of a secant

def fa(x):
    return 0.15 * x * x + 0.6


class K10_AvgRate(Shot):
    def body(self):
        self.title("Average Rate of Change", "1:00:54.84")
        ax = axes((0, 6, 1), (0, 6, 1), x_length=5.8, y_length=4.4, center=(-3.4, -0.8, 0), nums=False)
        a, b = 1.4, 4.6
        self.go("1:00:55.60", Create(ax), FadeIn(ax.labels), run=0.7)
        c = curve(ax, fa, (0, 5.6))
        self.go("1:00:59.72", draw(c, run=0.9), run=0.9)
        A, B = pt(ax, a, fa(a)), pt(ax, b, fa(b))
        la = VGroup(DashedLine(ax.c2p(a, 0), ax.c2p(a, fa(a)), color=DIM, stroke_width=2, dash_length=0.08),
                    M("a", size=44, color=ORG).next_to(ax.c2p(a, 0), DOWN, buff=0.12))
        lb = VGroup(DashedLine(ax.c2p(b, 0), ax.c2p(b, fa(b)), color=DIM, stroke_width=2, dash_length=0.08),
                    M("b", size=44, color=ORG).next_to(ax.c2p(b, 0), DOWN, buff=0.12))
        self.go("1:01:01.04", FadeIn(A, scale=0.5), Create(la[0]), FadeIn(la[1]), run=0.45)
        self.go("1:01:02.42", FadeIn(B, scale=0.5), Create(lb[0]), FadeIn(lb[1]), run=0.45)
        F = fr(["f(b)", "-", "f(a)"], ["b", "-", "a"], size=60).move_to([2.3, 0.15, 0])
        self.go("1:01:03.38", Write(F.n), run=1.2)
        self.go("1:01:05.18", Create(F.bar), Write(F.d), run=0.9)
        out_l = H("change in output", 34, PINK).next_to(F, UP, buff=0.3)
        in_l = H("change in input", 34, BLUE).next_to(F, DOWN, buff=0.3)
        rr = rise_run(ax, a, fa(a), b, fa(b), color=PINK, size=40)
        dy = M(r"\Delta y", size=40, color=PINK).next_to(rr[1], RIGHT, buff=0.1)
        dx = M(r"\Delta x", size=40, color=BLUE).next_to(rr[0], DOWN, buff=0.1)
        rr[0].set_color(BLUE)
        self.go("1:01:07.76", F.n.animate.set_color(PINK), FadeIn(out_l), Create(rr[1]), run=0.6)
        self.go("1:01:09.22", F.d.animate.set_color(BLUE), FadeIn(in_l), Create(rr[0]), run=0.6)
        q = fr([r"\Delta y"], [r"\Delta x"], size=60)
        q.n.set_color(PINK); q.d.set_color(BLUE)
        eq = VGroup(M("=", size=60), q).arrange(RIGHT, buff=0.25)
        eq.next_to(F, RIGHT, buff=0.3)
        eq.shift(UP * (F.bar.get_y() - q.bar.get_y()))
        eq[0].shift(UP * (q.bar.get_y() - eq[0].get_y()))
        sl = H("slope", 38, YEL).next_to(q, UP, buff=0.3)
        self.go("1:01:13.44", FadeIn(sl), run=0.4)
        self.go("1:01:14.84", Write(eq), FadeIn(dy), run=0.7)
        self.go("1:01:16.46", FadeIn(dx), run=0.4)
        s = sec_line(ax, fa, a, b - a, back=0.8, front=1.0)
        self.go("1:01:19.98", draw(s, run=0.9), run=0.9)
        nm = H("secant line", 40, ORG).move_to(ax.c2p(1.9, 4.6))
        m = (fa(b) - fa(a)) / (b - a)
        na = arrow_to(nm.get_bottom(), ax.c2p(2.7, fa(a) + m * (2.7 - a)), ORG)
        self.go("1:01:25.20", Write(nm), GrowArrow(na), run=0.6)


# ================================================================ an example: x^2 from 1 to 3

class K10_AvgEx(Shot):
    def body(self):
        self.title("Let's Do One", "1:01:27.18")
        ax = sq_axes()
        c = sq_curve(ax)
        g = M("f(x)", "=", "x^2", size=60).move_to([3.4, 1.6, 0])
        g[0].set_color(BLUE)
        self.go("1:01:27.70", Create(ax), FadeIn(ax.labels), run=0.5)
        self.go("1:01:28.24", Write(g), run=0.8)
        self.go("1:01:29.44", draw(c, run=0.9), run=0.9)
        P1, P3 = pt(ax, 1, 1), pt(ax, 3, 9)
        self.go("1:01:33.20", FadeIn(P1, scale=0.5), run=0.35)
        self.go("1:01:34.46", FadeIn(P3, scale=0.5), run=0.35)
        e1 = M("f(3)", "=", "9", size=54).move_to([2.2, 0.55, 0])
        e2 = M("f(1)", "=", "1", size=54).next_to(e1, DOWN, buff=0.3, aligned_edge=LEFT)
        e1[2].set_color(ORG); e2[2].set_color(ORG)
        self.go("1:01:35.60", Write(e1), run=0.5)
        self.go("1:01:36.66", Write(e2), run=0.5)
        F = fr(["9", "-", "1"], ["3", "-", "1"], size=60).move_to([1.7, -2.05, 0])
        rr = rise_run(ax, 1, 1, 3, 9, color=PINK, size=40)
        r8 = M("8", size=40, color=PINK).next_to(rr[1], RIGHT, buff=0.1)
        r2 = M("2", size=40, color=PINK).next_to(rr[0], UP, buff=0.1)
        self.go("1:01:38.18", Write(F.n), run=0.5)
        self.go("1:01:39.62", Create(rr[1]), FadeIn(r8), run=0.3)
        self.go("1:01:40.02", Create(F.bar), Write(F.d), run=0.5)
        self.go("1:01:41.50", Create(rr[0]), FadeIn(r2), run=0.3)
        e3 = M("=", r"\frac{8}{2}", "=", "4", size=60)
        e3.next_to(F, RIGHT, buff=0.25)
        e3.shift(UP * (F.bar.get_y() - e3[0].get_y()))
        e3[3].set_color(GRN).shift(RIGHT * 0.15)
        self.go("1:01:41.90", Write(e3[0:2]), run=0.4)
        s = sec_line(ax, sq, 1, 2, back=0.3, front=0.8)
        self.go("1:01:43.16", Write(e3[2:]), Create(s), run=0.5)
        self.play(Create(answer_box(e3[3])), run_time=0.4)
        # up 4 for every 1 to the right
        self.go("1:01:45.20", FadeOut(VGroup(rr, r8, r2)), run=0.4)
        a, b, cc = ax.c2p(2, 5), ax.c2p(3, 5), ax.c2p(3, 9)
        run_l, rise_l = Line(a, b, color=YEL, stroke_width=5), Line(b, cc, color=YEL, stroke_width=5)
        self.go("1:01:47.52", Create(run_l), run=0.3)
        self.play(Create(rise_l), run_time=0.3)
        four = M("4", size=44, color=YEL).next_to(rise_l, RIGHT, buff=0.1)
        one = M("1", size=44, color=YEL).next_to(run_l, DOWN, buff=0.08)
        self.go("1:01:48.10", FadeIn(four), run=0.3)
        self.go("1:01:49.30", FadeIn(one), run=0.3)


# ================================================================ the slope at one point

class K10_Problem(Shot):
    def body(self):
        ax = sq_axes()
        c = sq_curve(ax)
        P1, P3 = pt(ax, 1, 1), pt(ax, 3, 9)
        s = sec_line(ax, sq, 1, 2, back=0.3, front=0.8)
        g = M("f(x)", "=", "x^2", size=60).move_to([3.4, 1.6, 0])
        g[0].set_color(BLUE)
        self.title("Let's Do One", animate=False)
        self.add(ax, ax.labels, c, s, P1, P3, g)
        self.title("Slope at One Point", "1:01:51.72")
        self.go("1:01:54.00", P3.animate.set_color(YEL).scale(1.3), run=0.4)
        self.go("1:01:56.04", Circumscribe(P3, Circle, color=YEL, buff=0.12), run=0.8)
        self.go("1:01:57.76", s.animate.set_color(RED), run=0.4)
        self.go("1:01:59.42", FadeOut(s), run=0.5)
        sl = M(r"\text{slope}", "=", r"\frac{y_2-y_1}{x_2-x_1}", size=56).move_to([3.4, 0.0, 0])
        sl[0].set_color(PINK)
        self.go("1:02:02.70", FadeOut(g), Write(sl), run=0.9)
        r1, r3 = ring(P1, ORG, 0.14), ring(P3, ORG, 0.14)
        self.go("1:02:04.06", Create(r1), Create(r3), run=0.5)
        self.go("1:02:08.36", FadeOut(r1), FadeOut(P1), FadeOut(r3), run=0.5)
        z = M(r"\frac{9-9}{3-3}", "=", r"\frac{0}{0}", size=60).move_to([3.4, -2.0, 0])
        z[2].set_color(RED)
        self.go("1:02:11.94", Write(z[0]), run=0.8)
        self.go("1:02:13.80", Write(z[1:]), run=0.5)
        self.go("1:02:15.62", Circumscribe(z[2], color=RED, buff=0.1), run=0.8)
        # a second point, closer and closer
        self.wipe("1:02:17.18", run=0.4, keep=[ax, ax.labels, c, P3])
        q = ValueTracker(4.1)
        Q = always_redraw(lambda: pt(ax, q.get_value(), sq(q.get_value())))
        S = always_redraw(lambda: sec_line(ax, sq, 3, q.get_value() - 3, back=1.6, front=0.8))
        self.go("1:02:19.34", FadeIn(Q, scale=0.5), Create(S), run=0.5)
        self.go("1:02:21.30", q.animate.set_value(3.7), run=0.8)
        self.go("1:02:22.56", q.animate.set_value(3.35), run=0.8)
        lab = M(r"\text{slope} =", size=54, color=ORG).move_to([2.6, 0.3, 0])
        num = always_redraw(lambda: digits(f"{q.get_value() + 3:.2f}", 54, ORG).next_to(lab, RIGHT, buff=0.2).align_to(lab, DOWN))
        self.go("1:02:25.02", FadeIn(lab), FadeIn(num), run=0.4)
        self.play(q.animate.set_value(3.18), run_time=0.9)


# ================================================================ the table: h = 1, 0.1, 0.01

COLS = (1.3, 3.3, 5.4)
ROWS = (0.6, -0.2, -1.0)
HVALS = [("1", "4", "7"), ("0.1", "3.1", "6.1"), ("0.01", "3.01", "6.01")]


def table_head():
    hs = VGroup(M("h", size=52, color=ORG), M("3+h", size=52), M(r"\text{slope}", size=52, color=PINK))
    for m, x in zip(hs, COLS):
        m.move_to([x, 1.5, 0])
    line = Line([0.4, 1.1, 0], [6.5, 1.1, 0], color=DIM, stroke_width=3)
    return VGroup(hs, line)


def cell(i, j):
    return M(HVALS[i][j], size=50, color=[ORG, CHALK, PINK][j]).move_to([COLS[j], ROWS[i], 0])


def h_gap(ax, hv):
    """Orange bar on the x-axis from 3 to 3+h, with an h label while the gap is wide enough."""
    h = hv.get_value()
    y = 0.6
    g = VGroup(Line(ax.c2p(3, y), ax.c2p(3 + h, y), color=ORG, stroke_width=6),
               DashedLine(ax.c2p(3 + h, 0), ax.c2p(3 + h, sq(3 + h)), color=DIM, stroke_width=2, dash_length=0.08))
    if h > 0.4:
        g.add(M("h", size=40, color=ORG).next_to(ax.c2p(3 + h / 2, y), UP, buff=0.1))
    return g


def table_board(hv):
    ax = sq_axes()
    c = sq_curve(ax)
    P = pt(ax, 3, 9, YEL).scale(1.3)
    Q = always_redraw(lambda: pt(ax, 3 + hv.get_value(), sq(3 + hv.get_value())))
    S = always_redraw(lambda: sec_line(ax, sq, 3, hv.get_value(), back=1.6, front=0.8))
    G = always_redraw(lambda: h_gap(ax, hv))
    return ax, c, P, Q, S, G


def work(tex_parts, size=52):
    return M(*tex_parts, size=size).move_to([3.4, -2.55, 0])


class K10_TableA(Shot):
    def body(self):
        hv = ValueTracker(1)
        ax, c, P, Q, S, G = table_board(hv)
        self.title("Slope at One Point", animate=False)
        self.add(ax, ax.labels, c, P)
        self.title("Closer and Closer", "1:02:26.80")
        self.go("1:02:27.60", FadeIn(Q, scale=0.5), Create(S), FadeIn(G), run=0.6)
        head = table_head()
        self.go("1:02:29.54", FadeIn(head[0]), Create(head[1]), run=0.7)
        self.go("1:02:32.66", FadeIn(cell(0, 0)), run=0.4)
        self.go("1:02:34.24", FadeIn(cell(0, 1)), run=0.4)
        w = work([r"\frac{16-9}{1}", "=", "7"])
        w[2].set_color(PINK)
        self.go("1:02:35.26", Write(w[0]), run=0.9)
        self.go("1:02:37.90", Write(w[1:]), run=0.4)
        c7 = cell(0, 2)
        self.play(TransformFromCopy(w[2], c7), run_time=0.5)
        self.go("1:02:39.56", FadeOut(w), FadeIn(cell(1, 0)), hv.animate.set_value(0.1), run=1.0)
        self.go("1:02:41.98", FadeIn(cell(1, 1)), run=0.4)
        w2 = work([r"3.1^2", "=", "9.61"])
        self.go("1:02:44.22", Write(w2), run=0.7)
        w3 = work([r"\frac{9.61-9}{0.1}", "=", "6.1"])
        w3[2].set_color(PINK)
        self.go("1:02:47.10", ReplacementTransform(w2, w3[0]), run=0.8)
        self.go("1:02:50.50", Write(w3[1:]), run=0.4)
        self.play(TransformFromCopy(w3[2], cell(1, 2)), run_time=0.4)


class K10_TableB(Shot):
    def body(self):
        hv = ValueTracker(0.1)
        ax, c, P, Q, S, G = table_board(hv)
        head = table_head()
        cells = VGroup(*[cell(i, j) for i in range(2) for j in range(3)])
        w3 = work([r"\frac{9.61-9}{0.1}", "=", "6.1"])
        w3[2].set_color(PINK)
        self.title("Closer and Closer", animate=False)
        self.add(ax, ax.labels, c, P, Q, S, G, head, cells, w3)
        self.go("1:02:52.94", FadeOut(w3), FadeIn(cell(2, 0)), hv.animate.set_value(0.01), run=1.0)
        self.go("1:02:54.34", FadeIn(cell(2, 1)), run=0.4)
        w4 = work([r"3.01^2", "=", "9.0601"])
        self.go("1:02:56.96", Write(w4), run=0.7)
        w5 = work([r"\frac{9.0601-9}{0.01}", "=", "6.01"])
        w5[2].set_color(PINK)
        self.go("1:02:59.14", ReplacementTransform(w4, w5[0]), run=0.8)
        self.go("1:03:02.30", Write(w5[1:]), run=0.4)
        c601 = cell(2, 2)
        self.play(TransformFromCopy(w5[2], c601), run_time=0.4)
        # 7, 6.1, 6.01 ... closing in on 6
        self.go("1:03:03.96", FadeOut(w5), run=0.4)
        slopes = [cells[2], cells[5], c601]
        for tt, m in zip(("1:03:04.30", "1:03:05.56", "1:03:06.38"), slopes):
            self.go(tt, Circumscribe(m, color=YEL, buff=0.08), run=0.6)
        to6 = M(r"\to 6", size=60, color=PINK).move_to([COLS[2], -1.95, 0])
        self.go("1:03:08.64", FadeIn(to6, shift=DOWN * 0.15), run=0.5)
        s6 = M(r"\text{slope} = 6", size=48, color=PINK).move_to(ax.c2p(1.25, 15))
        self.go("1:03:10.60", FadeIn(s6, shift=UP * 0.1), run=0.5)
        lim = pill("a limit", YEL, 40).move_to([3.3, -2.9, 0])
        self.go("1:03:14.78", FadeIn(lim, shift=UP * 0.15), run=0.5)
        to0 = M(r"\to 0", size=60, color=ORG).move_to([COLS[0], -1.95, 0])
        self.go("1:03:16.40", FadeIn(to0, shift=DOWN * 0.15), run=0.5)


# ================================================================ hero: the secant swings into the tangent

class K10_Secant(Shot):
    def body(self):
        self.title("Secant to Tangent", "1:03:19.92")
        ax = axes((0, 6, 1), (0, 40, 10), x_length=7.2, y_length=5.0, center=(-1.7, -0.75, 0))
        c = curve(ax, sq, (0, 6.2))
        self.go("1:03:20.50", Create(ax), FadeIn(ax.labels), run=0.6)
        self.play(draw(c, run=0.9))
        P = pt(ax, 3, 9, YEL).scale(1.3)
        pl = M("(3,\\,9)", size=44, color=YEL).move_to(ax.c2p(3, 9) + np.array([-1.0, 0.45, 0]))
        self.go("1:03:23.82", FadeIn(P, scale=0.5), FadeIn(pl), run=0.4)
        hv = ValueTracker(2.6)
        S = always_redraw(lambda: sec_line(ax, sq, 3, hv.get_value()))
        Q = always_redraw(lambda: pt(ax, 3 + hv.get_value(), sq(3 + hv.get_value())))
        G = always_redraw(lambda: VGroup(
            Line(ax.c2p(3, 1.2), ax.c2p(3 + hv.get_value(), 1.2), color=ORG, stroke_width=6),
            DashedLine(ax.c2p(3 + hv.get_value(), 0), ax.c2p(3 + hv.get_value(), sq(3 + hv.get_value())),
                       color=DIM, stroke_width=2, dash_length=0.08),
            *([M("h", size=40, color=ORG).next_to(ax.c2p(3 + hv.get_value() / 2, 1.2), UP, buff=0.08)] if hv.get_value() > 0.45 else [])))
        lab = M(r"\text{slope} =", size=56, color=ORG).move_to([3.9, 0.9, 0])
        num = always_redraw(lambda: digits(f"{6 + hv.get_value():.2f}", 56, ORG).next_to(lab, RIGHT, buff=0.2).align_to(lab, DOWN))
        self.go("1:03:25.40", Create(S), FadeIn(Q, scale=0.5), FadeIn(G), FadeIn(lab), FadeIn(num), run=0.6)
        self.go("1:03:27.46", hv.animate.set_value(0.8), run=2.2)
        self.go("1:03:29.90", hv.animate.set_value(0.2), run=1.6)
        self.go("1:03:32.80", hv.animate.set_value(0.01), run=1.8)
        self.go("1:03:35.28", Circumscribe(P, Circle, color=YEL, buff=0.15), run=0.8)
        # it has become the tangent line
        for m in (S, Q, G, num):
            m.clear_updaters()
        tg = sec_line(ax, sq, 3, 0, color=PINK, width=6)
        self.go("1:03:38.74", ReplacementTransform(S, tg), FadeOut(Q), FadeOut(G), run=0.6)
        tl = H("tangent line", 42, PINK).next_to(tg.get_end(), RIGHT, buff=0.15).shift(DOWN * 0.1)
        self.go("1:03:39.74", Write(tl), run=0.6)
        six = M(r"\text{slope} = 6", size=56, color=PINK).move_to(VGroup(lab, num), aligned_edge=LEFT)
        self.go("1:03:41.42", ReplacementTransform(VGroup(lab, num), six), run=0.5)
        inst = H("instantaneous rate", 40, YEL).next_to(six, DOWN, buff=0.35)
        self.go("1:03:42.20", FadeIn(inst, shift=UP * 0.15), run=0.5)


# ================================================================ the definition

def big_def():
    return def_row("f'(x)", ["f(x+h)", "-", "f(x)"], "h", size=72, center=(0, 0.2, 0))


class K10_Define(Shot):
    def body(self):
        self.title("The Definition", "1:03:44.54")
        D = big_def()
        imp = pill("the most important formula", YEL, 38).move_to([0, -2.6, 0])
        self.go("1:03:48.06", FadeIn(imp, shift=UP * 0.15), run=0.5)
        dl = H("derivative", 40, PINK).next_to(D.l, UP, buff=0.4)
        self.go("1:03:51.66", FadeIn(dl, shift=DOWN * 0.1), run=0.4)
        self.go("1:03:54.00", Write(D.l), run=0.6)
        self.go("1:03:55.10", Write(D.e), run=0.3)
        self.go("1:03:55.88", Write(D.lim), run=0.8)
        self.go("1:03:58.56", Write(D.f.n), run=1.3)
        self.go("1:04:01.34", Create(D.f.bar), Write(D.f.d), run=0.6)
        self.go("1:04:02.10", Create(panel(D, YEL, buff=0.3)), FadeOut(dl), run=0.6)


def fb(x):
    return 0.11 * x * x + 0.25 * x + 0.5


class K10_ReadBack(Shot):
    def body(self):
        D = big_def()
        imp = pill("the most important formula", YEL, 38).move_to([0, -2.6, 0])
        pan = panel(D, YEL, buff=0.3)
        self.title("The Definition", animate=False)
        self.add(D, imp, pan)
        self.go("1:04:03.14", FadeOut(imp), FadeOut(pan), D.animate.scale(0.78).move_to([0, 1.25, 0]), run=0.7)
        ax = axes((0, 6, 1), (0, 6, 1), x_length=5.6, y_length=3.5, center=(-3.4, -1.55, 0), nums=False, x_label=None, y_label=None)
        c = curve(ax, fb, (0, 5.7))
        x0 = 1.6
        hv = ValueTracker(2.6)
        self.go("1:04:03.90", Create(ax), draw(c, run=0.6), run=0.6)

        def bits():
            h = hv.get_value()
            P, Q = ax.c2p(x0, fb(x0)), ax.c2p(x0 + h, fb(x0 + h))
            K = ax.c2p(x0 + h, fb(x0))
            g = VGroup(DashedLine(P, K, color=BLUE, stroke_width=3, dash_length=0.08),
                       DashedLine(K, Q, color=PINK, stroke_width=3, dash_length=0.08),
                       pt(ax, x0 + h, fb(x0 + h)))
            return g
        B = always_redraw(bits)
        P = pt(ax, x0, fb(x0), YEL)
        xl = M("x", size=40, color=DIM).next_to(ax.c2p(x0, 0), DOWN, buff=0.12)
        xh = always_redraw(lambda: M("x+h", size=40, color=DIM).next_to(ax.c2p(x0 + hv.get_value(), 0), DOWN, buff=0.12)
                           .set_opacity(min(1, max(0, (hv.get_value() - 0.6) / 0.5))))
        self.go("1:04:04.50", FadeIn(P, scale=0.5), FadeIn(xl), FadeIn(xh), run=0.35)
        # numerator = change in output (rise), h = change in input (run)
        out_l = H("change in output", 40, PINK).move_to([3.6, -0.5, 0])
        in_l = H("change in input", 40, BLUE).move_to([3.6, -1.5, 0])
        self.go("1:04:04.92", D.f.n.animate.set_color(PINK), FadeIn(B), run=0.6)
        self.go("1:04:08.16", FadeIn(out_l, shift=UP * 0.1), run=0.5)
        self.go("1:04:09.18", D.f.d.animate.set_color(BLUE), run=0.5)
        self.go("1:04:10.36", FadeIn(in_l, shift=UP * 0.1), run=0.5)
        sl = VGroup(M(r"\text{slope}", "=", size=56, color=CHALK), fr([r"\text{rise}"], [r"\text{run}"], size=56))
        sl[1].n.set_color(PINK); sl[1].d.set_color(BLUE)
        sl.arrange(RIGHT, buff=0.25).move_to([3.6, -1.0, 0])
        sl[0].shift(UP * (sl[1].bar.get_y() - sl[0][1].get_y()))
        self.go("1:04:13.06", ReplacementTransform(VGroup(out_l, in_l), sl), run=0.7)
        S = always_redraw(lambda: sec_line(ax, fb, x0, hv.get_value(), back=1.4, front=0.7, width=4))
        self.go("1:04:14.58", Create(S), run=0.6)
        hl = always_redraw(lambda: M("h", size=40, color=BLUE).next_to(ax.c2p(x0 + hv.get_value() / 2, fb(x0)), DOWN, buff=0.1)
                           .set_opacity(min(1, max(0, (hv.get_value() - 0.5) / 0.5))))
        self.go("1:04:16.48", FadeIn(hl), run=0.4)
        self.go("1:04:19.14", Circumscribe(D.lim, color=YEL, buff=0.1), run=0.7)
        self.go("1:04:19.92", hv.animate.set_value(0.02), run=2.8)
        for m in (B, S, xh, hl):
            m.clear_updaters()
        r1 = H("limit of secant slopes", 40, ORG).move_to([3.6, -0.6, 0])
        self.go("1:04:25.10", FadeOut(sl), FadeOut(B), FadeOut(hl), FadeOut(xh), run=0.4)
        self.play(FadeIn(r1, shift=UP * 0.1), run_time=0.5)
        tg = sec_line(ax, fb, x0, 0, color=PINK, back=1.4, front=1.4, width=6)
        r2 = H("slope of the tangent", 40, PINK).move_to([3.6, -1.6, 0])
        self.go("1:04:28.72", ReplacementTransform(S, tg), FadeIn(r2, shift=UP * 0.1), run=0.6)
        self.play(Circumscribe(D.l, color=PINK, buff=0.1), run_time=0.8)


# ================================================================ use it: x^2 at x = 3

class K10_AtThree(Shot):
    def body(self):
        self.title("Use the Formula", "1:04:31.04")
        g = M("f(x)", "=", "x^2", size=56).move_to([-4.6, 1.6, 0])
        g[0].set_color(BLUE)
        at = M("x", "=", "3", size=56, color=ORG).next_to(g, RIGHT, buff=0.8)
        self.go("1:04:34.76", Write(g), run=0.7)
        self.go("1:04:37.64", Write(at), run=0.5)
        R = def_row("f'(3)", ["f(3+h)", "-", "f(3)"], "h", size=64, center=(-0.6, -1.45, 0))
        self.go("1:04:38.30", Write(R), run=1.0)
        side = M("f(3+h)", "=", "(3+h)^2", "=", "9+6h+h^2", size=54).move_to([0.3, 0.45, 0])
        self.go("1:04:39.48", Write(side[0]), run=0.5)
        self.go("1:04:41.06", Write(side[1:3]), run=0.6)
        self.go("1:04:42.78", Write(side[3:]), run=0.9)
        # put it into the numerator and subtract f(3) = 9
        N2 = frac_at(R, ["9", "+6h+h^2", "-", "9"], "h")
        self.go("1:04:46.20", *morph_frac(R, N2, pairs=[(R.f.n[1], N2.n[2]), (R.f.n[2], N2.n[3])],
                                          extra=[FadeOut(R.f.n[0]), TransformFromCopy(side[4], N2.n[0:2])]), run=0.9)
        self.go("1:04:47.88", Circumscribe(N2.n[3], color=ORG, buff=0.08), run=0.6)
        k1, k2 = strike(N2.n[0]), strike(N2.n[2:4])
        self.go("1:04:48.72", Create(k1), Create(k2), run=0.4)
        N3 = frac_at(R, ["6h+h^2"], "h")
        self.go("1:04:49.30", *morph_frac(R, N3, pairs=[(N2.n[1], N3.n[0])],
                                          extra=[FadeOut(VGroup(N2.n[0], N2.n[2], N2.n[3], k1, k2))]), run=0.7)
        # factor out h, cancel it
        N4 = frac_at(R, ["h", "(6+h)"], "h")
        N4.n[0].set_color(ORG); N4.d.set_color(ORG)
        self.go("1:04:54.74", *morph_frac(R, N4), run=0.7)
        k3, k4 = strike(N4.n[0]), strike(N4.d)
        self.go("1:04:56.56", Create(k3), Create(k4), run=0.5)
        rest = M("(6+h)", size=64)
        rest.next_to(R.lim, RIGHT, buff=0.18)
        rest.shift(UP * (R.e.get_y() - rest.get_y()))
        self.go("1:04:57.68", ReplacementTransform(N4.n[1], rest), FadeOut(VGroup(N4.n[0], N4.bar, N4.d, k3, k4)), run=0.6)
        self.go("1:04:58.78", rest[0][3].animate.set_color(ORG), run=0.4)
        self.play(Circumscribe(R.lim, color=YEL, buff=0.08), run_time=0.6)
        ans = M("=", "6", size=64).next_to(rest, RIGHT, buff=0.25)
        ans.shift(UP * (R.e.get_y() - ans[0].get_y()))
        ans[1].set_color(GRN).shift(RIGHT * 0.15)
        self.go("1:05:00.46", Write(ans), run=0.4)
        self.play(Create(answer_box(ans[1])), run_time=0.4)
        # same as the table, same as the Chapter 2 limit
        tab = M(r"7,\ 6.1,\ 6.01\ \to\ 6", size=54, color=PINK).move_to([0.3, 0.45, 0])
        tk = tick_mark(GRN, 0.6).next_to(tab, RIGHT, buff=0.4)
        self.go("1:05:01.16", FadeOut(side), run=0.35)
        self.play(FadeIn(tab, shift=UP * 0.1), run_time=0.45)
        self.go("1:05:02.12", Create(tk), run=0.4)
        ch2 = pill("same limit as Chapter 2", YEL, 40).move_to([0.3, 0.45, 0])
        self.go("1:05:07.52", FadeOut(tab), FadeOut(tk), run=0.35)
        self.play(FadeIn(ch2, shift=UP * 0.1), run_time=0.5)
        self.go("1:05:12.58", Circumscribe(R.l, color=PINK, buff=0.1), run=0.8)


# ================================================================ now for any x

class K10_AnyX(Shot):
    def body(self):
        self.title("For Any x", "1:05:13.92")
        R = def_row("f'(x)", ["f(x+h)", "-", "f(x)"], "h", size=64, center=(-0.6, -1.45, 0))
        self.go("1:05:16.68", Write(R), run=1.0)
        g = M("f(x)", "=", "x^2", size=56).move_to([-4.6, 1.6, 0])
        g[0].set_color(BLUE)
        self.go("1:05:20.92", Write(g), run=0.7)
        side = M("f(x+h)", "=", "(x+h)^2", "=", "x^2+2xh+h^2", size=54).move_to([0.3, 0.45, 0])
        self.go("1:05:23.22", Write(side[0]), run=0.5)
        self.go("1:05:24.70", Write(side[1:3]), run=0.6)
        self.go("1:05:26.38", Write(side[3:]), run=1.0)
        N2 = frac_at(R, ["x^2", "+2xh+h^2", "-", "x^2"], "h")
        self.go("1:05:30.44", *morph_frac(R, N2, pairs=[(R.f.n[1], N2.n[2]), (R.f.n[2], N2.n[3])],
                                          extra=[FadeOut(R.f.n[0]), TransformFromCopy(side[4], N2.n[0:2])]), run=0.9)
        k1, k2 = strike(N2.n[0]), strike(N2.n[2:4])
        self.go("1:05:33.34", Create(k1), Create(k2), run=0.45)
        N3 = frac_at(R, ["2xh+h^2"], "h")
        self.go("1:05:34.84", *morph_frac(R, N3, pairs=[(N2.n[1], N3.n[0])],
                                          extra=[FadeOut(VGroup(N2.n[0], N2.n[2], N2.n[3], k1, k2))]), run=0.7)
        self.go("1:05:37.58", N3.d.animate.set_color(ORG), Circumscribe(N3.d, color=ORG, buff=0.08), run=0.6)
        rest = M("(2x+h)", size=64)
        rest.next_to(R.lim, RIGHT, buff=0.18)
        rest.shift(UP * (R.e.get_y() - rest.get_y()))
        self.go("1:05:39.08", ReplacementTransform(N3.n, rest), FadeOut(N3.bar), FadeOut(N3.d), run=0.6)
