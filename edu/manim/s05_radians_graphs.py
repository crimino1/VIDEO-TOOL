"""Builder 05: Chapter 7 (Radians) and Chapter 8 (Graphs), 20:24.24 - 26:55.70."""
from common import *



def pause_icon(color=YEL):
    c = Circle(radius=0.5, color=color, stroke_width=5)
    bars = VGroup(*[RoundedRectangle(width=0.14, height=0.46, corner_radius=0.05, fill_color=color, fill_opacity=1, stroke_width=0).shift(RIGHT * dx) for dx in (-0.13, 0.13)])
    return VGroup(c, bars)


def wrap_points(k, c, r, L, n=80):
    """A string of length L lying tangent at angle 0, the first k*L of it wrapped onto the circle."""
    w = k * L
    pts = []
    for s in np.linspace(0, L, n):
        if s <= w:
            a = s / r
            pts.append(c + r * np.array([np.cos(a), np.sin(a), 0]))
        else:
            a = w / r
            p = c + r * np.array([np.cos(a), np.sin(a), 0])
            pts.append(p + (s - w) * np.array([-np.sin(a), np.cos(a), 0]))
    return pts


def dashed(p, q, color=DIM, width=3):
    return DashedLine(np.array(p, float), np.array(q, float), color=color, stroke_width=width, dash_length=0.12)


# ---------------- Chapter 7: Radians ----------------

class K05_Degrees(Shot):
    def body(self):
        self.title("Radians", 1226.85)
        sub = H("the natural way to measure angles", 40, YEL).move_to([0, 1.75, 0])
        self.go(1227.4, FadeIn(sub, shift=UP * 0.1), run=0.5)
        c = np.array([-3.2, -0.9, 0])
        circ = Circle(radius=2.2, color=CHALK, stroke_width=4).move_to(c)
        lab = H("Degrees are human", 46).move_to([3.3, 0.6, 0])
        self.go(1229.04, Create(circ), FadeIn(lab), run=0.7)
        ticks = VGroup(*[Line(c + 2.2 * np.array([np.cos(a), np.sin(a), 0]), c + (2.2 - (0.22 if i % 10 == 0 else 0.11)) * np.array([np.cos(a), np.sin(a), 0]),
                              color=YEL, stroke_width=2 if i % 10 else 3) for i, a in enumerate(np.linspace(0, TAU, 360, endpoint=False))])
        note = H("someone just decided...", 38, DIM).next_to(lab, DOWN, buff=0.4)
        self.go(1230.88, FadeIn(note), Create(ticks, lag_ratio=0.02), run=1.6)
        big = M(r"360^\circ", size=96, color=YEL).move_to([3.3, -1.6, 0])
        self.go(1232.54, Write(big), Indicate(ticks, color=ORG, scale_factor=1.0), run=0.8)


class K05_Radian(Shot):
    def body(self):
        self.title("Radians", animate=False)
        nat = H("a more natural unit...", 42, YEL).move_to([0, 1.7, 0])
        self.go(1238.76, FadeIn(nat, shift=UP * 0.1), run=0.5)
        self.title("One Radian", 1240.34)
        self.play(FadeOut(nat), run_time=0.3)
        r = 2.0
        c = np.array([-2.6, -0.85, 0])
        circ = Circle(radius=r, color=CHALK, stroke_width=4).move_to(c)
        centre = Dot(c, radius=0.06, color=CHALK)
        self.go(1243.12, Create(circ), FadeIn(centre), run=0.7)
        rad = Line(c, c + [r, 0, 0], color=PINK, stroke_width=6)
        rl = M("r", size=48, color=PINK).next_to(rad, DOWN, buff=0.12)
        self.go(1244.3, Create(rad), FadeIn(rl), run=0.5)
        # the radius lifts off as a piece of string, standing on the circle at angle 0
        k = ValueTracker(0)
        string = always_redraw(lambda: VMobject(stroke_color=PINK, stroke_width=7).set_points_smoothly(wrap_points(k.get_value(), c, r, r)))
        piece = H("like a piece of string", 38, PINK).move_to([3.4, 1.5, 0])
        self.go(1245.42, TransformFromCopy(rad, string), FadeIn(piece), run=0.7)
        self.add(string)
        self.at(1247.2)
        self.play(k.animate.set_value(1), run_time=1.3, rate_func=smooth)
        string.clear_updaters()
        end = c + r * np.array([np.cos(1), np.sin(1), 0])
        r2 = Line(c, end, color=CHALK, stroke_width=4)
        ang = angle_arc(c, c + [1, 0, 0], end, r=0.6, label=r"1", label_size=44)
        self.go(1249.72, Create(r2), run=0.5)
        self.go(1250.6, Create(ang), run=0.6)
        res = M(r"1 \text{ radian} \approx 57.3^\circ", size=56, color=YEL).move_to([3.4, 0.3, 0])
        self.go(1252.4, Write(res), FadeOut(piece), run=0.8)
        # how many radii fit around?
        self.go(1253.9, FadeOut(res), FadeOut(ang), FadeOut(r2), run=0.35)
        q = H("How many radii fit around?", 40).move_to([3.4, 1.5, 0])
        self.play(FadeIn(q), run_time=0.3)
        arcs, nums = VGroup(), VGroup()
        cols = [PINK, YEL]
        for i in range(6):
            arcs.add(Arc(radius=r, start_angle=i, angle=1, arc_center=c, color=cols[i % 2], stroke_width=8))
            m = (i + 0.5)
            nums.add(M(str(i + 1), size=40, color=cols[i % 2]).move_to(c + (r + 0.38) * np.array([np.cos(m), np.sin(m), 0])))
        rest = Arc(radius=r, start_angle=6, angle=TAU - 6, arc_center=c, color=GRN, stroke_width=8)
        self.remove(string)
        self.add(arcs[0])
        self.at(1254.7)
        for i in range(1, 6):
            self.play(Create(arcs[i]), FadeIn(nums[i - 1]), run_time=0.32)
        self.play(FadeIn(nums[5]), Create(rest), run_time=0.35)
        circum = M(r"C = 2\pi r", size=60).move_to([3.4, 0.5, 0])
        self.go(1257.0, Write(circum), run=0.8)
        fit = M(r"2\pi \approx 6.28 \text{ radii}", size=52, color=GRN).move_to([3.4, -0.6, 0])
        self.go(1259.92, Write(fit), run=0.9)
        full = M(r"\text{full circle} = 2\pi \text{ rad}", size=56, color=YEL).move_to([3.4, -2.0, 0])
        self.go(1262.88, Write(full), run=0.9)
        self.play(Create(box(full)), run_time=0.4)


