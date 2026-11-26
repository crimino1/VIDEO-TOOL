"""Chalkboard style for the trigonometry course. Every scene subclasses Shot and is clocked to the voiceover."""
import os, sys
from manim import *
import numpy as np
import manimpango

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
sys.path.insert(0, ROOT)
from shots import BY_NAME, sec

manimpango.register_font(os.path.join(ROOT, "assets", "fonts", "OpenSans.ttf"))
manimpango.register_font(os.path.join(ROOT, "assets", "fonts", "Kalam-Regular.ttf"))
manimpango.register_font(os.path.join(ROOT, "assets", "fonts", "Kalam-Bold.ttf"))
SANS = "Kalam"   # the user's theme: chalk handwriting everywhere
HAND = "Kalam"
BOARD = os.path.join(ROOT, "assets", "img", "chalkboard.jpg")
FONTS = os.path.join(ROOT, "assets", "fonts").replace(os.sep, "/") + "/"
config.tex_dir = os.path.join(HERE, "tex_cache", str(os.getpid()))  # per process: a shared cache races when renders run in parallel
# LaTeX with handwritten glyphs: Kalam for letters/digits/text, Segoe Print for Greek
HANDTEX = TexTemplate(tex_compiler="xelatex", output_format=".xdv")
HANDTEX.add_to_preamble(
    r"\usepackage{mathspec}" "\n"
    r"\setmainfont[Path=" + FONTS + r"]{Kalam-Regular.ttf}" "\n"
    r"\setmathsfont(Digits,Latin)[Path=" + FONTS + r"]{Kalam-Regular.ttf}" "\n"
    r"\setmathsfont(Greek)[Scale=0.95]{Segoe Print}" "\n"
    r"\setmathrm[Path=" + FONTS + r"]{Kalam-Regular.ttf}" "\n")

# chalk colours
CHALK = "#f3f1ea"
DIM = "#a9a7a2"
FAINT = "#6d6b6f"
YEL = "#ffe27a"   # angle / theta
PINK = "#ff9fb8"  # opposite / sine
BLUE = "#8fd0ff"  # adjacent / cosine
GRN = "#a6e3a1"   # hypotenuse / tangent / correct
ORG = "#ffb46b"
RED = "#ff7b7b"
PURP = "#c58cff"  # panels / boxes
config.background_color = "#3b3a3e"


def T(s, size=40, color=CHALK, **k):
    """Clean sans text (titles, labels)."""
    t = Text(s, font=SANS, font_size=size, color=color, **k)
    if t.width > 13.2:
        t.width = 13.2
    return t


def H(s, size=44, color=CHALK, **k):
    """Hand-written chalk text (notes, asides)."""
    t = Text(s, font=HAND, font_size=size, color=color, **k)
    if t.width > 13.2:
        t.width = 13.2
    return t


def M(*s, size=60, color=CHALK, **k):
    r"""Handwritten LaTeX maths. Pass parts separately to colour pieces: M(r"\sin\theta", "=", r"\frac{o}{h}")."""
    return MathTex(*s, font_size=size, color=color, tex_template=HANDTEX, **k)


def TX(s, size=44, color=CHALK, **k):
    """Handwritten LaTeX text mode: words with $maths$ mixed in."""
    return Tex(s, font_size=size, color=color, tex_template=HANDTEX, **k)


def pill(s, color=YEL, size=40, buff_x=0.32, buff_y=0.14, width=4):
    """Coloured rounded-outline header like the theme board ("What is Trigonometry?")."""
    t = Text(s, font=HAND, weight=BOLD, font_size=size, color=CHALK)
    r = RoundedRectangle(width=t.width + 2 * buff_x, height=t.height + 2 * buff_y + 0.08,
                         corner_radius=(t.height + 2 * buff_y) / 2.2, stroke_color=color, stroke_width=width).move_to(t)
    return VGroup(r, t)


