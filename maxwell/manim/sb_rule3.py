from sb_util import *


def meter(center, w=1.9, h=1.35):
    """Galvanometer: box, dial arc, ticks, needle. Returns (group, needle, pivot)."""
    c = np.array(center, float)
    box = RoundedRectangle(width=w, height=h, corner_radius=0.15, fill_color="#0b1424", fill_opacity=1, stroke_color=INK, stroke_width=2.5)
    box.move_to(c)
    pivot = c + DOWN * h * 0.36
    arc = Arc(radius=0.78, start_angle=PI / 2 - 1.0, angle=2.0, arc_center=pivot, color=DIM, stroke_width=3)
    ticks = VGroup(*[Line(pivot + 0.68 * np.array([np.cos(a), np.sin(a), 0]), pivot + 0.84 * np.array([np.cos(a), np.sin(a), 0]), color=INK if abs(a - PI / 2) < 0.01 else DIM, stroke_width=3)
                     for a in np.linspace(PI / 2 - 1.0, PI / 2 + 1.0, 5)])
    zero = T("0", 20, INK).move_to(pivot + UP * 1.0)
    needle = Line(pivot, pivot + UP * 0.72, color=CORAL, stroke_width=5)
    hub = Dot(pivot, radius=0.06, color=INK)
    return VGroup(box, arc, ticks, zero, needle, hub), needle, pivot


class Rule3(Shot):
    def body(self):
        fr = self.camera.frame
        drive(self, lambda dt: fr.scale(1 - 0.0015 * dt))
        lab = label_arrow("Rule 3 · changing magnet", "electricity", GOLD)
        self.play(FadeIn(lab), run_time=0.4)
        line = T("a changing magnetic field makes electricity", 38, t2c={"changing magnetic field": CYAN, "electricity": GOLD}).move_to([0, 2.72, 0])
        self.go("3:10.94", FadeIn(line, shift=UP * 0.15), run=0.6)

        # coil (axis along x), meter bottom right, leads
        YAW, PITCH, C = -0.22, 0.22, np.array([0.3, -0.15, 0])
        back, front, hel = coil(6, 1.05, 1.9, yaw=YAW, pitch=PITCH, center=C)
        MC, MS = np.array([5.25, -2.45, 0]), 1.35
        mg, needle, pivot = meter(MC)
        mg.scale(MS, about_point=MC)
        pivot = MC + (pivot - MC) * MS
        ml = MC[0] - 0.95 * MS
        a0, a1 = hel[0], hel[-1]
        lead1 = [np.array([ml, -2.8, 0]), np.array([a0[0], -2.8, 0]), a0]
        lead2 = [a1, np.array([a1[0], -2.3, 0]), np.array([ml, -2.3, 0])]
        wires = VGroup(poly(lead1, COPPER, 4), poly(lead2, COPPER, 4))
        circuit = np.array(lead1 + list(hel[1:-1]) + lead2 + [lead1[0]])
        self.go("3:13.86", Create(back), Create(front), run=1.4)
        self.play(Create(wires), FadeIn(mg), run_time=0.6)

        # current = rate of change of flux: follows the magnet's speed near the coil
        u = ValueTracker(-5.0)  # magnet position along the coil axis (world units)
        cur = ValueTracker(0)
        st = {"u": u.get_value()}

        def cur_up(m, dt):
            if dt <= 0:
                return
            v = (u.get_value() - st["u"]) / dt
            st["u"] = u.get_value()
            target = np.clip(0.75 * v * np.exp(-(u.get_value() / 2.6) ** 2), -1, 1)
            m.set_value(m.get_value() + (target - m.get_value()) * min(1, dt / 0.25))

        cur.add_updater(cur_up)
        self.add(cur)
        needle.add_updater(lambda m: m.put_start_and_end_on(pivot, pivot + 0.72 * MS * np.array([np.cos(PI / 2 - 0.95 * cur.get_value()), np.sin(PI / 2 - 0.95 * cur.get_value()), 0])))
        dots = flow(circuit, n=44, speed=lambda: 2.6 * cur.get_value(), color=GOLD, r=0.055)

        # magnet + its field lines, sliding along the axis
        ax0, ax1 = proj((-1, 0, 0), YAW, PITCH, center=C), proj((1, 0, 0), YAW, PITCH, center=C)
        ang = np.arctan2(*(ax1 - ax0)[1::-1])
        mag = bar_magnet(3.0, 0.7)
        fl = VGroup(*[poly(l, CYAN, 2.5, 0.7) for l in field_loops(1.5, (30, 48, 64))])
        mgrp = VGroup(fl, mag).rotate(ang)
        mgrp.add_updater(lambda m: m.move_to(proj((u.get_value(), 0, 0), YAW, PITCH, center=C)))
        self.remove(back, front, wires, mg)
        self.add(wires, back, front, mg)
        self.add(dots, mg)
        self.play(FadeIn(dots), run_time=0.4)
        self.at("3:17.78")
        self.remove(front, dots, mg)
        self.add(mgrp, front, dots, mg)
        self.play(FadeIn(mgrp), run_time=0.6)

        # push in
        self.go("3:20.32", u.animate.set_value(0), run=4.1, rate_func=rate_functions.ease_in_out_sine)
        # stop: nothing; then pull out: other way
        self.go("3:27.84", u.animate.set_value(-5.0), run=3.0, rate_func=rate_functions.ease_in_out_sine)
        d0 = doodle("the other way!", [4.9, -0.35, 0], pivot + UP * 1.25 + LEFT * 0.45, size=42, angle=0.6)
        self.go("3:30.92", Write(d0[0]), Create(d0[1]), run=0.45)
        d1 = doodle("still = nothing", [-4.3, -2.6, 0], [-4.1, -0.55, 0], size=44, angle=-0.4)
        self.go("3:33.87", FadeOut(d0), Write(d1[0]), Create(d1[1]), run=0.45)

        # the takeaway
        big = T("it has to be MOVING", 72, weight=BOLD, t2c={"MOVING": GOLD}).move_to([0, 1.0, 0])
        diagram = VGroup(line, wires, back, mgrp, front, dots, mg, d1)
        self.go("3:35.37", FadeOut(diagram), FadeIn(big, scale=0.92), run=0.45)
        e = eq(2, 80).move_to([-0.6, -1.15, 0])
        self.go("3:36.79", FadeIn(e, shift=UP * 0.2), run=0.4)
        ul = underline(e[4], CORAL, 6)
        d2 = doodle("change!", e[4].get_right() + RIGHT * 2.3 + DOWN * 0.9, e[4].get_corner(DR) + DOWN * 0.15, size=44, angle=-0.6)
        self.play(Create(ul), Write(d2[0]), Create(d2[1]), run_time=0.45)


