"""Builder 02: Part 2 (the function with a hole, 0/0, the table from both sides, the graph with a hole)
and Part 3 (the limit ignores the value, three cases, practice question 1)."""
from common import *

BOARDC = "#3b3a3e"


# ---------- helpers ----------

def axes(xr, yr, w, h, origin, xn=(), yn=(), num=32, ticks=True):
    """Axes with the data point (0, 0) at `origin`. Returns (ax, {x: label}, {y: label}, group of all labels)."""
    ax = Axes(x_range=xr, y_range=yr, x_length=w, y_length=h,
              axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, tick_size=0.06, include_ticks=ticks))
    ax.shift(np.array([origin[0], origin[1], 0.0]) - ax.c2p(0, 0))
    xl = {k: M(str(k), size=num, color=DIM).next_to(ax.c2p(k, 0), DOWN, buff=0.12) for k in xn}
    yl = {k: M(str(k), size=num, color=DIM).next_to(ax.c2p(0, k), LEFT, buff=0.12) for k in yn}
    names = VGroup(M("x", size=40, color=DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.12),
                   M("y", size=40, color=DIM).next_to(ax.y_axis.get_end(), RIGHT, buff=0.12))
    return ax, xl, yl, VGroup(*xl.values(), *yl.values(), names)


def gapped(ax, f, x0, x1, a, gap=0.1, color=BLUE, width=6):
    """The curve f on [x0, x1] with a small break at x = a (where the hole sits)."""
    return VGroup(ax.plot(f, x_range=[x0, a - gap], color=color, stroke_width=width),
                  ax.plot(f, x_range=[a + gap, x1], color=color, stroke_width=width))


def draw(curve, run=1.0):
    return LaggedStart(*[Create(p) for p in curve], lag_ratio=1, run_time=run)


def hole_at(p, color=BLUE, r=0.13):
    return Circle(radius=r, stroke_color=color, stroke_width=5, fill_color=BOARDC, fill_opacity=1).move_to(p).set_z_index(3)


def sliders(ax, f, a, lo, hi, stop=0.28):
    """Two dots riding the curve toward x = a: BLUE from the left (lo), ORG from the right (hi). Drive t 0 -> 1."""
    t = ValueTracker(0)

    def mk(x0, x1, col):
        def f_():
            x = x0 + (x1 - x0) * t.get_value()
            return Dot(ax.c2p(x, f(x)), radius=0.11, color=col).set_z_index(4)
        return always_redraw(f_)
    return t, VGroup(mk(lo, a - stop, BLUE), mk(hi, a + stop, ORG))


def nline(lo, hi, y, width=10.0):
    """Number line with integer ticks lo..hi (as in Episode 1)."""
    u = width / (hi - lo + 1.2)
    x0 = -width / 2 + 0.6 * u
    p = lambda v: np.array([x0 + (v - lo) * u, y, 0])
    base = DoubleArrow(p(lo - 0.6), p(hi + 0.6), buff=0, color=DIM, stroke_width=3, tip_length=0.2)
    ticks = [Line(p(k) + UP * 0.12, p(k) + DOWN * 0.12, color=DIM, stroke_width=3) for k in range(lo, hi + 1)]
    labs = {k: M(str(k), size=34, color=DIM).next_to(p(k) + DOWN * 0.12, DOWN, buff=0.12) for k in range(lo, hi + 1)}
    return VGroup(base, *ticks, *labs.values()), p, labs


def small_arrow(a, b, color):
    return Arrow(a, b, buff=0, color=color, stroke_width=5, tip_length=0.18, max_tip_length_to_length_ratio=0.5)


# ---------- Part 2 pieces shared between shots ----------

def plug_fx():
    return M("f(x)=", r"\frac{x^2-1}{x-1}", size=72).move_to([0, 1.3, 0])


def dne_group():
    return VGroup(M("f(1)", size=72), H("doesn't exist", 48, RED)).arrange(DOWN, buff=0.3).move_to([-3.4, -1.2, 0])


