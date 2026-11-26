from common import *


def packet(xs, x0=0.0, s=1.9, k=3.4):
    return np.exp(-((xs - x0) ** 2) / (2 * s * s)) * np.cos(k * (xs - x0))


class WhatWave(Shot):
    def body(self):
        short = M(r"i\hbar", r"\frac{\partial \psi}{\partial t}", "=", r"\hat{H}", r"\psi", size=96).to_edge(UP, buff=0.7)
        self.add(short)
        solve = T("We can solve it.", 56, DIM).next_to(short, DOWN, buff=0.4)
        self.go("8:26.86", FadeIn(solve), run=0.3)
        clock = tracker_time(self)
        w = wave_line(lambda xs: -1.1 + 1.0 * np.cos(2.4 * xs - 3 * clock.get_value()) * np.exp(-(xs ** 2) / 22), -6.5, 6.5, color=PSI, width=4, n=700)
        self.go("8:28.00", FadeIn(w), run=0.5)
        q = T("What is this wave?", 92, EN).shift(DOWN * 0.0)
        self.go("8:31.38", FadeOut(solve), FadeOut(short), w.animate.set_stroke(opacity=0.35), FadeIn(q), run=0.4)


class AirWave(Shot):
    def body(self):
        clock = tracker_time(self)
        rng = np.random.default_rng(7)
        n = 900
        x0 = rng.uniform(-7.6, 7.6, n)
        y0 = rng.uniform(-2.8, 2.8, n)
        ds = VGroup(*[Dot([x0[i], y0[i], 0], radius=0.032, color=POT) for i in range(n)])

        def up(m):
            t = clock.get_value()
            for i, d in enumerate(m):
                d.move_to([x0[i] + 0.34 * np.sin(2.2 * x0[i] - 7 * t), y0[i], 0])

        ds.add_updater(up)
        l = plate(T("A sound wave is air moving", 66)).to_edge(UP, buff=0.35).set_z_index(5)
        self.play(FadeIn(ds), FadeIn(l), run_time=0.35)
        self.go("8:37.60", FadeOut(l), ds.animate.set_opacity(0.0), run=0.25)
        ds.clear_updaters()
        self.remove(ds)
        q = VGroup(T("What is", 92), M(r"\psi", size=120, color=PSI), T("made of?", 92)).arrange(RIGHT, buff=0.35)
        self.play(FadeIn(q), run_time=0.3)


class Cloud(Shot):
    def body(self):
        rng = np.random.default_rng(3)
        n = 2600
        r = rng.gamma(2.2, 0.62, n)
        a = rng.uniform(0, TAU, n)
        pts = np.column_stack([r * np.cos(a), r * np.sin(a), 0 * r])
        cl = VGroup(*[Dot(p, radius=0.024, color=PSI, fill_opacity=0.8) for p in pts])
        nu = nucleus(0.2)
        lab = T("Schrödinger's hope: a smeared-out electron", 56).to_edge(UP, buff=0.45)
        self.play(FadeIn(nu), FadeIn(lab), LaggedStart(*[FadeIn(d) for d in cl[::1]], lag_ratio=0.0002), run_time=1.6)
        c2 = T("like a cloud of charge", 56, PSI).to_edge(DOWN, buff=0.5)
        self.go("8:43.32", FadeIn(c2), run=0.4)
        self.at("8:44.75")
        self.play(FadeOut(VGroup(cl, nu, lab, c2)), run_time=0.28)


