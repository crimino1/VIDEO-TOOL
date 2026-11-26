from sc_lib import *


def wire_icon():
    pts = [[-0.45 + 0.9 * i / 8, 0.12 * (-1) ** i, 0] for i in range(9)]
    w = VMobject(stroke_color=COPPER, stroke_width=5).set_points_as_corners(pts)
    return VGroup(w, cross(w.copy().scale(1.25), width=6))


def air_icon():
    g = VGroup(*[FunctionGraph(lambda x, p=p: 0.07 * np.sin(7 * x + p), x_range=[-0.45, 0.45], color=DIM, stroke_width=4).shift(UP * (0.16 - 0.16 * i)) for i, p in enumerate((0, 1.5, 3))])
    return VGroup(g, cross(g.copy().scale(1.25), width=6))


def stars(n, w, h, seed, center=ORIGIN):
    rng = np.random.default_rng(seed)
    g = VGroup()
    for _ in range(n):
        d = Dot([rng.uniform(-w / 2, w / 2), rng.uniform(-h / 2, h / 2), 0] + np.asarray(center), radius=rng.uniform(0.012, 0.03), color=WHITE)
        d.ph, d.sp, d.base = rng.uniform(0, 6.3), rng.uniform(0.8, 2.2), rng.uniform(0.35, 0.85)
        g.add(d)
    return g


def twinkle(g, clock, master):
    def up(m):
        t = clock.get_value()
        for d in m:
            d.set_opacity(master.get_value() * d.base * (0.6 + 0.4 * np.sin(d.sp * t + d.ph)))
    g.add_updater(up)


class Wave(Shot):
    def body(self):
        clock = tracker_time(self)
        w = EMWave(clock, A=1.4, k=1.35, v=1.7, xr=(-7.6, 7.6), center=[0, -0.25, 0], smax=2.6)
        lab = label("An electromagnetic wave", INK)
        # faint floor grid under the wave
        grid = VGroup()
        for z in np.arange(-2, 2.01, 1):
            grid.add(Line(*p3([-7, 7], [-1.9, -1.9], [z, z], center=[0, -0.25, 0]), stroke_color=FAINT, stroke_width=2))
        for x in np.arange(-7, 7.01, 1):
            grid.add(Line(*p3([x, x], [-1.9, -1.9], [-2, 2], center=[0, -0.25, 0]), stroke_color=FAINT, stroke_width=2))
        self.add(w)
        self.play(FadeIn(lab), FadeIn(grid), w.amp.animate.set_value(1), run_time=1.0)
        le = H("E = electric field", 42, GOLD).move_to([-4.3, 2.65, 0])
        lb = H("B = magnetic field", 42, CYAN).next_to(le, DOWN, buff=0.12, aligned_edge=LEFT)
        tr = doodle_arrow([3.4, 2.55, 0], [5.9, 2.55, 0], INK, angle=-0.35)
        trl = H("travels this way", 36).next_to(tr, UP, buff=0.05)
        self.play(Write(le), run_time=0.5)
        self.play(Write(lb), Create(tr), FadeIn(trl), run_time=0.6)
        # no wire / no air
        a1 = VGroup(wire_icon(), T("no wire needed", 40)).arrange(RIGHT, buff=0.3).move_to([-3.4, -3.25, 0])
        a2 = VGroup(air_icon(), T("no air needed", 40)).arrange(RIGHT, buff=0.3).move_to([3.4, -3.25, 0])
        self.go("5:16.00", FadeIn(a1, shift=UP * 0.2), run=0.4)
        self.go("5:17.26", FadeIn(a2, shift=UP * 0.2), run=0.4)
        # pull back into empty space
        dark = Rectangle(width=16, height=10, fill_color=BLACK, fill_opacity=1, stroke_width=0).set_opacity(0)
        st = stars(90, 14, 8, 7)
        master = ValueTracker(0)
        twinkle(st, clock, master)
        self.add(dark, st)
        self.bring_to_front(w, lab, le, lb, tr, trl, a1, a2)
        line = T("through empty space, all by themselves", 44).move_to([0, -3.25, 0])
        self.go("5:18.30", FadeOut(a1), FadeOut(a2), run=0.3)
        self.play(FadeOut(grid), FadeIn(line, shift=UP * 0.2),
                w.sc.animate.set_value(0.5), w.span.animate.set_value(2.5), dark.animate.set_opacity(0.55), master.animate.set_value(1),
                run_time=3.4, rate_func=rate_functions.ease_in_out_sine)
        # the wave keeps going; a slow drift further out
        self.play(w.sc.animate.set_value(0.44), w.span.animate.set_value(2.6), run_time=self.END - self.now() - 0.05, rate_func=linear)


class LightWave(Shot):
    """Same travelling wave as Wave, closer and warmer."""

    def body(self):
        clock = tracker_time(self)
        warm = Circle(radius=4, fill_color=GOLD, fill_opacity=0.06, stroke_width=0).move_to([0, -0.2, 0])
        warm2 = Circle(radius=2.4, fill_color=GOLD, fill_opacity=0.05, stroke_width=0).move_to([0, -0.2, 0])
        w = EMWave(clock, A=1.25, k=1.5, v=1.9, xr=(-6.0, 6.0), center=[0, -0.35, 0], ew=4)
        w.sc.set_value(1.3)
        w.amp.set_value(1)
        self.add(warm, warm2, w)
        self.add(label("Light"))
        line = VGroup(T("electric", 46, GOLD, weight=BOLD), T("+", 46), T("magnetic", 46, CYAN, weight=BOLD), T("fields", 46)).arrange(RIGHT, buff=0.25)
        line.move_to([0, 2.75, 0])
        push(self, 0.96)
        self.play(FadeIn(line, shift=UP * 0.2), run_time=0.5)
        d = doodle("playing leapfrog through space", [-2.6, -3.2, 0], [-1.2, -2.0, 0], size=42, angle=0.6)
        self.go("6:13.60", Write(d[0]), Create(d[1]), run=0.6)
