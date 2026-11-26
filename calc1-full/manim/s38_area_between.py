"""Builder 38: end of Chapter 13 (3:59:01.68 - 4:06:30.75).
Area between curves: the slice (height = top - bottom, width dx) -> integral of top - bottom; find a, b where the curves
cross. Worked: x vs x^2 (1/6), 4 - x^2 vs x + 2 (9/2), x^3 vs x on [-1, 1] (curves switch: 1/4 + 1/4 = 1/2, one integral
wrongly gives 0), horizontal slices: x = y^2 vs x = y + 2 (9/2) and why vertical slices need two parts. Practice:
x^2 vs 2x (4/3) and the average value of 3x^2 on [0, 2] (area 8 pours level into a 2 x 4 rectangle). Then what else
integrals do (volume, arc length, work, centre of mass) and the big idea: slice, one piece, add up.
Colours: first curve BLUE, second curve PURP (curves keep their colour when they switch places), area GRN, negative RED,
crossings / test points ORG, key words YEL.
Whisper fixes: "7 sixth plus 26th" = 7/6 + 20/6, "calculus too" = Calculus 2.
START SEAM: K38_Formula rebuilds K37_Between's last board exactly (title "Area Between Two Curves", same curves, dimmed
region, ORG crossing dots, YEL strip at x = 3.9 with its arrow), then slides the graph left for the formula."""
from common import *


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    """Move a MathTex so its part i (usually '=') sits at (x, y)."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def bval(part, tex, color=ORG, size=40):
    """Brace under a part with a short value below."""
    b = Brace(part, DOWN, buff=0.08, color=color)
    return VGroup(b, M(tex, size=size, color=color).next_to(b, DOWN, buff=0.06))


def colour(m, **c):
    """colour(m, BLUE=[2, 4], PURP=[6]) sets the colour of MathTex parts by index."""
    for name, idx in c.items():
        for i in idx:
            m[i].set_color(globals()[name])
    return m


def slab(ax, f, g, x0, w, color=GRN, op=0.5, sw=2):
    """One vertical slice from g up to f (heights at the midpoint)."""
    xm = x0 + w / 2
    return Polygon(ax.c2p(x0, g(xm)), ax.c2p(x0 + w, g(xm)), ax.c2p(x0 + w, f(xm)), ax.c2p(x0, f(xm)),
                   stroke_color=color, stroke_width=sw, fill_color=color, fill_opacity=op)


def slices(ax, f, g, a, b, n, color=GRN, op=0.45):
    w = (b - a) / n
    return VGroup(*[slab(ax, f, g, a + i * w, w, color, op, max(0.6, min(2.5, 24 / n))) for i in range(n)])


def hslab(ax, R, L, y0, h, color=GRN, op=0.5, sw=2):
    """One horizontal slice from x = L(y) to x = R(y)."""
    ym = y0 + h / 2
    return Polygon(ax.c2p(L(ym), y0), ax.c2p(R(ym), y0), ax.c2p(R(ym), y0 + h), ax.c2p(L(ym), y0 + h),
                   stroke_color=color, stroke_width=sw, fill_color=color, fill_opacity=op)


def hslices(ax, R, L, c, d, n, color=GRN, op=0.45):
    h = (d - c) / n
    return VGroup(*[hslab(ax, R, L, c + i * h, h, color, op, max(0.6, min(2.5, 24 / n))) for i in range(n)])


def band(ax, f, g, a, b, color=GRN, op=0.35, n=80):
    """Region between f (top) and g (bottom) on [a, b]."""
    xs = np.linspace(a, b, n)
    pts = [ax.c2p(x, f(x)) for x in xs] + [ax.c2p(x, g(x)) for x in xs[::-1]]
    return Polygon(*pts, stroke_width=0, fill_color=color, fill_opacity=op)


def hband(ax, R, L, c, d, color=GRN, op=0.35, n=80):
    ys = np.linspace(c, d, n)
    pts = [ax.c2p(R(y), y) for y in ys] + [ax.c2p(L(y), y) for y in ys[::-1]]
    return Polygon(*pts, stroke_width=0, fill_color=color, fill_opacity=op)


def vdash(ax, x, y0, y1, color=ORG):
    return DashedLine(ax.c2p(x, y0), ax.c2p(x, y1), color=color, stroke_width=3, dash_length=0.08)


def side_tick(row, word="on top"):
    """Green tick + short yellow word to the right of a row."""
    t = tick_mark(GRN, 0.45).next_to(row, RIGHT, buff=0.3)
    return VGroup(t, H(word, 34, YEL).next_to(t, RIGHT, buff=0.15))


# ---- board 1: y = x and y = x^2
def ax1():
    ax = axes((0, 1.5, 0.5), (0, 1.5, 0.5), x_length=4.8, y_length=4.4, center=(-3.7, -0.8, 0), num_size=28)
    cx = curve(ax, lambda x: x, [0, 1.4])
    cq = curve(ax, lambda x: x * x, [0, 1.2], color=PURP)
    lx = M("y=x", size=40, color=BLUE).next_to(ax.c2p(1.4, 1.4), RIGHT, buff=0.15)
    lq = M("y=x^2", size=40, color=PURP).next_to(ax.c2p(1.2, 1.44), LEFT, buff=0.15)
    return ax, cx, cq, lx, lq


# ---- board 2: y = 4 - x^2 and y = x + 2
P2 = lambda x: 4 - x * x
L2 = lambda x: x + 2


def ax2():
    ax = axes((-3, 3, 1), (-1, 5, 1), x_length=5.4, y_length=4.6, center=(-3.7, -0.8, 0), num_size=26)
    cp = curve(ax, P2, [-2.2, 2.2])
    cl = curve(ax, L2, [-3, 2.2], color=PURP)
    lp = M("y=4-x^2", size=38, color=BLUE).move_to(ax.c2p(-2.0, 4.4))
    ll = M("y=x+2", size=38, color=PURP).next_to(ax.c2p(2.2, 4.2), RIGHT, buff=0.12)
    return ax, cp, cl, lp, ll


# ---- board 3: y = x^3 and y = x on [-1, 1]
C3 = lambda x: x ** 3
X3 = lambda x: x


def ax3(center=(-3.3, -0.8, 0)):
    ax = axes((-1.5, 1.5, 0.5), (-1.25, 1.25, 0.5), x_length=6.0, y_length=4.6, center=center, nums=False)
    nums = VGroup(M("-1", size=30, color=FAINT).next_to(ax.c2p(-1, 0), UP, buff=0.12),
                  M("1", size=30, color=FAINT).next_to(ax.c2p(1, 0), DOWN, buff=0.12))
    ax.labels.add(nums)
    cc = curve(ax, C3, [-1.07, 1.07])
    cx = curve(ax, X3, [-1.2, 1.2], color=PURP)
    lc = M("y=x^3", size=38, color=BLUE).next_to(ax.c2p(1.07, 1.225), LEFT, buff=0.15)
    lx = M("y=x", size=38, color=PURP).next_to(ax.c2p(1.2, 1.2), RIGHT, buff=0.15)
    return ax, cc, cx, lc, lx


# ---- board 4: x = y^2 and x = y + 2 (horizontal slices)
R4 = lambda y: y + 2
L4 = lambda y: y * y


def ax4():
    ax = axes((-1, 5, 1), (-2, 3, 1), x_length=5.4, y_length=4.5, center=(-3.6, -0.85, 0), num_size=26)
    cp = ax.plot_parametric_curve(lambda t: np.array([t * t, t, 0]), t_range=[-1.6, 2.1], color=BLUE, stroke_width=5)
    cl = ax.plot_parametric_curve(lambda t: np.array([t + 2, t, 0]), t_range=[-1.8, 2.5], color=PURP, stroke_width=5)
    lp = M("x=y^2", size=38, color=BLUE).next_to(ax.c2p(2.56, -1.6), RIGHT, buff=0.15)
    return ax, cp, cl, lp


def line_label4(ax, tex):
    return M(tex, size=38, color=PURP).next_to(ax.c2p(4.5, 2.5), LEFT, buff=0.2)


# ---------------------------------------------------------------- the idea

class K38_Formula(Shot):
    """Slice: height top - bottom, width dx; add them up -> integral of (top - bottom) dx; a, b = where they cross.
    Opens on K37_Between's last board exactly, then slides the graph left to make room for the formula."""
    def body(self):
        self.title("Area Between Two Curves", animate=False)
        F = lambda x: 3.5 - 0.35 * (x - 2.5) ** 2          # builder 37's TOP
        G = lambda x: 1 + 0.3 * (x - 2.5) ** 2             # builder 37's BOT
        A_, B_ = 2.5 - np.sqrt(2.5 / 0.65), 2.5 + np.sqrt(2.5 / 0.65)
        ax = axes((0, 5, 1), (0, 4.5, 1), x_length=8, y_length=4.4, center=(0, -0.75, 0), nums=False)
        cf, cg = curve(ax, F, [0.25, 4.75]), curve(ax, G, [0.25, 4.75], color=PURP)
        lt = H("top", 40, BLUE).move_to(ax.c2p(2.5, F(2.5)) + UP * 0.4)
        lb = H("bottom", 40, PURP).move_to(ax.c2p(2.5, G(2.5)) + DOWN * 0.4)
        reg = band(ax, F, G, A_, B_, op=0.15)
        xd = VGroup(pt(ax, A_, F(A_)), pt(ax, B_, F(B_)))
        x0, SW = 3.9, 0.14
        sl = Polygon(ax.c2p(x0 - SW / 2, G(x0)), ax.c2p(x0 + SW / 2, G(x0)), ax.c2p(x0 + SW / 2, F(x0)),
                     ax.c2p(x0 - SW / 2, F(x0)), stroke_color=YEL, stroke_width=3, fill_color=GRN,
                     fill_opacity=0.7).set_z_index(4)
        up = Arrow(ax.c2p(x0 + 0.22, G(x0)), ax.c2p(x0 + 0.22, F(x0)), buff=0, color=YEL, stroke_width=4,
                   tip_length=0.16).set_z_index(4)
        board = VGroup(ax, ax.labels, reg, cf, cg, lt, lb, xd, sl, up)
        self.add(board)
        # make room on the right
        self.go("3:59:01.70", board.animate.scale(0.74).move_to([-3.45, -0.6, 0]), run=0.55)
        # height
        hb = Brace(sl, LEFT, buff=0.06, color=YEL)
        rh = colour(at_eq(M(r"\text{height}", "=", r"\text{top}", "-", r"\text{bottom}", size=50), 1, 2.6, 1.2),
                    YEL=[0], BLUE=[2], PURP=[4])
        self.go("3:59:02.27", GrowFromCenter(hb), Write(rh[:2]), run=0.6)
        self.go("3:59:03.25", Write(rh[2]), Indicate(lt, color=BLUE, scale_factor=1.1), run=0.5)
        self.go("3:59:04.05", Write(rh[3:]), Indicate(lb, color=PURP, scale_factor=1.1), run=0.6)
        # width
        wb = Brace(sl, DOWN, buff=0.06, color=YEL)
        wl = M("dx", size=40, color=YEL).next_to(wb, DOWN, buff=0.06)
        rw = colour(at_eq(M(r"\text{width}", "=", "dx", size=50), 1, 2.6, 0.05), YEL=[0])
        self.go("3:59:06.15", GrowFromCenter(wb), FadeIn(wl), Write(rw[:2]), run=0.4)
        self.go("3:59:07.09", Write(rw[2]), run=0.3)
        # add them all up
        many = slices(ax, F, G, A_, B_, 12)
        self.go("3:59:08.57", FadeOut(VGroup(hb, wb, wl, sl, up)), LaggedStart(*[FadeIn(m) for m in many], lag_ratio=0.08),
                run=0.7)
        fine = slices(ax, F, G, A_, B_, 40)
        self.go("3:59:09.33", ReplacementTransform(many, fine), run=0.6)
        self.play(reg.animate.set_fill(opacity=0.4), FadeOut(fine), run_time=0.4)
        # the formula
        self.go("3:59:10.71", FadeOut(rh), FadeOut(rw), run=0.4)
        fm = colour(M("A", "=", r"\int_a^b", r"\Big(", r"\text{top}", "-", r"\text{bottom}", r"\Big)", r"\,dx",
                      size=56).move_to([3.4, 1.0, 0]), GRN=[0, 2], BLUE=[4], PURP=[6])
        self.go("3:59:11.31", Write(fm[:2]), run=0.4)
        self.go("3:59:13.27", Write(fm[2]), run=0.6)
        self.go("3:59:15.03", Write(fm[3:8]), run=0.8)
        self.go("3:59:16.39", Write(fm[8]), run=0.4)
        self.play(Create(box(fm, YEL, buff=0.22)), run_time=0.4)
        # a and b are not given
        da, db = vdash(ax, A_, 0, F(A_)), vdash(ax, B_, 0, F(B_))
        la = M(r"a\,?", size=40, color=ORG).next_to(ax.c2p(A_, 0), DOWN, buff=0.12)
        lb2 = M(r"b\,?", size=40, color=ORG).next_to(ax.c2p(B_, 0), DOWN, buff=0.12)
        self.go("3:59:20.03", Create(da), FadeIn(la), run=0.3)
        self.go("3:59:20.37", Create(db), FadeIn(lb2), run=0.4)
        self.go("3:59:22.53", Indicate(xd, color=ORG, scale_factor=1.6), run=0.6)
        eq = colour(at_eq(M(r"\text{top}", "=", r"\text{bottom}", size=52), 1, 3.4, -1.25), BLUE=[0], PURP=[2])
        self.go("3:59:23.49", Write(eq), run=0.6)
        cr = H("where they cross", 34, ORG).next_to(eq, DOWN, buff=0.3)
        la2 = M("a", size=40, color=ORG).move_to(la, aligned_edge=LEFT)
        lb3 = M("b", size=40, color=ORG).move_to(lb2, aligned_edge=LEFT)
        self.go("3:59:24.27", FadeIn(cr, shift=UP * 0.1), ReplacementTransform(la, la2), ReplacementTransform(lb2, lb3),
                run=0.5)


