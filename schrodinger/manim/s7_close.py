from common import *
from s6_solve import orbital


class Tunnel(Shot):
    def body(self):
        clock = tracker_time(self)
        a, b = -0.8, 0.8
        y0 = -0.4
        kp = 3.2
        decay = 1.05

        def fn(xs):
            t = clock.get_value()
            ys = 0 * xs
            left = xs < a
            mid = (xs >= a) & (xs <= b)
            right = xs > b
            ys[left] = 1.25 * np.sin(kp * (xs[left] - a) - 6 * t)
            env = 1.25 * np.exp(-decay * (xs[mid] - a))
            ys[mid] = env * np.sin(-6 * t)
            T_ = 1.25 * np.exp(-decay * (b - a))
            ys[right] = T_ * np.sin(kp * (xs[right] - b) - 6 * t)
            return y0 + ys

        barrier = Rectangle(width=b - a, height=4.6, fill_color=POT, fill_opacity=0.25, stroke_color=POT, stroke_width=3).move_to([0, y0, 0])
        bl = T("a barrier it can't climb", 44, POT).next_to(barrier, UP, buff=0.12)
        w = wave_line(fn, -7.3, 7.3, color=PSI, width=4, n=1200)
        cap = T("The wave leaks through", 62, PSI).to_edge(UP, buff=0.35)
        self.play(FadeIn(barrier), FadeIn(w), FadeIn(bl), run_time=0.5)
        self.go("12:23.71", FadeOut(bl), FadeIn(cap), run=0.35)
        self.at("12:26.70")
        self.play(FadeOut(VGroup(barrier, w, cap)), run_time=0.25)
        # two protons, the repulsion between them, then fusion
        pa = Dot(radius=0.24, color=RED).move_to([-5.2, 0, 0])
        pb = Dot(radius=0.24, color=RED).move_to([5.2, 0, 0])
        la = M("+", size=56).move_to(pa)
        lb = M("+", size=56).move_to(pb)
        pa_g = VGroup(pa, la)
        pb_g = VGroup(pb, lb)
        cap2 = T("Protons get close enough to fuse", 62, EN).to_edge(UP, buff=0.5)
        self.play(FadeIn(pa_g), FadeIn(pb_g), FadeIn(cap2), run_time=0.3)
        self.play(pa_g.animate.move_to([-0.26, 0, 0]), pb_g.animate.move_to([0.26, 0, 0]), run_time=1.6, rate_func=rate_functions.ease_in_quad)
        self.play(Flash(ORIGIN, color=EN, line_length=1.3, flash_radius=1.2, num_lines=24), run_time=0.4)
        no = T("No tunneling, far less sunlight.", 66, INK).to_edge(DOWN, buff=0.7)
        self.go("12:29.91", FadeIn(no), run=0.35)
        self.at("12:32.20")
        self.clear_all(0.28)


class Reprise(Shot):
    def body(self):
        clock = tracker_time(self)
        lines = VGroup()
        for i in range(17):
            y0 = -4 + i * 0.5
            amp = 0.10 + 0.05 * np.sin(i * 1.3)
            k = 1.1 + 0.25 * np.sin(i * 0.7)
            w = 0.7 + 0.2 * np.cos(i)
            lines.add(wave_line(lambda xs, y0=y0, amp=amp, k=k, w=w, i=i: y0 + amp * np.sin(k * xs - w * clock.get_value() * 2 + i) * (0.6 + 0.4 * np.cos(xs * 0.35 + i)),
                                -7.5, 7.5, color=PSI, width=1.4, stroke_opacity=0.36, n=220))
        cap = T("All of it traces back to waves", 66).shift(UP * 1.7)
        self.play(FadeIn(lines), FadeIn(cap), run_time=0.5)
        eq = schrod(76).shift(DOWN * 0.3)
        self.go("12:56.24", Write(eq), run=1.3)
        self.at("12:57.70")
        self.play(FadeOut(VGroup(lines, cap, eq)), run_time=0.28)


class Terrifying(Shot):
    def body(self):
        eq = schrod(92)
        self.play(FadeIn(eq), run_time=0.6)
        tl = T("looks terrifying", 66, RED).to_edge(UP, buff=0.8)
        self.go("13:05.88", FadeIn(tl), run=0.35)
        def hilite(t, target, txt, col):
            box = SurroundingRectangle(target, color=col, buff=0.1, corner_radius=0.05)
            l = T(txt, 58, col).to_edge(DOWN, buff=0.9)
            self.go(t, Create(box), FadeIn(l), run=0.3)
            return VGroup(box, l)

        psi1 = eq[7]
        g = hilite("13:07.48", psi1, "Greek letters", PSI)
        g2 = hilite("13:08.64", eq[0], "imaginary numbers", EN)
        self.remove(g[1])
        g3 = hilite("13:10.30", eq[1], "derivatives", MOM)
        self.remove(g2[1])
        self.go("13:11.48", FadeOut(VGroup(g[0], g2[0], g3, tl)), eq.animate.shift(UP * 1.6).set_opacity(0.25), run=0.4)
        c = T("Underneath, something a child could understand", 60).shift(DOWN * 0.7)
        self.go("13:12.66", FadeIn(c), run=0.45)
        s1 = T("Energy is always conserved.", 80, EN).shift(UP * 0.7)
        self.go("13:15.06", FadeOut(c), FadeOut(eq), FadeIn(s1), run=0.4)
        s2 = T("And everything is a wave.", 80, PSI).shift(DOWN * 0.7)
        self.go("13:17.40", FadeIn(s2), run=0.5)
        self.at("13:19.05")
        self.clear_all(0.28)