def mini_graph():
    ax = Axes(x_range=[-1, 3, 1], y_range=[-1, 4, 1], x_length=4.2, y_length=3.6,
              axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.15, include_ticks=False))
    ax.shift(np.array([2.9, -2.6, 0]) - ax.c2p(0, 0))
    line = gapped(ax, lambda x: x + 1, -0.9, 2.7, 1, gap=0.12)
    h = hole_at(ax.c2p(1, 2))
    dash = DashedLine(ax.c2p(1, 0), ax.c2p(1, 2) + DOWN * 0.13, color=DIM, stroke_width=3, dash_length=0.1)
    one = M("1", size=36, color=ORG).next_to(ax.c2p(1, 0), DOWN, buff=0.12)
    return ax, line, h, dash, one


def tables():
    """f(x) at the top and the two tables (left BLUE, right ORG) in their final state."""
    d = dict(fx=M("f(x)=", r"\frac{x^2-1}{x-1}", size=52).move_to([0, 1.75, 0]))
    vals = dict(L=[("0.9", "1.9"), ("0.99", "1.99"), ("0.999", "1.999")],
                R=[("1.1", "2.1"), ("1.01", "2.01"), ("1.001", "2.001")])
    top, step = 0.85, 0.72
    for side, cx, col in (("L", -3.4, BLUE), ("R", 3.4, ORG)):
        c0, c1 = cx - 0.95, cx + 0.95
        frame = VGroup(Line([cx, top + 0.35, 0], [cx, top - 0.4 - 3 * step, 0], color=CHALK, stroke_width=3),
                       Line([cx - 1.9, top - 0.38, 0], [cx + 1.9, top - 0.38, 0], color=CHALK, stroke_width=3))
        head = VGroup(M("x", size=50).move_to([c0, top, 0]), M("f(x)", size=50).move_to([c1, top, 0]))
        if side == "L":
            lab = VGroup(H("from the left", 38, col), small_arrow(ORIGIN, RIGHT * 0.8, col)).arrange(RIGHT, buff=0.2)
        else:
            lab = VGroup(small_arrow(ORIGIN, LEFT * 0.8, col), H("from the right", 38, col)).arrange(RIGHT, buff=0.2)
        lab.move_to([cx + (-0.9 if side == "L" else 0.9), 1.75, 0])
        cells = [(M(a, size=48, color=col).move_to([c0, top - (i + 1) * step - 0.05, 0]),
                  M(b, size=48, color=col).move_to([c1, top - (i + 1) * step - 0.05, 0])) for i, (a, b) in enumerate(vals[side])]
        d[side] = dict(frame=frame, head=head, lab=lab, cells=cells, c1=c1)
    return d


# ================================================================ Part 2: the function with a hole