class Generator(Shot):
    def body(self):
        fr = self.camera.frame
        drive(self, lambda dt: fr.scale(1 - 0.004 * dt))
        lab = label("Every power plant", GOLD)
        C = np.array([0, 0.45, 0])
        mag = bar_magnet(3.0, 0.75).move_to(C)
        bl, fl_, hl = coil(5, 0.85, 0.8, yaw=-0.2, pitch=0.2, center=C + LEFT * 3.7)
        br, fr_, hr = coil(5, 0.85, 0.8, yaw=-0.2, pitch=0.2, center=C + RIGHT * 3.7)
        bulb = emoji("1f4a1", 1.25).move_to([0, -2.75, 0])
        yb = -3.05
        wl = [hl[0], np.array([hl[0][0], yb, 0]), np.array([-0.32, yb, 0])]
        wr = [hr[-1], np.array([hr[-1][0], yb, 0]), np.array([0.32, yb, 0])]
        ws = [hl[-1], np.array([hl[-1][0], -1.55, 0]), np.array([hr[0][0], -1.55, 0]), hr[0]]
        wires = VGroup(poly(wl, COPPER, 4), poly(wr, COPPER, 4), poly(ws, COPPER, 4))
        bulb.set_opacity(0.35)
        self.play(FadeIn(lab), FadeIn(VGroup(bl, br, wires)), FadeIn(mag), FadeIn(VGroup(fl_, fr_)), FadeIn(bulb), run_time=0.5)

        w = ValueTracker(0)
        mag.add_updater(lambda m, dt: m.rotate(w.get_value() * dt, about_point=C))
        self.go("3:44.38", w.animate.set_value(2.2), run=1.0)
        words = VGroup(T("spin", 44), T("spin", 58), T("spin", 76, GOLD, weight=BOLD))
        for i, t in enumerate(words):
            t.move_to([(i - 1) * 3.4, 2.75, 0])
        for t, when, sp in zip(words, ("3:48.48", "3:49.20", "3:50.10"), (4.5, 7.5, 11.0)):
            self.go(when, FadeIn(t, scale=0.6), w.animate.set_value(sp), run=0.3)

        # electricity out to the bulb
        pl = flow(wl, n=7, speed=3.2, color=GOLD, r=0.07)
        pr = flow(wr, n=7, speed=3.2, color=GOLD, r=0.07)
        halo = VGroup(*[Dot(radius=0.5 + 0.28 * i, color=GOLD, fill_opacity=0.09) for i in range(5)]).move_to(bulb.get_center() + UP * 0.15)
        ring = Circle(radius=0.6, color=GOLD, stroke_width=6).move_to(halo)
        self.at("3:51.16")
        self.remove(bulb)
        self.add(pl, pr, halo, bulb)
        self.play(FadeIn(pl), FadeIn(pr), bulb.animate.set_opacity(1), FadeIn(halo), wires.animate.set_stroke(GOLD),
                  ring.animate.scale(3.2).set_stroke(opacity=0), run_time=0.6)