# ---------------------------------------------------------------- example 1: y = x and y = x^2

class K38_XCross(Shot):
    """Where y = x and y = x^2 cross (0 and 1), and which is on top (test x = 1/2)."""
    def body(self):
        self.title("Example 1", "3:59:25.53")
        ax, cx, cq, lx, lq = ax1()
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.6)
        self.go("3:59:27.01", draw(cx, run=0.7), FadeIn(lx), run=0.7)
        self.go("3:59:28.67", draw(cq, run=0.8), FadeIn(lq), run=0.8)
        EX = 2.6
        r1 = colour(at_eq(M("x", "=", "x^2", size=58), 1, EX, 1.5), BLUE=[0], PURP=[2])
        self.go("3:59:32.07", Write(r1), run=0.8)
        r2 = at_eq(M("x^2-x", "=", "0", size=58), 1, EX, 0.4)
        self.go("3:59:34.35", Write(r2), run=1.0)
        r3 = at_eq(M("x(x-1)", "=", "0", size=58), 1, EX, -0.7)
        self.go("3:59:37.05", Write(r3), run=1.0)
        r4 = colour(at_eq(M("x", "=", "0", r"\qquad x=1", size=58), 1, EX, -1.8), ORG=[0, 1, 2, 3])
        p0, p1 = pt(ax, 0, 0), pt(ax, 1, 1)
        self.go("3:59:40.33", Write(r4[:3]), run=0.5)
        self.go("3:59:40.97", FadeIn(p0, scale=0.5), run=0.3)
        self.go("3:59:41.87", Write(r4[3]), run=0.45)
        self.go("3:59:42.43", FadeIn(p1, scale=0.5), run=0.3)
        # which one is on top?
        reg = band(ax, lambda x: x, lambda x: x * x, 0, 1)
        self.go("3:59:43.35", FadeOut(VGroup(r1, r2, r3, r4)), run=0.4)
        self.go("3:59:44.41", FadeIn(reg), run=0.6)
        hd = M(r"x=\frac12", size=56, color=ORG).move_to([EX, 1.8, 0])
        tl = vdash(ax, 0.5, 0, 0.5)
        self.go("3:59:46.59", Create(tl), run=0.4)
        self.go("3:59:47.55", Write(hd), run=0.4)
        t1 = colour(at_eq(M("y=x", r"\to", r"\frac12", size=56), 1, EX, 0.25), BLUE=[0])
        d1 = pt(ax, 0.5, 0.5, color=BLUE)
        self.go("3:59:48.75", Write(t1[0]), run=0.4)
        self.go("3:59:50.11", Write(t1[1:]), FadeIn(d1, scale=0.5), run=0.4)
        t2 = colour(at_eq(M("y=x^2", r"\to", r"\frac14", size=56), 1, EX, -1.3), PURP=[0])
        d2 = pt(ax, 0.5, 0.25, color=PURP)
        self.go("3:59:51.27", Write(t2[0]), run=0.5)
        self.go("3:59:53.13", Write(t2[1:]), FadeIn(d2, scale=0.5), run=0.4)
        tk = side_tick(t1)
        self.go("3:59:54.55", Create(tk[0]), FadeIn(tk[1]), run=0.5)
        self.go("3:59:55.19", Indicate(cx, color=BLUE, scale_factor=1.0), run=0.9)


