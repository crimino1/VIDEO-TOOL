from common import *


def orbital_image(kind, half=26.0, px=720, gain=1.0):
    """Hydrogen |psi|^2 in the x-z plane, computed from the exact wavefunctions (a0 = 1)."""
    v = np.linspace(-half, half, px)
    x, z = np.meshgrid(v, -v)
    r = np.sqrt(x * x + z * z) + 1e-6
    if kind == "1s": psi = np.exp(-r)
    elif kind == "2s": psi = (2 - r) * np.exp(-r / 2)
    elif kind == "2p": psi = z * np.exp(-r / 2)
    elif kind == "3p": psi = z * (6 - r) * np.exp(-r / 3)
    elif kind == "3d": psi = (3 * z * z - r * r) * np.exp(-r / 3)
    else: raise ValueError(kind)
    d = psi * psi
    d = d / d.max()
    d = np.clip(d * gain, 0, 1) ** 0.3
    edge = np.clip((half - r) / (half * 0.35), 0, 1)
    d = d * edge * edge * (3 - 2 * edge)
    # teal to near white on a transparent ground
    col = np.array([0x4f, 0xd1, 0xc5]) / 255
    rgb = col[None, None, :] * (1 - d[..., None] ** 3) + d[..., None] ** 3
    a = np.dstack([rgb, d])
    return (a * 255).astype(np.uint8)


def orbital(kind, height=2.6, half=26.0, gain=1.0):
    im = ImageMobject(orbital_image(kind, half, gain=gain))
    im.set_resampling_algorithm(RESAMPLING_ALGORITHMS["bilinear"]) if hasattr(im, "set_resampling_algorithm") else None
    im.height = height
    return im


class Recap(Shot):
    def body(self):
        cap = T("The mystery we started with", 58).to_edge(UP, buff=0.5)
        self.play(FadeIn(cap), run_time=0.4)
        xs = [-4.6, 0, 4.6]
        # broken atom
        base, e = atom(R=1.15, nuc_r=0.2, orbit_color="#3a4660")
        pts = [[1.15 * (1 - t / 3.2) * np.cos(t * 3), 1.15 * (1 - t / 3.2) * np.sin(t * 3), 0] for t in np.linspace(0, 3.15, 120)]
        sp = VMobject(stroke_color=RED, stroke_width=3).set_points_smoothly(pts)
        a = VGroup(base[1], sp).move_to([xs[0], 0.2, 0])
        la = T("the broken atom", 44, RED).next_to(a, DOWN, buff=0.45).set_y(-1.9)
        self.go("10:22.04", FadeIn(a), FadeIn(la), run=0.5)
        st = staircase(4, 0.6, 0.5, np.array([0, 0, 0])).move_to([xs[1], 0.2, 0])
        lb = T("the staircase", 44, PSI).set_y(-1.9).set_x(xs[1])
        self.go("10:23.34", Create(st), FadeIn(lb), run=0.5)
        bc = balmer_lines(y=0.2, h=1.9, x0=xs[2] - 1.5, x1=xs[2] + 1.5, w=0.06)
        fr = Rectangle(width=3.2, height=1.9, stroke_color=FAINT, stroke_width=2).move_to([xs[2], 0.2, 0])
        lc = T("the barcode", 44, EN).set_y(-1.9).set_x(xs[2])
        self.go("10:25.10", FadeIn(fr), FadeIn(bc), FadeIn(lc), run=0.5)
        eq = schrod(46).to_edge(DOWN, buff=0.35)
        self.go("10:26.70", FadeTransform(cap, T("Our equation solves all three", 58, EN).to_edge(UP, buff=0.5)), FadeIn(eq), run=0.5)
        self.at("10:29.70")
        self.clear_all(0.3)


