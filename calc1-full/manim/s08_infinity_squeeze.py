"""Builder 08: middle of Chapter 3. The biggest power wins (three cases), e^x / ln x / sin x at infinity,
a practice limit, the squeeze theorem (friends, x^2 sin(1/x)), and the famous sin x / x with related problems."""
from common import *

BOARDC = "#3b3a3e"
LINF = r"\lim_{x\to\infty}"
LIM0 = r"\lim_{x\to 0}"


# ---------------------------------------------------------------- local helpers

def fr(top, bot, size=64, color=CHALK):
    """Hand-built fraction so single pieces can be coloured or struck: .n (numerator parts), .bar, .d."""
    n = M(*top, size=size, color=color) if isinstance(top, (list, tuple)) else M(top, size=size, color=color)
    d = M(*bot, size=size, color=color) if isinstance(bot, (list, tuple)) else M(bot, size=size, color=color)
    w = max(n.width, d.width) + 0.2
    bar = Line([-w / 2, 0, 0], [w / 2, 0, 0], color=color, stroke_width=4)
    n.next_to(bar, UP, buff=0.13)
    d.next_to(bar, DOWN, buff=0.13)
    g = VGroup(n, bar, d)
    g.n, g.bar, g.d = n, bar, d
    return g


def lim_frac(lim, top, bot, size=64):
    """lim + hand-built fraction, lim's letters level with the bar. .l .f (.f.n .f.bar .f.d)."""
    f = fr(top, bot, size)
    l = M(lim, size=size)
    l.next_to(f, LEFT, buff=0.22)
    l.shift(UP * (f.bar.get_y() - l[0][0:3].get_y() + 0.04))
    g = VGroup(l, f)
    g.l, g.f = l, f
    return g


def eq_after(m, tex_parts, size=64, buff=0.25):
    """'= ...' placed right of m with the '=' level with m's fraction bar (or centre)."""
    e = M(*tex_parts, size=size)
    ref = m.f.bar.get_y() if hasattr(m, "f") else m.get_y()
    e.next_to(m, RIGHT, buff=buff)
    e.shift(UP * (ref - e[0].get_y()))
    return e


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


def ring(mob, color=ORG, buff=0.1):
    return Circle(radius=max(mob.width, mob.height) / 2 + buff, color=color, stroke_width=4).move_to(mob)


def rule_row(words, rhs, color=GRN, size=42, words2=None):
    """'words  =>  rhs' : chalk words, a maths arrow, a coloured maths result (or more words)."""
    a = H(words, size)
    b = M(r"\Rightarrow", size=size + 6, color=DIM)
    c = H(words2, size, color) if words2 else M(rhs, size=size + 10, color=color)
    return VGroup(a, b, c).arrange(RIGHT, buff=0.3)


def arr(p, q, color=DIM, w=4, tip=0.2):
    return Arrow(np.array(p, float), np.array(q, float), buff=0, stroke_width=w, tip_length=tip, color=color,
                 max_stroke_width_to_length_ratio=20, max_tip_length_to_length_ratio=0.4)


def rider(ax, f, xt, color=YEL, r=0.1):
    return always_redraw(lambda: Dot(ax.c2p(xt.get_value(), f(xt.get_value())), radius=r, color=color).set_z_index(6))


_DG = {}


