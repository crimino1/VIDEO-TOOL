"""Chapter 11 (solving trig equations) and Chapter 12 (inverse trig functions, the deep version)."""
from common import *

# the shared tex_cache races when parallel renders compile the same expression (WinError 32); one cache per scene


def dirv(a):
    return np.array([np.cos(a), np.sin(a), 0])


def pt(a, c, r, color=YEL, rad=0.1):
    return Dot(on_circle(a, r, c), radius=rad, color=color)


def ang_lab(a, c, r, tex, color=YEL, size=40, d=None):
    """Angle label beside its point on the circle, pushed diagonally away so it never sits on a dashed line."""
    if d is None:
        d = np.array([np.sign(np.cos(a)) or 1, np.sign(np.sin(a)) or 1, 0])
    return M(tex, size=size, color=color).next_to(on_circle(a, r, c), d, buff=0.12)


def hline(c, r, y, color=PINK):
    c = np.array(c, float)
    return DashedLine(c + [-r - 0.35, y * r, 0], c + [r + 0.35, y * r, 0], color=color, stroke_width=4, dash_length=0.15)


def vline(c, r, x, color=BLUE):
    c = np.array(c, float)
    return DashedLine(c + [x * r, -r - 0.35, 0], c + [x * r, r + 0.35, 0], color=color, stroke_width=4, dash_length=0.15)


def arc_hl(c, r, a0, da, color, width=11):
    return Arc(radius=r, start_angle=a0, angle=da, arc_center=np.array(c, float), color=color, stroke_width=width, stroke_opacity=0.85)


def col(*ms, x=-3.4, top=1.6, buff=0.45):
    """Stack maths lines left-aligned in a column."""
    g = VGroup(*ms).arrange(DOWN, aligned_edge=LEFT, buff=buff)
    g.move_to([x, 0, 0]).to_edge(UP, buff=0).shift(DOWN * (4.0 - top))
    return g


class K08_IdVsEq(Shot):
    def body(self):
        self.title("Identities vs. Equations", "35:14.30")
        p1 = pill("Identity", GRN, 44).move_to([-3.4, 1.4, 0])
        e1 = M(r"\sin^2 x+\cos^2 x=1", size=54).next_to(p1, DOWN, buff=0.55)
        n1 = H("true for EVERY angle", 40, GRN).next_to(e1, DOWN, buff=0.45)
        self.go("35:15.60", FadeIn(p1, shift=DOWN * 0.2), Write(e1), run=0.9)
        self.go("35:16.66", Write(n1), run=0.8)
        p2 = pill("Equation", PINK, 44).move_to([3.4, 1.4, 0])
        e2 = M(r"2\sin x-1=0", size=54).next_to(p2, DOWN, buff=0.55)
        n2 = H("true for SOME angles", 40, PINK).next_to(e2, DOWN, buff=0.45)
        div = DashedLine([0, 1.9, 0], [0, -2.6, 0], color=FAINT, stroke_width=3)
        self.go("35:18.54", Create(div), FadeIn(p2, shift=DOWN * 0.2), Write(e2), run=0.9)
        self.go("35:20.16", Write(n2), run=0.8)
        b = box(VGroup(p2, e2, n2), YEL, buff=0.3)
        job = H("our job: find them!", 46, YEL).move_to([3.4, -2.6, 0])
        self.go("35:21.60", Create(b), run=0.6)
        self.go("35:22.42", Write(job), run=0.7)


