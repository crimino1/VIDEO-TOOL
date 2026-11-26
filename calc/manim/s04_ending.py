"""Builder 04: who invented calculus, real-life uses, quick quiz, summary, subscribe, goodbye (9:11 to the end)."""
from common import *


def bust(c, color=CHALK):
    """Head-and-shoulders outline (an unknown person)."""
    c = np.array(c, float)
    head = Circle(radius=0.34, color=color, stroke_width=5).move_to(c + UP * 0.5)
    body = Arc(radius=0.62, start_angle=0, angle=PI, arc_center=c + DOWN * 0.55, color=color, stroke_width=5)
    return VGroup(head, body)


def bubble(s, center, tail_to, size=42, color=CHALK):
    t = H(s, size).move_to(center)
    r = RoundedRectangle(width=t.width + 0.6, height=t.height + 0.5, corner_radius=0.3, color=color, stroke_width=4).move_to(t)
    top = r.get_top()
    tail = VMobject(stroke_color=color, stroke_width=4).set_points_as_corners([top + LEFT * 0.25, np.array(tail_to, float), top + RIGHT * 0.25])
    return VGroup(r, tail, t)


def plain_axes(xr, yr, xl, yl, center):
    return Axes(x_range=xr, y_range=yr, x_length=xl, y_length=yl,
                axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, include_ticks=False)).move_to(center)


def tangent_at(ax, f, x, length=1.6, color=PINK):
    p, q = ax.c2p(x, f(x)), ax.c2p(x + 0.01, f(x + 0.01))
    d = (q - p) / np.linalg.norm(q - p)
    return Line(p - d * length / 2, p + d * length / 2, color=color, stroke_width=5)


# ---------------------------------------------------------------- who invented it

class K04_Who(Shot):
    def body(self):
        self.title("Who Invented Calculus?", "9:11.06")
        y, xa, xb = -1.9, -4.2, 4.6
        line = Arrow([-6.3, y, 0], [6.3, y, 0], buff=0, color=DIM, stroke_width=4, tip_length=0.25)
        ta = Line([xa, y - 0.2, 0], [xa, y + 0.2, 0], color=CHALK, stroke_width=5)
        tb = Line([xb, y - 0.2, 0], [xb, y + 0.2, 0], color=CHALK, stroke_width=5)
        la = M(r"\text{late 1600s}", size=48, color=ORG).next_to(ta, DOWN, buff=0.2)
        lb = H("today", 44).next_to(tb, DOWN, buff=0.2)
        self.go("9:13.02", Create(line), Create(ta), Create(tb), FadeIn(la, lb), run=0.8)
        arc = ArcBetweenPoints([xa, y + 0.3, 0], [xb, y + 0.3, 0], angle=-PI / 3, color=ORG, stroke_width=4)
        yrs = M(r"\text{300+ years}", size=56, color=ORG).move_to([0.2, 0.05, 0])
        self.go("9:13.88", Create(arc), Write(yrs), run=0.8)
        b1, b2 = bust([-5.1, 0.35, 0]), bust([-3.3, 0.35, 0])
        q1 = H("?", 44, YEL).move_to(b1[0])
        q2 = H("?", 44, YEL).move_to(b2[0])
        self.go("9:14.96", Create(b1), Create(b2), run=0.8)
        self.play(FadeIn(q1, q2), run_time=0.4)
        d1 = DashedLine(b1.get_bottom() + DOWN * 0.1, [xa - 0.1, y + 0.3, 0], color=YEL, dash_length=0.1)
        d2 = DashedLine(b2.get_bottom() + DOWN * 0.1, [xa + 0.1, y + 0.3, 0], color=YEL, dash_length=0.1)
        self.go("9:17.44", Create(d1), Create(d2), run=0.6)
        self.play(Create(box(la, YEL, buff=0.12)), run_time=0.5)


