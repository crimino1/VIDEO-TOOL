"""Builder 03: Part 4 (one-sided limits, the two-piece function, the big rule, two friends and a cafe),
Part 5 (three ways a limit fails: jump, blow up, wild wiggle), practice questions 2 and 3."""
from common import *

BOARDC = "#3b3a3e"


def nline(lo, hi, y, width=11.0):
    """Number line with integer ticks lo..hi. Returns (group, p(v) -> screen point, {k: label})."""
    u = width / (hi - lo + 1.2)
    x0 = -width / 2 + 0.6 * u
    p = lambda v: np.array([x0 + (v - lo) * u, y, 0])
    base = DoubleArrow(p(lo - 0.6), p(hi + 0.6), buff=0, color=DIM, stroke_width=3, tip_length=0.2)
    ticks = [Line(p(k) + UP * 0.12, p(k) + DOWN * 0.12, color=DIM, stroke_width=3) for k in range(lo, hi + 1)]
    labs = {k: M(str(k), size=40, color=DIM).next_to(p(k) + DOWN * 0.12, DOWN, buff=0.12) for k in range(lo, hi + 1)}
    return VGroup(base, *ticks, *labs.values()), p, labs


def arr(a, b, color, w=6, tip=0.24):
    return Arrow(a, b, buff=0, color=color, stroke_width=w, tip_length=tip,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


def hole(pt, color=BLUE, r=0.11):
    return Circle(radius=r, stroke_color=color, stroke_width=5, fill_color=BOARDC, fill_opacity=1).move_to(pt).set_z_index(3)


def fdot(pt, color=ORG, r=0.11):
    return Dot(pt, radius=r, color=color).set_z_index(3)


def axes(xr, yr, xl, yl, center, ticks=True):
    return Axes(x_range=xr, y_range=yr, x_length=xl, y_length=yl,
                axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, tick_size=0.06,
                                 include_ticks=ticks)).move_to(center)


def xy_labels(ax, size=38):
    return VGroup(M("x", size=size, color=DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.12),
                  M("y", size=size, color=DIM).next_to(ax.y_axis.get_end(), RIGHT, buff=0.12))


def lim(sub, rest, color=CHALK, size=56):
    """\\lim_{sub} f(x) = rest, the answer coloured."""
    m = M(r"\lim_{" + sub + "}", "f(x)", "=", rest, size=size)
    m[3].set_color(color)
    return m


def side_lim(sign, color, x):
    """x -> 2 with a big, clear coloured -/+ up on the 2."""
    base = M(r"x\to 2", size=110).move_to([x - 0.2, -2.25, 0])
    sg = M(sign, size=96, color=color)
    sg.move_to([base.get_right()[0] + 0.1 + sg.width / 2, base.get_top()[1] + 0.02, 0])
    return VGroup(base, sg)


def pause_sign():
    bars = VGroup(*[RoundedRectangle(width=0.22, height=0.7, corner_radius=0.06, stroke_color=YEL, stroke_width=5) for _ in range(2)]).arrange(RIGHT, buff=0.18)
    return VGroup(bars, H("Pause now", 50, YEL)).arrange(RIGHT, buff=0.35)


# ---------- the two-piece function: x+1 for x<2, 5 for x>=2 ----------

PAX_C = np.array([3.5, -0.6, 0])


def piece_axes():
    ax = axes([-1, 4.5, 1], [-1.5, 6.3, 1], 5.4, 5.6, PAX_C)
    xn = {k: M(str(k), size=34, color=DIM).next_to(ax.c2p(k, 0), DOWN, buff=0.12) for k in range(1, 5)}
    yn = {k: M(str(k), size=34, color=DIM).next_to(ax.c2p(0, k), LEFT, buff=0.12) for k in range(1, 6)}
    return ax, xn, yn


def piece_formula():
    lhs = M("f(x)", "=", size=62)
    v1, c1 = M("x+1", size=62), M("x<2", size=56, color=DIM)
    v2, c2 = M("5", size=62), M(r"x\ge 2", size=56, color=DIM)
    v1.move_to([0, 0.5, 0], aligned_edge=LEFT)
    v2.move_to([0, -0.5, 0], aligned_edge=LEFT)
    c1.move_to([2.1, 0.5, 0], aligned_edge=LEFT)
    c2.move_to([2.1, -0.5, 0], aligned_edge=LEFT)
    rows = VGroup(v1, c1, v2, c2)
    br = Brace(rows, LEFT, buff=0.2, color=CHALK)
    lhs.next_to(br, LEFT, buff=0.2)
    g = VGroup(lhs, br, rows)
    g.move_to([-3.45, 1.0, 0])
    return dict(lhs=lhs, br=br, v1=v1, c1=c1, v2=v2, c2=c2, all=g)


# ---------- stick figures and cafes ----------

GROUND = -2.0


