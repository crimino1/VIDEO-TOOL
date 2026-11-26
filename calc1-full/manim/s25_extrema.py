"""Builder 25: start of Chapter 9 "Max, Min and Curve Sketching".
What the derivatives say about a graph's shape (up / down / hills / valleys / bends) and the chapter road map;
absolute vs local max and min on one curve that becomes a chalk mountain range (every peak and valley marked,
the tallest one the absolute max, all of them the extrema); the key observation (a live tangent turning flat
on a hill and in a valley, and the |x| corner where there is no single tangent); critical points (f' = 0 or
undefined) with the tangent visiting every peak and valley, infinitely many points narrowed to five;
x^3 (a flat spot that is not a max or min); the extreme value theorem (a walk from a to b, the max at a critical
point, the min at an endpoint); the closed interval method in three steps and the worked example
f = x^3 - 3x^2 + 1 on [-1, 4] (table filling in, points on the graph, max 17 at the endpoint x = 4, min -3 twice);
the x^(2/3) cusp; Rolle's theorem (ball thrown up, x^2 - 4x on [0, 4]); the mean value theorem (secant and a
tangent sliding until parallel); the toll booths 150 km apart.
Colours: graphs BLUE, slopes / tangents / derivatives PINK, f'' PURP, example numbers and points ORG,
absolute (key) YEL, answers GRN, undefined RED.

END SEAM (K25_Toll at 2:37:36.64), for builder 26:
  title "Toll Booths". Road: two CHALK edge lines y=-0.9 and y=-2.5 from x=-6.8 to 6.8 (width 4), a DIM dashed
  centre line at y=-1.7. Two booths standing on the top edge (y=-0.9), centred at x=-4.6 and x=4.6: box 0.9 wide,
  1.2 tall (y -0.9..0.3), a roof line 1.2 wide at y=0.42, a window 0.5 x 0.36 at y=-0.1, and a barrier straight
  across the top lane at the booth's x, from y=-0.9 down to y=-1.65 (CHALK, width 7, three short RED stripes). A YEL brace over the
  gap between the booths at y=0.75 with "150 km" (M, size 56, YEL) above it at y≈1.4. No car yet."""
from common import *


def A(s):
    """Film time: 2:30:00 plus s seconds."""
    return 9000.0 + s


# ---------------------------------------------------------------- the maths of this section, checked once

def gs(x, m, s):
    return np.exp(-((x - m) / s) ** 2 / 2)


def mt(x):
    """The mountain range: three peaks (the middle one tallest), two valleys (the right one lowest)."""
    return 1.6 + 1.5 * gs(x, 1.9, 0.85) + 3.1 * gs(x, 5.4, 0.95) + 2.0 * gs(x, 9.0, 0.85) - 0.9 * gs(x, 7.25, 0.6) - 0.3 * gs(x, 3.6, 0.6)


def crit(f, a, b, n=1500):
    """Every x in (a, b) where the slope changes sign, found by bisection."""
    xs, out = np.linspace(a, b, n), []
    for x0, x1 in zip(xs[:-1], xs[1:]):
        if slope(f, x0) * slope(f, x1) < 0:
            for _ in range(60):
                m = (x0 + x1) / 2
                if slope(f, x0) * slope(f, m) <= 0:
                    x1 = m
                else:
                    x0 = m
            out.append((x0 + x1) / 2)
    return out


MX = crit(mt, 0.2, 10.8)          # peak, valley, TALLEST peak, LOWEST valley, peak
assert len(MX) == 5
_h = [mt(x) for x in MX]
assert _h[2] == max(_h) and _h[3] == min(_h) and min(mt(0.2), mt(10.8)) > _h[3]


def sh(x):
    return 0.3 * x ** 3 - 1.8 * x


def fx(x):
    return x ** 3 - 3 * x ** 2 + 1


assert [fx(x) for x in (-1, 0, 2, 4)] == [-3, 1, -3, 17]
assert -1 - 3 + 1 == -3 and 8 - 12 + 1 == -3 and 64 - 48 + 1 == 17 and 3 * 2 * (2 - 2) == 0


def evt(x):
    return 0.8 + 2.4 * gs(x, 3.2, 0.9) + 0.25 * (x - 1)


EVT_C = crit(evt, 1.0, 5.0)
assert len(EVT_C) == 1 and evt(1) < evt(5) < evt(EVT_C[0]) and slope(evt, 1.0) > 0


def cusp(x):
    return np.cbrt(x) ** 2


def rol(x):
    return 1.2 + 0.55 * (x - 0.8) * (4.4 - x) * (1 + 0.15 * (x - 2))


ROL_C = crit(rol, 0.8, 4.4)
assert len(ROL_C) == 1 and abs(rol(0.8) - rol(4.4)) < 1e-12


def rx(x):
    return x ** 2 - 4 * x


assert rx(0) == 0 and rx(4) == 16 - 16 == 0 and 2 * 2 - 4 == 0 and 0 < 2 < 4


def hb(t):
    return 4 * t * (2 - t)


def mv(x):
    return 0.25 * x ** 3 - 1.2 * x ** 2 + 1.9 * x + 0.6


MV_A, MV_B = 0.3, 4.2
MV_S = (mv(MV_B) - mv(MV_A)) / (MV_B - MV_A)
MV_C = max(crit(lambda x: mv(x) - MV_S * x, MV_A, MV_B))
assert MV_A < MV_C < MV_B and abs(slope(mv, MV_C) - MV_S) < 1e-6 and f"{MV_S:.1f}" == "1.2"


# ---------------------------------------------------------------- local helpers

def at_eq(line, i, x, y):
    line.shift(RIGHT * (x - line[i].get_x()) + UP * (y - line[i].get_y()))
    return line


def col(m, cs):
    for k, c in cs.items():
        m[k].set_color(c)
    return m


def unclock(*ms):
    for m in ms:
        for x in m.get_family():
            x.clear_updaters()


def live_in(scene, *mobs, run=0.4):
    st = [m.copy() for m in mobs]
    unclock(*st)
    scene.play(*[FadeIn(s) for s in st], run_time=run)
    scene.remove(*st)
    scene.add(*mobs)


def arr(a, b, color, w=5, tip=0.2):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, color=color, stroke_width=w, tip_length=tip,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


_DG = {}


def digits(s, size=44, color=CHALK):
    """A number from cached glyphs (no new LaTeX per frame); the minus sits at mid-height."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.035, aligned_edge=DOWN)
    ref = next((x for x, ch in zip(g, s) if ch.isdigit()), None)
    for x, ch in zip(g, s):
        if ch in "-+" and ref is not None:
            x.set_y(ref.get_y())
    return g


def fmt1(v):
    """Slope readout: anything under 0.05 in size is a clean 0.0 (never "-0.0")."""
    return "0.0" if abs(v) < 0.05 else f"{v:.1f}"


assert fmt1(-1e-9) == "0.0" and fmt1(-1.26) == "-1.3" and fmt1(6.75) == "6.8"


def ltan(ax, f, xt, length=1.6, color=PINK, pos=None, size=42, label=r"\text{slope} ="):
    """Sliding tangent + touching dot (+ a 'slope = 0.0' readout at pos) that follow ValueTracker xt."""
    g = VGroup(always_redraw(lambda: tangent(ax, f, xt.get_value(), length, color)),
               always_redraw(lambda: pt(ax, xt.get_value(), f(xt.get_value()), color)))
    if pos is not None:
        lab = M(label, size=size, color=color).move_to(pos)
        num = always_redraw(lambda: digits(fmt1(slope(f, xt.get_value())), size, color).next_to(lab, RIGHT, buff=0.15))
        g.add(lab, num)
    return g


def along(ax, f, x0, x1, off=0.35, color=PINK):
    """Straight arrow beside the graph from x0 to x1, pushed off the curve to the left of travel."""
    p, q = np.array(ax.c2p(x0, f(x0))), np.array(ax.c2p(x1, f(x1)))
    d = (q - p) / np.linalg.norm(q - p)
    n = np.array([-d[1], d[0], 0])
    return arr(p + n * off, q + n * off, color)


def snowcap(ax, f, xp, w=0.6, depth=(0, 0.3, 0.12, 0.36, 0.12, 0.3, 0)):
    """Chalk snow line on a peak: an open zigzag just below the curve's top."""
    bot = [np.array(ax.c2p(x, f(x))) + DOWN * d for x, d in zip(np.linspace(xp + w, xp - w, len(depth)), depth)]
    return VMobject(stroke_color=CHALK, stroke_width=3).set_points_as_corners(bot)


