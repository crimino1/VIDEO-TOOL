"""Builder 07: Part 9 (the limit game plan), Part 10 (final practice Q4-Q8), the first derivative secret,
the summary, rewatch note, Episode 3 teaser and the close."""
from common import *

BOARD_BG = "#3b3a3e"


# ---------------------------------------------------------------- helpers

def fr(top, bot, size=54, color=CHALK):
    """Hand-built fraction so single factors can be struck out: .n (numerator), .bar, .d (denominator)."""
    n = M(*top, size=size, color=color) if isinstance(top, (list, tuple)) else M(top, size=size, color=color)
    d = M(*bot, size=size, color=color) if isinstance(bot, (list, tuple)) else M(bot, size=size, color=color)
    w = max(n.width, d.width) + 0.2
    bar = Line([-w / 2, 0, 0], [w / 2, 0, 0], color=color, stroke_width=4)
    n.next_to(bar, UP, buff=0.12)
    d.next_to(bar, DOWN, buff=0.12)
    g = VGroup(n, bar, d)
    g.n, g.bar, g.d = n, bar, d
    return g


def LIM(a, size=54, color=CHALK):
    m = M(rf"\lim_{{x \to {a}}}", size=size, color=color)
    m.is_lim = True
    return m


def row(*items, buff=0.24):
    """Lay maths pieces left to right on one maths axis (fraction bars, '=' and 'lim' line up)."""
    g = VGroup(*items).arrange(RIGHT, buff=buff)
    for it in items:
        if hasattr(it, "bar"):
            it.shift(UP * (0 - it.bar.get_y()))
        elif getattr(it, "is_lim", False):
            it.shift(UP * (0.04 - it[0][0:3].get_y()))
        else:
            it.shift(UP * (0 - it.get_y()))
    return g


def put(g, x, y, ref=None):
    """Move row g so that ref (default its first piece) is centred at x on maths axis y."""
    ref = ref if ref is not None else g[0]
    ry = ref.bar.get_y() if hasattr(ref, "bar") else ref.get_y()
    return g.shift([x - ref.get_x(), y - ry, 0])


def put_right(g, x, y):
    """Row g with its right edge at x on maths axis y (left-hand sides end just before the '=' column)."""
    ref = g[-1]
    ry = ref.bar.get_y() if hasattr(ref, "bar") else ref.get_y()
    return g.shift([x - g.get_right()[0], y - ry, 0])


def qpill(n):
    return pill(f"Question {n}", YEL, 38).move_to([-5.0, 1.95, 0])


def side_note(label, m, pos):
    """Small side working: a DIM label above a maths piece."""
    lab = H(label, 34, DIM)
    return VGroup(lab, m).arrange(DOWN, buff=0.18).move_to(pos)


def badge(n):
    c = Circle(radius=0.28, stroke_color=YEL, stroke_width=4, fill_color=BOARD_BG, fill_opacity=1)
    return VGroup(c, M(str(n), size=38, color=YEL).move_to(c)).set_z_index(3)


def hole(p, color=BLUE, r=0.11):
    return Circle(radius=r, stroke_color=color, stroke_width=4, fill_color=BOARD_BG, fill_opacity=1).move_to(p).set_z_index(3)


def mpill(m, color=YEL, buff_x=0.32, buff_y=0.16, width=4):
    r = RoundedRectangle(width=m.width + 2 * buff_x, height=m.height + 2 * buff_y, corner_radius=min(0.35, (m.height + 2 * buff_y) / 2.2),
                         stroke_color=color, stroke_width=width).move_to(m)
    return VGroup(r, m)


def mini_axes(pos, w=2.0, h=1.3, xr=(-2, 2), yr=(-2, 2)):
    return Axes(x_range=[*xr, 1], y_range=[*yr, 1], x_length=w, y_length=h,
                axis_config=dict(color=DIM, stroke_width=2, include_tip=False, include_ticks=False, include_numbers=False)).move_to(pos)


def padlock(pos):
    body = RoundedRectangle(width=0.55, height=0.42, corner_radius=0.06, stroke_color=CHALK, stroke_width=4).move_to(pos)
    sh = Arc(radius=0.17, start_angle=0, angle=PI, color=CHALK, stroke_width=4).move_to(body.get_top() + UP * 0.12)
    return body, sh


# ================================================================ Part 9: the game plan

PX = (-4.6, 0.0, 4.6)  # column centres


def plan_top():
    t = H("plug in the number", 46)
    b = RoundedRectangle(width=t.width + 0.6, height=t.height + 0.4, corner_radius=0.2, stroke_color=CHALK, stroke_width=4)
    g = VGroup(b, t).move_to([0, 1.7, 0])
    bd = badge(1).next_to(g, LEFT, buff=0.3)
    return g, bd


def plan_branch(k, head):
    """Arrow from the top box down to column k's header, with its step badge on the arrow."""
    top = np.array([[-1.6, 1.22, 0], [0, 1.22, 0], [1.6, 1.22, 0]][k])
    end = np.array([PX[k], head.get_top()[1] + 0.12, 0])
    a = Arrow(top, end, buff=0, color=DIM, stroke_width=4, tip_length=0.18)
    bd = badge(k + 2).move_to((top + end) / 2 + (RIGHT * 0.45 if k == 1 else 0))
    return a, bd


def plan_col1():
    head = H("normal number", 42).move_to([PX[0], 0.2, 0])
    ans = H("that's the answer", 42, GRN).move_to([PX[0], -1.05, 0])
    dn = Arrow(head.get_bottom() + DOWN * 0.08, ans.get_top() + UP * 0.1, buff=0, color=DIM, stroke_width=4, tip_length=0.16)
    ok = tick_mark(GRN, 0.55).move_to([PX[0], -2.0, 0])
    return head, dn, ans, ok


def plan_col2():
    head = M(r"\frac{\text{nonzero}}{0}", size=48).move_to([PX[1] - 0.3, 0.2, 0])
    eg = M(r"\frac{5}{0}", size=44, color=ORG).next_to(head, RIGHT, buff=0.45)
    blow = H("blowing up", 42).move_to([PX[1], -0.95, 0])
    both = H("check both sides", 40).move_to([PX[1], -1.65, 0])
    res = M(r"\infty", r",\ -\infty", r",\ \text{DNE}", size=50, color=YEL).move_to([PX[1], -2.4, 0])
    nxt = pill("next episode", DIM, 32, width=3).move_to([PX[1], -3.25, 0])
    return head, eg, blow, both, res, nxt


