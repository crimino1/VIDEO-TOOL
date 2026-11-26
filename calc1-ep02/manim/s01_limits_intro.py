"""Builder 01: series opener, limits as the foundation, last episode, episode plan, Part 1 (download bar,
the big question, f(x)=x+3 table and graph, lim notation, why not just plug in)."""
from common import *


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


def pencil():
    """Pencil lying along +x with its tip at the origin."""
    body = poly([(0.45, 0.17), (3.2, 0.17), (3.2, -0.17), (0.45, -0.17)], YEL, 4, True)
    tip = VGroup(poly([(0.45, 0.17), (0, 0), (0.45, -0.17)], CHALK, 4), Dot(ORIGIN, radius=0.05, color=CHALK))
    band = poly([(3.2, 0.17), (3.55, 0.17), (3.55, -0.17), (3.2, -0.17)], PINK, 4, True)
    return VGroup(body, tip, band)


def limit_tex(size=110):
    """lim_{x->2} (x+3) = 5 in pieces: lim YEL, x->2 ORG, the function BLUE, the answer GRN."""
    # MathTex wraps each piece in braces, so a separate _{x->2} would not sit under lim: place it by hand
    m = M(r"\lim", r"\;(x+3)", "=", "5", size=size)
    sub = M(r"x \to 2", size=size * 0.55).next_to(m[0], DOWN, buff=0.1)
    L = VGroup(m[0], sub, m[1], m[2], m[3])
    for i, c in ((0, YEL), (1, ORG), (2, BLUE), (4, GRN)):
        L[i].set_color(c)
    return L


# ================================================================ opener

class K01_Opener(Shot):
    def body(self):
        word = H("Calculus 1", 150).move_to([0, 1.0, 0])
        ul = brush_line(word.width + 0.4, center=word.get_bottom() + DOWN * 0.12)
        self.go("0:00.30", Write(word), run=1.1)
        self.play(Create(ul), run_time=0.5)
        sub = H("the complete course", 42, DIM).move_to([0, -2.55, 0])
        self.go("0:01.94", FadeIn(sub, shift=UP * 0.15), run=0.5)
        ep = pill("Episode 2: Limits", YEL, 56).move_to([0, -1.25, 0])
        self.go("0:04.50", FadeIn(ep, shift=UP * 0.2), run=0.6)
        lim = ep[1][-6:]  # the glyphs of "Limits"
        self.go("0:10.10", lim.animate.set_color(YEL), run=0.4)
        # limits become the foundation slab
        new = head_of("Calculus 1")
        self.at("0:10.56")
        self.play(ReplacementTransform(word, new[0]), ReplacementTransform(ul, new[1]), FadeOut(sub),
                  FadeOut(ep[0]), FadeOut(ep[1][:-6]), run_time=0.6)
        self.head = new
        slab = Rectangle(width=9.6, height=1.0, stroke_color=YEL, stroke_width=5, fill_color=YEL, fill_opacity=0.12).move_to([0, -2.75, 0])
        base = H("Limits", 64, YEL).move_to(slab)
        self.go("0:11.40", Create(slab), ReplacementTransform(lim, base), run=0.8)
        top = -2.25
        cols = []
        for x, name, c, t in ((-2.75, "Derivatives", PINK, "0:14.02"), (2.75, "Integrals", GRN, "0:16.22")):
            col = Rectangle(width=3.3, height=2.8, stroke_color=c, stroke_width=5).move_to([x, top + 1.4, 0])
            lab = H(name, 44, c).move_to(col)
            self.go(t, Create(col), Write(lab), run=0.8)
            cols.append(col)
        y0 = top + 2.8
        roof = VGroup(Rectangle(width=9.6, height=0.4, stroke_color=CHALK, stroke_width=5).move_to([0, y0 + 0.2, 0]),
                      poly([(-4.8, y0 + 0.4), (0, y0 + 1.6), (4.8, y0 + 0.4)], CHALK, 5))
        self.go("0:18.44", Create(roof), run=0.9)
        rl = H("the whole course", 34, DIM).move_to([0, y0 + 0.82, 0])
        self.go("0:19.74", FadeIn(rl, shift=DOWN * 0.1), run=0.5)
        self.go("0:21.10", Circumscribe(slab, color=YEL, fade_out=True, buff=0.12), run=0.8)