def walker(xt, color):
    """A stick figure whose legs and arms swing as its x (the tracker) changes."""
    def mk():
        x = xt.get_value()
        s = abs(np.sin(x * 2.0))
        ph = 0.14 + 0.3 * s          # legs open and close with each step, never fully together
        hip = np.array([x, GROUND + 0.78, 0])
        neck = hip + UP * 0.68
        sh = neck + DOWN * 0.1
        leg = lambda a: hip + 0.8 * np.array([np.sin(a), -np.cos(a), 0])
        armp = lambda a: sh + 0.58 * np.array([np.sin(a), -np.cos(a), 0])
        k = dict(color=color, stroke_width=6)
        return VGroup(Circle(radius=0.22, stroke_width=6, color=color).move_to(neck + UP * 0.27),
                      Line(hip, neck, **k), Line(hip, leg(ph), **k), Line(hip, leg(-ph), **k),
                      Line(sh, armp(-0.38 - 0.2 * s), **k), Line(sh, armp(0.38 + 0.2 * s), **k))
    return always_redraw(mk)


def cafe(x, w=1.9, h=1.5):
    body = Rectangle(width=w, height=h, stroke_color=CHALK, stroke_width=4).move_to([x, GROUND + h / 2, 0])
    roof = Polygon([x - w / 2 - 0.25, GROUND + h, 0], [x + w / 2 + 0.25, GROUND + h, 0], [x, GROUND + h + 0.75, 0],
                   stroke_color=CHALK, stroke_width=4)
    door = Rectangle(width=0.45, height=0.75, stroke_color=CHALK, stroke_width=4).move_to([x, GROUND + 0.375, 0])
    sign = H("cafe", 36, YEL).move_to([x, GROUND + 1.12, 0])
    return VGroup(body, roof, door, sign)


# ---------- the 1/x graph ----------

def recip_axes():
    ax = axes([-3, 3, 1], [-6, 6, 1], 5.0, 5.3, [3.6, -0.55, 0], ticks=False)
    xyl = xy_labels(ax)
    xyl[1].next_to(ax.y_axis.get_end(), LEFT, buff=0.12)
    return ax, xyl


def recip_parts(ax):
    rb = ax.plot(lambda x: 1 / x, x_range=[1 / 5.3, 2.9], color=ORG, stroke_width=6)
    lb = ax.plot(lambda x: 1 / x, x_range=[-2.9, -1 / 5.3], color=BLUE, stroke_width=6)
    ua = arr(ax.c2p(0.75, 3.4), ax.c2p(0.75, 5.6), ORG, w=4, tip=0.2)
    da = arr(ax.c2p(-0.75, -3.4), ax.c2p(-0.75, -5.6), BLUE, w=4, tip=0.2)
    ui = M(r"\infty", size=56, color=ORG).next_to(ua, RIGHT, buff=0.15)
    di = M(r"-\infty", size=56, color=BLUE).next_to(da, LEFT, buff=0.15)
    return rb, lb, ua, da, ui, di


def recip_formula():
    return VGroup(M(r"f(x)=\frac{1}{x}", size=60), M(r"x\to 0", size=56, color=YEL)).arrange(RIGHT, buff=0.7).move_to([-3.3, 1.75, 0])


def table(cx, top, color, head_lab, step=0.75):
    colx = (cx - 0.82, cx + 0.8)
    frame = VGroup(Line([cx, top + 0.33, 0], [cx, top - 0.38 - 3 * step, 0], color=CHALK, stroke_width=3),
                   Line([cx - 1.55, top - 0.36, 0], [cx + 1.5, top - 0.36, 0], color=CHALK, stroke_width=3))
    head = VGroup(M("x", size=46).move_to([colx[0], top, 0]), M("f(x)", size=46).move_to([colx[1], top, 0]))
    lab = H(head_lab, 36, color).move_to([cx, top + 0.72, 0])
    cell = lambda i, j, s: M(s, size=40, color=color).move_to([colx[j], top - (i + 1) * step - 0.03, 0])
    return frame, head, lab, cell


# ---------- sin(1/x), sampled evenly in u = 1/x so every wiggle gets ~40 points ----------

GAP = 0.03


def wiggle_pts(ax, sign, x_far=1.0, x_near=GAP):
    us = np.arange(1 / x_far, 1 / x_near, 2 * PI / 40)
    return [ax.c2p(sign / u, np.sin(sign * u)) for u in us]


def wiggle_curve(ax, sign, color=BLUE, width=3):
    return VMobject(stroke_color=color, stroke_width=width).set_points_as_corners(wiggle_pts(ax, sign))


# ================================================================ Part 4