class K38_XArea(Shot):
    """Integral from 0 to 1 of x - x^2 = 1/2 - 1/3 = 1/6."""
    def body(self):
        self.title("Example 1", animate=False)
        ax, cx, cq, lx, lq = ax1()
        reg = band(ax, lambda x: x, lambda x: x * x, 0, 1)
        self.add(ax, ax.labels, reg, cx, cq, lx, lq)
        EX = 1.4
        r1 = colour(at_eq(M("A", "=", r"\int_0^1", r"\big(", "x", "-", "x^2", r"\big)", r"\,dx", size=56), 1, EX, 1.75),
                    GRN=[0, 2], BLUE=[4], PURP=[6])
        self.go("3:59:57.09", Write(r1[:2]), run=0.4)
        self.go("3:59:58.37", Write(r1[2]), run=0.6)
        self.go("4:00:00.27", Write(r1[3:]), run=1.0)
        r2 = at_eq(M("=", r"\Big[\frac{x^2}{2}-\frac{x^3}{3}\Big]_0^1", size=56), 0, EX, 0.3)
        self.go("4:00:01.75", Write(r2[0]), run=0.3)
        self.go("4:00:03.19", Write(r2[1]), run=2.0)
        r3 = at_eq(M("=", r"\Big(\frac12-\frac13\Big)", "-", "0", size=56), 0, EX, -1.15)
        self.go("4:00:07.33", Write(r3[:2]), run=1.6)
        b1 = bval(r3[1], r"\frac16")
        self.go("4:00:09.59", GrowFromCenter(b1[0]), FadeIn(b1[1]), run=0.4)
        self.go("4:00:11.05", Write(r3[2:]), run=0.5)
        r4 = colour(at_eq(M(r"=\;", r"\frac16", size=60), 0, EX, -3.0), GRN=[1])
        self.go("4:00:13.29", Write(r4), run=0.4)
        self.play(Create(answer_box(r4[1])), reg.animate.set_fill(opacity=0.6), run_time=0.4)


# ---------------------------------------------------------------- example 2: 4 - x^2 and x + 2

class K38_ParabSetup(Shot):
    """Crossings at x = -2 and 1; test x = 0: the parabola is on top."""
    def body(self):
        self.title("Example 2", "4:00:14.71")
        ax, cp, cl, lp, ll = ax2()
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.6)
        self.go("4:00:16.93", draw(cp, run=0.9), FadeIn(lp), run=0.9)
        self.go("4:00:20.29", draw(cl, run=0.9), FadeIn(ll), run=0.9)
        EX = 3.3
        r1 = colour(at_eq(M("4-x^2", "=", "x+2", size=56), 1, EX, 1.5), BLUE=[0], PURP=[2])
        self.go("4:00:24.33", Write(r1), run=1.2)
        r2 = at_eq(M("x^2+x-2", "=", "0", size=56), 1, EX, 0.4)
        self.go("4:00:28.67", Write(r2), run=1.4)
        r3 = at_eq(M("(x+2)(x-1)", "=", "0", size=56), 1, EX, -0.7)
        self.go("4:00:32.85", Write(r3), run=1.2)
        r4 = colour(at_eq(M("x", "=", "-2", r"\qquad x=1", size=56), 1, EX, -1.8), ORG=[0, 1, 2, 3])
        q1, q2 = pt(ax, -2, 0), pt(ax, 1, 3)
        self.go("4:00:35.73", Write(r4[:3]), run=0.6)
        self.go("4:00:36.43", FadeIn(q1, scale=0.5), run=0.3)
        self.go("4:00:37.15", Write(r4[3]), run=0.4)
        self.go("4:00:37.59", FadeIn(q2, scale=0.5), run=0.3)
        # which is on top?
        reg = band(ax, P2, L2, -2, 1)
        self.go("4:00:38.29", FadeOut(VGroup(r1, r2, r3, r4)), run=0.4)
        self.play(FadeIn(reg), run_time=0.6)
        hd = M("x=0", size=56, color=ORG).move_to([EX, 1.6, 0])
        self.go("4:00:39.73", Write(hd), run=0.5)
        t1 = colour(at_eq(M("4-x^2", r"\to", "4", size=56), 1, EX, 0.3), BLUE=[0])
        d1 = pt(ax, 0, 4, color=BLUE)
        self.go("4:00:41.37", Write(t1[0]), run=0.45)
        self.go("4:00:41.93", Write(t1[1:]), FadeIn(d1, scale=0.5), run=0.4)
        t2 = colour(at_eq(M("x+2", r"\to", "2", size=56), 1, EX, -1.0), PURP=[0])
        d2 = pt(ax, 0, 2, color=PURP)
        self.go("4:00:42.89", Write(t2[0]), run=0.3)
        self.go("4:00:43.21", Write(t2[1:]), FadeIn(d2, scale=0.5), run=0.4)
        tk = side_tick(t1)
        self.go("4:00:44.63", Create(tk[0]), FadeIn(tk[1]), run=0.5)
        self.go("4:00:45.20", Indicate(cp, color=BLUE, scale_factor=1.0), run=0.9)


class K38_ParabInt(Shot):
    """Top minus bottom = 2 - x - x^2; integral from -2 to 1 and its antiderivative."""
    def body(self):
        self.title("Example 2", animate=False)
        EX = -0.6
        r1 = colour(at_eq(M(r"\text{top}", "-", r"\text{bottom}", "=", r"(4-x^2)", "-", r"(x+2)", size=58), 3, EX, 1.6),
                    BLUE=[0, 4], PURP=[2, 6])
        self.play(Write(r1[:3]), run_time=0.6)
        self.go("4:00:48.03", Write(r1[3:5]), run=0.9)
        self.go("4:00:49.41", Write(r1[5:]), run=0.9)
        r2 = at_eq(M("=", "2-x-x^2", size=58), 0, EX, 0.45)
        self.go("4:00:51.79", Write(r2[0]), run=0.3)
        self.go("4:00:52.19", Write(r2[1]), run=1.2)
        r3 = colour(at_eq(M("A", "=", r"\int_{-2}^{1}", r"\big(2-x-x^2\big)", r"\,dx", size=58), 1, EX, -0.85),
                    GRN=[0, 2])
        self.go("4:00:54.97", Write(r3[:3]), run=0.55)
        self.go("4:00:55.59", Write(r3[3:]), run=0.9)
        r4 = at_eq(M("=", r"\Big[2x-\frac{x^2}{2}-\frac{x^3}{3}\Big]_{-2}^{1}", size=58), 0, EX, -2.4)
        self.go("4:00:56.95", Write(r4[0]), run=0.3)
        self.go("4:00:58.69", Write(r4[1]), run=2.6)


class K38_ParabEval(Shot):
    """F(1) = 7/6, F(-2) = -10/3, A = 7/6 + 20/6 = 27/6 = 9/2."""
    def body(self):
        self.title("Example 2", animate=False)
        EX = -1.0
        r0 = at_eq(M("F(x)", "=", r"2x-\frac{x^2}{2}-\frac{x^3}{3}", size=54), 1, EX, 1.85)
        self.add(r0)
        r1 = colour(at_eq(M("F(1)", "=", r"2-\frac12-\frac13", "=", r"\frac76", size=54), 1, EX, 0.35), ORG=[4])
        self.go("4:01:03.41", Write(r1[:2]), run=0.4)
        self.go("4:01:04.63", Write(r1[2]), run=1.3)
        self.go("4:01:07.31", Write(r1[3:]), run=0.45)
        r2 = at_eq(M("F(-2)", "=", "-4", r"-\frac{4}{2}", r"-\frac{-8}{3}", size=54), 1, EX, -1.15)
        self.go("4:01:08.55", Write(r2[:2]), run=0.4)
        self.go("4:01:09.73", Write(r2[2]), run=0.35)
        self.go("4:01:10.47", Write(r2[3]), run=0.6)
        b1 = bval(r2[3], "-2")
        self.go("4:01:12.21", GrowFromCenter(b1[0]), FadeIn(b1[1]), run=0.4)
        self.go("4:01:13.17", Write(r2[4]), run=0.8)
        b2 = bval(r2[4], r"+\frac83")
        self.go("4:01:15.49", GrowFromCenter(b2[0]), FadeIn(b2[1]), run=0.4)
        r3 = colour(at_eq(M("=", r"-6+\frac83", "=", r"-\frac{10}{3}", size=54), 0, EX, -3.1), ORG=[3])
        self.go("4:01:17.19", Write(r3[:2]), run=1.0)
        self.go("4:01:19.55", Write(r3[2:]), run=0.5)
        # A = F(1) - F(-2)
        f1 = colour(at_eq(M("A", "=", r"\frac76", "-", r"\left(-\frac{10}{3}\right)", size=58), 1, EX, 0.35),
                    GRN=[0], ORG=[2, 4])
        rest = VGroup(r1[:4], r2, b1, b2, r3[:3])
        self.go("4:01:21.13", FadeOut(rest), run=0.35)
        self.play(ReplacementTransform(r1[4], f1[2]), ReplacementTransform(r3[3], f1[4]), Write(f1[0:2]), Write(f1[3]),
                  run_time=0.8)
        f2 = at_eq(M("=", r"\frac76", "+", r"\frac{20}{6}", size=58), 0, EX, -1.2)
        self.go("4:01:24.11", Write(f2), run=1.0)
        f3 = colour(at_eq(M("=", r"\frac{27}{6}", r"=\;", r"\frac92", size=58), 0, EX, -2.75), GRN=[3])
        self.go("4:01:26.25", Write(f3[:2]), run=0.6)
        self.go("4:01:29.19", Write(f3[2:]), run=0.4)
        self.play(Create(answer_box(f3[3])), run_time=0.4)


