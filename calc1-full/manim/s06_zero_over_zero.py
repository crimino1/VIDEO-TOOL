"""Builder 06: end of Chapter 2. Trick 1 finish (x -> -2) and the difference of cubes, Trick 2 (combine fractions),
Trick 3 (the conjugate), the game plan, graph/table, three practice problems, one more, and the hidden derivative.
Adapted from calc1-ep02 s05_factoring.py, s06_keys_frac_conj.py and s07_plan_final.py."""
from common import *

BOARDC = "#3b3a3e"
Y = [1.55, -0.15, -1.75, -3.0]   # row heights of a worked limit
T1 = "Trick 1: Factoring"
T2 = "Trick 2: Combine Fractions"
T3 = "Trick 3: The Conjugate"
LIM0 = r"\lim_{x\to 0}"


def lim(a):
    return r"\lim_{x \to " + a + "}"


def frow(pre, num, den, f1=None, size=66):
    """M(*pre, \\frac{num}{den}); tags .num .bar .den (and .f1 .f2 when num = f1 f2) on the fraction's glyphs."""
    m = M(*pre, r"\frac{" + num + "}{" + den + "}", size=size)
    fr_ = m[-1]
    nn = len(M(num)[0])
    m.num, m.bar, m.den = fr_[:nn], fr_[nn], fr_[nn + 1:]
    if f1:
        k = len(M(f1)[0])
        m.f1, m.f2 = fr_[:k], fr_[k:nn]
    return m


def on_eq(m, y, eqx):
    m.shift(np.array([eqx, y, 0]) - m[0].get_center())
    return m


def first_row(m, y, left):
    m.shift(np.array([left - m.get_left()[0], y - m.bar.get_y(), 0]))
    return m


def under(mob, color=YEL):
    return Line(mob.get_corner(DL) + DOWN * 0.1, mob.get_corner(DR) + DOWN * 0.1, color=color, stroke_width=5)


def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def arr(p, q, color=DIM):
    return Arrow(np.array(p, float), np.array(q, float), buff=0, stroke_width=4, tip_length=0.2, color=color,
                 max_stroke_width_to_length_ratio=20, max_tip_length_to_length_ratio=0.4)


def fr(top, bot, size=54, color=CHALK):
    """Hand-built fraction so single factors can be struck out: .n (numerator), .bar, .d (denominator)."""
    n = M(*top, size=size, color=color) if isinstance(top, (list, tuple)) else M(top, size=size, color=color)
    d = M(*bot, size=size, color=color) if isinstance(bot, (list, tuple)) else M(bot, size=size, color=color)
    w = max(n.width, d.width) + 0.2
    bar = Line([-w / 2, 0, 0], [w / 2, 0, 0], color=color, stroke_width=4)
    n.next_to(bar, UP, buff=0.12)
    d.next_to(bar, DOWN, buff=0.12)
    g = VGroup(n, bar, d)
    g.n, g.bar, g.d = n, bar, d
    return g


def LIMf(a, size=54):
    m = M(rf"\lim_{{x \to {a}}}", size=size)
    m.is_lim = True
    return m


def row(*items, buff=0.24):
    """Lay maths pieces left to right on one maths axis (fraction bars, '=' and 'lim' line up)."""
    g = VGroup(*items).arrange(RIGHT, buff=buff)
    for it in items:
        if hasattr(it, "bar"):
            it.shift(UP * (0 - it.bar.get_y()))
        elif getattr(it, "is_lim", False):
            it.shift(UP * (0.04 - it[0][0:3].get_y()))
        else:
            it.shift(UP * (0 - it.get_y()))
    return g


def put(g, x, y, ref=None):
    ref = ref if ref is not None else g[0]
    ry = ref.bar.get_y() if hasattr(ref, "bar") else ref.get_y()
    return g.shift([x - ref.get_x(), y - ry, 0])


def put_right(g, x, y):
    ref = g[-1]
    ry = ref.bar.get_y() if hasattr(ref, "bar") else ref.get_y()
    return g.shift([x - g.get_right()[0], y - ry, 0])


def qpill(n):
    return pill(f"Question {n}", YEL, 38).move_to([-5.0, 1.95, 0])


def side_note(label, m, pos):
    lab = H(label, 34, DIM)
    return VGroup(lab, m).arrange(DOWN, buff=0.18).move_to(pos)


def badge(n):
    c = Circle(radius=0.28, stroke_color=YEL, stroke_width=4, fill_color=BOARDC, fill_opacity=1)
    return VGroup(c, M(str(n), size=38, color=YEL).move_to(c)).set_z_index(3)


# ================================================================ Trick 1: factoring (end) and the cubes

class K06_Factor3End(Shot):
    def body(self):
        self.title(T1, animate=False)
        eqx = -3.6
        L1 = on_eq(frow(["=", lim("-2")], "(x+2)(x+3)", "x+2", f1="(x+2)"), Y[1], eqx)
        L0 = first_row(frow([lim("-2")], "x^2+5x+6", "x+2"), Y[0], L1[1].get_left()[0])
        L2 = on_eq(M("=", lim("-2"), "(x+3)", size=66), Y[2], eqx)
        L3 = on_eq(M("=", "-2+3", "=", "1", size=66), Y[3], eqx)
        L3[1].set_color(ORG); L3[3].set_color(GRN)
        self.add(L0, L1)
        self.go("33:08.76", Create(strike(L1.f1)), Create(strike(L1.den)), run=0.6)
        self.go("33:10.68", Write(L2[0:2]), run=0.5)
        self.go("33:11.24", TransformFromCopy(L1.f2, L2[2]), run=0.6)
        x0 = M("x=-2", size=48, color=ORG).next_to(L2, RIGHT, buff=0.9)
        self.go("33:12.54", FadeIn(x0, shift=LEFT * 0.1), Write(L3[0:2]), run=0.7)
        self.go("33:14.20", Write(L3[2:4]), run=0.4)
        self.play(Create(answer_box(L3[3])), run_time=0.35)
        self.wipe("33:15.00", run=0.35)


