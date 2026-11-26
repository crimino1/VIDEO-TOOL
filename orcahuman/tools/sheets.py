"""Timestamped contact sheets of every clip in assets/raw/yt: 10 frames per clip, 8 clips per sheet."""
import glob, os, subprocess, io, sys
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
F = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"; P = F.replace("ffmpeg.exe", "ffprobe.exe")
keys = sys.argv[1:] or sorted(os.path.basename(f)[:-4] for f in glob.glob("assets/raw/yt/*.mp4"))
N, W, Hh = 10, 192, 108
def row(k):
    p = f"assets/raw/yt/{k}.mp4"
    d = float(subprocess.run([P, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout or 1)
    im = Image.new("RGB", (N * W, Hh + 16)); dr = ImageDraw.Draw(im)
    for i in range(N):
        t = d * (i + 0.5) / N
        r = subprocess.run([F, "-v", "error", "-ss", f"{t:.2f}", "-i", p, "-frames:v", "1", "-vf", f"scale={W}:{Hh}", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True)
        try: im.paste(Image.open(io.BytesIO(r.stdout)), (i * W, 16))
        except Exception: pass
        dr.text((i * W + 2, 2), f"{k} {t:.0f}s", fill="yellow")
    return im
with ThreadPoolExecutor(6) as ex: rows = list(ex.map(row, keys))
for s in range(0, len(rows), 8):
    sh = Image.new("RGB", (N * W, 8 * (Hh + 16)))
    for j, r in enumerate(rows[s:s + 8]): sh.paste(r, (0, j * (Hh + 16)))
    sh.save(f"sheets/clips_{s // 8}.jpg", quality=85)
print(len(rows))
