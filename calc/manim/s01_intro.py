"""Builder 01: welcome, calculus = the math of change, the two big ideas, derivative intro (speedometer, walk, slope)."""
from common import *


# ---------------------------------------------------------------- chalk drawings

def poly(pts, color=CHALK, width=5, close=False):
    pts = [np.array([p[0], p[1], 0.0]) for p in pts]
    if close:
        pts.append(pts[0])
    return VMobject(stroke_color=color, stroke_width=width).set_points_as_corners(pts)


def car(color=CHALK, family=False):
    """Side view, bottom of wheels at y=0, centred on x=0."""
    body = poly([(-1.25, 0.28), (-1.25, 0.68), (-0.65, 0.74), (-0.35, 1.14), (0.45, 1.14), (0.82, 0.74), (1.25, 0.64), (1.25, 0.28)], color, close=True)
    win = VGroup(poly([(-0.5, 0.74), (-0.3, 1.02), (0.02, 1.02), (0.02, 0.74)], color, 3, True),
                 poly([(0.12, 0.74), (0.12, 1.02), (0.4, 1.02), (0.62, 0.74)], color, 3, True))
    wheels = VGroup(*[Circle(radius=0.27, color=color, stroke_width=5).move_to([x, 0.27, 0]) for x in (-0.68, 0.68)])
    g = VGroup(body, win, wheels)
    if family:
        g.add(VGroup(*[Circle(radius=0.08, color=YEL, stroke_width=3).move_to([x, 0.86, 0]) for x in (-0.24, -0.08, 0.27)]))
    return g


def walker(color=CHALK, s=1.0):
    """Stick figure, feet at y=0."""
    g = VGroup(Circle(radius=0.2, color=color, stroke_width=5).move_to([0, 1.3, 0]),
               seg([0, 1.1, 0], [0, 0.55, 0], color),
               seg([0, 0.95, 0], [-0.28, 0.65, 0], color), seg([0, 0.95, 0], [0.3, 0.7, 0], color),
               seg([0, 0.55, 0], [-0.25, 0, 0], color), seg([0, 0.55, 0], [0.25, 0, 0], color))
    return g.scale(s, about_point=ORIGIN)


def house(color=CHALK):
    """Floor at y=0, centred on x=0."""
    return VGroup(poly([(-0.7, 0), (-0.7, 0.9), (0.7, 0.9), (0.7, 0)], color, close=True),
                  poly([(-0.85, 0.9), (0, 1.55), (0.85, 0.9)], color),
                  poly([(-0.15, 0), (-0.15, 0.5), (0.15, 0.5), (0.15, 0)], color, 3))


def basket():
    b = VGroup(poly([(-1.3, 0.9), (-1.0, 0), (1.0, 0), (1.3, 0.9)], ORG, 5, True),
               poly([(-1.15, 0.45), (1.15, 0.45)], ORG, 2))
    apples = VGroup()
    for x, y in ((-0.75, 1.2), (-0.25, 1.25), (0.25, 1.2), (0.75, 1.25), (0, 1.7)):
        apples.add(VGroup(Circle(radius=0.27, color=RED, stroke_width=4).move_to([x, y, 0]),
                          seg([x, y + 0.24, 0], [x + 0.06, y + 0.42, 0], GRN, 3)))
    return VGroup(b, apples)


def table_drawing():
    return VGroup(poly([(-1.5, 1.0), (1.5, 1.0), (1.5, 0.82), (-1.5, 0.82)], CHALK, 5, True),
                  seg([-1.25, 0.82, 0], [-1.25, 0, 0]), seg([1.25, 0.82, 0], [1.25, 0, 0]))