class K06_Cubes(Shot):
    def body(self):
        self.title(T1, animate=False)
        self.title("A Harder One", "33:15.78")
        eqx = -4.2
        L1 = on_eq(frow(["=", lim("2")], "(x-2)(x^2+2x+4)", "x-2", f1="(x-2)"), Y[1], eqx)
        L0 = first_row(frow([lim("2")], "x^3-8", "x-2"), Y[0], L1[1].get_left()[0])
        L2 = on_eq(M("=", lim("2"), "(x^2+2x+4)", size=66), Y[2], eqx)
        L3 = on_eq(M("=", "4+4+4", "=", "12", size=66), Y[3], eqx)
        L3[1].set_color(ORG); L3[3].set_color(GRN)

        self.go("33:17.16", Write(L0[0]), run=0.8)
        self.go("33:19.34", Write(L0.num), run=0.7)
        self.go("33:20.74", Create(L0.bar), run=0.3)
        self.go("33:21.28", Write(L0.den), run=0.5)
        cx = (L0.get_right()[0] + 6.7) / 2
        lab = TX(r"plug in $x=2$", 40, DIM).move_to([cx, Y[0] + 0.6, 0])
        pl = M(r"\frac{8-8}{2-2}", "=", r"\frac{0}{0}", size=58).move_to([cx, Y[0] - 0.4, 0])
        pl[2].set_color(YEL)
        self.go("33:22.20", FadeIn(lab, shift=UP * 0.1), Write(pl[0]), run=0.6)
        self.go("33:23.24", Write(pl[1:]), run=0.5)
        ul = under(L0.num)
        self.go("33:24.98", FadeOut(lab), FadeOut(pl), Create(ul), run=0.5)
        dc = H("difference of cubes", 42, YEL).move_to([cx, Y[0], 0])
        self.go("33:25.90", Write(dc), run=0.8)
        # the pattern panel along the bottom
        pat = M("a^3-b^3", "=", "(a-b)", "(a^2+ab+b^2)", size=54).move_to([0, -3.15, 0])
        pn = panel(pat, PURP, buff=0.3)
        self.go("33:27.36", Create(pn), run=0.6)
        self.go("33:28.88", Write(pat[0]), run=1.0)
        self.go("33:30.68", Write(pat[1:3]), run=0.9)
        self.go("33:32.72", Write(pat[3]), run=1.2)
        # x^3 - 8 is a^3 - b^3 with a = x, b = 2
        x8 = M("x^3", "-", "8", size=56).move_to([cx, Y[0], 0])
        x8b = M("x^3", "-", "2^3", size=56).move_to([cx, Y[0], 0])
        x8b[2].set_color(ORG)
        self.go("33:36.78", FadeOut(dc), FadeOut(ul), Write(x8), run=0.6)
        self.go("33:37.60", TransformMatchingTex(x8, x8b), run=0.6)
        self.go("33:38.28", Write(VGroup(L1[0], L1[1], L1.bar, L1.den)), run=0.4)
        self.go("33:38.70", Write(L1.f1), run=0.6)
        self.go("33:40.40", Write(L1.f2), run=1.5)
        self.go("33:43.22", Create(strike(L1.f1)), Create(strike(L1.den)), run=0.6)
        self.go("33:45.54", Write(L2[0:2]), run=0.4)
        self.go("33:45.94", TransformFromCopy(L1.f2, L2[2]), run=0.9)
        self.go("33:47.80", FadeOut(pn), FadeOut(pat), run=0.4)
        x2 = M("x=2", size=48, color=ORG).next_to(L2, RIGHT, buff=0.8)
        self.go("33:48.56", FadeIn(x2, shift=LEFT * 0.1), run=0.4)
        self.go("33:49.86", Write(L3[0:2]), run=1.2)
        self.go("33:52.32", Write(L3[2:4]), run=0.4)
        self.play(Create(answer_box(L3[3])), run_time=0.35)
        self.wipe("33:53.44", run=0.3)
        self.title(T2, "33:53.80")


# ================================================================ Trick 2: combine fractions

def k2_lim(size):
    # 0 lim, 2 1/(x+2), 3 -, 4 1/2, 5 big bar, 6 x
    return M(LIM0, r"\frac{", r"\dfrac{1}{x+2}", "-", r"\dfrac{1}{2}", "}{", "x", "}", size=size)


def k2_small():
    """The problem parked top-left with the top fractions boxed (FracSetup end, FracCombine start)."""
    r0 = k2_lim(46).move_to([-3.6, 1.2, 0])
    bx = box(VGroup(r0[2], r0[3], r0[4]), YEL, buff=0.1)
    return r0, bx


EQ2 = -0.9   # '=' column of the subtraction row


def k2_sub():
    lhs = M(r"\frac{1}{x+2}", "-", r"\frac{1}{2}", "=", size=56)
    rr = M(r"\frac{", "2", "-", "(x+2)", "}{", "{2(x+2)}", "}", size=56)
    at_eq(lhs, 3, EQ2, -2.15)
    rr.next_to(lhs, RIGHT, buff=0.25)
    rr[5].set_color(ORG)
    return lhs, rr


def k2_rr2(rr):
    m = M(r"\frac{", "2", "-", "x", "-", "2", "}{", "{2(x+2)}", "}", size=56)
    m[7].set_color(ORG)
    return m.move_to(rr, aligned_edge=LEFT)


def k2_rr3(rr):
    m = M(r"\frac{", "-", "x", "}{", "{2(x+2)}", "}", size=56)
    m[4].set_color(ORG)
    return m.move_to(rr, aligned_edge=LEFT)


class K06_FracSetup(Shot):
    def body(self):
        self.title(T2, animate=False)
        r0 = k2_lim(60).move_to([-1.6, 0.5, 0])
        ls = H("small fractions", 40, YEL).move_to([4.3, 1.3, 0])
        lb = H("big fraction", 40).move_to([4.3, -0.5, 0])
        self.go("33:57.28", FadeIn(ls, shift=UP * 0.1), run=0.5)
        self.go("33:59.12", FadeIn(lb, shift=UP * 0.1), run=0.5)
        self.go("34:01.04", Write(r0[0]), run=0.7)
        self.go("34:03.28", Write(r0[2]), run=0.9)
        self.go("34:04.76", Write(r0[3]), Write(r0[4]), run=0.8)
        a1 = arr(ls.get_left() + LEFT * 0.15, r0[4].get_right() + RIGHT * 0.15, YEL)
        self.play(Create(a1), run_time=0.4)
        self.go("34:06.00", Write(r0[5]), run=0.5)
        self.go("34:06.94", Write(r0[6]), run=0.4)
        a2 = arr(lb.get_left() + LEFT * 0.15, r0[5].get_right() + RIGHT * 0.12)
        self.play(Create(a2), run_time=0.4)
        # plug in 0
        x0 = M("x=0", size=48, color=ORG).move_to([-5.0, -2.2, 0])
        r1 = M(r"\frac{", r"\dfrac{1}{2}-\dfrac{1}{2}", "}{", "0", "}", "=", r"\frac{0}{0}", size=60)
        r1[6].set_color(YEL)
        r1.move_to([0, -2.2, 0]).align_to([-3.6, 0, 0], LEFT)
        self.go("34:08.08", FadeOut(VGroup(ls, lb, a1, a2)), FadeIn(x0, shift=RIGHT * 0.1), run=0.5)
        self.go("34:09.74", Write(r1[1]), run=1.3)
        self.go("34:13.70", Write(r1[2]), Write(r1[3]), run=0.5)
        self.go("34:15.20", Write(r1[5]), Write(r1[6]), run=0.6)
        self.play(Circumscribe(r1[6], color=YEL, buff=0.1), run_time=0.8)
        # the move: make the top one fraction
        s0, bx = k2_small()
        self.go("34:17.26", FadeOut(VGroup(x0, r1)), ReplacementTransform(r0, s0), run=0.8)
        self.go("34:18.62", Create(bx), run=0.6)
        one = note("make it one fraction", bx, direction=RIGHT, size=38, dist=0.6, angle=0.5)
        self.go("34:20.54", FadeIn(one[0], shift=LEFT * 0.1), Create(one[1]), run=0.6)


