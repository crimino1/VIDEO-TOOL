"""Builder 03: Part 4, the family of functions - linear, quadratic, polynomial, rational,
exponential (and e), logarithm, trig - then the quick check."""
from common import *


# ---------- helpers ----------

def grid_axes(xr, yr, ux, uy, origin, xnums=(), ynums=(), xstep=1, ystep=1, names=True):
    """Axes with integer ticks, the origin placed at `origin` on screen. Returns (ax, labels)."""
    ax = Axes(x_range=[xr[0], xr[1], xstep], y_range=[yr[0], yr[1], ystep],
              x_length=(xr[1] - xr[0]) * ux, y_length=(yr[1] - yr[0]) * uy,
              axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, include_numbers=False))
    ax.shift(np.array([origin[0], origin[1], 0.0]) - ax.c2p(0, 0))
    labs = VGroup()
    for v in xnums:
        labs.add(M(str(v), size=34, color=DIM).next_to(ax.c2p(v, 0), DOWN, buff=0.15))
    for v in ynums:
        labs.add(M(str(v), size=34, color=DIM).next_to(ax.c2p(0, v), LEFT, buff=0.15))
    if names:
        labs.add(M("x", size=42, color=DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.12))
        labs.add(M("y", size=42, color=DIM).next_to(ax.y_axis.get_end(), RIGHT, buff=0.12))
    return ax, labs


def smooth(f, a, b, n=80, color=BLUE, width=6):
    xs = np.linspace(a, b, n)
    return VMobject(stroke_color=color, stroke_width=width).set_points_smoothly([np.array([x, f(x), 0]) for x in xs])


def tangent_at(p, m, L=1.8):
    """Short pink tangent through screen point p with screen slope m, plus a yellow dot."""
    d = np.array([1, m, 0]) / np.hypot(1, m)
    return VGroup(Line(p - d * L / 2, p + d * L / 2, color=PINK, stroke_width=6), Dot(p, radius=0.08, color=YEL))


NAMES = ["Linear", "Quadratic", "Polynomial", "Rational", "Exponential", "Logarithm", "Trig"]
KINDS = ["lin", "quad", "poly", "rat", "exp", "log", "trig"]


def mini(kind):
    """Tiny graph for a family portrait, centred on the origin (about 2.2 x 1.3)."""
    W, Hh = 1.0, 0.55
    g = VGroup(Line([-W - 0.1, 0, 0], [W + 0.1, 0, 0], color=DIM, stroke_width=2),
               Line([0, -Hh - 0.1, 0], [0, Hh + 0.1, 0], color=DIM, stroke_width=2))
    k = dict(color=BLUE, width=4)
    if kind == "lin":
        g.add(smooth(lambda x: 0.5 * x, -1, 1, 10, **k))
    elif kind == "quad":
        g.add(smooth(lambda x: -0.45 + x * x, -1, 1, **k))
    elif kind == "poly":
        g.add(smooth(lambda x: ((2.1 * x) ** 3 - 6.3 * x) / 6, -1, 1, **k))
    elif kind == "rat":
        g.add(smooth(lambda x: 0.12 / x, 0.22, 1, **k), smooth(lambda x: 0.12 / x, -1, -0.22, **k))
    elif kind == "exp":
        g.add(smooth(lambda x: -0.45 + (np.exp(3 * (x + 1)) - 1) / (np.exp(6) - 1), -1, 1, **k))
    elif kind == "log":
        g.add(smooth(lambda x: 0.22 * np.log((x + 1.05) / 0.5), -1, 1, **k))
    else:
        g.add(smooth(lambda x: 0.42 * np.sin(2 * PI * x), -1, 1, 120, **k))
    return g


def portrait():
    """Seven frames in two rows (4 + 3); returns (frames, graphs, name labels)."""
    cs = [(-4.425, 0.95), (-1.475, 0.95), (1.475, 0.95), (4.425, 0.95), (-2.95, -1.65), (0, -1.65), (2.95, -1.65)]
    frames, graphs, names = VGroup(), VGroup(), VGroup()
    for (x, y), kind, nm in zip(cs, KINDS, NAMES):
        f = RoundedRectangle(width=2.6, height=1.6, corner_radius=0.15, stroke_color=CHALK, stroke_width=3).move_to([x, y, 0])
        frames.add(f)
        graphs.add(mini(kind).move_to([x, y, 0]))
        names.add(H(nm, 38, CHALK).next_to(f, DOWN, buff=0.12))
    return frames, graphs, names


