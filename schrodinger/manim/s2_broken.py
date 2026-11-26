from common import *


class Clockwork(Shot):
    def body(self):
        clock = tracker_time(self)
        spec = [(-4.2, 1.2, 1.7, 16, 1), (-1.25, -0.3, 1.34, 12, -1), (1.1, 1.75, 1.0, 9, 1), (3.5, 0.4, 1.7, 16, -1), (-3.2, -2.9, 1.0, 9, -1)]
        gears = VGroup()
        for (x, y, r, t, d) in spec:
            g = gear(t, r, 0.15, color="#3a4660").move_to([x, y, 0])
            w = d * 1.1 * 16 / t
            g.add_updater(lambda m, dt, w=w: m.rotate(w * dt * 0.5))
            gears.add(g)
        self.play(FadeIn(gears), run_time=0.8)
        title = T("A giant, predictable clockwork machine", 56).to_edge(UP, buff=0.45)
        self.go("1:03.21", FadeIn(title), run=0.6)
        # particles with position and velocity, future drawn ahead of them
        rng = np.random.default_rng(11)
        ps = []
        for i in range(9):
            p = np.array([rng.uniform(-6, 2), rng.uniform(-3.1, 2.4), 0])
            v = np.array([rng.uniform(0.5, 1.1), rng.uniform(-0.35, 0.35), 0])
            ps.append((p, v))
        dots = VGroup(*[glow_dot(EN, 0.06, 3).move_to(p) for p, _ in ps])
        arrows = VGroup(*[Arrow(p, p + v * 1.0, buff=0, color=EN, stroke_width=3, max_tip_length_to_length_ratio=0.25) for p, v in ps])
        self.go("1:05.45", gears.animate.set_stroke(opacity=0.3), FadeIn(dots), run=0.5)
        self.go("1:06.31", LaggedStart(*[GrowArrow(a) for a in arrows], lag_ratio=0.05), run=0.8)
        fut = VGroup(*[DashedLine(p + v, p + v * 5.2, color=INK, stroke_width=2, dash_length=0.1, stroke_opacity=0.7) for p, v in ps])
        lab = TI("I'll tell you the future.", 60, EN).to_edge(DOWN, buff=0.5)
        self.go("1:08.89", LaggedStart(*[Create(f) for f in fut], lag_ratio=0.04), FadeIn(lab), run=1.2)
        self.at("1:10.30")
        self.play(FadeOut(VGroup(fut, arrows, dots, title, lab, gears)), run_time=0.35)


class AtomHappened(Shot):
    def body(self):
        clock = tracker_time(self)
        self.at("1:12.62")
        base, e = atom(R=1.9, nuc_r=0.32)
        e.add_updater(lambda m: m.move_to([1.9 * np.cos(clock.get_value() * 5), 1.9 * np.sin(clock.get_value() * 5), 0]))
        ring = Circle(radius=0.2, color=INK, stroke_width=6)
        self.add(base[1])
        self.play(ring.animate.scale(40).set_stroke(opacity=0), FadeIn(base), FadeIn(e), run_time=0.8, rate_func=rate_functions.ease_out_cubic)
        self.remove(ring)


