"""Builder 40: the end of the final exam (Q11 continued .. Q16), the scoring guide, the course recap, calculus today,
what comes next and the closing board. Question boards copy builder 39's look exactly (helpers copied from
s39_final_exam.py): YEL "Question N" pill, DIM "Chapter K" tag on the spoken word, pause icon, rows on "=".
K40_Q11 opens on builder 39's END SEAM board (added statically)."""
from common import *


def lim(a):
    return r"\lim_{x \to " + a + "}"


def frow(pre, num, den, f1=None, size=64):
    """M(*pre, num over den); tags .num .bar .den on the fraction's glyphs."""
    m = M(*pre, r"\frac{" + num + "}{" + den + "}", size=size)
    fr = m[-1]
    nn = len(M(num)[0])
    m.num, m.bar, m.den = fr[:nn], fr[nn], fr[nn + 1:]
    return m


def at_eq(m, k, eqx, y):
    """Put part k (the '=') of m at (eqx, y)."""
    return m.shift([eqx - m[k].get_center()[0], y - m[k].get_center()[1], 0])


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


def pause_icon(r=0.34, color=YEL):
    return VGroup(Circle(radius=r, color=CHALK, stroke_width=4),
                  *[Line([x, -0.33 * r / 0.7, 0], [x, 0.33 * r / 0.7, 0], color=color, stroke_width=16 * r / 0.7 + 2)
                    for x in (-0.19 * r / 0.7, 0.19 * r / 0.7)])


def qhead(sc, n, t):
    p = pill(f"Question {n}", YEL, size=46).to_edge(UP, buff=0.22)
    sc.go(t, FadeIn(p, shift=DOWN * 0.15), run=0.5)
    sc.head = VGroup(p)


def chap(sc, s, t):
    tag = H(s, 36, DIM).next_to(sc.head[0], RIGHT, buff=0.4)
    sc.go(t, FadeIn(tag, shift=LEFT * 0.1), run=0.5)
    sc.head.add(tag)


def pause_at(sc, target, t, buff=0.6):
    ic = pause_icon().next_to(target, RIGHT, buff=buff)
    sc.go(t, FadeIn(ic, scale=0.8), run=0.4)
    return ic


def end(sc, t):
    sc.at(t)
    sc.clear_all(run=0.35)


def T4(s):
    return "4:" + s


# ---------------------------------------------------------------- questions 11-12: optimization, L'Hopital

class K40_Q11(Shot):
    def body(self):
        # builder 39's end board, exactly as it was left
        p = pill("Question 11", YEL, size=46).to_edge(UP, buff=0.22)
        self.head = VGroup(p)
        rect = Rectangle(width=4.0, height=2.4, color=CHALK, stroke_width=5, fill_color=GRN, fill_opacity=0.15).move_to([3.9, -0.6, 0])
        q0 = M(r"\text{Area}", "=", r"100\ \text{m}^2", size=58).move_to([-3.4, 1.85, 0])
        q1 = M(r"\text{smallest perimeter?}", size=54, color=YEL).move_to([-3.4, 0.95, 0])
        xl = M("x", size=50, color=ORG).next_to(rect, DOWN, buff=0.2)
        yl = M("y", size=50, color=ORG).next_to(rect, RIGHT, buff=0.2)
        eqx, sz = -3.6, 56
        r1 = at_eq(M("xy", "=", "100", size=sz), 1, eqx, -0.25)
        r2 = at_eq(M("y", "=", r"\frac{100}{x}", size=sz), 1, eqx, -1.4)
        r3 = at_eq(M("P", "=", "2x+2y", size=sz), 1, eqx, -2.75)
        self.add(p, rect, q0, q1, xl, yl, r1, r2, r3)

        # substitute y = 100/x
        rA = at_eq(M("P", "=", "2x", "+", r"\frac{200}{x}", size=sz), 1, eqx, -2.75)
        self.go(T4("11:33.30"), Circumscribe(r2[2], color=ORG, buff=0.08), r3[2][3:].animate.set_color(ORG), run=0.8)
        self.go(T4("11:34.40"), ReplacementTransform(r3[0:2], rA[0:2]), ReplacementTransform(r3[2][0:3], VGroup(rA[2], rA[3])),
                FadeOut(r3[2][3:]), TransformFromCopy(r2[2], rA[4]), run=0.9)
        self.go(T4("11:35.55"), FadeOut(r1), FadeOut(r2), rA.animate.shift(UP * 2.8), run=0.6)

        rD = at_eq(M("P'", "=", r"2-\frac{200}{x^2}", "=", "0", size=sz), 1, eqx, -1.45)
        rD[0].set_color(PINK)
        self.go(T4("11:36.29"), Write(rD[0:2]), run=0.5)
        self.go(T4("11:37.03"), Write(rD[2]), run=1.2)
        self.go(T4("11:39.97"), Write(rD[3:]), run=0.5)
        rE = at_eq(M("x^2", "=", "100", size=sz), 1, eqx, -2.5)
        self.go(T4("11:41.23"), Write(rE), run=0.7)
        rF = at_eq(M("x", "=", "10", size=sz), 1, eqx, -3.3)
        rG = M("y", "=", "10", size=sz).next_to(rF, RIGHT, buff=1.0)
        rF[2].set_color(ORG); rG[2].set_color(ORG)
        self.go(T4("11:42.87"), Write(rF), run=0.5)
        self.go(T4("11:44.39"), Write(rG), run=0.5)

        # the rectangle becomes the 10 by 10 square
        sq = Square(3.0, color=CHALK, stroke_width=5, fill_color=GRN, fill_opacity=0.15).move_to([3.9, -0.6, 0])
        xl2 = M(r"10\ \text{m}", size=46, color=ORG).next_to(sq, DOWN, buff=0.2)
        yl2 = M(r"10\ \text{m}", size=46, color=ORG).next_to(sq, RIGHT, buff=0.2)
        self.go(T4("11:45.99"), Transform(rect, sq), ReplacementTransform(xl, xl2), ReplacementTransform(yl, yl2),
                Create(box(VGroup(rF, rG), GRN, buff=0.12, width=4)), run=0.9)
        edge = sq.copy().set_fill(opacity=0).set_stroke(YEL, 6)
        self.go(T4("11:47.25"), Create(edge), run=0.9)
        pa = M("P", "=", r"40\ \text{m}", size=50).move_to(sq)
        self.go(T4("11:48.51"), FadeOut(edge), Write(pa), run=0.6)
        self.play(Create(answer_box(pa)), run_time=0.35)
        self.go(T4("11:49.39"), Circumscribe(rect, color=YEL, buff=0.12), run=0.9)
        chap(self, "Chapter 10", T4("11:50.63"))
        end(self, T4("11:51.40"))


