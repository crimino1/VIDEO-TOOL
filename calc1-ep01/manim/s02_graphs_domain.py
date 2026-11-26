"""Builder 02: Part 2 (graphs, plotting 2x+3, the vertical line test) and Part 3 (domain and range,
the two troublemakers, the range of x^2, practice questions 2 and 3)."""
from common import *

# ---------- the coordinate grid shared by K02_Grid and K02_Plot ----------
UXg, UYg = 1.3, 0.6
GOg = np.array([-5.0, -2.9, 0])        # screen point of data (0, 0)
RCX = 4.4                              # centre of the right-hand column


def gp(x, y):
    return GOg + np.array([x * UXg, y * UYg, 0])


def grid_board():
    lines = VGroup(*[Line(gp(x, -1), gp(x, 8.4), stroke_color=FAINT, stroke_width=1.5, stroke_opacity=0.8) for x in range(-1, 5)],
                   *[Line(gp(-1, y), gp(4.2, y), stroke_color=FAINT, stroke_width=1.5, stroke_opacity=0.8) for y in range(-1, 9)])
    xax = Arrow(gp(-1, 0), gp(4.45, 0), buff=0, color=CHALK, stroke_width=4, tip_length=0.22, max_tip_length_to_length_ratio=1)
    yax = Arrow(gp(0, -1), gp(0, 8.75), buff=0, color=CHALK, stroke_width=4, tip_length=0.22, max_tip_length_to_length_ratio=1)
    xn = VGroup(*[M(str(k), size=34, color=DIM).next_to(gp(k, 0), DOWN, buff=0.12) for k in range(1, 5)])
    yn = VGroup(*[M(str(k), size=34, color=DIM).next_to(gp(0, k), LEFT, buff=0.12) for k in range(1, 9)])
    xl = TX(r"$x$-axis", 40).next_to(xax.get_end(), RIGHT, buff=0.15)
    yl = TX(r"$y$-axis", 40).next_to(yax.get_end(), RIGHT, buff=0.2)
    return dict(lines=lines, xax=xax, yax=yax, xn=xn, yn=yn, xl=xl, yl=yl)


def yfx():
    g = M("y", "=", "f(x)", size=72)
    g[0].set_color(YEL)
    return g


# ---------- number lines ----------

def nline(lo, hi, y, width=10.0):
    """Number line with integer ticks lo..hi. Returns (group, p(v) -> screen point, {k: label})."""
    u = width / (hi - lo + 1.2)
    x0 = -width / 2 + 0.6 * u
    p = lambda v: np.array([x0 + (v - lo) * u, y, 0])
    base = DoubleArrow(p(lo - 0.6), p(hi + 0.6), buff=0, color=DIM, stroke_width=3, tip_length=0.2)
    ticks = {k: Line(p(k) + UP * 0.12, p(k) + DOWN * 0.12, color=DIM, stroke_width=3) for k in range(lo, hi + 1)}
    labs = {k: M(str(k), size=34, color=DIM).next_to(p(k) + DOWN * 0.12, DOWN, buff=0.12) for k in range(lo, hi + 1)}
    g = VGroup(base, *ticks.values(), *labs.values())
    g.lo, g.hi, g.ticks = lo, hi, ticks
    return g, p, labs


def ray(a, b, color=GRN):
    return Arrow(a, b, buff=0, color=color, stroke_width=9, tip_length=0.26,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30).set_z_index(2)


def except_point(nl, p, h):
    """Green shading on both sides of h, and the open hole at h."""
    rays = VGroup(ray(p(h) + LEFT * 0.15, p(nl.lo - 0.6)), ray(p(h) + RIGHT * 0.15, p(nl.hi + 0.6)))
    hole = Circle(radius=0.14, stroke_color=RED, stroke_width=5, fill_color="#3b3a3e", fill_opacity=1).move_to(p(h)).set_z_index(3)
    return rays, hole


def from_point(nl, p, a):
    """Closed dot at a and green shading to the right."""
    return ray(p(a), p(nl.hi + 0.6)), Dot(p(a), radius=0.14, color=GRN).set_z_index(3)


# ---------- the vertical line ----------

