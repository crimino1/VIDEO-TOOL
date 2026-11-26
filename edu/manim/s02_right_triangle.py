"""Builder 02: Chapter 2 (right triangle, Pythagoras, SOH CAH TOA, worked example, practice) and Chapter 3 (reciprocals)."""
from common import *


def labeled_tri(b, h, origin, theta=True, opp=None, adj=None, hyp=None, size=42, width=5):
    """Right triangle (right angle bottom-right, θ bottom-left) with optional coloured side labels.
    Returns (group, parts dict). Labels are MathTex strings; sides are separate Lines so they can be recoloured."""
    t = right_triangle(b=b, h=h, origin=origin)
    A, B, C = t["A"], t["B"], t["C"]
    sAB, sBC, sAC = seg(A, B, width=width), seg(B, C, width=width), seg(A, C, width=width)
    g = VGroup(sAB, sBC, sAC, t["mark"])
    P = dict(A=A, B=B, C=C, AB=sAB, BC=sBC, AC=sAC, mark=t["mark"])
    if theta:
        P["th"] = angle_arc(A, B, C, r=0.75, label=r"\theta", label_size=46)
        g.add(P["th"])
    for key, txt, col, p, q, side in (("opp", opp, PINK, B, C, -1), ("adj", adj, BLUE, A, B, -1), ("hyp", hyp, GRN, A, C, 1)):
        if txt is not None:
            P[key] = side_label(p, q, txt, col, size, side=side)
            g.add(P[key])
    return g, P


def square_on(p, q, color, n, sign=1):
    """Square built outward on segment pq (sign picks the side), with an n x n grid of unit cells."""
    p, q = np.array(p, float), np.array(q, float)
    d = q - p
    nrm = np.array([-d[1], d[0], 0]) * sign
    sq = Polygon(p, q, q + nrm, p + nrm, stroke_color=color, stroke_width=4, fill_color=color, fill_opacity=0.18).set_z_index(-5)
    grid = VGroup()
    for k in range(1, n):
        f = k / n
        grid.add(Line(p + d * f, p + d * f + nrm, stroke_color=color, stroke_width=1.5, stroke_opacity=0.6))
        grid.add(Line(p + nrm * f, q + nrm * f, stroke_color=color, stroke_width=1.5, stroke_opacity=0.6))
    return sq, grid.set_z_index(-4)


def flip_to(scene, src, dst, run=0.6):
    """'Flip' a fraction into its reciprocal: squash vertically, swap, unsquash."""
    scene.play(src.animate.stretch(0.02, 1), run_time=run / 2)
    dst.stretch(0.02, 1)
    scene.remove(src)
    scene.add(dst)
    scene.play(dst.animate.stretch(50, 1), run_time=run / 2)


# ---------------------------------------------------------------- Chapter 2

class K02_Parts(Shot):
    def body(self):
        self.title("The Right Triangle", "4:03.60")
        g, P = labeled_tri(5.6, 3.8, (-5.6, -2.7, 0), theta=False)
        A, B, C = P["A"], P["B"], P["C"]
        self.go("4:06.42", Create(VGroup(P["AB"], P["BC"], P["AC"])), run=1.2)
        ninety = M(r"90^\circ", size=40, color=YEL).next_to(B, UR, buff=0.15).shift(LEFT * 1.25 + UP * 0.05)
        self.go("4:08.96", Create(P["mark"]), FadeIn(ninety, scale=1.4), run=0.6)
        # three sides with special names
        for t, s in (("4:12.50", P["AB"]), ("4:12.80", P["BC"]), ("4:13.24", P["AC"])):
            self.go(t, s.animate.set_stroke(YEL, 8), run=0.14)
            self.play(s.animate.set_stroke(CHALK, 5), run_time=0.12)
        # hypotenuse
        self.go("4:14.86", P["AC"].animate.set_stroke(GRN, 7), run=0.4)
        arr = Arrow(B + UL * 0.45, (A + C) / 2 + DR * 0.15, color=GRN, buff=0.1, stroke_width=4, max_tip_length_to_length_ratio=0.12)
        self.go("4:16.30", GrowArrow(arr), run=0.6)
        hyp = side_label(A, C, r"\text{hypotenuse}", GRN, 44, side=1)
        self.go("4:19.06", Write(hyp), FadeOut(arr), run=0.7)
        # pick an angle, call it theta
        dots = VGroup(Dot(A, color=YEL, radius=0.11), Dot(C, color=YEL, radius=0.11))
        self.go("4:20.84", FadeIn(dots, scale=2), run=0.4)
        self.play(Indicate(dots, color=YEL, scale_factor=1.6), run_time=0.6)
        th = angle_arc(A, B, C, r=0.9, label=r"\theta", label_size=56)
        self.go("4:23.34", FadeOut(dots[1]), Create(th[0]), Write(th[1]), run=0.5)
        self.remove(dots[0])
        note = VGroup(M(r"\theta", size=60, color=YEL), H("= \"theta\", a Greek letter", 34)).arrange(RIGHT, buff=0.2).move_to([3.6, 1.7, 0])
        self.go("4:25.32", FadeIn(note, shift=LEFT * 0.3), run=0.5)
        # opposite
        eye_ray = DashedLine(A + RIGHT * 0.9 + UP * 0.25, (B + C) / 2 + LEFT * 0.1, color=PINK, dash_length=0.12)
        self.go("4:29.14", Create(eye_ray), run=0.8)
        opp = side_label(B, C, r"\text{opposite}", PINK, 44, side=-1)
        self.go("4:32.88", P["BC"].animate.set_stroke(PINK, 7), Write(opp), FadeOut(eye_ray), run=0.5)
        # adjacent
        self.go("4:35.06", P["AB"].animate.set_stroke(BLUE, 8), run=0.3)
        self.play(P["AB"].animate.set_stroke(BLUE, 5), run_time=0.25)
        nothyp = cross_mark(RED, 0.18).move_to(hyp.get_right() + RIGHT * 0.35)
        self.go("4:36.84", Indicate(P["AC"], color=GRN), FadeIn(nothyp, scale=1.5), run=0.5)
        adj = side_label(A, B, r"\text{adjacent}", BLUE, 44, side=-1)
        self.go("4:38.58", P["AB"].animate.set_stroke(BLUE, 7), Write(adj), FadeOut(nothyp), run=0.5)
        means = H("adjacent = next to", 44, BLUE).move_to([3.6, 0.6, 0])
        self.go("4:40.40", Write(means), run=0.8)


