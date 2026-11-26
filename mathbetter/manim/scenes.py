"""Math film Manim shots. Each class = one MSHOTS window; beats keyed to spoken words via W().
Motion: Write / Create / FadeIn / Transform only. No flash, spin, bounce or glow."""
from mc import *


def pause_tag(text="PAUSE AND TRY IT"):
    t = T(text, size=26, color=AMBER, font=HEAD)
    line = Line(LEFT, RIGHT, color=AMBER, stroke_width=2).set_width(t.width * 0.6).next_to(t, DOWN, buff=0.15)
    return VGroup(t, line)


class Anticipation(Shot):
    """Pain-like activity is high while WAITING for maths and gone while DOING it."""
    NAME = "Anticipation"
    def construct(self):
        ax = Axes(x_range=[0, 10, 1], y_range=[0, 1.1, 0.5], x_length=11.5, y_length=4.6,
                  axis_config={"color": FAINT, "stroke_width": 2, "include_ticks": False}, tips=False).shift(DOWN * 0.6)
        wait_bg = Rectangle(width=ax.x_length / 2, height=ax.y_length, stroke_width=0, fill_color=RUST, fill_opacity=0.07).move_to(ax.c2p(2.5, 0.55))
        do_bg = Rectangle(width=ax.x_length / 2, height=ax.y_length, stroke_width=0, fill_color=TEAL, fill_opacity=0.07).move_to(ax.c2p(7.5, 0.55))
        div = DashedLine(ax.c2p(5, 0), ax.c2p(5, 1.1), color=FAINT, dash_length=0.12)
        l1 = T("WAITING FOR THE MATH", size=24, color=RUSTL, font=HEAD).next_to(ax.c2p(2.5, 1.1), UP, buff=0.25)
        l2 = T("DOING THE MATH", size=24, color=TEALL, font=HEAD).next_to(ax.c2p(7.5, 1.1), UP, buff=0.25)
        ylab = T("pain-like activity", size=24, color=DIM).rotate(PI / 2).next_to(ax, LEFT, buff=0.25)
        self.play(Create(ax), FadeIn(ylab), run_time=0.8)
        self.until(W("pain", 201.7))
        self.play(FadeIn(wait_bg), FadeIn(l1), run_time=0.6)
        rise = ax.plot(lambda x: 0.12 + 0.8 * (1 - np.exp(-x / 1.6)), x_range=[0, 5], color=RUSTL, stroke_width=6)
        self.until(W("waiting", 203.9))
        self.play(Create(rise), run_time=1.4, rate_func=linear)
        self.until(W("Once", 205.4))
        self.play(FadeIn(div), FadeIn(do_bg), FadeIn(l2), run_time=0.5)
        fall = ax.plot(lambda x: 0.12 + 0.8 * (1 - np.exp(-5 / 1.6)) * np.exp(-(x - 5) * 1.6), x_range=[5, 10], color=TEALL, stroke_width=6)
        self.play(Create(fall), run_time=1.6, rate_func=smooth)
        self.until(W("math", 209.4))
        math_t = T("the math", size=40, color=TEALL).move_to(ax.c2p(7.5, 0.65))
        self.play(FadeIn(math_t, shift=UP * 0.15), run_time=0.5)
        self.until(W("dread", 211.2))
        dread = T("the dread", size=48, color=RUSTL, font=HEAD).move_to(ax.c2p(2.3, 0.6))
        self.play(FadeIn(dread, shift=UP * 0.15), run_time=0.5)
        self.finish()


def row_tiles(nums, width=12.0, size=40, color=CREAM):
    g = VGroup(*[(M(r"\dots", size=size, color=DIM) if n is None else M(str(n), size=size, color=color)) for n in nums])
    g.arrange(RIGHT, buff=0.42)
    if g.width > width: g.width = width
    return g