class K40_Q12(Shot):
    def body(self):
        qhead(self, 12, T4("11:51.81"))
        eqx = -3.0
        Y = [1.45, -0.2, -1.75]
        L1 = frow(["=", lim("0")], "2e^{2x}", "1")
        at_eq(L1, 0, eqx, Y[1])
        L1.num.set_color(PINK); L1.den.set_color(PINK)
        L0 = frow([lim("0")], "e^{2x}-1", "x")
        L0.shift([L1[1].get_left()[0] - L0.get_left()[0], Y[0] - L0.bar.get_y(), 0])
        L2 = at_eq(M("=", "2e^{0}", "=", "2", size=64), 0, eqx, Y[2])

        self.go(T4("11:53.79"), Write(L0[0]), run=0.8)
        self.go(T4("11:55.71"), Write(L0.num), run=1.0)
        self.go(T4("11:57.73"), Create(L0.bar), Write(L0.den), run=0.5)
        ic = pause_at(self, L0, T4("11:58.35"), buff=0.8)
        cx = (L0.get_right()[0] + 6.6) / 2
        lab = TX(r"plug in $x=0$", 40, DIM).move_to([cx, Y[0] + 0.7, 0])
        pl = M(r"\frac{1-1}{0}", "=", r"\frac{0}{0}", size=56).move_to([cx, Y[0] - 0.25, 0])
        pl[2].set_color(YEL)
        self.go(T4("11:59.03"), FadeOut(ic), FadeIn(lab, shift=UP * 0.1), Write(pl[0]), run=0.5)
        self.go(T4("11:59.80"), Write(pl[1:]), run=0.4)
        lh = H("L'Hôpital", 40, PINK).move_to([cx, Y[1], 0])
        self.go(T4("12:00.87"), FadeOut(lab), FadeOut(pl), FadeIn(lh, shift=LEFT * 0.1), Write(L1[0:2]), run=0.6)
        self.go(T4("12:02.13"), TransformFromCopy(L0.num, L1.num), run=0.8)
        self.go(T4("12:03.77"), Create(L1.bar), TransformFromCopy(L0.den, L1.den), run=0.5)
        self.go(T4("12:04.83"), Write(L2[0:2]), run=0.6)
        self.go(T4("12:05.69"), Write(L2[2:]), run=0.35)
        self.play(Create(answer_box(L2[3])), run_time=0.35)
        chap(self, "Chapter 10", T4("12:06.59"))
        end(self, T4("12:07.30"))


# ---------------------------------------------------------------- questions 13-16: integrals

class K40_Q13(Shot):
    def body(self):
        qhead(self, 13, T4("12:07.69"))
        r0 = M(r"\int", "(", "4x^3", "-6x", "+2", ")", r"\,dx", size=64).move_to([-2.4, 1.35, 0])
        self.go(T4("12:09.47"), Write(r0[0:2]), run=0.5)
        self.go(T4("12:10.07"), Write(r0[2]), run=0.5)
        self.go(T4("12:11.09"), Write(r0[3]), run=0.5)
        self.go(T4("12:12.21"), Write(r0[4:]), run=0.4)
        ic = pause_at(self, r0, T4("12:12.61"), buff=0.5)
        rule = M("x^n", r"\to", r"\frac{x^{n+1}}{n+1}", size=50, color=GRN).move_to([4.3, 1.35, 0])
        rule[0].set_color(CHALK)
        fr = panel(rule, GRN, buff=0.22, width=3)
        r1 = at_eq(M("=", "x^4", "-3x^2", "+2x", "+C", size=64), 0, r0.get_left()[0] + 0.25, -0.35)
        self.go(T4("12:13.27"), Write(r1[0]), TransformFromCopy(r0[2], r1[1]), Create(fr), Write(rule), run=0.7)
        self.go(T4("12:14.77"), FadeOut(ic), TransformFromCopy(r0[3], r1[2]), run=0.6)
        self.go(T4("12:15.71"), TransformFromCopy(r0[4], r1[3]), run=0.6)
        r1[4].set_color(YEL)
        nt = note("don't forget", r1[4], DOWN + RIGHT * 0.6, color=YEL, size=36, dist=0.55, angle=0.5)
        self.go(T4("12:18.55"), Write(r1[4]), run=0.5)
        self.play(FadeIn(nt), run_time=0.4)
        self.go(T4("12:19.50"), Create(answer_box(r1[1:])), run=0.4)
        chap(self, "Chapter 11", T4("12:19.99"))
        end(self, T4("12:20.90"))


class K40_Q14(Shot):
    def body(self):
        qhead(self, 14, T4("12:21.27"))
        eqx, sz = -4.3, 60
        r1 = at_eq(M("=", r"\Big[", "x^2+x", r"\Big]_0^3", size=sz), 0, eqx, -0.15)
        r0 = M(r"\int_0^3", "(2x+1)", r"\,dx", size=64)
        r0.shift([r1[1].get_left()[0] - r0.get_left()[0], 1.6 - r0.get_y(), 0])
        f = lambda x: 2 * x + 1
        ax = axes((0, 3.5, 1), (0, 8, 2), x_length=3.8, y_length=4.2, center=(4.3, -0.75, 0))
        line = curve(ax, f, [0, 3.3])
        sh = area(ax, f, 0, 3)
        ll = M("y=2x+1", size=38, color=BLUE).next_to(ax.c2p(3.3, f(3.3)), LEFT, buff=0.25)

        self.go(T4("12:23.47"), Write(r0[0]), run=0.9)
        self.go(T4("12:25.61"), Write(r0[1]), Create(ax), FadeIn(ax.labels), draw(line, run=0.8, color=BLUE), run=0.8)
        self.go(T4("12:26.45"), Write(r0[2]), FadeIn(sh), FadeIn(ll), run=0.35)
        ic = pause_at(self, r0, T4("12:26.80"), buff=0.5)
        self.go(T4("12:27.67"), Write(VGroup(r1[0], r1[1], r1[3])), run=0.6)
        self.go(T4("12:29.11"), FadeOut(ic), Write(r1[2]), run=0.8)

        r2 = at_eq(M("=", "(9+3)", "-", "0", "=", "12", size=sz), 0, eqx, -1.6)
        r2[1].set_color(ORG); r2[3].set_color(ORG)
        self.go(T4("12:31.13"), Circumscribe(r1[3][-2], color=ORG, buff=0.06), run=0.6)
        self.go(T4("12:32.09"), Write(r2[0:2]), run=0.7)
        br = Brace(r2[1], DOWN, buff=0.08, color=DIM)
        bl = M("12", size=40, color=DIM).next_to(br, DOWN, buff=0.08)
        self.go(T4("12:33.45"), Create(br), FadeIn(bl), run=0.5)
        self.go(T4("12:34.61"), Write(r2[2:4]), run=0.5)
        self.go(T4("12:36.09"), Write(r2[4:]), run=0.4)
        a12 = M("12", size=52).move_to(ax.c2p(1.6, 2.2))
        self.play(Create(answer_box(r2[5])), FadeIn(a12), run_time=0.4)
        chap(self, "Chapter 12", T4("12:37.21"))
        end(self, T4("12:38.40"))


