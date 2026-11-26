"""Builder 34: start of Chapter 12 "The Fundamental Theorem and Substitution" (3:33:05.37 - 3:39:15.84).
The two ideas (antiderivatives, areas by rectangles: a whole page of working) joined; FTC part 2 stated
(if F' = f then the integral from a to b of f is F(b) - F(a)) with the three moves; tested on the integral of x^2
from 0 to 2 = 8/3 against the old Riemann sums (n = 4, 8, 32 right sums -> 8/3); bracket notation and why + C cancels;
WHY: the area function A(x) swept out by a moving vertical line with its value traced as a graph below; the thin
strip h wide (zoomed: the curved top is only a tiny error) gives dA ~ f(x) h, so A'(x) = f(x) as h -> 0; the height is
the rate (live 'height' and 'slope of A' readouts agree, tall = fast, short = slow, zero = none); the two parts and the
short proof F(b) - F(a) = A(b) - A(a) = area - 0; part 1 written properly (t is a placeholder, x goes in);
part 1 examples (sqrt(t^3+1), upper limit x^2 with the chain rule, x at the bottom flips the sign); part 2 examples.
Colours: f / graphs BLUE, derivatives and rates PINK, integrals / area / answers GRN, limits and numbers ORG,
key words YEL, + C cancelled in RED.
Whisper fixes on screen: "f is any antiderivative of f" = F' = f, "f of B minus f of A" = F(b) - F(a),
"Let's include it in C" = include the + C, "fixed point A" = lower limit a (the area function alone is capital A).
The voice says h for the strip width (not dx), so h is on screen.
END SEAM: K34_Ex2 ends mid-example: the integral of sin x from 0 to pi = [-cos x] from 0 to pi on the top row,
"top: -cos(pi) = -(-1) = 1" and "bottom: -cos 0 = -1" below, a shaded sine hump with "?" on the right.
The next builder picks up at "1 minus negative 1 ... 2"."""
from common import *

ARC = 0.55 * PI
CX = 4.55            # centre of the right-hand column on the two-graph boards


# ---------------------------------------------------------------- local helpers

def F_(x):
    """The curve for the area-function shots: tall, short, touches zero at pi, tall again."""
    return 1 + np.cos(x)


A0 = 0.5             # the fixed lower limit a


def Aof(x):
    """A(x) = integral of F_ from A0 to x, in closed form."""
    return (x + np.sin(x)) - (A0 + np.sin(A0))


_xs = np.linspace(A0, 4.0, 40001)
assert abs(np.mean(F_(_xs)) * (4.0 - A0) - Aof(4.0)) < 1e-3   # closed form matches the plotted f


def G_(x):
    """A generic positive hill for the statement / proof graphs."""
    return 1.1 + 0.55 * np.sin(1.2 * x - 1.0) + 0.1 * x


def at_eq(line, i, x, y):
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def unclock(*ms):
    for m in ms:
        for x in m.get_family():
            x.clear_updaters()


def live_in(scene, *mobs, run=0.4):
    """Fade in always_redraw objects: fade a frozen copy, then swap in the live ones."""
    st_ = [m.copy() for m in mobs]
    unclock(*st_)
    scene.play(*[FadeIn(s) for s in st_], run_time=run)
    scene.remove(*st_)
    scene.add(*mobs)


def arrow(p, q, color=CHALK, w=5):
    return Arrow(np.array([*p, 0], float), np.array([*q, 0], float), buff=0, stroke_width=w, tip_length=0.24,
                 color=color, max_stroke_width_to_length_ratio=20, max_tip_length_to_length_ratio=0.4)


def top_glyphs(part, k=1):
    """The k highest glyphs of a MathTex part (the upper limit of an integral)."""
    return VGroup(*sorted(part, key=lambda g: -g.get_center()[1])[:k])


def upper(part):
    """Glyphs of an integral part that sit above the middle of the integral sign (the upper limit)."""
    sign = max(part, key=lambda g: g.height)
    return VGroup(*[g for g in part if g is not sign and g.get_center()[1] > sign.get_center()[1] + 0.05])


def rsum(n):
    """Right Riemann sum for x^2 on [0, 2] with n rectangles."""
    w = 2 / n
    return sum((w * i) ** 2 for i in range(1, n + 1)) * w


def lim_labels(br, a, b, size=44, color=ORG):
    """a at the bottom right and b at the top right of a closing bracket."""
    la = M(a, size=size, color=color).next_to(br.get_corner(DR), RIGHT, buff=0.08).shift(UP * 0.12)
    lb = M(b, size=size, color=color).next_to(br.get_corner(UR), RIGHT, buff=0.08).shift(DOWN * 0.12)
    return la, lb


def strip(ax, x0, h, color=ORG, op=0.65):
    xs = np.linspace(x0, x0 + h, 24)
    pts = [ax.c2p(x0, 0)] + [ax.c2p(x, F_(x)) for x in xs] + [ax.c2p(x0 + h, 0)]
    return Polygon(*pts, stroke_color=color, stroke_width=2, fill_color=color, fill_opacity=op).set_z_index(2)


def two_axes():
    top = axes((0, 6.5, 1), (0, 2.5, 1), x_length=7.4, y_length=2.2, center=(-2.6, 0.95, 0), nums=False, y_label=None)
    bot = axes((0, 6.5, 1), (0, 6, 2), x_length=7.4, y_length=2.2, center=(-2.6, -2.25, 0), nums=False, y_label=None)
    return top, bot


def pair(a, b, col, size=40):
    """'tall -> fast' as Kalam words around a maths arrow."""
    return VGroup(H(a, size, col), M(r"\to", size=size + 4, color=col), H(b, size, col)).arrange(RIGHT, buff=0.18)


# ---------------------------------------------------------------- shots

