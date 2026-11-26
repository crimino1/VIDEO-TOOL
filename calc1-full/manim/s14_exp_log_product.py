"""Builder 14: e^x is its own derivative (live tangent: slope = height), where e comes from (base slider, the limit
(a^h-1)/h reaching exactly 1), a^x and ln a, ln x (live tangent: slope = 1/x), log_a x, a mixed example, a practice,
then the product rule: the wrong guess, the rule, the check, the growing rectangle with its two strips, three examples.
Colours: first = BLUE, second = ORG, anything differentiated = PINK."""
from common import *

D = r"\frac{d}{dx}"
LIMH = r"\lim_{h\to 0}"


# ---------------------------------------------------------------- local helpers

def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


def col(m, cs):
    """Colour parts of a MathTex: cs = {part index: colour}."""
    for k, c in cs.items():
        m[k].set_color(c)
    return m


def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


_DG = {}


def digits(s, size=46, color=PINK):
    """A number from cached glyphs (no new LaTeX per frame)."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.04, aligned_edge=DOWN)
    return g


def readout(label, fn, pos, size=46, color=PINK, nd=1):
    """'label = 1.8' with the number live from fn()."""
    lab = M(label, size=size, color=color).move_to(pos)
    num = always_redraw(lambda: digits(f"{round(fn(), nd) + 0:.{nd}f}", size, color).next_to(lab, RIGHT, buff=0.16))
    return VGroup(lab, num)


def rule_line(size=80):
    """(fg)' = f'g + fg' with first BLUE, second ORG, derivatives PINK."""
    m = M(r"(f\,g)'", "=", "f'", "g", "+", "f", "g'", size=size)
    m[0][1].set_color(BLUE); m[0][2].set_color(ORG)
    return col(m, {2: PINK, 3: ORG, 5: BLUE, 6: PINK})


def fs_table(first, dfirst, second, dsecond, y0=0.6, gap=0.95, size=60):
    """Two rows: 'first  x^2 -> 2x' and 'second  e^x -> e^x'. Returns [(label, fn, arrow, deriv), ...]."""
    spec = (("first", BLUE, first, dfirst), ("second", ORG, second, dsecond))
    As = [M(a, size=size, color=c).move_to([-0.9, y0 - k * gap, 0]) for k, (_, c, a, _) in enumerate(spec)]
    x0 = max(A.get_right()[0] for A in As) + 0.35
    rows = []
    for k, ((lab, c, a, b), A) in enumerate(zip(spec, As)):
        y = y0 - k * gap
        L = H(lab, 40, c)
        L.move_to([-2.5 - L.width / 2, y, 0])
        ar = Arrow([x0, y, 0], [x0 + 1.1, y, 0], buff=0, color=DIM, stroke_width=4, tip_length=0.2,
                   max_tip_length_to_length_ratio=0.3)
        B = M(b, size=size, color=PINK).next_to(ar, RIGHT, buff=0.3)
        rows.append((L, A, ar, B))
    return rows


def wipe_but(scene, t, *keep, run=0.4):
    """Erase the board except anything sharing a family with keep (slices written separately count too)."""
    scene.at(t)
    kid = {id(x) for k in keep for x in k.get_family()}
    ms = [m for m in scene.board() if not any(id(x) in kid for x in m.get_family())]
    if ms:
        scene.play(*[FadeOut(m) for m in ms], run_time=run)


def unclock(*ms):
    for m in ms:
        for x in m.get_family():
            x.clear_updaters()


# ================================================================ e^x

