"""Builder 10: Chapter 14, Advanced Trigonometry (45:26.88 - 50:03.02)."""
from common import *

# private LaTeX cache: the shared one races with other parallel builders


def polar_curve(r_fn, t1=TAU, center=ORIGIN, scale=1.0, color=YEL, width=5, t0=0.0):
    c = np.array([center[0], center[1], 0.0])
    return ParametricFunction(lambda t: c + scale * r_fn(t) * np.array([np.cos(t), np.sin(t), 0]), t_range=[t0, t1, 0.01],
                              color=color, stroke_width=width)


def plane(center, xr=(-1, 4), yr=(-1, 3), u=1.0, labels=("x", "y")):
    """Light axes with arrow tips; returns (group, to_point(x, y))."""
    c = np.array([center[0], center[1], 0.0])
    p = lambda x, y: c + u * np.array([x, y, 0])
    grid = VGroup(*[Line(p(x, yr[0]), p(x, yr[1]), stroke_width=1, color=FAINT, stroke_opacity=0.5) for x in range(int(np.ceil(xr[0])), int(xr[1]) + 1) if x],
                  *[Line(p(xr[0], y), p(xr[1], y), stroke_width=1, color=FAINT, stroke_opacity=0.5) for y in range(int(np.ceil(yr[0])), int(yr[1]) + 1) if y])
    ax = VGroup(Arrow(p(xr[0], 0), p(xr[1] + 0.3, 0), buff=0, stroke_width=3, color=DIM, tip_length=0.2),
                Arrow(p(0, yr[0]), p(0, yr[1] + 0.3), buff=0, stroke_width=3, color=DIM, tip_length=0.2))
    lx = H(labels[0], 34, DIM).next_to(p(xr[1] + 0.3, 0), DOWN, buff=0.12)
    ly = H(labels[1], 34, DIM).next_to(p(0, yr[1] + 0.3), LEFT, buff=0.12)
    return VGroup(grid, ax, lx, ly), p


def dashed(a, b, color, width=4):
    return DashedLine(a, b, color=color, stroke_width=width, dash_length=0.12)


class K10_Intro(Shot):
    def body(self):
        self.title("Where It Gets Beautiful", "45:30.40")
        known = ["SOH CAH TOA", "Unit circle", "Radians", "Graphs", "Identities", "Laws of sines & cosines"]
        cols = [PINK, BLUE, GRN, YEL, ORG, PURP]
        ps = VGroup(*[pill(k, c, 34) for k, c in zip(known, cols)]).arrange(DOWN, buff=0.22, aligned_edge=LEFT).move_to([-3.4, -0.75, 0])
        self.at("45:33.54")
        self.play(LaggedStart(*[FadeIn(p, shift=RIGHT * 0.3) for p in ps], lag_ratio=0.2), run_time=1.6)
        hs = H("high school course", 40, DIM).next_to(ps, UP, buff=0.25)
        tk = tick_mark(GRN, 0.9).next_to(ps, RIGHT, buff=0.5)
        self.go("45:35.20", FadeIn(hs), Create(tk), run=0.5)
        arrow = Arrow([0.4, -2.6, 0], [3.3, 0.6, 0], color=ORG, stroke_width=8, buff=0)
        adv = pill("Very Advanced", ORG, 52).move_to([4.2, 1.35, 0])
        stars = VGroup(*[Star(5, outer_radius=0.22, color=YEL, fill_opacity=1).move_to(adv.get_center() + v) for v in ([-2.4, 0.75, 0], [2.4, 0.7, 0], [0.2, -0.85, 0])])
        self.go("45:36.70", GrowArrow(arrow), run=0.6)
        self.go("45:37.40", FadeIn(adv, scale=0.6), LaggedStart(*[GrowFromCenter(s) for s in stars], lag_ratio=0.2), run=0.6)
        self.go("45:38.40", Indicate(adv, color=ORG, scale_factor=1.12), run=0.6)


