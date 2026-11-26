"""Chapter 6: the unit circle (14:36 - 20:24)."""
from common import *

# shared tex_cache races between parallel renders (PermissionError / broken .xdv): private dir per process

C0 = np.array([-3.3, -0.85, 0])  # circle centre for most shots
R0 = 2.3


def col(items, x=0.5, top=1.7, buff=0.32):
    """Stack mobjects down a column, left-aligned at x."""
    g = VGroup(*items).arrange(DOWN, aligned_edge=LEFT, buff=buff)
    g.move_to([x, top, 0], aligned_edge=UL)
    return g


def uc(scene, th, c=C0, r=R0, parts=("dot",), arc=True, theta_label=True):
    """Unit circle driven by tracker th (degrees). Returns dict of live parts; nothing is added to the scene."""
    c = np.array(c, float)
    P = lambda: on_circle(np.radians(th.get_value()), r, c)
    d = dict(base=unit_circle(r, c, axis_len=r + 0.65), P=P)
    d["dot"] = always_redraw(lambda: VGroup(Dot(P(), radius=0.2, color=YEL, fill_opacity=0.18), Dot(P(), radius=0.1, color=YEL)))
    d["radius"] = always_redraw(lambda: Line(c, P(), color=GRN, stroke_width=5))
    d["xseg"] = always_redraw(lambda: Line(c, [P()[0], c[1], 0], color=BLUE, stroke_width=8))
    d["yseg"] = always_redraw(lambda: Line([P()[0], c[1], 0], P(), color=PINK, stroke_width=8))
    d["drop"] = always_redraw(lambda: DashedLine(P(), [P()[0], c[1], 0], color=PINK, stroke_width=3, dash_length=0.1))
    d["arc"] = always_redraw(lambda: Arc(radius=0.55, start_angle=0, angle=max(np.radians(th.get_value()), 1e-3) if th.get_value() >= 0 else min(np.radians(th.get_value()), -1e-3),
                                         arc_center=c, color=YEL, stroke_width=4))
    lab = M(r"\theta", size=44, color=YEL)

    def place(m):
        a = np.radians(th.get_value()) / 2
        m.move_to(c + 0.95 * np.array([np.cos(a), np.sin(a), 0]))
    lab.add_updater(place)
    place(lab)
    d["theta"] = lab
    return d


def ref_arc(th, c=C0, r=0.95):
    """Orange arc between the terminal side and the nearest x-axis."""
    def mk():
        a = th.get_value() % 360
        if a <= 90:
            s, e = 0, a
        elif a <= 180:
            s, e = a, 180
        elif a <= 270:
            s, e = 180, a
        else:
            s, e = a, 360
        return Arc(radius=r, start_angle=np.radians(s), angle=max(np.radians(e - s), 1e-3), arc_center=c, color=ORG, stroke_width=7)
    return always_redraw(mk)


def point_label(tex, P, c=C0, size=40, color=CHALK, dist=0.75):
    m = M(tex, size=size, color=color)

    def place(mob):
        p = P()
        v = p - c
        v = v / (np.linalg.norm(v) + 1e-9)
        mob.move_to(p + v * (dist + 0.25 * abs(v[0]) * mob.width))
    m.add_updater(place)
    place(m)
    return m


def pause_icon(color=YEL):
    c = Circle(radius=0.6, color=color, stroke_width=6)
    b = VGroup(*[RoundedRectangle(width=0.16, height=0.6, corner_radius=0.06, fill_color=color, fill_opacity=1, stroke_width=0).shift(RIGHT * s * 0.17) for s in (-1, 1)])
    return VGroup(c, b)


