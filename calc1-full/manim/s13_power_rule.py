"""Builder 13: start of Chapter 5. Why we want shortcuts, the constant rule, the power rule (the exponent physically
drops in front, the new exponent n-1 appears), where it comes from ((x+h)^3), negative and fractional powers
(1/x^3, 1/x checked with a live tangent, sqrt x, cube root of x^2), constant multiple, sum rule on a polynomial,
rewriting before differentiating, and the first line on e^x."""
from common import *

D = r"\frac{d}{dx}"
LIMH = r"\lim_{h\to 0}"
ARC = 0.55 * PI       # the exponent's hop over the x to the front


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def st(*parts, eq=3, x=0.0, y=0.0, size=70, c=None):
    """One stage of a worked line: M(*parts) aligned on its '=' (part eq); c = {part index: colour}."""
    m = M(*parts, size=size)
    for k, col in (c or {}).items():
        m[k].set_color(col)
    return at_eq(m, eq, x, y)


def morph(A, B, pairs, arc=(), new=True, fade=True):
    """Animations from stage A to stage B: (i, j) moves part A[i] onto B[j] (an arc for i in arc),
    unmatched A parts fade, unmatched B parts are written."""
    an = [ReplacementTransform(A[i], B[j], path_arc=ARC if i in arc else 0) for i, j in pairs]
    ui, uj = {i for i, _ in pairs}, {j for _, j in pairs}
    if fade:
        an += [FadeOut(A[i]) for i in range(len(A)) if i not in ui]
    if new:
        an += [Write(B[j]) for j in range(len(B)) if j not in uj]
    return an


def wipe_but(scene, t, *keep, run=0.35):
    """Erase the board except anything sharing a family with keep (slices written separately count too)."""
    scene.at(t)
    kid = {id(x) for k in keep for x in k.get_family()}
    ms = [m for m in scene.board() if not any(id(x) in kid for x in m.get_family())]
    if ms:
        scene.play(*[FadeOut(m) for m in ms], run_time=run)


def ids(n):
    return [(i, i) for i in range(n)]


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


_DG = {}


