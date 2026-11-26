"""Euler film Manim shots. Each class = one MSHOTS window; beats keyed to spoken words via W().
Colour code for the five characters, used all film: e amber, i teal, pi rust, 1 moss, 0 cream.
Motion: Write / Create / FadeIn / Transform / Rotate / MoveAlongPath only. No flash, bounce or glow."""
from mc import *

CE, CI, CP, C1, C0 = AMBERL, TEALL, RUSTL, MOSSL, CREAM
CARD_BG = "#10151b"


def WX(word, after): return W(word, after, exact=True)


def euler(size=120, paint=True):
    """e^{i pi}+1=0 as one MathTex; eq[0] glyphs: 0 e, 1 i, 2 pi, 3 +, 4 1, 5 =, 6 0."""
    eq = M(r"e^{i\pi}+1=0", size=size)
    if paint: color_euler(eq)
    return eq


def color_euler(eq):
    g = eq[0]
    for k, c in ((0, CE), (1, CI), (2, CP), (4, C1), (6, C0)): g[k].set_color(c)
    return eq


def lab(s, size=24, color=DIM, font=BODY, **k): return T(s, size=size, color=color, font=font, **k)


def head(s, size=26, color=AMBER): return T(s, size=size, color=color, font=HEAD)


def pause_tag(text="PAUSE AND TRY IT"):
    t = T(text, size=26, color=AMBER, font=HEAD)
    line = Line(LEFT, RIGHT, color=AMBER, stroke_width=2).set_width(t.width * 0.6).next_to(t, DOWN, buff=0.15)
    return VGroup(t, line)


def card(col, w=2.0, h=2.6):
    return RoundedRectangle(width=w, height=h, corner_radius=0.16, stroke_color=col, stroke_width=2.5,
                            stroke_opacity=0.75, fill_color=CARD_BG, fill_opacity=0.95)


CAST = [("0", C0), ("1", C1), (r"\pi", CP), ("e", CE), ("i", CI)]   # order of introduction
CAST_GLYPH = [6, 4, 2, 0, 1]                                          # matching glyph index in euler()


def P(c, R, z):
    return np.array(c) + R * np.array([z.real, z.imag, 0.0])


def cross(c, R, ext=1.3, op=1.0):
    c = np.array(c)
    return VGroup(Line(c + LEFT * R * ext, c + RIGHT * R * ext, color=FAINT, stroke_width=2, stroke_opacity=op),
                  Line(c + DOWN * R * ext, c + UP * R * ext, color=FAINT, stroke_width=2, stroke_opacity=op))


def arrow(a, b, col=AMBER, w=8):
    return Arrow(a, b, buff=0, color=col, stroke_width=w, max_tip_length_to_length_ratio=0.2, max_stroke_width_to_length_ratio=12)


def spinner(scene, w=0.0):
    """ValueTracker angle that advances by w rad/s while the scene waits. Returns (tracker, speed dict)."""
    th = ValueTracker(0.0); sp = {"w": w}
    th.add_updater(lambda m, dt: m.increment_value(sp["w"] * dt))
    scene.add(th)
    return th, sp


# ------------------------------------------------------------------ hook

class Equations(Shot):
    """A wall of long equations; then the tiny winner and its seven symbols."""
    NAME = "Equations"
    def construct(self):
        LONG = [   # real equations from the study's list (Zeki et al. 2014, DataSheet1)
            r"\cos^2\theta + \sin^2\theta = 1",
            r"V - E + F = 2",
            r"\int_M K\,dA + \int_{\partial M} k_g\,ds = 2\pi\chi(M)",
            r"\int_{-\infty}^{\infty} e^{-x^2}\,dx = \sqrt{\pi}",
            r"\frac{1}{\zeta(s)} = \sum_{n=1}^{\infty}\frac{\mu(n)}{n^s}",
            r"\exp(X) = \sum_{n=0}^{\infty}\frac{X^n}{n!}",
            r"\mathcal{F}_x\big[e^{-ax^2}\big](k) = \sqrt{\frac{\pi}{a}}\,e^{-\pi^2k^2/a^2}",
            r"e = \lim_{n\to\infty}\left(1+\frac{1}{n}\right)^n",
            r"z_{n+1} = z_n^2 + c",
            r"f(x) = \int_{-\infty}^{\infty}\delta(x-y)\,f(y)\,dy",
            r"\oint_\gamma f(z)\,dz = 2\pi i\sum \mathrm{Res}(f, a_k)",
            r"\frac{\partial\rho}{\partial t} = D\,\frac{\partial^2\rho}{\partial x^2}",
        ]
        wall = VGroup()
        for k, s_ in enumerate(LONG):
            m = M(s_, size=34, color=DIM if k % 3 else CREAM)
            m.set_opacity(0.75)
            col, row = k % 3, k // 3
            m.move_to([(-4.5 + 4.5 * col) + (0.35 if row % 2 else -0.35), 2.85 - 1.9 * row, 0])
            if m.width > 4.1: m.width = 4.1
            wall.add(m)
        self.play(LaggedStart(*[FadeIn(m, shift=UP * 0.12) for m in wall], lag_ratio=0.12), run_time=2.0)
        self.until(W("Some", 18.64))
        big = M(r"\frac{dx}{dt} = x(\alpha - \beta y), \qquad \frac{dy}{dt} = -y(\gamma - \delta x)", size=64)
        big.width = min(big.width, 11.5)
        self.play(wall.animate.set_opacity(0.12), FadeIn(big, scale=0.96), run_time=0.8)
        self.until(W("but", 20.2))
        self.play(FadeOut(wall), FadeOut(big), run_time=1.0)
        self.until(W("tiny", 23.54) - 0.15)
        eq = euler(size=72, paint=False)
        self.play(FadeIn(eq, scale=0.9), run_time=0.7)
        self.until(W("Seven", 24.54))
        dots = VGroup(*[Dot(radius=0.06, color=AMBER).next_to(g, DOWN, buff=0.35).set_y(eq.get_bottom()[1] - 0.35) for g in eq[0]])
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.18), run_time=0.9)
        n7 = head("7 SYMBOLS", size=24).next_to(dots, DOWN, buff=0.35)
        self.play(FadeIn(n7, shift=UP * 0.08), run_time=0.4)
        self.finish()


class Ramanujan(Shot):
    """The ugliest: Ramanujan's series for 1/pi (portrait goes on the left as an overlay)."""
    NAME = "Ramanujan"
    def construct(self):
        tag_ = head("THE UGLIEST", size=26, color=RUSTL).move_to([1.9, 2.6, 0])
        self.play(FadeIn(tag_, shift=DOWN * 0.1), run_time=0.5)
        self.until(W("formula", 36.56))
        f = M(r"\frac{1}{\pi}", "=", r"\frac{2\sqrt{2}}{9801}\sum_{k=0}^{\infty}\frac{(4k)!\,(1103+26390k)}{(k!)^4\,396^{4k}}", size=64)
        f[0][-1].set_color(CP)
        f.width = min(f.width, 8.8); f.move_to([1.9, -0.1, 0])
        self.play(Write(f), run_time=2.4)
        self.until(W("ugly", 41.06) - 0.2)
        u = Line(LEFT, RIGHT, color=RUST, stroke_width=3).set_width(f.width).next_to(f, DOWN, buff=0.35)
        self.play(Create(u), run_time=0.5)
        self.finish()


class Winner(Shot):
    """The winner, written symbol by symbol as it is read aloud."""
    NAME = "Winner"
    def construct(self):
        t = head("THE WINNER", size=28, color=AMBER).to_edge(UP, buff=1.2)
        self.until(W("winner", 42.66))
        self.play(FadeIn(t, shift=DOWN * 0.1), run_time=0.5)
        eq = euler(size=176, paint=False).shift(DOWN * 0.2)
        g = eq[0]
        self.until(WX("E", 44.6) - 0.05)
        self.play(Write(g[0]), run_time=0.4)
        self.until(W("power", 45.86))
        box = DashedVMobject(SurroundingRectangle(g[1:3], buff=0.12, color=FAINT, stroke_width=2), num_dashes=24)
        self.play(Create(box), run_time=0.4)
        for k, (w_, at) in zip([1, 2, 3, 4, 5, 6], [("i", 46.36), ("Pi", 46.94), ("plus", 47.38), ("1", 48.0), ("equals", 48.44), ("0", 48.92)]):
            self.until((WX(w_, at) if len(w_) == 1 else W(w_, at)) - 0.05)
            anims = [Write(g[k])]
            if k == 2: anims.append(FadeOut(box))
            self.play(*anims, run_time=0.32)
        ul = Line(LEFT, RIGHT, color=AMBER, stroke_width=3).set_width(eq.width * 0.5).next_to(eq, DOWN, buff=0.45)
        self.play(Create(ul), run_time=0.6)
        self.finish()


class Puzzle(Shot):
    """How can a number raised to a power give minus one? + the road map of the film."""
    NAME = "Puzzle"
    def construct(self):
        eq = euler(size=120, paint=False)
        self.play(FadeIn(eq), run_time=0.4)
        self.until(W("How", 62.12))
        eq2 = M(r"e^{i\pi}", "=", "-1", size=140)
        self.play(TransformMatchingShapes(eq, eq2), run_time=1.0)
        self.until(W("power", 63.38))
        hl = SurroundingRectangle(eq2[0][1:], buff=0.1, color=AMBER, stroke_width=3)
        self.play(Create(hl), run_time=0.4)
        self.until(W("minus", 64.02))
        q = M("?", size=140, color=AMBER).next_to(eq2, RIGHT, buff=0.35)
        self.play(eq2[2].animate.set_color(AMBERL), FadeIn(q, shift=LEFT * 0.1), run_time=0.5)
        self.until(W("Step", 66.2) - 0.3)
        top = VGroup(eq2, hl, q)
        self.play(top.animate.scale(0.55).to_edge(UP, buff=0.9), run_time=0.7)
        names = ["the cast", "numbers as\ndirections", "growth turned\nsideways", "the circle"]
        xs = [-4.8, -1.6, 1.6, 4.8]
        line = Line([xs[0], -0.6, 0], [xs[-1], -0.6, 0], color=FAINT, stroke_width=3)
        nodes = VGroup(*[Circle(radius=0.16, color=AMBER, stroke_width=3, fill_color=CARD_BG, fill_opacity=1).move_to([x, -0.6, 0]) for x in xs])
        labs = VGroup(*[lab(n, size=24, color=CREAM).next_to(nodes[i], DOWN, buff=0.3) for i, n in enumerate(names)])
        self.play(Create(line), run_time=0.5)
        self.play(LaggedStart(*[AnimationGroup(FadeIn(nodes[i], scale=0.5), FadeIn(labs[i], shift=UP * 0.1)) for i in range(4)], lag_ratio=0.3), run_time=1.6)
        self.until(W("age", 69.32))
        self.play(nodes[0].animate.set_fill(AMBER, 1), run_time=0.4)
        self.finish()


# ------------------------------------------------------------------ the cast

def cast_cards(y=0.0, scale=1.0):
    xs = [-4.8, -2.4, 0, 2.4, 4.8]
    cards = VGroup(*[card(c).scale(scale).move_to([x * scale if scale < 1 else x, y, 0]) for x, (_, c) in zip(xs, CAST)])
    return cards