class K02_Swap(Shot):
    def body(self):
        self.title("The Right Triangle", animate=False)
        g, P = labeled_tri(5.6, 3.8, (-5.6, -2.7, 0), theta=False)
        A, B, C = P["A"], P["B"], P["C"]
        P["AC"].set_stroke(GRN, 7); P["BC"].set_stroke(PINK, 7); P["AB"].set_stroke(BLUE, 7)
        th = angle_arc(A, B, C, r=0.9, label=r"\theta", label_size=56)
        hyp = side_label(A, C, r"\text{hypotenuse}", GRN, 44, side=1)
        opp = side_label(B, C, r"\text{opposite}", PINK, 44, side=-1)
        adj = side_label(A, B, r"\text{adjacent}", BLUE, 44, side=-1)
        self.add(P["AB"], P["BC"], P["AC"], P["mark"], th, hyp, opp, adj)
        imp = pill("Important detail", ORG, 40).move_to([3.9, 1.7, 0])
        self.go("4:42.84", FadeIn(imp, scale=0.8), run=0.4)
        self.go("4:44.32", Indicate(opp, color=PINK), run=0.5)
        self.go("4:45.02", Indicate(adj, color=BLUE), run=0.5)
        # switch to the other angle
        th2 = angle_arc(C, A, B, r=0.9, label=r"\theta", label_size=56)
        self.go("4:48.34", ReplacementTransform(th, th2), run=0.8)
        opp2 = side_label(A, B, r"\text{opposite}", PINK, 44, side=-1)
        adj2 = side_label(B, C, r"\text{adjacent}", BLUE, 44, side=-1)
        self.go("4:49.90", ReplacementTransform(opp, opp2, path_arc=-PI / 2), ReplacementTransform(adj, adj2, path_arc=-PI / 2),
                P["AB"].animate.set_stroke(PINK, 7), P["BC"].animate.set_stroke(BLUE, 7), run=0.9)
        swap = H("they swap!", 44, ORG).next_to(imp, DOWN, buff=0.45)
        self.go("4:51.58", Write(swap), run=0.5)
        b = box(hyp, GRN)
        self.go("4:52.72", Create(b), run=0.5)
        nev = H("never changes", 40, GRN).next_to(b, UP, buff=0.15)
        tk = tick_mark(GRN, 0.5).next_to(nev, LEFT, buff=0.2)
        self.go("4:53.40", Write(nev), FadeIn(tk, scale=1.5), run=0.5)


