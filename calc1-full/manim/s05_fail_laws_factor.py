"""Builder 05 (26:43.41 - 33:08.61): end of the two-friends cafe, three ways a limit fails (jump, blow up, wiggle),
quick check, limit laws, direct substitution, the 0/0 form and three tricks, factoring (x->1, why we may cancel, x->3, x->-2).
Adapted from calc1-ep02 s03 / s04 / s05 with the new voice timings and more motion."""
from common import *

BOARDC = config.background_color


# ---------------------------------------------------------------- small local helpers

def arr(a, b, color, w=6, tip=0.24):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, color=color, stroke_width=w, tip_length=tip,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


def hollow(p, color=BLUE, r=0.11):
    return Circle(radius=r, stroke_color=color, stroke_width=5, fill_color=BOARDC, fill_opacity=1).move_to(p).set_z_index(5)


def fdot(p, color=ORG, r=0.11):
    return Dot(p, radius=r, color=color).set_z_index(6)


def mover(ax, f, t, color=YEL):
    """A dot riding the graph of f at x = t (ValueTracker)."""
    return always_redraw(lambda: fdot(ax.c2p(t.get_value(), f(t.get_value())), color, r=0.1))


def limrow(sub, rest, color=CHALK, size=56):
    """lim_{sub} f(x) = rest, the answer coloured."""
    m = M(r"\lim_{" + sub + "}", "f(x)", "=", rest, size=size)
    m[3].set_color(color)
    return m


def dne(size=60):
    return M(r"\text{DNE}", size=size, color=RED)


# ---------------------------------------------------------------- stick figures and cafes (same geometry as ep02)

GROUND = -2.0


def walker(xt, color):
    def mk():
        x = xt.get_value()
        s = abs(np.sin(x * 2.0))
        ph = 0.14 + 0.3 * s
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


# ================================================================ the cafe, ending

class K05_Cafe(Shot):
    def body(self):
        self.title("Two Friends", animate=False)
        ground = Line([-6.7, GROUND, 0], [6.7, GROUND, 0], color=DIM, stroke_width=3)
        a, b = ValueTracker(-1.8), ValueTracker(1.8)
        wa, wb = walker(a, BLUE), walker(b, ORG)
        c = cafe(0)
        tk = tick_mark(s=0.55)
        meet = pill("same cafe: they meet", GRN, 42)
        lm = H("= a limit", 52, GRN)
        meet.move_to([0, 1.3, 0]); tk.next_to(meet, LEFT, buff=0.35); lm.next_to(meet, RIGHT, buff=0.35)
        self.add(ground, c, wa, wb, meet)
        self.go("26:43.56", Create(tk), Write(lm), run=0.6)
        # two different cafes
        self.go("26:44.70", FadeOut(c), FadeOut(meet), FadeOut(tk), FadeOut(lm), FadeOut(wa), FadeOut(wb), run=0.35)
        a.set_value(-6.2); b.set_value(6.2)
        wa, wb = walker(a, BLUE), walker(b, ORG)
        cl, cr = cafe(-2.6), cafe(2.6)
        self.play(FadeIn(wa), FadeIn(wb), run_time=0.3)
        self.go("26:45.50", Create(cl[:3]), Write(cl[3]), run=0.6)
        self.go("26:46.08", a.animate.set_value(-4.35), run=1.3, rate_func=linear)
        self.go("26:47.34", Create(cr[:3]), Write(cr[3]), run=0.6)
        self.go("26:48.00", b.animate.set_value(4.35), run=1.0, rate_func=linear)
        gap = DashedLine([-1.2, -1.2, 0], [1.2, -1.2, 0], color=DIM, stroke_width=3, dash_length=0.12)
        x = cross_mark(s=0.3).move_to([0, -1.2, 0])
        self.go("26:49.08", Create(gap), Create(x), run=0.5)
        nl = pill("different cafes: no limit", RED, 42).move_to([0, 1.25, 0])
        self.go("26:50.60", FadeIn(nl, shift=DOWN * 0.1), run=0.5)


# ================================================================ three ways to fail

class K05_Jump(Shot):
    def body(self):
        self.title("Two Friends", animate=False)
        self.title("Three Ways to Fail", "26:51.56")
        t = H("3 ways a limit can fail", 60, YEL).move_to([0, 0.9, 0])
        self.go("26:52.36", Write(t), run=0.9)
        nums = VGroup(*[VGroup(Circle(radius=0.45, color=ORG, stroke_width=4), M(str(k), size=60, color=ORG)) for k in (1, 2, 3)])
        nums.arrange(RIGHT, buff=1.4).move_to([0, -1.0, 0])
        self.go("26:53.50", LaggedStart(*[Create(n[0]) for n in nums], lag_ratio=0.3), *[Write(n[1]) for n in nums], run=0.9)
        self.wipe("26:55.70", run=0.35)
        self.title("1. The Jump", "26:56.10")
        ax = axes((0, 4, 1), (0, 5, 1), 6.0, 4.4, (-2.4, -0.7, 0), nums=False)
        al = M("a", size=40, color=DIM).next_to(ax.c2p(2, 0), DOWN, buff=0.15)
        f1 = lambda x: 0.5 * x + 1.0
        f2 = lambda x: 4.2 - 0.25 * (x - 2)
        c1 = curve(ax, f1, [0.15, 2], width=6)
        c2 = curve(ax, f2, [2, 3.8], color=ORG, width=6)
        h, d = hollow(ax.c2p(2, 2), BLUE), fdot(ax.c2p(2, 4.2), ORG)
        self.go("26:56.70", Create(ax), FadeIn(ax.labels), FadeIn(al), run=0.5)
        self.go("26:57.32", Create(c1), run=0.5)
        self.play(FadeIn(h, scale=0.5), FadeIn(d, scale=0.5), Create(c2), run_time=0.5)
        # a point from each side runs toward a
        tl, tr = ValueTracker(0.3), ValueTracker(3.7)
        ml, mr = mover(ax, f1, tl, BLUE), mover(ax, f2, tr, ORG)
        self.go("26:59.40", FadeIn(ml, scale=0.5), run=0.2)
        self.play(tl.animate.set_value(1.9), run_time=0.8)
        self.go("27:00.40", FadeIn(mr, scale=0.5), run=0.2)
        self.play(tr.animate.set_value(2.1), run_time=0.7)
        ml.clear_updaters(); mr.clear_updaters()
        g1 = DashedLine(ax.c2p(2, 2), ax.c2p(0, 2), color=BLUE, stroke_width=3, dash_length=0.1)
        g2 = DashedLine(ax.c2p(2, 4.2), ax.c2p(0, 4.2), color=ORG, stroke_width=3, dash_length=0.1)
        jmp = arr(ax.c2p(2.3, 2.2), ax.c2p(2.3, 3.95), YEL, w=5, tip=0.2)
        self.go("27:01.30", FadeOut(ml), FadeOut(mr), Create(g1), Create(g2), Create(jmp), run=0.5)
        L = M(r"\lim_{x\to a} f(x)", "=", r"\text{DNE}", size=60).move_to([3.7, -0.4, 0])
        L[2].set_color(RED)
        self.play(Write(L), run_time=0.45)


def table(cx, top, color, head_lab, step=0.75):
    colx = (cx - 0.85, cx + 0.85)
    frame = VGroup(Line([cx, top + 0.33, 0], [cx, top - 0.38 - 3 * step, 0], color=CHALK, stroke_width=3),
                   Line([cx - 1.6, top - 0.36, 0], [cx + 1.6, top - 0.36, 0], color=CHALK, stroke_width=3))
    head = VGroup(M("x", size=48).move_to([colx[0], top, 0]), M("f(x)", size=48).move_to([colx[1], top, 0]))
    lab = H(head_lab, 36, color).move_to([cx, top + 0.72, 0])
    cell = lambda i, j, s: M(s, size=48, color=color).move_to([colx[j], top - (i + 1) * step - 0.03, 0])
    return frame, head, lab, cell


