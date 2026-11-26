"""Builder 01: course welcome and Chapter 1 opening (function machine, notation, f(a+h), graphs, domain)."""
from common import *

BOARDC = "#3b3a3e"


# ---------------------------------------------------------------- local chalk drawings (adapted from calc1-ep01)

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


def arrow(a, b, color=CHALK, w=4):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, stroke_width=w, color=color, tip_length=0.22,
                 max_tip_length_to_length_ratio=0.3)


def machine(c=ORIGIN, w=3.4, h=2.4, spout_y=-0.5, plate_h=0.85):
    """Box machine: funnel on top, spout on the right, dials, two legs. anchors: top, mouth, out, screen, plate."""
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
             screen=plate.get_center(), plate=plate)
    return g, A


def feed(scene, mob, A, run=0.6, src=None):
    """Drop mob into the funnel: appear above it (or fly from src), slide into the mouth, vanish."""
    if src is None:
        mob.move_to(A["top"] + UP * 0.42)
        scene.play(FadeIn(mob, shift=DOWN * 0.15), run_time=run * 0.35)
    else:
        mob.move_to(src)
        scene.add(mob)
        scene.play(mob.animate.move_to(A["top"] + UP * 0.42), run_time=run * 0.35)
    scene.play(mob.animate.move_to(A["mouth"]).scale(0.55), run_time=run * 0.45)
    scene.play(FadeOut(mob), run_time=run * 0.2)


def pencil():
    """Pencil lying along +x with its tip at the origin; pen[1][1] is the tip dot."""
    body = poly([(0.45, 0.17), (3.2, 0.17), (3.2, -0.17), (0.45, -0.17)], YEL, 4, True)
    tip = VGroup(poly([(0.45, 0.17), (0, 0), (0.45, -0.17)], CHALK, 4), Dot(ORIGIN, radius=0.05, color=CHALK))
    band = poly([(3.2, 0.17), (3.55, 0.17), (3.55, -0.17), (3.2, -0.17)], PINK, 4, True)
    return VGroup(body, tip, band)


def pen_write(scene, pen, mob, t, run=0.7):
    """Pencil hops to the start of mob, then writes it left to right with the tip riding along."""
    tip = lambda: pen[1][1].get_center()
    scene.at(t)
    scene.play(pen.animate.shift(mob.get_left() + DOWN * 0.18 - tip()), run_time=0.25)
    scene.play(Write(mob), pen.animate.shift(RIGHT * mob.width), run_time=run)


def pause_icon(c, r=0.7):
    c = np.array(c, float)
    return VGroup(Circle(radius=r, color=CHALK, stroke_width=4).move_to(c),
                  *[Line(c + [x, -0.33 * r / 0.7, 0], c + [x, 0.33 * r / 0.7, 0], color=YEL, stroke_width=16) for x in (-0.19, 0.19)])


def mug(c):
    c = np.array(c, float)
    body = poly([(-0.36, 0.42), (-0.3, -0.42), (0.3, -0.42), (0.36, 0.42)], CHALK, 4)
    handle = Arc(radius=0.2, start_angle=-PI / 2, angle=PI, arc_center=[0.34, 0.02, 0], color=CHALK, stroke_width=4)
    steam = VGroup(*[VMobject(stroke_color=DIM, stroke_width=3).set_points_smoothly(
        [[x, 0.55, 0], [x + 0.09, 0.72, 0], [x - 0.03, 0.9, 0], [x + 0.05, 1.05, 0]]) for x in (-0.13, 0.11)])
    return VGroup(body, handle, steam).shift(c)


def chips_bag(s=1.0):
    pts = [(-0.4, 0.55), (-0.3, 0.6), (-0.2, 0.55), (-0.1, 0.6), (0, 0.55), (0.1, 0.6), (0.2, 0.55), (0.3, 0.6), (0.4, 0.55),
           (0.36, 0), (0.4, -0.55), (-0.4, -0.55), (-0.36, 0)]
    return VGroup(poly(pts, YEL, 4, True), Circle(radius=0.16, color=YEL, stroke_width=3).move_to([0, 0.02, 0])).scale(s)


def can(s=1.0):
    return VGroup(RoundedRectangle(width=0.62, height=1.05, corner_radius=0.1, stroke_color=BLUE, stroke_width=4),
                  seg([-0.31, 0.32, 0], [0.31, 0.32, 0], BLUE, 3), seg([-0.31, -0.32, 0], [0.31, -0.32, 0], BLUE, 3)).scale(s)


def vending(c):
    c = np.array(c, float)
    g = VGroup(RoundedRectangle(width=3.4, height=5.0, corner_radius=0.15, stroke_color=CHALK, stroke_width=5).move_to(c),
               Rectangle(width=2.2, height=2.9, stroke_color=DIM, stroke_width=3).move_to(c + [-0.4, 0.95, 0]),
               seg(c + [-1.5, 0.8, 0], c + [0.7, 0.8, 0], DIM, 3),
               Rectangle(width=2.0, height=0.55, stroke_color=CHALK, stroke_width=4).move_to(c + [-0.4, -1.75, 0]),
               Rectangle(width=0.18, height=0.5, stroke_color=DIM, stroke_width=3).move_to(c + [1.25, -0.5, 0]))
    btn = VGroup(*[Circle(radius=0.17, color=CHALK, stroke_width=4).move_to(c + [1.25, y, 0]) for y in (1.65, 1.05)])
    items = VGroup(chips_bag(0.55).move_to(c + [-0.95, 1.5, 0]), chips_bag(0.55).move_to(c + [0.15, 1.5, 0]),
                   can(0.7).move_to(c + [-0.95, 0.2, 0]), can(0.7).move_to(c + [0.15, 0.2, 0]))
    return VGroup(g, btn, items), btn, items, c + [-0.4, -1.75, 0]


def ray(a, b, color=GRN):
    return Arrow(a, b, buff=0, color=color, stroke_width=9, tip_length=0.26,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30).set_z_index(2)


def vslider(ax, xt, f=None, lo=-1.9, hi=1.9, width=5):
    def mk():
        x = xt.get_value()
        g = VGroup(Line(ax.c2p(x, lo), ax.c2p(x, hi), color=YEL, stroke_width=width))
        if f is not None:
            g.add(Dot(ax.c2p(x, f(x)), radius=0.1, color=GRN).set_z_index(6))
        return g
    return always_redraw(mk)


def drop_slider(scene, s, run=0.3):
    s.clear_updaters()
    scene.play(FadeOut(s), run_time=run)


def orange_on(m, *spans):
    """Colour glyph ranges (part, a, b) of a MathTex orange: the substituted input."""
    for p, a, b in spans:
        m[p][a:b].set_color(ORG)
    return m


def on_eq(m, k, x, y):
    """Shift m so its part k (the '=') is centred at (x, y)."""
    return m.shift(np.array([x, y, 0]) - m[k].get_center())


# ================================================================ welcome

