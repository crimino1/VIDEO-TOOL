"""Builder 07: Chapter 10, Sum, Difference and Double Angle Formulas (30:49.10 - 35:10.22)."""
from common import *



def W(*parts, run=0.8):
    """Write a few parts of a MathTex."""
    return [Write(p, run_time=run) for p in parts]


def pause_icon(color=YEL, r=0.55):
    c = Circle(radius=r, color=color, stroke_width=5)
    bars = VGroup(*[RoundedRectangle(width=r * 0.22, height=r * 0.9, corner_radius=0.04, fill_color=color, fill_opacity=1, stroke_width=0) for _ in range(2)]).arrange(RIGHT, buff=r * 0.22)
    return VGroup(c, bars)


class K07_Trap(Shot):
    def body(self):
        self.title("Sum & Difference", "30:53.40")
        q = M(r"\sin 30^\circ", "+", r"\sin 45^\circ", r"\overset{?}{=}", r"\sin 75^\circ", size=80).move_to([0, 0.2, 0])
        q[0].set_color(PINK); q[2].set_color(PINK); q[4].set_color(PINK); q[3].set_color(YEL)
        self.go("30:54.90", Write(q[0]), run=0.7)
        self.go("30:55.82", Write(q[1]), Write(q[2]), run=0.7)
        self.go("30:57.10", Write(q[3]), Write(q[4]), run=0.8)
        big = H("?", 150, YEL).next_to(q, RIGHT, buff=0.4)
        self.go("30:58.30", FadeIn(big, scale=1.6), run=0.4)
        self.play(Wiggle(big), run_time=0.6)


class K07_NotLinear(Shot):
    def body(self):
        self.title("Sum & Difference", animate=False)
        rule = M(r"\sin(a+b)", r"\neq", r"\sin a", "+", r"\sin b", size=76).move_to([0, 1.2, 0])
        rule[1].set_color(RED)
        self.go("31:02.64", Write(rule[0]), run=0.7)
        self.go("31:03.94", Write(rule[1]), run=0.4)
        self.go("31:04.44", Write(rule[2]), Write(rule[3]), Write(rule[4]), run=0.9)
        lhs = M(r"0.5", "+", r"0.707", "=", r"1.207", size=54, color=DIM).move_to([-3.4, -0.9, 0])
        rhs = M(r"\sin 75^\circ", r"\approx", r"0.966", size=54, color=DIM).move_to([3.4, -0.9, 0])
        x = cross_mark(RED, 0.3).move_to([0, -0.9, 0])
        self.play(FadeIn(lhs, shift=UP * 0.2), FadeIn(rhs, shift=UP * 0.2), run_time=0.5)
        self.play(GrowFromCenter(x), run_time=0.3)
        warn = H("Many students lose marks right here!", 46, RED).move_to([0, -2.6, 0])
        self.go("31:06.56", Write(warn), run=1.0)
        self.play(Circumscribe(rule, color=RED, run_time=1.0))