class K40_Q15(Shot):
    def body(self):
        qhead(self, 15, T4("12:38.79"))
        r0 = M(r"\int", "x", r"\cos(", "x^2", ")", r"\,dx", size=66).move_to([-3.3, 1.55, 0])
        self.go(T4("12:40.89"), Write(r0[0]), run=0.4)
        self.go(T4("12:41.45"), Write(r0[1]), run=0.3)
        self.go(T4("12:41.81"), Write(r0[2:5]), run=0.8)
        self.go(T4("12:42.71"), Write(r0[5]), run=0.35)
        ic = pause_at(self, r0, T4("12:43.10"), buff=0.5)

        ex = 3.6
        sub = H("substitution", 40, YEL).move_to([ex, 1.65, 0])
        self.go(T4("12:43.75"), FadeOut(ic), FadeIn(sub, shift=LEFT * 0.1), run=0.5)
        u1 = at_eq(M("u", "=", "x^2", size=54), 1, ex, 0.65)
        u2 = at_eq(M("du", "=", r"2x\,dx", size=54), 1, ex, -0.4)
        u3 = at_eq(M(r"x\,dx", "=", r"\tfrac12\,du", size=54), 1, ex, -1.5)
        u1[0].set_color(BLUE); u3[0].set_color(ORG)
        ul = under(r0[3], BLUE)
        self.go(T4("12:45.37"), Write(u1[0:2]), Create(ul), r0[3].animate.set_color(BLUE), run=0.5)
        self.go(T4("12:46.17"), TransformFromCopy(r0[3], u1[2]), run=0.6)
        self.go(T4("12:47.43"), Write(u2[0:2]), run=0.5)
        self.go(T4("12:48.51"), Write(u2[2]), run=0.8)
        self.go(T4("12:50.63"), FadeOut(ul), r0[1].animate.set_color(ORG), r0[5].animate.set_color(ORG),
                Write(u3[0]), run=0.5)
        self.go(T4("12:51.40"), Write(u3[1:]), run=0.8)
        self.play(Create(panel(VGroup(sub, u1, u2, u3), PURP, buff=0.3, width=3)), run_time=0.5)

        eqx, sz = -5.0, 62
        m1 = at_eq(M("=", r"\tfrac12", r"\int", r"\cos u", r"\,du", size=sz), 0, eqx, 0.0)
        m2 = at_eq(M("=", r"\tfrac12", r"\sin u", size=sz), 0, eqx, -1.3)
        m3 = at_eq(M("=", r"\tfrac12", r"\sin(x^2)", "+C", size=sz), 0, eqx, -2.6)
        self.go(T4("12:53.37"), Write(m1[0]), TransformFromCopy(u3[2][0:3], m1[1]), run=0.6)
        self.go(T4("12:54.27"), Write(m1[2]), run=0.4)
        self.go(T4("12:54.93"), Write(m1[3:]), run=0.6)
        self.go(T4("12:56.35"), Write(m2[0:2]), run=0.4)
        self.go(T4("12:56.97"), Write(m2[2]), run=0.5)
        self.go(T4("12:58.31"), Write(m3[0:2]), run=0.4)
        self.go(T4("12:59.15"), Write(m3[2]), run=0.8)
        self.go(T4("13:00.25"), Write(m3[3]), run=0.4)
        self.play(Create(answer_box(m3[1:])), run_time=0.35)
        chap(self, "Chapter 12", T4("13:01.81"))
        end(self, T4("13:02.85"))


class K40_Q16(Shot):
    def body(self):
        qhead(self, 16, T4("13:03.41"))
        ax = axes((-3, 3, 1), (-1, 6, 1), x_length=4.2, y_length=4.4, center=(4.35, -0.9, 0), nums=False)
        para = curve(ax, lambda x: x * x, [-2.45, 2.45])
        lg = curve(ax, lambda x: 4, [-2.9, 2.9], color=CHALK)
        lp = M("y=x^2", size=40, color=BLUE).next_to(ax.c2p(-2.45, 6), LEFT, buff=0.15)
        ly = M("y=4", size=40).next_to(ax.c2p(-2.9, 4), UP, buff=0.1).shift(LEFT * 0.25)
        q = TX(r"area between $y=x^2$ and $y=4$", 46).move_to([-3.0, 1.85, 0])
        self.go(T4("13:05.10"), Write(q), Create(ax), FadeIn(ax.labels), run=1.4)
        self.go(T4("13:07.17"), draw(para, run=1.0, color=BLUE), run=1.0)
        self.go(T4("13:08.10"), Write(lp), run=0.5)
        self.go(T4("13:09.99"), draw(lg, run=0.8), run=0.8)
        self.go(T4("13:10.80"), Write(ly), run=0.4)
        ic = pause_at(self, q, T4("13:11.35"), buff=0.4)

        eqx, sz = -3.6, 56
        r1 = at_eq(M("x^2", "=", "4", size=sz), 1, eqx, 0.8)
        r2 = at_eq(M("x", "=", "-2", r",\ ", "2", size=sz), 1, eqx, -0.25)
        r2[2].set_color(ORG); r2[4].set_color(ORG)
        self.go(T4("13:12.20"), FadeOut(ic), run=0.3)
        self.go(T4("13:12.93"), Write(r1), run=0.7)
        dl, dr = pt(ax, -2, 4), pt(ax, 2, 4)
        tl = M("-2", size=34, color=ORG).next_to(ax.c2p(-2, 0), DOWN, buff=0.12)
        tr = M("2", size=34, color=ORG).next_to(ax.c2p(2, 0), DOWN, buff=0.12)
        self.go(T4("13:14.91"), Write(r2[0:3]), FadeIn(dl, scale=0.5), FadeIn(tl), run=0.5)
        self.go(T4("13:15.63"), Write(r2[3:]), FadeIn(dr, scale=0.5), FadeIn(tr), run=0.5)

        # top minus bottom: a strip sweeps across
        xs = ValueTracker(-1.5)
        strip = always_redraw(lambda: Line(ax.c2p(xs.get_value(), xs.get_value() ** 2), ax.c2p(xs.get_value(), 4),
                                           color=PINK, stroke_width=6))
        sl = M("4-x^2", size=40, color=PINK).next_to(ax.c2p(-2.3, 2.3), LEFT, buff=0.3)
        self.go(T4("13:16.97"), lg.animate.set_color(YEL), ly.animate.set_color(YEL), Create(strip), run=0.5)
        self.play(xs.animate.set_value(1.5), FadeIn(sl), run_time=1.5)
        self.play(lg.animate.set_color(CHALK), ly.animate.set_color(CHALK), xs.animate.set_value(0.6), run_time=0.4)

        r3 = at_eq(M("A", "=", r"\int_{-2}^{2}", "(4-x^2)", r"\,dx", size=sz), 1, eqx, -1.55)
        r3[0].set_color(GRN)
        sh = ax.get_area(para, x_range=(-2, 2), bounded_graph=lg, color=GRN, opacity=0.35)
        self.go(T4("13:19.61"), Write(r3[0:2]), run=0.4)
        self.go(T4("13:19.95"), Write(r3[2]), run=1.0)
        self.go(T4("13:22.11"), TransformFromCopy(sl, r3[3]), FadeOut(strip), FadeOut(sl), FadeIn(sh), run=0.8)
        self.go(T4("13:23.07"), Write(r3[4]), run=0.3)

        # evaluate
        self.go(T4("13:24.17"), FadeOut(r1), FadeOut(r2), r3.animate.shift(UP * 2.3), run=0.6)
        r4 = at_eq(M("=", r"\Big[", r"4x-\frac{x^3}{3}", r"\Big]_{-2}^{2}", size=sz), 0, eqx, -0.6)
        self.go(T4("13:24.80"), Write(VGroup(r4[0], r4[1], r4[3])), run=0.5)
        self.go(T4("13:25.37"), Write(r4[2]), run=1.2)
        r5a = at_eq(M("=", r"\left(8-\tfrac83\right)", "-", r"\left(-8+\tfrac83\right)", size=sz), 0, eqx, -1.85)
        r5b = at_eq(M("=", r"\tfrac{16}{3}", "-", r"\left(-\tfrac{16}{3}\right)", size=sz), 0, eqx, -1.85)
        p2 = r5a[3].copy().next_to(r5b[2], RIGHT, buff=0.15)
        p2.shift(UP * (r5b[3].get_y() - p2.get_y()))
        self.go(T4("13:29.27"), Write(r5a[0:2]), run=0.9)
        self.go(T4("13:31.19"), ReplacementTransform(r5a[0:2], r5b[0:2]), run=0.6)
        self.go(T4("13:34.05"), Write(r5b[2]), Write(p2), run=1.0)
        self.go(T4("13:36.61"), ReplacementTransform(p2, r5b[3]), run=0.6)
        ul = under(r5b[1:])
        self.go(T4("13:38.53"), Create(ul), run=0.5)
        r6 = M("=", r"\frac{32}{3}", size=60).next_to(r5b, RIGHT, buff=0.25)
        r6.shift(UP * (r5b[0].get_y() - r6[0].get_y()))
        a = M(r"\tfrac{32}{3}", size=50).move_to(ax.c2p(0, 2.9))
        self.go(T4("13:42.13"), FadeOut(ul), Write(r6), run=0.5)
        self.play(Create(answer_box(r6[1])), FadeIn(a), run_time=0.4)
        chap(self, "Chapter 13", T4("13:43.83"))
        end(self, T4("13:44.95"))


