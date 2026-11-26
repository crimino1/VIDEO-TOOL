import os, sys
from manim import *
import numpy as np
import manimpango

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.join(HERE, "..")
sys.path.insert(0, ROOT)
from shots import BY_NAME, sec

manimpango.register_font(os.path.join(ROOT, "assets", "fonts", "EBGaramond.ttf"))
manimpango.register_font(os.path.join(ROOT, "assets", "fonts", "EBGaramond-Italic.ttf"))
FONT = "EB Garamond"

BG = "#0a0e17"
INK = "#f4f1e8"
DIM = "#8b93a7"
FAINT = "#2a3345"
PSI = "#4fd1c5"
EN = "#ffc857"
MOM = "#ff6b8b"
POT = "#7aa7ff"
RED = "#ff5a5f"
GOOD = "#9be564"
config.background_color = BG


def T(s, size=48, color=INK, **k):
    t = Text(s, font=FONT, font_size=size, color=color, **k)
    if t.width > 13.2:
        t.width = 13.2
    return t


def plate(t, opacity=0.86):
    """Dark plate behind a caption that sits over busy animation."""
    t.add_background_rectangle(color=BG, opacity=opacity, buff=0.14)
    return t


def TI(s, size=48, color=INK, **k):
    return Text(s, font=FONT, font_size=size, color=color, slant=ITALIC, **k)


def M(*s, size=64, color=INK, **k):
    return MathTex(*s, font_size=size, color=color, **k)


def schrod(size=64):
    """iħ ∂ψ/∂t = −ħ²/2m ∂²ψ/∂x² + Vψ, split so each term can be coloured."""
    e = M(r"i\hbar", r"\frac{\partial \psi}{\partial t}", "=", r"-\frac{\hbar^2}{2m}", r"\frac{\partial^2 \psi}{\partial x^2}", "+", r"V", r"\psi", size=size)
    return e


class Shot(Scene):
    """Scene clocked to the voiceover: at("5:13.39") holds until that film time."""

    def setup(self):
        s = BY_NAME[type(self).__name__]
        self.START, self.END = s["start"], s["end"]

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
        ms = [m for m in self.mobjects]
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


def tracker_time(scene):
    """A clock tracker that advances with scene time; keep it on stage so updaters run."""
    t = ValueTracker(0)
    t.add_updater(lambda m, dt: m.increment_value(dt))
    scene.add(t)
    return t


def wave_line(fn, x0, x1, color=PSI, width=3, n=420, **k):
    """A curve redrawn cheaply: fn(xs) -> ys, in screen coordinates."""
    xs = np.linspace(x0, x1, n)
    m = VMobject(stroke_color=color, stroke_width=width, **k)

    def up(mob):
        ys = fn(xs)
        mob.set_points_as_corners(np.column_stack([xs, ys, np.zeros(n)]))

    up(m)
    m.add_updater(up)
    return m


def nucleus(r=0.26):
    g = VGroup()
    rng = np.random.default_rng(3)
    for i in range(14):
        a = rng.uniform(0, TAU)
        d = r * 0.72 * np.sqrt(rng.uniform(0, 1))
        c = RED if i % 2 else "#d8dde8"
        g.add(Dot(point=[d * np.cos(a), d * np.sin(a), 0], radius=r * 0.34, color=c, stroke_color=BG, stroke_width=1))
    return g


def glow_dot(color=PSI, r=0.09, layers=5):
    g = VGroup()
    for i in range(layers, 0, -1):
        g.add(Dot(radius=r * (1 + i * 0.75), color=color, fill_opacity=0.07))
    g.add(Dot(radius=r, color=color))
    return g


def atom(R=1.6, nuc_r=0.26, orbit_color=FAINT):
    """Planet-style atom: returns (group, electron). Move the electron with an updater."""
    orbit = Circle(radius=R, color=orbit_color, stroke_width=2)
    n = nucleus(nuc_r)
    e = glow_dot(PSI, 0.08)
    e.move_to([R, 0, 0])
    return VGroup(orbit, n), e


def bar(width, height, color, fill=0.9):
    return Rectangle(width=width, height=height, fill_color=color, fill_opacity=fill, stroke_width=0)


def energy_bar(label, color, x, base=-2.6, h=3.0, w=0.75, tracker=None, size=30):
    """Vertical bar: height follows tracker (0..1)."""
    frame = Rectangle(width=w, height=h, stroke_color=FAINT, stroke_width=2).move_to([x, base + h / 2, 0])
    fill = Rectangle(width=w, height=0.001, fill_color=color, fill_opacity=0.9, stroke_width=0).move_to([x, base, 0], aligned_edge=DOWN)

    def up(m):
        v = max(0.0015, tracker.get_value() * h)
        m.stretch_to_fit_height(v)
        m.move_to([x, base, 0], aligned_edge=DOWN)

    fill.add_updater(up)
    lab = T(label, size, color).next_to(frame, DOWN, buff=0.15)
    return VGroup(frame, fill, lab)


