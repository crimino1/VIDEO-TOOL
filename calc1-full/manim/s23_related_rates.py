"""Builder 23: middle of Chapter 8. The thrown ball lands at -20 m/s, the related-rates idea (a growing square: s and A
change together), the 5-step recipe, the plug-in-too-early mistake, the balloon (live inflation at 100 cm^3/s, dr/dt = 1/pi,
the radius slowing down as the surface grows), the ladder (live slide at 1 m/s, Pythagoras held, dy/dt = -3/4) and the
cone up to 2 = 4 pi dh/dt (builder 24 finishes it). A compact 1-5 step strip ticks off in every worked example.
Colours: rates PINK, example numbers ORG, answers GRN, key words YEL, water BLUE."""
from common import *

# ---------------------------------------------------------------- local helpers

_DG = {}


def digits(s, size=46, color=CHALK):
    """A number from cached glyphs (cheap per frame, no new LaTeX per value); the minus sits at mid-height."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.035, aligned_edge=DOWN)
    ref = next((x for x, ch in zip(g, s) if ch.isdigit()), None)
    for x, ch in zip(g, s):
        if ch == "-" and ref is not None:
            x.set_y(ref.get_y())
    return g


def live(label, fn, fmt, unit=None, color=CHALK, size=46):
    """Live number (+ unit) right of `label` (a MathTex ending in '='), centred on the '='."""
    u = M(unit, size=size - 6, color=color) if unit else None

    def mk():
        d = digits(fmt(fn()), size, color)
        g = VGroup(d, u.copy()) if u else VGroup(d)
        g.arrange(RIGHT, buff=0.14, aligned_edge=DOWN)
        g.next_to(label, RIGHT, buff=0.18)
        g.shift(UP * (label[-1].get_y() - d.get_y()))
        return g
    return always_redraw(mk)


def f2(v):
    return f"{(v if abs(v) >= 0.005 else 0.0):.2f}"


def f1(v):
    return f"{(v if abs(v) >= 0.05 else 0.0):.1f}"


def eqrow(*parts, y, x=2.0, eq=1, size=56):
    """MathTex row with part `eq` (the '=') at column x, row y."""
    m = M(*parts, size=size)
    m.shift(RIGHT * (x - m[eq].get_x()) + UP * (y - m[eq].get_y()))
    return m


def under(mob, color=YEL):
    return Line(mob.get_corner(DL) + DOWN * 0.1, mob.get_corner(DR) + DOWN * 0.1, color=color, stroke_width=5)


def kw(word, m, gap=0.35):
    """Small DIM tag ('know', 'want') left of a row."""
    return H(word, 36, DIM).next_to(m, LEFT, buff=gap)


# ---- the step strip: 1-5 under the title, ticks off as each step is used
SNAMES = ["picture", "rates", "equation", None, "plug in"]
STRIP_Y = 2.12


def strip_item(i):
    c = Circle(radius=0.21, stroke_width=3)
    n = M(str(i + 1), size=32).move_to(c)
    tk = tick_mark(GRN, s=0.34).move_to(c)
    lab = (M(r"\frac{d}{dt}", size=40) if SNAMES[i] is None else H(SNAMES[i], 34)).next_to(c, RIGHT, buff=0.14)
    return VGroup(c, n, tk, lab)


def style(item, s):
    """s: 0 waiting, 1 now, 2 done (ticked)."""
    c, n, tk, lab = item
    col = {0: DIM, 1: YEL, 2: GRN}[s]
    c.set_stroke(col, opacity=1 if s else 0.6)
    n.set_fill(col, opacity=0 if s == 2 else (1 if s else 0.6))
    tk.set_stroke(GRN, opacity=1 if s == 2 else 0)
    lab.set_fill(col, opacity=1 if s else 0.6)
    return item


def strip(now=-1):
    g = VGroup(*[strip_item(i) for i in range(5)]).arrange(RIGHT, buff=0.6).move_to([0, STRIP_Y, 0])
    for i, it in enumerate(g):
        style(it, 2 if i < now else (1 if i == now else 0))
    return g


def step(sc, st, i, t, run=0.5):
    """Make step i the current one (earlier ones ticked). i = 5 ticks them all."""
    sc.go(t, *[Transform(it, style(it.copy(), 2 if j < i else (1 if j == i else 0))) for j, it in enumerate(st)], run=run)


# ---- balloon
BC = np.array([-3.5, -0.45, 0])
SC = 0.42   # screen units per cm


def r_of(V):
    return (3 * V / (4 * PI)) ** (1 / 3)


def V_of(r):
    return 4 / 3 * PI * r ** 3


def balloon(r, c=BC, sc=SC, string=None):
    R = r * sc
    c = np.array(c, float)
    if string is None:   # shorten the string as the balloon grows so it stays on the board
        string = max(0.2, min(0.7, c[1] - R - 0.15 + 3.7))
    body = Circle(radius=R, stroke_color=CHALK, stroke_width=4, fill_color=CHALK, fill_opacity=0.05).move_to(c)
    b = c + DOWN * R
    knot = Polygon(b, b + [-0.09, -0.15, 0], b + [0.09, -0.15, 0], stroke_color=CHALK, stroke_width=3,
                   fill_color=CHALK, fill_opacity=0.6)
    s0 = b + DOWN * 0.15
    strg = VMobject(stroke_color=DIM, stroke_width=3).set_points_smoothly(
        [s0 + np.array([0.07 * np.sin(k * 1.4), -string * k / 8, 0]) for k in range(9)])
    shine = Arc(radius=R * 0.72, start_angle=PI * 0.58, angle=PI * 0.22, arc_center=c, color=CHALK, stroke_width=3,
                stroke_opacity=0.55)
    return VGroup(body, knot, strg, shine)


def radius_line(r, c=BC, sc=SC, ang=0.35):
    c = np.array(c, float)
    e = c + r * sc * np.array([np.cos(ang), np.sin(ang), 0])
    ln = DashedLine(c, e, color=YEL, stroke_width=3, dash_length=0.1)
    dot = Dot(c, radius=0.05, color=YEL)
    lab = M("r", size=48, color=YEL).move_to((c + e) / 2 + np.array([-np.sin(ang), np.cos(ang), 0]) * 0.3)
    return VGroup(ln, dot, lab)


# ---- ladder (10 m)
WX, GY, LS = -4.9, -3.0, 0.44


def top(x, wx=WX, gy=GY, ls=LS):
    return np.array([wx, gy + np.sqrt(100 - x * x) * ls, 0])


def foot(x, wx=WX, gy=GY, ls=LS):
    return np.array([wx + x * ls, gy, 0])


def ladder(x, wx=WX, gy=GY, ls=LS, w=0.09, sw=4):
    T, F = top(x, wx, gy, ls), foot(x, wx, gy, ls)
    d = (F - T) / np.linalg.norm(F - T)
    n = np.array([-d[1], d[0], 0])   # up-right, away from the corner
    g = VGroup()
    for o in (-w, w):
        P = T + n * o
        a = P + d * (wx - P[0]) / d[0]
        b = P + d * (gy - P[1]) / d[1]
        g.add(Line(a, b, color=CHALK, stroke_width=sw))
    for k in range(1, 10):
        c = T + (F - T) * k / 10
        g.add(Line(c - n * w, c + n * w, color=CHALK, stroke_width=sw - 1))
    return g


def wall_ground(wx=WX, gy=GY, h=4.6, g_len=4.7, hatch=0.16):
    g = VGroup(Line([wx, gy, 0], [wx, gy + h, 0], color=CHALK, stroke_width=5),
               Line([wx - 0.3, gy, 0], [wx + g_len, gy, 0], color=CHALK, stroke_width=5))
    for yy in np.arange(gy + 0.25, gy + h, 0.32):
        g.add(Line([wx, yy, 0], [wx - hatch, yy - hatch, 0], color=FAINT, stroke_width=2))
    for xx in np.arange(wx + 0.05, wx + g_len, 0.32):
        g.add(Line([xx, gy, 0], [xx - hatch, gy - hatch, 0], color=FAINT, stroke_width=2))
    return g


def x_lab_pos(x):
    return np.array([WX + x * LS / 2, GY - 0.48, 0])


def y_lab_pos(x):
    return np.array([WX + 0.42, GY + np.sqrt(100 - x * x) * LS * 0.3, 0])


def ten_pos(x):
    T, F = top(x), foot(x)
    d = (F - T) / np.linalg.norm(F - T)
    return (T + F) / 2 + np.array([-d[1], d[0], 0]) * 0.45


def foot_arrow(x):
    F = foot(x)
    return Arrow(F + [0.15, 0.28, 0], F + [1.05, 0.28, 0], buff=0, color=PINK, stroke_width=5, tip_length=0.2)


def top_arrow(x):
    T = top(x)
    return Arrow([WX - 0.55, T[1] + 0.1, 0], [WX - 0.55, T[1] - 0.85, 0], buff=0, color=PINK, stroke_width=5, tip_length=0.2)


def corner_mark():
    return right_angle_mark(np.array([WX, GY, 0]), [WX + 1, GY, 0], [WX, GY + 1, 0], size=0.3)


# ---- cone tank (10 m tall, top radius 5 m), point down
CX, AY, CS = -4.0, -3.3, 0.44


def cone_tank(cx=CX, ay=AY, cs=CS):
    ty, R = ay + 10 * cs, 5 * cs
    return VGroup(Line([cx, ay, 0], [cx - R, ty, 0], color=CHALK, stroke_width=5),
                  Line([cx, ay, 0], [cx + R, ty, 0], color=CHALK, stroke_width=5),
                  Ellipse(width=2 * R, height=0.25 * R, color=CHALK, stroke_width=4).move_to([cx, ty, 0]))


def water(h, cx=CX, ay=AY, cs=CS):
    ys, R = ay + h * cs, h / 2 * cs
    body = Polygon([cx, ay, 0], [cx - R, ys, 0], [cx + R, ys, 0], stroke_width=0, fill_color=BLUE, fill_opacity=0.25)
    surf = Ellipse(width=2 * R, height=0.25 * R, stroke_color=BLUE, stroke_width=3, fill_color=BLUE,
                   fill_opacity=0.2).move_to([cx, ys, 0])
    return VGroup(body, surf)


def h_of_V(V):
    return (12 * V / PI) ** (1 / 3)


def cone_labels(h=4.0):
    """Tank dimensions (10, 5) and the water's h and r at depth h."""
    ty, R = AY + 10 * CS, 5 * CS
    dim = VGroup(Line([CX + R + 0.45, AY, 0], [CX + R + 0.45, ty, 0], color=DIM, stroke_width=2),
                 Line([CX + R + 0.35, AY, 0], [CX + R + 0.55, AY, 0], color=DIM, stroke_width=2),
                 Line([CX + R + 0.35, ty, 0], [CX + R + 0.55, ty, 0], color=DIM, stroke_width=2))
    ten = M("10", size=44, color=ORG).next_to(dim[0], RIGHT, buff=0.12)
    rad = DashedLine([CX, ty, 0], [CX + R, ty, 0], color=DIM, stroke_width=2, dash_length=0.08)
    five = M("5", size=44, color=ORG).next_to(rad, DOWN, buff=0.38).shift(RIGHT * 0.3)
    ys, r = AY + h * CS, h / 2 * CS
    hl = DashedLine([CX, AY, 0], [CX, ys, 0], color=YEL, stroke_width=3, dash_length=0.08)
    hlab = M("h", size=46, color=YEL).next_to(hl, LEFT, buff=0.12)
    rl = Line([CX, ys, 0], [CX + r, ys, 0], color=YEL, stroke_width=3)
    rlab = M("r", size=46, color=YEL).next_to(rl, UP, buff=0.12)
    return dict(dim=VGroup(dim, ten), rad=VGroup(rad, five), h=VGroup(hl, hlab), r=VGroup(rl, rlab))