# ---------------------------------------------------------------- scoring guide

def score_x(s):
    return -5.6 + s * 11.2 / 17


class K40_Score(Shot):
    def body(self):
        self.title("How Did You Do?", T4("13:45.89"))
        y = 0.45
        base = Line([-5.7, y, 0], [5.7, y, 0], color=FAINT, stroke_width=3)
        segs, caps = [], []
        for a, b, c, lab in ((0, 8, ORG, "0 to 7"), (8, 13, BLUE, "8 to 12"), (13, 17, GRN, "13 to 16")):
            r = Rectangle(width=score_x(b) - score_x(a) - 0.08, height=0.75, stroke_color=c, stroke_width=4,
                          fill_color=c, fill_opacity=0.25).move_to([(score_x(a) + score_x(b)) / 2, y, 0])
            segs.append(VGroup(r, TX(lab, 38).move_to(r)))
        self.play(Create(base), run_time=0.6)

        hi = H("great shape", 38, GRN)
        hi.move_to([5.6 - hi.width / 2, -0.55, 0])
        self.go(T4("13:47.89"), FadeIn(segs[2], shift=UP * 0.1), run=0.6)
        self.go(T4("13:50.23"), Write(hi), run=0.7)
        mid = H("main ideas", 38, BLUE).move_to([segs[1].get_x(), -0.55, 0])
        mid2 = H("review a couple of chapters", 34, DIM).move_to([0.9, -1.2, 0])
        self.go(T4("13:54.31"), FadeIn(segs[1], shift=UP * 0.1), run=0.6)
        self.go(T4("13:55.85"), Write(mid), run=0.6)
        self.go(T4("13:57.63"), FadeIn(mid2, shift=UP * 0.1), run=0.6)
        lo = H("don't worry", 38, ORG).move_to([segs[0].get_x(), -0.55, 0])
        self.go(T4("14:00.21"), FadeIn(segs[0], shift=UP * 0.1), run=0.6)
        self.go(T4("14:00.95"), Write(lo), run=0.6)
        loop = CurvedArrow([5.4, y + 0.55, 0], [-5.4, y + 0.55, 0], angle=0.45, color=YEL, stroke_width=4, tip_length=0.2)
        again = H("again", 36, YEL).move_to([0, 1.95, 0])
        self.go(T4("14:03.11"), Create(loop), run=1.0)
        self.go(T4("14:05.49"), FadeIn(again, shift=DOWN * 0.1), run=0.5)
        self.wipe(T4("14:06.70"), run=0.4)

        # the plan: missed question -> rewatch the chapter -> redo the examples
        yi = 0.4
        x1 = cross_mark(s=0.4).move_to([-4.4, yi, 0])
        l1 = H("missed\nquestion", 38).next_to(x1, DOWN, buff=0.5)
        scr = RoundedRectangle(width=1.9, height=1.25, corner_radius=0.12, color=CHALK, stroke_width=4).move_to([0, yi, 0])
        play_t = Triangle(color=YEL, stroke_width=4).scale(0.3).rotate(-PI / 2).move_to(scr)
        l2 = H("rewatch\nthe chapter", 38).next_to(scr, DOWN, buff=0.3).set_y(l1.get_y())
        paper = Rectangle(width=1.2, height=1.5, color=CHALK, stroke_width=4).move_to([4.4, yi, 0])
        rows = VGroup(*[Line([-0.4, 0.4 - 0.27 * k, 0], [0.4 - 0.2 * (k % 2), 0.4 - 0.27 * k, 0], color=DIM,
                             stroke_width=3) for k in range(4)]).move_to(paper)
        tk = tick_mark(s=0.7).move_to(paper.get_corner(DR) + [0.15, 0.15, 0])
        l3 = H("redo the\nexamples", 38).next_to(paper, DOWN, buff=0.3).set_y(l1.get_y())
        a1 = Arrow([-3.0, yi, 0], [-1.3, yi, 0], color=DIM, stroke_width=4, buff=0, tip_length=0.22)
        a2 = Arrow([1.3, yi, 0], [3.0, yi, 0], color=DIM, stroke_width=4, buff=0, tip_length=0.22)
        self.go(T4("14:07.53"), Create(x1), run=0.5)
        self.go(T4("14:08.27"), Write(l1), run=0.6)
        self.go(T4("14:09.53"), Create(a1), Create(scr), FadeIn(play_t), Write(l2), run=0.7)
        self.go(T4("14:10.65"), Create(a2), Create(paper), LaggedStart(*[Create(r) for r in rows], lag_ratio=0.3), Write(l3), run=0.7)
        self.play(Create(tk), run_time=0.35)
        end(self, T4("14:12.50"))


# ---------------------------------------------------------------- course recap on a six-stop roadmap

ROAD = ["functions", "limits", "derivatives", "uses", "integrals", "FTC"]


def road(k):
    """Course roadmap along the bottom. Stops before k done (chalk), k active (yellow), after k faint."""
    g = VGroup(Line([-6.2, -3.0, 0], [6.2, -3.0, 0], color=FAINT, stroke_width=3))
    for i, w in enumerate(ROAD):
        p = [-5.5 + 2.2 * i, -3.0, 0]
        if i > k:
            d = Circle(radius=0.08, color=FAINT, stroke_width=3, fill_color=config.background_color, fill_opacity=1).move_to(p)
        else:
            d = Dot(p, radius=0.12 if i == k else 0.08, color=YEL if i == k else CHALK)
        lab = H(w, 34, YEL if i == k else (DIM if i < k else FAINT)).next_to(p, DOWN, buff=0.2)
        g.add(VGroup(d, lab))
    return g


def step_road(sc, rd, k, t):
    sc.go(t, Transform(rd, road(k)), run=0.5)


