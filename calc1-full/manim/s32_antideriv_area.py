"""Builder 32: middle of Chapter 11 "Antiderivatives and the Area Problem" (3:18:47.24 - 3:25:56.18).
Check -x^{-2} by differentiating; the integral of 2 sin x + 3e^x (each piece turns into its antiderivative); (x^2+1)/x
split into x + 1/x -> x^2/2 + ln|x| + C; no product rule: (x+1)^2 expanded first; the rewrite-first rules; three
practice integrals; an initial value problem: f' = 6x^2 - 2x, f(1) = 4, the family 2x^3 - x^2 + C on a graph and the
one curve through (1, 4) lighting up; s -> v -> a by d/dt and back by integrals; the ball from chapter 8: a = -10,
v = -10t + C with the line family and v(0) = 20 picking C = 20, s = -5t^2 + 20t + D with the parabola family and
s(0) = 0 picking D = 0, the ball flying while the dot rides the curve. Then the area problem: rectangle, triangle,
circle formulas; area under y = x^2 on [0, 2]; 4 right-end rectangles (heights 0.25, 1, 2.25, 4 -> 3.75, the RED
pieces poking out), left ends (0, 0.25, 1, 2.25 -> 1.75, the YEL gaps), midpoints (-> 2.625, both kinds balance),
a three-line tally; then n = 4 -> 8 -> 16 -> 64 -> 100 -> a million with the estimate readout converging and the RED
waste shrinking, the exact area as a limit; the setup with n rectangles: dx = 2/n, right ends 2/n, 4/n.
Colours: functions BLUE, derivatives / velocity PINK, acceleration PURP, integrals / areas / answers GRN, constants YEL,
numbers ORG, waste RED.
Whisper mishearings fixed: "integral of x squared plus one over x" = (x^2 + 1)/x (it is split into x + 1/x);
"zero point five, one, and one point five" (left ends) = 0, 0.5, 1, 1.5 with heights 0, 0.25, 1, 2.25. The voice
uses gravity -10 (not -9.8).
END SEAM (K32_Limit ends at 3:25:56.18): title "Using n Rectangles"; the area axes from area_axes() (x 0..2.5,
y 0..4.5, x_length 6.0, y_length 4.6, centre (-2.7, -0.35)), x number labels faded out, y labels 1-4 FAINT, curve
y = x^2 BLUE on [0, 2.1]; 8 right-end rectangles (riemann rule="right", GRN 0.45, stroke 2); right column (x = 3.7):
"y = x^2, 0 <= x <= 2" at y 1.4 (BLUE/ORG, size 50), "n rectangles" at y 0.5 (TX size 44), "Delta x = 2/n" at y -0.75
(size 56, all ORG but the "="); ORG dots on the x-axis at x = 0.25 and 0.5 with ORG labels 2/n and
4/n (size 40) below the axis: the i-th right end 2i/n comes next."""
from common import *

D = r"\frac{d}{dx}"
ARC = 0.55 * PI


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def st(*parts, eq=1, x=0.0, y=0.0, size=60, c=None):
    """One worked line aligned on its part eq; c = {part index: colour}."""
    m = M(*parts, size=size)
    for k, col in (c or {}).items():
        m[k].set_color(col)
    return at_eq(m, eq, x, y)


def unclock(*ms):
    for m in ms:
        for x in m.get_family():
            x.clear_updaters()


def arr(a, b, color, w=5, tip=0.22):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, color=color, stroke_width=w, tip_length=tip,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


def clipped(ax, f, x0, x1, y0, y1, **k):
    """A curve cut to the part that stays inside the axes box."""
    xs = np.linspace(x0, x1, 800)
    inside = xs[[(y0 <= f(x) <= y1) for x in xs]]
    return curve(ax, f, [inside.min(), inside.max()], **k)


def hand():
    """An open palm seen from the side: a shallow cup."""
    cup = Arc(radius=0.42, start_angle=PI + 0.35, angle=PI - 0.7, color=CHALK, stroke_width=5)
    thumb = Line(cup.get_start(), cup.get_start() + UP * 0.12 + LEFT * 0.05, color=CHALK, stroke_width=5)
    return VGroup(cup, thumb)


def chalk_ball(p, r=0.16):
    return Circle(radius=r, stroke_color=CHALK, stroke_width=4, fill_color=CHALK, fill_opacity=0.3).move_to(p).set_z_index(8)


# ---------------------------------------------------------------- the area board (shared by every area shot)

def F(x):
    return x * x


def area_axes():
    ax = axes(x_range=(0, 2.5, 0.5), y_range=(0, 4.5, 1), x_length=6.0, y_length=4.6, center=(-2.7, -0.35, 0), nums=False)
    ax.xl = VGroup(*[M(f"{v:g}", size=30, color=FAINT).next_to(ax.c2p(v, 0), DOWN, buff=0.12) for v in (0.5, 1, 1.5, 2)])
    ax.yl = VGroup(*[M(f"{v}", size=30, color=FAINT).next_to(ax.c2p(0, v), LEFT, buff=0.12) for v in (1, 2, 3, 4)])
    return ax


def area_board():
    ax = area_axes()
    return ax, curve(ax, F, [0, 2.1]).set_z_index(3)


RULE_X = {"left": 0.0, "right": 1.0, "midpoint": 0.5}


def rects(ax, n, rule="right"):
    g = riemann(ax, F, 0, 2, n, rule=rule)
    g.set_stroke(width=min(2.0, 40 / n))
    return g


def bits(ax, n, rule, over=True):
    """The pieces between the rectangle tops and the curve: over = RED bits poking out, else YEL gaps."""
    w = 2 / n
    g = VGroup()
    for i in range(n):
        a, b = i * w, (i + 1) * w
        h = F(a + RULE_X[rule] * w)
        xs = min(max(np.sqrt(h), a), b)  # where the curve crosses the rectangle top
        if over and xs > a + 1e-6:
            pts = [ax.c2p(a, h), ax.c2p(xs, h)] + [ax.c2p(t, F(t)) for t in np.linspace(xs, a, 16)]
        elif not over and xs < b - 1e-6:
            pts = [ax.c2p(t, F(t)) for t in np.linspace(xs, b, 16)] + [ax.c2p(b, h), ax.c2p(xs, h)]
        else:
            continue
        g.add(Polygon(*pts, stroke_width=0, fill_color=RED if over else YEL, fill_opacity=0.7))
    return g.set_z_index(2)


def corner_dots(ax, n, rule):
    w = 2 / n
    return VGroup(*[pt(ax, i * w + RULE_X[rule] * w, F(i * w + RULE_X[rule] * w), ORG) for i in range(n)])


def height_labels(ax, texts, rule, shifts=(0, 0, 0, 0)):
    g = VGroup()
    for i, s in enumerate(texts):
        left_shift = shifts[i]
        x0 = i * 0.5
        h = F(x0 + RULE_X[rule] * 0.5)
        lab = M(s, size=34, color=ORG).next_to(ax.c2p(x0 + 0.25, h), UP, buff=0.1)
        g.add(lab.shift(LEFT * left_shift))
    return g


def rsum(n):
    """Right-end Riemann sum of x^2 on [0, 2] (closed form of the sum of (2i/n)^2 * 2/n)."""
    return 8 * (n + 1) * (2 * n + 1) / (6 * n * n)


def fmt(v):
    return f"{v:.4f}".rstrip("0").rstrip(".")


def tally_row(label, value, tag, tag_col, y):
    a = H(label, 34, DIM)
    a.move_to([0.75 + a.width / 2, y, 0])
    b = M(r"\approx", value, size=50)
    b[1].set_color(GRN)
    b.move_to([3.2 + b.width / 2, y, 0])
    c = H(tag, 32, tag_col)
    c.move_to([5.3 + c.width / 2, y, 0])
    return VGroup(a, b, c)


# ---------------------------------------------------------------- algebra shots

