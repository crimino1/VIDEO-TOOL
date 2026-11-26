"""Builder 04: Chapter 2 "Limits", part 1. Limits as the foundation, the download bar, x+3 from both sides,
lim notation, why not plug in, 0/0 and the hole, limit vs value, practice, one-sided limits, the jump, the big rule."""
from common import *


# ---------- local helpers ----------

def poly(pts, color=CHALK, width=5):
    return VMobject(stroke_color=color, stroke_width=width).set_points_as_corners([np.array([p[0], p[1], 0.0]) for p in pts])


def arrow(a, b, color=CHALK, w=5, tip=0.2):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, color=color, stroke_width=w, tip_length=tip,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


def AX(xr, yr, origin=None, **k):
    """Kit axes plus ax.xn / ax.yn = {value: tick label}. origin moves the data point (0, 0) there."""
    ax = axes(xr, yr, **k)
    ax.xn, ax.yn = {}, {}
    i = 0
    if k.get("nums", True):
        for r, d in ((xr, ax.xn), (yr, ax.yn)):
            for v in np.arange(r[0], r[1] + 1e-9, r[2]):
                if abs(v) > 1e-9 and v < r[1]:
                    d[int(round(v))] = ax.labels[i]
                    i += 1
    if origin is not None:
        VGroup(ax, ax.labels).shift(np.array([origin[0], origin[1], 0.0]) - ax.c2p(0, 0))
    return ax


def ux(ax):
    return ax.c2p(1, 0)[0] - ax.c2p(0, 0)[0]


def gapped(ax, f, x0, x1, a, r=0.09):
    """f on [x0, x1] with a break at x = a just the size of the kit hole."""
    g = r / ux(ax)
    return VGroup(curve(ax, f, [x0, a - g]), curve(ax, f, [a + g, x1]))


def draw2(g, run=1.0):
    """Chalk draw-on of a two-piece curve, left piece then right piece."""
    return Succession(draw(g[0], run / 2), draw(g[1], run / 2))


def dash(a, b, color=DIM, w=3):
    return DashedLine(np.array(a, float), np.array(b, float), color=color, stroke_width=w, dash_length=0.1)


def _dl(a, b, color):
    a, b = np.array(a), np.array(b)
    if np.linalg.norm(b - a) < 0.15:
        return VMobject()
    return DashedLine(a, b, color=color, stroke_width=2.5, dash_length=0.08, stroke_opacity=0.85)


def rider(ax, f, xt, color, lo=-1e9, hi=1e9, proj=True, r=0.11):
    """A dot riding the graph at x = xt (clamped to [lo, hi], so it stops at a hole's rim),
    with dashed drops to both axes and small marks on them: the input on x, the output on y."""
    X = lambda: float(np.clip(xt.get_value(), lo, hi))

    def dot():
        d = Dot(ax.c2p(X(), f(X())), radius=r, color=color).set_z_index(7)
        return d.set_stroke(CHALK, 2)
    parts = []
    if proj:
        parts += [always_redraw(lambda: _dl(ax.c2p(X(), 0), ax.c2p(X(), f(X())), color)),
                  always_redraw(lambda: _dl(ax.c2p(0, f(X())), ax.c2p(X(), f(X())), color)),
                  always_redraw(lambda: Dot(ax.c2p(X(), 0), radius=0.06, color=color).set_z_index(6)),
                  always_redraw(lambda: Dot(ax.c2p(0, f(X())), radius=0.06, color=color).set_z_index(6))]
    parts.append(always_redraw(dot))
    return VGroup(*parts)


def freeze(*ms):
    for m in ms:
        for s in m.get_family():
            s.clear_updaters()


def side_note(text, target, at, angle):
    """A dim chalk note at `at` with a curved arrow to the point `target` (kept inside the frame)."""
    lab = H(text, 40, DIM).move_to(at)
    up = target[1] > lab.get_y()
    start = (lab.get_top() if up else lab.get_bottom()) + (UP if up else DOWN) * 0.08 + RIGHT * 0.6
    return VGroup(lab, CurvedArrow(start, np.array(target, float), angle=angle, color=DIM, stroke_width=3, tip_length=0.16))


def limit_tex(size=110):
    """lim_{x->2} (x+3) = 5: lim YEL, x->2 ORG, function BLUE, answer GRN. L[1][0][-1] is the 2."""
    m = M(r"\lim", r"\;(x+3)", "=", "5", size=size)
    sub = M(r"x \to 2", size=size * 0.55).next_to(m[0], DOWN, buff=0.1)
    L = VGroup(m[0], sub, m[1], m[2], m[3])
    for i, c in ((0, YEL), (1, ORG), (2, BLUE), (4, GRN)):
        L[i].set_color(c)
    return L


# ================================================================ the foundation

class K04_Foundation(Shot):
    def body(self):
        self.title("Built on Limits", "20:21.70")
        slab = Rectangle(width=9.6, height=1.0, stroke_color=YEL, stroke_width=5, fill_color=YEL, fill_opacity=0.12).move_to([0, -2.75, 0])
        base = H("Limits", 64, YEL).move_to(slab)
        self.go("20:23.10", Create(slab), Write(base), run=0.8)
        top, h = -2.25, 2.5
        for x, name, c, t in ((-2.75, "Derivatives", PINK, "20:24.18"), (2.75, "Integrals", GRN, "20:26.02")):
            col = Rectangle(width=3.3, height=h, stroke_color=c, stroke_width=5).move_to([x, top + h / 2, 0])
            self.go(t, Create(col), Write(H(name, 44, c).move_to(col)), run=0.8)
        self.go("20:29.12", Circumscribe(slab, color=YEL, fade_out=True, buff=0.12), run=0.9)
        y0 = top + h
        roof = VGroup(Rectangle(width=9.6, height=0.4, stroke_color=CHALK, stroke_width=5).move_to([0, y0 + 0.2, 0]),
                      poly([(-4.8, y0 + 0.4), (0, y0 + 1.75), (4.8, y0 + 0.4)]))
        self.go("20:30.02", Create(roof), run=0.8)
        self.go("20:30.90", Write(H("Calculus", 46).move_to([0, y0 + 0.9, 0])), run=0.6)
        self.go("20:32.04", base.animate.scale(1.12), run=0.5)
        self.wipe("20:34.50", run=0.4)


# ================================================================ download bar + the big question

