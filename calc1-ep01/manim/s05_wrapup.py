"""Builder 05: practice Q4/Q5 with worked answers, the summary boards, Episode 2 teaser (limits), the close."""
from common import *


def eq_at(m, y, x=-1.0):
    """Place a MathTex so its part 1 (the '=') sits at (x, y): lines of working line up on '='."""
    return m.shift([x - m[1].get_x(), y - m[1].get_y(), 0])


def note(*parts):
    """Side note for a step of working, left-aligned in the right column."""
    return VGroup(*parts).arrange(RIGHT, buff=0.18)


def mini(f, xr, yr, segs=None, pos=ORIGIN):
    """Tiny chalk graph icon: small axes plus a BLUE curve (segs = list of x ranges, split at asymptotes)."""
    ax = Axes(x_range=[*xr, 1], y_range=[*yr, 1], x_length=2.0, y_length=1.3,
              axis_config=dict(color=DIM, stroke_width=2, include_tip=False, include_ticks=False, include_numbers=False)).move_to(pos)
    curve = VGroup(*[ax.plot(f, x_range=s, color=BLUE, stroke_width=4) for s in (segs or [xr])])
    return ax, curve


# ================================================================ practice: the two questions

class K05_Questions(Shot):
    def body(self):
        self.title("Practice Time", "14:53.94")
        div = Line([0, 2.1, 0], [0, -2.2, 0], color=FAINT, stroke_width=3)
        p4 = pill("Question 4", YEL, 40).move_to([-3.4, 1.6, 0])
        self.play(FadeIn(p4, shift=UP * 0.15), Create(div), run_time=0.5)
        f4 = M("f(x)", "=", "x-4", size=58).move_to([-3.4, 0.5, 0])
        self.go("14:55.38", Write(f4), run=0.9)
        g4 = M("g(x)", "=", "3x", size=58).move_to([-3.4, -0.5, 0])
        self.go("14:58.14", Write(g4), run=0.8)
        find4 = note(H("Find", 42, DIM), M("f(g(2))", size=60, color=YEL)).move_to([-3.4, -1.6, 0])
        self.go("15:00.22", FadeIn(find4[0]), Write(find4[1]), run=0.8)
        p5 = pill("Question 5", YEL, 40).move_to([3.4, 1.6, 0])
        self.go("15:02.44", FadeIn(p5, shift=UP * 0.15), run=0.5)
        inv = H("inverse of", 42, DIM).move_to([3.4, 0.5, 0])
        self.go("15:04.30", FadeIn(inv), run=0.4)
        f5 = M("f(x)", "=", "5x-1", size=58).move_to([3.4, -0.5, 0])
        self.go("15:05.00", Write(f5), run=1.0)
        ask5 = M(r"f^{-1}(x)", "=", "\\,?", size=60, color=YEL).move_to([3.4, -1.6, 0])
        self.go("15:06.94", Write(ask5), run=0.6)
        bars = VGroup(*[RoundedRectangle(width=0.2, height=0.62, corner_radius=0.08, color=YEL, stroke_width=5).move_to([dx, 0, 0]) for dx in (-0.17, 0.17)])
        pause = VGroup(bars, H("Pause now", 50, YEL)).arrange(RIGHT, buff=0.35).move_to([0, -3.05, 0])
        self.go("15:07.84", Create(pause[0]), Write(pause[1]), run=0.6)


# ================================================================ worked answers, foundation