class K32_Check(Shot):
    """d/dx of -x^{-2} = 2x^{-3} = 2/x^3: the second piece of the integrand comes back."""
    def body(self):
        # K31_Root2's last frame, for a seamless cut: the answer two ways, -x^{-2} ringed with a d/dx note
        self.title("Rewrite as Powers", animate=False)
        A1 = M(r"\frac{2}{3}x^{3/2}", "-", "x^{-2}", "+C", size=80, color=GRN).move_to([0, 0.95, 0])
        A2 = M(r"\frac{2}{3}x^{3/2}", "-", r"\frac{1}{x^{2}}", "+C", size=80, color=GRN).move_to([0, -1.55, 0])
        A1[3].set_color(YEL); A2[3].set_color(YEL)
        orr = H("or", 44, DIM).move_to([0, -0.3, 0])
        bx = answer_box(VGroup(A1, A2), GRN)
        rg = SurroundingRectangle(A1[1:3], color=PINK, buff=0.12, stroke_width=4, corner_radius=0.1)
        lab = M(D, size=50, color=PINK).move_to([bx.get_right()[0] + 1.1, A1.get_top()[1] + 0.25, 0])
        ar = CurvedArrow(lab.get_left() + LEFT * 0.1, rg.get_top() + UP * 0.08, angle=0.7, color=PINK, stroke_width=3, tip_length=0.16)
        self.add(A1, A2, orr, bx, rg, lab, ar)

        top = M(r"\int", r"\Big(\sqrt{x}", "+", r"\frac{2}{x^3}", r"\Big)\,dx", size=56, color=DIM).move_to([0, 1.7, 0])
        r1 = st(D, "(-x^{-2})", "=", "-(-2)", "x^{-3}", eq=2, x=-0.6, y=0.15, size=66, c={1: BLUE, 3: ORG, 4: PINK})
        r2 = st("=", "2x^{-3}", eq=0, x=r1[2].get_x(), y=-1.05, size=66, c={1: PINK})
        r3 = st("=", r"\frac{2}{x^3}", eq=0, x=r1[2].get_x(), y=-2.35, size=66, c={1: PINK})
        self.play(FadeOut(VGroup(A1[0], A1[3], A2, orr, bx, rg, ar)), ReplacementTransform(lab, r1[0]),
                  ReplacementTransform(A1[1:3], r1[1]), FadeIn(top), run_time=0.7)
        self.title("Check by Differentiating")
        self.go("3:18:50.09", Write(r1[2:4]), run=0.7)
        self.go("3:18:51.59", Write(r1[4]), run=0.5)
        self.go("3:18:53.73", Write(r2), run=0.6)
        self.go("3:18:55.85", Write(r3), run=0.6)
        tk = tick_mark(s=0.6).next_to(r3, RIGHT, buff=0.5)
        self.go("3:18:57.99", Create(tk), top[3].animate.set_color(GRN), run=0.4)
        self.play(Circumscribe(top[3], color=GRN, buff=0.1), Indicate(r3[1], color=GRN, scale_factor=1.1), run_time=0.6)


class K32_TrigExp(Shot):
    """Each piece turns into its own antiderivative: 2 sin x -> 2(-cos x), 3e^x -> 3e^x."""
    def body(self):
        self.title("Sine and Exponential")
        r1 = M(r"\int", "(", r"2\sin x", "+", r"3e^x", ")", r"\,dx", size=64).move_to([0, 1.45, 0])
        r1[2].set_color(BLUE); r1[4].set_color(BLUE)
        r2 = M("=", r"2(-\cos x)", "+", r"3e^x", "+C", size=64)
        r2[1].set_color(GRN); r2[3].set_color(GRN); r2[4].set_color(YEL)
        r2.move_to([0.45, 0.15, 0])
        r3 = st("=", r"-2\cos x", "+", r"3e^x", "+C", eq=0, x=r2[0].get_x(), y=-1.15, size=64, c={1: GRN, 3: GRN, 4: YEL})
        rem1 = M(r"\int\sin x\,dx=-\cos x", size=44, color=DIM).move_to([-3.3, -2.75, 0])
        rem2 = M(r"\int e^x\,dx=e^x", size=44, color=DIM).move_to([3.3, -2.75, 0])
        self.go("3:18:59.65", Write(r1[0:2]), run=0.4)
        self.go("3:19:00.15", Write(r1[2]), run=0.5)
        self.go("3:19:01.21", Write(r1[3:5]), run=0.6)
        self.go("3:19:02.49", Write(r1[5:]), run=0.4)
        self.go("3:19:03.33", FadeIn(r2[0]), TransformFromCopy(r1[2], r2[1], path_arc=-0.4), run=0.9)
        self.play(FadeIn(rem1, shift=UP * 0.1), run_time=0.4)
        self.go("3:19:05.59", Write(r2[2]), TransformFromCopy(r1[4], r2[3], path_arc=-0.4), run=0.8)
        self.play(FadeIn(rem2, shift=UP * 0.1), run_time=0.4)
        self.go("3:19:07.47", Write(r2[4]), run=0.4)
        self.go("3:19:09.09", *[TransformFromCopy(r2[i], r3[i]) for i in range(5)], run=0.9)
        self.go("3:19:12.40", Create(answer_box(r3[1:])), run=0.6)


class K32_SplitFrac(Shot):
    """(x^2 + 1)/x split into x + 1/x, then integrated piece by piece."""
    def body(self):
        self.title("Split the Fraction")
        r1 = M(r"\int", r"\frac{x^2+1}{x}", r"\,dx", size=64).move_to([-0.9, 1.75, 0])
        r1[1].set_color(BLUE)
        r2 = M("=", r"\int", r"\Big(", r"\frac{x^2}{x}", "+", r"\frac{1}{x}", r"\Big)", r"\,dx", size=64)
        r2[3].set_color(BLUE); r2[5].set_color(BLUE)
        at_eq(r2, 0, -2.0, 0.05)
        r3 = st("=", r"\int", r"\Big(", "x", "+", r"\frac{1}{x}", r"\Big)", r"\,dx", eq=0, x=-2.0, y=0.05, size=64,
                c={3: BLUE, 5: BLUE})
        a = st("=", r"\frac{x^2}{2}", "+", r"\ln|x|", "+C", eq=0, x=-2.0, y=-2.05, size=64, c={1: GRN, 3: GRN, 4: YEL})
        self.go("3:19:14.45", Write(r1[0]), run=0.3)
        self.go("3:19:14.89", Write(r1[1]), run=1.1)
        self.play(Write(r1[2]), run_time=0.3)
        self.go("3:19:17.69", Write(r2), run=0.9)
        self.go("3:19:19.28", *[ReplacementTransform(r2[i], r3[i]) for i in range(8)], run=0.7)
        self.go("3:19:21.81", FadeIn(a[0]), TransformFromCopy(r3[3], a[1], path_arc=-0.4), run=0.9)
        self.go("3:19:25.09", Write(a[2]), TransformFromCopy(r3[5], a[3], path_arc=-0.4), run=0.9)
        self.go("3:19:27.89", Circumscribe(a[3], color=YEL, buff=0.1), run=0.8)
        self.go("3:19:29.71", Indicate(a[1], color=GRN, scale_factor=1.1), run=0.6)
        self.go("3:19:32.33", Indicate(a[3], color=GRN, scale_factor=1.1), run=0.6)
        self.go("3:19:34.67", Write(a[4]), run=0.4)
        self.play(Create(answer_box(a[1:])), run_time=0.5)