class K03_OneSided(Shot):
    def body(self):
        self.title("One-Sided Limits", "6:22.36")
        nl, p, labs = nline(0, 4, y=0.6)
        self.play(Create(nl), run_time=0.6)
        la = arr(p(0.2) + UP * 0.45, p(1.85) + UP * 0.45, BLUE)
        ra = arr(p(3.8) + UP * 0.45, p(2.15) + UP * 0.45, ORG)
        self.go("6:23.42", labs[2].animate.set_color(YEL), Create(la), Create(ra), run=0.9)
        ls = H("left side", 40, BLUE).next_to(la, UP, buff=0.25)
        rs = H("right side", 40, ORG).next_to(ra, UP, buff=0.25).match_y(ls)
        self.go("6:27.38", FadeIn(ls, shift=DOWN * 0.1), run=0.4)
        self.go("6:28.26", FadeIn(rs, shift=DOWN * 0.1), run=0.4)
        self.go("6:31.24", FadeOut(la), FadeOut(ra), FadeOut(ls), FadeOut(rs), run=0.4)
        # left-hand limit
        lh = H("left-hand limit", 48, BLUE).move_to([-3.4, -0.75, 0])
        self.go("6:33.08", Write(lh), run=0.6)
        self.go("6:34.60", Create(la), run=0.9)
        lnum = M(r"1.9,\ 1.99,\ 1.999", size=44, color=BLUE).next_to(la, UP, buff=0.25)
        self.go("6:36.88", Write(lnum), run=0.8)
        ln = side_lim("-", BLUE, -3.4)
        self.go("6:38.86", Write(ln[0]), run=0.6)
        self.go("6:39.40", Write(ln[1]), run=0.5)
        self.go("6:42.40", Circumscribe(ln[1], Circle, color=BLUE, buff=0.12), run=0.9)
        # right-hand limit
        rh = H("right-hand limit", 48, ORG).move_to([3.4, -0.75, 0]).align_to(lh, UP)
        self.go("6:43.88", Write(rh), run=0.6)
        self.go("6:45.36", Create(ra), run=0.9)
        rnum = M(r"2.1,\ 2.01,\ 2.001", size=44, color=ORG).next_to(ra, UP, buff=0.25)
        self.go("6:47.30", Write(rnum), run=0.8)
        rn = side_lim("+", ORG, 3.4)
        self.go("6:49.24", Write(rn[0]), run=0.6)
        self.go("6:49.94", Write(rn[1]), run=0.5)
        self.go("6:51.70", Circumscribe(rn[1], Circle, color=ORG, buff=0.12), run=0.9)


class K03_Piece(Shot):
    def body(self):
        self.title("One-Sided Limits", animate=False)
        self.title("A Two-Piece Function", "6:52.92")
        F = piece_formula()
        ax, xn, yn = piece_axes()
        xyl = xy_labels(ax)
        self.go("6:54.42", Create(ax), FadeIn(VGroup(*xn.values(), *yn.values()), xyl), run=0.7)
        self.go("6:56.10", Write(F["lhs"]), Create(F["br"]), run=0.6)
        self.go("6:57.50", Write(F["c1"]), run=0.6)
        self.go("6:59.42", Write(F["v1"]), run=0.5)
        p1 = ax.plot(lambda x: x + 1, x_range=[-0.95, 2], color=BLUE, stroke_width=6)
        h3 = hole(ax.c2p(2, 3), BLUE)
        self.play(Create(p1), run_time=0.7)
        self.play(FadeIn(h3, scale=0.5), run_time=0.25)
        self.go("7:00.96", Write(F["c2"]), run=0.6)
        self.go("7:03.62", Write(F["v2"]), run=0.4)
        p2 = Line(ax.c2p(2, 5), ax.c2p(4.3, 5), color=ORG, stroke_width=6)
        d5 = fdot(ax.c2p(2, 5), ORG)
        self.play(FadeIn(d5, scale=0.5), run_time=0.25)
        self.play(Create(p2), run_time=0.5)
        # from the left
        la = arr(ax.c2p(-0.6, -1.15), ax.c2p(1.75, -1.15), BLUE, w=5, tip=0.2)
        self.go("7:05.46", Create(la), run=0.6)
        b1 = box(VGroup(F["v1"], F["c1"]), BLUE, buff=0.12)
        self.go("7:07.40", Create(b1), run=0.5)
        xt = ValueTracker(0.0)
        mv = always_redraw(lambda: fdot(ax.c2p(xt.get_value(), xt.get_value() + 1), YEL, r=0.1).set_z_index(4))
        self.go("7:09.70", FadeIn(mv, scale=0.5), run=0.25)
        self.play(xt.animate.set_value(1.9), run_time=2.6)
        g3 = DashedLine(ax.c2p(1.9, 3), ax.c2p(0, 3), color=BLUE, stroke_width=3, dash_length=0.1)
        self.go("7:13.00", Create(g3), yn[3].animate.set_color(BLUE).scale(1.25), run=0.5)
        L = lim(r"x\to 2^-", "3", BLUE).move_to([-3.45, -1.0, 0])
        self.go("7:14.10", Write(L), run=0.9)
        # from the right
        mv.clear_updaters()
        ra = arr(ax.c2p(4.3, -1.15), ax.c2p(2.25, -1.15), ORG, w=5, tip=0.2)
        self.go("7:16.40", FadeOut(mv), FadeOut(b1), Create(ra), run=0.6)
        b2 = box(VGroup(F["v2"], F["c2"]), ORG, buff=0.12)
        self.go("7:18.40", Create(b2), run=0.5)
        xt2 = ValueTracker(4.1)
        mv2 = always_redraw(lambda: fdot(ax.c2p(xt2.get_value(), 5), YEL, r=0.1).set_z_index(4))
        self.go("7:19.40", FadeIn(mv2, scale=0.5), run=0.2)
        g5 = DashedLine(ax.c2p(2, 5), ax.c2p(0, 5), color=ORG, stroke_width=3, dash_length=0.1)
        self.play(xt2.animate.set_value(2.1), Create(g5), yn[5].animate.set_color(ORG).scale(1.25), run_time=1.1)
        R = lim(r"x\to 2^+", "5", ORG).move_to([-3.45, -2.5, 0])
        self.go("7:20.96", Write(R), run=0.9)
        mv2.clear_updaters()
        self.go("7:23.10", FadeOut(mv2), FadeOut(b2), Circumscribe(L[3], color=BLUE, buff=0.1), run=0.7)
        self.go("7:24.24", Circumscribe(R[3], color=ORG, buff=0.1), run=0.7)
        jmp = arr(ax.c2p(2.3, 3.15), ax.c2p(2.3, 4.85), YEL, w=5, tip=0.2)
        jl = H("jump", 40, YEL).next_to(jmp, RIGHT, buff=0.15)
        self.go("7:25.90", Create(jmp), FadeIn(jl, shift=LEFT * 0.1), run=0.5)


