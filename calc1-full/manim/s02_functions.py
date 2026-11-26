"""Builder 02: Chapter 1 part 2/3. Domain of a root, range of x^2, two practice domains, piecewise functions,
absolute value, transformations (shift, flip, stretch), then the families: linear, slope from two points,
point-slope form, quadratic, polynomial, rational, exponential, e, logarithms."""
from common import *


# ---------- small local helpers ----------

def ray(a, b, color=GRN):
    """Thick shading arrow on a number line."""
    return Arrow(a, b, buff=0, color=color, stroke_width=9, tip_length=0.24,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30).set_z_index(2)


def from_point(nl, a, hi):
    """Closed dot at a, shading to the right (x >= a)."""
    return ray(nl.n2p(a), nl.n2p(hi - 0.15)), Dot(nl.n2p(a), radius=0.13, color=GRN).set_z_index(3)


def except_point(nl, h, lo, hi):
    """Shading on both sides of h with an open red hole at h (x != h)."""
    rays = VGroup(ray(nl.n2p(h) + LEFT * 0.15, nl.n2p(lo) + LEFT * 0.25), ray(nl.n2p(h) + RIGHT * 0.15, nl.n2p(hi - 0.15)))
    ring = Circle(radius=0.13, stroke_color=RED, stroke_width=5, fill_color=config.background_color, fill_opacity=1).move_to(nl.n2p(h)).set_z_index(3)
    return rays, ring


def cases(lhs, rows, size=60, csize=46):
    """Piecewise display: lhs, a brace, and rows (value, condition) in two aligned columns. Returns (lhs, brace, rows)."""
    L = M(lhs, size=size)
    R = VGroup(*[VGroup(M(v, size=size), M(c, size=csize, color=DIM)) for v, c in rows])
    vw = max(r[0].width for r in R)
    for i, r in enumerate(R):
        r[0].move_to([0, -i * 0.95, 0], aligned_edge=LEFT)
        r[1].move_to([vw + 0.7, -i * 0.95, 0], aligned_edge=LEFT)
    br = Brace(R, LEFT, buff=0.18, color=CHALK)
    L.next_to(br, LEFT, buff=0.18)
    return VGroup(L, br, R)


def at_eq(rows, x, i=1):
    """Shift each MathTex row so its part i (the '=') sits at screen x."""
    for r in rows:
        r.shift(RIGHT * (x - r[i].get_center()[0]))
    return rows


def lseg(ax, m, b=1.0, xr=(-2.9, 3.8), yr=(-1.9, 4.8), color=BLUE):
    """The part of y = m x + b inside the window."""
    lo, hi = xr
    if abs(m) > 1e-6:
        x1, x2 = (yr[0] - b) / m, (yr[1] - b) / m
        lo, hi = max(lo, min(x1, x2)), min(hi, max(x1, x2))
    return Line(ax.c2p(lo, m * lo + b), ax.c2p(hi, m * hi + b), color=color, stroke_width=5)


def units(ax):
    o = np.array(ax.c2p(0, 0))
    return np.array(ax.c2p(1, 0))[0] - o[0], np.array(ax.c2p(0, 1))[1] - o[1]


def smooth(f, a, b, n=80, color=BLUE, width=4):
    xs = np.linspace(a, b, n)
    return VMobject(stroke_color=color, stroke_width=width).set_points_smoothly([np.array([x, f(x), 0]) for x in xs])


def mini(kind):
    """Tiny family portrait graph centred on the origin (about 2.4 x 1.3)."""
    W, Hh = 1.15, 0.6
    g = VGroup(Line([-W - 0.1, 0, 0], [W + 0.1, 0, 0], color=DIM, stroke_width=2),
               Line([0, -Hh - 0.1, 0], [0, Hh + 0.1, 0], color=DIM, stroke_width=2))
    if kind == "lin":
        g.add(smooth(lambda x: 0.45 * x + 0.1, -W, W, 10))
    elif kind == "quad":
        g.add(smooth(lambda x: -0.5 + 0.8 * x * x, -1.0, 1.0))
    elif kind == "poly":
        g.add(smooth(lambda x: ((1.9 * x) ** 3 - 6.3 * x / 1.1) / 6, -1.1, 1.1))
    elif kind == "rat":
        g.add(smooth(lambda x: 0.12 / x, 0.21, W), smooth(lambda x: 0.12 / x, -W, -0.21))
    elif kind == "exp":
        g.add(smooth(lambda x: -0.5 + 1.1 * (np.exp(3 * (x + W)) - 1) / (np.exp(6 * W) - 1), -W, W))
    else:
        g.add(smooth(lambda x: 0.25 * np.log((x + 1.2) / 0.5), -1.12, W))
    return g


# the bump used for every transformation: peak 2 at x = 0, so 3f still fits
TF = lambda x: 2 * np.exp(-x * x / 1.5)


def tboard():
    ax = axes((-6, 6, 1), (-4, 7, 1), x_length=11, y_length=4.9, center=(0, -0.95, 0), nums=False)
    for v in (-2, 2):
        ax.labels.add(M(str(v), size=30, color=FAINT).next_to(ax.c2p(v, 0), DOWN, buff=0.12))
    cur = curve(ax, TF, [-3.9, 3.9])
    ghost = DashedVMobject(cur.copy().set_stroke(DIM, 3), num_dashes=50)
    eq = M("y", "=", "f(x)", size=64).move_to([-4.3, 1.9, 0])
    return ax, cur, ghost, eq


def eqf(*parts, ref, hi=None):
    e = M(*parts, size=64).move_to(ref, aligned_edge=LEFT)
    if hi is not None:
        e[hi].set_color(YEL)
    return e


# ================================================================ domain of a root, range

class K02_Root(Shot):
    def body(self):
        self.title("Domain of a Square Root", "6:47.65")
        fx = M(r"f(x)=\sqrt{x-5}", size=76).move_to([0, 1.45, 0])
        self.go("6:48.22", Write(fx), run=0.9)
        bx = box(fx[0][7:], YEL, buff=0.1)
        self.go("6:51.04", Create(bx), run=0.5)
        nt = M(r"\ge 0", size=64, color=YEL).next_to(bx, RIGHT, buff=0.3)
        self.go("6:52.22", Write(nt), run=0.5)
        rows = steps(("x-5", r"\ge", "0"), ("x", r"\ge", "5"), size=68, start=UP * 0.15)
        self.go("6:53.92", Write(rows[0]), run=0.9)
        nl = number_line((0, 9, 1), length=10, center=(0, -2.3, 0))
        self.go("6:55.66", FadeOut(nt), FadeOut(bx), Create(nl), FadeIn(nl.labels), run=0.6)
        p5 = M("+5", size=48, color=DIM).next_to(rows[0], RIGHT, buff=0.6)
        self.go("6:56.40", FadeIn(p5, shift=LEFT * 0.1), run=0.3)
        self.go("6:56.84", Write(rows[1]), run=0.7)
        r, d = from_point(nl, 5, 9)
        self.go("6:57.98", Create(r), FadeIn(d, scale=0.5), nl.labels[5].animate.set_color(ORG), FadeOut(p5), run=0.5)
        self.go("6:58.50", rows[1].animate.set_color(GRN), Create(answer_box(rows[1])), run=0.35)