class K08_Simple(Shot):
    def body(self):
        self.title("Let's Start Simple", "35:23.48")
        e1 = M(r"2\sin x-1=0", size=58)
        rng = M(r"0\le x<2\pi", size=40, color=DIM)
        e2 = M(r"2\sin x=1", size=58)
        e3 = M(r"\sin x=\tfrac{1}{2}", size=58)
        g = col(e1, e2, e3, x=-3.6, top=1.75, buff=0.5)
        rng.next_to(e1, RIGHT, buff=0.5)
        self.go("35:24.90", Write(e1), run=1.6)
        self.go("35:27.58", FadeIn(rng, shift=LEFT * 0.2), run=0.6)
        self.go("35:30.34", TransformFromCopy(e1, e2), run=0.8)
        self.go("35:31.50", TransformFromCopy(e2, e3), run=0.8)
        b3 = box(e3, YEL)
        self.go("35:33.84", Create(b3), run=0.5)
        # unit circle on the right
        c, r = np.array([3.5, -0.55, 0]), 2.2
        uc = unit_circle(r, c, axis_len=2.85, ticks=False)
        self.go("35:34.48", Create(uc), run=0.9)
        hl = hline(c, r, 0.5)
        hl_lab = M(r"y=\tfrac12", size=40, color=PINK).move_to(c + [-0.75, 0.5 * r + 0.38, 0])
        self.go("35:35.54", Create(hl), FadeIn(hl_lab), run=0.7)
        q1 = H("I", 44, GRN).move_to(c + [r * 0.75, r * 0.85, 0])
        q2 = H("II", 44, GRN).move_to(c + [-r * 0.75, r * 0.85, 0])
        self.go("35:38.62", FadeIn(q1, scale=1.4), run=0.4)
        self.go("35:39.32", FadeIn(q2, scale=1.4), run=0.4)
        a1, a2 = PI / 6, 5 * PI / 6
        rad1 = seg(c, on_circle(a1, r, c), YEL, 4)
        arc1 = angle_arc(c, c + RIGHT, on_circle(a1, r, c), r=0.75, color=YEL)
        l_ref = M(r"\frac{\pi}{6}", size=36, color=YEL).move_to(c + 1.15 * dirv(a1 / 2))
        self.go("35:39.72", Create(rad1), Create(arc1), run=0.7)
        self.go("35:41.10", FadeIn(l_ref), run=0.4)
        d1 = pt(a1, c, r, PINK, 0.12)
        e4 = M(r"x=\frac{\pi}{6}", size=54)
        e5 = M(r"x=\pi-\frac{\pi}{6}", size=54)
        e5b = M(r"x=\frac{5\pi}{6}", size=54)
        VGroup(e4, e5).arrange(RIGHT, buff=0.7).next_to(e3, DOWN, buff=0.55, aligned_edge=LEFT)
        e5b.move_to(e5, aligned_edge=LEFT)
        self.go("35:42.72", FadeIn(d1, scale=2), Write(e4), run=0.7)
        rad2 = seg(c, on_circle(a2, r, c), ORG, 4)
        d2 = pt(a2, c, r, PINK, 0.12)
        self.go("35:44.84", Create(rad2), FadeIn(d2, scale=2), Write(e5), run=0.8)
        l1 = ang_lab(a1, c, r, r"\frac{\pi}{6}", PINK, 38)
        l2 = ang_lab(a2, c, r, r"\frac{5\pi}{6}", PINK, 38)
        self.go("35:47.82", TransformMatchingTex(e5, e5b), FadeIn(l1), FadeIn(l2), run=0.7)
        # sine repeats every 2π: a dot does a full lap
        tr = ValueTracker(a1)
        run_dot = always_redraw(lambda: Dot(on_circle(tr.get_value(), r, c), radius=0.13, color=ORG))
        lap = M(r"+2\pi", size=48, color=ORG).move_to(c + [0, -r - 0.65, 0])
        self.go("35:50.66", FadeIn(run_dot), FadeIn(lap), run=0.3)
        self.play(tr.animate.set_value(a1 + TAU), run_time=1.8, rate_func=smooth)
        self.play(FadeOut(run_dot), run_time=0.2)
        inf = H("infinitely many!", 44, ORG).move_to([-3.6, -2.15, 0])
        self.go("35:55.70", Write(inf), run=0.8)
        # general solution
        old = VGroup(e1, rng, e2, e3, b3, e4, e5b, inf, lap)
        g1 = M(r"x=\frac{\pi}{6}+2k\pi", size=56)
        g2 = M(r"x=\frac{5\pi}{6}+2k\pi", size=56)
        kk = H("k = any integer", 40, DIM)
        gg = col(g1, g2, kk, x=-3.6, top=1.2, buff=0.5)
        pg = pill("General solution", GRN, 40).next_to(gg, UP, buff=0.4).align_to(gg, LEFT)
        self.go("35:58.12", FadeOut(old), FadeIn(pg, shift=DOWN * 0.2), run=0.6)
        self.go("35:59.48", Write(g1), run=1.2)
        self.go("36:02.08", Write(g2), run=1.2)
        self.go("36:05.12", FadeIn(kk), Create(panel(VGroup(g1, g2, kk), GRN, buff=0.3)), run=0.6)


class K08_Quad1(Shot):
    def body(self):
        self.title("Now a Harder One", "36:06.34")
        e = M(r"2\sin^2 x-\sin x-1=0", size=72)
        self.go("36:07.98", Write(e), run=3.0)
        self.go("36:11.80", Circumscribe(e, color=ORG, run_time=1.2))


