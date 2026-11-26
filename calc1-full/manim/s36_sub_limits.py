"""Builder 36: end of Chapter 12 (3:45:26.72 - 3:51:33.77).
More u-substitution: e^(5x) (dx = du/5), the quick pattern (inside = k x: integrate, divide by k; cos 4x, e^(-2x)),
x e^(x^2), sin x cos x (du sitting right there), tan x = sin/cos (-ln|cos x| = ln|sec x|), top = derivative of bottom
gives ln|bottom| ((2x+3)/(x^2+3x+1)), ln x / x. Definite integrals: change the limits (the x-limits fly into the panel,
the u-values fly back onto the new integral): 0..2 of x(x^2+1)^3 = 1/2 . 624/4 = 78; the old-limits mistake (gives 2);
0..pi/2 of sin^2 x cos x = 1/3; two practice problems ((x^3+1)^5/15 + C, e - 1); chapter summary; next chapter teaser.
Colours: inside u ORG, du PINK, limits YEL (RED when wrong), answers GRN.
Whisper fixes: "U" = u, "ln x squared over 2" = (ln x)^2 / 2, "2xE to the x squared" = 2x e^(x^2), "f of b" = F(b).
Chapter 13's card belongs to builder 37."""
from common import *

PX = 3.9  # the u / du panel on the right, aligned on "="


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    """Move a MathTex so its part i (usually '=') sits at (x, y)."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def left_at(line, i, x, y):
    """Move a MathTex so the left edge of part i sits at x, its centre at height y."""
    line.shift(RIGHT * (x - line[i].get_left()[0]) + UP * (y - line[i].get_y()))
    return line


def settle(scene, group):
    """After piece-by-piece animations, put the whole MathTex back on stage as one object."""
    scene.remove(*group.get_family())
    scene.add(group)


def lims(part):
    """Split a part like \\int_0^2 or \\Big]_1^5 into (sign, lower limit, upper limit) glyph groups."""
    gs = list(part)
    sign = max(gs, key=lambda m: m.height)
    rest = [m for m in gs if m is not sign]
    return sign, VGroup(*[m for m in rest if m.get_y() < sign.get_y()]), VGroup(*[m for m in rest if m.get_y() >= sign.get_y()])


def frac_split(part):
    """Split a part holding one \\frac into (numerator, bar, denominator)."""
    gs = list(part)
    bar = max(gs, key=lambda m: m.width / (m.height + 0.01))
    rest = [m for m in gs if m is not bar]
    return VGroup(*[m for m in rest if m.get_y() > bar.get_y()]), bar, VGroup(*[m for m in rest if m.get_y() < bar.get_y()])


def prow(parts, y, color, size=58, i=1, x=PX):
    return at_eq(M(*parts, size=size, color=color), i, x, y)


def swap(scene, pairs=(), fold=(), into=None, flies=(), writes=(), run=1.1):
    """One substitution move: pairs morph (src -> tgt), fold pieces shrink into `into`, flies copy panel pieces in."""
    anims = [ReplacementTransform(a, b) for a, b in pairs]
    gone = VGroup(*fold)
    if len(fold):
        anims.append(gone.animate.scale(0.15).move_to(into).set_opacity(0))
    anims += [TransformFromCopy(a, b, path_arc=0.5) for a, b in flies]
    anims += [Write(w) for w in writes]
    scene.play(*anims, run_time=run)
    scene.remove(gone)


def limit_row(xv, uexpr, uval, y, size=50):
    """x = 0  =>  u = 0^2+1 = 1 (x-value and u-value in YEL)."""
    r = M("x", "=", xv, r"\;\Rightarrow\;", "u", "=", uexpr, "=", uval, size=size)
    r[2].set_color(YEL); r[8].set_color(YEL); r[4].set_color(ORG); r[3].set_color(DIM)
    return at_eq(r, 3, 2.45, y)


# ---------------------------------------------------------------- more u-substitution

class K36_Exp5x(Shot):
    """e^(5x): u = 5x, du = 5 dx, dx = du/5; 1/5 integral e^u du = e^(5x)/5 + C."""
    def body(self):
        self.title("Exponentials", "3:45:26.87")
        I = M(r"\int", "e^{5x}", r"\,dx", size=70).move_to([-3.4, 1.5, 0])
        self.go("3:45:29.57", Write(I), run=1.2)
        P1 = prow(("u", "=", "5x"), 1.5, ORG)
        P2 = prow(("du", "=", "5", r"\,dx"), 0.35, PINK)
        P3 = prow(("dx", "=", r"\frac{1}{5}", r"\,du"), -0.95, PINK)
        P2[2].set_color(ORG); P3[2].set_color(ORG)
        self.go("3:45:32.33", I[1][1:].animate.set_color(ORG), Write(P1[:2]), TransformFromCopy(I[1][1:], P1[2]), run=0.8)
        self.go("3:45:34.49", Write(P2), run=1.2)
        self.go("3:45:35.81", Circumscribe(P2[2], color=ORG, buff=0.08), run=0.6)
        self.go("3:45:37.65", Write(P3), Circumscribe(I[2], color=YEL, buff=0.08), run=1.0)
        J = M("=", r"\frac{1}{5}", r"\int", "e^u", r"\,du", size=70)
        left_at(J, 2, I[0].get_left()[0] + 0.9, -0.2)
        J[1].set_color(ORG); J[3][1].set_color(ORG); J[4].set_color(PINK)
        Ic = I.copy()
        self.at("3:45:39.93")
        swap(self, pairs=[(Ic[0], J[2]), (Ic[1], J[3])], fold=[Ic[2]], into=J[4],
             flies=[(P3[2], J[1]), (P3[3], J[4])], writes=[J[0]], run=1.2)
        settle(self, J)
        K = at_eq(M("=", r"\frac{1}{5}", "e^u", "+C", size=70), 0, J[0].get_x(), -2.45)
        K[1].set_color(ORG); K[2][1].set_color(ORG)
        self.go("3:45:42.41", Write(K), run=1.0)
        Fin = at_eq(M("=", r"\frac{e^{5x}}{5}", "+C", size=70, color=GRN), 0, J[0].get_x(), -2.45)
        Fin[0].set_color(CHALK)
        self.go("3:45:44.89", ReplacementTransform(K[0], Fin[0]), ReplacementTransform(K[1:3], Fin[1]),
                ReplacementTransform(K[3], Fin[2]), run=1.2)
        self.go("3:45:46.27", Create(answer_box(Fin[1:])), run=0.5)


class K36_QuickPattern(Shot):
    """Inside = k x: integrate as normal, divide by k. cos 4x -> sin 4x / 4; e^(-2x) -> e^(-2x) / (-2)."""
    def body(self):
        self.title("A Quick Pattern", "3:45:48.09")
        R = M(r"\int f(", "k", r"x)\,dx", "=", r"\frac{1}{", "k", "}", "F(", "k", "x)+C", size=62).move_to([0, 1.5, 0])
        for i in (1, 5, 8):
            R[i].set_color(ORG)
        self.go("3:45:49.80", Write(R[:3]), run=0.9)
        self.go("3:45:51.03", Circumscribe(R[1], color=ORG, buff=0.08), run=0.6)
        self.go("3:45:52.63", Write(R[3]), Write(R[7:]), run=0.9)
        self.go("3:45:53.85", Write(R[4]), Write(R[6]), TransformFromCopy(R[1], R[5], path_arc=-1.2), run=0.9)
        self.play(Create(panel(R, YEL, buff=0.25, width=3)), run_time=0.4)
        EX = R[3].get_x()
        E1 = at_eq(M(r"\int\cos(", "4", r"x)\,dx", "=", r"\frac{\sin(4x)}{4}", "+C", size=62), 3, EX, -0.65)
        E1[1].set_color(ORG)
        n1, b1, d1 = frac_split(E1[4])
        d1.set_color(ORG)
        self.go("3:45:56.13", Write(E1[:3]), run=0.9)
        self.go("3:45:57.87", Write(E1[3]), Write(VGroup(n1, b1)), run=0.9)
        self.go("3:45:59.25", TransformFromCopy(E1[1], d1, path_arc=-1.2), run=0.7)
        self.go("3:45:59.97", Write(E1[5]), run=0.4)
        E2 = at_eq(M(r"\int e^{", "-2", r"x}\,dx", "=", r"\frac{e^{-2x}}{-2}", "+C", size=62), 3, EX, -2.6)
        E2[1].set_color(ORG)
        n2, b2, d2 = frac_split(E2[4])
        d2.set_color(ORG)
        self.go("3:46:01.59", Write(E2[:3]), run=0.9)
        self.go("3:46:03.49", Write(E2[3]), Write(VGroup(n2, b2)), run=0.9)
        self.go("3:46:05.05", TransformFromCopy(E2[1], d2, path_arc=-1.2), run=0.7)
        self.go("3:46:06.07", Write(E2[5]), run=0.4)


class K36_XExp(Shot):
    """x e^(x^2): u = x^2, du = 2x dx, x dx = du/2; 1/2 e^(x^2) + C."""
    def body(self):
        self.title("One More Exponential", "3:46:07.43")
        I = M(r"\int", "x", "e^{x^2}", r"\,dx", size=70).move_to([-3.4, 1.5, 0])
        self.go("3:46:07.95", Write(I), run=1.1)
        P1 = prow(("u", "=", "x^2"), 1.5, ORG)
        P2 = prow(("du", "=", r"2x\,dx"), 0.35, PINK)
        P3 = prow((r"x\,dx", "=", r"\frac{1}{2}", r"\,du"), -0.95, PINK)
        P3[2].set_color(ORG)
        self.go("3:46:10.23", I[2][1:].animate.set_color(ORG), Write(P1[:2]), TransformFromCopy(I[2][1:], P1[2]), run=0.8)
        self.go("3:46:11.51", Write(P2), run=1.0)
        self.go("3:46:14.21", I[1].animate.set_color(PINK), I[3].animate.set_color(PINK), Write(P3), run=1.0)
        J = M("=", r"\frac{1}{2}", r"\int", "e^u", r"\,du", size=70)
        left_at(J, 2, I[0].get_left()[0] + 0.9, -0.2)
        J[1].set_color(ORG); J[3][1].set_color(ORG); J[4].set_color(PINK)
        Ic = I.copy()
        self.at("3:46:16.41")
        swap(self, pairs=[(Ic[0], J[2]), (Ic[2], J[3])], fold=[Ic[1], Ic[3]], into=J[4],
             flies=[(P3[2], J[1]), (P3[3], J[4])], writes=[J[0]], run=1.1)
        settle(self, J)
        Fin = at_eq(M("=", r"\frac{1}{2}", "e^{x^2}", "+C", size=70, color=GRN), 0, J[0].get_x(), -2.45)
        Fin[0].set_color(CHALK)
        self.go("3:46:18.71", Write(Fin), run=1.1)
        self.go("3:46:20.47", Create(answer_box(Fin[1:])), run=0.5)


class K36_SinCos(Shot):
    """sin x cos x: u = sin x, du = cos x dx is sitting right there; u^2/2 -> sin^2 x / 2 + C."""
    def body(self):
        self.title("Some Trig Ones", "3:46:22.05")
        I = M(r"\int", r"\sin x", r"\cos x", r"\,dx", size=70).move_to([-3.4, 1.5, 0])
        self.go("3:46:23.79", Write(I), run=1.2)
        P1 = prow(("u", "=", r"\sin x"), 1.5, ORG)
        P2 = prow(("du", "=", r"\cos x\,dx"), 0.35, PINK)
        self.go("3:46:26.27", I[1].animate.set_color(ORG), Write(P1[:2]), TransformFromCopy(I[1], P1[2]), run=0.8)
        self.go("3:46:28.55", Write(P2), run=1.1)
        self.go("3:46:31.33", I[2].animate.set_color(PINK), I[3].animate.set_color(PINK), run=0.4)
        self.play(Circumscribe(VGroup(I[2], I[3]), color=PINK, buff=0.1), Circumscribe(P2[2], color=PINK, buff=0.1), run_time=0.8)
        J = M("=", r"\int", "u", r"\,du", size=70)
        left_at(J, 1, I[0].get_left()[0], -0.2)
        J[2].set_color(ORG); J[3].set_color(PINK)
        Ic = I.copy()
        self.at("3:46:33.29")
        swap(self, pairs=[(Ic[0], J[1]), (Ic[1], J[2])], fold=[Ic[2], Ic[3]], into=J[3],
             flies=[(P2[0], J[3])], writes=[J[0]], run=1.1)
        settle(self, J)
        K = at_eq(M("=", r"\frac{u^2}{2}", "+C", size=70), 0, J[0].get_x(), -2.45)
        self.go("3:46:35.93", Write(K), run=0.9)
        Fin = at_eq(M("=", r"\frac{\sin^2 x}{2}", "+C", size=70, color=GRN), 0, J[0].get_x(), -2.45)
        Fin[0].set_color(CHALK)
        self.go("3:46:37.41", *[ReplacementTransform(K[i], Fin[i]) for i in range(3)], run=1.1)
        self.go("3:46:39.45", Create(answer_box(Fin[1:])), run=0.5)


class K36_Tan(Shot):
    """tan x = sin x / cos x; u = cos x, du = -sin x dx; -integral du/u = -ln|cos x| + C = ln|sec x| + C."""
    def body(self):
        self.title("The Integral of Tangent", "3:46:41.29")
        I0 = M(r"\int", r"\tan x", r"\,dx", size=70).move_to([-3.6, 1.5, 0])
        self.go("3:46:41.80", Write(I0), run=0.8)
        qm = M("?", size=80, color=YEL).next_to(I0, RIGHT, buff=0.4)
        self.go("3:46:44.77", FadeIn(qm, shift=DOWN * 0.1), run=0.5)
        I1 = M(r"\int", r"\frac{\sin x}{\cos x}", r"\,dx", size=70).move_to(I0).align_to(I0, LEFT)
        num, bar, den = frac_split(I1[1])
        self.go("3:46:47.19", FadeOut(qm), *[ReplacementTransform(I0[i], I1[i]) for i in range(3)], run=1.0)
        settle(self, I1)
        P1 = prow(("u", "=", r"\cos x"), 1.5, ORG)
        P2 = prow(("du", "=", r"-\sin x\,dx"), 0.35, PINK)
        P3 = prow((r"\sin x\,dx", "=", "-", "du"), -0.95, PINK)
        self.go("3:46:50.99", den.animate.set_color(ORG), Write(P1[:2]), TransformFromCopy(den, P1[2]), run=0.9)
        self.go("3:46:53.01", Write(P2), run=1.2)
        self.go("3:46:56.29", num.animate.set_color(PINK), I1[2].animate.set_color(PINK), Write(P3), run=1.2)
        J = M("=", "-", r"\int", r"\frac{du}{u}", size=70)
        left_at(J, 2, I1[0].get_left()[0] + 0.7, -0.3)
        jn, jb, jd = frac_split(J[3])
        jn.set_color(PINK); jd.set_color(ORG)
        Ic = I1.copy()
        cn, cb, cd = frac_split(Ic[1])
        self.at("3:46:59.97")
        swap(self, pairs=[(Ic[0], J[2]), (cb, jb), (cd, jd)], fold=[cn, Ic[2]], into=jn,
             flies=[(P3[2], J[1]), (P3[3], jn)], writes=[J[0]], run=1.2)
        settle(self, J)
        K = at_eq(M("=", r"-\ln|u|", "+C", size=66), 0, J[0].get_x(), -2.3)
        self.go("3:47:03.83", Write(K), run=1.2)
        F1 = at_eq(M("=", r"-\ln|\cos x|", "+C", size=66, color=GRN), 0, J[0].get_x(), -2.3)
        F1[0].set_color(CHALK)
        self.go("3:47:07.41", *[ReplacementTransform(K[i], F1[i]) for i in range(3)], run=1.3)
        self.go("3:47:10.83", Create(answer_box(F1[1:])), run=0.5)
        F2 = M("=", r"\ln|\sec x|", "+C", size=66, color=GRN)
        F2[0].set_color(CHALK)
        F2.next_to(F1, RIGHT, buff=1.2)
        orw = H("or", 38, DIM).move_to((F1.get_right() + F2.get_left()) / 2)
        self.go("3:47:13.53", FadeIn(orw), Write(F2), run=1.1)
        self.go("3:47:16.55", Create(answer_box(F2[1:])), run=0.5)


class K36_LogPattern(Shot):
    """Top = derivative of the bottom -> ln|bottom|. (2x+3)/(x^2+3x+1) -> ln|x^2+3x+1| + C."""
    def body(self):
        self.title("A Pattern Worth Knowing", "3:47:17.87")
        R = M(r"\int", r"\frac{f'(x)}{f(x)}", r"\,dx", "=", r"\ln|f(x)|", "+C", size=62).move_to([0, 1.35, 0])
        rn, rb, rd = frac_split(R[1])
        R[4].set_color(GRN); R[5].set_color(GRN)
        self.go("3:47:19.95", Write(R[:3]), run=0.9)
        self.go("3:47:21.53", rn.animate.set_color(PINK), Circumscribe(rn, color=PINK, buff=0.06), run=0.6)
        self.go("3:47:22.29", rd.animate.set_color(ORG), Circumscribe(rd, color=ORG, buff=0.06), run=0.6)
        self.go("3:47:23.21", Write(R[3]), TransformFromCopy(rd, R[4], path_arc=-0.7), Write(R[5]), run=1.1)
        self.play(Create(panel(R, YEL, buff=0.25, width=3)), run_time=0.4)
        E = M(r"\int", r"\frac{2x+3}{x^2+3x+1}", r"\,dx", size=62).move_to([-3.4, -0.7, 0])
        en, eb, ed = frac_split(E[1])
        self.go("3:47:26.43", Write(E), run=1.6)
        D = M(r"(x^2+3x+1)'", "=", "2x+3", size=54).move_to([3.4, -0.7, 0])
        D[0].set_color(ORG); D[2].set_color(PINK)
        self.go("3:47:32.17", ed.animate.set_color(ORG), Circumscribe(ed, color=ORG, buff=0.06), run=0.6)
        self.go("3:47:32.95", Write(D), run=1.1)
        tk = tick_mark(GRN, 0.45).next_to(D, RIGHT, buff=0.3)
        self.go("3:47:35.77", en.animate.set_color(PINK), Circumscribe(en, color=PINK, buff=0.06),
                Circumscribe(D[2], color=PINK, buff=0.06), run=0.8)
        self.play(Create(tk), run_time=0.3)
        Fin = M("=", r"\ln|x^2+3x+1|", "+C", size=62, color=GRN)
        Fin[0].set_color(CHALK)
        left_at(Fin, 0, E.get_left()[0] + 0.6, -2.6)
        self.go("3:47:37.47", Write(Fin), run=1.5)
        self.go("3:47:42.79", Create(answer_box(Fin[1:])), run=0.5)


class K36_LnOverX(Shot):
    """ln x / x: u = ln x, du = (1/x) dx; integral u du = u^2/2 -> (ln x)^2 / 2 + C."""
    def body(self):
        self.title("One With ln x", "3:47:44.35")
        I = M(r"\int", r"\frac{\ln x}{x}", r"\,dx", size=70).move_to([-3.4, 1.5, 0])
        n, b, d = frac_split(I[1])
        self.go("3:47:44.85", Write(I), run=1.0)
        P1 = prow(("u", "=", r"\ln x"), 1.5, ORG)
        P2 = prow(("du", "=", r"\frac{1}{x}\,dx"), 0.2, PINK)
        self.go("3:47:48.19", n.animate.set_color(ORG), Write(P1[:2]), TransformFromCopy(n, P1[2]), run=0.9)
        self.go("3:47:50.81", Write(P2), run=1.1)
        self.go("3:47:52.21", VGroup(b, d, I[2]).animate.set_color(PINK), run=0.4)
        self.play(Circumscribe(VGroup(b, d, I[2]), color=PINK, buff=0.08), run_time=0.7)
        J = M("=", r"\int", "u", r"\,du", size=70)
        left_at(J, 1, I[0].get_left()[0], -0.3)
        J[2].set_color(ORG); J[3].set_color(PINK)
        Ic = I.copy()
        cn, cb, cd = frac_split(Ic[1])
        self.at("3:47:54.35")
        swap(self, pairs=[(Ic[0], J[1]), (cn, J[2])], fold=[cb, cd, Ic[2]], into=J[3],
             flies=[(P2[0], J[3])], writes=[J[0]], run=1.1)
        settle(self, J)
        K = at_eq(M("=", r"\frac{u^2}{2}", "+C", size=70), 0, J[0].get_x(), -2.45)
        self.go("3:47:57.33", Write(K), run=0.9)
        Fin = at_eq(M("=", r"\frac{(\ln x)^2}{2}", "+C", size=70, color=GRN), 0, J[0].get_x(), -2.45)
        Fin[0].set_color(CHALK)
        self.go("3:47:59.25", *[ReplacementTransform(K[i], Fin[i]) for i in range(3)], run=1.1)
        self.go("3:48:00.85", Create(answer_box(Fin[1:])), run=0.5)


# ---------------------------------------------------------------- definite integrals: change the limits

class K36_DefIntro(Shot):
    """The limits a, b are x-values. Two options: change the limits to u-values, or put x back and use a, b."""
    def body(self):
        self.title("Substitution With Limits", "3:48:02.63")
        G = M(r"\int_a^b", r"f(g(x))\,g'(x)", r"\,dx", size=64).move_to([0.9, 1.3, 0])
        sg, lo, hi = lims(G[0])
        self.go("3:48:03.91", Write(G), run=1.2)
        self.go("3:48:07.97", lo.animate.set_color(YEL), hi.animate.set_color(YEL), run=0.3)
        self.play(Circumscribe(lo, color=YEL, buff=0.07), Circumscribe(hi, color=YEL, buff=0.07), run_time=0.7)
        # the limits are x-values: write "x =" into them
        G2 = M(r"\int_{x=a}^{x=b}", r"f(g(x))\,g'(x)", r"\,dx", size=64).move_to(G)
        sg2, lo2, hi2 = lims(G2[0])
        lo2.set_color(YEL); hi2.set_color(YEL)
        self.go("3:48:10.37", ReplacementTransform(sg, sg2), ReplacementTransform(lo, lo2), ReplacementTransform(hi, hi2),
                ReplacementTransform(G[1], G2[1]), ReplacementTransform(G[2], G2[2]), run=0.9)
        settle(self, G2)
        self.play(Circumscribe(VGroup(lo2, hi2), color=YEL, buff=0.08), run_time=0.7)
        top = G2.get_bottom() + DOWN * 0.15
        A1 = Arrow(top + LEFT * 0.4, [-3.4, -0.3, 0], buff=0, color=DIM, stroke_width=4, tip_length=0.2)
        A2 = Arrow(top + RIGHT * 0.4, [3.4, -0.3, 0], buff=0, color=DIM, stroke_width=4, tip_length=0.2)
        self.go("3:48:13.79", GrowArrow(A1), GrowArrow(A2), run=0.6)
        O1l = H("change the limits", 38, ORG).move_to([-3.4, -0.95, 0])
        O1f = M(r"\int_{g(a)}^{g(b)}", r"f(u)\,du", size=54).move_to([-3.4, -2.3, 0])
        O2l = H("put x back, old limits", 38, BLUE).move_to([3.4, -0.95, 0])
        O2f = M(r"\Big[F(g(x))", r"\Big]_a^b", size=54).move_to([3.4, -2.3, 0])
        for part in (O1f[0], O2f[1]):
            _, l, h = lims(part)
            l.set_color(YEL); h.set_color(YEL)
        self.go("3:48:15.31", FadeIn(O1l, shift=DOWN * 0.1), run=0.5)
        self.go("3:48:15.87", Write(O1f), run=1.0)
        self.go("3:48:17.67", FadeIn(O2l, shift=DOWN * 0.1), run=0.5)
        self.go("3:48:18.19", Write(O2f), run=1.0)
        t1 = tick_mark(GRN, 0.4).next_to(O1l, RIGHT, buff=0.25)
        t2 = tick_mark(GRN, 0.4).next_to(O2l, RIGHT, buff=0.25)
        self.go("3:48:20.91", Create(t1), Create(t2), run=0.5)
        pick = SurroundingRectangle(VGroup(O1l, O1f, t1), color=YEL, buff=0.2, stroke_width=4, corner_radius=0.15)
        self.go("3:48:22.71", Create(pick), run=0.6)
        self.go("3:48:24.11", VGroup(O2l, O2f, t2, A2).animate.set_opacity(0.35), run=0.6)


def def1_board():
    """The 0..2 example's board in its final state (shared by K36_Def1a and K36_Def1b)."""
    I = M(r"\int_0^2", "x", "(", "x^2+1", ")^3", r"\,dx", size=66).move_to([-3.4, 1.5, 0])
    sg, lo, hi = lims(I[0])
    P1 = prow(("u", "=", "x^2+1"), 1.5, ORG, size=56)
    P2 = prow(("du", "=", r"2x\,dx"), 0.45, PINK, size=56)
    P3 = prow((r"x\,dx", "=", r"\frac{1}{2}", r"\,du"), -0.65, PINK, size=56)
    P3[2].set_color(ORG)
    L1 = limit_row("0", "0^2+1", "1", -0.75)
    L2 = limit_row("2", "2^2+1", "5", -1.85)
    J = M("=", r"\frac{1}{2}", r"\int_1^5", "u^3", r"\,du", size=66)
    left_at(J, 2, I[0].get_left()[0] + 0.9, -0.45)
    J[1].set_color(ORG); J[3][0].set_color(ORG); J[4].set_color(PINK)
    jsg, jlo, jhi = lims(J[2])
    jlo.set_color(YEL); jhi.set_color(YEL)
    return dict(I=I, sg=sg, lo=lo, hi=hi, P1=P1, P2=P2, P3=P3, L1=L1, L2=L2, J=J, jsg=jsg, jlo=jlo, jhi=jhi)