def plan_board():
    """Everything Plan1 leaves on the board (Plan2 starts from it)."""
    top, b1 = plan_top()
    c1 = plan_col1()
    c2 = plan_col2()
    a1, b2 = plan_branch(0, c1[0])
    a2, b3 = plan_branch(1, c2[0])
    return dict(top=top, b1=b1, c1=c1, c2=c2, a1=a1, b2=b2, a2=a2, b3=b3)


class K07_Plan1(Shot):
    def body(self):
        P = plan_board()
        self.title("The Game Plan", "18:20.68")
        # step 1
        self.go("18:25.16", FadeIn(P["b1"], scale=0.8), run=0.4)
        self.go("18:26.10", Create(P["top"][0]), Write(P["top"][1]), run=0.9)
        # step 2: normal number -> answer
        head, dn, ans, ok = P["c1"]
        self.go("18:27.56", GrowArrow(P["a1"]), FadeIn(P["b2"], scale=0.8), run=0.5)
        self.go("18:29.40", Write(head), run=0.6)
        self.go("18:30.30", GrowArrow(dn), Write(ans), run=0.7)
        self.go("18:31.52", Create(ok), run=0.5)
        # step 3: nonzero over 0 -> blowing up
        h2, eg, blow, both, res, nxt = P["c2"]
        self.go("18:32.54", GrowArrow(P["a2"]), FadeIn(P["b3"], scale=0.8), run=0.5)
        self.go("18:34.24", Write(h2), run=0.9)
        self.go("18:36.40", FadeIn(eg, shift=LEFT * 0.15), run=0.5)
        self.go("18:38.50", Write(blow), run=0.6)
        self.go("18:39.52", FadeIn(both, shift=UP * 0.1), run=0.5)
        self.go("18:41.96", Write(res[0]), run=0.4)
        self.go("18:43.10", Write(res[1]), run=0.5)
        self.go("18:44.28", Write(res[2]), run=0.6)
        self.go("18:46.80", FadeIn(nxt, shift=UP * 0.1), run=0.5)


class K07_Plan2(Shot):
    def body(self):
        self.title("The Game Plan", animate=False)
        P = plan_board()
        self.add(P["top"], P["b1"], *P["c1"], *P["c2"], P["a1"], P["b2"], P["a2"], P["b3"])
        # step 4: 0/0 -> unlock
        head = M(r"\frac{0}{0}", size=54).move_to([PX[2], 0.2, 0])
        a3, b4 = plan_branch(2, head)
        self.go("18:47.52", GrowArrow(a3), FadeIn(b4, scale=0.8), run=0.5)
        self.go("18:49.28", Write(head), run=0.7)
        unl = H("unlock", 42, YEL).move_to([3.6, -0.9, 0], aligned_edge=LEFT)
        body, sh = padlock(unl.get_left() + LEFT * 0.55 + DOWN * 0.05)
        self.go("18:50.70", Create(body), Create(sh), Write(unl), run=0.6)
        self.play(sh.animate.shift(UP * 0.13), run_time=0.4)
        keys = []
        for y, s in ((-1.6, "factor"), (-2.25, "combine fractions"), (-2.9, "conjugate")):
            k = VGroup(Dot(radius=0.06, color=ORG), H(s, 36)).arrange(RIGHT, buff=0.18)
            k.move_to([2.85, y, 0], aligned_edge=LEFT)
            keys.append(k)
        self.go("18:51.94", FadeIn(keys[0], shift=UP * 0.1), run=0.5)
        self.go("18:53.76", FadeIn(keys[1], shift=UP * 0.1), run=0.6)
        self.go("18:58.34", FadeIn(keys[2], shift=UP * 0.1), run=0.5)
        again = H("then plug in again", 36, YEL).move_to([2.85, -3.5, 0], aligned_edge=LEFT)
        self.go("18:59.72", Write(again), run=0.7)
        self.play(Circumscribe(P["top"], color=YEL, stroke_width=4), run_time=0.7)

        # graph or table: read both sides
        self.wipe("19:01.15", run=0.3)
        self.title("Graph or Table?", "19:01.50")
        f = lambda x: 0.5 * x + 2
        ax = Axes(x_range=[0, 4, 1], y_range=[0, 4.5, 1], x_length=5.4, y_length=3.6,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, include_numbers=False)).move_to([-3.2, -0.6, 0])
        xl = M("x", size=40, color=DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.12)
        yl = M("y", size=40, color=DIM).next_to(ax.y_axis.get_end(), UP, buff=0.1)
        cv = VGroup(ax.plot(f, x_range=[0.1, 1.93], color=BLUE, stroke_width=5), ax.plot(f, x_range=[2.07, 3.9], color=BLUE, stroke_width=5))
        h = hole(ax.c2p(2, 3), BLUE)
        self.go("19:02.02", Create(ax), FadeIn(xl), FadeIn(yl), Create(cv), FadeIn(h), run=0.8)
        # the table
        rows = [("1.9", "2.95", BLUE), ("1.99", "2.995", BLUE), ("2.01", "3.005", ORG), ("2.1", "3.05", ORG)]
        tx, ty = 3.6, 1.3
        hx = M("x", size=44, color=DIM).move_to([tx - 0.9, ty, 0])
        hf = M("f(x)", size=44, color=DIM).move_to([tx + 0.9, ty, 0])
        hl = Line([tx - 1.9, ty - 0.33, 0], [tx + 1.9, ty - 0.33, 0], color=DIM, stroke_width=3)
        vl = Line([tx, ty + 0.3, 0], [tx, ty - 2.75, 0], color=DIM, stroke_width=3)
        cells = VGroup()
        for i, (a, b, c) in enumerate(rows):
            yy = ty - 0.72 - 0.6 * i
            cells.add(M(a, size=44, color=c).move_to([tx - 0.9, yy, 0]), M(b, size=44, color=c).move_to([tx + 0.9, yy, 0]))
        self.go("19:02.86", Create(hl), Create(vl), FadeIn(hx), FadeIn(hf), FadeIn(cells), run=0.6)
        # both sides, read where it is heading
        xa, xb = ValueTracker(0.3), ValueTracker(3.7)
        da = always_redraw(lambda: Dot(ax.c2p(xa.get_value(), f(xa.get_value())), radius=0.09, color=BLUE))
        db = always_redraw(lambda: Dot(ax.c2p(xb.get_value(), f(xb.get_value())), radius=0.09, color=ORG))
        self.go("19:03.52", FadeIn(da), FadeIn(db), run=0.3)
        self.play(xa.animate.set_value(1.82), xb.animate.set_value(2.18), run_time=1.6)
        agree = M(r"\text{left}", "=", r"\text{right}", size=54)
        agree[0].set_color(BLUE); agree[2].set_color(ORG)
        agree.move_to([3.6, -2.55, 0])
        self.go("19:06.26", Write(agree), run=0.7)
        self.play(Create(tick_mark(GRN, 0.5).next_to(agree, RIGHT, buff=0.3)), run_time=0.4)