def speed_dial(c, R=2.3):
    """Speedometer 0..120 km/h. Returns (dial group, angle function)."""
    c = np.array(c, float)
    ang = lambda v: np.radians(210 - v / 120 * 240)
    g = VGroup(Arc(radius=R, start_angle=np.radians(-30), angle=np.radians(240), arc_center=c, color=CHALK, stroke_width=5))
    for v in range(0, 121, 10):
        d = np.array([np.cos(ang(v)), np.sin(ang(v)), 0])
        big = v % 20 == 0
        g.add(Line(c + d * R, c + d * (R - (0.32 if big else 0.18)), color=CHALK if big else DIM, stroke_width=4 if big else 2))
        if big:
            g.add(M(str(v), size=34, color=DIM).move_to(c + d * (R - 0.68)))
    return g, ang


def dimmed(m, k=0.3):
    """Faded copy (stroke and fill scaled separately, so outlines don't get filled)."""
    t = m.copy()
    for sm in t.family_members_with_points():
        sm.set_stroke(opacity=sm.get_stroke_opacity() * k)
        sm.set_fill(opacity=sm.get_fill_opacity() * k)
    return t


# ---------------------------------------------------------------- shots

class K01_Welcome(Shot):
    def body(self):
        hi = H("Welcome back!", 72).move_to([0, 0.6, 0])
        self.go("0:00.98", Write(hi), run=0.9)
        word = H("Calculus", 140).move_to([0, 0.7, 0])
        self.go("0:03.22", ReplacementTransform(hi, word), run=0.7)
        ul = brush_line(word.width + 0.4, center=word.get_bottom() + DOWN * 0.1)
        self.go("0:05.48", Create(ul), run=0.6)
        six = pill("even 6th grade", ORG, 48).move_to([0, -1.35, 0])
        self.go("0:09.38", FadeIn(six, shift=UP * 0.2), run=0.6)
        a = VGroup(tick_mark(GRN, 0.4), H("what it is", 44)).arrange(RIGHT, buff=0.25).move_to([-2.6, -2.85, 0])
        b = VGroup(tick_mark(GRN, 0.4), H("how it works", 44)).arrange(RIGHT, buff=0.25).move_to([2.6, -2.85, 0])
        self.go("0:11.76", FadeIn(a, shift=UP * 0.15), run=0.5)
        self.go("0:12.92", FadeIn(b, shift=UP * 0.15), run=0.5)
        # "sounds scary"
        self.wipe("0:14.20")
        w2 = H("Calculus", 110).move_to([0, 0.3, 0])
        self.go("0:15.40", FadeIn(w2, shift=UP * 0.15), run=0.5)
        scary = VGroup(M(r"\lim_{h\to 0}\frac{f(x+h)-f(x)}{h}", size=48, color=DIM).move_to([-4.2, 1.8, 0]),
                       M(r"\int_a^b f(x)\,dx", size=52, color=DIM).move_to([4.3, 1.7, 0]),
                       M(r"\frac{d^2y}{dx^2}", size=52, color=DIM).move_to([-4.4, -1.9, 0]),
                       M(r"\sum_{n=1}^{\infty}\frac{1}{n^2}", size=48, color=DIM).move_to([4.3, -1.9, 0]))
        self.go("0:16.30", LaggedStart(*[FadeIn(m, scale=0.9) for m in scary], lag_ratio=0.15), run=0.9)


class K01_TwoIdeas(Shot):
    def body(self):
        self.title("Here's the truth", "0:21.96")
        boxes, qs, uses = VGroup(), VGroup(), VGroup()
        for k, x in enumerate((-3.3, 3.3)):
            r = RoundedRectangle(width=4.6, height=3.9, corner_radius=0.3, stroke_color=YEL, stroke_width=4).move_to([x, -0.35, 0])
            lab = H(f"Simple idea {k + 1}", 44).move_to([x, 1.0, 0])
            boxes.add(VGroup(r, lab))
            qs.add(M("?", size=110, color=YEL).move_to([x, -0.25, 0]))
            uses.add(VGroup(tick_mark(GRN, 0.38), H("you use it", 38, GRN)).arrange(RIGHT, buff=0.2).move_to([x, -1.65, 0]))
        self.go("0:24.30", Create(boxes[0][0]), Create(boxes[1][0]), run=0.7)
        self.go("0:25.08", Write(boxes[0][1]), Write(boxes[1][1]), run=0.6)
        self.go("0:27.42", FadeIn(uses[0], shift=UP * 0.15), FadeIn(uses[1], shift=UP * 0.15), run=0.5)
        self.go("0:30.36", Write(qs[0]), Write(qs[1]), run=0.6)
        self.go("0:32.10", Circumscribe(qs[0], color=YEL, fade_out=True), Circumscribe(qs[1], color=YEL, fade_out=True), run=1.0)