class K03_Rule(Shot):
    def body(self):
        self.title("A Two-Piece Function", animate=False)
        self.title("The Big Rule", "7:27.70")
        top = VGroup(H("two-sided limit", 52, YEL), H("exists only if", 52)).arrange(RIGHT, buff=0.4, aligned_edge=UP).move_to([0, 1.4, 0])
        self.go("7:29.98", Write(top[0]), run=0.7)
        self.go("7:31.10", Write(top[1]), run=0.6)
        eq = M(r"\lim_{x\to a^-} f(x)", "=", r"\lim_{x\to a^+} f(x)", size=64).move_to([0, -0.2, 0])
        eq[0].set_color(BLUE); eq[2].set_color(ORG)
        self.go("7:32.36", Write(eq[0]), run=0.7)
        self.go("7:33.56", Write(eq[2]), run=0.6)
        self.go("7:34.36", Write(eq[1]), run=0.4)
        self.go("7:35.50", FadeOut(top), FadeOut(eq), run=0.3)
        # the rule panel
        def row(rel, res, col):
            g = VGroup(H("left", 50, BLUE), M(rel, size=64, color=YEL), H("right", 50, ORG),
                       M(r"\longrightarrow", size=64, color=DIM), res)
            g.arrange(RIGHT, buff=0.35)
            return g
        r1 = row("=", H("limit exists", 50, GRN), GRN)
        r2 = row(r"\neq", M(r"\text{DNE}", size=60, color=RED), RED)
        rows = VGroup(r1, r2).arrange(DOWN, buff=0.55, aligned_edge=LEFT).move_to([-0.4, 0.95, 0])
        r2[4].align_to(r1[4], LEFT)
        fr = panel(rows, PURP, buff=0.4)
        self.go("7:35.82", Create(fr), Write(r1[0:3]), run=0.8)
        self.go("7:37.56", Create(r1[3]), Write(r1[4]), run=0.6)
        tk = tick_mark(s=0.42).next_to(fr, RIGHT, buff=0.3).match_y(r1)
        self.go("7:38.86", Create(tk), run=0.4)
        self.go("7:40.14", Write(r2[0:3]), run=0.7)
        self.go("7:42.04", Create(r2[3]), Write(r2[4]), run=0.6)
        cr = cross_mark(s=0.2).next_to(fr, RIGHT, buff=0.35).match_y(r2)
        self.go("7:42.76", Create(cr), run=0.4)
        # this example
        ex = M("3", r"\neq", "5", size=72).move_to([-4.4, -1.9, 0])
        ex[0].set_color(BLUE); ex[2].set_color(ORG)
        self.go("7:44.30", Write(ex), run=0.6)
        L = M(r"\lim_{x\to 2} f(x)", "=", r"\text{DNE}", size=64).move_to([1.4, -1.9, 0])
        L[2].set_color(RED)
        self.go("7:45.56", Write(L[0]), run=0.8)
        self.go("7:47.28", Write(L[1:]), run=0.6)
        self.go("7:49.82", Create(box(L[2], RED, buff=0.12)), run=0.5)
        dn = H("does not exist", 40, RED).next_to(L[2], DOWN, buff=0.3)
        self.go("7:50.74", FadeIn(dn, shift=UP * 0.1), run=0.5)


