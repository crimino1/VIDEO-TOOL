from common import *


def hill(x):
    """A smooth hill and valley in screen coordinates."""
    return -2.3 + 2.1 * np.exp(-((x + 4.6) ** 2) / 1.3) + 1.05 * np.exp(-((x - 0.7) ** 2) / 0.9)


def hill_mob(x0=-6.8, x1=2.6, color=DIM):
    xs = np.linspace(x0, x1, 240)
    return VMobject(stroke_color=color, stroke_width=4).set_points_smoothly(np.column_stack([xs, hill(xs), 0 * xs]))


class EnergySentence(Shot):
    def body(self):
        a = T("Stay with me here.", 76)
        self.play(FadeIn(a), run_time=0.4)
        b = T("This is the part nobody shows you.", 66)
        self.go("5:03.77", FadeTransform(a, b), run=0.4)
        self.go("5:07.80", FadeOut(b), run=0.28)
        # ball on hill with live energy bars; the total never changes
        H = hill_mob()
        s = ValueTracker(-4.6)  # ball x position
        ball = Dot(radius=0.2, color=EN)
        ball.add_updater(lambda m: m.move_to([s.get_value(), hill(s.get_value()) + 0.2, 0]))
        h_top = hill(-4.6) + 2.3

        def pe():
            return (hill(s.get_value()) + 2.3) / h_top

        pot_t = ValueTracker(1)
        kin_t = ValueTracker(0)
        pot_t.add_updater(lambda m: m.set_value(pe()))
        kin_t.add_updater(lambda m: m.set_value(1 - pe()))
        self.add(pot_t, kin_t)
        bk = energy_bar("motion", MOM, 3.75, base=-2.3, h=3.2, tracker=kin_t, size=36)
        bp = energy_bar("position", POT, 5.65, base=-2.3, h=3.2, tracker=pot_t, size=36)
        self.play(Create(H), FadeIn(ball), run_time=0.8)
        e = M("E", "=", size=88, color=EN).move_to([-3.4, 2.75, 0])
        self.go("5:09.81", FadeIn(e), run=0.4)
        self.play(FadeIn(bk), FadeIn(bp), run_time=0.4)
        ke = M(r"\mathrm{KE}", size=80, color=MOM).next_to(e, RIGHT, buff=0.3)
        self.go("5:13.39", FadeIn(ke), s.animate.set_value(-1.8), run=1.7, rate_func=rate_functions.ease_in_quad)
        ke2 = M(r"\frac{p^2}{2m}", size=88, color=MOM).next_to(e, RIGHT, buff=0.3)
        self.go("5:16.71", FadeTransform(ke, ke2), s.animate.set_value(0.7), run=1.5, rate_func=rate_functions.smooth)
        plus = M("+", size=80).next_to(ke2, RIGHT, buff=0.3)
        v = M("V", size=88, color=POT).next_to(plus, RIGHT, buff=0.3)
        self.go("5:19.53", FadeIn(plus), run=0.3)
        self.go("5:21.23", FadeIn(v), s.animate.set_value(-1.8), run=1.1, rate_func=rate_functions.smooth)
        self.go("5:22.60", s.animate.set_value(-4.6), run=1.6, rate_func=rate_functions.ease_out_quad)
        lab = T("high school physics", 46, DIM).to_edge(UP, buff=0.45).shift(RIGHT * 3)
        self.go("5:26.77", FadeIn(lab), run=0.3)
        sent = VGroup(T("Total energy", 62, EN), T("=", 62), T("motion energy", 62, MOM), T("+", 62), T("position energy", 62, POT)).arrange(RIGHT, buff=0.3)
        sent.width = min(sent.width, 12.6)
        sent.move_to([0, 0, 0])
        self.go("5:28.40", FadeOut(VGroup(H, ball, bk, bp, lab, e, ke2, plus, v)), run=0.25)
        self.go("5:28.65", FadeIn(sent[0]), run=0.3)
        self.go("5:30.00", FadeIn(sent[1]), FadeIn(sent[2]), run=0.3)
        self.go("5:31.50", FadeIn(sent[3]), FadeIn(sent[4]), run=0.3)
        box = SurroundingRectangle(sent, color=INK, buff=0.35, corner_radius=0.1)
        hold = T("Hold on to this sentence.", 52, DIM).next_to(box, DOWN, buff=0.5)
        self.go("5:32.93", Create(box), FadeIn(hold), run=0.5)
        self.at("5:34.15")
        self.clear_all(0.28)