class K07_SumDiff(Shot):
    def body(self):
        self.title("Sum & Difference Formulas", "31:09.06")
        sz = 54
        rows = [
            M(r"\sin(a", "+", "b)", "=", r"\sin a\cos b", "+", r"\cos a\sin b", size=sz),
            M(r"\sin(a", "-", "b)", "=", r"\sin a\cos b", "-", r"\cos a\sin b", size=sz),
            M(r"\cos(a", "+", "b)", "=", r"\cos a\cos b", "-", r"\sin a\sin b", size=sz),
            M(r"\cos(a", "-", "b)", "=", r"\cos a\cos b", "+", r"\sin a\sin b", size=sz),
        ]
        tanr = M(r"\tan(a+b)", "=", r"\frac{\tan a+\tan b}{1-\tan a\tan b}", size=sz)
        g = VGroup(*rows, tanr).arrange(DOWN, aligned_edge=LEFT, buff=0.32).move_to([-1.4, -0.65, 0])
        for r, c in zip(rows, [PINK, PINK, BLUE, BLUE]):
            VGroup(r[0], r[1], r[2]).set_color(c)
        tanr[0].set_color(GRN)
        times = [("31:11.30", "31:13.34", "31:15.78"), ("31:17.76", "31:19.76", "31:23.10"),
                 ("31:25.42", "31:27.06", "31:29.74"), ("31:31.92", "31:33.48", "31:35.98")]
        for r, (a, b, c) in zip(rows, times):
            self.go(a, *W(r[0], r[1], r[2], run=0.7))
            self.go(b, *W(r[3], r[4], run=0.8))
            self.go(c, *W(r[5], r[6], run=0.8))
        # notice something sneaky: sine keeps the sign, cosine flips it
        same = H("same sign", 40, GRN).move_to([5.45, VGroup(rows[0], rows[1]).get_center()[1], 0])
        flip = H("sign flips!", 42, ORG).move_to([5.45, VGroup(rows[2], rows[3]).get_center()[1], 0])
        self.go("31:37.88", *[Indicate(VGroup(r[1], r[5]), color=GRN, scale_factor=1.3) for r in rows[:2]], FadeIn(same), run=0.9)
        bx3 = VGroup(box(rows[2][1], ORG, 0.06), box(rows[2][5], ORG, 0.06))
        self.go("31:41.84", Create(bx3), FadeIn(flip), run=0.6)
        bx4 = VGroup(box(rows[3][1], ORG, 0.06), box(rows[3][5], ORG, 0.06))
        self.go("31:44.30", Create(bx4), run=0.6)
        self.go("31:46.50", Write(tanr[0]), run=0.6)
        self.go("31:47.84", Write(tanr[1]), Write(tanr[2]), run=1.4)
        self.play(Create(panel(g, PURP, 0.25)), run_time=0.8)


class K07_Sin75(Shot):
    def body(self):
        self.title("Exact value of sin 75°", "31:54.38")
        sz = 50
        s1 = M(r"\sin 75^\circ", "=", r"\sin(45^\circ+30^\circ)", size=sz)
        s2 = M("=", r"\sin 45^\circ\cos 30^\circ", "+", r"\cos 45^\circ\sin 30^\circ", size=sz)
        s3 = M("=", r"\frac{\sqrt{2}}{2}\cdot\frac{\sqrt{3}}{2}", "+", r"\frac{\sqrt{2}}{2}\cdot\frac{1}{2}", size=sz)
        s4 = M("=", r"\frac{\sqrt{6}}{4}", "+", r"\frac{\sqrt{2}}{4}", size=sz)
        g = VGroup(s1, s2, s3, s4).arrange(DOWN, aligned_edge=LEFT, buff=0.38).move_to([-2.2, -0.45, 0])
        for s in (s2, s3, s4):
            s.shift(RIGHT * (s1[1].get_x() - s[0].get_x()))
        s1[0].set_color(PINK)
        self.go("31:57.12", Write(s1[0]), run=0.6)
        self.go("31:58.80", Write(s1[1]), Write(s1[2]), run=0.9)
        self.go("32:00.26", Write(s2[0]), Write(s2[1]), run=1.0)
        self.go("32:03.42", Write(s2[2]), Write(s2[3]), run=1.0)
        self.go("32:07.00", Write(s3[0]), Write(s3[1]), run=1.0)
        self.go("32:09.42", Write(s3[2]), Write(s3[3]), run=1.0)
        self.go("32:12.10", Write(s4[0]), Write(s4[1]), run=0.8)
        self.go("32:13.72", Write(s4[2]), Write(s4[3]), run=0.8)
        arrow = M(r"\Rightarrow", size=60, color=YEL).next_to(s4, RIGHT, buff=0.5)
        res = M(r"\sin 75^\circ", "=", r"\frac{\sqrt{6}+\sqrt{2}}{4}", size=58).next_to(arrow, RIGHT, buff=0.5)
        res[0].set_color(PINK)
        self.go("32:15.80", FadeIn(arrow), Write(res), run=1.2)
        self.go("32:20.44", Create(box(res, GRN, 0.2)), run=0.6)
        note = H("exact — no calculator!", 44, YEL).next_to(res, DOWN, buff=0.4)
        self.go("32:21.46", Write(note), run=0.9)