class Cast(Shot):
    """Five characters lift out of the equation onto cards; then zero, and the gap where it should be."""
    NAME = "Cast"
    def construct(self):
        eq = euler(size=130, paint=False)
        self.add(eq)
        g = eq[0]
        self.until(W("five", 73.0))
        self.play(LaggedStart(*[g[k].animate.set_color(c) for k, c in ((0, CE), (1, CI), (2, CP), (4, C1), (6, C0))], lag_ratio=0.15),
                  g[3].animate.set_opacity(0.3), g[5].animate.set_opacity(0.3), run_time=1.0)
        self.until(W("different", 75.46) - 0.3)
        cards = cast_cards()
        moves = []
        syms = VGroup()
        for i, ((tx, col), gi) in enumerate(zip(CAST, CAST_GLYPH)):
            target = M(tx, size=120, color=col).move_to(cards[i]).set_z_index(2)
            syms.add(target)
            moves.append(ReplacementTransform(g[gi], target))
        self.play(FadeIn(cards, lag_ratio=0.1), *moves, FadeOut(g[3]), FadeOut(g[5]), run_time=1.3)
        self.until(W("zero", 77.84) - 0.1)
        others = VGroup(*[VGroup(cards[i], syms[i]) for i in range(1, 5)])
        self.play(others.animate.set_opacity(0.25), cards[0].animate.set_stroke(opacity=1, width=4), run_time=0.6)
        self.until(W("nothing", 79.3) - 0.2)
        row = VGroup(*[VGroup(cards[i], syms[i]) for i in range(5)])
        self.play(row.animate.scale(0.42).move_to([0, 2.75, 0]), run_time=0.8)
        self.until(W("history", 82.16) - 0.4)
        u = 1.7; o = np.array([-4.6, -0.9, 0])
        nl = Line(o + LEFT * 0.6, o + RIGHT * (u * 5 + 0.6), color=DIM, stroke_width=3)
        ticks = VGroup(*[Line(o + RIGHT * u * k + UP * 0.14, o + RIGHT * u * k + DOWN * 0.14, color=DIM, stroke_width=3) for k in range(1, 6)])
        nums = VGroup(*[M(str(k), size=48, color=CREAM).next_to(o + RIGHT * u * k, DOWN, buff=0.35) for k in range(1, 6)])
        self.play(Create(nl), FadeIn(ticks), LaggedStart(*[FadeIn(n, shift=UP * 0.1) for n in nums], lag_ratio=0.12), run_time=1.0)
        gap = DashedVMobject(Circle(radius=0.36, color=C0, stroke_width=2.5), num_dashes=14).move_to(o + DOWN * 0.62)
        qm = M("?", size=44, color=DIM).move_to(gap)
        self.until(W("nothing", 83.82) - 0.2)
        self.play(Create(gap), FadeIn(qm), run_time=0.5)
        self.finish()


class One(Shot):
    """One: the number you count with; anything times one passes through unchanged."""
    NAME = "One"
    def construct(self):
        self.until(W("one", 97.5) - 0.3)
        one = M("1", size=170, color=C1)
        self.play(FadeIn(one, scale=0.9), run_time=0.5)
        self.until(W("count", 99.1) - 0.3)
        self.play(one.animate.scale(0.45).to_corner(UL, buff=0.8), run_time=0.5)
        row = M("1", "+", "1", "+", "1", "+", "1", "+", "1", size=84)
        for k in (0, 2, 4, 6, 8): row[k].set_color(C1)
        for k in (1, 3, 5, 7): row[k].set_color(DIM)
        row.shift(UP * 0.4)
        self.play(LaggedStart(*[FadeIn(p, shift=UP * 0.1) for p in row], lag_ratio=0.1), run_time=0.9)
        self.until(W("Multiply", 100.18) - 0.1)
        self.play(FadeOut(row), run_time=0.4)
        gate_l = Line(UP * 1.3, DOWN * 1.3, color=C1, stroke_width=4).shift(LEFT * 0.5)
        gate_r = gate_l.copy().shift(RIGHT * 1.0)
        gl = M(r"\times 1", size=60, color=C1).next_to(VGroup(gate_l, gate_r), UP, buff=0.3)
        self.play(Create(gate_l), Create(gate_r), Write(gl), run_time=0.5)
        shapes = VGroup(Triangle(color=CE, fill_opacity=0.85).scale(0.45), Star(color=CP, fill_opacity=0.85, outer_radius=0.5),
                        Square(side_length=0.75, color=CI, fill_opacity=0.85))
        for sh, y in zip(shapes, (0.85, 0.0, -0.85)): sh.move_to([-5.2, y, 0])
        self.play(LaggedStart(*[FadeIn(sh, shift=RIGHT * 0.3) for sh in shapes], lag_ratio=0.15), run_time=0.5)
        self.play(LaggedStart(*[sh.animate.shift(RIGHT * 10.4) for sh in shapes], lag_ratio=0.12), run_time=1.6, rate_func=smooth)
        self.until(W("nothing", 102.38) - 0.1)
        same = lab("comes out unchanged", size=30, color=CREAM).shift(DOWN * 2.3)
        self.play(FadeIn(same, shift=UP * 0.1), run_time=0.5)
        self.finish()


class Pi(Shot):
    """Any circle: around / across is always a little more than three. 3.14159... the number of circles."""
    NAME = "Pi"
    def construct(self):
        self.until(W("Pi", 104.64) - 0.2)
        pi_ = M(r"\pi", size=180, color=CP)
        self.play(FadeIn(pi_, scale=0.9), run_time=0.5)
        self.until(W("Take", 105.74))
        self.play(pi_.animate.scale(0.4).to_corner(UL, buff=0.7), run_time=0.5)
        self.until(W("circle", 106.22) - 0.1)
        c0 = Circle(radius=1.3, color=CREAM, stroke_width=4).shift(DOWN * 0.2)
        self.play(Create(c0), run_time=0.7)
        # coin, pizza, orbit
        self.until(W("coin", 107.26) - 0.15)
        coin = VGroup(Circle(radius=0.6, color=AMBERL, stroke_width=4), Circle(radius=0.48, color=AMBERL, stroke_width=1.5, stroke_opacity=0.6)).move_to([-4.6, 0, 0])
        coin_l = lab("coin").next_to(coin, DOWN, buff=1.05).set_y(-1.75)
        self.play(ReplacementTransform(c0, coin[0]), FadeIn(coin[1]), FadeIn(coin_l), run_time=0.5)
        self.until(W("pizza", 108.14) - 0.15)
        pz = Circle(radius=1.05, color=RUSTL, stroke_width=4).move_to([-1.0, 0, 0])
        sl = VGroup(*[Line(pz.get_center(), pz.get_center() + 1.05 * np.array([np.cos(a), np.sin(a), 0]), color=RUSTL, stroke_width=1.5, stroke_opacity=0.6) for a in np.arange(0, TAU, TAU / 8)])
        pz_l = lab("pizza").move_to([-1.0, -1.75, 0])
        self.play(Create(pz), FadeIn(sl), FadeIn(pz_l), run_time=0.5)
        self.until(W("planet's", 109.06) - 0.15)
        oc = np.array([3.6, 0, 0])
        orb = DashedVMobject(Circle(radius=1.45, color=TEALL, stroke_width=2.5), num_dashes=40).move_to(oc)
        sun = Dot(oc, radius=0.14, color=AMBER)
        th, sp = spinner(self, 1.2)
        planet = always_redraw(lambda: Dot(oc + 1.45 * np.array([np.cos(th.get_value()), np.sin(th.get_value()), 0]), radius=0.1, color=TEALL))
        orb_l = lab("orbit").move_to([3.6, -1.75, 0])
        self.play(Create(orb), FadeIn(sun), FadeIn(planet), FadeIn(orb_l), run_time=0.6)
        # measure around and across
        self.until(W("Measure", 110.38) - 0.1)
        r, x0, yb = 1.3, -5.9, -1.55
        cc = np.array([x0, yb + r, 0])
        circ = Circle(radius=r, color=CREAM, stroke_width=3).move_to(cc)
        self.play(FadeOut(VGroup(coin, coin_l, pz, sl, pz_l, orb, sun, planet, orb_l)), FadeIn(circ), run_time=0.6)
        self.until(W("around", 111.26) - 0.1)
        rim = Arc(radius=r, start_angle=-PI / 2, angle=TAU, arc_center=cc, color=CP, stroke_width=7)
        around = lab("around", color=CP, size=26).next_to(circ, UP, buff=0.2)
        self.play(Create(rim), FadeIn(around), run_time=0.9)
        self.until(W("across", 113.28) - 0.25)
        dia = Line(cc + LEFT * r, cc + RIGHT * r, color=CREAM, stroke_width=5)
        across = lab("across", color=CREAM, size=26).next_to(dia, UP, buff=0.12).shift(DOWN * 0.02)
        self.play(Create(dia), FadeIn(across), run_time=0.5)
        # unroll the rim along the floor
        self.until(W("You", 113.9))
        base = Line([x0 - 0.3, yb, 0], [x0 + TAU * r + 0.4, yb, 0], color=FAINT, stroke_width=2)
        u = ValueTracker(0.0)
        def roll():
            uu = u.get_value(); L = uu * TAU * r; cx = x0 + L
            flat = Line([x0, yb, 0], [cx, yb, 0], color=CP, stroke_width=7)
            rem = max((1 - uu) * TAU, 1e-3)
            return VGroup(flat, Arc(radius=r, start_angle=-PI / 2, angle=rem, arc_center=[cx, yb + r, 0], color=CP, stroke_width=7))
        rolled = always_redraw(roll)
        self.remove(rim); self.add(rolled)
        self.play(FadeIn(base), FadeOut(circ), FadeOut(around), FadeOut(across), dia.animate.move_to([x0 + r, yb - 0.45, 0]), run_time=0.5)
        self.play(u.animate.set_value(1.0), run_time=1.6, rate_func=smooth)
        rolled.clear_updaters()
        d2 = dia.copy().set_color(DIM).move_to([x0 + 3 * r, yb - 0.45, 0])
        d3 = dia.copy().move_to([x0 + 5 * r, yb - 0.45, 0])
        seps = VGroup(*[Line([x0 + 2 * r * k, yb - 0.3, 0], [x0 + 2 * r * k, yb - 0.6, 0], color=CREAM, stroke_width=2) for k in range(4)])
        self.play(FadeIn(d2, shift=RIGHT * 0.2), FadeIn(d3, shift=RIGHT * 0.2), FadeIn(seps), run_time=0.6)
        b3 = Brace(VGroup(dia, d2, d3), DOWN, color=DIM, buff=0.12)
        t3 = M("3", size=48, color=CREAM).next_to(b3, DOWN, buff=0.12)
        self.play(FadeIn(b3), Write(t3), run_time=0.5)
        self.until(W("little", 115.9) - 0.1)
        bit = Line([x0 + 6 * r, yb - 0.45, 0], [x0 + TAU * r, yb - 0.45, 0], color=AMBER, stroke_width=7)
        bitl = lab("a little more", size=24, color=AMBER).next_to(bit, DOWN, buff=0.55).shift(RIGHT * 0.5)
        self.play(Create(bit), FadeIn(bitl), run_time=0.6)
        # digits
        self.until(W("3", 118.7) - 0.1)
        dg = M("3.14159", size=96, color=CP).move_to([4.6, 1.6, 0])
        self.play(Write(dg), run_time=1.0)
        self.until(W("digits", 120.26) - 0.1)
        more = M(r"3.14159\,26535\,89793\,23846\,26433\,83279\,50288\,41971\ldots", size=40, color=DIM)
        more.next_to(dg, DOWN, buff=0.45).align_to(dg, LEFT)
        self.play(Write(more), run_time=1.5, rate_func=linear)
        # nickname
        self.until(W("Pi", 122.08) - 0.35)
        stuff = VGroup(*[m for m in self.mobjects if m not in (self.mobjects[0], pi_) and isinstance(m, VMobject)])
        self.play(FadeOut(stuff), pi_.animate.scale(2.2).move_to(UP * 0.6), run_time=0.6)
        nick = T("the number of circles", size=46, color=CREAM).next_to(pi_, DOWN, buff=0.5)
        self.play(FadeIn(nick, shift=UP * 0.1), run_time=0.5)
        self.finish()


class MeetE(Shot):
    """The fourth character: e, never properly introduced."""
    NAME = "MeetE"
    def construct(self):
        self.until(WX("E", 126.74) - 0.3)
        e = M("e", size=200, color=CE).shift(UP * 0.3)
        self.play(FadeIn(e, scale=0.9), run_time=0.6)
        sub = lab("the fourth character", size=30).next_to(e, DOWN, buff=0.5)
        self.play(FadeIn(sub, shift=UP * 0.1), run_time=0.5)
        self.until(W("introduced", 129.2) - 0.3)
        q = M("= \\, ?", size=110, color=DIM).next_to(e, RIGHT, buff=0.3)
        self.play(FadeIn(q, shift=LEFT * 0.1), run_time=0.5)
        self.finish()


