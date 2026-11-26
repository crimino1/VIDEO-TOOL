"""Builder 01: series opener, roadmap, foundation, episode plan, Part 1 (juice machine, number machine,
f(x) notation, f(4), f(x) is not f times x, the one-output rule with a vending machine), Question 1."""
from common import *


# ---------------------------------------------------------------- chalk drawings

def poly(pts, color=CHALK, width=5, close=False):
    pts = [np.array([p[0], p[1], 0.0]) for p in pts]
    if close:
        pts.append(pts[0])
    return VMobject(stroke_color=color, stroke_width=width).set_points_as_corners(pts)


def head_of(s):
    """Same heading Shot.title builds, so the opener title can Transform into it."""
    word = Text(s, font=HAND, weight=BOLD, font_size=54, color=CHALK)
    word.to_edge(UP, buff=0.18)
    return VGroup(word, brush_line(word.width + 0.5, center=word.get_bottom() + DOWN * 0.08))


def walker(color=CHALK, s=1.0, w=5):
    """Stick figure, feet at the origin."""
    g = VGroup(Circle(radius=0.2, color=color, stroke_width=w).move_to([0, 1.3, 0]),
               seg([0, 1.1, 0], [0, 0.55, 0], color, w),
               seg([0, 0.95, 0], [-0.28, 0.65, 0], color, w), seg([0, 0.95, 0], [0.3, 0.7, 0], color, w),
               seg([0, 0.55, 0], [-0.25, 0, 0], color, w), seg([0, 0.55, 0], [0.25, 0, 0], color, w))
    return g.scale(s, about_point=ORIGIN)


def machine(c=ORIGIN, w=3.4, h=2.4, spout_y=-0.5, plate_h=0.85):
    """Box machine: funnel (rim, cone, neck) on top, spout on the right, dials, two legs.
    Returns (group, anchors); anchors["plate"] is a name plate to Create when text goes on the machine."""
    c = np.array(c, float)
    x0, x1, y0, y1 = -w / 2, w / 2, -h / 2, h / 2
    body = RoundedRectangle(width=w, height=h, corner_radius=0.18, stroke_color=CHALK, stroke_width=5)
    rt, nk = y1 + 1.0, y1 + 0.38
    funnel = VGroup(Ellipse(width=1.9, height=0.26, stroke_color=CHALK, stroke_width=4).move_to([0, rt, 0]),
                    poly([(-0.95, rt), (-0.2, nk), (-0.2, y1)], CHALK, 5), poly([(0.95, rt), (0.2, nk), (0.2, y1)], CHALK, 5))
    sy = spout_y * h / 2
    spout = VGroup(poly([(x1, sy + 0.14), (x1 + 0.62, sy + 0.14), (x1 + 0.62, sy - 0.32)], CHALK, 5),
                   poly([(x1, sy - 0.12), (x1 + 0.36, sy - 0.12), (x1 + 0.36, sy - 0.32)], CHALK, 5))
    legs = VGroup(seg([x0 + 0.35, y0, 0], [x0 + 0.35, y0 - 0.4, 0], CHALK, 5), seg([x1 - 0.35, y0, 0], [x1 - 0.35, y0 - 0.4, 0], CHALK, 5))
    dials = VGroup()
    for k in range(2):
        p = np.array([x0 + 0.45 + 0.5 * k, y0 + 0.36, 0])
        dials.add(Circle(radius=0.15, color=DIM, stroke_width=3).move_to(p), seg(p, p + [0.08, 0.1, 0], DIM, 3))
    g = VGroup(body, funnel, spout, legs, dials).shift(c)
    plate = RoundedRectangle(width=w - 0.8, height=plate_h, corner_radius=0.12, stroke_color=DIM, stroke_width=3).move_to(c + [0, 0.22, 0])
    A = dict(top=c + [0, rt + 0.05, 0], mouth=c + [0, y1 + 0.15, 0], out=c + [x1 + 0.49, sy - 0.32, 0],
             screen=plate.get_center(), floor=c[1] + y0 - 0.4, plate=plate)
    return g, A


def glass(c, w_top=1.0, w_bot=0.78, h=1.3):
    """Cup with its bottom centre at c. Returns (outline, fill(level 0..1, colour))."""
    c = np.array(c, float)
    pts = [c + [-w_top / 2, h, 0], c + [-w_bot / 2, 0, 0], c + [w_bot / 2, 0, 0], c + [w_top / 2, h, 0]]
    outline = VMobject(stroke_color=CHALK, stroke_width=5).set_points_as_corners(pts)

    def fill(level, color):
        y = h * 0.85 * level
        k = y / h
        wl = w_bot + (w_top - w_bot) * k
        return Polygon(c + [-w_bot / 2 + 0.06, 0.06, 0], c + [w_bot / 2 - 0.06, 0.06, 0], c + [wl / 2 - 0.06, max(y, 0.07), 0],
                       c + [-wl / 2 + 0.06, max(y, 0.07), 0], stroke_width=0, fill_color=color, fill_opacity=0.7)
    return outline, fill


def orange(r=0.32):
    return VGroup(Circle(radius=r, color=ORG, stroke_width=5, fill_color=ORG, fill_opacity=0.25),
                  VMobject(stroke_color=GRN, stroke_width=4).set_points_smoothly([[0.02, r - 0.02, 0], [0.18, r + 0.12, 0], [0.34, r + 0.06, 0]]),
                  Dot([0, r - 0.06, 0], radius=0.03, color=GRN))


