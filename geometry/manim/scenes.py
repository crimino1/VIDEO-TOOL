"""Geometry film Manim shots. Each class = one MSHOTS window; beats keyed to spoken words via W(word, hint).
Hints are transcript line starts (the first matching word at/after the hint). Calm series look: dark slate, cream lines,
amber / teal / rust / moss accents. Motion: Write / Create / FadeIn / Transform / Rotate only. No flash, bounce or glow."""
from mc import *

PAPER = "#1a2129"
WOOD = "#b8915a"


def WX(word, after): return W(word, after, exact=True)
def lab(s, size=26, color=DIM, font=BODY, **k): return T(s, size=size, color=color, font=font, **k)
def head(s, size=26, color=AMBER): return T(s, size=size, color=color, font=HEAD)


def card_bg(w, h, col=FAINT):
    return RoundedRectangle(width=w, height=h, corner_radius=0.14, stroke_color=col, stroke_width=2, fill_color="#10151b", fill_opacity=0.95)


def pencil():
    """Pencil with its graphite tip at ORIGIN, leaning right."""
    tip = Polygon([0, 0, 0], [-0.06, 0.16, 0], [0.06, 0.16, 0], stroke_width=0, fill_color="#3a3f46", fill_opacity=1)
    wood = Polygon([-0.06, 0.16, 0], [0.06, 0.16, 0], [0.17, 0.5, 0], [-0.17, 0.5, 0], stroke_width=0, fill_color="#d9b98a", fill_opacity=1)
    body = Rectangle(width=0.34, height=2.2, stroke_width=0, fill_color=AMBER, fill_opacity=1).move_to([0, 1.6, 0])
    edge = Rectangle(width=0.11, height=2.2, stroke_width=0, fill_color=AMBERL, fill_opacity=0.6).move_to([-0.08, 1.6, 0])
    fer = Rectangle(width=0.36, height=0.26, stroke_width=0, fill_color=DIM, fill_opacity=1).move_to([0, 2.83, 0])
    era = Rectangle(width=0.34, height=0.24, stroke_width=0, fill_color=RUSTL, fill_opacity=1).move_to([0, 3.08, 0])
    return VGroup(wood, tip, body, edge, fer, era).rotate(-0.42, about_point=ORIGIN)


def blob(r=0.5, seed=3, col="#5a6068"):
    rng = np.random.default_rng(seed)
    pts = [r * (1 + 0.16 * rng.standard_normal()) * np.array([np.cos(a), np.sin(a), 0]) for a in np.linspace(0, TAU, 28, endpoint=False)]
    return Polygon(*pts, stroke_width=0, fill_color=col, fill_opacity=1)


def rough_band(a, b, w=0.22, seed=5, col="#5a6068"):
    rng = np.random.default_rng(seed)
    a, b = np.array(a), np.array(b); d = (b - a) / np.linalg.norm(b - a); n = np.array([-d[1], d[0], 0])
    xs = np.linspace(0, 1, 30)
    top = [a + (b - a) * x + n * (w / 2) * (1 + 0.25 * rng.standard_normal()) for x in xs]
    bot = [a + (b - a) * x - n * (w / 2) * (1 + 0.25 * rng.standard_normal()) for x in xs[::-1]]
    return Polygon(*top, *bot, stroke_width=0, fill_color=col, fill_opacity=1)


def brick(w=1.0, h=0.42, col=FAINT, stroke=DIM):
    b = RoundedRectangle(width=w, height=h, corner_radius=0.05, stroke_color=stroke, stroke_width=1.5, fill_color=col, fill_opacity=1)
    studs = VGroup(*[RoundedRectangle(width=0.2, height=0.09, corner_radius=0.02, stroke_width=1.2, stroke_color=stroke, fill_color=col, fill_opacity=1)
                     .move_to(b.get_top() + UP * 0.04 + RIGHT * x * w) for x in (-0.25, 0.25)])
    return VGroup(studs, b)


def angle_arc(v, a0, a1, r=0.55, col=AMBER, w=3):
    return Arc(radius=r, start_angle=a0, angle=a1 - a0, arc_center=v, color=col, stroke_width=w)


def right_mark(v, d1, d2, s=0.28, col=CREAM, w=2.5):
    v, d1, d2 = np.array(v), np.array(d1), np.array(d2)
    return VMobject(color=col, stroke_width=w).set_points_as_corners([v + d1 * s, v + (d1 + d2) * s, v + d2 * s])


def unit(v): v = np.array(v, dtype=float); return v / np.linalg.norm(v)


def ang(v): return np.arctan2(v[1], v[0])


# ------------------------------------------------------------------ opening

class GeoName(Shot):
    """ge + metria = earth measuring."""
    NAME = "GeoName"
    def construct(self):
        self.until(W("name", 52.6) - 0.6)
        gr = MathTex(r"\Gamma\mathrm{E}\Omega", r"\mathrm{METPIA}", font_size=120, color=CREAM)
        self.play(Write(gr), run_time=1.2)
        self.until(W("Geo", 53.5) - 0.1)
        self.play(gr[0].animate.set_color(MOSSL).shift(LEFT * 1.4), gr[1].animate.shift(RIGHT * 1.4), run_time=0.6)
        e_ic = VGroup(Circle(radius=0.38, color=MOSSL, stroke_width=3),
                      Arc(radius=0.38, start_angle=PI * 1.15, angle=PI * 0.7, color=MOSSL, stroke_width=2).stretch(0.45, 1),
                      Line(LEFT * 0.38, RIGHT * 0.38, color=MOSSL, stroke_width=2))
        e_ic.next_to(gr[0], UP, buff=0.5)
        e_l = lab("geo  =  earth", size=34, color=MOSSL).next_to(gr[0], DOWN, buff=0.5)
        self.play(FadeIn(e_ic, shift=DOWN * 0.1), FadeIn(e_l, shift=UP * 0.1), run_time=0.5)
        self.until(W("Metria", 54.6) - 0.1)
        rl = Line(LEFT * 0.9, RIGHT * 0.9, color=AMBERL, stroke_width=3)
        tk = VGroup(*[Line(UP * (0.16 if k % 2 == 0 else 0.09), DOWN * 0, color=AMBERL, stroke_width=2).move_to(rl.point_from_proportion(k / 8) + UP * 0.06) for k in range(9)])
        m_ic = VGroup(rl, tk).next_to(gr[1], UP, buff=0.55)
        m_l = lab("metria  =  measuring", size=34, color=AMBERL).next_to(gr[1], DOWN, buff=0.5)
        self.play(gr[1].animate.set_color(AMBERL), FadeIn(m_ic, shift=DOWN * 0.1), FadeIn(m_l, shift=UP * 0.1), run_time=0.5)
        self.until(W("Geometry", 57.7) - 0.25)
        word = T("geometry", size=110, color=CREAM, font=HEAD).shift(UP * 0.35)
        sub = T("earth measuring", size=44, color=DIM).next_to(word, DOWN, buff=0.45)
        self.play(FadeOut(VGroup(e_ic, e_l, m_ic, m_l)), ReplacementTransform(gr, word), run_time=0.8)
        self.until(W("Earth", 58.3) - 0.1)
        self.play(FadeIn(sub, shift=UP * 0.1), run_time=0.5)
        self.finish()


class Roadmap(Shot):
    """One dot, then line, angle, triangle, circle: build up from there."""
    NAME = "Roadmap"
    def construct(self):
        self.until(W("single", 85.5) - 0.2)
        d = Dot(ORIGIN, radius=0.1, color=CREAM)
        self.play(FadeIn(d, scale=0.3), run_time=0.5)
        self.until(W("build", 86.6) - 0.1)
        A, B, C = np.array([-1.4, -1.0, 0]), np.array([1.6, -1.0, 0]), np.array([-0.2, 1.4, 0])
        self.play(d.animate.move_to(A), run_time=0.4)
        l1 = Line(A, B, color=CREAM, stroke_width=4)
        self.play(Create(l1), run_time=0.5)
        l2 = Line(A, C, color=CREAM, stroke_width=4)
        arc = angle_arc(A, 0, ang(C - A), 0.5, AMBER)
        self.play(Create(l2), Create(arc), run_time=0.5)
        l3 = Line(B, C, color=CREAM, stroke_width=4)
        tri = Polygon(A, B, C, stroke_width=0, fill_color=TEAL, fill_opacity=0.25)
        self.play(Create(l3), FadeIn(tri), run_time=0.5)
        circ = Circle(radius=1.5, color=CREAM, stroke_width=4).move_to(ORIGIN)
        self.play(ReplacementTransform(VGroup(l1, l2, l3, tri, arc, d), circ), run_time=0.7)
        self.until(W("everywhere", 89.6) - 0.6)
        shapes = VGroup(Triangle(color=AMBERL, stroke_width=3).scale(0.5), Square(side_length=0.85, color=TEALL, stroke_width=3),
                        RegularPolygon(6, color=MOSSL, stroke_width=3).scale(0.5), Circle(radius=0.42, color=RUSTL, stroke_width=3),
                        Star(5, outer_radius=0.5, color=CREAM, stroke_width=3), RegularPolygon(5, color=AMBERL, stroke_width=3).scale(0.48))
        pos = [[-5.2, 2.2], [5.0, 2.4], [-5.6, -1.4], [5.4, -1.6], [-2.6, 2.9], [2.8, -2.8]]
        for s_, p in zip(shapes, pos): s_.move_to([p[0], p[1], 0])
        self.play(LaggedStart(*[FadeIn(s_, scale=0.6) for s_ in shapes], lag_ratio=0.12), run_time=1.4)
        self.finish()


class PointLine(Shot):
    """A pencil dot -> a point (no size, just a location); a drawn piece of line -> a line (no width, forever)."""
    NAME = "PointLine"
    def construct(self):
        paper = RoundedRectangle(width=12.6, height=6.6, corner_radius=0.2, stroke_color=FAINT, stroke_width=2, fill_color=PAPER, fill_opacity=1).shift(DOWN * 0.15)
        self.play(FadeIn(paper), run_time=0.6)
        A, B = np.array([-2.6, -0.4, 0]), np.array([2.6, -0.4, 0])
        pen = pencil().shift(A + UR * 3.5)
        self.play(pen.animate.shift(-UR * 3.5), run_time=1.0, rate_func=smooth)
        self.until(W("Lift", 95.3) - 0.1)
        dA = Dot(A, radius=0.08, color=CREAM)
        self.add(dA)
        self.play(pen.animate.shift(UR * 4.2), run_time=0.6)
        self.until(W("point", 97.9) + 1.2)
        pl = lab("a point", size=30, color=AMBERL).next_to(dA, DOWN, buff=0.35)
        self.play(FadeIn(pl, shift=UP * 0.1), run_time=0.4)
        # where, but no size
        self.until(W("shows", 103.9) - 0.1)
        cr = VGroup(DashedLine(A + LEFT * 2.0, A + RIGHT * 2.0, color=FAINT, stroke_width=2, dash_length=0.1),
                    DashedLine(A + DOWN * 1.6, A + UP * 2.2, color=FAINT, stroke_width=2, dash_length=0.1))
        wh = lab("where it is", size=26, color=CREAM).next_to(A + UP * 2.2, RIGHT, buff=0.15)
        self.play(Create(cr), FadeIn(wh), run_time=0.6)
        self.until(W("size", 105.9) - 0.2)
        ns = lab("but no size at all", size=26, color=AMBERL).next_to(wh, DOWN, buff=0.12).align_to(wh, LEFT)
        self.play(FadeIn(ns), dA.animate.scale(0.35), run_time=0.6)
        self.until(W("location", 49.2 + 60) - 0.3)
        jl = lab("just a location", size=26, color=CREAM).next_to(ns, DOWN, buff=0.12).align_to(wh, LEFT)
        self.play(FadeIn(jl), run_time=0.4)
        # a piece of line
        self.until(W("drag", 110.8) - 0.1)
        self.play(FadeOut(VGroup(cr, wh, ns, jl, pl)), dA.animate.scale(1 / 0.35), run_time=0.4)
        dB = Dot(B, radius=0.08, color=CREAM)
        self.play(FadeIn(dB), pen.animate.shift(-UR * 4.2), run_time=0.7)
        seg = Line(A, B, color=CREAM, stroke_width=5)
        self.play(Create(seg), pen.animate.shift(B - A), run_time=1.6, rate_func=smooth)
        self.play(pen.animate.shift(UR * 4).set_opacity(0), run_time=0.6)
        self.remove(pen)
        self.until(W("piece", 114.0) - 0.2)
        pc = lab("a piece of a line", size=28, color=CREAM).next_to(seg, DOWN, buff=0.4)
        self.play(FadeIn(pc), run_time=0.4)
        self.until(W("forever", 118.2) - 0.6)
        full = Line(A + LEFT * 20, B + RIGHT * 20, color=AMBERL, stroke_width=3)
        arrs = VGroup(Arrow(LEFT * 5.2 + UP * -0.4, LEFT * 6.3 + UP * -0.4, buff=0, color=AMBERL, stroke_width=4, max_tip_length_to_length_ratio=0.35),
                      Arrow(RIGHT * 5.2 + UP * -0.4, RIGHT * 6.3 + UP * -0.4, buff=0, color=AMBERL, stroke_width=4, max_tip_length_to_length_ratio=0.35))
        fl = lab("no thickness, goes on forever", size=28, color=AMBERL).next_to(seg, UP, buff=0.45)
        self.play(GrowFromCenter(full), FadeIn(arrs), FadeTransform(pc, fl), run_time=1.4)
        # drawing vs idea
        self.until(W("draw", 121.9) - 0.2)
        self.play(FadeOut(VGroup(full, arrs, fl, seg, dA, dB, paper)), run_time=0.6)
        L, R = np.array([-3.4, 0, 0]), np.array([3.4, 0, 0])
        bl = card_bg(5.6, 5.0).move_to(L + DOWN * 0.2); br = card_bg(5.6, 5.0).move_to(R + DOWN * 0.2)
        t1 = head("THE DRAWING", 24, DIM).next_to(bl, UP, buff=0.15); t2 = head("THE IDEA", 24, AMBER).next_to(br, UP, buff=0.15)
        b1 = blob(0.42).move_to(L + UP * 1.0)
        rb = rough_band(L + LEFT * 2.0 + DOWN * 1.2, L + RIGHT * 2.0 + DOWN * 1.2, 0.3)
        p2 = VGroup(Line(R + UP * 1.0 + LEFT * 0.5, R + UP * 1.0 + RIGHT * 0.5, color=FAINT, stroke_width=1.5),
                    Line(R + UP * 0.5, R + UP * 1.5, color=FAINT, stroke_width=1.5), Dot(R + UP * 1.0, radius=0.03, color=AMBERL))
        l2 = Line(R + LEFT * 2.0 + DOWN * 1.2, R + RIGHT * 2.0 + DOWN * 1.2, color=AMBERL, stroke_width=1.6)
        self.play(FadeIn(bl), FadeIn(br), FadeIn(t1), FadeIn(t2), run_time=0.5)
        self.play(FadeIn(b1), FadeIn(rb), run_time=0.5)
        self.until(W("size", 125.0) - 0.3)
        s1 = lab("has some size", size=24).next_to(b1, DOWN, buff=0.25)
        self.play(FadeIn(s1), run_time=0.3)
        self.until(W("width", 127.0) - 0.3)
        s2 = lab("has some width", size=24).next_to(rb, DOWN, buff=0.25)
        self.play(FadeIn(s2), run_time=0.3)
        self.until(W("perfect", 129.0) - 0.3)
        self.play(FadeIn(p2), Create(l2), run_time=0.8)
        s3 = lab("perfect, in your head", size=24, color=AMBERL).move_to(R + DOWN * 2.1)
        self.play(FadeIn(s3), br.animate.set_stroke(AMBER, width=2.5), run_time=0.4)
        self.until(W("drawings", 132.4) - 0.2)
        s4 = lab("just helps you think", size=24, color=CREAM).move_to(L + DOWN * 3.05)
        self.play(FadeIn(s4), run_time=0.4)
        self.finish()