class K01_Change(Shot):
    def body(self):
        self.title("What is calculus about?", "0:34.62")
        a = H("Calculus", 76)
        eq = M("=", size=76)
        b = H("the math of", 76)
        c = H("change", 76, YEL)
        line = VGroup(a, eq, b, c).arrange(RIGHT, buff=0.3).move_to([0, 0, 0])
        self.go("0:37.72", Write(a), run=0.5)
        self.go("0:38.40", Write(eq), Write(b), run=0.5)
        self.go("0:39.04", Write(c), run=0.5)
        ul = brush_line(c.width + 0.3, center=c.get_bottom() + DOWN * 0.12)
        self.play(Create(ul), run_time=0.5)
        # things that stay still
        self.wipe("0:40.60")
        self.title("Regular math", animate=True)
        still = H("things that stay still", 46, DIM).move_to([0, 1.75, 0])
        self.go("0:44.54", FadeIn(still, shift=DOWN * 0.15), run=0.5)
        bk = basket().move_to([-4.6, -0.6, 0])
        n5 = M("5", size=60, color=ORG).next_to(bk, DOWN, buff=0.35)
        self.go("0:46.10", Create(bk[0]), FadeIn(bk[1], shift=DOWN * 0.2), run=0.8)
        self.go("0:46.90", Write(n5), run=0.4)
        tb = table_drawing().move_to([0, -0.85, 0])
        meas = DoubleArrow(tb.get_corner(UL) + UP * 0.35, tb.get_corner(UR) + UP * 0.35, buff=0, color=ORG, stroke_width=3, tip_length=0.18)
        m2 = H("2 m", 44, ORG).next_to(tb, DOWN, buff=0.35)
        self.go("0:47.80", Create(tb), run=0.7)
        self.go("0:48.52", GrowFromCenter(meas), Write(m2), run=0.5)
        mul = M(r"5\times 7", size=72).move_to([4.6, -0.3, 0])
        ans = M("=35", size=72, color=ORG).next_to(mul, DOWN, buff=0.3)
        self.go("0:49.68", Write(mul), run=0.6)
        self.go("0:50.28", Write(ans), run=0.5)


