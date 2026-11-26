"""Builder 05: Key 1, factoring. x->1 worked example, why cancelling is allowed (number line zoom, the two graphs),
x->3, x->-2 (trinomial), x->2 (difference of cubes)."""
from common import *

BOARDC = "#3b3a3e"
Y = [1.55, -0.15, -1.75, -3.0]   # row heights of a worked limit


def lim(a):
    return r"\lim_{x \to " + a + "}"


def frow(pre, num, den, f1=None, size=66):
    """M(*pre, \\frac{num}{den}); tags .num .bar .den (and .f1 .f2 when num = f1 f2) on the fraction's glyphs."""
    m = M(*pre, r"\frac{" + num + "}{" + den + "}", size=size)
    fr = m[-1]
    nn = len(M(num)[0])
    m.num, m.bar, m.den = fr[:nn], fr[nn], fr[nn + 1:]
    if f1:
        k = len(M(f1)[0])
        m.f1, m.f2 = fr[:k], fr[k:nn]
    return m


def on_eq(m, y, eqx):
    m.shift(np.array([eqx, y, 0]) - m[0].get_center())
    return m


def first_row(m, y, left):
    m.shift(np.array([left - m.get_left()[0], y - m.bar.get_y(), 0]))
    return m


def under(mob, color=YEL):
    return Line(mob.get_corner(DL) + DOWN * 0.1, mob.get_corner(DR) + DOWN * 0.1, color=color, stroke_width=5)


def chest(s=1.0):
    """Small locked chest: box, curved lid, padlock."""
    body = Rectangle(width=1.0, height=0.55, stroke_color=CHALK, stroke_width=4)
    lid = ArcBetweenPoints(body.get_corner(UL), body.get_corner(UR), angle=-PI / 2, color=CHALK, stroke_width=4)
    band = Line(body.get_corner(UL) + DOWN * 0.13, body.get_corner(UR) + DOWN * 0.13, color=DIM, stroke_width=3)
    lock = Square(0.24, stroke_color=YEL, stroke_width=4, fill_color=BOARDC, fill_opacity=1).move_to(body.get_top() + DOWN * 0.05)
    shackle = Arc(radius=0.08, start_angle=0, angle=PI, color=YEL, stroke_width=4).next_to(lock, UP, buff=0)
    return VGroup(body, lid, band, lock, shackle).scale(s)


def key_icon():
    bow = Circle(radius=0.32, color=YEL, stroke_width=6)
    shaft = Line(bow.get_right(), bow.get_right() + RIGHT * 1.3, color=YEL, stroke_width=6)
    t1 = Line(shaft.get_end(), shaft.get_end() + DOWN * 0.3, color=YEL, stroke_width=6)
    t2 = Line(shaft.get_end() + LEFT * 0.35, shaft.get_end() + LEFT * 0.35 + DOWN * 0.22, color=YEL, stroke_width=6)
    return VGroup(bow, shaft, t1, t2)


def zero_over_zero():
    z1, z2 = M("0", size=64, color=YEL), M("0", size=64, color=YEL)
    bar = Line(LEFT * 0.3, RIGHT * 0.3, color=YEL, stroke_width=4)
    z1.next_to(bar, UP, buff=0.1); z2.next_to(bar, DOWN, buff=0.1)
    return VGroup(z1, bar, z2)


def plug_group(label, cx, y=Y[0]):
    """'plug in x = a' note, the 0/0 under it, the little locked chest beside."""
    lab = TX(label, 40, DIM).move_to([cx, y + 0.55, 0])
    zz = zero_over_zero().move_to([cx - 0.5, y - 0.35, 0])
    ch = chest(1.0).next_to(zz, RIGHT, buff=0.45)
    return lab, zz, ch