class K14_OwnSlope(Shot):
    def body(self):
        # the board exactly as K13_ExpIntro leaves it
        self.title("The Exponential", animate=False)
        e = M("e", r"\approx", "2.718", size=72).move_to([0, 1.2, 0])
        e[0].set_color(YEL); e[2].set_color(ORG)
        ex = M(D, "e^x", "=", "e^x", size=96).move_to([0, -1.1, 0])
        ex[1].set_color(BLUE); ex[3].set_color(PINK)
        u1, u2 = under(ex[1]), under(ex[3])
        self.add(e, ex, u1, u2)

        self.title("Its Own Derivative", 5031.04)
        self.play(FadeOut(e), FadeOut(u1), FadeOut(u2), ex.animate.move_to([0, 1.25, 0]), run_time=0.6)
        ff = M("f'", "=", "f", size=80).move_to([0, -0.55, 0])
        col(ff, {0: PINK, 2: BLUE})
        self.go(5033.24, Write(ff), run=0.7)
        only = M("f", "=", "C", r"\,e^x", size=80)
        col(only, {0: BLUE, 2: ORG, 3: BLUE})
        at_eq(only, 1, ff[1].get_x(), -2.2)
        self.go(5035.88, Write(VGroup(only[0], only[1], only[3])), run=0.7)
        self.go(5037.06, Write(only[2]), run=0.4)
        lab = H("only", 44, YEL).next_to(only, LEFT, buff=0.6)
        self.go(5038.42, FadeIn(lab, shift=RIGHT * 0.15), run=0.4)
        cn = H("any number", 34, ORG).next_to(only[2], DOWN, buff=0.25)
        self.go(5039.22, FadeIn(cn, shift=UP * 0.1), run=0.4)
        self.wipe(5041.08)

        # slope = height, live
        self.title("Slope = Height", 5042.56)
        f = np.exp
        ax = axes((-3, 3, 1), (0, 9, 2), x_length=7.0, y_length=4.9, center=(-2.1, -0.85, 0))
        self.go(5043.06, Create(ax), FadeIn(ax.labels), run=0.5)
        c = curve(ax, f, [-3, 2.18])
        self.play(draw(c, run=0.7))
        xt = ValueTracker(0.0)
        tan = always_redraw(lambda: tangent(ax, f, xt.get_value(), 3.0))
        dot = always_redraw(lambda: pt(ax, xt.get_value(), f(xt.get_value()), PINK))
        hbar = always_redraw(lambda: DashedLine(ax.c2p(xt.get_value(), 0), ax.c2p(xt.get_value(), f(xt.get_value())),
                                                color=BLUE, stroke_width=4, dash_length=0.1))
        ro_s = readout(r"\text{slope} =", lambda: slope(f, xt.get_value()), [3.9, 0.2, 0], 52, PINK)
        ro_h = readout(r"\text{height} =", lambda: f(xt.get_value()), [3.75, -1.0, 0], 52, BLUE)
        ro_h[0].align_to(ro_s[0], RIGHT)
        self.go(5044.32, Create(tan), FadeIn(dot), FadeIn(ro_s), run=0.6)
        self.go(5045.98, Create(hbar), FadeIn(ro_h), run=0.6)
        self.go(5049.04, Circumscribe(ro_h, color=BLUE, buff=0.12), run=0.9)
        self.go(5050.42, Circumscribe(ro_s, color=PINK, buff=0.12), run=0.9)
        self.go(5052.06, xt.animate.set_value(1.0), run=1.2)
        self.go(5053.36, Circumscribe(ro_h, color=BLUE, buff=0.12), run=0.9)
        self.go(5055.34, Circumscribe(ro_s, color=PINK, buff=0.12), run=0.9)
        self.go(5056.74, xt.animate.set_value(2.0), run=2.4)
        self.go(5059.86, Circumscribe(VGroup(ro_s, ro_h), color=YEL, buff=0.15), run=1.0)
        unclock(tan, dot, hbar, ro_s, ro_h)
        self.wipe(5062.1)


class K14_DefineE(Shot):
    def body(self):
        self.title("Slope = Height", animate=False)
        self.title("Where e Comes From", 5063.2)
        r1 = M(D, "2^x", "=", "2^x", r"\cdot", LIMH, r"\frac{2^h-1}{h}", r"\approx", "0.69", size=60).move_to([0, 1.45, 0])
        col(r1, {1: BLUE, 3: BLUE, 5: YEL, 6: YEL, 8: ORG})
        self.go(5068.84, Write(r1[0:2]), run=0.6)
        self.go(5070.34, Write(r1[2:5]), run=0.6)
        self.go(5072.38, Write(r1[5:7]), run=1.0)
        bx = box(r1[5:7], YEL, buff=0.12)
        self.go(5075.62, Create(bx), run=0.5)
        self.go(5079.68, Write(r1[7:9]), run=0.6)

        # slide the base: the limit is about 0.69 for 2, 1.10 for 3, exactly 1 at e
        L = 9.0
        p = lambda a: np.array([(a - 2.5) * L, -1.75, 0])
        nl = Line(p(1.95), p(3.05), color=DIM, stroke_width=3)
        ticks = VGroup(*[Line(p(a) + UP * 0.1, p(a) + DOWN * 0.1, color=DIM, stroke_width=3) for a in np.arange(2, 3.01, 0.1)])
        nums = VGroup(*[M(s, size=40, color=FAINT).next_to(p(a) + DOWN * 0.1, DOWN, buff=0.15) for a, s in ((2, "2"), (2.5, "2.5"), (3, "3"))])
        base = H("base", 36, DIM).next_to(p(1.95), LEFT, buff=0.3)
        at = ValueTracker(2.0)
        dot = always_redraw(lambda: Dot(p(at.get_value()), radius=0.12, color=ORG).set_z_index(3))
        aval = always_redraw(lambda: digits(f"{at.get_value():.2f}", 40, ORG).next_to(p(at.get_value()), UP, buff=0.3))
        lab = M(LIMH, r"\frac{a^h-1}{h}", r"\approx", size=60).move_to([-0.6, -0.35, 0])
        lab[0:2].set_color(YEL)
        live = always_redraw(lambda: digits(f"{np.log(at.get_value()):.2f}", 60,
                                            YEL if abs(at.get_value() - np.e) < 0.004 else ORG).next_to(lab, RIGHT, buff=0.25))
        self.go(5081.0, FadeOut(bx), Create(nl), Create(ticks), FadeIn(nums), FadeIn(base), FadeIn(dot), FadeIn(aval),
                FadeIn(lab), FadeIn(live), run=0.6)
        self.go(5082.14, at.animate.set_value(3.0), run=1.7)
        self.go(5085.5, at.animate.set_value(np.e), run=2.6)
        self.go(5088.54, Circumscribe(VGroup(lab, live), color=YEL, buff=0.15), run=0.9)
        el = M("e", r"\approx", "2.718", size=56, color=YEL).next_to(p(np.e), DOWN, buff=0.75)
        self.go(5090.12, FadeIn(el, shift=UP * 0.1), run=0.5)
        r2 = M(D, "e^x", "=", "e^x", size=72).move_to(r1)
        col(r2, {1: BLUE, 3: PINK})
        self.go(5092.84, ReplacementTransform(r1, r2), run=0.9)
        unclock(dot, aval, live)
        self.wipe(5094.3)


