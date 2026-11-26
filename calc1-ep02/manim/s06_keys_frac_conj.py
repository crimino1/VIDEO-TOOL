"""Builder 06: Key #2 (fractions inside fractions) and Key #3 (the conjugate trick)."""
from common import *

TITLE = "The 0/0 Puzzle"
LIM = r"\lim_{x\to 0}"


def kpill(n, name):
    return pill(f"Key #{n}: {name}", YEL, size=30).move_to([0, 2.3, 0])


def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def arr(p, q, color=DIM):
    return Arrow(np.array(p, float), np.array(q, float), buff=0, stroke_width=4, tip_length=0.2, color=color,
                 max_stroke_width_to_length_ratio=20, max_tip_length_to_length_ratio=0.4)


# ---------------------------------------------------------------- Key #2 boards

def k2_lim(size):
    # 0 lim, 2 1/(x+2), 3 -, 4 1/2, 5 big bar, 6 x
    return M(LIM, r"\frac{", r"\dfrac{1}{x+2}", "-", r"\dfrac{1}{2}", "}{", "x", "}", size=size)


def k2_r0():
    return k2_lim(60).move_to([-1.2, 0.45, 0])


def k2_plug():
    x0 = M("x=0", size=48, color=ORG).move_to([-5.0, -2.1, 0])
    r1 = M(r"\frac{", r"\dfrac{1}{2}-\dfrac{1}{2}", "}{", "0", "}", "=", r"\frac{0}{0}", size=60)
    r1[6].set_color(YEL)
    r1.move_to([0, -2.1, 0]).align_to([-3.6, 0, 0], LEFT)
    return x0, r1


EQ2 = -0.4


def k2_board2():
    """The board after combining the top (end of K06_FracCombine)."""
    r0 = k2_lim(48).move_to([-3.0, 0.7, 0])
    bx = box(VGroup(r0[2], r0[3], r0[4]), YEL, buff=0.1)
    nt = H("common bottom", 38, DIM).move_to([3.7, 1.15, 0])
    cb = M("2(x+2)", size=56, color=ORG).next_to(nt, DOWN, buff=0.25)
    # 0 1/(x+2), 1 -, 2 1/2, 3 =, 5 top, 6 bar, 7 bottom
    r2 = at_eq(M(r"\frac{1}{x+2}", "-", r"\frac{1}{2}", "=", r"\frac{", "2-(x+2)", "}{", "2(x+2)", "}", size=56), 3, EQ2, -1.25)
    r2[7].set_color(ORG)
    r3 = at_eq(M("=", r"\frac{", "-x", "}{", "2(x+2)", "}", size=56), 0, EQ2, -2.85)
    b3 = box(VGroup(r3[2], r3[3], r3[4]), YEL, buff=0.1)
    return dict(r0=r0, bx=bx, nt=nt, cb=cb, r2=r2, r3=r3, b3=b3)


class K06_FracSetup(Shot):
    def body(self):
        self.title(TITLE, "15:44.48")
        p = kpill(2, "Fractions inside fractions")
        self.go("15:45.00", FadeIn(p, shift=DOWN * 0.1), run=0.5)
        r0 = k2_r0()
        ls = H("small fractions", 40, YEL).move_to([4.4, 1.15, 0])
        lb = H("big fraction", 40).move_to([4.4, -0.45, 0])
        self.go("15:50.14", FadeIn(ls, shift=UP * 0.1), run=0.5)
        self.go("15:51.96", FadeIn(lb, shift=UP * 0.1), run=0.5)
        self.go("15:54.72", Write(r0[0]), run=0.7)
        self.go("15:57.20", Write(r0[2]), run=0.8)
        self.go("15:58.62", Write(r0[3]), Write(r0[4]), run=0.8)
        a1 = arr(ls.get_left() + LEFT * 0.15, r0[4].get_right() + RIGHT * 0.15, YEL)
        self.go("15:59.60", Create(a1), run=0.5)
        self.go("16:00.36", Write(r0[5]), run=0.5)
        self.go("16:01.04", Write(r0[6]), run=0.4)
        a2 = arr(lb.get_left() + LEFT * 0.15, r0[5].get_right() + RIGHT * 0.12)
        self.play(Create(a2), run_time=0.4)
        self.go("16:02.54", FadeOut(VGroup(ls, lb, a1, a2)), run=0.5)
        x0, r1 = k2_plug()
        self.go("16:04.38", FadeIn(x0, shift=RIGHT * 0.1), run=0.4)
        self.go("16:05.02", Write(r1[1]), run=1.2)
        self.go("16:07.14", Write(r1[2]), Write(r1[3]), run=0.5)
        self.go("16:08.38", Write(r1[5]), Write(r1[6]), run=0.6)
        self.play(Circumscribe(r1[6], color=YEL, buff=0.1), run_time=0.9)