assert f2(r_of(V_of(5.0))) == "5.00" and f2(100 / (4 * PI * 25)) == "0.32"
assert f2(np.sqrt(100 - 36)) == "8.00" and f2(-6 / 8 * 1) == "-0.75"
assert abs(h_of_V(PI * 4 ** 3 / 12) - 4) < 1e-9


# ---------------------------------------------------------------- the ball lands

class K23_Lands(Shot):
    def body(self):
        bx, gy, hs, rb = -4.8, -3.0, 0.21, 0.22
        ground = VGroup(Line([-6.4, gy, 0], [-3.0, gy, 0], color=CHALK, stroke_width=5),
                        *[Line([x, gy, 0], [x - 0.16, gy - 0.16, 0], color=FAINT, stroke_width=2)
                          for x in np.arange(-6.3, -3.0, 0.32)])
        path = DashedLine([bx, gy, 0], [bx, gy + 20 * hs + rb, 0], color=FAINT, stroke_width=2, dash_length=0.1)
        top_tag = M("20\\text{ m}", size=36, color=DIM).next_to(path.get_top(), LEFT, buff=0.35)
        tt = ValueTracker(2.0)

        def hgt():
            t = tt.get_value()
            return 20 * t - 5 * t * t

        def vel():
            return 20 - 10 * tt.get_value()

        def yc():
            return gy + rb + hgt() * hs

        ball = always_redraw(lambda: Circle(radius=rb, stroke_color=CHALK, stroke_width=4, fill_color=CHALK,
                                            fill_opacity=0.25).move_to([bx, yc(), 0]))

        def varrow():
            L = 0.06 * abs(vel())
            if L < 0.05:
                return VMobject()
            return Arrow([bx + 0.45, yc() + L, 0], [bx + 0.45, yc(), 0], buff=0, color=PINK, stroke_width=5,
                         tip_length=0.2, max_tip_length_to_length_ratio=0.4)
        arr = always_redraw(varrow)
        vlab = M("v", "=", size=46, color=PINK).move_to([-3.4, -0.3, 0], aligned_edge=LEFT)
        vnum = live(vlab, vel, f1, r"\text{m/s}", PINK)

        r0 = M("v(t)", "=", "20-10t", size=56).move_to([3.0, 1.2, 0])
        self.title("When It Lands", animate=False)
        self.go("2:17:20.04", FadeIn(self.head, shift=DOWN * 0.15), Create(ground), Create(path), FadeIn(ball), FadeIn(top_tag),
                Write(r0), FadeIn(vlab), FadeIn(vnum), run=0.6)
        self.add(arr)
        self.go("2:17:20.70", tt.animate.set_value(4.0), run=2.0, rate_func=linear)

        r1 = eqrow("v(4)", "=", "20-40", y=-0.05, x=r0[1].get_x())
        r1[0][2].set_color(ORG)
        r2 = eqrow(r"=\;", "-20", r"\text{ m/s}", y=-1.3, x=r0[1].get_x(), eq=0)
        r2[1:].set_color(PINK)
        self.go("2:17:22.65", Write(r1[0:2]), run=0.6)
        self.go("2:17:23.55", Write(r1[2]), run=0.8)
        self.go("2:17:25.33", Write(r2[0:2]), run=0.6)
        self.go("2:17:26.15", Write(r2[2]), run=0.5)
        self.go("2:17:26.80", Create(answer_box(r2[1:])), run=0.5)

        # same speed it was thrown at, pointing the other way
        up = Arrow([bx - 0.45, gy + rb, 0], [bx - 0.45, gy + rb + 1.2, 0], buff=0, color=DIM, stroke_width=5, tip_length=0.2)
        up_l = M("+20", size=38, color=DIM).next_to(up, LEFT, buff=0.12)
        dn_l = M("-20", size=38, color=PINK).next_to(arr, RIGHT, buff=0.12)
        self.go("2:17:27.70", GrowArrow(up), FadeIn(up_l), run=0.6)
        self.go("2:17:28.50", FadeIn(dn_l), run=0.4)
        self.go("2:17:29.43", Create(under(r2[1][1:], YEL)), run=0.5)
        ne = H("no air resistance", 38, DIM).move_to([3.0, -2.75, 0])
        self.go("2:17:31.70", FadeIn(ne, shift=UP * 0.1), run=0.5)


# ---------------------------------------------------------------- the idea