class K07_Double(Shot):
    def body(self):
        self.title("Sum & Difference Formulas", animate=False)
        same = M("a", "=", "b", "=", r"\theta", size=72, color=YEL).move_to([0, 0.6, 0])
        self.go("32:26.94", Write(same[0]), Write(same[1]), Write(same[2]), run=0.7)
        self.go("32:27.82", Write(same[3]), Write(same[4]), run=0.5)
        self.title("Double Angle Formulas", "32:29.28")
        sz = 50
        d1 = M(r"\sin 2\theta", "=", r"2\sin\theta\cos\theta", size=sz)
        d2 = M(r"\cos 2\theta", "=", r"\cos^2\theta-\sin^2\theta", size=sz)
        d3 = M("=", r"2\cos^2\theta-1", size=sz)
        d4 = M("=", r"1-2\sin^2\theta", size=sz)
        d5 = M(r"\tan 2\theta", "=", r"\frac{2\tan\theta}{1-\tan^2\theta}", size=sz)
        g = VGroup(d1, d2, d3, d4, d5).arrange(DOWN, aligned_edge=LEFT, buff=0.32).move_to([-1.8, -0.7, 0])
        for d in (d2, d3, d4, d5):
            d.shift(RIGHT * (d1[1].get_x() - d[(1 if d not in (d3, d4) else 0)].get_x()))
        d1[0].set_color(PINK); d2[0].set_color(BLUE); d5[0].set_color(GRN)
        self.play(same.animate.scale(0.5).to_corner(UR, buff=0.4).shift(DOWN * 1.1), run_time=0.5)
        self.go("32:30.82", Write(d1[0]), run=0.6)
        self.go("32:32.44", Write(d1[1]), Write(d1[2]), run=0.9)
        self.go("32:34.82", Write(d2[0]), run=0.6)
        self.go("32:36.52", Write(d2[1]), Write(d2[2]), run=1.0)
        pyth = M(r"\sin^2\theta+\cos^2\theta=1", size=36, color=DIM).move_to([4.6, d2.get_y() - 0.5, 0])
        self.go("32:40.84", FadeIn(pyth, shift=LEFT * 0.2), run=0.5)
        self.go("32:43.96", Write(d3), run=0.9)
        self.go("32:46.88", Write(d4), run=0.9)
        br = Brace(VGroup(d2[2], d3, d4), RIGHT, color=PURP)
        three = H("3 versions!", 44, PURP).next_to(br, RIGHT, buff=0.2)
        self.go("32:48.76", GrowFromCenter(br), FadeOut(pyth), Write(three), run=0.7)
        self.go("32:52.02", Write(d5[0]), run=0.6)
        self.go("32:53.84", Write(d5[1]), Write(d5[2]), run=1.3)