class Postulates(Shot):
    """Euclid's first two rules, then step-by-step facts stacked like Lego into a castle; one brick will cause trouble."""
    NAME = "Postulates"
    def construct(self):
        # rule 1
        L, R = np.array([-3.4, 0.5, 0]), np.array([3.4, 0.5, 0])
        c1, c2 = card_bg(5.8, 4.4).move_to(L), card_bg(5.8, 4.4).move_to(R)
        h1 = head("RULE 1", 24, AMBER).next_to(c1.get_top(), DOWN, buff=0.25)
        P1, P2 = L + np.array([-1.7, -0.7, 0]), L + np.array([1.7, 0.6, 0])
        d1, d2 = Dot(P1, radius=0.09, color=CREAM), Dot(P2, radius=0.09, color=CREAM)
        t1 = lab("a straight line between\nany two points", size=24, color=CREAM).next_to(c1.get_bottom(), UP, buff=0.25)
        self.play(FadeIn(c1), FadeIn(h1), FadeIn(d1), FadeIn(d2), run_time=0.5)
        self.play(Create(Line(P1, P2, color=AMBERL, stroke_width=4)), FadeIn(t1), run_time=0.9)
        self.until(W("circle", 151.9) - 0.2)
        h2 = head("RULE 3", 24, TEALL).next_to(c2.get_top(), DOWN, buff=0.25)
        C = R + DOWN * 0.1
        dc = Dot(C, radius=0.09, color=CREAM)
        rv = ValueTracker(0.0)
        rad = always_redraw(lambda: Line(C, C + 1.1 * np.array([np.cos(rv.get_value()), np.sin(rv.get_value()), 0]), color=DIM, stroke_width=2))
        arc = always_redraw(lambda: Arc(radius=1.1, start_angle=0, angle=max(rv.get_value(), 1e-3), arc_center=C, color=TEALL, stroke_width=4))
        t2 = lab("a circle around\nany point", size=24, color=CREAM).next_to(c2.get_bottom(), UP, buff=0.25)
        self.play(FadeIn(c2), FadeIn(h2), FadeIn(dc), FadeIn(t2), run_time=0.4)
        self.add(rad, arc)
        self.play(rv.animate.set_value(TAU), run_time=1.3, rate_func=smooth)
        self.until(W("obvious", 154.6) - 0.2)
        ob = lab("so obvious a child would agree", size=28, color=DIM).to_edge(DOWN, buff=0.5)
        self.play(FadeIn(ob), run_time=0.4)
        # bricks
        self.until(W("step", 157.1) - 0.2)
        everything = VGroup(*[m for m in self.mobjects if isinstance(m, VMobject)])
        self.play(FadeOut(everything), run_time=0.5)
        rad.clear_updaters(); arc.clear_updaters()
        base_y = -2.9
        b1 = brick(1.2, 0.46, "#5c4b2a", AMBER).move_to([-0.65, base_y, 0])
        b2 = brick(1.2, 0.46, "#2c4a4b", TEALL).move_to([0.65, base_y, 0])
        self.play(FadeIn(b1, shift=UP * 0.2), FadeIn(b2, shift=UP * 0.2), run_time=0.5)
        # a wall of facts, each resting on the ones below
        rows = []
        layout = [6, 5, 6, 5, 4, 3]
        times = np.linspace(self.now() + 0.3, self.rel(W("Each", 161.9)) + 1.2, sum(layout))
        k = 0
        built = VGroup()
        for r, n in enumerate(layout):
            y = base_y + 0.5 * (r + 1)
            for i in range(n):
                x = (i - (n - 1) / 2) * 1.05
                b = brick(1.0, 0.42, "#2a3138", DIM).move_to([x, y, 0])
                self.until(self.t0 + times[k]); k += 1
                self.play(FadeIn(b, shift=DOWN * 0.15), run_time=0.18)
                built.add(b)
        self.until(W("proven", 162.5) - 0.2)
        pr = lab("each one proven from the ones before", size=26, color=CREAM).to_edge(UP, buff=0.6)
        self.play(FadeIn(pr), run_time=0.4)
        # castle
        self.until(W("castle", 168.4) - 1.2)
        castle = VGroup()
        def tower(cx, h):
            for r in range(h):
                for i in range(2):
                    castle.add(brick(0.8, 0.36, "#2a3138", DIM).move_to([cx + (i - 0.5) * 0.84, base_y + 0.42 * (r + 1), 0]))
            for i in range(2):
                castle.add(brick(0.36, 0.3, "#2a3138", DIM).move_to([cx + (i - 0.5) * 0.84, base_y + 0.42 * (h + 1), 0]))
        def wall(x0, x1, h):
            n = int(round((x1 - x0) / 0.84))
            for r in range(h):
                for i in range(n):
                    castle.add(brick(0.8, 0.36, "#2a3138", DIM).move_to([x0 + 0.42 + i * 0.84, base_y + 0.42 * (r + 1), 0]))
        tower(-3.4, 8); tower(3.4, 8); wall(-2.52, 2.52, 5); tower(0, 10)
        self.play(FadeOut(pr), ReplacementTransform(built, castle), run_time=1.6)
        self.until(W("castle", 171.5) + 0.8)
        cl = lab("a whole castle of geometry", size=30, color=CREAM).to_edge(UP, buff=0.5)
        fd = lab("from a handful of bricks", size=26, color=AMBERL).next_to(cl, DOWN, buff=0.15)
        self.play(FadeIn(cl), run_time=0.4)
        self.until(W("bricks", 174.0) - 0.3)
        self.play(FadeIn(fd), b1.animate.scale(1.12), b2.animate.scale(1.12), run_time=0.5)
        # the troublesome rule
        self.until(W("Hold", 179.7) - 0.1)
        b5 = brick(1.2, 0.46, "#4a2a22", RUSTL).move_to([2.3, base_y, 0])
        ic = VGroup(Line(LEFT * 0.3, RIGHT * 0.3, color=RUSTL, stroke_width=2).shift(UP * 0.07), Line(LEFT * 0.3, RIGHT * 0.3, color=RUSTL, stroke_width=2).shift(DOWN * 0.07)).move_to(b5[1])
        self.play(FadeOut(VGroup(cl, fd)), castle.animate.set_opacity(0.3), FadeIn(VGroup(b5, ic), shift=UP * 0.2), run_time=0.6)
        self.until(W("trouble", 182.9) - 0.4)
        q = M("?", size=72, color=RUSTL).next_to(b5, UP, buff=0.25)
        tl = lab("this one will cause trouble", size=26, color=RUSTL).next_to(q, UP, buff=0.15)
        self.play(FadeIn(q, shift=DOWN * 0.1), FadeIn(tl), run_time=0.5)
        self.finish()


class Angles(Shot):
    """Two lines meeting = an angle; a door opening; full turn = 360 degrees; 180 half turn; 90 right angle."""
    NAME = "Angles"
    def construct(self):
        V = np.array([-2.8, -0.6, 0]); R = 2.4
        r1 = Line(V, V + R * RIGHT, color=CREAM, stroke_width=4)
        a = ValueTracker(0.75)
        r2 = always_redraw(lambda: Line(V, V + R * np.array([np.cos(a.get_value()), np.sin(a.get_value()), 0]), color=AMBERL, stroke_width=6))
        arc = always_redraw(lambda: Arc(radius=0.7, start_angle=0, angle=max(a.get_value(), 1e-3), arc_center=V, color=AMBER, stroke_width=3))
        self.until(W("meet", 186.2) - 0.6)
        self.play(Create(r1), Create(Line(V, V + R * np.array([np.cos(0.75), np.sin(0.75), 0]), color=AMBERL, stroke_width=6)), run_time=0.8)
        self.add(r2); self.remove(*[m for m in self.mobjects if isinstance(m, Line) and m is not r1 and m is not r2])
        self.until(W("angle", 189.6) - 0.3)
        al = lab("an angle", size=34, color=AMBERL).move_to([2.6, 1.6, 0])
        self.play(Create(arc), FadeIn(al), run_time=0.6)
        # door from above
        self.until(W("door", 191.1) - 0.3)
        wall = VGroup(Line(V + LEFT * 1.6, V + LEFT * 0.08, color=DIM, stroke_width=10), Line(V + RIGHT * (R + 0.1), V + RIGHT * (R + 1.6), color=DIM, stroke_width=10))
        dl = lab("a door, seen from above", size=26, color=DIM).next_to(al, DOWN, buff=0.3).align_to(al, LEFT)
        self.play(FadeIn(wall), FadeIn(dl), a.animate.set_value(0.0), run_time=0.8)
        self.until(W("little", 193.9) - 0.2)
        self.play(a.animate.set_value(0.42), run_time=0.8)
        sm = lab("open a little: small angle", size=26, color=CREAM).next_to(dl, DOWN, buff=0.2).align_to(al, LEFT)
        self.play(FadeIn(sm), run_time=0.3)
        self.until(W("Swing", 196.1) - 0.1)
        self.play(FadeOut(VGroup(wall, sm, dl)), run_time=0.3)
        self.play(a.animate.set_value(TAU - 0.001), run_time=2.0, rate_func=smooth)
        ft = lab("a full turn", size=30, color=CREAM).next_to(al, DOWN, buff=0.3).align_to(al, LEFT)
        self.play(FadeIn(ft), run_time=0.3)
        # 360 steps
        self.until(W("360", 199.3) - 0.2)
        ticks = VGroup(*[Line(V + (R + 0.12) * np.array([np.cos(t), np.sin(t), 0]), V + (R + (0.36 if k % 10 == 0 else 0.22)) * np.array([np.cos(t), np.sin(t), 0]),
                              color=DIM, stroke_width=1.2) for k, t in enumerate(np.linspace(0, TAU, 360, endpoint=False))])
        self.play(LaggedStart(*[Create(t) for t in ticks], lag_ratio=0.004), run_time=1.6)
        dg = M(r"360^\circ", size=80, color=CREAM).next_to(ft, DOWN, buff=0.35).align_to(al, LEFT)
        dgl = lab("small steps called degrees", size=26).next_to(dg, DOWN, buff=0.15).align_to(al, LEFT)
        self.play(Write(dg), FadeIn(dgl), run_time=0.7)
        self.until(W("Nobody's", 203.9) - 0.2)
        why = lab("why 360? nobody's sure", size=26, color=DIM).next_to(dgl, DOWN, buff=0.3).align_to(al, LEFT)
        self.play(FadeIn(why), run_time=0.4)
        self.until(W("60s", 209.8) - 1.2)
        for g in range(6):
            for k in range(60 * g, 60 * g + 60): ticks[k].set_color(AMBER if g % 2 == 0 else TEALL)
        bab = lab("Babylonians counted in 60s", size=26, color=AMBERL).move_to(why).align_to(al, LEFT)
        self.play(FadeTransform(why, bab), *[ticks[k].animate.set_stroke(width=2) for k in range(0, 360, 1)], run_time=0.6)
        self.until(W("splits", 211.9) - 0.2)
        spl = lab("and 360 splits evenly in lots of ways", size=26, color=CREAM).move_to(bab).align_to(al, LEFT)
        self.play(FadeTransform(bab, spl), ticks.animate.set_color(DIM).set_stroke(width=1.2), run_time=0.4)
        for n in (2, 3, 4, 6, 8, 12):
            sp = VGroup(*[Line(V, V + R * np.array([np.cos(TAU * k / n), np.sin(TAU * k / n), 0]), color=TEALL, stroke_width=2) for k in range(n)])
            self.play(FadeIn(sp), run_time=0.18); self.wait(0.12); self.play(FadeOut(sp), run_time=0.12)
        # 180 and 90
        self.until(W("halfway", 214.9) - 0.3)
        self.play(FadeOut(VGroup(ft, dg, dgl, spl)), a.animate.set_value(PI), run_time=0.9)
        h = M(r"180^\circ", size=80, color=CREAM).next_to(al, DOWN, buff=0.4).align_to(al, LEFT)
        hl = lab("half a turn", size=26).next_to(h, DOWN, buff=0.12).align_to(al, LEFT)
        self.play(Write(h), FadeIn(hl), run_time=0.6)
        self.until(W("quarter", 218.1) - 0.3)
        self.play(a.animate.set_value(PI / 2), FadeOut(VGroup(h, hl)), run_time=0.8)
        q = M(r"90^\circ", size=80, color=CREAM).next_to(al, DOWN, buff=0.4).align_to(al, LEFT)
        ql = lab("a quarter turn", size=26).next_to(q, DOWN, buff=0.12).align_to(al, LEFT)
        self.play(Write(q), FadeIn(ql), run_time=0.6)
        self.until(W("right", 221.6) - 0.3)
        rm = right_mark(V, RIGHT, UP, 0.42, CREAM, 3)
        ra = T("a right angle", size=44, color=AMBERL, font=HEAD).next_to(ql, DOWN, buff=0.35).align_to(al, LEFT)
        self.play(FadeOut(arc), Create(rm), FadeIn(ra, shift=UP * 0.1), run_time=0.6)
        self.finish()


