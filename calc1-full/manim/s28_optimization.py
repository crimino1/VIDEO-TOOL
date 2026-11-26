"""Builder 28: start of Chapter 10 "Optimization and L'Hopital's Rule".
What optimization is (a wave with its best point, four little examples, critical points, the L'Hopital teaser);
the six-step method as a 2 x 3 grid with one chalk icon per step (as K27_Checklist); the 400 m fence: set-up
algebra, then ONE tracker x drives the field (width x, length 200 - x), its live labels, the area readout and a dot
plus tangent on A(x) = 200x - x^2 (flat at x = 100, square, 10,000 m^2); the river twist on the same pattern
(A = 400x - 2x^2, 100 by 200, 20,000 m^2, drawn over the dimmed fence curve: twice as much); the open box from a
12 cm sheet: one tracker grows the cut corner squares and reshapes the folded box with a live volume, the algebra
V' = 12(x - 2)(x - 6), then V(x) on a graph with the box riding along to the peak (x = 2, 128 cm^3); the can set-up.
Colours: functions BLUE, derivatives / tangents PINK, second derivative PURP (as builder 27), example numbers and
lengths ORG, areas / volumes / answers GRN, key words YEL, cut / not allowed RED.
END SEAM: K28_CanArea ends with the can, its net (two circles + the unrolled rectangle), S = 2 pi r^2 + 2 pi r h at
the bottom, pi r^2 h = 1000 and h = 1000 / (pi r^2) on the right, the h's circled for "Substitute"."""
from common import *


# ---------------------------------------------------------------- the maths of this section, checked once

def AF(x):          # fence: 2x + 2y = 400
    return x * (200 - x)


def AR(x):          # river: 2x + y = 400
    return x * (400 - 2 * x)


def VB(x):          # open box from a 12 cm sheet
    return x * (12 - 2 * x) ** 2


assert AF(100) == 10000 and 200 - 2 * 100 == 0 and 200 - 100 == 100
assert AR(100) == 20000 and 400 - 4 * 100 == 0 and 400 - 200 == 200 and AR(100) == 2 * AF(100)
assert VB(2) == 128 and VB(6) == 0 and VB(0) == 0 and 2 * (12 - 4) ** 2 == 128 and 2 * 64 == 128
for _x in (0.7, 2.3, 4.1):
    assert abs((12 - 2 * _x) ** 2 - (144 - 48 * _x + 4 * _x * _x)) < 1e-9
    assert abs(VB(_x) - (4 * _x ** 3 - 48 * _x ** 2 + 144 * _x)) < 1e-9
    assert abs(slope(VB, _x) - (12 * _x ** 2 - 96 * _x + 144)) < 1e-6
    assert abs((12 * _x ** 2 - 96 * _x + 144) - 12 * (_x - 2) * (_x - 6)) < 1e-9
    assert abs(slope(AF, _x * 40) - (200 - 2 * _x * 40)) < 1e-6 and abs(slope(AR, _x * 40) - (400 - 4 * _x * 40)) < 1e-6


# ---------------------------------------------------------------- local helpers

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


def freeze_wipe(scene, t=None, run=0.4, keep=()):
    """Wipe a board that has live objects on it: stop their updaters first so they fade cleanly."""
    if t is not None:
        scene.at(t)
    unclock(*[m for m in scene.board() if m not in keep])
    scene.wipe(run=run, keep=keep)


_DG = {}


def digits(s, size=44, color=CHALK):
    """A number from cached glyphs (no new LaTeX per frame). Commas drop below the baseline."""
    g = VGroup()
    for ch in s:
        k = (ch, size)
        if k not in _DG:
            _DG[k] = M(ch, size=size)
        g.add(_DG[k].copy().set_color(color))
    g.arrange(RIGHT, buff=0.035, aligned_edge=DOWN)
    for x, ch in zip(g, s):
        if ch == ",":
            x.shift(DOWN * x.height * 0.45)
    return g


def live(pre, fn, at, color=ORG, size=40, fmt=lambda v: f"{v:,.0f}", suf=None, edge="center"):
    """Live readout 'pre <number> suf' on the real LaTeX baseline. at() gives the anchor (centre or left edge)."""
    tm = M(*([pre, "0"] + ([suf] if suf else [])), size=size, color=color)
    head, zero = tm[0], tm[1]
    gap = zero.get_left()[0] - head.get_right()[0]
    base = zero.get_bottom()[1]
    ref_y = tm.get_center()[1]
    tail = tm[2] if suf else None
    tgap = tail.get_left()[0] - zero.get_right()[0] if suf else 0
    tbot = tail.get_bottom()[1] if suf else 0

    def mk():
        h = head.copy()
        d = digits(fmt(fn()), size, color)
        d.next_to(h, RIGHT, buff=gap)
        d.shift(UP * (base - d[0].get_bottom()[1]))
        g = VGroup(h, d)
        if suf:
            t = tail.copy().next_to(d, RIGHT, buff=tgap)
            t.shift(UP * (tbot - t.get_bottom()[1]))
            g.add(t)
        p = np.array(at(), float)
        ex = {"left": g.get_left()[0], "right": g.get_right()[0]}.get(edge, g.get_center()[0])
        dx = p[0] - ex
        g.shift([dx, p[1] - ref_y, 0])
        return g
    return always_redraw(mk)


def arr(a, b, color, w=5, tip=0.18):
    return Arrow(np.array(a, float), np.array(b, float), buff=0, color=color, stroke_width=w, tip_length=tip,
                 max_tip_length_to_length_ratio=0.5, max_stroke_width_to_length_ratio=30)


def dir_arrow(c, inc, color=PINK, s=0.2):
    c = np.array(c, float)
    a, b = (c + [-s, -s, 0], c + [s, s, 0]) if inc else (c + [-s, s, 0], c + [s, -s, 0])
    return arr(a, b, color, 5, 0.14)


def bowl(up=True, w=0.62, h=0.3, color=BLUE, sw=5):
    t = np.linspace(-1, 1, 25)
    y = t ** 2 if up else -t ** 2
    return VMobject(stroke_color=color, stroke_width=sw).set_points_smoothly(
        np.column_stack([t * w / 2, y * h, 0 * t])).center()


def mini_curve(c, f, a, b, sx=1.0, sy=1.0, color=BLUE, sw=5, n=40):
    c = np.array(c, float)
    t = np.linspace(a, b, n)
    return VMobject(stroke_color=color, stroke_width=sw).set_points_smoothly(
        np.column_stack([c[0] + t * sx, c[1] + f(t) * sy, 0 * t]))


def plot(ax, f, a, b, color=BLUE, width=5, step=None):
    return ax.plot(f, x_range=[a, b, step or (b - a) / 120], color=color, stroke_width=width)


def graph_axes(xr, yr, xl, yl, c, xticks, yticks, ylab):
    """Chalk axes with hand-picked tick labels (wide numbers like 10,000 placed by hand)."""
    ax = axes(xr, yr, xl, yl, c, nums=False, x_label="x", y_label=ylab)
    for v in xticks:
        ax.labels.add(M(f"{v:g}", size=30, color=FAINT).next_to(ax.c2p(v, 0), DOWN, buff=0.12))
    for v in yticks:
        ax.labels.add(M(f"{v:,.0f}".replace(",", "{,}"), size=30, color=FAINT).next_to(ax.c2p(0, v), LEFT, buff=0.12))
    return ax


def live_dot(ax, f, xt, color=GRN):
    return always_redraw(lambda: pt(ax, xt.get_value(), f(xt.get_value()), color, r=0.09))


def live_tan(ax, f, xt, length=1.7):
    return always_redraw(lambda: tangent(ax, f, xt.get_value(), length, PINK))


# ---------------------------------------------------------------- fence (2x + 2y = 400)

FS = 0.026                                  # screen units per metre
F0 = np.array([-5.3, -3.15, 0])             # bottom-left corner of the field
FX0 = 140                                    # the field as first drawn (not the answer)
FCOL = 3.4                                   # x of the '=' in the algebra column
FROWS = [1.0, 0.0, -1.0, -2.0]


def fence_rect(x, fill=0.16):
    w, h = x * FS, (200 - x) * FS
    return Polygon(F0, F0 + [w, 0, 0], F0 + [w, h, 0], F0 + [0, h, 0], stroke_color=CHALK, stroke_width=6,
                   fill_color=GRN, fill_opacity=fill)


def fence_xpos(x):
    return F0 + [x * FS / 2, -0.36, 0]


def fence_ypos(x, w=0.0):
    return F0 + [-0.2 - w / 2, (200 - x) * FS / 2, 0]