def num_badge(n, color=YEL):
    c = Circle(radius=0.3, stroke_color=color, stroke_width=4)
    return VGroup(c, M(str(n), size=44, color=color).move_to(c))


def hand():
    """An open palm seen from the side: a shallow cup."""
    cup = Arc(radius=0.42, start_angle=PI + 0.35, angle=PI - 0.7, color=CHALK, stroke_width=5)
    thumb = Line(cup.get_start(), cup.get_start() + UP * 0.12 + LEFT * 0.05, color=CHALK, stroke_width=5)
    return VGroup(cup, thumb)


def chalk_ball(p, r=0.16):
    return Circle(radius=r, stroke_color=CHALK, stroke_width=4, fill_color=CHALK, fill_opacity=0.3).move_to(p).set_z_index(8)


def booth(x, y=-0.9):
    bx = Rectangle(width=0.9, height=1.2, stroke_color=CHALK, stroke_width=4).move_to([x, y + 0.6, 0])
    roof = Line([x - 0.6, y + 1.32, 0], [x + 0.6, y + 1.32, 0], color=CHALK, stroke_width=5)
    posts = VGroup(Line([x - 0.45, y + 1.2, 0], [x - 0.45, y + 1.32, 0], color=CHALK, stroke_width=4),
                   Line([x + 0.45, y + 1.2, 0], [x + 0.45, y + 1.32, 0], color=CHALK, stroke_width=4))
    win = Rectangle(width=0.5, height=0.36, stroke_color=DIM, stroke_width=3).move_to([x, y + 0.8, 0])
    arm = Line([x, y, 0], [x, y - 0.75, 0], color=CHALK, stroke_width=7)       # barrier across the top lane
    stripes = VGroup(*[Line([x, y - k, 0], [x, y - k - 0.13, 0], color=RED, stroke_width=7) for k in (0.1, 0.34, 0.58)])
    return VGroup(bx, roof, posts, win, arm, stripes)


# ---------------------------------------------------------------- shared boards

def mountain_board():
    ax = axes((0, 11, 1), (0, 5.5, 1), x_length=12.4, y_length=4.4, center=(0, -0.55, 0), nums=False)
    return ax, curve(ax, mt, [0.2, 10.8])


def ex_header():
    h = M("f(x)", "=", "x^3-3x^2+1", r"\quad", r"[-1,\,4]", size=58)
    col(h, {0: BLUE, 2: BLUE, 4: ORG})
    return h.move_to([0, 1.75, 0])


TCOL = (-6.0, -3.75, -1.25)          # table columns: x | working | f(x)
TROW = (0.85, 0.0, -0.9, -1.8, -2.7)  # header, then the four rows
EX_X = (-1, 0, 2, 4)
EX_WORK = ("-1-3+1", "0-0+1", "8-12+1", "64-48+1")
EX_VAL = ("-3", "1", "-3", "17")


def ex_table():
    frame = VGroup(Line([-5.45, 1.25, 0], [-5.45, -3.1, 0], color=CHALK, stroke_width=3),
                   Line([-2.15, 1.25, 0], [-2.15, -3.1, 0], color=CHALK, stroke_width=3),
                   Line([-6.6, 0.45, 0], [-0.3, 0.45, 0], color=CHALK, stroke_width=3))
    head = VGroup(M("x", size=50).move_to([TCOL[0], TROW[0], 0]), H("plug in", 38, DIM).move_to([TCOL[1], TROW[0], 0]),
                  M("f(x)", size=50, color=BLUE).move_to([TCOL[2], TROW[0], 0]))
    xs = [M(f"{v}", size=50, color=ORG).move_to([TCOL[0], TROW[i + 1], 0]) for i, v in enumerate(EX_X)]
    ws = [M(s, size=48, color=DIM).move_to([TCOL[1], TROW[i + 1], 0]) for i, s in enumerate(EX_WORK)]
    vs = [M(s, size=52).move_to([TCOL[2], TROW[i + 1], 0]) for i, s in enumerate(EX_VAL)]
    return frame, head, xs, ws, vs


def ex_axes():
    return axes((-2, 4.6, 1), (-4, 20, 4), x_length=5.2, y_length=4.2, center=(3.75, -1.3, 0), num_size=28)


# ================================================================ the shape of a graph

class K25_Shape(Shot):
    def body(self):
        self.title("The Shape of a Graph", A(34.6))
        ax = axes((-3.5, 3.5, 1), (-4.5, 4.5, 1), x_length=9.4, y_length=4.5, center=(0, -0.7, 0), nums=False)
        c = curve(ax, sh, [-3.1, 3.1])
        self.go(A(36.17), Create(ax), FadeIn(ax.labels), run=0.6)
        self.go(A(38.07), draw(c, 1.4, BLUE), run=1.4)

        up = along(ax, sh, -3.0, -1.85)
        upl = M("f'>0", size=46, color=PINK).next_to(up, LEFT, buff=0.15)
        dn = along(ax, sh, -0.95, 0.95)
        dnl = M("f'<0", size=46, color=PINK).next_to(dn.get_center(), UR, buff=0.3)
        self.go(A(43.91), GrowArrow(up), FadeIn(upl, shift=RIGHT * 0.1), run=0.6)
        self.go(A(45.01), GrowArrow(dn), FadeIn(dnl, shift=LEFT * 0.1), run=0.6)

        r2 = np.sqrt(2)
        hp, vp = pt(ax, -r2, sh(-r2)), pt(ax, r2, sh(r2))
        hl = H("hill", 38, ORG).next_to(hp, UP, buff=0.22)
        vl = H("valley", 38, ORG).next_to(vp, DOWN, buff=0.22)
        self.go(A(46.49), FadeIn(hp, scale=0.5), Write(hl), run=0.5)
        self.go(A(46.97), FadeIn(vp, scale=0.5), Write(vl), run=0.5)

        cap = Arc(radius=0.5, start_angle=PI / 6, angle=2 * PI / 3, color=PURP, stroke_width=5).move_to(hp.get_center() + DOWN * 0.72)
        cup = Arc(radius=0.5, start_angle=PI + PI / 6, angle=2 * PI / 3, color=PURP, stroke_width=5).move_to(vp.get_center() + UP * 0.72)
        f2 = M("f''", size=46, color=PURP).next_to(cup, UR, buff=0.05)
        self.go(A(48.45), Create(cap), Create(cup), run=0.7)
        self.go(A(49.2), FadeIn(f2, shift=DOWN * 0.1), run=0.4)
        self.go(A(51.85), Circumscribe(upl, color=YEL, buff=0.1), Circumscribe(dnl, color=YEL, buff=0.1),
                Circumscribe(f2, color=YEL, buff=0.1), run=1.0)

        # the road map of the chapter
        self.wipe(A(54.2))
        cx = (-4.4, 0.0, 4.4)
        ip = ParametricFunction(lambda t: np.array([t, 0.55 * np.sin(2.2 * t), 0]), t_range=[-1.3, 1.3], color=BLUE, stroke_width=5)
        ip.move_to([cx[0], 0.45, 0])
        tp = PI / 4.4
        i1 = VGroup(ip, Dot([cx[0] + tp, 0.45 + 0.55, 0], radius=0.09, color=ORG),
                    Dot([cx[0] - tp, 0.45 - 0.55, 0], radius=0.09, color=ORG))
        i2 = M("f'(c)=0", size=54, color=PINK).move_to([cx[1], 0.45, 0])
        i3 = ParametricFunction(lambda t: np.array([t, 0.28 * t ** 3 - 0.8 * t, 0]), t_range=[-1.5, 1.5], color=BLUE, stroke_width=5)
        i3.move_to([cx[2], 0.45, 0])
        labs = [H(s, 42, YEL).move_to([x, -1.0, 0]) for s, x in zip(("max and min", "two theorems", "sketching graphs"), cx)]
        self.go(A(55.29), draw(ip, 0.7, BLUE), FadeIn(i1[1:], scale=0.5), Write(labs[0]), run=0.8)
        self.go(A(56.99), Write(i2), Write(labs[1]), run=0.8)
        self.go(A(58.97), draw(i3, 0.9, BLUE), Write(labs[2]), run=0.9)
        self.go(A(60.43), *[Create(Underline(l, color=YEL, buff=0.06, stroke_width=3)) for l in labs], run=0.6)