class K36_Def1a(Shot):
    """0..2 of x(x^2+1)^3: u = x^2+1, x dx = du/2; x = 0 -> u = 1, x = 2 -> u = 5; the u-values fly onto the integral."""
    def body(self):
        self.title("Changing the Limits", "3:48:27.21")
        b = def1_board()
        I, sg, lo, hi, P1, P2, P3, L1, L2, J = (b[k] for k in ("I", "sg", "lo", "hi", "P1", "P2", "P3", "L1", "L2", "J"))
        self.go("3:48:27.75", Write(I), run=1.5)
        self.go("3:48:33.47", I[3].animate.set_color(ORG), Write(P1[:2]), TransformFromCopy(I[3], P1[2]), run=0.9)
        self.go("3:48:36.25", Write(P2), run=1.0)
        self.go("3:48:39.15", I[1].animate.set_color(PINK), I[5].animate.set_color(PINK), Write(P3), run=1.0)
        self.go("3:48:42.30", FadeOut(P2), P3.animate.shift(UP * 1.1), lo.animate.set_color(YEL), hi.animate.set_color(YEL), run=0.6)
        self.play(Circumscribe(lo, color=YEL, buff=0.07), Circumscribe(hi, color=YEL, buff=0.07), run_time=0.8)
        self.go("3:48:44.31", Write(L1[:2]), TransformFromCopy(lo, L1[2], path_arc=-0.5), run=0.7)
        self.go("3:48:45.15", Write(L1[3:8]), run=1.0)
        self.go("3:48:47.00", Write(L1[8]), run=0.4)
        self.go("3:48:48.39", Write(L2[:2]), TransformFromCopy(hi, L2[2], path_arc=-0.5), run=0.7)
        self.go("3:48:49.17", Write(L2[3:8]), run=1.0)
        self.go("3:48:50.90", Write(L2[8]), run=0.4)
        self.go("3:48:52.79", Write(J[0]), TransformFromCopy(P3[2], J[1], path_arc=0.5), TransformFromCopy(sg, b["jsg"]), run=0.9)
        self.go("3:48:55.51", TransformFromCopy(L1[8], b["jlo"], path_arc=0.6), TransformFromCopy(L2[8], b["jhi"], path_arc=0.6), run=0.9)
        self.go("3:48:56.69", Write(J[3]), TransformFromCopy(P3[3], J[4]), run=0.8)
        settle(self, J)


