from common import *

GREEK = "Segoe Print"


def big_word(s, size=130, color=CHALK, seed=3):
    w = Text(s, font=HAND, weight=BOLD, font_size=size, color=color)
    return VGroup(w, brush_line(w.width + 0.6, center=w.get_bottom() + DOWN * 0.12, seed=seed))


def sector_at(V, P, Q, r=0.6, color=YEL, opacity=0.75):
    """Filled wedge at vertex V, counter-clockwise from ray V->P to ray V->Q."""
    V = np.array(V, float)
    a1 = np.arctan2(*(np.array(P) - V)[[1, 0]])
    a2 = np.arctan2(*(np.array(Q) - V)[[1, 0]])
    d = (a2 - a1) % TAU
    s = Sector(radius=r, angle=d, start_angle=a1, fill_color=color, fill_opacity=opacity, stroke_width=0)
    s.shift(V)
    return s, a1, d


def ray_angle(V, deg, L=1.4, color=CHALK, width=5):
    V = np.array(V, float)
    a = np.radians(deg)
    return Line(V, V + L * np.array([np.cos(a), np.sin(a), 0]), color=color, stroke_width=width)


class K01_Welcome(Shot):
    def body(self):
        word = big_word("Trigonometry").move_to(UP * 0.6)
        self.go(0.2, Write(word[0]), run=1.6)
        self.play(Create(word[1]), run_time=0.5)
        every = pill("EVERYTHING", YEL, 46).next_to(word, DOWN, buff=0.6)
        self.go(4.94, FadeIn(every, scale=1.4), run=0.4)
        lo = H("the very basics", 44, BLUE).move_to([-4.2, -2.5, 0])
        hi = H("very advanced", 44, PINK).move_to([4.2, -2.5, 0])
        arr = Arrow(lo.get_right(), hi.get_left(), buff=0.3, color=CHALK, stroke_width=5)
        self.go(6.2, FadeIn(lo, shift=UP * 0.2), run=0.4)
        self.play(GrowArrow(arr), run_time=1.4)
        self.go(8.6, FadeIn(hi, shift=UP * 0.2), run=0.4)
        q1 = H("never understood it?", 46, CHALK).move_to([-3.4, -0.9, 0])
        q2 = H("forgot all of it?", 46, CHALK).move_to([3.4, -0.9, 0])
        self.go(9.9, FadeOut(every), FadeOut(lo), FadeOut(hi), FadeOut(arr), word.animate.shift(UP * 0.6), run=0.4)
        self.go(10.4, FadeIn(q1, shift=UP * 0.2), run=0.4)
        self.go(12.6, FadeIn(q2, shift=UP * 0.2), run=0.4)
        ok = H("don't worry", 54, GRN).move_to(DOWN * 2.3)
        self.go(14.2, FadeIn(ok, scale=1.2), run=0.4)
        tk = tick_mark(GRN, 0.7).next_to(ok, RIGHT, buff=0.3)
        self.go(17.6, Create(tk), Circumscribe(ok, color=GRN, fade_out=True), run=0.8)
        # what's inside: topic pills
        self.go(18.7, FadeOut(q1), FadeOut(q2), FadeOut(ok), FadeOut(tk), word.animate.scale(0.55).to_edge(UP, buff=0.25), run=0.5)
        topics = [("Sine", 19.10, PINK), ("Cosine", 20.10, BLUE), ("Tangent", 20.76, GRN), ("Unit Circle", 21.46, YEL),
                  ("Graphs", 22.42, ORG), ("Identities", 23.14, PURP), ("Equations", 24.02, PINK), ("& much more", 24.96, CHALK)]
        pls = [pill(t, c, 42) for t, _, c in topics]
        VGroup(*pls[:4]).arrange(RIGHT, buff=0.45).move_to(UP * 0.9)
        VGroup(*pls[4:]).arrange(RIGHT, buff=0.45).move_to(DOWN * 0.7)
        for (t, at, c), pl in zip(topics, pls):
            self.go(at, FadeIn(pl, scale=1.3), run=0.3)
        one = H("One video.", 56, YEL).move_to([-2.4, -2.6, 0])
        st = H("Start to finish.", 56, YEL).move_to([2.6, -2.6, 0])
        self.go(25.94, Write(one), run=0.6)
        self.go(27.02, Write(st), run=0.6)
        self.wipe(28.35)
        why = big_word("Why does it matter?", 96, seed=5)
        self.go(29.6, Write(why[0]), run=1.0)
        self.play(Create(why[1]), run_time=0.4)