class K02_Plug(Shot):
    def body(self):
        self.title("A Tricky Function", "2:54.52")
        fx = plug_fx()
        self.go("2:55.98", Write(fx[0]), run=0.5)
        self.go("2:56.94", Write(fx[1][0:4]), run=0.9)
        self.go("2:58.42", Create(fx[1][4]), run=0.4)
        self.go("2:59.44", Write(fx[1][5:]), run=0.6)
        self.remove(*self.board())   # the pieces were added one by one; keep fx as one object so wipe(keep=[fx]) holds it
        self.add(fx)
        x1 = M("x=1", size=64, color=ORG).move_to([-4.6, -1.2, 0])
        self.go("3:01.86", Write(x1), run=0.6)
        # plug in: the top becomes 0, then the bottom becomes 0
        p0 = M("f(1)=", r"\frac{1^2-1}{1-1}", size=72).move_to([0.4, -1.2, 0])
        for m in (p0[0][2], p0[1][0], p0[1][5]):
            m.set_color(ORG)
        self.go("3:03.82", Write(p0), run=1.0)
        top = H("top", 38, DIM).move_to([p0.get_right()[0] + 0.8, p0[1][0:4].get_center()[1], 0])
        bot = H("bottom", 38, DIM).move_to([p0.get_right()[0] + 1.0, p0[1][5:].get_center()[1], 0])
        self.go("3:05.10", FadeIn(top, shift=LEFT * 0.1), run=0.4)
        p1 = M("f(1)=", r"\frac{0}{1-1}", size=72)
        p1.shift(p0[0].get_center() - p1[0].get_center())
        p1[0][2].set_color(ORG); p1[1][2].set_color(ORG)
        self.go("3:07.84", ReplacementTransform(p0, p1), run=0.6)
        self.go("3:08.90", FadeIn(bot, shift=LEFT * 0.1), run=0.4)
        p2 = M("f(1)=", r"\frac{0}{0}", size=72)
        p2.shift(p1[0].get_center() - p2[0].get_center())
        p2[0][2].set_color(ORG)
        self.go("3:11.44", ReplacementTransform(p1, p2), run=0.6)
        self.go("3:13.22", FadeOut(top), FadeOut(bot), p2[1][0].animate.set_color(RED), p2[1][2].animate.set_color(RED), run=0.5)
        self.go("3:14.40", Circumscribe(p2[1], color=RED, buff=0.15), run=0.9)
        self.go("3:16.46", FadeOut(x1), run=0.4)
        # the Episode 1 troublemaker
        pl = pill("Troublemaker 1", RED, 40).move_to([4.4, -0.75, 0])
        self.go("3:17.90", FadeIn(pl, shift=UP * 0.15), run=0.5)
        dz = M(r"\div\, 0", size=64, color=RED).next_to(pl, DOWN, buff=0.35)
        self.go("3:19.80", Write(dz), run=0.5)
        # so f(1) does not exist: a hole
        self.wipe("3:21.38", keep=[fx], run=0.35)
        dne = dne_group()
        self.go("3:21.80", Write(dne[0]), run=0.5)
        self.go("3:22.34", Write(dne[1]), run=0.6)
        ax, line, h, dash, one = mini_graph()
        self.go("3:23.20", Create(ax), draw(line, 0.9), run=0.9)
        self.go("3:24.90", FadeIn(h, scale=0.5), Create(dash), FadeIn(one), run=0.4)
        self.go("3:25.40", Circumscribe(h, shape=Circle, color=YEL, buff=0.08), run=0.8)


class K02_Table(Shot):
    def body(self):
        self.title("A Tricky Function", animate=False)
        fx = plug_fx()
        self.add(fx, dne_group(), *mini_graph())
        self.wipe("3:26.56", keep=[fx], run=0.4)
        # even with no value at 1 we can sneak up on it
        nl, p, labs = nline(-1, 3, y=-1.3, width=9)
        self.go("3:28.84", Create(nl), run=0.7)
        hn = hole_at(p(1), RED, r=0.14)
        self.go("3:30.70", FadeIn(hn, scale=0.5), labs[1].animate.set_color(ORG), run=0.4)
        bl, og = Dot(p(-0.8), radius=0.12, color=BLUE).set_z_index(4), Dot(p(2.8), radius=0.12, color=ORG).set_z_index(4)
        self.go("3:31.90", FadeIn(bl, scale=0.5), FadeIn(og, scale=0.5), run=0.3)
        self.go("3:32.40", bl.animate.move_to(p(0.88)), og.animate.move_to(p(1.12)), run=1.2)
        # the table
        self.wipe("3:34.00", keep=[fx], run=0.35)
        D = tables()
        self.play(ReplacementTransform(fx, D["fx"]), run_time=0.6)
        self.title("Sneak Up on 1", "3:35.50")
        self.play(*[Create(D[s]["frame"]) for s in "LR"], *[FadeIn(D[s]["head"]) for s in "LR"], run_time=0.6)
        self.go("3:36.84", FadeIn(D["L"]["lab"], shift=RIGHT * 0.15), run=0.5)
        times = dict(L=[("3:38.60", "3:40.84"), ("3:42.96", "3:45.42"), ("3:48.20", "3:51.06")],
                     R=[("4:00.54", "4:02.98"), ("4:05.60", "4:08.54")])
        times["R"].insert(0, ("3:56.08", "3:58.24"))
        for s in "LR":
            if s == "R":
                self.go("3:53.96", FadeIn(D["R"]["lab"], shift=LEFT * 0.15), run=0.5)
            for (tx, tf), (cx, cf) in zip(times[s], D[s]["cells"]):
                self.go(tx, Write(cx), run=0.5)
                self.go(tf, Write(cf), run=0.5)


