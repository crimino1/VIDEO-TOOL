"""Shared look for every Manim scene: Glow & Doodle style (channels/physics.md).
Navy radial stage, GOLD = electric/energy/light, CYAN = magnetic/fields, CORAL = problem/N pole, Inter for type, Kalam for doodles."""
import os, sys
from manim import *
import numpy as np
import manimpango
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
sys.path.insert(0, ROOT)
from shots import BY_NAME, sec

for f in ("Inter-400.ttf", "Inter-600.ttf", "Inter-700.ttf", "Kalam-Regular.ttf", "Kalam-Bold.ttf"):
    manimpango.register_font(os.path.join(ROOT, "assets", "fonts", f))
SANS, HAND = "Inter", "Kalam"

BG = "#05080f"
NAVY_C, NAVY_E = (14, 26, 43), (5, 8, 15)
INK = "#f2f2f2"
DIM = "#8a93a6"
FAINT = "#22304a"
GOLD = "#ffc23d"
CYAN = "#3fd8ff"
CORAL = "#ff5a6e"
COPPER = "#d98a3a"
config.background_color = BG

_BGPNG = os.path.join(HERE, "_navy.png")
if not os.path.exists(_BGPNG):
    h, w = 540, 960
    y, x = np.mgrid[0:h, 0:w]
    r = np.sqrt(((x - w / 2) / (w / 2)) ** 2 + ((y - h / 2) / (h / 2)) ** 2) / 1.25
    r = np.clip(r, 0, 1)[..., None]
    img = (np.array(NAVY_C) * (1 - r) + np.array(NAVY_E) * r).astype(np.uint8)
    Image.fromarray(img).save(_BGPNG)


def navy_bg():
    im = ImageMobject(_BGPNG)
    im.height = config.frame_height
    im.width = config.frame_width
    return im


# ---------- type
def T(s, size=40, color=INK, weight=NORMAL, **k):
    """Inter text. size 40 ~ a caption, 64 ~ a headline."""
    t = Text(s, font=SANS, font_size=size, color=color, weight=weight, **k)
    if t.width > 13.2:
        t.width = 13.2
    return t


def H(s, size=40, color=INK, **k):
    """Kalam handwriting, for doodle labels."""
    return Text(s, font=HAND, font_size=size, color=color, **k)


def M(*s, size=64, color=INK, **k):
    return MathTex(*s, font_size=size, color=color, **k)


def label(s, color=GOLD):
    """Small caps section label at top centre (the channel's chapter tag)."""
    t = Text(s.upper(), font=SANS, font_size=22, color=color, weight=BOLD)
    t.to_edge(UP, buff=0.42)
    return t


def glow(mob, color=None, layers=6, width=None, opacity=0.11):
    """Soft glow behind a stroked/filled mobject: wide faint copies. Returns VGroup(glows..., mob)."""
    g = VGroup()
    base = width or max(mob.get_stroke_width(), 2)
    for i in range(layers, 0, -1):
        c = mob.copy()
        c.set_fill(opacity=0)
        c.set_stroke(color=color or mob.get_color(), width=base + i * 5, opacity=opacity)
        g.add(c)
    g.add(mob)
    return g


def glow_dot(color=GOLD, r=0.09, layers=5):
    g = VGroup()
    for i in range(layers, 0, -1):
        g.add(Dot(radius=r * (1 + i * 0.75), color=color, fill_opacity=0.07))
    g.add(Dot(radius=r, color=color))
    return g


# ---------- Maxwell's equations, colour coded
EQ_TEX = [
    [r"\nabla\cdot", r"\mathbf{E}", "=", r"\frac{\rho}{\varepsilon_0}"],
    [r"\nabla\cdot", r"\mathbf{B}", "=", "0"],
    [r"\nabla\times", r"\mathbf{E}", "=", "-", r"\frac{\partial \mathbf{B}}{\partial t}"],
    [r"\nabla\times", r"\mathbf{B}", "=", r"\mu_0", r"\mathbf{J}", "+", r"\mu_0\varepsilon_0", r"\frac{\partial \mathbf{E}}{\partial t}"],
]


def eq(i, size=56):
    """Maxwell equation i (0..3) with E parts gold and B parts cyan."""
    m = M(*EQ_TEX[i], size=size)
    for part in m:
        s = part.get_tex_string()
        if "mathbf{E}" in s:
            part.set_color(GOLD)
        elif "mathbf{B}" in s:
            part.set_color(CYAN)
    return m


def maxwell_eqs(size=56, buff_h=1.4, buff_v=0.9):
    """The four equations in a 2x2 grid (VGroup of 4, in rule order)."""
    e = [eq(i, size) for i in range(4)]
    top = VGroup(e[0], e[1]).arrange(RIGHT, buff=buff_h)
    bot = VGroup(e[2], e[3]).arrange(RIGHT, buff=buff_h)
    VGroup(top, bot).arrange(DOWN, buff=buff_v)
    return VGroup(*e)


