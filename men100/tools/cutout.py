"""Cut a whale illustration off its white page: cutout.py <name> [threshold]  ->  assets/cut/<name>.png
Keeps the largest dark shape (drops captions and specks), fills holes, feathers the edge by one pixel."""
import sys, os
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
name = sys.argv[1]
thr = int(sys.argv[2]) if len(sys.argv) > 2 else 238
src = [f for f in os.listdir(os.path.join(H, "assets", "img")) if f.startswith(name + ".")][0]
im = Image.open(os.path.join(H, "assets", "img", src)).convert("RGB")
a = np.asarray(im).astype(np.int16)
dark = a.min(axis=2) < thr
dark = ndimage.binary_opening(dark, iterations=1)
lab, n = ndimage.label(dark)
sizes = ndimage.sum(dark, lab, range(1, n + 1))
keep = lab == (1 + int(np.argmax(sizes)))
keep = ndimage.binary_fill_holes(ndimage.binary_closing(keep, iterations=3))
mask = Image.fromarray((keep * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.0))
rgba = im.copy(); rgba.putalpha(mask)
bb = mask.getbbox()
os.makedirs(os.path.join(H, "assets", "cut"), exist_ok=True)
rgba.crop(bb).save(os.path.join(H, "assets", "cut", name + ".png"))
print(name, rgba.crop(bb).size)