class Corkscrew(Shot):
    def body(self):
        clock = tracker_time(self)
        f = M(r"\psi", "=", r"e^{\,i(kx-\omega t)}", size=86)
        f[0].set_color(PSI)
        f.to_edge(UP, buff=0.5)
        cap = T("the simplest possible quantum wave", 48, DIM).next_to(f, DOWN, buff=0.25)
        self.go("5:35.27", FadeIn(f), FadeIn(cap), run=0.7)
        self.go("5:38.31", FadeOut(cap), run=0.4)
        # one arrow spinning on a circle
        w = 2.4
        c0 = np.array([-3.8, -0.8, 0])
        circ = Circle(radius=1.5, color=FAINT, stroke_width=3).move_to(c0)
        arrow = Line(c0, c0 + RIGHT * 1.5, color=PSI, stroke_width=6)
        tip = Dot(radius=0.09, color=PSI)

        def spin(m):
            a = w * clock.get_value()
            p = c0 + 1.5 * np.array([np.cos(a), np.sin(a), 0])
            m.put_start_and_end_on(c0, p)
            tip.move_to(p)

        arrow.add_updater(spin)
        tip.add_updater(lambda m: None)
        lab = T("a little arrow, spinning", 46, PSI).next_to(circ, DOWN, buff=0.3)
        self.go("5:40.13", Create(circ), FadeIn(arrow), FadeIn(tip), FadeIn(lab), run=0.7)
        # the same spin carried along the line: arrows along x in projected 3D
        scale = 1.0
        center = np.array([0.2, -0.95, 0])
        k = 1.25
        YAW, PITCH = -0.3, 0.2
        xs = np.linspace(-6.5, 6.5, 64)
        axis = Line(proj((-7, 0, 0), -0.3, 0.2, center=center), proj((7, 0, 0), -0.3, 0.2, center=center), color=DIM, stroke_width=2.5)
        arrows = VGroup(*[Line(ORIGIN, RIGHT, stroke_color=PSI, stroke_width=2.5, stroke_opacity=0.55) for _ in xs])
        helix = VMobject(stroke_color=PSI, stroke_width=5)
        R = 1.2

        def up_helix(m):
            t = clock.get_value()
            pts = []
            for i, x in enumerate(xs):
                a = k * x - w * t
                p = proj((x, R * np.cos(a), R * np.sin(a)), YAW, PITCH, center=center)
                arrows[i].put_start_and_end_on(proj((x, 0, 0), YAW, PITCH, center=center), p)
            xf = np.linspace(-6.5, 6.5, 420)
            for x in xf:
                a = k * x - w * t
                pts.append(proj((x, R * np.cos(a), R * np.sin(a)), YAW, PITCH, center=center))
            m.set_points_as_corners(np.array(pts))

        up_helix(helix)
        helix.add_updater(up_helix)
        l2 = T("that spin travels along the line, like a corkscrew", 48, INK).to_edge(DOWN, buff=0.35)
        self.go("5:42.71", FadeOut(VGroup(circ, arrow, tip, lab)), FadeIn(axis), FadeIn(arrows), Create(helix), FadeIn(l2), run=1.2)
        nl = T("the Greek letter psi: just the name of our wave", 46, PSI).next_to(f, DOWN, buff=0.22)
        self.go("5:46.76", Indicate(f[0], color=PSI, scale_factor=1.7), FadeOut(l2), run=0.9)
        self.go("5:48.96", FadeIn(nl), run=0.4)


def wave_board(clock, k=2.0, w=2.0, y=0.55, x0=-6.4, x1=6.4, amp=0.85, color=PSI):
    return wave_line(lambda xs: y + amp * np.cos(k * xs - w * clock.get_value()), x0, x1, color=color, width=4, n=700)