class K02_Pythag(Shot):
    def body(self):
        self.title("The Pythagorean Theorem", "4:58.75")
        u = 0.55
        A = np.array([-4.2, -1.5, 0]); B = A + [4 * u, 0, 0]; C = B + [0, 3 * u, 0]
        tri = VGroup(seg(A, B), seg(B, C), seg(A, C), right_angle_mark(B, A, C, 0.22))
        la = M("a", size=44, color=PINK).move_to((B + C) / 2 + RIGHT * 0.32)
        lb = M("b", size=44, color=BLUE).move_to((A + B) / 2 + DOWN * 0.34)
        lc = M("c", size=44, color=GRN).move_to((A + C) / 2 + np.array([-0.6, 0.8, 0]) * 0.36)
        self.go("4:59.26", Create(tri), FadeIn(la, lb, lc), run=0.8)
        sqC, gC = square_on(A, C, GRN, 5, sign=1)
        sqA, gA = square_on(B, C, PINK, 3, sign=-1)
        sqB, gB = square_on(A, B, BLUE, 4, sign=-1)
        self.go("5:00.40", DrawBorderThenFill(sqC), run=0.9)
        self.go("5:02.32", DrawBorderThenFill(sqA), DrawBorderThenFill(sqB), run=0.9)
        eq = M("a^2", "+", "b^2", "=", "c^2", size=84).move_to([3.4, 1.0, 0])
        eq[0].set_color(PINK); eq[2].set_color(BLUE); eq[4].set_color(GRN)
        for t, i in (("5:05.02", 0), ("5:05.64", 1), ("5:05.94", 2), ("5:06.56", 3), ("5:06.88", 4)):
            self.go(t, Write(eq[i]), run=0.3)
        n3 = M("3", size=44, color=PINK).move_to(la)
        n4 = M("4", size=44, color=BLUE).move_to(lb)
        n5 = M("5", size=44, color=GRN).move_to(lc)
        self.go("5:09.28", Transform(la, n3), Create(gA), run=0.4)
        self.go("5:09.74", Transform(lb, n4), Create(gB), run=0.4)
        self.go("5:10.16", Transform(lc, n5), Create(gC), run=0.4)
        works = H("3, 4, 5 works perfectly", 40, YEL).move_to([3.4, -0.3, 0])
        self.play(Write(works), run_time=0.6)
        k9 = M("9", size=46, color=PINK).move_to(sqA.get_center() + RIGHT * 0.32)
        k16 = M("16", size=46, color=BLUE).move_to(sqB.get_center() + DOWN * 0.25)
        k25 = M("25", size=50, color=GRN).move_to(sqC)
        eq2 = M("9", "+", "16", "=", "25", size=84).move_to([3.4, -1.7, 0])
        eq2[0].set_color(PINK); eq2[2].set_color(BLUE); eq2[4].set_color(GRN)
        self.go("5:12.06", FadeIn(k9, scale=1.4), Write(eq2[0]), run=0.3)
        self.go("5:12.40", Write(eq2[1]), run=0.2)
        self.go("5:12.64", FadeIn(k16, scale=1.4), Write(eq2[2]), run=0.3)
        self.go("5:13.10", Write(eq2[3]), run=0.2)
        self.go("5:13.46", FadeIn(k25, scale=1.4), Write(eq2[4]), run=0.3)
        self.play(Create(box(eq2, GRN)), run_time=0.4)


class K02_Magic(Shot):
    def body(self):
        self.title("Now the magic", "5:15.80")
        s = ValueTracker(1.0)
        A = np.array([-6.0, -2.9, 0])
        G = 1.35  # drawing scale; the side numbers stay 2 and 4
        anc = H("ancient mathematicians noticed something incredible...", 42, YEL).move_to([0, 0.4, 0])
        self.go("5:17.66", Write(anc), run=1.4)
        self.go("5:21.30", FadeOut(anc), run=0.4)

        def tri():
            k = s.get_value()
            h, b = 2.0 * k * G, 2.0 * np.sqrt(3) * k * G
            B, C = A + [b, 0, 0], A + [b, h, 0]
            return VGroup(seg(A, B), seg(B, C, PINK, 6), seg(A, C, GRN, 6), right_angle_mark(B, A, C, 0.22),
                          angle_arc(A, B, C, r=0.8, label=r"30^\circ", label_size=36, label_buff=0.5))

        T0 = tri()
        self.go("5:22.10", Create(T0), run=0.9)
        live = always_redraw(tri)
        self.remove(T0)
        self.add(live)
        opp = always_redraw(lambda: M(f"{2 * s.get_value():.1f}", size=42, color=PINK).next_to(A + [2 * np.sqrt(3) * s.get_value() * G, s.get_value() * G, 0], RIGHT, buff=0.2))
        hyp = always_redraw(lambda: M(f"{4 * s.get_value():.1f}", size=42, color=GRN).move_to(A + [(np.sqrt(3) * s.get_value() - 0.3) * G, (s.get_value() + 0.35) * G, 0]))
        self.go("5:26.70", FadeIn(opp), run=0.4)
        self.go("5:27.80", FadeIn(hyp), run=0.4)
        lhs = M(r"\frac{\text{opposite}}{\text{hypotenuse}}", "=", size=50).move_to([1.4, 0.6, 0])
        lhs[0].set_color(PINK)
        mid = always_redraw(lambda: M(r"\frac{" + f"{2 * s.get_value():.1f}" + "}{" + f"{4 * s.get_value():.1f}" + "}", size=50).next_to(lhs, RIGHT, buff=0.25))
        rhs = M("=", "0.5", size=50).move_to([4.9, 0.6, 0])
        rhs[1].set_color(YEL)
        self.go("5:28.92", FadeIn(lhs), FadeIn(mid), run=0.35)
        same = H("always the same number!", 42, YEL).move_to([3.3, -1.0, 0])
        self.go("5:29.84", FadeIn(rhs), Create(box(rhs[1], YEL, buff=0.12)), FadeIn(same, shift=UP * 0.2), run=0.33)
        self.play(s.animate.set_value(1.22), run_time=0.33)
        self.play(s.animate.set_value(0.75), run_time=0.38)