class Waves(Shot):
    def body(self):
        clock = tracker_time(self)
        rng = np.random.default_rng(21)
        pk = VGroup()
        for i in range(70):
            y = rng.uniform(-3.4, 2.6)
            x0 = rng.uniform(-8, 8)
            sp = rng.uniform(0.25, 0.9) * rng.choice([-1, 1])
            k = rng.uniform(6, 11)
            s = rng.uniform(0.28, 0.5)
            col = [PSI, EN, MOM, POT][i % 4]
            m = VMobject(stroke_color=col, stroke_width=2.4, stroke_opacity=0.9)

            def up(mob, y=y, x0=x0, sp=sp, k=k, s=s):
                c = ((x0 + sp * clock.get_value() + 9) % 18) - 9
                q = np.linspace(-1.5, 1.5, 70)
                ys = y + 0.34 * np.exp(-(q * q) / (2 * s * s)) * np.sin(k * q - 6 * clock.get_value())
                mob.set_points_as_corners(np.column_stack([c + q, ys, 0 * q]))

            up(m)
            m.add_updater(up)
            pk.add(m)
        c = plate(T("each one following the same rule", 62)).to_edge(UP, buff=0.4).set_z_index(3)
        self.play(FadeIn(pk), FadeIn(c), run_time=0.5)
        c2 = plate(T("each one choosing from a cloud of possibilities", 58)).to_edge(UP, buff=0.4).set_z_index(3)
        self.go("13:26.44", FadeOut(c), FadeIn(c2), run=0.4)
        # the clockwork comes back, and dissolves
        g = gear(16, 2.2, 0.2, color=INK, fill=False).move_to([0, -0.4, 0]).set_stroke(opacity=0)
        g.add_updater(lambda m, dt: m.rotate(dt * 0.3))
        self.add(g)
        c3 = plate(T("not a clockwork machine after all", 66, INK)).to_edge(UP, buff=0.4).set_z_index(3)
        self.go("13:30.32", FadeOut(c2), FadeIn(c3), g.animate.set_stroke(opacity=0.85), run=0.8)
        self.play(g.animate.set_stroke(opacity=0), run_time=1.2)
        self.at("13:32.85")
        self.play(FadeOut(pk), FadeOut(c3), run_time=0.3)


class Music(Shot):
    def body(self):
        clock = tracker_time(self)
        amp = ValueTracker(0.0)
        rows = VGroup()
        for i in range(5):
            y0 = 1.2 - i * 0.6
            n = i + 1
            rows.add(wave_line(lambda xs, y0=y0, n=n: y0 + amp.get_value() * (0.26 / n ** 0.5) * np.cos((5 + n) * clock.get_value()) * np.sin(n * np.pi * (xs + 6.4) / 12.8), -6.4, 6.4, color=INK, width=3, n=420))
        cap = T("It's music.", 96, EN).to_edge(UP, buff=0.4)
        self.play(FadeIn(rows), FadeIn(cap), amp.animate.set_value(1), run_time=0.6)
        eq = schrod(66).move_to([0, 0, 0]).set_color(PSI)
        eq.add_background_rectangle(color=BG, opacity=0.88, buff=0.12)
        c2 = T("And now you understand the score.", 72).to_edge(DOWN, buff=0.45)
        self.go("13:34.48", FadeIn(eq), FadeIn(c2), run=0.6)
        self.at("13:36.20")
        self.play(FadeOut(VGroup(rows, cap, eq, c2)), run_time=0.28)


class Outro(Shot):
    def body(self):
        clock = tracker_time(self)
        a = T("First time it actually made sense?", 72)
        self.play(FadeIn(a), run_time=0.5)
        b = T("Tell me in the comments.", 72, EN)
        self.go("13:40.54", FadeTransform(a, b), run=0.4)
        self.go("13:41.85", FadeOut(b), run=0.2)
        im1 = orbital("1s", 4.2, 5.0).move_to([-3.8, 0.1, 0])
        eq = M(r"\hat{H}\psi=E\psi", size=86, color=PSI).move_to([2.8, 1.0, 0])
        c = T("Next: the real hydrogen atom", 54).move_to([2.6, -0.05, 0])
        d = T("step by step", 50, DIM).next_to(c, DOWN, buff=0.2)
        self.play(FadeIn(im1), FadeIn(eq), FadeIn(c), run_time=0.5)
        self.go("13:45.92", FadeIn(d), run=0.3)
        s = T("Subscribe", 72, EN).to_edge(DOWN, buff=0.6).shift(RIGHT * 2.8)
        self.go("13:47.14", FadeIn(s, scale=1.1), run=0.3)
        self.go("13:49.60", FadeOut(VGroup(eq, c, d, s)), FadeOut(im1), run=0.3)
        # the last wave leaves the frame
        x0 = ValueTracker(-9)
        w = wave_line(lambda xs: 0.0 + 1.1 * np.exp(-((xs - x0.get_value()) ** 2) / 1.7) * np.sin(6 * (xs - x0.get_value())), -8, 8, color=PSI, width=4, n=700)
        self.add(w)
        l = T("See you in the next wave.", 56, DIM).to_edge(UP, buff=1.2)
        self.play(FadeIn(l), x0.animate.set_value(9), run_time=1.6, rate_func=rate_functions.linear)