class K36_Def1b(Shot):
    """1/2 integral 1..5 u^3 du = 1/2 [u^4/4] = 1/2 (5^4/4 - 1^4/4) = 1/2 . 624/4 = 624/8 = 78."""
    def body(self):
        self.title("Changing the Limits", animate=False)
        b = def1_board()
        b["P3"].shift(UP * 1.1)
        for k in ("lo", "hi"):
            b[k].set_color(YEL)
        b["I"][3].set_color(ORG); b["I"][1].set_color(PINK); b["I"][5].set_color(PINK)
        J = b["J"]
        self.add(b["I"], b["P1"], b["P3"], b["L1"], b["L2"], J)
        self.go("3:48:58.91", FadeOut(VGroup(b["I"], b["P1"], b["P3"], b["L1"], b["L2"], J[0])),
                J[1:].animate.shift(UP * 1.95), run=0.6)
        EX = J[1].get_left()[0] - 0.45
        K = at_eq(M("=", r"\frac{1}{2}", r"\Big[\frac{u^4}{4}", r"\Big]_1^5", size=62), 0, J.get_right()[0] + 0.55, J[1].get_y())
        K[1].set_color(ORG)
        _, klo, khi = lims(K[3])
        klo.set_color(YEL); khi.set_color(YEL)
        self.go("3:48:59.55", Write(K), run=1.2)
        R3 = at_eq(M("=", r"\frac{1}{2}", r"\Big(", r"\frac{5^4}{4}", "-", r"\frac{1^4}{4}", r"\Big)", size=62), 0, EX, -0.5)
        R3[1].set_color(ORG)
        self.go("3:49:02.31", Write(R3[:4]), run=1.0)
        self.go("3:49:05.19", Write(R3[4:]), run=1.0)
        sc = M("5^4", "=", "625", size=54, color=ORG).move_to([3.9, -0.5, 0])
        self.go("3:49:07.67", Write(sc), run=0.8)
        R4 = at_eq(M("=", r"\frac{1}{2}\cdot\frac{624}{4}", "=", r"\frac{624}{8}", "=", "78", size=62), 0, EX, -2.45)
        R4[5].set_color(GRN)
        self.go("3:49:10.89", Write(R4[:2]), run=1.0)
        self.go("3:49:14.89", Write(R4[2:4]), run=0.8)
        self.go("3:49:17.47", Write(R4[4:]), run=0.4)
        self.play(Create(answer_box(R4[5])), run_time=0.4)