class K23_Intro(Shot):
    def body(self):
        self.title("Related Rates", "2:17:33.45")
        b = balloon(2.0, c=(-4.2, 0.2, 0), sc=0.42, string=0.5)
        lad = VGroup(wall_ground(-1.1, -0.9, h=2.4, g_len=2.3, hatch=0.12), ladder(5.5, -1.1, -0.9, 0.22, w=0.06, sw=3))
        cone = VGroup(cone_tank(4.2, -0.9, 0.24), water(6, 4.2, -0.9, 0.24))
        self.go("2:17:36.60", draw(b[0], 0.7), FadeIn(b[1:]), run=0.7)
        self.go("2:17:37.30", Create(lad), run=0.8)
        self.go("2:17:38.10", Create(cone[0]), FadeIn(cone[1]), run=0.8)
        five = VGroup(M("5", size=60, color=YEL), H("steps", 50, YEL)).arrange(RIGHT, buff=0.2).move_to([0, -2.5, 0])
        self.go("2:17:41.60", Write(five), run=0.7)
        self.wipe("2:17:44.05", run=0.4)

        # two quantities tied by an equation, both changing with time
        st = ValueTracker(1.5)
        o = np.array([-6.0, -3.1, 0])
        k = 0.55
        sq = always_redraw(lambda: Square(st.get_value() * k, stroke_color=CHALK, stroke_width=4, fill_color=GRN,
                                          fill_opacity=0.3).move_to(o + np.array([1, 1, 0]) * st.get_value() * k / 2))
        S0, A0 = M("s", size=46, color=YEL), M("A", size=46, color=GRN)
        slab = always_redraw(lambda: S0.copy().next_to(sq, DOWN, buff=0.12))
        alab = always_redraw(lambda: A0.copy().move_to(sq).scale(min(1, st.get_value() / 2.5)))
        self.go("2:17:45.45", FadeIn(sq), FadeIn(slab), FadeIn(alab), run=0.5)
        sl = M("s", "=", size=50, color=YEL).move_to([-1.2, 0.85, 0], aligned_edge=LEFT)
        sn = live(sl, st.get_value, f2, r"\text{cm}", YEL, 50)
        al = M("A", "=", size=50, color=GRN).move_to([-1.2, -0.15, 0], aligned_edge=LEFT)
        an = live(al, lambda: st.get_value() ** 2, f2, r"\text{cm}^2", GRN, 50)
        self.go("2:17:46.05", FadeIn(sl), FadeIn(sn), FadeIn(al), FadeIn(an), run=0.5)
        eq = M("A", "=", "s^2", size=72).move_to([4.2, 0.4, 0])
        self.go("2:17:47.85", Write(eq), run=0.7)
        know = M(r"\frac{ds}{dt}", "=", r"1\text{ cm/s}", size=54, color=PINK).move_to([0.9, -1.45, 0], aligned_edge=LEFT)
        want = M(r"\frac{dA}{dt}", "=", "?", size=54, color=PINK).move_to([0.9, -2.75, 0], aligned_edge=LEFT)
        k1, k2 = kw("know", know), kw("want", want)
        self.at("2:17:49.20")   # ds/dt = 1 cm/s, real time; 'know' is written while it grows
        self.play(st.animate(run_time=4.0, rate_func=linear).set_value(5.5),
                  Succession(Wait(run_time=2.1), AnimationGroup(FadeIn(k1), Write(know), run_time=0.8)))
        self.go("2:17:54.05", FadeIn(k2), Write(want), run=0.8)


# ---------------------------------------------------------------- the 5 steps

LIST = ["Draw & label", "Know & want", "Find an equation", "Differentiate in t", "Plug in, solve"]


def big_list():
    g = VGroup()
    for i, s in enumerate(LIST):
        c = Circle(radius=0.27, stroke_color=CHALK, stroke_width=3)
        n = M(str(i + 1), size=40).move_to(c)
        lab = H(s, 42).next_to(c, RIGHT, buff=0.22)
        g.add(VGroup(c, n, lab).move_to([-6.4, 1.5 - i * 1.0, 0], aligned_edge=LEFT))
    return g


def hi(sc, rows, i, t):
    """Row i turns YEL, the others back to chalk."""
    anims = [rows[i].animate.set_color(YEL)] + [rows[j].animate.set_color(CHALK) for j in range(i)]
    sc.go(t, *anims, run=0.4)


def kw_rows():
    know = M(r"\frac{dr}{dt}", "=", "3", size=58, color=PINK).move_to([1.6, 0.7, 0], aligned_edge=LEFT)
    want = M(r"\text{find }", r"\frac{dh}{dt}", size=58, color=PINK).move_to([1.6, -1.1, 0], aligned_edge=LEFT)
    want[0].set_color(CHALK)
    return know, want, kw("know", know), kw("want", want)


class K23_Steps(Shot):
    def body(self):
        self.title("The 5 Steps", "2:17:57.10")
        rows = big_list()
        self.go("2:18:00.63", FadeIn(rows[0][:2]), Write(rows[0][2]), run=0.6)
        hi(self, rows, 0, "2:18:01.30")
        A, B, C = np.array([1.2, -2.6, 0]), np.array([5.4, -2.6, 0]), np.array([1.2, 0.6, 0])
        tri = Polygon(A, B, C, color=CHALK, stroke_width=5)
        mark = right_angle_mark(A, B, C)
        self.go("2:18:02.10", draw(tri, 0.9), run=0.9)
        lx = M("x", size=52).next_to(Line(A, B), DOWN, buff=0.15)
        ly = M("y", size=52).next_to(Line(A, C), LEFT, buff=0.15)
        l10 = side_label(C, B, "10", size=52, side=1)
        self.go("2:18:03.10", Create(mark), FadeIn(lx), FadeIn(ly), FadeIn(l10), run=0.5)
        self.go("2:18:05.10", lx.animate.set_color(YEL), ly.animate.set_color(YEL), run=0.4)
        n1 = note("changes", ly, UL, color=YEL, dist=0.6)
        self.go("2:18:05.70", FadeIn(n1), run=0.5)
        self.go("2:18:08.43", l10.animate.set_color(ORG), FadeOut(n1), run=0.4)
        n2 = note("fixed", l10, UR, color=ORG, dist=0.5)
        self.go("2:18:09.13", FadeIn(n2), run=0.5)

        self.go("2:18:11.03", FadeOut(VGroup(tri, mark, lx, ly, l10, n2)), FadeIn(rows[1][:2]), Write(rows[1][2]), run=0.6)
        hi(self, rows, 1, "2:18:11.70")
        know, want, k1, k2 = kw_rows()
        self.go("2:18:13.30", FadeIn(k1, shift=UP * 0.1), run=0.4)
        self.go("2:18:14.50", FadeIn(k2, shift=UP * 0.1), run=0.4)
        self.go("2:18:16.55", Write(know[:2]), run=0.8)
        self.go("2:18:18.60", Write(know[2]), run=0.3)
        self.go("2:18:19.97", Write(want), run=0.7)