class K01_Name(Shot):
    def body(self):
        word = big_word("Trigonometry", 140, seed=7).move_to(UP * 0.3)
        self.go(52.6, Write(word[0]), run=1.1)
        self.play(Create(word[1]), run_time=0.4)
        bad = H("...bad memories", 54, RED).next_to(word, DOWN, buff=0.7)
        self.go(57.66, FadeIn(bad, shift=DOWN * 0.2), word.animate.set_color(FAINT), run=0.6)
        self.play(Wiggle(word, scale_value=1.04, rotation_angle=0.03 * TAU), run_time=0.8)
        scary = [(M(r"\sin\theta", size=80, color=PINK), [-5.2, 2.0, 0], 12, 59.74),
                 (M(r"\cos\theta", size=80, color=BLUE), [5.0, 2.1, 0], -10, 60.66),
                 (M(r"\tan\theta", size=80, color=GRN), [4.6, -2.6, 0], 8, 61.62)]
        for m, p, rot, at in scary:
            m.move_to(p).rotate(rot * DEGREES)
            self.go(at, FadeIn(m, scale=2.2), run=0.25)
        self.play(*[Wiggle(m) for m, *_ in scary], run_time=0.6)


class K01_GoodNews(Shot):
    def body(self):
        a = H("Trigonometry is", 76).move_to([-1.3, 1.1, 0])
        hard = H("hard", 76, RED).next_to(a, RIGHT, buff=0.35)
        self.go(80.3, FadeIn(a), FadeIn(hard), run=0.4)
        no = H("NOT", 76, GRN)
        self.go(81.2, a.animate.shift(LEFT * 1.0), hard.animate.shift(RIGHT * 1.5), run=0.3)
        no.move_to((a.get_right() + hard.get_left()) / 2 + UP * 0.02)
        self.play(FadeIn(no, scale=1.6), run_time=0.3)
        b = H("It was just explained", 64).move_to([-1.2, -0.4, 0])
        badly = H("badly.", 64, RED).next_to(b, RIGHT, buff=0.3)
        self.go(82.4, FadeIn(b, shift=UP * 0.2), run=0.4)
        self.go(83.3, FadeIn(badly), run=0.3)
        self.play(Create(Underline(badly, color=RED, stroke_width=5)), run_time=0.4)
        fix = H("Today, we fix that.", 66, YEL).move_to(DOWN * 2.1)
        self.go(84.5, Write(fix), run=1.2)
        tk = tick_mark(GRN, 0.8).next_to(fix, RIGHT, buff=0.35)
        self.go(86.1, Create(tk), run=0.4)


class K01_Plan(Shot):
    def body(self):
        self.title("The Plan", 87.1)
        n = 11
        xs = np.linspace(-5.3, 5.6, n)
        pts = [np.array([x, -2.9 + 4.3 * i / (n - 1), 0]) for i, x in enumerate(xs)]
        stops = [("absolute zero", 89.40, CHALK), ("Angle", 91.20, YEL), ("Triangle", 92.40, YEL), ("Unit Circle", 96.40, BLUE),
                 ("Graphs", 97.50, PINK), ("Identities", 98.40, GRN), ("Equations", 99.36, ORG), ("Sine & Cosine\nLaws", 100.56, PURP),
                 ("Polar", 102.54, BLUE), ("Complex\nNumbers", 103.80, PINK), (None, 105.5, YEL)]
        dots = []
        for i, (lab, at, c) in enumerate(stops):
            d = Dot(pts[i], radius=0.11, color=c)
            anims = [FadeIn(d, scale=2)]
            if i:
                seg_ = Line(pts[i - 1], pts[i], color=FAINT, stroke_width=5)
                self.add(seg_.set_z_index(-1))
                seg_.set_opacity(0)
                anims.append(seg_.animate.set_opacity(1))
            if lab:
                t = H(lab, 32 if "\n" not in lab else 30, c)
                t.next_to(d, UP if i % 2 else DOWN, buff=0.22)
                anims.append(FadeIn(t, shift=UP * 0.15))
            self.go(at, *anims, run=0.35)
            dots.append(d)
        star = Star(5, outer_radius=0.28, color=YEL, fill_opacity=1).move_to(pts[-1])
        eu = M(r"e^{i\pi}+1=0", size=72, color=YEL).move_to([4.0, -1.5, 0])
        arr = CurvedArrow(star.get_bottom() + DOWN * 0.15, eu.get_top() + UP * 0.15 + RIGHT * 0.9, angle=-0.6, color=YEL, stroke_width=4)
        self.go(105.9, FadeIn(star, scale=2), run=0.35)
        self.go(106.3, Create(arr), Write(eu), run=1.0)
        self.play(Circumscribe(eu, color=YEL, fade_out=True), run_time=1.0)


