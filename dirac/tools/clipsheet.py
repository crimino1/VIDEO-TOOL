"""Contact sheet of stock clips: two frames each (25% and 70%), labelled with name, length and colour transfer. clipsheet.py <out.jpg> [prefix]"""
import glob, os, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
FP = FF.replace("ffmpeg.exe", "ffprobe.exe")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
out, pre = sys.argv[1], (sys.argv[2] if len(sys.argv) > 2 else "")
fs = sorted(glob.glob(os.path.join(ROOT, "assets", "raw", f"px_{pre}*.mp4")))
tmp = tempfile.mkdtemp()
W, H = 288, 162
def job(f):
    r = subprocess.run([FP, "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer:format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout.split()
    d = float(r[-1]); trc = r[0].split(",")[0] if len(r) > 1 else "?"
    ims = []
    for k, frac in enumerate((0.25, 0.7)):
        p = os.path.join(tmp, os.path.basename(f) + f"{k}.jpg")
        subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{d * frac:.2f}", "-i", f, "-frames:v", "1", "-vf", f"scale={W}:{H}", p])
        ims.append(p)
    return f, d, trc, ims
with ThreadPoolExecutor(8) as ex:
    res = list(ex.map(job, fs))
C = 3
R = (len(res) + C - 1) // C
sheet = Image.new("RGB", (C * 2 * W, R * H), (20, 20, 26))
d = ImageDraw.Draw(sheet)
for i, (f, dur, trc, ims) in enumerate(res):
    x, y = (i % C) * 2 * W, (i // C) * H
    for k, p in enumerate(ims):
        if os.path.exists(p):
            sheet.paste(Image.open(p), (x + k * W, y))
    d.rectangle([x, y, x + 2 * W - 1, y + 14], fill=(0, 0, 0))
    d.text((x + 3, y + 1), f"{os.path.basename(f)[3:-4]} {dur:.0f}s {trc}", fill=(255, 230, 0))
sheet.save(out, quality=85)
print(len(res), "clips")