# ================================================================ vocabulary on a mountain range

class K25_Vocab(Shot):
    def body(self):
        self.title("Extreme Values", A(62.09))
        ax, c = mountain_board()
        self.go(A(62.6), Create(ax), FadeIn(ax.labels), run=0.5)
        self.go(A(63.1), draw(c, 1.3, BLUE), run=1.3)
        P = lambda i: ax.c2p(MX[i], mt(MX[i]))

        dmax = Dot(P(2), radius=0.1, color=YEL).set_z_index(6)
        lmax = H("absolute max", 38, YEL).next_to(dmax, UP, buff=0.2)
        self.go(A(64.73), FadeIn(dmax, scale=0.5), Write(lmax), run=0.6)
        hmax = DashedLine(ax.c2p(0, mt(MX[2])), ax.c2p(11, mt(MX[2])), color=YEL, stroke_width=2, dash_length=0.12)
        self.go(A(66.21), Create(hmax), run=1.0)

        dmin = Dot(P(3), radius=0.1, color=YEL).set_z_index(6)
        lmin = H("absolute min", 38, YEL).next_to(dmin, DOWN, buff=0.2)
        self.go(A(72.21), FadeIn(dmin, scale=0.5), Write(lmin), run=0.6)
        hmin = DashedLine(ax.c2p(0, mt(MX[3])), ax.c2p(11, mt(MX[3])), color=YEL, stroke_width=2, dash_length=0.12)
        self.go(A(73.59), Create(hmin), run=1.0)

        dl = Dot(P(0), radius=0.09, color=ORG).set_z_index(6)
        ll = H("local max", 38, ORG).next_to(dl, UP, buff=0.2)
        self.go(A(74.99), FadeIn(dl, scale=0.5), Write(ll), run=0.6)
        x0, x1 = ax.c2p(0.95, 0)[0], ax.c2p(2.85, 0)[0]
        band = Rectangle(width=x1 - x0, height=ax.c2p(0, 5.5)[1] - ax.c2p(0, 0)[1], stroke_width=0, fill_color=YEL,
                         fill_opacity=0.1).move_to([(x0 + x1) / 2, ax.c2p(0, 2.75)[1], 0]).set_z_index(-1)
        self.go(A(77.19), FadeIn(band), run=0.7)
        self.go(A(81.27), Circumscribe(VGroup(dmax, lmax), color=YEL, buff=0.12), run=1.0)
        nb = H("neighborhood", 34, YEL).move_to([(x0 + x1) / 2, ax.c2p(0, 0.45)[1], 0])
        self.go(A(83.6), Write(nb), run=0.6)
        dv = Dot(P(1), radius=0.09, color=ORG).set_z_index(6)
        lv = H("local min", 38, ORG).next_to(dv, DOWN, buff=0.2)
        self.go(A(86.0), FadeOut(hmin), run=0.3)
        self.go(A(86.35), FadeIn(dv, scale=0.5), Write(lv), run=0.6)

        # picture a mountain range
        self.go(A(88.73), *[FadeOut(m) for m in (hmax, band, nb, lmax, lmin, ll, lv, dmax, dmin, dl, dv)],
                ax.animate.set_stroke(opacity=0.35), FadeOut(ax.labels), run=0.5)
        caps = VGroup(*[snowcap(ax, mt, MX[i], w=0.55 if i != 2 else 0.7) for i in (0, 2, 4)])
        self.go(A(89.45), FadeIn(caps, lag_ratio=0.3), run=0.8)

        pks = [Dot(P(i), radius=0.1, color=ORG).set_z_index(6) for i in (0, 2, 4)]
        pls = [H("local max", 36, ORG).next_to(d, UP, buff=0.2) for d in pks]
        self.go(A(90.95), *[FadeIn(d, scale=0.5) for d in pks], *[Write(l) for l in pls], run=0.7)
        vls_d = [Dot(P(i), radius=0.1, color=ORG).set_z_index(6) for i in (1, 3)]
        vls = [H("local min", 36, ORG).next_to(d, DOWN, buff=0.2) for d in vls_d]
        self.go(A(91.9), *[FadeIn(d, scale=0.5) for d in vls_d], *[Write(l) for l in vls], run=0.6)
        top = H("absolute max", 36, YEL).next_to(pks[1], UP, buff=0.2)
        self.go(A(93.0), pks[1].animate.set_color(YEL).scale(1.25), run=0.5)
        self.go(A(94.79), ReplacementTransform(pls[1], top), run=0.6)
        self.go(A(95.3), Circumscribe(VGroup(pks[1], top), color=YEL, buff=0.12), run=0.9)

        ev = VGroup(H("extreme values", 42, YEL), M("=", size=48), H("extrema", 42, YEL)).arrange(RIGHT, buff=0.25).move_to([0, -3.35, 0])
        self.go(A(96.99), *[Circumscribe(d, Circle, color=YEL, buff=0.08) for d in pks + vls_d], run=0.9)
        self.go(A(98.11), Write(ev[0]), run=0.6)
        self.go(A(99.6), Write(ev[1:]), run=0.6)


# ================================================================ flat at hills and valleys, the |x| corner

