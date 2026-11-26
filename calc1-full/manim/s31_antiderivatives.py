"""Builder 31: start of Chapter 11 "Antiderivatives and the Area Problem" (3:11:42.17 - 3:18:47.24).
The second half of calculus: blocks broken apart (derivative) and built back up (integral); the two ideas side by side
(undo a derivative, area under a curve) joined by "=" for the next chapter; the d/dx machine run backwards (2x in,
x^2 out) and the definition F' = f; + C: x^2 + 5, x^2 - 100, x^2 + pi all give 2x, the constants struck out; the family
y = x^2 + C on one graph, one curve sliding, then one x tracker drives parallel tangents on three curves; the integral
sign (an S stretched into the integral sign, dx as the closing bracket); the reverse power rule set under the forward
one (add 1, divide by the new power) with x^2, x^5, x, 7 and a check by differentiating; n = -1 gives 1/x -> ln|x|
(the graph's left branch mirrors in for negative x); the basic table read right to left; linearity; two worked
examples. Colours: functions BLUE, derivatives PINK, integrals / answers GRN, constants and + C YEL, numbers ORG.
Whisper mishearings fixed on screen: "tiny instance" = instants, "f is an antiderivative of f" = F and f,
"the integral of e to the x is negative cosine" = the integral of sin x.
END SEAM: K31_Root2 ends with the answer alone: 2/3 x^{3/2} - x^{-2} + C (y = 0.95) and below it "or"
2/3 x^{3/2} - 1/x^2 + C (y = -1.55) in one green box, the - x^{-2} term boxed in PINK with a curved arrow from a
d/dx label at the right: the check by differentiating starts there."""
from common import *

D = r"\frac{d}{dx}"
ARC = 0.55 * PI


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def st(*parts, eq=3, x=0.0, y=0.0, size=64, c=None):
    """One worked line aligned on its part eq; c = {part index: colour}."""
    m = M(*parts, size=size)
    for k, col in (c or {}).items():
        m[k].set_color(col)
    return at_eq(m, eq, x, y)


def morph(A, B, pairs, arc=(), new=True, fade=True):
    an = [ReplacementTransform(A[i], B[j], path_arc=ARC if i in arc else 0) for i, j in pairs]
    ui, uj = {i for i, _ in pairs}, {j for _, j in pairs}
    if fade:
        an += [FadeOut(A[i]) for i in range(len(A)) if i not in ui]
    if new:
        an += [Write(B[j]) for j in range(len(B)) if j not in uj]
    return an


def ids(n):
    return [(i, i) for i in range(n)]


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


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


def machine(c, w=2.4, h=2.0):
    b = RoundedRectangle(width=w, height=h, corner_radius=0.18, stroke_color=PINK, stroke_width=5).move_to(c)
    return VGroup(b, M(D, size=64, color=PINK).move_to(b))


def ring(mob, color=RED, k=1.35):
    return Circle(color=color, stroke_width=4).surround(mob, buffer_factor=k)


# ---------------------------------------------------------------- shots

class K31_SecondHalf(Shot):
    """Derivatives break change into tiny instants, integrals build it back up; the two ideas of the chapter."""
    def body(self):
        self.title("The Second Half", "3:11:47.67")
        n, w = 10, 0.9
        pcs = VGroup(*[Rectangle(width=w, height=0.9, stroke_color=BLUE, stroke_width=3, fill_color=BLUE, fill_opacity=0.3)
                       .move_to([(i - (n - 1) / 2) * w, -0.4, 0]) for i in range(n)])
        self.go("3:11:50.40", Create(pcs), run=0.9)
        der = H("derivative", 50, PINK).move_to([0, 1.2, 0])
        self.go("3:11:52.03", Write(der), run=0.5)
        spread = [p.animate.shift(RIGHT * (i - (n - 1) / 2) * 0.26) for i, p in enumerate(pcs)]
        self.go("3:11:53.13", *spread, run=0.9)
        mom = H("tiny instants", 40, DIM).move_to([0, -1.6, 0])
        self.go("3:11:54.37", FadeIn(mom, shift=UP * 0.15), run=0.5)
        self.go("3:11:55.81", FadeOut(der, shift=UP * 0.15), FadeOut(mom), run=0.5)
        back = [p.animate.move_to([(i - (n - 1) / 2) * w, -0.4, 0]).set_stroke(GRN).set_fill(GRN, 0.35) for i, p in enumerate(pcs)]
        self.go("3:11:57.53", *back, run=1.1)
        br = Brace(pcs, DOWN, color=GRN, buff=0.15)
        tot = H("built up", 42, GRN).next_to(br, DOWN, buff=0.12)
        self.go("3:11:58.70", GrowFromCenter(br), FadeIn(tot, shift=UP * 0.15), run=0.6)
        integ = H("integration", 54, GRN).move_to([0, 1.2, 0])
        self.go("3:12:00.40", Write(integ), run=0.7)

        # the two ideas
        self.wipe("3:12:01.73")
        boxes = VGroup(*[RoundedRectangle(width=5.6, height=3.9, corner_radius=0.3, stroke_color=FAINT, stroke_width=3)
                         .move_to([x, -0.55, 0]) for x in (-3.4, 3.4)])
        self.go("3:12:02.27", LaggedStart(Create(boxes[0]), Create(boxes[1]), lag_ratio=0.3), run=0.9)
        two = M("2x", size=72, color=PINK).move_to([-1.95, 0.1, 0])
        sq = M("x^2", size=72, color=BLUE).move_to([-4.85, 0.15, 0])
        back_ar = arrow([-2.65, 0.1], [-4.15, 0.1], GRN)
        lab1 = H("undo a derivative", 40, YEL).move_to([-3.4, -1.65, 0])
        self.go("3:12:07.57", FadeIn(two, shift=LEFT * 0.15), run=0.4)
        self.go("3:12:08.05", GrowArrow(back_ar), FadeIn(lab1, shift=UP * 0.1), run=0.5)
        self.play(FadeIn(sq, shift=LEFT * 0.2), run_time=0.4)
        ax = Axes(x_range=[0, 4, 1], y_range=[0, 2.5, 1], x_length=4.3, y_length=2.3,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, include_ticks=False)).move_to([3.4, 0.05, 0])
        hill = lambda x: 1.2 + 0.6 * np.sin(1.3 * x)
        cv = curve(ax, hill, [0, 3.8])
        ar = area(ax, hill, 0.6, 3.3)
        lab2 = H("area under a curve", 40, YEL).move_to([3.4, -1.65, 0])
        self.go("3:12:09.63", Create(ax), run=0.5)
        self.play(draw(cv, run=0.7))
        self.go("3:12:10.87", FadeIn(ar), FadeIn(lab2, shift=UP * 0.1), run=0.6)
        nxt = H("next chapter", 36, DIM).move_to([0, 1.85, 0])
        self.go("3:12:12.77", FadeIn(nxt, shift=DOWN * 0.1), run=0.5)
        eq = M("=", size=110, color=YEL).move_to([0, -0.45, 0])
        self.go("3:12:15.25", Write(eq), run=0.6)
        self.go("3:12:16.63", Indicate(ar, color=GRN, scale_factor=1.05), Indicate(back_ar, color=GRN, scale_factor=1.1), run=0.9)
        self.go("3:12:17.93", Circumscribe(eq, color=YEL, buff=0.15), run=1.0)