class K03_Friends(Shot):
    def body(self):
        self.title("The Big Rule", animate=False)
        ground = Line([-6.7, GROUND, 0], [6.7, GROUND, 0], color=DIM, stroke_width=3)
        a, b = ValueTracker(-6.0), ValueTracker(6.0)
        wa, wb = walker(a, BLUE), walker(b, ORG)
        self.play(Create(ground), run_time=0.2)
        self.title("Two Friends", "7:52.72")
        self.go("7:53.40", FadeIn(wa, shift=RIGHT * 0.2), FadeIn(wb, shift=LEFT * 0.2), run=0.35)
        self.go("7:53.76", a.animate.set_value(-4.3), b.animate.set_value(4.3), run=1.6, rate_func=linear)
        c = cafe(0)
        self.go("7:55.40", Create(c[:3]), Write(c[3]), a.animate.set_value(-1.8), b.animate.set_value(1.8), run=2.4)
        tk = tick_mark(s=0.55)
        meet = pill("same cafe: they meet", GRN, 42)
        lm = H("= a limit", 52, GRN)
        VGroup(tk, meet, lm).arrange(RIGHT, buff=0.35).move_to([0, 1.3, 0])
        self.go("7:58.82", FadeIn(meet, shift=DOWN * 0.1), run=0.5)
        self.go("7:59.80", Create(tk), Write(lm), run=0.6)
        # two different cafes
        self.go("8:01.02", FadeOut(c), FadeOut(meet), FadeOut(tk), FadeOut(lm), FadeOut(wa), FadeOut(wb), run=0.35)
        a.set_value(-6.2); b.set_value(6.2)
        wa, wb = walker(a, BLUE), walker(b, ORG)
        cl, cr = cafe(-2.6), cafe(2.6)
        self.play(FadeIn(wa), FadeIn(wb), run_time=0.3)
        self.go("8:01.92", Create(cl[:3]), Write(cl[3]), run=0.7)
        self.go("8:02.60", a.animate.set_value(-4.35), run=1.4, rate_func=linear)
        self.go("8:04.94", Create(cr[:3]), Write(cr[3]), run=0.7)
        self.go("8:05.70", b.animate.set_value(4.35), run=1.2, rate_func=linear)
        x = cross_mark(s=0.3).move_to([0, -1.2, 0])
        self.go("8:07.04", Create(x), run=0.4)
        nl = pill("different cafes: no limit", RED, 42).move_to([0, 1.25, 0])
        self.go("8:08.14", FadeIn(nl, shift=DOWN * 0.1), run=0.5)


# ================================================================ Part 5

class K03_Jump(Shot):
    def body(self):
        self.title("Three Ways to Fail", "8:12.84")
        t = H("3 ways a limit can fail", 60, YEL).move_to([0, 0.9, 0])
        self.go("8:13.40", Write(t), run=0.9)
        nums = VGroup(*[VGroup(Circle(radius=0.45, color=ORG, stroke_width=4), M(str(k), size=60, color=ORG)) for k in (1, 2, 3)])
        nums.arrange(RIGHT, buff=1.4).move_to([0, -1.0, 0])
        self.go("8:14.40", LaggedStart(*[Create(n[0]) for n in nums], lag_ratio=0.3), *[Write(n[1]) for n in nums], run=0.9)
        self.wipe("8:17.30", run=0.35)
        self.title("1. The Jump", "8:17.70")
        ax = axes([0, 4, 1], [0, 5, 1], 6.0, 4.4, [-2.4, -0.7, 0], ticks=False)
        xyl = xy_labels(ax)
        al = M("a", size=40, color=DIM).next_to(ax.c2p(2, 0), DOWN, buff=0.15)
        tka = Line(ax.c2p(2, 0) + UP * 0.08, ax.c2p(2, 0) + DOWN * 0.08, color=DIM, stroke_width=3)
        f1 = lambda x: 0.5 * x + 1.0
        f2 = lambda x: 4.2 - 0.25 * (x - 2)
        c1 = ax.plot(f1, x_range=[0.15, 2], color=BLUE, stroke_width=6)
        c2 = ax.plot(f2, x_range=[2, 3.8], color=ORG, stroke_width=6)
        h, d = hole(ax.c2p(2, 2), BLUE), fdot(ax.c2p(2, 4.2), ORG)
        self.go("8:19.34", Create(ax), FadeIn(xyl), FadeIn(al), Create(tka), run=0.5)
        self.play(Create(c1), run_time=0.5)
        self.play(FadeIn(h, scale=0.5), FadeIn(d, scale=0.5), Create(c2), run_time=0.5)
        la = arr(ax.c2p(0.8, f1(0.8) - 0.6), ax.c2p(1.75, f1(1.75) - 0.6), BLUE, w=5, tip=0.2)
        ra = arr(ax.c2p(3.5, f2(3.5) + 0.5), ax.c2p(2.3, f2(2.3) + 0.5), ORG, w=5, tip=0.2)
        self.go("8:21.30", Create(la), run=0.5)
        self.go("8:22.10", Create(ra), run=0.5)
        g1 = DashedLine(ax.c2p(2, 2), ax.c2p(0, 2), color=BLUE, stroke_width=3, dash_length=0.1)
        g2 = DashedLine(ax.c2p(2, 4.2), ax.c2p(0, 4.2), color=ORG, stroke_width=3, dash_length=0.1)
        self.go("8:23.18", Create(g1), Create(g2), run=0.6)
        jmp = arr(ax.c2p(2.0, 2.2), ax.c2p(2.0, 3.95), YEL, w=5, tip=0.2)
        self.go("8:24.50", Create(jmp), run=0.5)
        L = M(r"\lim_{x\to a} f(x)", "=", r"\text{DNE}", size=60).move_to([3.7, -0.4, 0])
        L[2].set_color(RED)
        self.go("8:25.68", Write(L), run=0.9)