def thrower():
    """Stick person with the throwing arm raised, feet at the origin."""
    w = 4
    return VGroup(Circle(radius=0.17, color=CHALK, stroke_width=w).move_to([0, 1.36, 0]),
                  Line([0, 1.19, 0], [0, 0.65, 0], color=CHALK, stroke_width=w),
                  Line([0, 0.65, 0], [-0.2, 0, 0], color=CHALK, stroke_width=w),
                  Line([0, 0.65, 0], [0.2, 0, 0], color=CHALK, stroke_width=w),
                  Line([0, 1.05, 0], [-0.28, 0.75, 0], color=CHALK, stroke_width=w),
                  Line([0, 1.05, 0], [0.3, 1.3, 0], color=CHALK, stroke_width=w))


# ================================================================ the family

class K03_Family(Shot):
    def body(self):
        self.title("Meet the Family", "7:29.36")
        frames, graphs, names = portrait()
        self.go("7:30.64", LaggedStart(*[Create(f) for f in frames], lag_ratio=0.12), run=1.1)
        self.go("7:32.32", LaggedStart(*[Create(g) for g in graphs], lag_ratio=0.12), run=1.2)
        qs = VGroup(*[H("?", 40, DIM).move_to(n) for n in names])
        self.go("7:34.90", LaggedStart(*[FadeIn(q, shift=UP * 0.1) for q in qs], lag_ratio=0.1), run=0.8)
        self.go("7:36.28", Circumscribe(frames[0], color=YEL, buff=0.08), run=0.9)


# ================================================================ 1. linear

class K03_Linear(Shot):
    def body(self):
        self.title("Linear Functions", "7:38.56")
        ax, labs = grid_axes((-4, 4), (-3, 4), 0.75, 0.75, (-3.0, -1.3), xnums=(-2, 2), ynums=(-2, 2))

        def lseg(m, b=1):
            lo, hi = -3.8, 3.8
            if m:
                x1, x2 = (-2.8 - b) / m, (3.8 - b) / m
                lo, hi = max(lo, min(x1, x2)), min(hi, max(x1, x2))
            return Line(ax.c2p(lo, m * lo + b), ax.c2p(hi, m * hi + b), color=BLUE, stroke_width=6)

        self.go("7:40.40", Create(ax), FadeIn(labs), run=0.6)
        line = lseg(0.4)
        self.go("7:40.96", Create(line), run=0.7)
        eq = M("y", "=", "m", "x", "+", "b", size=84).move_to([3.6, 1.5, 0])
        eq[2].set_color(PINK); eq[5].set_color(YEL)
        self.go("7:42.46", Write(eq), run=1.0)
        self.go("7:45.60", Circumscribe(eq[5], color=YEL, buff=0.1), run=0.6)
        dot = Dot(ax.c2p(0, 1), radius=0.11, color=YEL).set_z_index(2)
        blab = M("b", size=46, color=YEL).next_to(dot, UL, buff=0.08)
        self.go("7:46.74", FadeIn(dot, scale=1.6), FadeIn(blab), run=0.5)
        lb = VGroup(M("b", "=", size=56, color=YEL), H("y-intercept", 44, YEL)).arrange(RIGHT, buff=0.22)
        lm = VGroup(M("m", "=", size=56, color=PINK), H("slope", 44, PINK)).arrange(RIGHT, buff=0.22)
        lb.move_to([3.6, 0.15, 0]); lm.next_to(lb, DOWN, buff=0.45, aligned_edge=LEFT)
        self.go("7:49.28", Write(lb), run=0.6)
        self.go("7:51.10", Circumscribe(eq[2], color=PINK, buff=0.1), run=0.6)
        self.play(Write(lm), run_time=0.6)
        # steeper and steeper, turning about the intercept
        self.go("7:53.32", Transform(line, lseg(1.4)), run=0.7)
        self.go("7:55.32", Transform(line, lseg(3)), run=0.6)
        m3 = M("m", "=", "3", size=52, color=PINK).move_to([-1.0, 1.6, 0])
        self.play(FadeIn(m3), run_time=0.4)
        p0, p1, p2 = ax.c2p(0, 1), ax.c2p(1, 1), ax.c2p(1, 4)
        run_l = Line(p0, p1, color=PINK, stroke_width=5)
        run_t = M("1", size=44, color=PINK).next_to(run_l, DOWN, buff=0.12)
        rise_l = Line(p1, p2, color=PINK, stroke_width=5)
        rise_t = M("3", size=44, color=PINK).next_to(rise_l, RIGHT, buff=0.15)
        self.go("7:56.84", Create(run_l), FadeIn(run_t), run=0.5)
        self.go("7:58.96", Create(rise_l), FadeIn(rise_t), run=0.6)
        # negative slope: the line goes down as you move right
        neg = M("m", "<", "0", size=52, color=PINK).move_to(ax.c2p(2.4, 0.2))
        self.go("8:00.54", FadeOut(VGroup(run_l, run_t, rise_l, rise_t, m3, blab)), Transform(line, lseg(-1)), run=0.7)
        self.play(FadeIn(neg), run_time=0.4)
        xt = ValueTracker(-1.6)
        walker = always_redraw(lambda: Dot(ax.c2p(xt.get_value(), 1 - xt.get_value()), radius=0.11, color=ORG))
        self.go("8:02.04", FadeIn(walker), run=0.2)
        self.play(xt.animate.set_value(3.2), run_time=1.2, rate_func=linear)
        walker.clear_updaters()
        zero = M("m", "=", "0", size=52, color=PINK).move_to(ax.c2p(2.5, 1.75))
        self.go("8:04.72", FadeOut(walker), Transform(line, lseg(0)), ReplacementTransform(neg, zero), run=0.6)
        self.go("8:05.86", Circumscribe(line, color=YEL, buff=0.12), run=0.8)
        # slope will matter: the derivative is slope for curves
        self.wipe("8:07.28", run=0.4)
        self.title("Remember Slope")
        word = H("slope", 80, PINK).move_to([0, 0.9, 0])
        self.play(Write(word), run_time=0.6)
        der = VGroup(H("derivative", 72, PINK), M("=", size=72), H("slope", 72, PINK)).arrange(RIGHT, buff=0.35).move_to([0, 0.9, 0])
        soon = H("in a few episodes", 38, DIM).next_to(der, UP, buff=0.25)
        self.go("8:09.36", FadeIn(soon), run=0.4)
        self.go("8:10.44", ReplacementTransform(word, der[2]), FadeIn(der[0], shift=RIGHT * 0.2), FadeIn(der[1]), run=0.6)
        f = lambda x: -3.3 + 0.035 * (x + 4.5) ** 2
        curve = smooth(f, -4.2, 4.2)
        self.go("8:12.96", Create(curve), run=0.5)
        xc = ValueTracker(-2.6)
        tg = always_redraw(lambda: tangent_at(np.array([xc.get_value(), f(xc.get_value()), 0]), 0.07 * (xc.get_value() + 4.5)))
        self.play(FadeIn(tg), run_time=0.25)
        self.play(xc.animate.set_value(2.8), run_time=0.6)