class Possibility(Shot):
    def body(self):
        clock = tracker_time(self)
        a = T("Not a wave of stuff.", 72, DIM)
        self.play(FadeIn(a), run_time=0.3)
        b = T("A wave of possibility.", 86, PSI)
        self.go("8:53.55", FadeTransform(a, b), run=0.45)
        self.go("8:55.45", FadeOut(b), run=0.25)
        y1, y2 = 1.65, -2.6
        A1, A2 = 1.25, 2.3
        s = 2.1
        xs = np.linspace(-6.4, 6.4, 900)
        psi = packet(xs, 0, s, 2.15)
        c1 = VMobject(stroke_color=PSI, stroke_width=4).set_points_as_corners(np.column_stack([xs, y1 + A1 * psi, 0 * xs]))
        lab1 = M(r"\psi", size=66, color=PSI).move_to([-6.2, y1 + 1.1, 0])
        ax1 = Line([-6.6, y1, 0], [6.6, y1, 0], color=FAINT, stroke_width=2)
        ax2 = Line([-6.6, y2, 0], [6.6, y2, 0], color=FAINT, stroke_width=2)
        self.play(FadeIn(ax1), Create(c1), FadeIn(lab1), run_time=0.45)
        # probe at one point
        px = 0.05
        v = DashedLine([px, y1, 0], [px, y1 + A1 * packet(np.array([px]), 0, s, 2.15)[0], 0], color=EN, stroke_width=4)
        self.go("8:56.60", Create(v), run=0.35)
        # squared curve filling in below
        pts2 = np.column_stack([xs, y2 + A2 * psi ** 2, 0 * xs])
        c2 = VMobject(stroke_color=EN, stroke_width=4).set_points_as_corners(pts2)
        fill = VMobject(fill_color=EN, fill_opacity=0.2, stroke_width=0).set_points_as_corners(np.vstack([[xs[0], y2, 0], pts2, [xs[-1], y2, 0], [xs[0], y2, 0]]))
        form = M(r"P", "=", r"|\psi|^2", size=76).move_to([4.2, 0.05, 0])
        form[0].set_color(EN); form[2].set_color(EN)
        self.go("8:58.22", FadeIn(ax2), Create(c2), FadeIn(fill), Write(form), run=0.7)
        prob = T("probability of finding it here", 38, EN).next_to(form, DOWN, buff=0.1).set_x(4.2)
        self.play(FadeIn(prob), run_time=0.3)
        # detections landing according to the squared curve
        rng = np.random.default_rng(12)
        pdf = psi ** 2 / (psi ** 2).sum()
        hits = VGroup()
        self.add(hits)
        state = {"t": 0, "on": False}

        def rain(m, dt):
            state["t"] += dt
            if state["on"] and state["t"] > 0.02:
                state["t"] = 0
                x = rng.choice(xs, p=pdf)
                m.add(Dot([x, y2 - 0.22 - rng.uniform(0, 0.5), 0], radius=0.027, color=INK, fill_opacity=0.85))

        hits.add_updater(rain)
        state["on"] = True
        # three markers
        def mark(x, txt, col, t):
            yv = y2 + A2 * packet(np.array([x]), 0, s, 2.15)[0] ** 2
            d = Dot([x, yv, 0], radius=0.11, color=col)
            l = T(txt, 44, col).move_to([x, yv + 0.45, 0])
            self.go(t, FadeIn(d, scale=2), FadeIn(l), run=0.3)
            return VGroup(d, l)

        self.go("9:02.60", FadeOut(prob), FadeOut(form), FadeOut(v), run=0.25)
        mark(0.05, "big: likely", GOOD, "9:02.94")
        xs_small = -2.82
        ys_small = y2 + A2 * packet(np.array([xs_small]), 0, s, 2.15)[0] ** 2
        d1 = Dot([xs_small, ys_small, 0], radius=0.11, color=EN)
        l1 = T("small: unlikely", 44, EN).move_to([-4.6, y2 + 1.05, 0])
        ln1 = Line(l1.get_bottom() + RIGHT * 0.5, d1.get_center(), color=EN, stroke_width=2)
        self.go("9:06.88", FadeIn(d1, scale=2), FadeIn(l1), Create(ln1), run=0.3)
        node = np.pi / 2 / 2.15
        d0 = Dot([node, y2, 0], radius=0.11, color=RED)
        l0 = T("zero: never", 44, RED).move_to([3.7, y2 + 1.05, 0])
        ln0 = Line(l0.get_left() + LEFT * 0.05 + DOWN * 0.1, d0.get_center(), color=RED, stroke_width=2)
        self.go("9:09.44", FadeIn(d0, scale=2), FadeIn(l0), Create(ln0), run=0.3)
        self.at("9:11.55")
        state["on"] = False
        hits.clear_updaters()
        self.clear_all(0.3)


class NoSpot(Shot):
    def body(self):
        a = T("Let that sink in.", 72)
        self.play(FadeIn(a), run_time=0.3)
        # a hidden particle with a question mark: wrong picture
        self.go("9:13.05", FadeOut(a), run=0.2)
        fog = VGroup(*[Circle(radius=0.15 + i * 0.1, stroke_width=0, fill_color=PSI, fill_opacity=0.022) for i in range(24)])
        d = Dot(radius=0.11, color=INK)
        q = T("a hidden spot?", 54).next_to(fog, UP, buff=0.25)
        self.play(FadeIn(fog), FadeIn(d), FadeIn(q), run_time=0.45)
        s = Cross(d, stroke_color=RED, stroke_width=7, scale_factor=5)
        self.go("9:15.64", Create(s), run=0.35)
        # the cloud: no definite spot
        rng = np.random.default_rng(9)

        def cloud():
            n = 1300
            xy = rng.normal(0, 1.05, (n, 2))
            return VGroup(*[Dot([p[0], p[1] * 0.85, 0], radius=0.026, color=PSI, fill_opacity=0.8) for p in xy])

        c = cloud()
        l2 = T("no definite spot at all", 58, PSI).to_edge(UP, buff=0.5)
        self.go("9:17.00", FadeOut(VGroup(d, s, q, fog)), FadeIn(c), FadeIn(l2), run=0.7)
        l3 = T("until you measure it", 58).to_edge(UP, buff=0.5)
        self.go("9:22.28", FadeTransform(l2, l3), run=0.4)
        # click: one place. Repeat with fresh clouds, different places.
        spots = [np.array([1.25, 0.5, 0]), np.array([-0.85, -0.75, 0]), np.array([0.25, 1.05, 0])]
        times = ["9:24.14", "9:26.74", "9:28.10"]
        old = c
        for i, (p, t) in enumerate(zip(spots, times)):
            hit = glow_dot(EN, 0.12).move_to(p)
            self.go(t, *[m.animate.move_to(p).set_opacity(0) for m in old[::1]], FadeIn(hit, scale=3), run=0.28)
            self.remove(old)
            if i == 0:
                self.play(FadeTransform(l3, T("click. One place.", 62, EN).to_edge(UP, buff=0.5)), run_time=0.25)
            if i < 2:
                old = cloud()
                self.play(FadeIn(old), run_time=0.2)
        self.at("9:28.95")
        self.clear_all(0.25)