class K05_Convert(Shot):
    def body(self):
        self.title("Degrees & Radians", animate=False)
        e1 = M(r"360^\circ", "=", r"2\pi \text{ rad}", size=66).move_to([0, 1.45, 0])
        e1[0].set_color(YEL); e1[2].set_color(PINK)
        self.go(1265.94, Write(e1[0]), run=0.5)
        self.go(1267.08, Write(e1[1:]), run=0.8)
        e2 = M(r"180^\circ", "=", r"\pi \text{ rad}", size=66).move_to([0, 0.15, 0])
        e2[0].set_color(YEL); e2[2].set_color(PINK)
        self.go(1269.38, Write(e2[0]), run=0.5)
        self.go(1270.48, Write(e2[1:]), run=0.6)
        key = box(e2, YEL, buff=0.25, width=4)
        tag = pill("KEY", YEL, 32).next_to(key, RIGHT, buff=0.3)
        self.go(1272.4, Create(key), FadeIn(tag), run=0.6)
        self.go(1274.06, Indicate(e2, color=ORG, scale_factor=1.08), run=1.2)
        d2r = VGroup(H("degrees  to  radians", 38, YEL), M(r"\times \frac{\pi}{180}", size=60)).arrange(DOWN, buff=0.25).move_to([-3.3, -2.2, 0])
        r2d = VGroup(H("radians  to  degrees", 38, PINK), M(r"\times \frac{180}{\pi}", size=60)).arrange(DOWN, buff=0.25).move_to([3.3, -2.2, 0])
        self.go(1277.24, FadeIn(d2r[0]), run=0.4)
        self.go(1279.38, Write(d2r[1]), run=0.8)
        self.go(1281.54, FadeIn(r2d[0]), run=0.4)
        self.go(1283.66, Write(r2d[1]), run=0.8)
        # the common ones
        self.wipe(1285.5)
        xs = [-4.1 + 1.68 * i for i in range(7)]
        deg = ["90", "60", "45", "30", "135", "150", "270"]
        rad = [r"\frac{\pi}{2}", r"\frac{\pi}{3}", r"\frac{\pi}{4}", r"\frac{\pi}{6}", r"\frac{3\pi}{4}", r"\frac{5\pi}{6}", r"\frac{3\pi}{2}"]
        yd, yr = 0.55, -1.25
        heads = VGroup(H("degrees", 34, YEL).move_to([-5.82, yd, 0]), H("radians", 34, PINK).move_to([-5.82, yr, 0]))
        frame = RoundedRectangle(width=13.4, height=3.7, corner_radius=0.3, stroke_color=PURP, stroke_width=4).move_to([0, -0.35, 0])
        mid = Line([-6.7, -0.35, 0], [6.7, -0.35, 0], color=FAINT, stroke_width=2)
        vl = Line([-4.95, 1.5, 0], [-4.95, -2.2, 0], color=FAINT, stroke_width=2)
        self.play(Create(frame), FadeIn(heads), Create(mid), Create(vl), run_time=0.6)
        D = [M(d + r"^\circ", size=50, color=YEL).move_to([x, yd, 0]) for d, x in zip(deg, xs)]
        R = [M(t, size=52, color=PINK).move_to([x, yr, 0]) for t, x in zip(rad, xs)]
        times = [(1288.04, 1288.96), (1290.2, 1291.32), (1293.16, 1294.68), (1296.26, 1297.26), (1298.9, 1300.48), (1304.26, 1302.38), (1307.56, 1306.2)]
        order = sorted([(t, "d", i) for i, (t, _) in enumerate(times)] + [(t, "r", i) for i, (_, t) in enumerate(times)])
        for t, w, i in order:
            self.go(t, FadeIn(D[i] if w == "d" else R[i], scale=1.3), run=0.35)