def digits(s, size=48, color=CHALK):
    """A number built from cached glyphs (cheap to redraw every frame, no new LaTeX per value)."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.035, aligned_edge=DOWN)
    return g


# ================================================================ the biggest power wins

def power_board(top, bot, center, size=72):
    e = lim_frac(LINF, top, bot, size=size)
    e.move_to(center)
    return e


class K08_SamePower(Shot):
    def body(self):
        self.title("The Biggest Power Wins", "46:19.52")
        e = power_board(["3", "x^2", "+5"], ["2", "x^2", "-x"], [-1.6, 0.75, 0])
        n, d = e.f.n, e.f.d
        self.go("46:22.40", Write(e.l), run=0.7)
        self.play(Write(e.f), run_time=1.1)
        u1, u2 = under(n[0:2]), under(d[0:2])
        self.go("46:28.30", n[0:2].animate.set_color(YEL), n[2].animate.set_color(FAINT), Create(u1), run=0.6)
        self.go("46:30.10", d[0:2].animate.set_color(YEL), d[2].animate.set_color(FAINT), Create(u2), run=0.6)
        r = rule_row("same power", None, words2="ratio of the front numbers", color=ORG).move_to([0, -2.2, 0])
        self.go("46:32.10", FadeIn(r[0], shift=UP * 0.15), run=0.5)
        self.go("46:33.80", FadeIn(r[1]), Write(r[2]), run=0.9)
        self.go("46:34.75", n[0].animate.set_color(ORG), d[0].animate.set_color(ORG), run=0.4)
        self.play(Circumscribe(VGroup(n[0], d[0]), color=ORG, buff=0.08), run_time=0.9)
        ans = eq_after(e, ["=", r"\frac{3}{2}"], size=72)
        ans[1].set_color(GRN)
        self.go("46:37.20", Write(ans[0]), TransformFromCopy(n[0], ans[1][0]), Create(ans[1][1]),
                TransformFromCopy(d[0], ans[1][2]), run=0.7)
        self.play(Create(answer_box(ans[1])), run_time=0.4)


class K08_BottomBig(Shot):
    def body(self):
        self.title("The Biggest Power Wins", animate=False)
        self.title("Bottom Power Bigger", "46:38.80")
        r = rule_row("bottom bigger", "0").move_to([-3.55, 1.55, 0])
        self.go("46:39.30", FadeIn(r[0], shift=UP * 0.15), run=0.5)
        self.go("46:41.15", FadeIn(r[1]), Write(r[2]), run=0.5)
        f = lambda x: (4 * x + 1) / (x * x + 3)
        ax = axes((0, 20, 5), (0, 1.5, 0.5), x_length=6.0, y_length=4.0, center=(3.5, -0.9, 0))
        self.go("46:42.25", Create(ax), FadeIn(ax.labels), run=0.8)
        self.go("46:43.85", Create(under(r[0][0:6])), run=0.5)
        e = lim_frac(LINF, ["4x", "+1"], ["x^2", "+3"], size=64).move_to([-3.9, -0.7, 0])
        self.go("46:45.60", Write(e), run=0.9)
        self.go("46:46.45", e.f.n[0].animate.set_color(YEL), run=0.4)
        c = curve(ax, f, (0, 19.5))
        self.go("46:47.10", draw(c, run=1.0), e.f.d[0].animate.set_color(YEL), run=1.0)
        xt = ValueTracker(1.6)
        dot = rider(ax, f, xt)
        self.add(dot)
        floor = Line(ax.c2p(8, 0), ax.c2p(19.5, 0), color=YEL, stroke_width=6)
        self.play(xt.animate.set_value(19.5), Create(floor), run_time=1.3)
        ans = eq_after(e, ["=", "0"], size=64)
        ans[1].set_color(GRN)
        self.go("46:49.70", Write(ans), run=0.5)
        self.play(Create(answer_box(ans[1])), run_time=0.35)


class K08_TopBig(Shot):
    def body(self):
        self.title("Bottom Power Bigger", animate=False)
        self.title("Top Power Bigger", "46:50.85")
        r = rule_row("top bigger", r"\pm\infty").move_to([-3.55, 1.55, 0])
        self.go("46:51.25", FadeIn(r[0], shift=UP * 0.15), run=0.5)
        f = lambda x: x ** 3 / (x * x + 1)
        ax = axes((0, 6, 1), (0, 6, 1), x_length=5.4, y_length=4.3, center=(3.7, -0.85, 0))
        self.go("46:52.50", Create(ax), FadeIn(ax.labels), run=0.8)
        self.go("46:54.80", FadeIn(r[1]), Write(r[2]), run=0.6)
        e = lim_frac(LINF, ["x^3"], ["x^2", "+1"], size=64).move_to([-3.9, -0.55, 0])
        self.go("46:57.40", Write(e), run=0.9)
        self.go("46:58.45", e.f.n[0].animate.set_color(YEL), run=0.4)
        self.go("46:59.30", e.f.d[0].animate.set_color(YEL), run=0.4)
        c = curve(ax, f, (0, 4.9))
        xt = ValueTracker(0.0)
        dot = rider(ax, f, xt)
        self.go("47:00.25", draw(c, run=1.0), run=1.0)
        self.add(dot)
        self.play(xt.animate.set_value(4.9), run_time=1.3)
        line = DashedLine(ax.c2p(0, 0), ax.c2p(5.05, 5.05), color=DIM, stroke_width=3, dash_length=0.1)
        yx = M("y=x", size=40, color=DIM).next_to(ax.c2p(2.6, 2.6), UL, buff=0.15)
        like = M(r"\approx", r"\frac{x^3}{x^2}", "=", "x", size=60).next_to(e, DOWN, buff=0.45).align_to(e.f, LEFT)
        like[3].set_color(YEL)
        self.go("47:02.75", Write(like), Create(line), run=0.8)
        self.play(FadeIn(yx), run_time=0.3)
        tip = ax.c2p(4.9, f(4.9))
        up = arr(np.array(tip) + UP * 0.15, np.array(tip) + UP * 1.05, YEL, w=5)
        inf = M(r"\infty", size=56, color=YEL).next_to(up, UP, buff=0.1)
        self.go("47:04.70", GrowArrow(up), Write(inf), run=0.5)
        dot.clear_updaters()


class K08_ShowWork(Shot):
    def body(self):
        self.title("Top Power Bigger", animate=False)
        self.title("The Shortcut", "47:05.95")
        rows = VGroup(rule_row("same power", None, words2="front numbers", color=ORG, size=40),
                      rule_row("bottom bigger", "0", size=40),
                      rule_row("top bigger", r"\pm\infty", size=40)).arrange(DOWN, buff=0.5, aligned_edge=LEFT)
        rows.move_to([-2.85, -0.25, 0])
        self.play(LaggedStart(*[FadeIn(x, shift=UP * 0.12) for x in rows], lag_ratio=0.35), run_time=1.2)
        lab = H("dividing method", 40, DIM)
        m = M(r"\frac{3+\dfrac{5}{x^2}}{2-\dfrac{1}{x}}", size=60)
        g = VGroup(lab, m).arrange(DOWN, buff=0.35).move_to([3.9, -0.25, 0])
        self.go("47:08.30", FadeIn(lab, shift=UP * 0.1), Write(m), run=1.0)
        pn = panel(g, YEL)
        self.go("47:11.30", Create(pn), run=0.6)


# ================================================================ other functions at infinity

class K08_ExpInf(Shot):
    def body(self):
        self.title("The Shortcut", animate=False)
        self.title("Other Functions at Infinity", "47:12.75")
        ax = axes((-5, 5, 1), (0, 8, 2), x_length=10, y_length=4.3, center=(0, -1.1, 0))
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.8)
        lab = M("y=e^x", size=56, color=BLUE).next_to(ax.c2p(2.15, 6.6), RIGHT, buff=0.25)
        self.go("47:14.95", Write(lab), run=0.6)
        xr = curve(ax, np.exp, (0, 2.06))
        xl = curve(ax, np.exp, (-5, 0)).reverse_points()
        self.go("47:17.30", draw(xr, run=0.9), run=0.9)
        xt = ValueTracker(0)
        dot = rider(ax, np.exp, xt)
        self.add(dot)
        self.play(xt.animate.set_value(2.06), run_time=1.0)
        top = ax.c2p(2.06, np.exp(2.06))
        up = arr(np.array(top) + UP * 0.12, np.array(top) + UP * 0.95, YEL, w=5)
        inf = M(r"\infty", size=56, color=YEL).next_to(up, RIGHT, buff=0.12)
        self.go("47:20.45", GrowArrow(up), Write(inf), run=0.5)
        self.go("47:23.35", draw(xl, run=1.2), xt.animate.set_value(0), run=1.2)
        self.play(xt.animate.set_value(-5), run_time=1.6)
        dot.clear_updaters()
        c1 = M("e^{-10}", size=60).move_to([-4.4, 1.55, 0])
        c2 = M("=", r"\frac{1}{e^{10}}", size=60).next_to(c1, RIGHT, buff=0.2)
        c3 = M(r"\approx", "0.00005", size=56, color=ORG).next_to(c2, RIGHT, buff=0.2)
        self.go("47:28.05", Write(c1), run=0.7)
        self.go("47:30.20", Write(c2), run=0.7)
        self.go("47:32.40", Write(c3), run=0.6)
        asl = DashedLine(ax.c2p(-5, 0.03), ax.c2p(0, 0.03), color=YEL, stroke_width=5, dash_length=0.15)
        y0 = M("y=0", size=46, color=YEL).next_to(ax.c2p(-4.0, 0.4), UP, buff=0.12)
        self.go("47:35.35", Create(asl), run=0.8)
        self.go("47:37.00", Write(y0), run=0.5)
        nr = curve(ax, lambda x: np.exp(-x), (0, 5), color=ORG)
        nl = curve(ax, lambda x: np.exp(-x), (-2.06, 0), color=ORG).reverse_points()
        nlab = M("y=e^{-x}", size=56, color=ORG).next_to(ax.c2p(-2.15, 6.6), LEFT, buff=0.25)
        self.go("47:40.10", FadeOut(VGroup(c1, c2, c3), shift=UP * 0.1), FadeOut(dot),
                TransformFromCopy(VGroup(xl, xr), VGroup(nr, nl)), run=1.2)
        self.play(Write(nlab), run_time=0.5)
        xt2 = ValueTracker(0)
        d2 = rider(ax, lambda x: np.exp(-x), xt2, color=ORG)
        asr = DashedLine(ax.c2p(0, 0.03), ax.c2p(5, 0.03), color=YEL, stroke_width=5, dash_length=0.15)
        self.go("47:43.60", FadeIn(d2), run=0.2)
        self.play(xt2.animate.set_value(5), Create(asr), run_time=1.8)
        d2.clear_updaters()


def mug():
    body = VMobject(stroke_color=CHALK, stroke_width=5).set_points_as_corners(
        [[-0.55, 0.55, 0], [-0.47, -0.6, 0], [0.47, -0.6, 0], [0.55, 0.55, 0]])
    rim = Ellipse(width=1.1, height=0.22, color=CHALK, stroke_width=5).move_to([0, 0.55, 0])
    handle = Arc(radius=0.3, start_angle=-PI / 2, angle=PI, arc_center=[0.53, 0.0, 0], color=CHALK, stroke_width=5)
    steam = VGroup(*[VMobject(stroke_color=DIM, stroke_width=4).set_points_smoothly(
        [[x + 0.08 * np.sin(6 * y + k), y, 0] for y in np.linspace(0.85, 1.55, 12)]) for k, x in enumerate((-0.25, 0, 0.25))])
    return VGroup(body, rim, handle, steam)


def nucleus():
    pos = [(0, 0)] + [(0.34 * np.cos(a), 0.34 * np.sin(a)) for a in np.arange(6) * PI / 3]
    return VGroup(*[Circle(radius=0.19, stroke_color=(ORG if i % 2 else CHALK), stroke_width=4,
                           fill_color=BOARDC, fill_opacity=1).move_to([x, y, 0]) for i, (x, y) in enumerate(pos)])


def circuit():
    w, h = 2.4, 1.5
    L, R, T, B = -w / 2, w / 2, h / 2, -h / 2
    k = dict(color=CHALK, stroke_width=4)
    zz = VMobject(stroke_color=CHALK, stroke_width=4).set_points_as_corners(
        [[-0.5 + 0.125 * i, B + (0 if i in (0, 8) else (0.15 if i % 2 else -0.15)), 0] for i in range(9)])
    return VGroup(Line([L, T, 0], [-0.12, T, 0], **k), Line([0.12, T, 0], [R, T, 0], **k),
                  Line([-0.12, T - 0.32, 0], [-0.12, T + 0.32, 0], color=CHALK, stroke_width=7),
                  Line([0.12, T - 0.32, 0], [0.12, T + 0.32, 0], color=CHALK, stroke_width=7),
                  Line([L, T, 0], [L, B, 0], **k), Line([R, T, 0], [R, B, 0], **k),
                  Line([L, B, 0], [-0.5, B, 0], **k), zz, Line([0.5, B, 0], [R, B, 0], **k))


class K08_Decay(Shot):
    def body(self):
        self.title("Other Functions at Infinity", animate=False)
        self.title("Dying Away to 0", "47:47.10")
        ax = axes((0, 5, 1), (0, 1.3, 1), x_length=5.4, y_length=1.9, center=(0, 0.85, 0), nums=False, x_label="t", y_label=None)
        c = curve(ax, lambda x: np.exp(-0.9 * x), (0, 4.9))
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.6)
        self.go("47:48.10", draw(c, run=1.3), run=1.3)
        cup = mug().move_to([-4.4, -1.45, 0])
        nuc = nucleus().move_to([0, -1.6, 0])
        cap = circuit().move_to([4.4, -1.6, 0])
        labs = [H(s, 36, DIM).move_to([x, -3.05, 0]) for s, x in (("cooling coffee", -4.4), ("radioactive decay", 0), ("capacitor", 4.4))]
        self.go("47:52.35", Create(cup[:3]), FadeIn(labs[0], shift=UP * 0.1), run=0.8)
        self.play(Create(cup[3]), run_time=0.5)
        self.go("47:53.60", LaggedStart(*[GrowFromCenter(b) for b in nuc], lag_ratio=0.12), FadeIn(labs[1], shift=UP * 0.1),
                cup[3].animate.set_opacity(0.25), run=0.8)
        bits = VGroup(*[Dot(nuc.get_center(), radius=0.07, color=ORG) for _ in range(2)])
        self.add(bits)
        self.play(bits[0].animate.shift(np.array([1.1, 0.75, 0])).set_opacity(0),
                  bits[1].animate.shift(np.array([-1.0, 0.8, 0])).set_opacity(0), run_time=1.0)
        self.remove(bits)
        self.go("47:55.45", Create(cap), FadeIn(labs[2], shift=UP * 0.1), run=0.9)
        q = Dot(radius=0.08, color=YEL).move_to(cap[0].get_start())
        loop = VMobject().set_points_as_corners([cap[0].get_start(), cap[4].get_end(), cap[5].get_end(), cap[1].get_end()])
        self.play(MoveAlongPath(q, loop), run_time=1.0, rate_func=rate_functions.ease_out_sine)


class K08_LnSlow(Shot):
    def body(self):
        self.title("Dying Away to 0", animate=False)
        self.title("Slow Growth", "47:57.55")
        ax = axes((0, 50, 10), (-1, 5, 1), x_length=7.4, y_length=3.9, center=(-2.6, -1.05, 0))
        lab = M(r"y=\ln x", size=56, color=BLUE).move_to([-4.6, 1.6, 0])
        self.play(Create(ax), FadeIn(ax.labels), Write(lab), run_time=0.6)
        c = curve(ax, np.log, (0.37, 49))
        self.go("47:58.70", draw(c, run=1.3), run=1.3)
        xt = ValueTracker(1)
        dot = rider(ax, np.log, xt)
        self.go("48:00.30", FadeIn(dot), run=0.2)
        self.play(xt.animate.set_value(49), run_time=2.6, rate_func=linear)
        dot.clear_updaters()
        cx, top, step = 4.3, 1.55, 0.72
        xs, ys = (cx - 1.0, cx + 1.25)
        frame = VGroup(Line([cx + 0.25, top + 0.32, 0], [cx + 0.25, top - 0.38 - 4 * step, 0], color=CHALK, stroke_width=3),
                       Line([cx - 2.2, top - 0.36, 0], [cx + 2.2, top - 0.36, 0], color=CHALK, stroke_width=3))
        head = VGroup(M("x", size=46).move_to([xs, top, 0]), M(r"\ln x", size=46, color=BLUE).move_to([ys, top, 0]))
        vals = [("10", "2.3"), ("100", "4.6"), ("1000", "6.9"), ("1{,}000{,}000", "13.8")]
        cells = [(M(a, size=42).move_to([xs, top - (i + 1) * step, 0]), M(b, size=42, color=ORG if i == 3 else CHALK).move_to([ys, top - (i + 1) * step, 0]))
                 for i, (a, b) in enumerate(vals)]
        self.add(frame, head)
        self.play(FadeIn(VGroup(*cells[0]), shift=UP * 0.1), run_time=0.4)
        self.play(FadeIn(VGroup(*cells[1]), shift=UP * 0.1), run_time=0.4)
        self.play(FadeIn(VGroup(*cells[2]), shift=UP * 0.1), run_time=0.4)
        self.go("48:05.70", FadeIn(cells[3][0], shift=UP * 0.1), run=0.5)
        self.go("48:06.70", Write(cells[3][1]), run=0.5)
        self.play(Create(box(cells[3][1], ORG)), run_time=0.4)
        end = np.array(ax.c2p(49, np.log(49)))
        d = np.array(ax.c2p(50, np.log(50))) - np.array(ax.c2p(48, np.log(48)))
        d = d / np.linalg.norm(d)
        more = arr(end + d * 0.1, end + d * 1.0, YEL, w=5)
        nv = H("never levels off", 36, YEL).next_to(end, DOWN, buff=0.45).shift(LEFT * 1.1)
        self.go("48:08.70", GrowArrow(more), FadeIn(nv, shift=UP * 0.1), run=0.6)


class K08_TrigWave(Shot):
    def body(self):
        self.title("Slow Growth", animate=False)
        self.title("Sine and Cosine", "48:10.95")
        ax = axes((0, 25, 5), (-1.5, 1.5, 1), x_length=12.6, y_length=3.3, center=(0, -0.75, 0), nums=False, y_label=None)
        s = curve(ax, np.sin, (0, 24.5))
        c = curve(ax, np.cos, (0, 24.5), color=ORG)
        ls = M(r"\sin x", size=52, color=BLUE).move_to([-5.3, 1.65, 0])
        lc = M(r"\cos x", size=52, color=ORG).next_to(ls, RIGHT, buff=0.6)
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.4)
        self.go("48:11.85", FadeIn(ls), FadeIn(lc), run=0.3)
        self.play(Create(s), Create(c), run_time=3.0, rate_func=linear)
        bands = [DashedLine(ax.c2p(0, v), ax.c2p(24.8, v), color=GRN, stroke_width=3, dash_length=0.12) for v in (-1, 1)]
        bl = [M(t, size=40, color=GRN).next_to(ax.c2p(0, v), LEFT, buff=0.15) for t, v in (("-1", -1), ("1", 1))]
        self.go("48:15.60", Create(bands[0]), Write(bl[0]), run=0.6)
        self.go("48:16.60", Create(bands[1]), Write(bl[1]), run=0.6)
        dne = M(LINF, r"\sin x,\ \cos x", r"\;\;\text{DNE}", size=56).move_to([2.6, 1.65, 0])
        dne[2].set_color(RED)
        self.go("48:19.35", Write(dne[0:2]), run=0.6)
        self.play(Write(dne[2]), run_time=0.4)


class K08_Try(Shot):
    def body(self):
        self.title("Try This One", "48:23.05")
        e = power_board(["5", "x^3", "-x"], ["2", "x^3", "+7"], [-1.6, 0.75, 0])
        n, d = e.f.n, e.f.d
        self.go("48:23.60", Write(e.l), run=0.6)
        self.go("48:25.40", Write(n), run=1.0)
        self.go("48:27.40", Create(e.f.bar), Write(d), run=1.0)
        self.go("48:30.30", n[0:2].animate.set_color(YEL), n[2].animate.set_color(FAINT), Create(under(n[0:2])), run=0.6)
        self.go("48:33.00", d[0:2].animate.set_color(YEL), d[2].animate.set_color(FAINT), Create(under(d[0:2])), run=0.6)
        r = rule_row("same power", None, words2="ratio of the front numbers", color=ORG).move_to([0, -2.2, 0])
        self.go("48:35.65", FadeIn(r[0], shift=UP * 0.15), run=0.5)
        self.go("48:37.75", FadeIn(r[1]), Write(r[2]), run=0.8)
        self.go("48:38.50", n[0].animate.set_color(ORG), d[0].animate.set_color(ORG), run=0.35)
        self.play(Circumscribe(VGroup(n[0], d[0]), color=ORG, buff=0.08), run_time=0.8)
        ans = eq_after(e, ["=", r"\frac{5}{2}"], size=72)
        ans[1].set_color(GRN)
        self.go("48:39.85", Write(ans[0]), TransformFromCopy(n[0], ans[1][0]), Create(ans[1][1]),
                TransformFromCopy(d[0], ans[1][2]), run=0.6)
        self.play(Create(answer_box(ans[1])), run_time=0.4)


# ================================================================ the squeeze theorem

SIN1X = r"\sin\!\left(\frac{1}{x}\right)"


class K08_Squeeze(Shot):
    def body(self):
        self.title("Try This One", animate=False)
        self.title("The Squeeze Theorem", "48:43.80")
        aka = H("also called the Sandwich Theorem", 40, DIM).move_to([0, 1.85, 0])
        self.go("48:46.00", FadeIn(aka, shift=UP * 0.1), run=0.6)
        a, L = 3.0, 2.8
        g = lambda x: L - 0.33 * (x - a) ** 2
        h = lambda x: L + 0.3 * (x - a) ** 2
        f = lambda x: L + 0.27 * (x - a) ** 2 * np.sin(3.2 * x + 1.5)
        ax = axes((0, 6, 1), (0, 5.5, 1), x_length=8.6, y_length=4.2, center=(0.2, -1.2, 0), nums=False)
        self.go("48:50.50", FadeOut(aka), Create(ax), FadeIn(ax.labels), run=0.6)
        cg = curve(ax, g, (0.5, 5.5), color=CHALK, width=4)
        ch = curve(ax, h, (0.5, 5.5), color=CHALK, width=4)
        cf = curve(ax, f, (0.5, 5.5), width=5)
        lg = M("g(x)", size=44).next_to(ax.c2p(5.5, g(5.5)), RIGHT, buff=0.15)
        lh = M("h(x)", size=44).next_to(ax.c2p(5.5, h(5.5)), RIGHT, buff=0.15)
        lf = M("f(x)", size=44, color=BLUE).next_to(ax.c2p(5.5, f(5.5)), RIGHT, buff=0.15)
        self.go("48:52.20", draw(cg, run=0.9), FadeIn(lg), run=0.9)
        self.go("48:53.30", draw(ch, run=0.9), FadeIn(lh), run=0.9)
        self.go("48:54.30", draw(cf, run=1.0), FadeIn(lf), run=1.0)
        ineq = M("g(x)", r"\le", "f(x)", r"\le", "h(x)", size=56).move_to([-3.3, 1.8, 0])
        ineq[2].set_color(BLUE)
        self.play(Write(ineq), run_time=0.8)
        tg, th = ValueTracker(0.5), ValueTracker(5.5)
        dg, dh = rider(ax, g, tg, color=CHALK, r=0.09), rider(ax, h, th, color=CHALK, r=0.09)
        self.go("48:56.70", FadeIn(dg), FadeIn(dh), run=0.2)
        self.play(tg.animate.set_value(a), th.animate.set_value(a), run_time=1.6)
        lev = DashedLine(ax.c2p(0, L), ax.c2p(a, L), color=YEL, stroke_width=3, dash_length=0.1)
        ll = M("L", size=46, color=YEL).next_to(ax.c2p(0, L), LEFT, buff=0.15)
        la = M("a", size=44, color=DIM).next_to(ax.c2p(a, 0), DOWN, buff=0.15)
        tick = DashedLine(ax.c2p(a, 0), ax.c2p(a, L), color=DIM, stroke_width=2, dash_length=0.08)
        self.go("48:58.80", Create(lev), Write(ll), Create(tick), FadeIn(la), run=0.6)
        tf = ValueTracker(0.5)
        df = rider(ax, f, tf, color=YEL)
        self.go("49:00.25", FadeIn(df), run=0.2)
        self.play(tf.animate.set_value(a), run_time=2.2)
        for d in (dg, dh, df):
            d.clear_updaters()
        pinch = Circle(radius=0.32, color=YEL, stroke_width=4).move_to(ax.c2p(a, L))
        self.go("49:02.75", Create(pinch), run=0.5)
        res = M(r"\Rightarrow", r"\lim_{x\to a} f(x)", "=", "L", size=56).move_to([3.1, 1.8, 0])
        res[1].set_color(BLUE); res[3].set_color(YEL)
        self.go("49:03.75", Write(res), run=0.9)


def friend(xt, off, color, hold_l, hold_r, ground=-2.4):
    """Stick figure walking with the group tracker; arms reach to the neighbours' hands when holding."""
    def mk():
        x = xt.get_value() + off
        s = np.sin(xt.get_value() * 2.4)
        hip = np.array([x, ground + 0.8, 0])
        neck = hip + UP * 0.68
        sh = neck + DOWN * 0.12
        leg = lambda a: hip + 0.8 * np.array([np.sin(a), -np.cos(a), 0])
        k = dict(color=color, stroke_width=6)
        hand_y = sh[1] - 0.42
        lh = np.array([x - 0.5, hand_y, 0]) if hold_l else sh + 0.58 * np.array([-0.25, -0.97, 0])
        rh = np.array([x + 0.5, hand_y, 0]) if hold_r else sh + 0.58 * np.array([0.25, -0.97, 0])
        return VGroup(Circle(radius=0.22, stroke_width=6, color=color).move_to(neck + UP * 0.27),
                      Line(hip, neck, **k), Line(hip, leg(0.32 * s), **k), Line(hip, leg(-0.32 * s), **k),
                      Line(sh, lh, **k), Line(sh, rh, **k))
    return always_redraw(mk)


