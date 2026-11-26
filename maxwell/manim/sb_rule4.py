from sb_util import *


def toggle(on=True):
    pill = RoundedRectangle(width=1.3, height=0.6, corner_radius=0.3, stroke_color=GOLD, stroke_width=4, fill_color="#0b1424", fill_opacity=1)
    knob = Dot(radius=0.22, color=GOLD).move_to(pill.get_center() + RIGHT * 0.33)
    txt = T("ON", 30, GOLD, weight=BOLD).next_to(pill, DOWN, buff=0.18)
    return VGroup(pill, knob, txt)


class Rule4(Shot):
    def body(self):
        fr = self.camera.frame
        drive(self, lambda dt: fr.scale(1 - 0.002 * dt))
        lab = label_arrow("Rule 4 · electricity", "magnetism", CYAN)
        self.play(FadeIn(lab), run_time=0.4)
        flip = H("the flip side of rule 3", 46).move_to([-3.5, 2.4, 0])
        self.go("4:01.32", Write(flip), run=0.6)

        YAW, PITCH, C = -0.45, 0.6, np.array([0.3, -0.45, 0])
        P = lambda p: proj(p, YAW, PITCH, center=C)

        def ring(r, n=160):
            th = np.linspace(0, TAU, n)
            return np.array([P((r * np.cos(t), 0, -r * np.sin(t))) for t in th])  # increasing t = B direction for current up

        disk = Polygon(*ring(2.85, 120)[:-1], fill_color=FAINT, fill_opacity=0.45, stroke_color=DIM, stroke_width=2)
        lo = [P((0, -2.6, 0)), P((0, 0, 0))]
        hi = [P((0, 0, 0)), P((0, 3.0, 0))]
        w_lo = glow(Line(*lo, color=COPPER, stroke_width=7), GOLD, layers=4, opacity=0.1)
        w_hi = glow(Line(*hi, color=COPPER, stroke_width=7), GOLD, layers=4, opacity=0.1)
        wire = VGroup(w_lo, w_hi)
        cur = ValueTracker(1.6)
        dots = flow([lo[0], hi[1]], n=9, speed=cur, color=GOLD, r=0.07)
        self.go("4:02.86", FadeIn(w_lo), FadeIn(disk), FadeIn(w_hi), run=0.6)
        up = Arrow(P((0, 3.0, 0)) + RIGHT * 0.45 + DOWN * 0.9, P((0, 3.0, 0)) + RIGHT * 0.45, buff=0, color=GOLD, stroke_width=5)
        ilab = T("current", 30, GOLD).next_to(up, RIGHT, buff=0.15)
        self.play(FadeIn(dots), FadeIn(up), FadeIn(ilab), run_time=0.4)

        # Oersted's compass on the disk: swings from radial to tangent (along B)
        thc, rc = -0.75, 1.65
        Q = np.array([rc * np.cos(thc), 0, -rc * np.sin(thc)])
        face = Polygon(*[P(Q + 0.6 * np.array([np.cos(t), 0, np.sin(t)])) for t in np.linspace(0, TAU, 60)[:-1]],
                       fill_color="#0b1424", fill_opacity=1, stroke_color=INK, stroke_width=3)
        phi = ValueTracker(thc + PI)  # needle direction in the disk plane (radial, pointing at the wire)

        def half(sgn):
            f = phi.get_value()
            D = sgn * np.array([np.cos(f), 0, -np.sin(f)])
            Dp = np.array([np.sin(f), 0, np.cos(f)])
            return [P(Q + 0.52 * D), P(Q + 0.11 * Dp), P(Q - 0.11 * Dp), P(Q + 0.52 * D)]

        nN = VMobject(fill_color=CORAL, fill_opacity=1, stroke_width=0).set_points_as_corners(half(1))
        nS = VMobject(fill_color=INK, fill_opacity=1, stroke_width=0).set_points_as_corners(half(-1))
        nN.add_updater(lambda m: m.set_points_as_corners(half(1)))
        nS.add_updater(lambda m: m.set_points_as_corners(half(-1)))
        comp = VGroup(face, nS, nN)
        self.go("4:05.66", FadeIn(face), FadeIn(nS), FadeIn(nN), run=0.4)
        self.play(phi.animate.set_value(thc + PI / 2), run_time=1.2, rate_func=rate_functions.ease_out_back)

        # B circles around the wire, arrows show the direction
        rings, arrs = VGroup(), VGroup()
        for i, r in enumerate((0.6, 1.0, 2.35, 2.75)):
            pts = ring(r)
            c = glow(poly(pts, CYAN, 3.5), layers=3, opacity=0.12)
            a = flow(pts, n=3 + i, speed=0.9 + 0.25 * i, color=CYAN, arrows=True)
            rings.add(c)
            arrs.add(a)
        for c, a, t in zip(rings, arrs, ("4:09.92", "4:10.62", "4:11.32", "4:12.02")):
            self.go(t, Create(c), FadeIn(a), run=0.5)
            self.bring_to_front(w_hi, dots, comp)
        swirl = H("swirls around the wire", 44, CYAN).move_to([3.9, -2.75, 0])
        self.play(FadeIn(swirl), run_time=0.3)

        # wire -> coil, circles -> bar-magnet field
        back, front, hel = coil(8, 0.65, 1.7, axis="y", yaw=YAW, pitch=PITCH, center=C + UP * 0.2, glow_c=GOLD)
        cg = VGroup(back, front)
        loops = [l @ np.array([[0, -1, 0], [1, 0, 0], [0, 0, 1]]).T + C + UP * 0.2 for l in field_loops(1.4, (30, 48, 64, 78, 90))]
        lg = VGroup(*[glow(poly(l, CYAN, 3), layers=3, opacity=0.1) for l in loops])
        self.go("4:13.26", FadeOut(VGroup(disk, comp, arrs, dots, up, ilab, swirl, flip)), ReplacementTransform(wire, cg),
                ReplacementTransform(rings, lg), run=1.0)
        bspeed = ValueTracker(1.1)
        mk_lp = lambda: VGroup(*[flow(l, n=8, speed=bspeed, color="#a8eeff", r=0.045) for l in loops])
        mk_cd = lambda: flow(hel, n=30, speed=cur, color=GOLD, r=0.05)
        lp, cdots = mk_lp(), mk_cd()
        self.play(FadeIn(lp), FadeIn(cdots), run_time=0.4)
        em = doodle("electromagnet", [4.5, 1.9, 0], C + UP * 0.2 + RIGHT * 0.85, size=48, angle=-0.6)
        self.go("4:15.76", Write(em[0]), Create(em[1]), run=0.5)

        sw = toggle().move_to([-4.6, -2.0, 0])
        self.go("4:17.20", FadeIn(sw, scale=0.8), run=0.35)
        off_txt = T("OFF", 30, DIM, weight=BOLD).move_to(sw[2])
        self.go("4:18.10", sw[1].animate.shift(LEFT * 0.66).set_color(DIM), sw[0].animate.set_stroke(DIM), Transform(sw[2], off_txt),
                FadeOut(lg), FadeOut(lp), FadeOut(cdots), bspeed.animate.set_value(0), cur.animate.set_value(0), run=0.3)
        on_txt = T("ON", 30, GOLD, weight=BOLD).move_to(sw[2])
        lg2 = VGroup(*[glow(poly(l, CYAN, 3), layers=3, opacity=0.1) for l in loops])
        self.go("4:19.04", sw[1].animate.shift(RIGHT * 0.66).set_color(GOLD), sw[0].animate.set_stroke(GOLD), Transform(sw[2], on_txt),
                FadeIn(lg2), FadeIn(mk_lp()), FadeIn(mk_cd()), bspeed.animate.set_value(1.1), cur.animate.set_value(1.6), run=0.3)