# ---------------------------------------------------------------- example 3: curves that switch places

class K38_Switch(Shot):
    """Curves cross mid-interval and swap; y = x^3 and y = x cross at -1, 0, 1."""
    def body(self):
        self.title("When Curves Switch", "4:01:30.71")
        ax, cc, cx, lc, lx = ax3()
        self.go("4:01:31.30", Create(ax), FadeIn(ax.labels), run=0.6)
        self.go("4:01:32.69", draw(cc, run=0.9), draw(cx, run=0.9), run=0.9)
        o = pt(ax, 0, 0)
        self.go("4:01:33.75", FadeIn(o, scale=0.5), run=0.4)
        # a slice sweeps across: which curve is on top flips at 0
        xt = ValueTracker(-0.85)
        seg_ = always_redraw(lambda: Line(ax.c2p(xt.get_value(), min(C3(xt.get_value()), xt.get_value())),
                                          ax.c2p(xt.get_value(), max(C3(xt.get_value()), xt.get_value())),
                                          color=GRN, stroke_width=7))
        top_dot = always_redraw(lambda: Dot(ax.c2p(xt.get_value(), max(C3(xt.get_value()), xt.get_value())),
                                            radius=0.08, color=YEL).set_z_index(6))
        ot = H("on top:", 40, DIM).move_to([2.0, 0.6, 0])
        who = always_redraw(lambda: (M("y=x^3", size=50, color=BLUE) if xt.get_value() < 0 else
                                     M("y=x", size=50, color=PURP)).next_to(ot, RIGHT, buff=0.3))
        self.go("4:01:35.59", FadeIn(seg_), FadeIn(top_dot), FadeIn(ot), FadeIn(who), run=0.3)
        self.play(xt.animate.set_value(0.85), run_time=3.0)
        self.go("4:01:39.10", FadeOut(VGroup(seg_, top_dot, ot, who)), run=0.4)
        # the example
        self.go("4:01:41.99", Write(lc), run=0.6)
        self.go("4:01:43.81", Write(lx), run=0.5)
        dl, dr = vdash(ax, -1, 0, -1), vdash(ax, 1, 0, 1)
        self.go("4:01:45.39", Create(dl), ax.labels[-1][0].animate.set_color(ORG), run=0.4)
        self.go("4:01:46.03", Create(dr), ax.labels[-1][1].animate.set_color(ORG), run=0.4)
        EX = 3.4
        r1 = colour(at_eq(M("x^3", "=", "x", size=58), 1, EX, 1.5), BLUE=[0], PURP=[2])
        self.go("4:01:47.97", Write(r1), run=0.7)
        r2 = at_eq(M("x(x^2-1)", "=", "0", size=58), 1, EX, 0.3)
        self.go("4:01:50.11", Write(r2), run=1.2)
        r3 = colour(at_eq(M("x", "=", "-1", r",\ 0", r",\ 1", size=58), 1, EX, -1.0), ORG=[0, 1, 2, 3, 4])
        qa, qb = pt(ax, -1, -1), pt(ax, 1, 1)
        self.go("4:01:53.63", Write(r3[:3]), FadeIn(qa, scale=0.5), run=0.5)
        self.go("4:01:54.55", Write(r3[3]), Indicate(o, color=ORG), run=0.4)
        self.go("4:01:55.31", Write(r3[4]), FadeIn(qb, scale=0.5), run=0.4)


class K38_SwitchTest(Shot):
    """Test -1/2: x^3 on top; test 1/2: x on top; so two integrals A1 + A2."""
    def body(self):
        self.title("When Curves Switch", animate=False)
        ax, cc, cx, lc, lx = ax3()
        for m in ax.labels[-1]:
            m.set_color(ORG)
        dots = VGroup(pt(ax, -1, -1), pt(ax, 0, 0), pt(ax, 1, 1))
        dl, dr = vdash(ax, -1, 0, -1), vdash(ax, 1, 0, 1)
        self.add(ax, ax.labels, dl, dr, cc, cx, lc, lx, dots)
        EX = 3.4
        # left half
        tl = vdash(ax, -0.5, 0, -0.5)
        hd = M(r"x=-\frac12", size=56, color=ORG).move_to([EX, 1.8, 0])
        self.go("4:01:58.11", Create(tl), Write(hd), run=0.6)
        t1 = colour(at_eq(M("x^3", "=", r"-\frac18", size=56), 1, EX, 0.25), BLUE=[0])
        d1 = pt(ax, -0.5, -0.125, color=BLUE)
        self.go("4:01:59.93", Write(t1[0]), run=0.35)
        self.go("4:02:00.99", Write(t1[1:]), FadeIn(d1, scale=0.5), run=0.45)
        t2 = colour(at_eq(M("x", "=", r"-\frac12", size=56), 1, EX, -1.3), PURP=[0])
        d2 = pt(ax, -0.5, -0.5, color=PURP)
        self.go("4:02:02.45", Write(t2[0]), run=0.3)
        self.go("4:02:03.15", Write(t2[1:]), FadeIn(d2, scale=0.5), run=0.45)
        cmp1 = colour(M(r"-\frac18", ">", r"-\frac12", size=56).move_to([EX, -2.75, 0]), BLUE=[0], PURP=[2])
        self.go("4:02:04.91", Write(cmp1), run=0.7)
        regL = band(ax, C3, X3, -1, 0)
        self.go("4:02:07.29", FadeIn(regL), Indicate(lc, color=BLUE), run=0.8)
        # right half
        self.go("4:02:09.51", FadeOut(VGroup(tl, hd, t1, t2, d1, d2, cmp1)), run=0.4)
        tr = vdash(ax, 0.5, 0, 0.5)
        hd2 = M(r"x=\frac12", size=56, color=ORG).move_to([EX, 1.8, 0])
        self.go("4:02:11.09", Create(tr), Write(hd2), run=0.5)
        u1 = colour(at_eq(M("x^3", "=", r"\frac18", size=56), 1, EX, 0.25), BLUE=[0])
        e1 = pt(ax, 0.5, 0.125, color=BLUE)
        self.go("4:02:12.55", Write(u1[0]), run=0.3)
        self.go("4:02:13.21", Write(u1[1:]), FadeIn(e1, scale=0.5), run=0.4)
        u2 = colour(at_eq(M("x", "=", r"\frac12", size=56), 1, EX, -1.3), PURP=[0])
        e2 = pt(ax, 0.5, 0.5, color=PURP)
        self.go("4:02:14.43", Write(u2[0]), run=0.2)
        self.go("4:02:14.63", Write(u2[1:]), FadeIn(e2, scale=0.5), run=0.4)
        cmp2 = colour(M(r"\frac12", ">", r"\frac18", size=56).move_to([EX, -2.75, 0]), PURP=[0], BLUE=[2])
        regR = band(ax, X3, C3, 0, 1)
        self.go("4:02:16.05", Write(cmp2), run=0.5)
        self.play(FadeIn(regR), Indicate(lx, color=PURP), run_time=0.8)
        # two integrals
        self.go("4:02:17.73", FadeOut(VGroup(tr, hd2, u1, u2, e1, e2, cmp2)), run=0.4)
        a1 = M("A_1", size=44, color=GRN).move_to(ax.c2p(-0.55, 0.4))
        a2 = M("A_2", size=44, color=GRN).move_to(ax.c2p(0.55, -0.4))
        self.go("4:02:18.33", FadeIn(a1, shift=DOWN * 0.1), run=0.3)
        self.go("4:02:18.61", FadeIn(a2, shift=UP * 0.1), run=0.3)
        tot = colour(M("A", "=", "A_1", "+", "A_2", size=62).move_to([EX, 0.4, 0]), GRN=[0, 2, 4])
        self.go("4:02:18.97", Write(tot), run=0.8)


