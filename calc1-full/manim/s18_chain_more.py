"""Builder 18: end of Chapter 6. (x^2-3x)^4, three to try, more than two layers (peel from the outside in),
sin^3(2x) and e^{sin x^2} with a layer row, the calculator test for the outermost layer, chain + product rule
(x^2 e^{3x}, x sqrt(1-x^2) with a common denominator), why (a^x)' = a^x ln a, one more set, the chapter recap.
Colours: outside = BLUE, inside = ORG (middle layer of three = PURP), inside derivative = PINK, answers = GRN."""
from common import *

D = r"\frac{d}{dx}"


# ---------------------------------------------------------------- local helpers

def under(mob, color=YEL, buff=0.1, width=5):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=width)


def col(m, cs):
    for k, c in cs.items():
        m[k].set_color(c)
    return m


def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def left_at(m, x, y):
    m.shift(RIGHT * (x - m.get_left()[0]) + UP * (y - m.get_y()))
    return m


def arrow(a, b, color=DIM):
    return Arrow(a, b, buff=0, color=color, stroke_width=4, tip_length=0.18, max_tip_length_to_length_ratio=0.3)


def layer_row(parts, y, size=60, x=0.0):
    """The layers written outside -> in with small arrows: [(tex, colour), ...]. Returns (items, arrows, row)."""
    ms = [M(t, size=size, color=c) for t, c in parts]
    ars = [arrow(ORIGIN, RIGHT * 0.75) for _ in parts[1:]]
    seq = [ms[0]]
    for a, m in zip(ars, ms[1:]):
        seq += [a, m]
    row = VGroup(*seq).arrange(RIGHT, buff=0.35).move_to([x, y, 0])
    return ms, ars, row


def dim(*ms, o=0.3):
    return [m.animate.set_opacity(o) for m in ms]


def lit(*ms):
    return [m.animate.set_opacity(1) for m in ms]


def unclock(*ms):
    for m in ms:
        for x in m.get_family():
            x.clear_updaters()


# ================================================================ a power on the outside

class K18_PowerFour(Shot):
    def body(self):
        self.title("A Negative Power", animate=False)
        self.title("Another Power", 6472.95)
        p = col(M("y", "=", "(", "x^2-3x", ")^4", size=84), {2: BLUE, 3: ORG, 4: BLUE}).move_to([0, 1.25, 0])
        self.go(6473.45, Write(p[0:4]), run=0.8)
        self.go(6475.0, Write(p[4]), run=0.4)
        bi = Brace(p[3], DOWN, color=ORG, buff=0.12)
        li = H("inside", 36, ORG).next_to(bi, DOWN, buff=0.08)
        lo = H("outside", 36, BLUE).next_to(p[4], RIGHT, buff=0.35)
        self.go(6475.55, FadeIn(bi), FadeIn(li, shift=UP * 0.1), FadeIn(lo, shift=LEFT * 0.1), run=0.5)
        R = col(M("y'", "=", "4", "(", "x^2-3x", ")^3", r"\cdot", "(2x-3)", size=76),
                {2: BLUE, 3: BLUE, 4: ORG, 5: BLUE, 7: PINK})
        at_eq(R, 1, p[1].get_x(), -1.35)
        R.shift(RIGHT * (0 - R.get_x()))
        self.go(6476.45, Write(R[0:3]), run=0.4)
        self.go(6476.95, Write(R[3]), TransformFromCopy(p[3], R[4]), Write(R[5]), run=0.8)
        self.go(6479.0, Write(R[6]), run=0.3)
        nd = H("inside derivative", 34, PINK).next_to(R[7], DOWN, buff=0.3)
        self.go(6479.9, FadeIn(nd, shift=UP * 0.1), run=0.4)
        self.go(6480.75, Write(R[7]), run=0.6)
        self.go(6481.6, Create(answer_box(R[2:])), run=0.5)


# ================================================================ three to try

def try_rows():
    ys = (1.2, -0.3, -1.8)
    P = [col(M("(", "4x-1", ")^3", size=60), {0: BLUE, 1: ORG, 2: BLUE}),
         col(M(r"\cos", "(", "x^3", ")", size=60), {0: BLUE, 1: BLUE, 2: ORG, 3: BLUE}),
         M("e^{-2x}", size=60)]
    P[2][0][0].set_color(BLUE); P[2][0][1:].set_color(ORG)
    W = [col(M("3", "(", "4x-1", ")^2", r"\cdot", "4", "=", "12", "(", "4x-1", ")^2", size=56),
             {0: BLUE, 1: BLUE, 2: ORG, 3: BLUE, 5: PINK, 7: GRN, 8: GRN, 9: GRN, 10: GRN}),
         col(M(r"{-}\sin", "(", "x^3", ")", r"\cdot", "3x^2", "=", r"-3x^2\sin(x^3)", size=56),
             {0: BLUE, 1: BLUE, 2: ORG, 3: BLUE, 5: PINK, 7: GRN}),
         col(M("e^{-2x}", r"\cdot", "(-2)", "=", "-2e^{-2x}", size=56), {2: PINK, 4: GRN})]
    W[2][0][0].set_color(BLUE); W[2][0][1:].set_color(ORG)
    A = []
    for k, y in enumerate(ys):
        left_at(P[k], -6.3, y)
        A.append(arrow([-3.25, y, 0], [-2.45, y, 0]))
        left_at(W[k], -2.1, y)
    return P, A, W


