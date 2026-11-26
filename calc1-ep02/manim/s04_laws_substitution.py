"""Builder 04: limit laws (panel of six rules, split-and-rejoin example), direct substitution
(smooth graph, polynomials / fractions, two worked examples, step 1), the 0/0 puzzle (locked chest, three keys)."""
from common import *


def arrow(p, q, color=DIM, w=4):
    return Arrow(np.array(p, float), np.array(q, float), buff=0, stroke_width=w, tip_length=0.22, color=color,
                 max_stroke_width_to_length_ratio=20, max_tip_length_to_length_ratio=0.4)


# ================================================================ Part 6: limit laws

LAWS = [  # (label, tex parts) ; parts: lhs..., "=", rhs...
    ("sum", [r"\lim_{x\to a}", "[f+g]", "=", "L+M"]),
    ("difference", [r"\lim_{x\to a}", "[f-g]", "=", "L-M"]),
    ("constant multiple", [r"\lim_{x\to a}", "[", "c", r"\,f]", "=", "c", r"\,L"]),
    ("product", [r"\lim_{x\to a}", r"[f\cdot g]", "=", r"L\cdot M"]),
    ("quotient", [r"\lim_{x\to a}", r"\frac{f}{g}", "=", r"\frac{L}{M}"]),
    ("power", [r"\lim_{x\to a}", "[f]^n", "=", "L^n"]),
]


