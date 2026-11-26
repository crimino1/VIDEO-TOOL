"""Builder 06: Chapter 9, Trigonometric Identities."""
from common import *

# ponytail: private LaTeX cache per process; the shared tex_cache races between parallel renders on Windows


def key(label, color):
    """A chalk key pointing down from the origin (ring end at the top), with a label at its tip."""
    bow = Circle(radius=0.26, color=CHALK, stroke_width=4).move_to([0, -0.26, 0])
    shaft = Line([0, -0.52, 0], [0, -1.7, 0], color=CHALK, stroke_width=4)
    teeth = VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners([[0, -1.45, 0], [0.22, -1.45, 0], [0.22, -1.55, 0], [0, -1.55, 0], [0, -1.62, 0], [0.16, -1.62, 0], [0.16, -1.7, 0], [0, -1.7, 0]])
    return VGroup(bow, shaft, teeth), H(label, 30, color)


def heart(color=PINK, s=0.3):
    t = np.linspace(0, TAU, 80)
    pts = np.column_stack([16 * np.sin(t) ** 3, 13 * np.cos(t) - 5 * np.cos(2 * t) - 2 * np.cos(3 * t) - np.cos(4 * t), 0 * t]) / 16 * s
    return VMobject(stroke_color=color, stroke_width=5).set_points_smoothly(pts)


def crown(color=YEL):
    return VMobject(stroke_color=color, stroke_width=5).set_points_as_corners(
        [[-0.5, 0, 0], [-0.55, 0.45, 0], [-0.25, 0.2, 0], [0, 0.55, 0], [0.25, 0.2, 0], [0.55, 0.45, 0], [0.5, 0, 0], [-0.5, 0, 0]])


def pause_icon(color=YEL):
    return VGroup(*[RoundedRectangle(width=0.22, height=0.75, corner_radius=0.06, fill_color=color, fill_opacity=1, stroke_width=0).shift(RIGHT * dx) for dx in (-0.2, 0.2)])


class K06_Keys(Shot):
    def body(self):
        give = H("this is where many students give up...", 48).move_to([0, 0.4, 0])
        self.go("26:59.30", Write(give), run=1.4)
        sl = Line(give[-9:-3].get_left() + LEFT * 0.05, give[-9:-3].get_right() + RIGHT * 0.05, color=RED, stroke_width=7).shift(DOWN * 0.02)
        dont = H("please don't!", 56, YEL).next_to(give, DOWN, buff=0.6)
        self.go("27:01.92", Create(sl), Write(dont), run=0.7)
        self.wipe("27:02.50", run=0.3)
        self.title("What is an Identity?")
        defi = TX(r"an \textbf{identity} = an equation true for \underline{every} angle", 48).move_to([0, 1.6, 0])
        defi[0][2:10].set_color(YEL)
        self.go("27:03.74", Write(defi), run=1.6)
        # key chain
        ring = Circle(radius=0.45, color=DIM, stroke_width=5).move_to([-3.4, 0.55, 0])
        self.go("27:07.16", Create(ring), run=0.6)
        names = [("Pythagorean", YEL), ("Quotient", GRN), ("Even / Odd", BLUE), ("Co-function", PINK)]
        keys = []
        for i, (n, c) in enumerate(names):
            k, lab = key(n, c)
            ang = (-50 + i * 33) * DEGREES
            k.rotate(ang, about_point=ORIGIN).shift(ring.get_bottom())
            tip = ring.get_bottom() + rotate_vector(DOWN * 2.0, ang)
            lab.move_to(tip + rotate_vector(DOWN * 0.45, ang) + (LEFT * 0.6 if i < 2 else RIGHT * 0.6))
            keys.append(VGroup(k, lab))
        self.go("27:08.14", LaggedStart(*[FadeIn(k, shift=DOWN * 0.2) for k in keys], lag_ratio=0.25), run=1.3)
        door = VGroup(Rectangle(width=2.0, height=3.4, color=CHALK, stroke_width=5),
                      Dot(radius=0.08, color=CHALK).shift(RIGHT * 0.65),
                      VGroup(Circle(radius=0.09, color=YEL, stroke_width=4), Line(DOWN * 0.08, DOWN * 0.3, color=YEL, stroke_width=4)).shift(RIGHT * 0.65 + DOWN * 0.35)).move_to([3.6, -0.9, 0])
        self.go("27:10.30", Create(door[0]), FadeIn(door[1:]), run=0.7)
        k0 = keys[0][0].copy()
        self.go("27:11.18", k0.animate.rotate(-k0[1].get_angle() - PI / 2).scale(0.6).move_to(door[2].get_center() + LEFT * 0.75), run=0.8)
        tk = tick_mark(GRN, 0.9).next_to(door, DOWN, buff=0.3).shift(LEFT * 0.5)
        easy = H("easy!", 52, GRN).next_to(tk, RIGHT, buff=0.3)
        self.go("27:12.52", door[0].animate.set_color(GRN), Create(tk), Write(easy), run=0.6)


