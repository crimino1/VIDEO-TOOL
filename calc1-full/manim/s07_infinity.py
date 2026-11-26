"""Builder 07 (39:33.08 - 46:19.37): start of Chapter 3. Roadmap, infinite limits (1/(x-3) from each side,
vertical asymptote), 1/x^2, (x+1)/(x-2)^2, the sign check, where vertical asymptotes come from, hole vs asymptote,
limits at infinity (1/x table), c/x^n -> 0, horizontal asymptote, divide by the top power, why the biggest term wins."""
from common import *

BOARDC = config.background_color


# ---------------------------------------------------------------- local helpers

def arr(a, b, color, w=6, tip=0.24):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, color=color, stroke_width=w, tip_length=tip,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


def fdot(p, color=ORG, r=0.11):
    return Dot(p, radius=r, color=color).set_z_index(6)


def rider(ax, f, t, color=YEL):
    """A dot riding the graph of f at x = t (ValueTracker)."""
    return always_redraw(lambda: fdot(ax.c2p(t.get_value(), f(t.get_value())), color, r=0.1))


def branch(ax, f, a, b, ymax, color=BLUE, width=6, ymin=None):
    """The piece of f on (a, b) that stays inside |y| <= ymax (never drawn through an asymptote), finely sampled."""
    ymin = -ymax if ymin is None else ymin
    xs = np.linspace(a, b, 6001)[1:-1]
    ys = np.array([f(x) for x in xs])
    idx = np.where((ys <= ymax) & (ys >= ymin))[0]
    lo, hi = xs[idx[0]], xs[idx[-1]]
    p = ax.plot(f, x_range=[lo, hi, (hi - lo) / 400], color=color, stroke_width=width)
    p.xr = (lo, hi)
    return p


def vdash(ax, x, y0, y1, color=YEL):
    return DashedLine(ax.c2p(x, y0), ax.c2p(x, y1), color=color, stroke_width=3, dash_length=0.12)


def hdash(ax, y, x0, x1, color=YEL):
    return DashedLine(ax.c2p(x0, y), ax.c2p(x1, y), color=color, stroke_width=3, dash_length=0.12)


def tag(word, sign, color, size=36):
    """Short sign label like 'tiny +' (the sign in maths font)."""
    return VGroup(H(word, size, color), M(sign, size=size + 10, color=color)).arrange(RIGHT, buff=0.12)


def frac(num, den, size=60, gap=0.14, color=CHALK):
    """Hand-built fraction so the top and bottom pieces can be addressed separately."""
    n = M(*num, size=size, color=color)
    d = M(*den, size=size, color=color)
    w = max(n.width, d.width) + 0.3
    bar = Line(LEFT * w / 2, RIGHT * w / 2, color=color, stroke_width=4)
    n.next_to(bar, UP, buff=gap)
    d.next_to(bar, DOWN, buff=gap)
    return VGroup(n, bar, d)


def table(cx, top, heads, step=0.8, half=1.0, rows=3, size=44):
    """Two-column chalk table: returns (frame, header, cell(i, j, tex, color))."""
    colx = (cx - half, cx + half)
    frame = VGroup(Line([cx, top + 0.4, 0], [cx, top - 0.45 - rows * step, 0], color=CHALK, stroke_width=3),
                   Line([cx - 2 * half - 0.1, top - 0.45, 0], [cx + 2 * half + 0.1, top - 0.45, 0], color=CHALK, stroke_width=3))
    head = VGroup(*[M(h, size=size + 4).next_to([colx[j], top - 0.45, 0], UP, buff=0.14) for j, h in enumerate(heads)])
    cell = lambda i, j, s, c=CHALK: M(s, size=size, color=c).move_to([colx[j], top - 0.45 - (i + 0.55) * step, 0])
    return frame, head, cell


# ---------------------------------------------------------------- the 1/(x-3) board (shared by three shots)

f3 = lambda x: 1 / (x - 3)


def g3():
    ax = axes((0, 6, 1), (-6, 6, 2), 5.6, 5.0, (3.5, -0.65, 0), nums=False)
    three = M("3", size=36, color=ORG).next_to(ax.c2p(3, 0), DR, buff=0.1)
    return ax, three


def g3_label(ax):
    return M(r"y=\frac{1}{x-3}", size=46).move_to(ax.c2p(1.55, 4.1))


def g3_parts(ax):
    rb = branch(ax, f3, 3, 5.85, 6, ORG)
    lb = branch(ax, f3, 0.05, 3, 6, BLUE)
    ua = arr(ax.c2p(3.65, 3.3), ax.c2p(3.65, 5.7), ORG, w=4, tip=0.2)
    ui = M(r"+\infty", size=46, color=ORG).next_to(ua, RIGHT, buff=0.12)
    da = arr(ax.c2p(2.35, -3.3), ax.c2p(2.35, -5.7), BLUE, w=4, tip=0.2)
    di = M(r"-\infty", size=46, color=BLUE).next_to(da, LEFT, buff=0.12)
    return rb, lb, ua, ui, da, di


def g3_results():
    rR = M(r"\lim_{x\to 3^+}\frac{1}{x-3}", "=", r"+\infty", size=50).move_to([-3.6, 1.85, 0])
    rR[2].set_color(ORG)
    rL = M(r"\lim_{x\to 3^-}\frac{1}{x-3}", "=", r"-\infty", size=50).move_to([-3.6, 0.4, 0])
    rL[2].set_color(BLUE)
    return rR, rL


# ---------------------------------------------------------------- 3x^2+5 over 2x^2-x (shared by two shots)

def dt_board():
    fr = frac(("3x^2", "+", "5"), ("2x^2", "-", "x"), size=64).move_to([-1.4, 0.9, 0])
    lim = M(r"\lim_{x\to\infty}", size=64).next_to(fr, LEFT, buff=0.3)
    inf = M(r"\to", r"\frac{\infty}{\infty}", size=64).next_to(fr, RIGHT, buff=0.5)
    ind = H("indeterminate", 42, ORG).next_to(inf[1], DOWN, buff=0.35)
    instr = VGroup(H("divide top and bottom by", 46), M("x^2", size=64, color=YEL)).arrange(RIGHT, buff=0.3).move_to([0, -1.75, 0])
    return fr, lim, inf, ind, instr


# ================================================================ chapter roadmap