class Interest(Shot):
    """1 rupee at 100%: once 2, twice 2.25, monthly 2.61, daily 2.71, every instant -> 2.71828... = e."""
    NAME = "Interest"
    def construct(self):
        ax = Axes(x_range=[0, 1.0001, 0.5], y_range=[0, 3.0, 1], x_length=7.4, y_length=5.4, tips=False,
                  axis_config={"color": FAINT, "stroke_width": 2, "include_ticks": False}).move_to([-2.5, -0.35, 0])
        ylabs = VGroup(*[M(str(v), size=34, color=DIM).next_to(ax.c2p(0, v), LEFT, buff=0.25) for v in (1, 2)])
        grid = VGroup(*[DashedLine(ax.c2p(0, v), ax.c2p(1, v), color=FAINT, stroke_width=1, dash_length=0.08, stroke_opacity=0.5) for v in (1, 2)])
        x6 = lab("6 months", size=22).next_to(ax.c2p(0.5, 0), DOWN, buff=0.2)
        x12 = lab("1 year", size=22).next_to(ax.c2p(1, 0), DOWN, buff=0.2)
        self.play(Create(ax), FadeIn(ylabs), FadeIn(grid), FadeIn(x12), run_time=0.7)
        self.until(W("one", 137.66) - 0.1)
        d0 = Dot(ax.c2p(0, 1), radius=0.08, color=AMBER)
        r1 = lab("1 rupee", size=24, color=AMBERL).next_to(d0, UR, buff=0.12)
        self.play(FadeIn(d0, scale=0.5), FadeIn(r1), run_time=0.4)
        # table
        rows_y = [2.35, 1.45, 0.55, -0.35, -1.25]
        def row(i, name, val, col=CREAM):
            n = lab(name, size=24, color=DIM).move_to([3.2, rows_y[i], 0], aligned_edge=LEFT).set_x(2.25, LEFT)
            v = M(val, size=40, color=col).move_to([6.2, rows_y[i], 0])
            return n, v
        # once a year
        self.until(W("after", 138.98))
        once = VMobject(color=AMBER, stroke_width=4).set_points_as_corners([ax.c2p(0, 1), ax.c2p(1, 1), ax.c2p(1, 2)])
        self.play(Create(once), run_time=1.0, rate_func=linear)
        n1, v1 = row(0, "once a year", "2")
        self.play(FadeIn(n1), Write(v1), FadeOut(r1), run_time=0.4)
        self.until(W("greedy", 142.02) - 0.2)
        self.play(once.animate.set_stroke(opacity=0.3), run_time=0.5)
        self.until(W("six", 145.2) - 0.2)
        mid = DashedLine(ax.c2p(0.5, 0), ax.c2p(0.5, 3), color=FAINT, stroke_width=2, dash_length=0.1)
        self.play(Create(mid), FadeIn(x6), run_time=0.5)
        # twice
        self.until(W("After", 148.0))
        h1 = Line(ax.c2p(0, 1), ax.c2p(0.5, 1), color=AMBERL, stroke_width=5)
        self.play(Create(h1), run_time=1.1, rate_func=linear)
        self.until(W("1", 149.5) - 0.1)
        rz1 = Line(ax.c2p(0.5, 1), ax.c2p(0.5, 1.5), color=AMBERL, stroke_width=5)
        l15 = M("1.5", size=34, color=AMBERL).next_to(ax.c2p(0.5, 1.5), UL, buff=0.1)
        self.play(Create(rz1), FadeIn(l15), run_time=0.4)
        self.until(W("then", 150.8))
        h2 = Line(ax.c2p(0.5, 1.5), ax.c2p(1, 1.5), color=AMBERL, stroke_width=5)
        self.play(Create(h2), run_time=1.6, rate_func=linear)
        self.until(W("2", 154.4) - 0.15)
        rz2 = Line(ax.c2p(1, 1.5), ax.c2p(1, 2.25), color=AMBERL, stroke_width=5)
        l225 = M("2.25", size=34, color=AMBERL).next_to(ax.c2p(1, 2.25), RIGHT, buff=0.1)
        n2, v2 = row(1, "twice", "2.25")
        self.play(Create(rz2), FadeIn(l225), FadeIn(n2), Write(v2), run_time=0.5)
        twice = VGroup(h1, rz1, h2, rz2)
        def stair(n):
            pts, v = [], 1.0
            for k in range(n):
                pts += [ax.c2p(k / n, v), ax.c2p((k + 1) / n, v)]
                v *= (1 + 1 / n)
                pts.append(ax.c2p((k + 1) / n, v))
            return VMobject(stroke_width=3).set_points_as_corners(pts)
        self.until(W("every", 157.54) - 0.1)
        mo = stair(12).set_color(TEALL)
        self.play(twice.animate.set_stroke(opacity=0.3), FadeOut(l15), FadeOut(l225), FadeOut(mid), FadeOut(x6), Create(mo), run_time=1.5, rate_func=linear)
        self.until(W("2", 159.34) - 0.1)
        n3, v3 = row(2, "every month", r"\approx 2.61", TEALL)
        self.play(FadeIn(n3), Write(v3), run_time=0.4)
        self.until(W("Every", 160.72))
        dy = stair(365).set_color(CREAM)
        self.play(mo.animate.set_stroke(opacity=0.35), Create(dy), run_time=1.2, rate_func=linear)
        self.until(W("2", 162.26) - 0.1)
        n4, v4 = row(3, "every day", r"\approx 2.71", CREAM)
        self.play(FadeIn(n4), Write(v4), run_time=0.4)
        self.until(W("Every", 165.56) - 0.1)
        sm = ax.plot(lambda x: np.exp(x), x_range=[0, 1], color=CE, stroke_width=6)
        n5 = lab("every instant", size=24, color=CE).set_x(2.25, LEFT).set_y(rows_y[4])
        self.play(dy.animate.set_stroke(opacity=0.35), Create(sm), FadeIn(n5), run_time=1.2)
        self.until(W("infinity", 167.98) - 0.4)
        cap = DashedLine(ax.c2p(0, np.e), ax.c2p(1.0, np.e), color=CE, stroke_width=2.5, dash_length=0.12)
        self.play(Create(cap), run_time=0.8)
        self.until(W("2", 170.66) - 0.1)
        v5 = M(r"2.71828\ldots", size=40, color=CE).move_to([6.0, rows_y[4], 0])
        self.play(Write(v5), run_time=1.0)
        self.until(W("E", 176.3) - 0.35)
        big = M("e", "=", r"2.71828\ldots", size=72).move_to([4.2, -2.75, 0])
        big[0].set_color(CE); big[2].set_color(CE)
        self.play(TransformFromCopy(v5, big[2]), FadeIn(big[:2]), run_time=0.7)
        self.until(W("full", 178.76) - 0.2)
        self.play(VGroup(once, twice, mo, dy).animate.set_stroke(opacity=0.12), sm.animate.set_stroke(width=9), run_time=0.8)
        self.finish()


class Squares(Shot):
    """i: no ordinary number squares to -1 (every square lands on the positive side); so invent i, i*i = -1."""
    NAME = "Squares"
    def construct(self):
        self.until(W("strange", 192.82) - 0.1)
        st = lab("the strange one", size=34, color=DIM).shift(DOWN * 1.6)
        self.play(FadeIn(st, shift=UP * 0.1), run_time=0.5)
        self.until(WX("I", 194.16) - 0.25)
        i_ = M("i", size=200, color=CI).shift(UP * 0.4)
        self.play(FadeIn(i_, scale=0.9), run_time=0.5)
        self.until(W("question", 195.6))
        self.play(FadeOut(st), i_.animate.scale(0.4).to_corner(UL, buff=0.7), run_time=0.5)
        self.until(W("multiplied", 199.32) - 0.2)
        q = M(r"\square", r"\times", r"\square", "=", "-1", size=96).move_to([0, 2.5, 0])
        for k in (0, 2): q[k].set_color(AMBER)
        self.play(Write(q[:3]), run_time=0.8)
        self.until(W("gives", 200.8))
        self.play(Write(q[3:]), run_time=0.5)
        self.until(W("2", 202.64) - 0.1)
        a = M(r"2\times 2 = 4", size=64).move_to([-3.0, 1.0, 0])
        self.play(Write(a), run_time=0.8)
        self.until(W("Minus", 204.66) - 0.05)
        b = M(r"(-2)\times(-2) = 4", size=64).move_to([3.0, 1.0, 0])
        self.play(Write(b), run_time=1.0)
        # every square lands on the positive side
        self.until(W("Square", 207.8) - 0.2)
        u = 1.25; o = np.array([0, -2.0, 0])
        nl = NumberLine(x_range=[-4, 4, 1], unit_size=u, color=DIM, stroke_width=3, include_numbers=False).move_to(o)
        nums = VGroup(*[M(str(k), size=34, color=DIM).next_to(nl.n2p(k), DOWN, buff=0.25) for k in range(-4, 5)])
        neg = Rectangle(width=4 * u, height=0.5, stroke_width=0, fill_color=RUST, fill_opacity=0.12).move_to(nl.n2p(-2))
        self.play(Create(nl), FadeIn(nums), run_time=0.6)
        arcs = VGroup(*[CurvedArrow(nl.n2p(n_) + UP * 0.15, nl.n2p(n_ * n_) + UP * 0.15, angle=-1.1, color=CREAM, stroke_width=3, tip_length=0.18)
                        for n_ in (-2, -1, 2)])
        self.play(LaggedStart(*[Create(a_) for a_ in arcs], lag_ratio=0.2), run_time=1.4)
        self.until(W("positive", 210.26) - 0.2)
        pos = lab("always lands here", size=26, color=CREAM).next_to(nl.n2p(2.5), UP, buff=1.25)
        nope = lab("never here", size=26, color=RUSTL).next_to(nl.n2p(-2), UP, buff=0.55)
        self.play(FadeIn(neg), FadeIn(nope), FadeIn(pos), run_time=0.6)
        # invent i
        self.until(W("invented", 212.54) - 0.2)
        self.play(VGroup(a, b, arcs, pos).animate.set_opacity(0.2), run_time=0.5)
        idot = Dot(nl.n2p(0) + UP * u, radius=0.11, color=CI)
        self.play(FadeIn(idot, scale=0.4), run_time=0.5)
        self.until(WX("it", 214.0))
        il = M("i", size=56, color=CI).next_to(idot, RIGHT, buff=0.15)
        self.play(FadeIn(il), run_time=0.4)
        self.until(WX("I", 215.62) - 0.15)
        q2 = M("i", r"\times", "i", "=", "-1", size=96).move_to(q)
        for k in (0, 2): q2[k].set_color(CI)
        self.play(TransformMatchingShapes(q, q2), nums[3].animate.set_color(CREAM), run_time=1.0)
        self.finish()


class Recap(Shot):
    """The cast with nicknames; they slide into one line; then all eyes on i."""
    NAME = "Recap"
    def construct(self):
        cards = cast_cards(y=0.5)
        syms = VGroup(*[M(tx, size=110, color=c).move_to(cards[i]).set_z_index(2) for i, (tx, c) in enumerate(CAST)])
        self.play(LaggedStart(*[FadeIn(VGroup(cards[i], syms[i]), shift=UP * 0.15) for i in range(5)], lag_ratio=0.12), run_time=1.1)
        names = [("nothing", W("Nothing", 239.98)), ("one", W("One", 240.68)), ("the number\nof circles", W("number", 241.4)),
                 ("the number\nof growth", W("number", 242.8)), ("the “fake” one", W("fake", 244.3))]
        labs = VGroup()
        for i, (nm, at) in enumerate(names):
            self.until(at - 0.1)
            l_ = lab(nm, size=24, color=CAST[i][1]).next_to(cards[i], DOWN, buff=0.3)
            labs.add(l_)
            self.play(FadeIn(l_, shift=UP * 0.1), cards[i].animate.set_stroke(opacity=1), run_time=0.4)
        self.until(W("fit", 247.6) - 0.6)
        eq = euler(size=150).shift(UP * 0.3)
        g = eq[0]
        self.play(FadeOut(cards), FadeOut(labs), *[ReplacementTransform(syms[i], g[CAST_GLYPH[i]]) for i in range(5)],
                  FadeIn(g[3]), FadeIn(g[5]), run_time=1.6)
        self.until(W("really", 251.0) - 0.3)
        ring = Circle(radius=0.42, color=CI, stroke_width=3).move_to(g[1])
        self.play(VGroup(g[0], g[2], g[3], g[4], g[5], g[6]).animate.set_opacity(0.3), Create(ring), run_time=0.7)
        self.finish()