class K10_Polar(Shot):
    def body(self):
        self.title("Polar Coordinates", "45:40.20")
        grp, p = plane((-5.0, -2.6), xr=(-0.6, 2.4), yr=(-0.6, 2.6), u=1.6)
        X, Y = 1.0, np.sqrt(3)
        P = p(X, Y)
        dot = Dot(P, radius=0.11, color=CHALK)
        self.go("45:41.70", FadeIn(grp), run=0.6)
        self.go("45:43.70", GrowFromCenter(dot), run=0.4)
        lx = dashed(p(0, 0) + [0, -0.0, 0], p(X, 0), BLUE)
        ly = dashed(p(X, 0), P, PINK)
        tx = M("x", size=46, color=BLUE).next_to(lx, DOWN, buff=0.15)
        ty = M("y", size=46, color=PINK).next_to(ly, RIGHT, buff=0.15)
        self.go("45:44.20", Create(lx), FadeIn(tx), run=0.4)
        self.go("45:44.68", Create(ly), FadeIn(ty), run=0.4)
        # left right up down
        nudge = VGroup(Arrow(P, P + LEFT * 0.7, buff=0.15, color=DIM, stroke_width=4), Arrow(P, P + RIGHT * 0.7, buff=0.15, color=DIM, stroke_width=4),
                       Arrow(P, P + UP * 0.7, buff=0.15, color=DIM, stroke_width=4), Arrow(P, P + DOWN * 0.7, buff=0.15, color=DIM, stroke_width=4))
        self.go("45:45.04", LaggedStart(*[GrowArrow(a) for a in nudge], lag_ratio=0.35), run=1.5)
        self.go("45:47.74", FadeOut(nudge), VGroup(lx, ly, tx, ty).animate.set_opacity(0.3), run=0.5)
        rl = Line(p(0, 0), P, color=GRN, stroke_width=6)
        self.go("45:48.64", Create(rl), run=0.6)
        arc = angle_arc(p(0, 0), p(1, 0), P, r=0.7, color=YEL)
        self.go("45:49.84", Create(arc), run=0.4)
        rlab = M("r", size=52, color=GRN).move_to(rl.get_center() + np.array([-0.35, 0.22, 0]))
        self.go("45:50.30", Indicate(rl, color=GRN), run=0.6)
        self.go("45:53.16", Write(rlab), run=0.4)
        th = M(r"\theta", size=48, color=YEL).move_to(p(0, 0) + 1.05 * np.array([np.cos(0.55), np.sin(0.55), 0]))
        self.go("45:54.52", Write(th), run=0.4)
        # conversions, right side
        h1 = pill("polar to x, y", BLUE, 34).move_to([2.6, 1.95, 0])
        e1 = M("x", "=", r"r\cos\theta", size=52).move_to([2.6, 1.12, 0])
        e2 = M("y", "=", r"r\sin\theta", size=52).move_to([2.6, 0.38, 0])
        e1[0].set_color(BLUE); e2[0].set_color(PINK); e1[2][0].set_color(GRN); e2[2][0].set_color(GRN)
        self.go("45:56.46", FadeIn(h1, shift=DOWN * 0.2), run=0.5)
        self.go("45:58.62", Write(e1), run=1.3)
        self.go("46:01.76", Write(e2), run=1.1)
        h2 = pill("x, y to polar", PINK, 34).move_to([2.6, -0.5, 0])
        e3 = M("r", "=", r"\sqrt{x^2+y^2}", size=52).move_to([2.6, -1.55, 0])
        e4 = M(r"\tan\theta", "=", r"\frac{y}{x}", size=52).move_to([2.6, -2.85, 0])
        e3[0].set_color(GRN); e4[0].set_color(YEL)
        self.go("46:03.50", FadeIn(h2, shift=DOWN * 0.2), run=0.5)
        self.go("46:04.60", Write(e3), run=1.8)
        self.go("46:09.16", Write(e4), run=1.2)
        # example (1, √3)
        self.go("46:11.36", FadeOut(VGroup(h1, h2, e1, e2, e3, e4)), run=0.4)
        hx = pill("Example", YEL, 38).move_to([2.6, 1.75, 0])
        pt = M(r"(1,\ \sqrt{3})", size=46).next_to(dot, RIGHT, buff=0.2)
        self.go("46:11.80", FadeIn(hx), run=0.4)
        self.go("46:13.40", Write(pt), run=0.9)
        s1 = M("r", "=", r"\sqrt{1+3}", size=56).move_to([2.2, 0.7, 0])
        s1b = M("=", "2", size=56).next_to(s1, RIGHT, buff=0.2)
        s1[0].set_color(GRN); s1b[1].set_color(GRN)
        self.go("46:14.92", Write(s1), run=1.4)
        self.go("46:18.34", Write(s1b), run=0.4)
        s2 = M(r"\tan\theta", "=", r"\sqrt{3}", size=56).next_to(s1, DOWN, buff=0.35).align_to(s1, LEFT)
        s2[0].set_color(YEL)
        self.go("46:18.72", Write(s2), run=1.2)
        s3 = M(r"\theta", "=", r"\frac{\pi}{3}", size=56).next_to(s2, DOWN, buff=0.3).align_to(s1, LEFT)
        s3[0].set_color(YEL)
        self.go("46:21.52", Write(s3), run=0.9)
        r2 = M("2", size=48, color=GRN).move_to(rlab)
        t2 = M(r"\tfrac{\pi}{3}", size=44, color=YEL).move_to(th).shift(RIGHT * 0.15)
        self.go("46:22.60", ReplacementTransform(rlab, r2), ReplacementTransform(th, t2), run=0.4)
        fin = M(r"\left(2,\ \tfrac{\pi}{3}\right)", size=66, color=YEL).next_to(s3, DOWN, buff=0.45).align_to(s1, LEFT)
        bx = box(fin, GRN)
        self.go("46:24.70", Write(fin), run=0.9)
        self.play(Create(bx), run_time=0.4)