class K34_TwoIdeas(Shot):
    """The two separate ideas, the page of rectangle work, and the promise: this chapter connects them."""
    def body(self):
        self.title("Two Separate Ideas", "3:33:10.09")
        boxes = VGroup(*[RoundedRectangle(width=5.6, height=4.0, corner_radius=0.3, stroke_color=FAINT, stroke_width=3)
                         .move_to([x, -0.6, 0]) for x in (-3.4, 3.4)])
        self.go("3:33:12.19", LaggedStart(Create(boxes[0]), Create(boxes[1]), lag_ratio=0.3), run=0.9)
        gap = DashedLine([0, 1.3, 0], [0, -2.5, 0], color=RED, stroke_width=3, dash_length=0.12)
        self.go("3:33:13.37", Create(gap), run=0.5)
        # left: antiderivatives
        l1 = H("antiderivatives", 42, YEL).move_to([-3.4, 0.85, 0])
        self.go("3:33:14.93", FadeIn(l1, shift=DOWN * 0.1), run=0.5)
        two = M("2x", size=72, color=PINK).move_to([-1.95, -0.5, 0])
        sq = M("x^2", size=72, color=BLUE).move_to([-4.85, -0.45, 0])
        ar = arrow([-2.65, -0.5], [-4.15, -0.5], GRN)
        und = H("undo a derivative", 36, DIM).move_to([-3.4, -1.9, 0])
        self.go("3:33:16.21", FadeIn(two, shift=LEFT * 0.15), run=0.35)
        self.play(GrowArrow(ar), FadeIn(und), run_time=0.45)
        self.play(FadeIn(sq, shift=LEFT * 0.2), run_time=0.35)
        # right: definite integrals
        l2 = H("definite integrals", 42, YEL).move_to([3.4, 0.85, 0])
        ax = Axes(x_range=[0, 4, 1], y_range=[0, 2.5, 1], x_length=4.3, y_length=2.1,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, include_ticks=False)).move_to([3.4, -0.75, 0])
        hill = lambda x: 0.9 + 0.5 * np.sin(1.2 * x) + 0.15 * x
        cv = curve(ax, hill, [0, 3.85]).set_z_index(2)
        self.go("3:33:17.77", FadeIn(l2, shift=DOWN * 0.1), Create(ax), run=0.5)
        self.play(draw(cv, run=0.6))
        ar_ = area(ax, hill, 0.5, 3.5)
        self.go("3:33:19.85", FadeIn(ar_), run=0.5)
        r4, r8, r16 = (riemann(ax, hill, 0.5, 3.5, n) for n in (4, 8, 16))
        self.go("3:33:21.03", FadeOut(ar_), LaggedStart(*[GrowFromEdge(r, DOWN) for r in r4], lag_ratio=0.15), run=0.7)
        self.go("3:33:22.17", Transform(r4, r8), run=0.5)
        self.go("3:33:22.77", Transform(r4, r16), run=0.5)
        # a whole page
        self.wipe("3:33:23.91")
        page = RoundedRectangle(width=7.6, height=5.0, corner_radius=0.2, stroke_color=CHALK, stroke_width=3).move_to([0, -0.75, 0])
        lines = VGroup(M(r"\sum_{i=1}^{n}\left(\frac{2i}{n}\right)^2\cdot\frac{2}{n}", size=42),
                       M(r"=\frac{8}{n^3}\left(1^2+2^2+\dots+n^2\right)", size=42),
                       M(r"=\frac{8}{n^3}\cdot\frac{n(n+1)(2n+1)}{6}", size=42),
                       M(r"\to\ \frac{8}{3}\ \text{ as } n\to\infty", size=42, color=GRN)).arrange(DOWN, buff=0.22, aligned_edge=LEFT)
        lines.move_to(page).shift(LEFT * 0.3)
        self.go("3:33:24.33", Create(page), run=0.45)
        for ln, t in zip(lines, ("3:33:24.81", "3:33:25.45", "3:33:26.10", "3:33:26.75")):
            self.go(t, Write(ln), run=0.55)
        self.go("3:33:27.35", Circumscribe(page, color=YEL, buff=0.06), run=0.9)
        # this chapter connects them
        self.wipe("3:33:28.49")
        pa = pill("antiderivatives", PINK, 42).move_to([-3.5, 0.4, 0])
        pb = pill("areas", GRN, 42).move_to([3.5, 0.4, 0])
        self.go("3:33:28.89", FadeIn(pa, scale=0.85), FadeIn(pb, scale=0.85), run=0.4)
        br = ArcBetweenPoints(pa.get_right() + RIGHT * 0.15 + UP * 0.1, pb.get_left() + LEFT * 0.15 + UP * 0.1, angle=-PI / 3,
                              color=YEL, stroke_width=6)
        eq = M("=", size=90, color=YEL).move_to([0, 0.35, 0])
        self.go("3:33:29.27", Create(br), run=0.6)
        self.play(Write(eq), run_time=0.4)
        easy = VGroup(tick_mark(GRN, 0.5), H("almost easy", 40, GRN)).arrange(RIGHT, buff=0.2).next_to(pb, DOWN, buff=0.45)
        self.go("3:33:32.29", FadeIn(easy, shift=UP * 0.1), run=0.5)
        s1 = H("1. show it", 42).move_to([-2.4, -2.3, 0])
        s2 = H("2. why it works", 42).move_to([2.4, -2.3, 0])
        self.go("3:33:35.27", FadeIn(s1, shift=UP * 0.1), run=0.5)
        self.go("3:33:36.69", FadeIn(s2, shift=UP * 0.1), run=0.5)
        ul = brush_line(s1.width + 0.3, YEL, center=s1.get_bottom() + DOWN * 0.12)
        self.go("3:33:37.40", Create(ul), run=0.5)


class K34_Statement(Shot):
    """FTC part 2: if F' = f, the integral from a to b of f is F(b) - F(a). No rectangles: three moves."""
    def body(self):
        self.title("The Fundamental Theorem", "3:33:38.67")
        cond = M(r"\text{If }", "F'", "=", "f", r"\text{,}", size=56).move_to([0, 1.8, 0])
        cond[3].set_color(BLUE)
        self.go("3:33:41.79", Write(cond[0]), run=0.3)
        self.go("3:33:42.05", Write(cond[1]), run=0.4)
        self.go("3:33:43.49", Write(cond[2:]), run=0.6)
        ln = M(r"\int_a^b", r"f(x)\,dx", "=", "F(b)", "-", "F(a)", size=74).move_to([0, 0.5, 0])
        ln[0].set_color(GRN); ln[1].set_color(BLUE)
        self.go("3:33:45.41", Write(ln[0]), run=0.5)
        self.go("3:33:46.15", Write(ln[1]), run=0.5)
        self.go("3:33:46.85", Indicate(ln[0], color=ORG, scale_factor=1.1), run=0.6)
        self.go("3:33:47.53", Write(ln[2]), run=0.3)
        self.go("3:33:48.05", Write(ln[3]), run=0.5)
        self.go("3:33:48.87", Write(ln[4]), run=0.3)
        self.go("3:33:49.27", Write(ln[5]), run=0.5)
        pn = panel(VGroup(cond, ln), PURP, buff=0.3)
        self.go("3:33:50.10", Create(pn), run=0.6)
        # the area it gives
        ax = axes((0, 5, 1), (0, 2.5, 1), x_length=5.2, y_length=2.3, center=(-3.4, -2.25, 0), nums=False, y_label=None)
        cv = curve(ax, G_, [0, 4.8]).set_z_index(2)
        self.go("3:33:51.63", Create(ax), FadeIn(ax.labels), run=0.5)
        self.play(draw(cv, run=0.6))
        sh = area(ax, G_, 1, 4)
        la = M("a", size=40, color=ORG).next_to(ax.c2p(1, 0), DOWN, buff=0.12)
        lb = M("b", size=40, color=ORG).next_to(ax.c2p(4, 0), DOWN, buff=0.12)
        self.go("3:33:52.75", FadeIn(sh), FadeIn(la), FadeIn(lb), run=0.6)
        rs = riemann(ax, G_, 1, 4, 6, color=ORG, opacity=0.35)
        self.go("3:33:54.25", FadeIn(rs), run=0.4)
        cx = cross_mark(RED, 0.5).move_to(ax.c2p(2.5, 0.9))
        self.go("3:33:54.83", Create(cx), run=0.4)
        self.go("3:33:55.50", FadeOut(rs), FadeOut(cx), run=0.4)
        # three moves
        s1 = TX(r"1. find $F$", 42).move_to([0.9, -1.25, 0], aligned_edge=LEFT)
        s2 = TX(r"2. plug in $b$, then $a$", 42).move_to([0.9, -2.15, 0], aligned_edge=LEFT)
        s3 = TX(r"3. subtract", 42).move_to([0.9, -3.05, 0], aligned_edge=LEFT)
        self.go("3:33:56.39", FadeIn(s1, shift=UP * 0.1), Indicate(cond[1], color=YEL), run=0.6)
        self.go("3:33:58.23", FadeIn(s2, shift=UP * 0.1), run=0.5)
        self.go("3:33:58.71", Indicate(ln[3], color=YEL), Indicate(lb, color=YEL), run=0.7)
        self.go("3:34:00.07", Indicate(ln[5], color=YEL), Indicate(la, color=YEL), run=0.7)
        self.go("3:34:01.09", FadeIn(s3, shift=UP * 0.1), Indicate(ln[4], color=YEL, scale_factor=1.6), run=0.6)


