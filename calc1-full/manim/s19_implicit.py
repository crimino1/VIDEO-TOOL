"""Builder 19: start of Chapter 7, implicit differentiation. Explicit functions, the circle x^2+y^2=25 and its two
halves, x^3+y^3=6xy, the idea (y is a function of x, so every y term picks up dy/dx = y'), d/dx(y^2) = 2y y',
the circle gives y' = -x/y, a tangent sliding round the circle with a live slope = -x/y readout, the point (3,4),
radius perpendicular to tangent, xy + y^2 = 6 at (1,2), the four-step pattern, the folium at (3,3).
Colours: curves BLUE, every y' / dy/dx PINK, points and example numbers ORG, answers boxed GRN."""
from common import *

D = r"\frac{d}{dx}"
R5 = 5.0
TH34 = float(np.arctan2(4, 3))


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def pk(m, *idx):
    """Colour parts of a MathTex PINK (the y' tags)."""
    for i in idx:
        m[i].set_color(PINK)
    return m


_DG = {}


def digits(s, size=48, color=CHALK):
    """A number from cached glyphs (cheap per frame, no new LaTeX per value); the minus sits at mid-height."""
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


def fmt(v):
    return f"{(v if abs(v) >= 0.005 else 0.0):.2f}"


def circle_vals(th):
    x, y = R5 * np.cos(th), R5 * np.sin(th)
    return x, y, -x / y


assert (fmt(circle_vals(TH34)[0]), fmt(circle_vals(TH34)[1]), fmt(circle_vals(TH34)[2])) == ("3.00", "4.00", "-0.75")


def circle_axes():
    """Equal-scale axes for x^2+y^2=25 on the left half of the board, and the BLUE circle."""
    ax = axes((-6, 6, 1), (-6, 6, 1), x_length=5.8, y_length=5.8, center=(-3.2, -0.85, 0), nums=False)
    r = np.linalg.norm(np.array(ax.c2p(R5, 0)) - np.array(ax.c2p(0, 0)))
    circ = Circle(radius=r, color=BLUE, stroke_width=5).move_to(ax.c2p(0, 0))
    ax.r = r
    return ax, circ


def cpt(ax, th):
    return np.array(ax.c2p(R5 * np.cos(th), R5 * np.sin(th)))


def ctan(ax, th, length=3.0, color=PINK, width=5):
    p = cpt(ax, th)
    d = np.array([-np.sin(th), np.cos(th), 0])
    return Line(p - d * length / 2, p + d * length / 2, color=color, stroke_width=width).set_z_index(4)


def folium(ax):
    """x^3 + y^3 = 6xy drawn as one stroke: (6t, 6t^2)/(1+t^3) for t in [-0.55, 1], then its mirror in y = x."""
    def P(t):
        d = 1 + t ** 3
        return 6 * t / d, 6 * t * t / d

    def f(u):
        x, y = P(u) if u <= 1 else P(2 - u)[::-1]
        return ax.c2p(x, y)
    return ParametricFunction(f, t_range=[-0.55, 2.55, 0.004], color=BLUE, stroke_width=5)


def unclock(*ms):
    for m in ms:
        for x in m.get_family():
            x.clear_updaters()


def answer_yp():
    """The boxed circle result y' = -x/y, where K19_CircleDiff leaves it."""
    r = pk(M("y'", "=", r"-\frac{x}{y}", size=66), 0)
    at_eq(r, 1, 0, -2.6)
    b = answer_box(r)
    b.stretch_to_fit_width(b.width + 0.24).shift(RIGHT * 0.12)   # the fraction's x pokes past its bbox
    return r, b


ANS_AT = np.array([3.6, 1.55, 0])


def small_answer():
    r, b = answer_yp()
    VGroup(r, b).scale(0.9).move_to(ANS_AT)
    return r, b


def check34():
    c = M("3^2+4^2", "=", "9+16", "=", "25", size=54).move_to([3.35, 0.2, 0])
    c[0][0].set_color(ORG); c[0][3].set_color(ORG)
    tk = tick_mark(s=0.42).next_to(c, RIGHT, buff=0.25)
    return c, tk


def slope34():
    s = M("y'", "=", r"-\frac{3}{4}", size=60)
    s[0].set_color(PINK); s[2].set_color(PINK)
    return at_eq(s, 1, 3.2, -1.35)


def label34(ax):
    return M("(3,4)", size=44, color=ORG).next_to(cpt(ax, TH34), UR, buff=0.12)


# ================================================================ explicit functions