# ================================================================ 2. quadratic

class K03_Quad(Shot):
    def body(self):
        self.title("Quadratic Functions", "8:15.26")
        ax, labs = grid_axes((-3, 3), (-4, 4), 0.68, 0.68, (-3.3, -0.82), xnums=(-2, 2), ynums=(-2, 2))
        self.go("8:16.64", Create(ax), FadeIn(labs), run=0.6)
        eq = M("y", "=", "x^2", size=84).move_to([3.5, 1.75, 0])
        self.go("8:18.32", Write(eq), run=0.8)
        curve = ax.plot(lambda x: x * x, x_range=[-1.97, 1.97], color=BLUE, stroke_width=6)
        self.go("8:20.44", Create(curve), run=1.0)
        par = H("parabola", 50, YEL).move_to([3.5, 0.65, 0])
        self.go("8:22.52", Write(par), run=0.6)
        # a thrown ball follows a parabola
        gy = -3.3
        ground = Line([0.6, gy, 0], [6.6, gy, 0], color=CHALK, stroke_width=4)
        man = thrower().shift([1.0, gy, 0])
        S, L, hh = np.array([1.38, -1.95, 0]), np.array([6.2, gy + 0.13, 0]), 2.235
        P = lambda t: S + t * (L - S) + np.array([0, 4 * hh * t * (1 - t), 0])
        self.go("8:23.82", Create(ground), FadeIn(man), run=0.5)
        tt = ValueTracker(0.01)
        ball = always_redraw(lambda: Circle(radius=0.13, stroke_color=CHALK, stroke_width=3, fill_color=ORG, fill_opacity=1).move_to(P(tt.get_value())))
        path = always_redraw(lambda: ParametricFunction(P, t_range=[0, tt.get_value()], stroke_color=DIM, stroke_width=3))
        self.add(path)
        self.go("8:24.32", FadeIn(ball), run=0.25)
        self.go("8:24.62", tt.animate.set_value(1), run=1.6, rate_func=linear)
        ball.clear_updaters(); path.clear_updaters()
        self.go("8:26.44", path.animate.set_stroke(BLUE, 5), run=0.5)
        # a minus sign flips it
        self.go("8:27.56", FadeOut(VGroup(ground, man, ball, path, par)), run=0.4)
        eq2 = M("y", "=", "-", "x^2", size=84).move_to(eq)
        eq2[2].set_color(YEL)
        self.go("8:28.28", TransformMatchingTex(eq, eq2), run=0.6)
        neg = ax.plot(lambda x: -x * x, x_range=[-1.97, 1.97], color=BLUE, stroke_width=6)
        self.go("8:31.56", Transform(curve, neg), run=1.0)
        frown = H("frown", 52, YEL).move_to([3.5, 0.65, 0])
        self.go("8:33.12", Write(frown), run=0.5)