class K38_TwoInts(Shot):
    """A1 = integral -1..0 of x^3 - x = 1/4, A2 = integral 0..1 of x - x^3 = 1/4, total 1/2."""
    def body(self):
        self.title("When Curves Switch", animate=False)
        div = DashedLine([0, 2.2, 0], [0, -2.5, 0], color=FAINT, stroke_width=2, dash_length=0.1)
        self.add(div)
        S = 48
        XL, XR = -4.4, 2.5
        Y1, Y2, Y3 = 1.75, 0.4, -1.0
        l1 = colour(at_eq(M("A_1", "=", r"\int_{-1}^{0}", r"\big(", "x^3", "-", "x", r"\big)", r"\,dx", size=S),
                          1, XL, Y1), GRN=[0, 2], BLUE=[4], PURP=[6])
        self.go("4:02:20.79", Write(l1[:3]), run=0.7)
        self.go("4:02:22.53", Write(l1[3:]), run=0.9)
        l2 = at_eq(M("=", r"\Big[\frac{x^4}{4}-\frac{x^2}{2}\Big]_{-1}^{0}", size=S), 0, XL, Y2)
        self.go("4:02:24.69", Write(l2[0]), run=0.3)
        self.go("4:02:26.09", Write(l2[1]), run=2.4)
        l3 = at_eq(M("=", "0", "-", r"\Big(\frac14-\frac12\Big)", size=S), 0, XL, Y3)
        self.go("4:02:30.41", Write(l3[:2]), run=0.5)
        self.go("4:02:32.33", Write(l3[2:]), run=1.6)
        l3b = M(r"\Big(-\frac14\Big)", size=S, color=ORG).move_to(l3[3], aligned_edge=LEFT)
        self.go("4:02:35.27", ReplacementTransform(l3[3], l3b), run=0.6)
        l4 = colour(M(r"=\;", r"\frac14", size=S), GRN=[1]).next_to(l3b, RIGHT, buff=0.2)
        self.go("4:02:39.61", Write(l4), run=0.3)
        self.play(Create(answer_box(l4[1])), run_time=0.3)
        # right column
        r1 = colour(at_eq(M("A_2", "=", r"\int_{0}^{1}", r"\big(", "x", "-", "x^3", r"\big)", r"\,dx", size=S),
                          1, XR, Y1), GRN=[0, 2], PURP=[4], BLUE=[6])
        self.go("4:02:40.95", Write(r1[:3]), run=0.6)
        self.go("4:02:42.51", Write(r1[3:]), run=0.9)
        r2 = at_eq(M("=", r"\Big[\frac{x^2}{2}-\frac{x^4}{4}\Big]_{0}^{1}", size=S), 0, XR, Y2)
        self.go("4:02:44.33", Write(r2[0]), run=0.3)
        self.go("4:02:45.51", Write(r2[1]), run=2.4)
        r3 = at_eq(M("=", r"\Big(\frac12-\frac14\Big)", "-", "0", size=S), 0, XR, Y3)
        self.go("4:02:49.43", Write(r3[:2]), run=1.4)
        r3b = M(r"\frac14", size=S, color=ORG).next_to(r3[0], RIGHT, buff=0.2)
        r3[2:].next_to(r3b, RIGHT, buff=0.15)
        self.go("4:02:51.81", ReplacementTransform(r3[1], r3b), run=0.6)
        self.go("4:02:52.77", Write(r3[2:]), run=0.4)
        r4 = colour(M(r"=\;", r"\frac14", size=S), GRN=[1]).next_to(r3[3], RIGHT, buff=0.2)
        self.go("4:02:54.13", Write(r4), run=0.3)
        self.play(Create(answer_box(r4[1])), run_time=0.3)
        tot = colour(M("A", "=", r"\frac14", "+", r"\frac14", r"=\;", r"\frac12", size=56).move_to([0, -2.75, 0]),
                     GRN=[0, 6])
        self.go("4:02:55.31", FadeOut(div), Write(tot[:5]), run=0.8)
        self.go("4:02:56.41", Write(tot[5:]), run=0.4)
        self.play(Create(answer_box(tot[6])), run_time=0.3)


class K38_OneGo(Shot):
    """One integral of x^3 - x from -1 to 1 gives 0: +1/4 and -1/4 cancel. Wrong: the area is really there."""
    def body(self):
        self.title("When Curves Switch", animate=False)
        ax, cc, cx, lc, lx = ax3()
        regL = band(ax, C3, X3, -1, 0)
        regR = band(ax, X3, C3, 0, 1)
        self.add(ax, ax.labels, regL, regR, cc, cx, lc, lx)
        g = M(r"\int_{-1}^{1}", r"\big(x^3-x\big)", r"\,dx", "=", "0", size=58).move_to([3.4, 1.2, 0])
        g[0].set_color(GRN)
        self.go("4:02:58.09", Write(g[:3]), run=1.4)
        self.go("4:03:02.79", Write(g[3:]), run=0.4)
        pl = M(r"+\frac14", size=46, color=GRN).move_to(ax.c2p(-0.55, 0.42))
        mi = M(r"-\frac14", size=46, color=RED).move_to(ax.c2p(0.55, -0.42))
        self.go("4:03:03.33", FadeIn(pl, shift=DOWN * 0.1), run=0.4)
        self.go("4:03:04.19", regR.animate.set_fill(RED, 0.4), FadeIn(mi, shift=UP * 0.1), run=0.5)
        st = strike(g[4])
        x_ = cross_mark(s=0.25).next_to(g, RIGHT, buff=0.35)
        self.go("4:03:06.19", Create(st), Create(x_), run=0.4)
        mi2 = M(r"+\frac14", size=46, color=GRN).move_to(mi)
        self.go("4:03:07.93", regR.animate.set_fill(GRN, 0.45), regL.animate.set_fill(GRN, 0.45),
                ReplacementTransform(mi, mi2), run=0.6)
        chk = H("check: do they switch?", 42, YEL).move_to([3.4, -1.0, 0])
        self.go("4:03:09.75", FadeIn(chk, shift=UP * 0.1), run=0.5)
        self.play(Create(brush_line(chk.width + 0.3, center=chk.get_bottom() + DOWN * 0.1)), run_time=0.5)


# ---------------------------------------------------------------- horizontal slices

class K38_Horiz(Shot):
    """Slice sideways when x is a function of y: area = integral of (right - left) dy."""
    def body(self):
        self.title("Slicing Sideways", "4:03:12.27")
        v = Rectangle(width=0.55, height=2.6, stroke_color=GRN, stroke_width=3, fill_color=GRN, fill_opacity=0.45)
        v.move_to([0, -0.4, 0])
        vl = M("dx", size=44, color=YEL).next_to(v, DOWN, buff=0.2)
        self.go("4:03:12.99", FadeIn(v), FadeIn(vl), run=0.4)
        hrect = Rectangle(width=2.6, height=0.55, stroke_color=GRN, stroke_width=3, fill_color=GRN, fill_opacity=0.45)
        hrect.move_to([0, -0.4, 0])
        hl = M("dy", size=44, color=YEL).next_to(hrect, RIGHT, buff=0.2)
        self.go("4:03:14.43", ReplacementTransform(v, hrect), ReplacementTransform(vl, hl), run=0.8)
        ax, cp, cl, lp = ax4()
        self.go("4:03:15.91", FadeOut(VGroup(hrect, hl)), run=0.4)
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.6)
        self.go("4:03:19.71", draw(cp, run=0.9), Write(lp), run=0.9)
        self.go("4:03:21.91", draw(cl, run=0.8), run=0.8)
        yt = ValueTracker(0.4)
        sl = always_redraw(lambda: hslab(ax, R4, L4, yt.get_value() - 0.15, 0.3, op=0.55))
        self.go("4:03:22.77", FadeIn(sl), run=0.4)
        self.play(yt.animate.set_value(1.5), run_time=0.8)
        self.play(yt.animate.set_value(0.4), run_time=0.8)
        dl = pt(ax, L4(0.4), 0.4, color=BLUE)
        dr = pt(ax, R4(0.4), 0.4, color=PURP)
        wl = H("left", 34, BLUE).next_to(dl, UL, buff=0.12)
        wr = H("right", 34, PURP).next_to(dr, DR, buff=0.12)
        self.go("4:03:25.67", FadeIn(dl, scale=0.5), FadeIn(wl), run=0.4)
        self.go("4:03:26.71", FadeIn(dr, scale=0.5), FadeIn(wr), run=0.4)
        fm = colour(M("A", "=", r"\int_c^d", r"\Big(", r"\text{right}", "-", r"\text{left}", r"\Big)", r"\,dy",
                      size=56).move_to([3.5, 0.6, 0]), GRN=[0, 2], PURP=[4], BLUE=[6])
        self.go("4:03:28.29", Write(fm[:2]), run=0.4)
        self.go("4:03:29.13", Write(fm[2]), run=0.6)
        self.go("4:03:31.55", Write(fm[3:8]), run=0.8)
        self.go("4:03:33.31", Write(fm[8]), run=0.4)
        self.play(Create(box(fm, YEL, buff=0.22)), run_time=0.4)