class K40_Recap1(Shot):
    def body(self):
        self.title("The Big Picture", T4("14:13.23"))
        rd = road(-1)
        self.go(T4("14:16.51"), Create(rd[0]), LaggedStart(*[FadeIn(s, shift=UP * 0.1) for s in rd[1:]], lag_ratio=0.25), run=1.6)

        # functions: a machine
        step_road(self, rd, 0, T4("14:20.79"))
        mac = RoundedRectangle(width=2.2, height=1.5, corner_radius=0.15, color=BLUE, stroke_width=5).move_to([0, 0.2, 0])
        fl = M("f", size=64, color=BLUE).move_to(mac)
        ain = Arrow([-3.6, 0.2, 0], [-1.2, 0.2, 0], color=DIM, stroke_width=4, buff=0, tip_length=0.2)
        aout = Arrow([1.2, 0.2, 0], [3.6, 0.2, 0], color=DIM, stroke_width=4, buff=0, tip_length=0.2)
        lin = H("input", 36, DIM).next_to(ain, DOWN, buff=0.3)
        lout = H("output", 36, DIM).next_to(aout, DOWN, buff=0.3)
        rule = M("f(x)=x^2", size=44, color=DIM).next_to(mac, UP, buff=0.3)
        self.go(T4("14:22.55"), Create(mac), Write(fl), Create(ain), Create(aout), FadeIn(rule), run=0.8)
        n3 = M("3", size=60, color=ORG).move_to([-4.3, 0.2, 0])
        self.go(T4("14:23.30"), FadeIn(n3), FadeIn(lin), run=0.4)
        self.play(n3.animate.move_to(mac.get_center()).set_opacity(0), run_time=0.6)
        n9 = M("9", size=60, color=ORG).move_to([4.3, 0.2, 0])
        self.go(T4("14:24.27"), FadeIn(n9, shift=RIGHT * 2.0), FadeIn(lout), run=0.8)

        # limits: heading to a hole
        self.go(T4("14:25.41"), Transform(rd, road(1)), *[FadeOut(m) for m in (mac, fl, ain, aout, lin, lout, rule, n9)], run=0.5)
        self.remove(n3)
        f = lambda x: 0.25 * x * x + 1
        ax = axes((0, 4, 1), (0, 5, 1), x_length=5.2, y_length=3.8, center=(0, 0.1, 0))
        left = curve(ax, f, [0, 1.94])
        right = curve(ax, f, [2.06, 3.8])
        hl = hole(ax, 2, 2)
        self.go(T4("14:25.90"), Create(ax), FadeIn(ax.labels), Create(left), Create(right), FadeIn(hl), run=0.8)
        d = ValueTracker(1.6)
        pl = always_redraw(lambda: pt(ax, 2 - d.get_value(), f(2 - d.get_value())))
        pr = always_redraw(lambda: pt(ax, 2 + d.get_value(), f(2 + d.get_value())))
        self.go(T4("14:26.97"), FadeIn(pl), FadeIn(pr), run=0.3)
        self.play(d.animate.set_value(0.13), run_time=2.4)
        gd = DashedLine(ax.c2p(2, 2), ax.c2p(0, 2), color=YEL, stroke_width=3, dash_length=0.08)
        two = M("2", size=40, color=YEL).next_to(ax.c2p(0, 2), LEFT, buff=0.12)
        self.go(T4("14:29.80"), Create(gd), FadeIn(two), run=0.5)

        # continuity: the hole fills
        cont = H("continuity", 40, YEL).move_to(ax.c2p(3.2, 1.0))
        self.go(T4("14:30.95"), FadeIn(cont, shift=DOWN * 0.1), run=0.5)
        full = Dot(ax.c2p(2, 2), radius=0.1, color=BLUE).set_z_index(6)
        self.go(T4("14:32.81"), d.animate.set_value(0), run=0.6)
        pl.clear_updaters(); pr.clear_updaters()
        self.play(FadeOut(pl), FadeOut(pr), FadeOut(hl), FadeIn(full, scale=0.5), run_time=0.5)
        self.wipe(T4("14:34.55"), run=0.35, keep=[rd])


class K40_Recap2(Shot):
    def body(self):
        self.title("The Big Picture", animate=False)
        rd = road(1)
        self.add(rd)

        # derivative: secant -> tangent
        step_road(self, rd, 2, T4("14:35.39"))
        f = lambda x: 0.25 * x * x + 0.5
        ax = axes((0, 4, 1), (0, 5, 1), x_length=5.2, y_length=3.8, center=(-0.6, 0.1, 0))
        gr = curve(ax, f, [0, 4])
        self.go(T4("14:35.80"), Create(ax), FadeIn(ax.labels), draw(gr, run=0.9, color=BLUE), run=0.9)
        h = ValueTracker(1.8)
        x0 = 1.5
        sec_l = always_redraw(lambda: secant(ax, f, x0, h.get_value()))
        dots = always_redraw(lambda: VGroup(pt(ax, x0, f(x0)), pt(ax, x0 + h.get_value(), f(x0 + h.get_value()))))
        self.go(T4("14:36.75"), Create(sec_l), FadeIn(dots), run=0.4)
        self.play(h.animate.set_value(0.03), run_time=2.0)
        xt = ValueTracker(x0)
        lt = live_tangent(ax, f, xt, length=2.6, readout_pos=np.array([3.4, 1.6, 0]))
        self.go(T4("14:39.41"), FadeOut(sec_l), FadeOut(dots), FadeIn(lt), run=0.4)
        self.go(T4("14:39.97"), xt.animate.set_value(3.2), run=1.4)

        # the rules
        self.wipe(T4("14:41.59"), run=0.4, keep=[rd])
        rules = [("power", ["(x^n)'", "=", "nx^{n-1}"]),
                 ("product", ["(uv)'", "=", "u'v+uv'"]),
                 ("quotient", [r"\left(\frac{u}{v}\right)'", "=", r"\frac{u'v-uv'}{v^2}"]),
                 ("chain", ["f(g(x))'", "=", r"f'(g(x))\,g'(x)"]),
                 ("implicit", ["(y^2)'", "=", "2y\\,y'"])]
        times = ["14:45.31", "14:46.53", "14:47.09", "14:48.53", "14:49.61"]
        ys = [1.85, 0.95, -0.05, -1.05, -1.9]
        prev = None
        for (name, parts), t, y in zip(rules, times, ys):
            m = at_eq(M(*parts, size=48), 1, -0.6, y)
            m[2].set_color(PINK)
            lab = H(name, 36, DIM).move_to([-5.0, y, 0])
            anims = [Write(m), FadeIn(lab, shift=RIGHT * 0.1)]
            if prev:
                anims.append(prev.animate.set_opacity(0.45))
            self.go(T4(t), *anims, run=0.6 if name != "product" else 0.5)
            prev = VGroup(m, lab)

        # using derivatives: five small drawings
        self.wipe(T4("14:51.67"), run=0.4, keep=[rd])
        step_road(self, rd, 3, T4("14:52.09"))
        xs = [-5.0, -2.5, 0, 2.5, 5.0]
        yl = -1.5
        # motion: a ball thrown up
        path = VMobject().set_points_smoothly([[xs[0] - 0.8 + 1.6 * u, -0.7 + 2.6 * u * (1 - u) * 1.0, 0] for u in np.linspace(0, 1, 15)])
        trail = DashedVMobject(path.copy().set_stroke(DIM, 3), num_dashes=14)
        ground = Line([xs[0] - 1.0, -0.75, 0], [xs[0] + 1.0, -0.75, 0], color=CHALK, stroke_width=3)
        ball = Dot(path.get_start(), radius=0.12, color=ORG)
        l1 = H("motion", 34).move_to([xs[0], yl, 0])
        self.go(T4("14:53.63"), Create(ground), Create(trail), FadeIn(ball), FadeIn(l1), run=0.5)
        self.play(MoveAlongPath(ball, path), run_time=1.0)
        # related rates: a balloon inflating
        r = ValueTracker(0.35)
        bal = always_redraw(lambda: Circle(radius=r.get_value(), color=BLUE, stroke_width=4, fill_color=BLUE,
                                           fill_opacity=0.15).move_to([xs[1], -0.75 + 0.6 + r.get_value(), 0]))
        string = Line([xs[1], -0.75, 0], [xs[1], -0.15, 0], color=DIM, stroke_width=3)
        l2 = H("rates", 34).move_to([xs[1], yl, 0])
        self.go(T4("14:55.21"), Create(string), FadeIn(bal), FadeIn(l2), run=0.4)
        self.play(r.animate.set_value(0.7), run_time=1.0)
        # estimates: tangent line hugging a curve
        c3 = VMobject(stroke_color=BLUE, stroke_width=4).set_points_smoothly(
            [[xs[2] - 0.9 + 1.8 * u, -0.6 + 1.4 * u ** 2, 0] for u in np.linspace(0, 1, 12)])
        tp = np.array([xs[2] + 0.0, -0.6 + 1.4 * 0.25, 0])
        tl = Line(tp + np.array([-0.8, -0.56, 0]), tp + np.array([0.8, 0.56, 0]), color=PINK, stroke_width=4)
        ap = M(r"\approx", size=48, color=PINK).move_to(tp + np.array([-0.45, 0.6, 0]))
        l3 = H("estimates", 34).move_to([xs[2], yl, 0])
        self.go(T4("14:57.61"), draw(c3, run=0.6, color=BLUE), FadeIn(l3), run=0.6)
        self.play(Create(tl), FadeIn(ap), run_time=0.5)
        # shape of a graph: a max and a min
        c4 = VMobject(stroke_color=BLUE, stroke_width=4).set_points_smoothly(
            [[xs[3] + u, 0.25 + 0.55 * (u ** 3 - 3 * u * 0.36) / 0.43, 0] for u in np.linspace(-1, 1, 21)])
        mx = Dot([xs[3] - 0.6, 0.25 + 0.55 * (-0.216 + 0.648) / 0.43, 0], radius=0.08, color=ORG)
        mn = Dot([xs[3] + 0.6, 0.25 + 0.55 * (0.216 - 0.648) / 0.43, 0], radius=0.08, color=ORG)
        l4 = H("shape", 34).move_to([xs[3], yl, 0])
        self.go(T4("14:59.19"), draw(c4, run=0.7, color=BLUE), FadeIn(l4), run=0.7)
        self.play(FadeIn(mx, scale=0.5), FadeIn(mn, scale=0.5), run_time=0.4)
        # best answer: the open box with the corners cut out
        s, c = 1.6, 0.35
        o = np.array([xs[4], 0.1, 0])
        pts = [[-s / 2 + c, -s / 2], [s / 2 - c, -s / 2], [s / 2 - c, -s / 2 + c], [s / 2, -s / 2 + c], [s / 2, s / 2 - c],
               [s / 2 - c, s / 2 - c], [s / 2 - c, s / 2], [-s / 2 + c, s / 2], [-s / 2 + c, s / 2 - c], [-s / 2, s / 2 - c],
               [-s / 2, -s / 2 + c], [-s / 2 + c, -s / 2 + c]]
        net = Polygon(*[o + [x, y, 0] for x, y in pts], color=CHALK, stroke_width=4, fill_color=GRN, fill_opacity=0.15)
        corners = VGroup(*[DashedVMobject(Square(c, color=RED, stroke_width=3).move_to(o + [sx * (s - c) / 2, sy * (s - c) / 2, 0]),
                                          num_dashes=8) for sx in (-1, 1) for sy in (-1, 1)])
        l5 = H("best answer", 34).move_to([xs[4], yl, 0])
        self.go(T4("15:01.29"), Create(net), FadeIn(l5), run=0.6)
        self.play(Create(corners), run_time=0.5)
        self.wipe(T4("15:04.20"), run=0.35, keep=[rd])