# ================================================================ 3. polynomials

class K03_Poly(Shot):
    def body(self):
        self.title("Polynomials", "8:35.18")
        pw = M("x", r",\;", "x^2", r",\;", "x^3", r",\;\dots", size=64, color=YEL).move_to([0, 1.75, 0])
        self.go("8:37.80", Write(pw), run=0.7)
        eq = M("x^3", "-", "4x^2", "+", "5x", "-", "7", size=72).move_to([0, 1.75, 0])
        self.go("8:39.30", FadeOut(pw, shift=UP * 0.15), Write(eq[0]), run=0.5)
        self.go("8:40.14", Write(eq[1:3]), run=0.6)
        self.go("8:41.82", Write(eq[3:5]), run=0.5)
        self.go("8:42.96", Write(eq[5:]), run=0.4)
        # a polynomial graph: smooth, unbroken, hills and valleys
        ax, labs = grid_axes((-3, 3), (-3, 3), 0.72, 0.68, (-3.3, -1.45), xnums=(-1, 1), ynums=())
        self.go("8:44.54", Create(ax), FadeIn(labs), run=0.5)
        f = lambda x: x ** 3 - 3 * x
        curve = ax.plot(f, x_range=[-2.08, 2.08], color=BLUE, stroke_width=6)
        self.go("8:45.06", Create(curve), run=1.2)
        tag = M("y", "=", "x^3-3x", size=38, color=DIM).next_to(ax.c2p(2.08, f(2.08)), RIGHT, buff=0.2)
        self.play(FadeIn(tag), run_time=0.3)
        hd, vd = Dot(ax.c2p(-1, 2), radius=0.09, color=YEL), Dot(ax.c2p(1, -2), radius=0.09, color=YEL)
        hl = H("hill", 40, YEL).next_to(hd, UP, buff=0.15)
        vl = H("valley", 40, YEL).next_to(vd, DOWN, buff=0.12).shift(RIGHT * 0.3)
        self.go("8:47.16", FadeIn(hd, scale=1.6), FadeIn(hl), run=0.4)
        self.go("8:47.64", FadeIn(vd, scale=1.6), FadeIn(vl), run=0.4)
        # linear and quadratic live inside the polynomial family
        pl = pill("Linear", BLUE, 40).move_to([3.6, -1.35, 0])
        pq = pill("Quadratic", BLUE, 40).move_to([3.6, -2.45, 0])
        self.go("8:48.78", FadeIn(pl, shift=UP * 0.15), run=0.5)
        self.go("8:49.44", FadeIn(pq, shift=UP * 0.15), run=0.5)
        fam = RoundedRectangle(width=4.6, height=3.4, corner_radius=0.3, stroke_color=PURP, stroke_width=4).move_to([3.6, -1.55, 0])
        ft = H("Polynomials", 46, CHALK).move_to([3.6, -0.3, 0])
        self.go("8:52.16", Create(fam), Write(ft), run=0.8)


# ================================================================ 4. rational