class K25_Flat(Shot):
    def body(self):
        self.title("Extreme Values", animate=False)
        self.title("How Do We Find Them?", A(101.21))
        ax = axes((0, 11, 1), (0, 5.5, 1), x_length=6.3, y_length=3.4, center=(-3.35, -1.05, 0), nums=False)
        c = curve(ax, mt, [0.2, 10.8])
        self.go(A(102.0), Create(ax), FadeIn(ax.labels), draw(c, 1.0, BLUE), run=1.0)
        xt = ValueTracker(0.45)
        lt = ltan(ax, mt, xt, length=1.4, pos=np.array([-4.0, 1.45, 0]))
        self.at(A(103.6))
        live_in(self, *lt, run=0.4)
        self.play(xt.animate.set_value(MX[0]), run_time=2.2)     # lands flat on "smooth hill"
        hz = H("flat", 38, YEL).next_to(ax.c2p(MX[0], mt(MX[0])), UP, buff=0.35)
        self.go(A(106.75), Write(hz), run=0.5)
        z1 = M("f'=0", size=46, color=PINK).next_to(hz, UP, buff=0.15)
        self.go(A(110.0), Write(z1), run=0.6)
        self.go(A(111.3), FadeOut(hz), FadeOut(z1), run=0.3)
        self.play(xt.animate.set_value(MX[1]), run_time=1.4)     # into the valley on "smooth valley"
        z2 = M("f'=0", size=46, color=PINK).next_to(ax.c2p(MX[1], mt(MX[1])), DOWN, buff=0.35)
        self.go(A(113.1), Write(z2), run=0.5)

        # the sharp point of |x|
        bx = axes((-2, 2, 1), (-1.2, 2.4, 1), x_length=4.6, y_length=3.4, center=(3.6, -1.05, 0), nums=False)
        vl = curve(bx, lambda x: -x, [-2, 0])
        vr = curve(bx, lambda x: x, [0, 2])
        self.go(A(114.0), Create(bx), FadeIn(bx.labels), run=0.5)
        self.go(A(114.55), Create(vl), Create(vr), run=0.5)
        cd = pt(bx, 0, 0, ORG)
        self.go(A(115.1), FadeIn(cd, scale=0.5), run=0.4)
        ab = M("|x|", size=50, color=BLUE).next_to(bx.c2p(2, 2), RIGHT, buff=0.15)
        self.go(A(116.73), Write(ab), run=0.5)
        tl = Line(bx.c2p(-1.6, 1.6), bx.c2p(0.7, -0.7), color=PINK, stroke_width=4)
        tr = Line(bx.c2p(1.6, 1.6), bx.c2p(-0.7, -0.7), color=PINK, stroke_width=4)
        sl = M(r"\text{slope}\ {-1}", size=42, color=PINK).move_to(bx.c2p(-1.5, -0.75))
        sr = M(r"\text{slope}\ {+1}", size=42, color=PINK).move_to(bx.c2p(1.5, -0.75))
        self.go(A(117.8), Create(tl), FadeIn(sl), run=0.6)
        self.play(Create(tr), FadeIn(sr), run_time=0.6)
        und = M(r"f'(0)\ \text{undefined}", size=46, color=RED).move_to([3.6, -3.3, 0])
        self.go(A(118.95), Write(und), run=0.7)
        self.go(A(120.4), FadeOut(tl), FadeOut(tr), FadeOut(sl), FadeOut(sr), run=0.4)
        mn = H("still a min", 38, GRN).next_to(cd, DOWN, buff=0.3).shift(RIGHT * 1.55)
        self.go(A(121.2), cd.animate.set_color(GRN), Write(mn), run=0.6)


# ================================================================ critical points

class K25_Critical(Shot):
    def body(self):
        self.title("How Do We Find Them?", animate=False)
        self.title("Critical Points", A(123.8))
        d = M(r"f'(c)=0", r"\quad\text{or}\quad", r"f'(c)\ \text{undefined}", size=52)
        col(d, {0: PINK, 1: DIM, 2: RED}).move_to([0, 1.75, 0])
        self.go(A(127.2), Write(d[0]), run=0.6)
        self.go(A(128.4), Write(d[1:]), run=0.8)
        db = box(d, YEL, buff=0.18)
        self.go(A(129.7), Create(db), run=0.5)

        ax = axes((0, 11, 1), (0, 5.5, 1), x_length=11.6, y_length=2.95, center=(0, -1.95, 0), nums=False)
        c = curve(ax, mt, [0.2, 10.8])
        self.go(A(131.0), Create(ax), FadeIn(ax.labels), draw(c, 1.0, BLUE), run=1.0)
        fact = M(r"\text{local max / min}", r"\ \Rightarrow\ ", r"\text{critical point}", size=48)
        col(fact, {0: ORG, 2: YEL}).move_to([-1.6, 0.75, 0])
        self.go(A(133.21), Write(fact[0]), run=0.6)
        self.go(A(135.8), Write(fact[1:]), run=0.6)
        xt = ValueTracker(0.45)
        lt = ltan(ax, mt, xt, length=1.3, pos=np.array([3.85, 0.75, 0]), size=40)
        self.at(A(136.6))
        live_in(self, *lt, run=0.3)
        dots = []
        for i, x in enumerate(MX):
            self.play(xt.animate.set_value(x), run_time=0.75 if i else 0.6)
            dd = pt(ax, x, mt(x), ORG, r=0.1)
            dots.append(dd)
            self.add(dd)
            self.wait(0.1)
        unclock(*lt)
        self.go(A(142.4), FadeOut(lt), run=0.4)
        many = VGroup(*[Dot(ax.c2p(x, mt(x)), radius=0.05, color=CHALK).set_opacity(0.85)
                        for x in np.linspace(0.35, 10.65, 48)])
        self.go(A(144.0), FadeIn(many, lag_ratio=0.03), run=0.8)
        self.go(A(145.7), FadeOut(many), run=0.5)
        self.play(*[Circumscribe(x, Circle, color=YEL, buff=0.08) for x in dots], run_time=0.8)


# ================================================================ x^3: a critical point that is not a max or min

class K25_Cubed(Shot):
    def body(self):
        self.title("Critical Points", animate=False)
        self.title("Be Careful", A(147.4))
        no = M(r"\text{critical point}", r"\ \not\Rightarrow\ ", r"\text{max / min}", size=50)
        col(no, {0: YEL, 1: RED, 2: ORG}).move_to([0, 0.4, 0])
        self.go(A(149.9), Write(no), run=0.9)
        self.go(A(153.2), FadeOut(no, shift=UP * 0.2), run=0.3)

        r0 = at_eq(col(M("f(x)", "=", "x^3", size=56), {0: BLUE, 2: BLUE}), 1, -3.6, 1.3)
        r1 = at_eq(col(M("f'(x)", "=", "3x^2", size=56), {0: PINK, 2: PINK}), 1, -3.6, 0.25)
        r2 = at_eq(M("f'(0)", "=", "0", size=56), 1, -3.6, -0.8)
        col(r2, {0: PINK, 2: YEL})
        ax = axes((-2, 2, 1), (-4, 4, 2), x_length=4.8, y_length=4.8, center=(3.4, -0.75, 0), num_size=28)
        c = curve(ax, lambda x: x ** 3, [-1.58, 1.58])
        self.go(A(153.6), Write(r0), Create(ax), FadeIn(ax.labels), draw(c, 0.9, BLUE), run=0.9)
        self.go(A(154.85), Write(r1[0:2]), run=0.4)
        self.go(A(155.63), Write(r1[2]), run=0.6)
        xt = ValueTracker(-1.45)
        lt = ltan(ax, lambda x: x ** 3, xt, length=1.6, pos=np.array([-4.3, -2.2, 0]), size=44)
        self.at(A(156.25))
        live_in(self, *lt, run=0.3)
        self.play(xt.animate.set_value(0.0), run_time=1.6)
        self.go(A(158.2), Write(r2), run=0.6)
        cp = H("critical point", 38, YEL).next_to(r2, RIGHT, buff=0.4)
        self.go(A(160.33), Write(cp), run=0.6)
        nh = H("no hill,\nno valley", 38, RED).move_to([4.75, -1.95, 0])
        self.go(A(162.3), Write(nh), run=0.7)
        self.go(A(164.9), xt.animate.set_value(1.45), run=2.4)
        unclock(*lt)
        self.go(A(167.7), FadeOut(lt), FadeOut(nh), run=0.3)
        cand = pill("candidates", YEL, size=44).move_to([-3.6, -2.3, 0])
        self.go(A(168.9), FadeIn(cand, shift=UP * 0.1), run=0.5)
        chk = H("check each one", 38, DIM).next_to(cand, DOWN, buff=0.3)
        self.go(A(170.7), Write(chk), run=0.6)