class Rigid(Shot):
    """Three sticks make a triangle. A pinned square squashes; a pinned triangle won't budge."""
    NAME = "Rigid"
    def construct(self):
        A, B, C = np.array([-1.6, -1.4, 0]), np.array([1.6, -1.4, 0]), np.array([0, 1.4, 0])
        sticks = VGroup(*[Line(p, q, color=WOOD, stroke_width=14) for p, q in ((A, B), (B, C), (C, A))])
        offs = [DOWN * 2 + LEFT * 3, RIGHT * 4 + UP * 1, LEFT * 4 + UP * 2]
        for s_, o in zip(sticks, offs): s_.shift(o).rotate(0.6)
        self.play(LaggedStart(*[FadeIn(s_) for s_ in sticks], lag_ratio=0.2), run_time=0.8)
        self.until(W("join", 232.3) - 0.2)
        tgt = [Line(p, q, color=WOOD, stroke_width=14) for p, q in ((A, B), (B, C), (C, A))]
        self.play(*[Transform(s_, t_) for s_, t_ in zip(sticks, tgt)], run_time=1.0)
        pins = VGroup(*[Dot(p, radius=0.09, color=CREAM) for p in (A, B, C)])
        self.play(FadeIn(pins), run_time=0.3)
        self.until(W("triangle", 237.1) - 0.2)
        tl = T("a triangle", size=46, color=CREAM, font=HEAD).to_edge(UP, buff=0.6)
        self.play(FadeIn(tl, shift=UP * 0.1), run_time=0.4)
        self.until(W("superpower", 239.4) - 0.3)
        sp = lab("and a superpower", size=30, color=AMBERL).next_to(tl, DOWN, buff=0.2)
        self.play(FadeIn(sp), run_time=0.4)
        # square on the left, triangle on the right
        self.until(W("square", 245.6) - 0.6)
        self.play(FadeOut(VGroup(tl, sp)), VGroup(sticks, pins).animate.scale(0.75).move_to([3.6, -0.3, 0]).set_opacity(0.0), run_time=0.6)
        O = np.array([-4.6, -2.0, 0]); s = 2.6
        th = ValueTracker(PI / 2)
        def sq():
            u = np.array([np.cos(th.get_value()), np.sin(th.get_value()), 0])
            P = [O, O + RIGHT * s, O + RIGHT * s + u * s, O + u * s]
            g = VGroup(*[Line(P[i], P[(i + 1) % 4], color=WOOD, stroke_width=14) for i in range(4)])
            g.add(*[Dot(p, radius=0.09, color=CREAM) for p in P])
            return g
        sqm = always_redraw(sq)
        self.play(FadeIn(sqm), run_time=0.5)
        self.until(W("Push", 246.8) - 0.1)
        push = Arrow(O + UP * s + LEFT * 1.4, O + UP * s + LEFT * 0.15, buff=0, color=RUSTL, stroke_width=6)
        self.play(GrowArrow(push), run_time=0.4)
        self.play(th.animate.set_value(PI / 2 - 0.62), push.animate.shift(RIGHT * s * np.sin(0.62) * 0.95 + DOWN * 0.45), run_time=1.6)
        self.until(W("squashes", 247.7) + 1.4)
        dl = lab("squashes into a diamond", size=26, color=RUSTL).move_to([-3.3, 1.9, 0])
        self.play(FadeIn(dl), run_time=0.3)
        self.until(W("sides", 251.0) - 0.2)
        same = lab("same sides, different shape", size=26, color=CREAM).next_to(dl, DOWN, buff=0.15)
        self.play(FadeIn(same), run_time=0.4)
        self.until(W("triangle", 255.4) - 0.4)
        T0 = np.array([1.8, -2.0, 0]); T1 = T0 + RIGHT * 3.2; T2 = T0 + np.array([1.6, 2.7, 0])
        tri = VGroup(*[Line(p, q, color=WOOD, stroke_width=14) for p, q in ((T0, T1), (T1, T2), (T2, T0))], *[Dot(p, radius=0.09, color=CREAM) for p in (T0, T1, T2)])
        self.play(FadeIn(tri, shift=UP * 0.1), run_time=0.6)
        self.until(W("push", 256.0) - 0.1)
        p2 = Arrow(T2 + LEFT * 1.5, T2 + LEFT * 0.15, buff=0, color=RUSTL, stroke_width=6)
        self.play(GrowArrow(p2), run_time=0.4)
        for dx in (0.05, -0.05, 0.03, -0.03):
            self.play(tri.animate.shift(RIGHT * dx), run_time=0.08)
        self.until(W("budge", 257.6) - 0.2)
        wb = lab("won't budge", size=30, color=TEALL).move_to([3.4, 1.9, 0])
        self.play(FadeIn(wb), run_time=0.3)
        self.until(W("three", 259.0) - 0.1)
        one = lab("3 fixed sides  =  only 1 shape", size=28, color=CREAM).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(one), run_time=0.4)
        self.until(W("bend", 263.6) - 0.3)
        brk = VGroup(Line(T0 + RIGHT * 1.45 + UP * 0.25, T0 + RIGHT * 1.65 + DOWN * 0.25, color=RUSTL, stroke_width=4),
                     Line(T0 + RIGHT * 1.65 + UP * 0.25, T0 + RIGHT * 1.45 + DOWN * 0.25, color=RUSTL, stroke_width=4))
        bl = lab("unless you break a side", size=24, color=RUSTL).next_to(T0 + RIGHT * 1.6, DOWN, buff=0.35)
        self.play(Create(brk), FadeIn(bl), run_time=0.5)
        self.finish()


class AngleSum(Shot):
    """Tear the three corners off a paper triangle and line them up: always a straight line, 180 degrees."""
    NAME = "AngleSum"
    def construct(self):
        P = [np.array([-4.2, -1.6, 0]), np.array([0.4, -1.6, 0]), np.array([-2.6, 2.0, 0])]
        cols = [AMBER, TEALL, RUSTL]
        paper = Polygon(*P, stroke_color=CREAM, stroke_width=3, fill_color="#d9cfb8", fill_opacity=0.12)
        self.until(W("Draw", 283.1) - 0.1)
        self.play(Create(paper), run_time=1.0)
        self.play(paper.animate.set_fill(opacity=0.25), run_time=0.4)
        rng = np.random.default_rng(2)
        r = 0.95
        pieces, wedges = VGroup(), VGroup()
        for i in range(3):
            v = P[i]; u1, u2 = unit(P[(i + 1) % 3] - v), unit(P[(i + 2) % 3] - v)
            a1, a2 = ang(u1), ang(u2)
            if (a2 - a1) % TAU > PI: a1, a2 = a2, a1
            span = (a2 - a1) % TAU
            jag = [v + r * (1 + 0.07 * rng.standard_normal()) * np.array([np.cos(a1 + span * t), np.sin(a1 + span * t), 0]) for t in np.linspace(0, 1, 9)]
            pc = Polygon(v, *jag, stroke_color=CREAM, stroke_width=2, fill_color="#d9cfb8", fill_opacity=0.25)
            w = Sector(radius=0.5, angle=span, start_angle=a1, arc_center=v, fill_color=cols[i], fill_opacity=0.85, stroke_width=0)
            g = VGroup(pc, w); g.a1 = a1; g.span = span; g.v = v
            pieces.add(g)
        self.play(FadeIn(VGroup(*[p_[1] for p_ in pieces])), run_time=0.5)
        self.until(W("Tear", 285.4) - 0.1)
        self.add(pieces)
        self.play(*[p_.animate.shift(unit(p_.v - np.mean(P, axis=0)) * 0.6) for p_ in pieces], paper.animate.set_opacity(0.25), run_time=0.9)
        # line them up at a point on a base line
        self.until(W("line", 287.1) - 0.1)
        X = np.array([2.6, -0.8, 0])
        base = DashedLine(X + LEFT * 2.6, X + RIGHT * 2.6, color=FAINT, stroke_width=2, dash_length=0.1)
        self.play(Create(base), run_time=0.4)
        start = 0.0
        anims = []
        for p_ in pieces:
            cur_v = p_.v + unit(p_.v - np.mean(P, axis=0)) * 0.6
            anims.append(p_.animate.rotate(start - p_.a1, about_point=cur_v).shift(X - cur_v))
            start += p_.span
        self.play(*anims, run_time=1.8)
        self.until(W("straight", 290.4) - 0.3)
        sl = Line(X + LEFT * 2.6, X + RIGHT * 2.6, color=CREAM, stroke_width=4)
        self.play(Create(sl), run_time=0.5)
        self.until(W("Half", 291.7) - 0.1)
        hh = Arc(radius=1.35, start_angle=0, angle=PI, arc_center=X, color=CREAM, stroke_width=2.5)
        self.play(Create(hh), run_time=0.6)
        self.until(W("180", 293.1) - 0.1)
        t180 = M(r"180^\circ", size=80, color=CREAM).next_to(X + UP * 1.4, UP, buff=0.25)
        self.play(Write(t180), run_time=0.6)
        # any triangle
        self.until(W("matter", 295.3) - 0.3)
        self.play(FadeOut(VGroup(pieces, base, sl, hh, paper)), t180.animate.scale(0.7).move_to([3.4, 2.4, 0]), run_time=0.6)
        apx = ValueTracker(-0.6)
        def tri():
            Q = [np.array([-4.4, -1.8, 0]), np.array([0.6, -1.8, 0]), np.array([apx.get_value(), 2.6 - abs(apx.get_value() + 1.6) * 0.55, 0])]
            g = VGroup(Polygon(*Q, stroke_color=CREAM, stroke_width=3, fill_color="#d9cfb8", fill_opacity=0.15))
            for i in range(3):
                v = Q[i]; u1, u2 = unit(Q[(i + 1) % 3] - v), unit(Q[(i + 2) % 3] - v)
                a1, a2 = ang(u1), ang(u2)
                if (a2 - a1) % TAU > PI: a1, a2 = a2, a1
                g.add(Sector(radius=0.45, angle=(a2 - a1) % TAU, start_angle=a1, arc_center=v, fill_color=cols[i], fill_opacity=0.85, stroke_width=0))
            return g
        tm = always_redraw(tri)
        self.play(FadeIn(tm), run_time=0.4)
        eq = M(r"\bullet", "+", r"\bullet", "+", r"\bullet", "=", r"180^\circ", size=64).move_to([3.4, 0.6, 0])
        eq[0].set_color(AMBER); eq[2].set_color(TEALL); eq[4].set_color(RUSTL)
        self.play(FadeIn(eq), run_time=0.4)
        self.play(apx.animate.set_value(-1.9), run_time=1.3)
        self.play(apx.animate.set_value(3.2), run_time=1.8)
        self.play(apx.animate.set_value(-1.2), run_time=1.4)
        self.until(W("flat", 299.1) - 0.3)
        fl = lab("on a flat sheet: every triangle", size=26, color=DIM).next_to(eq, DOWN, buff=0.35)
        self.play(FadeIn(fl), run_time=0.4)
        self.until(W("Remember", 304.7) - 0.1)
        self.play(t180.animate.scale(1.6).set_color(AMBERL).move_to([3.4, 2.3, 0]), run_time=0.6)
        self.finish()


class Pythag(Shot):
    """Right triangle with tiled squares 3, 4, 5: 9 + 16 = 25, tiles pour into the big square; then any right triangle."""
    NAME = "Pythag"
    def construct(self):
        u = 0.42
        O = np.array([-3.2, -0.2, 0])
        A, B = O + RIGHT * 4 * u, O + UP * 3 * u          # legs: 4 along x, 3 along y
        tri = Polygon(O, A, B, stroke_color=CREAM, stroke_width=4, fill_color=CREAM, fill_opacity=0.08)
        self.play(Create(tri), run_time=0.9)
        self.until(W("right", 308.7) - 0.2)
        rm = right_mark(O, RIGHT, UP, 0.25)
        self.play(Create(rm), run_time=0.4)
        self.until(W("right", 311.0) - 0.2)
        rt = T("a right triangle", size=40, color=CREAM, font=HEAD).move_to([3.4, 2.6, 0])
        self.play(FadeIn(rt), run_time=0.4)
        self.until(W("famous", 313.4) - 0.3)
        mf = lab("the most famous rule in geometry", size=26, color=AMBERL).next_to(rt, DOWN, buff=0.2)
        self.play(FadeIn(mf), run_time=0.4)
        # squares of tiles: legs 3 (left), 4 (below), hypotenuse 5 (outside)
        def tiles(origin, e1, e2, n, col, op=0.85):
            g = VGroup()
            for i in range(n):
                for j in range(n):
                    p = origin + e1 * (i + 0.5) * u + e2 * (j + 0.5) * u
                    sq = Polygon(p - (e1 + e2) * u * 0.45, p + (e1 - e2) * u * 0.45, p + (e1 + e2) * u * 0.45, p + (e2 - e1) * u * 0.45,
                                 stroke_width=1, stroke_color=col, fill_color=col, fill_opacity=op)
                    g.add(sq)
            return g
        h_dir = unit(B - A); h_out = np.array([h_dir[1], -h_dir[0], 0]) * -1   # outward from triangle
        if np.dot(h_out, (A + B) / 2 - O) < 0: h_out = -h_out
        sqL = Polygon(O, B, B + LEFT * 3 * u, O + LEFT * 3 * u, stroke_color=TEALL, stroke_width=3)
        sqD = Polygon(O, A, A + DOWN * 4 * u, O + DOWN * 4 * u, stroke_color=AMBERL, stroke_width=3)
        sqH = Polygon(A, B, B + h_out * 5 * u, A + h_out * 5 * u, stroke_color=CREAM, stroke_width=3)
        self.until(W("square", 317.5) + 0.6)
        self.play(Create(sqL), Create(sqD), Create(sqH), run_time=1.2)
        self.until(W("three", 322.0) - 0.2)
        l3 = M("3", size=44, color=TEALL).next_to(Line(O, B), RIGHT, buff=0.15)
        l4 = M("4", size=44, color=AMBERL).next_to(Line(O, A), UP, buff=0.12)
        self.play(FadeIn(l3), FadeIn(l4), run_time=0.4)
        tL = tiles(O + LEFT * 3 * u, RIGHT, UP, 3, TEAL)
        tD = tiles(O + DOWN * 4 * u, RIGHT, UP, 4, AMBER)
        self.until(W("nine", 325.2) - 0.6)
        self.play(LaggedStart(*[FadeIn(t, scale=0.5) for t in tL], lag_ratio=0.08), run_time=0.9)
        n9 = M("9", size=56, color=CREAM).move_to(sqL)
        self.play(FadeIn(n9), run_time=0.3)
        self.until(W("16", 328.0) - 0.6)
        self.play(LaggedStart(*[FadeIn(t, scale=0.5) for t in tD], lag_ratio=0.05), run_time=0.9)
        n16 = M("16", size=56, color=CREAM).move_to(sqD)
        self.play(FadeIn(n16), run_time=0.3)
        self.until(W("longest", 330.6) - 0.2)
        self.play(sqH.animate.set_stroke(AMBERL, width=5), run_time=0.4)
        self.until(W("five", 333.8) - 0.2)
        l5 = M("5", size=44, color=CREAM).move_to((A + B) / 2 - h_out * 0.35)
        grid = tiles(A, h_dir, h_out, 5, CREAM, 0.0)
        for t in grid: t.set_stroke(FAINT, width=1.2)
        self.play(FadeIn(l5), Create(grid), run_time=0.8)
        self.until(W("25", 335.6) - 0.2)
        n25 = M("25", size=64, color=CREAM).move_to(sqH)
        self.play(FadeIn(n25), run_time=0.3)
        self.until(W("9", 337.5) - 0.1)
        eq = M("9", "+", "16", "=", "25", size=90).move_to([3.4, 0.6, 0])
        eq[0].set_color(TEALL); eq[2].set_color(AMBERL)
        self.play(FadeOut(VGroup(rt, mf)), Write(eq), run_time=1.2)
        self.until(W("fill", 341.8) - 0.9)
        targets = list(grid)
        movers = list(tL) + list(tD)
        self.play(FadeOut(VGroup(n9, n16, n25)), LaggedStart(*[Transform(m, t.copy().set_fill(m.get_fill_color(), 0.85).set_stroke(m.get_fill_color(), 1)) for m, t in zip(movers, targets)], lag_ratio=0.03),
                  run_time=1.8)
        fill = lab("the two small squares exactly fill the big one", size=24, color=CREAM).next_to(eq, DOWN, buff=0.4)
        self.play(FadeIn(fill), run_time=0.4)
        # every right triangle
        self.until(W("luck", 344.2) - 0.3)
        self.play(FadeOut(VGroup(*movers, grid, l3, l4, l5, fill, sqL, sqD, sqH, tri, rm)), FadeOut(eq), run_time=0.6)
        a = ValueTracker(3.0); b = ValueTracker(4.0)
        O2 = np.array([-3.0, -0.4, 0])
        def fig():
            k = 0.42
            Ax, By = O2 + RIGHT * b.get_value() * k, O2 + UP * a.get_value() * k
            hd = unit(By - Ax); ho = np.array([-hd[1], hd[0], 0])
            if np.dot(ho, (Ax + By) / 2 - O2) < 0: ho = -ho
            c = np.hypot(a.get_value(), b.get_value()) * k
            return VGroup(Polygon(O2, Ax, By, stroke_color=CREAM, stroke_width=4, fill_color=CREAM, fill_opacity=0.08),
                          Polygon(O2, By, By + LEFT * a.get_value() * k, O2 + LEFT * a.get_value() * k, stroke_width=0, fill_color=TEAL, fill_opacity=0.7),
                          Polygon(O2, Ax, Ax + DOWN * b.get_value() * k, O2 + DOWN * b.get_value() * k, stroke_width=0, fill_color=AMBER, fill_opacity=0.7),
                          Polygon(Ax, By, By + ho * c, Ax + ho * c, stroke_color=CREAM, stroke_width=3, fill_color=CREAM, fill_opacity=0.12),
                          right_mark(O2, RIGHT, UP, 0.22))
        fg = always_redraw(fig)
        self.play(FadeIn(fg), run_time=0.5)
        f = M("a^2", "+", "b^2", "=", "c^2", size=96).move_to([3.4, 0.8, 0])
        f[0].set_color(TEALL); f[2].set_color(AMBERL)
        ev = lab("every right triangle, ever", size=28, color=CREAM).next_to(f, DOWN, buff=0.4)
        self.play(Write(f), FadeIn(ev), run_time=1.0)
        self.play(a.animate.set_value(1.6), b.animate.set_value(5.0), run_time=1.6)
        self.play(a.animate.set_value(4.2), b.animate.set_value(2.6), run_time=1.6)
        self.play(a.animate.set_value(3.0), b.animate.set_value(4.0), run_time=1.2)
        self.until(W("Pythagorean", 355.2) - 0.4)
        nm = T("the Pythagorean theorem", size=40, color=AMBERL, font=HEAD).move_to([3.4, 2.6, 0])
        if nm.width > 6.4: nm.width = 6.4
        self.play(FadeIn(nm, shift=DOWN * 0.1), run_time=0.5)
        self.finish()