class K08_Quad2(Shot):
    def body(self):
        self.title("A Quadratic in Disguise", "36:15.26")
        e = M("2", r"\sin^2 x", "-", r"\sin x", "-1=0", size=60).move_to([0, 1.55, 0])
        self.add(e)
        sub = M(r"u=\sin x", size=50, color=YEL).move_to([4.6, 1.55, 0])
        self.go("36:17.42", e[0:].animate.shift(LEFT * 1.6), run=0.5)
        self.go("36:18.62", e[1].animate.set_color(YEL), e[3].animate.set_color(YEL), FadeIn(sub, shift=LEFT * 0.3), run=0.6)
        q = M(r"2u^2-u-1=0", size=60).move_to([-1.6, 0.45, 0])
        self.go("36:21.48", TransformFromCopy(e, q), run=0.9)
        f = M(r"(2u+1)(u-1)=0", size=60).move_to([-1.6, -0.65, 0])
        self.go("36:25.00", Write(f), run=1.4)
        s1 = M(r"\sin x=-\tfrac12", size=56, color=PINK)
        s2 = M(r"\sin x=1", size=56, color=BLUE)
        orr = H("or", 40, DIM)
        sg = VGroup(s1, orr, s2).arrange(RIGHT, buff=0.6).move_to([-1.6, -1.85, 0])
        self.go("36:30.88", Write(s1), run=0.9)
        self.go("36:32.90", FadeIn(orr), run=0.3)
        self.go("36:33.54", Write(s2), run=0.7)
        # move algebra left, bring the circle in
        alg = VGroup(e, q, f, sg)
        self.go("36:34.80", FadeOut(sub), alg.animate.scale(0.72).to_edge(LEFT, buff=0.6), run=0.8)
        c, r = np.array([3.6, -0.6, 0]), 2.15
        uc = unit_circle(r, c, axis_len=2.8, ticks=False)
        self.play(Create(uc), run_time=0.7)
        dtop = pt(PI / 2, c, r, BLUE, 0.13)
        ltop = M(r"\frac{\pi}{2}", size=38, color=BLUE).next_to(dtop, UR, buff=0.08)
        self.go("36:36.66", FadeIn(dtop, scale=2), FadeIn(ltop), run=0.5)
        hl = hline(c, r, -0.5)
        self.go("36:38.92", Create(hl), run=0.7)
        q3 = H("III", 40, PINK).move_to(c + [-r * 0.78, -r * 0.88, 0])
        q4 = H("IV", 40, PINK).move_to(c + [r * 0.78, -r * 0.88, 0])
        self.go("36:41.30", FadeIn(q3, scale=1.4), run=0.3)
        self.go("36:41.90", FadeIn(q4, scale=1.4), run=0.3)
        a3, a4 = 7 * PI / 6, 11 * PI / 6
        ref = angle_arc(c, c + LEFT, on_circle(a3, r, c), r=0.7, color=YEL)
        lref = M(r"\frac{\pi}{6}", size=34, color=YEL).move_to(c + 1.1 * dirv(PI + PI / 12))
        self.go("36:42.90", Create(seg(c, on_circle(a3, r, c), YEL, 3)), Create(ref), FadeIn(lref), run=0.7)
        d3, d4 = pt(a3, c, r, PINK, 0.13), pt(a4, c, r, PINK, 0.13)
        l3 = ang_lab(a3, c, r, r"\frac{7\pi}{6}", PINK, 38)
        l4 = ang_lab(a4, c, r, r"\frac{11\pi}{6}", PINK, 38)
        self.go("36:45.56", FadeIn(d3, scale=2), FadeIn(l3), run=0.5)
        self.go("36:46.90", FadeIn(d4, scale=2), FadeIn(l4), run=0.5)
        ans = M(r"x=", r"\frac{\pi}{2}", ",\ ", r"\frac{7\pi}{6}", ",\ ", r"\frac{11\pi}{6}", size=54).move_to([-3.75, -3.1, 0])
        three = H("3 solutions", 40, GRN).next_to(ans, UP, buff=0.3)
        self.go("36:48.20", FadeIn(three), FadeIn(ans[0]), run=0.5)
        self.go("36:49.68", FadeIn(ans[1], scale=1.3), Indicate(dtop, color=GRN), run=0.6)
        self.go("36:51.16", FadeIn(ans[2:4], scale=1.3), Indicate(d3, color=GRN), run=0.6)
        self.go("36:53.38", FadeIn(ans[4:], scale=1.3), Indicate(d4, color=GRN), run=0.6)
        self.play(Create(box(ans, GRN, buff=0.15)), run_time=0.4)