class K01_Opener(Shot):
    def body(self):
        word = H("Calculus 1", 150).move_to([0, 1.0, 0])
        ul = brush_line(word.width + 0.4, center=word.get_bottom() + DOWN * 0.12)
        self.go("0:00.20", Write(word), run=1.1)
        self.play(Create(ul), run_time=0.5)
        pl = pill("The Full Course", YEL, 56).move_to([0, -1.25, 0])
        self.go("0:02.74", FadeIn(pl, shift=UP * 0.2), run=0.6)
        sub = H("start to finish, in one place", 42, DIM).move_to([0, -2.55, 0])
        self.go("0:04.82", FadeIn(sub, shift=UP * 0.15), run=0.5)
        new = head_of("Calculus 1")
        self.at("0:06.30")
        self.play(ReplacementTransform(word, new[0]), ReplacementTransform(ul, new[1]), FadeOut(pl), FadeOut(sub), run_time=0.6)
        self.head = new
        # the course as a road with five stops
        xs = [-5.2, -2.6, 0.0, 2.6, 5.2]
        ys = [-1.1, 0.0, -1.1, 0.0, -1.1]
        stops = [np.array([x, y, 0]) for x, y in zip(xs, ys)]
        road = VMobject(stroke_color=CHALK, stroke_width=6).set_points_smoothly([np.array([-6.7, -0.35, 0])] + stops)
        al = np.linspace(0, 1, 801)
        P = np.array([road.point_from_proportion(a) for a in al])
        alphas = [al[np.argmin(np.linalg.norm(P - s, axis=1))] for s in stops]
        u = ValueTracker(0.001)
        part = always_redraw(lambda: road.copy().pointwise_become_partial(road, 0, max(u.get_value(), 0.001)))
        self.add(part)
        names = [("Limits", BLUE), ("Derivatives", PINK), ("Applications", ORG), ("Integrals", GRN), ("Fundamental\nTheorem", YEL)]
        words = ["0:07.28", "0:08.00", "0:09.42", "0:10.36", "0:11.48"]
        labs = VGroup()
        for k, ((nm, col), s, t) in enumerate(zip(names, stops, words)):
            self.go(f"{sec(t) - 0.32:.2f}", u.animate.set_value(alphas[k]), run=0.3)
            dot = Dot(s, radius=0.13, color=col).set_z_index(3)
            lab = H(nm, 40, col)
            if k % 2:
                lab.next_to(s, UP, buff=0.3)
            else:
                lab.next_to(s, DOWN, buff=0.3)
            labs.add(lab)
            self.go(t, FadeIn(dot, scale=0.5), Write(lab), run=0.35)
            labs.add(dot)
        part.clear_updaters()
        flag = VGroup(seg(stops[4], stops[4] + [0, 1.05, 0], CHALK, 4),
                      Polygon(stops[4] + [0, 1.05, 0], stops[4] + [0.62, 0.84, 0], stops[4] + [0, 0.63, 0],
                              stroke_color=YEL, stroke_width=4, fill_color=YEL, fill_opacity=0.35))
        self.play(Create(flag), run_time=0.45)
        br = Brace(VGroup(labs, flag), UP, color=DIM, buff=0.2)
        bl = H("a full first semester", 40, DIM).next_to(br, UP, buff=0.1)
        self.go("0:12.96", FadeIn(br), FadeIn(bl, shift=DOWN * 0.1), run=0.6)
        you = Dot(road.get_start(), radius=0.12, color=YEL).set_z_index(5)
        self.play(FadeIn(you, scale=0.5), run_time=0.25)
        self.play(MoveAlongPath(you, road), run_time=2.4)


class K01_Long(Shot):
    def body(self):
        self.title("One Long Video")
        bar = RoundedRectangle(width=11.6, height=0.62, corner_radius=0.12, stroke_color=CHALK, stroke_width=5).move_to([0, 1.2, 0])
        self.go("0:16.80", draw(bar, run=0.9), run=0.9)
        br = Brace(bar, DOWN, color=DIM, buff=0.15)
        hrs = M(r"4\,\text{h}\ \ 16\,\text{min}", size=56, color=ORG).next_to(br, DOWN, buff=0.12)
        self.go("0:17.75", FadeIn(br), Write(hrs), run=0.7)
        self.go("0:19.20", bar.animate.set_fill(YEL, 0.12), run=0.6)
        # 20 separate videos, scattered
        rng = np.random.default_rng(4)
        tiles = VGroup()
        for i in range(20):
            r, c = divmod(i, 10)
            t = VGroup(RoundedRectangle(width=0.95, height=0.62, corner_radius=0.08, stroke_color=DIM, stroke_width=3),
                       Triangle(stroke_color=DIM, stroke_width=2, fill_color=DIM, fill_opacity=0.6).scale(0.12).rotate(-PI / 2))
            t.rotate(rng.uniform(-0.15, 0.15)).move_to([-5.6 + c * 1.24 + rng.uniform(-0.2, 0.2), -1.55 - r * 1.25 + rng.uniform(-0.25, 0.25), 0])
            tiles.add(t)
        self.go("0:21.10", FadeOut(br), FadeOut(hrs), bar.animate.set_fill(opacity=0), run=0.4)
        self.go("0:21.66", LaggedStart(*[FadeIn(t, shift=UP * 0.1) for t in tiles], lag_ratio=0.05), run=1.0)
        qs = VGroup(*[H("?", 46, RED).move_to(tiles[k]) for k in (3, 12, 16)])
        self.go("0:23.72", *[FadeOut(tiles[k][1]) for k in (3, 12, 16)], *[FadeIn(q, scale=0.6) for q in qs], run=0.5)
        # all here, in order: the tiles snap into the bar as its 20 pieces
        w = bar.width / 20
        segs = VGroup(*[Rectangle(width=w, height=0.62, stroke_color=CHALK, stroke_width=2, fill_color=BLUE, fill_opacity=0.25)
                        .move_to(bar.get_left() + RIGHT * (w * (i + 0.5))) for i in range(20)])
        self.at("0:25.16")
        self.play(FadeOut(qs), *[FadeOut(t[1]) for k, t in enumerate(tiles) if k not in (3, 12, 16)], run_time=0.25)
        self.play(*[ReplacementTransform(t[0], s) for t, s in zip(tiles, segs)], run_time=1.0)
        ordr = VGroup(*[M(str(i + 1), size=30, color=FAINT).next_to(segs[i], DOWN, buff=0.12) for i in range(20)])
        self.go("0:26.46", LaggedStart(*[FadeIn(o) for o in ordr], lag_ratio=0.03), run=0.6)


# real chapter starts (s) from work/sections.json, for the course timeline
CH = [0.0, 1218.08, 2373.08, 3583.86, 4654.0, 5786.25, 6826.13, 7842.37, 9031.57, 10301.89, 11502.17, 12785.37, 13893.77, 14790.75, 15398.13]


class K01_HowTo(Shot):
    def body(self):
        self.title("How to Use This Video", "0:27.34")
        W, Y = 12.0, 1.0
        X = lambda s: -W / 2 + W * s / CH[-1]
        bar = RoundedRectangle(width=W, height=0.6, corner_radius=0.1, stroke_color=CHALK, stroke_width=4).move_to([0, Y, 0])
        ticks = VGroup(*[seg([X(s), Y - 0.3, 0], [X(s), Y + 0.3, 0], DIM, 3) for s in CH[1:-1]])
        self.go("0:28.00", draw(bar, run=0.9), run=0.9)
        self.play(LaggedStart(*[Create(t) for t in ticks], lag_ratio=0.08), run_time=0.7)
        cl = H("14 chapters", 38, DIM).next_to(bar, UP, buff=0.18)
        self.go("0:29.86", FadeIn(cl, shift=DOWN * 0.1), run=0.4)
        # all at once: no
        ph = Line([X(0), Y - 0.45, 0], [X(0), Y + 0.45, 0], color=YEL, stroke_width=6).set_z_index(4)
        self.go("0:31.80", FadeIn(ph), run=0.2)
        self.play(ph.animate.move_to([X(CH[-1]), Y, 0]), run_time=1.1, rate_func=linear)
        no = VGroup(cross_mark(s=0.25), H("all at once", 46, RED)).arrange(RIGHT, buff=0.3).move_to([0, -0.4, 0])
        self.go("0:33.12", Create(no[0]), Write(no[1]), run=0.6)
        self.go("0:34.10", Circumscribe(no, color=RED, fade_out=True), run=0.8)
        # one chapter, maybe two, then a break
        fills = [Rectangle(width=X(CH[k + 1]) - X(CH[k]), height=0.6, stroke_width=0, fill_color=YEL, fill_opacity=0.45)
                 .move_to([(X(CH[k]) + X(CH[k + 1])) / 2, Y, 0]) for k in (0, 1)]
        self.go("0:35.10", FadeOut(no), FadeOut(ph), FadeIn(fills[0]), run=0.5)
        self.go("0:36.50", FadeIn(fills[1]), run=0.4)
        m = mug([X(CH[2]), -0.75, 0])
        brk = H("break", 44, ORG).next_to(m, RIGHT, buff=0.3)
        self.go("0:37.54", Create(m), Write(brk), run=0.7)
        # chapters are in the description
        rows = VGroup(*[H(s, 36) for s in ("0:00  Welcome", "1:16  Functions", "20:18  Limits", "39:33  Continuity")],
                      H("...", 36, DIM)).arrange(DOWN, aligned_edge=LEFT, buff=0.1)
        hd = H("description", 34, DIM)
        box_ = VGroup(hd, rows).arrange(DOWN, aligned_edge=LEFT, buff=0.18).move_to([3.4, -1.75, 0])
        fr = panel(box_, PURP, buff=0.25, width=3)
        self.go("0:38.92", Create(fr), FadeIn(hd), run=0.5)
        self.play(LaggedStart(*[FadeIn(r, shift=UP * 0.08) for r in rows], lag_ratio=0.15), run_time=0.8)
        # come back to exactly where you stopped
        fx = X(CH[2])
        flag = VGroup(seg([fx, Y + 0.3, 0], [fx, Y + 1.25, 0], CHALK, 4),
                      Polygon([fx, Y + 1.25, 0], [fx + 0.55, Y + 1.06, 0], [fx, Y + 0.87, 0],
                              stroke_color=YEL, stroke_width=4, fill_color=YEL, fill_opacity=0.35))
        self.go("0:40.70", FadeOut(cl), Create(flag), run=0.5)
        ph.move_to([X(0), Y, 0])
        self.go("0:41.30", FadeIn(ph), run=0.2)
        self.play(ph.animate.move_to([fx, Y, 0]), run_time=0.6)
        self.go("0:42.40", Circumscribe(flag, color=YEL, fade_out=True), run=0.7)


