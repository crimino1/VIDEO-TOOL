"""Contact sheets for review: sheet.py <dir-of-mp4s> <out-prefix> [Name ...]. Six frames per shot, eight shots per sheet, labelled with film time."""
import os, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)
from shots import SHOTS
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
src, prefix, *names = sys.argv[1:]
shots = [s for s in SHOTS if s["kind"] == "m" and (not names or s["name"] in names) and os.path.exists(os.path.join(src, s["name"] + ".mp4"))]
tmp = tempfile.mkdtemp()
W, H, N = 320, 180, 6


def grab(job):
    s, j = job
    d = s["end"] - s["start"]
    t = d * (j + 0.6) / N
    p = os.path.join(tmp, f"{s['name']}_{j}.jpg")
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{t:.2f}", "-i", os.path.join(src, s["name"] + ".mp4"), "-frames:v", "1", "-vf", f"scale={W}:{H}", "-q:v", "3", p])
    return p, s, j, t


with ThreadPoolExecutor(10) as ex:
    res = list(ex.map(grab, [(s, j) for s in shots for j in range(N)]))
PER = 8
for k in range(0, len(shots), PER):
    group = shots[k:k + PER]
    sheet = Image.new("RGB", (W * N, H * len(group)))
    d = ImageDraw.Draw(sheet)
    for row, s in enumerate(group):
        for p, s2, j, t in res:
            if s2 is s and os.path.exists(p):
                sheet.paste(Image.open(p), (j * W, row * H))
                m = s["start"] + t
                d.text((j * W + 4, row * H + 2), f"{s['name']} {int(m // 60)}:{m % 60:04.1f}", fill=(255, 230, 0))
    sheet.save(f"{prefix}{k // PER}.jpg", quality=85)
print("sheets:", (len(shots) + PER - 1) // PER, "shots:", len(shots))