class Cat(Shot):
    def body(self):
        # sealed box seen in cutaway
        box = RoundedRectangle(width=9.0, height=4.8, corner_radius=0.08, stroke_color=INK, stroke_width=5).shift(DOWN * 0.45)
        cap = T("A cat in a sealed box", 58).to_edge(UP, buff=0.4)
        cat = SVGMobject(os.path.join(ROOT, "assets", "cat_sit.svg"), height=2.7).set_fill(INK, 1).set_stroke(width=0).move_to([2.4, -1.45, 0]).align_to(box, DOWN).shift(UP * 0.06)
        eyes = VGroup(*[Dot(cat.get_center() + [dx, cat.height * 0.215, 0], radius=0.06, color=BG) for dx in (-0.3, 0.2)])
        self.play(Create(box), FadeIn(cap), run_time=0.6)
        self.play(FadeIn(cat), FadeIn(eyes), run_time=0.4)
        # the radioactive atom
        at = VGroup(nucleus(0.26)).move_to([-3.2, 0.9, 0])
        al = T("one radioactive atom", 38, EN).next_to(at, RIGHT, buff=0.25)
        self.go("9:48.94", FadeIn(at, scale=1.5), FadeIn(al), run=0.4)
        q = T("may or may not decay", 44, EN).next_to(al, DOWN, buff=0.1, aligned_edge=LEFT)
        self.go("9:51.00", FadeIn(q), run=0.3)
        # mechanism
        det = RoundedRectangle(width=1.1, height=0.7, corner_radius=0.08, stroke_color=DIM, fill_color="#1a2233", fill_opacity=1).move_to([-3.2, -0.55, 0])
        wire = Line(at.get_bottom(), det.get_top(), color=DIM, stroke_width=3)
        ham = Line(det.get_right(), [-1.0, -1.7, 0], color=DIM, stroke_width=4)
        vial = RoundedRectangle(width=0.5, height=0.9, corner_radius=0.1, stroke_color=POT, fill_color=POT, fill_opacity=0.25).move_to([-0.7, -2.1, 0])
        ml = T("a mechanism", 36, DIM).next_to(det, DOWN, buff=0.12)
        self.go("9:52.90", FadeIn(det), Create(wire), Create(ham), FadeIn(vial), FadeIn(ml), FadeOut(q), run=0.6)
        # alive and not: both, drawn as overlapping ghosts
        self.go("9:56.92", FadeOut(cap), run=0.3)
        lab = T("until someone looks", 62, INK).to_edge(UP, buff=0.4)
        self.play(FadeIn(lab), run_time=0.3)
        mix = T("decayed + not decayed", 44, PSI).next_to(al, DOWN, buff=0.1, aligned_edge=LEFT)
        ghost_at = VGroup(*[Circle(radius=0.3 + i * 0.12, stroke_color=PSI, stroke_width=2, stroke_opacity=0.5 - i * 0.1) for i in range(4)]).move_to(at)
        self.go("10:00.26", FadeIn(mix), FadeIn(ghost_at), run=0.5)
        lie = SVGMobject(os.path.join(ROOT, "assets", "cat_lie.svg")).set_fill(MOM, 0.0).set_stroke(width=0)
        lie.width = 3.0
        lie.move_to([2.5, 0, 0]).align_to(box, DOWN).shift(UP * 0.06)
        self.add(lie)
        l2 = T("So is the cat.", 66, EN).to_edge(UP, buff=0.4)
        self.go("10:03.64", FadeTransform(lab, l2), cat.animate.set_fill(PSI, 0.5), lie.animate.set_fill(MOM, 0.5), FadeOut(eyes), run=0.7)
        both = T("Somehow, both?", 54, INK).move_to([2.0, 1.42, 0])
        self.go("10:04.78", FadeIn(both), run=0.4)
        l3 = T("He meant it as a criticism.", 62).to_edge(UP, buff=0.4)
        self.go("10:06.66", FadeTransform(l2, l3), FadeOut(both), run=0.4)
        l4 = TI("“Look how ridiculous this is.”", 62).to_edge(UP, buff=0.4)
        self.go("10:08.34", FadeTransform(l3, l4), run=0.35)
        l5 = T("The most famous image in quantum physics", 60, EN).to_edge(UP, buff=0.4)
        self.go("10:10.56", FadeTransform(l4, l5), run=0.4)
        self.at("10:14.35")
        self.clear_all(0.3)