class K02_Range(Shot):
    def body(self):
        self.title("Range", "6:58.90")
        ax = axes((-3, 3, 1), (-2, 9, 2), x_length=5.2, y_length=5.0, center=(-3.2, -0.75, 0))
        self.go("6:59.84", Create(ax), FadeIn(ax.labels), run=0.6)
        fx = M("f(x)=x^2", size=68).move_to([3.3, 1.5, 0])
        par = curve(ax, lambda x: x * x, [-2.95, 2.95])
        self.go("7:02.28", Write(fx), draw(par, run=0.9), run=0.9)
        # square any number: the input slides, the output (green) never goes below zero
        xt = ValueTracker(-2.6)
        sq = lambda: xt.get_value() ** 2
        dot = always_redraw(lambda: pt(ax, xt.get_value(), sq()))
        guide = always_redraw(lambda: DashedLine(ax.c2p(xt.get_value(), sq()), ax.c2p(0, sq()), color=DIM, stroke_width=3, dash_length=0.08))
        ydot = always_redraw(lambda: Dot(ax.c2p(0, sq()), radius=0.09, color=GRN).set_z_index(7))
        trail = TracedPath(lambda: ax.c2p(0, sq()), stroke_color=GRN, stroke_width=8)
        self.go("7:03.84", FadeIn(dot), FadeIn(guide), FadeIn(ydot), run=0.3)
        self.add(trail)
        self.play(xt.animate.set_value(2.6), run_time=3.0)
        nn = M(r"x^2\ge 0", size=60, color=YEL).move_to([3.3, 0.25, 0])
        self.go("7:07.20", Write(nn), run=0.6)
        rl = VGroup(H("range:", 46, YEL), M(r"y\ge 0", size=64, color=GRN)).arrange(RIGHT, buff=0.35).move_to([3.3, -1.25, 0])
        for m in (dot, guide, ydot):
            m.clear_updaters()
        trail.clear_updaters()
        self.go("7:08.64", Write(rl), FadeOut(dot), FadeOut(guide), FadeOut(ydot), run=0.6)
        up = Line(ax.c2p(0, 0), ax.c2p(0, 8.9), color=GRN, stroke_width=9).set_z_index(3)
        self.go("7:10.22", Create(up), FadeOut(trail), run=0.7)
        self.go("7:10.92", Create(answer_box(rl[1])), run=0.4)


# ================================================================ practice

class K02_Practice(Shot):
    def body(self):
        self.title("Domain Practice", "7:13.20")
        q1 = M(r"\frac{3}{x+4}", size=76).move_to([-3.4, 1.25, 0])
        q2 = M(r"\sqrt{x-1}", size=76).move_to([3.4, 1.25, 0])
        n1 = H("1", 44, DIM).next_to(q1, LEFT, buff=0.6)
        n2 = H("2", 44, DIM).next_to(q2, LEFT, buff=0.6)
        div = Line([0, 1.9, 0], [0, -3.2, 0], color=FAINT, stroke_width=2)
        self.go("7:13.78", FadeIn(n1), run=0.3)
        self.go("7:14.30", Write(q1), run=0.9)
        self.go("7:17.06", FadeIn(n2), Create(div), run=0.4)
        self.go("7:17.72", Write(q2), run=0.9)
        right = VGroup(n2, q2)
        right.save_state()
        self.go("7:19.80", right.animate.fade(0.65), run=0.5)
        # 1) the bottom can't be zero
        bx = box(q1[0][2:], YEL, buff=0.08)
        self.go("7:20.98", Create(bx), run=0.4)
        e1 = M("x+4", "=", "0", size=64).move_to([-3.4, -0.5, 0])
        self.go("7:22.82", Write(e1), FadeOut(bx), run=0.8)
        e2 = M("x", "=", "-4", size=64).move_to(e1)
        self.go("7:24.46", TransformMatchingTex(e1, e2), run=0.6)
        nl1 = number_line((-7, 0, 1), length=5.6, center=(-3.4, -2.25, 0), size=34)
        self.go("7:26.44", Create(nl1), FadeIn(nl1.labels), run=0.5)
        rays, ring = except_point(nl1, -4, -7, 0)
        self.go("7:27.28", Create(rays), run=0.5)
        self.go("7:27.85", FadeIn(ring, scale=0.5), run=0.25)
        e3 = M("x", r"\ne", "-4", size=64, color=GRN).move_to(e1)
        self.go("7:28.14", TransformMatchingTex(e2, e3), nl1.labels[3].animate.set_color(ORG), run=0.5)
        # 2) under the root at least zero
        left = VGroup(n1, q1, e3, nl1, nl1.labels, rays, ring)
        self.go("7:28.98", left.animate.fade(0.65), Restore(right), run=0.5)
        bx2 = box(q2[0][2:], YEL, buff=0.08)
        self.go("7:29.68", Create(bx2), run=0.4)
        f1 = M("x-1", r"\ge", "0", size=64).move_to([3.4, -0.5, 0])
        self.go("7:30.60", Write(f1), FadeOut(bx2), run=0.8)
        f2 = M("x", r"\ge", "1", size=64).move_to(f1)
        self.go("7:33.32", TransformMatchingTex(f1, f2), run=0.6)
        nl2 = number_line((-2, 5, 1), length=5.6, center=(3.4, -2.25, 0), size=34)
        self.go("7:33.95", Create(nl2), FadeIn(nl2.labels), run=0.4)
        r2, d2 = from_point(nl2, 1, 5)
        self.go("7:34.40", Create(r2), FadeIn(d2, scale=0.5), f2.animate.set_color(GRN), nl2.labels[3].animate.set_color(ORG), run=0.6)


# ================================================================ piecewise