def vslider(ax, xt, f=None, lo=-1.9, hi=1.9, width=5):
    def mk():
        x = xt.get_value()
        g = VGroup(Line(ax.c2p(x, lo), ax.c2p(x, hi), color=YEL, stroke_width=width))
        if f is not None:
            g.add(Dot(ax.c2p(x, f(x)), radius=0.1, color=GRN))
        return g
    return always_redraw(mk)


def drop(scene, s, run=0.35):
    s.clear_updaters()
    scene.play(FadeOut(s), run_time=run)


# ================================================================ Part 2: graphs

class K02_Grid(Shot):
    def body(self):
        self.title("Graphs", "3:43.00")
        rule = M(r"f(x)=2x+3", size=62).move_to([-3.7, 0.1, 0])
        rl = H("a rule", 40, DIM).next_to(rule, UP, buff=0.35)
        self.go("3:43.50", Write(rule), run=0.6)
        self.go("3:44.12", FadeIn(rl, shift=DOWN * 0.1), run=0.4)
        arr = Arrow([-1.2, 0.1, 0], [0.7, 0.1, 0], buff=0, color=YEL, stroke_width=5, tip_length=0.22)
        self.go("3:45.34", Create(arr), run=0.5)
        sa = Axes(x_range=[-1, 3, 1], y_range=[-1, 4, 1], x_length=3.4, y_length=3.2,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.15, include_ticks=False)).move_to([3.5, 0.1, 0])
        sl = sa.plot(lambda x: 1.2 * x + 0.8, x_range=[-0.9, 2.6], color=BLUE, stroke_width=6)
        self.go("3:46.02", Create(sa), run=0.5)
        self.play(Create(sl), run_time=0.6)
        gl = H("graph", 54, YEL).next_to(sa, DOWN, buff=0.3)
        self.go("3:48.14", Write(gl), run=0.5)
        # the coordinate grid
        self.wipe("3:49.28", run=0.35)
        self.title("The Coordinate Grid", "3:49.70")
        B = grid_board()
        self.go("3:50.20", LaggedStart(*[Create(l) for l in B["lines"]], lag_ratio=0.04), run=1.0)
        self.go("3:51.62", Create(B["xax"]), run=0.8)
        self.go("3:53.08", Write(B["xl"]), FadeIn(B["xn"]), run=0.6)
        self.go("3:55.08", Create(B["yax"]), run=0.8)
        self.go("3:56.08", Write(B["yl"]), FadeIn(B["yn"]), run=0.6)
        # input x -> output y
        inp = VGroup(H("input", 36, DIM), M("x", size=64, color=ORG)).arrange(DOWN, buff=0.1)
        out = VGroup(H("output", 36, DIM), H("?", 60)).arrange(DOWN, buff=0.1)
        VGroup(inp, out).arrange(RIGHT, buff=1.7).move_to([RCX, 1.5, 0])
        ar = Arrow(inp[1].get_right() + RIGHT * 0.2, out[1].get_left() + LEFT * 0.2, buff=0, color=CHALK, stroke_width=4, tip_length=0.2)
        self.go("3:59.38", FadeIn(inp, shift=DOWN * 0.1), run=0.4)
        dx = Dot(gp(3, 0), radius=0.1, color=ORG)
        self.go("3:59.80", FadeIn(dx, scale=0.5), run=0.3)
        guide = DashedLine(gp(3, 0), gp(3, 4), color=DIM, stroke_width=3, dash_length=0.1)
        self.go("4:00.86", Create(guide), Create(ar), FadeIn(out, shift=DOWN * 0.1), run=0.6)
        pt = Dot(gp(3, 4), radius=0.11, color=YEL)
        self.go("4:01.98", FadeIn(pt, scale=0.5), run=0.3)
        yy = M("y", size=64, color=YEL).move_to(out[1])
        self.go("4:04.08", ReplacementTransform(out[1], yy), run=0.5)
        yf = yfx().move_to([RCX, 0.0, 0])
        self.go("4:06.16", Write(yf[0:2]), run=0.5)
        self.go("4:07.54", Write(yf[2]), run=0.5)
        self.go("4:08.30", FadeOut(inp), FadeOut(out[0]), FadeOut(yy), FadeOut(ar), FadeOut(dx), FadeOut(guide), FadeOut(pt), run=0.45)