class K01_Notebook(Shot):
    def body(self):
        self.title("Keep a Notebook", "0:43.70")
        paper = VGroup(Rectangle(width=4.6, height=5.1, stroke_color=CHALK, stroke_width=5, fill_color=CHALK, fill_opacity=0.04))
        for k in range(1, 9):
            paper.add(seg([-2.1, 2.55 - k * 0.56, 0], [2.1, 2.55 - k * 0.56, 0], FAINT, 2))
        paper.add(seg([-1.6, 2.55, 0], [-1.6, -2.55, 0], PINK, 2))
        paper.move_to([-1.9, -0.75, 0])
        pen = pencil().rotate(20 * DEGREES, about_point=ORIGIN).move_to([4.6, -2.0, 0])
        self.go("0:44.30", Create(paper), run=0.7)
        self.play(FadeIn(pen, shift=LEFT * 0.2), run_time=0.4)
        x0 = -2.9   # left edge of the writing, right of the margin

        def row(tex, y, color=CHALK):
            m = M(tex, size=58, color=color)
            return m.move_to([x0 + m.width / 2, y, 0])
        # write the example along with me
        r1, r2 = row("2x+3=7", 1.05), row("x=2", 0.45)
        pen_write(self, pen, r1, "0:46.30", 0.8)
        pen_write(self, pen, r2, "0:47.60", 0.5)
        # try one yourself: pause
        q = row("3x-1=11", -0.45, ORG)
        tr = H("try one", 38, ORG).next_to(paper, RIGHT, buff=0.35).set_y(-0.45)
        self.go("0:50.06", Write(q), FadeIn(tr, shift=LEFT * 0.1), run=0.7)
        self.play(pen.animate.move_to([4.6, -2.0, 0]), run_time=0.4)
        pz = pause_icon([4.4, 1.0, 0])
        self.go("0:51.74", Create(pz[0]), FadeIn(pz[1:]), run=0.5)
        # get it wrong...
        r3 = row(r"x=\frac{10}{3}", -1.55)
        pen_write(self, pen, r3, "0:52.90", 0.6)
        cr = cross_mark(s=0.2).next_to(r3, RIGHT, buff=0.4)
        self.go("0:54.12", Create(cr), run=0.4)
        self.go("0:55.80", Create(strike(r3)), run=0.4)
        # ...and fix it
        r4 = row("x=4", -2.65, GRN)
        pen_write(self, pen, r4, "0:57.20", 0.5)
        tk = tick_mark(s=0.45).next_to(r4, RIGHT, buff=0.45)
        self.go("0:58.00", Create(tk), pen.animate.move_to([4.6, -2.0, 0]), run=0.5)


class K01_Algebra(Shot):
    def body(self):
        self.title("What You Need", "0:59.60")
        p = pill("basic algebra", YEL, 44).move_to([0, 1.7, 0])
        self.go("1:00.98", FadeIn(p, shift=DOWN * 0.1), run=0.5)
        cols = []
        spec = [(-4.5, "3x=12", "x=4", "equations", "1:02.30"),
                (0.0, r"\frac{1}{2}+\frac{1}{4}", r"=\frac{3}{4}", "fractions", "1:03.80"),
                (4.5, r"x^2\cdot x^3", "=x^5", "exponents", "1:04.64")]
        for x, a, b, lab, t in spec:
            ma = M(a, size=60).move_to([x, 0.4, 0])
            mb = M(b, size=60).move_to([x, -0.95, 0])
            ml = H(lab, 40, DIM).move_to([x, -2.0, 0])
            self.go(t, Write(ma), FadeIn(ml, shift=UP * 0.1), run=0.5)
            self.play(Write(mb), run_time=0.4)
            cols.append(VGroup(ma, mb, ml))
        allc = VGroup(*cols)
        # rusty is fine: chapter 1 is the warm-up
        self.go("1:07.32", allc.animate.set_opacity(0.3), run=0.6)
        wu = pill("Chapter 1 = warm-up", ORG, 42).move_to([0, -3.1, 0])
        self.go("1:10.60", FadeIn(wu, shift=UP * 0.15), run=0.5)
        self.go("1:11.76", allc.animate.set_opacity(1), run=0.5)
        uls = [brush_line(c[2].width + 0.3, center=c[2].get_bottom() + DOWN * 0.1, seed=k + 2) for k, c in enumerate(cols)]
        self.go("1:12.50", LaggedStart(*[Create(u) for u in uls], lag_ratio=0.35), run=1.0)
        self.wipe("1:15.40", run=0.4)


# ================================================================ chapter 1: why functions

class K01_WhyFunc(Shot):
    def body(self):
        self.title("Why Functions First?")
        ax = axes((0, 7, 1), (0, 5, 1), x_length=7.0, y_length=4.2, center=(-1.8, -0.75, 0), nums=False)
        f = lambda x: 2.4 + 1.4 * np.sin(0.9 * (x - 1.2))
        self.go("1:21.30", Create(ax), FadeIn(ax.labels), run=0.6)
        c = curve(ax, f, [0.3, 6.6])
        self.play(draw(c, run=0.9))
        fl = M("f(x)", size=48, color=BLUE).next_to(ax.c2p(6.6, f(6.6)), RIGHT, buff=0.2)
        self.play(FadeIn(fl, shift=LEFT * 0.1), run_time=0.3)
        xt = ValueTracker(0.8)
        lt = live_tangent(ax, f, xt, length=2.2, readout_pos=np.array([4.3, 1.5, 0]))
        ch = H("how it changes", 40, PINK).move_to([4.75, 0.75, 0])
        self.go("1:24.60", FadeIn(lt), FadeIn(ch, shift=UP * 0.1), run=0.3)
        self.play(xt.animate.set_value(5.6), run_time=2.2)
        lt.clear_updaters()
        for m in lt.get_family():
            m.clear_updaters()
        self.wipe("1:27.10", run=0.35)
        # shaky ground, shaky everything
        slab = DashedVMobject(Rectangle(width=6.4, height=0.9, stroke_color=FAINT, stroke_width=4).move_to([0, -2.95, 0]), num_dashes=44)
        fn = H("Functions", 50, DIM).move_to(slab)
        self.go("1:27.55", Create(slab), Write(fn), run=0.6)
        blocks = VGroup()
        for k, (nm, col) in enumerate((("Limits", BLUE), ("Derivatives", PINK), ("Integrals", GRN))):
            r = Rectangle(width=4.6, height=0.82, stroke_color=col, stroke_width=4).move_to([0, -2.02 + k * 0.84, 0])
            blocks.add(VGroup(r, H(nm, 42, col).move_to(r)))
        self.go("1:28.40", LaggedStart(*[FadeIn(b, shift=DOWN * 0.2) for b in blocks], lag_ratio=0.3), run=0.9)
        self.go("1:29.70", *[b.animate.shift(RIGHT * s) for b, s in zip(blocks, (0.35, -0.4, 0.55))], run=0.6)
        solid = Rectangle(width=6.4, height=0.9, stroke_color=YEL, stroke_width=5, fill_color=YEL, fill_opacity=0.14).move_to(slab)
        self.go("1:31.90", ReplacementTransform(slab, solid), fn.animate.set_color(YEL), run=0.6)
        self.play(*[b.animate.set_x(0) for b in blocks], run_time=0.6)
        tk = tick_mark(s=0.55).next_to(solid, RIGHT, buff=0.45)
        self.go("1:33.30", Create(tk), run=0.4)
        # two things here come back later
        self.wipe("1:35.60", run=0.4)
        a = M("f(", "a+h", ")", size=64)
        b = M("f(", "a+h", ")", "-", "f(", "a", ")", size=64)
        a[1].set_color(ORG); b[1].set_color(ORG); b[5].set_color(ORG)
        a.move_to([-3.6, 0.55, 0]); b.move_to([-3.6, -0.85, 0])
        self.go("1:38.82", Write(a), run=0.5)
        self.play(Write(b), run_time=0.6)
        ar = arrow([-0.6, -0.15, 0], [1.9, -0.15, 0], YEL, 5)
        dv = H("Derivatives", 56, PINK).move_to([4.2, 0.1, 0])
        c4 = H("Chapter 4", 38, DIM).next_to(dv, DOWN, buff=0.15)
        self.go("1:40.28", GrowArrow(ar), FadeIn(dv, shift=LEFT * 0.15), FadeIn(c4), run=0.7)
        self.go("1:41.62", Circumscribe(dv, color=PINK, fade_out=True), run=0.8)