def panel(m, color=None, buff=0.35, width=4):
    """Rounded coloured frame around a block of content (like the formulas box)."""
    return RoundedRectangle(width=m.width + 2 * buff, height=m.height + 2 * buff, corner_radius=0.3,
                            stroke_color=color or PURP, stroke_width=width).move_to(m)


def brush_line(width=6.5, color=None, center=ORIGIN, seed=1):
    """Chalky yellow brush underline: a few wobbly strokes on top of each other."""
    rng = np.random.default_rng(seed)
    g = VGroup()
    for k in range(4):
        x0, x1 = rng.uniform(0, 0.25), rng.uniform(0, 0.25)
        xs = np.linspace(-width / 2 + x0, width / 2 - x1, 40)
        ys = 0.03 * np.sin(xs * 2.3 + k) + rng.normal(0, 0.012, xs.size) + (k - 1.5) * 0.035
        g.add(VMobject(stroke_color=color or YEL, stroke_width=rng.uniform(5, 9), stroke_opacity=rng.uniform(0.7, 1)).set_points_smoothly(np.column_stack([xs, ys, np.zeros(40)])))
    return g.move_to(center)


def box(m, color=YEL, buff=0.2, width=3):
    return SurroundingRectangle(m, color=color, buff=buff, stroke_width=width, corner_radius=0.08)


def strike(mob, color=RED, width=6):
    return Line(mob.get_corner(DL) + [-0.1, 0, 0], mob.get_corner(UR) + [0.1, 0, 0], color=color, stroke_width=width)


def tick_mark(color=GRN, s=0.5):
    return VMobject(stroke_color=color, stroke_width=8).set_points_as_corners([[-0.5 * s, 0, 0], [-0.15 * s, -0.4 * s, 0], [0.6 * s, 0.5 * s, 0]])


def cross_mark(color=RED, s=0.45):
    return VGroup(Line([-s, -s, 0], [s, s, 0], color=color, stroke_width=8), Line([-s, s, 0], [s, -s, 0], color=color, stroke_width=8))


# ---------- geometry helpers ----------

def right_angle_mark(corner, p1, p2, size=0.28, color=CHALK):
    """Little square at `corner` between directions to p1 and p2."""
    u = (np.array(p1) - corner); u = u / np.linalg.norm(u) * size
    v = (np.array(p2) - corner); v = v / np.linalg.norm(v) * size
    return VMobject(stroke_color=color, stroke_width=3).set_points_as_corners([corner + u, corner + u + v, corner + v])


def angle_arc(vertex, p1, p2, r=0.6, color=YEL, label=None, label_size=50, label_buff=0.32):
    """Arc at vertex from ray->p1 to ray->p2 (counter-clockwise), with an optional MathTex label."""
    vertex = np.array(vertex, dtype=float)
    a1 = np.arctan2(*(np.array(p1) - vertex)[[1, 0]])
    a2 = np.arctan2(*(np.array(p2) - vertex)[[1, 0]])
    d = (a2 - a1) % TAU
    arc = Arc(radius=r, start_angle=a1, angle=d, arc_center=vertex, color=color, stroke_width=4)
    if label is None:
        return arc
    mid = a1 + d / 2
    lab = M(label, size=label_size, color=color).move_to(vertex + (r + label_buff) * np.array([np.cos(mid), np.sin(mid), 0]))
    return VGroup(arc, lab)


def right_triangle(b=4.0, h=3.0, origin=(-2.0, -1.5, 0), theta_at="left", color=CHALK, width=5):
    """Right angle at bottom-right. Returns dict of parts: tri, A (theta corner), B (right angle), C (top), mark.
    theta_at='left' puts θ at the bottom-left corner."""
    o = np.array(origin, dtype=float)
    A, B, C = o, o + [b, 0, 0], o + [b, h, 0]
    tri = Polygon(A, B, C, color=color, stroke_width=width)
    mark = right_angle_mark(B, A, C)
    return dict(tri=tri, A=A, B=B, C=C, mark=mark)