# ------------------------------------------------------------------ numbers as directions

def road(o, u, lo, hi, nums=True):
    """A number line drawn as a quiet road, origin o, unit u."""
    o = np.array(o)
    band = Rectangle(width=(hi - lo) * u + 1.2, height=0.5, stroke_width=0, fill_color="#19212a", fill_opacity=1).move_to(o + RIGHT * (hi + lo) / 2 * u)
    mid = DashedLine(band.get_left(), band.get_right(), color=FAINT, stroke_width=2, dash_length=0.18, dashed_ratio=0.45)
    ticks = VGroup(*[Line(o + RIGHT * u * k + UP * 0.25, o + RIGHT * u * k + DOWN * 0.25, color=DIM, stroke_width=2.5) for k in range(lo, hi + 1)])
    labs = VGroup(*[M(str(k), size=40, color=CREAM if k >= 0 else DIM).next_to(o + RIGHT * u * k, DOWN, buff=0.42) for k in range(lo, hi + 1)]) if nums else VGroup()
    return VGroup(band, mid, ticks, labs)


def compass(at):
    at = np.array(at)
    c = VGroup(Line(at + UP * 0.45, at + DOWN * 0.45, color=FAINT, stroke_width=2), Line(at + LEFT * 0.45, at + RIGHT * 0.45, color=FAINT, stroke_width=2))
    L = VGroup(*[T(s_, size=20, color=DIM, font=HEAD).move_to(at + d * 0.72) for s_, d in (("N", UP), ("E", RIGHT), ("S", DOWN), ("W", LEFT))])
    return VGroup(c, L)


class Road(Shot):
    """Amount -> direction; the number line as an east-west road; x(-1) is a half turn."""
    NAME = "Road"
    def construct(self):
        dots = VGroup(*[Dot(radius=0.2, color=CREAM) for _ in range(3)]).arrange(RIGHT, buff=0.45).shift(UP * 1.0)
        amt = lab("an amount", size=30).next_to(dots, DOWN, buff=0.5)
        self.play(LaggedStart(*[FadeIn(d, scale=0.5) for d in dots], lag_ratio=0.2), FadeIn(amt), run_time=0.8)
        self.until(W("directions", 255.64) - 0.3)
        arr = arrow(LEFT * 1.6 + UP * 1.0, RIGHT * 1.6 + UP * 1.0)
        dirl = lab("a direction", size=30, color=AMBERL).next_to(arr, DOWN, buff=0.5)
        self.play(ReplacementTransform(dots, arr), ReplacementTransform(amt, dirl), run_time=0.8)
        self.until(W("Picture", 257.08) + 0.3)
        u = 1.4; o = np.array([0, -1.3, 0])
        rd = road(o, u, -4, 4)
        self.play(FadeOut(arr), FadeOut(dirl), FadeIn(rd[0]), Create(rd[1]), FadeIn(rd[2]), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(l_, shift=UP * 0.1) for l_ in rd[3]], lag_ratio=0.06), run_time=0.7)
        cmp_ = compass([5.9, 2.7, 0])
        self.until(W("east", 259.18) - 0.15)
        east = head("EAST", size=24, color=DIM).next_to(rd[0], UP, buff=0.25).align_to(rd[0], RIGHT)
        self.play(FadeIn(east), FadeIn(cmp_), run_time=0.4)
        self.until(W("west", 259.64) - 0.1)
        west = head("WEST", size=24, color=DIM).next_to(rd[0], UP, buff=0.25).align_to(rd[0], LEFT)
        self.play(FadeIn(west), run_time=0.4)
        self.until(W("Positive", 260.38))
        self.play(LaggedStart(*[rd[3][k].animate.set_color(C1) for k in range(5, 9)], lag_ratio=0.1), run_time=0.7)
        self.until(W("negative", 262.26))
        self.play(LaggedStart(*[rd[3][k].animate.set_color(RUSTL) for k in range(3, -1, -1)], lag_ratio=0.1), run_time=0.7)
        self.until(W("multiplying", 265.12) - 0.2)
        op = M(r"\times(-1)", size=80, color=CREAM).move_to([-4.2, 2.4, 0])
        self.play(Write(op), run_time=0.7)
        self.until(W("3", 267.7) - 0.25)
        a3 = arrow(o, o + RIGHT * 3 * u)
        self.play(GrowArrow(a3), run_time=0.6)
        self.until(W("turns", 268.62))
        half = DashedVMobject(Arc(radius=3 * u, start_angle=0, angle=PI, arc_center=o, color=FAINT, stroke_width=2.5), num_dashes=40)
        self.play(Rotate(a3, PI, about_point=o), Create(half), run_time=1.3)
        self.until(W("3", 269.4) - 0.1)
        self.play(rd[3][1].animate.scale(1.35), run_time=0.4)
        self.until(W("half", 273.76) - 0.3)
        ht = head("HALF TURN", size=28, color=CREAM).move_to(o + UP * (3 * u + 0.35))
        self.play(FadeIn(ht, shift=DOWN * 0.1), run_time=0.5)
        self.finish()


class Quarter(Shot):
    """What makes a quarter turn? i. Two quarter turns: i*i = -1."""
    NAME = "Quarter"
    def construct(self):
        # continue from Road's last frame, then re-frame for unit-length moves
        u0 = 1.4; o0 = np.array([0, -1.3, 0])
        rd0 = road(o0, u0, -4, 4)
        for k in range(5, 9): rd0[3][k].set_color(C1)
        for k in range(0, 4): rd0[3][k].set_color(RUSTL)
        rd0[3][1].scale(1.35)
        cmp_ = compass([5.9, 2.7, 0])
        east = head("EAST", size=24, color=DIM).next_to(rd0[0], UP, buff=0.25).align_to(rd0[0], RIGHT)
        west = head("WEST", size=24, color=DIM).next_to(rd0[0], UP, buff=0.25).align_to(rd0[0], LEFT)
        op = M(r"\times(-1)", size=80, color=CREAM).move_to([-4.2, 2.4, 0])
        a3 = arrow(o0, o0 + RIGHT * 3 * u0); a3.rotate(PI, about_point=o0)
        half = DashedVMobject(Arc(radius=3 * u0, start_angle=0, angle=PI, arc_center=o0, color=FAINT, stroke_width=2.5), num_dashes=40)
        ht = head("HALF TURN", size=28, color=CREAM).move_to(o0 + UP * (3 * u0 + 0.35))
        self.add(rd0, cmp_, east, west, op, a3, half, ht)
        u = 2.0; o = np.array([0, -1.5, 0])
        rd = road(o, u, -3, 3)
        for k in range(4, 7): rd[3][k].set_color(C1)
        for k in range(0, 3): rd[3][k].set_color(RUSTL)
        east2 = east.copy().next_to(rd[0], UP, buff=0.25).align_to(rd[0], RIGHT)
        west2 = west.copy().next_to(rd[0], UP, buff=0.25).align_to(rd[0], LEFT)
        self.play(FadeOut(a3), FadeOut(half), FadeOut(ht), FadeOut(op), run_time=0.6)
        self.play(ReplacementTransform(rd0, rd), ReplacementTransform(east, east2), ReplacementTransform(west, west2), run_time=1.0)
        self.until(W("What", 277.98) - 0.1)
        a = arrow(o, o + RIGHT * u)
        self.play(GrowArrow(a), run_time=0.5)
        self.until(W("quarter", 279.92) - 0.2)
        q1 = DashedVMobject(Arc(radius=u, start_angle=0, angle=PI / 2, arc_center=o, color=CI, stroke_width=3), num_dashes=16)
        qm = M("?", size=60, color=CI).move_to(o + u * 0.95 * np.array([np.cos(PI / 4), np.sin(PI / 4), 0]) + UR * 0.25)
        tagq = M(r"\times\,?", "=", r"\text{quarter turn}", size=60).move_to([-3.9, 2.5, 0])
        tagq[0].set_color(CI)
        self.play(Create(q1), FadeIn(qm), Write(tagq), run_time=0.8)
        self.until(W("twice", 281.84) - 0.3)
        q2 = DashedVMobject(Arc(radius=u, start_angle=PI / 2, angle=PI / 2, arc_center=o, color=CI, stroke_width=3), num_dashes=16)
        qm2 = qm.copy().move_to(o + u * 0.95 * np.array([np.cos(3 * PI / 4), np.sin(3 * PI / 4), 0]) + UL * 0.25)
        tag2 = M(r"\times\,?\;\times\,?", "=", r"\times(-1)", size=60).move_to([-3.9, 2.5, 0])
        tag2[0].set_color(CI)
        self.play(Create(q2), FadeIn(qm2), TransformMatchingShapes(tagq, tag2), run_time=0.9)
        self.until(WX("I", 284.38) - 0.25)
        ii = [M("i", size=60, color=CI).move_to(m) for m in (qm, qm2)]
        tag3 = M(r"\times\,i\;\times\,i", "=", r"\times(-1)", size=60).move_to(tag2)
        tag3[0].set_color(CI)
        self.play(ReplacementTransform(qm, ii[0]), ReplacementTransform(qm2, ii[1]), TransformMatchingShapes(tag2, tag3), run_time=0.6)
        self.until(W("turns", 286.54) - 0.2)
        self.play(FadeOut(VGroup(q1, q2, ii[0], ii[1])), run_time=0.3)
        self.play(Rotate(a, PI / 2, about_point=o), run_time=1.0)
        ang = Arc(radius=0.6, start_angle=0, angle=PI / 2, arc_center=o, color=CI, stroke_width=3)
        a90 = M(r"90^\circ", size=40, color=CI).move_to(o + 0.95 * np.array([np.cos(PI / 4), np.sin(PI / 4), 0]) + RIGHT * 0.25)
        self.play(Create(ang), FadeIn(a90), run_time=0.4)
        self.until(W("north", 290.6) - 0.3)
        self.play(cmp_[1][0].animate.set_color(CI).scale(1.3), run_time=0.4)
        self.until(W("Off", 291.42))
        vax = DashedLine(o + DOWN * 0.3, o + UP * (u + 0.9), color=CI, stroke_width=2.5, dash_length=0.12)
        self.play(Create(vax), run_time=0.7)
        self.until(W("direction", 293.5) - 0.1)
        il = M("i", size=60, color=CI).next_to(o + UP * u, RIGHT, buff=0.3)
        tk = Line(o + UP * u + LEFT * 0.15, o + UP * u + RIGHT * 0.15, color=CI, stroke_width=3)
        self.play(FadeIn(il), Create(tk), run_time=0.5)
        self.until(W("again", 296.12))
        self.play(Rotate(a, PI / 2, about_point=o), run_time=1.0)
        ang2 = Arc(radius=0.6, start_angle=PI / 2, angle=PI / 2, arc_center=o, color=CI, stroke_width=3)
        b90 = M(r"90^\circ", size=40, color=CI).move_to(o + 0.95 * np.array([np.cos(3 * PI / 4), np.sin(3 * PI / 4), 0]) + LEFT * 0.25)
        self.play(Create(ang2), FadeIn(b90), run_time=0.4)
        self.until(W("west", 299.08) - 0.2)
        self.play(cmp_[1][0].animate.set_color(DIM).scale(1 / 1.3), cmp_[1][3].animate.set_color(RUSTL).scale(1.3), run_time=0.4)
        self.until(W("Minus", 300.14) - 0.1)
        ring = Circle(radius=0.38, color=RUSTL, stroke_width=3).move_to(rd[3][2])
        self.play(Create(ring), run_time=0.4)
        self.until(W("times", 302.12) - 0.4)
        eq = M("i", r"\times", "i", "=", "-1", size=96).move_to([-3.9, 2.5, 0])
        for k in (0, 2): eq[k].set_color(CI)
        eq[4].set_color(RUSTL)
        self.play(FadeOut(tag3, shift=UP * 0.2), Write(eq), run_time=1.0)
        self.until(W("Two", 304.8))
        tt = lab("quarter turn + quarter turn\n= half turn", size=28, color=CREAM).move_to([2.2, 2.5, 0])
        self.play(FadeIn(tt, shift=UP * 0.1), ang.animate.set_stroke(width=6), ang2.animate.set_stroke(width=6), run_time=0.6)
        self.finish()


