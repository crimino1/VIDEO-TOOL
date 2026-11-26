"""Builder 26: middle of Chapter 9. The toll-booth speeding ticket (MVT, live speedometer that must pass 100),
x^3 on [0,2] (secant slope 4, a tangent slides until it is parallel, c = 2/sqrt3), f' = 0 means constant,
uphill/downhill, the sign chart for x^3-3x, the first derivative test, (-1,2) max and (1,-2) min, concavity
(cup holds water), why it bends (slope readouts), inflection points (6x, x^4 trap), the second derivative test,
where it fails, and the start of the full example 2x^3-3x^2-12x+5 up to f''(-1) = -18 -> local max (builder 27 goes on).
Colours: f' / f'' / slopes PINK, graphs BLUE, example numbers ORG, key words YEL, answers GRN, the limit RED."""
from common import *

# ---------------------------------------------------------------- local helpers

_DG = {}


def digits(s, size=44, color=CHALK):
    """A number from cached glyphs (cheap per frame); the minus sits at mid-height."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.035, aligned_edge=DOWN)
    ref = next((x for x, ch in zip(g, s) if ch.isdigit()), None)
    for x, ch in zip(g, s):
        if ch == "-" and ref is not None:
            x.set_y(ref.get_y())
    return g


def f1(v):
    return f"{(v if abs(v) >= 0.05 else 0.0):.1f}"


def readout(label, fn, color=PINK, size=44, fmt=f1):
    """'label' MathTex with a live number to its right."""
    def mk():
        d = digits(fmt(fn()), size, color).next_to(label, RIGHT, buff=0.16)
        return d.align_to(label, DOWN)
    return always_redraw(mk)


def slide(ax, f, xt, length=2.6, color=PINK):
    """Tangent + touching dot following tracker xt (no LaTeX per frame)."""
    return VGroup(always_redraw(lambda: tangent(ax, f, xt.get_value(), length, color)),
                  always_redraw(lambda: pt(ax, xt.get_value(), f(xt.get_value()), color)))


def drive(sc, tr, keys):
    """Move tracker tr through (time, value) keys on the film clock (smooth between keys), while other
    animations play on top. The dt-updater also keeps frames rendering during waits."""
    ks = [(sec(t), v) for t, v in keys]

    def upd(m, dt):
        n = sc.now()
        if n <= ks[0][0]:
            m.set_value(ks[0][1])
            return
        for (ta, va), (tb, vb) in zip(ks, ks[1:]):
            if n <= tb:
                m.set_value(va + (vb - va) * smooth((n - ta) / (tb - ta)))
                return
        m.set_value(ks[-1][1])
    tr.add_updater(upd)
    sc.add(tr)


def col(m, cs):
    for i, c in cs.items():
        m[i].set_color(c)
    return m


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


def sgn(s, color=PINK, size=72):
    return M(s, size=size, color=color)


def updown(c, up=True, color=BLUE, w=0.75, h=0.5):
    c = np.array(c, float)
    a, b = c + [-w / 2, -h / 2 if up else h / 2, 0], c + [w / 2, h / 2 if up else -h / 2, 0]
    return Arrow(a, b, buff=0, color=color, stroke_width=6, tip_length=0.2, max_tip_length_to_length_ratio=0.4)


def shape(x0, y0, fn, xr=1.25, color=BLUE, width=5, sx=1.0, sy=1.0):
    """A small free-standing curve y0 + sy*fn(t), t in [-xr, xr], centred at x0."""
    return ParametricFunction(lambda t: np.array([x0 + sx * t, y0 + sy * fn(t), 0]), t_range=[-xr, xr],
                              color=color, stroke_width=width)


def mini_line(x0, y, half=1.45):
    ln = Line([x0 - half, y, 0], [x0 + half, y, 0], color=DIM, stroke_width=3)
    tk = Line([x0, y + 0.12, 0], [x0, y - 0.12, 0], color=DIM, stroke_width=3)
    return VGroup(ln, tk)


# ---------------------------------------------------------------- drawings: road, toll gantry, car, speedometer

RY = 1.3                       # road surface
B1, B2 = -4.6, 4.6             # the two toll booths


def gantry(x):
    k = dict(color=CHALK, stroke_width=4)
    posts = VGroup(Line([x - 1.0, RY, 0], [x - 1.0, RY + 1.0, 0], **k), Line([x + 1.0, RY, 0], [x + 1.0, RY + 1.0, 0], **k))
    beam = Rectangle(width=2.3, height=0.28, stroke_color=CHALK, stroke_width=4).move_to([x, RY + 1.0, 0])
    light = Dot([x, RY + 1.0, 0], radius=0.06, color=YEL)
    return VGroup(posts, beam, light)


def road():
    top = Line([-6.8, RY, 0], [6.8, RY, 0], color=CHALK, stroke_width=4)
    dash = DashedLine([-6.8, RY - 0.22, 0], [6.8, RY - 0.22, 0], color=FAINT, stroke_width=3, dash_length=0.25)
    return VGroup(top, dash)


def car():
    """Side view of a small car facing right, wheels on y = 0 (as in s10)."""
    body = VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners(
        [[-0.78, 0.14, 0], [0.78, 0.14, 0], [0.8, 0.38, 0], [0.42, 0.44, 0], [0.2, 0.7, 0], [-0.4, 0.7, 0],
         [-0.6, 0.44, 0], [-0.8, 0.4, 0], [-0.78, 0.14, 0]])
    win = VGroup(Line([-0.5, 0.44, 0], [0.36, 0.44, 0], color=DIM, stroke_width=3),
                 Line([-0.08, 0.44, 0], [-0.08, 0.68, 0], color=DIM, stroke_width=3))
    light = Line([0.7, 0.3, 0], [0.8, 0.3, 0], color=YEL, stroke_width=4)
    wheels = VGroup(*[Circle(radius=0.15, stroke_color=CHALK, stroke_width=4, fill_color=config.background_color,
                             fill_opacity=1).move_to([x, 0.15, 0]) for x in (-0.45, 0.45)])
    hubs = VGroup(*[Dot([x, 0.15, 0], radius=0.035, color=DIM) for x in (-0.45, 0.45)])
    return VGroup(body, win, light, wheels, hubs).scale(0.95, about_point=ORIGIN)


def car_at(c, x):
    return c.move_to([x, RY + c.height / 2 + 0.01, 0])


DC, DRR = np.array([-3.4, -1.95, 0]), 1.5    # speedometer


def dial_angle(v):
    return (210 - v / 140 * 240) * DEGREES


def speedometer():
    g = VGroup(Arc(radius=DRR, start_angle=210 * DEGREES, angle=-240 * DEGREES, arc_center=DC, color=CHALK, stroke_width=5))
    for v in range(0, 141, 20):
        u = np.array([np.cos(dial_angle(v)), np.sin(dial_angle(v)), 0])
        g.add(Line(DC + u * (DRR - 0.2), DC + u * (DRR - 0.02), color=CHALK, stroke_width=4))
        g.add(M(str(v), size=30, color=DIM).move_to(DC + u * (DRR - 0.5)))
    g.add(M(r"\text{km/h}", size=32, color=DIM).move_to(DC + DOWN * 0.95))
    return g


def needle(v):
    a = dial_angle(v)
    return VGroup(Line(DC, DC + 1.15 * np.array([np.cos(a), np.sin(a), 0]), color=ORG, stroke_width=6),
                  Dot(DC, radius=0.09, color=ORG))


def speed(t):          # km/h over the 1.5 h trip: averages exactly 100
    return 100 - 30 * np.cos(TAU * t / 1.5)


def dist(t):           # km
    return 100 * t - 30 * 1.5 / TAU * np.sin(TAU * t / 1.5)


def limit_sign(c):
    c = np.array(c, float)
    return VGroup(Circle(radius=0.8, color=RED, stroke_width=10).move_to(c), M("80", size=64).move_to(c))


# ---------------------------------------------------------------- x^3 - 3x board (sign chart + graph) shared by several shots

def F3(x):
    return x ** 3 - 3 * x


def chart(center=(0.5, -0.3, 0), length=9.0, size=34):
    nl = number_line((-3, 3, 1), length=length, center=center, size=size)
    for i in (2, 4):                     # labels of -1 and 1
        nl.labels[i].set_color(ORG).scale(1.25)
    dots = VGroup(*[Dot(nl.n2p(v), radius=0.09, color=ORG).set_z_index(3) for v in (-1, 1)])
    pieces = VGroup(*[Line(nl.n2p(a), nl.n2p(b), color=YEL, stroke_width=14, stroke_opacity=0.6)
                      for a, b in ((-3, -1), (-1, 1), (1, 2.85))])
    return nl, dots, pieces


def piece_x(nl, i):
    return nl.n2p((-2, 0, 2)[i])[0]


def f3_axes(center=(-3.4, -0.9, 0)):
    ax = axes((-3, 3, 1), (-3, 3, 1), x_length=5.6, y_length=4.6, center=center, num_size=28)
    return ax


def f3_curve(ax):
    return curve(ax, F3, (-2.05, 2.05))


# ================================================================ the speeding ticket

class K26_Tolls(Shot):
    def body(self):
        self.title("The Speeding Ticket", animate=False)
        rd = road()
        g1, g2 = gantry(B1), gantry(B2)
        d = DoubleArrow([B1 + 1.2, RY - 0.55, 0], [B2 - 1.2, RY - 0.55, 0], buff=0, color=ORG, stroke_width=3, tip_length=0.18)
        dl = M(r"150\ \text{km}", size=44, color=ORG).next_to(d, DOWN, buff=0.12)
        cr = car()
        car_at(cr, -6.2)
        self.add(rd, g1, g2, d, dl, cr)
        cx = ValueTracker(-6.2)
        cr.add_updater(lambda m: car_at(m, cx.get_value()))

        self.go("2:37:36.70", cx.animate.set_value(B1), run=0.62)
        t0 = M(r"0\ \text{h}", size=44, color=ORG).move_to([B1, RY - 0.55, 0])
        self.go("2:37:37.39", FadeIn(t0, shift=UP * 0.1), run=0.4)
        self.go("2:37:38.40", cx.animate.set_value(B2), run=2.3, rate_func=linear)
        t1 = M(r"1.5\ \text{h}", size=44, color=ORG).move_to([B2, RY - 0.55, 0])
        self.go("2:37:40.75", FadeIn(t1, shift=UP * 0.1), run=0.4)

        avg = M(r"\text{average}", "=", r"\frac{150\ \text{km}}{1.5\ \text{h}}", "=", r"100\ \text{km/h}", size=56)
        avg.move_to([-1.6, -1.35, 0])
        avg[4].set_color(YEL)
        self.go("2:37:41.75", Write(avg[0:2]), run=0.7)
        self.go("2:37:42.75", Write(avg[2]), run=1.2)
        self.go("2:37:46.05", Write(avg[3:]), run=0.8)

        sg = limit_sign([4.9, -1.35, 0])
        self.go("2:37:49.20", Create(sg[0]), FadeIn(sg[1]), run=0.7)
        bx = SurroundingRectangle(avg[4], color=RED, buff=0.14, stroke_width=4, corner_radius=0.08)
        gt = M(">", size=60, color=RED).move_to([(avg.get_right()[0] + sg.get_left()[0]) / 2, -1.35, 0])
        self.go("2:37:50.90", Create(bx), FadeIn(gt), run=0.6)

        # the MVT: run the trip again and watch the speedometer
        self.go("2:37:53.70", FadeOut(avg), FadeOut(bx), FadeOut(gt), FadeOut(cr), run=0.6)
        cx.set_value(B1)
        car_at(cr, B1)
        dial = speedometer()
        tt = ValueTracker(0)
        self.add(tt)
        cx.add_updater(lambda m: m.set_value(B1 + dist(tt.get_value()) / 150 * (B2 - B1)))
        ndl = always_redraw(lambda: needle(speed(tt.get_value())))
        rlab = M(r"\text{speed} =", size=44, color=ORG).move_to([0.75, -1.35, 0])
        rnum = readout(rlab, lambda: speed(tt.get_value()), color=ORG, fmt=lambda v: f"{v:.0f}")
        self.go("2:37:54.40", Create(dial), FadeIn(ndl), FadeIn(cr), run=0.8)
        self.go("2:37:55.20", FadeIn(rlab), FadeIn(rnum), run=0.4)
        self.go("2:37:55.75", tt.animate.set_value(0.375), run=2.6, rate_func=linear)
        u = np.array([np.cos(dial_angle(100)), np.sin(dial_angle(100)), 0])
        hit = Line(DC + u * (DRR - 0.25), DC + u * (DRR + 0.12), color=YEL, stroke_width=8)
        spot = Dot([cr.get_center()[0], RY, 0], radius=0.09, color=YEL).set_z_index(7)
        self.go("2:37:58.40", Create(hit), FadeIn(spot, scale=0.5), Circumscribe(VGroup(rlab, rnum), color=YEL), run=0.8)
        self.go("2:37:59.40", tt.animate.set_value(1.5), run=3.4, rate_func=linear)
        cx.clear_updaters()

        # some places really do this
        tk = RoundedRectangle(width=3.4, height=2.0, corner_radius=0.12, stroke_color=CHALK, stroke_width=4).move_to([4.6, -1.5, 0])
        tkh = H("TICKET", 44, RED).move_to(tk.get_top() + DOWN * 0.42)
        tkb = M(r"100\ \text{in an}\ 80", size=44).move_to(tk.get_center() + DOWN * 0.3)
        self.go("2:38:03.40", FadeOut(sg), FadeOut(rlab), FadeOut(rnum), run=0.4)
        self.go("2:38:04.00", Create(tk), FadeIn(tkh), run=0.7)
        self.go("2:38:05.00", Write(tkb), run=0.8)
        self.go("2:38:06.40", Create(under(tkh, RED)), run=0.5)
        self.wipe("2:38:08.55", run=0.4)


# ================================================================ x^3 on [0, 2]

class K26_MvtCube(Shot):
    def body(self):
        self.title("MVT Example", "2:38:09.30")
        f = lambda x: x ** 3
        ax = axes((0, 2.5, 1), (0, 9, 2), x_length=4.6, y_length=4.4, center=(-3.7, -1.15, 0), num_size=30, y_label=None)
        cv = curve(ax, f, (0, 2.08))
        r0 = M("f(x)=x^3", r"\quad [0,\,2]", size=54).move_to([3.3, 1.75, 0])
        r0[0][0].set_color(BLUE)
        self.go("2:38:11.10", FadeIn(ax), FadeIn(ax.labels), Write(r0[0]), run=0.8)
        self.go("2:38:12.20", draw(cv, 1.2, BLUE), run=1.2)
        p0, p1 = pt(ax, 0, 0), pt(ax, 2, 8)
        l1 = M(r"(2,\,8)", size=40, color=ORG).next_to(p1, RIGHT, buff=0.15)
        self.go("2:38:13.90", Write(r0[1]), FadeIn(p0, scale=0.5), FadeIn(p1, scale=0.5), FadeIn(l1), run=0.6)

        sc = secant(ax, f, 0, 2, extend=0.45, color=ORG)
        self.go("2:38:15.30", Create(sc), run=0.8)
        r1 = M(r"\frac{8-0}{2-0}", "=", "4", size=54)
        r1.move_to([3.3, 0.55, 0])
        r1[2].set_color(ORG)
        self.go("2:38:16.50", Write(r1[0]), run=1.3)
        self.go("2:38:19.80", Write(r1[1:]), run=0.5)
        slab = M(r"\text{secant slope} = 4", size=40, color=ORG).move_to([-6.6, 2.05, 0], aligned_edge=LEFT)
        self.go("2:38:20.40", FadeIn(slab), run=0.4)

        c = 2 / np.sqrt(3)
        xt = ValueTracker(0.3)
        tg = slide(ax, f, xt, length=2.4)
        tlab = M(r"\text{tangent slope} =", size=40, color=PINK).next_to(slab, DOWN, buff=0.22, aligned_edge=LEFT)
        tnum = readout(tlab, lambda: slope(f, xt.get_value()), size=40)
        self.go("2:38:21.70", FadeIn(tg), FadeIn(tlab), FadeIn(tnum), run=0.4)
        drive(self, xt, [("2:38:22.40", 0.3), ("2:38:25.20", c)])

        r2 = M("f'(c)", "=", "4", size=56).move_to([3.3, -0.6, 0])
        col(r2, {0: PINK, 2: ORG})
        self.go("2:38:22.60", Write(r2), run=0.8)

        sl = [M("f'(x)", "=", "3x^2", size=56), M("3c^2", "=", "4", size=56), M("c^2", "=", r"\frac{4}{3}", size=56),
              M("c", "=", r"\frac{2}{\sqrt{3}}", r"\approx 1.15", size=56)]
        for m in sl:
            m.shift(RIGHT * (3.3 - m[1].get_x()) + UP * (-1.95 - m[1].get_y()))
        sl[0][0].set_color(PINK)
        sl[3][3].set_color(GRN)
        self.go("2:38:25.60", Write(sl[0]), run=0.8)
        self.go("2:38:27.45", TransformMatchingTex(sl[0], sl[1]), run=0.8)
        self.go("2:38:29.50", TransformMatchingTex(sl[1], sl[2]), run=0.8)
        self.go("2:38:31.95", TransformMatchingTex(sl[2], sl[3]), run=0.9)
        bx = answer_box(sl[3])
        self.go("2:38:34.70", Create(bx), run=0.6)

        dl = DashedLine(ax.c2p(c, f(c)), ax.c2p(c, 0), color=ORG, stroke_width=3, dash_length=0.08)
        cl = M("c", size=44, color=ORG).next_to(ax.c2p(c, 0), DOWN, buff=0.14)
        self.go("2:38:36.80", FadeOut(ax.labels[0]), Create(dl), FadeIn(cl), run=0.6)
        self.go("2:38:37.50", *[Circumscribe(p, shape=Circle, color=ORG, buff=0.1) for p in (p0, p1)], run=0.8)
        tick = tick_mark(GRN, s=0.55).next_to(bx, DOWN, buff=0.25)
        self.go("2:38:39.10", Create(tick), run=0.5)


# ================================================================ f' = 0 everywhere means constant

class K26_Constant(Shot):
    def body(self):
        self.title("Zero Slope Everywhere", "2:38:40.15")
        r1 = VGroup(M("f'(x) = 0", size=60, color=PINK), H("everywhere", 46)).arrange(RIGHT, buff=0.35).move_to([0, 1.55, 0])
        self.go("2:38:44.50", Write(r1[0]), run=0.7)
        self.go("2:38:45.40", FadeIn(r1[1], shift=UP * 0.1), run=0.5)
        r2 = M(r"\Rightarrow", r"f(x) = \text{constant}", size=60).move_to([0, 0.5, 0])
        r2[1].set_color(BLUE)
        self.go("2:38:47.15", Write(r2), run=0.9)

        ax = axes((-1, 7, 1), (0, 3, 1), x_length=9, y_length=2.4, center=(0, -2.0, 0), nums=False)
        fl = lambda x: 1.8
        ln = curve(ax, fl, (-0.6, 6.6))
        self.go("2:38:48.20", FadeIn(ax), FadeIn(ax.labels), draw(ln, 0.9, BLUE), run=0.9)
        xt = ValueTracker(0.2)
        tg = slide(ax, fl, xt, length=1.8)
        lab = M(r"\text{slope} =", size=44, color=PINK).move_to(ax.c2p(2.0, 2.75))
        num = readout(lab, lambda: slope(fl, xt.get_value()))
        self.go("2:38:49.30", FadeIn(tg), FadeIn(lab), FadeIn(num), run=0.4)
        drive(self, xt, [("2:38:49.80", 0.2), ("2:38:53.40", 6.0), ("2:38:56.50", 1.0)])
        self.go("2:38:51.40", Circumscribe(r2[1], color=YEL), run=1.0)
        later = H("used later for integrals", 40, GRN).move_to([4.0, -0.95, 0])
        self.go("2:38:56.90", FadeIn(later, shift=UP * 0.1), run=0.6)


# ================================================================ uphill, downhill

class K26_UpDown(Shot):
    def body(self):
        self.title("Uphill and Downhill", "2:38:58.70")
        g = lambda x: 0.45 + 2.5 * np.exp(-(x - 2.5) ** 2 / 1.5)
        ax = axes((0, 5.2, 1), (0, 3.6, 1), x_length=6.6, y_length=4.4, center=(-2.9, -0.85, 0), nums=False)
        cv = curve(ax, g, (0.2, 4.9))
        self.go("2:38:59.30", FadeIn(ax), FadeIn(ax.labels), draw(cv, 1.4, BLUE), run=1.4)
        xt = ValueTracker(0.7)
        tg = slide(ax, g, xt, length=2.2)
        lab = M(r"\text{slope} =", size=46, color=PINK).move_to([3.0, 1.85, 0])
        num = readout(lab, lambda: slope(g, xt.get_value()), size=46)
        self.go("2:39:01.50", FadeIn(tg), FadeIn(lab), FadeIn(num), run=0.5)

        up = VGroup(M("f' > 0", size=58, color=PINK), H("increasing", 44), updown([0, 0, 0], True)).arrange(RIGHT, buff=0.35)
        up.move_to([3.6, 0.55, 0])
        dn = VGroup(M("f' < 0", size=58, color=PINK), H("decreasing", 44), updown([0, 0, 0], False)).arrange(RIGHT, buff=0.35)
        dn.move_to([3.6, -0.95, 0])
        drive(self, xt, [("2:39:04.10", 0.7), ("2:39:08.20", 2.5), ("2:39:10.05", 2.5), ("2:39:13.50", 4.65)])
        self.go("2:39:04.10", Write(up[0]), run=0.7)
        self.go("2:39:06.90", FadeIn(up[1]), run=0.5)
        self.go("2:39:08.30", GrowArrow(up[2]), run=0.5)
        self.go("2:39:10.05", Write(dn[0]), run=0.7)
        self.go("2:39:12.30", FadeIn(dn[1]), run=0.5)
        self.go("2:39:13.60", GrowArrow(dn[2]), run=0.5)


# ================================================================ the plan, the sign chart setup for x^3 - 3x

class K26_Plan(Shot):
    def body(self):
        self.title("Sign Chart", "2:39:15.10")
        nl, dots, pieces = chart()
        self.go("2:39:15.60", Create(nl), FadeIn(nl.labels), run=0.8)
        cap = [H("1. critical points", 46, YEL), H("2. pieces", 46, YEL), H("3. test each piece", 46, YEL)]
        for c in cap:
            c.move_to([0, 1.6, 0])
        self.go("2:39:16.40", FadeIn(cap[0]), *[FadeIn(d, shift=DOWN * 0.4) for d in dots], run=0.6)
        self.go("2:39:18.10", ReplacementTransform(cap[0], cap[1]), LaggedStart(*[Create(p) for p in pieces], lag_ratio=0.4), run=1.2)
        tds = VGroup(*[Dot([piece_x(nl, i), nl.get_y(), 0], radius=0.07, color=CHALK) for i in range(3)])
        qs = VGroup(*[M("?", size=60, color=PINK).move_to([piece_x(nl, i), nl.get_y() + 0.75, 0]) for i in range(3)])
        self.go("2:39:20.50", ReplacementTransform(cap[1], cap[2]), run=0.6)
        self.go("2:39:21.20", LaggedStart(*[FadeIn(d, scale=0.5) for d in tds], lag_ratio=0.3), run=0.8)
        self.go("2:39:23.30", LaggedStart(*[FadeIn(q, shift=UP * 0.1) for q in qs], lag_ratio=0.3), run=0.9)

        # the example
        rf = M("f(x)", "=", "x^3-3x", size=58).move_to([0, 1.85, 0])
        rf[0].set_color(BLUE)
        self.go("2:39:26.40", FadeOut(cap[2]), FadeOut(qs), FadeOut(tds), FadeOut(pieces), run=0.5)
        self.go("2:39:27.00", Write(rf), run=1.0)
        rd = M("f'(x)", "=", "3x^2-3", size=58)
        rd.shift(RIGHT * (rf[1].get_x() - rd[1].get_x()) + UP * (1.0 - rd[1].get_y()))
        rd[0].set_color(PINK)
        self.go("2:39:30.40", Write(rd), run=0.9)
        rd2 = M("f'(x)", "=", "3(x-1)(x+1)", size=58)
        rd2.shift(RIGHT * (rf[1].get_x() - rd2[1].get_x()) + UP * (1.0 - rd2[1].get_y()))
        rd2[0].set_color(PINK)
        self.go("2:39:33.20", TransformMatchingTex(rd, rd2), run=1.0)
        crit = VGroup(nl.labels[2], nl.labels[4])
        self.go("2:39:37.50", *[Circumscribe(m, shape=Circle, color=ORG, buff=0.08) for m in crit], run=0.9)
        # make room: the derivative moves to the top line
        self.go("2:39:38.60", FadeOut(rf), rd2.animate.move_to([0, 1.85, 0]), run=0.6)
        self.go("2:39:40.60", LaggedStart(*[Create(p) for p in pieces], lag_ratio=0.4), run=1.0)
        pl = [M("x<-1", size=48), M("-1<x<1", size=48), M("x>1", size=48)]
        for i, (m, t) in enumerate(zip(pl, ("2:39:41.95", "2:39:43.60", "2:39:45.65"))):
            m.move_to([piece_x(nl, i), -1.45, 0])
            self.go(t, FadeIn(m, shift=UP * 0.1), pieces[i].animate.set_stroke(opacity=0.95), run=0.6)


def sign_board():
    """The Plan's last frame (for K26_SignTest to start on)."""
    nl, dots, pieces = chart()
    pieces.set_stroke(opacity=0.95)
    rd2 = M("f'(x)", "=", "3(x-1)(x+1)", size=58).move_to([0, 1.85, 0])
    rd2[0].set_color(PINK)
    pl = [M("x<-1", size=48), M("-1<x<1", size=48), M("x>1", size=48)]
    for i, m in enumerate(pl):
        m.move_to([piece_x(nl, i), -1.45, 0])
    return nl, dots, pieces, rd2, pl


