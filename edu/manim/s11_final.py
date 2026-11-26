"""Chapter 15: the final challenge (8 questions), recap montage, advice and goodbye. Times are film seconds."""
from common import *

# ponytail: own LaTeX cache per render process; the shared tex_cache collides when builders compile the same expression at once

DIFF = ["#a6e3a1", "#c6e88f", "#e3e27a", "#ffe27a", "#ffc46b", "#ffa060", "#ff8a6b", "#ff6b6b"]


def _cues(self, items):
    """items = [(t, anims | callable -> anims)]; each run fits before the next cue so nothing is late."""
    for i, (t, a) in enumerate(items):
        nxt = items[i + 1][0] if i + 1 < len(items) else self.END
        run = max(0.2, min(0.7, nxt - t - 0.06))
        self.at(t)
        anims = a() if callable(a) else a
        if not isinstance(anims, (list, tuple)):
            anims = [anims]
        if anims:
            self.play(*anims, run_time=run)

def _qhead(self, k, t, label=None):
    self.title(label or f"Question {k} of 8", t)
    dots = VGroup(*[Circle(radius=0.11, stroke_color=DIFF[i], stroke_width=3,
                           fill_color=DIFF[i], fill_opacity=1 if i < k else 0) for i in range(8)]).arrange(RIGHT, buff=0.14)
    dots.to_corner(UL, buff=0.45).shift(DOWN * 0.15)
    self.add(dots)
    return dots


Shot.cues = _cues  # attached here only; each render process loads just this file
Shot.qhead = _qhead


def mini_circle(center, r, deg):
    c = np.array([*center, 0][:3], float)
    ax = VGroup(Line(c + LEFT * (r + 0.4), c + RIGHT * (r + 0.4), color=DIM, stroke_width=3),
                Line(c + DOWN * (r + 0.4), c + UP * (r + 0.4), color=DIM, stroke_width=3))
    circ = Circle(radius=r, color=CHALK, stroke_width=4).move_to(c)
    p = on_circle(np.radians(deg), r, c)
    rad = Line(c, p, color=YEL, stroke_width=5)
    dot = Dot(p, radius=0.09, color=YEL)
    return dict(ax=ax, circ=circ, rad=rad, dot=dot, p=p, c=c)


def steps_col(lines, x, top, buff=0.32):
    g = VGroup(*lines).arrange(DOWN, aligned_edge=LEFT, buff=buff)
    g.next_to([x, top, 0], DOWN, buff=0).align_to([x, 0, 0], LEFT)
    return g


class K11_Intro(Shot):
    def body(self):
        self.title("The Final Challenge", animate=False)
        nums = VGroup(*[VGroup(Circle(radius=0.48, stroke_color=DIFF[i], stroke_width=5), H(str(i + 1), 46, DIFF[i])) for i in range(8)]).arrange(RIGHT, buff=0.35).move_to([0, 0.6, 0])
        for n in nums:
            n[1].move_to(n[0])
        easy = H("easy", 40, DIFF[0]).next_to(nums, DOWN, buff=0.35).align_to(nums, LEFT)
        brutal = H("brutal", 40, DIFF[-1]).next_to(nums, DOWN, buff=0.35).align_to(nums, RIGHT)
        arrow = Arrow(easy.get_right(), brutal.get_left(), buff=0.3, color=DIM, stroke_width=3)
        pause = VGroup(Circle(radius=0.45, color=YEL, stroke_width=5), Rectangle(width=0.12, height=0.42, fill_color=YEL, fill_opacity=1, stroke_width=0).shift(LEFT * 0.12),
                       Rectangle(width=0.12, height=0.42, fill_color=YEL, fill_opacity=1, stroke_width=0).shift(RIGHT * 0.12))
        arr = lambda: Arrow(LEFT * 0.4, RIGHT * 0.4, buff=0, color=DIM, stroke_width=4, tip_length=0.18)
        flow = VGroup(pause, H("pause", 44, YEL), arr(), H("solve", 44, CHALK), arr(), H("check", 44, GRN), tick_mark(GRN, 0.7)).arrange(RIGHT, buff=0.3).move_to([0, -2.3, 0])
        self.cues([
            (3007.84, [LaggedStart(*[GrowFromCenter(n) for n in nums], lag_ratio=0.12)]),
            (3009.46, [FadeIn(easy, shift=UP * 0.2)]),
            (3009.84, [GrowArrow(arrow), FadeIn(brutal, shift=UP * 0.2), nums[-1].animate.scale(1.15)]),
            (3010.34, [FadeIn(flow[0], scale=0.6), FadeIn(flow[1])]),
            (3012.14, [FadeIn(flow[2]), FadeIn(flow[3])]),
            (3013.34, [FadeIn(flow[4]), FadeIn(flow[5]), Create(flow[6])]),
        ])