class K04_Argue(Shot):
    def body(self):
        self.title("A Huge Argument")
        nw = H("Newton", 54).move_to([-3.6, 1.55, 0])
        ne = H("England", 36, DIM).next_to(nw, DOWN, buff=0.08)
        lw = H("Leibniz", 54).move_to([3.6, 1.55, 0])
        le = H("Germany", 36, DIM).next_to(lw, DOWN, buff=0.08)
        self.play(FadeIn(nw, ne, lw, le, shift=DOWN * 0.15), run_time=0.4)
        bn = bubble("I was first!", [-3.6, -0.45, 0], [-3.6, ne.get_bottom()[1] - 0.12, 0])
        bl = bubble("I was first!", [3.6, -0.45, 0], [3.6, le.get_bottom()[1] - 0.12, 0])
        self.go("9:28.12", Create(bn[:2]), Write(bn[2]), run=0.6)
        self.go("9:28.66", Create(bl[:2]), Write(bl[2]), run=0.6)
        bolt = VMobject(stroke_color=RED, stroke_width=6).set_points_as_corners([[0.3, 1.0, 0], [-0.25, 0.1, 0], [0.25, 0.0, 0], [-0.3, -1.0, 0]])
        self.go("9:31.08", Create(bolt), run=0.5)
        self.go("9:33.54", FadeOut(bn), FadeOut(bl), FadeOut(bolt), run=0.4)
        t1 = tick_mark(GRN, 0.55).next_to(nw, RIGHT, buff=0.3)
        t2 = tick_mark(GRN, 0.55).next_to(lw, RIGHT, buff=0.3)
        self.go("9:34.52", Create(t1), Create(t2), run=0.5)
        co = H("co-inventors", 52, GRN).move_to([0, -0.7, 0])
        self.go("9:35.46", Write(co), run=0.6)
        # Leibniz's symbols
        self.wipe("9:36.24")
        self.title("Leibniz's Symbols")
        dydx = M(r"\frac{dy}{dx}", size=120, color=PINK).move_to([-3.2, 0.0, 0])
        integ = M(r"\int", size=150, color=GRN).move_to([3.2, 0.0, 0])
        self.go("9:37.40", Write(dydx), run=0.8)
        self.go("9:38.28", Write(integ), run=0.8)
        ly = min(dydx.get_bottom()[1], integ.get_bottom()[1]) - 0.45
        l1 = H("derivative", 40, PINK).move_to([-3.2, ly, 0])
        l2 = H("integral", 40, GRN).move_to([3.2, ly, 0])
        self.play(FadeIn(l1, l2, shift=UP * 0.1), run_time=0.5)
        since = H("in use since the 1670s", 40, YEL).move_to([0, -3.25, 0])
        self.go("9:40.10", FadeIn(since, shift=UP * 0.1), run=0.5)


# ---------------------------------------------------------------- real life

class K04_Life(Shot):
    def body(self):
        self.title("Calculus in Real Life", "9:41.04")
        c = np.array([0, -0.75, 0])
        r = 1.75
        globe = VGroup(Circle(radius=r, color=BLUE, stroke_width=5).move_to(c),
                       Ellipse(width=1.7, height=2 * r, color=BLUE, stroke_width=3).move_to(c),
                       Line(c + UP * r, c + DOWN * r, color=BLUE, stroke_width=3),
                       Line(c + LEFT * r, c + RIGHT * r, color=BLUE, stroke_width=3))
        for yy in (0.95, -0.95):
            w = np.sqrt(r * r - yy * yy)
            globe.add(Line(c + [-w, yy, 0], c + [w, yy, 0], color=BLUE, stroke_width=3))
        self.go("9:41.86", Create(globe), run=1.0)
        spots = VGroup(*[Dot(c + np.array(p), color=YEL, radius=0.11) for p in ((-0.9, 0.9, 0), (0.6, 1.2, 0), (1.1, -0.3, 0), (-0.4, -0.6, 0), (0.3, -1.3, 0), (-1.3, -0.2, 0))])
        self.go("9:44.60", LaggedStart(*[FadeIn(d, scale=0.5) for d in spots], lag_ratio=0.15), run=0.8)