class K02_Piecewise(Shot):
    def body(self):
        ax = axes((-1, 5, 1), (-1, 6, 1), x_length=5.4, y_length=4.6, center=(-3.4, -0.8, 0))
        p1 = curve(ax, lambda x: x + 1, [-0.9, 2])
        p2 = curve(ax, lambda x: 5 + 0 * x, [2, 4.75])
        ring, cdot = hole(ax, 2, 3), pt(ax, 2, 5, color=BLUE)
        self.go("7:36.04", Create(ax), FadeIn(ax.labels), run=0.6)
        self.go("7:37.44", draw(p1, run=0.6), run=0.6)
        self.play(draw(p2, run=0.6), FadeIn(ring), FadeIn(cdot), run_time=0.6)
        self.title("Piecewise Functions", "7:39.08")
        jump = DashedLine(ax.c2p(2, 3.15), ax.c2p(2, 4.85), color=YEL, stroke_width=3, dash_length=0.08)
        self.go("7:41.96", Create(jump), run=0.5)
        # one rule for some inputs, another rule for the others
        seg = Line(ax.c2p(-1, 0), ax.c2p(2, 0), color=YEL, stroke_width=9).set_z_index(3)
        self.go("7:44.48", Create(seg), p1.animate.set_stroke(width=8), FadeOut(jump), run=0.5)
        seg2 = Line(ax.c2p(2, 0), ax.c2p(4.75, 0), color=YEL, stroke_width=9).set_z_index(3)
        self.go("7:46.46", Transform(seg, seg2), p1.animate.set_stroke(width=5), p2.animate.set_stroke(width=8), run=0.6)
        D = cases("f(x)=", [("x+1", r"\text{if } x<2"), ("5", r"\text{if } x\ge 2")], size=58, csize=44).move_to([3.4, 1.2, 0])
        self.go("7:48.74", FadeOut(seg), p2.animate.set_stroke(width=5), Write(D[0]), FadeIn(D[1]), run=0.6)
        self.go("7:50.40", Write(D[2][0][0]), run=0.5)
        self.go("7:51.40", Write(D[2][0][1]), run=0.6)
        self.go("7:54.40", Write(D[2][1][0]), run=0.35)
        self.go("7:54.84", Write(D[2][1][1]), run=0.6)
        # f(0): 0 < 2, first rule
        wpos = np.array([3.4, -0.8, 0])
        w = M("f(0)", "=", r"\text{?}", size=60).move_to(wpos)
        d0 = pt(ax, 0, 0)
        self.go("7:57.52", Write(w), FadeIn(d0, scale=0.5), run=0.5)
        c = M("0", "<", "2", size=56).move_to([3.0, -2.15, 0])
        c[0].set_color(ORG)
        self.go("7:59.60", Write(c), run=0.5)
        ok = tick_mark(s=0.45).next_to(c, RIGHT, buff=0.45)
        self.go("8:01.28", Create(ok), run=0.4)
        b1 = box(D[2][0], YEL, buff=0.1)
        self.go("8:02.78", Create(b1), run=0.4)
        w2 = M("f(0)", "=", "0+1", size=60).move_to(w, aligned_edge=LEFT)
        self.go("8:04.04", TransformMatchingTex(w, w2), run=0.5)
        w3 = M("f(0)", "=", "1", size=60).move_to(w, aligned_edge=LEFT)
        w3[2].set_color(GRN)
        self.go("8:05.22", TransformMatchingTex(w2, w3), d0.animate.move_to(ax.c2p(0, 1)), run=0.6)
        self.go("8:05.95", FadeOut(VGroup(w3, c, ok, b1, d0)), run=0.4)
        # f(3): 3 < 2 is false, second rule
        v = M("f(3)", "=", r"\text{?}", size=60).move_to(wpos)
        d3 = pt(ax, 3, 0)
        self.go("8:06.68", Write(v), FadeIn(d3, scale=0.5), run=0.5)
        c2 = M("3", "<", "2", size=56).move_to(c)
        c2[0].set_color(ORG)
        self.go("8:08.00", Write(c2), run=0.5)
        no = cross_mark(s=0.2).next_to(c2, RIGHT, buff=0.45)
        self.go("8:09.54", Create(no), run=0.4)
        b2 = box(D[2][1], YEL, buff=0.1)
        self.go("8:11.18", Create(b2), run=0.4)
        v2 = M("f(3)", "=", "5", size=60).move_to(v, aligned_edge=LEFT)
        v2[2].set_color(GRN)
        self.go("8:12.92", TransformMatchingTex(v, v2), d3.animate.move_to(ax.c2p(3, 5)), run=0.6)
        # just five, wherever you are on that piece
        self.go("8:14.24", d3.animate.move_to(ax.c2p(4.6, 5)), run=0.6)
        self.play(d3.animate.move_to(ax.c2p(2.1, 5)), run_time=0.7)


# ================================================================ absolute value

class K02_Abs(Shot):
    def body(self):
        self.title("Absolute Value", "8:18.72")
        D = cases("|x|=", [("x", r"\text{if } x\ge 0"), ("-x", r"\text{if } x<0")], size=66, csize=48).move_to([0, 1.1, 0])
        self.go("8:20.46", Write(D[0]), FadeIn(D[1]), run=0.6)
        self.go("8:22.00", Write(D[2][0][0]), run=0.35)
        self.go("8:22.40", Write(D[2][0][1]), run=0.6)
        self.go("8:24.84", Write(D[2][1][0]), run=0.4)
        self.go("8:25.58", Write(D[2][1][1]), run=0.6)
        self.go("8:27.42", Circumscribe(D[2][1][0], color=YEL, buff=0.1), run=0.8)
        # x = -3
        ex = M("x", "=", "-3", size=64).move_to([-3.6, -1.35, 0])
        ex[2].set_color(ORG)
        self.go("8:30.76", Write(ex), run=0.5)
        e2 = M("-x", "=", "-(-3)", "=", "3", size=64).move_to([2.0, -1.35, 0])
        e2[4].set_color(GRN)
        self.go("8:32.52", Write(e2[0:3]), run=0.8)
        self.go("8:35.40", Write(e2[3:]), run=0.5)
        # strips off the sign
        s = M("|", "-", "3", "|", "=", "3", size=96).move_to([0, -1.35, 0])
        s[5].set_color(GRN)
        self.go("8:36.74", FadeOut(VGroup(ex, e2)), run=0.3)
        self.play(Write(s), run_time=0.7)
        cx = cross_mark(s=0.2).move_to(s[1])
        self.go("8:38.78", Create(cx), run=0.4)
        # distance from zero
        self.go("8:40.32", FadeOut(VGroup(D, s, cx)), run=0.35)
        nl = number_line((-5, 5, 1), length=11, center=(0, -0.6, 0))
        self.play(Create(nl), FadeIn(nl.labels), run_time=0.5)
        dm, dp = Dot(nl.n2p(-3), radius=0.12, color=ORG).set_z_index(3), Dot(nl.n2p(3), radius=0.12, color=ORG).set_z_index(3)
        al = Arrow(nl.n2p(0) + UP * 0.5, nl.n2p(-3) + UP * 0.5, buff=0, color=YEL, stroke_width=5, tip_length=0.2)
        ar = Arrow(nl.n2p(0) + UP * 0.5, nl.n2p(3) + UP * 0.5, buff=0, color=YEL, stroke_width=5, tip_length=0.2)
        l1 = M("3", size=50, color=YEL).next_to(al, UP, buff=0.12)
        l2 = M("3", size=50, color=YEL).next_to(ar, UP, buff=0.12)
        self.go("8:41.30", FadeIn(dm, scale=0.5), FadeIn(dp, scale=0.5), GrowArrow(al), GrowArrow(ar), FadeIn(l1), FadeIn(l2), run=0.6)
        # the V
        self.go("8:43.10", FadeOut(VGroup(nl, nl.labels, dm, dp, al, ar, l1, l2)), run=0.3)
        ax = axes((-4, 4, 1), (-1, 4, 1), x_length=7.2, y_length=4.5, center=(0, -1.0, 0))
        V = VMobject(stroke_color=BLUE, stroke_width=5).set_points_as_corners([ax.c2p(-3.6, 3.6), ax.c2p(0, 0), ax.c2p(3.6, 3.6)])
        vl = M("y=|x|", size=50, color=BLUE).next_to(ax.c2p(3.6, 3.6), RIGHT, buff=0.25)
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.5)
        self.go("8:43.98", draw(V, run=1.0), FadeIn(vl), run=1.0)
        o = pt(ax, 0, 0, color=YEL)
        self.go("8:45.90", FadeIn(o, scale=0.5), run=0.3)
        nt = note("sharp point", o, direction=np.array([-1, 0.3, 0]), dist=0.7, angle=0.5)
        self.go("8:47.64", FadeIn(nt[0]), Create(nt[1]), run=0.5)
        # derivatives later: no single tangent fits the corner
        s_ = ValueTracker(-0.85)
        tl = always_redraw(lambda: Line(ax.c2p(-1.3, -1.3 * s_.get_value()), ax.c2p(1.3, 1.3 * s_.get_value()), color=PINK, stroke_width=5).set_z_index(4))
        wq = H("which slope?", 42, PINK).move_to([-5.2, 0.9, 0])
        self.go("8:50.10", FadeIn(tl), run=0.3)
        self.play(s_.animate.set_value(0.85), run_time=1.2)
        self.play(s_.animate.set_value(-0.3), FadeIn(wq), run_time=0.9)


# ================================================================ transformations