class K06_FracCombine(Shot):
    def body(self):
        self.title(T2, animate=False)
        r0, bx = k2_small()
        one = note("make it one fraction", bx, direction=RIGHT, size=38, dist=0.6, angle=0.5)
        self.add(r0, bx, one)
        # the common bottom
        nt = H("common bottom", 38, DIM).move_to([3.9, 1.55, 0])
        cb = M("2(x+2)", size=56, color=ORG).next_to(nt, DOWN, buff=0.2)
        self.go("34:22.10", FadeOut(one), FadeIn(nt, shift=UP * 0.1), run=0.5)
        self.go("34:27.04", Write(cb), run=0.8)
        # rewrite each little fraction over it
        c1 = M(r"\frac{1}{x+2}", "=", r"\frac{2}{2(x+2)}", size=52).move_to([-3.3, -0.65, 0])
        c2 = M(r"\frac{1}{2}", "=", r"\frac{x+2}{2(x+2)}", size=52).move_to([3.0, -0.65, 0])
        c1[2][2:].set_color(ORG)
        c2[2][4:].set_color(ORG)
        self.go("34:29.68", TransformFromCopy(r0[2], c1[0]), run=0.7)
        self.go("34:31.18", Write(c1[1:]), run=1.0)
        self.go("34:34.58", TransformFromCopy(r0[4], c2[0]), run=0.5)
        self.go("34:35.10", Write(c2[1:]), run=1.0)
        # subtract
        lhs, rr = k2_sub()
        self.go("34:38.84", Write(lhs), Write(rr[4]), TransformFromCopy(cb, rr[5]), run=0.8)
        self.go("34:40.30", TransformFromCopy(c1[2][0], rr[1]), Write(rr[2]), run=0.6)
        self.go("34:41.30", TransformFromCopy(c2[2][0:3], rr[3]), run=0.6)
        # careful: the minus hits both terms
        mn, par = rr[2], rr[3]
        hits = VGroup(*[CurvedArrow(mn.get_top() + UP * 0.08, par[k].get_top() + UP * 0.08, angle=-PI / 1.7,
                                    color=RED, stroke_width=3, tip_length=0.14) for k in (1, 3)])
        hn = H("hits both", 36, RED).next_to(par, RIGHT, buff=0.6).shift(UP * 0.25)
        self.go("34:42.34", FadeOut(VGroup(c1, c2, nt)), run=0.4)
        self.go("34:43.54", Create(hits), FadeIn(hn, shift=LEFT * 0.1), run=0.7)
        rr2 = k2_rr2(rr)
        self.go("34:46.62", FadeOut(hits), FadeOut(hn), TransformMatchingTex(rr, rr2), run=0.8)
        s1, s2 = strike(rr2[1]), strike(VGroup(rr2[4], rr2[5]))
        self.go("34:48.10", Create(s1), Create(s2), run=0.4)
        rr3 = k2_rr3(rr2)
        self.go("34:49.30", FadeOut(s1), FadeOut(s2), TransformMatchingTex(rr2, rr3), run=0.6)
        self.play(Create(box(rr3, YEL, buff=0.12)), run_time=0.35)


class K06_FracCancel(Shot):
    def body(self):
        self.title(T2, animate=False)
        r0, bx = k2_small()
        cb = M("2(x+2)", size=56, color=ORG).next_to(H("common bottom", 38).move_to([3.9, 1.55, 0]), DOWN, buff=0.2)
        lhs, rr = k2_sub()
        rr3 = k2_rr3(rr)
        b3 = box(rr3, YEL, buff=0.12)
        self.add(r0, bx, cb, lhs, rr3, b3)
        EQ = -2.2
        # 0 lim, 2 inner fraction (glyphs: -, x, bar, 2(x+2)), 3 bar, 4 x
        rA = M(LIM0, r"\frac{", r"\dfrac{-x}{2(x+2)}", "}{", "x", "}", size=56)
        rA.move_to([0, 0.75, 0]).align_to([EQ + 0.45, 0, 0], LEFT)
        rA[2][3:].set_color(ORG)
        rB = at_eq(M("=", LIM0, r"\frac{", "-1", "}{", "2(x+2)", "}", size=56), 0, EQ, -1.35)
        rC = at_eq(M("=", r"\frac{", "-1", "}{", r"2\cdot 2", "}", "=", r"-\frac{1}{4}", size=56), 0, EQ, -2.95)
        rC[7].set_color(GRN)
        self.go("34:51.38", FadeOut(VGroup(r0, bx, cb, lhs, b3)), ReplacementTransform(rr3, rA[2]), run=0.7)
        self.go("34:53.06", Circumscribe(rA[2], color=YEL, buff=0.1), run=0.8)
        self.go("34:56.48", Write(rA[0]), run=0.5)
        self.go("34:57.24", Write(rA[3]), Write(rA[4]), run=0.6)
        self.go("34:59.88", Create(strike(rA[4])), run=0.4)
        self.go("35:00.80", Create(strike(rA[2][1])), run=0.4)
        self.go("35:01.78", Write(rB[0]), Write(rB[1]), run=0.5)
        self.go("35:02.48", Write(rB[3]), run=0.4)
        self.go("35:03.18", Write(rB[4]), Write(rB[5]), run=1.0)
        x0 = M("x=0", size=48, color=ORG).next_to(rB, RIGHT, buff=0.9)
        self.go("35:05.44", FadeIn(x0, shift=LEFT * 0.1), run=0.4)
        self.go("35:07.04", Write(rC[0]), Write(rC[2]), run=0.45)
        self.go("35:07.68", Write(rC[3]), Write(rC[4]), run=0.8)
        self.go("35:09.44", Write(rC[6]), Write(rC[7]), run=0.5)
        self.play(Create(answer_box(rC[7])), run_time=0.4)
        self.wipe("35:11.30", run=0.3)
        self.title(T3, "35:11.62")


# ================================================================ Trick 3: the conjugate

def k3_line():
    # 0 lim, 2 top, 3 bar, 4 x, 6 dot, 8 conj top, 9 conj bar, 10 conj bottom
    L = M(LIM0, r"\frac{", r"\sqrt{x+9}-3", "}{", "x", "}", r"\cdot", r"\frac{", r"\sqrt{x+9}+3", "}{", r"\sqrt{x+9}+3", "}", size=52)
    for i in (8, 9, 10):
        L[i].set_color(YEL)
    return L.move_to([0.5, 1.0, 0])


def k3_one():
    one = M(r"\frac{", r"\sqrt{x+9}+3", "}{", r"\sqrt{x+9}+3", "}", "=", "1", size=52).move_to([0.5, -1.5, 0])
    for i in (1, 2, 3, 6):
        one[i].set_color(YEL)
    return one


