"""Builder 33: end of Chapter 11 "Antiderivatives and the Area Problem" (3:25:56.18 - 3:33:05.37).
The exact area under x^2 on [0, 2]: the i-th right-end rectangle (x = 2i/n, height 4i^2/n^2, width 2/n, area 8i^2/n^3),
sigma for "add up", 8/n^3 pulled out, the sum-of-squares formula, n -> infinity (top acts like 2n^3, n^3 struck,
16/6 = 8/3) while the rectangles double 4 -> 64 and the right sums close in on 2.667; the three estimates on a number
line against 8/3; "a lot of work" (the page, the sine sum) and the two-line shortcut of the next chapter; the definite
integral defined as the limit of Riemann sums, its notation built piece by piece (a, b, f(x), dx) and read (sum,
height, width); indefinite = a function + C, definite = a number; below the axis the rectangles turn RED (signed
area); sin from 0 to 2 pi: the green hump turned onto the red one, = 0, then the red hump flipped up for total area;
geometry: rectangle 6, triangle 8, semicircle 9 pi / 2, x from -2 to 2 = 0; properties (same limits: the region
shrinks to no width; swapped limits: the arrow reverses and the area goes red; constants / sums; a-b-c split);
10 / 3 -> 7 and -10; 2f(x) + 1 -> 25; recap; the two ideas side by side with "=" on "the same thing".
Colours: functions BLUE, area / answers GRN, negative area RED, limits and example numbers ORG, key bits YEL.
Whisper capitals (F, A, B, C) written as f, a, b, c.
START SEAM (assumed, builder 32 not written yet): the x^2 graph on [0, 2] with 8 right-end rectangles and
Delta x = 2/n is on the board from the first frame (added statically)."""
from common import *


def K(s):
    return "3:" + s


EQ = 3.0   # x of the '=' in the right-hand algebra column


def sq(x):
    return x * x


def eq_at(m, i, x, y):
    """Put part i of a MathTex (usually the '=') at (x, y): rows line up on it."""
    m.shift(np.array([x, y, 0]) - m[i].get_center())
    return m


def grp(scene, *ms):
    """Swap separately-added pieces for one group on stage, so one ReplacementTransform can take them all."""
    scene.remove(*ms)
    g = VGroup(*ms)
    scene.add(g)
    return g


def frac_parts(m):
    """(numerator glyphs, denominator glyphs) of one \\frac part, split at the fraction bar."""
    bar = max(m, key=lambda g: g.width - 3 * g.height)
    top = VGroup(*[g for g in m if g is not bar and g.get_y() > bar.get_y()])
    bot = VGroup(*[g for g in m if g is not bar and g.get_y() < bar.get_y()])
    return top, bot


def rects(ax, f, a, b, n, rule="right", fill=0.35, split=1, pos=GRN, neg=RED):
    """n rectangles under f (GRN above the axis, RED below). split=2 draws each as two halves (same picture),
    the start of a smooth split to 2n. Thin strokes as n grows so 64 of them still read as an area."""
    w = (b - a) / n
    sw = max(0.5, min(2.5, 24 / (n * split)))
    off = {"left": 0, "right": w, "midpoint": w / 2}[rule]
    g = VGroup()
    for i in range(n):
        x0 = a + i * w
        h = f(x0 + off)
        c = pos if h >= 0 else neg
        for j in range(split):
            u, v = x0 + j * w / split, x0 + (j + 1) * w / split
            g.add(Polygon(ax.c2p(u, 0), ax.c2p(v, 0), ax.c2p(v, h), ax.c2p(u, h), stroke_color=c, stroke_width=sw,
                          fill_color=c, fill_opacity=fill))
    return g.set_z_index(-1)