class K01_LastEp(Shot):
    def body(self):
        self.title("Last Episode", "0:22.76")
        ep1 = pill("Episode 1: Functions", ORG, 44).move_to([0, 1.55, 0])
        self.go("0:23.16", FadeIn(ep1, shift=DOWN * 0.15), run=0.5)
        fx = M("f(x)", size=110, color=BLUE).move_to([-2.6, -0.4, 0])
        ax = Axes(x_range=[-2, 2, 1], y_range=[-0.5, 4, 1], x_length=3.4, y_length=2.8,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.15, include_ticks=False)).move_to([2.6, -0.4, 0])
        cv = ax.plot(lambda x: x * x, x_range=[-1.9, 1.9], color=BLUE, stroke_width=6)
        self.go("0:24.40", Write(fx), Create(ax), run=0.7)
        self.play(Create(cv), run_time=0.6)
        back = H("watch Episode 1 first", 46, YEL).move_to([0.6, -2.85, 0])
        bend = CurvedArrow(back.get_left() + LEFT * 0.2, ep1.get_left() + LEFT * 0.25 + DOWN * 0.05, angle=-1.6, color=YEL,
                           stroke_width=4, tip_length=0.22)
        self.go("0:27.32", Write(back), run=0.8)
        self.play(Create(bend), run_time=0.6)
        self.go("0:29.98", Circumscribe(fx, color=YEL, fade_out=True), run=0.8)


class K01_Plan(Shot):
    def body(self):
        self.title("In This Episode", "0:32.30")
        items = [("What a limit means", "0:34.26"), ("Tables and graphs", "0:36.66"), ("One-sided limits", "0:38.28"),
                 ("When a limit does not exist", "0:40.16"), ("Algebra tricks", "0:43.48")]
        rows = VGroup()
        for k, (s, _) in enumerate(items):
            y = 1.65 - k * 0.78
            t = H("Hg" + s, 46)  # invisible "Hg" keeps every row's box (and baseline) the same height
            t[:2].set_opacity(0)
            t.shift(np.array([-2.4, y, 0]) - [t[2].get_left()[0], t.get_y(), 0])
            rows.add(VGroup(M(str(k + 1), size=52, color=ORG).move_to([-2.9, y, 0]), t))
        rows.move_to([0, rows.get_y(), 0])
        for (_, t), r in zip(items, rows):
            self.go(t, FadeIn(r[0], scale=0.8), Write(r[1]), run=0.6)
        prac = pill("+ practice questions", GRN, 40).move_to([0, -2.75, 0])
        self.go("0:46.34", FadeIn(prac, shift=UP * 0.15), run=0.5)
        # pen and paper
        self.wipe("0:47.70", run=0.3)
        self.title("Pen and Paper Ready?", "0:48.10")
        paper = VGroup(Rectangle(width=4.4, height=5.0, stroke_color=CHALK, stroke_width=5, fill_color=CHALK, fill_opacity=0.04))
        for k in range(1, 9):
            paper.add(seg([-2.0, 2.5 - k * 0.56, 0], [2.0, 2.5 - k * 0.56, 0], FAINT, 2))
        paper.add(seg([-1.5, 2.5, 0], [-1.5, -2.5, 0], PINK, 2))
        paper.move_to([-1.0, -0.8, 0])
        pen = pencil().rotate(35 * DEGREES, about_point=ORIGIN).move_to([4.2, -0.5, 0])
        self.go("0:48.62", Create(paper), run=0.6)
        self.play(Create(pen), run_time=0.4)
        # "let's begin": the pencil draws a line that heads toward a dot
        P = paper[0].get_center()
        curve = VMobject(stroke_color=BLUE, stroke_width=5).set_points_smoothly([P + [x, 0.55 * x - 0.3, 0] for x in np.linspace(-1.2, 1.4, 12)])
        u = ValueTracker(0.001)
        drawn = always_redraw(lambda: curve.copy().pointwise_become_partial(curve, 0, u.get_value()))
        tip0 = pen[1][1].get_center()
        self.add(drawn)
        self.go("0:49.60", pen.animate.shift(curve.get_start() - tip0), run=0.4)
        pen.add_updater(lambda m: m.shift(curve.point_from_proportion(u.get_value()) - m[1][1].get_center()))
        self.play(u.animate.set_value(1), run_time=0.9)
        pen.clear_updaters()