class K36_Mistake(Shot):
    """Old x-limits with the u-antiderivative give 2 (wrong); the u-limits 1 and 5 give 78."""
    def body(self):
        self.title("The Mistake to Avoid", "3:49:18.81")
        W = M(r"\frac{1}{2}", r"\Big[\frac{u^4}{4}", r"\Big]_0^2", "=", "2", size=64).move_to([-1.0, 1.05, 0])
        wsg, wlo, whi = lims(W[2])
        wlo.set_color(RED); whi.set_color(RED); W[4].set_color(RED)
        self.go("3:49:20.21", Write(W[:3]), run=1.0)
        lbl = note("old x-limits", wlo, DR, RED, 36, dist=0.55, angle=0.5)
        self.go("3:49:22.23", Circumscribe(wlo, color=RED, buff=0.07), Circumscribe(whi, color=RED, buff=0.07), FadeIn(lbl), run=0.7)
        self.go("3:49:25.59", Circumscribe(W[1], color=RED, buff=0.08), run=0.6)
        self.go("3:49:27.03", Write(W[3:]), run=0.6)
        cx = cross_mark(RED, 0.25).next_to(W, RIGHT, buff=0.45)
        self.go("3:49:27.93", Create(cx), run=0.4)
        C = M(r"\frac{1}{2}", r"\Big[\frac{u^4}{4}", r"\Big]_1^5", "=", "78", size=64).move_to([-1.0, -1.75, 0])
        csg, clo, chi = lims(C[2])
        clo.set_color(YEL); chi.set_color(YEL); C[4].set_color(GRN)
        self.go("3:49:29.45", FadeOut(lbl), TransformFromCopy(W[0], C[0]), TransformFromCopy(W[1], C[1]),
                TransformFromCopy(wsg, csg), TransformFromCopy(wlo, clo), TransformFromCopy(whi, chi), run=1.0)
        self.go("3:49:30.73", Write(C[3:]), run=0.5)
        tk = tick_mark(GRN, 0.5).next_to(C, RIGHT, buff=0.45)
        self.play(Create(tk), run_time=0.4)