class K05_Factor1(Shot):
    def body(self):
        k = key_icon()
        p = pill("Key 1", YEL, size=60)
        g = VGroup(k, p).arrange(RIGHT, buff=0.5).move_to([0, 0.7, 0])
        self.go("13:07.66", Create(k), FadeIn(p, shift=UP * 0.15), run=0.7)
        fw = H("Factoring", 80).move_to([0, -0.8, 0])
        self.go("13:09.10", Write(fw), run=0.6)
        self.wipe("13:10.10", run=0.4)
        self.title("Key 1: Factoring", "13:10.50")

        eqx = -3.0
        L1 = on_eq(frow(["=", lim("1")], "(x-1)(x+1)", "x-1", f1="(x-1)"), Y[1], eqx)
        L0 = first_row(frow([lim("1")], "x^2-1", "x-1"), Y[0], L1[1].get_left()[0])
        L2 = on_eq(M("=", lim("1"), "(x+1)", size=66), Y[2], eqx)
        L3 = on_eq(M("=", "1+1", "=", "2", size=66), Y[3], eqx)
        L3[1].set_color(ORG); L3[3].set_color(ORG)

        self.go("13:12.82", Write(L0[0]), run=0.8)
        self.go("13:15.32", Write(L0.num), run=0.8)
        self.go("13:16.82", Create(L0.bar), run=0.3)
        self.go("13:17.50", Write(L0.den), run=0.6)
        cx = (L0.get_right()[0] + 6.7) / 2
        lab, zz, ch = plug_group(r"plug in $x=1$", cx)
        self.go("13:18.94", FadeIn(lab, shift=UP * 0.1), run=0.4)
        self.go("13:19.96", Write(zz), run=0.7)
        self.go("13:21.16", Create(ch), run=0.8)
        ul = under(L0.num)
        self.go("13:23.06", FadeOut(lab), FadeOut(zz), FadeOut(ch), run=0.4)
        self.go("13:23.56", Create(ul), run=0.5)
        ds = H("difference of squares", 42, YEL).move_to([cx, Y[0], 0])
        self.go("13:26.54", Write(ds), run=0.8)
        self.go("13:28.04", FadeOut(ul), Write(VGroup(L1[0], L1[1], L1.bar, L1.den)), run=0.7)
        self.go("13:28.82", Write(L1.f1), run=0.6)
        self.go("13:30.00", Write(L1.f2), run=0.6)
        self.go("13:31.70", FadeOut(ds), run=0.4)
        u1, u2 = under(L1.f1), under(L1.den)
        self.go("13:33.04", Create(u1), run=0.4)
        self.go("13:34.92", Create(u2), run=0.4)
        self.go("13:37.22", FadeOut(u1), FadeOut(u2), Create(strike(L1.f1)), Create(strike(L1.den)), run=0.6)
        self.go("13:38.46", Write(L2[0:2]), run=0.6)
        self.go("13:39.46", TransformFromCopy(L1.f2, L2[2]), run=0.7)
        self.go("13:42.98", Write(L3[0:2]), run=0.7)
        self.go("13:43.96", Write(L3[2:4]), run=0.4)
        self.go("13:45.20", Create(box(L3[3], GRN, buff=0.15)), run=0.5)
        ok = VGroup(tick_mark(s=0.5), H("matches our table", 42, GRN)).arrange(RIGHT, buff=0.3)
        ok.next_to(L3, RIGHT, buff=1.2)
        self.go("13:46.84", Create(ok[0]), FadeIn(ok[1], shift=UP * 0.1), run=0.5)
        self.wipe("13:48.40", run=0.4)