class K05_Answers(Shot):
    def body(self):
        # --- Q4: inside first
        self.title("Question 4", "15:09.38")
        given = M(r"f(x)=x-4", r",\qquad", r"g(x)=3x", size=48, color=DIM).move_to([0, 1.85, 0])
        big = M("f(", "g(2)", ")", size=76).move_to([0, 0.75, 0])
        self.play(FadeIn(given), Write(big), run_time=0.5)
        ring = box(big[1], YEL, buff=0.1)
        first = H("inside first", 40, YEL).next_to(ring, RIGHT, buff=0.9)
        self.go("15:10.64", Create(ring), FadeIn(first, shift=LEFT * 0.2), run=0.5)
        L1 = M("g(2)", "=", r"3\cdot 2", "=", "6", size=60).move_to([0, -0.45, 0])
        L1[4].set_color(ORG)
        self.go("15:11.94", Write(L1[0:2]), run=0.5)
        self.go("15:12.96", Write(L1[2]), run=0.5)
        self.go("15:14.74", Write(L1[3:]), run=0.4)
        six = M("f(", "6", ")", size=76).move_to(big)
        six[1].set_color(ORG)
        self.go("15:15.50", ReplacementTransform(big, six), FadeOut(ring), FadeOut(first), run=0.35)
        L2 = M("f(6)", "=", "6-4", "=", "2", size=60)
        eq_at(L2, -1.6, L1[1].get_x())
        L2[4].set_color(GRN)
        self.go("15:15.86", Write(L2[0:2]), run=0.5)
        self.go("15:16.92", Write(L2[2]), run=0.5)
        self.go("15:18.72", Write(L2[3:]), run=0.4)
        ans = box(L2[4], GRN, buff=0.15)
        ok = tick_mark(GRN, 0.6).next_to(ans, RIGHT, buff=0.35)
        self.go("15:19.48", Create(ans), Create(ok), run=0.6)

        # --- Q5: swap, then solve for y
        self.wipe("15:20.90")
        self.title("Question 5", "15:21.34")
        given = note(H("inverse of", 38, DIM), M(r"f(x)=5x-1", size=48, color=DIM)).move_to([0, 2.0, 0])
        self.play(FadeIn(given), run_time=0.4)
        A = eq_at(M("y", "=", "5x-1", size=58), 0.85)
        self.go("15:22.60", Write(A), run=1.0)
        top = CurvedArrow(A[2][1].get_top() + UP * 0.1, A[0].get_top() + UP * 0.1, angle=PI / 2.4, color=YEL, stroke_width=3, tip_length=0.15)
        bot = CurvedArrow(A[0].get_bottom() + DOWN * 0.1, A[2][1].get_bottom() + DOWN * 0.1, angle=PI / 2.4, color=YEL, stroke_width=3, tip_length=0.15)
        s1 = H("swap x and y", 36, YEL).move_to([2.4, 0.38, 0], aligned_edge=LEFT)
        self.go("15:25.14", Create(top), Create(bot), FadeIn(s1, shift=LEFT * 0.2), run=0.6)
        B = eq_at(M("x", "=", "5", "y", "-1", size=58), -0.1)
        B[0].set_color(YEL); B[3].set_color(YEL)
        self.go("15:26.16", Write(B), run=0.8)
        self.play(FadeOut(top), FadeOut(bot), run_time=0.4)
        s2 = note(M("+1", size=48, color=ORG), H("both sides", 36, DIM)).move_to([2.4, -0.58, 0], aligned_edge=LEFT)
        self.go("15:28.60", FadeIn(s2, shift=LEFT * 0.2), run=0.5)
        C = eq_at(M("x+1", "=", "5y", size=58), -1.05)
        self.go("15:29.96", Write(C), run=0.8)
        s3 = note(M(r"\div 5", size=48, color=ORG), H("both sides", 36, DIM)).move_to([2.4, -1.6, 0], aligned_edge=LEFT)
        self.go("15:32.36", FadeIn(s3, shift=LEFT * 0.2), run=0.5)
        D = eq_at(M(r"f^{-1}(x)", "=", r"\frac{x+1}{5}", size=58), -2.65)
        self.go("15:34.08", Write(D[0:2]), run=0.5)
        self.go("15:34.74", Write(D[2]), run=1.1)
        ans = box(D, GRN, buff=0.18)
        self.go("15:36.30", Create(ans), run=0.6)

        # --- foundation is solid
        self.wipe("15:37.10")
        self.title("Your Foundation", "15:37.54")
        slab = Rectangle(width=7.4, height=0.95, color=CHALK, stroke_width=4).move_to([0, -2.65, 0])
        slab_t = H("Functions", 50, YEL).move_to(slab)
        self.go("15:38.92", Create(slab), Write(slab_t), run=0.7)
        ok = tick_mark(GRN, 0.7).next_to(slab, RIGHT, buff=0.45)
        self.go("15:39.72", Create(ok), run=0.5)
        y0 = slab.get_top()[1]
        house = DashedVMobject(VMobject().set_points_as_corners(
            [[-3.2, y0, 0], [-3.2, 0.2, 0], [0, 1.95, 0], [3.2, 0.2, 0], [3.2, y0, 0]]), num_dashes=46).set_stroke(DIM, 4)
        calc = H("Calculus", 64, CHALK).move_to([0, -0.85, 0])
        self.go("15:41.00", Create(house), Write(calc), run=1.0)