class K34_TestIt(Shot):
    """The integral of x^2 from 0 to 2 by the theorem: 8/3 in four lines, against the rectangle sums."""
    def body(self):
        self.title("Test It on Our Old Area", "3:34:02.60")
        ax = axes((0, 2.5, 1), (0, 4.5, 1), x_length=4.2, y_length=4.3, center=(4.0, -0.95, 0))
        sq = lambda x: x ** 2
        cv = curve(ax, sq, [0, 2.12]).set_z_index(3)
        r0 = M(r"\int_0^2", "x^2", r"\,dx", size=60)
        r0[0].set_color(GRN); r0[1].set_color(BLUE)
        r0.move_to([-3.4, 1.72, 0])
        self.go("3:34:05.89", Write(r0), Create(ax), FadeIn(ax.labels), run=0.8)
        self.play(draw(cv, run=0.6))
        sh = area(ax, sq, 0, 2).set_z_index(1)
        self.go("3:34:07.49", FadeIn(sh), run=0.6)
        EX = -3.2
        r1 = at_eq(M("F(x)", "=", r"\frac{x^3}{3}", size=52), 1, EX, 0.3)
        r2 = at_eq(M("F(", "2", ")", "=", r"\frac{8}{3}", size=52), 3, EX, -0.9)
        r3 = at_eq(M("F(", "0", ")", "=", "0", size=52), 3, EX, -1.95)
        r4 = at_eq(M(r"\frac{8}{3}", "-", "0", "=", r"\frac{8}{3}", size=52), 3, EX, -3.0)
        for r in (r2, r3):
            r[1].set_color(ORG)
        self.go("3:34:09.07", Write(r1[:2]), run=0.5)
        self.go("3:34:11.03", Write(r1[2]), run=0.6)
        self.go("3:34:12.77", Write(r2[:4]), run=0.6)
        self.go("3:34:13.99", Write(r2[4]), run=0.5)
        self.go("3:34:15.33", Write(r3[:4]), run=0.6)
        self.go("3:34:16.67", Write(r3[4]), run=0.4)
        self.go("3:34:17.41", Write(r4[:3]), run=0.6)
        self.go("3:34:18.35", Write(r4[3:]), run=0.5)
        r4[4].set_color(GRN)
        bx = answer_box(r4[4])
        self.go("3:34:19.51", Create(bx), run=0.5)
        # the rectangles again: right sums settle on 8/3
        pos = np.array([-0.15, 0.95, 0])

        def rd(n, val):
            return M(f"n={n}", r"\;\approx\;", val, size=44, color=ORG).move_to(pos)
        rects = riemann(ax, sq, 0, 2, 4, rule="right", color=ORG, opacity=0.35)
        lab = rd(4, f"{rsum(4):.2f}")
        self.go("3:34:21.21", FadeOut(sh), FadeIn(rects), FadeIn(lab), run=0.5)
        for n, t in ((8, "3:34:22.13"), (32, "3:34:22.63")):
            new = riemann(ax, sq, 0, 2, n, rule="right", color=ORG, opacity=0.35)
            self.go(t, Transform(rects, new), Transform(lab, rd(n, f"{rsum(n):.2f}")), run=0.45)
        fin = M(r"n\to\infty", r"\;=\;", r"\frac{8}{3}", size=44, color=GRN).move_to(pos)
        self.go("3:34:23.39", FadeOut(rects), FadeIn(sh), Transform(lab, fin), run=0.6)
        pg = H("a whole page", 34, DIM).next_to(lab, DOWN, buff=0.2)
        self.go("3:34:24.51", FadeIn(pg, shift=UP * 0.1), run=0.5)
        two = H("two seconds", 36, GRN).next_to(bx, RIGHT, buff=0.35)
        self.go("3:34:26.29", Circumscribe(bx, color=YEL, buff=0.08), FadeIn(two, shift=LEFT * 0.1), run=0.9)


class K34_Brackets(Shot):
    """[F(x)] from a to b means F(b) - F(a); with + C the C's cancel, so definite integrals skip it."""
    def body(self):
        self.title("Bracket Notation", "3:34:28.37")
        EX = -1.0
        l1 = M(r"\Big[", "F(x)", r"\Big]", size=74)
        a1, b1 = lim_labels(l1[2], "a", "b")
        rhs1 = M("=", "F(b)", "-", "F(a)", size=74)
        rhs1.move_to([EX, 1.45, 0], aligned_edge=LEFT).shift(LEFT * 0.0)
        VGroup(l1, a1, b1).next_to(rhs1, LEFT, buff=0.25)
        self.go("3:34:30.29", Write(l1[0]), Write(l1[2]), run=0.6)
        a1, b1 = lim_labels(l1[2], "a", "b")
        self.go("3:34:32.19", Write(l1[1]), run=0.6)
        self.go("3:34:34.81", FadeIn(a1, scale=0.8), run=0.3)
        self.go("3:34:35.33", FadeIn(b1, scale=0.8), run=0.3)
        self.go("3:34:37.71", Indicate(a1, color=YEL, scale_factor=1.4), run=0.6)
        self.go("3:34:38.47", Indicate(b1, color=YEL, scale_factor=1.4), run=0.6)
        self.go("3:34:40.07", Write(rhs1[0]), run=0.3)
        self.go("3:34:40.55", Write(VGroup(rhs1[1][0], rhs1[1][1], rhs1[1][3])), TransformFromCopy(b1, rhs1[1][2], path_arc=-ARC), run=0.7)
        self.go("3:34:42.19", Write(VGroup(rhs1[3][0], rhs1[3][1], rhs1[3][3])), TransformFromCopy(a1, rhs1[3][2], path_arc=-ARC), run=0.7)
        self.go("3:34:43.37", Write(rhs1[2]), run=0.35)
        # what about + C?
        q = M(r"+C\,?", size=56, color=YEL).next_to(l1, DOWN, buff=0.45)
        self.go("3:34:47.25", FadeIn(q, shift=UP * 0.1), run=0.4)
        l2 = M(r"\Big[", "F(x)", "+C", r"\Big]", size=66)
        l2[2].set_color(YEL)
        rhs2 = M("=", "(", "F(b)", "+C", ")", "-", "(", "F(a)", "+C", ")", size=66)
        rhs2[3].set_color(YEL); rhs2[8].set_color(YEL)
        rhs2.move_to([EX, -0.3, 0], aligned_edge=LEFT)
        rhs2.shift(RIGHT * (rhs1[0].get_x() - rhs2[0].get_x()))
        l2.next_to(rhs2, LEFT, buff=0.25).shift(LEFT * 0.35)
        a2, b2 = lim_labels(l2[3], "a", "b", size=40)
        self.go("3:34:48.71", ReplacementTransform(q, l2[2]), Write(VGroup(l2[0], l2[1], l2[3])), FadeIn(a2), FadeIn(b2), run=0.7)
        self.go("3:34:50.13", Write(rhs2[:5]), run=0.8)
        self.go("3:34:51.43", Write(rhs2[5:]), run=0.8)
        k1, k2 = strike(rhs2[3]), strike(rhs2[8])
        self.go("3:34:54.01", Create(k1), Create(k2), run=0.5)
        l3 = M("=", "F(b)", "-", "F(a)", size=66, color=GRN)
        l3.shift(RIGHT * (rhs2[0].get_x() - l3[0].get_x()) + UP * (-1.65 - l3[0].get_y()))
        self.go("3:34:55.35", Write(l3), run=0.7)
        nt = TX(r"definite integrals: no $+C$ needed", 42, GRN).move_to([0, -2.85, 0])
        self.go("3:34:58.63", FadeIn(nt, shift=UP * 0.1), run=0.5)
        self.go("3:34:59.67", Create(strike(l2[2], RED, 5)), run=0.4)