class K03_BlowUp(Shot):
    def body(self):
        self.title("1. The Jump", animate=False)
        self.title("2. The Blow Up", "8:28.90")
        ax, xyl = recip_axes()
        fm = recip_formula()
        self.go("8:30.18", Create(ax), FadeIn(xyl), run=0.3)
        self.go("8:30.50", Write(fm[0]), run=0.9)
        self.go("8:32.30", Write(fm[1]), run=0.6)
        rb, lb, ua, da, ui, di = recip_parts(ax)
        # from the right
        fr, hd, lab, cell = table(-1.75, -0.05, ORG, "from the right")
        self.go("8:34.04", FadeIn(lab, shift=DOWN * 0.1), Create(fr), FadeIn(hd), run=0.6)
        for i, (xs, ys, tx, ty) in enumerate([("0.1", "10", "8:35.90", "8:38.98"),
                                              ("0.01", "100", "8:40.40", "8:42.30"),
                                              ("0.001", "1000", "8:43.70", "8:45.60")]):
            self.go(tx, Write(cell(i, 0, xs)), run=0.45)
            self.go(ty, Write(cell(i, 1, ys)), run=0.45)
        self.go("8:47.20", Create(rb), run=1.2)
        self.go("8:50.00", Create(ua), Write(ui), run=0.6)
        # from the left
        fl, hdl, labl, celll = table(-5.0, -0.05, BLUE, "from the left")
        self.go("8:51.90", FadeIn(labl, shift=DOWN * 0.1), Create(fl), FadeIn(hdl), run=0.6)
        for i, (xs, ys, tx, ty) in enumerate([("-0.1", "-10", "8:53.00", "8:55.50"),
                                              ("-0.01", "-100", "8:56.70", "8:57.10"),
                                              ("-0.001", "-1000", "8:58.20", "8:58.70")]):
            self.go(tx, Write(celll(i, 0, xs)), run=0.4)
            self.go(ty, Write(celll(i, 1, ys)), run=0.4)
        self.go("9:00.40", Create(lb), run=1.0)
        self.go("9:01.40", Create(da), Write(di), run=0.6)


class K03_Infinity(Shot):
    def body(self):
        self.title("2. The Blow Up", animate=False)
        ax, xyl = recip_axes()
        fm = recip_formula()
        rb, lb, ua, da, ui, di = recip_parts(ax)
        tabs = VGroup()
        for cx, col, lab_s, xs, ys in ((-1.75, ORG, "from the right", ("0.1", "0.01", "0.001"), ("10", "100", "1000")),
                                       (-5.0, BLUE, "from the left", ("-0.1", "-0.01", "-0.001"), ("-10", "-100", "-1000"))):
            fr, hd, lab, cell = table(cx, -0.05, col, lab_s)
            tabs.add(fr, hd, lab, *[cell(i, 0, s) for i, s in enumerate(xs)], *[cell(i, 1, s) for i, s in enumerate(ys)])
        self.add(ax, xyl, fm, rb, lb, ua, da, ui, di, tabs)
        self.play(FadeOut(tabs), run_time=0.4)
        xt = ValueTracker(2.4)
        mv = always_redraw(lambda: fdot(ax.c2p(xt.get_value(), 1 / xt.get_value()), YEL, r=0.1).set_z_index(4))
        self.go("9:03.50", FadeIn(mv, scale=0.5), run=0.25)
        self.play(xt.animate.set_value(1 / 5.2), run_time=1.1, rate_func=rate_functions.ease_in_sine)
        mv.clear_updaters()
        xt2 = ValueTracker(-2.4)
        mv2 = always_redraw(lambda: fdot(ax.c2p(xt2.get_value(), 1 / xt2.get_value()), YEL, r=0.1).set_z_index(4))
        self.go("9:05.30", FadeOut(mv), FadeIn(mv2, scale=0.5), run=0.25)
        self.play(xt2.animate.set_value(-1 / 5.2), run_time=1.1, rate_func=rate_functions.ease_in_sine)
        mv2.clear_updaters()
        q = VGroup(H("no number", 46, RED), cross_mark(s=0.2)).arrange(RIGHT, buff=0.3).move_to([-3.3, 0.4, 0])
        self.go("9:08.38", FadeOut(mv2), FadeIn(q[0], shift=UP * 0.1), Create(q[1]), run=0.5)
        L = M(r"\lim_{x\to 0}\frac{1}{x}", "=", r"\text{DNE}", size=60).move_to([-3.3, -1.3, 0])
        L[2].set_color(RED)
        self.go("9:10.00", Write(L), run=0.9)
        # infinity is an idea
        self.wipe("9:11.45", run=0.3)
        self.title("What Is Infinity?")
        inf = M(r"\infty", size=160, color=YEL).move_to([0, 0.9, 0])
        self.play(Write(inf), run_time=0.5)
        nn = VGroup(cross_mark(s=0.2), H("not a number", 52, RED)).arrange(RIGHT, buff=0.3).move_to([0, -0.6, 0])
        self.go("9:12.80", Create(nn[0]), Write(nn[1]), run=0.6)
        idea = H("an idea", 56, GRN).move_to([0, -0.6, 0])
        self.go("9:14.00", FadeOut(nn), FadeIn(idea, shift=UP * 0.1), run=0.5)
        gw = H("growing without end", 42, DIM).next_to(idea, DOWN, buff=0.3)
        self.go("9:15.20", Write(gw), run=0.8)
        nx = pill("Next episode: infinite limits", ORG, 38).move_to([0, -2.9, 0])
        self.go("9:17.60", FadeIn(nx, shift=UP * 0.15), run=0.5)