class K11_Q1(Shot):
    def body(self):
        self.qhead(1, 3013.92)
        t = right_triangle(b=4.6, h=2.45, origin=(-6.3, -2.0, 0))
        A, B, C = t["A"], t["B"], t["C"]
        th = angle_arc(A, B, C, r=0.8, label=r"\theta")
        o = side_label(B, C, "8", PINK, 56, side=-1)
        hy = side_label(A, C, "17", GRN, 56, side=1)
        adj_q = side_label(A, B, "?", BLUE, 56, side=-1)
        adj = side_label(A, B, "15", BLUE, 56, side=-1)
        q = M(r"\tan\theta", "=", r"\,?", size=64).move_to([3.0, 1.55, 0])
        q[0].set_color(GRN)
        ans = pill("Answer", GRN, 34).move_to([0.2, 0.55, 0])
        L = steps_col([M(r"\text{adj}", "=", r"\sqrt{17^2-8^2}", size=54), M("=", r"\sqrt{289-64}", size=54),
                       M("=", r"\sqrt{225}", "=", "15", size=54), M(r"\tan\theta", "=", r"\frac{8}{15}", size=60)], 1.6, 0.85)
        L[0][0].set_color(BLUE)
        L[3][0].set_color(GRN)
        self.cues([
            (3015.40, [Create(t["tri"]), Create(t["mark"])]),
            (3017.06, [Create(th)]),
            (3017.48, [Indicate(Line(B, C), color=PINK)]),
            (3018.36, [Write(o), t["tri"].animate.set_stroke(CHALK)]),
            (3019.22, [Indicate(Line(A, C), color=GRN)]),
            (3020.00, [Write(hy)]),
            (3021.44, [Write(q)]),
            (3022.58, [FadeIn(ans, scale=0.7)]),
            (3024.44, [Write(adj_q)]),
            (3025.52, [Write(L[0])]),
            (3026.36, [Write(L[1])]),
            (3029.16, [Write(L[2][:2])]),
            (3031.34, [Write(L[2][2:]), ReplacementTransform(adj_q, adj)]),
            (3031.78, [Write(L[3])]),
            (3033.48, [Create(box(L[3], GRN)), Indicate(o, color=PINK), Indicate(adj, color=BLUE)]),
        ])


class K11_Q2(Shot):
    def body(self):
        self.qhead(2, 3034.78)
        q = M(r"\cos 330^\circ", "=", r"\,?", size=64).move_to([0, 1.6, 0])
        q[0].set_color(BLUE)
        mc = mini_circle((-3.7, -1.15), 1.95, 0)
        c, r = mc["c"], 1.95
        ang = ValueTracker(0)
        rad = always_redraw(lambda: Line(c, on_circle(np.radians(ang.get_value()), r, c), color=YEL, stroke_width=5))
        dot = always_redraw(lambda: Dot(on_circle(np.radians(ang.get_value()), r, c), radius=0.09, color=YEL))
        p = on_circle(np.radians(330), r, c)
        q4 = AnnularSector(inner_radius=0, outer_radius=r, angle=PI / 2, start_angle=-PI / 2, fill_color=ORG, fill_opacity=0.16, stroke_width=0, arc_center=c)
        q4lab = H("IV", 40, ORG).move_to(c + np.array([0.7, -0.8, 0]) * r * 0.75)
        ref = Arc(radius=0.7, start_angle=-PI / 6, angle=PI / 6, arc_center=c, color=YEL, stroke_width=5)
        reflab = M(r"30^\circ", size=40, color=YEL).move_to(c + [1.25, -0.28, 0])
        xproj = Line(c, [p[0], c[1], 0], color=BLUE, stroke_width=8)
        drop = DashedLine(p, [p[0], c[1], 0], color=DIM)
        L = steps_col([H("Quadrant IV", 46, ORG), M(r"\text{reference angle }30^\circ", size=46, color=YEL),
                       H("cosine is positive in IV", 42, BLUE), M(r"\cos330^\circ", "=", r"\frac{\sqrt3}{2}", size=64)], 0.9, 0.75, buff=0.38)
        L[3][0].set_color(BLUE)
        self.cues([
            (3035.68, [Write(q)]),
            (3036.96, [Create(mc["ax"]), Create(mc["circ"])]),
            (3038.22, lambda: (self.add(rad, dot), [ang.animate.set_value(330)])[1]),
            (3040.58, [FadeIn(q4), FadeIn(q4lab), Write(L[0])]),
            (3041.68, [Create(ref), Write(reflab), Write(L[1])]),
            (3042.92, [Create(drop), Create(xproj)]),
            (3043.90, [Write(L[2])]),
            (3044.78, [Write(L[3])]),
            (3045.55, [Create(box(L[3], BLUE))]),
        ])