class K05_Arc(Shot):
    def body(self):
        why = H("why radians are amazing", 44, YEL).move_to([0, 2.9, 0])
        self.go(1309.3, FadeIn(why), run=0.4)
        self.at(1311.6)
        self.play(FadeOut(why), run_time=0.2)
        self.title("Arc Length")
        c = np.array([-3.4, -0.8, 0]); r = 2.3; th = 1.1
        circ = Circle(radius=r, color=CHALK, stroke_width=4).move_to(c)
        self.go(1313.74, Create(circ), run=0.6)
        rad = Line(c, c + [r, 0, 0], color=PINK, stroke_width=5)
        rl = M("r", size=50, color=PINK).next_to(rad, DOWN, buff=0.12)
        self.go(1314.26, Create(rad), FadeIn(rl), run=0.4)
        end = c + r * np.array([np.cos(th), np.sin(th), 0])
        r2 = Line(c, end, color=CHALK, stroke_width=4)
        ang = angle_arc(c, c + [1, 0, 0], end, r=0.65, label=r"\theta")
        self.go(1315.46, Create(r2), Create(ang), run=0.5)
        inrad = TX(r"($\theta$ in radians)", 40, DIM).move_to([3.4, -0.9, 0])
        self.go(1316.3, FadeIn(inrad), run=0.3)
        arc = Arc(radius=r, start_angle=0, angle=th, arc_center=c, color=GRN, stroke_width=9)
        sl = M("s", size=50, color=GRN).move_to(c + (r + 0.4) * np.array([np.cos(th / 2), np.sin(th / 2), 0]))
        self.go(1317.58, Create(arc), FadeIn(sl), run=0.6)
        f = M("s", "=", "r", r"\theta", size=110).move_to([3.4, 0.6, 0])
        f[0].set_color(GRN); f[2].set_color(PINK); f[3].set_color(YEL)
        self.go(1318.6, Write(f), run=0.9)
        self.play(Create(box(f, GRN)), run_time=0.4)
        messy = M(r"s = \frac{\theta^\circ}{360^\circ}\cdot 2\pi r", size=46, color=DIM).move_to([3.4, -2.3, 0])
        self.go(1320.5, FadeIn(messy), run=0.3)
        self.play(Create(strike(messy)), run_time=0.35)


class K05_Sector(Shot):
    def body(self):
        self.title("Sector Area", animate=False)
        c = np.array([-3.6, -0.9, 0]); r = 2.3; th = PI / 3
        circ = Circle(radius=r, color=CHALK, stroke_width=4).move_to(c)
        sector = Sector(radius=r, angle=th, arc_center=c, fill_color=ORG, fill_opacity=0.45, stroke_color=ORG, stroke_width=4)
        self.add(circ)
        rl = M("r", size=48, color=PINK).move_to(c + [r / 2, -0.32, 0])
        tl = M(r"\theta", size=46, color=YEL).move_to(c + 0.8 * np.array([np.cos(th / 2), np.sin(th / 2), 0]))
        self.play(FadeIn(sector), FadeIn(rl), FadeIn(tl), run_time=0.3)
        A = M("A", "=", r"\tfrac{1}{2}", "r^2", r"\theta", size=90).move_to([3.3, 1.35, 0])
        A[0].set_color(ORG); A[3].set_color(PINK); A[4].set_color(YEL)
        self.go(1325.9, Write(A), run=1.3)
        self.play(Create(box(A, ORG)), run_time=0.4)
        ex = M(r"r = 10,\quad \theta = \frac{\pi}{3}", size=52).move_to([3.3, 0.0, 0])
        exl = H("Example", 36, DIM).next_to(ex, LEFT, buff=0.3)
        self.go(1328.9, FadeIn(exl), run=0.3)
        self.go(1330.36, Write(ex), run=1.2)
        rl2 = M("10", size=46, color=PINK).move_to(rl)
        tl2 = M(r"\tfrac{\pi}{3}", size=42, color=YEL).move_to(tl)
        self.go(1332.6, Transform(rl, rl2), Transform(tl, tl2), run=0.4)
        arc = Arc(radius=r, start_angle=0, angle=th, arc_center=c, color=GRN, stroke_width=10)
        s = M(r"s = 10 \cdot \frac{\pi}{3}", r"\approx 10.47", size=52).move_to([3.3, -1.25, 0])
        s[0][0].set_color(GRN)
        self.go(1333.96, Create(arc), Write(s[0]), run=1.0)
        self.go(1336.62, Write(s[1]), run=0.6)
        a = M(r"A = \tfrac12 \cdot 100 \cdot \frac{\pi}{3}", r"= \frac{50\pi}{3}", r"\approx 52.36", size=50).move_to([3.0, -2.75, 0])
        a[0][0].set_color(ORG)
        self.go(1338.88, Write(a[0]), Indicate(sector, color=YEL, scale_factor=1.0), run=1.4)
        self.go(1343.4, Write(a[1]), run=0.7)
        self.go(1345.08, Write(a[2]), run=0.6)