class K26_SignTest(Shot):
    def body(self):
        self.title("Sign Chart", animate=False)
        nl, dots, pieces, rd2, pl = sign_board()
        self.add(nl, nl.labels, dots, pieces, rd2, *pl)
        tests = [("x=-2", "3(-3)(-1)", "+", True), ("x=0", "3(-1)(1)", "-", False), ("x=2", "3(1)(3)", "+", True)]
        times = [("2:39:47.40", "2:39:49.85", "2:39:52.95", "2:39:54.25"),
                 ("2:39:55.60", "2:39:57.62", "2:40:00.10", "2:40:01.22"),
                 ("2:40:02.65", "2:40:04.72", "2:40:06.92", "2:40:08.04")]
        rows = []
        for i, ((xv, calc, s, isup), (ta, tb, tc, td)) in enumerate(zip(tests, times)):
            x = piece_x(nl, i)
            xm = M(xv, size=48, color=ORG).move_to([x, -1.45, 0])
            cm = M(calc, size=48).move_to([x, -2.35, 0])
            sm = sgn(s).move_to([x, nl.get_y() + 0.6, 0])
            am = updown([x, nl.get_y() + 1.35, 0], isup)
            self.go(ta, ReplacementTransform(pl[i], xm), run=0.6)
            self.go(tb, Write(cm), run=0.9)
            self.go(tc, FadeIn(sm, scale=0.6), run=0.5)
            self.go(td, GrowArrow(am), run=0.5)
            rows += [xm, cm]

        # up, down, up: the real graph under the chart
        self.go("2:40:09.20", *[FadeOut(m) for m in rows], run=0.4)
        u = (nl.n2p(1) - nl.n2p(0))[0]
        y0 = -2.35
        g = ParametricFunction(lambda x: np.array([nl.n2p(0)[0] + u * x, y0 + 0.36 * F3(x), 0]), t_range=[-2.08, 2.08],
                               color=BLUE, stroke_width=5)
        self.go("2:40:09.70", draw(g, 2.4, BLUE), run=2.4)
        guides = VGroup(*[DashedLine(nl.n2p(v) + DOWN * 0.6, [nl.n2p(v)[0], y0 - 0.36 * 2 * v, 0], color=ORG, stroke_width=3,
                                     dash_length=0.08) for v in (-1, 1)])
        self.go("2:40:12.20", Create(guides), run=0.6)