class K08_Friends(Shot):
    def body(self):
        self.title("The Squeeze Theorem", animate=False)
        self.title("Think of It Like This", "49:06.05")
        G = -2.4
        floor = Line([-6.6, G, 0], [6.6, G, 0], color=DIM, stroke_width=3)
        xt = ValueTracker(-4.2)
        figs = VGroup(friend(xt, -1.0, CHALK, False, True), friend(xt, 0, BLUE, True, True), friend(xt, 1.0, CHALK, True, False))
        labs = VGroup(*[H(t, 34, c) for t, c in (("friend", DIM), ("you", BLUE), ("friend", DIM))])
        labs.add_updater(lambda m: [lb.move_to([xt.get_value() + o, G - 0.42, 0]) for lb, o in zip(m, (-1.05, 0, 1.05))])
        self.go("49:07.60", Create(floor), FadeIn(figs), FadeIn(labs), run=0.6)
        hands = VGroup(*[Circle(radius=0.13, color=YEL, stroke_width=3).move_to([xt.get_value() + o, G + 1.36 - 0.42, 0]) for o in (-0.5, 0.5)])
        self.go("49:09.30", Create(hands), run=0.5)
        self.play(FadeOut(hands), run_time=0.4)
        x0, x1, top, door = 2.0, 6.5, G + 2.75, G + 2.15
        k = dict(color=CHALK, stroke_width=5)
        room = VGroup(Line([x0, door, 0], [x0, top, 0], **k), Line([x0, top, 0], [x1, top, 0], **k), Line([x1, top, 0], [x1, G, 0], **k))
        rl = H("room", 40, YEL).next_to(room, UP, buff=0.15)
        self.go("49:11.45", Create(room), run=0.6)
        self.play(xt.animate.set_value(4.25), FadeIn(rl), run_time=3.0, rate_func=rate_functions.ease_in_out_sine)
        labs.clear_updaters()
        nc = H("no choice", 40, YEL).move_to([-1.2, 0.9, 0])
        arrow = CurvedArrow(nc.get_right() + RIGHT * 0.1, np.array([4.25 - 0.3, G + 2.0, 0]), angle=-0.5, color=YEL, stroke_width=3, tip_length=0.16)
        self.go("49:16.00", FadeIn(nc, shift=UP * 0.1), Create(arrow), run=0.6)


