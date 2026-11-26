"""Builder 22: start of Chapter 8 "Motion, Related Rates and Approximations".
Three kinds of problems (a sliding particle, a growing balloon, a tangent line); position s(t) -> velocity v = s'
-> acceleration a = v' = s'' on a particle that really moves (live v and a arrows); reading the signs and speed = |v|;
the worked particle s = t^3 - 6t^2 + 9t: v = 3(t-1)(t-3), a = 6t - 12, at rest at t = 1, 3, the sign line, the whole
trip traced as s(t) with time running down, displacement 4 vs total distance 12 (legs drawn by the moving particle);
speeding up = v and a with the same sign (two lanes, a car: gas, brake, reversing + brake), the sign chart per piece;
the ball thrown up at 20 m/s: a chalk ball on a vertical track that shares its height scale with the h(t) graph,
dots on h(t) and v(t) driven by the same ValueTracker, the velocity arrow shrinking to zero at the top and flipping.
Colours: s / h graphs BLUE, velocity PINK, acceleration PURP, example numbers and points ORG, totals and answers GRN.

END SEAM (K22_BallLand at 2:17:20.04), for builder 23:
  title "A Ball Thrown Up". Left: ground line y=-3.16 from x=-6.7 to -5.5, dashed track at x=-6.3, ball (r 0.16) on
  the ground at (-6.3, -3.0) with a PINK velocity arrow pointing DOWN (v = -20, length 0.74, at x=-5.95) and a PURP
  arrow (a = -10) at x=-6.62 pointing down onto the ball from 0.6 above it. h(t) axes: origin (-4.95, -3.0), 1 s = 1.0 wide, 1 m = 0.225 high (20 m at y=1.5),
  BLUE parabola h = 20t - 5t^2 on [0, 4], ORG dots at (0,0), the peak (2,20) with dashed guides, and (4,0).
  v(t) axes: origin (1.0, 0.55), 1 s = 1.0 wide, 10 m/s = 0.7 high, PINK line v = 20 - 10t, ORG dot at (4, -20).
  Algebra strip (size 50, centred x=3.6): "20t - 5t^2 = 0" y=-1.5, "5t(4 - t) = 0" y=-2.4,
  "t = 0  or  t = 4 s" y=-3.3 with "t = 4 s" boxed GRN."""
from common import *


# ---------------------------------------------------------------- the maths of this section, checked once

def S_F(t):
    return t ** 3 - 6 * t ** 2 + 9 * t


def V_F(t):
    return 3 * t ** 2 - 12 * t + 9


def H_B(t):
    return 20 * t - 5 * t ** 2


def V_B(t):
    return 20 - 10 * t


assert [S_F(t) for t in (0, 1, 3, 4)] == [0, 4, 0, 4] and [V_F(t) for t in (0, 2, 4)] == [9, -3, 9]
assert 3 * 1 * -1 == -3 and 3 * 3 * 1 == 9 and 6 * 2 - 12 == 0
assert H_B(2) == 20 and V_B(2) == 0 and H_B(4) == 0 and 40 - 20 == 20


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def col(m, cs):
    for k, c in cs.items():
        m[k].set_color(c)
    return m


def unclock(*ms):
    for m in ms:
        for x in m.get_family():
            x.clear_updaters()


def arr(a, b, color, w=6, tip=0.22):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, color=color, stroke_width=w, tip_length=tip,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


def vec(p, d, color, lab=None, w=6, min_len=0.08, gap=0.14):
    """Arrow from p along d, with an optional label just past the tip. Nothing at all when |d| is tiny:
    an object at rest has no velocity arrow (and a zero-length Arrow would break)."""
    p, d = np.array(p, float), np.array(d, float)
    n = np.linalg.norm(d)
    if n < min_len:
        return VGroup()
    g = VGroup(arr(p, p + d, color, w))
    if lab is not None:
        u = d / n
        g.add(lab.copy().move_to(p + d + u * (gap + abs(u[0]) * lab.width / 2 + abs(u[1]) * lab.height / 2)))
    return g


def live_in(scene, *mobs, run=0.4):
    """Fade in always_redraw objects (a fade on a live object is overwritten every frame): fade a frozen copy, then swap."""
    st = [m.copy() for m in mobs]
    unclock(*st)
    scene.play(*[FadeIn(s) for s in st], run_time=run)
    scene.remove(*st)
    scene.add(*mobs)


_DG = {}