class K23_Steps2(Shot):
    def body(self):
        self.title("The 5 Steps", animate=False)
        rows = big_list()
        rows[1].set_color(YEL)
        know, want, k1, k2 = kw_rows()
        self.add(rows[0], rows[1], know, want, k1, k2)

        self.go("2:18:22.75", FadeOut(VGroup(know, want, k1, k2)), FadeIn(rows[2][:2]), Write(rows[2][2]), run=0.6)
        hi(self, rows, 2, "2:18:23.40")
        fa = M("A", "=", r"\pi r^2", size=60).move_to([2.9, 1.05, 0])
        fv = M("V", "=", r"\frac{4}{3}\pi r^3", size=60).move_to([2.9, -0.4, 0])
        fp = M("a^2+b^2", "=", "c^2", size=60).move_to([2.9, -1.9, 0])
        self.go("2:18:29.33", Write(fa), run=0.6)
        self.go("2:18:30.13", Write(fv), run=0.6)
        self.go("2:18:31.03", Write(fp), run=0.6)

        self.go("2:18:32.85", FadeOut(fv), FadeOut(fp), FadeIn(rows[3][:2]), Write(rows[3][2]), run=0.6)
        hi(self, rows, 3, "2:18:33.50")
        self.go("2:18:33.90", fa.animate.move_to([2.3, 1.15, 0]), run=0.4)
        d = M(r"\frac{dA}{dt}", "=", r"2\pi r", r"\frac{dr}{dt}", size=60).move_to([2.3, -0.3, 0])
        d[0].set_color(PINK); d[3].set_color(PINK)
        self.go("2:18:34.69", Write(d), run=1.0)
        u1, u2 = under(d[0], PINK), under(d[3], PINK)
        self.go("2:18:37.61", Create(u1), run=0.4)
        self.go("2:18:39.41", Create(u2), run=0.4)
        ch = note("chain rule", d[3], RIGHT, color=YEL, size=34, dist=0.25, angle=-0.4)
        self.go("2:18:41.33", FadeOut(u1), FadeOut(u2), FadeIn(ch), run=0.5)
        dx = M(r"\frac{d}{dx}", size=54, color=DIM)
        ar = Arrow(LEFT * 0.5, RIGHT * 0.5, buff=0, color=DIM, stroke_width=4, tip_length=0.18)
        dt = M(r"\frac{d}{dt}", size=54, color=YEL)
        imp = VGroup(dx, ar, dt).arrange(RIGHT, buff=0.3).move_to([2.2, -2.75, 0])
        self.go("2:18:42.89", FadeIn(dx), run=0.4)
        self.go("2:18:44.83", GrowArrow(ar), FadeIn(dt), run=0.5)

        self.go("2:18:46.79", FadeOut(imp), FadeOut(ch), FadeIn(rows[4][:2]), Write(rows[4][2]), run=0.6)
        hi(self, rows, 4, "2:18:47.40")
        self.go("2:18:47.85", FadeOut(fa), d.animate.shift(UP * 1.3 + RIGHT * (1.3 - d[1].get_x())), run=0.5)
        r5 = M("r=5", size=50, color=ORG).next_to(d, RIGHT, buff=0.7)
        self.go("2:18:49.00", Create(under(rows[4][2][:6], YEL)), run=0.5)
        self.go("2:18:50.40", FadeIn(r5), run=0.4)
        p = eqrow(r"\frac{dA}{dt}", "=", r"2\pi(5)(3)", r"=\;", r"30\pi", y=-0.85, x=1.3, size=60)
        p[0].set_color(PINK)
        p[2][3].set_color(ORG); p[2][6].set_color(ORG)
        self.go("2:18:50.90", Write(p[:3]), run=0.8)
        self.go("2:18:52.10", Write(p[3:]), run=0.5)
        self.go("2:18:52.80", Create(answer_box(p[4])), run=0.4)


# ---------------------------------------------------------------- the classic mistake

class K23_Mistake(Shot):
    def body(self):
        self.title("Common Mistake", "2:18:53.91")
        div = DashedLine([0, 1.9, 0], [0, -3.4, 0], color=FAINT, stroke_width=2, dash_length=0.12)
        hl = H("plug in too early", 44, RED).move_to([-3.4, 1.55, 0])
        hr = H("derivative first", 44, GRN).move_to([3.4, 1.55, 0])
        self.go("2:18:55.29", Create(div), Write(hl), run=0.6)
        a = M("r^2", size=64).move_to([-3.4, 0.35, 0])
        self.go("2:18:56.10", Write(a), run=0.5)
        rv = M("r=5", size=48, color=ORG).next_to(a, LEFT, buff=0.8)
        self.go("2:18:59.31", FadeIn(rv, shift=RIGHT * 0.1), run=0.4)
        a2 = M("5^2", "=", "25", size=64).move_to([-3.4, 0.35, 0])
        a2[0][0].set_color(ORG)
        self.go("2:18:59.80", ReplacementTransform(a, a2[0]), FadeOut(rv), run=0.6)
        self.go("2:19:00.80", Write(a2[1:]), run=0.5)
        n = note("constant", a2[2], DR, color=YEL, dist=0.4)
        self.go("2:19:01.65", FadeIn(n), run=0.4)
        b = M(r"\frac{d}{dt}(25)", "=", "0", size=60).move_to([-3.4, -1.45, 0])
        b[2].set_color(RED)
        self.go("2:19:03.10", FadeOut(n), Write(b[0]), run=0.6)
        self.go("2:19:04.05", Write(b[1:]), run=0.4)
        x = cross_mark(s=0.3).next_to(b, DOWN, buff=0.45)
        lost = H("rate lost", 38, RED).next_to(x, RIGHT, buff=0.3)
        self.go("2:19:05.55", Create(x), FadeIn(lost), run=0.5)

        self.go("2:19:07.45", Write(hr), run=0.5)
        c = M(r"\frac{d}{dt}(r^2)", "=", r"2r", r"\frac{dr}{dt}", size=58).move_to([3.4, 0.35, 0])
        c[3].set_color(PINK)
        self.go("2:19:08.00", Write(c), run=0.9)
        c2 = eqrow("=", "10", r"\frac{dr}{dt}", y=-1.45, x=c[1].get_x(), size=58, eq=0)
        c2[1].set_color(ORG); c2[2].set_color(PINK)
        tk = tick_mark(s=0.5).next_to(c2, DOWN, buff=0.4)
        self.go("2:19:09.50", Write(c2), run=0.6)
        self.go("2:19:10.15", Create(tk), run=0.4)


# ---------------------------------------------------------------- the balloon

def balloon_rows():
    know = M(r"\frac{dV}{dt}", "=", r"100\ \text{cm}^3\text{/s}", size=54, color=PINK).move_to([0.6, 0.9, 0], aligned_edge=LEFT)
    want = M(r"\frac{dr}{dt}", "=", "?", r"\text{ when }", "r=5", size=54, color=PINK).move_to([0.6, -0.6, 0], aligned_edge=LEFT)
    want[3].set_color(CHALK); want[4].set_color(ORG)
    eq = M("V", "=", r"\frac{4}{3}\pi r^3", size=60).move_to([2.6, -2.1, 0])
    return know, want, kw("know", know), kw("want", want), eq


class K23_Balloon(Shot):
    def body(self):
        self.title("The Balloon", "2:19:10.87")
        st = strip()
        self.go("2:19:11.60", FadeIn(st, shift=DOWN * 0.1), run=0.5)
        Vt = ValueTracker(V_of(1.5))
        bal = always_redraw(lambda: balloon(r_of(Vt.get_value())))
        first = balloon(1.5)
        rest = first[1:]
        self.go("2:19:13.70", draw(first[0], 0.8), FadeIn(rest), run=0.8)
        self.remove(first[0], rest)
        self.add(bal)
        know, want, k1, k2, eq = balloon_rows()
        self.go("2:19:15.00", Write(know), run=0.9)
        vl = M("V", "=", size=50).move_to([0.6, -0.5, 0], aligned_edge=LEFT)
        vn = live(vl, Vt.get_value, lambda v: f"{v:.0f}", r"\text{cm}^3", CHALK, 50)
        rl = M("r", "=", size=50, color=YEL).move_to([0.6, -1.5, 0], aligned_edge=LEFT)
        rn = live(rl, lambda: r_of(Vt.get_value()), f2, r"\text{cm}", YEL, 50)
        self.go("2:19:16.10", FadeIn(vl), FadeIn(vn), FadeIn(rl), FadeIn(rn), run=0.3)
        t5 = (V_of(5.0) - V_of(1.5)) / 100   # 5.09 s at the real 100 cm^3/s
        self.go("2:19:16.43", Vt.animate.set_value(V_of(5.0)), run=t5, rate_func=linear)
        self.go("2:19:21.73", Circumscribe(VGroup(rl, rn), color=ORG, buff=0.12), run=0.8)

        rad = radius_line(5.0)
        step(self, st, 0, "2:19:23.79")
        self.go("2:19:24.40", FadeOut(VGroup(vl, vn, rl, rn)), Create(rad[0]), FadeIn(rad[1]), run=0.6)
        self.go("2:19:25.10", FadeIn(rad[2]), run=0.4)
        step(self, st, 1, "2:19:26.37")
        self.go("2:19:26.90", FadeIn(k1, shift=RIGHT * 0.1), run=0.4)
        self.go("2:19:30.20", FadeIn(k2, shift=RIGHT * 0.1), run=0.4)
        self.go("2:19:31.31", Write(want[:3]), run=0.6)
        self.go("2:19:32.30", Write(want[3:]), run=0.7)
        step(self, st, 2, "2:19:34.21")
        self.go("2:19:37.17", Write(eq), run=1.2)
        self.go("2:19:38.80", Create(under(eq, YEL)), run=0.5)