class K04_Download(Shot):
    def body(self):
        self.title("Built on Limits", animate=False)
        self.title("Where Is It Heading?", "20:35.40")
        pc = np.array([-4.7, -0.5, 0])
        phone = VGroup(RoundedRectangle(width=2.2, height=4.0, corner_radius=0.3, stroke_color=CHALK, stroke_width=5).move_to(pc),
                       Rectangle(width=1.8, height=3.0, stroke_color=DIM, stroke_width=3).move_to(pc + [0, 0.15, 0]),
                       Circle(radius=0.14, color=DIM, stroke_width=3).move_to(pc + [0, -1.66, 0]))
        icon = VGroup(arrow(pc + [0, 0.95, 0], pc + [0, -0.05, 0], BLUE, 6, 0.22),
                      poly([(-0.5, -0.05), (-0.5, -0.4), (0.5, -0.4), (0.5, -0.05)], BLUE, 5).shift(pc + [0, -0.05, 0]))
        self.go("20:35.90", Create(phone), run=0.6)
        self.go("20:36.54", Create(icon), run=0.5)
        bar = RoundedRectangle(width=7.2, height=0.8, corner_radius=0.15, stroke_color=CHALK, stroke_width=5).move_to([2.0, -0.2, 0])
        p = ValueTracker(0.0)
        fill = always_redraw(lambda: Rectangle(width=max(p.get_value() * bar.width * (1 - 0.16 / 7.2), 0.001),
                                               height=bar.height * 0.75, stroke_width=0, fill_color=BLUE, fill_opacity=0.6)
                             .move_to(bar.get_left() + RIGHT * 0.08 * bar.width / 7.2, aligned_edge=LEFT))
        self.add(fill)
        self.go("20:37.44", Create(bar), run=0.5)
        num = H("90%", 84, ORG).move_to([2.0, 1.05, 0])
        self.go("20:38.02", p.animate.set_value(0.9), run=0.5)
        self.play(FadeIn(num, shift=UP * 0.15), run_time=0.3)
        for t, s, v in (("20:39.32", "99%", 0.99), ("20:40.60", "99.9%", 0.999)):
            nn = H(s, 84, ORG).move_to(num)
            self.go(t, FadeOut(num, shift=UP * 0.3), FadeIn(nn, shift=UP * 0.3), p.animate.set_value(v), run=0.6)
            num = nn
        end = bar.get_right()
        finish = DashedLine(end + UP * 0.65, end + DOWN * 0.65, color=YEL, stroke_width=4, dash_length=0.1)
        hund = H("100%", 54, YEL).move_to([end[0], -1.35, 0])
        self.go("20:42.60", Create(finish), Write(hund), run=0.6)
        go = arrow([-0.4, -1.35, 0], [hund.get_left()[0] - 0.25, -1.35, 0], YEL, 5, 0.22)
        self.go("20:45.60", Create(go), run=0.5)
        self.go("20:46.20", Circumscribe(hund, color=YEL, fade_out=True), run=0.7)
        # the idea of a limit
        self.title("The Idea of a Limit", "20:47.42")
        G = VGroup(num, bar, finish, hund)
        self.play(FadeOut(phone), FadeOut(icon), FadeOut(go), G.animate.scale(0.75).move_to([0, 1.05, 0]), run_time=0.6)
        r1 = VGroup(cross_mark(RED, 0.25), H("not where it is", 56)).arrange(RIGHT, buff=0.4)
        r2 = VGroup(tick_mark(GRN, 0.6), H("where it's heading", 56, YEL)).arrange(RIGHT, buff=0.4)
        VGroup(r1, r2).arrange(DOWN, buff=0.6, aligned_edge=LEFT).move_to([0, -1.85, 0])
        self.go("20:49.06", Create(r1[0]), Write(r1[1]), run=0.7)
        self.go("20:50.50", Create(r2[0]), Write(r2[1]), run=0.7)
        self.play(Create(brush_line(r2[1].width + 0.3, center=r2[1].get_bottom() + DOWN * 0.1, seed=4)), run_time=0.4)
        freeze(fill)
        self.wipe("20:51.70", run=0.35)
        # the big question: x slides toward a number, f(x) slides toward ?
        self.title("The Big Question", "20:52.10")
        L, R = -4.6, 5.2
        top, bot = 0.75, -1.75
        xl = VGroup(Line([L, top, 0], [R, top, 0], color=DIM, stroke_width=3))
        tx = 1.6
        xl.add(Line([tx, top + 0.18, 0], [tx, top - 0.18, 0], color=YEL, stroke_width=5))
        xn = H("some number", 40, YEL).move_to([tx, top - 0.62, 0])
        xlab = M("x", size=72, color=ORG).move_to([L - 0.8, top, 0])
        self.go("20:52.70", Create(xl), run=0.5)
        self.go("20:53.30", Write(xlab), run=0.3)
        xd = Dot([L + 0.4, top, 0], radius=0.13, color=ORG).set_z_index(2)
        self.go("20:54.82", FadeIn(xd, scale=0.5), FadeIn(xn, shift=UP * 0.1), run=0.3)
        self.play(xd.animate.move_to([tx - 0.12, top, 0]), run_time=1.6, rate_func=rush_from)
        fl = VGroup(Line([L, bot, 0], [R, bot, 0], color=DIM, stroke_width=3))
        ty = 0.8
        fl.add(Line([ty, bot + 0.18, 0], [ty, bot - 0.18, 0], color=YEL, stroke_width=5))
        flab = M("f(x)", size=64, color=BLUE).move_to([L - 0.95, bot, 0])
        self.go("20:57.20", Create(fl), run=0.5)
        self.go("20:57.80", Write(flab), run=0.3)
        fd = Dot([L + 0.4, bot, 0], radius=0.13, color=BLUE).set_z_index(2)
        q = H("?", 80, YEL).move_to([ty, bot - 0.75, 0])
        self.go("20:58.24", FadeIn(fd, scale=0.5), run=0.25)
        self.play(fd.animate.move_to([ty - 0.12, bot, 0]), Write(q), run_time=1.2, rate_func=rush_from)
        self.wipe("21:00.12", run=0.35)


# ================================================================ f(x) = x + 3 as x -> 2

def table_frame(cx=-3.75, top=1.85):
    f = VGroup(Line([cx, top + 0.4, 0], [cx, -2.55, 0], color=CHALK, stroke_width=3),
               Line([cx - 2.15, top - 0.36, 0], [cx + 2.15, top - 0.36, 0], color=CHALK, stroke_width=3))
    head = VGroup(M("x", size=54).move_to([cx - 1.1, top, 0]), M("f(x)", size=54).move_to([cx + 1.1, top, 0]))
    return f, head


class K04_Table(Shot):
    def body(self):
        self.title("The Big Question", animate=False)
        self.title("An Easy One", "21:00.82")
        fx = M("f(x)", "=", "x+3", size=64).move_to([2.7, 1.85, 0])
        fx[0].set_color(BLUE)
        self.go("21:03.18", Write(fx), run=1.0)
        ax = AX((0, 4, 1), (0, 7, 1), origin=(1.6, -3.15), x_length=4.6, y_length=4.2)
        f = lambda x: x + 3
        self.go("21:04.30", Create(ax), FadeIn(ax.labels), run=0.6)
        self.play(draw(curve(ax, f, [0, 3.9]), 0.8))
        to2 = M(r"x \to 2", size=60, color=ORG).move_to([5.75, 1.85, 0])
        v2 = dash(ax.c2p(2, 0), ax.c2p(2, 6.8), ORG)
        self.go("21:07.30", Write(to2), Create(v2), ax.xn[2].animate.set_color(ORG), run=0.6)
        cx, top = -3.75, 1.85
        frame, head = table_frame(cx, top)
        self.go("21:08.64", Create(frame), FadeIn(head), run=0.5)
        ys = [1.15, 0.5, -0.15, -0.8, -1.45, -2.1]
        cell = lambda s, c, i, k: M(s, size=48, color=c).move_to([cx + (k - 0.5) * 2.2, ys[i], 0])
        xl, xr = ValueTracker(0.4), ValueTracker(3.7)
        rl, rr = rider(ax, f, xl, BLUE), rider(ax, f, xr, ORG)
        self.go("21:10.40", FadeIn(rl), run=0.3)
        rows = [("1.9", "4.9", 0, BLUE, "21:11.28", "21:13.52"), ("1.99", "4.99", 1, BLUE, "21:15.56", "21:18.00"),
                ("1.999", "4.999", 2, BLUE, "21:19.76", "21:21.62"),
                ("2.1", "5.1", 5, ORG, "21:27.26", "21:28.38"), ("2.01", "5.01", 4, ORG, "21:29.76", "21:31.46")]
        for xs, fs, i, c, tx, tf in rows:
            tr = xl if c == BLUE else xr
            if i == 5:
                up = arrow([cx - 2.55, ys[5] - 0.2, 0], [cx - 2.55, ys[4] + 0.2, 0], ORG)
                self.go("21:25.54", Create(up), FadeIn(rr), run=0.5)
            a, b = cell(xs, c, i, 0), cell(fs, c, i, 1)
            self.go(tx, Write(a), tr.animate.set_value(float(xs)), run=0.8)
            self.go(tf, Write(b), run=0.5)
            if i == 2:
                down = arrow([cx - 2.55, ys[0] + 0.2, 0], [cx - 2.55, ys[2] - 0.2, 0], BLUE)
                self.go("21:23.64", Create(down), run=0.5)
        self.go("21:32.20", xr.animate.set_value(2.001), run=1.0)
        mx = M(r"\to 2", size=48, color=YEL).move_to([cx - 1.1, ys[3], 0])
        self.go("21:33.74", Write(mx), run=0.5)
        mf = M(r"\to 5", size=48, color=YEL).move_to([cx + 1.1, ys[3], 0])
        self.go("21:37.02", Write(mf), ax.yn[5].animate.set_color(YEL), run=0.5)
        self.go("21:39.12", Circumscribe(VGroup(mx, mf), color=YEL, fade_out=True, buff=0.15), run=0.8)
        P = Dot(ax.c2p(2, 5), radius=0.13, color=YEL).set_z_index(8)
        p5 = M("(2, 5)", size=40, color=YEL).next_to(ax.c2p(2, 5), RIGHT, buff=0.3).shift(DOWN * 0.2)
        self.at("21:41.54")
        freeze(rl, rr)
        self.play(FadeOut(rl), FadeOut(rr), FadeIn(P, scale=0.5), Write(p5), run_time=0.5)
        self.wipe("21:43.15", run=0.4)


