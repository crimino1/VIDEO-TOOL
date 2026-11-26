"""Builder 39: Chapter 14, the final exam, questions 1-10 and the set-up of question 11.
Every question board: a YEL pill "Question N" as the heading, a DIM "Chapter K" tag beside it on the spoken word,
the question written large, a small pause icon when it has been read, then the worked solution on the words
(rows aligned on "=", RED strikes, GRN answer box). Each question shot starts and ends on an empty board.
END SEAM (K39_Q11, not wiped): heading pill "Question 11" (size 46, to_edge UP 0.22), no chapter tag yet;
left: M("\\text{Area}=100\\ \\text{m}^2") at (-3.4, 1.85), YEL M("\\text{smallest perimeter?}") at (-3.4, 0.95);
rows aligned on "=" at x=-3.6, size 56: "xy = 100" y=-0.25, "y = 100/x" y=-1.4, "P = 2x+2y" y=-2.75;
right: rectangle 4.0 x 2.4 centred (3.9, -0.6), light GRN fill, ORG "x" under it, ORG "y" right of it."""
from common import *


def lim(a):
    return r"\lim_{x \to " + a + "}"


def frow(pre, num, den, f1=None, size=64):
    """M(*pre, num over den); tags .num .bar .den (and .f1 .f2 when num = f1 f2) on the fraction's glyphs."""
    m = M(*pre, r"\frac{" + num + "}{" + den + "}", size=size)
    fr = m[-1]
    nn = len(M(num)[0])
    m.num, m.bar, m.den = fr[:nn], fr[nn], fr[nn + 1:]
    if f1:
        k = len(M(f1)[0])
        m.f1, m.f2 = fr[:k], fr[k:nn]
    return m


def at_eq(m, k, eqx, y):
    """Put part k (the '=') of m at (eqx, y)."""
    return m.shift([eqx - m[k].get_center()[0], y - m[k].get_center()[1], 0])


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


def abox(m):
    return SurroundingRectangle(m, color=GRN, buff=0.12, stroke_width=4, corner_radius=0.1)


def pause_icon(r=0.34, color=YEL):
    return VGroup(Circle(radius=r, color=CHALK, stroke_width=4),
                  *[Line([x, -0.33 * r / 0.7, 0], [x, 0.33 * r / 0.7, 0], color=color, stroke_width=16 * r / 0.7 + 2)
                    for x in (-0.19 * r / 0.7, 0.19 * r / 0.7)])


def qhead(sc, n, t):
    sc.head = VGroup(pill(f"Question {n}", YEL, size=46).to_edge(UP, buff=0.22))
    sc.go(t, FadeIn(sc.head, shift=DOWN * 0.15), run=0.5)


def chap(sc, s, t):
    tag = H(s, 36, DIM).next_to(sc.head[0], RIGHT, buff=0.4)
    sc.go(t, FadeIn(tag, shift=LEFT * 0.1), run=0.5)
    sc.remove(tag)
    sc.head.add(tag)


def pause_at(sc, target, t, buff=0.6):
    ic = pause_icon().next_to(target, RIGHT, buff=buff)
    sc.go(t, FadeIn(ic, scale=0.8), run=0.4)
    return ic


def end(sc, t):
    sc.at(t)
    sc.clear_all(run=0.35)


def grow(sc, *mobs, run=0.6):
    """Write a row piece by piece in one go."""
    sc.play(*[Write(m) for m in mobs], run_time=run)


# ---------------------------------------------------------------- intro