class K06_ConjIdea(Shot):
    def body(self):
        self.title(T3, animate=False)
        rt = M(r"\sqrt{\phantom{x+9}}", size=110, color=YEL).move_to([0, 0.4, 0])
        self.go("35:14.02", Write(rt), run=0.6)
        ab = M("a-b", size=72).move_to([-2.7, 0.95, 0])
        a = arr([-1.5, 0.95, 0], [1.5, 0.95, 0])
        al = H("conjugate", 36, DIM).next_to(a, UP, buff=0.12)
        ab2 = M("a", "+", "b", size=72).move_to([2.7, 0.95, 0])
        ab2[1].set_color(YEL)
        self.go("35:15.26", FadeOut(rt, shift=UP * 0.2), Write(ab), run=0.6)
        self.go("35:16.98", Create(a), FadeIn(al, shift=UP * 0.1), run=0.4)
        self.go("35:17.40", Write(ab2), run=0.6)
        pr = M("(a-b)", "(a+b)", "=", "a^2-b^2", size=72).move_to([0, -0.65, 0])
        pr[1][2].set_color(YEL)
        pn = panel(pr, PURP, buff=0.3)
        self.go("35:20.70", Write(pr[0]), run=0.4)
        self.go("35:21.12", Write(pr[1]), run=0.5)
        self.go("35:22.30", Write(pr[2]), Write(pr[3]), run=1.0)
        self.go("35:23.95", Create(pn), run=0.6)
        sq = M(r"\Big(", r"\sqrt{x+9}", r"\Big)^2", "=", "x+9", size=64).move_to([0, -2.75, 0])
        sq[4].set_color(GRN)
        self.go("35:26.30", Write(sq[1]), run=0.6)
        self.go("35:27.00", Write(sq[0]), Write(sq[2]), run=0.5)
        self.go("35:28.10", Write(sq[3]), Write(sq[4]), run=0.6)
        self.wipe("35:29.30", run=0.35)


class K06_ConjSetup(Shot):
    def body(self):
        self.title(T3, animate=False)
        c0 = M(LIM0, r"\frac{", r"\sqrt{x+9}-3", "}{", "x", "}", size=60).move_to([0, 0.9, 0])
        self.go("35:30.64", Write(c0[0]), run=0.6)
        self.go("35:33.22", Write(c0[2]), run=1.3)
        self.go("35:36.46", Write(c0[3]), Write(c0[4]), run=0.6)
        x0 = M("x=0", size=48, color=ORG).move_to([-5.0, -1.3, 0])
        c1 = M(r"\frac{", r"\sqrt{9}-3", "}{", "0", "}", "=", r"\frac{", "3-3", "}{", "0", "}", "=", r"\frac{0}{0}", size=60)
        c1[12].set_color(YEL)
        c1.move_to([0, -1.3, 0]).align_to([-3.6, 0, 0], LEFT)
        self.go("35:38.04", FadeIn(x0, shift=RIGHT * 0.1), run=0.4)
        self.go("35:39.46", Write(c1[1]), Write(c1[2]), Write(c1[3]), run=0.9)
        self.go("35:41.42", Write(c1[5]), Write(c1[7]), Write(c1[8]), Write(c1[9]), run=0.6)
        self.go("35:43.66", Write(c1[11]), Write(c1[12]), run=0.5)
        L = k3_line()
        self.go("35:45.42", FadeOut(VGroup(x0, c1)), ReplacementTransform(c0, VGroup(*L[:6])), run=0.7)
        self.go("35:47.20", Write(L[6]), run=0.3)
        self.go("35:48.62", Write(L[8]), run=1.0)
        self.go("35:50.00", Write(L[9]), Write(L[10]), run=0.8)
        one = k3_one()
        self.go("35:53.34", TransformFromCopy(VGroup(L[8], L[9], L[10]), VGroup(one[1], one[2], one[3])), run=0.8)
        self.go("35:56.30", Write(one[5]), Write(one[6]), run=0.5)


class K06_ConjSimplify(Shot):
    def body(self):
        self.title(T3, animate=False)
        L, one = k3_line(), k3_one()
        self.add(L, one)
        EQ = L.get_left()[0] - 0.45
        tl = H("top:", 38, DIM)
        tw = M(r"(\sqrt{x+9}-3)", r"(\sqrt{x+9}+3)", "=", "(x+9)-9", "=", "x", size=52)
        tw[1].set_color(YEL); tw[5].set_color(YEL)
        tw.move_to([0, -0.55, 0]).align_to([-4.6, 0, 0], LEFT)
        tl.next_to(tw, LEFT, buff=0.3)
        self.go("35:58.14", FadeOut(one), FadeIn(tl, shift=RIGHT * 0.1), run=0.45)
        self.go("35:58.68", Write(tw[0]), run=0.9)
        self.go("36:01.14", Write(tw[1]), run=1.0)
        ds = H("difference of squares", 36, YEL).next_to(tw[1], RIGHT, buff=0.5)
        self.go("36:04.22", FadeIn(ds, shift=UP * 0.1), run=0.5)
        self.go("36:06.34", FadeOut(ds), Write(tw[2]), Write(tw[3]), run=0.9)
        self.go("36:08.96", Write(tw[4]), Write(tw[5]), run=0.5)
        bl = H("bottom:", 38, DIM)
        bw = M("x", r"(\sqrt{x+9}+3)", size=52)
        bw[1].set_color(YEL)
        bw.move_to([0, -1.95, 0]).align_to(tw, LEFT)
        bl.next_to(bw, LEFT, buff=0.3)
        self.go("36:10.50", FadeIn(bl, shift=RIGHT * 0.1), run=0.4)
        self.go("36:11.74", Write(bw[0]), run=0.4)
        self.go("36:12.60", Write(bw[1]), run=0.9)
        lv = note("leave it", bw[1], direction=RIGHT, color=DIM, size=36, dist=0.6, angle=0.5)
        self.go("36:15.46", FadeIn(lv[0], shift=LEFT * 0.1), Create(lv[1]), run=0.6)
        # 0 =, 1 lim, 3 x top, 4 bar, 5 x bottom, 6 (sqrt+3)
        q1 = at_eq(M("=", LIM0, r"\frac{", "x", "}{", "x", r"(\sqrt{x+9}+3)", "}", size=52), 0, EQ, -0.75)
        q2 = at_eq(M("=", LIM0, r"\frac{", "1", "}{", r"\sqrt{x+9}+3", "}", size=52), 0, EQ, -2.35)
        q3 = M("=", r"\frac{", "1", "}{", "3+3", "}", "=", r"\frac{1}{6}", size=52)
        q3[7].set_color(GRN)
        self.go("36:17.80", FadeOut(VGroup(tl, bl, tw[:5], lv)),
                ReplacementTransform(tw[5], q1[3]), ReplacementTransform(bw, VGroup(q1[5], q1[6])),
                Write(q1[0]), Write(q1[1]), Write(q1[4]), run=0.5)
        self.go("36:18.30", Create(strike(q1[3])), run=0.4)
        self.go("36:19.74", Create(strike(q1[5])), run=0.4)
        self.go("36:21.06", Write(q2[0]), Write(q2[1]), run=0.4)
        self.go("36:21.68", Write(q2[3]), run=0.3)
        self.go("36:22.10", Write(q2[4]), Write(q2[5]), run=0.9)
        q3.shift(UP * (q2[0].get_y() - q3[0].get_y())).next_to(q2, RIGHT, buff=0.25, coor_mask=[1, 0, 0])
        x0 = M("x=0", size=44, color=ORG).next_to(VGroup(*q3[0:6]), DOWN, buff=0.35)
        self.go("36:24.56", FadeIn(x0, shift=LEFT * 0.1), run=0.4)
        self.go("36:25.80", Write(q3[0]), Write(q3[2]), run=0.3)
        self.go("36:26.12", Write(q3[3]), Write(q3[4]), run=0.6)
        self.go("36:27.38", Write(q3[6]), Write(q3[7]), run=0.4)
        fb = answer_box(q3[7])
        self.play(Create(fb), run_time=0.4)
        self.go("36:29.00", Circumscribe(L[2], color=YEL, buff=0.1), run=1.0)
        self.go("36:30.26", Circumscribe(VGroup(q3[7], fb), color=GRN, buff=0.08), run=0.8)
        self.wipe("36:31.45", run=0.35)