def wig_pts(ax, sign, amp, x_far, x_near, n=40):
    """sin(1/x)-type wiggle sampled evenly in u = 1/x, times amp(x)."""
    us = np.arange(1 / x_far, 1 / x_near, 2 * PI / n)
    return [ax.c2p(sign / u, amp(sign / u) * np.sin(sign * u)) for u in us]


def wig(ax, sign, amp, x_far, x_near, color=BLUE, width=3):
    return VMobject(stroke_color=color, stroke_width=width).set_points_as_corners(wig_pts(ax, sign, amp, x_far, x_near))


class K08_SqExample(Shot):
    def body(self):
        self.title("Think of It Like This", animate=False)
        self.title("A Classic Example", "49:18.05")
        e = M(LIM0, "x^2", SIN1X, size=68).move_to([0, 1.4, 0])
        self.go("49:20.10", Write(e[0]), run=0.6)
        self.go("49:22.30", Write(e[1]), run=0.4)
        self.go("49:23.20", Write(e[2]), run=0.9)
        frac = e[2][4:7]
        bad = VGroup(under(frac, RED, buff=0.06))
        n0 = M(r"\frac{1}{0}\,?", size=52, color=RED).next_to(e, RIGHT, buff=0.6)
        self.go("49:27.40", Create(bad), FadeIn(n0, shift=LEFT * 0.1), run=0.6)
        ax = axes((-1, 1, 1), (-1.5, 1.5, 1), x_length=10.4, y_length=2.1, center=(0.3, -0.95, 0), nums=False, y_label=None)
        one = lambda x: 1.0
        r, l = wig(ax, 1, one, 1.0, 0.03), wig(ax, -1, one, 1.0, 0.03)
        gl = M(SIN1X, size=44, color=BLUE).move_to([-5.4, 0.7, 0])
        self.go("49:28.80", Create(ax), FadeIn(ax.labels), run=0.4)
        self.play(Create(r), FadeIn(gl), run_time=1.2, rate_func=linear)
        self.play(Create(l), run_time=1.2, rate_func=linear)
        ineq = M("-1", r"\le", r"\sin(\text{anything})", r"\le", "1", size=56).move_to([0, -3.05, 0])
        ineq[0].set_color(GRN); ineq[4].set_color(GRN)
        self.go("49:37.65", Write(ineq), run=1.0)
        bands = [DashedLine(ax.c2p(-1, v), ax.c2p(1, v), color=GRN, stroke_width=3, dash_length=0.12) for v in (-1, 1)]
        bl = [M(t, size=40, color=GRN).next_to(ax.c2p(-1, v), LEFT, buff=0.15) for t, v in (("-1", -1), ("1", 1))]
        self.go("49:39.50", Create(bands[0]), Write(bl[0]), run=0.5)
        self.go("49:40.50", Create(bands[1]), Write(bl[1]), run=0.5)
        ineq2 = M("-1", r"\le", SIN1X, r"\le", "1", size=56).move_to(ineq)
        ineq2[0].set_color(GRN); ineq2[4].set_color(GRN)
        self.go("49:41.50", FadeOut(ineq[2], shift=UP * 0.2), FadeIn(ineq2[2], shift=UP * 0.2), *[ReplacementTransform(ineq[i], ineq2[i]) for i in (0, 1, 3, 4)], run=0.8)
        self.go("49:43.60", FadeOut(VGroup(e, bad, n0, ax, ax.labels, r, l, gl, *bands, *bl)),
                ineq2.animate.scale(64 / 56).move_to([0, 1.55, 0]), run=0.8)


