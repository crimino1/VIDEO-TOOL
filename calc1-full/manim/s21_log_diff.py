"""Builder 21: end of Chapter 7. The x^3 + x inverse example finished ((f^-1)'(2) = 1/4 without ever solving for
the inverse); the circle's second derivative implicitly (quotient rule, substitute y' = -x/y, then x^2 + y^2 = 25:
y'' = -25/y^3); logarithmic differentiation: why x^x breaks both rules, ln of both sides with the exponent sliding
down in front, x^x, x^(sin x), a messy product/quotient, try x^(2x); the Chapter 7 recap and the derivative toolkit.
Colours: y' / y'' / derivatives PINK, slid-down exponents YEL, example numbers ORG, answers boxed GRN, cancels RED."""
from common import *

D = r"\frac{d}{dx}"


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def pk(m, *idx, color=PINK):
    for i in idx:
        m[i].set_color(color)
    return m


def chk(*ms):
    """Print a '!!' line (caught by render_manim) if a board row leaves the safe area."""
    for m in ms:
        if m.get_left()[0] < -6.8 or m.get_right()[0] > 6.8 or m.get_bottom()[1] < -3.8 or m.get_top()[1] > 2.45:
            print(f"!! fit: row out of bounds {m.get_left()[0]:.2f}..{m.get_right()[0]:.2f}, {m.get_bottom()[1]:.2f}..{m.get_top()[1]:.2f}")


def morph(A, B, pairs, arc=(), arcv=0.55 * PI, new=True, fade=True):
    """Stage A -> stage B: (i, j) moves A[i] onto B[j] (on an arc for i in arc); the rest of A fades, the rest of B writes."""
    an = [ReplacementTransform(A[i], B[j], path_arc=arcv if i in arc else 0) for i, j in pairs]
    ui, uj = {i for i, _ in pairs}, {j for _, j in pairs}
    if fade:
        an += [FadeOut(A[i]) for i in range(len(A)) if i not in ui]
    if new:
        an += [Write(B[j]) for j in range(len(B)) if j not in uj]
    return an


def times_y(target, side=RIGHT):
    return M(r"\times y", size=44, color=YEL).next_to(target, side, buff=0.35)


def ln_slide(base, exp, y, size=76, coef=None):
    """The log-of-a-power move for y = base^exp:  ln y = ln(base^exp)  ->  ln y = exp * ln base.
    Returns (L1, L2, arc pairs): L1[6] (the exponent) slides down in front to L2[3]."""
    L1 = M(r"\ln", "y", "=", r"\ln", "(", base, "^{" + exp + "}", ")", size=size)
    L2 = M(r"\ln", "y", "=", coef or exp, r"\ln", base, size=size)
    pk(L1, 0, 3, color=YEL)
    L1[6].set_color(YEL)
    L2[3].set_color(YEL)
    pk(L2, 0, 4, color=CHALK)
    at_eq(L1, 2, 0, y)
    at_eq(L2, 2, 0, y)
    return L1, L2, [(0, 0), (1, 1), (2, 2), (6, 3), (3, 4), (5, 5)]


def power_row(base, exp, y, size=76):
    """y = base^exp with the exponent in YEL."""
    r = M("y", "=", base, "^{" + exp + "}", size=size)
    r[3].set_color(YEL)
    return at_eq(r, 1, 0, y)


# ================================================================ the x^3 + x inverse, finished

def inv_seam():
    """K20_InvExample's last frame."""
    fx = M("f(x)", "=", "x^3+x", size=72).move_to([0, 1.2, 0])
    q = M(r"(f^{-1})'(2)", "=", "?", size=72).move_to([0, -0.3, 0])
    q[0][-2].set_color(ORG)
    q[2].set_color(YEL)
    F = M(r"(f^{-1})'(b)", "=", r"\frac{1}{f'(a)}", size=62).move_to([-3.4, -1.15, 0])
    Fb = answer_box(F)
    VGroup(F, Fb).move_to([0, -2.5, 0])
    return fx, q, F, Fb


def node(s, p):
    c = Circle(radius=0.36, color=CHALK, stroke_width=4).move_to(p)
    return VGroup(c, M(s, size=54, color=ORG).move_to(p))