class K39_Intro(Shot):
    def body(self):
        self.title("The Final Exam", "4:06:33.79")
        big = M("16", size=120, color=YEL)
        lab = H("questions", 46)
        left = VGroup(big, lab).arrange(DOWN, buff=0.1).move_to([-4.3, 0.0, 0])
        sq = VGroup()
        for i in range(16):
            r, c = divmod(i, 4)
            s = RoundedRectangle(width=0.78, height=0.78, corner_radius=0.12, stroke_color=CHALK, stroke_width=3)
            s.move_to([(c - 1.5) * 1.0, (1.5 - r) * 1.0 - 0.15, 0])
            sq.add(VGroup(s, M(str(i + 1), size=36, color=DIM).move_to(s)))
        self.go("4:06:40.19", Write(big), FadeIn(lab, shift=UP * 0.1),
                LaggedStart(*[FadeIn(q, scale=0.85) for q in sq], lag_ratio=0.08), run=1.1)
        grp = [(range(0, 4), BLUE), (range(4, 12), PINK), (range(12, 16), GRN)]
        self.go("4:06:41.57", *[sq[i][0].animate.set_stroke(c, width=4) for rg, c in grp for i in rg], run=0.9)
        legend = VGroup(*[VGroup(Square(0.3, stroke_color=c, stroke_width=4), H(w, 40, c)).arrange(RIGHT, buff=0.25)
                          for w, c in (("limits", BLUE), ("derivatives", PINK), ("integrals", GRN))])
        legend.arrange(DOWN, buff=0.45, aligned_edge=LEFT).move_to([4.4, -0.15, 0])
        arrows = VGroup(*[M(r"\downarrow", size=40, color=DIM).move_to(
            (legend[i][0].get_center() + legend[i + 1][0].get_center()) / 2) for i in range(2)])
        self.go("4:06:43.07", LaggedStart(*[FadeIn(l, shift=RIGHT * 0.1) for l in legend], lag_ratio=0.4), run=1.0)
        self.play(FadeIn(arrows), run_time=0.4)
        self.wipe("4:06:45.45")

        # how to do it: pause -> write it down -> check
        y = 0.75
        pz = pause_icon(r=0.75).move_to([-4.6, y, 0])
        pl = H("pause", 46).next_to(pz, DOWN, buff=0.4)
        self.go("4:06:48.63", FadeIn(pz, scale=0.85), FadeIn(pl, shift=UP * 0.1), run=0.6)
        paper = Polygon([-0.75, 1.0, 0], [0.45, 1.0, 0], [0.75, 0.7, 0], [0.75, -1.0, 0], [-0.75, -1.0, 0],
                        color=CHALK, stroke_width=4).shift([0, y, 0])
        fold = VMobject(stroke_color=CHALK, stroke_width=3).set_points_as_corners(
            [[0.45, 1.0 + y, 0], [0.45, 0.7 + y, 0], [0.75, 0.7 + y, 0]])
        a1 = Arrow([-3.6, y, 0], [-1.25, y, 0], color=DIM, stroke_width=4, buff=0, tip_length=0.22)
        self.go("4:06:49.65", Create(a1), draw(paper, run=0.7), Create(fold), run=0.7)
        lines = VGroup(*[Line([-0.5, y + 0.45 - 0.35 * k, 0], [0.5 - 0.25 * (k % 2), y + 0.45 - 0.35 * k, 0],
                              color=DIM, stroke_width=3) for k in range(4)])
        self.go("4:06:50.39", LaggedStart(*[Create(l) for l in lines], lag_ratio=0.3), run=1.0)
        pen = VGroup(Polygon([0, 0, 0], [0.12, 0.2, 0], [-0.12, 0.2, 0], color=YEL, stroke_width=3),
                     Polygon([0.12, 0.2, 0], [0.12, 1.1, 0], [-0.12, 1.1, 0], [-0.12, 0.2, 0], color=YEL, stroke_width=3))
        pen.rotate(-0.5, about_point=ORIGIN).shift([0.6, y - 0.75, 0])
        self.go("4:06:52.47", FadeIn(pen, shift=DOWN * 0.15), run=0.5)
        wl = H("write it down", 46).next_to(paper, DOWN, buff=0.4).set_y(pl.get_y())
        self.go("4:06:53.43", Write(wl), pen.animate.shift(LEFT * 0.7), run=0.8)
        a2 = Arrow([1.25, y, 0], [3.6, y, 0], color=DIM, stroke_width=4, buff=0, tip_length=0.22)
        tk = tick_mark(s=1.1).move_to([4.6, y, 0])
        cl = H("check", 46, GRN).next_to(tk, DOWN, buff=0.4).set_y(pl.get_y())
        self.go("4:06:54.53", Create(a2), run=0.6)
        self.go("4:06:55.35", Create(tk), FadeIn(cl, shift=UP * 0.1), run=0.6)

        # one wrong -> which chapter to go back to
        yb = -2.75
        qp = pill("Question 7", ORG, size=38).move_to([-3.4, yb, 0])
        x = cross_mark(s=0.22).next_to(qp, RIGHT, buff=0.35)
        self.go("4:06:56.11", FadeIn(qp, shift=UP * 0.1), run=0.5)
        self.go("4:06:56.71", Create(x), run=0.4)
        a3 = Arrow(x.get_right() + RIGHT * 0.25, x.get_right() + RIGHT * 1.85, color=DIM, stroke_width=4, buff=0, tip_length=0.2)
        ct = H("Chapter 6", 42, DIM).next_to(a3, RIGHT, buff=0.3)
        self.go("4:06:58.43", Create(a3), run=0.5)
        self.go("4:06:59.03", FadeIn(ct, shift=LEFT * 0.1), run=0.5)
        self.go("4:07:00.69", Create(under(ct)), run=0.5)
        self.go("4:07:03.43", Circumscribe(VGroup(pz, pl), color=YEL, buff=0.15), run=1.0)
        end(self, "4:07:04.95")


# ---------------------------------------------------------------- questions 1-4: limits and continuity

class K39_Q1(Shot):
    def body(self):
        qhead(self, 1, "4:07:05.47")
        eqx = -3.0
        Y = [1.45, -0.2, -1.75, -3.0]
        L1 = frow(["=", lim("4")], "(x-4)(x+4)", "x-4", f1="(x-4)")
        at_eq(L1, 0, eqx, Y[1])
        L0 = frow([lim("4")], "x^2-16", "x-4")
        L0.shift([L1[1].get_left()[0] - L0.get_left()[0], Y[0] - L0.bar.get_y(), 0])
        L2 = at_eq(M("=", lim("4"), "(x+4)", size=64), 0, eqx, Y[2])
        L3 = at_eq(M("=", "4+4", "=", "8", size=64), 0, eqx, Y[3])
        L3[1].set_color(ORG)
        L3[2].shift(LEFT * 0.1)

        self.go("4:07:07.33", Write(L0[0]), run=0.8)
        self.go("4:07:09.27", Write(L0.num), run=0.8)
        self.go("4:07:10.69", Create(L0.bar), run=0.3)
        self.go("4:07:11.19", Write(L0.den), run=0.5)
        ic = pause_at(self, L0, "4:07:11.80", buff=0.8)
        cx = (L0.get_right()[0] + 6.6) / 2
        lab = TX(r"plug in $x=4$", 40, DIM).move_to([cx, Y[0] + 0.7, 0])
        pl = M(r"\frac{16-16}{4-4}", "=", r"\frac{0}{0}", size=56).move_to([cx, Y[0] - 0.25, 0])
        pl[2].set_color(YEL)
        self.go("4:07:12.57", FadeOut(ic), FadeIn(lab, shift=UP * 0.1), run=0.4)
        self.go("4:07:13.00", Write(pl[0]), run=0.6)
        self.go("4:07:13.80", Write(pl[1:]), run=0.4)
        ul = under(L0.num)
        self.go("4:07:14.95", FadeOut(lab), FadeOut(pl), Create(ul), run=0.5)
        self.go("4:07:16.03", FadeOut(ul), Write(VGroup(L1[0], L1[1], L1.bar, L1.den, L1.f1)), run=0.8)
        self.go("4:07:16.89", Write(L1.f2), run=0.6)
        self.go("4:07:18.81", Create(strike(L1.f1)), Create(strike(L1.den)), run=0.5)
        self.go("4:07:20.05", Write(L2[0:2]), run=0.4)
        self.go("4:07:20.50", TransformFromCopy(L1.f2, L2[2]), run=0.6)
        self.go("4:07:21.65", Write(L3[0:2]), run=0.6)
        self.go("4:07:22.79", Write(L3[2:4]), run=0.3)
        self.go("4:07:23.10", Create(abox(L3[3])), run=0.35)
        chap(self, "Chapter 2", "4:07:23.67")
        end(self, "4:07:24.55")