def apple(r=0.32):
    body = VMobject(stroke_color=RED, stroke_width=5, fill_color=RED, fill_opacity=0.25).set_points_smoothly(
        [r * np.array([np.sin(a) * (1 + 0.08 * np.cos(2 * a)), np.cos(a) * 0.95 - 0.12 * np.cos(a) ** 8, 0]) for a in np.linspace(0, TAU, 25)])
    return VGroup(body, seg([0, r * 0.8, 0], [0.06, r * 1.25, 0], CHALK, 4),
                  VMobject(stroke_color=GRN, stroke_width=4).set_points_smoothly([[0.06, r * 1.1, 0], [0.24, r * 1.3, 0], [0.38, r * 1.15, 0]]))


def chips_bag(s=1.0):
    pts = [(-0.4, 0.55), (-0.3, 0.6), (-0.2, 0.55), (-0.1, 0.6), (0, 0.55), (0.1, 0.6), (0.2, 0.55), (0.3, 0.6), (0.4, 0.55),
           (0.36, 0), (0.4, -0.55), (-0.4, -0.55), (-0.36, 0)]
    return VGroup(poly(pts, YEL, 4, True), Circle(radius=0.16, color=YEL, stroke_width=3).move_to([0, 0.02, 0])).scale(s)


def can(s=1.0):
    return VGroup(RoundedRectangle(width=0.62, height=1.05, corner_radius=0.1, stroke_color=BLUE, stroke_width=4),
                  seg([-0.31, 0.32, 0], [0.31, 0.32, 0], BLUE, 3), seg([-0.31, -0.32, 0], [0.31, -0.32, 0], BLUE, 3)).scale(s)


def granola(s=1.0):
    g = VGroup(RoundedRectangle(width=1.3, height=0.46, corner_radius=0.08, stroke_color=ORG, stroke_width=4))
    for x in (-0.35, 0, 0.35):
        g.add(seg([x - 0.12, -0.15, 0], [x + 0.12, 0.15, 0], ORG, 3))
    return g.scale(s)


def scribble_lines(x0, x1, ys, seed=3):
    """Unreadable 'foreign script': wobbly broken strokes on a page."""
    rng = np.random.default_rng(seed)
    g = VGroup()
    for y in ys:
        x = x0
        while x < x1 - 0.3:
            L = min(rng.uniform(0.35, 0.9), x1 - x)
            xs = np.linspace(x, x + L, 14)
            yv = y + 0.07 * np.sin(xs * rng.uniform(9, 15) + rng.uniform(0, 6))
            g.add(VMobject(stroke_color=DIM, stroke_width=3).set_points_smoothly(np.column_stack([xs, yv, np.zeros_like(xs)])))
            x += L + rng.uniform(0.12, 0.25)
    return g


def pencil():
    """Pencil lying along +x with its tip at the origin."""
    body = poly([(0.45, 0.17), (3.2, 0.17), (3.2, -0.17), (0.45, -0.17)], YEL, 4, True)
    tip = VGroup(poly([(0.45, 0.17), (0, 0), (0.45, -0.17)], CHALK, 4), Dot(ORIGIN, radius=0.05, color=CHALK))
    band = poly([(3.2, 0.17), (3.55, 0.17), (3.55, -0.17), (3.2, -0.17)], PINK, 4, True)
    return VGroup(body, tip, band)


def vending(c):
    c = np.array(c, float)
    g = VGroup(RoundedRectangle(width=3.4, height=5.0, corner_radius=0.15, stroke_color=CHALK, stroke_width=5).move_to(c),
               Rectangle(width=2.2, height=2.9, stroke_color=DIM, stroke_width=3).move_to(c + [-0.4, 0.95, 0]),
               seg(c + [-1.5, 1.27, 0], c + [0.7, 1.27, 0], DIM, 3), seg(c + [-1.5, 0.3, 0], c + [0.7, 0.3, 0], DIM, 3),
               Rectangle(width=2.0, height=0.55, stroke_color=CHALK, stroke_width=4).move_to(c + [-0.4, -1.75, 0]),
               Rectangle(width=0.18, height=0.5, stroke_color=DIM, stroke_width=3).move_to(c + [1.25, -0.5, 0]))
    btn = VGroup(*[Circle(radius=0.17, color=CHALK, stroke_width=4).move_to(c + [1.25, y, 0]) for y in (1.65, 1.05)])
    items = VGroup(chips_bag(0.55).move_to(c + [-0.95, 1.62, 0]), chips_bag(0.55).move_to(c + [0.15, 1.62, 0]),
                   can(0.7).move_to(c + [-0.95, 0.75, 0]), can(0.7).move_to(c + [0.15, 0.75, 0]),
                   granola(0.65).move_to(c + [-0.95, -0.3, 0]), granola(0.65).move_to(c + [0.15, -0.3, 0]))
    # the bottom shelf line sits under the granola bars
    g.add(seg(c + [-1.5, -0.5, 0], c + [0.7, -0.5, 0], DIM, 3))
    return VGroup(g, btn, items), btn, items, c + [-0.4, -1.75, 0]


def arrow(a, b, color=CHALK, w=4):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, stroke_width=w, color=color, tip_length=0.22,
                 max_tip_length_to_length_ratio=0.3)


# ================================================================ opener

