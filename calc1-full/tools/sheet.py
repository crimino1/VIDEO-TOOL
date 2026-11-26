"""Contact sheet of a section's 1080p Manim shots: 3 frames per shot. Usage: sheet.py NN -> work/sheets/KNN.jpg"""
import os, subprocess, sys
from PIL import Image, ImageDraw
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
from shots import SHOTS

nn = sys.argv[1]
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
tmp = os.path.join(ROOT, "work", "sheets", "tmp")
os.makedirs(tmp, exist_ok=True)
tiles = []
for s in SHOTS:
    if s["kind"] != "m" or not s["name"].startswith(f"K{nn}_"):
        continue
    src = os.path.join(ROOT, "assets", "manim", s["name"] + ".mp4")
    d = s["end"] - s["start"]
    for p in (0.45, 0.95):
        out = os.path.join(tmp, f"{s['name']}_{p}.png")
        subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{d * p:.2f}", "-i", src, "-frames:v", "1", "-vf", "scale=360:203", out])
        if os.path.exists(out):
            im = Image.open(out).convert("RGB")
            ImageDraw.Draw(im).text((4, 188), s["name"], fill=(255, 120, 120))
            tiles.append(im)
cols = 8
W = Image.new("RGB", (360 * cols, 203 * ((len(tiles) + cols - 1) // cols)))
for i, im in enumerate(tiles):
    W.paste(im, ((i % cols) * 360, (i // cols) * 203))
out = os.path.join(ROOT, "work", "sheets", f"K{nn}.jpg")
W.save(out, quality=82)
print(out, len(tiles))