class K18_TryThree(Shot):
    def body(self):
        self.title("Try These", 6484.6)
        P, A, W = try_rows()
        self.go(6485.15, Write(P[0]), run=0.7)
        self.go(6487.25, Write(P[1]), run=0.7)
        self.go(6489.95, Write(P[2]), run=0.6)
        self.go(6491.55, *dim(P[1], P[2]), run=0.4)
        w = W[0]
        self.go(6492.87, GrowArrow(A[0]), Write(w[0]), run=0.4)
        self.go(6493.7, Write(w[1]), TransformFromCopy(P[0][1], w[2]), Write(w[3]), run=0.8)
        self.go(6495.9, Write(w[4:6]), run=0.5)
        self.go(6497.11, Write(w[6:]), run=0.9)
        self.go(6500.35, *dim(P[0], A[0], W[0], o=0.35), *lit(P[1]), run=0.5)
        w = W[1]
        self.go(6501.85, GrowArrow(A[1]), Write(w[0:2]), TransformFromCopy(P[1][2], w[2]), Write(w[3]), run=0.8)
        self.go(6504.0, Write(w[4:6]), run=0.6)
        self.go(6506.11, Write(w[6:]), run=0.9)
        self.go(6508.85, *dim(P[1], A[1], W[1], o=0.35), *lit(P[2]), run=0.5)
        w = W[2]
        self.go(6509.6, GrowArrow(A[2]), TransformFromCopy(P[2], w[0]), run=0.8)
        self.go(6511.57, Write(w[1:3]), run=0.5)
        self.go(6512.97, Write(w[3:]), run=0.8)
        self.go(6514.6, *lit(P[0], A[0], W[0], P[1], A[1], W[1]), run=0.5)
        self.wipe(6516.3)


# ================================================================ more than two layers

class K18_Peel(Shot):
    def body(self):
        self.title("Try These", animate=False)
        self.title("More Than Two Layers", 6516.9)
        c = np.array([0, 0.45, 0])
        specs = [(10.0, 3.3, BLUE, "outside"), (6.8, 2.2, PURP, "middle"), (3.4, 1.0, ORG, "inside")]
        boxes, labs = [], []
        for w, h, cl, s in specs:
            b = RoundedRectangle(width=w, height=h, corner_radius=0.25, stroke_color=cl, stroke_width=5).move_to(c)
            boxes.append(b)
            lab = H(s, 36, cl)
            if s == "inside":
                lab.move_to(b)
            else:
                lab.move_to(b.get_corner(UL) + np.array([0.3 + lab.width / 2, -0.3, 0]))
            labs.append(lab)
        for t, b, l in zip((6517.45, 6518.05, 6518.75), boxes, labs):
            self.go(t, Create(b), FadeIn(l), run=0.5)
        terms = [M(r"(\text{outside})'", size=50, color=BLUE), M(r"\cdot", size=50),
                 M(r"(\text{middle})'", size=50, color=PURP), M(r"\cdot", size=50),
                 M(r"(\text{inside})'", size=50, color=ORG)]
        row = VGroup(*terms).arrange(RIGHT, buff=0.25).move_to([0, -2.55, 0])
        for k, t in enumerate((6520.95, 6522.05, 6523.3)):
            anims = [FadeOut(boxes[k], scale=1.06), ReplacementTransform(labs[k], terms[2 * k])]
            if k:
                anims.append(FadeIn(terms[2 * k - 1]))
            self.go(t, *anims, run=0.7)
        self.go(6524.75, Circumscribe(row, color=YEL, buff=0.15), run=0.9)
        self.wipe(6526.15)


def sin3_problem():
    p = M("(", r"\sin", "(", "2x", ")", ")^3", size=84)
    col(p, {0: BLUE, 1: PURP, 2: PURP, 3: ORG, 4: PURP, 5: BLUE}).move_to([0, 1.55, 0])
    return p


