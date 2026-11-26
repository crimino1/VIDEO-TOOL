"""Builder 02: the problem (bike on a hill), zoom in = derivative, Earth looks flat, limits, the wall,
the square and its strips (d/dx x^2 = 2x), the power rule, and the course call to action."""
from common import *

# ---------- the distance graph d = 2 t^2, shared by K02_Bike and K02_Zoom ----------
UX, UY = 1.12, 0.092                  # screen units per second / per metre
GO = np.array([-6.0, -3.0, 0])         # graph origin on screen


def dd(t):
    return 2 * t * t


def gp(t, d=None):
    return GO + np.array([t * UX, (dd(t) if d is None else d) * UY, 0])


def gslope(t):
    return 4 * t * UY / UX             # slope on screen


def graph():
    ax = Axes(x_range=[0, 5.7, 1], y_range=[0, 56, 10], x_length=5.7 * UX, y_length=56 * UY,
              axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, include_numbers=False))
    ax.shift(GO - ax.c2p(0, 0))
    labs = VGroup()
    for k in range(1, 6):
        labs.add(M(str(k), size=34, color=DIM).next_to(ax.c2p(k, 0), DOWN, buff=0.15))
    for k in range(10, 60, 10):
        labs.add(M(str(k), size=34, color=DIM).next_to(ax.c2p(0, k), LEFT, buff=0.15))
    labs.add(H("time (s)", 36, DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15))
    labs.add(H("distance (m)", 36, DIM).next_to(ax.y_axis.get_end(), RIGHT, buff=0.2))
    curve = ax.plot(dd, x_range=[0, 4.9], color=BLUE, stroke_width=6)
    return ax, labs, curve


def tangent(t, L=2.4, tri=True):
    p = gp(t)
    m = gslope(t)
    d = np.array([1, m, 0]) / np.hypot(1, m)
    g = VGroup(Line(p - d * L / 2, p + d * L / 2, color=PINK, stroke_width=6))
    if tri:
        q = p + np.array([0.7, 0, 0])
        g.add(DashedLine(p, q, color=PINK, stroke_width=3, dash_length=0.08),
              DashedLine(q, q + np.array([0, 0.7 * m, 0]), color=PINK, stroke_width=3, dash_length=0.08))
    g.add(Dot(p, radius=0.08, color=YEL))
    return g


# ---------- drawings ----------

def bike(spin=0.0):
    """Bicycle with a stick rider, ground contact at the origin, facing right."""
    r = 0.38
    Rh, Fh = np.array([-0.62, r, 0]), np.array([0.62, r, 0])
    Bk, S, Hd = np.array([-0.05, r, 0]), np.array([-0.22, 1.0, 0]), np.array([0.42, 1.02, 0])
    g = VGroup()
    for c in (Rh, Fh):
        g.add(Circle(radius=r, color=CHALK, stroke_width=4).move_to(c))
        for a in (spin, spin + PI / 2):
            v = r * np.array([np.cos(a), np.sin(a), 0])
            g.add(Line(c - v, c + v, color=DIM, stroke_width=2))
    for p, q in ((Rh, Bk), (Bk, S), (S, Hd), (Hd, Bk), (Rh, S), (Hd, Fh)):
        g.add(Line(p, q, color=ORG, stroke_width=4))
    g.add(Line(S + [-0.14, 0.07, 0], S + [0.1, 0.07, 0], color=CHALK, stroke_width=5))
    g.add(VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners([Hd, Hd + [-0.05, 0.2, 0], Hd + [0.12, 0.22, 0]]))
    hip, sh = S + [0.0, 0.12, 0], np.array([0.12, 1.62, 0])
    g.add(Line(hip, sh, color=CHALK, stroke_width=4),
          Circle(radius=0.16, color=CHALK, stroke_width=4).move_to([0.27, 1.86, 0]),
          Line(sh, Hd + [0.06, 0.21, 0], color=CHALK, stroke_width=4),
          VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners([hip, [0.2, 0.86, 0], Bk]))
    return g.scale(0.85, about_point=ORIGIN)