class K01_World(Shot):
    def body(self):
        self.title("Things that change", "0:51.72")
        road = seg([-6.2, -1.2, 0], [6.2, -1.2, 0], DIM, 3)
        cr = car().scale(1.1).move_to([-4.9, -1.2, 0], aligned_edge=DOWN)
        lab = H("speed", 48, PINK).move_to([0, -2.6, 0])
        self.go("0:53.20", Create(road), Create(cr), run=0.5)
        self.go("0:53.74", cr.animate.move_to([0, -1.2, 0], aligned_edge=DOWN), FadeIn(lab), run=0.7, rate_func=rush_into)
        self.go("0:54.40", cr.animate.move_to([4.6, -1.2, 0], aligned_edge=DOWN), run=0.9, rate_func=rush_from)
        # balloon
        self.go("0:55.30", FadeOut(VGroup(road, cr, lab)), run=0.25)
        knot = np.array([0, -0.9, 0])
        ball = VGroup(Ellipse(width=0.8, height=1.0, color=RED, stroke_width=5).move_to(knot + UP * 0.58),
                      poly([(-0.09, -0.97), (0, -0.88), (0.09, -0.97)], RED, 4, True))
        string = VMobject(stroke_color=DIM, stroke_width=3).set_points_smoothly([knot + DOWN * 0.08, knot + [0.15, -0.7, 0], knot + [-0.1, -1.4, 0], knot + [0.05, -2.0, 0]])
        lab = H("size", 48, PINK).move_to([2.6, -1.6, 0])
        self.go("0:55.55", Create(ball), Create(string), run=0.4)
        self.go("0:55.98", ball.animate.scale(2.4, about_point=knot), FadeIn(lab), run=0.7)
        # bathtub
        self.go("0:56.70", FadeOut(VGroup(ball, string, lab)), run=0.2)
        L, Rr, B, T = -2.4, 2.4, -2.0, 0.4
        tub = VGroup(poly([(L - 0.2, T), (L, T), (L, B), (Rr, B), (Rr, T), (Rr + 0.2, T)]),
                     seg([L + 0.4, B, 0], [L + 0.2, B - 0.35, 0]), seg([Rr - 0.4, B, 0], [Rr - 0.2, B - 0.35, 0]))
        lvl = ValueTracker(0.02)
        water = always_redraw(lambda: Rectangle(width=Rr - L - 0.16, height=lvl.get_value(), stroke_width=0, fill_color=BLUE, fill_opacity=0.35)
                              .move_to([0, B + 0.06 + lvl.get_value() / 2, 0]))
        lab = H("water level", 48, PINK).move_to([0, -3.1, 0])
        self.go("0:56.90", Create(tub), run=0.4)
        self.add(water)
        self.go("0:57.32", lvl.animate.set_value(1.6), FadeIn(lab), run=1.4)
        # growing up
        self.go("0:58.80", FadeOut(VGroup(tub, water, lab)), run=0.2)
        self.remove(water)
        feet = np.array([-0.6, -2.3, 0])
        kid = walker(s=1.0).move_to(feet, aligned_edge=DOWN)
        hgt = ValueTracker(kid.height)
        ruler = always_redraw(lambda: Arrow(feet + [1.0, 0, 0], feet + [1.0, hgt.get_value(), 0], buff=0, color=PINK, stroke_width=4, tip_length=0.2))
        floor = seg(feet + [-1.6, 0, 0], feet + [2.2, 0, 0], DIM, 3)
        lab = H("height", 48, PINK).move_to([2.9, -1.1, 0])
        self.go("0:59.14", Create(floor), Create(kid), run=0.4)
        self.add(ruler)
        self.go("0:59.54", kid.animate.scale(2.0, about_point=feet), hgt.animate.set_value(kid.height * 2.0), FadeIn(lab), run=1.0)
        # prices
        self.go("1:00.90", FadeOut(VGroup(kid, floor, lab, ruler)), run=0.2)
        self.remove(ruler)
        ax = Axes(x_range=[0, 7, 1], y_range=[0, 4, 1], x_length=6.5, y_length=3.6, tips=True,
                  axis_config=dict(color=DIM, stroke_width=3, tip_length=0.18, include_ticks=False)).move_to([0, -0.7, 0])
        pts = [(0, 1.6), (1, 2.4), (2, 1.9), (3, 3.0), (4, 2.2), (5, 3.3), (6, 2.6), (6.7, 3.4)]
        zig = VMobject(stroke_color=PINK, stroke_width=5).set_points_as_corners([ax.c2p(*p) for p in pts])
        lab = H("price", 48, PINK).next_to(ax, DOWN, buff=0.3)
        self.go("1:01.22", Create(ax), FadeIn(lab), run=0.25)
        self.go("1:01.50", Create(zig), run=1.3, rate_func=linear)
        # calculus understands moving and changing
        self.wipe("1:03.40")
        big = H("Calculus", 96, YEL).move_to([0, 0.9, 0])
        self.go("1:03.82", Write(big), run=0.6)
        mv = VGroup(car().scale(0.7), H("moving", 48)).arrange(DOWN, buff=0.3).move_to([-3.2, -1.7, 0])
        bl = VGroup(VGroup(Ellipse(width=0.9, height=1.15, color=RED, stroke_width=5), seg([0, -0.58, 0], [0, -1.1, 0], DIM, 3)),
                    H("changing", 48)).arrange(DOWN, buff=0.3).move_to([3.2, -1.7, 0])
        ar = VGroup(Arrow(big.get_bottom() + LEFT * 0.6, mv.get_top() + RIGHT * 0.3, color=DIM, stroke_width=3, buff=0.2),
                    Arrow(big.get_bottom() + RIGHT * 0.6, bl.get_top() + LEFT * 0.3, color=DIM, stroke_width=3, buff=0.2))
        self.go("1:06.90", GrowArrow(ar[0]), FadeIn(mv, shift=UP * 0.15), run=0.5)
        self.go("1:07.44", GrowArrow(ar[1]), FadeIn(bl, shift=UP * 0.15), run=0.5)
        self.go("1:08.86", Create(brush_line(big.width + 0.3, center=big.get_bottom() + DOWN * 0.1)), run=0.6)