class K04_Moon(Shot):
    def body(self):
        self.title("To the Moon")
        earth = Circle(radius=0.85, color=BLUE, stroke_width=5, fill_color=BLUE, fill_opacity=0.15).move_to([-5.0, -2.45, 0])
        moon = VGroup(Circle(radius=0.45, color=CHALK, stroke_width=4),
                      Circle(radius=0.09, color=DIM, stroke_width=2).shift([-0.15, 0.12, 0]),
                      Circle(radius=0.06, color=DIM, stroke_width=2).shift([0.16, -0.1, 0])).move_to([5.0, 1.35, 0])
        le = H("Earth", 36, DIM).next_to(earth, RIGHT, buff=0.2).shift(DOWN * 0.3)
        lm = H("Moon", 36, DIM).next_to(moon, DOWN, buff=0.15)
        path = ArcBetweenPoints(earth.point_at_angle(PI / 4), moon[0].point_at_angle(PI * 1.05), angle=-PI / 3)
        dashed = DashedVMobject(path.copy().set_stroke(DIM, 3), num_dashes=45)
        self.play(Create(earth), Create(moon), FadeIn(le, lm), Create(dashed), run_time=0.6)
        a = ValueTracker(0)

        def where():
            v = a.get_value()
            p = path.point_from_proportion(v)
            q = path.point_from_proportion(min(v + 0.01, 1)) if v < 0.99 else p + (p - path.point_from_proportion(v - 0.01))
            return p, (q - p) / np.linalg.norm(q - p)
        rocket = always_redraw(lambda: Dot(where()[0], color=BLUE, radius=0.13))
        arrow = always_redraw(lambda: Arrow(where()[0], where()[0] + where()[1] * 1.1, buff=0, color=PINK, stroke_width=5, tip_length=0.2))
        self.play(FadeIn(rocket), FadeIn(arrow), run_time=0.3)
        self.at("9:51.26")
        a.add_updater(lambda m, dt: m.set_value(min(1, m.get_value() + dt / 2.4)))
        self.add(a)
        ls = VGroup(Arrow(ORIGIN, RIGHT * 0.8, buff=0, color=PINK, stroke_width=5, tip_length=0.2), H("speed", 38, PINK)).arrange(RIGHT, buff=0.25)
        lp = VGroup(Dot(color=BLUE, radius=0.13), H("position", 38, BLUE)).arrange(RIGHT, buff=0.3)
        ls.move_to([3.2, -2.3, 0], aligned_edge=LEFT)
        lp.move_to([3.2 + 0.33, -3.05, 0], aligned_edge=LEFT)
        self.go("9:51.74", FadeIn(ls, shift=UP * 0.1), run=0.4)
        self.go("9:52.36", FadeIn(lp, shift=UP * 0.1), run=0.4)
        self.at("9:53.80")
        a.clear_updaters()


class K04_Games(Shot):
    def body(self):
        self.title("Video Games", "9:54.82")
        gy, rad = -2.9, 0.28
        base = gy + rad
        hops = [(-5.6, -1.6, 3.2), (-1.6, 1.4, 1.8), (1.4, 3.6, 1.0), (3.6, 5.2, 0.5)]

        def yof(x):
            for x0, x1, h in hops:
                if x0 <= x <= x1:
                    return base + h * (1 - ((2 * x - x0 - x1) / (x1 - x0)) ** 2)
            return base
        ground = Line([-6.3, gy, 0], [6.3, gy, 0], color=CHALK, stroke_width=4)
        ball = Circle(radius=rad, color=ORG, stroke_width=5, fill_color=ORG, fill_opacity=0.35).move_to([-5.6, base, 0])
        self.go("9:56.20", Create(ground), run=0.5)
        self.go("9:56.74", FadeIn(ball, shift=DOWN * 0.2), run=0.4)
        pts = [[x, yof(x), 0] for x0, x1, h in hops for x in np.linspace(x0, x1, 40)]
        path = VMobject().set_points_smoothly(pts)
        dashed = DashedVMobject(path.copy().set_stroke(BLUE, 4), num_dashes=80, dashed_ratio=0.55)
        self.go("9:58.10", Create(dashed), run=1.0)
        self.go("9:59.44", UpdateFromAlphaFunc(ball, lambda m, al: m.move_to([-5.6 + 10.8 * al, yof(-5.6 + 10.8 * al), 0])),
                run=2.0, rate_func=linear)
        x0, x1, h = hops[0]
        tans = VGroup()
        for x in (-4.8, -3.6, -2.4):
            p = np.array([x, yof(x), 0])
            s = -h * 2 * (2 * x - x0 - x1) / (x1 - x0) * 2 / (x1 - x0)
            d = np.array([1, s, 0]) / np.hypot(1, s)
            tans.add(VGroup(Line(p - d * 0.7, p + d * 0.7, color=PINK, stroke_width=5), Dot(p, color=PINK, radius=0.07)))
        self.go("10:01.74", LaggedStart(*[Create(t) for t in tans], lag_ratio=0.3), run=0.7)
        lab = H("slope at every moment", 38, PINK).move_to([3.4, 1.4, 0])
        self.go("10:02.36", Write(lab), run=0.6)