def fence_setup():
    """Everything K28_Fence leaves on the board (K28_FenceMax re-adds it)."""
    d = {}
    d["rect"] = fence_rect(FX0)
    d["xl"] = M("x", size=46, color=ORG).move_to(fence_xpos(FX0))
    d["yl"] = M("y", size=46, color=ORG)
    d["yl"].move_to(fence_ypos(FX0, d["yl"].width))
    d["top"] = M(r"400\text{ m of fence}", size=46, color=ORG).move_to([3.6, 1.95, 0])
    d["r1"] = at_eq(col(M("A", "=", "x", "y", size=54), {0: GRN}), 1, FCOL, FROWS[0])
    d["r2a"] = at_eq(M("2x", "+", "2y", "=", "400", size=54), 3, FCOL, FROWS[1])
    d["r2b"] = at_eq(M("x", "+", "y", "=", "200", size=54), 3, FCOL, FROWS[1])
    d["r2c"] = at_eq(M("y", "=", "200", "-", "x", size=54), 1, FCOL, FROWS[1])
    d["r3"] = at_eq(col(M("A", "=", "x", "(200-x)", size=54), {0: GRN}), 1, FCOL, FROWS[2])
    d["r4"] = at_eq(col(M("A", "=", "200x", "-", "x^2", size=54), {0: GRN}), 1, FCOL, FROWS[3])
    d["lmax"] = H("maximize", 36, YEL).move_to([0.05, FROWS[0], 0])
    d["lcon"] = H("constraint", 36, YEL).move_to([0.05, FROWS[1], 0])
    d["one"] = H("one variable", 36, YEL).next_to(d["r4"], DOWN, buff=0.25)
    return d


def fence_graph():
    ax = graph_axes((0, 220, 100), (0, 12000, 10000), 5.2, 3.1, (3.85, 0.3, 0), (100, 200), (10000,), "A")
    return ax, plot(ax, AF, 0, 200)


# ---------------------------------------------------------------- river (2x + y = 400)

RS = 0.018
RTOP = 1.15                                  # y of the river bank (top edge of the field)
RCX = -3.7                                   # centre x of the field
RX0 = 130                                    # first drawing: x = 130, y = 140


def river_pts(x):
    w, h = (400 - 2 * x) * RS, x * RS
    a = np.array([RCX - w / 2, RTOP, 0])
    return a, a + [w, 0, 0], a + [w, -h, 0], a + [0, -h, 0]      # TL, TR, BR, BL


def river_field(x, fill=0.16):
    tl, tr, br, bl = river_pts(x)
    area = Polygon(tl, tr, br, bl, stroke_width=0, fill_color=GRN, fill_opacity=fill)
    fence = VMobject(stroke_color=CHALK, stroke_width=6).set_points_as_corners([tl, bl, br, tr])
    bank = DashedLine(tl, tr, color=DIM, stroke_width=3, dash_length=0.1)
    return VGroup(area, bank, fence)


def river_waves():
    g = VGroup()
    for k, y in enumerate((1.45, 1.75, 2.05)):
        xs = np.linspace(-6.5 + 0.2 * k, -1.0 - 0.15 * k, 60)
        ys = y + 0.05 * np.sin(xs * 3.1 + k * 1.3)
        g.add(VMobject(stroke_color=BLUE, stroke_width=3, stroke_opacity=0.7).set_points_smoothly(
            np.column_stack([xs, ys, 0 * xs])))
    g.add(H("river", 36, BLUE).move_to([-0.35, 1.75, 0]))
    return g


def river_ypos(x):
    tl, tr, br, bl = river_pts(x)
    return (bl + br) / 2 + DOWN * 0.36


def river_xpos(x, w=0.0):
    tl, tr, br, bl = river_pts(x)
    return (tl + bl) / 2 + LEFT * (0.2 + w / 2)


def river_xpos_r(x, w=0.0):
    tl, tr, br, bl = river_pts(x)
    return (tr + br) / 2 + RIGHT * (0.2 + w / 2)


def river_setup():
    d = {}
    d["waves"] = river_waves()
    d["field"] = river_field(RX0)
    d["top"] = M(r"400\text{ m of fence}", size=46, color=ORG).move_to([3.6, 1.95, 0])
    d["yl"] = M("y", size=46, color=ORG).move_to(river_ypos(RX0))
    d["xl"] = M("x", size=46, color=ORG)
    d["xl"].move_to(river_xpos(RX0, d["xl"].width))
    d["xr"] = M("x", size=46, color=ORG)
    d["xr"].move_to(river_xpos_r(RX0, d["xr"].width))
    d["r1a"] = at_eq(M("2x", "+", "y", "=", "400", size=54), 3, FCOL, 0.85)
    d["r1b"] = at_eq(M("y", "=", "400", "-", "2x", size=54), 1, FCOL, 0.85)
    d["r2"] = at_eq(col(M("A", "=", "x", "(400-2x)", size=54), {0: GRN}), 1, FCOL, -0.25)
    d["r3"] = at_eq(col(M("A", "=", "400x", "-", "2x^2", size=54), {0: GRN}), 1, FCOL, -1.35)
    d["cross"] = cross_mark(RED, 0.15).move_to([RCX, RTOP, 0])
    return d


def river_graph():
    ax = graph_axes((0, 220, 100), (0, 24000, 10000), 5.2, 3.1, (3.85, 0.3, 0), (100, 200), (10000, 20000), "A")
    return ax, plot(ax, AR, 0, 200)


# ---------------------------------------------------------------- open box (12 cm sheet)

SK = 0.35                                    # sheet: screen units per cm
SC = np.array([-3.9, -0.45, 0])
SH = 6 * SK                                  # half side of the sheet on screen
BK = 0.38                                    # folded box: screen units per cm
BOARD_FILL = config.background_color
FACE = "#5c4d44"                             # cardboard faces
FACE2 = "#4f433d"
INNER = "#433a35"


def sheet():
    return Square(2 * SH, stroke_color=CHALK, stroke_width=4, fill_color=FACE, fill_opacity=1).move_to(SC)


def corner_cuts(x):
    s = max(x, 0.01) * SK
    g = VGroup()
    for sx, sy in ((-1, 1), (1, 1), (1, -1), (-1, -1)):
        corner = SC + [sx * SH, sy * SH, 0]
        g.add(Square(s, stroke_color=RED, stroke_width=3, fill_color=BOARD_FILL, fill_opacity=1)
              .move_to(corner - [sx * s / 2, sy * s / 2, 0]))
    return g


def fold_lines(x):
    s = x * SK
    a = SH - s
    g = VGroup()
    for p, q in [((-a, SH), (-a, -SH)), ((a, SH), (a, -SH)), ((-SH, a), (SH, a)), ((-SH, -a), (SH, -a))]:
        # only the part between the cuts is a fold
        p, q = np.array([*p, 0.0]), np.array([*q, 0.0])
        if p[0] == q[0]:
            p[1], q[1] = a, -a
        else:
            p[0], q[0] = -a, a
        g.add(DashedLine(SC + p, SC + q, color=DIM, stroke_width=2.5, dash_length=0.09))
    return g


def box_pts(x, c):
    b, h = (12 - 2 * x) * BK, x * BK
    d = np.array([0.35, 0.28, 0]) * b
    c = np.array(c, float)
    p0 = c + [-b / 2 - d[0] / 2, 0, 0]
    p1, p2, p3 = p0 + [b, 0, 0], p0 + [b, h, 0], p0 + [0, h, 0]
    return p0, p1, p2, p3, d


def box_draw(x, c):
    """Open box (no lid) in a light oblique view: inner walls first, then the outer faces over them."""
    p0, p1, p2, p3, d = box_pts(x, c)
    q0, q1, q2, q3 = p0 + d, p1 + d, p2 + d, p3 + d
    st = dict(stroke_color=CHALK, stroke_width=4)
    back = Polygon(q0, q1, q2, q3, fill_color=INNER, fill_opacity=1, **st)
    left = Polygon(p0, q0, q3, p3, fill_color=INNER, fill_opacity=1, **st)
    side = Polygon(p1, q1, q2, p2, fill_color=FACE2, fill_opacity=1, **st)
    front = Polygon(p0, p1, p2, p3, fill_color=FACE, fill_opacity=1, **st)
    return VGroup(back, left, side, front)


BOXC = np.array([3.6, 0.1, 0])              # front-bottom centre of the box in K28_Box


def box_setup():
    d = {}
    d["sheet"] = sheet()
    d["l12r"] = M(r"12\text{ cm}", size=40, color=ORG).next_to(d["sheet"], RIGHT, buff=0.18)
    d["l12b"] = M(r"12\text{ cm}", size=40, color=ORG).next_to(d["sheet"], DOWN, buff=0.18)
    d["V"] = at_eq(col(M("V", "=", "x", "(12-2x)^2", size=56), {0: GRN}), 1, 3.2, -1.75)
    d["dom"] = M("0", "<", "x", "<", "6", size=52).move_to([3.6, -2.75, 0])
    return d