class K07_Roadmap(Shot):
    def body(self):
        self.title("What's Ahead", "39:38.12")
        nz = M(r"\frac{5}{0}", size=120).move_to([-2.0, 0.1, 0])
        self.go("39:41.26", Write(nz), run=0.6)
        later = H("later...", 60, DIM).move_to([1.8, 0.1, 0])
        self.go("39:43.28", FadeIn(later, shift=RIGHT * 0.15), run=0.4)
        now = H("now!", 64, YEL).move_to(later)
        self.go("39:45.26", ReplacementTransform(later, now), run=0.45)
        self.go("39:46.54", FadeOut(nz, shift=UP * 0.15), FadeOut(now, shift=UP * 0.15), run=0.3)
        xs = (-5.1, -1.7, 1.7, 5.1)
        mk = lambda xr, yr, x: axes(xr, yr, 2.6, 1.9, (x, 0.35, 0), nums=False, x_label=None, y_label=None)
        # 1. blow up
        a1 = mk((-0.2, 2, 1), (-3.5, 3.5, 1), xs[0])
        g1 = lambda x: 0.25 / (x - 0.8)
        c1 = VGroup(branch(a1, g1, 0.8, 1.95, 3.4, ORG, 4), branch(a1, g1, -0.15, 0.8, 3.4, BLUE, 4))
        d1 = vdash(a1, 0.8, -3.5, 3.5)
        l1 = H("blow up", 42, YEL).move_to([xs[0], -1.35, 0])
        self.go("39:48.10", Create(a1), run=0.3)
        self.play(Create(c1), Create(d1), FadeIn(l1, shift=UP * 0.1), run_time=0.7)
        # 2. x -> infinity
        a2 = mk((0, 6, 1), (0, 2, 1), xs[1])
        g2 = lambda x: 1.5 - 1.2 / (1 + x)
        c2 = curve(a2, g2, [0, 5.8, 0.02], width=4)
        d2 = hdash(a2, 1.5, 0, 5.8)
        l2 = M(r"x\to\infty", size=48, color=YEL).move_to([xs[1], -1.35, 0])
        t2 = ValueTracker(0)
        r2 = rider(a2, g2, t2)
        self.go("39:49.66", Create(a2), Create(d2), FadeIn(l2, shift=UP * 0.1), run=0.4)
        self.add(r2)
        self.play(Create(c2), t2.animate.set_value(5.8), run_time=1.3, rate_func=linear)
        r2.clear_updaters()
        self.play(FadeOut(r2), run_time=0.2)
        # 3. the sine limit
        a3 = mk((-12, 12, 4), (-0.4, 1.2, 1), xs[2])
        sinc = lambda x: np.sin(x) / x
        c3 = VGroup(curve(a3, sinc, [-11.8, -0.06, 0.04], width=4), curve(a3, sinc, [0.06, 11.8, 0.04], width=4))
        h3 = hole(a3, 0, 1, r=0.07)
        l3 = M(r"\frac{\sin x}{x}", size=48, color=YEL).move_to([xs[2], -1.4, 0])
        self.go("39:52.98", Create(a3), run=0.3)
        self.play(Create(c3), FadeIn(h3), FadeIn(l3, shift=UP * 0.1), run_time=0.8)
        # 4. continuity
        a4 = mk((0, 6, 1), (0, 1.5, 1), xs[3])
        c4 = curve(a4, lambda x: 0.45 + 0.3 * np.sin(1.1 * x) + 0.09 * x, [0.1, 5.8, 0.02], width=4)
        l4 = H("continuity", 42, YEL).move_to([xs[3], -1.35, 0])
        self.go("39:56.80", Create(a4), run=0.3)
        self.go("39:57.54", draw(c4, run=1.0), FadeIn(l4, shift=UP * 0.1), run=1.0)
        ring = SurroundingRectangle(VGroup(a1, l1), color=YEL, buff=0.2, stroke_width=3, corner_radius=0.12)
        self.go("39:58.98", Create(ring), run=0.5)


# ================================================================ infinite limits: 1/(x-3)

class K07_InfLimit(Shot):
    def body(self):
        self.title("What's Ahead", animate=False)
        self.title("Infinite Limits", "39:59.62")
        ax, three = g3()
        self.go("40:01.48", Create(ax), FadeIn(ax.labels), run=0.6)
        xt = ValueTracker(5.2)
        xd = always_redraw(lambda: fdot(ax.c2p(xt.get_value(), 0), ORG, r=0.1))
        self.go("40:02.52", FadeIn(xd, scale=0.5), FadeIn(three), run=0.3)
        self.play(xt.animate.set_value(3.12), run_time=0.9)
        xd.clear_updaters()
        rb, lb, ua, ui, da, di = g3_parts(ax)
        t1 = ValueTracker(5.6)
        m1 = rider(ax, f3, t1)
        self.add(m1)
        self.go("40:04.76", FadeOut(xd), Create(rb), t1.animate.set_value(3 + 1 / 6), run=1.2, rate_func=rate_functions.ease_in_sine)
        m1.clear_updaters()
        t2 = ValueTracker(0.4)
        m2 = rider(ax, f3, t2)
        self.add(m2)
        self.go("40:06.14", FadeOut(m1), Create(lb), t2.animate.set_value(3 - 1 / 6), run=0.95, rate_func=rate_functions.ease_in_sine)
        m2.clear_updaters()
        L = M(r"\lim_{x\to 3}\frac{1}{x-3}", size=60).move_to([-3.6, 1.45, 0])
        self.go("40:07.60", FadeOut(m2), run=0.2)
        self.go("40:07.98", Write(L), run=1.2)
        P = M(r"\frac{1}{3-3}", "=", r"\frac{1}{0}", size=56).move_to([-3.6, -0.2, 0])
        self.go("40:11.92", Write(P[0]), run=0.6)
        self.go("40:12.82", Write(P[1:]), run=0.5)
        self.go("40:14.48", P[2][0].animate.set_color(ORG), run=0.4)
        self.go("40:15.42", P[2][2].animate.set_color(RED), run=0.3)
        S = H("blow-up signal", 44, YEL).move_to([-3.6, -1.55, 0])
        self.go("40:17.16", FadeIn(S, shift=UP * 0.1), run=0.5)
        up = arr([-4.6, -2.0, 0], [-4.6, -0.95, 0], YEL, w=5, tip=0.2)
        dn = arr([-2.6, -1.0, 0], [-2.6, -2.05, 0], YEL, w=5, tip=0.2)
        orr = H("or", 42, DIM).move_to([-3.6, -1.5, 0])
        q = H("?", 60, YEL).move_to([-1.7, -1.5, 0])
        self.go("40:21.40", FadeOut(S), run=0.3)
        self.go("40:22.80", Create(up), FadeIn(orr), run=0.35)
        self.go("40:23.20", Create(dn), FadeIn(q), run=0.4)
        la = arr(ax.c2p(1.1, 1.3), ax.c2p(2.75, 1.3), BLUE, w=5, tip=0.2)
        ra = arr(ax.c2p(4.9, -1.3), ax.c2p(3.25, -1.3), ORG, w=5, tip=0.2)
        self.go("40:25.24", Create(la), Create(ra), run=0.6)
        sl = M(r"3^-", size=40, color=BLUE).next_to(la, UP, buff=0.12)
        sr = M(r"3^+", size=40, color=ORG).next_to(ra, DOWN, buff=0.12)
        self.go("40:26.10", FadeIn(sl), FadeIn(sr), run=0.4)
        self.go("40:27.80", FadeOut(VGroup(rb, lb, P, up, dn, orr, q, la, ra, sl, sr)),
                ReplacementTransform(L, g3_label(ax)), run=0.55)