def stick(h=1.7, color=CHALK, w=4):
    """Stick person standing with feet at the origin."""
    s = h / 1.7
    P = lambda x, y: np.array([x * s, y * s, 0])
    return VGroup(Circle(radius=0.2 * s, color=color, stroke_width=w).move_to(P(0, 1.5)),
                  Line(P(0, 1.3), P(0, 0.75), color=color, stroke_width=w),
                  Line(P(0, 0.75), P(-0.22, 0), color=color, stroke_width=w),
                  Line(P(0, 0.75), P(0.22, 0), color=color, stroke_width=w),
                  Line(P(0, 1.18), P(-0.3, 0.85), color=color, stroke_width=w),
                  Line(P(0, 1.18), P(0.3, 0.85), color=color, stroke_width=w))


def magnifier(c, r=0.42, ang=-80 * DEGREES):
    c = np.array(c, float)
    u = np.array([np.cos(ang), np.sin(ang), 0])
    return VGroup(Circle(radius=r, color=CHALK, stroke_width=4).move_to(c),
                  Line(c + u * r, c + u * (r + 0.6), color=CHALK, stroke_width=9))


def connectors(c1, r1, c2, r2):
    c1, c2 = np.array(c1, float), np.array(c2, float)
    return VGroup(DashedLine(c1 + UP * r1, c2 + UP * r2, color=DIM, stroke_width=2, dash_length=0.1),
                  DashedLine(c1 + DOWN * r1, c2 + DOWN * r2, color=DIM, stroke_width=2, dash_length=0.1))


def clip_path(pts, c, R):
    """Keep the run of points inside circle (c, R) that contains the middle point."""
    inside = [np.linalg.norm(p - c) <= R for p in pts]
    mid = len(pts) // 2
    a = b = mid
    while a > 0 and inside[a - 1]:
        a -= 1
    while b < len(pts) - 1 and inside[b + 1]:
        b += 1
    return pts[a:b + 1]


def bell(color=YEL):
    pts = [[-0.1, 0.62], [-0.38, 0.5], [-0.46, 0.1], [-0.48, -0.25], [-0.65, -0.48], [0.65, -0.48], [0.48, -0.25], [0.46, 0.1], [0.38, 0.5], [0.1, 0.62]]
    body = VMobject(stroke_color=color, stroke_width=6).set_points_smoothly([np.array(p + [0]) for p in pts])
    return VGroup(body, Line([0, 0.62, 0], [0, 0.78, 0], color=color, stroke_width=6),
                  Arc(radius=0.16, start_angle=PI, angle=PI, arc_center=[0, -0.5, 0], color=color, stroke_width=6))


# ================================================================ the problem