class K01_Practice(Shot):
    def body(self):
        self.title("Along the way: practice", 109.4)
        y = 0.3
        pause = VGroup(RoundedRectangle(width=0.32, height=1.2, corner_radius=0.08, fill_color=CHALK, fill_opacity=1, stroke_width=0).shift(LEFT * 0.3),
                       RoundedRectangle(width=0.32, height=1.2, corner_radius=0.08, fill_color=CHALK, fill_opacity=1, stroke_width=0).shift(RIGHT * 0.3))
        pencil = VGroup(Polygon([-0.7, -0.5, 0], [-0.5, -0.7, 0], [0.6, 0.4, 0], [0.4, 0.6, 0], color=YEL, stroke_width=5),
                        Polygon([-0.7, -0.5, 0], [-0.82, -0.82, 0], [-0.5, -0.7, 0], color=YEL, stroke_width=5))
        check = tick_mark(GRN, 1.4)
        icons = [(pause, "pause", -4.6, 113.26, CHALK), (pencil, "solve", 0, 114.62, YEL), (check, "check", 4.6, 115.94, GRN)]
        prev = None
        for ic, lab, x, at, c in icons:
            ic.move_to([x, y, 0])
            ring = Circle(radius=1.15, color=c, stroke_width=4).move_to([x, y, 0])
            t = H(lab, 44, c).move_to([x, y - 1.6, 0])
            anims = [FadeIn(ring, scale=1.3), FadeIn(ic, scale=1.3), FadeIn(t)]
            if prev is not None:
                anims.append(GrowArrow(Arrow(prev.get_right(), ring.get_left(), buff=0.2, color=FAINT, stroke_width=5)))
            self.go(at - 0.15, *anims, run=0.4)
            prev = ring
        sport = H("math is not a spectator sport", 50, YEL).move_to(DOWN * 2.85)
        self.go(116.9, Write(sport), run=1.2)
        self.wipe(119.45)
        pen = VGroup(Line([-0.9, -0.9, 0], [0.9, 0.9, 0], color=BLUE, stroke_width=14), Dot([0.95, 0.95, 0], radius=0.09, color=CHALK)).move_to([-3.6, 0.2, 0])
        paper = VGroup(Rectangle(width=2.0, height=2.6, color=CHALK, stroke_width=4),
                       *[Line([-0.7, 0.8 - 0.4 * k, 0], [0.7, 0.8 - 0.4 * k, 0], color=FAINT, stroke_width=3) for k in range(5)]).move_to([0, 0.2, 0])
        self.go(119.74, FadeIn(pen, shift=UP * 0.3), FadeIn(H("grab a pen", 44, BLUE).move_to([-3.6, -1.75, 0])), run=0.4)
        self.go(120.72, FadeIn(paper, shift=UP * 0.3), FadeIn(H("some paper", 44).move_to([0, -1.75, 0])), run=0.4)
        go = H("let's begin!", 70, YEL).move_to([3.9, 0.2, 0])
        self.go(121.94, FadeIn(go, scale=1.5), run=0.4)