class K18_SinCubed(Shot):
    def body(self):
        self.title("More Than Two Layers", animate=False)
        p0 = M(r"\sin^3", "(", "2x", ")", size=84).move_to([0, 1.55, 0])
        p0[0][:3].set_color(PURP); p0[0][3].set_color(BLUE)
        p0[1].set_color(PURP); p0[2].set_color(ORG); p0[3].set_color(PURP)
        self.go(6526.8, Write(p0), run=0.8)
        p = sin3_problem()
        self.go(6529.3, ReplacementTransform(p0, p), run=0.9)
        yb = p.get_bottom()[1]
        b3 = Line([p[3].get_left()[0], yb - 0.12, 0], [p[3].get_right()[0], yb - 0.12, 0], color=ORG, stroke_width=5)
        b2 = Line([p[1].get_left()[0], yb - 0.3, 0], [p[4].get_right()[0], yb - 0.3, 0], color=PURP, stroke_width=5)
        b1 = Line([p.get_left()[0], yb - 0.48, 0], [p.get_right()[0], yb - 0.48, 0], color=BLUE, stroke_width=5)
        self.go(6531.3, LaggedStart(Create(b1), Create(b2), Create(b3), lag_ratio=0.35), run=1.0)
        L, ars, row = layer_row([(r"(\square)^3", BLUE), (r"\sin\square", PURP), ("2x", ORG)], -0.05, size=58)
        self.go(6534.0, FadeIn(L[0], shift=DOWN * 0.1), run=0.5)
        self.go(6536.6, GrowArrow(ars[0]), FadeIn(L[1], shift=DOWN * 0.1), run=0.5)
        self.go(6538.7, GrowArrow(ars[1]), FadeIn(L[2], shift=DOWN * 0.1), run=0.5)

        W = M("y'", "=", "3", "(", r"\sin", "(", "2x", ")", ")^2", r"\cdot", r"\cos", "(", "2x", ")", r"\cdot", "2", size=64)
        col(W, {2: BLUE, 3: BLUE, 4: PURP, 5: PURP, 6: ORG, 7: PURP, 8: BLUE, 10: PURP, 11: PURP, 12: ORG, 13: PURP, 15: ORG})
        W.move_to([0, -1.45, 0])
        u = under(L[0], BLUE)
        self.go(6539.4, FadeOut(b1), Create(u), run=0.5)
        self.go(6540.0, Write(W[0:2]), run=0.4)
        self.go(6541.3, Write(W[2:4]), TransformFromCopy(p[1:5], W[4:8]), Write(W[8]), run=0.9)
        self.go(6543.8, FadeOut(b2), Transform(u, under(L[1], PURP)), run=0.5)
        self.go(6546.9, Write(W[9:11]), run=0.4)
        self.go(6547.4, Write(W[11]), TransformFromCopy(p[3], W[12]), Write(W[13]), run=0.7)
        self.go(6549.35, FadeOut(b3), Transform(u, under(L[2], ORG)), run=0.5)
        self.go(6552.5, Write(W[14:16]), run=0.4)
        self.go(6553.0, FadeOut(u), Circumscribe(W[2:], color=YEL, buff=0.12), run=0.9)
        v = under(W[2:9])
        self.go(6554.7, Create(v), run=0.4)
        self.go(6557.0, Transform(v, under(W[10:14])), run=0.4)
        self.go(6559.05, Transform(v, under(W[15])), run=0.4)
        F = M("=", "6", r"\sin^2", "(2x)", r"\cos", "(2x)", size=64, color=GRN)
        at_eq(F, 0, W[1].get_x(), -2.85)
        self.go(6560.75, FadeOut(v), Write(F[0:4]), run=0.7)
        self.go(6562.6, Write(F[4:]), run=0.5)
        self.go(6563.2, F[1:].animate.shift(RIGHT * 0.14), Create(answer_box(F[1:]).shift(RIGHT * 0.14)), run=0.5)
        self.wipe(6564.55)


# ================================================================ e to the sine of x squared, and the calculator test

def esin(size=84):
    m = M(r"e^{\sin(x^2)}", size=size)
    g = m[0]
    g[0].set_color(BLUE); g[1:5].set_color(PURP); g[5:7].set_color(ORG); g[7].set_color(PURP)
    return m


def calculator(center):
    body = RoundedRectangle(width=3.0, height=4.3, corner_radius=0.25, stroke_color=CHALK, stroke_width=4).move_to(center)
    top = body.get_top()
    screen = RoundedRectangle(width=2.4, height=0.85, corner_radius=0.1, stroke_color=DIM, stroke_width=3).move_to(top + DOWN * 0.72)
    keys, labs = VGroup(), VGroup()
    for i, (s, cl) in enumerate(((r"x^2", ORG), (r"\sin", PURP), (r"e^x", BLUE))):
        k = RoundedRectangle(width=0.74, height=0.52, corner_radius=0.08, stroke_color=CHALK, stroke_width=3,
                             fill_color=YEL, fill_opacity=0).move_to(top + DOWN * 1.62 + RIGHT * (i - 1) * 0.86)
        keys.add(k)
        labs.add(M(s, size=36, color=cl).move_to(k))
    grid = VGroup(*[RoundedRectangle(width=0.62, height=0.42, corner_radius=0.06, stroke_color=FAINT, stroke_width=2.5)
                    .move_to(top + DOWN * (2.35 + r * 0.6) + RIGHT * (c - 1) * 0.86) for r in range(3) for c in range(3)])
    return VGroup(body, screen, keys, labs, grid)