class K01_BigIdeas(Shot):
    def body(self):
        self.title("Two big ideas", "1:18.54")
        # derivative: curve with a short pink tangent
        dp = pill("The Derivative", PINK, 50).move_to([-3.4, 1.15, 0])
        dax = Axes(x_range=[0, 4, 1], y_range=[0, 4, 1], x_length=3.6, y_length=2.6, tips=False,
                   axis_config=dict(color=DIM, stroke_width=3, include_ticks=False)).move_to([-3.4, -1.45, 0])
        f = lambda x: 0.22 * x * x + 0.3
        dcur = dax.plot(f, x_range=[0, 3.9], color=BLUE, stroke_width=5)
        x0 = 2.4
        tan = Line(dax.c2p(x0 - 0.8, f(x0) - 0.8 * 0.44 * x0), dax.c2p(x0 + 0.8, f(x0) + 0.8 * 0.44 * x0), color=PINK, stroke_width=6)
        dot = Dot(dax.c2p(x0, f(x0)), color=PINK, radius=0.08)
        # integral: curve with green area
        ip = pill("The Integral", GRN, 50).move_to([3.4, 1.15, 0])
        iax = dax.copy().move_to([3.4, -1.45, 0])
        icur = iax.plot(f, x_range=[0, 3.9], color=BLUE, stroke_width=5)
        area = iax.get_area(icur, x_range=[0.6, 3.2], color=GRN, opacity=0.4)
        n1 = H("Idea #1", 40, DIM).next_to(dp, UP, buff=0.25)
        n2 = H("Idea #2", 40, DIM).next_to(ip, UP, buff=0.25)
        self.go("1:22.12", FadeIn(dp, scale=0.9), FadeIn(n1), Create(dax), run=0.5)
        self.play(Create(dcur), run_time=0.6)
        self.play(Create(tan), FadeIn(dot), run_time=0.5)
        self.go("1:24.36", FadeIn(ip, scale=0.9), FadeIn(n2), Create(iax), run=0.5)
        self.play(Create(icur), run_time=0.6)
        self.play(FadeIn(area), run_time=0.5)
        self.go("1:25.94", Transform(g2 := VGroup(n2, ip, iax, icur, area), dimmed(g2)), run=0.6)
        self.play(Circumscribe(dp, color=PINK, fade_out=True), run_time=0.7)