class K04_Medicine(Shot):
    def body(self):
        self.title("Medicine", "10:03.94")
        rr = RoundedRectangle(width=2.6, height=1.0, corner_radius=0.5, color=CHALK, stroke_width=5)
        half = Intersection(rr, Rectangle(width=1.3, height=1.2).move_to(rr.get_left() + RIGHT * 0.65),
                            fill_color=ORG, fill_opacity=0.5, stroke_width=0)
        pill_ = VGroup(half, rr, Line(rr.get_top(), rr.get_bottom(), color=CHALK, stroke_width=4)).rotate(25 * DEGREES).move_to([-4.7, -0.5, 0])
        self.go("10:05.08", Create(pill_[1:]), FadeIn(pill_[0]), run=0.6)
        ax = plain_axes([0, 10, 2], [0, 1, 0.5], 6.2, 3.6, [2.4, -0.9, 0])
        yl = H("in the blood", 36, DIM).next_to(ax.c2p(0, 1), UP, buff=0.2)
        xl = H("time (hours)", 36, DIM).next_to(ax.c2p(10, 0), DOWN, buff=0.2).shift(LEFT * 1.0)
        self.play(Create(ax), FadeIn(yl, xl), run_time=0.5)
        k = 0.9 / 0.4423
        f = lambda t: k * (np.exp(-0.25 * t) - np.exp(-0.9 * t))
        curve = ax.plot(f, x_range=[0, 10], color=BLUE, stroke_width=5)
        self.go("10:06.40", Create(curve), run=1.0)
        tan = tangent_at(ax, f, 0.6, 1.4)
        dot = Dot(ax.c2p(0.6, f(0.6)), color=PINK, radius=0.08)
        self.go("10:07.48", Create(tan), FadeIn(dot), run=0.5)
        fast = H("fast rise", 36, PINK).next_to(ax.c2p(0, f(0.6)), LEFT, buff=0.3)
        self.play(FadeIn(fast, shift=LEFT * 0.1), run_time=0.4)


class K04_AI(Shot):
    def body(self):
        self.title("How AI Learns", "10:13.58")
        chat = RoundedRectangle(width=3.4, height=1.7, corner_radius=0.4, color=CHALK, stroke_width=5).move_to([0, -0.2, 0])
        tail = VMobject(stroke_color=CHALK, stroke_width=5).set_points_as_corners([chat.get_corner(DL) + [0.6, 0, 0], chat.get_corner(DL) + [0.3, -0.6, 0], chat.get_corner(DL) + [1.2, 0, 0]])
        dots = VGroup(*[Dot([x, -0.2, 0], color=YEL, radius=0.13) for x in (-0.7, 0, 0.7)])
        self.go("10:15.58", Create(chat), Create(tail), run=0.6)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.3), run_time=0.6)
        ax = plain_axes([0, 11, 1], [0, 4.5, 1], 9, 4.2, [0.4, -0.8, 0])
        f = lambda x: 0.11 * (x - 6) ** 2 + 0.5
        curve = ax.plot(f, x_range=[0.2, 11], color=BLUE, stroke_width=5)
        yl = H("mistakes", 36, DIM).next_to(ax.c2p(0, 4.5), UP, buff=0.15)
        xl = H("choices", 36, DIM).next_to(ax.c2p(11, 0), DOWN, buff=0.2).shift(LEFT * 0.4)
        self.go("10:18.36", FadeOut(VGroup(chat, tail, dots)), run=0.3)
        self.play(Create(ax), Create(curve), FadeIn(yl, xl), run_time=0.8)
        xt = ValueTracker(1.0)
        dot = always_redraw(lambda: Dot(ax.c2p(xt.get_value(), f(xt.get_value())), color=YEL, radius=0.13))
        self.play(FadeIn(dot, scale=0.5), run_time=0.3)
        tan = always_redraw(lambda: tangent_at(ax, f, xt.get_value(), 1.8))
        self.go("10:20.44", FadeIn(tan), run=0.4)
        goal = Dot(ax.c2p(6, f(6)), color=GRN, radius=0.1)
        gl = H("fewest mistakes", 36, GRN).next_to(ax.c2p(6, 0), DOWN, buff=0.2)
        self.go("10:21.90", FadeIn(goal, scale=0.5), FadeIn(gl, shift=UP * 0.1), run=0.5)
        self.add(dot)  # keep the moving dot on top of the goal dot
        x = 1.0
        x = x + 0.22 * (6 - x)
        self.go("10:23.90", xt.animate.set_value(x), run=0.5)
        self.at("10:25.76")
        for _ in range(6):
            x = x + 0.22 * (6 - x)
            self.play(xt.animate.set_value(x), run_time=0.26)