# ================================================================ the first derivative test

class K26_FirstTest(Shot):
    def body(self):
        self.title("First Derivative Test", "2:40:13.40")
        X = (-4.5, 0.0, 4.5)
        cases = [("+", "-", lambda t: 0.8 - 0.55 * t * t, "local max", 1.0),
                 ("-", "+", lambda t: -0.8 + 0.55 * t * t, "local min", 1.0),
                 ("+", "+", lambda t: 0.62 * t ** 3, "neither", 1.0)]
        T = [("2:40:17.10", "2:40:19.00", "2:40:19.62", "2:40:21.60", 1.3, "2:40:24.85"),
             ("2:40:26.40", "2:40:27.75", "2:40:28.05", "2:40:29.30", 1.2, "2:40:32.40"),
             ("2:40:33.65", "2:40:34.40", "2:40:34.75", "2:40:37.00", 3.2, "2:40:35.55")]
        for i, ((s1, s2, fn, name, _), (ta, tb, tc, td, run, te)) in enumerate(zip(cases, T)):
            x0 = X[i]
            ml = mini_line(x0, -1.25)
            dot = Dot([x0, -1.25, 0], radius=0.08, color=ORG).set_z_index(3)
            a = sgn(s1, size=64).move_to([x0 - 0.75, -0.8, 0])
            b = sgn(s2, size=64).move_to([x0 + 0.75, -0.8, 0])
            cv = shape(x0, 0.75, fn, xr=1.25)
            lab = H(name, 44, YEL).move_to([x0, -2.15, 0])
            self.go(ta, Create(ml), FadeIn(dot, scale=0.5), run=0.5)
            self.go(tb, FadeIn(a, scale=0.6), run=0.3)
            self.go(tc, FadeIn(b, scale=0.6), run=0.4)
            if i < 2:
                self.go(td, draw(cv, run, BLUE), run=run)
                top = Dot([x0, 0.75 + fn(0), 0], radius=0.08, color=ORG).set_z_index(3)
                self.go(te, FadeIn(lab, shift=UP * 0.1), FadeIn(top, scale=0.5), run=0.5)
            else:
                self.go(te, FadeIn(lab, shift=UP * 0.1), run=0.5)
                x3 = M("x^3", size=48, color=BLUE).move_to([x0 - 1.0, 1.7, 0])
                self.go("2:40:36.55", FadeIn(x3), run=0.4)
                self.go(td, draw(cv, run, BLUE), run=run)
                flat = Line([x0 - 0.55, 0.75, 0], [x0 + 0.55, 0.75, 0], color=PINK, stroke_width=5)
                self.go("2:40:40.30", Create(flat), run=0.5)


