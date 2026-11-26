"""Review sheet for one rendered part: start, middle and end frame of every shot, labelled. shotsheet.py <k> -> .shots_p<k>_<n>.jpg"""
import json, os, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)
from shots import SHOTS
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
k = int(sys.argv[1])
b = json.load(open(os.path.join(ROOT, "parts", "bounds.json")))
P0, P1 = b[k - 1], b[k]
src = os.path.join(ROOT, "renders", f"p{k}.mp4")
shots = [s for s in SHOTS if P0 <= s["start"] < P1]
tmp = tempfile.mkdtemp()
W, H = 400, 225


def grab(job):
    i, j, t = job
    p = os.path.join(tmp, f"{i}_{j}.jpg")
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{max(0, t - P0):.2f}", "-i", src, "-frames:v", "1", "-vf", f"scale={W}:{H}", p])
    return p


jobs = []
for i, s in enumerate(shots):
    a, e = s["start"], s["end"]
    for j, t in enumerate((a + min(0.3, (e - a) / 4), (a + e) / 2, e - min(0.3, (e - a) / 4))):
        jobs.append((i, j, t))
with ThreadPoolExecutor(8) as ex:
    paths = list(ex.map(grab, jobs))
PER = 12
for n in range(0, len(shots), PER):
    grp = shots[n:n + PER]
    sheet = Image.new("RGB", (3 * W * 2, H * ((len(grp) + 1) // 2)), (15, 15, 20))
    d = ImageDraw.Draw(sheet)
    for r, s in enumerate(grp):
        i = n + r
        x0, y0 = (r % 2) * 3 * W, (r // 2) * H
        for j in range(3):
            p = os.path.join(tmp, f"{i}_{j}.jpg")
            if os.path.exists(p):
                sheet.paste(Image.open(p), (x0 + j * W, y0))
        lab = s.get("k", s.get("clip", s.get("img", s["kind"])))
        mode = s.get("mode", "")
        d.rectangle([x0, y0, x0 + 3 * W - 1, y0 + 13], fill=(0, 0, 0))
        d.text((x0 + 3, y0 + 1), f"{int(s['start'] // 60)}:{s['start'] % 60:05.2f} {s['kind']} {lab} {mode} ({s['end'] - s['start']:.1f}s)", fill=(255, 230, 0))
    out = os.path.join(ROOT, f".shots_p{k}_{n // PER}.jpg")
    sheet.save(out, quality=85)
    print(out)