class AtomModel(Shot):
    def body(self):
        clock = tracker_time(self)
        base, e = atom(R=1.9, nuc_r=0.32)
        e.add_updater(lambda m: m.move_to([1.9 * np.cos(clock.get_value() * 3.2 + 2), 1.9 * np.sin(clock.get_value() * 3.2 + 2), 0]))
        g = VGroup(base, e)
        self.add(g)
        n = T("heavy nucleus", 48, INK).move_to([3.6, 1.6, 0])
        nl = Line(n.get_left() + LEFT * 0.1, [0.32, 0.18, 0], color=DIM, stroke_width=2)
        self.go("1:16.90", FadeIn(n), Create(nl), run=0.5)
        el = T("tiny electron", 48, PSI).move_to([3.6, -1.6, 0])
        self.go("1:18.88", FadeIn(el), run=0.5)
        # planet analogy, side by side
        self.go("1:21.00", FadeOut(n), FadeOut(nl), FadeOut(el), g.animate.shift(LEFT * 3.2), run=0.5)
        sun = VGroup(*[Dot(radius=0.34 + i * 0.1, color=EN, fill_opacity=0.12) for i in range(4)], Dot(radius=0.34, color=EN)).move_to([3.3, 0, 0])
        orb = Circle(radius=1.9, color=FAINT, stroke_width=2).move_to([3.3, 0, 0])
        pl = Dot(radius=0.1, color=POT)
        pl.add_updater(lambda m: m.move_to([3.3 + 1.9 * np.cos(clock.get_value() * 1.8), 1.9 * np.sin(clock.get_value() * 1.8), 0]))
        lab = T("like a planet around the sun", 56).to_edge(DOWN, buff=0.55)
        e.clear_updaters()
        e.add_updater(lambda m: m.move_to([-3.2 + 1.9 * np.cos(clock.get_value() * 3.2 + 2), 1.9 * np.sin(clock.get_value() * 3.2 + 2), 0]))
        self.go("1:21.74", FadeIn(sun), FadeIn(orb), FadeIn(pl), FadeIn(lab), run=0.6)


class Spiral(Shot):
    def body(self):
        clock = tracker_time(self)
        R = ValueTracker(2.4)
        phase = ValueTracker(0)
        phase.add_updater(lambda m, dt: m.increment_value(dt * 3.2 * (2.4 / max(R.get_value(), 0.3)) ** 1.5))
        self.add(phase)
        n = nucleus(0.34)
        e = glow_dot(PSI, 0.09)
        e.add_updater(lambda m: m.move_to([R.get_value() * np.cos(phase.get_value()), R.get_value() * np.sin(phase.get_value()), 0]))
        orbit = Circle(radius=2.4, color=FAINT, stroke_width=2)
        self.add(orbit, n, e)
        h1 = T("A huge problem", 72, RED).to_edge(UP, buff=0.5)
        self.go("1:25.00", FadeIn(h1), run=0.45)
        cl = T("classical physics says:", 48, DIM).to_edge(UP, buff=0.5)
        self.go("1:26.08", FadeTransform(h1, cl), run=0.4)
        # radiated light rings leaving the electron
        rings = VGroup()
        self.add(rings)
        emit = {"on": False, "t": 0.0}

        def ring_update(m, dt):
            emit["t"] += dt
            if emit["on"] and emit["t"] > 0.28:
                emit["t"] = 0
                c = Circle(radius=0.08, color=EN, stroke_width=3, stroke_opacity=0.9).move_to(e.get_center())
                c.age = 0.0
                m.add(c)
            for c in list(m):
                c.age += dt
                c.scale(1 + dt * 2.6 / max(c.age, 0.05) * 0.25)
                c.set_stroke(opacity=max(0, 0.9 - c.age * 0.8))
                if c.age > 1.1:
                    m.remove(c)

        rings.add_updater(ring_update)
        l = T("gives off light", 46, EN).move_to([4.8, 1.6, 0])
        self.at("1:31.20")
        emit["on"] = True
        self.play(FadeIn(l), run_time=0.3)
        kin = ValueTracker(1)
        bar_ = energy_bar("energy", EN, 5.3, base=-1.9, h=2.8, w=0.7, tracker=kin, size=38)
        self.go("1:32.38", FadeIn(bar_), run=0.3)
        self.play(kin.animate.set_value(0.55), run_time=0.7)
        self.at("1:33.84")
        self.play(R.animate.set_value(0.15), kin.animate.set_value(0.03), FadeOut(orbit), run_time=1.6, rate_func=rate_functions.ease_in_quad)
        emit["on"] = False
        self.play(Flash(ORIGIN, color=RED, line_length=0.9, flash_radius=0.7, num_lines=16), FadeOut(e), run_time=0.35)


class HowFast(Shot):
    def body(self):
        q = T("How fast?", 92)
        self.play(FadeIn(q), run_time=0.3)
        self.at("1:37.30")
        a = T("Trillionths of a second", 92, RED)
        self.play(FadeTransform(q, a), run_time=0.3)