class K08_TwoLaps(Shot):
    def body(self):
        self.title("Doubled Angle? Be Careful!", "36:55.68")
        e = M(r"\cos 2x=\tfrac12", size=60)
        rg = M(r"0\le x<2\pi", size=42, color=DIM)
        top = VGroup(e, rg).arrange(RIGHT, buff=0.55).move_to([-3.2, 1.6, 0])
        self.go("37:00.04", Write(e), run=1.1)
        self.go("37:02.12", FadeIn(rg), run=0.5)
        th = M(r"\text{unknown: } 2x", size=46, color=YEL).move_to([-3.2, 0.7, 0])
        self.go("37:04.82", Write(th), run=0.9)
        rr = M(r"0\le x<2\pi", r"\ \Rightarrow\ ", r"0\le 2x<", r"4\pi", size=48).move_to([-3.2, -0.25, 0])
        self.go("37:07.28", Write(rr[0]), run=0.7)
        self.go("37:09.66", Write(rr[1:]), run=0.9)
        self.go("37:11.08", rr[3].animate.set_color(ORG).scale(1.2), run=0.4)
        # circle with two laps
        c, r = np.array([3.7, -0.55, 0]), 2.1
        uc = unit_circle(r, c, axis_len=2.75, ticks=False)
        tr = ValueTracker(0)
        trail = always_redraw(lambda: Arc(radius=r + 0.18 + 0.16 * (tr.get_value() > TAU) * 0, start_angle=0, angle=max(1e-3, min(tr.get_value(), TAU)), arc_center=c, color=ORG, stroke_width=5))
        trail2 = always_redraw(lambda: Arc(radius=r + 0.36, start_angle=0, angle=max(1e-3, tr.get_value() - TAU), arc_center=c, color=ORG, stroke_width=5, stroke_opacity=1 if tr.get_value() > TAU else 0))
        dot = always_redraw(lambda: Dot(on_circle(tr.get_value(), r, c), radius=0.12, color=ORG))
        self.go("37:11.60", FadeIn(uc), run=0.4)
        lapl = H("2 full laps", 40, ORG).move_to(c + [0, -r - 0.75, 0])
        self.add(trail, trail2, dot)
        self.play(tr.animate.set_value(2 * TAU), FadeIn(lapl), run_time=1.25, rate_func=linear)
        self.remove(trail, trail2, dot)
        t1, t2 = Arc(radius=r + 0.18, start_angle=0, angle=TAU, arc_center=c, color=ORG, stroke_width=4, stroke_opacity=0.5), Arc(radius=r + 0.36, start_angle=0, angle=TAU, arc_center=c, color=ORG, stroke_width=4, stroke_opacity=0.5)
        self.add(t1, t2)
        vl = vline(c, r, 0.5)
        self.go("37:13.32", Create(vl), run=0.6)
        a1, a2 = PI / 3, 5 * PI / 3
        d1, d2 = pt(a1, c, r, BLUE, 0.13), pt(a2, c, r, BLUE, 0.13)
        l1 = M(r"\frac{\pi}{3}", size=38, color=BLUE).next_to(c + (r + 0.5) * dirv(a1), UR, buff=0.05)
        l2 = M(r"\frac{5\pi}{3}", size=38, color=BLUE).next_to(c + (r + 0.5) * dirv(a2), DR, buff=0.05)
        l1b = M(r"\frac{7\pi}{3}", size=36, color=ORG).next_to(l1, RIGHT, buff=0.2)
        l2b = M(r"\frac{11\pi}{3}", size=36, color=ORG).next_to(l2, RIGHT, buff=0.2)
        sol = M(r"2x=", r"\frac{\pi}{3}", ",\ ", r"\frac{5\pi}{3}", ",\ ", r"\frac{7\pi}{3}", ",\ ", r"\frac{11\pi}{3}", size=48).move_to([-3.2, -1.2, 0])
        sol[1].set_color(BLUE); sol[3].set_color(BLUE); sol[5].set_color(ORG); sol[7].set_color(ORG)
        self.go("37:15.24", FadeIn(sol[0]), FadeIn(d1, scale=2), FadeIn(l1), FadeIn(sol[1]), run=0.5)
        self.go("37:16.92", FadeIn(d2, scale=2), FadeIn(l2), FadeIn(sol[2:4]), run=0.5)
        add = M(r"+2\pi", size=40, color=ORG).move_to(c + [-r - 0.3, r + 0.1, 0])
        self.go("37:18.16", FadeIn(add, shift=DOWN * 0.2), Indicate(t2, color=ORG), run=0.6)
        self.go("37:19.50", FadeIn(l1b), FadeIn(sol[4:6]), run=0.5)
        self.go("37:21.18", FadeIn(l2b), FadeIn(sol[6:]), run=0.5)
        arr = Arrow(sol.get_bottom() + LEFT * 1.4, sol.get_bottom() + LEFT * 1.4 + DOWN * 0.5, buff=0.05, color=YEL, stroke_width=4, tip_length=0.18)
        div = M(r"\div 2", size=40, color=YEL).next_to(arr, LEFT, buff=0.15)
        xs = M(r"x=", r"\frac{\pi}{6}", ",\ ", r"\frac{5\pi}{6}", ",\ ", r"\frac{7\pi}{6}", ",\ ", r"\frac{11\pi}{6}", size=50).move_to([-3.2, -2.95, 0])
        self.go("37:23.14", GrowArrow(arr), FadeIn(div), run=0.5)
        self.go("37:24.36", FadeIn(xs[0]), run=0.3)
        self.go("37:25.68", FadeIn(xs[1], scale=1.3), run=0.4)
        self.go("37:26.66", FadeIn(xs[2:4], scale=1.3), run=0.4)
        self.go("37:28.38", FadeIn(xs[4:6], scale=1.3), run=0.4)
        self.go("37:30.74", FadeIn(xs[6:], scale=1.3), run=0.4)
        bx = box(xs, GRN, buff=0.15)
        four = H("4 solutions!", 40, GRN).next_to(bx, UP, buff=0.08, aligned_edge=RIGHT)
        self.go("37:32.00", Create(bx), FadeOut(lapl), run=0.5)
        self.go("37:32.84", Write(four), run=0.6)
        warn = H("forget lap 2 = lose half the answers", 32, RED).move_to([-3.4, 0.7, 0])
        self.go("37:33.44", FadeOut(th), run=0.3)
        self.play(Write(warn), run_time=0.9)
        self.go("37:34.88", Indicate(sol[5:], color=ORG, scale_factor=1.15), Indicate(xs[5:], color=ORG, scale_factor=1.15), run=1.0)
        tk = tick_mark(GRN, 0.7).next_to(warn, RIGHT, buff=0.3)
        self.go("37:38.62", Create(tk), run=0.5)