class K21_InvSolve(Shot):
    def body(self):
        self.title("Using It", animate=False)
        fx, q, F, Fb = inv_seam()
        self.add(fx, q, F, Fb)

        # solving for x is hard: don't
        hard = M("x^3+x", "=", "y", r"\;\Rightarrow\;", "x", "=", "?", size=64).move_to([0, -0.3, 0])
        hard[6].set_color(YEL)
        self.go(7505.33, FadeOut(q, shift=DOWN * 0.2), fx.animate.move_to([0, 1.55, 0]), run=0.5)
        self.go(7505.9, Write(hard[0:3]), run=0.8)
        self.go(7507.6, Write(hard[3:]), run=0.5)
        x_ = cross_mark(s=0.42).move_to(hard[4:].get_center())
        self.go(7508.4, Create(x_), run=0.4)
        self.go(7509.6, FadeOut(hard), FadeOut(x_), run=0.5)

        # which input gives 2?  x = 1
        G = M("f(", "?", ")", "=", "2", size=68)
        at_eq(G, 3, -3.0, 0.25)
        G[1].set_color(YEL)
        G[4].set_color(ORG)
        self.go(7511.3, Write(G), run=0.7)
        one = M("1", size=68, color=ORG).move_to(G[1])
        self.go(7513.6, Transform(G[1], one), run=0.5)
        C = M("1^3+1", "=", "2", size=60)
        at_eq(C, 1, -3.0, -0.95)
        C[0][0].set_color(ORG)
        C[0][3].set_color(ORG)
        self.go(7515.13, Write(C), run=0.8)
        tk = tick_mark(s=0.45).next_to(C, RIGHT, buff=0.35)
        self.go(7516.1, Create(tk), run=0.4)
        self.go(7516.75, Circumscribe(G, color=YEL, buff=0.12), run=0.8)

        # the inverse takes 2 back to 1
        n1, n2 = node("1", [2.9, -0.35, 0]), node("2", [5.7, -0.35, 0])
        top = CurvedArrow(n1.get_top() + RIGHT * 0.1, n2.get_top() + LEFT * 0.1, angle=-PI / 2.6, color=BLUE,
                          stroke_width=4, tip_length=0.18)
        bot = CurvedArrow(n2.get_bottom() + LEFT * 0.1, n1.get_bottom() + RIGHT * 0.1, angle=-PI / 2.6, color=PURP,
                          stroke_width=4, tip_length=0.18)
        tl = M("f", size=52, color=BLUE).next_to(top, UP, buff=0.1)
        bl = M("f^{-1}", size=52, color=PURP).next_to(bot, DOWN, buff=0.1)
        self.go(7518.4, FadeIn(n1), FadeIn(n2), Create(top), FadeIn(tl), run=0.7)
        self.go(7519.67, Create(bot), FadeIn(bl), run=0.9)

        # f'(1) = 4  ->  1/4
        self.go(7521.6, FadeOut(G), FadeOut(C), FadeOut(tk), run=0.35)
        P1 = pk(M("f'(x)", "=", "3x^2+1", size=64), 0)
        at_eq(P1, 1, -3.4, 0.25)
        P2 = pk(M("f'(", "1", ")", "=", "4", size=64), 0, 2)
        P2[1].set_color(ORG)
        at_eq(P2, 3, -3.4, -0.95)
        chk(P1, P2)
        self.go(7522.2, Write(P1[0:2]), run=0.5)
        self.go(7523.55, Write(P1[2]), run=0.7)
        self.go(7525.6, Write(P2[0:4]), run=0.5)
        self.go(7526.7, Write(P2[4]), run=0.4)
        F2 = M(r"(f^{-1})'(2)", "=", r"\frac{1}{f'(1)}", "=", r"\frac{1}{4}", size=62).move_to([0, -2.5, 0])
        F2[0][-2].set_color(ORG)
        F2[2][5].set_color(ORG)
        chk(F2)
        self.go(7528.3, *morph(F, F2, [(0, 0), (1, 1), (2, 2)], new=False), FadeOut(Fb), run=0.8)
        self.go(7530.47, Write(F2[3]), Write(F2[4][0:2]), TransformFromCopy(P2[4], F2[4][2]), run=0.7)
        fb = answer_box(F2)
        self.go(7531.2, Create(fb), run=0.5)
        nf = H("no inverse\nformula needed", 34, YEL).move_to([5.25, -2.5, 0])
        chk(nf)
        self.go(7532.5, FadeIn(nf, shift=LEFT * 0.1), Circumscribe(fx, color=YEL, buff=0.12), run=0.8)
        self.wipe(7534.6, run=0.35)


# ================================================================ second derivative of the circle

BAR_L, BAR_Y = -0.15, -1.1


def qfrac(num, den):
    """num over den with the bar's left end pinned at BAR_L (so the 'y'' = -' in front never moves)."""
    w = max(num.width, den.width) + 0.3
    bar = Line([BAR_L, BAR_Y, 0], [BAR_L + w, BAR_Y, 0], color=CHALK, stroke_width=4)
    num.next_to(bar, UP, buff=0.14)
    den.next_to(bar, DOWN, buff=0.14)
    return VGroup(num, bar, den)


def circle_board():
    """x^2 + y^2 = 25 with its circle (left), y' = -x/y (top), 'y'' = -' in front of the pinned bar."""
    E = M("x^2", "+", "y^2", "=", "25", size=52, color=DIM).move_to([-4.6, 1.75, 0])
    circ = Circle(radius=0.85, color=BLUE, stroke_width=4).move_to([-4.6, 0.1, 0])
    cd = Dot(circ.get_center(), radius=0.04, color=DIM)
    R1 = pk(M("y'", "=", r"-\frac{x}{y}", size=64), 0)
    at_eq(R1, 1, -0.2, 1.5)
    L = pk(M("y''", "=", "-", size=64), 0)
    L.shift(RIGHT * (BAR_L - 0.15 - L[2].get_right()[0]) + UP * (BAR_Y - L[2].get_y()))
    return E, VGroup(circ, cd), R1, L


def stage1():
    num = pk(M("y", "-", "x", "y'", size=60), 3)
    return qfrac(num, M("y^2", size=60))