# ================================================================ the function machine

class K01_Machine(Shot):
    def body(self):
        self.title("What is a Function?", "1:43.64")
        mach, A = machine([0, -0.95, 0], w=4.0, h=2.6, plate_h=1.0)
        self.go("1:46.70", Create(mach), run=0.8)
        XI, XO, rows = -4.7, 4.7, (0.35, -0.6, -1.55)
        outs = []

        def run_once(t_in, t_out, k, run=0.6, mid=None):
            src = M("5", size=72, color=ORG).move_to([XI, rows[k], 0])
            self.go(t_in, FadeIn(src, shift=RIGHT * 0.1), run=0.2)
            feed(self, src.copy(), A, run=run, src=src.get_center())
            if mid:
                mid()
            b = M("13", size=72, color=BLUE).move_to(A["out"] + DOWN * 0.3)
            self.go(t_out, FadeIn(b, shift=DOWN * 0.15), run=0.2)
            self.play(b.animate.move_to([XO, rows[k], 0]), run_time=0.45)
            outs.append(b)

        rule = H("rule", 60).move_to(A["screen"])
        run_once("1:48.20", "1:51.00", 0, mid=lambda: self.go("1:49.70", Create(A["plate"]), Write(rule), run=0.5))
        inl = H("input", 46, ORG).move_to([XI, 1.35, 0])
        self.go("1:53.88", Write(inl), run=0.5)
        outl = H("output", 46, BLUE).move_to([XO, 1.35, 0])
        one = H("exactly one", 40, YEL).next_to(outl, UP, buff=0.12)
        self.go("1:55.46", Write(outl), FadeIn(one, shift=DOWN * 0.1), run=0.5)
        run_once("1:57.10", "1:58.30", 1, run=0.55)
        run_once("1:59.05", "1:59.95", 2, run=0.45)


class K01_Numbers(Shot):
    def body(self):
        self.title("A Number Machine")
        mx = -3.3
        mach, A = machine([mx, -0.5, 0], w=4.2, h=2.6, plate_h=1.3)
        self.go("2:01.40", Create(mach), run=0.8)
        r1 = H("double it", 44).move_to(A["screen"] + UP * 0.28)
        r2 = H("then add 3", 44).move_to(A["screen"] + DOWN * 0.3)
        self.go("2:03.00", Create(A["plate"]), Write(r1), run=0.5)
        self.go("2:03.60", Write(r2), run=0.4)
        ci, co = 2.0, 5.0
        hdr = VGroup(H("in", 50, ORG).move_to([ci, 1.65, 0]), H("out", 50, BLUE).move_to([co, 1.65, 0]),
                     seg([1.0, 1.15, 0], [6.0, 1.15, 0], DIM, 3))
        self.play(FadeIn(hdr), run_time=0.4)
        work = [None]

        def one(n, t_in, t_out, ry):
            m = M(str(n), size=64, color=ORG)
            self.at(t_in)
            fade = [FadeOut(work[0])] if work[0] else []
            m.move_to(A["top"] + UP * 0.42)
            row = VGroup(M(str(n), size=64, color=ORG).move_to([ci, ry, 0]), arrow([ci + 0.6, ry, 0], [co - 0.7, ry, 0], DIM, 3))
            self.play(FadeIn(m, shift=DOWN * 0.15), FadeIn(row), *fade, run_time=0.25)
            self.play(m.animate.move_to(A["mouth"]).scale(0.55), run_time=0.3)
            w = M(r"2\cdot " + str(n) + "+3", size=56).move_to([mx, -3.0, 0])
            self.play(FadeOut(m), Write(w), run_time=0.35)
            work[0] = w
            b = M(str(2 * n + 3), size=64, color=BLUE).move_to(A["out"] + DOWN * 0.3)
            self.go(t_out, FadeIn(b, shift=DOWN * 0.15), run=0.2)
            self.play(b.animate.move_to([co, ry, 0]), run_time=0.45)

        one(1, "2:05.00", "2:06.00", 0.5)
        one(4, "2:06.70", "2:08.00", -0.5)
        one(0, "2:09.10", "2:10.20", -1.5)
        tk = tick_mark(s=0.45).move_to([co + 1.1, -0.5, 0])
        self.go("2:11.32", Create(tk), run=0.4)


def fx_eq(size=100):
    e = M("f", "(", "x", ")", "=", "2", "x", "+", "3", size=size)
    e[0].set_color(YEL)
    e[2].set_color(ORG)
    e[6].set_color(ORG)
    return e


class K01_Notation(Shot):
    def body(self):
        self.title("Writing It Out")
        ph = [H("double it and add 3", 54, c).move_to([0, 1.25 - 0.95 * k, 0]) for k, c in enumerate((DIM, FAINT, FAINT))]
        self.go("2:12.80", Write(ph[0]), run=1.0)
        self.go("2:14.96", FadeIn(ph[1], shift=DOWN * 0.1), run=0.4)
        self.play(FadeIn(ph[2], shift=DOWN * 0.1), run_time=0.4)
        self.title("Function Notation", "2:17.16")
        self.play(*[FadeOut(p) for p in ph], run_time=0.4)
        e = fx_eq(120).move_to([0, 0.2, 0])
        self.go("2:20.20", Write(e[0]), run=0.4)
        nm = H("name", 46, YEL).move_to([e[0].get_x(), 1.75, 0])
        na = arrow(nm.get_bottom() + DOWN * 0.08, e[0].get_top() + UP * 0.12, YEL)
        self.play(Write(nm), GrowArrow(na), run_time=0.5)
        self.go("2:21.52", Write(e[1:4]), run=0.4)
        self.go("2:22.30", Write(e[4]), run=0.3)
        self.go("2:22.70", Write(e[5:7]), run=0.4)
        self.go("2:23.36", Write(e[7:]), run=0.4)
        ip = H("input", 46, ORG).move_to([e[2].get_x(), -1.45, 0])
        ipa = arrow(ip.get_top() + UP * 0.08, e[2].get_bottom() + DOWN * 0.12, ORG)
        self.go("2:24.70", Write(ip), GrowArrow(ipa), run=0.5)
        rb = Brace(e[5:], DOWN, color=CHALK, buff=0.15)
        rl = H("rule", 46).next_to(rb, DOWN, buff=0.1)
        self.go("2:27.40", FadeIn(rb), Write(rl), run=0.6)
        # f(4): put 4 wherever x is
        self.at("2:28.70")
        self.play(FadeOut(VGroup(nm, na, ip, ipa, rb, rl)), run_time=0.3)
        self.play(e.animate.scale(0.75).move_to([0, 1.55, 0]), run_time=0.5)
        rowB = M("f(", "4", ")", "=", "2", r"\cdot", "4", "+", "3", size=96)
        rowB[1].set_color(ORG); rowB[6].set_color(ORG)
        rowB.move_to([0, 0.0, 0])
        self.go("2:29.60", Write(rowB[:3]), run=0.5)
        self.go("2:30.60", Circumscribe(e[5:], color=CHALK, fade_out=True), run=0.7)
        self.go("2:31.70", Circumscribe(e[2], color=ORG, fade_out=True), Circumscribe(e[6], color=ORG, fade_out=True), run=0.7)
        self.at("2:33.30")
        self.play(TransformFromCopy(e[4], rowB[3]), TransformFromCopy(e[5:7], rowB[4:7]), TransformFromCopy(e[7:], rowB[7:]), run_time=0.8)
        rowC = M("=", "11", size=96)
        rowC.shift(rowB[3].get_center() - rowC[0].get_center() + DOWN * 1.35)
        rowC[1].set_color(BLUE)
        self.go("2:35.90", Write(rowC), run=0.4)
        self.play(Create(answer_box(rowC[1])), run_time=0.5)