class K07_DoubleEx(Shot):
    def body(self):
        self.title("Example", "32:58.50")
        given = M(r"\sin\theta", "=", r"\frac{3}{5}", ",", r"\ \theta\text{ in Quadrant I}", size=52).move_to([-2.6, 1.55, 0])
        given[0].set_color(PINK)
        self.go("33:00.62", Write(given[0]), Write(given[1]), Write(given[2]), run=0.8)
        self.go("33:03.20", Write(given[3]), Write(given[4]), run=0.8)
        t = right_triangle(b=2.4, h=1.8, origin=(3.6, -0.4, 0))
        A, B, C = t["A"], t["B"], t["C"]
        tri = VGroup(t["tri"], t["mark"], angle_arc(A, B, C, r=0.5, label=r"\theta", label_size=40),
                     side_label(B, C, "3", PINK, 42, side=-1), side_label(A, C, "5", GRN, 42, side=1))
        adj = side_label(A, B, "4", BLUE, 42, side=-1)
        self.go("33:04.34", Create(tri), run=0.6)
        cos = M(r"\cos\theta", "=", r"\frac{4}{5}", size=52).next_to(given, DOWN, buff=0.45, aligned_edge=LEFT)
        cos[0].set_color(BLUE)
        self.go("33:04.92", Write(cos), FadeIn(adj, scale=1.4), run=0.8)
        s2 = M(r"\sin 2\theta", "=", r"2\cdot\frac{3}{5}\cdot\frac{4}{5}", "=", r"\frac{24}{25}", size=52).next_to(cos, DOWN, buff=0.5, aligned_edge=LEFT)
        s2[0].set_color(PINK)
        self.go("33:07.16", Write(s2[0]), run=0.6)
        self.go("33:08.62", Write(s2[1]), Write(s2[2]), run=1.2)
        self.go("33:11.64", Write(s2[3]), Write(s2[4]), run=0.7)
        c2 = M(r"\cos 2\theta", "=", r"\frac{16}{25}-\frac{9}{25}", "=", r"\frac{7}{25}", size=52).next_to(s2, DOWN, buff=0.5, aligned_edge=LEFT)
        c2[0].set_color(BLUE)
        self.go("33:13.54", Write(c2[0]), run=0.6)
        self.go("33:15.74", Write(c2[1]), Write(c2[2]), run=1.3)
        self.go("33:18.86", Write(c2[3]), Write(c2[4]), run=0.6)
        self.play(Create(box(s2[4], GRN, 0.1)), Create(box(c2[4], GRN, 0.1)), run_time=0.5)


class K07_Half(Shot):
    def body(self):
        self.title("Double Angle Formulas", animate=False)
        src = M(r"\cos 2\theta = 1-2\sin^2\theta", size=50, color=DIM).move_to([-2.0, 0.6, 0])
        arr = Arrow(src.get_right(), src.get_right() + RIGHT * 1.8, color=YEL, buff=0.2)
        lab = H("rearrange", 40, YEL).next_to(arr, UP, buff=0.05)
        self.go("33:21.54", FadeIn(src), GrowArrow(arr), Write(lab), run=0.8)
        self.title("Half Angle Formulas", "33:24.00")
        self.play(FadeOut(VGroup(src, arr, lab)), run_time=0.3)
        sz = 50
        h1 = M(r"\sin\frac{\theta}{2}", "=", r"\pm", r"\sqrt{\frac{1-\cos\theta}{2}}", size=sz)
        h2 = M(r"\cos\frac{\theta}{2}", "=", r"\pm", r"\sqrt{\frac{1+\cos\theta}{2}}", size=sz)
        VGroup(h1, h2).arrange(RIGHT, buff=1.2).move_to([0, 1.0, 0])
        h1[0].set_color(PINK); h2[0].set_color(BLUE)
        self.go("33:25.54", Write(h1[0]), run=0.7)
        self.go("33:27.54", Write(h1[1]), Write(h1[2]), Write(h1[3]), run=1.6)
        self.go("33:32.46", Write(h2[0]), run=0.7)
        self.go("33:35.10", Write(h2[1]), Write(h2[2]), Write(h2[3]), run=1.6)
        bxs = VGroup(box(h1[2], YEL, 0.08), box(h2[2], YEL, 0.08))
        note = TX(r"sign depends on the quadrant of $\theta/2$", 40, YEL).next_to(VGroup(h1, h2), DOWN, buff=0.35)
        self.go("33:39.80", Create(bxs), Write(note), run=0.9)
        self.go("33:43.32", FadeOut(note), run=0.3)
        ex = M(r"\sin 22.5^\circ", "=", r"\sqrt{\frac{1-\frac{\sqrt{2}}{2}}{2}}", size=52).move_to([-2.4, -1.7, 0])
        ex[0].set_color(PINK)
        self.go("33:44.36", Write(ex[0]), run=0.7)
        half = M(r"22.5^\circ=\frac{45^\circ}{2}", size=40, color=DIM).next_to(ex, UP, buff=0.25, aligned_edge=LEFT)
        self.go("33:47.16", FadeIn(half, shift=DOWN * 0.15), run=0.5)
        self.go("33:48.96", Write(ex[1]), Write(ex[2]), run=1.6)
        res = M("=", r"\frac{\sqrt{2-\sqrt{2}}}{2}", size=56).next_to(ex, RIGHT, buff=0.35)
        self.go("33:53.14", Write(res), run=1.2)
        self.go("33:56.40", Create(box(res[1], GRN, 0.12)), run=0.5)