class K18_ExpSin(Shot):
    def body(self):
        self.title("More Than Two Layers", animate=False)
        p = esin().move_to([0, 1.6, 0])
        self.go(6565.33, Write(p), run=0.9)
        L, ars, row = layer_row([(r"e^{\square}", BLUE), (r"\sin\square", PURP), ("x^2", ORG)], 0.15, size=58)
        om = H("outermost", 34, DIM).next_to(L[0], LEFT, buff=0.4)
        self.go(6567.0, FadeIn(om, shift=RIGHT * 0.1), run=0.4)
        self.go(6568.4, FadeIn(L[0], shift=DOWN * 0.1), run=0.5)
        self.go(6570.07, GrowArrow(ars[0]), FadeIn(L[1], shift=DOWN * 0.1), run=0.5)
        self.go(6571.3, GrowArrow(ars[1]), FadeIn(L[2], shift=DOWN * 0.1), run=0.5)

        W = M("y'", "=", r"e^{\sin(x^2)}", r"\cdot", r"\cos", "(", "x^2", ")", r"\cdot", "2x", size=66)
        g = W[2]
        g[0].set_color(BLUE); g[1:5].set_color(PURP); g[5:7].set_color(ORG); g[7].set_color(PURP)
        col(W, {4: PURP, 5: PURP, 6: ORG, 7: PURP, 9: ORG})
        W.move_to([0, -1.3, 0])
        u = under(L[0], BLUE)
        self.go(6572.1, Write(W[0:2]), TransformFromCopy(p, W[2]), Create(u), run=0.9)
        st = H("stays", 34, BLUE).next_to(W[2], DOWN, buff=0.3)
        self.go(6574.15, FadeIn(st, shift=UP * 0.1), run=0.4)
        self.go(6575.1, Transform(u, under(L[1], PURP)), run=0.4)
        self.go(6578.37, Write(W[3:5]), run=0.4)
        self.go(6578.85, Write(W[5]), TransformFromCopy(p[0][5:7], W[6]), Write(W[7]), run=0.6)
        self.go(6579.7, Transform(u, under(L[2], ORG)), run=0.4)
        self.go(6582.5, Write(W[8:10]), run=0.5)
        F = M("=", "2x", r"\cos(x^2)", r"e^{\sin(x^2)}", size=66, color=GRN)
        at_eq(F, 0, W[1].get_x(), -2.75)
        self.go(6584.37, FadeOut(u), FadeOut(st), Write(F[0:2]), run=0.5)
        self.go(6585.45, Write(F[2]), run=0.6)
        self.go(6586.95, Write(F[3]), run=0.8)
        self.go(6587.9, F[1:].animate.shift(RIGHT * 0.14), Create(answer_box(F[1:]).shift(RIGHT * 0.14)), run=0.5)

        # the calculator test: the last key you press is the outermost layer
        self.wipe(6589.1, keep=[p])
        self.go(6589.55, p.animate.scale(0.8).move_to([3.0, 1.45, 0]), run=0.6)
        q = H("last step?", 40, YEL).next_to(p, LEFT, buff=0.6)
        self.go(6591.65, FadeIn(q, shift=RIGHT * 0.1), run=0.4)
        calc = calculator([-3.7, -0.75, 0])
        body, screen, keys, labs, grid = calc
        self.go(6593.9, Create(VGroup(body, screen, keys, grid)), FadeIn(labs), run=0.8)
        val = M("1.5", size=44).move_to(screen)
        S, sars, srow = layer_row([("x^2", ORG), (r"\sin", PURP), ("e^x", BLUE)], -0.35, size=60, x=3.0)
        self.add(val)
        vals = ["2.25", "0.78", "2.18"]
        order = [0, 1, 2]
        for k, t in zip(order, (6594.75, 6595.3, 6595.85)):
            nv = M(vals[k], size=44).move_to(screen)
            anims = [keys[k].animate(rate_func=there_and_back).set_fill(YEL, opacity=0.55),
                     ReplacementTransform(val, nv), TransformFromCopy(labs[k], S[k])]
            if k:
                anims.append(GrowArrow(sars[k - 1]))
            self.go(t, *anims, run=0.45)
            val = nv
        ring = SurroundingRectangle(S[2], color=YEL, buff=0.14, stroke_width=4, corner_radius=0.08)
        ol = H("outermost", 36, YEL).next_to(ring, UP, buff=0.15)
        self.go(6596.9, FadeOut(q), Create(ring), FadeIn(ol, shift=DOWN * 0.1), run=0.5)
        back = CurvedArrow(S[2].get_bottom() + DOWN * 0.25, S[0].get_bottom() + DOWN * 0.25, angle=-1.0,
                           color=PINK, stroke_width=4, tip_length=0.2)
        self.go(6598.0, Create(back), run=0.9)
        dl = H("differentiate", 36, PINK).next_to(back, DOWN, buff=0.12)
        self.go(6599.45, FadeIn(dl, shift=UP * 0.1), run=0.4)
        self.wipe(6600.4)


# ================================================================ chain rule + product rule

class K18_ProductChain(Shot):
    def body(self):
        self.title("More Than Two Layers", animate=False)
        self.title("Chain + Product Rule", 6600.9)
        ps = [pill("chain rule", YEL), pill("product rule", BLUE), pill("quotient rule", ORG)]
        VGroup(*ps).arrange(RIGHT, buff=0.6).move_to([0, 0.4, 0])
        self.go(6601.6, FadeIn(ps[0], shift=UP * 0.1), run=0.4)
        self.go(6603.87, FadeIn(ps[1], shift=UP * 0.1), run=0.4)
        self.go(6605.01, FadeIn(ps[2], shift=UP * 0.1), run=0.4)
        self.go(6607.2, *[FadeOut(x, shift=DOWN * 0.1) for x in ps], run=0.4)

        P = col(M("y", "=", "x^2", r"e^{3x}", size=76), {2: BLUE, 3: ORG})
        left_at(P, -6.0, 1.45)
        self.go(6608.05, Write(P[0:3]), run=0.6)
        self.go(6609.3, Write(P[3]), run=0.5)
        uf, ug = under(P[2], BLUE), under(P[3], ORG)
        self.go(6610.75, Create(uf), Create(ug), run=0.4)
        rule = M("(fg)'", "=", "f'g", "+", "fg'", size=50, color=DIM).move_to([3.7, 1.45, 0])
        self.go(6612.25, Write(rule), run=0.7)

        W = M("y'", "=", "2x", r"\cdot", r"e^{3x}", "+", "x^2", r"\cdot", r"\left(e^{3x}\right)'", size=64)
        col(W, {2: PINK, 4: ORG, 6: BLUE, 8: PINK})
        left_at(W, -6.0, -0.05)
        self.go(6613.45, FadeOut(uf), FadeOut(ug), Write(W[0:2]), run=0.4)
        self.go(6615.5, Write(W[2]), run=0.4)
        self.go(6616.15, Write(W[3]), TransformFromCopy(P[3], W[4]), run=0.6)
        self.go(6618.13, Write(W[5]), run=0.3)
        self.go(6619.05, TransformFromCopy(P[2], W[6]), Write(W[7]), run=0.5)
        self.go(6620.3, Write(W[8]), run=0.6)

        C = M(r"\left(e^{3x}\right)'", "=", r"e^{3x}", r"\cdot", "3", size=56)
        C[0].set_color(PINK); C[2][0].set_color(BLUE); C[2][1:].set_color(ORG); C[4].set_color(PINK)
        left_at(C, -5.6, -1.6)
        cl = H("chain rule", 34, YEL).next_to(C, RIGHT, buff=0.5)
        self.go(6622.4, TransformFromCopy(W[8], C[0]), Write(C[1]), FadeIn(cl, shift=LEFT * 0.1), run=0.6)
        self.go(6624.0, Write(C[2:]), run=0.6)
        n8 = M(r"3e^{3x}", size=64, color=PINK).next_to(W[7], RIGHT, buff=0.15)
        n8.shift(UP * (W[6].get_y() - n8.get_y()))
        self.go(6624.75, ReplacementTransform(W[8], n8), run=0.7)
        A = M("=", r"2x\,e^{3x}", "+", r"3x^2e^{3x}", size=64)
        at_eq(A, 0, W[1].get_x(), -1.6)
        self.go(6626.5, FadeOut(C), FadeOut(cl), run=0.3)
        self.go(6627.75, Write(A[0:2]), run=0.6)
        self.go(6629.9, Write(A[2:]), run=0.8)
        u1 = under(A[1][2:])
        u2 = under(A[3][3:])
        self.go(6632.95, Create(u1), Create(u2), run=0.4)
        B = M("=", "x", r"e^{3x}", "(2+3x)", size=64, color=GRN)
        at_eq(B, 0, W[1].get_x(), -2.95)
        self.go(6634.63, Write(B[0:3]), run=0.6)
        self.go(6636.2, Write(B[3]), run=0.7)
        self.go(6637.55, FadeOut(u1), FadeOut(u2), B[1:].animate.shift(RIGHT * 0.14), Create(answer_box(B[1:]).shift(RIGHT * 0.14)), run=0.5)
        self.wipe(6638.25)