# ================================================================ Part 10: final practice

class K07_Q4(Shot):
    def body(self):
        self.title("Final Practice", "19:11.00")
        nums = VGroup()
        for k in range(4, 9):
            c = Circle(radius=0.42, stroke_color=YEL, stroke_width=4)
            nums.add(VGroup(c, M(str(k), size=52).move_to(c)))
        nums.arrange(RIGHT, buff=0.55).move_to([0, 0.75, 0])
        self.go("19:11.50", LaggedStart(*[FadeIn(n, scale=0.8) for n in nums], lag_ratio=0.15), run=0.9)
        bars = VGroup(*[RoundedRectangle(width=0.17, height=0.52, corner_radius=0.07, color=YEL, stroke_width=5).move_to([dx, 0, 0]) for dx in (-0.14, 0.14)])
        w1 = VGroup(bars, H("pause", 46, YEL)).arrange(RIGHT, buff=0.25)
        w2 = H("solve", 46)
        w3 = H("check", 46, GRN)
        steps = VGroup(w1, w2, w3).arrange(RIGHT, buff=1.4).move_to([0, -1.2, 0])
        ar1 = Arrow(w1.get_right() + RIGHT * 0.15, w2.get_left() + LEFT * 0.15, buff=0, color=DIM, stroke_width=4, tip_length=0.18)
        ar2 = Arrow(w2.get_right() + RIGHT * 0.15, w3.get_left() + LEFT * 0.15, buff=0, color=DIM, stroke_width=4, tip_length=0.18)
        self.go("19:12.54", Create(bars), Write(w1[1]), run=0.6)
        self.go("19:14.00", GrowArrow(ar1), Write(w2), run=0.6)
        self.go("19:15.14", GrowArrow(ar2), Write(w3), run=0.6)

        # Question 4
        self.wipe("19:16.15")
        self.go("19:16.60", FadeIn(qpill(4), shift=DOWN * 0.1), run=0.4)
        L0 = M(r"\lim_{x \to 5}", r"(2x^2-3x)", "=", "2(", "5", ")^2-3(", "5", ")", size=60)
        L0[4].set_color(ORG); L0[6].set_color(ORG)
        L0.shift([0.3 - L0[2].get_x(), 0.6 - L0[2].get_y(), 0])
        self.go("19:17.98", Write(L0[0]), run=0.8)
        self.go("19:20.28", Write(L0[1]), run=1.0)
        self.go("19:23.74", Write(L0[2:]), run=1.0)
        L1 = M("=", "50", "-15", size=60)
        L1.shift([0.3 - L1[0].get_x(), -0.75 - L1[0].get_y(), 0])
        tmp = M(r"2\cdot 25", size=60).move_to(L1[1], aligned_edge=LEFT)
        self.go("19:24.84", Write(L1[0]), Write(tmp), run=0.7)
        self.go("19:26.06", ReplacementTransform(tmp, L1[1]), run=0.5)
        self.go("19:26.96", Write(L1[2]), run=0.5)
        L2 = M("=", r"\;35", size=60, color=GRN)
        L2[0].set_color(CHALK)
        L2.shift([0.3 - L2[0].get_x(), -2.1 - L2[0].get_y(), 0])
        self.go("19:28.38", Write(L2), run=0.5)
        self.play(Create(box(L2[1], GRN, buff=0.1)), run_time=0.4)
        self.wipe("19:29.30", run=0.3)


class K07_Q5(Shot):
    def body(self):
        self.title("Final Practice", animate=False)
        self.go("19:29.78", FadeIn(qpill(5), shift=DOWN * 0.1), run=0.4)
        EX = -1.4  # the '=' column
        F0 = fr(r"x^2+3x-4", "x-1", 56)
        L0 = put_right(row(LIM(1, 56), F0), EX - 0.25, 0.75)
        self.go("19:31.16", Write(L0[0]), run=0.6)
        self.go("19:33.38", Write(F0.n), run=1.4)
        self.go("19:35.80", Create(F0.bar), Write(F0.d), run=0.8)
        # plug in -> 0/0
        n00 = side_note("plug in 1:", M(r"\frac{0}{0}", size=56, color=YEL), [4.4, 1.0, 0])
        self.go("19:38.04", FadeIn(n00[0]), run=0.4)
        self.go("19:39.50", Write(n00[1]), run=0.7)
        # factor the top: which two numbers?
        ring = box(F0.n, YEL, buff=0.1)
        self.go("19:41.38", FadeOut(n00), Create(ring), run=0.5)
        p1 = M(r"?\cdot ?", "=", "-4", size=50).move_to([4.4, 0.95, 0])
        p2 = M(r"?+?", "=", "3", size=50)
        p2.shift([p1[1].get_x() - p2[1].get_x(), 0.1 - p2[1].get_y(), 0])
        self.go("19:43.32", Write(p1), run=0.8)
        self.go("19:45.06", Write(p2), run=0.7)
        q1 = M(r"4\cdot(-1)", size=50, color=ORG)
        q1.move_to(p1[0], aligned_edge=RIGHT)
        q2 = M(r"4+(-1)", size=50, color=ORG)
        q2.move_to(p2[0], aligned_edge=RIGHT)
        self.go("19:46.22", ReplacementTransform(p1[0], q1), ReplacementTransform(p2[0], q2), run=0.8)
        F1 = fr(["(x+4)", "(x-1)"], "x-1", 56)
        L1 = put(row(M("=", size=56), LIM(1, 56), F1), EX, -0.95)
        self.go("19:47.96", FadeOut(ring), Write(L1[0]), Write(L1[1]), run=0.5)
        self.go("19:48.40", Write(F1.n[0]), run=0.7)
        self.go("19:49.82", Write(F1.n[1]), Create(F1.bar), run=0.6)
        self.play(Write(F1.d), run_time=0.5)
        self.go("19:51.30", Create(strike(F1.n[1])), Create(strike(F1.d)), run=0.6)
        L2 = M("=", "1", "+4", "=", r"\;5", size=58)
        L2[1].set_color(ORG); L2[4].set_color(GRN)
        L2.shift([EX - L2[0].get_x(), -2.65 - L2[0].get_y(), 0])
        self.go("19:53.46", Write(L2[0:3]), run=0.6)
        self.go("19:54.38", Write(L2[3:]), run=0.4)
        self.play(Create(box(L2[4], GRN, buff=0.1)), run_time=0.4)
        self.wipe("19:55.20", run=0.3)