class K38_YSetup(Shot):
    """x = y^2 and y = x - 2: the line as x = y + 2, crossings y = 2 and -1, the line is on the right."""
    def body(self):
        self.title("Example 3", "4:03:34.49")
        ax, cp, cl, lp = ax4()
        self.add(ax, ax.labels, cp, cl, lp)
        self.go("4:03:35.95", Circumscribe(lp, color=BLUE, buff=0.1), run=0.8)
        ll = line_label4(ax, "y=x-2")
        self.go("4:03:38.41", Write(ll), run=0.7)
        EX = 3.4
        r1 = at_eq(M("y", "=", "x-2", size=58), 1, EX, 1.5)
        self.go("4:03:41.81", Write(r1), run=0.7)
        r2 = colour(at_eq(M("x", "=", "y+2", size=58), 1, EX, 0.4), PURP=[0, 1, 2])
        ll2 = line_label4(ax, "x=y+2")
        self.go("4:03:44.97", Write(r2), run=0.7)
        self.play(ReplacementTransform(ll, ll2), run_time=0.6)
        self.go("4:03:47.55", FadeOut(VGroup(r1, r2)), run=0.4)
        s1 = colour(at_eq(M("y^2", "=", "y+2", size=58), 1, EX, 1.5), BLUE=[0], PURP=[2])
        self.go("4:03:48.49", Write(s1), run=1.0)
        s2 = at_eq(M("y^2-y-2", "=", "0", size=58), 1, EX, 0.4)
        self.go("4:03:51.31", Write(s2), run=1.4)
        s3 = at_eq(M("(y-2)(y+1)", "=", "0", size=58), 1, EX, -0.7)
        self.go("4:03:55.45", Write(s3), run=1.2)
        s4 = colour(at_eq(M("y", "=", "2", r"\qquad y=-1", size=58), 1, EX, -1.8), ORG=[0, 1, 2, 3])
        q1, q2 = pt(ax, 4, 2), pt(ax, 1, -1)
        self.go("4:03:58.69", Write(s4[:3]), run=0.5)
        self.go("4:03:59.39", FadeIn(q1, scale=0.5), run=0.3)
        self.go("4:04:00.45", Write(s4[3]), run=0.6)
        self.go("4:04:01.47", FadeIn(q2, scale=0.5), run=0.3)
        # which is on the right?
        reg = hband(ax, R4, L4, -1, 2)
        self.go("4:04:02.57", FadeOut(VGroup(s1, s2, s3, s4)), run=0.4)
        self.play(FadeIn(reg), run_time=0.6)
        hd = M("y=0", size=56, color=ORG).move_to([EX, 1.6, 0])
        self.go("4:04:04.49", Write(hd), run=0.5)
        t1 = colour(at_eq(M("x=y^2", r"\to", "0", size=56), 1, EX, 0.3), BLUE=[0])
        d1 = pt(ax, 0, 0, color=BLUE)
        self.go("4:04:06.41", Write(t1[0]), run=0.5)
        self.go("4:04:07.55", Write(t1[1:]), FadeIn(d1, scale=0.5), run=0.4)
        t2 = colour(at_eq(M("x=y+2", r"\to", "2", size=56), 1, EX, -1.0), PURP=[0])
        d2 = pt(ax, 2, 0, color=PURP)
        self.go("4:04:08.75", Write(t2[0]), run=0.5)
        self.go("4:04:09.63", Write(t2[1:]), FadeIn(d2, scale=0.5), run=0.4)
        tk = side_tick(t2, "right")
        self.go("4:04:11.29", Create(tk[0]), FadeIn(tk[1]), run=0.5)


class K38_YEval(Shot):
    """Integral from -1 to 2 of (y + 2 - y^2) dy = 10/3 - (-7/6) = 27/6 = 9/2."""
    def body(self):
        self.title("Example 3", animate=False)
        EX = -1.0
        r1 = colour(at_eq(M("A", "=", r"\int_{-1}^{2}", r"\big(", "y+2", "-", "y^2", r"\big)", r"\,dy", size=56),
                          1, EX, 1.8), GRN=[0, 2], PURP=[4], BLUE=[6])
        self.go("4:04:13.99", Write(r1[:3]), run=0.6)
        self.go("4:04:16.31", Write(r1[3:5]), run=0.8)
        self.go("4:04:17.77", Write(r1[5:8]), run=0.7)
        self.go("4:04:19.55", Write(r1[8]), run=0.4)
        r2 = at_eq(M("=", r"\Big[\frac{y^2}{2}+2y-\frac{y^3}{3}\Big]_{-1}^{2}", size=56), 0, EX, 0.3)
        self.go("4:04:20.81", Write(r2[0]), run=0.3)
        self.go("4:04:21.99", Write(r2[1]), run=2.4)
        r3 = colour(at_eq(M("F(2)", "=", r"2+4-\frac83", "=", r"\frac{10}{3}", size=54), 1, EX, -1.2), ORG=[4])
        self.go("4:04:27.55", Write(r3[:2]), run=0.4)
        self.go("4:04:28.61", Write(r3[2]), run=1.6)
        self.go("4:04:31.45", Write(r3[3:]), run=0.5)
        r4 = colour(at_eq(M("F(-1)", "=", r"\frac12-2+\frac13", "=", r"-\frac76", size=54), 1, EX, -2.65), ORG=[4])
        self.go("4:04:32.69", Write(r4[:2]), run=0.5)
        self.go("4:04:34.03", Write(r4[2]), run=1.8)
        self.go("4:04:37.45", Write(r4[3:]), run=0.5)
        # A = F(2) - F(-1)
        self.go("4:04:39.53", FadeOut(VGroup(r1, r2)), r3.animate.shift(UP * 3.0), r4.animate.shift(UP * 3.0),
                run=0.6)
        f1 = colour(at_eq(M("A", "=", r"\frac{10}{3}", "-", r"\left(-\frac76\right)", size=56), 1, EX, -1.15),
                    GRN=[0], ORG=[2, 4])
        self.play(TransformFromCopy(r3[4], f1[2]), TransformFromCopy(r4[4], f1[4]), Write(f1[:2]), Write(f1[3]),
                  run_time=0.9)
        f2 = colour(at_eq(M("=", r"\frac{20}{6}", "+", r"\frac76", "=", r"\frac{27}{6}", r"=\;", r"\frac92", size=56),
                          0, EX, -2.65), GRN=[7])
        self.go("4:04:42.51", Write(f2[:4]), run=1.0)
        self.go("4:04:45.73", Write(f2[4:6]), run=0.6)
        self.go("4:04:47.77", Write(f2[6:]), run=0.4)
        self.play(Create(answer_box(f2[7])), run_time=0.4)


class K38_WhyHoriz(Shot):
    """Vertical slices need two parts (the bottom changes from parabola to line at x = 1); horizontal slices don't."""
    def body(self):
        self.title("Why Sideways?", "4:04:49.41")
        ax, cp, cl, lp = ax4()
        ll = line_label4(ax, "x=y+2")
        reg = hband(ax, R4, L4, -1, 2)
        self.add(ax, ax.labels, reg, cp, cl, lp, ll)
        top = lambda x: np.sqrt(max(x, 0))
        bot = lambda x: -np.sqrt(max(x, 0)) if x < 1 else x - 2
        vs = slices(ax, top, bot, 0, 4, 16)
        self.go("4:04:50.89", FadeOut(reg), LaggedStart(*[FadeIn(s) for s in vs], lag_ratio=0.06), run=0.9)
        cut = vdash(ax, 1, -1.2, 1.2)
        n1 = M("1", size=50, color=ORG).move_to(ax.c2p(0.55, 0))
        n2 = M("2", size=50, color=ORG).move_to(ax.c2p(2.4, 1.0))
        self.go("4:04:52.79", Create(cut), run=0.4)
        self.go("4:04:53.49", FadeIn(n1, shift=DOWN * 0.1), FadeIn(n2, shift=DOWN * 0.1), run=0.4)
        b1 = ax.plot_parametric_curve(lambda t: np.array([t * t, t, 0]), t_range=[-1, 0], color=YEL, stroke_width=9)
        b2 = Line(ax.c2p(1, -1), ax.c2p(4, 2), color=YEL, stroke_width=9)
        bw = H("bottom", 36, YEL).move_to(ax.c2p(3.7, -0.6))
        self.go("4:04:55.25", FadeIn(bw), run=0.4)
        self.go("4:04:56.87", Create(b1), run=0.5)
        self.go("4:04:57.79", Create(b2), run=0.7)
        hs = hslices(ax, R4, L4, -1, 2, 12)
        self.go("4:04:59.65", FadeOut(VGroup(b1, b2, bw, cut, n1, n2)), ReplacementTransform(vs, hs), run=1.0)
        one = H("one integral", 38, YEL).move_to([3.4, 1.4, 0])
        self.go("4:05:00.71", FadeIn(one, shift=UP * 0.1), run=0.4)
        g = M("x", "=", r"g(y)", size=60, color=ORG).move_to([3.4, 0.0, 0])
        self.go("4:05:02.79", Write(g), run=0.6)
        ar = M(r"\Downarrow", size=50, color=DIM).next_to(g, DOWN, buff=0.25)
        sw = H("slice sideways", 44, YEL).next_to(ar, DOWN, buff=0.25)
        self.go("4:05:05.09", FadeIn(ar), FadeIn(sw, shift=UP * 0.1), run=0.5)