class K05_BlowUp(Shot):
    def body(self):
        self.title("1. The Jump", animate=False)
        self.title("2. The Blow Up", "27:02.58")
        ax = axes((-3, 3, 1), (-6, 6, 1), 5.0, 5.3, (3.6, -0.55, 0), nums=False)
        f = lambda x: 1 / x
        rb = curve(ax, f, [1 / 5.3, 2.9], color=ORG, width=6)
        lb = curve(ax, f, [-2.9, -1 / 5.3], width=6)
        ua = arr(ax.c2p(0.75, 3.4), ax.c2p(0.75, 5.6), ORG, w=4, tip=0.2)
        da = arr(ax.c2p(-0.75, -3.4), ax.c2p(-0.75, -5.6), BLUE, w=4, tip=0.2)
        ui = M(r"\infty", size=56, color=ORG).next_to(ua, RIGHT, buff=0.15)
        di = M(r"-\infty", size=56, color=BLUE).next_to(da, LEFT, buff=0.15)
        fm = VGroup(M(r"f(x)=\frac{1}{x}", size=60), M(r"x\to 0", size=56, color=YEL)).arrange(RIGHT, buff=0.7).move_to([-3.3, 1.75, 0])
        self.go("27:03.86", Create(ax), FadeIn(ax.labels), run=0.5)
        self.go("27:05.60", Write(fm[0]), run=0.9)
        self.go("27:06.94", Write(fm[1]), run=0.6)
        # from the right
        fr, hd, lab, cell = table(-1.55, -0.05, ORG, "from the right")
        self.go("27:08.66", FadeIn(lab, shift=DOWN * 0.1), Create(fr), FadeIn(hd), run=0.6)
        for i, (xs, ys, tx, ty) in enumerate([("0.1", "10", "27:10.02", "27:11.44"),
                                              ("0.01", "100", "27:12.70", "27:13.90"),
                                              ("0.001", "1000", "27:15.64", "27:17.54")]):
            self.go(tx, Write(cell(i, 0, xs)), run=0.45)
            self.go(ty, Write(cell(i, 1, ys)), run=0.45)
        # a point climbs the right branch as x shrinks
        t = ValueTracker(2.6)
        mv = mover(ax, f, t, YEL)
        self.go("27:19.00", FadeIn(mv, scale=0.5), run=0.2)
        self.play(Create(rb), t.animate.set_value(1 / 5.3), run_time=1.3, rate_func=rate_functions.ease_in_sine)
        mv.clear_updaters()
        self.go("27:20.55", FadeOut(mv), Create(ua), Write(ui), run=0.6)
        # from the left
        fl, hdl, labl, celll = table(-5.1, -0.05, BLUE, "from the left")
        self.go("27:21.48", FadeIn(labl, shift=DOWN * 0.1), Create(fl), FadeIn(hdl), run=0.6)
        self.go("27:22.80", Write(celll(0, 0, "-0.1")), run=0.45)
        self.go("27:24.34", Write(celll(0, 1, "-10")), run=0.45)
        self.go("27:25.94", Write(celll(1, 0, "-0.01")), Write(celll(1, 1, "-100")), run=0.5)
        self.go("27:27.16", Write(celll(2, 0, "-0.001")), Write(celll(2, 1, "-1000")), run=0.5)
        self.go("27:27.90", Create(lb), Create(da), Write(di), run=0.7)
        # one side up forever, the other down forever
        t1 = ValueTracker(1.6)
        m1 = mover(ax, f, t1, YEL)
        self.go("27:29.50", FadeIn(m1, scale=0.5), run=0.2)
        self.play(t1.animate.set_value(1 / 5.3), run_time=1.0, rate_func=rate_functions.ease_in_sine)
        m1.clear_updaters()
        t2 = ValueTracker(-1.6)
        m2 = mover(ax, f, t2, YEL)
        self.go("27:31.60", FadeOut(m1), FadeIn(m2, scale=0.5), run=0.2)
        self.play(t2.animate.set_value(-1 / 5.3), run_time=1.0, rate_func=rate_functions.ease_in_sine)
        m2.clear_updaters()
        tabs = VGroup(*[m for m in self.board() if isinstance(m, VMobject) and m not in (ax, ax.labels, fm, rb, lb, ua, da, ui, di, m2)])
        q = VGroup(H("no single number", 46, RED), cross_mark(s=0.2)).arrange(RIGHT, buff=0.3).move_to([-3.3, 0.3, 0])
        self.go("27:33.48", FadeOut(m2), FadeOut(tabs), FadeIn(q[0], shift=UP * 0.1), Create(q[1]), run=0.5)
        L = M(r"\lim_{x\to 0}\frac{1}{x}", "=", r"\text{DNE}", size=60).move_to([-3.3, -1.3, 0])
        L[2].set_color(RED)
        self.go("27:35.36", Write(L), run=0.8)
        self.wipe("27:36.40", run=0.35)


class K05_Infinity(Shot):
    def body(self):
        self.title("2. The Blow Up", animate=False)
        self.title("What Is Infinity?", "27:37.24")
        nx = pill("Next chapter: infinite limits", ORG, 40).move_to([0, 0.4, 0])
        self.go("27:38.40", FadeIn(nx, shift=UP * 0.15), run=0.5)
        self.go("27:41.70", FadeOut(nx, shift=DOWN * 0.15), run=0.4)
        inf = M(r"\infty", size=130, color=YEL).move_to([-3.6, 1.0, 0])
        self.go("27:43.16", Write(inf), run=0.6)
        nn = VGroup(cross_mark(s=0.2), H("not a number you land on", 46, RED)).arrange(RIGHT, buff=0.3)
        nn.next_to(inf, RIGHT, buff=0.8)
        self.go("27:44.70", Create(nn[0]), Write(nn[1]), run=0.7)
        # a direction: an arrow running right, a point that keeps going
        x0, x1, y = -6.0, 6.2, -1.3
        line = Line([x0, y, 0], [x1 - 0.3, y, 0], color=DIM, stroke_width=3)
        z = M("0", size=40, color=DIM).next_to([x0 + 0.4, y, 0], DOWN, buff=0.18)
        zt = Line([x0 + 0.4, y + 0.1, 0], [x0 + 0.4, y - 0.1, 0], color=DIM, stroke_width=3)
        self.go("27:46.38", Create(line), Create(zt), FadeIn(z), run=0.5)
        dirn = arr([x0 + 0.4, y + 0.75, 0], [x1, y + 0.75, 0], YEL, w=5, tip=0.26)
        dl = H("a direction", 44, YEL).next_to(dirn, UP, buff=0.18).set_x(1.5)
        self.go("27:47.14", Create(dirn), FadeIn(dl, shift=UP * 0.1), run=0.8)
        k = ValueTracker(0.0)
        pos = lambda kv: np.array([x0 + 0.4 + (x1 - 0.9 - x0) * (1 - np.exp(-kv / 2.2)), y, 0])
        nums = {p: M(f"{10 ** p:,}".replace(",", "{,}"), size=48, color=ORG) for p in range(0, 8)}
        dot = always_redraw(lambda: fdot(pos(k.get_value()), ORG, r=0.12))
        lab = always_redraw(lambda: nums[min(7, int(k.get_value()))].copy().next_to(pos(k.get_value()), DOWN, buff=0.25))
        self.go("27:48.18", FadeIn(dot, scale=0.5), FadeIn(lab), run=0.2)
        self.play(k.animate.set_value(6.95), run_time=2.2, rate_func=linear)
        dot.clear_updaters(); lab.clear_updaters()


SAMPLE_GAP = 0.03


def wiggle_curve(ax, sign, color=BLUE, width=3, x_far=1.0, x_near=SAMPLE_GAP):
    """sin(1/x) sampled evenly in u = 1/x so every wiggle gets ~40 points."""
    us = np.arange(1 / x_far, 1 / x_near, 2 * PI / 40)
    return VMobject(stroke_color=color, stroke_width=width).set_points_as_corners([ax.c2p(sign / u, np.sin(sign * u)) for u in us])