# ================================================================ notation

class K04_Notation(Shot):
    def body(self):
        self.title("An Easy One", animate=False)
        self.title("How We Write It", "21:43.94")
        L = limit_tex(120).move_to([0, 0.2, 0])
        self.go("21:45.54", Write(L[0]), run=0.5)
        n1 = side_note("short for limit", L[0].get_top() + UP * 0.12, [-4.3, 1.95, 0], 0.7)
        self.go("21:46.58", FadeIn(n1[0], shift=DOWN * 0.1), Create(n1[1]), run=0.5)
        self.go("21:48.30", Write(L[1]), run=0.7)
        n2 = side_note("x approaches 2", L[1].get_bottom() + DOWN * 0.12, [-4.3, -1.95, 0], -0.7)
        self.go("21:50.94", FadeIn(n2[0], shift=UP * 0.1), Create(n2[1]), run=0.5)
        self.go("21:52.94", Write(L[2]), run=0.6)
        self.go("21:54.08", Write(L[3:]), run=0.6)
        self.go("21:55.68", FadeOut(n1), FadeOut(n2), run=0.4)

        def under(m):
            y = min(m.get_bottom()[1], L[2].get_bottom()[1]) - 0.15
            return Line([m.get_left()[0] - 0.05, y, 0], [m.get_right()[0] + 0.05, y, 0], color=YEL, stroke_width=5)
        u = under(L[:2])
        self.go("21:57.64", Create(u), run=0.4)
        for t, part in (("21:59.84", L[2]), ("22:00.74", L[3:])):
            nu = under(part)
            self.go(t, ReplacementTransform(u, nu), run=0.35)
            u = nu
        self.go("22:01.60", FadeOut(u), run=0.3)


class K04_Plug(Shot):
    def body(self):
        self.title("How We Write It", animate=False)
        L = limit_tex(120).move_to([0, 0.2, 0])
        self.add(L)
        self.go("22:02.38", L.animate.scale(0.7).move_to([0, 1.4, 0]), run=0.6)
        self.title("Why Not Plug In 2?", "22:04.10")
        s = M("2", "+", "3", "=", "5", size=96).move_to([0, -0.4, 0])
        s[0].set_color(ORG)
        s[4].set_color(GRN)
        two = L[1][0][-1].copy()
        self.go("22:05.80", ReplacementTransform(two, s[0]), run=0.7)
        self.go("22:06.95", Write(s[1:3]), run=0.5)
        self.go("22:07.56", Write(s[3:]), run=0.4)
        same = VGroup(tick_mark(GRN, 0.55), H("same answer", 50, GRN)).arrange(RIGHT, buff=0.3).move_to([0, -1.9, 0])
        self.go("22:08.46", Create(same[0]), Write(same[1]), run=0.6)
        self.go("22:10.34", Circumscribe(L[4], color=GRN, fade_out=True, buff=0.1), Circumscribe(s[4], color=GRN, fade_out=True, buff=0.1), run=0.8)
        works = pill("plugging in works here", GRN, 44).move_to([0, -1.9, 0])
        self.go("22:13.04", FadeOut(same), FadeIn(works, shift=UP * 0.15), run=0.5)
        fails = VGroup(cross_mark(RED, 0.22), H("some functions: it fails", 46, RED)).arrange(RIGHT, buff=0.35).move_to([0, -3.05, 0])
        self.go("22:16.40", Create(fails[0]), Write(fails[1]), run=0.7)
        self.go("22:18.60", Circumscribe(L[0], color=YEL, fade_out=True, buff=0.12), run=0.8)
        self.wipe("22:20.30", run=0.4)


# ================================================================ 0/0: the function with a hole

def zz_fx():
    return M("f(x)=", r"\frac{x^2-1}{x-1}", size=72).move_to([0, 1.3, 0])


def dne_group():
    return VGroup(M("f(1)", size=72), H("doesn't exist", 48, RED)).arrange(DOWN, buff=0.3).move_to([-3.4, -1.2, 0])


def mini():
    ax = AX((-1, 3, 1), (-1, 4, 1), origin=(2.9, -2.6), x_length=4.2, y_length=3.6, nums=False)
    f = lambda x: x + 1
    return dict(ax=ax, f=f, line=gapped(ax, f, -0.9, 2.7, 1), h=hole(ax, 1, 2),
                dash=dash(ax.c2p(1, 0), ax.c2p(1, 2) + DOWN * 0.1), one=M("1", size=36, color=ORG).next_to(ax.c2p(1, 0), DOWN, buff=0.12))


MINI_STOP = 0.32  # how far (in x) the mini-graph dots stop short of the hole