class K34_Sweep(Shot):
    """Why it works: A(x) = area from a to x. A vertical line sweeps right, the area grows, its value traces a graph."""
    def body(self):
        self.title("Why Does It Work?", "3:35:01.53")
        pa = pill("undo a derivative", PINK, 42).move_to([-3.3, 0.0, 0])
        pb = pill("area", GRN, 42).move_to([3.3, 0.0, 0])
        qm = H("?", 110, YEL).move_to([0, 0, 0])
        self.go("3:35:03.43", FadeIn(pa, scale=0.85), run=0.4)
        self.go("3:35:05.31", FadeIn(pb, scale=0.85), Write(qm), run=0.5)
        self.go("3:35:06.97", Indicate(qm, color=YEL), run=0.7)
        self.go("3:35:08.53", Circumscribe(VGroup(pa, qm, pb), color=YEL, buff=0.15), run=1.0)
        self.wipe("3:35:10.05")
        top, bot = two_axes()
        cv = curve(top, F_, [0, 6.4]).set_z_index(3)
        fl = M("f", size=48, color=BLUE).next_to(top.c2p(6.4, F_(6.4)), RIGHT, buff=0.2)
        self.go("3:35:10.45", Create(top), FadeIn(top.labels), run=0.5)
        self.play(draw(cv, run=0.8), FadeIn(fl), run_time=0.8)
        nm = M("A(x)", size=72, color=GRN).move_to([CX, 1.45, 0])
        self.go("3:35:12.49", Write(nm), run=0.5)
        xt = ValueTracker(2.0)
        X = lambda: max(xt.get_value(), A0 + 0.02)
        sh = always_redraw(lambda: area(top, F_, A0, X()).set_z_index(1))
        vl = always_redraw(lambda: Line(top.c2p(X(), 0), top.c2p(X(), F_(X())), color=YEL, stroke_width=5).set_z_index(4))
        xl = always_redraw(lambda: M("x", size=44, color=YEL).next_to(top.c2p(X(), 0), DOWN, buff=0.12))
        df = TX(r"area from $a$ to $x$", 40, DIM).move_to([CX, 0.6, 0])
        self.go("3:35:14.37", Write(df), run=0.6)
        live_in(self, sh, vl, run=0.5)
        al = M("a", size=44, color=ORG).next_to(top.c2p(A0, 0), DOWN, buff=0.12)
        atk = Line(top.c2p(A0, 0), top.c2p(A0, F_(A0)), color=ORG, stroke_width=3).set_z_index(4)
        self.go("3:35:17.35", FadeIn(al, shift=UP * 0.1), Create(atk), run=0.5)
        self.go("3:35:18.93", Indicate(df, color=YEL, scale_factor=1.05), run=0.2)
        live_in(self, xl, run=0.3)
        # the second graph: the value of A(x)
        al2 = M("A", size=48, color=GRN).next_to(bot.c2p(6.4, Aof(6.4)), RIGHT, buff=0.2)
        tr = always_redraw(lambda: bot.plot(Aof, x_range=[A0, X()], color=GRN, stroke_width=5).set_z_index(3))
        dt = always_redraw(lambda: pt(bot, X(), Aof(X()), GRN, 0.09))
        cn = always_redraw(lambda: DashedLine(top.c2p(X(), 0), bot.c2p(X(), Aof(X())), color=FAINT, stroke_width=2, dash_length=0.08))
        rl = M("A(x)", "=", size=56, color=GRN).move_to([CX - 0.5, -1.0, 0])
        rn = always_redraw(lambda: M(f"{Aof(X()):.1f}", size=56, color=GRN).next_to(rl, RIGHT, buff=0.2))
        self.go("3:35:20.01", Create(bot), FadeIn(bot.labels), FadeIn(al2), FadeIn(rl), run=0.5)
        live_in(self, tr, dt, cn, rn, run=0.3)
        self.play(xt.animate.set_value(6.0), run_time=3.4, rate_func=linear)
        self.go("3:35:25.01", Circumscribe(VGroup(rl, rn), color=YEL, buff=0.12), run=1.0)
        sf = H("the area so far", 38, YEL).next_to(VGroup(rl, rn), DOWN, buff=0.35)
        self.go("3:35:26.27", FadeIn(sf, shift=UP * 0.1), run=0.5)