class K11_Q3(Shot):
    def body(self):
        self.qhead(3, 3046.08)
        qa = M(r"\frac{11\pi}{6}", r"\;\to\;?^\circ", size=60)
        qb = M(r"\sin\frac{11\pi}{6}", "=", r"\,?", size=60)
        qb[0].set_color(PINK)
        VGroup(qa, qb).arrange(RIGHT, buff=1.4).move_to([0, 1.55, 0])
        mc = mini_circle((-4.1, -1.35), 1.7, 330)
        c, p = mc["c"], mc["p"]
        yproj = Line([p[0], c[1], 0], p, color=PINK, stroke_width=8)
        L = steps_col([M(r"\frac{11\pi}{6}", "=", r"11\times30^\circ", size=52), M("=", r"330^\circ", size=52),
                       H("Quadrant IV: sine is negative", 40, PINK), M(r"\sin\frac{11\pi}{6}", "=", r"-\frac12", size=60)], -1.0, 0.65, buff=0.34)
        note = M(r"\tfrac{\pi}{6}=30^\circ", size=40, color=YEL).next_to(L[0], RIGHT, buff=0.5)
        L[3][0].set_color(PINK)
        self.cues([
            (3047.52, [Write(qa)]),
            (3050.76, [Write(qb)]),
            (3052.82, [Write(L[0]), FadeIn(note)]),
            (3054.68, [Write(L[1])]),
            (3055.30, [Create(mc["ax"]), Create(mc["circ"]), Create(mc["rad"]), FadeIn(mc["dot"])]),
            (3056.82, [Create(yproj), Write(L[2])]),
            (3058.36, [Write(L[3])]),
            (3059.50, [Create(box(L[3], PINK))]),
        ])


class K11_Q4(Shot):
    def body(self):
        self.qhead(4, 3060.42)
        q = M(r"y=5\sin\frac{x}{2}", size=60).move_to([-3.6, 1.6, 0])
        ask = H("period & amplitude?", 42, DIM).next_to(q, RIGHT, buff=0.6)
        ax = Axes(x_range=[0, 4 * PI + 0.4, PI], y_range=[-6, 6, 5], x_length=10.5, y_length=3.7,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2)).move_to([-0.6, -1.45, 0])
        labs = VGroup(*[M(pi_label(k * PI), size=34, color=DIM).next_to(ax.c2p(k * PI, 0), DOWN, buff=0.15) for k in range(1, 5)],
                      M("5", size=34, color=DIM).next_to(ax.c2p(0, 5), LEFT, buff=0.12), M("-5", size=34, color=DIM).next_to(ax.c2p(0, -5), LEFT, buff=0.12))
        g = ax.plot(lambda x: 5 * np.sin(x / 2), x_range=[0, 4 * PI], color=PINK, stroke_width=5)
        amp = DoubleArrow(ax.c2p(PI, 0), ax.c2p(PI, 5), buff=0, color=ORG, stroke_width=4, tip_length=0.18)
        amp_l = M("5", size=44, color=ORG).next_to(amp, LEFT, buff=0.12)
        per = BraceBetweenPoints(ax.c2p(0, -5.4), ax.c2p(4 * PI, -5.4), direction=DOWN, color=GRN)
        A = M(r"\text{amplitude}=5", size=48, color=ORG).move_to([3.75, 0.75, 0])
        T1 = M(r"\text{period}=\frac{2\pi}{1/2}", size=48, color=GRN).next_to(A, DOWN, buff=0.3).align_to(A, LEFT)
        T2 = M(r"=4\pi", size=48, color=GRN).next_to(T1, RIGHT, buff=0.15)
        self.cues([
            (3061.32, [FadeIn(ask)]),
            (3063.50, [Write(q)]),
            (3064.48, [Create(ax), FadeIn(labs)]),
            (3065.20, [Create(g)]),
            (3066.40, [GrowFromPoint(amp, ax.c2p(PI, 0)), Write(amp_l)]),
            (3067.32, [Write(A)]),
            (3067.84, [GrowFromCenter(per)]),
            (3068.66, [Write(T1)]),
            (3071.42, [Write(T2), Indicate(g, color=GRN)]),
        ])


class K11_Q5(Shot):
    def body(self):
        self.qhead(5, 3072.02)
        q = M(r"\cos x", r"\cdot", r"\tan x", "+", r"\sin x", size=64).move_to([0, 1.5, 0])
        l1 = M("=", r"\cos x", r"\cdot", r"\frac{\sin x}{\cos x}", "+", r"\sin x", size=64)
        l2 = M("=", r"\sin x", "+", r"\sin x", size=64)
        l3 = M("=", r"2\sin x", size=72)
        VGroup(l1, l2, l3).arrange(DOWN, aligned_edge=LEFT, buff=0.42).move_to([0.3, -1.1, 0])
        fr = l1[3]
        s1 = strike(l1[1])
        s2 = Line(fr.get_corner(DL) + UP * 0.05, fr.get_right() + DOWN * fr.height * 0.12, color=RED, stroke_width=6)
        self.cues([
            (3073.58, [Write(q, run_time=1.0)]),
            (3075.78, [q[2].animate.set_color(GRN)]),
            (3078.56, [Write(l1)]),
            (3080.44, [Create(s1), Create(s2)]),
            (3081.20, [Write(l2)]),
            (3083.02, [Write(l3), Create(box(l3, YEL))]),
        ])


