"""Helpers for the sc_* scenes (Wave ... Final). Shared look stays in common.py."""
from common import *


def p3(x, y, z, yaw=0.45, pitch=0.3, scale=1.0, center=ORIGIN, persp=0.035):
    """Vectorised fixed-camera projection, +z toward the viewer, near = bigger. Returns (N,3)."""
    x, y, z = (np.asarray(v, dtype=float) for v in (x, y, z))
    c, s = np.cos(yaw), np.sin(yaw)
    x2, z2 = c * x + s * z, -s * x + c * z
    c, s = np.cos(pitch), np.sin(pitch)
    y2, z3 = c * y - s * z2, s * y + c * z2
    d = 1 - z3 * persp
    return np.column_stack([x2 / d, y2 / d, 0 * d]) * scale + np.asarray(center)


def arrow_pts(a, b, head=0.16):
    """Polyline shaft + open chevron head from a to b (screen points)."""
    d = b - a
    L = np.linalg.norm(d)
    if L < 1e-4:
        return np.array([a, a + RIGHT * 1e-4])
    u = d / L
    n = np.array([-u[1], u[0], 0])
    h = min(head, 0.4 * L)
    return np.array([a, b, b - u * h + n * h * 0.6, b, b - u * h - n * h * 0.6])


class EMWave(VGroup):
    """Travelling EM wave along x: E (gold) along y, B (cyan) along z, in phase, E x B = +x.
    Trackers: amp (0..1 grow), sc (projection scale). Needs a clock tracker on stage."""

    def __init__(self, clock, A=1.4, k=1.4, v=1.6, xr=(-7.5, 7.5), step=0.25, center=ORIGIN, fade=1.6, yaw=0.45, pitch=0.22, ew=3.0, smax=1.0):
        super().__init__()
        self.clock, self.A, self.k, self.v, self.xr, self.step = clock, A, k, v, xr, step
        self.center, self.fade, self.yaw, self.pitch = np.array(center, dtype=float), fade, yaw, pitch
        self.amp, self.sc, self.span = ValueTracker(0), ValueTracker(1), ValueTracker(1)
        self.xs = np.arange(xr[0] * smax, xr[1] * smax + 1e-6, step)
        n = len(self.xs)
        self.axis = VMobject(stroke_color=DIM, stroke_width=2)
        self.ea = VGroup(*[VMobject(stroke_color=GOLD, stroke_width=ew) for _ in range(n)])
        self.ba = VGroup(*[VMobject(stroke_color=CYAN, stroke_width=ew) for _ in range(n)])
        self.ecur = VGroup(*[VMobject(stroke_color=GOLD, stroke_width=w, stroke_opacity=o) for w, o in ((18, 0.08), (10, 0.14), (4.5, 1))])
        self.bcur = VGroup(*[VMobject(stroke_color=CYAN, stroke_width=w, stroke_opacity=o) for w, o in ((18, 0.08), (10, 0.14), (4.5, 1))])
        for c in [*self.ecur, *self.bcur]:
            c.set_sheen_direction(RIGHT)
        self.add(self.axis, self.ba, self.bcur, self.ea, self.ecur)
        self.add_updater(lambda m: m.redraw())
        self.redraw()

    def P(self, x, y, z):
        return p3(x, y, z, self.yaw, self.pitch, self.sc.get_value(), self.center)

    def redraw(self):
        t = self.clock.get_value()
        a = self.A * self.amp.get_value()
        x0, x1 = self.xr[0] * self.span.get_value(), self.xr[1] * self.span.get_value()
        ph = lambda x: np.cos(self.k * (x - self.v * t))
        # opacity falls off near the ends so the wave seems to come from / go into the dark
        op = lambda x: np.clip(np.minimum(x - x0, x1 - x) / (self.fade * self.span.get_value()), 0, 1)
        self.axis.set_points_as_corners(self.P([x0, x1], [0, 0], [0, 0]))
        xs = self.xs
        y = a * ph(xs)
        base = self.P(xs, 0 * xs, 0 * xs)
        etip = self.P(xs, y, 0 * xs)
        btip = self.P(xs, 0 * xs, y)
        o = op(xs)
        for i in range(len(xs)):
            self.ea[i].set_points_as_corners(arrow_pts(base[i], etip[i], 0.13 * self.sc.get_value()))
            self.ea[i].set_stroke(opacity=o[i])
            self.ba[i].set_points_as_corners(arrow_pts(base[i], btip[i], 0.13 * self.sc.get_value()))
            self.ba[i].set_stroke(opacity=o[i] * 0.95)
        xf = np.linspace(x0, x1, 500)
        yf = a * ph(xf)
        ef, bf = self.P(xf, yf, 0 * xf), self.P(xf, 0 * xf, yf)
        grad = [0, 1, 1, 1, 1, 1, 1, 1, 0]
        for c in self.ecur:
            c.set_points_as_corners(ef)
        for c in self.bcur:
            c.set_points_as_corners(bf)
        for g in (self.ecur, self.bcur):
            for c, o2 in zip(g, (0.08, 0.14, 1)):
                c.set_stroke(opacity=[o2 * v for v in grad])


