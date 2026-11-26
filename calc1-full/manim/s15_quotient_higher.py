"""Builder 15: end of Chapter 5. The quotient rule (the swap gives the wrong sign), the rhyme low d-high minus
high d-low over low squared (pieces move into f'g - fg'), three worked quotients, simplify first, tangent lines,
horizontal tangents (live tangent to slope 0), the derivative ladder of x^4 and its notation, f'' as acceleration
(an accelerating car) and as shape (cup / frown), the chapter toolkit card, what is still missing.
Colours: high (top) = BLUE, low (bottom) = ORG, anything differentiated = PINK, answers = GRN."""
from common import *

D = r"\frac{d}{dx}"
QL = r"\left(\frac{f}{g}\right)'"   # glyphs: ( f bar g ) '


# ---------------------------------------------------------------- local helpers

def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


def col(m, cs):
    for k, c in cs.items():
        m[k].set_color(c)
    return m


def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def ql_col(m, k=0):
    """Colour f BLUE and g ORG inside the (f/g)' part k."""
    m[k][1].set_color(BLUE); m[k][3].set_color(ORG)
    return m


_GL = {}


def gl(p):
    if p not in _GL:
        _GL[p] = len(M(p)[0])
    return _GL[p]


def qfrac(num, den, pre=(), size=64, ncol=None, dcol=None):
    """M(*pre, \\frac{num}{den}) with the fraction's glyphs tagged: .n[i] = numerator piece i, .bar, .d[i], .num, .den, .fr."""
    m = M(*pre, r"\frac{" + " ".join(num) + "}{" + " ".join(den) + "}", size=size)
    fr = m[len(pre)]
    i, n, d = 0, [], []
    for p in num:
        k = gl(p); n.append(fr[i:i + k]); i += k
    nb = i
    m.bar = fr[i]; i += 1
    for p in den:
        k = gl(p); d.append(fr[i:i + k]); i += k
    m.n, m.d, m.num, m.den, m.fr = n, d, fr[:nb], fr[nb + 1:], fr
    for piece, c in zip(n, ncol or []):
        if c: piece.set_color(c)
    for piece, c in zip(d, dcol or []):
        if c: piece.set_color(c)
    return m


def on_bar(m, x, y):
    """Centre m horizontally at x with its fraction bar at height y."""
    m.move_to([x, m.get_y(), 0])
    m.shift(UP * (y - m.bar.get_y()))
    return m


def hl_table(high, dhigh, low, dlow, y0=0.3, gap=0.95, size=58, x0=-1.2):
    """'high  x^2+1 -> 2x' over 'low  x-3 -> 1' (the arrow carries a small d). Returns [(label, fn, arrow+d, deriv)]."""
    spec = (("high", BLUE, high, dhigh), ("low", ORG, low, dlow))
    As = [M(a, size=size, color=c) for _, c, a, _ in spec]
    for k, A in enumerate(As):
        A.move_to([x0 + A.width / 2, y0 - k * gap, 0])
    xa = max(A.get_right()[0] for A in As) + 0.35
    rows = []
    for k, ((lab, c, a, b), A) in enumerate(zip(spec, As)):
        y = y0 - k * gap
        L = H(lab, 40, c)
        L.move_to([x0 - 0.5 - L.width / 2, y, 0])
        ar = Arrow([xa, y, 0], [xa + 1.1, y, 0], buff=0, color=DIM, stroke_width=4, tip_length=0.2,
                   max_tip_length_to_length_ratio=0.3)
        dd = M("d", size=36, color=PINK).next_to(ar, UP, buff=0.06)
        B = M(b, size=size, color=PINK).next_to(ar, RIGHT, buff=0.3)
        rows.append((L, A, VGroup(ar, dd), B))
    return rows


def show_table(scene, rows, src_hi, src_lo, times):
    """Animate the high/low table: label + copy from the problem, then arrow + derivative, on four times."""
    (L1, A1, a1, B1), (L2, A2, a2, B2) = rows
    t1, t2, t3, t4 = times
    scene.go(t1, FadeIn(L1, shift=RIGHT * 0.1), TransformFromCopy(src_hi, A1), run=0.6)
    scene.go(t2, GrowArrow(a1[0]), FadeIn(a1[1]), Write(B1), run=0.6)
    scene.go(t3, FadeIn(L2, shift=RIGHT * 0.1), TransformFromCopy(src_lo, A2), run=0.6)
    scene.go(t4, GrowArrow(a2[0]), FadeIn(a2[1]), Write(B2), run=0.6)


def unclock(*ms):
    for m in ms:
        for x in m.get_family():
            x.clear_updaters()


# ================================================================ the quotient rule

def rule_board():
    lhs = ql_col(M(QL, "=", size=84))
    rhs = qfrac(["f'", "g", "-", "f", "g'"], ["g^2"], size=84, ncol=[PINK, ORG, None, BLUE, PINK], dcol=[ORG])
    rhs.next_to(lhs, RIGHT, buff=0.25)
    rhs.shift(UP * (lhs[1].get_y() - rhs.bar.get_y()))
    rule = VGroup(lhs, rhs).move_to([0, 0.85, 0])
    fr = panel(rule, PURP, buff=0.3)
    wrong = qfrac(["f", "g'", "-", "f'", "g"], ["g^2"], size=72, ncol=[BLUE, PINK, None, PINK, ORG], dcol=[ORG])
    on_bar(wrong, rhs.get_x(), -1.95)
    cm = cross_mark(s=0.28).next_to(wrong, RIGHT, buff=0.6)
    lab = H("wrong sign", 40, RED).next_to(wrong, LEFT, buff=0.6)
    return lhs, rhs, fr, wrong, cm, lab