class K05_Wiggle(Shot):
    def body(self):
        self.title("What Is Infinity?", animate=False)
        self.title("3. The Wiggle", "27:51.30")
        ax = axes((-1, 1, 1), (-1.5, 1.5, 1), 11.4, 3.6, (0, -1.0, 0), nums=False)
        self.go("27:52.60", Create(ax), FadeIn(ax.labels), run=0.5)
        right, left = wiggle_curve(ax, 1), wiggle_curve(ax, -1)
        self.go("27:53.10", Create(right), run=1.4, rate_func=linear)
        self.play(Create(left), run_time=1.4, rate_func=linear)
        fx = M(r"f(x)=\sin\!\left(\frac{1}{x}\right)", size=60).move_to([-3.6, 1.7, 0])
        self.go("27:56.28", Write(fx), run=1.0)
        zero = M("0", size=40, color=YEL).next_to(ax.c2p(0, -1.5), DOWN, buff=0.12)
        self.go("27:58.00", Write(zero), run=0.4)
        near = Rectangle(width=ax.c2p(0.12, 0)[0] - ax.c2p(-0.12, 0)[0], height=3.0, stroke_color=YEL, stroke_width=3).move_to(ax.c2p(0, 0))
        self.go("27:59.72", Create(near), run=0.5)
        # a point rides the curve toward 0: slow at first, then faster and faster
        ut = ValueTracker(1.3)
        mv = always_redraw(lambda: fdot(ax.c2p(1 / ut.get_value(), np.sin(ut.get_value())), YEL, r=0.1))
        self.go("28:00.48", FadeIn(mv, scale=0.5), run=0.2)
        self.play(ut.animate.set_value(7.5), run_time=2.6, rate_func=linear)
        bands = VGroup(*[DashedLine(ax.c2p(-1, v), ax.c2p(1, v), color=GRN, stroke_width=2.5, dash_length=0.12, stroke_opacity=0.8) for v in (1, -1)])
        bl = VGroup(M("1", size=40, color=GRN).next_to(ax.c2p(-1, 1), LEFT, buff=0.15),
                    M("-1", size=40, color=GRN).next_to(ax.c2p(-1, -1), LEFT, buff=0.15))
        self.go("28:04.92", ut.animate.set_value(32), Create(bands[1]), Write(bl[1]), run=2.4, rate_func=rate_functions.ease_in_quad)
        self.go("28:07.30", Create(bands[0]), Write(bl[0]), run=0.5)
        mv.clear_updaters()
        nt = note("never settles", near.get_corner(UR), UR, color=YEL, size=40, dist=0.45, angle=0.5)
        self.go("28:09.78", FadeOut(mv), FadeIn(nt[0], shift=DOWN * 0.1), Create(nt[1]), run=0.6)
        d = dne(64).move_to([4.6, 1.7, 0])
        self.go("28:12.10", Write(d), run=0.6)


class K05_Summary(Shot):
    def body(self):
        self.title("3. The Wiggle", animate=False)
        self.title("3 Ways to Fail", "28:13.52")
        xs = (-4.4, 0, 4.4)
        pills = [pill(s, YEL, 44).move_to([x, 1.4, 0]) for s, x in zip(("Jump", "Blow up", "Wiggle"), xs)]
        axs = [axes((-1, 1, 1), (-1.2, 1.2, 1), 3.0, 2.2, (x, -0.6, 0), nums=False, x_label=None, y_label=None) for x in xs]
        a = axs[0]
        jump = VGroup(curve(a, lambda x: 0.5 * x - 0.4, [-0.9, 0]), Line(a.c2p(0, 0.7), a.c2p(0.9, 0.7), color=ORG, stroke_width=5),
                      hollow(a.c2p(0, -0.4), BLUE, r=0.08), fdot(a.c2p(0, 0.7), ORG, r=0.08))
        b = axs[1]
        blow = VGroup(curve(b, lambda x: 0.12 / x, [0.1, 0.9], color=ORG), curve(b, lambda x: 0.12 / x, [-0.9, -0.1]))
        c = axs[2]
        us = np.arange(1.2, 1 / 0.04, 2 * PI / 30)
        wig = VGroup(*[VMobject(stroke_color=BLUE, stroke_width=3).set_points_as_corners([c.c2p(s / u, 0.8 * np.sin(s * u)) for u in us]) for s in (1, -1)])
        for p_, ax_, sk, t in zip(pills, axs, (jump, blow, wig), ("28:15.70", "28:16.55", "28:17.60")):
            self.go(t, FadeIn(p_, shift=UP * 0.15), FadeIn(ax_), Create(sk), run=0.6)


# ================================================================ quick check

class K05_Questions(Shot):
    def body(self):
        self.title("Quick One", animate=False)

        def qrow(lab, a, va, vb, y):
            g = VGroup(H(lab, 46, ORG), limrow(r"x\to " + a + "^-", va, BLUE, 54), limrow(r"x\to " + a + "^+", vb, ORG, 54))
            g[0].move_to([-3.75, y, 0], aligned_edge=RIGHT)
            g[1].move_to([-3.35, y, 0], aligned_edge=LEFT)
            g[2].move_to([1.35, y, 0], aligned_edge=LEFT)
            ask = M(r"\lim_{x\to " + a + r"} f(x)=\ ?", size=54, color=YEL).move_to([0, y - 1.2, 0]).align_to(g[1], LEFT)
            return g, ask
        q1, a1 = qrow("First", "3", "7", "7", 1.5)
        q2, a2 = qrow("Second", "1", "-2", "4", -1.0)
        self.go("28:20.90", FadeIn(q1[0], shift=RIGHT * 0.1), run=0.3)
        self.go("28:21.16", Write(q1[1][:3]), run=0.8)
        self.go("28:22.84", Write(q1[1][3]), run=0.3)
        self.go("28:23.80", Write(q1[2][:3]), run=0.8)
        self.go("28:25.38", Write(q1[2][3]), run=0.3)
        self.go("28:26.54", Write(a1), run=0.7)
        self.go("28:28.26", FadeIn(q2[0], shift=RIGHT * 0.1), run=0.4)
        self.go("28:29.48", Write(q2[1][:3]), run=0.8)
        self.go("28:30.42", Write(q2[1][3]), run=0.3)
        self.go("28:31.80", Write(q2[2][:3]), run=0.8)
        self.go("28:32.70", Write(q2[2][3]), run=0.3)
        self.go("28:34.90", Write(a2), run=0.7)


class K05_Answers(Shot):
    def body(self):
        self.title("Quick One", animate=False)
        self.title("Answers", "28:36.42")

        def arow(lab, a, b, rel, res, rescol, y):
            g = VGroup(H(lab, 46, ORG), M(a, rel, b, size=68), M(r"\longrightarrow", size=60, color=DIM),
                       M(r"\lim_{x\to " + res[0] + "} f(x)", "=", res[1], size=60))
            g[1][0].set_color(BLUE); g[1][2].set_color(ORG); g[1][1].set_color(YEL)
            g[3][2].set_color(rescol)
            g[0].move_to([-4.75, y, 0]); g[1].move_to([-1.55, y, 0]); g[2].move_to([0.35, y, 0])
            g[3].move_to([1.2, y, 0], aligned_edge=LEFT)
            return g
        r1 = arow("First", "7", "7", "=", ("3", "7"), GRN, 1.0)
        r2 = arow("Second", "-2", "4", r"\neq", ("1", r"\text{DNE}"), RED, -1.4)
        lr = VGroup(H("left", 36, BLUE).next_to(r1[1][0], DOWN, buff=0.2), H("right", 36, ORG).next_to(r1[1][2], DOWN, buff=0.2))
        self.go("28:37.00", FadeIn(r1[0], shift=RIGHT * 0.1), run=0.4)
        self.go("28:38.68", Write(r1[1]), FadeIn(lr), run=0.6)
        self.go("28:39.24", Circumscribe(r1[1], color=YEL, buff=0.12), run=0.8)
        self.go("28:40.26", Create(r1[2]), Write(r1[3]), run=0.6)
        self.go("28:40.90", Create(box(r1[3], GRN, buff=0.15)), run=0.4)
        self.go("28:41.76", FadeIn(r2[0], shift=RIGHT * 0.1), run=0.4)
        self.go("28:43.64", Write(r2[1][0]), run=0.3)
        self.go("28:44.60", Write(r2[1][2]), run=0.3)
        self.go("28:44.98", Write(r2[1][1]), run=0.4)
        self.go("28:46.12", Create(r2[2]), Write(r2[3]), run=0.6)
        self.go("28:46.86", Create(box(r2[3], RED, buff=0.15)), run=0.4)