class K32_NoProduct(Shot):
    """No product rule for integrals; (x+1)^2 must be expanded first; then the rewrite-first rules."""
    def body(self):
        self.title("No Product Rule", "3:19:36.25")
        LX, EX = -3.0, -2.6
        d1 = M("(fg)'", "=", "f'g+fg'", size=58)
        d1[2].set_color(PINK)
        d1.move_to([EX + d1.width / 2, 1.3, 0])
        l1 = H("derivatives", 40, DIM)
        l1.move_to([LX - l1.width / 2, 1.3, 0])
        d2 = M(r"\int f\,g\,dx", "=", "?", size=58)
        d2[2].set_color(RED)
        d2.move_to([EX + d2.width / 2, -0.1, 0])
        l2 = H("integrals", 40, DIM)
        l2.move_to([LX - l2.width / 2, -0.1, 0])
        self.go("3:19:38.47", FadeIn(l1), Write(d1), run=0.7)
        self.go("3:19:39.47", FadeIn(l2), Write(d2), run=0.7)
        d3 = M(r"\int f\,g\,dx", r"\neq", r"\Big(\int f\,dx\Big)", r"\Big(\int g\,dx\Big)", size=58)
        d3[1].set_color(RED)
        d3.move_to([EX + d3.width / 2, -0.1, 0])
        self.go("3:19:42.93", ReplacementTransform(d2[0], d3[0]), FadeOut(d2[1:]), run=0.5)
        self.go("3:19:44.03", Write(d3[1]), run=0.4)
        self.go("3:19:44.65", Write(d3[2:]), run=0.7)

        # (x+1)^2: expand first
        self.wipe("3:19:45.87")
        e1 = M(r"\int", "(x+1)^2", r"\,dx", size=64).move_to([-1.2, 1.6, 0])
        e1[1].set_color(BLUE)
        self.go("3:19:47.11", Write(e1), run=0.8)
        wrong = M(r"\Big(\frac{x^2}{2}+x\Big)^2", size=60).move_to([-0.6, 0.0, 0])
        bx = cross_mark(s=0.32).next_to(wrong, RIGHT, buff=0.5)
        self.go("3:19:50.37", FadeIn(wrong, shift=DOWN * 0.1), run=0.6)
        self.go("3:19:51.89", Create(bx), run=0.4)
        e2 = st("=", r"\int(x^2+2x+1)\,dx", eq=0, x=-2.3, y=0.1, size=64)
        e2[1].set_color(BLUE)
        self.go("3:19:52.75", FadeOut(wrong), FadeOut(bx), run=0.4)
        nt = H("expand", 36, YEL).next_to(e2[0], LEFT, buff=0.35)
        self.go("3:19:54.39", Write(e2), FadeIn(nt), run=1.2)
        e3 = st("=", r"\frac{x^3}{3}", "+x^2", "+x", "+C", eq=0, x=-2.3, y=-1.7, size=64, c={1: GRN, 2: GRN, 3: GRN, 4: YEL})
        self.go("3:19:58.65", Write(e3[0:2]), run=0.6)
        self.go("3:20:00.01", Write(e3[2]), run=0.4)
        self.go("3:20:01.15", Write(e3[3]), run=0.4)
        self.go("3:20:01.83", Write(e3[4]), run=0.3)
        self.play(Create(answer_box(e3[1:])), run_time=0.5)

        # the rewrite-first rules
        self.wipe("3:20:03.13")
        self.title("Rewrite First", "3:20:03.57")
        pl = pill("sums of powers", GRN, size=38).move_to([0, 1.85, 0])
        self.go("3:20:07.13", FadeIn(pl, shift=DOWN * 0.1), run=0.5)
        rows = []
        for y, lab, parts in ((0.55, "expand products", ("(x+1)^2", r"\;\to\;", "x^2+2x+1")),
                              (-0.85, "split fractions", (r"\frac{x^2+1}{x}", r"\;\to\;", r"x+\frac{1}{x}")),
                              (-2.25, "roots into powers", (r"\sqrt{x}", r"\;\to\;", "x^{1/2}"))):
            h = H(lab, 42, YEL)
            h.move_to([-1.3 - h.width / 2, y, 0])
            m = M(*parts, size=56)
            m[1].set_color(DIM); m[2].set_color(GRN)
            m.move_to([-0.6 + m.width / 2, y, 0])
            rows.append((h, m))
        for (h, m), t in zip(rows, ("3:20:08.43", "3:20:10.51", "3:20:12.13")):
            self.go(t, FadeIn(h, shift=RIGHT * 0.1), run=0.4)
            self.play(Write(m), run_time=0.6)


class K32_Try(Shot):
    """Three to try, then the answers."""
    def body(self):
        self.title("Try a Few")
        EQ = 0.3
        r1 = st(r"\int(6x^2-4x+1)\,dx", "=", "2x^3-2x^2+x+C", eq=1, x=EQ, y=1.3, size=56, c={2: GRN})
        r2 = st(r"\int 5\cos x\,dx", "=", r"5\sin x+C", eq=1, x=EQ, y=-0.2, size=56, c={2: GRN})
        r3 = st(r"\int\frac{4}{x}\,dx", "=", r"4\ln|x|+C", eq=1, x=EQ, y=-1.75, size=56, c={2: GRN})
        self.go("3:20:15.87", Write(r1[0]), run=1.0)
        self.go("3:20:20.19", Write(r2[0]), run=0.8)
        self.go("3:20:23.17", Write(r3[0]), run=0.8)
        ps = H("pause and try", 36, DIM).move_to([0, -3.0, 0])
        self.play(FadeIn(ps, shift=UP * 0.1), run_time=0.4)
        self.go("3:20:25.01", FadeOut(ps), Indicate(r1[0], color=YEL, scale_factor=1.05), run=0.6)
        self.go("3:20:26.15", Write(r1[1:]), run=1.4)
        self.go("3:20:31.27", Write(r2[1:]), run=0.8)
        self.go("3:20:33.87", Write(r3[1:]), run=0.9)
        tks = VGroup(*[tick_mark(s=0.45).next_to(r[2], RIGHT, buff=0.35) for r in (r1, r2, r3)])
        self.go("3:20:35.90", LaggedStart(*[Create(t) for t in tks], lag_ratio=0.25), run=0.8)


# ---------------------------------------------------------------- initial value problem

IVX = -3.7


def ivp_givens():
    g1 = st("f'(x)", "=", "6x^2-2x", eq=1, x=IVX, y=1.65, size=56, c={0: PINK, 2: PINK})
    g2 = st("f(1)", "=", "4", eq=1, x=IVX, y=0.75, size=56, c={0: BLUE, 2: ORG})
    nt = H("extra info", 36, YEL).next_to(g2, RIGHT, buff=0.6)
    g3 = VGroup(H("find", 44, YEL), M("f(x)", size=60, color=BLUE)).arrange(RIGHT, buff=0.25)
    g3.move_to([IVX, -0.35, 0])
    return g1, g2, nt, g3


class K32_IVPSetup(Shot):
    """Extra information pins down C: the initial value problem f' = 6x^2 - 2x, f(1) = 4."""
    def body(self):
        self.title("Finding C", "3:20:37.35")
        fam = M("F(x)", "+", "C", size=100).move_to([0, 0.3, 0])
        fam[0].set_color(BLUE); fam[2].set_color(YEL)
        self.go("3:20:38.15", Write(fam), run=0.7)
        q = H("which one?", 44, YEL).next_to(fam, DOWN, buff=0.6).shift(RIGHT * 1.2)
        self.go("3:20:39.53", FadeIn(q, shift=UP * 0.1), run=0.5)
        self.go("3:20:40.73", Circumscribe(fam[2], color=YEL, buff=0.12), run=0.7)
        self.wipe("3:20:42.01")
        self.title("Initial Value Problems", "3:20:42.43")
        g1, g2, nt, g3 = ivp_givens()
        self.go("3:20:45.13", Write(g1[0]), run=0.5)
        self.go("3:20:46.27", Write(g1[1:]), run=0.9)
        self.go("3:20:49.59", Write(g2), run=0.8)
        self.play(FadeIn(nt, shift=LEFT * 0.1), run_time=0.4)
        self.go("3:20:51.59", FadeIn(g3, shift=UP * 0.1), run=0.6)


def ivp_axes():
    ax = axes(x_range=(-1, 2, 1), y_range=(-3, 9, 3), x_length=4.8, y_length=5.0, center=(3.7, -0.55, 0), num_size=30)
    return ax