class K05_Bike(Shot):
    def body(self):
        self.title("Rolling Wheel", animate=False)
        g = Line([-6.8, -2.75, 0], [6.8, -2.75, 0], color=DIM, stroke_width=4)
        R = 0.85
        x0 = -5.6
        x = ValueTracker(x0)
        speed = 11.2 / 12.0

        def wheel():
            cx = x.get_value(); cc = np.array([cx, -2.75 + R, 0]); a = -(cx - x0) / R
            grp = VGroup(Circle(radius=R, color=CHALK, stroke_width=5).move_to(cc), Dot(cc, radius=0.07, color=CHALK))
            for i in range(6):
                t = a + i * TAU / 6
                grp.add(Line(cc, cc + R * np.array([np.cos(t), np.sin(t), 0]), color=FAINT, stroke_width=2))
            grp.add(Dot(cc + R * np.array([np.cos(a - PI / 2), np.sin(a - PI / 2), 0]), radius=0.1, color=PINK))
            return grp

        w = always_redraw(wheel)
        trail = always_redraw(lambda: Line([x0, -2.75, 0], [max(x.get_value(), x0 + 0.01), -2.75, 0], color=GRN, stroke_width=7))
        self.play(Create(g), FadeIn(w), run_time=0.4)
        self.add(trail, w)
        x.add_updater(lambda m, dt: m.set_value(min(5.6, m.get_value() + speed * dt)) if self.now() > 1354.5 else None)
        self.add(x)
        e1 = M(r"1 \text{ turn} = 2\pi \text{ rad}", size=52).move_to([-3.3, 1.6, 0])
        e2 = M(r"10 \text{ turns} = 20\pi \text{ rad}", size=52, color=YEL).move_to([3.3, 1.6, 0])
        self.go(1354.65, Write(e1), run=0.8)
        self.go(1356.3, Write(e2), run=0.9)
        d = M(r"d = r\theta", r"= 0.3 \times 20\pi", r"= 6\pi", r"\approx 18.85 \text{ m}", size=56).move_to([0, 0.25, 0])
        d[0][0].set_color(GRN)
        self.go(1358.74, Write(d[0]), run=0.6)
        self.go(1361.36, Write(d[1]), run=0.8)
        self.go(1363.76, Write(d[2]), run=0.5)
        self.go(1365.14, Write(d[3]), run=0.7)
        self.play(Create(box(d[3], GRN)), run_time=0.4)
        self.wipe(1367.74)
        x.clear_updaters()
        self.remove(x, w, trail)
        lead = H("most advanced maths uses radians", 46, YEL).move_to([0, 1.5, 0])
        self.play(FadeIn(lead), run_time=0.4)
        ps = [pill("Calculus", BLUE, 40), pill("Physics", PINK, 40), pill("Engineering", GRN, 40)]
        VGroup(*ps).arrange(RIGHT, buff=0.6).move_to([0, 0.2, 0])
        for p, t in zip(ps, (1371.76, 1372.82, 1373.6)):
            self.go(t, FadeIn(p, scale=1.2), run=0.35)
        fr = [M(r"\frac{\pi}{6}", size=80, color=YEL), M(r"\frac{\pi}{4}", size=80, color=ORG), M(r"\frac{\pi}{3}", size=80, color=PINK)]
        VGroup(*fr).arrange(RIGHT, buff=1.6).move_to([0, -1.9, 0])
        for f, t in zip(fr, (1376.68, 1377.88, 1379.02)):
            self.go(t, FadeIn(f, scale=1.3), run=0.35)



QS = [r"1.\ \ Convert $225^\circ$ to radians",
      r"2.\ \ Convert $\frac{7\pi}{6}$ to degrees",
      r"3.\ \ Arc length: $r = 6,\ \theta = \frac{\pi}{2}$"]


class K05_Practice(Shot):
    def body(self):
        self.title("Practice", animate=False)
        qs = VGroup(*[TX(q, 62) for q in QS]).arrange(DOWN, aligned_edge=LEFT, buff=0.6).move_to([0, 0.1, 0])
        for q, t in zip(qs, (1382.02, 1385.98, 1390.08)):
            self.go(t, FadeIn(q, shift=RIGHT * 0.2), run=0.5)
        icon = pause_icon().move_to([-1.4, -2.9, 0])
        pn = H("Pause now!", 48, YEL).next_to(icon, RIGHT, buff=0.3)
        self.go(1396.86, FadeIn(icon, scale=1.4), FadeIn(pn), run=0.4)
        self.play(Indicate(icon, color=ORG), run_time=0.8)


class K05_Answers(Shot):
    def body(self):
        self.title("Answers", animate=False)
        ys = [1.45, -0.5, -2.45]
        qs = VGroup(*[TX(q, 40, DIM) for q in QS])
        for q, y in zip(qs, ys):
            q.move_to([-6.7, y, 0], aligned_edge=LEFT)
        self.add(qs)
        a1 = M(r"225 \cdot \frac{\pi}{180}", r"= \frac{5}{4}\pi", r"= \frac{5\pi}{4}", size=50).move_to([0.1, ys[0], 0], aligned_edge=LEFT)
        self.go(1400.18, qs[0].animate.set_color(CHALK), Write(a1[0]), run=0.9)
        self.go(1404.4, Write(a1[1]), run=0.7)
        self.go(1407.74, Write(a1[2]), run=0.6)
        self.play(Create(box(a1[2], GRN, buff=0.1)), run_time=0.35)
        a2 = M(r"\frac{7\pi}{6}\cdot\frac{180}{\pi}", r"= 7 \times 30", r"= 210^\circ", size=50).move_to([0.1, ys[1], 0], aligned_edge=LEFT)
        self.go(1410.68, qs[1].animate.set_color(CHALK), Write(a2[0]), run=1.0)
        canc = H("the pi cancels", 34, YEL).next_to(a2[0], UP, buff=0.08)
        self.go(1414.04, FadeIn(canc), Indicate(a2[0], color=YEL, scale_factor=1.05), run=0.6)
        self.go(1415.46, Write(a2[1]), run=0.7)
        self.go(1416.6, Write(a2[2]), run=0.6)
        self.play(Create(box(a2[2], GRN, buff=0.1)), run_time=0.35)
        a3 = M(r"s = r\theta", r"= 6 \cdot \frac{\pi}{2}", r"= 3\pi", r"\approx 9.42", size=50).move_to([0.1, ys[2], 0], aligned_edge=LEFT)
        self.go(1419.72, qs[2].animate.set_color(CHALK), Write(a3[0]), run=0.6)
        self.go(1421.58, Write(a3[1]), run=0.8)
        self.go(1423.0, Write(a3[2]), run=0.4)
        self.go(1424.36, Write(a3[3]), run=0.5)