class K08_Practice(Shot):
    def body(self):
        self.title("Your Turn", "37:41.40")
        n1 = pill("1", YEL, 36)
        q1 = M(r"\tan x=\sqrt3,\quad 0\le x<2\pi", size=50)
        n2 = pill("2", YEL, 36)
        q2 = M(r"2\cos^2 x-1=0,\quad 0\le x<2\pi", size=50)
        r1 = VGroup(n1, q1).arrange(RIGHT, buff=0.35)
        r2 = VGroup(n2, q2).arrange(RIGHT, buff=0.35)
        VGroup(r1, r2).arrange(DOWN, aligned_edge=LEFT, buff=0.4).move_to([-2.4, 1.3, 0])
        self.go("37:41.84", FadeIn(n1, scale=1.3), Write(q1), run=1.2)
        self.go("37:47.58", FadeIn(n2, scale=1.3), Write(q2), run=1.4)
        # pause icon + note
        pz = VGroup(RoundedRectangle(width=0.22, height=0.8, corner_radius=0.06, fill_color=YEL, fill_opacity=1, stroke_width=0),
                    RoundedRectangle(width=0.22, height=0.8, corner_radius=0.06, fill_color=YEL, fill_opacity=1, stroke_width=0)).arrange(RIGHT, buff=0.18)
        pn = H("pause now and solve!", 48, YEL)
        pause = VGroup(pz, pn).arrange(RIGHT, buff=0.35).move_to([0, -1.3, 0])
        self.go("37:53.42", FadeIn(pause, scale=1.2), run=0.4)
        self.play(Indicate(pz, color=ORG), run_time=0.6)
        # answer 1
        self.go("37:54.60", FadeOut(pause), Indicate(n1, color=GRN), run=0.4)
        a1 = M(r"\tan\frac{\pi}{3}=\sqrt3", size=50)
        a1n = H("tan repeats every", 38, DIM)
        a1p = M(r"\pi", size=44, color=DIM)
        a2 = M(r"x=\frac{\pi}{3}+\pi=\frac{4\pi}{3}", size=50)
        A = VGroup(a1, VGroup(a1n, a1p).arrange(RIGHT, buff=0.15), a2).arrange(DOWN, aligned_edge=LEFT, buff=0.38).move_to([-3.0, -1.7, 0]).align_to(r1, LEFT)
        self.go("37:55.50", Write(a1), run=1.0)
        self.go("37:58.16", FadeIn(A[1]), run=0.5)
        self.go("38:01.60", Write(a2), run=1.2)
        fin1 = M(r"x=\frac{\pi}{3},\ \frac{4\pi}{3}", size=50, color=GRN).move_to([3.6, -0.5, 0])
        fb = box(fin1, GRN, buff=0.15)
        self.go("38:03.80", FadeIn(fin1, shift=LEFT * 0.3), Create(fb), run=0.5)
        # answer 2
        b1 = M(r"\cos^2 x=\tfrac12", size=50)
        b2 = M(r"\cos x=\pm\frac{\sqrt2}{2}", size=50)
        b3 = M(r"x=", r"\frac{\pi}{4}", ",\ ", r"\frac{3\pi}{4}", ",\ ", r"\frac{5\pi}{4}", ",\ ", r"\frac{7\pi}{4}", size=50)
        B = VGroup(b1, b2, b3).arrange(DOWN, aligned_edge=LEFT, buff=0.38).align_to(r1, LEFT).shift(DOWN * 0)
        B.move_to([B.get_center()[0], -1.8, 0])
        self.go("38:05.04", FadeOut(A), FadeOut(fin1), FadeOut(fb), Indicate(n2, color=GRN), run=0.5)
        self.go("38:06.10", Write(b1), run=1.0)
        self.go("38:09.00", Write(b2), run=1.1)
        c, r = np.array([4.4, -1.4, 0]), 1.45
        uc = unit_circle(r, c, axis_len=1.95, ticks=False)
        self.go("38:12.70", Create(uc), run=0.6)
        self.go("38:13.94", FadeIn(b3[0]), run=0.3)
        for k, (t, part) in enumerate([("38:15.64", 1), ("38:17.00", 3), ("38:18.62", 5), ("38:20.66", 7)]):
            a = PI / 4 + k * PI / 2
            sp = seg(c, on_circle(a, r, c), PINK, 3)
            d = pt(a, c, r, PINK, 0.11)
            self.go(t, FadeIn(b3[part:part + 1] if part == 1 else b3[part - 1:part + 1], scale=1.3), Create(sp), FadeIn(d, scale=2), run=0.45)