class K06_Pyth(Shot):
    def body(self):
        self.title("The Pythagorean Identity", "27:14.06")
        cr = crown().scale(0.8)
        king = H("the king of all identities", 40, YEL)
        kg = VGroup(cr, king).arrange(RIGHT, buff=0.3).move_to([3.3, 1.9, 0])
        self.go("27:14.88", Create(cr), Write(king), run=0.9)
        C, R = np.array([-3.3, -0.75, 0]), 2.3
        uc = unit_circle(R, C, axis_len=2.95, ticks=False)
        self.go("27:18.90", Create(uc), run=1.0)
        th = ValueTracker(40 * DEGREES)
        P = lambda: on_circle(th.get_value(), R, C)
        foot = lambda: np.array([P()[0], C[1], 0])
        hyp = always_redraw(lambda: Line(C, P(), color=GRN, stroke_width=5))
        xs = always_redraw(lambda: Line(C, foot(), color=BLUE, stroke_width=7))
        ys = always_redraw(lambda: Line(foot(), P(), color=PINK, stroke_width=7))
        dot = always_redraw(lambda: Dot(P(), radius=0.09, color=YEL))
        arc = always_redraw(lambda: Arc(radius=0.55, start_angle=0, angle=th.get_value() % TAU, arc_center=C, color=YEL, stroke_width=4))
        thl = M(r"\theta", size=40, color=YEL).move_to(C + 0.85 * np.array([np.cos(0.35), np.sin(0.35), 0]))
        pl = M("(x, y)", size=40).next_to(P(), UR, buff=0.08)
        self.go("27:20.10", Create(hyp), FadeIn(dot), Create(arc), FadeIn(thl), Write(pl), run=0.8)
        xl = M(r"x=\cos\theta", size=38, color=BLUE).next_to(Line(C, foot()), DOWN, buff=0.18)
        self.go("27:22.36", Create(xs), Write(xl), run=0.8)
        yl = M(r"y=\sin\theta", size=38, color=PINK).next_to(Line(foot(), P()), RIGHT, buff=0.12)
        self.go("27:24.70", Create(ys), Write(yl), run=0.8)
        one = M("1", size=42, color=GRN).move_to((C + P()) / 2 + np.array([-0.3, 0.3, 0]))
        self.go("27:27.28", Write(one), Indicate(hyp, color=GRN), run=0.7)
        e1 = M("x^2", "+", "y^2", "=", "1", size=62).move_to([3.3, 0.55, 0])
        e1[0].set_color(BLUE); e1[2].set_color(PINK)
        self.go("27:29.82", Write(e1), run=1.5)
        e2 = M(r"\sin^2\theta", "+", r"\cos^2\theta", "=", "1", size=66).move_to([3.3, -0.85, 0])
        e2[0].set_color(PINK); e2[2].set_color(BLUE)
        arrow = Arrow(e1.get_bottom(), e2.get_top(), buff=0.12, color=DIM, stroke_width=4, max_tip_length_to_length_ratio=0.25)
        self.go("27:33.64", GrowArrow(arrow), Write(e2), run=2.0)
        bx = box(e2, YEL, 0.25)
        self.go("27:37.40", Create(bx), run=0.5)
        every = H("every angle!", 40, YEL).next_to(bx, DOWN, buff=0.35)
        self.at("27:38.86")
        self.play(FadeOut(VGroup(xl, yl, pl, one, thl)), Write(every), run_time=0.5)
        self.play(th.animate.set_value(400 * DEGREES), run_time=2.8, rate_func=smooth)
        hrt = heart(PINK, 0.32)
        love = H("memorize it, love it", 40, PINK)
        lg = VGroup(love, hrt).arrange(RIGHT, buff=0.25).next_to(every, DOWN, buff=0.35)
        self.go("27:42.36", Write(love), Create(hrt), run=0.9)
        self.play(hrt.animate.scale(1.25), rate_func=there_and_back, run_time=0.6)