class GuitarString(Shot):
    def body(self):
        clock = tracker_time(self)
        L0, L1 = -5.6, 5.6
        n = ValueTracker(0.0)
        amp = ValueTracker(0.0)
        y0 = -0.1

        def fn(xs):
            u = (xs - L0) / (L1 - L0)
            return y0 + amp.get_value() * np.cos(6 * clock.get_value()) * np.sin(n.get_value() * np.pi * u)

        s = wave_line(fn, L0, L1, color=INK, width=5, n=500)
        env1 = wave_line(lambda xs: y0 + amp.get_value() * np.sin(n.get_value() * np.pi * (xs - L0) / (L1 - L0)), L0, L1, color=DIM, width=1.6, n=240, stroke_opacity=0.55)
        env2 = wave_line(lambda xs: y0 - amp.get_value() * np.sin(n.get_value() * np.pi * (xs - L0) / (L1 - L0)), L0, L1, color=DIM, width=1.6, n=240, stroke_opacity=0.55)
        self.add(env1, env2)
        pegs = VGroup(*[Rectangle(width=0.2, height=1.5, fill_color=DIM, fill_opacity=1, stroke_width=0).move_to([x, y0, 0]) for x in (L0 - 0.1, L1 + 0.1)])
        self.play(FadeIn(pegs), FadeIn(s), run_time=0.4)
        cap = T("Tied down at both ends", 62).to_edge(UP, buff=0.5)
        self.play(FadeIn(cap), run_time=0.4)
        l2 = T("so it can't vibrate any way it likes", 58, DIM).to_edge(UP, buff=0.5)
        self.go("10:34.40", FadeTransform(cap, l2), run=0.4)
        n.set_value(1)
        self.go("10:37.00", FadeOut(l2), amp.animate.set_value(1.6), run=0.25)
        big = T("one hump", 72, PSI).to_edge(UP, buff=0.5)
        self.go("10:37.22", FadeIn(big), run=0.2)
        for t, val, txt, col in [("10:38.76", 2, "two humps", PSI), ("10:39.88", 3, "three", PSI)]:
            b2 = T(txt, 72, col).to_edge(UP, buff=0.5)
            self.go(t, n.animate.set_value(val), FadeTransform(big, b2), run=0.3)
            big = b2
        bad = T("never two and a half", 72, RED).to_edge(UP, buff=0.5)
        self.go("10:41.34", n.animate.set_value(2.5), FadeTransform(big, bad), run=0.45)
        x = Cross(Dot([L1, y0, 0], radius=0.42), stroke_color=RED, stroke_width=8)
        self.play(Create(x), run_time=0.3)
        fix = T("the ends have to stay fixed", 66, INK).to_edge(UP, buff=0.5)
        self.go("10:43.10", n.animate.set_value(2), FadeOut(x), FadeTransform(bad, fix), run=0.4)
        notes = T("specific notes", 72, EN).to_edge(UP, buff=0.5)
        self.go("10:45.12", FadeTransform(fix, notes), run=0.35)
        self.go("10:47.72", FadeTransform(notes, T("not every possible sound", 66, DIM).to_edge(UP, buff=0.5)), run=0.4)
        self.at("10:49.30")
        self.clear_all(0.3)