class Question(Shot):
    NAME = "Question"
    def construct(self):
        eq = M(r"1 + 2 + 3 + \dots + 100", "=", "?", size=84)
        eq[2].set_color(AMBER)
        self.play(Write(eq[0]), run_time=1.4)
        self.until(W("Pause", 281.0))
        tag = pause_tag().next_to(eq, DOWN, buff=0.9)
        self.play(FadeIn(tag, shift=UP * 0.1), run_time=0.6)
        self.until(W("What", 282.9))
        self.play(Write(eq[1:]), run_time=0.8)
        self.finish()


class SlowAdd(Shot):
    """Adding one number at a time... gives up around 15."""
    NAME = "SlowAdd"
    def construct(self):
        terms = VGroup()
        t_start, t_end = self.rel(W("adding", 288.2)), self.rel(W("15", 291.8))
        times = np.linspace(t_start, t_end, 15)
        made = VGroup(*[M((r"+\," if k > 1 else "") + str(k), size=50, color=CREAM if k < 13 else DIM) for k in range(1, 16)])
        made.arrange(RIGHT, buff=0.18).move_to(UP * 0.6)
        if made.width > 12.6: made.width = 12.6
        for k in range(1, 16):
            self.until(self.t0 + times[k - 1])
            terms.add(made[k - 1])
            self.play(FadeIn(made[k - 1], shift=UP * 0.08), run_time=0.12)
        dots = M(r"\dots", size=56, color=FAINT).next_to(terms, RIGHT, buff=0.25)
        self.play(FadeIn(dots), run_time=0.4)
        self.until(W("slow", 294.4))
        road = T("the slow road", size=32, color=DIM).next_to(terms, DOWN, buff=0.9)
        self.play(terms.animate.set_opacity(0.35), dots.animate.set_opacity(0.25), FadeIn(road), run_time=0.6)
        self.finish()


class Pairs(Shot):
    """Gauss's pairing: 1+100, 2+99, 3+98 ... = 101, fifty pairs, 50 x 101 = 5,050."""
    NAME = "Pairs"
    def construct(self):
        nums = [1, 2, 3, 4, None, 97, 98, 99, 100]
        row = row_tiles(nums, size=58).shift(UP * 2.3)
        self.play(LaggedStart(*[FadeIn(m, shift=UP * 0.1) for m in row], lag_ratio=0.08), run_time=1.4)
        cols = [AMBER, TEALL, MOSSL]
        pairs = [(0, 8, "1 + 100", W("1", 299.5), W("101", 301.6)), (1, 7, "2 + 99", W("2", 305.6), W("101", 308.2)),
                 (2, 6, "3 + 98", W("3", 310.1), W("101", 312.3))]
        labels = VGroup()
        for i, (a, b, txt, tsel, tsum) in enumerate(pairs):
            self.until(tsel - 0.2)
            arc = ArcBetweenPoints(row[a].get_bottom() + DOWN * 0.12, row[b].get_bottom() + DOWN * 0.12, angle=PI * (0.55 - 0.08 * i), color=cols[i], stroke_width=3)
            self.play(row[a].animate.set_color(cols[i]), row[b].animate.set_color(cols[i]), Create(arc), run_time=0.7)
            line = M(txt, size=50, color=cols[i]).move_to(DOWN * (0.35 + 0.85 * i) + LEFT * 1.1)
            self.play(Write(line), run_time=0.5)
            self.until(tsum - 0.1)
            eq = M("=", "101", size=50, color=cols[i]).next_to(line, RIGHT, buff=0.3)
            self.play(Write(eq), run_time=0.45)
            labels.add(VGroup(arc, line, eq))
        self.until(W("Every", 314.0))
        every = T("every pair makes 101", size=34, color=CREAM).to_edge(DOWN, buff=0.35).shift(LEFT * 3.2)
        self.play(FadeIn(every, shift=UP * 0.1), run_time=0.5)
        self.until(W("50", 317.7))
        fifty = T("50 pairs", size=40, color=AMBER, font=HEAD).next_to(every, RIGHT, buff=0.8)
        self.play(FadeIn(fifty, shift=UP * 0.1), run_time=0.5)
        self.until(W("50", 319.9))
        prod = M(r"50 \times 101", size=96).move_to(UP * 0.2)
        self.play(FadeOut(row), FadeOut(labels), FadeOut(every), FadeOut(fifty), run_time=0.5)
        self.play(Write(prod), run_time=0.8)
        self.until(W("5", 322.3))
        res = M(r"= 5{,}050", size=110, color=AMBER).next_to(prod, DOWN, buff=0.5)
        self.play(Write(res), run_time=0.8)
        self.finish()