class K02_ShiftUp(Shot):
    def body(self):
        self.title("Transformations", "8:54.04")
        ax, cur, ghost, eq = tboard()
        ux, uy = units(ax)
        self.go("8:56.34", Create(ax), FadeIn(ax.labels), run=0.5)
        self.go("8:56.90", draw(cur, run=1.0), run=1.0)
        self.go("8:57.98", Write(eq), run=0.6)
        self.go("9:00.70", Circumscribe(eq, color=YEL, buff=0.12), run=0.9)
        self.go("9:05.42", FadeIn(ghost), run=0.6)
        # outside: up and down
        e1 = eqf("y", "=", "f(x)", "+3", ref=eq, hi=3)
        self.go("9:10.18", TransformMatchingTex(eq, e1), run=0.6)
        x0 = -3.3
        a1 = Arrow(ax.c2p(x0, TF(x0)), ax.c2p(x0, TF(x0) + 3), buff=0, color=YEL, stroke_width=5, tip_length=0.2)
        t1 = M("+3", size=44, color=YEL).next_to(a1, LEFT, buff=0.15)
        self.go("9:12.18", cur.animate.shift(UP * 3 * uy), GrowArrow(a1), FadeIn(t1), run=1.0)
        e2 = eqf("y", "=", "f(x)", "-3", ref=eq, hi=3)
        self.go("9:14.38", TransformMatchingTex(e1, e2), FadeOut(a1), FadeOut(t1), run=0.5)
        a2 = Arrow(ax.c2p(x0, TF(x0)), ax.c2p(x0, TF(x0) - 3), buff=0, color=YEL, stroke_width=5, tip_length=0.2)
        t2 = M("-3", size=44, color=YEL).next_to(a2, LEFT, buff=0.15)
        self.go("9:15.58", cur.animate.shift(DOWN * 6 * uy), GrowArrow(a2), FadeIn(t2), run=1.0)
        e3 = eqf("y", "=", "f(x)", ref=eq)
        self.go("9:17.10", cur.animate.shift(UP * 3 * uy), TransformMatchingTex(e2, e3), FadeOut(a2), FadeOut(t2), run=0.7)


class K02_ShiftSide(Shot):
    def body(self):
        self.title("Transformations", animate=False)
        ax, cur, ghost, eq = tboard()
        ux, uy = units(ax)
        self.add(ax, ax.labels, ghost, cur, eq)
        # inside: right and left
        e1 = eqf("y", "=", "f(", "x-2", ")", ref=eq, hi=3)
        self.go("9:21.20", TransformMatchingTex(eq, e1), run=0.6)
        a1 = Arrow(ax.c2p(0.1, 2.7), ax.c2p(2, 2.7), buff=0, color=YEL, stroke_width=5, tip_length=0.2)
        t1 = M("2", size=44, color=YEL).next_to(a1, UP, buff=0.1)
        self.go("9:23.24", cur.animate.shift(RIGHT * 2 * ux), GrowArrow(a1), FadeIn(t1), run=1.0)
        e2 = eqf("y", "=", "f(", "x+2", ")", ref=eq, hi=3)
        self.go("9:25.82", TransformMatchingTex(e1, e2), FadeOut(a1), FadeOut(t1), run=0.5)
        a2 = Arrow(ax.c2p(-0.1, 2.7), ax.c2p(-2, 2.7), buff=0, color=YEL, stroke_width=5, tip_length=0.2)
        t2 = M("2", size=44, color=YEL).next_to(a2, UP, buff=0.1)
        self.go("9:26.94", cur.animate.shift(LEFT * 4 * ux), GrowArrow(a2), FadeIn(t2), run=1.0)
        bk = H("feels backwards", 40, YEL).next_to(e2, DOWN, buff=0.3, aligned_edge=LEFT)
        self.go("9:29.32", FadeIn(bk, shift=UP * 0.1), run=0.4)
        # why: the output f had at 0 now happens at x = 2
        self.go("9:31.36", FadeOut(bk), FadeOut(a2), FadeOut(t2), run=0.4)
        e3 = eqf("y", "=", "f(", "x-2", ")", ref=eq, hi=3)
        self.go("9:32.30", TransformMatchingTex(e2, e3), cur.animate.shift(RIGHT * 4 * ux), run=0.8)
        p0 = pt(ax, 0, 2)
        l0 = M("f(0)", size=42, color=ORG).next_to(p0, UL, buff=0.1)
        self.go("9:34.40", FadeIn(p0, scale=0.5), run=0.3)
        self.go("9:35.30", FadeIn(l0), run=0.4)
        p2 = pt(ax, 2, 2)
        drop = DashedLine(ax.c2p(2, 0), ax.c2p(2, 2), color=DIM, stroke_width=3, dash_length=0.08)
        l2 = M("f(2-2)", "=", "f(0)", size=42, color=ORG).next_to(p2, UR, buff=0.1)
        self.go("9:37.00", FadeIn(p2, scale=0.5), Create(drop), run=0.4)
        self.go("9:37.55", Write(l2), run=0.6)
        arr = Arrow(ax.c2p(0, 2), ax.c2p(2, 2), buff=0.12, color=YEL, stroke_width=4, tip_length=0.18)
        lu = M("+2", size=44, color=YEL).next_to(arr, UP, buff=0.12).shift(DOWN * 0.05)
        self.go("9:39.88", GrowArrow(arr), FadeIn(lu), run=0.5)
        # every point of f, two units later
        t = ValueTracker(0)
        pair = always_redraw(lambda: VGroup(
            pt(ax, t.get_value(), TF(t.get_value())), pt(ax, t.get_value() + 2, TF(t.get_value())),
            Arrow(ax.c2p(t.get_value(), TF(t.get_value())), ax.c2p(t.get_value() + 2, TF(t.get_value())), buff=0.12, color=YEL, stroke_width=4, tip_length=0.18)))
        self.go("9:40.44", FadeOut(VGroup(p0, p2, l0, l2, drop, arr, lu)), FadeIn(pair), run=0.3)
        self.play(t.animate.set_value(-1.8), run_time=1.0)
        self.play(t.animate.set_value(1.1), run_time=0.85)
        pair.clear_updaters()
        self.play(FadeOut(pair), cur.animate.shift(LEFT * 2 * ux), TransformMatchingTex(e3, eqf("y", "=", "f(x)", ref=eq)), run_time=0.45)