def box_graph():
    ax = axes((0, 6.6, 2), (0, 150, 50), 5.0, 3.3, (3.7, 0.35, 0), x_label="x", y_label="V")
    return ax, plot(ax, VB, 0, 6)


# ---------------------------------------------------------------- can (1 litre)

CR, CHT = 0.62, 2.1                          # radius and height on screen (net drawn at the same scale)
CC = np.array([-5.0, 0.0, 0])
ER = 0.36                                    # ellipse squash
NL = -1.05                                   # net rectangle: left edge
NW = 2 * PI * CR


def can_parts():
    top_c, bot_c = CC + [0, CHT / 2, 0], CC + [0, -CHT / 2, 0]
    top = Ellipse(width=2 * CR, height=2 * CR * ER, stroke_color=CHALK, stroke_width=4).move_to(top_c)
    bf = Arc(radius=1, start_angle=PI, angle=PI, stroke_color=CHALK, stroke_width=4).stretch(CR, 0, about_point=ORIGIN).stretch(CR * ER, 1, about_point=ORIGIN)
    bf.shift(bot_c)
    bb = DashedVMobject(Arc(radius=1, start_angle=0, angle=PI, stroke_color=DIM, stroke_width=2.5)
                        .stretch(CR, 0, about_point=ORIGIN).stretch(CR * ER, 1, about_point=ORIGIN).shift(bot_c), num_dashes=10)
    sl = Line(top_c + [-CR, 0, 0], bot_c + [-CR, 0, 0], color=CHALK, stroke_width=4)
    sr = Line(top_c + [CR, 0, 0], bot_c + [CR, 0, 0], color=CHALK, stroke_width=4)
    return dict(top=top, bf=bf, bb=bb, sl=sl, sr=sr, top_c=top_c, bot_c=bot_c)


def can_side(color=GRN, opacity=0.22):
    """The curved side as one shape (front view): left line, front bottom arc, right line, front top arc."""
    p = can_parts()
    t = np.linspace(PI, 2 * PI, 30)
    bottom = np.column_stack([p["bot_c"][0] + CR * np.cos(t), p["bot_c"][1] + CR * ER * np.sin(t), 0 * t])
    top = np.column_stack([p["top_c"][0] + CR * np.cos(t[::-1]), p["top_c"][1] + CR * ER * np.sin(t[::-1]), 0 * t])
    pts = np.vstack([bottom, top, bottom[:1]])
    return VMobject(stroke_color=color, stroke_width=4, fill_color=color, fill_opacity=opacity).set_points_as_corners(pts)


def net_rect():
    return Rectangle(width=NW, height=CHT, stroke_color=GRN, stroke_width=4, fill_color=GRN,
                     fill_opacity=0.18).move_to([NL + NW / 2, 0, 0])


def net_circle(top=True):
    return Circle(radius=CR, stroke_color=GRN, stroke_width=4, fill_color=GRN, fill_opacity=0.18).move_to(
        [NL + CR + 0.25, (1 if top else -1) * (CHT / 2 + CR), 0])


def can_setup():
    d = can_parts()
    d["can"] = VGroup(d["bb"], d["sl"], d["sr"], d["bf"], d["top"])
    d["fill"] = VGroup(can_side(), Ellipse(width=2 * CR, height=2 * CR * ER, stroke_width=0, fill_color=GRN,
                                             fill_opacity=0.22).move_to(d["top_c"]))
    d["rad"] = Line(d["top_c"], d["top_c"] + [CR, 0, 0], color=ORG, stroke_width=4)
    d["rl"] = M("r", size=44, color=ORG).next_to(d["rad"], UP, buff=0.12)
    d["hl"] = M("h", size=44, color=ORG).next_to(d["sr"], RIGHT, buff=0.2)
    d["vol"] = M(r"1\text{ L}", "=", r"1000\text{ cm}^3", size=48).move_to([5.0, 1.6, 0])
    d["min"] = TX(r"minimize $S$", 48, YEL).move_to([5.0, 0.5, 0])
    d["c1"], d["c2"] = net_circle(True), net_circle(False)
    d["pl1"] = M(r"\pi r^2", size=44, color=GRN).next_to(d["c1"], RIGHT, buff=0.25)
    d["pl2"] = M(r"\pi r^2", size=44, color=GRN).next_to(d["c2"], RIGHT, buff=0.25)
    return d


# ================================================================ 1. what optimization is

def wave(x):
    return 1.6 + 1.3 * np.sin(1.25 * x - 0.6) + 0.12 * x


WMAX = (0.6 + PI / 2) / 1.25
WMIN = (0.6 + 3 * PI / 2) / 1.25


class K28_Best(Shot):
    def body(self):
        self.title("Optimization", "2:51:46.1")
        ax = axes((0, 6, 1), (0, 4, 1), 7.0, 2.5, (0, 0.85, 0), nums=False, x_label="", y_label="")
        cv = plot(ax, wave, 0.2, 5.8)
        top = pt(ax, WMAX, wave(WMAX))
        best = H("best", 42, YEL).next_to(top, UP, buff=0.15)
        self.go("2:51:49.6", Create(ax), run=0.5)
        self.play(draw(cv, 1.2), run_time=1.2)
        self.go("2:51:51.33", FadeIn(top, scale=0.5), FadeIn(best, shift=DOWN * 0.1), run=0.5)

        # four little examples, each on its word
        y0, yl = -1.65, -2.75
        xs = [-5.3, -1.8, 1.8, 5.3]
        i1 = Rectangle(width=1.4, height=0.85, stroke_color=GRN, stroke_width=4, fill_color=GRN,
                       fill_opacity=0.3).move_to([xs[0], y0, 0])
        coin = Circle(radius=0.42, color=ORG, stroke_width=4).move_to([xs[1] - 0.25, y0, 0])
        i2 = VGroup(coin, M(r"\$", size=48, color=ORG).move_to(coin), arr([xs[1] + 0.5, y0 + 0.35, 0], [xs[1] + 0.5, y0 - 0.4, 0], DIM, 4, 0.15))
        a, b = np.array([xs[2] - 0.75, y0 - 0.3, 0]), np.array([xs[2] + 0.75, y0 + 0.3, 0])
        wig = VMobject(stroke_color=DIM, stroke_width=3).set_points_smoothly(
            [a, a + [0.3, 0.55, 0], a + [0.85, 0.15, 0], b + [-0.3, 0.45, 0], b])
        i3 = VGroup(DashedVMobject(wig, num_dashes=14), Line(a, b, color=CHALK, stroke_width=4),
                    Dot(a, radius=0.08, color=ORG), Dot(b, radius=0.08, color=ORG))
        i4 = VGroup(*[Rectangle(width=0.32, height=h, stroke_color=GRN, stroke_width=3, fill_color=GRN, fill_opacity=0.3)
                      .move_to([xs[3] - 0.45 + 0.45 * k, y0 - 0.45 + h / 2, 0]) for k, h in enumerate((0.35, 0.6, 0.95))])
        labs = [H(s, 34).move_to([x, yl, 0]) for s, x in zip(
            ("biggest area", "smallest cost", "shortest distance", "most profit"), xs)]
        for t, ic, lb in zip(("2:51:53.2", "2:51:54.65", "2:51:56.2", "2:51:57.85"), (i1, i2, i3, i4), labs):
            self.go(t, FadeIn(ic, shift=UP * 0.1), FadeIn(lb), run=0.5)
        icons = VGroup(i1, i2, i3, i4, *labs)
        self.go("2:52:02.1", Circumscribe(VGroup(*labs), color=YEL, stroke_width=3, buff=0.15), run=1.0)

        # the tool from the last chapter: f' = 0, the critical points, keep the best
        fp = M("f'(x)", "=", "0", size=56, color=PINK).move_to([0, -2.1, 0])
        self.go("2:52:04.1", FadeOut(icons), run=0.5)
        self.go("2:52:05.4", Write(fp), run=0.8)
        low = pt(ax, WMIN, wave(WMIN))
        t1, t2 = tangent(ax, wave, WMAX, 1.6), tangent(ax, wave, WMIN, 1.6)
        self.go("2:52:08.85", Create(t1), Create(t2), FadeIn(low, scale=0.5), run=0.7)
        tick = tick_mark(GRN, 0.5).next_to(best, RIGHT, buff=0.2)
        self.go("2:52:10.4", Create(tick), top.animate.set_color(GRN), run=0.6)

        # teaser: L'Hopital's Rule for 0/0
        self.wipe("2:52:11.85")
        nxt = H("next:", 40, DIM).move_to([-3.6, 1.1, 0])
        lh = H("L'Hôpital's Rule", 58, YEL).next_to(nxt, RIGHT, buff=0.35)
        VGroup(nxt, lh).move_to([0, 1.1, 0])
        self.go("2:52:13.05", FadeIn(nxt), Write(lh), run=0.9)
        lim = M(r"\lim_{x\to a}\frac{f(x)}{g(x)}", "=", r"\frac{0}{0}", size=64).move_to([0, -1.55, 0])
        lim[2].set_color(RED)
        short = H("a shortcut for", 40, DIM).move_to([0, 0.05, 0])
        self.go("2:52:15.45", FadeIn(short, shift=UP * 0.1), Write(lim[0]), run=0.8)
        self.go("2:52:16.85", Write(lim[1:]), run=0.7)
        self.go("2:52:17.8", Circumscribe(lim[2], color=RED, stroke_width=3), run=0.9)
        self.wipe("2:52:19.0")


