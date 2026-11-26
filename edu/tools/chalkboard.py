"""Procedural chalkboard like the reference: grey slate, cloudy eraser smears in mixed directions, chalk dust. Writes assets/img/chalkboard.jpg."""
import numpy as np
from PIL import Image, ImageFilter

W, H = 1920, 1080
rng = np.random.default_rng(11)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)


def up(a, w=W, h=H):
    return np.array(Image.fromarray(a.astype(np.float32)).resize((w, h), Image.BICUBIC))


def dirnoise(ang, sx, sy, S=1400):
    n = rng.normal(0, 1, (S // sy, S // sx)).astype(np.float32)
    n = np.array(Image.fromarray(n).resize((S, S), Image.BICUBIC).rotate(np.degrees(ang), resample=Image.BICUBIC))
    return n[(S - 700) // 2:(S + 700) // 2, (S - 700) // 2:(S + 700) // 2]


clouds = sum(up(rng.normal(0, 1, (H // s, W // s))) * a for s, a in [(270, 1.0), (135, .6), (60, .35), (25, .2)])
lum = clouds * 4.0
# eraser smears: patches of streaky noise, each with its own direction, soft gaussian edges
for _ in range(120):
    ang = rng.normal(-0.6, 0.45) if rng.random() < .7 else rng.uniform(-1.5, 1.5)
    tex = dirnoise(ang, 2, rng.integers(14, 40))
    cx, cy = int(rng.uniform(-100, W + 100)), int(rng.uniform(-100, H + 100))
    s = rng.uniform(140, 330)
    py, px = np.mgrid[-350:350, -350:350].astype(np.float32)
    c, si = np.cos(ang), np.sin(ang)
    u, v = px * c + py * si, -px * si + py * c
    m = np.exp(-(u / (s * 1.4)) ** 2 - (v / (s * .55)) ** 2) * rng.uniform(.4, 1.0)
    patch = (0.55 + 0.45 * np.clip(tex, -2, 2)) * m * rng.uniform(5, 11)
    x0, y0 = cx - 350, cy - 350
    xa, ya, xb, yb = max(0, x0), max(0, y0), min(W, x0 + 700), min(H, y0 + 700)
    if xa < xb and ya < yb:
        lum[ya:yb, xa:xb] += patch[ya - y0:yb - y0, xa - x0:xb - x0]
lum += up(rng.normal(0, 1, (H // 2, W // 2))) * 2.0 + rng.normal(0, 1, (H, W)) * 2.2
img = np.array([56, 54, 58], np.float32) + lum[..., None] * np.array([1.0, .98, 1.03])
r = np.sqrt(((xx - W / 2) / (W / 2)) ** 2 + ((yy - H / 2) / (H / 2)) ** 2)
img *= (1 - 0.2 * np.clip(r - 0.45, 0, 1) ** 1.4)[..., None]
im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
im.save("assets/img/chalkboard.jpg", quality=93)
print("ok", np.array(im).mean(axis=(0, 1)).round(1))
