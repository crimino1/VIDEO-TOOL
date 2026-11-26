from sa_lib import *


# ------------------------------------------------------------------ Rule 1: charge = sprinkler, field = spray
BA, BB = 1.0, 1.25  # balloon half width / half height


def r_edge(a):
    return 1 / np.sqrt((np.cos(a) / BA) ** 2 + (np.sin(a) / BB) ** 2)


def plus(p, s=0.36):
    g = VGroup(Line(LEFT * s / 2, RIGHT * s / 2), Line(DOWN * s / 2, UP * s / 2)).set_stroke(WHITE, 6).move_to(p)
    return VGroup(glow(g[0].copy(), GOLD, layers=2, opacity=0.15)[:-1], glow(g[1].copy(), GOLD, layers=2, opacity=0.15)[:-1], g)


class Rule1(Shot):
    def body(self):
        drift(self, 0.03)
        clock = tracker_time(self)
        self.add(label("Rule 1 · electric field"))
        c0 = np.array([0, -0.1, 0])
        body = Ellipse(width=2 * BA, height=2 * BB, color=GOLD, stroke_width=6, fill_color=GOLD, fill_opacity=0.08).move_to(c0)
        knot = Polygon(c0 + DOWN * BB, c0 + DOWN * (BB + 0.2) + LEFT * 0.13, c0 + DOWN * (BB + 0.2) + RIGHT * 0.13, color=GOLD, fill_opacity=1, stroke_width=3)
        ys = np.linspace(0, -0.9, 40)
        string = VMobject(stroke_color=DIM, stroke_width=2.5).set_points_smoothly(np.column_stack([0.08 * np.sin(ys * 9), ys, 0 * ys]) + c0 + DOWN * (BB + 0.2))
        shine = Arc(radius=0.62, start_angle=1.9, angle=0.9, color=WHITE, stroke_width=5, stroke_opacity=0.55).move_to(c0 + UL * 0.5)
        balloon = VGroup(glow(body, GOLD, layers=6, opacity=0.08), knot, string, shine)
        self.play(FadeIn(balloon, scale=0.85), run_time=0.6)
        self.play(balloon.animate(rate_func=there_and_back).shift(UP * 0.08), run_time=0.4)

        pp = [(-0.45, 0.55), (0.35, 0.7), (-0.1, 0.1), (0.5, -0.15), (-0.5, -0.4), (0.15, -0.65)]
        pluses = VGroup(*[plus(c0 + np.array([x, y, 0])) for x, y in pp])
        self.go("2:00.06", LaggedStart(*[FadeIn(p, scale=1.8) for p in pluses], lag_ratio=0.18), run=0.9)

        # 20 field arrows, radially out
        angs = np.linspace(0, TAU, 20, endpoint=False) + 0.08
        arrows = VGroup(*[Arrow(c0 + (r_edge(a) + 0.22) * np.array([np.cos(a), np.sin(a), 0]), c0 + (r_edge(a) + 1.6) * np.array([np.cos(a), np.sin(a), 0]),
                                buff=0, color=GOLD, stroke_width=6, max_tip_length_to_length_ratio=0.22) for a in angs])
        self.go("2:02.16", LaggedStart(*[GrowArrow(a) for a in arrows], lag_ratio=0.05), run=1.2)
        ef = T("electric field", 42, GOLD, weight=BOLD).move_to([4.6, -2.85, 0])
        efa = doodle_arrow(ef.get_top() + UP * 0.12 + LEFT * 0.6, c0 + 2.75 * np.array([np.cos(-0.72), np.sin(-0.72), 0]), angle=0.5)
        self.go("2:03.82", FadeIn(ef, shift=UP * 0.15), Create(efa), run=0.5)

        # sprinkler spray: droplets stream out and fade
        N = 340
        rng = np.random.default_rng(4)
        th = rng.uniform(0, TAU, N)
        ph = rng.uniform(0, 1, N)
        sp = rng.uniform(0.85, 1.15, N)
        active = ValueTracker(170)
        rate = ValueTracker(0.5)
        bright = ValueTracker(0.0)
        size0 = body.width
        drops = VGroup(*[Dot(radius=0.05, color=GOLD) for _ in range(N)])
        phase = [0.0]

        def up_drops(g, dt):
            phase[0] += dt * rate.get_value()
            c, k = body.get_center(), body.width / size0
            na, b = active.get_value(), bright.get_value()
            for i, d in enumerate(g):
                f = (ph[i] + phase[0] * sp[i]) % 1
                r = (r_edge(th[i]) + 0.2 + 2.4 * f) * k
                d.move_to(c + r * np.array([np.cos(th[i]), np.sin(th[i]), 0]))
                d.set_fill(opacity=b * (1 - f) ** 1.3 * (i < na))
                d.scale_to_fit_width(0.12 * k * (1 + 0.25 * (rate.get_value() > 0.7)))

        up_drops(drops, 0)
        drops.add_updater(up_drops)
        self.add(drops)
        self.go("2:05.62", bright.animate.set_value(1), FadeOut(arrows, scale=1.15), FadeOut(ef), FadeOut(efa), run=1.0)
        d1 = H("charge = sprinkler", 46).move_to([-3.9, 2.6, 0])
        a1 = doodle_arrow(d1.get_bottom() + DOWN * 0.1 + RIGHT * 0.5, c0 + np.array([-0.95, 0.75, 0]), angle=0.6)
        self.go("2:09.36", Write(d1), Create(a1), run=0.6)
        d2 = H("field = spray", 46, GOLD).move_to([4.1, 2.6, 0])
        a2 = doodle_arrow(d2.get_bottom() + DOWN * 0.1 + LEFT * 0.4, c0 + np.array([2.05, 1.3, 0]), GOLD, angle=-0.6)
        self.go("2:11.08", Write(d2), Create(a2), run=0.6)

        # more charge -> stronger spray
        pp2 = [(0.0, 0.95), (-0.65, 0.15), (0.62, 0.3), (-0.25, -0.95), (0.4, -0.75), (0.15, 0.45)]
        more = VGroup(*[plus(c0 + np.array([x, y, 0]), 0.3) for x, y in pp2])
        m1 = H("more charge", 44).move_to([-4.2, -2.85, 0])
        self.go("2:14.82", LaggedStart(*[FadeIn(p, scale=1.8) for p in more], lag_ratio=0.12), FadeIn(m1, shift=UP * 0.1), run=0.8)
        m2 = H("stronger spray", 44, GOLD).move_to([4.1, -2.85, 0])
        self.go("2:16.14", active.animate.set_value(N), rate.animate.set_value(0.85), FadeIn(m2, shift=UP * 0.1),
                body.animate.set_stroke(width=8), run=0.6)

        # slide left, the equation appears
        e = eq(0, 96).move_to([3.0, 0.25, 0])
        eg = eq_glow(e, layers=4, opacity=0.08)
        tag = H("rule 1", 50, GOLD).next_to(e, DOWN, buff=0.55)
        grp = VGroup(balloon, pluses, more)
        self.go("2:17.48", grp.animate.scale(0.62, about_point=c0).shift(LEFT * 3.6), FadeOut(VGroup(d1, a1, d2, a2, m1, m2)), run=0.7)
        self.play(FadeIn(e, shift=LEFT * 0.3), FadeIn(eg), run_time=0.5)
        self.play(Write(tag), run_time=0.5)