class K21_Second(Shot):
    def body(self):
        self.title("Using It", animate=False)
        self.title("Second Derivative, Implicitly", 7537.8)
        E, circ, R1, L = circle_board()
        big = M("y''", size=96, color=PINK).move_to([0.6, BAR_Y, 0])
        self.go(7538.7, Write(big), run=0.6)
        self.go(7542.6, Write(E), draw(circ[0], 0.9), FadeIn(circ[1]), run=0.9)
        self.go(7544.0, Write(R1[0:2]), run=0.4)
        self.go(7545.25, Write(R1[2]), run=0.6)
        self.go(7547.3, ReplacementTransform(big, L[0]), Write(L[1]), run=0.7)
        qr = H("quotient rule", 36, YEL).next_to(R1, RIGHT, buff=0.6)
        self.go(7549.0, Circumscribe(R1[2][1:], color=YEL, buff=0.08), FadeIn(qr, shift=LEFT * 0.1), run=0.8)

        # low d-high minus high d-low, over low squared
        num = pk(M("y", r"\cdot", "1", "-", "x", r"\cdot", "y'", size=60), 6)
        Q0 = qfrac(num, M("y^2", size=60))
        bar, den = Q0[1], Q0[2]
        hi, lo = R1[2][1], R1[2][3]
        self.go(7550.6, TransformFromCopy(lo, num[0]), run=0.6)
        self.go(7551.9, Write(num[1:3]), run=0.5)
        self.go(7552.6, Write(num[3]), run=0.3)
        self.go(7553.85, TransformFromCopy(hi, num[4]), run=0.6)
        self.go(7555.0, Write(num[5:7]), run=0.5)
        self.go(7556.65, Create(bar), TransformFromCopy(lo, den), run=0.7)
        self.go(7558.7, TransformFromCopy(R1[2][0], L[2], path_arc=0.4 * PI), run=0.8)
        self.go(7559.7, Circumscribe(L[2], color=YEL, buff=0.1), run=0.7)

        # tidy: y*1 is just y
        Q1 = stage1()
        st = strike(num[1:3], width=5)
        self.go(7561.2, FadeOut(qr), Create(st), run=0.4)
        self.go(7562.45, ReplacementTransform(num[0], Q1[0][0]), ReplacementTransform(num[3], Q1[0][1]),
                ReplacementTransform(num[4], Q1[0][2]), ReplacementTransform(num[6], Q1[0][3]),
                FadeOut(num[1:3]), FadeOut(num[5]), FadeOut(st),
                ReplacementTransform(bar, Q1[1]), ReplacementTransform(den, Q1[2]), run=0.8)
        chk(R1, VGroup(L, Q1), E)
        self.go(7565.1, Circumscribe(VGroup(L, Q1), color=YEL, buff=0.15), run=0.9)


class K21_SecondSub(Shot):
    def body(self):
        self.title("Second Derivative, Implicitly", animate=False)
        E, circ, R1, L = circle_board()
        Q1 = stage1()
        self.add(E, circ, R1, L, Q1)

        # substitute y' = -x/y
        self.go(7567.3, Circumscribe(R1, color=PINK, buff=0.12), run=0.8)
        self.go(7568.4, Circumscribe(Q1[0][3], color=PINK, buff=0.08), run=0.6)
        n2 = M("y", "-", "x", r"\left(-\frac{x}{y}\right)", size=60)
        n2[3][1:5].set_color(PINK)
        Q2 = qfrac(n2, M("y^2", size=60))
        self.go(7572.6, *[ReplacementTransform(Q1[0][i], n2[i]) for i in range(3)], FadeOut(Q1[0][3]),
                TransformFromCopy(R1[2], n2[3][1:5], path_arc=0.4 * PI), FadeIn(n2[3][0]), FadeIn(n2[3][5]),
                ReplacementTransform(Q1[1], Q2[1]), ReplacementTransform(Q1[2], Q2[2]), run=1.0)
        n3 = M("y", "+", r"\frac{x^2}{y}", size=60)
        Q3 = qfrac(n3, M("y^2", size=60))
        self.go(7574.95, ReplacementTransform(n2[0], n3[0]), ReplacementTransform(n2[1], n3[1]),
                ReplacementTransform(VGroup(n2[2], n2[3]), n3[2]),
                ReplacementTransform(Q2[1], Q3[1]), ReplacementTransform(Q2[2], Q3[2]), run=0.9)

        # times y over y
        ty1, ty2 = times_y(n3), times_y(Q3[2])
        self.go(7578.0, FadeIn(ty1, shift=LEFT * 0.1), FadeIn(ty2, shift=LEFT * 0.1), run=0.5)
        n4 = M("y^2", "+", "x^2", size=60)
        Q4 = qfrac(n4, M("y^3", size=60))
        self.go(7581.1, *[ReplacementTransform(n3[i], n4[i]) for i in range(3)],
                ReplacementTransform(Q3[1], Q4[1]), ReplacementTransform(Q3[2], Q4[2]), FadeOut(ty1), FadeOut(ty2), run=0.9)

        # y^2 + x^2 is 25 from the original equation
        self.go(7586.3, Circumscribe(n4, color=YEL, buff=0.1), E.animate.set_color(YEL), run=0.8)
        n5 = M("25", size=60, color=ORG)
        Q5 = qfrac(n5, M("y^3", size=60))
        self.go(7588.2, FadeOut(n4), TransformFromCopy(E[4], n5, path_arc=-0.3 * PI),
                ReplacementTransform(Q4[1], Q5[1]), ReplacementTransform(Q4[2], Q5[2]), run=0.9)
        self.go(7590.2, E.animate.set_color(DIM), run=0.4)
        ans = VGroup(L, Q5)
        chk(ans)
        self.go(7594.85, Create(answer_box(ans)), run=0.5)
        tip = H("plug the original back in", 36, YEL).move_to([0.9, -3.0, 0])
        self.go(7596.4, FadeIn(tip, shift=UP * 0.1), run=0.5)
        self.go(7598.1, Circumscribe(E, color=YEL, buff=0.12), run=0.8)
        self.wipe(7601.0, run=0.35)