class K07_Q6(Shot):
    def body(self):
        self.title("Final Practice", animate=False)
        self.go("19:55.70", FadeIn(qpill(6), shift=DOWN * 0.1), run=0.4)
        EX = -2.5
        F0 = fr(r"\sqrt{x}-3", "x-9", 54)
        L0 = put_right(row(LIM(9, 54), F0), EX - 0.25, 0.85)
        self.go("19:57.10", Write(L0[0]), run=0.6)
        self.go("19:59.28", Write(F0.n), run=1.0)
        self.go("20:01.06", Create(F0.bar), Write(F0.d), run=0.8)
        n00 = side_note("plug in 9:", M(r"\frac{0}{0}", size=56, color=YEL), [4.4, 1.0, 0])
        self.go("20:03.04", FadeIn(n00[0]), Write(n00[1]), run=0.6)
        # times the conjugate
        conj = side_note("times the conjugate", M(r"\frac{\sqrt{x}+3}{\sqrt{x}+3}", size=54, color=YEL), [4.3, 0.95, 0])
        self.go("20:04.90", FadeOut(n00), FadeIn(conj[0]), run=0.5)
        self.go("20:07.46", Write(conj[1]), run=0.9)
        F1 = fr("x-9", ["(x-9)", r"(\sqrt{x}+3)"], 54)
        F1.d[1].set_color(YEL)
        L1 = put(row(M("=", size=54), LIM(9, 54), F1), EX, -0.8)
        self.go("20:09.38", Write(L1[0]), Write(L1[1]), run=0.5)
        self.go("20:10.10", Write(F1.n), Create(F1.bar), run=0.6)
        self.play(Write(F1.d), run_time=0.6)
        self.go("20:11.70", Create(strike(F1.n)), Create(strike(F1.d[0])), run=0.6)
        F2 = fr("1", r"\sqrt{x}+3", 54)
        F3 = fr("1", ["3", "+", "3"], 54)
        F3.d[0].set_color(ORG); F3.d[2].set_color(ORG)
        F4 = fr("1", "6", 58, GRN)
        L2 = put(row(M("=", size=54), LIM(9, 54), F2, M("=", size=54), F3, M("=", size=54), F4), EX, -2.45)
        self.go("20:13.62", Write(L2[0:3]), run=0.8)
        self.go("20:16.12", Write(L2[3]), run=0.3)
        self.go("20:17.42", Write(F3), run=0.7)
        self.go("20:19.38", Write(L2[5]), Write(F4), run=0.5)
        self.play(Create(box(F4, GRN, buff=0.1)), run_time=0.4)

        # the shortcut: x - 9 is a difference of squares
        self.wipe("20:20.64")
        sc = pill("Shortcut", ORG, 38).move_to([-5.0, 1.95, 0])
        self.go("20:21.92", FadeIn(sc, shift=DOWN * 0.1), run=0.4)
        D = M("x-9", "=", r"(\sqrt{x}-3)", r"(\sqrt{x}+3)", size=58)
        D.shift([-0.8 - D[1].get_x(), 0.75 - D[1].get_y(), 0])
        self.go("20:23.56", Write(D[0]), run=0.6)
        dsq = H("difference of squares", 36, DIM).next_to(D, DOWN, buff=0.3)
        self.go("20:24.80", FadeIn(dsq, shift=UP * 0.1), run=0.5)
        self.go("20:26.20", Write(D[1:3]), run=0.8)
        self.go("20:27.56", Write(D[3]), run=0.7)
        G = fr(r"\sqrt{x}-3", [r"(\sqrt{x}-3)", r"(\sqrt{x}+3)"], 52)
        G2 = fr("1", r"\sqrt{x}+3", 52)
        G3 = fr("1", "6", 56, GRN)
        L = row(LIM(9, 52), G, M("=", size=52), LIM(9, 52), G2, M("=", size=52), G3)
        L.move_to([0, -1.55, 0])
        put(L, L[1].get_x(), -1.55, ref=L[1])
        self.go("20:29.70", FadeOut(dsq), Write(L[0:2]), run=0.6)
        self.go("20:30.32", Create(strike(G.n)), Create(strike(G.d[0])), run=0.4)
        self.go("20:30.76", Write(L[2:5]), run=0.4)
        self.go("20:31.14", Write(L[5:]), run=0.4)
        same = box(G3, GRN, buff=0.1)
        self.play(Create(same), run_time=0.4)
        # more than one path
        a, b = np.array([-1.6, -3.2, 0]), np.array([1.6, -3.2, 0])
        paths = VGroup(ArcBetweenPoints(a, b, angle=-PI / 3, color=BLUE, stroke_width=4),
                       ArcBetweenPoints(a, b, angle=PI / 3, color=ORG, stroke_width=4))
        ends = VGroup(Dot(a, radius=0.08, color=CHALK), Dot(b, radius=0.09, color=GRN))
        pl = H("more than one path", 36, DIM).next_to(b, RIGHT, buff=0.5)
        self.go("20:32.44", FadeIn(ends), Create(paths), run=0.9)
        self.play(FadeIn(pl, shift=LEFT * 0.1), run_time=0.4)
        self.wipe("20:34.45", run=0.35)