class K04_ZeroZero(Shot):
    def body(self):
        self.title("Why Not Plug In 2?", animate=False)
        self.title("When Plugging In Fails", "22:21.40")
        fx = zz_fx()
        self.go("22:22.00", Write(fx[0]), run=0.4)
        self.go("22:23.12", Write(fx[1][0:4]), run=0.8)
        self.go("22:24.40", Create(fx[1][4]), run=0.3)
        self.go("22:25.12", Write(fx[1][5:]), run=0.5)
        self.remove(*self.board())   # pieces were added one by one: keep fx as one object for wipe(keep=[fx])
        self.add(fx)
        x1 = M("x=1", size=64, color=ORG).move_to([-4.6, -1.2, 0])
        self.go("22:27.72", Write(x1), run=0.5)
        p0 = M("f(1)=", r"\frac{1^2-1}{1-1}", size=72).move_to([0.4, -1.2, 0])
        for m in (p0[0][2], p0[1][0], p0[1][5]):
            m.set_color(ORG)
        self.go("22:28.40", Write(p0), run=0.9)
        tl = H("top", 38, DIM).move_to([p0.get_right()[0] + 0.8, p0[1][0:4].get_center()[1], 0])
        bl = H("bottom", 38, DIM).move_to([p0.get_right()[0] + 1.0, p0[1][5:].get_center()[1], 0])
        self.go("22:29.60", FadeIn(tl, shift=LEFT * 0.1), run=0.4)
        p1 = M("f(1)=", r"\frac{0}{1-1}", size=72)
        p1.shift(p0[0].get_center() - p1[0].get_center())
        p1[0][2].set_color(ORG)
        p1[1][2].set_color(ORG)
        self.go("22:31.14", ReplacementTransform(p0, p1), run=0.5)
        self.go("22:32.36", FadeIn(bl, shift=LEFT * 0.1), run=0.4)
        p2 = M("f(1)=", r"\frac{0}{0}", size=72)
        p2.shift(p1[0].get_center() - p2[0].get_center())
        p2[0][2].set_color(ORG)
        self.go("22:34.30", ReplacementTransform(p1, p2), run=0.5)
        self.go("22:35.36", FadeOut(tl), FadeOut(bl), p2[1][0].animate.set_color(RED), p2[1][2].animate.set_color(RED), run=0.4)
        self.play(Circumscribe(p2[1], color=RED, buff=0.15), run_time=0.8)
        dz = VGroup(cross_mark(RED, 0.2), M(r"\div\, 0", size=64, color=RED)).arrange(RIGHT, buff=0.3).move_to([4.3, -1.2, 0])
        self.go("22:37.18", Create(dz[0]), Write(dz[1]), run=0.6)
        self.wipe("22:38.20", keep=[fx], run=0.3)
        dne = dne_group()
        self.go("22:38.60", Write(dne[0]), run=0.5)
        self.go("22:39.24", Write(dne[1]), run=0.6)
        G = mini()
        self.go("22:41.10", Create(G["ax"]), FadeIn(G["ax"].labels), draw2(G["line"], 0.9), run=0.9)
        self.go("22:42.36", FadeIn(G["h"], scale=0.5), Create(G["dash"]), FadeIn(G["one"]), run=0.4)
        self.go("22:42.90", Circumscribe(G["h"], shape=Circle, color=YEL, buff=0.08), run=0.7)
        # but where is it heading? two dots creep up on the hole
        t1, t2 = ValueTracker(-0.6), ValueTracker(2.5)
        d1 = rider(G["ax"], G["f"], t1, BLUE, hi=1 - MINI_STOP, proj=False, r=0.1)
        d2 = rider(G["ax"], G["f"], t2, ORG, lo=1 + MINI_STOP, proj=False, r=0.1)
        self.go("22:43.90", FadeIn(d1), FadeIn(d2), run=0.3)
        self.play(t1.animate.set_value(1), t2.animate.set_value(1), run_time=1.6)


def sneak_tables():
    """f(x) on top and the two tables (left BLUE, right ORG)."""
    d = dict(fx=M("f(x)=", r"\frac{x^2-1}{x-1}", size=52).move_to([0, 1.75, 0]))
    vals = dict(L=[("0.9", "1.9"), ("0.99", "1.99"), ("0.999", "1.999")],
                R=[("1.1", "2.1"), ("1.01", "2.01"), ("1.001", "2.001")])
    top, step = 0.85, 0.72
    for side, cx, col in (("L", -3.4, BLUE), ("R", 3.4, ORG)):
        c0, c1 = cx - 0.95, cx + 0.95
        frame = VGroup(Line([cx, top + 0.35, 0], [cx, top - 0.4 - 3 * step, 0], color=CHALK, stroke_width=3),
                       Line([cx - 1.9, top - 0.38, 0], [cx + 1.9, top - 0.38, 0], color=CHALK, stroke_width=3))
        head = VGroup(M("x", size=50).move_to([c0, top, 0]), M("f(x)", size=50).move_to([c1, top, 0]))
        if side == "L":
            lab = VGroup(H("from the left", 38, col), arrow(ORIGIN, RIGHT * 0.8, col, 5, 0.18)).arrange(RIGHT, buff=0.2)
        else:
            lab = VGroup(arrow(ORIGIN, LEFT * 0.8, col, 5, 0.18), H("from the right", 38, col)).arrange(RIGHT, buff=0.2)
        lab.move_to([cx + (-0.9 if side == "L" else 0.9), 1.75, 0])
        cells = [(M(a, size=48, color=col).move_to([c0, top - (i + 1) * step - 0.05, 0]),
                  M(b, size=48, color=col).move_to([c1, top - (i + 1) * step - 0.05, 0])) for i, (a, b) in enumerate(vals[side])]
        side_arrow = arrow([c0 - 1.25, top - step + 0.25, 0], [c0 - 1.25, top - 3 * step - 0.3, 0], col, 5, 0.2)
        d[side] = dict(frame=frame, head=head, lab=lab, cells=cells, c1=c1, arrow=side_arrow)
    return d


def sneak_end():
    """The finished Sneak board, so the next shot can wipe it."""
    D = sneak_tables()
    ms = [D["fx"]]
    for s in "LR":
        ms += [D[s]["frame"], D[s]["head"], D[s]["lab"], D[s]["arrow"], *[c for row in D[s]["cells"] for c in row]]
    cols = [VGroup(*[row[1] for row in D[s]["cells"]]) for s in "LR"]
    bxs = [SurroundingRectangle(c, color=YEL, buff=0.12, stroke_width=3, corner_radius=0.08) for c in cols]
    to2 = [M(r"\to 2", size=56, color=YEL).move_to([D[s]["c1"], -1.95, 0]) for s in "LR"]
    lim = M(r"\lim_{x\to 1} f(x)", "=", "2", size=56).move_to([-1.6, -3.1, 0])
    lim[2].set_color(GRN)
    lb = box(lim, GRN, buff=0.18)
    dne = VGroup(M("f(1)", size=56), H("doesn't exist", 42, RED)).arrange(RIGHT, buff=0.3).move_to([3.7, -3.1, 0])
    return D, ms, bxs, to2, lim, lb, dne


class K04_Sneak(Shot):
    def body(self):
        self.title("When Plugging In Fails", animate=False)
        fx = zz_fx()
        G = mini()
        stops = [Dot(G["ax"].c2p(x, x + 1), radius=0.1, color=c).set_stroke(CHALK, 2).set_z_index(7)
                 for x, c in ((1 - MINI_STOP, BLUE), (1 + MINI_STOP, ORG))]
        self.add(fx, dne_group(), G["ax"], G["ax"].labels, G["line"], G["h"], G["dash"], G["one"], *stops)
        self.wipe("22:46.25", keep=[fx], run=0.35)
        D, _, bxs, to2, lim, lb, dne = sneak_end()
        self.play(ReplacementTransform(fx, D["fx"]), run_time=0.5)
        self.title("Sneak Up on 1", "22:47.10")
        self.play(*[Create(D[s]["frame"]) for s in "LR"], *[FadeIn(D[s]["head"]) for s in "LR"], run_time=0.6)
        self.go("22:49.34", FadeIn(D["L"]["lab"], shift=RIGHT * 0.15), run=0.5)
        times = dict(L=[("22:51.28", "22:52.62"), ("22:53.56", "22:55.72"), ("22:56.74", "22:59.20")],
                     R=[("23:02.34", "23:03.56"), ("23:04.48", "23:06.54"), ("23:07.50", "23:09.86")])
        for s in "LR":
            if s == "R":
                self.go("23:00.86", FadeIn(D["R"]["lab"], shift=LEFT * 0.15), run=0.5)
            for k, ((tx, tf), (cx_, cf)) in enumerate(zip(times[s], D[s]["cells"])):
                self.go(tx, Write(cx_), run=0.5)
                self.go(tf, Write(cf), run=0.5)
                if k == 1:
                    self.play(GrowArrow(D[s]["arrow"]), run_time=0.4)
        self.go("23:12.30", *[Create(b) for b in bxs], run=0.6)
        self.go("23:15.02", *[Write(t) for t in to2], run=0.5)
        self.go("23:16.00", Write(lim[0]), run=0.8)
        self.go("23:17.82", Write(lim[1:]), run=0.4)
        self.play(Create(lb), run_time=0.4)
        self.go("23:19.50", Write(dne), run=0.8)