def digits(s, size=46, color=PINK):
    """A number from cached glyphs (no new LaTeX per frame). Minus signs sit at mid height."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.04, aligned_edge=DOWN)
    ref = [m for m, ch in zip(g, s) if ch.isdigit()][0]
    for m, ch in zip(g, s):
        if ch == "-":
            m.set_y(ref.get_y())
    return g


def readout(label, fn, pos, size=46, color=PINK):
    """'label = 1.8' with the number live from fn()."""
    lab = M(label, size=size, color=color).move_to(pos)
    num = always_redraw(lambda: digits(f"{round(fn(), 1) + 0:.1f}", size, color).next_to(lab, RIGHT, buff=0.16))
    return VGroup(lab, num)


def page(w=3.0, h=3.9, seed=3):
    """A sheet of paper with a folded corner, covered in lines of chalk scribble (a page of algebra)."""
    rng = np.random.default_rng(seed)
    f = 0.45
    pts = [(-w / 2, h / 2), (w / 2 - f, h / 2), (w / 2, h / 2 - f), (w / 2, -h / 2), (-w / 2, -h / 2)]
    sheet = Polygon(*[np.array([a, b, 0]) for a, b in pts], color=CHALK, stroke_width=4,
                    fill_color=config.background_color, fill_opacity=1)
    corner = VMobject(stroke_color=CHALK, stroke_width=3).set_points_as_corners(
        [[w / 2 - f, h / 2, 0], [w / 2 - f, h / 2 - f, 0], [w / 2, h / 2 - f, 0]])
    lines = VGroup()
    n = int((h - 0.8) / 0.36)
    for i in range(n):
        y = h / 2 - 0.62 - i * 0.36
        x0 = -w / 2 + 0.3 + (0.35 if i % 3 else 0)
        x1 = w / 2 - 0.3 - rng.uniform(0, 0.9) - (0.4 if i < 2 else 0)
        xs = np.linspace(x0, x1, 30)
        ys = y + 0.05 * np.sin(xs * 9 + i) + rng.normal(0, 0.012, xs.size)
        lines.add(VMobject(stroke_color=DIM, stroke_width=3).set_points_smoothly(np.column_stack([xs, ys, np.zeros(30)])))
    return VGroup(sheet, corner, lines)


def stopwatch(r=0.7):
    """Face, crown button, four ticks and a pink hand (index 3) pointing up."""
    face = Circle(radius=r, color=CHALK, stroke_width=5)
    crown = VGroup(Line(UP * r, UP * (r + 0.16), color=CHALK, stroke_width=5),
                   Line(UP * (r + 0.16) + LEFT * 0.14, UP * (r + 0.16) + RIGHT * 0.14, color=CHALK, stroke_width=6))
    ticks = VGroup(*[Line(r * 0.82 * np.array([np.sin(a), np.cos(a), 0]), r * np.array([np.sin(a), np.cos(a), 0]),
                          color=DIM, stroke_width=3) for a in np.arange(0, TAU, PI / 2)])
    hand = Line(ORIGIN, UP * r * 0.72, color=PINK, stroke_width=5)
    return VGroup(face, crown, ticks, hand)


def ycol(m, color=YEL):
    m.set_color(color)
    return m


# ================================================================ why rules

class K13_Shortcuts(Shot):
    def body(self):
        self.title("Last Chapter", "1:17:37.62")
        pg = page().move_to([-3.4, -0.6, 0])
        self.go("1:17:38.06", draw(pg[0], 0.8), Create(pg[1]), run=0.8)
        self.go("1:17:40.02", LaggedStart(*[Create(l) for l in pg[2]], lag_ratio=0.25), run=1.4)
        items = [H("expand", 48), H("cancel", 48), TX(r"divide by $h$", 60), H("take the limit", 48)]
        nums = [M(str(i + 1), size=48, color=YEL) for i in range(4)]
        for i, (n, it) in enumerate(zip(nums, items)):
            n.move_to([0.6, 1.15 - 1.05 * i, 0])
            it.next_to(n, RIGHT, buff=0.4)
        for t, n, it in zip(("1:17:41.78", "1:17:42.36", "1:17:43.36", "1:17:44.44"), nums, items):
            self.go(t, FadeIn(n, shift=RIGHT * 0.1), FadeIn(it, shift=RIGHT * 0.1), run=0.45)
        # every problem: a page each
        more = VGroup(*[page(seed=10 + k).move_to(pg).shift(np.array([-0.32, 0.26, 0]) * (k + 1)).set_z_index(-k - 1)
                        for k in range(3)])
        self.go("1:17:48.24", LaggedStart(*[FadeIn(p, shift=UP * 0.15 + LEFT * 0.15) for p in more], lag_ratio=0.35), run=1.2)
        self.wipe("1:17:50.98", run=0.4)
        self.title("Shortcuts", "1:17:53.96")
        dfn = M("f'(x)", "=", LIMH, r"\frac{f(x+h)-f(x)}{h}", size=58).move_to([0, 1.3, 0])
        self.go("1:17:55.30", Write(dfn), run=0.8)
        arr = Arrow([0, 0.35, 0], [0, -0.45, 0], buff=0, color=YEL, stroke_width=5, tip_length=0.2)
        rules = pill("the rules", YEL, size=48).next_to(arr, DOWN, buff=0.2)
        self.go("1:17:56.08", GrowArrow(arr), run=0.4)
        self.go("1:17:56.66", FadeIn(rules, shift=DOWN * 0.15), run=0.5)
        self.go("1:17:58.46", dfn.animate.set_opacity(0.3), run=0.6)
        ex = M("x^3", r"\;\longrightarrow\;", "3x^2", size=66).move_to([-1.2, -2.55, 0])
        ex[2].set_color(PINK)
        self.go("1:18:01.38", Write(ex), run=0.8)
        sw = stopwatch(0.62).move_to([3.0, -2.5, 0])
        self.go("1:18:02.38", Create(sw), run=0.5)
        self.go("1:18:02.98", Rotate(sw[3], -PI / 2.2, about_point=sw[0].get_center()), run=1.0)


# ================================================================ constant rule

class K13_Constant(Shot):
    def body(self):
        self.title("The Constant Rule", "1:18:06.70")
        R = M(D, "c", "=", "0", size=72).move_to([0, 1.4, 0])
        R[1].set_color(ORG); R[3].set_color(PINK)
        fr = panel(R, PURP, buff=0.3)
        self.go("1:18:08.08", Write(R[0:2]), run=0.7)
        self.go("1:18:09.42", Write(R[2:]), run=0.5)
        self.play(Create(fr), run_time=0.5)
        rows = [st(D, "7", "=", "0", eq=2, x=-1.2, y=-0.5, size=62),
                st(D, "(-200)", "=", "0", eq=2, x=-1.2, y=-1.8, size=62),
                st(D, r"\pi", "=", "0", eq=2, x=-1.2, y=-3.1, size=62)]
        for r in rows:
            r[1].set_color(ORG); r[3].set_color(PINK)
        for (t1, t2), r in zip((("1:18:11.16", "1:18:12.68"), ("1:18:13.80", "1:18:15.92"), ("1:18:16.96", "1:18:18.44")), rows):
            self.go(t1, Write(r[0:2]), run=0.6)
            self.go(t2, Write(r[2:]), run=0.45)
        pi = M(r"\pi\approx 3.14", size=56, color=ORG).next_to(rows[2], RIGHT, buff=1.2)
        self.go("1:18:21.28", Write(pi), run=0.6)
        self.go("1:18:22.82", Circumscribe(rows[2][3], color=PINK, buff=0.12), run=0.8)
        wipe_but(self, "1:18:26.30", R, fr)
        ax = axes((-1, 6, 1), (-1, 4, 1), x_length=8.0, y_length=3.4, center=(0, -1.75, 0))
        self.go("1:18:26.70", Create(ax), FadeIn(ax.labels), run=0.6)
        ln = curve(ax, lambda x: 3, [0.08, 5.7])
        self.go("1:18:28.28", draw(ln, 0.8, BLUE), run=0.8)
        lab = M("y=3", size=48, color=BLUE).next_to(ax.c2p(5.7, 3), DOWN, buff=0.25)
        self.go("1:18:29.06", FadeIn(lab, shift=UP * 0.1), run=0.4)
        xt = ValueTracker(0.6)
        live = live_tangent(ax, lambda x: 3.0, xt, length=2.2, readout_pos=ax.c2p(2.7, 1.4))
        self.go("1:18:30.22", FadeIn(live), run=0.3)
        self.play(xt.animate.set_value(4.6), run_time=1.7)
        self.go("1:18:32.32", Circumscribe(fr, color=YEL, buff=0.08), run=0.9)


# ================================================================ power rule

class K13_PowerRule(Shot):
    def body(self):
        self.title("The Power Rule", "1:18:34.82")
        R = M(D, "x^{n}", "=", "n", "x^{n-1}", size=66).move_to([0, 1.45, 0])
        R[3].set_color(YEL)
        fr = panel(R, PURP, buff=0.28)
        self.go("1:18:39.32", Write(R[0:2]), run=0.8)
        self.go("1:18:41.18", Write(R[2:4]), run=0.4)
        self.go("1:18:41.84", Write(R[4]), run=0.6)
        self.go("1:18:42.60", Create(fr), run=0.5)
        # the motion itself, big: the exponent hops down in front, then n-1 goes up
        C = M("n", "x", "^{n-1}", size=120).move_to([0, -1.0, 0])
        C[2][1:].set_color(YEL); C[0].set_color(YEL)
        B = M("n", "x", size=120); B[0].set_color(YEL)
        B.shift(C[1].get_center() - B[1].get_center())
        A = M("x", "^{n}", size=120)
        A.shift(C[1].get_center() - A[0].get_center())
        self.go("1:18:43.82", Write(A), run=0.6)
        self.go("1:18:44.56", A[1].animate.set_color(YEL), run=0.3)
        self.go("1:18:44.86", *morph(A, B, [(0, 1), (1, 0)], arc=(1,)), run=0.9)
        self.go("1:18:46.16", Write(C[2]), run=0.7)
        self.remove(B[0], B[1]); self.add(C[0], C[1])
        self.go("1:18:47.14", Circumscribe(C[2], color=YEL, buff=0.1), run=0.8)
        wipe_but(self, "1:18:48.14", R, fr)

        # x^2 -> 2x
        X, Y = -2.1, -0.45
        S0 = st(D, "x", "^{2}", "=", "x", "^{2}", x=X, y=Y, c={5: YEL})
        S1 = st(D, "x", "^{2}", "=", "2", "x", x=X, y=Y, c={4: YEL})
        S2 = st(D, "x", "^{2}", "=", "2", "x", "^{2-1}", x=X, y=Y, c={4: YEL}); S2[6][1:].set_color(YEL)
        S3 = st(D, "x", "^{2}", "=", "2", "x", "^{1}", x=X, y=Y, c={4: YEL, 6: YEL})
        S4 = st(D, "x", "^{2}", "=", "2", "x", "^{1}", "=", "2x", x=X, y=Y, c={4: PINK, 5: PINK, 6: PINK, 8: PINK})
        self.go("1:18:48.68", Write(S0[0]), run=0.5)
        self.go("1:18:49.42", Write(S0[1:3]), run=0.4)
        self.go("1:18:49.86", Write(S0[3]), TransformFromCopy(S0[1], S0[4]), TransformFromCopy(S0[2], S0[5]), run=0.5)
        self.go("1:18:50.70", *morph(S0, S1, ids(4) + [(4, 5), (5, 4)], arc=(5,)), run=0.8)
        self.go("1:18:51.60", *morph(S1, S2, ids(6)), run=0.45)
        self.go("1:18:52.14", *morph(S2, S3, ids(7)), run=0.4)
        self.go("1:18:52.60", *morph(S3, S4, ids(7)), run=0.45)
        ok = VGroup(tick_mark(s=0.5), H("matches the definition", 42, GRN)).arrange(RIGHT, buff=0.3).move_to([0, -2.4, 0])
        self.go("1:18:53.66", Create(ok[0]), FadeIn(ok[1], shift=UP * 0.1), run=0.5)
        self.go("1:18:54.66", Circumscribe(S4[8], color=PINK, buff=0.12), run=0.8)
        self.go("1:18:56.30", FadeOut(VGroup(*S4, ok)), run=0.35)

        # x^3 -> 3x^2 and x^10 -> 10x^9
        Y1, Y2 = -0.45, -2.45
        T0 = st(D, "x", "^{3}", "=", "x", "^{3}", x=X, y=Y1, c={5: YEL})
        T1 = st(D, "x", "^{3}", "=", "3", "x", x=X, y=Y1, c={4: YEL})
        T2 = st(D, "x", "^{3}", "=", "3", "x", "^{3-1}", x=X, y=Y1, c={4: YEL}); T2[6][1:].set_color(YEL)
        T3 = st(D, "x", "^{3}", "=", "3", "x", "^{2}", x=X, y=Y1, c={4: YEL, 6: YEL})
        self.go("1:18:56.70", Write(T0[0]), run=0.5)
        self.go("1:18:57.26", Write(T0[1:3]), run=0.4)
        self.go("1:18:57.76", Write(T0[3]), TransformFromCopy(T0[1], T0[4]), TransformFromCopy(T0[2], T0[5]), run=0.45)
        self.go("1:18:58.52", *morph(T0, T1, ids(4) + [(4, 5), (5, 4)], arc=(5,)), run=0.75)
        self.go("1:18:59.40", *morph(T1, T2, ids(6)), run=0.5)
        self.go("1:19:00.24", *morph(T2, T3, ids(7)), run=0.4)
        self.go("1:19:00.94", T3[4:].animate.set_color(PINK), run=0.4)
        U0 = st(D, "x", "^{10}", "=", "x", "^{10}", x=X, y=Y2, c={5: YEL})
        U1 = st(D, "x", "^{10}", "=", "10", "x", x=X, y=Y2, c={4: YEL})
        U2 = st(D, "x", "^{10}", "=", "10", "x", "^{9}", x=X, y=Y2, c={4: PINK, 5: PINK, 6: PINK})
        self.go("1:19:02.78", Write(U0[0]), run=0.5)
        self.go("1:19:03.40", Write(U0[1:3]), run=0.4)
        self.go("1:19:03.86", Write(U0[3]), TransformFromCopy(U0[1], U0[4]), TransformFromCopy(U0[2], U0[5]), run=0.4)
        self.go("1:19:04.38", *morph(U0, U1, ids(4) + [(4, 5), (5, 4)], arc=(5,)), run=0.7)
        self.go("1:19:05.20", *morph(U1, U2, ids(6)), run=0.45)


class K13_JustX(Shot):
    def body(self):
        self.title("The Power Rule", animate=False)
        X, Y = -3.5, 0.9
        V0 = st(D, "x", "=", "x", "^{1}", eq=2, x=X, y=Y, c={4: YEL})
        V1 = st(D, "x", "=", "1", r"\cdot", "x", eq=2, x=X, y=Y, c={3: YEL})
        V2 = st(D, "x", "=", "1", r"\cdot", "x", "^{0}", eq=2, x=X, y=Y, c={3: YEL, 6: YEL})
        V3 = st(D, "x", "=", "1", r"\cdot", "x", "^{0}", "=", "1", eq=2, x=X, y=Y, c={3: YEL, 6: YEL, 8: PINK})
        self.go("1:19:07.04", Write(V0[0]), run=0.5)
        self.go("1:19:07.88", Write(V0[1]), run=0.35)
        self.go("1:19:08.60", Write(V0[2]), TransformFromCopy(V0[1], V0[3]), run=0.5)
        self.go("1:19:09.32", Write(V0[4]), run=0.4)
        self.go("1:19:09.80", *morph(V0, V1, ids(3) + [(3, 5), (4, 3)], arc=(4,)), run=0.8)
        self.go("1:19:11.50", *morph(V1, V2, ids(6)), run=0.4)
        z = M(r"(\text{anything})^{0}", "=", "1", size=56, color=YEL).move_to([-3.0, -1.1, 0])
        self.go("1:19:12.66", Write(z[0]), run=0.6)
        self.go("1:19:13.60", Write(z[1:]), run=0.4)
        self.go("1:19:15.70", *morph(V2, V3, ids(7)), run=0.45)
        ab = answer_box(V3[8])
        self.play(Create(ab), run_time=0.4)
        # y = x has slope 1 everywhere
        ax = axes((-1, 4, 1), (-1, 4, 1), x_length=4.6, y_length=4.4, center=(3.5, -0.9, 0))
        self.go("1:19:18.42", Create(ax), FadeIn(ax.labels), run=0.5)
        ln = curve(ax, lambda x: x, [-0.8, 3.7])
        lab = M("y=x", size=48, color=BLUE).next_to(ax.c2p(3.7, 3.7), UP, buff=0.12)
        self.go("1:19:19.00", draw(ln, 0.6, BLUE), FadeIn(lab), run=0.6)
        xt = ValueTracker(0.4)
        live = live_tangent(ax, lambda x: x, xt, length=2.0, readout_pos=ax.c2p(1.25, 3.35), size=42)
        self.go("1:19:19.70", FadeIn(live), run=0.3)
        self.go("1:19:20.24", xt.animate.set_value(2.6), run=1.3)


# ================================================================ where it comes from

class K13_WhyPower(Shot):
    def body(self):
        self.title("Why It Works", "1:19:21.80")
        EQ = -2.4
        r1 = st("(x+h)^3", "=", "x^3", "+", "3x^2h", "+", "3x", "h^2", "+", "h^3", eq=1, x=EQ, y=1.45, size=60)
        r1[5:].set_color(DIM)
        self.go("1:19:26.74", Write(r1[0]), run=0.9)
        self.go("1:19:29.10", Write(r1[1:3]), run=0.6)
        self.go("1:19:30.02", Write(r1[3:5]), run=0.8)
        self.go("1:19:32.02", Write(r1[5:]), run=0.9)
        self.go("1:19:34.18", r1[7].animate.set_color(YEL), r1[9].animate.set_color(YEL), run=0.4)
        k = strike(r1[2])
        self.go("1:19:36.58", Create(k), run=0.4)
        mx = M("-x^3", size=48, color=RED).next_to(r1[2], UP, buff=0.18)
        self.play(FadeIn(mx, shift=DOWN * 0.1), run_time=0.3)
        r2 = st(r"\frac{(x+h)^3-x^3}{h}", "=", "3x^2", "+", "3x", "h", "+", "h^2", eq=1, x=EQ, y=-0.35, size=60)
        r2[3:].set_color(DIM)
        self.go("1:19:37.88", Write(r2[0:2]), run=0.8)
        self.go("1:19:39.94", TransformFromCopy(r1[4], r2[2]), run=0.6)
        self.go("1:19:40.82", TransformFromCopy(VGroup(*r1[5:]), VGroup(*r2[3:])), run=0.7)
        self.go("1:19:42.22", r2[5].animate.set_color(YEL), r2[7].animate.set_color(YEL), run=0.4)
        h0 = M(r"h\to 0", size=54, color=YEL).next_to(r2, RIGHT, buff=0.8)
        self.go("1:19:44.24", Write(h0), run=0.5)
        self.go("1:19:45.94", *[FadeOut(m, shift=DOWN * 0.25, scale=0.6) for m in r2[3:]], run=0.7)
        r3 = st(D, "x^3", "=", "3x^2", eq=2, x=EQ, y=-2.3, size=64)
        r3[3].set_color(PINK)
        self.go("1:19:48.04", Write(r3[0:3]), TransformFromCopy(r2[2], r3[3]), run=0.7)
        self.play(Create(answer_box(r3[3])), run_time=0.4)
        self.wipe("1:19:50.22", run=0.4)
        g1 = st("(x+h)^n", "=", "x^n", "+", "nx^{n-1}", "h", "+", r"h^2(\dots)", eq=1, x=-2.6, y=0.9, size=62)
        g1[6:].set_color(DIM)
        self.go("1:19:50.62", Write(g1[0:3]), run=0.7)
        self.go("1:19:51.40", Write(g1[3:6]), run=0.6)
        self.play(Write(g1[6:]), run_time=0.4)
        bx = SurroundingRectangle(g1[4], color=PINK, buff=0.12, stroke_width=4, corner_radius=0.08)
        self.go("1:19:53.08", Create(bx), run=0.45)
        g2 = st(D, "x^n", "=", "nx^{n-1}", eq=2, x=-0.6, y=-1.5, size=72)
        g2[3].set_color(PINK)
        self.go("1:19:53.60", Write(g2[0:3]), run=0.5)
        self.go("1:19:54.16", TransformFromCopy(g1[4], g2[3]), run=0.8)
        self.go("1:19:56.12", Create(answer_box(g2[3])), run=0.5)


# ================================================================ negative and fractional powers

class K13_NegPower(Shot):
    def body(self):
        self.title("Beyond Whole Numbers", "1:19:58.44")
        wh = M("x^2", ",", "x^3", ",", "x^{10}", size=64, color=DIM).move_to([0, 1.5, 0])
        self.go("1:20:00.88", Write(wh), run=0.6)
        a = M("x^{-3}", size=90, color=ORG).move_to([-2.6, -0.2, 0])
        b = M("x^{1/2}", size=90, color=ORG).move_to([2.6, -0.2, 0])
        self.go("1:20:02.64", Write(a), run=0.6)
        self.go("1:20:03.80", Write(b), run=0.6)
        rw = pill("rewrite as a power first", YEL, size=46).move_to([0, -2.2, 0])
        self.go("1:20:06.24", FadeIn(rw, shift=UP * 0.15), run=0.5)
        self.wipe("1:20:08.30", run=0.4)
        X = -1.5
        r1 = st(r"\frac{1}{x^3}", "=", "x", "^{-3}", eq=1, x=X, y=1.35, size=72)
        r1[3][0].set_color(YEL)
        self.go("1:20:08.92", Write(r1[0]), run=0.7)
        self.go("1:20:10.64", Write(r1[1]), run=0.3)
        self.go("1:20:11.10", TransformFromCopy(r1[0][2], r1[2]), TransformFromCopy(r1[0][3], r1[3][1], path_arc=-0.4 * PI), run=0.8)
        self.go("1:20:12.10", Write(r1[3][0]), run=0.3)
        Y = -0.45
        P0 = st(D, "x", "^{-3}", "=", "x", "^{-3}", x=X, y=Y, size=72, c={5: YEL})
        P1 = st(D, "x", "^{-3}", "=", "-3", "x", x=X, y=Y, size=72, c={4: YEL})
        P2 = st(D, "x", "^{-3}", "=", "-3", "x", "^{-3-1}", x=X, y=Y, size=72, c={4: YEL}); P2[6][2:].set_color(YEL)
        P3 = st(D, "x", "^{-3}", "=", "-3", "x", "^{-4}", x=X, y=Y, size=72, c={4: YEL, 6: YEL})
        P4 = st(D, "x", "^{-3}", "=", "-3", "x", "^{-4}", "=", r"-\frac{3}{x^4}", x=X, y=Y, size=72,
                c={4: PINK, 5: PINK, 6: PINK, 8: PINK})
        self.go("1:20:12.50", Write(P0[0]), TransformFromCopy(r1[2], P0[1]), TransformFromCopy(r1[3], P0[2]), run=0.5)
        self.play(Write(P0[3]), TransformFromCopy(P0[1], P0[4]), TransformFromCopy(P0[2], P0[5]), run_time=0.4)
        self.go("1:20:13.82", *morph(P0, P1, ids(4) + [(4, 5), (5, 4)], arc=(5,)), run=0.8)
        self.go("1:20:15.08", *morph(P1, P2, ids(6)), run=0.6)
        # one less than -3: step left on the number line
        nl = number_line((-6, 2, 1), length=8.5, center=(0, -2.75, 0), size=36)
        self.go("1:20:16.82", Create(nl), FadeIn(nl.labels), run=0.5)
        d = Dot(nl.n2p(-3), radius=0.12, color=ORG).set_z_index(3)
        self.go("1:20:18.42", FadeIn(d, scale=0.5), run=0.3)
        hop = CurvedArrow(nl.n2p(-3) + UP * 0.25, nl.n2p(-4) + UP * 0.25, angle=PI / 2, color=YEL, stroke_width=3, tip_length=0.15)
        m1 = M("-1", size=44, color=YEL).next_to(hop, UP, buff=0.08)
        self.go("1:20:18.80", Create(hop), FadeIn(m1), d.animate(path_arc=PI * 0.8).move_to(nl.n2p(-4)), run=0.7)
        self.go("1:20:19.70", *morph(P2, P3, ids(7)), run=0.5)
        self.go("1:20:20.76", P3[4:].animate.set_color(PINK), run=0.4)
        self.go("1:20:23.40", FadeOut(VGroup(nl, nl.labels, d, hop, m1)), run=0.4)
        self.go("1:20:25.06", *morph(P3, P4, ids(7)), run=0.8)
        self.go("1:20:26.60", Create(answer_box(P4[8])), run=0.4)


class K13_CheckRecip(Shot):
    def body(self):
        self.title("Beyond Whole Numbers", animate=False)
        self.title("A Quick Check", "1:20:28.12")
        ax = axes((0, 4, 1), (0, 4, 1), x_length=5.0, y_length=4.4, center=(3.7, -0.95, 0))
        f = lambda x: 1 / x
        cv = curve(ax, f, [0.25, 3.9])
        self.go("1:20:28.80", Create(ax), FadeIn(ax.labels), run=0.6)
        lab = M(r"y=\frac{1}{x}", size=50, color=BLUE).move_to(ax.c2p(2.95, 1.3))
        self.go("1:20:29.50", draw(cv, 0.9, BLUE), FadeIn(lab), run=0.9)
        X = -3.1
        q1 = st(r"\frac{1}{x}", "=", "x", "^{-1}", eq=1, x=X, y=1.3, size=68)
        self.go("1:20:31.08", Write(q1[0]), run=0.5)
        self.go("1:20:31.96", Write(q1[1:]), run=0.6)
        Y = -0.45
        Q0 = st(D, "x", "^{-1}", "=", "x", "^{-1}", x=X, y=Y, size=68, c={5: YEL})
        Q1 = st(D, "x", "^{-1}", "=", "-1", "x", x=X, y=Y, size=68, c={4: YEL})
        Q2 = st(D, "x", "^{-1}", "=", "-1", "x", "^{-2}", x=X, y=Y, size=68, c={4: PINK, 5: PINK, 6: PINK})
        self.go("1:20:33.20", Write(Q0[0]), TransformFromCopy(q1[2], Q0[1]), TransformFromCopy(q1[3], Q0[2]), run=0.5)
        self.play(Write(Q0[3]), TransformFromCopy(Q0[1], Q0[4]), TransformFromCopy(Q0[2], Q0[5]), run_time=0.4)
        self.go("1:20:35.08", *morph(Q0, Q1, ids(4) + [(4, 5), (5, 4)], arc=(5,)), run=0.8)
        self.go("1:20:36.90", *morph(Q1, Q2, ids(6)), run=0.5)
        q3 = st("=", r"-\frac{1}{x^2}", eq=0, x=X, y=-2.25, size=68)
        q3[1].set_color(PINK)
        self.go("1:20:38.70", Write(q3), run=0.7)
        # the tangent's own slope against -1/x^2
        xt = ValueTracker(2.0)
        tl = VGroup(always_redraw(lambda: tangent(ax, f, xt.get_value(), 2.4)),
                    always_redraw(lambda: pt(ax, xt.get_value(), f(xt.get_value()), PINK)))
        ro1 = readout(r"\text{slope} =", lambda: slope(f, xt.get_value()), ax.c2p(2.55, 3.45), size=44)
        ro2 = readout(r"-\frac{1}{x^2} =", lambda: -1 / xt.get_value() ** 2, ax.c2p(2.55, 2.45), size=44)
        ro2[0].shift(RIGHT * (ro1[0].get_right()[0] - ro2[0].get_right()[0]))
        self.go("1:20:39.70", FadeIn(tl), FadeIn(ro1), FadeIn(ro2), run=0.4)
        self.go("1:20:40.88", xt.animate.set_value(0.5), run=1.6)
        self.play(xt.animate.set_value(1.0), run_time=0.6)
        tk = tick_mark(s=0.5).next_to(q3, RIGHT, buff=0.4)
        self.go("1:20:43.12", Create(tk), run=0.4)


class K13_Root(Shot):
    def body(self):
        self.title("Square Root", "1:20:44.76")
        X = -2.6
        s1 = st(r"\sqrt{x}", "=", "x", "^{1/2}", eq=1, x=X, y=1.4, size=72, c={3: YEL})
        self.go("1:20:45.20", Write(s1[0]), run=0.6)
        self.go("1:20:46.52", Write(s1[1]), TransformFromCopy(s1[0][-1], s1[2]), run=0.5)
        self.go("1:20:47.74", Write(s1[3]), run=0.5)
        Y = -0.45
        W0 = st(D, "x", "^{1/2}", "=", "x", "^{1/2}", x=X, y=Y, size=72, c={5: YEL})
        W1 = st(D, "x", "^{1/2}", "=", r"\frac{1}{2}", "x", x=X, y=Y, size=72, c={4: YEL})
        W2 = st(D, "x", "^{1/2}", "=", r"\frac{1}{2}", "x", "^{1/2-1}", x=X, y=Y, size=72, c={4: YEL}); W2[6][3:].set_color(YEL)
        W3 = st(D, "x", "^{1/2}", "=", r"\frac{1}{2}", "x", "^{-1/2}", x=X, y=Y, size=72, c={4: YEL, 6: YEL})
        W4 = st(D, "x", "^{1/2}", "=", r"\frac{1}{2}", "x", "^{-1/2}", "=", r"\frac{1}{2\sqrt{x}}", x=X, y=Y, size=72,
                c={4: PINK, 5: PINK, 6: PINK, 8: PINK})
        self.go("1:20:48.30", Write(W0[0]), TransformFromCopy(s1[2], W0[1]), TransformFromCopy(s1[3], W0[2]), run=0.4)
        self.play(Write(W0[3]), TransformFromCopy(W0[1], W0[4]), TransformFromCopy(W0[2], W0[5]), run_time=0.4)
        self.go("1:20:49.38", *morph(W0, W1, ids(4) + [(4, 5), (5, 4)], arc=(5,)), run=0.9)
        self.go("1:20:50.82", *morph(W1, W2, ids(6)), run=0.6)
        self.go("1:20:52.48", *morph(W2, W3, ids(7)), run=0.5)
        self.go("1:20:53.48", *[W3[i].animate.set_color(PINK) for i in (4, 5, 6)], run=0.4)
        side = st("x^{-1/2}", "=", r"\frac{1}{\sqrt{x}}", eq=1, x=X, y=-2.55, size=62)
        side.set_color(YEL)
        self.go("1:20:56.98", Write(side[0]), run=0.5)
        self.go("1:20:58.64", Write(side[1:]), run=0.7)
        self.go("1:21:00.56", *morph(W3, W4, ids(7)), run=0.8)
        self.play(Create(answer_box(W4[8])), run_time=0.4)
        ok = VGroup(tick_mark(s=0.5), H("matches the definition", 38, GRN)).arrange(RIGHT, buff=0.3)
        ok.move_to([3.7, -2.55, 0])
        self.go("1:21:03.74", Create(ok[0]), FadeIn(ok[1], shift=UP * 0.1), run=0.5)
        self.go("1:21:07.50", Circumscribe(W4[4:7], color=PINK, buff=0.1), run=0.9)


class K13_CubeRoot(Shot):
    def body(self):
        self.title("Cube Root", "1:21:09.82")
        X = -2.6
        c1 = st(r"\sqrt[3]{x^2}", "=", "x", "^{2/3}", eq=1, x=X, y=1.4, size=72)
        self.go("1:21:10.40", Write(c1[0]), run=0.8)
        rt = c1[0]
        self.go("1:21:11.90", Write(c1[1]), TransformFromCopy(rt[3], c1[2]),
                TransformFromCopy(rt[4], c1[3][0]), TransformFromCopy(rt[0], c1[3][2], path_arc=-0.5 * PI), run=0.9)
        self.play(Write(c1[3][1]), c1[3].animate.set_color(YEL), run_time=0.4)
        Y = -0.45
        X0 = st(D, "x", "^{2/3}", "=", "x", "^{2/3}", x=X, y=Y, size=72, c={5: YEL})
        X1 = st(D, "x", "^{2/3}", "=", r"\frac{2}{3}", "x", x=X, y=Y, size=72, c={4: YEL})
        X2 = st(D, "x", "^{2/3}", "=", r"\frac{2}{3}", "x", "^{2/3-1}", x=X, y=Y, size=72, c={4: YEL}); X2[6][3:].set_color(YEL)
        X3 = st(D, "x", "^{2/3}", "=", r"\frac{2}{3}", "x", "^{-1/3}", x=X, y=Y, size=72, c={4: YEL, 6: YEL})
        self.go("1:21:13.40", Write(X0[0]), TransformFromCopy(c1[2], X0[1]), TransformFromCopy(c1[3], X0[2]), run=0.4)
        self.play(Write(X0[3]), TransformFromCopy(X0[1], X0[4]), TransformFromCopy(X0[2], X0[5]), run_time=0.4)
        self.go("1:21:14.32", *morph(X0, X1, ids(4) + [(4, 5), (5, 4)], arc=(5,)), run=0.9)
        self.go("1:21:16.12", *morph(X1, X2, ids(6)), run=0.6)
        self.go("1:21:17.92", *morph(X2, X3, ids(7)), run=0.5)
        self.go("1:21:19.80", *[X3[i].animate.set_color(PINK) for i in (4, 5, 6)], run=0.4)
        self.play(Create(answer_box(VGroup(X3[4], X3[5], X3[6]))), run_time=0.4)
        # the skill: rewrite first
        self.wipe("1:21:23.04", run=0.4)
        self.title("Rewrite First", "1:21:23.56")
        a = st(r"\sqrt[n]{x^m}", "=", "x^{m/n}", eq=1, x=0.0, y=1.2, size=68)
        b = st(r"\frac{1}{x^n}", "=", "x^{-n}", eq=1, x=0.0, y=-0.4, size=68)
        a[2].set_color(YEL); b[2].set_color(YEL)
        self.go("1:21:27.22", Write(a), run=0.8)
        self.go("1:21:29.54", Write(b), run=0.8)
        pr = M(D, "x^{n}", "=", "nx^{n-1}", size=58).move_to([0, -2.55, 0])
        pr[3].set_color(PINK)
        fr = panel(pr, PURP, buff=0.25)
        self.go("1:21:32.20", Write(pr), Create(fr), run=0.8)


# ================================================================ constant multiple, sum rule

class K13_ConstMultiple(Shot):
    def body(self):
        self.title("Two More Rules", "1:21:33.82")
        p1 = pill("constant multiple", YEL, size=50).move_to([0, 1.0, 0])
        p2 = pill("sum and difference", YEL, size=50).move_to([0, -0.4, 0])
        self.go("1:21:34.35", FadeIn(p1, shift=UP * 0.12), run=0.4)
        self.play(FadeIn(p2, shift=UP * 0.12), run_time=0.4)
        poly = M("4x^3-5x^2+7x-2", size=64, color=BLUE).move_to([0, -2.3, 0])
        self.go("1:21:35.90", Write(poly), run=0.8)
        self.wipe("1:21:37.30", run=0.3)
        self.title("Constant Multiple Rule", "1:21:37.68")
        k = M(D, "[", "c", r"\,f(x)", "]", "=", "c", r"\,f'(x)", size=68).move_to([0, 1.75, 0])
        k[2].set_color(ORG); k[6].set_color(ORG); k[7].set_color(PINK)
        self.go("1:21:39.64", Write(k[0:5]), run=0.9)
        self.go("1:21:41.78", Write(k[5]), TransformFromCopy(k[2], k[6], path_arc=-0.45 * PI), run=0.8)
        self.go("1:21:42.70", Write(k[7]), run=0.5)
        X = -1.5
        L1 = st(D, "5", "x^3", "=", "5", r"\cdot", D, "x^3", x=X, y=-0.6, size=66, c={1: ORG, 4: ORG})
        L2 = st("=", "5", r"\cdot", "3x^2", eq=0, x=X, y=-2.0, size=66, c={1: ORG})
        L3 = st("=", "15x^2", eq=0, x=X, y=-3.15, size=66, c={1: PINK})
        self.go("1:21:43.90", Write(L1[0:3]), run=0.7)
        self.go("1:21:45.50", Write(L1[3]), TransformFromCopy(L1[1], L1[4], path_arc=-0.45 * PI), run=0.6)
        self.go("1:21:46.20", Write(L1[5:]), run=0.8)
        self.go("1:21:48.28", Write(L2[0]), TransformFromCopy(L1[4], L2[1]), Write(L2[2]), run=0.5)
        self.go("1:21:48.88", Write(L2[3]), run=0.5)
        self.go("1:21:50.18", Write(L3), run=0.5)
        self.play(Create(answer_box(L3[1])), run_time=0.4)


class K13_SumPoly(Shot):
    def body(self):
        self.title("Sum and Difference Rule", "1:21:51.94")
        sr = M(D, "[f+g]", "=", "f'", "+", "g'", size=70).move_to([0, 0.6, 0])
        sr[3].set_color(PINK); sr[5].set_color(PINK)
        self.go("1:21:53.42", Write(sr[0:2]), run=0.7)
        self.go("1:21:54.76", Write(sr[2:]), run=0.6)
        sd = M(D, "[f-g]", "=", "f'", "-", "g'", size=56, color=DIM).move_to([0, -1.4, 0])
        self.play(FadeIn(sd, shift=UP * 0.1), run_time=0.4)
        ul = under(VGroup(sr[3], sr[4], sr[5]))
        self.go("1:21:56.88", Create(ul), run=0.5)
        self.go("1:21:58.60", FadeOut(VGroup(sr, sd, ul)), run=0.35)
        P = st("f(x)", "=", "4x^3", "-5x^2", "+7x", "-2", eq=1, x=-3.6, y=1.3, size=68, c={0: BLUE})
        self.go("1:21:59.54", Write(P[0:2]), run=0.5)
        for t, i in (("1:22:00.76", 2), ("1:22:01.84", 3), ("1:22:03.46", 4), ("1:22:04.60", 5)):
            self.go(t, Write(P[i]), run=0.45)
        dt = [M(s, size=68, color=PINK) for s in ("12x^2", "-10x", "+7", "+0")]
        dt[3].set_color(DIM)
        arrs = []
        for i, d in enumerate(dt):
            d.move_to([P[i + 2].get_x(), -0.55, 0])
            arrs.append(Arrow(P[i + 2].get_bottom() + DOWN * 0.12, d.get_top() + UP * 0.12, buff=0, color=DIM,
                              stroke_width=3, tip_length=0.15, max_tip_length_to_length_ratio=0.3))
        self.go("1:22:06.98", GrowArrow(arrs[0]), TransformFromCopy(P[2], dt[0]), run=0.7)
        self.go("1:22:10.36", GrowArrow(arrs[1]), TransformFromCopy(P[3], dt[1]), run=0.7)
        self.go("1:22:13.28", GrowArrow(arrs[2]), TransformFromCopy(P[4], dt[2]), run=0.6)
        self.go("1:22:15.82", P[5].animate.set_color(ORG), run=0.4)
        self.go("1:22:16.70", GrowArrow(arrs[3]), TransformFromCopy(P[5], dt[3]), run=0.5)
        F = st("f'(x)", "=", "12x^2", "-10x", "+7", eq=1, x=-3.6, y=-2.45, size=68, c={0: PINK, 2: PINK, 3: PINK, 4: PINK})
        self.go("1:22:18.40", Write(F[0:2]), run=0.5)
        self.go("1:22:20.08", TransformFromCopy(dt[0], F[2]), run=0.5)
        self.go("1:22:21.32", TransformFromCopy(dt[1], F[3]), run=0.5)
        self.go("1:22:22.80", TransformFromCopy(dt[2], F[4]), FadeOut(dt[3]), FadeOut(arrs[3]), run=0.5)
        self.play(Create(answer_box(VGroup(*F[2:]))), run_time=0.4)
        pg = VGroup(*[page(1.5, 1.95, seed=5 + k).move_to([5.0 - 0.18 * k, -0.2 + 0.15 * k, 0]).set_z_index(-k) for k in range(3)])
        pl = H("definition", 36, DIM).next_to(pg, DOWN, buff=0.2)
        self.go("1:22:26.32", FadeIn(pg, shift=LEFT * 0.15), FadeIn(pl), run=0.5)


# ================================================================ rewrite before differentiating

class K13_Split(Shot):
    def body(self):
        self.title("Rewrite First", "1:22:29.82")
        X = -3.0
        a1 = st("f(x)", "=", r"\frac{x^2+3}{x}", eq=1, x=X, y=1.25, size=70, c={0: BLUE})
        self.go("1:22:33.42", Write(a1[0:2]), run=0.5)
        self.go("1:22:34.72", Write(a1[2][0:4]), run=0.7)
        self.go("1:22:36.52", Write(a1[2][4:]), run=0.4)
        dv = H("a division rule?", 44, DIM).move_to([3.4, 1.25, 0])
        self.go("1:22:39.56", FadeIn(dv, shift=UP * 0.1), run=0.4)
        sk = strike(dv)
        self.go("1:22:41.26", Create(sk), run=0.4)
        a2 = st("=", r"\frac{x^2}{x}", "+", r"\frac{3}{x}", eq=0, x=X, y=-0.45, size=70)
        f = a1[2]
        self.go("1:22:42.22", FadeOut(dv), FadeOut(sk), Write(a2[0]),
                *[TransformFromCopy(f[i], a2[1][j]) for i, j in ((0, 0), (1, 1), (4, 2), (5, 3))],
                TransformFromCopy(f[2], a2[2][0]),
                *[TransformFromCopy(f[i], a2[3][j]) for i, j in ((3, 0), (4, 1), (5, 2))], run=0.9)
        a3 = st("=", "x", "+", "3x^{-1}", eq=0, x=X, y=-2.1, size=70)
        self.go("1:22:44.40", Write(a3[0]), TransformFromCopy(a2[1], a3[1]), run=0.6)
        self.go("1:22:46.20", Write(a3[2]), TransformFromCopy(a2[3], a3[3]), run=0.7)
        self.go("1:22:48.32", Circumscribe(VGroup(a3[1], a3[2], a3[3]), color=YEL, buff=0.12), run=0.9)
        # now differentiate term by term
        b1 = st("f(x)", "=", "x", "+", "3x", "^{-1}", eq=1, x=X, y=1.25, size=70, c={0: BLUE})
        self.go("1:22:51.72", FadeOut(VGroup(a1, a2)), FadeOut(a3[0]), FadeIn(b1[0:2]),
                ReplacementTransform(VGroup(a3[1], a3[2], a3[3]), VGroup(b1[2], b1[3], b1[4], b1[5])), run=0.7)
        Y = -0.8
        Z0 = st("f'(x)", "=", "1", "+", "3x", "^{-1}", eq=1, x=X, y=Y, size=70, c={0: PINK, 2: PINK, 5: YEL})
        Z1 = st("f'(x)", "=", "1", "+", "(-1)", r"\cdot", "3x", eq=1, x=X, y=Y, size=70, c={0: PINK, 2: PINK, 4: YEL})
        Z2 = st("f'(x)", "=", "1", "-", "3x", eq=1, x=X, y=Y, size=70, c={0: PINK, 2: PINK})
        Z3 = st("f'(x)", "=", "1", "-", "3x", "^{-2}", eq=1, x=X, y=Y, size=70, c={0: PINK, 2: PINK, 5: YEL})
        Z4 = st("f'(x)", "=", "1", "-", r"\frac{3}{x^2}", eq=1, x=X, y=Y, size=70, c={0: PINK, 2: PINK, 3: PINK, 4: PINK})
        self.go("1:22:52.92", Write(Z0[0:2]), run=0.5)
        self.go("1:22:53.70", TransformFromCopy(b1[2], Z0[2]), run=0.5)
        self.go("1:22:55.00", TransformFromCopy(VGroup(b1[3], b1[4], b1[5]), VGroup(Z0[3], Z0[4], Z0[5])), run=0.6)
        self.go("1:22:56.50", *morph(Z0, Z1, ids(4) + [(4, 6), (5, 4)], arc=(5,)), run=0.8)
        self.go("1:22:57.66", *morph(Z1, Z2, ids(3) + [(4, 3), (6, 4)]), run=0.6)
        self.go("1:22:58.70", *morph(Z2, Z3, ids(5)), run=0.4)
        self.go("1:23:01.70", ReplacementTransform(VGroup(Z3[4], Z3[5]), Z4[4]),
                *morph(Z3, Z4, ids(4), new=False, fade=False), run=0.7)
        self.play(Create(answer_box(VGroup(*Z4[2:]))), run_time=0.4)


class K13_Another(Shot):
    def body(self):
        self.title("Another One", "1:23:03.96")
        X = -3.2
        n1 = st("f(x)", "=", r"\frac{3}{x^2}", "+", r"2\sqrt{x}", eq=1, x=X, y=1.45, size=70, c={0: BLUE})
        self.go("1:23:05.00", Write(n1[0:2]), run=0.5)
        self.go("1:23:05.88", Write(n1[2]), run=0.6)
        self.go("1:23:07.08", Write(n1[3:]), run=0.6)
        n2 = st("=", "3x", "^{-2}", "+", "2x", "^{1/2}", eq=0, x=X, y=0.1, size=70)
        self.go("1:23:09.70", Write(n2[0]), TransformFromCopy(n1[2], VGroup(n2[1], n2[2])), run=0.7)
        self.go("1:23:11.48", Write(n2[3]), TransformFromCopy(n1[4], VGroup(n2[4], n2[5])), run=0.7)
        Y = -1.3
        N0 = st("f'(x)", "=", "3x", "^{-2}", eq=1, x=X, y=Y, c={0: PINK, 3: YEL})
        N1 = st("f'(x)", "=", "(-2)", r"\cdot", "3x", eq=1, x=X, y=Y, c={0: PINK, 2: YEL})
        N2 = st("f'(x)", "=", "-6x", eq=1, x=X, y=Y, c={0: PINK, 2: YEL})
        N3 = st("f'(x)", "=", "-6x", "^{-3}", eq=1, x=X, y=Y, c={0: PINK, 2: YEL, 3: YEL})
        N4 = st("f'(x)", "=", "-6x", "^{-3}", "+", "2x", "^{1/2}", eq=1, x=X, y=Y, c={0: PINK, 2: PINK, 3: PINK, 6: YEL})
        N5 = st("f'(x)", "=", "-6x", "^{-3}", "+", r"\frac{1}{2}", r"\cdot", "2x", eq=1, x=X, y=Y,
                c={0: PINK, 2: PINK, 3: PINK, 5: YEL})
        N6 = st("f'(x)", "=", "-6x", "^{-3}", "+", "1", "x", eq=1, x=X, y=Y, c={0: PINK, 2: PINK, 3: PINK, 5: YEL})
        N7 = st("f'(x)", "=", "-6x", "^{-3}", "+", "1", "x", "^{-1/2}", eq=1, x=X, y=Y,
                c={0: PINK, 2: PINK, 3: PINK, 5: YEL, 7: YEL})
        N8 = st("f'(x)", "=", "-6x", "^{-3}", "+", "x", "^{-1/2}", eq=1, x=X, y=Y, c={i: PINK for i in (0, 2, 3, 4, 5, 6)})
        self.go("1:23:14.56", Write(N0[0:2]), TransformFromCopy(VGroup(n2[1], n2[2]), VGroup(N0[2], N0[3])), run=0.6)
        self.go("1:23:15.88", *morph(N0, N1, ids(2) + [(2, 4), (3, 2)], arc=(3,)), run=0.8)
        self.go("1:23:17.32", Circumscribe(VGroup(N1[2], N1[3], N1[4][0]), color=YEL, buff=0.08), run=0.7)
        self.go("1:23:18.42", ReplacementTransform(VGroup(N1[2], N1[3], N1[4]), N2[2]), *morph(N1, N2, ids(2), new=False, fade=False), run=0.6)
        self.go("1:23:20.30", *morph(N2, N3, ids(3)), run=0.5)
        self.go("1:23:22.30", *[N3[i].animate.set_color(PINK) for i in (2, 3)], run=0.4)
        self.go("1:23:25.46", *morph(N3, N4, ids(4), new=False), Write(N4[4]),
                TransformFromCopy(VGroup(n2[4], n2[5]), VGroup(N4[5], N4[6])), run=0.6)
        self.go("1:23:26.80", *morph(N4, N5, ids(5) + [(5, 7), (6, 5)], arc=(6,)), run=0.8)
        self.go("1:23:28.70", ReplacementTransform(VGroup(N5[5], N5[6], N5[7][0]), N6[5]),
                ReplacementTransform(N5[7][1], N6[6]), *morph(N5, N6, ids(5), new=False, fade=False), run=0.6)
        self.go("1:23:30.32", *morph(N6, N7, ids(7)), run=0.5)
        self.go("1:23:32.46", *morph(N7, N8, ids(5) + [(6, 5), (7, 6)]), run=0.5)
        n4 = st("=", r"-\frac{6}{x^3}", "+", r"\frac{1}{\sqrt{x}}", eq=0, x=X, y=-2.75, size=70)
        n4[1:].set_color(PINK)
        self.go("1:23:37.04", Write(n4[0:2]), run=0.6)
        self.go("1:23:38.76", Write(n4[2:]), run=0.6)
        self.play(Create(answer_box(VGroup(*n4[1:]))), run_time=0.35)
        self.wipe("1:23:40.12", run=0.35)


class K13_ExpIntro(Shot):
    def body(self):
        self.title("Another One", animate=False)
        self.title("The Exponential", "1:23:41.56")
        e = M("e", r"\approx", "2.718", size=72).move_to([0, 1.2, 0])
        e[0].set_color(YEL); e[2].set_color(ORG)
        self.go("1:23:43.80", Write(e), run=0.6)
        ex = M(D, "e^x", "=", "e^x", size=96).move_to([0, -1.1, 0])
        ex[1].set_color(BLUE); ex[3].set_color(PINK)
        self.go("1:23:46.48", Write(ex[0:2]), run=0.8)
        self.go("1:23:48.00", Write(ex[2]), TransformFromCopy(ex[1], ex[3], path_arc=-0.4 * PI), run=0.7)
        self.go("1:23:49.88", Create(under(ex[1])), Create(under(ex[3])), run=0.5)