class Sideways(Shot):
    """'Imaginary' turns 90 degrees: it was only ever sideways."""
    NAME = "Sideways"
    def construct(self):
        w = T("imaginary", size=86, color=DIM, font=HEAD)
        self.play(FadeIn(w), run_time=0.5)
        self.until(W("imaginary", 324.86) - 0.1)
        x = Line(w.get_left() + LEFT * 0.1, w.get_right() + RIGHT * 0.1, color=RUSTL, stroke_width=5)
        self.play(Create(x), run_time=0.5)
        self.until(W("sideways", 326.44) - 0.5)
        self.play(FadeOut(x), run_time=0.2)
        self.play(w.animate.rotate(PI / 2).set_color(CI).shift(LEFT * 2.2), run_time=0.8)
        sw = T("just sideways", size=56, color=CI, font=HEAD).shift(RIGHT * 1.6)
        self.play(FadeIn(sw, shift=LEFT * 0.15), run_time=0.5)
        self.finish()


# ------------------------------------------------------------------ growth turned sideways

class Growth(Shot):
    """e = growth: the push equals where you are, so you speed east. e^i: what if the push points sideways?"""
    NAME = "Growth"
    def construct(self):
        ec = card(CE, 1.5, 1.9).move_to([-5.6, 2.55, 0]); es = M("e", size=90, color=CE).move_to(ec)
        ic = card(CI, 1.5, 1.9).move_to([5.6, 2.55, 0]); is_ = M("i", size=90, color=CI).move_to(ic)
        self.play(FadeIn(VGroup(ec, es), shift=RIGHT * 0.3), FadeIn(VGroup(ic, is_), shift=LEFT * 0.3), run_time=0.8)
        self.until(W("Remember", 329.88))
        self.play(VGroup(ic, is_).animate.set_opacity(0.25), run_time=0.4)
        self.until(W("growth", 331.42) - 0.3)
        gl = lab("growth", size=26, color=CE).next_to(ec, DOWN, buff=0.2)
        self.play(FadeIn(gl, shift=UP * 0.1), run_time=0.4)
        self.until(W("Raising", 332.34))
        f1 = M("e^{x}", size=110).move_to([0, 2.3, 0]); f1[0][0].set_color(CE)
        self.play(Write(f1), run_time=0.8)
        u = 1.0; o = np.array([-5.6, -1.4, 0])
        rd = road(o, u, 0, 12, nums=False)
        lbl = VGroup(*[M(str(k), size=32, color=DIM).next_to(o + RIGHT * u * k, DOWN, buff=0.4) for k in range(0, 11)])
        self.play(FadeIn(rd[0]), Create(rd[1]), FadeIn(rd[2]), FadeIn(lbl), run_time=0.8)
        self.until(W("ordinary", 336.66) - 0.2)
        br = VMobject()
        bl = lab("x = an ordinary number", size=26).next_to(f1, DOWN, buff=0.3)
        self.play(FadeIn(br), FadeIn(bl), run_time=0.5)
        t = ValueTracker(0.0)
        pos = lambda: o + RIGHT * u * np.exp(t.get_value())
        dot = always_redraw(lambda: Dot(pos(), radius=0.13, color=CE))
        push = always_redraw(lambda: arrow(pos(), pos() + RIGHT * 0.45 * np.exp(t.get_value()), CE, 7))
        trail = always_redraw(lambda: Line(o + RIGHT * u, pos() + LEFT * 0.001, color=CE, stroke_width=5, stroke_opacity=0.5))
        self.until(W("pushes", 338.44) - 0.3)
        self.play(FadeIn(dot), FadeIn(push), run_time=0.5)
        self.add(trail)
        self.until(W("speed", 340.04) - 0.1)
        self.play(t.animate.set_value(np.log(10.6)), run_time=2.6, rate_func=linear)
        self.until(W("what", 343.92) - 0.3)
        f2 = M("e^{i}", size=110).move_to(f1); f2[0][0].set_color(CE); f2[0][1].set_color(CI)
        self.play(FadeOut(dot), FadeOut(push), FadeOut(trail), FadeOut(br), FadeOut(bl), TransformMatchingShapes(f1, f2),
                  VGroup(ic, is_).animate.set_opacity(1), run_time=0.8)
        self.until(W("Growth", 346.26) - 0.2)
        a0 = o + RIGHT * u * 3
        d2 = Dot(a0, radius=0.13, color=CE)
        p2 = arrow(a0, a0 + RIGHT * 1.6, CE, 7)
        self.play(FadeIn(d2), GrowArrow(p2), run_time=0.4)
        self.play(Rotate(p2, PI / 2, about_point=a0), run_time=0.8)
        self.play(p2.animate.set_color(CI), run_time=0.2)
        qm = M("?", size=80, color=CI).next_to(p2, RIGHT, buff=0.3)
        self.play(FadeIn(qm), run_time=0.3)
        self.finish()


class Sideways2(Shot):
    """Always pushed sideways -> never closer, never farther -> a circle. e^i doesn't grow, it spins."""
    NAME = "Sideways2"
    def construct(self):
        c = np.array([0.3, -0.3, 0]); R = 2.3
        th, sp = spinner(self, 0.0)
        pt = lambda: c + R * np.array([np.cos(th.get_value()), np.sin(th.get_value()), 0])
        tang = lambda: np.array([-np.sin(th.get_value()), np.cos(th.get_value()), 0])
        ax = cross(c, R, 1.3, 0.6)
        string = always_redraw(lambda: Line(c, pt(), color=CREAM, stroke_width=2.5, stroke_opacity=0.8))
        push = always_redraw(lambda: arrow(pt(), pt() + 1.15 * tang(), CI, 7))
        ball = always_redraw(lambda: Dot(pt(), radius=0.15, color=CE))
        hub = Dot(c, radius=0.07, color=CREAM)
        self.play(FadeIn(ax), FadeIn(string), FadeIn(hub), FadeIn(ball), FadeIn(push), run_time=0.8)
        trail = TracedPath(pt, stroke_color=CI, stroke_width=4, stroke_opacity=0.9)
        self.add(trail)
        self.until(W("pushed", 360.6) - 0.3)
        sp["w"] = 0.85
        self.until(W("closer", 362.32) - 0.2)
        same = lab("never closer, never farther", size=28, color=CREAM).move_to([0.3, -3.35, 0])
        self.play(FadeIn(same, shift=UP * 0.1), run_time=0.5)
        self.until(W("circle", 365.5) - 0.3)
        guide = DashedVMobject(Circle(radius=R, color=CI, stroke_width=2).move_to(c), num_dashes=60)
        self.play(Create(guide), run_time=0.8)
        # inset: straight push vs turned push
        self.until(W("Normally", 368.24) - 0.1)
        ia = np.array([-5.6, 1.2, 0])
        ibox = RoundedRectangle(width=3.0, height=2.6, corner_radius=0.14, stroke_color=FAINT, stroke_width=2, fill_color=CARD_BG, fill_opacity=0.95).move_to(ia + RIGHT * 0.65 + UP * 0.45)
        idot = Dot(ia, radius=0.11, color=CE)
        iarr = arrow(ia, ia + RIGHT * 1.3, CE, 7)
        il1 = lab("straight ahead", size=22, color=CE).next_to(ibox, DOWN, buff=0.15)
        self.play(FadeOut(same), FadeIn(ibox), FadeIn(idot), GrowArrow(iarr), FadeIn(il1), run_time=0.6)
        self.until(W("Multiply", 370.84))
        f = M(r"\times\, i", size=48, color=CI).next_to(ibox, UP, buff=0.15)
        self.play(FadeIn(f), run_time=0.4)
        self.until(W("turned", 373.06) - 0.4)
        il2 = lab("turned 90°", size=22, color=CI).move_to(il1)
        self.play(Rotate(iarr, PI / 2, about_point=ia), ReplacementTransform(il1, il2), run_time=0.8)
        self.play(iarr.animate.set_color(CI), run_time=0.2)
        ra = always_redraw(lambda: RightAngle(Line(pt(), c), Line(pt(), pt() + tang()), length=0.28, color=CREAM, stroke_width=2))
        self.play(FadeIn(ra), run_time=0.3)
        self.until(W("grow", 376.48) - 0.4)
        g1 = VGroup(M(r"e^{i\,\cdot}", size=60), lab("doesn't make you grow", size=26)).arrange(DOWN, buff=0.2).move_to([5.2, 1.7, 0])
        g1[0][0][0].set_color(CE); g1[0][0][1].set_color(CI)
        self.play(FadeIn(g1, shift=UP * 0.1), run_time=0.5)
        self.until(W("spin", 377.88) - 0.35)
        sp_ = T("it makes you spin", size=34, color=CI, font=HEAD).move_to([5.2, -2.6, 0])
        if sp_.width > 3.4: sp_.width = 3.4
        self.play(FadeIn(sp_, shift=UP * 0.1), run_time=0.4)
        self.finish()


# ------------------------------------------------------------------ the circle

WC, WR = np.array([-2.0, -0.35, 0]), 2.55   # Walk / Quiz circle


def unit_stage(c=WC, R=WR):
    ax = cross(c, R, 1.3)
    circ = Circle(radius=R, color=CREAM, stroke_width=3).move_to(c)
    return ax, circ


def color_euler_partial(m):
    """colour e, i, pi glyphs at the start of a MathTex whose first part is e^{i pi ...}."""
    g = m[0]
    g[0].set_color(CE); g[1].set_color(CI)
    if len(g) > 2: g[2].set_color(CP)
    return m