class K05_WhyCancel(Shot):
    def body(self):
        self.title("Key 1: Factoring", animate=False)
        self.title("Why Can We Cancel?", "13:49.64")
        r = frow([], "(x-1)(x+1)", "x-1", f1="(x-1)", size=64).move_to([0, 1.0, 0])
        self.go("13:50.18", Write(r), run=0.8)
        self.go("13:51.00", Create(strike(r.f1)), Create(strike(r.den)), run=0.5)
        z = M("x-1", "=", "0", r"\text{ only when }", "x=1", size=60).move_to([0, -1.0, 0])
        z[4].set_color(ORG)
        self.go("13:51.94", Write(z[0:3]), run=0.8)
        self.go("13:53.12", Write(z[3:5]), run=0.9)
        self.wipe("13:55.50", run=0.4)

        # number line 0..2, then zoomed to 0.99..1.01
        yl, w = 1.0, 11.0
        unit = w / 2.4
        p = lambda u: np.array([(u - 1) * unit, yl, 0])
        base = DoubleArrow(p(-0.2), p(2.2), buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        ticks = VGroup(*[Line(p(u) + UP * 0.12, p(u) + DOWN * 0.12, color=DIM, stroke_width=3) for u in (0, 1, 2)])
        labs = VGroup(*[M(s, size=40, color=DIM).next_to(p(u) + DOWN * 0.12, DOWN, buff=0.12) for u, s in ((0, "0"), (1, "1"), (2, "2"))])
        self.go("13:55.88", Create(base), Create(ticks), FadeIn(labs), run=0.45)
        hole = Circle(radius=0.14, stroke_color=CHALK, stroke_width=5, fill_color=BOARDC, fill_opacity=1).move_to(p(1)).set_z_index(3)
        self.go("13:56.36", FadeIn(hole, scale=0.5), run=0.35)
        nv = TX(r"never at $x=1$", 42, RED).next_to(hole, UP, buff=0.35)
        self.go("13:56.82", Write(nv), run=0.6)
        ul, ur = ValueTracker(0.15), ValueTracker(1.85)
        dl = always_redraw(lambda: Dot(p(ul.get_value()), radius=0.12, color=BLUE).set_z_index(2))
        dr = always_redraw(lambda: Dot(p(ur.get_value()), radius=0.12, color=ORG).set_z_index(2))
        self.go("13:59.40", FadeIn(dl), FadeIn(dr), run=0.3)
        self.play(ul.animate.set_value(0.93), ur.animate.set_value(1.07), run_time=1.9)
        zl = VGroup(*[M(s, size=40, color=DIM).next_to(p(u) + DOWN * 0.12, DOWN, buff=0.12) for u, s in ((0, "0.99"), (1, "1"), (2, "1.01"))])
        zi = H("zoomed in", 36, DIM).next_to(p(2.2), UP, buff=0.3).shift(LEFT * 0.6)
        self.go("14:01.66", ReplacementTransform(labs, zl), FadeIn(zi, shift=DOWN * 0.1),
                ul.animate.set_value(0.9), ur.animate.set_value(1.1), run=1.0)
        ax = VGroup(M("x=0.999", size=52, color=BLUE), M("x-1=-0.001", size=52, color=BLUE)).arrange(DOWN, buff=0.3).move_to([-3.4, -0.9, 0])
        bx = VGroup(M("x=1.001", size=52, color=ORG), M("x-1=0.001", size=52, color=ORG)).arrange(DOWN, buff=0.3).move_to([3.4, -0.9, 0])
        self.go("14:02.70", FadeIn(ax[0], shift=UP * 0.1), FadeIn(bx[0], shift=UP * 0.1), run=0.5)
        self.go("14:03.30", Write(ax[1]), Write(bx[1]), run=0.7)
        nz = M(r"x-1 \neq 0", size=64, color=GRN).move_to([0, -2.75, 0])
        self.go("14:05.26", Write(nz), run=0.6)
        tk = tick_mark(s=0.5).next_to(nz, RIGHT, buff=0.5)
        self.go("14:07.06", Create(tk), run=0.4)
        dl.clear_updaters(); dr.clear_updaters()
        self.wipe("14:08.38", run=0.4)

        # the cancelled function and the original, side by side
        def board(cx):
            a = Axes(x_range=[-1, 3, 1], y_range=[-1, 4, 1], x_length=5.0, y_length=4.0,
                     axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, include_numbers=False))
            a.shift(np.array([cx, -1.05, 0]) - a.get_center())
            n = VGroup(*[M(str(k), size=34, color=DIM).next_to(a.c2p(k, 0), DOWN, buff=0.12) for k in (1, 2)],
                       *[M(str(k), size=34, color=DIM).next_to(a.c2p(0, k), LEFT, buff=0.12) for k in (2, 3)],
                       M("x", size=38, color=DIM).next_to(a.x_axis.get_end(), DOWN, buff=0.12),
                       M("y", size=38, color=DIM).next_to(a.y_axis.get_end(), RIGHT, buff=0.12))
            return a, n
        A, An = board(-3.4)
        B, Bn = board(3.4)
        ca = A.plot(lambda x: x + 1, x_range=[-0.9, 2.8], color=BLUE, stroke_width=6)
        cb = VGroup(B.plot(lambda x: x + 1, x_range=[-0.9, 0.96], color=BLUE, stroke_width=6),
                    B.plot(lambda x: x + 1, x_range=[1.04, 2.8], color=BLUE, stroke_width=6))
        hb = Circle(radius=0.11, stroke_color=BLUE, stroke_width=5, fill_color=BOARDC, fill_opacity=1).move_to(B.c2p(1, 2)).set_z_index(3)
        la = M("y=x+1", size=56, color=BLUE).move_to([-3.4, 1.75, 0])
        lb = M("y=", r"\frac{x^2-1}{x-1}", size=56, color=BLUE).move_to([3.4, 1.75, 0])
        self.go("14:08.94", Create(A), FadeIn(An), Create(ca), Write(la), run=1.0)
        self.go("14:10.14", Create(B), FadeIn(Bn), Create(cb), FadeIn(hb), Write(lb), run=1.0)
        da = DashedLine(A.c2p(1, 0), A.c2p(1, 2), color=YEL, stroke_width=3)
        db = DashedLine(B.c2p(1, 0), B.c2p(1, 1.88), color=YEL, stroke_width=3)
        pa = Dot(A.c2p(1, 2), radius=0.1, color=YEL).set_z_index(3)
        ha = DashedLine(A.c2p(0, 2), A.c2p(1, 2), color=YEL, stroke_width=3)
        hb2 = DashedLine(B.c2p(0, 2), B.c2p(0.88, 2), color=YEL, stroke_width=3)
        self.go("14:11.36", Create(da), Create(db), Create(ha), Create(hb2), FadeIn(pa), run=0.6)
        ring = Circle(radius=0.3, color=YEL, stroke_width=4).move_to(hb)
        self.go("14:14.32", Create(ring), run=0.5)
        self.wipe("14:15.30", run=0.4)