class K04_Stuck(Shot):
    def body(self):
        self.title("Beyond 90°", "14:39.0")
        t = right_triangle(b=4.0, h=2.6, origin=(-6.0, -2.4, 0))
        A, B, C = t["A"], t["B"], t["C"]
        th = angle_arc(A, B, C, r=0.9, label=r"\theta")
        tri = VGroup(t["tri"], t["mark"])
        self.go("14:39.5", Create(tri), run=0.7)
        self.play(FadeIn(th), run_time=0.4)
        rng = M(r"0^\circ", "<", r"\theta", "<", r"90^\circ", size=54).next_to(tri, UP, buff=0.5)
        rng[2].set_color(YEL)
        self.go("14:40.72", Write(rng), run=0.9)
        self.go("14:43.74", Indicate(tri, color=GRN, scale_factor=1.05), run=0.8)
        q1 = M(r"\sin 150^\circ", "=", r"\text{?}", size=72).move_to([3.0, 0.9, 0])
        q2 = M(r"\cos 300^\circ", "=", r"\text{?}", size=72).move_to([3.0, -0.8, 0])
        q1[0].set_color(PINK); q2[0].set_color(BLUE)
        q1[2].set_color(YEL); q2[2].set_color(YEL)
        self.go("14:46.38", Write(q1), run=0.8)
        self.go("14:49.62", Write(q2), run=0.8)
        x = cross_mark(RED, 0.7).move_to(tri.get_center() + DOWN * 0.3)
        self.go("14:52.30", Create(x), run=0.5)
        note = H("a right triangle can't have these angles", 34, RED).next_to(tri, DOWN, buff=0.35)
        note.shift(RIGHT * (-6.4 - note.get_left()[0]))
        self.play(FadeIn(note), run_time=0.4)
        self.go("14:54.84", Indicate(q1, color=YEL), Indicate(q2, color=YEL), run=0.8)
        circ = Circle(radius=1.7, color=CHALK, stroke_width=5).move_to(tri.get_center() + UP * 0.2)
        self.go("14:57.52", FadeOut(x), FadeOut(note), FadeOut(th), FadeOut(rng), run=0.3)
        self.play(ReplacementTransform(tri, circ), run_time=1.3)
        lab = VGroup(H("triangle", 40, DIM), Arrow(LEFT, RIGHT, color=YEL, stroke_width=5).scale(0.6), H("circle", 44, YEL)).arrange(RIGHT, buff=0.25).next_to(circ, DOWN, buff=0.35)
        self.go("14:59.6", FadeIn(lab, shift=UP * 0.2), run=0.5)


class K04_Circle(Shot):
    def body(self):
        self.title("The Unit Circle", "15:00.9")
        th = ValueTracker(0)
        d = uc(self, th)
        ax, circ, ticks = d["base"][0], d["base"][1], d["base"][2:]
        self.go("15:01.2", Create(ax), run=0.6)
        self.go("15:01.5", Create(circ), run=1.0)
        o = Dot(C0, radius=0.07, color=CHALK)
        ol = M("(0,0)", size=36, color=DIM).next_to(C0, DL, buff=0.1)
        self.go("15:02.84", FadeIn(o, scale=2), run=0.4)
        self.go("15:04.5", Write(ol), run=0.6)
        rad = Line(C0, C0 + RIGHT * R0, color=GRN, stroke_width=5)
        one = M("1", size=44, color=GRN).next_to(rad, UP, buff=0.12)
        self.go("15:07.26", Create(rad), run=0.6)
        self.go("15:07.9", FadeIn(one), FadeIn(ticks), run=0.4)
        note = col([pill("radius = 1", GRN, 40), H("so we call it the unit circle", 36)], x=0.9, top=1.8, buff=0.3)
        self.go("15:09.2", FadeIn(note[0], shift=DOWN * 0.1), run=0.4)
        self.go("15:10.16", Write(note[1]), run=0.7)
        start = M("(1,0)", size=40).next_to(C0 + RIGHT * R0, DR, buff=0.12)
        self.go("15:11.98", FadeIn(d["dot"]), FadeOut(rad), FadeOut(one), run=0.4)
        self.go("15:12.48", Write(start), run=0.5)
        self.add(d["arc"], d["theta"])
        rot = H("rotate counterclockwise", 34, YEL).move_to([0.9, 0.35, 0], aligned_edge=LEFT)
        self.go("15:15.08", th.animate.set_value(52), FadeIn(rot), FadeOut(start), run=2.0)
        self.go("15:18.5", Flash(d["P"](), color=YEL, flash_radius=0.4), run=0.6)
        self.go("15:20.2", FadeOut(note), FadeOut(rot), run=0.4)
        self.add(d["drop"])
        self.go("15:21.10", Create(d["xseg"]), run=0.6)
        ex = M("x", "=", r"\cos\theta", size=80).move_to([3.0, 1.2, 0])
        ex[0].set_color(BLUE); ex[2].set_color(BLUE)
        self.go("15:21.74", Write(ex[0]), run=0.4)
        self.go("15:23.36", Write(ex[1:]), run=0.7)
        self.go("15:25.38", Create(d["yseg"]), run=0.6)
        ey = M("y", "=", r"\sin\theta", size=80).move_to([3.0, -0.3, 0])
        ey[0].set_color(PINK); ey[2].set_color(PINK)
        self.go("15:25.50", Write(ey[0]), run=0.4)
        self.go("15:26.54", Write(ey[1:]), run=0.7)
        self.go("15:28.98", Circumscribe(ex, color=BLUE), run=0.9)
        self.go("15:30.44", Circumscribe(ey, color=PINK), run=0.9)
        pl = point_label(r"(\cos\theta,\ \sin\theta)", d["P"], size=40, color=YEL)
        big = M(r"(\cos\theta,\ \sin\theta)", size=64, color=YEL).move_to([3.0, -2.0, 0])
        self.go("15:31.94", Indicate(d["dot"], scale_factor=1.6, color=YEL), run=0.6)
        self.go("15:33.70", Write(pl), Write(big), run=0.9)
        self.go("15:34.70", th.animate.set_value(128), run=1.5)


