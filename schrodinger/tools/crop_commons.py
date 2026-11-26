"""Crops scanned mounts and labels off the historical images, in place. Run once."""
import os
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
D = os.path.join(os.path.dirname(__file__), "..", "assets", "img")
CROPS = {  # name: (left, top, right, bottom) as fractions
    "debroglie.jpg": (0.25, 0.21, 0.75, 0.83),
    "maxwell.jpg": (0.09, 0.10, 0.88, 0.84),
    "eth.jpg": (0.04, 0.09, 0.96, 0.90),
    "h_tube.png": (0.08, 0.10, 0.92, 0.52),
}
for f, (l, t, r, b) in CROPS.items():
    p = os.path.join(D, f)
    im = Image.open(p).convert("RGB")
    w, h = im.size
    im = im.crop((int(l * w), int(t * h), int(r * w), int(b * h)))
    im.save(os.path.join(D, f.rsplit(".", 1)[0] + ".jpg"), quality=93)
    print(f, im.size)