class K07_Q7(Shot):
    def body(self):
        self.title("Final Practice", animate=False)
        self.go("20:35.06", FadeIn(qpill(7), shift=DOWN * 0.1), run=0.4)
        f = lambda x: 4 + 0.8 * (x - 2) - 0.25 * (x - 2) ** 2
        ax = Axes(x_range=[0, 4, 1], y_range=[0, 5, 1], x_length=5.6, y_length=3.8,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, include_numbers=False)).move_to([-2.9, -1.05, 0])
        xl = M("x", size=40, color=DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.12)
        yl = M("y", size=40, color=DIM).next_to(ax.y_axis.get_end(), RIGHT, buff=0.15)
        nums = VGroup(*[M(str(k), size=34, color=DIM).next_to(ax.c2p(k, 0), DOWN, buff=0.15) for k in (1, 3, 4)],
                      *[M(str(k), size=34, color=DIM).next_to(ax.c2p(0, k), LEFT, buff=0.15) for k in (1, 2, 3)])
        left = ax.plot(f, x_range=[0.15, 1.93], color=BLUE, stroke_width=5)
        right = ax.plot(f, x_range=[2.07, 3.85], color=BLUE, stroke_width=5)
        self.go("20:36.52", Create(ax), FadeIn(xl), FadeIn(yl), FadeIn(nums), run=0.7)
        xa = ValueTracker(0.25)
        da = always_redraw(lambda: Dot(ax.c2p(xa.get_value(), f(xa.get_value())), radius=0.09, color=BLUE))
        self.go("20:37.25", Create(left), run=0.6)
        self.add(da)
        self.go("20:37.90", xa.animate.set_value(1.8), run=1.5)
        two = M("2", size=40, color=YEL).next_to(ax.c2p(2, 0), DOWN, buff=0.15)
        h = hole(ax.c2p(2, 4), BLUE, 0.12)
        self.go("20:39.62", FadeIn(two), FadeIn(h), run=0.4)
        xb = ValueTracker(3.75)
        db = always_redraw(lambda: Dot(ax.c2p(xb.get_value(), f(xb.get_value())), radius=0.09, color=ORG))
        self.go("20:40.34", Create(right), run=0.7)
        self.add(db)
        self.play(xb.animate.set_value(2.2), run_time=1.2)
        val = Dot(ax.c2p(2, 1), radius=0.12, color=CHALK).set_z_index(3)
        f21 = M("f(2)", "=", "1", size=52).move_to([3.6, 0.9, 0])
        self.go("20:42.56", FadeIn(val, scale=0.5), Write(f21), run=0.7)
        ask = M(r"\lim_{x \to 2} f(x)", "=", r"\;\text{?}", size=56)
        ask.shift([f21[1].get_x() - ask[1].get_x(), -0.55 - ask[1].get_y(), 0])
        self.go("20:44.78", Write(ask), run=1.0)
        # both sides head to 4
        g4 = DashedLine(ax.c2p(0, 4), ax.c2p(2, 4) + LEFT * 0.14, color=YEL, stroke_width=3, dash_length=0.1)
        four = M("4", size=40, color=YEL).next_to(ax.c2p(0, 4), LEFT, buff=0.15)
        self.go("20:47.76", xa.animate.set_value(1.92), xb.animate.set_value(2.08), run=1.0)
        self.go("20:48.94", Create(g4), FadeIn(four), run=0.5)
        ans = M("4", size=60, color=GRN).move_to(ask[2], aligned_edge=LEFT)
        self.go("20:50.90", ReplacementTransform(ask[2], ans), run=0.4)
        self.play(Create(box(ans, GRN, buff=0.1)), run_time=0.4)
        # the value doesn't matter
        dm = H("doesn't matter", 38, DIM).next_to(f21, UP, buff=0.25)
        self.go("20:52.20", Circumscribe(val, Circle, color=YEL, stroke_width=3), run=0.8)
        self.go("20:53.58", f21.animate.set_color(DIM), FadeIn(dm, shift=DOWN * 0.1), run=0.5)
        self.wipe("20:54.30", run=0.3)


class K07_Q8(Shot):
    def body(self):
        self.title("Final Practice", animate=False)
        qp = qpill(8)
        ch = H("the challenge", 40, ORG).next_to(qp, RIGHT, buff=0.4)
        self.go("20:55.02", FadeIn(qp, shift=DOWN * 0.1), run=0.4)
        self.go("20:56.44", Write(ch), run=0.6)
        EX = -1.5
        F0 = fr(r"(x+3)^2-9", "x", 54)
        L0 = put_right(row(LIM(0, 54), F0), EX - 0.25, 0.75)
        self.go("20:57.68", Write(L0[0]), run=0.6)
        self.go("21:00.02", Write(F0.n), run=1.6)
        self.go("21:02.42", Create(F0.bar), Write(F0.d), run=0.6)
        # plug in
        pin = VGroup(M(r"\frac{9-9}{0}", size=54), M("=", size=54), M(r"\frac{0}{0}", size=54, color=YEL)).arrange(RIGHT, buff=0.2)
        n0 = side_note("plug in 0:", pin, [4.3, 0.95, 0])
        self.go("21:04.08", FadeIn(n0[0]), run=0.4)
        self.go("21:05.52", Write(pin[0]), run=1.2)
        self.go("21:09.20", Write(pin[1:]), run=0.6)
        # expand the top
        ring = box(F0.n, YEL, buff=0.1)
        self.go("21:11.08", FadeOut(n0), Create(ring), run=0.5)
        ex = M(r"(x+3)^2", "=", r"x^2+6x+9", size=48)
        ex.move_to([4.0, 0.95, 0])
        self.go("21:12.76", Write(ex[0]), run=0.6)
        self.go("21:14.38", Write(ex[1:]), run=1.0)
        F1 = fr(r"x^2+6x", "x", 54)
        L1 = put(row(M("=", size=54), LIM(0, 54), F1), EX, -0.7)
        self.go("21:17.80", FadeOut(ring), Write(L1[0:2]), run=0.5)
        self.go("21:18.36", Write(F1), run=0.9)
        F2 = fr(["x", "(x+6)"], "x", 54)
        L2 = put(row(M("=", size=54), LIM(0, 54), F2), EX, -2.1)
        self.go("21:20.56", Write(L2[0:2]), run=0.5)
        self.go("21:22.24", Write(F2), run=1.0)
        self.go("21:24.38", Create(strike(F2.n[0])), Create(strike(F2.d)), run=0.5)
        L3 = put(row(M("=", size=54), LIM(0, 54), M("(x+6)", size=54), M("=", size=54), M("0", "+6", size=54),
                     M("=", size=54), M("6", size=60, color=GRN), buff=0.18), EX, -3.25)
        self.go("21:26.30", Write(L3[0:3]), run=0.7)
        L3[4][0].set_color(ORG)
        L3[6].shift(RIGHT * 0.12)
        self.go("21:28.72", Write(L3[3:5]), run=0.6)
        self.go("21:29.94", Write(L3[5:]), run=0.35)
        self.play(Create(box(L3[6], GRN, buff=0.1)), run_time=0.35)
        self.wipe("21:30.95", run=0.35)