class K10_Rose(Shot):
    def body(self):
        self.title("Trigonometry Becomes Art", "46:26.60")
        cap = H("shapes that are hard to draw with x and y", 38, DIM).move_to([0, 1.85, 0])
        self.go("46:28.80", FadeIn(cap), run=0.5)
        eq = M("r", "=", r"\cos 3\theta", size=64).move_to([-2.6, 1.85, 0])
        eq[2].set_color(YEL)
        self.go("46:32.98", FadeOut(cap), Write(eq), run=1.0)
        rose = polar_curve(lambda t: np.cos(3 * t), PI, center=(-2.6, -0.85), scale=2.25, color=YEL, width=6)
        self.go("46:35.40", Create(rose), run=1.4, rate_func=linear)
        note = H("3 petals", 40, YEL).next_to(rose, DOWN, buff=0.05).shift(RIGHT * 1.9)
        self.play(FadeIn(note), run_time=0.3)
        xs = 3.3
        g1 = polar_curve(lambda t: np.sin(4 * t), TAU, center=(xs, 1.05), scale=0.72, color=PINK, width=4)
        g2 = polar_curve(lambda t: 0.04 * t, 4 * TAU, center=(xs, -0.75), scale=1.0, color=BLUE, width=4)
        g3 = polar_curve(lambda t: 0.5 * (1 + np.cos(t)), TAU, center=(xs + 0.35, -2.55), scale=0.95, color=RED, width=4)
        l1 = H("rose curve", 34, PINK).next_to(g1, RIGHT, buff=0.3)
        l2 = H("spiral", 34, BLUE).next_to(g2, RIGHT, buff=0.3)
        l3 = H("cardioid", 34, RED).next_to(g3, RIGHT, buff=0.3)
        self.go("46:37.56", Create(g1), FadeIn(l1), run=0.9)
        self.go("46:38.74", Create(g2), FadeIn(l2), run=0.8)
        self.go("46:39.56", Create(g3), run=0.7)
        self.go("46:40.40", FadeIn(l3), run=0.3)
        art = H("art.", 56, YEL).next_to(note, RIGHT, buff=0.6)
        self.go("46:42.40", Write(art), Indicate(rose, color=ORG, scale_factor=1.05), run=0.7)