class K01_Opener(Shot):
    def body(self):
        word = H("Calculus 1", 150).move_to([0, 1.0, 0])
        ul = brush_line(word.width + 0.4, center=word.get_bottom() + DOWN * 0.12)
        self.go("0:00.30", Write(word), run=1.1)
        self.play(Create(ul), run_time=0.5)
        ep = pill("Episode 1: Functions", YEL, 56).move_to([0, -1.25, 0])
        self.go("0:02.16", FadeIn(ep, shift=UP * 0.2), run=0.6)
        sub = H("the complete course", 42, DIM).move_to([0, -2.55, 0])
        self.go("0:03.30", FadeIn(sub, shift=UP * 0.15), run=0.5)
        # the series is a staircase
        new = head_of("Calculus 1")
        self.at("0:05.54")
        self.play(ReplacementTransform(word, new[0]), ReplacementTransform(ul, new[1]), FadeOut(ep), FadeOut(sub), run_time=0.8)
        self.head = new
        G = -3.2
        xs, ys = [-4.6, -2.2, 0.2, 2.6], [-2.1, -1.0, 0.1, 1.2]
        pts = [(-6.6, G), (xs[0], G)] + [p for k, (x, yt) in enumerate(zip(xs, ys)) for p in ((x, yt), (xs[k + 1] if k < 3 else 6.6, yt))]
        stairs = poly(pts, CHALK, 5)
        risers = VGroup(*[seg([x, G, 0], [x, yt, 0], FAINT, 2) for x, yt in zip(xs[1:], ys[:-1])])
        self.go("0:08.74", Create(stairs), run=1.2)
        self.play(FadeIn(risers), run_time=0.3)
        labs = VGroup(H("Limits", 40, CHALK), H("Derivatives", 35, PINK), H("Integrals", 40, GRN), H("Final exam", 44, YEL))
        for lab, x, yt in zip(labs, xs, ys):
            lab.move_to([x + 1.2 if x < 2.6 else 4.6, yt - 0.45, 0])
        for t, lab in zip(("0:10.44", "0:11.32", "0:12.34"), labs[:3]):
            self.go(t, Write(lab), run=0.6)
        basics = H("the basics", 38, DIM).move_to([-5.6, -3.58, 0])
        you = walker(CHALK, 0.62, 4).shift([-5.7, G, 0])
        self.go("0:14.82", FadeIn(basics, shift=UP * 0.1), FadeIn(you), run=0.5)
        flag = VGroup(seg([5.6, 1.2, 0], [5.6, 2.3, 0], CHALK, 4),
                      Polygon([5.6, 2.3, 0], [6.25, 2.08, 0], [5.6, 1.86, 0], stroke_color=YEL, stroke_width=4, fill_color=YEL, fill_opacity=0.35))
        self.go("0:16.54", Write(labs[3]), Create(flag), run=0.7)
        # "stick with me until the end": climb to the top
        path = [(-5.7, G), (xs[0] - 0.35, G)]
        for k, (x, yt) in enumerate(zip(xs, ys)):
            path += [(x + 0.05, yt + 0.25), (x + 0.4, yt)]
            path.append(((xs[k + 1] - 0.35) if k < 3 else 4.6, yt))
        route = poly(path)
        self.at("0:18.64")
        self.play(MoveAlongPath(you, route.shift(you.get_center() - you.get_bottom())), run_time=1.5, rate_func=linear)
        self.go("0:20.20", Circumscribe(labs[3], color=YEL, fade_out=True), run=0.55)


class K01_Better(Shot):
    def body(self):
        self.title("Stick With Me", "0:20.92")
        you = walker(CHALK, 1.45).shift([-4.6, -2.7, 0])
        yl = H("you", 54, YEL).next_to(you, DOWN, buff=0.15)
        self.go("0:21.45", FadeIn(you, shift=UP * 0.15), FadeIn(yl, shift=UP * 0.15), run=0.5)
        gt = M(">", size=240, color=YEL).move_to([-1.5, -0.7, 0])
        self.go("0:22.22", Write(gt), run=0.6)
        c = np.array([3.4, -0.6, 0])
        uni = VGroup(poly([(-2.2, 0.75), (0, 1.75), (2.2, 0.75)], CHALK, 5, True).shift(c),
                     seg(c + [-2.3, -1.85, 0], c + [2.3, -1.85, 0], CHALK, 5),
                     seg(c + [-2.0, -1.65, 0], c + [2.0, -1.65, 0], CHALK, 4))
        for x in (-1.5, -0.5, 0.5, 1.5):
            uni.add(seg(c + [x - 0.14, -1.65, 0], c + [x - 0.14, 0.75, 0], CHALK, 4), seg(c + [x + 0.14, -1.65, 0], c + [x + 0.14, 0.75, 0], CHALK, 4))
        ul = H("most university students", 42, DIM).next_to(uni, DOWN, buff=0.25)
        self.go("0:23.00", FadeIn(ul, shift=UP * 0.1), run=0.5)
        self.go("0:23.96", Create(uni), run=1.0)
        self.go("0:25.02", Circumscribe(gt, color=YEL, fade_out=True), run=0.8)