class SpaceRule(Shot):
    def body(self):
        clock = tracker_time(self)
        hold = ValueTracker(1)  # freeze factor so the tangent reads clearly
        t_eff = ValueTracker(0)
        t_eff.add_updater(lambda m, dt: m.increment_value(dt * hold.get_value()))
        self.add(t_eff)
        k = 2.0
        y0 = 1.7
        w = wave_line(lambda xs: y0 + 0.85 * np.cos(k * xs - 2 * t_eff.get_value()), -6.4, 6.4, color=PSI, width=4, n=700)
        self.play(Create(w), run_time=0.8)
        sec_ = T("a secret trick", 60, EN).move_to([0, -0.2, 0])
        self.play(FadeIn(sec_), run_time=0.3)
        self.go("5:53.82", FadeOut(sec_), hold.animate.set_value(0), run=0.5)
        # walk along x: slope at a moving point
        px = ValueTracker(-5.0)

        def yv(x):
            return y0 + 0.85 * np.cos(k * x - 2 * t_eff.get_value())

        def slope(x):
            return -0.85 * k * np.sin(k * x - 2 * t_eff.get_value())

        dot = Dot(radius=0.11, color=MOM)
        dot.add_updater(lambda m: m.move_to([px.get_value(), yv(px.get_value()), 0]))
        tan = Line(LEFT, RIGHT, color=MOM, stroke_width=4)

        def up_t(m):
            x = px.get_value()
            d = np.array([1, slope(x), 0])
            d = d / np.linalg.norm(d) * 1.0
            p = np.array([x, yv(x), 0])
            m.put_start_and_end_on(p - d, p + d)

        tan.add_updater(up_t)
        arrowx = Arrow([-1.5, 0.2, 0], [1.5, 0.2, 0], color=DIM, stroke_width=3, buff=0)
        ax = T("moving through space", 44, DIM).next_to(arrowx, DOWN, buff=0.1)
        self.go("5:55.96", FadeIn(dot), FadeIn(tan), FadeIn(arrowx), FadeIn(ax), run=0.4)
        self.play(px.animate.set_value(3.0), run_time=3.2, rate_func=rate_functions.linear)
        d = M(r"\frac{\partial \psi}{\partial x}", size=92).move_to([-3.4, -1.25, 0])
        self.go("6:00.79", FadeOut(arrowx), FadeOut(ax), Write(d), run=0.8)
        eq2 = M("=", "i", "k", r"\psi", size=92).next_to(d, RIGHT, buff=0.35)
        eq2[3].set_color(PSI)
        eq2[2].set_color(MOM)
        self.go("6:03.47", FadeIn(eq2[0]), FadeIn(eq2[1]), FadeIn(eq2[3]), run=0.5)
        self.go("6:05.50", FadeIn(eq2[2], scale=2.4), hold.animate.set_value(0.8), run=0.5)
        box = SurroundingRectangle(eq2[2], color=MOM, buff=0.05)
        self.play(Create(box), run_time=0.3)
        rule = M("p", "=", r"\hbar", "k", size=92).move_to([3.8, -1.25, 0])
        rule[0].set_color(MOM); rule[3].set_color(MOM)
        self.go("6:06.98", FadeIn(rule, shift=LEFT * 0.4), run=0.5)
        lab = T("k is momentum", 56, MOM).next_to(rule, UP, buff=0.3)
        self.go("6:09.08", FadeIn(lab), run=0.4)
        sent = T("change in space  =  momentum", 58, MOM).to_edge(DOWN, buff=0.4)
        self.go("6:11.56", FadeIn(sent), run=0.5)
        self.at("6:17.25")
        self.clear_all(0.3)