class K02_Names(Shot):
    def body(self):
        self.title("Same angle, same ratio", animate=False)
        A = np.array([-6.0, -2.8, 0])
        tris = VGroup()
        for k, op in ((0.8, 1), (1.3, 0.8), (1.85, 0.6)):
            h, b = 1.9 * k * 0.95, 1.9 * k * 0.95 * np.sqrt(3)
            B, C = A + [b, 0, 0], A + [b, h, 0]
            tris.add(VGroup(seg(A, B, width=4), seg(B, C, PINK, 5), seg(A, C, GRN, 5)).set_opacity(op))
        arc = angle_arc(A, A + RIGHT, A + np.array([np.sqrt(3), 1, 0]), r=0.7, label=r"30^\circ", label_size=34, label_buff=0.45)
        self.go("5:35.80", LaggedStart(*[Create(t) for t in tris], lag_ratio=0.3), Create(arc), run=1.0)
        rat = M(r"\frac{\text{opp}}{\text{hyp}}", "=", r"\frac{1}{2}", size=56).move_to([3.8, 1.2, 0])
        rat[0].set_color(PINK); rat[2].set_color(YEL)
        self.go("5:37.00", Write(rat), run=0.6)
        only = H("depends ONLY on the angle", 40, YEL).move_to([3.7, -0.3, 0])
        self.go("5:38.76", Write(only), run=0.7)
        self.go("5:39.60", Create(Underline(only[7:11], color=ORG, stroke_width=5)), run=0.4)
        self.wipe("5:41.38", run=0.35)
        self.title("Sine, Cosine, Tangent")
        names = VGroup(pill("Sine", PINK, 46), pill("Cosine", BLUE, 46), pill("Tangent", GRN, 46)).arrange(RIGHT, buff=0.7).move_to([0, 0.4, 0])
        for t, n in zip(("5:43.92", "5:44.70", "5:45.64"), names):
            self.go(t, FadeIn(n, scale=0.6), run=0.35)
        # definitions
        g, P = labeled_tri(4.4, 2.9, (-6.2, -2.4, 0), opp=r"\text{opposite}", adj=r"\text{adjacent}", hyp=r"\text{hypotenuse}", size=38)
        P["AC"].set_stroke(GRN, 6); P["BC"].set_stroke(PINK, 6); P["AB"].set_stroke(BLUE, 6)
        self.go("5:46.50", FadeOut(names, shift=UP * 0.3), FadeIn(g), run=0.4)
        eqs = VGroup(M(r"\sin\theta", "=", r"\frac{\text{opposite}}{\text{hypotenuse}}", size=50),
                     M(r"\cos\theta", "=", r"\frac{\text{adjacent}}{\text{hypotenuse}}", size=50),
                     M(r"\tan\theta", "=", r"\frac{\text{opposite}}{\text{adjacent}}", size=50)).arrange(DOWN, aligned_edge=LEFT, buff=0.4).move_to([3.0, -0.55, 0])
        for e, c in zip(eqs, (PINK, BLUE, GRN)):
            e[0].set_color(c)
        pan = panel(eqs, PURP, buff=0.3)
        self.add(pan.set_stroke(opacity=0))
        for e, (t1, t2), side in zip(eqs, (("5:47.04", "5:48.10"), ("5:50.82", "5:52.12"), ("5:55.44", "5:56.76")), ("opp", "adj", "opp")):
            self.go(t1, Write(e[0:2]), run=0.4)
            self.go(t2, Write(e[2]), Indicate(P[side], scale_factor=1.25), run=0.6)
        self.play(pan.animate.set_stroke(PURP, 4, opacity=1), run_time=0.5)