def digits(s, size=48, color=CHALK):
    """A number from cached glyphs (no new LaTeX per frame); the minus sits at mid-height."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.035, aligned_edge=DOWN)
    ref = next((x for x, ch in zip(g, s) if ch.isdigit()), None)
    for x, ch in zip(g, s):
        if ch in "-+" and ref is not None:
            x.set_y(ref.get_y())
    return g


def sgn(v):
    v = 0.0 if abs(v) < 0.05 else v
    return "0.0" if v == 0 else f"{v:+.1f}"


assert sgn(0.01) == "0.0" and sgn(-1) == "-1.0" and sgn(0.6) == "+0.6"


def car():
    """Side view of a small car, facing right, wheels resting on y = 0 (as in K10 / K15)."""
    body = VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners(
        [[-0.78, 0.14, 0], [0.78, 0.14, 0], [0.8, 0.38, 0], [0.42, 0.44, 0], [0.2, 0.7, 0], [-0.4, 0.7, 0],
         [-0.6, 0.44, 0], [-0.8, 0.4, 0], [-0.78, 0.14, 0]])
    win = VGroup(Line([-0.5, 0.44, 0], [0.36, 0.44, 0], color=DIM, stroke_width=3),
                 Line([-0.08, 0.44, 0], [-0.08, 0.68, 0], color=DIM, stroke_width=3))
    light = Line([0.7, 0.3, 0], [0.8, 0.3, 0], color=YEL, stroke_width=4)
    wheels = VGroup(*[Circle(radius=0.15, stroke_color=CHALK, stroke_width=4, fill_color=config.background_color,
                             fill_opacity=1).move_to([x, 0.15, 0]) for x in (-0.45, 0.45)])
    hubs = VGroup(*[Dot([x, 0.15, 0], radius=0.035, color=DIM) for x in (-0.45, 0.45)])
    return VGroup(body, win, light, wheels, hubs)


def chalk_ball(p, r=0.16):
    return Circle(radius=r, stroke_color=CHALK, stroke_width=4, fill_color=CHALK, fill_opacity=0.3).move_to(p).set_z_index(8)


# the particle's number line (K22_PosVelAcc, K22_Signs): s = 0 at x = -5, 1 unit = 1.6
X0, U, YL = -5.0, 1.6, 1.0


def xs(s):
    return X0 + U * s


def pos_line():
    line = Arrow([-5.9, YL, 0], [6.1, YL, 0], buff=0, color=DIM, stroke_width=3, tip_length=0.2)
    tick = Line([X0, YL - 0.1, 0], [X0, YL + 0.1, 0], color=DIM, stroke_width=3)
    zero = M("0", size=34, color=FAINT).next_to(tick, DOWN, buff=0.1)
    return VGroup(line, tick, zero)


# ================================================================ three kinds of problems

class K22_ThreeKinds(Shot):
    def body(self):
        T = tracker_time(self)
        fp = M("f'(x)", size=120, color=PINK).move_to([0, 0.2, 0])
        self.go(7848.0, Write(fp), run=0.9)
        self.go(7851.4, Circumscribe(fp, color=YEL, buff=0.15), run=0.9)
        self.go(7852.9, FadeOut(fp, shift=UP * 0.2), run=0.4)
        self.title("Three Kinds of Problems", 7853.39)

        cx = [-4.4, 0.0, 4.4]
        LY = -2.0
        labs = [H(s, 42, YEL).move_to([x, LY, 0]) for s, x in zip(("motion", "related rates", "approximation"), cx)]

        # 1. a particle sliding left and right on a line (keeps moving for the whole shot)
        ln = Line([cx[0] - 1.8, 0.3, 0], [cx[0] + 1.8, 0.3, 0], color=DIM, stroke_width=3)
        self.at(7856.33)
        t0 = T.get_value() + 0.65
        dot = always_redraw(lambda: Dot([cx[0] + 1.35 * np.sin(1.3 * (T.get_value() - t0)), 0.3, 0], radius=0.13,
                                        color=ORG).set_z_index(5))
        self.play(Create(ln), run_time=0.3)
        live_in(self, dot, run=0.35)
        self.go(7857.0, Write(labs[0]), run=0.5)

        # 2. a balloon: radius and size change together
        r = ValueTracker(0.45)
        knot = np.array([cx[1], -0.55, 0])

        def balloon():
            rr = r.get_value()
            c = knot + UP * (rr + 0.1)
            b = Circle(radius=rr, color=CHALK, stroke_width=4).move_to(c)
            k = Polygon(knot + UP * 0.1, knot + LEFT * 0.08, knot + RIGHT * 0.08, color=CHALK, stroke_width=3)
            s = VMobject(stroke_color=DIM, stroke_width=3).set_points_smoothly(
                [knot, knot + DOWN * 0.3 + RIGHT * 0.07, knot + DOWN * 0.6 + LEFT * 0.05, knot + DOWN * 0.85])
            rad = Line(c, c + RIGHT * rr, color=PINK, stroke_width=4)
            rl = M("r", size=40, color=PINK).move_to(c + RIGHT * rr / 2 + UP * 0.24)
            return VGroup(b, k, s, rad, rl)
        bl = always_redraw(balloon)
        self.at(7858.45)
        live_in(self, bl, run=0.4)
        self.play(r.animate.set_value(1.0), run_time=1.6)
        self.go(7860.69, Write(labs[1]), run=0.5)

        # 3. a curve, its tangent line, the point where they touch
        ax3 = Axes(x_range=[0, 4], y_range=[0, 2.4], x_length=3.4, y_length=2.3,
                   axis_config=dict(color=DIM, stroke_width=3, include_tip=False, include_ticks=False)).move_to([cx[2], 0.25, 0])
        c3 = curve(ax3, np.sqrt, [0.02, 4])
        tg3 = tangent(ax3, np.sqrt, 1.0, length=3.0)
        p3 = pt(ax3, 1, 1)
        self.go(7862.33, Create(ax3), draw(c3, 0.6, BLUE), run=0.6)
        self.go(7862.85, Create(tg3), FadeIn(p3), run=0.5)
        self.go(7863.91, Write(labs[2]), run=0.5)
        self.go(7866.73, *[Create(Underline(l, color=YEL, buff=0.06, stroke_width=3)) for l in labs], run=0.7)


# ================================================================ position, velocity, acceleration

class K22_PosVelAcc(Shot):
    def body(self):
        self.title("Motion on a Line", 7868.79)
        T = tracker_time(self)
        pl = pos_line()
        Wf, A = 0.8, 1.7
        ph = {"t0": 0.0}

        def s_now():
            return 2.5 + A * np.sin(Wf * (T.get_value() - ph["t0"]))

        def v_now():
            return A * Wf * np.cos(Wf * (T.get_value() - ph["t0"]))

        def a_now():
            return -A * Wf * Wf * np.sin(Wf * (T.get_value() - ph["t0"]))

        dot = always_redraw(lambda: Dot([xs(s_now()), YL, 0], radius=0.13, color=ORG).set_z_index(6))
        self.at(7870.73)
        ph["t0"] = T.get_value() + 0.9
        self.play(Create(pl), run_time=0.5)
        live_in(self, dot, run=0.4)

        # three everyday examples, drawn small under the line
        road = Line([-6.2, -2.2, 0], [-2.6, -2.2, 0], color=DIM, stroke_width=3)
        cr = car().scale(1.1)
        cr.move_to([-5.0, -2.2 + cr.height / 2, 0])
        gnd = Line([-0.7, -2.2, 0], [0.7, -2.2, 0], color=DIM, stroke_width=3)
        trk = DashedLine([0, -2.2, 0], [0, -0.3, 0], color=FAINT, stroke_width=2, dash_length=0.08)
        bl = chalk_ball([0, -2.04, 0])
        sl = Line([2.8, -2.2, 0], [6.0, -2.2, 0], color=DIM, stroke_width=3)
        sd = Dot([4.4, -2.2, 0], radius=0.12, color=ORG)
        self.go(7873.63, Create(road), FadeIn(cr), run=0.4)
        self.play(cr.animate.shift(RIGHT * 1.3), run_time=1.0)
        self.go(7875.37, Create(gnd), Create(trk), FadeIn(bl), run=0.3)
        self.play(bl.animate.shift(UP * 1.6), run_time=1.1, rate_func=there_and_back)
        self.go(7877.05, Create(sl), FadeIn(sd), run=0.3)
        self.play(sd.animate.shift(RIGHT * 1.1), run_time=0.6)
        self.play(sd.animate.shift(LEFT * 2.2), run_time=0.9)
        self.go(7879.39, FadeOut(VGroup(road, cr, gnd, trk, bl, sl, sd)), run=0.5)

        # position: the distance from 0 to the particle
        SY = YL - 0.62
        slab = M("s(t)", size=48, color=BLUE)

        def seg():
            x = xs(s_now())
            return VGroup(Line([X0, SY, 0], [x, SY, 0], color=BLUE, stroke_width=5),
                          Line([X0, SY - 0.1, 0], [X0, SY + 0.1, 0], color=BLUE, stroke_width=4),
                          Line([x, SY - 0.1, 0], [x, SY + 0.1, 0], color=BLUE, stroke_width=4))
        sg = always_redraw(seg)
        self.at(7879.95)
        live_in(self, sg, run=0.4)
        sl_live = always_redraw(lambda: slab.copy().move_to([(X0 + xs(s_now())) / 2, SY - 0.38, 0]))
        self.at(7883.21)
        live_in(self, sl_live, run=0.4)

        # the chain s -> v -> a
        CY, WY = -1.0, -1.65
        cs = M("s(t)", size=64, color=BLUE).move_to([-4.6, CY, 0])
        cv = M("v(t)", size=64, color=PINK).move_to([-0.5, CY, 0])
        ca = M("a(t)", size=64, color=PURP).move_to([3.6, CY, 0])
        for m in (cv, ca):
            m.set_y(cs.get_y())
        words = [H(s, 36, DIM).move_to([m.get_x(), WY, 0]) for s, m in (("position", cs), ("velocity", cv), ("acceleration", ca))]
        ars = [arr(cs.get_right() + RIGHT * 0.35, cv.get_left() + LEFT * 0.35, DIM, w=4, tip=0.2),
               arr(cv.get_right() + RIGHT * 0.35, ca.get_left() + LEFT * 0.35, DIM, w=4, tip=0.2)]
        ddt = [M(r"\tfrac{d}{dt}", size=40, color=DIM).next_to(a, DOWN, buff=0.12) for a in ars]
        R1 = col(M("v(t)", "=", "s'(t)", size=54), {0: PINK, 2: BLUE})
        R2 = col(M("a(t)", "=", "v'(t)", "=", "s''(t)", size=54), {0: PURP, 2: PINK, 4: BLUE})
        at_eq(R1, 1, -1.3, -2.6)
        at_eq(R2, 1, -1.3, -3.42)

        self.go(7884.67, TransformFromCopy(slab, cs), FadeIn(words[0], shift=UP * 0.1), run=0.6)
        self.go(7885.3, GrowArrow(ars[0]), FadeIn(ddt[0]), run=0.5)
        self.go(7886.19, Write(cv), FadeIn(words[1], shift=UP * 0.1), run=0.6)
        self.go(7887.37, Write(R1[0:2]), run=0.6)
        self.go(7888.53, Write(R1[2]), run=0.6)

        # the velocity arrow rides on the particle: its length is the speed, its direction the direction
        vl = M("v", size=40, color=PINK)
        al = M("a", size=40, color=PURP)
        va = always_redraw(lambda: vec([xs(s_now()), YL + 0.5, 0], RIGHT * 0.6 * U * v_now(), PINK, vl))
        self.at(7890.09)
        live_in(self, va, run=0.4)
        self.go(7894.69, GrowArrow(ars[1]), FadeIn(ddt[1]), run=0.5)
        self.go(7896.13, Write(ca), FadeIn(words[2], shift=UP * 0.1), run=0.6)
        aa = always_redraw(lambda: vec([xs(s_now()), YL + 1.0, 0], RIGHT * 0.8 * U * a_now(), PURP, al))
        live_in(self, aa, run=0.3)
        self.go(7897.39, Write(R2[0:2]), run=0.6)
        self.go(7898.35, Write(R2[2]), run=0.5)
        self.go(7900.29, Write(R2[3:5]), run=0.6)
        self.go(7901.27, Circumscribe(R2[4], color=YEL, buff=0.1), run=0.7)


# ================================================================ reading the signs, speed

class K22_Signs(Shot):
    def body(self):
        self.title("Reading the Signs", 7902.35)
        pl = pos_line()
        s, v = ValueTracker(0.6), ValueTracker(0.0)
        vl = M("v", size=40, color=PINK)
        dot = always_redraw(lambda: Dot([xs(s.get_value()), YL, 0], radius=0.13, color=ORG).set_z_index(6))
        va = always_redraw(lambda: vec([xs(s.get_value()), YL + 0.5, 0], RIGHT * 1.1 * v.get_value(), PINK, vl))
        rl = M("v", "=", size=52, color=PINK).move_to([3.6, 0.15, 0])
        rd = always_redraw(lambda: digits(sgn(v.get_value()), 52, PINK).next_to(rl, RIGHT, buff=0.2).set_y(rl[1].get_y()))
        self.play(FadeIn(pl), run_time=0.4)
        live_in(self, dot, va, rd, run=0.3)
        self.add(rl)

        RX, WX = -6.1, -3.6
        rows = []
        for i, (m, ws) in enumerate(((r"v>0", ["forward", "/", "right", "/", "up"]), (r"v<0", ["backward"]),
                                      (r"v=0", ["stopped", "(for an instant)"]))):
            y = -0.55 - 1.05 * i
            mm = M(m, size=60, color=PINK)
            mm.move_to([RX + mm.width / 2, y, 0])
            ww = VGroup(*[H(w, 40 if w.startswith("(") else 46, DIM if w in ("/",) or w.startswith("(") else CHALK)
                          for w in ws]).arrange(RIGHT, buff=0.25)
            ww.move_to([WX + ww.width / 2, y, 0])
            rows.append((mm, ww))

        # v > 0: moving right
        self.at(7904.4)
        self.play(v.animate.set_value(1.0), run_time=0.2)
        self.play(s.animate(rate_func=linear).set_value(1.9), Write(rows[0][0], run_time=0.6), run_time=1.3)
        self.play(s.animate(rate_func=linear).set_value(3.2), run_time=1.3)
        self.play(v.animate.set_value(0.0), run_time=0.2)
        mm, ww = rows[0]
        self.go(7907.35, FadeIn(ww[0], shift=UP * 0.1), run=0.4)
        self.go(7908.83, FadeIn(ww[1:3], shift=UP * 0.1), run=0.4)
        self.go(7909.67, FadeIn(ww[3:5], shift=UP * 0.1), run=0.4)

        # v < 0: moving left
        self.at(7913.1)
        self.play(v.animate.set_value(-1.0), run_time=0.2)
        self.play(s.animate(rate_func=linear).set_value(1.8), Write(rows[1][0], run_time=0.6), run_time=1.4)
        self.play(s.animate(rate_func=linear).set_value(1.0), FadeIn(rows[1][1], shift=UP * 0.1, run_time=0.4), run_time=0.8)
        # slowing to a stop: v -> 0, the arrow shrinks away
        self.play(s.animate(rate_func=lambda a: 2 * a - a * a).set_value(0.0), v.animate(rate_func=linear).set_value(0.0),
                  Succession(Wait(0.85), Write(rows[2][0], run_time=0.6)), run_time=2.0)
        self.go(7917.79, FadeIn(rows[2][1][0], shift=UP * 0.1), run=0.4)
        self.go(7918.6, FadeIn(rows[2][1][1], shift=UP * 0.1), run=0.4)
        # ... and only for an instant: it turns around
        self.play(s.animate(rate_func=lambda a: a * a).set_value(0.33), v.animate(rate_func=linear).set_value(0.6), run_time=1.1)
        unclock(dot, va, rd)
        self.wipe(7920.1)

        # speed = |v|
        F = col(M(r"\text{speed}", "=", "|v|", size=84), {0: YEL, 2: PINK}).move_to([0, 1.2, 0])
        self.go(7920.6, Write(F), run=0.8)
        self.go(7922.45, Circumscribe(F[2], color=YEL, buff=0.1), run=0.7)
        Y = -0.65
        a1 = arr([-1.0, Y, 0], [-4.2, Y, 0], PINK, w=7, tip=0.28)
        a2 = arr([1.0, Y, 0], [4.2, Y, 0], PINK, w=7, tip=0.28)
        l1 = M("v=-5", size=54, color=PINK).next_to(a1, UP, buff=0.2)
        l2 = M("v=5", size=54, color=PINK).next_to(a2, UP, buff=0.2)
        s1 = col(M(r"\text{speed}", "=", "5", size=54), {0: YEL, 2: ORG}).next_to(a1, DOWN, buff=0.4)
        s2 = col(M(r"\text{speed}", "=", "5", size=54), {0: YEL, 2: ORG}).next_to(a2, DOWN, buff=0.4)
        self.go(7924.41, GrowArrow(a1), Write(l1), run=0.7)
        self.go(7925.67, GrowArrow(a2), Write(l2), run=0.7)
        self.go(7927.73, Write(s1), Write(s2), run=0.7)
        self.go(7929.37, Circumscribe(VGroup(s1, s2), color=YEL, buff=0.15), run=0.9)


# ================================================================ the worked particle

EQX = -1.4


class K22_Example(Shot):
    def body(self):
        self.title("A Full Example", 7931.55)
        un = M(r"s\ \text{in meters},\ \ t\ \text{in seconds}", size=40, color=DIM).move_to([0, 2.05, 0])
        R1 = at_eq(col(M("s(t)", "=", "t^3", "-6t^2", "+9t", size=60), {0: BLUE}), 1, EQX, 1.15)
        R2 = at_eq(col(M("v(t)", "=", "3t^2", "-12t", "+9", size=60), {0: PINK}), 1, EQX, 0.05)
        R3 = at_eq(M("=", "3(t^2-4t+3)", size=60), 0, EQX, -1.0)
        R4 = at_eq(M("=", "3(t-1)(t-3)", size=60), 0, EQX, -2.05)
        R5 = at_eq(col(M("a(t)", "=", "6t", "-12", size=60), {0: PURP}), 1, EQX, -3.2)

        self.go(7936.41, FadeIn(un, shift=DOWN * 0.1), run=0.5)
        self.go(7938.71, Write(R1[0:2]), run=0.5)
        self.go(7940.37, Write(R1[2]), run=0.4)
        self.go(7941.13, Write(R1[3]), run=0.5)
        self.go(7942.47, Write(R1[4]), run=0.5)

        self.go(7945.05, Write(R2[0:2]), run=0.5)
        xr = max(R1.get_right()[0], R2.get_right()[0]) + 0.35
        d1 = CurvedArrow([xr, R1.get_y(), 0], [xr, R2.get_y(), 0], angle=-1.6, color=DIM, stroke_width=3, tip_length=0.16)
        d1l = M(r"\tfrac{d}{dt}", size=42, color=PINK).next_to(d1, RIGHT, buff=0.12)
        self.go(7946.19, Create(d1), FadeIn(d1l), run=0.5)
        self.go(7948.91, TransformFromCopy(R1[2], R2[2]), run=0.6)
        self.go(7949.91, TransformFromCopy(R1[3], R2[3]), run=0.6)
        self.go(7951.13, TransformFromCopy(R1[4], R2[4]), run=0.6)

        self.go(7954.17, Write(R3), run=1.4)
        self.go(7958.37, Write(R4), run=1.2)
        self.go(7960.89, Circumscribe(R4[1], color=PINK, buff=0.1), run=0.8)

        self.go(7961.99, Write(R5[0:2]), run=0.5)
        xl = min(R2.get_left()[0], R5.get_left()[0]) - 0.3
        d2 = CurvedArrow([xl, R2.get_y(), 0], [xl, R5.get_y(), 0], angle=0.9, color=DIM, stroke_width=3, tip_length=0.16)
        d2l = M(r"\tfrac{d}{dt}", size=42, color=PURP).next_to(d2, LEFT, buff=0.12)
        self.go(7963.41, Create(d2), FadeIn(d2l), run=0.5)
        self.go(7966.51, TransformFromCopy(R2[2], R5[2]), run=0.5)
        self.go(7967.19, TransformFromCopy(R2[3], R5[3]), FadeOut(d1), FadeOut(d1l), run=0.5)


# ================================================================ at rest, and which way it moves

TX0, TU, TY = -4.65, 2.115, 0.0


def tx(t):
    return TX0 + TU * t


class K22_Direction(Shot):
    def body(self):
        self.title("At Rest", 7968.65)
        F1 = col(M("v(t)", "=", "0", size=64), {0: PINK}).move_to([0, 1.45, 0])
        F2 = M("3(t-1)(t-3)", "=", "0", size=64).move_to([0, 0.3, 0])
        F3 = col(M("t=1", r"\quad\text{or}\quad", "t=3", size=64), {0: ORG, 2: ORG}).move_to([0, -0.95, 0])
        self.go(7970.83, Write(F1), run=0.6)
        self.go(7972.47, Write(F2[0]), run=1.6)
        self.go(7975.55, Write(F2[1:]), run=0.4)
        self.go(7977.43, Write(F3[0]), run=0.5)
        self.go(7978.35, FadeIn(F3[1]), run=0.3)
        self.go(7978.69, Write(F3[2]), run=0.5)

        self.title("Which Way?", 7980.23)
        vtop = col(M("v(t)", "=", "3(t-1)(t-3)", size=52), {0: PINK}).move_to([0, 1.85, 0])
        line = Arrow([tx(-0.35), TY, 0], [tx(4.75), TY, 0], buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        ticks = VGroup(*[Line([tx(k), TY - 0.1, 0], [tx(k), TY + 0.1, 0], color=DIM, stroke_width=3) for k in range(5)])
        nums = VGroup(*[M(str(k), size=34, color=FAINT).move_to([tx(k), TY - 0.36, 0]) for k in range(5)])
        tl = M("t", size=38, color=DIM).next_to(line, RIGHT, buff=0.12)
        SY = 0.78
        z1, z3 = [M("0", size=60, color=PINK).move_to([tx(k), SY, 0]) for k in (1, 3)]
        d1, d3 = [Dot([tx(k), TY, 0], radius=0.1, color=ORG).set_z_index(5) for k in (1, 3)]
        self.go(7980.8, FadeOut(F1), ReplacementTransform(F2, vtop), FadeIn(VGroup(line, ticks, nums, tl)), run=0.7)
        self.play(ReplacementTransform(F3[0], VGroup(d1, z1)), ReplacementTransform(F3[2], VGroup(d3, z3)),
                  FadeOut(F3[1]), run_time=0.8)
        self.go(7983.99, Circumscribe(vtop[0], color=PINK, buff=0.1), run=0.7)

        def hl(a, b):
            return Line([tx(a), TY, 0], [tx(b), TY, 0], color=YEL, stroke_width=12, stroke_opacity=0.55).set_z_index(1)
        cols = [tx(0.5), tx(2), tx(3.85)]
        tests = [M(f"t={k}", size=46, color=ORG).move_to([c, -1.2, 0]) for k, c in zip((0, 2, 4), cols)]
        calc = [M("v=9", size=46), M("3(1)(-1)", "=-3", size=46), M("3(3)(1)", "=9", size=46)]
        for c, x in zip(calc, cols):
            c.move_to([x, -2.0, 0])
        signs = [M(s, size=72, color=PINK).move_to([x, SY, 0]) for s, x in zip(("+", "-", "+"), cols)]

        def way(right, x):
            a = M(r"\rightarrow" if right else r"\leftarrow", size=56, color=YEL)
            w = H("right" if right else "left", 44, YEL)
            return VGroup(a, w).arrange(RIGHT, buff=0.18).move_to([x, -2.9, 0])
        ways = [way(True, cols[0]), way(False, cols[1]), way(True, cols[2])]
        td = Dot([tx(0), TY, 0], radius=0.1, color=ORG).set_z_index(6)

        h = hl(0, 1)
        self.go(7986.57, Create(h), run=0.5)
        self.go(7987.81, FadeIn(td, scale=0.5), Write(tests[0]), run=0.5)
        self.go(7989.65, Write(calc[0]), run=0.5)
        self.go(7990.99, FadeIn(signs[0], shift=DOWN * 0.1), run=0.4)
        self.go(7991.77, FadeIn(ways[0], shift=RIGHT * 0.15), run=0.5)

        self.go(7993.21, Transform(h, hl(1, 3)), run=0.6)
        self.go(7994.57, td.animate.move_to([tx(2), TY, 0]), Write(tests[1]), run=0.5)
        self.go(7996.19, Write(calc[1][0]), run=0.9)
        self.go(7998.61, Write(calc[1][1]), run=0.4)
        self.play(FadeIn(signs[1], shift=DOWN * 0.1), run_time=0.4)
        self.go(8000.35, FadeIn(ways[1], shift=LEFT * 0.15), run=0.5)

        self.go(8001.65, Transform(h, hl(3, 4.6)), run=0.6)
        self.go(8002.81, td.animate.move_to([tx(4), TY, 0]), Write(tests[2]), run=0.5)
        self.go(8004.81, Write(calc[2][0]), run=0.9)
        self.go(8007.13, Write(calc[2][1]), run=0.4)
        self.go(8008.01, FadeIn(signs[2], shift=DOWN * 0.1), run=0.4)
        self.go(8009.03, FadeIn(ways[2], shift=RIGHT * 0.15), run=0.5)


# ================================================================ the whole trip: s(t) traced with time running down

SX0, SU, SYL = -5.6, 1.15, 1.75     # position line: s = 0 at x = -5.6, 1 unit = 1.15


def sx(s):
    return SX0 + SU * s


def ty(t):
    return 0.95 - 1.0 * t


class K22_Story(Shot):
    def body(self):
        self.title("The Whole Trip", 8010.57)
        line = Arrow([sx(-0.5), SYL, 0], [sx(4.8), SYL, 0], buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        ticks = VGroup(*[Line([sx(k), SYL - 0.08, 0], [sx(k), SYL + 0.08, 0], color=DIM, stroke_width=3) for k in range(5)])
        nums = VGroup(*[M(str(k), size=32, color=FAINT).move_to([sx(k), SYL - 0.32, 0]) for k in range(5)])
        sl = M("s", size=38, color=DIM).next_to(line, RIGHT, buff=0.12)
        tax = Arrow([sx(0), ty(0) + 0.15, 0], [sx(0), ty(4.45), 0], buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        tnums = VGroup(*[M(str(k), size=30, color=FAINT).move_to([sx(0) - 0.32, ty(k), 0]) for k in range(1, 5)])
        tticks = VGroup(*[Line([sx(0) - 0.08, ty(k), 0], [sx(0) + 0.08, ty(k), 0], color=DIM, stroke_width=3) for k in range(1, 5)])
        tlab = M("t", size=38, color=DIM).next_to(tax, DOWN, buff=0.08)

        t = ValueTracker(0.0)
        vl = M("v", size=36, color=PINK)
        dot = always_redraw(lambda: Dot([sx(S_F(t.get_value())), SYL, 0], radius=0.12, color=ORG).set_z_index(6))
        va = always_redraw(lambda: vec([sx(S_F(t.get_value())), SYL + 0.42, 0], RIGHT * 0.12 * V_F(t.get_value()), PINK, vl, w=5))

        def trail():
            tt = t.get_value()
            if tt < 0.01:
                return VGroup()
            return ParametricFunction(lambda u: np.array([sx(S_F(u)), ty(u), 0]), t_range=[0, tt, 0.01], color=BLUE, stroke_width=5)
        tr = always_redraw(trail)
        conn = always_redraw(lambda: DashedLine([sx(S_F(t.get_value())), SYL - 0.12, 0], [sx(S_F(t.get_value())), ty(t.get_value()), 0],
                                                color=FAINT, stroke_width=2, dash_length=0.07))
        self.at(8011.1)
        self.play(Create(line), FadeIn(ticks), FadeIn(nums), FadeIn(sl), Create(tax), FadeIn(tticks), FadeIn(tnums), FadeIn(tlab), run_time=0.6)
        live_in(self, dot, va, run=0.3)
        self.add(tr, conn)

        def mark(k, side=RIGHT):
            d = Dot([sx(S_F(k)), ty(k), 0], radius=0.1, color=ORG).set_z_index(7)
            lab = M(f"t={k}", size=40, color=ORG).next_to(d, side, buff=0.15)
            return VGroup(d, lab)
        marks = {k: mark(k, LEFT if k == 0 else RIGHT) for k in (0, 1, 3, 4)}

        self.go(8012.2, t.animate(rate_func=linear).set_value(1), run=1.45)
        self.go(8014.27, FadeIn(marks[1], scale=0.8), run=0.5)
        self.go(8015.67, t.animate(rate_func=linear).set_value(3), run=2.2)
        self.go(8018.63, FadeIn(marks[3], scale=0.8), run=0.5)
        self.go(8020.3, t.animate(rate_func=linear).set_value(4), run=1.6)
        unclock(dot, va, tr, conn)
        self.go(8023.4, FadeOut(conn), run=0.4)

        EX = 1.35
        Q0 = at_eq(col(M("s(0)", "=", "0", size=48), {2: ORG}), 1, EX, 1.15)
        Q1 = at_eq(col(M("s(1)", "=", "1-6+9", "=", "4", size=48), {4: ORG}), 1, EX, 0.15)
        Q3 = at_eq(col(M("s(3)", "=", "27-54+27", "=", "0", size=48), {4: ORG}), 1, EX, -0.85)
        Q4 = at_eq(col(M("s(4)", "=", "64-96+36", "=", "4", size=48), {4: ORG}), 1, EX, -1.85)
        self.go(8025.41, Write(Q0), FadeIn(marks[0], scale=0.8), run=0.8)
        self.go(8027.23, Write(Q1[0:2]), run=0.4)
        self.go(8028.15, Write(Q1[2]), run=0.9)
        self.go(8030.03, Write(Q1[3:]), run=0.4)
        self.play(Circumscribe(marks[1], color=ORG, buff=0.08), run_time=0.6)
        self.go(8031.37, Write(Q3[0:2]), run=0.4)
        self.go(8032.29, Write(Q3[2]), run=2.0)
        self.go(8035.49, Write(Q3[3:]), run=0.4)
        self.play(Circumscribe(marks[3], color=ORG, buff=0.08), run_time=0.6)
        self.go(8036.87, Write(Q4[0:2]), run=0.4)
        self.go(8037.75, Write(Q4[2]), run=2.2)
        self.go(8041.11, Write(Q4[3:]), FadeIn(marks[4], scale=0.8), run=0.5)


# ================================================================ displacement vs total distance

DX0, DU, DYL = -4.4, 2.2, 1.2


def dx(s):
    return DX0 + DU * s


def dist_line():
    line = Arrow([dx(-0.6), DYL, 0], [dx(4.8), DYL, 0], buff=0, color=DIM, stroke_width=3, tip_length=0.2)
    ticks = VGroup(*[Line([dx(k), DYL - 0.1, 0], [dx(k), DYL + 0.1, 0], color=DIM, stroke_width=3) for k in range(5)])
    nums = VGroup(*[M(str(k), size=34, color=FAINT).move_to([dx(k), DYL - 0.38, 0]) for k in range(5)])
    sl = M("s", size=38, color=DIM).next_to(line, RIGHT, buff=0.1)
    return VGroup(line, ticks, nums, sl)


class K22_Displacement(Shot):
    def body(self):
        self.title("Displacement vs Distance", 8042.59)
        dl = dist_line()
        t = ValueTracker(0.0)
        dot = always_redraw(lambda: Dot([dx(S_F(t.get_value())), DYL, 0], radius=0.13, color=ORG).set_z_index(6))
        self.play(FadeIn(dl), run_time=0.4)
        live_in(self, dot, run=0.3)

        q = VGroup(H("total distance?", 48, YEL), M(r"0\le t\le 4", size=50)).arrange(RIGHT, buff=0.5).move_to([0, -0.45, 0])
        self.go(8045.81, Write(q[0]), run=0.7)
        self.go(8047.95, Write(q[1]), run=0.6)

        R = M("s(4)", "-", "s(0)", "=", "4", "-", "0", "=", "4", size=60).move_to([0, -1.65, 0])
        R[8].set_color(YEL)
        self.go(8051.41, Write(R[0]), run=0.5)
        self.go(8052.17, Write(R[1:3]), run=0.6)
        self.go(8054.13, Write(R[3:7]), run=0.7)
        dsp = arr([dx(0), DYL + 0.55, 0], [dx(4), DYL + 0.55, 0], YEL, w=6, tip=0.26)
        self.go(8055.71, Write(R[7:]), GrowArrow(dsp), run=0.6)
        dlab = H("displacement", 42, YEL).next_to(dsp, UP, buff=0.08)
        rl = H("displacement", 42, YEL).next_to(R, DOWN, buff=0.35)
        self.go(8057.07, FadeIn(dlab, shift=UP * 0.1), FadeIn(rl, shift=UP * 0.1), run=0.5)
        st = H("start", 36, DIM).move_to([dx(0), DYL - 0.8, 0])
        en = H("end", 36, DIM).move_to([dx(4), DYL - 0.8, 0])
        self.go(8058.79, FadeIn(st, shift=UP * 0.1), run=0.4)
        self.go(8060.11, FadeIn(en, shift=UP * 0.1), run=0.4)

        # what actually happens: it goes out, comes all the way back, goes out again
        def uturn(s, right):
            x = dx(s) + (0.25 if right else -0.25)
            return CurvedArrow([x, DYL + 0.2, 0], [x, DYL - 0.2, 0], angle=-PI * 0.95 if right else PI * 0.95,
                               color=ORG, stroke_width=4, tip_length=0.15)
        u1, u2 = uturn(4, True), uturn(0, False)
        self.go(8062.0, FadeOut(st), FadeOut(en), t.animate(rate_func=linear).set_value(1), run=1.0)
        self.play(Create(u1), run_time=0.3)
        self.play(t.animate(rate_func=linear).set_value(3), run_time=1.5)
        self.play(Create(u2), run_time=0.3)
        self.play(t.animate(rate_func=linear).set_value(4), run_time=0.6)
        unclock(dot)
        self.wipe(8066.0, keep=(dl,))


class K22_Distance(Shot):
    def body(self):
        self.title("Displacement vs Distance", animate=False)
        dl = dist_line()
        self.add(dl)
        t = ValueTracker(0.0)
        dot = always_redraw(lambda: Dot([dx(S_F(t.get_value())), DYL, 0], radius=0.13, color=ORG).set_z_index(6))
        self.go(8067.1)
        live_in(self, dot, run=0.4)

        LY = [0.15, -0.75, -1.65]
        legs = [(0, 1, 0, 4), (1, 3, 4, 0), (3, 4, 0, 4)]   # t from, t to, s from, s to

        def leg(i):
            t0, t1, s0, s1 = legs[i]

            def f():
                tt = min(max(t.get_value(), t0), t1)
                return vec([dx(s0), LY[i], 0], RIGHT * (dx(S_F(tt)) - dx(s0)), GRN, w=6, min_len=0.12)
            return f
        tlabs = [M(rf"{a}\to {b}", size=38, color=DIM).move_to([6.0, y, 0]) for (a, b, _, _), y in zip(legs, LY)]
        mlabs = [M(r"4\text{ m}", size=40, color=GRN).move_to([dx(1.5), y + 0.3, 0]) for y in LY]
        turns = [CurvedArrow([dx(4) + 0.15, LY[0], 0], [dx(4) + 0.15, LY[1], 0], angle=-PI * 0.9, color=DIM, stroke_width=3, tip_length=0.14),
                 CurvedArrow([dx(0) - 0.15, LY[1], 0], [dx(0) - 0.15, LY[2], 0], angle=PI * 0.9, color=DIM, stroke_width=3, tip_length=0.14)]
        livelegs = []
        for i, (tt0, wt, w4) in enumerate(((8070.99, 8072.47, 8074.99), (8076.71, 8078.03, 8080.95), (8082.29, 8083.57, 8086.13))):
            self.go(tt0, FadeIn(tlabs[i], shift=LEFT * 0.1), run=0.4)
            lg = always_redraw(leg(i))
            self.add(lg)
            livelegs.append(lg)
            if i:
                self.play(Create(turns[i - 1]), run_time=0.3)
            self.go(wt, t.animate(rate_func=linear).set_value(legs[i][1]), run=1.6 if i < 2 else 1.3)
            self.go(w4, Write(mlabs[i]), run=0.5)
        unclock(dot, *livelegs)

        TR = M("4", "+", "4", "+", "4", "=", r"12\text{ m}", size=60).move_to([0, -2.55, 0])
        col(TR, {0: GRN, 2: GRN, 4: GRN, 6: GRN})
        self.go(8087.49, *[TransformFromCopy(mlabs[i][0][0], TR[2 * i]) for i in range(3)], FadeIn(TR[1]), FadeIn(TR[3]), run=0.8)
        self.go(8088.67, Write(TR[5:]), run=0.5)
        bx = answer_box(TR[6])
        self.play(Create(bx), run_time=0.4)

        DS = col(M(r"\text{displacement}", "=", r"4\text{ m}", size=52), {0: YEL, 2: YEL}).move_to([-3.35, -3.45, 0])
        DT = col(M(r"\text{distance}", "=", r"12\text{ m}", size=52), {0: GRN, 2: GRN}).move_to([3.35, -3.45, 0])
        self.go(8090.23, Write(DS), run=0.8)
        self.go(8091.99, Write(DT), run=0.8)
        self.go(8094.97, *[t_.animate.set_color(YEL) for t_ in turns], run=0.5)
        self.play(*[Circumscribe(t_, color=YEL, buff=0.08) for t_ in turns], run_time=0.8)


# ================================================================ speeding up or slowing down

class K22_SameSign(Shot):
    def body(self):
        self.title("Speeding Up or Slowing Down?", 8096.77)
        wr = VGroup(col(M("a", "<", "0", size=56), {0: PURP}), H("slowing down?", 46, DIM)).arrange(RIGHT, buff=0.5).move_to([0, 1.35, 0])
        self.go(8104.71, Write(wr), run=0.6)
        sk = strike(wr)
        self.go(8106.31, Create(sk), run=0.4)
        self.play(FadeOut(wr), FadeOut(sk), run_time=0.3)

        vl, al = M("v", size=38, color=PINK), M("a", size=38, color=PURP)

        def lane(y):
            return Line([-6.3, y, 0], [6.3, y, 0], color=FAINT, stroke_width=2)

        Y1, Y2 = 0.05, -2.45
        u1, u2 = ValueTracker(0.0), ValueTracker(0.0)
        x1 = lambda: -5.3 + 2.0 * u1.get_value() + 5.0 * u1.get_value() ** 2
        x2 = lambda: -5.3 + 7.0 * (u2.get_value() - u2.get_value() ** 2 / 2)
        d1 = always_redraw(lambda: Dot([x1(), Y1, 0], radius=0.13, color=ORG).set_z_index(6))
        v1 = always_redraw(lambda: vec([x1(), Y1 + 0.45, 0], RIGHT * 0.11 * (2 + 10 * u1.get_value()), PINK, vl))
        a1 = always_redraw(lambda: vec([x1(), Y1 - 0.45, 0], RIGHT * 0.8, PURP, al))
        d2 = always_redraw(lambda: Dot([x2(), Y2, 0], radius=0.13, color=ORG).set_z_index(6))
        v2 = always_redraw(lambda: vec([x2(), Y2 + 0.45, 0], RIGHT * 0.18 * 7 * (1 - u2.get_value()), PINK, vl))
        a2 = always_redraw(lambda: vec([x2(), Y2 - 0.45, 0], LEFT * 0.8, PURP, al))

        L1a = H("speeding up", 46, YEL)
        L1b = TX(r"$v$ and $a$: same sign", 46)
        VGroup(L1a, L1b).arrange(RIGHT, buff=0.6).move_to([0, Y1 + 1.15, 0])
        L2a = H("slowing down", 46, YEL)
        L2b = TX(r"$v$ and $a$: opposite signs", 46)
        VGroup(L2a, L2b).arrange(RIGHT, buff=0.6).move_to([0, Y2 + 1.15, 0])
        l1, l2 = lane(Y1), lane(Y2)

        self.go(8107.0, Write(L1a), Create(l1), run=0.4)
        live_in(self, d1, v1, a1, run=0.25)
        self.go(8107.7, u1.animate(rate_func=linear).set_value(1), run=2.3)
        self.go(8110.03, Write(L1b), run=0.6)
        unclock(d1, v1, a1)
        self.go(8111.33, Circumscribe(VGroup(v1, a1), color=YEL, buff=0.1), run=0.8)

        self.go(8113.61, Write(L2a), Create(l2), run=0.5)
        live_in(self, d2, v2, a2, run=0.3)
        self.at(8114.45)
        self.play(u2.animate(rate_func=linear, run_time=1.9).set_value(1),
                  Succession(Wait(0.75), Write(L2b, run_time=0.7)))
        unclock(d2, v2, a2)


# ================================================================ the car

class K22_Car(Shot):
    def body(self):
        self.title("Think About a Car", 8116.81)
        RY = -1.3
        road = Line([-6.6, RY, 0], [6.6, RY, 0], color=DIM, stroke_width=3)
        cr = car().scale(1.4)
        CY = RY + cr.height / 2
        xc, sp, ac = ValueTracker(-5.0), ValueTracker(0.6), ValueTracker(0.0)
        cr.move_to([xc.get_value(), CY, 0])
        cr.add_updater(lambda m: m.move_to([xc.get_value(), CY, 0]))
        top = CY + cr.height / 2
        vl, al = M("v", size=40, color=PINK), M("a", size=40, color=PURP)
        va = always_redraw(lambda: vec([xc.get_value(), top + 0.35, 0], RIGHT * 0.45 * sp.get_value(), PINK, vl))
        aa = always_redraw(lambda: vec([xc.get_value(), RY - 0.55, 0], RIGHT * 0.9 * ac.get_value(), PURP, al))

        def drive(v1, T):
            v0, x0 = sp.get_value(), xc.get_value()
            d = (v0 + v1) / 2 * T
            rf = linear if abs(v1 - v0) < 1e-9 else (lambda a: (v0 * a + 0.5 * (v1 - v0) * a * a) / (v0 + 0.5 * (v1 - v0)))
            self.play(xc.animate(rate_func=rf).set_value(x0 + d), sp.animate(rate_func=linear).set_value(v1), run_time=T)

        def tag(s):
            return H(s, 48).move_to([0, 1.75, 0])

        def res(s):
            return H(s, 48, YEL).move_to([0, 0.85, 0])

        g1 = tag("forward + gas")
        self.go(8117.45, Create(road), FadeIn(cr), run=0.4)
        live_in(self, va, aa, run=0.2)
        self.go(8118.21, Write(g1), run=0.6)
        drive(0.6, 0.9)
        self.go(8119.79, ac.animate.set_value(1.0), run=0.3)
        drive(3.4, 2.8)
        r1 = res("speeds up")
        self.go(8123.39, Write(r1), run=0.5)

        # forward + brake
        g2 = tag("forward + brake")
        self.at(8124.51)
        self.play(FadeOut(r1), ReplacementTransform(g1, g2), FadeOut(cr), FadeOut(va), FadeOut(aa), run_time=0.35)
        xc.set_value(-5.4); sp.set_value(2.6); ac.set_value(0.0)
        live_in(self, cr, va, aa, run=0.25)
        drive(2.6, 1.2)
        self.go(8126.31, ac.animate.set_value(-1.0), run=0.3)
        drive(0.4, 3.0)
        r2 = res("slows down")
        self.go(8129.9, Write(r2), run=0.5)

        # reversing + brake (the car still faces right, but moves left)
        g3 = tag("reversing + brake")
        self.at(8131.03)
        self.play(FadeOut(r2), ReplacementTransform(g2, g3), FadeOut(cr), FadeOut(va), FadeOut(aa), run_time=0.35)
        xc.set_value(4.8); sp.set_value(-2.6); ac.set_value(0.0)
        live_in(self, cr, va, aa, run=0.25)
        drive(-2.6, 1.2)
        self.go(8133.0, ac.animate.set_value(1.0), run=0.3)
        drive(-0.4, 3.0)
        r3 = res("slows down too")
        self.go(8137.81, Write(r3), run=0.5)
        unclock(cr, va, aa)
        self.go(8139.69, Circumscribe(VGroup(va, aa), color=YEL, buff=0.12), run=0.9)


# ================================================================ the sign chart, piece by piece

PX0, PU, PY = -4.0, 2.4, 1.0


def px(t):
    return PX0 + PU * t


class K22_Pieces(Shot):
    def body(self):
        self.title("Our Particle", 8141.17)
        vtop = col(M("v(t)", "=", "3(t-1)(t-3)", size=48), {0: PINK}).move_to([-3.3, 1.95, 0])
        atop = col(M("a(t)", "=", "6t-12", size=48), {0: PURP}).move_to([3.6, 1.95, 0])
        line = Arrow([px(-0.1), PY, 0], [px(4.3), PY, 0], buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        ticks = VGroup(*[Line([px(k), PY - 0.1, 0], [px(k), PY + 0.1, 0], color=DIM, stroke_width=3) for k in range(5)])
        nums = VGroup(*[M(str(k), size=34, color=FAINT).move_to([px(k), PY + 0.36, 0]) for k in range(5)])
        VY, AY, RYY = 0.15, -0.85, -2.2
        heads = VGroup(M("t", size=44, color=DIM).move_to([-5.3, PY, 0]), M("v", size=54, color=PINK).move_to([-5.3, VY, 0]),
                       M("a", size=54, color=PURP).move_to([-5.3, AY, 0]))
        cx = [px(k + 0.5) for k in range(4)]
        vs = [M(s, size=66, color=PINK).move_to([x, VY, 0]) for s, x in zip("+--+", cx)]
        as_ = [M(s, size=66, color=PURP).move_to([x, AY, 0]) for s, x in zip("--++", cx)]
        vz = VGroup(*[M("0", size=44, color=PINK).move_to([px(k), VY, 0]) for k in (1, 3)])
        az = M("0", size=44, color=PURP).move_to([px(2), AY, 0])
        res = [H(s, 38, YEL).move_to([x, RYY, 0]) for s, x in zip(("slowing\ndown", "speeding\nup", "slowing\ndown", "speeding\nup"), cx)]

        self.at(8141.7)
        self.play(FadeIn(vtop), FadeIn(VGroup(line, ticks, nums, heads)), FadeIn(VGroup(*vs, vz)), run_time=0.6)
        self.go(8143.4, Write(atop), run=1.0)
        self.go(8146.55, FadeIn(az, shift=DOWN * 0.1), run=0.4)
        self.go(8148.01, FadeIn(as_[0], shift=DOWN * 0.1), FadeIn(as_[1], shift=DOWN * 0.1), run=0.5)
        self.go(8149.61, FadeIn(as_[2], shift=DOWN * 0.1), FadeIn(as_[3], shift=DOWN * 0.1), run=0.5)

        def frame(i):
            return RoundedRectangle(width=PU - 0.25, height=4.05, corner_radius=0.2, stroke_color=YEL, stroke_width=4).move_to([cx[i], -0.7, 0])
        hl = frame(0)
        self.go(8152.39, Create(hl), run=0.5)
        beats = [(8154.81, 8156.39, 8159.49), (8162.09, 8163.61, 8166.39), (8168.89, 8170.37, 8172.13), (None, None, 8175.71)]
        moves = [None, 8160.83, 8167.61, 8173.45]
        for i, (tv, ta, tr) in enumerate(beats):
            if moves[i]:
                self.go(moves[i], Transform(hl, frame(i)), run=0.6)
            if tv:
                self.go(tv, Circumscribe(vs[i], color=PINK, buff=0.08), run=0.5)
                self.go(ta, Circumscribe(as_[i], color=PURP, buff=0.08), run=0.5)
            else:
                self.go(8174.53, Circumscribe(VGroup(vs[i], as_[i]), color=YEL, buff=0.1), run=0.6)
            self.go(tr, Write(res[i]), run=0.6)


# ================================================================ the ball thrown up

YH0, KH = -3.0, 0.225          # h-graph origin height, 1 m = 0.225 (shared with the ball's track)
TRX = -6.3                      # the ball's vertical track
VSC = 0.037                     # 1 m/s = 0.037 of arrow


def ball_board():
    hax = axes((0, 4.6, 1), (0, 22, 5), x_length=4.6, y_length=22 * KH, x_label="t", y_label="h")
    d = np.array([-4.95, YH0, 0]) - hax.c2p(0, 0)
    hax.shift(d); hax.labels.shift(d)
    vax = axes((0, 4.6, 1), (-20, 20, 10), x_length=4.6, y_length=2.8, nums=False, x_label="t", y_label=None)
    d = np.array([1.0, 0.55, 0]) - vax.c2p(0, 0)
    vax.shift(d); vax.labels.shift(d)
    vnums = VGroup(*[M(str(k), size=30, color=FAINT).next_to(vax.c2p(0, k), LEFT, buff=0.12) for k in (20, -20)],
                   *[M(str(k), size=30, color=FAINT).next_to(vax.c2p(k, 0), DOWN, buff=0.12) for k in (1, 2, 3, 4)])
    vax.labels.add(vnums, M("v", size=38, color=DIM).next_to(vax.y_axis.get_end(), RIGHT, buff=0.15))
    hc = curve(hax, H_B, [0, 4, 0.05])
    vc = curve(vax, V_B, [0, 4, 0.05], color=PINK)
    ground = Line([-6.7, YH0 - 0.16, 0], [-5.5, YH0 - 0.16, 0], color=CHALK, stroke_width=4)
    track = DashedLine([TRX, YH0 - 0.16, 0], [TRX, YH0 + 21.5 * KH, 0], color=FAINT, stroke_width=2, dash_length=0.08)
    rows = [col(M("h(t)", "=", "20t-5t^2", size=50), {0: BLUE}), col(M("v(t)", "=", "20-10t", size=50), {0: PINK}),
            col(M("a(t)", "=", "-10", size=50), {0: PURP})]
    for r, y in zip(rows, (-1.5, -2.4, -3.3)):
        at_eq(r, 1, 2.6, y)
    return dict(hax=hax, vax=vax, hc=hc, vc=vc, ground=ground, track=track, rows=rows)


def ball_y(t):
    return YH0 + KH * H_B(t)


def ball_live(B, bt):
    """Ball, its v and a arrows, dots on h(t) and v(t), the dashed guide from ball to graph: all driven by bt."""
    hax, vax = B["hax"], B["vax"]
    vl = M("v", size=36, color=PINK)
    ball = always_redraw(lambda: chalk_ball([TRX, ball_y(bt.get_value()), 0]))
    def vbar():
        y, v = ball_y(bt.get_value()), V_B(bt.get_value())
        g = vec([TRX + 0.35, y, 0], UP * VSC * v, PINK, w=6)
        if len(g):
            g.add(vl.copy().move_to([TRX + 0.62, y + VSC * v / 2, 0]))
        return g
    va = always_redraw(vbar)
    # gravity: a constant arrow pointing down at the ball, drawn above-left of it so it never digs into the ground
    aa = always_redraw(lambda: arr([TRX - 0.32, ball_y(bt.get_value()) + 0.6, 0], [TRX - 0.32, ball_y(bt.get_value()), 0], PURP, w=5, tip=0.18))
    hd = always_redraw(lambda: pt(hax, bt.get_value(), H_B(bt.get_value())))
    vd = always_redraw(lambda: pt(vax, bt.get_value(), V_B(bt.get_value())))
    gd = always_redraw(lambda: DashedLine([TRX + 0.2, ball_y(bt.get_value()), 0], hax.c2p(bt.get_value(), H_B(bt.get_value())),
                                          color=FAINT, stroke_width=2, dash_length=0.07))
    return dict(ball=ball, va=va, aa=aa, hd=hd, vd=vd, gd=gd)


def peak_guides(hax):
    p = hax.c2p(2, 20)
    return VGroup(DashedLine(p, hax.c2p(0, 20), color=ORG, stroke_width=2, dash_length=0.07),
                  DashedLine(p, hax.c2p(2, 0), color=ORG, stroke_width=2, dash_length=0.07))


class K22_Ball(Shot):
    def body(self):
        self.title("A Ball Thrown Up", 8177.23)
        B = ball_board()
        bt = ValueTracker(0.0)
        L = ball_live(B, bt)
        self.go(8179.27, Create(B["ground"]), Create(B["track"]), run=0.5)
        self.at(8179.83)
        live_in(self, L["ball"], run=0.3)
        self.at(8180.39)
        live_in(self, L["va"], run=0.4)
        self.at(8184.09)
        live_in(self, L["aa"], run=0.4)
        g = M(r"g\approx 10\ \text{m/s}^2", size=52, color=PURP).move_to([3.4, 1.3, 0])
        v0 = M(r"v_0 = 20\ \text{m/s}", size=52, color=PINK).move_to([3.4, 0.15, 0])
        self.go(8184.99, Write(g), run=0.9)
        self.go(8188.27, Write(v0), run=0.8)

        hax, vax = B["hax"], B["vax"]
        Rh, Rv, Ra = B["rows"]
        self.go(8190.17, Create(hax), FadeIn(hax.labels), run=0.6)
        self.go(8190.97, Write(Rh[0:2]), run=0.5)
        # the first flight draws the height graph as it goes
        trace = always_redraw(lambda: curve(hax, H_B, [0, bt.get_value(), 0.05]) if bt.get_value() > 0.02 else VGroup())
        self.add(trace, L["hd"], L["gd"])
        self.at(8192.19)
        self.play(bt.animate(rate_func=linear, run_time=3.0).set_value(4), Write(Rh[2], run_time=1.2))
        unclock(trace, L["hd"], L["gd"], L["va"])
        self.remove(trace)
        self.add(B["hc"])
        self.play(FadeOut(L["hd"]), FadeOut(L["gd"]), FadeOut(L["va"]), FadeOut(g), FadeOut(v0), run_time=0.3)
        bt.set_value(0.0)

        self.go(8195.6, Create(vax), FadeIn(vax.labels), run=0.5)
        self.go(8196.19, Write(Rv[0:2]), run=0.4)
        self.play(Write(Rv[2]), draw(B["vc"], 0.8, PINK), run_time=0.8)
        self.go(8198.15, Write(Ra), run=0.9)
        self.go(8199.99, Circumscribe(Ra[2], color=PURP, buff=0.1), run=0.7)
        self.go(8201.87, Circumscribe(L["aa"], color=PURP, buff=0.08), run=0.7)


def ball_static(scene, B, extra=()):
    scene.title("A Ball Thrown Up", animate=False)
    scene.add(B["ground"], B["track"], B["hax"], B["hax"].labels, B["hc"], B["vax"], B["vax"].labels, B["vc"], *extra)


class K22_BallTop(Shot):
    def body(self):
        B = ball_board()
        bt = ValueTracker(0.0)
        L = ball_live(B, bt)
        Rh, Rv, Ra = B["rows"]
        ball_static(self, B, (Rh, Rv, Ra))
        self.add(L["ball"], L["aa"])
        self.at(8203.6)
        live_in(self, L["va"], L["hd"], L["vd"], L["gd"], run=0.35)
        # up to the top: the ball slows by itself (h is a parabola), the arrow shrinks to nothing
        self.go(8204.0, bt.animate(rate_func=linear).set_value(2), run=3.0)
        hax, vax = B["hax"], B["vax"]
        nt = note(r"v=0", vax.c2p(2, 0), UR, color=PINK, math=True, dist=0.7)
        self.go(8207.63, FadeIn(nt), run=0.5)

        A1 = M("20-10t", "=", "0", size=50)
        at_eq(A1, 1, 3.6, -1.5)
        A2 = M("t", "=", r"2\text{ s}", size=50)
        at_eq(A2, 1, 3.6, -2.4)
        self.go(8209.73, FadeOut(Rh), FadeOut(Ra), run=0.4)
        self.go(8211.75, FadeOut(Rv[0:2]), ReplacementTransform(Rv[2], A1[0]), Write(A1[1:]), run=0.8)
        self.go(8214.39, Write(A2), run=0.6)
        b2 = answer_box(A2)
        self.go(8215.71, Create(b2), run=0.4)

        pg = peak_guides(hax)
        self.go(8216.89, FadeOut(A1), FadeOut(A2), FadeOut(b2), FadeOut(nt), Create(pg), run=0.5)
        A3 = M("h(2)", "=", "40-20", "=", r"20\text{ m}", size=50)
        at_eq(A3, 1, 1.9, -1.5)
        self.go(8218.33, Write(A3[0:2]), run=0.4)
        self.go(8219.27, Write(A3[2]), run=0.6)
        self.go(8221.01, Write(A3[3:]), run=0.5)
        self.play(Create(SurroundingRectangle(A3[4], color=GRN, buff=0.1, stroke_width=4, corner_radius=0.1)), run_time=0.4)


class K22_BallLand(Shot):
    def body(self):
        B = ball_board()
        bt = ValueTracker(2.0)
        L = ball_live(B, bt)
        hax = B["hax"]
        pg = peak_guides(hax)
        A3 = M("h(2)", "=", "40-20", "=", r"20\text{ m}", size=50)
        at_eq(A3, 1, 1.9, -1.5)
        b3 = SurroundingRectangle(A3[4], color=GRN, buff=0.1, stroke_width=4, corner_radius=0.1)
        ball_static(self, B, (pg, A3, b3))
        self.add(L["ball"], L["aa"], L["va"], L["hd"], L["vd"], L["gd"])
        pk = pt(hax, 2, 20)

        # back down: the arrow flips and grows, the dot runs down the parabola
        self.at(8222.5)
        self.play(bt.animate(rate_func=linear, run_time=2.8).set_value(4),
                  Succession(Wait(1.5), FadeOut(VGroup(A3, b3), run_time=0.4)), FadeIn(pk, run_time=0.3))
        unclock(*L.values())
        self.play(FadeOut(L["gd"]), run_time=0.3)

        B1 = M("20t-5t^2", "=", "0", size=50)
        at_eq(B1, 1, 3.6, -1.5)
        B2 = M("5t", "(4-t)", "=", "0", size=50)
        at_eq(B2, 2, 3.6, -2.4)
        B3 = M("t=0", r"\quad\text{or}\quad", r"t=4\text{ s}", size=50).move_to([3.6, -3.3, 0])
        self.go(8225.67, Write(B1[0]), run=1.6)
        self.go(8227.95, Write(B1[1:]), run=0.4)
        self.go(8229.37, Circumscribe(B1[0], color=YEL, buff=0.1), run=0.7)
        self.go(8231.15, Write(B2[0]), run=0.4)
        self.go(8232.15, Write(B2[1]), run=0.6)
        self.go(8233.23, Write(B2[2:]), run=0.4)
        self.go(8234.93, Write(B3[0]), run=0.5)
        self.go(8235.65, FadeIn(pt(hax, 0, 0)), run=0.3)
        self.go(8237.81, FadeIn(B3[1]), run=0.3)
        self.go(8238.23, Write(B3[2]), run=0.5)
        self.go(8238.95, Create(answer_box(B3[2])), run=0.4)