class K34_Strip(Shot):
    """How fast does A grow? Push x by h: a thin strip ~ f(x) wide h (zoom on its curved top). dA/h -> f(x)."""
    def body(self):
        self.title("How Fast Does Area Grow?", "3:35:28.33")
        ax = axes((0, 6.5, 1), (0, 2.5, 1), x_length=6.6, y_length=3.6, center=(-3.2, -0.55, 0), nums=False,
                  x_label=None, y_label=None)
        cv = curve(ax, F_, [0, 6.4]).set_z_index(3)
        x0 = 5.6
        sh = area(ax, F_, A0, x0).set_z_index(1)
        al = M("a", size=44, color=ORG).next_to(ax.c2p(A0, 0), DOWN, buff=0.12)
        xl = M("x", size=44, color=YEL).next_to(ax.c2p(x0, 0), DOWN, buff=0.12)
        an = M("A(x)", size=48, color=GRN).move_to(ax.c2p(1.35, 0.55))
        self.go("3:35:28.83", FadeIn(VGroup(ax, ax.labels, cv, sh, al, xl, an)), run=0.6)
        q = M("A'(x)", "=", "?", size=66).move_to([3.6, 2.0, 0])
        q[0].set_color(PINK)
        self.go("3:35:32.61", Write(q), run=0.6)
        ht = ValueTracker(0.002)
        sp = always_redraw(lambda: strip(ax, x0, ht.get_value()))
        self.add(sp)
        self.go("3:35:34.85", ht.animate.set_value(0.5), run=1.6)
        top_line = Line(ax.c2p(x0, F_(x0 + 0.5) + 0.08), ax.c2p(x0 + 0.5, F_(x0 + 0.5) + 0.08))
        hb = Brace(top_line, UP, buff=0.05, color=ORG)
        hl = M("h", size=44, color=ORG).next_to(hb, UP, buff=0.08)
        self.go("3:35:37.85", GrowFromCenter(hb), FadeIn(hl), run=0.5)
        self.go("3:35:39.49", Indicate(sp, color=YEL, scale_factor=1.0), run=0.8)
        # zoom on the strip's top
        h = 0.5
        p0, p1 = np.array(ax.c2p(x0, F_(x0))), np.array(ax.c2p(x0 + h, F_(x0 + h)))
        s, k, C = 1.2, 2.4, np.array([3.6, 0.0, 0])
        W = np.array([(p0[0] + p1[0]) / 2, p0[1] + 0.15, 0])
        xL, xR, yB, yT = W[0] - s / 2, W[0] + s / 2, W[1] - s / 2, W[1] + s / 2
        mp = lambda p: C + k * (np.array(p) - W)
        win = Square(side_length=s, color=YEL, stroke_width=3).move_to(W).set_z_index(5)
        frame = Square(side_length=s * k, color=YEL, stroke_width=3).move_to(C)
        cons = VGroup(Line(win.get_corner(UR), frame.get_corner(UL), color=FAINT, stroke_width=2),
                      Line(win.get_corner(DR), frame.get_corner(DL), color=FAINT, stroke_width=2))
        xs = np.linspace(x0, x0 + h, 30)
        cap = Polygon(mp([p0[0], yB, 0]), *[mp(ax.c2p(x, F_(x))) for x in xs], mp([p1[0], yB, 0]),
                      stroke_width=0, fill_color=ORG, fill_opacity=0.65)
        ws = [np.array(ax.c2p(x, F_(x))) for x in np.linspace(x0 - 1, x0 + h + 1, 400)]
        ws = [mp(p) for p in ws if xL <= p[0] <= xR and yB <= p[1] <= yT]
        cseg = VMobject(stroke_color=BLUE, stroke_width=5).set_points_smoothly(ws)
        sides = VGroup(Line(mp([p0[0], yB, 0]), mp(p0), color=ORG, stroke_width=3),
                       Line(mp([p1[0], yB, 0]), mp(p1), color=ORG, stroke_width=3))
        dash = DashedLine(mp(p0), mp([p1[0], p0[1], 0]), color=BLUE, stroke_width=4, dash_length=0.1)
        sl = Polygon(mp(p0), *[mp(ax.c2p(x, F_(x))) for x in xs], mp([p1[0], p0[1], 0]),
                     stroke_width=0, fill_color=RED, fill_opacity=0.55)
        ib = Brace(Line(mp([p0[0], yB, 0]), mp([p1[0], yB, 0])), DOWN, buff=0.1, color=ORG)
        il = M("h", size=48, color=ORG).next_to(ib, DOWN, buff=0.08)
        self.go("3:35:42.29", FadeOut(hb), FadeOut(hl), Create(win), run=0.4)
        self.play(Create(cons), Create(frame), FadeIn(cap), Create(cseg), Create(sides), run_time=0.7)
        self.go("3:35:44.47", GrowFromCenter(ib), FadeIn(il), run=0.5)
        # height f(x) on the main graph and in the zoom
        fh = Line(ax.c2p(x0, 0), ax.c2p(x0, F_(x0)), color=BLUE, stroke_width=6).set_z_index(4)
        fl = M("f(x)", size=44, color=BLUE).next_to(fh, LEFT, buff=0.15)
        self.go("3:35:46.09", Create(fh), FadeIn(fl), Create(dash), run=0.6)
        self.go("3:35:46.85", FadeIn(sl), run=0.5)
        self.go("3:35:48.39", Indicate(fl, color=YEL), run=0.7)
        ex = M(r"\text{extra}", r"\approx", r"f(x)\cdot h", size=54).move_to([3.6, -2.75, 0])
        ex[2].set_color(ORG)
        self.go("3:35:50.83", Write(ex), run=0.9)
        # algebra: divide by h, then h -> 0
        z = VGroup(win, frame, cons, cap, cseg, sides, dash, sl, ib, il)
        l1 = M(r"\Delta A", r"\approx", r"f(x)\cdot h", size=60).move_to([3.6, 0.75, 0])
        l2 = M(r"\frac{\Delta A}{h}", r"\approx", "f(x)", size=60)
        at_eq(l2, 1, l1[1].get_x(), -0.75)
        l1[0].set_color(GRN); l2[0].set_color(GRN); l2[2].set_color(BLUE)
        self.go("3:35:54.37", FadeOut(z), ReplacementTransform(ex, l1), run=0.7)
        self.go("3:35:58.21", TransformFromCopy(l1, l2), run=0.8)
        self.go("3:36:00.97", Indicate(l2[2], color=YEL), run=0.6)
        h0 = M(r"h\to 0", size=54, color=YEL).move_to([3.6, -2.2, 0])
        self.go("3:36:02.69", FadeIn(h0, shift=UP * 0.1), run=0.3)
        self.play(ht.animate.set_value(0.03), run_time=3.0)
        res = M("f(x)", size=66, color=BLUE).move_to(q[2]).align_to(q[1], DOWN).shift(RIGHT * 0.5)
        res.next_to(q[1], RIGHT, buff=0.25)
        self.go("3:36:08.03", Indicate(q, color=YEL, scale_factor=1.05), run=0.5)
        self.go("3:36:10.09", ReplacementTransform(q[2], res), run=0.5)
        self.play(Create(answer_box(VGroup(q[0], q[1], res))), run_time=0.4)