def balloon_state(sc, now):
    st = strip(now)
    bal = balloon(5.0)
    rad = radius_line(5.0)
    sc.add(st, bal, rad)
    return st, bal, rad


EQX = 1.75


class K23_BalloonSolve(Shot):
    def body(self):
        self.title("The Balloon", animate=False)
        st, bal, rad = balloon_state(self, 2)
        know, want, k1, k2, eq = balloon_rows()
        ul = under(eq, YEL)
        self.add(know, want, k1, k2, eq, ul)

        step(self, st, 3, "2:19:40.63")
        r0 = eqrow("V", "=", r"\frac{4}{3}\pi r^3", y=0.85, x=EQX, size=58)
        self.go("2:19:41.20", FadeOut(VGroup(know, want, k1, k2, ul)), Transform(eq, r0), run=0.6)
        r1 = eqrow(r"\frac{dV}{dt}", "=", r"\frac{4}{3}\pi", r"\cdot 3r^2", r"\cdot\frac{dr}{dt}", y=-0.75, x=EQX, size=58)
        r1[0].set_color(PINK); r1[4].set_color(PINK)
        self.go("2:19:44.07", Write(r1[:2]), run=0.6)
        self.go("2:19:46.75", Write(r1[2]), run=0.6)
        self.go("2:19:48.13", Write(r1[3]), run=0.6)
        self.go("2:19:50.01", Write(r1[4]), run=0.6)
        ch = note("chain rule", r1[4], DOWN, color=YEL, dist=0.35, angle=0.5)
        self.go("2:19:51.60", FadeIn(ch), run=0.5)
        s1, s2 = strike(r1[2][2]), strike(r1[3][1])
        self.go("2:19:53.80", FadeOut(ch), Create(s1), run=0.4)
        self.go("2:19:54.45", Create(s2), run=0.4)
        r2 = eqrow(r"\frac{dV}{dt}", "=", r"4\pi r^2", r"\frac{dr}{dt}", y=-2.35, x=EQX, size=58)
        r2[0].set_color(PINK); r2[3].set_color(PINK)
        self.go("2:19:56.25", Write(r2), run=1.0)
        box2 = answer_box(r2, YEL)
        self.go("2:19:58.00", Create(box2), run=0.5)

        step(self, st, 4, "2:20:01.67")
        self.go("2:20:02.20", FadeOut(VGroup(eq, r1, s1, s2, box2)), r2.animate.shift(UP * 3.2), run=0.6)
        r3 = eqrow("100", "=", r"4\pi", "(25)", r"\frac{dr}{dt}", y=-0.75, x=EQX, size=58)
        r3[0].set_color(ORG); r3[3][1:3].set_color(ORG); r3[4].set_color(PINK)
        r5 = M("r=5", size=46, color=ORG).move_to(rad[2]).shift(RIGHT * 0.1 + UP * 0.25)
        self.go("2:20:03.39", Write(r3[:2]), ReplacementTransform(rad[2], r5), run=0.5)
        self.go("2:20:04.29", Write(r3[2:4]), run=0.8)
        self.go("2:20:06.77", Write(r3[4]), run=0.5)
        u = under(r3[2:4], YEL)
        self.go("2:20:08.40", Create(u), run=0.5)
        r4 = eqrow("100", "=", r"100\pi", r"\frac{dr}{dt}", y=-2.35, x=EQX, size=58)
        r4[0].set_color(ORG); r4[2][:3].set_color(ORG); r4[3].set_color(PINK)
        self.go("2:20:10.95", FadeOut(u), Write(r4), run=0.8)
        r6 = eqrow(r"\frac{dr}{dt}", "=", r"\frac{1}{\pi}", r"\approx 0.32\text{ cm/s}", y=-2.35, x=EQX, size=58)
        r6[0].set_color(PINK); r6[2:].set_color(GRN)
        self.go("2:20:14.95", FadeOut(r3), r4.animate.shift(UP * 1.6), run=0.6)
        self.go("2:20:15.89", Write(r6[:3]), run=0.8)
        self.go("2:20:19.13", Write(r6[3]), run=0.8)
        self.go("2:20:20.30", Create(answer_box(r6)), run=0.5)
        step(self, st, 5, "2:20:21.00")


class K23_BalloonSlows(Shot):
    def body(self):
        self.title("The Balloon", animate=False)
        st = strip(5)
        r2 = eqrow(r"\frac{dV}{dt}", "=", r"4\pi r^2", r"\frac{dr}{dt}", y=0.85, x=EQX, size=58)
        r2[0].set_color(PINK); r2[3].set_color(PINK)
        Vt = ValueTracker(V_of(5.0))
        bal = always_redraw(lambda: balloon(r_of(Vt.get_value())))
        rad = radius_line(5.0)
        b5 = balloon(5.0)
        r5 = M("r=5", size=46, color=ORG).move_to(rad[2]).shift(RIGHT * 0.1 + UP * 0.25)
        r4 = eqrow("100", "=", r"100\pi", r"\frac{dr}{dt}", y=-0.75, x=EQX, size=58)
        r4[0].set_color(ORG); r4[2][:3].set_color(ORG); r4[3].set_color(PINK)
        r6 = eqrow(r"\frac{dr}{dt}", "=", r"\frac{1}{\pi}", r"\approx 0.32\text{ cm/s}", y=-2.35, x=EQX, size=58)
        r6[0].set_color(PINK); r6[2:].set_color(GRN)
        rest = VGroup(st, rad[:2], r5, r4, r6, answer_box(r6))
        self.add(b5, r2, rest)

        self.go("2:20:22.40", FadeOut(rest), r2.animate.move_to([2.6, 1.45, 0]), run=0.6)
        self.remove(b5)
        self.add(bal)
        u = under(r2[2], YEL)
        self.go("2:20:24.19", Create(u), run=0.5)
        sa = H("surface area", 40, YEL).next_to(u, DOWN, buff=0.25)
        surf = always_redraw(lambda: Circle(radius=r_of(Vt.get_value()) * SC, stroke_color=YEL, stroke_width=6)
                             .move_to(BC))
        self.go("2:20:26.29", FadeIn(sa, shift=UP * 0.1), Create(surf), run=0.7)

        # inflate from r = 1 at a steady 100 cm^3/s; the radius grows ever slower
        self.go("2:20:27.80", FadeOut(sa), FadeOut(surf), Vt.animate.set_value(V_of(1.0)), run=0.5)
        dv = M(r"\frac{dV}{dt}", "=", r"100", size=50, color=PINK).move_to([-0.15, 0.25, 0], aligned_edge=LEFT)
        rl = M("r", "=", size=50, color=YEL).move_to([3.2, 0.25, 0], aligned_edge=LEFT)
        rn = live(rl, lambda: r_of(Vt.get_value()), f2, None, YEL, 50)
        drl = M(r"\frac{dr}{dt}", "=", size=50, color=PINK).move_to([3.2, -0.8, 0], aligned_edge=LEFT)
        drn = live(drl, lambda: 100 / (4 * PI * r_of(Vt.get_value()) ** 2), f2, None, PINK, 50)
        dvsame = H("same", 36, DIM).next_to(dv, DOWN, buff=0.2)
        ax = axes((0, 14, 2), (0, 8, 2), x_length=5.6, y_length=1.8, center=(2.9, -2.75, 0), x_label="t", y_label="r",
                  nums=False)
        V0 = V_of(1.0)
        Tmax = (V_of(6.6) - V0) / 100

        def rt(t):
            return r_of(V0 + 100 * t)
        trace = always_redraw(lambda: curve(ax, rt, [0, max(0.02, (Vt.get_value() - V0) / 100)], width=4))
        self.go("2:20:28.40", FadeIn(dv), FadeIn(dvsame), FadeIn(rl), FadeIn(rn), FadeIn(drl), FadeIn(drn),
                Create(ax), FadeIn(ax.labels), run=0.4)
        self.add(trace)
        self.go("2:20:28.90", Vt.animate.set_value(V_of(6.6)), run=8.0, rate_func=linear)
        fast = H("fast", 38, YEL).next_to(ax.c2p(0, rt(0.6)), LEFT, buff=0.2)
        slow = H("slow", 38, YEL).next_to(ax.c2p(Tmax * 0.85, rt(Tmax * 0.85)), UP, buff=0.15)
        self.go("2:20:37.31", FadeIn(fast), run=0.4)
        self.go("2:20:38.99", FadeIn(slow), run=0.4)
        self.go("2:20:40.40", Circumscribe(dv, color=PINK, buff=0.1), run=0.9)