class K31_Backwards(Shot):
    """The d/dx machine: x^2 in, 2x out. Then backwards: 2x in, what comes out? x^2. The definition F' = f."""
    def body(self):
        self.title("Undoing Derivatives", "3:12:21.35")
        Y = 0.35
        mach = machine([0, Y, 0])
        self.go("3:12:23.70", Create(mach[0]), Write(mach[1]), run=0.7)
        a1, a2 = arrow([-3.7, Y], [-1.4, Y], PINK), arrow([1.4, Y], [3.7, Y], PINK)
        sq = M("x^2", size=80, color=BLUE).move_to([-4.7, Y, 0])
        self.go("3:12:26.19", FadeIn(sq, shift=RIGHT * 0.2), Create(a1), run=0.5)
        inn = sq.copy()
        self.go("3:12:27.10", inn.animate.move_to(mach).scale(0.4).set_opacity(0), run=0.5)
        self.remove(inn)
        two = M("2x", size=80, color=PINK).move_to([4.7, Y, 0])
        out = two.copy().move_to(mach).scale(0.4).set_opacity(0)
        self.play(Create(a2), out.animate.move_to(two).scale(2.5).set_opacity(1), run_time=0.6)
        self.remove(out); self.add(two)

        # backwards
        b1, b2 = arrow([3.7, Y], [1.4, Y], GRN), arrow([-1.4, Y], [-3.7, Y], GRN)
        self.go("3:12:28.37", FadeOut(sq), FadeOut(two), run=0.4)
        bk = H("backwards", 40, YEL).next_to(mach, DOWN, buff=0.22)
        self.go("3:12:29.25", ReplacementTransform(a2, b1), ReplacementTransform(a1, b2), FadeIn(bk, shift=UP * 0.1), run=0.7)
        two2 = M("2x", size=80, color=PINK).move_to([4.7, Y, 0])
        self.go("3:12:30.63", FadeIn(two2, shift=LEFT * 0.2), run=0.4)
        q = H("?", 90, YEL).move_to([-4.7, Y, 0])
        self.go("3:12:31.57", FadeIn(q, shift=LEFT * 0.2), run=0.4)
        self.go("3:12:34.55", Circumscribe(two2, color=PINK, buff=0.12), run=0.8)
        self.go("3:12:36.09", Indicate(q, color=YEL), run=0.6)
        chk = st(D, "x^2", "=", "2x", eq=2, x=0, y=-2.45, size=58, c={1: BLUE, 3: PINK})
        self.go("3:12:38.65", Write(chk[0]), run=0.4)
        self.go("3:12:39.29", Write(chk[1]), run=0.4)
        self.go("3:12:39.85", Write(chk[2:]), run=0.5)
        inn = two2.copy()
        self.go("3:12:41.07", inn.animate.move_to(mach).scale(0.4).set_opacity(0), run=0.5)
        self.remove(inn)
        sq2 = M("x^2", size=80, color=BLUE).move_to([-4.7, Y, 0])
        out = sq2.copy().move_to(mach).scale(0.4).set_opacity(0)
        self.go("3:12:42.00", FadeOut(q, scale=0.8), out.animate.move_to(sq2).scale(2.5).set_opacity(1), run=0.6)
        self.remove(out); self.add(sq2)

        # the definition
        self.wipe("3:12:43.51")
        l1 = VGroup(M("F", size=80, color=BLUE), H("is an antiderivative of", 48), M("f", size=80, color=PINK)) \
            .arrange(RIGHT, buff=0.3).move_to([0, 1.2, 0])
        l1[2].align_to(l1[0], DOWN)
        self.go("3:12:43.99", Write(l1[0]), run=0.4)
        self.go("3:12:45.15", FadeIn(l1[1], shift=UP * 0.1), run=0.5)
        self.go("3:12:46.21", Write(l1[2]), run=0.4)
        l2 = M("F'(x)", "=", "f(x)", size=80).move_to([0, -0.15, 0])
        l2[0].set_color(BLUE); l2[2].set_color(PINK)
        self.go("3:12:47.09", Write(l2[0]), run=0.45)
        self.go("3:12:47.55", Write(l2[1:]), run=0.5)
        fr = panel(VGroup(l1, l2), PURP, buff=0.3)
        self.play(Create(fr), run_time=0.6)
        l3 = VGroup(M("x^2", size=72, color=BLUE), H("is an antiderivative of", 44), M("2x", size=72, color=PINK)) \
            .arrange(RIGHT, buff=0.3).move_to([0, -2.4, 0])
        self.go("3:12:49.17", Write(l3[0]), run=0.4)
        self.go("3:12:50.23", FadeIn(l3[1], shift=UP * 0.1), run=0.5)
        self.go("3:12:51.27", Write(l3[2]), run=0.4)