class K02_Bike(Shot):
    def body(self):
        self.title("The Problem", "2:44.80")
        A, B = np.array([-6.3, 0.5, 0]), np.array([4.8, -3.2, 0])
        dirv = (B - A) / np.linalg.norm(B - A)
        th = np.arctan2(dirv[1], dirv[0])
        nrm = np.array([dirv[1], -dirv[0], 0])           # points down-left, under the slope
        hill = VGroup(Polygon(A, B, [A[0], B[1], 0], stroke_width=0, fill_color=CHALK, fill_opacity=0.06),
                      Line(A, B, color=CHALK, stroke_width=5), Line(B, [6.6, B[1], 0], color=CHALK, stroke_width=5))
        self.go("2:46.60", Create(hill), run=0.9)
        s0, L = 0.6, 9.6
        u = ValueTracker(0)
        sof = lambda: s0 + L * u.get_value() ** 2
        rider = always_redraw(lambda: bike(-sof() / (0.38 * 0.85)).rotate(th, about_point=ORIGIN).shift(A + dirv * sof()))
        self.go("2:47.50", FadeIn(rider), run=0.5)

        def mark(k):
            p = A + dirv * (s0 + L * (k / 4) ** 2)
            return VGroup(Dot(p, radius=0.07, color=ORG), M(rf"{k}\,\text{{s}}", size=36, color=ORG).move_to(p + nrm * 0.48))
        self.go("2:48.62", FadeIn(mark(0), scale=0.6), run=0.3)
        for k in range(1, 5):
            self.play(u.animate.set_value(k / 4), run_time=1.0, rate_func=linear)
            self.add(mark(k))
        rider.clear_updaters()
        # the distance graph
        self.wipe("2:55.40", run=0.35)
        ax, labs, curve = graph()
        self.go("2:55.76", Create(ax), FadeIn(labs), run=0.7)
        pts = VGroup(*[Dot(gp(k), radius=0.08, color=ORG) for k in range(5)])
        self.go("2:56.46", LaggedStart(*[FadeIn(p, scale=0.5) for p in pts], lag_ratio=0.2), run=0.6)
        chord = DashedLine(gp(0), gp(4), color=DIM, stroke_width=3, dash_length=0.12)
        self.go("2:57.12", Create(chord), run=0.5)
        self.go("2:57.94", FadeOut(chord), run=0.4)
        self.go("2:59.04", Create(curve), run=0.85)
        up = CurvedArrow(gp(4.3) + np.array([1.2, -0.9, 0]), gp(4.6) + np.array([0.55, -0.05, 0]), angle=PI / 3, color=YEL, stroke_width=4, tip_length=0.2)
        bend = H("bends up", 38, YEL).next_to(up.get_start(), DOWN, buff=0.12)
        self.go("2:59.94", Create(up), FadeIn(bend), run=0.5)
        self.go("3:02.30", FadeOut(up), FadeOut(bend), FadeOut(pts), run=0.4)
        tans = [tangent(t, L=1.6) for t in (1.0, 2.6, 4.2)]
        for tt, tg in zip(("3:03.36", "3:04.06", "3:04.60"), tans):
            self.go(tt, Create(tg), run=0.4)
        self.go("3:05.60", *[FadeOut(tg) for tg in tans], run=0.4)
        dot = Dot(gp(3), radius=0.1, color=YEL)
        self.go("3:07.26", FadeIn(dot, scale=2), run=0.4)
        vl = DashedLine(gp(3, 0), gp(3), color=ORG, stroke_width=3, dash_length=0.1)
        three = M(r"3\,\text{s}", size=40, color=ORG).next_to(gp(3, 0), DOWN, buff=0.12)
        self.go("3:09.12", Create(vl), FadeIn(three), FadeOut(labs[2]), run=0.5)
        ask = H("speed = ?", 46, PINK).next_to(gp(3), RIGHT, buff=0.35).shift(DOWN * 0.25)
        self.go("3:10.26", Write(ask), run=0.5)