class K15_QuotientRule(Shot):
    def body(self):
        self.title("Try One", animate=False)
        self.title("The Quotient Rule", 5391.6)
        lhs, rhs, fr, wrong, cm, lab = rule_board()
        q = lhs[0]
        # one function divided by another: f/g sits alone first, then gets its brackets and prime
        fg = VGroup(q[1], q[2], q[3])
        home = fg.get_center()
        fg.move_to([0, 0.85, 0])
        self.go(5393.59, Write(q[1]), run=0.4)
        self.go(5394.03, Create(q[2]), run=0.3)
        self.go(5394.95, Write(q[3]), run=0.4)
        self.go(5396.3, Circumscribe(fg, color=YEL, buff=0.12), run=0.8)
        self.go(5397.2, fg.animate.move_to(home), run=0.5)
        self.go(5397.67, Write(VGroup(q[0], q[4], q[5])), run=0.4)
        self.go(5398.09, Write(lhs[1]), run=0.3)
        self.go(5398.57, Write(rhs.n[0]), run=0.4)
        self.go(5399.15, Write(rhs.n[1]), run=0.3)
        self.go(5399.59, Write(rhs.n[2]), run=0.3)
        self.go(5400.15, Write(rhs.n[3]), run=0.4)
        self.go(5400.81, Write(rhs.n[4]), run=0.4)
        self.go(5401.27, Create(rhs.bar), run=0.4)
        self.go(5402.07, Write(rhs.den), run=0.5)
        self.go(5402.73, Create(fr), run=0.6)
        self.go(5406.0, Circumscribe(rhs.n[2], color=YEL, buff=0.12), run=0.8)
        # swap the two terms: they trade places
        self.go(5407.45, TransformFromCopy(VGroup(*rhs.n[3], *rhs.n[4]), VGroup(*wrong.n[0], *wrong.n[1]), path_arc=-PI / 3),
                TransformFromCopy(VGroup(*rhs.n[0], *rhs.n[1]), VGroup(*wrong.n[3], *wrong.n[4]), path_arc=-PI / 3),
                TransformFromCopy(rhs.n[2], wrong.n[2]), TransformFromCopy(VGroup(rhs.bar, rhs.den), VGroup(wrong.bar, wrong.den)),
                run=1.0)
        self.go(5408.9, Create(cm), FadeIn(lab, shift=RIGHT * 0.1), run=0.5)


# ================================================================ the rhyme

def rhyme_board():
    lo, hi = r"\text{low}", r"\text{high}"
    rh = qfrac([lo, r"\,d\,", hi, "-", hi, r"\,d\,", lo], [r"\text{low}^2"], size=70,
               ncol=[ORG, PINK, BLUE, None, BLUE, PINK, ORG], dcol=[ORG])
    on_bar(rh, 0, 1.0)
    tr = qfrac(["g", "f'", "-", "f", "g'"], ["g^2"], pre=[QL, "="], size=72,
               ncol=[ORG, PINK, None, BLUE, PINK], dcol=[ORG])
    ql_col(tr)
    on_bar(tr, 0, -1.75)
    return rh, tr


class K15_Rhyme(Shot):
    def body(self):
        self.title("The Quotient Rule", animate=False)
        self.add(*rule_board())
        self.wipe(5409.75)
        self.title("Low d High", 5410.4)
        rh, tr = rhyme_board()
        n = rh.n
        self.go(5412.23, Write(n[0]), run=0.5)
        self.go(5412.85, Write(n[1]), run=0.25)
        self.go(5413.09, Write(n[2]), run=0.35)
        self.go(5413.45, Write(n[3]), run=0.3)
        self.go(5414.15, Write(n[4]), run=0.3)
        self.go(5414.45, Write(n[5]), run=0.2)
        self.go(5414.67, Write(n[6]), run=0.3)
        self.go(5414.99, Create(rh.bar), run=0.4)
        self.go(5415.87, Write(rh.den), run=0.6)

        # what the words mean
        fg = qfrac(["f"], ["g"], size=90, ncol=[BLUE], dcol=[ORG]).move_to([-3.6, -1.75, 0])
        lo_l = H("low = bottom", 40, ORG).next_to(fg.den, RIGHT, buff=0.45)
        hi_l = H("high = top", 40, BLUE).next_to(fg.num, RIGHT, buff=0.45)
        dd = M("d", "=", r"\text{derivative of}", size=54)
        col(dd, {0: PINK}).move_to([3.4, -1.75, 0])
        self.go(5417.11, FadeIn(fg, shift=UP * 0.1), run=0.5)
        self.go(5418.67, Write(lo_l), run=0.6)
        self.go(5420.69, Write(hi_l), run=0.6)
        self.go(5422.09, Write(dd), run=0.8)
        self.go(5424.07, FadeOut(VGroup(fg, lo_l, hi_l, dd)), run=0.4)

        # translate, piece by piece
        u = under(VGroup(*n[0], *n[1], *n[2]))
        self.go(5424.89, Write(tr[0:2]), Create(u), run=0.6)
        self.go(5426.39, TransformFromCopy(n[0], tr.n[0]), run=0.6)
        self.go(5427.33, TransformFromCopy(VGroup(*n[1], *n[2]), tr.n[1]), run=0.6)
        self.go(5428.45, Write(tr.n[2]), run=0.3)
        self.go(5429.33, Transform(u, under(VGroup(*n[4], *n[5], *n[6]))), run=0.4)
        self.go(5431.03, TransformFromCopy(n[4], tr.n[3]), run=0.5)
        self.go(5431.85, TransformFromCopy(VGroup(*n[5], *n[6]), tr.n[4]), run=0.5)
        self.go(5434.11, Transform(u, under(rh.den)), Create(tr.bar), run=0.4)
        self.go(5434.83, TransformFromCopy(rh.den, tr.den), run=0.5)


# ================================================================ example 1: (x^2+1)/(x-3)

def ex1_board():
    p = qfrac(["x^2+1"], ["x-3"], pre=["y", "="], size=72, ncol=[BLUE], dcol=[ORG])
    on_bar(p, 0, 1.65)
    rows = hl_table("x^2+1", "2x", "x-3", "1", y0=0.35, gap=0.95, x0=-1.5)
    eqx = 1.0
    w1 = col(M("(x-3)", r"\cdot", "2x", "=", "2x^2-6x", size=60), {0: ORG, 2: PINK})
    w2 = col(M("-", "(x^2+1)", r"\cdot", "1", "=", "-x^2-1", size=60), {1: BLUE, 3: PINK})
    at_eq(w1, 3, eqx, -1.75)
    at_eq(w2, 4, eqx, -2.85)
    t1 = H("low d high", 34, DIM).move_to([-5.4, -1.75, 0])
    t2 = H("high d low", 34, DIM).move_to([-5.4, -2.85, 0])
    return p, rows, w1, w2, t1, t2