# ================================================================ summary board 1: machine, graph, domain/range

class K05_Summary(Shot):
    def body(self):
        self.title("Today's Summary", "15:42.54")
        X = 0.6   # right column left edge
        # 1) function = machine
        y1 = 1.55
        mbox = RoundedRectangle(width=1.3, height=1.0, corner_radius=0.15, color=CHALK, stroke_width=5).move_to([-3.6, y1, 0])
        fm = M("f", size=60, color=YEL).move_to(mbox)
        self.go("15:45.60", Create(mbox), Write(fm), run=0.6)
        t1 = H("a machine", 42, YEL).move_to([X, y1 + 0.3, 0], aligned_edge=LEFT)
        self.go("15:46.24", Write(t1), run=0.5)
        inA = Arrow([-5.5, y1, 0], mbox.get_left(), buff=0.1, color=ORG, stroke_width=4, tip_length=0.2)
        xin = M("x", size=50, color=ORG).next_to(inA, LEFT, buff=0.12)
        u1 = H("1 input, exactly 1 output", 36, DIM).move_to([X, y1 - 0.35, 0], aligned_edge=LEFT)
        self.go("15:47.26", GrowArrow(inA), FadeIn(xin), run=0.5)
        self.go("15:47.64", FadeIn(u1), run=0.5)
        outA = Arrow(mbox.get_right(), [-1.8, y1, 0], buff=0.1, color=BLUE, stroke_width=4, tip_length=0.2)
        self.go("15:48.64", GrowArrow(outA), run=0.4)
        fx = M("f(x)", size=50, color=BLUE).next_to(outA, RIGHT, buff=0.12)
        self.go("15:50.70", Write(fx), run=0.6)
        # 2) graph + vertical line test
        y2 = -0.3
        ax = Axes(x_range=[-2, 2, 1], y_range=[0, 4, 1], x_length=3.0, y_length=1.6,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=False, include_numbers=False)).move_to([-3.6, y2, 0])
        par = ax.plot(lambda x: x * x, x_range=[-2, 2], color=BLUE, stroke_width=5)
        t2 = H("graph", 42, YEL).move_to([X, y2 + 0.3, 0], aligned_edge=LEFT)
        self.go("15:52.48", Create(ax), Create(par), Write(t2), run=0.9)
        v = ValueTracker(-1.6)
        vl = always_redraw(lambda: DashedLine(ax.c2p(v.get_value(), 0), ax.c2p(v.get_value(), 4.2), color=YEL, stroke_width=3, dash_length=0.08))
        hit = always_redraw(lambda: Dot(ax.c2p(v.get_value(), v.get_value() ** 2), radius=0.07, color=YEL))
        u2 = H("vertical line test", 36, DIM).move_to([X, y2 - 0.35, 0], aligned_edge=LEFT)
        self.go("15:54.86", Create(vl), FadeIn(hit), FadeIn(u2), run=0.5)
        self.play(v.animate.set_value(1.6), run_time=1.6, rate_func=linear)
        ok = tick_mark(GRN, 0.45).next_to(u2, RIGHT, buff=0.3)
        self.go("15:57.14", Create(ok), run=0.4)
        # 3) domain and range, and the two traps
        d1 = note(H("domain:", 40, YEL), H("allowed inputs", 38))
        d2 = note(H("range:", 40, YEL), H("possible outputs", 38))
        d1.move_to([X, -2.05, 0], aligned_edge=LEFT)
        d2.move_to([X, -2.8, 0], aligned_edge=LEFT)
        self.go("15:58.14", FadeOut(vl), FadeOut(hit), Write(d1[0]), run=0.4)
        self.go("15:58.96", FadeIn(d1[1]), run=0.4)
        self.go("16:00.54", Write(d2[0]), run=0.4)
        self.go("16:01.28", FadeIn(d2[1]), run=0.4)
        warn = H("watch out", 38, RED).move_to([-3.6, -1.6, 0])
        self.go("16:02.88", FadeIn(warn), run=0.4)
        q0 = M(r"\frac{1}{0}", size=56).move_to([-4.6, -2.65, 0])
        sq = M(r"\sqrt{-4}", size=56).move_to([-2.6, -2.65, 0])
        self.go("16:03.56", Write(q0), run=0.5)
        self.go("16:04.22", Create(strike(q0, RED, 5)), run=0.4)
        self.go("16:04.98", Write(sq), run=0.5)
        self.go("16:05.80", Create(strike(sq, RED, 5)), run=0.4)