class K01_NotTimes(Shot):
    def body(self):
        self.title("Careful!", "2:37.40")
        line = M("f(x)", r"\neq", r"f\times x", size=130).move_to([0, 0.6, 0])
        self.go("2:39.88", Write(line[0]), run=0.5)
        self.go("2:40.48", Write(line[1]), run=0.4)
        self.go("2:41.16", Write(line[2]), run=0.5)
        st = strike(line[2])
        nm = H("no multiplication", 46, RED).next_to(line[2], DOWN, buff=0.45)
        self.go("2:42.82", Create(st), Write(nm), run=0.6)
        # it is a label: the output of f for the input x
        self.go("2:44.20", FadeOut(VGroup(line[1], line[2], st, nm)), run=0.3)
        bx = RoundedRectangle(width=2.4, height=1.6, corner_radius=0.2, stroke_color=CHALK, stroke_width=5).move_to([0, 0.5, 0])
        fl = M("f", size=90, color=YEL).move_to(bx)
        xi = M("x", size=90, color=ORG).move_to([-4.2, 0.5, 0])
        a1 = arrow([-3.6, 0.5, 0], [-1.35, 0.5, 0])
        a2 = arrow([1.35, 0.5, 0], [2.7, 0.5, 0])
        self.play(Create(bx), Write(fl), FadeIn(xi), GrowArrow(a1), line[0].animate.scale(0.7).move_to([4.2, 0.5, 0]), run_time=0.7)
        self.go("2:46.10", GrowArrow(a2), line[0].animate.set_color(BLUE), run=0.5)
        ol = H("output", 40, BLUE).next_to(line[0], DOWN, buff=0.25)
        self.play(FadeIn(ol, shift=UP * 0.1), run_time=0.3)
        il = H("input", 40, ORG).next_to(xi, DOWN, buff=0.25)
        self.go("2:47.58", FadeIn(il, shift=UP * 0.1), run=0.4)
        say = VGroup(tick_mark(s=0.42), M("f", r"\text{ of }", "x", size=60, color=GRN)).arrange(RIGHT, buff=0.3).move_to([-2.8, -2.3, 0])
        nsay = VGroup(cross_mark(s=0.2), M("f", r"\text{ times }", "x", size=60, color=RED)).arrange(RIGHT, buff=0.3).move_to([2.8, -2.3, 0])
        self.go("2:49.30", Create(say[0]), Write(say[1]), run=0.5)
        self.go("2:50.40", Create(nsay[0]), Write(nsay[1]), run=0.5)


class K01_Vending(Shot):
    def body(self):
        self.title("Why Exactly One Output?", "2:52.62")
        vm, btn, items, tray = vending([-4.4, -0.95, 0])
        self.go("2:55.40", Create(vm[0]), FadeIn(vm[1]), run=0.9)
        self.play(FadeIn(vm[2]), run_time=0.3)
        b = btn[0]
        pc = pill("chips button", YEL, 42).move_to([-0.3, 1.0, 0])
        self.go("2:56.90", b.animate.set_fill(YEL, 0.8), FadeIn(pc, shift=RIGHT * 0.15), run=0.45)

        def drop(item, t):
            d = item.copy()
            self.at(t)
            self.play(d.animate.move_to(tray).scale(min(1, 0.42 / d.height)), run_time=0.5, rate_func=rush_into)
            return d

        d1 = drop(items[0], "2:57.80")
        out1 = VGroup(chips_bag(1.0), H("chips", 44, YEL)).arrange(RIGHT, buff=0.3).move_to([4.0, 1.1, 0])
        a1 = arrow(pc.get_right() + RIGHT * 0.15, out1.get_left() + LEFT * 0.15)
        tk = tick_mark(s=0.45).next_to(out1, RIGHT, buff=0.3)
        self.go("2:58.40", GrowArrow(a1), FadeIn(out1, shift=LEFT * 0.1), run=0.5)
        self.play(Create(tk), run_time=0.3)
        # same button again: sometimes chips, sometimes soda
        self.go("2:59.80", FadeOut(d1), FadeOut(tk), b.animate.set_fill(opacity=0), run=0.3)
        self.go("3:00.40", b.animate.set_fill(YEL, 0.8), run=0.3)
        d2 = drop(items[1], "3:01.40")
        self.go("3:01.94", Circumscribe(out1, color=YEL, fade_out=True), run=0.6)
        self.go("3:02.70", FadeOut(d2), run=0.3)
        d3 = drop(items[2], "3:03.20")
        out2 = VGroup(can(1.0), H("soda", 44, BLUE)).arrange(RIGHT, buff=0.3).move_to([4.0, -0.9, 0])
        a2 = arrow(pc.get_right() + RIGHT * 0.15, out2.get_left() + LEFT * 0.15)
        self.go("3:03.72", GrowArrow(a2), FadeIn(out2, shift=LEFT * 0.1), run=0.5)
        bad = VGroup(cross_mark(s=0.28), H("broken", 48, RED)).arrange(RIGHT, buff=0.35).move_to([2.6, -2.75, 0])
        self.go("3:05.40", Create(bad[0]), Write(bad[1]), run=0.5)
        # same thing in maths
        self.wipe("3:06.60", run=0.4)
        i3 = M("3", size=90, color=ORG).move_to([-3.2, -0.3, 0])
        il = H("one input", 42, ORG).next_to(i3, DOWN, buff=0.35)
        self.go("3:08.30", FadeIn(i3, scale=0.8), FadeIn(il), run=0.4)
        o1, o2 = M("5", size=90, color=BLUE).move_to([2.0, 0.9, 0]), M("8", size=90, color=BLUE).move_to([2.0, -1.5, 0])
        f1 = arrow(i3.get_right() + RIGHT * 0.2, o1.get_left() + LEFT * 0.25)
        f2 = arrow(i3.get_right() + RIGHT * 0.2, o2.get_left() + LEFT * 0.25)
        self.go("3:09.30", GrowArrow(f1), GrowArrow(f2), FadeIn(o1), FadeIn(o2), run=0.6)
        nf = VGroup(cross_mark(s=0.25), H("not a function", 46, RED)).arrange(DOWN, buff=0.3).move_to([4.5, -0.3, 0])
        self.go("3:10.70", Create(nf[0]), Write(nf[1]), run=0.6)


class K01_TwoIn(Shot):
    def body(self):
        self.title("The Other Way is Fine", "3:12.20")
        ovi = Ellipse(width=2.6, height=3.6, stroke_color=ORG, stroke_width=4).move_to([-3.0, -0.75, 0])
        ovo = Ellipse(width=2.6, height=3.6, stroke_color=BLUE, stroke_width=4).move_to([3.0, -0.75, 0])
        li = H("inputs", 42, ORG).next_to(ovi, UP, buff=0.15)
        lo = H("outputs", 42, BLUE).next_to(ovo, UP, buff=0.15)
        self.go("3:15.08", Create(ovi), FadeIn(li), run=0.5)
        self.go("3:16.90", Create(ovo), FadeIn(lo), run=0.5)
        fx = M("f(x)", "=", "x^2", size=66).move_to([0, 1.6, 0])
        self.go("3:18.40", Write(fx), run=0.7)
        two = M("2", size=72, color=ORG).move_to([-3.0, 0.05, 0])
        four = M("4", size=72, color=BLUE).move_to([3.0, -0.75, 0])
        mtwo = M("-2", size=72, color=ORG).move_to([-3.0, -1.55, 0])
        self.go("3:20.70", FadeIn(two, scale=0.8), run=0.3)
        a1 = arrow(two.get_right() + RIGHT * 0.2, four.get_left() + LEFT * 0.2 + UP * 0.08)
        self.go("3:21.30", GrowArrow(a1), FadeIn(four), run=0.5)
        self.go("3:22.86", FadeIn(mtwo, scale=0.8), run=0.3)
        a2 = arrow(mtwo.get_right() + RIGHT * 0.2, four.get_left() + LEFT * 0.2 + DOWN * 0.08)
        self.go("3:23.70", GrowArrow(a2), run=0.5)
        ok = VGroup(tick_mark(s=0.45), H("allowed", 46, GRN)).arrange(RIGHT, buff=0.3).move_to([0, -3.15, 0])
        self.go("3:24.80", Create(ok[0]), Write(ok[1]), run=0.5)
        self.go("3:26.90", a1.animate.set_color(YEL), run=0.4)
        self.go("3:27.70", a2.animate.set_color(YEL), run=0.4)


# ================================================================ f(a+h)