class K02_FlipStretch(Shot):
    def body(self):
        self.title("Transformations", animate=False)
        ax, cur, ghost, eq = tboard()
        o = ax.c2p(0, 0)
        self.add(ax, ax.labels, ghost, cur, eq)
        e1 = eqf("y", "=", "-", "f(x)", ref=eq, hi=2)
        self.go("9:45.42", TransformMatchingTex(eq, e1), run=0.5)
        self.go("9:46.98", cur.animate.stretch(-1, 1, about_point=o), run=1.0)
        self.go("9:48.84", ax.x_axis.animate.set_color(YEL), run=0.35)
        self.play(ax.x_axis.animate.set_color(DIM), run_time=0.4)
        e2 = eqf("y", "=", "f(x)", ref=eq)
        self.go("9:49.96", cur.animate.stretch(-1, 1, about_point=o), TransformMatchingTex(e1, e2), run=0.6)
        e3 = eqf("y", "=", "3", "f(x)", ref=eq, hi=2)
        self.go("9:52.18", TransformMatchingTex(e2, e3), run=0.5)
        self.go("9:54.00", cur.animate.stretch(3, 1, about_point=o), run=1.2)
        x3 = M(r"\times 3", size=50, color=YEL).move_to(ax.c2p(1.7, 5.4))
        self.go("9:55.40", FadeIn(x3, shift=LEFT * 0.1), run=0.4)
        # the example: (x-2)^2 + 1
        self.go("9:56.45", FadeOut(VGroup(ax, ax.labels, ghost, cur, e3, x3)), run=0.4)
        ax2 = axes((-2, 5, 1), (-1, 6, 1), x_length=6.3, y_length=4.6, center=(-2.9, -0.8, 0))
        ux, uy = units(ax2)
        self.play(Create(ax2), FadeIn(ax2.labels), run_time=0.45)
        ex = M("y", "=", "(x-2)^2", "+1", size=72).move_to([3.4, 1.6, 0])
        self.go("9:57.52", Write(ex[0:2]), run=0.4)
        self.go("9:58.28", Write(ex[2]), run=0.7)
        self.go("10:00.22", Write(ex[3]), run=0.4)
        par = curve(ax2, lambda x: x * x, [-1.6, 1.6])
        vtx = pt(ax2, 0, 0)
        self.go("10:02.14", draw(par, run=0.8), FadeIn(vtx), run=0.8)
        gh = DashedVMobject(par.copy().set_stroke(DIM, 3), num_dashes=30)
        mov = VGroup(par, vtx)
        self.go("10:03.98", FadeIn(gh), mov.animate.shift(RIGHT * 2 * ux), ex[2][2:4].animate.set_color(YEL), run=0.7)
        self.go("10:05.16", mov.animate.shift(UP * uy), ex[3].animate.set_color(YEL), run=0.5)
        guides = VGroup(DashedLine(ax2.c2p(2, 0), ax2.c2p(2, 1), color=DIM, stroke_width=3, dash_length=0.08),
                        DashedLine(ax2.c2p(0, 1), ax2.c2p(2, 1), color=DIM, stroke_width=3, dash_length=0.08))
        self.go("10:06.56", Create(guides), run=0.5)
        lab = M("(2,1)", size=48, color=ORG).next_to(ax2.c2p(2, 1), RIGHT, buff=0.3).shift(DOWN * 0.28)
        self.go("10:08.20", Write(lab), run=0.5)


# ================================================================ families: linear

class K02_Linear(Shot):
    def body(self):
        self.title("Families of Functions", "10:11.44")
        kinds = ["lin", "quad", "poly", "rat", "exp", "log"]
        names = ["Linear", "Quadratic", "Polynomial", "Rational", "Exponential", "Logarithm"]
        cs = [(-4.3, 1.05), (0, 1.05), (4.3, 1.05), (-4.3, -1.75), (0, -1.75), (4.3, -1.75)]
        frames = VGroup(*[RoundedRectangle(width=3.1, height=1.7, corner_radius=0.15, stroke_color=CHALK, stroke_width=3).move_to([x, y, 0]) for x, y in cs])
        graphs = VGroup(*[mini(k).move_to([x, y, 0]) for k, (x, y) in zip(kinds, cs)])
        labs = VGroup(*[H(n, 38).next_to(f, DOWN, buff=0.12) for n, f in zip(names, frames)])
        self.go("10:14.80", LaggedStart(*[Create(f) for f in frames], lag_ratio=0.12), run=0.9)
        self.go("10:15.72", LaggedStart(*[Create(g) for g in graphs], lag_ratio=0.12), run=1.1)
        self.go("10:16.90", LaggedStart(*[FadeIn(n, shift=UP * 0.1) for n in labs], lag_ratio=0.1), run=0.8)
        self.go("10:18.45", FadeOut(VGroup(frames[1:], graphs[1:], labs[1:])), Circumscribe(frames[0], color=YEL, buff=0.06), run=0.5)
        self.title("Linear Functions", "10:18.96")
        ax = axes((-3, 4, 1), (-2, 5, 1), x_length=5.6, y_length=4.6, center=(-3.4, -0.85, 0))
        self.play(FadeOut(VGroup(frames[0], graphs[0], labs[0])), Create(ax), FadeIn(ax.labels), run_time=0.5)
        m = ValueTracker(0.5)
        line0 = lseg(ax, 0.5)
        self.go("10:20.28", Create(line0), run=0.7)
        line = always_redraw(lambda: lseg(ax, m.get_value()))
        self.remove(line0)
        self.add(line)
        eq = M("y", "=", "m", "x", "+", "b", size=84).move_to([3.4, 1.55, 0])
        eq[2].set_color(PINK); eq[5].set_color(YEL)
        self.go("10:21.56", Write(eq), run=1.0)
        self.go("10:24.14", Circumscribe(eq[5], color=YEL, buff=0.1), run=0.6)
        lb = H("y-intercept", 38, YEL).next_to(eq[5], DOWN, buff=0.55)
        ab = Arrow(lb.get_top(), eq[5].get_bottom(), buff=0.08, color=YEL, stroke_width=3, tip_length=0.15)
        self.go("10:24.86", FadeIn(lb), GrowArrow(ab), run=0.5)
        bd = pt(ax, 0, 1, color=YEL)
        self.go("10:26.58", FadeIn(bd, scale=0.5), run=0.3)
        self.go("10:28.74", Circumscribe(eq[2], color=PINK, buff=0.1), run=0.6)
        lm = H("slope", 38, PINK).next_to(eq[2], DOWN, buff=0.55)
        am = Arrow(lm.get_top(), eq[2].get_bottom(), buff=0.08, color=PINK, stroke_width=3, tip_length=0.15)
        self.go("10:29.60", FadeIn(lm), GrowArrow(am), run=0.5)
        self.go("10:30.42", m.animate.set_value(1.5), run=1.0)
        rr = M(r"\text{slope}", "=", r"\frac{\text{rise}}{\text{run}}", size=60, color=PINK).move_to([3.4, -1.3, 0])
        self.go("10:32.50", Write(rr), run=0.9)
        # slope 3: one step right, three up
        self.go("10:34.96", m.animate.set_value(3), run=0.6)
        tri = rise_run(ax, 0, 1, 1, 4, run_tex="1", rise_tex="3", size=40)
        self.go("10:36.52", Create(tri[0]), FadeIn(tri[2]), run=0.5)
        self.go("10:38.08", Create(tri[1]), FadeIn(tri[3]), run=0.5)
        rr2 = M(r"\text{slope}", "=", r"\frac{3}{1}", "=", "3", size=60, color=PINK).move_to(rr, aligned_edge=LEFT)
        self.go("10:38.62", TransformMatchingTex(rr, rr2), run=0.5)
        # negative, zero
        self.go("10:39.68", FadeOut(tri), m.animate.set_value(-1), run=0.7)
        r3 = VGroup(M("m<0", size=60, color=PINK), H("downhill", 42, DIM)).arrange(RIGHT, buff=0.4).move_to(rr)
        self.go("10:40.40", FadeOut(rr2), FadeIn(r3), run=0.4)
        r4 = VGroup(M("m=0", size=60, color=PINK), H("flat", 42, DIM)).arrange(RIGHT, buff=0.4).move_to(rr)
        self.go("10:42.24", m.animate.set_value(0), FadeOut(r3), FadeIn(r4), run=0.6)