class K08_Problem(Shot):
    def body(self):
        self.title("Inverse Sine Has a Problem", "38:26.98")
        ax = Axes(x_range=[-90, 450, 90], y_range=[-1.3, 1.3, 1], x_length=11.5, y_length=3.6,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2)).move_to([0, -1.1, 0])
        labs = VGroup(*[M(rf"{v}^\circ", size=30, color=DIM).next_to(ax.c2p(v, 0), DOWN, buff=0.15) for v in (-90, 90, 180, 270, 360)])
        labs.add(M("1", size=30, color=DIM).next_to(ax.c2p(0, 1), LEFT, buff=0.12))
        wave = ax.plot(lambda v: np.sin(np.radians(v)), x_range=[-90, 440], color=PINK, stroke_width=5)
        q = M(r"\sin^{-1}\!\left(\tfrac12\right)=30^\circ", size=54).move_to([2.6, 1.55, 0])
        self.go("38:27.50", Create(ax), FadeIn(labs), run=0.5)
        self.go("38:28.00", Create(wave), run=0.8)
        self.go("38:28.82", Write(q), run=0.9)
        hl = DashedLine(ax.c2p(-90, 0.5), ax.c2p(445, 0.5), color=YEL, stroke_width=4, dash_length=0.15)
        hlab = M(r"\tfrac12", size=36, color=YEL).next_to(hl, LEFT, buff=0.1)
        self.go("38:31.56", Create(hl), FadeIn(hlab), run=0.6)
        dots = VGroup()
        for t, v in [("38:33.18", 30), ("38:36.32", 150), ("38:38.02", 390)]:
            d = Dot(ax.c2p(v, 0.5), radius=0.12, color=YEL)
            l = M(rf"{v}^\circ", size=36, color=YEL).next_to(d, UP, buff=0.18)
            dots.add(VGroup(d, l))
            self.go(t, FadeIn(d, scale=2), Write(l), run=0.5)
        q2 = M(r"\sin^{-1}\!\left(\tfrac12\right)=\ ", r"?", size=54).move_to(q, aligned_edge=LEFT)
        q2[1].set_color(ORG).scale(1.4)
        self.go("38:39.76", TransformMatchingTex(q, q2), run=0.6)
        self.play(Wiggle(q2[1]), run_time=0.8)
        band = Rectangle(width=ax.c2p(90, 0)[0] - ax.c2p(-90, 0)[0], height=3.5, fill_color=YEL, fill_opacity=0.12, stroke_color=YEL, stroke_width=2).move_to([(ax.c2p(90, 0)[0] + ax.c2p(-90, 0)[0]) / 2, ax.c2p(0, 0)[1], 0])
        note = H("one range only", 40, YEL).next_to(band, UP, buff=0.1)
        self.go("38:44.86", FadeIn(band), FadeIn(note), dots[1].animate.set_opacity(0.3), dots[2].animate.set_opacity(0.3), run=0.6)
        q3 = M(r"\sin^{-1}\!\left(\tfrac12\right)=30^\circ", size=54, color=GRN).move_to(q2, aligned_edge=LEFT)
        self.go("38:46.34", Indicate(dots[0], color=GRN), FadeOut(q2), FadeIn(q3), run=0.6)