# ================================================================ x sqrt(1-x^2)

def root_board():
    P = col(M("y", "=", "x", r"\sqrt{1-x^2}", size=72), {2: BLUE, 3: ORG})
    left_at(P, -6.0, 1.65)
    pr = H("product rule", 36, DIM).next_to(P, RIGHT, buff=0.8)
    W = M("y'", "=", "1", r"\cdot", r"\sqrt{1-x^2}", "+", "x", r"\cdot", r"\left(\sqrt{1-x^2}\right)'", size=60)
    col(W, {2: PINK, 4: ORG, 6: BLUE, 8: PINK})
    left_at(W, -6.0, 0.25)
    C1 = M(r"\left(\sqrt{1-x^2}\right)'", "=", r"\tfrac{1}{2}", "(", "1-x^2", ")^{-1/2}", r"\cdot", "(-2x)", size=56)
    col(C1, {0: PINK, 2: BLUE, 3: BLUE, 4: ORG, 5: BLUE, 7: PINK})
    at_eq(C1, 1, -2.3, -1.3)
    C2 = M("=", r"\frac{-x}{\sqrt{1-x^2}}", size=56, color=PINK)
    at_eq(C2, 0, C1[1].get_x(), -2.75)
    return P, pr, W, C1, C2


class K18_RootSetup(Shot):
    def body(self):
        self.title("Chain + Product Rule", animate=False)
        self.title("A Harder One", 6638.7)
        P, pr, W, C1, C2 = root_board()
        self.go(6640.07, Write(P[0:3]), run=0.5)
        self.go(6641.3, Write(P[3]), run=0.8)
        self.go(6643.45, FadeIn(pr, shift=LEFT * 0.1), run=0.4)
        self.go(6644.9, Write(W[0:2]), run=0.4)
        self.go(6646.39, Write(W[2]), run=0.3)
        self.go(6646.75, Write(W[3]), TransformFromCopy(P[3], W[4]), run=0.7)
        self.go(6649.7, Write(W[5]), run=0.3)
        self.go(6650.3, TransformFromCopy(P[2], W[6]), Write(W[7]), run=0.5)
        self.go(6651.35, Write(W[8]), run=0.8)
        self.go(6654.4, Circumscribe(W[8], color=YEL, buff=0.1), run=0.6)
        cl = H("chain rule", 34, YEL).next_to(C1[0], UP, buff=0.12).align_to(C1[0], LEFT)
        self.go(6655.3, TransformFromCopy(W[8], C1[0]), Write(C1[1]), run=0.6)
        self.go(6656.1, FadeIn(cl, shift=DOWN * 0.1), run=0.4)
        self.go(6657.6, Write(C1[2]), run=0.4)
        self.go(6658.8, Write(C1[3:6]), run=0.9)
        self.go(6661.4, Write(C1[6:]), run=0.6)
        self.go(6664.6, Write(C2), run=1.0)


