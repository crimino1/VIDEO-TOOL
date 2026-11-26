"""Builder 03: Chapter 4 special triangles, Chapter 5 solving real problems (8:57.90 - 14:36.08)."""
from common import *

# the shared tex_cache collides between parallel renders on Windows (file locks): one cache dir per scene
DEG = r"^\circ"


# ---------- little drawings ----------

def person(feet, h=1.5, color=CHALK):
    x, y, _ = feet
    head = Circle(radius=h * 0.13, color=color, stroke_width=4).move_to([x, y + h * 0.87, 0])
    body = Line([x, y + h * 0.74, 0], [x, y + h * 0.35, 0], color=color, stroke_width=4)
    legs = VGroup(Line([x, y + h * 0.35, 0], [x - h * 0.14, y, 0], color=color, stroke_width=4),
                  Line([x, y + h * 0.35, 0], [x + h * 0.14, y, 0], color=color, stroke_width=4))
    arms = Line([x - h * 0.18, y + h * 0.55, 0], [x + h * 0.18, y + h * 0.62, 0], color=color, stroke_width=4)
    g = VGroup(head, body, legs, arms)
    g.eye = np.array([x + h * 0.05, y + h * 0.88, 0])
    return g


def tree(base, top_y):
    x, y, _ = base
    trunk = Rectangle(width=0.32, height=(top_y - y) * 0.45, stroke_color="#c9a37a", stroke_width=4, fill_color="#c9a37a", fill_opacity=0.25)
    trunk.move_to([x, y, 0], aligned_edge=DOWN)
    r = (top_y - y) * 0.3
    leaves = VGroup(*[Circle(radius=r * s, color=GRN, stroke_width=4, fill_color=GRN, fill_opacity=0.12).move_to([x + dx * r, top_y - r * s + dy * r, 0])
                      for dx, dy, s in [(0, 0, 1.0), (-0.75, -0.7, 0.8), (0.75, -0.7, 0.8)]])
    return VGroup(trunk, leaves)


def ladder(foot, top, color=ORG, w=0.2):
    foot, top = np.array(foot, float), np.array(top, float)
    d = top - foot
    n = np.array([-d[1], d[0], 0]) / np.linalg.norm(d) * w / 2
    rails = VGroup(Line(foot + n, top + n, color=color, stroke_width=5), Line(foot - n, top - n, color=color, stroke_width=5))
    rungs = VGroup(*[Line(foot + d * t + n, foot + d * t - n, color=color, stroke_width=4) for t in np.linspace(0.08, 0.95, 10)])
    return VGroup(rails, rungs)


def kite(center, s=0.45, color=PINK):
    c = np.array(center, float)
    body = Polygon(c + [0, s, 0], c + [s * 0.7, 0, 0], c + [0, -s * 1.3, 0], c + [-s * 0.7, 0, 0], color=color, stroke_width=4, fill_color=color, fill_opacity=0.25)
    cross = VGroup(Line(c + [0, s, 0], c + [0, -s * 1.3, 0], color=color, stroke_width=2), Line(c + [-s * 0.7, 0, 0], c + [s * 0.7, 0, 0], color=color, stroke_width=2))
    tail = VMobject(stroke_color=color, stroke_width=3).set_points_smoothly([c + [0, -s * 1.3, 0], c + [0.25, -s * 1.8, 0], c + [-0.15, -s * 2.3, 0], c + [0.2, -s * 2.8, 0]])
    return VGroup(body, cross, tail)


def lighthouse(base, h, color=CHALK):
    x, y, _ = base
    body = Polygon([x - 0.42, y, 0], [x + 0.42, y, 0], [x + 0.26, y + h, 0], [x - 0.26, y + h, 0], color=color, stroke_width=4)
    stripes = VGroup(*[Line([x - 0.42 + 0.16 * t, y + h * t, 0], [x + 0.42 - 0.16 * t, y + h * t, 0], color=RED, stroke_width=4) for t in (0.3, 0.6)])
    lamp = VGroup(Rectangle(width=0.5, height=0.32, color=YEL, stroke_width=4, fill_color=YEL, fill_opacity=0.35).move_to([x, y + h + 0.16, 0]),
                  Triangle(color=color, stroke_width=4).scale(0.3).stretch_to_fit_height(0.22).move_to([x, y + h + 0.43, 0]))
    return VGroup(body, stripes, lamp)


def boat(at, color=BLUE):
    x, y, _ = at
    hull = Polygon([x - 0.5, y + 0.25, 0], [x + 0.5, y + 0.25, 0], [x + 0.3, y, 0], [x - 0.3, y, 0], color=color, stroke_width=4, fill_color=color, fill_opacity=0.2)
    sail = Polygon([x, y + 0.3, 0], [x, y + 0.95, 0], [x + 0.4, y + 0.3, 0], color=CHALK, stroke_width=3)
    return VGroup(hull, sail)


def ground(x0, x1, y=-2.8, color=DIM):
    line = Line([x0, y, 0], [x1, y, 0], color=color, stroke_width=4)
    hatch = VGroup(*[Line([x, y, 0], [x - 0.18, y - 0.18, 0], color=FAINT, stroke_width=2) for x in np.arange(x0 + 0.3, x1, 0.4)])
    return VGroup(line, hatch)


def dashed(p, q, color=DIM, width=3):
    return DashedLine(np.array(p, float), np.array(q, float), color=color, stroke_width=width, dash_length=0.12)


def pause_icon(color=YEL, r=0.45):
    return VGroup(Circle(radius=r, color=color, stroke_width=5),
                  Rectangle(width=r * 0.22, height=r * 0.9, color=color, fill_color=color, fill_opacity=1, stroke_width=0).shift(LEFT * r * 0.22),
                  Rectangle(width=r * 0.22, height=r * 0.9, color=color, fill_color=color, fill_opacity=1, stroke_width=0).shift(RIGHT * r * 0.22))


def mpill(tex, color=GRN, size=40):
    """pill() with LaTeX inside (Kalam has no superscript minus glyph)."""
    t = M(tex, size=size, color=CHALK)
    r = RoundedRectangle(width=t.width + 0.64, height=t.height + 0.36, corner_radius=(t.height + 0.36) / 2.2, stroke_color=color, stroke_width=4).move_to(t)
    return VGroup(r, t)


def eqs_at(parts, top_left, size=52, buff=0.42):
    """A column of equations, left aligned, laid out once (show them one by one later)."""
    g = VGroup(*[M(*p, size=size) if isinstance(p, (list, tuple)) else M(p, size=size) for p in parts]).arrange(DOWN, aligned_edge=LEFT, buff=buff)
    g.move_to(top_left, aligned_edge=UL)
    return g


