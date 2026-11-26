from sa_lib import *

HAND = np.array([-3.4, -0.1, 0])
X0, X1 = -7.6, 2.5  # waves run from off-frame left to just before their labels


class Invisible(Shot):
    def body(self):
        drift(self, 0.035)
        clock = tracker_time(self)
        halo = VGroup(*[Circle(radius=r, stroke_width=0, fill_color=GOLD, fill_opacity=0.016) for r in np.linspace(0.4, 2.6, 18)]).move_to(HAND)
        hand = emoji("270b", 3.7).move_to(HAND)
        self.play(FadeIn(halo), FadeIn(hand, scale=0.9), run_time=0.6)

        # (name, y, colour, wavelength, amplitude, speed, start, named)
        specs = [
            ("Wi-Fi", 2.0, CYAN, 1.5, 0.3, 3.0, "0:05.00", "0:08.06"),
            ("radio", 0.72, "#a9ccff", 4.2, 0.42, 3.0, "0:05.35", "0:08.96"),
            ("text message", -0.58, "#e6ecf8", 2.3, 0.3, 3.0, "0:05.70", "0:10.02"),
            ("light", -1.9, GOLD, 0.5, 0.22, 4.6, "0:11.95", "0:12.78"),
        ]
        waves = []
        for name, y0, col, lam, amp, v, t0, tn in specs:
            k, ts = 2 * PI / lam, sec(t0) - self.START

            def fn(xs, y0=y0, k=k, amp=amp, v=v, ts=ts):
                t = clock.get_value()
                front = X0 + v * (t - ts)
                env = np.clip((front - xs) / 1.2, 0, 1) * np.clip((X1 - xs) / 0.6, 0, 1)
                return y0 + amp * env * np.sin(k * (xs - v * t))

            op = ValueTracker(0.35)
            w = wave_line(fn, X0, X1, col, 3)
            w.add_updater(lambda m, op=op: m.set_stroke(width=2.5 + 2 * op.get_value(), opacity=op.get_value()))
            g = wave_line(fn, X0, X1, col, 16)
            g.add_updater(lambda m, op=op: m.set_stroke(opacity=0.13 * (op.get_value() - 0.35) / 0.65))
            lab = T(name, 38, INK).move_to([X1 + 0.35, y0, 0], aligned_edge=LEFT)
            lab = VGroup(glow(lab.copy().set_color(col), layers=3, width=1, opacity=0.08)[:-1], lab)
            waves.append((w, g, op, lab, t0, tn))

        for w, g, op, lab, t0, tn in waves[:3]:
            self.at(t0)
            self.add(op, g, w)
        # the text message: a little speech bubble riding its wave
        bub = emoji("1f4ac", 0.62)
        y3, lam3 = -0.58, 2.3

        def ride(m):
            t = clock.get_value()
            x = -6.6 + (t * 1.7) % 9.6
            m.move_to([x, y3 + 0.3 * np.sin(2 * PI / lam3 * (x - 3.0 * t)) + 0.42, 0])

        for i, (w, g, op, lab, t0, tn) in enumerate(waves):
            if i == 3:
                self.at(t0)
                self.add(op, g, w)
            extra = []
            if i == 2:
                ride(bub)
                bub.add_updater(ride)
                extra = [FadeIn(bub, scale=0.5)]
            if i == 3:  # the light hits the hand: it lights up
                extra = [halo.animate.scale(1.25).set_fill(opacity=0.045), hand.animate.scale(1.05)]
            self.go(tn, op.animate.set_value(1), FadeIn(lab, shift=LEFT * 0.2), *extra, run=0.45)


class FourLines(Shot):
    def body(self):
        drift(self, 1 - 1 / 1.04)
        e = maxwell_eqs(54, buff_h=1.1, buff_v=1.0).shift(UP * 0.6)
        gl = [eq_glow(m) for m in e]
        times = ["0:16.08", "0:17.08", "0:17.98", "0:18.90"]
        for i, (m, g) in enumerate(zip(e, gl)):
            extra = [FadeIn(label("Four short lines"))] if i == 3 else []
            self.go(times[i], FadeIn(m, shift=UP * 0.15), FadeIn(g), *extra, run=0.45)
        lab = H("150+ years ago", 46).move_to([-0.2, -2.9, 0])
        d = VGroup(lab, doodle_arrow(lab.get_left() + LEFT * 0.15, e[2].get_bottom() + DOWN * 0.12, angle=-0.9))
        self.go("0:20.20", Write(d[0]), Create(d[1]), run=0.6)