# ================================================================ 2. the six steps

CELLS = [(-4.4, 0.95), (0.0, 0.95), (4.4, 0.95), (-4.4, -2.05), (0.0, -2.05), (4.4, -2.05)]
NAMES = ["Draw and label", "Objective", "Constraint", "Domain", "Critical points", "Check, answer"]


def step_head(k, hot=True):
    cx, cy = CELLS[k]
    h = VGroup(H(f"{k + 1}.", 42, YEL), H(NAMES[k], 40, YEL if hot else CHALK)).arrange(RIGHT, buff=0.18)
    return h.move_to([cx, cy + 0.85, 0])


def icon_c(k):
    cx, cy = CELLS[k]
    return np.array([cx, cy - 0.4, 0])


def step_icons_top():
    """Steps 1-3, each a list of parts in drawing order (final state of step 3 handled in K28_StepsA)."""
    c1, c2, c3 = icon_c(0), icon_c(1), icon_c(2)
    rect = Rectangle(width=2.0, height=1.05, stroke_color=CHALK, stroke_width=5).move_to(c1 + [0.15, 0.1, 0])
    labs = VGroup(M("x", size=44, color=ORG).next_to(rect, DOWN, buff=0.12),
                  M("y", size=44, color=ORG).next_to(rect, LEFT, buff=0.15))
    mm = H("max or min?", 36, DIM).move_to(c2 + [0, 0.55, 0])
    obj = col(M("A", "=", "x", "y", size=56), {0: GRN}).move_to(c2 + [0, -0.25, 0])
    ul = brush_line(obj.width + 0.4, center=obj.get_bottom() + DOWN * 0.14, seed=3)
    two = col(M("A", "=", "x", "y", size=50), {0: GRN, 2: ORG, 3: ORG}).move_to(c3 + [0, 0.42, 0])
    con = M("x", "+", "y", "=", "10", size=46).move_to(c3 + [0, -0.42, 0])
    con2 = M("y", "=", "10", "-", "x", size=46).move_to(c3 + [0, -0.42, 0])
    one = col(M("A", "=", "x", "(10-x)", size=50), {0: GRN}).move_to(c3 + [0, 0.42, 0])
    return dict(rect=rect, labs=labs, mm=mm, obj=obj, ul=ul, two=two, con=con, con2=con2, one=one)


def step4_icon():
    c = icon_c(3)
    y = c[1] - 0.1
    z, ten = c[0] - 0.9, c[0] + 1.1
    nl = Line([c[0] - 1.7, y, 0], [c[0] + 1.75, y, 0], color=DIM, stroke_width=3)
    ticks = VGroup(*[Line([v, y + 0.12, 0], [v, y - 0.12, 0], color=DIM, stroke_width=3) for v in (z, ten)])
    nums = VGroup(M("0", size=34, color=FAINT).next_to([z, y - 0.12, 0], DOWN, buff=0.1),
                  M("10", size=34, color=FAINT).next_to([ten, y - 0.12, 0], DOWN, buff=0.1))
    ok = Line([z, y, 0], [ten, y, 0], color=YEL, stroke_width=9)
    bad = VGroup(Line([c[0] - 1.65, y, 0], [z - 0.08, y, 0], color=RED, stroke_width=7),
                 cross_mark(RED, 0.16).move_to([(c[0] - 1.65 + z) / 2, y + 0.45, 0]))
    return VGroup(nl, ticks, nums), ok, bad


def hill(t):
    return 0.45 - 0.42 * t * t


def step6_icons():
    c = icon_c(5)
    xs = [c[0] - 1.35, c[0], c[0] + 1.35]
    yt, yb = c[1] + 0.25, c[1] - 0.5
    a = VGroup(bowl(False, 0.7, 0.28, PURP, 5).move_to([xs[0], yt, 0]), M("A''<0", size=36, color=PURP).move_to([xs[0], yb, 0]))
    b = VGroup(dir_arrow([xs[1] - 0.32, yt, 0], True, s=0.17), Dot([xs[1], yt + 0.2, 0], radius=0.07, color=ORG),
               dir_arrow([xs[1] + 0.32, yt, 0], False, s=0.17), M("+", r"\;", "-", size=40, color=PINK).move_to([xs[1], yb, 0]))
    seg_c = mini_curve([xs[2], yt - 0.05, 0], lambda t: 0.2 - 0.6 * t * t, -0.5, 0.5, sw=4)
    ends = VGroup(Dot(seg_c.get_start(), radius=0.07, color=ORG), Dot(seg_c.get_end(), radius=0.07, color=ORG))
    c3 = VGroup(seg_c, ends, H("ends", 34, DIM).move_to([xs[2], yb, 0]))
    return a, b, c3


class K28_StepsA(Shot):
    def body(self):
        self.title("Optimization", animate=False)   # K28_Best ends on the 0/0 teaser
        self.wipe("2:52:19.5")
        self.title("Word Problems", "2:52:20.0")
        lc = H("the calculus", 46).move_to([-3.6, 0.7, 0])
        ls = H("the set-up", 46).move_to([-3.6, -0.7, 0])
        x0 = -1.6
        bc = Rectangle(width=1.3, height=0.42, stroke_color=GRN, stroke_width=3, fill_color=GRN, fill_opacity=0.35)
        bc.move_to([x0 + 0.65, 0.7, 0])
        bs = Rectangle(width=5.2, height=0.42, stroke_color=RED, stroke_width=3, fill_color=RED, fill_opacity=0.3)
        bs.move_to([x0 + 2.6, -0.7, 0])
        easy = H("easy", 40, GRN).next_to(bc, RIGHT, buff=0.25)
        hard = H("hard", 40, RED).next_to(bs, RIGHT, buff=0.25)
        self.go("2:52:23.13", FadeIn(lc, shift=RIGHT * 0.1), run=0.5)
        self.go("2:52:24.6", GrowFromEdge(bc, LEFT), FadeIn(easy), run=0.6)
        self.go("2:52:25.95", FadeIn(ls, shift=RIGHT * 0.1), run=0.5)
        self.go("2:52:26.6", GrowFromEdge(bs, LEFT), run=1.0)
        self.play(FadeIn(hard), run_time=0.4)

        self.wipe("2:52:28.1")
        self.title("The Six Steps", "2:52:28.6")
        ic = step_icons_top()
        h1 = step_head(0)
        self.go("2:52:30.85", FadeIn(h1, shift=DOWN * 0.1), run=0.5)
        self.go("2:52:33.11", draw(ic["rect"], 1.0), run=1.0)
        self.go("2:52:34.6", FadeIn(ic["labs"], scale=0.8), run=0.6)
        h2 = step_head(1)
        self.go("2:52:36.91", FadeIn(h2, shift=DOWN * 0.1), h1[1].animate.set_color(CHALK), run=0.5)
        self.go("2:52:39.5", FadeIn(ic["mm"]), run=0.5)
        self.go("2:52:41.4", Write(ic["obj"]), run=0.8)
        self.go("2:52:43.9", Create(ic["ul"]), ic["mm"].animate.set_opacity(0.35), run=0.6)
        h3 = step_head(2)
        self.go("2:52:45.55", FadeIn(h3, shift=DOWN * 0.1), h2[1].animate.set_color(CHALK), run=0.5)
        self.go("2:52:47.5", TransformFromCopy(ic["obj"], ic["two"]), run=0.8)
        self.go("2:52:48.4", *[Circumscribe(ic["two"][k], shape=Circle, color=ORG, stroke_width=3) for k in (2, 3)], run=0.9)
        self.go("2:52:51.85", Write(ic["con"]), run=0.7)
        self.go("2:52:53.1", TransformMatchingTex(ic["con"], ic["con2"]), run=0.8)
        self.go("2:52:55.9", TransformMatchingTex(ic["two"], ic["one"]), ic["con2"].animate.set_opacity(0.35), run=0.9)
        self.go("2:52:57.3", h3[1].animate.set_color(CHALK), run=0.4)