class K02_Soh(Shot):
    def body(self):
        self.title("The Magic Word", "5:59.30")
        spark = VGroup(*[Star(5, outer_radius=0.18, color=YEL, fill_opacity=1).move_to([x, y, 0]) for x, y in ((-3.5, 1.2), (3.6, 1.0), (-2.6, -1.8), (2.9, -1.6))])
        self.go("6:01.14", LaggedStart(*[GrowFromCenter(s) for s in spark], lag_ratio=0.15), run=0.6)
        big = VGroup(Text("SOH", font=HAND, weight=BOLD, font_size=150, color=PINK),
                     Text("CAH", font=HAND, weight=BOLD, font_size=150, color=BLUE),
                     Text("TOA", font=HAND, weight=BOLD, font_size=150, color=GRN)).arrange(RIGHT, buff=0.6).move_to([0, -0.2, 0])
        self.go("6:03.74", Write(big[0]), Write(big[1]), FadeOut(spark), run=0.9)
        self.go("6:05.04", Write(big[2]), run=0.5)
        self.play(Indicate(big, color=YEL, scale_factor=1.08), run_time=0.3)
        heads = VGroup(*[Text(w, font=HAND, weight=BOLD, font_size=96, color=c) for w, c in (("SOH", PINK), ("CAH", BLUE), ("TOA", GRN))])
        for h, x in zip(heads, (-4.5, 0, 4.5)):
            h.move_to([x, 1.3, 0])
        self.go("6:05.88", Transform(big, heads), run=0.35)
        self.remove(big); self.add(heads)
        forms = VGroup(M(r"\sin\theta", "=", r"\frac{\text{opposite}}{\text{hypotenuse}}", size=46),
                       M(r"\cos\theta", "=", r"\frac{\text{adjacent}}{\text{hypotenuse}}", size=46),
                       M(r"\tan\theta", "=", r"\frac{\text{opposite}}{\text{adjacent}}", size=46))
        for f, x, c in zip(forms, (-4.5, 0, 4.5), (PINK, BLUE, GRN)):
            f.move_to([x, -0.4, 0]); f[0].set_color(c)
        letters = (("6:06.30", "6:06.52", "6:06.74"), ("6:10.76", "6:11.06", "6:11.32"), ("6:15.22", "6:15.44", "6:15.72"))
        ftimes = ("6:07.52", "6:12.08", "6:16.86")
        for h, ts, f, ft, c in zip(heads, letters, forms, ftimes, (PINK, BLUE, GRN)):
            for j, t in enumerate(ts):
                self.go(t, h[j].animate(rate_func=there_and_back).scale(1.4).set_color(YEL), run=0.18)
            self.go(ft, Write(f), run=0.9)
        say = H("Say it with me!", 48, YEL).move_to([0, -2.4, 0])
        self.go("6:19.88", Write(say), run=0.5)
        for t, h in zip(("6:21.30", "6:22.56", "6:23.86"), heads):
            self.go(t, Indicate(h, color=YEL, scale_factor=1.3), run=0.5)
        self.go("6:25.02", FadeOut(say), run=0.3)
        words = "Some Old Horse Caught Another Horse Taking Oats Away".split()
        times = ("6:27.36", "6:27.70", "6:28.02", "6:28.32", "6:28.56", "6:28.80", "6:29.20", "6:29.54", "6:29.82")
        ws = VGroup(*[Text(w, font=HAND, font_size=46, color=CHALK) for w in words])
        VGroup(VGroup(*ws[:4]).arrange(RIGHT, buff=0.25), VGroup(*ws[4:]).arrange(RIGHT, buff=0.25)).arrange(DOWN, buff=0.2).move_to([0, -2.55, 0])
        for w in ws:
            w[0].set_color(YEL)
        for w, t in zip(ws, times):
            self.go(t, FadeIn(w, shift=UP * 0.2), run=0.2)
        self.go("6:30.76", Create(box(ws, PURP, buff=0.18)), run=0.5)


class K02_Example(Shot):
    def body(self):
        self.title("Let's try one", "6:32.10")
        g, P = labeled_tri(4.0, 3.0, (-6.3, -2.6, 0), theta=False)
        A, B, C = P["A"], P["B"], P["C"]
        self.go("6:33.84", Create(VGroup(P["AB"], P["BC"], P["AC"], P["mark"])), run=0.9)
        th = angle_arc(A, B, C, r=0.75, label=r"\theta", label_size=46)
        self.go("6:37.54", Create(th[0]), Write(th[1]), run=0.4)
        l3 = M("3", size=48, color=PINK).next_to((B + C) / 2, RIGHT, buff=0.25)
        l4 = M("4", size=48, color=BLUE).next_to((A + B) / 2, DOWN, buff=0.25)
        l5 = M("5", size=48, color=GRN).move_to((A + C) / 2 + np.array([-0.6, 0.8, 0]) * 0.45)
        self.go("6:39.14", P["BC"].animate.set_stroke(PINK, 7), run=0.4)
        self.go("6:40.08", Write(l3), run=0.3)
        self.go("6:41.10", P["AB"].animate.set_stroke(BLUE, 7), run=0.4)
        self.go("6:42.02", Write(l4), run=0.3)
        self.go("6:43.08", P["AC"].animate.set_stroke(GRN, 7), run=0.4)
        self.go("6:43.90", Write(l5), run=0.3)
        rows = VGroup(M(r"\sin\theta", "=", r"\frac{\text{opposite}}{\text{hypotenuse}}", "=", r"\frac{3}{5}", size=48),
                      M(r"\cos\theta", "=", r"\frac{\text{adjacent}}{\text{hypotenuse}}", "=", r"\frac{4}{5}", size=48),
                      M(r"\tan\theta", "=", r"\frac{\text{opposite}}{\text{adjacent}}", "=", r"\frac{3}{4}", size=48)).arrange(DOWN, aligned_edge=LEFT, buff=0.4).move_to([2.8, -0.95, 0])
        for r, c in zip(rows, (PINK, BLUE, GRN)):
            r[0].set_color(c); r[4].set_color(YEL)
        T = (("6:44.88", "6:46.00", "6:48.02", (l3, l5)), ("6:49.46", "6:50.72", "6:52.68", (l4, l5)), ("6:54.12", "6:55.24", "6:56.98", (l3, l4)))
        for r, (t1, t2, t3, ls) in zip(rows, T):
            self.go(t1, Write(r[0:2]), run=0.4)
            self.go(t2, Write(r[2]), run=0.6)
            self.go(t3, Write(r[3:]), *[Indicate(l, scale_factor=1.5) for l in ls], run=0.45)
        b = box(VGroup(*[r[4] for r in rows]), YEL, buff=0.1)
        self.go("6:58.40", Create(b), run=0.4)
        core = H("the core of trigonometry", 44, YEL).move_to([2.8, 1.75, 0])
        self.go("6:59.68", Write(core), run=0.7)
        self.go("7:02.58", Circumscribe(rows, color=PURP, buff=0.15), run=1.0)