class K04_Why(Shot):
    def body(self):
        th = ValueTracker(40)
        d = uc(self, th)
        self.add(d["base"], d["dot"], d["arc"], d["theta"])
        self.title("Why does this work?", "15:36.4")
        self.go("15:38.16", Create(d["radius"]), run=0.8)
        P = d["P"]()
        hyp = M(r"\text{hypotenuse}", "=1", size=38, color=GRN).move_to(side_label(C0, P, r"\text{hypotenuse}=1", GRN, 38, side=1))
        hyp1 = hyp[1]
        self.go("15:40.86", FadeIn(hyp[0]), run=0.4)
        self.go("15:42.04", FadeIn(hyp1), run=0.3)
        self.go("15:43.46", Create(d["drop"]), run=0.8)
        foot = np.array([P[0], C0[1], 0])
        mark = right_angle_mark(foot, C0, P, size=0.22)
        tri = Polygon(C0, foot, P, stroke_width=0, fill_color=YEL, fill_opacity=0.12)
        self.go("15:46.6", FadeIn(tri), Create(mark), run=0.5)
        xl = M("x", size=46, color=BLUE).next_to(Line(C0, foot), DOWN, buff=0.18)
        yl = M("y", size=46, color=PINK).next_to(Line(foot, P), RIGHT, buff=0.15)
        self.go("15:48.36", Create(d["xseg"]), run=0.5)
        self.go("15:49.0", FadeIn(xl), run=0.3)
        self.go("15:50.16", Create(d["yseg"]), run=0.5)
        self.go("15:50.9", FadeIn(yl), run=0.3)
        self.go("15:52.1", Indicate(hyp, color=GRN), run=0.6)
        cos_ = M(r"\cos\theta", "=", r"\frac{x}{1}", "=", "x", size=66).move_to([0.6, 1.3, 0], aligned_edge=LEFT)
        sin_ = M(r"\sin\theta", "=", r"\frac{y}{1}", "=", "y", size=66).move_to([0.6, -0.3, 0], aligned_edge=LEFT)
        tan_ = M(r"\tan\theta", "=", r"\frac{y}{x}", "=", r"\text{slope}", size=66).move_to([0.6, -1.95, 0], aligned_edge=LEFT)
        for e, cc in ((cos_, BLUE), (sin_, PINK), (tan_, GRN)):
            e[0].set_color(cc)
        cos_[4].set_color(BLUE); sin_[4].set_color(PINK); tan_[4].set_color(GRN)
        self.go("15:54.0", Write(cos_[:3]), run=0.8)
        self.go("15:55.88", Write(cos_[3:]), run=0.5)
        self.go("15:57.4", Write(sin_[:3]), run=0.8)
        self.go("15:59.22", Write(sin_[3:]), run=0.5)
        self.go("16:01.66", Write(tan_[:1]), run=0.4)
        self.go("16:02.22", Write(tan_[1:3]), run=0.6)
        u = (P - C0) / np.linalg.norm(P - C0)
        ext = DashedLine(C0 - u * 0.8, C0 + u * 3.7, color=GRN, stroke_width=3)
        self.go("16:04.1", Create(ext), Write(tan_[3:]), run=0.8)
        self.play(Circumscribe(tan_, color=GRN), run_time=0.9)


