"""Builder 12: end of Chapter 4. The tangent-line practice answer, derivative notation (f', y', dy/dx, d/dx),
derivatives as rates with units (water tank, car, cost), sketching f' from f with a live tangent tracing the
lower graph, and differentiability: corner, cusp, vertical tangent, breaks, smooth vs corner under a zoom."""
from common import *


# ---------------------------------------------------------------- local helpers

def fr(top, bot, size=64, tc=CHALK, bc=CHALK):
    """Hand-built fraction so numerator and denominator can be coloured separately: .n .bar .d"""
    n, d = M(top, size=size, color=tc), M(bot, size=size, color=bc)
    w = max(n.width, d.width) + 0.2
    bar = Line([-w / 2, 0, 0], [w / 2, 0, 0], color=CHALK, stroke_width=4)
    n.next_to(bar, UP, buff=0.13)
    d.next_to(bar, DOWN, buff=0.13)
    g = VGroup(n, bar, d)
    g.n, g.bar, g.d = n, bar, d
    return g


def at_eq(m, x, y, idx=1):
    """Place MathTex m so its part idx (the '=') sits at (x, y)."""
    return m.shift([x - m[idx].get_x(), y - m[idx].get_y(), 0])


_DG = {}


def glyphs(s, size=44, color=PINK):
    """A number built from cached glyphs: cheap to redraw every frame (no new LaTeX per value)."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(r"\text{huge}" if ch == "H" else ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.04, aligned_edge=DOWN)
    ref = next((x for x, ch in zip(g, s) if ch.isdigit()), None)
    for x, ch in zip(g, s):
        if ch == "-" and ref is not None:
            x.set_y(ref.get_y())
    return g


def readout(fn, pos, size=44, color=PINK, big=None):
    """'slope = -1.0' that follows fn(); rounds before formatting so a flat spot reads 0.0, never -0.0."""
    lab = M(r"\text{slope} =", size=size, color=color).move_to(pos)

    def num():
        v = fn()
        s = "H" if big is not None and abs(v) >= big else f"{round(v, 1) + 0:.1f}"
        return glyphs(s, size, color).next_to(lab, RIGHT, buff=0.15)
    return VGroup(lab, always_redraw(num))


def poly(ax, f, xs, color=BLUE, width=5):
    """A curve through exact sample points (no smoothing): keeps corners, cusps and vertical tangents sharp."""
    return VMobject(stroke_color=color, stroke_width=width).set_points_as_corners([ax.c2p(x, f(x)) for x in xs])


def tip_xs(a, b, n=160):
    """Samples on [a, b] crowded near 0 (0 included exactly) for sharp tips."""
    left = -np.geomspace(-a, 1e-7, n) if a < 0 else np.array([])
    right = np.geomspace(1e-7, b, n) if b > 0 else np.array([])
    return np.concatenate([left, [0.0], right])


def slope_sign(ax, f, x, word, color=YEL, off=0.42, arrow=True):
    """A small chalk arrow along the curve's direction (or a flat dash) a little above it, with a word."""
    p = np.array(ax.c2p(x, f(x)))
    q = np.array(ax.c2p(x + 0.01, f(x + 0.01)))
    d = (q - p) / np.linalg.norm(q - p)
    n = np.array([-d[1], d[0], 0])
    a, b = p + n * off - d * 0.42, p + n * off + d * 0.42
    m = Arrow(a, b, buff=0, color=color, stroke_width=4, tip_length=0.16) if arrow else Line(a, b, color=color, stroke_width=5)
    lab = H(word, 34, color).next_to(m, n, buff=0.08)
    return VGroup(m, lab)


def ring(mob_or_pt, color=YEL, r=0.22):
    c = mob_or_pt.get_center() if isinstance(mob_or_pt, Mobject) else np.array(mob_or_pt, float)
    return Circle(radius=r, color=color, stroke_width=4).move_to(c)


def line_through(ax, x0, y0, m, length=2.6, color=PINK, width=5):
    """Segment of slope m (graph units) through (x0, y0), `length` long on screen."""
    p = np.array(ax.c2p(x0, y0))
    d = np.array(ax.c2p(x0 + 1, y0 + m)) - p
    d /= np.linalg.norm(d)
    return Line(p - d * length / 2, p + d * length / 2, color=color, stroke_width=width).set_z_index(4)


def lower_trace(scene, ax, ax2, f, fp, x0, xt, xm):
    """The f' graph drawn as the tangent moves: the slope readout becomes the height of the lower graph.
    Returns (trace, bar, dot, guide); xm remembers the furthest x reached."""
    xm.add_updater(lambda m: m.set_value(max(m.get_value(), xt.get_value())))
    scene.add(xm)
    tr = always_redraw(lambda: ax2.plot(fp, x_range=[x0, max(x0 + 0.01, xm.get_value()), 0.02], color=PINK, stroke_width=5))
    bar = always_redraw(lambda: Line(ax2.c2p(xt.get_value(), 0), ax2.c2p(xt.get_value(), fp(xt.get_value()) + 1e-4),
                                     color=PINK, stroke_width=7, stroke_opacity=0.5))
    dot = always_redraw(lambda: pt(ax2, xt.get_value(), fp(xt.get_value()), PINK))
    guide = always_redraw(lambda: DashedLine(ax.c2p(xt.get_value(), f(xt.get_value())), ax2.c2p(xt.get_value(), fp(xt.get_value())),
                                             color=FAINT, stroke_width=2, dash_length=0.08))
    return tr, bar, dot, guide


# ================================================================ 1. the practice answer

def fq(x):
    return x * x - 4 * x


XE = 1.7   # x of the '=' column