class K02_TanRatio(Shot):
    def body(self):
        self.title("One more thing", "7:04.45")
        e1 = M(r"\tan\theta", "=", r"\frac{\sin\theta}{\cos\theta}", size=84).move_to([0, 1.2, 0])
        e1[0].set_color(GRN)
        self.go("7:06.04", Write(e1[0:2]), run=0.4)
        self.go("7:07.02", Write(e1[2]), run=0.7)
        e2 = M(r"\frac{3}{5}", r"\div", r"\frac{4}{5}", "=", r"\frac{3}{4}", size=72).move_to([0, -1.25, 0])
        e2[0].set_color(PINK); e2[2].set_color(BLUE); e2[4].set_color(GRN)
        self.go("7:09.08", Write(e2[0]), run=0.4)
        self.go("7:09.70", Write(e2[1]), Write(e2[2]), run=0.4)
        self.go("7:10.90", Write(e2[3:]), run=0.4)
        nc = H("not a coincidence!", 46, ORG).move_to([0, -3.0, 0])
        self.go("7:12.42", Write(nc), run=0.6)
        self.go("7:13.72", Create(box(e1.copy().scale(1.08), YEL, buff=0.2)), e1.animate.scale(1.08), run=0.6)
        pocket = H("keep it in your pocket", 44, YEL).move_to([0, -3.0, 0])
        self.go("7:16.60", ReplacementTransform(nc, pocket), run=0.5)


class K02_Q1(Shot):
    def body(self):
        self.title("Question 1", "7:20.10")
        u = 0.45
        g, P = labeled_tri(12 * u, 5 * u, (-6.4, -2.0, 0), theta=False)
        A, B, C = P["A"], P["B"], P["C"]
        self.go("7:21.42", Create(VGroup(P["AB"], P["BC"], P["AC"], P["mark"])), run=0.8)
        l13 = M("13", size=48, color=GRN).move_to((A + C) / 2 + np.array([-5, 12, 0]) / 13 * 0.5)
        self.go("7:23.34", P["AC"].animate.set_stroke(GRN, 7), Write(l13), run=0.4)
        th = angle_arc(A, B, C, r=1.0, label=r"\theta", label_size=46, label_buff=0.3)
        self.go("7:25.28", Create(th[0]), Write(th[1]), run=0.4)
        l5 = M("5", size=48, color=PINK).next_to((B + C) / 2, RIGHT, buff=0.25)
        self.go("7:26.04", P["BC"].animate.set_stroke(PINK, 7), Write(l5), run=0.4)
        lq = M("?", size=56, color=BLUE).next_to((A + B) / 2, DOWN, buff=0.25)
        self.go("7:27.82", P["AB"].animate.set_stroke(BLUE, 7), Write(lq), run=0.4)
        tasks = VGroup(TX(r"1)\ adjacent side $= \,?$", 52), TX(r"2)\ $\cos\theta = \,?$", 52), TX(r"3)\ $\tan\theta = \,?$", 52)).arrange(DOWN, aligned_edge=LEFT, buff=0.35).move_to([3.5, 0.9, 0])
        for t, x in zip(("7:28.22", "7:29.54", "7:30.40"), tasks):
            self.go(t, FadeIn(x, shift=LEFT * 0.3), run=0.35)
        bars = VGroup(RoundedRectangle(width=0.32, height=1.1, corner_radius=0.08), RoundedRectangle(width=0.32, height=1.1, corner_radius=0.08)).arrange(RIGHT, buff=0.3)
        bars.set_fill(YEL, 1).set_stroke(width=0)
        ring = Circle(radius=0.95, color=YEL, stroke_width=6)
        pause = VGroup(ring, bars).move_to([1.0, -2.3, 0])
        ptxt = H("Pause and try it!", 44, YEL).next_to(pause, RIGHT, buff=0.3)
        self.go("7:31.78", GrowFromCenter(pause), Write(ptxt), run=0.6)
        self.play(Indicate(pause, color=YEL, scale_factor=1.15), run_time=0.8)