# ---------- Chapter 4 ----------

class K03_TwoTri(Shot):
    def body(self):
        self.title("The Special Triangles", "9:00.64")
        a = Polygon([-5.4, -1.9, 0], [-2.6, -1.9, 0], [-2.6, 0.9, 0], color=YEL, stroke_width=5)
        b = Polygon([1.6, -1.9, 0], [5.6, -1.9, 0], [5.6, 0.41, 0], color=PINK, stroke_width=5)
        marks = VGroup(right_angle_mark(np.array([-2.6, -1.9, 0]), [-5.4, -1.9, 0], [-2.6, 0.9, 0]),
                       right_angle_mark(np.array([5.6, -1.9, 0]), [1.6, -1.9, 0], [5.6, 0.41, 0]))
        self.go("9:01.18", Create(a), Create(b), run=0.8)
        self.add(marks)
        la = pill("45 - 45 - 90", YEL, 40).next_to(a, DOWN, buff=0.45)
        lb = pill("30 - 60 - 90", PINK, 40).next_to(b, DOWN, buff=0.45).align_to(la, DOWN)
        self.go("9:03.42", FadeIn(la, scale=0.8), FadeIn(lb, scale=0.8), run=0.5)
        note = H("know them like your own phone number!", 40, YEL).move_to([0, 1.75, 0])
        self.go("9:04.56", Write(note), run=0.9)
        self.play(Indicate(la), Indicate(lb), run_time=0.7)


class K03_FortyFive(Shot):
    def body(self):
        self.title("The 45-45-90 Triangle", "9:06.66")
        s = 3.6
        x0, y0 = -6.3, -2.9
        A, B, C, D = np.array([x0, y0, 0]), np.array([x0 + s, y0, 0]), np.array([x0 + s, y0 + s, 0]), np.array([x0, y0 + s, 0])
        sq = Polygon(A, B, C, D, color=CHALK, stroke_width=5)
        l_bot = M("1", size=48, color=BLUE).next_to(Line(A, B), DOWN, buff=0.18)
        l_left = M("1", size=48, color=DIM).next_to(Line(A, D), LEFT, buff=0.18)
        self.go("9:10.52", Create(sq), run=0.9)
        self.go("9:11.96", FadeIn(l_bot), FadeIn(l_left), run=0.4)
        diag = Line(A, C, color=YEL, stroke_width=5)
        self.go("9:12.48", Create(diag), run=0.6)
        low = Polygon(A, B, C, color=CHALK, stroke_width=5)
        up = Polygon(A, C, D, color=CHALK, stroke_width=5)
        self.remove(sq)
        self.add(low, up, diag)
        self.go("9:13.80", up.animate.shift(LEFT * 0.25 + UP * 0.25).set_stroke(opacity=0.35), l_left.animate.shift(LEFT * 0.25 + UP * 0.25).set_opacity(0.35), run=0.6)
        mark = right_angle_mark(B, A, C)
        a1 = angle_arc(A, B, C, r=0.75, label=r"45" + DEG, label_size=40, label_buff=0.55)
        a2 = angle_arc(C, A, B, r=0.75, label=r"45" + DEG, label_size=40, label_buff=0.5)
        self.go("9:15.76", Create(mark), FadeIn(a1), run=0.5)
        self.play(FadeIn(a2), run_time=0.4)
        l_right = M("1", size=48, color=PINK).next_to(Line(B, C), RIGHT, buff=0.18)
        self.go("9:18.30", Indicate(l_bot, color=BLUE), FadeIn(l_right), run=0.6)
        self.play(FadeOut(up), FadeOut(l_left), FadeOut(diag), low.animate.set_stroke(CHALK), run_time=0.4)
        pyth = eqs_at([r"1^2 + 1^2 = c^2", r"c = \sqrt{2}"], [-0.6, 1.6, 0], size=56)
        self.go("9:20.22", Write(pyth[0]), run=0.8)
        hyp = side_label(A, C, r"\sqrt{2}", GRN, 52, side=1)
        hyp_line = Line(A, C, color=GRN, stroke_width=6)
        self.go("9:22.34", Write(pyth[1]), Create(hyp_line), FadeIn(hyp), run=0.7)
        # ratios
        self.wipe("9:23.45", run=0.35, keep=[low, mark, a1, a2, l_bot, l_right, hyp, hyp_line])
        sin1 = M(r"\sin 45" + DEG, "=", r"\frac{1}{\sqrt{2}}", size=56).move_to([-0.6, 1.25, 0], aligned_edge=LEFT)
        sin1[0].set_color(PINK)
        self.go("9:24.12", Write(sin1), run=0.9)
        self.play(Indicate(l_right, color=PINK), Indicate(hyp, color=GRN), run_time=0.6)
        sin2 = M("=", r"\frac{\sqrt{2}}{2}", size=56).next_to(sin1, RIGHT, buff=0.25)
        self.go("9:28.22", Write(sin2), run=0.7)
        approx = M(r"\approx 0.707", size=50, color=YEL).next_to(sin2, RIGHT, buff=0.3)
        self.go("9:30.70", FadeIn(approx, shift=LEFT * 0.2), run=0.5)
        cos1 = M(r"\cos 45" + DEG, "=", r"\frac{\sqrt{2}}{2}", size=56).move_to([-0.6, -0.55, 0], aligned_edge=LEFT)
        cos1[0].set_color(BLUE)
        self.go("9:33.20", Write(cos1[0]), run=0.5)
        self.play(Indicate(l_bot, color=BLUE), run_time=0.5)
        self.go("9:35.56", Write(cos1[1:]), run=0.6)
        tan1 = M(r"\tan 45" + DEG, "=", r"\frac{1}{1}", "=", "1", size=56).move_to([-0.6, -2.3, 0], aligned_edge=LEFT)
        tan1[0].set_color(GRN)
        self.go("9:37.32", Write(tan1[0]), run=0.5)
        self.go("9:38.74", Write(tan1[1:3]), run=0.5)
        self.go("9:40.12", Write(tan1[3:]), run=0.4)
        self.play(Create(box(tan1[4], YEL)), run_time=0.4)


