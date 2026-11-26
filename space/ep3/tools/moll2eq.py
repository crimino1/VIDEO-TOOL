"""Planck Mollweide map -> equirectangular sphere texture (assets/img/cmb_sphere.jpg)."""
import numpy as np
from PIL import Image
im = np.asarray(Image.open("assets/img/cmb_planck.jpg").convert("RGB")).astype(np.float32)
H0, W0 = im.shape[:2]
mask = im.sum(2) > 30
ys, xs = np.where(mask); x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
cx, cy, ax, ay = (x0 + x1) / 2, (y0 + y1) / 2, (x1 - x0) / 2, (y1 - y0) / 2
W, H = 4096, 2048
lon = (np.arange(W) + 0.5) / W * 2 * np.pi - np.pi
lat = np.pi / 2 - (np.arange(H) + 0.5) / H * np.pi
LON, LAT = np.meshgrid(lon, lat)
th = LAT.copy()
for _ in range(30):  # solve 2θ + sin 2θ = π sin φ
    f = 2 * th + np.sin(2 * th) - np.pi * np.sin(LAT); th -= f / (2 + 2 * np.cos(2 * th) + 1e-9)
X = LON / np.pi * np.cos(th) * 0.992; Y = np.sin(th) * 0.992   # stay inside the ellipse edge
px = np.clip(cx - X * ax, 0, W0 - 1).astype(int); py = np.clip(cy - Y * ay, 0, H0 - 1).astype(int)   # mirror x: seen from inside
out = im[py, px]
Image.fromarray(out.astype(np.uint8)).save("assets/img/cmb_sphere.jpg", quality=92)
print("ellipse", x0, x1, y0, y1, "-> cmb_sphere.jpg", W, H)