# ================================================================ summary board 2: the family, composition, inverse, rewatch

class K05_Family(Shot):
    def body(self):
        self.title("The Family", "16:07.14")
        fam = [
            ("linear", lambda x: 0.8 * x, (-2, 2), (-2, 2), None, "16:08.48"),
            ("quadratic", lambda x: x * x, (-2, 2), (0, 4), None, "16:09.40"),
            ("polynomial", lambda x: 0.5 * x ** 3 - 1.5 * x, (-2, 2), (-2, 2), None, "16:10.40"),
            ("rational", lambda x: 1 / x, (-2, 2), (-2, 2), [(-2, -0.5), (0.5, 2)], "16:11.60"),
            ("exponential", np.exp, (-2, 2), (0, 4), [(-2, np.log(4))], "16:12.72"),
            ("logarithmic", np.log, (0, 4), (-2, 2), [(np.exp(-2), 4)], "16:13.86"),
            ("trigonometric", np.sin, (-3.2, 3.2), (-1.5, 1.5), None, "16:15.24"),
        ]
        spots = [(-4.8, 1.2), (-1.6, 1.2), (1.6, 1.2), (4.8, 1.2), (-3.2, -1.25), (0, -1.25), (3.2, -1.25)]
        for (name, f, xr, yr, segs, t), (x, y) in zip(fam, spots):
            ax, curve = mini(f, xr, yr, segs, pos=[x, y, 0])
            lab = H(name, 36).next_to(ax, DOWN, buff=0.15)
            self.go(t, FadeIn(ax), Create(curve), FadeIn(lab, shift=UP * 0.1), run=0.6)

        # composition and inverse
        self.wipe("16:16.40")
        self.title("Combine and Undo", "16:16.84")
        div = Line([0, 1.7, 0], [0, -1.9, 0], color=FAINT, stroke_width=3)
        c_lab = H("composition", 44, YEL).move_to([-3.4, 1.25, 0])
        self.play(FadeIn(c_lab), run_time=0.4)
        fg = M("f(", "g(x)", ")", size=76).move_to([-3.4, 0, 0])
        self.go("16:17.80", Write(fg), run=0.8)
        self.go("16:18.88", Create(box(fg[1], YEL, buff=0.1)), run=0.5)
        first = H("inside first", 40, DIM).move_to([-3.4, -1.25, 0])
        self.go("16:20.38", FadeIn(first, shift=UP * 0.1), run=0.5)
        i_lab = H("inverse", 44, YEL).move_to([3.4, 1.25, 0])
        self.go("16:21.80", Create(div), run=0.4)
        finv = M(r"f^{-1}", size=72).move_to([3.4, -0.2, 0])
        self.go("16:22.26", FadeIn(i_lab), Write(finv), run=0.5)
        undo = CurvedArrow([4.5, 0.15, 0], [2.3, 0.15, 0], angle=PI * 0.8, color=YEL, stroke_width=5, tip_length=0.22)
        u_lab = H("undo button", 40, DIM).move_to([3.4, -1.25, 0])
        self.go("16:23.22", Create(undo), FadeIn(u_lab, shift=UP * 0.1), run=0.6)

        # every idea comes back
        self.wipe("16:24.40")
        self.title("Again and Again", "16:24.82")
        y = -0.2
        ep1 = pill("Ep 1", GRN, 38).move_to([-5.4, y, 0])
        road = Arrow([-4.55, y, 0], [6.3, y, 0], buff=0, color=DIM, stroke_width=4, tip_length=0.25)
        self.play(FadeIn(ep1), Create(road), run_time=0.7)
        for x, tex, t in ((-2.4, "f(x)", "16:26.68"), (0.6, "f(g(x))", "16:27.16"), (3.6, r"f^{-1}(x)", "16:27.92")):
            d = Dot([x, y, 0], radius=0.09, color=YEL)
            m = M(tex, size=50, color=BLUE).next_to(d, UP, buff=0.3)
            self.go(t, FadeIn(d, scale=1.6), Write(m), run=0.45)
        calc = H("calculus", 40, DIM).move_to([5.0, y - 0.6, 0])
        self.go("16:28.40", FadeIn(calc), run=0.4)

        # rewatch
        self.wipe("16:29.25")
        self.title("Felt Shaky?", "16:29.68")
        c = np.array([0, 0.35, 0])
        loop = Arc(radius=1.05, start_angle=PI / 2 + 0.35, angle=TAU - 0.9, arc_center=c, color=YEL, stroke_width=6)
        loop.add_tip(tip_length=0.28)
        self.go("16:30.18", Create(loop), run=0.8)
        play = Polygon(c + [-0.3, 0.42, 0], c + [-0.3, -0.42, 0], c + [0.45, 0, 0], color=CHALK, stroke_width=5)
        rw = H("rewatch", 54, YEL).move_to([0, -1.6, 0])
        self.go("16:31.56", Create(play), Write(rw), run=0.6)
        nx = H("before Episode 2", 40, DIM).move_to([0, -2.5, 0])
        self.go("16:32.74", FadeIn(nx, shift=UP * 0.1), run=0.5)