# ================================================================ our max and min

def f3_board():
    ax = f3_axes()
    cv = f3_curve(ax)
    mx, mn = pt(ax, -1, 2), pt(ax, 1, -2)
    lmx = VGroup(M(r"(-1,\,2)", size=40, color=ORG), H("local max", 40, YEL)).arrange(UP, buff=0.08)
    lmx.next_to(mx, UP, buff=0.12).shift(LEFT * 0.85)
    lmn = VGroup(H("local min", 40, YEL), M(r"(1,\,-2)", size=40, color=ORG)).arrange(UP, buff=0.08)
    lmn.next_to(mn, DOWN, buff=0.12).shift(RIGHT * 0.55)
    return ax, cv, mx, mn, lmx, lmn


class K26_FirstApply(Shot):
    def body(self):
        self.title("Our Max and Min", "2:40:41.80")
        ax, cv, mx, mn, lmx, lmn = f3_board()
        nl, dots, _ = chart(center=(3.55, 1.25, 0), length=5.6, size=30)
        signs = VGroup(*[sgn(s, size=56).move_to([piece_x(nl, i), 1.85, 0]) for i, s in enumerate("+-+")])
        self.go("2:40:42.20", FadeIn(ax), FadeIn(ax.labels), FadeIn(nl), FadeIn(nl.labels), FadeIn(dots), FadeIn(signs), run=0.6)
        self.go("2:40:42.90", draw(cv, 1.5, BLUE), run=1.5)
        self.go("2:40:45.60", Circumscribe(VGroup(signs[0], signs[1]), color=YEL), run=1.0)
        self.go("2:40:47.70", FadeIn(mx, scale=0.5), FadeIn(lmx[1], shift=UP * 0.1), run=0.5)

        ex = 1.6
        r1 = M("f(-1)", "=", "-1+3", "=", "2", size=56)
        r1.shift(RIGHT * (ex - r1[1].get_x()) + UP * (0.05 - r1[1].get_y()))
        r1[4].set_color(ORG)
        self.go("2:40:50.40", Write(r1[0]), run=0.6)
        self.go("2:40:52.20", Write(r1[1:3]), run=0.8)
        self.go("2:40:54.25", Write(r1[3:]), run=0.5)
        self.go("2:40:56.40", FadeIn(lmx[0], shift=UP * 0.1), run=0.5)

        self.go("2:40:59.00", Circumscribe(VGroup(signs[1], signs[2]), color=YEL), run=1.0)
        self.go("2:41:02.25", FadeIn(mn, scale=0.5), FadeIn(lmn[0], shift=DOWN * 0.1), run=0.5)
        r2 = M("f(1)", "=", "1-3", "=", "-2", size=56)
        r2.shift(RIGHT * (ex - r2[1].get_x()) + UP * (-1.15 - r2[1].get_y()))
        r2[4].set_color(ORG)
        self.go("2:41:03.40", Write(r2[0]), run=0.6)
        self.go("2:41:04.45", Write(r2[1:3]), run=0.7)
        self.go("2:41:05.50", Write(r2[3:]), run=0.5)
        self.go("2:41:07.40", FadeIn(lmn[1], shift=DOWN * 0.1), run=0.5)