class K39_Q2(Shot):
    def body(self):
        qhead(self, 2, "4:07:24.95")
        L0 = frow([lim(r"\infty")], "6x^2-x", "3x^2+5", size=70)
        L1 = M("=", r"\frac{6}{3}", size=70)
        L2 = M("=", "2", size=70)
        L1.next_to(L0, RIGHT, buff=0.35)
        L2.next_to(L1, RIGHT, buff=0.35)
        for m in (L1, L2):
            m.shift(UP * (L0.bar.get_y() - m[0].get_y()))
        L2[0].shift(LEFT * 0.1)
        VGroup(L0, L1, L2).move_to([0, 0.3, 0])
        L1[1][0].set_color(ORG); L1[1][2].set_color(ORG)
        top, bot = L0.num, L0.den

        self.go("4:07:26.77", Write(L0[0]), run=0.8)
        self.go("4:07:28.77", Write(top), run=0.9)
        self.go("4:07:30.41", Create(L0.bar), run=0.3)
        self.go("4:07:30.85", Write(bot), run=0.8)
        ic = pause_at(self, L0, "4:07:32.00", buff=0.6)
        self.go("4:07:33.21", FadeOut(ic), run=0.3)
        self.go("4:07:34.07", top[1:3].animate.set_color(YEL), run=0.35)
        self.go("4:07:34.41", bot[1:3].animate.set_color(YEL), run=0.35)
        self.go("4:07:35.89", top[3:].animate.set_opacity(0.25), bot[3:].animate.set_opacity(0.25), run=0.6)
        self.go("4:07:37.03", top[0].animate.set_color(ORG), bot[0].animate.set_color(ORG), run=0.5)
        self.go("4:07:38.45", Write(L1[0]), TransformFromCopy(top[0], L1[1][0]), Create(L1[1][1]),
                TransformFromCopy(bot[0], L1[1][2]), run=0.7)
        self.go("4:07:39.75", Write(L2), run=0.4)
        self.play(Create(abox(L2[1])), run_time=0.35)
        chap(self, "Chapter 3", "4:07:40.79")
        end(self, "4:07:41.85")


class K39_Q3(Shot):
    def body(self):
        qhead(self, 3, "4:07:42.27")
        eqx = -4.9
        Y = [1.45, -0.2, -1.65]
        L1 = frow(["=", lim("0"), "4", r"\cdot"], r"\sin 4x", "4x")
        at_eq(L1, 0, eqx, Y[1])
        L1[2].set_color(ORG); L1.den[0].set_color(ORG)
        L0 = frow([lim("0")], r"\sin 4x", "x")
        L0.shift([L1[1].get_left()[0] - L0.get_left()[0], Y[0] - L0.bar.get_y(), 0])
        L2 = at_eq(M("=", "4", r"\cdot", "1", "=", "4", size=64), 0, eqx, Y[2])
        L2[1].set_color(ORG)
        L2[4].shift(LEFT * 0.1)

        self.go("4:07:44.21", Write(L0[0]), run=0.8)
        self.go("4:07:46.31", Write(L0.num), run=0.6)
        self.go("4:07:47.41", Create(L0.bar), Write(L0.den), run=0.4)
        ic = pause_at(self, L0, "4:07:47.95", buff=0.8)
        self.go("4:07:48.79", FadeOut(ic), Write(VGroup(L1[0], L1[1], L1.num, L1.bar, L1.den[1:])), run=0.8)
        self.go("4:07:50.07", FadeIn(L1[2], shift=DOWN * 0.1), FadeIn(L1[3]), FadeIn(L1.den[0], shift=UP * 0.1), run=0.4)
        fr = VGroup(L1.num, L1.bar, L1.den)
        self.go("4:07:51.21", Circumscribe(L1[2], color=ORG, buff=0.08), run=0.6)
        self.go("4:07:51.85", Circumscribe(fr, color=YEL, buff=0.1), run=1.0)
        ul = under(fr)
        to1 = M(r"\to 1", size=56, color=GRN).next_to(fr, RIGHT, buff=0.35)
        self.go("4:07:54.25", Create(ul), run=0.4)
        self.go("4:07:55.13", Write(to1), run=0.5)
        self.go("4:07:55.93", Write(L2[0:4]), run=0.6)
        self.go("4:07:56.69", Write(L2[4:]), run=0.35)
        self.play(Create(abox(L2[5])), run_time=0.35)

        # the other way: L'Hopital
        lh = frow([lim("0")], r"4\cos 4x", "1", size=60)
        lh.num.set_color(PINK); lh.den.set_color(PINK)
        lab = H("L'Hôpital:", 40, PINK)
        e4 = M("=", "4", size=60)
        row = VGroup(lab, lh, e4).arrange(RIGHT, buff=0.35)
        e4.shift(UP * (lh.bar.get_y() - e4[0].get_y()))
        lab.shift(UP * (lh.bar.get_y() - lab.get_y()))
        e4[0].shift(LEFT * 0.1)
        row.move_to([0.4, -3.0, 0])
        self.at("4:07:57.63")
        focus(self, run=0.5)
        self.go("4:07:58.57", FadeIn(lab, shift=RIGHT * 0.1), run=0.5)
        self.go("4:07:59.43", Write(lh[0]), run=0.6)
        self.go("4:08:00.13", Write(lh.num), run=0.8)
        self.go("4:08:01.73", Create(lh.bar), Write(lh.den), run=0.4)
        self.go("4:08:02.67", Write(e4), run=0.4)
        self.play(Create(abox(e4[1])), run_time=0.35)
        chap(self, "Chapters 3 or 10", "4:08:04.30")
        end(self, "4:08:05.67")