class K36_Def2(Shot):
    """0..pi/2 of sin^2 x cos x: u = sin x; x = 0 -> u = 0, x = pi/2 -> u = 1; integral 0..1 u^2 du = 1/3."""
    def body(self):
        self.title("One More", "3:49:32.57")
        I = M(r"\int_0^{\pi/2}", r"\sin^2 x", r"\cos x", r"\,dx", size=64).move_to([-3.4, 1.5, 0])
        sg, lo, hi = lims(I[0])
        self.go("3:49:34.01", Write(I), run=1.5)
        P1 = prow(("u", "=", r"\sin x"), 1.5, ORG, size=56)
        P2 = prow(("du", "=", r"\cos x\,dx"), 0.45, PINK, size=56)
        self.go("3:49:39.85", I[1].animate.set_color(ORG), Write(P1[:2]), TransformFromCopy(I[1], P1[2]), run=0.9)
        self.go("3:49:41.21", Write(P2), run=1.0)
        self.go("3:49:42.35", I[2].animate.set_color(PINK), I[3].animate.set_color(PINK),
                Circumscribe(VGroup(I[2], I[3]), color=PINK, buff=0.08), run=0.8)
        self.go("3:49:43.51", lo.animate.set_color(YEL), hi.animate.set_color(YEL), run=0.3)
        self.play(Circumscribe(lo, color=YEL, buff=0.07), Circumscribe(hi, color=YEL, buff=0.07), run_time=0.6)
        L1 = limit_row("0", r"\sin 0", "0", -0.6)
        L2 = limit_row(r"\frac{\pi}{2}", r"\sin\frac{\pi}{2}", "1", -1.6)
        self.go("3:49:46.57", Write(L1[:2]), TransformFromCopy(lo, L1[2], path_arc=-0.5), run=0.6)
        self.go("3:49:48.01", Write(L1[3:8]), run=0.9)
        self.go("3:49:49.05", Write(L1[8]), run=0.4)
        self.go("3:49:50.55", Write(L2[:2]), TransformFromCopy(hi, L2[2], path_arc=-0.5), run=0.6)
        self.go("3:49:52.47", Write(L2[3:8]), run=1.0)
        self.go("3:49:53.79", Write(L2[8]), run=0.4)
        J = M("=", r"\int_0^1", "u^2", r"\,du", size=64)
        left_at(J, 0, I.get_left()[0], -0.6)
        J[2][0].set_color(ORG); J[3].set_color(PINK)
        jsg, jlo, jhi = lims(J[1])
        jlo.set_color(YEL); jhi.set_color(YEL)
        self.go("3:49:55.33", Write(J[0]), TransformFromCopy(sg, jsg), run=0.6)
        self.go("3:49:57.21", TransformFromCopy(L1[8], jlo, path_arc=0.6), TransformFromCopy(L2[8], jhi, path_arc=0.6), run=0.8)
        self.go("3:49:58.13", Write(J[2]), TransformFromCopy(P2[0], J[3]), run=0.8)
        settle(self, J)
        K = M("=", r"\Big[\frac{u^3}{3}", r"\Big]_0^1", "=", r"\frac{1}{3}", "-", "0", "=", r"\frac{1}{3}", size=62)
        left_at(K, 0, J[0].get_left()[0], -2.9)
        _, klo, khi = lims(K[2])
        klo.set_color(YEL); khi.set_color(YEL); K[8].set_color(GRN)
        self.go("3:50:00.23", Write(K[:3]), run=1.0)
        self.go("3:50:02.59", Write(K[3:7]), run=0.9)
        self.go("3:50:04.71", Write(K[7:]), run=0.35)
        self.play(Create(answer_box(K[8])), run_time=0.3)