# ================================================================ Episode 2 teaser: limits

class K05_Next(Shot):
    def body(self):
        self.title("Next Episode", "16:35.16")
        ep = pill("Episode 2", CHALK, 44)
        lim = H("Limits", 76, YEL)
        VGroup(ep, lim).arrange(RIGHT, buff=0.6).move_to([0, 1.5, 0])
        self.go("16:36.28", FadeIn(ep, shift=UP * 0.15), run=0.5)
        self.go("16:37.58", Write(lim), run=0.7)
        f = lambda x: 0.25 * x * x + 1
        ax = Axes(x_range=[0, 4.5, 1], y_range=[0, 5, 1], x_length=6.0, y_length=3.2,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, include_numbers=False)).move_to([-0.6, -1.75, 0])
        xl = M("x", size=40, color=DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15)
        yl = M("y", size=40, color=DIM).next_to(ax.y_axis.get_end(), UP, buff=0.1)
        self.go("16:38.52", Create(ax), FadeIn(xl), FadeIn(yl), run=0.8)
        curve = VGroup(ax.plot(f, x_range=[0, 1.93], color=BLUE, stroke_width=5), ax.plot(f, x_range=[2.07, 4.0], color=BLUE, stroke_width=5))
        self.go("16:39.94", Create(curve), run=0.9)
        hole = Circle(radius=0.1, color=YEL, stroke_width=4).move_to(ax.c2p(2, f(2)))
        guide = DashedLine(ax.c2p(2, 0), ax.c2p(2, f(2)) + DOWN * 0.13, color=DIM, stroke_width=3, dash_length=0.08)
        two = M("2", size=40, color=DIM).next_to(ax.c2p(2, 0), DOWN, buff=0.15)
        self.go("16:41.74", Create(hole), Create(guide), FadeIn(two), run=0.5)
        xv = ValueTracker(0.4)
        dot = always_redraw(lambda: Dot(ax.c2p(xv.get_value(), f(xv.get_value())), radius=0.08, color=CHALK))
        self.go("16:42.36", FadeIn(dot, scale=1.5), run=0.4)
        for t, x in (("16:43.16", 1.0), ("16:43.86", 1.4), ("16:44.46", 1.6), ("16:45.00", 1.72)):
            self.go(t, xv.animate.set_value(x), run=0.45)
        arrow_lab = M(r"x \to 2", size=56, color=YEL).move_to([4.4, -1.0, 0])
        self.go("16:45.90", xv.animate.set_value(1.8), Write(arrow_lab), run=1.0)


