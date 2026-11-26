"""Small extras for the sa_* scenes (no Shot classes here)."""
from common import *


def drift(scene, amount=0.03, start=1.0):
    """Slow camera push-in across the whole shot. Runs as an updater, so waits keep rendering (never a frozen frame).
    `start` = frame scale at t=0 (match the previous shot's end for continuity)."""
    f = scene.camera.frame
    if start != 1.0:
        f.scale(start)
    k = (1 - amount) ** (1 / (scene.END - scene.START))
    d = Mobject()
    d.add_updater(lambda m, dt: f.scale(k ** dt))
    scene.add(d)


def eq_glow(m, layers=3, opacity=0.07):
    """Per-part coloured glow behind a MathTex (each part glows in its own colour)."""
    return VGroup(*[glow(p.copy(), layers=layers, width=1.5, opacity=opacity)[:-1] for p in m])


def rot_z(p, yaw, pitch):
    """Depth of a direction after proj()'s rotation; < 0 faces the camera."""
    x, y, z = p
    z2 = -np.sin(yaw) * x + np.cos(yaw) * z
    return np.sin(pitch) * y + np.cos(pitch) * z2