# ================================================================ the secret: your first derivative

class K07_Secret(Shot):
    def body(self):
        self.title("Final Practice", animate=False)
        self.title("Here's a Secret", "21:31.35")
        rec = M(r"\lim_{x \to 0}\frac{(x+3)^2-9}{x}", "=", "6", size=62).move_to([0, 0.75, 0])
        self.go("21:32.46", Write(rec), run=1.0)
        fd = H("your first derivative", 58, PINK).move_to([0, -1.05, 0])
        self.go("21:37.58", Write(fd), run=0.8)
        self.play(Create(brush_line(fd.width * 0.8, PINK, fd.get_bottom() + DOWN * 0.15, seed=3)), run_time=0.4)

        # how fast x^2 changes at x = 3
        self.wipe("21:39.20", run=0.35)
        ax = Axes(x_range=[0, 4, 1], y_range=[0, 16, 4], x_length=5.0, y_length=4.6,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18, include_numbers=False)).move_to([-3.4, -0.65, 0])
        nums = VGroup(*[M(str(k), size=34, color=DIM).next_to(ax.c2p(k, 0), DOWN, buff=0.15) for k in (1, 2, 4)],
                      *[M(str(k), size=34, color=DIM).next_to(ax.c2p(0, k), LEFT, buff=0.15) for k in (4, 8, 12, 16)])
        par = ax.plot(lambda x: x * x, x_range=[0, 3.95], color=BLUE, stroke_width=5)
        lab = M("y=x^2", size=48, color=BLUE).next_to(ax.c2p(3.95, 15.6), LEFT, buff=0.5)
        self.go("21:39.70", Create(ax), FadeIn(nums), run=0.6)
        self.go("21:40.26", Create(par), FadeIn(lab), run=0.9)
        guide = DashedLine(ax.c2p(3, 0), ax.c2p(3, 9), color=DIM, stroke_width=3, dash_length=0.1)
        three = M("3", size=40, color=ORG).next_to(ax.c2p(3, 0), DOWN, buff=0.15)
        pt = Dot(ax.c2p(3, 9), radius=0.1, color=YEL).set_z_index(3)
        self.go("21:41.66", Create(guide), FadeIn(three), FadeIn(pt, scale=0.5), run=0.5)
        tan = Line(ax.c2p(2.2, 4.2), ax.c2p(4.1, 15.6), color=PINK, stroke_width=5)
        self.go("21:42.96", Create(tan), run=0.7)
        run_l = Line(ax.c2p(3, 9), ax.c2p(4, 9), color=PINK, stroke_width=3)
        rise_l = Line(ax.c2p(4, 9), ax.c2p(4, 15), color=PINK, stroke_width=3)
        r1 = M("1", size=36, color=PINK).next_to(run_l, DOWN, buff=0.1)
        r6 = M("6", size=36, color=PINK).next_to(rise_l, RIGHT, buff=0.12)
        slope = M(r"\text{slope}", "=", "6", size=58, color=PINK).move_to([3.4, 1.25, 0])
        self.go("21:43.70", Create(run_l), Create(rise_l), FadeIn(r1), FadeIn(r6), Write(slope), run=0.8)
        # the beginner video rule
        bv = H("from the beginner video", 36, DIM).move_to([3.4, 0.05, 0])
        self.go("21:44.94", FadeIn(bv, shift=UP * 0.1), run=0.5)
        der = Tex(r"derivative of $x^2$ is ", r"$2x$", font_size=48, color=CHALK, tex_template=HANDTEX)
        der[1].set_color(PINK)
        der.move_to([3.4, -0.65, 0])
        self.go("21:47.42", Write(der), run=1.3)
        tt = M(r"2\cdot", "3", "=", "6", size=58)
        tt[1].set_color(ORG); tt[3].set_color(PINK)
        tt.move_to([3.4, -1.85, 0])
        self.go("21:50.32", Write(tt[0:2]), run=0.6)
        self.go("21:51.26", Write(tt[2:]), run=0.5)
        self.play(Circumscribe(slope, color=PINK, stroke_width=3), run_time=0.8)

        # you just did calculus
        self.wipe("21:52.96", run=0.35)
        big = H("You just did calculus!", 72, YEL).move_to([0, 0.1, 0])
        self.play(Write(big), run_time=1.0)
        self.play(Create(brush_line(big.width * 0.75, YEL, big.get_bottom() + DOWN * 0.2, seed=7)), run_time=0.4)


# ================================================================ summary

TXL = -2.6   # left edge of the summary text column
ICX = -4.9   # centre of the summary icon column


def sum1_parts():
    f = lambda x: 0.45 * x + 0.2
    # 1) where it is heading
    a1 = mini_axes([ICX, 1.3, 0])
    c1 = VGroup(a1.plot(f, x_range=[-1.9, -0.08], color=BLUE, stroke_width=4), a1.plot(f, x_range=[0.08, 1.9], color=BLUE, stroke_width=4))
    h1 = hole(a1.c2p(0, f(0)), BLUE, 0.08)
    t1 = VGroup(H("a limit", 42), M("=", size=48), H("where it's heading", 42, YEL)).arrange(RIGHT, buff=0.2).move_to([TXL, 1.5, 0], aligned_edge=LEFT)
    n1 = H("not where it is", 36, DIM).move_to([TXL, 0.9, 0], aligned_edge=LEFT)
    # 2) ignores the actual value
    a2 = mini_axes([ICX, -0.5, 0])
    c2 = VGroup(a2.plot(f, x_range=[-1.9, -0.08], color=BLUE, stroke_width=4), a2.plot(f, x_range=[0.08, 1.9], color=BLUE, stroke_width=4))
    h2 = hole(a2.c2p(0, f(0)), BLUE, 0.08)
    v2 = Dot(a2.c2p(0, 1.6), radius=0.08, color=CHALK)
    t2 = H("ignores the actual value", 42).move_to([TXL, -0.3, 0], aligned_edge=LEFT)
    n2 = H("only the approach", 36, DIM).move_to([TXL, -0.9, 0], aligned_edge=LEFT)
    # 3) one-sided limits must agree
    yl = -2.3
    base = Line([ICX - 1.1, yl, 0], [ICX + 1.1, yl, 0], color=DIM, stroke_width=3)
    tk = Line([ICX, yl + 0.12, 0], [ICX, yl - 0.12, 0], color=DIM, stroke_width=3)
    al = Arrow([ICX - 1.0, yl + 0.3, 0], [ICX - 0.1, yl + 0.3, 0], buff=0, color=BLUE, stroke_width=4, tip_length=0.16)
    ar = Arrow([ICX + 1.0, yl + 0.3, 0], [ICX + 0.1, yl + 0.3, 0], buff=0, color=ORG, stroke_width=4, tip_length=0.16)
    t3 = VGroup(M(r"x \to a^-", size=50, color=BLUE), H("and", 38, DIM), M(r"x \to a^+", size=50, color=ORG)).arrange(RIGHT, buff=0.3)
    t3.move_to([TXL, -2.1, 0], aligned_edge=LEFT)
    n3 = H("must agree", 40, YEL).move_to([TXL, -2.85, 0], aligned_edge=LEFT)
    ok = tick_mark(GRN, 0.45).next_to(n3, RIGHT, buff=0.3)
    return dict(a1=a1, c1=c1, h1=h1, t1=t1, n1=n1, a2=a2, c2=c2, h2=h2, v2=v2, t2=t2, n2=n2,
                base=base, tk=tk, al=al, ar=ar, t3=t3, n3=n3, ok=ok)