class K19_Explicit(Shot):
    def body(self):
        p1 = pill("Implicit Differentiation", YEL, 46)
        p2 = pill("Inverse Functions", PURP, 46)
        p3 = pill("A Trick with Logs", PURP, 46)
        VGroup(p1, p2, p3).arrange(DOWN, buff=0.5).move_to([0, 0.1, 0])
        self.go(6829.3, FadeIn(p1, shift=UP * 0.15), run=0.4)
        self.go(6829.75, FadeIn(p2, shift=UP * 0.15), run=0.4)
        self.go(6830.55, FadeIn(p3, shift=UP * 0.15), run=0.5)
        self.wipe(6831.9)
        self.title("Explicit Functions", 6832.4)
        rows = [M("y", "=", "f(x)", size=78), M("y", "=", "x^2", size=78), M("y", "=", r"\sin x", size=78)]
        for r, y in zip(rows, (1.3, 0.05, -1.2)):
            at_eq(r, 1, -0.5, y)
            r[2].set_color(BLUE)
        self.go(6835.73, Write(rows[0]), run=0.7)
        self.go(6837.77, Write(rows[1]), run=0.7)
        self.go(6839.55, Write(rows[2]), run=0.7)
        bxs = [box(r[0], YEL, buff=0.12) for r in rows]
        self.go(6841.53, *[Create(b) for b in bxs], run=0.6)
        self.go(6842.75, *[r[2].animate.set_opacity(0.4) for r in rows], run=0.5)
        lab = H("explicit", 66, YEL).move_to([0, -2.65, 0])
        ul = brush_line(lab.width + 0.4, center=lab.get_bottom() + DOWN * 0.1)
        self.go(6844.63, Write(lab), run=0.5)
        self.go(6845.15, Create(ul), *[r[2].animate.set_opacity(1) for r in rows], run=0.5)
        self.wipe(6847.95, run=0.35)


# ================================================================ a circle is not y = ...

class K19_Circle(Shot):
    def body(self):
        self.title("Explicit Functions", animate=False)
        self.title("A Circle", 6848.55)
        ax, circ = circle_axes()
        self.go(6849.05, Create(ax), FadeIn(ax.labels), draw(circ, 0.8), run=0.8)
        eq = M("x^2", "+", "y^2", "=", "25", size=74).move_to([3.4, 1.45, 0])
        self.go(6849.89, Write(eq), run=1.0)
        O = Dot(ax.c2p(0, 0), radius=0.08, color=ORG).set_z_index(6)
        self.go(6854.67, FadeIn(O, scale=0.5), run=0.4)
        a = 0.62
        rad = Line(ax.c2p(0, 0), cpt(ax, a), color=ORG, stroke_width=4)
        r5 = M("5", size=44, color=ORG).move_to(rad.get_center() + np.array([-np.sin(a), np.cos(a), 0]) * 0.3)
        self.go(6855.69, Create(rad), FadeIn(r5), run=0.4)
        sol = M("y", "=", r"\pm", r"\sqrt{25-x^2}", size=66).move_to([3.4, 0.0, 0])
        self.go(6859.07, Write(sol), run=1.2)
        self.go(6864.25, sol[2].animate.set_color(RED), Circumscribe(sol[2], color=RED, buff=0.08), run=0.7)
        c = ax.c2p(0, 0)
        top = Arc(radius=ax.r, start_angle=0, angle=PI, arc_center=c, color=YEL, stroke_width=8)
        bot = Arc(radius=ax.r, start_angle=PI, angle=PI, arc_center=c, color=ORG, stroke_width=8)
        t_eq = M("y", "=", r"+\sqrt{25-x^2}", size=56, color=YEL).move_to([3.4, -1.35, 0])
        b_eq = M("y", "=", r"-\sqrt{25-x^2}", size=56, color=ORG).move_to([3.4, -2.45, 0])
        self.go(6867.93, Create(top), TransformFromCopy(sol, t_eq), run=0.7)
        self.go(6868.97, Create(bot), TransformFromCopy(sol, b_eq), run=0.6)
        self.wipe(6869.85, run=0.35)


class K19_Worse(Shot):
    def body(self):
        self.title("A Circle", animate=False)
        self.title("Even Worse", 6870.45)
        eq = M("x^3", "+", "y^3", "=", "6xy", size=80).move_to([-3.2, 1.0, 0])
        self.go(6873.39, Write(eq), run=1.2)
        fax = axes((-4, 4, 1), (-4, 4, 1), x_length=4.6, y_length=4.6, center=(3.4, -0.75, 0), nums=False)
        fol = folium(fax)
        self.go(6874.75, Create(fax), FadeIn(fax.labels), run=0.5)
        self.go(6875.3, draw(fol, 1.5))
        q = M("y", "=", "?", size=78).move_to([-3.2, -0.8, 0])
        q[2].set_color(RED)
        self.go(6877.57, Write(q), run=0.6)
        self.go(6878.4, Circumscribe(q[2], color=RED, buff=0.1), run=0.7)
        self.wipe(6879.75, run=0.35)


# ================================================================ the idea