class K02_Lim2(Shot):
    def body(self):
        self.title("Sneak Up on 1", animate=False)
        D = tables()
        self.add(D["fx"])
        for s in "LR":
            self.add(D[s]["frame"], D[s]["head"], D[s]["lab"], *[c for row in D[s]["cells"] for c in row])
        cols = [VGroup(*[row[1] for row in D[s]["cells"]]) for s in "LR"]
        bxs = [SurroundingRectangle(c, color=YEL, buff=0.12, stroke_width=3, corner_radius=0.08) for c in cols]
        self.go("4:12.38", *[Create(b) for b in bxs], run=0.6)
        to2 = [M(r"\to 2", size=56, color=YEL).move_to([D[s]["c1"], -1.95, 0]) for s in "LR"]
        self.go("4:15.30", *[Write(t) for t in to2], run=0.6)
        lim = M(r"\lim_{x\to 1} f(x)", "=", "2", size=56).move_to([-1.6, -3.1, 0])
        lim[2].set_color(GRN)
        self.go("4:16.50", Write(lim[0]), run=0.9)
        self.go("4:18.52", Write(lim[1:]), run=0.4)
        lb = box(lim, GRN, buff=0.18)
        self.play(Create(lb), run_time=0.4)
        dne = VGroup(M("f(1)", size=56), H("doesn't exist", 42, RED)).arrange(RIGHT, buff=0.3).move_to([3.7, -3.1, 0])
        self.go("4:20.50", Write(dne), run=0.8)
        self.go("4:23.28", Circumscribe(VGroup(lim, lb), color=YEL, buff=0.1), run=0.9)
        self.wipe("4:28.40", run=0.35)