def wl_rgb(nm):
    """Visible wavelength to an sRGB colour (Bruton's approximation)."""
    if 380 <= nm < 440: r, g, b = -(nm - 440) / 60, 0, 1
    elif nm < 490: r, g, b = 0, (nm - 440) / 50, 1
    elif nm < 510: r, g, b = 0, 1, -(nm - 510) / 20
    elif nm < 580: r, g, b = (nm - 510) / 70, 1, 0
    elif nm < 645: r, g, b = 1, -(nm - 645) / 65, 0
    elif nm <= 750: r, g, b = 1, 0, 0
    else: r, g, b = 0, 0, 0
    f = 0.3 + 0.7 * (nm - 380) / 40 if nm < 420 else (0.3 + 0.7 * (750 - nm) / 50 if nm > 700 else 1)
    return rgb_to_color([max(0, c * f) ** 0.8 for c in (r, g, b)])


BALMER = [(656.3, "656 nm"), (486.1, "486 nm"), (434.0, "434 nm"), (410.2, "410 nm")]


def spectrum_x(nm, x0=-5.2, x1=5.2):
    return x0 + (nm - 380) / (750 - 380) * (x1 - x0)


def rainbow(y=0, h=1.5, x0=-5.2, x1=5.2):
    g = VGroup()
    for nm in np.arange(380, 750, 1.5):
        x = spectrum_x(nm, x0, x1)
        g.add(Rectangle(width=(x1 - x0) / (370 / 1.5) * 1.3, height=h, fill_color=wl_rgb(nm), fill_opacity=1, stroke_width=0).move_to([x, y, 0]))
    return g


def balmer_lines(y=0, h=1.5, x0=-5.2, x1=5.2, w=0.075):
    return VGroup(*[Rectangle(width=w, height=h, fill_color=wl_rgb(nm), fill_opacity=1, stroke_width=0).move_to([spectrum_x(nm, x0, x1), y, 0]) for nm, _ in BALMER])


def staircase(n=5, w=0.9, h=0.62, origin=np.array([-2.5, -2.0, 0]), color=INK):
    pts = [origin]
    for i in range(n):
        p = pts[-1]
        pts += [p + [w, 0, 0], p + [w, h, 0]]
    return VMobject(stroke_color=color, stroke_width=4).set_points_as_corners(pts)


def proj(p, yaw=-0.55, pitch=0.32, scale=1.0, center=ORIGIN):
    """Small fixed-camera 3D projection, so no 3D camera or z-sorting is needed."""
    x, y, z = p
    c, s = np.cos(yaw), np.sin(yaw)
    x2, z2 = c * x + s * z, -s * x + c * z
    c, s = np.cos(pitch), np.sin(pitch)
    y2, z3 = c * y - s * z2, s * y + c * z2
    d = 1 + z3 * 0.03
    return np.array([x2 / d, y2 / d, 0]) * scale + center


def gear(teeth=12, r=1.0, depth=0.16, color=FAINT, fill=True):
    pts = []
    for i in range(teeth):
        a = TAU * i / teeth
        step = TAU / teeth
        for da, rr in [(0.0, r), (0.2, r), (0.28, r + depth), (0.62, r + depth), (0.7, r), (1.0, r)]:
            t = a + da * step
            pts.append([rr * np.cos(t), rr * np.sin(t), 0])
    pts.append(pts[0])
    g = VMobject(stroke_color=color, stroke_width=3, fill_color=BG, fill_opacity=1 if fill else 0).set_points_as_corners(pts)
    hub = Circle(radius=r * 0.18, stroke_color=color, stroke_width=3, fill_opacity=0)
    spokes = VGroup(*[Line(ORIGIN, [r * 0.8 * np.cos(TAU * i / 5), r * 0.8 * np.sin(TAU * i / 5), 0], stroke_color=color, stroke_width=2) for i in range(5)])
    return VGroup(g, spokes, hub)


def strike(mob, color=RED, width=6):
    return Line(mob.get_corner(DL) + [-0.1, 0, 0], mob.get_corner(UR) + [0.1, 0, 0], color=color, stroke_width=width)


def portrait(name, h=3.2):
    """A portrait photo with a thin frame, for use inside Manim scenes."""
    p = os.path.join(ROOT, "assets", "img", name + ".jpg")
    im = ImageMobject(p)
    im.height = h
    return im


def rules_pin(which=2, scale=0.62):
    """The two rules as they sit in the corner during the build."""
    a = M(r"E=\hbar\omega", size=44, color=EN)
    b = M(r"p=\hbar k", size=44, color=MOM)
    g = VGroup(a, b).arrange(DOWN, aligned_edge=LEFT, buff=0.18)
    g.to_corner(UR, buff=0.4)
    return g if which == 2 else a.to_corner(UR, buff=0.4)