class K07_Power(Shot):
    def body(self):
        self.title("Power Reducing", "33:59.84")
        p1 = M(r"\sin^2 x", "=", r"\frac{1-\cos 2x}{2}", size=60)
        p2 = M(r"\cos^2 x", "=", r"\frac{1+\cos 2x}{2}", size=60)
        g = VGroup(p1, p2).arrange(DOWN, buff=0.6, aligned_edge=LEFT).move_to([-1.0, 0.0, 0])
        p1[0].set_color(PINK); p2[0].set_color(BLUE)
        self.go("34:01.38", Write(p1[0]), run=0.6)
        self.go("34:03.08", Write(p1[1]), Write(p1[2]), run=1.2)
        self.go("34:06.62", Write(p2[0]), run=0.6)
        self.go("34:08.30", Write(p2[1]), Write(p2[2]), run=1.2)
        pn = panel(g, PURP, 0.35)
        tip = TX(r"power 2 $\rightarrow$ power 1", 40, YEL).next_to(pn, RIGHT, buff=0.4)
        life = H("calculus lifesavers!", 46, GRN).next_to(pn, DOWN, buff=0.35)
        self.go("34:10.60", Create(pn), FadeIn(tip, shift=LEFT * 0.2), run=0.7)
        self.go("34:12.30", Write(life), run=0.9)


class K07_PracticeQ(Shot):
    def body(self):
        self.title("Practice", animate=False)
        n1 = pill("1", YEL, 40).move_to([-5.6, 1.2, 0])
        q1 = TX(r"Find the exact value of $\cos 15^\circ$", 52).next_to(n1, RIGHT, buff=0.4)
        self.go("34:16.74", FadeIn(n1, scale=1.3), Write(q1), run=1.0)
        n2 = pill("2", GRN, 40).move_to([-5.6, -0.4, 0])
        q2 = TX(r"If $\cos\theta=\frac{3}{5}$ and $\theta$ is in Quadrant I,", 52).next_to(n2, RIGHT, buff=0.4)
        q2b = TX(r"find $\cos 2\theta$", 52).next_to(q2, DOWN, buff=0.3, aligned_edge=LEFT)
        self.go("34:21.06", FadeIn(n2, scale=1.3), Write(q2), run=1.4)
        self.go("34:26.00", Write(q2b), run=0.8)
        pz = pause_icon().move_to([-1.2, -2.7, 0])
        pt = H("Pause now!", 52, YEL).next_to(pz, RIGHT, buff=0.35)
        self.go("34:28.00", FadeIn(pz, scale=1.5), Write(pt), run=0.6)


class K07_Ans1(Shot):
    def body(self):
        self.title("Answer 1", "34:29.30")
        sz = 52
        a1 = M(r"\cos 15^\circ", "=", r"\cos(45^\circ-30^\circ)", size=sz)
        a2 = M("=", r"\cos 45^\circ\cos 30^\circ", "+", r"\sin 45^\circ\sin 30^\circ", size=sz)
        a3 = M("=", r"\frac{\sqrt{6}}{4}", "+", r"\frac{\sqrt{2}}{4}", size=sz)
        g = VGroup(a1, a2, a3).arrange(DOWN, aligned_edge=LEFT, buff=0.42).move_to([-1.6, 0.2, 0])
        for a in (a2, a3):
            a.shift(RIGHT * (a1[1].get_x() - a[0].get_x()))
        a1[0].set_color(BLUE)
        self.go("34:30.36", Write(a1[0]), run=0.6)
        self.go("34:31.34", Write(a1[1]), Write(a1[2]), run=1.0)
        self.go("34:33.16", Write(a2[0]), Write(a2[1]), run=1.0)
        self.go("34:35.74", Write(a2[2]), Write(a2[3]), run=1.0)
        self.go("34:38.72", Write(a3[0]), Write(a3[1]), run=0.8)
        self.go("34:40.40", Write(a3[2]), Write(a3[3]), run=0.8)
        res = M(r"\cos 15^\circ", "=", r"\frac{\sqrt{6}+\sqrt{2}}{4}", size=60).move_to([0, -2.55, 0])
        res[0].set_color(BLUE)
        self.go("34:42.14", Write(res), run=1.2)
        self.play(Create(box(res, GRN, 0.18)), run_time=0.5)