class K02_Q1Ans(Shot):
    def body(self):
        self.title("Let's check", animate=False)
        u = 0.45
        g, P = labeled_tri(12 * u, 5 * u, (-6.6, -2.0, 0), theta=False)
        A, B, C = P["A"], P["B"], P["C"]
        P["AC"].set_stroke(GRN, 7); P["BC"].set_stroke(PINK, 7); P["AB"].set_stroke(BLUE, 7)
        l13 = M("13", size=48, color=GRN).move_to((A + C) / 2 + np.array([-5, 12, 0]) / 13 * 0.5)
        l5 = M("5", size=48, color=PINK).next_to((B + C) / 2, RIGHT, buff=0.25)
        lq = M("?", size=56, color=BLUE).next_to((A + B) / 2, DOWN, buff=0.25)
        th = angle_arc(A, B, C, r=1.0, label=r"\theta", label_size=46, label_buff=0.3)
        self.add(P["AB"], P["BC"], P["AC"], P["mark"], th, l13, l5, lq)
        py = pill("First, Pythagoras", ORG, 38).move_to([3.0, 1.85, 0])
        self.go("7:35.34", FadeIn(py, scale=0.8), run=0.4)
        r1a = M(r"13^2", "=", "169", size=50); r1b = M(r"5^2", "=", "25", size=50)
        r2a = M("169", "-", "25", "=", "144", size=50); r2b = M(r"\sqrt{144}", "=", "12", size=50)
        row1 = VGroup(r1a, r1b).arrange(RIGHT, buff=1.0).move_to([3.0, 0.85, 0])
        row2 = VGroup(r2a, r2b).arrange(RIGHT, buff=0.8).move_to([3.0, -0.2, 0])
        self.go("7:37.42", Write(r1a[0]), run=0.3)
        self.go("7:38.16", Write(r1a[1:]), run=0.35)
        self.go("7:40.32", Write(r1b[0]), run=0.3)
        self.go("7:40.94", Write(r1b[1:]), run=0.3)
        self.go("7:42.50", Write(r2a[0]), run=0.3)
        self.go("7:43.30", Write(r2a[1:3]), run=0.3)
        self.go("7:44.20", Write(r2a[3:]), run=0.35)
        self.go("7:45.92", Write(r2b[0]), run=0.4)
        self.go("7:47.26", Write(r2b[1:]), run=0.35)
        l12 = M("12", size=48, color=BLUE).move_to(lq)
        self.go("7:49.06", ReplacementTransform(r2b[2].copy(), l12), FadeOut(lq), run=0.7)
        self.play(Indicate(l12, scale_factor=1.5), run_time=0.4)
        c = M(r"\cos\theta", "=", r"\frac{\text{adj}}{\text{hyp}}", "=", r"\frac{12}{13}", size=50).move_to([3.0, -1.45, 0])
        t = M(r"\tan\theta", "=", r"\frac{\text{opp}}{\text{adj}}", "=", r"\frac{5}{12}", size=50).move_to([3.0, -2.95, 0])
        c[0].set_color(BLUE); t[0].set_color(GRN); c[4].set_color(YEL); t[4].set_color(YEL)
        self.go("7:50.94", Write(c[0:2]), run=0.35)
        self.go("7:51.78", Write(c[2]), run=0.5)
        self.go("7:54.12", Write(c[3:]), run=0.4)
        self.play(Create(box(c[4], YEL, buff=0.1)), run_time=0.3)
        self.go("7:56.12", Write(t[0:2]), run=0.3)
        self.go("7:56.66", Write(t[2]), run=0.5)
        self.go("7:58.04", Write(t[3:]), run=0.4)
        self.play(Create(box(t[4], YEL, buff=0.1)), run_time=0.3)


# ---------------------------------------------------------------- Chapter 3

class K02_Cousins(Shot):
    def body(self):
        self.title("The Three Cousins", animate=False)
        top = VGroup(pill("sine", PINK, 42), pill("cosine", BLUE, 42), pill("tangent", GRN, 42)).arrange(RIGHT, buff=0.8).move_to([0, 1.5, 0])
        for t, p in zip(("8:08.72", "8:09.70", "8:10.64"), top):
            self.go(t, FadeIn(p, scale=0.6), run=0.3)
        cous = VGroup(*[pill("?", c, 42) for c in (PINK, BLUE, GRN)])
        for p, q in zip(cous, top):
            p.move_to(q.get_center() + DOWN * 1.3)
            p[0].set_stroke(opacity=0.6)
        self.go("8:11.54", LaggedStart(*[FadeIn(p, shift=DOWN * 0.3) for p in cous], lag_ratio=0.2), run=0.6)
        f = M(r"\frac{2}{3}", size=70).move_to([-1.2, -1.5, 0])
        arrow = MathTex(r"\longrightarrow", font_size=70, color=DIM).next_to(f, RIGHT, buff=0.4)
        fl = M(r"\frac{3}{2}", size=70, color=YEL).next_to(arrow, RIGHT, buff=0.4)
        self.go("8:13.62", FadeIn(f), run=0.3)
        flip_to(self, f.copy().move_to(fl), fl, run=0.5)
        self.add(arrow)
        rec = H("reciprocal = flip it!", 42, YEL).move_to([0, -2.9, 0])
        self.go("8:14.80", Write(rec), run=0.6)
        self.wipe("8:15.55", run=0.3)
        rows = VGroup(M(r"\csc\theta", "=", r"\frac{1}{\sin\theta}", "=", r"\frac{\text{hypotenuse}}{\text{opposite}}", size=50),
                      M(r"\sec\theta", "=", r"\frac{1}{\cos\theta}", "=", r"\frac{\text{hypotenuse}}{\text{adjacent}}", size=50),
                      M(r"\cot\theta", "=", r"\frac{1}{\tan\theta}", "=", r"\frac{\text{adjacent}}{\text{opposite}}", size=50)).arrange(DOWN, aligned_edge=LEFT, buff=0.42).move_to([0, -0.5, 0])
        for r, c in zip(rows, (PINK, BLUE, GRN)):
            r[0].set_color(c)
        T = (("8:16.10", "8:16.98", "8:18.74"), ("8:20.74", "8:21.52", "8:23.38"), ("8:25.60", "8:26.42", "8:28.12"))
        for r, (a, b, c) in zip(rows, T):
            self.go(a, Write(r[0:2]), run=0.4)
            self.go(b, Write(r[2]), run=0.5)
            self.go(c, Write(r[3:]), run=0.6)