class K02_TwoPoints(Shot):
    def body(self):
        ax = axes((-1, 7, 1), (-1, 6, 1), x_length=6.0, y_length=4.6, center=(-3.4, -0.85, 0))
        self.go("10:44.00", Create(ax), FadeIn(ax.labels), run=0.5)
        self.title("Slope from Two Points", "10:45.10")
        L = lambda x: 2 + (2 / 3) * (x - 2)
        ln = curve(ax, L, [-0.8, 6.6])
        self.go("10:47.30", draw(ln, run=0.7), run=0.7)
        d1, d2 = pt(ax, 2, 2), pt(ax, 5, 4)
        l1 = M("(x_1,y_1)", size=42, color=ORG).next_to(d1, LEFT, buff=0.15).shift(UP * 0.35)
        l2 = M("(x_2,y_2)", size=42, color=ORG).next_to(d2, LEFT, buff=0.15).shift(UP * 0.35)
        self.go("10:48.16", FadeIn(d1, scale=0.5), Write(l1), run=0.5)
        self.go("10:50.38", FadeIn(d2, scale=0.5), Write(l2), run=0.5)
        tri = rise_run(ax, 2, 2, 5, 4, run_tex="x_2-x_1", rise_tex="y_2-y_1", size=34)
        fm = M("m", "=", r"\frac{y_2-y_1}{x_2-x_1}", size=66).move_to([2.6, 1.2, 0])
        fm[0].set_color(PINK)
        self.go("10:52.28", Write(fm[0:2]), run=0.4)
        self.go("10:52.98", Write(fm[2][0:5]), Create(tri[1]), FadeIn(tri[3]), run=0.8)
        self.go("10:54.68", Write(fm[2][5:]), Create(tri[0]), FadeIn(tri[2]), run=0.8)
        dd = M("=", r"\frac{\Delta y}{\Delta x}", size=66).next_to(fm, RIGHT, buff=0.25)
        self.go("10:57.80", Write(dd), run=0.8)
        # point-slope form
        top = VGroup(fm, dd)
        self.go("11:00.56", FadeOut(VGroup(d2, l2, tri)), top.animate.scale(0.7).move_to([3.4, 1.9, 0]).set_opacity(0.45), run=0.6)
        ms = M("m", size=48, color=PINK).next_to(ax.c2p(4.2, L(4.2)), UP, buff=0.25).shift(LEFT * 0.2)
        self.go("11:01.36", FadeIn(ms), run=0.4)
        self.go("11:01.92", Circumscribe(d1, shape=Circle, color=ORG, buff=0.12), run=0.6)
        ps = pill("Point-Slope Form", YEL, 42).move_to([3.4, 0.45, 0])
        self.go("11:04.02", FadeIn(ps, shift=UP * 0.1), run=0.5)
        pf = M("y", "-", "y_1", "=", "m", "(", "x", "-", "x_1", ")", size=70).move_to([3.4, -1.0, 0])
        pf[2].set_color(ORG); pf[8].set_color(ORG); pf[4].set_color(PINK)
        self.go("11:05.76", Write(pf[0:3]), run=0.7)
        self.go("11:07.14", Write(pf[3]), run=0.3)
        self.go("11:07.68", Write(pf[4]), run=0.3)
        self.go("11:08.54", Write(pf[5:]), run=0.8)
        # we'll use it for tangent lines
        g = lambda x: L(x) + 0.5 * (x - 2) ** 2
        cv = curve(ax, g, [-0.5, 4.2])
        self.go("11:12.38", draw(cv, run=0.8), ln.animate.set_color(PINK), FadeOut(ms), run=0.8)
        tl = H("tangent line", 38, PINK).next_to(ax.c2p(5.6, L(5.6)), DOWN, buff=0.5)
        self.go("11:13.30", FadeIn(tl, shift=UP * 0.1), run=0.4)


class K02_LineExample(Shot):
    def body(self):
        self.title("Point-Slope Example", "11:15.26")
        gm = M("m", "=", "4", size=62, color=PINK).move_to([-1.6, 1.65, 0])
        gp_ = M("(1,3)", size=62, color=ORG).move_to([1.6, 1.65, 0])
        self.go("11:15.94", Write(gm), run=0.5)
        self.go("11:17.34", Write(gp_), run=0.6)
        r1 = M("y-", "3", "=", "4", "(x-", "1", ")", size=66)
        r2 = M("y-", "3", "=", "4x-4", size=66)
        r3 = M("y", "=", "4x-1", size=66)
        r1[1].set_color(ORG); r1[3].set_color(PINK); r1[5].set_color(ORG); r2[1].set_color(ORG); r3[2].set_color(GRN)
        r1.move_to([0, 0.35, 0])
        r2.move_to([0, -0.75, 0]); r3.move_to([0, -1.85, 0])
        at_eq([r2], r1[2].get_center()[0], 2)
        at_eq([r3], r1[2].get_center()[0], 1)
        self.go("11:19.06", Write(r1[0:2]), run=0.5)
        self.go("11:20.10", Write(r1[2]), run=0.3)
        self.go("11:20.60", Write(r1[3:]), run=0.8)
        # distribute the 4
        a1 = CurvedArrow(r1[3].get_top() + UP * 0.08, r1[4][1].get_top() + UP * 0.08, angle=-PI / 2, color=PINK, stroke_width=3, tip_length=0.14)
        a2 = CurvedArrow(r1[3].get_top() + UP * 0.08, r1[5].get_top() + UP * 0.08, angle=-PI / 2, color=PINK, stroke_width=3, tip_length=0.14)
        self.go("11:24.80", Create(a1), Create(a2), run=0.6)
        self.go("11:26.92", Write(r2[0:2]), run=0.5)
        self.go("11:27.86", Write(r2[2]), run=0.3)
        self.go("11:28.28", Write(r2[3]), FadeOut(a1), FadeOut(a2), run=0.7)
        p3 = M(r"+3\ \text{both sides}", size=40, color=DIM).next_to(r2, RIGHT, buff=0.7)
        self.go("11:29.30", FadeIn(p3, shift=LEFT * 0.1), run=0.4)
        self.go("11:30.44", Write(r3), run=0.9)
        self.go("11:31.55", Create(answer_box(r3)), run=0.5)
        # remember slope: the derivative is slope for curves
        self.wipe("11:32.98", run=0.35)
        self.title("Remember Slope", "11:34.18")
        ax = axes((-1, 5, 1), (-1, 5, 1), x_length=6.5, y_length=3.6, center=(-0.6, -1.55, 0))
        self.go("11:35.42", Create(ax), FadeIn(ax.labels), run=0.5)
        ln = curve(ax, lambda x: 0.5 * x + 1, [-0.8, 4.6])
        self.go("11:36.00", draw(ln, run=0.8), run=0.8)
        hd = VGroup(H("derivative", 62, PINK), M("=", size=62), H("slope", 62, PINK)).arrange(RIGHT, buff=0.35).move_to([0, 1.45, 0])
        self.go("11:38.88", Write(hd[0]), run=0.6)
        self.go("11:40.10", FadeIn(hd[1]), Write(hd[2]), run=0.5)
        f = lambda x: 0.2 * x * x + 0.5
        self.go("11:41.44", Transform(ln, curve(ax, f, [-0.8, 4.6])), run=0.6)
        xt = ValueTracker(0.3)
        lt = live_tangent(ax, f, xt, length=2.4, readout_pos=np.array([4.5, -0.5, 0]), size=44)
        self.go("11:42.08", FadeIn(lt), run=0.3)
        self.play(xt.animate.set_value(4.0), run_time=1.35)


# ================================================================ quadratic, polynomial