class K04_Walk(Shot):
    def body(self):
        c = np.array([-3.7, -0.85, 0])
        th = ValueTracker(0)
        d = uc(self, th, c=c)
        self.add(d["base"])
        self.title("Walk around the circle", "16:06.4")
        self.go("16:07.0", FadeIn(d["dot"]), run=0.3)
        self.add(d["arc"])
        xs = [0.15, 1.85, 3.85, 5.55]
        hdr = VGroup(*[M(s, size=44, color=cc).move_to([x, 1.75, 0]) for s, cc, x in zip([r"\theta", r"\text{point}", r"\cos", r"\sin"], [YEL, CHALK, BLUE, PINK], xs)])
        line = Line([-0.6, 1.4, 0], [6.5, 1.4, 0], color=FAINT, stroke_width=3)
        self.go("16:07.3", FadeIn(hdr), Create(line), run=0.5)
        rows = [("0^\\circ", "(1,0)", "1", "0", ["16:08.58", "16:09.76", "16:11.18", "16:12.92"], 0, "16:08.42"),
                ("90^\\circ", "(0,1)", "0", "1", ["16:14.72", "16:16.78", "16:17.70", "16:19.52"], 90, "16:14.52"),
                ("180^\\circ", "(-1,0)", "-1", "0", ["16:20.76", "16:23.46", "16:25.10", "16:26.78"], 180, "16:20.50"),
                ("270^\\circ", "(0,-1)", "0", "-1", ["16:28.26", "16:31.44", "16:33.30", "16:34.88"], 270, "16:28.04")]
        coord = None
        for k, (a, p, cv, sv, ts, ang, t0) in enumerate(rows):
            y = 0.85 - k * 0.85
            cells = [M(s, size=46, color=cc).move_to([x, y, 0]) for s, cc, x in zip([a, p, cv, sv], [YEL, CHALK, BLUE, PINK], xs)]
            for j, (cell, t) in enumerate(zip(cells, ts)):
                if j == 0 and ang:
                    self.go(t0, th.animate.set_value(ang), Write(cell), run=0.8)
                    continue
                if cell is cells[1]:
                    new = M(p, size=40, color=CHALK)
                    P = d["P"]()
                    v = (P - c) / np.linalg.norm(P - c)
                    new.move_to(P + v * (0.55 + 0.35 * abs(v[0])) + (RIGHT * 0.6 if abs(v[0]) < 0.3 else ORIGIN))
                    self.go(t, Write(cell), FadeIn(new) if coord is None else ReplacementTransform(coord, new), run=0.5)
                    coord = new
                else:
                    self.go(t, Write(cell), run=0.45)
        q = M(r"\tan 90^\circ", "=", r"\frac{y}{x}", "=", r"\frac{1}{0}", size=60).move_to([3.0, -2.75, 0])
        q[0].set_color(GRN)
        self.go("16:36.46", th.animate.set_value(90), FadeOut(coord), run=1.0)
        self.go("16:37.6", Write(q[:3]), run=0.6)
        self.go("16:38.84", Write(q[3:]), run=0.5)