class K08_Ranges(Shot):
    def body(self):
        self.title("Restricted Ranges", "38:47.28")
        r = 1.45
        cs = [np.array([x, -0.55, 0]) for x in (-4.5, 0, 4.5)]
        specs = [("arcsin", PINK, "38:48.40", "38:51.98", -PI / 2, PI, r"-\frac{\pi}{2}\le y\le\frac{\pi}{2}", "38:52.34", False),
                 ("arccos", BLUE, "38:56.08", "38:59.22", 0, PI, r"0\le y\le\pi", "38:59.92", False),
                 ("arctan", GRN, "39:02.02", "39:05.12", -PI / 2, PI, r"-\frac{\pi}{2}<y<\frac{\pi}{2}", "39:05.62", True)]
        for c, (name, colr, t0, t1, a0, da, rng, t2, open_) in zip(cs, specs):
            p = pill(name, colr, 40).move_to(c + [0, r + 0.95, 0])
            uc = unit_circle(r, c, axis_len=1.9, ticks=False)
            self.go(t0, FadeIn(p, shift=DOWN * 0.2), Create(uc), run=0.7)
            arc = arc_hl(c, r, a0, da, colr)
            ends = VGroup(*[Dot(on_circle(a, r, c), radius=0.12, color=colr, fill_opacity=0 if open_ else 1, stroke_width=4 if open_ else 0, stroke_color=colr) for a in (a0, a0 + da)])
            if open_:
                ends.set_fill(color="#1d1d1f", opacity=1)
            lab = M(rng, size=40, color=colr).move_to(c + [0, -r - 0.85, 0])
            self.go(t1, Create(arc), FadeIn(ends), run=0.35)
            self.go(t2, Write(lab), run=0.6)
        st = H("strictly: never touches the ends", 32, GRN).move_to([3.3, -3.62, 0])
        self.go("39:06.40", FadeIn(st), run=0.5)


class K08_Trap(Shot):
    def body(self):
        self.title("Watch This Trap!", "39:09.40")
        c, r = np.array([3.9, -0.7, 0]), 1.95
        q = M(r"\sin^{-1}\!\left(\sin\frac{5\pi}{6}\right)", "=", "?", size=54).move_to([-3.3, 1.5, 0])
        self.go("39:10.26", Write(q), run=1.4)
        guess = M(r"\frac{5\pi}{6}", size=54, color=ORG).next_to(q[1], RIGHT, buff=0.25)
        self.go("39:14.66", FadeOut(q[2]), FadeIn(guess, scale=1.3), run=0.5)
        x = cross_mark(RED, 0.35).move_to(guess)
        self.go("39:17.74", Create(x), run=0.4)
        uc = unit_circle(r, c, axis_len=2.6, ticks=False)
        rng = arc_hl(c, r, -PI / 2, PI, PINK, 10)
        d56 = pt(5 * PI / 6, c, r, ORG, 0.13)
        l56 = ang_lab(5 * PI / 6, c, r, r"\frac{5\pi}{6}", ORG, 38)
        self.go("39:18.18", Create(uc), FadeIn(d56, scale=2), FadeIn(l56), run=0.7)
        out = H("outside the range!", 40, RED).move_to(c + [0, -r - 0.75, 0])
        self.go("39:20.04", Create(rng), Write(out), run=0.8)
        s1 = M(r"\sin\frac{5\pi}{6}=\frac12", size=52).move_to([-3.3, 0.15, 0])
        hl = hline(c, r, 0.5, YEL)
        self.go("39:21.58", Write(s1), Create(hl), run=1.0)
        d6 = pt(PI / 6, c, r, PINK, 0.13)
        l6 = ang_lab(PI / 6, c, r, r"\frac{\pi}{6}", PINK, 38)
        s2 = M(r"\sin^{-1}\!\left(\tfrac12\right)=\frac{\pi}{6}", size=52).move_to([-3.3, -1.2, 0])
        self.go("39:25.74", Write(s2), FadeIn(d6, scale=2), FadeIn(l6), run=1.0)
        b = box(s2, GRN, buff=0.15)
        self.go("39:27.04", Create(b), run=0.4)
        # second example: arccos(cos(-π/3))
        self.go("39:27.94", FadeOut(VGroup(q[:2], guess, x, s1, s2, b, rng, d56, l56, out, hl, d6, l6)), run=0.5)
        q2 = M(r"\cos^{-1}\!\left(\cos\left(-\frac{\pi}{3}\right)\right)", size=54).move_to([-3.1, 1.5, 0])
        self.go("39:28.94", Write(q2), run=1.4)
        rng2 = arc_hl(c, r, 0, PI, BLUE, 10)
        dm = pt(-PI / 3, c, r, ORG, 0.13)
        lm = ang_lab(-PI / 3, c, r, r"-\frac{\pi}{3}", ORG, 38, RIGHT)
        self.go("39:31.02", FadeIn(dm, scale=2), FadeIn(lm), run=0.5)
        c1 = M(r"\cos\left(-\frac{\pi}{3}\right)=\frac12", size=52).move_to([-3.1, 0.1, 0])
        vl = vline(c, r, 0.5, YEL)
        self.go("39:33.24", Write(c1), Create(vl), run=1.0)
        c2 = M(r"\cos^{-1}\!\left(\tfrac12\right)=\frac{\pi}{3}", size=52).move_to([-3.1, -1.3, 0])
        self.go("39:36.22", Write(c2), run=1.0)
        rl = M(r"0\ \text{to}\ \pi", size=40, color=BLUE).move_to(c + [0, -r - 0.75, 0])
        self.go("39:37.90", Create(rng2), FadeIn(rl), run=0.6)
        dp = pt(PI / 3, c, r, BLUE, 0.13)
        lp = ang_lab(PI / 3, c, r, r"\frac{\pi}{3}", BLUE, 38, UR)
        self.go("39:39.80", FadeIn(dp, scale=2), FadeIn(lp), Create(box(c2, GRN, buff=0.15)), run=0.5)