class K06_Three(Shot):
    def body(self):
        self.title("The Pythagorean Identity", animate=False)
        main = M(r"\sin^2\theta", "+", r"\cos^2\theta", "=", "1", size=62).move_to([0, 1.55, 0])
        main[0].set_color(PINK); main[2].set_color(BLUE)
        mb = box(main, YEL, 0.22)
        self.add(main, mb)
        h1 = H("divide by", 34, DIM)
        d1 = M(r"\cos^2\theta", size=40, color=BLUE)
        hd1 = VGroup(h1, d1).arrange(RIGHT, buff=0.2).move_to([-3.5, 0.45, 0])
        f1 = M(r"\frac{\sin^2\theta}{\cos^2\theta}", "+", r"\frac{\cos^2\theta}{\cos^2\theta}", "=", r"\frac{1}{\cos^2\theta}", size=44).move_to([-3.5, -0.75, 0])
        self.go("27:45.10", Write(hd1), run=0.6)
        self.play(Write(f1), run_time=1.4)
        r1 = M(r"\tan^2\theta", "+", "1", "=", r"\sec^2\theta", size=56, color=GRN).move_to([-3.5, -2.3, 0])
        a1 = Arrow(f1.get_bottom(), r1.get_top(), buff=0.1, color=DIM, stroke_width=4, max_tip_length_to_length_ratio=0.3)
        self.go("27:48.10", GrowArrow(a1), Write(r1), run=1.4)
        h2 = H("divide by", 34, DIM)
        d2 = M(r"\sin^2\theta", size=40, color=PINK)
        hd2 = VGroup(h2, d2).arrange(RIGHT, buff=0.2).move_to([3.5, 0.45, 0])
        f2 = M(r"\frac{\sin^2\theta}{\sin^2\theta}", "+", r"\frac{\cos^2\theta}{\sin^2\theta}", "=", r"\frac{1}{\sin^2\theta}", size=44).move_to([3.5, -0.75, 0])
        self.go("27:51.78", Write(hd2), run=0.6)
        self.play(Write(f2), run_time=1.4)
        r2 = M("1", "+", r"\cot^2\theta", "=", r"\csc^2\theta", size=56, color=ORG).move_to([3.5, -2.3, 0])
        a2 = Arrow(f2.get_bottom(), r2.get_top(), buff=0.1, color=DIM, stroke_width=4, max_tip_length_to_length_ratio=0.3)
        self.go("27:54.32", GrowArrow(a2), Write(r2), run=1.4)
        self.title("Three Pythagorean Identities", "27:57.64")
        self.play(FadeOut(VGroup(hd1, f1, a1, hd2, f2, a2)), run_time=0.4)
        self.play(r1.animate.move_to([-3.0, -0.3, 0]), r2.animate.move_to([3.0, -0.3, 0]), main.animate.move_to([0, 1.25, 0]), mb.animate.move_to([0, 1.25, 0]), run_time=0.7)
        grp = VGroup(main, mb, r1, r2)
        pn = panel(grp, PURP, 0.4)
        note = H("all from one circle", 44, YEL).next_to(pn, DOWN, buff=0.4)
        circ = Circle(radius=0.3, color=YEL, stroke_width=4).next_to(note, RIGHT, buff=0.3)
        self.go("28:00.18", Create(pn), Write(note), Create(circ), run=1.0)