class K02_HoleGraph(Shot):
    def body(self):
        self.title("Sneak Up on 1", animate=False)
        self.title("Picture the Graph", "4:29.00")
        ax, xl, yl, labs = axes([-1, 4, 1], [-1, 5, 1], 6.4, 5.0, (-4.2, -2.7), xn=(1, 2, 3), yn=(1, 2, 3, 4))
        self.play(Create(ax), FadeIn(labs), run_time=0.6)
        f = lambda x: x + 1
        line = gapped(ax, f, -0.9, 3.6, 1, gap=0.1)
        self.go("4:30.54", draw(line, 1.0), run=1.0)
        h = hole_at(ax.c2p(1, 2))
        self.go("4:32.06", FadeIn(h, scale=0.5), run=0.4)
        self.go("4:33.44", Circumscribe(h, shape=Circle, color=YEL, buff=0.08), run=0.8)
        gx = DashedLine(ax.c2p(1, 0), ax.c2p(1, 2) + DOWN * 0.13, color=DIM, stroke_width=3, dash_length=0.1)
        self.go("4:34.56", Create(gx), xl[1].animate.set_color(ORG), run=0.5)
        pt = M("(1,2)", size=40, color=ORG).next_to(ax.c2p(1, 2), RIGHT, buff=0.25).shift(DOWN * 0.3)
        self.go("4:35.10", Write(pt), run=0.5)
        # dots run up to the hole from both sides
        t, dots = sliders(ax, f, 1, -0.6, 3.3)
        self.go("4:36.40", FadeIn(dots), run=0.3)
        self.go("4:36.88", t.animate.set_value(1), run=1.2)
        dots.clear_updaters()
        # the limit is the height of the hole
        lim = M(r"\lim_{x\to 1} f(x)", "=", "2", size=56).move_to([4.15, 0.7, 0])
        lim[2].set_color(GRN)
        self.go("4:39.30", Write(lim[0:2]), run=0.7)
        gy = DashedLine(ax.c2p(0, 2), ax.c2p(1, 2) + LEFT * 0.13, color=YEL, stroke_width=4, dash_length=0.1)
        self.go("4:40.16", Create(gy), yl[2].animate.set_color(YEL), run=0.6)
        hh = H("the height of the hole", 40, YEL).move_to([4.15, -0.5, 0])
        self.play(FadeIn(hh, shift=UP * 0.1), run_time=0.4)
        self.go("4:41.32", Write(lim[2]), run=0.4)
        self.play(Create(box(lim, GRN, buff=0.18)), run_time=0.4)
        # why this matters
        self.wipe("4:42.54", run=0.35)
        self.title("Why Limits Matter", "4:43.10")
        der = H("derivatives", 60, PINK).move_to([0, 1.1, 0])
        self.go("4:47.28", Write(der), run=0.6)
        zz = M(r"\frac{0}{0}", size=100, color=RED).move_to([-2.6, -1.0, 0])
        a1 = small_arrow(der.get_bottom() + DOWN * 0.15 + LEFT * 0.6, zz.get_top() + UP * 0.15 + RIGHT * 0.3, DIM)
        self.go("4:48.96", Create(a1), Write(zz), run=0.7)
        a2 = Arrow([-1.5, -1.0, 0], [0.7, -1.0, 0], buff=0, color=GRN, stroke_width=5, tip_length=0.22)
        lw = VGroup(H("limits", 60, GRN), tick_mark(GRN, 0.55)).arrange(RIGHT, buff=0.35).move_to([2.6, -1.0, 0])
        self.go("4:51.66", Create(a2), Write(lw[0]), run=0.6)
        self.go("4:52.30", Create(lw[1]), run=0.4)


# ================================================================ Part 3: the limit ignores the value

def ig_curve(x):
    return 4 + 0.9 * np.sin(1.1 * (x - 2)) - 0.15 * (x - 2) ** 2


class K02_Ignore(Shot):
    def body(self):
        self.title("Limit vs Value", "4:59.02")
        ax, xl, yl, labs = axes([0, 4.5, 1], [0, 8, 1], 5.6, 5.2, (-5.0, -3.2), xn=(1, 2, 3, 4), yn=range(1, 8), num=30)
        self.go("5:02.32", Create(ax), FadeIn(labs), run=0.6)
        vx = DashedLine(ax.c2p(2, 0), ax.c2p(2, 7.6), color=FAINT, stroke_width=3, dash_length=0.1)
        self.go("5:05.40", Create(vx), xl[2].animate.set_color(ORG), run=0.5)
        near = VGroup(small_arrow(ax.c2p(0.7, 0.45), ax.c2p(1.75, 0.45), BLUE), small_arrow(ax.c2p(3.3, 0.45), ax.c2p(2.25, 0.45), ORG))
        self.go("5:08.30", Create(near), run=0.6)
        cv = gapped(ax, ig_curve, 0.25, 4.2, 2, gap=0.09)
        self.go("5:11.08", FadeOut(near), draw(cv, 1.1), run=1.1)
        gy = DashedLine(ax.c2p(0, 4), ax.c2p(2, 4) + LEFT * 0.13, color=YEL, stroke_width=4, dash_length=0.1)
        self.go("5:12.40", Create(gy), yl[4].animate.set_color(YEL), run=0.6)
        h = hole_at(ax.c2p(2, 4))
        self.go("5:15.52", FadeIn(h, scale=0.5), run=0.4)
        d7 = Dot(ax.c2p(2, 7), radius=0.13, color=ORG).set_z_index(3)
        self.go("5:18.34", FadeIn(d7, scale=0.5), yl[7].animate.set_color(ORG), run=0.4)
        f27 = M("f(2)=7", size=64, color=ORG).move_to([3.9, 1.0, 0])
        self.go("5:20.10", Write(f27), run=0.7)
        lim = M(r"\lim_{x\to 2} f(x)", "=", "4", size=60).move_to([3.9, -0.7, 0])
        lim[2].set_color(GRN)
        self.go("5:22.46", Write(lim[0:2]), run=0.9)
        self.go("5:24.92", Write(lim[2]), run=0.4)
        self.play(Create(box(lim, GRN, buff=0.18)), run_time=0.4)
        # the limit only watches the journey
        t, dots = sliders(ax, ig_curve, 2, 0.4, 4.0)
        self.go("5:26.50", FadeIn(dots), run=0.3)
        self.go("5:27.00", t.animate.set_value(1), run=1.2)
        dots.clear_updaters()
        self.go("5:31.00", Circumscribe(d7, shape=Circle, color=ORG, buff=0.1), run=0.8)
        self.wipe("5:33.62", run=0.35)