class K02_Zoom(Shot):
    def body(self):
        self.title("The Problem", animate=False)
        ax, labs, curve = graph()
        dot = Dot(gp(3), radius=0.1, color=YEL)
        vl = DashedLine(gp(3, 0), gp(3), color=ORG, stroke_width=3, dash_length=0.1)
        three = M(r"3\,\text{s}", size=40, color=ORG).next_to(gp(3, 0), DOWN, buff=0.12)
        labs.remove(labs[2])
        ask = H("speed = ?", 46, PINK).next_to(gp(3), RIGHT, buff=0.35).shift(DOWN * 0.25)
        self.add(ax, labs, curve, vl, three, dot, ask)
        self.title("Zoom In", "3:13.64")
        self.play(FadeOut(ask), run_time=0.3)
        glass = magnifier(gp(3))
        self.go("3:15.92", Create(glass[0]), Create(glass[1]), FadeOut(vl), run=0.6)
        # the zoomed view on the right
        C, R = np.array([3.95, -0.25, 0]), 2.15
        lz = ValueTracker(np.log(0.5))

        def view():
            Z = np.exp(lz.get_value())
            us = np.linspace(-R, R, 241)
            t = np.clip(3 + us / (Z * UX), 0, 6)
            pts = np.column_stack([us, Z * (dd(t) - dd(3)) * UY, np.zeros_like(us)]) + C
            pts = pts[(3 + us / (Z * UX) >= 0)]
            pts = clip_path(list(pts), C, R - 0.06)
            return VMobject(stroke_color=BLUE, stroke_width=6).set_points_smoothly(pts)
        lens = Circle(radius=R, color=CHALK, stroke_width=5).move_to(C)
        link = connectors(gp(3), 0.42, C, R)
        inside = always_redraw(view)
        cdot = Dot(C, radius=0.09, color=YEL)
        zl = M(r"\times 1", size=40, color=DIM).move_to(C + np.array([0.8, -1.4, 0]))
        self.go("3:17.66", Create(link), Create(lens), run=0.6)
        self.play(Create(inside), FadeIn(cdot), FadeIn(zl), run_time=0.6)
        for tt, z, lab, rt in (("3:20.56", 2.5, r"\times 5", 1.0), ("3:23.68", 12.5, r"\times 25", 1.0), ("3:26.44", 500, r"\times 1000", 1.8)):
            nl = M(lab, size=40, color=DIM).move_to(zl)
            self.go(tt, lz.animate.set_value(np.log(z)), Transform(zl, nl), run=rt)
        inside.clear_updaters()
        # it is a straight line now: measure its steepness
        m = gslope(3)
        a = C + np.array([-0.75, -0.75 * m, 0])
        b = a + np.array([1.5, 0, 0])
        c = b + np.array([0, 1.5 * m, 0])
        run_l, rise_l = Line(a, b, color=PINK, stroke_width=5), Line(b, c, color=PINK, stroke_width=5)
        run_t = H("run", 38, PINK).next_to(run_l, DOWN, buff=0.1)
        rise_t = H("rise", 38, PINK).next_to(rise_l, RIGHT, buff=0.12)
        self.go("3:34.24", Create(run_l), FadeIn(run_t), run=0.5)
        self.play(Create(rise_l), FadeIn(rise_t), run_time=0.5)
        tt = ValueTracker(3)
        tg = always_redraw(lambda: tangent(tt.get_value()))
        self.go("3:37.22", FadeIn(tg), run=0.6)
        der = pill("the derivative", PINK, 40).move_to([3.95, -3.05, 0])
        self.go("3:38.08", FadeIn(der, shift=UP * 0.15), run=0.5)
        # hero: the pink tangent slides along the curve, its steepness updating
        self.wipe("3:39.10", run=0.5, keep=[ax, labs, curve, tg, three])
        self.go("3:39.76", tt.animate.set_value(1.0), run=0.8)
        word = H("speed", 50, PINK)
        eq = M("=", size=60, color=PINK).next_to(word, RIGHT, buff=0.25)
        unit = H("m/s", 46, PINK)
        head = VGroup(word, eq).move_to([2.7, 0.4, 0])
        num = always_redraw(lambda: M(str(int(round(4 * tt.get_value()))), size=72, color=PINK).next_to(eq, RIGHT, buff=0.25))
        unit.add_updater(lambda u: u.next_to(num, RIGHT, buff=0.2).align_to(word, DOWN))
        self.go("3:41.74", FadeIn(head), FadeIn(num), FadeIn(unit), run=0.5)
        self.go("3:42.30", tt.animate.set_value(4.5), run=2.4)
        self.play(tt.animate.set_value(3.0), run_time=1.0)
        unit.clear_updaters()
        at3 = M(r"\text{at } 3\,\text{s}", size=44, color=ORG).next_to(VGroup(head, unit), DOWN, buff=0.35)
        self.go("3:45.94", Create(box(VGroup(head, num, unit), YEL, buff=0.22)), FadeIn(at3), run=0.6)


# ================================================================ Earth, limits