# ================================================================ the game plan

PX = (-4.6, 0.0, 4.6)  # column centres


def plan_branch(k, head, y0=1.5):
    top = np.array([[-1.9, y0, 0], [0, y0, 0], [1.9, y0, 0]][k])
    end = np.array([PX[k], head.get_top()[1] + 0.12, 0])
    a = Arrow(top, end, buff=0, color=DIM, stroke_width=4, tip_length=0.18)
    bd = badge(k + 2).move_to((top + end) / 2 + (RIGHT * 0.45 if k == 1 else 0))
    return a, bd


class K06_Plan(Shot):
    def body(self):
        self.title(T3, animate=False)
        self.title("The Game Plan", "36:33.40")
        t = H("plug in the number", 46)
        tb = RoundedRectangle(width=t.width + 0.6, height=t.height + 0.4, corner_radius=0.2, stroke_color=CHALK, stroke_width=4)
        top = VGroup(tb, t).move_to([0, 1.95, 0])
        b1 = badge(1).next_to(top, LEFT, buff=0.3)
        self.go("36:38.06", FadeIn(b1, scale=0.8), run=0.4)
        self.go("36:39.30", Create(tb), Write(t), run=0.9)
        # normal number -> answer
        h1 = H("normal number", 42).move_to([PX[0], 0.2, 0])
        ans = H("that's the answer", 42, GRN).move_to([PX[0], -1.05, 0])
        dn = Arrow(h1.get_bottom() + DOWN * 0.08, ans.get_top() + UP * 0.1, buff=0, color=DIM, stroke_width=4, tip_length=0.16)
        ok = tick_mark(GRN, 0.55).move_to([PX[0], -2.0, 0])
        a1, bd2 = plan_branch(0, h1, tb.get_bottom()[1])
        self.go("36:40.70", GrowArrow(a1), FadeIn(bd2, scale=0.8), run=0.45)
        self.go("36:41.14", Write(h1), run=0.6)
        self.go("36:42.02", GrowArrow(dn), Write(ans), run=0.7)
        self.play(Create(ok), run_time=0.4)
        # nonzero / 0 -> blowing up
        h2 = M(r"\frac{\text{nonzero}}{0}", size=48).move_to([PX[1] - 0.3, 0.2, 0])
        eg = M(r"\frac{5}{0}", size=44, color=ORG).next_to(h2, RIGHT, buff=0.45)
        blow = H("blowing up", 42, RED).move_to([PX[1], -0.95, 0])
        both = H("check both sides", 40).move_to([PX[1], -1.65, 0])
        res = M(r"\infty", r",\ -\infty", r",\ \text{DNE}", size=50, color=YEL).move_to([PX[1], -2.4, 0])
        nxt = pill("next chapter", DIM, 32, width=3).move_to([PX[1], -3.25, 0])
        a2, bd3 = plan_branch(1, h2, tb.get_bottom()[1])
        self.go("36:43.36", GrowArrow(a2), FadeIn(bd3, scale=0.8), run=0.45)
        self.go("36:43.90", Write(h2), run=0.9)
        self.go("36:46.10", FadeIn(eg, shift=LEFT * 0.15), run=0.5)
        self.go("36:48.24", Write(blow), run=0.6)
        self.go("36:49.98", FadeIn(both, shift=UP * 0.1), run=0.5)
        self.go("36:52.16", Write(res[0]), run=0.4)
        self.go("36:53.24", Write(res[1]), run=0.5)
        self.go("36:54.82", Write(res[2]), run=0.6)
        self.go("36:56.36", FadeIn(nxt, shift=UP * 0.1), run=0.5)
        # 0/0 -> algebra
        h3 = M(r"\frac{0}{0}", size=54, color=YEL).move_to([PX[2], 0.2, 0])
        a3, bd4 = plan_branch(2, h3, tb.get_bottom()[1])
        self.go("36:58.30", GrowArrow(a3), FadeIn(bd4, scale=0.8), run=0.45)
        self.go("36:58.82", Write(h3), run=0.6)
        alg = H("needs algebra", 42, YEL).move_to([PX[2], -0.9, 0])
        self.go("37:00.28", Write(alg), run=0.6)
        keys = []
        for y, s in ((-1.6, "factor"), (-2.25, "combine fractions"), (-2.9, "conjugate")):
            k = VGroup(Dot(radius=0.06, color=ORG), H(s, 36)).arrange(RIGHT, buff=0.18)
            k.move_to([2.85, y, 0], aligned_edge=LEFT)
            keys.append(k)
        self.go("37:01.98", FadeIn(keys[0], shift=UP * 0.1), run=0.5)
        self.go("37:04.62", FadeIn(keys[1], shift=UP * 0.1), run=0.5)
        self.go("37:07.78", FadeIn(keys[2], shift=UP * 0.1), run=0.5)
        again = H("then plug in again", 36, YEL).move_to([2.85, -3.5, 0], aligned_edge=LEFT)
        self.go("37:09.72", Write(again), run=0.6)
        self.play(Circumscribe(top, color=YEL, stroke_width=4), run_time=0.6)
        self.wipe("37:11.10", run=0.35)