class K32_IVP(Shot):
    """Integrate, then use f(1) = 4: C = 3. The family 2x^3 - x^2 + C and the one curve through (1, 4)."""
    def body(self):
        self.title("Initial Value Problems", animate=False)
        g1, g2, nt, g3 = ivp_givens()
        self.add(g1, g2, nt, g3)
        self.go("3:20:53.45", FadeOut(nt), FadeOut(g3), run=0.4)
        ax = ivp_axes()
        self.go("3:20:54.10", Create(ax), FadeIn(ax.labels), run=0.6)
        w1 = st("f(x)", "=", "2x^3-x^2", "+C", eq=1, x=IVX, y=-0.35, size=56, c={0: BLUE, 2: BLUE, 3: YEL})
        self.go("3:20:55.11", Write(w1[0:2]), run=0.5)
        self.go("3:20:56.51", TransformFromCopy(g1[2], w1[2], path_arc=-0.4), run=0.9)
        Cs = (-3, 0, 3, 6)
        fam = VGroup(*[clipped(ax, (lambda x, C=C: 2 * x ** 3 - x * x + C), -1, 1.95, -3, 8.8, width=3.5)
                       .set_stroke(opacity=0.55) for C in Cs])
        self.go("3:20:58.75", Write(w1[3]), LaggedStart(*[Create(f) for f in fam], lag_ratio=0.2), run=1.2)
        self.go("3:21:01.05", Indicate(g2, color=ORG, scale_factor=1.08), run=0.6)
        dot = pt(ax, 1, 4, ORG, r=0.1)
        dl = M("(1,4)", size=40, color=ORG).next_to(dot, UL, buff=0.08)
        self.go("3:21:02.79", FadeIn(dot, scale=0.5), FadeIn(dl), run=0.5)
        w2 = st("2-1+C", "=", "4", eq=1, x=IVX, y=-1.35, size=56, c={2: ORG})
        w2[0][4].set_color(YEL)
        self.go("3:21:05.37", Write(w2[0]), run=0.8)
        self.go("3:21:07.43", Write(w2[1:]), run=0.4)
        w3 = st("1+C", "=", "4", eq=1, x=IVX, y=-1.35, size=56, c={2: ORG})
        w3[0][2].set_color(YEL)
        self.go("3:21:08.95", ReplacementTransform(w2, w3), run=0.6)
        w4 = st("C", "=", "3", eq=1, x=IVX, y=-1.35, size=56, c={0: YEL, 2: YEL})
        lit = fam[2]
        others = [fam[i] for i in (0, 1, 3)]
        self.go("3:21:11.47", ReplacementTransform(w3, w4), run=0.6)
        self.play(lit.animate.set_stroke(YEL, width=7, opacity=1), *[o.animate.set_stroke(opacity=0.18) for o in others],
                  run_time=0.8)
        fin = st("f(x)", "=", "2x^3-x^2", "+3", eq=1, x=IVX, y=-2.55, size=56, c={0: BLUE, 2: BLUE, 3: YEL})
        self.go("3:21:13.79", Write(fin), run=0.9)
        self.go("3:21:16.89", Create(answer_box(fin)), run=0.5)
        self.go("3:21:18.59", *[o.animate.set_stroke(opacity=0.6) for o in others], run=0.5)
        self.go("3:21:20.21", *[o.animate.set_stroke(opacity=0.18) for o in others], Indicate(lit, color=YEL, scale_factor=1.0), run=0.6)
        self.go("3:21:21.55", Circumscribe(VGroup(dot, dl), color=ORG, buff=0.12), run=0.8)


# ---------------------------------------------------------------- physics backwards and the ball

class K32_Motion(Shot):
    """s -> v -> a by derivatives; back again by integrals."""
    def body(self):
        self.title("Back to Physics", "3:21:23.57")
        CY = 0.35
        s = M("s(t)", size=76, color=BLUE).move_to([-4.4, CY, 0])
        v = M("v(t)", size=76, color=PINK).move_to([0, CY, 0])
        a = M("a(t)", size=76, color=PURP).move_to([4.4, CY, 0])
        ws = [H(w, 36, DIM).next_to(m, UP, buff=0.45) for w, m in (("position", s), ("velocity", v), ("acceleration", a))]
        for w in ws:
            w.set_y(CY + 1.0)
        self.go("3:21:26.00", FadeIn(s), FadeIn(ws[0]), FadeIn(v), FadeIn(ws[1]), run=0.6)

        def top(m1, m2):
            ar = arr(m1.get_right() + RIGHT * 0.35 + UP * 0.28, m2.get_left() + LEFT * 0.35 + UP * 0.28, PINK, w=4)
            return VGroup(ar, M(r"\frac{d}{dt}", size=44, color=PINK).next_to(ar, UP, buff=0.12))

        def bot(m1, m2):
            ar = arr(m1.get_left() + LEFT * 0.35 + DOWN * 0.28, m2.get_right() + RIGHT * 0.35 + DOWN * 0.28, GRN, w=4)
            return VGroup(ar, M(r"\int", size=52, color=GRN).next_to(ar, DOWN, buff=0.15))
        t1, t2 = top(s, v), top(v, a)
        self.go("3:21:27.61", GrowArrow(t1[0]), FadeIn(t1[1]), run=0.6)
        self.go("3:21:29.57", FadeIn(a), FadeIn(ws[2]), run=0.5)
        self.go("3:21:30.53", GrowArrow(t2[0]), FadeIn(t2[1]), run=0.6)
        bk = H("backwards", 44, YEL).move_to([0, -1.75, 0])
        self.go("3:21:32.97", FadeIn(bk, shift=UP * 0.1), run=0.5)
        b1, b2 = bot(a, v), bot(v, s)
        self.go("3:21:33.99", GrowArrow(b1[0]), FadeIn(b1[1]), run=0.7)
        self.go("3:21:35.67", Indicate(v, color=PINK, scale_factor=1.12), run=0.6)
        self.go("3:21:37.07", GrowArrow(b2[0]), FadeIn(b2[1]), run=0.7)
        self.go("3:21:38.73", Indicate(s, color=BLUE, scale_factor=1.12), run=0.6)


GX, GY, SC = -5.7, -2.85, 0.205   # hand x, hand y, screen units per metre
BX = -2.6                          # the algebra column's "="
ROWS = (1.6, 0.7, -0.2, -1.1, -2.0)


def hb(t):
    return 20 * t - 5 * t * t


def ball_y(h):
    return GY + 0.16 + h * SC


def ball_rows():
    r1 = st("a(t)", "=", "-10", eq=1, x=BX, y=ROWS[0], size=50, c={0: PURP, 2: PURP})
    r2 = st("v(t)", "=", "-10t", "+C", eq=1, x=BX, y=ROWS[1], size=50, c={0: PINK, 2: PINK, 3: YEL})
    r3a = st("20", "=", "0+C", eq=1, x=BX, y=ROWS[2], size=50, c={0: ORG})
    r3 = st("C", "=", "20", eq=1, x=BX, y=ROWS[2], size=50, c={0: YEL, 2: YEL})
    r4 = st("v(t)", "=", "-10t", "+20", eq=1, x=BX, y=ROWS[3], size=50, c={0: PINK, 2: PINK, 3: YEL})
    r5 = st("s(t)", "=", "-5t^2+20t", "+D", eq=1, x=BX, y=ROWS[4], size=50, c={0: BLUE, 2: BLUE, 3: YEL})
    return r1, r2, r3a, r3, r4, r5


def ball_props():
    hd = hand().move_to([GX, GY - 0.2, 0])
    track = DashedLine([GX, GY + 0.2, 0], [GX, ball_y(20) + 0.2, 0], color=FAINT, stroke_width=2, dash_length=0.1)
    grav = arr([GX - 0.75, 0.7, 0], [GX - 0.75, -0.5, 0], PURP)
    gl = M("-10", size=40, color=PURP).next_to(grav, DOWN, buff=0.12)
    va = arr([GX + 0.45, ball_y(0), 0], [GX + 0.45, ball_y(0) + 1.5, 0], PINK)
    vl = M("20", size=40, color=PINK).next_to(va, RIGHT, buff=0.1).shift(UP * 0.3)
    return hd, track, grav, gl, va, vl


def g_axes(y_range, y_label):
    return axes(x_range=(0, 4.5, 1), y_range=y_range, x_length=4.2, y_length=4.6, center=(4.45, -0.5, 0),
                x_label="t", y_label=y_label, num_size=28)


def v_graph():
    ax = g_axes((-20, 30, 10), "v")
    fam = VGroup(*[clipped(ax, (lambda t, C=C: -10 * t + C), 0, 4, -20, 29.5, color=PINK, width=3.5).set_stroke(opacity=0.5)
                   for C in (0, 10, 20, 30)])
    return ax, fam