class K14_OtherBases(Shot):
    def body(self):
        self.title("Where e Comes From", animate=False)
        self.title("Other Bases", 5094.9)
        r = M(D, "a^x", "=", "a^x", r"\cdot", r"\ln a", size=76).move_to([0, 1.3, 0])
        col(r, {1: BLUE, 3: PINK, 5: YEL})
        self.go(5096.12, Write(r[0:2]), run=0.6)
        self.go(5097.7, Write(r[2:4]), run=0.6)
        self.go(5098.82, Write(r[4:6]), run=0.7)
        fr = panel(r, PURP, buff=0.3)
        self.go(5100.1, Create(fr), run=0.6)
        two = M(D, "2^x", "=", "2^x", r"\cdot", r"\ln 2", size=68)
        col(two, {1: BLUE, 3: PINK, 5: YEL})
        at_eq(two, 2, r[2].get_x(), -1.05)
        self.go(5101.18, Write(two[0:2]), run=0.6)
        self.go(5102.74, Write(two[2:4]), run=0.6)
        self.go(5103.92, Write(two[4:6]), run=0.5)
        ap = M(r"\approx", "0.69", size=60, color=ORG).next_to(two[5], DOWN, buff=0.8)
        self.go(5107.22, Write(ap), run=0.6)
        nt = note("the limit from before", ap, LEFT, color=YEL, size=36, dist=0.8, angle=0.5)
        self.go(5108.24, FadeIn(nt[0], shift=RIGHT * 0.1), Create(nt[1]), run=0.6)

        e3 = M(D, "e^x", "=", "e^x", r"\cdot", r"\ln e", size=68)
        col(e3, {1: BLUE, 3: PINK, 5: YEL})
        at_eq(e3, 2, r[2].get_x(), -1.05)
        self.go(5110.76, FadeOut(ap), FadeOut(nt), ReplacementTransform(two, e3), run=0.7)
        one = M("1", size=68, color=YEL).move_to(e3[5])
        self.go(5112.88, ReplacementTransform(e3[5], one), run=0.5)
        s = strike(VGroup(e3[4], one))
        self.go(5113.88, Create(s), run=0.4)
        rest = VGroup(e3[0], e3[1], e3[2], e3[3])
        self.go(5114.62, FadeOut(VGroup(e3[4], one, s)), rest.animate.shift(LEFT * rest.get_center()[0]), run=0.6)
        ab = answer_box(rest)
        self.go(5115.3, Create(ab), run=0.5)
        nat = note("the natural choice", rest[1], DL, color=YEL, size=38, dist=0.6)
        self.go(5116.84, FadeIn(nat[0], shift=UP * 0.1), Create(nat[1]), run=0.6)
        self.wipe(5118.5)


class K14_NaturalLog(Shot):
    def body(self):
        self.title("Other Bases", animate=False)
        self.title("The Natural Log", 5119.2)
        r = M(D, r"\ln x", "=", r"\frac{1}{x}", size=76).move_to([0, 1.5, 0])
        col(r, {1: BLUE, 3: PINK})
        self.go(5120.7, Write(r[0:2]), run=0.7)
        self.go(5122.4, Write(r[2:4]), run=0.7)

        f = np.log
        ax = axes((0, 5, 1), (-2, 2, 1), x_length=6.4, y_length=3.4, center=(-2.2, -1.45, 0))
        self.go(5124.24, Create(ax), FadeIn(ax.labels), run=0.6)
        c = curve(ax, f, [0.14, 4.9])
        self.play(draw(c, run=0.8))
        xt = ValueTracker(1.0)
        tan = always_redraw(lambda: tangent(ax, f, xt.get_value(), 2.6))
        dot = always_redraw(lambda: pt(ax, xt.get_value(), f(xt.get_value()), PINK))
        ro_s = readout(r"\text{slope} =", lambda: slope(f, xt.get_value()), [3.9, -0.75, 0], 52, PINK, nd=2)
        ro_x = readout(r"1/x =", lambda: 1 / xt.get_value(), [4.35, -1.85, 0], 52, PINK, nd=2)
        ro_x[0].align_to(ro_s[0], RIGHT)
        self.go(5126.42, Create(tan), FadeIn(dot), FadeIn(ro_s), FadeIn(ro_x), run=0.6)
        self.go(5127.54, xt.animate.set_value(2.0), run=1.6)
        lt = H("proved in Chapter 7", 36, DIM).move_to([4.6, 1.5, 0])
        self.go(5129.78, FadeIn(lt, shift=LEFT * 0.1), xt.animate.set_value(4.0), run=1.8)
        self.go(5132.3, xt.animate.set_value(0.5), run=2.4)
        rb = box(r, YEL, buff=0.18)
        self.go(5136.74, Create(rb), run=0.5)
        unclock(tan, dot, ro_s, ro_x)
        wipe_but(self, 5137.9, r, rb)

        lg = M(D, r"\log_a x", "=", r"\frac{1}{x\,\ln a}", size=76)
        col(lg, {1: BLUE, 3: PINK})
        lg[3][3:].set_color(YEL)
        at_eq(lg, 2, r[2].get_x(), -1.2)
        self.go(5139.14, Write(lg[0:2]), run=0.8)
        self.go(5141.0, Write(lg[2:4]), run=0.8)
        self.go(5142.32, Circumscribe(lg[3][3:], color=YEL, buff=0.08), run=0.6)
        self.wipe(5143.45, run=0.35)