# ================================================================ logarithmic differentiation: why

class K21_LogWhy(Shot):
    def body(self):
        self.title("Second Derivative, Implicitly", animate=False)
        self.title("Logarithmic Differentiation", 7603.9)
        Q = M(D, "x", "^{x}", "=", "?", size=96).move_to([0, 0.55, 0])
        Q[4].set_color(YEL)
        self.go(7607.4, Write(Q[0:3]), run=0.8)
        self.go(7608.6, Write(Q[3:]), run=0.4)

        # not a power: the exponent moves
        pw = M("x^{n}", r"\to", "n\\,x^{n-1}", size=60).move_to([-3.9, -2.25, 0])
        pwl = H("power rule", 36, DIM).next_to(pw, UP, buff=0.3)
        ex = M("a^{x}", r"\to", r"a^{x}\ln a", size=60).move_to([3.9, -2.25, 0])
        exl = H("exponential rule", 36, DIM).next_to(ex, UP, buff=0.3)
        chk(pw, ex)
        self.go(7609.9, FadeIn(pwl), Write(pw), run=0.8)
        self.go(7611.5, Q[2].animate.set_color(YEL), run=0.4)
        n1 = note("not constant", Q[2], UR, dist=0.5, angle=0.6)
        chk(n1)
        self.go(7612.4, FadeIn(n1), run=0.5)
        x1 = cross_mark(s=0.35).move_to(pw)
        self.go(7614.3, Create(x1), run=0.4)

        # not an exponential: the base moves
        self.go(7616.0, FadeIn(exl), Write(ex), run=0.8)
        self.go(7618.6, Q[1].animate.set_color(YEL), run=0.4)
        n2 = note("not constant", Q[1], np.array([0.35, -1, 0]), dist=0.25, angle=0.5)
        chk(n2)
        self.go(7619.2, FadeIn(n2), run=0.5)
        x2 = cross_mark(s=0.35).move_to(ex)
        self.go(7621.5, Create(x2), run=0.4)
        self.go(7623.0, Circumscribe(Q[0:3], color=RED, buff=0.15), run=0.8)
        self.wipe(7624.2, run=0.4)


# ================================================================ x^x: ln of both sides, the exponent slides down

def xx_rows():
    R0 = power_row("x", "x", 1.5, size=80)
    L1, L2, pairs = ln_slide("x", "x", 0.0, size=80)
    return R0, L1, L2, pairs


class K21_LogXX(Shot):
    def body(self):
        self.title("Logarithmic Differentiation", animate=False)
        self.title("Take ln of Both Sides", 7625.9)
        R0, L1, L2, pairs = xx_rows()
        chk(R0, L1, L2)
        self.go(7629.2, Write(R0), run=0.8)
        # an ln in front of each side
        self.go(7631.8, TransformFromCopy(R0[0], L1[1]), TransformFromCopy(R0[1], L1[2]),
                TransformFromCopy(R0[2], L1[5]), TransformFromCopy(R0[3], L1[6]), FadeIn(L1[4]), FadeIn(L1[7]), run=0.7)
        self.go(7632.6, FadeIn(L1[0], shift=RIGHT * 0.15), FadeIn(L1[3], shift=RIGHT * 0.15), run=0.5)

        # the log power rule from chapter 1
        rule = M(r"\ln", "a", "^{n}", "=", "n", r"\ln a", size=60)
        rule[2].set_color(YEL)
        rule[4].set_color(YEL)
        rl = H("log power rule", 36, DIM)
        VGroup(rl, rule).arrange(RIGHT, buff=0.5).move_to([0, -2.35, 0])
        rp = panel(VGroup(rl, rule), color=PURP, buff=0.3)
        self.go(7637.5, FadeIn(rp), FadeIn(rl), Write(rule), run=0.8)
        self.go(7639.2, Circumscribe(rule[2], color=YEL, buff=0.06), run=0.6)

        # bring the exponent down in front
        self.go(7640.6, *morph(L1, L2, pairs, arc=(6,)), run=1.2)
        self.go(7642.8, Circumscribe(L2, color=YEL, buff=0.15), run=0.9)
        self.go(7646.9, FadeOut(VGroup(rp, rl, rule)), run=0.4)
        self.go(7647.8, Circumscribe(L2[3:], color=GRN, buff=0.1), run=0.8)
        self.go(7649.4, FadeOut(R0, shift=UP * 0.2), L2.animate.shift(UP * (1.65 - L2[2].get_y())), run=0.6)


# ---------------------------------------------------------------- differentiate ln y = x ln x

def xx_top():
    A = M(r"\ln", "y", "=", "x", r"\ln", "x", size=72)
    A[3].set_color(YEL)
    return at_eq(A, 2, 0, 1.65)


def xx_answer():
    Dd = M(D + r"\,x^{x}", "=", "x^{x}", r"(\ln x+1)", size=66)
    pk(Dd, 0)
    at_eq(Dd, 1, -0.6, -2.8)
    return Dd, answer_box(Dd)