class K01_Foundation(Shot):
    def body(self):
        self.title("Before Calculus", "0:26.50")
        B = -1.3
        house = VGroup(poly([(-2.3, B), (-2.3, B + 2.0), (2.3, B + 2.0), (2.3, B)], CHALK, 5, True),
                       poly([(-2.7, B + 2.0), (0, B + 3.55), (2.7, B + 2.0)], CHALK, 5),
                       poly([(1.25, B), (1.25, B + 1.2), (1.85, B + 1.2), (1.85, B)], CHALK, 4))
        cal = H("Calculus", 56, CHALK).move_to([-0.55, B + 1.0, 0])
        self.go("0:27.40", Create(house), FadeIn(cal), run=1.0)
        gap = DashedVMobject(Rectangle(width=6.0, height=1.1, stroke_color=DIM, stroke_width=3).move_to([0, B - 0.55, 0]), num_dashes=40)
        q = H("?", 80, YEL).move_to([0, B - 0.55, 0])
        self.go("0:28.78", Create(gap), Write(q), run=0.6)
        self.title("A Strong Foundation", "0:29.98")
        slab = Rectangle(width=6.0, height=1.1, stroke_color=YEL, stroke_width=5, fill_color=YEL, fill_opacity=0.12).move_to([0, B - 0.55, 0])
        self.go("0:30.50", ReplacementTransform(gap, slab), FadeOut(q), run=0.7)
        fn = H("Functions", 54, YEL).move_to(slab)
        self.go("0:34.04", Write(fn), run=0.7)
        easy = VGroup(tick_mark(GRN, 0.5), H("easy", 50, GRN)).arrange(RIGHT, buff=0.2).move_to([4.9, 0.2, 0])
        self.go("0:37.80", FadeIn(easy, shift=UP * 0.15), run=0.5)
        # without the foundation the house leans
        weak = DashedVMobject(Rectangle(width=6.0, height=1.1, stroke_color=FAINT, stroke_width=3).move_to(slab), num_dashes=40)
        self.at("0:39.42")
        self.play(FadeOut(easy), FadeOut(fn), ReplacementTransform(slab, weak), run_time=0.5)
        self.play(VGroup(house, cal).animate.rotate(-7 * DEGREES, about_point=[2.3, B, 0]), run_time=0.7)
        # like a book in a language you don't know
        self.wipe("0:40.84", run=0.35)
        book = VGroup(VMobject(stroke_color=CHALK, stroke_width=5).set_points_smoothly([[0, 1.25, 0], [-1.6, 1.55, 0], [-3.4, 1.4, 0]]),
                      seg([-3.4, 1.4, 0], [-3.4, -1.9, 0]),
                      VMobject(stroke_color=CHALK, stroke_width=5).set_points_smoothly([[-3.4, -1.9, 0], [-1.6, -1.75, 0], [0, -2.05, 0]]),
                      VMobject(stroke_color=CHALK, stroke_width=5).set_points_smoothly([[0, 1.25, 0], [1.6, 1.55, 0], [3.4, 1.4, 0]]),
                      seg([3.4, 1.4, 0], [3.4, -1.9, 0]),
                      VMobject(stroke_color=CHALK, stroke_width=5).set_points_smoothly([[3.4, -1.9, 0], [1.6, -1.75, 0], [0, -2.05, 0]]),
                      seg([0, 1.25, 0], [0, -2.05, 0], CHALK, 4)).shift(LEFT * 1.0)
        self.go("0:41.28", Create(book), run=0.45)
        words = VGroup(scribble_lines(-4.1, -1.3, [0.95, 0.4, -0.15, -0.7, -1.25], 3),
                       scribble_lines(-0.7, 2.1, [0.95, 0.4, -0.15, -0.7, -1.25], 7))
        self.go("0:41.78", Create(words), run=0.6)
        q = H("?", 150, YEL).move_to([4.6, -0.3, 0])
        self.go("0:42.40", Write(q), run=0.5)


class K01_Plan(Shot):
    def body(self):
        self.title("In This Episode", "0:43.56")
        warm = pill("warm-up", ORG, 40).move_to([0, 2.12, 0])
        self.go("0:44.86", FadeIn(warm, shift=DOWN * 0.1), run=0.5)
        items = ["What a function is", "Reading its graph", "Types of functions", "Combining functions", "Undoing them"]
        rows = VGroup()
        for k, s in enumerate(items):
            y = 1.05 - k * 0.8
            t = H(s, 46).move_to([-2.4, y, 0], aligned_edge=LEFT)
            rows.add(VGroup(M(str(k + 1), size=52, color=ORG).move_to([-2.85, t.get_y(), 0]), t))
        rows.move_to([0, rows.get_y(), 0])
        for t, r in zip(("0:46.82", "0:48.42", "0:50.20", "0:51.98", "0:53.32"), rows):
            self.go(t, FadeIn(r[0], scale=0.8), Write(r[1]), run=0.6)
        prac = pill("+ practice questions", GRN, 40).move_to([0, -3.3, 0])
        self.go("0:55.80", FadeIn(prac, shift=UP * 0.15), run=0.5)
        # grab a pen and some paper
        self.wipe("0:57.70", run=0.3)
        self.title("Grab a Pen and Paper")
        paper = VGroup(Rectangle(width=4.4, height=5.2, stroke_color=CHALK, stroke_width=5, fill_color=CHALK, fill_opacity=0.04))
        for k in range(1, 9):
            paper.add(seg([-2.0, 2.6 - k * 0.58, 0], [2.0, 2.6 - k * 0.58, 0], FAINT, 2))
        paper.add(seg([-1.5, 2.6, 0], [-1.5, -2.6, 0], PINK, 2))
        paper.move_to([-1.0, -0.7, 0])
        pen = pencil().rotate(35 * DEGREES, about_point=ORIGIN).move_to([4.2, -0.4, 0])
        self.go("0:58.60", Create(pen), run=0.5)
        self.go("0:59.12", Create(paper), run=0.6)
        # the pencil draws a little curve on the page
        P = paper[0].get_center()
        curve = VMobject(stroke_color=BLUE, stroke_width=5).set_points_smoothly([P + [x, 0.32 * x * x - 1.2, 0] for x in np.linspace(-1.2, 1.9, 25)])
        u = ValueTracker(0.001)
        drawn = always_redraw(lambda: curve.copy().pointwise_become_partial(curve, 0, u.get_value()))
        tip0 = pen[1][1].get_center()
        self.add(drawn)
        self.play(pen.animate.shift(curve.get_start() - tip0), run_time=0.5)
        pen.add_updater(lambda m: m.shift(curve.point_from_proportion(u.get_value()) - m[1][1].get_center()))
        self.go("1:00.24", u.animate.set_value(1), run=0.9)
        pen.clear_updaters()


# ================================================================ Part 1: the juice machine