class K12_TryIt(Shot):
    def body(self):
        self.title("Your Turn: The Answer", animate=False)
        ax = axes((-1, 5, 1), (-5, 4, 1), x_length=5.4, y_length=4.6, center=(-3.7, -0.85, 0))
        c = curve(ax, fq, (-0.7, 4.7, 0.02))
        hd = VGroup(M("f(x)", "=", "x^2-4x", size=52, color=BLUE), M("x", "=", "1", size=52, color=ORG)).arrange(RIGHT, buff=0.8)
        hd.move_to([2.9, 1.75, 0])
        self.go("1:11:37.95", FadeIn(ax), FadeIn(ax.labels), FadeIn(hd, shift=DOWN * 0.1), run=0.4)
        # the point
        R1 = at_eq(M("f(1)", "=", "1-4", "=", "-3", size=54), XE, 0.6)
        R1[4].set_color(ORG)
        self.go("1:11:38.62", Write(R1[0:2]), run=0.5)
        self.play(draw(c, run=0.8), run_time=0.8)
        self.go("1:11:40.08", Write(R1[2]), run=0.5)
        self.go("1:11:41.02", Write(R1[3:]), run=0.5)
        P = pt(ax, 1, -3)
        pl = M("(1,-3)", size=40, color=ORG).next_to(P, UR, buff=0.12)
        self.go("1:11:42.60", FadeIn(P, scale=0.5), run=0.4)
        self.go("1:11:43.42", Write(pl), run=0.6)
        # the slope
        R2 = at_eq(M("f'(x)", "=", "2x-4", size=54), XE, -0.6)
        R2[0].set_color(PINK)
        self.go("1:11:46.60", Write(R2), run=0.8)
        R2b = at_eq(M("f'(1)", "=", "2-4", "=", "-2", size=54), XE, -0.6)
        R2b[0].set_color(PINK); R2b[4].set_color(PINK)
        self.go("1:11:49.40", TransformMatchingTex(R2, R2b), run=0.8)
        tg = tangent(ax, fq, 1, length=3.4)
        self.go("1:11:50.50", Create(tg), run=0.6)
        # point-slope form, then tidy it up
        L1 = at_eq(M("y-(-3)", "=", "-2(x-1)", size=54), XE, -1.8)
        self.go("1:11:51.48", Write(L1[0]), run=0.7)
        self.go("1:11:53.04", Write(L1[1:]), run=1.0)
        L2 = at_eq(M("y+3", "=", "-2x+2", size=54), XE, -1.8)
        self.go("1:11:56.30", TransformMatchingTex(L1, L2), run=0.8)
        L3 = at_eq(M("y", "=", "-2x-1", size=54), XE, -1.8)
        self.go("1:12:00.10", Circumscribe(L2[0], color=ORG, buff=0.08), run=0.6)
        self.go("1:12:01.00", TransformMatchingTex(L2, L3), run=0.8)
        self.go("1:12:03.10", Create(answer_box(L3)), L3[2].animate.set_color(GRN), run=0.6)


# ================================================================ 2. notation

class K12_Notation(Shot):
    def body(self):
        self.title("Notation", "1:12:04.50")
        a = M("f'(x)", size=84, color=PINK).move_to([-4.2, 0.6, 0])
        b = M("y'", size=84, color=PINK).move_to([0, 0.6, 0])
        c = fr("dy", "dx", size=72, tc=PINK, bc=PINK).move_to([4.2, 0.6, 0])
        self.go("1:12:10.78", Write(a), run=0.8)
        la = H("Lagrange", 38, DIM).next_to(a, DOWN, buff=0.5)
        self.go("1:12:14.40", FadeIn(la, shift=UP * 0.1), run=0.5)
        lb = M(r"\text{if } y = \ldots", size=40, color=DIM).next_to(b, DOWN, buff=0.5)
        self.go("1:12:17.30", FadeIn(lb, shift=UP * 0.1), run=0.5)
        self.go("1:12:19.50", Write(b), run=0.6)
        self.go("1:12:21.80", Write(c), run=0.8)
        lc = H("Leibniz", 38, DIM).next_to(c, DOWN, buff=0.4)
        self.go("1:12:24.40", FadeIn(lc, shift=UP * 0.1), run=0.5)
        self.go("1:12:26.00", Circumscribe(c, color=YEL, buff=0.15), run=0.8)
        # d = a tiny change in
        self.go("1:12:26.82", FadeOut(VGroup(a, b, la, lb, lc)), c.animate.scale(1.2).move_to([-4.6, -0.3, 0]), run=0.55)
        dn = H("d = a tiny change in", 40, YEL).move_to([-3.7, 1.6, 0])
        self.go("1:12:27.40", FadeIn(dn, shift=DOWN * 0.1), run=0.6)
        ny = H("tiny change in y", 36, PINK).next_to(c.n, RIGHT, buff=0.5)
        nx = H("tiny change in x", 36, BLUE).next_to(c.d, RIGHT, buff=0.5)
        self.go("1:12:32.10", c.d.animate.set_color(BLUE), FadeIn(ny, shift=LEFT * 0.1), run=0.6)
        self.go("1:12:34.00", FadeIn(nx, shift=LEFT * 0.1), run=0.6)
        # rise over run, shrunk down to nothing
        ax = axes((0, 4, 1), (0, 4, 1), x_length=4.6, y_length=3.6, center=(4.2, -0.9, 0), nums=False)
        g = lambda x: 0.22 * x * x + 0.4
        cv = curve(ax, g, (0, 3.9, 0.02))
        self.go("1:12:35.70", FadeIn(ax), FadeIn(ax.labels), draw(cv, run=0.8), run=0.8)
        x0, hv = 1.3, ValueTracker(1.9)

        def tri():
            h = hv.get_value()
            P, Q, K = ax.c2p(x0, g(x0)), ax.c2p(x0 + h, g(x0 + h)), ax.c2p(x0 + h, g(x0))
            op = min(1, max(0, (h - 0.5) / 0.5))
            return VGroup(DashedLine(P, K, color=BLUE, stroke_width=3, dash_length=0.08),
                          DashedLine(K, Q, color=PINK, stroke_width=3, dash_length=0.08),
                          H("run", 32, BLUE).next_to(Line(P, K), DOWN, buff=0.08).set_opacity(op),
                          H("rise", 32, PINK).next_to(Line(K, Q), RIGHT, buff=0.08).set_opacity(op),
                          pt(ax, x0 + h, g(x0 + h)))
        T_ = always_redraw(tri)
        P0 = pt(ax, x0, g(x0), YEL)
        self.go("1:12:37.40", FadeIn(P0, scale=0.5), FadeIn(T_), run=0.6)
        self.go("1:12:39.70", hv.animate.set_value(0.04), run=1.8)


# ================================================================ 3. d/dx