class K03_ThirtySixty(Shot):
    def body(self):
        self.title("The 30-60-90 Triangle", "9:41.76")
        s = 4.0
        L, R = np.array([-6.4, -2.9, 0]), np.array([-6.4 + s, -2.9, 0])
        P = np.array([-6.4 + s / 2, -2.9 + s * np.sqrt(3) / 2, 0])
        Mid = (L + R) / 2
        eq = Polygon(L, R, P, color=CHALK, stroke_width=5)
        self.go("9:45.48", Create(eq), run=1.0)
        twos = VGroup(side_label(L, R, "2", DIM, 46, side=-1), side_label(R, P, "2", DIM, 46, side=-1), side_label(P, L, "2", DIM, 46, side=-1))
        self.go("9:47.12", FadeIn(twos), run=0.4)
        alt = dashed(P, Mid, YEL, 4)
        self.go("9:48.86", Create(alt), run=0.7)
        left = Polygon(L, Mid, P, color=CHALK, stroke_width=5)
        right = Polygon(Mid, R, P, color=CHALK, stroke_width=5)
        self.remove(eq)
        self.add(left, right)
        self.go("9:50.40", FadeOut(left), FadeOut(twos[0]), FadeOut(twos[2]),
                Transform(alt, Line(P, Mid, color=CHALK, stroke_width=5)), run=0.6)
        a30 = angle_arc(P, Mid, R, r=0.7, label=r"30" + DEG, label_size=38, label_buff=0.45)
        a60 = angle_arc(R, P, Mid, r=0.6, label=r"60" + DEG, label_size=38, label_buff=0.45)
        mark = right_angle_mark(Mid, R, P)
        self.go("9:51.68", FadeIn(a30), run=0.4)
        self.go("9:52.30", FadeIn(a60), run=0.4)
        self.go("9:52.92", Create(mark), run=0.4)
        hyp = side_label(R, P, "2", GRN, 50, side=-1)
        self.go("9:53.94", Transform(twos[1], hyp), run=0.4)
        short = side_label(Mid, R, "1", BLUE, 50, side=-1)
        self.go("9:55.62", FadeIn(short, shift=UP * 0.1), run=0.4)
        pyth = M(r"1^2", "+", r"b^2", "=", r"2^2", size=56).move_to([-0.4, 1.4, 0], aligned_edge=LEFT)
        self.go("9:57.36", Write(pyth), run=0.8)
        b3 = M(r"b = \sqrt{3}", size=56).next_to(pyth, DOWN, aligned_edge=LEFT, buff=0.35)
        long = side_label(P, Mid, r"\sqrt{3}", PINK, 50, side=-1)
        self.go("9:59.36", Write(b3), FadeIn(long), run=0.6)
        # ratios in two columns
        self.wipe("10:00.40", run=0.3, keep=[right, alt, a30, a60, mark, twos, twos[1], hyp, short, long])
        c30 = VGroup(M(r"\sin 30" + DEG, "=", r"\frac{1}{2}", size=48), M(r"\cos 30" + DEG, "=", r"\frac{\sqrt{3}}{2}", size=48),
                     M(r"\tan 30" + DEG, "=", r"\frac{1}{\sqrt{3}}", "=", r"\frac{\sqrt{3}}{3}", size=48)).arrange(DOWN, aligned_edge=LEFT, buff=0.38)
        c60 = VGroup(M(r"\sin 60" + DEG, "=", r"\frac{\sqrt{3}}{2}", size=48), M(r"\cos 60" + DEG, "=", r"\frac{1}{2}", size=48),
                     M(r"\tan 60" + DEG, "=", r"\sqrt{3}", size=48)).arrange(DOWN, aligned_edge=LEFT, buff=0.38)
        c30.move_to([-1.3, 1.75, 0], aligned_edge=UL)
        c60.move_to([3.7, 1.75, 0], aligned_edge=UL)
        for col in (c30, c60):
            col[0][0].set_color(PINK); col[1][0].set_color(BLUE); col[2][0].set_color(GRN)
        h30 = pill("30°", YEL, 36).next_to(c30, UP, buff=0.15).align_to(c30, LEFT)
        h60 = pill("60°", YEL, 36).next_to(c60, UP, buff=0.15).align_to(c60, LEFT)
        c30.shift(DOWN * 0.45); c60.shift(DOWN * 0.45)
        h30.shift(DOWN * 0.45); h60.shift(DOWN * 0.45)
        self.go("10:01.06", FadeIn(h30), Indicate(a30[1]), run=0.5)
        self.go("10:02.24", Write(c30[0][0]), run=0.4)
        self.go("10:03.22", Write(c30[0][1:]), Indicate(short, color=BLUE), run=0.5)
        self.go("10:05.46", Write(c30[1][0]), run=0.4)
        self.go("10:06.64", Write(c30[1][1:]), run=0.5)
        self.go("10:08.12", Write(c30[2][0]), run=0.4)
        self.go("10:09.26", Write(c30[2][1:3]), run=0.5)
        self.go("10:10.90", Write(c30[2][3:]), run=0.5)
        self.go("10:12.30", FadeIn(h60), Indicate(a60[1]), run=0.4)
        self.go("10:12.62", Write(c60[0][0]), run=0.4)
        self.go("10:13.80", Write(c60[0][1:]), run=0.5)
        self.go("10:15.22", Write(c60[1][0]), run=0.4)
        self.go("10:16.40", Write(c60[1][1:]), run=0.4)
        self.go("10:16.90", Write(c60[2][0]), run=0.4)
        self.go("10:18.36", Write(c60[2][1:]), run=0.4)