class K21_LogXXDiff(Shot):
    def body(self):
        self.title("Take ln of Both Sides", animate=False)
        A = xx_top()
        self.add(A)
        self.title("Differentiate Implicitly", 7651.4)

        def arrow_under(m):
            a = Arrow(m.get_bottom() + DOWN * 0.08, m.get_bottom() + DOWN * 0.55, buff=0, color=DIM, stroke_width=3,
                      tip_length=0.14, max_tip_length_to_length_ratio=0.35)
            return VGroup(a, M(D, size=30, color=DIM).next_to(a, RIGHT, buff=0.08))
        al, ar = arrow_under(A[0:2]), arrow_under(A[3:])
        B = M(r"\frac{1}{y}", r"\cdot", "y'", "=", "1", r"\cdot", r"\ln x", "+", "x", r"\cdot", r"\frac{1}{x}", size=64)
        pk(B, 2)
        at_eq(B, 3, 0, 0.1)
        chk(B)
        self.go(7652.0, FadeIn(al, shift=DOWN * 0.1), run=0.4)
        self.go(7654.7, Write(B[0]), run=0.5)
        self.go(7656.2, Write(B[1:3]), run=0.5)
        self.go(7657.8, FadeOut(al), FadeIn(ar, shift=DOWN * 0.1), Write(B[3]), run=0.4)
        pr = H("product rule", 36, YEL).next_to(A, RIGHT, buff=0.6)
        self.go(7660.95, FadeIn(pr, shift=LEFT * 0.1), run=0.4)
        self.go(7662.05, FadeOut(ar), Write(B[4:7]), run=0.6)
        self.go(7664.3, Write(B[7:11]), run=0.7)

        # x * 1/x = 1
        sx = VGroup(strike(B[8], width=5), strike(B[10][2], width=5))
        self.go(7666.2, *[Create(s) for s in sx], FadeOut(pr), run=0.35)
        B2 = M(r"\frac{y'}{y}", "=", r"\ln x", "+", "1", size=64)
        B2[0][0:2].set_color(PINK)
        at_eq(B2, 1, 0, 0.1)
        self.go(7666.75, ReplacementTransform(B[6], B2[2]), ReplacementTransform(B[7], B2[3]),
                ReplacementTransform(VGroup(B[8:11], sx), B2[4]), FadeOut(B[4:6]), run=0.7)
        self.go(7668.6, ReplacementTransform(VGroup(B[0:3]), B2[0]), ReplacementTransform(B[3], B2[1]), run=0.7)

        # times y
        t1, t2 = times_y(B2[0], LEFT), times_y(B2[4])
        self.go(7673.1, FadeIn(t1, shift=RIGHT * 0.1), FadeIn(t2, shift=LEFT * 0.1), run=0.5)
        C = pk(M("y'", "=", "y", r"(\ln x+1)", size=64), 0)
        at_eq(C, 1, 0, -1.2)
        self.go(7674.65, Write(C[0:2]), FadeOut(t1), FadeOut(t2), run=0.5)
        self.go(7675.75, Write(C[2:]), run=0.7)
        self.go(7678.3, C[2].animate.set_color(ORG), run=0.4)
        yn = M("y=x^x", size=44, color=ORG).next_to(C, RIGHT, buff=0.6)
        self.go(7678.85, FadeIn(yn, shift=LEFT * 0.1), run=0.4)

        Dd, db = xx_answer()
        chk(Dd)
        self.go(7680.3, Write(Dd[0:2]), run=0.6)
        self.go(7682.35, TransformFromCopy(yn, Dd[2]), run=0.6)
        self.go(7683.5, TransformFromCopy(C[3], Dd[3]), run=0.5)
        self.go(7684.05, Create(db), run=0.4)
        self.wipe(7684.75, run=0.35, keep=(Dd, db))


# ================================================================ x^(sin x)

class K21_XSin(Shot):
    def body(self):
        self.title("Differentiate Implicitly", animate=False)
        Dd, db = xx_answer()
        self.add(Dd, db)
        self.title("Another One", 7685.55)
        self.play(FadeOut(Dd), FadeOut(db), run_time=0.4)

        R0 = power_row("x", r"\sin x", 1.75, size=76)
        L1, L2, pairs = ln_slide("x", r"\sin x", 0.55, size=72)
        L2 = M(r"\ln", "y", "=", r"\sin x", r"\cdot\ln", "x", size=72)
        L2[3].set_color(YEL)
        at_eq(L2, 2, 0, 0.55)
        self.go(7687.3, Write(R0), run=0.8)
        self.go(7688.9, TransformFromCopy(R0[0], L1[1]), TransformFromCopy(R0[1], L1[2]),
                TransformFromCopy(R0[2], L1[5]), TransformFromCopy(R0[3], L1[6]),
                FadeIn(L1[0]), FadeIn(L1[3]), FadeIn(L1[4]), FadeIn(L1[7]), run=0.7)
        self.go(7691.3, *morph(L1, L2, pairs, arc=(6,)), run=1.1)
        pr = H("product rule", 36, DIM).next_to(L2, RIGHT, buff=0.6)
        self.go(7694.5, FadeIn(pr, shift=LEFT * 0.1), run=0.4)

        R3 = M(r"\frac{y'}{y}", "=", r"\cos x\,\ln x", "+", r"\frac{\sin x}{x}", size=64)
        R3[0][0:2].set_color(PINK)
        at_eq(R3, 1, 0, -0.75)
        self.go(7695.85, Write(R3[0:2]), run=0.6)
        self.go(7697.9, Write(R3[2]), run=0.8)
        self.go(7699.9, Write(R3[3:]), run=0.7)
        t1, t2 = times_y(R3[0], LEFT), times_y(R3[4])
        self.go(7702.6, FadeOut(pr), FadeIn(t1, shift=RIGHT * 0.1), FadeIn(t2, shift=LEFT * 0.1), run=0.5)

        R4 = M("y'", "=", r"x^{\sin x}", r"\left(\cos x\,\ln x+\frac{\sin x}{x}\right)", size=64)
        pk(R4, 0)
        R4.move_to([0, -2.75, 0])
        chk(R0, L1, L2, R3, R4)
        self.go(7704.4, Write(R4[0:2]), FadeOut(t1), FadeOut(t2), run=0.5)
        self.go(7705.55, TransformFromCopy(R0[2:4], R4[2]), run=0.6)
        self.go(7707.3, TransformFromCopy(R3[2:], R4[3]), run=0.9)
        self.go(7710.1, Create(answer_box(R4)), run=0.5)
        self.wipe(7711.05, run=0.35)