# ================================================================ concavity

class K26_Concave(Shot):
    def body(self):
        self.title("The Second Derivative", "2:41:10.10")
        big = M("f''(x)", size=90, color=PINK).move_to([0, 0.4, 0])
        self.go("2:41:10.90", Write(big), run=0.8)
        bend = shape(0, -1.3, lambda t: 0.3 * t * t, xr=1.6, color=BLUE)
        self.go("2:41:12.60", draw(bend, 1.0, BLUE), run=1.0)
        self.title("Concavity", "2:41:15.05")
        self.go("2:41:16.30", FadeOut(big), FadeOut(bend), run=0.4)

        a = 0.55
        L, R = -3.4, 3.4
        r1 = M("f'' > 0", size=60, color=PINK).move_to([L, 1.6, 0])
        w1 = H("concave up", 48, YEL).move_to([L, 0.85, 0])
        cup = shape(L, -2.6, lambda t: a * t * t, xr=1.75)
        self.go("2:41:17.10", Write(r1), run=0.7)
        self.go("2:41:19.30", FadeIn(w1, shift=UP * 0.1), run=0.5)
        self.go("2:41:20.50", draw(cup, 1.0, BLUE), run=1.0)
        lv = ValueTracker(0.02)

        def water():
            h = lv.get_value()
            xs = np.linspace(-np.sqrt(h / a), np.sqrt(h / a), 30)
            pts = [[L + x, -2.6 + a * x * x, 0] for x in xs]
            return Polygon(*pts, stroke_width=0, fill_color=BLUE, fill_opacity=0.35)
        wt = always_redraw(water)
        self.add(wt)
        self.go("2:41:23.60", lv.animate.set_value(1.25), run=1.4)

        r2 = M("f'' < 0", size=60, color=PINK).move_to([R, 1.6, 0])
        w2 = H("concave down", 48, YEL).move_to([R, 0.85, 0])
        frown = shape(R, -0.85, lambda t: -a * t * t, xr=1.75)
        self.go("2:41:26.30", Write(r2), run=0.7)
        self.go("2:41:28.20", FadeIn(w2, shift=UP * 0.1), run=0.5)
        self.go("2:41:30.00", draw(frown, 1.0, BLUE), run=1.0)
        self.go("2:41:32.70", Circumscribe(w2, color=YEL), run=0.9)