class K06_GraphTable(Shot):
    def body(self):
        self.title("The Game Plan", animate=False)
        self.title("Graph or Table?", "37:12.40")
        f = lambda x: 0.5 * x + 2
        ax = axes((0, 4, 1), (0, 5, 1), x_length=5.4, y_length=3.9, center=(-3.2, -0.7, 0))
        cv = VGroup(curve(ax, f, [0.1, 1.94]), curve(ax, f, [2.06, 3.9]))
        h = hole(ax, 2, 3)
        self.go("37:12.90", Create(ax), FadeIn(ax.labels), Create(cv), FadeIn(h), run=0.8)
        rows = [("1.9", "2.95", BLUE), ("1.99", "2.995", BLUE), ("2.01", "3.005", ORG), ("2.1", "3.05", ORG)]
        tx, ty = 3.6, 1.3
        hx = M("x", size=44, color=DIM).move_to([tx - 0.9, ty, 0])
        hf = M("f(x)", size=44, color=DIM).move_to([tx + 0.9, ty, 0])
        hl = Line([tx - 1.9, ty - 0.33, 0], [tx + 1.9, ty - 0.33, 0], color=DIM, stroke_width=3)
        vl = Line([tx, ty + 0.3, 0], [tx, ty - 2.75, 0], color=DIM, stroke_width=3)
        cells = VGroup()
        for i, (a, b, c) in enumerate(rows):
            yy = ty - 0.72 - 0.6 * i
            cells.add(M(a, size=44, color=c).move_to([tx - 0.9, yy, 0]), M(b, size=44, color=c).move_to([tx + 0.9, yy, 0]))
        self.go("37:13.75", Create(hl), Create(vl), FadeIn(hx), FadeIn(hf), FadeIn(cells), run=0.6)
        xa, xb = ValueTracker(0.3), ValueTracker(3.7)
        da = always_redraw(lambda: pt(ax, xa.get_value(), f(xa.get_value()), BLUE))
        db = always_redraw(lambda: pt(ax, xb.get_value(), f(xb.get_value()), ORG))
        self.go("37:15.02", FadeIn(da), FadeIn(db), run=0.3)
        self.play(xa.animate.set_value(1.82), xb.animate.set_value(2.18), run_time=2.4)
        agree = M(r"\text{left}", "=", r"\text{right}", size=54)
        agree[0].set_color(BLUE); agree[2].set_color(ORG)
        agree.move_to([3.4, -2.55, 0])
        self.go("37:18.64", Write(agree), run=0.6)
        self.play(Create(tick_mark(GRN, 0.5).next_to(agree, RIGHT, buff=0.3)), run_time=0.4)
        lim3 = M("L=3", size=48, color=YEL).next_to(ax.c2p(2, 3), UL, buff=0.35)
        self.go("37:19.70", FadeIn(lim3, shift=DOWN * 0.1), run=0.4)


# ================================================================ your turn

def try_rows():
    p1 = row(LIMf(5, 56), M("(2x^2-3x)", size=56))
    p2 = row(LIMf(1, 56), fr("x^2+3x-4", "x-1", 56))
    p3 = row(LIMf(9, 56), fr(r"\sqrt{x}-3", "x-9", 56))
    out = []
    for i, (p, y) in enumerate(((p1, 1.3), (p2, -0.45), (p3, -2.45))):
        put(p, 0, y, ref=p[1])
        p.shift(RIGHT * (-3.6 - p.get_left()[0]))
        out.append((badge(i + 1).scale(1.15).move_to([-4.6, y, 0]), p))
    return out


class K06_TryThree(Shot):
    def body(self):
        self.title("Your Turn", animate=False)
        (b1, p1), (b2, p2), (b3, p3) = try_rows()
        self.go("37:22.52", FadeIn(b1, scale=0.8), run=0.4)
        self.go("37:23.28", Write(p1[0]), run=0.7)
        self.go("37:25.36", Write(p1[1]), run=1.0)
        self.go("37:27.92", FadeIn(b2, scale=0.8), run=0.4)
        self.go("37:28.82", Write(p2[0]), run=0.7)
        self.go("37:30.66", Write(p2[1].n), run=1.5)
        self.go("37:33.38", Create(p2[1].bar), run=0.3)
        self.go("37:34.08", Write(p2[1].d), run=0.6)
        self.go("37:35.48", FadeIn(b3, scale=0.8), run=0.4)
        self.go("37:36.84", Write(p3[0]), run=0.7)
        self.go("37:39.20", Write(p3[1].n), run=1.0)
        self.go("37:40.98", Create(p3[1].bar), run=0.3)
        self.go("37:41.70", Write(p3[1].d), run=0.6)
        bars = VGroup(*[RoundedRectangle(width=0.17, height=0.52, corner_radius=0.07, color=YEL, stroke_width=5).move_to([dx, 0, 0])
                        for dx in (-0.14, 0.14)])
        ps = VGroup(bars, H("pause", 46, YEL)).arrange(RIGHT, buff=0.25).move_to([4.6, -0.45, 0])
        self.go("37:42.36", Create(bars), Write(ps[1]), run=0.5)
        self.wipe("37:43.32", run=0.35)