class K28_StepsB(Shot):
    def body(self):
        self.title("The Six Steps", animate=False)
        ic = step_icons_top()
        ic["mm"].set_opacity(0.35)
        ic["con2"].set_opacity(0.35)
        self.add(*[step_head(k, False) for k in range(3)], ic["rect"], ic["labs"], ic["mm"], ic["obj"], ic["ul"],
                 ic["one"], ic["con2"])
        base, ok, bad = step4_icon()
        h4 = step_head(3)
        self.go("2:52:58.8", FadeIn(h4, shift=DOWN * 0.1), Create(base), run=0.6)
        self.go("2:53:01.1", Create(ok), run=0.6)
        self.go("2:53:02.95", FadeIn(bad), run=0.5)

        h5 = step_head(4)
        c5 = icon_c(4)
        hc = mini_curve(c5 + [0, 0.05, 0], hill, -1.3, 1.3)
        tt = ValueTracker(-1.05)

        def tan5():
            t = tt.get_value()
            p = c5 + [t, 0.05 + hill(t), 0]
            d = np.array([1, -0.84 * t, 0])
            d /= np.linalg.norm(d)
            return Line(p - d * 0.55, p + d * 0.55, color=PINK, stroke_width=5)
        tl = always_redraw(tan5)
        tdot = always_redraw(lambda: Dot(c5 + [tt.get_value(), 0.05 + hill(tt.get_value()), 0], radius=0.07, color=PINK))
        lab5 = M("A'", "=", "0", size=40, color=PINK).move_to(c5 + [0, -0.62, 0])
        self.go("2:53:05.15", FadeIn(h5, shift=DOWN * 0.1), h4[1].animate.set_color(CHALK), run=0.5)
        self.go("2:53:06.4", draw(hc, 0.8), run=0.8)
        live_in(self, tl, tdot, run=0.3)
        self.go("2:53:07.6", tt.animate.set_value(0), run=1.5)
        unclock(tl, tdot)
        self.go("2:53:09.35", Write(lab5), tdot.animate.set_color(ORG), run=0.6)

        h6 = step_head(5)
        a, b, c = step6_icons()
        self.go("2:53:10.85", FadeIn(h6, shift=DOWN * 0.1), h5[1].animate.set_color(CHALK), run=0.5)
        self.go("2:53:16.17", FadeIn(a, shift=UP * 0.1), run=0.5)
        self.go("2:53:17.5", FadeIn(b, shift=UP * 0.1), run=0.5)
        self.go("2:53:19.5", Create(c[0]), FadeIn(c[1:]), run=0.6)

        # then answer the question that was asked
        self.wipe("2:53:21.1")
        self.title("Answer the Question", "2:53:21.5")
        q = H("What was asked?", 52).move_to([0, 0.9, 0])
        p1 = pill("the dimensions?", ORG, 42).move_to([-2.7, -0.9, 0])
        p2 = pill("the area?", GRN, 42).move_to([2.7, -0.9, 0])
        self.go("2:53:22.2", FadeIn(q, shift=DOWN * 0.1), run=0.6)
        self.go("2:53:25.25", FadeIn(p1, shift=UP * 0.1), run=0.5)
        self.go("2:53:27.1", FadeIn(p2, shift=UP * 0.1), run=0.5)
        self.go("2:53:28.1", Create(brush_line(q.width + 0.4, center=q.get_bottom() + DOWN * 0.15, seed=5)), run=0.6)
        self.wipe("2:53:29.2")


# ================================================================ 3. the fence: set-up

class K28_Fence(Shot):
    def body(self):
        self.title("Answer the Question", animate=False)
        self.wipe("2:53:29.7")
        self.title("The Fence Problem", "2:53:30.1")
        d = fence_setup()
        self.go("2:53:32.35", Write(d["top"]), run=0.9)
        self.go("2:53:34.95", draw(d["rect"], 1.0), run=1.0)
        q = H("biggest area?", 38, YEL).move_to(d["rect"])
        self.go("2:53:37.7", FadeIn(q, shift=UP * 0.1), run=0.5)
        self.go("2:53:40.2", FadeOut(q), run=0.4)
        self.go("2:53:41.13", FadeIn(d["xl"], scale=0.8), run=0.5)
        self.go("2:53:42.25", FadeIn(d["yl"], scale=0.8), run=0.5)
        self.go("2:53:43.4", FadeIn(d["lmax"], shift=RIGHT * 0.1), run=0.5)
        self.go("2:53:44.95", Write(d["r1"]), run=0.9)
        self.go("2:53:47.8", FadeIn(d["lcon"], shift=RIGHT * 0.1), run=0.5)
        self.go("2:53:48.7", Circumscribe(d["top"], color=YEL, stroke_width=3), run=0.9)
        trace = d["rect"].copy().set_fill(opacity=0).set_stroke(YEL, 8)
        self.go("2:53:49.85", draw(trace, 1.2), run=1.2)
        self.play(FadeOut(trace), run_time=0.4)
        r2a = d["r2a"]
        self.go("2:53:51.97", Write(r2a[0]), run=0.5)
        self.go("2:53:52.61", Write(r2a[1:3]), run=0.6)
        self.go("2:53:53.67", Write(r2a[3:]), run=0.6)
        half = M(r"\div 2", size=44, color=YEL).next_to(r2a, RIGHT, buff=0.35)
        self.go("2:53:55.2", FadeIn(half, shift=LEFT * 0.1), run=0.5)
        self.go("2:53:56.71", TransformMatchingTex(r2a, d["r2b"]), FadeOut(half), run=0.9)
        self.go("2:53:59.0", TransformMatchingTex(d["r2b"], d["r2c"]), run=0.9)
        self.go("2:54:01.7", d["r1"][3].animate.set_color(YEL), d["r2c"][0].animate.set_color(YEL), run=0.5)
        r3 = d["r3"]
        self.go("2:54:03.75", TransformFromCopy(d["r1"][0:3], r3[0:3]), TransformFromCopy(d["r2c"][2:], r3[3]), run=1.0)
        r4 = d["r4"]
        self.go("2:54:07.1", Write(r4[0:3]), run=0.8)
        self.go("2:54:08.1", Write(r4[3:]), run=0.6)
        self.go("2:54:09.75", Create(box(r4, YEL)), FadeIn(d["one"], shift=UP * 0.1), run=0.6)


# ================================================================ 4. the fence: one tracker, the field and A(x)