class K39_Q4(Shot):
    def body(self):
        qhead(self, 4, "4:08:06.07")
        # the piecewise definition (built by hand so each piece can be pointed at)
        fx = M("f(x)", "=", size=58)
        r1 = M("x+k", size=58)
        c1 = M("x<2", size=50, color=DIM)
        r2 = M("x^2", size=58)
        c2 = M(r"x\ge 2", size=50, color=DIM)
        r1.move_to([-3.6, 1.95, 0], aligned_edge=LEFT)
        r2.move_to([-3.6, 1.05, 0], aligned_edge=LEFT)
        c1.move_to([-1.6, r1.get_y(), 0], aligned_edge=LEFT)
        c2.move_to([-1.6, r2.get_y(), 0], aligned_edge=LEFT)
        br = Brace(VGroup(r1, r2), LEFT, color=CHALK, buff=0.15)
        fx.next_to(br, LEFT, buff=0.15)
        r1[0][2].set_color(ORG)

        self.go("4:08:07.83", Write(fx), run=0.6)
        self.go("4:08:08.95", Create(br), Write(r1), run=0.6)
        self.go("4:08:09.83", Write(c1), run=0.6)
        self.go("4:08:11.83", Write(r2), run=0.5)
        self.go("4:08:12.37", Write(c2), run=0.6)
        kq = M("k", "=", r"\text{?}", size=60, color=YEL).move_to([0.6, 1.5, 0])
        kq[0].set_color(ORG)
        self.go("4:08:14.87", Write(kq), run=0.5)
        ic = pause_at(self, kq, "4:08:15.40", buff=0.5)

        # the graph: the left piece slides with k
        ax = axes((0, 3, 1), (0, 7, 1), x_length=3.9, y_length=4.2, center=(4.6, -1.15, 0), nums=False)
        tk = VGroup(M("2", size=32, color=FAINT).next_to(ax.c2p(2, 0), DOWN, buff=0.12),
                    M("4", size=32, color=FAINT).next_to(ax.c2p(0, 4), LEFT, buff=0.12), ax.labels[-2:])
        k = ValueTracker(0.6)
        left = always_redraw(lambda: curve(ax, lambda x: x + k.get_value(), [0, 1.96]))
        hl = always_redraw(lambda: hole(ax, 2, 2 + k.get_value()))
        right = curve(ax, lambda x: x * x, [2, 2.62])
        rdot = pt(ax, 2, 4, BLUE)
        dash = DashedLine(ax.c2p(2, 0), ax.c2p(2, 6.6), color=DIM, stroke_width=2, dash_length=0.08)
        self.go("4:08:15.77", Create(ax), FadeIn(tk), Create(left), Create(right), FadeIn(hl), FadeIn(rdot),
                Create(dash), run=0.9)

        eqx, sz = -2.6, 52
        ra = at_eq(M(r"\lim_{x\to 2^-} f", "=", "2+k", size=sz), 1, eqx, -0.2)
        rb = at_eq(M(r"\lim_{x\to 2^+} f", "=", "4", size=sz), 1, eqx, -1.2)
        rc = at_eq(M("2+k", "=", "4", size=sz), 1, eqx, -2.25)
        rd = at_eq(M("k", "=", "2", size=sz + 4), 1, eqx, -3.2)
        for r in (ra, rb):
            r[0][-1].set_color(BLUE)
        bx1 = box(r1, YEL, buff=0.1)
        self.go("4:08:16.95", FadeOut(ic), Create(bx1), run=0.5)
        self.go("4:08:17.73", Write(ra[0:2]), run=0.5)
        self.go("4:08:18.81", Write(ra[2]), run=0.5)
        bx2 = box(r2, YEL, buff=0.1)
        self.go("4:08:20.31", ReplacementTransform(bx1, bx2), Write(rb[0:2]), run=0.6)
        self.go("4:08:21.31", Write(rb[2]), run=0.4)
        self.go("4:08:22.27", FadeOut(bx2), TransformFromCopy(ra[2], rc[0]), Write(rc[1]),
                TransformFromCopy(rb[2], rc[2]), run=0.7)
        rd[0].set_color(ORG)
        self.go("4:08:23.73", Write(rd), k.animate.set_value(2), run=1.0)
        meet = note("no jump", ax.c2p(2, 4), LEFT + UP * 0.25, color=GRN, size=34, dist=0.7, angle=0.5)
        self.play(Create(abox(rd)), FadeIn(meet), run_time=0.45)
        chap(self, "Chapter 3", "4:08:25.35")
        end(self, "4:08:26.37")


# ---------------------------------------------------------------- questions 5-7: derivative rules