class K03_Rational(Shot):
    def body(self):
        self.title("Rational Functions", "8:54.66")
        ax, labs = grid_axes((-4, 4), (-4, 4), 0.68, 0.68, (-3.2, -0.95))
        self.go("8:56.56", Create(ax), FadeIn(labs), run=0.6)
        eq = M("y", "=", r"\frac{1}{x}", size=90).move_to([3.4, 1.3, 0])
        self.go("8:58.58", Write(eq), run=0.8)
        tm = H("troublemaker #1", 44, RED).move_to([3.4, -0.25, 0])
        self.go("9:00.70", FadeIn(tm, shift=UP * 0.1), run=0.5)
        z = M(r"\frac{1}{0}", size=72).move_to([3.4, -1.45, 0])
        self.go("9:03.20", Write(z), run=0.5)
        cx = cross_mark(RED, 0.4).move_to(z)
        self.play(Create(cx), run_time=0.4)
        right = ax.plot(lambda x: 1 / x, x_range=[0.3, 3.9, 0.005], color=BLUE, stroke_width=6)
        left = ax.plot(lambda x: 1 / x, x_range=[-3.9, -0.3, 0.005], color=BLUE, stroke_width=6)
        self.go("9:04.72", Create(right), run=0.6)
        self.play(Create(left), run_time=0.6)
        # near the break the graph shoots up or down
        a = ValueTracker(2.0)
        d1 = always_redraw(lambda: Dot(ax.c2p(a.get_value(), 1 / a.get_value()), radius=0.11, color=ORG))
        self.go("9:07.74", FadeIn(d1), run=0.2)
        self.play(a.animate.set_value(0.27), run_time=0.7)
        b = ValueTracker(-2.0)
        d2 = always_redraw(lambda: Dot(ax.c2p(b.get_value(), 1 / b.get_value()), radius=0.11, color=ORG))
        self.go("9:08.60", FadeIn(d2), run=0.2)
        self.play(b.animate.set_value(-0.27), run_time=0.7)
        d1.clear_updaters(); d2.clear_updaters()
        va = DashedLine(ax.c2p(0, -4), ax.c2p(0, 4), color=YEL, stroke_width=4, dash_length=0.14)
        ha = DashedLine(ax.c2p(-4, 0), ax.c2p(4, 0), color=YEL, stroke_width=4, dash_length=0.14)
        self.go("9:09.66", Create(va), Create(ha), FadeOut(d1), FadeOut(d2), run=0.8)
        vt = H("asymptote", 38, YEL).rotate(PI / 2).next_to(ax.c2p(0, 2.5), LEFT, buff=0.18)
        ht = H("asymptote", 38, YEL).next_to(ax.c2p(2.6, 0), DOWN, buff=0.2)
        self.go("9:13.22", Write(vt), Write(ht), run=0.7)
        more = H("we'll study them with", 40, DIM).move_to([3.4, -0.55, 0])
        lim = pill("Limits", YEL, 44).next_to(more, DOWN, buff=0.35)
        self.go("9:14.82", FadeOut(VGroup(tm, z, cx)), run=0.3)
        self.play(FadeIn(more), run_time=0.4)
        self.go("9:16.10", FadeIn(lim, shift=UP * 0.15), run=0.5)


# ================================================================ 5. exponential

class K03_Exp(Shot):
    def body(self):
        self.title("Exponential Functions", "9:18.26")
        eq = M("y", "=", "2", "^{x}", size=80).move_to([-4.6, 1.75, 0])
        self.go("9:20.60", Write(eq), run=0.8)
        self.go("9:21.40", Circumscribe(eq[3], color=YEL, buff=0.08), run=0.6)
        ax, labs = grid_axes((0, 6.5), (0, 70), 0.85, 0.068, (0.2, -3.15), xnums=range(1, 7), ynums=(20, 40, 60), ystep=10)
        self.go("9:24.98", Create(ax), FadeIn(labs), run=0.7)
        rows, dots = [], []
        for k in range(7):
            r = M("2", "^{%d}" % k, "=", str(2 ** k), size=48)
            r[3].set_color(ORG)
            r.shift(np.array([-4.6, 0.85 - 0.62 * k, 0]) - r[2].get_center())
            rows.append(r)
            dots.append(Dot(ax.c2p(k, 2 ** k), radius=0.08, color=ORG))
        self.go("9:26.70", Write(rows[0][:3]), run=0.6)
        self.go("9:27.66", Write(rows[0][3]), FadeIn(dots[0], scale=1.6), run=0.4)
        self.go("9:28.48", Write(rows[1][:3]), run=0.5)
        self.go("9:29.30", Write(rows[1][3]), FadeIn(dots[1], scale=1.6), run=0.4)
        for k, t in zip(range(2, 7), ("9:30.28", "9:31.36", "9:32.34", "9:33.36", "9:34.38")):
            self.go(t, Write(rows[k]), FadeIn(dots[k], scale=1.6), run=0.45)
        curve = ax.plot(lambda x: 2 ** x, x_range=[0, 6.1], color=BLUE, stroke_width=6)
        self.go("9:35.54", Create(curve), run=1.0)
        x2 = VGroup(M(r"\times 2", size=56, color=ORG), H("every step", 42, ORG)).arrange(RIGHT, buff=0.25).move_to([2.7, 1.0, 0])
        self.play(FadeIn(x2, shift=UP * 0.1), run_time=0.4)
        fast = H("faster and faster", 46, YEL).move_to([2.7, 1.0, 0])
        self.go("9:38.92", ReplacementTransform(x2, fast), run=0.6)
        # things that grow like this
        self.wipe("9:40.40", run=0.4, keep=[ax, labs, curve, *dots])
        coins = VGroup()
        for i in range(3):
            coins.add(Ellipse(width=1.0, height=0.32, color=ORG, stroke_width=4).move_to([0, -0.3 + 0.2 * i, 0]))
        coins.add(H("$", 30, ORG).move_to([0, 0.1, 0]))
        coins.move_to([-5.4, 0.9, 0])
        play = VGroup(RoundedRectangle(width=1.1, height=0.75, corner_radius=0.15, color=RED, stroke_width=4),
                      Triangle(color=RED, stroke_width=4, fill_color=RED, fill_opacity=1).scale(0.17).rotate(-PI / 2)).move_to([-5.4, -0.6, 0])
        bac = VGroup()
        for c, ang in (((-0.25, 0.05), 0.3), ((0.25, -0.05), 0.3)):
            cap = RoundedRectangle(width=0.55, height=0.28, corner_radius=0.14, color=GRN, stroke_width=4).rotate(ang).move_to([c[0], c[1], 0])
            bac.add(cap, Dot([c[0] - 0.08, c[1], 0], radius=0.03, color=GRN), Dot([c[0] + 0.08, c[1] + 0.03, 0], radius=0.03, color=GRN))
        bac.move_to([-5.4, -2.1, 0])
        items = [(coins, "money", "9:40.94"), (play, "viral video", "9:42.52"), (bac, "bacteria", "9:43.98")]
        for icon, word, t in items:
            lab = H(word, 42, CHALK).next_to(icon, RIGHT, buff=0.4)
            lab.align_to([-4.6, 0, 0], LEFT)
            self.go(t, Create(icon), FadeIn(lab, shift=RIGHT * 0.1), run=0.6)