class K28_FenceMax(Shot):
    def body(self):
        self.title("The Fence Problem", animate=False)
        d = fence_setup()
        d["r1"][3].set_color(YEL)
        d["r2c"][0].set_color(YEL)
        bx = box(d["r4"], YEL)
        col_rest = VGroup(d["top"], d["r1"], d["r2c"], d["r3"], d["lmax"], d["lcon"], d["one"], bx)
        self.add(d["rect"], d["xl"], d["yl"], col_rest, d["r4"])

        ax, cv = fence_graph()
        R1, R2 = -2.3, -3.2
        self.go("2:54:11.95", FadeOut(col_rest), d["r4"].animate.move_to([3.85, R1, 0]), run=0.6)
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.6)
        self.play(draw(cv, 1.0), run_time=1.0)
        dom = Line(ax.c2p(0, 0), ax.c2p(200, 0), color=YEL, stroke_width=9)
        domt = M("0", "<", "x", "<", "200", size=50).move_to([3.85, R2, 0])
        self.go("2:54:14.2", Create(dom), Write(domt), run=0.7)

        # go live: one tracker drives the field, its labels, the area readout and the dot on A(x)
        xt = ValueTracker(FX0)
        X = xt.get_value
        rect = always_redraw(lambda: fence_rect(X()))
        xl = live("x =", X, lambda: fence_xpos(X()), ORG, 38)
        yl = live("y =", lambda: 200 - X(), lambda: F0 + [-0.2, (200 - X()) * FS / 2, 0], ORG, 38, edge="right")
        area_ro = live("A =", lambda: AF(X()), lambda: [-5.3, 2.05, 0], GRN, 46, suf=r"\,\text{m}^2", edge="left")
        dot = live_dot(ax, AF, xt)
        self.remove(d["rect"])
        self.add(rect)
        self.play(FadeOut(d["xl"]), FadeOut(d["yl"]), run_time=0.3)
        live_in(self, xl, yl, area_ro, dot, run=0.4)
        self.go("2:54:15.85", xt.animate.set_value(22), run=1.3)
        self.play(xt.animate.set_value(178), run_time=1.5)

        # derivative, set to zero, slide to the flat top
        tan = live_tan(ax, AF, xt)
        d1 = col(M("A'", "=", "200", "-", "2x", size=50), {0: PINK}).move_to([3.85, R2, 0])
        self.go("2:54:18.7", FadeOut(dom), FadeOut(domt), run=0.3)
        self.play(Write(d1), run_time=0.8)
        live_in(self, tan, run=0.3)
        d2 = col(M("200", "-", "2x", "=", "0", size=50), {}).move_to([3.85, R2, 0])
        self.go("2:54:21.9", TransformMatchingTex(d1, d2), run=0.5)
        self.play(xt.animate.set_value(100), run_time=1.2)
        xs = col(M("x", "=", "100", size=50), {2: ORG}).move_to([2.3, R2, 0])
        self.go("2:54:23.7", ReplacementTransform(d2, xs), run=0.6)
        ys = M("y", "=", "200", "-", "100", size=50).move_to([5.1, R2, 0])
        ys2 = col(M("y", "=", "100", size=50), {2: ORG}).move_to([5.1, R2, 0])
        self.go("2:54:25.2", Write(ys), run=0.8)
        self.go("2:54:28.0", TransformMatchingTex(ys, ys2), run=0.6)

        # check: A'' = -2 < 0, concave down, max
        a2 = col(M("A''", "=", "-2", "<", "0", size=50), {0: PURP}).move_to([3.85, R1, 0])
        self.go("2:54:29.1", FadeOut(d["r4"], shift=UP * 0.1), run=0.4)
        self.go("2:54:30.3", Write(a2[0:3]), run=0.7)
        self.go("2:54:32.85", Write(a2[3:]), run=0.5)
        peak = ax.c2p(100, 10000)
        frown = bowl(False, 0.75, 0.3, PURP, 5).move_to(peak + np.array([1.6, 0.1, 0]))
        self.go("2:54:33.85", Create(frown), run=0.6)
        mx = H("max", 40, YEL).next_to(peak, UP, buff=0.22)
        unclock(tan)
        self.go("2:54:35.2", FadeIn(mx, shift=DOWN * 0.1), run=0.5)

        # a square: 100 by 100, 10,000 m^2
        self.go("2:54:37.8", Circumscribe(rect, color=YEL, stroke_width=3, buff=0.1), run=1.0)
        ab0 = answer_box(area_ro)
        self.go("2:54:41.4", Create(ab0), run=0.6)
        self.remove(ab0)
        self.add(always_redraw(lambda: answer_box(area_ro)))

        # general fact: fixed perimeter -> square; wiggle off the square and back to show the drop
        fact = VGroup(H("fixed perimeter", 40, YEL), M(r"\Rightarrow", size=46), H("square", 40, GRN)).arrange(RIGHT, buff=0.25)
        fact.move_to([3.4, -2.75, 0])
        self.go("2:54:44.9", FadeOut(VGroup(a2, xs, ys2, tan)), run=0.4)
        self.play(FadeIn(fact, shift=UP * 0.1), run_time=0.6)
        self.go("2:54:46.6", xt.animate.set_value(60), run=1.2)
        self.play(xt.animate.set_value(100), run_time=1.2)
        freeze_wipe(self, "2:54:49.75")


# ================================================================ 5. the river: set-up

class K28_River(Shot):
    def body(self):
        self.title("The Fence Problem", animate=False)   # K28_FenceMax ends on a clean board
        self.title("Now Add a River", "2:54:50.6")
        d = river_setup()
        area, bank, fence = d["field"]
        self.go("2:54:52.15", Write(d["top"]), run=0.8)
        self.go("2:54:54.6", draw(fence, 1.0), FadeIn(area), run=1.0)
        self.go("2:54:56.0", *[Create(w) for w in d["waves"][:3]], FadeIn(d["waves"][3]), Create(bank), run=0.9)
        self.go("2:54:57.7", FadeIn(d["cross"], scale=0.7), run=0.4)
        q = H("biggest area?", 34, YEL).move_to(area)
        self.go("2:54:59.3", FadeIn(q, shift=UP * 0.1), run=0.5)
        self.go("2:55:01.3", FadeOut(q), run=0.3)
        self.go("2:55:02.65", FadeIn(d["yl"], scale=0.8), run=0.5)
        self.go("2:55:04.4", FadeIn(d["xl"], scale=0.8), run=0.5)
        self.go("2:55:06.0", FadeIn(d["xr"], scale=0.8), run=0.5)
        trace = fence.copy().set_stroke(YEL, 8)
        self.go("2:55:07.9", draw(trace, 1.0), run=1.0)
        self.play(FadeOut(trace), run_time=0.4)
        r1a = d["r1a"]
        self.go("2:55:10.0", Write(r1a[0]), run=0.5)
        self.go("2:55:10.65", Write(r1a[1:3]), run=0.5)
        self.go("2:55:11.55", Write(r1a[3:]), run=0.6)
        self.go("2:55:13.3", TransformMatchingTex(r1a, d["r1b"]), run=0.9)
        r2 = d["r2"]
        self.go("2:55:16.65", Write(r2[0:2]), run=0.5)
        self.go("2:55:17.75", Write(r2[2:]), run=1.0)
        r3 = d["r3"]
        self.go("2:55:20.8", Write(r3[0:3]), run=0.7)
        self.go("2:55:21.7", Write(r3[3:]), run=0.6)
        self.go("2:55:22.6", Create(box(r3, YEL)), run=0.5)


# ================================================================ 6. the river: the tracker, 100 by 200, twice the area

class K28_RiverMax(Shot):
    def body(self):
        self.title("Now Add a River", animate=False)
        d = river_setup()
        bx = box(d["r3"], YEL)
        rest = VGroup(d["top"], d["r1b"], d["r2"], bx)
        self.add(d["waves"], d["field"], d["cross"], d["yl"], d["xl"], d["xr"], rest, d["r3"])
        ax, cv = river_graph()
        R1, R2 = -2.3, -3.2
        self.go("2:55:23.85", FadeOut(rest), d["r3"].animate.move_to([3.85, R1, 0]), run=0.45)
        self.play(Create(ax), FadeIn(ax.labels), run_time=0.45)
        d1 = col(M("A'", "=", "400", "-", "4x", size=50), {0: PINK}).move_to([3.85, R2, 0])
        self.go("2:55:24.95", Write(d1), draw(cv, 0.9), run=0.9)

        xt = ValueTracker(RX0)
        X = xt.get_value
        field = always_redraw(lambda: river_field(X()))
        yl = live("y =", lambda: 400 - 2 * X(), lambda: river_ypos(X()), ORG, 38)
        xr = live("x =", X, lambda: river_xpos_r(X()), ORG, 38, edge="left")
        xl = d["xl"].copy().add_updater(lambda m: m.move_to(river_xpos(X(), m.width)))
        ro = live("A =", lambda: AR(X()), lambda: [-5.6, -3.1, 0], GRN, 46, suf=r"\,\text{m}^2", edge="left")
        dot, tan = live_dot(ax, AR, xt), live_tan(ax, AR, xt)
        self.remove(d["field"], d["xl"])
        self.add(field, xl)
        self.play(FadeOut(d["yl"]), FadeOut(d["xr"]), run_time=0.3)
        live_in(self, yl, xr, ro, dot, tan, run=0.4)
        self.go("2:55:27.3", xt.animate.set_value(100), run=1.2)
        xs = col(M("x", "=", "100", size=50), {2: ORG}).move_to([2.3, R2, 0])
        self.go("2:55:28.5", ReplacementTransform(d1, xs), run=0.5)
        ys = M("y", "=", "400", "-", "200", size=50).move_to([5.1, R2, 0])
        ys2 = col(M("y", "=", "200", size=50), {2: ORG}).move_to([5.1, R2, 0])
        self.go("2:55:30.2", Write(ys), run=0.8)
        self.go("2:55:32.9", TransformMatchingTex(ys, ys2), run=0.5)
        unclock(field, tan)
        self.go("2:55:34.7", Circumscribe(field, color=YEL, stroke_width=3, buff=0.1), run=1.0)
        ab0 = answer_box(ro)
        self.go("2:55:37.6", Create(ab0), run=0.6)

        # twice as much: the fence curve on the same axes
        old = DashedVMobject(plot(ax, AF, 0, 200, color=DIM, width=4), num_dashes=40)
        self.go("2:55:39.7", FadeOut(tan), draw(old, 1.0), run=1.0)
        top_new, top_old = ax.c2p(100, 20000), ax.c2p(100, 10000)
        two = arr(top_old + UP * 0.08, top_new + DOWN * 0.14, YEL, 4, 0.16)
        tl = M(r"2\times", size=44, color=YEL).next_to(two, RIGHT, buff=0.15)
        self.go("2:55:41.4", GrowArrow(two), FadeIn(tl, shift=LEFT * 0.1), run=0.6)
        freeze_wipe(self, "2:55:44.15")