# ------------------------------------------------------------------ Rule 2: snap a magnet
SY, SP, SS, SC = -0.32, -0.38, 1.25, np.array([0, -0.35, 0])
HALF = 2.3   # half length of the whole magnet
HH = 0.55    # half height / depth
GAP, TURN = 1.5, 0.13  # how far each half flies, and its little rotation


def P2(p):
    return proj(p, SY, SP, SS, SC)


def box(x0, x1, color):
    """Visible faces of a magnet block from x0 to x1 (world), shaded."""
    c = [[x0, x1], [-HH, HH], [-HH, HH]]
    faces = VGroup()
    for ax, side in [(0, 0), (0, 1), (1, 0), (1, 1), (2, 0), (2, 1)]:
        n = np.zeros(3)
        n[ax] = 1 if side else -1
        if rot_z(n, SY, SP) >= 0:
            continue
        o = [a for a in range(3) if a != ax]
        pts = []
        for u, v in [(0, 0), (1, 0), (1, 1), (0, 1)]:
            q = [0.0, 0.0, 0.0]
            q[ax] = c[ax][side]
            q[o[0]], q[o[1]] = c[o[0]][u], c[o[1]][v]
            pts.append(P2(q))
        col = ManimColor(color)
        shade = {1: interpolate_color(col, WHITE, 0.3), 2: col, 0: interpolate_color(col, BLACK, 0.35)}[ax]
        faces.add(Polygon(*pts, fill_color=shade, fill_opacity=1, stroke_color=WHITE, stroke_width=1.5))
    return faces


