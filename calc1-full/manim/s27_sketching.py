"""Builder 27: end of Chapter 9 "Max, Min and Curve Sketching".
The tail of the worked cubic f = 2x^3 - 3x^2 - 12x + 5 (f(-1) = 12 local max, f(2) = -15 local min, inflection at
x = 1/2; each fact lands on a graph as a dot plus the little frown / cup piece of the curve, then the whole curve);
the six-step sketching checklist with a chalk icon per step; the full sketch of f = x^4 - 4x^3 over six shots that
share one graph (qgraph): intercepts, f' = 4x^2(x - 3) with its sign chart, the flat spot at x = 0 shown by a tangent
sliding through it (slope negative, 0, negative), f(3) = -27 absolute min, f'' = 12x(x - 2) with test values and
cup / frown icons, f(2) = -16, end behaviour, then the curve drawn piece by piece beside a sign table whose column
lights up as the chalk passes; x / (x^2 + 1) with its dashed horizontal asymptote y = 0, quotient rule, sign chart,
f(+-1) = +-1/2 and the wave drawn in three pieces; reading a given graph of f' (= x^2 - 1): one tracker drives a
height bar on f' and the tangent + traced curve of f below, then a tangent on f' for f''; the recap; the teaser.
Colours (matching builder 26): f BLUE, f' and f'' and their signs PINK, inflection marks YEL, points ORG,
key words YEL, answers GRN.
START SEAM: K27_MaxMin opens on K26_FullEx's last board (rebuilt by k26_board(), title "A Full Example") and
re-lays it out in 0.5 s: f moves top-left, f'' and f''(-1) = -18 < 0 slide into the left column, axes fade in.
END SEAM: K27_NextUp ends on "Next: Real Problems" with a max/min curve and the word "optimization"."""
from common import *


# ---------------------------------------------------------------- the maths of this section, checked once

def F1(x):
    return 2 * x ** 3 - 3 * x ** 2 - 12 * x + 5


def Q(x):
    return x ** 4 - 4 * x ** 3


def R(x):
    return x / (x * x + 1)


def FP(x):      # the given graph of f'
    return x * x - 1


def FF(x):      # an f that has that derivative
    return x ** 3 / 3 - x


assert F1(-1) == 12 and F1(2) == -15 and abs(F1(0.5) + 1.5) < 1e-9 and 12 * 0.5 - 6 == 0
assert -2 - 3 + 12 + 5 == 12 and 16 - 12 - 24 + 5 == -15 and 12 * -1 - 6 == -18 and 12 * 2 - 6 == 18
assert Q(3) == -27 and 81 - 108 == -27 and Q(2) == -16 and 16 - 32 == -16 and Q(4) == 0 and Q(0) == 0
for _x in (-1.1, 0.7, 3.3):
    assert abs((4 * _x ** 3 - 12 * _x ** 2) - 4 * _x * _x * (_x - 3)) < 1e-9
    assert abs((12 * _x * _x - 24 * _x) - 12 * _x * (_x - 2)) < 1e-9
    assert abs(_x ** 4 - 4 * _x ** 3 - _x ** 3 * (_x - 4)) < 1e-9
    assert abs(slope(FF, _x) - FP(_x)) < 1e-6
    assert abs(slope(R, _x) - (1 - _x * _x) / (_x * _x + 1) ** 2) < 1e-6
assert 12 * -1 * -3 == 36 and 12 * 1 * -1 == -12 and 12 * 3 * 1 == 36
assert R(1) == 0.5 and R(-1) == -0.5


# ---------------------------------------------------------------- local helpers

LX = -3.4                      # centre of the left (algebra) column
HY = 1.05                      # step header row
ROW = [0.2, -0.7, -1.6, -2.5, -3.4]


def at_eq(line, i, x, y):
    """Put line so that its part i (the '=') sits at column x, row y."""
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
    """Fade in always_redraw objects: fade a frozen copy, then swap in the live ones."""
    st = [m.copy() for m in mobs]
    unclock(*st)
    scene.play(*[FadeIn(s) for s in st], run_time=run)
    scene.remove(*st)
    scene.add(*mobs)


def live_out(scene, *mobs, run=0.4):
    st = [m.copy() for m in mobs]
    unclock(*st)
    scene.remove(*mobs)
    scene.add(*st)
    scene.play(*[FadeOut(s) for s in st], run_time=run)


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
        if ch == "-" and ref is not None:
            x.set_y(ref.get_y())
    return g


def fmt(v):
    v = 0.0 if abs(v) < 0.05 else v
    return f"{v:.1f}"


assert fmt(-0.01) == "0.0" and fmt(-5.18) == "-5.2" and fmt(1.6) == "1.6"


def readout(tex, fn, pos, color, size=44):
    lab = M(tex, size=size, color=color).move_to(pos)
    num = always_redraw(lambda: digits(fmt(fn()), size, color).next_to(lab, RIGHT, buff=0.15))
    return VGroup(lab, num)


def plot(ax, f, a, b, color=BLUE, width=5, step=0.01):
    """One smooth chalk curve piece (explicit sample step, so short pieces stay curved)."""
    return ax.plot(f, x_range=[a, b, step], color=color, stroke_width=width)


def bowl(up=True, w=0.62, h=0.3, color=BLUE, sw=5):
    """Little cup (up=True) or frown icon."""
    t = np.linspace(-1, 1, 25)
    y = t ** 2 if up else -t ** 2
    return VMobject(stroke_color=color, stroke_width=sw).set_points_smoothly(
        np.column_stack([t * w / 2, y * h, 0 * t])).center()


def shape_icon(inc, up, w=0.75, h=0.45, color=BLUE, sw=5):
    """Half a parabola: going down or up, bending like a cup or a frown."""
    if up:
        t = np.linspace(0, 1, 15) if inc else np.linspace(-1, 0, 15)
        y = t ** 2
    else:
        t = np.linspace(-1, 0, 15) if inc else np.linspace(0, 1, 15)
        y = -t ** 2
    return VMobject(stroke_color=color, stroke_width=sw).set_points_smoothly(
        np.column_stack([t * w, y * h, 0 * t])).center()