class K19_Idea(Shot):
    def body(self):
        self.title("Even Worse", animate=False)
        self.title("The Idea", 6880.6)
        eq = M("x^2+y^2", "=", "25", size=68)
        at_eq(eq, 1, 0.3, 1.5)
        self.go(6881.1, FadeIn(eq, shift=DOWN * 0.1), run=0.5)
        q = M("y", "=", "?", size=60, color=DIM).move_to([0, 0.05, 0])
        cm = cross_mark(s=0.28).next_to(q, RIGHT, buff=0.45)
        self.go(6881.87, FadeIn(q), run=0.4)
        self.go(6882.4, Create(cm), run=0.4)
        self.go(6883.25, FadeOut(q), FadeOut(cm), run=0.4)
        deq = M(D + r"\Big[", "x^2+y^2", r"\Big]", "=", D + r"\Big[", "25", r"\Big]", size=68)
        at_eq(deq, 3, 0.3, 1.5)
        self.go(6883.83, TransformMatchingTex(eq, deq), run=1.0)
        self.title("Implicit Differentiation", 6887.19)
        yx = M("y", "(x)", "=", "?", size=84).move_to([0, 0.0, 0])
        yx[1].set_color(YEL); yx[3].set_color(RED)
        self.go(6892.05, Write(yx[0]), run=0.3)
        self.go(6893.13, Write(yx[1]), run=0.4)
        self.go(6894.69, Write(yx[2:]), run=0.4)
        self.go(6896.41, FadeOut(yx), run=0.4)
        self.go(6898.4, Circumscribe(deq[1][3:], color=YEL, buff=0.08), run=0.8)
        chain = pill("chain rule", YEL, 44).move_to([0, 0.0, 0])
        self.go(6900.43, FadeIn(chain, shift=UP * 0.15), run=0.5)
        row = M(D, "(y)", "=", r"\frac{dy}{dx}", "=", "y'", size=78)
        pk(row, 3, 5)
        row.move_to([0, -2.0, 0])
        self.go(6901.91, Write(row[0:2]), run=0.6)
        self.go(6905.53, Write(row[2:4]), run=0.7)
        self.go(6908.31, Write(row[4:]), run=0.5)
        self.wipe(6909.6, run=0.35)


# ================================================================ d/dx (y^2)

class K19_YSquared(Shot):
    def body(self):
        self.title("Implicit Differentiation", animate=False)
        self.title("The Basic Case", 6910.2)
        main = M(D, "(y^2)", "=", "2y", r"\cdot", r"\frac{dy}{dx}", size=82)
        pk(main, 5)
        at_eq(main, 2, -0.9, -0.3)
        cmp = M(D, "(x^2)", "=", "2x", size=64, color=DIM)
        at_eq(cmp, 2, -0.9, 1.65)
        self.go(6912.47, Write(main[0:2]), run=0.7)
        self.go(6916.29, Write(cmp[0:2]), run=0.5)
        self.go(6918.37, Write(cmp[2:]), run=0.4)
        n1 = note("a function of x", main[1][1], DL, size=38, dist=0.9)
        self.go(6919.83, FadeIn(n1), run=0.5)
        fs = M(r"\big(\, y(x) \,\big)^2", size=58, color=YEL)
        fs.move_to([main[0:2].get_x(), -2.3, 0])
        self.go(6922.4, FadeOut(n1), run=0.3)
        self.go(6922.75, Write(fs), run=0.7)
        cr = H("chain rule", 40, YEL).next_to(fs, RIGHT, buff=0.6)
        self.go(6925.01, FadeIn(cr, shift=LEFT * 0.1), run=0.4)
        self.go(6926.09, Write(main[2:4]), run=0.5)
        self.go(6927.41, Write(main[4:6]), run=0.6)
        yp = M("y'", size=82, color=PINK)
        yp.next_to(main[4], RIGHT, buff=0.18).align_to(main[3], DOWN)
        self.go(6931.87, ReplacementTransform(main[5], yp), run=0.5)
        res = VGroup(main[0:5], yp)
        bx = answer_box(res)
        self.go(6933.6, FadeOut(fs), FadeOut(cr), Create(bx), run=0.6)
        b1 = Brace(main[3], DOWN, color=YEL)
        b1.shift(UP * (bx.get_bottom()[1] - 0.08 - b1.get_top()[1]))
        l1 = H("normal derivative", 36, YEL).next_to(b1, DOWN, buff=0.1).align_to(b1, RIGHT)
        b2 = Brace(yp, DOWN, color=PINK)
        b2.shift(UP * (bx.get_bottom()[1] - 0.08 - b2.get_top()[1]))
        l2 = H("tack on", 36, PINK).next_to(b2, DOWN, buff=0.1).align_to(b2, LEFT)
        self.go(6937.19, FadeIn(b1), FadeIn(l1, shift=UP * 0.1), run=0.5)
        self.go(6938.49, FadeIn(b2), FadeIn(l2, shift=UP * 0.1), run=0.5)
        self.wipe(6940.11, run=0.35)


# ================================================================ the circle, differentiated