class K07_Right(Shot):
    def body(self):
        self.title("Infinite Limits", animate=False)
        ax, three = g3()
        lab = g3_label(ax)
        self.add(ax, ax.labels, three, lab)
        rb, lb, ua, ui, da, di = g3_parts(ax)
        rR, rL = g3_results()

        def side(top_y, hdr_s, color, xs, d, v, signs):
            hdr = H(hdr_s, 44, color).move_to([-3.6, top_y, 0])
            rows = steps(("x", "=", xs), ("x-3", "=", d), (r"\frac{1}{x-3}", "=", v), size=50, gap=0.3,
                         start=[-4.4, top_y - 0.75, 0])
            for r in rows:
                r[2].set_color(color)
            right = max(r.get_right()[0] for r in rows) + 0.45
            tg = [tag(w, s, color).move_to([0, rows[k].get_y(), 0]) for k, (w, s) in zip((1, 2), signs)]
            for t in tg:
                t.align_to([right, 0, 0], LEFT)
            return hdr, rows, tg

        # from the right
        hdr, rows, tg = side(1.85, "from the right", ORG, "3.01", "0.01", "100", (("tiny", "+"), ("huge", "+")))
        self.go("40:28.62", FadeIn(hdr, shift=DOWN * 0.1), run=0.4)
        self.go("40:32.06", Write(rows[0]), run=0.6)
        self.go("40:33.90", Write(rows[1]), run=0.6)
        self.go("40:35.40", FadeIn(tg[0], shift=LEFT * 0.1), run=0.4)
        self.go("40:36.88", Write(rows[2]), run=0.7)
        self.go("40:39.60", FadeIn(tg[1], shift=LEFT * 0.1), run=0.4)
        t1 = ValueTracker(4.7)
        m1 = rider(ax, f3, t1)
        self.add(m1)
        self.go("40:41.20", Create(rb), t1.animate.set_value(3 + 1 / 6), run=1.6, rate_func=rate_functions.ease_in_sine)
        m1.clear_updaters()
        self.go("40:43.30", FadeOut(m1), FadeOut(rows), FadeOut(VGroup(*tg)), ReplacementTransform(hdr, rR),
                Create(ua), Write(ui), run=0.7)
        # from the left
        hdr, rows, tg = side(0.4, "from the left", BLUE, "2.99", "-0.01", "-100", (("tiny", "-"), ("huge", "-")))
        self.go("40:45.10", FadeIn(hdr, shift=DOWN * 0.1), run=0.4)
        self.go("40:48.70", Write(rows[0]), run=0.6)
        self.go("40:50.64", Write(rows[1]), run=0.6)
        self.go("40:52.10", FadeIn(tg[0], shift=LEFT * 0.1), run=0.4)
        self.go("40:53.72", Write(rows[2]), run=0.7)
        self.go("40:56.70", FadeIn(tg[1], shift=LEFT * 0.1), run=0.4)
        t2 = ValueTracker(1.3)
        m2 = rider(ax, f3, t2)
        self.add(m2)
        self.go("40:58.60", Create(lb), t2.animate.set_value(3 - 1 / 6), run=1.4, rate_func=rate_functions.ease_in_sine)
        m2.clear_updaters()
        self.go("41:00.20", FadeOut(m2), FadeOut(rows), FadeOut(VGroup(*tg)), ReplacementTransform(hdr, rL),
                Create(da), Write(di), run=0.7)
        self.go("41:02.34", Circumscribe(VGroup(ua, ui), color=ORG, buff=0.1), Circumscribe(rR[2], color=ORG, buff=0.08), run=0.8)
        self.go("41:03.94", Circumscribe(VGroup(da, di), color=BLUE, buff=0.1), Circumscribe(rL[2], color=BLUE, buff=0.08), run=0.8)


class K07_Asymptote(Shot):
    def body(self):
        self.title("Infinite Limits", animate=False)
        ax, three = g3()
        rb, lb, ua, ui, da, di = g3_parts(ax)
        rR, rL = g3_results()
        self.add(ax, ax.labels, three, g3_label(ax), rb, lb, ua, ui, da, di, rR, rL)
        D = M(r"\lim_{x\to 3}\frac{1}{x-3}", "=", r"\text{DNE}", size=56).move_to([-3.6, -1.45, 0])
        D[2].set_color(RED)
        self.go("41:05.84", Write(D), run=0.9)
        self.go("41:07.00", Create(box(D[2], RED, buff=0.12)), run=0.4)
        va = vdash(ax, 3, -6, 6)
        self.go("41:09.68", Create(va), run=0.7)
        vl = H("vertical asymptote", 40, YEL).move_to([ax.c2p(3, 0)[0] + 0.4, 2.15, 0])
        self.go("41:10.40", FadeIn(vl, shift=DOWN * 0.1), run=0.4)
        x3 = M("x=3", size=44, color=YEL).next_to(ax.c2p(3, -6), DOWN, buff=0.15)
        self.go("41:11.10", Write(x3), run=0.5)
        t1, t2 = ValueTracker(5.6), ValueTracker(0.4)
        m1, m2 = rider(ax, f3, t1), rider(ax, f3, t2)
        self.go("41:12.90", FadeIn(m1, scale=0.5), FadeIn(m2, scale=0.5), run=0.25)
        self.play(t1.animate.set_value(3 + 1 / 6), t2.animate.set_value(3 - 1 / 6), run_time=2.3, rate_func=rate_functions.ease_in_sine)
        m1.clear_updaters(); m2.clear_updaters()
        self.go("41:15.90", FadeOut(m1), FadeOut(m2), run=0.3)


# ================================================================ 1/x^2: both sides up