class K04_Quad(Shot):
    def body(self):
        u = M(r"\tan 90^\circ", "=", r"\frac{1}{0}", size=96).move_to([-1.2, 0.2, 0])
        u[0].set_color(GRN)
        self.add(u)
        und = TX("undefined", size=96, color=RED).next_to(u, DOWN, buff=0.5)
        self.go("16:43.7", Write(und), run=0.6)
        self.play(Create(box(und, RED)), run_time=0.4)
        self.wipe("16:45.1", run=0.3)
        self.title("The Four Quadrants")
        th = ValueTracker(45)
        d = uc(self, th)
        self.play(FadeIn(d["base"]), run_time=0.5)
        cols = [GRN, PINK, BLUE, ORG]
        fills, labs = VGroup(), VGroup()
        for k in range(4):
            fills.add(AnnularSector(inner_radius=0, outer_radius=R0, angle=PI / 2, start_angle=k * PI / 2, arc_center=C0, fill_color=cols[k], fill_opacity=0.14, stroke_width=0))
            labs.add(M(["I", "II", "III", "IV"][k], size=56, color=cols[k]).move_to(C0 + 1.35 * np.array([np.cos(PI / 4 + k * PI / 2), np.sin(PI / 4 + k * PI / 2), 0])))
        for k, t in enumerate(["16:48.62", "16:50.56", "16:52.70", "16:54.66"]):
            self.go(t, FadeIn(fills[k]), Write(labs[k]), run=0.5)
        signs = [("(+,+)", "16:58.20"), ("(-,+)", "17:03.50"), ("(-,-)", "17:09.90"), ("(+,-)", "17:16.90")]
        sl = VGroup(*[M(s, size=40, color=cols[k]).move_to(C0 + 2.0 * np.array([np.cos(PI / 4 + k * PI / 2), np.sin(PI / 4 + k * PI / 2), 0]) * 1.48) for k, (s, _) in enumerate(signs)])
        right = [M(r"\text{I}:", r"\text{ all positive}", size=46),
                 M(r"\text{II}:", r"\text{ only }", r"\sin", r"\text{ positive}", size=46),
                 M(r"\text{III}:", r"\ \tan=\frac{-}{-}=+", size=46),
                 M(r"\text{IV}:", r"\text{ only }", r"\cos", r"\text{ positive}", size=46)]
        right[1][2].set_color(PINK); right[3][2].set_color(BLUE); right[2][1].set_color(GRN)
        for k, r in enumerate(right):
            r[0].set_color(cols[k])
        rc = col(right, x=0.6, top=1.75, buff=0.42)
        ins = [("16:56.94", "17:00.48"), ("17:02.32", "17:06.26"), ("17:08.22", "17:11.62"), ("17:15.22", "17:19.86")]
        for k, ((t1, t2), (_, ts)) in enumerate(zip(ins, signs)):
            an = [th.animate.set_value(45 + 90 * k), FadeIn(rc[k][0])] + ([FadeIn(d["dot"])] if k == 0 else [])
            self.go(t1, *an, run=0.6)
            self.go(ts, Write(sl[k]), run=0.5)
            self.go(t2, Write(rc[k][1:]), run=0.7)
        self.go("17:22.32", FadeOut(rc), FadeOut(d["dot"]), run=0.4)
        phrase = VGroup(*[TX(w, size=60, color=cc) for w, cc in zip(["All", "Students", "Take", "Calculus"], cols)]).arrange(RIGHT, buff=0.28).move_to([3.7, 1.2, 0])
        if phrase.width > 6.3:
            phrase.width = 6.3
            phrase.move_to([3.7, 1.2, 0])
        for w, t in zip(phrase, ["17:25.00", "17:25.18", "17:25.58", "17:25.94"]):
            self.go(t, FadeIn(w, shift=UP * 0.15), run=0.18)
        letters = ["A", "S", "T", "C"]
        names = [r"\text{all}", r"\sin", r"\tan", r"\cos"]
        big = VGroup()
        expl = VGroup()
        for k in range(4):
            L = TX(letters[k], size=96, color=cols[k]).move_to(labs[k])
            big.add(L)
            expl.add(M(letters[k], r"\to", names[k], r"\text{ in }", ["I", "II", "III", "IV"][k], size=46, color=cols[k]))
        ec = col(list(expl), x=1.6, top=0.3, buff=0.28)
        for k, t in enumerate(["17:27.22", "17:29.46", "17:32.18", "17:34.84"]):
            self.go(t, ReplacementTransform(labs[k], big[k]), Indicate(phrase[k], color=cols[k]), FadeIn(ec[k]), run=0.6)


class K04_Ref150(Shot):
    def body(self):
        th = ValueTracker(150)
        d = uc(self, th)
        self.add(d["base"])
        self.title("The Reference Angle", "17:38.2")
        self.go("17:42.78", FadeIn(d["dot"]), Create(d["radius"]), run=0.6)
        self.add(d["arc"])
        ra = ref_arc(th)
        self.go("17:43.80", Create(ra), run=0.6)
        defn = col([H("reference angle =", 38, ORG), H("the acute angle between the", 34), H("terminal side and the x-axis", 34)], x=0.4, top=1.8, buff=0.12)
        self.play(FadeIn(defn), run_time=0.5)
        r1 = M(r"\text{ref angle}", r"\to", r"\text{size}", size=46).next_to(defn, DOWN, buff=0.45, aligned_edge=LEFT)
        r2 = M(r"\text{quadrant}", r"\to", r"\text{sign } (\pm)", size=46).next_to(r1, DOWN, buff=0.3, aligned_edge=LEFT)
        r1[0].set_color(ORG); r2[0].set_color(YEL)
        self.go("17:47.56", Write(r1), run=0.7)
        self.go("17:49.64", Write(r2), run=0.7)
        self.wipe("17:51.6", keep=[d["base"], d["dot"], d["arc"], d["radius"], ra], run=0.3)
        steps = [M(r"\sin 150^\circ", "=", r"\text{?}", size=56),
                 M(r"150^\circ", r"\text{ is in quadrant II}", size=46),
                 M(r"180^\circ-150^\circ=30^\circ", size=46),
                 M(r"\text{ref angle}=30^\circ", size=46, color=ORG),
                 M(r"\sin 30^\circ=\tfrac{1}{2}", size=46),
                 M(r"\text{II}: \sin \text{ is positive}", size=46),
                 M(r"\sin 150^\circ", "=", r"+\tfrac{1}{2}", size=60)]
        steps[0][0].set_color(PINK); steps[6][0].set_color(PINK); steps[6][2].set_color(GRN)
        sc = col(steps, x=0.4, top=1.85, buff=0.22)
        lab150 = M(r"150^\circ", size=40, color=YEL).move_to(C0 + np.array([0.45, 0.75, 0]))
        lab30 = M(r"30^\circ", size=40, color=ORG).move_to(C0 + 1.45 * np.array([np.cos(np.radians(165)), np.sin(np.radians(165)), 0]))
        times = ["17:52.04", "17:54.84", "17:57.14", "17:59.80", "18:01.94", "18:04.12", "18:06.96"]
        for k, (s, t) in enumerate(zip(sc, times)):
            extra = []
            if k == 1:
                extra = [Indicate(d["dot"], color=YEL)]
            if k == 2:
                extra = [FadeIn(lab150)]
            if k == 3:
                extra = [FadeIn(lab30), Indicate(ra, color=ORG)]
            self.go(t, Write(s), *extra, run=0.6)
        self.play(Create(box(sc[6], GRN)), run_time=0.4)


