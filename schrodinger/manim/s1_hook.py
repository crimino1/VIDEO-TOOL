from common import *


class Open(Shot):
    def body(self):
        clock = tracker_time(self)
        lines = VGroup()
        for i in range(17):
            y0 = -4 + i * 0.5
            amp = 0.10 + 0.05 * np.sin(i * 1.3)
            k = 1.1 + 0.25 * np.sin(i * 0.7)
            w = 0.7 + 0.2 * np.cos(i)
            lines.add(wave_line(lambda xs, y0=y0, amp=amp, k=k, w=w, i=i: y0 + amp * np.sin(k * xs - w * clock.get_value() * 2 + i) * (0.6 + 0.4 * np.cos(xs * 0.35 + i)),
                                -7.5, 7.5, color=PSI, width=1.4, stroke_opacity=0.34 + 0.06 * (i % 3), n=220))
        self.add(lines)
        eq = schrod(76)
        self.go("0:00.82", Write(eq), run=3.1)
        self.play(eq.animate.set_color(INK), run_time=0.2)
        self.at("0:05.20")
        self.play(FadeOut(eq), FadeOut(lines), run_time=0.35)


class AtomsHold(Shot):
    def body(self):
        clock = tracker_time(self)
        base, e = atom(R=2.2, nuc_r=0.34)
        r = ValueTracker(2.2)
        e.add_updater(lambda m: m.move_to([r.get_value() * np.cos(clock.get_value() * 4.2), r.get_value() * np.sin(clock.get_value() * 4.2), 0]))
        orb = base[0]
        orb.add_updater(lambda m: m.become(Circle(radius=r.get_value(), color=FAINT, stroke_width=2)))
        self.play(FadeIn(base), FadeIn(e), run_time=0.5)
        l = T("collapse?", 56, RED).to_edge(UP, buff=0.8)
        self.go("0:12.70", FadeIn(l, shift=DOWN * 0.2), r.animate.set_value(0.7), run=1.6, rate_func=rate_functions.ease_in_quad)
        self.go("0:14.45", r.animate.set_value(2.2), FadeOut(l), run=0.8, rate_func=rate_functions.ease_out_back)
        ok = T("it never happens", 56, INK).to_edge(UP, buff=0.8)
        self.play(FadeIn(ok), run_time=0.3)
        self.at("0:15.92")
        self.play(FadeOut(VGroup(base, e, ok)), run_time=0.3)


class ComesDown(Shot):
    def body(self):
        rng = np.random.default_rng(5)
        dots = VGroup(*[Dot(point=[rng.uniform(-8, 8), rng.uniform(-4.6, 4.6), 0], radius=0.03, color=rng.choice([PSI, EN, MOM, POT])) for _ in range(180)])
        self.play(FadeIn(dots), run_time=0.3)
        eq = schrod(84)
        self.play(*[d.animate.move_to(eq.get_center() + np.array([rng.uniform(-5, 5), rng.uniform(-0.7, 0.7), 0])) for d in dots], run_time=1.4, rate_func=rate_functions.ease_in_cubic)
        self.go("0:17.97", FadeOut(dots, run_time=0.25), FadeIn(eq, scale=1.2), Flash(eq.get_center(), color=PSI, line_length=0.9, flash_radius=6, num_lines=26), run=0.5)


class Memorize(Shot):
    def body(self):
        eq = schrod(60).to_edge(UP, buff=0.7)
        self.add(eq)
        words = [("They memorize it", "0:25.74"), ("They solve it", "0:27.02"), ("They pass the exam", "0:28.00")]
        rows = VGroup()
        for i, (w, t) in enumerate(words):
            row = VGroup(T(w, 62), M(r"\checkmark", size=62, color=GOOD))
            row.arrange(RIGHT, buff=0.35).move_to([0, 0.4 - i * 1.05, 0])
            rows.add(row)
            self.go(t, FadeIn(row, shift=UP * 0.15), run=0.3)
        self.go("0:29.10", FadeOut(rows), run=0.3)
        q = TI("But what does it really mean?", 72)
        self.go("0:29.96", FadeIn(q), run=0.5)
        self.go("0:31.98", FadeOut(q), eq.animate.set_opacity(0.18), run=0.45)
        self.at("0:32.85")
        self.play(FadeOut(eq), run_time=0.3)


class Changes(Shot):
    def body(self):
        a = T("Today that changes.", 92)
        self.play(FadeIn(a, shift=UP * 0.15), run_time=0.5)
        self.go("0:34.78", a.animate.scale(0.5).to_edge(UP, buff=0.5), run=0.4)
        clock = tracker_time(self)
        # what you need: a wave and a little algebra
        wave = wave_line(lambda xs: 0.2 + 0.75 * np.sin(2.1 * xs - 3 * clock.get_value()), -6.0, -0.8, color=PSI, width=5)
        l1 = T("a wave", 44, PSI).move_to([-3.4, -1.3, 0])
        self.go("0:36.83", Create(wave), FadeIn(l1), run=1.0)
        alg = M(r"x^2+2x=8", size=80).move_to([3.4, 0.2, 0])
        l2 = T("school algebra", 44, EN).move_to([3.4, -1.3, 0])
        self.go("0:38.67", Write(alg), FadeIn(l2), run=1.0)
        r = T("You are ready.", 64, INK).to_edge(DOWN, buff=0.6)
        self.go("0:40.73", FadeIn(r), run=0.35)
        self.go("0:41.77", FadeOut(VGroup(a, wave, l1, alg, l2, r)), run=0.35)
        eq = schrod(76)
        self.play(Write(eq), run_time=1.4)
        lab = T("You'll build it yourself", 62, EN).next_to(eq, DOWN, buff=0.7)
        self.go("0:45.43", FadeIn(lab), run=0.5)
        self.go("0:46.95", FadeOut(lab), eq.animate.scale(0.55).to_edge(DOWN, buff=0.45), run=0.5)
        steps = VGroup(
            M(r"E=\hbar\omega", color=EN, size=66),
            M(r"p=\hbar k", color=MOM, size=66),
            M(r"\psi=e^{i(kx-\omega t)}", color=PSI, size=66),
            M(r"E=\frac{p^2}{2m}+V", size=66),
        ).arrange(DOWN, buff=0.34, aligned_edge=LEFT).shift(UP * 0.75)
        nums = VGroup(*[T(str(i + 1), 44, DIM).next_to(s, LEFT, buff=0.5) for i, s in enumerate(steps)])
        self.go("0:47.97", LaggedStart(*[FadeIn(VGroup(nums[i], steps[i]), shift=RIGHT * 0.2) for i in range(4)], lag_ratio=0.3), run=1.4)
        self.go("0:50.17", FadeOut(VGroup(nums, steps, eq)), run=0.6)