class K06_FracCombine(Shot):
    def body(self):
        self.title(TITLE, animate=False)
        p = kpill(2, "Fractions inside fractions")
        r0 = k2_r0()
        x0, r1 = k2_plug()
        self.add(p, r0, x0, r1)
        b = k2_board2()
        self.go("16:10.28", FadeOut(VGroup(x0, r1)), ReplacementTransform(r0, b["r0"]), run=0.7)
        r0 = b["r0"]
        self.go("16:11.42", Create(b["bx"]), run=0.6)
        self.go("16:14.80", FadeIn(b["nt"], shift=UP * 0.1), run=0.5)
        self.go("16:18.88", Write(b["cb"]), run=0.7)
        r2 = b["r2"]
        self.go("16:20.72", TransformFromCopy(VGroup(r0[2], r0[3], r0[4]), VGroup(r2[0], r2[1], r2[2])), run=0.8)
        self.go("16:21.72", Write(r2[3]), Write(r2[5]), run=1.0)
        self.go("16:23.92", Write(r2[6]), TransformFromCopy(b["cb"], r2[7]), run=0.8)
        r3a = at_eq(M("=", r"\frac{", "2-x-2", "}{", "2(x+2)", "}", size=56), 0, EQ2, -2.85)
        self.go("16:26.04", Write(r3a), run=1.0)
        self.go("16:27.96", ReplacementTransform(r3a, b["r3"]), run=0.6)
        self.go("16:29.54", Create(b["b3"]), run=0.6)
        self.play(Indicate(b["bx"], color=YEL, scale_factor=1.04), run_time=0.8)


class K06_FracCancel(Shot):
    def body(self):
        self.title(TITLE, animate=False)
        p = kpill(2, "Fractions inside fractions")
        b = k2_board2()
        self.add(p, *b.values())
        EQ = -2.2
        # 0 lim, 2 inner fraction (glyphs: -, x, bar, 2(x+2)), 3 bar, 4 x
        rA = M(LIM, r"\frac{", r"\dfrac{-x}{2(x+2)}", "}{", "x", "}", size=56)
        rA.move_to([0, 0.6, 0]).align_to([EQ + 0.45, 0, 0], LEFT)
        rB = at_eq(M("=", LIM, r"\frac{", "-1", "}{", "2(x+2)", "}", size=56), 0, EQ, -1.45)
        rC = at_eq(M("=", r"\frac{", "-1", "}{", r"2\cdot 2", "}", "=", r"-\frac{1}{4}", size=56), 0, EQ, -3.0)
        rC[7].set_color(GRN)
        r3 = b["r3"]
        old = [m for k, m in b.items()]
        self.go("16:33.24", *[FadeOut(m) for m in old],
                TransformFromCopy(VGroup(r3[2], r3[3], r3[4]), rA[2]), run=0.5)
        self.play(Write(rA[0]), run_time=0.35)
        self.go("16:34.16", Write(rA[3]), Write(rA[4]), run=0.5)
        self.go("16:35.96", Create(strike(rA[2][1])), run=0.4)
        self.go("16:37.52", Create(strike(rA[4])), run=0.4)
        self.go("16:39.34", Write(rB[0]), Write(rB[1]), run=0.45)
        self.go("16:39.80", Write(rB[3]), run=0.4)
        self.go("16:40.68", Write(rB[4]), Write(rB[5]), run=0.9)
        x0 = M("x=0", size=48, color=ORG).next_to(rB, RIGHT, buff=0.9)
        self.go("16:44.02", FadeIn(x0, shift=LEFT * 0.1), run=0.4)
        self.go("16:45.30", Write(rC[0]), Write(rC[2]), run=0.45)
        self.go("16:45.88", Write(rC[3]), Write(rC[4]), run=0.7)
        self.go("16:47.68", Write(rC[6]), Write(rC[7]), run=0.6)
        self.go("16:48.42", Create(box(rC[7], GRN, buff=0.15)), run=0.5)
        # a messy problem made simple
        self.wipe("16:49.30", run=0.3, keep=[p])
        orig = k2_lim(52).move_to([-3.6, 0.4, 0])
        lm = H("messy", 40, DIM).move_to([-3.6, -1.5, 0])
        self.play(FadeIn(orig, shift=UP * 0.1), FadeIn(lm, shift=UP * 0.1), run_time=0.5)
        ans = M(r"-\frac{1}{4}", size=72, color=GRN).move_to([3.4, 0.4, 0])
        ab = box(ans, GRN, buff=0.2)
        lsimp = H("simple", 40, GRN).move_to([3.4, -1.5, 0])
        a = arr([-0.9, 0.4, 0], [2.0, 0.4, 0], CHALK)
        self.go("16:50.90", Create(a), FadeIn(ans, shift=LEFT * 0.1), Create(ab), FadeIn(lsimp, shift=UP * 0.1), run=0.6)
        self.wipe("16:51.90", run=0.35)