class K04_Ref210(Shot):
    def body(self):
        th = ValueTracker(210)
        d = uc(self, th)
        ra = ref_arc(th)
        self.add(d["base"], d["dot"], d["radius"], d["arc"])
        self.add(ra)
        self.title("Cosine of 210°", animate=False)
        A = [M(r"\cos 210^\circ", "=", r"\text{?}", size=56),
             M(r"210^\circ", r"\text{ is in quadrant III}", size=46),
             M(r"210^\circ-180^\circ=30^\circ", size=46),
             M(r"\text{ref angle}=30^\circ", size=46, color=ORG),
             M(r"\cos 30^\circ=\tfrac{\sqrt3}{2}", size=46),
             M(r"\text{III}: \cos \text{ is negative}", size=46),
             M(r"\cos 210^\circ", "=", r"-\tfrac{\sqrt3}{2}", size=60)]
        A[0][0].set_color(BLUE); A[6][0].set_color(BLUE); A[6][2].set_color(GRN)
        ac = col(A, x=0.4, top=1.85, buff=0.2)
        self.go("18:10.46", Write(ac[0]), run=0.6)
        for s, t in zip(ac[1:], ["18:13.54", "18:15.54", "18:18.20", "18:20.48", "18:23.12", "18:26.48"]):
            self.go(t, Write(s), run=0.6)
        bx = box(ac[6], GRN)
        self.play(Create(bx), run_time=0.4)
        self.go("18:28.5", FadeOut(ac), FadeOut(bx), run=0.3)
        self.title("Tangent of 315°", animate=True)
        self.go("18:29.3", th.animate.set_value(315), run=0.65)
        B = [M(r"\tan 315^\circ", "=", r"\text{?}", size=56),
             M(r"\text{quadrant IV}", size=46),
             M(r"360^\circ-315^\circ=45^\circ", size=46),
             M(r"\tan 45^\circ=1", size=46),
             M(r"\text{IV}: \tan \text{ is negative}", size=46),
             M(r"\tan 315^\circ", "=", "-1", size=60)]
        B[0][0].set_color(GRN); B[5][0].set_color(GRN); B[5][2].set_color(GRN)
        bc = col(B, x=0.4, top=1.85, buff=0.26)
        self.go("18:30.0", Write(bc[0]), run=0.6)
        for s, t in zip(bc[1:], ["18:32.20", "18:33.62", "18:37.06", "18:39.50", "18:41.94"]):
            self.go(t, Write(s), run=0.6)
        self.play(Create(box(bc[5], GRN)), run_time=0.4)