def side_label(p, q, text, color=CHALK, size=44, buff=0.35, side=1, math=True):
    """Label at the midpoint of segment pq, pushed out along its normal (side=+1 left of p->q)."""
    p, q = np.array(p, float), np.array(q, float)
    d = q - p
    n = np.array([-d[1], d[0], 0]) / np.linalg.norm(d) * side
    lab = M(text, size=size, color=color) if math else H(text, size=size, color=color)
    n1 = n / np.linalg.norm(n)
    return lab.move_to((p + q) / 2 + n1 * (buff * 0.5 + abs(n1[0]) * lab.width / 2 + abs(n1[1]) * lab.height / 2))


def seg(p, q, color=CHALK, width=5):
    return Line(np.array(p, float), np.array(q, float), color=color, stroke_width=width)


# ---------- unit circle / graphs ----------

def unit_circle(r=2.6, center=ORIGIN, axis_len=3.4, color=CHALK, ticks=True):
    c = np.array(center, float)
    ax = VGroup(Arrow(c + [-axis_len, 0, 0], c + [axis_len, 0, 0], buff=0, stroke_width=3, color=DIM, tip_length=0.2),
                Arrow(c + [0, -axis_len, 0], c + [0, axis_len, 0], buff=0, stroke_width=3, color=DIM, tip_length=0.2))
    circ = Circle(radius=r, color=color, stroke_width=4).move_to(c)
    g = VGroup(ax, circ)
    if ticks:
        for p, s, d in [((1, 0), "1", DR), ((-1, 0), "-1", DL), ((0, 1), "1", UL), ((0, -1), "-1", DL)]:
            g.add(M(s, size=34, color=DIM).next_to(c + r * np.array([p[0], p[1], 0]), d, buff=0.1))
    return g


def on_circle(angle, r=2.6, center=ORIGIN):
    return np.array(center, float) + r * np.array([np.cos(angle), np.sin(angle), 0])


def trig_axes(x_max=2 * PI, y=1.6, width=11, height=4.2, center=(0, -0.3, 0), x_min=0, pi_step=PI / 2, label_size=34):
    """Axes in radians with π labels. Returns Axes; plot with ax.plot(np.sin, color=...)."""
    ax = Axes(x_range=[x_min, x_max, pi_step], y_range=[-y, y, 1], x_length=width, y_length=height,
              axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2),
              y_axis_config=dict(include_numbers=False), x_axis_config=dict(include_numbers=False)).move_to(center)
    labs = VGroup()
    k = int(round(x_min / pi_step)) + 1
    while k * pi_step <= x_max + 1e-6:
        if k != 0:
            labs.add(M(pi_label(k * pi_step), size=label_size, color=DIM).next_to(ax.c2p(k * pi_step, 0), DOWN, buff=0.18))
        k += 1
    for v in (1, -1):
        if abs(v) <= y:
            labs.add(M(str(v), size=label_size, color=DIM).next_to(ax.c2p(0 if x_min >= 0 else x_min, v), LEFT, buff=0.15))
    ax.labels = labs
    return ax


def pi_label(x):
    """Pretty LaTeX for a multiple of π/6 or π/4."""
    from fractions import Fraction
    f = Fraction(x / PI).limit_denominator(12)
    n, d = f.numerator, f.denominator
    if n == 0:
        return "0"
    sgn = "-" if n < 0 else ""
    n = abs(n)
    top = r"\pi" if n == 1 else rf"{n}\pi"
    return sgn + (top if d == 1 else rf"\frac{{{top}}}{{{d}}}")


# ---------- the shot clock ----------