# ---------------------------------------------------------------- Key #3 boards

def k3_idea():
    ab = M("a-b", size=72).move_to([-2.7, 0.95, 0])
    a = arr([-1.5, 0.95, 0], [1.5, 0.95, 0])
    al = H("conjugate", 34, DIM).next_to(a, UP, buff=0.12)
    ab2 = M("a", "+", "b", size=72).move_to([2.7, 0.95, 0])
    ab2[1].set_color(YEL)
    pr = M("(a-b)", "(a+b)", "=", "a^2-b^2", size=72).move_to([0, -0.6, 0])
    pr[1][2].set_color(YEL)
    pn = panel(pr, PURP, buff=0.3)
    sq = M(r"\Big(", r"\sqrt{x+9}", r"\Big)^2", "=", "x+9", size=64).move_to([0, -2.65, 0])
    sq[4].set_color(GRN)
    return dict(ab=ab, a=a, al=al, ab2=ab2, pr=pr, pn=pn, sq=sq)


def k3_line():
    # 0 lim, 2 top, 3 bar, 4 x, 6 dot, 8 conj top, 9 conj bar, 10 conj bottom
    L = M(LIM, r"\frac{", r"\sqrt{x+9}-3", "}{", "x", "}", r"\cdot", r"\frac{", r"\sqrt{x+9}+3", "}{", r"\sqrt{x+9}+3", "}", size=52)
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
        self.title(TITLE, animate=False)
        p = kpill(3, "The conjugate trick")
        self.go("16:52.44", FadeIn(p, shift=DOWN * 0.1), run=0.5)
        s = M(r"\sqrt{\phantom{x+9}}", r"\to", r"\frac{0}{0}", size=80).move_to([0, 0.5, 0])
        self.go("16:56.02", Write(s[0]), run=0.6)
        self.go("16:56.94", Write(s[1]), Write(s[2]), run=0.6)
        cj = H("conjugate", 60, YEL).move_to([0, -1.6, 0])
        ul = brush_line(cj.width + 0.4, center=cj.get_bottom() + DOWN * 0.12, seed=3)
        self.go("16:59.56", Write(cj), run=0.8)
        self.play(Create(ul), run_time=0.4)
        self.wipe("17:01.20", run=0.35, keep=[p])
        k = k3_idea()
        self.go("17:02.14", Write(k["ab"]), run=0.6)
        self.go("17:03.02", Create(k["a"]), FadeIn(k["al"], shift=UP * 0.1), run=0.5)
        self.go("17:03.58", Write(k["ab2"]), run=0.6)
        pr = k["pr"]
        self.go("17:07.76", Write(pr[0]), run=0.6)
        self.go("17:09.32", Write(pr[1]), run=0.6)
        self.go("17:10.88", Write(pr[2]), Write(pr[3]), run=0.8)
        self.go("17:12.20", Create(k["pn"]), run=0.6)
        sq = k["sq"]
        self.go("17:14.38", Write(sq[1]), run=0.6)
        self.go("17:15.02", Write(sq[0]), Write(sq[2]), run=0.5)
        self.go("17:17.00", Write(sq[3]), Write(sq[4]), run=0.6)


class K06_ConjSetup(Shot):
    def body(self):
        self.title(TITLE, animate=False)
        p = kpill(3, "The conjugate trick")
        self.add(p, *k3_idea().values())
        self.wipe("17:18.18", run=0.4, keep=[p])
        c0 = M(LIM, r"\frac{", r"\sqrt{x+9}-3", "}{", "x", "}", size=60).move_to([0, 0.9, 0])
        self.go("17:19.74", Write(c0[0]), run=0.6)
        self.go("17:21.94", Write(c0[2]), run=1.2)
        self.go("17:24.56", Write(c0[3]), Write(c0[4]), run=0.6)
        x0 = M("x=0", size=48, color=ORG).move_to([-5.0, -1.3, 0])
        c1 = M(r"\frac{", r"\sqrt{9}-3", "}{", "0", "}", "=", r"\frac{", "3-3", "}{", "0", "}", "=", r"\frac{0}{0}", size=60)
        c1[12].set_color(YEL)
        c1.move_to([0, -1.3, 0]).align_to([-3.6, 0, 0], LEFT)
        self.go("17:26.98", FadeIn(x0, shift=RIGHT * 0.1), run=0.4)
        self.go("17:27.92", Write(c1[1]), Write(c1[2]), Write(c1[3]), run=0.9)
        self.go("17:29.00", Write(c1[5]), Write(c1[7]), Write(c1[8]), Write(c1[9]), run=0.5)
        self.go("17:29.74", Write(c1[11]), Write(c1[12]), run=0.5)
        L = k3_line()
        self.go("17:31.80", FadeOut(VGroup(x0, c1)), ReplacementTransform(c0, VGroup(*L[:6])), run=0.7)
        self.go("17:35.10", Write(L[6]), run=0.3)
        self.go("17:36.38", Write(L[8]), run=0.9)
        self.play(Write(L[9]), Write(L[10]), run_time=0.8)
        one = k3_one()
        self.go("17:40.32", TransformFromCopy(VGroup(L[8], L[9], L[10]), VGroup(one[1], one[2], one[3])), run=0.8)
        self.go("17:44.30", Write(one[5]), Write(one[6]), run=0.5)