class K02_Limit(Shot):
    def body(self):
        self.title("Why Earth Looks Flat", "3:54.04")
        ec, er = np.array([-3.7, -1.55, 0]), 1.9
        earth = Circle(radius=er, color=BLUE, stroke_width=5, fill_color=BLUE, fill_opacity=0.08).move_to(ec)
        top = ec + UP * er
        self.play(Create(earth), run_time=0.8)
        you = stick(0.2, w=2).move_to(top + UP * 0.1)
        lab = H("you", 42, YEL).move_to(top + np.array([1.4, 1.2, 0]))
        arr = Arrow(lab.get_left() + LEFT * 0.05, top + np.array([0.12, 0.18, 0]), buff=0.05, color=YEL, stroke_width=4, tip_length=0.18)
        self.go("3:55.76", FadeIn(you), GrowArrow(arr), FadeIn(lab), run=0.5)
        # zoomed piece: almost flat ground, you standing on it
        C, R = np.array([3.5, -0.6, 0]), 2.1
        glass = Circle(radius=0.36, color=CHALK, stroke_width=4).move_to(top + UP * 0.08)
        link = connectors(top + UP * 0.08, 0.36, C, R)
        rho = 22.0
        cc = C + np.array([0, -0.9 - rho, 0])
        xs = np.linspace(-R, R, 81)
        pts = clip_path([cc + np.array([x, np.sqrt(rho * rho - x * x), 0]) for x in xs], C, R - 0.05)
        ground = VMobject(stroke_color=CHALK, stroke_width=6).set_points_smoothly(pts)
        lens = Circle(radius=R, color=CHALK, stroke_width=5).move_to(C)
        big = stick(1.5).move_to(C + np.array([0, -0.9 + 0.75, 0]))
        self.go("3:57.52", Create(glass), Create(link), FadeOut(arr), FadeOut(lab), run=0.5)
        self.play(Create(lens), Create(ground), FadeIn(big), run_time=0.7)
        self.go("3:58.72", ground.animate.set_stroke(BLUE, 7), run=0.6)
        # nearer and nearer without reaching
        self.wipe("4:02.64", run=0.4)
        self.title("Closer and Closer")
        line = Line([-5.6, -0.4, 0], [5.0, -0.4, 0], color=DIM, stroke_width=4)
        goal = Dot([4.0, -0.4, 0], radius=0.16, color=YEL)
        mover = Dot([-5.0, -0.4, 0], radius=0.14, color=CHALK)
        self.go("4:03.54", Create(line), FadeIn(goal, scale=1.5), FadeIn(mover), run=0.35)
        x = -5.0
        for tt in ("4:03.94", "4:04.58", "4:05.68", "4:06.40", "4:06.86", "4:07.50"):
            x = x + (4.0 - x) / 2
            self.go(tt, mover.animate.move_to([x, -0.4, 0]), run=0.4)
        lim = H("limit", 64, YEL).next_to(goal, UP, buff=0.35)
        self.go("4:10.60", Write(lim), run=0.6)
        # limits hold calculus up
        slab = Rectangle(width=7.4, height=0.85, color=CHALK, stroke_width=4).move_to([0, -2.9, 0])
        slab_t = H("Limits", 46, YEL).move_to(slab)
        self.go("4:11.54", FadeOut(line), FadeOut(goal), FadeOut(mover), run=0.3)
        self.title("The Foundation")
        self.play(Create(slab), ReplacementTransform(lim, slab_t), run_time=0.6)
        p1 = Rectangle(width=3.3, height=1.6, color=CHALK, stroke_width=4).move_to([-1.9, -1.675, 0])
        p2 = Rectangle(width=3.3, height=1.6, color=CHALK, stroke_width=4).move_to([1.9, -1.675, 0])
        t1, t2 = H("Derivatives", 40, PINK).move_to(p1), H("Integrals", 40, GRN).move_to(p2)
        self.go("4:12.96", Create(p1), Create(p2), FadeIn(t1), FadeIn(t2), run=0.6)
        roof = Polygon([-3.9, -0.875, 0], [3.9, -0.875, 0], [0, 1.35, 0], color=CHALK, stroke_width=4)
        rt = H("Calculus", 50, CHALK).move_to([0, -0.3, 0])
        self.go("4:13.70", Create(roof), Write(rt), run=0.7)