class K03_TableTrick(Shot):
    def body(self):
        self.title("A Trick for the Whole Table", "10:19.66")
        xs = [-3.2, -1.1, 1.0, 3.1, 5.2]
        yh, yn, yc = 1.35, -0.15, -1.85
        lab_x = -5.6
        angs = ["0", "30", "45", "60", "90"]
        hdr_lab = M(r"\theta", size=56, color=YEL).move_to([lab_x, yh, 0])
        hline = Line([lab_x - 0.9, yh - 0.6, 0], [6.3, yh - 0.6, 0], color=DIM, stroke_width=3)
        vline = Line([lab_x + 0.9, yh + 0.6, 0], [lab_x + 0.9, yc - 0.75, 0], color=DIM, stroke_width=3)
        self.go("10:22.04", FadeIn(hdr_lab), Create(hline), Create(vline), run=0.5)
        heads = [M(a + DEG, size=54, color=YEL).move_to([x, yh, 0]) for a, x in zip(angs, xs)]
        for h, t in zip(heads, ["10:22.82", "10:23.62", "10:24.36", "10:25.50", "10:26.30"]):
            self.go(t, FadeIn(h, shift=DOWN * 0.15), run=0.35)
        nlab = M("n", size=54, color=DIM).move_to([lab_x, yn, 0])
        self.go("10:27.22", FadeIn(nlab), run=0.3)
        nums = [M(str(i), size=56).move_to([x, yn, 0]) for i, x in enumerate(xs)]
        for n, t in zip(nums, ["10:28.82", "10:29.54", "10:30.30", "10:30.86", "10:31.52"]):
            self.go(t, FadeIn(n, scale=1.3), run=0.3)
        roots = [M(rf"\sqrt{{{i}}}", size=56).move_to([x, yn, 0]) for i, x in enumerate(xs)]
        self.go("10:32.80", *[TransformMatchingShapes(n, r) for n, r in zip(nums, roots)], run=0.7)
        fr = [M(rf"\frac{{\sqrt{{{i}}}}}{{2}}", size=56).move_to([x, yn, 0]) for i, x in enumerate(xs)]
        self.go("10:34.12", *[TransformMatchingShapes(r, f) for r, f in zip(roots, fr)], run=0.6)
        sinlab = M(r"\sin\theta", size=52, color=PINK).move_to([lab_x, yn, 0])
        simple = {0: "0", 1: r"\frac{1}{2}", 4: "1"}
        steps = [(0, "10:35.48", "10:37.54", "10:38.80"), (1, "10:40.44", "10:41.92", "10:43.40"), (2, "10:44.22", None, "10:46.94"),
                 (3, "10:48.72", None, "10:50.64"), (4, "10:51.96", "10:53.46", "10:54.26")]
        vals = list(fr)
        for i, t_hi, t_simpl, t_sin in steps:
            hi = box(vals[i], YEL, buff=0.12)
            self.go(t_hi, Create(hi), run=0.3)
            if t_simpl:
                new = M(simple[i], size=58, color=PINK).move_to([xs[i], yn, 0])
                self.go(t_simpl, ReplacementTransform(vals[i], new), run=0.4)
                vals[i] = new
            else:
                self.play(vals[i].animate.set_color(PINK), run_time=0.3)
            if i == 0:
                self.go(t_sin, ReplacementTransform(nlab, sinlab), run=0.4)
            else:
                self.go(t_sin, Indicate(heads[i], color=YEL), run=0.4)
            self.play(FadeOut(hi), run_time=0.25)
        coslab = M(r"\cos\theta", size=52, color=BLUE).move_to([lab_x, yc, 0])
        copies = [v.copy() for v in vals]
        self.go("10:55.96", FadeIn(coslab), run=0.4)
        arrow = CurvedArrow([5.6, yn - 0.55, 0], [-3.6, yc + 0.5, 0], angle=-0.25, color=DIM, stroke_width=3, tip_length=0.2)
        self.go("10:57.00", Create(arrow), *[c.animate.move_to([xs[4 - i], yc, 0]).set_color(BLUE) for i, c in enumerate(copies)], run=1.1)
        self.play(FadeOut(arrow), run_time=0.3)
        b0 = box(copies[0], BLUE, buff=0.12)
        self.go("10:58.90", Create(b0), Indicate(heads[0]), run=0.5)
        b4 = box(copies[4], BLUE, buff=0.12)
        self.go("11:00.72", ReplacementTransform(b0, b4), Indicate(heads[4]), run=0.5)
        everything = VGroup(hdr_lab, hline, vline, sinlab, coslab, *heads, *vals, *copies)
        frame = panel(everything, PURP, buff=0.3)
        self.go("11:03.24", FadeOut(b4), Create(frame), run=0.8)
        stars = VGroup(*[Star(n=5, outer_radius=0.16, color=YEL, fill_opacity=1).move_to(p) for p in
                         [frame.get_corner(UR) + [0.1, 0.1, 0], frame.get_corner(UL) + [-0.1, 0.1, 0], frame.get_corner(DR) + [0.1, -0.1, 0]]])
        self.play(LaggedStart(*[GrowFromCenter(s) for s in stars], lag_ratio=0.2), run_time=0.6)
        note = VGroup(H("a whole table from one tiny pattern:", 34, YEL), M(r"\frac{\sqrt{n}}{2}", size=42, color=YEL)).arrange(RIGHT, buff=0.3).to_edge(DOWN, buff=0.08)
        self.go("11:04.86", FadeIn(note, shift=UP * 0.2), run=0.6)


class K03_QuickFire(Shot):
    def body(self):
        self.title("Quick Fire!", animate=False)
        qs = [(r"\sin 30" + DEG, r"\frac{1}{2}", PINK, "11:11.34", "11:12.70"),
              (r"\cos 45" + DEG, r"\frac{\sqrt{2}}{2}", BLUE, "11:14.04", "11:15.88"),
              (r"\tan 60" + DEG, r"\sqrt{3}", GRN, "11:17.60", "11:19.18"),
              (r"\cos 60" + DEG, r"\frac{1}{2}", BLUE, "11:20.64", "11:22.36")]
        pos = [[-3.4, 0.9, 0], [3.4, 0.9, 0], [-3.4, -1.7, 0], [3.4, -1.7, 0]]
        for (q, a, col, tq, ta), p in zip(qs, pos):
            lhs = M(q, "=", size=64).move_to(p).shift(LEFT * 0.7)
            lhs[0].set_color(col)
            qm = M("?", size=64, color=DIM).next_to(lhs, RIGHT, buff=0.3)
            self.go(tq, FadeIn(lhs, scale=0.85), FadeIn(qm), run=0.4)
            ans = M(a, size=64, color=YEL).next_to(lhs, RIGHT, buff=0.3)
            ck = tick_mark(GRN, 0.5).next_to(ans, RIGHT, buff=0.35)
            self.go(ta, ReplacementTransform(qm, ans), run=0.4)
            self.play(Create(ck), run_time=0.3)
        star = Star(n=5, outer_radius=0.36, color=YEL, fill_opacity=0.9)
        note = H("All four?  You're ahead of most students!", 40, YEL)
        VGroup(star, note).arrange(RIGHT, buff=0.3).to_edge(DOWN, buff=0.3)
        self.go("11:24.34", GrowFromCenter(star), Write(note), run=0.9)
        self.play(Rotate(star, PI / 5), run_time=0.6)


# ---------- Chapter 5 ----------