# ================================================================ the graph with a hole

class K04_HoleGraph(Shot):
    def body(self):
        self.title("Sneak Up on 1", animate=False)
        _, ms, bxs, to2, lim0, lb0, dne0 = sneak_end()
        self.add(*ms, *bxs, *to2, lim0, lb0, dne0)
        self.wipe("23:21.20", run=0.35)
        self.title("The Key Idea", "23:21.90")
        r1 = VGroup(tick_mark(GRN, 0.6), H("what f does near the point", 54, GRN)).arrange(RIGHT, buff=0.4)
        r2 = VGroup(cross_mark(RED, 0.25), H("what f does at the point", 54, DIM)).arrange(RIGHT, buff=0.4)
        VGroup(r1, r2).arrange(DOWN, buff=0.7, aligned_edge=LEFT).move_to([0, 0.0, 0])
        self.go("23:25.76", Create(r1[0]), Write(r1[1]), run=0.8)
        self.go("23:27.94", Create(r2[0]), Write(r2[1]), run=0.8)
        self.wipe("23:29.40", run=0.3)
        self.title("Picture the Graph", "23:29.80")
        ax = AX((-1, 4, 1), (-1, 5, 1), origin=(-4.2, -2.7), x_length=6.4, y_length=5.0)
        f = lambda x: x + 1
        self.go("23:30.30", Create(ax), FadeIn(ax.labels), run=0.6)
        line = gapped(ax, f, -0.9, 3.6, 1)
        self.go("23:31.72", draw2(line, 1.0), run=1.0)
        yl = M("y=x+1", size=48, color=BLUE).move_to(ax.c2p(2.0, 4.3))
        self.go("23:33.38", Write(yl), run=0.6)
        h = hole(ax, 1, 2)
        self.go("23:36.60", FadeIn(h, scale=0.5), run=0.4)
        self.go("23:37.94", Circumscribe(h, shape=Circle, color=YEL, buff=0.08), run=0.7)
        gx = dash(ax.c2p(1, 0), ax.c2p(1, 2) + DOWN * 0.1)
        self.go("23:38.70", Create(gx), ax.xn[1].animate.set_color(ORG), run=0.4)
        p12 = M("(1,2)", size=40, color=ORG).next_to(ax.c2p(1, 2), RIGHT, buff=0.3).shift(DOWN * 0.3)
        self.go("23:39.30", Write(p12), run=0.4)
        # the line comes right up to the hole from both sides
        stop = 0.2 / ux(ax) + 0.02
        t1, t2 = ValueTracker(-0.6), ValueTracker(3.3)
        d1, d2 = rider(ax, f, t1, BLUE, hi=1 - stop), rider(ax, f, t2, ORG, lo=1 + stop)
        self.go("23:40.00", FadeIn(d1), FadeIn(d2), run=0.3)
        self.go("23:40.54", t1.animate.set_value(1), t2.animate.set_value(1), run=2.4)
        # the limit is the height of the hole
        lim = M(r"\lim_{x\to 1} f(x)", "=", "2", size=56).move_to([3.95, 0.7, 0])
        lim[2].set_color(GRN)
        self.go("23:43.92", Write(lim[0:2]), run=0.7)
        gy = DashedLine(ax.c2p(0, 2), ax.c2p(1, 2) + LEFT * 0.1, color=YEL, stroke_width=4, dash_length=0.1).set_z_index(8)
        freeze(d1, d2)
        self.go("23:44.90", FadeOut(d1), FadeOut(d2), Create(gy), ax.yn[2].animate.set_color(YEL), run=0.5)
        hh = H("the height of the hole", 38, YEL).move_to([3.95, -0.5, 0])
        self.play(FadeIn(hh, shift=UP * 0.1), run_time=0.4)
        self.go("23:45.90", Write(lim[2]), run=0.3)
        self.play(Create(box(lim, GRN, buff=0.18)), run_time=0.4)
        # 0/0 comes back in every derivative
        zz = M(r"\frac{0}{0}", size=80, color=RED)
        ar = arrow(ORIGIN, RIGHT * 1.0, DIM, 4, 0.2)
        der = H("derivatives", 50, PINK)
        VGroup(zz, ar, der).arrange(RIGHT, buff=0.3).move_to([3.95, -1.95, 0])
        self.go("23:49.16", Write(zz), run=0.6)
        self.go("23:54.20", GrowArrow(ar), Write(der), run=0.6)
        self.go("23:56.50", Circumscribe(zz, color=YEL, fade_out=True, buff=0.12), run=0.8)
        self.wipe("23:58.05", run=0.4)


# ================================================================ the limit ignores the value

def ig_curve(x):
    return 4 + 0.9 * np.sin(1.1 * (x - 2)) - 0.15 * (x - 2) ** 2


class K04_Ignore(Shot):
    def body(self):
        self.title("Picture the Graph", animate=False)
        self.title("Limit vs Value", "23:59.00")
        ax = AX((0, 4.5, 1), (0, 8, 1), origin=(-5.0, -3.2), x_length=5.6, y_length=5.2)
        self.go("24:02.40", Create(ax), FadeIn(ax.labels), run=0.6)
        vx = DashedLine(ax.c2p(2, 0), ax.c2p(2, 7.6), color=FAINT, stroke_width=3, dash_length=0.1)
        self.go("24:03.84", Create(vx), ax.xn[2].animate.set_color(ORG), run=0.5)
        near = VGroup(arrow(ax.c2p(0.7, 0.45), ax.c2p(1.75, 0.45), BLUE, 5, 0.18), arrow(ax.c2p(3.3, 0.45), ax.c2p(2.25, 0.45), ORG, 5, 0.18))
        self.go("24:06.30", Create(near), run=0.6)
        cv = gapped(ax, ig_curve, 0.25, 4.2, 2)
        self.go("24:08.30", FadeOut(near), draw2(cv, 1.1), run=1.1)
        gy = DashedLine(ax.c2p(0, 4), ax.c2p(2, 4) + LEFT * 0.1, color=YEL, stroke_width=4, dash_length=0.1)
        self.go("24:09.66", Create(gy), ax.yn[4].animate.set_color(YEL), run=0.6)
        h = hole(ax, 2, 4)
        self.go("24:12.60", FadeIn(h, scale=0.5), run=0.4)
        d7 = Dot(ax.c2p(2, 7), radius=0.13, color=ORG).set_z_index(6)
        self.go("24:14.84", FadeIn(d7, scale=0.5), run=0.4)
        self.go("24:15.70", ax.yn[7].animate.set_color(ORG), run=0.3)
        f27 = M("f(2)=7", size=64, color=ORG).move_to([3.9, 1.0, 0])
        self.go("24:16.84", Write(f27), run=0.7)
        lim = M(r"\lim_{x\to 2} f(x)", "=", "4", size=60).move_to([3.9, -0.7, 0])
        lim[2].set_color(GRN)
        self.go("24:19.38", Write(lim[0:2]), run=0.9)
        self.go("24:22.06", Write(lim[2]), run=0.3)
        self.play(Create(box(lim, GRN, buff=0.18)), run_time=0.4)
        # the limit only watches the approach
        stop = 0.2 / ux(ax) + 0.03
        t1, t2 = ValueTracker(0.4), ValueTracker(4.0)
        d1 = rider(ax, ig_curve, t1, BLUE, hi=2 - stop)
        d2 = rider(ax, ig_curve, t2, ORG, lo=2 + stop)
        self.go("24:23.10", FadeIn(d1), FadeIn(d2), run=0.3)
        self.play(t1.animate.set_value(2), t2.animate.set_value(2), run_time=2.2)
        self.go("24:25.80", Circumscribe(d7, shape=Circle, color=ORG, buff=0.1), run=0.8)
        freeze(d1, d2)
        self.wipe("24:27.85", run=0.35)