class K12_DDx(Shot):
    def body(self):
        self.title("d/dx: an Instruction", "1:12:41.90")
        E = M(r"\frac{d}{dx}", r"\left(x^2\right)", "=", "2x", size=80).move_to([0, 0.7, 0])
        E[0].set_color(PINK); E[1].set_color(BLUE); E[3].set_color(PINK)
        slot = DashedVMobject(RoundedRectangle(width=1.6, height=1.1, corner_radius=0.12, color=DIM, stroke_width=3), num_dashes=22)
        slot.move_to(E[1])
        self.go("1:12:42.86", Write(E[0]), run=0.6)
        self.go("1:12:44.60", Create(slot), run=0.5)
        self.go("1:12:47.50", ReplacementTransform(slot, E[1]), run=0.6)
        self.go("1:12:48.18", Write(E[2:]), run=0.6)
        br = Brace(E[0], DOWN, buff=0.15, color=DIM)
        bl = VGroup(H("derivative", 38, PINK), H("with respect to x", 34, DIM)).arrange(DOWN, buff=0.08).next_to(br, DOWN, buff=0.12)
        self.go("1:12:50.90", GrowFromCenter(br), FadeIn(bl[0], shift=UP * 0.1), run=0.5)
        self.go("1:12:51.70", FadeIn(bl[1], shift=UP * 0.1), run=0.5)
        # the instruction as a machine: x^2 goes in, 2x comes out
        mac = RoundedRectangle(width=2.8, height=1.9, corner_radius=0.2, color=PINK, stroke_width=5).move_to([0, -0.4, 0])
        ml = M(r"\frac{d}{dx}", size=72, color=PINK).move_to(mac)
        inp = M("x^2", size=72, color=BLUE).move_to([-4.6, -0.4, 0])
        out = M("2x", size=72, color=PINK).move_to([2.2, -0.4, 0]).set_opacity(0)
        ain = Arrow([-3.6, -0.4, 0], mac.get_left(), buff=0.1, color=DIM, stroke_width=4, tip_length=0.2)
        aout = Arrow(mac.get_right(), [3.6, -0.4, 0], buff=0.1, color=DIM, stroke_width=4, tip_length=0.2)
        self.go("1:12:54.70", FadeOut(VGroup(E, br, bl)), run=0.4)
        self.play(Create(mac), FadeIn(ml), run_time=0.6)
        self.go("1:12:56.40", Create(ain), Create(aout), FadeIn(inp, shift=RIGHT * 0.2), run=0.6)
        self.go("1:12:57.80", inp.animate.move_to(mac).set_opacity(0), run=0.9)
        self.go("1:12:58.72", out.animate.move_to([4.6, -0.4, 0]).set_opacity(1), run=0.9)
        tk = H("take the derivative", 40, YEL).next_to(mac, DOWN, buff=0.45)
        self.go("1:12:59.70", FadeIn(tk, shift=UP * 0.1), run=0.5)
        # not really a fraction (but it acts like one)
        D = fr("dy", "dx", size=96, tc=PINK, bc=PINK).move_to([-2.6, -0.3, 0])
        self.go("1:13:01.30", FadeOut(VGroup(mac, ml, ain, aout, out, tk)), run=0.4)
        self.play(Write(D), run_time=0.8)
        n1 = H("not really a fraction", 40, YEL).move_to([2.6, 0.5, 0])
        n2 = H("but it acts like one", 40, GRN).move_to([2.6, -0.9, 0])
        self.go("1:13:03.50", FadeIn(n1, shift=LEFT * 0.1), run=0.5)
        self.go("1:13:06.50", FadeIn(n2, shift=LEFT * 0.1), run=0.5)
        self.go("1:13:08.40", Circumscribe(D.bar, color=GRN, buff=0.15), run=0.8)


# ================================================================ 4. units: the water tank

TK_L, TK_R, TK_B, TK_T = -5.0, -2.4, -3.2, 0.6


class K12_Units(Shot):
    def body(self):
        self.title("What It Means", "1:13:11.45")
        rt = pill("always a rate", YEL, 44).move_to([0, 1.5, 0])
        self.go("1:13:15.20", FadeIn(rt, shift=DOWN * 0.1), run=0.5)
        F = VGroup(M("f'", size=72, color=PINK), M("=", size=72),
                   fr(r"\text{output units}", r"\text{input units}", size=60)).arrange(RIGHT, buff=0.3).move_to([0, -0.4, 0])
        self.go("1:13:16.72", Write(F[0:2]), Write(F[2].n), run=0.8)
        self.go("1:13:18.40", Create(F[2].bar), Write(F[2].d), run=0.6)
        # the tank
        tank = VMobject(stroke_color=CHALK, stroke_width=5).set_points_as_corners(
            [[TK_L, TK_T, 0], [TK_L, TK_B, 0], [TK_R, TK_B, 0], [TK_R, TK_T, 0]])
        lv = ValueTracker(-1.5)
        water = always_redraw(lambda: VGroup(
            Rectangle(width=TK_R - TK_L - 0.1, height=lv.get_value() - TK_B - 0.05, stroke_width=0, fill_color=BLUE,
                      fill_opacity=0.3).move_to([(TK_L + TK_R) / 2, (lv.get_value() + TK_B) / 2 + 0.025, 0]),
            Line([TK_L + 0.05, lv.get_value(), 0], [TK_R - 0.05, lv.get_value(), 0], color=BLUE, stroke_width=4)))
        self.go("1:13:19.80", FadeOut(rt), F.animate.scale(0.8).move_to([3.6, 1.6, 0]), run=0.6)
        self.go("1:13:21.40", draw(tank, run=0.7), run=0.7)
        self.go("1:13:22.12", FadeIn(water), run=0.4)
        ra = TX(r"$f(t)$: liters", size=46).move_to([2.9, 0.1, 0], aligned_edge=LEFT).shift(LEFT * 1.6)
        ra[0][0:4].set_color(BLUE)
        rb = TX(r"$t$: minutes", size=46).next_to(ra, DOWN, buff=0.45, aligned_edge=LEFT)
        rb[0][0].set_color(ORG)
        self.go("1:13:22.90", FadeIn(ra, shift=LEFT * 0.1), run=0.5)
        self.go("1:13:24.70", FadeIn(rb, shift=LEFT * 0.1), run=0.5)
        F2 = VGroup(M("f'(t)", size=72, color=PINK), M("=", size=72),
                    fr(r"\text{liters}", r"\text{minute}", size=60)).arrange(RIGHT, buff=0.3).scale(0.8).move_to(F)
        self.go("1:13:26.00", ReplacementTransform(F, F2), run=0.8)
        self.go("1:13:27.40", Circumscribe(F2[2], color=YEL, buff=0.1), run=0.6)
        # f'(5) = 3: rising at 3 L/min
        R = at_eq(M("f'(5)", "=", "3", size=64), 2.6, 0.0)
        R[0].set_color(PINK); R[2].set_color(ORG)
        self.go("1:13:28.80", FadeOut(VGroup(ra, rb)), run=0.4)
        self.go("1:13:29.70", Write(R[0]), run=0.6)
        self.go("1:13:30.70", Write(R[1:]), run=0.5)
        wh = TX(r"at $t = 5$ min", size=44, color=DIM).next_to(R, DOWN, buff=0.45)
        self.go("1:13:33.00", FadeIn(wh, shift=UP * 0.1), run=0.5)
        up = Arrow([-1.7, -2.2, 0], [-1.7, -0.6, 0], buff=0, color=PINK, stroke_width=6, tip_length=0.25)
        rate = M(r"+3\ \text{L/min}", size=46, color=PINK).next_to(wh, DOWN, buff=0.45)
        self.go("1:13:34.60", lv.animate.set_value(-0.2), GrowArrow(up), run=1.6, rate_func=linear)
        self.go("1:13:36.30", FadeIn(rate, shift=UP * 0.1), run=0.5)
        # f'(5) = -3: draining
        R2 = at_eq(M("f'(5)", "=", "-3", size=64), 2.6, 0.0)
        R2[0].set_color(PINK); R2[2].set_color(ORG)
        rate2 = M(r"-3\ \text{L/min}", size=46, color=PINK).move_to(rate)
        dn = Arrow([-1.7, -0.6, 0], [-1.7, -2.2, 0], buff=0, color=PINK, stroke_width=6, tip_length=0.25)
        pipe = VGroup(Line([TK_R, TK_B + 0.35, 0], [TK_R + 0.45, TK_B + 0.35, 0], color=CHALK, stroke_width=5),
                      Line([TK_R, TK_B + 0.15, 0], [TK_R + 0.45, TK_B + 0.15, 0], color=CHALK, stroke_width=5))
        drip = Line([TK_R + 0.5, TK_B + 0.25, 0], [TK_R + 0.65, TK_B - 0.45, 0], color=BLUE, stroke_width=5)
        self.go("1:13:39.20", TransformMatchingTex(R, R2), ReplacementTransform(rate, rate2), ReplacementTransform(up, dn), run=0.7)
        self.go("1:13:40.50", Create(pipe), Create(drip), run=0.4)
        self.play(lv.animate.set_value(-1.6), run_time=2.4, rate_func=linear)