class K08_SqIneq(Shot):
    def body(self):
        self.title("A Classic Example", animate=False)
        r1 = M("-1", r"\le", SIN1X, r"\le", "1", size=64).move_to([0, 1.55, 0])
        r1[0].set_color(GRN); r1[4].set_color(GRN)
        self.add(r1)
        down = arr([4.0, 1.1, 0], [4.0, -0.3, 0], DIM, w=4)
        tx = M(r"\times x^2", size=50, color=ORG).next_to(down, RIGHT, buff=0.25)
        self.go("49:45.20", GrowArrow(down), Write(tx), run=0.6)
        nn = M(r"(x^2 \ge 0)", size=44, color=DIM).next_to(tx, DOWN, buff=0.25).align_to(tx, LEFT)
        self.go("49:47.60", FadeIn(nn, shift=LEFT * 0.1), run=0.5)
        self.go("49:49.00", r1[1].animate.set_color(YEL), r1[3].animate.set_color(YEL), run=0.5)
        r2 = M("-x^2", r"\le", r"x^2" + SIN1X, r"\le", "x^2", size=64).move_to([0, -0.75, 0])
        r2[1].set_color(YEL); r2[3].set_color(YEL)
        self.go("49:51.50", Write(r2[2]), run=1.0)
        self.go("49:54.90", Write(r2[0:2]), run=0.6)
        self.go("49:56.45", Write(r2[3:5]), run=0.6)
        xz = M(r"x\to 0", size=50, color=YEL).move_to([-5.6, -0.75, 0])
        self.go("49:58.40", FadeIn(xz, shift=RIGHT * 0.1), run=0.5)

        def to0(part, color=GRN):
            a = arr([part.get_x(), part.get_bottom()[1] - 0.12, 0], [part.get_x(), -2.1, 0], DIM, w=4)
            z = M("0", size=60, color=color).move_to([part.get_x(), -2.5, 0])
            return a, z
        aL, zL = to0(r2[0])
        aR, zR = to0(r2[4])
        aM, zM = to0(r2[2])
        self.go("50:01.70", GrowArrow(aL), Write(zL), run=0.5)
        self.go("50:03.60", GrowArrow(aR), Write(zR), run=0.5)
        self.go("50:05.50", Circumscribe(VGroup(zL), color=YEL, buff=0.1), Circumscribe(VGroup(zR), color=YEL, buff=0.1), run=0.9)
        self.go("50:08.00", GrowArrow(aM), run=0.5)
        self.go("50:09.50", Write(zM), run=0.4)
        self.play(Create(answer_box(zM)), run_time=0.4)