class K39_Q5(Shot):
    def body(self):
        qhead(self, 5, "4:08:26.77")
        eqx, sz = -3.0, 56
        r0 = at_eq(M("f(x)", "=", "5x^4", r"-3\sqrt{x}", r"+\frac{2}{x}", size=sz), 1, eqx, 1.55)
        r1 = at_eq(M("=", "5x^4", r"-3x^{1/2}", "+2x^{-1}", size=sz), 0, eqx, 0.35)
        r2 = at_eq(M("f'(x)", "=", "20x^3", r"-\tfrac{3}{2}x^{-1/2}", "-2x^{-2}", size=sz), 1, eqx, -0.9)
        r3 = at_eq(M("=", "20x^3", r"-\frac{3}{2\sqrt{x}}", r"-\frac{2}{x^2}", size=sz), 0, eqx, -2.35)
        r3[0].shift(LEFT * 0.12)
        r2[0].set_color(PINK)

        self.go("4:08:28.57", Write(r0[0:2]), run=0.5)
        self.go("4:08:29.39", Write(r0[2]), run=0.6)
        self.go("4:08:31.19", Write(r0[3]), run=0.7)
        self.go("4:08:32.57", Write(r0[4]), run=0.7)
        ic = pause_at(self, r0, "4:08:33.67", buff=0.6)
        self.go("4:08:34.77", FadeOut(ic), Write(r1[0]), run=0.4)
        self.go("4:08:36.77", TransformFromCopy(r0[2], r1[1]), run=0.6)
        self.go("4:08:38.41", TransformFromCopy(r0[3], r1[2]), run=0.7)
        self.go("4:08:40.23", TransformFromCopy(r0[4], r1[3]), run=0.7)
        rule = M("x^n", r"\to", "nx^{n-1}", size=48, color=PINK)
        rule[0].set_color(CHALK)
        rule.move_to([4.7, 0.95, 0])
        fr = panel(rule, PINK, buff=0.22, width=3)
        self.go("4:08:43.13", Create(fr), Write(rule), run=0.8)
        self.go("4:08:45.13", Write(r2[0:2]), TransformFromCopy(r1[1], r2[2]), run=0.7)
        self.go("4:08:46.09", TransformFromCopy(r1[2], r2[3]), run=0.9)
        self.go("4:08:48.95", TransformFromCopy(r1[3], r2[4]), run=0.8)
        self.go("4:08:52.41", Write(r3[0]), TransformFromCopy(r2[2], r3[1]), run=0.6)
        self.go("4:08:53.41", TransformFromCopy(r2[3], r3[2]), run=0.8)
        self.go("4:08:55.43", TransformFromCopy(r2[4], r3[3]), run=0.8)
        self.go("4:08:56.83", Create(abox(r3[1:])), run=0.4)
        chap(self, "Chapter 5", "4:08:57.63")
        end(self, "4:08:58.97")


class K39_Q6(Shot):
    def body(self):
        qhead(self, 6, "4:08:59.37")
        eqx, sz = -3.4, 58
        r0 = at_eq(M("y", "=", "e^{3x}", r"\cos x", size=sz), 1, eqx, 1.55)
        self.go("4:09:01.25", Write(r0[0:2]), run=0.5)
        self.go("4:09:02.05", Write(r0[2]), run=0.6)
        self.go("4:09:03.07", Write(r0[3]), run=0.6)
        ic = pause_at(self, r0, "4:09:03.85", buff=0.6)
        rule = M("(uv)'", "=", "u'", "v", "+", "u", "v'", size=48).move_to([3.9, 1.55, 0])
        rule[2].set_color(PINK); rule[6].set_color(PINK)
        rl = H("product rule", 34, DIM).next_to(rule, UP, buff=0.18)
        self.go("4:09:04.95", FadeOut(ic), FadeIn(rl, shift=UP * 0.1), Write(rule), run=0.8)
        ch = at_eq(M("(e^{3x})'", "=", "3e^{3x}", size=52), 1, eqx + 6.6, 0.05)
        ch[2].set_color(PINK)
        cl = H("chain rule", 34, DIM).next_to(ch, UP, buff=0.18)
        self.go("4:09:06.65", FadeIn(cl, shift=UP * 0.1), run=0.5)
        self.go("4:09:08.57", Write(ch[0:2]), run=0.6)
        self.go("4:09:10.69", Write(ch[2]), run=0.6)
        r1 = at_eq(M("y'", "=", "3e^{3x}", r"\cos x", "+", "e^{3x}", r"(-\sin x)", size=sz), 1, eqx, -0.95)
        r1[2].set_color(PINK); r1[6].set_color(PINK)
        self.go("4:09:12.79", Write(r1[0:2]), TransformFromCopy(ch[2], r1[2]), run=0.7)
        self.go("4:09:14.59", TransformFromCopy(r0[3], r1[3]), run=0.5)
        self.go("4:09:15.43", Write(r1[4]), run=0.3)
        self.go("4:09:16.01", TransformFromCopy(r0[2], r1[5]), run=0.5)
        self.go("4:09:17.49", Write(r1[6]), run=0.7)
        u1, u2 = under(r1[2][1:]), under(r1[5])
        self.go("4:09:19.37", Create(u1), Create(u2), run=0.5)
        r2 = at_eq(M("=", "e^{3x}", r"(3\cos x", r"-\sin x)", size=sz), 0, eqx, -2.3)
        r2[0].shift(LEFT * 0.12)
        self.go("4:09:20.33", FadeOut(u1), FadeOut(u2), Write(r2[0:2]), run=0.6)
        self.go("4:09:21.97", Write(r2[2]), run=0.6)
        self.go("4:09:23.21", Write(r2[3]), run=0.6)
        self.play(Create(abox(r2[1:])), run_time=0.35)
        chap(self, "Chapters 5 and 6", "4:09:24.97")
        end(self, "4:09:26.41")


