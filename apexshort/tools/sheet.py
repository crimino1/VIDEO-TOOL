"""Contact sheet: tools/sheet.py clip.mp4 out.jpg [n] [t0] [t1] -> n frames with timestamps."""
import subprocess, sys, io
from PIL import Image, ImageDraw, ImageFont
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
p, out = sys.argv[1:3]; n = int(sys.argv[3]) if len(sys.argv) > 3 else 12
d = float(subprocess.run([FF.replace("ffmpeg.exe", "ffprobe.exe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout)
t0 = float(sys.argv[4]) if len(sys.argv) > 4 else 0; t1 = float(sys.argv[5]) if len(sys.argv) > 5 else d
fr = []
for i in range(n):
    t = t0 + (t1 - t0) * (i + 0.5) / n
    b = subprocess.run([FF, "-v", "error", "-ss", f"{t:.2f}", "-i", p, "-frames:v", "1", "-vf", "scale=320:-1", "-f", "image2pipe", "-c:v", "png", "-"], capture_output=True).stdout
    im = Image.open(io.BytesIO(b)).convert("RGB"); ImageDraw.Draw(im).text((6, 4), f"{t:.1f}", fill="yellow", font=ImageFont.truetype("arial.ttf", 22)); fr.append(im)
w, h = fr[0].size; cols = 6; rows = (n + cols - 1) // cols
S = Image.new("RGB", (w * cols, h * rows))
for i, im in enumerate(fr): S.paste(im, ((i % cols) * w, (i // cols) * h))
S.save(out, quality=85); print(out)