class K40_Recap3(Shot):
    def body(self):
        self.title("The Big Picture", animate=False)
        rd = road(3)
        self.add(rd)

        # flipped around: derivative one way, antiderivative back
        step_road(self, rd, 4, T4("15:05.19"))
        Fx = M("F(x)", size=60).move_to([-4.6, 1.45, 0])
        fx = M("f(x)", size=60).move_to([-1.4, 1.45, 0])
        top = CurvedArrow(Fx.get_top() + UP * 0.1 + RIGHT * 0.2, fx.get_top() + UP * 0.1 + LEFT * 0.2, angle=-0.9,
                          color=PINK, stroke_width=4, tip_length=0.18)
        bot = CurvedArrow(fx.get_bottom() + DOWN * 0.1 + LEFT * 0.2, Fx.get_bottom() + DOWN * 0.1 + RIGHT * 0.2, angle=-0.9,
                          color=GRN, stroke_width=4, tip_length=0.18)
        dl = M(r"\tfrac{d}{dx}", size=44, color=PINK).next_to(top, UP, buff=0.08)
        il = M(r"\int", size=40, color=GRN).next_to(bot, DOWN, buff=0.08)
        self.go(T4("15:05.69"), Write(Fx), Write(fx), Create(top), FadeIn(dl), run=0.7)
        self.go(T4("15:06.63"), Create(bot), FadeIn(il), run=0.6)

        # area as a limit of rectangles
        f = lambda x: 1.2 + 0.6 * np.sin(1.3 * x) + 0.25 * x
        ax = axes((0, 4, 1), (0, 4, 1), x_length=4.6, y_length=3.0, center=(3.6, 0.6, 0), nums=False)
        gr = curve(ax, f, [0.2, 3.8])
        self.go(T4("15:07.95"), Create(ax), FadeIn(ax.labels), draw(gr, run=0.9, color=BLUE), run=0.9)
        R = riemann(ax, f, 0.5, 3.5, 4)
        self.go(T4("15:09.33"), FadeIn(R), run=0.5)
        self.go(T4("15:10.17"), Transform(R, riemann(ax, f, 0.5, 3.5, 8)), run=0.4)
        self.go(T4("15:10.63"), Transform(R, riemann(ax, f, 0.5, 3.5, 32, opacity=0.35)), run=0.5)
        sh = area(ax, f, 0.5, 3.5)
        self.play(ReplacementTransform(R, sh), run_time=0.5)

        # the fundamental theorem
        step_road(self, rd, 5, T4("15:12.15"))
        ftc = M(r"\int_a^b f(x)\,dx", "=", "F(b)-F(a)", size=52).move_to([-3.0, -1.5, 0])
        ftc[0].set_color(GRN)
        self.go(T4("15:12.59"), Write(ftc), run=1.0)
        self.go(T4("15:15.43"), Circumscribe(ftc, color=YEL, buff=0.12), run=0.9)
        # derivative breaks apart, integral adds back
        n = 16
        strips = riemann(ax, f, 0.5, 3.5, n, opacity=0.4)
        self.go(T4("15:16.89"), FadeOut(sh), FadeIn(strips), top.animate.set_stroke(width=7), run=0.4)
        self.play(*[st.animate.shift(RIGHT * (i - (n - 1) / 2) * 0.05) for i, st in enumerate(strips)], run_time=0.9)
        self.go(T4("15:18.67"), *[st.animate.scale(np.array([0.6, 1, 1])) for st in strips], run=0.6)
        sh2 = area(ax, f, 0.5, 3.5)
        self.go(T4("15:20.25"), top.animate.set_stroke(width=4), bot.animate.set_stroke(width=7),
                *[st.animate.shift(LEFT * (i - (n - 1) / 2) * 0.05).scale(np.array([1 / 0.6, 1, 1])) for i, st in enumerate(strips)], run=1.0)
        self.go(T4("15:21.41"), ReplacementTransform(strips, sh2), run=0.6)
        self.go(T4("15:22.95"), bot.animate.set_stroke(width=4), Circumscribe(VGroup(Fx, fx, top, bot, dl, il), color=YEL, buff=0.15), run=1.0)
        hb = box(ftc, YEL, buff=0.2, width=4)
        hl = H("the heart of calculus", 38, YEL).next_to(hb, RIGHT, buff=0.4)
        self.go(T4("15:25.47"), Create(hb), FadeIn(hl, shift=UP * 0.1), run=0.6)
        end(self, T4("15:27.33"))