class K10_Complex(Shot):
    def body(self):
        self.title("Complex Numbers", "46:44.30")
        e0 = M("i", "=", r"\sqrt{-1}", size=64).move_to([-3.6, 1.4, 0])
        e0[0].set_color(BLUE)
        self.go("46:47.20", Write(e0), run=1.2)
        grp, p = plane((0.8, -2.9), xr=(-0.6, 3.6), yr=(-0.4, 2.7), u=1.4, labels=("real", "imaginary"))
        self.go("46:49.34", FadeIn(grp), run=0.6)
        a, b = 3.0, 2.0
        P = p(a, b)
        dot = Dot(P, radius=0.11, color=CHALK)
        lab = M("a+bi", size=50, color=YEL).next_to(dot, UR, buff=0.12)
        self.go("46:51.14", GrowFromCenter(dot), Write(lab), run=0.6)
        la, lb = dashed(p(0, 0), p(a, 0), BLUE), dashed(p(a, 0), P, PINK)
        ta = M("a", size=44, color=BLUE).next_to(la, DOWN, buff=0.12)
        tb = M("b", size=44, color=PINK).next_to(lb, RIGHT, buff=0.12)
        self.go("46:52.70", Create(la), FadeIn(ta), Create(lb), FadeIn(tb), run=0.8)
        self.go("46:53.40", Indicate(dot, color=YEL, scale_factor=1.6), run=0.6)
        rl = Line(p(0, 0), P, color=GRN, stroke_width=6)
        rt = M("r", size=48, color=GRN).move_to(rl.get_center() + np.array([-0.3, 0.3, 0]))
        self.go("46:57.18", Create(rl), FadeIn(rt), run=0.5)
        arc = angle_arc(p(0, 0), p(1, 0), P, r=0.8, label=r"\theta", label_size=44)
        self.go("46:57.94", Create(arc[0]), FadeIn(arc[1]), run=0.4)
        f = M("a+bi", "=", "r", r"(\cos\theta", "+", r"i\sin\theta)", size=58).move_to([-3.4, -0.4, 0])
        f[2].set_color(GRN); f[3].set_color(BLUE); f[5].set_color(PINK); f[0].set_color(YEL)
        if f.width > 5.4:
            f.width = 5.4
        f.move_to([-3.55, -0.4, 0])
        self.go("46:59.14", Write(f[0:2]), run=0.8)
        self.go("47:01.18", Write(f[2]), run=0.3)
        self.go("47:02.30", Write(f[3]), run=0.8)
        self.go("47:03.22", Write(f[4:]), run=1.4)
        self.play(Create(panel(f, PURP, 0.3)), run_time=0.4)