# ================================================================ limit laws

LAWS = [
    ("sum", [r"\lim_{x\to a}", "[f+g]", "=", "L+M"]),
    ("difference", [r"\lim_{x\to a}", "[f-g]", "=", "L-M"]),
    ("constant multiple", [r"\lim_{x\to a}", "[", "c", r"\,f]", "=", "c", r"\,L"]),
    ("product", [r"\lim_{x\to a}", r"[f\cdot g]", "=", r"L\cdot M"]),
    ("quotient", [r"\lim_{x\to a}", r"\frac{f}{g}", "=", r"\frac{L}{M}"]),
    ("power", [r"\lim_{x\to a}", "[f]^n", "=", "L^n"]),
]
DIMMED = 0.3


def laws_board():
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
        t = H("|" + lab, 34, DIM).move_to([m.get_x(), (0.45, -1.15)[k // 3], 0])
        l = VGroup(*t[1:])
        l.set_x(m.get_x())
        rows.append((l, m, eq))
    nz = M(r"M\neq 0", size=48, color=RED).next_to(rows[4][1], DOWN, buff=0.18)
    return a1, a2, pan, rows, nz


class K05_Laws1(Shot):
    def body(self):
        self.title("Answers", animate=False)
        self.play(FadeOut(self.head), run_time=0.3)
        self.head = None
        # a table for every limit takes forever
        grid = VGroup(Line([0, 2.05, 0], [0, -2.55, 0], color=CHALK, stroke_width=4),
                      Line([-2.6, 1.2, 0], [2.6, 1.2, 0], color=CHALK, stroke_width=4))
        hdr = VGroup(M("x", size=52).move_to([-1.3, 1.65, 0]), M("f(x)", size=52).move_to([1.3, 1.65, 0]))
        self.go("28:48.82", Create(grid), Write(hdr), run=0.5)
        rows = VGroup()
        for k, (x, y, t) in enumerate([("0.9", "1.9", "28:49.38"), ("0.99", "1.99", "28:49.70"), ("0.999", "1.999", "28:50.00"), ("0.9999", "1.9999", "28:50.30")]):
            yy = 0.65 - 0.72 * k
            r = VGroup(M(x, size=48, color=BLUE).move_to([-1.3, yy, 0]), M(y, size=48, color=BLUE).move_to([1.3, yy, 0]))
            self.go(t, FadeIn(r, shift=DOWN * 0.1), run=0.25)
            rows.add(r)
        dots = VGroup(M(r"\vdots", size=48, color=DIM).move_to([-1.3, -2.2, 0]), M(r"\vdots", size=48, color=DIM).move_to([1.3, -2.2, 0]))
        self.go("28:50.60", FadeIn(dots, shift=DOWN * 0.15), run=0.4)
        self.go("28:51.78", FadeOut(VGroup(grid, hdr, rows, dots), shift=LEFT * 0.5), run=0.5)
        a1, a2, pan, laws, nz = laws_board()
        self.title("Limit Laws", "28:53.90")
        self.go("28:54.90", Create(pan), run=0.9)
        self.go("28:57.62", Write(a1[0]), run=0.8)
        self.go("28:58.50", Write(a1[1:]), run=0.4)
        self.go("28:59.00", Write(a2[0]), run=0.8)
        self.go("28:59.90", Write(a2[1:]), run=0.4)
        for i, (t1, t2) in enumerate([("29:02.18", "29:03.84"), ("29:08.48", "29:09.10"), ("29:10.44", "29:12.68")]):
            l, m, eq = laws[i]
            prev = [VGroup(*laws[i - 1][:2]).animate.set_opacity(DIMMED)] if i else []
            self.go(t1, FadeIn(l, shift=DOWN * 0.1), Write(m[:eq]), *prev, run=0.6)
            self.go(t2, Write(m[eq:]), run=0.6)
            if i == 0:
                self.go("29:06.82", Circumscribe(m, color=YEL, buff=0.1), run=0.8)
        c = laws[2][1]
        self.go("29:15.76", c[2].animate.set_color(ORG), c[5].animate.set_color(ORG), run=0.4)
        self.play(Circumscribe(c[5], color=ORG, buff=0.08), run_time=0.8)


class K05_Laws2(Shot):
    def body(self):
        self.title("Limit Laws", animate=False)
        a1, a2, pan, laws, nz = laws_board()
        c = laws[2][1]
        c[2].set_color(ORG); c[5].set_color(ORG)
        for l, m, _ in laws[:2]:
            VGroup(l, m).set_opacity(DIMMED)
        self.add(a1, a2, pan, *[x for l, m, _ in laws[:3] for x in (l, m)])
        groups = {i: VGroup(*laws[i][:2]) for i in range(6)}
        groups[4].add(nz)
        times = [("29:17.90", "29:19.62"), ("29:22.60", "29:24.62"), ("29:30.42", "29:32.18")]
        for i, (t1, t2) in zip((3, 4, 5), times):
            l, m, eq = laws[i]
            self.go(t1, FadeIn(l, shift=DOWN * 0.1), Write(m[:eq]), groups[i - 1].animate.set_opacity(DIMMED), run=0.6)
            self.go(t2, Write(m[eq:]), run=0.6)
            if i == 4:
                self.go("29:27.56", Write(nz), run=0.6)
        # they play nicely with + - x / powers
        self.go("29:36.64", *[g.animate.set_opacity(1) for g in groups.values()], run=0.5)
        self.go("29:37.12", LaggedStart(*[laws[i][0].animate.set_color(YEL) for i in range(6)], lag_ratio=0.5), run=1.4)
        # break a big limit into pieces, find each, put back together
        self.wipe("29:39.50", run=0.35)
        big = M(r"\lim_{x\to 2}", "(", "x^2", "+", "3x", ")", size=72).move_to([0, 1.5, 0])
        self.go("29:40.20", Write(big), run=0.8)
        p1 = M(r"\lim_{x\to 2}", "x^2", size=64).move_to([-3.4, -0.1, 0])
        p2 = M(r"\lim_{x\to 2}", "3x", size=64).move_to([3.4, -0.1, 0])
        plus = M("+", size=64).move_to([0, -0.1, 0])
        self.go("29:41.40", TransformFromCopy(big[0], p1[0]), TransformFromCopy(big[2], p1[1]), TransformFromCopy(big[3], plus),
                TransformFromCopy(big[0], p2[0]), TransformFromCopy(big[4], p2[1]), run=0.9)
        v1 = M("2^2", "=", "4", size=60).next_to(p1, DOWN, buff=0.45)
        v2 = M(r"3\cdot 2", "=", "6", size=60).next_to(p2, DOWN, buff=0.45)
        v1[0][0].set_color(ORG); v2[0][2].set_color(ORG)
        self.go("29:42.70", Write(v1), run=0.45)
        self.go("29:43.20", Write(v2), run=0.45)
        r = M("4", "+", "6", "=", "10", size=72).move_to([0, -2.85, 0])
        r[4].set_color(GRN)
        self.go("29:43.90", TransformFromCopy(v1[2], r[0]), FadeIn(r[1]), TransformFromCopy(v2[2], r[2]), run=0.7)
        self.go("29:44.60", Write(r[3:]), run=0.4)
        self.play(Create(box(r[4], GRN, buff=0.12)), run_time=0.4)
        # we just plugged in 2: that is the trick
        self.go("29:46.70", Circumscribe(v1[0][0], color=ORG, buff=0.08), Circumscribe(v2[0][2], color=ORG, buff=0.08), run=1.0)


# ================================================================ direct substitution

class K05_Direct(Shot):
    def body(self):
        self.title("Limit Laws", animate=False)
        self.title("Direct Substitution", "29:48.78")
        ax = axes((0, 5, 1), (0, 5, 1), 5.6, 4.0, (-3.4, -0.6, 0), nums=False)
        f = lambda x: 0.3 * (x - 1.2) ** 2 + 0.9
        cv = curve(ax, f, [0.2, 4.8])
        self.go("29:49.30", Create(ax), FadeIn(ax.labels), run=0.5)
        self.play(draw(cv, run=0.9))
        # points from both sides walk to x = 3 and meet the graph's own point
        a = 3
        tl, tr = ValueTracker(0.5), ValueTracker(4.6)
        ml, mr = mover(ax, f, tl, BLUE), mover(ax, f, tr, ORG)
        al = M("a", size=44, color=YEL).next_to(ax.c2p(a, 0), DOWN, buff=0.15)
        dash = DashedLine(ax.c2p(a, 0), ax.c2p(a, f(a)), color=DIM, stroke_width=3, dash_length=0.12)
        self.go("29:50.74", FadeIn(ml, scale=0.5), FadeIn(mr, scale=0.5), FadeIn(al), Create(dash), run=0.3)
        self.play(tl.animate.set_value(a), tr.animate.set_value(a), run_time=1.6)
        ml.clear_updaters(); mr.clear_updaters()
        fa = fdot(ax.c2p(a, f(a)), YEL, r=0.12)
        self.play(FadeOut(ml), FadeOut(mr), FadeIn(fa), run_time=0.3)
        # polynomials, and fractions whose bottom isn't 0
        r1 = VGroup(H("polynomials", 46), M("x^2+2x", size=52)).arrange(RIGHT, buff=0.4)
        r2 = VGroup(H("fractions", 46), M(r"\frac{3x-1}{x+4}", size=52)).arrange(RIGHT, buff=0.4)
        r1.move_to([3.2, 1.3, 0]); r2.move_to([3.2, 0.0, 0]).align_to(r1, LEFT)
        self.go("29:54.70", FadeIn(r1, shift=UP * 0.1), run=0.5)
        self.go("29:55.90", FadeIn(r2, shift=UP * 0.1), run=0.5)
        den = r2[1][0][5:]
        nz = M(r"\neq 0", size=48, color=RED).next_to(den, RIGHT, buff=0.15)
        self.go("29:56.70", Circumscribe(den, color=RED, buff=0.06), Write(nz), run=0.7)
        eq = M(r"\lim_{x\to a} f(x)", "=", "f(a)", size=56).move_to([3.2, -1.7, 0])
        eq[2].set_color(YEL)
        self.go("29:58.24", Write(eq[0]), run=0.8)
        self.go("29:59.24", Write(eq[1:]), run=0.5)
        rider = fdot(ax.c2p(a, 0), ORG, r=0.1)
        self.go("30:01.06", FadeIn(rider, scale=0.5), run=0.15)
        self.play(MoveAlongPath(rider, Line(ax.c2p(a, 0), ax.c2p(a, f(a)))), run_time=0.8)
        tk = tick_mark(s=0.45).next_to(eq, RIGHT, buff=0.3)
        self.go("30:02.20", Create(tk), run=0.35)
        # example 1
        self.wipe("30:02.75", run=0.35)
        L1 = M(r"\lim_{x\to 3}", "(x^2+2x)", "=", "3^2+2(3)", size=64).move_to([0, 1.0, 0])
        sub3 = L1[0][5]
        L2 = M("=", "9+6", size=64)
        L3 = M("=", "15", size=64)
        for k, L in enumerate((L2, L3)):
            L.shift(L1[2].get_center() - L[0].get_center() + DOWN * 1.35 * (k + 1))
        self.go("30:03.30", Write(L1[0]), run=0.6)
        self.go("30:05.20", Write(L1[1]), run=0.8)
        L1[3][0].set_color(ORG); L1[3][5].set_color(ORG)
        rest = VGroup(*[g for i, g in enumerate(L1[3]) if i not in (0, 5)])
        self.go("30:07.36", Write(L1[2]), FadeIn(rest), TransformFromCopy(sub3, L1[3][0]), TransformFromCopy(sub3, L1[3][5]), run=0.8)
        self.go("30:08.86", Write(L2), run=0.6)
        L3[1].set_color(GRN)
        self.go("30:10.46", Write(L3), run=0.35)
        self.play(Create(box(L3[1], GRN, buff=0.14)), run_time=0.3)


class K05_Another(Shot):
    def body(self):
        self.title("Direct Substitution", animate=False)
        L = M(r"\lim_{x\to 2}", r"\frac{3x-1}{x+4}", "=", r"\frac{3(2)-1}{2+4}", "=", r"\frac{5}{6}", size=64).move_to([0, 1.1, 0])
        sub2 = L[0][5]
        L[3][2].set_color(ORG); L[3][7].set_color(ORG)
        L[5].set_color(GRN)
        self.go("30:11.72", Write(L[0]), run=0.6)
        self.go("30:13.50", Write(L[1]), run=1.4)
        rest = VGroup(*[g for i, g in enumerate(L[3]) if i not in (2, 7)])
        self.go("30:16.90", Write(L[2]), FadeIn(rest), TransformFromCopy(sub2, L[3][2]), TransformFromCopy(sub2, L[3][7]), run=0.8)
        tl, bl = H("top", 44, DIM), H("bottom", 44, DIM)
        tm, bm = M("6-1", "=", "5", size=60), M("2+4", "=", "6", size=60)
        for lab, m, y in ((tl, tm, -0.9), (bl, bm, -2.2)):
            m.move_to([0, y, 0]).set_x(-0.6 + m.width / 2)
            lab.move_to([0, y, 0]).set_x(-1.1 - lab.width / 2)
        self.go("30:18.00", Circumscribe(L[3][0:6], color=YEL, buff=0.08), FadeIn(tl, shift=RIGHT * 0.1), Write(tm), run=0.6)
        self.go("30:19.30", Circumscribe(L[3][7:], color=YEL, buff=0.08), FadeIn(bl, shift=RIGHT * 0.1), Write(bm), run=0.6)
        self.go("30:20.30", Write(L[4]), TransformFromCopy(tm[2], L[5][0]), FadeIn(L[5][1]), TransformFromCopy(bm[2], L[5][2]), run=0.7)
        self.play(Create(box(L[5], GRN, buff=0.14)), run_time=0.4)
        # cos x at pi: smooth everywhere, so slide along it and read the height
        self.wipe("30:21.50", run=0.35)
        C = M(r"\lim_{x\to\pi}", r"\cos x", "=", r"\cos\pi", "=", "-1", size=64).move_to([0, 1.45, 0])
        C[3].set_color(ORG); C[5].set_color(GRN)
        self.go("30:22.20", Write(C[0]), run=0.6)
        self.go("30:24.00", Write(C[1]), run=0.5)
        ax = trig_axes(x_max=2 * PI, y=1.4, width=9.5, height=2.6, center=(0, -1.6, 0))
        cv = curve(ax, np.cos, [0, 2 * PI])
        self.go("30:25.46", Create(ax), FadeIn(ax.labels), run=0.5)
        self.play(draw(cv, run=1.0))
        t = ValueTracker(0.0)
        mv = mover(ax, np.cos, t, ORG)
        self.go("30:27.40", FadeIn(mv, scale=0.5), run=0.2)
        self.play(t.animate.set_value(PI), run_time=1.0)
        mv.clear_updaters()
        g = DashedLine(ax.c2p(PI, -1), ax.c2p(0, -1), color=ORG, stroke_width=3, dash_length=0.1)
        self.go("30:28.60", Write(C[2:4]), Create(g), run=0.6)
        self.go("30:29.90", Write(C[4:]), run=0.4)
        self.play(Create(box(C[5], GRN, buff=0.12)), run_time=0.35)


class K05_Step1(Shot):
    def body(self):
        self.title("Direct Substitution", animate=False)
        self.title("Step 1, Every Time", "30:31.40")
        st = pill("Plug in first", YEL, size=52).move_to([0, 1.3, 0])
        self.go("30:35.10", FadeIn(st, shift=DOWN * 0.1), run=0.5)
        a1 = arr([-0.9, 0.7, 0], [-3.3, -0.35, 0], DIM, w=4, tip=0.22)
        a2 = arr([0.9, 0.7, 0], [3.3, -0.35, 0], DIM, w=4, tip=0.22)
        self.go("30:36.30", Create(a1), run=0.4)
        nn = H("a normal number", 46).move_to([-3.6, -0.85, 0])
        self.go("30:36.74", FadeIn(nn, shift=DOWN * 0.1), run=0.5)
        ok = VGroup(tick_mark(s=0.5), H("your answer", 46, GRN)).arrange(RIGHT, buff=0.3).move_to([-3.6, -2.0, 0])
        self.go("30:37.68", Create(ok[0]), Write(ok[1]), run=0.6)
        self.go("30:39.24", Create(box(ok, GRN, buff=0.15)), run=0.4)
        self.go("30:39.96", Create(a2), run=0.4)
        zz = M(r"\frac{\,0\,}{\,0\,}", size=90, color=RED).move_to([3.3, -1.4, 0])
        self.go("30:40.48", Write(zz), run=0.7)
        wk = H("real work", 46, YEL).next_to(zz, RIGHT, buff=0.4)
        self.go("30:42.50", Write(wk), run=0.5)


# ================================================================ 0/0 and the three tricks

class K05_Puzzle(Shot):
    def body(self):
        self.title("Step 1, Every Time", animate=False)
        self.title("Indeterminate Form")
        zz = M(r"\frac{\,0\,}{\,0\,}", size=130).move_to([0, 0.6, 0])
        self.go("30:44.22", Write(zz), run=0.8)
        ind = H("indeterminate form", 60, YEL).move_to([0, -1.7, 0])
        self.go("30:46.28", Write(ind), run=0.8)
        self.go("30:49.04", Circumscribe(zz, color=YEL, buff=0.2), run=0.9)
        # not 0, not 1, not "undefined, the end"
        self.go("30:52.40", FadeOut(ind), zz.animate.move_to([-3.6, 0.0, 0]), run=0.5)
        o1, o2 = M("=", "0", size=72), M("=", "1", size=72)
        o3 = VGroup(M("=", size=72), H("undefined, the end", 52)).arrange(RIGHT, buff=0.3)
        for o, y in ((o1, 1.3), (o2, 0.0), (o3, -1.3)):
            o.move_to([0, y, 0]).set_x(-1.4 + o.width / 2)
        s1, s2, s3 = strike(o1[1], width=7), strike(o2[1], width=7), strike(o3[1], width=7)
        self.go("30:53.32", FadeIn(o1, shift=RIGHT * 0.1), run=0.4)
        self.go("30:53.96", Create(s1), run=0.3)
        self.go("30:55.20", FadeIn(o2, shift=RIGHT * 0.1), run=0.4)
        self.go("30:55.78", Create(s2), run=0.3)
        self.go("30:57.06", FadeIn(o3, shift=RIGHT * 0.1), run=0.6)
        self.go("30:58.40", Create(s3), run=0.4)
        # the answer is hidden; algebra finds it
        self.go("30:59.42", *[FadeOut(m) for m in (o1, o2, o3, s1, s2, s3)], run=0.4)
        hid = DashedVMobject(RoundedRectangle(width=2.2, height=1.8, corner_radius=0.2, stroke_color=GRN, stroke_width=4), num_dashes=28)
        hid.move_to([3.6, 0.0, 0])
        qm = H("?", 90, GRN).move_to(hid)
        go_ = arr([-2.3, 0.0, 0], [2.3, 0.0, 0], DIM, w=5, tip=0.26)
        self.go("31:00.40", Create(hid), Write(qm), run=0.6)
        alg = H("algebra", 46, YEL).next_to(go_, UP, buff=0.2)
        self.go("31:01.70", Create(go_), FadeIn(alg, shift=UP * 0.1), run=0.6)
        # three tricks
        self.wipe("31:03.30", run=0.35)
        self.title("Three Tricks", "31:03.64")
        items = [("Factoring", r"x^2-1=(x-1)(x+1)", "31:05.70"),
                 ("Combining fractions", r"\frac{1}{x}-\frac{1}{2}", "31:06.58"),
                 ("The conjugate", r"\sqrt{x}-2\ \to\ \sqrt{x}+2", "31:09.20")]
        rows = []
        for k, (name, ex, t) in enumerate(items):
            y = 1.2 - 1.55 * k
            num = VGroup(Circle(radius=0.38, color=ORG, stroke_width=4), M(str(k + 1), size=52, color=ORG)).move_to([-5.6, y, 0])
            lab = H(name, 52).next_to(num, RIGHT, buff=0.4)
            exm = M(ex, size=48, color=DIM).move_to([3.6, y, 0])
            self.go(t, Create(num[0]), Write(num[1]), Write(lab), FadeIn(exm, shift=LEFT * 0.1), run=0.7)
            rows.append(VGroup(num, lab, exm))
        self.go("31:10.70", Circumscribe(rows[0][:2], color=YEL, buff=0.15), run=0.8)


# ================================================================ factoring

Y = [1.72, -0.15, -1.75, -3.0]   # row heights of a worked limit


def lim(a):
    return r"\lim_{x \to " + a + "}"


def frow(pre, num, den, f1=None, size=66):
    """M(*pre, frac{num}{den}); tags .num .bar .den (and .f1 .f2 when num = f1 f2) on the fraction's glyphs."""
    m = M(*pre, r"\frac{" + num + "}{" + den + "}", size=size)
    fr = m[-1]
    nn = len(M(num)[0])
    m.num, m.bar, m.den = fr[:nn], fr[nn], fr[nn + 1:]
    if f1:
        k = len(M(f1)[0])
        m.f1, m.f2 = fr[:k], fr[k:nn]
    return m


def on_eq(m, y, eqx):
    m.shift(np.array([eqx, y, 0]) - m[0].get_center())
    return m


def first_row(m, y, left):
    m.shift(np.array([left - m.get_left()[0], y - m.bar.get_y(), 0]))
    return m


def under(mob, color=YEL):
    return Line(mob.get_corner(DL) + DOWN * 0.1, mob.get_corner(DR) + DOWN * 0.1, color=color, stroke_width=5)


def zero_over_zero():
    z1, z2 = M("0", size=64, color=YEL), M("0", size=64, color=YEL)
    bar = Line(LEFT * 0.3, RIGHT * 0.3, color=YEL, stroke_width=4)
    z1.next_to(bar, UP, buff=0.1); z2.next_to(bar, DOWN, buff=0.1)
    return VGroup(z1, bar, z2)


def worked(a, num, den, f1, f2, left, val, eqx=-3.0, y0=Y[0]):
    """The four rows of a factoring limit."""
    L1 = on_eq(frow(["=", lim(a)], f1 + f2, den, f1=f1), Y[1], eqx)
    L0 = first_row(frow([lim(a)], num, den), y0, L1[1].get_left()[0])
    L2 = on_eq(M("=", lim(a), f2, size=66), Y[2], eqx)
    L3 = on_eq(M("=", left, "=", val, size=66), Y[3], eqx)
    L3[1].set_color(ORG); L3[3].set_color(GRN)
    return L0, L1, L2, L3


class K05_Factor1(Shot):
    def body(self):
        self.title("Three Tricks", animate=False)
        self.title("Trick 1: Factoring", "31:12.02")
        L0, L1, L2, L3 = worked("1", "x^2-1", "x-1", "(x-1)", "(x+1)", "1+1", "2")
        self.go("31:13.66", Write(L0[0]), run=0.6)
        self.go("31:14.30", Write(L0.num), run=0.8)
        self.go("31:15.40", Create(L0.bar), run=0.3)
        self.go("31:15.98", Write(L0.den), run=0.6)
        cx = (L0.get_right()[0] + 6.7) / 2
        lab = TX(r"plug in $x=1$", 40, DIM).move_to([cx, Y[0] + 0.55, 0])
        zz = zero_over_zero().move_to([cx, Y[0] - 0.4, 0])
        self.go("31:19.44", FadeIn(lab, shift=UP * 0.1), run=0.4)
        self.go("31:20.50", Write(zz), run=0.7)
        ul = under(L0.num)
        self.go("31:22.20", FadeOut(lab), FadeOut(zz), run=0.35)
        self.go("31:22.66", Create(ul), run=0.5)
        ds = H("difference of squares", 42, YEL).move_to([cx, Y[0], 0])
        self.go("31:25.60", Write(ds), run=0.8)
        self.go("31:27.30", FadeOut(ul), Write(VGroup(L1[0], L1[1], L1.bar, L1.den)), run=0.6)
        self.go("31:28.00", Write(L1.f1), run=0.6)
        self.go("31:29.64", Write(L1.f2), run=0.6)
        self.go("31:31.20", FadeOut(ds), run=0.4)
        u1, u2 = under(L1.f1), under(L1.den)
        self.go("31:31.76", Create(u1), run=0.4)
        self.go("31:33.64", Create(u2), run=0.4)
        self.go("31:35.60", FadeOut(u1), FadeOut(u2), Create(strike(L1.f1)), Create(strike(L1.den)), run=0.6)
        self.go("31:36.76", Write(L2[0:2]), run=0.5)
        self.go("31:37.38", TransformFromCopy(L1.f2, L2[2]), run=0.7)
        self.go("31:39.00", Circumscribe(L2[1][-1], color=ORG, buff=0.08), run=0.6)
        self.go("31:40.60", Write(L3[0:2]), run=0.6)
        self.go("31:42.00", Write(L3[2:4]), run=0.4)
        self.play(Create(box(L3[3], GRN, buff=0.15)), run_time=0.4)
        ok = VGroup(tick_mark(s=0.5), H("matches our table", 42, GRN)).arrange(RIGHT, buff=0.3)
        ok.next_to(L3, RIGHT, buff=1.2)
        self.go("31:43.08", Create(ok[0]), FadeIn(ok[1], shift=UP * 0.1), run=0.5)
        self.wipe("31:44.45", run=0.35)


class K05_WhyCancel(Shot):
    def body(self):
        self.title("Trick 1: Factoring", animate=False)
        self.title("Why Can We Cancel?", "31:45.18")
        r = frow([], "(x-1)(x+1)", "x-1", f1="(x-1)", size=64).move_to([0, 1.0, 0])
        self.go("31:46.70", Write(r), run=0.7)
        self.go("31:47.56", Create(strike(r.f1)), Create(strike(r.den)), run=0.5)
        z = M("x-1", "=", "0", r"\text{ when }", "x=1", size=60).move_to([0, -1.0, 0])
        z[4].set_color(ORG)
        self.go("31:48.90", Write(z[0:3]), run=0.8)
        self.go("31:50.36", Write(z[3:5]), run=0.7)
        tk = tick_mark(s=0.45).next_to(z, RIGHT, buff=0.4)
        self.go("31:51.84", Create(tk), run=0.3)
        self.wipe("31:52.40", run=0.35)

        # number line 0..2, then zoomed to 0.99..1.01
        yl, w = 1.0, 11.0
        unit = w / 2.4
        p = lambda u: np.array([(u - 1) * unit, yl, 0])
        base = DoubleArrow(p(-0.2), p(2.2), buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        ticks = VGroup(*[Line(p(u) + UP * 0.12, p(u) + DOWN * 0.12, color=DIM, stroke_width=3) for u in (0, 1, 2)])
        labs = VGroup(*[M(s, size=40, color=DIM).next_to(p(u) + DOWN * 0.12, DOWN, buff=0.12) for u, s in ((0, "0"), (1, "1"), (2, "2"))])
        self.go("31:53.12", Create(base), Create(ticks), FadeIn(labs), run=0.5)
        ho = hollow(p(1), CHALK, r=0.14)
        self.go("31:54.92", FadeIn(ho, scale=0.5), run=0.35)
        nv = TX(r"never at $x=1$", 42, RED).next_to(ho, UP, buff=0.35)
        self.go("31:55.40", Write(nv), run=0.6)
        ul, ur = ValueTracker(0.15), ValueTracker(1.85)
        dl = always_redraw(lambda: Dot(p(ul.get_value()), radius=0.12, color=BLUE).set_z_index(2))
        dr = always_redraw(lambda: Dot(p(ur.get_value()), radius=0.12, color=ORG).set_z_index(2))
        self.go("31:57.62", FadeIn(dl), FadeIn(dr), run=0.3)
        self.play(ul.animate.set_value(0.93), ur.animate.set_value(1.07), run_time=1.9)
        zl = VGroup(*[M(s, size=40, color=DIM).next_to(p(u) + DOWN * 0.12, DOWN, buff=0.12) for u, s in ((0, "0.99"), (1, "1"), (2, "1.01"))])
        zi = H("zoomed in", 36, DIM).next_to(p(2.2), UP, buff=0.3).shift(LEFT * 0.6)
        self.go("32:00.80", ReplacementTransform(labs, zl), FadeIn(zi, shift=DOWN * 0.1),
                ul.animate.set_value(0.9), ur.animate.set_value(1.1), run=1.0)
        lx = VGroup(M("x=0.999", size=52, color=BLUE), M("x-1=-0.001", size=52, color=BLUE)).arrange(DOWN, buff=0.3).move_to([-3.4, -0.9, 0])
        rx = VGroup(M("x=1.001", size=52, color=ORG), M("x-1=0.001", size=52, color=ORG)).arrange(DOWN, buff=0.3).move_to([3.4, -0.9, 0])
        self.go("32:02.30", FadeIn(lx[0], shift=UP * 0.1), FadeIn(rx[0], shift=UP * 0.1), run=0.5)
        self.go("32:03.98", Write(lx[1]), Write(rx[1]), run=0.7)
        self.go("32:05.30", Circumscribe(lx[1][0][4:], color=YEL, buff=0.06), Circumscribe(rx[1][0][4:], color=YEL, buff=0.06), run=0.7)
        nz = M(r"x-1 \neq 0", size=64, color=GRN).move_to([0, -2.75, 0])
        self.go("32:06.46", Write(nz), run=0.6)
        tk = tick_mark(s=0.5).next_to(nz, RIGHT, buff=0.5)
        self.go("32:08.16", Create(tk), run=0.4)
        dl.clear_updaters(); dr.clear_updaters()
        self.wipe("32:09.30", run=0.35)

        # the cancelled function and the original, side by side
        def board(cx):
            a = axes((-1, 3, 1), (-1, 4, 1), 5.0, 4.0, (cx, -1.05, 0), nums=False)
            n = VGroup(*[M(str(k), size=34, color=DIM).next_to(a.c2p(k, 0), DOWN, buff=0.12) for k in (1, 2)],
                       *[M(str(k), size=34, color=DIM).next_to(a.c2p(0, k), LEFT, buff=0.12) for k in (2, 3)])
            return a, VGroup(a.labels, n)
        A, An = board(-3.4)
        B, Bn = board(3.4)
        g = lambda x: x + 1
        ca = curve(A, g, [-0.9, 2.8], width=6)
        cb = VGroup(curve(B, g, [-0.9, 0.96], width=6), curve(B, g, [1.04, 2.8], width=6))
        hb = hollow(B.c2p(1, 2), BLUE)
        la = M("y=x+1", size=56, color=BLUE).move_to([-3.4, 1.75, 0])
        lb = M("y=", r"\frac{x^2-1}{x-1}", size=56, color=BLUE).move_to([3.4, 1.75, 0])
        self.go("32:10.70", Create(A), FadeIn(An), Create(ca), Write(la), run=1.0)
        self.go("32:12.30", Create(B), FadeIn(Bn), Create(cb), FadeIn(hb), Write(lb), run=1.0)
        da = DashedLine(A.c2p(1, 0), A.c2p(1, 2), color=YEL, stroke_width=3)
        db = DashedLine(B.c2p(1, 0), B.c2p(1, 1.88), color=YEL, stroke_width=3)
        ha = DashedLine(A.c2p(0, 2), A.c2p(1, 2), color=YEL, stroke_width=3)
        hb2 = DashedLine(B.c2p(0, 2), B.c2p(0.88, 2), color=YEL, stroke_width=3)
        pa = fdot(A.c2p(1, 2), YEL, r=0.1)
        self.go("32:13.88", Create(da), Create(db), Create(ha), Create(hb2), FadeIn(pa), run=0.6)
        # the same journey on both graphs, identical except at x = 1
        t = ValueTracker(-0.8)
        mA, mB = mover(A, g, t, ORG), mover(B, g, t, ORG)
        self.go("32:15.40", FadeIn(mA, scale=0.5), FadeIn(mB, scale=0.5), run=0.2)
        self.play(t.animate.set_value(2.7), run_time=2.4, rate_func=linear)
        mA.clear_updaters(); mB.clear_updaters()
        ring = Circle(radius=0.3, color=YEL, stroke_width=4).move_to(hb)
        self.go("32:18.44", FadeOut(mA), FadeOut(mB), Create(ring), run=0.5)
        two = [m for m in Bn[1] if np.allclose(m.get_center()[1], B.c2p(0, 2)[1], atol=0.1)] + \
              [m for m in An[1] if np.allclose(m.get_center()[1], A.c2p(0, 2)[1], atol=0.1)]
        self.go("32:20.04", *[Circumscribe(m, color=GRN, buff=0.08) for m in two], run=0.8)
        self.wipe("32:21.70", run=0.35)


class K05_Factor2(Shot):
    def body(self):
        self.title("Why Can We Cancel?", animate=False)
        self.title("Trick 1: Factoring", "32:22.66")
        L0, L1, L2, L3 = worked("3", "x^2-9", "x-3", "(x-3)", "(x+3)", "3+3", "6")
        self.go("32:24.34", Write(L0[0]), run=0.7)
        self.go("32:26.32", Write(L0.num), run=0.7)
        self.go("32:27.50", Create(L0.bar), run=0.3)
        self.go("32:28.00", Write(L0.den), run=0.5)
        cx = (L0.get_right()[0] + 6.7) / 2
        lab = TX(r"plug in $x=3$", 40, DIM).move_to([cx, Y[0] + 0.55, 0])
        pl = M(r"\frac{9-9}{3-3}", "=", r"\frac{0}{0}", size=60).move_to([cx, Y[0] - 0.4, 0])
        pl[2].set_color(YEL)
        self.go("32:29.66", FadeIn(lab, shift=UP * 0.1), Write(pl[0]), run=0.6)
        self.go("32:30.30", Write(pl[1:3]), run=0.6)
        ul = under(L0.num)
        self.go("32:32.06", FadeOut(lab), FadeOut(pl), Create(ul), run=0.5)
        self.go("32:33.42", FadeOut(ul), Write(VGroup(L1[0], L1[1], L1.bar, L1.den, L1.f1)), run=0.8)
        self.go("32:34.62", Write(L1.f2), run=0.6)
        self.go("32:36.18", Create(strike(L1.f1)), Create(strike(L1.den)), run=0.6)
        self.go("32:38.08", Write(L2[0:2]), run=0.5)
        self.go("32:38.64", TransformFromCopy(L1.f2, L2[2]), run=0.6)
        self.go("32:40.02", Write(L3[0:2]), run=0.6)
        self.go("32:41.40", Write(L3[2:4]), run=0.3)
        self.play(Create(box(L3[3], GRN, buff=0.15)), run_time=0.3)


class K05_Factor3(Shot):
    def body(self):
        self.title("Trick 1: Factoring", animate=False)
        L0, L1, L2, L3 = worked("-2", "x^2+5x+6", "x+2", "(x+2)", "(x+3)", "-2+3", "1", eqx=-3.6, y0=1.55)  # y0 matches K06_Factor3End
        self.go("32:43.04", Write(L0[0]), run=0.7)
        self.go("32:45.38", Write(L0.num), run=1.0)
        self.go("32:47.60", Create(L0.bar), run=0.3)
        self.go("32:48.26", Write(L0.den), run=0.5)
        cx = (L0.get_right()[0] + 6.7) / 2
        t = VGroup(H("top", 36, DIM), M("4-10+6", "=", "0", size=52))
        b = VGroup(H("bottom", 36, DIM), M("-2+2", "=", "0", size=52))
        for row, y in ((t, 2.0), (b, 1.1)):
            row[0].move_to([cx - 1.25, y, 0], aligned_edge=RIGHT)
            row[1].move_to([cx - 1.0, y, 0], aligned_edge=LEFT)
            row[1][2].set_color(YEL)
        zz = zero_over_zero().move_to([cx + 0.2, -0.1, 0])
        self.go("32:50.94", FadeIn(t[0]), Write(t[1][0]), run=0.9)
        self.go("32:52.76", Write(t[1][1:]), run=0.4)
        self.go("32:53.90", FadeIn(b[0]), Write(b[1][0]), run=0.8)
        self.go("32:55.50", Write(b[1][1:]), run=0.4)
        self.go("32:56.82", Write(zz), run=0.6)
        ul = under(L0.num)
        self.go("32:58.86", FadeOut(t), FadeOut(b), FadeOut(zz), Create(ul), run=0.5)
        q1 = M(r"\text{?}", r"\times", r"\text{?}", "=", "6", size=60).move_to([cx, 1.9, 0])
        q2 = M(r"\text{?}", "+", r"\text{?}", "=", "5", size=60).move_to([cx, 0.95, 0])
        q2.shift(RIGHT * (q1[3].get_x() - q2[3].get_x()))
        for q in (q1, q2):
            q[0].set_color(DIM); q[2].set_color(DIM)
        self.go("33:01.24", Write(q1), run=0.6)
        self.go("33:02.62", Write(q2), run=0.5)
        n2 = [M("2", size=60, color=ORG).move_to(q[0]) for q in (q1, q2)]
        n3 = [M("3", size=60, color=ORG).move_to(q[2]) for q in (q1, q2)]
        self.go("33:04.00", *[ReplacementTransform(q[0], n) for q, n in zip((q1, q2), n2)], run=0.4)
        self.go("33:04.64", *[ReplacementTransform(q[2], n) for q, n in zip((q1, q2), n3)], run=0.4)
        self.go("33:05.50", FadeOut(ul), Write(VGroup(L1[0], L1[1], L1.bar, L1.den)), run=0.5)
        self.go("33:06.00", Write(L1.f1), run=0.6)
        self.go("33:07.36", Write(L1.f2), run=0.6)
        self.play(FadeOut(VGroup(q1, q2, *n2, *n3)), run_time=0.4)