# ================================================================ 5. car and cost

def car():
    body = VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners(
        [[-0.8, 0.15, 0], [0.8, 0.15, 0], [0.82, 0.4, 0], [0.42, 0.46, 0], [0.18, 0.74, 0], [-0.42, 0.74, 0],
         [-0.62, 0.46, 0], [-0.82, 0.42, 0], [-0.8, 0.15, 0]])
    win = Line([-0.5, 0.46, 0], [0.34, 0.46, 0], color=DIM, stroke_width=3)
    wheels = VGroup(*[Circle(radius=0.16, stroke_color=CHALK, stroke_width=4, fill_color=config.background_color,
                             fill_opacity=1).move_to([x, 0.16, 0]) for x in (-0.46, 0.46)])
    return VGroup(body, win, wheels)


def crate(c, color=CHALK):
    s = Square(0.62, color=color, stroke_width=4).move_to(c)
    return VGroup(s, Line(s.get_corner(UL), s.get_corner(DR), color=color, stroke_width=2),
                  Line(s.get_corner(UR), s.get_corner(DL), color=color, stroke_width=2))


class K12_Rates(Shot):
    def body(self):
        self.title("Rates Everywhere", "1:13:43.40")
        road = Line([-6.3, -2.2, 0], [6.3, -2.2, 0], color=DIM, stroke_width=4)
        ticks = VGroup(*[Line([x, -2.2, 0], [x, -2.38, 0], color=FAINT, stroke_width=3) for x in np.arange(-5.5, 6.0, 1.0)])
        cx = ValueTracker(-5.2)
        cr = car().move_to([-5.2, -1.75, 0])
        cr.add_updater(lambda m: m.move_to([cx.get_value(), -1.75, 0]))
        sa = TX(r"$s(t)$: position in meters", size=46).move_to([-5.9, 1.55, 0], aligned_edge=LEFT)
        sa[0][0:4].set_color(BLUE)
        sb = TX(r"$t$: seconds", size=46).next_to(sa, DOWN, buff=0.35, aligned_edge=LEFT)
        sb[0][0].set_color(ORG)
        self.go("1:13:43.95", FadeIn(sa, shift=RIGHT * 0.1), run=0.5)
        self.go("1:13:45.30", Create(road), FadeIn(ticks), FadeIn(cr, shift=RIGHT * 0.2), run=0.6)
        sc = TX(r"$s'(t)$: velocity, m/s", size=46, color=PINK).next_to(sb, DOWN, buff=0.35, aligned_edge=LEFT)
        va = always_redraw(lambda: Arrow([cx.get_value() + 0.3, -0.8, 0], [cx.get_value() + 1.5, -0.8, 0], buff=0,
                                         color=PINK, stroke_width=5, tip_length=0.2))
        self.go("1:13:47.20", FadeIn(sb, shift=RIGHT * 0.1), FadeIn(va), run=0.5)
        self.go("1:13:47.75", cx.animate.set_value(4.4), run=2.2, rate_func=linear)
        self.go("1:13:50.00", FadeIn(sc, shift=RIGHT * 0.1), run=0.5)
        # cost
        cr.clear_updaters()
        self.go("1:13:52.40", FadeOut(VGroup(road, ticks, cr, va, sa, sb, sc)), run=0.4)
        ca = TX(r"$C(x)$: cost of $x$ items", size=46).move_to([-5.9, 1.55, 0], aligned_edge=LEFT)
        ca[0][0:4].set_color(BLUE)
        self.go("1:13:53.00", FadeIn(ca, shift=RIGHT * 0.1), run=0.5)
        boxes = VGroup(*[crate([-5.3 + 0.8 * i, -1.9, 0]) for i in range(5)])
        self.go("1:13:54.60", LaggedStart(*[FadeIn(b, shift=DOWN * 0.15) for b in boxes], lag_ratio=0.15), run=0.9)
        cb = VGroup(M(r"C'(x)", size=52, color=PINK), M(r"\approx", size=52), H("cost of one more", 44, CHALK)).arrange(RIGHT, buff=0.25)
        cb.next_to(ca, DOWN, buff=0.45, aligned_edge=LEFT)
        self.go("1:13:56.30", Write(cb[0]), run=0.6)
        self.go("1:13:57.50", Write(cb[1]), FadeIn(cb[2], shift=RIGHT * 0.1), run=0.7)
        nb = crate([-5.3 + 0.8 * 5, -1.9, 0], ORG)
        p1 = M("+1", size=44, color=ORG).next_to(nb, UP, buff=0.15)
        self.go("1:13:59.20", FadeIn(nb, shift=DOWN * 0.2), FadeIn(p1), run=0.6)
        mc = pill("marginal cost", PINK, 44).move_to([3.4, -1.9, 0])
        self.go("1:14:01.70", FadeIn(mc, shift=UP * 0.1), run=0.5)
        # ask yourself
        self.go("1:14:03.30", FadeOut(VGroup(ca, boxes, cb, nb, p1, mc)), run=0.4)
        q = H("Ask: what is this a rate of?", 54, YEL).move_to([0, 0.8, 0])
        self.go("1:14:05.70", FadeIn(q, shift=UP * 0.1), run=0.6)
        wq = fr(r"\text{what changes?}", r"\text{per what?}", size=60, tc=PINK, bc=BLUE).move_to([0, -1.3, 0])
        self.go("1:14:08.50", Write(wq), run=0.9)


# ================================================================ 6. the derivative is a function: sketch f' from f

def fc(x):
    return (x ** 3 - 3 * x) / 4


def fcp(x):
    return (3 * x * x - 3) / 4


X0C = -2.2
RD_POS = (4.4, 1.5, 0)