# ================================================================ Part 1: the download bar

class K01_Download(Shot):
    def body(self):
        self.title("Downloading a Game", "0:53.90")
        pc = np.array([-4.7, -0.5, 0])
        phone = VGroup(RoundedRectangle(width=2.2, height=4.0, corner_radius=0.3, stroke_color=CHALK, stroke_width=5).move_to(pc),
                       Rectangle(width=1.8, height=3.0, stroke_color=DIM, stroke_width=3).move_to(pc + [0, 0.15, 0]),
                       Circle(radius=0.14, color=DIM, stroke_width=3).move_to(pc + [0, -1.66, 0]))
        icon = VGroup(arrow(pc + [0, 0.95, 0], pc + [0, -0.05, 0], BLUE, 6),
                      poly([(-0.5, -0.05), (-0.5, -0.4), (0.5, -0.4), (0.5, -0.05)], BLUE, 5).shift(pc + [0, -0.05, 0]))
        self.go("0:54.48", Create(phone), run=0.8)
        self.go("0:55.30", Create(icon), run=0.5)
        bar = RoundedRectangle(width=7.2, height=0.8, corner_radius=0.15, stroke_color=CHALK, stroke_width=5).move_to([2.0, -0.2, 0])
        p = ValueTracker(0.0)
        fill = always_redraw(lambda: Rectangle(width=max(p.get_value() * (bar.width - 0.16 * bar.width / 7.2), 0.001),
                                               height=bar.height * 0.75, stroke_width=0, fill_color=BLUE, fill_opacity=0.6)
                             .move_to(bar.get_left() + RIGHT * 0.08 * bar.width / 7.2, aligned_edge=LEFT))
        self.add(fill)
        self.go("0:57.00", Create(bar), run=0.6)
        num = H("90%", 84, ORG).move_to([2.0, 1.05, 0])
        self.go("0:57.62", p.animate.set_value(0.9), run=0.5)
        self.play(FadeIn(num, shift=UP * 0.15), run_time=0.4)
        for t, s, v in (("0:59.04", "99%", 0.99), ("1:00.80", "99.9%", 0.999), ("1:04.44", "99.99%", 0.9999)):
            nn = H(s, 84, ORG).move_to(num)
            self.go(t, FadeOut(num, shift=UP * 0.3), FadeIn(nn, shift=UP * 0.3), p.animate.set_value(v), run=0.6)
            num = nn
        end = bar.get_right()
        finish = DashedLine(end + UP * 0.65, end + DOWN * 0.65, color=YEL, stroke_width=4, dash_length=0.1)
        hund = H("100%", 54, YEL).move_to([end[0], -1.35, 0])
        self.go("1:05.64", Create(finish), Write(hund), run=0.6)
        go = arrow([-0.4, -1.35, 0], [hund.get_left()[0] - 0.25, -1.35, 0], YEL, 5)
        self.go("1:10.40", Create(go), run=0.6)
        self.go("1:12.06", Circumscribe(hund, color=YEL, fade_out=True), run=0.7)
        # the idea of a limit
        self.title("The Idea of a Limit", "1:13.46")
        G = VGroup(num, bar, finish, hund)
        self.play(FadeOut(phone), FadeOut(icon), FadeOut(go), G.animate.scale(0.75).move_to([0, 1.05, 0]), run_time=0.7)
        r1 = VGroup(cross_mark(RED, 0.25), H("not where it is", 56)).arrange(RIGHT, buff=0.4)
        r2 = VGroup(tick_mark(GRN, 0.6), H("where it's heading", 56, YEL)).arrange(RIGHT, buff=0.4)
        VGroup(r1, r2).arrange(DOWN, buff=0.6, aligned_edge=LEFT).move_to([0, -1.85, 0])
        self.go("1:16.96", Create(r1[0]), Write(r1[1]), run=0.8)
        self.go("1:19.42", Create(r2[0]), Write(r2[1]), run=0.8)
        self.play(Create(brush_line(r2[1].width + 0.3, center=r2[1].get_bottom() + DOWN * 0.1, seed=4)), run_time=0.5)