class K01_Car(Shot):
    def body(self):
        self.title("The Derivative", "1:31.45")
        road = seg([-6.2, -1.6, 0], [6.2, -1.6, 0], DIM, 3)
        cr = car(family=True).scale(1.5).move_to([-2.8, -1.6, 0], aligned_edge=DOWN)
        self.go("1:33.68", Create(road), Create(cr[:3]), run=0.5)
        self.go("1:34.22", FadeIn(cr[3], scale=0.6), run=0.4)
        self.play(cr.animate.shift(RIGHT * 1.6), run_time=0.9, rate_func=linear)


class K01_Needle(Shot):
    def body(self):
        self.title("The Derivative", animate=False)
        c = np.array([-3.4, -0.85, 0])
        dial, ang = speed_dial(c)
        v = ValueTracker(0)
        needle = always_redraw(lambda: Line(c, c + 1.3 * np.array([np.cos(ang(v.get_value())), np.sin(ang(v.get_value())), 0]),
                                            color=PINK, stroke_width=7))
        hub = Dot(c, color=CHALK, radius=0.1)
        read = VGroup(M("60", size=72, color=PINK), H("km/h", 46, PINK)).arrange(RIGHT, buff=0.2, aligned_edge=DOWN).move_to(c + DOWN * 1.6)
        self.go("1:39.45", Create(dial), run=0.9)
        self.add(needle, hub)
        self.go("1:40.40", v.animate.set_value(60), run=1.2)
        self.play(FadeIn(read, shift=UP * 0.15), run_time=0.4)
        # not how far ... how fast, right now
        far = H("how far?", 52).move_to([3.4, 1.2, 0])
        x = cross_mark(RED, 0.25).next_to(far, RIGHT, buff=0.35)
        self.go("1:42.70", Write(far), run=0.6)
        self.go("1:43.38", Create(x), run=0.4)
        fast = H("how fast?", 52, PINK).move_to([3.4, -0.2, 0])
        tk = tick_mark(GRN, 0.45).next_to(fast, RIGHT, buff=0.35)
        self.go("1:44.76", Write(fast), run=0.6)
        self.go("1:46.08", Create(tk), run=0.4)
        now = H("right now", 52, YEL).move_to([3.4, -1.5, 0])
        self.go("1:46.42", Write(now), run=0.6)
        ul = brush_line(now.width + 0.3, center=now.get_bottom() + DOWN * 0.1)
        self.go("1:47.96", Create(ul), run=0.6)
        self.go("1:49.76", Circumscribe(read, color=YEL, fade_out=True), run=1.0)
        # that's a derivative
        self.go("1:51.10", FadeOut(VGroup(far, x, fast, tk, now, ul)), run=0.4)
        dp = pill("derivative", PINK, 56).move_to([2.7, read.get_center()[1], 0])
        arr = Arrow(dp.get_left(), [read.get_right()[0], dp.get_center()[1], 0], color=PINK, stroke_width=4, buff=0.25)
        self.go("1:51.72", FadeIn(dp, scale=0.9), GrowArrow(arr), run=0.6)
        q1 = H("how fast", 52).move_to([3.4, 1.1, 0])
        q2 = H("right now", 52, YEL).move_to([3.4, 0.15, 0])
        self.go("1:56.00", Write(q1), run=0.6)
        self.go("1:57.70", Write(q2), run=0.6)
        self.play(Create(brush_line(q2.width + 0.3, center=q2.get_bottom() + DOWN * 0.1, seed=3)), run_time=0.5)


ROAD_Y = 0.55
XM = {0: -5.4, 50: -2.5, 100: 0.4, 150: 3.3}  # metres -> board x