class K31_PlusC(Shot):
    """x^2 + 5, x^2 - 100, x^2 + pi all differentiate to 2x: the constant vanishes, so going back we write + C."""
    def body(self):
        self.title("Here's the Catch", "3:12:53.05")
        X = 1.0
        rows = []
        for y, c in ((1.55, "+5"), (0.1, "-100"), (-1.35, r"+\pi")):
            rows.append(st(D, "(", "x^2", c, ")", "=", "2x", eq=5, x=X, y=y, size=64, c={2: BLUE, 3: ORG, 6: PINK}))
        r1, r2, r3 = rows
        self.go("3:12:54.37", Write(r1[0:3]), run=0.5)
        self.go("3:12:54.81", Write(r1[3:5]), run=0.4)
        self.go("3:12:56.37", Write(r1[5:]), run=0.5)
        self.go("3:12:58.59", Write(r2[0:5]), run=0.7)
        self.go("3:12:59.60", Write(r2[5:]), run=0.4)
        self.go("3:13:00.91", Write(r3[0:5]), run=0.7)
        self.go("3:13:01.93", Write(r3[5:]), run=0.4)
        xs = VGroup(*[strike(r[3]) for r in rows])
        self.go("3:13:04.63", LaggedStart(*[Create(x) for x in xs], lag_ratio=0.2), run=0.7)
        zero = H("gone", 36, RED).next_to(VGroup(r1[3], xs[0]), UP, buff=0.12)
        self.play(FadeIn(zero, shift=DOWN * 0.1), run_time=0.3)
        # backwards: x^2 + ?
        bot = M("2x", r"\;\longrightarrow\;", "x^2", "+", size=70)
        bot.add(H("?", 72, YEL).next_to(bot, RIGHT, buff=0.15))
        bot.move_to([0, -2.85, 0])
        bot[0].set_color(PINK); bot[1].set_color(GRN); bot[2].set_color(BLUE)
        self.go("3:13:07.01", FadeIn(bot[0:2], shift=LEFT * 0.2), run=0.5)
        self.play(Write(bot[2:]), run_time=0.5)
        self.go("3:13:09.13", Circumscribe(bot[4], color=YEL, buff=0.12), run=0.7)
        cons = VGroup(*[r[3] for r in rows])
        self.go("3:13:10.63", Indicate(cons, color=YEL, scale_factor=1.15), run=0.8)

        big = M("x^2", "+", "C", size=120).move_to([0, 1.0, 0])
        big[0].set_color(BLUE); big[2].set_color(YEL)
        bigq = M("x^2", "+", size=120)
        bigq.add(H("?", 120, YEL).move_to(big[2]))
        bigq.shift(big[0].get_center() - bigq[0].get_center())
        bigq[0].set_color(BLUE)
        self.go("3:13:12.19", FadeOut(VGroup(*rows, xs, zero, bot[0:2])), ReplacementTransform(bot[2:], bigq), run=0.8)
        self.go("3:13:14.43", ReplacementTransform(bigq, big), run=0.5)
        nt = note("any constant", big[2], direction=DR, dist=0.5)
        self.go("3:13:15.77", FadeIn(nt[0]), Create(nt[1]), run=0.5)
        coi = H("the constant of integration", 44, YEL).move_to([0, -0.45, 0])
        self.go("3:13:19.15", FadeOut(nt), FadeIn(coi, shift=UP * 0.1), run=0.6)
        bad = M("x^2", size=80, color=CHALK).move_to([-2.8, -1.85, 0])
        bx = cross_mark(s=0.3).next_to(bad, RIGHT, buff=0.4)
        self.go("3:13:21.19", FadeIn(bad), Create(bx), run=0.5)
        mis = H("most common mistake", 40, RED).move_to([-2.8, -3.0, 0])
        self.go("3:13:24.73", FadeIn(mis, shift=UP * 0.1), run=0.5)
        mk = M("-1", size=64, color=RED).next_to(bx, RIGHT, buff=0.3)
        self.go("3:13:28.85", Write(mk), run=0.4)
        good = M("x^2", "+C", size=80).move_to([2.8, -1.85, 0])
        good[0].set_color(BLUE); good[1].set_color(YEL)
        gk = tick_mark(s=0.55).next_to(good, RIGHT, buff=0.35)
        self.go("3:13:30.53", FadeIn(good), Create(gk), run=0.5)
        self.play(Circumscribe(big[1:], color=YEL, buff=0.12), run_time=0.7)


def para(ax, C, color=BLUE, w=5, op=1.0):
    xm = min(2.6, np.sqrt(6.6 - C))
    return ax.plot(lambda x: x * x + C, x_range=[-xm, xm], color=color, stroke_width=w, stroke_opacity=op)


class K31_Family(Shot):
    """y = x^2 + C: one curve slides up and down, the family is stacked, one x tracker shows parallel tangents."""
    def body(self):
        self.title("A Family of Curves")
        ax = axes(x_range=(-3, 3, 1), y_range=(-2, 7, 2), x_length=6.0, y_length=5.2, center=(-2.6, -0.8, 0))
        self.go("3:13:32.62", Create(ax), FadeIn(ax.labels), run=0.7)
        base = para(ax, 0)
        self.go("3:13:33.40", draw(base, run=0.9))
        lab = M("y", "=", "x^2", "+C", size=56).move_to([3.9, 1.5, 0])
        lab[2].set_color(BLUE); lab[3].set_color(YEL)
        self.go("3:13:34.40", Write(lab), run=0.6)
        c = ValueTracker(0)
        slide = always_redraw(lambda: para(ax, c.get_value(), w=4, op=0.85))
        self.add(slide)
        self.go("3:13:36.30", c.animate.set_value(3), run=0.6)
        self.play(c.animate.set_value(-1), run_time=0.9)
        self.remove(slide)
        self.add(para(ax, -1, w=4, op=0.85))
        fam = VGroup(*[para(ax, C, w=4, op=0.85) for C in (1, 2, 3)])
        self.go("3:13:38.33", LaggedStart(*[Create(f) for f in fam], lag_ratio=0.25), run=1.2)
        xt = ValueTracker(-1.5)
        tans = [live_tangent(ax, (lambda x, C=C: x * x + C), xt, length=1.5, readout=False) for C in (-1, 1, 3)]
        rd_lab = M(r"\text{slope} =", size=50, color=PINK).move_to([3.4, 0.1, 0])
        rd_num = always_redraw(lambda: M(f"{2 * xt.get_value() + 0:.1f}", size=50, color=PINK).next_to(rd_lab, RIGHT, buff=0.2))
        self.at("3:13:41.80")
        live_in(self, *tans, rd_num, run=0.4)
        self.play(FadeIn(rd_lab), run_time=0.3)
        self.go("3:13:42.97", xt.animate.set_value(1.5), run=3.0)
        same = H("same on every curve", 36, PINK).move_to([3.9, -0.65, 0])
        self.play(FadeIn(same, shift=UP * 0.1), run_time=0.4)
        dl = M(D, "(x^2+C)", "=", "2x", size=52).move_to([3.9, -1.9, 0])
        dl[1].set_color(BLUE); dl[3].set_color(PINK)
        self.go("3:13:46.33", Write(dl), run=0.8)


class K31_Notation(Shot):
    """The integral sign, the function, dx; read aloud; indefinite integral = the whole family F(x) + C."""
    def body(self):
        self.title("Integral Notation", "3:13:48.13")
        L = M(r"\int", "f(x)", r"\,dx", "=", "F(x)", "+C", size=124).move_to([0, 0.35, 0])
        L[0].set_color(GRN); L[1].set_color(PINK); L[4].set_color(BLUE); L[5].set_color(YEL)
        self.go("3:13:51.69", Write(L[0]), run=0.9)
        n0 = H("integral sign", 38, GRN).next_to(L[0], DOWN, buff=0.25)
        self.play(FadeIn(n0, shift=UP * 0.1), run_time=0.4)
        n1 = H("the function", 38, PINK).next_to(L[1], UP, buff=0.45).align_to(L[1], LEFT).shift(RIGHT * 0.2)
        self.go("3:13:53.65", Write(L[1]), FadeIn(n1, shift=DOWN * 0.1), run=0.6)
        self.go("3:13:54.49", Write(L[2]), run=0.5)
        ul = under(L[0:3], YEL, 0.75)
        self.go("3:13:56.59", FadeOut(n0), FadeOut(n1), run=0.3)
        self.play(Create(ul), run_time=1.3)
        pl = pill("indefinite integral", YEL, size=42).move_to([0, 2.05, 0])
        self.go("3:14:00.63", FadeIn(pl, shift=DOWN * 0.1), FadeOut(ul), run=0.5)
        self.go("3:14:02.45", Write(L[3:]), run=0.8)
        br = Brace(L[4:], DOWN, color=GRN, buff=0.2)
        fam = H("the whole family", 42, GRN).next_to(br, DOWN, buff=0.15)
        self.go("3:14:03.40", GrowFromCenter(br), FadeIn(fam, shift=UP * 0.1), run=0.6)