class K05_Factor2(Shot):
    def body(self):
        self.title("Why Can We Cancel?", animate=False)
        self.title("Key 1: Factoring", "14:16.10")
        eqx = -3.0
        L1 = on_eq(frow(["=", lim("3")], "(x-3)(x+3)", "x-3", f1="(x-3)"), Y[1], eqx)
        L0 = first_row(frow([lim("3")], "x^2-9", "x-3"), Y[0], L1[1].get_left()[0])
        L2 = on_eq(M("=", lim("3"), "(x+3)", size=66), Y[2], eqx)
        L3 = on_eq(M("=", "3+3", "=", "6", size=66), Y[3], eqx)
        L3[1].set_color(ORG); L3[3].set_color(ORG)

        self.go("14:17.16", Write(L0[0]), run=0.8)
        self.go("14:19.48", Write(L0.num), run=0.7)
        self.go("14:20.82", Create(L0.bar), run=0.3)
        self.go("14:21.48", Write(L0.den), run=0.6)
        cx = (L0.get_right()[0] + 6.7) / 2
        lab = TX(r"plug in $x=3$", 40, DIM).move_to([cx, Y[0] + 0.55, 0])
        pl = M(r"\frac{9-9}{3-3}", "=", r"\frac{0}{0}", size=60).move_to([cx, Y[0] - 0.4, 0])
        pl[2].set_color(YEL)
        self.go("14:22.92", FadeIn(lab, shift=UP * 0.1), run=0.4)
        self.go("14:23.62", Write(pl[0]), run=1.2)
        self.go("14:26.76", Write(pl[1:3]), run=0.6)
        ul = under(L0.num)
        self.go("14:28.26", FadeOut(lab), FadeOut(pl), Create(ul), run=0.5)
        self.go("14:29.68", FadeOut(ul), Write(VGroup(L1[0], L1[1], L1.bar, L1.den, L1.f1)), run=0.8)
        self.go("14:31.20", Write(L1.f2), run=0.6)
        self.go("14:33.00", Create(strike(L1.f1)), Create(strike(L1.den)), run=0.6)
        self.go("14:34.48", Write(L2[0:2]), run=0.6)
        self.go("14:35.24", TransformFromCopy(L1.f2, L2[2]), run=0.6)
        self.go("14:36.78", Write(L3[0:2]), run=0.7)
        self.go("14:37.80", Write(L3[2:4]), run=0.4)
        self.go("14:38.22", Create(box(L3[3], GRN, buff=0.15)), run=0.4)
        self.wipe("14:38.95", run=0.4)