# ================================================================ why it bends: the slope keeps changing

class K26_ConcaveWhy(Shot):
    def body(self):
        self.title("Why It Bends", "2:41:33.90")
        r = M("f''", "=", r"\text{rate of change of the slope}", size=54).move_to([0, 1.8, 0])
        r[0].set_color(PINK)
        self.go("2:41:35.10", Write(r), run=1.2)
        fu = lambda x: 0.35 * x * x
        fd = lambda x: 2.0 - 0.35 * x * x
        kw = dict(x_length=5.2, y_length=3.0, nums=False, x_label=None, y_label=None)
        axl = axes((-2.6, 2.6, 1), (-0.4, 2.4, 1), center=(-3.4, -1.75, 0), **kw)
        axr = axes((-2.6, 2.6, 1), (-0.4, 2.4, 1), center=(3.4, -1.75, 0), **kw)
        cl, cr = curve(axl, fu, (-2.3, 2.3)), curve(axr, fd, (-2.3, 2.3))
        self.go("2:41:36.40", FadeIn(axl), draw(cl, 0.9, BLUE), run=0.9)
        xl = ValueTracker(-2.0)
        tl = slide(axl, fu, xl, length=1.8)
        ll = M(r"\text{slope} =", size=44, color=PINK).move_to([-4.0, 0.75, 0])
        nl_ = readout(ll, lambda: slope(fu, xl.get_value()))
        self.go("2:41:37.80", FadeIn(tl), FadeIn(ll), FadeIn(nl_), run=0.5)
        drive(self, xl, [("2:41:38.60", -2.0), ("2:41:43.60", 2.0)])
        upa = Arrow([-1.55, 0.45, 0], [-1.55, 1.15, 0], buff=0, color=PINK, stroke_width=6, tip_length=0.2)
        self.go("2:41:40.10", GrowArrow(upa), run=0.5)

        self.go("2:41:44.40", FadeIn(axr), draw(cr, 0.9, BLUE), run=0.9)
        xr = ValueTracker(-2.0)
        tr = slide(axr, fd, xr, length=1.8)
        lr = M(r"\text{slope} =", size=44, color=PINK).move_to([2.8, 0.75, 0])
        nr = readout(lr, lambda: slope(fd, xr.get_value()))
        self.go("2:41:45.45", FadeIn(tr), FadeIn(lr), FadeIn(nr), run=0.4)
        drive(self, xr, [("2:41:45.90", -2.0), ("2:41:49.90", 2.0)])
        dna = Arrow([5.25, 1.15, 0], [5.25, 0.45, 0], buff=0, color=PINK, stroke_width=6, tip_length=0.2)
        self.go("2:41:47.20", GrowArrow(dna), run=0.5)


# ================================================================ inflection points

class K26_Inflection(Shot):
    def body(self):
        ax2 = axes((-2.5, 2.5, 1), (-3, 3, 1), x_length=5.6, y_length=4.6, center=(-3.0, -0.75, 0), nums=False)
        cv = f3_curve(ax2)
        self.go("2:41:50.40", FadeIn(ax2), FadeIn(ax2.labels), run=0.4)
        self.go("2:41:50.90", draw(cv, 2.0, BLUE), run=2.0)
        dn = H("concave down", 40, DIM).next_to(ax2.c2p(-1, 2), UP, buff=0.2).shift(LEFT * 1.0)
        up = H("concave up", 40, DIM).next_to(ax2.c2p(1, -2), DOWN, buff=0.2).shift(RIGHT * 0.55)
        self.go("2:41:53.10", FadeIn(dn, shift=UP * 0.1), run=0.4)
        self.go("2:41:53.95", FadeIn(up, shift=DOWN * 0.1), run=0.4)
        self.title("Inflection Point", "2:41:55.05")
        ip = pt(ax2, 0, 0, color=YEL, r=0.11)
        self.go("2:41:55.60", FadeIn(ip, scale=0.4), run=0.4)
        xt = ValueTracker(-1.6)
        tg = slide(ax2, F3, xt, length=2.0)
        self.go("2:41:56.70", FadeIn(tg), run=0.3)
        self.go("2:41:57.00", xt.animate.set_value(1.6), run=3.6)
        self.go("2:42:00.70", FadeOut(tg), run=0.3)

        rx = 3.8
        r1 = M("f''(x)", "=", "0", size=56).move_to([rx, 1.3, 0])
        r1[0].set_color(PINK)
        r2 = H("or undefined", 44).move_to([rx, 0.45, 0])
        r3 = M(r"\text{then check: } f''\ \text{changes sign}", size=44).move_to([rx, -0.75, 0])
        r3b = VGroup(sgn("-", size=56), M(r"\to", size=50), sgn("+", size=56)).arrange(RIGHT, buff=0.3).move_to([rx, -1.65, 0])
        self.go("2:42:03.90", Write(r1), run=0.8)
        self.go("2:42:05.00", FadeIn(r2, shift=UP * 0.1), run=0.5)
        self.go("2:42:06.30", Write(r3), run=1.0)
        self.go("2:42:07.70", FadeIn(r3b), run=0.5)


# ================================================================ x^3 - 3x: f'' = 6x