def case_curve(x):
    return 0.3 + 1.1 * np.sin(0.75 * x)


class K04_Cases(Shot):
    def body(self):
        self.title("Limit vs Value", animate=False)
        a = 0.6
        axs = [axes((-2, 2, 1), (-2, 2.4, 1), x_length=3.8, y_length=4.2, center=(cx, -0.6, 0), nums=False,
                    x_label=None, y_label=None) for cx in (-4.55, 0, 4.55)]
        self.go("24:28.45", *[Create(x) for x in axs], run=0.5)
        ya = case_curve(a)
        labs = [H(s, 44, c) for s, c in (("the same", GRN), ("different", ORG), ("no value", RED))]
        for l, x in zip(labs, axs):
            l.move_to([x.get_center()[0], -3.15, 0])
        # 1. the same
        self.go("24:29.20", draw(curve(axs[0], case_curve, [-1.8, 1.8]), 0.7))
        self.go("24:30.40", FadeIn(pt(axs[0], a, ya, r=0.12), scale=0.5), run=0.4)
        self.go("24:31.10", Write(labs[0]), run=0.5)
        # 2. different
        c2 = gapped(axs[1], case_curve, -1.8, 1.8, a)
        self.go("24:31.74", draw2(c2, 0.6))
        self.go("24:32.40", FadeIn(hole(axs[1], a, ya), scale=0.5), FadeIn(pt(axs[1], a, 2.0, r=0.12), scale=0.5), run=0.4)
        self.go("24:32.84", Write(labs[1]), run=0.5)
        # 3. no value at all
        c3 = gapped(axs[2], case_curve, -1.8, 1.8, a)
        self.go("24:33.46", draw2(c3, 0.6))
        self.go("24:34.20", FadeIn(hole(axs[2], a, ya), scale=0.5), run=0.4)
        self.go("24:34.82", Write(labs[2]), run=0.5)
        # the limit is the same height every time
        gys = [DashedLine(x.c2p(-2, ya), x.c2p(a, ya) + LEFT * 0.1, color=YEL, stroke_width=4, dash_length=0.08) for x in axs]
        self.go("24:36.68", *[Create(g) for g in gys], run=0.6)
        rs = []
        for i, x in enumerate(axs):
            stop = 0.21 / ux(x) + (0 if i == 0 else 0.03)
            t1, t2 = ValueTracker(-1.6), ValueTracker(1.7)
            rs.append((t1, t2, rider(x, case_curve, t1, BLUE, hi=a - stop, proj=False, r=0.1),
                       rider(x, case_curve, t2, ORG, lo=a + stop, proj=False, r=0.1)))
        self.go("24:38.40", *[FadeIn(r[2]) for r in rs], *[FadeIn(r[3]) for r in rs], run=0.3)
        self.play(*[r[0].animate.set_value(a) for r in rs], *[r[1].animate.set_value(a) for r in rs], run_time=1.5)


# ================================================================ quick check

def q_curve(x):
    return 3 + 0.9 * np.sin(0.8 * (x - 5))


class K04_Q1(Shot):
    def body(self):
        self.title("Your Turn", "24:42.60")
        ax = AX((0, 7, 1), (0, 9, 1), origin=(-5.3, -3.2), x_length=6.0, y_length=5.2)
        self.go("24:43.10", Create(ax), FadeIn(ax.labels), run=0.5)
        cv = gapped(ax, q_curve, 0.4, 6.6, 5)
        self.play(draw2(cv, 1.0))
        gy = DashedLine(ax.c2p(0, 3), ax.c2p(5, 3) + LEFT * 0.1, color=YEL, stroke_width=4, dash_length=0.1)
        self.go("24:44.60", Create(gy), ax.yn[3].animate.set_color(YEL), run=0.5)
        self.go("24:45.74", ax.xn[5].animate.set_color(ORG), run=0.4)
        both = VGroup(arrow(ax.c2p(3.7, q_curve(3.7) + 0.9), ax.c2p(4.6, q_curve(4.6) + 0.9), BLUE, 5, 0.18),
                      arrow(ax.c2p(6.3, q_curve(6.3) + 0.9), ax.c2p(5.4, q_curve(5.4) + 0.9), ORG, 5, 0.18))
        self.go("24:46.58", Create(both), run=0.5)
        self.go("24:48.58", FadeIn(hole(ax, 5, 3), scale=0.5), run=0.4)
        d8 = Dot(ax.c2p(5, 8), radius=0.13, color=ORG).set_z_index(6)
        self.go("24:50.74", FadeIn(d8, scale=0.5), run=0.4)
        self.go("24:51.98", ax.yn[8].animate.set_color(ORG), run=0.4)
        q1 = M(r"\lim_{x\to 5} f(x)", "=", size=60)
        q1 = VGroup(q1[0], q1[1], H("?", 64).next_to(q1[1], RIGHT, buff=0.25)).move_to([3.6, 1.0, 0])
        q2 = M("f(5)", "=", size=60)
        q2 = VGroup(q2[0], q2[1], H("?", 64).next_to(q2[1], RIGHT, buff=0.25))
        q2.shift(q1[1].get_center() - q2[1].get_center() + DOWN * 1.6)
        self.go("24:53.40", Write(q1), run=0.9)
        self.go("24:55.90", Write(q2), run=0.7)
        # answers
        a1 = M("3", size=60, color=GRN).move_to(q1[2])
        self.go("24:57.60", FadeOut(both), run=0.3)
        self.go("24:58.18", ReplacementTransform(q1[2], a1), run=0.5)
        self.play(Create(box(VGroup(q1[0:2], a1), GRN, buff=0.18)), run_time=0.4)
        stop = 0.2 / ux(ax) + 0.03
        t1, t2 = ValueTracker(1.2), ValueTracker(6.8)
        d1, d2 = rider(ax, q_curve, t1, BLUE, hi=5 - stop), rider(ax, q_curve, t2, ORG, lo=5 + stop)
        self.go("24:59.10", FadeIn(d1), FadeIn(d2), run=0.25)
        self.play(t1.animate.set_value(5), t2.animate.set_value(5), run_time=1.5)
        a2 = M("8", size=60, color=GRN).move_to(q2[2])
        self.go("25:01.68", ReplacementTransform(q2[2], a2), run=0.5)
        self.play(Create(box(VGroup(q2[0:2], a2), GRN, buff=0.18)), run_time=0.4)
        self.go("25:03.00", Circumscribe(d8, shape=Circle, color=ORG, buff=0.1), run=0.8)
        tk = VGroup(tick_mark(GRN, 0.5).next_to(q1, RIGHT, buff=0.45), tick_mark(GRN, 0.5).next_to(q2, RIGHT, buff=0.45))
        self.go("25:04.84", Create(tk[0]), run=0.4)
        self.go("25:06.08", Create(tk[1]), run=0.3)
        freeze(d1, d2)
        self.wipe("25:06.75", run=0.35)