def dir_arrow(c, inc, color=PINK, s=0.24):
    c = np.array(c, float)
    a, b = (c + [-s, -s, 0], c + [s, s, 0]) if inc else (c + [-s, s, 0], c + [s, -s, 0])
    return Arrow(a, b, buff=0, color=color, stroke_width=5, tip_length=0.16,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


def arr(a, b, color, w=5, tip=0.18):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, color=color, stroke_width=w, tip_length=tip,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


def sign_line(name, color, crits, y, x0=-5.6, x1=-0.6, crit_color=ORG):
    """A sign chart: name, line, critical ticks + labels. slots: x of each interval's middle."""
    line = Line([x0, y, 0], [x1, y, 0], color=DIM, stroke_width=3)
    n = len(crits)
    xs = [x0 + (x1 - x0) * (k + 1) / (n + 1) for k in range(n)]
    ticks = VGroup(*[Line([x, y + 0.14, 0], [x, y - 0.14, 0], color=DIM, stroke_width=3) for x in xs])
    labs = VGroup(*[M(c, size=40, color=crit_color).next_to([x, y - 0.14, 0], DOWN, buff=0.12) for c, x in zip(crits, xs)])
    nm = M(name, size=50, color=color).next_to(line, LEFT, buff=0.3)
    edges = [x0] + xs + [x1]
    return dict(g=VGroup(nm, line, ticks, labs), nm=nm, labs=labs, xs=xs, y=y,
                mids=[(edges[i] + edges[i + 1]) / 2 for i in range(n + 1)])


def signs(ch, strs, color, size=72):
    return [M(s, size=size, color=color).move_to([x, ch["y"] + 0.42, 0]) for s, x in zip(strs, ch["mids"])]


def plab(tex, size=34, color=ORG):
    return M(tex, size=size, color=color)


def header(s, color=YEL):
    return H(s, 42, color).move_to([LX, HY, 0])


def mini_curve(c, f, a, b, sx=1.0, sy=1.0, color=BLUE, sw=5, n=40):
    c = np.array(c, float)
    t = np.linspace(a, b, n)
    return VMobject(stroke_color=color, stroke_width=sw).set_points_smoothly(
        np.column_stack([c[0] + t * sx, c[1] + f(t) * sy, 0 * t]))


def mini_axes(c, w=1.5, h=0.7):
    c = np.array(c, float)
    return VGroup(Line(c + [-w, 0, 0], c + [w, 0, 0], color=DIM, stroke_width=3),
                  Line(c + [0, -h, 0], c + [0, h, 0], color=DIM, stroke_width=3))


# ---------------------------------------------------------------- the worked cubic graph

def cubic_graph():
    ax = axes((-3, 4, 1), (-20, 20, 10), 6.3, 5.4, (3.3, -0.7, 0), nums=False)
    nl = VGroup(M("-1", size=30, color=FAINT).next_to(ax.c2p(-1, 0), DOWN, buff=0.12),
                *[M(str(v), size=30, color=FAINT).next_to(ax.c2p(v, 0), UP, buff=0.12) for v in (1, 2, 3)])
    return ax, VGroup(ax, ax.labels, nl)


# ---------------------------------------------------------------- the x^4 - 4x^3 board, shared by six shots

def qgraph():
    ax = axes((-2, 5, 1), (-30, 20, 10), 6.3, 5.6, (3.35, -0.75, 0), nums=False)
    nl = VGroup()
    for v, d in ((-1, DOWN), (1, UP), (2, UP), (3, UP), (4, DR)):
        nl.add(M(str(v), size=30, color=FAINT).next_to(ax.c2p(v, 0), d, buff=0.12))
    for v in (10, -10, -20):
        nl.add(M(str(v), size=30, color=FAINT).next_to(ax.c2p(0, v), LEFT, buff=0.12))
    g = dict(ax=ax, base=VGroup(ax, ax.labels, nl))
    g["o"], g["four"] = pt(ax, 0, 0), pt(ax, 4, 0)
    tri = lambda x, c: Triangle(color=c, fill_color=c, fill_opacity=1, stroke_width=0).scale(0.09).move_to(
        ax.c2p(x, 0) + DOWN * 0.24)
    g["c0"], g["c3"] = tri(0, PINK), tri(3, PINK)
    g["flat"] = plot(ax, Q, -1.2, 1.6)
    g["cupp"] = plot(ax, Q, 2.45, 3.5)
    g["p3"] = pt(ax, 3, -27)
    g["p3l"] = plab(r"(3,\,-27)").move_to(ax.c2p(3, 0)[0] * RIGHT + UP * -3.58)
    g["abs"] = VGroup(H("absolute", 34, GRN), H("min", 34, GRN)).arrange(DOWN, buff=0.02).move_to([6.1, -3.2, 0])
    g["upL"] = arr([0.95, 1.3, 0], [0.72, 2.1, 0], BLUE)
    g["upR"] = arr([5.78, 1.45, 0], [5.98, 2.22, 0], BLUE)
    g["ring"] = Circle(radius=0.17, stroke_color=YEL, stroke_width=4).move_to(ax.c2p(0, 0))
    g["i2"] = tri(2, YEL)
    g["p2"] = pt(ax, 2, -16)
    g["p2l"] = plab(r"(2,\,-16)").next_to(g["p2"], LEFT, buff=0.2)
    g["P"] = [plot(ax, Q, -1.32, 0), plot(ax, Q, 0, 2), plot(ax, Q, 2, 3), plot(ax, Q, 3, 4.18)]
    return g


STAGE = {1: ["o", "four"], 2: ["c0", "c3"], 3: ["flat", "cupp", "p3", "p3l", "abs", "upL", "upR"],
         4: ["ring", "i2"], 5: ["p2", "p2l"]}


def qstate(g, k):
    """The graph with the facts known at the end of stage k."""
    ms = [g["base"]]
    for s in range(1, k + 1):
        ms += [g[n] for n in STAGE[s]]
    return ms


def qform():
    m = M("f(x)", "=", "x^4-4x^3", size=54)
    m[0].set_color(BLUE)
    return m.move_to([LX, 1.95, 0])


def q_intercepts():
    i1 = at_eq(M("f(0)", "=", "0", size=50), 1, -3.0, ROW[0])
    i2 = at_eq(M("x^4-4x^3", "=", "0", size=50), 1, -3.0, ROW[1])
    i3 = at_eq(M("x^3(x-4)", "=", "0", size=50), 1, -3.0, ROW[2])
    i4 = M("x=0", r"\quad\text{or}\quad", "x=4", size=50).move_to([LX, ROW[3], 0])
    col(i4, {0: ORG, 2: ORG})
    return header("Intercepts"), i1, i2, i3, i4


def q_first():
    d1 = at_eq(M("f'(x)", "=", "4x^3-12x^2", size=50), 1, -4.3, ROW[0])
    d1[0].set_color(PINK)
    d2 = at_eq(M("=", "4x^2", "(x-3)", size=50), 0, -4.3, ROW[1])
    d3 = TX(r"critical: $x=0$ and $x=3$", 42).move_to([LX, ROW[2], 0])
    ch = sign_line("f'", PINK, ["0", "3"], -2.75)
    sg = signs(ch, ["-", "-", "+"], PINK)
    ar = [dir_arrow([x, -3.25, 0], inc) for x, inc in zip(ch["mids"], (False, False, True))]
    nn = M(r"4x^2\ge 0", size=50, color=YEL).move_to([LX, ROW[2], 0])
    return dict(h=header("First derivative"), d1=d1, d2=d2, d3=d3, ch=ch, sg=sg, ar=ar, nn=nn)


def q_second():
    s1 = at_eq(M("f''(x)", "=", "12x^2-24x", size=50), 1, -4.0, ROW[0])
    s1[0].set_color(PINK)
    s2 = at_eq(M("=", "12x(x-2)", size=50), 0, -4.0, ROW[1])
    ch = sign_line("f''", PINK, ["0", "2"], -1.95)
    sg = signs(ch, ["+", "-", "+"], PINK)
    bw = [bowl(up).move_to([x, -2.5, 0]) for x, up in zip(ch["mids"], (True, False, True))]
    tests = [M("x=-1", r":\;\;", "12(-1)(-3)", ">0", size=48),
             M("x=1", r":\;\;", "12(1)(-1)", "<0", size=48),
             M("x=3", r":\;\;", "12(3)(1)", ">0", size=48)]
    for t in tests:
        t.move_to([LX, ROW[4], 0])
        t[0].set_color(ORG)
    infl = TX(r"inflection at $x=0$ and $x=2$", 42, color=YEL).move_to([LX, ROW[4], 0])
    return dict(h=header("Second derivative"), s1=s1, s2=s2, ch=ch, sg=sg, bw=bw, tests=tests, infl=infl)


def q_ends_rows():
    e1 = TX(r"$x^4$ dominates", 46).move_to([LX, ROW[0], 0])
    e2 = M(r"x\to\pm\infty", r"\;\Rightarrow\;", r"f(x)\to\infty", size=50).move_to([LX, ROW[1], 0])
    e2[2].set_color(BLUE)
    return header("End behavior"), e1, e2


def q_table():
    """Sign table for the final drawing: rows f', f'', shape; one column per interval."""
    xs = [-5.0, -3.55, -2.1, -0.65]
    ys = dict(head=0.3, fp=-0.5, fpp=-1.3, shape=-2.15)
    heads = VGroup(*[M(s, size=36, color=ORG).move_to([x, ys["head"], 0])
                     for s, x in zip(("x<0", "(0,2)", "(2,3)", "x>3"), xs)])
    names = VGroup(M("f'", size=46, color=PINK).move_to([-6.2, ys["fp"], 0]),
                   M("f''", size=46, color=PINK).move_to([-6.2, ys["fpp"], 0]),
                   H("shape", 34, DIM).move_to([-6.17, ys["shape"], 0]))
    grid = VGroup(Line([-6.6, -0.05, 0], [0.0, -0.05, 0], color=DIM, stroke_width=2),
                  Line([-5.68, 0.6, 0], [-5.68, -2.6, 0], color=DIM, stroke_width=2))
    fp = VGroup(*[M(s, size=60, color=PINK).move_to([x, ys["fp"], 0]) for s, x in zip("---+", xs)])
    fpp = VGroup(*[M(s, size=60, color=PINK).move_to([x, ys["fpp"], 0]) for s, x in zip("+-++", xs)])
    sh = VGroup(*[shape_icon(i, u).move_to([x, ys["shape"], 0])
                  for (i, u), x in zip(((False, True), (False, False), (False, True), (True, True)), xs)])
    boxes = [SurroundingRectangle(VGroup(heads[k], sh[k]), color=YEL, buff=0.14, stroke_width=3, corner_radius=0.08)
             for k in range(4)]
    return dict(all=VGroup(grid, heads, names, fp, fpp, sh), boxes=boxes)


# ================================================================ 1. the worked cubic: max, min, inflection

def k26_board():
    """The last frame of builder 26's K26_FullEx (same positions), so the cut into K27_MaxMin is seamless."""
    r0 = M("f(x)", "=", "2x^3-3x^2-12x+5", size=56).move_to([0, 1.75, 0])
    r0[0].set_color(BLUE)
    tasks = VGroup(pill("critical points", ORG, 36), pill("classify", YEL, 36), pill("inflection", PINK, 36))
    tasks.arrange(RIGHT, buff=0.6).move_to([0, 0.85, 0])
    lx, rx = -3.6, 3.4
    a1 = M("f'(x)", "=", "6x^2-6x-12", size=50)
    a1.shift(RIGHT * (lx - a1[1].get_x()) + UP * (-0.2 - a1[1].get_y()))
    a1[0].set_color(PINK)
    a3 = M("=", "6(x-2)(x+1)", size=50)
    a3.shift(RIGHT * (lx - a3[0].get_x()) + UP * (-1.1 - a3[0].get_y()))
    cp = M("x=-1", r",\quad", "x=2", size=52, color=ORG).move_to([lx - 0.4, -2.2, 0])
    tk = tick_mark(GRN, s=0.45).next_to(tasks[0], LEFT, buff=0.2)
    b1 = M("f''(x)", "=", "12x-6", size=50)
    b1.shift(RIGHT * (rx - b1[1].get_x()) + UP * (-0.2 - b1[1].get_y()))
    b1[0].set_color(PINK)
    b2 = M("f''(-1)", "=", "-18", size=50)
    b2.shift(RIGHT * (rx - b2[1].get_x()) + UP * (-1.1 - b2[1].get_y()))
    b2[0].set_color(PINK)
    b3 = VGroup(M(r"<0", r"\ \Rightarrow\ ", size=50), H("local max", 46, YEL)).arrange(RIGHT, buff=0.2)
    b3.move_to([rx + 0.3, -2.2, 0])
    return dict(r0=r0, tasks=tasks, a1=a1, a3=a3, cp=cp, tk=tk, b1=b1, b2=b2, b3=b3)


class K27_MaxMin(Shot):
    def body(self):
        self.title("A Full Example", animate=False)
        form = M("f(x)", "=", "2x^3-3x^2-12x+5", size=46).move_to([LX, 1.95, 0])
        form[0].set_color(BLUE)
        fpp = M("f''(x)", "=", "12x-6", size=46).move_to([LX, 1.15, 0])
        fpp[0].set_color(PINK)
        ax, base = cubic_graph()
        b1 = M("f''(-1)", "=", "-18", "<", "0", size=50).move_to([LX - 0.45, ROW[0], 0])
        col(b1, {0: PINK, 2: PINK})
        fr = bowl(False).next_to(b1, RIGHT, buff=0.45)
        # START SEAM: K26_FullEx's last board (copied geometry), re-laid out on the first beat
        k = k26_board()
        self.add(*k.values())
        self.play(ReplacementTransform(k["r0"], form), ReplacementTransform(k["b1"], fpp),
                  ReplacementTransform(k["b2"], b1[:3]), ReplacementTransform(k["b3"][0], b1[3:]),
                  FadeOut(VGroup(k["tasks"], k["tk"], k["a1"], k["a3"], k["cp"], k["b3"][1])),
                  FadeIn(base), FadeIn(fr), run_time=0.5)

        b2 = M("f(-1)", "=", "-2-3+12+5", size=50).move_to([LX, ROW[1], 0])
        b3 = at_eq(M("=", "12", size=50), 0, b2[1].get_x(), ROW[2])
        b3[1].set_color(ORG)
        self.go("2:44:37.3", Write(b2[:2]), run=0.5)
        self.go("2:44:38.25", Write(b2[2]), run=1.2)
        self.go("2:44:42.35", Write(b3), run=0.5)
        self.play(Create(answer_box(b3[1])), run_time=0.4)
        # on the graph: the point and the little frown of the curve around it
        pm = pt(ax, -1, 12)
        maxp = plot(ax, F1, -1.7, -0.3)
        lm = plab(r"(-1,\,12)").next_to(pm, UP, buff=0.18)
        tm = H("local max", 34, YEL).next_to(lm, UP, buff=0.08)
        VGroup(lm, tm).shift(LEFT * 0.55)    # clear of the y-axis
        self.go("2:44:43.6", FadeIn(pm, scale=0.5), draw(maxp, 0.9), run=0.9)
        self.go("2:44:44.6", FadeIn(tm, shift=DOWN * 0.1), run=0.5)
        self.go("2:44:45.3", Write(lm), run=0.6)

        # x = 2
        self.wipe("2:44:47.0", keep=(form, fpp, base, pm, maxp, lm, tm))
        c1 = M("f''(2)", "=", "18", ">", "0", size=50).move_to([LX - 0.45, ROW[0], 0])
        col(c1, {0: PINK, 2: PINK})
        cu = bowl(True).next_to(c1, RIGHT, buff=0.45)
        self.go("2:44:47.4", Write(c1[:2]), run=0.6)
        self.go("2:44:49.4", Write(c1[2]), run=0.4)
        self.go("2:44:50.5", Write(c1[3:]), Create(cu), run=0.6)
        c2 = M("f(2)", "=", "16-12-24+5", size=50).move_to([LX, ROW[1], 0])
        c3 = at_eq(M("=", "-15", size=50), 0, c2[1].get_x(), ROW[2])
        c3[1].set_color(ORG)
        self.go("2:44:52.25", Write(c2[:2]), run=0.5)
        self.go("2:44:53.2", Write(c2[2]), run=1.5)
        self.go("2:44:57.05", Write(c3), run=0.5)
        self.play(Create(answer_box(c3[1])), run_time=0.4)
        pn = pt(ax, 2, -15)
        minp = plot(ax, F1, 1.3, 2.7)
        ln = plab(r"(2,\,-15)").next_to(pn, DOWN, buff=0.18)
        tn = H("local min", 34, YEL).next_to(ln, DOWN, buff=0.06)
        self.go("2:44:58.65", FadeIn(pn, scale=0.5), draw(minp, 0.9), run=0.9)
        self.play(FadeIn(tn, shift=UP * 0.1), Write(ln), run_time=0.6)

        # inflection
        self.wipe("2:45:01.75", keep=(form, fpp, base, pm, maxp, lm, tm, pn, minp, ln, tn))
        i1 = M("12x-6", "=", "0", size=50)
        at_eq(i1, 1, -3.4, ROW[0])
        i2 = at_eq(M("x", "=", r"\tfrac12", size=50), 1, -3.4, ROW[1])
        i2[2].set_color(ORG)
        self.go("2:45:02.8", Write(i1), run=0.8)
        self.go("2:45:05.45", Write(i2), run=0.7)
        ch = sign_line("f''", PINK, [r"\tfrac12"], -2.2)
        self.go("2:45:07.35", FadeIn(ch["g"]), run=0.5)
        sg = signs(ch, ["-", "+"], PINK)
        bw = [bowl(False).move_to([ch["mids"][0], -2.9, 0]), bowl(True).move_to([ch["mids"][1], -2.9, 0])]
        self.go("2:45:09.2", FadeIn(sg[0], shift=DOWN * 0.1), FadeIn(bw[0]), run=0.45)
        self.go("2:45:10.15", FadeIn(sg[1], shift=DOWN * 0.1), FadeIn(bw[1]), run=0.45)
        # the whole curve now joins the pieces
        full = plot(ax, F1, -2.4, 3.45)
        pi_ = pt(ax, 0.5, -1.5, color=YEL)
        ni = note("inflection", pi_, DL, color=YEL, size=34, dist=0.45)
        self.go("2:45:11.15", FadeOut(maxp), FadeOut(minp), draw(full, 1.4), run=1.4)
        self.go("2:45:12.6", FadeIn(pi_, scale=0.5), FadeIn(ni), run=0.6)
        self.go("2:45:13.4", Circumscribe(i2[2], color=YEL, stroke_width=3), run=0.9)
        self.wipe("2:45:14.55")


# ================================================================ 2. the checklist

CELLS = [(-3.4, 1.55), (-3.4, -0.45), (-3.4, -2.45), (3.4, 1.55), (3.4, -0.45), (3.4, -2.45)]
NAMES = ["Domain", "Intercepts", "Asymptotes", "First derivative", "Second derivative", "Plot and connect"]


def checklist():
    """Two columns of three: number + name on the left, a small chalk icon on the right (parts drawn in order)."""
    heads, icons = [], []
    for k, ((cx, cy), name) in enumerate(zip(CELLS, NAMES)):
        heads.append(VGroup(H(f"{k + 1}.", 40, YEL), H(name, 38)).arrange(RIGHT, buff=0.18)
                     .move_to([-6.55 if cx < 0 else 0.25, cy, 0], aligned_edge=LEFT))
    c = [np.array([-1.5 if cx < 0 else 5.75, cy, 0]) for cx, cy in CELLS]
    # 1 domain: a curve and the stretch of x it lives over
    nl = Line(c[0] + [-1.5, -0.55, 0], c[0] + [1.5, -0.55, 0], color=DIM, stroke_width=3)
    cv = mini_curve(c[0], lambda t: 0.3 * np.sin(2.2 * t) + 0.15, -1.2, 1.2)
    sh = Line(c[0] + [-1.2, -0.55, 0], c[0] + [1.2, -0.55, 0], color=YEL, stroke_width=8)
    icons.append([nl, cv, sh])
    # 2 intercepts: a line crossing both axes, dots where it crosses
    o2 = c[1] + [0.2, -0.25, 0]
    a2 = mini_axes(o2)
    l2 = Line(o2 + [-1.2, -0.25, 0], o2 + [0.48, 0.8, 0], color=BLUE, stroke_width=5)   # crosses at (-0.8, 0), (0, 0.5)
    d2 = VGroup(Dot(o2 + [-0.8, 0, 0], radius=0.08, color=ORG), Dot(o2 + [0, 0.5, 0], radius=0.08, color=ORG))
    icons.append([a2, l2, d2])
    # 3 asymptotes: dashed lines and a curve that hugs them
    va = DashedLine(c[2] + [0.3, -0.75, 0], c[2] + [0.3, 0.75, 0], color=YEL, stroke_width=3, dash_length=0.08)
    ha = DashedLine(c[2] + [-1.5, 0, 0], c[2] + [1.5, 0, 0], color=YEL, stroke_width=3, dash_length=0.08)
    br = VGroup(mini_curve(c[2], lambda t: 0.09 / (t - 0.3), 0.43, 1.5),
                mini_curve(c[2], lambda t: 0.09 / (t - 0.3), -1.5, 0.17))
    icons.append([va, ha, br])
    # 4 first derivative: a hill, up then down arrows, the top
    hill = mini_curve(c[3], lambda t: 0.45 - 0.42 * t * t, -1.3, 1.3)
    ar4 = VGroup(dir_arrow(c[3] + [-1.15, 0.45, 0], True, s=0.2), dir_arrow(c[3] + [1.15, 0.45, 0], False, s=0.2))
    top = Dot(c[3] + [0, 0.45, 0], radius=0.08, color=ORG)
    icons.append([hill, ar4, top])
    # 5 second derivative: frown then cup, the switch point
    s5 = mini_curve(c[4], lambda t: 0.24 * t ** 3, -1.4, 1.4)
    b5 = VGroup(bowl(False, 0.5, 0.2, color=YEL, sw=4).move_to(c[4] + [-0.95, 0.35, 0]),
                bowl(True, 0.5, 0.2, color=YEL, sw=4).move_to(c[4] + [0.95, -0.35, 0]))
    ip = Dot(c[4], radius=0.08, color=YEL)
    icons.append([s5, b5, ip])
    # 6 plot and connect
    f6 = lambda t: 0.35 * np.sin(1.9 * t) + 0.1 * t
    dots = VGroup(*[Dot(c[5] + [t, f6(t), 0], radius=0.08, color=ORG) for t in (-1.3, -0.8, 0, 0.8, 1.3)])
    c6 = mini_curve(c[5], f6, -1.3, 1.3)
    icons.append([dots, c6])
    for ic, cc in zip(icons, c):
        for p in ic:
            p.scale(0.7, about_point=cc)
    return heads, icons


class K27_Checklist(Shot):
    def body(self):
        self.title("A Full Example", animate=False)   # K27_MaxMin ends on a clean board
        self.title("Sketching a Graph", "2:45:17.8")
        heads, icons = checklist()
        times = [("2:45:22.77", "2:45:23.6", "2:45:24.3", "2:45:25.2"),
                 ("2:45:27.11", "2:45:27.9", "2:45:28.6", "2:45:29.5"),
                 ("2:45:31.01", "2:45:32.33", "2:45:34.75", "2:45:35.69"),
                 ("2:45:38.93", "2:45:40.53", "2:45:42.17", "2:45:44.29"),
                 ("2:45:47.17", "2:45:48.5", "2:45:49.4", "2:45:50.4"),
                 ("2:45:52.29", "2:45:52.69", "2:45:53.73")]
        prev = None
        for k in range(6):
            t = times[k]
            anims = [FadeIn(heads[k], shift=DOWN * 0.1)]
            heads[k][1].set_color(YEL)
            if prev is not None:
                anims.append(prev[1].animate.set_color(CHALK))
            self.go(t[0], *anims, run=0.5)
            prev = heads[k]
            parts = icons[k]
            for j, p in enumerate(parts):
                tt = t[1 + j] if 1 + j < len(t) else None
                if tt is None:
                    break
                if k == 5 and j == 1:
                    self.go(tt, draw(p, 1.6), run=1.6)
                elif isinstance(p, VMobject) and len(p.submobjects) == 0 and not isinstance(p, Dot):
                    self.go(tt, draw(p, 0.8), run=0.8)
                else:
                    self.go(tt, FadeIn(p, scale=0.8) if isinstance(p, Dot) else Create(p), run=0.6)
        self.go("2:45:56.0", prev[1].animate.set_color(CHALK), run=0.4)
        self.wipe("2:45:57.35")


# ================================================================ 3. x^4 - 4x^3: domain and intercepts

class K27_Intercepts(Shot):
    def body(self):
        self.title("Sketching a Graph", animate=False)   # K27_Checklist ends on a clean board
        form = qform()
        g = qgraph()
        self.go("2:45:59.5", Write(form), run=1.0)
        self.go("2:46:01.0", Create(g["ax"]), FadeIn(g["base"][1:]), run=0.9)
        h = header("Domain")
        r1 = TX(r"all real numbers", 46).move_to([LX, ROW[0], 0])
        r2 = H("no asymptotes", 42, DIM).move_to([LX, ROW[1], 0])
        self.go("2:46:03.07", FadeIn(h, shift=DOWN * 0.1), run=0.5)
        self.go("2:46:05.5", Write(r1), run=0.7)
        self.go("2:46:07.4", FadeIn(r2, shift=UP * 0.1), run=0.5)
        hI, i1, i2, i3, i4 = q_intercepts()
        self.go("2:46:09.23", FadeOut(r1), FadeOut(r2), ReplacementTransform(h, hI), run=0.5)
        self.go("2:46:10.4", Write(i1), run=0.8)
        self.go("2:46:12.9", FadeIn(g["o"], scale=0.5), run=0.5)
        self.play(Circumscribe(g["o"], shape=Circle, color=YEL, stroke_width=3), run_time=0.8)
        self.go("2:46:16.0", Write(i2), run=0.8)
        self.go("2:46:17.6", TransformFromCopy(i2, i3), run=0.8)
        self.go("2:46:20.9", Write(i4), run=0.9)
        self.go("2:46:23.1", FadeIn(g["four"], scale=0.5), run=0.4)


# ================================================================ 4. first derivative, critical points, sign chart

class K27_FirstDeriv(Shot):
    def body(self):
        self.title("Sketching a Graph", animate=False)
        form, g = qform(), qgraph()
        hI, *rows = q_intercepts()
        self.add(form, *qstate(g, 1), hI, *rows)
        d = q_first()
        self.go("2:46:23.99", FadeOut(VGroup(*rows)), ReplacementTransform(hI, d["h"]), run=0.5)
        self.go("2:46:25.3", Write(d["d1"]), run=1.2)
        self.go("2:46:29.25", Write(d["d2"]), run=1.0)
        self.go("2:46:32.45", Write(d["d3"]), run=0.9)
        self.go("2:46:33.9", FadeIn(g["c0"], shift=UP * 0.1), run=0.4)
        self.go("2:46:35.4", FadeIn(g["c3"], shift=UP * 0.1), run=0.4)
        ch = d["ch"]
        self.go("2:46:36.6", FadeIn(ch["g"]), run=0.6)
        self.go("2:46:38.4", Circumscribe(d["d2"][1], color=YEL, stroke_width=3), run=0.9)
        self.go("2:46:39.9", FadeOut(d["d3"]), FadeIn(d["nn"], shift=UP * 0.1), run=0.5)
        ul = Underline(d["d2"][2], color=YEL, stroke_width=4, buff=0.08)
        self.go("2:46:43.9", Create(ul), run=0.6)
        self.go("2:46:47.1", *[FadeIn(s, shift=DOWN * 0.1) for s in d["sg"][:2]], run=0.5)
        self.go("2:46:49.7", FadeIn(d["sg"][2], shift=DOWN * 0.1), run=0.5)
        self.go("2:46:52.6", *[GrowArrow(a) for a in d["ar"][:2]], FadeOut(ul), run=0.7)
        self.go("2:46:55.2", GrowArrow(d["ar"][2]), run=0.5)


# ================================================================ 5. the flat spot at 0, the min at 3

class K27_FlatSpot(Shot):
    def body(self):
        self.title("Sketching a Graph", animate=False)
        form, g, d = qform(), qgraph(), q_first()
        ax = g["ax"]
        self.add(form, *qstate(g, 2), d["h"], d["d1"], d["d2"], d["nn"], d["ch"]["g"], *d["sg"], *d["ar"])
        ch = d["ch"]
        # x = 0: critical, but f' is negative on both sides
        self.go("2:46:57.1", Circumscribe(ch["labs"][0], shape=Circle, color=YEL, stroke_width=3), draw(g["flat"], 1.0),
                run=1.0)
        xt = ValueTracker(-1.1)
        tg = live_tangent(ax, Q, xt, length=1.7, readout=False)
        ro = readout(r"\text{slope}=", lambda: slope(Q, xt.get_value()), [4.15, 1.95, 0], PINK, size=42)
        self.go("2:46:59.5")
        live_in(self, tg, ro, run=0.35)
        self.play(xt.animate.set_value(0), run_time=1.7)
        self.play(Circumscribe(VGroup(d["sg"][0], d["sg"][1]), color=YEL, stroke_width=3), run_time=0.8)
        self.play(xt.animate.set_value(1.4), run_time=1.5)
        nm = TX(r"$x=0$: not a max or min", 42, color=YEL).move_to([LX, ROW[2], 0])
        self.go("2:47:04.4", FadeOut(d["nn"]), FadeIn(nm, shift=UP * 0.1), run=0.5)
        fl = H("flat spot", 34, YEL).move_to(ax.c2p(0, 0) + [1.05, 0.62, 0])
        self.go("2:47:06.4", xt.animate.set_value(0), run=1.0)
        self.play(FadeIn(fl, shift=DOWN * 0.1), run_time=0.4)
        self.go("2:47:09.0")
        live_out(self, tg, ro, run=0.35)
        # x = 3: negative to positive, local min
        self.go("2:47:09.6", Circumscribe(VGroup(d["sg"][1], d["sg"][2]), color=YEL, stroke_width=3), run=1.0)
        f3 = M("f(3)", "=", "81-108", "=", "-27", size=48).move_to([LX, ROW[2], 0])
        f3[4].set_color(ORG)
        self.go("2:47:13.5", FadeOut(nm), FadeOut(fl), FadeIn(g["p3"], scale=0.5), draw(g["cupp"], 0.9), run=0.9)
        self.go("2:47:14.65", Write(f3[:3]), run=1.2)
        self.go("2:47:18.5", Write(f3[3:]), run=0.5)
        self.play(Write(g["p3l"]), run_time=0.5)
        self.go("2:47:21.5", FadeIn(g["abs"], shift=RIGHT * 0.1), run=0.5)
        self.go("2:47:23.9", GrowArrow(g["upL"]), GrowArrow(g["upR"]), run=0.7)


# ================================================================ 6. second derivative: concavity

class K27_Concavity(Shot):
    def body(self):
        self.title("Sketching a Graph", animate=False)
        form, g, d = qform(), qgraph(), q_first()
        f3 = M("f(3)", "=", "81-108", "=", "-27", size=48).move_to([LX, ROW[2], 0])
        f3[4].set_color(ORG)
        left = VGroup(d["h"], d["d1"], d["d2"], f3, d["ch"]["g"], *d["sg"], *d["ar"])
        self.add(form, *qstate(g, 3), left)
        s = q_second()
        self.go("2:47:26.5", FadeOut(VGroup(*left[1:])), ReplacementTransform(d["h"], s["h"]), run=0.5)
        self.go("2:47:28.2", Write(s["s1"]), run=1.2)
        self.go("2:47:32.45", Write(s["s2"]), run=1.0)
        ch = s["ch"]
        self.go("2:47:35.2", FadeIn(VGroup(ch["nm"], ch["g"][1], ch["g"][2])), run=0.5)
        self.go("2:47:36.3", FadeIn(ch["labs"][0], shift=UP * 0.1), run=0.3)
        self.go("2:47:37.55", FadeIn(ch["labs"][1], shift=UP * 0.1), run=0.3)
        ts = s["tests"]
        beats = [("2:47:41.0", "2:47:43.0", "2:47:45.85", "2:47:46.9"),
                 ("2:47:49.9", "2:47:51.1", "2:47:53.6", "2:47:54.7"),
                 ("2:47:57.2", "2:47:58.2", "2:48:00.4", "2:48:01.35")]
        for k, (a, b, c, e) in enumerate(beats):
            if k == 0:
                self.go(a, Write(ts[0][:2]), run=0.5)
            else:
                self.go(a, FadeOut(ts[k - 1]), FadeIn(ts[k][:2]), run=0.45)
            self.go(b, Write(ts[k][2]), run=0.7)
            self.go(c, Write(ts[k][3]), FadeIn(s["sg"][k], shift=DOWN * 0.1), run=0.5)
            self.go(e, Create(s["bw"][k]), run=0.5)
        self.go("2:48:02.6", FadeOut(ts[2]), FadeIn(s["infl"], shift=UP * 0.1), run=0.5)
        self.go("2:48:04.3", Create(g["ring"]), run=0.4)
        self.go("2:48:05.1", FadeIn(g["i2"], shift=UP * 0.1), run=0.4)


# ================================================================ 7. f(2) and the end behaviour

class K27_Ends(Shot):
    def body(self):
        self.title("Sketching a Graph", animate=False)
        form, g, s = qform(), qgraph(), q_second()
        ch = s["ch"]
        left = VGroup(s["h"], s["s1"], s["s2"], ch["g"], *s["sg"], *s["bw"], s["infl"])
        self.add(form, *qstate(g, 4), left)
        f2 = M("f(2)", "=", "16-32", "=", "-16", size=48).move_to([LX, ROW[4], 0])
        f2[4].set_color(ORG)
        self.go("2:48:06.0", FadeOut(s["infl"]), FadeIn(f2[:2]), run=0.45)
        self.go("2:48:06.95", Write(f2[2]), run=0.7)
        self.go("2:48:09.05", Write(f2[3:]), FadeIn(g["p2"], scale=0.5), run=0.5)
        self.play(Write(g["p2l"]), run_time=0.4)
        hE, e1, e2 = q_ends_rows()
        rest = VGroup(*[m for m in left if m is not s["h"] and m is not s["infl"]], f2)
        self.go("2:48:10.6", FadeOut(rest), ReplacementTransform(s["h"], hE), run=0.5)
        self.go("2:48:12.3", Circumscribe(form[2][0:2], color=YEL, stroke_width=3), run=0.8)
        self.go("2:48:13.1", Write(e1), run=0.7)
        self.go("2:48:15.1", Write(e2[0]), run=0.8)
        self.go("2:48:18.2", Write(e2[1:]), run=0.8)
        self.play(Circumscribe(g["upL"], color=YEL, stroke_width=3), Circumscribe(g["upR"], color=YEL, stroke_width=3),
                  run_time=0.8)


# ================================================================ 8. put it together: the curve, piece by piece

class K27_Together(Shot):
    def body(self):
        self.title("Sketching a Graph", animate=False)
        form, g = qform(), qgraph()
        ax = g["ax"]
        hE, e1, e2 = q_ends_rows()
        self.add(form, *qstate(g, 5), hE, e1, e2)
        tb = q_table()
        self.go("2:48:20.45", FadeOut(VGroup(hE, e1, e2)), run=0.4)
        self.play(FadeIn(tb["all"], shift=UP * 0.1), run_time=0.6)
        P, bx = g["P"], tb["boxes"]
        box = bx[0].copy()
        self.go("2:48:22.4", Create(box), FadeOut(g["flat"]), FadeOut(g["cupp"]), run=0.5)
        self.go("2:48:24.0", draw(P[0], 3.4), run=3.4)
        # the origin: flat for a moment, then the frown starts
        ft = tangent(ax, Q, 0, length=1.6)
        self.go("2:48:29.4", Create(ft), run=0.4)
        self.go("2:48:31.0", FadeOut(ft), run=0.4)
        self.go("2:48:32.3", Transform(box, bx[1]), run=0.5)
        self.go("2:48:34.7", draw(P[1], 3.0), run=3.0)
        self.go("2:48:39.3", Transform(box, bx[2]), run=0.5)
        self.go("2:48:41.8", draw(P[2], 2.6), run=2.6)
        self.go("2:48:46.3", Transform(box, bx[3]), run=0.5)
        self.go("2:48:47.0", draw(P[3], 3.6), run=3.6)
        self.go("2:48:52.6", FadeOut(box), FadeOut(g["upL"]), FadeOut(g["upR"]), run=0.5)
        whole = VGroup(*P)
        self.go("2:48:53.4", Circumscribe(VGroup(whole, g["p3l"], g["abs"]), color=GRN, stroke_width=3), run=1.2)
        self.wipe("2:48:56.75")


# ================================================================ 9. a rational function: asymptotes, derivative

def rgraph():
    ax = axes((-4, 4, 1), (-1, 1, 0.5), 6.2, 3.6, (3.3, -0.6, 0), nums=False)
    nl = VGroup(M("2", size=30, color=FAINT).next_to(ax.c2p(2, 0), DOWN, buff=0.12),
                M("-2", size=30, color=FAINT).next_to(ax.c2p(-2, 0), UP, buff=0.12),
                M(r"\frac{1}{2}", size=32, color=FAINT).next_to(ax.c2p(0, 0.5), LEFT, buff=0.12),
                M(r"-\frac{1}{2}", size=32, color=FAINT).next_to(ax.c2p(0, -0.5), RIGHT, buff=0.12))
    g = dict(ax=ax, base=VGroup(ax, ax.labels, nl))
    g["ha"] = DashedLine(ax.c2p(-4, 0), ax.c2p(3.85, 0), color=YEL, stroke_width=4, dash_length=0.12)
    g["hal"] = M("y=0", size=36, color=YEL).next_to(ax.c2p(3.1, 0), DOWN, buff=0.15)
    tri = lambda x: Triangle(color=PINK, fill_color=PINK, fill_opacity=1, stroke_width=0).scale(0.09).move_to(
        ax.c2p(x, 0) + (DOWN if x > 0 else UP) * 0.24 + (UP * 0.0))
    g["c1"], g["cm1"] = tri(1), tri(-1)
    g["cm1"].rotate(PI)
    g["pmax"], g["pmin"] = pt(ax, 1, 0.5), pt(ax, -1, -0.5)
    g["lmax"] = plab(r"(1,\,\tfrac12)").next_to(g["pmax"], UP, buff=0.18)
    g["lmin"] = plab(r"(-1,\,-\tfrac12)").next_to(g["pmin"], DOWN, buff=0.18)
    g["P"] = [plot(ax, R, -3.9, -1), plot(ax, R, -1, 1), plot(ax, R, 1, 3.9)]
    return g


def rform():
    m = M("f(x)", "=", r"\frac{x}{x^2+1}", size=54)
    m[0].set_color(BLUE)
    return m.move_to([LX, 1.8, 0])


def r_deriv():
    q1 = M("f'(x)", "=", r"\frac{(x^2+1)\cdot 1-x\cdot 2x}{(x^2+1)^2}", size=46)
    q1[0].set_color(PINK)
    at_eq(q1, 1, -4.6, -0.12)
    q2 = at_eq(M("=", r"\frac{1-x^2}{(x^2+1)^2}", size=46), 0, -4.6, -1.55)
    q3 = M("1-x^2=0", r"\;\Rightarrow\;", r"x=\pm 1", size=46).move_to([LX, -2.95, 0])
    q3[2].set_color(ORG)
    return q1, q2, q3


class K27_Rational(Shot):
    def body(self):
        self.title("Sketching a Graph", animate=False)   # K27_Together ends on a clean board
        self.title("Where Asymptotes Fit In", "2:48:58.9")
        rf, r = rform(), rgraph()
        self.go("2:49:02.6", Write(rf), run=1.0)
        self.go("2:49:03.9", Create(r["ax"]), FadeIn(r["base"][1:]), run=0.8)
        a1 = M(r"x^2+1\neq 0", size=50).move_to([LX, 0.2, 0])
        a2 = H("no vertical asymptotes", 40, DIM).move_to([LX, -0.6, 0])
        self.go("2:49:06.3", Write(a1), run=0.8)
        self.go("2:49:07.9", FadeIn(a2, shift=UP * 0.1), run=0.5)
        a3 = M(r"\lim_{x\to\infty}\frac{x}{x^2+1}", "=", "0", size=50).move_to([LX, -1.95, 0])
        a3[2].set_color(YEL)
        self.go("2:49:10.0", Write(a3[0]), run=1.0)
        self.go("2:49:12.4", Circumscribe(a3[0][-4:-2], color=YEL, stroke_width=3), run=0.8)
        self.go("2:49:14.9", Write(a3[1:]), run=0.5)
        self.go("2:49:16.3", Create(r["ha"]), run=0.8)
        self.go("2:49:17.7", Write(r["hal"]), run=0.5)
        q1, q2, q3 = r_deriv()
        self.go("2:49:19.65", FadeOut(VGroup(a1, a2, a3)), run=0.4)
        hq = H("quotient rule", 38, DIM).move_to([LX, 0.8, 0])
        self.go("2:49:21.2", FadeIn(hq, shift=DOWN * 0.1), run=0.4)
        self.go("2:49:22.6", Write(q1[:2]), run=0.4)
        self.play(Write(q1[2]), run_time=2.2)
        self.go("2:49:30.0", Write(q2), run=1.0)
        self.go("2:49:33.5", Write(q3[0]), run=0.8)
        self.go("2:49:35.1", Write(q3[1:]), FadeIn(r["c1"], shift=UP * 0.1), run=0.5)
        self.go("2:49:36.6", FadeIn(r["cm1"], shift=DOWN * 0.1), run=0.4)


class K27_RationalShape(Shot):
    def body(self):
        self.title("Where Asymptotes Fit In", animate=False)
        rf, r = rform(), rgraph()
        q1, q2, q3 = r_deriv()
        hq = H("quotient rule", 38, DIM).move_to([LX, 0.8, 0])
        self.add(rf, r["base"], r["ha"], r["hal"], r["c1"], r["cm1"], hq, q1, q2, q3)
        q2t = at_eq(M("f'(x)", "=", r"\frac{1-x^2}{(x^2+1)^2}", size=46), 1, -3.6, 0.15)
        q2t[0].set_color(PINK)
        self.go("2:49:37.85", FadeOut(VGroup(hq, q1, q3, q2[0])), ReplacementTransform(q2[1], q2t[2]),
                FadeIn(q2t[:2]), run=0.6)
        ch = sign_line("f'", PINK, ["-1", "1"], -1.35)
        self.go("2:49:38.6", FadeIn(ch["g"]), run=0.5)
        num = q2t[2][0:4]
        self.go("2:49:39.8", Circumscribe(num, color=YEL, stroke_width=3), run=0.8)
        sg = signs(ch, ["-", "+", "-"], PINK)
        self.go("2:49:42.3", FadeIn(sg[1], shift=DOWN * 0.1), run=0.4)
        self.go("2:49:44.4", FadeIn(sg[0], shift=DOWN * 0.1), FadeIn(sg[2], shift=DOWN * 0.1), run=0.4)
        ar = [dir_arrow([x, -1.85, 0], inc) for x, inc in zip(ch["mids"], (False, True, False))]
        mm = [H("min", 34, YEL).move_to([ch["xs"][0], -2.25, 0]), H("max", 34, YEL).move_to([ch["xs"][1], -2.25, 0])]
        self.go("2:49:46.7", GrowArrow(ar[0]), run=0.5)
        self.go("2:49:48.4", FadeIn(mm[0], shift=UP * 0.1), run=0.4)
        self.go("2:49:50.5", GrowArrow(ar[1]), run=0.5)
        self.go("2:49:51.6", FadeIn(mm[1], shift=UP * 0.1), run=0.4)
        self.go("2:49:53.3", GrowArrow(ar[2]), run=0.5)
        v = M(r"f(1)=\tfrac12", r",\qquad", r"f(-1)=-\tfrac12", size=46).move_to([LX, -3.1, 0])
        self.go("2:49:54.9", Write(v[0]), FadeIn(r["pmax"], scale=0.5), run=0.7)
        self.play(Write(r["lmax"]), run_time=0.4)
        self.go("2:49:56.7", Write(v[1:]), FadeIn(r["pmin"], scale=0.5), run=0.7)
        self.play(Write(r["lmin"]), run_time=0.4)
        P = r["P"]
        self.go("2:50:00.1", draw(P[0], 3.6), run=3.6)
        self.go("2:50:04.8", draw(P[1], 1.8), run=1.8)
        self.go("2:50:07.5", draw(P[2], 2.0), run=2.0)
        ends = VGroup(arr(r["ax"].c2p(-2.6, -0.62), r["ax"].c2p(-3.7, -0.62), YEL, w=4),
                      arr(r["ax"].c2p(2.6, 0.62), r["ax"].c2p(3.7, 0.62), YEL, w=4))
        lv = H("levels off", 34, YEL).next_to(ends[1], UP, buff=0.12)
        self.go("2:50:11.3", GrowArrow(ends[0]), GrowArrow(ends[1]), run=0.6)
        self.go("2:50:12.1", FadeIn(lv, shift=DOWN * 0.1), run=0.4)
        self.wipe("2:50:13.7")


# ================================================================ 10. reading the graph of f'

def fp_axes():
    top = axes((-2.5, 2.5, 1), (-1.5, 3.5, 1), 7.6, 2.6, (-0.6, 1.15, 0), nums=False, y_label="")
    bot = axes((-2.5, 2.5, 1), (-1.2, 1.2, 1), 7.6, 2.3, (-0.6, -2.45, 0), nums=False, y_label="")
    nl = VGroup(M("-1", size=30, color=FAINT).next_to(top.c2p(-1, 0), UR, buff=0.06),
                M("1", size=30, color=FAINT).next_to(top.c2p(1, 0), UL, buff=0.06),
                M("-2", size=30, color=FAINT).next_to(top.c2p(-2, 0), DOWN, buff=0.12),
                M("2", size=30, color=FAINT).next_to(top.c2p(2, 0), DOWN, buff=0.12))
    return top, bot, nl


class K27_ReadFPrime(Shot):
    def body(self):
        self.title("Where Asymptotes Fit In", animate=False)   # K27_RationalShape ends on a clean board
        self.title("Graph of the Derivative", "2:50:15.6")
        top, bot, nl = fp_axes()
        fpc = plot(top, FP, -2.1, 2.1, color=PINK)
        fpl = M("f'", size=50, color=PINK).next_to(top.c2p(2.1, FP(2.1)), RIGHT, buff=0.15)
        self.go("2:50:19.2", Create(top), FadeIn(top.labels), FadeIn(nl), run=0.6)
        self.play(draw(fpc, 1.0), FadeIn(fpl), run_time=1.0)
        fl = M("f", size=50, color=BLUE).next_to(bot.c2p(2.1, FF(2.1)), RIGHT, buff=0.15)
        qm = M("?", size=60, color=YEL).move_to(bot.c2p(0, 0.75))
        self.go("2:50:21.4", Create(bot), FadeIn(bot.labels), FadeIn(fl), FadeIn(qm), run=0.6)
        guides = VGroup(*[DashedLine(top.c2p(x, 0), bot.c2p(x, -1.2), color=FAINT, stroke_width=2, dash_length=0.08)
                          for x in (-1, 1)])
        self.go("2:50:24.9", Create(guides), run=0.6)
        # one tracker: height of f' on top, tangent + traced f below
        xt = ValueTracker(-2.0)
        dot = always_redraw(lambda: pt(top, xt.get_value(), FP(xt.get_value())))
        bar = always_redraw(lambda: Line(top.c2p(xt.get_value(), 0), top.c2p(xt.get_value(), FP(xt.get_value())),
                                         color=ORG, stroke_width=5))
        trace = always_redraw(lambda: plot(bot, FF, -2.0, max(xt.get_value(), -1.99)))
        tg = live_tangent(bot, FF, xt, length=1.2, readout=False)
        self.go("2:50:26.3", FadeOut(qm), run=0.3)
        live_in(self, bar, dot, trace, tg, run=0.3)
        self.play(xt.animate.set_value(-1.0), run_time=2.5)
        inc = VGroup(dir_arrow(ORIGIN, True, color=PINK, s=0.2), H("up", 36, PINK)).arrange(RIGHT, buff=0.12)
        inc.move_to([-3.95, -1.6, 0])
        self.go("2:50:29.5", FadeIn(inc, shift=UP * 0.1), run=0.4)
        self.go("2:50:31.3", xt.animate.set_value(1.0), run=2.4)
        dec = VGroup(dir_arrow(ORIGIN, False, color=PINK, s=0.2), H("down", 36, PINK)).arrange(RIGHT, buff=0.12)
        dec.move_to([0.55, -1.95, 0])
        self.play(FadeIn(dec, shift=DOWN * 0.1), run_time=0.4)
        # crossings: max and min
        z1, m1 = pt(top, -1, 0), pt(bot, -1, FF(-1))
        mx = H("local max", 34, YEL).next_to(m1, UP, buff=0.12)
        self.go("2:50:35.6", FadeIn(z1, scale=0.5), run=0.4)
        self.go("2:50:38.0", FadeIn(m1, scale=0.5), FadeIn(mx, shift=DOWN * 0.1), run=0.5)
        self.go("2:50:39.6", xt.animate.set_value(2.0), run=1.8)
        z2, m2 = pt(top, 1, 0), pt(bot, 1, FF(1))
        mn = H("local min", 34, YEL).next_to(m2, DOWN, buff=0.12)
        self.play(FadeIn(z2, scale=0.5), FadeIn(m2, scale=0.5), FadeIn(mn, shift=UP * 0.1), run_time=0.5)
        # the valley of f' -> inflection of f
        self.go("2:50:42.4")
        live_out(self, bar, dot, tg, run=0.3)
        unclock(trace)
        vy = pt(top, 0, -1, color=YEL)
        vl = H("valley", 34, YEL).next_to(vy, DOWN, buff=0.1).shift(RIGHT * 0.6)
        self.go("2:50:45.3", FadeIn(vy, scale=0.5), FadeIn(vl, shift=UP * 0.1), run=0.5)
        vg = DashedLine(top.c2p(0, -1), bot.c2p(0, 0), color=YEL, stroke_width=3, dash_length=0.08)
        ip = pt(bot, 0, 0, color=YEL)
        il = H("inflection", 34, YEL).next_to(ip, DL, buff=0.1)
        self.go("2:50:48.3", Create(vg), run=0.5)
        self.go("2:50:49.2", FadeIn(ip, scale=0.5), FadeIn(il, shift=UP * 0.1), run=0.5)
        # f'' = the slope of f' changes sign there
        st = ValueTracker(-0.8)
        tg2 = live_tangent(top, FP, st, length=1.6, color=YEL, readout=False)
        ro = readout("f''=", lambda: slope(FP, st.get_value()), [4.3, 1.0, 0], YEL, size=44)
        self.go("2:50:51.4", FadeOut(vl), run=0.3)
        live_in(self, tg2, ro, run=0.3)
        self.play(st.animate.set_value(0.8), run_time=2.9)
        unclock(tg2, ro)
        self.wipe("2:50:55.05")


def rules_card():
    r1 = VGroup(H("height of", 46, YEL), M("f'", size=56, color=PINK)).arrange(RIGHT, buff=0.2)
    a1 = arr(ORIGIN, RIGHT * 1.1, CHALK)
    t1 = VGroup(M("f", size=56, color=BLUE), H("going up or down", 46)).arrange(RIGHT, buff=0.2)
    row1 = VGroup(r1, a1, t1).arrange(RIGHT, buff=0.4).move_to([0.3, 0.8, 0])
    r2 = VGroup(H("slope of", 46, YEL), M("f'", size=56, color=PINK)).arrange(RIGHT, buff=0.2)
    a2 = arr(ORIGIN, RIGHT * 1.1, CHALK)
    t2 = VGroup(M("f", size=56, color=BLUE), H("bends: cup or frown", 46)).arrange(RIGHT, buff=0.2)
    row2 = VGroup(r2, a2, t2).arrange(RIGHT, buff=0.4)
    row2.shift(RIGHT * (a1.get_x() - a2.get_x()) + UP * (-1.2 - row2.get_y()))
    ic2 = VGroup(bowl(True, 0.5, 0.22), bowl(False, 0.5, 0.22)).arrange(RIGHT, buff=0.15).next_to(t2, DOWN, buff=0.3)
    return r1, a1, t1, r2, a2, t2, ic2


class K27_HeightSlope(Shot):
    def body(self):
        self.title("Graph of the Derivative", animate=False)   # K27_ReadFPrime ends on a clean board
        r1, a1, t1, r2, a2, t2, ic2 = rules_card()
        mini = mini_curve([0, 1.75, 0], lambda t: 0.35 * (t * t - 1), -1.2, 1.2, color=PINK)
        ml = M("f'", size=46, color=PINK).next_to(mini, RIGHT, buff=0.2)
        self.go("2:50:57.0", draw(mini, 0.8), FadeIn(ml), run=0.8)
        self.go("2:50:58.9", FadeIn(r1, shift=RIGHT * 0.1), run=0.5)
        self.go("2:50:59.8", GrowArrow(a1), run=0.4)
        self.play(FadeIn(t1, shift=RIGHT * 0.1), run_time=0.5)
        self.go("2:51:01.8", FadeIn(r2, shift=RIGHT * 0.1), run=0.5)
        self.go("2:51:02.7", GrowArrow(a2), run=0.4)
        self.play(FadeIn(t2, shift=RIGHT * 0.1), Create(ic2), run_time=0.5)
        self.wipe("2:51:04.25")


# ================================================================ 11. recap and teaser

def recap_icons():
    """Small chalk pictures, one per recap row (centred at the origin, about 1.1 wide)."""
    hill = mini_curve(ORIGIN, lambda t: 0.3 - 0.9 * t * t, -0.6, 0.6, sw=4)
    i1 = VGroup(hill, Line([-0.3, 0.3, 0], [0.3, 0.3, 0], color=PINK, stroke_width=4))
    cv = mini_curve(ORIGIN, lambda t: 0.25 * np.sin(3 * t), -0.55, 0.55, sw=4)
    i2 = VGroup(cv, Dot([-0.55, 0.25 * np.sin(-1.65), 0], radius=0.06, color=ORG),
                Dot([0.55, 0.25 * np.sin(1.65), 0], radius=0.06, color=ORG))
    i3 = VGroup(dir_arrow([-0.28, 0, 0], True, s=0.2), dir_arrow([0.28, 0, 0], False, s=0.2))
    i4 = VGroup(bowl(True, 0.45, 0.2), bowl(False, 0.45, 0.2)).arrange(RIGHT, buff=0.15)
    # mean value theorem: secant through the ends of y = 1.5 t^3 on [-0.6, 0.6] (slope 0.54), parallel tangent at c
    cm = mini_curve(ORIGIN, lambda t: 1.5 * t ** 3, -0.6, 0.6, sw=4)
    sec_ = Line([-0.6, -0.324, 0], [0.6, 0.324, 0], color=ORG, stroke_width=3)
    c = np.sqrt(0.12)
    tan_ = Line([-0.28, -0.1512, 0], [0.28, 0.1512, 0], color=PINK, stroke_width=3).shift([c, 1.5 * c ** 3, 0])
    i5 = VGroup(cm, sec_, tan_)
    return [i1, i2, i3, i4, i5]


class K27_Recap(Shot):
    def body(self):
        self.title("Graph of the Derivative", animate=False)   # K27_HeightSlope ends on a clean board
        rows = [TX(r"Critical points: $f'=0$ or does not exist", 42),
                TX(r"Closed interval: critical points and endpoints", 42),
                TX(r"$f'>0$ increasing, \ $f'<0$ decreasing", 42),
                TX(r"$f''>0$ concave up, \ $f''<0$ concave down", 42),
                TX(r"Mean value theorem: the average rate is hit at least once", 42)]
        ics = recap_icons()
        for row, ic, y in zip(rows, ics, [1.75, 0.75, -0.25, -1.25, -2.25]):
            ic.move_to([-5.6, y, 0])
            row.move_to([-4.75, y, 0], aligned_edge=LEFT)
        self.title("Chapter 9 in Five Lines", "2:51:04.8")
        beats = ["2:51:06.1", "2:51:12.4", "2:51:17.2", "2:51:21.8", "2:51:26.5"]
        for k, t in enumerate(beats):
            anims = [FadeIn(ics[k], shift=RIGHT * 0.1), Write(rows[k])]
            if k:
                anims += [rows[k - 1].animate.fade(0.45), ics[k - 1].animate.fade(0.45)]
            self.go(t, *anims, run=0.9)
        self.wipe("2:51:30.5")


class K27_NextUp(Shot):
    def body(self):
        self.title("Chapter 9 in Five Lines", animate=False)   # K27_Recap ends on a clean board
        self.title("Next: Real Problems", "2:51:31.2")
        ax = axes((0, 6, 1), (0, 4, 1), 7.0, 3.6, (0, -0.8, 0), nums=False, x_label="", y_label="")
        f = lambda x: 2.05 + 1.3 * np.sin(1.25 * x - 0.6) + 0.12 * x
        cv = plot(ax, f, 0.2, 5.8)
        xm = 0.6 / 1.25 + PI / 2 / 1.25
        xn = 0.6 / 1.25 + 3 * PI / 2 / 1.25
        top, low = pt(ax, xm, f(xm)), pt(ax, xn, f(xn))
        self.go("2:51:32.2", Create(ax), run=0.5)
        self.play(draw(cv, 1.4), run_time=1.4)
        for w, t, p, d in [("biggest", "2:51:35.85", top, UP), ("smallest", "2:51:36.7", low, DOWN)]:
            self.go(t, FadeIn(p, scale=0.5), FadeIn(H(w, 40, YEL).next_to(p, d, buff=0.18), shift=-d * 0.1), run=0.4)
        cheap = H("cheapest", 40, ORG).move_to([-5.3, 0.4, 0])
        eff = H("most efficient", 40, ORG).move_to([5.2, 0.4, 0])
        self.go("2:51:37.55", FadeIn(cheap, shift=DOWN * 0.1), run=0.4)
        self.go("2:51:38.45", FadeIn(eff, shift=DOWN * 0.1), run=0.4)
        opt = H("optimization", 60, GRN).move_to([0, -3.2, 0])
        self.go("2:51:40.2", Write(opt), run=0.8)