class K39_Q7(Shot):
    def body(self):
        qhead(self, 7, "4:09:26.81")
        eqx, sz = -3.4, 64
        r0 = at_eq(M("y", "=", "(", "x^2+1", ")^{10}", size=sz), 1, eqx, 1.45)
        self.go("4:09:29.11", Write(r0[0:2]), run=0.4)
        self.go("4:09:29.61", Write(r0[2:4]), run=0.8)
        self.go("4:09:30.87", Write(r0[4]), run=0.5)
        ic = pause_at(self, r0, "4:09:31.95", buff=0.6)
        cl = H("chain rule", 40, YEL).next_to(r0, RIGHT, buff=1.6)
        ui = under(r0[3], BLUE)
        self.go("4:09:32.69", FadeOut(ic), FadeIn(cl, shift=LEFT * 0.1), Create(ui), run=0.5)
        r1 = at_eq(M("y'", "=", "10", "(x^2+1)^9", r"\cdot", "2x", size=sz), 1, eqx, -0.25)
        r1[0].set_color(PINK); r1[5].set_color(PINK)
        self.go("4:09:33.89", Write(r1[0:2]), Write(r1[2]), run=0.35)
        self.go("4:09:34.27", Write(r1[3]), run=0.9)
        self.go("4:09:36.55", Write(r1[4]), run=0.3)
        br = Brace(r1[5], DOWN, color=DIM, buff=0.12)
        bl = M("(x^2+1)'", size=42, color=DIM).next_to(br, DOWN, buff=0.1)
        self.go("4:09:37.05", TransformFromCopy(r0[3], r1[5]), run=0.7)
        self.play(Create(br), FadeIn(bl), run_time=0.4)
        r2 = at_eq(M("=", "20x", "(x^2+1)^9", size=sz), 0, eqx, -2.35)
        r2[0].shift(LEFT * 0.12)
        r2[1].set_color(PINK)
        self.go("4:09:39.45", Write(r2[0]), TransformFromCopy(VGroup(r1[2], r1[5]), r2[1]), run=0.8)
        self.go("4:09:40.65", TransformFromCopy(r1[3], r2[2]), run=0.7)
        self.go("4:09:42.43", Create(abox(r2[1:])), run=0.4)
        chap(self, "Chapter 6", "4:09:43.21")
        end(self, "4:09:44.20")


# ---------------------------------------------------------------- questions 8-10: using derivatives

class K39_Q8(Shot):
    def body(self):
        qhead(self, 8, "4:09:44.59")
        ax = axes((-4, 4, 1), (-4, 4, 1), x_length=4.3, y_length=4.3, center=(4.2, -0.95, 0), nums=False)
        u = 4.3 / 8
        circ = Circle(radius=np.sqrt(13) * u, color=BLUE, stroke_width=5).move_to(ax.c2p(0, 0))
        q0 = M("x^2+y^2", "=", "13", size=64).move_to([-3.3, 1.8, 0])
        q1 = TX(r"slope at $(2,\,3)$", 48).move_to([-3.3, 0.95, 0])
        self.go("4:09:46.93", Create(ax), FadeIn(ax.labels), draw(circ, run=1.1, color=BLUE), Write(q0[0]), run=1.1)
        self.go("4:09:49.39", Write(q0[1:]), run=0.5)
        P = pt(ax, 2, 3)
        self.go("4:09:50.29", Write(q1), run=0.8)
        self.go("4:09:51.21", FadeIn(P, scale=0.5), run=0.3)
        ic = pause_at(self, q1, "4:09:51.95", buff=0.5)

        eqx, sz = -3.6, 54
        r1 = at_eq(M("2x", "+", "2y", "y'", "=", "0", size=sz), 4, eqx + 1.2, -0.3)
        r1[3].set_color(PINK)
        tg = M(r"\frac{d}{dx}", size=40, color=DIM).next_to(r1, LEFT, buff=0.4)
        self.go("4:09:52.99", FadeOut(ic), FadeIn(tg, shift=RIGHT * 0.1), run=0.5)
        self.go("4:09:54.95", Write(r1[0]), run=0.4)
        self.go("4:09:55.53", Write(r1[1:4]), run=0.8)
        self.go("4:09:57.11", Write(r1[4:]), run=0.4)
        r2 = at_eq(M("y'", "=", r"-\frac{x}{y}", size=sz), 1, eqx + 1.2, -1.5)
        r3 = at_eq(M("y'", "=", r"-\frac{2}{3}", size=sz), 1, eqx + 1.2, -3.0)
        for r in (r2, r3):
            r[0].set_color(PINK)
        r3[2][1].set_color(ORG); r3[2][3].set_color(ORG)
        self.go("4:09:58.75", Write(r2[0:2]), run=0.5)
        self.go("4:09:59.75", Write(r2[2]), run=0.8)
        self.go("4:10:01.69", Circumscribe(q1[0][-5:], color=ORG, buff=0.08), Write(r3[0:2]), run=0.7)
        p = np.array(ax.c2p(2, 3))
        d = np.array([3, -2, 0]) / np.sqrt(13)
        tan = Line(p - d * 0.9, p + d * 1.6, color=PINK, stroke_width=5).set_z_index(4)
        self.go("4:10:02.85", Write(r3[2]), draw(tan, run=0.8, color=PINK), run=0.8)
        self.go("4:10:03.73", Create(abox(r3)), run=0.4)
        chap(self, "Chapter 7", "4:10:04.91")
        end(self, "4:10:05.65")