class K08_Triangles(Shot):
    def body(self):
        self.title("Just Draw the Triangle", "39:41.66")
        e1 = M(r"\sin\!\left(\cos^{-1}\tfrac35\right)", size=56)
        e2 = M(r"\theta=\cos^{-1}\tfrac35", size=50, color=YEL)
        e3 = M(r"\cos\theta=\frac35", size=50)
        e4 = H("(quadrant 1)", 34, DIM)
        G = col(e1, e2, e3, x=-3.6, top=1.9, buff=0.35)
        e4.next_to(e3, RIGHT, buff=0.4)
        self.go("39:42.58", Write(e1), run=1.4)
        self.go("39:46.76", Write(e2), run=1.0)
        self.go("39:49.62", Write(e3), run=1.0)
        self.go("39:52.28", FadeIn(e4), run=0.4)
        t = right_triangle(b=2.85, h=3.8, origin=(1.3, -2.45, 0))
        A, B, C = t["A"], t["B"], t["C"]
        self.go("39:53.80", Create(t["tri"]), Create(t["mark"]), run=0.8)
        th = angle_arc(A, B, C, r=0.7, label=r"\theta", label_size=44)
        self.go("39:54.72", Create(th), run=0.4)
        la = side_label(A, B, "3", BLUE, 50, side=-1)
        lh = side_label(A, C, "5", GRN, 50, side=1)
        lo_q = side_label(B, C, "?", PINK, 50, side=-1)
        lo = side_label(B, C, "4", PINK, 50, side=-1)
        self.go("39:55.34", Write(la), run=0.4)
        self.go("39:56.64", Write(lh), run=0.4)
        self.go("39:57.84", FadeIn(lo_q, scale=1.4), run=0.4)
        self.go("39:59.36", ReplacementTransform(lo_q, lo), run=0.4)
        f = M(r"\sin\theta=\frac{\text{opp}}{\text{hyp}}=\frac45", size=50, color=PINK).next_to(G, DOWN, buff=0.45).align_to(G, LEFT)
        self.go("40:00.36", Write(f), run=1.0)
        self.go("40:01.64", Create(box(f, GRN, buff=0.15)), run=0.4)
        # advanced version
        self.wipe("40:02.32", run=0.5)
        g1 = M(r"\tan\!\left(\sin^{-1}x\right)", size=56)
        g2 = M(r"\theta=\sin^{-1}x", size=50, color=YEL)
        g3 = M(r"\sin\theta=\frac{x}{1}", size=50)
        G2 = col(g1, g2, g3, x=-3.4, top=1.8, buff=0.42)
        adv = pill("advanced", ORG, 34).next_to(g1, RIGHT, buff=0.4)
        self.go("40:04.20", FadeIn(adv, scale=1.2), run=0.4)
        self.go("40:05.26", Write(g1), run=1.2)
        self.go("40:08.50", Write(g2), run=1.0)
        self.go("40:10.74", Write(g3), run=1.0)
        t2 = right_triangle(b=3.6, h=2.6, origin=(1.1, -1.9, 0))
        A, B, C = t2["A"], t2["B"], t2["C"]
        th2 = angle_arc(A, B, C, r=0.75, label=r"\theta", label_size=44)
        self.go("40:12.20", Create(t2["tri"]), Create(t2["mark"]), Create(th2), run=0.6)
        lo2 = side_label(B, C, "x", PINK, 54, side=-1)
        lh2 = side_label(A, C, "1", GRN, 54, side=1)
        la_q = side_label(A, B, "?", BLUE, 50, side=-1)
        la2 = side_label(A, B, r"\sqrt{1-x^2}", BLUE, 48, side=-1)
        self.go("40:13.44", Write(lo2), run=0.4)
        self.go("40:14.66", Write(lh2), run=0.4)
        self.go("40:15.56", FadeIn(la_q, scale=1.4), run=0.4)
        self.go("40:16.60", ReplacementTransform(la_q, la2), run=0.8)
        f2 = M(r"\tan\theta=\frac{x}{\sqrt{1-x^2}}", size=54, color=GRN).next_to(G2, DOWN, buff=0.5).align_to(G2, LEFT)
        self.go("40:19.14", Write(f2), run=1.4)
        self.go("40:22.22", Create(box(f2, GRN, buff=0.15)), run=0.4)
        note = H("draw the triangle: it always works!", 36, YEL).move_to([2.9, -3.45, 0])
        self.go("40:23.36", Write(note), run=1.0)