def gwave(fn, x0, x1, color=GOLD, width=4, n=700):
    """wave_line with two soft glow layers. VGroup(wide, mid, core); recolour with set_stroke(color=...)."""
    return VGroup(wave_line(fn, x0, x1, color, width + 14, n, stroke_opacity=0.08),
                  wave_line(fn, x0, x1, color, width + 6, n, stroke_opacity=0.16),
                  wave_line(fn, x0, x1, color, width, n))


def push(scene, total=0.97):
    """Constant slow camera push-in across the whole shot (frame scale -> total at the end)."""
    r = -np.log(total) / (scene.END - scene.START)
    scene.camera.frame.add_updater(lambda m, dt: m.scale(np.exp(-r * dt)))
    scene.add(scene.camera.frame)  # frame updaters only run while it is on stage


def follow_bg(scene):
    """Keep the navy stage filling the moving camera frame."""
    fr = scene.camera.frame

    def up(m):
        m.stretch_to_fit_width(fr.width * 1.15)
        m.stretch_to_fit_height(fr.height * 1.15)
        m.move_to(fr.get_center())

    scene.bg.add_updater(up)
    scene.add(fr)


def wl_rgb(nm):
    """Visible wavelength to an sRGB colour (Bruton's approximation), from schrodinger/manim/common.py."""
    if 380 <= nm < 440: r, g, b = -(nm - 440) / 60, 0, 1
    elif nm < 490: r, g, b = 0, (nm - 440) / 50, 1
    elif nm < 510: r, g, b = 0, 1, -(nm - 510) / 20
    elif nm < 580: r, g, b = (nm - 510) / 70, 1, 0
    elif nm < 645: r, g, b = 1, -(nm - 645) / 65, 0
    elif nm <= 750: r, g, b = 1, 0, 0
    else: r, g, b = 0, 0, 0
    f = 0.3 + 0.7 * (nm - 380) / 40 if nm < 420 else (0.3 + 0.7 * (750 - nm) / 50 if nm > 700 else 1)
    return rgb_to_color([max(0, c * f) ** 0.8 for c in (r, g, b)])


RAINBOW = [wl_rgb(nm) for nm in np.linspace(700, 400, 12)]  # red -> violet, left to right


def rainbow_strip(x0, x1, y=0, h=1.0, step=1.5):
    """Filled visible spectrum, red at x0 (long) to violet at x1 (short)."""
    g = VGroup()
    nms = np.arange(750, 380, -step)
    w = (x1 - x0) / len(nms)
    for i, nm in enumerate(nms):
        g.add(Rectangle(width=w * 1.25, height=h, fill_color=wl_rgb(nm), fill_opacity=1, stroke_width=0).move_to([x0 + (i + 0.5) * w, y, 0]))
    return g
