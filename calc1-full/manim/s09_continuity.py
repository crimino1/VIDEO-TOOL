"""Builder 09: end of Chapter 3. tan x / x, (1 - cos x)/x, practice sin 7x / x, continuity (pencil test, three
conditions, hole / jump / infinite), what is continuous, pick the constant (k and a), the intermediate value theorem
(temperature, mountain, x^3 + x - 1, why 1/x fails) and the chapter recap."""
from common import *

LIM0 = r"\lim_{x\to 0}"


# ---------------------------------------------------------------- local helpers

def fr(top, bot, size=64, color=CHALK):
    """Hand-built fraction so single pieces can be coloured: .n (numerator parts), .bar, .d."""
    n = M(*top, size=size, color=color) if isinstance(top, (list, tuple)) else M(top, size=size, color=color)
    d = M(*bot, size=size, color=color) if isinstance(bot, (list, tuple)) else M(bot, size=size, color=color)
    w = max(n.width, d.width) + 0.2
    bar = Line([-w / 2, 0, 0], [w / 2, 0, 0], color=color, stroke_width=4)
    n.next_to(bar, UP, buff=0.13)
    d.next_to(bar, DOWN, buff=0.13)
    g = VGroup(n, bar, d)
    g.n, g.bar, g.d = n, bar, d
    return g


def lim_frac(lim, top, bot, size=64, pre=None):
    """[pre] lim + hand-built fraction, lim's letters level with the bar. .l .f (.f.n .f.bar .f.d)."""
    f = fr(top, bot, size)
    l = M(*([pre] if pre else []), lim, size=size)
    l.next_to(f, LEFT, buff=0.22)
    l.shift(UP * (f.bar.get_y() - l[-1][0:3].get_y() + 0.04))
    g = VGroup(l, f)
    g.l, g.f = l, f
    return g


def eq_after(m, tex_parts, size=64, buff=0.25):
    """'= ...' right of m with the '=' level with m's fraction bar."""
    e = M(*tex_parts, size=size)
    e.next_to(m, RIGHT, buff=buff)
    e.shift(UP * (m.f.bar.get_y() - e[0].get_y()))
    return e


def under(mob, color=YEL, buff=0.1):
    return Line(mob.get_corner(DL) + DOWN * buff, mob.get_corner(DR) + DOWN * buff, color=color, stroke_width=5)


def ring(p, r=0.25, color=YEL):
    return Circle(radius=r, color=color, stroke_width=4).move_to(p)


def arr(p, q, color=DIM, w=4, tip=0.2):
    return Arrow(np.array(p, float), np.array(q, float), buff=0, stroke_width=w, tip_length=tip, color=color,
                 max_stroke_width_to_length_ratio=20, max_tip_length_to_length_ratio=0.4)


def rider(ax, f, xt, color=YEL, r=0.1):
    return always_redraw(lambda: Dot(ax.c2p(xt.get_value(), f(xt.get_value())), radius=r, color=color).set_z_index(6))


def still(*ms):
    for m in ms:
        m.clear_updaters()


def dline(p, q, color=DIM, w=3):
    return DashedLine(np.array(p, float), np.array(q, float), color=color, stroke_width=w, dash_length=0.1)


_DG = {}