class K18_RootCombine(Shot):
    def body(self):
        self.title("A Harder One", animate=False)
        P, pr, W, C1, C2 = root_board()
        cl = H("chain rule", 34, YEL).next_to(C1[0], UP, buff=0.12).align_to(C1[0], LEFT)
        self.add(P, pr, W, C1, C2, cl)
        R1 = M("y'", "=", r"\sqrt{1-x^2}", "+", r"\frac{x(-x)}{\sqrt{1-x^2}}", size=60)
        R1[2].set_color(ORG)
        left_at(R1, -6.0, 1.3)
        self.go(6667.9, FadeOut(P), FadeOut(pr), FadeOut(C1), FadeOut(cl), run=0.4)
        self.go(6668.6, ReplacementTransform(VGroup(W[0], W[1]), VGroup(R1[0], R1[1])),
                ReplacementTransform(W[4], R1[2]), FadeOut(W[2:4]), ReplacementTransform(W[5], R1[3]),
                FadeOut(W[6:]), ReplacementTransform(C2, R1[4]), run=1.0)
        den = R1[4][6:]
        u = under(den)
        self.go(6677.6, Create(u), run=0.4)
        R2a = M("=", r"\frac{\sqrt{1-x^2}\,\sqrt{1-x^2}}{\sqrt{1-x^2}}", "+", r"\frac{-x^2}{\sqrt{1-x^2}}", size=56)
        at_eq(R2a, 0, R1[1].get_x(), -0.5)
        R2 = M("=", r"\frac{1-x^2}{\sqrt{1-x^2}}", "+", r"\frac{-x^2}{\sqrt{1-x^2}}", size=56)
        at_eq(R2, 0, R1[1].get_x(), -0.5)
        self.go(6680.3, FadeOut(u), Write(R2a[0]), TransformFromCopy(R1[2], R2a[1]), run=1.0)
        self.go(6681.4, Write(R2a[2]), TransformFromCopy(R1[4], R2a[3]), run=0.6)
        self.go(6682.97, ReplacementTransform(R2a[1], R2[1]), R2a[0].animate.move_to(R2[0]),
                R2a[2].animate.move_to(R2[2]), R2a[3].animate.move_to(R2[3]), run=0.8)
        R3 = M("=", r"\frac{1-x^2-x^2}{\sqrt{1-x^2}}", size=56)
        at_eq(R3, 0, R1[1].get_x(), -2.3)
        self.go(6687.25, Write(R3), run=1.0)
        R4 = M("=", r"\frac{1-2x^2}{\sqrt{1-x^2}}", size=56)
        R4[1].set_color(GRN)
        at_eq(R4, 0, R1[1].get_x(), -2.3)
        self.go(6691.25, ReplacementTransform(R3[1], R4[1]), run=0.9)
        self.go(6693.0, R4[1].animate.shift(RIGHT * 0.14), Create(answer_box(R4[1]).shift(RIGHT * 0.14)), run=0.5)
        self.wipe(6695.75)


# ================================================================ why (a^x)' = a^x ln a

def ax_board():
    F0 = M(D, "a^x", "=", "a^x", r"\ln a", size=72)
    col(F0, {1: BLUE, 3: BLUE, 4: YEL}).move_to([0, 1.4, 0])
    R1 = M("a", "=", r"e^{\ln a}", size=72)
    R1[0].set_color(ORG)
    at_eq(R1, 1, -2.2, 0.15)
    ex = M(r"e^{\ln 5}", "=", "5", size=52, color=DIM).move_to([3.4, 0.15, 0])
    R2 = M("a^x", "=", r"\left(e^{\ln a}\right)^x", "=", r"e^{x\ln a}", size=72)
    at_eq(R2, 1, -2.2, -1.55)
    yb = SurroundingRectangle(R2[4], color=YEL, buff=0.14, stroke_width=4, corner_radius=0.08)
    return F0, R1, ex, R2, yb


class K18_WhyAx(Shot):
    def body(self):
        self.title("A Harder One", animate=False)
        self.title("Where ln a Comes From", 6696.25)
        F0, R1, ex, R2, yb = ax_board()
        top = F0.copy().scale(0.7).move_to([0, 1.85, 0]).set_opacity(0.5)
        F0.move_to([0, 0.4, 0])
        self.go(6699.1, Write(F0[0:2]), run=0.6)
        self.go(6700.5, Write(F0[2:4]), run=0.6)
        self.go(6701.6, Write(F0[4]), run=0.5)
        self.go(6703.4, Circumscribe(F0[4], color=YEL, buff=0.1), run=0.8)
        self.go(6704.5, Transform(F0, top), run=0.6)
        self.go(6706.4, Write(R1[0:2]), run=0.5)
        self.go(6707.6, Write(R1[2]), run=0.7)
        self.go(6709.2, FadeIn(ex, shift=LEFT * 0.1), run=0.6)
        self.go(6711.9, Write(R2[0:2]), run=0.5)
        self.go(6713.27, TransformFromCopy(R1[2], R2[2]), run=0.8)
        self.go(6716.47, Write(R2[3:5]), run=0.8)
        self.go(6718.45, Create(yb), run=0.5)