class K11_Q6(Shot):
    def body(self):
        self.qhead(6, 3083.78)
        q = M(r"\sin 2x", "=", r"\cos x", r",\quad 0\le x<2\pi", size=58).move_to([0, 1.6, 0])
        rule = M(r"\sin2x=2\sin x\cos x", size=44, color=YEL).move_to([3.6, 0.55, 0])
        rule_t = H("double angle formula", 34, YEL).next_to(rule, DOWN, buff=0.12)
        a = M(r"2\sin x\cos x", "=", r"\cos x", size=56)
        b = M(r"2\sin x\cos x", "-", r"\cos x", "=", "0", size=56)
        f = M(r"\cos x", r"\,(2\sin x-1)", "=", "0", size=60)
        VGroup(a, b, f).arrange(DOWN, aligned_edge=LEFT, buff=0.38).move_to([-2.6, -0.65, 0])
        f[0].set_color(BLUE)
        warn = VGroup(M(r"\div\cos x", size=50, color=RED), H("never divide by cos x\nyou'll lose solutions!", 36, RED)).arrange(DOWN, buff=0.2).move_to([3.7, -1.5, 0])
        xw = cross_mark(RED, 0.35).move_to(warn[0])
        # branches
        f2 = f.copy().move_to([0, 0.6, 0])
        lb = VGroup(M(r"\cos x=0", size=54, color=BLUE), M(r"x=\frac{\pi}{2},\ \frac{3\pi}{2}", size=54)).arrange(DOWN, buff=0.3).move_to([-3.4, -1.35, 0])
        rb = VGroup(M(r"\sin x=\tfrac12", size=54, color=PINK), M(r"x=\frac{\pi}{6},\ \frac{5\pi}{6}", size=54)).arrange(DOWN, buff=0.3).move_to([3.4, -1.35, 0])
        ar1 = Arrow(f2.get_bottom() + LEFT * 0.8, lb.get_top(), buff=0.15, color=DIM, stroke_width=3)
        ar2 = Arrow(f2.get_bottom() + RIGHT * 0.8, rb.get_top(), buff=0.15, color=DIM, stroke_width=3)
        four = pill("4 solutions", GRN, 40).move_to([0, -3.3, 0])
        self.cues([
            (3084.98, [Write(q)]),
            (3091.46, [Indicate(q[0], color=YEL)]),
            (3092.32, [Write(rule), FadeIn(rule_t)]),
            (3093.92, [TransformFromCopy(rule, a)]),
            (3096.78, [Write(b)]),
            (3098.76, [Write(f)]),
            (3102.42, [FadeIn(warn[0]), Write(warn[1])]),
            (3103.54, [Create(xw)]),
            (3105.52, [FadeOut(VGroup(a, b, rule, rule_t, warn, xw)), ReplacementTransform(f, f2)]),
            (3106.10, [GrowArrow(ar1), Write(lb[0])]),
            (3107.76, [Write(lb[1])]),
            (3111.00, [GrowArrow(ar2), Write(rb[0])]),
            (3113.22, [Write(rb[1])]),
            (3116.98, [FadeIn(four, scale=0.7), Create(box(lb[1], GRN)), Create(box(rb[1], GRN))]),
        ])