class K14_Together(Shot):
    def body(self):
        self.title("The Natural Log", animate=False)
        self.title("Put Them Together", 5144.32)
        f = M("f(x)", "=", "3e^x", "-", r"4\ln x", "+", "x^2", size=68)
        at_eq(f, 1, -3.2, 1.25)
        col(f, {2: BLUE, 4: BLUE, 6: BLUE})
        self.go(5145.98, Write(f[0:2]), run=0.5)
        self.go(5146.92, Write(f[2]), run=0.5)
        self.go(5148.16, Write(f[3:5]), run=0.7)
        self.go(5149.98, Write(f[5:7]), run=0.6)
        g = M("f'(x)", "=", "3e^x", "-", r"\frac{4}{x}", "+", "2x", size=68)
        at_eq(g, 1, -3.2, -1.45)
        col(g, {0: PINK, 2: PINK, 4: PINK, 6: PINK})

        def arr(i):
            return Arrow(f[i].get_bottom() + DOWN * 0.15, g[i].get_top() + UP * 0.15, buff=0, color=DIM,
                         stroke_width=4, tip_length=0.18, max_tip_length_to_length_ratio=0.25)
        a2, a4, a6 = arr(2), arr(4), arr(6)
        u = under(f[2])
        self.go(5151.6, Create(u), run=0.4)
        self.go(5152.64, Create(a2), TransformFromCopy(f[2], g[2]), run=0.7)
        self.go(5154.22, Transform(u, under(f[3:5])), run=0.4)
        self.go(5156.0, Create(a4), TransformFromCopy(f[3:5], g[3:5]), run=0.7)
        self.go(5157.8, Transform(u, under(f[5:7])), run=0.4)
        self.go(5158.74, Create(a6), TransformFromCopy(f[5:7], g[5:7]), run=0.6)
        self.go(5159.8, FadeOut(u), Write(g[0:2]), run=0.6)
        self.go(5164.36, Create(answer_box(g)), run=0.5)
        self.wipe(5165.2)


class K14_TryOne(Shot):
    def body(self):
        self.title("Try One", 5167.9)
        p = M("y", "=", "6x^4", "-", r"\frac{3}{x}", "+", "e^x", size=68)
        at_eq(p, 1, -3.0, 1.45)
        col(p, {2: BLUE, 4: BLUE, 6: BLUE})
        self.play(Write(p[0:3]), run_time=0.8)
        self.go(5169.36, Write(p[3:5]), run=0.8)
        self.go(5170.86, Write(p[5:7]), run=0.7)
        a = M("y'", "=", "24x^3", "+", r"\frac{3}{x^2}", "+", "e^x", size=68)
        at_eq(a, 1, -3.0, -2.55)
        col(a, {0: PINK, 2: PINK, 4: PINK, 6: PINK})
        u = under(p[2])
        self.go(5172.94, Create(u), Write(a[0:2]), run=0.6)
        self.go(5174.6, TransformFromCopy(p[2], a[2]), run=0.8)

        w = M(r"-\frac{3}{x}", "=", r"-3x^{-1}", r"\;\to\;", r"-(-3x^{-2})", "=", r"+\frac{3}{x^2}", size=60).move_to([0, -0.55, 0])
        col(w, {6: PINK, 4: PINK})
        self.go(5176.62, Transform(u, under(p[3:5])), run=0.4)
        self.go(5177.56, TransformFromCopy(p[3:5], w[0]), Write(w[1:3]), run=0.8)
        self.go(5180.64, Write(w[3:5]), run=1.0)
        self.go(5184.52, Write(w[5:7]), run=0.7)
        self.go(5185.6, TransformFromCopy(w[6], a[3:5]), run=0.6)
        self.go(5186.9, Transform(u, under(p[6])), run=0.4)
        self.go(5187.76, TransformFromCopy(p[6], a[6]), Write(a[5]), run=0.6)
        self.go(5188.84, FadeOut(u), run=0.3)
        self.go(5190.56, Create(answer_box(a)), run=0.6)
        self.go(5195.82, Circumscribe(w, color=YEL, buff=0.15), run=1.0)
        b1 = box(w[4][0:3], YEL, buff=0.08)
        b2 = box(w[6][0], YEL, buff=0.08)
        self.go(5197.92, Create(b1), run=0.5)
        self.go(5199.06, Create(b2), run=0.5)
        self.wipe(5201.6)