def scale_icon():
    """Balance scale. Returns (group, tilt tracker)."""
    piv = np.array([0, 2.75, 0])
    tilt = ValueTracker(0)
    base = VGroup(Line(piv + DOWN * 1.0, piv, color=INK, stroke_width=4), Line(piv + DOWN * 1.0 + LEFT * 0.4, piv + DOWN * 1.0 + RIGHT * 0.4, color=INK, stroke_width=4),
                  Dot(piv, radius=0.07, color=INK))
    beam = Line(piv + LEFT * 1.2, piv + RIGHT * 1.2, color=INK, stroke_width=4)

    def pan(side):
        g = VGroup(Line(ORIGIN, ORIGIN, color=DIM, stroke_width=2), Line(ORIGIN, ORIGIN, color=DIM, stroke_width=2),
                   Arc(radius=0.35, start_angle=PI, angle=PI, color=INK, stroke_width=4))

        def up(m):
            a = tilt.get_value()
            end = piv + side * 1.2 * np.array([np.cos(a), np.sin(a), 0])
            bowl = end + DOWN * 0.55
            m[2].move_to(bowl + DOWN * 0.17)
            m[0].put_start_and_end_on(end, bowl + LEFT * 0.35)
            m[1].put_start_and_end_on(end, bowl + RIGHT * 0.35)

        up(g)
        g.add_updater(up)
        return g

    beam.add_updater(lambda m: m.set_angle(tilt.get_value()).move_to(piv))
    return VGroup(base, beam, pan(-1), pan(1)), tilt