class TimeRule(Shot):
    def body(self):
        clock = tracker_time(self)
        k = 2.0
        y0 = 1.1
        w = wave_line(lambda xs: y0 + 0.85 * np.cos(k * xs - 3 * clock.get_value()), -6.4, 6.4, color=PSI, width=4, n=700)
        x_fix = -0.8
        guide = DashedLine([x_fix, -0.1, 0], [x_fix, 2.3, 0], color=DIM, dash_length=0.08)
        d = Dot(radius=0.11, color=EN)
        d.add_updater(lambda m: m.move_to([x_fix, y0 + 0.85 * np.cos(k * x_fix - 3 * clock.get_value()), 0]))
        cap = T("stay in one place. Watch it change in time.", 46, DIM).move_to([0, -0.5, 0])
        self.play(FadeIn(w), FadeIn(guide), FadeIn(d), FadeIn(cap), run_time=0.5)
        l = M(r"\frac{\partial \psi}{\partial t}", size=92).move_to([-3.6, -2.2, 0])
        self.go("6:19.81", Write(l), run=0.8)
        r = M("=", "-i", r"\omega", r"\psi", size=92).next_to(l, RIGHT, buff=0.35)
        r[3].set_color(PSI)
        r[2].set_color(EN)
        self.go("6:21.55", FadeIn(r[0]), FadeIn(r[1]), FadeIn(r[3]), FadeIn(r[2], scale=2.4), run=0.5)
        rule = M("E", "=", r"\hbar", r"\omega", size=92).move_to([3.8, -2.2, 0])
        rule[0].set_color(EN); rule[3].set_color(EN)
        lab = T("omega is energy", 54, EN).next_to(rule, UP, buff=0.25)
        self.go("6:23.13", FadeIn(lab), FadeOut(cap), run=0.4)
        self.go("6:24.99", FadeIn(rule, shift=LEFT * 0.4), run=0.4)
        self.at("6:26.40")
        self.clear_all(0.25)


class Hiding(Shot):
    def body(self):
        q = T("Do you see what just happened?", 66)
        self.play(FadeIn(q), run_time=0.4)
        self.go("6:28.30", q.animate.to_edge(UP, buff=0.6).set_opacity(0.5), run=0.3)
        a = VGroup(T("Momentum", 72, MOM), T("is hiding in how the wave changes in", 50), T("space", 72, MOM)).arrange(RIGHT, buff=0.3)
        b = VGroup(T("Energy", 72, EN), T("is hiding in how the wave changes in", 50), T("time", 72, EN)).arrange(RIGHT, buff=0.3)
        a.width = 12.8
        b.width = 12.2
        a.move_to([0, 0.5, 0])
        b.move_to([0, -0.9, 0])
        self.go("6:28.48", FadeIn(a), run=0.5)
        self.go("6:31.86", FadeIn(b), run=0.5)
        self.at("6:34.50")
        self.clear_all(0.25)


def dict_rows(size=78):
    e0 = M("E", size=size, color=EN)
    e1 = M(r"i\hbar\frac{\partial}{\partial t}", size=size, color=EN)
    p0 = M("p", size=size, color=MOM)
    p1 = M(r"-i\hbar\frac{\partial}{\partial x}", size=size, color=MOM)
    return e0, e1, p0, p1


class Dictionary(Shot):
    def body(self):
        title = T("Two translation rules", 66).to_edge(UP, buff=0.5)
        self.play(FadeIn(title), run_time=0.4)
        l = T("ordinary physics", 46, DIM).move_to([-3.4, 1.7, 0])
        r = T("wave physics", 46, DIM).move_to([3.4, 1.7, 0])
        div = Line([0, 2.0, 0], [0, -2.6, 0], color=FAINT, stroke_width=2)
        title2 = T("A dictionary", 66).to_edge(UP, buff=0.5)
        self.go("6:37.24", FadeTransform(title, title2), FadeIn(l), FadeIn(r), Create(div), run=0.5)
        e0, e1, p0, p1 = dict_rows()
        e0.move_to([-3.4, 0.45, 0]); e1.move_to([3.4, 0.45, 0])
        p0.move_to([-3.4, -1.5, 0]); p1.move_to([3.4, -1.5, 0])
        ar1 = Arrow([-1.9, 0.45, 0], [1.3, 0.45, 0], color=EN, stroke_width=4, buff=0)
        ar2 = Arrow([-1.9, -1.5, 0], [1.1, -1.5, 0], color=MOM, stroke_width=4, buff=0)
        self.go("6:40.26", FadeIn(e0), run=0.3)
        self.go("6:41.24", GrowArrow(ar1), Write(e1), run=0.7)
        self.go("6:44.20", FadeIn(p0), run=0.3)
        self.go("6:44.98", GrowArrow(ar2), Write(p1), run=0.7)
        self.at("6:48.28")
        self.clear_all(0.28)


