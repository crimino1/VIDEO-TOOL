from sb_util import *
from sb_util import _cum


class Loops(Shot):
    def body(self):
        fr = self.camera.frame
        lab = label("Rule 2 · field lines loop", CYAN)
        mag = bar_magnet(2.8, 0.8)
        for r in mag[:2]:
            r.set_fill(opacity=0.62)
        self.play(FadeIn(lab), FadeIn(mag, scale=0.9), run_time=0.5)
        drive(self, lambda dt: fr.scale(1 - 0.0028 * dt))  # slow push-in over the whole shot

        loops = field_loops(1.4, (28, 45, 60, 74, 86, 97))
        lines = VGroup(*[glow(poly(l, CYAN, 3), layers=3, opacity=0.1) for l in loops])
        self.at("2:47.38")
        self.remove(mag)
        self.add(lines, mag)
        self.go("2:47.38", LaggedStart(*[Create(m) for m in lines], lag_ratio=0.12), run=2.4)

        parts = VGroup(*[flow(l, n=max(4, int(_len(l) / 0.55)), speed=1.3, color="#a8eeff", r=0.05) for l in loops])
        self.at("2:51.52")
        self.remove(mag)
        self.add(parts, mag)  # magnet body over the particles (they show through it), letters on top
        self.play(FadeIn(parts), run_time=0.5)

        # racetrack: the biggest top loop turns gold and a car laps it
        k = 10  # loops alternate top/bottom; index 10 = biggest top loop
        track = loops[k]
        hi = glow(poly(track, GOLD, 5), GOLD, layers=5, opacity=0.13)
        self.go("2:57.22", FadeIn(hi), lines[k].animate.set_stroke(opacity=0.2), parts[k].animate.set_opacity(0), run=0.4)
        car = emoji("1f3ce", 0.85)
        cum = _cum(track)
        st = {"s": 0.0}

        def lap(m, dt):
            st["s"] += 3.4 * dt
            s = st["s"] % cum[-1]
            m.move_to([np.interp(s, cum, track[:, 0]), np.interp(s, cum, track[:, 1]), 0])

        lap(car, 0)
        car.add_updater(lap)
        self.add(car)
        d1 = doodle("no start line", [-4.6, 2.1, 0], track[len(track) // 5] + LEFT * 0.15, size=40, angle=0.5)
        d2 = doodle("no finish line", [4.6, 2.1, 0], track[len(track) * 4 // 5] + RIGHT * 0.15, size=40, angle=-0.5)
        self.go("2:58.08", Write(d1[0]), Create(d1[1]), run=0.5)
        self.go("2:58.98", Write(d2[0]), Create(d2[1]), run=0.5)
        e = eq(1, 84).move_to([4.4, -2.6, 0])
        self.go("2:59.72", FadeIn(e, shift=UP * 0.2), run=0.5)


def _len(l):
    return float(np.linalg.norm(np.diff(l, axis=0), axis=1).sum())