class K08_SqGraph(Shot):
    def body(self):
        self.title("A Classic Example", animate=False)
        self.title("Squeezed to 0", "50:11.45")
        ax = axes((-0.3, 0.3, 0.1), (-0.09, 0.09, 0.03), x_length=11.6, y_length=4.7, center=(0, -0.75, 0), nums=False)
        sq = lambda x: x * x
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.6)
        r, l = wig(ax, 1, sq, 0.3, 0.004), wig(ax, -1, sq, 0.3, 0.004)
        self.go("50:13.10", Create(r), run=0.8, rate_func=linear)
        self.play(Create(l), run_time=0.8, rate_func=linear)
        up = curve(ax, sq, (-0.3, 0.3), color=CHALK, width=4)
        dn = curve(ax, lambda x: -x * x, (-0.3, 0.3), color=CHALK, width=4)
        lu = M("y=x^2", size=46).next_to(ax.c2p(0.3, 0.09), LEFT, buff=0.25)
        ld = M("y=-x^2", size=46).next_to(ax.c2p(0.3, -0.09), LEFT, buff=0.25)
        self.go("50:16.10", draw(up, run=0.9), FadeIn(lu), run=0.9)
        self.go("50:17.40", draw(dn, run=0.9), FadeIn(ld), run=0.9)
        t1, t2 = ValueTracker(-0.29), ValueTracker(0.29)
        d1 = rider(ax, sq, t1, color=YEL, r=0.09)
        d2 = rider(ax, lambda x: -x * x, t2, color=YEL, r=0.09)
        self.go("50:18.90", FadeIn(d1), FadeIn(d2), run=0.2)
        self.play(t1.animate.set_value(0), t2.animate.set_value(0), run_time=1.4)
        d1.clear_updaters(); d2.clear_updaters()
        o = M("(0,0)", size=46, color=YEL).next_to(ax.c2p(0, 0), DR, buff=0.2)
        self.go("50:20.55", Write(o), Create(Circle(radius=0.25, color=YEL, stroke_width=4).move_to(ax.c2p(0, 0))), run=0.6)


# ================================================================ the famous limit sin x / x

def hrow(*items, buff=0.22):
    """Lay maths pieces left to right on one maths axis (fraction bars, '=' and 'lim' line up at y=0)."""
    g = VGroup(*items).arrange(RIGHT, buff=buff)
    for it in items:
        if hasattr(it, "bar"):
            it.shift(UP * (0 - it.bar.get_y()))
        elif getattr(it, "is_lim", False):
            it.shift(UP * (0.04 - it[0][0:3].get_y()))
        else:
            it.shift(UP * (0 - it.get_y()))
    return g


def LIMm(size=64):
    m = M(LIM0, size=size)
    m.is_lim = True
    return m


def at_left(g, x, y):
    """Put row g with its first piece's left edge at x and its maths axis at y."""
    return g.shift([x - g.get_left()[0], y, 0])


class K08_SinxIntro(Shot):
    def body(self):
        self.title("Squeezed to 0", animate=False)
        self.title("The Most Famous Limit", "50:24.70")
        e = lim_frac(LIM0, [r"\sin x"], ["x"], size=80).move_to([-2.25, 1.0, 0])
        self.go("50:27.40", Write(e.l), run=0.6)
        self.go("50:29.55", Write(e.f), run=0.9)
        p = eq_after(e, ["=", r"\frac{\sin 0}{0}", "=", r"\frac{0}{0}"], size=80)
        p[3].set_color(RED)
        self.go("50:32.25", Write(p[0:2]), run=0.6)
        self.go("50:33.30", Write(p[2:4]), run=0.6)
        tricks = [H(t, 44).move_to([x, -1.9, 0]) for t, x in (("factor", -4.7), ("combine fractions", -0.4), ("square roots", 4.3))]
        lab = H("our tricks", 36, DIM).move_to([-4.7, -0.95, 0])
        hits = ("50:34.85", "50:36.30", "50:37.95")
        for t, h in zip(tricks, hits):
            self.go(h, FadeIn(t, shift=UP * 0.12), *( [FadeIn(lab)] if t is tricks[0] else []), run=0.4)
            self.play(Create(strike(t)), run_time=0.35)
        self.go("50:39.20", Circumscribe(e, color=YEL, buff=0.15), run=1.0)


class K08_SinxTable(Shot):
    def body(self):
        self.title("The Most Famous Limit", animate=False)
        self.title("Try Numbers", "50:40.90")
        f = lambda x: np.sin(x) / x
        ax = axes((-3, 3, 1), (0, 1.5, 0.5), x_length=5.4, y_length=3.1, center=(3.95, 0.05, 0), nums=False)
        cr = curve(ax, f, (0.04, 2.9))
        cl = curve(ax, f, (-2.9, -0.04)).reverse_points()
        hl = hole(ax, 0, 1)
        one = M("1", size=38, color=YEL).next_to(ax.c2p(0, 1), LEFT, buff=0.15).shift(LEFT * 0.08)
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.6)
        self.play(Create(cr), Create(cl), run_time=1.0)
        self.play(FadeIn(hl), run_time=0.3)
        rad = H("x in radians", 38, YEL).move_to([-3.4, 1.95, 0])
        self.go("50:43.30", FadeIn(rad, shift=UP * 0.1), run=0.5)
        cols = (-5.75, -3.55, -1.15)
        hy, step = 1.0, 0.68
        frame = VGroup(Line([-4.75, hy + 0.5, 0], [-4.75, hy - 0.55 - 4 * step, 0], color=CHALK, stroke_width=3),
                       Line([-2.35, hy + 0.5, 0], [-2.35, hy - 0.55 - 4 * step, 0], color=CHALK, stroke_width=3),
                       Line([-6.6, hy - 0.55, 0], [0.1, hy - 0.55, 0], color=CHALK, stroke_width=3))
        head = VGroup(M("x", size=44).move_to([cols[0], hy, 0]), M(r"\sin x", size=44).move_to([cols[1], hy, 0]),
                      M(r"\frac{\sin x}{x}", size=44, color=YEL).move_to([cols[2], hy, 0]))
        vals = [("0.1", "0.0998", "0.998"), ("0.01", "0.0099998", "0.99998"),
                ("-0.1", "-0.0998", "0.998"), ("-0.01", "-0.0099998", "0.99998")]
        cells = [[M(v, size=40, color=(YEL if j == 2 else (ORG if j == 0 else CHALK))).move_to([cols[j], hy - 0.55 - (i + 0.55) * step, 0])
                  for j, v in enumerate(r)] for i, r in enumerate(vals)]
        self.go("50:44.40", Create(frame), FadeIn(head), run=0.5)
        self.go("50:45.00", FadeIn(cells[0][0], shift=UP * 0.1), run=0.35)
        self.go("50:47.40", FadeIn(cells[0][1], shift=UP * 0.1), run=0.4)
        self.go("50:51.70", FadeIn(cells[0][2], shift=UP * 0.1), run=0.4)
        self.go("50:54.15", FadeIn(cells[1][0], shift=UP * 0.1), run=0.35)
        self.go("50:55.05", FadeIn(cells[1][1], shift=UP * 0.1), run=0.4)
        self.go("50:56.10", FadeIn(cells[1][2], shift=UP * 0.1), run=0.4)
        xt = ValueTracker(2.6)
        dot = rider(ax, f, xt)
        lev = DashedLine(ax.c2p(-3, 1), ax.c2p(3, 1), color=YEL, stroke_width=2.5, dash_length=0.1, stroke_opacity=0.8)
        self.go("50:57.90", FadeIn(dot), Create(lev), Write(one), run=0.4)
        self.play(xt.animate.set_value(0.07), run_time=1.5)
        dot.clear_updaters()
        xl = ValueTracker(-2.6)
        dl = rider(ax, f, xl, color=ORG)
        self.go("51:01.85", FadeIn(VGroup(*cells[2]), shift=UP * 0.1), FadeIn(dl), run=0.4)
        self.play(FadeIn(VGroup(*cells[3]), shift=UP * 0.1), xl.animate.set_value(-0.07), run_time=1.0)
        dl.clear_updaters()
        idn = M(r"\frac{\sin(-x)}{-x}", "=", r"\frac{-\sin x}{-x}", "=", r"\frac{\sin x}{x}", size=52).move_to([-3.2, -3.2, 0])
        self.go("51:03.20", Write(idn[0]), run=0.6)
        self.go("51:04.60", Write(idn[1:3]), run=0.6)
        mid = idn[2]
        ks = VGroup(strike(mid[0], width=5), strike(mid[6], width=5))
        self.go("51:06.75", Create(ks), run=0.4)
        self.play(Write(idn[3:5]), run_time=0.5)
        res = M(LIM0, r"\frac{\sin x}{x}", "=", "1", size=60).move_to([-3.2, -3.15, 0])
        res[3].set_color(GRN)
        self.go("51:08.80", FadeOut(VGroup(idn, ks), shift=DOWN * 0.15), Write(res[0:2]), run=0.8)
        self.go("51:12.30", Write(res[2:4]), run=0.4)
        self.play(Create(answer_box(res[3])), run_time=0.4)