class AllDead(Shot):
    def body(self):
        clock = tracker_time(self)
        cols, rows = 15, 8
        rt = ValueTracker(1.0)
        atoms = VGroup()
        for i in range(cols):
            for j in range(rows):
                c = np.array([-6.3 + i * 0.9, -3.15 + j * 0.9, 0])
                a = VGroup(Circle(radius=0.3, color="#3a4660", stroke_width=1.5).move_to(c), Dot(c, radius=0.05, color=RED))
                ph = i * 0.7 + j * 1.3
                ed = Dot(radius=0.035, color=PSI)
                ed.add_updater(lambda m, c=c, ph=ph: m.move_to(c + 0.3 * rt.get_value() * np.array([np.cos(clock.get_value() * 4 + ph), np.sin(clock.get_value() * 4 + ph), 0])))
                a[0].add_updater(lambda m, c=c: m.become(Circle(radius=max(0.3 * rt.get_value(), 0.001), color="#3a4660", stroke_width=1.5).move_to(c)))
                atoms.add(VGroup(a, ed))
        self.play(FadeIn(atoms), run_time=0.6)
        lab = plate(T("every atom in the universe", 58)).to_edge(UP, buff=0.35).set_z_index(5)
        self.go("1:43.14", FadeIn(lab), run=0.3)
        self.go("1:44.78", rt.animate.set_value(0), run=1.0, rate_func=rate_functions.ease_in_cubic)
        self.play(FadeOut(atoms), FadeOut(lab), run_time=0.3)
        a1 = T("You shouldn't exist.", 88)
        self.go("1:46.32", FadeIn(a1), run=0.25)
        a2 = T("I shouldn't exist.", 88)
        self.go("1:47.72", FadeOut(a1), FadeIn(a2), run=0.25)
        a3 = T("This video shouldn't exist.", 88)
        self.go("1:49.38", FadeOut(a2), FadeIn(a3), run=0.25)
        # the frame itself collapses to a point
        self.go("1:50.75", a3.animate.scale(0.001).set_opacity(0), run=0.7, rate_func=rate_functions.ease_in_cubic)
        self.remove(a3)


class Stable(Shot):
    def body(self):
        clock = tracker_time(self)
        base, e = atom(R=1.8, nuc_r=0.3, orbit_color="#3a4660")
        e.add_updater(lambda m: m.move_to([1.8 * np.cos(clock.get_value() * 3.5), 1.8 * np.sin(clock.get_value() * 3.5), 0]))
        lab = T("But atoms are stable.", 72).to_edge(UP, buff=0.6)
        self.play(FadeIn(base, scale=0.2), FadeIn(e), FadeIn(lab), run_time=0.5)
        self.go("1:53.24", FadeTransform(lab, T("And there was another clue.", 72, EN).to_edge(UP, buff=0.6)), run=0.4)
        self.at("1:54.02")
        self.clear_all(0.3)


class Barcode(Shot):
    def body(self):
        rb = rainbow(y=0.3, h=2.2)
        cap = T("every colour?", 56, DIM).to_edge(UP, buff=0.7)
        self.play(FadeIn(rb), FadeIn(cap), run_time=0.4)
        lines = balmer_lines(y=0.3, h=2.2, w=0.085)
        cap2 = T("only a few very specific colours", 56, INK).to_edge(UP, buff=0.7)
        self.go("1:59.90", FadeOut(rb), FadeIn(lines), FadeTransform(cap, cap2), run=1.1)
        labs = VGroup(*[T(n, 32, wl_rgb(w)).next_to(lines[i], DOWN, buff=0.28) for i, (w, n) in enumerate(BALMER)])
        labs[2].shift(DOWN * 0.42 + RIGHT * 0.12)
        labs[3].shift(LEFT * 0.42)
        self.go("2:02.52", FadeIn(labs), run=0.4)
        hyd = T("hydrogen", 40, DIM).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(hyd), run_time=0.3)
        bc = T("like a barcode", 62, INK).move_to(cap2)
        self.go("2:03.72", FadeTransform(cap2, bc), run=0.35)
        self.at("2:04.78")
        self.clear_all(0.3)