class K11_Q7(Shot):
    def body(self):
        self.qhead(7, 3118.34)
        q = M(r"\max\,(3\sin x+4\cos x)", "=", r"\,?", size=58).move_to([0, 1.6, 0])
        ax = Axes(x_range=[0, 2 * PI + 0.3, PI / 2], y_range=[-5.6, 5.6, 5], x_length=7.2, y_length=3.9,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18)).move_to([-3.0, -1.25, 0])
        labs = VGroup(*[M(pi_label(k * PI / 2), size=30, color=DIM).next_to(ax.c2p(k * PI / 2, 0), DOWN, buff=0.12) for k in range(1, 5)],
                      M("5", size=30, color=DIM).next_to(ax.c2p(0, 5), LEFT, buff=0.1), M("-5", size=30, color=DIM).next_to(ax.c2p(0, -5), LEFT, buff=0.1))
        gs = ax.plot(lambda x: 3 * np.sin(x), x_range=[0, 2 * PI], color=PINK, stroke_width=3, stroke_opacity=0.8)
        gc = ax.plot(lambda x: 4 * np.cos(x), x_range=[0, 2 * PI], color=BLUE, stroke_width=3, stroke_opacity=0.8)
        gsum = ax.plot(lambda x: 3 * np.sin(x) + 4 * np.cos(x), x_range=[0, 2 * PI], color=GRN, stroke_width=6)
        xm = np.arctan2(3, 4)
        top = DashedLine(ax.c2p(0, 5), ax.c2p(2 * PI, 5), color=YEL)
        mdot = Dot(ax.c2p(xm, 5), radius=0.1, color=YEL)
        trick = pill("advanced trick", ORG, 32).move_to([3.9, 0.75, 0])
        r1 = M(r"a\sin x+b\cos x", size=46).move_to([3.9, -0.05, 0])
        r2 = M(r"=R\sin(x+\varphi)", size=46).next_to(r1, DOWN, buff=0.15)
        r3 = M(r"R=\sqrt{a^2+b^2}", size=50, color=ORG).next_to(r2, DOWN, buff=0.3)
        r4 = M(r"\sqrt{9+16}=5", size=54).next_to(r3, DOWN, buff=0.3)
        mx = M(r"\max=5", size=54, color=YEL).next_to(r4, DOWN, buff=0.3)
        self.cues([
            (3119.92, [Write(q)]),
            (3121.26, [Create(ax), FadeIn(labs)]),
            (3122.36, [Create(gs)]),
            (3123.96, [Create(gc)]),
            (3125.98, [FadeIn(trick, scale=0.7)]),
            (3127.68, [Write(r1)]),
            (3131.20, [Write(r2)]),
            (3133.02, [ReplacementTransform(VGroup(gs.copy(), gc.copy()), gsum)]),
            (3134.18, [Write(r3)]),
            (3137.96, [Write(r4)]),
            (3141.58, [Create(top), FadeIn(mdot, scale=2), Write(mx)]),
            (3142.42, [Create(box(mx, YEL)), Flash(mdot, color=YEL)]),
        ])


class K11_Q8(Shot):
    def body(self):
        self.qhead(8, 3145.78, "Q8: The Final Boss")
        parts = [r"\sin^2 1^\circ", "+", r"\sin^2 2^\circ", "+", r"\sin^2 3^\circ", "+", r"\cdots", "+", r"\sin^2 89^\circ"]
        s = M(*parts, size=58).move_to([0, 1.45, 0])
        hint = H("take your time...  hint: co-functions", 40, YEL).move_to([0, 0.3, 0])
        # phase 2: the pair
        arc = CurvedArrow(s[0].get_bottom() + DOWN * 0.1, s[8].get_bottom() + DOWN * 0.1, angle=PI / 5, color=YEL, stroke_width=4)
        d1 = M(r"\sin 89^\circ", "=", r"\cos 1^\circ", size=54).move_to([0, -0.85, 0])
        d1[2].set_color(BLUE)
        d2 = M(r"\sin^2 1^\circ", "+", r"\cos^2 1^\circ", "=", "1", size=60).move_to([0, -2.0, 0])
        d2[0].set_color(PINK)
        d2[2].set_color(BLUE)
        # phase 3: tiles and arcs
        labels = ["1", "2", "3", None, "44", "45", "46", None, "87", "88", "89"]
        tiles = VGroup()
        for lab in labels:
            if lab is None:
                tiles.add(M(r"\cdots", size=44, color=DIM))
            else:
                tiles.add(VGroup(RoundedRectangle(width=0.98, height=0.66, corner_radius=0.12, stroke_color=CHALK, stroke_width=3), M(lab + r"^\circ", size=38)))
        tiles.arrange(RIGHT, buff=0.18).move_to([0, -1.0, 0])
        for tt in tiles:
            if isinstance(tt, VGroup) and len(tt) == 2:
                tt[1].move_to(tt[0])

        def pair_arc(i, j, h, col):
            p, q = tiles[i].get_top() + UP * 0.05, tiles[j].get_top() + UP * 0.05
            a = CubicBezier(p, p + UP * h, q + UP * h, q, stroke_color=col, stroke_width=4)
            lab = M("1", size=36, color=GRN).move_to(a.point_from_proportion(0.2) + UP * 0.22 + LEFT * 0.12)
            return VGroup(a, lab)

        A1, A2, A3, A4 = pair_arc(0, 10, 2.15, PINK), pair_arc(1, 9, 1.6, BLUE), pair_arc(2, 8, 1.1, ORG), pair_arc(4, 6, 0.45, PURP)
        n44 = M(r"44\text{ pairs}\times1=44", size=50).move_to([-3.4, -2.35, 0])
        mid = M(r"\sin^2 45^\circ=\left(\tfrac{\sqrt2}{2}\right)^2=\tfrac12", size=48, color=ORG).move_to([3.0, -2.35, 0])
        tot = M(r"\text{total}=44\tfrac12", size=68, color=YEL).move_to([0, -3.3, 0])
        self.cues([
            (3147.10, [Write(s[0])]),
            (3148.88, [Write(s[1:3])]),
            (3151.04, [Write(s[3:5])]),
            (3153.36, [Write(s[5:7])]),
            (3154.64, [Write(s[7:9])]),
            (3156.58, [FadeIn(hint, shift=UP * 0.2)]),
            (3158.80, [Indicate(hint, color=YEL)]),
            (3162.02, [FadeOut(hint), s[0].animate.set_color(PINK), s[8].animate.set_color(PINK)]),
            (3163.24, [Create(arc)]),
            (3168.16, [Write(d1)]),
            (3169.30, [s[8].animate.set_color(BLUE)]),
            (3171.18, [Write(d2[:3])]),
            (3175.44, [Write(d2[3:])]),
            (3175.80, [Create(box(d2, GRN))]),
            (3176.20, lambda: [FadeOut(VGroup(arc, d1, d2, *[m for m in self.board() if isinstance(m, SurroundingRectangle)])),
                               s.animate.set_color(CHALK), LaggedStart(*[FadeIn(t, shift=UP * 0.15) for t in tiles], lag_ratio=0.06)]),
            (3176.95, [Create(A1[0]), FadeIn(A1[1])]),
            (3177.66, [Create(A2[0]), FadeIn(A2[1])]),
            (3179.70, [Create(A3[0]), FadeIn(A3[1])]),
            (3181.56, [Create(A4[0]), FadeIn(A4[1])]),
            (3183.50, [Write(n44)]),
            (3186.06, [Indicate(n44, color=GRN)]),
            (3188.66, [tiles[5][0].animate.set_stroke(ORG, width=6), tiles[5][1].animate.set_color(ORG)]),
            (3189.66, [Wiggle(tiles[5])]),
            (3190.46, [Write(mid)]),
            (3196.38, [Write(tot)]),
            (3197.58, [Create(box(tot, YEL)), Flash(tot.get_right() + RIGHT * 0.3, color=YEL)]),
        ])


