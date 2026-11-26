"""Contact sheets of assets/raw/px_*.mp4: 3 frames per clip, one row per clip, 12 rows per sheet."""
import glob, os, subprocess, sys
from PIL import Image, ImageDraw
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
fs = sorted(glob.glob("assets/raw/px_*.mp4")); os.makedirs("sheets", exist_ok=True)
rows = []
for f in fs:
    d = float(subprocess.run([FF.replace("ffmpeg", "ffprobe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout or 1)
    ims = []
    for k in range(3):
        o = f"sheets/_t{k}.jpg"
        subprocess.run([FF, "-v", "error", "-y", "-ss", str(d * (0.15 + 0.35 * k)), "-i", f, "-frames:v", "1", "-vf", "scale=320:180", o])
        ims.append(Image.open(o).copy())
    rows.append((os.path.basename(f)[3:-4] + f" {d:.0f}s", ims))
for s in range(0, len(rows), 12):
    sh = Image.new("RGB", (3 * 324 + 200, 12 * 184), "black"); dr = ImageDraw.Draw(sh)
    for r, (lab, ims) in enumerate(rows[s:s + 12]):
        dr.text((6, r * 184 + 80), lab, fill="white")
        for k, i in enumerate(ims): sh.paste(i, (200 + k * 324, r * 184))
    sh.save(f"sheets/stock_{s // 12}.jpg", quality=85)
print(len(rows))