class K32_Ball(Shot):
    """The ball from chapter 8: a = -10, integrate, v(0) = 20 picks C = 20 (one line of the family), integrate again."""
    def body(self):
        self.title("The Ball Thrown Up", "3:21:39.85")
        hd, track, grav, gl, va, vl = ball_props()
        self.go("3:21:40.43", Create(hd), Create(track), run=0.5)
        tt = ValueTracker(0.0)
        ball = always_redraw(lambda: chalk_ball([GX, ball_y(hb(tt.get_value())), 0]))
        self.add(ball)
        self.play(tt.animate.set_value(4.0), run_time=2.3, rate_func=linear)
        unclock(ball)
        self.go("3:21:44.37", GrowArrow(grav), run=0.5)
        self.go("3:21:45.17", FadeIn(gl), run=0.4)
        r1, r2, r3a, r3, r4, r5 = ball_rows()
        self.go("3:21:46.49", Write(r1), run=0.8)
        self.go("3:21:48.97", Circumscribe(r1, color=GRN, buff=0.1), run=0.6)
        self.go("3:21:49.97", Write(r2[0:3]), run=0.9)
        ax, fam = v_graph()
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.5)
        self.go("3:21:52.19", Write(r2[3]), LaggedStart(*[Create(f) for f in fam], lag_ratio=0.2), run=1.0)
        self.go("3:21:55.05", GrowArrow(va), run=0.5)
        dot = pt(ax, 0, 20, ORG, r=0.1)
        self.go("3:21:56.93", FadeIn(vl), FadeIn(dot, scale=0.5), run=0.4)
        self.go("3:21:58.05", Write(r3a), run=0.8)
        lit = fam[2]
        self.go("3:22:00.69", ReplacementTransform(r3a, r3), lit.animate.set_stroke(YEL, width=6, opacity=1),
                *[fam[i].animate.set_stroke(opacity=0.15) for i in (0, 1, 3)], run=0.7)
        self.go("3:22:01.97", Write(r4), run=0.9)
        self.go("3:22:05.65", Circumscribe(r4, color=GRN, buff=0.1), run=0.6)
        self.go("3:22:07.27", Write(r5[0:3]), run=1.2)
        self.go("3:22:11.05", Write(r5[3]), run=0.4)
        self.go("3:22:12.85", Circumscribe(r5[3], color=YEL, buff=0.1), run=0.6)


def s_graph():
    ax = g_axes((-10, 30, 10), "s")
    fam = VGroup(*[clipped(ax, (lambda t, D=D: hb(t) + D), 0, 4.0, -10, 29.5, color=BLUE, width=3.5).set_stroke(opacity=0.5)
                   for D in (-10, 0, 10)])
    return ax, fam


class K32_BallPos(Shot):
    """s(0) = 0 picks D = 0: s = -5t^2 + 20t, the chapter 8 formula; the ball flies while the dot rides the curve."""
    def body(self):
        self.title("The Ball Thrown Up", animate=False)
        hd, track, grav, gl, va, vl = ball_props()
        ball = chalk_ball([GX, ball_y(0), 0])
        r1, r2, r3a, r3, r4, r5 = ball_rows()
        vax, vfam = v_graph()
        vfam[2].set_stroke(YEL, width=6, opacity=1)
        for i in (0, 1, 3):
            vfam[i].set_stroke(opacity=0.15)
        vdot = pt(vax, 0, 20, ORG, r=0.1)
        self.add(hd, track, ball, grav, gl, va, vl, r1, r2, r3, r4, r5, vax, vax.labels, vfam, vdot)

        ax, fam = s_graph()
        self.go("3:22:13.69", FadeOut(VGroup(r1, r2, r3, vax, vax.labels, vfam, vdot)),
                r4.animate.shift(UP * (ROWS[0] - ROWS[3])), r5.animate.shift(UP * (ROWS[1] - ROWS[4])), run=0.7)
        self.play(Create(ax), FadeIn(ax.labels), LaggedStart(*[Create(f) for f in fam], lag_ratio=0.2), run_time=0.9)
        r6a = st("s(0)", "=", "0", eq=1, x=BX, y=ROWS[2], size=50, c={0: BLUE, 2: ORG})
        dot = pt(ax, 0, 0, ORG, r=0.1)
        self.go("3:22:15.40", Write(r6a), run=0.7)
        self.go("3:22:16.67", FadeIn(dot, scale=0.5), Indicate(hd, color=ORG), run=0.5)
        r6 = st("D", "=", "0", eq=1, x=BX, y=ROWS[2], size=50, c={0: YEL, 2: YEL})
        lit = fam[1]
        self.go("3:22:17.87", ReplacementTransform(r6a, r6), lit.animate.set_stroke(YEL, width=6, opacity=1),
                *[fam[i].animate.set_stroke(opacity=0.15) for i in (0, 2)], run=0.7)
        r7 = st("s(t)", "=", "-5t^2+20t", eq=1, x=BX, y=ROWS[3] - 0.1, size=50, c={0: BLUE, 2: BLUE})
        self.go("3:22:19.39", Write(r7), run=1.0)
        self.go("3:22:22.41", Create(answer_box(r7)), run=0.5)

        # the chapter 8 ball, now derived: it flies while the dot rides the lit curve
        tt = ValueTracker(0.0)
        self.remove(ball)
        fly = always_redraw(lambda: chalk_ball([GX, ball_y(hb(tt.get_value())), 0]))
        rider = always_redraw(lambda: pt(ax, tt.get_value(), hb(tt.get_value()), ORG, r=0.1))
        self.go("3:22:23.65", FadeOut(va), FadeOut(vl), FadeOut(dot), run=0.3)
        self.add(fly, rider)
        self.play(tt.animate.set_value(4.0), run_time=2.8, rate_func=linear)
        unclock(fly, rider)

        ch = M("a", r"\xrightarrow{\ \int\ }", "v", r"\xrightarrow{\ \int\ }", "s", size=56).move_to([BX - 0.2, -2.7, 0])
        ch[0].set_color(PURP); ch[1].set_color(GRN); ch[2].set_color(PINK); ch[3].set_color(GRN); ch[4].set_color(BLUE)
        self.go("3:22:29.35", FadeIn(ch[0]), Indicate(grav, color=PURP), run=0.5)
        self.go("3:22:30.37", Write(ch[1:3]), run=0.5)
        self.play(Write(ch[3:]), run_time=0.5)
        sv = H("+ start values", 36, YEL).next_to(ch, DOWN, buff=0.2)
        self.go("3:22:31.65", FadeIn(sv, shift=UP * 0.1), run=0.5)


# ---------------------------------------------------------------- the area problem

def shapes():
    rc = Rectangle(width=2.4, height=1.6, stroke_color=CHALK, stroke_width=4, fill_color=GRN, fill_opacity=0.25).move_to([-4.3, 0.4, 0])
    rw = M("w", size=44, color=ORG).next_to(rc, DOWN, buff=0.15)
    rh = M("h", size=44, color=ORG).next_to(rc, LEFT, buff=0.15)
    rf = M("A=wh", size=52).move_to([-4.3, -1.75, 0])
    A, B, C = np.array([-1.3, -0.4, 0]), np.array([1.3, -0.4, 0]), np.array([0.4, 1.2, 0])
    tr = Polygon(A, B, C, stroke_color=CHALK, stroke_width=4, fill_color=GRN, fill_opacity=0.25)
    th = DashedLine(C, [0.4, -0.4, 0], color=ORG, stroke_width=3, dash_length=0.08)
    tb = M("b", size=44, color=ORG).next_to(Line(A, B), DOWN, buff=0.15)
    tf = M(r"A=\tfrac{1}{2}bh", size=52).move_to([0, -1.75, 0])
    ci = Circle(radius=0.95, stroke_color=CHALK, stroke_width=4, fill_color=GRN, fill_opacity=0.25).move_to([4.3, 0.4, 0])
    cr = Line(ci.get_center(), ci.get_center() + RIGHT * 0.95, color=ORG, stroke_width=3)
    cl = M("r", size=40, color=ORG).next_to(cr, UP, buff=0.08)
    cf = M(r"A=\pi r^2", size=52).move_to([4.3, -1.75, 0])
    return (rc, rw, rh, rf), (tr, th, tb, tf), (ci, cr, cl, cf)