class K01_Juice(Shot):
    def body(self):
        self.title("A Juice Machine", "1:04.40")
        mach, A = machine([-3.7, -0.6, 0], w=3.6, h=2.5)
        cup, fill = glass(A["out"] + [0, -1.95, 0])
        self.go("1:04.88", Create(mach), run=0.8)
        self.play(Create(cup), run_time=0.3)
        cy = A["out"][1] - 1.95

        def pour(fruit, color, t_in, t_out, row_y, word):
            fruit.move_to(A["top"] + UP * 0.42)
            self.go(t_in, FadeIn(fruit, shift=DOWN * 0.2), run=0.4)
            self.play(fruit.animate.move_to(A["mouth"] + UP * 0.25).scale(0.5), run_time=0.5)
            self.play(FadeOut(fruit, shift=DOWN * 0.3), run_time=0.25)
            stream = seg(A["out"], [A["out"][0], cy + 0.15, 0], color, 6)
            lev = ValueTracker(0)
            juice = always_redraw(lambda: fill(lev.get_value(), color))
            self.add(juice)
            self.go(t_out, Create(stream), run=0.3)
            self.play(lev.animate.set_value(1), run_time=0.8)
            self.play(FadeOut(stream), run_time=0.2)
            juice.clear_updaters()
            icon = (orange(0.3) if color == ORG else apple(0.3)).move_to([0.9, row_y, 0])
            row = VGroup(icon, arrow([1.5, row_y, 0], [2.6, row_y, 0]), H(word, 48, color).move_to([2.9, row_y, 0], aligned_edge=LEFT))
            self.play(FadeIn(row, shift=LEFT * 0.15), run_time=0.5)
            return juice, row

        j1, r1 = pour(orange(), ORG, "1:06.14", "1:07.32", 1.2, "orange juice")
        self.go("1:09.12", FadeOut(j1), run=0.3)
        j2, r2 = pour(apple(), YEL, "1:09.42", "1:10.76", 0.0, "apple juice")
        one = VGroup(H("one in", 46), arrow([0, 0, 0], [0.9, 0, 0]), H("exactly one out", 46, YEL)).arrange(RIGHT, buff=0.25)
        one.scale_to_fit_width(min(one.width, 6.0)).move_to([3.3, -1.7, 0])
        self.go("1:12.68", FadeIn(one[0], shift=UP * 0.1), run=0.4)
        self.go("1:14.08", GrowArrow(one[1]), Write(one[2]), run=0.7)
        name = H("function", 48, YEL).move_to(A["screen"])
        self.go("1:16.20", Create(A["plate"]), Write(name), run=0.5)
        self.play(Create(brush_line(name.width + 0.3, center=name.get_bottom() + DOWN * 0.08)), run_time=0.4)


class K01_Machine(Shot):
    def body(self):
        self.title("A Function is a Machine", "1:17.42")
        mach, A = machine([0, -0.95, 0], w=4.6, h=2.8, plate_h=1.0)
        self.go("1:17.90", Create(mach), run=0.9)
        inp = H("input", 52, ORG).move_to([-4.3, A["top"][1], 0])
        ia = arrow([-3.4, A["top"][1], 0], [-1.2, A["top"][1], 0], ORG)
        self.go("1:19.34", Write(inp), GrowArrow(ia), run=0.6)
        rule = H("rule", 60).move_to(A["screen"])
        self.go("1:20.78", Create(A["plate"]), Write(rule), run=0.5)
        o = A["out"] + DOWN * 0.15
        oa = arrow(o + [0.25, 0, 0], o + [1.2, 0, 0], BLUE)
        out = H("output", 52, BLUE).next_to(oa, RIGHT, buff=0.2)
        one = H("exactly one", 38, YEL).next_to(out, UP, buff=0.15)
        self.go("1:22.02", FadeIn(one, shift=DOWN * 0.1), run=0.4)
        self.go("1:22.82", GrowArrow(oa), Write(out), run=0.6)
        n_in = M("5", size=80, color=ORG).move_to(inp)
        n_out = M("13", size=80, color=BLUE).move_to(out)
        self.go("1:25.26", Transform(inp, n_in), run=0.6)
        self.go("1:25.82", Transform(out, n_out), run=0.6)
        nums = VGroup(H("numbers", 40, DIM).next_to(n_in, DOWN, buff=0.3), H("numbers", 40, DIM).next_to(n_out, DOWN, buff=0.3))
        self.go("1:26.88", FadeIn(nums, shift=UP * 0.1), run=0.5)


