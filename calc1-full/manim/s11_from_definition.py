"""Builder 11: middle of Chapter 4. x^2 -> 2x and its slopes on the parabola, 3x+5 -> 3, constants -> 0,
x^2+2x (the Chapter 1 algebra in disguise), 1/x -> -1/x^2 (combine fractions), sqrt(x) -> 1/(2 sqrt x) (conjugate),
why the definition matters, try x^2-4x, tangent lines (x^2 at 3), the recipe, and the next try-it problem."""
from common import *

LIMH = r"\lim_{h\to 0}"
sq = lambda x: x * x


# ---------------------------------------------------------------- local helpers

def fr(top, bot, size=64, color=CHALK):
    """Hand-built fraction (same as builder 10, so the opening board matches): .n .bar .d"""
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
    """lhs = lim_{h->0} fraction, level with the bar (builder 10's layout). .l .e .lim .f"""
    l = M(lhs, size=size, color=PINK)
    e = M("=", size=size)
    lim = M(LIMH, size=size)
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


def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


_DG = {}


def digits(s, size=46, color=PINK):
    """A number from cached glyphs (no new LaTeX per frame). Minus signs sit at mid height."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.04, aligned_edge=DOWN)
    ref = [m for m, ch in zip(g, s) if ch.isdigit()][0]
    for m, ch in zip(g, s):
        if ch == "-":
            m.set_y(ref.get_y())
    return g


def tan_live(ax, f, xt, pos=None, length=2.6, size=46):
    """Sliding tangent + touching dot; with pos, a 'slope = 1.8' readout there (cached digits)."""
    g = VGroup(always_redraw(lambda: tangent(ax, f, xt.get_value(), length)),
               always_redraw(lambda: pt(ax, xt.get_value(), f(xt.get_value()), PINK)))
    if pos is not None:
        lab = M(r"\text{slope} =", size=size, color=PINK).move_to(pos)
        num = always_redraw(lambda: digits(f"{round(slope(f, xt.get_value()), 1) + 0:.1f}", size).next_to(lab, RIGHT, buff=0.18).align_to(lab, DOWN))
        g.add(lab, num)
    return g


def tint(*ms, color=YEL):
    return [m.animate.set_color(color) for m in ms]


def gone(*ms):
    """h -> 0: the h pieces sink and fade."""
    return [FadeOut(m, shift=DOWN * 0.25, scale=0.6) for m in ms]


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


def strikes(*ms):
    return [Create(strike(m)) for m in ms]


# ================================================================ x^2 -> 2x, slopes everywhere

class K11_TwoX(Shot):
    def body(self):
        # builder 10's closing board, standing: f'(x) = lim (2x + h)
        self.title("For Any x", animate=False)
        R = def_row("f'(x)", ["f(x+h)", "-", "f(x)"], "h", size=64, center=(-0.6, -1.45, 0))
        g = M("f(x)", "=", "x^2", size=56).move_to([-4.6, 1.6, 0])
        g[0].set_color(BLUE)
        side = M("f(x+h)", "=", "(x+h)^2", "=", "x^2+2xh+h^2", size=54).move_to([0.3, 0.45, 0])
        rest = M("(", "2x", "+h", ")", size=64)
        rest.next_to(R.lim, RIGHT, buff=0.18)
        rest.shift(UP * (R.e.get_y() - rest.get_y()))
        self.add(g, side, R.l, R.e, R.lim, rest)
        # let h go to 0
        self.go("1:05:40.92", *tint(R.lim, rest[2]), run=0.4)
        self.go("1:05:41.40", *gone(R.lim, rest[2]), FadeOut(rest[0]), FadeOut(rest[3]), run=0.7)
        ans = M("2x", size=64, color=PINK).next_to(R.e, RIGHT, buff=0.22)
        self.go("1:05:42.38", ReplacementTransform(rest[1], ans), run=0.5)
        ab = answer_box(ans)
        self.play(Create(ab), run_time=0.4)
        # the result moves up to the right: one formula
        f1 = M("f(x)", "=", "x^2", size=56).move_to([3.7, 1.75, 0])
        f1[0].set_color(BLUE)
        f2 = M("f'(x)", "=", "2x", size=60, color=PINK)
        at_eq(f2, 1, f1[1].get_x(), 0.85)
        self.title("One Formula", "1:05:43.74")
        self.play(FadeOut(side), FadeOut(ab), ReplacementTransform(g, f1),
                  ReplacementTransform(VGroup(R.l, R.e, ans), f2), run_time=0.8)
        self.go("1:05:45.68", Create(under(f2)), run=0.5)
        # the parabola with a tangent that reads its own slope
        ax = axes((-3, 4, 1), (-2, 10, 2), x_length=6.4, y_length=5.0, center=(-2.9, -0.85, 0), y_label=None)
        par = curve(ax, sq, [-3, 3.15])
        self.go("1:05:46.88", Create(ax), FadeIn(ax.labels), run=0.6)
        self.play(draw(par, 0.6, BLUE))
        xt = ValueTracker(3)
        live = tan_live(ax, sq, xt, pos=(-5.0, 1.95, 0), length=2.4)
        self.go("1:05:48.08", FadeIn(live), run=0.4)
        rows = VGroup(M("f'(3)", "=", r"2\cdot 3", "=", "6", size=48),
                      M("f'(1)", "=", r"2\cdot 1", "=", "2", size=48),
                      M("f'(0)", "=", r"2\cdot 0", "=", "0", size=48),
                      M("f'(-2)", "=", r"2\cdot(-2)", "=", "-4", size=48))
        for i, r in enumerate(rows):
            at_eq(r, 1, 2.75, -0.3 - 0.85 * i)
            r[4].set_color(PINK)
        self.go("1:05:48.84", Write(rows[0][0:2]), run=0.5)
        self.go("1:05:49.34", Write(rows[0][2]), run=0.5)
        self.go("1:05:50.72", Write(rows[0][3:]), run=0.4)
        self.go("1:05:51.62", xt.animate.set_value(1), run=1.0)
        self.go("1:05:53.10", Write(rows[1]), run=0.7)
        self.go("1:05:54.30", xt.animate.set_value(0), run=1.0)
        self.go("1:05:55.68", Write(rows[2]), run=0.7)
        flat = note("flat", ax.c2p(0, 0), np.array([1, -0.7, 0]), color=YEL, size=40, dist=0.6)
        self.go("1:05:59.96", FadeIn(flat[0], shift=UP * 0.1), Create(flat[1]), run=0.5)
        self.go("1:06:00.58", FadeOut(flat), xt.animate.set_value(-2), run=1.4)
        self.go("1:06:03.24", Write(rows[3]), run=0.8)
        down = note("downhill", ax.c2p(-2, 4), np.array([1, 0.55, 0]), color=YEL, size=40, dist=0.7, angle=0.6)
        self.go("1:06:05.86", FadeIn(down[0], shift=UP * 0.1), Create(down[1]), run=0.5)
        self.go("1:06:07.28", FadeOut(down), xt.animate.set_value(3), run=2.4)
        self.go("1:06:09.62", Circumscribe(f2, color=PINK, buff=0.15), run=0.9)


# ================================================================ a straight line, a constant

def line_board():
    ax = axes((-3, 3, 1), (-4, 10, 2), x_length=6.0, y_length=5.0, center=(-2.6, -0.85, 0), y_label=None)
    ln = curve(ax, lambda x: 3 * x + 5, [-3, 1.6])
    f1 = M("f(x)", "=", "3x+5", size=56).move_to([3.6, 1.45, 0])
    f1[0].set_color(BLUE)
    f2 = M("f'(x)", "=", "3", size=56, color=PINK)
    at_eq(f2, 1, f1[1].get_x(), 0.45)
    return ax, ln, f1, f2


class K11_Line(Shot):
    def body(self):
        self.title("A Few More", "1:06:10.76")
        D = def_row("f'(x)", ["f(x+h)", "-", "f(x)"], "h", size=64, center=(0, 0.2, 0))
        self.go("1:06:12.12", Write(D), run=0.9)
        self.go("1:06:15.30", FadeOut(D), run=0.4)
        self.title("A Straight Line")
        EX = -2.0
        r0 = at_eq(M("f(x)", "=", "3x+5", size=56), 1, EX, 1.65)
        r0[0].set_color(BLUE)
        r1 = at_eq(M("f(x+h)", "=", "3(x+h)+5", "=", "3x+3h+5", size=56), 1, EX, 0.6)
        r2 = at_eq(M(r"\frac{f(x+h)-f(x)}{h}", "=", r"\frac{", "3x", "+", "3h", "+5", "-3x", "-5", "}{", "{h}", "}", size=56),
                   1, EX, -0.95)
        r3 = at_eq(M("f'(x)", "=", LIMH, "3", "=", "3", size=56), 1, EX, -2.75)
        r3[0].set_color(PINK)
        self.go("1:06:17.52", Write(r0[0]), run=0.5)
        self.go("1:06:18.16", Write(r0[1:]), run=0.7)
        self.go("1:06:20.64", Write(r1[0]), run=0.6)
        self.go("1:06:22.28", Write(r1[1:3]), run=1.2)
        self.go("1:06:25.50", Write(r1[3:]), run=1.0)
        self.go("1:06:28.40", Write(r2[0:2]), run=0.7)
        self.go("1:06:29.18", Write(r2[2:]), run=0.8)
        k1, k2, k3, k4 = (strike(r2[i]) for i in (3, 7, 6, 8))
        self.go("1:06:30.36", Create(k1), Create(k2), run=0.35)
        self.play(Create(k3), Create(k4), run_time=0.35)
        self.go("1:06:31.30", r2[5].animate.set_color(YEL), run=0.4)
        r2b = at_eq(M(r"\frac{f(x+h)-f(x)}{h}", "=", r"\frac{", "3h", "}{", "{h}", "}", size=56), 1, EX, -0.95)
        r2b[3].set_color(YEL)
        self.go("1:06:32.32", FadeOut(VGroup(r2[3], r2[4], r2[6], r2[7], r2[8], k1, k2, k3, k4)),
                *[ReplacementTransform(r2[i], r2b[j]) for i, j in ((0, 0), (1, 1), (5, 3), (9, 4), (10, 5))], run=0.7)
        eq3 = M("=", "3", size=56).next_to(r2b, RIGHT, buff=0.25)
        eq3.shift(UP * (r2b[1].get_y() - eq3[0].get_y()))
        self.go("1:06:33.10", Create(strike(r2b[3][1])), Create(strike(r2b[5])), run=0.4)
        self.go("1:06:33.62", Write(eq3), run=0.4)
        self.go("1:06:34.72", Write(r3[0:4]), run=0.8)
        self.go("1:06:36.64", Write(r3[4:]), run=0.4)
        b3 = answer_box(r3[5])
        self.go("1:06:40.28", Create(b3), run=0.4)
        # the graph: slope 3 everywhere
        ax, ln, f1, f2 = line_board()
        self.go("1:06:41.34", *[FadeOut(m) for m in self.board()],
                TransformFromCopy(r0, f1), TransformFromCopy(VGroup(r3[0], r3[1], r3[5]), f2), run=0.7)
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.6)
        self.go("1:06:43.70", draw(ln, 0.8, BLUE))
        rr = rise_run(ax, 0, 5, 1, 5, PINK, size=40, run_tex="1", rise_tex="3")
        self.go("1:06:44.84", Create(rr), run=0.6)
        xt = ValueTracker(-2.6)
        live = tan_live(ax, lambda x: 3 * x + 5, xt, pos=(-4.6, 1.75, 0), length=2.0)
        self.go("1:06:45.86", FadeOut(rr), FadeIn(live), run=0.4)
        self.go("1:06:46.40", xt.animate.set_value(1.3), run=2.4)
        self.go("1:06:49.70", Circumscribe(f2, color=PINK, buff=0.15), run=0.9)


class K11_Const(Shot):
    def body(self):
        self.title("A Straight Line", animate=False)
        ax, ln, f1, f2 = line_board()
        self.add(ax, ax.labels, ln, f1, f2)
        self.title("A Constant", "1:06:54.30")
        c1 = M("f(x)", "=", "7", size=56).move_to(f1)
        c1[0].set_color(BLUE)
        flat = curve(ax, lambda x: 7, [-3, 2.9])
        self.go("1:06:55.28", FadeOut(f1), FadeOut(f2), run=0.4)
        self.go("1:06:55.54", Write(c1), run=0.7)
        self.go("1:06:56.30", Transform(ln, flat), run=1.0)
        xt = ValueTracker(-2.5)
        live = tan_live(ax, lambda x: 7, xt, pos=(-4.6, 1.75, 0), length=2.0)
        self.go("1:06:59.00", FadeIn(live), run=0.3)
        self.play(xt.animate.set_value(1.0), run_time=1.1)
        c2 = M("f'(x)", "=", "0", size=56, color=PINK)
        at_eq(c2, 1, c1[1].get_x(), 0.45)
        self.go("1:07:00.52", Write(c2), run=0.6)
        gen = M("f(x)=c", r"\;\Rightarrow\;", "f'(x)=0", size=52)
        gen[2].set_color(PINK)
        gen.move_to([3.6, -1.2, 0])
        self.go("1:07:01.52", Write(gen), run=0.8)
        gb = answer_box(gen)
        self.play(Create(gb), run_time=0.4)
        self.go("1:07:03.42", xt.animate.set_value(-2.5), run=2.2)
        self.play(Circumscribe(gen[2], color=GRN, buff=0.12), run_time=0.8)


# ================================================================ x^2 + 2x: the Chapter 1 algebra was a derivative

class K11_Disguise(Shot):
    def body(self):
        self.title("Next One", "1:07:06.88")
        r0 = M("f(x)", "=", "x^2+2x", size=56).move_to([3.9, 1.8, 0])
        r0[0].set_color(BLUE)
        self.go("1:07:07.56", Write(r0[0]), run=0.5)
        self.go("1:07:08.44", Write(r0[1:]), run=0.7)
        EX = -1.2
        c1 = at_eq(M("f(a+h)-f(a)", "=", "2ah", "+h^2", "+2h", size=56), 1, EX, 0.45)
        c2 = at_eq(M("f(x+h)-f(x)", "=", "2xh", "+h^2", "+2h", size=56), 1, EX, 0.45)
        ch = pill("Chapter 1", DIM, 34, width=3)
        ch.move_to([c1.get_left()[0] + ch.width / 2, 1.3, 0])
        self.go("1:07:10.60", FadeIn(ch, shift=UP * 0.1), run=0.5)
        self.go("1:07:12.46", Write(c1[0:2]), run=1.0)
        self.go("1:07:15.12", Write(c1[2]), run=0.5)
        self.go("1:07:16.16", Write(c1[3]), run=0.5)
        self.go("1:07:17.18", Write(c1[4]), run=0.5)
        self.go("1:07:19.64", *[ReplacementTransform(a, b) for a, b in zip(c1, c2)], run=0.9)
        r2 = at_eq(M("f'(x)", "=", LIMH, r"\frac{", "2x", "h", "+", "h^2", "+2", "h", "}{", "{h}", "}", size=56), 1, EX, -1.15)
        r2[0].set_color(PINK)
        self.go("1:07:21.46", Write(r2[0:3]), run=0.6)
        self.go("1:07:21.96", TransformFromCopy(c2[2], VGroup(r2[4], r2[5])), run=0.6)
        self.go("1:07:23.00", TransformFromCopy(c2[3], VGroup(r2[6], r2[7])), run=0.6)
        self.go("1:07:24.52", TransformFromCopy(c2[4], VGroup(r2[8], r2[9])), run=0.6)
        self.go("1:07:25.16", Create(r2[10]), Write(r2[11]), run=0.6)
        hs = [r2[5], r2[7][0], r2[9]]
        self.go("1:07:27.42", *tint(*hs, r2[11]), run=0.5)
        self.go("1:07:28.58", *strikes(*hs, r2[11]), run=0.5)
        r3 = at_eq(M("=", LIMH, "(2x", "+h", "+2)", size=56), 0, r2[1].get_x(), -2.85)
        self.go("1:07:29.56", Write(r3), run=1.0)
        r4 = at_eq(M("=", "2x+2", size=56), 0, r2[1].get_x(), -2.85)
        r4[1].set_color(PINK).shift(RIGHT * 0.22)
        self.go("1:07:31.80", *tint(r3[1], r3[3]), run=0.4)
        self.go("1:07:32.40", *gone(r3[1], r3[3]), run=0.6)
        self.go("1:07:33.44", ReplacementTransform(VGroup(r3[0], r3[2], r3[4]), r4), run=0.6)
        self.play(Create(answer_box(r4[1])), run_time=0.4)
        nt = note("a derivative\nin disguise", c2[2:], RIGHT, color=YEL, size=38, dist=0.55, angle=0.5)
        self.go("1:07:36.66", FadeIn(nt[0], shift=UP * 0.1), Create(nt[1]), run=0.6)
        self.go("1:07:38.46", Circumscribe(c2, color=YEL, buff=0.12), run=0.9)


# ================================================================ 1/x -> -1/x^2

class K11_RecipSetup(Shot):
    def body(self):
        self.title("A Harder One", "1:07:40.40")
        r0 = M("f(x)", "=", r"\frac{1}{x}", size=56).move_to([-4.0, 1.75, 0])
        r0[0].set_color(BLUE)
        r0b = M("f(x+h)", "=", r"\frac{1}{x+h}", size=56).move_to([1.0, 1.75, 0])
        self.go("1:07:43.80", Write(r0[0]), run=0.5)
        self.go("1:07:44.86", Write(r0[1:]), run=0.6)
        self.go("1:07:46.30", Write(r0b[0]), run=0.6)
        self.go("1:07:47.70", Write(r0b[1:]), run=0.7)
        r1 = M("f'(x)", "=", LIMH, r"\frac{", r"\dfrac{1}{x+h}", "-", r"\dfrac{1}{x}", "}{", "{h}", "}", size=60)
        r1[0].set_color(PINK)
        r1.move_to([-1.0, -0.2, 0])
        self.go("1:07:49.78", Write(r1[0:3]), run=0.6)
        self.go("1:07:50.40", TransformFromCopy(r0b[2], r1[4]), run=0.7)
        self.go("1:07:51.74", Write(r1[5]), run=0.3)
        self.go("1:07:52.24", TransformFromCopy(r0[2], r1[6]), run=0.6)
        self.go("1:07:53.68", Create(r1[7]), Write(r1[8]), run=0.6)
        u1, u2 = under(r1[4], buff=0.06), under(r1[6], buff=0.06)
        self.go("1:07:55.98", Create(u1), Create(u2), run=0.5)
        cf = pill("combine fractions", DIM, 36, width=3).move_to([4.6, -0.2, 0])
        self.go("1:07:57.92", FadeOut(u1), FadeOut(u2), FadeIn(cf, shift=UP * 0.1), run=0.5)
        cd = VGroup(H("common denominator", 40, DIM), M("x(x+h)", size=56, color=YEL)).arrange(RIGHT, buff=0.35)
        cd.move_to([0, -1.9, 0])
        self.go("1:07:59.24", FadeIn(cd[0], shift=UP * 0.1), run=0.5)
        self.go("1:08:00.26", Write(cd[1]), run=0.7)
        v1 = M(r"\frac{1}{x+h}", "=", r"\frac{x}{x(x+h)}", size=56).move_to([-3.3, -3.1, 0])
        v2 = M(r"\frac{1}{x}", "=", r"\frac{x+h}{x(x+h)}", size=56).move_to([3.0, -3.1, 0])
        self.go("1:08:02.20", Write(v1[0]), run=0.5)
        self.go("1:08:03.52", Write(v1[1:]), run=0.9)
        self.go("1:08:06.30", Write(v2[0]), run=0.5)
        self.go("1:08:07.40", Write(v2[1:]), run=0.9)


class K11_RecipFinish(Shot):
    def body(self):
        self.title("A Harder One", animate=False)
        A = M(r"\frac{x}{x(x+h)}", "-", r"\frac{x+h}{x(x+h)}", "=", r"\frac{", "x-x", "-h", "}{", "x(x+h)", "}",
              "=", r"\frac{-h}{x(x+h)}", size=54).move_to([0, 1.5, 0])
        self.go("1:08:10.38", FadeIn(A[0:3], shift=DOWN * 0.1), run=0.5)
        self.go("1:08:11.70", Write(A[3:10]), run=1.0)
        self.go("1:08:12.90", Create(strike(A[5])), run=0.4)
        self.go("1:08:14.06", Write(A[10:]), run=0.6)
        self.go("1:08:15.44", Circumscribe(A[11], color=YEL, buff=0.1), run=0.8)
        EX = -2.6
        B = at_eq(M("f'(x)", "=", LIMH, r"\frac{-", "h", "}{x(x+h)}", r"\cdot", r"\frac{1}{", "{h}", "}", size=56), 1, EX, -0.2)
        B[0].set_color(PINK)
        self.go("1:08:19.04", Write(B[0:3]), TransformFromCopy(A[11], VGroup(B[3], B[4], B[5])), run=0.7)
        self.go("1:08:19.86", Write(B[6:]), run=0.5)
        self.go("1:08:21.40", *strikes(B[4], B[8]), run=0.45)
        C = at_eq(M("=", LIMH, r"\frac{-1}{x(x+", "h", ")}", size=56), 0, B[1].get_x(), -1.75)
        self.go("1:08:22.68", Write(C), run=1.0)
        self.go("1:08:26.84", *tint(C[1], C[3]), run=0.5)
        D = M("=", r"\frac{-1}{x\cdot x}", "=", r"-\frac{1}{x^2}", size=56).next_to(C, RIGHT, buff=0.35)
        D.shift(UP * (C[0].get_y() - D[0].get_y()))
        D[3].shift(RIGHT * 0.1)
        D[3].set_color(PINK)
        self.go("1:08:28.52", Write(D[0:2]), C[1].animate.set_color(FAINT), C[3].animate.set_color(FAINT), run=0.8)
        self.go("1:08:30.84", Write(D[2:]), run=0.7)
        db = answer_box(D[3])
        self.play(Create(db), run_time=0.4)
        # the result, and the graph that agrees
        f1 = M("f(x)", "=", r"\frac{1}{x}", size=56).move_to([3.7, 1.3, 0])
        f1[0].set_color(BLUE)
        f2 = at_eq(M("f'(x)", "=", r"-\frac{1}{x^2}", size=56, color=PINK), 1, f1[1].get_x(), -0.2)
        self.go("1:08:33.70", *[FadeOut(m) for m in self.board()], FadeIn(f1),
                TransformFromCopy(D[3], f2[2]), FadeIn(f2[0:2]), run=0.8)
        fb = answer_box(f2)
        self.play(Create(fb), run_time=0.4)
        self.title("Always Downhill", "1:08:38.04")
        rf = lambda x: 1 / x
        ax = axes((-4, 4, 2), (-4, 4, 2), x_length=5.6, y_length=5.0, center=(-3.0, -0.85, 0), y_label=None)
        cl, cr = curve(ax, rf, [-4, -0.25]), curve(ax, rf, [0.25, 4])
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.5)
        self.play(draw(cr, 0.6, BLUE), draw(cl, 0.6, BLUE))
        xt = ValueTracker(0.65)
        live = tan_live(ax, rf, xt, pos=(3.0, -2.2, 0), length=2.0)
        self.go("1:08:39.74", FadeIn(live), run=0.3)
        self.play(xt.animate.set_value(3.6), run_time=1.2)
        xl = ValueTracker(-3.6)
        live2 = tan_live(ax, rf, xl, pos=(3.0, -2.2, 0), length=2.0)
        self.go("1:08:41.34", FadeOut(live), FadeIn(live2), run=0.4)
        self.play(xl.animate.set_value(-0.65), run_time=1.8)


# ================================================================ sqrt(x) -> 1/(2 sqrt x)

class K11_SqrtSetup(Shot):
    def body(self):
        self.title("Using the Conjugate", "1:08:45.16")
        r0 = M("f(x)", "=", r"\sqrt{x}", size=56).move_to([-4.2, 1.6, 0])
        r0[0].set_color(BLUE)
        self.go("1:08:46.78", Write(r0[0]), run=0.5)
        self.go("1:08:48.16", Write(r0[1:]), run=0.6)
        EX = -3.2
        r1 = at_eq(M("f'(x)", "=", LIMH, r"\frac{\sqrt{x+h}-\sqrt{x}}{h}", size=58), 1, EX, 0.1)
        r1[0].set_color(PINK)
        self.go("1:08:49.80", Write(r1[0:3]), run=0.6)
        self.go("1:08:50.92", Write(r1[3]), run=1.3)
        lab = TX(r"plug in $h=0$", 40, DIM).move_to([4.5, 0.85, 0])
        pl = M(r"\frac{\sqrt{x}-\sqrt{x}}{0}", "=", r"\frac{0}{0}", size=54).move_to([4.5, -0.3, 0])
        pl[2].set_color(YEL)
        self.go("1:08:55.52", FadeIn(lab, shift=UP * 0.1), run=0.4)
        self.go("1:08:56.42", Write(pl[0]), run=0.8)
        self.go("1:08:57.90", Write(pl[1:]), run=0.5)
        cj = pill("conjugate", YEL, 40).move_to([3.7, 0.1, 0])
        self.go("1:09:00.76", FadeOut(lab), FadeOut(pl), FadeIn(cj, shift=UP * 0.1), run=0.5)
        conj = r"\frac{\sqrt{x+h}+\sqrt{x}}{\sqrt{x+h}+\sqrt{x}}"
        r2 = at_eq(M("=", LIMH, r"\frac{\sqrt{x+h}-\sqrt{x}}{h}", r"\cdot", conj, size=58), 0, r1[1].get_x(), -2.0)
        r2[4].set_color(YEL)
        self.go("1:09:02.40", Write(r2[0:2]), TransformFromCopy(r1[3], r2[2]), run=0.7)
        self.go("1:09:03.36", Write(r2[3]), run=0.3)
        self.go("1:09:04.22", Write(r2[4]), run=1.2)


class K11_SqrtFinish(Shot):
    def body(self):
        self.title("Using the Conjugate", animate=False)
        conj = r"\frac{\sqrt{x+h}+\sqrt{x}}{\sqrt{x+h}+\sqrt{x}}"
        top = M("f'(x)", "=", LIMH, r"\frac{\sqrt{x+h}-\sqrt{x}}{h}", r"\cdot", conj, size=52).move_to([-1.2, 1.5, 0])
        top[0].set_color(PINK)
        top[5].set_color(YEL)
        self.add(top)
        EX = top[1].get_x()
        r3 = at_eq(M("=", LIMH, r"\frac{", "x", "+h", "-x", "}{", "{h}", r"(\sqrt{x+h}+\sqrt{x})", "}", size=56), 0, EX, -0.3)
        self.go("1:09:07.30", Write(r3[0:2]), run=0.5)
        self.go("1:09:07.88", Write(r3[2:7]), run=0.9)
        self.go("1:09:09.20", *strikes(r3[3], r3[5]), run=0.45)
        self.go("1:09:10.42", r3[4].animate.set_color(YEL), run=0.4)
        self.go("1:09:11.86", Write(r3[7:]), run=1.3)
        self.go("1:09:15.72", *strikes(r3[4][1], r3[7]), run=0.45)
        r4 = at_eq(M("=", LIMH, r"\frac{1}{\sqrt{x+", "h", r"}+\sqrt{x}}", size=56), 0, EX, -2.05)
        self.go("1:09:16.88", Write(r4), run=1.0)
        self.go("1:09:20.84", *tint(r4[1], r4[3]), run=0.5)
        r4b = at_eq(M("=", r"\frac{1}{\sqrt{x}+\sqrt{x}}", size=56), 0, EX, -2.05)
        self.go("1:09:22.32", ReplacementTransform(r4, r4b), run=0.8)
        r5 = M("=", r"\frac{1}{2\sqrt{x}}", size=56).next_to(r4b, RIGHT, buff=0.35)
        r5.shift(UP * (r4b[0].get_y() - r5[0].get_y()))
        r5[1].shift(RIGHT * 0.1)
        r5[1].set_color(PINK)
        self.go("1:09:24.46", Write(r5), run=0.7)
        self.play(Create(answer_box(r5[1])), run_time=0.4)
        s1 = M("f(x)", "=", r"\sqrt{x}", size=54).move_to([4.4, -1.2, 0])
        s1[0].set_color(BLUE)
        s2 = at_eq(M("f'(x)", "=", r"\frac{1}{2\sqrt{x}}", size=54, color=PINK), 1, s1[1].get_x(), -2.7)
        self.go("1:09:26.98", Write(s1), run=0.7)
        self.go("1:09:28.84", Write(s2[0:2]), TransformFromCopy(r5[1], s2[2]), run=0.8)
        self.play(Create(answer_box(s2)), run_time=0.4)


# ================================================================ why the definition matters

def test_paper():
    pg = Rectangle(width=4.6, height=4.2, stroke_color=CHALK, stroke_width=4)
    head = H("Test", 44).move_to(pg.get_top() + DOWN * 0.45 + LEFT * 1.1)
    name = Line(pg.get_top() + DOWN * 0.55 + RIGHT * 0.2, pg.get_top() + DOWN * 0.55 + RIGHT * 1.7, color=DIM, stroke_width=3)
    q = H("use the definition", 36, YEL).move_to(pg.get_center() + UP * 0.55)
    ls = VGroup(*[Line(pg.get_left() + RIGHT * 0.35 + DOWN * (0.25 + 0.5 * i), pg.get_right() + LEFT * 0.35 + DOWN * (0.25 + 0.5 * i),
                       color=FAINT, stroke_width=2) for i in range(3)])
    return VGroup(pg, head, name, ls), q


class K11_WhyDef(Shot):
    def body(self):
        self.title("From the Definition", "1:09:31.18")
        pairs = [("x^2", "2x"), ("3x+5", "3"), ("7", "0"), ("x^2+2x", "2x+2"), (r"\frac{1}{x}", r"-\frac{1}{x^2}"),
                 (r"\sqrt{x}", r"\frac{1}{2\sqrt{x}}")]
        head = VGroup(M("f(x)", size=48, color=BLUE), M("f'(x)", size=48, color=PINK))
        tab = VGroup()
        y = 1.55
        for i, (a, b) in enumerate(pairs):
            ma, mb = M(a, size=44, color=BLUE), M(b, size=44, color=PINK)
            h = max(ma.height, mb.height)
            y -= h / 2 + (0.26 if i else 0.4)
            ma.move_to([-4.6, y, 0]); mb.move_to([-1.9, y, 0])
            y -= h / 2
            tab.add(VGroup(ma, mb))
        head[0].move_to([-4.6, 1.75, 0]); head[1].move_to([-1.9, 1.75, 0])
        rule = Line([-5.8, 1.42, 0], [-0.7, 1.42, 0], color=DIM, stroke_width=3)
        self.go("1:09:31.72", FadeIn(head), Create(rule), run=0.4)
        self.play(LaggedStart(*[FadeIn(r, shift=UP * 0.1) for r in tab], lag_ratio=0.3), run_time=1.6)
        sc = pill("Chapter 5: shortcuts", YEL, 40).move_to([3.6, 1.2, 0])
        self.go("1:09:35.90", FadeIn(sc, shift=UP * 0.1), run=0.5)
        D = def_row("f'(x)", ["f(x+h)", "-", "f(x)"], "h", size=52, center=(3.5, -1.0, 0))
        self.go("1:09:40.40", Write(D), run=0.9)
        up = Arrow(D.get_top() + UP * 0.05, sc.get_bottom() + DOWN * 0.05, buff=0.08, color=YEL, stroke_width=4, tip_length=0.2)
        self.go("1:09:42.56", GrowArrow(up), run=0.5)
        paper, q = test_paper()
        paper.move_to([-3.3, -0.85, 0]); q.move_to(paper[0].get_center() + UP * 0.55)
        self.go("1:09:44.38", FadeOut(VGroup(head, rule, tab)), run=0.4)
        self.play(Create(paper[0]), Write(paper[1]), Create(paper[2]), run_time=0.8)
        self.go("1:09:46.56", Write(q), Create(paper[3]), run=0.9)
        self.go("1:09:49.56", Circumscribe(D, color=PINK, buff=0.15), run=1.0)


# ================================================================ try one: x^2 - 4x

class K11_TryOne(Shot):
    def body(self):
        self.title("Try One", "1:09:53.30")
        p = M("f(x)", "=", "x^2-4x", size=56).move_to([-4.0, 1.7, 0])
        p[0].set_color(BLUE)
        self.go("1:09:55.40", Write(p[0]), run=0.5)
        self.go("1:09:56.70", Write(p[1:]), run=0.8)
        EX = -1.9
        r1 = at_eq(M("f(x+h)", "=", "(x+h)^2-4(x+h)", size=54), 1, EX, 0.6)
        r1b = at_eq(M("=", "x^2", "+2xh", "+h^2", "-4x", "-4h", size=54), 0, EX, -0.4)
        self.go("1:09:59.34", Write(r1[0]), run=0.6)
        self.go("1:10:01.16", Write(r1[1:]), run=1.4)
        self.go("1:10:06.02", Write(r1b[0:2]), run=0.5)
        self.go("1:10:07.16", Write(r1b[2]), run=0.6)
        self.go("1:10:08.62", Write(r1b[3]), run=0.5)
        self.go("1:10:09.98", Write(r1b[4]), run=0.5)
        self.go("1:10:11.18", Write(r1b[5]), run=0.5)
        self.go("1:10:14.52", Create(strike(r1b[1])), run=0.35)
        self.go("1:10:15.22", Create(strike(r1b[4])), run=0.35)
        r2 = at_eq(M("f'(x)", "=", LIMH, r"\frac{", "2xh", "+h^2", "-4h", "}{", "{h}", "}", size=54), 1, EX, -1.8)
        r2[0].set_color(PINK)
        self.go("1:10:16.42", Write(r2[0:3]), run=0.5)
        self.go("1:10:17.00", TransformFromCopy(r1b[2], r2[4]), run=0.5)
        self.go("1:10:18.00", TransformFromCopy(r1b[3], r2[5]), run=0.5)
        self.go("1:10:19.22", TransformFromCopy(r1b[5], r2[6]), run=0.5)
        self.go("1:10:19.92", Create(r2[7]), Write(r2[8]), run=0.5)
        r3 = at_eq(M("=", LIMH, "(2x", "+h", "-4)", size=54), 0, EX, -3.2)
        self.go("1:10:21.46", Write(r3), run=0.9)
        self.go("1:10:23.74", *tint(r3[1], r3[3]), run=0.4)
        self.play(*gone(r3[1], r3[3]), run_time=0.6)
        r4 = at_eq(M("=", "2x-4", size=54), 0, EX, -3.2)
        r4[1].set_color(PINK).shift(RIGHT * 0.22)
        self.go("1:10:25.14", ReplacementTransform(VGroup(r3[0], r3[2], r3[4]), r4), run=0.6)
        self.play(Create(answer_box(r4[1])), run_time=0.4)


# ================================================================ tangent lines

class K11_TanIdea(Shot):
    def body(self):
        self.title("Tangent Lines", "1:10:27.54")
        g = lambda x: 0.32 * (x - 1.2) ** 2 + 0.9
        ax = axes((0, 5, 1), (0, 6, 1), x_length=6.0, y_length=4.8, center=(-3.0, -0.9, 0), nums=False)
        cv = curve(ax, g, [0, 4.9])
        self.go("1:10:28.98", Create(ax), FadeIn(ax.labels), run=0.5)
        self.play(draw(cv, 0.8, BLUE))
        xt = ValueTracker(0.5)
        live = tan_live(ax, g, xt, length=2.6)
        self.go("1:10:30.40", FadeIn(live), run=0.3)
        self.play(xt.animate.set_value(3.5), run_time=2.3)
        p1 = pill("a point", ORG, 44).move_to([3.6, 1.2, 0])
        p2 = pill("a slope", PINK, 44).move_to([3.6, -0.9, 0])
        self.go("1:10:35.36", FadeIn(p1, shift=UP * 0.1), run=0.4)
        self.go("1:10:35.98", FadeIn(p2, shift=UP * 0.1), run=0.4)
        a = 3.5
        guide = DashedLine(ax.c2p(a, 0), ax.c2p(a, g(a)), color=DIM, stroke_width=3, dash_length=0.1)
        al = M("a", size=40, color=ORG).next_to(ax.c2p(a, 0), DOWN, buff=0.12)
        dot = pt(ax, a, g(a), ORG, r=0.11)
        m1 = M("(a,\\ f(a))", size=52, color=ORG).next_to(p1, DOWN, buff=0.3)
        self.go("1:10:38.42", Create(guide), FadeIn(al), FadeIn(dot, scale=0.5), run=0.5)
        self.go("1:10:39.20", Write(m1), Circumscribe(dot, color=ORG, shape=Circle, buff=0.08), run=0.8)
        m2 = M("f'(a)", size=52, color=PINK).next_to(p2, DOWN, buff=0.3)
        self.go("1:10:40.62", Write(m2), run=0.7)
        self.play(Circumscribe(live[0], color=PINK, buff=0.1), run_time=0.8)


class K11_TanX2(Shot):
    def body(self):
        self.title("Worked Example", "1:10:43.20")
        ax = axes((0, 5, 1), (0, 20, 5), x_length=5.2, y_length=4.9, center=(-3.7, -0.85, 0), y_label=None)
        par = curve(ax, sq, [0, 4.45])
        yl = M("y=x^2", size=44, color=BLUE).next_to(ax.c2p(4.4, 19.4), LEFT, buff=0.3)
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.5)
        self.play(draw(par, 0.7, BLUE), FadeIn(yl), run_time=0.7)
        guide = DashedLine(ax.c2p(3, 0), ax.c2p(3, 9), color=DIM, stroke_width=3, dash_length=0.1)
        self.go("1:10:46.08", Create(guide), run=0.5)
        EX = 1.7
        ra = at_eq(M("f(3)", "=", "9", r"\;\Rightarrow\;", "(3,\\,9)", size=50), 1, EX, 1.6)
        ra[4].set_color(ORG)
        rb = at_eq(M("f'(3)", "=", r"2\cdot 3", "=", "6", size=50), 1, EX, 0.5)
        rb[0].set_color(PINK); rb[4].set_color(PINK)
        rc = at_eq(M("y-9", "=", "6(x-3)", size=50), 1, EX, -0.65)
        rd = at_eq(M("y-9", "=", "6x-18", size=50), 1, EX, -1.65)
        re = at_eq(M("y", "=", "6x-9", size=50), 1, EX, -2.75)
        P = pt(ax, 3, 9, ORG, r=0.1)
        self.go("1:10:48.44", Write(ra[0]), run=0.5)
        self.go("1:10:49.10", Write(ra[1:3]), FadeIn(P, scale=0.5), run=0.5)
        self.go("1:10:50.52", Write(ra[3:]), run=0.7)
        self.go("1:10:52.90", Write(rb[0:2]), run=0.5)
        self.go("1:10:54.82", Write(rb[2]), run=0.5)
        self.go("1:10:56.14", Write(rb[3:]), run=0.4)
        tl = curve(ax, lambda x: 6 * x - 9, [1.6, 4.4], color=PINK).set_z_index(4)
        self.play(Create(tl), run_time=0.7)
        pf = H("point-slope form", 34, DIM).move_to([EX + 3.3, -0.02, 0])
        self.go("1:10:57.54", FadeIn(pf, shift=UP * 0.1), run=0.4)
        self.go("1:10:58.30", Write(rc[0]), run=0.5)
        self.go("1:10:59.92", Write(rc[1:]), run=1.1)
        self.go("1:11:02.66", FadeOut(pf), TransformFromCopy(rc[0:2], rd[0:2]), run=0.6)
        self.go("1:11:04.26", Write(rd[2]), run=0.7)
        self.go("1:11:06.58", TransformFromCopy(rd[1], re[1]), Write(re[0]), run=0.6)
        self.go("1:11:08.10", Write(re[2]), run=0.7)
        eb = answer_box(re)
        self.go("1:11:09.48", Create(eb), run=0.4)
        tlab = M("y=6x-9", size=42, color=PINK).move_to(ax.c2p(1.2, 15))
        self.go("1:11:11.26", FadeIn(tlab, shift=UP * 0.1), run=0.4)
        self.go("1:11:11.96", Circumscribe(P, color=ORG, shape=Circle, buff=0.1), run=0.9)
        rr = rise_run(ax, 3, 9, 4, 15, PINK, size=40, run_tex="1", rise_tex="6")
        self.go("1:11:15.72", Create(rr), run=0.8)


class K11_Recipe(Shot):
    def body(self):
        self.title("The Recipe", "1:11:18.66")
        rows = [(H("1", 48, DIM), H("Point", 48, ORG), M("(a,\\ f(a))", size=56, color=ORG)),
                (H("2", 48, DIM), H("Slope", 48, PINK), M("m=f'(a)", size=56, color=PINK)),
                (H("3", 48, DIM), H("Line", 48, YEL), M("y-f(a)", "=", "f'(a)", "(x-a)", size=56))]
        R = VGroup()
        for i, (n, w, m) in enumerate(rows):
            y = 1.25 - 1.45 * i
            n.move_to([-5.4, y, 0]); w.move_to([-4.0, y, 0], aligned_edge=LEFT)
            m.move_to([-1.5, y, 0], aligned_edge=LEFT)
            R.add(VGroup(n, w, m))
        rows[2][2][2].set_color(PINK)
        times = ("1:11:21.06", "1:11:23.54", "1:11:26.42")
        for t, r in zip(times, R):
            self.go(t, FadeIn(r[0]), Write(r[1]), run=0.5)
            self.play(Write(r[2]), run_time=0.7)
        self.play(Create(answer_box(R[2][2])), run_time=0.4)


class K11_TryTan(Shot):
    def body(self):
        self.title("Try It", "1:11:30.40")
        prob = VGroup(M("f(x)", "=", "x^2-4x", size=60), TX("at", 48, DIM), M("x=1", size=60, color=ORG)).arrange(RIGHT, buff=0.4)
        prob[0][0].set_color(BLUE)
        prob.move_to([0, 1.0, 0])
        self.go("1:11:31.24", Write(prob[0][0]), run=0.5)
        self.go("1:11:32.14", Write(prob[0][1:]), run=0.8)
        self.go("1:11:34.16", FadeIn(prob[1]), Write(prob[2]), run=0.5)
        d = M("f'(x)", "=", "2x-4", size=60, color=PINK).move_to([0, -0.9, 0])
        fe = H("found it a minute ago", 38, DIM).next_to(d, DOWN, buff=0.35)
        self.go("1:11:35.62", Write(d), run=0.8)
        self.go("1:11:36.40", FadeIn(fe, shift=UP * 0.1), run=0.5)