# ================================================================ the number e

class K03_E(Shot):
    def body(self):
        self.title("The Number e", "9:47.24")
        eq = M("y", "=", "e", "^{x}", size=96).move_to([0, 1.2, 0])
        eq[2].set_color(YEL)
        self.go("9:49.38", Write(eq), run=0.7)
        en = M("e", r"\approx", "2.718", size=80).move_to([-3.4, -0.3, 0])
        en[0].set_color(YEL); en[2].set_color(ORG)
        self.go("9:50.68", Write(en[0]), run=0.4)
        self.go("9:52.36", Write(en[1:]), run=0.8)
        pn = M(r"\pi", r"\approx", "3.14", size=80).move_to([3.4, -0.3, 0])
        pn[2].set_color(ORG)
        self.go("9:55.02", Write(pn), run=0.7)
        circ = VGroup(Circle(radius=0.7, color=CHALK, stroke_width=4), Dot(radius=0.05, color=CHALK)).move_to([3.4, -1.95, 0])
        ct = H("circles", 40, DIM).next_to(circ, DOWN, buff=0.15)
        self.go("9:56.02", Create(circ), FadeIn(ct), run=0.6)
        o = np.array([-4.15, -2.65, 0])
        grow = VGroup(Line(o, o + [1.5, 0, 0], color=DIM, stroke_width=3), Line(o, o + [0, 1.4, 0], color=DIM, stroke_width=3),
                      smooth(lambda x: o[1] + 0.03 + 1.3 * (np.exp(3 * (x - o[0])) - 1) / (np.exp(4.2) - 1), o[0], o[0] + 1.4, color=BLUE, width=5))
        gt = H("growth", 40, DIM).next_to(grow, DOWN, buff=0.15).set_x(-3.4)
        grow.set_x(-3.4)
        self.go("9:57.66", Create(grow), FadeIn(gt), run=0.6)
        der = pill("Derivatives", PINK, 40).move_to([0, -1.95, 0])
        self.go("9:59.66", FadeIn(der, shift=UP * 0.15), run=0.5)
        # a magical property: hinted, not told
        self.go("10:01.28", FadeOut(VGroup(en, pn, circ, ct, grow, gt, der)), run=0.4)
        ax, labs = grid_axes((-3, 2), (0, 7), 1.0, 0.55, (0.6, -3.5), xnums=(-2, -1, 1), ynums=())
        curve = ax.plot(np.exp, x_range=[-3, 1.93], color=BLUE, stroke_width=6)
        self.play(Create(ax), FadeIn(labs), Create(curve), run_time=0.8)
        magic = H("a magical property", 44, YEL).move_to([-4.3, -1.2, 0])
        q = H("?", 60, YEL).next_to(magic, DOWN, buff=0.2)
        self.go("10:02.56", Write(magic), run=0.6)
        xt = ValueTracker(-1.6)
        tg = always_redraw(lambda: tangent_at(ax.c2p(xt.get_value(), np.exp(xt.get_value())), np.exp(xt.get_value()) * 0.55, L=1.6))
        self.go("10:03.40", FadeIn(tg), run=0.3)
        self.play(xt.animate.set_value(1.3), run_time=2.6)
        self.go("10:06.60", FadeIn(q, shift=UP * 0.1), xt.animate.set_value(0.3), run=1.2)


# ================================================================ 6. logarithm