class Translate(Shot):
    def body(self):
        top = VGroup(T("Energy", 56, EN), T("=", 56), T("motion energy", 56, MOM), T("+", 56), T("position energy", 56, POT)).arrange(RIGHT, buff=0.3).to_edge(UP, buff=0.4)
        self.play(FadeIn(top), run_time=0.5)
        # small dictionary in the corner stays visible
        e0, e1, p0, p1 = dict_rows(40)
        d1 = VGroup(e0, M(r"\to", size=36), e1).arrange(RIGHT, buff=0.14)
        d2 = VGroup(p0, M(r"\to", size=36), p1).arrange(RIGHT, buff=0.14)
        dd = VGroup(d1, d2).arrange(DOWN, buff=0.2, aligned_edge=LEFT).to_corner(DL, buff=0.35)
        ls = T("word by word", 48, DIM).move_to([3.5, -3.1, 0])
        self.go("6:55.41", FadeIn(dd), FadeIn(ls), run=0.5)
        # classical energy acting on psi
        c = M("E", r"\psi", "=", r"\frac{p^2}{2m}", r"\psi", "+", "V", r"\psi", size=72).move_to([0, 1.75, 0])
        c[0].set_color(EN); c[3].set_color(MOM); c[6].set_color(POT)
        for i in (1, 4, 7):
            c[i].set_color(PSI)
        self.go("7:00.37", FadeOut(ls), Write(c), run=1.2)
        # term by term
        t1 = M(r"i\hbar\frac{\partial \psi}{\partial t}", size=78, color=EN).move_to([-4.4, -0.75, 0])
        a1 = Arrow(c[0].get_bottom() + DOWN * 0.05, t1.get_top(), color=EN, stroke_width=3, buff=0.1)
        self.go("7:02.81", Indicate(top[0], color=EN, scale_factor=1.1), Indicate(d1, color=EN, scale_factor=1.1), run=0.6)
        self.go("7:04.07", GrowArrow(a1), Write(t1), run=0.8)
        t2 = M(r"-\frac{\hbar^2}{2m}\frac{\partial^2 \psi}{\partial x^2}", size=78, color=MOM).move_to([0.2, -0.75, 0])
        a2 = Arrow(c[3].get_bottom() + DOWN * 0.05, t2.get_top(), color=MOM, stroke_width=3, buff=0.1)
        self.go("7:06.15", Indicate(top[2], color=MOM, scale_factor=1.1), Indicate(d2, color=MOM, scale_factor=1.1), run=0.6)
        self.go("7:07.79", GrowArrow(a2), Write(t2), run=1.2)
        t3 = M(r"V\psi", size=78, color=POT).move_to([4.7, -0.75, 0])
        a3 = Arrow(c[6].get_bottom() + DOWN * 0.05, t3.get_top(), color=POT, stroke_width=3, buff=0.1)
        self.go("7:12.83", Indicate(top[4], color=POT, scale_factor=1.1), run=0.5)
        self.go("7:14.29", GrowArrow(a3), Write(t3), run=0.6)
        self.go("7:15.60", FadeOut(VGroup(c, a1, a2, a3, dd, top)), FadeOut(VGroup(t1, t2, t3)), run=0.35)
        # the equation assembled in time with the voice
        eq = schrod(92)
        eq[0].set_color(EN); eq[1].set_color(EN); eq[3].set_color(MOM); eq[4].set_color(MOM); eq[6].set_color(POT); eq[7].set_color(POT)
        self.go("7:16.07", FadeIn(eq[0]), run=0.35)
        self.go("7:16.81", FadeIn(eq[1]), run=0.5)
        self.go("7:18.83", FadeIn(eq[2]), run=0.25)
        self.go("7:19.77", FadeIn(eq[3]), run=0.5)
        self.go("7:21.85", FadeIn(eq[4]), run=0.6)
        self.go("7:24.71", FadeIn(eq[5]), run=0.2)
        self.go("7:25.43", FadeIn(eq[6]), FadeIn(eq[7]), run=0.4)
        lab = T("That is the Schrödinger equation.", 66, INK).next_to(eq, DOWN, buff=0.9)
        self.go("7:26.69", eq.animate.set_color(INK), Flash(eq.get_center(), color=EN, line_length=1.0, flash_radius=6.6, num_lines=30), FadeIn(lab), run=0.7)
        l2 = T("That's the whole thing.", 66, EN).next_to(eq, DOWN, buff=0.9)
        self.go("7:29.96", FadeTransform(lab, l2), run=0.35)