def face_label(s, x, size=76):
    """Letter on the front face (z = -HH) centred at world x."""
    col = WHITE if s == "N" else "#05101c"
    t = T(s, size, col, weight=BOLD).move_to(P2((x, 0, -HH)))
    return t


def magnet3d(x0, x1, labels=True, size=64):
    """Two-colour block: N (coral) on the left half, S (cyan) on the right half. VGroup(s_faces, n_faces, nl, sl)."""
    m = (x0 + x1) / 2
    s, n = box(m, x1, CYAN), box(x0, m, CORAL)  # S first: the N block is nearer the camera
    g = VGroup(s, n, face_label("N", (x0 + m) / 2, size), face_label("S", (m + x1) / 2, size))
    return g


def fly(g, side):
    """Move a half to its 'apart' position (side -1 left, +1 right)."""
    return g.rotate(-side * TURN, about_point=g.get_center()).shift(RIGHT * side * GAP)


def halves_apart():
    """End state of Snap: two blocks apart, N one coral, S one cyan, each one letter."""
    hl = VGroup(box(-HALF, 0, CORAL), face_label("N", -HALF / 2))
    hr = VGroup(box(0, HALF, CYAN), face_label("S", HALF / 2))
    cl, cr = hl[0].get_center(), hr[0].get_center()
    hl.rotate(TURN, about_point=cl).shift(LEFT * GAP)
    hr.rotate(-TURN, about_point=cr).shift(RIGHT * GAP)
    return hl, hr, (cl, cr)


def guesses(hl, hr):
    return (H("north piece?", 50, CORAL).next_to(hl, UP, buff=0.55), H("south piece?", 50, CYAN).next_to(hr, UP, buff=0.55))


class Snap(Shot):
    def body(self):
        drift(self, 0.03)
        clock = tracker_time(self)
        self.add(label("Rule 2 · no lonely north", CYAN))
        hl = VGroup(box(-HALF, 0, CORAL), face_label("N", -HALF / 2))
        hr = VGroup(box(0, HALF, CYAN), face_label("S", HALF / 2))
        whole = VGroup(hr, hl)
        gl = VGroup(*[glow(f.copy(), col, layers=4, width=2, opacity=0.06)[:-1] for h, col in ((hr, CYAN), (hl, CORAL)) for f in h[0]])
        self.play(FadeIn(whole, shift=UP * 0.3), FadeIn(gl), run_time=0.6)
        self.play(whole.animate(rate_func=there_and_back).shift(UP * 0.06), run_time=0.6)
        self.go("2:25.31", Indicate(hl[1], scale_factor=1.45, color=WHITE), run=0.7)
        self.go("2:26.53", Indicate(hr[1], scale_factor=1.45, color=WHITE), run=0.7)
        # snap: white crack flash down the middle, halves fly apart
        top, bot = P2((0, HH, HH)), P2((0, -HH, -HH))
        mid = P2((0, HH, -HH))
        ys = np.linspace(0, 1, 9)
        crack = VMobject(stroke_color=WHITE, stroke_width=7).set_points_as_corners(
            [interpolate(top, mid, t) + RIGHT * (0.08 * (-1) ** i) for i, t in enumerate(ys[:5])] +
            [interpolate(mid, bot, t) + RIGHT * (0.09 * (-1) ** i) for i, t in enumerate(ys[1:])])
        cg = glow(crack, WHITE, layers=5, opacity=0.15)
        self.go("2:28.11", Create(cg), Flash(mid + DOWN * 0.4, color=WHITE, flash_radius=0.9, line_length=0.5, num_lines=14), run=0.3)
        cl, cr = hl[0].get_center(), hr[0].get_center()
        self.play(FadeOut(cg), FadeOut(gl), hl.animate.rotate(TURN, about_point=cl).shift(LEFT * GAP), hr.animate.rotate(-TURN, about_point=cr).shift(RIGHT * GAP),
                  run_time=0.55, rate_func=rate_functions.ease_out_back)
        # little bob so nothing freezes
        y0l, y0r = hl.get_center()[1], hr.get_center()[1]
        hl.add_updater(lambda m: m.set_y(y0l + 0.05 * np.sin(1.8 * clock.get_value())))
        hr.add_updater(lambda m: m.set_y(y0r + 0.05 * np.sin(1.8 * clock.get_value() + 1.5)))
        gn, gs = guesses(*halves_apart()[:2])
        self.go("2:30.85", Write(gn), run=0.5)
        self.play(Write(gs), run_time=0.5)