class K06_Quotient(Shot):
    def body(self):
        self.title("Quotient Identities", "28:02.40")
        e1 = M(r"\tan\theta", "=", r"\frac{\sin\theta}{\cos\theta}", size=72).move_to([0, 0.65, 0])
        e1[0].set_color(GRN); e1[2][:4].set_color(PINK); e1[2][5:].set_color(BLUE)
        self.go("28:04.92", Write(e1), run=1.3)
        e2 = M(r"\cot\theta", "=", r"\frac{\cos\theta}{\sin\theta}", size=72).move_to([0, -1.75, 0])
        e2[0].set_color(ORG); e2[2][:4].set_color(BLUE); e2[2][5:].set_color(PINK)
        self.go("28:07.50", Write(e2), run=1.3)
        flip = H("just flipped!", 38, YEL).next_to(e2, RIGHT, buff=0.6)
        self.go("28:09.10", FadeIn(flip, shift=LEFT * 0.2), run=0.5)


class K06_EvenOdd(Shot):
    def body(self):
        self.title("Even & Odd Identities", "28:10.40")
        C, R = np.array([-3.7, -0.75, 0]), 2.2
        uc = unit_circle(R, C, axis_len=2.85, ticks=False)
        a = 38 * DEGREES
        P, Q = on_circle(a, R, C), on_circle(-a, R, C)
        F = np.array([P[0], C[1], 0])
        self.go("28:11.02", Create(uc), run=0.8)
        rp = Line(C, P, color=CHALK, stroke_width=4)
        rq = Line(C, Q, color=CHALK, stroke_width=4)
        dp, dq = Dot(P, color=YEL, radius=0.09), Dot(Q, color=YEL, radius=0.09)
        ap = angle_arc(C, C + RIGHT, P, r=0.6, label=r"\theta", label_size=38)
        aq = angle_arc(C, Q, C + RIGHT, r=0.6, label=r"-\theta", label_size=38)
        self.play(Create(rp), FadeIn(dp), FadeIn(ap), run_time=0.6)
        ce = pill("cosine is EVEN", BLUE, 38).move_to([3.0, 1.55, 0])
        self.go("28:12.54", FadeIn(ce, scale=0.8), Create(rq), FadeIn(dq), FadeIn(aq), run=0.7)
        e1 = M(r"\cos(-\theta)", "=", r"\cos\theta", size=58).next_to(ce, DOWN, buff=0.35)
        e1[0].set_color(BLUE); e1[2].set_color(BLUE)
        xs = Line(C, F, color=BLUE, stroke_width=9)
        same = H("same x", 32, BLUE).move_to(C + np.array([0.95, -1.75, 0]))
        self.go("28:14.76", Write(e1), Create(xs), FadeIn(same), run=1.2)
        so = pill("sine is ODD", PINK, 38).move_to([3.0, -0.75, 0])
        self.go("28:17.90", FadeIn(so, scale=0.8), run=0.5)
        e2 = M(r"\sin(-\theta)", "=", r"-\sin\theta", size=58).next_to(so, DOWN, buff=0.35)
        e2[0].set_color(PINK); e2[2].set_color(PINK)
        yp, yq = Line(F, P, color=PINK, stroke_width=8), Line(F, Q, color=PINK, stroke_width=8)
        flip = H("y flips", 34, PINK).next_to(yq, RIGHT, buff=0.15)
        self.go("28:19.44", Write(e2), Create(yp), Create(yq), FadeIn(flip), run=1.2)
        e3 = M(r"\tan(-\theta)", "=", r"-\tan\theta", size=46, color=GRN).next_to(e2, DOWN, buff=0.45)
        self.go("28:22.64", Write(e3), run=0.9)