class K31_Sum(Shot):
    """The integral of 2x dx = x^2 + C; the integral sign is a stretched S for sum; dx closes it like a bracket."""
    def body(self):
        self.title("Integral Notation", animate=False)
        L = M(r"\int", "2x", r"\,dx", "=", "x^2", "+C", size=116).move_to([0, 1.0, 0])
        L[0].set_color(GRN); L[1].set_color(PINK); L[4].set_color(BLUE); L[5].set_color(YEL)
        self.go("3:14:05.79", Write(L[0]), run=0.5)
        self.go("3:14:06.43", Write(L[1]), run=0.4)
        self.go("3:14:07.01", Write(L[2]), run=0.4)
        self.go("3:14:07.51", Write(L[3]), run=0.3)
        self.go("3:14:08.41", Write(L[4]), run=0.5)
        self.go("3:14:09.15", Write(L[5]), run=0.4)
        # S -> integral sign
        S = H("S", 140, CHALK).move_to([-2.4, -1.95, 0])
        self.go("3:14:10.83", FadeIn(S, shift=UP * 0.1), run=0.4)
        self.go("3:14:11.63", S.animate.stretch(1.5, 1).stretch(0.55, 0).set_color(GRN), run=0.6)
        ig = M(r"\int", size=140, color=GRN).move_to(S)
        self.play(ReplacementTransform(S, ig), run_time=0.4)
        eq = M("=", size=80).next_to(ig, RIGHT, buff=0.5)
        sm = H("sum", 70, GRN).next_to(eq, RIGHT, buff=0.4)
        self.go("3:14:12.79", Write(eq), FadeIn(sm, shift=LEFT * 0.1), run=0.5)
        lt = H("(more on this later)", 36, DIM).next_to(sm, RIGHT, buff=0.5)
        self.go("3:14:14.65", FadeIn(lt), run=0.5)
        # dx
        self.go("3:14:18.75", FadeOut(VGroup(ig, eq, sm, lt)), run=0.4)
        self.play(Circumscribe(L[2], color=YEL, buff=0.1), run_time=0.7)
        nv = note("which variable", L[2], direction=DR, dist=0.45)
        self.go("3:14:20.47", FadeIn(nv[0]), Create(nv[1]), run=0.5)
        y0 = L.get_bottom()[1] - 0.35
        x0, x1 = L[0].get_left()[0] - 0.05, L[2].get_right()[0] + 0.05
        brk = VMobject(stroke_color=YEL, stroke_width=5).set_points_as_corners([[x0, y0 + 0.3, 0], [x0, y0, 0], [x1, y0, 0], [x1, y0 + 0.3, 0]])
        self.go("3:14:22.15", FadeOut(nv), run=0.4)
        self.go("3:14:24.07", Create(brk), run=0.7)
        s_lab = H("opens", 38, YEL).next_to([x0, y0, 0], DOWN, buff=0.2)
        e_lab = H("closes", 38, YEL).next_to([x1, y0, 0], DOWN, buff=0.2)
        self.go("3:14:25.95", FadeIn(s_lab, shift=UP * 0.1), Circumscribe(L[0], color=GRN, buff=0.1), run=0.8)
        self.go("3:14:27.57", FadeIn(e_lab, shift=UP * 0.1), Circumscribe(L[2], color=YEL, buff=0.1), run=0.8)


class K31_PowerRule(Shot):
    """Every derivative rule read backwards; the power rule forwards (n hops down, minus 1) and backwards (+1, divide)."""
    def body(self):
        self.title("Now the Rules", "3:14:29.80")
        dr = H("derivative rule", 46, PINK).move_to([-4.6, 0.0, 0])
        ir = H("integral rule", 46, GRN).move_to([4.6, 0.0, 0])
        ar = arrow([-2.5, 0.0], [2.6, 0.0], YEL)
        rb = H("read backwards", 36, YEL).next_to(ar, UP, buff=0.15)
        self.go("3:14:31.21", FadeIn(dr, shift=RIGHT * 0.1), run=0.5)
        self.go("3:14:32.45", GrowArrow(ar), FadeIn(rb), run=0.6)
        self.go("3:14:34.31", FadeIn(ir, shift=RIGHT * 0.1), run=0.5)
        self.wipe("3:14:35.60", run=0.35)
        self.title("Power Rule, Backwards")
        X = -1.6
        S0 = st(D, "x", "^{n}", "=", "x", "^{n}", x=X, y=1.4, size=64, c={5: YEL})
        S1 = st(D, "x", "^{n}", "=", "n", "x", x=X, y=1.4, size=64, c={4: YEL})
        S2 = st(D, "x", "^{n}", "=", "n", "x", "^{n-1}", x=X, y=1.4, size=64, c={4: YEL})
        S2[6][1:].set_color(PINK)
        self.go("3:14:38.30", Write(S0[0:3]), run=0.6)
        self.play(Write(S0[3]), TransformFromCopy(S0[1], S0[4]), TransformFromCopy(S0[2], S0[5]), run_time=0.5)
        d1 = H("1. bring the power down", 36, DIM)
        d2 = H("2. subtract 1", 36, DIM)
        VGroup(d1, d2).arrange(DOWN, aligned_edge=LEFT, buff=0.15).move_to([0, 1.4, 0]).to_edge(RIGHT, buff=0.45)
        self.go("3:14:39.59", *morph(S0, S1, ids(4) + [(4, 5), (5, 4)], arc=(5,)), FadeIn(d1, shift=LEFT * 0.1), run=0.8)
        self.go("3:14:40.87", *morph(S1, S2, ids(6)), FadeIn(d2, shift=LEFT * 0.1), run=0.5)
        dgrp = VGroup(*S2, d1, d2)
        I = st(r"\int", "x^{n}", r"\,dx", "=", r"\frac{x^{n+1}}{n+1}", "+C", x=X, y=-1.0, size=64, c={0: GRN, 5: YEL})
        num, bar, den = I[4][0:4], I[4][4], I[4][5:8]
        self.go("3:14:42.35", dgrp.animate.set_opacity(0.4), run=0.4)
        self.go("3:14:42.81", Write(I[0:4]), run=0.7)
        i1 = H("1. add 1 to the power", 36, GRN)
        i2 = H("2. divide by the new power", 36, GRN)
        VGroup(i1, i2).arrange(DOWN, aligned_edge=LEFT, buff=0.15).move_to([0, -1.0, 0]).to_edge(RIGHT, buff=0.45)
        self.go("3:14:46.25", TransformFromCopy(I[1], num), FadeIn(i1, shift=LEFT * 0.1), run=0.7)
        self.play(num[2:].animate.set_color(YEL), run_time=0.3)
        self.go("3:14:48.13", Create(bar), TransformFromCopy(num[1:], den), FadeIn(i2, shift=LEFT * 0.1), run=0.8)
        self.play(den.animate.set_color(YEL), run_time=0.3)
        # the rule alone, centred, then + C
        self.go("3:14:50.40", FadeOut(dgrp), FadeOut(i1), FadeOut(i2), run=0.4)
        rule = VGroup(*I)
        sh = np.array([-rule.get_center()[0], 0.2 - rule.get_center()[1], 0])
        I[5].shift(sh)
        self.play(VGroup(*I[0:5]).animate.shift(sh), run_time=0.7)
        self.go("3:14:55.21", Write(I[5]), run=0.4)
        bx = answer_box(rule)
        self.go("3:14:55.73", Create(bx), run=0.5)
        # make room for the examples
        self.play(VGroup(rule, bx).animate.scale(0.75).move_to([0, 1.75, 0]), run_time=0.45)