# ---------------------------------------------------------------- practice

class K36_Try(Shot):
    """The two practice problems."""
    def body(self):
        self.title("Try These Two", "3:50:07.00")
        n1 = M("1.", size=56, color=ORG).move_to([-3.6, 0.9, 0])
        p1 = M(r"\int", "x^2", "(x^3+1)^4", r"\,dx", size=66).next_to(n1, RIGHT, buff=0.5)
        n2 = M("2.", size=56, color=ORG).move_to([-3.6, -1.3, 0])
        p2 = M(r"\int_0^1", "2x", "e^{x^2}", r"\,dx", size=66).next_to(n2, RIGHT, buff=0.5)
        self.go("3:50:07.50", FadeIn(n1), Write(p1), run=1.3)
        self.go("3:50:11.49", FadeIn(n2), Write(p2), run=1.4)


class K36_Try1(Shot):
    """x^2 (x^3+1)^4: u = x^3+1, x^2 dx = du/3; 1/3 . u^5/5 -> (x^3+1)^5 / 15 + C."""
    def body(self):
        self.title("Problem 1", "3:50:15.93")
        I = M(r"\int", "x^2", "(", "x^3+1", ")^4", r"\,dx", size=68).move_to([-3.4, 1.5, 0])
        self.play(FadeIn(I, shift=DOWN * 0.1), run_time=0.5)
        P1 = prow(("u", "=", "x^3+1"), 1.5, ORG)
        P2 = prow(("du", "=", r"3x^2\,dx"), 0.35, PINK)
        P3 = prow((r"x^2\,dx", "=", r"\frac{1}{3}", r"\,du"), -0.95, PINK)
        P3[2].set_color(ORG)
        self.go("3:50:17.23", I[3].animate.set_color(ORG), Write(P1[:2]), TransformFromCopy(I[3], P1[2]), run=0.9)
        self.go("3:50:20.13", Write(P2), run=1.1)
        self.go("3:50:23.29", I[1].animate.set_color(PINK), I[5].animate.set_color(PINK), Write(P3), run=1.1)
        J = M("=", r"\frac{1}{3}", r"\int", "u^4", r"\,du", size=68)
        left_at(J, 2, I[0].get_left()[0] + 0.9, -0.2)
        J[1].set_color(ORG); J[3][0].set_color(ORG); J[4].set_color(PINK)
        Ic = I.copy()
        self.at("3:50:26.47")
        swap(self, pairs=[(Ic[0], J[2]), (VGroup(Ic[2], Ic[3], Ic[4]), J[3])], fold=[Ic[1], Ic[5]], into=J[4],
             flies=[(P3[2], J[1]), (P3[3], J[4])], writes=[J[0]], run=1.1)
        settle(self, J)
        K = at_eq(M("=", r"\frac{1}{3}", r"\cdot", r"\frac{u^5}{5}", size=68), 0, J[0].get_x(), -2.45)
        K[1].set_color(ORG)
        self.go("3:50:29.25", Write(K), run=1.1)
        Fin = at_eq(M("=", r"\frac{(x^3+1)^5}{15}", "+C", size=68, color=GRN), 0, J[0].get_x(), -2.45)
        Fin[0].set_color(CHALK)
        self.go("3:50:32.39", ReplacementTransform(K[0], Fin[0]), FadeTransform(K[1:], Fin[1]), Write(Fin[2]), run=1.3)
        self.go("3:50:35.27", Create(answer_box(Fin[1:])), run=0.5)