def case_curve(x):
    return 0.3 + 1.1 * np.sin(0.75 * x)


class K02_Cases(Shot):
    def body(self):
        self.title("Limit vs Value", animate=False)
        a = 0.6
        axs = [axes([-2, 2, 1], [-2, 2.4, 1], 3.8, 4.2, (cx, -0.75), ticks=False)[0] for cx in (-4.55, 0, 4.55)]
        self.go("5:34.20", *[FadeIn(x) for x in axs], run=0.4)
        ya = case_curve(a)
        labs = [H(s, 42, c) for s, c in (("different", ORG), ("the same", GRN), ("no value", RED))]
        for l, x in zip(labs, axs):
            l.move_to([x.get_center()[0], -3.1, 0])
        # 1. limit and value different
        c1 = gapped(axs[0], case_curve, -1.8, 1.8, a, gap=0.12, width=5)
        self.go("5:35.50", draw(c1, 0.8), run=0.8)
        h1, d1 = hole_at(axs[0].c2p(a, ya)), Dot(axs[0].c2p(a, 2.0), radius=0.12, color=ORG).set_z_index(3)
        self.go("5:36.64", FadeIn(h1, scale=0.5), FadeIn(d1, scale=0.5), run=0.4)
        self.go("5:37.46", Write(labs[0]), run=0.5)
        # 2. the same
        c2 = axs[1].plot(case_curve, x_range=[-1.8, 1.8], color=BLUE, stroke_width=5)
        self.go("5:38.10", Create(c2), run=0.6)
        d2 = Dot(axs[1].c2p(a, ya), radius=0.12, color=ORG).set_z_index(3)
        self.play(FadeIn(d2, scale=0.5), Write(labs[1]), run_time=0.5)
        # 3. no value at all
        c3 = gapped(axs[2], case_curve, -1.8, 1.8, a, gap=0.12, width=5)
        self.go("5:39.80", draw(c3, 0.6))
        h3 = hole_at(axs[2].c2p(a, ya))
        self.go("5:40.46", FadeIn(h3, scale=0.5), run=0.4)
        self.go("5:41.30", Write(labs[2]), run=0.5)
        # the limit is the same height every time
        gys = [DashedLine(x.c2p(0, ya), x.c2p(a, ya) + LEFT * 0.13, color=YEL, stroke_width=4, dash_length=0.08) for x in axs]
        self.go("5:43.14", *[Create(g) for g in gys], run=0.6)
        sl = [sliders(x, case_curve, a, -1.6, 1.7, stop=0.35) for x in axs]
        self.play(*[FadeIn(d) for _, d in sl], run_time=0.3)
        self.go("5:44.90", *[t.animate.set_value(1) for t, _ in sl], run=1.1)
        for _, d in sl:
            d.clear_updaters()


def q_curve(x):
    return 3 + 0.9 * np.sin(0.8 * (x - 5))


