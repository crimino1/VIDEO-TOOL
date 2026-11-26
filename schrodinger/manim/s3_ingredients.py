from common import *


class TwoIdeas(Shot):
    def body(self):
        eq = schrod(66).shift(DOWN * 1.9).set_opacity(0.22)
        a = T("Idea 1", 60, EN).move_to([-3.2, 1.7, 0])
        b = T("Idea 2", 60, MOM).move_to([3.2, 1.7, 0])
        ba = SurroundingRectangle(a, color=EN, buff=0.35, corner_radius=0.08)
        bb = SurroundingRectangle(b, color=MOM, buff=0.35, corner_radius=0.08)
        self.add(eq)
        self.go("2:21.64", FadeIn(VGroup(a, ba), shift=DOWN * 0.2), run=0.4)
        self.play(FadeIn(VGroup(b, bb), shift=DOWN * 0.2), run_time=0.4)
        la = Arrow(ba.get_bottom(), eq.get_top() + LEFT * 1.4, color=EN, stroke_width=4, buff=0.15)
        lb = Arrow(bb.get_bottom(), eq.get_top() + RIGHT * 1.4, color=MOM, stroke_width=4, buff=0.15)
        lab = T("the ingredients of our equation", 44, DIM).next_to(eq, DOWN, buff=0.45)
        self.go("2:25.80", GrowArrow(la), GrowArrow(lb), FadeIn(lab), run=0.7)
        self.go("2:27.72", eq.animate.set_opacity(1), run=0.5)
        self.at("2:28.35")
        self.clear_all(0.3)


class Packets(Shot):
    def body(self):
        clock = tracker_time(self)
        mix = ValueTracker(0)   # 0 smooth wave, 1 packets
        k = ValueTracker(3.0)
        c = 2.2

        def fn(xs):
            t = clock.get_value()
            phase = k.get_value() * (xs - c * t)
            env = 0 * xs
            for i in range(-6, 7):
                env = env + np.exp(-((((xs - c * t) % 5.0) - 2.5 + i * 5.0) ** 2) / 0.28)
            m = mix.get_value()
            return 0.2 + 1.0 * np.sin(phase) * ((1 - m) + m * env)

        w = wave_line(fn, -7.5, 7.5, color=EN, width=4, n=900)
        lab = T("light", 60).to_edge(UP, buff=0.55)
        self.play(Create(w), FadeIn(lab), run_time=0.6)
        l2 = T("a smooth wave?", 60, DIM).to_edge(UP, buff=0.55)
        self.go("2:30.10", FadeTransform(lab, l2), run=0.4)
        l3 = T("little packets", 72, EN).to_edge(UP, buff=0.55)
        self.go("2:32.30", mix.animate.set_value(1), FadeTransform(l2, l3), run=1.2)
        l4 = T("chunks of energy", 72, EN).to_edge(UP, buff=0.55)
        self.go("2:34.52", FadeTransform(l3, l4), run=0.3)
        l5 = T("photons", 92, EN).to_edge(UP, buff=0.55)
        self.go("2:35.74", FadeTransform(l4, l5), run=0.3)
        l6 = T("energy depends on frequency", 66).to_edge(UP, buff=0.55)
        self.go("2:37.44", FadeTransform(l5, l6), run=0.35)
        l7 = T("how fast the wave wiggles", 66).to_edge(UP, buff=0.55)
        self.go("2:40.68", mix.animate.set_value(0), FadeTransform(l6, l7), run=0.5)
        self.play(k.animate.set_value(7.0), run_time=1.2)
        self.clear_all(0.2)