# ---------------------------------------------------------------- quiz

class K04_Q1(Shot):
    def body(self):
        self.title("Quick Quiz")
        bars = VGroup(*[RoundedRectangle(width=0.5, height=1.8, corner_radius=0.18, color=YEL, stroke_width=6).move_to([x, -0.4, 0]) for x in (-0.5, 0.5)])
        ring = Circle(radius=1.55, color=CHALK, stroke_width=5).move_to([0, -0.4, 0])
        self.go("10:32.96", Create(ring), Create(bars), run=0.7)
        self.go("10:35.20", FadeOut(ring, bars), run=0.3)
        p = pill("Question 1", ORG, 44).move_to([0, 1.65, 0])
        self.go("10:35.64", FadeIn(p, shift=DOWN * 0.1), run=0.4)
        q = H("Calculus is the math of ____ ?", 58).move_to([0, 0.3, 0])
        self.go("10:36.92", Write(q), run=0.9)
        ans = H("change", 88, YEL).move_to([0, -1.5, 0])
        self.go("10:39.34", Write(ans), run=0.6)
        ul = brush_line(ans.width + 0.6, center=ans.get_bottom() + DOWN * 0.15)
        tk = tick_mark(GRN, 0.7).next_to(ans, RIGHT, buff=0.5)
        self.go("10:40.22", Create(ul), Create(tk), run=0.6)
        self.wipe("10:42.20", run=0.3)


class K04_Q2(Shot):
    def body(self):
        self.title("Quick Quiz", animate=False)
        p = pill("Question 2", ORG, 44).move_to([0, 1.65, 0])
        self.go("10:42.74", FadeIn(p, shift=DOWN * 0.1), run=0.4)
        q = VGroup(H("How fast is it changing", 54), H("at one exact moment?", 54, t2c={"one exact moment": YEL})).arrange(DOWN, buff=0.2).move_to([0, 0.1, 0])
        self.go("10:43.98", Write(q), run=1.2)
        ans = H("the derivative", 64, PINK).move_to([-3.0, -2.0, 0])
        self.go("10:49.12", Write(ans), run=0.6)
        c = np.array([3.4, -2.75, 0])
        gauge = VGroup(Arc(radius=1.3, start_angle=0, angle=PI, arc_center=c, color=CHALK, stroke_width=5))
        for k in range(7):
            a = PI - k * PI / 6
            u = np.array([np.cos(a), np.sin(a), 0])
            gauge.add(Line(c + u * 1.05, c + u * 1.3, color=DIM, stroke_width=3))
        needle = Line(c, c + LEFT * 1.0, color=PINK, stroke_width=6)
        hub = Dot(c, color=PINK, radius=0.09)
        self.go("10:50.10", Create(gauge), Create(needle), FadeIn(hub), run=0.5)
        self.play(Rotate(needle, angle=-PI * 0.62, about_point=c), run_time=0.8)
        self.wipe("10:51.35", run=0.3)


class K04_Q3(Shot):
    def body(self):
        self.title("Quick Quiz", animate=False)
        p = pill("Question 3", ORG, 44).move_to([0, 1.65, 0])
        self.go("10:51.80", FadeIn(p, shift=DOWN * 0.1), run=0.4)
        q = VGroup(H("Which idea adds up tiny pieces", 54), H("to find a total?", 54)).arrange(DOWN, buff=0.2).move_to([0, 0.1, 0])
        self.go("10:53.28", Write(q), run=1.2)
        ax = Axes(x_range=[0, 4], y_range=[0, 2.6], x_length=3.8, y_length=2.1, tips=False,
                  axis_config=dict(color=DIM, stroke_width=3, include_ticks=False)).move_to([3.4, -2.45, 0])
        g = lambda x: 0.8 + 0.6 * x - 0.08 * x * x
        curve = ax.plot(g, x_range=[0, 4], color=BLUE, stroke_width=5)
        area = ax.get_area(curve, x_range=[0.3, 3.7], color=GRN, opacity=0.35)
        self.go("10:57.06", Create(ax), Create(curve), run=0.5)
        self.play(FadeIn(area), run_time=0.4)
        ans = VGroup(M(r"\int", size=90, color=GRN), H("the integral", 64, GRN)).arrange(RIGHT, buff=0.3).move_to([-3.0, -2.2, 0])
        self.go("10:59.20", Write(ans), run=0.6)
        rects = ax.get_riemann_rectangles(curve, x_range=[0.3, 3.7], dx=0.17, color=GRN, fill_opacity=0.5, stroke_width=1, stroke_color=CHALK)
        self.go("11:00.78", ReplacementTransform(area, rects), run=0.7)
        self.wipe("11:01.85", run=0.3)