# ---------------- Chapter 8: Graphs ----------------

class K05_SineTrace(Shot):
    def body(self):
        self.title("The Sine Wave", 1429.0)
        R = 1.55
        c = np.array([-4.7, -0.7, 0])
        X0, SX = -2.4, 1.38   # graph origin x and screen units per radian
        circ = Circle(radius=R, color=CHALK, stroke_width=4).move_to(c)
        cax = VGroup(Line(c + [-R - 0.3, 0, 0], c + [R + 0.3, 0, 0], color=DIM, stroke_width=2), Line(c + [0, -R - 0.3, 0], c + [0, R + 0.3, 0], color=DIM, stroke_width=2))
        gx = Arrow([X0 - 0.2, c[1], 0], [X0 + TAU * SX + 0.5, c[1], 0], buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        gy = Arrow([X0, c[1] - R - 0.4, 0], [X0, c[1] + R + 0.5, 0], buff=0, color=DIM, stroke_width=3, tip_length=0.2)
        ticks = VGroup()
        for k, t in enumerate([PI / 2, PI, 3 * PI / 2, TAU]):
            ticks.add(Line([X0 + t * SX, c[1] - 0.08, 0], [X0 + t * SX, c[1] + 0.08, 0], color=DIM, stroke_width=3))
            ticks.add(M(pi_label(t), size=34, color=DIM).next_to([X0 + t * SX, c[1], 0], DOWN, buff=0.25))
        ylab = VGroup(M("1", size=32, color=DIM).next_to([X0, c[1] + R, 0], LEFT, buff=0.15), M("-1", size=32, color=DIM).next_to([X0, c[1] - R, 0], LEFT, buff=0.15))
        self.go(1436.08, Create(circ), Create(cax), run=0.8)
        self.play(Create(gx), Create(gy), FadeIn(ticks), FadeIn(ylab), run_time=0.7)
        a = ValueTracker(0.0)
        P = lambda: c + R * np.array([np.cos(a.get_value()), np.sin(a.get_value()), 0])
        radius = always_redraw(lambda: Line(c, P(), color=CHALK, stroke_width=4))
        hv = always_redraw(lambda: Line([P()[0], c[1], 0], P(), color=PINK, stroke_width=6))
        dot = always_redraw(lambda: Dot(P(), radius=0.09, color=PINK))
        link = always_redraw(lambda: DashedLine(P(), [X0 + a.get_value() * SX, P()[1], 0], color=DIM, stroke_width=2, dash_length=0.1))
        gdot = always_redraw(lambda: Dot([X0 + a.get_value() * SX, P()[1], 0], radius=0.08, color=PINK))
        curve = always_redraw(lambda: ParametricFunction(lambda t: np.array([X0 + t * SX, c[1] + R * np.sin(t), 0]), t_range=[0, max(a.get_value(), 1e-3)], color=PINK, stroke_width=6))
        self.play(Create(radius), FadeIn(dot), run_time=0.4)
        ylb = M(r"y = \sin\theta", size=44, color=PINK).move_to(c + [0, R + 0.75, 0])
        self.go(1438.54, Create(hv), Write(ylb), run=0.6)
        self.add(curve, link, gdot)
        vals = [(1440.16, 0.0, "0"), (1443.62, PI / 2, "1"), (1446.42, PI, "0"), (1449.8, 3 * PI / 2, "-1"), (1453.14, TAU, "0")]
        marks = VGroup()
        prev_t = 1440.16
        self.at(1440.16)
        for t, ang, s in vals:
            if ang > 0:
                self.play(a.animate.set_value(ang), run_time=t - self.now(), rate_func=linear)
            pt = [X0 + ang * SX, c[1] + R * np.sin(ang), 0]
            lab = M(s, size=38, color=YEL).next_to(pt, UP if np.sin(ang) >= 0 else DOWN, buff=0.18)
            if s == "0":
                lab.next_to(pt, UR, buff=0.08)
            marks.add(Dot(pt, radius=0.08, color=YEL), lab)
            self.add(marks[-2], marks[-1])
        name = M(r"y = \sin x", size=60, color=PINK).move_to([4.6, 1.75, 0])
        self.go(1455.6, Write(name), run=0.8)
        self.play(Create(box(name, PINK)), run_time=0.4)
        br = BraceBetweenPoints([X0, c[1] - R - 0.55, 0], [X0 + TAU * SX, c[1] - R - 0.55, 0], DOWN, color=YEL)
        per = M(r"\text{repeats every } 2\pi", size=44, color=YEL).next_to(br, DOWN, buff=0.12)
        self.go(1459.64, Indicate(curve, color=YEL, scale_factor=1.0), run=0.9)
        self.go(1461.54, GrowFromCenter(br), FadeIn(per), run=0.6)


class K05_Cosine(Shot):
    def body(self):
        self.title("The Cosine Wave", animate=False)
        ax = trig_axes(x_min=-PI / 2, x_max=TAU, y=1.5, width=12, height=3.6, center=(0.2, -1.0, 0))
        self.add(ax, ax.labels)
        sin_c = ax.plot(np.sin, x_range=[-PI / 2, TAU], color=PINK, stroke_width=4, stroke_opacity=0.45)
        self.add(sin_c)
        cos_c = ax.plot(np.cos, x_range=[-PI / 2, TAU], color=BLUE, stroke_width=6)
        self.go(1472.24, Create(cos_c), run=1.5)
        ghost = ax.plot(np.sin, x_range=[-PI / 2, TAU], color=PINK, stroke_width=6)
        self.go(1474.88, FadeIn(ghost), run=0.3)
        self.play(ghost.animate.shift(LEFT * (ax.c2p(PI / 2, 0)[0] - ax.c2p(0, 0)[0])), run_time=1.0)
        self.play(FadeOut(ghost), run_time=0.3)
        d1 = Dot(ax.c2p(0, 1), radius=0.11, color=BLUE)
        d0 = Dot(ax.c2p(0, 0), radius=0.11, color=PINK)
        l1 = M(r"\cos 0 = 1", size=44, color=BLUE).next_to(d1, RIGHT, buff=0.2).shift(UP * 0.15)
        l0 = M(r"\sin 0 = 0", size=44, color=PINK).next_to(d0, DR, buff=0.15)
        self.go(1476.44, FadeIn(d1, scale=1.5), FadeIn(l1), run=0.4)
        self.go(1477.5, FadeIn(d0, scale=1.5), FadeIn(l0), run=0.4)
        f = M(r"\cos x", "=", r"\sin\left(x + \frac{\pi}{2}\right)", size=62).move_to([2.3, 1.6, 0])
        f[0].set_color(BLUE); f[2].set_color(PINK)
        self.go(1479.62, Write(f), run=1.2)
        self.play(Create(box(f, YEL)), run_time=0.4)


class K05_General(Shot):
    def body(self):
        self.title("Controlling the Wave", 1483.84)
        f = M("y", "=", "a", r"\sin(", "b", "x", "-", "c", ")", "+", "d", size=72).move_to([0, 1.75, 0])
        col = {2: ORG, 4: BLUE, 7: GRN, 10: PINK}
        for i, cc in col.items():
            f[i].set_color(cc)
        self.go(1485.8, Write(f), run=1.4)
        A, B, C, D = [ValueTracker(v) for v in (1, 1, 0, 0)]
        ax = Axes(x_range=[0, TAU, PI / 2], y_range=[-2.5, 2.5, 1], x_length=11.5, y_length=3.9,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18)).move_to([0, -1.5, 0])
        xl = VGroup(*[M(pi_label(k * PI / 2), size=32, color=DIM).next_to(ax.c2p(k * PI / 2, 0), DOWN, buff=0.15) for k in range(1, 5)])
        yl = VGroup(*[M(str(v), size=30, color=DIM).next_to(ax.c2p(0, v), LEFT, buff=0.12) for v in (1, -1, 2, -2)])
        curve = always_redraw(lambda: ax.plot(lambda x: A.get_value() * np.sin(B.get_value() * x - C.get_value()) + D.get_value(), x_range=[0, TAU, 0.02], color=YEL, stroke_width=6))
        mid = always_redraw(lambda: DashedLine(ax.c2p(0, D.get_value()), ax.c2p(TAU, D.get_value()), color=PINK, stroke_width=2, dash_length=0.12))
        self.play(Create(ax), FadeIn(xl), FadeIn(yl), run_time=0.6)
        self.play(Create(curve), run_time=0.8)
        self.add(mid, curve)
        for i in col:
            self.go([1492.2, 1492.5, 1492.78, 1493.1][list(col).index(i)], Indicate(f[i], scale_factor=1.3), run=0.3)
        LP = [0, 0.82, 0]

        def label(m):
            return m.move_to(LP)
        lab = label(M(r"a = \text{amplitude}", size=50, color=ORG))
        self.go(1494.36, FadeIn(lab), Create(box(f[2], ORG)), run=0.4)
        self.go(1496.38, A.animate.set_value(2), run=1.0)
        x_pk = PI / 2
        arr = DoubleArrow(ax.c2p(x_pk, 0), ax.c2p(x_pk, 2), buff=0, color=ORG, stroke_width=4, tip_length=0.18)
        arr2 = DoubleArrow(ax.c2p(3 * x_pk, 0), ax.c2p(3 * x_pk, -2), buff=0, color=ORG, stroke_width=4, tip_length=0.18)
        al = VGroup(M("a", size=40, color=ORG).next_to(arr, RIGHT, buff=0.1), M("a", size=40, color=ORG).next_to(arr2, RIGHT, buff=0.1))
        self.go(1498.26, GrowFromCenter(arr), GrowFromCenter(arr2), FadeIn(al), run=0.6)
        self.go(1501.58, FadeOut(arr), FadeOut(arr2), FadeOut(al), run=0.3)
        neg = label(M(r"a < 0: \text{ flips}", size=50, color=ORG))
        self.play(Transform(lab, neg), A.animate.set_value(-2), run_time=1.4)
        self.go(1503.84, A.animate.set_value(1), run=0.8)
        self.remove(*[m for m in self.mobjects if isinstance(m, SurroundingRectangle)])
        # b: period
        self.go(1504.94, Transform(lab, label(M(r"b \to \text{period}", size=50, color=BLUE))), Create(box(f[4], BLUE)), run=0.5)
        per = label(M(r"\text{period} = \frac{2\pi}{b}", size=50, color=BLUE))
        self.go(1509.44, Transform(lab, per), run=0.6)
        self.go(1512.56, B.animate.set_value(2), run=1.2)
        self.go(1514.9, B.animate.set_value(0.5), run=1.2)
        self.play(B.animate.set_value(1), run_time=0.45)
        self.remove(*[m for m in self.mobjects if isinstance(m, SurroundingRectangle)])
        # c: phase shift
        self.go(1516.7, Transform(lab, label(M(r"\frac{c}{b} = \text{phase shift}", size=50, color=GRN))), Create(box(f[7], GRN)), run=0.5)
        self.go(1519.2, C.animate.set_value(1.2), run=0.8)
        self.play(C.animate.set_value(-1.2), run_time=0.8)
        self.play(C.animate.set_value(0), run_time=0.3)
        self.remove(*[m for m in self.mobjects if isinstance(m, SurroundingRectangle)])
        # d: vertical shift
        self.go(1521.26, Transform(lab, label(M(r"d = \text{vertical shift}", size=50, color=PINK))), Create(box(f[10], PINK)), run=0.5)
        self.go(1523.26, D.animate.set_value(1.2), run=0.8)
        self.play(D.animate.set_value(-1), run_time=0.7)
        self.play(D.animate.set_value(1), run_time=0.5)
        yd = always_redraw(lambda: M("y = d", size=40, color=PINK).next_to(ax.c2p(TAU, D.get_value()), UR, buff=0.08).shift(LEFT * 0.9))
        self.go(1525.84, FadeIn(yd), Indicate(mid, color=PINK, scale_factor=1.0), run=0.8)