# ---------- recap icons ----------

def ic_angle():
    o = ORIGIN
    a, b = Line(o, [1.6, 0, 0], color=CHALK, stroke_width=4), Line(o, [1.1, 1.0, 0], color=CHALK, stroke_width=4)
    return VGroup(a, b, angle_arc(o, [1, 0, 0], [1.1, 1.0, 0], r=0.5, label=r"\theta", label_size=40)).move_to(ORIGIN)


def ic_specials():
    t1 = Polygon([0, 0, 0], [1.1, 0, 0], [1.1, 1.1, 0], color=BLUE, stroke_width=4)
    t2 = Polygon([0, 0, 0], [1.6, 0, 0], [1.6, 0.92, 0], color=PINK, stroke_width=4)
    l1 = M(r"45^\circ", size=28, color=BLUE).move_to([0.42, 0.14, 0])
    l2 = M(r"30^\circ", size=28, color=PINK).move_to([0.55, 0.13, 0])
    return VGroup(VGroup(t1, l1), VGroup(t2, l2)).arrange(RIGHT, buff=0.4, aligned_edge=DOWN)


def ic_ladder():
    wall = Line([1.0, 0, 0], [1.0, 1.6, 0], color=DIM, stroke_width=4)
    ground = Line([-0.4, 0, 0], [1.2, 0, 0], color=DIM, stroke_width=4)
    r1, r2 = Line([-0.15, 0, 0], [0.95, 1.4, 0]), Line([0.05, 0, 0], [1.0, 1.2, 0])
    rails = VGroup(r1, r2).set_stroke(ORG, 4)
    rungs = VGroup(*[Line(r1.point_from_proportion(k), r2.point_from_proportion(k), color=ORG, stroke_width=3) for k in np.linspace(0.15, 0.9, 5)])
    return VGroup(wall, ground, rails, rungs)


def ic_tree():
    trunk = Rectangle(width=0.18, height=0.45, fill_color="#b08560", fill_opacity=1, stroke_width=0).move_to([0, 0.22, 0])
    crown = Polygon([-0.55, 0.42, 0], [0.55, 0.42, 0], [0, 1.6, 0], color=GRN, fill_color=GRN, fill_opacity=0.35, stroke_width=4)
    return VGroup(trunk, crown)


def ic_lighthouse():
    body = Polygon([-0.32, 0, 0], [0.32, 0, 0], [0.2, 1.15, 0], [-0.2, 1.15, 0], color=CHALK, stroke_width=4)
    band = Line([-0.27, 0.5, 0], [0.27, 0.5, 0], color=RED, stroke_width=6)
    lamp = Square(0.3, color=YEL, fill_color=YEL, fill_opacity=0.6, stroke_width=3).move_to([0, 1.3, 0])
    rays = VGroup(*[Line([s * 0.25, 1.3, 0], [s * 0.85, 1.3 + d, 0], color=YEL, stroke_width=3) for s in (1, -1) for d in (0.25, -0.1)])
    return VGroup(body, band, lamp, rays)