class K32_Shapes(Shot):
    """The second idea: area. Rectangles, triangles, circles all have formulas."""
    def body(self):
        self.title("The Second Idea", "3:22:33.69")
        self.title("Area", "3:22:37.15")
        (rc, rw, rh, rf), (tr, th, tb, tf), (ci, cr, cl, cf) = shapes()
        self.go("3:22:38.75", Create(rc), run=0.6)
        self.go("3:22:40.33", FadeIn(rw), run=0.4)
        self.go("3:22:41.15", FadeIn(rh), run=0.4)
        self.play(Write(rf), run_time=0.5)
        self.go("3:22:42.53", Create(tr), Create(th), FadeIn(tb), run=0.5)
        self.play(Write(tf), run_time=0.4)
        self.go("3:22:43.51", Create(ci), Create(cr), FadeIn(cl), run=0.5)
        self.play(Write(cf), run_time=0.4)
        tks = VGroup(*[tick_mark(s=0.4).next_to(f, DOWN, buff=0.3) for f in (rf, tf, cf)])
        self.go("3:22:45.91", LaggedStart(*[Create(t) for t in tks], lag_ratio=0.25), run=0.7)
        self.tks = tks


def under_parts(ax):
    eq = M("y", "=", "x^2", size=60, color=BLUE).move_to([3.7, 1.2, 0])
    rng = M(r"0\le x\le 2", size=56, color=ORG).move_to([3.7, 0.2, 0])
    nf = H("no formula", 44, RED).move_to([3.7, -0.9, 0])
    edge = curve(ax, F, [0, 2], color=YEL, width=8).set_z_index(4)
    shade = area(ax, F, 0, 2)
    q = H("?", 80, GRN).move_to(ax.c2p(1.45, 0.9))
    x2 = DashedLine(ax.c2p(2, 0), ax.c2p(2, 4), color=ORG, stroke_width=3, dash_length=0.08)
    return eq, rng, nf, edge, shade, q, x2


class K32_UnderCurve(Shot):
    """Area under y = x^2 from 0 to 2: no formula, one edge is curved."""
    def body(self):
        self.title("Area", animate=False)
        (rc, rw, rh, rf), (tr, th, tb, tf), (ci, cr, cl, cf) = shapes()
        tks = VGroup(*[tick_mark(s=0.4).next_to(f, DOWN, buff=0.3) for f in (rf, tf, cf)])
        self.add(rc, rw, rh, rf, tr, th, tb, tf, ci, cr, cl, cf, tks)
        self.wipe("3:22:47.45")
        self.title("Area Under a Curve", "3:22:48.41")
        ax, cv = area_board()
        eq, rng, nf, edge, shade, q, x2 = under_parts(ax)
        self.go("3:22:50.57", Create(ax), FadeIn(ax.labels), FadeIn(ax.xl), FadeIn(ax.yl), run=0.7)
        self.go("3:22:52.15", draw(cv, run=0.9, color=BLUE), run=0.9)
        self.go("3:22:53.47", Write(eq), run=0.5)
        self.go("3:22:54.99", ax.x_axis.animate.set_color(YEL), run=0.4)
        self.play(ax.x_axis.animate.set_color(DIM), run_time=0.3)
        self.go("3:22:56.49", Write(rng), run=0.6)
        self.go("3:22:58.17", Create(x2), run=0.4)
        self.play(FadeIn(shade), run_time=0.5)
        self.go("3:22:59.59", FadeIn(q, scale=0.8), run=0.4)
        self.go("3:23:00.21", FadeIn(nf, shift=UP * 0.1), run=0.5)
        self.go("3:23:01.81", draw(edge, run=0.8, color=YEL), run=0.8)


def board_base(scene, title):
    scene.title(title, animate=False)
    ax, cv = area_board()
    scene.add(ax, ax.labels, ax.xl, ax.yl, cv)
    return ax, cv


def brace4(ax):
    br = Brace(Line(ax.c2p(0, 0), ax.c2p(0.5, 0)), DOWN, buff=0.5, color=ORG)
    return VGroup(br, M("0.5", size=36, color=ORG).next_to(br, DOWN, buff=0.08))


R_H = ("0.25", "1", "2.25", "4")
L_H = ("0", "0.25", "1", "2.25")
M_H = ("0.0625", "0.5625", "1.5625", "3.0625")


class K32_Right4(Shot):
    """Four pieces, each 0.5 wide; rectangles with heights from the right ends: 0.25, 1, 2.25, 4."""
    def body(self):
        ax, cv = board_base(self, "Area Under a Curve")
        eq, rng, nf, edge, shade, q, x2 = under_parts(ax)
        self.add(shade, x2, eq, rng, nf, q, edge)
        self.go("3:23:03.35", FadeOut(VGroup(eq, rng, nf, q, edge, x2)), run=0.5)
        self.title("Rectangles", "3:23:05.09")
        cuts = VGroup(*[DashedLine(ax.c2p(x, 0), ax.c2p(x, F(x)), color=CHALK, stroke_width=3, dash_length=0.08) for x in (0.5, 1, 1.5)])
        self.go("3:23:09.99", LaggedStart(*[Create(c) for c in cuts], lag_ratio=0.25), run=0.7)
        br = brace4(ax)
        self.go("3:23:12.69", GrowFromCenter(br[0]), FadeIn(br[1]), run=0.5)
        rs = rects(ax, 4, "right")
        self.go("3:23:15.45", FadeOut(shade), FadeOut(cuts),
                LaggedStart(*[GrowFromEdge(r, DOWN) for r in rs], lag_ratio=0.2), run=1.0)
        dots = corner_dots(ax, 4, "right")
        self.go("3:23:19.41", LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.2), run=0.6)
        for i, t in enumerate(("3:23:22.45", "3:23:23.47", "3:23:24.23", "3:23:25.27")):
            self.go(t, ax.xl[i].animate.set_color(ORG), Indicate(dots[i], color=ORG, scale_factor=1.6), run=0.35)
        hl = height_labels(ax, R_H, "right")
        for i, t in enumerate(("3:23:28.49", "3:23:29.65", "3:23:30.47", "3:23:31.89")):
            self.go(t, FadeIn(hl[i], shift=DOWN * 0.1), run=0.35)


def right4_state(scene, title):
    ax, cv = board_base(scene, title)
    rs, dots, hl, br = rects(ax, 4, "right"), corner_dots(ax, 4, "right"), height_labels(ax, R_H, "right"), brace4(ax)
    for l in ax.xl:
        l.set_color(ORG)
    scene.add(rs, dots, hl, br)
    return ax, cv, rs, dots, hl, br


def column(nums, x_right=4.3, y0=1.45, gap=0.6):
    col = VGroup()
    for i, s in enumerate(nums):
        m = M(s, size=50, color=ORG)
        m.move_to([x_right - m.width / 2, y0 - i * gap, 0])
        col.add(m)
    plus = M("+", size=50).next_to(col[-1], LEFT, buff=0.25).set_x(x_right - 1.65)
    bar = Line([x_right - 1.9, col[-1].get_bottom()[1] - 0.15, 0], [x_right + 0.05, col[-1].get_bottom()[1] - 0.15, 0],
               color=CHALK, stroke_width=3)
    return col, plus, bar