class NotMagic(Shot):
    def body(self):
        eq = schrod(84).shift(UP * 2.2)
        self.add(eq)
        lab = T("It's not magic.", 62).to_edge(DOWN, buff=0.7)
        self.play(FadeIn(lab), run_time=0.3)
        l2 = T("It's just energy conservation, in the language of waves.", 56, EN).to_edge(DOWN, buff=0.7)
        self.go("7:32.60", FadeTransform(lab, l2), run=0.35)
        b1 = Brace(VGroup(eq[0], eq[1]), DOWN, color=EN)
        b2 = Brace(VGroup(eq[3], eq[4]), DOWN, color=MOM)
        b3 = Brace(VGroup(eq[6], eq[7]), DOWN, color=POT)
        t1 = T("total", 50, EN).next_to(b1, DOWN, buff=0.1)
        t2 = T("motion", 50, MOM).next_to(b2, DOWN, buff=0.1)
        t3 = T("position", 50, POT).next_to(b3, DOWN, buff=0.1)
        self.go("7:36.78", FadeOut(l2), GrowFromCenter(b1), FadeIn(t1), run=0.4)
        self.play(GrowFromCenter(b2), FadeIn(t2), run_time=0.4)
        self.play(GrowFromCenter(b3), FadeIn(t3), run_time=0.4)
        # ball rolling down a hill, then the ball becomes a wave
        xs = np.linspace(-6.5, 6.5, 200)
        fn = lambda x: -2.75 + 1.2 * np.exp(-((x + 4.5) ** 2) / 3.0)
        H = VMobject(stroke_color=DIM, stroke_width=4).set_points_smoothly(np.column_stack([xs, fn(xs), 0 * xs]))
        s = ValueTracker(-4.5)
        ball = Dot(radius=0.17, color=EN)
        ball.add_updater(lambda m: m.move_to([s.get_value(), fn(s.get_value()) + 0.17, 0]))
        self.go("7:40.00", FadeIn(H), FadeIn(ball), run=0.5)
        self.go("7:41.80", s.animate.set_value(-0.5), run=1.9, rate_func=rate_functions.ease_in_quad)
        ask = TI("What if the ball is a wave?", 62, PSI).move_to([2.6, -0.55, 0])
        self.go("7:44.48", FadeIn(ask), run=0.4)
        clock = tracker_time(self)
        px = ValueTracker(-0.5)
        px.add_updater(lambda m, dt: m.increment_value(dt * 0.8))
        self.add(px)
        w = wave_line(lambda xs: fn(xs) + 0.2 + 0.55 * np.exp(-((xs - px.get_value()) ** 2) / 0.9) * np.sin(7 * (xs - px.get_value())), -6.5, 6.5, color=PSI, width=4, n=700)
        self.go("7:46.20", FadeOut(ball), FadeIn(w), run=0.8)