class Shot(Scene):
    """Scene clocked to the voiceover: at("5:13.39") holds until that film time. Chalkboard behind everything."""

    def setup(self):
        s = BY_NAME[type(self).__name__]
        self.START, self.END = s["start"], s["end"]
        self.bg = ImageMobject(BOARD).set_z_index(-100)
        self.bg.height = config.frame_height
        if self.bg.width < config.frame_width:
            self.bg.width = config.frame_width
        self.add(self.bg)
        self.head = None

    def now(self):
        return self.START + self.renderer.time

    def at(self, t):
        t = sec(t)
        dt = t - self.now()
        if dt > 1 / 120:
            self.wait(dt)
        elif dt < -0.12:
            print(f"!! {type(self).__name__}: late by {-dt:.2f}s for {t}")

    def go(self, t, *anims, run=0.6, **k):
        self.at(t)
        if anims:
            self.play(*anims, run_time=run, **k)

    def title(self, s, t=None, animate=True):
        """The heading at the top centre, like the reference board. Replaces the current one."""
        word = Text(s, font=HAND, weight=BOLD, font_size=54, color=CHALK)
        if word.width > 12:
            word.width = 12
        word.to_edge(UP, buff=0.18)
        new = VGroup(word, brush_line(word.width + 0.5, center=word.get_bottom() + DOWN * 0.08))
        if t is not None:
            self.at(t)
        if not animate:
            if self.head:
                self.remove(self.head)
            self.add(new)
        elif self.head:
            self.play(FadeOut(self.head, shift=UP * 0.2), FadeIn(new, shift=UP * 0.2), run_time=0.5)
        else:
            self.play(FadeIn(new, shift=DOWN * 0.15), run_time=0.5)
        self.head = new
        return new

    def board(self):
        """Everything on stage except the background and the heading."""
        return [m for m in self.mobjects if m is not self.bg and m is not self.head]

    def wipe(self, t=None, run=0.4, keep=()):
        """Erase the board (keeps background, heading and anything in keep)."""
        if t is not None:
            self.at(t)
        ms = [m for m in self.board() if m not in keep]
        if ms:
            self.play(*[FadeOut(m) for m in ms], run_time=run)

    def clear_all(self, run=0.35):
        ms = [m for m in self.mobjects if m is not self.bg]
        if ms:
            self.play(*[FadeOut(m) for m in ms], run_time=run)
        self.head = None

    def construct(self):
        self.body()
        left = self.END - self.now()
        if left > 1 / 120:
            self.wait(left)
        elif left < -0.05:
            print(f"!! {type(self).__name__}: over by {-left:.2f}s")

    def body(self):
        raise NotImplementedError


def tracker_time(scene):
    """A clock tracker that advances with scene time; keep it on stage so updaters run."""
    t = ValueTracker(0)
    t.add_updater(lambda m, dt: m.increment_value(dt))
    scene.add(t)
    return t


# ---------- calculus kit (full course): one look for every graph, tangent, area and algebra step ----------

def axes(x_range=(-1, 5, 1), y_range=(-1, 5, 1), x_length=6.5, y_length=4.6, center=(0, -0.6, 0),
         x_label="x", y_label="y", nums=True, num_size=30):
    """Chalk axes with handwritten tick numbers and axis letters. ax.labels holds numbers + letters (add both)."""
    ax = Axes(x_range=list(x_range), y_range=list(y_range), x_length=x_length, y_length=y_length,
              axis_config=dict(color=DIM, stroke_width=3, include_tip=True, tip_length=0.2, tick_size=0.06)).move_to(center)
    labs = VGroup()
    if nums:
        for v in np.arange(x_range[0], x_range[1] + 1e-9, x_range[2]):
            if abs(v) > 1e-9 and v < x_range[1]:
                labs.add(M(f"{v:g}", size=num_size, color=FAINT).next_to(ax.c2p(v, 0), DOWN, buff=0.12))
        for v in np.arange(y_range[0], y_range[1] + 1e-9, y_range[2]):
            if abs(v) > 1e-9 and v < y_range[1]:
                labs.add(M(f"{v:g}", size=num_size, color=FAINT).next_to(ax.c2p(0, v), LEFT, buff=0.12))
    if x_label:
        labs.add(M(x_label, size=38, color=DIM).next_to(ax.x_axis.get_end(), DR, buff=0.08))
    if y_label:
        labs.add(M(y_label, size=38, color=DIM).next_to(ax.y_axis.get_end(), UL, buff=0.08))
    ax.labels = labs
    return ax