# ---------------------------------------------------------------- the ladder

class K23_Ladder(Shot):
    def body(self):
        self.title("The Ladder", "2:20:42.53")
        st = strip()
        self.go("2:20:43.00", FadeIn(st, shift=DOWN * 0.1), run=0.5)
        xt = ValueTracker(2.5)
        wg = wall_ground()
        lad = always_redraw(lambda: ladder(xt.get_value()))
        self.go("2:20:43.87", Create(wg), run=0.6)
        first = ladder(2.5)
        self.go("2:20:44.45", Create(first), run=0.8)
        self.remove(first)
        self.add(lad)
        fa = always_redraw(lambda: foot_arrow(xt.get_value()))
        fl = M(r"1\text{ m/s}", size=40, color=PINK)
        fl.add_updater(lambda m: m.next_to(foot_arrow(xt.get_value()), UP, buff=0.1))
        xl = M("x", "=", size=48).move_to([0.4, 0.9, 0], aligned_edge=LEFT)
        xn = live(xl, xt.get_value, f2, r"\text{m}", CHALK, 48)
        yl = M("y", "=", size=48).move_to([0.4, -0.1, 0], aligned_edge=LEFT)
        yn = live(yl, lambda: np.sqrt(100 - xt.get_value() ** 2), f2, r"\text{m}", CHALK, 48)
        ga = foot_arrow(2.5)
        self.go("2:20:48.19", GrowArrow(ga), run=0.4)
        self.remove(ga)
        self.add(fa)
        self.go("2:20:48.60", FadeIn(fl), FadeIn(xl), FadeIn(xn), FadeIn(yl), FadeIn(yn), run=0.4)
        self.go("2:20:49.05", xt.animate.set_value(5.0), run=2.5, rate_func=linear)   # 1 m/s
        ta = always_redraw(lambda: top_arrow(xt.get_value()))
        tq = M("?", size=50, color=PINK)
        tq.add_updater(lambda m: m.next_to(top_arrow(xt.get_value()), LEFT, buff=0.12))
        gt = top_arrow(5.0)
        self.go("2:20:52.39", GrowArrow(gt), run=0.4)
        self.remove(gt)
        self.add(ta)
        self.go("2:20:53.13", FadeIn(tq), run=0.3)
        self.go("2:20:54.40", xt.animate.set_value(6.0), run=1.0, rate_func=linear)
        self.go("2:20:55.40", Circumscribe(VGroup(xl, xn), color=ORG, buff=0.12), run=0.8)

        step(self, st, 0, "2:20:57.31")
        self.go("2:20:57.95", Create(corner_mark()), run=0.4)
        T, F, O = top(6), foot(6), np.array([WX, GY, 0])
        sides = [Line(O, T, color=YEL, stroke_width=8), Line(O, F, color=YEL, stroke_width=8), Line(T, F, color=YEL, stroke_width=8)]
        self.go("2:20:59.49", Create(sides[0]), run=0.5)
        self.go("2:21:00.95", FadeOut(sides[0]), Create(sides[1]), run=0.5)
        self.go("2:21:02.79", FadeOut(sides[1]), Create(sides[2]), run=0.6)
        hyp = H("hypotenuse", 36, YEL).move_to(ten_pos(6) + np.array([0.9, 0.55, 0]))
        self.go("2:21:03.45", FadeIn(hyp), run=0.4)
        lx = M("x", size=50, color=YEL).move_to(x_lab_pos(6))
        ly = M("y", size=50, color=YEL).move_to(y_lab_pos(6))
        l10 = M("10", size=50, color=ORG).move_to(ten_pos(6))
        self.go("2:21:05.00", FadeOut(sides[2]), FadeOut(hyp), run=0.4)
        self.go("2:21:06.15", FadeIn(lx), run=0.4)
        self.go("2:21:08.41", FadeIn(ly), run=0.4)
        self.go("2:21:10.45", FadeIn(l10), run=0.4)
        n = note("fixed", l10, UR, color=ORG, dist=0.45)
        self.go("2:21:12.10", FadeIn(n), run=0.5)

        step(self, st, 1, "2:21:14.77")
        know = M(r"\frac{dx}{dt}", "=", "1", size=56, color=PINK).move_to([1.4, 0.75, 0], aligned_edge=LEFT)
        want = M(r"\frac{dy}{dt}", "=", "?", r"\text{ when }", "x=6", size=56, color=PINK).move_to([1.4, -0.75, 0], aligned_edge=LEFT)
        want[3].set_color(CHALK); want[4].set_color(ORG)
        k1, k2 = kw("know", know), kw("want", want)
        self.go("2:21:15.30", FadeOut(VGroup(xl, xn, yl, yn, n)), FadeIn(k1), Write(know), run=0.8)
        self.go("2:21:18.10", FadeIn(k2), Write(want[:3]), run=0.7)
        self.go("2:21:19.49", Write(want[3:]), run=0.7)


def ladder_state(sc, now, x=6.0):
    st = strip(now)
    g = VGroup(wall_ground(), ladder(x), corner_mark(), foot_arrow(x))
    fl = M(r"1\text{ m/s}", size=40, color=PINK).next_to(foot_arrow(x), UP, buff=0.1)
    ta = top_arrow(x)
    tq = M("?", size=50, color=PINK).next_to(ta, LEFT, buff=0.12)
    l10 = M("10", size=50, color=ORG).move_to(ten_pos(x))
    sc.add(st, g, fl, ta, tq, l10)
    return st, g, fl, ta, tq, l10


LX = 3.0   # '=' column for the ladder algebra