class K03_Ladder(Shot):
    def body(self):
        self.title("The Ladder Problem", "11:37.92")
        wx, gy = -1.2, -2.8
        wall = VGroup(Line([wx, gy, 0], [wx, 2.1, 0], color=CHALK, stroke_width=6),
                      *[Line([wx, y, 0], [wx + 0.22, y + 0.22, 0], color=FAINT, stroke_width=2) for y in np.arange(gy + 0.2, 2.0, 0.4)])
        gr = ground(-6.6, wx, gy)
        L = 5.0
        foot = np.array([wx - L * 0.5, gy, 0])
        top = np.array([wx, gy + L * np.sqrt(3) / 2, 0])
        lad = ladder(foot, top)
        self.play(Create(gr), Create(wall), Create(lad), run_time=0.6)
        a60 = angle_arc(foot, [wx, gy, 0], top, r=0.8, label=r"60" + DEG, label_size=44, label_buff=0.5)
        self.go("11:39.10", FadeIn(a60), run=0.4)
        harrow = DoubleArrow([wx + 0.45, gy, 0], [wx + 0.45, top[1], 0], buff=0, color=PINK, stroke_width=4, tip_length=0.2)
        hq = M("h = ?", size=50, color=PINK).next_to(harrow, RIGHT, buff=0.15)
        self.go("11:41.22", GrowFromCenter(harrow), FadeIn(hq), run=0.5)
        hyp = Line(foot, top, color=GRN, stroke_width=7)
        self.go("11:43.56", Create(hyp), run=0.6)
        lab10 = side_label(foot, top, r"10\,\text{m}", GRN, 48, side=1)
        self.go("11:45.66", FadeIn(lab10, scale=1.2), run=0.4)
        opp = Text("opposite", font=HAND, font_size=30, color=PINK).next_to(hq, DOWN, buff=0.15)
        self.go("11:48.68", Indicate(hq, color=PINK), FadeIn(opp), run=0.6)
        soh = pill("S O H", PINK, 44).move_to([3.0, 1.75, 0])
        self.go("11:51.24", FadeIn(soh, scale=0.8), run=0.4)
        sine = H("opposite & hypotenuse  =  sine", 34, YEL).next_to(soh, DOWN, buff=0.2)
        self.go("11:52.66", FadeIn(sine), run=0.4)
        lines = [M(r"\sin 60" + DEG, "=", r"\frac{h}{10}", size=54), M("h", "=", r"10\sin 60" + DEG, size=54),
                 M("h", "=", r"10\cdot\frac{\sqrt{3}}{2}", size=54), M("h", "=", r"5\sqrt{3}", size=54), M("h", r"\approx", r"8.66\,\text{m}", size=54)]
        y = 0.0
        shown = []
        times = ["11:54.04", "11:57.06", "12:00.08", "12:02.56", "12:03.96"]
        for i, (ln, t) in enumerate(zip(lines, times)):
            ln.move_to([3.0, 0, 0])
            ln[0].set_color(PINK if i == 0 else CHALK)
            if i == 0:
                ln.move_to([3.0, 0.25, 0])
                self.go(t, Write(ln), run=0.8)
            else:
                ln.next_to(shown[-1], DOWN, buff=0.28)
                if i >= 3:
                    ln.align_to(shown[-1], LEFT)
                else:
                    ln.align_to(shown[-1], LEFT)
                self.go(t, Write(ln), run=0.7)
            shown.append(ln)
            if i == 2:
                # keep the stack short: drop the first two lines up and away
                self.play(FadeOut(shown[0]), FadeOut(sine), VGroup(shown[1], shown[2]).animate.shift(UP * 1.15), run_time=0.4)
        ans = M(r"8.66\,\text{m}", size=50, color=YEL).move_to(hq, aligned_edge=LEFT)
        self.play(Create(box(shown[-1], YEL)), Transform(hq, ans), run_time=0.5)
        note = H("You just measured a wall\nwithout touching it!", 34, YEL).move_to([-4.2, -3.45, 0])
        self.go("12:06.72", Write(note), run=0.9)
        self.play(Create(tick_mark(GRN, 0.5).next_to(note, RIGHT, buff=0.2)), run_time=0.3)


class K03_ElevDep(Shot):
    def body(self):
        self.title("Elevation & Depression", "12:09.08")
        gy = -2.9
        gl = ground(-6.8, -0.6, gy)
        p1 = person([-5.8, gy, 0], h=1.4)
        bird = VGroup(Arc(radius=0.25, start_angle=PI * 0.1, angle=PI * 0.8, color=CHALK, stroke_width=4).shift(LEFT * 0.24),
                      Arc(radius=0.25, start_angle=PI * 0.1, angle=PI * 0.8, color=CHALK, stroke_width=4).shift(RIGHT * 0.24)).move_to([-1.6, 1.4, 0])
        self.go("12:12.28", Create(gl), FadeIn(p1), run=0.5)
        self.go("12:12.72", FadeIn(bird, shift=DOWN * 0.2), run=0.4)
        e = p1.eye
        hz = dashed(e, [-0.9, e[1], 0], DIM, 3)
        self.go("12:14.70", Create(hz), run=0.5)
        sight = Arrow(e, bird.get_center() + [-0.15, -0.15, 0], buff=0.05, color=YEL, stroke_width=4, tip_length=0.2)
        self.go("12:15.84", GrowArrow(sight), run=0.5)
        arc = angle_arc(e, [-0.9, e[1], 0], bird.get_center(), r=1.0, color=GRN)
        lab = H("angle of elevation", 36, GRN).move_to([-2.6, -2.35, 0])
        self.go("12:17.12", Create(arc), Write(lab), run=0.6)
        # cliff side
        cliff = Polygon([0.4, -3.2, 0], [0.4, 0.9, 0], [2.3, 0.9, 0], [2.8, -0.6, 0], [2.7, -3.2, 0], color=CHALK, stroke_width=4, fill_color="#8a7d6c", fill_opacity=0.25)
        water = VMobject(stroke_color=BLUE, stroke_width=4).set_points_smoothly([[2.7 + 0.35 * i, -3.0 + 0.07 * (-1) ** i, 0] for i in range(12)])
        p2 = person([1.5, 0.9, 0], h=1.15)
        bt = boat([5.9, -3.0, 0])
        self.go("12:18.78", FadeIn(cliff), Create(water), FadeIn(p2), FadeIn(bt), run=0.6)
        e2 = p2.eye
        hz2 = dashed(e2, [6.8, e2[1], 0], DIM, 3)
        self.go("12:22.74", Create(hz2), run=0.5)
        sight2 = Arrow(e2, bt.get_top() + [-0.1, 0, 0], buff=0.05, color=YEL, stroke_width=4, tip_length=0.2)
        self.go("12:24.32", GrowArrow(sight2), run=0.5)
        arc2 = angle_arc(e2, bt.get_top(), [6.8, e2[1], 0], r=1.3, color=ORG)
        lab2 = H("angle of depression", 36, ORG).move_to([5.0, 1.4, 0])
        self.go("12:25.40", Create(arc2), Write(lab2), run=0.6)