def curve(ax, f, x_range=None, color=BLUE, width=5, **k):
    """A chalk curve. For asymptotes/holes plot the pieces separately (never draw through them)."""
    return ax.plot(f, x_range=x_range, color=color, stroke_width=width, **k)


def hole(ax, x, y, color=BLUE, r=0.09):
    """Open circle: the function is not defined here (board-coloured fill)."""
    return Circle(radius=r, stroke_color=color, stroke_width=4, fill_color=config.background_color,
                  fill_opacity=1).move_to(ax.c2p(x, y)).set_z_index(5)


def pt(ax, x, y, color=ORG, r=0.08):
    """Filled dot at a point of the graph."""
    return Dot(ax.c2p(x, y), radius=r, color=color).set_z_index(6)


def slope(f, x, h=1e-4):
    return (f(x + h) - f(x - h)) / (2 * h)


def tangent(ax, f, x, length=3.0, color=PINK, width=5):
    """Short tangent segment at x (length in screen units)."""
    p = np.array(ax.c2p(x, f(x)))
    q = np.array(ax.c2p(x + 1e-3, f(x) + slope(f, x) * 1e-3))
    d = (q - p) / np.linalg.norm(q - p)
    return Line(p - d * length / 2, p + d * length / 2, color=color, stroke_width=width).set_z_index(4)


def live_tangent(ax, f, xt, length=3.0, color=PINK, readout=True, readout_pos=None, size=44):
    """Tangent + touching dot (+ optional 'slope = ...' readout) that follow ValueTracker xt."""
    g = VGroup(always_redraw(lambda: tangent(ax, f, xt.get_value(), length, color)),
               always_redraw(lambda: pt(ax, xt.get_value(), f(xt.get_value()), color)))
    if readout:
        lab = M(r"\text{slope} =", size=size, color=color)
        lab.move_to(readout_pos if readout_pos is not None else ax.get_corner(UR) + DOWN * 0.3 + LEFT * 1.9)
        num = always_redraw(lambda: M(f"{slope(f, xt.get_value()) + 0:.1f}", size=size, color=color).next_to(lab, RIGHT, buff=0.15))
        g.add(VGroup(lab, num))
    return g


def secant(ax, f, x, h, color=ORG, extend=1.2, width=4):
    """Line through (x, f(x)) and (x+h, f(x+h)), extended a little past both points."""
    p, q = np.array(ax.c2p(x, f(x))), np.array(ax.c2p(x + h, f(x + h)))
    d = (q - p) / np.linalg.norm(q - p)
    return Line(p - d * extend, q + d * extend, color=color, stroke_width=width)


def rise_run(ax, x0, y0, x1, y1, color=PINK, size=36, run_tex=None, rise_tex=None):
    """The little slope triangle: horizontal run then vertical rise, with optional labels."""
    a, b, c = ax.c2p(x0, y0), ax.c2p(x1, y0), ax.c2p(x1, y1)
    g = VGroup(DashedLine(a, b, color=color, stroke_width=3, dash_length=0.08),
               DashedLine(b, c, color=color, stroke_width=3, dash_length=0.08))
    if run_tex:
        g.add(M(run_tex, size=size, color=color).next_to(Line(a, b), DOWN, buff=0.1))
    if rise_tex:
        g.add(M(rise_tex, size=size, color=color).next_to(Line(b, c), RIGHT, buff=0.1))
    return g


def area(ax, f, a, b, color=GRN, opacity=0.35):
    """Shaded area between the curve and the x-axis."""
    return ax.get_area(ax.plot(f, x_range=[a, b]), x_range=[a, b], color=color, opacity=opacity)


def riemann(ax, f, a, b, n, color=GRN, opacity=0.45, rule="left"):
    """n chalk rectangles under f on [a, b] (rule: left / right / midpoint)."""
    w = (b - a) / n
    g = VGroup()
    for i in range(n):
        x = a + i * w + {"left": 0, "right": w, "midpoint": w / 2}[rule]
        h = f(x)
        g.add(Polygon(ax.c2p(a + i * w, 0), ax.c2p(a + (i + 1) * w, 0), ax.c2p(a + (i + 1) * w, h), ax.c2p(a + i * w, h),
                      stroke_color=color, stroke_width=2, fill_color=color, fill_opacity=opacity))
    return g