# ================================================================ 7. the open box: sheet, cuts, fold, V(x), domain

def box_live(xt, c=BOXC):
    """Every moving piece of the box board, driven by one tracker (cm of the corner squares)."""
    X = xt.get_value
    o = {}
    o["cuts"] = always_redraw(lambda: corner_cuts(X()))
    o["folds"] = always_redraw(lambda: fold_lines(max(X(), 0.05)))
    o["box"] = always_redraw(lambda: box_draw(X(), c))
    o["xa"] = M("x", size=40, color=ORG).add_updater(lambda m: m.move_to(SC + [-SH + X() * SK / 2, SH + 0.26, 0]))
    o["xb"] = M("x", size=40, color=ORG).add_updater(lambda m: m.move_to(SC + [-SH - 0.26, SH - X() * SK / 2, 0]))
    o["xh"] = M("x", size=40, color=ORG).add_updater(
        lambda m: m.move_to((box_pts(X(), c)[0] + box_pts(X(), c)[3]) / 2 + LEFT * 0.28))
    o["bb"] = M("12-2x", size=38, color=ORG).add_updater(
        lambda m: m.move_to((box_pts(X(), c)[0] + box_pts(X(), c)[1]) / 2 + DOWN * 0.3))
    o["ro"] = live("V =", lambda: VB(X()), lambda: c + [0, -0.95, 0], GRN, 46, suf=r"\,\text{cm}^3")
    for k in ("xa", "xb", "xh", "bb"):
        o[k].update()          # place the labels now, not on their first frame
    return o


class K28_Box(Shot):
    def body(self):
        self.title("Now Add a River", animate=False)   # K28_RiverMax ends on a clean board
        self.title("The Open Box", "2:55:45.0")
        d = box_setup()
        xt = ValueTracker(0.01)
        o = box_live(xt)
        self.go("2:55:47.75", draw(d["sheet"], 1.0), run=1.0)
        self.go("2:55:49.1", FadeIn(d["l12b"]), FadeIn(d["l12r"]), run=0.5)
        self.at("2:55:51.75")
        self.add(o["cuts"])
        self.play(xt.animate.set_value(2.5), run_time=1.2)
        folds0, box0 = fold_lines(2.5), box_draw(2.5, BOXC)
        self.go("2:55:54.15", Create(folds0), run=0.5)
        self.play(FadeIn(box0, shift=UP * 0.2), run_time=1.0)
        p0, p1, p2, p3, dd = box_pts(2.5, BOXC)
        rim = (p3 + p2) / 2 + dd / 2
        lid = H("no lid", 36, YEL).move_to([6.0, 2.05, 0])
        lid_a = CurvedArrow(lid.get_left() + LEFT * 0.08, rim + RIGHT * 0.25, angle=0.5, color=YEL, stroke_width=3, tip_length=0.15)
        self.go("2:55:56.5", FadeIn(lid), Create(lid_a), run=0.5)

        # how big should the squares be? try a few
        self.remove(folds0, box0)
        self.add(o["folds"], o["box"])
        self.go("2:55:57.6", FadeOut(lid), FadeOut(lid_a), run=0.3)
        live_in(self, o["ro"], run=0.4)
        self.go("2:55:58.4", xt.animate.set_value(1.0), run=1.0)
        self.play(xt.animate.set_value(4.3), run_time=1.3)
        self.play(xt.animate.set_value(2.5), run_time=0.8)
        self.go("2:56:03.7", FadeIn(o["xa"]), FadeIn(o["xb"]), run=0.5)
        self.go("2:56:07.5", FadeIn(o["xh"]), run=0.5)
        self.go("2:56:09.4", Circumscribe(d["l12b"], color=YEL, stroke_width=3), run=0.9)
        y = SC[1] - SH
        cut_l = Line(SC + [-SH, -SH, 0], SC + [-SH + 2.5 * SK, -SH, 0], color=RED, stroke_width=8)
        cut_r = Line(SC + [SH - 2.5 * SK, -SH, 0], SC + [SH, -SH, 0], color=RED, stroke_width=8)
        lx1 = M("x", size=40, color=RED).next_to(cut_l, DOWN, buff=0.15)
        lx2 = M("x", size=40, color=RED).next_to(cut_r, DOWN, buff=0.15)
        mid = M("12-2x", size=40, color=ORG).move_to([SC[0], y - 0.33, 0])
        self.go("2:56:10.95", FadeOut(d["l12b"]), Create(cut_l), Create(cut_r), FadeIn(lx1), FadeIn(lx2), run=0.6)
        self.go("2:56:13.1", Write(mid), run=0.6)
        self.go("2:56:13.9", FadeIn(o["bb"]), run=0.5)

        V = d["V"]
        self.go("2:56:16.1", Write(V[0:2]), run=0.5)
        self.go("2:56:17.1", Write(V[2]), run=0.4)
        self.go("2:56:17.95", Write(V[3]), run=0.8)
        self.go("2:56:20.3", FadeOut(VGroup(cut_l, cut_r, lx1, lx2, mid)), run=0.4)
        self.go("2:56:21.35", Write(d["dom"]), run=0.8)
        self.go("2:56:25.0", xt.animate.set_value(5.85), run=1.4)
        self.go("2:56:26.95", xt.animate.set_value(2.5), run=0.8)


# ================================================================ 8. the open box: expand, differentiate, factor

def box_rows():
    X0 = -0.9
    r = {}
    r["r0"] = at_eq(col(M("V", "=", "x", "(12-2x)^2", size=62), {0: GRN}), 1, X0, 1.6)
    r["r1"] = at_eq(M("(12-2x)^2", "=", "144", "-48x", "+4x^2", size=62), 1, X0, 0.4)
    r["r2"] = at_eq(col(M("V", "=", "4x^3", "-48x^2", "+144x", size=62), {0: GRN}), 1, X0, -0.8)
    r["r2u"] = r["r2"].copy().shift(UP * (1.6 + 0.8))
    r["r3"] = at_eq(col(M("V'", "=", "12x^2", "-96x", "+144", size=62), {0: PINK}), 1, X0, 0.4)
    r["r4"] = at_eq(col(M("V'", "=", "12", "(x^2-8x+12)", size=62), {0: PINK}), 1, X0, -0.8)
    r["r4b"] = at_eq(col(M("V'", "=", "12", "(x-2)", "(x-6)", size=62), {0: PINK}), 1, X0, -0.8)
    r["r5"] = col(M("x", "=", "2", r"\quad\text{or}\quad", "x", "=", "6", size=62), {2: ORG, 6: ORG, 3: DIM})
    at_eq(r["r5"], 1, X0 - 1.8, -2.1)
    return r


class K28_BoxAlgebra(Shot):
    def body(self):
        self.title("The Open Box", animate=False)
        d = box_setup()
        o = box_live(ValueTracker(2.5))
        board = [d["sheet"], o["cuts"], o["folds"], d["l12r"], o["xa"], o["xb"], o["box"], o["xh"], o["bb"], o["ro"], d["dom"]]
        self.add(*board, d["V"])
        unclock(*board)
        r = box_rows()
        self.go("2:56:28.1", FadeOut(VGroup(*board)), ReplacementTransform(d["V"], r["r0"]), run=0.7)
        self.go("2:56:28.8", Circumscribe(r["r0"][3], color=YEL, stroke_width=3), run=0.9)
        r1 = r["r1"]
        self.go("2:56:30.9", TransformFromCopy(r["r0"][3], r1[0]), run=0.8)
        self.go("2:56:32.8", Write(r1[1:3]), run=0.5)
        self.go("2:56:33.5", Write(r1[3]), run=0.6)
        self.go("2:56:35.25", Write(r1[4]), run=0.6)
        self.go("2:56:37.0", r["r0"][2].animate.set_color(YEL), run=0.4)
        r2 = r["r2"]
        self.go("2:56:38.4", Write(r2[0:2]), run=0.4)
        self.go("2:56:39.05", Write(r2[2]), run=0.5)
        self.go("2:56:39.95", Write(r2[3]), run=0.6)
        self.go("2:56:41.55", Write(r2[4]), run=0.6)

        r3 = r["r3"]
        self.go("2:56:43.8", FadeOut(r["r0"]), FadeOut(r1), run=0.3)
        self.play(r2.animate.move_to(r["r2u"]), run_time=0.4)
        self.go("2:56:44.5", Write(r3[0:2]), run=0.4)
        self.go("2:56:45.1", Write(r3[2]), run=0.5)
        self.go("2:56:46.1", Write(r3[3]), run=0.5)
        self.go("2:56:47.5", Write(r3[4]), run=0.5)
        r4 = r["r4"]
        self.go("2:56:48.6", r2.animate.set_opacity(0.35), run=0.4)
        self.go("2:56:49.55", Write(r4[0:3]), run=0.6)
        self.go("2:56:50.7", Write(r4[3]), run=0.9)
        self.go("2:56:54.25", TransformMatchingTex(r4, r["r4b"]), run=1.0)
        r5 = r["r5"]
        self.go("2:56:58.9", Write(r5[0:3]), run=0.6)
        self.go("2:57:00.3", Write(r5[3:]), run=0.7)