class Thousand(Shot):
    NAME = "Thousand"
    def construct(self):
        self.until(W("Add", 327.4))
        eq = M(r"1 + 2 + 3 + \dots + 1{,}000", size=80).shift(UP * 2.3)
        self.play(Write(eq), run_time=1.3)
        self.until(W("Pair", 330.5))
        a = eq[0][0]; b = eq[0][-5:]
        self.play(a.animate.set_color(AMBER), b.animate.set_color(AMBER), run_time=0.4)
        arc = ArcBetweenPoints(a.get_bottom() + DOWN * 0.15, b.get_bottom() + DOWN * 0.15, angle=PI * 0.35, color=AMBER, stroke_width=4)
        self.play(Create(arc), run_time=0.7)
        self.until(W("make", 332.9))
        s1 = M(r"1{,}001", size=52, color=AMBER).next_to(arc, DOWN, buff=0.15)
        self.play(Write(s1), run_time=0.5)
        self.until(W("500", 335.2))
        p = T("500 pairs", size=40, color=AMBER, font=HEAD).next_to(s1, DOWN, buff=0.5)
        self.play(FadeIn(p, shift=UP * 0.1), run_time=0.5)
        self.until(W("500", 337.0))
        prod = M(r"500 \times 1{,}001", size=92).shift(DOWN * 1.3)
        self.play(FadeOut(p), Write(prod), run_time=0.9)
        # the voice repeats here and never says the result: show it while it loops
        res = M(r"= 500{,}500", size=110, color=AMBER).next_to(prod, DOWN, buff=0.45)
        self.until(W("is", 339.1))
        self.play(Write(res), run_time=0.9)
        self.until(W("seconds", 343.9))
        note = T("seconds, not an hour", size=30, color=DIM).to_edge(DOWN, buff=0.45)
        self.play(FadeIn(note), run_time=0.5)
        self.finish()


class Formula(Shot):
    """Multiply the last number by the next one up, halve it: n(n+1)/2, built from two dot staircases."""
    NAME = "Formula"
    def construct(self):
        n, s = 8, 0.36
        stair = VGroup(*[Dot(radius=0.11, color=AMBER).move_to(np.array([c * s, -r * s, 0])) for r in range(n) for c in range(r + 1)])
        stair.move_to(LEFT * 4.9 + UP * 0.4)
        self.play(LaggedStart(*[FadeIn(d, scale=0.6) for d in stair], lag_ratio=0.02), run_time=1.2)
        lab1 = M(r"1 + 2 + \dots + n", size=44, color=AMBER).next_to(stair, DOWN, buff=0.45)
        self.play(Write(lab1), run_time=0.7)
        self.until(W("Multiply", 354.8))
        copy = stair.copy().set_color(TEALL)
        self.play(copy.animate.rotate(PI).next_to(stair, RIGHT, buff=-s * (n) + s * 0.0).shift(RIGHT * s + UP * 0.0), run_time=1.3)
        rect = SurroundingRectangle(VGroup(stair, copy), color=FAINT, buff=0.15, stroke_width=2)
        w_lab = M("n+1", size=40, color=CREAM).next_to(rect, UP, buff=0.15)
        h_lab = M("n", size=40, color=CREAM).next_to(rect, LEFT, buff=0.15)
        self.play(Create(rect), Write(w_lab), Write(h_lab), run_time=0.8)
        self.until(W("half", 358.7))
        f = M(r"1 + 2 + \dots + n", "=", r"\frac{n\,(n+1)}{2}", size=56).move_to(RIGHT * 1.5 + UP * 1.2)
        f[2].set_color(AMBER)
        self.play(Write(f), run_time=1.0)
        self.until(W("For", 359.6))
        sub = M(r"\frac{100 \times 101}{2}", size=56).next_to(f[2], DOWN, buff=0.8).shift(LEFT * 1.6)
        self.play(Write(sub), run_time=1.0)
        self.until(W("Same", 364.1))
        res = M(r"= 5{,}050", size=64, color=AMBER).next_to(sub, RIGHT, buff=0.3)
        self.play(Write(res), run_time=0.7)
        self.until(W("built", 368.2) - 1.0)
        self.play(Indicate(rect, color=CREAM, scale_factor=1.0), run_time=0.8)
        self.finish()