class K01_Sub(Shot):
    def body(self):
        self.title("Expressions Go In Too", "3:30.00")
        mach, A = machine([0, -1.1, 0], w=3.8, h=2.4, plate_h=1.0)
        fl = M("f", size=80, color=YEL).move_to(A["screen"])
        self.go("3:32.90", Create(mach), run=0.7)
        self.play(Create(A["plate"]), Write(fl), run_time=0.4)
        feed(self, M("3", size=72, color=ORG), A, run=0.6)
        feed(self, M("7", size=72, color=ORG), A, run=0.6)
        ah = M("a+h", size=72, color=ORG)
        self.at("3:37.50")
        feed(self, ah, A, run=0.9)
        self.wipe("3:38.60", run=0.35)
        # f(x) = x^2 + 2x, then put a+h wherever x is
        e = M("f(x)", "=", "x^2", "+", "2x", size=72)
        on_eq(e, 1, -0.8, 1.45)
        self.go("3:39.50", Write(e[0]), run=0.5)
        self.go("3:40.40", Write(e[1]), run=0.25)
        self.go("3:40.85", Write(e[2]), run=0.4)
        self.go("3:41.60", Write(e[3:]), run=0.5)
        r = M("f(a+h)", "=", "?", size=72)
        orange_on(r, (0, 2, 5))
        on_eq(r, 1, -0.8, 0.0)
        self.go("3:44.00", Write(r), run=0.7)
        xs = VGroup(e[2][0], e[4][1])
        self.go("3:47.28", *[Circumscribe(x, color=ORG, fade_out=True, buff=0.08) for x in xs], run=0.8)
        self.go("3:49.40", xs.animate.set_color(ORG), run=0.4)
        full = M("f(a+h)", "=", "(a+h)^2", "+", "2(a+h)", size=72)
        orange_on(full, (0, 2, 5), (2, 1, 4), (4, 2, 5))
        on_eq(full, 1, -0.8, 0.0)
        self.go("3:51.80", FadeOut(r[2]), run=0.25)
        self.play(TransformFromCopy(e[2], full[2]), run_time=0.8)
        self.go("3:53.90", TransformFromCopy(e[3], full[3]), TransformFromCopy(e[4], full[4]), run=0.8)
        self.remove(r[0], r[1])
        self.add(full[0], full[1])
        self.go("3:55.80", Create(Underline(full[2:], color=YEL, buff=0.12)), run=0.5)


def big_fah(size=60):
    m = M("f(a+h)", "=", "a^2", "+2ah", "+h^2", "+2a", "+2h", size=size)
    return orange_on(m, (0, 2, 5))


class K01_Expand(Shot):
    def body(self):
        self.title("Expand It")
        top = M("f(a+h)", "=", "(a+h)^2", "+", "2(a+h)", size=62)
        orange_on(top, (0, 2, 5), (2, 1, 4), (4, 2, 5))
        on_eq(top, 1, -0.6, 1.6)
        self.play(FadeIn(top), run_time=0.3)
        EX = 0.0
        L1 = on_eq(orange_on(M("(a+h)^2", "=", "a^2", "+2ah", "+h^2", size=60), (0, 1, 4)), 1, EX, 0.35)
        L2 = on_eq(orange_on(M("2(a+h)", "=", "2a", "+2h", size=60), (0, 2, 5)), 1, EX, -0.8)
        self.go("3:58.40", TransformFromCopy(top[2], L1[0]), run=0.6)
        self.go("3:59.64", Write(L1[1]), run=0.25)
        self.go("3:59.98", Write(L1[2]), run=0.35)
        self.go("4:00.66", Write(L1[3]), run=0.45)
        self.go("4:02.00", Write(L1[4]), run=0.45)
        self.go("4:03.80", TransformFromCopy(top[4], L2[0]), run=0.6)
        self.go("4:05.34", Write(L2[1]), run=0.25)
        self.go("4:05.74", Write(L2[2]), run=0.35)
        self.go("4:06.26", Write(L2[3]), run=0.4)
        L3 = big_fah(62)
        on_eq(L3, 1, -2.4, -2.2)
        self.go("4:08.90", Write(L3[:2]), run=0.6)
        self.go("4:10.90", TransformFromCopy(L1[2:5], L3[2:5]), run=0.9)
        self.go("4:14.30", TransformFromCopy(L2[2:4], L3[5:7]), run=0.8)
        self.play(Create(answer_box(L3)), run_time=0.5)


class K01_Later(Shot):
    def body(self):
        self.title("Why Bother?", "4:16.58")
        res = big_fah(54).move_to([0, 1.45, 0])
        rb = answer_box(res)
        self.play(FadeIn(res), FadeIn(rb), run_time=0.3)
        pt_ = H("pointless?", 50, DIM).move_to([0, -0.1, 0])
        self.go("4:17.74", FadeIn(pt_, shift=UP * 0.1), run=0.4)
        self.go("4:19.80", Create(strike(pt_)), run=0.4)
        self.wipe("4:21.24", run=0.35)
        # the derivative is built from f(a+h)
        dq = M(r"\frac{f(a+h)-f(a)}{h}", size=84, color=PINK).move_to([-2.6, 0.95, 0])
        dl = H("the derivative", 48, PINK).move_to([2.9, 1.25, 0])
        c4 = H("Chapter 4", 38, DIM).next_to(dl, DOWN, buff=0.15)
        self.go("4:23.30", Write(dq), FadeIn(dl, shift=LEFT * 0.1), FadeIn(c4), run=0.9)
        top_glyphs = sorted([g for g in dq[0] if g.get_y() > dq.get_y() + 0.1], key=lambda g: g.get_x())
        fah = VGroup(*top_glyphs[:6])   # f ( a + h ), found by position: glyph order inside \frac is not reliable
        self.go("4:25.20", fah.animate.set_color(ORG), run=0.4)
        rows = VGroup(M("x^2", r"\to", "(a+h)^2", size=52), M("x^3", r"\to", "(a+h)^3", size=52),
                      M(r"\sqrt{x}", r"\to", r"\sqrt{a+h}", size=52)).arrange(DOWN, buff=0.28).move_to([-2.6, -1.85, 0])
        orange_on(rows[0], (2, 1, 4)); orange_on(rows[1], (2, 1, 4)); orange_on(rows[2], (2, 2, 5))
        for r in rows:
            r[0].set_color(BLUE)
        for t, r in zip(("4:26.50", "4:27.14", "4:27.76"), rows):
            self.go(t, FadeIn(r, shift=UP * 0.1), run=0.5)
        ov = H("over and over", 42, DIM).next_to(rows, RIGHT, buff=0.7)
        self.play(FadeIn(ov), run_time=0.4)
        pr = pill("practice it now", GRN, 42).move_to([3.4, -2.7, 0])
        self.go("4:31.80", FadeIn(pr, shift=UP * 0.15), run=0.5)


class K01_Diff(Shot):
    def body(self):
        self.title("One Step Further", "4:34.92")
        EX = -0.9
        A = on_eq(big_fah(58), 1, EX, 1.55)
        self.play(FadeIn(A), run_time=0.3)
        C = M("f(a+h)-f(a)", "=", "?", size=58)
        orange_on(C, (0, 2, 5), (0, 9, 10))
        on_eq(C, 1, EX, -1.25)
        self.go("4:37.62", Write(C), run=0.9)
        # f(a) under f(a+h), lined up term by term
        B = M("f(a)", "=", "a^2", "+2a", size=58)
        orange_on(B, (0, 2, 3))
        on_eq(B, 1, EX, 0.45)
        B[0].shift(RIGHT * (A[0].get_right()[0] - B[0].get_right()[0]))
        B[2].set_x(A[2].get_x())
        B[3].set_x(A[5].get_x())
        self.go("4:40.72", Write(B[:2]), run=0.5)
        self.go("4:41.98", Write(B[2]), run=0.4)
        self.go("4:42.66", Write(B[3]), run=0.4)
        mn = M("-", size=72).next_to(B[0], LEFT, buff=0.35)
        bar = seg([A.get_left()[0] - 0.7, -0.05, 0], [A.get_right()[0] + 0.1, -0.05, 0], CHALK, 3)
        self.go("4:44.80", Write(mn), Create(bar), run=0.6)
        self.go("4:47.40", Create(strike(A[2])), Create(strike(B[2])), run=0.5)
        self.go("4:49.10", Create(strike(A[5])), Create(strike(B[3])), run=0.5)
        rest = M("2ah", "+h^2", "+2h", size=58)
        rest.next_to(C[1], RIGHT, buff=0.25)
        self.go("4:50.50", FadeOut(C[2]), run=0.25)
        self.go("4:50.95", TransformFromCopy(A[3], rest[0]), run=0.5)
        self.go("4:51.75", TransformFromCopy(A[4], rest[1]), run=0.5)
        self.go("4:52.95", TransformFromCopy(A[6], rest[2]), run=0.5)
        ab = answer_box(VGroup(C[:2], rest))
        self.go("4:53.80", Create(ab), run=0.5)
        nt = note("remember this one", ab.get_corner(DR) + LEFT * 2.5, np.array([1, -0.8, 0]), size=40, dist=0.6)
        self.go("4:55.00", FadeIn(nt[0], shift=UP * 0.1), Create(nt[1]), run=0.6)
        self.go("4:57.40", Circumscribe(rest, color=YEL, fade_out=True), run=0.8)


# ================================================================ graphs

