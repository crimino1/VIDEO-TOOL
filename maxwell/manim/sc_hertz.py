from sc_lib import *

SPARK = "#d6ecff"


def P(x, y, z=0.0):
    return p3([x], [y], [z], yaw=0.25, pitch=0.3, center=[0, -0.15, 0])[0]


def spark_pts(a, b, rng, n=7, jit=0.07):
    d = b - a
    nrm = np.array([-d[1], d[0], 0]) / (np.linalg.norm(d) + 1e-9)
    ts = np.linspace(0, 1, n)
    off = rng.uniform(-jit, jit, n)
    off[0] = off[-1] = 0
    return np.array([a + d * t + nrm * o for t, o in zip(ts, off)])


def spark_mob():
    return VGroup(*[VMobject(stroke_color=SPARK, stroke_width=w, stroke_opacity=o) for w, o in ((22, 0.12), (10, 0.3), (3.5, 1))])


def set_spark(s, pts, on):
    for m, o in zip(s, (0.12, 0.3, 1)):
        m.set_points_as_corners(pts)
        m.set_stroke(opacity=o * on)


class Hertz(Shot):
    def body(self):
        clock = tracker_time(self)
        push(self, 0.965)
        rng = np.random.default_rng(3)
        self.add(label("Hertz 1887 · across the room"))
        FY = -1.9
        floor = VGroup()
        for z in np.arange(-1.5, 1.51, 0.75):
            floor.add(Line(P(-7.4, FY, z), P(7.4, FY, z), stroke_color=FAINT, stroke_width=2))
        for x in np.arange(-7, 7.01, 1):
            floor.add(Line(P(x, FY, -1.5), P(x, FY, 1.5), stroke_color=FAINT, stroke_width=2))
        # transmitter: vertical rods, big spheres at the ends, small brass balls at the gap
        TX = -4.6
        g0, g1 = P(TX, 0.13), P(TX, 0.43)
        tx = VGroup(
            Line(P(TX, FY), P(TX, -1.35), stroke_color=DIM, stroke_width=6),
            Line(P(TX, -1.05), g0, stroke_color=COPPER, stroke_width=7),
            Line(g1, P(TX, 1.6), stroke_color=COPPER, stroke_width=7),
        )
        for y, r in ((-1.05, 0.33), (1.6, 0.33)):
            c = Circle(radius=r, fill_color=COPPER, fill_opacity=0.9, stroke_color=GOLD, stroke_width=3).move_to(P(TX, y))
            tx.add(glow(c, layers=3, opacity=0.06))
        for p in (g0, g1):
            tx.add(Dot(p, radius=0.1, color=GOLD))
        # induction coil box on the floor, wired to the two rods
        bx = [P(TX - 1.9 + dx, FY + dy, 0.5 + dz) for dx in (0, 0.9) for dy in (0, 0.55) for dz in (0, 0.6)]
        box = VGroup(Polygon(bx[0], bx[4], bx[6], bx[2], fill_color="#3a2a14", fill_opacity=0.9, stroke_color=COPPER, stroke_width=3),
                     Polygon(bx[2], bx[6], bx[7], bx[3], fill_color="#4a3519", fill_opacity=0.9, stroke_color=COPPER, stroke_width=3),
                     Polygon(bx[4], bx[5], bx[7], bx[6], fill_color="#2c200f", fill_opacity=0.9, stroke_color=COPPER, stroke_width=3))
        w1 = CubicBezier(bx[6], bx[6] + UP * 0.9, P(TX, -0.3) + LEFT * 0.6, P(TX, -0.3), stroke_color=GOLD, stroke_width=3)
        w2 = CubicBezier(bx[7], bx[7] + UP * 1.8, P(TX, 0.95) + LEFT * 0.8, P(TX, 0.95), stroke_color=GOLD, stroke_width=3)
        tx.add(box, w1, w2)
        # receiver: an open loop of wire with a tiny gap facing the transmitter
        RX, RY, R = 4.6, 0.25, 0.9
        ang = np.linspace(np.radians(190), np.radians(170) + TAU, 160)
        ring = VMobject(stroke_color=COPPER, stroke_width=7).set_points_smoothly([P(RX + R * np.cos(a), RY + R * np.sin(a)) for a in ang])
        r0, r1 = P(RX + R * np.cos(np.radians(190)), RY + R * np.sin(np.radians(190))), P(RX + R * np.cos(np.radians(170)), RY + R * np.sin(np.radians(170)))
        rx = VGroup(Line(P(RX, FY), P(RX, RY - R), stroke_color=DIM, stroke_width=6), glow(ring, layers=3, opacity=0.06),
                    Dot(r0, radius=0.08, color=GOLD), Dot(r1, radius=0.08, color=GOLD))
        lt = H("spark gap", 38).move_to(P(TX, 1.6) + RIGHT * 1.7 + UP * 0.35)
        lr = H("loop of wire", 38).move_to(P(RX, RY + R) + UP * 0.55)
        self.play(FadeIn(floor), Create(tx), Create(rx), run_time=1.1)
        self.play(FadeIn(lt), FadeIn(lr), run_time=0.4)

        # one clock drives sparks, rings and receiver flashes
        T0, PER, V = 1.92, 0.827, 3.0
        gc, rc = (g0 + g1) / 2, (r0 + r1) / 2
        D = np.linalg.norm(rc - gc)
        rx_from = 7.25  # receiver first sparks at "sparked" (7:26.62)
        vis = ValueTracker(0)
        sp_t, sp_r = spark_mob(), spark_mob()
        flash = VGroup(*[Circle(radius=0.12 * (1 + i), stroke_width=0, fill_color=SPARK, fill_opacity=0.12) for i in range(4)]).move_to(rc)
        unit = Circle(radius=1, num_components=24).points
        rings = VGroup(*[VMobject(stroke_width=4) for _ in range(16)])
        rig = VGroup(rings, sp_t, sp_r, flash)

        def up(m):
            t = clock.get_value()
            spawns = T0 + PER * np.arange(40)
            age = t - spawns
            on_t = 1.0 if (t >= T0 and np.any((age >= 0) & (age < 0.24))) else 0.0
            set_spark(sp_t, spark_pts(g0, g1, rng, 6, 0.06), on_t * rng.uniform(0.7, 1))
            r = age * V
            hit = t >= rx_from and np.any((age >= 0) & (np.abs(r - D) < 0.4))
            set_spark(sp_r, spark_pts(r0, r1, rng, 5, 0.05), 1.0 if hit else 0.0)
            flash.set_opacity(0.12 if hit else 0)
            live = np.where((r > 0) & (r < 11))[0][-16:]
            for i, ring_m in enumerate(rings):
                if i < len(live):
                    k = live[i]
                    x = r[k]
                    ring_m.set_points(unit * x + gc)
                    ring_m.set_stroke(GOLD if k % 2 == 0 else CYAN, opacity=vis.get_value() * 0.6 * (1 - x / 11) ** 1.3)
                else:
                    ring_m.set_stroke(opacity=0)

        rig.add_updater(up)
        self.add(rig)
        # a few metres apart
        ma = DoubleArrow([gc[0] + 0.6, -3.0, 0], [rc[0] - 0.6, -3.0, 0], buff=0, stroke_width=3, color=INK, tip_length=0.2)
        ml = H("a few metres", 40).next_to(ma, DOWN, buff=0.08)
        self.go("7:23.70", GrowFromCenter(ma), Write(ml), run=0.6)
        self.go("7:25.40", Indicate(rx, color=GOLD, scale_factor=1.08), run=0.8)
        nw = doodle("no wire!", [0, 2.05, 0], [0.35, -0.5, 0], CORAL, size=48, angle=0.5)
        self.go("7:27.95", Write(nw[0]), Create(nw[1]), run=0.5)
        rw = T("RADIO WAVES", 60, GOLD, weight=BOLD).move_to([0, 2.55, 0])
        rwg = glow(rw.copy(), layers=4, opacity=0.06)[:-1]
        self.go("7:29.85", FadeOut(nw), FadeOut(lt), FadeOut(lr), vis.animate.set_value(1), run=0.3)
        self.play(FadeIn(rw, scale=0.85), FadeIn(rwg), run_time=0.35)
        ex = H("exactly like Maxwell said", 42).next_to(rw, DOWN, buff=0.2)
        self.go("7:31.22", Write(ex), run=0.7)