# ================================================================ one-sided limits

def nline(lo, hi, y, width=11.0):
    """Number line with integer ticks lo..hi. Returns (group, p(v) -> screen point, {k: label})."""
    u = width / (hi - lo + 1.2)
    x0 = -width / 2 + 0.6 * u
    p = lambda v: np.array([x0 + (v - lo) * u, y, 0])
    base = DoubleArrow(p(lo - 0.6), p(hi + 0.6), buff=0, color=DIM, stroke_width=3, tip_length=0.2)
    ticks = [Line(p(k) + UP * 0.12, p(k) + DOWN * 0.12, color=DIM, stroke_width=3) for k in range(lo, hi + 1)]
    labs = {k: M(str(k), size=40, color=DIM).next_to(p(k) + DOWN * 0.12, DOWN, buff=0.12) for k in range(lo, hi + 1)}
    return VGroup(base, *ticks, *labs.values()), p, labs


def side_lim(sign, color, x, y=-2.25):
    """x -> 2 with a big coloured -/+ up on the 2."""
    base = M(r"x\to 2", size=110).move_to([x - 0.2, y, 0])
    sg = M(sign, size=96, color=color)
    sg.move_to([base.get_right()[0] + 0.1 + sg.width / 2, base.get_top()[1] + 0.02, 0])
    return VGroup(base, sg)


class K04_OneSided(Shot):
    def body(self):
        self.title("Your Turn", animate=False)
        self.title("One-Sided Limits", "25:07.45")
        nl, p, labs = nline(0, 4, y=0.6)
        self.go("25:08.20", Create(nl), run=0.6)
        la = arrow(p(0.2) + UP * 0.45, p(1.85) + UP * 0.45, BLUE, 6, 0.24)
        ra = arrow(p(3.8) + UP * 0.45, p(2.15) + UP * 0.45, ORG, 6, 0.24)
        self.go("25:11.86", labs[2].animate.set_color(YEL), Create(la), Create(ra), run=0.9)
        ls = H("left side", 40, BLUE).next_to(la, UP, buff=0.25)
        rs = H("right side", 40, ORG).next_to(ra, UP, buff=0.25).match_y(ls)
        self.go("25:14.26", FadeIn(ls, shift=DOWN * 0.1), run=0.4)
        self.go("25:15.20", FadeIn(rs, shift=DOWN * 0.1), run=0.4)
        self.go("25:16.20", FadeOut(la), FadeOut(ra), FadeOut(ls), FadeOut(rs), run=0.4)
        # left-hand limit: a dot creeps in from the left
        lh = H("left-hand limit", 48, BLUE).move_to([-3.4, -0.75, 0])
        self.go("25:16.98", Write(lh), run=0.6)
        ld = Dot(p(0.2), radius=0.13, color=BLUE).set_z_index(3)
        self.go("25:18.40", FadeIn(ld, scale=0.5), run=0.25)
        self.play(ld.animate.move_to(p(1.88)), run_time=1.2)
        lnum = M(r"1.9,\ 1.99,\ 1.999", size=44, color=BLUE).next_to(la, UP, buff=0.25)
        self.go("25:20.44", GrowArrow(la), Write(lnum), run=0.8)
        ln = side_lim("-", BLUE, -3.4)
        self.go("25:22.36", Write(ln[0]), run=0.6)
        self.go("25:23.30", Write(ln[1]), run=0.5)
        self.go("25:25.74", Circumscribe(ln[1], Circle, color=BLUE, buff=0.12), run=0.9)
        # right-hand limit
        rh = H("right-hand limit", 48, ORG).move_to([3.4, -0.75, 0]).align_to(lh, UP)
        self.go("25:27.54", Write(rh), run=0.6)
        rd = Dot(p(3.8), radius=0.13, color=ORG).set_z_index(3)
        self.go("25:29.10", FadeIn(rd, scale=0.5), run=0.25)
        self.play(rd.animate.move_to(p(2.12)), run_time=1.2)
        rnum = M(r"2.1,\ 2.01,\ 2.001", size=44, color=ORG).next_to(ra, UP, buff=0.25)
        self.go("25:30.86", GrowArrow(ra), Write(rnum), run=0.8)
        rn = side_lim("+", ORG, 3.4)
        self.go("25:32.40", Write(rn[0]), run=0.6)
        self.go("25:33.06", Write(rn[1]), run=0.5)
        self.go("25:34.48", Circumscribe(rn[1], Circle, color=ORG, buff=0.12), run=0.7)
        self.wipe("25:35.22", run=0.33)


# ================================================================ the two-piece function

def piece_formula():
    lhs = M("f(x)", "=", size=62)
    v1, c1 = M("x+1", size=62), M("x<2", size=56, color=DIM)
    v2, c2 = M("5", size=62), M(r"x\ge 2", size=56, color=DIM)
    v1.move_to([0, 0.5, 0], aligned_edge=LEFT)
    v2.move_to([0, -0.5, 0], aligned_edge=LEFT)
    c1.move_to([2.1, 0.5, 0], aligned_edge=LEFT)
    c2.move_to([2.1, -0.5, 0], aligned_edge=LEFT)
    rows = VGroup(v1, c1, v2, c2)
    br = Brace(rows, LEFT, buff=0.2, color=CHALK)
    lhs.next_to(br, LEFT, buff=0.2)
    VGroup(lhs, br, rows).move_to([-3.45, 1.0, 0])
    return dict(lhs=lhs, br=br, v1=v1, c1=c1, v2=v2, c2=c2)


def side_limit(sub, rest, color, size=56):
    m = M(r"\lim_{" + sub + "}", "f(x)", "=", rest, size=size)
    m[3].set_color(color)
    return m