class K02_Wall(Shot):
    def body(self):
        self.title("Picture a Limit", "4:15.70")
        gy = -1.5
        ground = Line([-6.5, gy, 0], [6.5, gy, 0], color=CHALK, stroke_width=4)
        wx = 4.8
        wall = VGroup(Rectangle(width=0.7, height=3.0, color=CHALK, stroke_width=5).move_to([wx + 0.35, gy + 1.5, 0]))
        for k in range(1, 8):
            y = gy + 0.375 * k
            wall.add(Line([wx, y, 0], [wx + 0.7, y, 0], color=DIM, stroke_width=2))
        for k in range(8):
            x = wx + (0.35 if k % 2 else 0.18)
            wall.add(Line([x, gy + 0.375 * k, 0], [x, gy + 0.375 * (k + 1), 0], color=DIM, stroke_width=2))
        self.go("4:17.58", Create(ground), run=0.5)
        walker = stick(1.7)
        x0 = -4.6
        walker.move_to([x0 - walker.width / 2, gy + walker.height / 2, 0])
        self.go("4:18.14", FadeIn(walker, shift=RIGHT * 0.3), run=0.4)
        self.go("4:18.72", Create(wall), run=0.6)
        left = DashedLine([x0, gy - 0.45, 0], [wx, gy - 0.45, 0], color=DIM, stroke_width=3, dash_length=0.12)
        self.go("4:21.38", Create(left), run=0.6)
        half = Line([(x0 + wx) / 2, gy - 0.2, 0], [(x0 + wx) / 2, gy - 0.7, 0], color=YEL, stroke_width=6)
        self.play(Create(half), run_time=0.3)
        x = x0
        fr = [r"\frac{1}{2}", r"\frac{1}{4}", r"\frac{1}{8}"]
        steps = ["4:22.98", "4:23.86", "4:25.20", "4:26.78", "4:28.04", "4:29.28", "4:31.30", "4:32.04", "4:32.44"]
        marks = VGroup()
        for i, tt in enumerate(steps):
            nx = x + ((wx - 0.28) - x) / 2  # aim just short of the wall: a limit is approached, never touched
            anims = [walker.animate.shift(RIGHT * (nx - x))]
            if i == 0:
                anims += [FadeOut(left), FadeOut(half)]
            if i < 3:
                arc = ArcBetweenPoints([x, gy - 0.15, 0], [nx, gy - 0.15, 0], angle=PI / 3, color=ORG, stroke_width=4)
                lab = M(fr[i], size=48, color=ORG).next_to(arc, DOWN, buff=0.12)
                marks.add(arc, lab)
                anims += [Create(arc), FadeIn(lab)]
            self.go(tt, *anims, run=0.5 if i < 6 else 0.3)
            x = nx
        lim = H("limit", 60, YEL).move_to([wx - 1.9, gy + 3.1, 0])
        arr = Arrow(lim.get_right(), [wx - 0.05, gy + 2.5, 0], buff=0.12, color=YEL, stroke_width=5, tip_length=0.22)
        self.go("4:35.80", wall[0].animate.set_stroke(YEL, 6), Write(lim), GrowArrow(arr), run=0.6)


# ================================================================ the square: d/dx x^2 = 2x

SQ0, SQS, STH = np.array([-5.9, -2.3, 0]), 3.2, 0.32     # square corner, side, strip thickness


def square_parts():
    sq = Square(SQS, color=CHALK, stroke_width=5).move_to(SQ0 + np.array([SQS / 2, SQS / 2, 0]))
    lx = M("x", size=52).next_to(sq, DOWN, buff=0.15)
    ly = M("x", size=52).next_to(sq, LEFT, buff=0.18)
    return sq, lx, ly


class K02_Square(Shot):
    def body(self):
        self.title("Real Calculus", "4:37.90")
        sq, lx, ly = square_parts()
        self.go("4:44.30", Create(sq), run=0.8)
        self.go("4:46.40", Write(lx), Write(ly), run=0.5)
        a1 = M(r"\text{area}", "=", size=64).move_to([1.4, 1.0, 0])
        a1[0].set_color(GRN)
        self.go("4:47.48", sq.animate.set_fill(GRN, 0.22), Write(a1), run=0.6)
        a2 = M("x", r"\times", "x", size=64).next_to(a1, RIGHT, buff=0.25)
        self.go("4:48.72", Write(a2), run=0.6)
        a3 = M("=", "x^2", size=72).next_to(a1[1], DOWN, buff=0.7, aligned_edge=LEFT)
        a3[1].set_color(GRN)
        self.go("4:51.56", Write(a3), run=0.5)
        bigger = DashedVMobject(Square(SQS + STH, color=PINK, stroke_width=4).move_to(SQ0 + np.array([(SQS + STH) / 2] * 2 + [0])), num_dashes=40)
        self.go("4:54.42", Create(bigger), run=0.7)
        q = H("grows how fast?", 48, PINK).move_to([2.6, -1.3, 0])
        self.go("4:56.34", FadeIn(q, shift=UP * 0.15), run=0.5)


