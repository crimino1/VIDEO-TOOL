"""Cut an animal photo out of its background with HyperFrames' background remover, then clean it up.
Usage: python tools/cut.py <name> [--flip] [--white]   reads assets/photo/<name>.*  ->  assets/cut/<name>.png
Keeps the largest shape (drops labels, rulers, specks), fills holes, clears faint alpha, crops to the animal.
--white: the photo sits on a plain white page, so a simple threshold is cleaner than the model."""
import sys, os, subprocess, glob
import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
name = sys.argv[1]
src = [f for f in glob.glob(os.path.join(H, "assets", "photo", name + ".*")) if not f.endswith(".json")][0]
out = os.path.join(H, "assets", "cut", name + ".png")
im = Image.open(src).convert("RGB")
if max(im.size) > 2600: im.thumbnail((2600, 2600), Image.LANCZOS)
if "--white" in sys.argv or "--black" in sys.argv:
    a = np.asarray(im).astype(np.int16)
    mask = a.min(axis=2) < int(os.environ.get("THR", 232)) if "--white" in sys.argv else a.max(axis=2) > int(os.environ.get("THR", 45))
    rgba = im.convert("RGBA"); alpha = mask.astype(np.uint8) * 255
else:
    tmp_in = os.path.join(H, "assets", "cut", f"_{name}_in.jpg"); im.save(tmp_in, quality=95)
    tmp_out = os.path.join(H, "assets", "cut", f"_{name}_rb.png")
    subprocess.run(f'npx hyperframes remove-background "{tmp_in}" -o "{tmp_out}"', shell=True, check=True, cwd=H, capture_output=True)
    rgba = Image.open(tmp_out).convert("RGBA")
    if rgba.size != im.size: rgba = rgba.resize(im.size, Image.LANCZOS)
    alpha = np.asarray(rgba)[:, :, 3].copy()
    os.remove(tmp_in); os.remove(tmp_out)
solid = alpha > 60
solid = ndimage.binary_opening(solid, iterations=int(os.environ.get("OPEN", 2))) if int(os.environ.get("OPEN", 2)) else solid
lab, n = ndimage.label(solid)
if n:
    sizes = ndimage.sum(solid, lab, range(1, n + 1))
    keep = np.zeros_like(solid)
    big = sizes.max()
    for i, sz in enumerate(sizes):          # keep the animal plus any big separate parts (fins, tentacles)
        if sz > big * float(os.environ.get("KEEP", 0.08)): keep |= lab == i + 1
    keep = ndimage.binary_fill_holes(ndimage.binary_closing(keep, iterations=2))
else:
    keep = solid
a2 = np.where(keep, np.maximum(alpha, 0), 0).astype(np.uint8)
if "--white" in sys.argv or "--black" in sys.argv: a2 = np.where(keep, 255, 0).astype(np.uint8)
m = Image.fromarray(a2).filter(ImageFilter.GaussianBlur(0.8))
rgba = im.convert("RGBA"); rgba.putalpha(m)
bb = Image.fromarray(np.where(keep, 255, 0).astype(np.uint8)).getbbox()
if bb:
    pad = 6; bb = (max(0, bb[0] - pad), max(0, bb[1] - pad), min(im.width, bb[2] + pad), min(im.height, bb[3] + pad))
    rgba = rgba.crop(bb)
if "--flip" in sys.argv: rgba = rgba.transpose(Image.FLIP_LEFT_RIGHT)
rgba.save(out)
print(name, rgba.size)