def fp_board():
    ax = axes((-2.5, 2.5, 0.5), (-1.5, 1.5, 0.5), x_length=8.4, y_length=2.2, center=(-1.3, 1.15, 0), nums=False, y_label=None)
    ax2 = axes((-2.5, 2.5, 0.5), (-1, 3.5, 0.5), x_length=8.4, y_length=3.0, center=(-1.3, -2.0, 0), nums=False, y_label=None)
    c = curve(ax, fc, (X0C, 2.2, 0.02))
    fl = M("f", size=50, color=BLUE).next_to(ax.c2p(2.2, fc(2.2)), RIGHT, buff=0.15)
    gl = M("f'", size=50, color=PINK).next_to(ax2.c2p(2.2, fcp(2.2)), RIGHT, buff=0.15)
    return ax, ax2, c, fl, gl


def fp_signs(ax):
    return VGroup(slope_sign(ax, fc, -1.95, "up"), slope_sign(ax, fc, 0.0, "down"),
                  slope_sign(ax, fc, -1.0, "flat", arrow=False))


class K12_FPrime(Shot):
    def body(self):
        self.title("The Derivative Is a Function", "1:14:10.14")
        ax, ax2, c, fl, gl = fp_board()
        self.go("1:14:11.56", FadeIn(ax), FadeIn(ax.labels), draw(c, run=1.0), run=1.0)
        self.play(FadeIn(fl), run_time=0.3)
        xt, xm = ValueTracker(X0C), ValueTracker(X0C)
        tg = live_tangent(ax, fc, xt, length=2.4, readout=False)
        rd = readout(lambda: slope(fc, xt.get_value()), RD_POS)
        self.go("1:14:15.30", FadeIn(tg), FadeIn(rd), run=0.5)
        self.go("1:14:16.30", xt.animate.set_value(-1.75), run=1.0)
        self.go("1:14:18.18", FadeIn(ax2), FadeIn(ax2.labels), run=0.6)
        tr, bar, dot, guide = lower_trace(self, ax, ax2, fc, fcp, X0C, xt, xm)
        self.go("1:14:19.50", Circumscribe(rd, color=YEL, buff=0.1), run=0.7)
        self.play(FadeIn(guide), FadeIn(bar), FadeIn(dot), FadeIn(tr), FadeIn(gl), run_time=0.6)
        self.go("1:14:21.30", Circumscribe(gl, color=PINK, buff=0.12), run=0.7)
        self.go("1:14:23.20", Circumscribe(fl, color=BLUE, buff=0.12), run=0.7)
        s = fp_signs(ax)
        self.go("1:14:27.30", FadeIn(s[0], shift=UP * 0.1), run=0.4)
        self.go("1:14:28.10", FadeIn(s[1], shift=UP * 0.1), run=0.4)
        self.go("1:14:28.95", FadeIn(s[2], shift=UP * 0.1), run=0.4)


class K12_Trace(Shot):
    def body(self):
        self.title("The Derivative Is a Function", animate=False)
        ax, ax2, c, fl, gl = fp_board()
        xt, xm = ValueTracker(-1.75), ValueTracker(-1.75)
        tg = live_tangent(ax, fc, xt, length=2.4, readout=False)
        rd = readout(lambda: slope(fc, xt.get_value()), RD_POS)
        tr, bar, dot, guide = lower_trace(self, ax, ax2, fc, fcp, X0C, xt, xm)
        s = fp_signs(ax)
        self.add(ax, ax.labels, c, fl, ax2, ax2.labels, gl, tg, rd, tr, bar, dot, guide, s)
        self.go("1:14:29.95", FadeOut(s), run=0.4)
        # uphill: slope positive, f' above the axis
        self.go("1:14:30.90", xt.animate.set_value(-1.0), run=2.0)
        up = ax2.get_area(ax2.plot(fcp, x_range=[X0C, -1, 0.02]), x_range=[X0C, -1], color=PINK, opacity=0.22)
        plus = M("+", size=64, color=PINK).move_to(ax2.c2p(-1.45, 0.45))
        self.go("1:14:34.30", FadeIn(up), FadeIn(plus, scale=0.6), run=0.6)
        # downhill: slope negative, f' below
        self.go("1:14:37.00", xt.animate.set_value(1.0), run=3.0)
        dn = ax2.get_area(ax2.plot(fcp, x_range=[-1, 1, 0.02]), x_range=[-1, 1], color=PINK, opacity=0.22)
        minus = M("-", size=64, color=PINK).move_to(ax2.c2p(0.45, -0.95))
        self.go("1:14:41.10", FadeIn(dn), FadeIn(minus, scale=0.6), run=0.6)
        # flat: slope zero, f' crosses the axis
        r1, r2 = ring(ax.c2p(-1, fc(-1))), ring(ax.c2p(1, fc(1)))
        d1 = DashedLine(ax.c2p(-1, fc(-1)), ax2.c2p(-1, 0), color=YEL, stroke_width=2, dash_length=0.08)
        d2 = DashedLine(ax.c2p(1, fc(1)), ax2.c2p(1, 0), color=YEL, stroke_width=2, dash_length=0.08)
        h1 = line_through(ax, -1, fc(-1), 0, length=2.0, color=PINK, width=4).set_opacity(0.6)
        self.go("1:14:44.50", Create(r1), Create(h1), run=0.5)
        self.go("1:14:45.60", Create(r2), run=0.5)
        z1, z2 = pt(ax2, -1, 0, YEL, 0.1), pt(ax2, 1, 0, YEL, 0.1)
        self.go("1:14:48.70", Create(d1), Create(d2), FadeIn(z1, scale=0.5), FadeIn(z2, scale=0.5), run=0.7)
        # steep: far from zero; gentle: close to zero
        self.go("1:14:50.30", FadeOut(VGroup(r1, r2, h1, d1, d2)), run=0.4)
        self.go("1:14:51.60", xt.animate.set_value(2.05), run=1.6)
        self.go("1:14:53.40", Circumscribe(VGroup(rd), color=YEL, buff=0.1), run=0.8)
        self.go("1:14:55.40", xt.animate.set_value(1.2), run=1.5)
        self.go("1:14:57.30", Circumscribe(VGroup(rd), color=YEL, buff=0.1), run=0.8)


# ================================================================ 7. check with the parabola

def sq(x):
    return x * x