class K10_Euler(Shot):
    def body(self):
        self.title("Euler's Formula", animate=False)
        eq = M(r"e^{i\theta}", "=", r"\cos\theta", "+", r"i\sin\theta", size=86).move_to([0, 1.25, 0])
        eq[0].set_color(ORG); eq[2].set_color(BLUE); eq[4].set_color(PINK)
        self.go("47:11.64", Write(eq[0]), run=1.6)
        self.go("47:14.44", Write(eq[1]), run=0.3)
        self.go("47:15.24", Write(eq[2]), run=0.7)
        self.go("47:16.28", Write(eq[3:]), run=1.3)
        # growth vs circles
        ax = Axes(x_range=[-2, 1.6, 1], y_range=[0, 5, 1], x_length=3.4, y_length=2.6, axis_config=dict(color=DIM, stroke_width=3, include_tip=False)).move_to([-4.6, -1.85, 0])
        grow = ax.plot(np.exp, x_range=[-2, 1.6], color=ORG, stroke_width=5)
        gl = H("growth", 40, ORG).next_to(ax, UP, buff=0.1)
        c0 = np.array([4.6, -1.8, 0])
        circ = Circle(radius=1.3, color=BLUE, stroke_width=5).move_to(c0)
        cl = H("circles", 40, BLUE).next_to(circ, UP, buff=0.1)
        a1 = Arrow(eq[0].get_bottom(), gl.get_top() + UP * 0.05, color=ORG, stroke_width=4, buff=0.15)
        a2 = Arrow(eq[3:].get_bottom(), cl.get_top() + UP * 0.05, color=BLUE, stroke_width=4, buff=0.15)
        self.go("47:20.40", GrowArrow(a1), Create(ax), run=0.6)
        self.go("47:21.40", Create(grow), FadeIn(gl), run=1.0)
        self.go("47:24.64", GrowArrow(a2), Create(circ), FadeIn(cl), run=1.0)
        t = ValueTracker(0)
        mover = always_redraw(lambda: Dot(c0 + 1.3 * np.array([np.cos(t.get_value()), np.sin(t.get_value()), 0]), radius=0.12, color=ORG))
        spoke = always_redraw(lambda: Line(c0, mover.get_center(), color=ORG, stroke_width=4))
        same = H("secretly the same thing!", 40, YEL).move_to([0, -1.9, 0])
        self.go("47:27.70", FadeIn(spoke), FadeIn(mover), run=0.3)
        self.play(t.animate.set_value(TAU), FadeIn(same, scale=0.8), run_time=2.0, rate_func=smooth)
        # theta = pi
        self.go("47:30.10", FadeOut(VGroup(ax, grow, gl, circ, cl, a1, a2, same, mover, spoke)), eq.animate.scale(0.75).move_to([0, 1.65, 0]), run=0.5)
        tp = M(r"\theta=\pi", size=60, color=YEL).move_to([-4.3, 0.3, 0])
        self.go("47:31.32", Write(tp), run=0.6)
        c1 = M(r"\cos\pi", "=", "-1", size=56).move_to([0, 0.3, 0])
        c2 = M(r"\sin\pi", "=", "0", size=56).move_to([4.0, 0.3, 0])
        c1[0].set_color(BLUE); c2[0].set_color(PINK)
        self.go("47:32.48", Write(c1), run=1.0)
        self.go("47:34.92", Write(c2), run=0.9)
        e1 = M(r"e^{i\pi}", "=", "-1", size=72).move_to([0, -1.1, 0])
        e1[0].set_color(ORG)
        self.go("47:37.20", Write(e1), run=1.2)
        big = M(r"e^{i\pi}+1=0", size=120).move_to([0, -1.5, 0])
        self.go("47:39.80", FadeOut(VGroup(tp, c1, c2)), ReplacementTransform(e1, big), run=0.8)
        glow = box(big, YEL, buff=0.35, width=6)
        self.go("47:42.30", Create(glow), run=0.6)
        g = big[0]  # e, i, π, +, 1, =, 0
        cols = [(0, ORG, "47:46.22", "e"), (1, BLUE, "47:47.16", "i"), (2, GRN, "47:47.60", r"\pi"), (4, PINK, "47:47.95", "1"), (6, YEL, "47:49.58", "0")]
        five = H("five of the most important numbers", 44, DIM).move_to([0, 0.15, 0])
        self.go("47:43.42", FadeIn(five, shift=DOWN * 0.2), run=0.6)
        for idx, col, tt, _ in cols:
            self.go(tt, g[idx].animate.set_color(col).scale(1.25), run=0.2)
            self.play(g[idx].animate.scale(1 / 1.25), run_time=0.1)
        self.go("47:50.66", VGroup(big, glow).animate.scale(1.12), run=0.8)