# ---------------------------------------------------------------- calculus today

def rocket(c):
    c = np.array(c, float)
    body = Polygon(*[c + p for p in ([0, 0.95, 0], [0.3, 0.5, 0], [0.3, -0.6, 0], [-0.3, -0.6, 0], [-0.3, 0.5, 0])],
                   color=CHALK, stroke_width=4)
    fins = VGroup(Polygon(*[c + p for p in ([0.3, -0.15, 0], [0.6, -0.75, 0], [0.3, -0.6, 0])], color=CHALK, stroke_width=4),
                  Polygon(*[c + p for p in ([-0.3, -0.15, 0], [-0.6, -0.75, 0], [-0.3, -0.6, 0])], color=CHALK, stroke_width=4))
    win = Circle(radius=0.13, color=BLUE, stroke_width=4).move_to(c + [0, 0.25, 0])
    return VGroup(body, fins, win)


def bridge(c):
    c = np.array(c, float)
    deck = Line(c + [-1.75, -0.5, 0], c + [1.75, -0.5, 0], color=CHALK, stroke_width=5)
    towers = VGroup(*[Line(c + [x, -0.95, 0], c + [x, 0.8, 0], color=CHALK, stroke_width=5) for x in (-1.0, 1.0)])
    cab = VMobject(stroke_color=CHALK, stroke_width=3).set_points_smoothly(
        [c + [x, -0.35 + 1.15 * x * x, 0] for x in np.linspace(-1.0, 1.0, 13)])
    side = VGroup(Line(c + [-1.0, 0.8, 0], c + [-1.75, -0.5, 0], color=CHALK, stroke_width=3),
                  Line(c + [1.0, 0.8, 0], c + [1.75, -0.5, 0], color=CHALK, stroke_width=3))
    hang = VGroup(*[Line(c + [x, -0.35 + 1.15 * x * x, 0], c + [x, -0.5, 0], color=DIM, stroke_width=2)
                    for x in np.linspace(-0.75, 0.75, 7)])
    return VGroup(deck, towers, cab, side, hang)


def network(c):
    c = np.array(c, float)
    layers = [[c + [x, (i - (n - 1) / 2) * 0.5, 0] for i in range(n)] for x, n in ((-0.9, 3), (0, 4), (0.9, 2))]
    edges = VGroup(*[Line(p, q, color=DIM, stroke_width=2) for a, b in zip(layers, layers[1:]) for p in a for q in b])
    nodes = VGroup(*[Circle(radius=0.14, color=CHALK, stroke_width=3, fill_color=config.background_color, fill_opacity=1).move_to(p)
                     for L in layers for p in L])
    return VGroup(edges, nodes)


class K40_Today(Shot):
    def body(self):
        self.title("Calculus Today", T4("15:31.63"))
        fields = [("physics", "15:33.79"), ("engineering", "15:34.63"), ("economics", "15:35.07"), ("technology", "15:37.57")]
        fx = [-4.8, -1.6, 1.6, 4.8]
        for (w, t), x in zip(fields, fx):
            self.go(T4(t), FadeIn(H(w, 42, DIM).move_to([x, 1.55, 0]), shift=UP * 0.1), run=0.4)

        yd = -0.55
        rk = rocket([-4.3, yd - 0.25, 0])
        self.go(T4("15:39.63"), draw(rk[0], run=0.5), Create(rk[1]), Create(rk[2]), run=0.5)
        flame = Polygon([-4.45, yd - 0.9, 0], [-4.15, yd - 0.9, 0], [-4.3, yd - 1.35, 0], color=ORG, stroke_width=4)
        rk.add(flame)
        self.go(T4("15:40.10"), FadeIn(flame), rk.animate.shift(UP * 0.45), run=0.6)
        br = bridge([0, yd, 0])
        self.go(T4("15:40.83"), Create(br), run=0.8)
        nw = network([4.3, yd, 0])
        self.go(T4("15:42.29"), Create(nw[0]), FadeIn(nw[1]), run=0.7)
        self.go(T4("15:43.23"), LaggedStart(*[e.animate.set_color(PINK) for e in nw[0]], lag_ratio=0.05), run=1.0)
        fm = [M(r"v=\frac{ds}{dt}", size=48, color=PINK), M(r"\int w(x)\,dx", size=48, color=GRN),
              M(r"\text{slope}\to 0", size=48, color=PINK)]
        for m, x in zip(fm, (-4.3, 0, 4.3)):
            m.move_to([x, -2.75, 0])
        self.go(T4("15:44.31"), LaggedStart(*[Write(m) for m in fm], lag_ratio=0.35), run=1.2)
        end(self, T4("15:46.55"))


# ---------------------------------------------------------------- what comes next