class K02_Plot(Shot):
    def body(self):
        self.title("The Coordinate Grid", animate=False)
        B = grid_board()
        yf = yfx().move_to([RCX, 0.0, 0])
        self.add(*B.values(), yf)
        self.title("Plotting Points", "4:09.10")
        fx = M(r"f(x)=2x+3", size=64).move_to([RCX, 1.6, 0])
        self.go("4:09.56", ReplacementTransform(yf, fx), run=0.9)
        # the table
        top, step = 0.15, 0.78
        colx = (RCX - 0.8, RCX + 0.8)
        frame = VGroup(Line([RCX, top + 0.35, 0], [RCX, top - 0.4 - 3 * step, 0], color=CHALK, stroke_width=3),
                       Line([RCX - 1.5, top - 0.38, 0], [RCX + 1.5, top - 0.38, 0], color=CHALK, stroke_width=3))
        head = VGroup(M("x", size=54).move_to([colx[0], top, 0]), M("y", size=54, color=YEL).move_to([colx[1], top, 0]))
        self.go("4:12.30", Create(frame), FadeIn(head), run=0.5)
        rows = [(0, 3, "4:12.90", "4:14.10", "4:14.96", "4:15.56"),
                (1, 5, "4:17.86", "4:18.72", "4:19.68", "4:20.22"),
                (2, 7, "4:22.20", "4:23.20", "4:24.02", "4:24.56")]
        dots = VGroup()
        for i, (x, y, tx, ty, tm, tl) in enumerate(rows):
            ry = top - (i + 1) * step - 0.05
            self.go(tx, Write(M(str(x), size=54, color=ORG).move_to([colx[0], ry, 0])), run=0.4)
            self.go(ty, Write(M(str(y), size=54, color=ORG).move_to([colx[1], ry, 0])), run=0.4)
            d = Dot(gp(x, y), radius=0.11, color=ORG).set_z_index(3)
            anims = [FadeIn(d, scale=0.5)]
            if x:
                anims += [Create(DashedLine(gp(x, 0), gp(x, y), color=DIM, stroke_width=3, dash_length=0.1)),
                          Create(DashedLine(gp(0, y), gp(x, y), color=DIM, stroke_width=3, dash_length=0.1))]
            lab = M(f"({x},{y})", size=38, color=ORG).next_to(d, RIGHT, buff=0.18).shift(DOWN * 0.14)
            self.go(tm, *anims, run=0.5)
            self.go(tl, Write(lab), run=0.4)
            dots.add(d)
        line = Line(gp(-1, 1), gp(2.7, 8.4), color=BLUE, stroke_width=6)
        self.go("4:26.20", Create(line), run=1.0)