class K19_CircleDiff(Shot):
    def body(self):
        self.title("The Basic Case", animate=False)
        self.title("Differentiate the Circle", 6940.6)
        X = [-3.0, -1.65, -0.2, 1.4, 2.7]
        top = [M(s, size=72) for s in ("x^2", "+", "y^2", "=", "25")]
        for m, x in zip(top, X):
            m.move_to([x, 1.55, 0])
        top = VGroup(*top)
        self.go(6941.81, Write(top), run=1.0)
        arrows = VGroup()
        for x in (X[0], X[2], X[4]):
            a = Arrow([x, 1.12, 0], [x, 0.62, 0], buff=0, color=DIM, stroke_width=3, tip_length=0.14,
                      max_tip_length_to_length_ratio=0.35)
            arrows.add(VGroup(a, M(D, size=34, color=DIM).next_to(a, RIGHT, buff=0.08)))
        self.go(6945.59, *[FadeIn(a, shift=DOWN * 0.1) for a in arrows], run=0.5)
        d1 = M("2x", size=70).move_to([X[0], 0.12, 0])
        d2 = pk(M("2y", "y'", size=70), 1).move_to([X[2], 0.12, 0])
        d3 = M("0", size=70).move_to([X[4], 0.12, 0])
        pl = M("+", size=70).move_to([X[1], 0.12, 0])
        eqs = M("=", size=70).move_to([X[3], 0.12, 0])
        self.go(6947.99, Write(d1), run=0.45)
        self.go(6950.09, Write(d2[0]), run=0.4)
        self.go(6951.11, Write(d2[1]), run=0.4)
        self.go(6954.37, Write(d3), run=0.35)
        row2 = VGroup(d1, pl, d2, eqs, d3)
        self.go(6955.87, FadeOut(arrows), FadeIn(pl), FadeIn(eqs), run=0.5)
        self.go(6956.6, Circumscribe(row2, color=YEL, buff=0.15), run=0.9)
        s1 = M("-2x", size=44, color=YEL).next_to(d1, DOWN, buff=0.18)
        s2 = M("-2x", size=44, color=YEL).next_to(d3, DOWN, buff=0.18)
        self.go(6963.85, FadeIn(s1, shift=UP * 0.1), FadeIn(s2, shift=UP * 0.1), run=0.5)
        r3 = pk(M("2y", "y'", "=", "-2x", size=66), 1)
        at_eq(r3, 2, 0.0, -1.2)
        self.go(6965.71, TransformFromCopy(d2, r3[0:2]), FadeIn(r3[2:]), FadeOut(s1), FadeOut(s2), run=0.7)
        dv = M(r"\div\, 2y", size=46, color=YEL).next_to(r3, RIGHT, buff=0.6)
        self.go(6969.3, FadeIn(dv, shift=LEFT * 0.1), run=0.4)
        r4 = pk(M("y'", "=", r"-\frac{2x}{2y}", size=66), 0)
        at_eq(r4, 1, 0, -2.6)
        self.go(6970.79, Write(r4), run=0.7)
        f = r4[2]
        st = VGroup(strike(f[1], width=5), strike(f[4], width=5))
        self.go(6971.55, *[Create(s) for s in st], run=0.4)
        r5, bx = answer_yp()
        self.go(6972.03, ReplacementTransform(r4, r5), FadeOut(st), run=0.6)
        self.go(6972.7, Create(bx), run=0.5)
        self.wipe(6973.3, run=0.35, keep=(r5, bx))


# ================================================================ the slope slides round the circle