class K18_AxChain(Shot):
    def body(self):
        self.title("Where ln a Comes From", animate=False)
        F0, R1, ex, R2, yb = ax_board()
        F0.scale(0.7).move_to([0, 1.85, 0]).set_opacity(0.5)
        self.add(F0, R1, ex, R2, yb)
        L = M(D, r"e^{x\ln a}", "=", r"e^{x\ln a}", r"\cdot", r"(x\ln a)'", size=68)
        for k in (1, 3):
            L[k][0].set_color(BLUE); L[k][1:].set_color(ORG)
        L[5].set_color(PINK)
        L.move_to([0, 0.5, 0])
        self.go(6719.5, FadeOut(R1), FadeOut(ex), FadeOut(R2[0:4]), FadeOut(yb), Write(L[0]),
                ReplacementTransform(R2[4], L[1]), run=0.8)
        self.go(6721.95, Write(L[2]), TransformFromCopy(L[1], L[3]), run=0.7)
        self.go(6723.9, Write(L[4:6]), run=0.7)
        ln = L[5][2:5]
        uc = under(ln)
        cn = H("constant", 34, YEL).next_to(uc, DOWN, buff=0.1)
        self.go(6727.3, Create(uc), FadeIn(cn, shift=UP * 0.1), run=0.5)
        e5 = M("(5x)'", "=", "5", size=54, color=DIM).move_to([-3.3, -1.05, 0])
        self.go(6728.4, Write(e5), run=0.6)
        eL = M(r"(x\ln a)'", "=", r"\ln a", size=58, color=PINK).move_to([2.3, -1.05, 0])
        self.go(6730.6, Write(eL), run=0.7)
        R = M("=", r"e^{x\ln a}", r"\ln a", size=68)
        R[1][0].set_color(BLUE); R[1][1:].set_color(ORG); R[2].set_color(PINK)
        at_eq(R, 0, L[2].get_x(), -2.45)
        self.go(6732.7, Write(R), run=1.0)
        self.go(6734.4, FadeOut(e5), FadeOut(eL), FadeOut(uc), FadeOut(cn), run=0.4)
        ur = under(R[1])
        self.go(6735.1, Create(ur), run=0.4)
        R2 = M("=", "a^x", r"\ln a", size=68)
        at_eq(R2, 0, L[2].get_x(), -2.45)
        R2.shift(RIGHT * (R[0].get_x() - R2[0].get_x()))
        self.go(6736.8, FadeOut(ur), ReplacementTransform(R[1], R2[1]), ReplacementTransform(R[2], R2[2]),
                ReplacementTransform(R[0], R2[0]), run=0.7)
        self.go(6739.7, R2[1:].animate.set_color(GRN), run=0.4)
        R2[1:].shift(RIGHT * 0.14)
        bx = answer_box(R2[1:])
        self.play(Create(bx), run_time=0.4)
        tk = tick_mark(s=0.4).next_to(F0, RIGHT, buff=0.4)
        self.go(6740.7, F0.animate.set_opacity(1), Create(tk), run=0.5)

        # every rule ties back into the others
        self.go(6742.6, FadeOut(L), FadeOut(R2[0]), run=0.4)
        ing = [M(r"e^{\square}\ \text{stays}", size=48, color=BLUE), M(r"e^{\ln a}=a", size=48, color=ORG),
               H("chain rule", 40, PINK)]
        VGroup(*ing).arrange(RIGHT, buff=1.1).move_to([0, 0.35, 0])
        self.go(6743.1, LaggedStart(*[FadeIn(i, shift=DOWN * 0.1) for i in ing], lag_ratio=0.3), run=0.8)
        ans = VGroup(R2[1:], bx)
        lines = VGroup(*[Line(i.get_bottom() + DOWN * 0.12, ans.get_top() + UP * 0.12 + RIGHT * (k - 1) * 0.7,
                              color=DIM, stroke_width=3) for k, i in enumerate(ing)])
        self.go(6744.2, *[Create(l) for l in lines], run=0.7)
        web = VGroup(*ing, lines, ans)
        self.go(6746.2, Create(panel(web, PURP, buff=0.3)), run=0.8)


# ================================================================ one more set

def last_rows():
    ys = (1.5, 0.05, -1.5)
    P = [col(M(r"\ln", "(5x)", size=60), {0: BLUE, 1: ORG}),
         col(M(r"\tan", "(4x)", size=60), {0: BLUE, 1: ORG}),
         M(r"\sqrt{\sin x}", size=60)]
    P[2][0][0:2].set_color(BLUE); P[2][0][2:].set_color(ORG)
    W = [M(r"\frac{1}{5x}", r"\cdot", "5", "=", r"\frac{1}{x}", size=56),
         col(M(r"\sec^2", "(4x)", r"\cdot", "4", "=", r"4\sec^2(4x)", size=56), {0: BLUE, 1: ORG, 3: PINK, 5: GRN}),
         col(M(r"\tfrac{1}{2}", "(", r"\sin x", ")^{-1/2}", r"\cdot", r"\cos x", "=", r"\frac{\cos x}{2\sqrt{\sin x}}", size=56),
             {0: BLUE, 1: BLUE, 2: ORG, 3: BLUE, 5: PINK, 7: GRN})]
    W[0][0].set_color(BLUE); W[0][0][2:].set_color(ORG); W[0][2].set_color(PINK); W[0][4].set_color(GRN)
    A = []
    for k, y in enumerate(ys):
        left_at(P[k], -6.3, y)
        A.append(arrow([-3.9, y, 0], [-3.1, y, 0]))
        left_at(W[k], -2.75, y)
    s1, s2 = strike(W[0][0][2]), strike(W[0][2])
    return P, A, W, (s1, s2)


class K18_LastLn(Shot):
    def body(self):
        self.title("One More Set", 6750.3)
        P, A, W, (s1, s2) = last_rows()
        self.go(6750.85, Write(P[0]), run=0.6)
        self.go(6752.31, Write(P[1]), run=0.6)
        self.go(6754.6, Write(P[2]), run=0.7)
        self.go(6756.7, *dim(P[1], P[2]), run=0.4)
        w = W[0]
        self.go(6758.85, GrowArrow(A[0]), Write(w[0]), run=0.6)
        self.go(6760.13, Write(w[1:3]), run=0.4)
        self.go(6761.7, Create(s1), Create(s2), run=0.5)
        self.go(6762.91, Write(w[3:]), run=0.6)
        same = TX(r"same as $(\ln x)'$", 40, YEL).next_to(w, RIGHT, buff=0.6)
        self.go(6765.5, FadeIn(same, shift=LEFT * 0.1), run=0.6)
        E = M(r"\ln(5x)", "=", r"\ln 5", "+", r"\ln x", size=56)
        left_at(E, -6.3, -3.0)
        self.go(6769.25, Write(E[0]), run=0.5)
        self.go(6770.85, Write(E[1:3]), run=0.6)
        self.go(6771.97, Write(E[3:]), run=0.6)
        ue = under(E[2])
        self.go(6773.75, Create(ue), run=0.4)
        Z = M(r"(\ln 5)'", "=", "0", size=56, color=YEL).move_to([3.0, -3.0, 0])
        self.go(6776.0, Write(Z), run=0.7)
        self.go(6777.0, FadeOut(E), FadeOut(ue), FadeOut(Z), FadeOut(same), run=0.4)