# ================================================================ messy products and quotients

def messy_y():
    """y = (x^2+1)^3 (2x-5)^4 / sqrt x, built by hand so each factor and exponent can move on its own."""
    num = M("(x^2+1)", "^{3}", "(2x-5)", "^{4}", size=64)
    num[1].set_color(ORG)
    num[3].set_color(ORG)
    den = M(r"\sqrt{x}", size=64)
    w = num.width + 0.3
    bar = Line([0, 0, 0], [w, 0, 0], color=CHALK, stroke_width=4)
    num.next_to(bar, UP, buff=0.14)
    den.next_to(bar, DOWN, buff=0.14)
    lhs = M("y", "=", size=64)
    lhs.next_to(bar, LEFT, buff=0.25)
    lhs.shift(UP * (bar.get_y() - lhs[1].get_y()))
    Y = VGroup(lhs, num, bar, den)
    Y.move_to([0, 0.95, 0])
    return Y


class K21_Messy(Shot):
    def body(self):
        self.title("Another One", animate=False)
        self.title("Messy Products", 7711.8)

        # logs turn x into + and / into -
        L1 = M(r"\ln", "(", "a", r"\cdot", "b", ")", "=", r"\ln a", "+", r"\ln b", size=66)
        at_eq(L1, 6, 0, 1.0)
        L2 = M(r"\ln", r"\frac{a}{b}", "=", r"\ln a", "-", r"\ln b", size=66)
        at_eq(L2, 2, 0, -0.7)
        chk(L1, L2)
        self.go(7717.2, Write(L1[0:7]), run=0.7)
        self.go(7718.25, L1[3].animate.set_color(YEL), run=0.4)
        self.go(7718.85, Write(L1[7]), Write(L1[9]), TransformFromCopy(L1[3], L1[8]), run=0.6)
        self.go(7719.45, L1[8].animate.set_color(YEL), run=0.3)
        self.go(7720.1, Write(L2[0:3]), run=0.5)
        self.go(7720.8, Write(L2[3]), Write(L2[5]), TransformFromCopy(L2[1][1], L2[4]), run=0.6)
        self.go(7721.4, L2[4].animate.set_color(YEL), L2[1][1].animate.set_color(YEL), run=0.25)
        self.wipe(7721.75, run=0.3)

        Y = messy_y()
        lhs, num, bar, den = Y
        chk(Y)
        self.go(7722.3, Write(lhs), run=0.5)
        self.go(7723.4, Write(num[0:2]), run=0.9)
        self.go(7725.7, Write(num[2:4]), run=0.9)
        self.go(7728.4, Create(bar), Write(den), run=0.8)

        # the three-rule pile-up
        ps = VGroup(*[pill(s, DIM, size=36) for s in ("product rule", "quotient rule", "chain rule")])
        ps.arrange(RIGHT, buff=0.5).move_to([0, -1.6, 0])
        chk(ps)
        for p, t in zip(ps, (7731.9, 7733.05, 7734.05)):
            self.go(t, FadeIn(p, shift=UP * 0.1), run=0.4)
        ug = VGroup(*[strike(p, width=5) for p in ps])
        self.go(7736.4, *[Create(s) for s in ug], run=0.5)
        self.go(7737.9, FadeOut(ps), FadeOut(ug), run=0.4)


def messy_ln(y):
    L = M(r"\ln", "y", "=", "3", r"\ln(x^2+1)", "+", "4", r"\ln(2x-5)", "-", r"\tfrac{1}{2}", r"\ln x", size=58)
    for i in (3, 6, 9):
        L[i].set_color(YEL)
    L.move_to([0, y, 0])
    return L


