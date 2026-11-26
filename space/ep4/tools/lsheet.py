"""Labelled contact sheet of snapshot PNGs: lsheet.py <out.jpg> <dir> [cols=5]  (labels = film time)."""
import glob, os, re, sys
from PIL import Image, ImageDraw
out, d = sys.argv[1], sys.argv[2]; C = int(sys.argv[3]) if len(sys.argv) > 3 else 5
off = float(os.environ.get("OFF", 0))
fs = sorted(glob.glob(os.path.join(d, "frame-*.png")), key=lambda f: float(re.search(r"at-([\d.]+)s", f).group(1)))
W, Hh = 384, 216
sh = Image.new("RGB", (C * W, ((len(fs) + C - 1) // C) * (Hh + 14)), "#333"); dr = ImageDraw.Draw(sh)
for i, f in enumerate(fs):
    im = Image.open(f).convert("RGB"); im.thumbnail((W - 2, Hh - 2))
    x, y = i % C * W, i // C * (Hh + 14); sh.paste(im, (x + 1, y + 1))
    t = float(re.search(r"at-([\d.]+)s", f).group(1)) + off
    dr.text((x + 3, y + Hh), f"{int(t // 60)}:{t % 60:05.2f}", fill="yellow")
sh.save(out, quality=85)