class K32_RightSum(Shot):
    """0.5 x (0.25 + 1 + 2.25 + 4) = 0.5 x 7.5 = 3.75; the rectangles poke out above the curve: an overestimate."""
    def body(self):
        ax, cv, rs, dots, hl, br = right4_state(self, "Rectangles")
        self.go("3:23:34.11", Indicate(br[1], color=ORG, scale_factor=1.3), run=0.6)
        hdr = H("add the heights", 34, DIM).move_to([3.4, 2.05, 0])
        self.go("3:23:36.15", FadeIn(hdr, shift=DOWN * 0.1), run=0.4)
        col, plus, bar = column(R_H)
        for i, t in enumerate(("3:23:37.87", "3:23:39.89", "3:23:40.93", "3:23:42.57")):
            extra = [FadeIn(plus)] if i == 3 else []
            self.go(t, TransformFromCopy(hl[i], col[i]), *extra, run=0.6)
        tot = M("7.5", size=50, color=ORG)
        tot.move_to([4.3 - tot.width / 2, bar.get_y() - 0.45, 0])
        self.go("3:23:43.81", Create(bar), Write(tot), run=0.5)
        fin = M("7.5", r"\times", "0.5", "=", "3.75", size=56).move_to([3.5, -2.05, 0])
        fin[0].set_color(ORG); fin[2].set_color(ORG); fin[4].set_color(GRN)
        self.go("3:23:45.49", TransformFromCopy(tot, fin[0]), run=0.5)
        self.go("3:23:46.13", Write(fin[1]), TransformFromCopy(br[1], fin[2]), run=0.5)
        self.go("3:23:47.41", Write(fin[3:]), run=0.5)
        ob = bits(ax, 4, "right", over=True)
        self.go("3:23:51.57", FadeIn(ob), run=0.5)
        self.go("3:23:54.43", Indicate(cv, color=YEL, scale_factor=1.0), run=0.7)
        self.go("3:23:57.11", *[Indicate(d, color=ORG, scale_factor=1.6) for d in dots], run=0.6)
        ov = H("overestimate", 40, RED).next_to(fin, DOWN, buff=0.35)
        self.go("3:23:59.15", FadeIn(ov, shift=UP * 0.1), run=0.5)


class K32_Left(Shot):
    """Left ends 0, 0.5, 1, 1.5: heights 0, 0.25, 1, 2.25 -> 3.5 x 0.5 = 1.75, an underestimate; 1.75 < A < 3.75."""
    def body(self):
        ax, cv, rs, dots, hl, br = right4_state(self, "Rectangles")
        col, plus, bar = column(R_H)
        tot = M("7.5", size=50, color=ORG)
        tot.move_to([4.3 - tot.width / 2, bar.get_y() - 0.45, 0])
        hdr = H("add the heights", 34, DIM).move_to([3.4, 2.05, 0])
        fin = M("7.5", r"\times", "0.5", "=", "3.75", size=56).move_to([3.5, -2.05, 0])
        fin[0].set_color(ORG); fin[2].set_color(ORG); fin[4].set_color(GRN)
        ob = bits(ax, 4, "right", over=True)
        ov = H("overestimate", 40, RED).next_to(fin, DOWN, buff=0.35)
        self.add(col, plus, bar, tot, hdr, fin, ob, ov)

        T1 = tally_row("right ends", "3.75", "too big", RED, 1.6)
        self.go("3:24:00.55", FadeOut(VGroup(col, plus, bar, tot, hdr, ov, fin[0:4], ob, dots, hl)),
                ReplacementTransform(fin[4], T1[1][1]), FadeIn(T1[0]), FadeIn(T1[1][0]), FadeIn(T1[2]), run=0.7)
        ls = rects(ax, 4, "left")
        ldots = corner_dots(ax, 4, "left")
        self.title("Left Ends", "3:24:01.30")
        self.play(Transform(rs, ls), *[l.animate.set_color(FAINT) for l in ax.xl], FadeIn(ldots), run_time=0.8)
        z = M("0", size=30, color=ORG).next_to(ax.c2p(0, 0), DOWN, buff=0.12)
        self.go("3:24:03.17", FadeIn(z), Indicate(ldots[0], color=ORG, scale_factor=1.6), run=0.3)
        for i, t in enumerate(("3:24:03.43", "3:24:04.83", "3:24:05.93")):
            self.go(t, ax.xl[i].animate.set_color(ORG), Indicate(ldots[i + 1], color=ORG, scale_factor=1.6), run=0.3)
        lh = height_labels(ax, L_H, "left", shifts=(0, 0.35, 0.4, 0.45))
        for i, t in enumerate(("3:24:07.75", "3:24:08.50", "3:24:09.83", "3:24:10.40")):
            self.go(t, FadeIn(lh[i], shift=DOWN * 0.1), run=0.3)
        W = M("3.5", r"\times", "0.5", "=", "1.75", size=56).move_to([3.5, -0.2, 0])
        W[0].set_color(ORG); W[2].set_color(ORG); W[4].set_color(GRN)
        self.go("3:24:12.01", Write(W[0]), run=0.4)
        self.go("3:24:13.21", Write(W[1:3]), run=0.4)
        self.go("3:24:14.83", Write(W[3:]), run=0.4)
        ub = bits(ax, 4, "left", over=False)
        self.go("3:24:16.65", FadeIn(ub), run=0.5)
        T2 = tally_row("left ends", "1.75", "too small", YEL, 1.0)
        self.play(FadeOut(W[0:4]), ReplacementTransform(W[4], T2[1][1]), FadeIn(T2[0]), FadeIn(T2[1][0]), FadeIn(T2[2]),
                  run_time=0.6)
        self.go("3:24:18.79", Indicate(rs, color=GRN, scale_factor=1.0), run=0.6)
        Q = M("1.75", "<", "A", "<", "3.75", size=60).move_to([3.6, -0.75, 0])
        Q[0].set_color(GRN); Q[4].set_color(GRN); Q[2].set_color(YEL)
        self.go("3:24:21.75", TransformFromCopy(T2[1][1], Q[0]), TransformFromCopy(T1[1][1], Q[4]), Write(Q[1:4]), run=0.7)
        bq = Brace(Q, DOWN, color=YEL, buff=0.15)
        wl = H("wide range", 38, YEL).next_to(bq, DOWN, buff=0.1)
        self.go("3:24:26.05", GrowFromCenter(bq), FadeIn(wl), run=0.5)


class K32_Mid(Shot):
    """Midpoints 0.25, 0.75, 1.25, 1.75: heights squared -> 5.25 x 0.5 = 2.625; the bits out and the gaps balance."""
    def body(self):
        ax, cv = board_base(self, "Left Ends")
        rs, ldots, lh = rects(ax, 4, "left"), corner_dots(ax, 4, "left"), height_labels(ax, L_H, "left", shifts=(0, 0.35, 0.4, 0.45))
        z = M("0", size=30, color=ORG).next_to(ax.c2p(0, 0), DOWN, buff=0.12)
        for l in ax.xl[:3]:
            l.set_color(ORG)
        ub = bits(ax, 4, "left", over=False)
        T1 = tally_row("right ends", "3.75", "too big", RED, 1.6)
        T2 = tally_row("left ends", "1.75", "too small", YEL, 1.0)
        Q = M("1.75", "<", "A", "<", "3.75", size=60).move_to([3.6, -0.75, 0])
        Q[0].set_color(GRN); Q[4].set_color(GRN); Q[2].set_color(YEL)
        bq = Brace(Q, DOWN, color=YEL, buff=0.15)
        wl = H("wide range", 38, YEL).next_to(bq, DOWN, buff=0.1)
        self.add(rs, ldots, lh, z, ub, T1, T2, Q, bq, wl)

        self.go("3:24:27.87", FadeOut(VGroup(Q, bq, wl, ub, lh, ldots, z)), *[l.animate.set_color(FAINT) for l in ax.xl], run=0.5)
        self.title("Midpoints", "3:24:28.45")
        self.go("3:24:29.11", Transform(rs, rects(ax, 4, "midpoint")), run=0.8)
        mdots = corner_dots(ax, 4, "midpoint")
        ml = VGroup(*[M(s, size=30, color=ORG).next_to(ax.c2p(x, 0), DOWN, buff=0.55)
                      for s, x in (("0.25", 0.25), ("0.75", 0.75), ("1.25", 1.25), ("1.75", 1.75))])
        ticks = VGroup(*[Line(ax.c2p(x, 0) + UP * 0.08, ax.c2p(x, 0) + DOWN * 0.08, color=ORG, stroke_width=4)
                         for x in (0.25, 0.75, 1.25, 1.75)])
        for i, t in enumerate(("3:24:31.05", "3:24:32.23", "3:24:33.63", "3:24:35.01")):
            self.go(t, FadeIn(ml[i]), Create(ticks[i]), FadeIn(mdots[i], scale=0.5), run=0.35)
        mh = height_labels(ax, M_H, "midpoint", shifts=(0.0, 0.45, 0.5, 0.55))
        for i, t in enumerate(("3:24:37.53", "3:24:39.59", "3:24:41.37", "3:24:42.99")):
            self.go(t, FadeIn(mh[i], shift=DOWN * 0.1), run=0.35)
        W = M("5.25", r"\times", "0.5", "=", "2.625", size=56).move_to([3.5, -0.4, 0])
        W[0].set_color(ORG); W[2].set_color(ORG); W[4].set_color(GRN)
        self.go("3:24:46.27", Write(W[0]), run=0.4)
        self.go("3:24:47.39", Write(W[1:3]), run=0.4)
        self.go("3:24:49.19", Write(W[3:]), run=0.4)
        T3 = tally_row("midpoints", "2.625", "close", GRN, 0.4)
        self.go("3:24:50.40", FadeOut(W[0:4]), ReplacementTransform(W[4], T3[1][1]), FadeIn(T3[0]), FadeIn(T3[1][0]), run=0.6)
        self.go("3:24:52.99", FadeIn(T3[2], shift=LEFT * 0.1), run=0.4)
        ob, gb = bits(ax, 4, "midpoint", over=True), bits(ax, 4, "midpoint", over=False)
        self.go("3:24:54.81", FadeIn(ob), run=0.4)
        self.go("3:24:56.03", FadeIn(gb), run=0.4)
        bal = H("they balance", 40, YEL).move_to([3.6, -0.9, 0])
        self.go("3:24:56.83", FadeIn(bal, shift=UP * 0.1), run=0.5)