class Fair(Shot):
    def body(self):
        p = T("a strict mathematical proof", 66)
        s = strike(p)
        self.go("7:49.26", FadeIn(p), run=0.3)
        self.play(Create(s), run_time=0.4)
        g = T("an inspired guess, from clues like these", 66, EN).shift(DOWN * 1.1)
        self.go("7:51.84", VGroup(p, s).animate.shift(UP * 1.1).set_opacity(0.45), FadeIn(g), run=0.5)
        self.go("7:55.20", FadeOut(VGroup(p, s, g)), run=0.3)
        # prediction curve with data landing on it
        ax = Axes(x_range=[0, 10, 2], y_range=[0, 4, 1], x_length=9.5, y_length=4.4, axis_config={"color": DIM, "include_ticks": False, "stroke_width": 3}).shift(DOWN * 0.35)
        f = lambda x: 0.4 + 3.2 * np.exp(-((x - 5.2) ** 2) / 4.2) + 0.25 * np.sin(x * 1.1)
        curve = ax.plot(f, color=EN, stroke_width=4)
        l1 = T("what the equation predicts", 44, EN).move_to([0, 3.1, 0])
        self.play(Create(ax), Create(curve), FadeIn(l1), run_time=0.8)
        rng = np.random.default_rng(1)
        xs = rng.uniform(0.3, 9.7, 34)
        ds = VGroup(*[Dot(ax.c2p(x, f(x)), radius=0.08, color=PSI) for x in xs])
        l2 = T("what experiments measure", 44, PSI).move_to([0, 3.1, 0])
        self.go("7:57.92", FadeTransform(l1, l2), LaggedStart(*[FadeIn(d, scale=2.5) for d in ds], lag_ratio=0.07), run=2.4)
        note = T("illustration", 28, DIM).to_corner(DR, buff=0.35)
        self.add(note)
        y = T("a hundred years of tests", 56).to_edge(DOWN, buff=0.45)
        self.go("8:02.03", FadeIn(y), run=0.4)
        self.at("8:04.15")
        self.clear_all(0.28)


class Compact(Shot):
    def body(self):
        eq = schrod(84)
        self.play(FadeIn(eq), run_time=0.3)
        b = Brace(VGroup(eq[3], eq[4], eq[5], eq[6], eq[7]), DOWN, color=EN)
        self.go("8:05.50", GrowFromCenter(b), run=0.4)
        short = M(r"i\hbar", r"\frac{\partial \psi}{\partial t}", "=", r"\hat{H}", r"\psi", size=120)
        short[3].set_color(EN)
        self.go("8:06.21", FadeOut(b), FadeTransform(eq, short), run=0.9)
        self.go("8:10.40", short.animate.shift(UP * 1.7), run=0.4)
        # energy machine
        box = RoundedRectangle(width=3.3, height=1.6, corner_radius=0.15, color=EN, fill_color="#1e1a10", fill_opacity=1).shift(DOWN * 1.1)
        h = M(r"\hat{H}", size=80, color=EN).move_to(box)
        ar0 = Arrow([-4.0, -1.1, 0], box.get_left(), color=PSI, stroke_width=4, buff=0.1)
        ar1 = Arrow(box.get_right(), [3.5, -1.1, 0], color=EN, stroke_width=4, buff=0.1)
        p0 = M(r"\psi", size=66, color=PSI).next_to(ar0, LEFT, buff=0.15)
        p1 = T("total energy", 46, EN).next_to(ar1, RIGHT, buff=0.15)
        n = T("the Hamiltonian", 54, EN).next_to(box, DOWN, buff=0.3)
        self.go("8:10.63", FadeIn(box), FadeIn(h), run=0.4)
        self.go("8:12.17", FadeIn(n), run=0.3)
        self.go("8:13.47", GrowArrow(ar0), GrowArrow(ar1), FadeIn(p0), FadeIn(p1), run=0.7)
        self.go("8:16.20", FadeOut(VGroup(box, h, ar0, ar1, p0, p1, n)), short.animate.move_to(UP * 1.0), run=0.4)
        s1 = T("The way the wave changes in time", 62, PSI).shift(DOWN * 0.9)
        s2 = T("is decided by its energy.", 62, EN).next_to(s1, DOWN, buff=0.28)
        self.go("8:20.11", FadeIn(s1), run=0.4)
        self.go("8:22.41", FadeIn(s2), run=0.4)