class Stairs(Shot):
    def body(self):
        o = np.array([-6.0, -2.3, 0])
        st = staircase(5, 1.0, 0.75, o)
        ball = Dot(radius=0.14, color=PSI).move_to(o + [0.5, 0.14, 0])
        cap = T("only certain energies", 62, INK).to_edge(UP, buff=0.6)
        self.play(Create(st), FadeIn(ball), FadeIn(cap), run_time=0.7)
        self.at("2:06.70")

        def hop(i):
            target = o + [0.5 + i * 1.0, 0.14 + i * 0.75, 0]
            arc = ArcBetweenPoints(ball.get_center(), target, angle=-1.1)
            return MoveAlongPath(ball, arc)

        for i in [1, 2, 3, 4]:
            self.play(hop(i), run_time=0.42, rate_func=rate_functions.ease_in_out_sine)
        c2 = T("nothing in between", 62, RED).to_edge(UP, buff=0.6)
        self.go("2:08.74", FadeTransform(cap, c2), run=0.35)
        # half-step that gets rejected
        ghost = Dot(radius=0.14, color=RED, fill_opacity=0.45).move_to(o + [3.0, 2.0 + 0.14, 0])
        x = Cross(ghost, stroke_color=RED, stroke_width=4, scale_factor=1.6)
        self.play(FadeIn(ghost), Create(x), run_time=0.4)
        # the ramp, for comparison
        p0, p1 = np.array([1.2, -2.3, 0]), np.array([6.0, 1.45, 0])
        ramp = Line(p0, p1, color=DIM, stroke_width=4)
        l1 = T("a staircase", 52, PSI).next_to(st, DOWN, buff=0.15).shift(UP * 0.0)
        l2 = T("not a ramp", 52, DIM).move_to([3.6, -2.95, 0])
        l1.move_to([-3.6, -2.95, 0])
        self.go("2:10.78", FadeIn(l1), run=0.3)
        self.go("2:12.16", Create(ramp), FadeIn(l2), Create(Cross(ramp, stroke_color=RED, stroke_width=5, scale_factor=0.25)), run=0.5)


class Why(Shot):
    def body(self):
        a = T("But why?", 110)
        self.play(FadeIn(a), run_time=0.25)
        b = T("Why would nature be so picky?", 72)
        self.go("2:13.88", FadeTransform(a, b), run=0.3)
        n = T("Nobody knew.", 92, DIM)
        self.go("2:16.40", FadeTransform(b, n), run=0.3)
        self.go("2:17.20", FadeOut(n), run=0.2)
        # the old laws crack in half
        f = M(r"F=ma", size=110).move_to([-3.1, 0, 0])
        mx = M(r"\nabla\times E=-\frac{\partial B}{\partial t}", size=70).move_to([2.9, 0, 0])
        self.play(FadeIn(f), FadeIn(mx), run_time=0.15)
        pts = [[0.1, 4, 0], [-0.2, 2.2, 0], [0.25, 1.1, 0], [-0.25, 0.2, 0], [0.2, -0.9, 0], [-0.1, -1.95, 0]]
        crack = VMobject(stroke_color=RED, stroke_width=5).set_points_as_corners(pts)
        self.go("2:17.54", Create(crack), f.animate.shift(LEFT * 0.4 + DOWN * 0.2).rotate(0.06), mx.animate.shift(RIGHT * 0.4 + UP * 0.2).rotate(-0.05), run=0.45)
        lab = T("Physics was broken.", 72, RED).to_edge(DOWN, buff=0.6)
        self.play(FadeIn(lab), run_time=0.25)
        idea = T("It needed a new idea.", 72, EN).to_edge(DOWN, buff=0.6)
        self.go("2:18.90", FadeTransform(lab, idea), f.animate.set_opacity(0.3), mx.animate.set_opacity(0.3), crack.animate.set_stroke(opacity=0.3), run=0.5)
        self.at("2:20.35")
        self.clear_all(0.3)
