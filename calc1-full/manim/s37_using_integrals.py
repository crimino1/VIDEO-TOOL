"""Builder 37: start of Chapter 13 "Using Integrals" (3:51:33.77 - 3:59:01.68).
Net change theorem (integral of F' = F(b) - F(a), rate -> total change); the tank at 10 L/min for 5 min = 50 L,
rate x time = the rectangle under a flat rate graph, which bends when the rate keeps changing; r(t) = 50 - 2t on
[0, 10]: the area sweeps while the tank fills, [50t - t^2] = 400 L; the pattern rate -> integrate -> total
(people / year, dollars / day); motion: integral of v = s(b) - s(a) = displacement; a car 5 m forward, 2 m back
(displacement 3 m, distance 7 m); v = t^2 - 4t + 3 on [0, 4] with the car above the graph, GRN area above / RED
below, split at the sign changes and the RED piece flipped up; the worked example: F = t^3/3 - 2t^2 + 3t,
displacement F(4) - F(0) = 4/3, (t-1)(t-3) sign line, pieces 4/3, -4/3 -> 4/3, 4/3, distance 4, the car trip;
sin x on [0, 2pi]: signed 0 vs actual area 4; average value (list of numbers, sum of values x tiny widths,
divide by b - a), x^2 on [0, 3]: 9 / 3 = 3 and the area levelling like water into a 3 x 3 rectangle; sin x on
[0, pi]: 2/pi ~ 0.64 vs peak 1; mean value theorem for integrals: x^2 = 3 at c = sqrt 3 ~ 1.73; area between
two curves: region, crossing points, thin vertical strips, one strip sliding from the bottom curve to the top.
Colours: graphs BLUE, rates / velocity PINK, areas, totals and answers GRN, below-axis RED, points ORG, YEL highlight.
Whisper fixes: "f" of the antiderivative = F, "liters" = L, "2T" = 2t.

END SEAM (K37_Between at 3:59:01.68), for builder 38:
  title "Area Between Two Curves". Axes x 0..5, y 0..4.5 (no numbers), x_length 8, y_length 4.4, centre (0, -0.75).
  top curve BLUE y = 3.5 - 0.35(x - 2.5)^2, bottom curve PURP y = 1 + 0.3(x - 2.5)^2 (no formulas shown), labels
  "top" / "bottom"; they cross (ORG dots) at x = 2.5 -/+ 1.961; region between them GRN (dimmed); one YEL strip
  (width 0.14) at x ~ 3.9 with a YEL arrow from the bottom curve to the top curve. "top minus bottom" not shown yet."""
from common import *


# ---------------------------------------------------------------- the maths of this section, checked once

def RATE(t):
    return 50 - 2 * t


def VOL(t):
    return 50 * t - t ** 2


def V(t):
    return t ** 2 - 4 * t + 3


def F(t):
    return t ** 3 / 3 - 2 * t ** 2 + 3 * t


def TOP(x):
    return 3.5 - 0.35 * (x - 2.5) ** 2


def BOT(x):
    return 1 + 0.3 * (x - 2.5) ** 2


X1, X2 = 2.5 - np.sqrt(2.5 / 0.65), 2.5 + np.sqrt(2.5 / 0.65)

assert 10 * 5 == 50 and VOL(10) == 400 and 500 - 100 == 400
assert abs(F(4) - 4 / 3) < 1e-9 and abs(64 / 3 - 32 + 12 - 4 / 3) < 1e-9 and abs(64 / 3 - 20 - 4 / 3) < 1e-9
assert abs(F(1) - 4 / 3) < 1e-9 and abs(F(3)) < 1e-9 and abs(1 / 3 - 2 + 3 - 4 / 3) < 1e-9 and 9 - 18 + 9 == 0
assert V(1) == 0 and V(3) == 0 and V(0.5) > 0 and V(2) < 0 and V(3.5) > 0 and abs(3 * 4 / 3 - 4) < 1e-9
assert 27 / 3 == 9 and 9 / 3 == 3 and round(2 / PI, 2) == 0.64 and round(np.sqrt(3), 2) == 1.73
assert abs(TOP(X1) - BOT(X1)) < 1e-9 and abs(TOP(X2) - BOT(X2)) < 1e-9


# ---------------------------------------------------------------- local helpers (copied from s22 / s35)

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


def live_in(scene, *mobs, run=0.4):
    """Fade in always_redraw objects: fade a frozen copy, then swap."""
    st = [m.copy() for m in mobs]
    unclock(*st)
    scene.play(*[FadeIn(s) for s in st], run_time=run)
    scene.remove(*st)
    scene.add(*mobs)


_DG = {}