# ================================================================ the product rule

class K14_ProductWarn(Shot):
    def body(self):
        self.title("Try One", animate=False)
        self.title("The Product Rule", 5202.6)
        fg = M("f(x)", r"\cdot", "g(x)", size=84).move_to([0, 1.0, 0])
        col(fg, {0: BLUE, 2: ORG})
        self.go(5204.94, Write(fg[0]), run=0.5)
        self.go(5205.64, Write(fg[1:3]), run=0.6)
        no = M(r"(f\,g)'", r"\neq", "f'", r"\,", "g'", size=84).move_to([0, -1.1, 0])
        no[0][1].set_color(BLUE); no[0][2].set_color(ORG)
        col(no, {1: RED, 2: PINK, 4: PINK})
        self.go(5211.82, Write(no[0]), run=0.7)
        self.go(5213.26, Write(no[1]), run=0.4)
        self.go(5213.62, Write(no[2:5]), run=0.6)
        u = under(no[2:5], YEL)
        self.go(5216.54, Create(u), run=0.5)
        cm = cross_mark(s=0.3).next_to(no, RIGHT, buff=0.6)
        self.go(5218.34, FadeOut(u), Create(cm), run=0.5)
        self.wipe(5219.4)

        eqx = 0.6
        r1 = at_eq(col(M("x^2", r"\cdot", "x^3", "=", "x^5", size=68), {0: BLUE, 2: ORG}), 3, eqx, 1.5)
        r2 = at_eq(col(M(r"(x^5)'", "=", "5x^4", size=68), {2: GRN}), 1, eqx, 0.2)
        r3 = at_eq(col(M("2x", r"\cdot", "3x^2", "=", "6x^3", size=68), {0: PINK, 2: PINK, 4: RED}), 3, eqx, -2.1)
        self.go(5222.04, Write(r1[0]), run=0.4)
        self.go(5222.74, Write(r1[1:3]), run=0.6)
        self.go(5225.0, Write(r1[3:5]), run=0.5)
        self.go(5226.8, Write(r2[0:2]), run=0.6)
        self.go(5227.58, Write(r2[2]), run=0.5)
        tk = tick_mark(s=0.5).next_to(r2, RIGHT, buff=0.5)
        self.play(Create(tk), run_time=0.4)
        lab = H("each derivative, multiplied", 36, DIM).next_to(r3, UP, buff=0.22).align_to(r3, LEFT)
        self.go(5229.96, FadeIn(lab, shift=UP * 0.1), run=0.5)
        self.go(5232.72, Write(r3[0]), run=0.5)
        self.go(5233.38, Write(r3[1:3]), run=0.7)
        self.go(5235.32, Write(r3[3:5]), run=0.6)
        self.go(5236.54, Circumscribe(r3[4], color=RED, buff=0.1), Circumscribe(r2[2], color=GRN, buff=0.1), run=0.8)
        cm2 = cross_mark(s=0.3).next_to(r3, RIGHT, buff=0.5)
        self.go(5238.36, Create(cm2), run=0.4)


class K14_ProductRule(Shot):
    def body(self):
        self.title("The Product Rule", animate=False)
        r = rule_line(90).move_to([0, 0.95, 0])
        self.go(5242.4, Write(r[0]), run=0.6)
        self.go(5244.26, Write(r[1:3]), run=0.6)
        self.go(5245.68, Write(r[3]), run=0.4)
        self.go(5246.14, Write(r[4]), run=0.4)
        self.go(5246.9, Write(r[5]), run=0.4)
        self.go(5248.16, Write(r[6]), run=0.5)
        fr = panel(r, PURP, buff=0.3)
        self.go(5249.36, Create(fr), run=0.5)
        w = M(r"d(\text{first})", r"\cdot", r"\text{second}", "+", r"\text{first}", r"\cdot", r"d(\text{second})", size=68)
        col(w, {0: PINK, 2: ORG, 4: BLUE, 6: PINK}).move_to([0, -1.45, 0])
        self.go(5250.8, TransformFromCopy(r[2], w[0]), run=0.7)
        self.go(5252.08, Write(w[1]), TransformFromCopy(r[3], w[2]), run=0.7)
        self.go(5253.14, Write(w[3]), run=0.4)
        self.go(5253.88, TransformFromCopy(r[5], w[4]), run=0.6)
        self.go(5254.48, Write(w[5]), TransformFromCopy(r[6], w[6]), run=0.8)
        self.wipe(5256.45)