# ================================================================ 9. the open box: V(x) and the best box

BOXC2 = np.array([-3.6, -0.9, 0])


class K28_BoxMax(Shot):
    def body(self):
        self.title("The Open Box", animate=False)
        r = box_rows()
        r["r2u"].set_opacity(0.35)
        rest = VGroup(r["r2u"], r["r3"], r["r4b"])
        self.add(rest, r["r5"])
        ax, cv = box_graph()
        r5 = r["r5"]
        self.go("2:57:01.8", FadeOut(rest), r5.animate.scale(0.85).move_to([-3.6, 2.0, 0]), run=0.6)
        st6 = strike(r5[4:7])
        self.play(Create(ax), FadeIn(ax.labels), Create(st6), run_time=0.5)
        self.play(draw(cv, 0.9), run_time=0.9)
        xt = ValueTracker(3.0)
        X = xt.get_value
        bx = always_redraw(lambda: box_draw(X(), BOXC2))
        ro = live("V =", lambda: VB(X()), lambda: BOXC2 + [0, -0.85, 0], GRN, 46, suf=r"\,\text{cm}^3")
        dot = live_dot(ax, VB, xt)
        live_in(self, bx, ro, dot, run=0.4)
        self.go("2:57:04.6", xt.animate.set_value(5.9), run=1.3)
        self.go("2:57:07.27", xt.animate.set_value(2.0), run=1.6)
        self.play(Create(answer_box(r5[0:3])), run_time=0.5)
        unclock(bx, ro, dot)

        ra = at_eq(col(M("V(2)", "=", "2", "(12-4)^2", size=50), {0: GRN}), 1, 2.0, -2.3)
        rb = at_eq(M("=", r"2\cdot 64", r"=\;\;", r"128\text{ cm}^3", size=50), 0, 2.0, -3.2)
        rb[3].set_color(GRN)
        self.go("2:57:09.6", Write(ra[0:2]), run=0.6)
        self.go("2:57:11.8", Write(ra[2:]), run=0.9)
        self.go("2:57:14.55", Write(rb[0:2]), run=0.7)
        self.go("2:57:16.7", Write(rb[2:]), run=0.8)
        self.go("2:57:17.8", Create(answer_box(rb[3])), run=0.5)

        e0, e6 = pt(ax, 0, 0), pt(ax, 6, 0)
        self.go("2:57:20.65", FadeIn(e0, scale=0.5), run=0.4)
        self.go("2:57:21.7", FadeIn(e6, scale=0.5), run=0.4)
        z0 = M("V=0", size=34, color=ORG).next_to(e0, DL, buff=0.08)
        z6 = M("V=0", size=34, color=ORG).next_to(e6, UP, buff=0.18)
        self.go("2:57:22.95", FadeIn(z0), FadeIn(z6), run=0.5)
        pk = ax.c2p(2, 128)
        dash = VGroup(DashedLine(pk, ax.c2p(0, 128), color=DIM, stroke_width=2.5, dash_length=0.08),
                      DashedLine(pk, ax.c2p(2, 0), color=DIM, stroke_width=2.5, dash_length=0.08))
        l128 = M("128", size=30, color=GRN).next_to(ax.c2p(0, 128), LEFT, buff=0.12)
        mx = H("max", 40, YEL).next_to(pk, UP, buff=0.2)
        self.go("2:57:24.5", Create(dash), FadeIn(l128), FadeIn(mx, shift=DOWN * 0.1), run=0.6)
        ans = M(r"x = 2\text{ cm}", size=52, color=GRN).move_to(BOXC2 + [0, -2.0, 0])
        self.go("2:57:28.4", Write(ans), run=0.6)
        self.play(Create(answer_box(ans)), run_time=0.4)
        self.wipe("2:57:30.65")


# ================================================================ 10. the can: set-up, circles

class K28_Can(Shot):
    def body(self):
        self.title("The Open Box", animate=False)    # K28_BoxMax ends on a clean board
        self.title("The Cheapest Can", "2:57:31.8")
        d = can_setup()
        d["fill"].set_z_index(-1)
        self.go("2:57:35.85", *[Create(m) for m in d["can"]], run=1.2)
        self.go("2:57:37.6", Write(d["vol"][0]), run=0.5)
        self.go("2:57:39.0", Write(d["vol"][1:]), run=0.8)
        least = H("least metal", 44, YEL).move_to(d["min"])
        self.go("2:57:42.2", FadeIn(least, shift=DOWN * 0.1), run=0.5)
        self.go("2:57:44.65", Create(d["rad"]), FadeIn(d["rl"]), run=0.5)
        self.go("2:57:45.3", FadeIn(d["hl"]), run=0.5)
        self.go("2:57:47.85", FadeOut(least, shift=UP * 0.15), FadeIn(d["min"], shift=UP * 0.15), run=0.7)
        self.go("2:57:48.95", FadeIn(d["fill"]), run=0.6)
        self.go("2:57:51.05", d["top"].animate.set_stroke(GRN, 5), run=0.4)
        self.go("2:57:51.65", d["bf"].animate.set_stroke(GRN, 5), run=0.4)
        self.go("2:57:52.6", TransformFromCopy(d["top"], d["c1"]), TransformFromCopy(VGroup(d["bf"], d["bb"]), d["c2"]), run=1.0)
        self.go("2:57:53.75", FadeIn(d["pl1"]), FadeIn(d["pl2"]), run=0.5)


# ================================================================ 11. the can: unroll the side, S, the constraint

class K28_CanArea(Shot):
    def body(self):
        self.title("The Cheapest Can", animate=False)
        d = can_setup()
        d["fill"].set_z_index(-1)
        d["top"].set_stroke(GRN, 5)
        d["bf"].set_stroke(GRN, 5)
        self.add(d["fill"], d["can"], d["rad"], d["rl"], d["hl"], d["vol"], d["min"], d["c1"], d["c2"], d["pl1"], d["pl2"])
        side = can_side(GRN, 0).set_stroke(GRN, 6)
        self.go("2:57:55.8", Create(side), run=0.6)
        rect = net_rect()
        self.go("2:57:57.3", ReplacementTransform(side, rect), run=1.4)
        top_edge = Line(rect.get_corner(UL), rect.get_corner(UR), color=ORG, stroke_width=6)
        self.go("2:58:00.45", d["top"].animate.set_stroke(ORG, 5), Create(top_edge), run=0.6)
        w = M(r"2\pi r", size=44, color=ORG).move_to([NL + NW * 0.8, CHT / 2 + 0.38, 0])
        self.go("2:58:01.55", FadeIn(w, shift=UP * 0.1), run=0.5)
        hh = M("h", size=44, color=ORG).next_to(rect, RIGHT, buff=0.25)
        self.go("2:58:03.85", FadeIn(hh), run=0.5)
        S = M("S", "=", r"2\pi r^2", "+", r"2\pi r", "h", size=56).move_to([0.9, -3.0, 0])
        S[0].set_color(YEL)
        self.go("2:58:05.3", FadeOut(d["min"]), run=0.4)
        self.go("2:58:06.45", Write(S[0:2]), run=0.5)
        self.go("2:58:07.25", Write(S[2]), Circumscribe(d["c1"], shape=Circle, color=GRN, stroke_width=3),
                Circumscribe(d["c2"], shape=Circle, color=GRN, stroke_width=3), run=0.8)
        self.go("2:58:09.05", Write(S[3:]), Circumscribe(rect, color=GRN, stroke_width=3), run=0.8)
        self.go("2:58:11.0", Circumscribe(d["vol"], color=YEL, stroke_width=3), run=0.8)
        con = M(r"\pi r^2 h", "=", "1000", size=54).move_to(d["vol"])
        self.go("2:58:13.0", ReplacementTransform(d["vol"], con), run=0.9)
        hf = M("h", "=", r"\frac{1000}{\pi r^2}", size=54).move_to([5.0, 0.1, 0])
        self.go("2:58:16.15", TransformFromCopy(con, hf), run=0.9)
        self.go("2:58:19.4", S[5].animate.set_color(YEL), hf[0].animate.set_color(YEL), run=0.4)
        self.play(Circumscribe(S[5], color=YEL, stroke_width=3), Circumscribe(hf[0], color=YEL, stroke_width=3), run_time=0.5)