def grow(scene, ax, f, a, b, cur, n, t, run=0.5, rule="right", extra=()):
    """Double the rectangles at time t: each of the n/2 splits in two and the halves settle to the new heights."""
    scene.at(t)
    src = rects(ax, f, a, b, n // 2, rule, split=2)
    dst = rects(ax, f, a, b, n, rule)
    scene.remove(cur)
    scene.add(src)
    scene.play(Transform(src, dst), *extra, run_time=run)
    scene.remove(src)
    scene.add(dst)
    return dst


def rsum(n):
    """Right-end sum for x^2 on [0, 2] with n rectangles: 8/n^3 * n(n+1)(2n+1)/6."""
    return 8 * (n + 1) * (2 * n + 1) / (6 * n * n)


def x2_axes(center, xl=5.4, yl=4.4):
    return axes((0, 2.5, 1), (0, 4.5, 1), x_length=xl, y_length=yl, center=center)


def dbl(p, q, color=ORG):
    return DoubleArrow(np.array(p, float), np.array(q, float), buff=0, stroke_width=3, tip_length=0.16, color=color,
                       max_tip_length_to_length_ratio=0.3)


def integ(lo, hi, body, size=64, body_color=CHALK):
    """A hand-built integral (sign, lower, upper, body) so the limits can move on their own."""
    s = M(r"\int", size=size * 1.6, color=GRN)
    l = M(lo, size=size * 0.62, color=ORG).move_to(s.get_corner(DR) + np.array([0.12, 0.12, 0]))
    h = M(hi, size=size * 0.62, color=ORG).move_to(s.get_corner(UR) + np.array([0.3, -0.12, 0]))
    b = M(body, size=size, color=body_color).next_to(VGroup(s, l, h), RIGHT, buff=0.14)
    return VGroup(s, l, h, b)


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


# ---------------------------------------------------------------- the exact area under x^2

class K33_ITh(Shot):
    """The i-th rectangle: right end 2i/n, height 4i^2/n^2, width 2/n, area 8i^2/n^3."""
    def body(self):
        # K32_Limit's end board, rebuilt (see its END SEAM)
        self.title("Using n Rectangles", animate=False)
        ax = x2_axes((-2.7, -0.35, 0), 6.0, 4.6)
        ax.labels.remove(*ax.labels[:2])   # K32 faded the x numbers out
        cv = curve(ax, sq, [0, 2.1]).set_z_index(2)
        R = rects(ax, sq, 0, 2, 8, fill=0.45)
        X = 3.7
        lab = M("y=x^2", r",\ 0\le x\le 2", size=50).move_to([X, 1.4, 0])
        lab[0].set_color(BLUE); lab[1].set_color(ORG)
        nl = TX(r"$n$ rectangles", size=44).move_to([X, 0.5, 0])
        nl[0][0].set_color(ORG)
        DXw = M(r"\text{width}", "=", r"\frac{2}{n}", size=56).move_to([X, -0.75, 0])
        DX = M(r"\Delta x", "=", r"\frac{2}{n}", size=56, color=ORG)
        DX.shift(DXw[1].get_center() - DX[1].get_center())
        DX[1].set_color(CHALK)
        dots = VGroup(*[Dot(ax.c2p(x, 0), radius=0.08, color=ORG).set_z_index(6) for x in (0.25, 0.5)])
        ends = VGroup(*[M(s, size=40, color=ORG).next_to(d, DOWN, buff=0.15) for s, d in zip((r"\frac{2}{n}", r"\frac{4}{n}"), dots)])
        self.add(ax, ax.labels, R, cv, lab, nl, DX, dots, ends)
        d0 = eq_at(M(r"\Delta x", "=", r"\frac{2}{n}", size=52, color=ORG), 1, EQ, 1.75)
        d0[1].set_color(CHALK)
        hi = R[5]
        i_lab = M("i", size=46, color=YEL).next_to(hi, UP, buff=0.14)
        self.go(K("25:56.45"), *[r.animate.set_fill(opacity=0.1).set_stroke(opacity=0.35) for k, r in enumerate(R) if k != 5],
                hi.animate.set_stroke(YEL, 4).set_fill(GRN, 0.6), FadeIn(i_lab, shift=DOWN * 0.1),
                FadeOut(lab), FadeOut(nl), ReplacementTransform(DX, d0), run=0.7)
        xd = Dot(ax.c2p(1.5, 0), radius=0.08, color=ORG).set_z_index(6)
        xl = M(r"\frac{2i}{n}", size=40, color=ORG).next_to(xd, DOWN, buff=0.15)
        r1 = eq_at(M(r"x_i", "=", r"\frac{2i}{n}", size=52), 1, EQ, 0.55)
        r1[0].set_color(ORG); r1[2].set_color(ORG)
        self.go(K("25:57.63"), FadeIn(xd, scale=0.5), Write(xl), Write(r1), run=0.8)
        hl = Line(ax.c2p(1.5, 0), ax.c2p(1.5, 2.25), color=YEL, stroke_width=6).set_z_index(5)
        r2 = eq_at(M(r"\text{height}", "=", r"\left(\frac{2i}{n}\right)^2", "=", r"\frac{4i^2}{n^2}", size=52), 1, EQ, -0.8)
        self.go(K("25:59.71"), Create(hl), Write(r2[:2]), run=0.6)
        self.go(K("26:01.43"), TransformFromCopy(r1[2], r2[2]), run=0.7)
        self.go(K("26:02.69"), Write(r2[3:]), run=0.8)
        wl = Line(ax.c2p(1.25, 0), ax.c2p(1.5, 0), color=YEL, stroke_width=9).set_z_index(5)
        r3 = eq_at(M(r"\text{area}", "=", r"\text{height}", r"\times", r"\text{width}", size=52), 1, EQ, -2.35)
        self.go(K("26:05.87"), Write(r3[:2]), run=0.5)
        self.go(K("26:07.89"), Write(r3[2:]), Indicate(hl, color=YEL, scale_factor=1.0), run=0.6)
        self.go(K("26:08.59"), Create(wl), run=0.5)
        r3b = eq_at(M(r"\text{area}", "=", r"\frac{4i^2}{n^2}", r"\cdot", r"\frac{2}{n}", size=52), 1, EQ, -2.35)
        self.go(K("26:09.55"), ReplacementTransform(r3[0], r3b[0]), ReplacementTransform(r3[1], r3b[1]),
                FadeOut(r3[2:]), TransformFromCopy(r2[4], r3b[2]), run=0.7)
        self.go(K("26:11.31"), Write(r3b[3]), TransformFromCopy(d0[2], r3b[4]), run=0.7)
        r3c = eq_at(M(r"\text{area}", "=", r"\frac{8i^2}{n^3}", size=52), 1, EQ, -2.35)
        r3c[2].set_color(YEL)
        g = grp(self, r3b[2], r3b[3], r3b[4])
        self.go(K("26:13.89"), ReplacementTransform(g, r3c[2]), run=0.7)
        self.go(K("26:15.05"), Circumscribe(r3c[2], color=YEL, buff=0.1), run=0.9)


class K33_Sigma(Shot):
    """Add up all n areas; sigma means add up; the constant 8/n^3 comes out in front."""
    def body(self):
        self.title("Add Them All Up", K("26:16.57"))
        terms = M(r"\frac{8\cdot 1^2}{n^3}", "+", r"\frac{8\cdot 2^2}{n^3}", "+", r"\frac{8\cdot 3^2}{n^3}", "+", r"\cdots",
                  "+", r"\frac{8\,n^2}{n^3}", size=52).move_to([0, 1.3, 0])
        self.go(K("26:17.33"), LaggedStart(*[Write(p) for p in terms], lag_ratio=0.12), run=1.2)
        br = Brace(terms, DOWN, color=DIM, buff=0.15)
        nt = M(r"n \text{ terms}", size=40, color=DIM).next_to(br, DOWN, buff=0.12)
        self.go(K("26:18.60"), GrowFromCenter(br), FadeIn(nt), run=0.5)
        sig = M(r"\sum", size=130, color=YEL).move_to([-4.3, -1.3, 0])
        add = H("add up", 40, YEL).next_to(sig, DOWN, buff=0.25)
        self.go(K("26:20.85"), FadeOut(br), FadeOut(nt), Write(sig), run=0.6)
        self.go(K("26:21.83"), FadeIn(add, shift=UP * 0.1), run=0.4)
        S = eq_at(M(r"\text{total}", "=", r"\sum_{i=1}^{n}", r"\frac{8i^2}{n^3}", size=64), 1, -0.6, -1.3)
        S[2].set_color(YEL)
        self.go(K("26:23.27"), Write(S[:2]), run=0.5)
        self.go(K("26:23.95"), ReplacementTransform(sig, S[2]), FadeOut(add), run=0.8)
        self.go(K("26:25.05"), Indicate(S[2], color=YEL, scale_factor=1.1), run=0.7)
        self.go(K("26:26.77"), Write(S[3]), run=0.8)
        # 8/n^3 has no i in it: out in front
        Sg = grp(self, *S)
        self.go(K("26:29.40"), FadeOut(terms, shift=UP * 0.2), Sg.animate.shift(UP * 2.4), run=0.6)
        top, bot = frac_parts(S[3])
        tops = sorted(top, key=lambda g: g.get_x())
        eight, isq = tops[0], VGroup(*tops[1:])
        self.go(K("26:30.37"), eight.animate.set_color(YEL), bot.animate.set_color(YEL), isq.animate.set_color(CHALK), run=0.5)
        self.go(K("26:31.55"), Indicate(isq, color=BLUE, scale_factor=1.3), run=0.6)
        P = M("=", r"\frac{8}{n^3}", r"\sum_{i=1}^{n}", "i^2", size=64)
        eq_at(P, 0, S[1].get_x(), S[1].get_y() - 2.0)
        P[1].set_color(YEL)
        self.go(K("26:33.15"), Write(P[0]), TransformFromCopy(VGroup(eight, bot), P[1], path_arc=0.5 * PI),
                TransformFromCopy(S[2], P[2]), TransformFromCopy(isq, P[3]), run=1.0)
        self.go(K("26:34.73"), Indicate(P[1], color=YEL, scale_factor=1.15), run=0.7)
        self.go(K("26:36.97"), Circumscribe(VGroup(P[2], P[3]), color=YEL, buff=0.12), run=1.0)


class K33_Formula(Shot):
    """The known formula for the sum of the first n squares, put into the total."""
    def body(self):
        self.title("Add Them All Up", animate=False)
        P = eq_at(M(r"\text{total}", "=", r"\frac{8}{n^3}", r"\sum_{i=1}^{n}", "i^2", size=60), 1, -1.6, 1.6)
        P[2].set_color(YEL)
        self.add(P)
        F = M(r"\sum_{i=1}^{n} i^2", "=", r"\frac{n(n+1)(2n+1)}{6}", size=60)
        eq_at(F, 1, -1.6, -0.5)
        pan = panel(F, PURP, buff=0.3)
        kf = H("known formula", 36, PURP).next_to(pan, RIGHT, buff=0.25)
        self.go(K("26:40.07"), TransformFromCopy(VGroup(P[3], P[4]), F[0]), run=0.8)
        self.go(K("26:41.13"), FadeIn(kf, shift=DOWN * 0.1), run=0.4)
        self.go(K("26:43.89"), Write(F[1:]), run=1.2)
        self.go(K("26:47.15"), Create(pan), run=0.5)
        C = eq_at(M(r"\text{total}", "=", r"\frac{8}{n^3}", r"\cdot", r"\frac{n(n+1)(2n+1)}{6}", size=60), 1, -1.6, -2.65)
        C[2].set_color(YEL)
        self.go(K("26:48.51"), Write(C[:2]), run=0.5)
        self.go(K("26:49.35"), TransformFromCopy(P[2], C[2]), run=0.7)
        self.go(K("26:50.53"), Write(C[3]), TransformFromCopy(F[2], C[4]), run=1.0)
        self.go(K("26:53.40"), Circumscribe(C, color=YEL, buff=0.12), run=1.0)


class K33_Limit(Shot):
    """n -> infinity: the top acts like 2n^3, n^3 cancels, 8/3. The rectangles double and close in on 2.667."""
    def body(self):
        self.title("Let n Grow Forever", K("26:55.01"))
        C = eq_at(M(r"\text{total}", "=", r"\frac{8}{n^3}", r"\cdot", r"\frac{n(n+1)(2n+1)}{6}", size=58), 1, -2.6, 1.55)
        C[2].set_color(YEL)
        self.add(C)
        ni = M(r"n \to \infty", size=54, color=YEL).move_to([5.1, 1.55, 0])
        self.go(K("26:55.51"), Write(ni), run=0.6)
        top, _ = frac_parts(C[4])
        r2 = eq_at(M(r"n(n+1)(2n+1)", "=", "2n^3", r"+\,3n^2+n", size=54), 1, -0.6, 0.1)
        self.go(K("26:57.51"), TransformFromCopy(top, r2[0]), run=0.8)
        self.go(K("26:58.40"), Write(r2[1:]), run=0.8)
        self.go(K("26:59.77"), Circumscribe(r2[2], color=YEL, buff=0.1), r2[3].animate.set_color(FAINT), run=0.9)
        r3 = eq_at(M(r"\approx", r"\frac{8}{n^3}", r"\cdot", r"\frac{2n^3}{6}", size=58), 0, C[1].get_x(), -1.3)
        r3[1].set_color(YEL)
        self.go(K("27:02.80"), Write(r3[0]), TransformFromCopy(C[2], r3[1]), run=0.7)
        self.go(K("27:04.79"), Write(r3[2]), TransformFromCopy(r2[2], r3[3]), r2.animate.set_opacity(0.3), run=0.8)
        _, b1 = frac_parts(r3[1])
        t2, _ = frac_parts(r3[3])
        n3 = VGroup(*sorted(t2, key=lambda g: g.get_x())[1:])
        self.go(K("27:07.85"), Create(strike(b1)), Create(strike(n3)), run=0.6)
        r4 = eq_at(M("=", r"\frac{8\cdot 2}{6}", size=58), 0, C[1].get_x(), -2.8)
        self.go(K("27:09.75"), Write(r4), run=0.6)
        r4b = eq_at(M("=", r"\frac{16}{6}", size=58), 0, C[1].get_x(), -2.8)
        self.go(K("27:11.51"), ReplacementTransform(r4[1], r4b[1]), run=0.5)
        r4c = eq_at(M("=", r"\frac{8}{3}", size=58, color=GRN), 0, C[1].get_x(), -2.8)
        r4c[0].set_color(CHALK)
        self.go(K("27:13.07"), ReplacementTransform(r4b[1], r4c[1]), run=0.5)
        self.play(Create(answer_box(r4c[1])), run_time=0.4)
        # the picture: rectangles double and the sum closes in on 8/3
        self.wipe(K("27:14.61"), run=0.4)
        ax = x2_axes((-2.6, -0.9, 0), 5.6, 4.4)
        cv = curve(ax, sq, [0, 2.1]).set_z_index(2)
        R = rects(ax, sq, 0, 2, 4)

        def readout(n):
            g = VGroup(M(f"n = {n}", size=54, color=ORG), M(f"{rsum(n):.3f}", size=60, color=GRN)).arrange(DOWN, buff=0.35)
            return g.move_to([3.6, 0.4, 0])
        ro = readout(4)
        self.go(K("27:15.05"), FadeIn(VGroup(ax, ax.labels, cv)), FadeIn(R), FadeIn(ro), run=0.5)
        for n, t in [(8, "27:15.70"), (16, "27:16.35"), (32, "27:17.00"), (64, "27:17.65")]:
            new = readout(n)
            R = grow(self, ax, sq, 0, 2, R, n, K(t), run=0.5, extra=[ReplacementTransform(ro, new)])
            ro = new
        ar = area(ax, sq, 0, 2).set_z_index(-1)
        fin = VGroup(M(r"n \to \infty", size=54, color=YEL), M(r"\frac{8}{3}", size=72, color=GRN)).arrange(DOWN, buff=0.35).move_to([3.6, 0.4, 0])
        self.go(K("27:18.45"), FadeOut(R), FadeIn(ar), ReplacementTransform(ro, fin), run=0.7)
        ap = M(r"\approx 2.667", size=60, color=GRN).next_to(fin, DOWN, buff=0.4)
        self.go(K("27:19.91"), Write(ap), run=0.7)
        self.play(Create(answer_box(VGroup(fin[1], ap))), run_time=0.5)


class K33_Compare(Shot):
    """The three estimates on a number line against the exact 8/3: the midpoint one is very close."""
    def body(self):
        self.title("Our Estimates", K("27:22.09"))
        nl = number_line((1.5, 4.5, 0.5), length=11, center=(0, -0.6, 0))
        self.go(K("27:22.60"), Create(nl), FadeIn(nl.labels), run=0.7)
        ex = 8 / 3
        tk = Line(nl.n2p(ex) + DOWN * 0.3, nl.n2p(ex) + UP * 0.3, color=GRN, stroke_width=6)
        exl = VGroup(M(r"\frac{8}{3}", size=48, color=GRN), H("exact", 34, GRN)).arrange(DOWN, buff=0.1).next_to(nl.n2p(ex), DOWN, buff=0.75)
        self.go(K("27:23.30"), Create(tk), FadeIn(exl, shift=UP * 0.1), run=0.6)

        def est(v, name, t):
            d = Dot(nl.n2p(v), radius=0.1, color=ORG).set_z_index(5)
            lab = VGroup(H(name, 36, ORG), M(f"{v:g}", size=46, color=ORG)).arrange(DOWN, buff=0.08).next_to(d, UP, buff=0.3)
            self.go(K(t), FadeIn(d, scale=0.5), FadeIn(lab, shift=DOWN * 0.1), run=0.5)
            return d, lab
        est(3.75, "right ends", "27:24.21")
        est(1.75, "left ends", "27:26.49")
        dm, lm = est(2.625, "midpoints", "27:29.87")
        gap = Line(nl.n2p(2.625), nl.n2p(ex), color=YEL, stroke_width=8).set_z_index(4)
        self.go(K("27:32.87"), Create(gap), run=0.5)
        nt = H("only 0.04 off", 38, YEL).move_to([1.9, -2.85, 0])
        arr = CurvedArrow(nt.get_left() + LEFT * 0.1, gap.get_center() + DOWN * 0.15, angle=-0.6, color=YEL, stroke_width=3, tip_length=0.16)
        self.go(K("27:33.60"), FadeIn(nt), Create(arr), run=0.6)


class K33_Honest(Shot):
    """A whole page for one area; the sine version would be painful; next chapter: a two-line shortcut.
    Underneath, the integral is the limit of rectangle sums."""
    def body(self):
        self.title("A Lot of Work", K("27:35.61"))
        lines = [M(s, size=36) for s in (r"x_i=\frac{2i}{n}", r"\text{area}_i=\frac{8i^2}{n^3}", r"\sum_{i=1}^{n}\frac{8i^2}{n^3}",
                                          r"\frac{8}{n^3}\cdot\frac{n(n+1)(2n+1)}{6}", r"n\to\infty:\ \frac{8}{3}")]
        page = VGroup(*lines).arrange(DOWN, aligned_edge=LEFT, buff=0.3).move_to([-3.6, -0.6, 0])
        pp = panel(page, FAINT, buff=0.35)
        self.go(K("27:37.87"), Create(pp), LaggedStart(*[FadeIn(l, shift=UP * 0.1) for l in lines], lag_ratio=0.2), run=1.2)
        self.go(K("27:40.59"), Circumscribe(lines[3], color=YEL, buff=0.08), run=0.9)
        self.go(K("27:43.35"), Circumscribe(lines[4], color=YEL, buff=0.08), run=0.9)
        sx = axes((0, 3.6, 1), (0, 1.3, 1), x_length=5.0, y_length=2.4, center=(3.4, 0.5, 0), nums=False, y_label=None)
        pl = M(r"\pi", size=36, color=DIM).next_to(sx.c2p(PI, 0), DOWN, buff=0.12)
        sc = curve(sx, np.sin, [0, PI]).set_z_index(2)
        self.go(K("27:45.41"), Create(sx), FadeIn(sx.labels), FadeIn(pl), run=0.6)
        self.go(K("27:47.61"), draw(sc, run=0.7))
        sr = rects(sx, np.sin, 0, PI, 10, rule="midpoint", fill=0.5)
        pain = M(r"\sum_{i=1}^{n}\sin\!\left(\frac{i\pi}{n}\right)\cdot\frac{\pi}{n}", "=", "?", size=44).move_to([3.4, -1.85, 0])
        pain[2].set_color(RED)
        self.go(K("27:48.40"), FadeIn(sr), Write(pain), run=0.9)
        sine = VGroup(sx, sx.labels, pl, sc, sr, pain)
        self.go(K("27:49.91"), FadeOut(sine), run=0.5)
        nc = pill("next chapter", YEL, 38).move_to([3.4, 1.4, 0])
        self.go(K("27:51.37"), FadeIn(nc, shift=DOWN * 0.1), run=0.5)
        small = RoundedRectangle(width=3.2, height=1.5, corner_radius=0.2, stroke_color=GRN, stroke_width=4).move_to([3.4, -0.6, 0])
        two = VGroup(Line(LEFT * 1.1, RIGHT * 1.1, color=CHALK, stroke_width=4), Line(LEFT * 1.1, RIGHT * 0.5, color=CHALK, stroke_width=4)
                     ).arrange(DOWN, buff=0.4, aligned_edge=LEFT).move_to(small)
        ar = Arrow(pp.get_right() + RIGHT * 0.1, small.get_left() + LEFT * 0.1, buff=0, color=GRN, stroke_width=5, tip_length=0.24)
        self.go(K("27:53.95"), GrowArrow(ar), run=0.6)
        tl = H("two lines", 36, GRN).next_to(small, DOWN, buff=0.2)
        self.go(K("27:56.37"), Create(small), Create(two), FadeIn(tl), run=0.7)
        # what an integral is underneath
        self.wipe(K("27:58.17"), run=0.4)
        ax = x2_axes((-2.6, -1.0, 0), 5.0, 4.0)
        cv = curve(ax, sq, [0, 2.1]).set_z_index(2)
        R = rects(ax, sq, 0, 2, 4)
        self.go(K("27:58.97"), FadeIn(VGroup(ax, ax.labels, cv)), FadeIn(R), run=0.6)
        ig = M(r"\int", size=120, color=GRN).move_to([1.8, -0.4, 0])
        self.go(K("28:01.41"), Write(ig), run=0.6)
        rhs = M("=", r"\lim_{n\to\infty}", r"\sum", size=64).next_to(ig, RIGHT, buff=0.35)
        rhs[1].set_color(YEL)
        R = grow(self, ax, sq, 0, 2, R, 8, K("28:04.01"), run=0.45, extra=[Write(rhs)])
        R = grow(self, ax, sq, 0, 2, R, 16, K("28:04.50"), run=0.45)
        R = grow(self, ax, sq, 0, 2, R, 32, K("28:04.99"), run=0.45)
        self.play(FadeOut(R), FadeIn(area(ax, sq, 0, 2).set_z_index(-1)), run_time=0.45)


# ---------------------------------------------------------------- the definite integral

class K33_Define(Shot):
    """The definite integral = limit of Riemann sums; the notation built on the words: sign, a, b, f(x), dx."""
    def body(self):
        self.title("The Definite Integral", K("28:07.59"))
        f = lambda x: 1.3 + 0.7 * np.sin(1.2 * x) + 0.12 * x
        A, B = 0.8, 4.6
        ax = axes((0, 5.5, 1), (0, 3, 1), x_length=7, y_length=3.0, center=(0, 0.75, 0), nums=False, y_label=None)
        cv = curve(ax, f, [0.2, 5.2]).set_z_index(2)
        self.go(K("28:08.20"), Create(ax), FadeIn(ax.labels), run=0.6)
        self.go(K("28:09.27"), draw(cv, run=0.8))
        la = M("a", size=44, color=ORG).next_to(ax.c2p(A, 0), DOWN, buff=0.15)
        lb = M("b", size=44, color=ORG).next_to(ax.c2p(B, 0), DOWN, buff=0.15)
        self.go(K("28:11.05"), FadeIn(la, shift=UP * 0.1), run=0.3)
        self.go(K("28:11.43"), FadeIn(lb, shift=UP * 0.1), run=0.3)
        R = rects(ax, f, A, B, 4)
        rhs = M(r"\lim_{n\to\infty}", r"\sum_{i=1}^{n}", r"f(x_i)\,\Delta x", size=60).move_to([0, -2.45, 0])
        rhs[0].set_color(YEL); rhs[2].set_color(BLUE)
        self.go(K("28:12.40"), FadeIn(R), run=0.5)
        self.go(K("28:13.00"), Write(rhs[1:]), run=0.9)
        self.go(K("28:14.15"), Write(rhs[0]), run=0.5)
        R = grow(self, ax, f, A, B, R, 8, K("28:14.70"), run=0.4)
        R = grow(self, ax, f, A, B, R, 16, K("28:15.15"), run=0.4)
        R = grow(self, ax, f, A, B, R, 32, K("28:15.60"), run=0.4)
        ar = area(ax, f, A, B).set_z_index(-1)
        self.play(FadeOut(R), FadeIn(ar), run_time=0.4)
        # the notation, piece by piece
        sgn = M(r"\int", size=150, color=GRN).move_to([-5.0, -0.3, 0])
        lo = M("a", size=50, color=ORG).move_to(sgn.get_corner(DR) + np.array([0.12, 0.15, 0]))
        hi = M("b", size=50, color=ORG).move_to(sgn.get_corner(UR) + np.array([0.32, -0.15, 0]))
        fx = M("f(x)", size=76, color=BLUE).next_to(sgn, RIGHT, buff=0.6)
        dx = M("dx", size=76).next_to(fx, RIGHT, buff=0.22)
        eq = M("=", size=76).next_to(dx, RIGHT, buff=0.35)
        rt = rhs.copy().scale(64 / 60).next_to(eq, RIGHT, buff=0.35)
        self.go(K("28:17.15"), FadeOut(VGroup(ax, ax.labels, cv, ar, la, lb)), Transform(rhs, rt), run=0.7)
        self.go(K("28:18.23"), Write(sgn), run=0.6)
        self.go(K("28:20.23"), FadeIn(lo, scale=0.6), run=0.4)
        self.go(K("28:21.71"), FadeIn(hi, scale=0.6), run=0.4)
        self.go(K("28:23.07"), Write(fx), run=0.6)
        self.go(K("28:24.07"), Write(dx), run=0.5)
        self.go(K("28:24.70"), Write(eq), run=0.4)
        self.go(K("28:26.69"), Indicate(lo, color=ORG, scale_factor=1.5), Indicate(hi, color=ORG, scale_factor=1.5), run=0.8)
        n1 = note("lower limit", lo, DL, ORG, dist=0.45)
        self.go(K("28:28.39"), FadeIn(n1[0]), Create(n1[1]), run=0.5)
        n2 = note("upper limit", hi, RIGHT + UP * 0.7, ORG, dist=0.45, angle=0.6)
        self.go(K("28:29.49"), FadeIn(n2[0]), Create(n2[1]), run=0.5)
        n3 = note("integrand", fx, DOWN + RIGHT * 0.5, BLUE, dist=0.7)
        self.go(K("28:30.69"), FadeIn(n3[0]), Create(n3[1]), run=0.5)
        self.go(K("28:32.23"), Circumscribe(fx, color=BLUE, buff=0.1), run=0.8)


class K33_Meaning(Shot):
    """Reading it: the stretched s is a sum, f(x) a height, dx a width; then infinitely many thin rectangles."""
    def body(self):
        self.title("Reading the Notation", K("28:33.69"))
        f = lambda x: 1.3 + 0.5 * np.sin(1.3 * x) + 0.15 * x
        A, B = 0.5, 4.0
        ax = axes((0, 4.5, 1), (0, 3, 1), x_length=5.0, y_length=3.4, center=(3.6, -0.3, 0), nums=False, y_label=None)
        cv = curve(ax, f, [0.2, 4.3]).set_z_index(2)
        s = M(r"\int", size=92, color=GRN).move_to([-5.4, 0.9, 0])
        fx = M("f(x)", size=84, color=BLUE).move_to([-3.6, 0.9, 0])
        dx = M("dx", size=84).move_to([-1.7, 0.9, 0])
        self.go(K("28:34.13"), Write(VGroup(s, fx, dx)), FadeIn(VGroup(ax, ax.labels)), Create(cv), run=0.9)

        def down(mob, lab):
            return Arrow(mob.get_bottom() + DOWN * 0.08, lab.get_top() + UP * 0.08, buff=0, color=DIM, stroke_width=3, tip_length=0.15)
        sg = M(r"\sum", size=70, color=GRN).move_to([-5.4, -0.95, 0])
        sl = H("sum", 38, GRN).next_to(sg, DOWN, buff=0.15)
        self.go(K("28:35.90"), TransformFromCopy(s, sg), GrowArrow(down(s, sg)), run=0.7)
        self.go(K("28:36.93"), FadeIn(sl, shift=UP * 0.1), run=0.4)
        x0, w = 2.0, 0.3
        rc = Polygon(ax.c2p(x0, 0), ax.c2p(x0 + w, 0), ax.c2p(x0 + w, f(x0)), ax.c2p(x0, f(x0)), stroke_color=GRN, stroke_width=3,
                     fill_color=GRN, fill_opacity=0.5).set_z_index(1)
        hb = Brace(rc, LEFT, color=BLUE, buff=0.08)
        hbl = M("f(x)", size=40, color=BLUE).next_to(hb, LEFT, buff=0.1)
        hl = H("height", 40, BLUE).move_to([-3.6, -0.9, 0])
        self.go(K("28:37.95"), FadeIn(rc), run=0.5)
        self.go(K("28:38.70"), GrowFromCenter(hb), FadeIn(hbl), GrowArrow(down(fx, hl)), FadeIn(hl), run=0.6)
        wb = Brace(rc, DOWN, color=YEL, buff=0.08)
        wbl = M("dx", size=40, color=YEL).next_to(wb, DOWN, buff=0.1)
        wl = H("width", 40, YEL).move_to([-1.7, -0.9, 0])
        self.go(K("28:41.05"), GrowFromCenter(wb), FadeIn(wbl), run=0.5)
        self.go(K("28:42.30"), GrowArrow(down(dx, wl)), FadeIn(wl), run=0.5)
        row = M(r"\int f(x)\,dx", "=", r"\sum", r"\text{height}", r"\times", r"\text{width}", size=56).move_to([-2.9, -3.0, 0])
        row[0].set_color(GRN); row[2].set_color(GRN); row[3].set_color(BLUE); row[5].set_color(YEL)
        self.go(K("28:44.73"), Write(row[:2]), run=0.6)
        self.go(K("28:46.19"), Write(row[2:]), run=1.0)
        R = rects(ax, f, A, B, 8, rule="left")
        self.go(K("28:48.30"), FadeOut(VGroup(rc, hb, hbl, wb, wbl)), FadeIn(R), run=0.5)
        R = grow(self, ax, f, A, B, R, 16, K("28:48.95"), run=0.45, rule="left")
        R = grow(self, ax, f, A, B, R, 32, K("28:49.50"), run=0.45, rule="left")
        R = grow(self, ax, f, A, B, R, 64, K("28:50.05"), run=0.45, rule="left")
        self.play(FadeOut(R), FadeIn(area(ax, f, A, B).set_z_index(-1)), run_time=0.5)


class K33_Number(Shot):
    """Indefinite: a function (+ C). Definite: a number."""
    def body(self):
        self.title("Indefinite vs Definite", K("28:52.13"))
        dv = DashedLine([0, 1.9, 0], [0, -2.8, 0], color=FAINT, dash_length=0.12)
        h1 = H("indefinite", 42, DIM).move_to([-3.4, 1.55, 0])
        h2 = H("definite", 42, DIM).move_to([3.4, 1.55, 0])
        L = M(r"\int x^2\,dx", "=", r"\frac{x^3}{3}", r"+\,C", size=64).move_to([-3.4, 0.0, 0])
        L[2].set_color(BLUE); L[3].set_color(YEL)
        self.go(K("28:52.65"), Create(dv), FadeIn(h1), Write(L[0]), run=0.7)
        self.go(K("28:53.67"), Write(L[1:]), run=0.8)
        fl = H("a function", 42, BLUE).move_to([-3.4, -1.6, 0])
        self.go(K("28:54.69"), FadeIn(fl, shift=UP * 0.1), run=0.4)
        self.go(K("28:55.99"), Circumscribe(L[3], color=YEL, buff=0.1), run=0.8)
        Rr = M(r"\int_0^2 x^2\,dx", "=", r"\frac{8}{3}", size=64).move_to([3.4, 0.0, 0])
        Rr[2].set_color(GRN)
        self.go(K("28:57.51"), FadeIn(h2), Write(Rr[0]), run=0.7)
        self.go(K("28:58.73"), Write(Rr[1:]), run=0.6)
        nl = H("a number", 42, ORG).move_to([3.4, -1.6, 0])
        self.go(K("28:59.79"), FadeIn(nl, shift=UP * 0.1), Create(answer_box(Rr[2])), run=0.5)


# ---------------------------------------------------------------- signed area

def fb(x):
    return 0.12 * (x + 1) * (x - 2.5) * (x - 6)


class K33_Below(Shot):
    """Below the axis f(x) < 0, the rectangles have negative height: signed area, above minus below."""
    def body(self):
        ax = axes((0, 6.5, 1), (-2.5, 2.5, 1), x_length=7.6, y_length=4.4, center=(-2.4, -0.75, 0), nums=False, y_label=None)
        cv = curve(ax, fb, [0, 6.1]).set_z_index(2)
        self.go(K("29:01.60"), Create(ax), FadeIn(ax.labels), run=0.6)
        self.title("Below the Axis", K("29:03.25"))
        self.go(K("29:03.80"), draw(cv, run=1.0))
        R = rects(ax, fb, 0, 6, 12, rule="midpoint")
        self.go(K("29:05.25"), FadeIn(R), run=0.6)
        hx = 4.25
        ha = Arrow(ax.c2p(hx, 0), ax.c2p(hx, fb(hx)), buff=0, color=RED, stroke_width=6, tip_length=0.2).set_z_index(4)
        neg = M(r"f(x) < 0", size=52, color=RED).move_to([4.3, 1.0, 0])
        self.go(K("29:06.65"), Write(neg), run=0.6)
        self.go(K("29:08.57"), GrowArrow(ha), run=0.6)
        hw = M(r"\text{height}\times\text{width} < 0", size=46, color=RED).move_to([4.3, -0.2, 0])
        self.go(K("29:10.99"), Write(hw), run=0.8)
        mn = M("-", size=110, color=RED).move_to(ax.c2p(4.25, -0.9))
        self.go(K("29:14.93"), FadeOut(ha), FadeIn(mn, scale=0.6), run=0.5)
        ag = area(ax, fb, 0, 2.5).set_z_index(-1)
        ad = area(ax, fb, 2.5, 6, color=RED).set_z_index(-1)
        self.go(K("29:16.59"), FadeOut(R), FadeIn(ag), FadeIn(ad), FadeOut(neg), FadeOut(hw), run=0.8)
        self.title("Signed Area", K("29:19.41"))
        pl = M("+", size=110, color=GRN).move_to(ax.c2p(1.15, 0.9))
        self.go(K("29:21.11"), FadeIn(pl, scale=0.6), Indicate(ag, color=GRN, scale_factor=1.0), run=0.6)
        self.go(K("29:23.89"), Indicate(VGroup(ad, mn), color=RED, scale_factor=1.0), run=0.7)
        tot = M(r"\int_0^6 f(x)\,dx", "=", r"\text{above}", "-", r"\text{below}", size=46).to_edge(RIGHT, buff=0.45).set_y(-2.6)
        tot[2].set_color(GRN); tot[3].set_color(RED); tot[4].set_color(RED)
        self.go(K("29:26.27"), Write(tot), run=1.0)


class K33_SinZero(Shot):
    """sin x from 0 to 2 pi: a positive hump and an equal negative hump cancel to 0; total area flips the lower one up."""
    def body(self):
        self.title("Sine Cancels Out", K("29:28.03"))
        F = M(r"\int_0^{2\pi}\sin x\,dx", size=62).move_to([-0.6, 1.55, 0])
        ax = axes((0, 7, 1), (-1.4, 1.4, 1), x_length=9.6, y_length=3.4, center=(0, -1.25, 0), nums=False, y_label=None)
        pis = VGroup(M(r"\pi", size=40, color=DIM).next_to(ax.c2p(PI, 0), DL, buff=0.08),
                     M(r"2\pi", size=40, color=DIM).next_to(ax.c2p(TAU, 0), DOWN, buff=0.15).shift(RIGHT * 0.3))
        self.go(K("29:29.29"), Write(F), Create(ax), FadeIn(ax.labels), FadeIn(pis), run=0.9)
        sc = curve(ax, np.sin, [0, TAU]).set_z_index(2)
        self.go(K("29:32.53"), draw(sc, run=1.0))
        up = area(ax, np.sin, 0, PI).set_z_index(-1)
        dn = area(ax, np.sin, PI, TAU, color=RED).set_z_index(-1)
        pl = M("+", size=100, color=GRN).move_to(ax.c2p(PI / 2, 0.45))
        mn = M("-", size=100, color=RED).move_to(ax.c2p(1.5 * PI, -0.45))
        self.go(K("29:35.67"), FadeIn(up), run=0.6)
        self.go(K("29:36.40"), FadeIn(pl, scale=0.6), run=0.4)
        self.go(K("29:38.01"), FadeIn(dn), run=0.6)
        cp = up.copy().set_z_index(0)
        self.go(K("29:40.91"), cp.animate.shift(ax.c2p(PI, 0) - ax.c2p(0, 0)), run=0.6)
        self.play(cp.animate.stretch(-1, 1, about_point=ax.c2p(0, 0)), run_time=0.6)
        self.go(K("29:42.19"), FadeOut(cp), FadeIn(mn, scale=0.6), run=0.5)
        self.go(K("29:43.49"), Indicate(VGroup(up, pl), color=GRN, scale_factor=1.0), Indicate(VGroup(dn, mn), color=RED, scale_factor=1.0), run=0.8)
        z = M("=", "0", size=62).next_to(F, RIGHT, buff=0.3)
        z[1].set_color(GRN)
        self.go(K("29:45.29"), Write(z), run=0.6)
        zb = answer_box(z[1])
        self.go(K("29:46.27"), Create(zb), run=0.4)
        lab = H("total area", 40, GRN).move_to([4.6, 1.55, 0])
        self.go(K("29:48.49"), VGroup(F, z, zb).animate.set_opacity(0.35), FadeIn(lab, shift=DOWN * 0.1), run=0.6)
        self.go(K("29:52.43"), Circumscribe(dn, color=RED, buff=0.08), run=0.9)
        flip = area(ax, lambda x: -np.sin(x), PI, TAU).set_z_index(-1)
        pl2 = M("+", size=100, color=GRN).move_to(ax.c2p(1.5 * PI, 0.45))
        self.go(K("29:54.39"), Transform(dn, flip), ReplacementTransform(mn, pl2), run=1.0)
        self.go(K("29:55.83"), Indicate(VGroup(up, dn), color=GRN, scale_factor=1.0), run=0.8)


# ---------------------------------------------------------------- areas by geometry

class K33_Rect(Shot):
    """The integral of 2 from 0 to 3: a 3 by 2 rectangle, area 6."""
    def body(self):
        self.title("Areas by Geometry", K("29:58.83"))
        rc = Rectangle(width=2.0, height=1.2, stroke_color=CHALK, stroke_width=4).move_to([-3.6, -0.6, 0])
        tr = Polygon([-1.0, -1.2, 0], [1.0, -1.2, 0], [1.0, 0.1, 0], stroke_color=CHALK, stroke_width=4)
        sm = VGroup(Arc(radius=1.0, start_angle=0, angle=PI, stroke_color=CHALK, stroke_width=4),
                    Line(LEFT, RIGHT, stroke_color=CHALK, stroke_width=4)).move_to([3.6, -0.75, 0])
        self.go(K("30:01.47"), draw(rc, run=0.6), run=0.6)
        self.play(draw(tr, run=0.6))
        self.play(Create(sm), run_time=0.6)
        self.wipe(K("30:04.90"), run=0.4)
        F = M(r"\int_0^3 2\,dx", size=64).move_to([-0.6, 1.55, 0])
        ax = axes((0, 4.5, 1), (0, 3, 1), x_length=6.3, y_length=3.6, center=(0, -1.35, 0))
        self.go(K("30:05.91"), Write(F), Create(ax), FadeIn(ax.labels), run=0.8)
        ln = curve(ax, lambda x: 2, [0, 3]).set_z_index(2)
        self.go(K("30:09.01"), draw(ln, run=0.8))
        ar = area(ax, lambda x: 2, 0, 3).set_z_index(-1)
        self.go(K("30:12.25"), FadeIn(ar), run=0.6)
        wa = dbl(ax.c2p(0.05, 0.45), ax.c2p(2.95, 0.45))
        wl = M("3", size=48, color=ORG).next_to(wa, UP, buff=0.1)
        self.go(K("30:13.19"), GrowFromCenter(wa), FadeIn(wl), run=0.5)
        ha = dbl(ax.c2p(3.3, 0.03), ax.c2p(3.3, 1.97))
        hl = M("2", size=48, color=ORG).next_to(ha, RIGHT, buff=0.12)
        self.go(K("30:14.11"), GrowFromCenter(ha), FadeIn(hl), run=0.5)
        s = M("=", "6", size=64).next_to(F, RIGHT, buff=0.3)
        s[1].set_color(GRN)
        self.go(K("30:15.19"), Write(s), run=0.5)
        self.play(Create(answer_box(s[1])), run_time=0.35)


class K33_Tri(Shot):
    """The integral of x from 0 to 4: a triangle with base 4 and height 4, half of 4 times 4 = 8."""
    def body(self):
        self.title("Areas by Geometry", animate=False)
        F = M(r"\int_0^4 x\,dx", size=64).move_to([-2.4, 1.55, 0])
        ax = axes((0, 5, 1), (0, 5, 1), x_length=3.75, y_length=3.75, center=(0, -1.4, 0), nums=False)
        self.go(K("30:16.61"), Write(F), Create(ax), FadeIn(ax.labels), run=0.8)
        ln = curve(ax, lambda x: x, [0, 4.4]).set_z_index(2)
        self.go(K("30:19.43"), draw(ln, run=0.8))
        tri = Polygon(ax.c2p(0, 0), ax.c2p(4, 0), ax.c2p(4, 4), stroke_width=0, fill_color=GRN, fill_opacity=0.4).set_z_index(-1)
        side = DashedLine(ax.c2p(4, 0), ax.c2p(4, 4), color=GRN, stroke_width=3, dash_length=0.1)
        self.go(K("30:22.89"), FadeIn(tri), Create(side), run=0.6)
        ba = dbl(ax.c2p(0, -0.45), ax.c2p(4, -0.45))
        bl = M("4", size=46, color=ORG).next_to(ba, DOWN, buff=0.08)
        self.go(K("30:23.57"), GrowFromCenter(ba), FadeIn(bl), run=0.5)
        ha = dbl(ax.c2p(4.45, 0), ax.c2p(4.45, 4))
        hl = M("4", size=46, color=ORG).next_to(ha, RIGHT, buff=0.12)
        self.go(K("30:24.49"), GrowFromCenter(ha), FadeIn(hl), run=0.5)
        s = M("=", r"\tfrac{1}{2}\cdot 4\cdot 4", "=", "8", size=64).next_to(F, RIGHT, buff=0.3)
        s[3].set_color(GRN)
        self.go(K("30:25.51"), Write(s[:2]), run=0.7)
        self.go(K("30:27.25"), Write(s[2:]), run=0.4)
        self.play(Create(answer_box(s[3])), run_time=0.35)


class K33_Semi(Shot):
    """sqrt(9 - x^2) from -3 to 3: y^2 + x^2 = 9, the top half of a circle of radius 3, area 9 pi / 2."""
    def body(self):
        self.title("Areas by Geometry", animate=False)
        F = M(r"\int_{-3}^{3}\sqrt{9-x^2}\,dx", size=62).move_to([0, 1.5, 0])
        self.go(K("30:28.29"), Write(F), run=1.0)
        u = 0.6
        ax = axes((-4, 4.5, 1), (0, 4, 1), x_length=8.5 * u, y_length=4 * u, center=(-3.0, -1.7, 0), nums=False)
        o = ax.c2p(0, 0)
        ticks = VGroup(M("-3", size=36, color=ORG).next_to(ax.c2p(-3, 0), DOWN, buff=0.12),
                       M("3", size=36, color=ORG).next_to(ax.c2p(3, 0), DOWN, buff=0.12))
        self.go(K("30:30.40"), Create(ax), FadeIn(ax.labels), FadeIn(ticks), run=0.7)
        e1 = M(r"y=\sqrt{9-x^2}", size=54).move_to([3.4, 0.25, 0])
        self.go(K("30:33.29"), Write(e1), run=0.8)
        e2 = M(r"y^2+x^2=9", size=54).move_to([3.4, -0.85, 0])
        self.go(K("30:35.81"), Write(e2), run=0.8)
        r = 3 * (ax.c2p(1, 0)[0] - o[0])
        arc = Arc(radius=r, start_angle=0, angle=PI, arc_center=o, stroke_color=BLUE, stroke_width=5).set_z_index(2)
        self.go(K("30:38.61"), draw(arc, run=1.0))
        rad = Line(o, ax.c2p(3, 0) + (0, 0, 0), color=ORG, stroke_width=5).rotate(PI / 4, about_point=o).set_z_index(3)
        rl = M("3", size=44, color=ORG).move_to(rad.get_center() + np.array([-0.25, 0.25, 0]))
        self.go(K("30:39.65"), Create(rad), FadeIn(rl), run=0.5)
        self.go(K("30:41.19"), Circumscribe(arc, color=YEL, shape=Rectangle, buff=0.1), run=0.8)
        sec_ = Sector(radius=r, angle=PI, start_angle=0, arc_center=o, fill_color=GRN, fill_opacity=0.38, stroke_width=0).set_z_index(-1)
        self.go(K("30:42.39"), FadeIn(sec_), run=0.5)
        e3 = M(r"\tfrac{1}{2}\,\pi\cdot 3^2", "=", r"\frac{9\pi}{2}", size=56).move_to([3.4, -2.2, 0])
        e3[2].set_color(GRN)
        self.go(K("30:43.15"), Write(e3[0]), run=0.8)
        self.go(K("30:45.63"), Write(e3[1:]), run=0.5)
        self.play(Create(answer_box(e3[2])), run_time=0.4)


class K33_Odd(Shot):
    """x from -2 to 2: a triangle of area 2 below and one of area 2 above, -2 + 2 = 0."""
    def body(self):
        self.title("Areas by Geometry", animate=False)
        F = M(r"\int_{-2}^{2}x\,dx", size=62).move_to([0, 1.5, 0])
        ax = axes((-3, 3, 1), (-3, 3, 1), x_length=3.6, y_length=3.6, center=(-2.8, -1.25, 0), nums=False)
        ticks = VGroup(M("-2", size=36, color=ORG).next_to(ax.c2p(-2, 0), UP, buff=0.12),
                       M("2", size=36, color=ORG).next_to(ax.c2p(2, 0), DOWN, buff=0.12))
        self.go(K("30:47.71"), Write(F), Create(ax), FadeIn(ax.labels), FadeIn(ticks), run=0.8)
        ln = curve(ax, lambda x: x, [-2.6, 2.6]).set_z_index(2)
        self.go(K("30:48.61"), draw(ln, run=0.8))
        tl = Polygon(ax.c2p(0, 0), ax.c2p(-2, 0), ax.c2p(-2, -2), stroke_width=0, fill_color=RED, fill_opacity=0.4).set_z_index(-1)
        tr = Polygon(ax.c2p(0, 0), ax.c2p(2, 0), ax.c2p(2, 2), stroke_width=0, fill_color=GRN, fill_opacity=0.4).set_z_index(-1)
        self.go(K("30:51.11"), FadeIn(tl), run=0.5)
        a1 = M("2", size=44, color=RED).move_to(ax.c2p(-1.35, -0.6))
        self.go(K("30:53.21"), FadeIn(a1, scale=0.6), run=0.4)
        self.go(K("30:54.49"), FadeIn(tr), run=0.5)
        a2 = M("2", size=44, color=GRN).move_to(ax.c2p(1.35, 0.6))
        self.go(K("30:56.29"), FadeIn(a2, scale=0.6), run=0.4)
        s = M("-2", "+", "2", "=", "0", size=64).move_to([3.0, -1.1, 0])
        s[0].set_color(RED); s[2].set_color(GRN); s[4].set_color(GRN)
        self.go(K("30:57.53"), TransformFromCopy(a1, s[0]), Write(s[1]), TransformFromCopy(a2, s[2]), run=0.8)
        self.go(K("30:59.77"), Write(s[3:]), run=0.45)
        self.play(Create(answer_box(s[4])), run_time=0.35)


# ---------------------------------------------------------------- properties

def fp(x):
    return 1.3 + 0.55 * np.sin(1.2 * x) + 0.1 * x


def prop_axes():
    return axes((0, 5, 1), (0, 2.6, 1), x_length=6.4, y_length=2.9, center=(0, -1.3, 0), nums=False, y_label=None)


class K33_Props(Shot):
    """Same limits: no width, no area (b slides onto a). Swapped limits: the direction reverses and the sign flips."""
    def body(self):
        self.title("Properties", K("31:00.97"))
        A, B = 1.0, 4.0
        ax = prop_axes()
        cv = curve(ax, fp, [0.2, 4.8]).set_z_index(2)
        bx = ValueTracker(B)
        la = M("a", size=44, color=ORG).next_to(ax.c2p(A, 0), DOWN, buff=0.15)
        reg = always_redraw(lambda: area(ax, fp, A, max(bx.get_value(), A + 0.01)).set_z_index(-1))
        lb = always_redraw(lambda: M("b", size=44, color=ORG).next_to(ax.c2p(bx.get_value(), 0), DOWN, buff=0.15)
                           .set_opacity(min(1.0, (bx.get_value() - A) / 0.6)))
        st = VGroup(ax, ax.labels, cv, la, area(ax, fp, A, B).set_z_index(-1), lb.copy().clear_updaters())
        self.go(K("31:04.60"), FadeIn(st), run=0.7)
        self.remove(st[4], st[5])
        self.add(reg, lb)
        P1 = M(r"\int_a^a f(x)\,dx", "=", "0", size=64).move_to([0, 1.3, 0])
        P1[2].set_color(GRN)
        self.go(K("31:08.53"), Write(P1[0]), run=0.6)
        self.play(bx.animate.set_value(A), run_time=1.4)
        self.go(K("31:10.69"), Write(P1[1:]), run=0.5)
        self.go(K("31:12.47"), Indicate(P1[2], color=GRN, scale_factor=1.3), run=0.7)
        # swap the limits
        self.go(K("31:14.60"), FadeOut(P1), bx.animate.set_value(B), run=0.6)
        reg_s = area(ax, fp, A, B).set_z_index(-1)
        lbs = lb.copy().clear_updaters()
        self.remove(reg, lb)
        self.add(reg_s, lbs)
        L = integ("a", "b", r"f(x)\,dx", size=54)
        eqm = M("=", size=58)
        mn = M("-", size=58, color=RED)
        Rt = integ("a", "b", r"f(x)\,dx", size=54)
        row = VGroup(L, eqm, mn, Rt).arrange(RIGHT, buff=0.3).move_to([0, 1.45, 0])
        dy = DOWN * 0.95
        arr = Arrow(ax.c2p(A, 0) + dy, ax.c2p(B, 0) + dy, buff=0, color=GRN, stroke_width=5, tip_length=0.22)
        self.go(K("31:15.25"), Write(L), GrowArrow(arr), run=0.5)
        lo, hi = L[1], L[2]
        p_lo, p_hi = lo.get_center().copy(), hi.get_center().copy()
        arr2 = Arrow(ax.c2p(B, 0) + dy, ax.c2p(A, 0) + dy, buff=0, color=RED, stroke_width=5, tip_length=0.22)
        self.go(K("31:15.80"), lo.animate(path_arc=PI).move_to(p_hi), hi.animate(path_arc=PI).move_to(p_lo),
                ReplacementTransform(arr, arr2), run=0.8)
        self.go(K("31:16.70"), Transform(reg_s, area(ax, fp, A, B, color=RED).set_z_index(-1)), run=0.6)
        self.go(K("31:19.33"), Write(eqm), Write(mn), run=0.4)
        self.go(K("31:20.10"), Write(Rt), run=0.8)


class K33_Split(Shot):
    """Constants out, sums split; the integral a to b plus b to c is a to c, read as areas."""
    def body(self):
        self.title("Properties", animate=False)
        r1 = eq_at(M(r"\int k\,f(x)\,dx", "=", r"k\int f(x)\,dx", size=58), 1, 0, 1.1)
        self.go(K("31:22.41"), Write(r1[0]), run=0.5)
        self.go(K("31:23.05"), Write(r1[1:]), run=0.6)
        self.go(K("31:23.70"), Circumscribe(r1[2][0], color=YEL, buff=0.08), run=0.6)
        r2 = eq_at(M(r"\int \big(f+g\big)\,dx", "=", r"\int f\,dx+\int g\,dx", size=58), 1, 0, -0.6)
        self.go(K("31:24.55"), Write(r2[0]), run=0.5)
        self.go(K("31:25.15"), Write(r2[1:]), run=0.8)
        self.wipe(K("31:27.03"), run=0.4)
        A, Bm, C = 0.7, 2.5, 4.3
        ax = prop_axes()
        cv = curve(ax, fp, [0.2, 4.8]).set_z_index(2)
        a1 = area(ax, fp, A, Bm).set_z_index(-1)
        a2 = area(ax, fp, Bm, C).set_z_index(-1)
        labs = VGroup(*[M(s, size=44, color=ORG).next_to(ax.c2p(x, 0), DOWN, buff=0.15) for s, x in (("a", A), ("b", Bm), ("c", C))])
        self.go(K("31:27.71"), FadeIn(VGroup(ax, ax.labels, cv, a1, a2, labs[0], labs[2])), run=0.6)
        cut = DashedLine(ax.c2p(Bm, 0), ax.c2p(Bm, fp(Bm)), color=YEL, stroke_width=4, dash_length=0.1).set_z_index(3)
        self.go(K("31:28.55"), Create(cut), FadeIn(labs[1]), run=0.5)
        P = M(r"\int_a^b f\,dx", "+", r"\int_b^c f\,dx", "=", r"\int_a^c f\,dx", size=60).move_to([0, 1.25, 0])
        self.go(K("31:30.23"), Write(P[0]), Indicate(a1, color=GRN, scale_factor=1.0), run=0.7)
        self.go(K("31:31.65"), Write(P[1:3]), Indicate(a2, color=GRN, scale_factor=1.0), run=0.7)
        self.go(K("31:33.79"), Write(P[3:]), run=0.7)
        self.go(K("31:34.67"), Indicate(VGroup(a1, a2), color=GRN, scale_factor=1.0), run=0.8)
        self.go(K("31:36.91"), Circumscribe(a1, color=YEL, buff=0.05), Circumscribe(P[0], color=YEL, buff=0.08), run=0.9)
        self.go(K("31:38.99"), Circumscribe(a2, color=YEL, buff=0.05), Circumscribe(P[2], color=YEL, buff=0.08), run=0.9)
        self.go(K("31:41.07"), Circumscribe(VGroup(a1, a2), color=YEL, buff=0.05), Circumscribe(P[4], color=YEL, buff=0.08), run=1.0)


class K33_Use(Shot):
    """Given 0..5 = 10 and 0..2 = 3: 2..5 = 7; and 5..0 = -10."""
    def body(self):
        self.title("Using the Rules", K("31:43.17"))
        f = lambda x: 1.2 + 0.45 * np.sin(1.1 * x) + 0.1 * x
        ax = axes((0, 5.6, 1), (0, 2.6, 1), x_length=5.0, y_length=2.5, center=(3.6, 0.55, 0), nums=False, y_label=None)
        cv = curve(ax, f, [0, 5.4]).set_z_index(2)
        ticks = VGroup(*[M(s, size=36, color=ORG).next_to(ax.c2p(x, 0), DOWN, buff=0.12) for s, x in (("2", 2), ("5", 5))])
        g1 = eq_at(M(r"\int_0^5 f(x)\,dx", "=", "10", size=54), 1, -3.0, 1.55)
        g2 = eq_at(M(r"\int_0^2 f(x)\,dx", "=", "3", size=54), 1, -3.0, 0.1)
        al = area(ax, f, 0, 2).set_z_index(-1)
        ar_ = area(ax, f, 2, 5).set_z_index(-1)
        self.go(K("31:45.43"), FadeIn(VGroup(ax, ax.labels, cv, ticks)), Write(g1[0]), run=0.8)
        self.go(K("31:47.95"), Write(g1[1:]), FadeIn(al), FadeIn(ar_), run=0.5)
        self.go(K("31:49.43"), Write(g2[0]), run=0.8)
        l3 = M("3", size=48, color=GRN).move_to(ax.c2p(1.0, 0.65))
        self.go(K("31:51.41"), Write(g2[1:]), Indicate(al, color=GRN, scale_factor=1.0), FadeIn(l3), run=0.6)
        q = M("?", size=54, color=YEL).move_to(ax.c2p(3.5, 0.7))
        self.go(K("31:53.61"), FadeIn(q, scale=0.6), Indicate(ar_, color=YEL, scale_factor=1.0), run=0.6)
        w1 = eq_at(M(r"\int_0^5 f\,dx", "=", r"\int_0^2 f\,dx", "+", r"\int_2^5 f\,dx", size=54), 1, -3.0, -1.55)
        self.go(K("31:55.71"), Write(w1[:2]), run=0.6)
        self.go(K("31:57.11"), Write(w1[2]), run=0.5)
        self.go(K("31:58.19"), Write(w1[3:]), run=0.7)
        w2 = eq_at(M("10", "=", "3", "+", r"\int_2^5 f\,dx", size=54), 1, -3.0, -3.0)
        self.go(K("32:00.41"), TransformFromCopy(g1[2], w2[0]), Write(w2[1]), run=0.6)
        self.go(K("32:01.21"), TransformFromCopy(g2[2], w2[2]), Write(w2[3]), TransformFromCopy(w1[4], w2[4]), run=0.8)
        ans = M(r"\int_2^5 f\,dx", "=", "7", size=56).move_to([3.7, -2.4, 0])
        ans[2].set_color(GRN)
        l7 = M("7", size=48, color=GRN).move_to(q)
        self.go(K("32:04.09"), Write(ans), ReplacementTransform(q, l7), run=0.6)
        abx = answer_box(ans[2])
        self.play(Create(abx), run_time=0.35)
        # backwards
        self.go(K("32:05.51"), FadeOut(VGroup(w1, w2)), FadeOut(ans), FadeOut(abx), run=0.4)
        b1 = eq_at(M(r"\int_5^0 f\,dx", "=", r"-\int_0^5 f\,dx", "=", "-10", size=58), 1, -3.0, -2.0)
        b1[2][0].set_color(RED); b1[4].set_color(GRN)
        self.go(K("32:05.95"), Write(b1[0]), run=0.7)
        self.go(K("32:08.29"), Write(b1[1:3]), run=0.7)
        self.go(K("32:09.29"), Indicate(b1[2][0], color=RED, scale_factor=1.6), run=0.6)
        self.go(K("32:10.69"), Write(b1[3:]), run=0.45)
        self.play(Create(answer_box(b1[4])), run_time=0.3)


class K33_Try(Shot):
    """The integral of (2f + 1) from 0 to 5: 2 times 10 plus a 5 by 1 rectangle = 25."""
    def body(self):
        self.title("Try This One", K("32:13.29"))
        gv = M(r"\int_0^5 f(x)\,dx = 10", size=42, color=DIM).move_to([-4.6, 1.95, 0])
        self.go(K("32:13.85"), FadeIn(gv), run=0.4)
        Q = M(r"\int_0^5 \big(2f(x)+1\big)\,dx", size=62).move_to([-1.6, 0.55, 0])
        self.go(K("32:14.30"), Write(Q), run=1.1)
        S = M("=", r"2\int_0^5 f(x)\,dx", "+", r"\int_0^5 1\,dx", size=58)
        S.next_to(Q, DOWN, buff=0.45).align_to(Q, LEFT).shift(RIGHT * 0.6)
        self.go(K("32:18.27"), Write(S[:2]), run=0.8)
        self.go(K("32:20.55"), Write(S[2:]), run=0.8)
        b1 = Brace(S[1], DOWN, color=ORG, buff=0.12)
        t1 = M(r"2\cdot 10 = 20", size=46, color=ORG).next_to(b1, DOWN, buff=0.1)
        self.go(K("32:22.45"), GrowFromCenter(b1), Write(t1), run=0.9)
        self.go(K("32:23.45"), Indicate(t1, color=ORG, scale_factor=1.1), run=0.5)
        ax = axes((0, 6, 1), (0, 1.6, 1), x_length=3.6, y_length=1.3, center=(4.6, 1.35, 0), nums=False, y_label=None)
        rc = Polygon(ax.c2p(0, 0), ax.c2p(5, 0), ax.c2p(5, 1), ax.c2p(0, 1), stroke_color=GRN, stroke_width=3, fill_color=GRN,
                     fill_opacity=0.4).set_z_index(-1)
        self.go(K("32:24.81"), Create(ax), FadeIn(ax.labels), run=0.6)
        self.go(K("32:27.27"), FadeIn(rc), run=0.5)
        wl = M("5", size=40, color=ORG).next_to(ax.c2p(5, 0), DOWN, buff=0.12)
        self.go(K("32:28.13"), FadeIn(wl), run=0.4)
        hl = M("1", size=40, color=ORG).next_to(ax.c2p(0, 1), LEFT, buff=0.12)
        self.go(K("32:29.09"), FadeIn(hl), run=0.4)
        b2 = Brace(S[3], DOWN, color=ORG, buff=0.12)
        t2 = M("5", size=46, color=ORG).next_to(b2, DOWN, buff=0.1)
        self.go(K("32:30.21"), GrowFromCenter(b2), TransformFromCopy(rc, t2), run=0.7)
        T = M("20", "+", "5", "=", "25", size=60).move_to([4.6, -3.2, 0])
        T[4].set_color(GRN)
        self.go(K("32:31.41"), TransformFromCopy(t1, T[0]), Write(T[1]), TransformFromCopy(t2, T[2]), run=0.8)
        self.go(K("32:33.29"), Write(T[3:]), run=0.45)
        self.play(Create(answer_box(T[4])), run_time=0.35)


class K33_Recap(Shot):
    """Recap: antiderivative + C, the reverse power rule, the definite integral as a limit of sums = signed area."""
    def body(self):
        self.title("Quick Recap", K("32:34.97"))
        X = 1.2

        def lab(s, y):
            return H(s, 36, DIM).move_to([-4.9, y, 0])
        r1 = M(r"\int 2x\,dx", "=", "x^2", r"+\,C", size=60).move_to([X, 1.45, 0])
        r1[2].set_color(BLUE); r1[3].set_color(YEL)
        l1 = lab("undo d/dx", 1.45)
        self.go(K("32:36.69"), FadeIn(l1), Write(r1[:3]), run=0.9)
        self.go(K("32:40.17"), Write(r1[3]), run=0.5)
        self.play(Circumscribe(r1[3], color=YEL, buff=0.08), run_time=0.6)
        r2 = M(r"\int x^n\,dx", "=", r"\frac{x^{n+1}}{n+1}", r"+\,C", size=60).move_to([X, -0.05, 0])
        l2 = lab("power rule", -0.05)
        self.go(K("32:42.03"), FadeIn(l2), Write(r2), run=1.0)
        top, bot = frac_parts(r2[2])
        self.go(K("32:43.47"), Circumscribe(top, color=YEL, buff=0.06), run=0.8)
        self.go(K("32:45.43"), Circumscribe(bot, color=YEL, buff=0.06), run=0.8)
        r3 = M(r"\int_a^b f(x)\,dx", "=", r"\lim_{n\to\infty}\sum f(x_i)\,\Delta x", size=58).move_to([X, -1.75, 0])
        r3[0].set_color(GRN)
        l3 = lab("definite integral", -1.75)
        self.go(K("32:47.69"), FadeIn(l3), Write(r3[0]), run=0.7)
        self.go(K("32:49.25"), Write(r3[1:]), run=1.0)
        sa = H("signed area", 40, GRN).next_to(r3, DOWN, buff=0.35)
        self.go(K("32:52.07"), FadeIn(sa, shift=UP * 0.1), Create(under(r3[0], GRN)), run=0.5)


class K33_Same(Shot):
    """Cliffhanger: undoing derivatives and finding areas, side by side, are the same thing."""
    def body(self):
        self.title("Next Chapter", K("32:54.81"))
        boxes = VGroup(*[RoundedRectangle(width=5.6, height=3.9, corner_radius=0.3, stroke_color=FAINT, stroke_width=3)
                         .move_to([x, -0.6, 0]) for x in (-3.4, 3.4)])
        self.go(K("32:56.41"), LaggedStart(Create(boxes[0]), Create(boxes[1]), lag_ratio=0.3), run=0.9)
        two = M("2x", size=72, color=PINK).move_to([-1.95, 0.05, 0])
        sqm = M("x^2", size=72, color=BLUE).move_to([-4.85, 0.1, 0])
        ba = Arrow([-2.65, 0.05, 0], [-4.15, 0.05, 0], buff=0, color=GRN, stroke_width=5, tip_length=0.24)
        l1 = H("undoing derivatives", 40, YEL).move_to([-3.4, -1.7, 0])
        self.go(K("32:57.81"), FadeIn(two, shift=LEFT * 0.15), GrowArrow(ba), run=0.5)
        self.play(FadeIn(sqm, shift=LEFT * 0.2), FadeIn(l1, shift=UP * 0.1), run_time=0.5)
        ax = Axes(x_range=[0, 4, 1], y_range=[0, 2.5, 1], x_length=4.3, y_length=2.3,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, include_ticks=False)).move_to([3.4, 0.0, 0])
        hill = lambda x: 1.2 + 0.6 * np.sin(1.3 * x)
        cv = curve(ax, hill, [0, 3.8]).set_z_index(2)
        ar = area(ax, hill, 0.6, 3.3).set_z_index(-1)
        l2 = H("finding areas", 40, YEL).move_to([3.4, -1.7, 0])
        self.go(K("32:59.19"), Create(ax), Create(cv), run=0.6)
        self.play(FadeIn(ar), FadeIn(l2, shift=UP * 0.1), run_time=0.5)
        eq = M("=", size=120, color=YEL).move_to([0, -0.5, 0])
        self.go(K("33:00.75"), Write(eq), run=0.6)
        self.go(K("33:02.05"), Indicate(ar, color=GRN, scale_factor=1.05), Indicate(ba, color=GRN, scale_factor=1.1), run=0.9)
        self.go(K("33:03.40"), Circumscribe(eq, color=YEL, buff=0.15), run=1.0)