class K06_Cofunc(Shot):
    def body(self):
        self.title("Co-function Identities", "28:24.40")
        t = right_triangle(b=4.2, h=3.0, origin=(-6.2, -2.6, 0))
        A, B, C = t["A"], t["B"], t["C"]
        ta = angle_arc(A, B, C, r=0.85, label=r"\theta", label_size=42)
        tc = angle_arc(C, A, B, r=0.7, color=ORG, label=r"90^\circ\!-\theta", label_size=36, label_buff=0.75)
        self.play(Create(t["tri"]), Create(t["mark"]), FadeIn(ta), FadeIn(tc), run_time=0.6)
        e1 = M(r"\sin(90^\circ-\theta)", "=", r"\cos\theta", size=56).move_to([2.9, 1.35, 0])
        e1[0].set_color(PINK); e1[2].set_color(BLUE)
        adj = Line(A, B, color=BLUE, stroke_width=9)
        self.go("28:25.82", Write(e1), run=2.0)
        self.play(Create(adj), run_time=0.5)
        e2 = M(r"\cos(90^\circ-\theta)", "=", r"\sin\theta", size=56).next_to(e1, DOWN, buff=0.55)
        e2[0].set_color(BLUE); e2[2].set_color(PINK)
        opp = Line(B, C, color=PINK, stroke_width=9)
        self.go("28:30.08", Write(e2), FadeOut(adj), run=2.0)
        self.play(Create(opp), run_time=0.5)
        name = H("cosine = complement sine", 46, t2c={"co": YEL}).move_to([2.6, -1.5, 0])
        self.go("28:34.24", Write(name), run=1.6)
        ul = VGroup(*[Line(name[i].get_corner(DL), name[i + 1].get_corner(DR), color=YEL, stroke_width=5).shift(DOWN * 0.08) for i in (0, 7)])
        self.go("28:37.42", Create(ul), run=0.5)
        note = H("complementary angles add to 90°", 34, DIM).next_to(name, DOWN, buff=0.4)
        self.play(FadeIn(note), run_time=0.5)


class K06_Example(Shot):
    def body(self):
        self.title("Using the Identities", "28:39.10")
        given = M(r"\sin\theta=\tfrac{3}{5}", size=50, color=PINK)
        q2 = TX(r"$\theta$ in Quadrant II", 44, YEL)
        gv = VGroup(given, q2).arrange(RIGHT, buff=0.6).move_to([-2.6, 1.85, 0])
        self.go("28:40.84", Write(given), run=1.0)
        self.go("28:43.20", Write(q2), run=0.8)
        # small unit circle with the point in QII
        C, R = np.array([4.4, -0.7, 0]), 1.9
        uc = unit_circle(R, C, axis_len=2.4, ticks=False)
        a = PI - np.arcsin(0.6)
        P = on_circle(a, R, C)
        F = np.array([P[0], C[1], 0])
        quad = AnnularSector(inner_radius=0, outer_radius=R, angle=PI / 2, start_angle=PI / 2, arc_center=C, fill_color=YEL, fill_opacity=0.12, stroke_width=0)
        self.play(Create(uc), FadeIn(quad), run_time=0.7)
        ask = TX(r"find $\cos\theta$ and $\tan\theta$", 38, DIM).next_to(gv, DOWN, buff=0.25).align_to(gv, LEFT)
        self.go("28:45.00", FadeIn(ask), run=0.5)
        x0 = -2.6
        lines = [
            ("28:46.90", M(r"\sin^2\theta", "+", r"\cos^2\theta", "=", "1", size=46)),
            ("28:49.82", M(r"\tfrac{9}{25}", "+", r"\cos^2\theta", "=", "1", size=46)),
            ("28:52.88", M(r"\cos^2\theta", "=", r"\tfrac{16}{25}", size=46)),
        ]
        y = 0.45
        shown = []
        for t0, e in lines:
            e.move_to([x0, y, 0])
            self.go(t0, *([FadeOut(ask)] if t0 == "28:46.90" else []), Write(e), run=1.1)
            shown.append(e)
            y -= 0.9
        c4 = M(r"\cos\theta", "=", r"\pm", r"\tfrac{4}{5}", size=50, color=BLUE).move_to([x0, y, 0])
        self.go("28:56.28", Write(c4), run=1.1)
        rad = Line(C, P, color=CHALK, stroke_width=4)
        xs = Line(C, F, color=BLUE, stroke_width=8)
        ys = Line(F, P, color=PINK, stroke_width=7)
        neg = H("x < 0", 36, BLUE).next_to(xs, DOWN, buff=0.15)
        self.go("28:59.00", Create(rad), FadeIn(Dot(P, color=YEL)), Create(ys), run=0.6)
        self.play(Create(xs), FadeIn(neg), run_time=0.6)
        mn = M("-", size=50, color=BLUE).move_to(c4[2])
        self.go("29:02.42", Transform(c4[2], mn), run=0.6)
        self.play(Create(box(c4, BLUE, 0.15)), run_time=0.4)
        y -= 0.95
        t5 = M(r"\tan\theta", "=", r"\tfrac{3}{5}\div\left(-\tfrac{4}{5}\right)", "=", r"-\tfrac{3}{4}", size=48).move_to([x0, y, 0])
        t5[0].set_color(GRN); t5[4].set_color(GRN)
        self.go("29:05.38", Write(t5[:3]), run=1.3)
        self.go("29:07.76", Write(t5[3:]), run=0.7)
        self.play(Create(box(t5[4], GRN, 0.12)), run_time=0.4)