class K15_ExOne(Shot):
    def body(self):
        self.title("Low d High", animate=False)
        rh, tr = rhyme_board()
        self.add(rh, tr, under(rh.den))
        self.wipe(5435.6)
        self.title("Example 1", 5436.0)
        p, rows, w1, w2, t1, t2 = ex1_board()
        self.go(5436.6, Write(p[0:2]), run=0.3)
        self.go(5436.83, Write(p.num), run=0.8)
        self.go(5438.21, Create(p.bar), run=0.3)
        self.go(5438.75, Write(p.den), run=0.6)
        show_table(self, rows, p.num, p.den, (5440.6, 5442.9, 5444.64, 5446.8))
        (L1, A1, a1, B1), (L2, A2, a2, B2) = rows
        self.go(5447.65, FadeIn(t1, shift=RIGHT * 0.1), run=0.4)
        self.go(5449.23, TransformFromCopy(A2, w1[0]), run=0.6)
        self.go(5450.73, Write(w1[1]), run=0.3)
        self.go(5451.25, TransformFromCopy(B1, w1[2]), run=0.5)
        self.go(5451.91, Write(w1[3]), run=0.3)
        self.go(5452.75, Write(w1[4]), run=0.9)
        self.go(5454.73, Write(w2[0]), run=0.3)
        self.go(5455.99, FadeIn(t2, shift=RIGHT * 0.1), run=0.4)
        self.go(5456.93, TransformFromCopy(A1, w2[1]), run=0.6)
        self.go(5458.65, Write(w2[2]), run=0.3)
        self.go(5459.11, TransformFromCopy(B2, w2[3]), run=0.4)
        self.go(5459.6, Write(w2[4]), run=0.3)
        self.go(5460.15, Write(w2[5]), run=0.9)


def ex1_final():
    p = ex1_board()[0]
    F = qfrac(["x^2-6x-1"], ["(x-3)^2"], pre=["y'", "="], size=72, dcol=[ORG])
    F[0].set_color(PINK)
    on_bar(F, 0, -1.95)
    bx = answer_box(F)
    nt = note("leave it", F.den, direction=RIGHT, size=38, dist=1.15, angle=0.5)
    return p, F, bx, nt


class K15_ExOneTop(Shot):
    def body(self):
        self.title("Example 1", animate=False)
        p, rows, w1, w2, t1, t2 = ex1_board()
        table = VGroup(*[m for r in rows for m in r])
        self.add(p, table, w1, w2, t1, t2)
        # the minus hits both terms inside the bracket
        self.go(5463.19, Circumscribe(VGroup(w2[0], w2[1]), color=YEL, buff=0.1), run=0.6)
        self.go(5463.77, Circumscribe(w2[5], color=YEL, buff=0.1), run=0.6)

        # top, all together
        top = M("2x^2-6x", "-x^2-1", size=68).move_to([0, 0.0, 0])
        self.go(5464.49, FadeOut(VGroup(table, t1, t2, w1[0:4], w2[0:5])), run=0.5)
        self.go(5465.45, ReplacementTransform(w1[4], top[0]), ReplacementTransform(w2[5], top[1]), run=1.0)
        self.go(5468.9, Circumscribe(VGroup(top[0][0:3], top[1][0:3]), color=YEL, buff=0.1), run=0.9)
        p_, F, bx, nt = ex1_final()
        self.go(5471.43, ReplacementTransform(top, F.num), run=0.9)
        self.go(5475.29, Create(F.bar), run=0.4)
        self.go(5476.45, Write(F.den), run=0.8)
        self.go(5479.39, Write(F[0:2]), run=0.6)
        self.go(5483.45, Create(bx), run=0.6)
        self.go(5486.97, Write(nt[0]), Create(nt[1]), run=0.7)


# ================================================================ example 2: e^x / x

class K15_ExTwo(Shot):
    def body(self):
        self.title("Example 1", animate=False)
        self.add(*ex1_final())
        self.wipe(5489.25)
        self.title("Example 2", 5489.7)
        p = qfrac(["e^x"], ["x"], pre=["y", "="], size=72, ncol=[BLUE], dcol=[ORG])
        on_bar(p, 0, 1.65)
        self.go(5490.4, Write(p[0:2]), run=0.3)
        self.go(5490.69, Write(p.num), run=0.6)
        self.go(5491.75, Create(p.bar), run=0.2)
        self.go(5491.95, Write(p.den), run=0.4)
        rows = hl_table("e^x", "e^x", "x", "1", y0=0.35, gap=0.95, x0=-1.0)
        show_table(self, rows, p.num, p.den, (5493.2, 5494.95, 5496.65, 5497.95))
        (L1, A1, a1, B1), (L2, A2, a2, B2) = rows

        R = qfrac(["x", r"\,e^x", "-", "e^x", r"\cdot 1"], ["x^2"], pre=["y'", "="], size=68,
                  ncol=[ORG, PINK, None, BLUE, PINK], dcol=[ORG])
        F = qfrac([r"e^x", "(x-1)"], ["x^2"], pre=["="], size=68, dcol=[ORG])
        F.next_to(R, RIGHT, buff=0.3)
        F.shift(UP * (R.bar.get_y() - F.bar.get_y()))
        row = VGroup(R, F)
        row.shift(RIGHT * (0 - row.get_x()))
        row.shift(UP * (-2.0 - R.bar.get_y()))
        R[0].set_color(PINK)
        self.go(5498.49, Write(R[0:2]), run=0.4)
        self.go(5499.87, TransformFromCopy(A2, R.n[0]), run=0.5)
        self.go(5500.47, TransformFromCopy(B1, R.n[1]), run=0.5)
        self.go(5501.43, Write(R.n[2]), run=0.3)
        self.go(5503.15, TransformFromCopy(A1, R.n[3]), run=0.4)
        self.go(5503.6, TransformFromCopy(B2, R.n[4]), run=0.4)
        self.go(5504.51, Create(R.bar), run=0.3)
        self.go(5505.07, Write(R.den), run=0.4)
        self.go(5506.91, Circumscribe(R.n[1], color=YEL, buff=0.08), Circumscribe(R.n[3], color=YEL, buff=0.08), run=0.8)
        self.go(5508.13, Write(F[0]), TransformFromCopy(R.n[3], F.n[0]), run=0.6)
        self.go(5509.35, Write(F.n[1]), run=0.7)
        self.go(5510.79, Create(F.bar), Write(F.den), run=0.5)
        self.play(Create(answer_box(F.fr)), run_time=0.4)


