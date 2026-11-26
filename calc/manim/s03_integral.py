"""Builder 03: Big Idea #2, the integral (6:20.50 - 9:11.00)."""
from common import *


# ---------------------------------------------------------------- helpers

def car(s=1.0):
    """Chalk car: body outline, a window line, two wheels. Bottom of the wheels at y=0, left end at x=0."""
    body = VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners(
        [[0, .25, 0], [2.0, .25, 0], [2.0, .62, 0], [1.6, .68, 0], [1.28, 1.02, 0], [.55, 1.02, 0], [.3, .68, 0], [0, .62, 0], [0, .25, 0]])
    win = VMobject(stroke_color=CHALK, stroke_width=3).set_points_as_corners([[.42, .68, 0], [.62, .92, 0], [1.22, .92, 0], [1.42, .68, 0], [.42, .68, 0]])
    w1 = Circle(radius=.2, stroke_color=CHALK, stroke_width=4).move_to([.48, .2, 0])
    w2 = Circle(radius=.2, stroke_color=CHALK, stroke_width=4).move_to([1.52, .2, 0])
    return VGroup(body, win, w1, w2).scale(s, about_point=ORIGIN)


def speed_axes():
    """Speed-time axes used by the car shots. Origin at (-5.4, -3.2)."""
    ax = Axes(x_range=[0, 2.4, 1], y_range=[0, 100, 20], x_length=7.2, y_length=3.5,
              axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2))
    ax.shift(np.array([-5.4, -3.2, 0]) - ax.c2p(0, 0))
    labs = VGroup(H("time (h)", 34, DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.15),
                  H("speed (km/h)", 34, DIM).next_to(ax.y_axis.get_end(), RIGHT, buff=0.2),
                  M("1", size=36, color=DIM).next_to(ax.c2p(1, 0), DOWN, buff=0.15),
                  M("2", size=36, color=DIM).next_to(ax.c2p(2, 0), DOWN, buff=0.15))
    return ax, labs


ROAD_Y = 0.95


def road():
    return Line([-6.2, ROAD_Y, 0], [6.2, ROAD_Y, 0], color=DIM, stroke_width=3)


def car_at(tt):
    """Car position for trip time tt in hours (0..2)."""
    return car(0.9).shift([-5.6 + tt / 2 * 8.6, ROAD_Y + 0.02, 0])


# the changing-speed trip: (hour, km/h) keypoints joined by smooth eases
KEYS = [(0, 30), (0.4, 30), (0.65, 80), (1.0, 80), (1.3, 0), (1.6, 0), (1.85, 45), (2.0, 45)]


def v(t):
    for (t0, v0), (t1, v1) in zip(KEYS, KEYS[1:]):
        if t <= t1:
            u = (t - t0) / (t1 - t0)
            return v0 + (v1 - v0) * (1 - np.cos(PI * u)) / 2
    return KEYS[-1][1]


def speed_curve(ax, t_end, color=PINK):
    ts = np.linspace(0, max(t_end, 1e-3), max(2, int(120 * t_end)))
    return VMobject(stroke_color=color, stroke_width=6).set_points_smoothly([ax.c2p(t, v(t)) for t in ts])


def strips(ax, f, n, a, b, color=GRN, fill=0.35):
    """n left-endpoint rectangles under f on [a, b], as Polygons (so they Transform cleanly)."""
    dx = (b - a) / n
    sw = max(0.5, min(3, 24 / n))
    g = VGroup()
    for i in range(n):
        x0 = a + i * dx
        h = f(x0)
        g.add(Polygon(ax.c2p(x0, 0), ax.c2p(x0 + dx, 0), ax.c2p(x0 + dx, h), ax.c2p(x0, h),
                      stroke_color=color, stroke_width=sw, fill_color=color, fill_opacity=fill))
    return g


def halves(ax, f, n, a, b, color=GRN, fill=0.35, sw=None):
    """n rectangles drawn as 2n halves (same picture), the starting point for a smooth split to 2n."""
    dx = (b - a) / n
    sw = sw if sw is not None else max(0.5, min(3, 24 / (2 * n)))
    g = VGroup()
    for i in range(n):
        x0 = a + i * dx
        h = f(x0)
        for x in (x0, x0 + dx / 2):
            g.add(Polygon(ax.c2p(x, 0), ax.c2p(x + dx / 2, 0), ax.c2p(x + dx / 2, h), ax.c2p(x, h),
                          stroke_color=color, stroke_width=sw, fill_color=color, fill_opacity=fill))
    return g


def hill(x):
    return 0.6 + 2.4 * np.exp(-((x - 2.6) / 1.5) ** 2) + 0.12 * x


def hill_axes():
    ax = Axes(x_range=[0, 6.6, 1], y_range=[0, 3.6, 1], x_length=7.4, y_length=4.4,
              axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, include_ticks=False))
    ax.shift(np.array([-6.2, -3.3, 0]) - ax.c2p(0, 0))
    return ax