class K12_Parabola(Shot):
    def body(self):
        self.title("Check: the Parabola", "1:14:58.76")
        ax = axes((-2.5, 2.5, 0.5), (-0.5, 5.5, 0.5), x_length=8.4, y_length=2.2, center=(-1.3, 1.15, 0), nums=False, y_label=None)
        ax2 = axes((-2.5, 2.5, 0.5), (-4.5, 4.5, 0.5), x_length=8.4, y_length=3.0, center=(-1.3, -2.0, 0), nums=False, y_label=None)
        c = curve(ax, sq, (-2.05, 2.05, 0.02))
        fl = M("f(x)=x^2", size=50, color=BLUE).move_to([4.9, 0.55, 0])
        self.go("1:14:59.30", FadeIn(ax), FadeIn(ax.labels), draw(c, run=0.9), run=0.9)
        self.play(FadeIn(fl), run_time=0.3)
        self.go("1:15:00.70", FadeIn(ax2), FadeIn(ax2.labels), run=0.5)
        xt, xm = ValueTracker(-2.0), ValueTracker(-2.0)
        tg = live_tangent(ax, sq, xt, length=1.8, readout=False)
        rd = readout(lambda: slope(sq, xt.get_value()), RD_POS)
        tr, bar, dot, guide = lower_trace(self, ax, ax2, sq, lambda x: 2 * x, -2.0, xt, xm)
        self.go("1:15:01.20", FadeIn(tg), FadeIn(rd), FadeIn(guide), FadeIn(bar), FadeIn(dot), FadeIn(tr), run=0.4)
        self.go("1:15:01.62", xt.animate.set_value(0.0), run=1.4)
        self.go("1:15:04.30", xt.animate.set_value(2.0), run=1.0)
        mn = M("-", size=64, color=PINK).move_to(ax2.c2p(-1.5, -1.2))
        zr = pt(ax2, 0, 0, YEL, 0.1)
        pl = M("+", size=64, color=PINK).move_to(ax2.c2p(1.5, 1.2))
        self.go("1:15:07.20", FadeIn(mn, scale=0.6), run=0.4)
        self.go("1:15:08.30", FadeIn(zr, scale=0.5), run=0.4)
        self.go("1:15:09.80", FadeIn(pl, scale=0.6), run=0.4)
        # steeper further out
        self.go("1:15:10.90", xt.animate.set_value(0.4), run=0.7)
        self.go("1:15:11.70", xt.animate.set_value(2.0), run=1.6)
        lab = M("y=2x", size=50, color=PINK).next_to(ax2.c2p(2.0, 4.0), RIGHT, buff=0.35).shift(DOWN * 0.25)
        self.go("1:15:15.30", Write(lab), run=0.7)
        tk = tick_mark(GRN, 0.6).next_to(lab, RIGHT, buff=0.3)
        self.go("1:15:17.90", Create(tk), run=0.5)


# ================================================================ 8. differentiable, and the corner

class K12_Fail(Shot):
    def body(self):
        self.title("Differentiable", "1:15:20.00")
        a = M(r"f'(a)\ \text{exists}", size=60, color=PINK)
        ar = M(r"\Rightarrow", size=60)
        b = TX(r"differentiable at $a$", size=56, color=GRN)
        row = VGroup(a, ar, b).arrange(RIGHT, buff=0.4).move_to([0, 0.6, 0])
        self.go("1:15:23.94", Write(a), run=0.8)
        self.go("1:15:26.40", Write(ar), run=0.4)
        self.go("1:15:26.82", Write(b), run=0.9)
        f = pill("ways it can fail", RED, 44).move_to([0, -1.4, 0])
        self.go("1:15:29.30", FadeIn(f, shift=UP * 0.1), run=0.5)


def ab(x):
    return abs(x)


class K12_Corner(Shot):
    def body(self):
        self.title("1. A Corner", "1:15:31.30")
        ax = axes((-3, 3, 1), (-1, 3, 1), x_length=5.6, y_length=3.9, center=(-3.4, -0.9, 0))
        V = VMobject(stroke_color=BLUE, stroke_width=5).set_points_as_corners([ax.c2p(-2.6, 2.6), ax.c2p(0, 0), ax.c2p(2.6, 2.6)])
        self.go("1:15:31.85", FadeIn(ax), FadeIn(ax.labels), run=0.5)
        self.go("1:15:33.60", draw(V, run=1.0), run=1.0)
        vl = M("y=|x|", size=48, color=BLUE).next_to(ax.c2p(-2.6, 2.6), RIGHT, buff=0.25)
        self.go("1:15:35.40", Write(vl), run=0.5)
        rg = ring(ax.c2p(0, 0), YEL, 0.25)
        self.go("1:15:38.30", Create(rg), run=0.5)
        # left side slope -1, right side +1: the tangent flips as it crosses the tip
        xt = ValueTracker(-1.8)
        tg = live_tangent(ax, ab, xt, length=2.2, readout=False)
        rd = readout(lambda: slope(ab, xt.get_value()), (1.2, 0.6, 0), size=48)
        self.go("1:15:39.60", FadeIn(tg), FadeIn(rd), run=0.4)
        self.go("1:15:40.00", xt.animate.set_value(-0.45), run=1.5)
        self.go("1:15:42.54", xt.animate.set_value(1.6), run=1.9)
        # at the tip: which way should it lean?
        self.go("1:15:45.50", FadeOut(tg), FadeOut(rd), run=0.4)
        sv = ValueTracker(-0.85)
        tip = always_redraw(lambda: line_through(ax, 0, 0, sv.get_value(), length=2.4))
        o = pt(ax, 0, 0, PINK)
        self.play(FadeIn(tip), FadeIn(o), run_time=0.3)
        ghosts = VGroup(*[line_through(ax, 0, 0, m, length=2.4, color=PINK, width=3).set_opacity(0.35) for m in (-0.85, -0.4, 0, 0.4, 0.85)])
        self.go("1:15:46.60", sv.animate.set_value(0.85), LaggedStart(*[FadeIn(g) for g in ghosts], lag_ratio=0.45), run=2.0)
        q = M("?", size=90, color=YEL).move_to(ax.c2p(2.35, 0.5))
        self.go("1:15:49.00", FadeIn(q, scale=0.7), run=0.4)
        no = M(r"\text{no } f'(0)", size=50, color=RED).move_to(ax.c2p(2.35, 0.5))
        self.go("1:15:52.30", ReplacementTransform(q, no), run=0.6)
        # the one-sided limits disagree
        lft = at_eq(M(r"\lim_{h\to 0^-}\frac{|h|}{h}", "=", "-1", size=54), 3.2, 1.0)
        rgt = at_eq(M(r"\lim_{h\to 0^+}\frac{|h|}{h}", "=", "1", size=54), 3.2, -0.9)
        lft[2].set_color(PINK); rgt[2].set_color(PINK)
        self.go("1:15:54.40", Write(lft[0:2]), run=0.9)
        self.go("1:15:56.80", Write(lft[2]), run=0.4)
        self.go("1:15:57.70", Write(rgt[0:2]), run=0.9)
        self.go("1:15:58.90", Write(rgt[2]), run=0.4)
        ne = M("-1", r"\neq", "1", size=58).move_to([2.6, -2.6, 0])
        ne[1].set_color(RED)
        self.go("1:15:59.90", Write(ne), run=0.6)
        dne = M(r"\text{limit DNE}", size=50, color=RED).next_to(ne, RIGHT, buff=0.5)
        self.go("1:16:01.20", FadeIn(dne, shift=LEFT * 0.1), run=0.5)


# ================================================================ 9. cusp and vertical tangent

def cusp(x):
    return np.cbrt(x) ** 2