class K04_Piece(Shot):
    def body(self):
        self.title("One-Sided Limits", animate=False)
        self.title("A Two-Piece Function", "25:36.30")
        F = piece_formula()
        ax = AX((-1, 4.5, 1), (-1, 6, 1), x_length=5.4, y_length=5.6, center=(3.5, -0.6, 0))
        self.go("25:37.22", Create(ax), FadeIn(ax.labels), run=0.7)
        self.go("25:38.96", Write(F["lhs"]), Create(F["br"]), run=0.6)
        self.go("25:40.26", Write(F["v1"]), run=0.5)
        self.go("25:41.24", Write(F["c1"]), run=0.5)
        f1 = lambda x: x + 1
        p1 = curve(ax, f1, [-0.95, 2 - 0.09 / ux(ax)])
        h3 = hole(ax, 2, 3)
        self.play(draw(p1, 0.7))
        self.play(FadeIn(h3, scale=0.5), run_time=0.25)
        self.go("25:43.38", Write(F["v2"]), run=0.4)
        self.go("25:44.16", Write(F["c2"]), run=0.5)
        p2 = Line(ax.c2p(2, 5), ax.c2p(4.3, 5), color=ORG, stroke_width=5)
        d5 = pt(ax, 2, 5, ORG, r=0.1)
        self.play(FadeIn(d5, scale=0.5), Create(p2), run_time=0.6)
        # from the left: x < 2, so the x+1 rule
        la = arrow(ax.c2p(-0.6, -0.6), ax.c2p(1.75, -0.6), BLUE, 5, 0.2)
        self.go("25:45.92", Create(la), run=0.6)
        b1 = box(VGroup(F["v1"], F["c1"]), BLUE, buff=0.12)
        self.go("25:49.32", Create(b1), run=0.5)
        stop = 0.2 / ux(ax) + 0.02
        xt = ValueTracker(-0.2)
        r1 = rider(ax, f1, xt, BLUE, hi=2 - stop)
        self.go("25:51.40", FadeIn(r1), run=0.25)
        self.go("25:52.10", xt.animate.set_value(2), run=2.6)
        self.go("25:55.50", ax.yn[3].animate.set_color(BLUE).scale(1.25), run=0.4)
        Lm = side_limit(r"x\to 2^-", "3", BLUE).move_to([-3.45, -1.0, 0])
        self.go("25:56.40", Write(Lm[0:3]), run=0.7)
        self.go("25:57.70", Write(Lm[3]), run=0.3)
        # from the right: x >= 2, so the rule that just says 5
        freeze(r1)
        ra = arrow(ax.c2p(4.3, -0.6), ax.c2p(2.25, -0.6), ORG, 5, 0.2)
        g3 = DashedLine(ax.c2p(0, 3), ax.c2p(2, 3) + LEFT * 0.1, color=BLUE, stroke_width=3, dash_length=0.1)
        self.go("25:58.60", FadeOut(r1), FadeIn(g3), FadeOut(b1), Create(ra), run=0.6)
        b2 = box(VGroup(F["v2"], F["c2"]), ORG, buff=0.12)
        self.go("26:01.46", Create(b2), run=0.5)
        xt2 = ValueTracker(4.1)
        r2 = rider(ax, lambda x: 5.0, xt2, ORG, lo=2.14)
        self.go("26:02.70", FadeIn(r2), run=0.25)
        self.play(xt2.animate.set_value(2), ax.yn[5].animate.set_color(ORG).scale(1.25), run_time=1.4)
        Rm = side_limit(r"x\to 2^+", "5", ORG).move_to([-3.45, -2.5, 0])
        self.go("26:05.08", Write(Rm[0:3]), run=0.7)
        self.go("26:06.36", Write(Rm[3]), run=0.3)
        freeze(r2)
        g5 = DashedLine(ax.c2p(0, 5), ax.c2p(2, 5) + LEFT * 0.1, color=ORG, stroke_width=3, dash_length=0.1)
        self.go("26:07.52", FadeOut(r2), FadeIn(g5), FadeOut(b2), run=0.4)
        self.go("26:09.14", Circumscribe(Lm[3], color=BLUE, buff=0.1), run=0.7)
        self.go("26:11.60", Circumscribe(Rm[3], color=ORG, buff=0.1), run=0.7)
        jmp = arrow(ax.c2p(2.3, 3.15), ax.c2p(2.3, 4.85), YEL, 5, 0.2)
        jl = H("jump", 40, YEL).next_to(jmp, RIGHT, buff=0.15)
        self.go("26:13.86", GrowArrow(jmp), FadeIn(jl, shift=LEFT * 0.1), run=0.5)
        self.wipe("26:14.95", run=0.35)


# ================================================================ the big rule + two friends

GROUND = -2.0


def walker(xt, color):
    """A stick figure whose legs and arms swing as its x (the tracker) changes."""
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


class K04_Rule(Shot):
    def body(self):
        self.title("A Two-Piece Function", animate=False)
        self.title("The Big Rule", "26:16.00")
        top = VGroup(H("two-sided limit", 52, YEL), H("exists only if", 52)).arrange(RIGHT, buff=0.4, aligned_edge=UP).move_to([0, 1.4, 0])
        self.go("26:17.58", Write(top[0]), run=0.6)
        self.go("26:18.84", Write(top[1]), run=0.6)
        eq = M(r"\lim_{x\to a^-} f(x)", "=", r"\lim_{x\to a^+} f(x)", size=64).move_to([0, -0.2, 0])
        eq[0].set_color(BLUE)
        eq[2].set_color(ORG)
        self.go("26:20.18", Write(eq[0]), run=0.6)
        self.go("26:21.58", Write(eq[2]), run=0.6)
        self.go("26:22.60", Write(eq[1]), run=0.4)
        self.go("26:23.10", FadeOut(top), FadeOut(eq), run=0.3)

        def row(rel, res):
            return VGroup(H("left", 50, BLUE), M(rel, size=64, color=YEL), H("right", 50, ORG),
                          M(r"\longrightarrow", size=64, color=DIM), res).arrange(RIGHT, buff=0.35)
        r1 = row("=", H("limit exists", 50, GRN))
        r2 = row(r"\neq", M(r"\text{DNE}", size=60, color=RED))
        rows = VGroup(r1, r2).arrange(DOWN, buff=0.55, aligned_edge=LEFT).move_to([-0.4, 1.0, 0])
        r2[4].align_to(r1[4], LEFT)
        fr = panel(rows, PURP, buff=0.4)
        self.go("26:23.50", Create(fr), Write(r1[0:3]), run=0.7)
        self.go("26:24.58", GrowFromEdge(r1[3], LEFT), Write(r1[4]), run=0.5)
        tk = tick_mark(s=0.42).next_to(fr, RIGHT, buff=0.3).match_y(r1)
        self.go("26:25.18", Create(tk), run=0.3)
        self.go("26:26.10", Write(r2[0:3]), run=0.6)
        self.go("26:27.06", GrowFromEdge(r2[3], LEFT), Write(r2[4]), run=0.5)
        cr = cross_mark(s=0.2).next_to(fr, RIGHT, buff=0.35).match_y(r2)
        self.go("26:27.60", Create(cr), run=0.3)
        self.go("26:29.60", Circumscribe(r2[4], color=RED, buff=0.1), run=0.7)
        dn = H("does not exist", 40, RED).next_to(fr, DOWN, buff=0.2).align_to(r2[4], LEFT)
        self.go("26:31.00", FadeIn(dn, shift=UP * 0.1), run=0.4)
        # this function
        ex = M("3", r"\neq", "5", size=72).move_to([-4.4, -2.35, 0])
        ex[0].set_color(BLUE)
        ex[2].set_color(ORG)
        self.go("26:32.52", Write(ex), run=0.5)
        L = M(r"\lim_{x\to 2} f(x)", "=", r"\text{DNE}", size=64).move_to([1.4, -2.35, 0])
        L[2].set_color(RED)
        self.go("26:33.30", Write(L[0]), run=0.7)
        self.go("26:35.30", Write(L[1:]), run=0.45)
        self.play(Create(box(L[2], RED, buff=0.12)), run_time=0.35)
        # two friends who agree to meet at a cafe
        self.wipe("26:36.45", run=0.3)
        ground = Line([-6.7, GROUND, 0], [6.7, GROUND, 0], color=DIM, stroke_width=3)
        self.title("Two Friends", "26:36.80")
        a, b = ValueTracker(-6.0), ValueTracker(6.0)
        wa, wb = walker(a, BLUE), walker(b, ORG)
        self.go("26:37.40", Create(ground), run=0.4)
        self.go("26:37.82", FadeIn(wa, shift=RIGHT * 0.2), FadeIn(wb, shift=LEFT * 0.2), run=0.3)
        self.play(a.animate.set_value(-4.3), b.animate.set_value(4.3), run_time=1.2, rate_func=linear)
        c = cafe(0)
        self.go("26:39.36", Create(c[:3]), Write(c[3]), a.animate.set_value(-1.8), b.animate.set_value(1.8), run=2.4)
        freeze(wa, wb)
        meet = pill("same cafe: they meet", GRN, 42).move_to([0, 1.3, 0])
        self.go("26:42.80", FadeIn(meet, shift=DOWN * 0.1), run=0.4)