class K01_Graph(Shot):
    def body(self):
        self.title("Graphs", "4:59.66")
        ax = axes((-1, 4, 1), (-1, 9, 1), x_length=5.0, y_length=5.2, center=(-3.2, -0.75, 0), num_size=34)
        labs = ax.labels
        xl = VGroup(*labs[0:4], labs[13])
        yl = VGroup(*labs[4:13], labs[14])
        grid = VGroup(*[Line(ax.c2p(x, -1), ax.c2p(x, 8.6), stroke_color=FAINT, stroke_width=1.2, stroke_opacity=0.6) for x in range(-1, 4)],
                      *[Line(ax.c2p(-1, y), ax.c2p(3.6, y), stroke_color=FAINT, stroke_width=1.2, stroke_opacity=0.6) for y in range(-1, 9)])
        self.go("5:02.70", LaggedStart(*[Create(g) for g in grid], lag_ratio=0.04), run=0.9)
        self.go("5:04.70", Create(ax.x_axis), FadeIn(xl), run=0.7)
        self.go("5:06.86", Create(ax.y_axis), FadeIn(yl), run=0.7)
        # input x, output y, plot the point
        RCX = 3.4
        d0 = Dot(ax.c2p(1, 0), radius=0.1, color=ORG).set_z_index(6)
        self.go("5:09.22", FadeIn(d0, scale=0.5), labs[1].animate.set_color(ORG), run=0.4)
        up = DashedLine(ax.c2p(1, 0), ax.c2p(1, 5), color=DIM, stroke_width=3, dash_length=0.1)
        self.go("5:11.10", Create(up), run=0.6)
        ac = DashedLine(ax.c2p(1, 5), ax.c2p(0, 5), color=DIM, stroke_width=3, dash_length=0.1)
        self.go("5:12.50", Create(ac), labs[9].animate.set_color(YEL), run=0.5)
        p0 = Dot(ax.c2p(1, 5), radius=0.11, color=YEL).set_z_index(6)
        self.go("5:14.02", FadeIn(p0, scale=0.5), run=0.3)
        yf = M("y", "=", "f(x)", size=72).move_to([RCX, 1.5, 0])
        yf[0].set_color(YEL)
        self.go("5:16.30", Write(yf[0]), run=0.3)
        self.go("5:16.70", Write(yf[1:]), run=0.5)
        # the table for 2x + 3
        self.go("5:18.60", FadeOut(VGroup(d0, up, ac, p0)), labs[1].animate.set_color(FAINT), labs[9].animate.set_color(FAINT), run=0.4)
        fx = M("f(x)", "=", "2x+3", size=64).move_to([RCX, 1.5, 0])
        self.go("5:19.70", ReplacementTransform(yf, fx), run=0.8)
        top, step = 0.45, 0.72
        colx = (RCX - 0.8, RCX + 0.8)
        frame = VGroup(seg([RCX, top + 0.35, 0], [RCX, top - 0.4 - 3 * step, 0], CHALK, 3),
                       seg([RCX - 1.5, top - 0.36, 0], [RCX + 1.5, top - 0.36, 0], CHALK, 3))
        head = VGroup(M("x", size=54, color=ORG).move_to([colx[0], top, 0]), M("y", size=54, color=YEL).move_to([colx[1], top, 0]))
        self.play(Create(frame), FadeIn(head), run_time=0.5)
        f = lambda x: 2 * x + 3
        for i, (x, tx, ty) in enumerate(((0, "5:22.40", "5:23.46"), (1, "5:24.62", "5:25.60"), (2, "5:26.82", "5:27.90"))):
            ry = top - (i + 1) * step - 0.05
            self.go(tx, Write(M(str(x), size=54, color=ORG).move_to([colx[0], ry, 0])), run=0.35)
            d = pt(ax, x, f(x), r=0.1)
            self.go(ty, Write(M(str(f(x)), size=54, color=YEL).move_to([colx[1], ry, 0])), FadeIn(d, scale=0.5), run=0.4)
        ln = curve(ax, f, [-0.95, 2.8], width=6)
        self.go("5:29.70", draw(ln, run=1.0), run=1.0)
        sl = H("straight line", 42, BLUE).next_to(ax.c2p(2.3, 4.4), RIGHT, buff=0.3)
        self.play(FadeIn(sl, shift=LEFT * 0.1), run_time=0.4)


class K01_VTest(Shot):
    def body(self):
        self.title("The Vertical Line Test", "5:32.20")
        ax = axes((-1, 7, 1), (-3, 3, 1), x_length=9.4, y_length=5.0, center=(-0.5, -0.8, 0), nums=False)
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.6)
        f1 = lambda x: 1.3 * np.sin(1.1 * x) + 0.3
        c1 = curve(ax, f1, [0.1, 6.3], width=6)
        self.go("5:33.40", draw(c1, run=1.0), run=1.0)
        xt = ValueTracker(0.2)
        s = vslider(ax, xt, f1, lo=-2.9, hi=2.9)
        self.go("5:37.30", FadeIn(s), run=0.3)
        self.play(xt.animate.set_value(6.2), run_time=3.4, rate_func=linear)
        drop_slider(self, s, 0.25)
        # a sideways curve: one x, two y's
        c2 = ParametricFunction(lambda t: ax.c2p(1 + 0.5 * t * t, t), t_range=[-2.65, 2.65], color=BLUE, stroke_width=6)
        self.play(ReplacementTransform(c1, c2), run_time=0.7)
        xt.set_value(0.3)
        s = vslider(ax, xt, None, lo=-2.9, hi=2.9)
        self.play(FadeIn(s), run_time=0.2)
        self.play(xt.animate.set_value(3.0), run_time=0.6)
        s.clear_updaters()
        d1, d2 = Dot(ax.c2p(3, 2), radius=0.12, color=RED).set_z_index(6), Dot(ax.c2p(3, -2), radius=0.12, color=RED).set_z_index(6)
        self.go("5:44.40", FadeIn(d1, scale=0.5), FadeIn(d2, scale=0.5), run=0.4)
        nf = VGroup(cross_mark(s=0.22), H("not a function", 44, RED)).arrange(RIGHT, buff=0.25).move_to([4.2, 1.25, 0])
        self.go("5:45.84", Create(nf[0]), Write(nf[1]), run=0.6)
        foot = Dot(ax.c2p(3, 0), radius=0.11, color=ORG).set_z_index(6)
        one = H("one input", 38, ORG).next_to(foot, DR, buff=0.12)
        self.go("5:47.50", FadeIn(foot, scale=0.5), FadeIn(one, shift=UP * 0.1), run=0.4)
        two = H("two outputs", 38, RED).next_to(d1, LEFT, buff=0.3).shift(UP * 0.35)
        self.go("5:48.30", FadeIn(two, shift=LEFT * 0.1), run=0.4)


class K01_Shapes(Shot):
    def body(self):
        self.title("The Vertical Line Test", animate=False)
        axs = [axes((-2, 2, 1), (-2, 2, 1), x_length=3.6, y_length=3.6, center=(cx, 0.05, 0), nums=False, x_label=None, y_label=None)
               for cx in (-4.55, 0, 4.55)]
        self.play(*[FadeIn(a) for a in axs], run_time=0.3)

        def verdict(ax, ok, word):
            mark = tick_mark(s=0.42) if ok else cross_mark(s=0.2)
            return VGroup(mark, H(word, 42, GRN if ok else RED)).arrange(RIGHT, buff=0.2).move_to([ax.get_center()[0], -2.4, 0])

        def sweep(ax, f, run):
            xt = ValueTracker(-1.75)
            s = vslider(ax, xt, f)
            self.add(s)
            self.play(xt.animate.set_value(1.75), run_time=run, rate_func=linear)
            s.clear_updaters()
            self.remove(s)

        f1 = lambda x: 0.75 * x + 0.1
        self.go("5:49.90", Create(curve(axs[0], f1, [-1.9, 1.9])), run=0.35)
        sweep(axs[0], f1, 0.6)
        self.play(FadeIn(verdict(axs[0], True, "passes"), shift=UP * 0.1), run_time=0.3)
        f2 = lambda x: x * x - 1.5
        self.go("5:51.64", Create(curve(axs[1], f2, [-1.85, 1.85])), run=0.35)
        sweep(axs[1], f2, 0.6)
        self.play(FadeIn(verdict(axs[1], True, "passes"), shift=UP * 0.1), run_time=0.3)
        ax = axs[2]
        circ = Circle(radius=ax.c2p(1.4, 0)[0] - ax.c2p(0, 0)[0], color=BLUE, stroke_width=5).move_to(ax.c2p(0, 0))
        self.go("5:53.34", Create(circ), run=0.5)
        xt = ValueTracker(-1.8)
        s = vslider(ax, xt)
        self.go("5:55.10", FadeIn(s), run=0.2)
        self.play(xt.animate.set_value(0), run_time=0.6)
        s.clear_updaters()
        top, bot = Dot(ax.c2p(0, 1.4), radius=0.12, color=RED).set_z_index(6), Dot(ax.c2p(0, -1.4), radius=0.12, color=RED).set_z_index(6)
        self.go("5:57.00", FadeIn(top, scale=0.5), run=0.25)
        self.go("5:57.55", FadeIn(bot, scale=0.5), run=0.25)
        self.play(FadeIn(verdict(ax, False, "fails"), shift=UP * 0.1), run_time=0.3)