class K12_CuspVert(Shot):
    def body(self):
        self.title("2. A Cusp", "1:16:02.60")
        ax = axes((-2.5, 2.5, 0.5), (-0.5, 2.0, 0.5), x_length=5.0, y_length=3.2, center=(-3.5, -1.0, 0), nums=False)
        C = poly(ax, cusp, tip_xs(-2.3, 2.3))
        self.go("1:16:03.10", FadeIn(ax), FadeIn(ax.labels), run=0.5)
        self.go("1:16:03.80", draw(C, run=1.1), run=1.1)
        rg = ring(ax.c2p(0, 0), YEL, 0.25)
        self.go("1:16:07.20", Create(rg), run=0.5)
        cl = M("y=x^{2/3}", size=48, color=BLUE).next_to(ax.c2p(2.3, cusp(2.3)), RIGHT, buff=0.15).shift(DOWN * 0.35)
        self.go("1:16:09.30", Write(cl), run=0.7)
        nc = M(r"\text{no } f'(0)", size=42, color=RED).next_to(ax.c2p(0, 0), DOWN, buff=0.3).shift(RIGHT * 1.15)
        self.go("1:16:10.90", FadeIn(nc, shift=UP * 0.1), run=0.5)
        # vertical tangent
        self.title("3. A Vertical Tangent", "1:16:12.20")
        focus(self, run=0.4)
        bx = axes((-2.5, 2.5, 0.5), (-1.5, 1.5, 0.5), x_length=5.0, y_length=3.2, center=(3.4, -1.0, 0), nums=False)
        R = poly(bx, np.cbrt, tip_xs(-2.3, 2.3))
        self.go("1:16:13.20", FadeIn(bx), FadeIn(bx.labels), run=0.5)
        self.go("1:16:15.00", draw(R, run=1.0), run=1.0)
        rl = M(r"y=\sqrt[3]{x}", size=48, color=BLUE).next_to(bx.c2p(-2.3, np.cbrt(-2.3)), UP, buff=0.4).shift(RIGHT * 0.3)
        self.play(Write(rl), run_time=0.6)
        xt = ValueTracker(1.9)
        tg = live_tangent(bx, np.cbrt, xt, length=2.6, readout=False)
        rd = readout(lambda: slope(np.cbrt, xt.get_value()), (2.6, 1.6, 0), size=46, big=100)
        self.go("1:16:17.30", FadeIn(tg), FadeIn(rd), run=0.4)
        self.go("1:16:17.80", xt.animate.set_value(0.0), run=3.9, rate_func=lambda t: 1 - (1 - t) ** 3)
        vt = Line(bx.c2p(0, -1.3), bx.c2p(0, 1.3), color=PINK, stroke_width=6).set_z_index(4)
        und = M(r"\text{slope undefined}", size=46, color=RED).move_to(rd)
        self.go("1:16:22.80", FadeOut(tg), FadeIn(vt), run=0.4)
        self.go("1:16:23.90", ReplacementTransform(rd, und), run=0.6)


# ================================================================ 10. breaks

class K12_Breaks(Shot):
    def body(self):
        self.title("4. A Break", "1:16:27.00")
        cs = [(-4.5, -0.4, 0), (0, -0.4, 0), (4.5, -0.4, 0)]
        A = [axes((-1, 3, 1), (-1, 3, 1), x_length=3.4, y_length=3.0, center=c, nums=False, x_label=None, y_label=None) for c in cs]
        self.go("1:16:27.60", *[Create(a) for a in A], run=0.6)
        a0, a1, a2 = A
        lin = lambda x: 0.6 * x + 0.8
        hole_g = VGroup(curve(a0, lin, (-0.8, 2.8, 0.05)), hole(a0, 1.2, lin(1.2)))
        jump_g = VGroup(curve(a1, lambda x: 0.8, (-0.8, 1.2, 0.05)), curve(a1, lambda x: 2.2, (1.2, 2.8, 0.05)),
                        pt(a1, 1.2, 2.2, BLUE), hole(a1, 1.2, 0.8))
        asy = DashedLine(a2.c2p(1, -1), a2.c2p(1, 3), color=FAINT, stroke_width=3, dash_length=0.1)
        g = lambda x: 0.45 / (x - 1) + 1
        asy_g = VGroup(asy, curve(a2, g, (-0.8, 0.75, 0.01)), curve(a2, g, (1.25, 2.8, 0.01)))
        labs = [H(w, 38, DIM).move_to(a.get_bottom() + DOWN * 0.18, aligned_edge=UP) for w, a in zip(("hole", "jump", "asymptote"), A)]
        self.go("1:16:30.00", FadeIn(hole_g), FadeIn(labs[0]), run=0.5)
        self.go("1:16:30.80", FadeIn(jump_g), FadeIn(labs[1]), run=0.5)
        self.go("1:16:31.55", FadeIn(asy_g), FadeIn(labs[2]), run=0.5)
        nos = [M(r"\text{no } f'", size=44, color=RED).move_to([l.get_x(), A[0].get_bottom()[1] - 1.0, 0]) for l in labs]
        self.go("1:16:34.00", *[FadeIn(n, shift=UP * 0.1) for n in nos], run=0.6)


# ================================================================ 11. differentiable implies continuous

class K12_Implies(Shot):
    def body(self):
        self.title("An Important Fact", "1:16:36.50")
        d = pill("differentiable", PINK, 46).move_to([-3.4, 1.3, 0])
        c = pill("continuous", BLUE, 46).move_to([3.4, 1.3, 0])
        fw = Arrow(d.get_right(), c.get_left(), buff=0.25, color=GRN, stroke_width=6, tip_length=0.25)
        self.go("1:16:38.90", FadeIn(d, shift=UP * 0.1), run=0.5)
        self.go("1:16:40.30", GrowArrow(fw), run=0.5)
        self.go("1:16:41.20", FadeIn(c, shift=UP * 0.1), run=0.5)
        bk = CurvedArrow(c.get_bottom() + DOWN * 0.15, d.get_bottom() + DOWN * 0.15, angle=-0.6, color=DIM, stroke_width=4, tip_length=0.2)
        self.go("1:16:42.90", Create(bk), run=0.6)
        x = cross_mark(RED, 0.25).move_to(bk.point_from_proportion(0.5))
        self.play(Create(x), run_time=0.4)
        # |x|: continuous, not differentiable
        ax = axes((-2, 2, 1), (-0.5, 2, 1), x_length=4.4, y_length=2.4, center=(-2.0, -2.25, 0), nums=False)
        V = VMobject(stroke_color=BLUE, stroke_width=5).set_points_as_corners([ax.c2p(-1.9, 1.9), ax.c2p(0, 0), ax.c2p(1.9, 1.9)])
        vl = M("|x|", size=46, color=BLUE).next_to(ax.c2p(1.9, 1.9), RIGHT, buff=0.15)
        self.go("1:16:48.50", FadeIn(ax), FadeIn(ax.labels), FadeIn(vl), run=0.5)
        s1 = VGroup(H("continuous", 40, CHALK), tick_mark(GRN, 0.45)).arrange(RIGHT, buff=0.3).move_to([3.0, -1.6, 0], aligned_edge=LEFT).shift(LEFT * 1.2)
        self.go("1:16:50.00", FadeIn(s1, shift=LEFT * 0.1), run=0.5)
        self.go("1:16:51.20", draw(V, run=1.3), run=1.3)
        rg = ring(ax.c2p(0, 0), RED, 0.22)
        self.go("1:16:53.60", Create(rg), run=0.4)
        s2 = VGroup(H("differentiable", 40, CHALK), cross_mark(RED, 0.2)).arrange(RIGHT, buff=0.3).next_to(s1, DOWN, buff=0.45, aligned_edge=LEFT)
        self.go("1:16:54.50", FadeIn(s2, shift=LEFT * 0.1), run=0.5)