class K04_Q4(Shot):
    def body(self):
        self.title("Quick Quiz", animate=False)
        p = pill("Question 4", ORG, 44).move_to([0, 1.65, 0])
        self.go("11:02.34", FadeIn(p, shift=DOWN * 0.1), run=0.4)
        rule = H("use the power rule", 42, DIM).move_to([0, 0.7, 0])
        self.go("11:04.08", FadeIn(rule, shift=UP * 0.1), run=0.5)
        eq = M(r"\frac{d}{dx}\,", "x^2", "=", "?", size=84).move_to([0, -0.8, 0])
        self.go("11:06.44", Write(eq), run=0.9)
        eq2 = M(r"\frac{d}{dx}\,", "x^2", "=", "2x", size=84)
        eq2.shift(eq[0].get_center() - eq2[0].get_center())
        eq2[3].set_color(PINK)
        self.go("11:08.74", ReplacementTransform(eq[3], eq2[3]), run=0.5)
        fin = M("2", "x", "^{1}", "=", "2x", size=90).move_to([0.3, -2.75, 0])
        fin[0].set_color(ORG); fin[2].set_color(ORG); fin[4].set_color(PINK)
        st = M("x", "^{2}", size=90)
        st.shift(fin[1].get_center() - st[0].get_center())
        st[1].set_color(ORG)
        self.go("11:09.84", TransformFromCopy(eq[1], st), run=0.4)
        self.go("11:10.30", TransformFromCopy(st[1], fin[0], path_arc=PI / 2), run=0.6)
        self.go("11:11.74", Transform(st[1], fin[2]), run=0.5)
        self.go("11:12.34", Write(fin[3:]), run=0.5)
        self.wipe("11:13.15", run=0.3)


class K04_Congrats(Shot):
    def body(self):
        self.title("Quick Quiz", animate=False)
        self.title("All 4 Right?", "11:13.62")
        nums = VGroup()
        for i, x in enumerate((-3.3, -1.1, 1.1, 3.3)):
            nums.add(VGroup(Circle(radius=0.55, color=CHALK, stroke_width=4), M(str(i + 1), size=56)).move_to([x, 1.0, 0]))
        ticks = VGroup(*[tick_mark(GRN, 0.5).move_to(n.get_corner(UR) + [0.22, 0.08, 0]) for n in nums])
        self.play(FadeIn(nums, shift=UP * 0.1), run_time=0.4)
        self.play(LaggedStart(*[Create(t) for t in ticks], lag_ratio=0.25), run_time=0.7)
        cg = H("Congratulations!", 80, YEL).move_to([0, -0.6, 0])
        self.go("11:15.20", Write(cg), run=0.8)
        you = VGroup(H("you", 60), M(">", size=72, color=YEL), H("most adults", 60)).arrange(RIGHT, buff=0.35).move_to([0, -2.4, 0])
        self.go("11:18.16", FadeIn(you, shift=UP * 0.15), run=0.6)
        self.wipe("11:20.05", run=0.35)


# ---------------------------------------------------------------- summary