class K03_Log(Shot):
    def body(self):
        self.title("Logarithms", "10:08.70")
        ex = M("2^{x}", size=96, color=BLUE).move_to([-3.3, 0.5, 0])
        lg = M(r"\log_2 x", size=96, color=GRN).move_to([3.3, 0.5, 0])
        top = CurvedArrow([-1.9, 1.05, 0], [1.9, 1.05, 0], angle=-PI / 3, color=DIM, stroke_width=4, tip_length=0.2)
        bot = CurvedArrow([1.9, -0.05, 0], [-1.9, -0.05, 0], angle=-PI / 3, color=DIM, stroke_width=4, tip_length=0.2)
        opp = H("opposites", 40, DIM).move_to([0, 0.5, 0])
        self.go("10:09.58", Write(ex), Write(lg), run=0.8)
        self.play(Create(top), Create(bot), FadeIn(opp), run_time=0.6)
        ask = H("What power do I need?", 56, YEL).move_to([0, -2.1, 0])
        self.go("10:12.84", Write(ask), run=0.8)
        # log base 2 of 8
        self.wipe("10:14.64", run=0.4)
        r1 = M(r"\log_2 8", "=", r"\text{?}", size=96)
        r2 = M("2", r"^{\text{?}}", "=", "8", size=96)
        r3 = M("2", r"\times", "2", r"\times", "2", "=", "8", size=80)
        for r, y, eqi in ((r1, 1.0, 1), (r2, -0.45, 2), (r3, -1.75, 5)):
            r.shift(np.array([0.3, y, 0]) - r[eqi].get_center())
        r1[2].set_color(YEL); r2[1].set_color(YEL)
        for i in (0, 2, 4):
            r3[i].set_color(ORG)
        self.go("10:15.76", Write(r1[0]), run=0.6)
        self.go("10:16.88", FadeIn(r1[1:]), run=0.4)
        asks = H("asks", 40, DIM).next_to(r2, LEFT, buff=0.6)
        self.go("10:17.90", Write(r2), FadeIn(asks), run=0.7)
        self.go("10:19.86", Write(r3[0]), run=0.3)
        self.go("10:20.20", Write(r3[1:3]), run=0.35)
        self.go("10:20.72", Write(r3[3:5]), run=0.35)
        self.go("10:21.32", Write(r3[5:]), run=0.35)
        br = Brace(r3[0:5], DOWN, color=DIM, buff=0.12)
        n3 = M("3", size=56, color=ORG).next_to(br, DOWN, buff=0.1)
        self.go("10:22.16", GrowFromCenter(br), FadeIn(n3), run=0.5)
        a1 = M("3", size=96, color=YEL).move_to(r1[2])
        a2 = M("2", "^{3}", "=", "8", size=96)
        a2.shift(r2[0].get_center() - a2[0].get_center())
        a2[1].set_color(YEL)
        self.go("10:22.80", Transform(r1[2], a1), Transform(r2[1], a2[1]), run=0.6)
        # natural log
        self.wipe("10:23.78", run=0.35)
        ln = M(r"\log_e x", "=", r"\ln x", size=100).move_to([0, 0.6, 0])
        ln[2].set_color(YEL)
        self.go("10:24.28", Write(ln[0]), run=0.7)
        nat = H("natural log", 58, YEL).move_to([0, -1.2, 0])
        self.go("10:27.14", Write(nat), run=0.6)
        self.go("10:29.08", Write(ln[1:]), run=0.6)
        self.play(Create(box(ln[2], YEL, buff=0.18)), run_time=0.5)


# ================================================================ 7. trig

