"""SDO AIA 171 full disk -> assets/img/sun_disk.png (RGBA): brighter, disk opaque, corona fading out to 1.22 disk radii."""
import numpy as np
from PIL import Image
im = Image.open("assets/img/sun_sdo.jpg").convert("RGB").resize((2048, 2048), Image.LANCZOS)
a = np.asarray(im).astype(np.float32) / 255
H, W = a.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
lum = a.mean(2)
cx, cy = W / 2, H / 2
r = np.hypot(xx - cx, yy - cy)
# disk edge: radius where mean luminance drops most steeply
prof = [lum[(r > k) & (r < k + 4)].mean() for k in range(600, 1000, 4)]
rd = 600 + 4 * int(np.argmin(np.diff(prof)))
rgb = np.clip(a * 1.7, 0, 1) ** 0.9
alpha = np.where(r < rd, 1.0, np.clip(lum * 4, 0, 1) * np.clip(1 - (r - rd) / (0.22 * rd), 0, 1))
out = np.dstack([rgb, alpha]); Image.fromarray((out * 255).astype(np.uint8), "RGBA").save("assets/img/sun_disk.png")
print("disk radius px", rd, "of", W / 2, "-> ratio", rd / (W / 2))