class Ehf(Shot):
    def body(self):
        eq = M("E", "=", "h", r"\,", "f", size=130)
        eq[0].set_color(EN); eq[2].set_color(INK); eq[4].set_color(PSI)
        self.play(FadeIn(eq[0]), FadeIn(eq[1]), FadeIn(eq[2]), run_time=0.3)
        self.go("2:43.58", FadeIn(eq[3]), FadeIn(eq[4]), run=0.3)
        self.go("2:44.82", eq.animate.shift(UP * 1.9).scale(0.8), run=0.4)
        en = T("energy", 46, EN).move_to([-3.2, 2.0, 0])
        self.play(FadeIn(en), run_time=0.2)
        pl = portrait("planck", 2.9).move_to([-4.2, -1.3, 0])
        hl = M(r"h = 6.626\times 10^{-34}\ \mathrm{J\,s}", size=46).move_to([1.5, -0.7, 0])
        hn = T("Planck's constant: a tiny number", 44, DIM).next_to(hl, DOWN, buff=0.3)
        self.go("2:45.60", FadeIn(hl), run=0.4)
        self.go("2:46.68", FadeIn(pl), FadeIn(hn), run=0.4)
        fr = T("frequency", 46, PSI).move_to([3.2, 2.0, 0])
        self.go("2:48.32", FadeIn(fr), run=0.3)
        # faster wiggle, taller energy bar
        self.go("2:49.70", FadeOut(pl), FadeOut(hl), FadeOut(hn), run=0.25)
        clock = tracker_time(self)
        k = ValueTracker(1.6)
        ph = ValueTracker(0)
        ph.add_updater(lambda m, dt: m.increment_value(dt * k.get_value() * 3))
        self.add(ph)
        w = wave_line(lambda xs: -1.1 + 0.9 * np.sin(k.get_value() * xs - ph.get_value()), -6.5, 3.4, color=PSI, width=4, n=700)
        b = ValueTracker(0.2)
        bar_ = energy_bar("energy", EN, 5.2, base=-2.6, h=3.0, tracker=b, size=36)
        self.play(FadeIn(w), FadeIn(bar_), run_time=0.2)
        self.play(k.animate.set_value(7), b.animate.set_value(0.95), run_time=1.5, rate_func=rate_functions.smooth)


class Hbar(Shot):
    def body(self):
        a = M("E", "=", "h", r"\,", "f", size=120)
        a[0].set_color(EN); a[4].set_color(PSI)
        self.play(FadeIn(a), run_time=0.3)
        b = M("E", "=", r"\hbar", r"\,", r"\omega", size=120)
        b[0].set_color(EN); b[4].set_color(PSI)
        self.go("3:01.69", TransformMatchingTex(a, b), run=0.8)
        self.go("3:03.20", b.animate.shift(UP * 1.5), run=0.4)
        same = T("same idea", 44, DIM).next_to(b, DOWN, buff=0.25)
        self.play(FadeIn(same), run_time=0.2)
        h1 = M(r"\hbar", "=", r"\frac{h}{2\pi}", size=88).move_to([-3, -1.3, 0])
        self.go("3:04.79", FadeIn(h1), FadeOut(same), run=0.5)
        h2 = M(r"\omega", "=", r"2\pi f", size=88, color=PSI).move_to([3, -1.3, 0])
        self.go("3:08.55", FadeIn(h2), run=0.5)
        unit = T("the same frequency, in a different unit", 40, DIM).next_to(h2, DOWN, buff=0.35)
        self.play(FadeIn(unit), run_time=0.3)
        self.go("3:12.60", FadeOut(VGroup(h1, h2, unit)), b.animate.move_to(ORIGIN), run=0.5)
        box = SurroundingRectangle(b, color=EN, buff=0.35, corner_radius=0.1)
        rem = T("Remember this one.", 62, EN).next_to(box, DOWN, buff=0.5)
        self.go("3:13.26", Create(box), FadeIn(rem), run=0.5)
        self.at("3:15.05")
        self.clear_all(0.3)