class K02_VTest(Shot):
    def body(self):
        self.title("A Cool Trick", "4:28.72")
        va = Axes(x_range=[-0.5, 6.5, 1], y_range=[-3, 3, 1], x_length=9, y_length=5,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, include_ticks=False)).move_to([-0.6, -0.75, 0])
        axl = VGroup(M("x", size=40, color=DIM).next_to(va.x_axis.get_end(), RIGHT, buff=0.12),
                     M("y", size=40, color=DIM).next_to(va.y_axis.get_end(), RIGHT, buff=0.12))
        f1 = lambda x: 1.3 * np.sin(1.1 * x) + 0.3
        c1 = va.plot(f1, x_range=[0, 6.2], color=BLUE, stroke_width=6)
        self.go("4:31.72", Create(va), FadeIn(axl), run=0.6)
        self.play(Create(c1), run_time=0.9)
        q = H("a function?", 46, YEL).move_to([5.0, 1.7, 0])
        self.go("4:33.30", Write(q), run=0.6)
        self.title("The Vertical Line Test", "4:34.76")
        self.play(FadeOut(q), run_time=0.3)
        xt = ValueTracker(0.15)
        s = vslider(va, xt, f1, lo=-2.9, hi=2.9)
        self.go("4:37.84", FadeIn(s), run=0.4)
        self.play(xt.animate.set_value(6.1), run_time=3.5, rate_func=linear)
        drop(self, s)
        # a sideways curve: one x, two y's
        c2 = ParametricFunction(lambda t: va.c2p(1 + 0.5 * t * t, t), t_range=[-2.65, 2.65], color=BLUE, stroke_width=6)
        self.go("4:42.86", ReplacementTransform(c1, c2), run=0.8)
        xt.set_value(0.4)
        s = vslider(va, xt, None, lo=-2.9, hi=2.9)
        self.play(FadeIn(s), run_time=0.3)
        self.play(xt.animate.set_value(3.0), run_time=0.7)
        s.clear_updaters()
        d1, d2 = Dot(va.c2p(3, 2), radius=0.12, color=RED), Dot(va.c2p(3, -2), radius=0.12, color=RED)
        self.go("4:44.98", FadeIn(d1, scale=0.5), FadeIn(d2, scale=0.5), run=0.4)
        nf = VGroup(cross_mark(s=0.22), H("not a function", 44, RED)).arrange(RIGHT, buff=0.25).move_to([4.3, 1.7, 0])
        self.go("4:47.16", Create(nf[0]), Write(nf[1]), run=0.6)
        foot = Dot(va.c2p(3, 0), radius=0.11, color=ORG).set_z_index(2)
        one = H("one input", 38, ORG).next_to(foot, DR, buff=0.12)
        self.go("4:49.32", FadeIn(foot, scale=0.5), FadeIn(one, shift=UP * 0.1), run=0.4)
        two = H("two outputs", 38, RED).next_to(d1, LEFT, buff=0.25).shift(UP * 0.2)
        self.go("4:50.36", FadeIn(two, shift=RIGHT * 0.1), run=0.4)


class K02_Shapes(Shot):
    def body(self):
        self.title("The Vertical Line Test", animate=False)
        axs = [Axes(x_range=[-2, 2, 1], y_range=[-2, 2, 1], x_length=3.6, y_length=3.6,
                    axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.15, include_ticks=False)).move_to([cx, 0.15, 0])
               for cx in (-4.55, 0, 4.55)]
        self.play(*[FadeIn(a) for a in axs], run_time=0.35)

        def verdict(ax, ok, word, y=-2.25):
            mark = tick_mark(s=0.42) if ok else cross_mark(s=0.2)
            g = VGroup(mark, H(word, 40, GRN if ok else RED)).arrange(RIGHT, buff=0.2)
            if g.width > 3.4:
                g.width = 3.4
            return g.move_to([ax.get_center()[0], y, 0])

        # 1. a straight slanted line
        f1 = lambda x: 0.75 * x + 0.1
        self.go("4:52.06", Create(axs[0].plot(f1, x_range=[-1.9, 1.9], color=BLUE, stroke_width=5)), run=0.7)
        xt = ValueTracker(-1.75)
        s = vslider(axs[0], xt, f1)
        self.go("4:52.80", FadeIn(s), run=0.3)
        self.play(xt.animate.set_value(1.75), run_time=1.2, rate_func=linear)
        drop(self, s)
        self.go("4:55.26", FadeIn(verdict(axs[0], True, "function"), shift=UP * 0.1), run=0.4)
        # 2. a U-shaped curve
        f2 = lambda x: x * x - 1.5
        self.go("4:56.60", Create(axs[1].plot(f2, x_range=[-1.85, 1.85], color=BLUE, stroke_width=5)), run=0.5)
        xt = ValueTracker(-1.75)
        s = vslider(axs[1], xt, f2)
        self.play(FadeIn(s), run_time=0.25)
        self.play(xt.animate.set_value(1.75), run_time=0.8, rate_func=linear)
        drop(self, s, run=0.2)
        self.go("4:58.40", FadeIn(verdict(axs[1], True, "function"), shift=UP * 0.1), run=0.4)
        # 3. a circle
        ax = axs[2]
        circ = Circle(radius=1.4 * 0.9, color=BLUE, stroke_width=5).move_to(ax.c2p(0, 0))
        self.go("5:00.26", Create(circ), run=0.8)
        xt = ValueTracker(-1.8)
        s = vslider(ax, xt)
        self.go("5:01.62", FadeIn(s), run=0.3)
        self.go("5:02.36", xt.animate.set_value(0), run=0.7)
        s.clear_updaters()
        top, bot = Dot(ax.c2p(0, 1.4), radius=0.12, color=RED), Dot(ax.c2p(0, -1.4), radius=0.12, color=RED)
        self.go("5:04.56", FadeIn(top, scale=0.5), run=0.3)
        self.go("5:05.22", FadeIn(bot, scale=0.5), run=0.3)
        io = H("one input, two outputs", 34, RED)
        io.width = 3.4
        io.move_to([ax.get_center()[0], -2.25, 0])
        self.go("5:05.90", FadeIn(io, shift=UP * 0.1), run=0.4)
        self.go("5:08.08", FadeIn(verdict(ax, False, "not a function", y=-2.95), shift=UP * 0.1), run=0.4)