class K19_Slide(Shot):
    def body(self):
        self.title("Differentiate the Circle", animate=False)
        r, b = answer_yp()
        self.add(r, b)
        self.title("Slope on the Circle", 6974.17)
        ax, circ = circle_axes()
        self.go(6974.7, VGroup(r, b).animate.scale(0.9).move_to(ANS_AT), Create(ax), FadeIn(ax.labels), run=0.7)
        self.go(6975.45, draw(circ, 0.9))
        th = ValueTracker(2.5)
        tan = always_redraw(lambda: ctan(ax, th.get_value()))
        dot = always_redraw(lambda: Dot(cpt(ax, th.get_value()), radius=0.08, color=PINK).set_z_index(6))
        lx = M("x =", size=48, color=ORG)
        ly = M("y =", size=48, color=ORG)
        ls = M(r"\text{slope} =", size=48, color=PINK)
        for m, y in zip((lx, ly, ls), (0.25, -0.6, -1.55)):
            m.move_to([1.6 + m.width / 2, y, 0])
        ls.align_to(lx, LEFT)
        def val(i, lab, col):
            off = lx[0][-1].get_bottom()[1] - lx[0][0].get_bottom()[1]   # '=' bottom above the baseline
            g = digits(fmt(circle_vals(th.get_value())[i]), 48, col).next_to(lab, RIGHT, buff=0.2)
            return g.shift(UP * (lab[0][-1].get_bottom()[1] - off - g.get_bottom()[1]))
        vx = always_redraw(lambda: val(0, lx, ORG))
        vy = always_redraw(lambda: val(1, ly, ORG))
        vs = always_redraw(lambda: val(2, ls, PINK))
        read = VGroup(lx, ly, ls)
        self.go(6976.4, FadeIn(tan), FadeIn(dot), FadeIn(read), FadeIn(vx), FadeIn(vy), FadeIn(vs), run=0.5)
        self.go(6976.95, th.animate.set_value(0.5), run=2.0)
        self.go(6979.13, Circumscribe(r[2][3], color=YEL, buff=0.08), run=0.7)
        self.go(6980.0, th.animate.set_value(2.2), run=3.0)
        self.go(6983.3, th.animate.set_value(1.7), run=1.8)
        self.go(6986.17, Circumscribe(VGroup(lx, vx), color=ORG, buff=0.1), run=0.55)
        self.go(6986.79, Circumscribe(VGroup(ly, vy), color=ORG, buff=0.1), run=0.55)
        self.go(6989.1, th.animate.set_value(TH34), run=1.3)
        P = Dot(cpt(ax, TH34), radius=0.09, color=ORG).set_z_index(7)
        L = label34(ax)
        self.go(6990.43, FadeIn(P), FadeIn(L), run=0.5)
        unclock(vx, vy, vs)
        self.go(6992.25, FadeOut(read), FadeOut(vx), FadeOut(vy), FadeOut(vs), run=0.4)
        c, tk = check34()
        self.go(6993.0, Write(c[0]), run=0.6)
        self.go(6995.31, Write(c[1:3]), run=0.6)
        self.go(6996.59, Write(c[3:]), run=0.5)
        self.go(6998.15, Create(tk), run=0.4)
        s = slope34()
        self.go(6999.23, Write(s[0:2]), run=0.4)
        self.go(7000.01, Write(s[2]), run=0.6)


def board34(scene, long=False):
    """The (3,4) board the slide ends on: axes, circle, tangent, point, label, small answer."""
    ax, circ = circle_axes()
    tan = ctan(ax, TH34, 3.4 if long else 3.0)
    dot = Dot(cpt(ax, TH34), radius=0.08, color=PINK).set_z_index(6)
    P = Dot(cpt(ax, TH34), radius=0.09, color=ORG).set_z_index(7)
    L = label34(ax)
    r, b = small_answer()
    scene.add(ax, ax.labels, circ, tan, dot, P, L, r, b)
    return ax, circ, tan, dot, P, L, r, b


class K19_Sense(Shot):
    def body(self):
        self.title("Slope on the Circle", animate=False)
        ax, circ, tan, dot, P, L, r, b = board34(self)
        c, tk = check34()
        s = slope34()
        self.add(c, tk, s)
        self.go(7002.27, FadeOut(c), FadeOut(tk), run=0.4)
        q = Arc(radius=ax.r, start_angle=0, angle=PI / 2, arc_center=ax.c2p(0, 0), color=YEL, stroke_width=8)
        self.go(7006.33, Create(q), Circumscribe(L, color=ORG, buff=0.08), run=0.8)
        self.go(7008.43, FadeOut(q), run=0.4)
        trav = Dot(cpt(ax, 1.35), radius=0.1, color=ORG).set_z_index(8)
        path = Arc(radius=ax.r, start_angle=1.35, angle=-0.75, arc_center=ax.c2p(0, 0))
        self.go(7008.85, FadeIn(trav), run=0.3)
        self.go(7009.15, MoveAlongPath(trav, path), run=1.4)
        d = np.array([np.sin(TH34), -np.cos(TH34), 0])
        dn = Arrow(cpt(ax, TH34), cpt(ax, TH34) + d * 1.5, buff=0, color=PINK, stroke_width=5, tip_length=0.2)
        lab = H("downhill", 36, PINK).next_to(dn.get_end(), RIGHT, buff=0.12)
        self.go(7010.6, GrowArrow(dn), FadeIn(lab), run=0.5)
        self.go(7011.8, FadeOut(trav), run=0.3)
        ok = tick_mark(s=0.42).next_to(s, RIGHT, buff=0.35)
        self.go(7013.31, Create(ok), run=0.4)
        long = ctan(ax, TH34, 3.4)
        self.go(7015.83, FadeOut(dn), FadeOut(lab), Transform(tan, long), run=0.6)
        te = M("y-4", "=", r"-\frac{3}{4}", "(x-3)", size=56)
        te[2].set_color(PINK)
        at_eq(te, 1, 2.6, -2.75)
        self.go(7017.17, Write(te[0]), run=0.5)
        self.go(7018.23, Write(te[1]), run=0.3)
        self.go(7018.89, Write(te[2]), run=0.4)
        self.go(7020.27, Write(te[3]), run=0.5)
        self.go(7021.5, FadeOut(s), FadeOut(ok), FadeOut(te), run=0.35)