class K06_Ans12(Shot):
    def body(self):
        self.title("Your Turn", animate=False)
        self.title("Answers", "37:43.75")
        # Question 1: just plug in
        self.go("37:44.25", FadeIn(qpill(1), shift=DOWN * 0.1), run=0.4)
        L0 = M(r"\lim_{x \to 5}", r"(2x^2-3x)", "=", "2(", "5", ")^2-3(", "5", ")", size=60)
        L0[4].set_color(ORG); L0[6].set_color(ORG)
        L0.shift([0.3 - L0[2].get_x(), 0.6 - L0[2].get_y(), 0])
        self.play(Write(L0[0:2]), run_time=0.7)
        self.go("37:45.40", Write(L0[2:]), run=0.9)
        L1 = M("=", "50", "-15", size=60)
        L1.shift([0.3 - L1[0].get_x(), -0.75 - L1[0].get_y(), 0])
        tmp = M(r"2\cdot 25", size=60).move_to(L1[1], aligned_edge=LEFT)
        self.go("37:46.38", Write(L1[0]), Write(tmp), run=0.6)
        self.go("37:47.40", ReplacementTransform(tmp, L1[1]), run=0.5)
        self.go("37:48.18", Write(L1[2]), run=0.5)
        L2 = M("=", r"\;35", size=60, color=GRN)
        L2[0].set_color(CHALK)
        L2.shift([0.3 - L2[0].get_x(), -2.1 - L2[0].get_y(), 0])
        self.go("37:49.90", Write(L2), run=0.4)
        self.play(Create(answer_box(L2[1])), run_time=0.35)
        self.wipe("37:50.90", run=0.3)

        # Question 2: factor
        self.go("37:51.20", FadeIn(qpill(2), shift=DOWN * 0.1), run=0.4)
        EX = -1.4
        F0 = fr(r"x^2+3x-4", "x-1", 56)
        L0 = put_right(row(LIMf(1, 56), F0), EX - 0.25, 0.75)
        self.play(Write(L0), run_time=0.8)
        n00 = side_note("plug in 1:", M(r"\frac{0}{0}", size=56, color=YEL), [4.4, 1.0, 0])
        self.go("37:52.60", FadeIn(n00[0]), Write(n00[1]), run=0.6)
        ring = box(F0.n, YEL, buff=0.1)
        self.go("37:54.62", FadeOut(n00), Create(ring), run=0.5)
        p1 = M(r"?\cdot ?", "=", "-4", size=50).move_to([4.4, 0.95, 0])
        p2 = M(r"?+?", "=", "3", size=50)
        p2.shift([p1[1].get_x() - p2[1].get_x(), 0.1 - p2[1].get_y(), 0])
        self.go("37:56.98", Write(p1), run=0.7)
        self.go("37:58.34", Write(p2), run=0.6)
        q1 = M(r"4\cdot(-1)", size=50, color=ORG).move_to(p1[0], aligned_edge=RIGHT)
        q2 = M(r"4+(-1)", size=50, color=ORG).move_to(p2[0], aligned_edge=RIGHT)
        self.go("38:00.34", ReplacementTransform(p1[0], q1), ReplacementTransform(p2[0], q2), run=0.8)
        F1 = fr(["(x+4)", "(x-1)"], "x-1", 56)
        L1 = put(row(M("=", size=56), LIMf(1, 56), F1), EX, -0.95)
        self.go("38:02.30", FadeOut(ring), Write(L1[0]), Write(L1[1]), run=0.4)
        self.go("38:02.80", Write(F1.n[0]), run=0.6)
        self.go("38:03.50", Write(F1.n[1]), Create(F1.bar), run=0.6)
        self.play(Write(F1.d), run_time=0.4)
        self.go("38:05.24", Create(strike(F1.n[1])), Create(strike(F1.d)), run=0.6)
        L2 = M("=", r"\lim_{x\to 1}", "(x+4)", "=", "1+4", "=", r"\;5", size=56)
        L2[4].set_color(ORG); L2[6].set_color(GRN)
        L2.shift([EX - L2[0].get_x(), -2.65 - L2[0].get_y(), 0])
        self.go("38:07.02", Write(L2[0:2]), TransformFromCopy(F1.n[0], L2[2]), run=0.7)
        self.go("38:08.76", Write(L2[3:5]), run=0.6)
        self.go("38:09.82", Write(L2[5:]), run=0.4)
        self.play(Create(answer_box(L2[6])), run_time=0.35)
        self.wipe("38:10.80", run=0.35)


class K06_Ans3(Shot):
    def body(self):
        self.title("Answers", animate=False)
        F0 = fr(r"\sqrt{x}-3", "x-9", 56)
        L0 = row(LIMf(9, 56), F0)
        put(L0, -3.0, 0.7, ref=F0)
        self.go("38:11.20", FadeIn(qpill(3), shift=DOWN * 0.1), Write(L0), run=0.8)
        n00 = side_note("plug in 9:", M(r"\frac{0}{0}", size=56, color=YEL), [4.4, 1.05, 0])
        self.go("38:12.10", FadeIn(n00[0]), Write(n00[1]), run=0.5)
        cj = VGroup(H("conjugate works", 38, DIM), tick_mark(GRN, 0.4)).arrange(RIGHT, buff=0.25).move_to([4.2, 1.05, 0])
        self.go("38:13.70", FadeOut(n00), FadeIn(cj[0], shift=UP * 0.1), run=0.5)
        self.go("38:14.76", Create(cj[1]), run=0.4)
        sc = pill("shortcut", ORG, 38).move_to([4.2, 0.1, 0])
        self.go("38:16.04", FadeIn(sc, shift=DOWN * 0.1), run=0.4)
        # x - 9 as a difference of squares
        D = M("x-9", "=", r"(\sqrt{x}-3)", r"(\sqrt{x}+3)", size=58)
        D.shift([-1.6 - D[1].get_x(), -0.75 - D[1].get_y(), 0])
        ul = under(F0.d, ORG)
        self.go("38:17.06", Create(ul), Write(D[0]), run=0.6)
        dsq = H("difference of squares", 34, DIM).next_to(D, DOWN, buff=0.2)
        self.go("38:18.90", FadeIn(dsq, shift=UP * 0.1), run=0.5)
        self.go("38:19.74", Write(D[1:3]), run=0.9)
        self.go("38:21.42", Write(D[3]), run=0.8)
        G = fr(r"\sqrt{x}-3", [r"(\sqrt{x}-3)", r"(\sqrt{x}+3)"], 52)
        G2 = fr("1", r"\sqrt{x}+3", 52)
        LA = row(M("=", size=52), LIMf(9, 52), G, M("=", size=52), LIMf(9, 52), G2)
        put(LA, -3.4, -1.95)
        self.go("38:23.40", FadeOut(dsq), FadeOut(ul), Write(LA[0:2]), Write(G.n), Create(G.bar),
                TransformFromCopy(D[2:4], G.d), run=0.8)
        self.go("38:25.70", Create(strike(G.n)), Create(strike(G.d[0])), run=0.5)
        self.go("38:27.16", Write(LA[3:]), run=1.0)
        F3 = fr("1", ["3", "+", "3"], 52)
        F3.d[0].set_color(ORG); F3.d[2].set_color(ORG)
        F4 = fr("1", "6", 56, GRN)
        LB = row(M("=", size=52), F3, M("=", size=52), F4)
        put(LB, -3.4, -3.2)
        x9 = M("x=9", size=44, color=ORG).next_to(LB, RIGHT, buff=0.9)
        self.go("38:30.10", FadeIn(x9, shift=LEFT * 0.1), run=0.4)
        self.go("38:31.32", Write(LB[0:2]), run=0.7)
        self.go("38:33.26", Write(LB[2:]), run=0.4)
        self.play(Create(answer_box(F4)), run_time=0.35)
        # same answer either way
        self.wipe("38:34.40", run=0.3)
        a, b = np.array([-3.0, -0.4, 0]), np.array([3.0, -0.4, 0])
        up = ArcBetweenPoints(a, b, angle=-PI / 3, color=YEL, stroke_width=5)
        dn = ArcBetweenPoints(a, b, angle=PI / 3, color=ORG, stroke_width=5)
        st = VGroup(Dot(a, radius=0.1, color=CHALK), Dot(b, radius=0.11, color=GRN))
        lu = H("conjugate", 38, YEL).next_to(up, UP, buff=0.15)
        ld = H("shortcut", 38, ORG).next_to(dn, DOWN, buff=0.15)
        prob = M(r"\lim_{x\to 9}\frac{\sqrt{x}-3}{x-9}", size=48).next_to(a, LEFT, buff=0.3)
        six = M(r"\frac{1}{6}", size=64, color=GRN).next_to(b, RIGHT, buff=0.3)
        self.play(FadeIn(st), FadeIn(prob), FadeIn(six), run_time=0.4)
        self.play(draw(up, 0.8, YEL), draw(dn, 0.8, ORG), FadeIn(lu), FadeIn(ld), run_time=0.8)
        self.go("38:36.92", Create(answer_box(six)), run=0.4)
        self.wipe("38:37.95", run=0.35)