class K07_OverXSq(Shot):
    def body(self):
        self.title("Infinite Limits", animate=False)
        self.title("Both Sides Up", "41:16.88")
        ax = axes((-3, 3, 1), (-1, 6, 1), 5.6, 5.0, (3.5, -0.65, 0), nums=False)
        g = lambda x: 1 / x ** 2
        rb, lb = branch(ax, g, 0, 2.9, 5.8, ORG), branch(ax, g, -2.9, 0, 5.8, BLUE)
        F2 = M(r"\lim_{x\to 0}\frac{1}{x^2}", "=", r"\infty", size=60).move_to([-3.6, 0.85, 0])
        F2[2].set_color(GRN)
        F1 = M(r"\lim_{x\to 0}\frac{1}{x^2}", size=60).move_to([-3.6, 1.65, 0])
        self.go("41:17.42", Create(ax), FadeIn(ax.labels), Write(F1), run=0.9)
        r1 = M(r"(0.01)^2", "=", "0.0001", size=50).move_to([-4.3, 0.2, 0])
        r1[0].set_color(ORG)
        r2 = M(r"(-0.01)^2", "=", "0.0001", size=50)
        r2.shift(r1[1].get_center() - r2[1].get_center() + DOWN * 1.05)
        r2[0].set_color(BLUE)
        tx = max(r1.get_right()[0], r2.get_right()[0]) + 0.4
        g1 = tag("tiny", "+", ORG).move_to([0, r1.get_y(), 0]).align_to([tx, 0, 0], LEFT)
        g2 = tag("still", "+", BLUE).move_to([0, r2.get_y(), 0]).align_to([tx, 0, 0], LEFT)
        self.go("41:21.86", Write(r1), run=0.7)
        self.go("41:22.84", FadeIn(g1, shift=LEFT * 0.1), run=0.4)
        self.go("41:25.60", Write(r2[0]), run=0.5)
        self.go("41:26.98", Write(r2[1:]), run=0.6)
        self.go("41:27.78", FadeIn(g2, shift=LEFT * 0.1), run=0.4)
        self.go("41:30.86", Circumscribe(g1, color=ORG, buff=0.08), Circumscribe(g2, color=BLUE, buff=0.08), run=0.8)
        t1, t2 = ValueTracker(2.6), ValueTracker(-2.6)
        m1, m2 = rider(ax, g, t1), rider(ax, g, t2)
        self.add(m1, m2)
        self.go("41:33.68", Create(rb), Create(lb), t1.animate.set_value(1 / np.sqrt(5.8)), t2.animate.set_value(-1 / np.sqrt(5.8)),
                run=1.4, rate_func=rate_functions.ease_in_sine)
        m1.clear_updaters(); m2.clear_updaters()
        ua = arr(ax.c2p(0.95, 3.4), ax.c2p(0.95, 5.6), ORG, w=4, tip=0.2)
        da = arr(ax.c2p(-0.95, 3.4), ax.c2p(-0.95, 5.6), BLUE, w=4, tip=0.2)
        ui = M(r"+\infty", size=44, color=ORG).next_to(ua, RIGHT, buff=0.12)
        di = M(r"+\infty", size=44, color=BLUE).next_to(da, LEFT, buff=0.12)
        self.go("41:35.15", FadeOut(m1), FadeOut(m2), Create(ua), Create(da), Write(ui), Write(di), run=0.6)
        self.go("41:36.50", FadeOut(VGroup(r1, r2, g1, g2)), F1.animate.move_to(F2[0]), run=0.6)
        self.remove(F1)
        self.add(F2[0])
        self.go("41:38.36", Write(F2[1:]), run=0.5)
        bx = answer_box(F2[2])
        self.go("41:39.00", Create(bx), run=0.4)
        n1 = H("not a real number", 40, DIM).next_to(F2, DOWN, buff=0.45)
        self.go("41:40.64", FadeIn(n1, shift=UP * 0.1), run=0.5)
        n2 = VGroup(H("some teachers:", 40, DIM), M(r"\text{DNE}", size=50, color=DIM), M(r"(\to\infty)", size=48, color=DIM))
        n2.arrange(RIGHT, buff=0.25).move_to(n1).set_x(-3.25)
        self.go("41:43.20", FadeOut(n1), FadeIn(n2[0]), run=0.4)
        self.go("41:44.42", Write(n2[1]), run=0.4)
        self.go("41:46.10", Write(n2[2]), run=0.5)
        self.go("41:48.14", Circumscribe(VGroup(F2[1:], bx), color=YEL, buff=0.12), run=0.8)
        hl = H("how it fails", 42, YEL).move_to([-0.9, 2.1, 0])
        ha = CurvedArrow(hl.get_left() + LEFT * 0.1, bx.get_top() + UP * 0.08, angle=0.7, color=YEL, stroke_width=3, tip_length=0.16)
        self.go("41:51.70", FadeIn(hl), Create(ha), run=0.6)


# ================================================================ (x+1)/(x-2)^2