def ic_radian():
    r = 0.85
    c = Circle(radius=r, color=CHALK, stroke_width=4)
    arc = Arc(radius=r, start_angle=0, angle=1, color=YEL, stroke_width=7)
    rads = VGroup(Line(ORIGIN, [r, 0, 0], color=BLUE, stroke_width=4), Line(ORIGIN, [r * np.cos(1), r * np.sin(1), 0], color=BLUE, stroke_width=4))
    lab = M(r"1\text{ rad}", size=30, color=YEL).move_to([1.45, 0.75, 0])
    return VGroup(c, arc, rads, lab)


def cell_grid(rows, cols, top=1.75, bottom=-3.5, xs=None):
    xs = xs or list(np.linspace(-4.5, 4.5, cols))
    ys = list(np.linspace(top, bottom, rows * 2 + 1))[1::2]
    return [np.array([x, y, 0]) for y in ys for x in xs]


def fit(m, w, h):
    s = min(w / max(m.width, 1e-3), h / max(m.height, 1e-3), 1.6)
    return m.scale(s)


class K11_Recap1(Shot):
    def body(self):
        self.title("How Far We've Come", 3204.70)
        P = cell_grid(2, 3, top=2.2)
        uc = VGroup(Circle(radius=0.85, color=CHALK, stroke_width=4), Line([-1.1, 0, 0], [1.1, 0, 0], color=DIM, stroke_width=3), Line([0, -1.1, 0], [0, 1.1, 0], color=DIM, stroke_width=3))
        spin = ValueTracker(0.5)
        hand = always_redraw(lambda: Line(uc[0].get_center(), uc[0].get_center() + 0.85 * np.array([np.cos(spin.get_value()), np.sin(spin.get_value()), 0]), color=YEL, stroke_width=5))
        items = [fit(ic_angle(), 2.6, 1.6), pill("SOH CAH TOA", YEL, 40), fit(ic_specials(), 3.0, 1.6),
                 VGroup(ic_ladder(), ic_tree(), ic_lighthouse()).arrange(RIGHT, buff=0.35, aligned_edge=DOWN), uc, fit(ic_radian(), 2.6, 1.8)]
        caps = ["one angle", "SOH CAH TOA", "special triangles", "ladders, trees, lighthouses", "the unit circle", "radians"]
        cells = []
        for i, it in enumerate(items):
            it.move_to(P[i] + UP * 0.25)
            cap = H(caps[i], 32, DIM).next_to(P[i] + DOWN * 0.55, DOWN, buff=0.15) if i != 1 else VGroup()
            cells.append(VGroup(it, cap))
        hand.update()
        lad, tree, lh = items[3]
        self.cues([
            (3208.02, [Create(items[0]), FadeIn(cells[0][1])]),
            (3210.52, [FadeIn(items[1], scale=0.7)]),
            (3212.44, [Create(items[2]), FadeIn(cells[2][1])]),
            (3214.82, [Create(lad), FadeIn(cells[3][1])]),
            (3215.36, [Create(tree)]),
            (3216.54, [Create(lh)]),
            (3217.92, lambda: (self.add(hand), [Create(uc), FadeIn(cells[4][1])])[1]),
            (3219.32, [spin.animate(rate_func=linear).set_value(0.5 + TAU)]),
            (3220.82, [Create(items[5]), FadeIn(cells[5][1])]),
        ])


class K11_Recap2(Shot):
    def body(self):
        self.title("How Far We've Come", animate=False)
        P = cell_grid(3, 3, top=2.25, bottom=-3.7)
        wave = FunctionGraph(lambda x: 0.6 * np.sin(2 * x), x_range=[-1.5, 1.5], color=PINK, stroke_width=5)
        rose = ParametricFunction(lambda t: 0.85 * np.cos(3 * t) * np.array([np.cos(t), np.sin(t), 0]), t_range=[0, PI], color=PURP, stroke_width=4)
        cx = VGroup(Line([-0.2, 0, 0], [1.4, 0, 0], color=DIM, stroke_width=3), Line([0, -0.2, 0], [0, 1.0, 0], color=DIM, stroke_width=3),
                    Arrow([0, 0, 0], [1.0, 0.75, 0], buff=0, color=BLUE, stroke_width=4, tip_length=0.16), M(r"a+bi", size=30, color=BLUE).move_to([1.45, 0.85, 0]))
        lawtri = VGroup(Polygon([0, 0, 0], [1.3, 0, 0], [0.45, 0.8, 0], color=CHALK, stroke_width=3), M(r"\frac{a}{\sin A}=\frac{b}{\sin B}", size=34).shift(RIGHT * 2.75 + UP * 0.35))
        items = [wave, M(r"\sin^2\theta+\cos^2\theta=1", size=40), M(r"\sin2\theta=2\sin\theta\cos\theta", size=38),
                 VGroup(M(r"2\sin x-1=0", size=40), tick_mark(GRN, 0.45)).arrange(RIGHT, buff=0.25), M(r"\sin^{-1}\tfrac12=30^\circ", size=40),
                 lawtri, rose, cx, M(r"e^{i\pi}+1=0", size=54, color=YEL)]
        caps = ["sine waves", "identities", "double angles", "equations", "inverse functions", "law of sines & cosines", "polar curves", "complex numbers", "Euler's formula"]
        cells = []
        for i, it in enumerate(items):
            fit(it, 3.6, 0.95).move_to(P[i] + UP * 0.22)
            cells.append(VGroup(it, H(caps[i], 28, DIM).move_to(P[i] + DOWN * 0.6)))
        times = [3223.84, 3226.42, 3228.60, 3230.42, 3232.30, 3234.30, 3238.36, 3239.46, 3240.66]
        cs = [(t, [FadeIn(c, shift=UP * 0.15)] if i not in (0, 6) else [Create(c[0]), FadeIn(c[1])]) for i, (t, c) in enumerate(zip(times, cells))]
        cs.append((3241.66, lambda: [*[c.animate.set_opacity(0.18) for c in cells[:8]], cells[8][0].animate.scale(2.0).move_to([0, -0.7, 0]), FadeOut(cells[8][1])]))
        self.cues(cs)