class K26_InflectEx(Shot):
    def body(self):
        self.title("Inflection Example", "2:42:09.05")
        ax = axes((-3, 3, 1), (-3, 3, 1), x_length=5.6, y_length=4.6, center=(-3.4, -0.9, 0), num_size=28)
        cv = f3_curve(ax)
        rf = M("f(x)=x^3-3x", size=50, color=BLUE).move_to([3.6, 1.85, 0])
        self.go("2:42:09.60", FadeIn(ax), FadeIn(ax.labels), Write(rf), run=0.65)
        self.go("2:42:10.30", draw(cv, 1.4, BLUE), run=1.4)
        r1 = M("f''(x)", "=", "6x", size=56).move_to([3.6, 0.95, 0])
        r1[0].set_color(PINK)
        self.go("2:42:12.70", Write(r1[0]), run=0.6)
        self.go("2:42:13.80", Write(r1[1:]), run=0.5)
        r2 = M("6x=0", r"\ \Rightarrow\ ", "x=0", size=52).move_to([3.6, 0.05, 0])
        r2[2].set_color(ORG)
        self.go("2:42:15.45", Write(r2), run=0.9)

        x0 = 3.6
        ml = mini_line(x0, -1.25, half=2.2)
        z = M("0", size=36, color=ORG).next_to([x0, -1.37, 0], DOWN, buff=0.08)
        self.go("2:42:17.65", Create(ml), FadeIn(z), run=0.6)
        sm = sgn("-", size=60).move_to([x0 - 1.1, -0.8, 0])
        sp = sgn("+", size=60).move_to([x0 + 1.1, -0.8, 0])
        wd = H("down", 42, YEL).move_to([x0 - 1.1, -1.9, 0])
        wu = H("up", 42, YEL).move_to([x0 + 1.1, -1.9, 0])
        left = curve(ax, F3, (-2.05, 0), color=YEL, width=8)
        right = curve(ax, F3, (0, 2.05), color=YEL, width=8)
        self.go("2:42:19.95", FadeIn(sm, scale=0.6), run=0.4)
        self.go("2:42:20.85", FadeIn(wd), Create(left), run=0.8)
        self.go("2:42:22.30", FadeOut(left), run=0.5)
        self.go("2:42:23.90", FadeIn(sp, scale=0.6), run=0.4)
        self.go("2:42:24.80", FadeIn(wu), Create(right), run=0.8)
        self.go("2:42:26.20", FadeOut(right), run=0.5)
        ip = pt(ax, 0, 0, color=YEL, r=0.11)
        self.go("2:42:28.35", FadeIn(ip, scale=0.4), run=0.4)
        r3 = M("f(0)=0", size=52).move_to([3.6, -2.85, 0])
        self.go("2:42:30.30", Write(r3), run=0.7)
        lab = M(r"(0,\,0)", size=40, color=YEL).next_to(ax.c2p(0, 0), UR, buff=0.12)
        ipw = H("inflection point", 42, YEL).move_to([3.6, -3.5, 0])
        self.go("2:42:33.40", FadeIn(lab, shift=LEFT * 0.1), FadeIn(ipw, shift=UP * 0.1), run=0.5)


# ================================================================ x^4: f'' = 0 but no inflection

class K26_FourthPower(Shot):
    def body(self):
        self.title("Check the Sign", "2:42:35.40")
        f = lambda x: x ** 4
        ax = axes((-2, 2, 1), (0, 4.5, 1), x_length=5.2, y_length=4.6, center=(-3.4, -0.9, 0), num_size=28)
        cv = curve(ax, f, (-1.42, 1.42))
        rf = M("f(x)=x^4", size=54, color=BLUE).move_to([3.4, 1.75, 0])
        self.go("2:42:37.60", FadeIn(ax), FadeIn(ax.labels), Write(rf), run=0.5)
        self.go("2:42:38.20", draw(cv, 1.1, BLUE), run=1.1)
        r1 = M("f''(x)", "=", "12x^2", size=56).move_to([3.4, 0.85, 0])
        r1[0].set_color(PINK)
        self.go("2:42:39.40", Write(r1[0]), run=0.6)
        self.go("2:42:40.30", Write(r1[1:]), run=0.6)
        r2 = M("f''(0)=0", size=52).move_to([3.4, -0.05, 0])
        o = pt(ax, 0, 0)
        self.go("2:42:42.00", Write(r2), FadeIn(o, scale=0.5), run=0.8)

        x0 = 3.4
        ml = mini_line(x0, -1.3, half=2.2)
        z = M("0", size=36, color=ORG).next_to([x0, -1.42, 0], DOWN, buff=0.08)
        self.go("2:42:43.80", Create(ml), FadeIn(z), run=0.6)
        s1 = sgn("+", size=60).move_to([x0 - 1.1, -0.85, 0])
        s2 = sgn("+", size=60).move_to([x0 + 1.1, -0.85, 0])
        self.go("2:42:46.00", FadeIn(s1, scale=0.6), run=0.4)
        self.go("2:42:46.80", FadeIn(s2, scale=0.6), run=0.4)
        cu = H("concave up everywhere", 42, YEL).move_to([3.4, -2.25, 0])
        self.go("2:42:48.80", FadeIn(cu, shift=UP * 0.1), run=0.5)
        no = VGroup(cross_mark(RED, s=0.2), H("no inflection point", 42, RED)).arrange(RIGHT, buff=0.25).move_to([3.4, -3.1, 0])
        self.go("2:42:50.60", FadeIn(no, shift=UP * 0.1), run=0.5)
        self.go("2:42:53.20", Circumscribe(r2, color=YEL), run=0.9)


# ================================================================ the second derivative test

class K26_SecondTest(Shot):
    def body(self):
        self.title("Classify Critical Points", "2:42:55.60")
        self.title("Second Derivative Test", "2:43:00.25")
        top = M("f'(c)=0", r"\quad\Rightarrow\quad", r"\text{sign of } f''(c)", size=54).move_to([0, 1.75, 0])
        top[0].set_color(PINK)
        self.go("2:43:05.40", Write(top[0]), run=0.8)
        self.go("2:43:08.00", Write(top[1:]), run=1.0)

        a, L, R = 0.55, -3.4, 3.4
        c1 = M("f''(c) > 0", size=54).move_to([L, 0.75, 0])
        cup = shape(L, -2.0, lambda t: a * t * t, xr=1.6)
        f1_ = Line([L - 0.75, -2.0, 0], [L + 0.75, -2.0, 0], color=PINK, stroke_width=5)
        d1 = Dot([L, -2.0, 0], radius=0.09, color=ORG).set_z_index(5)
        n1 = H("local min", 46, YEL).move_to([L, -2.8, 0])
        self.go("2:43:10.70", Write(c1), run=0.7)
        self.go("2:43:12.40", draw(cup, 0.9, BLUE), run=0.9)
        self.go("2:43:14.10", Create(f1_), run=0.5)
        self.go("2:43:15.50", FadeIn(d1, scale=0.5), run=0.4)
        self.go("2:43:16.80", FadeIn(n1, shift=UP * 0.1), run=0.5)

        c2 = M("f''(c) < 0", size=54).move_to([R, 0.75, 0])
        frown = shape(R, -0.35, lambda t: -a * t * t, xr=1.6)
        f2_ = Line([R - 0.75, -0.35, 0], [R + 0.75, -0.35, 0], color=PINK, stroke_width=5)
        d2 = Dot([R, -0.35, 0], radius=0.09, color=ORG).set_z_index(5)
        n2 = H("local max", 46, YEL).move_to([R, -2.8, 0])
        self.go("2:43:18.40", Write(c2), run=0.7)
        self.go("2:43:19.80", draw(frown, 0.9, BLUE), run=0.9)
        self.go("2:43:21.10", Create(f2_), run=0.5)
        self.go("2:43:22.60", FadeIn(d2, scale=0.5), run=0.4)
        self.go("2:43:23.80", FadeIn(n2, shift=UP * 0.1), run=0.5)

        self.wipe("2:43:25.15", keep=(top,))
        z = M("f''(c) = 0", r"\quad\Rightarrow\quad", "?", size=64).move_to([0, 0.15, 0])
        z[2].set_color(YEL).scale(1.3)
        self.go("2:43:25.60", Write(z[0]), run=0.7)
        self.go("2:43:26.65", FadeIn(z[1:]), run=0.5)
        back = H("use the first derivative test", 46, YEL).move_to([0, -1.4, 0])
        self.go("2:43:28.40", FadeIn(back, shift=UP * 0.1), run=0.6)


# ================================================================ back to x^3 - 3x