def rule_card():
    """The boxed reverse power rule, small at the top (the end of K31_PowerRule)."""
    r = M(r"\int", "x^{n}", r"\,dx", "=", r"\frac{x^{n+1}}{n+1}", "+C", size=64)
    r[0].set_color(GRN); r[5].set_color(YEL)
    r[4][2:4].set_color(YEL); r[4][5:8].set_color(YEL)
    g = VGroup(r, answer_box(r))
    return g.scale(0.75).move_to([0, 1.75, 0])


class K31_PowerEx(Shot):
    """x^2 -> x^3/3, x^5 -> x^6/6, x = x^1 -> x^2/2, 7 = 7x^0 -> 7x, each + C."""
    def body(self):
        self.title("Power Rule, Backwards", animate=False)
        self.add(rule_card())
        XL, XR, ys, Z = -3.7, 2.9, [0.3, -1.6, 0.3, -1.6], 58
        R1 = st(r"\int", "x^{2}", r"\,dx", "=", r"\frac{x^{3}}{3}", "+C", x=XL, y=ys[0], size=Z, c={0: GRN, 5: YEL})
        self.go("3:14:57.01", Write(R1[0:3]), run=0.6)
        self.go("3:14:58.71", Write(R1[3]), run=0.3)
        self.go("3:14:59.91", TransformFromCopy(R1[1], R1[4][0:2]), run=0.5)
        self.play(R1[4][1].animate.set_color(YEL), run_time=0.25)
        self.go("3:15:01.35", Create(R1[4][2]), TransformFromCopy(R1[4][1], R1[4][3]), run=0.6)
        self.go("3:15:04.27", Write(R1[5]), run=0.4)

        R2 = st(r"\int", "x^{5}", r"\,dx", "=", r"\frac{x^{6}}{6}", "+C", x=XL, y=ys[1], size=Z, c={0: GRN, 5: YEL})
        R2[4][1].set_color(YEL); R2[4][3].set_color(YEL)
        self.go("3:15:05.71", R1.animate.set_opacity(0.5), run=0.3)
        self.go("3:15:06.10", Write(R2[0:3]), run=0.6)
        self.go("3:15:07.73", Write(R2[3]), TransformFromCopy(R2[1], R2[4][0:2]), run=0.5)
        self.go("3:15:08.69", Create(R2[4][2]), Write(R2[4][3]), run=0.4)
        self.go("3:15:09.23", Write(R2[5]), run=0.4)

        R3x = st(r"\int", "x", r"\,dx", "=", x=XR, y=ys[2], size=Z, c={0: GRN})
        R3 = st(r"\int", "x^{1}", r"\,dx", "=", r"\frac{x^{2}}{2}", "+C", x=XR, y=ys[2], size=Z, c={0: GRN, 5: YEL})
        R3[1][1].set_color(YEL); R3[4][1].set_color(YEL); R3[4][3].set_color(YEL)
        self.go("3:15:10.97", R2.animate.set_opacity(0.5), run=0.3)
        self.go("3:15:11.30", Write(R3x[0:3]), run=0.6)
        self.go("3:15:13.33", *morph(R3x, R3, [(0, 0), (1, 1), (2, 2)], new=False, fade=False), run=0.5)
        self.go("3:15:14.41", Write(R3[3]), TransformFromCopy(R3[1], R3[4][0:2]), run=0.5)
        self.go("3:15:14.91", Create(R3[4][2]), Write(R3[4][3]), run=0.4)
        self.go("3:15:15.87", Write(R3[5]), run=0.4)

        R4a = st(r"\int", "7x^{0}", r"\,dx", "=", r"\frac{7x^{1}}{1}", x=XR, y=ys[3], size=Z, c={0: GRN})
        R4 = st(r"\int", "7x^{0}", r"\,dx", "=", "7x", "+C", x=XR, y=ys[3], size=Z, c={0: GRN, 5: YEL})
        R4x = M(r"\int", "7", r"\,dx", size=Z)
        R4x[0].set_color(GRN)
        R4x.shift(R4a[0].get_center() - R4x[0].get_center())
        R4a[1][2].set_color(YEL); R4[1][2].set_color(YEL); R4a[4][2].set_color(YEL); R4a[4][4].set_color(YEL)
        self.go("3:15:17.15", R3.animate.set_opacity(0.5), run=0.3)
        self.go("3:15:17.40", Write(R4x), run=0.6)
        self.go("3:15:20.39", *morph(R4x, R4a, ids(3), new=False), run=0.6)
        self.go("3:15:22.09", Write(R4a[3]), TransformFromCopy(R4a[1], R4a[4][0:3]), run=0.5)
        self.go("3:15:22.85", Create(R4a[4][3]), Write(R4a[4][4]), run=0.4)
        self.go("3:15:24.13", ReplacementTransform(R4a[4], R4[4]), run=0.5)
        self.go("3:15:24.71", Write(R4[5]), run=0.4)
        ck = st(D, "(7x)", "=", "7", eq=2, x=XR, y=-3.05, size=48, c={0: PINK, 1: PINK, 3: PINK})
        self.go("3:15:27.33", Write(ck), run=0.8)
        tk = tick_mark(s=0.45).next_to(ck, RIGHT, buff=0.25)
        self.go("3:15:28.99", Create(tk), run=0.4)


class K31_Check(Shot):
    """Check by differentiating: d/dx (x^3/3) = 3x^2/3 = x^2, back where we started."""
    def body(self):
        self.title("Check by Differentiating", "3:15:30.40")
        L = st(r"\int", "x^{2}", r"\,dx", "=", r"\frac{x^{3}}{3}", "+C", x=0, y=1.5, size=76, c={0: GRN, 1: BLUE, 5: YEL})
        self.go("3:15:31.00", FadeIn(L), run=0.5)
        a = CurvedArrow(L[4].get_bottom() + DOWN * 0.12, L[1].get_bottom() + DOWN * 0.18, angle=-PI / 2.6,
                        color=PINK, stroke_width=4, tip_length=0.2)
        dl = M(D, size=48, color=PINK).next_to(a, DOWN, buff=0.08)
        self.go("3:15:32.01", Create(a), FadeIn(dl), run=0.7)
        self.go("3:15:34.03", Circumscribe(L[1], color=PINK, buff=0.1), run=0.8)
        K = st(D, r"\frac{x^{3}}{3}", "=", r"\frac{3x^{2}}{3}", "=", "x^{2}", eq=2, x=-0.9, y=-1.95, size=72, c={0: PINK})
        K[5].set_color(BLUE)
        self.go("3:15:36.67", Write(K[0]), run=0.4)
        self.go("3:15:37.31", Write(K[1]), run=0.5)
        self.go("3:15:38.53", Write(K[2:4]), run=0.7)
        xs = VGroup(strike(K[3][0], width=5), strike(K[3][4], width=5))
        self.go("3:15:39.75", Create(xs), run=0.4)
        self.go("3:15:40.67", Write(K[4:]), run=0.5)
        tk = tick_mark(s=0.55).next_to(K, RIGHT, buff=0.4)
        self.go("3:15:42.05", Create(tk), Circumscribe(K[5], color=GRN, buff=0.1), run=0.6)