class K14_RuleCheck(Shot):
    def body(self):
        self.title("The Product Rule", animate=False)
        self.title("Check It", 5257.3)
        r = rule_line(60).move_to([0, 1.7, 0])
        self.play(FadeIn(r, shift=DOWN * 0.1), run_time=0.3)
        t = [col(M("f", "=", "x^2", size=58), {0: BLUE, 2: BLUE}), col(M("g", "=", "x^3", size=58), {0: ORG, 2: ORG}),
             col(M("f'", "=", "2x", size=58), {0: PINK, 2: PINK}), col(M("g'", "=", "3x^2", size=58), {0: PINK, 2: PINK})]
        for m, (x, y) in zip(t, [(-2.8, 0.55), (2.8, 0.55), (-2.8, -0.4), (2.8, -0.4)]):
            at_eq(m, 1, x, y)
        for m, tt in zip(t, (5259.22, 5260.44, 5262.14, 5264.26)):
            self.go(tt, Write(m), run=0.6)

        c = M("2x", r"\cdot", "x^3", "+", "x^2", r"\cdot", "3x^2", size=64).move_to([0, -1.6, 0])
        col(c, {0: PINK, 2: ORG, 4: BLUE, 6: PINK})
        u = under(r[2:4])
        self.go(5266.56, Create(u), run=0.4)
        self.go(5269.36, TransformFromCopy(t[2][2], c[0]), run=0.6)
        self.go(5270.34, Write(c[1]), TransformFromCopy(t[1][2], c[2]), run=0.6)
        s = M("=", "2x^4", "+", "3x^4", "=", "5x^4", size=64)
        s[1].set_x(c[0:3].get_x()); s[3].set_x(c[4:7].get_x()); s[2].set_x(c[3].get_x())
        s[0].next_to(s[1], LEFT, buff=0.3)
        s[4].next_to(s[3], RIGHT, buff=0.3); s[5].next_to(s[4], RIGHT, buff=0.3)
        s.set_y(-2.85)
        self.go(5271.4, Write(s[0:2]), run=0.6)
        self.go(5272.88, Transform(u, under(r[5:7])), Write(c[3]), run=0.5)
        self.go(5276.4, TransformFromCopy(t[0][2], c[4]), run=0.5)
        self.go(5277.08, Write(c[5]), TransformFromCopy(t[3][2], c[6]), run=0.6)
        self.go(5278.56, Write(s[2:4]), run=0.6)
        self.go(5280.14, FadeOut(u), run=0.3)
        self.go(5281.0, Write(s[4:6]), run=0.6)
        s[5].set_color(GRN)
        self.go(5283.06, Create(answer_box(s[5])), run=0.5)
        self.play(Create(tick_mark(s=0.45).next_to(s[5], RIGHT, buff=0.45)), run_time=0.4)
        self.wipe(5284.4)