# ================================================================ try one: x / (x+1)

class K15_TryThree(Shot):
    def body(self):
        self.title("Try One", animate=False)
        p = qfrac(["x"], ["x+1"], pre=["y", "="], size=76, ncol=[BLUE], dcol=[ORG])
        on_bar(p, 0, 1.2)
        self.go(5513.63, Write(p[0:2]), Write(p.num), run=0.4)
        self.go(5513.95, Create(p.bar), run=0.2)
        self.go(5514.17, Write(p.den), run=0.5)
        R = qfrac(["(x+1)", r"\cdot 1", "-", "x", r"\cdot 1"], ["(x+1)^2"], pre=["y'", "="], size=68,
                  ncol=[ORG, PINK, None, BLUE, PINK], dcol=[ORG])
        F = qfrac(["1"], ["(x+1)^2"], pre=["="], size=68, dcol=[ORG])
        F.next_to(R, RIGHT, buff=0.3)
        F.shift(UP * (R.bar.get_y() - F.bar.get_y()))
        row = VGroup(R, F)
        row.shift(RIGHT * (0 - row.get_x()) + UP * (-1.3 - R.bar.get_y()))
        R[0].set_color(PINK)
        t1 = H("low d high", 34, DIM).next_to(VGroup(*R.n[0:2]), UP, buff=0.35)
        self.go(5515.07, Write(R[0:2]), FadeIn(t1, shift=DOWN * 0.1), run=0.5)
        self.go(5516.43, TransformFromCopy(p.den, R.n[0]), run=0.6)
        self.go(5517.69, Write(R.n[1]), run=0.4)
        self.go(5518.31, Write(R.n[2]), run=0.3)
        t2 = H("high d low", 34, DIM).next_to(VGroup(*R.n[3:5]), UP, buff=0.35)
        self.go(5519.09, TransformFromCopy(p.num, R.n[3]), FadeIn(t2, shift=DOWN * 0.1), run=0.5)
        self.go(5519.67, Write(R.n[4]), run=0.4)
        self.go(5520.75, Create(R.bar), Write(R.den), FadeOut(t1), FadeOut(t2), run=0.6)
        x_in = R.n[0][1]
        self.go(5522.87, Circumscribe(x_in, color=YEL, buff=0.06), run=0.6)
        self.go(5524.25, Create(strike(x_in)), Create(strike(VGroup(R.n[2], R.n[3]))), run=0.5)
        self.go(5525.51, Write(F[0]), Write(F.n[0]), run=0.5)
        self.go(5525.91, Create(F.bar), run=0.3)
        self.go(5526.57, TransformFromCopy(R.den, F.den), run=0.7)
        F.n[0].set_color(GRN)
        self.go(5528.9, Create(answer_box(F.fr)), run=0.6)
        self.play(Create(tick_mark(s=0.45).next_to(F, RIGHT, buff=0.45)), run_time=0.4)
        self.wipe(5531.2)


# ================================================================ simplify first

class K15_SimplifyFirst(Shot):
    def body(self):
        self.title("Try One", animate=False)
        self.title("Simplify First", 5532.83)
        eqx = -1.6
        r1 = M("y", "=", r"\frac{x^3+2x}{x}", "=", "x^2+2", size=64)
        r1[2][0:5].set_color(BLUE); r1[2][6:].set_color(ORG)
        at_eq(r1, 1, eqx, 1.35)
        self.go(5537.35, Write(r1[0:2]), Write(r1[2][0:5]), run=0.7)
        self.go(5539.07, Write(r1[2][5:]), run=0.5)
        self.go(5540.49, Circumscribe(r1[2], color=YEL, buff=0.1), run=0.8)
        self.go(5541.89, Write(r1[3]), TransformFromCopy(r1[2], r1[4]), run=0.8)
        r2 = col(M("y'", "=", "2x", size=64), {0: PINK, 2: GRN})
        at_eq(r2, 1, eqx, -0.15)
        self.go(5543.49, Write(r2[0:2]), run=0.5)
        self.go(5544.99, Write(r2[2]), run=0.5)
        self.go(5546.07, Create(answer_box(r2[2])), run=0.5)
        lng = M(r"\frac{x\,(3x^2+2)-(x^3+2x)}{x^2}", "=", r"\frac{2x^3}{x^2}", "=", "2x", size=48, color=DIM)
        lng.move_to([0.6, -2.35, 0])
        lab = H("quotient rule:", 34, DIM).next_to(lng, LEFT, buff=0.35)
        self.go(5547.65, FadeIn(lab, shift=RIGHT * 0.1), Write(lng[0]), run=1.0)
        self.go(5549.71, Write(lng[1:]), run=0.8)
        self.go(5551.43, Circumscribe(VGroup(lab, lng), color=DIM, buff=0.12), run=1.0)
        self.wipe(5554.75)

        r3 = M("y", "=", r"\frac{5}{x^2}", "=", "5x^{-2}", size=64)
        r3[2][0].set_color(BLUE); r3[2][2:].set_color(ORG)
        at_eq(r3, 1, eqx, 1.35)
        self.go(5556.27, Write(r3[0:2]), Write(r3[2]), run=0.8)
        self.go(5559.59, Write(r3[3]), TransformFromCopy(r3[2], r3[4]), run=0.9)
        pr = H("power rule", 38, PINK)
        r4 = col(M("y'", "=", "-10x^{-3}", size=64), {0: PINK, 2: GRN})
        at_eq(r4, 1, eqx, -0.15)
        pr.next_to(r4, LEFT, buff=0.6)
        self.go(5562.85, FadeIn(pr, shift=RIGHT * 0.1), Write(r4[0:2]), run=0.5)
        self.go(5563.83, Write(r4[2]), run=1.0)
        self.go(5566.07, Create(answer_box(r4[2])), run=0.5)
        hard = qfrac(["x^2+1"], ["x-3"], size=60, ncol=[BLUE], dcol=[ORG])
        on_bar(hard, 1.6, -2.35)
        qp = pill("quotient rule", YEL, size=36).move_to([-2.6, -2.35, 0])
        ar = Arrow(qp.get_right(), hard.get_left(), buff=0.25, color=YEL, stroke_width=4, tip_length=0.2)
        self.go(5567.57, FadeIn(qp, shift=RIGHT * 0.1), run=0.5)
        self.go(5568.5, GrowArrow(ar), Write(hard), run=0.7)
        self.go(5569.81, Circumscribe(hard.den, color=ORG, buff=0.08), run=0.8)
        self.wipe(5571.8)