def laws_board():
    """The assumption line, the panel and the six rows (label, maths, index of '=')."""
    a1 = M(r"\lim_{x\to a} f(x)", "=", "L", size=52)
    a2 = M(r"\lim_{x\to a} g(x)", "=", "M", size=52)
    a1[2].set_color(YEL); a2[2].set_color(YEL)
    VGroup(a1, a2).arrange(RIGHT, buff=1.4).move_to([0, 1.85, 0])
    pan = RoundedRectangle(width=13.5, height=4.45, corner_radius=0.3, stroke_color=PURP, stroke_width=4).move_to([0, -1.1, 0])
    rows = []
    for k, (lab, parts) in enumerate(LAWS):
        m = M(*parts, size=48)
        eq = parts.index("=")
        for p in m[eq + 1:]:
            p.set_color(YEL)
        if lab.startswith("constant"):
            m[5].set_color(CHALK)
        m.move_to([(-4.5, 0, 4.5)[k % 3], (-0.25, -2.0)[k // 3], 0])
        # a leading "|" gives every label the same box, so labels in a row share one baseline; then drop it
        t = H("|" + lab, 34, DIM).move_to([m.get_x(), (0.45, -1.15)[k // 3], 0])
        l = VGroup(*t[1:])
        l.set_x(m.get_x())
        rows.append((l, m, eq))
    note = M(r"M\neq 0", size=48, color=RED).next_to(rows[4][1], DOWN, buff=0.18)
    return a1, a2, pan, rows, note


class K04_Laws1(Shot):
    def body(self):
        self.title("Limit Laws", "10:32.00")
        # making tables every time takes forever
        grid = VGroup(Line([0, 2.05, 0], [0, -2.55, 0], color=CHALK, stroke_width=4),
                      Line([-2.6, 1.2, 0], [2.6, 1.2, 0], color=CHALK, stroke_width=4))
        hdr = VGroup(M("x", size=52).move_to([-1.3, 1.65, 0]), M("f(x)", size=52).move_to([1.3, 1.65, 0]))
        self.go("10:32.58", Create(grid), Write(hdr), run=0.5)
        rows = VGroup()
        for k, (x, t) in enumerate([("1.9", "10:33.02"), ("1.99", "10:33.36"), ("1.999", "10:33.70"), ("1.9999", "10:33.98")]):
            y = 0.65 - 0.72 * k
            r = VGroup(M(x, size=48, color=BLUE).move_to([-1.3, y, 0]), M("4" + x[1:], size=48, color=BLUE).move_to([1.3, y, 0]))
            r[1].set_x(1.3)
            self.go(t, FadeIn(r, shift=DOWN * 0.1), run=0.25)
            rows.add(r)
        dots = VGroup(M(r"\vdots", size=48, color=DIM).move_to([-1.3, -2.2, 0]), M(r"\vdots", size=48, color=DIM).move_to([1.3, -2.2, 0]))
        self.go("10:34.30", FadeIn(dots, shift=DOWN * 0.15), run=0.4)
        self.go("10:35.22", FadeOut(VGroup(grid, hdr, rows, dots), shift=LEFT * 0.5), run=0.5)
        # the rules
        a1, a2, pan, laws, note = laws_board()
        self.go("10:37.04", Create(pan), run=0.9)
        self.go("10:40.30", Circumscribe(self.head[0], color=YEL, buff=0.12), run=0.9)
        self.go("10:42.66", Write(a1[0]), run=0.8)
        self.go("10:43.76", Write(a1[1:]), run=0.4)
        self.go("10:45.28", Write(a2[0]), run=0.8)
        self.go("10:46.30", Write(a2[1:]), run=0.4)
        for i, (t1, t2) in enumerate([("10:48.54", "10:49.40"), ("10:53.02", "10:53.90"), ("10:56.04", "10:57.84")]):
            l, m, eq = laws[i]
            self.go(t1, FadeIn(l, shift=DOWN * 0.1), Write(m[:eq]), run=0.6)
            self.go(t2, Write(m[eq:]), run=0.6)
            if i == 0:
                self.go("10:51.68", Circumscribe(m, color=YEL, buff=0.1), run=0.8)
        c = laws[2][1]
        self.go("11:00.52", c[2].animate.set_color(ORG), c[5].animate.set_color(ORG), Circumscribe(c[5], color=ORG, buff=0.08), run=0.8)


class K04_Laws2(Shot):
    def body(self):
        self.title("Limit Laws", animate=False)
        a1, a2, pan, laws, note = laws_board()
        c = laws[2][1]
        c[2].set_color(ORG); c[5].set_color(ORG)
        self.add(a1, a2, pan, *[x for l, m, _ in laws[:3] for x in (l, m)])
        times = [("11:02.28", "11:03.14"), ("11:05.22", "11:06.16"), ("11:11.58", "11:12.40")]
        for i, (t1, t2) in zip((3, 4, 5), times):
            l, m, eq = laws[i]
            self.go(t1, FadeIn(l, shift=DOWN * 0.1), Write(m[:eq]), run=0.6)
            self.go(t2, Write(m[eq:]), run=0.6)
            if i == 4:
                self.go("11:09.54", Write(note), run=0.6)
        # limits play nicely with + - x / powers
        for i, t in [(0, "11:17.20"), (1, "11:18.34"), (3, "11:18.94"), (4, "11:19.96"), (5, "11:20.92")]:
            extra = [laws[2][0].animate.set_color(YEL)] if i == 3 else []
            self.go(t, laws[i][0].animate.set_color(YEL), *extra, run=0.3)
        # break a big problem into pieces, find each limit, put them back together
        self.wipe("11:22.02", run=0.35)
        big = M(r"\lim_{x\to 2}", "(", "x^2", "+", "3x", ")", size=72).move_to([0, 1.5, 0])
        self.go("11:22.40", Write(big), run=0.7)
        p1 = M(r"\lim_{x\to 2}", "x^2", size=64).move_to([-3.4, -0.1, 0])
        p2 = M(r"\lim_{x\to 2}", "3x", size=64).move_to([3.4, -0.1, 0])
        plus = M("+", size=64).move_to([0, -0.1, 0])
        self.go("11:23.54", TransformFromCopy(big[0], p1[0]), TransformFromCopy(big[2], p1[1]),
                TransformFromCopy(big[3], plus),
                TransformFromCopy(big[0], p2[0]), TransformFromCopy(big[4], p2[1]), run=0.9)
        v1 = M("2^2", "=", "4", size=60).next_to(p1, DOWN, buff=0.45)
        v2 = M(r"3\cdot 2", "=", "6", size=60).next_to(p2, DOWN, buff=0.45)
        v1[0][0].set_color(ORG); v2[0][2].set_color(ORG)
        self.go("11:24.90", Write(v1), run=0.45)
        self.go("11:25.40", Write(v2), run=0.5)
        r = M("4", "+", "6", "=", "10", size=72).move_to([0, -2.85, 0])
        r[4].set_color(GRN)
        self.go("11:26.24", TransformFromCopy(v1[2], r[0]), FadeIn(r[1]), TransformFromCopy(v2[2], r[2]), run=0.8)
        self.go("11:27.10", Write(r[3:]), run=0.4)
        self.go("11:27.60", Create(box(r[4], GRN, buff=0.12)), run=0.4)
        # ... which leads to the most useful trick: we just plugged in 2
        self.go("11:30.96", Circumscribe(v1[0][0], color=ORG, buff=0.08), Circumscribe(v2[0][2], color=ORG, buff=0.08), run=1.0)


# ================================================================ Part 7: direct substitution

def sketch(kind):
    """Tiny graph sketches of what a 'nice' function does not have (about 1.8 x 0.9)."""
    if kind == "hole":
        xs = np.linspace(-0.9, 0.9, 30)
        c = VMobject(stroke_color=BLUE, stroke_width=4).set_points_smoothly([[x, 0.35 * x + 0.12 * x * x, 0] for x in xs])
        h = Circle(radius=0.09, stroke_color=BLUE, stroke_width=4, fill_color=config.background_color, fill_opacity=1).move_to([0, 0, 0])
        return VGroup(c, h)
    if kind == "jump":
        return VGroup(Line([-0.9, -0.3, 0], [0, -0.3, 0], color=BLUE, stroke_width=4),
                      Line([0, 0.3, 0], [0.9, 0.3, 0], color=BLUE, stroke_width=4),
                      Dot([0, -0.3, 0], radius=0.07, color=BLUE))
    left = VMobject(stroke_color=BLUE, stroke_width=4).set_points_smoothly([[x, min(0.45, 0.06 / (-x)), 0] for x in np.linspace(-0.9, -0.14, 20)])
    right = VMobject(stroke_color=BLUE, stroke_width=4).set_points_smoothly([[x, max(-0.45, -0.06 / x), 0] for x in np.linspace(0.14, 0.9, 20)])
    return VGroup(left, right, DashedLine([0, -0.5, 0], [0, 0.5, 0], color=DIM, stroke_width=3, dash_length=0.08))


class K04_Direct(Shot):
    def body(self):
        self.title("Direct Substitution", "11:35.60")
        ax = Axes(x_range=[0, 5, 1], y_range=[0, 5, 1], x_length=5.6, y_length=4.0,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2)).move_to([-3.4, -0.6, 0])
        xl = M("x", size=40, color=DIM).next_to(ax.x_axis.get_end(), DR, buff=0.1)
        yl = M("y", size=40, color=DIM).next_to(ax.y_axis.get_end(), LEFT, buff=0.15)
        self.go("11:36.74", Create(ax), FadeIn(xl), FadeIn(yl), run=0.6)
        f = lambda x: 0.3 * (x - 1.2) ** 2 + 0.9
        curve = ax.plot(f, x_range=[0.2, 4.8], color=BLUE, stroke_width=5)
        self.go("11:37.84", Create(curve), run=1.0)
        # no holes, jumps, or breaks
        sks = VGroup()
        for kind, y, t in (("hole", 1.25, "11:39.28"), ("jump", 0.0, "11:39.88"), ("break", -1.25, "11:40.34")):
            s = sketch(kind).move_to([3.0, y, 0])
            x = cross_mark(s=0.2).move_to([4.6, y, 0])
            self.go(t, Create(s), Create(x), run=0.4)
            sks.add(s, x)
        self.go("11:41.00", FadeOut(sks), run=0.3)
        # the limit is the value
        a = 3
        dash = DashedLine(ax.c2p(a, 0), ax.c2p(a, f(a)), color=DIM, stroke_width=3, dash_length=0.12)
        dot = Dot(ax.c2p(a, f(a)), radius=0.1, color=CHALK)
        al = M("a", size=44, color=ORG).next_to(ax.c2p(a, 0), DOWN, buff=0.15)
        eq = M(r"\lim_{x\to a} f(x)", "=", "f(a)", size=60).move_to([3.3, 0.7, 0])
        self.go("11:41.42", Create(dash), FadeIn(dot, scale=0.5), FadeIn(al), Write(eq[0]), run=0.8)
        self.go("11:42.66", Write(eq[1:]), run=0.6)
        plug = H("just plug it in", 46, YEL).next_to(eq, DOWN, buff=0.55)
        self.go("11:44.84", FadeIn(plug, shift=UP * 0.1), run=0.4)
        mover = Dot(ax.c2p(a, 0), radius=0.1, color=ORG)
        self.go("11:45.30", MoveAlongPath(mover, Line(ax.c2p(a, 0), ax.c2p(a, f(a)))), run=0.9)
        # polynomials always, fractions if the bottom isn't 0
        self.wipe("11:46.92", run=0.4)
        l1 = H("polynomials", 50).move_to([-4.0, 0.9, 0])
        m1 = M("x^2+2x", size=60).move_to([0.4, 0.9, 0])
        self.go("11:47.62", Write(l1), FadeIn(m1, shift=UP * 0.1), run=0.6)
        al1 = VGroup(tick_mark(s=0.45), H("always", 46, GRN)).arrange(RIGHT, buff=0.25).move_to([4.2, 0.9, 0])
        self.go("11:48.66", Create(al1[0]), Write(al1[1]), run=0.5)
        l2 = H("fractions", 50).move_to([-4.0, -1.1, 0])
        m2 = M(r"\frac{3x-1}{x+4}", size=60).move_to([0.4, -1.1, 0])
        self.go("11:50.22", Write(l2), FadeIn(m2, shift=UP * 0.1), run=0.6)
        self.go("11:52.16", Circumscribe(m2[0][5:], color=RED, buff=0.08), run=0.6)
        nz = M(r"x+4\neq 0", size=52, color=RED).move_to([4.2, -1.1, 0])
        self.go("11:52.80", Write(nz), run=0.5)
        # example 1
        self.wipe("11:54.22", run=0.4)
        L1 = M(r"\lim_{x\to 3}", "(x^2+2x)", "=", "3^2+2(3)", size=64).move_to([0, 1.0, 0])
        L1[3][0].set_color(ORG); L1[3][5].set_color(ORG)
        L2 = M("=", "9+6", size=64)
        L3 = M("=", "15", size=64)
        for k, L in enumerate((L2, L3)):
            L.shift(L1[2].get_center() - L[0].get_center() + DOWN * 1.35 * (k + 1))
        self.go("11:55.38", Write(L1[0]), run=0.6)
        self.go("11:57.56", Write(L1[1]), run=0.8)
        self.go("11:59.80", Write(L1[2:]), run=0.7)
        self.go("12:00.78", Write(L2), run=0.6)
        L3[1].set_color(GRN)
        self.go("12:02.40", Write(L3), run=0.4)
        bx = box(L3[1], GRN, buff=0.14)
        self.go("12:02.85", Create(bx), run=0.4)
        self.go("12:03.46", Create(tick_mark(s=0.5).next_to(bx, RIGHT, buff=0.4)), run=0.4)


class K04_Another(Shot):
    def body(self):
        self.title("Another Example", "12:04.60")
        L = M(r"\lim_{x\to 2}", r"\frac{3x-1}{x+4}", "=", r"\frac{3(2)-1}{2+4}", "=", r"\frac{5}{6}", size=64).move_to([0, 1.1, 0])
        L[3][2].set_color(ORG); L[3][7].set_color(ORG)
        L[5].set_color(GRN)
        self.go("12:05.90", Write(L[0]), run=0.6)
        self.go("12:07.92", Write(L[1]), run=1.6)
        self.go("12:11.48", Write(L[2:4]), run=0.9)
        tl = H("top", 44, DIM)
        tm = M("6-1", "=", "5", size=60)
        bl = H("bottom", 44, DIM)
        bm = M("2+4", "=", "6", size=60)
        for lab, m, y in ((tl, tm, -0.9), (bl, bm, -2.2)):
            m.move_to([0, y, 0]).set_x(-0.6 + m.width / 2)
            lab.move_to([0, y, 0]).set_x(-1.1 - lab.width / 2)
        self.go("12:12.42", Circumscribe(L[3][0:6], color=YEL, buff=0.08), FadeIn(tl, shift=RIGHT * 0.1), run=0.5)
        self.go("12:13.00", Write(tm[0]), run=0.5)
        self.go("12:13.94", Write(tm[1:]), run=0.5)
        self.go("12:14.86", Circumscribe(L[3][7:], color=YEL, buff=0.08), FadeIn(bl, shift=RIGHT * 0.1), run=0.45)
        self.go("12:15.36", Write(bm[0]), run=0.5)
        self.go("12:16.18", Write(bm[1:]), run=0.5)
        self.go("12:17.48", Write(L[4]), TransformFromCopy(tm[2], L[5][0]), FadeIn(L[5][1]), TransformFromCopy(bm[2], L[5][2]), run=0.8)
        self.go("12:18.30", Create(box(L[5], GRN, buff=0.14)), run=0.4)
        # step 1 for every limit problem
        self.wipe("12:19.18", run=0.4)
        self.title("Step 1, Every Time", "12:19.90")
        st = pill("Plug in first", YEL, size=52).move_to([0, 1.3, 0])
        self.go("12:22.68", FadeIn(st, shift=DOWN * 0.1), run=0.5)
        a1 = arrow([-0.9, 0.7, 0], [-3.3, -0.35, 0])
        a2 = arrow([0.9, 0.7, 0], [3.3, -0.35, 0])
        self.go("12:24.44", Create(a1), run=0.4)
        nn = H("a normal number", 46).move_to([-3.6, -0.85, 0])
        self.go("12:25.00", FadeIn(nn, shift=DOWN * 0.1), run=0.5)
        ok = VGroup(tick_mark(s=0.5), H("your answer", 46, GRN)).arrange(RIGHT, buff=0.3).move_to([-3.6, -2.0, 0])
        self.go("12:25.90", Create(ok[0]), run=0.4)
        self.go("12:27.10", Write(ok[1]), run=0.5)
        self.go("12:27.90", Create(a2), run=0.4)
        zz = M(r"\frac{\,0\,}{\,0\,}", size=90, color=RED).move_to([3.3, -1.4, 0])
        self.go("12:29.06", Write(zz), run=0.8)
        q = H("?", 90, YEL).next_to(zz, RIGHT, buff=0.4)
        self.go("12:30.88", Write(q), run=0.5)


# ================================================================ Part 8: the 0/0 puzzle

def chest(c=(-4.0, -0.9, 0), w=3.6, h=2.0):
    c = np.array(c, float)
    body = Rectangle(width=w, height=h, stroke_color=CHALK, stroke_width=5).move_to(c)
    tl, tr = c + [-w / 2, h / 2, 0], c + [w / 2, h / 2, 0]
    up = UP * 0.35
    lid = VGroup(Line(tl, tl + up, color=CHALK, stroke_width=5), Line(tr, tr + up, color=CHALK, stroke_width=5),
                 ArcBetweenPoints(tr + up, tl + up, angle=PI * 0.45, color=CHALK, stroke_width=5))
    bands = VGroup(*[Line(c + [s, -h / 2, 0], c + [s, h / 2, 0], color=DIM, stroke_width=4) for s in (-w / 2 + 0.5, w / 2 - 0.5)])
    plate = RoundedRectangle(width=0.5, height=0.62, corner_radius=0.08, stroke_color=ORG, stroke_width=4).move_to(c + [0, h / 2 - 0.12, 0])
    hole = VGroup(Circle(radius=0.07, stroke_color=ORG, stroke_width=4).move_to(plate.get_center() + UP * 0.06),
                  Line(plate.get_center() + DOWN * 0.02, plate.get_center() + DOWN * 0.18, color=ORG, stroke_width=4))
    return VGroup(body, lid, bands), VGroup(plate, hole)


def key(color=YEL):
    return VGroup(Circle(radius=0.3, stroke_color=color, stroke_width=5),
                  Circle(radius=0.1, stroke_color=color, stroke_width=4),
                  Line([0.3, 0, 0], [1.7, 0, 0], color=color, stroke_width=5),
                  Line([1.35, 0, 0], [1.35, -0.28, 0], color=color, stroke_width=5),
                  Line([1.6, 0, 0], [1.6, -0.28, 0], color=color, stroke_width=5))


class K04_Puzzle(Shot):
    def body(self):
        self.title("The 0/0 Puzzle", "12:36.30")
        zz = M(r"\frac{\,0\,}{\,0\,}", size=130).move_to([-3.6, 0.0, 0])
        self.go("12:36.80", Write(zz), run=0.8)
        # not 0, not 1, not "undefined, the end"
        o1 = M("=", "0", size=72)
        o2 = M("=", "1", size=72)
        o3 = VGroup(M("=", size=72), H("undefined, the end", 52)).arrange(RIGHT, buff=0.3)
        for o, y in ((o1, 1.3), (o2, 0.0), (o3, -1.3)):
            o.move_to([0, y, 0]).set_x(-1.4 + o.width / 2)
        s1, s2, s3 = strike(o1[1], width=7), strike(o2[1], width=7), strike(o3[1], width=7)
        self.go("12:39.26", FadeIn(o1, shift=RIGHT * 0.1), run=0.4)
        self.go("12:39.90", Create(s1), run=0.3)
        self.go("12:40.56", FadeIn(o2, shift=RIGHT * 0.1), run=0.4)
        self.go("12:41.20", Create(s2), run=0.3)
        self.go("12:42.16", FadeIn(o3, shift=RIGHT * 0.1), run=0.6)
        self.go("12:43.40", Create(s3), run=0.4)
        # an indeterminate form: a hidden answer
        self.go("12:44.26", *[FadeOut(m) for m in (o1, o2, o3, s1, s2, s3)], run=0.4)
        self.go("12:44.70", zz.animate.move_to([0, 0.5, 0]), run=0.6)
        ind = H("indeterminate form", 60, YEL).move_to([0, -1.75, 0])
        self.go("12:46.04", Write(ind), run=0.8)
        self.go("12:49.04", Circumscribe(zz, color=YEL, buff=0.2), run=0.9)
        # a locked treasure chest
        self.go("12:52.60", FadeOut(ind), run=0.3)
        ch, lock = chest()
        self.go("12:53.50", Create(ch), Create(lock), zz.animate.scale(0.5).set_color(RED).move_to([-4.0, -1.25, 0]), run=1.2)
        self.go("12:57.26", Circumscribe(lock, color=ORG, buff=0.1), run=0.8)
        # three keys
        keys = []
        for name, y, t in (("factoring", 1.1, "13:00.74"), ("simplify fractions", -0.2, "13:01.74"), ("conjugate trick", -1.5, "13:04.48")):
            k = key().shift([-0.9, y, 0])
            lab = H(name, 48).next_to(k, RIGHT, buff=0.4)
            self.go(t, Create(k), Write(lab), run=0.6)
            keys.append(VGroup(k, lab))
        self.go("13:06.36", Circumscribe(keys[0], color=YEL, buff=0.15), run=0.9)