class K40_Next(Shot):
    def body(self):
        self.title("What Comes Next", T4("15:47.69"))
        c1 = pill("Calculus 1", GRN, size=42).move_to([-4.0, 1.55, 0])
        ck = tick_mark(s=0.5).next_to(c1, LEFT, buff=0.25)
        c2 = pill("Calculus 2", YEL, size=42).move_to([1.5, 1.55, 0])
        ar = Arrow(c1.get_right() + RIGHT * 0.2, c2.get_left() + LEFT * 0.2, color=DIM, stroke_width=4, buff=0, tip_length=0.22)
        self.go(T4("15:48.20"), FadeIn(c1, shift=UP * 0.1), Create(ck), run=0.6)
        self.go(T4("15:49.40"), Create(ar), run=0.4)
        self.go(T4("15:49.79"), FadeIn(c2, shift=LEFT * 0.1), run=0.5)

        cx, ytop, ybot = [-3.4, 3.4], 0.6, -1.25
        tags = [H(s, 36, YEL) for s in ("integration by parts", "partial fractions", "volumes", "infinite series")]
        for tg, (x, y) in zip(tags, [(cx[0], ytop), (cx[1], ytop), (cx[0], ybot), (cx[1], ybot)]):
            tg.move_to([x, y, 0])
        ibp = M(r"\int u\,dv", "=", r"uv-\int v\,du", size=48).move_to([cx[0], -0.25, 0])
        pf = M(r"\frac{1}{x(x+1)}", "=", r"\frac{1}{x}-\frac{1}{x+1}", size=48).move_to([cx[1], -0.3, 0])
        self.go(T4("15:53.95"), FadeIn(tags[0], shift=UP * 0.1), Write(ibp), run=0.8)
        self.go(T4("15:55.39"), FadeIn(tags[1], shift=UP * 0.1), Write(pf), run=0.8)

        # volumes: a solid of revolution with a disk sliding through it
        o = np.array([cx[0] - 1.3, -2.45, 0])
        rr = lambda x: 0.22 + 0.5 * np.sqrt(x / 2.6)
        topc = VMobject(stroke_color=BLUE, stroke_width=4).set_points_smoothly([o + [x, rr(x), 0] for x in np.linspace(0, 2.6, 14)])
        botc = VMobject(stroke_color=BLUE, stroke_width=4).set_points_smoothly([o + [x, -rr(x), 0] for x in np.linspace(0, 2.6, 14)])
        cap0 = Ellipse(width=0.16, height=2 * rr(0), color=BLUE, stroke_width=3).move_to(o)
        cap1 = Ellipse(width=0.4, height=2 * rr(2.6), color=BLUE, stroke_width=4).move_to(o + [2.6, 0, 0])
        xv = ValueTracker(0.4)
        disk = always_redraw(lambda: Ellipse(width=0.34 * rr(xv.get_value()) / 0.72, height=2 * rr(xv.get_value()), color=GRN,
                                             stroke_width=3, fill_color=GRN, fill_opacity=0.3).move_to(o + [xv.get_value(), 0, 0]))
        self.go(T4("15:56.77"), FadeIn(tags[2], shift=UP * 0.1), Create(topc), Create(botc), Create(cap0), Create(cap1), run=0.8)
        self.go(T4("15:57.65"), FadeIn(disk), run=0.3)
        self.play(xv.animate.set_value(2.3), run_time=1.0)

        # infinite series: halves filling up to 2
        ser = M(r"1+\tfrac12+\tfrac14+\tfrac18+\cdots", "=", "2", size=48).move_to([cx[1], -2.0, 0])
        ser[2].set_color(GRN)
        bw = 4.0
        bx0 = cx[1] - bw / 2
        frame = Rectangle(width=bw, height=0.32, color=DIM, stroke_width=3).move_to([cx[1], -2.95, 0])
        pieces, x = VGroup(), bx0
        for k in range(7):
            w = bw / 2 ** (k + 1)
            pieces.add(Rectangle(width=w, height=0.32, stroke_color=GRN, stroke_width=2, fill_color=GRN,
                                 fill_opacity=0.5 if k % 2 == 0 else 0.25).move_to([x + w / 2, -2.95, 0]))
            x += w
        self.go(T4("15:59.27"), FadeIn(tags[3], shift=UP * 0.1), Write(ser[0]), Create(frame), run=0.8)
        self.go(T4("16:00.65"), LaggedStart(*[FadeIn(p) for p in pieces], lag_ratio=0.5), run=2.2)
        self.go(T4("16:02.90"), Write(ser[1:]), run=0.5)
        soon = H("coming soon", 36, DIM).next_to(c2, RIGHT, buff=0.35)
        self.go(T4("16:04.99"), Circumscribe(c2, color=YEL, buff=0.1), run=0.8)
        self.play(FadeIn(soon, shift=LEFT * 0.1), run_time=0.4)
        end(self, T4("16:06.60"))


# ---------------------------------------------------------------- closing

class K40_Thanks(Shot):
    def body(self):
        # share it
        scr = RoundedRectangle(width=2.8, height=1.8, corner_radius=0.15, color=CHALK, stroke_width=5).move_to([-3.8, 0.4, 0])
        tri = Triangle(color=YEL, stroke_width=4, fill_color=YEL, fill_opacity=0.3).scale(0.4).rotate(-PI / 2).move_to(scr)
        ph = RoundedRectangle(width=1.1, height=1.9, corner_radius=0.15, color=CHALK, stroke_width=5).move_to([3.8, 0.4, 0])
        qm = M("?", size=60, color=DIM).move_to(ph)
        self.go(T4("16:13.95"), Create(scr), FadeIn(tri), run=0.6)
        self.go(T4("16:14.43"), Create(ph), run=0.5)
        self.go(T4("16:14.95"), FadeIn(qm), run=0.4)
        arc = ArcBetweenPoints(scr.get_top() + UP * 0.15, ph.get_top() + UP * 0.15, angle=-1.1)
        trail = DashedVMobject(arc.copy().set_stroke(DIM, 3), num_dashes=20)
        mini = tri.copy().scale(0.6).move_to(arc.get_start())
        sl = H("send it", 40, YEL).move_to([0, 2.0, 0])
        self.go(T4("16:16.57"), Create(trail), FadeIn(mini), FadeIn(sl, shift=UP * 0.1), run=0.5)
        self.play(MoveAlongPath(mini, arc), run_time=1.0)
        self.play(mini.animate.move_to(ph).scale(1.1), FadeOut(qm), run_time=0.5)
        tk = tick_mark(s=0.6).next_to(ph, DOWN, buff=0.3)
        self.go(T4("16:18.60"), Create(tk), run=0.5)
        self.wipe(T4("16:20.00"), run=0.35)

        # leave a comment
        bub = RoundedRectangle(width=8.8, height=2.0, corner_radius=0.4, color=CHALK, stroke_width=5).move_to([0, 0.5, 0])
        tail = Polygon([-2.0, -0.2, 0], [-2.6, -1.3, 0], [-1.2, -0.2, 0])
        speech = Union(bub, tail).set_stroke(CHALK, 5).set_fill(opacity=0)
        self.go(T4("16:20.55"), Create(speech), run=0.8)
        lc = H("leave a comment", 38, DIM).next_to(bub, UP, buff=0.3)
        self.go(T4("16:23.33"), FadeIn(lc, shift=DOWN * 0.1), run=0.5)
        t1 = H("Chapter 9,", 42, YEL)
        t2 = H("optimization question", 42)
        VGroup(t1, t2).arrange(RIGHT, buff=0.25).move_to(bub)
        self.go(T4("16:24.35"), Write(t1), run=0.6)
        self.go(T4("16:25.31"), Write(t2), run=0.7)
        rk = tick_mark(s=0.7).next_to(bub, DR, buff=-0.1).shift(RIGHT * 0.5)
        self.go(T4("16:26.45"), Create(rk), run=0.5)
        self.wipe(T4("16:27.25"), run=0.35)

        # the final board
        th = H("Thanks for learning with me", 60).move_to([0, 2.0, 0])
        ct = H("Calculus 1, the full course", 44, YEL).move_to([0, 1.1, 0])
        bl = brush_line(ct.width + 0.4, center=ct.get_bottom() + DOWN * 0.1)
        self.go(T4("16:27.63"), Write(th), run=1.2)
        self.go(T4("16:29.10"), FadeIn(ct, shift=UP * 0.1), Create(bl), run=0.8)
        f = lambda x: 1.3 + 0.7 * np.sin(1.1 * x - 0.6)
        ax = axes((0, 6, 1), (0, 3, 1), x_length=7.0, y_length=2.6, center=(0, -1.05, 0), nums=False)
        gr = curve(ax, f, [0.2, 5.8])
        self.go(T4("16:30.19"), Create(ax), FadeIn(ax.labels), draw(gr, run=1.0, color=BLUE), run=1.0)
        xt = ValueTracker(0.6)
        sh = always_redraw(lambda: area(ax, f, 0.4, xt.get_value()))
        lt = live_tangent(ax, f, xt, length=1.8, readout=False)
        self.play(FadeIn(sh), FadeIn(lt), run_time=0.4)
        self.play(xt.animate(rate_func=linear).set_value(3.9), run_time=sec(T4("16:35.45")) - self.now())
        kp = H("keep practicing", 44, YEL).move_to([0, -3.15, 0])
        self.play(AnimationGroup(xt.animate(rate_func=linear, run_time=2.4).set_value(5.5), Write(kp, run_time=1.0)))