class K11_Advice(Shot):
    def body(self):
        self.title("My Advice", 3252.56)
        head = pill("Don't stop here", YEL, 44).move_to([0, 1.75, 0])
        rows = VGroup(*[VGroup(Square(0.5, color=CHALK, stroke_width=3), H(s, 46)).arrange(RIGHT, buff=0.35)
                        for s in ["rewatch the chapters that felt hard", "redo the practice questions - no peeking", "make your own problems"]]).arrange(DOWN, aligned_edge=LEFT, buff=0.42).move_to([0, -0.55, 0])
        ticks = [tick_mark(GRN, 0.55).move_to(r[0]).shift(UP * 0.08 + RIGHT * 0.05) for r in rows]
        built = H("that's how real understanding is built", 42, GRN).move_to([0, -2.9, 0])
        share = H("share it with someone who's struggling with math", 46, CHALK).move_to([0, 1.3, 0])
        cry = H("no more crying over an identity tonight...", 42, BLUE).move_to([0, 0.15, 0])
        ident = M(r"\sin^2\theta", "+", r"\cos^2\theta", "=", "1", size=72).move_to([0, -1.55, 0])
        ident[0].set_color(PINK)
        ident[2].set_color(BLUE)
        trick = H("they'll know the trick", 40, YEL).move_to([0, -2.8, 0])
        self.cues([
            (3253.20, [FadeIn(head, scale=0.7)]),
            (3254.48, [FadeIn(rows[0])]),
            (3255.56, [Create(ticks[0])]),
            (3256.80, [FadeIn(rows[1])]),
            (3258.54, [Create(ticks[1])]),
            (3259.88, [FadeIn(rows[2])]),
            (3260.42, [Create(ticks[2])]),
            (3261.76, [Write(built)]),
            (3264.04, lambda: [FadeOut(VGroup(head, rows, built, *ticks))]),
            (3264.88, [Write(share)]),
            (3268.88, [FadeIn(cry, shift=UP * 0.2)]),
            (3271.86, [Write(ident)]),
            (3273.52, [FadeIn(trick), Create(box(ident, YEL))]),
        ])


class K11_Thanks(Shot):
    def body(self):
        self.title("Trigonometry", 3274.14)
        t = right_triangle(b=2.4, h=1.4, origin=(-6.3, -3.4, 0))
        tri = VGroup(t["tri"], t["mark"], angle_arc(t["A"], t["B"], t["C"], r=0.55, label=r"\theta", label_size=36))
        wave = FunctionGraph(lambda x: -2.7 + 0.6 * np.sin(2.2 * (x - 3.9)), x_range=[3.9, 6.6], color=YEL, stroke_width=5)
        ty = H("Thank you for learning with me!", 66).move_to([0, 1.2, 0])
        k1 = H("keep exploring", 50, GRN)
        k2 = H("keep questioning", 50, BLUE)
        VGroup(k1, k2).arrange(RIGHT, buff=1.2).move_to([0, -0.1, 0])
        see = H("see you in the next one", 52, YEL).move_to([0, -1.4, 0])
        self.cues([
            (3274.60, [Write(ty), Create(tri)]),
            (3276.12, [FadeIn(k1, shift=UP * 0.2), Create(wave)]),
            (3277.30, [FadeIn(k2, shift=UP * 0.2)]),
            (3278.96, [Write(see)]),
            (3279.84, [Create(brush_line(see.width + 0.4, GRN, see.get_bottom() + DOWN * 0.12, seed=5))]),
        ])