class Walk(Shot):
    """Radius-1 circle; e^{i x} = walking directions; full way = 2pi, halfway = pi; e^{i pi} = -1 -> +1 -> 0."""
    NAME = "Walk"
    def construct(self):
        c, R = WC, WR
        ax, circ = unit_stage()
        self.play(Create(ax), run_time=0.7)
        self.until(W("circle", 381.04) - 0.2)
        self.play(Create(circ), run_time=1.0)
        self.until(W("radius", 381.66) - 0.1)
        rad = Line(c, c + R * np.array([np.cos(0.75), np.sin(0.75), 0]), color=DIM, stroke_width=3)
        r1 = M("1", size=40, color=DIM).move_to(rad.get_center() + 0.32 * np.array([-np.sin(0.75), np.cos(0.75), 0]))
        self.play(Create(rad), FadeIn(r1), run_time=0.6)
        self.until(W("0", 383.46) - 0.2)
        z0 = M("0", size=40, color=C0).next_to(c, DL, buff=0.12)
        self.play(FadeIn(z0), run_time=0.4)
        self.until(W("start", 384.48) - 0.1)
        dot = Dot(P(c, R, 1), radius=0.14, color=CE)
        one = M("1", size=44, color=C1).next_to(P(c, R, 1), DR, buff=0.12)
        self.play(FadeOut(rad), FadeOut(r1), FadeIn(dot, scale=0.5), FadeIn(one), run_time=0.5)
        self.until(W("edge", 387.38) - 0.3)
        self.play(dot.animate.scale(1.6), run_time=0.25); self.play(dot.animate.scale(1 / 1.6), run_time=0.25)
        fx = 3.85
        self.until(WX("E", 388.3) - 0.1)
        f1 = M(r"e^{\,i\,x}", size=110).move_to([fx, 2.4, 0])
        f1[0][0].set_color(CE); f1[0][1].set_color(CI)
        self.play(Write(f1), run_time=1.0)
        self.until(W("walking", 391.46) - 0.1)
        wd = lab("walking directions", size=28, color=CREAM).next_to(f1, DOWN, buff=0.35)
        self.play(FadeIn(wd, shift=UP * 0.1), run_time=0.4)
        self.until(W("how", 393.64) - 0.2)
        ul = lab("x = how far to walk", size=28, color=AMBERL).next_to(wd, DOWN, buff=0.3)
        self.play(FadeIn(ul, shift=UP * 0.1), f1[0][2].animate.set_color(AMBERL), run_time=0.5)
        self.until(W("full", 397.14) - 0.1)
        full = Arc(radius=R + 0.22, start_angle=0, angle=TAU, arc_center=c, color=CP, stroke_width=5)
        tl = M(r"2\pi", size=52, color=CP).move_to(c + (R + 0.75) * np.array([np.cos(0.8), np.sin(0.8), 0]))
        self.play(Create(full), run_time=1.1)
        self.play(FadeIn(tl), run_time=0.3)
        self.until(W("halfway", 399.6) - 0.2)
        halfa = Arc(radius=R + 0.22, start_angle=0, angle=PI, arc_center=c, color=CP, stroke_width=7)
        self.play(full.animate.set_stroke(opacity=0.2), FadeOut(tl), Create(halfa), run_time=0.8)
        self.until(W("pi", 400.7) - 0.2)
        pl = M(r"\pi", size=60, color=CP).move_to(c + UP * (R + 0.7))
        self.play(FadeIn(pl, shift=DOWN * 0.1), run_time=0.4)
        self.until(WX("E", 401.96) - 0.1)
        f2 = M(r"e^{i\pi}", size=96).move_to([fx, 1.9, 0]); color_euler_partial(f2)
        self.play(FadeOut(VGroup(f1, wd, ul)), FadeOut(full), run_time=0.3)
        self.play(FadeIn(f2), run_time=0.4)
        self.until(W("start", 404.02) - 0.1)
        self.play(dot.animate.scale(1.6), run_time=0.25); self.play(dot.animate.scale(1 / 1.6), run_time=0.25)
        self.until(W("walk", 405.58) - 0.1)
        trail = TracedPath(dot.get_center, stroke_color=CE, stroke_width=6)
        self.add(trail)
        self.play(MoveAlongPath(dot, Arc(radius=R, start_angle=0, angle=PI, arc_center=c)), run_time=1.7, rate_func=smooth)
        self.until(W("minus", 411.4) - 0.2)
        m1 = M("-1", size=48, color=CREAM).next_to(P(c, R, -1), DL, buff=0.12)
        f3 = M(r"e^{i\pi}", "=", "-1", size=96).move_to([fx, 1.9, 0]); color_euler_partial(f3)
        self.play(FadeIn(m1), TransformMatchingShapes(f2, f3), run_time=0.6)
        self.until(W("Add", 412.6))
        f4 = M(r"e^{i\pi}", "+1", "=", "-1", "+1", size=80).move_to([fx, 0.4, 0]); color_euler_partial(f4)
        f4[1].set_color(C1); f4[4].set_color(C1)
        self.play(TransformFromCopy(f3, f4), run_time=1.0)
        f5 = euler(size=96).move_to([fx, -1.3, 0])
        g = f5[0]
        for w_, at, ks in [("E", 416.08, [0]), ("pi", 417.0, [1, 2]), ("plus", 417.3, [3]), ("1", 417.92, [4]), ("equals", 418.32, [5]), ("0", 418.78, [6])]:
            self.until((WX(w_, at) if len(w_) == 1 else W(w_, at)) - 0.05)
            self.play(*[Write(g[k]) for k in ks], run_time=0.3)
        box = SurroundingRectangle(f5, buff=0.25, color=AMBER, stroke_width=3, corner_radius=0.1)
        self.play(Create(box), run_time=0.6)
        self.finish()


class Quiz(Shot):
    """Your turn: a quarter of the way -> i; e^{i pi/2} = i; the full way 2pi -> back to 1; every point has an address."""
    NAME = "Quiz"
    def construct(self):
        c, R = WC, WR
        ax, circ = unit_stage()
        z0 = M("0", size=40, color=C0).next_to(c, DL, buff=0.12)
        one = M("1", size=44, color=C1).next_to(P(c, R, 1), DR, buff=0.12)
        m1 = M("-1", size=48, color=CREAM).next_to(P(c, R, -1), DL, buff=0.12)
        dot = Dot(P(c, R, 1), radius=0.14, color=CE)
        self.add(ax, circ, z0, one, m1, dot)
        fx = 3.85
        self.until(W("try", 420.26) - 0.1)
        yt = head("YOUR TURN", size=30, color=CREAM).move_to([fx, 2.6, 0])
        self.play(FadeIn(yt, shift=DOWN * 0.1), run_time=0.5)
        self.until(W("Pause", 421.5) - 0.1)
        pt_ = pause_tag().next_to(yt, DOWN, buff=0.35)
        self.play(FadeIn(pt_, shift=UP * 0.1), run_time=0.5)
        self.until(W("quarter", 424.26) - 0.3)
        qa = DashedVMobject(Arc(radius=R, start_angle=0, angle=PI / 2, arc_center=c, color=CI, stroke_width=4), num_dashes=18)
        qm = M("?", size=64, color=CI).next_to(P(c, R, 1j), UR, buff=0.15)
        self.play(Create(qa), FadeIn(qm), run_time=0.8)
        self.until(W("turn", 426.3) - 0.1)
        trail = TracedPath(dot.get_center, stroke_color=CE, stroke_width=6)
        self.add(trail)
        self.play(FadeOut(qa), MoveAlongPath(dot, Arc(radius=R, start_angle=0, angle=PI / 2, arc_center=c)), run_time=1.6, rate_func=smooth)
        self.until(W("point", 430.2) - 0.1)
        il = M("i", size=60, color=CI).move_to(qm)
        self.play(ReplacementTransform(qm, il), run_time=0.4)
        self.until(WX("E", 432.18) - 0.15)
        a1 = M(r"e^{i\frac{\pi}{2}}", "=", "i", size=84).move_to([fx, 0.5, 0])
        a1[0][0].set_color(CE); a1[0][1].set_color(CI); a1[0][2].set_color(CP); a1[2].set_color(CI)
        self.play(FadeOut(VGroup(yt, pt_)), Write(a1[0]), run_time=1.6)
        self.until(W("equals", 434.76) - 0.1)
        self.play(Write(a1[1:]), run_time=0.6)
        self.until(W("Walk", 436.52) - 0.2)
        dot2 = Dot(P(c, R, 1), radius=0.14, color=CE)
        self.play(FadeOut(dot), FadeOut(trail), FadeIn(dot2), run_time=0.3)
        trail2 = TracedPath(dot2.get_center, stroke_color=CP, stroke_width=6)
        self.add(trail2)
        self.play(MoveAlongPath(dot2, Arc(radius=R, start_angle=0, angle=TAU, arc_center=c)), run_time=2.6, rate_func=smooth)
        tl = M(r"2\pi", size=52, color=CP).move_to(c + (R + 0.7) * np.array([np.cos(-0.7), np.sin(-0.7), 0]))
        self.play(FadeIn(tl), run_time=0.3)
        self.until(W("1", 440.52) - 0.3)
        a2 = M(r"e^{i\,2\pi}", "=", "1", size=84).move_to([fx, -0.9, 0])
        a2[0][0].set_color(CE); a2[0][1].set_color(CI); a2[0][3].set_color(CP); a2[2].set_color(C1)
        self.play(Write(a2), run_time=0.8)
        self.until(W("Every", 441.34))
        a3 = M(r"e^{i\pi}", "=", "-1", size=84).move_to([fx, 1.9, 0]); color_euler_partial(a3)
        ticks = VGroup(*[Dot(P(c, R, np.exp(1j * a)), radius=0.06, color=CREAM) for a in np.arange(0, TAU, TAU / 24)])
        self.play(FadeOut(trail2), FadeOut(tl), Write(a3), LaggedStart(*[FadeIn(t_, scale=0.3) for t_ in ticks], lag_ratio=0.05), run_time=1.4)
        adr = head("EVERY POINT HAS AN ADDRESS", size=22, color=DIM).move_to([fx, -2.35, 0])
        if adr.width > 5.6: adr.width = 5.6
        self.play(FadeIn(adr), run_time=0.4)
        self.finish()