class Forgetting(Shot):
    """Ebbinghaus: steep drop in the first day; each review slows the forgetting; spread beats cram."""
    NAME = "Forgetting"
    def construct(self):
        ax = Axes(x_range=[0, 7, 1], y_range=[0, 1.05, 0.5], x_length=11, y_length=4.4,
                  axis_config={"color": FAINT, "stroke_width": 2, "include_ticks": False}, tips=False).shift(DOWN * 0.5)
        yl = T("remembered", size=24, color=DIM).rotate(PI / 2).next_to(ax, LEFT, buff=0.2)
        xl = T("days", size=24, color=DIM).next_to(ax, DOWN, buff=0.15)
        self.play(Create(ax), FadeIn(yl), FadeIn(xl), run_time=0.7)
        c1 = ax.plot(lambda x: 0.22 + 0.78 * np.exp(-x * 2.4), x_range=[0, 7], color=RUSTL, stroke_width=5)
        self.play(Create(c1), run_time=1.2)
        self.until(W("first", 443.4))
        day1 = Rectangle(width=ax.x_length / 7, height=ax.y_length, stroke_width=0, fill_color=RUST, fill_opacity=0.12).move_to(ax.c2p(0.5, 0.52))
        d1 = T("DAY 1", size=22, color=RUSTL, font=HEAD).next_to(day1, DOWN, buff=0.12)
        self.play(FadeIn(day1), FadeIn(d1), run_time=0.5)
        self.until(W("reviewed", 445.9))
        segs = VGroup(); k = 2.4; x0 = 0
        for i, xr in enumerate([1, 3, 7]):
            kk = k / (1.9 ** (i + 1))
            seg = ax.plot(lambda x, x0=x0, kk=kk: 0.3 + 0.7 * np.exp(-(x - x0) * kk), x_range=[x0, xr], color=TEALL, stroke_width=5)
            segs.add(seg); x0 = xr
        self.play(c1.animate.set_stroke(opacity=0.35), Create(segs, lag_ratio=1), run_time=1.6)
        ticks = VGroup(*[Dot(ax.c2p(x, 1.0), radius=0.07, color=TEALL) for x in [0, 1, 3]])
        rv = T("each review", size=24, color=TEALL).next_to(ticks[2], UP, buff=0.18)
        self.play(FadeIn(ticks), FadeIn(rv), run_time=0.5)
        self.until(W("cram", 449.4))
        cram = T("one long cram", size=26, color=RUSTL).next_to(ax.c2p(5.6, 0.22), DOWN, buff=0.18)
        self.play(FadeIn(cram), run_time=0.4)
        self.until(W("three", 452.1))
        three = T("three short sessions", size=26, color=TEALL).next_to(ax.c2p(5.6, 0.75), UP, buff=0.1)
        self.play(FadeIn(three), run_time=0.4)
        self.until(W("Same", 455.1))
        same = T("same total time", size=32, color=CREAM, font=HEAD).to_edge(UP, buff=0.5)
        self.play(FadeIn(same, shift=DOWN * 0.1), run_time=0.5)
        self.finish()