class K32_More(Shot):
    """More rectangles: n = 4 -> 8 -> 16 -> 64 -> 100, the estimate converging and the waste shrinking; a million;
    infinitely many gives the exact area: a limit."""
    def body(self):
        ax, cv = board_base(self, "More Rectangles")
        X = 3.7

        def rd(n):
            a = M("n", "=", f"{n:,}".replace(",", "{,}"), size=60).move_to([X, 1.35, 0])
            a[2].set_color(ORG)
            b = M(r"A\approx", fmt(rsum(n)), size=60).move_to([X, 0.4, 0])
            b[1].set_color(GRN)
            return a, b
        rs, ob = rects(ax, 4), bits(ax, 4, "right")
        self.go("3:25:05.05", LaggedStart(*[GrowFromEdge(r, DOWN) for r in rs], lag_ratio=0.15), run=0.6)
        RN, RA = rd(4)
        self.play(FadeIn(ob), FadeIn(RN), FadeIn(RA), run_time=0.4)
        self.go("3:25:08.27", Indicate(RN[2], color=ORG, scale_factor=1.3), run=0.5)
        wn = note("wasted", ob[2], UL, color=RED, dist=0.7)
        self.go("3:25:10.05", FadeIn(wn[0]), Create(wn[1]), run=0.5)
        self.go("3:25:11.29", FadeOut(wn), run=0.3)
        for n, t in ((8, "3:25:11.60"), (16, "3:25:12.15"), (64, "3:25:12.70"), (100, "3:25:13.25")):
            a, b = rd(n)
            self.go(t, Transform(rs, rects(ax, n)), Transform(ob, bits(ax, n, "right")),
                    ReplacementTransform(RN, a), ReplacementTransform(RA, b), run=0.5)
            RN, RA = a, b
        sh = area(ax, F, 0, 2, opacity=0.45)
        a, b = rd(1000000)
        self.go("3:25:15.47", FadeOut(rs), FadeOut(ob), FadeIn(sh), ReplacementTransform(RN, a), ReplacementTransform(RA, b), run=0.6)
        RN, RA = a, b
        inf = M(r"n\to\infty", size=60).move_to(RN)
        inf[0][0].set_color(ORG); inf[0][2:].set_color(ORG)
        self.go("3:25:18.51", ReplacementTransform(RN, inf), run=0.5)
        self.go("3:25:23.45", Indicate(sh, color=GRN, scale_factor=1.0), run=0.7)
        ex = H("exact area", 44, GRN).move_to([X, -0.9, 0])
        self.go("3:25:25.71", FadeIn(ex, shift=UP * 0.1), run=0.5)
        lim = M(r"=\lim_{n\to\infty}\big(\text{sum}\big)", size=56, color=YEL).move_to([X, -2.0, 0])
        self.go("3:25:30.40", Write(lim), run=0.6)


def first_rects(ax):
    return rects(ax, 8, "right")


class K32_Limit(Shot):
    """n rectangles on [0, 2]: width 2/n = delta x (change in x); right ends at 2/n, 4/n, ..."""
    def body(self):
        ax, cv = board_base(self, "More Rectangles")
        X = 3.7
        sh = area(ax, F, 0, 2, opacity=0.45)
        inf = M(r"n\to\infty", size=60).move_to([X, 1.35, 0])
        inf[0][0].set_color(ORG); inf[0][2:].set_color(ORG)
        RA = M(r"A\approx", fmt(rsum(1000000)), size=60).move_to([X, 0.4, 0])
        RA[1].set_color(GRN)
        ex = H("exact area", 44, GRN).move_to([X, -0.9, 0])
        lim = M(r"=\lim_{n\to\infty}\big(\text{sum}\big)", size=56, color=YEL).move_to([X, -2.0, 0])
        self.add(sh, inf, RA, ex, lim)
        self.go("3:25:31.42", FadeOut(VGroup(inf, RA, ex, lim)), run=0.4)
        self.title("Using n Rectangles")
        lab = M("y=x^2", r",\ 0\le x\le 2", size=50).move_to([X, 1.4, 0])
        lab[0].set_color(BLUE); lab[1].set_color(ORG)
        self.go("3:25:33.67", Write(lab), run=0.6)
        rs = first_rects(ax)
        nl = TX(r"$n$ rectangles", size=44).move_to([X, 0.5, 0])
        nl[0][0].set_color(ORG)
        self.go("3:25:36.71", FadeOut(sh), FadeOut(ax.xl), LaggedStart(*[GrowFromEdge(r, DOWN) for r in rs], lag_ratio=0.08), run=0.8)
        self.play(FadeIn(nl, shift=UP * 0.1), run_time=0.4)
        self.go("3:25:38.35", Indicate(nl[0][0], color=ORG, scale_factor=1.4), run=0.5)
        br = Brace(Line(ax.c2p(0, 0), ax.c2p(0.25, 0)), DOWN, buff=0.12, color=ORG)
        bl = M(r"\frac{2}{n}", size=40, color=ORG).next_to(br, DOWN, buff=0.08)
        DX = M(r"\text{width}", "=", r"\frac{2}{n}", size=56).move_to([X, -0.75, 0])
        DX[2].set_color(ORG)
        self.go("3:25:42.05", GrowFromCenter(br), FadeIn(bl), Write(DX), run=0.6)
        DX2 = M(r"\Delta x", "=", r"\frac{2}{n}", size=56)
        DX2.shift(DX[1].get_center() - DX2[1].get_center())
        DX2[0].set_color(ORG); DX2[2].set_color(ORG)
        bl2 = M(r"\Delta x", size=40, color=ORG).next_to(br, DOWN, buff=0.1)
        self.go("3:25:44.37", ReplacementTransform(DX, DX2), ReplacementTransform(bl, bl2), run=0.6)
        cn = note("change in x", DX2[0], DL, color=YEL, size=36, dist=0.5)
        self.go("3:25:46.31", FadeIn(cn[0]), Create(cn[1]), run=0.5)
        self.go("3:25:48.47", FadeOut(br), FadeOut(bl2), FadeOut(cn), run=0.4)
        d1, d2 = Dot(ax.c2p(0.25, 0), radius=0.08, color=ORG).set_z_index(6), Dot(ax.c2p(0.5, 0), radius=0.08, color=ORG).set_z_index(6)
        e1 = M(r"\frac{2}{n}", size=40, color=ORG).next_to(d1, DOWN, buff=0.15)
        e2 = M(r"\frac{4}{n}", size=40, color=ORG).next_to(d2, DOWN, buff=0.15)
        self.go("3:25:50.21", Indicate(rs[0], color=ORG, scale_factor=1.0), run=0.6)
        self.go("3:25:52.11", FadeIn(d1, scale=0.5), FadeIn(e1, shift=UP * 0.1), run=0.5)
        self.go("3:25:53.89", Indicate(rs[1], color=ORG, scale_factor=1.0), run=0.6)
        self.go("3:25:54.81", FadeIn(d2, scale=0.5), FadeIn(e2, shift=UP * 0.1), run=0.5)