# ---------------------------------------------------------------- practice

class K38_TryTwo(Shot):
    """The two practice problems."""
    def body(self):
        self.title("Try These")
        p1 = TX(r"1.\ \ Area between $y=x^2$ and $y=2x$", size=56)
        p2 = TX(r"2.\ \ Average value of $3x^2$ on $[0,\,2]$", size=56)
        VGroup(p1, p2).arrange(DOWN, buff=0.9, aligned_edge=LEFT).move_to([0, 0.0, 0])
        self.go("4:05:09.70", Write(p1), run=2.2)
        self.go("4:05:14.03", Write(p2), run=2.6)
        self.go("4:05:17.37", Circumscribe(p2[0][-5:], color=ORG, buff=0.08), run=0.9)


class K38_Sol1(Shot):
    """x^2 and 2x cross at 0 and 2; 2x on top; integral of 2x - x^2 = 4 - 8/3 = 4/3."""
    def body(self):
        self.title("Problem 1", "4:05:18.87")
        ax = axes((0, 2.5, 1), (0, 5, 1), x_length=4.2, y_length=4.6, center=(-4.4, -0.8, 0), num_size=28)
        f2x = lambda x: 2 * x
        fsq = lambda x: x * x
        c2 = curve(ax, f2x, [0, 2.3])
        cs = curve(ax, fsq, [0, 2.15], color=PURP)
        l2 = M("y=2x", size=38, color=BLUE).next_to(ax.c2p(2.3, 4.6), RIGHT, buff=0.12)
        ls = M("y=x^2", size=38, color=PURP).next_to(ax.c2p(2.15, 4.62), RIGHT, buff=0.12).shift(DOWN * 0.7)
        self.add(ax, ax.labels)
        self.go("4:05:19.40", draw(c2, run=0.8), draw(cs, run=0.8), FadeIn(l2), FadeIn(ls), run=0.8)
        EX = 1.8
        r1 = colour(at_eq(M("x^2", "=", "2x", size=58), 1, EX, 1.5), PURP=[0], BLUE=[2])
        self.go("4:05:20.57", Write(r1), run=0.8)
        r2 = at_eq(M("x^2-2x", "=", "0", size=58), 1, EX, 0.4)
        self.go("4:05:23.27", Write(r2), run=1.2)
        r3 = colour(at_eq(M("x", "=", "0", r"\ \text{or}\ 2", size=58), 1, EX, -0.7), ORG=[0, 1, 2, 3])
        q0, q2 = pt(ax, 0, 0), pt(ax, 2, 4)
        self.go("4:05:26.73", Write(r3[:3]), FadeIn(q0, scale=0.5), run=0.5)
        self.go("4:05:27.75", Write(r3[3]), run=0.35)
        self.go("4:05:28.11", FadeIn(q2, scale=0.5), run=0.3)
        # test x = 1
        self.go("4:05:28.95", FadeOut(VGroup(r1, r2, r3)), run=0.35)
        hd = M("x=1", size=56, color=ORG).move_to([EX, 1.6, 0])
        tl = vdash(ax, 1, 0, 2)
        self.go("4:05:29.35", Write(hd), Create(tl), run=0.5)
        t1 = colour(at_eq(M("2x", r"\to", "2", size=56), 1, EX, 0.3), BLUE=[0])
        d1 = pt(ax, 1, 2, color=BLUE)
        self.go("4:05:31.07", Write(t1[0]), run=0.3)
        self.go("4:05:31.57", Write(t1[1:]), FadeIn(d1, scale=0.5), run=0.35)
        t2 = colour(at_eq(M("x^2", r"\to", "1", size=56), 1, EX, -1.0), PURP=[0])
        d2 = pt(ax, 1, 1, color=PURP)
        self.go("4:05:32.57", Write(t2[0]), run=0.3)
        self.go("4:05:33.09", Write(t2[1:]), FadeIn(d2, scale=0.5), run=0.35)
        tk = side_tick(t1)
        reg = band(ax, f2x, fsq, 0, 2)
        self.go("4:05:34.57", Create(tk[0]), FadeIn(tk[1]), FadeIn(reg), run=0.6)
        # the integral
        self.go("4:05:36.29", FadeOut(VGroup(hd, tl, t1, t2, d1, d2, tk)), run=0.3)
        EX = 0.9
        s1 = colour(at_eq(M("A", "=", r"\int_0^2", r"\big(", "2x", "-", "x^2", r"\big)", r"\,dx", size=56), 1, EX, 1.65),
                    GRN=[0, 2], BLUE=[4], PURP=[6])
        self.go("4:05:36.62", Write(s1[:3]), run=0.5)
        self.go("4:05:38.25", Write(s1[3:]), run=0.9)
        s2 = at_eq(M("=", r"\Big[x^2-\frac{x^3}{3}\Big]_0^2", size=56), 0, EX, 0.05)
        self.go("4:05:40.43", Write(s2[0]), run=0.3)
        self.go("4:05:41.51", Write(s2[1]), run=1.8)
        s3 = colour(at_eq(M("=", r"4-\frac83", r"=\;", r"\frac43", size=56), 0, EX, -1.55), GRN=[3])
        self.go("4:05:45.77", Write(s3[:2]), run=0.8)
        self.go("4:05:47.61", Write(s3[2:]), run=0.4)
        self.go("4:05:49.43", reg.animate.set_fill(opacity=0.6), run=0.6)
        self.go("4:05:50.15", Create(answer_box(s3[3])), run=0.4)


class K38_Sol2(Shot):
    """Average of 3x^2 on [0, 2]: area 8 / width 2 = 4; the area pours level into a 2-by-4 rectangle."""
    def body(self):
        self.title("Problem 2", "4:05:51.57")
        ax = axes((0, 2.5, 1), (0, 13, 4), x_length=4.4, y_length=4.6, center=(-4.1, -0.5, 0), num_size=28)
        f = lambda x: 3 * x * x
        cv = curve(ax, f, [0, 2.05])
        lf = M("y=3x^2", size=38, color=BLUE).next_to(ax.c2p(2.05, f(2.05)), LEFT, buff=0.15)
        self.play(Create(ax), FadeIn(ax.labels), draw(cv, run=0.6), FadeIn(lf), run_time=0.6)
        xs = np.linspace(0, 2, 60)
        under = Polygon(*([ax.c2p(x, f(x)) for x in xs] + [ax.c2p(2, 0), ax.c2p(0, 0)]),
                        stroke_width=0, fill_color=GRN, fill_opacity=0.45)
        level = Polygon(*([ax.c2p(x, 4) for x in xs] + [ax.c2p(2, 0), ax.c2p(0, 0)]),
                        stroke_color=GRN, stroke_width=3, fill_color=GRN, fill_opacity=0.45)
        EX = 1.6
        r1 = colour(at_eq(M(r"\int_0^2 3x^2\,dx", "=", r"\Big[x^3\Big]_0^2", "=", "8", size=54), 1, EX, 1.5), GRN=[4])
        self.go("4:05:52.83", Write(r1[0]), FadeIn(under), run=0.9)
        self.go("4:05:56.05", Write(r1[1:3]), run=0.9)
        eight = M("8", size=50, color=GRN).move_to(ax.c2p(1.5, 2.3))
        self.go("4:05:58.39", Write(r1[3:]), FadeIn(eight), run=0.4)
        r2 = colour(at_eq(M(r"\text{average}", "=", r"\frac{8}{2}", r"=\;", "4", size=56), 1, EX, -0.1), YEL=[0], GRN=[4])
        self.go("4:05:59.21", Write(r2[:3]), run=0.6)
        br = Brace(Line(ax.c2p(0, 0), ax.c2p(2, 0)), DOWN, buff=0.4, color=ORG)
        bl = M("2", size=40, color=ORG).next_to(br, DOWN, buff=0.06)
        self.go("4:05:59.93", GrowFromCenter(br), FadeIn(bl), run=0.45)
        self.go("4:06:00.49", Transform(under, level), eight.animate.move_to(ax.c2p(1, 2)), run=1.5)
        lv = DashedLine(ax.c2p(0, 4), ax.c2p(2.4, 4), color=YEL, stroke_width=3, dash_length=0.1)
        l4 = M("4", size=40, color=YEL).next_to(ax.c2p(2.4, 4), RIGHT, buff=0.1)
        self.go("4:06:02.17", Write(r2[3:]), Create(lv), FadeIn(l4), run=0.4)
        self.play(Create(answer_box(r2[4])), run_time=0.3)


