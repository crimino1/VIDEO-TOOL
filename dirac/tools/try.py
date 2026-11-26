"""Test one 3D kind in its own mini HyperFrames project and get a contact sheet.
Usage: try.py <dir> <kind> <mode> <filmStart> <dur> <t1,t2,...>   (times are seconds into the shot)
Example: try.py try_a atomzoom full 178.28 12.6 0.5,3,6,9,12
Writes <dir>/sheet.jpg (open it with Read). Copies assets/js and assets/tex fresh each run, so edits show up."""
import glob, json, os, shutil, subprocess, sys
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
d, kind, mode, t0, dur, times = sys.argv[1:7]
D = os.path.join(ROOT, d)
os.makedirs(os.path.join(D, "assets"), exist_ok=True)
for sub in ("js", "tex", "img"):
    src, dst = os.path.join(ROOT, "assets", sub), os.path.join(D, "assets", sub)
    shutil.rmtree(dst, ignore_errors=True)
    shutil.copytree(src, dst)
for f in ("hyperframes.json", "package.json", "meta.json"):
    shutil.copy(os.path.join(ROOT, f), D)
kinds = "".join(f'<script src="assets/js/{os.path.basename(k)}"></script>\n' for k in sorted(glob.glob(os.path.join(ROOT, "assets", "js", "k_*.js"))))
dur = float(dur)
html = f'''<!doctype html><html lang="en" data-resolution="landscape"><head><meta charset="UTF-8"><meta name="viewport" content="width=1920, height=1080">
<script src="assets/js/gsap.min.js"></script><script src="assets/js/three.min.js"></script>
<link rel="stylesheet" href="assets/js/overlay.css"></head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{dur}" data-width="1920" data-height="1080">
<canvas id="g3" width="1920" height="1080"></canvas><div id="pins"></div>
<div id="hold" class="clip" data-start="0" data-duration="{dur}" data-track-index="1"></div></div>
<script>window.LAB = [[0, {dur}, "{kind}", {json.dumps({"mode": mode, "FT0": float(t0)})}]];</script>
<script src="assets/js/core3d.js"></script>
{kinds}<script src="assets/js/boot3d.js"></script>
<script>const tl = gsap.timeline({{paused:true}}); tl.set({{}}, {{}}, {dur}); window.__timelines = {{main: tl}};</script></body></html>'''
open(os.path.join(D, "index.html"), "w", encoding="utf-8").write(html)
for old in glob.glob(os.path.join(D, ".hyperframes", "artifacts", "snapshots", "*")):
    shutil.rmtree(old, ignore_errors=True)
r = subprocess.run("npx --yes hyperframes@0.9.16 snapshot --at " + times + " --json", cwd=D, shell=True, capture_output=True, text=True, encoding="utf-8", errors="replace")
fs = sorted(glob.glob(os.path.join(D, ".hyperframes", "artifacts", "snapshots", "*", "frame-*.png")))
if not fs:
    print(r.stdout[-3000:], r.stderr[-3000:])
    sys.exit(1)
Wc, Hc = 640, 360
C = 3 if len(fs) > 4 else 2
Rr = (len(fs) + C - 1) // C
sheet = Image.new("RGB", (Wc * C, Hc * Rr))
for i, f in enumerate(fs):
    sheet.paste(Image.open(f).convert("RGB").resize((Wc, Hc)), ((i % C) * Wc, (i // C) * Hc))
    ImageDraw.Draw(sheet).text(((i % C) * Wc + 6, (i // C) * Hc + 4), f"{kind}/{mode} t={f.split('-at-')[1][:-4]}", fill=(255, 230, 0))
sheet.save(os.path.join(D, "sheet.jpg"), quality=88)
errs = [l for l in (r.stdout + r.stderr).splitlines() if "error" in l.lower() and "0 error" not in l.lower()]
print("sheet:", os.path.join(D, "sheet.jpg"), "| console errors:", errs[:6])