class K01_Numbers(Shot):
    def body(self):
        self.title("A Number Machine", "1:28.84")
        mx = -3.4
        mach, A = machine([mx, -0.55, 0], w=4.2, h=2.7, plate_h=1.35)
        self.go("1:29.30", Create(mach), run=0.9)
        r1 = H("double it", 44).move_to(A["screen"] + UP * 0.3)
        r2 = H("then add 3", 44).move_to(A["screen"] + DOWN * 0.3)
        self.go("1:31.12", Create(A["plate"]), Write(r1), run=0.6)
        self.go("1:32.48", Write(r2), run=0.6)
        # in / out table
        cx_in, cx_out = 2.0, 5.1
        hdr = VGroup(H("in", 52, ORG).move_to([cx_in, 1.75, 0]), H("out", 52, BLUE).move_to([cx_out, 1.75, 0]),
                     seg([1.0, 1.25, 0], [6.1, 1.25, 0], DIM, 3))
        self.go("1:33.10", FadeIn(hdr), run=0.3)
        work_y = -2.95

        def run_one(n, t_in, t_dbl, t_dbl2, t_add, t_eq, t_out, row_y):
            a = M(str(n), size=64, color=ORG).move_to(A["top"] + UP * 0.36)
            self.go(t_in, FadeIn(a, shift=DOWN * 0.15), run=0.35)
            self.play(a.animate.move_to(A["mouth"]).scale(0.6), run_time=0.45)
            self.play(FadeOut(a), run_time=0.15)
            w1 = M(str(n), r"\times", "2", "=", str(2 * n), size=72).move_to([mx, work_y, 0])
            w1[0].set_color(ORG)
            self.go(t_dbl, Write(w1[:3]), run=0.5)
            self.go(t_dbl2, Write(w1[3:]), run=0.4)
            w2 = M(str(2 * n), "+", "3", "=", str(2 * n + 3), size=72).move_to([mx, work_y, 0])
            w2[-1].set_color(BLUE)
            self.go(t_add, ReplacementTransform(w1[4], w2[0]), FadeOut(w1[:4]), Write(w2[1:3]), run=0.5)
            self.go(t_eq, Write(w2[3:]), run=0.35)
            w2b = w2
            b = M(str(2 * n + 3), size=72, color=BLUE).move_to(A["out"] + DOWN * 0.3)
            dest = [cx_out, row_y, 0]
            row = VGroup(M(str(n), size=76, color=ORG).move_to([cx_in, row_y, 0]), arrow([cx_in + 0.65, row_y, 0], [cx_out - 0.8, row_y, 0], DIM, 3))
            self.at(t_out)
            self.play(FadeIn(b, shift=DOWN * 0.15), run_time=0.25)
            self.play(b.animate.move_to(dest).scale(76 / 72), FadeIn(row), run_time=0.7)
            return w2b

        w = run_one(1, "1:33.90", "1:35.02", "1:36.00", "1:36.82", "1:38.00", "1:38.40", 0.6)
        self.go("1:39.36", FadeOut(w), run=0.3)
        w = run_one(4, "1:39.70", "1:40.82", "1:42.00", "1:42.88", "1:43.86", "1:44.36", -0.5)
        self.go("1:45.32", FadeOut(w), run=0.2)
        w = run_one(0, "1:45.52", "1:46.98", "1:47.60", "1:48.60", "1:49.40", "1:49.86", -1.6)


# ================================================================ notation

def fx_eq(size=100):
    e = M("f", "(", "x", ")", "=", "2x", "+", "3", size=size)
    e[0].set_color(YEL)
    e[2].set_color(ORG)
    return e


class K01_Notation(Shot):
    def body(self):
        self.title("A Shorter Way", "1:51.20")
        ph = H("double the number, then add 3", 54, DIM).move_to([0, 1.3, 0])
        self.go("1:51.70", Write(ph), run=1.1)
        br = Brace(ph, DOWN, color=DIM, buff=0.12)
        slow = H("slow to write", 40, DIM).next_to(br, DOWN, buff=0.1)
        self.go("1:54.88", FadeIn(br), FadeIn(slow, shift=UP * 0.1), run=0.5)
        self.title("Function Notation", "1:57.30")
        e = fx_eq(120).move_to([0, -1.4, 0])
        self.go("1:59.00", Write(e[0]), run=0.5)
        self.go("2:01.16", Write(e[1:4]), run=0.4)
        self.go("2:01.58", Write(e[4]), run=0.3)
        self.go("2:01.96", Write(e[5]), run=0.4)
        self.go("2:02.54", Write(e[6:]), run=0.4)
        self.at("2:03.66")
        self.play(FadeOut(ph), FadeOut(br), FadeOut(slow), run_time=0.4)
        self.play(e.animate.move_to([0, 0.15, 0]), run_time=0.6)
        nm = H("name", 48, YEL).move_to([e[0].get_x(), 1.75, 0])
        na = arrow(nm.get_bottom() + DOWN * 0.08, e[0].get_top() + UP * 0.12, YEL)
        self.go("2:06.34", Write(nm), GrowArrow(na), run=0.6)
        ip = H("input", 48, ORG).move_to([e[2].get_x(), -1.55, 0])
        ipa = arrow(ip.get_top() + UP * 0.08, e[2].get_bottom() + DOWN * 0.12, ORG)
        self.go("2:09.50", Write(ip), GrowArrow(ipa), run=0.6)
        rb = Brace(e[5:], DOWN, color=CHALK, buff=0.15)
        rl = H("rule", 48).next_to(rb, DOWN, buff=0.12)
        self.go("2:12.50", FadeIn(rb), Write(rl), run=0.6)


class K01_Eval(Shot):
    def body(self):
        self.title("Function Notation", animate=False)
        top = fx_eq(90).move_to([0, 1.6, 0])
        self.play(FadeIn(top), run_time=0.4)
        f4 = M("f(", "4", ")", size=96)
        f4[1].set_color(ORG)
        rowB = M("f(", "4", ")", "=", "2", r"\times", "4", "+", "3", size=96)
        rowB[1].set_color(ORG); rowB[6].set_color(ORG)
        rowB.move_to([0, 0.05, 0])
        f4.move_to(rowB[:3])
        self.go("2:14.36", Write(f4), run=0.6)
        put = H("put 4 in", 40, ORG).next_to(f4, LEFT, buff=0.5)
        self.go("2:15.84", FadeIn(put, shift=RIGHT * 0.1), run=0.4)
        self.go("2:17.46", Circumscribe(top[2], color=ORG, fade_out=True), FadeOut(put), run=0.7)
        self.remove(f4)
        self.add(rowB[:3])
        self.at("2:18.30")
        self.play(TransformFromCopy(top[4], rowB[3]), TransformFromCopy(top[5], rowB[4:7]), TransformFromCopy(top[6:], rowB[7:]), run_time=0.8)
        rowC = M("=", "8", "+", "3", size=96)
        rowC.shift(rowB[3].get_center() - rowC[0].get_center() + DOWN * 1.3)
        self.go("2:20.40", Write(rowC), run=0.6)
        rowD = M("=", "11", size=96)
        rowD.next_to(rowC, RIGHT, buff=0.3)
        rowD[1].set_color(BLUE)
        self.go("2:21.90", Write(rowD), run=0.5)
        ans = M("f(", "4", ")", "=", "11", size=110).move_to([0, -0.7, 0])
        ans[1].set_color(ORG); ans[4].set_color(BLUE)
        self.at("2:23.18")
        self.play(FadeOut(VGroup(rowB, rowC, rowD), shift=UP * 0.1), FadeIn(ans, shift=UP * 0.1), run_time=0.6)
        self.go("2:24.30", Create(box(ans, GRN, buff=0.25)), run=0.6)