class K36_Try2(Shot):
    """0..1 of 2x e^(x^2): u = x^2, du = 2x dx exactly; limits stay 0 and 1; integral 0..1 e^u du = e - 1."""
    def body(self):
        self.title("Problem 2", animate=False)
        I = M(r"\int_0^1", "2x", "e^{x^2}", r"\,dx", size=68).move_to([-3.4, 1.5, 0])
        sg, lo, hi = lims(I[0])
        self.play(FadeIn(I, shift=DOWN * 0.1), run_time=0.5)
        P1 = prow(("u", "=", "x^2"), 1.5, ORG)
        P2 = prow(("du", "=", r"2x\,dx"), 0.35, PINK)
        self.go("3:50:38.35", I[2][1:].animate.set_color(ORG), Write(P1[:2]), TransformFromCopy(I[2][1:], P1[2]), run=0.8)
        self.go("3:50:40.03", Write(P2), run=1.0)
        self.go("3:50:42.51", I[1].animate.set_color(PINK), I[3].animate.set_color(PINK),
                Circumscribe(I[1], color=PINK, buff=0.07), Circumscribe(I[3], color=PINK, buff=0.07), run=0.8)
        self.go("3:50:44.03", lo.animate.set_color(YEL), hi.animate.set_color(YEL),
                Circumscribe(lo, color=YEL, buff=0.07), Circumscribe(hi, color=YEL, buff=0.07), run=0.7)
        L1 = limit_row("0", "0^2", "0", -0.85)
        L2 = limit_row("1", "1^2", "1", -1.95)
        self.go("3:50:47.25", Write(L1[:2]), TransformFromCopy(lo, L1[2], path_arc=-0.5), Write(L1[3:]), run=1.0)
        self.go("3:50:48.71", Write(L2[:2]), TransformFromCopy(hi, L2[2], path_arc=-0.5), Write(L2[3:]), run=1.0)
        J = M("=", r"\int_0^1", "e^u", r"\,du", size=68)
        left_at(J, 0, I.get_left()[0], -0.6)
        J[2][1].set_color(ORG); J[3].set_color(PINK)
        jsg, jlo, jhi = lims(J[1])
        jlo.set_color(YEL); jhi.set_color(YEL)
        self.go("3:50:50.69", Write(J[0]), TransformFromCopy(sg, jsg), TransformFromCopy(L1[8], jlo, path_arc=0.6),
                TransformFromCopy(L2[8], jhi, path_arc=0.6), TransformFromCopy(I[2], J[2]), TransformFromCopy(P2[0], J[3]), run=1.1)
        settle(self, J)
        K = left_at(M("=", "e^1-e^0", "=", "e-1", size=68), 0, J[0].get_left()[0], -2.9)
        K[3].set_color(GRN)
        self.go("3:50:53.29", Write(K[:2]), run=0.6)
        self.go("3:50:54.03", Write(K[2:]), run=0.5)
        self.play(Create(answer_box(K[3])), run_time=0.35)


# ---------------------------------------------------------------- summary and next