class K10_DeMoivre(Shot):
    def body(self):
        self.title("De Moivre's Theorem", "47:56.20")
        f = M(r"(\cos\theta+i\sin\theta)^n", "=", r"\cos n\theta+i\sin n\theta", size=60).move_to([0, 1.55, 0])
        f[0].set_color(BLUE); f[2].set_color(PINK)
        self.go("47:58.82", Write(f[0]), run=2.6)
        self.go("48:03.26", Write(f[1]), run=0.3)
        self.go("48:03.88", Write(f[2]), run=2.6)
        note = H("raise to power n  =  multiply the angle by n", 42, YEL).next_to(f, DOWN, buff=0.25)
        self.go("48:08.40", FadeIn(note, shift=UP * 0.15), run=0.6)
        # example on a small complex plane
        grp, p = plane((-5.9, -3.3), xr=(-0.4, 2.6), yr=(-0.3, 1.9), u=1.25, labels=("real", "imag"))
        self.go("48:10.30", FadeOut(note), FadeIn(grp), run=0.5)
        P = p(1, 1)
        dot = Dot(P, radius=0.1, color=CHALK)
        lab = M("1+i", size=46, color=YEL).next_to(dot, UR, buff=0.08)
        self.go("48:11.42", GrowFromCenter(dot), Write(lab), run=0.7)
        rl = Line(p(0, 0), P, color=GRN, stroke_width=6)
        rt = M(r"\sqrt{2}", size=40, color=GRN).move_to(rl.get_center() + np.array([-0.45, 0.25, 0]))
        self.go("48:13.38", Create(rl), FadeIn(rt), run=0.6)
        arc = angle_arc(p(0, 0), p(1, 0), P, r=0.6, label=r"45^\circ", label_size=34, label_buff=0.42)
        self.go("48:15.48", Create(arc[0]), FadeIn(arc[1]), run=0.5)
        x0 = 0.6
        s0 = M(r"(1+i)^8", "=", r"\ ?", size=60).move_to([x0, 0.25, 0], aligned_edge=LEFT)
        s0[0].set_color(YEL)
        self.go("48:17.02", Write(s0), run=0.9)
        s1 = M(r"\text{distance: }", r"(\sqrt{2})^8", "=", "16", size=50).next_to(s0, DOWN, buff=0.35).align_to(s0, LEFT)
        s1[1].set_color(GRN); s1[3].set_color(GRN)
        self.go("48:19.78", Write(s1[:2]), run=1.2)
        self.go("48:22.30", Write(s1[2:]), run=0.4)
        s2 = M(r"\text{angle: }", r"8\times 45^\circ", "=", r"360^\circ", size=50).next_to(s1, DOWN, buff=0.3).align_to(s0, LEFT)
        s2[1].set_color(YEL); s2[3].set_color(YEL)
        self.go("48:23.80", Write(s2[:2]), run=1.2)
        self.go("48:26.46", Write(s2[2:]), run=0.4)
        # spin the arrow a full turn on the plane
        spin = VGroup(rl, dot)
        self.play(Rotate(spin, angle=TAU, about_point=p(0, 0)), run_time=0.4)
        s3 = M(r"\cos 360^\circ=1,\quad \sin 360^\circ=0", size=46).next_to(s2, DOWN, buff=0.3).align_to(s0, LEFT)
        self.go("48:27.30", Write(s3), run=2.6)
        ans = M(r"(1+i)^8", "=", "16", size=66).move_to(s0, aligned_edge=LEFT)
        ans[0].set_color(YEL); ans[2].set_color(GRN)
        self.go("48:31.40", ReplacementTransform(s0, ans), run=0.6)
        bx = box(ans, GRN)
        self.go("48:33.34", Create(bx), Indicate(ans[2], color=GRN, scale_factor=1.4), run=0.8)


class K10_Roots(Shot):
    def body(self):
        self.title("Roots of Unity", "48:40.60")
        c = np.array([-2.9, -0.75, 0])
        R = 2.25
        uc = unit_circle(R, c, axis_len=2.9, ticks=False)
        self.go("48:41.46", FadeIn(uc), run=0.6)
        q = M("z^3", "=", "1", size=64).move_to([3.5, 1.9, 0])
        q[0].set_color(YEL)
        self.go("48:42.88", Write(q), run=0.8)
        self.go("48:44.42", Indicate(uc[1], color=YEL, scale_factor=1.04), run=0.8)
        angs = [0, TAU / 3, 2 * TAU / 3]
        cols = [GRN, PINK, BLUE]
        arcs = VGroup(*[Arc(radius=0.5, start_angle=a, angle=TAU / 3 - 0.08, arc_center=c, color=YEL, stroke_width=4) for a in angs])
        lab = M(r"120^\circ", size=34, color=YEL).move_to(c + 0.8 * np.array([np.cos(TAU / 6 - 0.15), np.sin(TAU / 6 - 0.15), 0]))
        self.go("48:46.40", Create(arcs), FadeIn(lab), run=1.2)
        dots = [Dot(on_circle(a, R, c), radius=0.13, color=col) for a, col in zip(angs, cols)]
        names = [M("1", size=60, color=GRN), M(r"-\frac12+\frac{\sqrt3}{2}i", size=52, color=PINK), M(r"-\frac12-\frac{\sqrt3}{2}i", size=52, color=BLUE)]
        lst = VGroup(*names).arrange(DOWN, buff=0.25, aligned_edge=LEFT).move_to([3.5, -0.5, 0])
        for d, n, tt in zip(dots, names, ["48:48.32", "48:49.88", "48:53.32"]):
            self.go(tt, GrowFromCenter(d), FadeIn(n, shift=LEFT * 0.2), run=0.6)
            self.play(Indicate(d, scale_factor=1.6, color=YEL), run_time=0.4)
        tri = Polygon(*[d.get_center() for d in dots], color=YEL, stroke_width=5)
        self.go("48:57.10", Create(tri), run=1.0)
        tag = H("equilateral!", 40, YEL).move_to([c[0] + 2.4, -3.35, 0])
        self.play(FadeIn(tag), run_time=0.3)
        rp = pill("roots of unity", ORG, 44).move_to([3.5, -3.0, 0])
        self.go("49:00.30", FadeIn(rp, scale=0.7), run=0.6)