class K01_Question(Shot):
    def body(self):
        self.title("The Big Question", "1:21.06")
        L, R = -4.6, 5.2
        top, bot = 0.75, -1.75
        xl = VGroup(Line([L, top, 0], [R, top, 0], color=DIM, stroke_width=3))
        tx = 1.6
        xl.add(Line([tx, top + 0.18, 0], [tx, top - 0.18, 0], color=YEL, stroke_width=5))
        xn = H("a number", 40, YEL).move_to([tx, top - 0.62, 0])
        xlab = M("x", size=72, color=ORG).move_to([L - 0.8, top, 0])
        self.go("1:22.62", Create(xl), run=0.7)
        self.go("1:23.52", Write(xlab), run=0.4)
        xd = Dot([L + 0.4, top, 0], radius=0.13, color=ORG).set_z_index(2)
        self.go("1:24.38", FadeIn(xd, scale=0.5), FadeIn(xn, shift=UP * 0.1), run=0.35)
        self.play(xd.animate.move_to([tx - 0.12, top, 0]), run_time=1.6, rate_func=rush_from)
        fl = VGroup(Line([L, bot, 0], [R, bot, 0], color=DIM, stroke_width=3))
        ty = 0.8
        fl.add(Line([ty, bot + 0.18, 0], [ty, bot - 0.18, 0], color=YEL, stroke_width=5))
        flab = M("f(x)", size=64, color=BLUE).move_to([L - 0.95, bot, 0])
        self.go("1:27.04", Create(fl), run=0.6)
        self.go("1:28.04", Write(flab), run=0.4)
        fd = Dot([L + 0.4, bot, 0], radius=0.13, color=BLUE).set_z_index(2)
        q = H("?", 80, YEL).move_to([ty, bot - 0.75, 0])
        self.go("1:28.62", FadeIn(fd, scale=0.5), run=0.3)
        self.play(fd.animate.move_to([ty - 0.12, bot, 0]), Write(q), run_time=1.0, rate_func=rush_from)


# ================================================================ f(x) = x + 3 as x -> 2

def table_frame(cx=-3.75, top=1.85):
    f = VGroup(Line([cx, top + 0.4, 0], [cx, -2.55, 0], color=CHALK, stroke_width=3),
               Line([cx - 2.15, top - 0.36, 0], [cx + 2.15, top - 0.36, 0], color=CHALK, stroke_width=3))
    head = VGroup(M("x", size=54).move_to([cx - 1.1, top, 0]), M("f(x)", size=54).move_to([cx + 1.1, top, 0]))
    return f, head