class K01_Greek(Shot):
    def body(self):
        self.title("Where the word comes from", 127.6)
        a = Text("trigono", font=HAND, weight=BOLD, font_size=110, color=YEL)
        b = Text("metry", font=HAND, weight=BOLD, font_size=110, color=BLUE)
        w = VGroup(a, b).arrange(RIGHT, buff=0.05).move_to(UP * 1.45)
        self.go(128.15, Write(w), run=0.9)
        g1 = VGroup(Text("τρίγωνον", font=GREEK, font_size=52, color=YEL), H("trigonon", 36, DIM)).arrange(DOWN, buff=0.12).move_to([-3.6, 0.0, 0])
        g2 = VGroup(Text("μέτρον", font=GREEK, font_size=52, color=BLUE), H("metron", 36, DIM)).arrange(DOWN, buff=0.12).move_to([3.6, 0.0, 0])
        m1 = H("= triangle", 50).move_to([-3.9, -1.25, 0])
        m2 = H("= measure", 50).move_to([3.3, -1.25, 0])
        tri = Polygon([-0.5, -0.35, 0], [0.5, -0.35, 0], [0.1, 0.45, 0], color=YEL, stroke_width=5).next_to(m1, RIGHT, buff=0.3)
        rul = VGroup(Rectangle(width=1.1, height=0.32, color=BLUE, stroke_width=4),
                     *[Line([-0.45 + 0.15 * k, 0.16, 0], [-0.45 + 0.15 * k, 0.16 - (0.14 if k % 2 else 0.08), 0], color=BLUE, stroke_width=3) for k in range(7)]).next_to(m2, RIGHT, buff=0.3)
        self.go(130.2, FadeIn(g1, shift=DOWN * 0.2), run=0.4)
        self.go(130.8, FadeIn(m1), Create(tri), run=0.5)
        self.go(132.2, FadeIn(g2, shift=DOWN * 0.2), run=0.4)
        self.go(132.7, FadeIn(m2), Create(rul), run=0.5)
        res = H("trigonometry = triangle measuring", 54, CHALK).move_to(DOWN * 2.85)
        self.go(134.0, FadeIn(res, shift=UP * 0.2), run=0.5)
        self.go(136.0, Create(box(res, GRN)), run=0.6)
        self.wipe(137.8)
        q = H("Why care so much about triangles?", 66, YEL)
        self.go(138.3, Write(q), run=1.4)


class K01_Everywhere(Shot):
    def body(self):
        self.title("Triangles are everywhere", 141.3)
        P = [np.array(p) for p in ([-3.4, -2.6, 0], [1.8, -2.9, 0], [3.9, -0.9, 0], [2.6, 1.4, 0], [-0.4, 1.9, 0], [-3.9, 0.6, 0])]
        poly = Polygon(*P, color=CHALK, stroke_width=5)
        lab = H("any shape with straight edges...", 44, DIM).move_to([0, -3.45, 0])
        self.go(143.8, Create(poly), FadeIn(lab), run=0.9)
        cols = [PINK, BLUE, GRN, YEL]
        tris = VGroup(*[Polygon(P[0], P[k], P[k + 1], stroke_width=0, fill_color=cols[k - 1], fill_opacity=0.35) for k in range(1, 5)])
        diags = VGroup(*[Line(P[0], P[k], color=YEL, stroke_width=4) for k in range(2, 5)])
        self.go(145.3, LaggedStart(*[Create(d) for d in diags], lag_ratio=0.3), run=0.8)
        self.play(LaggedStart(*[FadeIn(t) for t in tris], lag_ratio=0.25), run_time=0.6)