class ParticleBox(Shot):
    def body(self):
        clock = tracker_time(self)
        # the well on the left, its levels on the right
        L0, L1 = -6.2, -0.9
        wl = Line([L0, -3.0, 0], [L0, 2.9, 0], color=INK, stroke_width=7)
        wr = Line([L1, -3.0, 0], [L1, 2.9, 0], color=INK, stroke_width=7)
        floor = Line([L0, -3.0, 0], [L1, -3.0, 0], color=FAINT, stroke_width=3)
        self.play(Create(wl), Create(wr), Create(floor), run_time=0.5)
        cap = T("Trap an electron between two walls", 56).to_edge(UP, buff=0.3)
        self.play(FadeIn(cap), run_time=0.3)
        d = glow_dot(PSI, 0.09)
        d.add_updater(lambda m: m.move_to([(L0 + L1) / 2 + 2.3 * np.sin(clock.get_value() * 5), -1.5, 0]))
        self.add(d)
        eq = schrod(44).move_to([3.3, 1.0, 0])
        sv = T("solve it", 44, EN).next_to(eq, UP, buff=0.3)
        self.go("10:52.66", FadeIn(sv), Write(eq), run=0.9)
        n = ValueTracker(1)
        amp = ValueTracker(0.0)
        y0 = -1.4

        def fn(xs):
            u = (xs - L0) / (L1 - L0)
            return y0 + amp.get_value() * np.cos(5 * clock.get_value()) * np.sin(n.get_value() * np.pi * u)

        w = wave_line(fn, L0, L1, color=PSI, width=5, n=400)
        env1 = wave_line(lambda xs: y0 + amp.get_value() * np.sin(n.get_value() * np.pi * (xs - L0) / (L1 - L0)), L0, L1, color=PSI, width=1.5, n=240, stroke_opacity=0.4)
        env2 = wave_line(lambda xs: y0 - amp.get_value() * np.sin(n.get_value() * np.pi * (xs - L0) / (L1 - L0)), L0, L1, color=PSI, width=1.5, n=240, stroke_opacity=0.4)
        self.add(env1, env2, w)
        c2 = T("The wave has to fit perfectly inside", 56, PSI).to_edge(UP, buff=0.3)
        self.go("10:56.62", d.animate.set_opacity(0), amp.animate.set_value(1.25), FadeTransform(cap, c2), run=0.5)
        self.remove(d)
        d.clear_updaters()
        # levels: heights scale with n^2
        self.go("11:00.20", FadeOut(eq), FadeOut(sv), run=0.2)
        base = -2.7
        unit = 5.0 / 16
        lx0, lx1 = 0.5, 4.6
        lv = {}
        lbl = {}
        for i in (1, 2, 3, 4):
            y = base + unit * i * i
            lv[i] = Line([lx0, y, 0], [lx1, y, 0], color=EN, stroke_width=4)
            lbl[i] = M(str(i * i), size=62, color=EN).next_to(lv[i], RIGHT, buff=0.3)
        ly = T("energy", 42, EN).rotate(PI / 2).move_to([0.0, 0.0, 0])
        floor2 = Line([lx0, base, 0], [lx1, base, 0], color=FAINT, stroke_width=2)
        self.play(FadeIn(ly), FadeIn(floor2), run_time=0.15)
        self.go("11:00.38", Create(lv[1]), run=0.3)
        self.go("11:01.30", n.animate.set_value(2), Create(lv[2]), run=0.35)
        self.go("11:02.30", n.animate.set_value(3), Create(lv[3]), run=0.35)
        c3 = T("Each fit has its own energy", 56, EN).to_edge(UP, buff=0.3)
        self.go("11:03.20", FadeTransform(c2, c3), run=0.35)
        c4 = T("Energy comes in steps", 60, EN).to_edge(UP, buff=0.3)
        self.go("11:05.64", FadeTransform(c3, c4), n.animate.set_value(4), Create(lv[4]), run=0.45)
        self.go("11:07.60", FadeIn(lbl[1], scale=1.5), n.animate.set_value(1), run=0.25)
        self.go("11:08.25", FadeIn(lbl[2], scale=1.5), n.animate.set_value(2), run=0.25)
        self.go("11:09.02", FadeIn(lbl[3], scale=1.5), n.animate.set_value(3), run=0.25)
        self.go("11:09.82", FadeIn(lbl[4], scale=1.5), n.animate.set_value(4), run=0.25)
        c5 = T("Nothing in between", 60, RED).to_edge(UP, buff=0.3)
        self.go("11:10.92", FadeTransform(c4, c5), run=0.35)
        c6 = T("It falls straight out of the wave equation", 56, INK).to_edge(UP, buff=0.3)
        self.go("11:15.14", FadeTransform(c5, c6), run=0.4)
        self.at("11:17.85")
        amp.clear_updaters()
        self.clear_all(0.3)