# ================================================================ 12. smooth vs corner under a zoom

ZR = 1.15


def zoom_row(c_fn, cx, cy, u0, us, C, k):
    """Left: the curve with a small zoom box at u0. Right: a round inset magnified k times around that point."""
    P = np.array([cx + u0, cy + c_fn(u0), 0])
    C = np.array(C, float)
    cv = VMobject(stroke_color=BLUE, stroke_width=5).set_points_as_corners([[cx + u, cy + c_fn(u), 0] for u in us])
    circ = Circle(radius=ZR, color=CHALK, stroke_width=3).move_to(C)

    def box():
        kk = k.get_value()
        return Square(2 * ZR / kk, color=YEL, stroke_width=3).move_to(P)

    def links():
        b = box()
        return VGroup(Line(b.get_corner(UR), C + ZR * np.array([np.cos(2.2), np.sin(2.2), 0]), color=YEL, stroke_width=2, stroke_opacity=0.6),
                      Line(b.get_corner(DR), C + ZR * np.array([np.cos(4.1), np.sin(4.1), 0]), color=YEL, stroke_width=2, stroke_opacity=0.6))

    def inset():
        kk = k.get_value()
        uu = np.linspace(-ZR, ZR, 241)
        vv = kk * (c_fn(u0 + uu / kk) - c_fn(u0))
        inside = uu ** 2 + vv ** 2 <= ZR ** 2 * 0.97
        i0 = i1 = 120
        while i0 > 0 and inside[i0 - 1]:
            i0 -= 1
        while i1 < 240 and inside[i1 + 1]:
            i1 += 1
        return VMobject(stroke_color=BLUE, stroke_width=5).set_points_as_corners(
            [C + [u, v, 0] for u, v in zip(uu[i0:i1 + 1], vv[i0:i1 + 1])])
    return cv, circ, always_redraw(box), always_redraw(links), always_redraw(inset), P


class K12_Zoom(Shot):
    def body(self):
        self.title("Differentiable Means Smooth", "1:16:56.40")
        c1 = lambda u: 0.6 * u * u
        c2 = lambda u: 0.9 * np.abs(u) + 0.3 * u * u
        k1, k2 = ValueTracker(1.6), ValueTracker(2.0)
        cv1, ci1, bx1, ln1, in1, P1 = zoom_row(c1, -3.6, 0.25, 0.4, np.linspace(-1.6, 1.6, 161), (1.4, 0.95, 0), k1)
        cv2, ci2, bx2, ln2, in2, P2 = zoom_row(c2, -3.6, -3.05, 0.0, np.linspace(-1.4, 1.4, 141), (1.4, -2.35, 0), k2)
        self.go("1:16:59.00", draw(cv1, run=0.8), run=0.8)
        self.play(Create(ci1), FadeIn(bx1), FadeIn(ln1), FadeIn(in1), run_time=0.6)
        self.go("1:17:00.50", k1.animate.set_value(60), run=3.6, rate_func=lambda t: (np.exp(t * np.log(60 / 1.6)) - 1) / (60 / 1.6 - 1))
        sl = H("a straight line", 40, CHALK).next_to(ci1, RIGHT, buff=0.4)
        self.go("1:17:04.30", FadeIn(sl, shift=LEFT * 0.1), run=0.5)
        in1.clear_updaters()
        tg = Line(P1 + np.array([-1.1, -1.1 * 0.48, 0]), P1 + np.array([1.1, 1.1 * 0.48, 0]), color=PINK, stroke_width=5).set_z_index(4)
        tl = H("the tangent line", 40, PINK).move_to(sl, aligned_edge=LEFT)
        self.go("1:17:06.60", in1.animate.set_color(PINK), Create(tg), ReplacementTransform(sl, tl), run=0.7)
        # a corner never straightens out
        self.go("1:17:07.60", draw(cv2, run=0.6), run=0.6)
        self.play(Create(ci2), FadeIn(bx2), FadeIn(ln2), FadeIn(in2), run_time=0.5)
        self.go("1:17:08.90", k2.animate.set_value(60), run=3.4, rate_func=lambda t: (np.exp(t * np.log(30)) - 1) / 29)
        cl = H("still a corner", 40, RED).next_to(ci2, RIGHT, buff=0.4)
        self.go("1:17:12.50", FadeIn(cl, shift=LEFT * 0.1), run=0.5)
        self.go("1:17:13.50", Circumscribe(ci2, Circle, color=RED, buff=0.08), run=0.9)


# ================================================================ 13. recap

class K12_Recap(Shot):
    def body(self):
        self.title("So, What Is a Derivative?", "1:17:15.30")
        r1 = pill("the slope of the tangent line", PINK, 44).move_to([0, 1.5, 0])
        r2 = pill("the instantaneous rate of change", PINK, 44).move_to([0, 0.3, 0])
        D = M("f'(x)", "=", r"\lim_{h\to 0}", r"\frac{f(x+h)-f(x)}{h}", size=64).move_to([0, -1.7, 0])
        D[0].set_color(PINK)
        self.go("1:17:17.60", FadeIn(r1, shift=UP * 0.1), run=0.5)
        self.go("1:17:19.60", FadeIn(r2, shift=UP * 0.1), run=0.5)
        self.go("1:17:22.20", Write(D[0:2]), run=0.6)
        self.go("1:17:22.85", Write(D[2]), run=0.6)
        self.go("1:17:23.40", Write(D[3]), run=2.2)
        pan = panel(D, YEL, buff=0.25)
        self.go("1:17:26.00", Create(pan), run=0.6)
        # next chapter: the shortcuts
        self.go("1:17:27.10", FadeOut(r1), FadeOut(r2), VGroup(D, pan).animate.scale(0.8).move_to([0, 1.2, 0]), run=0.7)
        nx = pill("Next: the shortcuts", YEL, 50).move_to([0, -0.8, 0])
        self.go("1:17:29.20", FadeIn(nx, shift=UP * 0.1), run=0.6)
        ms = M(r"\text{minutes}", r"\ \to\ ", r"\text{seconds}", size=56).move_to([0, -2.3, 0])
        ms[0].set_color(DIM); ms[2].set_color(GRN)
        self.go("1:17:31.70", Write(ms), run=0.9)