class K26_SecondApply(Shot):
    def body(self):
        self.title("Check Our Example", "2:43:30.85")
        ax, cv, mx, mn, lmx, lmn = f3_board()
        ex = 2.1
        rf = M("f''(x)", "=", "6x", size=54)
        rf.shift(RIGHT * (ex - rf[1].get_x()) + UP * (1.6 - rf[1].get_y()))
        rf[0].set_color(PINK)
        self.go("2:43:31.40", FadeIn(ax), FadeIn(ax.labels), FadeIn(cv), FadeIn(mx), FadeIn(mn), FadeIn(lmx), FadeIn(lmn),
                FadeIn(rf), run=0.5)
        r1 = M("f''(-1)", "=", "-6", r"\ \Rightarrow\ ", r"\text{max}", size=54)
        r1.shift(RIGHT * (ex - r1[1].get_x()) + UP * (0.3 - r1[1].get_y()))
        col(r1, {0: PINK, 4: YEL})
        self.go("2:43:32.05", Write(r1[0]), run=0.7)
        self.go("2:43:33.95", Write(r1[1:3]), run=0.5)
        self.go("2:43:35.40", Write(r1[3:]), run=0.7)
        t1 = tick_mark(GRN, s=0.5).next_to(r1, RIGHT, buff=0.3)
        self.go("2:43:37.55", Create(t1), Circumscribe(lmx[1], color=GRN), run=0.8)

        r2 = M("f''(1)", "=", "6", r"\ \Rightarrow\ ", r"\text{min}", size=54)
        r2.shift(RIGHT * (ex - r2[1].get_x()) + UP * (-1.0 - r2[1].get_y()))
        col(r2, {0: PINK, 4: YEL})
        self.go("2:43:38.60", Write(r2[0]), run=0.7)
        self.go("2:43:40.10", Write(r2[1:3]), run=0.5)
        self.go("2:43:41.05", Write(r2[3:]), run=0.7)
        t2 = tick_mark(GRN, s=0.5).next_to(r2, RIGHT, buff=0.3)
        t2.set_x(t1.get_x())
        self.go("2:43:43.30", Create(t2), Circumscribe(lmn[0], color=GRN), run=0.8)


# ================================================================ when the test fails

class K26_TestFails(Shot):
    def body(self):
        self.title("When the Test Fails", "2:43:44.55")
        X = (-4.5, 0.0, 4.5)
        fs = [(lambda x: x ** 4, "x^4", 1.12, "min", "2:43:47.25"),
              (lambda x: x ** 3, "x^3", 1.15, "neither", "2:43:48.55"),
              (lambda x: -x ** 4, "-x^4", 1.12, "max", "2:43:49.55")]
        ff, nm, dots = [], [], []
        for i, (fn, tex, r, name, t) in enumerate(fs):
            ax = axes((-1.5, 1.5, 1), (-1.6, 1.6, 1), x_length=3.2, y_length=2.8, center=(X[i], -0.2, 0),
                      nums=False, x_label=None, y_label=None)
            cv = curve(ax, fn, (-r, r))
            lab = M(tex, size=52, color=BLUE).move_to([X[i], 1.75, 0])
            self.go(t, FadeIn(ax), Write(lab), draw(cv, 0.9, BLUE), run=0.9)
            ff.append(M("f''(0)=0", size=44).move_to([X[i], -2.05, 0]))
            nm.append(H(name, 44, YEL).move_to([X[i], -2.8, 0]))
            dots.append(pt(ax, 0, 0))
        self.go("2:43:51.20", *[FadeIn(m, shift=UP * 0.1) for m in ff], *[FadeIn(d, scale=0.5) for d in dots], run=0.7)
        for m, t in zip(nm, ("2:43:55.15", "2:43:56.05", "2:43:57.40")):
            self.go(t, FadeIn(m, shift=UP * 0.1), run=0.4)
        q = M(r"f''=0", r"\ \Rightarrow\ ", r"\text{?}", size=50, color=YEL).move_to([0, -3.45, 0])
        q[2].scale(1.3)
        self.go("2:43:58.45", Write(q), run=0.8)


# ================================================================ the full example (builder 27 carries on from f''(-1) = -18)

class K26_FullEx(Shot):
    def body(self):
        self.title("A Full Example", "2:44:02.55")
        r0 = M("f(x)", "=", "2x^3-3x^2-12x+5", size=56).move_to([0, 1.75, 0])
        r0[0].set_color(BLUE)
        self.go("2:44:03.10", Write(r0), run=2.0)
        tasks = [pill("critical points", ORG, 36), pill("classify", YEL, 36), pill("inflection", PINK, 36)]
        row = VGroup(*tasks).arrange(RIGHT, buff=0.6).move_to([0, 0.85, 0])
        for p, t in zip(tasks, ("2:44:08.60", "2:44:09.95", "2:44:11.55")):
            self.go(t, FadeIn(p, shift=UP * 0.1), run=0.5)

        lx = -3.6
        a1 = M("f'(x)", "=", "6x^2-6x-12", size=50)
        a1.shift(RIGHT * (lx - a1[1].get_x()) + UP * (-0.2 - a1[1].get_y()))
        a1[0].set_color(PINK)
        self.go("2:44:13.20", Write(a1[0]), run=0.5)
        self.go("2:44:13.75", Write(a1[1:]), run=1.2)
        a2 = M("=", "6(x^2-x-2)", size=50)
        a2.shift(RIGHT * (lx - a2[0].get_x()) + UP * (-1.1 - a2[0].get_y()))
        self.go("2:44:17.30", Write(a2), run=1.2)
        a3 = M("=", "6(x-2)(x+1)", size=50)
        a3.shift(RIGHT * (lx - a3[0].get_x()) + UP * (-1.1 - a3[0].get_y()))
        self.go("2:44:21.35", TransformMatchingTex(a2, a3), run=1.0)
        cp = M("x=-1", r",\quad", "x=2", size=52, color=ORG).move_to([lx - 0.4, -2.2, 0])
        self.go("2:44:24.70", Write(cp), run=0.8)
        tk = tick_mark(GRN, s=0.45).next_to(tasks[0], LEFT, buff=0.2)
        self.go("2:44:26.10", Create(tk), run=0.4)

        rx = 3.4
        b1 = M("f''(x)", "=", "12x-6", size=50)
        b1.shift(RIGHT * (rx - b1[1].get_x()) + UP * (-0.2 - b1[1].get_y()))
        b1[0].set_color(PINK)
        self.go("2:44:27.65", Write(b1[0]), run=0.5)
        self.go("2:44:28.55", Write(b1[1:]), run=0.8)
        b2 = M("f''(-1)", "=", "-18", size=50)
        b2.shift(RIGHT * (rx - b2[1].get_x()) + UP * (-1.1 - b2[1].get_y()))
        b2[0].set_color(PINK)
        self.go("2:44:30.95", Write(b2[0]), run=0.7)
        self.go("2:44:33.40", Write(b2[1:]), run=0.6)
        b3 = VGroup(M(r"<0", r"\ \Rightarrow\ ", size=50), H("local max", 46, YEL)).arrange(RIGHT, buff=0.2)
        b3.move_to([rx + 0.3, -2.2, 0])
        self.go("2:44:34.60", Write(b3[0]), run=0.5)
        self.go("2:44:35.60", FadeIn(b3[1], shift=UP * 0.1), run=0.5)