class K02_Strips(Shot):
    def body(self):
        self.title("Real Calculus", animate=False)
        sq, lx, ly = square_parts()
        sq.set_fill(GRN, 0.22)
        a1 = M(r"\text{area}", "=", size=64).move_to([1.4, 1.0, 0])
        a1[0].set_color(GRN)
        a2 = M("x", r"\times", "x", size=64).next_to(a1, RIGHT, buff=0.25)
        a3 = M("=", "x^2", size=72).next_to(a1[1], DOWN, buff=0.7, aligned_edge=LEFT)
        a3[1].set_color(GRN)
        bigger = DashedVMobject(Square(SQS + STH, color=PINK, stroke_width=4).move_to(SQ0 + np.array([(SQS + STH) / 2] * 2 + [0])), num_dashes=40)
        q = H("grows how fast?", 48, PINK).move_to([2.6, -1.3, 0])
        self.add(sq, lx, ly, a1, a2, a3, bigger, q)
        self.go("4:58.42", FadeOut(VGroup(a1, a2, a3, q)), run=0.4)
        x1, y1 = SQ0[0] + SQS, SQ0[1] + SQS
        top = Rectangle(width=SQS, height=STH, stroke_color=PINK, stroke_width=4, fill_color=PINK, fill_opacity=0.45).move_to([SQ0[0] + SQS / 2, y1 + STH / 2, 0])
        side = Rectangle(width=STH, height=SQS, stroke_color=PINK, stroke_width=4, fill_color=PINK, fill_opacity=0.45).move_to([x1 + STH / 2, SQ0[1] + SQS / 2, 0])
        self.go("5:02.30", GrowFromEdge(top, DOWN), FadeOut(bigger), run=0.6)
        self.go("5:04.14", GrowFromEdge(side, LEFT), run=0.6)
        tx = M("x", size=50, color=PINK).next_to(top, UP, buff=0.12)
        sx = M("x", size=50, color=PINK).next_to(side, RIGHT, buff=0.15)
        self.go("5:06.90", Write(tx), Write(sx), run=0.5)
        # lay the two strips end to end on the right
        ry = 1.3
        r1 = Rectangle(width=SQS, height=STH, stroke_color=PINK, stroke_width=4, fill_color=PINK, fill_opacity=0.45).move_to([0.05 + SQS / 2, ry, 0])
        r2 = r1.copy().next_to(r1, RIGHT, buff=0)
        l1 = M("x", size=50, color=PINK).next_to(r1, UP, buff=0.12)
        l2 = M("x", size=50, color=PINK).next_to(r2, UP, buff=0.12)
        self.go("5:09.90", TransformFromCopy(top, r1), TransformFromCopy(tx, l1), run=0.6)
        cp = side.copy()
        self.add(cp)
        self.play(Rotate(cp, -PI / 2), run_time=0.35)
        self.play(cp.animate.move_to(r2), TransformFromCopy(sx, l2), run_time=0.45)
        br = Brace(VGroup(r1, r2), DOWN, color=DIM, buff=0.12)
        two = M("2x", size=72, color=PINK).next_to(br, DOWN, buff=0.12)
        self.go("5:11.86", GrowFromCenter(br), Write(two), run=0.5)
        corner = Square(STH, stroke_color=YEL, stroke_width=4, fill_color=YEL, fill_opacity=0.8).move_to([x1 + STH / 2, y1 + STH / 2, 0])
        self.go("5:14.10", FadeIn(corner, scale=0.5), run=0.4)
        self.play(Circumscribe(corner, Circle, color=YEL, buff=0.15), run_time=0.8)
        self.go("5:16.86", corner.animate.scale(0.02).set_opacity(0), run=0.8)
        self.remove(corner)
        self.go("5:20.50", Circumscribe(two, color=PINK, buff=0.12), run=0.8)
        res = M(r"\text{derivative of }", "x^2", r"\;=\;", "2x", size=64).move_to([3.25, -1.5, 0])
        res[1].set_color(GRN); res[3].set_color(PINK)
        if res.width > 6.4:
            res.width = 6.4
        self.go("5:23.70", Write(res), run=1.0)
        self.go("5:25.30", Create(panel(res, PINK, buff=0.25)), run=0.5)


# ================================================================ the power rule