class K06_Proof(Shot):
    def body(self):
        self.title("Proving an Identity", "29:09.90")
        rule = pill("the rule", YEL, 38).move_to([-4.4, 1.7, 0])
        self.go("29:11.84", FadeIn(rule, scale=0.8), run=0.5)
        steps = VGroup(H("1. start with the more complicated side", 40),
                       H("2. transform it step by step", 40),
                       H("3. until it looks like the other side", 40)).arrange(DOWN, aligned_edge=LEFT, buff=0.35).next_to(rule, DOWN, buff=0.45).align_to(rule, LEFT)
        tip = H("tip: rewrite everything in sin and cos", 42, GRN).next_to(steps, DOWN, buff=0.55).align_to(steps, LEFT)
        for t0, m in zip(("29:13.26", "29:15.60", "29:17.16"), steps):
            self.go(t0, Write(m), run=1.0)
        self.go("29:19.50", Write(tip), run=1.2)
        self.wipe("29:23.30", run=0.35)
        pr = H("Prove:", 44, YEL)
        goal = M(r"\sec x-\cos x", "=", r"\sin x\,\tan x", size=58)
        g = VGroup(pr, goal).arrange(RIGHT, buff=0.4).move_to([0, 1.75, 0])
        self.go("29:23.66", Write(pr), run=0.4)
        self.play(Write(goal), run_time=2.6)
        lb = box(goal[0], PINK, 0.12)
        self.go("29:29.22", Create(lb), run=0.5)
        L = [M(r"\sec x-\cos x", size=50),
             M("=", r"\frac{1}{\cos x}", r"-\cos x", size=50),
             M("=", r"\frac{1-\cos^2 x}{\cos x}", size=50),
             M("=", r"\frac{\sin^2 x}{\cos x}", size=50),
             M("=", r"\sin x\cdot", r"\frac{\sin x}{\cos x}", size=50),
             M("=", r"\sin x\,\tan x", size=50)]
        L[0].move_to([-3.6, 0.45, 0])
        L[1].next_to(L[0], DOWN, buff=0.45).align_to(L[0], LEFT).shift(RIGHT * 0.3)
        L[2].next_to(L[1], DOWN, buff=0.4).align_to(L[1], LEFT)
        L[3].move_to([2.6, 0.45, 0])
        L[4].next_to(L[3], DOWN, buff=0.4).align_to(L[3], LEFT)
        L[5].next_to(L[4], DOWN, buff=0.45).align_to(L[3], LEFT)
        self.go("29:29.92", TransformFromCopy(goal[0], L[0]), run=0.8)
        aside = M(r"\sec x=\frac{1}{\cos x}", size=46, color=YEL).to_edge(DOWN, buff=0.45)
        self.go("29:30.92", FadeIn(aside, shift=UP * 0.2), run=0.5)
        self.go("29:33.78", Write(L[1]), run=1.4)
        cd = H("common denominator", 36, YEL).to_edge(DOWN, buff=0.45)
        self.go("29:37.30", FadeOut(aside), FadeIn(cd, shift=UP * 0.2), run=0.5)
        self.go("29:39.20", Write(L[2]), run=1.8)
        py = M(r"1-\cos^2 x=\sin^2 x", size=46, color=GRN).to_edge(DOWN, buff=0.45)
        self.go("29:43.52", FadeOut(cd), FadeIn(py, shift=UP * 0.2), run=0.5)
        self.play(Indicate(L[2][1], color=GRN), run_time=0.8)
        arr = Arrow(L[2].get_right(), L[3].get_left() + DOWN * 0.1, buff=0.25, color=DIM, stroke_width=4, max_tip_length_to_length_ratio=0.15)
        self.go("29:48.40", GrowArrow(arr), Write(L[3]), run=1.4)
        sp = H("split it", 36, YEL).to_edge(DOWN, buff=0.45)
        self.go("29:51.22", FadeOut(py), FadeIn(sp, shift=UP * 0.2), run=0.4)
        self.go("29:52.42", Write(L[4]), run=1.4)
        tb = box(L[4][2], GRN, 0.1)
        tn = M(r"\frac{\sin x}{\cos x}=\tan x", size=46, color=GRN).to_edge(DOWN, buff=0.45)
        self.go("29:55.28", Create(tb), FadeOut(sp), FadeIn(tn, shift=UP * 0.2), run=0.6)
        self.go("29:58.00", Write(L[5]), run=1.0)
        fb = box(L[5][1], GRN, 0.14)
        tk = tick_mark(GRN, 0.8).next_to(fb, RIGHT, buff=0.3)
        done = H("done!", 48, GRN).next_to(tk, DOWN, buff=0.15)
        self.go("30:00.36", Create(fb), Create(tk), Write(done), run=0.7)
        rb = box(goal[2], GRN, 0.12)
        self.go("30:01.80", Create(rb), Indicate(goal[2], color=GRN), run=0.8)