class K18_LastTwo(Shot):
    def body(self):
        self.title("One More Set", animate=False)
        P, A, W, (s1, s2) = last_rows()
        P[1].set_opacity(0.3); P[2].set_opacity(0.3)
        self.add(*P, A[0], W[0], s1, s2)
        r1 = VGroup(P[0], A[0], W[0], s1, s2)
        self.go(6777.9, *dim(r1, o=0.35), *lit(P[1]), run=0.4)
        w = W[1]
        self.go(6779.91, GrowArrow(A[1]), Write(w[0]), TransformFromCopy(P[1][1], w[1]), run=0.7)
        self.go(6781.57, Write(w[2:4]), run=0.4)
        self.go(6783.13, Write(w[4:]), run=0.8)
        self.go(6785.4, *dim(P[1], A[1], W[1], o=0.35), *lit(P[2]), run=0.4)
        w = W[2]
        self.go(6787.4, GrowArrow(A[2]), Write(w[0]), run=0.4)
        self.go(6788.2, Write(w[1]), TransformFromCopy(P[2][0][2:], w[2]), Write(w[3]), run=0.7)
        self.go(6790.53, Write(w[4:6]), run=0.5)
        self.go(6792.27, Write(w[6:]), run=1.0)
        self.go(6793.4, *lit(r1, P[1], A[1], W[1]), run=0.4)
        self.wipe(6795.1)


# ================================================================ chapter recap

TRIG = [(r"\sin x", (r"\cos x",)), (r"\cos x", ("-", r"\sin x")), (r"\tan x", (r"\sec^2 x",)),
        (r"\cot x", ("-", r"\csc^2 x")), (r"\sec x", (r"\sec x\tan x",)), (r"\csc x", ("-", r"\csc x\cot x"))]


class K18_Recap(Shot):
    def body(self):
        self.title("One More Set", animate=False)
        self.title("Chapter 6 Recap", 6795.6)
        rows = []
        for k, (f, d) in enumerate(TRIG):
            y = 1.75 - 0.84 * k
            fm = M(f, size=52, color=BLUE)
            fm.move_to([-4.4 - fm.width / 2, y, 0])
            ar = arrow([-4.1, y, 0], [-3.3, y, 0])
            dm = M(*d, size=52, color=PINK)
            left_at(dm, -3.0, y)
            rows.append(VGroup(fm, ar, dm))
        for k, t in enumerate((6798.75, 6800.55, 6802.45)):
            self.go(t, Write(rows[k]), run=0.6)
        self.go(6804.3, LaggedStart(*[Write(r) for r in rows[3:]], lag_ratio=0.3), run=1.0)
        neg = VGroup(*[Circle(radius=0.2, color=YEL, stroke_width=4).move_to(rows[k][2][0]) for k in (1, 3, 5)])
        self.go(6805.4, *[Create(c) for c in neg], run=0.5)
        cou = VGroup(*[under(rows[k][0], YEL, buff=0.08, width=4) for k in (1, 3, 5)])
        self.go(6806.1, *[Create(c) for c in cou], run=0.5)
        table = VGroup(*rows)

        C1 = M(D, "f(", "g(x)", ")", size=60)
        col(C1, {1: BLUE, 2: ORG, 3: BLUE})
        C2 = M("=", "f'(", "g(x)", ")", r"\cdot", "g'(x)", size=60)
        col(C2, {1: BLUE, 2: ORG, 3: BLUE, 5: PINK})
        left_at(C1, 1.0, 1.0)
        left_at(C2, 1.0, -0.3)
        self.go(6807.7, table.animate.set_opacity(0.3), FadeOut(neg), FadeOut(cou), run=0.5)
        self.go(6808.3, Write(C1), run=0.7)
        lo = H("outside", 34, BLUE).next_to(C2[1], DOWN, buff=0.3)
        self.go(6809.4, Write(C2[0:2]), Write(C2[3]), FadeIn(lo, shift=UP * 0.1), run=0.6)
        self.go(6811.0, TransformFromCopy(C1[2], C2[2]), run=0.7)
        li = H("inside", 34, PINK).next_to(C2[5], DOWN, buff=0.3)
        self.go(6812.65, Write(C2[4:6]), FadeIn(li, shift=UP * 0.1), run=0.6)
        more = M(r"\cdot\,\cdots", size=60, color=DIM).next_to(C2, RIGHT, buff=0.2)
        self.go(6815.5, Write(more), run=0.4)
        rule = VGroup(C1, C2, more)
        tgt = rule.copy().scale(1.25).move_to([0, 0.3, 0])
        self.go(6817.6, FadeOut(table), FadeOut(lo), FadeOut(li), Transform(rule, tgt), run=0.8)
        fr = panel(rule, YEL, buff=0.4)
        self.go(6818.5, Create(fr), run=0.7)
        nx = H("next: Chapter 7", 36, DIM).next_to(fr, DOWN, buff=0.45)
        self.go(6821.9, FadeIn(nx, shift=UP * 0.1), run=0.5)