class K10_Calculus(Shot):
    def body(self):
        self.title("A Glimpse of Calculus", "49:02.90")
        ax = Axes(x_range=[-1.6, 1.6, 0.5], y_range=[-1.4, 1.4, 0.5], x_length=6.0, y_length=4.4,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18)).move_to([-3.4, -0.75, 0])
        self.go("49:04.30", Create(ax), run=0.8)
        rad = H("x in radians", 36, DIM).next_to(ax, UP, buff=0.05).shift(LEFT * 1.4)
        self.go("49:06.34", FadeIn(rad), run=0.4)
        ly = ax.plot(lambda x: x, x_range=[-1.4, 1.4], color=YEL, stroke_width=4)
        ly = DashedVMobject(ly, num_dashes=30)
        ls = ax.plot(np.sin, x_range=[-1.6, 1.6], color=PINK, stroke_width=6)
        tl1 = M("y=x", size=38, color=YEL).move_to(ax.c2p(0.5, 1.2))
        tl2 = M(r"y=\sin x", size=38, color=PINK).move_to(ax.c2p(1.15, 0.45))
        self.go("49:07.50", Create(ly), FadeIn(tl1), run=0.6)
        self.go("49:08.26", Create(ls), FadeIn(tl2), run=0.8)
        zoom = Circle(radius=0.75, color=GRN, stroke_width=4).move_to(ax.c2p(0, 0))
        self.go("49:09.84", Create(zoom), run=0.5)
        e1 = M(r"\sin x", r"\approx", "x", size=60).move_to([3.4, 1.55, 0])
        e1[0].set_color(PINK); e1[2].set_color(YEL)
        self.go("49:10.30", Write(e1), run=0.9)
        e2 = M(r"\lim_{x\to 0}\frac{\sin x}{x}", "=", "1", size=56).next_to(e1, DOWN, buff=0.45)
        self.go("49:12.88", Write(e2[0]), run=2.0)
        self.go("49:16.40", Write(e2[1:]), run=0.4)
        self.play(Create(box(e2, GRN, 0.15)), run_time=0.4)
        e3 = M(r"\frac{d}{dx}\sin x", "=", r"\cos x", size=52).next_to(e2, DOWN, buff=0.45)
        e3[0].set_color(PINK); e3[2].set_color(BLUE)
        e4 = M(r"\frac{d}{dx}\cos x", "=", r"-\sin x", size=52).next_to(e3, DOWN, buff=0.3)
        e4[0].set_color(BLUE); e4[2].set_color(PINK)
        self.go("49:18.40", Write(e3), run=1.6)
        self.go("49:22.10", Write(e4), run=1.6)
        # why sine waves are everywhere: a bob on a spring traces a wave
        self.go("49:25.00", FadeOut(VGroup(ax, ly, ls, tl1, tl2, zoom, rad)), run=0.4)
        t = tracker_time(self)
        x0, v, w, A = -5.9, 1.6, 2 * PI * 0.9, 1.3
        y0 = -0.75
        bob = always_redraw(lambda: Dot([x0, y0 + A * np.sin(w * t.get_value()), 0], radius=0.18, color=YEL))
        spring = always_redraw(lambda: VMobject(stroke_color=DIM, stroke_width=3).set_points_as_corners(
            [[x0 + (0.18 if i % 2 else -0.18) * (0 < i < 13), 2.2 + (y0 + A * np.sin(w * t.get_value()) - 2.2) * i / 13, 0] for i in range(14)]))
        wave = always_redraw(lambda: VMobject(stroke_color=PINK, stroke_width=5).set_points_as_corners(
            [[x, y0 + A * np.sin(w * (t.get_value() - (x - x0) / v)), 0] for x in np.linspace(x0, x0 + min(5.6, v * t.get_value() + 0.01), 120)]))
        self.add(spring, wave, bob)
        self.wait(0.1)