class K05_Decode(Shot):
    def body(self):
        self.title("Decoding a Wave", animate=False)
        f = M("y", "=", "3", r"\sin(", "2x", "-", r"\pi", ")", "+", "1", size=72).move_to([0, 1.7, 0])
        self.go(1529.96, Write(f), run=1.6)
        fac = M(r"2x - \pi = 2\left(x - \frac{\pi}{2}\right)", size=48).move_to([-3.6, 0.6, 0])
        self.go(1535.72, Indicate(VGroup(*f[4:7]), color=YEL), run=0.8)
        self.go(1537.22, Write(fac), run=1.4)
        rows = [M(r"\text{amplitude} = 3", size=44, color=ORG), M(r"\text{period} = \frac{2\pi}{2} = \pi", size=44, color=BLUE),
                M(r"\text{phase shift} = \frac{\pi}{2} \to", size=44, color=GRN), M(r"\text{vertical shift} = 1 \uparrow", size=44, color=PINK)]
        for r_, y in zip(rows, (-0.45, -1.35, -2.25, -3.1)):
            r_.move_to([-6.6, y, 0], aligned_edge=LEFT)
        # graph on the right
        ax = Axes(x_range=[0, 2.5 * PI, PI / 2], y_range=[-2.5, 4.5, 1], x_length=6.4, y_length=4.4,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.16)).move_to([3.5, -1.25, 0])
        xl = VGroup(*[M(pi_label(k * PI / 2), size=28, color=DIM).next_to(ax.c2p(k * PI / 2, 0), DOWN, buff=0.12) for k in range(1, 6)])
        yl = VGroup(*[M(str(v), size=28, color=DIM).next_to(ax.c2p(0, v), LEFT, buff=0.1) for v in (-2, 1, 4)])
        A, B, S, Dv = [ValueTracker(v) for v in (1, 1, 0, 0)]
        curve = always_redraw(lambda: ax.plot(lambda x: A.get_value() * np.sin(B.get_value() * (x - S.get_value())) + Dv.get_value(), x_range=[0, 2.5 * PI, 0.02], color=YEL, stroke_width=5))
        self.go(1538.7, Create(ax), FadeIn(xl), FadeIn(yl), run=0.6)
        self.play(Create(curve), run_time=0.6)
        self.add(curve)
        self.go(1541.62, Write(rows[0]), A.animate.set_value(3), run=1.0)
        self.go(1543.28, Write(rows[1]), B.animate.set_value(2), run=1.2)
        self.go(1546.54, Write(rows[2]), S.animate.set_value(PI / 2), run=1.2)
        self.go(1549.14, Write(rows[3]), Dv.animate.set_value(1), run=1.0)
        mx = DashedLine(ax.c2p(0, 4), ax.c2p(2.5 * PI, 4), color=GRN, stroke_width=3)
        mn = DashedLine(ax.c2p(0, -2), ax.c2p(2.5 * PI, -2), color=RED, stroke_width=3)
        mxl = M(r"\max = 1 + 3 = 4", size=40, color=GRN).next_to(ax.c2p(1.25 * PI, 4), UP, buff=0.08)
        mnl = M(r"\min = 1 - 3 = -2", size=40, color=RED).next_to(ax.c2p(1.25 * PI, -2), DOWN, buff=0.08)
        self.go(1552.36, Create(mx), run=0.5)
        self.go(1553.4, Write(mxl), run=0.9)
        self.go(1556.14, Create(mn), run=0.5)
        self.go(1557.02, Write(mnl), run=0.9)
        # the range replaces the factoring line once that job is done
        rg = M(r"\text{range: } [-2,\ 4]", size=54, color=YEL).move_to([-3.6, 0.6, 0])
        self.go(1560.06, FadeOut(fac), run=0.25)
        self.play(Write(rg), run_time=0.7)
        self.play(Create(box(rg, YEL)), run_time=0.35)