# ================================================================ tangent lines

class K15_Tangent(Shot):
    def body(self):
        self.title("Simplify First", animate=False)
        self.title("Tangent Lines", 5572.85)
        f = lambda x: x ** 3 - 2 * x
        ax = axes((-2, 3, 1), (-2, 10, 2), x_length=5.2, y_length=4.9, center=(-3.75, -0.75, 0), num_size=28)
        c = curve(ax, f, [-1.72, 2.42])
        eqx, Y = 2.1, [1.75, 0.8, -0.15, -1.1, -2.05, -3.0]
        r0 = at_eq(col(M("y", "=", "x^3-2x", size=52), {0: BLUE, 2: BLUE}), 1, eqx, Y[0])
        x2 = M("x=2", size=52, color=ORG).next_to(r0, RIGHT, buff=0.6)
        self.go(5574.95, Create(ax), FadeIn(ax.labels), run=0.8)
        self.go(5576.93, Write(r0), draw(c, 1.2, BLUE), run=1.2)
        g2 = DashedLine(ax.c2p(2, 0), ax.c2p(2, 4), color=ORG, stroke_width=3, dash_length=0.08)
        self.go(5579.81, Write(x2), Create(g2), run=0.6)
        r1 = at_eq(M("y(2)", "=", "8-4", "=", "4", size=52), 1, eqx, Y[1])
        col(r1, {4: ORG})
        self.go(5582.39, Write(r1[0:2]), run=0.5)
        self.go(5584.33, Write(r1[2]), run=0.6)
        self.go(5585.49, Write(r1[3:5]), run=0.4)
        P = pt(ax, 2, 4)
        pl = M("(2,\\,4)", size=40, color=ORG).next_to(P, LEFT, buff=0.2)
        self.go(5587.03, FadeIn(P, scale=0.5), Write(pl), run=0.6)
        r2 = at_eq(col(M("y'", "=", "3x^2-2", size=52), {0: PINK, 2: PINK}), 1, eqx, Y[2])
        self.go(5590.05, Write(r2[0:2]), run=0.4)
        self.go(5590.91, Write(r2[2]), run=0.8)
        r3 = at_eq(M("y'(2)", "=", "12-2", "=", "10", size=52), 1, eqx, Y[3])
        col(r3, {0: PINK, 4: PINK})
        self.go(5592.67, Write(r3[0:2]), run=0.4)
        self.go(5593.61, Write(r3[2]), run=0.6)
        tl = curve(ax, lambda x: 10 * x - 16, [1.45, 2.55], color=PINK)
        self.go(5595.15, Write(r3[3:5]), draw(tl, 0.6, PINK), run=0.6)
        r4 = at_eq(M("y-4", "=", "10", "(x-2)", size=52), 1, eqx, Y[4])
        col(r4, {2: PINK})
        self.go(5595.85, Write(r4[0:2]), run=0.6)
        self.go(5597.89, Write(r4[2]), run=0.3)
        self.go(5598.63, Write(r4[3]), run=0.6)
        r4b = at_eq(M("y-4", "=", "10", "x-20", size=52), 1, eqx, Y[4])
        col(r4b, {2: PINK})
        self.go(5602.01, ReplacementTransform(r4[0:3], r4b[0:3]), ReplacementTransform(r4[3], r4b[3]), run=0.8)
        r5 = at_eq(M("y", "=", "10x-16", size=52), 1, eqx, Y[5])
        r5[2].set_color(GRN)
        self.go(5604.11, Write(r5[0:2]), run=0.4)
        self.go(5604.91, Write(r5[2]), run=0.8)
        self.go(5606.03, Create(answer_box(r5)), run=0.5)
        self.go(5607.61, Circumscribe(r2, color=PINK, buff=0.1), run=0.9)
        self.wipe(5609.4)


# ================================================================ horizontal tangents

class K15_Horizontal(Shot):
    def body(self):
        self.title("Tangent Lines", animate=False)
        self.title("Horizontal Tangents", 5610.6)
        f = lambda x: x ** 3 - 3 * x
        ax = axes((-3, 3, 1), (-4, 4, 2), x_length=5.6, y_length=4.8, center=(-3.55, -0.7, 0), num_size=28)
        c = curve(ax, f, [-2.12, 2.12])
        self.go(5612.2, Create(ax), FadeIn(ax.labels), run=0.6)
        self.go(5612.85, draw(c, 1.0, BLUE), run=1.0)
        xt = ValueTracker(-1.9)
        lt = live_tangent(ax, f, xt, length=2.2, readout_pos=np.array([-5.5, 1.6, 0]), size=40)
        self.go(5614.15, FadeIn(lt), run=0.4)
        self.play(xt.animate.set_value(-1.0), run_time=2.6)   # lands on slope 0.0 at "slope 0"
        eqx = 2.2
        rule = col(M("f'(x)", "=", "0", size=60), {0: PINK, 2: YEL})
        at_eq(rule, 1, eqx, 1.75)
        rb = box(rule, YEL, buff=0.15)
        self.go(5618.83, Write(rule), run=0.7)
        self.go(5620.49, Create(rb), run=0.5)

        Y = [1.75, 0.8, -0.15, -1.1, -2.05]
        r0 = at_eq(col(M("f(x)", "=", "x^3-3x", size=54), {0: BLUE, 2: BLUE}), 1, eqx, Y[0])
        unclock(lt)
        self.go(5622.33, FadeOut(lt), FadeOut(VGroup(rule, rb), shift=UP * 0.2), run=0.4)
        self.go(5622.75, Write(r0), run=0.8)
        r1 = at_eq(col(M("f'(x)", "=", "3x^2-3", size=54), {0: PINK, 2: PINK}), 1, eqx, Y[1])
        self.go(5627.57, Write(r1[0:2]), run=0.4)
        self.go(5628.49, Write(r1[2]), run=0.8)
        r2 = at_eq(M("3x^2-3", "=", "0", size=54), 1, eqx, Y[2])
        self.go(5630.15, TransformFromCopy(r1[2], r2[0]), Write(r2[1:]), run=0.7)
        r2b = at_eq(M("3x^2", "=", "3", size=54), 1, eqx, Y[2])
        self.go(5632.03, ReplacementTransform(r2, r2b), run=0.7)
        r3 = at_eq(M("x^2", "=", "1", size=54), 1, eqx, Y[3])
        self.go(5633.45, Write(r3), run=0.7)
        r4 = at_eq(M("x", "=", "1", r"\ \ \text{or}\ \ ", "x", "=", "-1", size=54), 1, eqx, Y[4])
        col(r4, {2: ORG, 6: ORG, 3: DIM})
        self.go(5635.11, Write(r4[0:3]), run=0.6)
        self.go(5636.67, Write(r4[3:]), run=0.7)

        t1, t2 = tangent(ax, f, 1, 1.8), tangent(ax, f, -1, 1.8)
        d1, d2 = pt(ax, 1, -2, ORG), pt(ax, -1, 2, ORG)
        self.go(5639.53, Create(t1), FadeIn(d1, scale=0.5), run=0.5)
        self.go(5640.81, Create(t2), FadeIn(d2, scale=0.5), run=0.5)
        self.go(5641.9, Create(answer_box(r4)), run=0.5)
        hill = H("hill", 38, YEL).next_to(d2, UP, buff=0.35)
        val = H("valley", 38, YEL).next_to(d1, DOWN, buff=0.35)
        self.go(5643.43, FadeIn(hill, shift=DOWN * 0.1), run=0.4)
        self.go(5643.95, FadeIn(val, shift=UP * 0.1), run=0.4)
        self.go(5646.41, Circumscribe(t1, color=PINK, buff=0.08), Circumscribe(t2, color=PINK, buff=0.08), run=0.9)
        self.go(5649.67, Circumscribe(r1, color=YEL, buff=0.1), run=0.9)
        self.wipe(5651.15)