class K19_Perp(Shot):
    def body(self):
        self.title("Slope on the Circle", animate=False)
        ax, circ, tan, dot, P, L, r, b = board34(self, long=True)
        self.title("Radius and Tangent", 7022.37)
        O = np.array(ax.c2p(0, 0))
        rad = Line(O, cpt(ax, TH34), color=CHALK, stroke_width=5)
        self.go(7024.87, Create(rad), run=0.8)
        rs = M(r"\text{radius}:", r"\ \frac{4}{3}", size=54)
        rs[1].set_color(ORG)
        rs.move_to([1.5 + rs.width / 2, -0.05, 0])
        ts = M(r"\text{tangent}:", r"\ -\frac{3}{4}", size=54, color=PINK)
        ts.move_to([1.5 + ts.width / 2, -1.35, 0])
        self.go(7028.55, Write(rs), run=0.7)
        self.go(7030.57, Write(ts), run=0.7)
        pr = M(r"\frac{4}{3}\cdot\left(-\frac{3}{4}\right)", "=", "-1", size=54)
        pr[2].set_color(YEL)
        pr.move_to([1.5 + pr.width / 2, -2.75, 0])
        self.go(7034.25, Write(pr), run=0.9)
        th = ValueTracker(TH34)

        def mark():
            t = th.get_value()
            p = cpt(ax, t)
            return right_angle_mark(p, O, p + np.array([-np.sin(t), np.cos(t), 0]), size=0.3, color=YEL).set_z_index(5)
        ra = mark()
        self.go(7036.37, Create(ra), run=0.5)
        live = VGroup(always_redraw(lambda: Line(O, cpt(ax, th.get_value()), color=CHALK, stroke_width=5)),
                      always_redraw(lambda: ctan(ax, th.get_value(), 3.4)),
                      always_redraw(lambda: Dot(cpt(ax, th.get_value()), radius=0.08, color=PINK).set_z_index(6)),
                      always_redraw(mark))
        self.at(7039.5)
        self.remove(rad, tan, dot, ra)
        self.add(live)
        self.go(7039.55, FadeOut(P), FadeOut(L), run=0.3)
        self.go(7039.9, th.animate.set_value(TH34 + TAU), run=4.0)
        tk = tick_mark(s=0.42).next_to(pr, RIGHT, buff=0.3)
        self.go(7044.0, Create(tk), FadeIn(P), FadeIn(L), run=0.45)
        unclock(live)
        self.wipe(7045.95, run=0.4)


# ================================================================ xy + y^2 = 6

def prod_graph():
    pax = axes((-3, 5, 1), (-1, 4, 1), x_length=5.6, y_length=3.5, center=(3.4, -0.55, 0))
    cur = ParametricFunction(lambda y: pax.c2p(6 / y - y, y), t_range=[1.2, 3.75, 0.01], color=BLUE, stroke_width=5)
    P = Dot(pax.c2p(1, 2), radius=0.09, color=ORG).set_z_index(7)
    L = M("(1,2)", size=42, color=ORG).next_to(P, UR, buff=0.1)
    return pax, cur, P, L


EQX = -4.0


def prod_rows():
    eq = M("xy", "+", "y^2", "=", "6", size=72).move_to([-3.3, 1.55, 0])
    r1 = pk(M(D + "(xy)", "=", "y", "+", "x", "y'", size=56), 5)
    at_eq(r1, 1, EQX, 0.45)
    r2 = pk(M(D + "(y^2)", "=", "2y", "y'", size=56), 3)
    at_eq(r2, 1, EQX, -0.9)
    r3 = M(D + "(6)", "=", "0", size=56)
    at_eq(r3, 1, EQX, -2.25)
    comb = M("y", "+", "xy'", "+", "2yy'", "=", "0", size=60).move_to([-3.3, -3.35, 0])
    comb[2][1:].set_color(PINK); comb[4][2:].set_color(PINK)
    return eq, r1, r2, r3, comb