class K02_CoPairs(Shot):
    def body(self):
        self.title("The funny part", "8:29.90")
        back = H("the names are backwards!", 46, RED).move_to([0, 1.55, 0])
        self.go("8:31.78", Write(back), run=0.7)
        pairs = (("sine", "cosecant", PINK), ("cosine", "secant", BLUE), ("tangent", "cotangent", GRN))
        rows = VGroup()
        for i, (a, b, c) in enumerate(pairs):
            wa = Text(a, font=HAND, font_size=58, color=c)
            wb = Text(b, font=HAND, font_size=58, color=c)
            ar = DoubleArrow(LEFT * 1.0, RIGHT * 1.0, color=DIM, buff=0, stroke_width=4, tip_length=0.22)
            wa.next_to(ar, LEFT, buff=0.4); wb.next_to(ar, RIGHT, buff=0.4)
            rows.add(VGroup(wa, ar, wb).move_to([0, 0.3 - 1.25 * i, 0]))
        self.go("8:34.08", FadeIn(rows[0][2], shift=LEFT * 0.2), run=0.3)
        self.go("8:34.70", GrowFromCenter(rows[0][1]), FadeIn(rows[0][0], shift=RIGHT * 0.2), run=0.4)
        self.go("8:36.08", FadeIn(rows[1][2], shift=LEFT * 0.2), run=0.3)
        self.go("8:36.40", GrowFromCenter(rows[1][1]), FadeIn(rows[1][0], shift=RIGHT * 0.2), run=0.4)
        rule = H("each pair has exactly ONE \"co\"", 44, YEL).move_to([0, 1.55, 0])
        self.go("8:37.98", ReplacementTransform(back, rule), run=0.5)
        cos = [rows[0][2][0:2], rows[1][0][0:2]]
        self.go("8:40.36", *[c.animate.set_color(YEL).scale(1.2) for c in cos], run=0.4)
        self.go("8:41.78", Indicate(rows[0], color=PINK, scale_factor=1.08), run=0.5)
        self.go("8:43.40", Indicate(rows[1], color=BLUE, scale_factor=1.08), run=0.5)
        self.go("8:45.14", FadeIn(rows[2]), run=0.3)
        self.play(rows[2][2][0:2].animate.set_color(YEL).scale(1.2), run_time=0.3)


class K02_Flip345(Shot):
    def body(self):
        self.title("Our 3-4-5 triangle", animate=False)
        g, P = labeled_tri(4 * 0.9, 3 * 0.9, (-6.5, -2.0, 0), opp="3", adj="4", hyp="5", size=50)
        P["AC"].set_stroke(GRN, 6); P["BC"].set_stroke(PINK, 6); P["AB"].set_stroke(BLUE, 6)
        self.go("8:47.38", FadeIn(g), run=0.4)
        L = VGroup(M(r"\sin\theta=\frac{3}{5}", size=58, color=PINK), M(r"\cos\theta=\frac{4}{5}", size=58, color=BLUE), M(r"\tan\theta=\frac{3}{4}", size=58, color=GRN)).arrange(DOWN, buff=0.45, aligned_edge=LEFT).move_to([0.4, -0.4, 0])
        self.play(LaggedStart(*[FadeIn(x) for x in L], lag_ratio=0.25), run_time=0.8)
        R = VGroup(M(r"\csc\theta", "=", r"\frac{5}{3}", size=58), M(r"\sec\theta", "=", r"\frac{5}{4}", size=58), M(r"\cot\theta", "=", r"\frac{4}{3}", size=58))
        for r, l, c in zip(R, L, (PINK, BLUE, GRN)):
            r.next_to(l, RIGHT, buff=1.4); r[0].set_color(c); r[2].set_color(YEL)
        arrows = VGroup(*[Arrow(l.get_right(), r.get_left(), buff=0.2, color=DIM, stroke_width=3, max_tip_length_to_length_ratio=0.2) for l, r in zip(L, R)])
        T = (("8:49.76", "8:50.58"), ("8:51.90", "8:52.62"), ("8:54.06", "8:55.06"))
        for i, (a, b) in enumerate(T):
            self.go(a, GrowArrow(arrows[i]), Write(R[i][0:2]), run=0.4)
            self.at(b)
            flip_to(self, M(L[i].get_tex_string().split("=")[1], size=58, color=L[i].get_color()).move_to(R[i][2]), R[i][2], run=0.45)
        fl = H("just flip them!", 46, YEL).to_edge(DOWN, buff=0.35)
        self.go("8:56.36", Write(fl), run=0.45)