# ================================================================ the extreme value theorem

class K25_EVT(Shot):
    def body(self):
        self.title("Be Careful", animate=False)
        self.title("A Guarantee", A(172.0))
        ax = axes((0, 6, 1), (0, 4, 1), x_length=8.0, y_length=3.6, center=(0, -1.25, 0), nums=False)
        self.go(A(174.4), Create(ax), FadeIn(ax.labels), run=0.6)
        self.title("Extreme Value Theorem", A(177.9))
        st = M(r"\text{continuous on }[a,b]", r"\ \Rightarrow\ ", r"\text{absolute max and min}", size=46)
        col(st, {0: BLUE, 2: YEL}).move_to([0, 1.65, 0])
        c = curve(ax, evt, [1, 5])
        self.go(A(180.9), Write(st[0]), draw(c, 1.0, BLUE), run=1.0)
        br = VGroup(M("[", size=64, color=YEL).move_to(ax.c2p(1, 0)), M("]", size=64, color=YEL).move_to(ax.c2p(5, 0)))
        self.go(A(182.1), FadeIn(br), run=0.5)
        ea, eb = pt(ax, 1, evt(1), ORG, r=0.1), pt(ax, 5, evt(5), ORG, r=0.1)
        self.go(A(184.2), FadeIn(ea, scale=0.5), FadeIn(eb, scale=0.5), run=0.5)
        la = M("a", size=46, color=ORG).next_to(ax.c2p(1, 0), DOWN, buff=0.28)
        lb = M("b", size=46, color=ORG).next_to(ax.c2p(5, 0), DOWN, buff=0.28)
        self.go(A(185.6), Write(la), run=0.3)
        self.go(A(186.0), Write(lb), run=0.3)
        self.go(A(187.4), Write(st[1]), run=0.4)
        xc = EVT_C[0]
        dmx = Dot(ax.c2p(xc, evt(xc)), radius=0.1, color=YEL).set_z_index(6)
        mxl = H("max", 38, YEL).next_to(dmx, UP, buff=0.2)
        self.go(A(188.45), Write(st[2]), FadeIn(dmx, scale=0.5), Write(mxl), run=0.9)
        mnl = H("min", 38, YEL).next_to(ea, LEFT, buff=0.25)
        self.go(A(190.3), ea.animate.set_color(YEL), Write(mnl), run=0.5)

        # a walk from a to b without teleporting
        you = Dot(ax.c2p(1, evt(1)), radius=0.13, color=CHALK).set_z_index(8)
        self.go(A(192.9), FadeIn(you, scale=0.5), run=0.3)
        self.play(MoveAlongPath(you, c.copy()), run_time=3.4, rate_func=linear)
        self.go(A(196.6), FadeOut(you), run=0.3)
        self.go(A(199.6), Circumscribe(VGroup(dmx, mxl), color=YEL, buff=0.12), run=0.9)
        self.go(A(202.0), Circumscribe(VGroup(ea, mnl), color=YEL, buff=0.12), run=0.9)
        flat = tangent(ax, evt, xc, length=1.4)
        n1 = note("critical point", dmx, RIGHT, color=PINK, size=36, dist=0.95, angle=-0.4)
        self.go(A(205.6), Create(flat), FadeIn(n1), run=0.6)
        n2 = H("endpoint", 36, ORG).next_to(ea, RIGHT, buff=0.3).shift(DOWN * 0.35)
        self.go(A(207.4), Write(n2), Circumscribe(ea, Circle, color=ORG, buff=0.1),
                Circumscribe(eb, Circle, color=ORG, buff=0.1), run=0.8)


# ================================================================ the closed interval method

class K25_Method(Shot):
    def body(self):
        self.title("Extreme Value Theorem", animate=False)
        nl = Line([-3, 0.2, 0], [3, 0.2, 0], color=BLUE, stroke_width=6)
        ends = VGroup(Dot([-3, 0.2, 0], radius=0.13, color=ORG), Dot([3, 0.2, 0], radius=0.13, color=ORG))
        labs = VGroup(M("a", size=50, color=ORG).next_to(ends[0], DOWN, buff=0.25), M("b", size=50, color=ORG).next_to(ends[1], DOWN, buff=0.25))
        self.go(A(209.9), Create(nl), FadeIn(ends, scale=0.5), FadeIn(labs), run=0.7)
        self.go(A(213.1), *[Circumscribe(e, Circle, color=YEL, buff=0.1) for e in ends], run=0.8)
        self.title("Closed Interval Method", A(215.6))
        self.go(A(216.6), FadeOut(VGroup(nl, ends, labs)), run=0.4)

        X = -5.6
        rows = [
            TX(r"critical points inside $[a,b]$", size=48),
            TX(r"plug in: \ $f(\text{critical pts})$, \ $f(a)$, \ $f(b)$", size=48),
            TX(r"biggest $=$ absolute max", size=48),
            TX(r"smallest $=$ absolute min", size=48),
        ]
        Y = (1.25, 0.05, -1.15, -2.05)
        badges = [num_badge(i + 1).move_to([X, Y[i], 0]) for i in range(3)]
        for r, y in zip(rows, Y):
            r.move_to([X + 0.65, y, 0], aligned_edge=LEFT)
        rows[0][0][0:14].set_color(PINK)
        rows[2][0][0:7].set_color(GRN)
        rows[3][0][0:8].set_color(GRN)
        self.go(A(217.57), FadeIn(badges[0], scale=0.8), run=0.4)
        self.go(A(218.45), Write(rows[0]), run=1.0)
        self.go(A(221.27), FadeIn(badges[1], scale=0.8), run=0.4)
        self.go(A(222.37), Write(rows[1]), run=1.2)
        self.go(A(227.55), FadeIn(badges[2], scale=0.8), run=0.4)
        self.go(A(228.67), Write(rows[2]), run=0.9)
        self.go(A(231.5), Write(rows[3]), run=0.9)
        ul = brush_line(rows[3].width + 0.4, color=YEL, center=rows[3].get_bottom() + DOWN * 0.15)
        nt = H("no tests, just compare", 38, YEL).move_to([2.6, -3.2, 0])
        self.go(A(235.0), Write(nt), run=0.8)
        self.go(A(236.5), Create(ul), run=0.6)


# ================================================================ worked example: the critical points