class K14_Rectangle(Shot):
    def body(self):
        self.title("Check It", animate=False)
        self.title("Why Two Terms?", 5285.14)
        O = np.array([-5.7, -3.0, 0])
        W, Hh = 5.3, 3.4
        df, dg, cv = ValueTracker(0.001), ValueTracker(0.001), ValueTracker(1.0)

        def R(x0, y0, x1, y1, c, op, sw=3):
            return Polygon([x0, y0, 0], [x1, y0, 0], [x1, y1, 0], [x0, y1, 0], stroke_color=c, stroke_width=sw,
                           fill_color=c, fill_opacity=op)
        main = R(O[0], O[1], O[0] + W, O[1] + Hh, CHALK, 0, 5)
        self.go(5287.94, Create(main), run=0.8)
        fl = M("f", size=60, color=BLUE).next_to(main, DOWN, buff=0.2)
        gl = M("g", size=60, color=ORG).next_to(main, LEFT, buff=0.25)
        self.go(5289.22, Write(fl), run=0.4)
        self.go(5290.58, Write(gl), run=0.4)
        ar = M("f", r"\,", "g", size=64)
        col(ar, {0: BLUE, 2: ORG}).move_to(main)
        self.go(5291.58, main.animate.set_fill(CHALK, 0.1), Write(ar), run=0.7)

        X1, Y1 = O[0] + W, O[1] + Hh
        side = always_redraw(lambda: R(X1, O[1], X1 + df.get_value(), Y1, PINK, 0.35))
        top = always_redraw(lambda: R(O[0], Y1, X1, Y1 + dg.get_value(), PINK, 0.35))
        corner = always_redraw(lambda: R(X1, Y1, X1 + df.get_value(), Y1 + dg.get_value(), RED, 0.55 * cv.get_value(),
                                         3 * cv.get_value()))
        dfl = M("df", size=48, color=PINK).add_updater(lambda m: m.move_to([X1 + df.get_value() / 2, fl.get_y(), 0]))
        dgl = M("dg", size=48, color=PINK).add_updater(lambda m: m.move_to([gl.get_x() - 0.1, Y1 + dg.get_value() / 2, 0]))
        self.add(side, top, corner)
        self.go(5294.3, df.animate.set_value(0.9), dg.animate.set_value(0.75), FadeIn(dfl), FadeIn(dgl), run=1.8)
        self.go(5297.44, Circumscribe(VGroup(side, top), color=YEL, buff=0.08), run=0.9)

        sl = M("df", r"\cdot", "g", size=56)
        col(sl, {0: PINK, 2: ORG}).add_updater(lambda m: m.next_to([X1 + df.get_value(), O[1] + Hh / 2, 0], RIGHT, buff=0.3))
        tl = M("f", r"\cdot", "dg", size=56)
        col(tl, {0: BLUE, 2: PINK}).add_updater(lambda m: m.next_to([O[0] + W / 2, Y1 + dg.get_value(), 0], UP, buff=0.22))
        self.go(5299.22, Circumscribe(side, color=PINK, buff=0.05), run=0.8)
        self.go(5300.76, Write(sl), run=0.8)
        self.go(5303.46, Circumscribe(top, color=PINK, buff=0.05), run=0.8)
        self.go(5304.86, Write(tl), run=0.8)
        cl = M("df", r"\cdot", "dg", size=44, color=RED).add_updater(
            lambda m: m.next_to([X1 + df.get_value(), Y1 + dg.get_value(), 0], UR, buff=0.12))
        self.go(5307.56, Circumscribe(corner, color=RED, buff=0.06), run=0.7)
        self.go(5309.14, Write(cl), run=0.6)
        self.go(5311.16, df.animate.set_value(0.32), dg.animate.set_value(0.26), run=1.5)
        self.go(5312.76, cv.animate.set_value(0), FadeOut(cl), run=0.6)
        self.go(5314.22, Circumscribe(side, color=YEL, buff=0.05), Circumscribe(top, color=YEL, buff=0.05), run=0.8)
        r = rule_line(64).move_to([4.5, -0.1, 0])
        self.go(5315.54, Write(r[0:2]), TransformFromCopy(sl, r[2:4]), run=0.8)
        self.play(Write(r[4]), TransformFromCopy(tl, r[5:7]), run_time=0.8)
        unclock(side, top, corner, dfl, dgl, sl, tl, cl)
        self.wipe(5317.65)


class K14_ExOne(Shot):
    def body(self):
        self.title("Why Two Terms?", animate=False)
        self.title("Real Examples", 5318.5)
        p = M("y", "=", "x^2", r"\,", "e^x", size=72).move_to([0, 1.6, 0])
        col(p, {2: BLUE, 4: ORG})
        self.go(5320.22, Write(p[0:3]), run=0.5)
        self.go(5321.14, Write(p[3:5]), run=0.4)
        (L1, A1, a1, B1), (L2, A2, a2, B2) = fs_table("x^2", "2x", "e^x", "e^x")
        self.go(5321.94, FadeIn(L1, shift=RIGHT * 0.1), TransformFromCopy(p[2], A1), run=0.5)
        self.go(5323.56, GrowArrow(a1), Write(B1), run=0.5)
        self.go(5324.92, FadeIn(L2, shift=RIGHT * 0.1), TransformFromCopy(p[4], A2), run=0.5)
        self.go(5326.68, GrowArrow(a2), Write(B2), run=0.5)
        y = M("y'", "=", "2x", r"\cdot", "e^x", "+", "x^2", r"\cdot", "e^x", size=68)
        col(y, {0: PINK, 2: PINK, 4: ORG, 6: BLUE, 8: PINK})
        at_eq(y, 1, -2.6, -1.75)
        self.go(5328.2, Write(y[0:2]), run=0.4)
        self.go(5328.8, TransformFromCopy(B1, y[2]), run=0.5)
        self.go(5329.58, Write(y[3]), TransformFromCopy(A2, y[4]), run=0.5)
        self.go(5330.4, Write(y[5]), run=0.3)
        self.go(5330.96, TransformFromCopy(A1, y[6]), run=0.5)
        self.go(5331.6, Write(y[7]), TransformFromCopy(B2, y[8]), run=0.5)
        self.go(5332.3, Create(answer_box(y)), run=0.4)
        fx = M("=", r"x\,e^x", "(2+x)", size=68)
        at_eq(fx, 0, y[1].get_x(), -3.0)
        self.go(5333.98, Write(fx[0:2]), run=0.6)
        self.go(5336.8, Write(fx[2]), run=0.5)