def digits(s, size=48, color=CHALK):
    """A number built from cached glyphs (cheap to redraw every frame)."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.035, aligned_edge=DOWN)
    return g


def pencil(color=CHALK):
    """A plain chalk pencil whose lead tip sits at the origin, leaning up-right."""
    L, w, tl = 1.3, 0.22, 0.36
    kw = dict(stroke_color=color, stroke_width=3, fill_color=config.background_color, fill_opacity=1)
    body = Polygon([tl, w / 2, 0], [tl + L, w / 2, 0], [tl + L, -w / 2, 0], [tl, -w / 2, 0], **kw)
    cone = Polygon([0, 0, 0], [tl, w / 2, 0], [tl, -w / 2, 0], **kw)
    band = Line([tl + L - 0.22, w / 2, 0], [tl + L - 0.22, -w / 2, 0], color=color, stroke_width=3)
    lead = Polygon([0, 0, 0], [0.12, w * 0.17, 0], [0.12, -w * 0.17, 0], stroke_width=0, fill_color=color, fill_opacity=1)
    return VGroup(body, cone, band, lead).rotate(50 * DEGREES, about_point=ORIGIN).set_z_index(12)


def tracer(ax, f, x0, color=YEL, width=5):
    """Pencil-dot drawing y = f(x) from x0 as tracker xt grows: (xt, trail, pen). Never lifts."""
    xt = ValueTracker(x0 + 2e-3)

    def tr():
        x = max(xt.get_value(), x0 + 2e-3)
        c = ax.plot(f, x_range=[x0, x, (x - x0) / 90], color=color, stroke_width=width).set_z_index(3)
        return c.set_stroke(opacity=0) if x - x0 < 0.01 else c
    trail = always_redraw(tr)
    pen = pencil()
    dot = Dot(radius=0.07, color=color).set_z_index(13)

    def upd(m):
        x = xt.get_value()
        p = np.array(ax.c2p(x, f(x)))
        m[0].shift(p - m[0][3].get_vertices()[0])
        m[1].move_to(p)
    g = VGroup(pen, dot)
    g.add_updater(upd)
    upd(g)
    return xt, trail, g


def piece(v1, c1, v2, c2, center, size=60):
    """f(x) = { v1  c1 ; v2  c2 }. v1 / v2 may be tuples of TeX parts (to colour a constant)."""
    mk = lambda v: M(*v, size=size) if isinstance(v, (list, tuple)) else M(v, size=size)
    lhs = M("f(x)", "=", size=size)
    a, c = mk(v1), mk(v2)
    b, d = M(c1, size=size - 6, color=DIM), M(c2, size=size - 6, color=DIM)
    a.move_to([0, 0.5, 0], aligned_edge=LEFT)
    c.move_to([0, -0.5, 0], aligned_edge=LEFT)
    x2 = max(a.width, c.width) + 0.6
    b.move_to([x2, 0.5, 0], aligned_edge=LEFT)
    d.move_to([x2, -0.5, 0], aligned_edge=LEFT)
    rows = VGroup(a, b, c, d)
    br = Brace(rows, LEFT, buff=0.2, color=CHALK)
    lhs.next_to(br, LEFT, buff=0.2)
    g = VGroup(lhs, br, rows).move_to([center[0], center[1], 0])
    return dict(lhs=lhs, br=br, v1=a, c1=b, v2=c, c2=d, all=g)


def mini(kind, cx, label, cy=-0.2):
    """Small graph of one kind of break: hole / jump / blow. .ax .art .x (red cross) .lab"""
    ax = axes((0, 4, 1), (0, 4, 1), x_length=3.2, y_length=2.6, center=(cx, cy, 0), nums=False, x_label=None, y_label=None)
    if kind == "hole":
        f = lambda x: 0.6 * x + 0.8
        art = VGroup(curve(ax, f, [0.2, 1.87]), curve(ax, f, [2.13, 3.6]), hole(ax, 2, f(2)))
    elif kind == "jump":
        art = VGroup(curve(ax, lambda x: 0.5 * x + 0.6, [0.2, 1.88]), hole(ax, 2, 1.6),
                     curve(ax, lambda x: 0.5 * x + 1.9, [2, 3.6], color=ORG), pt(ax, 2, 2.9, ORG, r=0.07))
    else:
        g = lambda x: 2 + 0.35 / (x - 2)
        art = VGroup(curve(ax, g, [0.2, 1.81]), curve(ax, g, [2.19, 3.8]),
                     dline(ax.c2p(2, 0.1), ax.c2p(2, 3.9), RED))
    x = cross_mark(s=0.13).move_to(ax.c2p(0.9, 3.5))
    lab = H(label, 38).move_to([cx, cy - 1.75, 0])
    g = VGroup(ax, art, x, lab)
    g.ax, g.art, g.x, g.lab = ax, art, x, lab
    return g


# ================================================================ trig limits

class K09_TanX(Shot):
    def body(self):
        self.title("Related Problems", animate=False)
        e = lim_frac(LIM0, r"\sin 3x", r"\sin 2x", size=72).move_to([-1.3, 0.4, 0])
        self.add(e)
        ans = eq_after(e, ["=", r"\frac{3}{2}"], size=72)
        ans[1].set_color(GRN)
        self.go("53:01.45", Write(ans), run=0.6)
        self.play(Create(answer_box(ans[1])), run_time=0.4)
        self.wipe("53:02.85")
        A = lim_frac(LIM0, r"\tan x", "x", size=72).move_to([-2.2, 1.15, 0])
        self.go("53:03.40", Write(A.l), Write(A.f.n), run=0.7)
        self.go("53:04.60", Create(A.f.bar), Write(A.f.d), run=0.5)
        tn = M(r"\tan x", "=", r"\frac{\sin x}{\cos x}", size=56, color=DIM).move_to([3.6, 1.15, 0])
        self.go("53:06.04", Write(tn), run=0.9)
        B = M("=", LIM0, r"\frac{\sin x}{x}", r"\cdot", r"\frac{1}{\cos x}", size=72).move_to([-1.2, -0.75, 0])
        self.go("53:08.00", Write(B[0:2]), run=0.4)
        self.go("53:08.40", Write(B[2]), run=0.6)
        self.go("53:09.66", Write(B[3:]), run=0.9)
        b1 = Brace(B[2], DOWN, buff=0.12, color=GRN)
        l1 = M("1", size=60, color=GRN).next_to(b1, DOWN, buff=0.1)
        self.go("53:12.42", GrowFromCenter(b1), Write(l1), run=0.6)
        c0 = M(r"\cos 0=1", size=54, color=BLUE).move_to([4.6, -0.75, 0])
        self.go("53:14.14", Write(c0), run=0.8)
        b2 = Brace(B[4], DOWN, buff=0.12, color=GRN)
        l2 = M("1", size=60, color=GRN).next_to(b2, DOWN, buff=0.1)
        self.go("53:16.40", GrowFromCenter(b2), Write(l2), run=0.6)
        ans2 = M("=", "1", size=72).next_to(B, RIGHT, buff=0.3)
        ans2[1].set_color(GRN)
        self.go("53:17.80", FadeOut(c0), FadeOut(tn), run=0.3)
        self.play(Write(ans2), run_time=0.5)
        self.play(Create(answer_box(ans2[1])), run_time=0.4)


class K09_OneMinusCos(Shot):
    def body(self):
        self.title("Related Problems", animate=False)
        self.title("One More to Know", "53:19.56")
        A = lim_frac(LIM0, r"1-\cos x", "x", size=72).move_to([-0.9, 1.2, 0])
        self.go("53:21.24", Write(A.l), Write(A.f.n), run=0.9)
        self.go("53:22.55", Create(A.f.bar), Write(A.f.d), run=0.5)
        ax = axes((-4, 4, 1), (-1, 1, 1), x_length=9, y_length=2.6, center=(0, -2.1, 0), nums=False)
        f = lambda x: (1 - np.cos(x)) / x
        cl, cr, h = curve(ax, f, [-3.9, -0.07]), curve(ax, f, [0.07, 3.9]), hole(ax, 0, 0)
        self.go("53:23.10", Create(ax), FadeIn(ax.labels), run=0.4)
        self.play(Create(cl), Create(cr), FadeIn(h), run_time=0.8)
        xl, xr = ValueTracker(-3.2), ValueTracker(3.2)
        rl, rr = rider(ax, f, xl, BLUE), rider(ax, f, xr, ORG)
        self.go("53:24.40", FadeIn(rl), FadeIn(rr), run=0.2)
        self.play(xl.animate.set_value(-0.17), xr.animate.set_value(0.17), run_time=1.1)
        ans = eq_after(A, ["=", "0"], size=72)
        ans[1].set_color(GRN)
        self.go("53:25.82", Write(ans), run=0.5)
        self.play(Create(answer_box(ans[1])), run_time=0.4)
        # the conjugate, sketched
        still(rl, rr)
        self.go("53:27.30", *[FadeOut(m) for m in (ax, ax.labels, cl, cr, h, rl, rr)], run=0.4)
        C = M(r"\frac{1-\cos x}{x}", r"\cdot", r"\frac{1+\cos x}{1+\cos x}", "=", size=58)
        r1 = M(r"\frac{1-\cos^2 x}{x(1+\cos x)}", size=58)
        VGroup(C, r1).arrange(RIGHT, buff=0.25).move_to([0, -1.0, 0])
        C[2].set_color(YEL)
        self.go("53:28.34", Write(C[0:2]), run=0.7)
        self.go("53:29.62", Write(C[2]), run=0.8)
        self.go("53:31.00", Write(C[3]), Write(r1), run=0.9)
        idn = M(r"\sin^2 x+\cos^2 x=1", size=50, color=DIM).move_to([r1.get_x(), -2.75, 0])
        self.go("53:32.26", Write(idn), run=0.9)
        r2 = M(r"\frac{\sin^2 x}{x(1+\cos x)}", size=58).move_to(r1)
        self.go("53:34.10", ReplacementTransform(r1, r2), run=0.7)
        self.go("53:35.30", Circumscribe(ans[1], color=GRN, buff=0.15), run=0.8)
        # both limits come back later
        self.wipe("53:36.30", run=0.35)
        P1 = M(LIM0, r"\frac{\sin x}{x}", "=", "1", size=60).move_to([-3.4, 0.9, 0])
        P2 = M(LIM0, r"\frac{1-\cos x}{x}", "=", "0", size=60).move_to([3.3, 0.9, 0])
        P1[3].set_color(GRN)
        P2[3].set_color(GRN)
        f1, f2 = panel(P1, PURP, buff=0.3), panel(P2, PURP, buff=0.3)
        self.go("53:38.28", Write(P1), Create(f1), run=0.9)
        self.go("53:41.02", Write(P2), Create(f2), run=0.9)
        ch = H("Chapter 4: derivatives", 46, PINK).move_to([0, -1.35, 0])
        a1 = arr(f1.get_bottom() + DOWN * 0.1, ch.get_left() + LEFT * 0.15 + UP * 0.1, DIM)
        a2 = arr(f2.get_bottom() + DOWN * 0.1, ch.get_right() + RIGHT * 0.15 + UP * 0.1, DIM)
        self.go("53:43.52", GrowArrow(a1), GrowArrow(a2), FadeIn(ch, shift=UP * 0.1), run=0.7)
        ds = VGroup(M(r"\frac{d}{dx}\sin x", "=", size=64, color=PINK), H("?", 58, PINK)).arrange(RIGHT, buff=0.2).move_to([0, -2.75, 0])
        self.go("53:48.50", Write(ds), run=0.8)


class K09_Sin7x(Shot):
    def body(self):
        self.title("Try This One", "53:51.86")
        A = lim_frac(LIM0, r"\sin 7x", "x", size=72).move_to([-2.5, 1.15, 0])
        self.go("53:52.40", Write(A.l), run=0.6)
        self.go("53:54.44", Write(A.f.n), run=0.6)
        self.go("53:55.74", Create(A.f.bar), Write(A.f.d), run=0.5)
        B = lim_frac(LIM0, ["7", r"\sin 7x"], ["7", "x"], size=72, pre="=")
        B.next_to(A, RIGHT, buff=0.3)
        B.shift(UP * (A.f.bar.get_y() - B.f.bar.get_y()))
        sev = VGroup(B.f.n[0], B.f.d[0]).set_color(YEL)
        self.go("53:57.38", Write(B.l), TransformFromCopy(A.f.n[0], B.f.n[1]), Create(B.f.bar),
                TransformFromCopy(A.f.d[0], B.f.d[1]), run=0.7)
        self.go("53:58.74", FadeIn(sev, shift=DOWN * 0.1), run=0.5)
        u1, u2 = under(B.f.n[1][3:5]), under(B.f.d)
        self.go("54:00.36", Create(u1), Create(u2), run=0.5)
        C = M("=", "7", r"\cdot", LIM0, r"\frac{\sin 7x}{7x}", size=72).move_to([-1.6, -1.15, 0])
        C[1].set_color(YEL)
        self.go("54:01.84", Write(C[0:3]), run=0.5)
        self.go("54:02.68", Write(C[3:]), run=1.0)
        br = Brace(C[4], DOWN, buff=0.12, color=GRN)
        one = M("1", size=60, color=GRN).next_to(br, DOWN, buff=0.1)
        self.go("54:05.74", GrowFromCenter(br), Write(one), run=0.5)
        D = M("=", "7", r"\cdot", "1", "=", "7", size=72).next_to(C, RIGHT, buff=0.3)
        D[3].set_color(GRN)
        D[5].set_color(GRN)
        self.go("54:06.40", Write(D[0:4]), run=0.6)
        self.go("54:08.10", Write(D[4:]), run=0.4)
        self.play(Create(answer_box(D[5])), run_time=0.4)


# ================================================================ continuity

class K09_Pencil(Shot):
    def body(self):
        self.title("Continuity", "54:10.02")
        ax = axes((0, 6, 1), (0, 4, 1), x_length=9, y_length=4.2, center=(0, -0.7, 0), nums=False)
        f = lambda x: 1.9 + 0.8 * np.sin(1.2 * x - 0.6) + 0.12 * x
        self.go("54:11.40", Create(ax), FadeIn(ax.labels), run=0.6)
        xt, trail, pen = tracer(ax, f, 0.3, color=BLUE)
        self.add(trail)
        self.go("54:14.40", FadeIn(pen), run=0.3)
        self.go("54:14.80", xt.animate.set_value(5.6), run=2.2, rate_func=linear)
        self.wipe("54:17.10", run=0.3)
        m1, m2, m3 = mini("hole", -4.4, "hole"), mini("jump", 0, "jump"), mini("blow", 4.4, "blow-up")
        for m, t in ((m1, "54:17.80"), (m2, "54:18.70"), (m3, "54:19.60")):
            self.go(t, Create(m.ax), FadeIn(m.art), FadeIn(m.lab, shift=UP * 0.1), run=0.5)
            self.play(Create(m.x), run_time=0.25)
        self.go("54:21.20", *[Circumscribe(m.x, color=RED, buff=0.1) for m in (m1, m2, m3)], run=0.8)


class K09_ThreeRules(Shot):
    def body(self):
        self.title("Continuity", animate=False)
        self.title("Continuous at a Point", "54:23.80")
        ax = axes((0, 5, 1), (0, 5, 1), x_length=5.4, y_length=4.8, center=(3.7, -0.75, 0), nums=False)
        f = lambda x: 1.2 + 0.45 * x + 0.55 * np.sin(1.4 * x)
        a, fa = 2.5, f(2.5)
        c = curve(ax, f, [0.2, 4.7])
        self.go("54:24.50", Create(ax), FadeIn(ax.labels), run=0.4)
        self.play(draw(c, 0.8))
        al = M("a", size=44, color=ORG).next_to(ax.c2p(a, 0), DOWN, buff=0.15)
        vl = dline(ax.c2p(a, 0), ax.c2p(a, fa))
        self.go("54:25.90", FadeIn(al, shift=UP * 0.1), Create(vl), run=0.5)
        r1 = M("1.", r"\ f(a)\text{ exists}", size=54)
        r2 = M("2.", r"\ \lim_{x\to a} f(x)\text{ exists}", size=54)
        r3 = M("3.", r"\ \lim_{x\to a} f(x)", "=", "f(a)", size=54)
        for r, y in ((r1, 1.3), (r2, -0.1), (r3, -1.5)):
            r.move_to([-6.3, y, 0], aligned_edge=LEFT)
        for r in (r1, r2, r3):
            r[0].set_color(YEL)
        D = pt(ax, a, fa, ORG, r=0.1)
        self.go("54:28.58", Write(r1[0]), run=0.3)
        self.go("54:29.24", Write(r1[1]), run=0.8)
        self.go("54:31.56", FadeIn(D, scale=0.4), run=0.4)
        self.go("54:32.76", Write(r2[0]), run=0.3)
        self.go("54:33.58", Write(r2[1]), run=1.0)
        xl, xr = ValueTracker(0.6), ValueTracker(4.4)
        rl, rr = rider(ax, f, xl, BLUE), rider(ax, f, xr, ORG)
        self.go("54:37.00", FadeIn(rl), FadeIn(rr), run=0.2)
        self.play(xl.animate.set_value(a - 0.16), xr.animate.set_value(a + 0.16), run_time=1.6)
        self.go("54:39.90", Write(r3[0]), run=0.3)
        self.go("54:40.84", Write(r3[1:3]), run=0.8)
        r3[3].set_color(ORG)
        self.go("54:43.78", Write(r3[3]), run=0.5)
        still(rl, rr)
        self.play(FadeOut(rl), FadeOut(rr), run_time=0.3)
        # it goes where it's heading: both sides arrive exactly at the dot
        xl2, xr2 = ValueTracker(1.0), ValueTracker(4.0)
        rl2, rr2 = rider(ax, f, xl2, BLUE), rider(ax, f, xr2, ORG)
        self.go("54:45.40", FadeIn(rl2), FadeIn(rr2), run=0.2)
        self.play(xl2.animate.set_value(a), xr2.animate.set_value(a), run_time=2.4)
        still(rl2, rr2)
        b3 = box(r3, YEL, buff=0.15)
        self.go("54:48.92", FadeOut(rl2), FadeOut(rr2), Create(b3), run=0.5)
        self.go("54:50.62", Circumscribe(D, Circle, color=ORG, buff=0.1), run=0.8)
        # break any one of them: discontinuous
        self.go("54:52.70", FadeOut(b3), *[r[0].animate.set_color(RED) for r in (r1, r2, r3)], run=0.5)
        hl = hole(ax, a, fa)
        self.go("54:53.20", FadeIn(hl), D.animate.move_to(ax.c2p(a, fa + 1.3)).set_color(RED), run=0.7)
        dis = H("discontinuous", 48, RED).move_to([-3.9, -2.9, 0])
        self.go("54:54.58", Write(dis), run=0.7)


class K09_Removable(Shot):
    def body(self):
        self.title("Continuous at a Point", animate=False)
        self.title("Three Kinds of Breaks", "54:56.60")
        ms = [mini("hole", -4.4, "removable"), mini("jump", 0, "jump"), mini("blow", 4.4, "infinite")]
        self.go("54:57.12", *[FadeIn(VGroup(m.ax, m.art, m.lab), shift=UP * 0.15) for m in ms], run=0.8)
        self.go("54:59.70", *[VGroup(m.ax, m.art, m.lab).animate.fade(0.75) for m in ms[1:]], Circumscribe(ms[0].lab, color=YEL), run=0.7)
        self.wipe("55:00.60", run=0.3)
        self.title("Removable: a Hole", "55:00.95")
        ax = axes((0, 5, 1), (0, 9, 3), x_length=5.4, y_length=4.8, center=(3.6, -0.75, 0))
        f = lambda x: x + 3
        c = VGroup(curve(ax, f, [0.1, 2.88]), curve(ax, f, [3.12, 4.8]))
        h = hole(ax, 3, 6)
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.4)
        self.play(Create(c), run_time=0.6)
        self.play(FadeIn(h, scale=0.5), run_time=0.2)
        xl, xr = ValueTracker(0.6), ValueTracker(4.6)
        rl, rr = rider(ax, f, xl, BLUE), rider(ax, f, xr, ORG)
        self.go("55:03.12", FadeIn(rl), FadeIn(rr), run=0.2)
        self.play(xl.animate.set_value(2.8), xr.animate.set_value(3.2), run_time=1.4)
        still(rl, rr)
        nv = note("no value", h, UP, RED, dist=0.6)
        self.go("55:05.50", FadeOut(rl), FadeOut(rr), FadeIn(nv), run=0.5)
        wrong = pt(ax, 3, 2, RED, r=0.1)
        self.go("55:07.00", FadeIn(wrong, scale=0.4), run=0.3)
        self.go("55:08.30", FadeOut(wrong), FadeOut(nv), run=0.4)
        rg = ring(h.get_center(), 0.3)
        self.go("55:10.80", Create(rg), run=0.5)
        F = M("f(x)", "=", r"\frac{x^2-9}{x-3}", size=60).move_to([-3.4, 1.15, 0])
        self.go("55:12.62", FadeOut(rg), Write(F[0:2]), run=0.4)
        self.play(Write(F[2]), run_time=1.4)
        v3 = dline(ax.c2p(3, 0), ax.c2p(3, 5.7), ORG)
        self.go("55:16.46", Create(v3), ax.labels[2].animate.set_color(ORG).scale(1.3), run=0.5)
        L = M(r"\lim_{x\to 3} f(x)", "=", "6", size=56).move_to([-3.4, -0.3, 0])
        L[2].set_color(GRN)
        h6 = dline(ax.c2p(0, 6), ax.c2p(2.9, 6), GRN)
        self.go("55:17.70", Write(L[0:2]), run=0.6)
        self.go("55:18.45", Write(L[2]), Create(h6), ax.labels[5].animate.set_color(GRN).scale(1.3), run=0.5)
        Dd = M("f(3)", "=", "6", size=56, color=ORG).move_to([-3.4, -1.65, 0])
        self.go("55:19.82", Write(Dd), run=0.9)
        fill = pt(ax, 3, 6, ORG, r=0.1)
        self.go("55:22.00", TransformFromCopy(Dd[2], fill), run=0.6)
        self.remove(h)
        tk = tick_mark(GRN, 0.45).next_to(Dd, RIGHT, buff=0.4)
        self.go("55:23.90", Create(tk), run=0.4)


class K09_JumpInf(Shot):
    def body(self):
        self.title("Removable: a Hole", animate=False)
        self.title("Jumps and Blow-Ups", "55:25.40")
        ax = axes((-1, 4, 1), (-1, 6, 1), x_length=5.2, y_length=4.6, center=(-3.4, -0.6, 0))
        p1 = curve(ax, lambda x: x + 1, [-0.9, 1.9])
        h3 = hole(ax, 2, 3)
        p2 = Line(ax.c2p(2, 5), ax.c2p(3.8, 5), color=ORG, stroke_width=5)
        d5 = pt(ax, 2, 5, ORG, r=0.1)
        lj = H("jump", 40, YEL).move_to([-3.4, -3.55, 0])
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.4)
        self.play(Create(p1), FadeIn(h3), Create(p2), FadeIn(d5), FadeIn(lj), run_time=0.8)
        xl, xr = ValueTracker(-0.6), ValueTracker(3.7)
        rl, rr = rider(ax, lambda x: x + 1, xl, BLUE), rider(ax, lambda x: 5.0, xr, ORG)
        self.go("55:27.10", FadeIn(rl), FadeIn(rr), run=0.2)
        self.play(xl.animate.set_value(1.82), xr.animate.set_value(2.18), run_time=1.3)
        still(rl, rr)
        self.go("55:31.40", FadeOut(rl), ax.labels[7].animate.set_color(BLUE).scale(1.35), run=0.4)
        ja = arr(ax.c2p(2.35, 3.15), ax.c2p(2.35, 4.85), YEL, 5)
        self.go("55:31.95", FadeOut(rr), ax.labels[9].animate.set_color(ORG).scale(1.35), GrowArrow(ja), run=0.5)
        # move the one point: the gap is still there
        self.go("55:33.30", d5.animate.move_to(ax.c2p(2, 3)), run=0.7)
        cx = cross_mark(s=0.18).move_to(ax.c2p(3.0, 3.9))
        self.go("55:34.36", Create(cx), run=0.4)
        # infinite: a vertical asymptote
        bx = axes((0, 4, 1), (0, 6, 1), x_length=4.6, y_length=4.6, center=(3.6, -0.6, 0))
        g = lambda x: 1 / (x - 2) ** 2
        bl, brr = curve(bx, g, [0.1, 1.59]), curve(bx, g, [2.41, 3.9])
        li = H("infinite", 40, RED).move_to([3.6, -3.55, 0])
        self.go("55:36.10", Create(bx), FadeIn(bx.labels), run=0.4)
        self.play(Create(bl), Create(brr), FadeIn(li), run_time=0.8)
        va = dline(bx.c2p(2, 0), bx.c2p(2, 6), RED)
        self.go("55:37.86", Create(va), run=0.5)
        xt = ValueTracker(3.6)
        up = rider(bx, g, xt, YEL)
        self.go("55:39.30", FadeIn(up), run=0.2)
        self.play(xt.animate.set_value(2.42), run_time=1.2, rate_func=rate_functions.ease_in_sine)


class K09_GoodNews(Shot):
    def body(self):
        self.title("The Good News", "55:41.12")
        X0, X1, X2 = -6.3, -2.5, 2.3
        def at(m, x, y):
            return m.move_to([x, y, 0], aligned_edge=LEFT)
        n1, e1, v1 = at(H("polynomials", 42), X0, 1.4), at(M("x^3-2x+1", size=54, color=BLUE), X1, 1.4), at(H("everywhere", 40, GRN), X2, 1.4)
        n2, e2 = at(H("rational", 42), X0, 0.15), at(M(r"\frac{x+1}{x-2}", size=54, color=BLUE), X1, 0.15)
        v2 = at(M(r"\text{except }", "x=2", size=48, color=GRN), X2, 0.15)
        v2[1].set_color(RED)
        e3 = at(M(r"\sqrt{x},", r"\ e^x,", r"\ \ln x,", r"\ \sin x,", r"\ \cos x", size=54, color=BLUE), X0, -1.1)
        v3 = at(H("on their domains", 40, GRN), X2, -1.1)
        self.go("55:46.44", FadeIn(n1, shift=RIGHT * 0.1), run=0.4)
        self.go("55:46.90", Write(e1), run=0.6)
        self.go("55:47.60", FadeIn(v1, shift=LEFT * 0.1), run=0.4)
        self.go("55:48.64", FadeIn(n2, shift=RIGHT * 0.1), run=0.4)
        self.go("55:49.10", Write(e2), run=0.6)
        self.go("55:50.72", FadeIn(v2, shift=LEFT * 0.1), run=0.5)
        self.go("55:51.48", Circumscribe(e2[0][-3:], color=RED, buff=0.06), run=0.7)
        for k, t in enumerate(("55:52.94", "55:54.52", "55:55.18", "55:55.98", "55:56.70")):
            self.go(t, Write(e3[k]), run=0.45)
        self.go("55:58.30", FadeIn(v3, shift=LEFT * 0.1), run=0.4)
        e4 = at(M("f+g,", r"\ f-g,", r"\ f\cdot g,", r"\ f(g(x))", size=54), X0, -2.45)
        for k, t in enumerate(("56:00.14", "56:00.72", "56:01.44", "56:02.16")):
            self.go(t, Write(e4[k]), run=0.45)
        v4 = VGroup(M(r"\Rightarrow", size=54, color=DIM), H("continuous", 40, GRN)).arrange(RIGHT, buff=0.3)
        at(v4, X2, -2.45)
        self.go("56:04.60", FadeIn(v4, shift=LEFT * 0.1), run=0.5)
        # why direct substitution works
        self.wipe("56:06.10", run=0.35)
        K = M(r"\lim_{x\to a} f(x)", "=", "f(a)", size=72).move_to([0, 1.0, 0])
        K[2].set_color(YEL)
        self.go("56:06.96", Write(K), run=0.9)
        self.go("56:10.40", Circumscribe(K[2], color=YEL, buff=0.1), run=0.8)
        E = M(r"\lim_{x\to 2}(x^2+1)", "=", "2^2+1", "=", "5", size=64).move_to([0, -1.0, 0])
        E[4].set_color(GRN)
        self.go("56:11.30", Write(E[0]), run=0.8)
        self.go("56:12.44", Write(E[1:3]), run=0.6)
        nt = note("plug in", E[2], DOWN, YEL, dist=0.5, angle=0.5)
        self.go("56:13.90", Write(E[3:]), FadeIn(nt), run=0.5)


def k_board(k0):
        P = piece("x^2", "x<1", ("k", "x+3"), r"x\ge 1", center=(-3.5, 1.15))
        P["v2"][0].set_color(YEL)
        ax = axes((-2, 3, 1), (-3, 5, 1), x_length=5.2, y_length=5.4, center=(3.5, -0.85, 0))
        lp = curve(ax, lambda x: x * x, [-1.9, 0.9])
        h = hole(ax, 1, 1)
        kt = ValueTracker(k0)
        rp = always_redraw(lambda: Line(ax.c2p(1, kt.get_value() + 3), ax.c2p(2.8, 2.8 * kt.get_value() + 3),
                                        color=ORG, stroke_width=5))
        rd = always_redraw(lambda: pt(ax, 1, kt.get_value() + 3, ORG, r=0.09))
        return P, ax, lp, h, kt, rp, rd


def k_ask():
    kq = VGroup(M("k", "=", size=60), H("?", 56)).arrange(RIGHT, buff=0.15).move_to([-3.5, -1.2, 0])
    kq[0][0].set_color(YEL)
    return kq


def k_gap(ax):
    return DoubleArrow(ax.c2p(1.35, 1.1), ax.c2p(1.35, 2.9), buff=0, color=RED, stroke_width=4, tip_length=0.16)


class K09_KSetup(Shot):
    def body(self):
        self.title("Pick the Constant", "56:15.12")
        P, ax, lp, h, kt, rp, rd = k_board(0.5)
        self.go("56:16.40", Create(ax), FadeIn(ax.labels), run=0.6)
        kq = k_ask()
        self.go("56:19.82", Write(kq), run=0.6)
        self.go("56:24.50", Write(P["lhs"]), Create(P["br"]), run=0.6)
        self.go("56:25.32", Write(P["v1"]), run=0.5)
        self.play(Create(lp), FadeIn(h), run_time=0.5)
        self.go("56:26.40", Write(P["c1"]), run=0.5)
        self.go("56:28.10", Write(P["v2"]), Create(rp), FadeIn(rd), run=0.7)
        self.go("56:29.24", Write(P["c2"]), run=0.5)
        self.go("56:31.40", Circumscribe(P["v2"][0], Circle, color=YEL, buff=0.08), Circumscribe(kq[0][0], Circle, color=YEL, buff=0.08), run=0.7)
        self.play(kt.animate.set_value(0.7), run_time=0.8)
        self.play(kt.animate.set_value(0.0), run_time=1.2)
        v1 = dline(ax.c2p(1, -3), ax.c2p(1, 5), YEL)
        self.go("56:36.60", Create(v1), run=0.5)
        self.go("56:38.04", ax.labels[2].animate.set_color(YEL).scale(1.35), run=0.4)
        xl, xr = ValueTracker(-1.6), ValueTracker(2.7)
        rl, rr = rider(ax, lambda x: x * x, xl, BLUE), rider(ax, lambda x: 3.0, xr, ORG)
        self.go("56:40.60", FadeIn(rl), FadeIn(rr), run=0.2)
        self.play(xl.animate.set_value(0.9), xr.animate.set_value(1.0), run_time=1.6)
        still(rl, rr)
        gap = k_gap(ax)
        self.go("56:43.30", FadeOut(rl), FadeOut(rr), GrowFromCenter(gap), run=0.5)


class K09_FindK(Shot):
    def body(self):
        self.title("Pick the Constant", animate=False)
        P, ax, lp, h, kt, rp, rd = k_board(0.0)
        ax.labels[2].set_color(YEL).scale(1.35)
        v1 = dline(ax.c2p(1, -3), ax.c2p(1, 5), YEL)
        kq, gap = k_ask(), k_gap(ax)
        self.add(P["all"], ax, ax.labels, lp, h, rp, rd, v1, kq, gap)
        R1 = M(r"x\to 1^-:", r"\ x^2", r"\to", "1", size=52).move_to([-6.3, -0.45, 0], aligned_edge=LEFT)
        R2 = M(r"x=1:", r"\ k(1)+3", "=", "k+3", size=52).move_to([-6.3, -1.4, 0], aligned_edge=LEFT)
        R3 = M("1", "=", "k+3", size=58).move_to([-6.0, -2.55, 0], aligned_edge=LEFT)
        R4 = VGroup(M(r"\Rightarrow", size=58), M("k=-2", size=58)).arrange(RIGHT, buff=0.4).next_to(R3, RIGHT, buff=0.45)
        for i in (1, 3):
            R1[i].set_color(BLUE)
            R2[i].set_color(ORG)
        R4[1:].set_color(GRN)
        self.go("56:44.56", Write(R1[0]), FadeOut(kq), run=0.6)
        self.go("56:45.98", Write(R1[1]), run=0.4)
        xl = ValueTracker(-1.6)
        rl = rider(ax, lambda x: x * x, xl, BLUE)
        self.play(FadeIn(rl), run_time=0.2)
        self.play(xl.animate.set_value(0.9), run_time=1.4)
        still(rl)
        self.go("56:48.40", Write(R1[2:]), ax.labels[7].animate.set_color(BLUE).scale(1.35), FadeOut(rl), run=0.5)
        self.go("56:50.10", Write(R2[0]), run=0.5)
        self.go("56:51.46", Write(R2[1]), run=0.6)
        self.go("56:53.36", Circumscribe(rd, Circle, color=ORG, buff=0.1), run=0.7)
        self.go("56:54.26", Write(R2[2:]), run=0.5)
        self.go("56:57.44", TransformFromCopy(R1[3], R3[0]), Write(R3[1]), TransformFromCopy(R2[3], R3[2]), run=0.8)
        self.go("56:59.42", Write(R4), FadeOut(gap), kt.animate.set_value(-2), run=1.8)
        self.play(Create(answer_box(R4[1:])), run_time=0.4)
        self.remove(h)
        self.go("57:03.90", Create(ring(ax.c2p(1, 1), 0.28, GRN)), run=0.5)
        F = lambda x: x * x if x < 1 else 3 - 2 * x
        xt, trail, pen = tracer(ax, F, -1.9, color=YEL, width=4)
        self.add(trail)
        self.go("57:05.60", FadeIn(pen), run=0.2)
        self.play(xt.animate.set_value(2.8), run_time=2.2, rate_func=linear)


class K09_FindA(Shot):
    def body(self):
        self.title("Try One", "57:10.00")
        P = piece(("2x+", "a"), "x<3", "x^2-1", r"x\ge 3", center=(0, 1.2))
        P["v1"][1].set_color(YEL)
        self.go("57:10.52", Write(P["lhs"]), Create(P["br"]), run=0.4)
        self.go("57:10.95", Write(P["v1"]), run=0.6)
        self.go("57:12.40", Write(P["c1"]), run=0.5)
        self.go("57:14.34", Write(P["v2"]), run=0.6)
        self.go("57:16.04", Write(P["c2"]), run=0.5)
        self.go("57:17.74", Circumscribe(P["v1"][1], Circle, color=YEL, buff=0.08), run=0.7)
        L = M(r"\text{left: }", "2(3)+a", "=", "6+a", size=54).move_to([-3.4, -0.6, 0])
        R = M(r"\text{right: }", "3^2-1", "=", "8", size=54).move_to([3.4, -0.6, 0])
        L[0].set_color(DIM)
        R[0].set_color(DIM)
        self.go("57:19.12", Write(L[0]), run=0.5)
        self.go("57:19.82", Write(L[1]), run=0.9)
        self.go("57:22.10", Write(L[2:]), run=0.5)
        self.go("57:23.52", Write(R[0]), run=0.5)
        self.go("57:24.32", Write(R[1]), run=0.6)
        self.go("57:25.90", Write(R[2:]), run=0.4)
        E = M("6+a", "=", "8", size=64).move_to([-1.2, -2.2, 0])
        self.go("57:28.32", TransformFromCopy(L[3], E[0]), Write(E[1]), TransformFromCopy(R[3], E[2]), run=0.8)
        A = VGroup(M(r"\Rightarrow", size=64), M("a=2", size=64)).arrange(RIGHT, buff=0.4).next_to(E, RIGHT, buff=0.45)
        A[1:].set_color(GRN)
        self.go("57:30.30", Write(A), run=0.6)
        self.play(Create(answer_box(A[1:])), run_time=0.4)


# ================================================================ intermediate value theorem

class K09_IVT(Shot):
    def body(self):
        self.title("Try One", animate=False)
        self.title("Intermediate Value Theorem", "57:33.74")
        ax = axes((0, 6, 1), (0, 5, 1), x_length=8.4, y_length=4.8, center=(0.4, -0.8, 0), nums=False)
        f = lambda x: 1 + 0.75 * (x - 1) + 0.35 * np.sin(1.6 * (x - 1))
        xs = np.linspace(1, 5, 400)
        ys = f(xs)
        finv = lambda y: float(np.interp(y, ys, xs))
        self.go("57:36.70", Create(ax), FadeIn(ax.labels), run=0.6)
        xt, trail, pen = tracer(ax, f, 1.0, color=BLUE)
        self.add(trail)
        self.go("57:39.40", FadeIn(pen), run=0.2)
        self.play(xt.animate.set_value(5.0), run_time=1.6, rate_func=linear)
        da, db = dline(ax.c2p(1, 0), ax.c2p(1, f(1))), dline(ax.c2p(5, 0), ax.c2p(5, f(5)))
        la = M("a", size=44, color=ORG).next_to(ax.c2p(1, 0), DOWN, buff=0.15)
        lb = M("b", size=44, color=ORG).next_to(ax.c2p(5, 0), DOWN, buff=0.15)
        self.go("57:41.20", FadeOut(pen), Create(da), FadeIn(la, shift=UP * 0.1), run=0.4)
        self.play(Create(db), FadeIn(lb, shift=UP * 0.1), run_time=0.3)
        N = ValueTracker(2.5)
        nl = always_redraw(lambda: DashedLine(ax.c2p(0, N.get_value()), ax.c2p(6, N.get_value()), color=YEL,
                                              stroke_width=4, dash_length=0.12))
        nlab = M("N", size=48, color=YEL)
        nlab.add_updater(lambda m: m.next_to(ax.c2p(6, N.get_value()), RIGHT, buff=0.15))
        cd = always_redraw(lambda: Dot(ax.c2p(finv(N.get_value()), N.get_value()), radius=0.1, color=YEL).set_z_index(7))
        cv = always_redraw(lambda: DashedLine(ax.c2p(finv(N.get_value()), N.get_value()), ax.c2p(finv(N.get_value()), 0),
                                              color=YEL, stroke_width=3, dash_length=0.08))
        self.go("57:42.90", Create(nl), FadeIn(nlab), FadeIn(cd), Create(cv), run=0.5)
        fa = M("f(a)", size=40, color=ORG).next_to(ax.c2p(0, f(1)), LEFT, buff=0.15)
        fb = M("f(b)", size=40, color=ORG).next_to(ax.c2p(0, f(5)), LEFT, buff=0.15)
        ha, hb = dline(ax.c2p(0, f(1)), ax.c2p(1, f(1))), dline(ax.c2p(0, f(5)), ax.c2p(5, f(5)))
        self.go("57:44.00", FadeIn(fa), Create(ha), run=0.4)
        self.go("57:44.95", FadeIn(fb), Create(hb), run=0.4)
        self.play(N.animate.set_value(1.1), run_time=0.8)
        self.play(N.animate.set_value(3.95), run_time=1.6)


class K09_Temp(Shot):
    def body(self):
        self.title("Temperature", "57:48.40")
        T = lambda t: 15 + 10 * t / 6 + 0.9 * np.sin(PI * t / 3)
        g = lambda t: T(t) - 10
        ts = np.linspace(0, 6, 400)
        tc = float(np.interp(20, T(ts), ts))
        # thermometer
        X = -5.3
        ty = lambda v: -2.0 + (v - 10) / 20 * 3.3
        tube = RoundedRectangle(width=0.44, height=3.7, corner_radius=0.22, stroke_color=CHALK, stroke_width=4).move_to([X, -0.45, 0])
        bulb = Circle(radius=0.36, stroke_color=CHALK, stroke_width=4, fill_color=ORG, fill_opacity=1).move_to([X, -2.5, 0])
        ticks = VGroup(*[Line([X + 0.22, ty(v), 0], [X + 0.42, ty(v), 0], color=CHALK, stroke_width=3) for v in (15, 20, 25)])
        tl = VGroup(*[M(f"{v}^\\circ", size=34, color=DIM).next_to([X + 0.42, ty(v), 0], RIGHT, buff=0.1) for v in (15, 20, 25)])
        xt = ValueTracker(0.0)
        merc = always_redraw(lambda: Rectangle(width=0.2, height=ty(T(xt.get_value())) + 2.3, stroke_width=0, fill_color=ORG,
                                               fill_opacity=1).move_to([X, -2.3, 0], aligned_edge=DOWN))
        deg = M(r"{}^\circ", size=48, color=ORG)
        read = always_redraw(lambda: VGroup(digits(f"{T(xt.get_value()):.0f}", 48, ORG), deg.copy()).arrange(RIGHT, buff=0.03, aligned_edge=UP).move_to([X, 1.85, 0]))
        self.go("57:48.90", Create(tube), FadeIn(bulb), FadeIn(merc), Create(ticks), FadeIn(tl), FadeIn(read), run=0.7)
        # graph of the morning
        ax = axes((0, 7, 1), (0, 18, 5), x_length=8.0, y_length=4.6, center=(1.7, -0.75, 0), nums=False, x_label=None, y_label=None)
        yl = {v: M(f"{v}^\\circ", size=34, color=DIM).next_to(ax.c2p(0, v - 10), LEFT, buff=0.12) for v in (15, 20, 25)}
        x6 = H("6 am", 34, DIM).next_to(ax.c2p(0, 0), DOWN, buff=0.15)
        xn = H("noon", 34, DIM).next_to(ax.c2p(6, 0), DOWN, buff=0.15)
        self.play(Create(ax), run_time=0.5)
        p0, p1 = pt(ax, 0, 5, ORG, r=0.1), pt(ax, 6, 15, ORG, r=0.1)
        self.go("57:50.10", FadeIn(p0, scale=0.4), FadeIn(yl[15]), run=0.4)
        self.go("57:51.10", FadeIn(x6, shift=UP * 0.1), run=0.4)
        self.go("57:52.12", FadeIn(p1, scale=0.4), FadeIn(yl[25]), run=0.4)
        self.go("57:53.20", FadeIn(xn, shift=UP * 0.1), run=0.4)
        tt, trail, pen = tracer(ax, g, 0.0, color=BLUE)
        xt.add_updater(lambda m: m.set_value(tt.get_value()))
        self.add(trail, xt)
        self.play(FadeIn(pen), run_time=0.2)
        self.play(tt.animate.set_value(tc), run_time=2.4, rate_func=linear)
        l20 = DashedLine(ax.c2p(0, 10), ax.c2p(6.8, 10), color=YEL, stroke_width=4, dash_length=0.12)
        yl[20].set_color(YEL)
        self.go("57:56.62", Create(l20), FadeIn(yl[20]), Create(ring(ax.c2p(tc, 10), 0.22)), run=0.5)
        self.play(tt.animate.set_value(6.0), run_time=1.6, rate_func=linear)
        span = Line(ax.c2p(0, 5), ax.c2p(0, 15), color=GRN, stroke_width=10).set_z_index(2)
        self.go("58:00.28", FadeOut(pen), Create(span), run=0.8)


class K09_Mountain(Shot):
    def body(self):
        self.title("Climbing a Mountain", "58:03.80")
        yA = lambda alt: -2.7 + (alt - 1000) / 1000 * 2.1
        P = [np.array([x, y, 0]) for x, y in [(-4.2, -2.7), (-3.2, -1.7), (-2.6, -2.0), (-1.4, -0.75), (-0.7, -1.05),
                                               (0.5, 0.55), (1.2, 0.25), (2.4, 1.5), (3.4, 0.4), (4.2, 0.7), (5.6, -2.7)]]
        mtn = VMobject(stroke_color=CHALK, stroke_width=5).set_points_as_corners(P)
        ground = Line([-4.7, -2.7, 0], [6.1, -2.7, 0], color=DIM, stroke_width=3)
        route = P[:8]
        seglen = [np.linalg.norm(route[i + 1] - route[i]) for i in range(7)]
        cum = np.concatenate([[0], np.cumsum(seglen)])

        def at(s):
            d = s * cum[-1]
            i = min(int(np.searchsorted(cum, d, side="right")) - 1, 6)
            u = (d - cum[i]) / seglen[i]
            return route[i] + u * (route[i + 1] - route[i]), i
        ss = np.linspace(0, 1, 2001)
        sc = float(ss[np.argmax([at(s)[0][1] >= yA(2000) for s in ss])])
        self.go("58:04.30", Create(ground), run=0.3)
        self.play(draw(mtn, 0.9))
        def alt_lab(alt, color=DIM):
            return VGroup(Line([-5.05, yA(alt), 0], [-4.8, yA(alt), 0], color=color, stroke_width=3),
                          M(f"{alt}" + r"\text{ m}", size=36, color=color).next_to([-5.05, yA(alt), 0], LEFT, buff=0.1))
        st = Dot(route[0], radius=0.11, color=ORG).set_z_index(6)
        self.go("58:05.88", FadeIn(st, scale=0.4), FadeIn(alt_lab(1000)), run=0.4)
        top = route[7]
        flag = VGroup(Line(top, top + UP * 0.6, color=CHALK, stroke_width=3),
                      Polygon(top + UP * 0.6, top + UP * 0.38 + RIGHT * 0.35, top + UP * 0.16, stroke_width=0, fill_color=GRN, fill_opacity=1))
        self.go("58:07.54", Create(flag), FadeIn(alt_lab(3000)), run=0.5)
        l2 = DashedLine([-4.8, yA(2000), 0], [5.6, yA(2000), 0], color=YEL, stroke_width=3, dash_length=0.12)
        s = ValueTracker(0.0)

        def trail():
            p, i = at(s.get_value())
            return VMobject(stroke_color=YEL, stroke_width=5).set_points_as_corners([*route[:i + 1], p] if s.get_value() > 1e-3 else [route[0], route[0] + RIGHT * 1e-3]).set_z_index(4)
        tr = always_redraw(trail)
        st.add_updater(lambda m: m.move_to(at(s.get_value())[0]))
        self.add(tr)
        self.go("58:08.60", Create(l2), FadeIn(alt_lab(2000, YEL)), run=0.4)
        self.play(s.animate.set_value(sc), run_time=2.0, rate_func=linear)
        cr = ring(at(sc)[0], 0.25, YEL)
        self.play(Create(cr), s.animate.set_value(1.0), run_time=1.0, rate_func=linear)
        self.go("58:12.42", cr.animate.set_color(GRN), Circumscribe(cr, Circle, color=GRN, buff=0.05), run=0.7)


class K09_Cubic(Shot):
    def body(self):
        self.title("Using the Theorem", "58:14.20")
        ax = axes((-0.5, 1.5, 0.5), (-2, 2, 1), x_length=5.0, y_length=5.0, center=(3.5, -0.85, 0))
        self.go("58:16.00", Create(ax), FadeIn(ax.labels), run=0.7)
        Q = M("x^3+x-1", "=", "0", size=60).move_to([-3.4, 1.35, 0])
        self.go("58:20.58", Write(Q), run=1.6)
        I0 = VGroup(M("0<x<1", size=50, color=DIM), H("?", 46, DIM)).arrange(RIGHT, buff=0.2).move_to([-3.4, 0.35, 0])
        self.go("58:24.54", Write(I0), run=0.6)
        F = M("f(x)", "=", "x^3+x-1", size=60).move_to([-3.4, 1.35, 0])
        self.go("58:26.46", ReplacementTransform(Q, F), run=0.7)
        f = lambda x: x ** 3 + x - 1
        cont = VGroup(tick_mark(GRN, 0.4), H("continuous", 42, GRN)).arrange(RIGHT, buff=0.25).move_to([-3.4, 0.35, 0])
        self.go("58:28.30", FadeOut(I0), FadeIn(cont, shift=UP * 0.1), run=0.6)
        A0 = M("f(0)", "=", "0+0-1", "=", "-1", size=54).move_to([-3.4, -0.85, 0])
        A1 = M("f(1)", "=", "1+1-1", "=", "1", size=54).move_to([-3.4, -2.1, 0])
        A1.align_to(A0, LEFT)
        A0[4].set_color(ORG)
        A1[4].set_color(ORG)
        self.go("58:30.58", Write(A0[0:2]), run=0.5)
        self.go("58:31.52", Write(A0[2]), run=0.8)
        q0, q1 = pt(ax, 0, -1, ORG, r=0.1), pt(ax, 1, 1, ORG, r=0.1)
        self.go("58:33.50", Write(A0[3:]), FadeIn(q0, scale=0.4), run=0.5)
        self.go("58:34.94", Write(A1[0:2]), run=0.5)
        self.go("58:35.80", Write(A1[2]), run=0.8)
        self.go("58:37.40", Write(A1[3:]), FadeIn(q1, scale=0.4), run=0.5)
        self.go("58:39.80", Circumscribe(q0, Circle, color=ORG, buff=0.08), Circumscribe(A0[4], color=ORG, buff=0.08), run=0.7)
        self.go("58:41.50", Circumscribe(q1, Circle, color=ORG, buff=0.08), Circumscribe(A1[4], color=ORG, buff=0.08), run=0.7)
        r = 0.6823278
        xt, trail, pen = tracer(ax, f, 0.0, color=BLUE)
        self.add(trail)
        self.go("58:43.10", FadeIn(pen), run=0.2)
        self.play(xt.animate.set_value(r), run_time=1.5, rate_func=linear)
        rd = Dot(ax.c2p(r, 0), radius=0.11, color=YEL).set_z_index(8)
        self.play(FadeIn(rd, scale=0.4), xt.animate.set_value(1.0), run_time=0.8, rate_func=linear)
        seg = Line(ax.c2p(0, 0), ax.c2p(1, 0), color=GRN, stroke_width=10).set_z_index(2)
        self.go("58:47.00", FadeOut(pen), Create(seg), run=0.6)
        qm = H("?", 60, YEL).move_to(ax.c2p(0.42, 0.6))
        self.go("58:50.20", FadeIn(qm, shift=DOWN * 0.1), Circumscribe(rd, Circle, color=YEL, buff=0.08), run=0.7)


class K09_NeedCont(Shot):
    def body(self):
        self.title("Continuity Is Needed", "58:53.20")
        ax = axes((-3, 3, 1), (-4, 4, 1), x_length=5.4, y_length=5.4, center=(3.4, -0.85, 0))
        f = lambda x: 1 / x
        bl, br = curve(ax, f, [-2.9, -0.25]), curve(ax, f, [0.25, 2.9])
        F = M(r"f(x)=\frac{1}{x}", size=60).move_to([-3.4, 1.2, 0])
        self.go("58:55.66", Write(F), Create(ax), FadeIn(ax.labels), run=0.7)
        self.play(Create(bl), Create(br), run_time=0.8)
        P1 = M("f(-1)", "=", "-1", size=54).move_to([-3.4, -0.1, 0])
        P2 = M("f(1)", "=", "1", size=54).move_to([-3.4, -1.2, 0])
        P1[2].set_color(ORG)
        P2[2].set_color(ORG)
        d1, d2 = pt(ax, -1, -1, ORG, r=0.1), pt(ax, 1, 1, ORG, r=0.1)
        self.go("58:57.40", Write(P1), run=0.8)
        self.go("58:58.60", FadeIn(d1, scale=0.4), run=0.3)
        self.go("59:00.12", Write(P2), run=0.7)
        self.go("59:01.10", FadeIn(d2, scale=0.4), run=0.3)
        zl = Line(ax.c2p(-2.9, 0), ax.c2p(2.9, 0), color=YEL, stroke_width=6).set_z_index(1)
        N = M(r"f(x)\neq 0", size=54, color=RED).move_to([-3.4, -2.4, 0])
        self.go("59:02.32", Create(zl), run=0.5)
        self.play(Write(N), run_time=0.6)
        va = dline(ax.c2p(0, -4), ax.c2p(0, 4), RED, 4)
        self.go("59:05.00", Create(va), run=0.5)
        xt = ValueTracker(-1.0)
        rd = rider(ax, f, xt, YEL)
        self.go("59:06.86", FadeIn(rd), run=0.15)
        self.play(xt.animate.set_value(-0.26), run_time=0.7, rate_func=rate_functions.ease_in_sine)
        self.remove(rd)
        xt.set_value(0.26)
        self.add(rd)
        self.play(xt.animate.set_value(1.0), run_time=0.9, rate_func=rate_functions.ease_out_sine)


# ================================================================ recap

class K09_Recap(Shot):
    def body(self):
        self.title("Chapter 3 Recap", "59:10.00")
        rows = [
            (H("number / 0", 40, YEL), H("vertical asymptote", 36)),
            (M(r"x\to\infty", size=46, color=YEL), H("biggest power wins", 36)),
            (H("squeeze theorem", 38, YEL), H("trapped between two", 34)),
            (M(r"\frac{\sin x}{x}\to 1", size=46, color=YEL), H("in radians", 36)),
            (H("continuous", 38, YEL), H("no holes, jumps, blow-ups", 34)),
        ]
        R = []
        for (l, r), y in zip(rows, (1.45, 0.45, -0.55, -1.6, -2.7)):
            g = VGroup(l, M(r"\Rightarrow", size=44, color=DIM), r).arrange(RIGHT, buff=0.25)
            g.move_to([-6.4, y, 0], aligned_edge=LEFT)
            R.append(g)

        def mk_ax(xr=(-3, 3, 1), yr=(-3, 3, 1)):
            return axes(xr, yr, x_length=3.7, y_length=3.9, center=(4.6, -0.6, 0), nums=False, x_label=None, y_label=None)
        cur = []

        def swap(t, *new, run=0.6):
            self.go(t, *[FadeOut(m) for m in cur], *[FadeIn(m) for m in new], run=run)
            cur[:] = list(new)

        def row(t_l, k):
            anims = [R[j].animate.set_opacity(0.4) for j in range(k)]
            self.go(t_l, FadeIn(R[k][0], shift=RIGHT * 0.1), *anims, run=0.4)
        # 1. number over zero
        a1 = mk_ax()
        m1 = VGroup(a1, curve(a1, lambda x: 1 / (x - 1), [-2.9, 0.66]), curve(a1, lambda x: 1 / (x - 1), [1.34, 2.9]))
        row("59:13.30", 0)
        swap("59:14.20", m1)
        v1 = dline(a1.c2p(1, -3), a1.c2p(1, 3), RED)
        self.go("59:18.80", FadeIn(R[0][1:]), Create(v1), run=0.5)
        cur.append(v1)
        # 2. biggest power wins
        a2 = mk_ax()
        h2 = lambda x: 1.6 * x * x / (x * x + 0.4)
        m2 = VGroup(a2, curve(a2, h2, [-2.9, 2.9]))
        row("59:20.30", 1)
        swap("59:20.80", m2)
        self.go("59:21.96", FadeIn(R[1][1:]), run=0.4)
        hl = dline(a2.c2p(-3, 1.6), a2.c2p(3, 1.6), GRN)
        self.go("59:24.20", Create(hl), run=0.5)
        cur.append(hl)
        # 3. squeeze
        a3 = mk_ax()
        m3 = VGroup(a3, curve(a3, lambda x: x * x / 2, [-2.4, 2.4], color=DIM, width=3),
                    curve(a3, lambda x: -x * x / 2, [-2.4, 2.4], color=DIM, width=3),
                    curve(a3, lambda x: x * x / 2 * np.cos(5 * x), [-2.4, 2.4, 0.01]))
        row("59:26.10", 2)
        swap("59:26.50", m3)
        self.go("59:27.20", FadeIn(R[2][1:]), run=0.4)
        # 4. sin x / x
        a4 = mk_ax((-8, 8, 4), (-0.6, 1.4, 1))
        s4 = lambda x: np.sin(x) / x
        m4 = VGroup(a4, curve(a4, s4, [-7.8, -0.15]),
                    curve(a4, s4, [0.15, 7.8]), hole(a4, 0, 1))
        row("59:29.40", 3)
        swap("59:29.80", m4)
        self.go("59:31.80", FadeIn(R[3][1:]), run=0.4)
        # 5. continuous: the pencil never lifts
        a5 = mk_ax()
        g5 = lambda x: 0.9 * np.sin(1.2 * x) + 0.3 * x
        row("59:32.90", 4)
        swap("59:33.20", a5, run=0.4)
        xt, trail, pen = tracer(a5, g5, -2.7, color=BLUE)
        self.add(trail)
        self.play(FadeIn(pen), run_time=0.2)
        self.play(xt.animate.set_value(2.7), run_time=2.0, rate_func=linear)
        self.go("59:36.24", FadeIn(R[4][1:]), FadeOut(pen), run=0.5)
        # that wraps up limits
        self.go("59:39.28", *[g.animate.set_opacity(1) for g in R[:4]], run=0.5)
        self.wipe("59:40.95", run=0.4)
        self.title("Next: Derivatives", "59:41.40")
        ax = axes((0, 6, 1), (0, 4, 1), x_length=8, y_length=3.8, center=(0, -0.8, 0), nums=False)
        f = lambda x: 2 + 1.2 * np.sin(x - 0.5)
        c = curve(ax, f, [0.2, 5.8])
        self.play(Create(ax), FadeIn(ax.labels), Create(c), run_time=0.6)
        xt2 = ValueTracker(1.0)
        tg = live_tangent(ax, f, xt2, readout=False)
        self.add(tg)
        self.play(xt2.animate.set_value(4.6), run_time=1.3)