class K05_TanIntro(Shot):
    def body(self):
        self.title("The Tangent Graph", 1562.5)
        t = M(r"\tan x", "=", r"\frac{\sin x}{\cos x}", size=90).move_to([0, 0.5, 0])
        t[0].set_color(GRN)
        self.go(1564.28, Write(t), run=1.0)
        z = M(r"\cos x = 0", size=60, color=BLUE).move_to([0, -1.8, 0])
        self.go(1566.84, Write(z), Indicate(t[2], color=BLUE), run=0.8)
        boom = H("tangent explodes!", 52, RED).move_to([0, -3.0, 0])
        self.go(1568.0, FadeIn(boom, scale=1.4), run=0.4)


class K05_TanGraph(Shot):
    def body(self):
        self.title("The Tangent Graph", animate=False)
        ax = trig_axes(x_min=-PI / 2, x_max=TAU, y=3.2, width=12, height=4.6, center=(0.2, -1.05, 0))
        self.add(ax, ax.labels)
        asym = [DashedLine(ax.c2p(x, -3.2), ax.c2p(x, 3.2), color=RED, stroke_width=3, dash_length=0.14) for x in (PI / 2, 3 * PI / 2)]
        self.go(1570.44, Create(asym[0]), run=0.5)
        self.go(1571.54, Create(asym[1]), run=0.5)
        al = H("vertical asymptotes", 40, RED).move_to([0, 1.75, 0])
        self.go(1574.2, FadeIn(al), run=0.5)
        L = np.arctan(3.2)
        branches = [ax.plot(np.tan, x_range=[max(-PI / 2 + 0.01, k * PI - L), min(TAU, k * PI + L), 0.01], color=GRN, stroke_width=6) for k in (0, 1, 2)]
        # a point creeping up toward the asymptote, never touching
        s = ValueTracker(1.0)
        dot = always_redraw(lambda: Dot(ax.c2p(s.get_value(), np.tan(s.get_value())), radius=0.09, color=YEL))
        self.go(1576.34, Create(branches[0]), run=0.8)
        self.add(dot)
        self.play(s.animate.set_value(L - 0.003), run_time=1.6, rate_func=rate_functions.ease_out_sine)
        nt = H("never touches", 38, YEL).next_to(ax.c2p(PI / 2, 2.4), LEFT, buff=0.25)
        self.play(FadeIn(nt), run_time=0.3)
        lab = VGroup(M(r"-\infty", size=44, color=GRN).next_to(ax.c2p(PI, -3.2), RIGHT, buff=0.15), M(r"+\infty", size=44, color=GRN).next_to(ax.c2p(PI, 3.2), RIGHT, buff=0.15))
        self.go(1579.92, FadeOut(dot), FadeOut(nt), run=0.3)
        self.go(1580.82, Create(branches[1]), run=1.0)
        self.go(1581.84, FadeIn(lab[0]), run=0.3)
        self.go(1583.18, FadeIn(lab[1]), run=0.3)
        self.play(Create(branches[2]), run_time=0.5)
        br = BraceBetweenPoints(ax.c2p(PI / 2, 3.25), ax.c2p(3 * PI / 2, 3.25), UP, color=YEL)
        per = M(r"\text{period} = \pi", size=46, color=YEL).next_to(br, UP, buff=0.1)
        self.go(1584.9, FadeOut(al), GrowFromCenter(br), FadeIn(per), run=0.6)
        not2 = M(r"2\pi", size=46, color=DIM).next_to(per, RIGHT, buff=0.6)
        self.go(1586.44, FadeIn(not2), run=0.3)
        self.play(Create(strike(not2)), run_time=0.3)