class K03_Wiggle(Shot):
    def body(self):
        self.title("2. The Blow Up", animate=False)
        self.title("3. The Wild Wiggle", "9:22.30")
        ax = axes([-1, 1, 1], [-1.5, 1.5, 1], 11.4, 3.6, [0, -1.0, 0], ticks=False)
        xyl = xy_labels(ax)
        self.go("9:23.86", Create(ax), FadeIn(xyl), run=0.6)
        right, left = wiggle_curve(ax, 1), wiggle_curve(ax, -1)
        self.go("9:24.40", Create(right), run=1.5, rate_func=linear)
        self.play(Create(left), run_time=1.5, rate_func=linear)
        zero = M("0", size=40, color=YEL).next_to(ax.c2p(0, -1.5), DOWN, buff=0.12)
        self.go("9:27.60", Write(zero), run=0.4)
        fx = M(r"f(x)=\sin\!\left(\frac{1}{x}\right)", size=60).move_to([-3.6, 1.7, 0])
        self.go("9:31.80", Write(fx), run=1.2)
        near = Rectangle(width=ax.c2p(0.12, 0)[0] - ax.c2p(-0.12, 0)[0], height=3.0, stroke_color=YEL, stroke_width=3).move_to(ax.c2p(0, 0))
        self.go("9:34.16", Create(near), run=0.5)
        bands = VGroup(*[DashedLine(ax.c2p(-1, v), ax.c2p(1, v), color=GRN, stroke_width=2.5, dash_length=0.12, stroke_opacity=0.8) for v in (1, -1)])
        bl = VGroup(M("1", size=40, color=GRN).next_to(ax.c2p(-1, 1), LEFT, buff=0.15),
                    M("-1", size=40, color=GRN).next_to(ax.c2p(-1, -1), LEFT, buff=0.15))
        self.go("9:37.36", FadeOut(near), Create(bands[1]), Write(bl[1]), run=0.5)
        self.go("9:38.40", Create(bands[0]), Write(bl[0]), run=0.5)
        ut = ValueTracker(2.5)
        mv = always_redraw(lambda: fdot(ax.c2p(1 / ut.get_value(), np.sin(ut.get_value())), YEL, r=0.1).set_z_index(4))
        self.go("9:40.30", FadeIn(mv, scale=0.5), run=0.2)
        self.play(ut.animate.set_value(30), run_time=1.5, rate_func=linear)
        mv.clear_updaters()
        dne = M(r"\text{DNE}", size=64, color=RED).move_to([4.6, 1.7, 0])
        self.go("9:42.20", FadeOut(mv), Write(dne), run=0.6)


class K03_Summary(Shot):
    def body(self):
        self.title("3. The Wild Wiggle", animate=False)
        self.title("3 Ways to Fail", "9:43.60")
        xs = (-4.4, 0, 4.4)
        pills = [pill(s, YEL, 44).move_to([x, 1.4, 0]) for s, x in zip(("Jump", "Blow up", "Wild wiggle"), xs)]
        axs = [axes([-1, 1, 1], [-1.2, 1.2, 1], 3.0, 2.2, [x, -0.5, 0], ticks=False) for x in xs]
        # mini sketches
        a = axs[0]
        jump = VGroup(a.plot(lambda x: 0.5 * x - 0.4, x_range=[-0.9, 0], color=BLUE, stroke_width=5),
                      Line(a.c2p(0, 0.7), a.c2p(0.9, 0.7), color=ORG, stroke_width=5),
                      hole(a.c2p(0, -0.4), BLUE, r=0.08), fdot(a.c2p(0, 0.7), ORG, r=0.08))
        b = axs[1]
        blow = VGroup(b.plot(lambda x: 0.12 / x, x_range=[0.1, 0.9], color=ORG, stroke_width=5),
                      b.plot(lambda x: 0.12 / x, x_range=[-0.9, -0.1], color=BLUE, stroke_width=5))
        c = axs[2]
        us = np.arange(1.2, 1 / 0.04, 2 * PI / 30)
        wig = VGroup(*[VMobject(stroke_color=BLUE, stroke_width=3).set_points_as_corners([c.c2p(s / u, 0.8 * np.sin(s * u)) for u in us]) for s in (1, -1)])
        for p_, ax_, sk, t in zip(pills, axs, (jump, blow, wig), ("9:45.84", "9:46.70", "9:47.24")):
            self.go(t, FadeIn(p_, shift=UP * 0.15), FadeIn(ax_), Create(sk), run=0.5)
        line = VGroup(H("any of these", 50), M(r"\longrightarrow", size=64, color=DIM), M(r"\text{DNE}", size=64, color=RED)).arrange(RIGHT, buff=0.4).move_to([0, -2.6, 0])
        self.go("9:48.90", Write(line[0]), run=0.6)
        self.go("9:50.30", Create(line[1]), Write(line[2]), run=0.6)