class K01_Table(Shot):
    def body(self):
        self.title("A Simple Example", "1:30.60")
        fx = M("f(x)", "=", "x+3", size=64).move_to([2.6, 1.85, 0])
        fx[0].set_color(BLUE)
        self.go("1:32.58", Write(fx), run=1.0)
        ax = Axes(x_range=[0, 4, 1], y_range=[0, 7, 1], x_length=4.4, y_length=3.85,
                  axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.18))
        ax.shift(np.array([1.9, -3.05, 0]) - ax.c2p(0, 0))
        nums = VGroup(*[M(str(k), size=34, color=DIM).next_to(ax.c2p(k, 0), DOWN, buff=0.12) for k in range(1, 4)],
                      *[M(str(k), size=34, color=DIM).next_to(ax.c2p(0, k), LEFT, buff=0.12) for k in range(1, 7)])
        al = VGroup(M("x", size=40, color=DIM).next_to(ax.x_axis.get_end(), RIGHT, buff=0.12),
                    M("y", size=40, color=DIM).next_to(ax.y_axis.get_end(), RIGHT, buff=0.15))
        line = ax.plot(lambda x: x + 3, x_range=[0, 3.8], color=BLUE, stroke_width=6)
        self.go("1:34.10", Create(ax), FadeIn(nums), FadeIn(al), run=0.7)
        self.play(Create(line), run_time=0.7)
        to2 = M(r"x \to 2", size=64, color=ORG).move_to([5.95, 1.85, 0])
        v2 = DashedLine(ax.c2p(2, 0), ax.c2p(2, 6.6), color=ORG, stroke_width=3, dash_length=0.1)
        self.go("1:36.88", Write(to2), Create(v2), run=0.6)
        # the table, row by row on the words
        cx, top = -3.75, 1.85
        frame, head = table_frame(cx, top)
        self.go("1:38.18", Create(frame), FadeIn(head), run=0.5)
        ys = [1.15, 0.5, -0.15, -0.8, -1.45, -2.1]
        cell = lambda s, c, i, k: M(s, size=48, color=c).move_to([cx + (k - 0.5) * 2.2, ys[i], 0])
        rows = [("1.9", "4.9", 0, BLUE, "1:38.94", "1:41.14"), ("1.99", "4.99", 1, BLUE, "1:43.20", "1:45.58"),
                ("1.999", "4.999", 2, BLUE, "1:47.92", "1:50.54"),
                ("2.1", "5.1", 5, ORG, "1:54.82", "1:56.84"), ("2.01", "5.01", 4, ORG, "1:58.60", "2:00.76")]
        cells = VGroup()
        up = arrow([cx - 2.55, ys[5] - 0.2, 0], [cx - 2.55, ys[4] + 0.2, 0], ORG, 5)
        for xs, fs, i, c, tx, tf in rows:
            if i == 5:
                self.go("1:52.90", Create(up), run=0.5)
            a, b = cell(xs, c, i, 0), cell(fs, c, i, 1)
            self.go(tx, Write(a), run=0.5)
            self.go(tf, Write(b), run=0.5)
            cells.add(a, b)
            if i == 1:
                down = arrow([cx - 2.55, ys[0] + 0.2, 0], [cx - 2.55, ys[2] - 0.2, 0], BLUE, 5)
                self.go("1:46.60", Create(down), run=0.5)
        # both sides slide in on the graph
        xl, xr = ValueTracker(0.3), ValueTracker(3.7)
        dl = always_redraw(lambda: Dot(ax.c2p(xl.get_value(), xl.get_value() + 3), radius=0.11, color=BLUE).set_z_index(3))
        dr = always_redraw(lambda: Dot(ax.c2p(xr.get_value(), xr.get_value() + 3), radius=0.11, color=ORG).set_z_index(3))
        self.go("2:02.40", FadeIn(dl, scale=0.5), FadeIn(dr, scale=0.5), run=0.3)
        self.play(xl.animate.set_value(1.93), xr.animate.set_value(2.07), run_time=1.6, rate_func=rush_from)
        mx = M(r"\to 2", size=48, color=YEL).move_to([cx - 1.1, ys[3], 0])
        self.go("2:04.36", Write(mx), run=0.5)
        h5 = DashedLine(ax.c2p(2, 5), ax.c2p(0, 5), color=YEL, stroke_width=3, dash_length=0.1)
        self.go("2:05.30", Create(h5), nums[7].animate.set_color(YEL), run=0.6)
        mf = M(r"\to 5", size=48, color=YEL).move_to([cx + 1.1, ys[3], 0])
        self.go("2:06.60", Write(mf), run=0.5)
        mid = VGroup(mx, mf)
        self.go("2:08.16", Circumscribe(mid, color=YEL, fade_out=True, buff=0.15), run=0.8)
        pt = Dot(ax.c2p(2, 5), radius=0.13, color=YEL).set_z_index(4)
        p5 = M("(2, 5)", size=40, color=YEL).next_to(ax.c2p(2, 5), RIGHT, buff=0.25).shift(DOWN * 0.15)
        self.at("2:11.30")
        dl.clear_updaters()
        dr.clear_updaters()
        self.play(FadeOut(dl), FadeOut(dr), FadeIn(pt, scale=0.5), Write(p5), run_time=0.6)