class K07_Bigger(Shot):
    def body(self):
        self.title("Both Sides Up", animate=False)
        self.title("A Bigger One", "41:53.52")
        ax = axes((0, 4.5, 1), (0, 8, 2), 5.2, 4.8, (3.65, -0.7, 0), nums=False)
        two = M("2", size=36, color=ORG).next_to(ax.c2p(2, 0), DOWN, buff=0.12)
        g = lambda x: (x + 1) / (x - 2) ** 2
        F = M(r"\lim_{x\to 2}", r"\frac{x+1}{(x-2)^2}", "=", r"+\infty", size=58).move_to([-3.4, 1.55, 0])
        F[3].set_color(GRN)
        self.go("41:54.20", Create(ax), FadeIn(ax.labels), FadeIn(two), run=0.6)
        self.go("41:55.76", Write(F[0]), run=0.6)
        self.go("41:58.22", Write(F[1]), run=1.2)
        P = M(r"\frac{2+1}{(2-2)^2}", "=", r"\frac{3}{0}", size=54).move_to([-3.4, -0.25, 0])
        self.go("42:02.20", Write(P), run=0.8)
        self.go("42:04.24", P[2][0].animate.set_color(ORG), run=0.4)
        self.go("42:05.58", P[2][2].animate.set_color(RED), run=0.3)
        bl = H("blows up", 42, YEL).next_to(P, DOWN, buff=0.4)
        self.go("42:06.62", FadeIn(bl, shift=UP * 0.1), run=0.4)
        # signs: bottom first, then top
        top = M("x+1", r"\approx", "3", size=50)
        bot = M(r"(x-2)^2", r"\approx", r"(\pm 0.01)^2", size=50)
        top.move_to([-4.0, 0.25, 0])
        bot.shift(top[1].get_center() - bot[1].get_center() + DOWN * 1.15)
        tx = max(top.get_right()[0], bot.get_right()[0]) + 0.35
        tt = tag("also", "+", ORG).move_to([0, top.get_y(), 0]).align_to([tx, 0, 0], LEFT)
        tb = tag("always", "+", ORG).move_to([0, bot.get_y(), 0]).align_to([tx, 0, 0], LEFT)
        self.go("42:07.80", FadeOut(P), FadeOut(bl), run=0.3)
        self.go("42:08.64", Write(bot[0]), run=0.5)
        self.go("42:10.16", FadeIn(tb, shift=LEFT * 0.1), run=0.4)
        self.go("42:11.38", Write(bot[1:]), run=0.6)
        self.go("42:13.24", Write(top), run=0.6)
        self.go("42:14.72", FadeIn(tt, shift=LEFT * 0.1), run=0.4)
        C = M(r"\frac{+}{\text{tiny}\ +}", "=", r"\text{huge}\ +", size=50).move_to([-3.4, -2.45, 0])
        self.go("42:16.20", Write(C[0]), run=0.6)
        lb = branch(ax, g, 0.02, 2, 7.6, BLUE)
        rb = branch(ax, g, 2, 4.4, 7.6, ORG)
        t1, t2 = ValueTracker(0.1), ValueTracker(4.35)
        m1, m2 = rider(ax, g, t1), rider(ax, g, t2)
        self.add(m1, m2)
        self.go("42:16.90", Create(lb), Create(rb), t1.animate.set_value(lb.xr[1]), t2.animate.set_value(rb.xr[0]),
                run=1.3, rate_func=rate_functions.ease_in_sine)
        m1.clear_updaters(); m2.clear_updaters()
        self.go("42:18.26", FadeOut(m1), FadeOut(m2), Write(C[1:]), run=0.5)
        da = arr(ax.c2p(0.8, 5.0), ax.c2p(0.8, 7.6), BLUE, w=4, tip=0.2)
        ua = arr(ax.c2p(3.2, 5.0), ax.c2p(3.2, 7.6), ORG, w=4, tip=0.2)
        ui = M(r"+\infty", size=48, color=YEL).move_to(ax.c2p(2, 6.7))
        self.go("42:20.12", Write(F[2:]), Create(da), Create(ua), Write(ui), run=0.6)
        self.go("42:20.86", Create(answer_box(F[3])), run=0.4)


# ================================================================ the sign check