class Orbitals(Shot):
    def body(self):
        clock = tracker_time(self)
        nu = nucleus(0.24)
        # 1/r well: wave held by the pull of the nucleus
        cap = T("Inside an atom, the pull of the nucleus traps the wave", 52).to_edge(UP, buff=0.4)
        rings = VGroup(*[Circle(radius=0.6 + i * 0.55, stroke_color=POT, stroke_width=2, stroke_opacity=0.55 - i * 0.08) for i in range(6)])
        self.play(FadeIn(nu), FadeIn(cap), run_time=0.5)
        self.play(LaggedStart(*[Create(r) for r in rings], lag_ratio=0.15), run_time=1.0)
        same = T("Same idea.", 62, EN).to_edge(DOWN, buff=0.6)
        self.go("11:23.77", FadeIn(same), run=0.3)
        fit = T("Only certain wave shapes fit.", 62, PSI).to_edge(DOWN, buff=0.6)
        self.go("11:25.13", FadeTransform(same, fit), FadeOut(rings), FadeOut(nu), run=0.4)
        self.go("11:27.00", FadeOut(cap), FadeOut(fit), run=0.25)
        specs = [("1s", 5.0, 1.0), ("2s", 13.0, 1.0), ("2p", 13.0, 1.0), ("3p", 24.0, 1.0), ("3d", 24.0, 1.0)]
        xs = [-5.4, -2.7, 0, 2.7, 5.4]
        ims = []
        labs = []
        for (k, half, gain), x in zip(specs, xs):
            im = orbital(k, 2.7, half, gain).move_to([x, 0.25, 0])
            lab = T(k, 44, DIM).move_to([x, -1.6, 0])
            ims.append(im); labs.append(lab)
        c = T("the orbitals in your chemistry book", 60).to_edge(UP, buff=0.55)
        self.play(FadeIn(c), run_time=0.3)
        self.play(LaggedStart(*[FadeIn(i, scale=0.85) for i in ims], lag_ratio=0.25), LaggedStart(*[FadeIn(l) for l in labs], lag_ratio=0.25), run_time=1.7)
        note = T("calculated from the equation: hydrogen, slice through the nucleus", 32, DIM).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(note), run_time=0.3)


class LowestStep(Shot):
    def body(self):
        o = np.array([-6.2, -2.7, 0])
        st = staircase(4, 1.25, 1.1, o)
        self.play(Create(st), run_time=0.6)
        ball = glow_dot(PSI, 0.1).move_to(o + [0.6, 0.18, 0])
        lab = T("the lowest step", 46, PSI).move_to(o + [1.0, -0.35, 0]).shift(RIGHT * 0.5)
        self.go("11:33.09", FadeIn(ball, scale=2), FadeIn(lab), run=0.4)
        im = orbital("1s", 4.3, 5.0).move_to([3.4, 0.25, 0])
        l2 = T("the lowest energy wave", 50, PSI).next_to(im, DOWN, buff=0.05)
        self.go("11:34.65", FadeIn(im), FadeIn(l2), run=0.6)
        c = T("It can't go any lower", 62, EN).to_edge(UP, buff=0.45)
        self.go("11:36.61", FadeIn(c), run=0.4)
        c2 = T("No smaller wave fits", 62, EN).to_edge(UP, buff=0.45)
        self.go("11:39.37", FadeTransform(c, c2), run=0.4)
        c3 = T("That's why atoms don't collapse.", 72).to_edge(UP, buff=0.45)
        self.go("11:42.23", FadeTransform(c2, c3), run=0.5)
        # the old picture crossed out
        pts = [[1.6 * (1 - t / 3.3) * np.cos(t * 3.2), 1.6 * (1 - t / 3.3) * np.sin(t * 3.2), 0] for t in np.linspace(0, 3.25, 200)]
        sp = VMobject(stroke_color=DIM, stroke_width=3).set_points_smoothly(pts).move_to([-3.6, 0.1, 0])
        nu = nucleus(0.18).move_to(sp.get_center())
        self.go("11:44.21", FadeOut(st), FadeOut(ball), FadeOut(lab), FadeIn(sp), FadeIn(nu), run=0.5)
        x = Cross(VGroup(sp), stroke_color=RED, stroke_width=8, scale_factor=0.85)
        l3 = T("not a tiny planet", 50, RED).move_to([-3.6, -2.2, 0])
        self.play(Create(x), FadeIn(l3), run_time=0.45)
        l4 = T("a wave with nowhere lower to go", 44, PSI).set_width(6.7).next_to(im, DOWN, buff=0.05).set_x(3.5)
        self.go("11:47.61", FadeTransform(l2, l4), run=0.4)
        self.at("11:50.25")
        self.clear_all(0.28)