class K23_LadderSolve(Shot):
    def body(self):
        self.title("The Ladder", animate=False)
        st, g, fl, ta, tq, l10 = ladder_state(self, 1)
        lx = M("x", size=50, color=YEL).move_to(x_lab_pos(6))
        ly = M("y", size=50, color=YEL).move_to(y_lab_pos(6))
        know = M(r"\frac{dx}{dt}", "=", "1", size=56, color=PINK).move_to([1.4, 0.75, 0], aligned_edge=LEFT)
        want = M(r"\frac{dy}{dt}", "=", "?", r"\text{ when }", "x=6", size=56, color=PINK).move_to([1.4, -0.75, 0], aligned_edge=LEFT)
        want[3].set_color(CHALK); want[4].set_color(ORG)
        k1, k2 = kw("know", know), kw("want", want)
        self.add(lx, ly, know, want, k1, k2)

        step(self, st, 2, "2:21:21.55")
        self.go("2:21:22.00", FadeOut(VGroup(know, want, k1, k2)), run=0.4)
        r0 = eqrow("x^2", "+", "y^2", "=", "100", y=1.05, x=LX, eq=3, size=52)
        self.go("2:21:23.65", Write(r0[0]), run=0.4)
        self.go("2:21:24.29", Write(r0[1:3]), run=0.5)
        self.go("2:21:25.27", Write(r0[3:]), run=0.5)
        step(self, st, 3, "2:21:26.61")
        r1 = eqrow("2x", r"\frac{dx}{dt}", "+", "2y", r"\frac{dy}{dt}", "=", "0", y=-0.3, x=LX, eq=5, size=50)
        r1[1].set_color(PINK); r1[4].set_color(PINK)
        self.go("2:21:28.91", Write(r1[0]), run=0.4)
        self.go("2:21:29.49", Write(r1[1]), run=0.5)
        self.go("2:21:30.45", Write(r1[2:4]), run=0.5)
        self.go("2:21:31.77", Write(r1[4]), run=0.5)
        self.go("2:21:32.75", Write(r1[5:]), run=0.4)

        step(self, st, 4, "2:21:34.51")
        self.go("2:21:36.31", Circumscribe(ly, color=YEL, buff=0.12), run=0.8)
        lx6 = M("x=6", size=46, color=ORG).move_to(x_lab_pos(6))
        self.go("2:21:38.25", ReplacementTransform(lx, lx6), run=0.5)
        r2 = eqrow("y^2", "=", "100-36", "=", "64", y=-1.65, x=1.4, size=50)
        r2[2][4:].set_color(ORG)
        self.go("2:21:39.49", Write(r2[:2]), run=0.4)
        self.go("2:21:40.27", Write(r2[2]), run=0.8)
        self.go("2:21:42.45", Write(r2[3:]), run=0.4)
        ly8 = M("y=8", size=46, color=ORG).move_to(y_lab_pos(6) + RIGHT * 0.33)
        r2b = M("y=8", size=50, color=ORG).next_to(r2, DOWN, buff=0.35).align_to(r2, LEFT)
        self.go("2:21:43.75", Write(r2b), ReplacementTransform(ly, ly8), run=0.5)

        # plug the moment in
        self.go("2:21:44.60", FadeOut(VGroup(r0, r2, r2b)), r1.animate.shift(UP * 1.25), run=0.45)
        r3 = eqrow("2(6)(1)", "+", "2(8)", r"\frac{dy}{dt}", "=", "0", y=-0.4, x=LX, eq=4, size=50)
        r3[0][2].set_color(ORG); r3[0][5].set_color(ORG); r3[2][2].set_color(ORG); r3[3].set_color(PINK)
        self.go("2:21:45.10", Write(r3[0]), run=0.8)
        self.go("2:21:47.00", Write(r3[1:4]), run=0.9)
        self.go("2:21:49.59", Write(r3[4:]), run=0.4)
        r4 = eqrow("12", "+", "16", r"\frac{dy}{dt}", "=", "0", y=-1.75, x=LX, eq=4, size=50)
        r4[3].set_color(PINK)
        self.go("2:21:51.27", Write(r4[:3]), run=0.6)
        self.go("2:21:52.43", Write(r4[3:]), run=0.6)
        r5 = eqrow(r"\frac{dy}{dt}", "=", r"-\frac{12}{16}", y=-3.1, x=LX, size=50)
        r5[0].set_color(PINK)
        self.go("2:21:54.99", Write(r5[:2]), run=0.6)
        self.go("2:21:58.33", Write(r5[2]), run=0.7)


class K23_LadderSense(Shot):
    def body(self):
        self.title("The Ladder", animate=False)
        st = strip(4)
        wg, cm = wall_ground(), corner_mark()
        xt = ValueTracker(6.0)
        lad = always_redraw(lambda: ladder(xt.get_value()))
        fa = always_redraw(lambda: foot_arrow(xt.get_value()))
        ta = always_redraw(lambda: top_arrow(xt.get_value()))
        fl = M(r"1\text{ m/s}", size=40, color=PINK)
        fl.add_updater(lambda m: m.next_to(foot_arrow(xt.get_value()), UP, buff=0.1))
        tq = M("?", size=50, color=PINK).next_to(top_arrow(6), LEFT, buff=0.12)
        l10 = M("10", size=50, color=ORG)
        l10.add_updater(lambda m: m.move_to(ten_pos(xt.get_value())))
        lx6 = M("x=6", size=46, color=ORG).move_to(x_lab_pos(6))
        ly8 = M("y=8", size=46, color=ORG).move_to(y_lab_pos(6) + RIGHT * 0.33)
        r1 = eqrow("2x", r"\frac{dx}{dt}", "+", "2y", r"\frac{dy}{dt}", "=", "0", y=0.95, x=LX, eq=5, size=50)
        r1[1].set_color(PINK); r1[4].set_color(PINK)
        r3 = eqrow("2(6)(1)", "+", "2(8)", r"\frac{dy}{dt}", "=", "0", y=-0.4, x=LX, eq=4, size=50)
        r3[0][2].set_color(ORG); r3[0][5].set_color(ORG); r3[2][2].set_color(ORG); r3[3].set_color(PINK)
        r4 = eqrow("12", "+", "16", r"\frac{dy}{dt}", "=", "0", y=-1.75, x=LX, eq=4, size=50)
        r4[3].set_color(PINK)
        r5 = eqrow(r"\frac{dy}{dt}", "=", r"-\frac{12}{16}", r"=\;", r"-\frac{3}{4}", y=-3.1, x=LX, size=50)
        r5[0].set_color(PINK); r5[4].set_color(GRN)
        self.add(st, wg, cm, lad, fa, ta, fl, tq, l10, lx6, ly8, r1, r3, r4, r5[:3])

        self.go("2:22:00.59", Write(r5[3:]), run=0.7)
        self.go("2:22:01.45", Create(answer_box(r5[4])), run=0.5)
        step(self, st, 5, "2:22:02.00")
        rate = VGroup(M("0.75", size=40, color=PINK), M(r"\text{m/s}", size=34, color=PINK)).arrange(DOWN, buff=0.08)
        rate.next_to(top_arrow(6), LEFT, buff=0.1)
        self.go("2:22:04.35", ReplacementTransform(tq, rate), run=0.6)
        self.go("2:22:06.81", Circumscribe(r5[4][0], color=YEL, buff=0.08), run=0.7)
        # y really does shrink as the foot slides out
        yl = always_redraw(lambda: digits(f2(np.sqrt(100 - xt.get_value() ** 2)), 44, ORG).move_to(
            y_lab_pos(xt.get_value()) + RIGHT * 0.86))
        ylab = M("y=", size=46, color=ORG)
        ylab.add_updater(lambda m: m.next_to(yl, LEFT, buff=0.08))
        self.go("2:22:07.60", FadeOut(rate), FadeOut(lx6), FadeOut(ly8), FadeIn(ylab), FadeIn(yl), run=0.35)
        self.go("2:22:08.00", xt.animate.set_value(8.0), run=2.0, rate_func=linear)


# ---------------------------------------------------------------- the cone

def cone_rows():
    know = M(r"\frac{dV}{dt}", "=", r"2\ \text{m}^3\text{/min}", size=54, color=PINK).move_to([1.2, 0.85, 0], aligned_edge=LEFT)
    want = M(r"\frac{dh}{dt}", "=", "?", r"\text{ when }", "h=4", size=54, color=PINK).move_to([1.2, -0.65, 0], aligned_edge=LEFT)
    want[3].set_color(CHALK); want[4].set_color(ORG)
    return know, want, kw("know", know), kw("want", want)


class K23_Cone(Shot):
    def body(self):
        self.title("The Cone", "2:22:12.43")
        st = strip()
        self.go("2:22:13.10", FadeIn(st, shift=DOWN * 0.1), run=0.5)
        tank = cone_tank()
        self.go("2:22:18.50", Create(tank), run=1.0)
        L = cone_labels(4.0)
        self.go("2:22:23.69", Create(L["dim"][0]), FadeIn(L["dim"][1]), run=0.6)
        self.go("2:22:25.40", Create(L["rad"][0]), run=0.4)
        self.go("2:22:26.39", FadeIn(L["rad"][1]), run=0.3)

        Vt = ValueTracker(PI * 1.0 / 12)
        wat = always_redraw(lambda: water(h_of_V(Vt.get_value())))
        ty = AY + 10 * CS
        pour = always_redraw(lambda: Line([CX, ty + 0.45, 0], [CX, AY + h_of_V(Vt.get_value()) * CS, 0],
                                          color=BLUE, stroke_width=4))
        know, want, k1, k2 = cone_rows()
        self.go("2:22:27.90", FadeIn(wat), Create(pour), Write(know), run=0.6)
        hl = M("h", "=", size=50).move_to([1.2, -0.8, 0], aligned_edge=LEFT)
        hn = live(hl, lambda: h_of_V(Vt.get_value()), f2, r"\text{m}", CHALK, 50)
        self.go("2:22:28.60", FadeIn(hl), FadeIn(hn), run=0.3)
        self.go("2:22:29.00", Vt.animate.set_value(PI * 64 / 12), run=5.1, rate_func=linear)   # steady inflow
        self.go("2:22:34.15", FadeOut(pour), Circumscribe(VGroup(hl, hn), color=ORG, buff=0.12), run=0.8)

        step(self, st, 0, "2:22:35.77")
        self.go("2:22:36.30", FadeOut(hl), FadeOut(hn), Create(L["h"][0]), FadeIn(L["h"][1]), run=0.5)
        self.go("2:22:38.31", Create(L["r"][0]), FadeIn(L["r"][1]), run=0.5)
        step(self, st, 1, "2:22:40.69")
        self.go("2:22:41.20", FadeIn(k1, shift=RIGHT * 0.1), run=0.4)
        self.go("2:22:43.70", FadeIn(k2, shift=RIGHT * 0.1), run=0.4)
        self.go("2:22:44.11", Write(want[:3]), run=0.6)
        self.go("2:22:45.20", Write(want[3:]), run=0.7)