class K10_Fourier(Shot):
    def body(self):
        self.title("Fourier Analysis", animate=False)
        ax = Axes(x_range=[0, 2 * TAU, PI], y_range=[-1.5, 1.5, 1], x_length=12, y_length=3.8,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=False)).move_to([0, -0.3, 0])
        sq = ax.plot(lambda x: np.sign(np.sin(x)) * 1.0, x_range=[0.001, 2 * TAU - 0.001], color=FAINT, stroke_width=4, discontinuities=[PI, TAU, 3 * PI], use_smoothing=False)
        sq = DashedVMobject(sq, num_dashes=70)
        self.add(ax)
        lbl = H("any signal...", 42, DIM).move_to([-4.6, 1.9, 0])
        self.go("49:39.42", Create(sq), FadeIn(lbl), run=0.8)
        S = lambda n: (lambda x: 4 / PI * sum(np.sin(k * x) / k for k in range(1, n + 1, 2)))
        curves = [ax.plot(S(n), x_range=[0, 2 * TAU], color=PINK, stroke_width=5) for n in (1, 3, 5, 9, 25)]
        terms = [r"\sin x", r"\sin x+\tfrac13\sin 3x", r"\sin x+\tfrac13\sin 3x+\tfrac15\sin 5x", r"\sin x+\tfrac13\sin 3x+\tfrac15\sin 5x+\dots", r"\frac{4}{\pi}\sum_{k\ \mathrm{odd}}\frac{\sin kx}{k}"]
        f = M(terms[0], size=58, color=YEL).move_to([0, -2.95, 0])
        self.go("49:43.68", Create(curves[0]), Write(f), run=0.5)
        cur = curves[0]
        for c, tt, tx in zip(curves[1:], ["49:44.50", "49:45.34", "49:46.00", "49:46.70"], terms[1:]):
            nf = M(tx, size=58, color=YEL).move_to([0, -2.95, 0])
            if nf.get_bottom()[1] < -3.7:
                nf.shift(UP * (-3.7 - nf.get_bottom()[1]))
            self.go(tt, Transform(cur, c), Transform(f, nf), run=0.45)
        self.play(Indicate(cur, color=ORG, scale_factor=1.02), run_time=0.6)


class K10_UsingIt(Shot):
    def body(self):
        q = H("“When will I ever use trigonometry?”", 62, CHALK).move_to([0, 1.0, 0])
        self.go("49:56.30", FadeIn(q, shift=UP * 0.2), run=0.7)
        a = Text("You're using it right now.", font=HAND, weight=BOLD, font_size=80, color=YEL).move_to([0, -0.9, 0])
        self.go("49:59.60", q.animate.set_opacity(0.55), run=0.4)
        self.go("50:01.00", Write(a), run=0.9)
        bl = brush_line(a.width + 0.4, color=GRN, center=a.get_bottom() + DOWN * 0.18, seed=4)
        self.play(Create(bl), run_time=0.5)


class K10_NoThanks(Shot):
    def body(self):
        self.title("The Long Way?", animate=False)
        f = M(r"(1+i)", size=72, color=YEL)
        row = VGroup(*[f.copy() for _ in range(8)]).arrange_in_grid(2, 4, buff=(0.12, 0.3))
        row.move_to([0, 0.75, 0])
        self.go("48:35.90", LaggedStart(*[FadeIn(m, shift=DOWN * 0.2) for m in row], lag_ratio=0.25), run=2.0)
        sx = strike(row, RED, 9)
        self.go("48:38.50", Create(sx), run=0.3)
        nt = H("no thank you.", 72, RED).move_to([0, -1.3, 0])
        self.go("48:38.80", FadeIn(nt, scale=1.3), run=0.35)