class K04_Sum(Shot):
    def body(self):
        self.title("All 4 Right?", animate=False)
        self.title("Let's Sum It Up", "11:20.64")
        top = H("Calculus: the math of change", 54, t2c={"change": YEL}).move_to([0, 1.85, 0])
        self.go("11:23.24", Write(top), run=1.0)
        # derivative side
        L = np.array([-3.6, 0, 0])
        dname = H("Derivative", 50, PINK).move_to(L + UP * 0.7)
        f = lambda x: 0.12 * (x + 1.6) ** 2
        dcurve = FunctionGraph(f, x_range=[-1.6, 1.6], color=BLUE, stroke_width=4).move_to(L + DOWN * 0.55)
        sh = dcurve.get_center() - np.array([0, (f(-1.6) + f(1.6)) / 2, 0])
        xp = 0.5
        P = np.array([xp, f(xp), 0]) + sh
        d = np.array([1, 0.24 * (xp + 1.6), 0]); d /= np.linalg.norm(d)
        dtan = VGroup(Line(P - d * 0.8, P + d * 0.8, color=PINK, stroke_width=5), Dot(P, color=PINK, radius=0.07))
        lens = VGroup(Circle(radius=0.4, color=CHALK, stroke_width=4).move_to(P),
                      Line(P + np.array([0.28, -0.28, 0]), P + np.array([0.75, -0.75, 0]), color=CHALK, stroke_width=6))
        dcap = H("how fast, right now", 38).move_to(L + DOWN * 1.85)
        # integral side
        R = np.array([3.6, 0, 0])
        iname = H("Integral", 50, GRN).move_to(R + UP * 0.7)
        g = lambda x: 0.35 + 0.1 * (x + 1.6) ** 2
        ox = R + np.array([0, -1.35, 0])
        icurve = FunctionGraph(g, x_range=[-1.6, 1.6], color=BLUE, stroke_width=4).shift(ox)
        bars = VGroup(*[Rectangle(width=0.32, height=g(x), stroke_color=CHALK, stroke_width=1.5, fill_color=GRN, fill_opacity=0.5)
                        .move_to(ox + np.array([x, g(x) / 2, 0])) for x in np.arange(-1.44, 1.6, 0.32)])
        base = Line(ox + LEFT * 1.7, ox + RIGHT * 1.7, color=DIM, stroke_width=3)
        icap = H("adds up the total", 38).move_to(R + DOWN * 1.85)
        lpan = panel(VGroup(dname, dcurve, lens, dcap), PINK, buff=0.3)
        rpan = panel(VGroup(iname, icurve, base, icap), GRN, buff=0.3)
        self.go("11:27.68", Create(lpan), Write(dname), run=0.6)
        self.play(Create(dcurve), run_time=0.5)
        self.go("11:28.92", Create(lens), run=0.6)
        self.go("11:29.84", Create(dtan), run=0.5)
        self.go("11:30.50", FadeIn(dcap, shift=UP * 0.1), run=0.5)
        self.go("11:32.86", Create(rpan), Write(iname), Create(base), Create(icurve), run=0.7)
        self.go("11:34.06", LaggedStart(*[FadeIn(b, shift=UP * 0.1) for b in bars], lag_ratio=0.12), run=0.9)
        self.go("11:35.46", FadeIn(icap, shift=UP * 0.1), run=0.5)
        lim = H("both built on limits", 46, t2c={"limits": YEL}).move_to([0, -3.1, 0])
        self.go("11:36.78", Write(lim), run=0.8)
        a1 = Arrow(lim.get_left() + [0.3, 0.25, 0], lpan.get_bottom() + [0.9, 0, 0], buff=0.08, color=DIM, stroke_width=3, tip_length=0.18)
        a2 = Arrow(lim.get_right() + [-0.3, 0.25, 0], rpan.get_bottom() + [-0.9, 0, 0], buff=0.08, color=DIM, stroke_width=3, tip_length=0.18)
        self.play(Create(a1), Create(a2), run_time=0.5)
        self.go("11:41.82", FadeOut(lim, a1, a2), run=0.4)
        dbl = DoubleArrow([-0.95, -0.35, 0], [0.95, -0.35, 0], buff=0, color=YEL, stroke_width=5, tip_length=0.22)
        opp = H("opposites", 38, YEL).next_to(dbl, UP, buff=0.15)
        self.go("11:42.98", GrowFromCenter(dbl), FadeIn(opp), run=0.6)
        ftc = pill("Fundamental Theorem of Calculus", YEL, 42).move_to([0, -3.05, 0])
        self.go("11:45.16", FadeIn(ftc, shift=UP * 0.1), run=0.6)
        self.wipe("11:48.05", run=0.4)