class K31_OneOverX(Shot):
    """n = -1 would divide by 0; x^{-1} = 1/x; ln x has derivative 1/x, so the integral is ln|x| + C."""
    def body(self):
        self.title("One Exception", "3:15:43.10")
        n1 = M("n", "=", "-1", size=80, color=YEL).move_to([0, 1.5, 0])
        self.go("3:15:45.89", Write(n1[0]), run=0.3)
        self.go("3:15:46.83", Write(n1[1:]), run=0.4)
        B = st(r"\int", "x^{-1}", r"\,dx", "=", r"\frac{x^{0}}{0}", x=-0.4, y=0.0, size=72, c={0: GRN})
        B[4][3].set_color(RED)
        self.go("3:15:48.05", Write(B[0:4]), run=0.6)
        self.play(Write(B[4][0:2]), run_time=0.3)
        self.go("3:15:49.07", Create(B[4][2]), Write(B[4][3]), run=0.4)
        bx = cross_mark(s=0.32).next_to(B, RIGHT, buff=0.5)
        dz = H("divide by 0", 38, RED).next_to(bx, RIGHT, buff=0.25)
        self.go("3:15:49.73", Create(bx), FadeIn(dz, shift=LEFT * 0.1), run=0.5)
        R = st("x^{-1}", "=", r"\frac{1}{x}", eq=1, x=0, y=-1.75, size=72)
        self.go("3:15:50.87", Write(R[0]), run=0.4)
        self.go("3:15:52.11", Write(R[1:]), run=0.6)

        self.wipe("3:15:53.73")
        L1 = st(D, r"\ln x", "=", r"\frac{1}{x}", eq=2, x=0, y=1.25, size=72, c={0: PINK, 1: BLUE, 3: PINK})
        self.go("3:15:55.51", Write(L1[0]), run=0.4)
        self.go("3:15:56.31", Write(L1[2:]), run=0.5)
        self.go("3:15:57.57", Write(L1[1]), run=0.5)
        L2 = st(r"\int", r"\frac{1}{x}", r"\,dx", "=", r"\ln", "x", "+C", x=0, y=-0.45, size=72, c={0: GRN, 4: BLUE, 5: BLUE, 6: YEL})
        L3 = st(r"\int", r"\frac{1}{x}", r"\,dx", "=", r"\ln", "|x|", "+C", x=0, y=-0.45, size=72, c={0: GRN, 4: BLUE, 5: BLUE, 6: YEL})
        L3[5][0].set_color(YEL); L3[5][2].set_color(YEL)
        self.go("3:15:59.29", Write(L2[0]), run=0.4)
        self.go("3:15:59.83", TransformFromCopy(L1[3], L2[1]), run=0.5)
        self.play(Write(L2[2:4]), run_time=0.4)
        self.go("3:16:00.83", Write(L2[4:6]), run=0.6)
        self.go("3:16:02.11", Write(L2[6]), run=0.4)
        self.go("3:16:05.45", *morph(L2, L3, ids(7)), run=0.7)
        # the graph: why |x|
        ax = Axes(x_range=[-4, 4, 1], y_range=[-2, 1.6, 1], x_length=7.0, y_length=3.3,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, tick_size=0.05)).move_to([0, -1.85, 0])
        axl = M("x", size=36, color=DIM).next_to(ax.x_axis.get_end(), DR, buff=0.06)
        rgt = curve(ax, np.log, [np.exp(-2), 3.8])
        lft = curve(ax, lambda x: np.log(-x), [-3.8, -np.exp(-2)])
        gl = M(r"y=\ln|x|", size=46, color=BLUE).move_to([5.4, -0.9, 0])
        self.go("3:16:08.17", FadeOut(L1), L3.animate.move_to([0, 1.45, 0]), run=0.6)
        self.play(Create(ax), FadeIn(axl), run_time=0.5)
        self.play(draw(rgt, run=0.8), FadeIn(gl))
        self.go("3:16:10.83", TransformFromCopy(rgt, lft), run=0.9)
        bad = M(r"\ln(-2)", size=50, color=RED).move_to([-5.3, -0.9, 0])
        self.go("3:16:12.85", FadeIn(bad, shift=UP * 0.1), run=0.4)
        self.go("3:16:14.41", Create(strike(bad)), run=0.4)
        ok = M(r"\frac{1}{-2}", "=", "-0.5", size=48, color=ORG).move_to([-5.3, -2.3, 0])
        self.go("3:16:15.83", Write(ok), run=0.7)
        self.go("3:16:18.49", Circumscribe(L3[5], color=YEL, buff=0.1), run=0.8)
        self.go("3:16:20.61", Create(answer_box(L3)), run=0.6)


def table(rows, X, ys, size):
    return [st(*parts, x=X, y=y, size=size, c={0: GRN, len(parts) - 1: YEL}) for parts, y in zip(rows, ys)]


def write_row(scene, r, t0, t1, t2):
    """Left side on t0, '=' and the answer on t1, + C on t2."""
    scene.go(t0, Write(r[0:3]), run=0.6)
    scene.go(t1, Write(r[3:-1]), run=0.6)
    scene.go(t2, Write(r[-1]), run=0.35)


class K31_TableA(Shot):
    """e^x, cos -> sin, sin -> -cos (watch the sign), each with its derivative reason."""
    def body(self):
        self.title("Derivatives in Reverse", "3:16:22.70")
        X, ys = -1.7, [1.5, 0.0, -1.5]
        r1, r2, r3 = table([(r"\int", "e^{x}", r"\,dx", "=", "e^{x}", "+C"),
                            (r"\int", r"\cos x", r"\,dx", "=", r"\sin x", "+C"),
                            (r"\int", r"\sin x", r"\,dx", "=", "-", r"\cos x", "+C")], X, ys, 66)
        write_row(self, r1, "3:16:26.99", "3:16:28.35", "3:16:29.33")
        write_row(self, r2, "3:16:30.67", "3:16:32.09", "3:16:32.87")
        n2 = st(D, r"\sin x", "=", r"\cos x", eq=2, x=4.3, y=ys[1], size=48, c={0: PINK, 1: PINK, 2: PINK, 3: PINK})
        self.go("3:16:34.45", FadeIn(n2, shift=LEFT * 0.1), run=0.6)
        self.go("3:16:36.73", n2.animate.set_opacity(0.35), r1.animate.set_opacity(0.5), run=0.3)
        write_row(self, r3, "3:16:37.10", "3:16:38.37", "3:16:39.93")
        n3 = st(D, r"\cos x", "=", r"-\sin x", eq=2, x=4.3, y=ys[2], size=48, c={0: PINK, 1: PINK, 2: PINK, 3: PINK})
        self.go("3:16:41.57", FadeIn(n3, shift=LEFT * 0.1), run=0.6)
        self.go("3:16:46.13", Indicate(r3[4], color=YEL, scale_factor=1.5), run=0.6)
        self.go("3:16:47.87", Create(ring(r3[4], RED, 1.6)), run=0.5)