# ================================================================ staircase and goodbye

class K05_Close(Shot):
    def body(self):
        self.title("Full Calculus 1 Course", "16:52.96")
        x0, y0, w, r = -5.5, -3.3, 2.1, 0.85
        steps, eps = [], []
        for k in range(5):
            xa, xb, yt = x0 + w * k, x0 + w * (k + 1), y0 + r * (k + 1)
            steps.append(VMobject(stroke_color=CHALK, stroke_width=5).set_points_as_corners([[xa, yt - r, 0], [xa, yt, 0], [xb, yt, 0]]))
            eps.append(H(f"Ep {k + 1}", 34, GRN if k == 0 else DIM).move_to([(xa + xb) / 2, yt - 0.42, 0]))
        floor = Line([x0 - 0.5, y0, 0], [x0 + 5 * w, y0, 0], color=DIM, stroke_width=3)
        self.go("16:54.94", Create(floor), LaggedStart(*[AnimationGroup(Create(s), FadeIn(e)) for s, e in zip(steps, eps)], lag_ratio=0.45), run=1.5)
        fn = H("Functions", 36, GRN).move_to([x0 + w / 2, y0 + r + 0.35, 0])
        lm = H("Limits", 36, YEL).move_to([x0 + 1.5 * w, y0 + 2 * r + 0.35, 0])
        self.go("16:56.50", FadeIn(fn, shift=UP * 0.1), FadeIn(lm, shift=UP * 0.1), run=0.5)
        up = Arrow([-4.4, -1.3, 0], [3.8, 2.0, 0], buff=0, color=YEL, stroke_width=4, tip_length=0.25)
        self.go("16:57.50", GrowArrow(up), run=1.0)

        self.at("16:59.15")
        self.clear_all()  # calm closing board
        thanks = H("Thanks for learning with me", 62).move_to([0, 1.0, 0])
        line = brush_line(thanks.width * 0.7, center=thanks.get_bottom() + DOWN * 0.18, seed=5)
        self.go("16:59.58", Write(thanks), run=1.0)
        self.play(Create(line), run_time=0.4)
        keep = H("keep practicing", 50, YEL).move_to([0, -0.5, 0])
        self.go("17:01.42", Write(keep), run=0.7)
        see = H("see you in Episode 2", 50, BLUE).move_to([0, -1.6, 0])
        self.go("17:02.76", Write(see), run=0.8)