class Jump(Shot):
    def body(self):
        clock = tracker_time(self)
        base, top = -2.9, 2.3
        En = lambda n: -13.6 / n ** 2
        ymap = lambda n: base + (En(n) - En(2)) / (0 - En(2)) * (top - base)
        x0, x1 = -6.4, -2.0
        levels = {n: Line([x0, ymap(n), 0], [x1, ymap(n), 0], color=EN, stroke_width=3.5) for n in (2, 3, 4, 5, 6)}
        names = VGroup(*[T(f"n = {n}", 30, DIM).next_to(levels[n], LEFT, buff=0.08) for n in (2, 3, 4)])
        self.play(*[Create(l) for l in levels.values()], run_time=0.5)
        e = glow_dot(PSI, 0.1).move_to([-3.4, ymap(3), 0])
        self.play(FadeIn(e), run_time=0.15)
        # the barcode on the right fills in
        sx0, sx1 = -0.7, 6.5
        frame = Rectangle(width=sx1 - sx0 + 0.3, height=1.55, stroke_color=FAINT, stroke_width=2).move_to([(sx0 + sx1) / 2, -1.5, 0])
        lab = T("measured hydrogen light", 34, DIM).next_to(frame, DOWN, buff=0.12)
        self.play(FadeIn(frame), FadeIn(lab), run_time=0.3)
        # n -> 2: 656, 486, 434, 410 nm
        tr = [(3, 656.3, "11:53.40"), (4, 486.1, "11:57.82"), (5, 434.0, "12:00.16"), (6, 410.2, "12:02.22")]
        lines = VGroup()
        self.add(lines)
        cap = T("One step down: one photon, one exact colour", 60).to_edge(UP, buff=0.4)
        self.go("11:53.00", FadeIn(cap), run=0.3)
        for n, nm, t in tr:
            self.at(t)
            col = wl_rgb(nm)
            start = [-3.4, ymap(n), 0]
            e.move_to(start)
            self.play(FadeIn(e), run_time=0.08)
            arc = Arrow(start, [-3.4, ymap(2), 0], color=INK, stroke_width=3, buff=0.05)
            self.play(e.animate.move_to([-3.4, ymap(2), 0]), FadeIn(arc), run_time=0.35)
            x_line = spectrum_x(nm, sx0, sx1)
            yl = -1.5
            # photon flight as a short wave segment
            packet_ = VMobject(stroke_color=col, stroke_width=4)
            s0 = np.array([-3.4, ymap(2), 0])
            s1 = np.array([x_line, yl + 0.8, 0])

            def set_packet(m, u):
                c = s0 + (s1 - s0) * u
                d = (s1 - s0) / np.linalg.norm(s1 - s0)
                nrm = np.array([-d[1], d[0], 0])
                ts = np.linspace(-0.55, 0.55, 80)
                m.set_points_as_corners(np.array([c + d * q + nrm * 0.14 * np.sin(q * 26) * np.exp(-(q * q) / 0.08) for q in ts]))

            set_packet(packet_, 0)
            self.add(packet_)
            self.play(UpdateFromAlphaFunc(packet_, set_packet), run_time=0.42, rate_func=rate_functions.linear)
            self.remove(packet_, arc)
            ln = Rectangle(width=0.085, height=1.55, fill_color=col, fill_opacity=1, stroke_width=0).move_to([x_line, yl, 0])
            lines.add(ln)
            self.play(FadeIn(ln, scale=1.2), run_time=0.15)
        bar = T("That's the barcode.", 66, EN).to_edge(UP, buff=0.4)
        self.at("11:59.60") if False else None
        self.go("12:03.70", FadeTransform(cap, bar), run=0.35)
        # prediction above measurement
        frame2 = Rectangle(width=sx1 - sx0 + 0.3, height=1.0, stroke_color=FAINT, stroke_width=2).move_to([(sx0 + sx1) / 2, 0.75, 0])
        pl = VGroup(*[Rectangle(width=0.085, height=1.0, fill_color=wl_rgb(nm), fill_opacity=1, stroke_width=0).move_to([spectrum_x(nm, sx0, sx1), 0.75, 0]) for nm, _ in BALMER])
        lp = T("predicted by the equation", 34, PSI).next_to(frame2, UP, buff=0.1)
        self.go("12:09.30", FadeIn(frame2), FadeIn(lp), LaggedStart(*[FadeIn(l, shift=DOWN * 0.3) for l in pl], lag_ratio=0.2), run=0.9)
        match = T("They match.", 66, GOOD).to_edge(UP, buff=0.4)
        self.go("12:10.60", FadeTransform(bar, match), run=0.3)
        l2 = T("One equation explained the light of atoms.", 62, EN).to_edge(UP, buff=0.4)
        self.go("12:12.54", FadeTransform(match, l2), run=0.4)
        self.at("12:15.25")
        self.clear_all(0.3)