class K34_Rate(Shot):
    """The height is the rate: 'height' and 'slope of A' read the same; tall = fast, short = slow, zero = none."""
    def body(self):
        self.title("The Height Is the Rate", "3:36:11.94")
        top, bot = two_axes()
        cv = curve(top, F_, [0, 6.4]).set_z_index(3)
        fl = M("f", size=48, color=BLUE).next_to(top.c2p(6.4, F_(6.4)), RIGHT, buff=0.2)
        ac = bot.plot(Aof, x_range=[A0, 6.4], color=GRN, stroke_width=5).set_z_index(3)
        al2 = M("A", size=48, color=GRN).next_to(bot.c2p(6.4, Aof(6.4)), RIGHT, buff=0.2)
        al = M("a", size=44, color=ORG).next_to(top.c2p(A0, 0), DOWN, buff=0.12)
        xt = ValueTracker(4.2)
        X = lambda: xt.get_value()
        sh = always_redraw(lambda: area(top, F_, A0, X()).set_z_index(1))
        vl = always_redraw(lambda: Line(top.c2p(X(), 0), top.c2p(X(), F_(X())), color=YEL, stroke_width=5).set_z_index(4))
        tg = live_tangent(bot, Aof, xt, length=1.6, readout=False)
        cn = always_redraw(lambda: DashedLine(top.c2p(X(), 0), bot.c2p(X(), Aof(X())), color=FAINT, stroke_width=2, dash_length=0.08))
        l1 = TX(r"height $=$", 42, BLUE)
        l2 = TX(r"slope of $A$ $=$", 42, PINK)
        l1.move_to([CX + 0.55, 1.3, 0], aligned_edge=RIGHT)
        l2.move_to([CX + 0.55, 0.3, 0], aligned_edge=RIGHT)
        n1 = always_redraw(lambda: M(f"{F_(X()):.1f}", size=52, color=BLUE).next_to(l1, RIGHT, buff=0.2))
        n2 = always_redraw(lambda: M(f"{slope(Aof, X()) + 0:.1f}", size=52, color=PINK).next_to(l2, RIGHT, buff=0.2))
        self.play(FadeIn(VGroup(top, top.labels, cv, fl, bot, bot.labels, ac, al2, al)), run_time=0.5)
        live_in(self, sh, vl, tg, cn, run=0.4)
        self.go("3:36:14.03", FadeIn(l1), run=0.3)
        live_in(self, n1, run=0.2)
        self.play(FadeIn(l2), run_time=0.3)
        live_in(self, n2, run=0.2)
        self.play(xt.animate.set_value(5.8), run_time=2.1)
        self.go("3:36:17.29", Indicate(VGroup(l1, n1), color=YEL, scale_factor=1.05), run=0.6)
        WP = [CX, -0.9, 0]
        w1 = pair("tall", "fast", YEL).move_to(WP)
        self.go("3:36:19.29", FadeIn(w1[0]), run=0.3)
        self.go("3:36:20.73", FadeIn(w1[1:]), run=0.5)
        w2 = pair("short", "slow", YEL).move_to(WP)
        self.go("3:36:22.27", FadeOut(w1), xt.animate.set_value(2.4), run=1.6)
        self.play(FadeIn(w2), run_time=0.4)
        w3 = pair("zero", "no new area", YEL, 36).move_to(WP)
        self.go("3:36:25.47", FadeOut(w2), xt.animate.set_value(PI), run=1.2)
        self.go("3:36:26.85", FadeIn(w3), run=0.4)
        # so A' = f
        res = M("A'", "=", "f", size=66).move_to([CX, -1.0, 0])
        res[0].set_color(PINK); res[2].set_color(BLUE)
        self.go("3:36:28.49", FadeOut(w3), Write(res), run=0.8)
        ad = TX(r"$A$ is an\\antiderivative of $f$", 40, GRN).move_to([CX, -2.35, 0])
        self.go("3:36:30.83", FadeIn(ad, shift=UP * 0.1), run=0.6)
        self.go("3:36:33.63", Circumscribe(VGroup(res, ad), color=YEL, buff=0.15), run=1.0)
        self.go("3:36:35.11", xt.animate.set_value(5.4), run=2.2)


class K34_TwoParts(Shot):
    """Part 1 (A' = f) and part 2 (F(b) - F(a)); part 2 follows: F = A + C, A(b) is the area, A(a) = 0."""
    def body(self):
        self.title("Two Parts", "3:36:38.30")
        p1 = VGroup(pill("Part 1", YEL, 40), M("A'(x)", "=", "f(x)", size=66)).arrange(RIGHT, buff=0.6)
        p1[1][0].set_color(PINK); p1[1][2].set_color(BLUE)
        p2 = VGroup(pill("Part 2", YEL, 40), M(r"\int_a^b f(x)\,dx", "=", "F(b)-F(a)", size=66)).arrange(RIGHT, buff=0.6)
        p2[1][0].set_color(GRN)
        p1.move_to([0, 1.1, 0]).align_to(p2.move_to([0.9, -0.9, 0]), LEFT)
        self.go("3:36:38.89", FadeIn(p1[0], scale=0.85), Write(p1[1]), run=0.8)
        self.go("3:36:43.15", FadeIn(p2[0], scale=0.85), Write(p2[1]), run=1.0)
        fo = CurvedArrow(p1[0].get_left() + LEFT * 0.15, p2[0].get_left() + LEFT * 0.15, angle=PI / 2, color=YEL, stroke_width=4)
        fw = H("follows", 36, YEL).next_to(fo, LEFT, buff=0.15)
        self.go("3:36:46.87", Create(fo), FadeIn(fw), run=0.6)
        # the short proof
        self.wipe("3:36:48.51")
        r1 = M("F(x)", "=", "A(x)", "+", "C", size=62).move_to([0, 1.45, 0])
        r1[2].set_color(GRN); r1[4].set_color(YEL)
        self.go("3:36:48.85", Write(r1[2]), run=0.5)
        self.go("3:36:50.67", Write(r1[0:2]), run=0.6)
        self.go("3:36:53.25", Write(r1[3:]), run=0.5)
        self.play(Indicate(r1[4], color=YEL, scale_factor=1.4), run_time=0.6)
        r2 = M("F(b)", "-", "F(a)", "=", "A(b)", "-", "A(a)", size=62)
        at_eq(r2, 3, r1[1].get_x(), 0.2)
        self.go("3:36:55.53", Write(r2[:3]), run=0.7)
        self.go("3:36:57.63", Write(r2[3:]), run=0.9)
        ax = axes((0, 5, 1), (0, 2.5, 1), x_length=4.6, y_length=2.3, center=(4.25, -2.3, 0), nums=False, y_label=None)
        cv = curve(ax, G_, [0, 4.8]).set_z_index(2)
        sh = area(ax, G_, 1, 4)
        la = M("a", size=40, color=ORG).next_to(ax.c2p(1, 0), DOWN, buff=0.12)
        lb = M("b", size=40, color=ORG).next_to(ax.c2p(4, 0), DOWN, buff=0.12)
        self.go("3:37:00.55", FadeIn(VGroup(ax, ax.labels, cv, la, lb)), run=0.4)
        ab = M("A(b)", size=44, color=GRN).move_to(ax.c2p(2.5, 0.75))
        self.go("3:37:02.19", FadeIn(sh), FadeIn(ab), r2[4].animate.set_color(GRN), run=0.6)
        r3 = M("=", r"\text{area}", "-", "0", "=", r"\text{area}", size=62)
        at_eq(r3, 0, -5.9, -1.15)
        r3[1].set_color(GRN); r3[5].set_color(GRN)
        self.go("3:37:02.93", Write(r3[:2]), run=0.6)
        zl = Line(ax.c2p(1, 0), ax.c2p(1, G_(1)), color=YEL, stroke_width=5).set_z_index(4)
        za = note(r"A(a)=0", zl, LEFT, YEL, 34, math=True, dist=0.9, angle=0.4)
        self.go("3:37:04.57", Create(zl), FadeIn(za), r2[6].animate.set_color(YEL), run=0.6)
        self.go("3:37:05.49", Write(r3[2:4]), run=0.5)
        self.go("3:37:06.55", Indicate(zl, color=YEL, scale_factor=1.0), run=0.5)
        self.go("3:37:07.97", Write(r3[4:]), run=0.5)
        self.play(Create(answer_box(r3[5])), run_time=0.4)


