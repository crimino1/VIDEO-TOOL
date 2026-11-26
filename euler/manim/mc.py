"""Shared Manim style for the math film: dark slate, cream maths, PX.D accents. Scenes are clocked to the voice."""
import os, sys
from manim import *
import manimpango
HERE = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(HERE)
sys.path.insert(0, ROOT)
from lib import W  # word times from words.json
from mshots import MSHOTS
manimpango.register_font(os.path.join(ROOT, "assets", "fonts", "ArchivoBlack-Regular.ttf"))
manimpango.register_font(os.path.join(ROOT, "assets", "fonts", "Archivo.ttf"))
config.tex_dir = os.path.join(HERE, "tex_cache", str(os.getpid()))
config.background_color = "#0b0e12"
CREAM, DIM, FAINT = "#ece4d2", "#8b939d", "#4a535e"
AMBER, AMBERL = "#e0b23a", "#f2d27a"
TEAL, TEALL = "#4f8a8b", "#9cc9c6"
RUST, RUSTL = "#c0583e", "#e09a78"
MOSS, MOSSL = "#8fae6a", "#b5c98f"
HEAD, BODY = "Archivo Black", "Archivo"


def T(s, size=36, color=CREAM, font=BODY, weight=NORMAL, **k):
    return Text(s, font=font, font_size=size, color=color, weight=weight, **k)


def M(*s, size=64, color=CREAM, **k):
    return MathTex(*s, font_size=size, color=color, **k)


class Shot(Scene):
    NAME = ""
    def setup(self):
        self.t0, self.t1 = MSHOTS[self.NAME]
        bg = ImageMobject(os.path.join(HERE, "bg.png")); bg.height = config.frame_height; bg.width = config.frame_width
        self.add(bg)
    def now(self): return self.renderer.time
    def until(self, t_abs):
        """Wait until absolute film time t_abs (no-op if already past)."""
        dt = (t_abs - self.t0) - self.renderer.time
        if dt > 1 / 30: self.wait(dt)
    def rel(self, t_abs): return t_abs - self.t0
    def finish(self):
        self.until(self.t1 + 1.5)   # pad: trim() must never slow a clip down