class K05_Factor3(Shot):
    def body(self):
        self.title("Key 1: Factoring", animate=False)
        eqx = -3.6
        L1 = on_eq(frow(["=", lim("-2")], "(x+2)(x+3)", "x+2", f1="(x+2)"), Y[1], eqx)
        L0 = first_row(frow([lim("-2")], "x^2+5x+6", "x+2"), Y[0], L1[1].get_left()[0])
        L2 = on_eq(M("=", lim("-2"), "(x+3)", size=66), Y[2], eqx)
        L3 = on_eq(M("=", "-2+3", "=", "1", size=66), Y[3], eqx)
        L3[1].set_color(ORG); L3[3].set_color(ORG)

        self.go("14:39.88", Write(L0[0]), run=0.8)
        self.go("14:42.56", Write(L0.num), run=1.0)
        self.go("14:44.74", Create(L0.bar), run=0.3)
        self.go("14:45.42", Write(L0.den), run=0.5)
        cx = (L0.get_right()[0] + 6.7) / 2
        t = VGroup(H("top", 36, DIM), M("4-10+6", "=", "0", size=52))
        b = VGroup(H("bottom", 36, DIM), M("-2+2", "=", "0", size=52))
        for row, y in ((t, 2.0), (b, 1.1)):
            row[0].move_to([cx - 1.25, y, 0], aligned_edge=RIGHT)
            row[1].move_to([cx - 1.0, y, 0], aligned_edge=LEFT)
            row[1][2].set_color(YEL)
        zz = zero_over_zero().move_to([cx + 0.2, -0.1, 0])
        self.go("14:47.38", FadeIn(t[0]), Write(t[1][0]), run=1.0)
        self.go("14:49.50", Write(t[1][1:]), run=0.4)
        self.go("14:50.66", FadeIn(b[0]), Write(b[1][0]), run=0.8)
        self.go("14:51.82", Write(b[1][1:]), run=0.4)
        self.go("14:53.00", Write(zz), run=0.6)
        ul = under(L0.num)
        self.go("14:54.48", FadeOut(t), FadeOut(b), FadeOut(zz), Create(ul), run=0.5)
        q1 = M(r"\text{?}", r"\times", r"\text{?}", "=", "6", size=60).move_to([cx, 1.9, 0])
        q2 = M(r"\text{?}", "+", r"\text{?}", "=", "5", size=60).move_to([cx, 0.95, 0])
        q2.shift(RIGHT * (q1[3].get_x() - q2[3].get_x()))
        for q in (q1, q2):
            q[0].set_color(DIM); q[2].set_color(DIM)
        self.go("14:57.32", Write(q1), run=0.6)
        self.go("14:58.06", Write(q2), run=0.6)
        n2 = [M("2", size=60, color=ORG).move_to(q[0]) for q in (q1, q2)]
        n3 = [M("3", size=60, color=ORG).move_to(q[2]) for q in (q1, q2)]
        self.go("14:59.46", *[ReplacementTransform(q[0], n) for q, n in zip((q1, q2), n2)], run=0.4)
        self.go("14:59.78", *[ReplacementTransform(q[2], n) for q, n in zip((q1, q2), n3)], run=0.4)
        self.go("15:00.80", FadeOut(ul), Write(VGroup(L1[0], L1[1], L1.bar, L1.den, L1.f1)), run=0.8)
        self.go("15:02.34", Write(L1.f2), run=0.6)
        self.go("15:03.66", FadeOut(VGroup(q1, q2, *n2, *n3)), run=0.4)
        self.go("15:04.22", Create(strike(L1.f1)), Create(strike(L1.den)), run=0.6)
        self.go("15:05.62", Write(L2[0:2]), run=0.6)
        self.go("15:06.30", TransformFromCopy(L1.f2, L2[2]), run=0.6)
        self.go("15:07.82", Write(L3[0:2]), run=0.7)
        self.go("15:09.62", Write(L3[2:4]), run=0.3)
        self.go("15:09.95", Create(box(L3[3], GRN, buff=0.15)), run=0.35)
        self.wipe("15:10.50", run=0.4)