# ================================================================ one more, and why it's special

class K06_OneMore(Shot):
    def body(self):
        self.title("Answers", animate=False)
        self.title("One More", "38:38.80")
        eqx = -3.0
        v1 = M("=", lim("0"), r"\frac{", "x^2", "+6x", "+9", "-9", "}{", "{x}", "}", size=66)
        v2 = M("=", lim("0"), r"\frac{", "x^2", "+6x", "}{", "{x}", "}", size=66)
        v3 = M("=", lim("0"), r"\frac{", "x", "(x+6)", "}{", "{x}", "}", size=66)
        for v in (v1, v2, v3):
            on_eq(v, Y[1], eqx)
        L0 = first_row(frow([lim("0")], "(x+3)^2-9", "x"), Y[0], v1[1].get_left()[0])
        L2 = on_eq(M("=", lim("0"), "(x+6)", size=66), Y[2], eqx)
        L3 = on_eq(M("=", "0+6", "=", "6", size=66), Y[3], eqx)
        L3[1].set_color(ORG); L3[3].set_color(GRN)
        self.go("38:41.68", Write(L0[0]), run=0.7)
        self.go("38:43.84", Write(L0.num), run=1.4)
        self.go("38:46.52", Create(L0.bar), Write(L0.den), run=0.6)
        cx = (L0.get_right()[0] + 6.7) / 2
        lab = TX(r"plug in $x=0$", 40, DIM).move_to([cx, Y[0] + 0.6, 0])
        pl = M(r"\frac{9-9}{0}", "=", r"\frac{0}{0}", size=58).move_to([cx, Y[0] - 0.4, 0])
        pl[2].set_color(YEL)
        self.go("38:48.30", FadeIn(lab, shift=UP * 0.1), run=0.4)
        self.go("38:49.68", Write(pl[0]), run=0.9)
        self.go("38:51.76", Write(pl[1:]), run=0.5)
        ul = under(L0.num)
        self.go("38:53.48", FadeOut(lab), FadeOut(pl), Create(ul), run=0.5)
        sq = M("(x+3)^2", "=", "x^2+6x+9", size=54).move_to([3.0, Y[2] + 0.1, 0])
        self.go("38:54.36", Write(sq[0]), run=0.6)
        self.go("38:55.98", Write(sq[1:]), run=1.4)
        # expand, then cancel the 9s, then factor out x
        self.go("38:57.70", FadeOut(ul), Write(VGroup(*v1[0:3], *v1[7:])), run=0.5)
        self.go("38:58.30", TransformFromCopy(sq[2], VGroup(*v1[3:6])), run=0.7)
        self.go("38:59.24", Write(v1[6]), run=0.4)
        s1, s2 = strike(v1[5]), strike(v1[6])
        self.go("38:59.70", Create(s1), Create(s2), run=0.4)
        self.go("39:00.24", FadeOut(s1), FadeOut(s2), FadeOut(sq), TransformMatchingTex(v1, v2), run=0.8)
        ux = under(VGroup(v2[3], v2[4]))
        self.go("39:02.28", Create(ux), run=0.4)
        self.go("39:04.12", FadeOut(ux), TransformMatchingTex(v2, v3), run=0.8)
        self.go("39:06.60", Create(strike(v3[3])), Create(strike(v3[6])), run=0.5)
        self.go("39:08.16", Write(L2[0:2]), TransformFromCopy(v3[4], L2[2]), run=0.7)
        self.go("39:09.96", Write(L3[0:2]), run=0.6)
        self.go("39:11.26", Write(L3[2:4]), run=0.3)
        self.play(Create(answer_box(L3[3])), run_time=0.3)
        self.wipe("39:11.88", run=0.3)
        self.title("Why That One?", "39:12.20")


class K06_Secret(Shot):
    def body(self):
        self.title("Why That One?", animate=False)
        rec = M(r"\lim_{x\to 0}\frac{(x+3)^2-9}{x}", "=", "6", size=50).move_to([0, 1.72, 0])
        rec[2].set_color(PINK)
        self.go("39:14.42", Write(rec), run=0.9)
        f = lambda x: x * x
        ax = axes((0, 4.5, 1), (0, 20, 5), x_length=5.4, y_length=4.0, center=(-3.0, -1.35, 0))
        ax.labels.add(M("3", size=34, color=ORG).next_to(ax.c2p(3, 0), DOWN, buff=0.12))
        self.go("39:16.70", Create(ax), FadeIn(ax.labels), run=0.7)
        par = curve(ax, f, [0, 4.45])
        pl = M("y=x^2", size=46, color=BLUE).next_to(ax.c2p(4.3, 18.5), LEFT, buff=0.35)
        self.go("39:18.92", draw(par, 0.9, BLUE), FadeIn(pl), run=0.9)
        # the limit is the slope of the line from x = 3 to x = 3 + (step): watch the step shrink
        h = ValueTracker(1.4)
        P = pt(ax, 3, 9, ORG)
        guide = DashedLine(ax.c2p(3, 0), ax.c2p(3, 9), color=DIM, stroke_width=3, dash_length=0.1)
        sec_l = always_redraw(lambda: secant(ax, f, 3, h.get_value(), extend=1.0))
        Q = always_redraw(lambda: pt(ax, 3 + h.get_value(), f(3 + h.get_value()), ORG))
        step = always_redraw(lambda: Line(ax.c2p(3, 0), ax.c2p(3 + h.get_value(), 0), color=ORG, stroke_width=6))
        lab = M(r"\text{slope} =", size=48, color=ORG).move_to([2.0, 0.2, 0])
        num = always_redraw(lambda: M(f"{h.get_value() + 6:.1f}", size=48, color=ORG).next_to(lab, RIGHT, buff=0.15))
        self.go("39:20.14", Create(guide), FadeIn(P, scale=0.5), FadeIn(Q), Create(sec_l), Create(step), FadeIn(lab), FadeIn(num), run=0.6)
        self.go("39:21.24", h.animate.set_value(0.0001), run=2.2)
        # it becomes the tangent: that's a derivative
        tan = tangent(ax, f, 3, length=3.4)
        lab2 = M(r"\text{slope} =", "6", size=48, color=PINK).move_to(VGroup(lab, num))
        sec_l.clear_updaters(); Q.clear_updaters(); step.clear_updaters(); num.clear_updaters()
        self.go("39:23.64", FadeOut(sec_l), FadeOut(Q), FadeOut(step), Create(tan),
                ReplacementTransform(VGroup(lab, num), lab2), run=0.7)
        der = H("a derivative", 54, PINK).move_to([2.6, -1.0, 0])
        self.go("39:25.40", Write(der), run=0.8)
        ch = pill("Chapter 4", DIM, 34, width=3).move_to([2.6, -2.3, 0])
        self.go("39:28.20", FadeIn(ch, shift=UP * 0.1), run=0.5)
        self.go("39:30.82", Circumscribe(rec[2], color=PINK, buff=0.12), run=0.8)