class K07_Advice(Shot):
    def body(self):
        self.title("A Bigger One", animate=False)
        self.title("Just Check the Signs", "42:22.24")
        mem = VGroup(H("memorize", 54, DIM), cross_mark(s=0.25)).arrange(RIGHT, buff=0.4).move_to([0, 1.2, 0])
        self.go("42:24.94", Write(mem[0]), run=0.5)
        self.go("42:25.60", Create(mem[1]), run=0.4)
        y = 0.4
        line = Arrow([-5.8, y, 0], [5.8, y, 0], buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        tk = Line([0, y + 0.13, 0], [0, y - 0.13, 0], color=YEL, stroke_width=4)
        a = M("a", size=48, color=YEL).next_to(tk, DOWN, buff=0.15)
        self.go("42:26.70", FadeOut(mem), Create(line), Create(tk), FadeIn(a), run=0.5)
        tl, tr = ValueTracker(-4.6), ValueTracker(4.6)
        dl = always_redraw(lambda: fdot([tl.get_value(), y, 0], BLUE))
        dr = always_redraw(lambda: fdot([tr.get_value(), y, 0], ORG))
        self.add(dl, dr)
        self.go("42:27.30", tl.animate.set_value(-0.3), tr.animate.set_value(0.3), run=2.0)
        dl.clear_updaters(); dr.clear_updaters()
        ll = M("a-0.01", size=42, color=BLUE).move_to([-1.6, y + 0.6, 0])
        lr = M("a+0.01", size=42, color=ORG).move_to([1.6, y + 0.6, 0])
        self.go("42:29.40", FadeIn(ll, shift=DOWN * 0.1), FadeIn(lr, shift=DOWN * 0.1), run=0.4)
        r1 = M(r"\frac{+}{+}", "=", "+", size=72).move_to([-2.0, -1.75, 0])
        r2 = M(r"\frac{+}{-}", "=", "-", size=72).move_to([2.0, -1.75, 0])
        r1[2].set_color(YEL); r2[2].set_color(YEL)
        self.go("42:32.14", Write(r1), run=0.7)
        self.go("42:34.82", Write(r2), run=0.7)
        self.go("42:36.78", Create(panel(VGroup(r1, r2), PURP, buff=0.4)), run=0.6)


# ================================================================ where vertical asymptotes come from

class K07_WhereVA(Shot):
    def body(self):
        self.title("Just Check the Signs", animate=False)
        self.title("Finding Vertical Asymptotes", "42:38.78")
        G = M(r"\frac{\text{top}}{\text{bottom}}", size=80).move_to([-1.2, 0.2, 0])
        self.go("42:43.10", Write(G), run=0.6)
        z0 = M("=0", size=60, color=RED).next_to(G, RIGHT, buff=0.3).align_to(G, DOWN)
        n0 = M(r"\neq 0", size=60, color=GRN).next_to(G, RIGHT, buff=0.3).align_to(G, UP)
        self.go("42:44.94", Write(z0), run=0.4)
        self.go("42:46.48", Write(n0), run=0.4)
        F1 = M("f(x)", "=", r"\frac{x+1}{x^2-x-6}", size=56).move_to([-3.6, 1.45, 0])
        F2 = M("f(x)", "=", r"\frac{x+1}{(x-3)(x+2)}", size=56).move_to([-3.6, 1.45, 0])
        self.go("42:47.70", FadeOut(VGroup(G, z0, n0)), run=0.3)
        self.go("42:48.12", Write(F1), run=1.4)
        self.go("42:54.30", TransformMatchingTex(F1, F2), run=0.9)
        z = [M("x=3", size=50, color=ORG).move_to([-4.7, -0.3, 0]), M("x=-2", size=50, color=ORG).move_to([-2.3, -0.3, 0])]
        self.go("42:58.66", Write(z[0]), run=0.5)
        self.go("43:00.18", Write(z[1]), run=0.5)
        tp = [M(r"\text{top}=4", size=42, color=GRN).next_to(z[0], DOWN, buff=0.35),
              M(r"\text{top}=-1", size=42, color=GRN).next_to(z[1], DOWN, buff=0.35)]
        self.go("43:02.34", FadeIn(tp[0], shift=UP * 0.1), FadeIn(tp[1], shift=UP * 0.1), run=0.5)
        self.go("43:03.10", Create(tick_mark(s=0.4).next_to(VGroup(*tp), DOWN, buff=0.35)), run=0.4)
        ax = axes((-5, 6, 1), (-3, 3, 1), 6.2, 4.6, (3.55, -0.6, 0), nums=False)
        f = lambda x: (x + 1) / ((x - 3) * (x + 2))
        c = VGroup(branch(ax, f, -4.9, -2, 2.9), branch(ax, f, -2, 3, 2.9), branch(ax, f, 3, 5.8, 2.9))
        l3 = M("x=3", size=40, color=ORG).next_to(ax.c2p(3, 3), UP, buff=0.12)
        l2 = M("x=-2", size=40, color=ORG).next_to(ax.c2p(-2, 3), UP, buff=0.12)
        self.go("43:04.40", Create(ax), FadeIn(ax.labels), run=0.5)
        self.go("43:05.20", Create(c), run=1.2)
        self.go("43:07.42", Create(vdash(ax, 3, -3, 3)), FadeIn(l3), Circumscribe(z[0], color=ORG, buff=0.1), run=0.6)
        self.go("43:08.86", Create(vdash(ax, -2, -3, 3)), FadeIn(l2), Circumscribe(z[1], color=ORG, buff=0.1), run=0.6)


# ================================================================ hole, not asymptote

class K07_HoleNotVA(Shot):
    def body(self):
        self.title("Finding Vertical Asymptotes", animate=False)
        self.title("Hole or Asymptote?", "43:10.34")
        zz = M(r"\frac{0}{0}", size=100, color=YEL).move_to([-3.2, 0.1, 0])
        self.go("43:12.88", Write(zz), run=0.5)
        na = VGroup(H("asymptote", 46, DIM), cross_mark(s=0.18)).arrange(RIGHT, buff=0.3).move_to([1.4, 0.75, 0])
        hl = VGroup(Circle(radius=0.12, stroke_color=BLUE, stroke_width=4, fill_color=BOARDC, fill_opacity=1),
                    H("maybe a hole", 46, BLUE)).arrange(RIGHT, buff=0.3).move_to([1.4, -0.55, 0])
        na.align_to(hl, LEFT)
        self.go("43:15.50", FadeIn(na[0]), Create(na[1]), run=0.5)
        self.go("43:17.28", FadeIn(hl, shift=UP * 0.1), run=0.4)
        self.go("43:18.10", FadeOut(VGroup(zz, na, hl)), run=0.3)
        F = frac(("x^2-4",), ("x-2",), size=60).move_to([-4.2, 1.15, 0])
        self.go("43:18.56", Write(F), run=1.2)
        P = M(r"\frac{2^2-4}{2-2}", "=", r"\frac{0}{0}", size=50).move_to([-4.0, -0.75, 0])
        P[2].set_color(YEL)
        self.go("43:22.00", Write(P), run=0.8)
        F2 = frac(("(x-2)", "(x+2)"), ("x-2",), size=60).move_to([-4.2, 1.15, 0])
        self.go("43:24.40", FadeOut(P), run=0.3)
        self.go("43:25.48", ReplacementTransform(F, F2), run=0.9)
        s1, s2 = strike(F2[0][0]), strike(F2[2])
        self.go("43:28.02", Create(s1), Create(s2), run=0.5)
        R = M("=", "x+2", size=60).next_to(F2, RIGHT, buff=0.3)
        self.go("43:29.18", Write(R), run=0.5)
        ax = axes((-1, 4, 1), (-1, 6, 1), 5.0, 4.6, (3.85, -0.7, 0), nums=False)
        ln = VGroup(curve(ax, lambda x: x + 2, [-0.9, 2, 0.05]), curve(ax, lambda x: x + 2, [2, 3.8, 0.05]))
        self.go("43:30.60", Create(ax), FadeIn(ax.labels), run=0.4)
        self.go("43:31.10", Create(ln), run=1.0)
        hh = hole(ax, 2, 4, r=0.11)
        self.go("43:33.10", FadeIn(hh, scale=0.5), run=0.3)
        gd = VGroup(DashedLine(ax.c2p(2, 4), ax.c2p(2, 0), color=ORG, stroke_width=3, dash_length=0.1),
                    DashedLine(ax.c2p(2, 4), ax.c2p(0, 4), color=ORG, stroke_width=3, dash_length=0.1))
        pl = M("(2,\\,4)", size=44, color=ORG).next_to(ax.c2p(2, 4), UL, buff=0.15)
        self.go("43:34.04", Create(gd), Write(pl), run=0.5)
        # the rule
        self.go("43:35.70", FadeOut(VGroup(F2, s1, s2, R)), run=0.35)
        rows = VGroup(
            VGroup(M("1", size=52, color=ORG), H("simplify first", 44)),
            VGroup(M("2", size=52, color=ORG), H("cancel what you can", 44)),
            VGroup(M("3", size=52, color=ORG), H("bottom", 44), M("=0", size=52, color=RED), M(r"\Rightarrow", size=52, color=DIM), H("asymptote", 44, YEL)))
        for r in rows:
            r.arrange(RIGHT, buff=0.3)
        rows.arrange(DOWN, buff=0.6, aligned_edge=LEFT).move_to([-2.8, 0.1, 0])
        self.go("43:36.76", FadeIn(rows[0], shift=RIGHT * 0.1), run=0.5)
        self.go("43:38.66", FadeIn(rows[1], shift=RIGHT * 0.1), run=0.5)
        self.go("43:40.68", FadeIn(rows[2][:3], shift=RIGHT * 0.1), run=0.5)
        self.go("43:43.12", FadeIn(rows[2][3:], shift=RIGHT * 0.1), run=0.5)


# ================================================================ limits at infinity

class K07_AtInfinity(Shot):
    def body(self):
        self.title("Hole or Asymptote?", animate=False)
        self.title("Flip the Question", "43:45.74")
        y = -1.0
        line = Arrow([-6.2, y, 0], [6.5, y, 0], buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        tk = Line([-3.6, y + 0.12, 0], [-3.6, y - 0.12, 0], color=DIM, stroke_width=3)
        n3 = M("3", size=40, color=DIM).next_to(tk, DOWN, buff=0.15)
        xt = ValueTracker(-1.0)
        xd = always_redraw(lambda: fdot([xt.get_value(), y, 0], ORG))
        a3 = M(r"x\to 3", size=64, color=DIM).move_to([0, 1.0, 0])
        self.go("43:46.30", Create(line), Create(tk), FadeIn(n3), FadeIn(xd), run=0.5)
        self.go("43:48.38", Write(a3), xt.animate.set_value(-3.5), run=1.0)
        run_arrow = arr([-3.5, y + 0.6, 0], [6.0, y + 0.6, 0], YEL, w=5, tip=0.24)
        self.go("43:50.70", xt.animate.set_value(6.0), Create(run_arrow), run=2.3, rate_func=rate_functions.ease_in_quad)
        xd.clear_updaters()
        self.title("Limits at Infinity", "43:54.46")
        ai = M(r"x\to\infty", size=72, color=YEL).move_to(a3)
        self.go("43:55.02", ReplacementTransform(a3, ai), run=0.7)
        yq = M(r"y\to\ ?", size=64, color=BLUE).move_to([0, -2.4, 0])
        self.go("44:00.40", Write(yq), run=0.6)
        self.wipe("44:02.40", run=0.35)
        fr, hd, cell = table(-4.0, 1.5, ("x", r"\frac{1}{x}"), step=0.85, half=1.05)
        ax = axes((0, 12, 1), (0, 2.5, 1), 6.2, 4.2, (3.25, -0.55, 0), nums=False)
        f = lambda x: 1 / x
        cv = curve(ax, f, [0.4, 11.8, 0.02])
        self.go("44:02.88", Create(fr), FadeIn(hd), Create(ax), FadeIn(ax.labels), run=0.6)
        t = ValueTracker(0.45)
        m = rider(ax, f, t)
        self.go("44:03.80", Create(cv), run=0.8)
        self.play(FadeIn(m, scale=0.5), run_time=0.2)
        stops = [("10", "0.1", "44:05.86", "44:06.52", 2.0), ("1000", "0.001", "44:08.36", "44:09.30", 5.0),
                 (r"1{,}000{,}000", "0.000001", "44:11.92", "44:12.76", 9.0)]
        for i, (xs, ys, tx, ty, xv) in enumerate(stops):
            self.go(tx, Write(cell(i, 0, xs, ORG)), t.animate.set_value(xv), run=0.6)
            self.go(ty, Write(cell(i, 1, ys, BLUE)), run=0.5)
        z = arr(ax.c2p(9.6, 0.42), ax.c2p(11.9, 0.15), YEL, w=4, tip=0.18)
        zl = M(r"y\to 0", size=44, color=YEL).next_to(ax.c2p(10.6, 0.5), UP, buff=0.15)
        self.go("44:14.10", t.animate.set_value(11.8), Create(z), Write(zl), run=1.0)
        m.clear_updaters()
        L = M(r"\lim_{x\to\infty}\frac{1}{x}", "=", "0", size=58).move_to([-4.0, -2.65, 0])
        L[2].set_color(GRN)
        self.go("44:16.78", Write(L), run=0.9)
        bx = answer_box(L[2])
        self.go("44:19.90", Create(bx), run=0.4)
        self.go("44:22.20", Circumscribe(L, color=YEL, buff=0.12), run=0.7)


class K07_HugeZero(Shot):
    def body(self):
        self.title("Limits at Infinity", animate=False)
        self.title("Divide by Something Huge", "44:23.40")
        A = M(r"\frac{1}{\text{huge}}", r"\approx", "0", size=84).move_to([0, 1.1, 0])
        A[2].set_color(YEL)
        self.go("44:24.10", Write(A[0]), run=0.7)
        self.go("44:26.60", Write(A[1:]), run=0.5)
        Bs = [M(r"\frac{c}{x}", r"\to", "0", size=66).move_to([-4.3, -1.0, 0]),
              M(r"\frac{c}{x^2}", r"\to", "0", size=66).move_to([0, -1.0, 0]),
              M(r"\frac{c}{x^n}", r"\to", "0", size=66).move_to([4.3, -1.0, 0])]
        for b in Bs:
            b[2].set_color(YEL)
        self.go("44:28.98", Write(Bs[0]), run=0.6)
        self.go("44:31.44", Write(Bs[1]), run=0.6)
        self.go("44:33.02", Write(Bs[2]), run=0.6)
        np0 = M(r"n>0", size=42, color=DIM).next_to(Bs[2], DOWN, buff=0.35)
        self.go("44:33.70", FadeIn(np0, shift=UP * 0.1), run=0.4)
        self.go("44:35.26", *[Circumscribe(b[2], Circle, color=YEL, buff=0.08) for b in Bs], run=0.8)
        # settling to a height: the horizontal asymptote
        self.wipe("44:36.80", run=0.3)
        ax = axes((0, 12, 1), (0, 3, 1), 11.0, 3.8, (0, -0.9, 0), nums=False)
        g = lambda x: 2 - 1.8 / (1 + 0.15 * x ** 2)
        cv = curve(ax, g, [0, 11.8, 0.02])
        self.go("44:37.30", Create(ax), FadeIn(ax.labels), run=0.5)
        t = ValueTracker(0)
        m = rider(ax, g, t)
        self.add(m)
        self.go("44:39.42", Create(cv), t.animate.set_value(11.8), run=3.0, rate_func=linear)
        m.clear_updaters()
        hd = hdash(ax, 2, 0, 11.9)
        self.go("44:43.54", Create(hd), run=0.6)
        Ll = M("L", size=48, color=YEL).next_to(ax.c2p(0, 2), LEFT, buff=0.15)
        self.go("44:44.30", Write(Ll), run=0.4)
        hl = H("horizontal asymptote", 44, YEL).next_to(ax.c2p(8.8, 2), UP, buff=0.3)
        self.go("44:46.24", FadeIn(hl, shift=DOWN * 0.1), run=0.5)


# ================================================================ infinity over infinity

class K07_DivideTop(Shot):
    def body(self):
        self.title("Divide by Something Huge", animate=False)
        self.title("Infinity Over Infinity", "44:48.18")
        fr, lim, inf, ind, instr = dt_board()
        self.go("44:49.78", Write(fr[0]), run=1.0)
        self.go("44:51.54", Create(fr[1]), Write(fr[2]), run=1.0)
        self.go("44:54.10", Write(lim), run=0.6)
        self.go("44:58.40", Write(inf), run=0.7)
        self.go("45:01.58", FadeIn(ind, shift=UP * 0.1), run=0.5)
        self.go("45:03.40", Circumscribe(inf[1], color=ORG, buff=0.1), run=0.8)
        self.go("45:06.10", Write(instr[0]), run=0.8)
        self.go("45:07.38", Circumscribe(fr[0], color=YEL, buff=0.08), run=0.35)
        self.go("45:07.75", Circumscribe(fr[2], color=YEL, buff=0.08), run=0.35)
        self.go("45:11.34", fr[2][0][1:].animate.set_color(YEL), run=0.5)
        self.go("45:13.40", Write(instr[1]), run=0.5)


class K07_Divide2(Shot):
    def body(self):
        self.title("Infinity Over Infinity", animate=False)
        fr, lim, inf, ind, instr = dt_board()
        fr[2][0][1:].set_color(YEL)
        self.add(fr, lim, inf, ind, instr)
        self.go("45:14.55", FadeOut(VGroup(inf, ind)), instr.animate.scale(0.75).move_to([0, -2.85, 0]), run=0.35)
        frA = frac((r"\frac{3x^2}{x^2}", "+", r"\frac{5}{x^2}"), (r"\frac{2x^2}{x^2}", "-", r"\frac{x}{x^2}"), size=60).move_to([-0.6, 0.45, 0])
        self.go("45:14.95", ReplacementTransform(fr, frA), lim.animate.next_to(frA, LEFT, buff=0.3), run=0.9)
        nA, bA, dA = frA
        self.go("45:17.00", Transform(nA[0], M("3", size=60).move_to(nA[0])), run=0.4)
        self.go("45:19.46", Circumscribe(nA[2], color=YEL, buff=0.08), run=0.6)
        self.go("45:24.80", Transform(dA[0], M("2", size=60).move_to(dA[0])), run=0.4)
        self.go("45:27.40", Transform(dA[2], M(r"\frac{1}{x}", size=60).move_to(dA[2])), run=0.4)
        fr1 = frac(("3", "+", r"\frac{5}{x^2}"), ("2", "-", r"\frac{1}{x}"), size=64).move_to([-0.6, 0.45, 0])
        self.go("45:29.40", ReplacementTransform(frA, fr1), lim.animate.next_to(fr1, LEFT, buff=0.3), FadeOut(instr), run=0.8)
        n1, b1, d1 = fr1
        z1 = M(r"\to 0", size=44, color=YEL).next_to(n1[2], UP, buff=0.2)
        z2 = M(r"\to 0", size=44, color=YEL).next_to(d1[2], DOWN, buff=0.2)
        self.go("45:37.20", FadeIn(z1, shift=DOWN * 0.1), run=0.4)
        self.go("45:38.60", n1[1:].animate.set_opacity(0.3), run=0.5)
        self.go("45:39.80", FadeIn(z2, shift=UP * 0.1), run=0.4)
        self.go("45:40.74", d1[1:].animate.set_opacity(0.3), run=0.5)
        R = M("=", r"\frac{3}{2}", size=72).next_to(fr1, RIGHT, buff=0.45)
        R[1].set_color(GRN)
        self.go("45:42.44", Write(R), run=0.6)
        self.go("45:44.62", Create(answer_box(R[1])), run=0.4)
        # the graph settles on y = 3/2
        self.wipe("45:46.10", run=0.3)
        ax = axes((0, 20, 5), (0, 4, 1), 10.4, 3.9, (0.2, -0.8, 0), nums=False)
        f = lambda x: (3 * x ** 2 + 5) / (2 * x ** 2 - x)
        self.go("45:46.42", Create(ax), FadeIn(ax.labels), run=0.4)
        hd = hdash(ax, 1.5, 0, 19.9)
        hl = M(r"y=\frac{3}{2}", size=50, color=YEL).next_to(ax.c2p(17.5, 1.5), UP, buff=0.3)
        self.go("45:47.28", Create(hd), Write(hl), run=0.6)
        cv = curve(ax, f, [1.6, 19.6, 0.02])
        t = ValueTracker(1.6)
        m = rider(ax, f, t)
        self.add(m)
        self.go("45:47.95", Create(cv), t.animate.set_value(19.6), run=2.3, rate_func=linear)
        m.clear_updaters()


# ================================================================ why: the biggest term takes over

class K07_Dominate(Shot):
    def body(self):
        self.title("Infinity Over Infinity", animate=False)
        self.title("Why It Works", "45:50.84")
        na = H("no algebra, just size", 46, DIM).move_to([0, 0.4, 0])
        self.go("45:53.20", FadeIn(na, shift=UP * 0.1), run=0.5)
        B = M("x", "=", r"1{,}000{,}000{,}000", size=58).move_to([0, 1.75, 0])
        B[2].set_color(ORG)
        self.go("45:56.30", FadeOut(na), run=0.3)
        self.go("45:56.68", Write(B), run=0.8)
        fr = frac(("3x^2", "+", "5"), ("2x^2", "-", "x"), size=66).move_to([-3.0, -0.75, 0])
        num, bar, den = fr
        self.go("45:58.16", Write(num), run=0.8)
        b1 = Rectangle(width=5.6, height=0.32, stroke_color=ORG, stroke_width=3, fill_color=ORG, fill_opacity=0.55)
        b1.move_to([0.6, 0.15, 0], aligned_edge=LEFT)
        l1 = M("3x^2", r"\approx 3\times 10^{18}", size=46, color=ORG).next_to(b1, UP, buff=0.2).align_to(b1, LEFT)
        self.go("46:01.28", Write(l1[0]), GrowFromEdge(b1, LEFT), run=1.0)
        self.go("46:02.40", Write(l1[1]), run=0.8)
        b2 = Rectangle(width=0.04, height=0.32, stroke_color=CHALK, stroke_width=3, fill_color=CHALK, fill_opacity=0.8)
        b2.move_to([0.6, -0.75, 0], aligned_edge=LEFT)
        l2 = M("5", size=46).next_to(b2, RIGHT, buff=0.25)
        self.go("46:04.96", FadeIn(b2), Write(l2), run=0.5)
        nl = H("nothing", 42, DIM).next_to(l2, RIGHT, buff=0.35)
        self.go("46:06.96", FadeIn(nl), num[1:].animate.set_opacity(0.3), num[0].animate.set_color(ORG), run=0.5)
        self.go("46:08.26", FadeOut(VGroup(b1, l1, b2, l2, nl)), run=0.35)
        self.go("46:08.70", Create(bar), Write(den), run=0.7)
        self.go("46:11.02", den[1:].animate.set_opacity(0.3), den[0].animate.set_color(ORG), run=0.6)
        E = M(r"\approx", r"\frac{3x^2}{2x^2}", "=", r"\frac{3}{2}", size=66).next_to(fr, RIGHT, buff=0.5)
        E[1].set_color(ORG); E[3].set_color(GRN)
        self.go("46:15.86", Write(E[:2]), run=0.6)
        self.go("46:18.74", Write(E[2:]), run=0.4)