class K31_TableB(Shot):
    """sec^2, sec tan, arctan, arcsin: the derivative list read right to left. Then constants out, term by term."""
    def body(self):
        self.title("The Rest of the List", "3:16:51.00")
        X, ys = -0.6, [1.8, 0.45, -0.95, -2.5]
        rows = table([(r"\int", r"\sec^2 x", r"\,dx", "=", r"\tan x", "+C"),
                      (r"\int", r"\sec x\tan x", r"\,dx", "=", r"\sec x", "+C"),
                      (r"\int", r"\frac{1}{1+x^2}", r"\,dx", "=", r"\arctan x", "+C"),
                      (r"\int", r"\frac{1}{\sqrt{1-x^2}}", r"\,dx", "=", r"\arcsin x", "+C")], X, ys, 54)
        write_row(self, rows[0], "3:16:51.55", "3:16:52.85", "3:16:54.01")
        write_row(self, rows[1], "3:16:55.57", "3:16:57.59", "3:16:58.63")
        write_row(self, rows[2], "3:17:00.13", "3:17:02.25", "3:17:03.61")
        write_row(self, rows[3], "3:17:05.15", "3:17:08.29", "3:17:09.47")
        rhs = VGroup(*[r[4] for r in rows])
        lhs = VGroup(*[r[1] for r in rows])
        self.go("3:17:13.45", Indicate(rhs, color=BLUE, scale_factor=1.06), run=0.8)
        ra = arrow([3.0, -3.3], [-3.0, -3.3], PINK)
        dl = M(D, size=48, color=PINK).next_to(ra, RIGHT, buff=0.2)
        self.go("3:17:15.07", GrowArrow(ra), FadeIn(dl), Indicate(lhs, color=PINK, scale_factor=1.06), run=0.8)
        # linearity
        self.wipe("3:17:16.97")
        K = st(r"\int", "k", r"\,f(x)\,dx", "=", "k", r"\int f(x)\,dx", x=0, y=0.9, size=68, c={0: GRN, 1: ORG, 4: ORG})
        self.go("3:17:17.59", Write(K[0:4]), run=0.7)
        self.go("3:17:18.65", TransformFromCopy(K[1], K[4], path_arc=-ARC), Write(K[5]), run=0.8)
        P = st(r"\int", r"(f\pm g)\,dx", "=", r"\int f\,dx", r"\pm", r"\int g\,dx", eq=2, x=0, y=-0.9, size=68, c={0: GRN})
        self.go("3:17:20.75", Write(P[0:3]), run=0.6)
        self.go("3:17:21.47", Write(P[3:]), run=0.7)
        self.go("3:17:22.41", Indicate(P[4], color=YEL, scale_factor=1.4), run=0.6)


class K31_Example1(Shot):
    """The integral of 3x^2 + 4x - 5 term by term: x^3 + 2x^2 - 5x + C, one C for all."""
    def body(self):
        self.title("Term by Term", "3:17:25.40")
        Q = M(r"\int", "(", "3x^2", "+", "4x", "-", "5", ")", r"\,dx", size=70).move_to([0, 1.65, 0])
        Q[0].set_color(GRN)
        self.go("3:17:25.95", Write(Q[0:2]), run=0.4)
        self.go("3:17:26.40", Write(Q[2]), run=0.5)
        self.go("3:17:27.05", Write(Q[3:5]), run=0.5)
        self.go("3:17:28.25", Write(Q[5:7]), run=0.4)
        self.play(Write(Q[7:]), run_time=0.3)
        uls = VGroup(under(Q[2]), under(Q[4]), under(Q[5:7]))
        self.go("3:17:29.63", LaggedStart(*[Create(u) for u in uls], lag_ratio=0.3), run=0.8)
        X, Z = -2.4, 54
        Ra = st("3x^2", r"\to", "3", r"\cdot", r"\frac{x^{3}}{3}", "=", "x^{3}", eq=1, x=X, y=0.3, size=Z)
        Rb = st("4x", r"\to", "4", r"\cdot", r"\frac{x^{2}}{2}", "=", "2x^{2}", eq=1, x=X, y=-1.1, size=Z)
        Rc = st("-5", r"\to", "-5x", "+C", eq=1, x=X, y=-2.25, size=Z, c={3: YEL})
        for R in (Ra, Rb, Rc):
            R[1].set_color(DIM)
        self.go("3:17:30.97", TransformFromCopy(Q[2], Ra[0]), run=0.5)
        self.go("3:17:31.73", Write(Ra[1]), run=0.3)
        self.go("3:17:32.21", Write(Ra[2:4]), run=0.4)
        self.go("3:17:32.87", Write(Ra[4]), run=0.6)
        xs = VGroup(strike(Ra[2], width=5), strike(Ra[4][3], width=5))
        self.go("3:17:34.49", Create(xs), run=0.3)
        self.go("3:17:34.81", Write(Ra[5:]), run=0.4)
        self.go("3:17:36.11", TransformFromCopy(Q[4], Rb[0]), run=0.5)
        self.go("3:17:36.71", Write(Rb[1]), run=0.3)
        self.go("3:17:37.21", Write(Rb[2:4]), run=0.4)
        self.go("3:17:37.91", Write(Rb[4]), run=0.6)
        self.go("3:17:39.55", Write(Rb[5:]), run=0.5)
        self.go("3:17:41.09", TransformFromCopy(Q[5:7], Rc[0]), run=0.5)
        self.go("3:17:41.91", Write(Rc[1]), run=0.3)
        self.go("3:17:42.45", Write(Rc[2]), run=0.4)
        self.go("3:17:43.57", Write(Rc[3]), run=0.4)
        F = M("x^{3}", "+", "2x^{2}", "-", "5x", "+C", size=66, color=GRN).move_to([0, -3.25, 0])
        F[5].set_color(YEL)
        self.go("3:17:45.37", TransformFromCopy(Ra[6], F[0]), run=0.5)
        self.go("3:17:46.07", Write(F[1]), TransformFromCopy(Rb[6], F[2]), run=0.5)
        self.go("3:17:47.39", Write(F[3]), TransformFromCopy(Rc[2], F[4]), run=0.5)
        self.go("3:17:48.63", TransformFromCopy(Rc[3], F[5]), run=0.4)
        fb = answer_box(F)
        self.go("3:17:49.10", Create(fb), run=0.5)
        self.go("3:17:50.61", Circumscribe(F[5], color=YEL, buff=0.1), run=0.8)
        self.go("3:17:52.03", FadeOut(VGroup(Ra, Rb, Rc, xs)), run=0.5)
        Cs = M("C_1", "+", "C_2", "+", "C_3", "=", "C", size=76, color=YEL).move_to([0, -0.6, 0])
        self.go("3:17:54.59", Write(Cs[0:5]), run=0.9)
        self.go("3:17:56.81", Write(Cs[5:]), run=0.5)
        self.play(Circumscribe(Cs[6], color=YEL, buff=0.1), run_time=0.6)