class Snap2(Shot):
    def body(self):
        drift(self, 0.03, start=0.97)
        clock = tracker_time(self)
        lab = label("Rule 2 · no lonely north", CYAN)
        hl, hr, (cl, cr) = halves_apart()
        gn, gs = guesses(hl, hr)
        self.add(lab, hl, hr, gn, gs)
        # each half is a full small magnet: own N and S
        ml, mr = magnet3d(-HALF, 0, size=62), magnet3d(0, HALF, size=62)
        ml.rotate(TURN, about_point=cl).shift(LEFT * GAP)
        mr.rotate(-TURN, about_point=cr).shift(RIGHT * GAP)
        self.play(FadeOut(gn), FadeOut(gs), FadeTransform(hl, VGroup(ml[0], ml[1])), FadeTransform(hr, VGroup(mr[0], mr[1])), run_time=0.6)
        bodies = VGroup(ml[:2], mr[:2])
        self.play(bodies.animate(rate_func=there_and_back).scale(1.04), run_time=0.8)
        self.go("2:36.80", LaggedStart(*[FadeIn(m[k], scale=1.6) for m in (ml, mr) for k in (2, 3)], lag_ratio=0.25), run=0.8)
        tag = H("both have N and S!", 46).move_to([0, 2.15, 0])
        self.play(Write(tag), run_time=0.6)

        # keep cutting: 4, 8, 16, 32 flat magnets, then tiny atoms
        def flat(w, h):
            return VGroup(Rectangle(width=w / 2, height=h, stroke_width=0, fill_color=CORAL, fill_opacity=1).shift(LEFT * w / 4),
                          Rectangle(width=w / 2, height=h, stroke_width=0, fill_color=CYAN, fill_opacity=1).shift(RIGHT * w / 4))

        def grid(cols, rows, w, h, gx, gy):
            g = VGroup(*[flat(w, h) for _ in range(cols * rows)])
            g.arrange_in_grid(rows, cols, buff=(gx, gy)).move_to([0, -0.3, 0])
            return g

        levels = [(2, 2, 3.4, 0.8, 1.2, 1.1), (4, 2, 2.2, 0.55, 0.65, 1.0), (4, 4, 1.9, 0.44, 0.8, 0.55), (8, 4, 1.05, 0.3, 0.4, 0.55)]
        cur = VGroup(ml, mr)
        times = ["2:39.78", "2:40.28", "2:40.76", "2:41.24"]
        for (cols, rows, w, h, gx, gy), t in zip(levels, times):
            nxt = grid(cols, rows, w, h, gx, gy)
            src = VGroup(*[cur[i * len(cur) // len(nxt)].copy() for i in range(len(nxt))])
            extra = [FadeOut(tag)] if t == times[0] else []
            self.at(t)
            self.remove(*cur.get_family())
            self.play(ReplacementTransform(src, nxt), *extra, run_time=0.4)
            cur = nxt
        atoms = grid(16, 8, 0.36, 0.14, 0.32, 0.4)
        src = VGroup(*[cur[i // 4].copy() for i in range(len(atoms))])
        al = H("down to tiny atoms", 46).move_to([0, 2.55, 0])
        self.at("2:41.76")
        self.remove(*cur.get_family())
        self.play(ReplacementTransform(src, atoms), FadeIn(al), run_time=0.5)
        atoms.add_updater(lambda m: [a.set_opacity(0.55 + 0.45 * np.sin(3 * clock.get_value() + 0.7 * i)) for i, a in enumerate(m)] and None)
        # never a north on its own
        lone = VGroup(glow(Rectangle(width=2.0, height=1.4, color=CORAL, fill_color=CORAL, fill_opacity=1, stroke_width=3), CORAL, layers=5, opacity=0.1),
                      T("N", 90, WHITE, weight=BOLD)).move_to([0, -0.3, 0])
        back = BackgroundRectangle(lone, color=BG, fill_opacity=0.85, buff=0.45)
        x = cross(lone[0][-1].copy().scale(1.7), width=14)
        self.go("2:42.92", FadeOut(al), FadeIn(back), FadeIn(lone, scale=1.3), run=0.45)
        self.play(Create(x), run_time=0.4)
        self.play(lone.animate(rate_func=there_and_back).shift(RIGHT * 0.12), run_time=0.25)