class K02_QuadPoly(Shot):
    def body(self):
        self.title("Quadratic Functions", "11:44.10")
        ax = axes((-3, 3, 1), (-4, 4, 1), x_length=4.8, y_length=4.8, center=(-3.3, -0.85, 0))
        self.go("11:44.70", Create(ax), FadeIn(ax.labels), run=0.5)
        eq = M("y", "=", "x^2", size=84).move_to([3.4, 1.5, 0])
        self.go("11:46.50", Write(eq), run=0.7)
        par = curve(ax, lambda x: x * x, [-1.95, 1.95])
        self.go("11:48.18", draw(par, run=0.9), run=0.9)
        pl = H("parabola", 52, YEL).move_to([3.4, 0.25, 0])
        self.go("11:49.10", Write(pl), run=0.6)
        eq2 = M("y", "=", "-", "x^2", size=84).move_to(eq)
        eq2[2].set_color(YEL)
        self.go("11:52.16", TransformMatchingTex(eq, eq2), run=0.5)
        self.go("11:53.28", par.animate.stretch(-1, 1, about_point=ax.c2p(0, 0)), Transform(pl, H("opens down", 52, YEL).move_to(pl)), run=1.0)
        # polynomials
        self.wipe("11:54.90", run=0.35)
        self.title("Polynomials", "11:55.36")
        pw = M("x", r",\;", "x^2", r",\;", "x^3", r",\;\dots", size=66, color=YEL).move_to([0, 1.6, 0])
        self.go("11:57.44", Write(pw), run=0.7)
        self.go("11:58.68", Circumscribe(pw, color=YEL, buff=0.12), run=0.8)
        eqp = M("x^3", "-", "4x^2", "+", "5x", "-", "7", size=72).move_to([0, 1.6, 0])
        self.go("12:00.20", FadeOut(pw, shift=UP * 0.15), Write(eqp[0]), run=0.5)
        self.go("12:00.88", Write(eqp[1:3]), run=0.6)
        self.go("12:02.42", Write(eqp[3:5]), run=0.5)
        self.go("12:03.56", Write(eqp[5:]), run=0.4)
        ax2 = axes((-3, 3, 1), (-3, 3, 1), x_length=4.6, y_length=3.7, center=(-2.6, -1.6, 0), nums=False)
        f = lambda x: x ** 3 - 3 * x
        cv = curve(ax2, f, [-2.08, 2.08])
        tag = M("y=x^3-3x", size=34, color=DIM).next_to(ax2.c2p(2.08, f(2.08)), RIGHT, buff=0.15)
        self.go("12:04.98", Create(ax2), FadeIn(ax2.labels), run=0.5)
        self.go("12:05.54", draw(cv, run=0.8), FadeIn(tag), run=0.8)
        xt = ValueTracker(-2.0)
        rider = always_redraw(lambda: pt(ax2, xt.get_value(), f(xt.get_value())))
        self.go("12:06.42", FadeIn(rider), run=0.2)
        self.play(xt.animate.set_value(2.0), run_time=1.45, rate_func=linear)
        rider.clear_updaters()
        hd, vd = pt(ax2, -1, 2, color=YEL), pt(ax2, 1, -2, color=YEL)
        hl = H("hill", 38, YEL).next_to(hd, UP, buff=0.12)
        vl = H("valley", 38, YEL).next_to(vd, DOWN, buff=0.1).shift(RIGHT * 0.35)
        self.go("12:08.74", FadeOut(rider), FadeIn(hd, scale=0.5), FadeIn(hl), run=0.4)
        self.go("12:09.26", FadeIn(vd, scale=0.5), FadeIn(vl), run=0.4)
        pli = pill("Linear", BLUE, 40).move_to([3.6, -1.25, 0])
        pq = pill("Quadratic", BLUE, 40).move_to([3.6, -2.35, 0])
        self.go("12:10.14", FadeIn(pli, shift=UP * 0.15), run=0.4)
        self.go("12:10.76", FadeIn(pq, shift=UP * 0.15), run=0.4)
        fam = RoundedRectangle(width=4.4, height=3.3, corner_radius=0.3, stroke_color=PURP, stroke_width=4).move_to([3.6, -1.5, 0])
        ft = H("Polynomials", 44).move_to([3.6, -0.25, 0])
        self.go("12:12.26", Create(fam), Write(ft), run=0.8)


# ================================================================ rational

class K02_Rational(Shot):
    def body(self):
        self.title("Rational Functions", "12:14.40")
        ax = axes((-2, 8, 1), (-4, 6, 1), x_length=5.6, y_length=4.6, center=(-3.4, -0.85, 0), nums=False)
        self.go("12:15.00", Create(ax), FadeIn(ax.labels), run=0.5)
        gen = M(r"\frac{\text{polynomial}}{\text{polynomial}}", size=56).move_to([3.4, 1.5, 0])
        self.go("12:16.56", Write(gen), run=0.8)
        self.go("12:17.40", Circumscribe(gen[0][0:10], color=YEL, buff=0.06), run=0.5)
        self.go("12:17.92", Circumscribe(gen[0][11:], color=YEL, buff=0.06), run=0.5)
        e1 = M(r"\frac{1}{x}", size=64).move_to([1.9, -0.05, 0])
        orr = H("or", 38, DIM).move_to([3.05, -0.05, 0])
        e2 = M(r"\frac{x+1}{x-3}", size=64, color=BLUE).move_to([4.5, -0.05, 0])
        self.go("12:19.94", Write(e1), run=0.5)
        self.go("12:20.74", FadeIn(orr), run=0.3)
        self.go("12:21.32", Write(e2), run=0.8)
        g = lambda x: (x + 1) / (x - 3)
        lb, rb = curve(ax, g, [-1.9, 2.2]), curve(ax, g, [3.8, 7.8])
        self.go("12:22.20", draw(lb, run=0.6), run=0.6)
        self.play(draw(rb, run=0.6), run_time=0.6)
        # dividing by zero
        self.go("12:24.52", e2[0][4:].animate.set_color(RED), run=0.4)
        nt = H("can't be 0", 36, RED).next_to(e2, DOWN, buff=0.35)
        self.go("12:25.12", FadeIn(nt, shift=UP * 0.1), run=0.4)
        g3 = VGroup(Line(ax.c2p(3, 0) + UP * 0.1, ax.c2p(3, 0) + DOWN * 0.1, color=RED, stroke_width=4),
                    M("3", size=32, color=RED).next_to(ax.c2p(3, 0), DR, buff=0.08))
        self.go("12:27.22", FadeIn(g3), run=0.4)
        t = ValueTracker(7.0)
        rider = always_redraw(lambda: pt(ax, t.get_value(), g(t.get_value())))
        self.go("12:28.48", FadeIn(rider), run=0.2)
        self.play(t.animate.set_value(3.85), run_time=1.0)
        rider.clear_updaters()
        va = DashedLine(ax.c2p(3, -4), ax.c2p(3, 6), color=YEL, stroke_width=4, dash_length=0.14)
        ha = DashedLine(ax.c2p(-2, 1), ax.c2p(8, 1), color=YEL, stroke_width=4, dash_length=0.14)
        self.go("12:30.02", Create(va), Create(ha), FadeOut(rider), run=0.8)
        al = H("asymptotes", 40, YEL).move_to(ax.c2p(6.1, -1.6))
        self.go("12:31.24", Write(al), run=0.6)
        self.go("12:32.60", FadeOut(nt), run=0.3)
        lim = pill("Limits", YEL, 46).move_to([3.4, -1.9, 0])
        self.go("12:34.26", FadeIn(lim, shift=UP * 0.15), run=0.5)


# ================================================================ exponential, e