class K14_ExTwo(Shot):
    def body(self):
        self.title("Real Examples", animate=False)
        p = M("y", "=", "x^3", r"\,", r"\ln x", size=72).move_to([0, 1.6, 0])
        col(p, {2: BLUE, 4: ORG})
        self.go(5338.12, Write(p[0:3]), run=0.5)
        self.go(5339.26, Write(p[3:5]), run=0.5)
        (L1, A1, a1, B1), (L2, A2, a2, B2) = fs_table("x^3", "3x^2", r"\ln x", "1/x")
        self.go(5340.38, FadeIn(L1, shift=RIGHT * 0.1), TransformFromCopy(p[2], A1), run=0.5)
        self.go(5342.5, GrowArrow(a1), Write(B1), run=0.6)
        self.go(5344.32, FadeIn(L2, shift=RIGHT * 0.1), TransformFromCopy(p[4], A2), run=0.5)
        self.go(5346.38, GrowArrow(a2), Write(B2), run=0.5)
        y = M("y'", "=", "3x^2", r"\cdot", r"\ln x", "+", "x^3", r"\cdot", r"\frac{1}{x}", size=68)
        col(y, {0: PINK, 2: PINK, 4: ORG, 6: BLUE, 8: PINK})
        at_eq(y, 1, -2.6, -1.75)
        self.go(5347.96, Write(y[0:2]), run=0.4)
        self.go(5348.5, TransformFromCopy(B1, y[2]), run=0.5)
        self.go(5349.7, Write(y[3]), TransformFromCopy(A2, y[4]), run=0.3)
        self.go(5350.01, Write(y[5]), run=0.3)
        self.go(5350.89, TransformFromCopy(A1, y[6]), run=0.4)
        self.go(5351.61, Write(y[7]), TransformFromCopy(B2, y[8]), run=0.5)
        self.go(5352.85, Circumscribe(y[6:9], color=YEL, buff=0.1), run=0.7)
        y2 = M("y'", "=", "3x^2", r"\ln x", "+", "x^2", size=68)
        col(y2, {0: PINK, 2: PINK, 3: ORG, 5: GRN})
        at_eq(y2, 1, -2.6, -1.75)
        self.go(5354.45, *[ReplacementTransform(y[i], y2[j]) for i, j in ((0, 0), (1, 1), (2, 2), (4, 3), (5, 4))],
                FadeOut(y[3]), ReplacementTransform(y[6:9], y2[5]), run=0.8)
        self.go(5357.99, Create(answer_box(y2)), run=0.5)
        fx = M("=", "x^2", r"(3\ln x+1)", size=68)
        at_eq(fx, 0, y2[1].get_x(), -3.0)
        self.go(5359.85, Write(fx[0:2]), run=0.6)
        self.go(5361.57, Write(fx[2]), run=0.8)


class K14_TryTwo(Shot):
    def body(self):
        self.title("Try One", 5365.6)
        p = M("y", "=", "(x^2+1)", r"\,", r"\ln x", size=72).move_to([0, 1.6, 0])
        col(p, {2: BLUE, 4: ORG})
        self.go(5366.89, Write(p[0:3]), run=0.7)
        self.go(5368.37, Write(p[3:5]), run=0.5)
        (L1, A1, a1, B1), (L2, A2, a2, B2) = fs_table("x^2+1", "2x", r"\ln x", "1/x")
        self.go(5369.95, FadeIn(L1, shift=RIGHT * 0.1), TransformFromCopy(p[2], A1), run=0.6)
        self.go(5372.43, GrowArrow(a1), Write(B1), run=0.6)
        self.go(5374.03, FadeIn(L2, shift=RIGHT * 0.1), TransformFromCopy(p[4], A2), run=0.6)
        self.go(5376.23, GrowArrow(a2), Write(B2), run=0.6)
        y = M("y'", "=", "2x", r"\,", r"\ln x", "+", r"\frac{x^2+1}{x}", size=68)
        col(y, {0: PINK, 2: PINK, 4: ORG})
        y[6][0:4].set_color(BLUE); y[6][4:].set_color(PINK)
        at_eq(y, 1, -2.6, -1.95)
        self.go(5378.25, Write(y[0:2]), run=0.5)
        self.go(5379.07, TransformFromCopy(B1, y[2]), TransformFromCopy(A2, y[4]), run=0.8)
        self.go(5381.23, Write(y[5]), run=0.4)
        self.go(5381.87, TransformFromCopy(A1, y[6][0:4]), TransformFromCopy(B2, y[6][4:]), run=0.9)
        self.go(5383.0, Create(answer_box(y)), run=0.5)
        # the table has done its job: clear it and lift the answer so the split has room
        tab = VGroup(L1, A1, a1, B1, L2, A2, a2, B2)
        tid = {id(x) for m in (tab, p) for x in m.get_family()}
        ans = Group(*[m for m in self.board() if not any(id(x) in tid for x in m.get_family())])
        self.go(5384.33, FadeOut(tab), ans.animate.shift(UP * 1.25), run=0.6)
        sp = M(r"\frac{x^2+1}{x}", "=", "x", "+", r"\frac{1}{x}", size=64)
        sp.shift(np.array([y[6].get_x(), -2.75, 0]) - sp[0].get_center())
        self.go(5385.27, TransformFromCopy(y[6], sp[0]), run=0.6)
        self.go(5386.31, Write(sp[1:3]), run=0.5)
        self.go(5386.85, Write(sp[3:5]), run=0.6)
        tk = tick_mark(s=0.45).next_to(sp, RIGHT, buff=0.5)
        self.go(5389.33, Create(tk), run=0.4)