class K39_Q9(Shot):
    def body(self):
        qhead(self, 9, "4:10:06.05")
        # the square, bottom-left corner fixed, side s growing
        o = np.array([2.9, -0.75, 0])
        sc = 0.5
        s = ValueTracker(3.0)
        sq = always_redraw(lambda: Polygon(o, o + [s.get_value() * sc, 0, 0], o + np.array([1, 1, 0]) * s.get_value() * sc,
                                           o + [0, s.get_value() * sc, 0], color=CHALK, stroke_width=5,
                                           fill_color=GRN, fill_opacity=0.18))
        A = always_redraw(lambda: M("A", size=50, color=GRN).move_to(o + np.array([1, 1, 0]) * s.get_value() * sc / 2))
        sl = always_redraw(lambda: M("s", size=46, color=ORG).next_to(o + [s.get_value() * sc / 2, 0, 0], DOWN, buff=0.15))
        self.go("4:10:08.13", Create(sq), FadeIn(sl), run=0.6)
        arr = always_redraw(lambda: VGroup(
            Arrow(o + [s.get_value() * sc + 0.15, s.get_value() * sc / 2, 0], o + [s.get_value() * sc + 0.85, s.get_value() * sc / 2, 0],
                  color=PINK, stroke_width=4, buff=0, tip_length=0.18),
            Arrow(o + [s.get_value() * sc / 2, s.get_value() * sc + 0.15, 0], o + [s.get_value() * sc / 2, s.get_value() * sc + 0.65, 0],
                  color=PINK, stroke_width=4, buff=0, tip_length=0.18)))
        eqx, sz = -3.4, 56
        g1 = at_eq(M(r"\frac{ds}{dt}", "=", r"2\ \text{cm/s}", size=52), 1, eqx, 1.8)
        g1[0].set_color(PINK)
        self.go("4:10:08.77", FadeIn(arr), Write(g1[0]), s.animate.set_value(4.0), run=1.0)
        self.go("4:10:09.85", Write(g1[1:]), run=0.5)
        g2 = at_eq(M(r"\frac{dA}{dt}", "=", r"\text{?}", size=52, color=YEL), 1, eqx, 0.35)
        self.go("4:10:12.05", FadeIn(A), Write(g2), run=0.6)
        s5 = M("s", "=", r"5\ \text{cm}", size=46, color=ORG)
        s5.next_to(o + [2.5 * sc, 0, 0], DOWN, buff=0.15)
        sl.clear_updaters()
        self.go("4:10:13.51", s.animate.set_value(5.0), FadeOut(arr), ReplacementTransform(sl, s5), run=0.8)
        ic = pause_at(self, g2, "4:10:14.35", buff=0.6)

        r1 = at_eq(M("A", "=", "s^2", size=sz), 1, eqx, -0.95)
        r1[0].set_color(GRN)
        self.go("4:10:15.03", FadeOut(ic), Write(r1[0:2]), run=0.4)
        self.go("4:10:15.65", Write(r1[2]), run=0.5)
        dd = M(r"\frac{d}{dt}", size=40, color=DIM).next_to(r1, LEFT, buff=0.5)
        self.go("4:10:16.87", FadeIn(dd, shift=RIGHT * 0.1), run=0.5)
        r2 = at_eq(M(r"\frac{dA}{dt}", "=", "2s", r"\cdot", r"\frac{ds}{dt}", size=sz), 1, eqx, -2.1)
        r2[0].set_color(PINK); r2[4].set_color(PINK)
        self.go("4:10:19.29", Write(r2[0:2]), run=0.6)
        self.go("4:10:20.99", Write(r2[2]), run=0.5)
        self.go("4:10:21.71", Write(r2[3:]), run=0.7)
        r3 = at_eq(M("=", r"2\cdot", "5", r"\cdot", "2", "=", r"20\ \text{cm}^2/\text{s}", size=sz), 0, eqx, -3.25)
        r3[2].set_color(ORG); r3[4].set_color(ORG)
        self.go("4:10:23.00", Write(r3[0]), run=0.3)
        self.go("4:10:24.51", Write(r3[1]), TransformFromCopy(s5[2][0], r3[2]), run=0.6)
        self.go("4:10:25.41", Write(r3[3]), TransformFromCopy(g1[2][0], r3[4]), run=0.5)
        self.go("4:10:26.55", Write(r3[5:]), run=0.7)
        self.play(Create(abox(r3[6])), run_time=0.35)
        chap(self, "Chapter 8", "4:10:29.25")
        end(self, "4:10:30.23")