class K36_Summary(Shot):
    """FTC part 1 and part 2 (derivatives <-> areas); u-sub = chain rule backwards, the recipe in motion; change the limits."""
    def body(self):
        self.title("Chapter Summary", "3:50:55.43")
        sub = H("The Fundamental Theorem", 46, YEL).move_to([0, 1.75, 0])
        self.go("3:50:59.19", FadeIn(sub, shift=DOWN * 0.1), run=0.6)
        l1 = H("Part 1", 40, ORG).move_to([-5.3, 0.45, 0])
        F1 = M(r"\frac{d}{dx}\int_a^x f(t)\,dt", "=", "f(x)", size=60).next_to(l1, RIGHT, buff=0.6)
        F1[0][:5].set_color(PINK); F1[2].set_color(BLUE)
        l2 = H("Part 2", 40, ORG).move_to([-5.3, -1.1, 0])
        F2 = M(r"\int_a^b f(x)\,dx", "=", "F(b)-F(a)", size=60).next_to(l2, RIGHT, buff=0.6)
        F2[0].set_color(GRN)
        F1.align_to(F2, LEFT)
        self.go("3:51:01.35", FadeIn(l1), run=0.4)
        self.go("3:51:02.23", Write(F1[0]), run=1.0)
        self.go("3:51:03.77", Write(F1[1:]), run=0.6)
        self.go("3:51:05.51", FadeIn(l2), run=0.4)
        self.go("3:51:06.47", Write(F2[0]), run=0.9)
        self.go("3:51:08.31", Write(F2[1:]), run=1.0)
        link = VGroup(H("derivatives", 40, PINK), M(r"\longleftrightarrow", size=56, color=YEL), H("areas", 40, GRN))
        link.arrange(RIGHT, buff=0.4).move_to([0, -2.55, 0])
        self.go("3:51:10.99", FadeIn(link[0]), GrowFromCenter(link[1]), FadeIn(link[2]), run=0.8)
        # u-substitution
        self.wipe("3:51:12.95", run=0.4)
        U0 = VGroup(H("u-substitution", 44, ORG), M("=", size=56), H("the chain rule, backwards", 44, PINK))
        U0.arrange(RIGHT, buff=0.35).move_to([0, 1.7, 0])
        self.go("3:51:13.40", FadeIn(U0[0]), run=0.4)
        self.go("3:51:14.63", Write(U0[1]), FadeIn(U0[2]), run=0.6)
        X0 = [0, 0.05, 0]
        F0 = M(r"\int", "f(", "g(x)", ")", r"g'(x)\,dx", size=66).move_to(X0)
        F0[1].set_color(BLUE); F0[3].set_color(BLUE); F0[2].set_color(ORG); F0[4].set_color(PINK)
        self.go("3:51:16.41", Write(F0), run=0.9)
        self.play(Circumscribe(F0[2], color=ORG, buff=0.08), run_time=0.6)
        G1 = M(r"\int", "f(", "u", ")", r"\,du", size=66).move_to(X0)
        G1[1].set_color(BLUE); G1[3].set_color(BLUE); G1[2].set_color(ORG); G1[4].set_color(PINK)
        self.go("3:51:18.47", *[ReplacementTransform(F0[i], G1[i]) for i in range(5)], run=1.0)
        G2 = M("F(", "u", ")", "+C", size=66, color=GRN).move_to(X0)
        G2[1].set_color(ORG)
        self.go("3:51:19.77", ReplacementTransform(G1[:2], G2[0]), ReplacementTransform(G1[2], G2[1]),
                ReplacementTransform(G1[3], G2[2]), ReplacementTransform(G1[4], G2[3]), run=0.8)
        G3 = M("F(", "g(x)", ")", "+C", size=66, color=GRN).move_to(X0)
        G3[1].set_color(ORG)
        self.go("3:51:21.21", *[ReplacementTransform(G2[i], G3[i]) for i in range(4)], run=0.8)
        LL = M(r"\int_a^b", r"\quad\longrightarrow\quad", r"\int_{g(a)}^{g(b)}", size=60).move_to([0, -2.2, 0])
        LL[1].set_color(DIM)
        s0, a0, b0 = lims(LL[0])
        s2, a2, b2 = lims(LL[2])
        for m in (a0, b0, a2, b2):
            m.set_color(YEL)
        self.go("3:51:22.45", Write(LL[0]), run=0.6)
        self.go("3:51:23.47", Write(LL[1]), run=0.5)
        self.go("3:51:24.17", TransformFromCopy(s0, s2), TransformFromCopy(a0, a2), TransformFromCopy(b0, b2), run=0.8)


class K36_Next(Shot):
    """Next chapter: areas between curves, averages, total change (three small sketches)."""
    def body(self):
        self.title("Next: Using Integrals", "3:51:25.83")
        xs = (-4.45, 0, 4.45)
        axs = [axes((0, 4, 1), (0, 3, 1), x_length=3.4, y_length=2.5, center=(x, -0.1, 0), nums=False, x_label=None, y_label=None)
               for x in xs]
        self.go("3:51:27.19", *[Create(a) for a in axs], run=0.8)
        # areas between curves
        a = axs[0]
        top = curve(a, lambda x: 2.4 - 0.4 * (x - 2) ** 2, [0.3, 3.7])
        bot = curve(a, lambda x: 0.45 + 0.15 * x, [0.3, 3.7], color=ORG)
        reg = a.get_area(top, x_range=[0.75, 3.25], bounded_graph=bot, color=GRN, opacity=0.4)
        lab = [H(s, 36, CHALK).move_to([x, -2.0, 0]) for s, x in zip(("between curves", "averages", "total change"), xs)]
        self.go("3:51:29.65", draw(top, run=0.6), draw(bot, run=0.6))
        self.play(FadeIn(reg), FadeIn(lab[0]), run_time=0.5)
        # averages
        b = axs[1]
        f = lambda x: 1.4 + 0.7 * np.sin(1.7 * x)
        cv = curve(b, f, [0, 3.7])
        avg = np.mean([f(x) for x in np.linspace(0, 3.7, 400)])
        dl = DashedLine(b.c2p(0, avg), b.c2p(3.7, avg), color=YEL, stroke_width=4, dash_length=0.1)
        self.go("3:51:31.31", draw(cv, run=0.5))
        self.play(Create(dl), FadeIn(lab[1]), run_time=0.4)
        # total change
        c = axs[2]
        g = lambda x: 0.5 + 0.45 * x
        cv2 = curve(c, g, [0, 3.7], color=PINK)
        sh = area(c, g, 0, 3.2)
        self.go("3:51:32.25", draw(cv2, run=0.5), FadeIn(sh), FadeIn(lab[2]), run=0.7)