# ================================================================ higher derivatives

LADDER_Y = [1.8, 0.85, -0.1, -1.05, -2.0, -2.95]
LADDER_X = -1.0


def ladder():
    """Rows f(x) = x^4, first = 4x^3, ... fifth = 0. Returns (labels, eqs, exprs, arrows, zeros)."""
    words = ["first", "second", "third", "fourth", "fifth"]
    exprs = ["x^4", "4x^3", "12x^2", "24x", "24", "0"]
    labs, eqs, rs, arrs = VGroup(), VGroup(), VGroup(), VGroup()
    for k, (y, e) in enumerate(zip(LADDER_Y, exprs)):
        L = M("f(x)", size=56, color=BLUE) if k == 0 else H(words[k - 1], 42, DIM)
        L.move_to([LADDER_X - 0.35 - L.width / 2, y, 0])
        E = M("=", size=56).move_to([LADDER_X, y, 0])
        R = M(e, size=56, color=BLUE if k == 0 else PINK)
        R.move_to([LADDER_X + 0.35 + R.width / 2, y, 0])
        labs.add(L); eqs.add(E); rs.add(R)
    for k in range(5):
        a = CurvedArrow([1.35, LADDER_Y[k] - 0.08, 0], [1.35, LADDER_Y[k + 1] + 0.08, 0], angle=-1.4, color=PINK,
                        stroke_width=3, tip_length=0.14)
        a.set_stroke(opacity=0.7)
        arrs.add(a)
    zeros = M(r"0,\ 0,\ \dots", size=50, color=DIM).move_to([3.4, LADDER_Y[5], 0])
    return labs, eqs, rs, arrs, zeros


class K15_Higher(Shot):
    def body(self):
        self.title("Horizontal Tangents", animate=False)
        self.title("Higher Derivatives", 5654.19)
        A = M("f'", size=80, color=PINK)
        B = M("(f')'", size=80, color=PINK)
        C = M("((f')')'", size=80, color=PINK)
        ar = [Arrow(ORIGIN, RIGHT * 1.6, buff=0, color=DIM, stroke_width=4, tip_length=0.22) for _ in range(2)]
        row = VGroup(A, ar[0], B, ar[1], C).arrange(RIGHT, buff=0.45).move_to([0, 0.5, 0])
        dd = [M(D, size=40, color=PINK).next_to(a, UP, buff=0.12) for a in ar]
        ls = [H(s, 40, DIM).next_to(m, DOWN, buff=0.45) for s, m in (("derivative", A), ("second", B), ("third", C))]
        for l in ls:
            l.set_y(-0.6)
        self.go(5656.87, Write(A), FadeIn(ls[0], shift=UP * 0.1), run=0.6)
        self.go(5659.35, GrowArrow(ar[0]), FadeIn(dd[0]), run=0.5)
        self.go(5659.85, Write(B), run=0.6)
        self.go(5662.11, FadeIn(ls[1], shift=UP * 0.1), run=0.5)
        self.go(5663.61, GrowArrow(ar[1]), FadeIn(dd[1]), Write(C), FadeIn(ls[2], shift=UP * 0.1), run=0.7)
        self.wipe(5665.0)

        labs, eqs, rs, arrs, zeros = ladder()
        self.go(5666.01, Write(VGroup(labs[0], eqs[0])), run=0.6)
        self.go(5667.09, Write(rs[0]), run=0.5)
        times = [(5668.07, 5669.31), (5670.59, 5671.95), (5673.17, 5674.61), (5675.91, 5676.53), (5677.85, 5678.23)]
        for k, (tl, te) in enumerate(times, start=1):
            self.go(tl, FadeIn(labs[k], shift=RIGHT * 0.1), Write(eqs[k]), Create(arrs[k - 1]), run=0.5)
            self.go(te, TransformFromCopy(rs[k - 1], rs[k]), run=0.6)
        self.go(5679.77, Write(zeros), run=0.8)