def hill_curve(ax):
    return ax.plot(hill, x_range=[0, 6], color=BLUE, stroke_width=6)


def flash_stroke(scene, mob, col, w, back_col, back_w, t):
    scene.go(t, mob.animate.set_stroke(col, w), run=0.25)
    scene.play(mob.animate.set_stroke(back_col, back_w), run_time=0.3)


# ---------------------------------------------------------------- shots

class K03_Pieces(Shot):
    """The derivative breaks a whole into tiny moments; the integral adds them back to a total."""
    def body(self):
        self.title("The Integral", animate=False)  # the title card just said it
        n, w = 10, 0.9
        pcs = VGroup(*[Rectangle(width=w, height=0.9, stroke_color=BLUE, stroke_width=3, fill_color=BLUE, fill_opacity=0.3)
                       .move_to([(i - (n - 1) / 2) * w, -0.4, 0]) for i in range(n)])
        self.go("6:20.60", Create(pcs), run=0.8)
        der = H("derivative", 48, PINK).move_to([0, 1.25, 0])
        self.go("6:21.46", Write(der), run=0.35)
        spread = [p.animate.shift(RIGHT * (i - (n - 1) / 2) * 0.26) for i, p in enumerate(pcs)]
        self.go("6:21.82", *spread, run=0.8)
        mom = H("tiny moments", 38, DIM).move_to([0, -1.55, 0])
        self.go("6:22.82", FadeIn(mom, shift=UP * 0.15), run=0.5)
        integ = H("integral", 48, GRN).move_to(der)
        self.go("6:24.40", ReplacementTransform(der, integ), FadeOut(mom), run=0.6)
        self.go("6:26.72", Indicate(pcs, color=YEL, scale_factor=1.05), run=0.8)
        back = [p.animate.move_to([(i - (n - 1) / 2) * w, -0.4, 0]).set_stroke(GRN).set_fill(GRN, 0.35) for i, p in enumerate(pcs)]
        self.go("6:28.66", *back, run=1.0)
        br = Brace(pcs, DOWN, color=GRN, buff=0.15)
        tot = H("total", 48, GRN).next_to(br, DOWN, buff=0.12)
        self.go("6:30.02", GrowFromCenter(br), FadeIn(tot, shift=UP * 0.15), run=0.6)


class K03_Steady(Shot):
    """60 km/h for 2 h: the speed-time rectangle's area IS the distance."""
    def body(self):
        self.title("A steady car trip", "6:30.85")
        rd = road()
        tt = ValueTracker(0)
        self.go("6:31.40", Create(rd), run=0.6)
        c0 = car_at(0)
        self.go("6:32.00", Create(c0), run=0.8)
        c = always_redraw(lambda: car_at(tt.get_value()))
        self.remove(c0); self.add(c)
        ax, labs = speed_axes()
        self.go("6:32.88", Create(ax), FadeIn(labs), run=0.9)
        spd = always_redraw(lambda: H("60 km/h", 36, PINK).next_to(c, UP, buff=0.12))
        tick60 = M("60", size=36, color=ORG).next_to(ax.c2p(0, 60), LEFT, buff=0.15)
        self.go("6:34.38", FadeIn(spd, shift=DOWN * 0.1), FadeIn(tick60), run=0.4)
        line = always_redraw(lambda: Line(ax.c2p(0, 60), ax.c2p(max(tt.get_value(), 1e-3), 60), color=PINK, stroke_width=6))
        self.add(line)
        self.play(tt.animate.set_value(2), run_time=2.0, rate_func=linear)
        self.remove(line)
        line = Line(ax.c2p(0, 60), ax.c2p(2, 60), color=PINK, stroke_width=6)
        self.add(line)
        q = H("how far?", 44, YEL).move_to([4.4, -0.9, 0])
        self.go("6:36.94", FadeIn(q, shift=UP * 0.15), run=0.5)
        rect = Polygon(ax.c2p(0, 0), ax.c2p(2, 0), ax.c2p(2, 60), ax.c2p(0, 60), stroke_color=GRN, stroke_width=3,
                       fill_color=GRN, fill_opacity=0.35).set_z_index(-1)
        e1 = M("60", r"\times", "2", size=60).move_to([4.4, -0.9, 0])
        e1[0].set_color(ORG); e1[2].set_color(ORG)
        self.go("6:39.62", FadeOut(q), Write(e1[0]), Indicate(tick60, color=YEL), FadeIn(rect), run=0.4)
        self.go("6:39.98", Write(e1[1]), run=0.25)
        self.go("6:40.26", Write(e1[2]), Indicate(labs[3], color=YEL), run=0.4)
        e2 = M("=", r"120\text{ km}", size=60).next_to(e1, DOWN, buff=0.3)
        e2[1].set_color(GRN)
        km = M(r"120\text{ km}", size=54, color=GRN).move_to(rect)
        self.go("6:41.12", Write(e2), FadeIn(km, scale=0.9), run=0.6)
        ad = H("area = distance", 40, GRN).next_to(e2, DOWN, buff=0.4)
        self.go("6:41.90", Write(ad), run=0.7)
        self.c, self.spd = c, spd