# ================================================================ Part 3: domain and range

class K02_Domain(Shot):
    def body(self):
        self.title("Domain and Range", "5:12.30")
        mbox = RoundedRectangle(width=3.2, height=1.9, corner_radius=0.25, stroke_color=CHALK, stroke_width=5).move_to([0, 0.7, 0])
        fl = M("f", size=90).move_to(mbox)
        ain = Arrow([-5.2, 0.7, 0], [-1.7, 0.7, 0], buff=0, color=DIM, stroke_width=5, tip_length=0.25)
        aout = Arrow([1.7, 0.7, 0], [5.2, 0.7, 0], buff=0, color=DIM, stroke_width=5, tip_length=0.25)
        self.go("5:12.80", Create(mbox), Write(fl), run=0.6)
        self.play(Create(ain), Create(aout), run_time=0.5)
        dom = H("domain", 54, YEL).move_to([-3.45, -0.35, 0])
        rng = H("range", 54, YEL).move_to([3.45, -0.35, 0])
        self.go("5:15.10", Write(dom), run=0.5)
        self.go("5:15.74", Write(rng), run=0.5)
        dsub = H("allowed inputs", 38).next_to(dom, DOWN, buff=0.2)
        rsub = H("possible outputs", 38).next_to(rng, DOWN, buff=0.2)
        self.go("5:16.96", Circumscribe(dom, color=YEL, buff=0.12), run=0.8)
        self.go("5:18.42", FadeIn(dsub, shift=UP * 0.1), run=0.4)
        n4 = M("4", size=60, color=ORG).move_to([-4.6, 1.3, 0])
        self.go("5:19.48", FadeIn(n4, shift=RIGHT * 0.2), run=0.3)
        self.play(n4.animate.move_to([-1.6, 1.3, 0]).set_opacity(0), run_time=0.6)
        self.remove(n4)
        self.go("5:21.12", Circumscribe(rng, color=YEL, buff=0.12), run=0.8)
        self.go("5:22.36", FadeIn(rsub, shift=UP * 0.1), run=0.4)
        n11 = M("11", size=60, color=ORG).move_to([1.8, 1.3, 0]).set_opacity(0)
        self.add(n11)
        self.go("5:23.18", n11.animate.move_to([4.6, 1.3, 0]).set_opacity(1), run=0.7)
        # 2x + 3 takes anything
        self.go("5:24.60", FadeOut(dom), FadeOut(rng), FadeOut(dsub), FadeOut(rsub), FadeOut(n11), run=0.4)
        self.go("5:25.86", Transform(fl, M(r"2x+3", size=64).move_to(mbox)), run=0.7)
        nums = VGroup()
        for s, x, t in (("7", -4.9, "5:29.50"), ("-3", -3.95, "5:30.38"), ("0", -3.0, "5:31.10"), (r"\tfrac{1}{2}", -2.15, "5:31.76")):
            n = M(s, size=60, color=ORG).move_to([x, 1.45, 0])
            self.go(t, FadeIn(n, shift=DOWN * 0.15), run=0.35)
            nums.add(n)
        self.go("5:32.70", *[n.animate.move_to([-1.6, 1.0, 0]).set_opacity(0) for n in nums], run=0.3)
        self.remove(nums)
        nl, p, labs = nline(-5, 5, y=-1.5, width=11)
        allr = VGroup(ray(p(0), p(-5.6)), ray(p(0), p(5.6)))
        self.go("5:33.02", Create(nl), run=0.6)
        self.go("5:33.68", Create(allr), run=0.6)
        cap = VGroup(H("domain:", 46, YEL), H("all real numbers", 46, GRN)).arrange(RIGHT, buff=0.25).move_to([0, -2.85, 0])
        self.play(FadeIn(cap, shift=UP * 0.1), run_time=0.4)
        # forbidden inputs
        self.wipe("5:35.30", run=0.35)
        sign = VGroup(Circle(radius=0.6, color=RED, stroke_width=8), Line([-0.42, -0.42, 0], [0.42, 0.42, 0], color=RED, stroke_width=8))
        forb = VGroup(sign, H("forbidden inputs", 56, RED)).arrange(RIGHT, buff=0.45).move_to([0, 0.9, 0])
        self.go("5:36.44", Create(sign), Write(forb[1]), run=0.8)
        pills = VGroup(pill("Troublemaker 1", RED, 44), pill("Troublemaker 2", RED, 44)).arrange(RIGHT, buff=1.0).move_to([0, -1.2, 0])
        self.go("5:38.96", LaggedStart(*[FadeIn(x, shift=UP * 0.15) for x in pills], lag_ratio=0.4), run=0.9)