def root_q():
    Q = M(r"\int", "(", r"\sqrt{x}", "+", r"\frac{2}{x^{3}}", ")", r"\,dx", size=60).move_to([0, 1.65, 0])
    Q[0].set_color(GRN)
    return Q


def root_w():
    W = M(r"\int", "(", "x^{1/2}", "+", "2x^{-3}", ")", r"\,dx", size=60).move_to([0, -0.05, 0])
    W[0].set_color(GRN); W[2].set_color(ORG); W[4].set_color(ORG)
    return W


def root_t1():
    Tb = st("x^{1/2}", r"\to", r"\frac{x^{3/2}}{3/2}", "=", r"\frac{2}{3}", "x^{3/2}", eq=1, x=-2.6, y=-1.55, size=62)
    Tb[0].set_color(ORG); Tb[1].set_color(DIM)
    Tb[2][1:4].set_color(YEL); Tb[2][5:8].set_color(YEL); Tb[4].set_color(GRN); Tb[5].set_color(GRN)
    return Tb


class K31_Root(Shot):
    """The integral of sqrt x + 2/x^3: rewrite as powers, then x^{1/2} -> x^{3/2} / (3/2) = 2/3 x^{3/2}."""
    def body(self):
        self.title("Rewrite as Powers", "3:17:58.70")
        Q, W, Tb = root_q(), root_w(), root_t1()
        self.go("3:17:59.10", Write(Q[0:2]), run=0.4)
        self.go("3:17:59.69", Write(Q[2]), run=0.4)
        self.go("3:18:00.27", Write(Q[3]), run=0.3)
        self.go("3:18:00.60", Write(Q[4]), run=0.6)
        self.play(Write(Q[5:]), run_time=0.3)
        self.go("3:18:02.91", Circumscribe(Q[2:5], color=YEL, buff=0.12), run=0.9)
        self.go("3:18:05.27", TransformFromCopy(Q[0:2], W[0:2]), TransformFromCopy(Q[2], W[2]), run=0.8)
        self.go("3:18:06.81", Write(W[3]), run=0.3)
        self.go("3:18:07.35", TransformFromCopy(Q[4], W[4]), TransformFromCopy(Q[5:], W[5:]), run=0.8)
        Ta = st("x^{1/2}", r"\to", "x^{3/2}", eq=1, x=-2.6, y=-1.55, size=62)
        Ta[0].set_color(ORG); Ta[1].set_color(DIM)
        self.go("3:18:09.09", TransformFromCopy(W[2], Ta[0]), run=0.6)
        self.go("3:18:10.57", Write(Ta[1]), run=0.3)
        self.go("3:18:11.39", Write(Ta[2]), run=0.5)
        self.play(Ta[2][1:].animate.set_color(YEL), run_time=0.3)
        self.remove(Ta[0], Ta[1]); self.add(Tb[0], Tb[1])
        self.go("3:18:12.51", ReplacementTransform(Ta[2], Tb[2][0:4]), Create(Tb[2][4]), Write(Tb[2][5:8]), run=0.8)
        self.go("3:18:14.61", Write(Tb[3]), run=0.3)
        self.go("3:18:15.23", Write(Tb[4]), run=0.5)
        self.go("3:18:17.25", Write(Tb[5]), run=0.6)
        self.go("3:18:18.10", Circumscribe(Tb[4:], color=GRN, buff=0.12), run=0.8)


class K31_Root2(Shot):
    """2x^{-3} -> 2x^{-2} / (-2) = -x^{-2}; the answer two ways; ring the term to check."""
    def body(self):
        self.title("Rewrite as Powers", animate=False)
        Q, W, Tb = root_q(), root_w(), root_t1()
        self.add(Q, W, Tb)
        X = -2.6
        Ua = st("2x^{-3}", r"\to", "2x^{-2}", eq=1, x=X, y=-3.15, size=62)
        Ub = st("2x^{-3}", r"\to", r"\frac{2x^{-2}}{-2}", "=", "-x^{-2}", eq=1, x=X, y=-3.15, size=62)
        for U in (Ua, Ub):
            U[0].set_color(ORG); U[1].set_color(DIM)
        Ub[2][2:4].set_color(YEL); Ub[2][5:7].set_color(YEL); Ub[4].set_color(GRN)
        self.go("3:18:19.30", Tb.animate.set_opacity(0.5), TransformFromCopy(W[4], Ua[0]), run=0.6)
        self.go("3:18:21.45", Write(Ua[1]), run=0.3)
        self.go("3:18:22.41", Write(Ua[2]), run=0.5)
        self.play(Ua[2][2:].animate.set_color(YEL), run_time=0.3)
        self.remove(Ua[0], Ua[1]); self.add(Ub[0], Ub[1])
        self.go("3:18:23.75", ReplacementTransform(Ua[2], Ub[2][0:4]), Create(Ub[2][4]), Write(Ub[2][5:7]), run=0.8)
        nt = M(r"\frac{2}{-2}", "=", "-1", size=50, color=ORG).move_to([3.9, -3.15, 0])
        self.go("3:18:25.69", Write(nt), run=0.8)
        self.go("3:18:28.69", Write(Ub[3:]), run=0.6)
        # the answer, two ways
        self.go("3:18:30.83", FadeOut(VGroup(Q, W, Tb, *Ub, nt)), run=0.5)
        A1 = M(r"\frac{2}{3}x^{3/2}", "-", "x^{-2}", "+C", size=80, color=GRN).move_to([0, 0.95, 0])
        A2 = M(r"\frac{2}{3}x^{3/2}", "-", r"\frac{1}{x^{2}}", "+C", size=80, color=GRN).move_to([0, -1.55, 0])
        A1[3].set_color(YEL); A2[3].set_color(YEL)
        self.go("3:18:32.17", Write(A1[0]), run=0.7)
        self.go("3:18:34.13", Write(A1[1:3]), run=0.6)
        self.go("3:18:36.39", Write(A1[3]), run=0.4)
        orr = H("or", 44, DIM).move_to([0, -0.3, 0])
        self.go("3:18:38.09", FadeIn(orr), run=0.3)
        self.go("3:18:38.41", Write(A2[0]), run=0.7)
        self.go("3:18:40.81", Write(A2[1:3]), run=0.7)
        self.go("3:18:42.91", Write(A2[3]), run=0.4)
        bx = answer_box(VGroup(A1, A2), GRN)
        self.go("3:18:43.53", Create(bx), run=0.6)
        rg = SurroundingRectangle(A1[1:3], color=PINK, buff=0.12, stroke_width=4, corner_radius=0.1)
        self.go("3:18:45.21", Create(rg), run=0.5)
        lab = M(D, size=50, color=PINK).move_to([bx.get_right()[0] + 1.1, A1.get_top()[1] + 0.25, 0])
        ar = CurvedArrow(lab.get_left() + LEFT * 0.1, rg.get_top() + UP * 0.08, angle=0.7, color=PINK, stroke_width=3, tip_length=0.16)
        self.go("3:18:46.05", FadeIn(lab), Create(ar), run=0.5)