class K04_Spin(Shot):
    def body(self):
        th = ValueTracker(0)
        d = uc(self, th)
        self.add(d["base"], d["dot"], d["radius"])
        self.title("Bigger than 360°?", "18:44.0")

        def spiral():
            a = th.get_value()
            if a <= 0.5:
                return VMobject()
            ts = np.linspace(0, np.radians(a), max(8, int(a / 3)))
            rr = 0.45 + 0.12 * ts / TAU
            return VMobject(stroke_color=YEL, stroke_width=4).set_points_smoothly(np.column_stack([C0[0] + rr * np.cos(ts), C0[1] + rr * np.sin(ts), np.zeros(ts.size)]))
        sp = always_redraw(spiral)
        self.add(sp)
        lab = always_redraw(lambda: H(f"angle = {int(round(th.get_value()))}°", 60, YEL).move_to([3.4, 1.6, 0]))
        self.go("18:46.42", FadeIn(lab), run=0.3)
        self.go("18:47.56", th.animate.set_value(750), run=2.8, rate_func=smooth)
        e1 = M(r"750^\circ", "=", r"720^\circ", "+", r"30^\circ", size=60).move_to([3.4, 0.5, 0])
        e1[4].set_color(ORG)
        self.go("18:50.46", Write(e1[:3]), run=0.6)
        self.go("18:51.88", Write(e1[3:]), run=0.4)
        n2 = H("two full turns + 30°", 36, DIM).next_to(e1, DOWN, buff=0.25)
        self.play(FadeIn(n2), run_time=0.3)
        ghost = DashedLine(C0, on_circle(np.radians(30), R0, C0), color=ORG, stroke_width=4)
        self.go("18:53.28", Create(ghost), Flash(d["P"](), color=ORG), run=0.7)
        cot = pill("coterminal angles", ORG, 42).move_to([3.4, -1.3, 0])
        self.go("18:56.30", FadeIn(cot, scale=0.8), run=0.5)
        e2 = M(r"\sin 750^\circ", "=", r"\sin 30^\circ", "=", r"\tfrac{1}{2}", size=56).move_to([3.4, -2.6, 0])
        e2[0].set_color(PINK)
        self.go("18:58.28", Write(e2[:1]), run=0.5)
        self.go("18:59.6", Write(e2[1:]), run=0.7)
        lab.clear_updaters()
        self.go("19:00.9", FadeOut(VGroup(e1, n2, ghost, cot, e2, lab, sp)), run=0.4)
        th.set_value(0)
        self.title("Negative angles", animate=True)
        cw = H("negative = rotate clockwise", 40, ORG).move_to([3.4, 1.6, 0])
        arc = always_redraw(lambda: Arc(radius=0.6, start_angle=0, angle=min(np.radians(th.get_value()), -1e-3), arc_center=C0, color=ORG, stroke_width=5).add_tip(tip_length=0.18, tip_width=0.18))
        self.go("19:02.48", Write(cw), run=0.7)
        self.add(arc)
        self.go("19:04.10", th.animate.set_value(-45), run=1.2)
        m45 = M(r"-45^\circ", size=44, color=ORG).move_to(C0 + np.array([1.6, -0.45, 0]))
        self.go("19:05.52", FadeIn(m45), run=0.4)
        q4 = M(r"\text{quadrant IV}", size=48).move_to([3.4, 0.5, 0])
        self.go("19:07.38", Write(q4), run=0.6)
        g315 = DashedVMobject(Arc(radius=1.05, start_angle=0, angle=np.radians(315), arc_center=C0, color=YEL, stroke_width=3), num_dashes=40)
        s315 = M(r"\text{same spot as }", r"315^\circ", size=48).move_to([3.4, -0.6, 0])
        s315[1].set_color(YEL)
        self.go("19:08.90", Create(g315), Write(s315), run=0.9)
        e3 = M(r"\cos(-45^\circ)", "=", r"\tfrac{\sqrt2}{2}", size=60).move_to([3.4, -2.1, 0])
        e3[0].set_color(BLUE)
        self.go("19:11.06", Write(e3[0]), run=0.6)
        self.go("19:12.98", Write(e3[1:]), run=0.6)
        self.play(Create(box(e3, GRN)), run_time=0.4)


def practice_list(x=-6.4, top=1.85):
    qs = [M(r"1.\ \cos 120^\circ", size=54), M(r"2.\ \sin 240^\circ", size=54), M(r"3.\ \tan 135^\circ", size=54), M(r"4.\ \sin(-90^\circ)", size=54)]
    g = col(qs, x=x, top=top, buff=0.55)
    return g


ANS = [r"=-\tfrac{1}{2}", r"=-\tfrac{\sqrt3}{2}", r"=-1", r"=-1"]


def practice_panel(qs):
    """Panel sized for the questions plus the answers written after them."""
    ans = VGroup(*[M(ANS[k], size=54).next_to(qs[k], RIGHT, buff=0.2) for k in range(4)])
    return panel(VGroup(qs, ans), PURP, buff=0.3)