class K34_PartOne(Shot):
    """d/dx of the integral from a to x of f(t) dt is f(x). t is a placeholder; the x on top goes into f."""
    def body(self):
        self.title("Writing It Properly", "3:37:10.25")
        pl = pill("Part 1", YEL, 42).move_to([0, 1.75, 0])
        self.go("3:37:14.67", FadeIn(pl, scale=0.85), run=0.5)
        fm = M(r"\frac{d}{dx}", r"\int_a^{x}", "f(t)", r"\,dt", "=", "f(x)", size=84).move_to([0, 0.15, 0])
        fm[0].set_color(PINK); fm[1].set_color(GRN); fm[2].set_color(BLUE); fm[5].set_color(BLUE)
        self.go("3:37:17.87", Write(fm[0]), run=0.5)
        self.go("3:37:20.39", Write(fm[1]), run=0.6)
        self.go("3:37:22.35", Write(fm[2]), run=0.4)
        self.go("3:37:23.05", Write(fm[3]), run=0.3)
        self.go("3:37:23.65", Write(fm[4]), run=0.3)
        self.go("3:37:24.67", Write(fm[5]), run=0.5)
        ts = VGroup(fm[2][2], fm[3][-1])
        ux = upper(fm[1])
        self.go("3:37:27.19", ts.animate.set_color(YEL), Indicate(ts, color=YEL, scale_factor=1.5), run=0.7)
        n1 = note("upper limit", ux, UL, YEL, 36, dist=0.6, angle=0.6)
        self.go("3:37:31.81", ux.animate.set_color(ORG), FadeIn(n1), run=0.6)
        n2 = note("placeholder", fm[2][2], DOWN, YEL, 36, dist=0.35, angle=-0.5)
        self.go("3:37:34.09", FadeIn(n2), run=0.5)
        same = M(r"\int_a^x f(t)\,dt", "=", r"\int_a^x f(u)\,du", size=50, color=DIM).move_to([0, -3.0, 0])
        self.go("3:37:36.07", Write(same), run=0.8)
        # plain words: the x on top goes into f
        self.go("3:37:37.97", FadeOut(n1), FadeOut(n2), FadeOut(same), run=0.4)
        self.go("3:37:40.41", Circumscribe(VGroup(fm[0], fm[3]), color=PINK, buff=0.12), run=0.9)
        self.go("3:37:42.25", Indicate(ux, color=ORG, scale_factor=1.5), run=0.6)
        fx = fm[5][2]
        cp = ux.copy()
        self.go("3:37:44.61", Indicate(fm[5], color=YEL, scale_factor=1.15), run=0.6)
        self.go("3:37:45.53", cp.animate(path_arc=-ARC).move_to(fx).scale(1.3), run=0.8)
        self.play(FadeOut(cp), fx.animate.set_color(ORG), run_time=0.3)
        pw = TX(r"$x$ goes into $f$", 42, ORG).next_to(fm[5], DOWN, buff=0.6)
        self.play(FadeIn(pw, shift=UP * 0.1), run_time=0.4)


class K34_RootEx(Shot):
    """d/dx of the integral from 1 to x of sqrt(t^3 + 1) dt = sqrt(x^3 + 1): no integrating needed."""
    def body(self):
        self.title("Part 1 in Action", "3:37:47.25")
        ln = M(r"\frac{d}{dx}", r"\int_1^{x}", r"\sqrt{t^3+1}", r"\,dt", "=", r"\sqrt{x^3+1}", size=74).move_to([0, 0.8, 0])
        ln[0].set_color(PINK); ln[1].set_color(GRN); ln[2].set_color(BLUE); ln[5].set_color(BLUE)
        self.go("3:37:47.83", Write(ln[0]), run=0.5)
        self.go("3:37:48.81", Write(ln[1]), run=0.6)
        self.go("3:37:50.65", Write(ln[2]), run=0.8)
        self.go("3:37:52.71", Write(ln[3]), run=0.3)
        ux = upper(ln[1])
        self.go("3:37:53.83", Write(ln[4]), Indicate(ux, color=ORG, scale_factor=1.6), run=0.6)
        cp = ux.copy().set_color(ORG)
        self.go("3:37:54.53", cp.animate(path_arc=-ARC).move_to(ln[5]), run=0.7)
        self.play(FadeOut(cp), Write(ln[5]), run_time=0.6)
        bx = answer_box(ln[5])
        self.go("3:37:57.01", Create(bx), run=0.5)
        tk = VGroup(tick_mark(GRN, 0.45), H("no integrating", 38, GRN)).arrange(RIGHT, buff=0.2).next_to(bx, DOWN, buff=0.35)
        self.go("3:37:58.21", FadeIn(tk, shift=UP * 0.1), run=0.5)
        hd = M(r"\int\sqrt{t^3+1}\,dt", "=", "?", size=58, color=DIM).move_to([-2.6, -2.2, 0])
        hd[2].set_color(RED)
        self.go("3:38:01.49", Write(hd), run=0.7)
        rh = H("really hard", 40, RED).next_to(hd, RIGHT, buff=0.45)
        self.go("3:38:02.83", FadeIn(rh, shift=LEFT * 0.1), run=0.4)