class K04_Tree(Shot):
    def body(self):
        self.title("Let's Sum It Up", animate=False)
        self.title("The Heart of Calculus", "11:48.66")
        trunk = VGroup(Line([-0.4, -3.3, 0], [-0.2, -1.0, 0], color=CHALK, stroke_width=6),
                       Line([0.4, -3.3, 0], [0.2, -1.0, 0], color=CHALK, stroke_width=6),
                       Line([-1.4, -3.3, 0], [1.4, -3.3, 0], color=DIM, stroke_width=4))
        lim = H("limits", 44, YEL).move_to([1.6, -2.6, 0])
        self.go("11:49.18", Create(trunk), Write(lim), run=0.6)
        EL, ER = np.array([-3.4, 0.6, 0]), np.array([3.4, 0.6, 0])
        bl = ArcBetweenPoints([-0.2, -1.0, 0], EL, angle=PI / 5, color=PINK, stroke_width=6)
        br = ArcBetweenPoints([0.2, -1.0, 0], ER, angle=-PI / 5, color=GRN, stroke_width=6)
        self.play(Create(bl), Create(br), run_time=0.6)
        dl = H("derivative", 46, PINK).move_to([-4.6, 0.05, 0])
        il = H("integral", 46, GRN).move_to([4.6, 0.05, 0])
        self.play(Write(dl), Write(il), run_time=0.5)

        def leaves(end, specs):
            tw, lb = VGroup(), VGroup()
            for dx, txt in specs:
                tip = end + np.array([dx, 0.85, 0])
                tw.add(Line(end, tip, color=CHALK, stroke_width=4))
                lb.add(H(txt, 38).next_to(tip, UP, buff=0.12))
            return tw, lb
        twl, lbl = leaves(EL, [(-1.6, "power rule"), (1.0, "chain rule")])
        twr, lbr = leaves(ER, [(-1.0, "areas"), (1.6, "volumes")])
        self.go("11:52.98", Create(twl), FadeIn(lbl, shift=UP * 0.1), run=0.6)
        self.go("11:53.84", Create(twr), FadeIn(lbr, shift=UP * 0.1), run=0.6)
        self.go("11:55.42", Circumscribe(lim, color=YEL, buff=0.12), run=0.9)
        self.wipe("11:57.85", run=0.4)


class K04_Course(Shot):
    def body(self):
        self.title("The Heart of Calculus", animate=False)
        self.title("Going Deeper", "11:58.38")
        full = pill("Full calculus course", YEL, 44).move_to([-3.1, 1.6, 0])
        self.go("12:00.84", FadeIn(full, shift=DOWN * 0.1), run=0.5)
        x0, y0, w, h = -6.2, -3.3, 2.95, 1.1
        pts = [[x0, y0, 0]]
        for k in range(4):
            pts.append([x0 + w * (k + 1), y0 + h * k, 0])
            if k < 3:
                pts.append([x0 + w * (k + 1), y0 + h * (k + 1), 0])
        stairs = VMobject(stroke_color=CHALK, stroke_width=5).set_points_as_corners(pts)
        self.go("12:02.86", Create(stairs), run=0.8)
        labs = [H("limits", 40), H("derivatives", 40, PINK), H("integrals", 40, GRN),
                VGroup(H("advanced", 38, GRN), H("integrals", 38, GRN)).arrange(DOWN, buff=0.04)]
        for k, lab in enumerate(labs):
            lab.move_to([x0 + w * (k + 0.5), y0 + h * k, 0], aligned_edge=DOWN).shift(UP * 0.15)
        for t, lab in zip(("12:04.20", "12:04.56", "12:04.96", "12:05.36"), labs):
            self.go(t, FadeIn(lab, shift=UP * 0.1), run=0.35)
        pr = H("+ lots of practice", 42, ORG).move_to([-3.1, 0.65, 0])
        self.go("12:06.78", FadeIn(pr, shift=UP * 0.1), run=0.4)


class K04_Bye(Shot):
    def body(self):
        th = H("Thanks for watching!", 80).move_to([0, 1.0, 0])
        self.go("12:14.32", Write(th), run=0.8)
        ul = brush_line(th.width + 0.4, center=th.get_bottom() + DOWN * 0.15)
        self.play(Create(ul), run_time=0.35)
        cur = H("keep being curious", 60, YEL).move_to([0, -0.6, 0])
        self.go("12:15.58", FadeIn(cur, shift=UP * 0.12), run=0.6)
        see = H("see you in the next video", 46, DIM).move_to([0, -1.8, 0])
        self.go("12:17.06", FadeIn(see, shift=UP * 0.12), run=0.6)