class K15_Notation(Shot):
    def body(self):
        self.title("Higher Derivatives", animate=False)
        labs, eqs, rs, arrs, zeros = ladder()
        self.add(labs, eqs, rs, arrs, zeros)
        names = ["f'(x)", "f''(x)", "f'''(x)", "f^{(4)}(x)", "f^{(5)}(x)"]
        new = []
        for k, s in enumerate(names, start=1):
            m = M(s, size=56, color=PINK)
            m.move_to([LADDER_X - 0.35 - m.width / 2, LADDER_Y[k], 0])
            new.append(m)
        for k, t in zip(range(5), (5682.07, 5683.37, 5686.67, 5692.45, 5693.63)):
            self.go(t, ReplacementTransform(labs[k + 1], new[k]), run=0.7)
        lz = M(r"\frac{d^2y}{dx^2}", size=64, color=PINK).move_to([4.3, LADDER_Y[2], 0])
        lt = H("Leibniz", 38, DIM).next_to(lz, UP, buff=0.3)
        self.go(5694.95, FadeIn(lt, shift=DOWN * 0.1), run=0.5)
        self.go(5696.61, Circumscribe(new[1], color=YEL, buff=0.1), run=0.8)
        self.go(5698.03, Write(lz[0][0:3]), run=0.5)
        self.go(5699.09, Write(lz[0][3:]), run=0.6)
        self.play(Circumscribe(lz, color=YEL, buff=0.1), run_time=0.7)
        self.wipe(5700.5)


# ================================================================ what f'' means

def car():
    """Side view of a small car, facing right, wheels resting on y = 0 (as in K10)."""
    body = VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners(
        [[-0.78, 0.14, 0], [0.78, 0.14, 0], [0.8, 0.38, 0], [0.42, 0.44, 0], [0.2, 0.7, 0], [-0.4, 0.7, 0],
         [-0.6, 0.44, 0], [-0.8, 0.4, 0], [-0.78, 0.14, 0]])
    win = VGroup(Line([-0.5, 0.44, 0], [0.36, 0.44, 0], color=DIM, stroke_width=3),
                 Line([-0.08, 0.44, 0], [-0.08, 0.68, 0], color=DIM, stroke_width=3))
    light = Line([0.7, 0.3, 0], [0.8, 0.3, 0], color=YEL, stroke_width=4)
    wheels = VGroup(*[Circle(radius=0.15, stroke_color=CHALK, stroke_width=4, fill_color=config.background_color,
                             fill_opacity=1).move_to([x, 0.15, 0]) for x in (-0.45, 0.45)])
    hubs = VGroup(*[Dot([x, 0.15, 0], radius=0.035, color=DIM) for x in (-0.45, 0.45)])
    return VGroup(body, win, light, wheels, hubs)


def shape_board():
    """Cup and frown with sliding tangents (trackers start at -1.5), their f'' signs and the Chapter 9 tag."""
    cup_ax = Axes(x_range=[-2, 2], y_range=[-0.5, 3], x_length=4, y_length=3.2).move_to([-3.4, -0.3, 0])
    fr_ax = Axes(x_range=[-2, 2], y_range=[-3, 0.5], x_length=4, y_length=3.2).move_to([3.4, -0.3, 0])
    fc, ff2 = (lambda x: 0.6 * x * x), (lambda x: -0.6 * x * x)
    cu = curve(cup_ax, fc, [-1.9, 1.9])
    fw = curve(fr_ax, ff2, [-1.9, 1.9])
    xa, xb = ValueTracker(-1.5), ValueTracker(-1.5)
    ta = always_redraw(lambda: tangent(cup_ax, fc, xa.get_value(), 1.5))
    tb = always_redraw(lambda: tangent(fr_ax, ff2, xb.get_value(), 1.5))
    la = M("f''", ">", "0", size=56, color=PINK).next_to(cu, DOWN, buff=0.45)
    lbb = M("f''", "<", "0", size=56, color=PINK).next_to(fw, DOWN, buff=0.45)
    cl = H("cup", 38, YEL).next_to(cu, UP, buff=0.2)
    frl = H("frown", 38, YEL).next_to(fw, UP, buff=0.2)
    lbb.set_y(min(la.get_y(), lbb.get_y())); la.set_y(lbb.get_y())
    yy = max(cl.get_y(), frl.get_y()); cl.set_y(yy); frl.set_y(yy)
    ch = H("Chapter 9", 36, DIM).move_to([0, -3.3, 0])
    return cu, fw, ta, tb, xa, xb, la, lbb, cl, frl, ch


class K15_SecondMeaning(Shot):
    def body(self):
        self.title("Higher Derivatives", animate=False)
        self.title("The Second Derivative", 5701.6)
        ff = M("f''", "=", r"(f')'", size=80)
        col(ff, {0: PINK, 2: PINK}).move_to([0, 0.6, 0])
        self.go(5703.73, Write(ff), run=0.8)

        s = M("s", size=72, color=BLUE)
        v = M("v", "=", "s'", size=72); col(v, {0: PINK, 2: PINK})
        a = M("a", "=", "s''", size=72); col(a, {0: PINK, 2: PINK})
        ars = [Arrow(ORIGIN, RIGHT * 1.4, buff=0, color=DIM, stroke_width=4, tip_length=0.2) for _ in range(2)]
        chain = VGroup(s, ars[0], v, ars[1], a).arrange(RIGHT, buff=0.45).move_to([0, 1.5, 0])
        for m in (v, a):
            m.shift(UP * (s.get_y() - m[0].get_y()))
        lb = [H(t, 36, DIM).next_to(m, DOWN, buff=0.3) for t, m in (("position", s), ("velocity", v), ("acceleration", a))]
        for l in lb:
            l.set_y(0.75)
        self.go(5705.63, FadeOut(ff, shift=DOWN * 0.2), run=0.4)
        self.go(5706.23, Write(s), FadeIn(lb[0], shift=UP * 0.1), run=0.6)
        self.go(5707.87, GrowArrow(ars[0]), run=0.4)
        self.go(5708.89, Write(v), FadeIn(lb[1], shift=UP * 0.1), run=0.6)
        self.go(5711.33, GrowArrow(ars[1]), run=0.4)
        self.go(5712.43, Write(a), FadeIn(lb[2], shift=UP * 0.1), run=0.6)

        road = Line([-6.6, -2.7, 0], [6.6, -2.7, 0], color=DIM, stroke_width=3)
        cr = car().scale(1.4)
        x0 = -5.0
        cr.move_to([x0, -2.7 + cr.height / 2, 0])
        self.go(5715.35, Create(road), FadeIn(cr, shift=RIGHT * 0.1), run=0.6)
        u = ValueTracker(0)
        base = cr.get_center()
        cr.add_updater(lambda m: m.move_to(base + RIGHT * 9.0 * u.get_value() ** 2))
        va = always_redraw(lambda: Arrow(cr.get_top() + UP * 0.25 + LEFT * 0.3,
                                         cr.get_top() + UP * 0.25 + LEFT * 0.3 + RIGHT * (0.05 + 2.4 * u.get_value()),
                                         buff=0, color=PINK, stroke_width=5, tip_length=0.2,
                                         max_tip_length_to_length_ratio=0.5))
        vl = always_redraw(lambda: M("v", size=40, color=PINK).next_to(va, LEFT, buff=0.12))
        self.add(va, vl)
        self.go(5716.55, u.animate.set_value(1), run=3.2, rate_func=linear)
        unclock(cr, va, vl)
        push = Arrow(cr.get_left() + RIGHT * 0.5 + UP * 0.2, cr.get_left() + LEFT * 0.9 + UP * 0.2, buff=0,
                     color=YEL, stroke_width=5, tip_length=0.2)
        pl = H("push", 36, YEL).next_to(push, LEFT, buff=0.15)
        self.go(5719.91, GrowArrow(push), FadeIn(pl, shift=LEFT * 0.1), run=0.5)
        self.go(5721.45, Circumscribe(a, color=YEL, buff=0.12), run=0.8)

        self.wipe(5722.5)
        self.title("Shape of a Graph", 5725.2)
        cu, fw, ta, tb, xa, xb, la, lbb, cl, frl, ch = shape_board()
        self.go(5727.25, draw(cu, 0.6, BLUE), run=0.6)
        self.add(ta)
        self.play(xa.animate.set_value(1.5), run_time=0.8)
        self.go(5728.71, draw(fw, 0.6, BLUE), run=0.6)
        self.add(tb)
        self.play(xb.animate.set_value(1.5), run_time=0.8)
        self.play(FadeIn(cl), FadeIn(frl), Write(la), Write(lbb), run_time=0.7)
        self.go(5731.65, FadeIn(ch, shift=UP * 0.1), run=0.4)