class K02_Exp(Shot):
    def body(self):
        self.title("Exponential Functions", "12:35.94")
        eq = M("y", "=", "2", "^{x}", size=84).move_to([-4.5, 1.5, 0])
        self.go("12:38.28", Write(eq), run=0.7)
        self.go("12:39.18", Circumscribe(eq[3], color=YEL, buff=0.08), run=0.6)
        ax = axes((0, 6, 1), (0, 35, 10), x_length=6.2, y_length=4.5, center=(2.6, -0.85, 0))
        self.go("12:42.34", Create(ax), FadeIn(ax.labels), run=0.6)
        rows, dots = [], []
        for k in range(6):
            r = M("2", "^{%d}" % k, "=", str(2 ** k), size=50)
            r[3].set_color(ORG)
            r.shift(np.array([-4.6, 0.6 - 0.62 * k, 0]) - r[2].get_center())
            rows.append(r)
            dots.append(pt(ax, k, 2 ** k))
        self.go("12:44.16", Write(rows[0][:3]), run=0.6)
        self.go("12:45.10", Write(rows[0][3]), FadeIn(dots[0], scale=0.5), run=0.4)
        self.go("12:45.90", Write(rows[1][:3]), run=0.5)
        self.go("12:46.70", Write(rows[1][3]), FadeIn(dots[1], scale=0.5), run=0.4)
        for k, t in zip(range(2, 6), ("12:47.58", "12:48.40", "12:49.02", "12:49.90")):
            self.go(t, Write(rows[k]), FadeIn(dots[k], scale=0.5), run=0.45)
        cv = curve(ax, lambda x: 2 ** x, [0, 5.1])
        self.go("12:50.40", draw(cv, run=0.8), run=0.8)
        xr = max(r[3].get_right()[0] for r in rows) + 0.15
        arcs = VGroup(*[CurvedArrow([xr, rows[k][3].get_center()[1], 0], [xr, rows[k + 1][3].get_center()[1], 0], angle=PI / 1.6,
                                    color=ORG, stroke_width=3, tip_length=0.12) for k in range(5)])
        x2 = M(r"\times 2", size=50, color=ORG).next_to(arcs, RIGHT, buff=0.25)
        self.go("12:51.34", LaggedStart(*[Create(a) for a in arcs], lag_ratio=0.2), run=0.6)
        self.go("12:51.96", FadeIn(x2, shift=LEFT * 0.1), run=0.4)
        # the special one: e
        self.wipe("12:52.80", run=0.35)
        self.title("The Number e", "12:53.76")
        ye = M("y", "=", "e", "^{x}", size=88).move_to([-3.6, 1.3, 0])
        ye[2].set_color(YEL)
        self.go("12:55.84", Write(ye), run=0.6)
        en = M("e", r"\approx", "2.718", size=72).move_to([-3.6, -0.05, 0])
        en[0].set_color(YEL); en[2].set_color(ORG)
        self.go("12:57.68", Write(en[0]), run=0.3)
        self.go("12:58.30", Write(en[1:]), run=0.7)
        en2 = M("e", r"\approx", r"2.718281828\dots", size=56).move_to(en, aligned_edge=LEFT)
        en2[0].set_color(YEL); en2[2].set_color(ORG)
        self.go("13:01.32", Transform(en, en2), run=0.7)
        ax = axes((-3, 2, 1), (0, 7, 2), x_length=5.0, y_length=4.4, center=(3.2, -0.8, 0))
        cv = curve(ax, np.exp, [-3, 1.9])
        self.go("13:03.46", Create(ax), FadeIn(ax.labels), run=0.4)
        self.play(draw(cv, run=0.8), run_time=0.8)
        dv = pill("Derivatives", PINK, 42).move_to([-3.6, -1.65, 0])
        self.go("13:05.86", FadeIn(dv, shift=UP * 0.15), run=0.5)
        xt = ValueTracker(-2.0)
        lt = live_tangent(ax, np.exp, xt, length=2.0, readout_pos=np.array([1.7, -1.0, 0]), size=40)
        self.go("13:06.40", FadeIn(lt), run=0.3)
        self.play(xt.animate.set_value(1.3), run_time=2.4)


# ================================================================ logarithms

class K02_Log(Shot):
    def body(self):
        self.title("Logarithms", "13:09.58")
        lg = M(r"\log_2 x", size=96, color=BLUE).move_to([-3.3, 0.4, 0])
        ex = M("2^{x}", size=96, color=BLUE).move_to([3.3, 0.4, 0])
        top = CurvedArrow([-1.7, 0.95, 0], [1.9, 0.95, 0], angle=-PI / 3, color=DIM, stroke_width=4, tip_length=0.2)
        bot = CurvedArrow([1.9, -0.15, 0], [-1.7, -0.15, 0], angle=-PI / 3, color=DIM, stroke_width=4, tip_length=0.2)
        opp = H("opposites", 40, DIM).move_to([0.1, 0.4, 0])
        self.go("13:10.68", Write(lg), run=0.6)
        self.go("13:12.42", Write(ex), Create(top), Create(bot), FadeIn(opp), run=0.7)
        # log base 2 of 8
        self.wipe("13:13.30", run=0.3)
        r1 = M(r"\log_2 8", "=", r"\text{?}", size=96)
        r2 = M("2", r"^{\text{?}}", "=", "8", size=96)
        r1.shift(np.array([0.3, 1.0, 0]) - r1[1].get_center())
        r2.shift(np.array([0.3, -0.65, 0]) - r2[2].get_center())
        r1[2].set_color(YEL); r2[1].set_color(YEL)
        self.go("13:13.80", Write(r1[0]), run=0.7)
        self.go("13:14.55", FadeIn(r1[1:]), run=0.3)
        asks = H("asks", 40, DIM).next_to(r2, LEFT, buff=0.7)
        self.go("13:15.24", FadeIn(asks), run=0.3)
        self.go("13:16.22", Write(r2), run=0.8)
        e3 = M("3", size=60, color=YEL).move_to(r2[1])
        self.go("13:18.32", ReplacementTransform(r2[1], e3), run=0.5)
        a = M("3", size=96, color=GRN).move_to(r1[2])
        self.go("13:20.10", ReplacementTransform(r1[2], a), run=0.4)
        self.go("13:20.55", Create(answer_box(a)), run=0.35)
        # natural log
        self.wipe("13:21.00", run=0.3)
        ln = M(r"\log_e x", "=", r"\ln x", size=100).move_to([0, 0.6, 0])
        ln[2].set_color(YEL)
        self.go("13:21.48", Write(ln[0]), run=0.6)
        self.go("13:22.58", Write(ln[1:]), run=0.6)
        nat = H("natural log", 56, YEL).next_to(ln[2], DOWN, buff=0.5)
        self.go("13:24.66", Write(nat), run=0.6)
        self.go("13:26.84", Create(box(ln[2], YEL, buff=0.15)), run=0.5)
        # the rules (builder 03 writes them out)
        self.wipe("13:28.35", run=0.3)
        self.title("Log Rules", "13:28.94")
        rl = VGroup(H("log of a product", 54), Arrow(LEFT * 0.6, RIGHT * 0.6, buff=0, color=DIM, stroke_width=5, tip_length=0.2),
                    H("sum of logs", 54, GRN)).arrange(RIGHT, buff=0.4).move_to([0, 0.4, 0])
        self.go("13:30.04", Write(rl[0]), run=0.7)
        self.go("13:31.18", GrowArrow(rl[1]), Write(rl[2]), run=0.7)
