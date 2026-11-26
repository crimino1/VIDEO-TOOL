from sc_lib import *


def bob(m, clock, amp=0.06, sp=2.0, ph=0.0):
    y0 = m.get_center()[1]
    m.add_updater(lambda mob: mob.set_y(y0 + amp * np.sin(sp * clock.get_value() + ph)))
    return m


def charged_ball(r=0.55):
    b = Circle(radius=r, stroke_color=GOLD, stroke_width=4, fill_color=GOLD, fill_opacity=0.18)
    plus = VGroup(*[T("+", 30, GOLD, weight=BOLD).move_to(r * 0.5 * np.array([np.cos(a), np.sin(a), 0])) for a in np.linspace(0.4, 0.4 + TAU, 5)[:-1]])
    plus.add(T("+", 30, GOLD, weight=BOLD))
    return VGroup(glow(b, layers=4, opacity=0.09), plus)


class Speed(Shot):
    def body(self):
        clock = tracker_time(self)
        fr = self.camera.frame
        push(self, 0.965)
        self.add(label("How fast"))
        mu = M(r"\mu_0", size=140, color=CYAN).move_to([-3.6, 1.0, 0])
        ep = M(r"\varepsilon_0", size=140, color=GOLD).move_to([3.6, 1.0, 0])
        gmu, gep = glow(mu.copy(), layers=4, opacity=0.07)[:-1], glow(ep.copy(), layers=4, opacity=0.07)[:-1]
        self.play(FadeIn(mu, scale=0.8), FadeIn(gmu), FadeIn(ep, scale=0.8), FadeIn(gep), run_time=0.6)
        mag = emoji("1f9f2", 1.15).move_to([-3.6, -0.9, 0])
        ball = charged_ball().move_to([3.6, -0.9, 0])
        self.go("5:33.12", FadeIn(mag, scale=0.6), FadeIn(ball, scale=0.6), run=0.45)
        bob(mag, clock, 0.07, 2.1)
        bob(ball, clock, 0.07, 2.1, 1.6)
        lm = H("measured with magnets", 40).move_to([-3.6, -2.25, 0])
        lc = H("measured with charges", 40).move_to([3.6, -2.25, 0])
        self.go("5:35.45", Write(lm), run=0.5)
        self.go("5:36.15", Write(lc), run=0.5)
        # plug them in
        v = M(r"v=\frac{1}{\sqrt{\mu_0\varepsilon_0}}", size=120).move_to([0, 0.75, 0])
        g = v[0]
        g[6:8].set_color(CYAN)
        g[8:10].set_color(GOLD)
        self.go("5:37.41", ReplacementTransform(mu, g[6:8]), ReplacementTransform(ep, g[8:10]), FadeOut(gmu), FadeOut(gep),
                FadeOut(VGroup(lm, lc)), FadeOut(mag), FadeOut(ball), FadeIn(g[:6], shift=DOWN * 0.15), run=1.0, rate_func=rate_functions.ease_in_out_cubic)
        # the counter
        n = ValueTracker(0)
        approx = M(r"\approx", size=90).move_to([-3.4, -1.85, 0])
        num = DecimalNumber(0, num_decimal_places=0, group_with_commas=True, font_size=96)
        unit = T("km/s", 64)

        def up_num(m):
            m.set_value(n.get_value())
            m.next_to(approx, RIGHT, buff=0.35)
            unit.next_to(m, RIGHT, buff=0.3).align_to(m, DOWN)

        up_num(num)
        num.add_updater(up_num)
        self.go("5:40.03", FadeIn(approx), FadeIn(num), FadeIn(unit), run=0.25)
        self.play(n.animate.set_value(300000), run_time=1.4, rate_func=rate_functions.ease_out_cubic)
        # v becomes c
        c = M("c", size=170, color=GOLD).move_to(g[0]).shift(LEFT * 0.12)
        cg = glow(c.copy(), layers=6, opacity=0.1)[:-1]
        flash = Rectangle(width=30, height=20, fill_color=WHITE, fill_opacity=0.55, stroke_width=0)
        self.go("5:43.24", ReplacementTransform(g[0], c), FadeIn(cg), FadeIn(flash, run_time=0.08), run=0.35)
        self.play(FadeOut(flash), run_time=0.35)
        # light beam streaks across, twice
        d = doodle("the speed of light!", [-4.4, 2.55, 0], c.get_top() + LEFT * 0.15 + UP * 0.05, GOLD, size=46, angle=0.6)
        for i in range(2):
            beam = VGroup(*[Line([-2.2, 0, 0], [2.2, 0, 0], stroke_color=GOLD, stroke_width=w, stroke_opacity=o) for w, o in ((40, 0.06), (22, 0.12), (11, 0.3), (5, 1))])
            beam.add(Line([1.4, 0, 0], [2.2, 0, 0], stroke_color=WHITE, stroke_width=7))
            beam.move_to([-10, -3.1, 0])
            anims = [beam.animate(rate_func=linear).move_to([10, -3.1, 0])]
            if i == 0:
                anims += [Write(d[0]), Create(d[1])]
            self.play(*anims, run_time=0.65)
            self.remove(beam)