class EveryParticle(Shot):
    def body(self):
        clock = tracker_time(self)
        rows = [("an electron", "3:37.22", 1.9, 1.6, PSI), ("a proton", "3:38.40", 0.0, 6.0, POT)]
        cap = T("every moving particle has a wavelength", 58).to_edge(UP, buff=0.5)
        self.play(FadeIn(cap), run_time=0.4)
        g = VGroup()
        for name, t, y, k, col in rows:
            lab = T(name, 46, col).move_to([-5.3, y, 0])
            w = wave_line(lambda xs, y=y, k=k: y * 1.0 - 0.1 + 0.42 * np.sin(k * xs - 5 * clock.get_value()), -3.6, 6.8, color=col, width=3, n=700)
            dot = glow_dot(col, 0.08).move_to([-3.6, y - 0.1, 0])
            self.go(t, FadeIn(lab), FadeIn(dot), Create(w), run=0.5)
            g.add(lab, w, dot)
        lab = T("even you", 46, EN).move_to([-5.3, -1.9, 0])
        flat = Line([-3.6, -2.0, 0], [6.8, -2.0, 0], color=EN, stroke_width=2)
        tiny = M(r"\lambda\approx 10^{-35}\ \mathrm{m}", size=44, color=EN).move_to([2.8, -2.65, 0])
        walker = T("70 kg, walking pace", 34, DIM).next_to(lab, DOWN, buff=0.15)
        self.go("3:39.54", FadeIn(lab), Create(flat), FadeIn(tiny), FadeIn(walker), run=0.5)
        g.add(lab, flat, tiny, walker)
        dep = T("that wavelength depends on its momentum", 62, MOM)
        self.go("3:42.02", FadeOut(g), FadeOut(cap), FadeIn(dep), run=0.4)
        self.go("3:44.30", FadeOut(dep), run=0.2)
        eq = M("p", "=", r"\hbar", r"\,", "k", size=120)
        eq[0].set_color(MOM); eq[4].set_color(PSI)
        eq.move_to([0, 2.0, 0])
        l = T("momentum", 44, MOM).next_to(eq, LEFT, buff=0.6)
        self.go("3:44.56", FadeIn(eq), FadeIn(l), run=0.5)
        # squeeze the wave: k up, momentum up
        k = ValueTracker(1.3)
        ph = ValueTracker(0)
        ph.add_updater(lambda m, dt: m.increment_value(dt * 4 * k.get_value()))
        self.add(ph)
        w = wave_line(lambda xs: -1.0 + 0.95 * np.sin(k.get_value() * xs - ph.get_value()), -6.5, 3.3, color=PSI, width=4, n=800)
        b = ValueTracker(0.15)
        bar_ = energy_bar("momentum", MOM, 5.2, base=-2.5, h=2.8, tracker=b, size=34)
        kl = T("k: how tightly packed the wave is", 44, PSI).to_edge(DOWN, buff=0.35).shift(LEFT * 1.5)
        self.go("3:47.02", FadeIn(w), FadeIn(bar_), FadeIn(kl), run=0.5)
        self.go("3:50.24", k.animate.set_value(8.0), b.animate.set_value(0.95), run=2.0, rate_func=rate_functions.smooth)
        box = SurroundingRectangle(eq, color=MOM, buff=0.28, corner_radius=0.1)
        self.play(Create(box), run_time=0.4)
        self.at("3:53.65")
        self.clear_all(0.3)