class Interleave(Shot):
    """Blocked vs shuffled practice; surprise test two weeks later: 72% vs 38%."""
    NAME = "Interleave"
    def construct(self):
        shapes = {"a": lambda: Square(0.42, color=AMBER, fill_opacity=0.85, stroke_width=0),
                  "b": lambda: Circle(0.23, color=TEALL, fill_opacity=0.85, stroke_width=0),
                  "c": lambda: Triangle(color=RUSTL, fill_opacity=0.85, stroke_width=0).scale(0.27)}
        def seq(s):
            return VGroup(*[shapes[ch]() for ch in s]).arrange(RIGHT, buff=0.22)
        blocked = seq("aaaabbbbcccc"); mixed = seq("abcbacbcaabc")
        lb = T("BLOCKED", size=26, color=DIM, font=HEAD); lm = T("SHUFFLED", size=26, color=DIM, font=HEAD)
        r1 = VGroup(lb, blocked).arrange(RIGHT, buff=0.5).shift(UP * 1.4)
        r2 = VGroup(lm, mixed).arrange(RIGHT, buff=0.5).next_to(r1, DOWN, buff=0.7).align_to(r1, LEFT)
        lb.align_to(lm, LEFT)
        self.play(FadeIn(lb), LaggedStart(*[FadeIn(m, shift=RIGHT * 0.1) for m in blocked], lag_ratio=0.08), run_time=1.3)
        self.until(W("Others", 472.5))
        self.play(FadeIn(lm), LaggedStart(*[FadeIn(m, shift=RIGHT * 0.1) for m in mixed], lag_ratio=0.08), run_time=1.3)
        self.until(W("Two", 479.7))
        self.play(VGroup(r1, r2).animate.scale(0.6).to_edge(UP, buff=0.35), run_time=0.7)
        test = T("surprise test, two weeks later", size=28, color=CREAM).next_to(VGroup(r1, r2), DOWN, buff=0.4)
        self.play(FadeIn(test), run_time=0.4)
        base = Line(LEFT * 3, RIGHT * 3, color=FAINT, stroke_width=2).shift(DOWN * 2.6)
        self.play(Create(base), run_time=0.4)
        H = 4.0
        def bar(x, pct, col):
            return Rectangle(width=1.6, height=H * pct / 100, stroke_width=0, fill_color=col, fill_opacity=0.9).move_to(base.get_center() + RIGHT * x, aligned_edge=DOWN)
        self.until(W("72", 483.3))
        b1 = bar(-1.3, 72, AMBER); v1 = M(r"72\%", size=60, color=AMBER).next_to(b1, UP, buff=0.15)
        n1 = T("shuffled practice", size=24, color=DIM).next_to(base.get_center() + LEFT * 1.3, DOWN, buff=0.2)
        self.play(GrowFromEdge(b1, DOWN), FadeIn(n1), run_time=0.7); self.play(Write(v1), run_time=0.4)
        self.until(W("38", 485.9))
        b2 = bar(1.3, 38, FAINT); v2 = M(r"38\%", size=60, color=DIM).next_to(b2, UP, buff=0.15)
        n2 = T("blocked practice", size=24, color=DIM).next_to(base.get_center() + RIGHT * 1.3, DOWN, buff=0.2)
        self.play(GrowFromEdge(b2, DOWN), FadeIn(n2), run_time=0.6); self.play(Write(v2), run_time=0.4)
        self.finish()