# ---------------------------------------------------------------- beyond, and the big idea

def loaf():
    body = RoundedRectangle(width=2.3, height=1.25, corner_radius=0.45, stroke_color=CHALK, stroke_width=4)
    cuts = VGroup(*[Line([x, -0.6, 0], [x, 0.6 - (0.25 if abs(x) > 0.75 else 0.02), 0], stroke_color=DIM, stroke_width=3)
                    for x in np.arange(-0.84, 0.85, 0.28)])
    return body, cuts


def tank():
    w, h = 1.5, 1.8
    top = Ellipse(width=w, height=0.34, stroke_color=CHALK, stroke_width=4).move_to([0, h / 2, 0])
    sides = VGroup(Line([-w / 2, h / 2, 0], [-w / 2, -h / 2, 0]), Line([w / 2, h / 2, 0], [w / 2, -h / 2, 0])).set_stroke(CHALK, 4)
    bot = Arc(radius=1, start_angle=PI, angle=PI, stroke_color=CHALK, stroke_width=4).stretch(w / 2, 0).stretch(0.17, 1).move_to([0, -h / 2 - 0.085, 0])
    return VGroup(top, sides, bot), w, h


class K38_More(Shot):
    """Volume (sliced loaf), arc length, work (pumping a tank), centre of mass: mostly Calculus 2."""
    def body(self):
        self.title("Beyond This Course", "4:06:03.55")
        Y, LY = 0.35, -1.45
        xs = [-5.1, -1.7, 1.7, 5.1]
        # volume
        body, cuts = loaf()
        VGroup(body, cuts).move_to([xs[0], Y, 0])
        piece = RoundedRectangle(width=0.26, height=1.1, corner_radius=0.08, stroke_color=YEL, stroke_width=4,
                                 fill_color=YEL, fill_opacity=0.25).move_to([xs[0] + 0.98, Y - 0.05, 0])
        lv = H("volume", 36, YEL).move_to([xs[0], LY, 0])
        self.go("4:06:06.01", Create(body), FadeIn(lv), run=0.8)
        self.go("4:06:08.51", LaggedStart(*[Create(c) for c in cuts], lag_ratio=0.15), run=0.8)
        self.go("4:06:09.57", FadeIn(piece), piece.animate.shift(RIGHT * 0.45), run=0.6)
        # arc length
        arc = ParametricFunction(lambda t: np.array([t, 0.55 * np.sin(1.6 * t), 0]), t_range=[-1.1, 1.1],
                                 color=BLUE, stroke_width=5).move_to([xs[1], Y, 0])
        chords = VMobject(stroke_color=ORG, stroke_width=3).set_points_as_corners(
            [arc.point_from_proportion(p) for p in np.linspace(0, 1, 7)])
        cdots = VGroup(*[Dot(arc.point_from_proportion(p), radius=0.05, color=ORG) for p in np.linspace(0, 1, 7)])
        la = H("arc length", 36, YEL).move_to([xs[1], LY, 0])
        self.go("4:06:10.85", Create(arc), FadeIn(la), run=0.5)
        self.play(Create(chords), FadeIn(cdots), run_time=0.6)
        # work: pumping a tank
        tk, w, h = tank()
        tk.move_to([xs[2], Y - 0.15, 0])
        lw = H("work", 36, YEL).move_to([xs[2], LY, 0])
        lev = ValueTracker(0.75)
        base = tk.get_bottom()[1] + 0.09
        water = always_redraw(lambda: Rectangle(width=w - 0.06, height=max(lev.get_value() * h * 0.9, 0.02),
                                                stroke_width=0, fill_color=BLUE, fill_opacity=0.4)
                              .move_to([xs[2], base + lev.get_value() * h * 0.45, 0]))
        hose = VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners(
            [[xs[2] + 0.3, base + 0.1, 0], [xs[2] + 0.3, Y + 1.15, 0], [xs[2] + 1.0, Y + 1.15, 0]])
        out = Arrow([xs[2] + 0.95, Y + 1.15, 0], [xs[2] + 1.45, Y + 0.85, 0], buff=0, color=BLUE, stroke_width=4,
                    tip_length=0.15)
        self.go("4:06:12.17", Create(tk), FadeIn(water), FadeIn(lw), run=0.7)
        self.go("4:06:13.03", Create(hose), GrowArrow(out), run=0.5)
        self.play(lev.animate.set_value(0.2), run_time=1.3)
        # centre of mass
        plate = Polygon([-1.0, 0.0, 0], [1.0, 0.0, 0], [0.2, 1.1, 0], stroke_color=CHALK, stroke_width=4,
                        fill_color=CHALK, fill_opacity=0.08)
        cm = np.mean([[-1.0, 0.0, 0], [1.0, 0.0, 0], [0.2, 1.1, 0]], axis=0)
        ful = Polygon([cm[0] - 0.22, -0.4, 0], [cm[0] + 0.22, -0.4, 0], [cm[0], 0, 0], stroke_color=DIM, stroke_width=4)
        dot = Dot(cm, radius=0.08, color=ORG).set_z_index(6)
        VGroup(plate, ful, dot).move_to([xs[3], Y - 0.1, 0])
        lc = H("center of mass", 36, YEL).move_to([xs[3], LY, 0])
        self.go("4:06:15.25", Create(plate), Create(ful), FadeIn(lc), run=0.6)
        self.go("4:06:15.81", FadeIn(dot, scale=0.5), run=0.4)
        c2 = pill("Calculus 2", YEL, size=44).move_to([0, -2.8, 0])
        self.go("4:06:18.67", FadeIn(c2, shift=UP * 0.15), run=0.5)


class K38_Idea(Shot):
    """The idea under all of it: slice into tiny pieces, work out one piece, add them up with an integral."""
    def body(self):
        self.title("The Big Idea", "4:06:19.83")
        ax = Axes(x_range=[-4, 4], y_range=[-2, 2], x_length=8, y_length=4).move_to([0, 0.15, 0])
        T_ = lambda x: 1.15 + 0.35 * np.sin(1.1 * x + 0.4) + 0.12 * np.cos(2.3 * x)
        B_ = lambda x: -1.05 + 0.3 * np.cos(0.9 * x - 0.3)
        a, b = -3.4, 3.4
        xs = np.linspace(a, b, 90)
        outline = Polygon(*([ax.c2p(x, T_(x)) for x in xs] + [ax.c2p(x, B_(x)) for x in xs[::-1]]),
                          stroke_color=CHALK, stroke_width=4, fill_opacity=0)
        self.go("4:06:20.51", Create(outline), run=1.2)
        s16 = slices(ax, T_, B_, a, b, 16, op=0.2)
        self.go("4:06:24.25", LaggedStart(*[FadeIn(s) for s in s16], lag_ratio=0.05), run=0.8)
        s40 = slices(ax, T_, B_, a, b, 40, op=0.2)
        self.go("4:06:25.31", ReplacementTransform(s16, s40), run=0.6)
        k = 25
        one = s40[k]
        others = VGroup(*[s for i, s in enumerate(s40) if i != k])
        lab = M(r"h\,dx", size=58, color=YEL).next_to(one, DOWN, buff=0.55)
        self.go("4:06:26.51", others.animate.set_opacity(0.12), one.animate.set_fill(YEL, 0.7).set_stroke(YEL),
                FadeIn(lab, shift=UP * 0.1), run=0.6)
        solid = Polygon(*([ax.c2p(x, T_(x)) for x in xs] + [ax.c2p(x, B_(x)) for x in xs[::-1]]),
                        stroke_color=GRN, stroke_width=3, fill_color=GRN, fill_opacity=0.45)
        self.go("4:06:28.03", others.animate.set_fill(GRN, 0.45).set_stroke(GRN, opacity=1),
                one.animate.set_fill(GRN, 0.45).set_stroke(GRN), run=0.5)
        self.play(FadeIn(solid), FadeOut(s40), FadeOut(outline), run_time=0.4)
        tot = colour(M(r"\int", r"h\,dx", size=72).move_to([0, -2.75, 0]), GRN=[0], YEL=[1])
        self.go("4:06:29.25", FadeOut(lab), Write(tot), run=0.6)