class K21_MessyLog(Shot):
    def body(self):
        self.title("Messy Products", animate=False)
        Y = messy_y()
        lhs, num, bar, den = Y
        self.add(Y)

        # ln of both sides
        lnr = M(r"\ln", size=64, color=YEL)
        sh = lnr.width + 0.2
        lnr.next_to(bar, LEFT, buff=0.12).set_y(lhs[1].get_y() + 0.04)
        lnl = M(r"\ln", size=64, color=YEL).next_to(lhs[0].get_left() + LEFT * sh, LEFT, buff=0.12)
        lnl.set_y(lnr.get_y())
        self.go(7739.0, lhs.animate.shift(LEFT * sh), FadeIn(lnl, shift=RIGHT * 0.15), FadeIn(lnr, shift=RIGHT * 0.15),
                run=0.6)
        lhs_l = VGroup(lnl, lhs[0])

        L = messy_ln(-1.15)
        chk(L)
        # break it up: exponents slide down in front
        self.go(7743.0, TransformFromCopy(lhs_l, L[0:2]), TransformFromCopy(lhs[1], L[2]), run=0.6)
        self.go(7744.3, TransformFromCopy(num[1], L[3], path_arc=0.45 * PI), TransformFromCopy(num[0], L[4]), run=0.9)
        self.go(7747.15, Write(L[5]), TransformFromCopy(num[3], L[6], path_arc=0.45 * PI),
                TransformFromCopy(num[2], L[7]), run=0.9)
        hint = M(r"\sqrt{x}=x^{1/2}", size=44, color=DIM).next_to(den, RIGHT, buff=0.9)
        self.go(7748.8, FadeIn(hint, shift=LEFT * 0.1), run=0.4)
        self.go(7750.3, Write(L[8]), TransformFromCopy(hint[0][-3:], L[9], path_arc=-0.35 * PI),
                TransformFromCopy(den, L[10]), run=0.9)

        # now each piece is easy
        self.go(7752.75, FadeOut(VGroup(Y, lnl, lnr, hint), shift=UP * 0.2), L.animate.move_to([0, 1.65, 0]), run=0.6)
        X = L[2].get_x()
        D1 = M(r"\frac{y'}{y}", "=", r"3\cdot\frac{2x}{x^2+1}", "+", r"4\cdot\frac{2}{2x-5}", "-",
               r"\frac{1}{2}\cdot\frac{1}{x}", size=56)
        D1[0][0:2].set_color(PINK)
        at_eq(D1, 1, X, 0.05)
        D2 = M(r"\frac{y'}{y}", "=", r"\frac{6x}{x^2+1}", "+", r"\frac{8}{2x-5}", "-", r"\frac{1}{2x}", size=56)
        D2[0][0:2].set_color(PINK)
        at_eq(D2, 1, X, -1.75)
        chk(D1, D2)
        self.go(7754.6, Write(D1[0:2]), run=0.6)
        self.go(7756.4, Write(D1[2]), run=1.0)
        self.go(7760.1, Write(D1[3:5]), run=1.0)
        self.go(7763.5, Write(D1[5:]), run=0.9)
        self.go(7766.2, TransformFromCopy(D1[0:2], D2[0:2]), run=0.6)
        self.go(7768.1, TransformFromCopy(D1[2], D2[2]), run=0.8)
        self.go(7771.2, TransformFromCopy(D1[3:5], D2[3:5]), run=0.8)
        self.go(7773.8, TransformFromCopy(D1[5:], D2[5:]), run=0.8)

        # multiply by y, the original expression
        F1 = M("y'", "=", r"\frac{(x^2+1)^3\,(2x-5)^4}{\sqrt{x}}", r"\cdot", size=60)
        pk(F1, 0)
        F1[2].set_color(ORG)
        F2 = M(r"\left(\frac{6x}{x^2+1}+\frac{8}{2x-5}-\frac{1}{2x}\right)", size=60)
        VGroup(F1, F2).arrange(DOWN, buff=0.35).move_to([0, -0.3, 0])
        chk(F1, F2)
        self.go(7775.8, FadeOut(L), FadeOut(D1), FadeOut(D2[0:2]), run=0.4)
        self.go(7776.4, Write(F1[0:2]), run=0.5)
        self.go(7777.4, Write(F1[2:]), run=0.8)
        self.go(7778.4, ReplacementTransform(D2[2:], F2), run=0.8)
        self.go(7779.4, F1[2].animate.set_color(CHALK), Create(answer_box(VGroup(F1, F2))), run=0.6)
        cl = H("much cleaner", 38, YEL).move_to([0, -2.85, 0])
        self.go(7780.5, FadeIn(cl, shift=UP * 0.1), run=0.4)
        self.wipe(7781.75, run=0.35)


# ================================================================ try one: x^(2x)

def x2x_answer():
    R4 = M("y'", "=", "x^{2x}", r"(2\ln x+2)", size=66)
    pk(R4, 0)
    at_eq(R4, 1, -1.3, -2.6)
    return R4, answer_box(R4)


class K21_TryX2X(Shot):
    def body(self):
        self.title("Messy Products", animate=False)
        self.title("Try One", 7783.9)
        R0 = power_row("x", "2x", 1.55, size=76)
        L1, L2, pairs = ln_slide("x", "2x", 0.25, size=72)
        self.go(7784.9, Write(R0), run=0.8)
        self.go(7787.2, TransformFromCopy(R0[0], L1[1]), TransformFromCopy(R0[1], L1[2]),
                TransformFromCopy(R0[2], L1[5]), TransformFromCopy(R0[3], L1[6]),
                FadeIn(L1[0]), FadeIn(L1[3]), FadeIn(L1[4]), FadeIn(L1[7]), run=0.6)
        self.go(7788.4, *morph(L1, L2, pairs, arc=(6,)), run=1.0)

        R3 = M(r"\frac{y'}{y}", "=", r"2\ln x", "+", "2x", r"\cdot", r"\frac{1}{x}", size=64)
        R3[0][0:2].set_color(PINK)
        at_eq(R3, 1, -1.3, -1.05)
        self.go(7791.4, Write(R3[0:2]), run=0.6)
        self.go(7793.65, Write(R3[2]), run=0.7)
        self.go(7795.25, Write(R3[3:]), run=0.8)
        sx = VGroup(strike(R3[4][1], width=5), strike(R3[6][2], width=5))
        self.go(7797.35, *[Create(s) for s in sx], run=0.35)
        two = M("2", size=64).next_to(R3[3], RIGHT, buff=0.2).align_to(R3[2], DOWN)
        self.go(7798.0, ReplacementTransform(VGroup(R3[4:7], sx), two), run=0.6)

        R4, b4 = x2x_answer()
        chk(R0, L1, L2, R3, R4)
        self.go(7800.2, Write(R4[0:2]), run=0.5)
        self.go(7801.8, TransformFromCopy(R0[2:4], R4[2]), run=0.6)
        self.go(7803.2, TransformFromCopy(VGroup(R3[2], R3[3], two), R4[3]), run=0.8)
        self.go(7804.95, Create(b4), run=0.4)