class Missing(Shot):
    def body(self):
        fr = self.camera.frame
        drive(self, lambda dt: fr.scale(1 - 0.002 * dt))
        lab = label("The missing piece", CORAL)
        full = eq(3, 76).move_to([0, 0.35, 0])
        for p in full[5:]:
            p.set_color(GOLD)
        self.play(FadeIn(lab), FadeIn(full[:5]), run_time=0.5)

        box = DashedVMobject(SurroundingRectangle(full[5:], buff=0.18, color=CORAL, stroke_width=4, corner_radius=0.08), num_dashes=40)
        q = T("?", 72, CORAL, weight=BOLD).move_to(box)
        self.go("4:28.04", Create(box), FadeIn(q, scale=0.6), run=0.5)

        sc, tilt = scale_icon()
        self.go("4:29.88", FadeIn(sc), run=0.3)
        self.play(tilt.animate.set_value(0.24), run_time=0.7, rate_func=rate_functions.ease_out_back)

        term = full[5:]
        halo = term.copy().set_color(GOLD)
        hg = VGroup(*[halo.copy().set_fill(opacity=0).set_stroke(GOLD, width=4 + 5 * i, opacity=0.035) for i in range(4)])
        self.go("4:31.58", FadeOut(q), FadeOut(box), FadeIn(term, scale=1.25), FadeIn(hg), Flash(term.get_center(), color=GOLD, flash_radius=1.6, line_length=0.5, num_lines=14),
                run=0.6)
        self.play(tilt.animate.set_value(0), run_time=0.9, rate_func=rate_functions.ease_out_back)
        clk = tracker_time(self)
        hg.add_updater(lambda m: m.set_stroke(opacity=0.035 + 0.025 * np.sin(3 * clk.get_value())))
        self.go("4:37.82", Indicate(term, color=GOLD, scale_factor=1.15), run=0.8)

        # a changing E in empty space makes B loops around it
        eqg = VGroup(full, hg)
        self.go("4:39.40", FadeOut(sc), eqg.animate.scale(0.82).move_to([0, 2.35, 0]), run=0.6)
        clock = clk
        ctr = np.array([0, -1.3, 0])
        Ew = 2.3
        Eof = lambda: 2.6 + 0.8 * np.sin(Ew * clock.get_value())
        dE = lambda: np.cos(Ew * clock.get_value())
        arrow = Arrow(ctr + DOWN, ctr + UP, buff=0, color=GOLD, stroke_width=9)
        arrow.add_updater(lambda m: m.become(Arrow(ctr + DOWN * Eof() / 2, ctr + UP * Eof() / 2, buff=0, color=GOLD, stroke_width=9, max_tip_length_to_length_ratio=0.18)))
        ag = Line(ctr + DOWN * 1.4, ctr + UP * 1.4, color=GOLD, stroke_width=26, stroke_opacity=0.08)
        ag.add_updater(lambda m: m.put_start_and_end_on(ctr + DOWN * Eof() / 2, ctr + UP * Eof() / 2))
        rings, arrs = VGroup(), VGroup()
        for r in (1.0, 1.7, 2.4):
            th = np.linspace(0, TAU, 140)
            pts = np.array([proj((r * np.cos(t), 0, -r * np.sin(t)), 0, 0.45, center=ctr) for t in th])
            c = poly(pts, CYAN, 3.5)
            c.add_updater(lambda m: m.set_stroke(opacity=0.25 + 0.75 * abs(dE())))
            rings.add(c)
            arrs.add(flow(pts, n=5, speed=lambda: 1.3 * dE(), color=CYAN, arrows=True))
        elab = H("changing E", 40, GOLD).move_to(ctr + LEFT * 4.2 + UP * 0.9)
        blab = H("B", 44, CYAN).move_to(ctr + RIGHT * 2.85 + DOWN * 0.2)
        self.play(FadeIn(ag), FadeIn(arrow), FadeIn(rings), FadeIn(arrs), FadeIn(elab), FadeIn(blab), run_time=0.6)
        d = doodle("no wire!", [4.7, 0.1, 0], ctr + UP * 1.2 + RIGHT * 0.25, size=46, angle=0.4)
        self.go("4:42.36", Write(d[0]), Create(d[1]), run=0.5)