class K03_Questions(Shot):
    def body(self):
        self.title("Limit Practice")
        def qrow(lab, a, va, vb, y):
            g = VGroup(H(lab, 46, ORG), lim(r"x\to " + a + "^-", va, BLUE, 54), lim(r"x\to " + a + "^+", vb, ORG, 54))
            g.arrange(RIGHT, buff=0.6).move_to([0, y, 0])
            ask = M(r"\lim_{x\to " + a + r"} f(x)=\ ?", size=54, color=YEL).move_to([0, y - 1.15, 0]).align_to(g[1], LEFT)
            return g, ask
        q2, a2 = qrow("Question 2", "3", "7", "7", 1.5)
        q3, a3 = qrow("Question 3", "1", "-2", "4", -1.0)
        q3.align_to(q2, LEFT); a3.align_to(q3[1], LEFT)
        self.go("9:54.10", FadeIn(q2[0], shift=RIGHT * 0.1), run=0.4)
        self.go("9:55.90", Write(q2[1][:3]), run=0.8)
        self.go("9:58.40", Write(q2[1][3]), run=0.3)
        self.go("9:59.40", Write(q2[2][:3]), run=0.8)
        self.go("10:00.40", Write(q2[2][3]), run=0.3)
        self.go("10:01.70", Write(a2), run=0.7)
        self.go("10:04.16", FadeIn(q3[0], shift=RIGHT * 0.1), run=0.4)
        self.go("10:07.00", Write(q3[1][:3]), run=0.8)
        self.go("10:09.70", Write(q3[1][3]), run=0.3)
        self.go("10:11.10", Write(q3[2][:3]), run=0.8)
        self.go("10:12.10", Write(q3[2][3]), run=0.3)
        self.go("10:13.20", Write(a3), run=0.7)
        pz = pause_sign().move_to([0, -3.2, 0])
        self.go("10:14.40", Create(pz[0]), Write(pz[1]), run=0.6)


class K03_Answers(Shot):
    def body(self):
        self.title("Limit Practice", animate=False)
        self.title("Answers")
        def arow(lab, a, b, rel, res, rescol, y):
            g = VGroup(H(lab, 46, ORG), M(a, rel, b, size=68), M(r"\longrightarrow", size=60, color=DIM),
                       M(r"\lim_{x\to " + res[0] + "} f(x)", "=", res[1], size=60))
            g[1][0].set_color(BLUE); g[1][2].set_color(ORG); g[1][1].set_color(YEL)
            g[3][2].set_color(rescol)
            g[0].move_to([-4.75, y, 0]); g[1].move_to([-1.55, y, 0]); g[2].move_to([0.35, y, 0])
            g[3].move_to([1.2, y, 0], aligned_edge=LEFT)
            return g
        r2 = arow("Question 2", "7", "7", "=", ("3", "7"), GRN, 1.0)
        r3 = arow("Question 3", "-2", "4", r"\neq", ("1", r"\text{DNE}"), RED, -1.4)
        lr = VGroup(H("left", 36, BLUE).next_to(r2[1][0], DOWN, buff=0.2), H("right", 36, ORG).next_to(r2[1][2], DOWN, buff=0.2))
        self.go("10:15.65", FadeIn(r2[0], shift=RIGHT * 0.1), run=0.4)
        self.go("10:17.14", Write(r2[1]), FadeIn(lr), run=0.6)
        self.go("10:18.90", Circumscribe(r2[1], color=YEL, buff=0.12), run=0.8)
        self.go("10:20.20", Create(r2[2]), Write(r2[3]), run=0.8)
        self.go("10:21.80", Create(box(r2[3], GRN, buff=0.15)), run=0.5)
        self.go("10:22.82", FadeIn(r3[0], shift=RIGHT * 0.1), run=0.4)
        self.go("10:24.20", Write(r3[1][0]), run=0.3)
        self.go("10:24.80", Write(r3[1][2]), run=0.3)
        self.go("10:25.30", Write(r3[1][1]), run=0.4)
        self.go("10:26.30", Create(r3[2]), Write(r3[3]), run=0.7)
        self.go("10:27.10", Create(box(r3[3], GRN, buff=0.15)), run=0.45)