class K07_Sum1(Shot):
    def body(self):
        self.title("Today's Summary", "21:56.28")
        P = sum1_parts()
        self.go("21:58.42", Create(P["a1"]), Write(P["t1"][0]), run=0.6)
        xv = ValueTracker(-1.8)
        f = lambda x: 0.45 * x + 0.2
        dv = always_redraw(lambda: Dot(P["a1"].c2p(xv.get_value(), f(xv.get_value())), radius=0.07, color=YEL))
        self.go("21:59.72", Create(P["c1"]), FadeIn(P["h1"]), Write(P["t1"][1:]), run=0.8)
        self.add(dv)
        self.play(xv.animate.set_value(-0.2), run_time=1.2)
        self.go("22:03.02", FadeIn(P["n1"], shift=UP * 0.1), run=0.5)
        ul = brush_line(P["t1"][2].width + 0.2, YEL, P["t1"][2].get_bottom() + DOWN * 0.1, seed=2)
        self.go("22:04.40", Create(ul), run=0.5)
        self.go("22:05.84", Create(P["a2"]), Create(P["c2"]), FadeIn(P["h2"]), run=0.6)
        self.go("22:07.18", Write(P["t2"]), FadeIn(P["v2"], scale=0.5), run=0.8)
        self.go("22:09.06", FadeIn(P["n2"], shift=UP * 0.1), run=0.5)
        self.go("22:10.74", Create(P["base"]), Create(P["tk"]), run=0.5)
        self.go("22:12.62", GrowArrow(P["al"]), Write(P["t3"][0]), run=0.5)
        self.go("22:13.34", FadeIn(P["t3"][1]), GrowArrow(P["ar"]), Write(P["t3"][2]), run=0.5)
        self.go("22:15.20", Write(P["n3"]), run=0.6)
        self.go("22:16.74", Create(P["ok"]), run=0.4)
        self.remove(dv)
        self.add(Dot(P["a1"].c2p(-0.2, f(-0.2)), radius=0.07, color=YEL))


class K07_Sum2(Shot):
    def body(self):
        self.title("Today's Summary", animate=False)
        P = sum1_parts()
        f = lambda x: 0.45 * x + 0.2
        ul = brush_line(P["t1"][2].width + 0.2, YEL, P["t1"][2].get_bottom() + DOWN * 0.1, seed=2)
        self.add(*P.values(), ul, Dot(P["a1"].c2p(-0.2, f(-0.2)), radius=0.07, color=YEL))
        self.wipe("22:17.76", run=0.35)
        # 4) three ways to fail
        kx = -6.3  # keyword column left edge
        k4 = H("no limit:", 42, YEL).move_to([kx, 1.3, 0], aligned_edge=LEFT)
        self.go("22:18.18", Write(k4), run=0.5)
        icons = []
        ja = mini_axes([-1.6, 1.5, 0], 1.8, 1.1)
        jump = VGroup(Line(ja.c2p(-1.8, -0.8), ja.c2p(0, -0.8), color=BLUE, stroke_width=4),
                      Line(ja.c2p(0, 0.9), ja.c2p(1.8, 0.9), color=BLUE, stroke_width=4))
        ba = mini_axes([1.3, 1.5, 0], 1.8, 1.1)
        blow = VGroup(ba.plot(lambda x: 0.35 / x, x_range=[-1.9, -0.18], color=BLUE, stroke_width=4),
                      ba.plot(lambda x: 0.35 / x, x_range=[0.18, 1.9], color=BLUE, stroke_width=4))
        wa = mini_axes([4.2, 1.5, 0], 1.8, 1.1)
        wig = VGroup(*[wa.plot(lambda x: 1.2 * np.sin(1.6 / x), x_range=r, color=BLUE, stroke_width=3, use_smoothing=False)
                       for r in ([-1.9, -0.045, 0.003], [0.045, 1.9, 0.003])])
        for ax, cv, name, t in ((ja, jump, "jump", "22:19.64"), (ba, blow, "blow up", "22:20.44"), (wa, wig, "wiggle", "22:21.44")):
            lab = H(name, 36).next_to(ax, DOWN, buff=0.12)
            self.go(t, FadeIn(ax), Create(cv), FadeIn(lab, shift=UP * 0.1), run=0.6)
        # 5) limit laws, plug in
        k5 = H("limit laws", 42, YEL).move_to([kx, -0.25, 0], aligned_edge=LEFT)
        d5 = H("break it into pieces", 38).move_to([-1.9, -0.25, 0], aligned_edge=LEFT)
        self.go("22:23.12", Write(k5), run=0.5)
        self.go("22:24.12", FadeIn(d5, shift=LEFT * 0.1), run=0.5)
        k6 = H("nice functions", 42, YEL).move_to([kx, -1.0, 0], aligned_edge=LEFT)
        d6 = H("just plug in", 38).move_to([-1.9, -1.0, 0], aligned_edge=LEFT)
        self.go("22:26.62", Write(k6), run=0.5)
        self.go("22:28.18", FadeIn(d6, shift=LEFT * 0.1), run=0.5)
        # 6) 0/0 -> the three keys
        k7 = M(r"\frac{0}{0}", size=54, color=YEL).move_to([kx + 0.4, -2.35, 0])
        self.go("22:31.20", Write(k7), run=0.6)
        unl = H("unlock with", 38, DIM).move_to([kx + 1.15, -2.35, 0], aligned_edge=LEFT)
        self.go("22:32.74", FadeIn(unl, shift=LEFT * 0.1), run=0.4)
        x0 = unl.get_right()[0] + 0.35
        p1 = pill("factor", YEL, 36)
        p2 = pill("fractions", YEL, 36)
        p3 = pill("conjugate", YEL, 36)
        VGroup(p1, p2, p3).arrange(RIGHT, buff=0.25).move_to([x0, -2.35, 0], aligned_edge=LEFT)
        self.go("22:33.78", FadeIn(p1, shift=UP * 0.1), run=0.4)
        self.go("22:35.34", FadeIn(p2, shift=UP * 0.1), run=0.4)
        self.go("22:36.54", FadeIn(p3, shift=UP * 0.1), run=0.4)

        # rewatch
        self.wipe("22:37.94")
        self.title("Felt Tricky?", "22:38.30")
        z = M(r"\frac{0}{0}", size=64, color=YEL).move_to([2.0, 1.25, 0])
        self.go("22:40.24", Write(z), run=0.6)
        c = np.array([-3.2, 0.3, 0])
        loop = Arc(radius=1.05, start_angle=PI / 2 + 0.35, angle=TAU - 0.9, arc_center=c, color=YEL, stroke_width=6)
        loop.add_tip(tip_length=0.28)
        play = Polygon(c + [-0.3, 0.42, 0], c + [-0.3, -0.42, 0], c + [0.45, 0, 0], color=CHALK, stroke_width=5)
        rw = H("rewatch", 56, YEL).move_to([2.0, 0.0, 0])
        self.go("22:42.04", Create(loop), Create(play), Write(rw), run=0.8)
        rd = H("redo the practice", 44).move_to([2.0, -0.95, 0])
        self.go("22:42.88", FadeIn(rd, shift=UP * 0.1), run=0.5)
        keys = VGroup(pill("factor", DIM, 34, width=3), pill("fractions", DIM, 34, width=3), pill("conjugate", DIM, 34, width=3)).arrange(RIGHT, buff=0.35)
        keys.move_to([0, -2.6, 0])
        self.go("22:45.34", LaggedStart(*[FadeIn(k, shift=UP * 0.1) for k in keys], lag_ratio=0.3), run=0.9)
        ag = H("again and again", 36, DIM).next_to(keys, DOWN, buff=0.25)
        self.go("22:46.30", FadeIn(ag), run=0.5)
        self.at("22:47.85")
        self.clear_all()