def cone_state(sc, now):
    st = strip(now)
    L = cone_labels(4.0)
    g = VGroup(cone_tank(), water(4.0), *L.values())
    sc.add(st, g)
    return st, g, L


VX = 1.1   # '=' column for the cone algebra


class K23_ConeSimilar(Shot):
    def body(self):
        self.title("The Cone", animate=False)
        st, g, L = cone_state(self, 1)
        know, want, k1, k2 = cone_rows()
        self.add(know, want, k1, k2)

        step(self, st, 2, "2:22:47.35")
        self.go("2:22:47.80", FadeOut(VGroup(know, want, k1, k2)), run=0.4)
        r0 = eqrow("V", "=", r"\frac{1}{3}\pi", "r^2", "h", y=0.85, x=VX, size=58)
        self.go("2:22:48.77", Write(r0), run=1.2)
        self.go("2:22:54.01", r0[3].animate.set_color(YEL), run=0.3)
        self.go("2:22:54.33", r0[4].animate.set_color(YEL), run=0.3)
        ul = under(r0[4], GRN)
        self.go("2:22:55.87", Create(ul), run=0.4)
        ring = Ellipse(width=r0[3].width + 0.28, height=r0[3].height + 0.3, color=RED, stroke_width=4).move_to(r0[3])
        self.go("2:22:58.60", Create(ring), run=0.5)

        # similar triangles: the water cone is the tank cone, scaled down
        ty, R = AY + 10 * CS, 5 * CS
        A = np.array([CX, AY, 0])
        big = Polygon(A, [CX, ty, 0], [CX + R, ty, 0], color=YEL, stroke_width=6)
        ys, r = AY + 4 * CS, 2 * CS
        small = Polygon(A, [CX, ys, 0], [CX + r, ys, 0], color=YEL, stroke_width=6, fill_color=YEL, fill_opacity=0.15)
        self.go("2:23:01.23", Create(big), run=0.8)
        self.go("2:23:03.17", FadeIn(small), run=0.5)
        ghost = small.copy().set_fill(opacity=0)
        self.go("2:23:04.43", ghost.animate.scale(2.5, about_point=A), run=1.2)
        self.go("2:23:05.80", FadeOut(ghost), run=0.3)
        r1 = eqrow(r"\frac{r}{h}", "=", r"\frac{5}{10}", "=", r"\frac{1}{2}", y=-0.75, x=VX, size=58)
        r1[2].set_color(ORG)
        self.go("2:23:08.33", Write(r1[2]), run=0.8)
        self.go("2:23:11.97", Write(r1[3:]), run=0.5)
        self.go("2:23:13.63", Write(r1[:2]), run=0.6)
        r2 = eqrow("r", "=", r"\frac{h}{2}", y=-2.55, x=VX, size=64)
        r2.set_color(YEL)
        bx = box(r2, YEL, buff=0.2)
        self.go("2:23:15.25", Write(r2), run=0.6)
        self.go("2:23:16.10", Create(bx), run=0.4)
        rb = VGroup(r2, bx)
        self.go("2:23:16.80", FadeOut(VGroup(r1, big, small, ring, ul)), r0[3:].animate.set_color(CHALK),
                rb.animate.scale(0.8).move_to([6.0, 0.85, 0]), run=0.6)


def r_box():
    r2 = M("r", "=", r"\frac{h}{2}", size=64, color=YEL)
    return VGroup(r2, box(r2, YEL, buff=0.2)).scale(0.8).move_to([6.0, 0.85, 0])


class K23_ConeSolve(Shot):
    def body(self):
        self.title("The Cone", animate=False)
        st, g, L = cone_state(self, 2)
        rb = r_box()
        r0 = eqrow("V", "=", r"\frac{1}{3}\pi", "r^2", "h", y=0.85, x=VX, size=58)
        self.add(rb, r0)

        r1 = eqrow("V", "=", r"\frac{1}{3}\pi", r"\left(\frac{h}{2}\right)^2", "h", y=-0.75, x=VX, size=58)
        self.go("2:23:17.60", Circumscribe(r0[3], color=YEL, buff=0.08), run=0.7)
        self.go("2:23:19.37", Write(r1[:3]), run=0.7)
        self.go("2:23:21.75", TransformFromCopy(rb[0][2], r1[3]), run=0.8)
        self.go("2:23:23.15", Write(r1[4]), run=0.4)
        r2 = eqrow("V", "=", r"\frac{1}{3}\pi", r"\cdot\frac{h^2}{4}", r"\cdot h", y=-2.35, x=VX, size=58)
        self.go("2:23:25.19", Write(r2[:3]), run=0.6)
        self.go("2:23:26.45", Write(r2[3]), run=0.7)
        self.go("2:23:27.93", Write(r2[4]), run=0.4)
        r3 = eqrow("V", "=", r"\frac{\pi h^3}{12}", y=-2.35, x=VX, size=58)
        self.go("2:23:28.60", FadeOut(VGroup(r0, r1)), r2.animate.shift(UP * 3.2), run=0.6)
        self.go("2:23:29.77", Write(r3), run=0.9)
        u3 = under(r3, YEL)
        self.go("2:23:31.30", Create(u3), run=0.4)

        step(self, st, 3, "2:23:33.01")
        self.go("2:23:33.50", FadeOut(VGroup(r2, u3)), r3.animate.shift(UP * 3.2), run=0.6)
        r4 = eqrow(r"\frac{dV}{dt}", "=", r"\frac{3\pi h^2}{12}", r"\frac{dh}{dt}", y=-0.75, x=VX, size=58)
        r4[0].set_color(PINK); r4[3].set_color(PINK)
        self.go("2:23:34.83", Write(r4[:2]), run=0.6)
        self.go("2:23:36.61", Write(r4[2]), run=1.0)
        self.go("2:23:39.09", Write(r4[3]), run=0.5)
        r4b = eqrow(r"\frac{dV}{dt}", "=", r"\frac{\pi h^2}{4}", r"\frac{dh}{dt}", y=-0.75, x=VX, size=58)
        r4b[0].set_color(PINK); r4b[3].set_color(PINK)
        self.go("2:23:41.41", TransformMatchingTex(r4, r4b), run=0.9)

        step(self, st, 4, "2:23:46.31")
        h4 = M("h=4", size=46, color=ORG).move_to(L["h"][1].get_center() + LEFT * 1.05)
        self.go("2:23:46.85", FadeOut(r3), r4b.animate.shift(UP * 1.6), ReplacementTransform(L["h"][1], h4), run=0.5)
        r5 = eqrow("2", "=", r"\frac{\pi\cdot 16}{4}", r"\frac{dh}{dt}", y=-0.75, x=VX, size=58)
        r5[0].set_color(ORG); r5[2][2:4].set_color(ORG); r5[3].set_color(PINK)
        self.go("2:23:47.43", Write(r5[:2]), run=0.4)
        self.go("2:23:48.13", Write(r5[2]), run=1.0)
        self.go("2:23:50.11", Write(r5[3]), run=0.5)
        r6 = eqrow("2", "=", r"4\pi", r"\frac{dh}{dt}", y=-2.35, x=VX, size=58)
        r6[0].set_color(ORG); r6[3].set_color(PINK)
        self.go("2:23:52.57", Write(r6), run=0.9)
