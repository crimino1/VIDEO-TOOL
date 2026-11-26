from sc_lib import *

WORDS = {"electric": GOLD, "magnetic": CYAN}  # also colours electricity / magnetism


def icon_spray(clock):
    core = VGroup(glow_dot(GOLD, 0.11), T("+", 24, "#05101c", weight=BOLD))
    parts = VGroup(*[Dot(radius=0.04, color=GOLD) for _ in range(10)])
    angs = np.linspace(0, TAU, 10, endpoint=False)
    g = VGroup(parts, core)

    def up(m):
        t = clock.get_value()
        c = core.get_center()
        for i, d in enumerate(parts):
            f = (t * 0.9 + i * 0.37) % 1
            d.move_to(c + (0.16 + 0.42 * f) * np.array([np.cos(angs[i]), np.sin(angs[i]), 0]))
            d.set_opacity(1 - f)

    parts.add_updater(up)
    return g


def icon_loops(clock):
    mag = bar_magnet(0.8, 0.22)
    VGroup(*mag[2:]).set_opacity(0)
    loops = VGroup(Ellipse(width=1.0, height=0.62, color=CYAN, stroke_width=3).shift(UP * 0.2),
                   Ellipse(width=1.0, height=0.62, color=CYAN, stroke_width=3).shift(DOWN * 0.2))
    dots = VGroup(Dot(radius=0.05, color=WHITE), Dot(radius=0.05, color=WHITE))

    def up(m):
        t = clock.get_value()
        for d, l in zip(dots, loops):
            d.move_to(l.point_from_proportion((t * 0.35) % 1))

    dots.add_updater(up)
    return VGroup(loops, mag, dots)


def icon_coil(clock):
    coil = VGroup(*[Ellipse(width=0.17, height=0.62, color=GOLD, stroke_width=3).shift(RIGHT * (0.12 + 0.13 * i)) for i in range(3)])
    mag = bar_magnet(0.55, 0.18)
    VGroup(*mag[2:]).set_opacity(0)
    x0 = -0.3

    def up(m):
        m.move_to([coil.get_center()[0] + x0 + 0.22 * np.sin(2.4 * clock.get_value()), coil.get_center()[1], 0])

    g = VGroup(mag, coil)
    mag.add_updater(up)
    return g


def icon_wire(clock):
    wire = Line(DOWN * 0.45, UP * 0.45, color=GOLD, stroke_width=5)
    loop = Ellipse(width=0.85, height=0.28, color=CYAN, stroke_width=3)
    d = Dot(radius=0.05, color=WHITE)
    d.add_updater(lambda m: m.move_to(loop.point_from_proportion((clock.get_value() * 0.45) % 1)))
    return VGroup(loop, wire, d)


class Recap(Shot):
    def body(self):
        clock = tracker_time(self)
        push(self, 0.975)
        lab = label("One more time")
        ys = [2.35, 0.8, -0.75, -2.3]
        panels = VGroup(*[RoundedRectangle(corner_radius=0.18, width=13.5, height=1.36, fill_color=FAINT, fill_opacity=0.35, stroke_width=0).move_to([0, y, 0]) for y in ys])
        self.play(FadeIn(lab), LaggedStart(*[FadeIn(p) for p in panels], lag_ratio=0.3), run_time=1.0)
        data = [("1", GOLD, icon_spray, "charges push out\nan electric field", "7:54.40"),
                ("2", CYAN, icon_loops, "magnetic field lines\nalways loop", "7:58.20"),
                ("3", GOLD, icon_coil, "a changing magnetic field\nmakes electricity", "8:03.75"),
                ("4", CYAN, icon_wire, "electricity & a changing\nelectric field make magnetism", "8:07.60")]
        for i, (n, col, ic, txt, t) in enumerate(data):
            y = ys[i]
            num = T(n, 76, col, weight=BOLD).move_to([-6.15, y, 0])
            icon = ic(clock).move_to([-4.85, y, 0])
            words = Text(txt, font=SANS, font_size=32, color=INK, t2c=WORDS, line_spacing=0.9)
            if words.width > 5.4:
                words.width = 5.4
            words.move_to([-4.05, y, 0], aligned_edge=LEFT)
            e = eq(i, 38)
            e.move_to([6.55, y, 0], aligned_edge=RIGHT)
            eg = glow(e.copy(), layers=3, opacity=0.05)[:-1]
            row = VGroup(num, icon, words)
            self.go(t, FadeIn(row, shift=RIGHT * 0.6, scale=0.92), run=0.5, rate_func=rate_functions.ease_out_back)
            self.play(FadeIn(e, scale=0.9), FadeIn(eg), run_time=0.4)


class Final(Shot):
    def body(self):
        clock = tracker_time(self)
        push(self, 0.955)
        pc = np.array([0, 0.35, 0])
        pic = portrait("maxwell", 4.5).move_to(pc)
        halo = glow(SurroundingRectangle(pic[0], buff=0, color=GOLD, stroke_width=3), layers=5, opacity=0.06)[:-1]
        self.play(FadeIn(pic, scale=0.96), FadeIn(halo), run_time=0.6)
        d = doodle("a man from\nScotland", [4.7, -0.55, 0], pic.get_right() + DOWN * 0.45 + RIGHT * 0.12, INK, size=46, angle=-0.5)
        self.go("8:26.38", Write(d[0]), Create(d[1]), run=0.5)
        spots = [(-4.7, 2.15), (4.7, 2.15), (-4.7, -0.75), (0, -3.05)]
        eqs = []
        for i, (x, y) in enumerate(spots):
            e = eq(i, 54 if i < 3 else 50)
            g = VGroup(glow(e.copy(), layers=4, opacity=0.06)[:-1], e).move_to([x, y, 0])
            base, ph = g.get_center().copy(), i * 1.7
            g.add_updater(lambda m, b=base, p=ph: m.move_to(b + 0.1 * np.array([np.cos(0.9 * clock.get_value() + p), np.sin(1.1 * clock.get_value() + p), 0])))
            eqs.append(g)
        # soft gold light wave that crosses the frame
        xc = ValueTracker(-11)
        lw = gwave(lambda xs: 0.9 + 0.65 * np.exp(-((xs - xc.get_value()) / 2.0) ** 2) * np.sin(2.6 * xs - 9 * clock.get_value()), -8, 8, GOLD, 6, 600)
        gx = np.linspace(-8, 8, 33)

        def fade_ends(m):
            env = np.exp(-((gx - xc.get_value()) / 2.6) ** 2)
            for layer, o in zip(m, (0.08, 0.16, 1)):
                layer.set_sheen_direction(RIGHT)
                layer.set_stroke(opacity=list(o * env))

        lw.add_updater(fade_ends)
        for t, g in zip(("8:27.05", "8:28.00", "8:28.93", "8:29.55"), eqs):
            self.at(t)
            if t == "8:28.93":
                self.add(lw)
                xc.add_updater(lambda m, dt: m.increment_value(12.5 * dt))
                self.add(xc)
                self.play(FadeIn(g, scale=0.9), run_time=0.5)
            else:
                self.play(FadeIn(g, scale=0.9), run_time=0.5)