class K01_Property(Shot):
    def body(self):
        self.title("A special property", 155.0)
        s = 0.72
        C = np.array([-5.6, -2.4, 0])
        A = C + s * np.array([6, 0, 0])
        B = C + s * np.array([5 * np.cos(np.radians(40)), 5 * np.sin(np.radians(40)), 0])
        tri = Polygon(C, A, B, color=CHALK, stroke_width=5)
        self.go(155.5, Create(tri), run=0.8)
        k1 = side_label(C, A, "6", BLUE, 52, side=-1)
        k2 = side_label(C, B, "5", BLUE, 52, side=1)
        kc = angle_arc(C, A, B, r=0.65, color=YEL, label=r"40^\circ", label_size=40, label_buff=0.42)
        known = H("know a few things...", 42, YEL).move_to([3.0, 1.2, 0])
        self.go(157.8, FadeIn(k1), FadeIn(k2), FadeIn(kc), FadeIn(known), run=0.5)
        u1 = side_label(A, B, "?", PINK, 60, side=-1)
        uA = M("?", size=52, color=PINK).move_to(A + np.array([-0.75, 0.28, 0]))
        uB = M("?", size=52, color=PINK).move_to(B + np.array([0.05, -0.6, 0]))
        self.go(159.2, FadeIn(u1, scale=1.5), FadeIn(uA, scale=1.5), FadeIn(uB, scale=1.5), run=0.4)
        rest = H("...figure out everything else", 42, PINK).move_to([3.0, 0.3, 0])
        self.go(160.4, FadeIn(rest), run=0.4)
        v1 = side_label(A, B, r"3.88", PINK, 44, side=-1)
        vA = M(r"56^\circ", size=40, color=PINK).move_to(A + np.array([-0.95, 0.3, 0]))
        vB = M(r"84^\circ", size=40, color=PINK).move_to(B + np.array([0.0, -0.75, 0]))
        self.go(160.9, Transform(u1, v1), Transform(uA, vA), Transform(uB, vB), run=0.8)
        con = VGroup(H("angles", 60, YEL), DoubleArrow(LEFT, RIGHT, color=CHALK, stroke_width=5, tip_length=0.25).scale(0.8), H("lengths", 60, BLUE)).arrange(RIGHT, buff=0.35).move_to([3.0, -1.6, 0])
        self.go(162.5, FadeOut(known), FadeOut(rest), run=0.3)
        self.go(164.7, FadeIn(con[0]), run=0.3)
        self.play(GrowFromCenter(con[1]), run_time=0.3)
        self.go(165.85, FadeIn(con[2]), run=0.3)
        self.play(Create(panel(con, PURP, buff=0.3)), run_time=0.5)


class K01_Angle(Shot):
    def body(self):
        self.title("What is an angle?", 167.0)
        V = np.array([-2.6, -1.6, 0])
        r1 = ray_angle(V, 0, 4.4)
        r2 = ray_angle(V, 0, 4.4)
        self.go(168.8, Create(r1), Create(r2), run=0.4)
        ang = ValueTracker(0.001)
        r2.add_updater(lambda m: m.put_start_and_end_on(V, V + 4.4 * np.array([np.cos(ang.get_value()), np.sin(ang.get_value()), 0])))
        arc = always_redraw(lambda: Arc(radius=1.1, start_angle=0, angle=ang.get_value(), arc_center=V, color=YEL, stroke_width=5))
        self.add(arc)
        turn = H("amount of turn", 44, YEL).move_to([2.8, 1.7, 0])
        self.go(169.75, ang.animate.set_value(np.radians(50)), FadeIn(turn), run=0.9)
        two = H("two lines", 40, DIM).move_to(V + np.array([3.4, -0.45, 0]))
        self.go(171.0, FadeIn(two), run=0.3)
        vd = Dot(V, radius=0.12, color=PINK)
        self.go(171.8, FadeIn(vd, scale=2.5), run=0.3)
        vl = H("vertex", 46, PINK).next_to(vd, DL, buff=0.15)
        self.go(173.9, FadeIn(vl, shift=UP * 0.2), run=0.4)
        deg = M(r"50^\circ", size=60, color=YEL).move_to(V + 1.7 * np.array([np.cos(np.radians(25)), np.sin(np.radians(25)), 0]))
        self.go(176.6, FadeIn(deg, scale=1.4), run=0.4)
        r2.clear_updaters()
        self.wipe(177.9)
        # full, half, quarter turn
        cx = [-4.5, 0.0, 4.5]
        y = -0.4
        for x, frac, lab, at, name in [(cx[0], 1.0, r"360^\circ", 178.2, "full turn"), (cx[1], 0.5, r"180^\circ", 182.7, "half turn"), (cx[2], 0.25, r"90^\circ", 185.4, "quarter turn")]:
            O = np.array([x, y, 0])
            fixed = ray_angle(O, 0, 1.6)
            mov = ray_angle(O, 0, 1.6, color=YEL)
            t = ValueTracker(0.001)
            mov.add_updater(lambda m, O=O, t=t: m.put_start_and_end_on(O, O + 1.6 * np.array([np.cos(t.get_value()), np.sin(t.get_value()), 0])))
            a = always_redraw(lambda O=O, t=t: Arc(radius=0.7, start_angle=0, angle=t.get_value(), arc_center=O, color=YEL, stroke_width=5))
            nm = H(name, 40, DIM).move_to([x, y - 2.15, 0])
            self.go(at, FadeIn(fixed), FadeIn(mov), FadeIn(nm), run=0.25)
            self.add(a)
            run = {1.0: 2.2, 0.5: 1.2, 0.25: 1.0}[frac]
            self.play(t.animate.set_value(TAU * frac - 0.001), run_time=run, rate_func=smooth)
            mov.clear_updaters()
            lb = M(lab, size=58, color=YEL).move_to([x, y + 2.05, 0])
            self.play(FadeIn(lb, scale=1.3), run_time=0.3)
            if frac == 0.25:
                self.remove(a)
                sq = right_angle_mark(O, O + RIGHT, O + UP, size=0.4, color=YEL)
                self.add(sq)
        ra = pill("right angle", YEL, 40).move_to([cx[2], y - 3.05, 0])
        self.go(189.8, FadeIn(ra, scale=1.3), run=0.35)