# ---------- doodles
def doodle_arrow(start, end, color=INK, width=4, angle=-0.6):
    """Hand-drawn curved arrow from start to end (points)."""
    a = CurvedArrow(np.array(start, dtype=float), np.array(end, dtype=float), angle=angle, color=color, stroke_width=width, tip_length=0.2)
    return a


def doodle(text, at, target, color=INK, size=38, angle=-0.6):
    """Kalam label at `at` with a curved arrow to `target`. Animate: Write(g[0]), Create(g[1])."""
    lab = H(text, size, color).move_to(at)
    d = np.array(target, dtype=float) - lab.get_center()
    start = lab.get_center() + d / np.linalg.norm(d) * (max(lab.width, lab.height) / 2 + 0.12)
    return VGroup(lab, doodle_arrow(start, target, color, angle=angle))


def cross(mob, color=CORAL, width=8):
    """Coral X over a mobject."""
    a, b = mob.get_corner(UL), mob.get_corner(DR)
    c, d = mob.get_corner(DL), mob.get_corner(UR)
    return VGroup(Line(a, b, color=color, stroke_width=width), Line(c, d, color=color, stroke_width=width))


def underline(mob, color=CORAL, width=5):
    return Line(mob.get_corner(DL) + DOWN * 0.08, mob.get_corner(DR) + DOWN * 0.08, color=color, stroke_width=width)


# ---------- images
def emoji(code, h=1.2):
    im = ImageMobject(os.path.join(ROOT, "assets", "emoji", code + ".png"))
    im.height = h
    return im


def portrait(name, h=3.2, frame=GOLD):
    """Portrait photo with a thin frame (Group)."""
    im = ImageMobject(os.path.join(ROOT, "assets", "img", name + ".jpg"))
    im.height = h
    fr = SurroundingRectangle(im, buff=0.0, color=frame, stroke_width=3)
    return Group(im, fr)


# ---------- physics props
def bar_magnet(w=3.2, h=0.8, tilt=0.0):
    """N half coral (left), S half cyan (right), labelled. VGroup(n, s, nl, sl)."""
    n = Rectangle(width=w / 2, height=h, fill_color=CORAL, fill_opacity=0.92, stroke_color=WHITE, stroke_width=1.5).shift(LEFT * w / 4)
    s = Rectangle(width=w / 2, height=h, fill_color=CYAN, fill_opacity=0.92, stroke_color=WHITE, stroke_width=1.5).shift(RIGHT * w / 4)
    nl = T("N", int(h * 60), WHITE, weight=BOLD).move_to(n)
    sl = T("S", int(h * 60), "#05101c", weight=BOLD).move_to(s)
    g = VGroup(n, s, nl, sl)
    if tilt:
        g.rotate(tilt)
    return g


def proj(p, yaw=-0.55, pitch=0.32, scale=1.0, center=ORIGIN):
    """Small fixed-camera 3D projection (no 3D camera, no z-sorting)."""
    x, y, z = p
    c, s = np.cos(yaw), np.sin(yaw)
    x2, z2 = c * x + s * z, -s * x + c * z
    c, s = np.cos(pitch), np.sin(pitch)
    y2, z3 = c * y - s * z2, s * y + c * z2
    d = 1 + z3 * 0.03
    return np.array([x2 / d, y2 / d, 0]) * scale + center


def wave_line(fn, x0, x1, color=GOLD, width=3, n=420, **k):
    """A curve redrawn every frame: fn(xs) -> ys, in screen coordinates."""
    xs = np.linspace(x0, x1, n)
    m = VMobject(stroke_color=color, stroke_width=width, **k)

    def up(mob):
        mob.set_points_as_corners(np.column_stack([xs, fn(xs), np.zeros(n)]))

    up(m)
    m.add_updater(up)
    return m


def tracker_time(scene):
    """A clock tracker that advances with scene time; keep it on stage so updaters run."""
    t = ValueTracker(0)
    t.add_updater(lambda m, dt: m.increment_value(dt))
    scene.add(t)
    return t


class Shot(MovingCameraScene):
    """Scene clocked to the voiceover: self.at("5:13.39") holds until that film time.
    Navy stage is added automatically. Camera push-in: self.camera.frame.animate.scale(0.96)."""

    def setup(self):
        super().setup()
        s = BY_NAME[type(self).__name__]
        self.START, self.END = s["start"], s["end"]
        self.bg = navy_bg()
        self.add(self.bg)

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

    def clear_all(self, run=0.35):
        ms = [m for m in self.mobjects if m is not self.bg and not isinstance(m, ValueTracker)]
        if ms:
            self.play(*[FadeOut(m) for m in ms], run_time=run)

    def construct(self):
        self.body()
        left = self.END - self.now()
        if left > 1 / 120:
            self.wait(left)
        elif left < -0.05:
            print(f"!! {type(self).__name__}: over by {-left:.2f}s")

    def body(self):
        raise NotImplementedError