class K05_Practice2(Shot):
    def body(self):
        self.title("Practice", animate=False)
        f = M("y", "=", "-2", r"\cos(", "4x", ")", "+", "3", size=76).move_to([0, 1.55, 0])
        self.go(1589.74, Write(f[0:2]), run=0.4)
        self.go(1590.62, Write(f[2]), run=0.4)
        self.go(1591.82, Write(f[3:6]), run=1.0)
        self.go(1593.1, Write(f[6:]), run=0.5)
        xs = [-4.5, 0, 4.5]
        hs = [H("amplitude?", 46, ORG), H("period?", 46, BLUE), H("maximum?", 46, PINK)]
        for h_, x, t in zip(hs, xs, (1594.66, 1595.64, 1596.68)):
            h_.move_to([x, 0.3, 0])
            self.go(t, FadeIn(h_, shift=UP * 0.15), run=0.35)
        icon = pause_icon().move_to([-1.3, -2.4, 0])
        pn = H("Pause now!", 48, YEL).next_to(icon, RIGHT, buff=0.3)
        self.go(1598.2, FadeIn(icon, scale=1.4), FadeIn(pn), run=0.4)
        self.play(Indicate(icon, color=ORG), run_time=0.7)
        self.go(1599.7, FadeOut(icon), FadeOut(pn), run=0.25)
        a1 = M(r"|-2| = 2", size=56, color=ORG).move_to([xs[0], -0.85, 0])
        self.go(1600.62, Write(a1), Indicate(f[2], color=ORG), run=0.8)
        n1 = H("the minus just flips it", 32, DIM).move_to([xs[0], -1.9, 0])
        self.go(1603.5, FadeIn(n1), run=0.4)
        a2 = M(r"\frac{2\pi}{4}", r"= \frac{\pi}{2}", size=56, color=BLUE).move_to([xs[1], -0.95, 0])
        self.go(1606.62, Write(a2[0]), Indicate(f[4], color=BLUE), run=0.8)
        self.go(1608.5, Write(a2[1]), run=0.6)
        a3 = M(r"3 + 2 = 5", size=56, color=PINK).move_to([xs[2], -0.85, 0])
        n3 = H("midline 3, wave 2 above", 32, DIM).move_to([xs[2], -1.9, 0])
        self.go(1609.74, FadeIn(n3), Indicate(f[7], color=PINK), run=0.5)
        self.go(1611.82, Write(a3), run=0.8)
        self.go(1613.18, Create(box(a3, GRN)), Create(box(a1, GRN)), Create(box(a2, GRN)), run=0.5)