class Diffraction(Shot):
    def body(self):
        cap = T("Experiments confirmed it", 62).to_edge(UP, buff=0.5)
        self.play(FadeIn(cap), run_time=0.4)
        crystal = VGroup(*[Dot([-1.6 + i * 0.32, -2.5 + j * 0.42, 0], radius=0.07, color=POT) for i in range(3) for j in range(11)])
        lab_c = T("crystal", 38, POT).next_to(crystal, DOWN, buff=0.1)
        c0 = np.array([4.3, -0.4, 0])
        panel = Rectangle(width=4.8, height=5.4, fill_color="#10172a", fill_opacity=1, stroke_color=FAINT).move_to(c0)
        gun = T("electrons", 38, PSI).move_to([-5.6, -1.2, 0])
        self.go("3:56.60", FadeIn(crystal), FadeIn(lab_c), FadeIn(panel), FadeIn(gun), run=0.5)
        rng = np.random.default_rng(4)
        # ring pattern on a screen seen face-on, as in electron diffraction photographs
        rs = np.linspace(0.02, 2.35, 900)
        pdf = (np.cos(rs * 5.2) ** 6) * np.exp(-((rs - 0.15) ** 2) / 2.6) * (0.25 + rs)
        pdf = pdf / pdf.sum()
        src = np.array([-6.9, -0.4, 0])
        mid = np.array([-1.3, -0.4, 0])
        flying = VGroup()
        hits = VGroup()
        self.add(flying, hits)
        state = {"t": 0.0, "on": False}

        def fire(m, dt):
            state["t"] += dt
            if state["on"] and state["t"] > 0.008:
                state["t"] = 0
                for _ in range(10):
                    r = rng.choice(rs, p=pdf)
                    a = rng.uniform(0, TAU)
                    d = Dot(radius=0.03, color=PSI).move_to(src)
                    d.age = 0.0
                    d.goal = c0 + np.array([r * np.cos(a), r * np.sin(a), 0])
                    m.add(d)
            for d in list(m):
                d.age += dt
                u = d.age / 0.45
                if u < 0.5:
                    d.move_to(src + (mid - src) * (u / 0.5))
                elif u < 1:
                    d.move_to(mid + (d.goal - mid) * ((u - 0.5) / 0.5))
                else:
                    m.remove(d)
                    hits.add(Dot(d.goal, radius=0.024, color=PSI, fill_opacity=0.72))

        flying.add_updater(fire)
        self.at("3:57.50")
        state["on"] = True
        lab = T("a wave interference pattern", 56, PSI).to_edge(UP, buff=0.5)
        self.go("3:58.64", FadeTransform(cap, lab), run=0.4)
        self.at("4:01.10")
        l2 = T("particles behaving like ripples", 56, INK).to_edge(UP, buff=0.5)
        self.play(FadeTransform(lab, l2), run_time=0.4)


class WhatEq(Shot):
    def body(self):
        clock = tracker_time(self)
        c = 1.8

        def fn(xs):
            x0 = ((clock.get_value() * c + 6) % 14) - 7
            return 0.2 + 1.1 * np.exp(-((xs - x0) ** 2) / 1.8) * np.sin(6 * (xs - x0))

        w = wave_line(fn, -7.5, 7.5, color=PSI, width=4, n=800)
        d = glow_dot(INK, 0.08)
        d.add_updater(lambda m: m.move_to([((clock.get_value() * c + 6) % 14) - 7, 0.2, 0]))
        cap = T("a wave attached to every particle", 62).to_edge(UP, buff=0.6)
        self.play(FadeIn(w), FadeIn(d), FadeIn(cap), run_time=0.6)
        q = T("If the electron is a wave", 66, INK).to_edge(UP, buff=0.6)
        self.go("4:11.86", FadeTransform(cap, q), run=0.4)
        eq = T("what equation does it obey?", 76, EN).to_edge(DOWN, buff=0.7)
        self.go("4:14.12", FadeIn(eq, shift=UP * 0.2), run=0.5)
        self.at("4:16.20")
        self.clear_all(0.25)


class Published(Shot):
    def body(self):
        eq = schrod(78).shift(UP * 0.5)
        self.play(Write(eq), run_time=2.0)
        name = T("the Schrödinger equation", 62, EN).next_to(eq, DOWN, buff=0.7)
        self.go("4:46.70", FadeIn(name), run=0.5)
        cite = TI("Quantisierung als Eigenwertproblem, Annalen der Physik, 1926", 38, DIM).to_edge(DOWN, buff=0.7)
        self.go("4:48.42", FadeIn(cite), run=0.5)
        self.at("4:51.15")
        self.clear_all(0.3)


class LetsBuild(Shot):
    def body(self):
        eq = schrod(78)
        self.play(FadeIn(eq), run_time=0.4)
        self.at("4:58.29")
        rng = np.random.default_rng(2)
        self.play(*[p.animate.shift(np.array([rng.uniform(-7, 7), rng.uniform(-5, 5), 0])).rotate(rng.uniform(-2, 2)).set_opacity(0) for p in eq], run_time=1.5, rate_func=rate_functions.ease_in_quad)
        self.remove(eq)
        t = T("Let's build it.", 100, EN)
        self.go("5:00.45", FadeIn(t, scale=1.1), run=0.35)
        self.at("5:01.40")
        self.play(FadeOut(t), run_time=0.3)