# ================================================================ domain and range

class K01_Domain(Shot):
    def body(self):
        self.title("Domain and Range", "5:58.64")
        mbox = RoundedRectangle(width=3.2, height=1.9, corner_radius=0.25, stroke_color=CHALK, stroke_width=5).move_to([0, 0.7, 0])
        fl = M("f", size=90, color=YEL).move_to(mbox)
        ain = arrow([-5.2, 0.7, 0], [-1.7, 0.7, 0], DIM, 5)
        aout = arrow([1.7, 0.7, 0], [5.2, 0.7, 0], DIM, 5)
        self.go("5:59.20", Create(mbox), Write(fl), run=0.6)
        self.play(GrowArrow(ain), GrowArrow(aout), run_time=0.4)
        dom = H("domain", 54, YEL).move_to([-3.45, -0.35, 0])
        rng = H("range", 54, YEL).move_to([3.45, -0.35, 0])
        dsub = H("allowed inputs", 38).next_to(dom, DOWN, buff=0.2)
        rsub = H("possible outputs", 38).next_to(rng, DOWN, buff=0.2)
        self.go("6:02.60", Write(dom), run=0.5)
        n4 = M("4", size=60, color=ORG).move_to([-4.6, 1.3, 0])
        self.go("6:04.08", FadeIn(n4, shift=RIGHT * 0.2), FadeIn(dsub, shift=UP * 0.1), run=0.35)
        self.play(n4.animate.move_to([-1.6, 1.3, 0]).set_opacity(0), run_time=0.6)
        self.remove(n4)
        self.go("6:06.26", Write(rng), run=0.5)
        n11 = M("11", size=60, color=BLUE).move_to([1.8, 1.3, 0]).set_opacity(0)
        self.add(n11)
        self.go("6:07.66", n11.animate.move_to([4.6, 1.3, 0]).set_opacity(1), FadeIn(rsub, shift=UP * 0.1), run=0.6)
        # 2x + 3 and x^2 take anything
        self.go("6:09.40", FadeOut(VGroup(dom, rng, dsub, rsub, n11)), run=0.4)
        nums = VGroup()
        for s_, x in (("7", -4.9), ("-3", -3.95), ("0", -3.0), (r"\tfrac{1}{2}", -2.15)):
            nums.add(M(s_, size=60, color=ORG).move_to([x, 1.45, 0]))
        self.go("6:11.80", LaggedStart(*[FadeIn(n, shift=DOWN * 0.15) for n in nums], lag_ratio=0.25), run=0.7)
        self.play(*[n.animate.move_to([-1.6, 0.9, 0]).set_opacity(0) for n in nums], run_time=0.35)
        self.remove(nums)
        self.go("6:13.32", Transform(fl, M("2x+3", size=66).move_to(mbox)), run=0.5)
        self.go("6:14.66", Transform(fl, M("x^2", size=72).move_to(mbox)), run=0.5)
        nl = number_line((-5, 5, 1), length=11, center=(0, -1.6, 0))
        nl.remove(nl.tip)   # the green rays carry the arrowheads
        self.go("6:15.70", Create(nl), FadeIn(nl.labels), run=0.5)
        allr = VGroup(ray(nl.n2p(0), nl.n2p(-5.3)), ray(nl.n2p(0), nl.n2p(5.3)))
        self.go("6:16.30", Create(allr), run=0.6)
        cap = VGroup(H("domain:", 46, YEL), H("all real numbers", 46, GRN)).arrange(RIGHT, buff=0.25).move_to([0, -2.9, 0])
        self.go("6:17.40", FadeIn(cap, shift=UP * 0.1), run=0.5)


class K01_Divide(Shot):
    def body(self):
        self.title("Two Things to Watch", "6:19.52")
        c1 = M(r"\frac{1}{0}", size=110).move_to([-3.0, 0.4, 0])
        c1[0][2].set_color(RED)
        c2 = M(r"\sqrt{-4}", size=110).move_to([3.0, 0.4, 0])
        c2[0][2:].set_color(RED)
        f1, f2 = panel(c1, RED, buff=0.45), panel(c2, RED, buff=0.45)
        n1 = M("1", size=50, color=ORG).next_to(f1, UP, buff=0.15)
        n2 = M("2", size=50, color=ORG).next_to(f2, UP, buff=0.15)
        g1, g2 = VGroup(f1, c1, n1), VGroup(f2, c2, n2)
        self.go("6:20.04", Create(f1), Write(c1), FadeIn(n1), run=0.6)
        self.play(Create(f2), Write(c2), FadeIn(n2), run_time=0.6)
        self.go("6:24.60", g2.animate.set_opacity(0.25), run=0.4)
        self.go("6:25.40", Circumscribe(f1, color=RED, fade_out=True), run=0.7)
        na = VGroup(cross_mark(s=0.2), H("no answer", 44, RED)).arrange(RIGHT, buff=0.25).next_to(f1, DOWN, buff=0.4)
        self.go("6:27.20", Create(na[0]), Write(na[1]), run=0.5)
        self.wipe("6:28.90", run=0.3)
        # 1/(x-2): x = 2 is not allowed
        fx = M(r"f(x)=\frac{1}{x-2}", size=74).move_to([0, 1.35, 0])
        self.go("6:29.80", Write(fx), run=1.0)
        x2 = M("x=2", size=64, color=ORG).move_to([-3.4, -0.95, 0])
        self.go("6:33.10", Write(x2), run=0.45)
        sub = M(r"\frac{1}{2-2}", size=74).move_to([0.6, -0.95, 0])
        sub[0][2].set_color(ORG)
        self.play(Write(sub), run_time=0.5)
        sub0 = M(r"\frac{1}{0}", size=74).move_to(sub)
        sub0[0][2].set_color(RED)
        self.go("6:34.90", ReplacementTransform(sub, sub0), run=0.4)
        self.go("6:35.60", FadeOut(x2), FadeOut(sub0), run=0.3)
        nl = number_line((-2, 6, 1), length=10, center=(0, -0.7, 0))
        nl.remove(nl.tip)
        self.play(Create(nl), FadeIn(nl.labels), run_time=0.45)
        rays = VGroup(ray(nl.n2p(2) + LEFT * 0.15, nl.n2p(-2.5)), ray(nl.n2p(2) + RIGHT * 0.15, nl.n2p(6.5)))
        hl = Circle(radius=0.14, stroke_color=RED, stroke_width=5, fill_color=BOARDC, fill_opacity=1).move_to(nl.n2p(2)).set_z_index(3)
        self.go("6:36.90", Create(rays), FadeIn(hl, scale=0.5), run=0.6)
        ans = M(r"x\neq 2", size=70, color=YEL).move_to([0, -2.4, 0])
        self.go("6:38.10", Write(ans), run=0.5)


class K01_Root(Shot):
    def body(self):
        self.title("Square Roots", "6:39.14")
        big = M(r"\sqrt{-4}", size=120).move_to([-1.0, 0.75, 0])
        big[0][2:].set_color(RED)
        self.go("6:40.80", Write(big), run=0.8)
        eq = VGroup(M("=", size=120), H("?", 110, RED)).arrange(RIGHT, buff=0.3).next_to(big, RIGHT, buff=0.4)
        self.play(Write(eq), run_time=0.4)
        sq = VGroup(M(r"2\times 2", "=", "4", size=64), M(r"(-2)\times(-2)", "=", "4", size=64)).arrange(RIGHT, buff=1.4).move_to([0, -1.1, 0])
        for m in sq:
            m[2].set_color(GRN)
        self.go("6:43.28", Write(sq[0]), run=0.6)
        self.go("6:44.00", Write(sq[1]), run=0.6)
        nr = VGroup(cross_mark(s=0.22), H("no real answer", 46, RED)).arrange(RIGHT, buff=0.3).move_to([0, -2.6, 0])
        self.go("6:45.66", Create(nr[0]), Write(nr[1]), run=0.6)