class NegQ(Shot):
    NAME = "NegQ"
    def construct(self):
        q = M(r"(-)", r"\times", r"(-)", "=", r"(+)", size=110)
        q[0].set_color(RUSTL); q[2].set_color(RUSTL); q[4].set_color(MOSSL)
        self.until(W("negative", 510.8) - 0.3)
        self.play(Write(q), run_time=1.4)
        self.until(W("never", 515.1))
        why = T("but why?", size=44, color=AMBER, font=HEAD).next_to(q, DOWN, buff=0.7)
        self.play(FadeIn(why, shift=UP * 0.1), run_time=0.5)
        self.until(W("Take", 516.2))
        tag = pause_tag("PAUSE AND EXPLAIN IT").next_to(why, DOWN, buff=0.6)
        self.play(FadeIn(tag), run_time=0.5)
        self.finish()


class Signs(Shot):
    NAME = "Signs"
    def construct(self):
        e1 = M(r"(+)", r"\times", r"(-)", "=", r"(-)", size=80); e1[0].set_color(MOSSL); e1[2].set_color(RUSTL); e1[4].set_color(RUSTL)
        e2 = M(r"(-)", r"\times", r"(-)", "=", r"(+)", size=80); e2[0].set_color(RUSTL); e2[2].set_color(RUSTL); e2[4].set_color(MOSSL)
        k1 = T("forward, played in reverse  =  backward", size=26, color=DIM)
        k2 = T("backward, played in reverse  =  forward", size=26, color=DIM)
        g1 = VGroup(e1, k1).arrange(DOWN, buff=0.25); g2 = VGroup(e2, k2).arrange(DOWN, buff=0.25)
        VGroup(g1, g2).arrange(DOWN, buff=0.8)
        self.add(g1.set_opacity(0.45))
        self.play(Write(e2), FadeIn(k2), run_time=1.1)
        self.until(W("understand", 547.0) - 0.4)
        box = SurroundingRectangle(e2, color=AMBER, buff=0.2, stroke_width=3)
        self.play(Create(box), run_time=0.6)
        self.finish()


class Fermat(Shot):
    NAME = "Fermat"
    def construct(self):
        eq = M(r"x^n + y^n = z^n", size=110)
        self.play(Write(eq), run_time=1.6)
        cond = M(r"\text{no whole-number solutions for } n > 2", size=44, color=DIM).next_to(eq, DOWN, buff=0.6)
        self.play(FadeIn(cond, shift=UP * 0.1), run_time=0.7)
        self.until(W("350", 572.4))
        yrs = T("350 YEARS UNSOLVED", size=34, color=AMBER, font=HEAD).next_to(cond, DOWN, buff=0.6)
        self.play(FadeIn(yrs, shift=UP * 0.1), run_time=0.6)
        self.finish()


class Simplex(Shot):
    """Dantzig's simplex method: walk the corners of the feasible region to the best plan."""
    NAME = "Simplex"
    def construct(self):
        pts = [np.array(p) for p in [(-4.2, -2.2, 0), (-4.2, 0.9, 0), (-2.2, 2.4, 0), (1.4, 2.1, 0), (3.6, 0.2, 0), (2.8, -2.2, 0)]]
        poly = Polygon(*pts, color=TEALL, stroke_width=3, fill_color=TEAL, fill_opacity=0.18)
        lab = T("every possible plan", size=26, color=TEALL).move_to(poly.get_center() + DOWN * 0.3)
        self.play(Create(poly), FadeIn(lab), run_time=1.0)
        path = [0, 5, 4, 3]
        dot = Dot(pts[path[0]], radius=0.13, color=AMBER)
        self.play(FadeIn(dot), run_time=0.3)
        for i in path[1:]:
            self.play(dot.animate.move_to(pts[i]), run_time=0.6)
        best = T("best plan", size=28, color=AMBER, font=HEAD).next_to(pts[3], UP, buff=0.2)
        self.play(FadeIn(best), run_time=0.4)
        self.finish()