class K08_UnitCircle(Shot):
    def body(self):
        self.title("Try Numbers", animate=False)
        self.title("The Unit Circle Picture", "51:13.75")
        O = np.array([-5.6, -3.2, 0])
        R = 5.2
        at = ValueTracker(0.75)
        P = lambda: O + R * np.array([np.cos(at.get_value()), np.sin(at.get_value()), 0])
        A = O + R * RIGHT
        ax_l = VGroup(Line(O + LEFT * 0.3, O + RIGHT * (R + 0.6), color=DIM, stroke_width=3),
                      Line(O + DOWN * 0.3, O + UP * (R + 0.1), color=DIM, stroke_width=3))
        arc = Arc(radius=R, start_angle=0, angle=PI / 2, arc_center=O, color=CHALK, stroke_width=4)
        rad = always_redraw(lambda: Line(O, P(), color=CHALK, stroke_width=4))
        one = M("1", size=44, color=DIM).move_to(O + R * 0.5 * np.array([np.cos(0.75), np.sin(0.75), 0]) + np.array([-0.3, 0.3, 0]))
        self.go("51:16.30", Create(ax_l), Create(arc), run=0.7)
        self.go("51:17.10", Create(rad), FadeIn(one), run=0.5)
        one.add_updater(lambda m: m.move_to(O + R * 0.5 * np.array([np.cos(at.get_value()), np.sin(at.get_value()), 0]) + np.array([-0.3, 0.3, 0])))
        a0 = 0.75
        Pp, T = P(), O + np.array([R, R * np.tan(a0), 0])
        small = Polygon(O, A, Pp, stroke_color=ORG, stroke_width=3, fill_color=ORG, fill_opacity=0.45).set_z_index(3)
        big = Polygon(O, A, T, stroke_color=CHALK, stroke_width=3, fill_color=DIM, fill_opacity=0.25).set_z_index(1)
        sec = Sector(radius=R, start_angle=0, angle=a0, arc_center=O, stroke_width=0, fill_color=GRN, fill_opacity=0.35).set_z_index(2)
        self.go("51:19.50", FadeIn(small), run=0.4)
        self.go("51:19.95", FadeIn(big), run=0.5)
        self.go("51:20.75", FadeIn(sec), run=0.5)
        self.go("51:22.40", FadeOut(VGroup(small, big, sec)), run=0.6)
        ht = always_redraw(lambda: Line(P(), [P()[0], O[1], 0], color=ORG, stroke_width=7).set_z_index(4))
        sl = M(r"\sin x", size=48, color=ORG)
        sl.add_updater(lambda m: m.next_to(Line(P(), [P()[0], O[1], 0]), LEFT, buff=0.15))
        ar = always_redraw(lambda: Arc(radius=R, start_angle=0, angle=at.get_value(), arc_center=O, color=YEL, stroke_width=8).set_z_index(4))
        xl = M("x", size=50, color=YEL)
        xl.add_updater(lambda m: m.move_to(O + (R + 0.4) * np.array([np.cos(at.get_value() / 2), np.sin(at.get_value() / 2), 0])))
        self.go("51:26.80", Create(ht), run=0.5)
        self.go("51:28.30", FadeIn(sl), run=0.4)
        self.go("51:30.00", Create(ar), run=0.6)
        self.play(FadeIn(xl), run_time=0.3)
        lab = M(r"\frac{\sin x}{x}", "=", size=60).move_to([2.6, 0.6, 0])
        num = always_redraw(lambda: digits(f"{np.sin(at.get_value()) / at.get_value():.3f}", 60, YEL).next_to(lab, RIGHT, buff=0.25))
        self.go("51:31.30", FadeIn(lab), FadeIn(num), run=0.3)
        self.play(at.animate.set_value(0.13), run_time=3.0)
        for m in (rad, ht, ar, num, sl, xl, one):
            m.clear_updaters()
        pizza = Sector(radius=R, start_angle=0, angle=0.13, arc_center=O, stroke_width=0, fill_color=ORG, fill_opacity=0.3).set_z_index(2)
        self.go("51:34.55", FadeIn(pizza), run=0.5)
        self.go("51:35.90", ar.animate.set_stroke(width=13), run=0.4)
        self.play(ar.animate.set_stroke(width=8), run_time=0.3)
        self.go("51:36.80", ht.animate.set_stroke(width=13), run=0.4)
        self.play(ht.animate.set_stroke(width=7), run_time=0.3)
        to1 = M(r"\to", "1", size=60).next_to(num, RIGHT, buff=0.3)
        to1[1].set_color(GRN)
        self.go("51:39.30", Write(to1), run=0.6)
        self.play(Create(answer_box(to1[1])), run_time=0.4)


class K08_SmallAngle(Shot):
    def body(self):
        self.title("The Unit Circle Picture", animate=False)
        self.title("A Handy Fact", "51:42.80")
        cond = H("small x, in radians", 38, DIM).move_to([0.1, 1.65, 0])
        f = M(r"\sin x", r"\approx", "x", size=80).move_to([-4.9, 1.65, 0])
        f[0].set_color(BLUE); f[2].set_color(YEL)
        ax = axes((-2.5, 2.5, 1), (-1.6, 1.6, 1), x_length=6.6, y_length=3.7, center=(-3.0, -1.35, 0), nums=False)
        self.go("51:45.20", FadeIn(cond, shift=UP * 0.1), Create(ax), FadeIn(ax.labels), run=0.6)
        sn = curve(ax, np.sin, (-2.5, 2.5))
        ln = curve(ax, lambda x: x, (-1.55, 1.55), color=YEL, width=4)
        self.go("51:46.80", Write(f[0]), draw(sn, run=0.9), run=0.9)
        self.go("51:48.00", Write(f[1:3]), draw(ln, run=0.8), run=0.8)
        near = Ellipse(width=2.0, height=1.5, color=GRN, stroke_width=3).move_to(ax.c2p(0, 0))
        self.play(Create(near), run_time=0.5)
        clk = tracker_time(self)
        piv = np.array([4.3, 1.9, 0])
        Lp = 3.1

        def bob_at():
            th = 0.32 * np.sin(2 * PI * clk.get_value() / 2.0)
            return piv + Lp * np.array([np.sin(th), -np.cos(th), 0]), th
        bar = Line(piv + LEFT * 0.6, piv + RIGHT * 0.6, color=CHALK, stroke_width=5)
        pend = always_redraw(lambda: VGroup(Line(piv, bob_at()[0], color=CHALK, stroke_width=3),
                                             Circle(radius=0.22, color=ORG, stroke_width=5, fill_color=BOARDC, fill_opacity=1).move_to(bob_at()[0])))
        rest = DashedLine(piv, piv + DOWN * Lp, color=DIM, stroke_width=2, dash_length=0.08)
        pl = M(r"\sin\theta \approx \theta", size=46, color=DIM).move_to([4.3, -2.0, 0])
        self.go("51:49.70", Create(bar), Create(rest), FadeIn(pend), run=0.5)
        self.go("51:51.60", FadeIn(pl, shift=UP * 0.1), run=0.5)
        self.go("51:53.40", Create(under(cond[-7:])), run=0.5)
        self.at("51:54.90")
        pend.clear_updaters()
        d1 = H("in degrees:", 40, RED).move_to([3.9, 1.3, 0])
        d2 = M(r"\frac{\sin(x^\circ)}{x}", r"\to", r"\frac{\pi}{180}", size=58).move_to([3.9, 0.05, 0])
        d3 = M(r"\approx 0.0175", size=56, color=RED).move_to([3.9, -1.3, 0])
        self.go("51:54.90", FadeOut(VGroup(bar, rest, pend, pl)), FadeIn(d1, shift=UP * 0.1), run=0.5)
        self.play(Write(d2), run_time=0.7)
        self.go("51:56.30", Write(d3), run=0.5)
        self.go("51:58.30", Circumscribe(cond, color=YEL, buff=0.12), run=1.0)