class K01_Notation(Shot):
    def body(self):
        self.title("How We Write It", "2:12.46")
        L = limit_tex(120).move_to([0, 0.2, 0])
        self.go("2:14.50", Write(L[0]), run=0.6)
        short = H("short for limit", 40, DIM).move_to([-3.7, 1.75, 0])
        sa = arrow(short.get_bottom() + DOWN * 0.08 + RIGHT * 0.6, L[0].get_top() + UP * 0.12 + LEFT * 0.1, DIM, 3)
        self.go("2:15.64", FadeIn(short, shift=DOWN * 0.1), Create(sa), run=0.5)
        self.go("2:18.20", Write(L[1]), run=0.7)
        means = H("x approaches 2", 40, DIM).move_to([-3.4, -2.0, 0])
        ma = arrow(means.get_top() + UP * 0.08 + RIGHT * 0.6, L[1].get_bottom() + DOWN * 0.12 + LEFT * 0.1, DIM, 3)
        self.go("2:19.86", FadeIn(means, shift=UP * 0.1), Create(ma), run=0.5)
        self.go("2:22.56", Write(L[2]), run=0.7)
        self.go("2:23.80", Write(L[3:]), run=0.6)
        # read it out loud: a chalk mark slides under each piece
        self.go("2:25.16", FadeOut(short), FadeOut(sa), FadeOut(means), FadeOut(ma), run=0.4)
        def under(m):
            y = min(m.get_bottom()[1], L[2].get_bottom()[1]) - 0.15
            return Line([m.get_left()[0] - 0.05, y, 0], [m.get_right()[0] + 0.05, y, 0], color=YEL, stroke_width=5)
        u = under(L[:2])
        self.go("2:27.20", Create(u), run=0.4)
        for t, part in (("2:29.45", L[2]), ("2:30.45", L[3:])):
            nu = under(part)
            self.go(t, ReplacementTransform(u, nu), run=0.4)
            u = nu
        self.go("2:31.40", FadeOut(u), run=0.3)


class K01_Plug(Shot):
    def body(self):
        self.title("How We Write It", animate=False)
        L = limit_tex(120).move_to([0, 0.2, 0])
        self.add(L)
        self.go("2:32.22", L.animate.scale(0.75).move_to([0, 1.35, 0]), run=0.6)
        self.title("Why Not Plug In 2?", "2:34.72")
        s = M("2", "+", "3", "=", "5", size=96).move_to([0, -0.55, 0])
        s[0].set_color(ORG)
        self.go("2:36.62", Write(s[:3]), run=0.6)
        self.go("2:37.40", Write(s[3:]), run=0.5)
        same = VGroup(tick_mark(GRN, 0.55), H("same answer", 50, GRN)).arrange(RIGHT, buff=0.3).move_to([0, -2.1, 0])
        self.go("2:38.50", Create(same[0]), Write(same[1]), run=0.6)
        self.go("2:41.07", Circumscribe(L[1], color=YEL, fade_out=True, buff=0.1), run=0.8)
        works = pill("plugging in works here", GRN, 44).move_to([0, -2.1, 0])
        self.go("2:46.12", FadeOut(same), FadeIn(works, shift=UP * 0.15), run=0.6)
        # but the next function ...
        self.wipe("2:48.30", run=0.35)
        self.title("The Next Function", "2:48.70")
        hole = np.array([0.9, -0.05, 0])
        a = Line([-3.6, -2.3, 0], hole + [-0.17, -0.085, 0], color=BLUE, stroke_width=6)
        b = Line(hole + [0.17, 0.085, 0], [4.0, 1.5, 0], color=BLUE, stroke_width=6)
        ring = Circle(radius=0.17, stroke_color=BLUE, stroke_width=5, fill_color="#3b3a3e", fill_opacity=1).move_to(hole)
        q = H("?", 110, YEL).move_to(hole + [-0.6, 1.25, 0])
        self.go("2:49.40", Create(a), Create(b), run=0.7)
        self.play(Create(ring), Write(q), run_time=0.5)