def power_row(scene, e, ne, y, size, times, final=None, label_t=None):
    """x^e -> e x^ne with the exponent physically dropping to the front.
    times = (write, slide, drop, new power, final); final = parts of the tidy answer, e.g. ("2", "x")."""
    left = M("x", "^{" + e + "}", size=size).move_to([-1.5, y, 0])
    left[1].set_color(ORG)
    arrow = Arrow([-0.4, y, 0], [1.2, y, 0], buff=0, color=DIM, stroke_width=4, tip_length=0.22)
    right = M(e, "x", "^{" + ne + "}", size=size)
    right.shift(RIGHT * (1.6 - right.get_left()[0]))
    right.shift(UP * (left[0].get_center()[1] - right[1].get_center()[1]))
    right[0].set_color(ORG); right[2].set_color(ORG)
    scene.go(times[0], Write(left), run=0.5)
    pw = None
    if label_t:
        pw = H("power", 40, YEL).next_to(left[1], UR, buff=0.1)
        scene.go(label_t, FadeIn(pw, shift=DOWN * 0.1), Circumscribe(left[1], Circle, color=YEL, buff=0.08), run=0.6)
    cp = left.copy()
    cp.shift(right[1].get_center() - cp[0].get_center())
    scene.go(times[1], Create(arrow), TransformFromCopy(left, cp), *([FadeOut(pw)] if pw else []), run=0.4)
    scene.go(times[2], Transform(cp[1], right[0], path_arc=-0.75 * PI), run=0.7)
    scene.go(times[3], FadeIn(right[2], shift=DOWN * 0.1), run=0.4)
    got = VGroup(cp[1], cp[0], right[2])
    if final is None:
        return VGroup(left, arrow, got)
    fin = M(*final, size=size, color=PINK)
    fin.move_to(got, aligned_edge=LEFT).align_to(cp[0], DOWN)
    anims = [ReplacementTransform(got[i], fin[i]) for i in range(len(fin))]
    if len(fin) < 3:
        anims.append(FadeOut(got[2], shift=UP * 0.15))
    scene.go(times[4], *anims, run=0.6)
    return VGroup(left, arrow, fin)


class K02_Power(Shot):
    def body(self):
        self.title("A Cool Shortcut", "5:27.36")
        rule = power_row(self, "n", "n-1", 1.3, 64, ("5:31.48", "5:33.70", "5:34.14", "5:35.98"), label_t="5:32.98")
        power_row(self, "2", "1", -0.5, 80, ("5:37.74", "5:38.90", "5:39.36", "5:40.78", "5:42.40"), final=("2", "x"))
        power_row(self, "3", "2", -2.4, 80, ("5:43.50", "5:44.60", "5:45.04", "5:47.30", "5:48.36"), final=("3", "x", "^{2}"))
        self.title("The Power Rule", "5:50.00")
        self.go("5:50.56", Create(panel(rule, YEL, buff=0.25)), run=0.6)
        tk = tick_mark(GRN, 0.7).move_to([4.6, -1.45, 0])
        self.go("5:55.10", Create(tk), run=0.5)


# ================================================================ call to action

class K02_Roadmap(Shot):
    def body(self):
        self.title("Full Calculus Course", "6:03.70")
        ps = [pill("Limits", YEL, 44), pill("Derivatives", PINK, 44), pill("Integrals", GRN, 44)]
        row = VGroup(*ps).arrange(RIGHT, buff=1.1).move_to([0, 0.9, 0])
        arrs = [Arrow(ps[i].get_right(), ps[i + 1].get_left(), buff=0.15, color=DIM, stroke_width=4, tip_length=0.2) for i in range(2)]
        self.go("6:04.84", FadeIn(ps[0], shift=UP * 0.15), run=0.5)
        self.go("6:05.86", GrowArrow(arrs[0]), FadeIn(ps[1], shift=UP * 0.15), run=0.5)
        self.go("6:06.94", GrowArrow(arrs[1]), FadeIn(ps[2], shift=UP * 0.15), run=0.5)
        btn_t = H("Subscribe", 50, CHALK)
        btn = VGroup(RoundedRectangle(width=btn_t.width + 0.9, height=1.05, corner_radius=0.4, color=PINK, stroke_width=6).move_to(btn_t), btn_t).move_to([-1.0, -1.45, 0])
        self.go("6:10.60", Create(btn[0]), Write(btn[1]), run=0.7)
        bl = bell().move_to([2.0, -1.45, 0])
        self.go("6:12.20", Create(bl), run=0.7)
        soon = H("coming soon", 54, YEL).move_to([0, -3.0, 0])
        self.go("6:14.30", Write(soon), run=0.6)