class K25_Example(Shot):
    def body(self):
        self.title("Closed Interval Method", animate=False)
        self.title("Worked Example", A(238.0))
        h = ex_header()
        self.go(A(241.5), Write(h[0:3]), run=1.2)
        self.go(A(246.35), Write(h[3:]), run=0.7)

        r1 = at_eq(col(M("f'(x)", "=", "3x^2-6x", size=56), {0: PINK, 2: PINK}), 1, -1.0, 0.65)
        r2 = at_eq(M("=", "3x(x-2)", size=56), 0, -1.0, -0.35)
        r3 = at_eq(M("x", "=", "0", r"\quad\text{or}\quad", "x", "=", "2", size=56), 1, -1.0, -1.35)
        col(r3, {2: ORG, 3: DIM, 6: ORG})
        self.go(A(248.55), Write(r1[0:2]), run=0.5)
        self.go(A(249.85), Write(r1[2]), run=0.8)
        self.go(A(253.45), Write(r2), run=0.8)
        self.go(A(256.2), Write(r3[0:3]), run=0.5)
        self.go(A(257.95), Write(r3[3:]), run=0.6)

        nl = number_line((-2, 5, 1), length=8.0, center=(0, -2.7, 0))
        ends = VGroup(M("[", size=50, color=YEL).move_to(nl.n2p(-1)), M("]", size=50, color=YEL).move_to(nl.n2p(4)))
        for k in (1, 6):
            nl.labels[k].set_color(YEL).shift(DOWN * 0.15)
        seg = Line(nl.n2p(-1), nl.n2p(4), color=YEL, stroke_width=6)
        self.go(A(259.2), Create(nl), FadeIn(nl.labels), run=0.5)
        self.play(Create(seg), FadeIn(ends), run_time=0.5)
        d0, d2 = Dot(nl.n2p(0), radius=0.11, color=ORG).set_z_index(5), Dot(nl.n2p(2), radius=0.11, color=ORG).set_z_index(5)
        self.go(A(260.2), TransformFromCopy(r3[2], d0), TransformFromCopy(r3[6], d2), run=0.7)
        ks = VGroup(tick_mark(GRN, 0.4).next_to(d0, UP, buff=0.2), tick_mark(GRN, 0.4).next_to(d2, UP, buff=0.2))
        self.go(A(261.2), Create(ks), run=0.5)


# ================================================================ worked example: the value table

class K25_Table(Shot):
    def body(self):
        self.title("Worked Example", animate=False)
        h = ex_header()
        self.add(h)
        frame, head, xs, ws, vs = ex_table()
        ax = ex_axes()
        self.go(A(262.3), Create(frame), FadeIn(head), Create(ax), FadeIn(ax.labels), run=0.8)
        T = [(265.83, 267.45, 270.37), (271.69, 273.35, 273.67), (274.73, 276.49, 279.43), (280.83, 282.51, 286.01)]
        for i, (tx, tw, tv) in enumerate(T):
            self.go(A(tx), Write(xs[i]), run=0.4)
            self.go(A(tw), Write(ws[i]), run=0.9 if i != 1 else 0.3)
            p = pt(ax, EX_X[i], fx(EX_X[i]), ORG, r=0.1)
            self.go(A(tv), Write(vs[i]), FadeIn(p, scale=0.5), run=0.5)


# ================================================================ worked example: who wins

class K25_Winners(Shot):
    def body(self):
        self.title("Worked Example", animate=False)
        frame, head, xs, ws, vs = ex_table()
        ax = ex_axes()
        ps = [pt(ax, x, fx(x), ORG, r=0.1) for x in EX_X]
        self.add(ex_header(), frame, head, *xs, *ws, *vs, ax, ax.labels, *ps)
        c = curve(ax, fx, [-1, 4])
        self.go(A(287.3), draw(c, 1.0, BLUE), run=1.0)
        b17 = answer_box(vs[3])
        self.go(A(288.2), Create(b17), ps[3].animate.set_color(GRN).scale(1.3), run=0.6)
        mx = H("absolute max", 36, GRN).move_to([0, 0.88, 0]).align_to(np.array([6.65, 0, 0]), RIGHT)
        self.go(A(291.1), Write(mx), run=0.6)
        ep = H("an endpoint", 36, YEL).next_to(ps[3], LEFT, buff=0.3)
        self.go(A(293.25), Write(ep), Circumscribe(xs[3], Circle, color=YEL, buff=0.1), run=0.8)
        self.go(A(296.9), Circumscribe(xs[0], Circle, color=YEL, buff=0.1), Circumscribe(xs[3], Circle, color=YEL, buff=0.1), run=0.8)
        bm = VGroup(answer_box(vs[0]), answer_box(vs[2]))
        self.go(A(298.85), Create(bm), run=0.6)
        self.go(A(302.05), ps[0].animate.set_color(GRN).scale(1.3), Circumscribe(xs[0], Circle, color=GRN, buff=0.1), run=0.5)
        self.go(A(304.3), ps[2].animate.set_color(GRN).scale(1.3), Circumscribe(xs[2], Circle, color=GRN, buff=0.1), run=0.5)
        lvl = DashedLine(ps[0].get_center(), ps[2].get_center(), color=GRN, stroke_width=3, dash_length=0.1)
        self.go(A(305.4), Create(lvl), run=0.6)
        mn = H("absolute min", 36, GRN).next_to(ps[0], LEFT, buff=0.25).shift(DOWN * 0.25)
        self.go(A(306.55), Write(mn), run=0.6)


# ================================================================ the x^(2/3) cusp

class K25_Cusp(Shot):
    def body(self):
        self.title("Worked Example", animate=False)
        self.title("When f' Does Not Exist", A(310.7))
        EX = -3.5
        r0 = at_eq(col(M("f(x)", "=", "x^{2/3}", size=56), {0: BLUE, 2: BLUE}), 1, EX, 1.45)
        r1 = at_eq(col(M("f'(x)", "=", r"\tfrac{2}{3}\,x^{-1/3}", size=56), {0: PINK, 2: PINK}), 1, EX, 0.35)
        r2 = at_eq(col(M("=", r"\frac{2}{3\sqrt[3]{x}}", size=56), {1: PINK}), 0, EX, -0.95)
        r3 = at_eq(M(r"x=0:", r"\ \ \frac{2}{0}", size=56), 0, EX - 1.2, -2.2)
        col(r3, {0: ORG, 1: RED})
        self.go(A(314.4), Write(r0), run=0.8)
        self.go(A(317.55), Write(r1[0:2]), run=0.4)
        self.go(A(318.4), Write(r1[2]), run=1.0)
        self.go(A(321.1), Write(r2), run=0.9)
        self.go(A(324.35), Write(r3[0]), run=0.5)
        self.go(A(326.0), Write(r3[1]), run=0.5)
        und = H("undefined", 40, RED).next_to(r3, RIGHT, buff=0.35)
        self.go(A(327.7), Write(und), run=0.6)
        cp = pill("critical point", YEL, size=40).move_to([EX, -3.4, 0])
        self.go(A(330.6), FadeIn(cp, shift=UP * 0.1), run=0.5)

        ax = axes((-2, 2, 1), (-0.5, 2, 1), x_length=5.4, y_length=3.6, center=(3.6, -0.9, 0), num_size=28)
        cl = curve(ax, cusp, [-2, 0])
        cr = curve(ax, cusp, [0, 2])
        self.go(A(332.9), Create(ax), FadeIn(ax.labels), run=0.5)
        self.go(A(333.45), Create(cl), run=0.6)
        self.play(Create(cr), run_time=0.6)
        o = pt(ax, 0, 0, ORG, r=0.1)
        self.go(A(334.85), FadeIn(o, scale=0.5), run=0.4)
        nc = note("cusp", o, np.array([-1, 0.3, 0]), color=YEL, size=40, dist=1.0, angle=-0.5)
        self.go(A(336.9), FadeIn(nc), run=0.5)
        self.go(A(338.95), o.animate.set_color(GRN).scale(1.25), run=0.5)
        mn = H("minimum", 38, GRN).next_to(o, DOWN, buff=0.3).shift(RIGHT * 1.35)
        self.go(A(340.6), Write(mn), run=0.6)
        # the tangent gets steeper and steeper as it nears the cusp: no flat tangent there
        ut = ValueTracker(np.cbrt(1.6))
        st = always_redraw(lambda: tangent(ax, cusp, ut.get_value() ** 3, 1.6))
        self.at(A(341.5))
        live_in(self, st, run=0.3)
        self.play(ut.animate.set_value(0.12), run_time=1.2)
        unclock(st)
        self.play(FadeOut(st), run_time=0.25)
        ut2 = ValueTracker(-np.cbrt(1.6))
        st2 = always_redraw(lambda: tangent(ax, cusp, ut2.get_value() ** 3, 1.6))
        live_in(self, st2, run=0.2)
        self.play(ut2.animate.set_value(-0.12), run_time=1.0)
        unclock(st2)
        self.play(FadeOut(st2), run_time=0.25)
        self.go(A(344.8), Circumscribe(und, color=RED, buff=0.1), Circumscribe(cp, color=YEL, buff=0.08), run=1.0)