class K03_Trig(Shot):
    def body(self):
        self.title("Trig Functions", "10:31.10")
        ax = trig_axes(x_max=4 * PI + 1.0, y=1.5, width=12.4, height=3.4, center=(0.1, -0.75, 0), pi_step=PI)
        self.go("10:31.66", Create(ax), FadeIn(ax.labels), run=0.6)
        sl = M(r"\sin x", size=56, color=BLUE).move_to([-3.2, 1.65, 0])
        cl = M(r"\cos x", size=56, color=ORG).move_to([0, 1.65, 0])
        tl = M(r"\tan x", size=56, color=DIM).move_to([3.2, 1.65, 0])
        s1 = ax.plot(np.sin, x_range=[0, 2 * PI], color=BLUE, stroke_width=6)
        c1 = ax.plot(np.cos, x_range=[0, 2 * PI], color=ORG, stroke_width=6)
        self.go("10:33.42", Write(sl), Create(s1), run=0.9)
        self.go("10:34.36", Write(cl), Create(c1), run=0.8)
        self.go("10:35.12", Write(tl), run=0.5)
        s2 = ax.plot(np.sin, x_range=[2 * PI, 4 * PI], color=BLUE, stroke_width=6)
        c2 = ax.plot(np.cos, x_range=[2 * PI, 4 * PI], color=ORG, stroke_width=6)
        self.go("10:36.86", Create(s2), Create(c2), run=1.1, rate_func=linear)
        # refresher course
        self.wipe("10:38.34", run=0.4)
        self.title("Need a Refresher?")
        course = pill("Full Trigonometry Course", YEL, 54).move_to([0, 0.6, 0])
        self.go("10:40.94", FadeIn(course, shift=UP * 0.15), run=0.6)
        ch = H("on this channel", 44, DIM).next_to(course, DOWN, buff=0.35)
        self.go("10:42.18", FadeIn(ch), run=0.4)
        link = H("link in the description", 46, CHALK).move_to([0, -1.85, 0])
        arr = Arrow([0, -2.3, 0], [0, -3.5, 0], buff=0, color=DIM, stroke_width=5, tip_length=0.22)
        self.go("10:43.44", Write(link), GrowArrow(arr), run=0.6)
        # what to remember for Calculus 1
        self.wipe("10:45.10", run=0.35)
        self.title("For Calculus 1")
        c = np.array([-3.6, -0.9, 0])
        uc = unit_circle(r=1.55, center=c, axis_len=2.1)
        self.go("10:47.00", Create(uc[0]), Create(uc[1]), FadeIn(uc[2:]), run=0.7)
        P = on_circle(PI / 6, 1.55, c)
        foot = np.array([P[0], c[1], 0])
        rad = Line(c, P, color=CHALK, stroke_width=4)
        cs = Line(c, foot, color=ORG, stroke_width=6)
        sn = Line(foot, P, color=BLUE, stroke_width=6)
        cst = M(r"\cos", size=36, color=ORG).next_to(cs, DOWN, buff=0.12)
        snt = M(r"\sin", size=36, color=BLUE).next_to(sn, RIGHT, buff=0.12)
        self.play(Create(rad), Create(cs), Create(sn), FadeIn(Dot(P, radius=0.07, color=YEL)), FadeIn(cst), FadeIn(snt), run_time=0.6)
        v1 = M(r"\sin\frac{\pi}{6}", "=", r"\frac{1}{2}", size=56).move_to([2.8, 0.95, 0])
        v2 = M(r"\cos 0", "=", "1", size=56)
        v2.shift(v1[1].get_center() + DOWN * 1.15 - v2[1].get_center())
        self.go("10:48.22", Write(v1), run=0.6)
        self.play(Write(v2), run_time=0.5)
        idn = M(r"\sin^2 x", "+", r"\cos^2 x", "=", "1", size=62).move_to([2.8, -2.1, 0])
        idn[0].set_color(BLUE); idn[2].set_color(ORG)
        self.go("10:49.76", Write(idn), run=1.2)
        self.go("10:51.92", Create(box(idn, YEL, buff=0.2)), run=0.5)


# ================================================================ quick check

class K03_Answers(Shot):
    def body(self):
        self.title("Quick Check", "10:55.40")
        ys = [1.35, 0.2, -0.95, -2.1]
        qs = [VGroup(H("slope of", 46), M("y=3x-2", size=60)).arrange(RIGHT, buff=0.3),
              H("crosses the y-axis at", 46),
              VGroup(M("2^5", size=64), M("=", size=60), H("?", 56, DIM)).arrange(RIGHT, buff=0.25),
              VGroup(M(r"\log_2 16", size=60), M("=", size=60), H("?", 56, DIM)).arrange(RIGHT, buff=0.25)]
        nums = VGroup()
        for i, (q, y) in enumerate(zip(qs, ys)):
            q.move_to([0, y, 0]).align_to([-5.3, 0, 0], LEFT)
            nums.add(H(str(i + 1), 44, DIM).move_to([-6.0, y, 0]))
        ans = [M(s, size=68, color=GRN).move_to([3.4, y, 0]) for s, y in zip(("3", "-2", "32", "4"), ys)]
        why = M("2^4=16", size=46, color=DIM).next_to(ans[3], RIGHT, buff=0.6)
        for i, (tq, ta) in enumerate((("10:56.00", "10:59.80"), ("11:00.66", "11:02.96"), ("11:04.34", "11:06.18"), ("11:07.10", "11:09.02"))):
            self.go(tq, FadeIn(nums[i]), Write(qs[i]), run=0.8)
            self.go(ta, FadeIn(ans[i], scale=1.3), run=0.4)
        self.go("11:10.16", Write(why), run=0.6)
        # the whole family
        self.wipe("11:12.06", run=0.3)
        self.title("The Whole Family")
        frames, graphs, names = portrait()
        self.go("11:12.96", FadeIn(frames), FadeIn(graphs), LaggedStart(*[FadeIn(n, shift=UP * 0.1) for n in names], lag_ratio=0.1), run=0.9)