class K06_Practice(Shot):
    def body(self):
        self.title("Practice", "30:07.90")
        q1 = TX(r"1.\ \ If $\cos\theta=\frac{5}{13}$ and $\theta$ is in Quadrant IV, find $\sin\theta$.", 42).move_to([0, 1.85, 0])
        self.go("30:08.76", Write(q1), run=2.4)
        q2 = TX(r"2.\ \ Simplify $\dfrac{1-\sin^2 x}{\cos x}$", 42).next_to(q1, DOWN, buff=0.4).align_to(q1, LEFT)
        self.go("30:16.12", Write(q2), run=2.0)
        pz = VGroup(pause_icon(), H("pause now", 52, YEL)).arrange(RIGHT, buff=0.35).move_to([0, -1.4, 0])
        self.go("30:21.12", FadeIn(pz, scale=0.8), run=0.4)
        self.play(pz.animate.scale(1.08), rate_func=there_and_back, run_time=0.6)
        self.play(FadeOut(pz), run_time=0.3)
        x0 = -6.2
        a1 = [("30:23.28", M(r"\sin^2\theta", "=", r"1-\frac{25}{169}", size=44)),
              ("30:27.62", M("=", r"\frac{144}{169}", size=44)),
              ("30:30.76", M(r"\sin\theta", "=", r"\pm", r"\frac{12}{13}", size=44))]
        y = -0.35
        prev = None
        for t0, e in a1:
            e.move_to([0, y, 0]).align_to([x0, 0, 0], LEFT)
            if t0 == "30:27.62":
                e.align_to(a1[0][1][1], LEFT)
            self.go(t0, Write(e), run=1.1)
            y -= 1.15
        s4 = a1[2][1]
        q4 = H("Q IV: sine is negative", 34, PINK).next_to(s4, RIGHT, buff=0.5)
        self.go("30:33.78", FadeIn(q4), run=0.5)
        mn = M("-", size=44).move_to(s4[2])
        self.go("30:36.66", Transform(s4[2], mn), run=0.5)
        self.play(Create(box(s4, PINK, 0.12)), run_time=0.4)
        self.go("30:38.72", Indicate(q2, color=YEL, scale_factor=1.05), run=0.8)
        b1 = M(r"\frac{1-\sin^2 x}{\cos x}", "=", r"\frac{\cos^2 x}{\cos x}", size=46).move_to([3.3, -0.85, 0])
        self.go("30:42.58", Write(b1), run=1.6)
        b2 = M("=", r"\cos x", size=50).next_to(b1, DOWN, buff=0.45).align_to(b1[1], LEFT)
        self.go("30:45.98", Write(b2), run=0.8)
        self.play(Create(box(b2[1], GRN, 0.12)), run_time=0.4)