class K02_Divide(Shot):
    def body(self):
        self.title("Troublemaker 1", "5:43.04")
        big = M(r"\frac{6}{0}", size=120).move_to([-1.0, 0.5, 0])
        big[0][2].set_color(RED)
        self.go("5:44.66", Write(big), run=0.8)
        eq = VGroup(M("=", size=120), H("?", 110, RED)).arrange(RIGHT, buff=0.3).next_to(big, RIGHT, buff=0.4)
        nans = H("no answer", 46, RED).next_to(VGroup(big, eq), DOWN, buff=0.5)
        self.go("5:46.60", Circumscribe(big[0][2], color=RED, buff=0.1), run=0.8)
        self.go("5:49.10", Write(eq), FadeIn(nans, shift=UP * 0.1), run=0.6)
        self.wipe("5:50.40", run=0.35)
        fx = M(r"f(x)=\frac{1}{x-2}", size=72).move_to([0, 1.35, 0])
        self.go("5:51.06", Write(fx), run=1.0)
        x2 = M("x=2", size=64, color=ORG).move_to([-3.4, -0.9, 0])
        self.go("5:53.64", Write(x2), run=0.6)
        bx = box(fx[0][7:], YEL, buff=0.1)
        self.go("5:54.82", Create(bx), run=0.5)
        sub = M(r"\frac{1}{2-2}", size=72).move_to([0.6, -0.9, 0])
        self.go("5:55.52", Write(sub), run=0.6)
        sub0 = M(r"\frac{1}{0}", size=72).move_to(sub)
        sub0[0][2].set_color(RED)
        self.go("5:56.80", ReplacementTransform(sub, sub0), FadeOut(bx), run=0.6)
        self.go("5:57.62", Circumscribe(sub0, color=RED, buff=0.15), run=0.8)
        na = VGroup(cross_mark(s=0.22), H("not allowed", 42, RED)).arrange(RIGHT, buff=0.25).next_to(sub0, RIGHT, buff=0.6)
        self.go("5:59.10", Create(na[0]), Write(na[1]), run=0.5)
        self.go("6:00.34", FadeOut(x2), FadeOut(sub0), FadeOut(na), run=0.35)
        nl, p, labs = nline(-2, 6, y=-0.8, width=10)
        self.go("6:00.70", Create(nl), run=0.6)
        rays, hole = except_point(nl, p, 2)
        self.go("6:01.62", Create(rays), run=0.6)
        self.go("6:02.26", FadeIn(hole, scale=0.5), run=0.3)
        ans = M(r"x\neq 2", size=68, color=YEL).move_to([0, -2.6, 0])
        self.go("6:02.60", labs[2].animate.set_color(ORG), Write(ans), run=0.6)