def digits(s, size=48, color=CHALK):
    """A number from cached glyphs (no new LaTeX per frame)."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.035, aligned_edge=DOWN)
    return g


def car():
    """Side view of a small car, facing right, wheels resting on y = 0 (as in K22)."""
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


_CAR = car()


def car_at(x, y, s=0.75):
    return _CAR.copy().scale(s, about_point=ORIGIN).shift([x, y, 0]).set_z_index(6)


def road(x0, x1, y):
    return VGroup(Line([x0, y, 0], [x1, y, 0], color=DIM, stroke_width=4),
                  DashedLine([x0, y - 0.1, 0], [x1, y - 0.1, 0], color=FAINT, stroke_width=2, dash_length=0.12))


def arr(a, b, color, w=5, tip=0.2):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, color=color, stroke_width=w, tip_length=tip,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


def tank(cx, by, w=2.4, h=2.8):
    """Open-top rectangular tank with an inlet pipe whose spout ends above the left part of the opening."""
    L, R, T = cx - w / 2, cx + w / 2, by + h
    walls = VMobject(stroke_color=CHALK, stroke_width=5).set_points_as_corners([[L, T, 0], [L, by, 0], [R, by, 0], [R, T, 0]])
    lips = VGroup(Line([L - 0.14, T, 0], [L, T, 0], color=CHALK, stroke_width=5),
                  Line([R, T, 0], [R + 0.14, T, 0], color=CHALK, stroke_width=5))
    sx = cx - w * 0.18
    pipe = VGroup(
        VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners([[L - 0.8, T + 0.62, 0], [sx + 0.12, T + 0.62, 0], [sx + 0.12, T + 0.25, 0]]),
        VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners([[L - 0.8, T + 0.38, 0], [sx - 0.12, T + 0.38, 0], [sx - 0.12, T + 0.25, 0]]))
    g = VGroup(walls, lips, pipe)
    g.spout = np.array([sx, T + 0.25, 0])
    return g


def water(cx, by, w, h, frac):
    frac = max(frac, 0.004)
    body = Rectangle(width=w - 0.1, height=frac * h, stroke_width=0, fill_color=BLUE, fill_opacity=0.3)
    body.move_to([cx, by + 0.03 + frac * h / 2, 0])
    surf = Line([cx - w / 2 + 0.06, by + 0.03 + frac * h, 0], [cx + w / 2 - 0.06, by + 0.03 + frac * h, 0], color=BLUE, stroke_width=3)
    return VGroup(body, surf)


def stream(tk, cx, by, h, frac):
    top = tk.spout
    return Line(top, [top[0], by + 0.03 + max(frac, 0.004) * h, 0], color=BLUE, stroke_width=5)


def reading(val_str, unit, size=50, color=CHALK):
    """'400 L' style readout built from cached glyphs."""
    g = VGroup(digits(val_str, size, color), M(unit, size=size, color=color))
    return g.arrange(RIGHT, buff=0.12, aligned_edge=DOWN)


def bval(part, tex, color=ORG, size=40, direction=DOWN, math=True):
    b = Brace(part, direction, buff=0.08, color=color)
    lab = M(tex, size=size, color=color) if math else H(tex, size, color)
    return VGroup(b, lab.next_to(b, direction, buff=0.06))


def flipped(mob, ax, color=GRN):
    """Mirror image across the x-axis (the 'make it positive' move)."""
    return mob.copy().stretch(-1, 1, about_point=ax.c2p(0, 0)).set_fill(color).set_stroke(color)


def pi_ticks(ax, xs, size=36):
    return VGroup(*[M(pi_label(x), size=size, color=FAINT).next_to(ax.c2p(x, 0), DOWN, buff=0.14) for x in xs])


# ================================================================ chapter opening

class K37_Plan(Shot):
    def body(self):
        self.title("Using Integrals", animate=False)
        last = H("the last teaching chapter", 60, YEL).move_to([0, 0.2, 0])
        self.go("3:51:37.40", Write(last), run=0.9)
        self.go("3:51:39.30", FadeOut(last, shift=UP * 0.2), run=0.5)

        # four little drawings, one per question
        PA, PB, PC, PD = np.array([-3.4, 1.05, 0]), np.array([3.4, 1.05, 0]), np.array([-3.4, -1.85, 0]), np.array([3.4, -1.85, 0])
        tk = tank(PA[0], PA[1] - 0.7, 1.5, 1.2)
        fr = ValueTracker(0.15)
        wt = always_redraw(lambda: water(PA[0], PA[1] - 0.7, 1.5, 1.2, fr.get_value()))
        la = H("total change", 40, GRN).move_to(PA + DOWN * 1.15)
        self.go("3:51:41.90", Create(tk), FadeIn(wt), run=0.6)
        self.go("3:51:42.59", fr.animate.set_value(0.8), FadeIn(la, shift=UP * 0.1), run=1.2)

        rd = road(PB[0] - 1.6, PB[0] + 1.6, PB[1] - 0.55)
        cx = ValueTracker(PB[0] - 1.0)
        cr = always_redraw(lambda: car_at(cx.get_value(), PB[1] - 0.55, 0.6))
        lb = H("distance travelled", 40, ORG).move_to(PB + DOWN * 1.15)
        self.go("3:51:44.00", Create(rd), run=0.4)
        live_in(self, cr, run=0.3)
        self.go("3:51:44.85", cx.animate.set_value(PB[0] + 1.0), FadeIn(lb, shift=UP * 0.1), run=1.2)

        hump = ParametricFunction(lambda u: PC + np.array([u, 1.1 * np.sin(PI * (u + 1.3) / 2.6) - 0.55, 0]),
                                  t_range=[-1.3, 1.3], color=BLUE, stroke_width=5)
        base = Line(PC + [-1.45, -0.55, 0], PC + [1.45, -0.55, 0], color=DIM, stroke_width=3)
        lvl = DashedLine(PC + [-1.3, 0.15, 0], PC + [1.3, 0.15, 0], color=YEL, stroke_width=4, dash_length=0.1)
        lc = H("average value", 40, YEL).move_to(PC + DOWN * 1.15)
        self.go("3:51:46.53", Create(base), draw(hump, 0.6), run=0.6)
        self.go("3:51:47.25", Create(lvl), FadeIn(lc, shift=UP * 0.1), run=0.7)

        c1 = ParametricFunction(lambda u: PD + np.array([u, 0.5 - 0.42 * u * u + 0.1, 0]), t_range=[-1.4, 1.4], color=BLUE, stroke_width=5)
        c2 = ParametricFunction(lambda u: PD + np.array([u, -0.55 + 0.3 * u * u + 0.1, 0]), t_range=[-1.4, 1.4], color=PURP, stroke_width=5)
        k = np.sqrt(1.05 / 0.72)
        lens = Polygon(*[PD + np.array([u, 0.6 - 0.42 * u * u, 0]) for u in np.linspace(-k, k, 30)],
                       *[PD + np.array([u, -0.45 + 0.3 * u * u, 0]) for u in np.linspace(k, -k, 30)],
                       stroke_width=0, fill_color=GRN, fill_opacity=0.4)
        ld = H("area between curves", 40, GRN).move_to(PD + DOWN * 1.15)
        self.go("3:51:48.60", draw(c1, 0.5), draw(c2, 0.5), run=0.5)
        self.go("3:51:49.40", FadeIn(lens), FadeIn(ld, shift=UP * 0.1), run=0.7)


class K37_NetChange(Shot):
    def body(self):
        self.title("The Net Change Theorem", "3:51:52.15")
        ftc = pill("the Fundamental Theorem", color=DIM, size=40).move_to([0, 1.3, 0])
        self.go("3:51:57.61", FadeIn(ftc, shift=DOWN * 0.1), run=0.6)
        self.go("3:51:59.81", Circumscribe(ftc, color=YEL, buff=0.08), run=1.0)

        pr = pill("rate of change", color=PINK, size=42).move_to([-3.3, 1.3, 0])
        pt_ = pill("total change", color=GRN, size=42).move_to([3.3, 1.3, 0])
        ar = arr([-1.2, 1.3, 0], [1.3, 1.3, 0], CHALK)
        ig = M(r"\int", size=56).next_to(ar, UP, buff=0.05)
        self.go("3:52:01.35", FadeOut(ftc), run=0.3)
        self.go("3:52:01.59", FadeIn(pr, shift=RIGHT * 0.1), GrowArrow(ar), FadeIn(ig), run=0.6)
        self.go("3:52:03.45", FadeIn(pt_, shift=RIGHT * 0.1), run=0.6)

        f = M(r"\int_a^b", "F'(x)", r"\,dx", "=", "F(b)", "-", "F(a)", size=84).move_to([0, -0.6, 0])
        col(f, {0: GRN, 1: PINK, 4: GRN, 5: GRN, 6: GRN})
        self.go("3:52:06.39", Write(f[0]), run=0.8)
        self.go("3:52:07.93", Write(f[1]), run=0.5)
        self.play(Write(f[2]), run_time=0.3)
        self.go("3:52:08.89", Write(f[3]), run=0.3)
        self.go("3:52:09.51", Write(f[4]), run=0.5)
        self.go("3:52:10.29", Write(f[5]), run=0.3)
        self.go("3:52:10.73", Write(f[6]), run=0.5)

        b1 = Brace(f[1], DOWN, buff=0.12, color=PINK)
        b2 = Brace(f[4:7], DOWN, buff=0.12, color=GRN)
        py = f.get_bottom()[1] - 0.2 - pr.height * 0.85 / 2
        self.go("3:52:12.61", FadeOut(ar), FadeOut(ig), GrowFromCenter(b1),
                pr.animate.scale(0.85).move_to([b1.get_x(), py, 0]), run=1.0)
        self.go("3:52:14.65", GrowFromCenter(b2), pt_.animate.scale(0.85).move_to([b2.get_x(), py, 0]), run=1.0)
        self.go("3:52:15.77", Circumscribe(f[4:7], color=GRN, buff=0.12), run=1.0)


class K37_TankEasy(Shot):
    def body(self):
        self.title("Rate and Time", "3:52:18.97")
        CX, BY, W, HH = -4.4, -3.1, 2.4, 2.6
        tk = tank(CX, BY, W, HH)
        mins = ValueTracker(0.0)
        fr = lambda: 0.08 + 0.72 * mins.get_value() / 5
        wt = always_redraw(lambda: water(CX, BY, W, HH, fr()))
        lit = always_redraw(lambda: reading(f"{10 * mins.get_value():.0f}", r"\text{L}", 50).move_to([CX, BY + 0.55, 0]))
        clk = always_redraw(lambda: VGroup(M("t=", size=46, color=DIM), reading(f"{mins.get_value():.1f}", r"\text{min}", 46, DIM))
                            .arrange(RIGHT, buff=0.1, aligned_edge=DOWN).move_to([CX, 1.25, 0]))
        self.go("3:52:20.71", draw(tk[0], 0.7), FadeIn(tk[1:]), run=0.7)
        live_in(self, wt, lit, clk, run=0.3)

        eq = M(r"10\,\tfrac{\text{L}}{\text{min}}", r"\times", r"5\,\text{min}", "=", r"50\,\text{L}", size=60).move_to([2.2, 1.35, 0])
        col(eq, {0: PINK, 2: ORG, 4: GRN})
        self.go("3:52:22.23", Write(eq[0]), run=0.7)
        sm = always_redraw(lambda: stream(tk, CX, BY, HH, fr()))
        self.add(sm)
        self.go("3:52:23.31", Write(eq[1:3]), mins.animate(rate_func=linear).set_value(5), run=0.9)
        self.remove(sm)
        self.go("3:52:24.21", Write(eq[3:]), run=0.5)
        unclock(wt, lit, clk)

        b1 = bval(eq[0], "rate", PINK, 40, math=False)
        b2 = bval(eq[2], "time", ORG, 40, math=False)
        self.go("3:52:26.17", GrowFromCenter(b1[0]), FadeIn(b1[1]), run=0.4)
        self.go("3:52:26.60", GrowFromCenter(b2[0]), FadeIn(b2[1]), run=0.4)

        # rate x time = a rectangle under a flat rate graph; the line bends when the rate changes
        ax = axes((0, 6, 1), (0, 15, 5), x_length=5.0, y_length=2.3, center=(2.4, -2.05, 0), x_label="t", y_label=None, num_size=28)
        rl = M(r"\text{rate}", size=36, color=PINK).next_to(ax.y_axis.get_end(), RIGHT, buff=0.12)
        flat = lambda t: 10.0
        wav = lambda t: 10 + 3 * np.sin(1.4 * t)
        ln = curve(ax, flat, [0, 5], color=PINK)
        sh = area(ax, flat, 0, 5)
        fifty = M("50", size=50, color=GRN).move_to(ax.c2p(2.5, 5))
        self.go("3:52:28.19", Create(ax), FadeIn(ax.labels), FadeIn(rl), Create(ln), run=0.7)
        self.go("3:52:29.31", FadeIn(sh), TransformFromCopy(eq[4], fifty), run=0.8)
        ln2 = curve(ax, wav, [0, 5], color=PINK)
        sh2 = area(ax, wav, 0, 5)
        q = M("?", size=56, color=GRN).move_to(ax.c2p(2.5, 5))
        self.go("3:52:30.75", Transform(ln, ln2), Transform(sh, sh2), ReplacementTransform(fifty, q), run=1.2)


class K37_Tank(Shot):
    def body(self):
        self.title("A Changing Rate", "3:52:33.00")
        ax = axes((0, 11, 2), (0, 60, 10), x_length=5.8, y_length=4.0, center=(-3.4, -0.85, 0), x_label="t", y_label="r", num_size=28)
        self.go("3:52:33.60", Create(ax), FadeIn(ax.labels), run=0.7)
        r0 = M("r(t)", "=", "50-2t", r"\ \tfrac{\text{L}}{\text{min}}", size=60).move_to([3.0, 1.65, 0])
        col(r0, {0: PINK, 2: PINK})
        self.go("3:52:35.21", Write(r0[0:2]), run=0.4)
        self.go("3:52:35.57", Write(r0[2]), run=0.7)
        self.go("3:52:36.89", Write(r0[3]), run=0.5)
        ln = curve(ax, RATE, [0, 10], color=PINK)
        self.go("3:52:37.45", draw(ln, 0.8), run=0.8)
        mn = H("minutes", 34, DIM).next_to(ax.x_axis.get_end(), DOWN, buff=0.45).shift(LEFT * 0.4)
        self.go("3:52:38.55", FadeIn(mn, shift=UP * 0.1), run=0.5)

        tx = ValueTracker(0.0)
        dot = always_redraw(lambda: pt(ax, tx.get_value(), RATE(tx.get_value())))
        self.go("3:52:40.83", FadeIn(dot, scale=0.6), Circumscribe(ax.labels[-3], color=ORG, buff=0.08), run=0.7)
        self.go("3:52:42.51", tx.animate.set_value(10), run=1.1)
        unclock(dot)
        thirty = M("30", size=40, color=ORG).next_to(ax.c2p(10, 30), UP, buff=0.15)
        self.play(FadeIn(thirty), run_time=0.3)

        # how much in the first 10 minutes? the area sweeps while the tank fills
        CX, BY, W, HH = 3.3, -3.25, 2.3, 2.2
        tk = tank(CX, BY, W, HH)
        tt = ValueTracker(0.0)
        fr = lambda: 0.06 + 0.8 * VOL(tt.get_value()) / 400
        wt = always_redraw(lambda: water(CX, BY, W, HH, fr()))
        q = M(r"?\ \text{L}", size=50).move_to([CX, BY + 0.6, 0])
        ten = DashedLine(ax.c2p(10, 0), ax.c2p(10, 30), color=ORG, stroke_width=3, dash_length=0.08)
        self.go("3:52:44.31", draw(tk[0], 0.6), FadeIn(tk[1:]), FadeIn(wt), run=0.6)
        self.go("3:52:44.95", FadeIn(q), run=0.4)
        self.go("3:52:46.05", Create(ten), run=0.5)

        sw = always_redraw(lambda: area(ax, RATE, 0, tt.get_value()) if tt.get_value() > 0.02 else VGroup())
        lit = always_redraw(lambda: reading(f"{VOL(tt.get_value()):.0f}", r"\text{L}", 50).move_to([CX, BY + 0.6, 0]))
        sm = always_redraw(lambda: stream(tk, CX, BY, HH, fr()))
        r1 = M(r"\int_0^{10}", "(50-2t)", r"\,dt", size=56)
        r1[0].set_color(GRN); r1[1].set_color(PINK)
        r1.move_to([3.0, 0.45, 0])
        self.go("3:52:47.27", Write(r1), FadeOut(q), run=0.6)
        self.add(sw, lit, sm)
        self.play(tt.animate(rate_func=linear).set_value(10), run_time=2.0)
        self.remove(sm)
        unclock(sw, wt, lit)

        EX = r1[0].get_left()[0] + 0.25
        r2 = at_eq(M("=", r"\Big[50t-t^2\Big]_0^{10}", size=56), 0, EX, -0.65)
        r3 = at_eq(M("=", "(500-100)", "-", "(0)", size=56), 0, EX, -1.75)
        r4 = at_eq(M("=", r"400\,\text{L}", size=60), 0, EX, -2.85)
        r4[1].set_color(GRN)
        self.go("3:52:49.91", FadeOut(VGroup(tk, wt, lit)), Write(r2[0]), run=0.5)
        self.go("3:52:50.87", Write(r2[1]), run=2.4)
        self.go("3:52:55.67", Write(r3[0:2]), run=1.2)
        self.go("3:52:58.19", Indicate(r3[1], color=ORG, scale_factor=1.06), run=0.6)
        self.go("3:52:59.17", Write(r3[2:]), run=0.6)
        self.go("3:53:00.95", Write(r4), run=0.6)
        bx = answer_box(r4[1])
        lab = M(r"400\,\text{L}", size=48, color=GRN).move_to(ax.c2p(5, 18))
        self.go("3:53:01.75", Create(bx), TransformFromCopy(r4[1], lab), run=0.8)


class K37_Pattern(Shot):
    def body(self):
        self.title("The Pattern", "3:53:03.33")
        XL, XR = -3.9, 3.9

        def link(y, top=None, bottom=None):
            a = arr([-1.6, y, 0], [1.6, y, 0], CHALK)
            g = VGroup(a, M(r"\int", size=42).next_to(a, UP, buff=0.05).shift(LEFT * 0.9))
            if top:
                g.add(H(top, 34, DIM).next_to(a, UP, buff=0.12).shift(RIGHT * 0.35))
            return g

        p1 = pill("a rate", color=PINK, size=46).move_to([XL, 1.35, 0])
        p2 = pill("a total amount", color=GRN, size=46).move_to([XR, 1.35, 0])
        l1 = link(1.35, "integrate")
        self.go("3:53:05.75", FadeIn(p1, shift=RIGHT * 0.1), run=0.5)
        self.go("3:53:07.23", FadeIn(p2, shift=LEFT * 0.1), run=0.5)
        self.go("3:53:08.37", GrowArrow(l1[0]), FadeIn(l1[1:]), run=0.6)

        a1 = H("people / year", 46, PINK).move_to([XL, -0.4, 0])
        l2 = link(-0.4, "10 years")
        c1 = H("people added", 46, GRN).move_to([XR, -0.4, 0])
        self.go("3:53:10.47", FadeIn(a1, shift=RIGHT * 0.1), run=0.5)
        self.go("3:53:13.55", GrowArrow(l2[0]), FadeIn(l2[1:]), run=0.6)
        self.go("3:53:16.49", FadeIn(c1, shift=LEFT * 0.1), run=0.5)

        a2 = H("dollars / day", 46, PINK).move_to([XL, -2.2, 0])
        l3 = link(-2.2, "a month")
        c2 = H("total revenue", 46, GRN).move_to([XR, -2.2, 0])
        self.go("3:53:18.37", FadeIn(a2, shift=RIGHT * 0.1), run=0.5)
        self.go("3:53:21.31", GrowArrow(l3[0]), FadeIn(l3[1:]), run=0.6)
        self.go("3:53:23.49", FadeIn(c2, shift=LEFT * 0.1), run=0.5)
        self.go("3:53:25.25", *[Circumscribe(l[1], color=YEL, buff=0.08) for l in (l1, l2, l3)], run=1.0)


# ================================================================ motion: displacement vs distance

class K37_DispDist(Shot):
    def body(self):
        self.title("Motion", "3:53:29.07")
        r1 = M("v(t)", "=", "s'(t)", size=72).move_to([0, 1.2, 0])
        col(r1, {0: PINK, 2: PINK})
        self.go("3:53:30.63", Write(r1[0]), run=0.5)
        self.go("3:53:31.45", Write(r1[1:]), run=0.6)
        nb = H("rate of change of position", 36, DIM).next_to(r1, DOWN, buff=0.2)
        self.go("3:53:32.03", FadeIn(nb, shift=UP * 0.1), run=0.5)
        r2 = M(r"\int_a^b", "v(t)", r"\,dt", "=", "s(b)-s(a)", size=72).move_to([0, -1.0, 0])
        col(r2, {0: GRN, 1: PINK, 4: YEL})
        self.go("3:53:33.95", Write(r2[0:3]), run=0.8)
        self.go("3:53:35.93", Write(r2[3:]), run=0.8)
        bd = bval(r2[4], "displacement", YEL, 44, math=False)
        self.go("3:53:38.03", GrowFromCenter(bd[0]), FadeIn(bd[1]), run=0.6)

        self.wipe("3:53:39.61")
        self.title("Displacement vs Distance")
        RY = 0.55
        X = lambda s: -3.6 + 1.4 * s
        rd = road(-5.4, 5.4, RY)
        ticks = VGroup(*[Line([X(k), RY - 0.25, 0], [X(k), RY - 0.15, 0], color=FAINT, stroke_width=3) for k in range(7)])
        nums = VGroup(*[M(f"{k}", size=30, color=FAINT).move_to([X(k), RY - 0.45, 0]) for k in range(7)])
        mlab = M(r"\text{m}", size=34, color=FAINT).move_to([X(6.6), RY - 0.45, 0])
        s = ValueTracker(0.0)
        cr = always_redraw(lambda: car_at(X(s.get_value()), RY))
        self.go("3:53:40.55", Create(rd), FadeIn(ticks), FadeIn(nums), FadeIn(mlab), run=0.5)
        live_in(self, cr, run=0.2)
        self.go("3:53:41.31", s.animate.set_value(5), run=1.3)
        self.play(s.animate.set_value(3), run_time=1.0)
        unclock(cr)

        da = arr([X(0), -0.55, 0], [X(3), -0.55, 0], YEL, w=6)
        dl = VGroup(H("displacement", 42, YEL), M(r"3\,\text{m}", size=50, color=YEL)).arrange(RIGHT, buff=0.25).next_to(da, RIGHT, buff=0.35)
        self.go("3:53:44.63", GrowArrow(da), run=0.7)
        self.go("3:53:45.99", FadeIn(dl, shift=LEFT * 0.1), run=0.5)

        g1 = arr([X(0), -1.5, 0], [X(5), -1.5, 0], GRN, w=6)
        g2 = arr([X(5), -1.95, 0], [X(3), -1.95, 0], GRN, w=6)
        n1 = M(r"5\,\text{m}", size=40, color=GRN).next_to(g1, UP, buff=0.06)
        n2 = M(r"2\,\text{m}", size=40, color=GRN).next_to(g2, DOWN, buff=0.06)
        gl = VGroup(H("distance", 42, GRN), M(r"5+2=7\,\text{m}", size=50, color=GRN)).arrange(RIGHT, buff=0.25).move_to([0.6, -3.2, 0])
        self.go("3:53:48.65", GrowArrow(g1), FadeIn(n1), run=0.7)
        self.play(GrowArrow(g2), FadeIn(n2), run_time=0.6)
        self.go("3:53:50.37", FadeIn(gl, shift=UP * 0.1), run=0.6)


# the worked particle: v = t^2 - 4t + 3 on [0, 4], position F(t) on a road above the graph

def v_axes():
    return axes((0, 4.5, 1), (-2, 3.5, 1), x_length=8.0, y_length=3.4, center=(0, -1.6, 0), x_label="t", y_label="v", num_size=28)


def signed_area(ax, upto):
    g = VGroup()
    for a, b, c in ((0, 1, GRN), (1, 3, RED), (3, 4, GRN)):
        e = min(b, upto)
        if e - a > 0.02:
            g.add(area(ax, V, a, e, color=c, opacity=0.4))
    return g


class K37_Speed(Shot):
    def body(self):
        self.title("Displacement vs Distance", animate=False)
        ax = v_axes()
        vc = curve(ax, V, [0, 4], color=PINK)
        RY = 1.35
        X = lambda s: -2.0 + 3.0 * s
        rd = road(-4.2, 4.2, RY)
        st = VGroup(Line([X(0), RY - 0.25, 0], [X(0), RY - 0.12, 0], color=FAINT, stroke_width=3),
                    M("0", size=30, color=FAINT).move_to([X(0), RY - 0.42, 0]))
        t = ValueTracker(0.0)
        cr = always_redraw(lambda: car_at(X(F(t.get_value())), RY))
        cur = always_redraw(lambda: VGroup(
            DashedLine(ax.c2p(t.get_value(), 0), ax.c2p(t.get_value(), V(t.get_value())), color=FAINT, stroke_width=2, dash_length=0.07),
            pt(ax, t.get_value(), V(t.get_value()), PINK)))
        sh = always_redraw(lambda: signed_area(ax, t.get_value()))
        self.at("3:53:52.05")
        self.play(Create(ax), FadeIn(ax.labels), Create(rd), FadeIn(st), draw(vc, 0.8), run_time=0.8)
        live_in(self, cr, cur, run=0.3)
        self.add(sh)
        self.go("3:53:53.25", t.animate(rate_func=linear).set_value(1), run=0.7)
        self.play(t.animate(rate_func=linear).set_value(3), run_time=1.8)
        self.play(t.animate(rate_func=linear).set_value(4), run_time=0.7)
        unclock(cr, cur, sh)
        self.play(FadeOut(cur), run_time=0.3)

        plus1 = M("+", size=60, color=GRN).move_to(ax.c2p(0.33, 0.85))
        minus = M("-", size=72, color=RED).move_to(ax.c2p(2.55, -0.45))
        plus3 = M("+", size=60, color=GRN).move_to(ax.c2p(3.72, 0.85))
        self.go("3:53:56.99", FadeIn(minus, scale=0.6), run=0.4)
        self.go("3:53:57.67", FadeIn(plus1, scale=0.6), FadeIn(plus3, scale=0.6), run=0.4)

        fd = M(r"\text{distance}", "=", r"\int_0^4", r"|v(t)|", r"\,dt", size=60).move_to([0, 1.55, 0])
        col(fd, {0: GRN, 2: GRN, 3: PINK})
        self.go("3:54:00.21", FadeOut(VGroup(cr, rd, st)), Write(fd[0:3]), run=0.8)
        self.go("3:54:02.27", Write(fd[3:]), run=0.6)
        sp = H("speed", 36, PINK).next_to(fd[3], DOWN, buff=0.12)
        self.go("3:54:02.95", FadeIn(sp, shift=UP * 0.1), run=0.4)

        z1, z3 = pt(ax, 1, 0), pt(ax, 3, 0)
        self.go("3:54:06.63", FadeIn(z1, scale=0.5), FadeIn(z3, scale=0.5), run=0.5)
        cuts = VGroup(*[DashedLine(ax.c2p(x, -1.9), ax.c2p(x, 3.2), color=ORG, stroke_width=3, dash_length=0.1) for x in (1, 3)])
        self.go("3:54:09.03", Create(cuts), run=0.6)
        red = sh[1]
        up = flipped(red, ax)
        upc = DashedVMobject(curve(ax, lambda x: -V(x), [1, 3], color=PINK), num_dashes=18)
        plus2 = M("+", size=60, color=GRN).move_to(ax.c2p(2, 0.45))
        self.go("3:54:10.85", Transform(red, up), Create(upc), ReplacementTransform(minus, plus2), run=1.0)


class K37_Disp(Shot):
    def body(self):
        self.title("Worked Example", "3:54:13.25")
        r0 = M("v(t)", "=", "t^2-4t+3", r",\qquad 0\le t\le 4", size=60).move_to([0, 1.9, 0])
        col(r0, {0: PINK, 2: PINK})
        self.go("3:54:15.15", Write(r0[0:2]), run=0.5)
        self.go("3:54:16.81", Write(r0[2]), run=1.5)
        self.go("3:54:19.67", Write(r0[3]), run=1.0)

        rd = VGroup(H("displacement", 46, YEL), M("=", r"\int_0^4 v(t)\,dt", "=", "F(4)-F(0)", "=", r"\tfrac{4}{3}", size=56))
        rd.arrange(RIGHT, buff=0.25).move_to([0, 0.8, 0])
        rd[1][1].set_color(GRN); rd[1][5].set_color(GRN)
        self.go("3:54:23.03", FadeIn(rd[0], shift=RIGHT * 0.1), run=0.5)
        self.go("3:54:23.91", Write(rd[1][0:2]), run=0.8)

        EX = -2.4
        r1 = at_eq(M("F(t)", "=", r"\frac{t^3}{3}", "-2t^2", "+3t", size=56), 1, EX, -0.75)
        self.go("3:54:25.75", Write(r1[0:2]), run=0.4)
        self.go("3:54:26.97", Write(r1[2]), run=0.8)
        self.go("3:54:28.47", Write(r1[3]), run=0.8)
        self.go("3:54:30.01", Write(r1[4]), run=0.5)
        self.go("3:54:31.85", Circumscribe(r1[0], color=YEL, buff=0.1), run=0.7)

        r2 = at_eq(M("F(4)", "=", r"\frac{64}{3}", "-32", "+12", "=", r"\frac{64}{3}-20", "=", r"\frac{4}{3}", size=56), 1, EX, -2.0)
        self.go("3:54:32.55", Write(r2[0:2]), run=0.5)
        self.go("3:54:34.13", Write(r2[2]), run=0.5)
        self.go("3:54:35.29", Write(r2[3]), run=0.5)
        self.go("3:54:36.31", Write(r2[4]), run=0.5)
        self.go("3:54:37.95", Write(r2[5:7]), run=1.0)
        r2[8].set_color(ORG)
        self.go("3:54:40.87", Write(r2[7:]), run=0.5)
        r3 = at_eq(M("F(0)", "=", "0", size=56), 1, EX, -3.2)
        r3[2].set_color(ORG)
        self.go("3:54:42.43", Write(r3), run=0.7)
        self.go("3:54:44.35", Write(rd[1][2:4]), run=0.6)
        self.go("3:54:45.49", Write(rd[1][4:]), run=0.4)
        self.play(Create(answer_box(rd[1][5])), run_time=0.4)


class K37_SignChange(Shot):
    def body(self):
        self.title("Total Distance", "3:54:47.39")
        r = M("v(t)", "=", "t^2-4t+3", "=", "(t-1)(t-3)", size=60).move_to([0, 1.6, 0])
        col(r, {0: PINK, 2: PINK, 4: PINK})
        self.go("3:54:48.89", Write(r[0:3]), run=0.7)
        self.go("3:54:51.07", Write(r[3]), run=0.3)
        self.go("3:54:52.01", Write(r[4]), run=1.4)

        nl = number_line((0, 4.4, 1), length=11, center=(0, -0.1, 0))
        self.go("3:54:54.79", Create(nl), FadeIn(nl.labels), run=0.5)
        zs = VGroup()
        for k, tt in ((1, "3:54:55.71"), (3, "3:54:56.41")):
            d = Dot(nl.n2p(k), radius=0.1, color=ORG).set_z_index(5)
            lab = M("0", size=40, color=ORG).next_to(d, UP, buff=0.15)
            zs.add(VGroup(d, lab))
            self.go(tt, FadeIn(zs[-1], scale=0.7), run=0.4)
        segs = [(0.5, GRN, "+", RIGHT, "3:54:57.33"), (2, RED, "-", LEFT, "3:54:58.49"), (3.6, GRN, "+", RIGHT, "3:55:00.33")]
        signs = VGroup()
        for x, c, s, d, tt in segs:
            sg = M(s, size=64, color=c).move_to(nl.n2p(x) + UP * 0.55)
            a = arr(nl.n2p(x) + DOWN * 0.85 - d * 0.45, nl.n2p(x) + DOWN * 0.85 + d * 0.45, c, w=5, tip=0.18)
            signs.add(VGroup(sg, a))
            self.go(tt, FadeIn(sg, scale=0.6), GrowArrow(a), run=0.5)

        cuts = VGroup(*[DashedLine(nl.n2p(k) + DOWN * 1.4, nl.n2p(k) + UP * 0.9, color=ORG, stroke_width=3, dash_length=0.1) for k in (1, 3)])
        self.go("3:55:02.61", Create(cuts), run=0.5)
        ints = VGroup(*[M(rf"\int_{{{a}}}^{{{b}}} v\,dt", size=52, color=GRN).move_to(nl.n2p(x) + DOWN * 1.95)
                        for a, b, x in ((0, 1, 0.5), (1, 3, 2), (3, 4, 3.5))])
        self.go("3:55:03.15", LaggedStart(*[Write(i) for i in ints], lag_ratio=0.35), run=1.0)
        self.play(FadeOut(VGroup(r, nl, nl.labels, zs, signs, cuts)),
                  *[ints[i].animate.move_to([x, 1.6, 0]) for i, x in enumerate((-4, 0, 4))], run_time=0.5)


def piece_board():
    ints = VGroup(*[M(rf"\int_{{{a}}}^{{{b}}} v\,dt", size=52, color=GRN).move_to([x, 1.6, 0])
                    for a, b, x in ((0, 1, -4), (1, 3, 0), (3, 4, 4))])
    pl = VGroup(*[M("+", size=52).move_to([x, 1.6, 0]) for x in (-2, 2)])
    return ints, pl


class K37_Pieces(Shot):
    def body(self):
        self.title("Total Distance", animate=False)
        ints, pl = piece_board()
        self.add(ints)
        self.play(FadeIn(pl), run_time=0.3)
        s1 = M("F(1)", "=", r"\tfrac{1}{3}-2+3", "=", r"\tfrac{4}{3}", size=56).move_to([0, -2.4, 0])
        s1[4].set_color(ORG)
        self.go("3:55:05.49", Write(s1[0:2]), run=0.4)
        self.go("3:55:06.15", Write(s1[2]), run=1.6)
        self.go("3:55:09.17", Write(s1[3:]), run=0.5)

        a1 = M(r"\tfrac{4}{3}-0", size=52).move_to([-4, 0.45, 0])
        b1 = M("=", r"\tfrac{4}{3}", size=56, color=GRN).move_to([-4, -0.65, 0])
        self.go("3:55:10.65", Indicate(ints[0], color=YEL, scale_factor=1.08), run=0.7)
        self.go("3:55:12.41", Write(a1), run=0.9)
        self.go("3:55:14.07", Write(b1), run=0.5)

        s3 = M("F(3)", "=", "9-18+9", "=", "0", size=56).move_to([0, -2.4, 0])
        s3[4].set_color(ORG)
        self.go("3:55:15.39", FadeOut(s1, shift=UP * 0.1), Write(s3[0:2]), run=0.5)
        self.go("3:55:16.57", Write(s3[2]), run=1.5)
        self.go("3:55:19.15", Write(s3[3:]), run=0.5)

        a2 = M(r"0-\tfrac{4}{3}", size=52).move_to([0, 0.45, 0])
        b2 = M("=", r"-\tfrac{4}{3}", size=56, color=RED).move_to([0, -0.65, 0])
        self.go("3:55:20.37", Indicate(ints[1], color=YEL, scale_factor=1.08), run=0.7)
        self.go("3:55:22.47", Write(a2), run=0.9)
        self.go("3:55:24.05", Write(b2), run=0.6)
        bk = VGroup(arr([0.55, -1.45, 0], [-0.55, -1.45, 0], RED, w=5, tip=0.18), H("backward", 38, RED)).arrange(RIGHT, buff=0.2).move_to([0, -1.45, 0])
        self.go("3:55:25.75", GrowArrow(bk[0]), FadeIn(bk[1]), run=0.6)
        k = strike(b2[1][0], RED, 5)
        self.go("3:55:28.33", Create(k), run=0.4)
        b2p = M("=", r"\tfrac{4}{3}", size=56, color=GRN).move_to(b2)
        self.go("3:55:28.85", FadeOut(k), ReplacementTransform(b2, b2p), FadeOut(bk), run=0.8)


class K37_TotalDist(Shot):
    def body(self):
        self.title("Total Distance", animate=False)
        ints, pl = piece_board()
        a1 = M(r"\tfrac{4}{3}-0", size=52).move_to([-4, 0.45, 0])
        b1 = M("=", r"\tfrac{4}{3}", size=56, color=GRN).move_to([-4, -0.65, 0])
        a2 = M(r"0-\tfrac{4}{3}", size=52).move_to([0, 0.45, 0])
        b2 = M("=", r"\tfrac{4}{3}", size=56, color=GRN).move_to([0, -0.65, 0])
        s3 = M("F(3)", "=", "9-18+9", "=", "0", size=56).move_to([0, -2.4, 0])
        s3[4].set_color(ORG)
        self.add(ints, pl, a1, b1, a2, b2, s3)

        a3 = M("F(4)-F(3)", size=52).move_to([4, 0.45, 0])
        a3n = M(r"\tfrac{4}{3}-0", size=52).move_to([4, 0.45, 0])
        b3 = M("=", r"\tfrac{4}{3}", size=56, color=GRN).move_to([4, -0.65, 0])
        s4 = M(r"F(4)=\tfrac{4}{3}", r",\qquad", "F(3)=0", size=56).move_to([0, -2.4, 0])
        self.go("3:55:31.31", Indicate(ints[2], color=YEL, scale_factor=1.08), run=0.7)
        self.go("3:55:32.61", Write(a3), run=1.2)
        self.go("3:55:33.93", ReplacementTransform(s3, s4), run=0.8)
        self.go("3:55:34.97", ReplacementTransform(a3, a3n), run=0.8)
        self.go("3:55:36.29", Write(b3), run=0.5)

        tot = M(r"\text{distance}", "=", r"\tfrac{4}{3}", "+", r"\tfrac{4}{3}", "+", r"\tfrac{4}{3}", "=", "4", size=60).move_to([0, -2.4, 0])
        col(tot, {0: GRN, 8: GRN})
        self.go("3:55:37.99", FadeOut(s4, shift=DOWN * 0.1), Write(tot[0:2]), run=0.5)
        self.go("3:55:39.49", TransformFromCopy(b1[1], tot[2]), run=0.6)
        self.go("3:55:40.33", Write(tot[3]), TransformFromCopy(b2[1], tot[4]), run=0.6)
        self.go("3:55:41.41", Write(tot[5]), TransformFromCopy(b3[1], tot[6]), run=0.6)
        self.go("3:55:42.47", Write(tot[7:]), run=0.4)
        self.play(Create(answer_box(tot[8])), run_time=0.4)

        # the trip itself: out to 4/3, back to 0, out to 4/3
        self.wipe("3:55:43.63", run=0.35)
        RY = 0.55
        X = lambda s: -3.0 + 4.0 * s
        rd = road(-5.0, 5.0, RY)
        tk = VGroup(*[VGroup(Line([X(s), RY - 0.25, 0], [X(s), RY - 0.12, 0], color=FAINT, stroke_width=3),
                             M(l, size=42, color=FAINT).move_to([X(s), RY - 0.55, 0])) for s, l in ((0, "0"), (4 / 3, r"\tfrac{4}{3}"))])
        t = ValueTracker(0.0)
        cr = always_redraw(lambda: car_at(X(F(t.get_value())), RY))
        self.play(Create(rd), FadeIn(tk), run_time=0.4)
        live_in(self, cr, run=0.2)
        self.play(t.animate(rate_func=linear).set_value(4), run_time=1.4)
        unclock(cr)
        da = arr([X(0), -0.75, 0], [X(4 / 3), -0.75, 0], YEL, w=6)
        dl = VGroup(H("ended up", 40, YEL), M(r"\tfrac{4}{3}", size=56, color=YEL)).arrange(RIGHT, buff=0.2).next_to(da, RIGHT, buff=0.3)
        self.go("3:55:46.01", GrowArrow(da), FadeIn(dl), run=0.6)
        legs = VGroup(arr([X(0), -1.65, 0], [X(4 / 3), -1.65, 0], GRN, w=5),
                      arr([X(4 / 3), -2.05, 0], [X(0), -2.05, 0], GRN, w=5),
                      arr([X(0), -2.45, 0], [X(4 / 3), -2.45, 0], GRN, w=5))
        gl = VGroup(H("travelled", 40, GRN), M("4", size=60, color=GRN)).arrange(RIGHT, buff=0.2).next_to(legs, RIGHT, buff=0.3)
        self.go("3:55:47.53", LaggedStart(*[GrowArrow(l) for l in legs], lag_ratio=0.6), run=1.2)
        self.go("3:55:48.77", FadeIn(gl), run=0.5)


# ================================================================ signed vs actual area

def sine_board():
    ax = trig_axes(x_max=2 * PI + 0.5, y=1.4, width=10, height=3.3, center=(0, -1.05, 0), pi_step=PI)
    cv = curve(ax, np.sin, [0, 2 * PI])
    g1 = area(ax, np.sin, 0, PI, color=GRN, opacity=0.4)
    g2 = area(ax, np.sin, PI, 2 * PI, color=RED, opacity=0.4)
    return ax, cv, g1, g2


class K37_SineCancel(Shot):
    def body(self):
        self.title("Signed vs Actual Area", "3:55:50.57")
        ax, cv, g1, g2 = sine_board()
        self.go("3:55:51.53", Create(ax), FadeIn(ax.labels), run=0.6)
        self.go("3:55:52.15", draw(cv, 1.0), run=1.0)
        self.go("3:55:53.21", FadeIn(g1), run=0.6)
        self.go("3:55:55.79", FadeIn(g2), run=0.7)

        r = M(r"\int_0^{2\pi}", r"\sin x", r"\,dx", "=", "0", size=64).move_to([0, 1.65, 0])
        col(r, {0: GRN, 1: BLUE})
        self.go("3:55:58.83", Write(r[0:3]), run=1.2)
        self.go("3:56:01.41", Write(r[3:]), run=0.5)
        p = M("+", size=64, color=GRN).move_to(ax.c2p(PI / 2, 0.45))
        m = M("-", size=72, color=RED).move_to(ax.c2p(3 * PI / 2, -0.45))
        self.go("3:56:02.83", FadeIn(p, scale=0.6), run=0.4)
        self.go("3:56:03.61", FadeIn(m, scale=0.6), run=0.4)
        self.go("3:56:04.37", Circumscribe(r[4], color=YEL, buff=0.12), run=0.9)
        self.go("3:56:06.65", g1.animate.set_fill(opacity=0.6), g2.animate.set_fill(opacity=0.6), run=0.8)
        cut = DashedLine(ax.c2p(PI, -1.4), ax.c2p(PI, 1.4), color=ORG, stroke_width=3, dash_length=0.1)
        self.go("3:56:10.67", Create(cut), run=0.6)


class K37_SineSplit(Shot):
    def body(self):
        self.title("Signed vs Actual Area", animate=False)
        ax, cv, g1, g2 = sine_board()
        g1.set_fill(opacity=0.6); g2.set_fill(opacity=0.6)
        r = M(r"\int_0^{2\pi}", r"\sin x", r"\,dx", "=", "0", size=64).move_to([0, 1.65, 0])
        col(r, {0: GRN, 1: BLUE})
        cut = DashedLine(ax.c2p(PI, -1.4), ax.c2p(PI, 1.4), color=ORG, stroke_width=3, dash_length=0.1)
        p = M("+", size=64, color=GRN).move_to(ax.c2p(PI / 2, 0.45))
        m = M("-", size=72, color=RED).move_to(ax.c2p(3 * PI / 2, -0.45))
        self.add(ax, ax.labels, g1, g2, cv, r, cut, p, m)

        i1 = M(r"\int_0^{\pi}\sin x\,dx", "=", "2", size=56).move_to([-2.6, 1.65, 0])
        i2 = M(r"\int_{\pi}^{2\pi}\sin x\,dx", "=", "-2", size=56).move_to([2.6, 1.65, 0])
        i1[2].set_color(GRN); i2[2].set_color(RED)
        v1 = M("2", size=64, color=GRN).move_to(p)
        v2 = M("-2", size=64, color=RED).move_to(m)
        self.go("3:56:11.91", FadeOut(r), Write(i1[0]), run=0.8)
        self.go("3:56:13.45", Write(i1[1:]), ReplacementTransform(p, v1), run=0.5)
        self.go("3:56:14.77", Write(i2[0]), run=0.8)
        self.go("3:56:16.51", Write(i2[1:]), ReplacementTransform(m, v2), run=0.5)
        v2p = M("2", size=64, color=GRN).move_to(ax.c2p(3 * PI / 2, 0.45))
        self.go("3:56:17.97", Transform(g2, flipped(g2, ax)), ReplacementTransform(v2, v2p), run=1.2)
        tot = M(r"\text{area}", "=", "2", "+", "2", "=", "4", size=64).move_to([0, 1.65, 0])
        col(tot, {6: GRN})
        self.go("3:56:20.40", FadeOut(VGroup(i1, i2)), Write(tot[0:2]), run=0.4)
        self.play(TransformFromCopy(v1, tot[2]), Write(tot[3]), TransformFromCopy(v2p, tot[4]), run_time=0.6)
        self.go("3:56:21.75", Write(tot[5:]), run=0.4)
        self.play(Create(answer_box(tot[6])), run_time=0.4)

        # which one does the question want?
        self.wipe("3:56:23.61", run=0.4)
        L, R = -3.4, 3.4
        hs = H("signed area", 52, BLUE).move_to([L, 1.4, 0])
        ha = H("actual area", 52, GRN).move_to([R, 1.4, 0])
        ms = M("2+(-2)=0", size=56, color=BLUE).next_to(hs, DOWN, buff=0.3)
        ma = M("2+2=4", size=56, color=GRN).next_to(ha, DOWN, buff=0.3)
        self.go("3:56:26.05", FadeIn(hs, shift=DOWN * 0.1), FadeIn(ms, shift=DOWN * 0.1), run=0.6)
        self.go("3:56:27.71", FadeIn(ha, shift=DOWN * 0.1), FadeIn(ma, shift=DOWN * 0.1), run=0.6)
        qa = H('"find the area"', 46, CHALK).move_to([R, -1.6, 0])
        qs = H('"evaluate the integral"', 46, CHALK).move_to([L, -1.6, 0])
        aa = arr(qa.get_top() + UP * 0.1, ma.get_bottom() + DOWN * 0.15, GRN)
        asg = arr(qs.get_top() + UP * 0.1, ms.get_bottom() + DOWN * 0.15, BLUE)
        self.go("3:56:29.53", FadeIn(qa, shift=UP * 0.1), run=0.5)
        self.go("3:56:31.25", GrowArrow(aa), Circumscribe(ha, color=GRN, buff=0.1), run=0.9)
        self.go("3:56:33.85", FadeIn(qs, shift=UP * 0.1), run=0.5)
        self.go("3:56:36.11", GrowArrow(asg), Circumscribe(hs, color=BLUE, buff=0.1), run=0.9)


# ================================================================ average value

def avg_f(x):
    return 1.5 + 0.6 * np.sin(1.4 * x - 0.5)


class K37_AvgIdea(Shot):
    def body(self):
        self.title("Average Value", "3:56:37.87")
        nums = M("4", "+", "7", "+", "10", size=72).move_to([0, 0.6, 0])
        self.go("3:56:40.79", FadeIn(VGroup(nums[0], nums[2], nums[4]), shift=UP * 0.1), run=0.6)
        self.go("3:56:41.99", Write(nums[1]), Write(nums[3]), run=0.5)
        avg = M(r"\frac{4+7+10}{3}", "=", "7", size=72).move_to([0, 0.3, 0])
        avg[2].set_color(GRN)
        self.go("3:56:42.65", ReplacementTransform(nums, avg[0]), run=0.8)
        bh = bval(avg[0], "how many", ORG, 38, math=False)
        self.go("3:56:43.49", GrowFromCenter(bh[0]), FadeIn(bh[1]), run=0.5)
        self.go("3:56:44.13", Write(avg[1:]), run=0.5)

        ax = axes((0, 5, 1), (0, 3, 1), x_length=7.4, y_length=3.0, center=(0.6, -0.9, 0), nums=False, y_label=None)
        ab = VGroup(M("a", size=40, color=FAINT).next_to(ax.c2p(0.6, 0), DOWN, buff=0.14),
                    M("b", size=40, color=FAINT).next_to(ax.c2p(4.4, 0), DOWN, buff=0.14))
        cv = curve(ax, avg_f, [0.6, 4.4])
        old = VGroup(avg, bh)
        self.go("3:56:45.20", old.animate.scale(0.6).move_to([-4.6, 1.75, 0]), run=0.7)
        self.go("3:56:45.85", Create(ax), FadeIn(ax.labels), FadeIn(ab), run=0.6)
        self.play(draw(cv, 0.8))
        dots = VGroup(*[pt(ax, x, avg_f(x), ORG, r=0.05) for x in np.linspace(0.7, 4.3, 25)])
        self.go("3:56:47.37", LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.08), run=1.4)

        r8 = riemann(ax, avg_f, 0.6, 4.4, 8, rule="midpoint")
        r40 = riemann(ax, avg_f, 0.6, 4.4, 40, rule="midpoint", opacity=0.5)
        self.go("3:56:50.43", FadeOut(dots), FadeIn(r8), run=0.6)
        self.go("3:56:52.49", ReplacementTransform(r8, r40), run=0.9)
        hl = r40[22]
        hb = SurroundingRectangle(hl, color=YEL, buff=0.0, stroke_width=4)
        fx = M("f(x)", size=44, color=BLUE).next_to(hl, LEFT, buff=0.2).shift(UP * 0.1)
        fx.shift(UP * (ax.c2p(0, 0.6)[1] - fx.get_y()))
        dxl = M("dx", size=44, color=YEL).next_to(ax.c2p(0.6 + 22.5 * 3.8 / 40, 0), DOWN, buff=0.15)
        self.go("3:56:53.31", Create(hb), FadeIn(fx), run=0.5)
        self.go("3:56:55.03", FadeIn(dxl, shift=UP * 0.1), run=0.5)

        wb = BraceBetweenPoints(ax.c2p(0.6, 0) + DOWN * 0.45, ax.c2p(4.4, 0) + DOWN * 0.45, DOWN, color=ORG)
        wl = M("b-a", size=44, color=ORG).next_to(wb, DOWN, buff=0.06)
        self.go("3:56:58.73", FadeOut(dxl), FadeOut(hb), FadeOut(fx), run=0.4)
        self.go("3:56:59.43", GrowFromCenter(wb), FadeIn(wl), run=0.6)
        self.go("3:57:00.41", FadeOut(old), run=0.4)

        fa = M(r"f_{\text{avg}}", "=", r"\frac{1}{b-a}", r"\int_a^b f(x)\,dx", size=60).move_to([0.6, 1.55, 0])
        col(fa, {0: YEL, 2: ORG, 3: GRN})
        self.go("3:57:02.85", Write(fa[0:2]), run=0.6)
        self.go("3:57:05.55", Write(fa[2]), run=1.0)
        self.go("3:57:07.75", Write(fa[3]), run=1.2)
        self.go("3:57:10.01", Circumscribe(fa, color=YEL, buff=0.12), run=0.9)


def x2_axes():
    return axes((0, 3.6, 1), (0, 10, 3), x_length=4.8, y_length=4.4, center=(-3.6, -0.8, 0), num_size=28)


class K37_AvgX2(Shot):
    def body(self):
        self.title("A First Average", "3:57:11.30")
        ax = x2_axes()
        cv = curve(ax, lambda x: x * x, [0, 3.1])
        s = ValueTracker(0.0)

        def region():
            k = s.get_value()
            xs = np.linspace(0, 3, 60)
            return Polygon(*[ax.c2p(x, (1 - k) * x * x + 3 * k) for x in xs], ax.c2p(3, 0), ax.c2p(0, 0),
                           stroke_width=0, fill_color=GRN, fill_opacity=0.4)
        reg = always_redraw(region)
        self.go("3:57:12.05", Create(ax), FadeIn(ax.labels), run=0.6)
        self.go("3:57:13.03", draw(cv, 0.8), run=0.8)
        b3 = DashedLine(ax.c2p(3, 0), ax.c2p(3, 9), color=ORG, stroke_width=3, dash_length=0.08)
        self.go("3:57:15.17", Create(b3), run=0.4)

        EX = 2.6
        r1 = at_eq(M(r"\int_0^3 x^2\,dx", "=", r"\frac{27}{3}", "=", "9", size=56), 1, EX, 1.4)
        col(r1, {0: GRN, 4: GRN})
        nine = M("9", size=56, color=GRN).move_to(ax.c2p(2.35, 1.9))
        self.go("3:57:16.49", Write(r1[0]), FadeIn(reg), run=0.9)
        self.go("3:57:18.77", Write(r1[1:3]), run=0.8)
        self.go("3:57:20.59", Write(r1[3:]), run=0.4)
        self.play(TransformFromCopy(r1[4], nine), run_time=0.5)

        r2 = at_eq(M(r"\text{width}", "=", "3", size=56), 1, EX, 0.05)
        r2[2].set_color(ORG)
        wb = BraceBetweenPoints(ax.c2p(0, 0) + DOWN * 0.4, ax.c2p(3, 0) + DOWN * 0.4, DOWN, color=ORG)
        self.go("3:57:22.15", Write(r2), GrowFromCenter(wb), run=0.6)
        r3 = at_eq(M(r"f_{\text{avg}}", "=", r"\frac{9}{3}", "=", "3", size=56), 1, EX, -1.4)
        col(r3, {0: YEL, 4: YEL})
        self.go("3:57:23.67", Write(r3[0:3]), run=0.8)
        self.go("3:57:26.31", Write(r3[3:]), run=0.4)
        self.play(Create(answer_box(r3[4], YEL)), run_time=0.4)

        lvl = DashedLine(ax.c2p(0, 3), ax.c2p(3, 3), color=YEL, stroke_width=4, dash_length=0.1)
        rect = Rectangle(width=ax.c2p(3, 0)[0] - ax.c2p(0, 0)[0], height=ax.c2p(0, 3)[1] - ax.c2p(0, 0)[1],
                         stroke_color=YEL, stroke_width=3).move_to(ax.c2p(1.5, 1.5))
        self.go("3:57:31.17", Create(lvl), run=0.5)
        self.go("3:57:31.65", Create(rect), run=0.8)
        self.go("3:57:35.31", Indicate(nine, color=GRN, scale_factor=1.2), run=0.8)
        # flatten it like water settling: the same area at height 3
        self.go("3:57:39.60", s.animate.set_value(1), nine.animate.move_to(ax.c2p(2.3, 1.5)), run=3.0, rate_func=smooth)
        lv = M(r"f_{\text{avg}}=3", size=48, color=YEL).next_to(ax.c2p(3, 3), RIGHT, buff=0.25).shift(UP * 0.3)
        self.go("3:57:43.23", TransformFromCopy(r3[0], lv), run=0.8)


class K37_AvgSin(Shot):
    def body(self):
        self.title("Average of sin x", "3:57:46.40")
        ax = axes((0, 3.6, 1), (0, 1.4, 1), x_length=5.4, y_length=3.6, center=(-3.4, -0.7, 0), nums=False, y_label=None)
        ticks = VGroup(pi_ticks(ax, [PI / 2, PI]), M("1", size=34, color=FAINT).next_to(ax.c2p(0, 1), LEFT, buff=0.12))
        cv = curve(ax, np.sin, [0, PI])
        g = area(ax, np.sin, 0, PI)
        self.go("3:57:47.51", Create(ax), FadeIn(ax.labels), FadeIn(ticks), run=0.6)
        self.go("3:57:48.35", draw(cv, 0.9), run=0.9)

        EX = 2.6
        r1 = at_eq(M(r"\int_0^{\pi}\sin x\,dx", "=", "2", size=56), 1, EX, 1.4)
        col(r1, {0: GRN, 2: GRN})
        self.go("3:57:50.63", Write(r1[0]), FadeIn(g), run=0.6)
        self.go("3:57:51.37", Write(r1[1:]), run=0.4)
        r2 = at_eq(M(r"\text{width}", "=", r"\pi", size=56), 1, EX, 0.05)
        r2[2].set_color(ORG)
        self.go("3:57:53.57", Write(r2), run=0.6)
        r3 = at_eq(M(r"f_{\text{avg}}", "=", r"\frac{2}{\pi}", r"\approx", "0.64", size=56), 1, EX, -1.4)
        col(r3, {0: YEL, 4: YEL})
        self.go("3:57:55.09", Write(r3[0:3]), run=0.8)
        self.go("3:57:57.11", Write(r3[3:]), run=0.6)
        self.play(Create(answer_box(r3[4], YEL)), run_time=0.4)

        lvl = DashedLine(ax.c2p(0, 2 / PI), ax.c2p(PI, 2 / PI), color=YEL, stroke_width=4, dash_length=0.1)
        ll = M("0.64", size=44, color=YEL).next_to(ax.c2p(PI, 2 / PI), RIGHT, buff=0.2)
        self.go("3:58:00.91", Create(lvl), run=0.7)
        self.play(FadeIn(ll), run_time=0.3)
        pk = pt(ax, PI / 2, 1)
        pl = VGroup(H("peak", 38, ORG), M("1", size=44, color=ORG)).arrange(RIGHT, buff=0.15).next_to(pk, UP, buff=0.15)
        self.go("3:58:03.59", FadeIn(pk, scale=0.6), FadeIn(pl, shift=DOWN * 0.1), run=0.5)


class K37_MVTInt(Shot):
    def body(self):
        self.title("Mean Value Theorem for Integrals", "3:58:05.39")
        EX = 2.9
        c1 = H("if f is continuous", 40, DIM).move_to([EX, 1.8, 0])
        self.go("3:58:09.31", FadeIn(c1, shift=DOWN * 0.1), run=0.6)
        ax = x2_axes()
        cv = curve(ax, lambda x: x * x, [0, 3.1])
        self.go("3:58:10.45", Create(ax), FadeIn(ax.labels), run=0.6)
        self.play(draw(cv, 0.8))
        lvl = DashedLine(ax.c2p(0, 3), ax.c2p(3, 3), color=YEL, stroke_width=4, dash_length=0.1)
        self.go("3:58:14.15", Create(lvl), run=0.6)
        st = M("f(c)", "=", r"f_{\text{avg}}", size=64).move_to([EX, 0.85, 0])
        col(st, {0: ORG, 2: YEL})
        self.go("3:58:16.11", Write(st[0]), run=0.6)
        self.go("3:58:17.57", Write(st[1:]), run=0.6)

        la = M(r"f_{\text{avg}}=3", size=44, color=YEL).next_to(ax.c2p(3, 3), RIGHT, buff=0.2).shift(UP * 0.3)
        self.go("3:58:21.73", FadeIn(la, shift=LEFT * 0.1), run=0.5)
        q = at_eq(M("x^2", "=", "3", size=60), 1, EX, -0.45)
        self.go("3:58:23.43", Write(q), run=0.7)

        tx = ValueTracker(0.0)
        dot = always_redraw(lambda: pt(ax, tx.get_value(), tx.get_value() ** 2))
        live_in(self, dot, run=0.2)
        self.play(tx.animate.set_value(np.sqrt(3)), run_time=1.6)
        unclock(dot)
        a = at_eq(M("x", "=", r"\sqrt{3}", r"\approx", "1.73", size=60), 1, EX, -1.7)
        col(a, {2: ORG, 4: ORG})
        self.go("3:58:25.89", Write(a[0:3]), run=0.8)
        drop = DashedLine(ax.c2p(np.sqrt(3), 3), ax.c2p(np.sqrt(3), 0), color=ORG, stroke_width=3, dash_length=0.08)
        cl = M(r"c=\sqrt{3}", size=44, color=ORG).next_to(ax.c2p(np.sqrt(3), 0.9), RIGHT, buff=0.15)
        self.play(Create(drop), FadeIn(cl), run_time=0.6)
        self.go("3:58:27.99", Write(a[3:]), run=0.7)

        span = Line(ax.c2p(0, 0), ax.c2p(3, 0), color=ORG, stroke_width=9).set_z_index(3)
        self.go("3:58:30.91", Create(span), run=0.8)
        self.go("3:58:32.93", Circumscribe(cl, color=ORG, buff=0.1), run=0.9)
        nm = H("like the Mean Value Theorem", 38, DIM).move_to([EX + 0.4, -2.75, 0])
        self.go("3:58:34.67", FadeIn(nm, shift=UP * 0.1), run=0.6)
        tr = ValueTracker(0.0)
        mv = always_redraw(lambda: pt(ax, tr.get_value(), tr.get_value() ** 2, YEL, r=0.1))
        self.go("3:58:37.79", FadeIn(mv), run=0.2)
        self.play(tr.animate(rate_func=linear).set_value(3), run_time=2.6)
        unclock(mv)
        self.play(Circumscribe(dot, color=YEL, shape=Circle, buff=0.12), run_time=0.8)


# ================================================================ area between two curves (intro; builder 38 continues)

class K37_Between(Shot):
    def body(self):
        self.title("Area Between Two Curves", "3:58:43.20")
        ax = axes((0, 5, 1), (0, 4.5, 1), x_length=8, y_length=4.4, center=(0, -0.75, 0), nums=False)
        top = curve(ax, TOP, [0.25, 4.75], color=BLUE)
        bot = curve(ax, BOT, [0.25, 4.75], color=PURP)
        lt = H("top", 40, BLUE).move_to(ax.c2p(2.5, TOP(2.5)) + UP * 0.4)
        lb = H("bottom", 40, PURP).move_to(ax.c2p(2.5, BOT(2.5)) + DOWN * 0.4)
        self.go("3:58:45.89", Create(ax), FadeIn(ax.labels), run=0.6)
        self.go("3:58:47.43", draw(top, 0.8), run=0.8)
        self.play(FadeIn(lt, shift=DOWN * 0.1), run_time=0.3)
        self.go("3:58:48.71", draw(bot, 0.8), run=0.8)
        self.play(FadeIn(lb, shift=UP * 0.1), run_time=0.3)

        reg = ax.get_area(curve(ax, TOP, [X1, X2]), x_range=[X1, X2], bounded_graph=curve(ax, BOT, [X1, X2]), color=GRN, opacity=0.4)
        xd = VGroup(pt(ax, X1, TOP(X1)), pt(ax, X2, TOP(X2)))
        self.go("3:58:51.13", FadeIn(reg), run=0.8)
        self.go("3:58:51.95", FadeIn(xd, scale=0.5), run=0.5)

        n = 14
        w = (X2 - X1) / n
        strips = VGroup(*[Polygon(ax.c2p(X1 + i * w, BOT(X1 + (i + .5) * w)), ax.c2p(X1 + (i + 1) * w, BOT(X1 + (i + .5) * w)),
                                  ax.c2p(X1 + (i + 1) * w, TOP(X1 + (i + .5) * w)), ax.c2p(X1 + i * w, TOP(X1 + (i + .5) * w)),
                                  stroke_color=GRN, stroke_width=2, fill_color=GRN, fill_opacity=0.35) for i in range(n)])
        self.go("3:58:54.23", reg.animate.set_fill(opacity=0.15), LaggedStart(*[FadeIn(s) for s in strips], lag_ratio=0.12), run=1.6)

        xt = ValueTracker(1.1)
        SW = 0.14

        def strip():
            x = xt.get_value()
            return Polygon(ax.c2p(x - SW / 2, BOT(x)), ax.c2p(x + SW / 2, BOT(x)), ax.c2p(x + SW / 2, TOP(x)), ax.c2p(x - SW / 2, TOP(x)),
                           stroke_color=YEL, stroke_width=3, fill_color=GRN, fill_opacity=0.7).set_z_index(4)

        def upar():
            x = xt.get_value()
            return arr(ax.c2p(x + 0.22, BOT(x)), ax.c2p(x + 0.22, TOP(x)), YEL, w=4, tip=0.16).set_z_index(4)
        sp = always_redraw(strip)
        self.go("3:58:57.67", FadeOut(strips), FadeIn(sp), run=0.5)
        up = upar()
        self.go("3:58:58.41", GrowArrow(up), Indicate(lb, color=PURP, scale_factor=1.1), run=0.9)
        self.remove(up)
        ua = always_redraw(upar)
        self.add(ua)
        self.go("3:58:59.40", xt.animate.set_value(3.9), Indicate(lt, color=BLUE, scale_factor=1.1), run=2.1)
        unclock(sp, ua)