class K02_Q1(Shot):
    def body(self):
        self.title("Question 1", "5:48.60")
        ax, xl, yl, labs = axes([0, 7, 1], [0, 9, 1], 6.0, 5.2, (-5.3, -3.2), xn=range(1, 7), yn=range(1, 9), num=30)
        self.go("5:50.20", Create(ax), FadeIn(labs), run=0.6)
        cv = gapped(ax, q_curve, 0.4, 6.6, 5, gap=0.1)
        self.play(draw(cv, 1.0))
        gy = DashedLine(ax.c2p(0, 3), ax.c2p(5, 3) + LEFT * 0.13, color=YEL, stroke_width=4, dash_length=0.1)
        self.go("5:51.70", Create(gy), yl[3].animate.set_color(YEL), run=0.6)
        self.go("5:53.18", xl[5].animate.set_color(ORG), run=0.4)
        both = VGroup(small_arrow(ax.c2p(3.7, q_curve(3.7) + 0.9), ax.c2p(4.6, q_curve(4.6) + 0.9), BLUE),
                      small_arrow(ax.c2p(6.3, q_curve(6.3) + 0.9), ax.c2p(5.4, q_curve(5.4) + 0.9), ORG))
        self.go("5:54.34", Create(both), run=0.5)
        h = hole_at(ax.c2p(5, 3))
        self.go("5:56.12", FadeIn(h, scale=0.5), run=0.4)
        d8 = Dot(ax.c2p(5, 8), radius=0.13, color=ORG).set_z_index(3)
        self.go("5:58.10", FadeIn(d8, scale=0.5), run=0.4)
        self.go("5:59.00", yl[8].animate.set_color(ORG), run=0.4)
        q1 = M(r"\lim_{x\to 5} f(x)", "=", size=60)
        q1 = VGroup(q1[0], q1[1], H("?", 64).next_to(q1[1], RIGHT, buff=0.25)).move_to([3.6, 1.0, 0])
        q2 = M("f(5)", "=", size=60)
        q2 = VGroup(q2[0], q2[1], H("?", 64).next_to(q2[1], RIGHT, buff=0.25))
        q2.shift(q1[1].get_center() - q2[1].get_center() + DOWN * 1.6)
        self.go("6:00.66", Write(q1), run=0.9)
        self.go("6:03.52", Write(q2), run=0.7)
        bars = VGroup(*[RoundedRectangle(width=0.2, height=0.62, corner_radius=0.06, stroke_color=YEL, stroke_width=5) for _ in range(2)]).arrange(RIGHT, buff=0.16)
        pz = VGroup(bars, H("Pause and think", 46, YEL)).arrange(RIGHT, buff=0.3).move_to([3.8, -2.5, 0])
        self.go("6:05.00", FadeOut(both), Create(bars), Write(pz[1]), run=0.7)
        # answers
        self.go("6:06.80", FadeOut(pz), run=0.35)
        a1 = M("3", size=60, color=GRN).move_to(q1[2])
        self.go("6:07.40", ReplacementTransform(q1[2], a1), run=0.5)
        self.play(Create(box(VGroup(q1[0:2], a1), GRN, buff=0.18)), run_time=0.4)
        t, dots = sliders(ax, q_curve, 5, 1.2, 6.8)
        self.go("6:09.10", FadeIn(dots), run=0.3)
        self.play(t.animate.set_value(1), run_time=1.2)
        dots.clear_updaters()
        a2 = M("8", size=60, color=GRN).move_to(q2[2])
        self.go("6:12.50", ReplacementTransform(q2[2], a2), run=0.5)
        self.play(Create(box(VGroup(q2[0:2], a2), GRN, buff=0.18)), run_time=0.4)
        self.go("6:14.50", Circumscribe(d8, shape=Circle, color=ORG, buff=0.1), run=0.8)
        ticks = VGroup(tick_mark(GRN, 0.5).next_to(q1, RIGHT, buff=0.45), tick_mark(GRN, 0.5).next_to(q2, RIGHT, buff=0.45))
        self.go("6:16.50", Create(ticks[0]), run=0.4)
        self.go("6:17.72", Create(ticks[1]), run=0.4)