class K07_Connect(Shot):
    def body(self):
        self.title("Everything connects", animate=False)
        eq = M(r"\cos 15^\circ", "=", r"\sin 75^\circ", size=66).move_to([-3.0, 1.2, 0])
        eq[0].set_color(BLUE); eq[2].set_color(PINK)
        self.play(Write(eq), run_time=0.6)
        add = M(r"15^\circ+75^\circ=90^\circ", size=54, color=YEL).next_to(eq, DOWN, buff=0.5)
        self.go("34:49.62", Write(add), run=0.9)
        # right triangle with 15° and 75°: the side next to 15° is the side across from 75°
        t = right_triangle(b=5.4, h=1.45, origin=(0.5, -1.0, 0))
        A, B, C = t["A"], t["B"], t["C"]
        a15 = angle_arc(A, B, C, r=1.1, label=r"15^\circ", label_size=34, label_buff=0.55)
        a75 = angle_arc(C, A, B, r=0.4, color=ORG, label=r"75^\circ", label_size=34)
        side = Line(A, B, color=BLUE, stroke_width=8)
        self.go("34:50.70", Create(t["tri"]), Create(t["mark"]), FadeIn(a15), FadeIn(a75), run=0.8)
        sl = H("next to 15° = across from 75°", 30, BLUE).next_to(side, DOWN, buff=0.15)
        self.play(Create(side), FadeIn(sl), run_time=0.5)
        co = M(r"\cos\theta", "=", r"\sin(90^\circ-\theta)", size=54).move_to([-3.0, -1.2, 0])
        co[0].set_color(BLUE); co[2].set_color(PINK)
        pn = panel(co, PURP, 0.25)
        self.go("34:52.44", Write(co), Create(pn), run=1.0)
        hl = H("everything connects!", 50, GRN).move_to([0, -3.2, 0])
        self.go("34:54.16", Write(hl), run=0.9)


class K07_Ans2(Shot):
    def body(self):
        self.title("Answer 2", "34:56.60")
        sz = 56
        b1 = M(r"\cos 2\theta", "=", r"2\cos^2\theta-1", size=sz)
        b2 = M("=", r"2\cdot\frac{9}{25}-1", size=sz)
        b3 = M("=", r"\frac{18}{25}", "-", r"\frac{25}{25}", size=sz)
        b4 = M("=", r"-\frac{7}{25}", size=sz)
        g = VGroup(b1, b2, b3, b4).arrange(DOWN, aligned_edge=LEFT, buff=0.36).move_to([-0.6, -0.55, 0])
        for b in (b2, b3, b4):
            b.shift(RIGHT * (b1[1].get_x() - b[0].get_x()))
        b1[0].set_color(BLUE)
        given = M(r"\cos\theta=\frac{3}{5}", size=42, color=DIM).move_to([4.6, 1.6, 0])
        self.add(given)
        self.go("34:57.38", Write(b1[0]), run=0.6)
        self.go("34:58.48", Write(b1[1]), Write(b1[2]), run=1.0)
        self.go("35:01.22", Write(b2), run=1.2)
        self.go("35:03.74", Write(b3[0]), Write(b3[1]), run=0.7)
        self.go("35:04.94", Write(b3[2]), Write(b3[3]), run=0.8)
        self.go("35:07.98", Write(b4), run=0.7)
        self.play(Create(box(b4[1], GRN, 0.12)), run_time=0.4)