class K19_Product(Shot):
    def body(self):
        self.title("Radius and Tangent", animate=False)
        self.title("Product of x and y", 7046.65)
        eq, r1b, r2, r3, comb = prod_rows()
        self.go(7052.33, Write(eq), run=1.0)
        pax, cur, P, L = prod_graph()
        self.go(7054.6, Create(pax), FadeIn(pax.labels), run=0.5)
        self.go(7055.15, draw(cur, 1.0))
        self.go(7057.05, FadeIn(P), FadeIn(L), run=0.4)
        chk = M(r"1\cdot 2", "+", "4", "=", "6", size=58)
        at_eq(chk, 3, EQX + 0.6, 0.45)
        tk = tick_mark(s=0.4).next_to(chk, RIGHT, buff=0.3)
        self.go(7059.03, Write(chk[0]), run=0.6)
        self.go(7060.41, Write(chk[1:3]), run=0.4)
        self.go(7061.07, Write(chk[3:]), run=0.3)
        self.go(7062.19, Create(tk), run=0.4)
        self.go(7062.75, FadeOut(chk), FadeOut(tk), run=0.3)
        r1 = pk(M(D + "(xy)", "=", "1", r"\cdot y", "+", "x", r"\cdot", "y'", size=56), 7)
        at_eq(r1, 1, EQX, 0.45)
        self.go(7063.61, Write(r1[0]), run=0.6)
        prl = H("product rule", 38, YEL).move_to([r1[0].get_x() + 0.4, -0.6, 0])
        self.go(7065.95, FadeIn(prl, shift=UP * 0.1), Circumscribe(eq[0], color=YEL, buff=0.08), run=0.5)
        self.go(7067.41, Write(r1[1:4]), run=0.6)
        self.go(7069.71, Write(r1[4:7]), run=0.5)
        self.go(7072.33, Write(r1[7]), run=0.4)
        self.go(7073.77, TransformMatchingTex(r1, r1b), run=0.7)
        self.go(7075.6, FadeOut(prl), run=0.3)
        self.go(7076.33, Write(r2[0]), run=0.5)
        self.go(7078.05, Write(r2[1:3]), run=0.4)
        self.go(7078.93, Write(r2[3]), run=0.3)
        self.go(7080.11, Write(r3[0]), run=0.5)
        self.go(7081.95, Write(r3[1:]), run=0.35)
        self.go(7083.69, TransformFromCopy(r1b[2], comb[0]), run=0.4)
        self.go(7084.55, TransformFromCopy(r1b[3:6], comb[1:3]), run=0.5)
        self.go(7086.03, FadeIn(comb[3]), TransformFromCopy(r2[2:4], comb[4]), run=0.6)
        self.go(7087.93, TransformFromCopy(r3[1:], comb[5:]), run=0.4)


class K19_ProductSolve(Shot):
    def body(self):
        self.title("Product of x and y", animate=False)
        eq, r1b, r2, r3, comb = prod_rows()
        pax, cur, P, L = prod_graph()
        self.add(eq, r1b, r2, r3, comb, pax, pax.labels, cur, P, L)
        self.go(7089.41, FadeOut(r1b), FadeOut(r2), FadeOut(r3), comb.animate.move_to([-3.3, 0.45, 0]), run=0.6)
        eqx = comb[5].get_x()
        bxs = VGroup(box(comb[2], YEL, buff=0.08), box(comb[4], YEL, buff=0.08))
        self.go(7090.47, *[Create(x) for x in bxs], run=0.5)
        self.go(7092.71, Circumscribe(comb[0], color=ORG, buff=0.08), run=0.5)
        row2 = M("xy'", "+", "2yy'", "=", "-y", size=62)
        row2[0][1:].set_color(PINK); row2[2][2:].set_color(PINK)
        at_eq(row2, 3, eqx, -0.65)
        self.go(7094.67, FadeOut(bxs), TransformFromCopy(comb[2:5], row2[0:3]), TransformFromCopy(comb[5], row2[3]), TransformFromCopy(comb[0], row2[4]), run=0.8)
        row3 = pk(M("y'", "(x+2y)", "=", "-y", size=62), 0)
        at_eq(row3, 2, eqx, -1.75)
        self.go(7099.6, Circumscribe(VGroup(row2[0][1:], row2[2][2:]), color=PINK, buff=0.06), run=0.6)
        self.go(7101.35, Write(row3[0]), run=0.3)
        self.go(7101.97, Write(row3[1]), run=0.7)
        self.go(7103.61, Write(row3[2:]), run=0.5)
        row4 = pk(M("y'", "=", r"-\frac{y}{x+2y}", size=62), 0)
        at_eq(row4, 1, eqx, -3.0)
        self.go(7106.29, Write(row4), run=0.9)
        self.go(7109.6, *[m.animate.set_opacity(0.35) for m in (eq, comb, row2, row3)], run=0.4)
        self.go(7111.13, Circumscribe(L, color=ORG, buff=0.08), run=0.5)
        sub = pk(M("y'", "=", r"-\frac{2}{1+4}", size=62), 0)
        for i in (1, 3, 5):
            sub[2][i].set_color(ORG)
        at_eq(sub, 1, eqx, -3.0)
        self.go(7112.59, ReplacementTransform(row4, sub), run=0.7)
        fin = M("y'", "=", r"-\frac{2}{5}", size=62)
        fin[0].set_color(PINK)
        at_eq(fin, 1, eqx, -3.0)
        self.go(7115.29, ReplacementTransform(sub, fin), run=0.6)
        d = np.array([1, -0.4, 0]); d /= np.linalg.norm(d)
        p = np.array(pax.c2p(1, 2))
        tl = Line(p - d * 1.5, p + d * 1.5, color=PINK, stroke_width=5).set_z_index(4)
        self.go(7115.95, Create(answer_box(fin)), draw(tl, 0.6), run=0.6)
        self.wipe(7117.15, run=0.4)