class K34_ChainEx(Shot):
    """Upper limit x^2: plug x^2 in and multiply by 2x. Upper limit 5, x at the bottom: flip, the sign goes negative."""
    def body(self):
        self.title("When the Limit Is Not Just x", "3:38:04.15")
        cr = VGroup(TX(r"upper limit $x^2$", 42, DIM), M(r"\Rightarrow", size=50, color=DIM), pill("chain rule", PINK, 40)).arrange(RIGHT, buff=0.3)
        cr.move_to([0, 1.85, 0])
        self.go("3:38:04.81", FadeIn(cr[0]), run=0.5)
        self.go("3:38:07.71", FadeIn(cr[1]), FadeIn(cr[2], scale=0.85), run=0.5)
        r1 = M(r"\frac{d}{dx}", r"\int_0^{x^2}", r"\sin t\,dt", size=74).move_to([-2.6, 0.45, 0])
        r1[0].set_color(PINK); r1[1].set_color(GRN); r1[2].set_color(BLUE)
        self.go("3:38:09.43", Write(r1[0]), run=0.4)
        self.go("3:38:10.31", Write(r1[1]), run=0.6)
        self.go("3:38:12.35", Write(r1[2]), run=0.6)
        ux = upper(r1[1])
        r2 = M("=", r"\sin(x^2)", r"\cdot", "2x", size=74)
        at_eq(r2, 0, -3.3, -1.05)
        r2[1].set_color(BLUE); r2[2].set_color(PINK); r2[3].set_color(PINK)
        self.go("3:38:14.33", ux.animate.set_color(ORG), Indicate(ux, color=ORG, scale_factor=1.5), run=0.6)
        cp = ux.copy()
        self.go("3:38:14.99", Write(r2[0]), cp.animate(path_arc=-ARC).move_to(r2[1]), run=0.7)
        self.play(FadeOut(cp), Write(r2[1]), run_time=0.6)
        self.go("3:38:18.21", Write(r2[2]), run=0.4)
        nt = note(r"(x^2)' = 2x", r2[3], RIGHT, PINK, 36, math=True, dist=0.7, angle=0.5)
        self.go("3:38:19.43", Write(r2[3]), FadeIn(nt), run=0.6)
        r3 = M("=", r"2x\sin(x^2)", size=74, color=GRN)
        at_eq(r3, 0, -3.3, -2.55)
        self.go("3:38:22.03", Write(r3), run=0.8)
        self.play(Create(answer_box(r3[1])), run_time=0.4)
        # x at the bottom
        self.wipe("3:38:24.71")
        fl = M(r"\int_x^5", "=", r"-\int_5^x", size=64, color=YEL).move_to([0, 1.45, 0])
        self.go("3:38:25.47", Write(fl[0]), run=0.5)
        self.go("3:38:26.41", Write(fl[1:]), run=0.7)
        self.go("3:38:28.05", Indicate(fl[2][0], color=RED, scale_factor=2.0), run=0.6)
        r4 = M(r"\frac{d}{dx}", r"\int_x^{5}", r"\cos t\,dt", "=", r"-\cos x", size=74).move_to([0, -0.7, 0])
        r4[0].set_color(PINK); r4[1].set_color(GRN); r4[2].set_color(BLUE); r4[4].set_color(GRN)
        self.go("3:38:29.63", Write(r4[0]), run=0.4)
        self.go("3:38:30.37", Write(r4[1]), run=0.6)
        self.go("3:38:31.93", Write(r4[2]), run=0.6)
        self.go("3:38:33.33", Write(r4[3]), run=0.3)
        self.go("3:38:34.01", Write(r4[4]), run=0.6)
        self.play(Create(answer_box(r4[4])), run_time=0.4)


class K34_Ex1(Shot):
    """The integral from 1 to 3 of (3x^2 - 2x): [x^3 - x^2] from 1 to 3 = (27 - 9) - (1 - 1) = 18."""
    def body(self):
        self.title("Part 2 in Action", "3:38:36.10")
        rm = M(r"\int_a^b f\,dx", "=", "F(b)-F(a)", size=46, color=DIM).move_to([-4.2, -2.9, 0])
        self.go("3:38:38.31", FadeIn(rm, shift=UP * 0.1), run=0.5)
        r0 = M(r"\int_1^3", r"(3x^2-2x)", r"\,dx", "=", r"\Big[x^3-x^2\Big]_1^3", size=64)
        r0[0].set_color(GRN); r0[1].set_color(BLUE); r0[4].set_color(CHALK)
        r0.move_to([0, 1.2, 0])
        self.go("3:38:42.05", Write(r0[0]), run=0.5)
        self.go("3:38:43.57", Write(r0[1:3]), run=1.0)
        self.go("3:38:47.01", Write(r0[3:]), run=1.2)
        EX = r0[3].get_x()
        r2 = at_eq(M("=", "(27-9)", "-", "(1-1)", size=64), 0, EX, -0.3)
        self.go("3:38:50.13", Write(r2[0]), run=0.3)
        self.go("3:38:51.43", Write(r2[1]), run=0.8)
        b1 = Brace(r2[1], DOWN, buff=0.1, color=ORG)
        n1 = M("18", size=48, color=ORG).next_to(b1, DOWN, buff=0.08)
        self.go("3:38:53.13", GrowFromCenter(b1), FadeIn(n1), run=0.5)
        self.go("3:38:54.13", Write(r2[2]), run=0.3)
        self.go("3:38:55.35", Write(r2[3]), run=0.7)
        b2 = Brace(r2[3], DOWN, buff=0.1, color=ORG)
        n2 = M("0", size=48, color=ORG).next_to(b2, DOWN, buff=0.08)
        self.go("3:38:56.31", GrowFromCenter(b2), FadeIn(n2), run=0.5)
        r3 = at_eq(M("=", "18", "-", "0", "=", "18", size=64), 0, EX, -2.35)
        r3[5].set_color(GRN)
        self.go("3:38:57.21", Write(r3[:4]), run=0.6)
        self.go("3:38:58.41", Write(r3[4:]), run=0.4)
        self.play(Create(answer_box(r3[5])), run_time=0.4)


class K34_Ex2(Shot):
    """The integral from 0 to pi of sin x: [-cos x], top -cos(pi) = 1, bottom -cos 0 = -1 (finished next section)."""
    def body(self):
        self.title("Part 2 in Action", animate=False)
        rA = M(r"\int_0^{\pi}", r"\sin x", r"\,dx", "=", r"\Big[-\cos x\Big]_0^{\pi}", size=62)
        rA[0].set_color(GRN); rA[1].set_color(BLUE)
        rA.move_to([-2.7, 1.3, 0])
        ax = axes((0, 3.6, 1), (0, 1.5, 1), x_length=4.3, y_length=2.4, center=(4.3, -0.7, 0), nums=False, y_label=None)
        pl = M(r"\pi", size=36, color=FAINT).next_to(ax.c2p(PI, 0), DOWN, buff=0.12)
        cv = curve(ax, np.sin, [0, PI]).set_z_index(2)
        sh = area(ax, np.sin, 0, PI)
        qm = H("?", 64).move_to(ax.c2p(PI / 2, 0.42))
        self.go("3:39:00.37", Write(rA[:3]), run=0.8)
        self.go("3:39:01.57", Create(ax), FadeIn(ax.labels), FadeIn(pl), run=0.4)
        self.play(draw(cv, run=0.6))
        self.play(FadeIn(sh), FadeIn(qm), run_time=0.4)
        self.go("3:39:03.79", Write(rA[3:]), run=1.0)
        EX = -2.4
        rB = at_eq(M(r"-\cos\pi", "=", "-(-1)", "=", "1", size=60), 1, EX, -0.15)
        rC = at_eq(M(r"-\cos 0", "=", "-1", size=60), 1, EX, -1.55)
        tB = H("top", 36, DIM).next_to(rB, LEFT, buff=0.45)
        tC = H("bottom", 36, DIM).next_to(rC, LEFT, buff=0.45)
        tC.align_to(tB, RIGHT)
        rB[4].set_color(ORG); rC[2].set_color(ORG)
        self.go("3:39:06.43", FadeIn(tB, shift=RIGHT * 0.1), run=0.4)
        self.go("3:39:07.93", Write(rB[0]), run=0.6)
        self.go("3:39:09.09", Write(rB[1:3]), run=0.8)
        self.go("3:39:10.81", Write(rB[3:]), run=0.5)
        self.go("3:39:11.89", FadeIn(tC, shift=RIGHT * 0.1), run=0.4)
        self.go("3:39:13.27", Write(rC[0]), run=0.6)
        self.go("3:39:14.49", Write(rC[1:]), run=0.5)