# ================================================================ recap

class K21_Recap(Shot):
    def body(self):
        self.title("Try One", animate=False)
        R4, b4 = x2x_answer()
        self.add(R4, b4)
        self.title("Chapter 7 Recap", 7805.85)
        self.play(FadeOut(R4), FadeOut(b4), run_time=0.4)

        div = DashedLine([0, 1.95, 0], [0, -3.3, 0], color=FAINT, stroke_width=3, dash_length=0.12)
        hL = pill("implicit", BLUE, size=40).move_to([-3.4, 1.75, 0])
        hR = pill("log first", ORG, size=40).move_to([3.4, 1.75, 0])
        self.go(7807.5, FadeIn(hL), Create(div), run=0.6)

        # implicit: y' on every y, then solve
        a1 = M("y^2", r"\;\to\;", "2y", "y'", size=64).move_to([-3.4, 0.55, 0])
        pk(a1, 3)
        self.go(7809.75, Write(a1[0:3]), run=0.7)
        self.go(7812.4, Write(a1[3]), run=0.4)
        self.go(7813.2, Circumscribe(a1[3], color=PINK, buff=0.08), run=0.6)
        a2 = Tex(r"solve for ", r"$y'$", font_size=48, color=CHALK, tex_template=HANDTEX).move_to([-3.4, -0.55, 0])
        a2[1].set_color(PINK)
        self.go(7814.6, Write(a2), run=0.6)
        a3 = M(r"\ln x", r"\;\to\;", r"\frac{1}{x}", size=56).move_to([-3.4, -1.6, 0])
        a4 = M(r"\arcsin x,\ \arctan x", size=50).move_to([-3.4, -2.95, 0])
        self.go(7817.4, Write(a3), run=0.7)
        self.go(7819.0, Write(a4), run=0.8)

        # log first: x^x and messy products
        self.go(7820.8, FadeIn(hR), run=0.5)
        b1 = M("x", "^{x}", size=84).move_to([3.4, 0.45, 0])
        self.go(7821.6, Write(b1), run=0.6)
        self.go(7823.1, b1[0].animate.set_color(YEL), run=0.3)
        self.go(7823.6, b1[1].animate.set_color(YEL), run=0.3)
        b2 = M(r"\frac{(x^2+1)^3(2x-5)^4}{\sqrt{x}}", size=50).move_to([3.4, -1.15, 0])
        self.go(7825.0, Write(b2), run=0.8)
        b3 = M(r"\ln y", r"=\ \dots", size=56, color=YEL).move_to([3.4, -2.6, 0])
        self.go(7826.6, Write(b3), run=0.6)
        chk(a1, a2, a3, a4, b1, b2, b3)
        self.wipe(7827.65, run=0.35)


class K21_Toolkit(Shot):
    def body(self):
        self.title("Chapter 7 Recap", animate=False)
        self.title("The Derivative Toolkit", 7828.3)
        rows = [
            ("power", r"(x^n)'=n\,x^{n-1}"),
            ("product", r"(fg)'=f'g+fg'"),
            ("quotient", r"\left(\frac{f}{g}\right)'=\frac{f'g-fg'}{g^2}"),
            ("chain", r"f(g(x))'=f'(g(x))\,g'(x)"),
            ("inv. trig", r"(\arctan x)'=\frac{1}{1+x^2}"),
            ("trig", r"(\sin x)'=\cos x"),
            ("exp", r"(e^x)'=e^x"),
            ("log", r"(\ln x)'=\frac{1}{x}"),
            ("implicit", r"y^2\to 2y\,y'"),
            ("log first", r"\ln y=\dots"),
        ]
        ys = [1.75, 0.75, -0.3, -1.35, -2.4]
        g = VGroup()
        t = 7828.85
        for k, (lab, tex) in enumerate(rows):
            col = 0 if k < 5 else 1
            y = ys[k % 5]
            L = H(lab, 34, DIM)
            F = M(tex, size=48)
            if col == 0:
                L.move_to([-6.6 + L.width / 2, y, 0])
                F.move_to([-4.5 + F.width / 2, y, 0])
            else:
                L.move_to([0.9 + L.width / 2, y, 0])
                F.move_to([2.9 + F.width / 2, y, 0])
            chk(VGroup(L, F))
            g.add(VGroup(L, F))
            self.go(t, FadeIn(L), Write(F), run=0.5)
            t += 0.55
        self.go(7834.4, Circumscribe(g, color=YEL, buff=0.2), run=1.0)
        nx = H("next: putting them to work", 36, YEL).move_to([0, -3.45, 0])
        chk(nx)
        self.go(7836.5, FadeIn(nx, shift=UP * 0.1), run=0.5)