class K03_Tree(Shot):
    def body(self):
        self.title("How Tall Is the Tree?", "12:27.06")
        gy = -2.8
        V = np.array([-6.0, gy, 0])
        tx = -1.4
        top_y = gy + (tx - V[0]) * np.tan(PI / 6)
        gl = ground(-6.7, -0.2, gy)
        you = person([-6.35, gy, 0], h=1.0)
        tr = tree([tx, gy, 0], top_y)
        self.go("12:28.36", Create(gl), FadeIn(you), run=0.4)
        b50 = BraceBetweenPoints(V, [tx, gy, 0], DOWN, color=BLUE)
        l50 = M(r"50\,\text{m}", size=44, color=BLUE).next_to(b50, DOWN, buff=0.08)
        self.go("12:28.86", GrowFromCenter(b50), FadeIn(l50), run=0.4)
        self.go("12:30.10", FadeIn(tr, shift=UP * 0.2), run=0.5)
        T = np.array([tx, top_y, 0])
        sight = Line(V, T, color=YEL, stroke_width=4)
        self.go("12:31.12", Create(sight), run=0.7)
        a30 = angle_arc(V, [tx, gy, 0], T, r=1.1, label=r"30" + DEG, label_size=42, label_buff=0.55)
        self.go("12:33.22", FadeIn(a30), run=0.5)
        hline = DashedLine([tx + 1.4, gy, 0], [tx + 1.4, top_y, 0], color=PINK, stroke_width=4)
        cap = DashedLine([tx, top_y, 0], [tx + 1.55, top_y, 0], color=FAINT, stroke_width=2)
        hq = M("h = ?", size=48, color=PINK).next_to(hline, RIGHT, buff=0.15)
        self.go("12:35.86", Create(cap), Create(hline), FadeIn(hq), run=0.5)
        adj = Text("adjacent", font=HAND, font_size=30, color=BLUE).next_to(l50, RIGHT, buff=0.3)
        self.go("12:39.50", FadeIn(adj), Indicate(l50, color=BLUE), run=0.5)
        opp = Text("opposite", font=HAND, font_size=30, color=PINK).next_to(hq, DOWN, buff=0.12)
        self.go("12:42.16", FadeIn(opp), Indicate(hq, color=PINK), run=0.5)
        toa = pill("T O A", GRN, 44).move_to([3.4, 1.75, 0])
        self.go("12:43.24", FadeIn(toa, scale=0.8), run=0.4)
        lines = [M(r"\tan 30" + DEG, "=", r"\frac{h}{50}", size=54), M("h", "=", r"50\tan 30" + DEG, size=54),
                 M("h", "=", r"\frac{50}{\sqrt{3}}", size=54), M("h", r"\approx", r"28.9\,\text{m}", size=54)]
        lines[0][0].set_color(GRN)
        col = VGroup(*lines).arrange(DOWN, aligned_edge=LEFT, buff=0.3).move_to([3.4, -0.75, 0])
        for ln, t in zip(lines, ["12:45.78", "12:48.62", "12:51.82", "12:53.72"]):
            self.go(t, Write(ln), run=0.7)
        ans = M(r"28.9\,\text{m}", size=46, color=YEL).move_to(hq, aligned_edge=LEFT)
        self.play(Create(box(lines[-1], YEL)), Transform(hq, ans), run_time=0.5)