# ================================================================ Rolle's theorem

class K25_Rolle(Shot):
    def body(self):
        self.title("When f' Does Not Exist", animate=False)
        self.title("Two Theorems", A(348.8))
        n1 = H("Rolle's Theorem", 50, YEL).move_to([0, 0.6, 0])
        n2 = H("Mean Value Theorem", 50, YEL).move_to([0, -0.6, 0])
        self.go(A(349.2), Write(n1), run=0.7)
        self.play(Write(n2), run_time=0.7)
        self.go(A(353.3), FadeOut(n2, shift=DOWN * 0.2), FadeOut(n1, shift=UP * 0.3), run=0.4)
        self.title("Rolle's Theorem", animate=False)

        X = -6.4
        c1 = TX(r"continuous on $[a,b]$", size=46).move_to([X, 1.35, 0], aligned_edge=LEFT)
        c2 = TX(r"differentiable on $(a,b)$", size=46).move_to([X, 0.5, 0], aligned_edge=LEFT)
        c3 = M("f(a)", "=", "f(b)", size=52).move_to([X, -0.35, 0], aligned_edge=LEFT)
        col(c3, {0: ORG, 2: ORG})
        cc = M(r"\Rightarrow\ ", "f'(c)=0", size=56).move_to([X, -1.55, 0], aligned_edge=LEFT)
        cc[1].set_color(PINK)
        sc = TX(r"for some $c$ in $(a,b)$", size=42, color=DIM).next_to(cc, DOWN, buff=0.25).align_to(cc, LEFT)

        ax = axes((0, 5, 1), (0, 4, 1), x_length=5.4, y_length=3.8, center=(3.65, -0.85, 0), nums=False)
        c = curve(ax, rol, [0.8, 4.4])
        self.go(A(355.4), Create(ax), FadeIn(ax.labels), run=0.5)
        self.go(A(356.0), Write(c1), draw(c, 1.0, BLUE), run=1.0)
        la = M("a", size=44, color=ORG).next_to(ax.c2p(0.8, 0), DOWN, buff=0.15)
        lb = M("b", size=44, color=ORG).next_to(ax.c2p(4.4, 0), DOWN, buff=0.15)
        self.go(A(358.0), FadeIn(la), run=0.3)
        self.go(A(358.4), FadeIn(lb), run=0.3)
        self.go(A(359.2), Write(c2), run=0.8)
        ea, eb = pt(ax, 0.8, rol(0.8), ORG, r=0.1), pt(ax, 4.4, rol(4.4), ORG, r=0.1)
        self.go(A(361.15), Write(c3), FadeIn(ea, scale=0.5), FadeIn(eb, scale=0.5), run=0.8)
        lv = DashedLine(ea.get_center(), eb.get_center(), color=ORG, stroke_width=3, dash_length=0.1)
        self.play(Create(lv), run_time=0.5)
        self.go(A(363.3), Write(cc[0]), run=0.4)
        xc = ROL_C[0]
        tg = tangent(ax, rol, xc, length=1.8)
        dc = pt(ax, xc, rol(xc), PINK, r=0.1)
        drop = DashedLine(ax.c2p(xc, rol(xc)), ax.c2p(xc, 0), color=PINK, stroke_width=3, dash_length=0.08)
        lc = M("c", size=44, color=PINK).next_to(ax.c2p(xc, 0), DOWN, buff=0.15)
        self.go(A(365.85), Create(drop), FadeIn(lc), FadeIn(dc, scale=0.5), Write(sc), run=0.6)
        self.go(A(366.95), Create(tg), Write(cc[1]), run=0.7)
        self.go(A(370.35), Circumscribe(ea, Circle, color=YEL, buff=0.1), Circumscribe(eb, Circle, color=YEL, buff=0.1), run=0.9)
        you = Dot(ea.get_center(), radius=0.12, color=CHALK).set_z_index(8)
        self.go(A(372.55), FadeIn(you, scale=0.5), run=0.2)
        self.play(MoveAlongPath(you, c.copy()), run_time=2.6, rate_func=linear)
        self.play(FadeOut(you), run_time=0.2)
        self.go(A(376.0), Circumscribe(VGroup(tg, cc[1]), color=YEL, buff=0.1), run=0.9)


# ================================================================ a ball thrown up and caught

class K25_Ball(Shot):
    def body(self):
        self.title("Rolle's Theorem", animate=False)
        self.title("A Ball Thrown Up", A(377.15))
        GY, S = -2.6, 0.9          # hand height, 1 m = 0.9 screen
        TX0 = -4.2
        hd = hand().move_to([TX0, GY - 0.45, 0])
        track = DashedLine([TX0, GY + 0.2, 0], [TX0, GY + 4 * S + 0.2, 0], color=FAINT, stroke_width=2, dash_length=0.1)
        ax = axes((0, 2.2, 1), (0, 4.6, 1), x_length=4.6, y_length=4.6 * S, center=(2.6, GY + 4.6 * S / 2 + 0.16, 0),
                  x_label="t", y_label="h", num_size=28)
        self.play(Create(hd), Create(track), Create(ax), FadeIn(ax.labels), run_time=0.4)
        tt = ValueTracker(0.0)
        ball = always_redraw(lambda: chalk_ball([TX0, GY + 0.16 + hb(tt.get_value()) * S, 0]))

        def varrow():
            v = 8 - 8 * tt.get_value()
            p = np.array([TX0 + 0.45, GY + 0.16 + hb(tt.get_value()) * S, 0])
            if abs(v) < 0.6:
                return VGroup()
            return arr(p, p + UP * v * 0.13, PINK, w=5)
        va = always_redraw(varrow)
        trace = always_redraw(lambda: curve(ax, hb, [0, max(tt.get_value(), 1e-3)]))
        gd = always_redraw(lambda: pt(ax, tt.get_value(), hb(tt.get_value()), ORG))
        self.add(trace, ball, va, gd)
        self.play(tt.animate.set_value(2.0), run_time=3.3, rate_func=linear)
        unclock(ball, va, trace, gd)
        self.remove(va)
        ghost = DashedVMobject(Circle(radius=0.16, color=CHALK, stroke_width=3), num_dashes=10).move_to([TX0, GY + 0.16 + 4 * S, 0])
        self.go(A(381.7), FadeIn(ghost), run=0.4)
        tg = tangent(ax, hb, 1.0, length=1.6)
        pk = pt(ax, 1, 4, PINK)
        self.go(A(382.55), Create(tg), FadeIn(pk, scale=0.5), run=0.6)
        v0 = M("v=0", size=50, color=PINK).next_to(ghost, RIGHT, buff=0.35)
        self.go(A(384.5), Write(v0), run=0.6)


# ================================================================ Rolle's theorem example