def number_line(x_range=(-3, 3, 1), length=10, center=(0, -1, 0), size=34):
    nl = NumberLine(x_range=list(x_range), length=length, color=DIM, stroke_width=3, include_tip=True,
                    tip_length=0.2).move_to(center)
    nl.labels = VGroup(*[M(f"{v:g}", size=size, color=FAINT).next_to(nl.n2p(v), DOWN, buff=0.15)
                         for v in np.arange(x_range[0], x_range[1] + 1e-9, x_range[2]) if v < x_range[1]])
    return nl


def steps(*rows, size=56, gap=0.32, align=1, start=UP * 1.4):
    """Worked algebra: each row is a tuple of MathTex parts; rows stack downward aligned on part `align` (the '=').
    steps(("f(x)", "=", "x^2"), ("f'(x)", "=", "2x")). Reveal row by row with Write on the spoken words."""
    ms = [M(*r, size=size) for r in rows]
    for i, m in enumerate(ms):
        if i == 0:
            m.move_to(start)
        else:
            m.next_to(ms[i - 1], DOWN, buff=gap)
            m.shift(RIGHT * (ms[0][align].get_center()[0] - m[align].get_center()[0]))
    return VGroup(*ms)


def answer_box(m, color=GRN):
    return SurroundingRectangle(m, color=color, buff=0.18, stroke_width=4, corner_radius=0.1)


def note(text, target, direction=UR, color=YEL, size=36, math=False, dist=1.1, angle=-0.6):
    """Hand-drawn curved arrow from a short note to `target` (a point or a mobject): the teacher's chalk annotation."""
    is_mob = isinstance(target, Mobject)
    tp = target.get_center() if is_mob else np.array(target, float)
    lab = M(text, size=size + 6, color=color) if math else H(text, size=size, color=color)
    d = np.array(direction, float)
    d = d / np.linalg.norm(d)
    reach = (max(target.width, target.height) / 2 + 0.12) if is_mob else 0.18
    lab.move_to(tp + d * (dist + reach) + d * max(lab.width, lab.height) / 2)
    start = lab.get_critical_point(-np.sign(d)) - d * 0.08
    arr = CurvedArrow(start, tp + d * reach, angle=angle, color=color, stroke_width=3, tip_length=0.16)
    return VGroup(lab, arr)


def draw(mob, run=1.0, color=CHALK):
    """Chalk draw-on for one curve or drawing: Create with a small chalk tip riding the end of the stroke."""
    tip = Dot(radius=0.05, color=color).set_z_index(10)
    single = isinstance(mob, VMobject) and len(mob.submobjects) == 0

    def upd(m, a):
        if single and a < 0.995:
            m.move_to(mob.point_from_proportion(max(a, 1e-3))).set_opacity(0.9)
        else:
            m.set_opacity(0)
    return AnimationGroup(Create(mob, run_time=run), UpdateFromAlphaFunc(tip, upd, run_time=run, remover=True))


def focus(scene, *keep, run=0.5, dim=0.22):
    """Dim everything on the board except `keep` so the eye goes where the voice is. Undo with unfocus(scene).
    always_redraw objects are rebuilt each frame and do not dim: fade them out or keep them."""
    keep_ids = {id(x) for k in keep for x in k.get_family()}
    others = [m for m in scene.board() if id(m) not in keep_ids and not any(id(x) in keep_ids for x in m.get_family())]
    scene._dimmed = others
    if others:
        scene.play(*[m.animate.fade(1 - dim) for m in others], run_time=run)


def unfocus(scene, run=0.4):
    ms = getattr(scene, "_dimmed", [])
    if ms:
        scene.play(*[m.animate.set_opacity(1) for m in ms], run_time=run)
    scene._dimmed = []