class Steps(Shot):
    """The bank trick on the circle: tiny sideways steps (1 + i pi/n)^n -> arc -> lands on -1."""
    NAME = "Steps"
    def construct(self):
        c, R = np.array([-1.3, -0.75, 0]), 2.35
        ax = cross(c, R, 1.45, 0.7)
        guide = DashedVMobject(Circle(radius=R, color=FAINT, stroke_width=2).move_to(c), num_dashes=70)
        one = M("1", size=40, color=C1).next_to(P(c, R, 1), DR, buff=0.1)
        m1 = M("-1", size=40, color=CREAM).next_to(P(c, R, -1), DR, buff=0.1)
        self.play(Create(ax), Create(guide), FadeIn(one), FadeIn(m1), run_time=0.9)
        fx = 4.55
        self.until(W("bank", 446.76) - 0.2)
        bk = VGroup(lab("the bank trick", size=24), M(r"\left(1+\tfrac{1}{n}\right)^{n}", size=52)).arrange(DOWN, buff=0.15).move_to([fx, 2.55, 0])
        self.play(FadeIn(bk, shift=DOWN * 0.1), run_time=0.6)
        self.until(W("Split", 448.2))
        rx0, rx1, ry = -5.9, 1.4, 3.45
        bar = Line([rx0, ry, 0], [rx1, ry, 0], color=CP, stroke_width=5)
        pil = M(r"\pi", size=44, color=CP).next_to(bar, LEFT, buff=0.15)
        self.play(Create(bar), FadeIn(pil), run_time=0.6)
        self.until(W("100", 449.2) - 0.1)
        tks = VGroup(*[Line([x, ry - 0.1, 0], [x, ry + 0.1, 0], color=CREAM, stroke_width=1.2) for x in np.linspace(rx0, rx1, 101)])
        pc = lab("100 pieces", size=22, color=CREAM).next_to(bar, DOWN, buff=0.12).align_to(bar, RIGHT)
        self.play(LaggedStart(*[Create(t_) for t_ in tks], lag_ratio=0.01), FadeIn(pc), run_time=0.8)
        self.until(W("100", 451.44) - 0.1)
        pc2 = lab("100 tiny steps", size=22, color=CREAM).move_to(pc).align_to(bar, RIGHT)
        self.play(ReplacementTransform(pc, pc2), run_time=0.4)
        def path_pts(N):
            z, pts = 1 + 0j, [P(c, R, 1)]
            for _ in range(N):
                z *= (1 + 1j * PI / N); pts.append(P(c, R, z))
            return pts
        self.until(W("Each", 452.74) - 0.1)
        big = path_pts(10)
        idea = lab("each step is pushed\nsideways from\nwhere you stand", size=28, color=CI).move_to([fx, 0.9, 0])
        self.play(FadeIn(idea), run_time=0.4)
        segs, rads, ras = VGroup(), VGroup(), VGroup()
        per = (self.rel(W("Plot", 459.42)) - 0.3 - self.now()) / 10
        for k in range(10):
            rl = Line(c, big[k], color=DIM, stroke_width=1.8, stroke_opacity=0.8)
            sg = Line(big[k], big[k + 1], color=CE, stroke_width=4)
            ra = RightAngle(Line(big[k], c), Line(big[k], big[k + 1]), length=0.16, color=CREAM, stroke_width=1.5)
            anims = [Create(rl)]
            if k > 0: anims += [rads[k - 1].animate.set_stroke(opacity=0.15), ras[k - 1].animate.set_stroke(opacity=0.0)]
            self.play(*anims, run_time=per * 0.35)
            self.play(Create(sg), FadeIn(ra), run_time=per * 0.65)
            segs.add(sg); rads.add(rl); ras.add(ra)
        self.until(W("Plot", 459.42) - 0.1)
        p100 = VMobject(color=CE, stroke_width=4).set_points_as_corners(path_pts(100))
        self.play(VGroup(segs, rads, ras).animate.set_stroke(opacity=0.12), FadeOut(idea), Create(p100), run_time=2.2, rate_func=linear)
        e100 = Dot(p100.get_end(), radius=0.08, color=CE)
        l100 = lab("100 steps", size=24, color=CE).next_to(e100, LEFT, buff=0.25).shift(DOWN * 0.45)
        self.play(FadeIn(e100), FadeIn(l100), run_time=0.4)
        self.until(W("More", 463.06))
        p1k = VMobject(color=CI, stroke_width=4).set_points_as_corners(path_pts(1000))
        self.play(p100.animate.set_stroke(opacity=0.45), Create(p1k), run_time=1.4, rate_func=linear)
        ic, k_ = np.array([fx, -1.15, 0]), 22.0
        frame = RoundedRectangle(width=3.6, height=3.0, corner_radius=0.12, stroke_color=FAINT, stroke_width=2, fill_color=CARD_BG, fill_opacity=1).move_to(ic)
        zoombox = Square(side_length=0.42, color=FAINT, stroke_width=1.5).move_to(P(c, R, -1))
        zl = lab("zoomed in", size=18, color=DIM).next_to(frame, UP, buff=0.1).align_to(frame, LEFT)
        Z = lambda z: ic + np.array([1.1, 0, 0]) + R * k_ * np.array([(z + 1).real, (z + 1).imag, 0])
        zc = ParametricFunction(lambda a: Z(np.exp(1j * a)), t_range=[PI - 0.026, PI + 0.026], color=CREAM, stroke_width=2.5)
        zr = Line(Z(-1.05 + 0j), Z(-0.987 + 0j), color=FAINT, stroke_width=1.5)
        z100 = (1 + 1j * PI / 100) ** 100; z1k = (1 + 1j * PI / 1000) ** 1000
        d1 = Dot(Z(z100), radius=0.07, color=CE); d2 = Dot(Z(z1k), radius=0.07, color=CI)
        dm = Dot(Z(-1 + 0j), radius=0.08, color=CREAM)
        tm = M("-1", size=30, color=CREAM).next_to(dm, RIGHT, buff=0.15)
        t1 = lab("100", size=18, color=CE).next_to(d1, DOWN, buff=0.12)
        self.until(W("closer", 465.34) - 0.3)
        self.play(FadeIn(frame), FadeIn(zl), Create(zoombox), FadeIn(zc), FadeIn(zr), FadeIn(dm), FadeIn(tm), FadeIn(d1), FadeIn(t1), run_time=0.7)
        self.until(W("thousand", 467.14) - 0.2)
        t2 = lab("1,000", size=18, color=CI).next_to(d2, DOWN, buff=0.12)
        e1k = Dot(p1k.get_end(), radius=0.08, color=CI)
        l1k = lab("1,000 steps", size=24, color=CI).next_to(l100, DOWN, buff=0.12).align_to(l100, RIGHT)
        self.play(FadeIn(d2), FadeIn(t2), FadeIn(e1k), FadeIn(l1k), run_time=0.5)
        self.until(W("forever", 470.02) - 0.3)
        arc = Arc(radius=R, start_angle=0, angle=PI, arc_center=c, color=CREAM, stroke_width=5)
        self.play(Create(arc), run_time=1.2)
        ring = Circle(radius=0.16, color=CREAM, stroke_width=3).move_to(dm)
        ex = lab("exactly", size=18, color=CREAM).next_to(dm, UP, buff=0.3)
        self.play(Create(ring), FadeIn(ex), run_time=0.4)
        self.until(W("same", 473.02) - 0.3)
        a_ = M(r"\left(1+\tfrac{1}{n}\right)^{n}", r"\to", "e", size=46); a_[2].set_color(CE)
        b_ = M(r"\left(1+\tfrac{i\pi}{n}\right)^{n}", r"\to", "-1", size=46)
        st = VGroup(a_, b_).arrange(DOWN, buff=0.35, aligned_edge=LEFT).move_to([fx, 2.3, 0])
        self.play(FadeOut(bk), FadeIn(st, shift=UP * 0.1), run_time=0.7)
        self.until(W("sideways", 478.0) - 0.5)
        ig = b_[0][3]
        self.play(ig.animate.set_color(CI).scale(1.25), run_time=0.5)
        self.finish()


# ------------------------------------------------------------------ Euler

class EulerFormula(Shot):
    """e^{ix} = cos x + i sin x on the circle; the pi version falls out at x = pi."""
    NAME = "EulerFormula"
    def construct(self):
        c, R = np.array([-3.1, -0.4, 0]), 2.45
        ax = cross(c, R, 1.3)
        circ = Circle(radius=R, color=CREAM, stroke_width=3).move_to(c)
        x = ValueTracker(0.9)
        Pt = lambda: c + R * np.array([np.cos(x.get_value()), np.sin(x.get_value()), 0])
        foot = lambda: np.array([Pt()[0], c[1], 0])
        self.play(Create(ax), Create(circ), run_time=0.8)
        fx = 3.2
        self.until(WX("E", 491.22) - 0.1)
        f = M(r"e^{ix}", size=100).move_to([fx, 2.4, 0]); f[0][0].set_color(CE); f[0][1].set_color(CI)
        self.play(Write(f), run_time=0.8)
        rad = always_redraw(lambda: Line(c, Pt(), color=DIM, stroke_width=3))
        dot = always_redraw(lambda: Dot(Pt(), radius=0.13, color=CE))
        angm = always_redraw(lambda: Arc(radius=0.55, start_angle=0, angle=x.get_value(), arc_center=c, color=AMBER, stroke_width=3))
        angl = always_redraw(lambda: M("x", size=40, color=AMBER).move_to(c + 0.85 * np.array([np.cos(x.get_value() / 2), np.sin(x.get_value() / 2), 0])))
        self.until(W("angle", 493.36) - 0.4)
        self.play(Create(rad), FadeIn(angm), FadeIn(angl), run_time=0.5)
        self.until(W("lands", 493.72))
        self.play(FadeIn(dot, scale=0.5), run_time=0.4)
        self.until(W("Cosine", 495.4) - 0.2)
        cosl = always_redraw(lambda: Line(c, foot() + RIGHT * 0.001, color=CREAM, stroke_width=7))
        cost = always_redraw(lambda: M(r"\cos x", size=34, color=CREAM).move_to((c + foot()) / 2 + DOWN * 0.4))
        f2 = M(r"e^{ix}", "=", r"\cos x", "+", r"i\sin x", size=72).move_to([fx, 2.4, 0])
        f2[0][0].set_color(CE); f2[0][1].set_color(CI); f2[4].set_color(CI)
        self.play(ReplacementTransform(f, f2[0]), run_time=0.5)
        self.play(Create(cosl), FadeIn(cost), Write(f2[1:3]), run_time=0.7)
        self.until(W("east", 496.76) - 0.2)
        e_ = lab("how far east", size=24, color=CREAM).next_to(f2[2], DOWN, buff=0.45)
        self.play(FadeIn(e_), run_time=0.4)
        self.until(W("sine", 497.72) - 0.2)
        sinl = always_redraw(lambda: Line(foot(), Pt() + UP * 0.001, color=CI, stroke_width=7))
        sint = always_redraw(lambda: M(r"\sin x", size=34, color=CI).next_to((foot() + Pt()) / 2, RIGHT, buff=0.2).set_opacity(min(1.0, abs(np.sin(x.get_value())) * 4)))
        self.play(Create(sinl), FadeIn(sint), Write(f2[3:]), run_time=0.7)
        n_ = lab("how far north", size=24, color=CI).next_to(f2[4], DOWN, buff=0.45)
        self.play(FadeIn(n_), run_time=0.3)
        self.play(x.animate.set_value(2.2), run_time=1.0, rate_func=smooth)
        self.play(x.animate.set_value(1.1), run_time=0.9, rate_func=smooth)
        self.until(W("Historians", 499.94))
        sv = euler(size=72).move_to([fx, -0.6, 0])
        qm = M("?", size=72, color=DIM).next_to(sv, RIGHT, buff=0.3)
        self.play(FadeIn(sv), FadeIn(qm), FadeOut(e_), FadeOut(n_), run_time=0.7)
        self.until(W("pi", 503.22) - 0.3)
        r_ = Circle(radius=0.36, color=CP, stroke_width=3).move_to(sv[0][2])
        self.play(Create(r_), run_time=0.4)
        self.until(W("falls", 508.12) - 1.3)
        self.play(FadeOut(r_), FadeOut(qm), x.animate.set_value(PI), run_time=1.4, rate_func=smooth)
        fp = M(r"x = \pi:", r"\;e^{i\pi} = -1 + 0", size=50).move_to([fx, -2.2, 0])
        fp[0][2].set_color(CP); fp[1][0].set_color(CE); fp[1][1].set_color(CI); fp[1][2].set_color(CP)
        self.play(Write(fp), run_time=1.0)
        self.finish()


# ------------------------------------------------------------------ why it matters

class Spin(Shot):
    """e^{i x} as a spinning point; its height traced over time is a wave: anything that repeats."""
    NAME = "Spin"
    def construct(self):
        f = M(r"e^{ix}", size=110).move_to([0, 2.3, 0]); f[0][0].set_color(CE); f[0][1].set_color(CI)
        self.until(W("bigger", 538.32) - 0.2)
        self.play(Write(f), run_time=0.8)
        self.until(W("science", 542.8) - 0.2)
        sub = lab("science  ·  engineering", size=28, color=DIM).next_to(f, DOWN, buff=0.35)
        self.play(FadeIn(sub, shift=UP * 0.1), run_time=0.5)
        self.until(W("Anything", 544.42) - 0.3)
        c, R = np.array([-4.6, -1.1, 0]), 1.55
        th, sp = spinner(self, 0.0)
        Pt = lambda: c + R * np.array([np.cos(th.get_value()), np.sin(th.get_value()), 0])
        circ = Circle(radius=R, color=CREAM, stroke_width=3).move_to(c)
        ax = cross(c, R, 1.25, 0.6)
        rad = always_redraw(lambda: Line(c, Pt(), color=DIM, stroke_width=3))
        dot = always_redraw(lambda: Dot(Pt(), radius=0.12, color=CE))
        self.play(f.animate.scale(0.6).move_to([-4.6, 2.4, 0]), FadeOut(sub), Create(ax), Create(circ), run_time=0.8)
        self.play(FadeIn(rad), FadeIn(dot), run_time=0.3)
        sp["w"] = 2.2
        self.until(W("nature", 550.4) - 3.2)
        x0, x1, kk = -2.4, 6.6, 1.1
        t0 = th.get_value()
        def wave():
            xe = min(x1, x0 + (th.get_value() - t0) / kk)
            if xe - x0 < 0.02: return VMobject()
            return ParametricFunction(lambda xx: [xx, c[1] + R * np.sin(th.get_value() - (xx - x0) * kk), 0], t_range=[x0, xe], color=CI, stroke_width=5)
        wv = always_redraw(wave)
        link = always_redraw(lambda: DashedLine(Pt(), [x0, Pt()[1], 0], color=FAINT, stroke_width=2, dash_length=0.08))
        self.add(link, wv)
        self.until(W("repeats", 550.68) - 0.3)
        rp = lab("goes around, comes back", size=26, color=CREAM).move_to([2.2, 1.2, 0])
        self.play(FadeIn(rp, shift=UP * 0.1), run_time=0.5)
        self.finish()