class K01_Types(Shot):
    def body(self):
        O = np.array([0, -0.5, 0])
        circ = Circle(radius=2.3, color=CHALK, stroke_width=4).move_to(O)
        self.go(199.5, Create(circ), run=0.6)
        spokes = VGroup(*[Line(O, O + 2.3 * np.array([np.cos(a), np.sin(a), 0]), color=YEL, stroke_width=1.2, stroke_opacity=0.7) for a in np.linspace(0, TAU, 360, endpoint=False)])
        self.play(Create(spokes, lag_ratio=0.01), run_time=1.0)
        lab = H("360 slices", 54, YEL).move_to([4.6, 1.4, 0])
        self.go(201.2, FadeIn(lab), run=0.4)
        st = H("...and it stuck.", 46, DIM).move_to([4.6, 0.5, 0])
        self.go(202.6, FadeIn(st), run=0.3)
        self.wipe(203.45)
        self.title("Types of angles", animate=False)
        xs = [-5.2, -1.75, 1.75, 5.2]
        specs = [(40, "acute", r"< 90^\circ", 203.9, 205.9, GRN), (90, "right", r"= 90^\circ", 206.9, 208.1, YEL),
                 (130, "obtuse", r"90^\circ\!-\!180^\circ", 209.1, 211.0, ORG), (180, "straight", r"= 180^\circ", 211.9, 213.7, PINK)]
        for x, (deg, name, rng, at, at2, c) in zip(xs, specs):
            V = np.array([x - (0.65 if deg < 90 else (0.2 if deg == 90 else 0.0)), -0.6, 0])
            L = 1.45
            r1 = ray_angle(V, 0, L)
            r2 = ray_angle(V, deg, L)
            mark = right_angle_mark(V, V + RIGHT, V + UP, size=0.35, color=c) if deg == 90 else Arc(radius=0.5, start_angle=0, angle=np.radians(deg), arc_center=V, color=c, stroke_width=5)
            self.go(at, Create(r1), Create(r2), Create(mark), run=0.5)
            nm = H(name, 48, c).move_to([x, -1.6, 0])
            rg = M(rng, size=44, color=CHALK).move_to([x, -2.45, 0])
            self.go(at2, FadeIn(nm, shift=UP * 0.2), FadeIn(rg), run=0.35)