# ================================================================ Episode 3 teaser

class K07_Next(Shot):
    def body(self):
        self.title("Next Episode", "22:48.78")
        ep = pill("Episode 3", CHALK, 44)
        lim = H("More Limits", 66, YEL)
        VGroup(ep, lim).arrange(RIGHT, buff=0.6).move_to([0, 1.55, 0])
        self.go("22:49.32", FadeIn(ep, shift=UP * 0.15), run=0.5)
        self.go("22:50.98", Write(lim), run=0.7)
        t1 = mpill(M(r"x \to \infty", size=56))
        t2 = pill("asymptotes", YEL, 42)
        t3 = pill("squeeze theorem", YEL, 42)
        VGroup(t1, t2, t3).arrange(RIGHT, buff=0.5).move_to([0, 0.0, 0])
        t4 = mpill(M(r"\lim_{x \to 0}\frac{\sin x}{x}", "=", "1", size=52))
        t5 = pill("continuity", YEL, 42)
        VGroup(t4, t5).arrange(RIGHT, buff=0.7).move_to([0, -1.9, 0])
        self.go("22:53.06", FadeIn(t1, shift=UP * 0.1), run=0.5)
        self.go("22:55.06", FadeIn(t2, shift=UP * 0.1), run=0.5)
        self.go("22:57.50", FadeIn(t3, shift=UP * 0.1), run=0.5)
        self.go("23:00.02", FadeIn(t4[0]), Write(t4[1]), run=1.0)
        self.go("23:04.64", FadeIn(t5, shift=UP * 0.1), run=0.5)


# ================================================================ like, share, goodbye

def share_icon(pos, s=0.32, color=BLUE):
    p = np.array(pos, float)
    a, b, c = p + [s, s, 0], p + [-s, 0, 0], p + [s, -s, 0]
    return VGroup(Line(a, b, color=color, stroke_width=3), Line(b, c, color=color, stroke_width=3),
                  *[Circle(radius=0.1, stroke_color=color, stroke_width=3, fill_color=BOARD_BG, fill_opacity=1).move_to(q) for q in (a, b, c)])


class K07_Close(Shot):
    def body(self):
        self.title("Like and Share", "23:13.00")
        lk = pill("like", YEL, 50)
        sh = pill("share", BLUE, 50)
        VGroup(lk, sh).arrange(RIGHT, buff=1.6).move_to([0, 0.6, 0])
        ic = share_icon(sh.get_right() + RIGHT * 0.65)
        self.go("23:15.18", FadeIn(lk, shift=UP * 0.1), run=0.4)
        self.go("23:15.76", FadeIn(sh, shift=UP * 0.1), Create(ic), run=0.5)
        fr_ = H("with a friend studying calculus", 42, DIM).move_to([0, -0.9, 0])
        self.go("23:16.36", FadeIn(fr_, shift=UP * 0.1), run=0.5)

        self.at("23:17.65")
        self.clear_all()  # calm closing board, as in Episode 1
        thanks = H("Thanks for learning with me", 62).move_to([0, 1.0, 0])
        line = brush_line(thanks.width * 0.7, center=thanks.get_bottom() + DOWN * 0.18, seed=5)
        self.go("23:18.14", Write(thanks), run=1.0)
        self.play(Create(line), run_time=0.4)
        keep = H("keep practicing", 50, YEL).move_to([0, -0.5, 0])
        self.go("23:20.12", Write(keep), run=0.7)
        see = H("see you in the next episode", 50, BLUE).move_to([0, -1.6, 0])
        self.go("23:21.70", Write(see), run=0.8)