# ------------------------------------------------------------------ squares in daily life

class TV(Shot):
    """A 55-inch TV: the number is the diagonal, the long side of a right triangle made by width and height."""
    NAME = "TV"
    def construct(self):
        w, h = 7.2, 4.05
        C = np.array([-0.6, 0.2, 0])
        frame = RoundedRectangle(width=w + 0.3, height=h + 0.3, corner_radius=0.12, stroke_color=DIM, stroke_width=3, fill_color="#0f1317", fill_opacity=1).move_to(C)
        scr = Rectangle(width=w, height=h, stroke_width=0, fill_color="#16202a", fill_opacity=1).move_to(C)
        stand = VGroup(Line(C + DOWN * (h / 2 + 0.15), C + DOWN * (h / 2 + 0.6), color=DIM, stroke_width=6),
                       Line(C + DOWN * (h / 2 + 0.6) + LEFT * 1.0, C + DOWN * (h / 2 + 0.6) + RIGHT * 1.0, color=DIM, stroke_width=6))
        self.play(FadeIn(VGroup(frame, scr, stand)), run_time=0.7)
        BL, TR, BR = C + np.array([-w / 2, -h / 2, 0]), C + np.array([w / 2, h / 2, 0]), C + np.array([w / 2, -h / 2, 0])
        self.until(W("diagonal", 389.9) - 0.2)
        dg = Line(BL, TR, color=AMBERL, stroke_width=6)
        self.play(Create(dg), run_time=0.8)
        self.until(W("corner", 392.3) - 0.2)
        cd = VGroup(Dot(BL, radius=0.1, color=AMBERL), Dot(TR, radius=0.1, color=AMBERL))
        self.play(FadeIn(cd, scale=0.4), run_time=0.4)
        self.until(W("55", 394.6) - 0.1)
        l55 = M(r"55\text{ in}", size=60, color=AMBERL).move_to(dg.get_center() + np.array([-0.5, 0.6, 0])).rotate(ang(TR - BL))
        self.play(Write(l55), run_time=0.6)
        self.until(W("wide", 396.9) - 0.4)
        wa = DoubleArrow(BL + DOWN * 0.95, BR + DOWN * 0.95, buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        wl = lab("not 55 inches wide", size=28, color=CREAM).next_to(wa, DOWN, buff=0.15)
        self.play(FadeOut(stand), GrowFromCenter(wa), FadeIn(wl), run_time=0.6)
        self.until(W("triangle", 398.1) + 0.6)
        tri = Polygon(BL, BR, TR, stroke_width=0, fill_color=AMBER, fill_opacity=0.18)
        wd = Line(BL, BR, color=TEALL, stroke_width=7); ht = Line(BR, TR, color=RUSTL, stroke_width=7)
        rm = right_mark(BR, LEFT, UP, 0.35)
        self.play(FadeIn(tri), Create(wd), Create(ht), Create(rm), run_time=0.8)
        self.until(W("width", 400.6) - 0.2)
        tw_ = lab("width", size=30, color=TEALL).next_to(wd, UP, buff=0.2)
        th_ = lab("height", size=30, color=RUSTL).next_to(ht, RIGHT, buff=0.2)
        self.play(FadeIn(tw_), FadeIn(th_), FadeOut(VGroup(wa, wl)), run_time=0.5)
        self.finish()


# ------------------------------------------------------------------ circles and pi

class CircleDef(Shot):
    """Every point on a circle is the same distance from the middle."""
    NAME = "CircleDef"
    def construct(self):
        C, R = ORIGIN + DOWN * 0.2, 2.2
        circ = Circle(radius=R, color=CREAM, stroke_width=4).move_to(C)
        self.add(circ, Dot(C, radius=0.08, color=AMBER))
        rays = VGroup(*[Line(C, C + R * np.array([np.cos(a), np.sin(a), 0]), color=AMBERL, stroke_width=3) for a in np.linspace(0.3, TAU + 0.3, 9, endpoint=False)])
        self.play(LaggedStart(*[Create(r) for r in rays], lag_ratio=0.12), run_time=1.6)
        sl = lab("same distance from the middle", size=30, color=AMBERL).next_to(circ, DOWN, buff=0.3)
        self.play(FadeIn(sl), run_time=0.4)
        self.finish()


def unroll_group(scene, r, x0, yb, col=RUSTL, run=1.4):
    u = ValueTracker(0.0)
    def roll():
        uu = u.get_value(); L = uu * TAU * r; cx = x0 + L
        return VGroup(Line([x0, yb, 0], [cx, yb, 0], color=col, stroke_width=7),
                      Arc(radius=r, start_angle=-PI / 2, angle=max((1 - uu) * TAU, 1e-3), arc_center=[cx, yb + r, 0], color=col, stroke_width=7))
    g = always_redraw(roll)
    scene.add(g)
    scene.play(u.animate.set_value(1.0), run_time=run, rate_func=smooth)
    g.clear_updaters()
    return g


class PiScene(Shot):
    """Around / across: the same number in a bangle, a wheel and the equator; unroll it: 3 and a bit; 3.14159... = pi."""
    NAME = "PiScene"
    def construct(self):
        r, x0, yb = 1.15, -5.6, -1.9
        cc = np.array([x0, yb + r, 0])
        circ = Circle(radius=r, color=CREAM, stroke_width=3).move_to(cc)
        self.play(Create(circ), run_time=0.8)
        self.until(W("around", 437.0) - 0.2)
        rim = Arc(radius=r, start_angle=-PI / 2, angle=TAU, arc_center=cc, color=RUSTL, stroke_width=7)
        al = lab("around", size=26, color=RUSTL).next_to(circ, UP, buff=0.2)
        self.play(Create(rim), FadeIn(al), run_time=0.9)
        self.until(W("across", 439.2) - 0.2)
        dia = Line(cc + LEFT * r, cc + RIGHT * r, color=CREAM, stroke_width=5)
        acl = lab("across", size=24, color=CREAM).next_to(dia, UP, buff=0.1)
        self.play(Create(dia), FadeIn(acl), run_time=0.5)
        dv = M(r"\frac{\text{around}}{\text{across}}", size=56, color=CREAM).move_to([3.6, 2.6, 0])
        self.play(Write(dv), run_time=0.6)
        # three different circles, same answer
        self.until(W("bangle", 441.7) - 0.1)
        items = [("bangle", 0.42, [-0.4, 0.9]), ("bicycle wheel", 0.85, [2.0, 0.6]), ("Earth's equator", 1.25, [4.9, 0.4])]
        objs = VGroup()
        for i, (nm, rr, p) in enumerate(items):
            c = Circle(radius=rr, color=[AMBERL, TEALL, MOSSL][i], stroke_width=4).move_to([p[0], p[1], 0])
            t = lab(nm, size=22, color=DIM).next_to(c, DOWN, buff=0.15)
            v = M(r"3.14\ldots", size=34, color=CREAM).next_to(t, DOWN, buff=0.1)
            objs.add(VGroup(c, t, v))
            self.play(Create(c), FadeIn(t), run_time=0.35)
        self.until(W("matter", 445.2) - 0.3)
        self.play(LaggedStart(*[FadeIn(o[2], shift=UP * 0.1) for o in objs], lag_ratio=0.2), run_time=0.8)
        # unroll
        self.until(W("always", 446.4) - 0.2)
        base = Line([x0 - 0.3, yb, 0], [x0 + TAU * r + 0.4, yb, 0], color=FAINT, stroke_width=2)
        self.remove(rim)
        self.play(FadeIn(base), FadeOut(circ), FadeOut(al), FadeOut(acl), dia.animate.move_to([x0 + r, yb - 0.42, 0]), run_time=0.4)
        unroll_group(self, r, x0, yb, RUSTL, 1.3)
        d2 = dia.copy().set_color(DIM).move_to([x0 + 3 * r, yb - 0.42, 0]); d3 = dia.copy().move_to([x0 + 5 * r, yb - 0.42, 0])
        bit = Line([x0 + 6 * r, yb - 0.42, 0], [x0 + TAU * r, yb - 0.42, 0], color=AMBER, stroke_width=7)
        three = lab("3 times across, and a little more", size=24, color=CREAM).next_to(base, DOWN, buff=0.6).align_to(base, LEFT)
        self.play(FadeIn(d2, shift=RIGHT * 0.2), FadeIn(d3, shift=RIGHT * 0.2), Create(bit), FadeIn(three), run_time=0.7)
        # digits
        self.until(WX("3", 448.7) - 0.2)
        self.play(FadeOut(objs), run_time=0.3)
        dg = M("3.14159", size=100, color=RUSTL).move_to([3.6, 0.9, 0])
        self.play(Write(dg), run_time=0.9)
        self.until(W("never", 450.4) - 0.2)
        more = M(r"26535\,89793\,23846\,26433\,83279\,50288\ldots", size=36, color=DIM).next_to(dg, DOWN, buff=0.35)
        nr = lab("never ends, never repeats", size=26, color=CREAM).next_to(more, DOWN, buff=0.3)
        self.play(Write(more), run_time=1.6, rate_func=linear)
        self.play(FadeIn(nr), run_time=0.4)
        self.until(W("pi", 454.3) - 0.3)
        pi_ = M(r"\pi", size=200, color=RUSTL).move_to([3.6, 0.6, 0])
        self.play(FadeOut(VGroup(more, nr, dv)), ReplacementTransform(dg, pi_), run_time=0.7)
        self.finish()


class Archimedes(Shot):
    """Archimedes traps pi between 96-sided polygons inside and outside; Aryabhata's 3.1416, 'approximate'."""
    NAME = "Archimedes"
    def construct(self):
        C, R = np.array([-2.8, -0.2, 0]), 2.5
        pi_s = M(r"\pi", size=90, color=RUSTL).to_corner(UL, buff=0.6)
        self.add(pi_s)
        circ = Circle(radius=R, color=CREAM, stroke_width=4).move_to(C)
        self.play(Create(circ), run_time=0.9)
        self.until(W("Archimedes", 458.8) - 0.1)
        nm = T("Archimedes", size=40, color=CREAM, font=HEAD).move_to([3.5, 2.6, 0])
        yr = lab("around 250 BC", size=26, color=DIM).next_to(nm, DOWN, buff=0.15)
        self.play(FadeIn(nm), FadeIn(yr), run_time=0.5)
        def polys(n):
            ins = RegularPolygon(n=n, start_angle=PI / 2, color=TEALL, stroke_width=3).scale(R).move_to(C)
            out = RegularPolygon(n=n, start_angle=PI / 2, color=AMBERL, stroke_width=3).scale(R / np.cos(PI / n)).move_to(C)
            return VGroup(ins, out)
        self.until(W("trapped", 462.7) - 0.4)
        cur = polys(6)
        self.play(Create(cur), run_time=0.6)
        for n in (12, 24, 48, 96):
            nxt = polys(n)
            self.play(ReplacementTransform(cur, nxt), run_time=0.75)
            cur = nxt
        self.until(W("96", 462.7) + 0.4)
        s96 = M(r"96\text{ sides}", size=56, color=CREAM).next_to(yr, DOWN, buff=0.5)
        self.play(Write(s96), run_time=0.6)
        self.until(W("inside", 466.5) - 0.2)
        il = lab("one just inside", size=28, color=TEALL).next_to(s96, DOWN, buff=0.35)
        self.play(FadeIn(il), run_time=0.3)
        self.until(W("outside", 466.5) - 0.2)
        ol = lab("one just outside", size=28, color=AMBERL).next_to(il, DOWN, buff=0.15)
        self.play(FadeIn(ol), run_time=0.3)
        self.until(W("between", 469.9) - 0.3)
        th0 = PI / 2 + PI / 96
        zoom = Square(side_length=0.5, color=CREAM, stroke_width=2).move_to(C + R * np.array([np.cos(th0), np.sin(th0), 0]))
        IC = np.array([3.5, -2.3, 0])
        ib = card_bg(4.6, 2.0).move_to(IC)
        mp = lambda s_, rr: IC + np.array([s_ * 1.9, (rr - R) * 600, 0])
        ss_ = np.linspace(-1, 1, 40)
        cir = VMobject(color=CREAM, stroke_width=4).set_points_smoothly([mp(x, R) for x in ss_])
        inn = VMobject(color=TEALL, stroke_width=4).set_points_smoothly([mp(x, R * np.cos(PI / 96) / np.cos(x * PI / 96)) for x in ss_])
        out = VMobject(color=AMBERL, stroke_width=4).set_points_smoothly([mp(x, R / np.cos(x * PI / 96)) for x in ss_])
        zl = lab("zoomed in", size=18, color=DIM).next_to(ib, UP, buff=0.08).align_to(ib, LEFT)
        con = DashedLine(zoom.get_right(), ib.get_left(), color=FAINT, stroke_width=1.5, dash_length=0.08)
        bt = lab("the circle is squeezed in between", size=28, color=CREAM).next_to(ol, DOWN, buff=0.3)
        self.play(Create(zoom), FadeIn(bt), run_time=0.4)
        self.play(Create(con), FadeIn(ib), FadeIn(zl), Create(out), Create(cir), Create(inn), run_time=0.9)
        # Aryabhata
        self.until(W("499", 472.5) - 0.3)
        self.play(FadeOut(VGroup(nm, yr, s96, il, ol, bt, zoom, ib, zl, con, out, cir, inn)), run_time=0.4)
        ar = T("Aryabhata", size=40, color=CREAM, font=HEAD).move_to([3.5, 2.6, 0])
        a_y = lab("India, around the year 499", size=26, color=DIM).next_to(ar, DOWN, buff=0.15)
        self.play(FadeIn(ar), FadeIn(a_y), run_time=0.5)
        self.until(W("about", 477.0) - 0.1)
        v = M(r"\pi \approx 3.1416", size=84, color=CREAM).next_to(a_y, DOWN, buff=0.55)
        v[0][0].set_color(RUSTL)
        self.play(Write(v), run_time=0.9)
        self.until(W("approximate", 479.8) - 0.2)
        ap = lab("“approximate”", size=36, color=AMBERL).next_to(v, DOWN, buff=0.4)
        self.play(FadeIn(ap, shift=UP * 0.1), run_time=0.4)
        self.until(W("digits", 481.6) - 0.1)
        st = M(r"3.14159\,26535\,89793\,23846\ldots", size=34, color=DIM).next_to(ap, DOWN, buff=0.4)
        self.play(Write(st), run_time=1.4, rate_func=linear)
        self.finish()


# ------------------------------------------------------------------ growth: area and volume

class Pizza(Shot):
    """One 18-inch pizza vs two 12-inch: the menu number is across; you eat the area; twice as wide = four times; big wins by ~1/8."""
    NAME = "Pizza"
    def construct(self):
        r12, r18 = 1.2, 1.8
        m1, m2, L = np.array([-5.0, 0.2, 0]), np.array([-2.3, 0.2, 0]), np.array([2.9, 0.2, 0])
        def pz(c, r):
            return VGroup(Circle(radius=r, stroke_color=AMBER, stroke_width=6).move_to(c),
                          Circle(radius=r * 0.86, stroke_color=AMBERL, stroke_width=1.5, stroke_opacity=0.5).move_to(c))
        p1, p2, p3 = pz(m1, r12), pz(m2, r12), pz(L, r18)
        t12 = lab("two medium pizzas", size=26, color=DIM).move_to([-3.65, -2.0, 0]); t18 = lab("one large pizza", size=26, color=DIM).move_to([2.9, -2.0, 0])
        self.play(FadeIn(VGroup(p1, p2, p3, t12, t18)), run_time=0.6)
        self.until(W("more", 504.9) - 0.3)
        self.play(p3[0].animate.set_stroke(AMBERL, width=8), run_time=0.4)
        self.until(W("across", 506.8) + 0.6)
        ds = VGroup(*[Line(c + LEFT * r, c + RIGHT * r, color=CREAM, stroke_width=3) for c, r in ((m1, r12), (m2, r12), (L, r18))])
        dl = VGroup(M(r"12\text{ in}", size=34).next_to(ds[0], UP, buff=0.1), M(r"12\text{ in}", size=34).next_to(ds[1], UP, buff=0.1),
                    M(r"18\text{ in}", size=40).next_to(ds[2], UP, buff=0.1))
        self.play(Create(ds), FadeIn(dl), run_time=0.7)
        self.until(W("area", 510.4) - 0.3)
        fills = VGroup(*[Circle(radius=r, stroke_width=0, fill_color=AMBER, fill_opacity=0.32).move_to(c) for c, r in ((m1, r12), (m2, r12), (L, r18))])
        arl = lab("what you eat is the area", size=30, color=AMBERL).to_edge(UP, buff=0.5)
        self.play(FadeIn(fills), FadeIn(arl), FadeOut(ds), FadeOut(dl), run_time=0.7)
        # twice as wide, four times as much
        self.until(W("twice", 515.9) - 0.6)
        pizzas = VGroup(p1, p2, p3, fills, t12, t18)
        self.play(pizzas.animate.set_opacity(0.0), FadeOut(arl), run_time=0.5)
        s = 1.2
        sq1 = Square(side_length=s, color=TEALL, stroke_width=3, fill_color=TEAL, fill_opacity=0.5).move_to([-4.0, -0.2, 0])
        sq2 = VGroup(*[Square(side_length=s, color=TEALL, stroke_width=3, fill_color=TEAL, fill_opacity=0.5).move_to([-0.4 + (i - 0.5) * s, -0.2 + (j - 0.5) * s, 0]) for i in range(2) for j in range(2)])
        c1 = Circle(radius=0.6, color=AMBERL, stroke_width=3, fill_color=AMBER, fill_opacity=0.4).move_to([2.4, -0.2, 0])
        c2 = Circle(radius=1.2, color=AMBERL, stroke_width=3, fill_color=AMBER, fill_opacity=0.4).move_to([5.0, -0.2, 0])
        self.play(FadeIn(sq1), FadeIn(c1), run_time=0.4)
        self.play(LaggedStart(*[FadeIn(q, shift=UP * 0.1) for q in sq2], lag_ratio=0.15), FadeIn(c2, scale=0.5), run_time=0.9)
        tw = lab("twice as wide", size=28, color=CREAM).move_to([1.2, 2.3, 0])
        fx = M(r"\times 4", size=72, color=AMBERL).next_to(tw, DOWN, buff=0.2)
        self.play(FadeIn(tw), Write(fx), run_time=0.6)
        # the math: two mediums only fill 8/9 of the large
        self.until(W("math", 519.6) - 0.2)
        self.play(FadeOut(VGroup(sq1, sq2, c1, c2, tw, fx)), run_time=0.4)
        P = np.array([0, -0.1, 0]); R = 2.4
        big = Circle(radius=R, color=AMBER, stroke_width=6).move_to(P)
        frac = (2 * 12 ** 2) / 18 ** 2
        mfill = Sector(radius=R, angle=0.001, start_angle=PI / 2, arc_center=P, fill_color=TEAL, fill_opacity=0.65, stroke_width=0)
        self.play(FadeIn(big), run_time=0.3)
        self.play(Transform(mfill, Sector(radius=R, angle=TAU * frac, start_angle=PI / 2, arc_center=P, fill_color=TEAL, fill_opacity=0.65, stroke_width=0)), run_time=1.4)
        left = Sector(radius=R, angle=TAU * (1 - frac), start_angle=PI / 2 + TAU * frac, arc_center=P, fill_color=AMBER, fill_opacity=0.85, stroke_width=0)
        ml = lab("both mediums together", size=26, color=TEALL).move_to([-4.4, -0.6, 0])
        bl = lab("extra in the large:\nabout an eighth more", size=26, color=AMBERL).move_to([4.6, 1.6, 0])
        self.play(FadeIn(left), FadeIn(ml), FadeIn(bl), run_time=0.6)
        self.finish()


def iso(x, y, z, s=0.55, o=(0, 0)):
    return np.array([o[0] + (x - z) * s * np.cos(PI / 6), o[1] + y * s + (x + z) * s * np.sin(PI / 6), 0])


def cube(x, y, z, s=0.55, o=(0, 0), cols=("#3b4a52", "#2c383f", "#4d5f68")):
    P = lambda a, b, c: iso(x + a, y + b, z + c, s, o)
    top = Polygon(P(0, 1, 0), P(1, 1, 0), P(1, 1, 1), P(0, 1, 1), stroke_color=CREAM, stroke_width=1.5, fill_color=cols[2], fill_opacity=1)
    left = Polygon(P(0, 0, 1), P(1, 0, 1), P(1, 1, 1), P(0, 1, 1), stroke_color=CREAM, stroke_width=1.5, fill_color=cols[0], fill_opacity=1)
    right = Polygon(P(1, 0, 0), P(1, 0, 1), P(1, 1, 1), P(1, 1, 0), stroke_color=CREAM, stroke_width=1.5, fill_color=cols[1], fill_opacity=1)
    return VGroup(top, left, right)


class Cube(Shot):
    """Double a box in every direction: surface x4, volume x8."""
    NAME = "Cube"
    def construct(self):
        s = 1.1
        small = cube(0, 0, 0, s, (-4.8, -1.2))
        self.play(FadeIn(small, shift=UP * 0.1), run_time=0.6)
        sl = lab("a box", size=28, color=DIM).next_to(small, DOWN, buff=0.3)
        self.play(FadeIn(sl), run_time=0.3)
        self.until(W("Double", 528.0) - 0.1)
        order = sorted([(x, y, z) for x in range(2) for y in range(2) for z in range(2)], key=lambda p: (p[1], -(p[0] + p[2]), -p[0]))
        big = VGroup(*[cube(x, y, z, s, (0.6, -1.8)) for x, y, z in order])
        self.play(LaggedStart(*[FadeIn(c, shift=DOWN * 0.15) for c in big], lag_ratio=0.15), run_time=1.6)
        dl = lab("twice as big in every direction", size=26, color=DIM).next_to(big, DOWN, buff=0.3)
        self.play(FadeIn(dl), run_time=0.3)
        self.until(W("surface", 530.5) - 0.1)
        sf = M(r"\text{surface} \times 4", size=56, color=TEALL).move_to([-3.2, 2.4, 0])
        faces = VGroup(*[c[1] for c in big if c is not None])
        self.play(Write(sf), *[c[1].animate.set_fill(TEAL, 1) for c in big], run_time=0.7)
        self.until(W("volume", 532.8) + 0.4)
        vf = M(r"\text{volume} \times 8", size=56, color=AMBERL).next_to(sf, DOWN, buff=0.35)
        self.play(Write(vf), *[c[0].animate.set_fill(AMBER, 1) for c in big], *[c[2].animate.set_fill("#8a6a2a", 1) for c in big], run_time=0.8)
        self.finish()


def ant(scale=1.0, col=CREAM):
    body = VGroup(Ellipse(width=0.5, height=0.36), Ellipse(width=0.42, height=0.32).shift(RIGHT * 0.45), Ellipse(width=0.75, height=0.45).shift(LEFT * 0.62))
    body.set_fill(col, 1).set_stroke(width=0)
    legs = VGroup()
    for i, x in enumerate((-0.15, 0.0, 0.15)):
        legs.add(VMobject(stroke_color=col, stroke_width=3).set_points_as_corners([[x, -0.1, 0], [x - 0.25 + i * 0.12, -0.35, 0], [x - 0.35 + i * 0.25, -0.62, 0]]))
    ants = VGroup(Line([0.55, 0.1, 0], [0.85, 0.45, 0], color=col, stroke_width=2.5), Line([0.5, 0.12, 0], [0.7, 0.5, 0], color=col, stroke_width=2.5))
    return VGroup(legs, body, ants).scale(scale)


class AntScale(Shot):
    """Weight goes with volume (x1000), leg strength with thickness = area (x100): the giant ant can't stand."""
    NAME = "AntScale"
    def construct(self):
        base_y = -2.6
        k = ValueTracker(1.0)
        a = always_redraw(lambda: ant(0.35 * (0.6 + 0.4 * k.get_value()) * 0.55, CREAM).move_to([-3.8, base_y + 0.12 * (0.6 + 0.4 * k.get_value()), 0], aligned_edge=DOWN))
        ground = Line([-6.5, base_y, 0], [6.5, base_y, 0], color=FAINT, stroke_width=2)
        self.add(ground, a)
        bx, H = [1.6, 3.6], 4.8
        def bar(i, v, col):
            hgt = max(0.02, H * v / 1000.0)
            return Rectangle(width=1.2, height=hgt, stroke_width=0, fill_color=col, fill_opacity=0.9).move_to([bx[i], base_y + hgt / 2, 0])
        wbar = always_redraw(lambda: bar(0, k.get_value() ** 3, RUSTL))
        sbar = always_redraw(lambda: bar(1, k.get_value() ** 2, TEALL))
        wl = lab("weight\n(volume)", size=24, color=RUSTL).next_to([bx[0], base_y, 0], DOWN, buff=0.2)
        self.play(FadeIn(wl), run_time=0.4)
        self.add(wbar)
        self.until(W("strength", 548.8) - 0.1)
        sl = lab("leg strength\n(thickness)", size=24, color=TEALL).next_to([bx[1], base_y, 0], DOWN, buff=0.2)
        self.play(FadeIn(sl), run_time=0.4)
        self.add(sbar)
        self.until(W("area", 551.9) - 0.2)
        cs = VGroup(Circle(radius=0.35, color=TEALL, stroke_width=3, fill_color=TEAL, fill_opacity=0.5)).move_to([5.5, 1.6, 0])
        csl = lab("thickness is an area", size=24, color=TEALL).next_to(cs, DOWN, buff=0.15)
        self.play(FadeIn(cs), FadeIn(csl), run_time=0.5)
        self.until(W("ten", 553.9) - 0.1)
        ten = M(r"\times 10 \text{ bigger}", size=48, color=CREAM).move_to([-3.6, 2.6, 0])
        self.play(Write(ten), run_time=0.5)
        self.play(k.animate.set_value(10.0), run_time=2.2, rate_func=smooth)
        self.until(W("thousand", 556.7) - 0.2)
        l1000 = M(r"\times 1000", size=48, color=RUSTL).next_to(wbar, UP, buff=0.15)
        self.play(Write(l1000), run_time=0.5)
        self.until(W("hundred", 559.8) - 0.2)
        l100 = M(r"\times 100", size=48, color=TEALL).next_to(sbar, UP, buff=0.15)
        self.play(Write(l100), run_time=0.5)
        self.finish()


class Hexagons(Shot):
    """Equal-area cells: triangles, squares, hexagons; hexagons use the least wall (wax). Proven 1999, Thomas Hales."""
    NAME = "Hexagons"
    def construct(self):
        A = 0.34
        cs = [-4.4, 0.0, 4.4]; cy = 0.6; Wd, Hd = 3.4, 2.5
        frames = VGroup(*[card_bg(Wd + 0.4, Hd + 0.4).move_to([x, cy, 0]) for x in cs])
        def inside(p, c): return abs(p[0] - c) < Wd / 2 - 0.05 and abs(p[1] - cy) < Hd / 2 - 0.05
        cells = [VGroup(), VGroup(), VGroup()]
        a = np.sqrt(4 * A / np.sqrt(3)); hgt = a * np.sqrt(3) / 2
        for j in range(-6, 7):
            for i in range(-8, 9):
                x0 = cs[0] + i * a / 2; y0 = cy + j * hgt
                up = (i + j) % 2 == 0
                pts = [np.array([x0 - a / 2, y0 - hgt / 2, 0]), np.array([x0 + a / 2, y0 - hgt / 2, 0]), np.array([x0, y0 + hgt / 2, 0])] if up else \
                      [np.array([x0 - a / 2, y0 + hgt / 2, 0]), np.array([x0 + a / 2, y0 + hgt / 2, 0]), np.array([x0, y0 - hgt / 2, 0])]
                if all(inside(p, cs[0]) for p in pts): cells[0].add(Polygon(*pts, stroke_color=AMBERL, stroke_width=2, fill_color=AMBER, fill_opacity=0.2))
        s = np.sqrt(A)
        for j in range(-6, 7):
            for i in range(-6, 7):
                c = np.array([cs[1] + i * s, cy + j * s, 0])
                pts = [c + np.array([dx, dy, 0]) * s / 2 for dx, dy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
                if all(inside(p, cs[1]) for p in pts): cells[1].add(Polygon(*pts, stroke_color=AMBERL, stroke_width=2, fill_color=AMBER, fill_opacity=0.2))
        sh = np.sqrt(2 * A / (3 * np.sqrt(3)))
        for j in range(-6, 7):
            for i in range(-6, 7):
                c = np.array([cs[2] + i * 1.5 * sh, cy + j * np.sqrt(3) * sh + (np.sqrt(3) / 2 * sh if i % 2 else 0), 0])
                pts = [c + sh * np.array([np.cos(t), np.sin(t), 0]) for t in np.arange(0, TAU, TAU / 6)]
                if all(inside(p, cs[2]) for p in pts): cells[2].add(Polygon(*pts, stroke_color=AMBERL, stroke_width=2, fill_color=AMBER, fill_opacity=0.2))
        names = ["triangles", "squares", "hexagons"]
        nl = VGroup(*[lab(n, size=26, color=CREAM).next_to(frames[i], UP, buff=0.15) for i, n in enumerate(names)])
        self.play(FadeIn(frames), FadeIn(nl), run_time=0.5)
        self.play(*[LaggedStart(*[FadeIn(c) for c in cells[i]], lag_ratio=0.02) for i in range(3)], run_time=1.4)
        self.until(W("split", 590.9) - 0.2)
        eq = lab("every cell the same size", size=26, color=DIM).to_edge(UP, buff=0.3)
        self.play(FadeIn(eq), run_time=0.4)
        self.until(W("least", 590.9) - 0.4)
        wall = [1.5 * a, 2 * s, 3 * sh]
        bars = VGroup(*[Rectangle(width=0.9, height=wall[i] * 1.0, stroke_width=0, fill_color=[RUSTL, DIM, TEALL][i], fill_opacity=0.9)
                        .move_to([cs[i], -2.05 + wall[i] * 0.5 - 0.55, 0]) for i in range(3)])
        bl = lab("wall needed per cell", size=24, color=DIM).move_to([0, -3.35, 0])
        self.play(LaggedStart(*[GrowFromEdge(b, DOWN) for b in bars], lag_ratio=0.2), FadeIn(bl), run_time=1.0)
        lw = lab("least wall", size=26, color=TEALL).next_to(bars[2], UP, buff=0.12)
        self.play(FadeIn(lw), cells[2].animate.set_stroke(TEALL), frames[2].animate.set_stroke(TEALL, width=3), run_time=0.5)
        self.until(W("wax", 594.2) - 0.2)
        wx = lab("for bees, wall = wax", size=26, color=AMBERL).move_to([4.4, -3.35, 0])
        self.play(FadeIn(wx), run_time=0.4)
        self.until(W("1999", 599.7) - 0.3)
        pv = lab("proven in 1999 by Thomas Hales", size=30, color=CREAM).move_to(eq)
        self.play(FadeTransform(eq, pv), run_time=0.5)
        self.finish()


# ------------------------------------------------------------------ Eratosthenes

class EraRays(Shot):
    """Parallel sun rays: flat earth = same shadows; round earth = different. 7.2 deg = 1/50 circle; 5,000 x 50 = 250,000 stadia."""
    NAME = "EraRays"
    def construct(self):
        yb = -2.2; h = 1.0
        xa, xs = -2.6, 2.6
        ground = Line([-7, yb, 0], [7, yb, 0], color=MOSSL, stroke_width=4)
        sa = Line([xa, yb, 0], [xa, yb + h, 0], color=CREAM, stroke_width=5); ss = Line([xs, yb, 0], [xs, yb + h, 0], color=CREAM, stroke_width=5)
        la = lab("Alexandria", size=24, color=CREAM).next_to([xa, yb, 0], DOWN, buff=0.25); ls = lab("Syene", size=24, color=CREAM).next_to([xs, yb, 0], DOWN, buff=0.25)
        self.play(Create(ground), FadeIn(VGroup(sa, ss, la, ls)), run_time=0.8)
        qa = lab("a shadow here...", size=24, color=AMBERL).move_to([xa, 0.2, 0]); qs = lab("...but none here?", size=24, color=AMBERL).move_to([xs, 0.2, 0])
        self.play(FadeIn(qa), FadeIn(qs), run_time=0.5)
        self.until(W("rays", 657.3) - 0.5)
        rays = VGroup(*[DashedLine([x, 3.8, 0], [x, yb + 0.02, 0], color=AMBER, stroke_width=1.6, dash_length=0.12, stroke_opacity=0.6) for x in np.arange(-6.5, 6.6, 0.65)])
        sun = lab("sunlight: almost perfectly parallel", size=24, color=AMBER).to_edge(UP, buff=0.25)
        self.play(FadeOut(VGroup(qa, qs)), LaggedStart(*[Create(r) for r in rays], lag_ratio=0.03), FadeIn(sun), run_time=1.2)
        self.until(W("flat", 660.7) - 0.1)
        fl = lab("flat earth: every stick casts the same shadow", size=26, color=CREAM).move_to([0, 0.9, 0])
        self.play(FadeIn(fl), run_time=0.4)
        # curve the ground
        self.until(W("round", 664.4) - 0.1)
        Cc = np.array([0, -11.0, 0]); Rr = 8.8
        tA, tS = PI / 2 + 0.36, PI / 2       # Alexandria tilted (angle exaggerated), Syene at the top
        dA, dS = np.array([np.cos(tA), np.sin(tA), 0]), np.array([np.cos(tS), np.sin(tS), 0])
        earth = Circle(radius=Rr, color=MOSSL, stroke_width=4).move_to(Cc)
        pA, pS = Cc + Rr * dA, Cc + Rr * dS
        sa2 = Line(pA, pA + h * dA, color=CREAM, stroke_width=5); ss2 = Line(pS, pS + h * dS, color=CREAM, stroke_width=5)
        la2 = lab("Alexandria", size=24, color=CREAM).move_to(pA + dA * -0.45 + LEFT * 0.2); ls2 = lab("Syene", size=24, color=CREAM).move_to(pS - dS * 0.45)
        rays2 = VGroup(*[DashedLine([x, 3.8, 0], [x, Cc[1] + np.sqrt(max(Rr ** 2 - x ** 2, 0)), 0], color=AMBER, stroke_width=1.6, dash_length=0.12, stroke_opacity=0.6) for x in np.arange(-6.5, 6.6, 0.65)])
        self.play(FadeOut(fl), Transform(ground, earth), Transform(sa, sa2), Transform(ss, ss2), Transform(la, la2), Transform(ls, ls2), Transform(rays, rays2), run_time=1.6)
        tan = np.array([-dA[1], dA[0], 0])         # along the ground, pointing away from Syene
        top = pA + h * dA
        hit = top + DOWN * (h * 1.02)
        shadow = Line(pA, pA + tan * h * np.tan(0.36) * 1.0, color="#0b0e12", stroke_width=9)
        ray_hit = DashedLine(top + UP * 0.6, pA + tan * h * np.tan(0.36), color=AMBERL, stroke_width=2.5, dash_length=0.1)
        rl = lab("round earth: the ground tilts, shadows change", size=26, color=CREAM).move_to([2.2, 0.9, 0])
        self.play(Create(ray_hit), Create(shadow), FadeIn(rl), run_time=0.8)
        # the angle
        self.until(W("angle", 669.7) + 0.4)
        am = Arc(radius=0.55, start_angle=ang(dA), angle=PI / 2 - ang(dA), arc_center=top, color=AMBERL, stroke_width=3)
        am = Arc(radius=0.55, start_angle=PI / 2 + 0.0, angle=0.36, arc_center=top, color=AMBERL, stroke_width=3)
        self.play(Create(am), FadeOut(rl), run_time=0.5)
        self.until(WX("7", 672.6) - 0.1)
        a72 = M(r"7.2^\circ", size=56, color=AMBERL).next_to(top, UL, buff=0.3)
        nts = lab("(angle drawn bigger than life)", size=20, color=DIM).next_to(a72, UP, buff=0.1)
        self.play(Write(a72), FadeIn(nts), run_time=0.6)
        # zoom out: the same angle at the centre
        self.until(W("degrees", 676.0) - 0.3)
        self.play(FadeOut(VGroup(rays, sun, la, ls, ray_hit, nts, a72, am)), run_time=0.4)
        world = VGroup(ground, sa, ss, shadow)
        target_c = np.array([-2.6, -0.6, 0]); k = 0.3
        self.play(world.animate.scale(k, about_point=Cc).shift(target_c - Cc), run_time=1.3)
        C2 = target_c; R2 = Rr * k
        pA2, pS2 = C2 + R2 * dA, C2 + R2 * dS
        cl = VGroup(DashedLine(C2, pA2 + dA * h * k, color=CREAM, stroke_width=2, dash_length=0.08), DashedLine(C2, pS2 + dS * h * k, color=CREAM, stroke_width=2, dash_length=0.08))
        ca = Sector(radius=0.9, angle=0.36, start_angle=PI / 2, arc_center=C2, fill_color=AMBER, fill_opacity=0.6, stroke_width=0)
        self.play(Create(cl), FadeIn(ca), run_time=0.7)
        f50 = M(r"7.2^\circ = \tfrac{1}{50}\text{ of a circle}", size=48, color=CREAM).move_to([3.4, 2.4, 0])
        self.play(Write(f50), run_time=0.8)
        self.until(W("distance", 679.4) - 0.1)
        arcAS = Arc(radius=R2, start_angle=PI / 2, angle=0.36, arc_center=C2, color=AMBERL, stroke_width=8)
        dd = lab("so this distance is 1/50\nof the way around the Earth", size=26, color=AMBERL).next_to(f50, DOWN, buff=0.35)
        self.play(Create(arcAS), FadeIn(dd), run_time=0.8)
        self.until(WX("5", 691.0) - 0.1)
        s5 = M(r"5{,}000\text{ stadia}", size=36, color=AMBERL).move_to(C2 + (R2 + 0.6) * np.array([np.cos(PI / 2 + 0.18), np.sin(PI / 2 + 0.18), 0]))
        self.play(Write(s5), FadeOut(dd), run_time=0.6)
        self.until(W("50", 693.6) - 0.1)
        mul = M(r"50 \times 5{,}000", size=60, color=CREAM).next_to(f50, DOWN, buff=0.6)
        self.play(Write(mul), run_time=0.7)
        self.until(WX("250", 696.0) - 0.2)
        res = M(r"= 250{,}000\text{ stadia}", size=56, color=AMBERL).next_to(mul, DOWN, buff=0.3)
        ar = lab("around the Earth", size=26, color=DIM).next_to(res, DOWN, buff=0.15)
        self.play(Write(res), FadeIn(ar), run_time=0.8)
        self.until(W("percent", 702.4) + 0.4)
        fp = lab("within a few percent of the real value", size=26, color=CREAM).next_to(ar, DOWN, buff=0.45)
        self.play(FadeIn(fp), run_time=0.4)
        self.until(WX("40", 706.9) - 0.2)
        km = M(r"\approx 40{,}000\text{ km}", size=56, color=MOSSL).next_to(fp, DOWN, buff=0.25)
        self.play(Write(km), ground.animate.set_stroke(MOSSL, width=6), run_time=0.7)
        self.finish()


# ------------------------------------------------------------------ the troublesome rule

class Parallel(Shot):
    """Parallel lines; Euclid's rule (one line through a point never meets); longer and less sure; 2,000 years of failed proofs."""
    NAME = "Parallel"
    def construct(self):
        b5 = brick(1.6, 0.6, "#4a2a22", RUSTL).move_to(UP * 0.4)
        ic = VGroup(Line(LEFT * 0.4, RIGHT * 0.4, color=RUSTL, stroke_width=3).shift(UP * 0.09), Line(LEFT * 0.4, RIGHT * 0.4, color=RUSTL, stroke_width=3).shift(DOWN * 0.09)).move_to(b5[1])
        self.play(FadeIn(VGroup(b5, ic), shift=UP * 0.2), run_time=0.6)
        self.until(W("parallel", 722.1) - 0.1)
        self.play(FadeOut(VGroup(b5, ic)), run_time=0.3)
        l1 = Line([-6.6, 0.6, 0], [6.6, 0.6, 0], color=CREAM, stroke_width=4); l2 = Line([-6.6, -0.6, 0], [6.6, -0.6, 0], color=CREAM, stroke_width=4)
        self.play(Create(l1), Create(l2), run_time=0.9)
        pl = T("parallel lines", size=44, color=CREAM, font=HEAD).move_to(UP * 2.3)
        self.play(FadeIn(pl), run_time=0.4)
        self.until(W("never", 724.3) - 0.1)
        nm = lab("side by side forever, never meeting", size=28, color=AMBERL).move_to(DOWN * 1.8)
        self.play(FadeIn(nm), run_time=0.4)
        # Euclid's rule
        self.until(W("Pick", 732.5) - 0.2)
        self.play(FadeOut(VGroup(l1, l2, pl, nm)), run_time=0.4)
        Lb = Line([-6.6, -1.8, 0], [6.6, -1.8, 0], color=CREAM, stroke_width=4)
        P = np.array([-1.5, 0.8, 0])
        dP = Dot(P, radius=0.1, color=AMBERL)
        self.play(Create(Lb), FadeIn(dP, scale=0.4), run_time=0.6)
        self.until(W("exactly", 734.0) - 0.4)
        others = VGroup()
        for t in (0.55, 0.3, -0.4, -0.25):
            d = np.array([np.cos(t), np.sin(t), 0])
            s = (-1.8 - P[1]) / d[1]
            X = P + s * d
            others.add(VGroup(Line(P - d * 3.5, X if s > 0 else P + d * 3.5, color=FAINT, stroke_width=2).put_start_and_end_on(P - d * 2.5 * np.sign(s), X), Dot(X, radius=0.06, color=RUSTL)))
        self.play(LaggedStart(*[Create(o) for o in others], lag_ratio=0.2), run_time=1.2)
        one = Line(P + LEFT * 6, P + RIGHT * 8, color=TEALL, stroke_width=4)
        ol = lab("exactly one line that never meets it", size=28, color=TEALL).move_to([1.6, 2.2, 0])
        self.play(Create(one), FadeIn(ol), others.animate.set_opacity(0.3), run_time=1.0)
        # different from the other rules
        self.until(W("different", 738.4) + 0.4)
        diag = VGroup(Lb, dP, others, one, ol)
        self.play(diag.animate.scale(0.5).move_to([-4.0, 1.6, 0]), run_time=0.7)
        r1 = card_bg(3.6, 1.3).move_to([-4.6, -1.7, 0]); t1 = lab("Rule 1: a line between\nany two points", size=22, color=CREAM).move_to(r1)
        r2 = card_bg(3.6, 1.3).move_to([-0.8, -1.7, 0]); t2 = lab("Rule 3: a circle around\nany point", size=22, color=CREAM).move_to(r2)
        r5 = card_bg(5.0, 3.6, RUSTL).move_to([3.9, 0.5, 0])
        t5 = lab("Rule 5: if a line crosses two lines\nand the inner angles on one side\nadd up to less than two right angles,\nthose two lines, extended forever,\nwill meet on that side.", size=20, color=RUSTL).move_to(r5)
        self.play(FadeIn(VGroup(r1, t1, r2, t2)), run_time=0.5)
        self.play(FadeIn(VGroup(r5, t5)), run_time=0.6)
        lt = lab("longer, and less certain", size=26, color=RUSTL).next_to(r5, DOWN, buff=0.2)
        self.play(FadeIn(lt), run_time=0.4)
        self.until(WX("2", 744.2) - 0.1)
        arrs = VGroup(CurvedArrow(r1.get_top() + UP * 0.05, r5.get_left() + DOWN * 0.6, angle=-0.6, color=DIM, stroke_width=2.5),
                      CurvedArrow(r2.get_top() + UP * 0.05, r5.get_left() + DOWN * 1.1, angle=-0.4, color=DIM, stroke_width=2.5))
        yrs = lab("2,000 years of trying to prove it", size=26, color=CREAM).move_to([-1.6, -3.1, 0])
        self.play(Create(arrs), FadeIn(yrs), run_time=0.8)
        self.until(W("failed", 748.7) - 0.2)
        xx = VGroup(Line(UL * 0.35, DR * 0.35, color=RUSTL, stroke_width=6), Line(UR * 0.35, DL * 0.35, color=RUSTL, stroke_width=6)).move_to(r5.get_left() + DOWN * 0.85 + LEFT * 0.5)
        self.play(Create(xx), arrs.animate.set_opacity(0.3), run_time=0.5)
        self.finish()


def geodesic(c, R, a, b, col=CREAM, w=4):
    h, m = (b - a) / 2, (a + b) / 2
    cc = c + R / np.cos(h) * np.array([np.cos(m), np.sin(m), 0]); rr = R * np.tan(abs(h))
    A, B = c + R * np.array([np.cos(a), np.sin(a), 0]), c + R * np.array([np.cos(b), np.sin(b), 0])
    sa, sb = ang(A - cc), ang(B - cc)
    d = (sb - sa + PI) % TAU - PI
    return Arc(radius=rr, start_angle=sa, angle=d, arc_center=cc, color=col, stroke_width=w)


class WhatIf(Shot):
    """A geometry where the rule fails: in this disk-world many lines through the point never meet the line."""
    NAME = "WhatIf"
    def construct(self):
        C, R = np.array([-2.6, -0.3, 0]), 2.9
        q = T("What if the rule isn't always true?", size=34, color=CREAM, font=HEAD).move_to([2.6, 2.9, 0])
        if q.width > 7.6: q.width = 7.6
        self.play(FadeIn(q), run_time=0.5)
        self.until(W("built", 777.8) - 0.1)
        disk = Circle(radius=R, color=DIM, stroke_width=3, fill_color="#121a20", fill_opacity=1).move_to(C)
        L = geodesic(C, R, np.radians(205), np.radians(335), CREAM, 4)
        P = Dot(C, radius=0.1, color=AMBERL)
        self.play(FadeIn(disk), run_time=0.5)
        self.play(Create(L), FadeIn(P), run_time=0.8)
        self.until(W("found", 780.7) - 0.2)
        fan = VGroup(*[Line(C + R * np.array([np.cos(t), np.sin(t), 0]), C - R * np.array([np.cos(t), np.sin(t), 0]), color=TEALL, stroke_width=3) for t in np.radians([-18, -9, 0, 9, 18])])
        self.play(LaggedStart(*[Create(f) for f in fan], lag_ratio=0.15), run_time=1.2)
        fl = lab("many lines through the point\nthat never meet the line", size=28, color=TEALL).move_to([3.0, 0.9, 0])
        nw = lab("a whole new geometry\nthat makes perfect sense", size=28, color=CREAM).next_to(fl, DOWN, buff=0.45)
        self.play(FadeIn(fl), run_time=0.4)
        self.play(FadeIn(nw), run_time=0.4)
        self.until(W("nothing", 785.2) - 0.3)
        qt = lab("“Out of nothing I have created\na strange new world.”", size=30, color=AMBERL).move_to([3.0, -1.9, 0])
        who = lab("János Bolyai, letter to his father, 1823", size=20, color=DIM).next_to(qt, DOWN, buff=0.15)
        self.play(FadeIn(qt, shift=UP * 0.1), FadeIn(who), run_time=0.6)
        self.finish()


# ------------------------------------------------------------------ curved space

class Shot3D(ThreeDScene):
    NAME = ""
    def setup(self): self.t0, self.t1 = MSHOTS[self.NAME]
    def now(self): return self.renderer.time
    def rel(self, t_abs): return t_abs - self.t0
    def until(self, t_abs):
        dt = (t_abs - self.t0) - self.renderer.time
        if dt > 1 / 30: self.wait(dt)
    def finish(self): self.until(self.t1 + 1.5)


def sph(lat, lon, r=2.5):
    return r * np.array([np.cos(lat) * np.cos(lon), np.cos(lat) * np.sin(lon), np.sin(lat)])


class GlobeTri(Shot3D):
    """Walk pole -> equator -> quarter way round -> pole: three right angles, 90+90+90 = 270 (flat paper: 180)."""
    NAME = "GlobeTri"
    def construct(self):
        R = 2.5
        self.set_camera_orientation(phi=64 * DEGREES, theta=42 * DEGREES, zoom=1.05)
        globe = Sphere(radius=R, resolution=(28, 56)).set_fill("#1f2f36", opacity=1).set_stroke(FAINT, width=0.4, opacity=0.35)
        grat = VGroup(*[ParametricFunction(lambda t, la=la: sph(la, t, R * 1.003), t_range=[0, TAU], color=FAINT, stroke_width=1, stroke_opacity=0.5) for la in np.radians([-60, -30, 30, 60])],
                      *[ParametricFunction(lambda t, lo=lo: sph(t, lo, R * 1.003), t_range=[-PI / 2, PI / 2], color=FAINT, stroke_width=1, stroke_opacity=0.5) for lo in np.radians(range(0, 360, 30))])
        eqtr = ParametricFunction(lambda t: sph(0, t, R * 1.004), t_range=[0, TAU], color=MOSSL, stroke_width=2, stroke_opacity=0.8)
        self.play(FadeIn(globe), FadeIn(grat), FadeIn(eqtr), run_time=1.2)
        self.begin_ambient_camera_rotation(rate=0.008)
        title = T("the Earth", size=40, color=CREAM, font=HEAD).to_corner(UL, buff=0.6)
        self.add_fixed_in_frame_mobjects(title); self.play(FadeIn(title), run_time=0.5)
        rr = R * 1.012
        seg1 = ParametricFunction(lambda t: sph(PI / 2 * (1 - t), 0, rr), t_range=[0, 1], color=AMBERL, stroke_width=6)
        seg2 = ParametricFunction(lambda t: sph(0, PI / 2 * t, rr), t_range=[0, 1], color=AMBERL, stroke_width=6)
        seg3 = ParametricFunction(lambda t: sph(PI / 2 * t, PI / 2, rr), t_range=[0, 1], color=AMBERL, stroke_width=6)
        self.until(W("North", 805.4) - 0.1)
        pole = Dot3D(sph(PI / 2, 0, rr), radius=0.07, color=CREAM)
        self.play(FadeIn(pole), run_time=0.3)
        self.until(W("walk", 805.4) - 0.1)
        self.play(Create(seg1), run_time=2.0, rate_func=linear)
        self.until(W("quarter", 809.0) - 0.4)
        self.play(Create(seg2), run_time=2.2, rate_func=linear)
        self.until(W("walk", 815.0) - 0.1)
        self.play(Create(seg3), run_time=2.2, rate_func=linear)
        self.until(W("triangle", 818.8) - 0.2)
        tl = lab("a triangle", size=34, color=AMBERL).next_to(title, DOWN, buff=0.25).align_to(title, LEFT)
        self.add_fixed_in_frame_mobjects(tl); self.play(FadeIn(tl), run_time=0.4)
        def mark(p_lat, p_lon, d1, d2, s=0.32):
            p = sph(p_lat, p_lon, rr)
            pts = [p + d1 * s, p + (d1 + d2) * s, p + d2 * s]
            pts = [q / np.linalg.norm(q) * rr for q in pts]
            return VMobject(color=CREAM, stroke_width=4).set_points_as_corners(pts)
        N, E0, E90 = np.array([0, 0, 1.0]), np.array([0, 1.0, 0]), np.array([-1.0, 0, 0])
        m1 = mark(0, 0, N, E0)                       # corner at (0, 0): north and east
        m2 = mark(0, PI / 2, N, E90)                 # corner at (0, 90): north and west-along-equator
        m3 = mark(PI / 2, 0, np.array([1.0, 0, 0]), np.array([0, 1.0, 0]))   # at the pole
        self.until(W("equator", 822.1) + 0.2)
        self.play(Create(m1), Create(m2), run_time=0.7)
        self.until(W("pole", 824.8) + 0.8)
        self.play(Create(m3), run_time=0.6)
        self.until(W("90", 829.0) - 0.1)
        s = M(r"90^\circ + 90^\circ + 90^\circ", size=60, color=CREAM).to_corner(UR, buff=0.6)
        self.add_fixed_in_frame_mobjects(s); self.play(Write(s), run_time=1.2)
        self.until(W("270", 831.9) - 0.1)
        r270 = M(r"= 270^\circ", size=80, color=AMBERL).next_to(s, DOWN, buff=0.3).align_to(s, RIGHT)
        self.add_fixed_in_frame_mobjects(r270); self.play(Write(r270), run_time=0.7)
        self.until(W("flat", 835.7) - 0.2)
        f180 = lab("on flat paper: always 180°", size=28, color=DIM).next_to(r270, DOWN, buff=0.45).align_to(s, RIGHT)
        self.add_fixed_in_frame_mobjects(f180); self.play(FadeIn(f180), run_time=0.4)
        self.until(W("curved", 839.4) - 0.2)
        cv = lab("on a curved surface: not 180°", size=28, color=AMBERL).next_to(f180, DOWN, buff=0.15).align_to(s, RIGHT)
        self.add_fixed_in_frame_mobjects(cv); self.play(FadeIn(cv), run_time=0.4)
        self.until(W("rules", 841.8) - 0.1)
        ru = lab("the rules depend on the shape of the space", size=28, color=CREAM).to_edge(DOWN, buff=0.5)
        self.add_fixed_in_frame_mobjects(ru); self.play(FadeIn(ru), run_time=0.5)
        self.finish()


def gc_points(lat1, lon1, lat2, lon2, n=80):
    a, b = sph(np.radians(lat1), np.radians(lon1), 1), sph(np.radians(lat2), np.radians(lon2), 1)
    om = np.arccos(np.clip(np.dot(a, b), -1, 1))
    return [(np.sin((1 - t) * om) * a + np.sin(t * om) * b) / np.sin(om) for t in np.linspace(0, 1, n)]


class Flight(Shot):
    """A long flight: curved on a flat map, the shortest path on the round Earth."""
    NAME = "Flight"
    def construct(self):
        pts = gc_points(40.6, -73.8, 51.5, -0.5)
        cL = np.array([-3.4, -0.2, 0]); W_, H_ = 6.0, 3.6
        def mp(v):
            lat, lon = np.degrees(np.arcsin(v[2])), np.degrees(np.arctan2(v[1], v[0]))
            return cL + np.array([(lon + 100) / 120 * W_ - W_ / 2, (lat - 15) / 60 * H_ - H_ / 2, 0])
        box = Rectangle(width=W_, height=H_, stroke_color=DIM, stroke_width=2, fill_color="#121a20", fill_opacity=1).move_to(cL)
        grid = VGroup(*[Line(cL + np.array([-W_ / 2, y, 0]), cL + np.array([W_ / 2, y, 0]), color=FAINT, stroke_width=1) for y in np.linspace(-H_ / 2, H_ / 2, 7)[1:-1]],
                      *[Line(cL + np.array([x, -H_ / 2, 0]), cL + np.array([x, H_ / 2, 0]), color=FAINT, stroke_width=1) for x in np.linspace(-W_ / 2, W_ / 2, 9)[1:-1]])
        route = VMobject(color=AMBERL, stroke_width=5).set_points_smoothly([mp(v) for v in pts])
        ends = VGroup(Dot(mp(pts[0]), radius=0.09, color=CREAM), Dot(mp(pts[-1]), radius=0.09, color=CREAM))
        t1 = lab("on a flat map: looks curved", size=26, color=AMBERL).next_to(box, DOWN, buff=0.25)
        self.play(FadeIn(box), FadeIn(grid), FadeIn(ends), run_time=0.5)
        self.play(Create(route), FadeIn(t1), run_time=1.4)
        self.until(W("round", 849.5) - 0.2)
        cR, R = np.array([3.6, -0.2, 0]), 1.9
        mid = unit(pts[0] + pts[-1])
        z = mid; x = unit(np.cross([0, 0, 1], z)); y = np.cross(z, x)
        proj = lambda v: cR + R * np.array([np.dot(v, x), np.dot(v, y), 0])
        globe = Circle(radius=R, color=DIM, stroke_width=3, fill_color="#1f2f36", fill_opacity=1).move_to(cR)
        lats = VGroup(*[VMobject(color=FAINT, stroke_width=1).set_points_smoothly([proj(sph(np.radians(la), t, 1)) for t in np.linspace(0, TAU, 60) if np.dot(sph(np.radians(la), t, 1), z) > 0.02])
                        for la in (20, 40, 60) if True])
        gr = VMobject(color=AMBERL, stroke_width=5).set_points_smoothly([proj(v) for v in pts])
        ge = VGroup(Dot(proj(pts[0]), radius=0.09, color=CREAM), Dot(proj(pts[-1]), radius=0.09, color=CREAM))
        t2 = lab("on the round Earth: the shortest path", size=26, color=TEALL).next_to(globe, DOWN, buff=0.25)
        self.play(FadeIn(globe), FadeIn(lats), FadeIn(ge), run_time=0.5)
        self.play(Create(gr), FadeIn(t2), run_time=1.2)
        self.until(W("bends", 853.7) + 0.2)
        mb = T("it's the flat map that bends", size=36, color=CREAM, font=HEAD).to_edge(UP, buff=0.5)
        self.play(FadeIn(mb, shift=DOWN * 0.1), run_time=0.5)
        self.finish()


class Spacetime(Shot):
    """1915: Einstein. Space and time bend around heavy objects; mass shapes the geometry of the universe."""
    NAME = "Spacetime"
    def construct(self):
        cx, cy = 2.2, -0.6
        D = ValueTracker(0.0)
        def P(x, z):
            depth = D.get_value() * 1.9 * np.exp(-((x) ** 2 + (z - 3.0) ** 2) / 2.4)
            s = 1.0 - 0.07 * z
            return np.array([cx + x * s * 1.05, cy - 1.8 + z * 0.62 - depth, 0])
        def grid():
            g = VGroup()
            for z in np.linspace(0, 6, 13):
                g.add(VMobject(color=TEALL, stroke_width=1.6, stroke_opacity=0.7).set_points_smoothly([P(x, z) for x in np.linspace(-4, 4, 40)]))
            for x in np.linspace(-4, 4, 17):
                g.add(VMobject(color=TEALL, stroke_width=1.6, stroke_opacity=0.7).set_points_smoothly([P(x, z) for z in np.linspace(0, 6, 30)]))
            return g
        gm = always_redraw(grid)
        self.play(FadeIn(gm), run_time=0.8)
        yr = M("1915", size=72, color=CREAM).move_to([-4.6, 2.6, 0]).set_opacity(0)
        self.until(W("bend", 864.8) - 0.4)
        mass = always_redraw(lambda: Circle(radius=0.42 + 0.0 * D.get_value(), stroke_width=0, fill_color=AMBER, fill_opacity=1).move_to(P(0, 3.0) + UP * 0.42))
        self.play(FadeIn(mass), D.animate.set_value(1.0), run_time=2.0)
        bl = lab("space and time bend\naround heavy objects", size=28, color=CREAM).move_to([2.2, 2.6, 0])
        self.play(FadeIn(bl), run_time=0.4)
        self.until(W("Mass", 870.6) - 0.3)
        th = ValueTracker(0.0)
        planet = always_redraw(lambda: Dot(P(2.1 * np.cos(th.get_value()), 3.0 + 1.5 * np.sin(th.get_value())) + UP * 0.12, radius=0.11, color=CREAM))
        self.add(planet)
        ms = lab("mass shapes the geometry", size=28, color=AMBERL).next_to(bl, DOWN, buff=0.2)
        self.play(FadeIn(ms), th.animate.set_value(PI * 0.9), run_time=1.6, rate_func=linear)
        self.play(th.animate.set_value(PI * 2.6), run_time=3.2, rate_func=linear)
        self.play(th.animate.set_value(PI * 4.2), run_time=3.2, rate_func=linear)
        self.finish()


def satellite(p, col=CREAM):
    body = Rectangle(width=0.32, height=0.24, stroke_width=0, fill_color=col, fill_opacity=1)
    pan = VGroup(Rectangle(width=0.42, height=0.16, stroke_color=TEALL, stroke_width=1.5, fill_color=TEAL, fill_opacity=0.7).shift(LEFT * 0.4),
                 Rectangle(width=0.42, height=0.16, stroke_color=TEALL, stroke_width=1.5, fill_color=TEAL, fill_opacity=0.7).shift(RIGHT * 0.4))
    return VGroup(pan, body).move_to(p)


class GPS(Shot):
    """Signal time -> distance -> a sphere around each satellite; two overlap; a third and fourth leave one spot: you."""
    NAME = "GPS"
    def construct(self):
        Cc, Rr = np.array([0, -14.6, 0]), 11.8
        earth = Arc(radius=Rr, start_angle=PI / 2 - 0.62, angle=1.24, arc_center=Cc, color=MOSSL, stroke_width=4)
        Pt = Cc + Rr * np.array([np.cos(PI / 2 - 0.05), np.sin(PI / 2 - 0.05), 0])
        S = [np.array([-4.8, 2.3, 0]), np.array([4.6, 2.7, 0]), np.array([-1.0, 3.3, 0]), np.array([6.0, 0.4, 0])]
        cols = [TEALL, AMBERL, RUSTL, MOSSL]
        self.add(earth)
        s1 = satellite(S[0])
        self.play(FadeIn(s1), run_time=0.4)
        d1 = np.linalg.norm(S[0] - Pt)
        ring = Circle(radius=0.05, color=TEALL, stroke_width=3).move_to(S[0])
        ts = lab("each signal is stamped with the time it was sent", size=24, color=DIM).to_edge(UP, buff=0.25)
        self.play(FadeIn(ts), run_time=0.3)
        self.play(ring.animate.scale(d1 / 0.05).set_stroke(opacity=0.0), run_time=1.6, rate_func=linear)
        self.until(W("far", 890.3) + 0.5)
        td = lab("travel time  →  distance", size=28, color=CREAM).next_to(ts, DOWN, buff=0.15)
        self.play(FadeIn(td), run_time=0.4)
        circles = []
        def sphere(i):
            r = np.linalg.norm(S[i] - Pt)
            return DashedVMobject(Circle(radius=r, color=cols[i], stroke_width=3).move_to(S[i]), num_dashes=int(r * 18))
        self.until(W("sphere", 894.5) + 0.8)
        c1 = sphere(0)
        sl = lab("you are somewhere on this sphere", size=26, color=TEALL).move_to([-3.6, -1.0, 0])
        self.play(FadeOut(VGroup(ts, td)), Create(c1), FadeIn(sl), run_time=1.4)
        self.until(W("second", 899.2) - 0.1)
        s2 = satellite(S[1])
        c2 = sphere(1)
        self.play(FadeOut(sl), FadeIn(s2), Create(c2), run_time=1.4)
        self.until(W("overlap", 902.5) - 0.3)
        r1, r2 = np.linalg.norm(S[0] - Pt), np.linalg.norm(S[1] - Pt)
        dvec = S[1] - S[0]; dd = np.linalg.norm(dvec); a_ = (r1 ** 2 - r2 ** 2 + dd ** 2) / (2 * dd); hh = np.sqrt(max(r1 ** 2 - a_ ** 2, 0))
        m = S[0] + a_ * dvec / dd; perp = np.array([-dvec[1], dvec[0], 0]) / dd
        X1, X2 = m + hh * perp, m - hh * perp
        two = VGroup(Dot(X1, radius=0.11, color=CREAM), Dot(X2, radius=0.11, color=CREAM))
        ol = lab("where the two overlap", size=26, color=CREAM).to_edge(UP, buff=0.3)
        self.play(FadeIn(two, scale=0.4), FadeIn(ol), run_time=0.5)
        self.until(W("third", 904.5) - 0.1)
        s3, s4 = satellite(S[2]), satellite(S[3])
        c3, c4 = sphere(2), sphere(3)
        self.play(FadeIn(s3), Create(c3), run_time=1.0)
        self.play(FadeIn(s4), Create(c4), FadeOut(ol), run_time=1.0)
        self.until(W("spot", 904.5) + 0.6)
        keep = X1 if np.linalg.norm(X1 - Pt) < np.linalg.norm(X2 - Pt) else X2
        drop = two[1] if keep is X1 else two[0]
        self.play(FadeOut(drop), run_time=0.4)
        self.until(W("you", 908.8) - 0.1)
        pin = VGroup(Circle(radius=0.22, color=AMBER, stroke_width=0, fill_color=AMBER, fill_opacity=1).move_to(Pt + UP * 0.55),
                     Polygon(Pt + UP * 0.38 + LEFT * 0.16, Pt + UP * 0.38 + RIGHT * 0.16, Pt, stroke_width=0, fill_color=AMBER, fill_opacity=1))
        yl = T("you", size=40, color=AMBERL, font=HEAD).next_to(pin, RIGHT, buff=0.2)
        self.play(FadeIn(pin, shift=DOWN * 0.2), FadeIn(yl), run_time=0.5)
        self.until(W("Four", 910.2) - 0.1)
        fs = lab("4 satellites  ·  a few invisible spheres  ·  a fraction of a second", size=26, color=CREAM).to_edge(UP, buff=0.3)
        self.play(FadeIn(fs), run_time=0.5)
        self.finish()


class Finale(Shot):
    """What geometry is: simple pieces (dot, line, angle) -> triangles, the square rule, pi, a planet measured, curved space."""
    NAME = "Finale"
    def construct(self):
        tt = T("geometry", size=64, color=CREAM, font=HEAD).move_to(UP * 2.9)
        self.play(FadeIn(tt), run_time=0.6)
        self.until(W("shape", 918.6) - 0.3)
        st = lab("the study of shape and space", size=30, color=AMBERL).next_to(tt, DOWN, buff=0.15)
        self.play(FadeIn(st), run_time=0.4)
        y1, y2 = 0.55, -2.1
        def slot(x, y, icon, text, col=CREAM):
            fr = card_bg(2.3, 2.0).move_to([x, y, 0])
            icon.move_to([x, y + 0.2, 0])
            t = lab(text, size=19, color=col).move_to([x, y - 0.66, 0])
            return VGroup(fr, icon, t)
        dot_ = Dot(radius=0.07, color=CREAM)
        line_ = VGroup(Line(LEFT * 0.75, RIGHT * 0.75, color=CREAM, stroke_width=3),
                       Arrow(RIGHT * 0.5, RIGHT * 0.9, buff=0, color=CREAM, stroke_width=3, max_tip_length_to_length_ratio=0.5),
                       Arrow(LEFT * 0.5, LEFT * 0.9, buff=0, color=CREAM, stroke_width=3, max_tip_length_to_length_ratio=0.5))
        ang_ = VGroup(Line(ORIGIN, RIGHT * 0.9, color=CREAM, stroke_width=3), Line(ORIGIN, 0.9 * np.array([np.cos(0.8), np.sin(0.8), 0]), color=AMBERL, stroke_width=3),
                      Arc(radius=0.35, start_angle=0, angle=0.8, color=AMBER, stroke_width=2)).shift(LEFT * 0.3 + DOWN * 0.2)
        row1 = [slot(-2.6, y1, dot_, "a dot with\nno size"), slot(0, y1, line_, "a line that goes\non forever"), slot(2.6, y1, ang_, "an angle like\na door")]
        cues1 = [W("dot", 923.0), W("line", 923.6), W("angle", 926.4)]
        for g, t in zip(row1, cues1):
            self.until(t - 0.2)
            self.play(FadeIn(g, shift=UP * 0.1), run_time=0.4)
        truss = VGroup(*[Line(a, b, color=WOOD, stroke_width=3) for a, b in (([-0.8, -0.3, 0], [0.8, -0.3, 0]), ([-0.8, -0.3, 0], [-0.4, 0.3, 0]), ([-0.4, 0.3, 0], [0, -0.3, 0]),
                                                                               ([0, -0.3, 0], [0.4, 0.3, 0]), ([0.4, 0.3, 0], [0.8, -0.3, 0]), ([-0.4, 0.3, 0], [0.4, 0.3, 0]))])
        sqs = VGroup(Square(0.45, color=TEALL, stroke_width=2).shift(LEFT * 0.5 + UP * 0.1), Square(0.6, color=AMBERL, stroke_width=2).shift(DOWN * 0.15 + RIGHT * 0.05),
                     Square(0.75, color=CREAM, stroke_width=2).rotate(0.64).shift(RIGHT * 0.55 + UP * 0.25)).scale(0.85)
        pic = VGroup(Circle(radius=0.42, color=RUSTL, stroke_width=3), M(r"\pi", size=40, color=RUSTL))
        planet = VGroup(Arc(radius=0.7, start_angle=PI * 0.25, angle=PI * 0.5, color=MOSSL, stroke_width=3).shift(DOWN * 0.45),
                        Line([0, 0.25, 0], [0, 0.6, 0], color=CREAM, stroke_width=3), Line([0, 0.25, 0], [-0.25, 0.25, 0], color="#0b0e12", stroke_width=5))
        curved = VGroup(Circle(radius=0.48, color=DIM, stroke_width=2),
                        VMobject(color=AMBERL, stroke_width=3).set_points_smoothly([[0, 0.48, 0], [0.18, 0.05, 0], [0.4, -0.2, 0]]),
                        VMobject(color=AMBERL, stroke_width=3).set_points_smoothly([[0.4, -0.2, 0], [0, -0.28, 0], [-0.4, -0.2, 0]]),
                        VMobject(color=AMBERL, stroke_width=3).set_points_smoothly([[-0.4, -0.2, 0], [-0.18, 0.05, 0], [0, 0.48, 0]]))
        xs = [-5.2, -2.6, 0, 2.6, 5.2]
        row2 = [slot(xs[0], y2, truss, "triangles that\nhold up bridges"), slot(xs[1], y2, sqs, "a rule about\nsquares"),
                slot(xs[2], y2, pic, "a number in\nevery circle"), slot(xs[3], y2, planet, "a planet measured\nwith a stick"),
                slot(xs[4], y2, curved, "curved space,\nnew rules", AMBERL)]
        cues2 = [W("bridges", 928.1), W("squares", 934.1), W("circle", 937.7), W("planet", 937.7), W("curved", 942.2)]
        self.play(*[g.animate.shift(UP * 0.0) for g in row1], run_time=0.01)
        for g, t in zip(row2, cues2):
            self.until(t - 0.3)
            self.play(FadeIn(g, shift=UP * 0.1), run_time=0.45)
        self.finish()