class K02_Root(Shot):
    def body(self):
        self.title("Troublemaker 2", "6:04.04")
        big = M(r"\sqrt{-4}", size=120).move_to([-1.0, 0.7, 0])
        big[0][2:].set_color(RED)
        self.go("6:06.02", Write(big), run=0.9)
        eq = VGroup(M("=", size=120), H("?", 110, RED)).arrange(RIGHT, buff=0.3).next_to(big, RIGHT, buff=0.4)
        self.go("6:11.04", Write(eq), run=0.5)
        nn = M(r"n\times n=-4", size=64).move_to([-0.4, -1.4, 0])
        self.go("6:13.60", Write(nn), run=0.9)
        cr = cross_mark(s=0.24).next_to(nn, RIGHT, buff=0.5)
        self.go("6:15.20", Create(cr), run=0.4)
        self.wipe("6:16.46", run=0.35)
        fx = M(r"f(x)=\sqrt{x-5}", size=72).move_to([0, 1.4, 0])
        self.go("6:17.12", Write(fx), run=1.0)
        bx = box(fx[0][7:], YEL, buff=0.1)
        self.go("6:20.30", Create(bx), run=0.5)
        ineq = M(r"x-5\ge 0", size=72).move_to([0, 0.0, 0])
        self.go("6:22.84", Write(ineq), FadeOut(bx), run=1.0)
        ans = M(r"x\ge 5", size=72, color=YEL).move_to(ineq)
        self.go("6:26.04", ReplacementTransform(ineq, ans), run=0.8)
        nl, p, labs = nline(0, 9, y=-1.9, width=10)
        self.go("6:28.36", Create(nl), run=0.6)
        r, dot = from_point(nl, p, 5)
        self.go("6:29.06", FadeIn(dot, scale=0.5), Create(r), labs[5].animate.set_color(ORG), run=0.7)
        self.go("6:30.10", Create(box(ans, YEL, buff=0.15)), run=0.5)


class K02_Range(Shot):
    def body(self):
        self.title("The Range", "6:31.86")
        ra = Axes(x_range=[-3, 3, 1], y_range=[-1, 8, 1], x_length=5.4, y_length=5.4,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, tick_size=0.06))
        ra.shift(np.array([-3.4, -2.75, 0]) - ra.c2p(0, 0))
        labs = VGroup(*[M(str(k), size=34, color=DIM).next_to(ra.c2p(k, 0), DOWN, buff=0.12) for k in (-2, -1, 1, 2)],
                      *[M(str(k), size=34, color=DIM).next_to(ra.c2p(0, k), LEFT, buff=0.12) for k in (2, 4, 6)],
                      M("x", size=40, color=DIM).next_to(ra.x_axis.get_end(), RIGHT, buff=0.12),
                      M("y", size=40, color=DIM).next_to(ra.y_axis.get_end(), RIGHT, buff=0.12))
        self.go("6:32.40", Create(ra), FadeIn(labs), run=0.6)
        fx = M(r"f(x)=x^2", size=66).move_to([3.5, 1.6, 0])
        self.go("6:33.42", Write(fx), run=0.8)
        par = ra.plot(lambda x: x * x, x_range=[-2.85, 2.85], color=BLUE, stroke_width=6)
        self.go("6:34.74", Create(par), run=1.0)
        for s, y, tw, (px, py), td in ((r"2^2=4", 0.45, "6:38.10", (2, 4), "6:38.92"),
                                       (r"(-2)^2=4", -0.45, "6:39.98", (-2, 4), "6:41.52"),
                                       (r"0^2=0", -1.35, "6:42.56", (0, 0), "6:43.38")):
            self.go(tw, Write(M(s, size=56).move_to([3.5, y, 0])), run=0.7)
            self.go(td, FadeIn(Dot(ra.c2p(px, py), radius=0.11, color=ORG).set_z_index(3), scale=0.5), run=0.3)
        up = Line(ra.c2p(0, 0), ra.c2p(0, 8), color=GRN, stroke_width=10, stroke_opacity=0.9).set_z_index(2)
        self.go("6:44.48", Create(up), run=1.0)
        rl = VGroup(H("range:", 46, YEL), M(r"y\ge 0", size=64, color=YEL)).arrange(RIGHT, buff=0.45).move_to([3.5, -2.65, 0])
        self.go("6:47.12", Write(rl), run=0.8)
        self.go("6:48.80", Create(box(rl[1], YEL, buff=0.15)), run=0.5)