class K01_Walk(Shot):
    def body(self):
        self.title("A walk to a friend", "2:00.86")
        road = seg([-6.3, ROAD_Y, 0], [6.3, ROAD_Y, 0], DIM, 3)
        man = walker(s=0.85).move_to([XM[0], ROAD_Y, 0], aligned_edge=DOWN)
        hs = house().move_to([5.4, ROAD_Y, 0], aligned_edge=DOWN)
        self.go("2:02.50", Create(road), Create(man), run=0.6)
        self.go("2:03.10", Create(hs), run=0.6)
        # table
        tx = (-4.9, -2.5)
        heads = VGroup(H("time", 44, DIM).move_to([tx[0], -0.75, 0]), H("distance", 44, DIM).move_to([tx[1], -0.75, 0]))
        grid = VGroup(seg([-6.1, -1.15, 0], [-1.3, -1.15, 0], DIM, 3), seg([-3.7, -0.4, 0], [-3.7, -3.6, 0], DIM, 3))
        self.go("2:04.22", FadeIn(heads), Create(grid), run=0.3)
        rows = []
        for k, (tw, tm) in enumerate(((("2:04.56", "2:05.74")), ("2:07.15", "2:08.45"), ("2:11.00", "2:12.02"))):
            n = k + 1
            y = -1.6 - 0.8 * k
            r = VGroup(H(f"{n} min", 44).move_to([tx[0], y, 0]), H(f"{50 * n} m", 44, ORG).move_to([tx[1], y, 0]))
            mark = VGroup(seg([XM[50 * n], ROAD_Y - 0.12, 0], [XM[50 * n], ROAD_Y + 0.12, 0], ORG, 3),
                          H(f"{50 * n} m", 36, ORG).move_to([XM[50 * n], ROAD_Y - 0.4, 0]))
            self.go(tw, man.animate.move_to([XM[50 * n] - 0.45, ROAD_Y, 0], aligned_edge=DOWN), run=1.0, rate_func=linear)
            self.go(tm, FadeIn(mark), FadeIn(r, shift=LEFT * 0.2), run=0.5)
            rows.append(r)
        # how fast?
        sp = H("speed?", 56, PINK).move_to([3.3, -1.6, 0])
        self.go("2:14.14", Write(sp), run=0.5)
        plus = VGroup()
        for k in range(2):
            a = rows[k][1].get_right() + RIGHT * 0.15
            b = rows[k + 1][1].get_right() + RIGHT * 0.15
            arc = CurvedArrow(a, b, angle=-PI * 0.8, color=ORG, stroke_width=3, tip_length=0.15)
            plus.add(VGroup(arc, H("+50", 36, ORG).next_to(arc, RIGHT, buff=0.12)))
        self.go("2:16.52", FadeIn(plus[0]), run=0.5)
        self.go("2:17.48", FadeIn(plus[1]), run=0.5)
        ans = H("50 m per min", 60, PINK).move_to([3.3, -1.6, 0])
        self.go("2:19.46", ReplacementTransform(sp, ans), run=0.7)
        ul = brush_line(ans.width + 0.3, center=ans.get_bottom() + DOWN * 0.12)
        same = H("always the same", 40, YEL).next_to(ul, DOWN, buff=0.3)
        self.go("2:21.06", Create(ul), FadeIn(same, shift=UP * 0.1), run=0.6)