class Phasor(Shot):
    """A spinning point (easy to calculate with) and its shadow: a current that keeps reversing."""
    NAME = "Phasor"
    def construct(self):
        c, R = np.array([-3.4, 0.7, 0]), 1.6
        th, sp = spinner(self, 3.0)
        Pt = lambda: c + R * np.array([np.cos(th.get_value()), np.sin(th.get_value()), 0])
        circ = Circle(radius=R, color=CREAM, stroke_width=3).move_to(c)
        arr = always_redraw(lambda: arrow(c, Pt(), CI, 6))
        wy = -2.15
        wire = Line([c[0] - R - 0.6, wy, 0], [c[0] + R + 0.6, wy, 0], color=DIM, stroke_width=5)
        shadow = always_redraw(lambda: Dot([Pt()[0], wy, 0], radius=0.14, color=CE))
        drop = always_redraw(lambda: DashedLine(Pt(), [Pt()[0], wy + 0.001, 0], color=FAINT, stroke_width=2, dash_length=0.08))
        self.play(Create(circ), Create(wire), run_time=0.6)
        self.add(drop, arr, shadow)
        l1 = lab("spinning point", size=26, color=CI).next_to(circ, UP, buff=0.25)
        l2 = lab("current that keeps reversing", size=24, color=CE).next_to(wire, DOWN, buff=0.3)
        self.play(FadeIn(l1), FadeIn(l2), run_time=0.4)
        self.until(WX("E", 557.78) - 0.3)
        f = M(r"e^{i\,\cdot}", size=110).move_to([3.4, 1.0, 0]); f[0][0].set_color(CE); f[0][1].set_color(CI)
        self.play(Write(f), run_time=0.7)
        self.until(W("easier", 560.38) - 0.3)
        ez = lab("far easier to calculate with", size=28, color=CREAM).next_to(f, DOWN, buff=0.5)
        self.play(FadeIn(ez, shift=UP * 0.1), run_time=0.5)
        self.finish()


class Fourier(Shot):
    """A sound splits into its separate pitches."""
    NAME = "Fourier"
    def construct(self):
        x0, x1 = -6.2, 4.4
        comps = [(1.0, 1.4, CE), (0.55, 3.1, CI), (0.35, 5.3, CP)]
        def wave(fn, y, col, sw=4):
            return ParametricFunction(lambda xx: [xx, y + fn(xx), 0], t_range=[x0, x1], color=col, stroke_width=sw)
        mix = wave(lambda xx: 0.5 * sum(a * np.sin(f_ * xx) for a, f_, _ in comps), 2.3, CREAM, 4)
        sl = lab("a sound", size=24, color=CREAM).next_to(mix, RIGHT, buff=0.3)
        self.play(Create(mix), FadeIn(sl), run_time=0.8)
        self.until(W("splits", 569.36) - 0.1)
        parts = VGroup(*[wave(lambda xx, a=a, f_=f_: 0.6 * a * np.sin(f_ * xx), y, col, 4) for (a, f_, col), y in zip(comps, (0.55, -0.85, -2.25))])
        self.play(*[TransformFromCopy(mix, p_) for p_ in parts], run_time=1.1)
        self.until(W("pitches", 570.86) - 0.2)
        pl = lab("separate pitches", size=24, color=CREAM).next_to(parts[1], RIGHT, buff=0.3)
        self.play(FadeIn(pl), run_time=0.4)
        self.until(W("Euler's", 572.04) - 0.1)
        f = M(r"e^{ix}", size=56).to_corner(DR, buff=0.5); f[0][0].set_color(CE); f[0][1].set_color(CI)
        self.play(FadeIn(f), run_time=0.4)
        self.finish()


class Schrodinger(Shot):
    """The basic equation of quantum physics has i built into it."""
    NAME = "Schrodinger"
    def construct(self):
        rng = np.random.default_rng(7)
        pts = rng.normal(0, 1, (160, 2)) * np.array([2.6, 1.2])
        cloud = VGroup(*[Dot([p[0], p[1] - 0.3, 0], radius=0.025, color=CREAM, fill_opacity=0.35) for p in pts])
        self.play(FadeIn(cloud, lag_ratio=0.01), run_time=1.0)
        self.until(W("equation", 580.82) - 0.2)
        eq = M(r"i\hbar\,\frac{\partial \psi}{\partial t} = \hat{H}\psi", size=110).shift(UP * 0.3)
        self.play(cloud.animate.set_opacity(0.12), Write(eq), run_time=1.5)
        nm = lab("Schrödinger equation", size=26, color=DIM).next_to(eq, DOWN, buff=0.45)
        self.play(FadeIn(nm), run_time=0.4)
        self.until(WX("I", 583.48) - 0.2)
        i_ = eq[0][0]
        ring = Circle(radius=0.48, color=CI, stroke_width=3).move_to(i_)
        self.play(i_.animate.set_color(CI), Create(ring), run_time=0.6)
        self.until(W("Descartes", 585.64) - 0.2)
        tg = lab("“imaginary”  ·  Descartes, 1637", size=26, color=CI).move_to([i_.get_x() + 1.6, 2.55, 0])
        ld = Line(tg.get_bottom() + LEFT * 1.5 + DOWN * 0.1, ring.get_top(), color=CI, stroke_width=2)
        self.play(FadeIn(tg, shift=DOWN * 0.1), Create(ld), run_time=0.5)
        self.until(W("heart", 587.14) - 0.2)
        self.play(cloud.animate.set_opacity(0.3), run_time=0.8)
        self.finish()


# ------------------------------------------------------------------ why it is beautiful

class Finale(Shot):
    """Five numbers from five places, one line. Growth turned sideways -> circle -> halfway -> -1 -> +1 -> 0."""
    NAME = "Finale"
    def construct(self):
        eq = euler(size=120).move_to([0, 2.55, 0]); g = eq[0]
        self.play(FadeIn(eq), run_time=0.5)
        self.until(W("Five", 602.26) - 0.1)
        xs = [-5.3, -2.65, 0, 2.65, 5.3]; py = -0.75
        panels = VGroup(*[card(c, 2.35, 3.3).move_to([x, py, 0]) for x, (_, c) in zip(xs, CAST)])
        self.play(LaggedStart(*[FadeIn(p_, shift=UP * 0.15) for p_ in panels], lag_ratio=0.1), run_time=0.8)
        copies = VGroup(*[g[CAST_GLYPH[i]].copy() for i in range(5)])
        self.add(copies)
        self.until(W("born", 603.26) - 0.1)
        self.play(*[copies[i].animate.scale(0.8).move_to([xs[i], py + 1.1, 0]) for i in range(5)], g.animate.set_opacity(0.25), run_time=1.0)
        icons = [
            DashedVMobject(Square(side_length=0.8, color=C0, stroke_width=2.5), num_dashes=16),
            VGroup(*[Line(UP * 0.4, DOWN * 0.4, color=C1, stroke_width=4).shift(RIGHT * 0.22 * k) for k in range(-2, 3)]),
            Circle(radius=0.45, color=CP, stroke_width=4),
            FunctionGraph(lambda t: 0.08 * np.exp(1.6 * t) - 0.45, x_range=[-0.6, 1.0], color=CE, stroke_width=4),
            M("?", size=80, color=CI),
        ]
        words = [("counting\nnothing", W("Zero", 605.46)), ("counting\nthings", W("one", 607.44)), ("circles", W("Pi", 609.14)),
                 ("growth", WX("E", 610.86)), ("a question\nwith no answer", WX("I", 612.36))]
        icg = VGroup()
        for i, (wd, at) in enumerate(words):
            self.until(at - 0.15)
            ic = icons[i].move_to([xs[i], py - 0.15, 0])
            tx = lab(wd, size=21, color=CAST[i][1]).move_to([xs[i], py - 1.15, 0])
            icg.add(VGroup(ic, tx))
            self.play(Create(ic) if i < 4 else FadeIn(ic), FadeIn(tx, shift=UP * 0.08), run_time=0.5)
        self.until(W("equation", 615.46) - 0.2)
        self.play(FadeOut(panels), FadeOut(icg), *[copies[i].animate.scale(1 / 0.8).move_to(g[CAST_GLYPH[i]]) for i in range(5)], run_time=1.2)
        self.remove(copies); g.set_opacity(1)
        c, R = np.array([0, -1.25, 0]), 1.45
        self.until(W("Growth", 617.84) - 0.1)
        st = P(c, R, 1)
        d = Dot(st, radius=0.13, color=CE)
        ar = arrow(st, st + RIGHT * 1.2, CE, 7)
        self.play(FadeIn(d), GrowArrow(ar), run_time=0.5)
        self.until(W("sideways", 618.8) - 0.3)
        self.play(Rotate(ar, PI / 2, about_point=st), run_time=0.6)
        self.play(ar.animate.set_color(CI), run_time=0.15)
        self.until(W("becomes", 619.26) - 0.1)
        circ = Circle(radius=R, color=CI, stroke_width=4).move_to(c)
        self.play(FadeOut(ar), Create(circ), run_time=0.9)
        self.until(W("Walk", 620.94) - 0.1)
        tr = TracedPath(d.get_center, stroke_color=CP, stroke_width=7)
        self.add(tr)
        self.play(MoveAlongPath(d, Arc(radius=R, start_angle=0, angle=PI, arc_center=c)), run_time=1.5, rate_func=smooth)
        self.until(W("minus", 623.52) - 0.2)
        m1 = M("-1", size=46, color=CREAM).next_to(P(c, R, -1), LEFT, buff=0.2)
        self.play(FadeIn(m1), run_time=0.4)
        self.until(W("Add", 624.66) - 0.1)
        p1 = M("+1", size=46, color=C1).next_to(m1, DOWN, buff=0.15)
        self.play(FadeIn(p1, shift=UP * 0.1), run_time=0.4)
        self.until(W("cancels", 625.94) - 0.3)
        z = M("0", size=60, color=C0).move_to(c)
        self.play(FadeOut(tr), d.animate.move_to(c).set_opacity(0), ReplacementTransform(VGroup(m1, p1), z), circ.animate.set_stroke(opacity=0.35), run_time=0.9)
        box = SurroundingRectangle(g[6], buff=0.12, color=C0, stroke_width=3)
        self.play(Create(box), run_time=0.4)
        self.until(W("Nobody", 627.56))
        self.play(FadeOut(VGroup(d, z, circ, box)), run_time=1.2)
        self.until(W("already", 630.42) - 0.3)
        self.play(eq.animate.scale(1.25).move_to(ORIGIN), run_time=1.6)
        self.finish()


class Final(Shot):
    """One more time, read as directions: start at 1, walk halfway around a circle."""
    NAME = "Final"
    def construct(self):
        eq = euler(size=150).move_to([0, 1.3, 0]); g = eq[0]
        for w_, at, ks in [("E", 649.74, [0]), ("i", 650.84, [1]), ("pi", 651.12, [2]), ("plus", 651.42, [3]), ("one", 652.06, [4]),
                           ("equals", 652.48, [5]), ("zero", 652.98, [6])]:
            self.until((WX(w_, at) if len(w_) == 1 else W(w_, at)) - 0.05)
            self.play(*[Write(g[k]) for k in ks], run_time=0.28)
        self.until(W("directions", 655.32) - 0.6)
        c, R = np.array([0, -1.75, 0]), 1.05
        ax = cross(c, R, 1.35, 0.6)
        circ = Circle(radius=R, color=CREAM, stroke_width=3).move_to(c)
        self.play(Create(ax), Create(circ), run_time=0.8)
        self.until(W("Start", 656.32))
        d = Dot(P(c, R, 1), radius=0.12, color=CE)
        one = M("1", size=36, color=C1).next_to(P(c, R, 1), RIGHT, buff=0.15)
        self.play(FadeIn(d, scale=0.5), FadeIn(one), run_time=0.4)
        self.until(W("walk", 657.62))
        tr = TracedPath(d.get_center, stroke_color=CP, stroke_width=6)
        self.add(tr)
        self.play(MoveAlongPath(d, Arc(radius=R, start_angle=0, angle=PI, arc_center=c)), run_time=1.5, rate_func=smooth)
        m1 = M("-1", size=36, color=CREAM).next_to(P(c, R, -1), LEFT, buff=0.15)
        self.play(FadeIn(m1), run_time=0.4)
        self.finish()