class K39_Q10(Shot):
    def body(self):
        qhead(self, 10, "4:10:30.63")
        f = lambda x: x ** 3 - 12 * x
        ax = axes((-4, 4, 2), (-20, 20, 10), x_length=4.3, y_length=4.6, center=(4.4, -0.85, 0), nums=False)
        tk = VGroup(M("-2", size=30, color=FAINT).next_to(ax.c2p(-2, 0), DOWN, buff=0.12),
                    M("2", size=30, color=FAINT).next_to(ax.c2p(2, 0), UP, buff=0.12), ax.labels)
        gr = curve(ax, f, [-4, 4])
        eqx, sz = -2.4, 54
        r0 = at_eq(M("f(x)", "=", "x^3-12x", size=58), 1, -3.8, 1.8)
        mm = H("local max? min?", 38, YEL).next_to(r0, RIGHT, buff=0.5)
        self.go("4:10:32.65", FadeIn(mm, shift=LEFT * 0.1), run=0.5)
        self.go("4:10:34.47", Write(r0[0:2]), run=0.6)
        self.go("4:10:35.51", Write(r0[2]), Create(ax), FadeIn(tk), draw(gr, run=1.0, color=BLUE), run=1.0)
        ic = pause_at(self, mm, "4:10:36.90", buff=0.3)

        r1 = at_eq(M("f'(x)", "=", "3x^2-12", size=sz), 1, eqx, 0.8)
        r2 = at_eq(M("3x^2-12", "=", "0", size=sz), 1, eqx, -0.15)
        r3 = at_eq(M("x^2", "=", "4", size=sz), 1, eqx, -1.1)
        r4 = at_eq(M("x", "=", "2", r"\text{ or }", "x", "=", "-2", size=sz), 1, eqx, -2.05)
        r1[0].set_color(PINK)
        r4[2].set_color(ORG); r4[6].set_color(ORG)
        self.go("4:10:38.33", FadeOut(ic), Write(r1[0:2]), run=0.5)
        self.go("4:10:39.17", Write(r1[2]), run=0.8)
        self.go("4:10:41.43", TransformFromCopy(r1[2], r2[0]), run=0.5)
        self.go("4:10:41.99", Write(r2[1:]), run=0.4)
        self.go("4:10:42.93", Write(r3), run=0.7)
        flat = [Line(ax.c2p(x, f(x)) + LEFT * 0.45, ax.c2p(x, f(x)) + RIGHT * 0.45, color=PINK, stroke_width=5).set_z_index(4)
                for x in (2, -2)]
        self.go("4:10:44.99", Write(r4[0:3]), Create(flat[0]), run=0.6)
        self.go("4:10:45.83", Write(r4[3:]), Create(flat[1]), run=0.7)

        # second derivative test, one column per point
        self.go("4:10:47.23", FadeOut(VGroup(r1, r2, r3, mm)), r4.animate.shift(UP * 2.85), run=0.6)
        s2 = at_eq(M("f''(x)", "=", "6x", size=sz), 1, eqx, -0.15)
        s2[0].set_color(PINK)
        self.go("4:10:47.90", Write(s2), run=0.6)
        cs = 46
        L = [M("f''(-2)", "=", "-12", "<0", size=cs), H("local max", 40, YEL), M("f(-2)", "=", "-8+24", size=cs)]
        R = [M("f''(2)", "=", "12", ">0", size=cs), H("local min", 40, YEL), M("f(2)", "=", "8-24", size=cs)]
        for col, cx in ((L, -4.6), (R, -0.4)):
            for m, y in zip(col, (-1.2, -2.1, -3.05)):
                m.move_to([cx, y, 0])
        L[0][0].set_color(PINK); R[0][0].set_color(PINK)
        L[0][3].set_color(RED); R[0][3].set_color(GRN)
        div = DashedLine([-2.5, -0.85, 0], [-2.5, -3.5, 0], color=FAINT, stroke_width=2, dash_length=0.1)
        pmax, pmin = pt(ax, -2, 16), pt(ax, 2, -16)
        self.go("4:10:50.05", Create(div), Write(L[0][0:3]), run=0.8)
        self.go("4:10:51.19", Write(L[0][3]), run=0.4)
        self.go("4:10:52.49", Write(L[1]), FadeIn(pmax, scale=0.5), run=0.6)
        self.go("4:10:53.83", Write(L[2]), run=1.0)
        n16 = M("16", size=cs).move_to(L[2][2], aligned_edge=LEFT)
        self.go("4:10:57.21", ReplacementTransform(L[2][2], n16), run=0.5)
        self.go("4:10:58.81", Write(R[0][0:3]), run=0.8)
        self.go("4:11:00.71", Write(R[0][3]), run=0.4)
        self.go("4:11:01.77", Write(R[1]), FadeIn(pmin, scale=0.5), run=0.6)
        self.go("4:11:02.71", Write(R[2]), run=1.0)
        m16 = M("-16", size=cs).move_to(R[2][2], aligned_edge=LEFT)
        self.go("4:11:05.05", ReplacementTransform(R[2][2], m16), run=0.5)

        lmax = M("(-2,\\,16)", size=40, color=GRN).next_to(pmax, UP, buff=0.25).shift(LEFT * 0.4)
        lmin = M("(2,\\,-16)", size=40, color=GRN).next_to(pmin, DOWN, buff=0.2)
        self.go("4:11:07.13", Write(lmax), run=0.6)
        self.play(Create(abox(lmax)), run_time=0.35)
        self.go("4:11:10.31", Write(lmin), run=0.6)
        self.play(Create(abox(lmin)), run_time=0.35)
        chap(self, "Chapter 9", "4:11:13.51")
        end(self, "4:11:14.10")


class K39_Q11(Shot):
    """Set-up only: builder 40 continues from "Which is 2x plus 200 over x". Not wiped (see END SEAM)."""
    def body(self):
        qhead(self, 11, "4:11:14.49")
        rect = Rectangle(width=4.0, height=2.4, color=CHALK, stroke_width=5, fill_color=GRN, fill_opacity=0).move_to([3.9, -0.6, 0])
        self.go("4:11:15.99", draw(rect, run=0.9), run=0.9)
        q0 = M(r"\text{Area}", "=", r"100\ \text{m}^2", size=58).move_to([-3.4, 1.85, 0])
        self.go("4:11:17.01", Write(q0[0:2]), rect.animate.set_fill(GRN, 0.15), run=0.5)
        self.go("4:11:17.65", Write(q0[2]), run=0.7)
        q1 = M(r"\text{smallest perimeter?}", size=54, color=YEL).move_to([-3.4, 0.95, 0])
        self.go("4:11:19.73", Write(q1), run=1.0)
        ic = pause_at(self, q1, "4:11:21.80", buff=0.4)
        xl = M("x", size=50, color=ORG).next_to(rect, DOWN, buff=0.2)
        yl = M("y", size=50, color=ORG).next_to(rect, RIGHT, buff=0.2)
        self.go("4:11:23.37", FadeOut(ic), Write(xl), run=0.4)
        self.go("4:11:24.23", Write(yl), run=0.4)
        eqx, sz = -3.6, 56
        r1 = at_eq(M("xy", "=", "100", size=sz), 1, eqx, -0.25)
        r2 = at_eq(M("y", "=", r"\frac{100}{x}", size=sz), 1, eqx, -1.4)
        r3 = at_eq(M("P", "=", "2x+2y", size=sz), 1, eqx, -2.75)
        self.go("4:11:25.29", Write(r1), run=0.8)
        self.go("4:11:27.45", Write(r2[0:2]), run=0.4)
        self.go("4:11:28.21", Write(r2[2]), run=0.7)
        edge = rect.copy().set_fill(opacity=0).set_stroke(YEL, 6)
        self.go("4:11:29.93", Create(edge), run=0.8)
        self.go("4:11:30.79", Write(r3[0:2]), run=0.4)
        self.go("4:11:31.25", Write(r3[2]), run=0.8)
        self.play(FadeOut(edge), run_time=0.4)