class K06_ConjSimplify(Shot):
    def body(self):
        self.title(TITLE, animate=False)
        p = kpill(3, "The conjugate trick")
        L, one = k3_line(), k3_one()
        self.add(p, L, one)
        EQ = L.get_left()[0] - 0.45
        tl = H("top:", 38, DIM)
        tw = M(r"(\sqrt{x+9}-3)", r"(\sqrt{x+9}+3)", "=", "(x+9)-9", "=", "x", size=52)
        tw[1].set_color(YEL); tw[5].set_color(YEL)
        tw.move_to([0, -0.55, 0]).align_to([-4.6, 0, 0], LEFT)
        tl.next_to(tw, LEFT, buff=0.3)
        self.go("17:45.38", FadeOut(one), FadeIn(tl, shift=RIGHT * 0.1), run=0.45)
        self.go("17:45.92", Write(tw[0]), run=0.8)
        self.go("17:48.22", Write(tw[1]), run=0.9)
        self.go("17:51.08", Write(tw[2]), Write(tw[3]), run=0.8)
        self.go("17:54.24", Write(tw[4]), Write(tw[5]), run=0.5)
        bl = H("bottom:", 38, DIM)
        bw = M("x", r"(\sqrt{x+9}+3)", size=52)
        bw[1].set_color(YEL)
        bw.move_to([0, -1.95, 0]).align_to(tw, LEFT)
        bl.next_to(bw, LEFT, buff=0.3)
        self.go("17:56.32", FadeIn(bl, shift=RIGHT * 0.1), run=0.4)
        self.go("17:57.28", Write(bw[0]), run=0.4)
        self.go("17:58.16", Write(bw[1]), run=0.9)
        # 0 =, 1 lim, 3 x top, 4 bar, 5 x bottom, 6 (sqrt+3)
        q1 = at_eq(M("=", LIM, r"\frac{", "x", "}{", "x", r"(\sqrt{x+9}+3)", "}", size=52), 0, EQ, -0.75)
        q2 = at_eq(M("=", LIM, r"\frac{", "1", "}{", r"\sqrt{x+9}+3", "}", size=52), 0, EQ, -2.35)
        q3 = M("=", r"\frac{", "1", "}{", "3+3", "}", "=", r"\frac{1}{6}", size=52)
        q3[7].set_color(GRN)
        self.go("18:01.30", FadeOut(VGroup(tl, bl, tw[:5])),
                ReplacementTransform(tw[5], q1[3]), ReplacementTransform(bw, VGroup(q1[5], q1[6])),
                Write(q1[0]), Write(q1[1]), Write(q1[4]), run=0.45)
        self.go("18:01.78", Create(strike(q1[3])), run=0.4)
        self.go("18:03.40", Create(strike(q1[5])), run=0.4)
        self.go("18:05.10", Write(q2[0]), Write(q2[1]), run=0.4)
        self.go("18:05.54", Write(q2[3]), run=0.3)
        self.go("18:05.84", Write(q2[4]), Write(q2[5]), run=0.9)
        q3.shift(UP * (q2[0].get_y() - q3[0].get_y())).next_to(q2, RIGHT, buff=0.25, coor_mask=[1, 0, 0])
        x0 = M("x=0", size=44, color=ORG).next_to(VGroup(*q3[0:6]), DOWN, buff=0.35)
        self.go("18:09.58", FadeIn(x0, shift=LEFT * 0.1), run=0.4)
        self.go("18:10.76", Write(q3[0]), Write(q3[2]), run=0.3)
        self.go("18:11.10", Write(q3[3]), Write(q3[4]), run=0.6)
        self.go("18:12.70", Write(q3[6]), Write(q3[7]), run=0.4)
        fb = box(q3[7], GRN, buff=0.15)
        self.go("18:13.10", Create(fb), run=0.5)
        self.go("18:14.68", Circumscribe(L[2], color=YEL, buff=0.1), run=1.0)
        self.go("18:15.82", Circumscribe(VGroup(q3[7], fb), color=GRN, buff=0.08), run=0.8)