# ================================================================ the pattern, then the folium

def pattern_rows():
    def row(*items):
        g = VGroup(*items).arrange(RIGHT, buff=0.2)
        return g
    nums = [M(s, size=56, color=ORG) for s in ("1", "2", "3", "4")]
    r1 = row(H("differentiate everything", 50))
    r1b = row(H("every y term gets a", 42, DIM), M("y'", size=52, color=PINK))
    r2 = row(H("gather the", 50), M("y'", size=58, color=PINK), H("terms on one side", 50))
    r3 = row(H("factor out", 50), M("y'", size=58, color=PINK))
    r4 = row(H("divide", 50))
    rows = [r1, r1b, r2, r3, r4]
    for r, y in zip(rows, (1.35, 0.5, -0.55, -1.6, -2.65)):
        r.move_to([-4.3 + r.width / 2, y, 0])
    r1b.shift(RIGHT * 0.5)
    for n, r in zip(nums, (r1, r2, r3, r4)):
        n.move_to([-5.0, r.get_y(), 0])
    return nums, rows


class K19_Pattern(Shot):
    def body(self):
        self.title("Product of x and y", animate=False)
        self.title("The Pattern", 7117.73)
        nums, (r1, r1b, r2, r3, r4) = pattern_rows()
        self.go(7120.31, FadeIn(nums[0]), Write(r1), run=0.6)
        self.go(7122.13, Write(r1b), run=0.6)
        self.go(7125.61, FadeIn(nums[1]), Write(r2), run=0.7)
        self.go(7128.53, FadeIn(nums[2]), Write(r3), run=0.5)
        self.go(7130.33, FadeIn(nums[3]), Write(r4), run=0.4)


class K19_Folium(Shot):
    def body(self):
        self.title("The Pattern", animate=False)
        nums, rows = pattern_rows()
        self.add(*nums, *rows)
        self.wipe(7131.5, run=0.35)
        self.title("The Scary One", 7131.9)
        eq = M("x^3", "+", "y^3", "=", "6xy", size=74).move_to([-3.3, 1.55, 0])
        self.go(7133.25, Write(eq), run=1.2)
        fax = axes((-4, 4, 1), (-4, 4, 1), x_length=4.4, y_length=4.4, center=(3.5, -0.65, 0), nums=False)
        fol = folium(fax)
        self.go(7137.05, Create(fax), FadeIn(fax.labels), run=0.5)
        self.go(7137.6, draw(fol, 1.4))
        self.title("Folium of Descartes", 7139.13)
        P = Dot(fax.c2p(3, 3), radius=0.09, color=ORG).set_z_index(7)
        L = M("(3,3)", size=42, color=ORG).next_to(P, UR, buff=0.1)
        self.go(7143.45, FadeIn(P), FadeIn(L), run=0.5)
        c1 = M("27+27", "=", "54", size=58)
        at_eq(c1, 1, -3.0, 0.35)
        c2 = M(r"6\cdot 3\cdot 3", "=", "54", size=58)
        at_eq(c2, 1, -3.0, -0.75)
        tk = tick_mark(s=0.42).next_to(VGroup(c1, c2), RIGHT, buff=0.4)
        self.go(7146.37, Write(c1[0]), run=0.7)
        self.go(7147.89, Write(c1[1:]), run=0.35)
        self.go(7149.51, Write(c2[0]), run=0.8)
        self.go(7151.01, Write(c2[1:]), run=0.3)
        self.go(7152.35, Create(tk), run=0.4)
        self.go(7152.85, FadeOut(c1), FadeOut(c2), FadeOut(tk), run=0.3)
        ex = -3.8
        d1 = at_eq(M(D + "(x^3)", "=", "3x^2", size=56), 1, ex, 0.45)
        d2 = at_eq(pk(M(D + "(y^3)", "=", "3y^2", "y'", size=56), 3), 1, ex, -0.9)
        d3 = at_eq(pk(M(D + "(6xy)", "=", "6y", "+", "6x", "y'", size=56), 5), 1, ex, -2.25)
        self.go(7153.39, Write(d1[0]), run=0.5)
        self.go(7155.03, Write(d1[1:]), run=0.45)
        self.go(7156.33, Write(d2[0]), run=0.5)
        self.go(7157.85, Write(d2[1:3]), run=0.45)
        self.go(7158.77, Write(d2[3]), run=0.3)
        self.go(7160.0, Write(d3[0]), run=0.45)
        pn = H("product rule", 36, YEL).move_to([d3[0].get_x() + 0.3, -3.25, 0])
        self.go(7161.15, FadeIn(pn, shift=UP * 0.1), run=0.4)
        self.go(7162.27, Write(d3[1:3]), run=0.5)
        self.go(7163.27, Write(d3[3:5]), run=0.45)
        self.go(7164.19, Write(d3[5]), run=0.35)