class K02_Questions(Shot):
    def body(self):
        self.title("Domain Practice", "6:52.46")
        q2 = VGroup(H("Question 2", 46, ORG), H("domain of", 44), M(r"f(x)=\frac{3}{x+4}", size=64)).arrange(RIGHT, buff=0.45).move_to([0, 1.0, 0])
        q3 = VGroup(H("Question 3", 46, ORG), H("domain of", 44), M(r"\sqrt{x-1}", size=64)).arrange(RIGHT, buff=0.45)
        q3.move_to([0, -0.9, 0]).align_to(q2, LEFT)
        self.go("6:53.00", FadeIn(q2[0], shift=RIGHT * 0.1), run=0.4)
        self.go("6:54.04", Write(q2[1]), run=0.5)
        self.go("6:54.74", Write(q2[2]), run=1.0)
        self.go("6:57.72", FadeIn(q3[0], shift=RIGHT * 0.1), run=0.4)
        self.go("6:59.44", Write(q3[1]), run=0.5)
        self.go("7:00.22", Write(q3[2]), run=0.9)
        bars = VGroup(*[RoundedRectangle(width=0.22, height=0.7, corner_radius=0.06, stroke_color=YEL, stroke_width=5) for _ in range(2)]).arrange(RIGHT, buff=0.18)
        pz = VGroup(bars, H("Pause now", 50, YEL)).arrange(RIGHT, buff=0.35).move_to([0, -2.7, 0])
        self.go("7:02.64", Create(bars), Write(pz[1]), run=0.7)


class K02_Answers(Shot):
    def body(self):
        self.title("Question 2", "7:04.24")
        fx = M(r"f(x)=\frac{3}{x+4}", size=72).move_to([0, 1.35, 0])
        self.play(Write(fx), run_time=0.8)
        bx = box(fx[0][7:], YEL, buff=0.1)
        self.go("7:05.84", Create(bx), run=0.5)
        e1 = M(r"x+4=0", size=68).move_to([0, -0.05, 0])
        self.go("7:07.50", Write(e1), FadeOut(bx), run=0.9)
        e2 = M(r"x=-4", size=68, color=YEL).move_to(e1)
        self.go("7:10.04", ReplacementTransform(e1, e2), run=0.7)
        nl, p, labs = nline(-7, 1, y=-1.9, width=10)
        self.go("7:11.88", Create(nl), run=0.6)
        rays, hole = except_point(nl, p, -4)
        self.go("7:12.64", Create(rays), run=0.6)
        self.go("7:13.36", FadeIn(hole, scale=0.5), run=0.3)
        e3 = M(r"x\neq -4", size=68, color=YEL).move_to(e1)
        self.go("7:13.84", labs[-4].animate.set_color(ORG), ReplacementTransform(e2, e3), run=0.6)
        # question 3
        self.wipe("7:15.20", run=0.35)
        self.title("Question 3", "7:15.60")
        fx = M(r"f(x)=\sqrt{x-1}", size=72).move_to([0, 1.35, 0])
        self.play(Write(fx), run_time=0.8)
        bx = box(fx[0][7:], YEL, buff=0.1)
        self.go("7:16.98", Create(bx), run=0.5)
        e1 = M(r"x-1\ge 0", size=68).move_to([0, -0.05, 0])
        self.go("7:19.36", Write(e1), FadeOut(bx), run=0.8)
        e2 = M(r"x\ge 1", size=68, color=YEL).move_to(e1)
        self.go("7:21.54", ReplacementTransform(e1, e2), run=0.7)
        nl, p, labs = nline(-2, 7, y=-1.9, width=10)
        self.go("7:23.34", Create(nl), run=0.6)
        r, dot = from_point(nl, p, 1)
        self.go("7:23.96", FadeIn(dot, scale=0.5), Create(r), labs[1].animate.set_color(ORG), run=0.7)
        self.go("7:24.80", Create(box(e2, YEL, buff=0.15)), run=0.5)