class K01_NotTimes(Shot):
    def body(self):
        self.title("Careful!", "2:25.66")
        line = M("f(x)", r"\neq", r"f\times x", size=130).move_to([0, 0.8, 0])
        self.go("2:28.32", Write(line[0]), run=0.6)
        self.go("2:29.20", Write(line[1]), run=0.4)
        self.go("2:29.88", Write(line[2]), run=0.5)
        st = strike(line[2])
        nm = H("not multiplication", 46, RED).next_to(line[2], DOWN, buff=0.45)
        self.go("2:31.46", Create(st), Write(nm), run=0.7)
        self.at("2:32.90")
        self.play(FadeOut(VGroup(line[1], line[2], st, nm)), run_time=0.3)
        self.play(line[0].animate.move_to([0, 0.3, 0]), run_time=0.4)
        mean = TX(r"the output of $f$ when the input is $x$", 64).move_to([0, -2.3, 0])
        self.go("2:33.60", Write(mean), run=1.2)
        tag = RoundedRectangle(width=4.8, height=2.9, corner_radius=0.25, stroke_color=CHALK, stroke_width=5).move_to([0, 0.6, 0])
        band = Rectangle(width=4.8, height=0.75, stroke_width=0, fill_color=RED, fill_opacity=0.35).align_to(tag, UP).shift(DOWN * 0.18)
        band_t = H("my name is", 40).move_to(band)
        self.go("2:37.26", Create(tag), run=0.7)
        self.go("2:38.16", FadeIn(band), Write(band_t), run=0.6)


class K01_Rule(Shot):
    def body(self):
        self.title("The Most Important Rule", "2:40.54")
        y1 = 0.9
        a = H("one input", 50, ORG)
        b = H("exactly one output", 50, BLUE)
        ar = arrow([0, 0, 0], [1.8, 0, 0])
        tk = tick_mark(GRN, 0.6)
        VGroup(a, ar, b, tk).arrange(RIGHT, buff=0.35).move_to([0, y1, 0])
        self.go("2:43.14", Write(a), run=0.5)
        self.go("2:44.02", GrowArrow(ar), run=0.4)
        self.play(Write(b), run_time=0.6)
        self.play(Create(tk), run_time=0.3)
        y2 = -1.7
        c = H("one input", 50, ORG).move_to([a.get_x(), y2, 0])
        s = c.get_right() + RIGHT * 0.3
        o1 = H("output", 50, BLUE).move_to(s + [2.6, 0.75, 0], aligned_edge=LEFT)
        o2 = H("output", 50, BLUE).move_to(s + [2.6, -0.75, 0], aligned_edge=LEFT)
        f1, f2 = arrow(s, s + [2.35, 0.7, 0]), arrow(s, s + [2.35, -0.7, 0])
        cr = cross_mark(RED, 0.35).next_to(o1, RIGHT, buff=0.8).set_y(y2)
        nv = H("never two", 46, RED).next_to(cr, RIGHT, buff=0.35)
        self.go("2:45.98", FadeIn(VGroup(c, f1, f2, o1, o2)), run=0.5)
        self.play(Create(cr), Write(nv), run_time=0.5)