class K03_Chop(Shot):
    """Changing speed (30, 80, 0): chop the trip into tiny moments, speed x time each, add up."""
    def body(self):
        self.title("A steady car trip", animate=False)
        ax, labs = speed_axes()
        # the end of K03_Steady, for a seamless cut
        c = car_at(2)
        spd = H("60 km/h", 36, PINK).next_to(c, UP, buff=0.12)
        tick60 = M("60", size=36, color=ORG).next_to(ax.c2p(0, 60), LEFT, buff=0.15)
        flat = Line(ax.c2p(0, 60), ax.c2p(2, 60), color=PINK, stroke_width=6)
        rect = Polygon(ax.c2p(0, 0), ax.c2p(2, 0), ax.c2p(2, 60), ax.c2p(0, 60), stroke_color=GRN, stroke_width=3,
                       fill_color=GRN, fill_opacity=0.35).set_z_index(-1)
        e1 = M("60", r"\times", "2", size=60).move_to([4.4, -0.9, 0])
        e1[0].set_color(ORG); e1[2].set_color(ORG)
        e2 = M("=", r"120\text{ km}", size=60).next_to(e1, DOWN, buff=0.3)
        e2[1].set_color(GRN)
        km = M(r"120\text{ km}", size=54, color=GRN).move_to(rect)
        ad = H("area = distance", 40, GRN).next_to(e2, DOWN, buff=0.4)
        rd = road()
        self.add(ax, labs, rd, c, spd, tick60, flat, rect, e1, e2, km, ad)

        self.go("6:43.48", FadeOut(VGroup(rect, km, e1, e2, ad, tick60, flat)), run=0.5)
        self.title("Speed keeps changing")
        # the car's speed label now changes with the curve
        tt = ValueTracker(0)
        c2 = always_redraw(lambda: car_at(tt.get_value()))
        spd2 = always_redraw(lambda: M(f"{int(round(v(tt.get_value())))}", r"\text{ km/h}", size=40, color=PINK).next_to(c2, UP, buff=0.12))
        self.go("6:45.20", FadeOut(c, shift=RIGHT * 0.3), FadeOut(spd), run=0.4)
        self.add(c2, spd2)
        cur = always_redraw(lambda: speed_curve(ax, tt.get_value()))
        self.add(cur)
        self.play(FadeIn(c2), FadeIn(spd2), run_time=0.3)
        l30 = M("30", size=42, color=ORG).next_to(ax.c2p(0.2, 30), UP, buff=0.15)
        l80 = M("80", size=42, color=ORG).next_to(ax.c2p(0.82, 80), UP, buff=0.12)
        l0 = M("0", size=42, color=ORG).next_to(ax.c2p(1.45, 0), UP, buff=0.18)
        tr = H("traffic", 34, ORG).next_to(ax.c2p(1.45, 0), DOWN, buff=0.15)
        self.go("6:46.14", tt.animate.set_value(0.42), run=0.5, rate_func=linear)
        self.play(FadeIn(l30, shift=UP * 0.1), run_time=0.3)
        self.go("6:47.10", tt.animate.set_value(0.95), run=0.9, rate_func=linear)
        self.play(FadeIn(l80, shift=UP * 0.1), run_time=0.3)
        self.go("6:48.58", tt.animate.set_value(1.5), run=1.4, rate_func=linear)
        self.play(FadeIn(l0, shift=UP * 0.1), FadeIn(tr, shift=UP * 0.1), run_time=0.35)
        self.play(tt.animate.set_value(2), run_time=0.7, rate_func=linear)
        self.remove(cur, c2, spd2)
        cur = speed_curve(ax, 2)
        cend = car_at(2)
        send = M(f"{int(round(v(2)))}", r"\text{ km/h}", size=40, color=PINK).next_to(cend, UP, buff=0.12)
        cur.set_z_index(2)
        self.add(cur, cend, send)
        mult = M(r"\text{speed}", r"\times", r"\text{time}", size=50).move_to([4.5, -1.2, 0])
        mult[0].set_color(PINK)
        x = strike(mult)
        self.go("6:51.10", FadeIn(mult, shift=UP * 0.15), run=0.4)
        self.go("6:51.48", Create(x), run=0.35)
        pts = [ax.c2p(t, v(t)) for t in np.linspace(0, 2, 200)]
        reg = Polygon(ax.c2p(0, 0), *pts, ax.c2p(2, 0), stroke_width=0, fill_color=GRN, fill_opacity=0.3).set_z_index(-1)
        qm = H("?", 80, GRN).move_to(ax.c2p(0.8, 32))
        self.go("6:53.60", FadeIn(reg), Write(qm), run=0.6)

        # ---- the integral trick
        self.go("6:55.28", FadeOut(mult), FadeOut(x), FadeOut(VGroup(cend, send, rd)), run=0.4)
        self.play(VGroup(ax, labs, cur, l30, l80, l0, tr, reg, qm).animate.shift(UP * 0.9), run_time=0.6)
        self.title("The integral trick")
        n = 20
        cuts = VGroup(*[DashedLine(ax.c2p(i * 2 / n, 0), ax.c2p(i * 2 / n, max(v(i * 2 / n), 4)), color=DIM, stroke_width=2, dash_length=0.06)
                        for i in range(1, n)])
        self.go("6:57.26", FadeOut(qm), FadeOut(reg), LaggedStart(*[Create(cl) for cl in cuts], lag_ratio=0.06), run=1.0)
        k = 8  # the strip [0.8, 0.9] h: speed is flat at 80
        hb = SurroundingRectangle(VGroup(cuts[k - 1], cuts[k]), color=YEL, buff=0.08, stroke_width=3)
        mom = H("one tiny moment", 36, YEL).move_to([4.5, 1.1, 0])
        arr = Arrow(mom.get_left() + LEFT * 0.1, hb.get_right() + UP * 0.6, color=YEL, buff=0.1, stroke_width=4, max_tip_length_to_length_ratio=0.1)
        self.go("7:00.30", Create(hb), FadeIn(mom, shift=LEFT * 0.2), GrowArrow(arr), run=0.6)
        st = strips(ax, v, n, 0, 2)
        one = st[k].copy()
        f1 = M(r"\text{speed}", r"\times", r"\text{time}", size=48).move_to([4.5, -0.1, 0])
        f1[0].set_color(PINK); f1[2].set_color(DIM)
        f2 = M("=", r"\text{small distance}", size=44).next_to(f1, DOWN, buff=0.3)
        f2[1].set_color(GRN)
        self.go("7:04.58", FadeIn(one), FadeOut(arr), run=0.4)
        self.go("7:05.02", Write(f1[0]), run=0.35)
        self.go("7:05.44", Write(f1[1]), run=0.25)
        self.go("7:05.74", Write(f1[2]), run=0.35)
        self.go("7:06.62", Write(f2), run=0.6)
        sm = M("d_1", "+", "d_2", "+", "d_3", "+", r"\dots", size=50, color=GRN).move_to([4.5, -0.1, 0])
        tot = H("= total distance", 40, GRN).next_to(sm, DOWN, buff=0.35)
        self.go("7:08.48", FadeOut(VGroup(hb, mom, f1, f2)), FadeOut(cuts), FadeIn(st, lag_ratio=0.08), run=1.0)
        self.remove(one)
        self.go("7:09.56", Write(sm), run=0.7)
        self.play(FadeIn(tot, shift=UP * 0.1), run_time=0.4)
        for n2, t in ((40, "7:11.20"), (80, "7:12.58")):
            src = halves(ax, v, n2 // 2, 0, 2)
            self.remove(st); self.add(src)
            st = strips(ax, v, n2, 0, 2)
            self.go(t, Transform(src, st), run=0.8)
            self.remove(src); self.add(st)


class K03_Hill(Shot):
    """Area under a hill: curvy is hard, rectangles are easy, fill it with skinny rectangles."""
    def body(self):
        self.title("Area under a curve", "7:14.30")
        ax = hill_axes()
        self.go("7:15.22", Create(ax), run=0.8)
        cv = hill_curve(ax).set_z_index(2)
        self.go("7:17.12", Create(cv), run=1.1)
        edge = DashedLine(ax.c2p(6, 0), ax.c2p(6, hill(6)), color=DIM, stroke_width=2, dash_length=0.08)
        reg = ax.get_area(cv, x_range=(0, 6), color=GRN, opacity=0.35).set_z_index(-1)
        self.go("7:20.00", FadeIn(reg), Create(edge), run=0.6)
        flash_stroke(self, cv, YEL, 8, BLUE, 6, "7:22.54")
        flash_stroke(self, ax.x_axis, YEL, 6, DIM, 3, "7:23.26")
        qm = H("?", 90, CHALK).move_to(ax.c2p(3, 1.1))
        self.go("7:24.52", Write(qm), run=0.5)
        a1 = M(r"\text{area}", "=", "?", size=56).move_to([4.4, 1.1, 0])
        self.go("7:26.44", Write(a1), run=0.6)
        R = Rectangle(width=2.4, height=1.4, stroke_color=ORG, stroke_width=5).move_to([4.4, -1.0, 0])
        lw = M("w", size=48, color=ORG).next_to(R, DOWN, buff=0.15)
        lh = M("h", size=48, color=ORG).next_to(R, LEFT, buff=0.15)
        self.go("7:28.56", Create(R), run=0.7)
        self.play(FadeIn(lw), FadeIn(lh), run_time=0.3)
        a2 = M(r"\text{area}", "=", "w", r"\times", "h", size=56).move_to(a1)
        a2[2].set_color(ORG); a2[4].set_color(ORG)
        self.go("7:30.62", ReplacementTransform(a1, a2), run=0.6)
        self.go("7:32.34", Indicate(a2[2], color=YEL), Indicate(lw, color=YEL), run=0.6)
        self.go("7:33.04", Indicate(a2[4], color=YEL), Indicate(lh, color=YEL), run=0.6)
        self.go("7:34.30", FadeOut(VGroup(a2, R, lw, lh, qm)), run=0.5)
        st = strips(ax, hill, 8, 0, 6)
        self.go("7:36.88", FadeOut(reg), LaggedStart(*[GrowFromEdge(r, DOWN) for r in st], lag_ratio=0.15), run=1.5)
        self.go("7:41.90", LaggedStart(*[Indicate(r, color=YEL, scale_factor=1.0) for r in st], lag_ratio=0.25), run=1.8)
        tot = M(r"\text{total}", r"\approx", "11.85", size=56, color=GRN).move_to([4.4, 0.4, 0])
        self.go("7:44.24", Write(tot), run=0.8)


class K03_Thinner(Shot):
    """Fat rectangles -> thinner -> endless; the running total settles: the limit."""
    def body(self):
        self.title("Area under a curve", animate=False)
        ax = hill_axes()
        cv = hill_curve(ax)
        edge = DashedLine(ax.c2p(6, 0), ax.c2p(6, hill(6)), color=DIM, stroke_width=2, dash_length=0.08)
        st = strips(ax, hill, 8, 0, 6)
        tot = M(r"\text{total}", r"\approx", "11.85", size=56, color=GRN).move_to([4.4, 0.4, 0])
        self.add(ax, cv, edge, st, tot)
        cv.set_z_index(2)
        # 8 -> 4 fat rectangles (heights merge pairwise)
        fat = halves(ax, hill, 4, 0, 6, sw=2)
        self.go("7:46.54", Transform(st, fat), FadeOut(tot), run=0.8)
        self.remove(st)
        st = strips(ax, hill, 4, 0, 6)
        self.add(st)
        # the table of totals
        X1, X2, Y0, DY = 3.0, 5.3, 1.75, 0.62
        hd = VGroup(H("rectangles", 34, DIM).move_to([X1, Y0, 0]), H("total", 34, GRN).move_to([X2, Y0, 0]))
        rule = Line([1.9, Y0 - 0.3, 0], [6.4, Y0 - 0.3, 0], color=FAINT, stroke_width=2)
        rows = []

        def row(label, val, t, run=0.35):
            """Add a table row; earlier rows turn dim."""
            for r in rows:
                r.set_color(DIM)
            y = Y0 - 0.75 - len(rows) * DY
            r = VGroup(H(label, 36).move_to([X1, y, 0]), M(val, size=42, color=GRN).move_to([X2, y, 0]))
            rows.append(r)
            if t:
                self.at(t)
            self.play(FadeIn(r[0], shift=UP * 0.1), Write(r[1]), run_time=run)

        self.go("7:47.40", FadeIn(hd), Create(rule), run=0.4)
        row("4", "11.58", "7:48.38", run=0.5)
        # what is wrong with fat rectangles
        def bits(over):
            g = VGroup()
            for i in range(4):
                x0, x1 = i * 1.5, (i + 1) * 1.5
                h = hill(x0)
                xs = np.linspace(x0, x1, 40)
                if over:
                    top = [ax.c2p(x, h) for x in xs]
                    bot = [ax.c2p(x, min(hill(x), h)) for x in xs[::-1]]
                else:
                    top = [ax.c2p(x, max(hill(x), h)) for x in xs]
                    bot = [ax.c2p(x, h) for x in xs[::-1]]
                g.add(Polygon(*top, *bot, stroke_width=0, fill_color=RED if over else YEL, fill_opacity=0.6))
            return g.set_z_index(1)
        ov, gp = bits(True), bits(False)
        lo = H("sticks out", 34, RED).move_to(ax.c2p(5.4, 2.4))
        lg = H("gaps", 34, YEL).move_to(ax.c2p(0.6, 2.4))
        self.go("7:50.98", FadeIn(ov), FadeIn(lo), run=0.5)
        self.go("7:52.22", FadeIn(gp), FadeIn(lg), run=0.5)
        self.go("7:53.46", FadeOut(VGroup(ov, gp, lo, lg)), run=0.4)
        steps = [(8, "8", "11.85", "7:53.86"), (16, "16", "11.97", "7:55.10"), (32, "thousands", "12.09", "7:56.94"),
                 (64, "millions", "12.09", "7:57.88"), (128, "endless", "12.09", "7:58.80")]
        for n, lab, val, t in steps:
            src = halves(ax, hill, n // 2, 0, 6)
            self.remove(st); self.add(src)
            st = strips(ax, hill, n, 0, 6)
            self.go(t, Transform(src, st), run=0.6)
            self.remove(src); self.add(st)
            row(lab, val, None, run=0.3)
        # perfect: the last number boxed
        bx = box(rows[-1][1], GRN, buff=0.12)
        self.go("8:02.20", Create(bx), run=0.5)
        # the limit
        self.go("8:03.86", Circumscribe(VGroup(*[r[1] for r in rows]), color=YEL, buff=0.12), run=1.0)
        lim = pill("the limit", YEL, 38).move_to([X2, -3.2, 0])
        ar = Arrow(lim.get_top(), bx.get_bottom(), buff=0.06, color=YEL, stroke_width=4, max_tip_length_to_length_ratio=0.3)
        self.go("8:06.00", FadeIn(lim, scale=0.85), GrowArrow(ar), run=0.5)
        self.go("8:07.32", *[Indicate(r[1], color=YEL, scale_factor=1.08) for r in rows[-3:]], run=1.0)


class K03_Integral(Shot):
    """That's an integral: slice into tiny pieces, add them up."""
    def body(self):
        self.title("That's an integral", "8:09.68")
        sym = M(r"\int", size=200, color=GRN).move_to([-4.6, -0.4, 0])
        nm = H("integral", 44, GRN).next_to(sym, DOWN, buff=0.3)
        self.go("8:10.16", Write(sym), FadeIn(nm, shift=UP * 0.1), run=0.8)
        n, w = 12, 0.55
        base = np.array([-1.6, -1.9, 0])
        f = lambda i: 0.8 + 2.4 * np.exp(-((i - 4.5) / 3.5) ** 2)
        pcs = VGroup(*[Rectangle(width=w, height=f(i), stroke_color=GRN, stroke_width=3, fill_color=GRN, fill_opacity=0.35)
                       .move_to(base + [i * w + w / 2, f(i) / 2, 0]) for i in range(n)])
        sp = [p.copy().shift(RIGHT * (i - (n - 1) / 2) * 0.12) for i, p in enumerate(pcs)]
        for p, q in zip(pcs, sp):
            p.move_to(q)
        self.go("8:11.42", LaggedStart(*[GrowFromEdge(p, DOWN) for p in pcs], lag_ratio=0.08), run=1.2)
        self.go("8:14.10", *[p.animate.shift(LEFT * (i - (n - 1) / 2) * 0.12) for i, p in enumerate(pcs)], run=0.7)
        full = VGroup(*[Rectangle(width=w, height=f(i)).move_to(base + [i * w + w / 2, f(i) / 2, 0]) for i in range(n)])
        br = Brace(full, DOWN, color=GRN, buff=0.12)
        tot = H("total", 40, GRN).next_to(br, DOWN, buff=0.1)
        self.play(GrowFromCenter(br), FadeIn(tot, shift=UP * 0.1), run_time=0.5)


def pizza_slice(k, R=1.9, c=ORIGIN):
    a0 = k * TAU / 8
    sec = AnnularSector(inner_radius=0, outer_radius=R, angle=TAU / 8, start_angle=a0, fill_color=YEL, fill_opacity=0.4,
                        stroke_color=CHALK, stroke_width=3)
    crust = Arc(radius=R - 0.08, start_angle=a0 + 0.03, angle=TAU / 8 - 0.06, stroke_color=ORG, stroke_width=9)
    peps = VGroup(*[Circle(radius=0.14, stroke_color=RED, stroke_width=3, fill_color=RED, fill_opacity=0.55)
                    .move_to(r * np.array([np.cos(a0 + f * TAU / 8), np.sin(a0 + f * TAU / 8), 0]))
                    for r, f in ((0.75, 0.55), (1.35, 0.3))])
    return VGroup(sec, crust, peps).shift(c)


class K03_Pizza(Shot):
    """Pizza: add up the slices. Bucket: each raindrop adds a bit; total water."""
    def body(self):
        self.title("Adding up pieces", "8:15.62")
        pc = np.array([-3.6, -0.7, 0])
        sl = VGroup(*[pizza_slice(k, c=pc) for k in range(8)])
        self.go("8:16.14", LaggedStart(*[FadeIn(s, scale=0.95) for s in sl], lag_ratio=0.1), run=0.9)
        ruler = DoubleArrow(pc + LEFT * 2.1, pc + RIGHT * 2.1, color=CHALK, buff=0, stroke_width=4, tip_length=0.2).shift(DOWN * 2.35)
        self.go("8:19.74", GrowFromCenter(ruler), run=0.5)
        cx = cross_mark(RED, 0.28).move_to(ruler)
        self.go("8:20.38", FadeIn(cx, scale=1.4), run=0.35)
        self.go("8:21.70", FadeOut(ruler), FadeOut(cx), run=0.3)
        outs = []
        for k, t in ((0, "8:22.30"), (1, "8:22.56"), (2, "8:22.86")):
            mid = (k + 0.5) * TAU / 8
            outs.append(sl[k].animate.shift(0.45 * np.array([np.cos(mid), np.sin(mid), 0])))
        self.go("8:22.30", LaggedStart(*outs, lag_ratio=0.3), run=0.8)
        s3 = M("1", "+", "1", "+", "1", size=50, color=GRN).move_to(pc + DOWN * 2.45)
        self.play(Write(s3), run_time=0.4)
        # bucket
        bc = np.array([3.4, -1.5, 0])
        TL, BL, BR, TR = bc + [-1.25, 1.1, 0], bc + [-0.9, -1.1, 0], bc + [0.9, -1.1, 0], bc + [1.25, 1.1, 0]
        bucket = VMobject(stroke_color=CHALK, stroke_width=5).set_points_as_corners([TL, BL, BR, TR])
        handle = Arc(radius=1.25, start_angle=0, angle=PI, stroke_color=DIM, stroke_width=3).move_arc_center_to(bc + [0, 1.1, 0])
        self.go("8:24.50", Create(bucket), Create(handle), run=0.7)
        lvl = ValueTracker(0.02)

        def water():
            u = lvl.get_value()
            l = BL + (TL - BL) * u
            r = BR + (TR - BR) * u
            return Polygon(BL, BR, r, l, stroke_width=0, fill_color=BLUE, fill_opacity=0.45).set_z_index(-1)
        wt = always_redraw(water)
        clock = tracker_time(self)
        rng = np.random.default_rng(3)
        top, rim = 2.2, BL[1]
        drops = VGroup()
        for i in range(9):
            x0 = bc[0] + rng.uniform(-0.9, 0.9)
            ph = rng.uniform(0, 1)
            d = Line(UP * 0.14, DOWN * 0.14, color=BLUE, stroke_width=4)

            def upd(m, x0=x0, ph=ph):
                y = top - ((clock.get_value() * 2.6 + ph * (top - rim)) % (top - rim))
                m.move_to([x0, y, 0])
                m.set_stroke(opacity=0 if y < BL[1] + (TL[1] - BL[1]) * lvl.get_value() + 0.1 else 1)  # gone into the water
            d.add_updater(upd)
            drops.add(d)
        self.go("8:25.32", FadeIn(drops), FadeIn(wt), run=0.4)
        self.play(lvl.animate.set_value(0.62), run_time=sec("8:29.54") - self.now(), rate_func=linear)
        bri = Brace(Line(BR, BR + (TR - BR) * 0.72), RIGHT, color=GRN, buff=0.15)
        tw = H("total", 40, GRN).next_to(bri, RIGHT, buff=0.08)
        self.play(lvl.animate.set_value(0.72), GrowFromCenter(bri), FadeIn(tw, shift=LEFT * 0.1), run_time=0.8, rate_func=linear)
        self.play(FadeOut(drops), run_time=0.4)


def rope(knot, n=160):
    """A rope from x=-1.9 to 1.9: straight, or with one loop in the middle (a loose knot)."""
    a, b = 0.36, 0.85
    s = np.linspace(0, 1, n)
    if not knot:
        return VMobject(stroke_color=ORG, stroke_width=7).set_points_smoothly([[-1.9 + 3.8 * u, 0, 0] for u in s])
    pts = []
    L = a * PI
    for u in s:
        x = -1.9 + 3.8 * u
        if abs(x) < L:
            t = x / a  # t in (-pi, pi)
            pts.append([a * t - b * np.sin(t), b * (1 + np.cos(t)), 0])
        else:
            pts.append([x, 0, 0])
    return VMobject(stroke_color=ORG, stroke_width=7).set_points_smoothly(pts)


class K03_Opposites(Shot):
    """How fast? vs How much in total? Opposites: tie/untie a knot, up/down the stairs."""
    def body(self):
        self.title("Two opposite ideas", "8:31.88")
        d = pill("Derivative", PINK, 44).move_to([-3.6, 1.6, 0])
        i = pill("Integral", GRN, 44).move_to([3.6, 1.6, 0])
        dq = H("how fast?", 40, PINK).next_to(d, DOWN, buff=0.3)
        iq = H("how much in total?", 40, GRN).next_to(i, DOWN, buff=0.3)
        self.go("8:35.52", FadeIn(d, scale=0.85), run=0.5)
        self.go("8:36.96", Write(dq), run=0.7)
        self.go("8:39.40", FadeIn(i, scale=0.85), run=0.5)
        self.go("8:40.78", Write(iq), run=0.9)
        opp = M(r"\rightleftarrows", size=120, color=YEL).move_to([0, 1.6, 0])
        self.go("8:45.72", Write(opp), run=0.6)
        self.play(Circumscribe(opp, color=YEL, buff=0.1), run_time=0.6)
        # knot: tie, untie
        rc = np.array([-3.6, -2.3, 0])
        r0 = rope(False).shift(rc)
        self.go("8:47.00", Create(r0), run=0.5)
        tl = H("tie", 36, DIM).next_to(r0, DOWN, buff=0.35)
        self.go("8:47.62", Transform(r0, rope(True).shift(rc)), FadeIn(tl), run=0.6)
        ul = H("untie", 36, DIM).move_to(tl)
        self.go("8:48.26", Transform(r0, rope(False).shift(rc)), ReplacementTransform(tl, ul), run=0.7)
        # stairs: up, then down
        p = np.array([1.5, -3.4, 0]); w, h = 0.8, 0.5
        pts = [p]
        for _ in range(5):
            pts += [pts[-1] + [0, h, 0], pts[-1] + [w, h, 0]]
        stairs = VMobject(stroke_color=CHALK, stroke_width=5).set_points_as_corners(pts)
        self.go("8:49.70", Create(stairs), run=0.6)
        up = Arrow(p + [0.2, 0.95, 0], pts[-1] + [-0.25, 0.75, 0], color=GRN, buff=0, stroke_width=5, max_tip_length_to_length_ratio=0.08)
        dn = Arrow(pts[-1] + [0.25, -0.65, 0], p + [0.95, -0.05, 0], color=PINK, buff=0, stroke_width=5, max_tip_length_to_length_ratio=0.08)
        self.go("8:50.24", GrowArrow(up), run=0.7)
        self.go("8:51.42", GrowArrow(dn), run=0.7)


class K03_FTC(Shot):
    """Derivative then integral brings you back; the Fundamental Theorem joins the two ideas."""
    def body(self):
        self.title("Back where you started", "8:52.40")
        db = pill("distance", BLUE, 46).move_to([-3.8, -0.7, 0])
        sb = pill("speed", PINK, 46).move_to([3.8, -0.7, 0])
        self.go("8:52.90", FadeIn(db, scale=0.85), run=0.3)
        top = CurvedArrow(db.get_top() + UP * 0.1, sb.get_top() + UP * 0.1, angle=-PI / 3, color=PINK, stroke_width=5)
        tl = H("derivative", 40, PINK).move_to([0, 1.35, 0])
        self.go("8:53.24", Create(top), FadeIn(tl), run=0.6)
        self.play(FadeIn(sb, scale=0.85), run_time=0.3)
        bot = CurvedArrow(sb.get_bottom() + DOWN * 0.1, db.get_bottom() + DOWN * 0.1, angle=-PI / 3, color=GRN, stroke_width=5)
        bl = H("integral", 40, GRN).move_to([0, -2.75, 0])
        self.go("8:54.48", Create(bot), FadeIn(bl), run=0.7)
        self.go("8:56.20", Circumscribe(db, color=YEL, buff=0.12), run=0.9)
        self.go("8:58.30", Indicate(VGroup(tl, bl), color=YEL, scale_factor=1.05), run=0.8)
        # the name
        self.go("9:00.70", FadeOut(VGroup(db, sb, top, bot, tl, bl)), run=0.4)
        self.title("Fundamental Theorem of Calculus")
        d = pill("Derivative", PINK, 46).move_to([-3.4, -0.4, 0])
        i = pill("Integral", GRN, 46).move_to([3.4, -0.4, 0])
        self.go("9:03.86", FadeIn(d, scale=0.85), FadeIn(i, scale=0.85), run=0.5)
        lk = M(r"\rightleftarrows", size=120, color=YEL).move_to([0, -0.4, 0])
        self.go("9:04.40", Write(lk), run=0.6)
        g = VGroup(d, lk, i)
        pn = panel(g, PURP, buff=0.5, width=4)
        one = H("one system", 38, PURP).next_to(pn, DOWN, buff=0.25)
        self.go("9:05.82", Create(pn), FadeIn(one, shift=UP * 0.1), run=0.8)
        ul = brush_line(one.width + 0.4, YEL, center=one.get_bottom() + DOWN * 0.12)
        self.go("9:08.34", Circumscribe(pn, color=YEL, buff=0.1), run=1.0)
        self.go("9:09.60", Create(ul), run=0.6)