class K01_Graph(Shot):
    def body(self):
        self.title("Draw it on a graph", "2:22.98")
        ax = Axes(x_range=[0, 4, 1], y_range=[0, 200, 50], x_length=7.0, y_length=4.4, tips=True,
                  axis_config=dict(color=DIM, stroke_width=3, tip_length=0.2)).move_to([-1.9, -0.95, 0])
        nums = VGroup(*[M(str(k), size=34, color=DIM).next_to(ax.c2p(k, 0), DOWN, buff=0.15) for k in range(1, 4)],
                      *[M(str(v), size=34, color=DIM).next_to(ax.c2p(0, v), LEFT, buff=0.15) for v in (50, 100, 150)])
        xl = H("time (min)", 38, DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.2)
        yl = H("distance (m)", 38, DIM).next_to(ax.c2p(0, 200), RIGHT, buff=0.25)
        self.go("2:23.66", Create(ax), run=0.7)
        self.go("2:24.46", FadeIn(xl), FadeIn(nums[:3]), run=0.5)
        self.go("2:25.66", FadeIn(yl), FadeIn(nums[3:]), run=0.5)
        dots = VGroup(*[Dot(ax.c2p(k, 50 * k), color=ORG, radius=0.09) for k in range(1, 4)])
        self.go("2:26.96", LaggedStart(*[FadeIn(d, scale=1.5) for d in dots], lag_ratio=0.3), run=0.6)
        main = Line(ax.c2p(0, 0), ax.c2p(3.7, 185), color=BLUE, stroke_width=6)
        self.go("2:27.72", Create(main), run=0.8)
        self.add(dots)  # dots on top of the line
        # steepness = speed
        rx = 4.75
        st = VGroup(H("steep", 48, YEL), M("=", size=48), H("speed", 48, PINK)).arrange(RIGHT, buff=0.2).move_to([rx, 1.3, 0])
        self.go("2:29.38", Write(st[0]), run=0.5)
        self.go("2:31.16", Write(st[1:]), run=0.5)
        fast = DashedLine(ax.c2p(0, 0), ax.c2p(1.9, 190), color=BLUE, stroke_width=4, dash_length=0.15)
        fl = H("faster", 40, BLUE).move_to([rx, 0.1, 0])
        fa = Arrow(fl.get_left(), ax.c2p(1.85, 172), color=DIM, stroke_width=3, buff=0.15)
        self.go("2:32.32", Create(fast), run=0.6)
        self.go("2:33.26", FadeIn(fl), GrowArrow(fa), run=0.5)
        slow = DashedLine(ax.c2p(0, 0), ax.c2p(3.9, 98), color=BLUE, stroke_width=4, dash_length=0.15)
        sl = H("slower", 40, BLUE).move_to([rx, -1.0, 0])
        sa = Arrow(sl.get_left(), ax.c2p(3.75, 96), color=DIM, stroke_width=3, buff=0.15)
        self.go("2:34.46", Create(slow), run=0.6)
        self.go("2:35.42", FadeIn(sl), GrowArrow(sa), run=0.5)
        # the slope: rise over run
        self.go("2:36.70", FadeOut(VGroup(fast, fl, fa, slow, sl, sa, st)), run=0.5)
        p1, p2 = ax.c2p(1, 50), ax.c2p(2, 100)
        corner = ax.c2p(2, 50)
        tri = VGroup(Line(p1, corner, color=PINK, stroke_width=5), Line(corner, p2, color=PINK, stroke_width=5))
        run_l = H("1 min", 36, PINK).next_to(Line(p1, corner), DOWN, buff=0.12)
        rise_l = H("50 m", 36, PINK).next_to(Line(corner, p2), RIGHT, buff=0.12)
        self.go("2:37.68", Create(tri), run=0.6)
        self.play(FadeIn(run_l), FadeIn(rise_l), run_time=0.4)
        word = H("slope", 80, YEL).move_to([rx, 1.0, 0])
        wl = brush_line(word.width + 0.3, center=word.get_bottom() + DOWN * 0.1)
        self.go("2:38.62", Write(word), run=0.6)
        self.play(Create(wl), run_time=0.4)
        frac = M(r"\frac{50\text{ m}}{1\text{ min}}", size=60, color=PINK).move_to([rx, -0.6, 0])
        self.play(Write(frac), run_time=0.6)
        # so far, no calculus needed
        nc = VGroup(tick_mark(GRN, 0.38), H("no calculus yet", 40, GRN)).arrange(RIGHT, buff=0.2).move_to([rx - 0.3, -2.3, 0])
        self.go("2:40.68", FadeIn(nc, shift=UP * 0.15), run=0.5)
        self.go("2:42.34", main.animate.set_stroke(width=10), run=0.4)
        self.play(main.animate.set_stroke(width=6), run_time=0.4)