class K01_Vending(Shot):
    def body(self):
        self.title("A Vending Machine", "2:47.48")
        vm, btn, items, tray = vending([-4.3, -0.95, 0])
        self.go("2:47.90", Create(vm[0]), FadeIn(vm[1]), run=1.0)
        self.play(FadeIn(vm[2]), run_time=0.4)
        b_chips, b_cook = btn
        p_chips = pill("chips button", YEL, 42).move_to([-0.3, 0.9, 0])
        self.go("2:49.60", b_chips.animate.set_fill(YEL, 0.8), FadeIn(p_chips, shift=RIGHT * 0.15), run=0.5)

        def drop(item, t):
            d = item.copy()
            self.at(t)
            self.play(d.animate.move_to(tray).scale(min(1, 0.42 / d.height)), run_time=0.6, rate_func=rush_into)
            return d

        bag = drop(items[0], "2:50.84")
        out1 = VGroup(chips_bag(1.0), H("chips", 44, YEL)).arrange(RIGHT, buff=0.3).move_to([3.9, 1.15, 0])
        a1 = arrow(p_chips.get_right() + RIGHT * 0.15, out1.get_left() + LEFT * 0.15 + DOWN * 0.15)
        tk = tick_mark(GRN, 0.5).next_to(out1, DOWN, buff=0.3)
        self.go("2:51.40", GrowArrow(a1), FadeIn(out1, shift=LEFT * 0.1), run=0.5)
        self.play(Create(tk), run_time=0.3)
        self.go("2:52.58", FadeOut(bag), FadeOut(tk), run=0.4)
        cdrop = drop(items[2], "2:54.90")
        out2 = VGroup(can(1.0), H("cold drink", 44, BLUE)).arrange(RIGHT, buff=0.3).move_to([4.2, -0.95, 0])
        a2 = arrow(p_chips.get_right() + RIGHT * 0.15, out2.get_left() + LEFT * 0.15)
        self.go("2:55.50", GrowArrow(a2), FadeIn(out2, shift=LEFT * 0.1), run=0.5)
        bad = VGroup(cross_mark(RED, 0.3), H("broken", 48, RED)).arrange(RIGHT, buff=0.35).move_to([2.4, -2.75, 0])
        self.go("2:57.58", Create(bad[0]), Write(bad[1]), run=0.5)
        nf = H("not a function", 48, RED).move_to(bad[1], aligned_edge=LEFT)
        self.go("2:59.40", Transform(bad[1], nf), run=0.6)
        # two buttons, one result is fine
        self.at("3:00.84")
        self.play(*[FadeOut(m) for m in (p_chips, a1, a2, out1, out2, bad, cdrop)], b_chips.animate.set_fill(opacity=0), run_time=0.4)
        self.go("3:02.54", b_chips.animate.set_fill(YEL, 0.8), run=0.3)
        self.go("3:02.78", b_cook.animate.set_fill(YEL, 0.8), run=0.3)
        pc = pill("chips button", YEL, 42).move_to([0.2, 1.1, 0])
        pk = pill("cookies button", YEL, 42).move_to([0.2, -0.9, 0])
        self.go("3:05.50", FadeIn(pc, shift=RIGHT * 0.15), run=0.4)
        self.go("3:06.44", FadeIn(pk, shift=RIGHT * 0.15), run=0.4)
        bar = VGroup(granola(1.3), H("granola bar", 44, ORG))
        bar[0].move_to([4.6, 0.1, 0])
        bar[1].next_to(bar[0], UP, buff=0.3)
        g1 = arrow(pc.get_right() + RIGHT * 0.15, bar[0].get_left() + LEFT * 0.2 + UP * 0.1)
        g2 = arrow(pk.get_right() + RIGHT * 0.15, bar[0].get_left() + LEFT * 0.2 + DOWN * 0.1)
        gd = drop(items[4], "3:07.40")
        self.go("3:08.20", GrowArrow(g1), GrowArrow(g2), FadeIn(bar, shift=LEFT * 0.1), run=0.6)
        weird = H("weird...", 40, DIM).next_to(bar[0], DOWN, buff=0.35)
        self.go("3:09.02", FadeIn(weird, shift=DOWN * 0.1), run=0.4)
        ok = VGroup(tick_mark(GRN, 0.5), H("still a function", 48, GRN)).arrange(RIGHT, buff=0.3).move_to([2.4, -2.75, 0])
        self.go("3:10.30", Create(ok[0]), Write(ok[1]), run=0.6)
        self.go("3:11.78", g1.animate.set_color(YEL), run=0.4)
        self.go("3:12.58", g2.animate.set_color(YEL), run=0.4)


# ================================================================ Question 1

class K01_Q1(Shot):
    def body(self):
        self.title("Quick Practice")
        p = pill("Question 1", ORG, 44).move_to([0, 1.65, 0])
        self.go("3:16.30", FadeIn(p, shift=DOWN * 0.1), run=0.4)
        q = M("f(x)", "=", "x^2", "-", "1", size=88).move_to([-2.9, 0.2, 0])
        self.go("3:17.58", Write(q[0]), run=0.5)
        self.go("3:18.62", Write(q[1:3]), run=0.6)
        self.go("3:19.30", Write(q[3:]), run=0.5)
        ask = M("f(", "-3", ")", "=", r"\text{?}", size=88).move_to([3.2, 0.2, 0])
        ask[1].set_color(ORG); ask[4].set_color(YEL)
        self.go("3:21.06", Write(ask), run=0.8)
        ring = Circle(radius=0.75, color=CHALK, stroke_width=4).move_to([0, -2.1, 0])
        bars = VGroup(*[Line([x, -2.45, 0], [x, -1.75, 0], color=YEL, stroke_width=16) for x in (-0.2, 0.2)])
        self.go("3:22.92", Create(ring), Create(bars), run=0.6)
        # work it out
        self.at("3:24.90")
        self.play(FadeOut(VGroup(p, ring, bars)), run_time=0.3)
        self.play(q.animate.move_to([-3.4, 1.7, 0]).scale(0.85), ask.animate.move_to([3.4, 1.7, 0]).scale(0.85), run_time=0.5)
        r1 = M("f(", "-3", ")", "=", "(-3)^2", "-", "1", size=96)
        r1[1].set_color(ORG); r1[4].set_color(ORG)
        r1.move_to([-0.6, 0.1, 0])
        self.go("3:25.70", TransformFromCopy(q[0], r1[:3]), TransformFromCopy(q[1], r1[3]), run=0.5)
        self.go("3:26.30", TransformFromCopy(q[2], r1[4]), TransformFromCopy(q[3:], r1[5:]), run=0.6)
        r2 = M("=", "9", "-", "1", size=96)
        r2.shift(r1[3].get_center() - r2[0].get_center() + DOWN * 1.35)
        self.go("3:29.18", Write(r2[:2]), run=0.5)
        note = TX(r"negative $\times$ negative $=$ positive", 56, YEL)
        note.move_to([0, -2.95, 0])
        frame = panel(note, YEL, buff=0.22, width=3)
        self.go("3:31.86", Create(frame), Write(note), run=1.0)
        self.go("3:35.20", Write(r2[2:]), run=0.4)
        r3 = M("=", "8", size=96).next_to(r2, RIGHT, buff=0.3)
        r3[1].set_color(GRN)
        self.go("3:35.70", Write(r3), run=0.4)
        ans = M("f(", "-3", ")", "=", "8", size=96).move_to([0, -0.6, 0])
        ans[1].set_color(ORG); ans[4].set_color(GRN)
        self.at("3:36.70")
        self.play(FadeOut(VGroup(r1, r2, r3, note, frame), shift=UP * 0.1), FadeIn(ans, shift=UP * 0.1), run_time=0.6)
        self.go("3:38.26", Create(box(ans, GRN, buff=0.25)), run=0.6)