class K05_Cubes(Shot):
    def body(self):
        self.title("Key 1: Factoring", animate=False)
        self.title("A Harder One", "15:11.08")
        eqx = -4.2
        L1 = on_eq(frow(["=", lim("2")], "(x-2)(x^2+2x+4)", "x-2", f1="(x-2)"), Y[1], eqx)
        L0 = first_row(frow([lim("2")], "x^3-8", "x-2"), Y[0], L1[1].get_left()[0])
        L2 = on_eq(M("=", lim("2"), "(x^2+2x+4)", size=66), Y[2], eqx)
        L3 = on_eq(M("=", "4+4+4", "=", "12", size=66), Y[3], eqx)
        L3[1].set_color(ORG); L3[3].set_color(ORG)

        self.go("15:12.58", Write(L0[0]), run=0.8)
        self.go("15:14.84", Write(L0.num), run=0.7)
        self.go("15:16.20", Create(L0.bar), run=0.3)
        self.go("15:16.94", Write(L0.den), run=0.5)
        cx = (L0.get_right()[0] + 6.7) / 2
        lab, zz, ch = plug_group(r"plug in $x=2$", cx)
        self.go("15:18.34", FadeIn(lab, shift=UP * 0.1), Write(zz), run=0.7)
        self.go("15:19.10", Create(ch), run=0.7)
        ul = under(L0.num)
        self.go("15:20.94", FadeOut(lab), FadeOut(zz), FadeOut(ch), Create(ul), run=0.5)
        dc = H("difference of cubes", 42, YEL).move_to([cx, Y[0], 0])
        self.go("15:21.80", Write(dc), run=0.8)
        # the pattern panel along the bottom
        pat = M("a^3-b^3", "=", "(a-b)", "(a^2+ab+b^2)", size=54).move_to([0, -3.15, 0])
        fr = panel(pat, PURP, buff=0.3)
        self.go("15:23.62", Create(fr), run=0.6)
        self.go("15:25.00", Write(pat[0]), run=0.9)
        self.go("15:26.94", Write(pat[1:3]), run=0.7)
        self.go("15:28.74", Write(pat[3]), run=1.0)
        x8 = M("x^3-8", "=", "x^3-2^3", size=56).move_to([cx, Y[0], 0])
        x8[2].set_color(ORG)
        self.go("15:31.80", FadeOut(dc), FadeOut(ul), Write(x8), run=0.8)
        self.go("15:33.46", Write(VGroup(L1[0], L1[1], L1.bar, L1.den)), run=0.5)
        self.go("15:33.96", Write(L1.f1), run=0.6)
        self.go("15:35.64", Write(L1.f2), run=1.0)
        self.go("15:37.96", Create(strike(L1.f1)), Create(strike(L1.den)), run=0.6)
        self.go("15:39.00", Write(L2[0:2]), run=0.5)
        self.go("15:39.50", TransformFromCopy(L1.f2, L2[2]), run=0.7)
        self.go("15:40.48", FadeOut(fr), FadeOut(pat), run=0.4)
        self.go("15:41.70", Write(L3[0:2]), run=0.8)
        self.go("15:43.50", Write(L3[2:4]), run=0.4)
        self.go("15:43.92", Create(box(L3[3], GRN, buff=0.15)), run=0.4)