class K01_Rule(Shot):
    def body(self):
        self.title("The 180° rule", 216.0)
        A, B, C = np.array([-5.6, -1.9, 0]), np.array([-0.9, -1.9, 0]), np.array([-3.9, 1.5, 0])
        tri = Polygon(A, B, C, color=CHALK, stroke_width=5)
        self.go(216.5, Create(tri), run=0.8)
        sA, a1, dA = sector_at(A, B, C, color=PINK)
        sB, b1, dB = sector_at(B, C, A, color=BLUE)
        sC, c1, dC = sector_at(C, A, B, color=GRN)
        gl = [M(r"\alpha", size=48, color=PINK).move_to(A + [1.0, 0.35, 0]), M(r"\beta", size=48, color=BLUE).move_to(B + [-0.95, 0.38, 0]),
              M(r"\gamma", size=48, color=GRN).move_to(C + [0.05, -1.0, 0])]
        self.go(218.3, LaggedStart(*[FadeIn(s) for s in (sA, sB, sC)], *[FadeIn(g) for g in gl], lag_ratio=0.2), run=0.9)
        P = np.array([3.6, -1.6, 0])
        base = Line(P + LEFT * 2.6, P + RIGHT * 2.6, color=CHALK, stroke_width=5)
        self.go(220.3, Create(base), run=0.4)
        tgt = []
        start = 0
        for s, d, col in ((sA, dA, PINK), (sB, dB, BLUE), (sC, dC, GRN)):
            t = Sector(radius=1.3, angle=d, start_angle=start, fill_color=col, fill_opacity=0.75, stroke_width=0).shift(P)
            start += d
            tgt.append(t)
        self.play(*[Transform(s.copy(), t) for s, t in zip((sA, sB, sC), tgt)], run_time=0.7)
        eq = M(r"\alpha", "+", r"\beta", "+", r"\gamma", "=", r"180^\circ", size=60)
        eq[0].set_color(PINK); eq[2].set_color(BLUE); eq[4].set_color(GRN); eq[6].set_color(YEL)
        eq.move_to([3.6, 1.35, 0])
        self.go(221.4, Write(eq), run=0.9)
        al = H("always.", 52, YEL).next_to(eq, DOWN, buff=0.25)
        self.go(223.2, FadeIn(al, scale=1.3), run=0.3)
        self.wipe(223.8)
        tris = [(Polygon([-6.0, -2.4, 0], [-2.6, -2.4, 0], [-4.6, 0.9, 0]), "big", 224.25),
                (Polygon([-0.8, -2.4, 0], [0.7, -2.4, 0], [-0.2, -1.2, 0]), "small", 225.55),
                (Polygon([2.4, -2.4, 0], [6.2, -2.4, 0], [6.6, -1.5, 0]), "weird", 226.7)]
        for poly, nm, at in tris:
            poly.set_stroke(CHALK, 5)
            lab = H(nm, 42, DIM).next_to(poly, DOWN, buff=0.2)
            self.go(at, Create(poly), FadeIn(lab), run=0.45)
        stamps = [M(r"180^\circ", size=56, color=YEL).next_to(p, UP, buff=0.3) for p, *_ in tris]
        self.go(227.95, *[FadeIn(s, scale=1.6) for s in stamps], run=0.4)
        self.wipe(229.1)
        # example 50 + 70 + ?
        A, B = np.array([-5.6, -2.5, 0]), np.array([-1.0, -2.5, 0])
        AC = 4.6 * np.sin(np.radians(70)) / np.sin(np.radians(60))
        C = A + AC * np.array([np.cos(np.radians(50)), np.sin(np.radians(50)), 0])
        tri = Polygon(A, B, C, color=CHALK, stroke_width=5)
        self.go(229.6, Create(tri), run=0.6)
        a50 = angle_arc(A, B, C, r=0.7, color=PINK, label=r"50^\circ", label_size=42, label_buff=0.5)
        a70 = angle_arc(B, C, A, r=0.6, color=BLUE, label=r"70^\circ", label_size=42, label_buff=0.5)
        self.go(231.2, FadeIn(a50), run=0.3)
        self.go(231.8, FadeIn(a70), run=0.3)
        arcC = Arc(radius=0.55, start_angle=np.arctan2(*(A - C)[[1, 0]]), angle=np.radians(60), arc_center=C, color=GRN, stroke_width=4)
        qm = M("?", size=54, color=GRN).move_to(C + np.array([0.0, -1.0, 0]))
        self.go(233.2, Create(arcC), FadeIn(qm, scale=1.6), run=0.4)
        s1 = M(r"180^\circ - (50^\circ + 70^\circ)", size=54).move_to([3.2, 0.9, 0])
        s2 = M(r"= 180^\circ - 120^\circ", size=54).next_to(s1, DOWN, buff=0.4).align_to(s1, LEFT).shift(RIGHT * 0.4)
        s3 = M(r"= 60^\circ", size=60, color=GRN).next_to(s2, DOWN, buff=0.4).align_to(s2, LEFT)
        self.go(234.2, Write(s1), run=0.9)
        self.go(235.7, Write(s2), run=0.8)
        self.go(237.5, Write(s3), Transform(qm, M(r"60^\circ", size=42, color=GRN).move_to(qm)), run=0.5)
        easy = H("Easy.", 60, YEL).next_to(s3, RIGHT, buff=0.6)
        self.go(238.8, FadeIn(easy, scale=1.4), Create(box(s3, GRN)), run=0.4)