# ================================================================ the toolkit

TK_LEFT = [([r"(c)'", "=", "0"], 5737.99), ([r"(x^n)'", "=", r"n\,x^{n-1}"], 5740.21),
           ([r"\sqrt{x}", "=", r"x^{1/2}"], 5744.95), ([r"(c\,f)'", "=", r"c\,f'"], 5747.21),
           ([r"(f+g)'", "=", r"f'+g'"], 5750.17)]
TK_RIGHT = [([r"(e^x)'", "=", "e^x"], 5751.03), ([r"(a^x)'", "=", r"a^x\ln a"], 5753.97),
            ([r"(\ln x)'", "=", r"\frac{1}{x}"], 5757.83), ([r"(f\,g)'", "=", r"f'g+f\,g'"], 5761.27),
            ([QL, "=", r"\frac{f'g-f\,g'}{g^2}"], 5765.31)]
TK_Y = [1.75, 0.8, -0.15, -1.1, -2.2]


def toolkit():
    rows = []
    for parts, x in ((TK_LEFT, -3.2), (TK_RIGHT, 3.0)):
        for (p, t), y in zip(parts, TK_Y):
            m = M(*p, size=50)
            m[2].set_color(PINK)
            if p[0] == r"\sqrt{x}":
                m.set_color(DIM)
            rows.append((at_eq(m, 1, x, y), t))
    rows.sort(key=lambda r: r[1])
    last = col(M("f''", "=", r"(f')'", size=50), {2: PINK})
    at_eq(last, 1, 0, -3.25)
    return [r for r, _ in rows], [t for _, t in rows], last


class K15_Toolkit(Shot):
    def body(self):
        self.title("Shape of a Graph", animate=False)
        cu, fw, ta, tb, xa, xb, la, lbb, cl, frl, ch = shape_board()
        xa.set_value(1.5); xb.set_value(1.5)
        self.add(cu, fw, ta, tb, la, lbb, cl, frl, ch)
        unclock(ta, tb)
        self.wipe(5732.4)
        self.title("The Whole Toolkit", 5733.5)
        rows, times, last = toolkit()
        prev = None
        for m, t in zip(rows, times):
            anims = [Write(m)]
            if prev is not None:
                anims.append(prev.animate.set_opacity(0.6))
            self.go(t, *anims, run=0.7)
            prev = m
        q = rows[-1][2]   # f'g - fg' over g^2: glyphs f ' g - f g ' bar g 2
        u = under(q[0:3])
        self.go(5766.35, Create(u), run=0.3)
        self.go(5767.67, Transform(u, under(q[4:7])), run=0.3)
        self.go(5768.55, Transform(u, under(q[8:10])), run=0.3)
        self.go(5770.79, FadeOut(u), prev.animate.set_opacity(0.6), Write(last), run=0.7)


class K15_Missing(Shot):
    def body(self):
        self.title("The Whole Toolkit", animate=False)
        rows, times, last = toolkit()
        for m in rows:
            m.set_opacity(0.6)
        self.add(*rows, last)
        card = VGroup(*rows, last)
        self.go(5775.15, card.animate.set_opacity(1), run=0.6)
        fr = RoundedRectangle(width=13.4, height=card.height + 0.4, corner_radius=0.3, stroke_color=GRN,
                              stroke_width=4).move_to(card)
        self.go(5776.09, Create(fr), run=0.8)
        self.wipe(5778.33)
        self.title("Still Missing", 5778.8)
        t = M(D, r"\sin x", "=", r"\ \text{?}", size=66)
        col(t, {1: BLUE, 3: YEL}).move_to([-3.4, 0.4, 0])
        c = M(D, "f(", "g(x)", ")", "=", r"\ \text{?}", size=66)
        col(c, {1: BLUE, 2: ORG, 3: BLUE, 5: YEL}).move_to([3.4, 0.4, 0])
        tl = H("trig functions", 38, DIM).next_to(t, DOWN, buff=0.5)
        cl = H("a function inside a function", 38, DIM).next_to(c, DOWN, buff=0.5)
        self.go(5780.27, Write(t), FadeIn(tl, shift=UP * 0.1), run=0.8)
        self.go(5782.31, Write(c), FadeIn(cl, shift=UP * 0.1), run=0.8)
        self.go(5785.21, Circumscribe(t[3], color=YEL, buff=0.1), Circumscribe(c[5], color=YEL, buff=0.1), run=0.8)