class K08_Sin5x(Shot):
    def body(self):
        self.title("A Handy Fact", animate=False)
        self.title("Related Problems", "52:01.15")
        key = M(LIM0, r"\frac{\sin x}{x}", "=", "1", size=48)
        key[3].set_color(GRN)
        key.move_to([4.4, 1.8, 0])
        kp = panel(key, GRN, buff=0.2)
        self.go("52:02.00", FadeIn(key), Create(kp), run=0.6)
        X0, Y = -5.3, (0.95, -0.8, -3.05)
        f1 = fr([r"\sin", "5x"], ["x"], size=68)
        r1 = at_left(hrow(LIMm(68), f1), X0 + 0.45, Y[0])
        self.go("52:06.80", Write(r1[0]), run=0.6)
        self.go("52:09.05", Write(f1.n), run=0.6)
        self.go("52:10.30", Create(f1.bar), Write(f1.d), run=0.4)
        self.go("52:13.95", f1.n[1].animate.set_color(YEL), run=0.4)
        self.go("52:16.40", Circumscribe(f1.n[1], color=YEL, buff=0.08), run=0.8)
        self.go("52:18.15", f1.d.animate.set_color(ORG), Circumscribe(f1.d, color=ORG, buff=0.08), run=0.8)
        t5 = M(r"\times 5", size=44, color=ORG).next_to(f1.n, RIGHT, buff=0.3)
        b5 = M(r"\times 5", size=44, color=ORG).next_to(f1.d, RIGHT, buff=0.3).align_to(t5, LEFT)
        self.go("52:21.00", FadeIn(t5, shift=LEFT * 0.1), FadeIn(b5, shift=LEFT * 0.1), run=0.5)
        f2 = fr([r"\sin", "5x"], ["5x"], size=68)
        f2.n[1].set_color(YEL); f2.d.set_color(YEL)
        r2 = at_left(hrow(M("=", size=68), LIMm(68), M("5", size=68, color=ORG), M(r"\cdot", size=68), f2), X0, Y[1])
        self.go("52:23.00", Write(r2[0:2]), run=0.4)
        self.go("52:23.45", TransformFromCopy(t5, r2[2]), FadeIn(r2[3]), run=0.5)
        self.go("52:24.20", Write(f2.n), run=0.5)
        self.go("52:25.50", Create(f2.bar), Write(f2.d), run=0.5)
        nt = M(r"x\to 0", r"\;\Rightarrow\;", r"5x\to 0", size=46, color=DIM).move_to([3.6, Y[1], 0])
        self.go("52:27.00", FadeIn(nt[0]), run=0.4)
        self.go("52:28.00", FadeIn(nt[1:]), run=0.5)
        br = Brace(f2, DOWN, buff=0.1, color=GRN)
        b1 = M("1", size=50, color=GRN).next_to(br, DOWN, buff=0.08)
        self.go("52:32.40", GrowFromCenter(br), Write(b1), run=0.5)
        r3 = M("=", "5", r"\cdot", "1", "=", "5", size=68)
        r3[1].set_color(ORG); r3[3].set_color(GRN); r3[5].set_color(GRN)
        r3.shift([X0 - r3.get_left()[0], Y[2] - r3[0].get_y(), 0])
        self.go("52:33.55", Write(r3[0:4]), run=0.5)
        self.go("52:34.40", Write(r3[4:6]), run=0.3)
        self.play(Create(answer_box(r3[5])), run_time=0.3)


class K08_Sin3x(Shot):
    def body(self):
        self.title("Related Problems", animate=False)
        X0, Y = -5.3, (1.0, -1.0)
        f1 = fr([r"\sin", "3x"], [r"\sin", "2x"], size=68)
        r1 = at_left(hrow(LIMm(68), f1), X0 + 0.45, Y[0])
        self.go("52:35.45", Write(r1[0]), run=0.5)
        self.go("52:36.10", Write(f1.n), run=0.5)
        self.go("52:37.20", Create(f1.bar), Write(f1.d), run=0.5)
        w1 = fr([r"\sin", "3x"], ["3x"], size=58)
        w2 = fr(["2x"], [r"\sin", "2x"], size=58)
        w1.n[1].set_color(YEL); w1.d.set_color(YEL)
        w2.n.set_color(PURP); w2.d[1].set_color(PURP)
        w1.move_to([2.1, Y[0], 0]); w2.move_to([4.6, Y[0], 0])
        want = H("we want", 36, DIM).next_to(VGroup(w1, w2), UP, buff=0.25)
        self.go("52:40.40", FadeIn(want), FadeIn(w1, shift=UP * 0.1), run=0.5)
        self.go("52:43.00", FadeIn(w2, shift=UP * 0.1), run=0.5)
        p1 = fr([r"\sin", "3x"], ["3x"], size=64)
        p2 = fr(["2x"], [r"\sin", "2x"], size=64)
        p3 = fr(["3x"], ["2x"], size=64)
        p1.n[1].set_color(YEL); p1.d.set_color(YEL)
        p2.n.set_color(PURP); p2.d[1].set_color(PURP)
        r2 = at_left(hrow(M("=", size=64), LIMm(64), p1, M(r"\cdot", size=64), p2, M(r"\cdot", size=64), p3), X0, Y[1])
        self.go("52:45.90", Write(r2[0:2]), run=0.5)
        self.go("52:46.90", TransformFromCopy(w1, p1), run=0.7)
        self.go("52:49.35", FadeIn(r2[3]), TransformFromCopy(w2, p2), run=0.7)
        self.go("52:51.75", FadeIn(r2[5]), Write(p3), run=0.6)
        braces = [Brace(p, DOWN, buff=0.1, color=GRN) for p in (p1, p2)]
        ones = [M("1", size=50, color=GRN).next_to(b, DOWN, buff=0.08) for b in braces]
        self.go("52:53.65", FadeOut(VGroup(w1, w2, want)), run=0.4)
        self.go("52:54.65", *[GrowFromCenter(b) for b in braces], *[Write(o) for o in ones], run=0.5)
        ks = VGroup(strike(p3.n[0][1], width=5), strike(p3.d[0][1], width=5))
        self.go("52:57.55", Create(ks), run=0.4)
        b3 = Brace(p3, DOWN, buff=0.1, color=GRN)
        h3 = M(r"\frac{3}{2}", size=54, color=GRN).next_to(b3, DOWN, buff=0.08)
        self.go("52:59.15", GrowFromCenter(b3), Write(h3), run=0.5)
