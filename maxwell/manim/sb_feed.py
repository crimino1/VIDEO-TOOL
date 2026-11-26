from sb_util import *


def says(a, b, ca, cb, size=36):
    """'changing A -> makes B' line with coloured letters and a drawn arrow."""
    ar = Arrow(LEFT * 0.35, RIGHT * 0.35, buff=0, color=INK, stroke_width=4, max_tip_length_to_length_ratio=0.35)
    return VGroup(T("changing", size), T(a, size, ca, weight=BOLD), ar, T("makes", size), T(b, size, cb, weight=BOLD)).arrange(RIGHT, buff=0.18)


class SideBySide(Shot):
    def body(self):
        fr = self.camera.frame
        drive(self, lambda dt: fr.scale(1 - 0.003 * dt))
        lab = label("Rule 3 + Rule 4", GOLD)
        L, R = eq(2, 54), eq(3, 54)
        VGroup(L, R).arrange(RIGHT, buff=1.4).move_to([0, 0.85, 0])
        self.play(FadeIn(lab), FadeIn(L, shift=RIGHT * 0.3), FadeIn(R, shift=LEFT * 0.3), run_time=0.6)

        sl = says("B", "E", CYAN, GOLD).next_to(L, DOWN, buff=0.75)
        hb = SurroundingRectangle(L[4], color=CYAN, buff=0.1, corner_radius=0.08, stroke_width=4)
        self.go("4:50.78", FadeIn(sl, shift=UP * 0.15), Create(hb), run=0.5)
        sr = says("E", "B", GOLD, CYAN).next_to(R, DOWN, buff=0.75)
        he = SurroundingRectangle(R[7], color=GOLD, buff=0.1, corner_radius=0.08, stroke_width=4)
        self.go("4:54.12", FadeIn(sr, shift=UP * 0.15), Create(he), run=0.5)

        # the loop: E made on the left feeds the right, B made on the right feeds the left
        a = L.get_top() + UP * 0.25
        b = R.get_top() + UP * 0.25 + LEFT * 0.6
        c = sr.get_bottom() + DOWN * 0.25
        d = sl.get_bottom() + DOWN * 0.25
        top = CurvedArrow(a, b, angle=-PI / 3, color=GOLD, stroke_width=6, tip_length=0.28)
        bot = CurvedArrow(c, d, angle=-PI / 3, color=CYAN, stroke_width=6, tip_length=0.28)
        self.go("4:57.32", Create(top), Create(bot), run=0.6)
        tp = flow(ArcBetweenPoints(a, b, angle=-PI / 3).get_all_points()[::2], n=6, speed=2.4, color=GOLD, r=0.06)
        bp = flow(ArcBetweenPoints(c, d, angle=-PI / 3).get_all_points()[::2], n=6, speed=2.4, color=CYAN, r=0.06)
        txt = H("they feed each other", 52).move_to([0, -3.1, 0])
        self.go("4:58.10", FadeIn(tp), FadeIn(bp), Write(txt), run=0.6)


class Feed(Shot):
    def body(self):
        clock = tracker_time(self)
        y0 = -0.25
        xs = np.linspace(-5.3, 5.3, 6)
        es = []
        # camera starts close on the first link and widens as the chain marches right
        fr = self.camera.frame
        cam = {"xmax": xs[0], "w": 7.5}
        FW = config.frame_width

        def follow(m, dt):
            tw = np.clip(cam["xmax"] - xs[0] + 5.5, 7.5, FW)
            cam["w"] += (tw - cam["w"]) * min(1, dt / 0.7)
            m.set_width(cam["w"]).move_to([-FW / 2 + cam["w"] / 2, y0 * (FW - cam["w"]) / (FW - 7.5), 0])

        follow(fr, 1)
        drive(self, lambda dt: follow(fr, dt))

        def e_arrow(k):
            x = xs[k]
            ln = lambda: 2.7 + 0.6 * np.sin(5.0 * clock.get_value() - 1.1 * k)
            a = Arrow([x, y0 - 0.9, 0], [x, y0 + 0.9, 0], buff=0, color=GOLD, stroke_width=11)
            g = Line([x, y0 - 1, 0], [x, y0 + 1, 0], color=GOLD, stroke_width=34, stroke_opacity=0.09)
            grp = VGroup(g, a)
            grp.op = 1.0
            a.add_updater(lambda m: m.become(Arrow([x, y0 - ln() / 2, 0], [x, y0 + ln() / 2, 0], buff=0, color=GOLD, stroke_width=11,
                                                   max_tip_length_to_length_ratio=0.2)).set_opacity(grp.op))
            g.add_updater(lambda m: m.put_start_and_end_on([x, y0 - ln() / 2, 0], [x, y0 + ln() / 2, 0]).set_stroke(opacity=0.09 * grp.op))
            return grp

        def b_ring(k):
            x = xs[k]
            th = np.linspace(0, TAU, 120)
            pts = np.column_stack([x + 1.12 * np.cos(th), y0 + 0.36 * np.sin(th), 0 * th])
            r = poly(pts, CYAN, 5)
            f = flow(pts, n=4, speed=2.0, color=CYAN, arrows=True)
            grp = VGroup(r, f)
            grp.op = 1.0
            r.add_updater(lambda m: m.set_stroke(width=5 + 2 * np.sin(5.0 * clock.get_value() - 1.1 * k - 1.2), opacity=grp.op))
            return grp

        def dim(k):
            """Older links fade to a faint trail."""
            for j in range(0, k - 1):
                for grp in es[j]:
                    if grp.op > 0.3:
                        grp.op = 0.3
                        if len(grp[1]) and isinstance(grp[1][0], VMobject) and not isinstance(grp[1], Arrow):
                            grp[1].set_opacity(0.3)

        e0 = e_arrow(0)
        self.play(FadeIn(e0), run_time=0.4)
        es.append([e0])
        le = H("E", 64, GOLD).move_to([xs[0] - 0.75, y0 + 1.3, 0])
        self.play(FadeIn(le), run_time=0.3)
        b0 = b_ring(0)
        lb = H("B", 64, CYAN).move_to([xs[0] + 0.25, y0 - 1.0, 0])
        self.go("5:01.66", Create(b0[0]), FadeIn(b0[1]), FadeIn(lb), run=0.5)
        es[0].append(b0)
        self.go("5:03.02", Flash([xs[0] + 1.12, y0, 0], color=CYAN, flash_radius=0.6, line_length=0.35), b0[0].animate.set_stroke(width=10), run=0.4)
        b0[0].set_stroke(width=5)

        times = ["5:04.92", "5:09.20", "5:09.95", "5:10.55", "5:11.00"]
        runs = [0.5, 0.5, 0.4, 0.3, 0.25]
        for k in range(1, 6):
            e, b = e_arrow(k), b_ring(k)
            self.at(times[k - 1])
            cam["xmax"] = xs[k]
            if k == 1:
                self.go(times[0], FadeIn(e, scale=0.5), run=0.5)
                self.go("5:07.16", Create(b[0]), FadeIn(b[1]), run=0.5)
                self.play(Flash([xs[1] + 1.12, y0, 0], color=CYAN, flash_radius=0.6, line_length=0.35), run_time=0.4)
            else:
                self.go(times[k - 1], FadeIn(e, scale=0.5), Create(b[0]), FadeIn(b[1]), run=runs[k - 1])
            es.append([e, b])
            dim(k)