class K04_Practice(Shot):
    def body(self):
        self.title("Find these", animate=False)
        qs = practice_list()
        pan = practice_panel(qs)
        self.add(pan)
        for q, t in zip(qs, ["19:17.94", "19:21.30", "19:27.14", "19:30.80"]):
            self.go(t, Write(q), run=0.7)
            if q is qs[1]:
                self.go("19:24.26", Indicate(qs[1], color=YEL), run=0.8)
        pi_ = pause_icon().move_to([3.2, 0.3, 0])
        pt = H("Pause now!", 54, YEL).next_to(pi_, DOWN, buff=0.3)
        self.go("19:32.42", FadeIn(pi_, scale=0.6), Write(pt), run=0.6)
        self.go("19:34.2", FadeOut(pi_), FadeOut(pt), run=0.3)
        S1 = [M(r"120^\circ", r"\text{ is in quadrant II}", size=46), M(r"\text{ref angle}=60^\circ", size=46, color=ORG),
              M(r"\cos 60^\circ=\tfrac{1}{2}", size=46), M(r"\text{II}: \cos \text{ is negative}", size=46)]
        s1 = col(S1, x=0.6, top=1.7, buff=0.32)
        self.go("19:34.42", Indicate(qs[0], color=YEL), run=0.6)
        for s, t in zip(s1, ["19:35.42", "19:37.48", "19:39.22", "19:41.62"]):
            self.go(t, Write(s), run=0.6)
        a1 = M(ANS[0], size=54, color=GRN).next_to(qs[0], RIGHT, buff=0.2)
        self.go("19:43.88", Write(a1), run=0.6)
        self.go("19:45.2", FadeOut(s1), run=0.3)
        S2 = [M(r"240^\circ", r"\text{ is in quadrant III}", size=46), M(r"\text{ref angle}=60^\circ", size=46, color=ORG),
              M(r"\sin 60^\circ=\tfrac{\sqrt3}{2}", size=46), M(r"\text{III}: \sin \text{ is negative}", size=46)]
        s2 = col(S2, x=0.6, top=1.7, buff=0.32)
        self.go("19:45.58", Indicate(qs[1], color=YEL), run=0.6)
        for s, t in zip(s2, ["19:47.08", "19:48.82", "19:50.44", "19:53.34"]):
            self.go(t, Write(s), run=0.6)
        a2 = M(ANS[1], size=54, color=GRN).next_to(qs[1], RIGHT, buff=0.2)
        self.go("19:55.68", Write(a2), run=0.6)


class K04_Answers(Shot):
    def body(self):
        self.title("Find these", animate=False)
        qs = practice_list()
        pan = practice_panel(qs)
        a = [M(ANS[k], size=54, color=GRN).next_to(qs[k], RIGHT, buff=0.2) for k in range(4)]
        self.add(pan, qs, a[0], a[1])
        S3 = [M(r"135^\circ", r"\text{ is in quadrant II}", size=46), M(r"\text{ref angle}=45^\circ", size=46, color=ORG),
              M(r"\text{II}: \tan \text{ is negative}", size=46)]
        s3 = col(S3, x=0.6, top=1.7, buff=0.32)
        self.go("19:57.76", Indicate(qs[2], color=YEL), run=0.6)
        for s, t in zip(s3, ["19:58.74", "20:00.66", "20:02.82"]):
            self.go(t, Write(s), run=0.6)
        self.go("20:04.68", Write(a[2]), run=0.6)
        self.go("20:05.5", FadeOut(s3), run=0.3)
        c = np.array([3.6, -0.6, 0])
        th = ValueTracker(0)
        d = uc(self, th, c=c, r=1.7)
        self.go("20:05.80", Indicate(qs[3], color=YEL), FadeIn(d["base"]), FadeIn(d["dot"]), run=0.6)
        arc = always_redraw(lambda: Arc(radius=0.5, start_angle=0, angle=min(np.radians(th.get_value()), -1e-3), arc_center=c, color=ORG, stroke_width=5).add_tip(tip_length=0.16, tip_width=0.16))
        self.add(arc)
        self.go("20:07.88", th.animate.set_value(-90), run=1.4)
        pt = M("(0,-1)", size=44, color=YEL).next_to(on_circle(-PI / 2, 1.7, c), RIGHT, buff=0.2)
        self.go("20:12.42", Write(pt), run=0.6)
        self.go("20:14.54", Write(a[3]), run=0.6)
        done = VGroup(tick_mark(GRN, 0.8), H("unit circle: mastered!", 44, GRN)).arrange(RIGHT, buff=0.25).move_to([3.6, -3.3, 0])
        self.go("20:17.84", FadeIn(done, shift=UP * 0.2), run=0.5)