class K03_Inverse(Shot):
    def body(self):
        self.title("Know the Sides? Find the Angle", "13:00.76")
        A, B, C = np.array([-5.8, -2.5, 0]), np.array([-1.6, -2.5, 0]), np.array([-1.6, -0.08, 0])
        tri = VGroup(Polygon(A, B, C, color=CHALK, stroke_width=5), right_angle_mark(B, A, C))
        self.play(Create(tri), run_time=0.6)
        s1 = side_label(B, C, "1", PINK, 48, side=-1)
        s2 = side_label(A, C, "2", GRN, 48, side=1)
        self.go("13:02.04", FadeIn(s1), FadeIn(s2), run=0.4)
        q = angle_arc(A, B, C, r=0.9, label=r"\theta = ?", label_size=42, label_buff=0.85)
        self.go("13:03.30", FadeIn(q), run=0.4)
        self.title("Inverse Trig Functions", "13:05.04")
        # forwards and backwards machine
        fw = VGroup(M(r"30" + DEG, size=52, color=YEL), Arrow(LEFT, RIGHT, color=CHALK, stroke_width=4).scale(0.8),
                    pill("sin", PINK, 36), Arrow(LEFT, RIGHT, color=CHALK, stroke_width=4).scale(0.8), M(r"\frac{1}{2}", size=52)).arrange(RIGHT, buff=0.2)
        bw = VGroup(M(r"30" + DEG, size=52, color=YEL), Arrow(RIGHT, LEFT, color=GRN, stroke_width=4).scale(0.8),
                    mpill(r"\sin^{-1}", GRN, 38), Arrow(RIGHT, LEFT, color=GRN, stroke_width=4).scale(0.8), M(r"\frac{1}{2}", size=52)).arrange(RIGHT, buff=0.2)
        fw.move_to([2.9, 1.45, 0]); bw.move_to([2.9, 0.15, 0])
        self.go("13:05.52", FadeIn(fw, shift=RIGHT * 0.3), run=0.5)
        self.go("13:07.52", FadeIn(bw, shift=LEFT * 0.3), run=0.5)
        e1 = M(r"\sin\theta", "=", r"\frac{1}{2}", size=54).move_to([0.2, -1.45, 0], aligned_edge=LEFT)
        e1[0].set_color(PINK)
        self.go("13:09.20", Write(e1), run=0.8)
        e2 = M(r"\theta", "=", r"\sin^{-1}\!\left(\frac{1}{2}\right)", size=54).next_to(e1, RIGHT, buff=0.7)
        e2[2].set_color(GRN)
        self.go("13:11.74", Write(e2[:2]), run=0.3)
        self.go("13:12.48", Write(e2[2]), run=0.6)
        e3 = M("=", r"30" + DEG, size=54, color=YEL).next_to(e2, DOWN, buff=0.35).align_to(e2[1], LEFT)
        self.go("13:15.02", Write(e3), run=0.4)
        self.play(Create(box(e3, YEL)), Transform(q[1], M(r"30" + DEG, size=42, color=YEL).move_to(q[1])), run_time=0.4)
        # calculator warning
        self.wipe("13:16.30", run=0.35)
        calc = RoundedRectangle(width=3.0, height=4.4, corner_radius=0.3, stroke_color=CHALK, stroke_width=4).move_to([-4.3, -0.65, 0])
        screen = RoundedRectangle(width=2.4, height=0.9, corner_radius=0.12, stroke_color=DIM, stroke_width=3).move_to(calc.get_top() + DOWN * 0.75)
        keys = VGroup(*[RoundedRectangle(width=0.6, height=0.45, corner_radius=0.08, stroke_color=FAINT, stroke_width=2).move_to(calc.get_center() + [(-0.8 + 0.8 * (i % 3)), 0.2 - 0.62 * (i // 3), 0]) for i in range(9)])
        key = RoundedRectangle(width=1.6, height=0.6, corner_radius=0.12, stroke_color=GRN, stroke_width=4, fill_color=GRN, fill_opacity=0.15).move_to(calc.get_center() + [0, 0.5, 0])
        klab = M(r"\sin^{-1}", size=40, color=GRN).move_to(key)
        keys.shift(DOWN * 0.55)
        self.go("13:16.80", Create(calc), Create(screen), FadeIn(keys), run=0.7)
        self.go("13:19.88", FadeIn(key), Write(klab), run=0.5)
        self.play(Indicate(VGroup(key, klab), color=GRN), run_time=0.6)
        warn = pill("Careful!", RED, 42).move_to([2.2, 1.5, 0])
        self.go("13:21.88", FadeIn(warn, scale=0.8), run=0.4)
        neq = M(r"\sin^{-1}x", r"\neq", r"\frac{1}{\sin x}", size=62).move_to([2.2, 0.0, 0])
        neq[0].set_color(GRN)
        self.go("13:22.86", Write(neq[0]), run=0.5)
        self.go("13:24.08", Write(neq[1:]), run=0.6)
        self.play(Create(cross_mark(RED, 0.35).move_to(neq[2])), run_time=0.3)
        undo = VGroup(M(r"\sin^{-1}", size=58, color=GRN), H("=  undo sine", 50, YEL)).arrange(RIGHT, buff=0.3).move_to([2.2, -1.75, 0])
        self.go("13:25.98", FadeIn(undo, shift=UP * 0.2), run=0.5)
        self.play(Create(box(undo, GRN)), run_time=0.4)


class K03_Ramp(Shot):
    def body(self):
        self.title("Example: The Ramp", "13:27.94")
        A, B, C = np.array([-6.2, -2.6, 0]), np.array([-1.8, -2.6, 0]), np.array([-1.8, 1.8, 0])
        ramp = Polygon(A, B, C, color=CHALK, stroke_width=5, fill_color=ORG, fill_opacity=0.12)
        self.go("13:29.24", Create(ramp), run=0.7)
        mark = right_angle_mark(B, A, C)
        o7 = side_label(B, C, r"7\,\text{m}", PINK, 46, side=-1)
        self.go("13:29.92", FadeIn(o7), Create(mark), run=0.4)
        a7 = side_label(A, B, r"7\,\text{m}", BLUE, 46, side=-1)
        self.go("13:32.32", FadeIn(a7), run=0.4)
        q = angle_arc(A, B, C, r=1.0, label=r"\theta", label_size=46, label_buff=0.4)
        self.go("13:33.80", FadeIn(q), run=0.4)
        opp = Text("opposite", font=HAND, font_size=30, color=PINK).next_to(o7, RIGHT, buff=0.2)
        adj = Text("adjacent", font=HAND, font_size=30, color=BLUE).next_to(a7, RIGHT, buff=0.3)
        self.go("13:35.30", FadeIn(opp), run=0.3)
        self.go("13:36.50", FadeIn(adj), run=0.3)
        l1 = M(r"\tan\theta", "=", r"\frac{7}{7}", "=", "1", size=58).move_to([2.6, 0.9, 0])
        l1[0].set_color(GRN)
        self.go("13:37.96", Write(l1[:3]), run=0.7)
        self.go("13:40.30", Write(l1[3:]), run=0.4)
        l2 = M(r"\theta", "=", r"\tan^{-1}(1)", size=58).next_to(l1, DOWN, buff=0.5).align_to(l1, LEFT)
        l2[2].set_color(GRN)
        self.go("13:41.54", Write(l2), run=0.7)
        l3 = M("=", r"45" + DEG, size=58, color=YEL).next_to(l2, DOWN, buff=0.4).align_to(l2[1], LEFT)
        self.go("13:43.46", Write(l3), run=0.4)
        self.play(Create(box(l3, YEL)), Transform(q[1], M(r"45" + DEG, size=44, color=YEL).move_to(q[1]).shift(RIGHT * 0.25)), run_time=0.4)


def practice_diagrams():
    """Kite (left) and lighthouse (right), returned as dicts of parts so both scenes draw the same picture."""
    gy = -2.8
    K = {}
    K["gl"] = ground(-6.8, -0.9, gy)
    anchor = np.array([-6.2, gy, 0])
    L = 4.5
    end = anchor + L * np.array([np.cos(PI / 6), np.sin(PI / 6), 0])
    K["string"] = Line(anchor, end, color=CHALK, stroke_width=4)
    K["kite"] = kite(end + [0.05, 0.25, 0])
    K["a"] = angle_arc(anchor, [-0.9, gy, 0], end, r=0.9, label=r"30" + DEG, label_size=38, label_buff=0.5)
    K["l80"] = side_label(anchor, end, r"80\,\text{m}", GRN, 44, side=1)
    K["h"] = DashedLine([end[0], gy, 0], end, color=PINK, stroke_width=4)
    K["hq"] = M("h = ?", size=44, color=PINK).next_to(K["h"], RIGHT, buff=0.15).shift(DOWN * 0.3)
    K["anchor"], K["end"] = anchor, end
    Lh = {}
    bx, h = 1.6, 3.2
    Lh["gl"] = ground(0.7, 6.8, gy)
    Lh["tower"] = lighthouse([bx, gy, 0], h)
    O = np.array([bx + 0.3, gy + h, 0])
    boat_x = O[0] + h
    Lh["boat"] = boat([boat_x, gy, 0])
    Lh["hz"] = dashed(O, [6.8, O[1], 0], DIM, 3)
    Lh["sight"] = Line(O, [boat_x, gy + 0.05, 0], color=YEL, stroke_width=4)
    Lh["a"] = angle_arc(O, [boat_x, gy, 0], [6.8, O[1], 0], r=1.0, label=r"45" + DEG, label_size=38, label_buff=0.45)
    Lh["l40"] = M(r"40\,\text{m}", size=44, color=PINK).next_to(Lh["tower"], LEFT, buff=0.15)
    Lh["d"] = DoubleArrow([bx, gy - 0.35, 0], [boat_x, gy - 0.35, 0], buff=0, color=BLUE, stroke_width=4, tip_length=0.18)
    Lh["dq"] = M("d = ?", size=44, color=BLUE).next_to(Lh["d"], DOWN, buff=0.08)
    Lh["O"], Lh["bx"], Lh["boat_x"] = O, bx, boat_x
    q1 = pill("Question 1", YEL, 36).move_to([-3.8, 1.95, 0])
    q2 = pill("Question 2", YEL, 36).move_to([3.8, 1.95, 0])
    return K, Lh, q1, q2


class K03_PracticeQ(Shot):
    def body(self):
        self.title("Practice", "13:47.34")
        K, Lh, q1, q2 = practice_diagrams()
        self.play(FadeIn(q1, scale=0.8), run_time=0.4)
        t1 = H("How high is the kite?", 34).next_to(q1, DOWN, buff=0.2)
        self.go("13:48.66", Create(K["gl"]), FadeIn(K["kite"], shift=UP * 0.3), run=0.35)
        self.go("13:49.02", Create(K["string"]), run=0.4)
        self.go("13:49.56", FadeIn(K["l80"]), run=0.4)
        self.go("13:51.22", FadeIn(K["a"]), run=0.4)
        self.go("13:53.78", Create(K["h"]), FadeIn(K["hq"]), Write(t1), run=0.6)
        self.go("13:55.50", FadeIn(q2, scale=0.8), run=0.4)
        self.go("13:57.30", Create(Lh["gl"]), FadeIn(Lh["tower"], shift=UP * 0.3), run=0.45)
        self.go("13:57.92", FadeIn(Lh["l40"]), run=0.4)
        self.go("14:00.16", FadeIn(Lh["boat"], shift=LEFT * 0.3), run=0.4)
        self.go("14:00.78", Create(Lh["hz"]), run=0.4)
        self.play(Create(Lh["sight"]), FadeIn(Lh["a"]), run_time=0.5)
        t2 = H("How far is the boat?", 34).next_to(q2, DOWN, buff=0.2)
        self.go("14:03.64", GrowFromCenter(Lh["d"]), FadeIn(Lh["dq"]), Write(t2), run=0.6)
        pz = VGroup(pause_icon(YEL, 0.38), H("Pause and solve!", 44, YEL)).arrange(RIGHT, buff=0.25).move_to([0, 0.2, 0])
        pz = VGroup(RoundedRectangle(width=pz.width + 0.8, height=pz.height + 0.5, corner_radius=0.3, stroke_color=YEL, stroke_width=4,
                                     fill_color="#1c1c1e", fill_opacity=0.92).move_to(pz), pz)
        self.go("14:06.64", FadeIn(pz, scale=0.8), run=0.4)
        self.play(Indicate(pz, color=YEL, scale_factor=1.1), run_time=0.8)


class K03_Answers(Shot):
    def body(self):
        self.title("Practice", animate=False)
        K, Lh, q1, q2 = practice_diagrams()
        self.add(q1, q2, *[K[k] for k in ("gl", "string", "kite", "a", "l80", "h", "hq")],
                 *[Lh[k] for k in ("gl", "tower", "boat", "hz", "sight", "a", "l40", "d", "dq")])
        self.go("14:08.62", Indicate(q1, color=YEL), run=0.5)
        hyp = Line(K["anchor"], K["end"], color=GRN, stroke_width=7)
        self.go("14:09.88", Create(hyp), run=0.5)
        self.go("14:11.66", Indicate(K["hq"], color=PINK), run=0.5)
        e = M("h", "=", r"80\sin 30" + DEG, size=50).next_to(q1, DOWN, buff=0.3)
        self.go("14:13.28", Write(e), run=0.7)
        e2 = M("h", "=", r"80\cdot\frac{1}{2}", "=", r"40\,\text{m}", size=50).move_to(e)
        self.go("14:15.96", *[ReplacementTransform(e[i], e2[i]) for i in range(3)], run=0.5)
        e2[4].set_color(YEL)
        self.go("14:17.32", Write(e2[3:]), run=0.4)
        self.play(Create(box(e2[4], YEL, buff=0.1)), Transform(K["hq"], M(r"40\,\text{m}", size=44, color=YEL).move_to(K["hq"], aligned_edge=LEFT)), run_time=0.4)
        self.go("14:19.10", Indicate(q2, color=YEL), run=0.5)
        self.go("14:20.90", Indicate(Lh["a"], color=YEL), run=0.6)
        bx, gy, O, boat_x = Lh["bx"], -2.8, Lh["O"], Lh["boat_x"]
        B = np.array([boat_x, gy + 0.05, 0])
        a2 = angle_arc(B, O, [bx, gy, 0], r=0.8, label=r"45" + DEG, label_size=34, label_buff=0.45)
        rm = right_angle_mark(np.array([bx + 0.3, gy, 0]), [boat_x, gy, 0], O, size=0.25)
        tag = pill("45 - 45 - 90", ORG, 34).next_to(q2, DOWN, buff=0.25)
        self.go("14:23.58", FadeIn(a2), Create(rm), run=0.5)
        self.go("14:24.44", FadeIn(tag, scale=0.8), run=0.4)
        eq = M(r"\text{height}", "=", r"\text{distance}", size=42).move_to([5.1, -0.9, 0])
        self.go("14:27.90", Write(eq), run=0.7)
        self.play(Indicate(Lh["l40"], color=PINK), run_time=0.5)
        ans = M(r"d = 40\,\text{m}", size=44, color=YEL).move_to(Lh["dq"])
        self.go("14:30.38", Transform(Lh["dq"], ans), run=0.4)
        self.play(Create(box(Lh["dq"], YEL, buff=0.1)), run_time=0.4)
        self.wipe("14:32.20", run=0.3)
        bt = VGroup(Star(n=5, outer_radius=0.5, color=YEL, fill_opacity=0.9), H("Beautiful!", 96, YEL),
                    Star(n=5, outer_radius=0.5, color=YEL, fill_opacity=0.9)).arrange(RIGHT, buff=0.4).move_to([0, 0.3, 0])
        self.play(GrowFromCenter(bt[0]), Write(bt[1]), GrowFromCenter(bt[2]), run_time=0.6)
        nxt = VGroup(H("Now: the big leap", 48, CHALK), Arrow(LEFT, RIGHT, color=CHALK, stroke_width=5).scale(0.7)).arrange(RIGHT, buff=0.25).next_to(bt, DOWN, buff=0.5)
        self.go("14:33.88", FadeIn(nxt, shift=RIGHT * 0.3), run=0.5)
        self.play(Rotate(bt[0], PI / 5), Rotate(bt[2], -PI / 5), run_time=0.6)