class K25_RolleEx(Shot):
    def body(self):
        self.title("A Ball Thrown Up", animate=False)
        self.title("A Rolle Example", A(386.3))
        EX = -3.7
        r0 = M("f(x)", "=", "x^2-4x", r"\quad", r"[0,\,4]", size=54)
        col(r0, {0: BLUE, 2: BLUE, 4: ORG})
        at_eq(r0, 1, EX, 1.6)
        r1 = at_eq(M("f(0)", "=", "0", size=54), 1, EX, 0.65)
        r2 = at_eq(M("f(4)", "=", "16-16", "=", "0", size=54), 1, EX, -0.3)
        r3 = at_eq(col(M("f'(x)", "=", "2x-4", size=54), {0: PINK, 2: PINK}), 1, EX, -1.3)
        r4 = at_eq(M("x", "=", "2", r"\qquad", "0<2<4", size=54), 1, EX, -2.3)
        col(r4, {2: PINK, 4: GRN})
        ax = axes((-1, 5, 1), (-6, 2, 2), x_length=5.0, y_length=4.2, center=(4.15, -0.95, 0), num_size=28)
        c = curve(ax, rx, [-0.2, 4.2])
        self.go(A(387.3), Write(r0[0:3]), Create(ax), FadeIn(ax.labels), run=0.9)
        self.play(draw(c, 0.8, BLUE), run_time=0.8)
        self.go(A(390.7), Write(r0[3:]), run=0.6)
        p0, p4 = pt(ax, 0, 0, ORG, r=0.1), pt(ax, 4, 0, ORG, r=0.1)
        self.go(A(392.75), Write(r1), FadeIn(p0, scale=0.5), run=0.7)
        self.go(A(394.25), Write(r2[0:3]), FadeIn(p4, scale=0.5), run=0.8)
        self.go(A(397.05), Write(r2[3:]), run=0.4)
        lvl = DashedLine(p0.get_center(), p4.get_center(), color=YEL, stroke_width=4, dash_length=0.12)
        sh_ = H("same height", 38, YEL).next_to(lvl, UP, buff=0.18)
        self.go(A(398.25), Create(lvl), Write(sh_), run=0.7)
        self.go(A(403.15), Write(r3[0:2]), run=0.4)
        self.go(A(404.3), Write(r3[2]), run=0.7)
        tg = tangent(ax, rx, 2.0, length=1.8)
        pv = pt(ax, 2, -4, PINK, r=0.1)
        self.go(A(406.45), Write(r4[0:3]), Create(tg), FadeIn(pv, scale=0.5), run=0.7)
        self.go(A(408.3), Write(r4[4]), run=0.8)
        self.go(A(410.0), Create(answer_box(r4[4])), run=0.5)
        cl = M("c=2", size=46, color=PINK).next_to(pv, DOWN, buff=0.25)
        self.go(A(411.0), Write(cl), Circumscribe(VGroup(tg, pv), color=YEL, buff=0.1), run=0.8)


# ================================================================ the mean value theorem

class K25_MVT(Shot):
    def body(self):
        self.title("A Rolle Example", animate=False)
        self.title("The Second Theorem", A(412.5))
        self.title("Mean Value Theorem", A(415.2))
        self.go(A(417.6), Circumscribe(self.head[0], color=YEL, buff=0.12), run=1.0)
        X = -6.4
        c1 = TX(r"continuous on $[a,b]$", size=46).move_to([X, 1.35, 0], aligned_edge=LEFT)
        c2 = TX(r"differentiable on $(a,b)$", size=46).move_to([X, 0.5, 0], aligned_edge=LEFT)
        self.go(A(421.4), Write(c1), run=0.8)
        self.go(A(424.7), Write(c2), run=0.8)
        w = VGroup(H("instant rate", 40, PINK), M("=", size=50), H("average rate", 40, ORG)).arrange(RIGHT, buff=0.2)
        w.move_to([X, -0.75, 0], aligned_edge=LEFT)
        self.go(A(429.35), Write(w[0]), run=0.6)
        self.go(A(430.7), Write(w[1]), run=0.3)
        self.go(A(431.75), Write(w[2]), run=0.6)
        eq = M("f'(c)", "=", r"\frac{f(b)-f(a)}{b-a}", size=58).move_to([X, -0.9, 0], aligned_edge=LEFT)
        col(eq, {0: PINK, 2: ORG})
        self.go(A(434.6), ReplacementTransform(w[0], eq[0]), ReplacementTransform(w[1], eq[1]), run=0.7)
        self.go(A(436.15), ReplacementTransform(w[2], eq[2]), run=1.2)
        self.go(A(439.4), Create(box(eq, YEL, buff=0.18)), run=0.5)

        ax = axes((0, 4.5, 1), (0, 6.5, 1), x_length=5.2, y_length=3.9, center=(3.75, -0.95, 0), nums=False)
        c = curve(ax, mv, [MV_A, MV_B])
        self.go(A(440.3), Create(ax), FadeIn(ax.labels), run=0.5)
        self.go(A(440.95), draw(c, 0.8, BLUE), run=0.8)
        ea, eb = pt(ax, MV_A, mv(MV_A), ORG, r=0.1), pt(ax, MV_B, mv(MV_B), ORG, r=0.1)
        sec_ = Line(ea.get_center(), eb.get_center(), color=ORG, stroke_width=4)
        self.go(A(441.75), FadeIn(ea, scale=0.5), FadeIn(eb, scale=0.5), run=0.4)
        self.go(A(442.1), Create(sec_), run=1.0)
        sl = M(r"\text{secant} =", f"{MV_S:.1f}", size=42, color=ORG).move_to(ax.c2p(1.5, 5.9))
        self.go(A(443.5), FadeIn(sl), run=0.4)
        xt = ValueTracker(1.0)
        lt = ltan(ax, mv, xt, length=1.8, pos=ax.c2p(1.25, 5.1), size=42, label=r"\text{tangent} =")
        lt[2].align_to(sl[0], RIGHT)
        self.at(A(444.75))
        live_in(self, *lt, run=0.3)
        self.play(xt.animate.set_value(MV_C), run_time=2.9)
        unclock(*lt)
        lc = M("c", size=44, color=PINK).next_to(ax.c2p(MV_C, 0), DOWN, buff=0.15)
        drop = DashedLine(ax.c2p(MV_C, mv(MV_C)), ax.c2p(MV_C, 0), color=PINK, stroke_width=3, dash_length=0.08)
        self.go(A(448.05), Create(drop), FadeIn(lc), run=0.5)
        par = H("parallel", 38, YEL).move_to(ax.c2p(3.75, 1.0))
        self.go(A(448.6), Write(par), run=0.5)


# ================================================================ the toll booth story begins

class K25_Toll(Shot):
    def body(self):
        self.title("Mean Value Theorem", animate=False)
        self.title("Toll Booths", A(449.6))
        road = VGroup(Line([-6.8, -0.9, 0], [6.8, -0.9, 0], color=CHALK, stroke_width=4),
                      Line([-6.8, -2.5, 0], [6.8, -2.5, 0], color=CHALK, stroke_width=4))
        mid = DashedLine([-6.8, -1.7, 0], [6.8, -1.7, 0], color=DIM, stroke_width=3, dash_length=0.3)
        self.go(A(450.1), Create(road), Create(mid), run=1.0)
        b1, b2 = booth(-4.6), booth(4.6)
        self.go(A(453.7), Create(b1), Create(b2), run=0.8)
        br = BraceBetweenPoints([-4.6, 0.75, 0], [4.6, 0.75, 0], direction=UP, color=YEL)
        km = M(r"150\ \text{km}", size=56, color=YEL).next_to(br, UP, buff=0.15)
        self.go(A(454.4), FadeIn(br), Write(km), run=0.8)
