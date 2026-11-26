"""Contact sheet: sheet.py <out.jpg> <files...>  (images; for .mp4 grabs frames at 30% and 75% via ffmpeg)."""
import os, subprocess, sys, io
from PIL import Image, ImageDraw
Image.MAX_IMAGE_PIXELS = None
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
FP = FF.replace("ffmpeg.exe", "ffprobe.exe")
W, H, COLS = 360, 240, 4
tiles = []
for f in sys.argv[2:]:
    base = os.path.splitext(os.path.basename(f))[0]
    if f.endswith(".mp4"):
        dur = float(subprocess.run([FP, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout or 8)
        for k in [float(x) for x in os.environ.get("FR", "0.3,0.75").split(",")]:
            png = subprocess.run([FF, "-v", "error", "-ss", str(dur * k), "-i", f, "-frames:v", "1", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True).stdout
            tiles.append((Image.open(io.BytesIO(png)), f"{base} @{k}"))
    else:
        im = Image.open(f)
        tiles.append((im, f"{base} {im.width}x{im.height}"))
rows = (len(tiles) + COLS - 1) // COLS
sheet = Image.new("RGB", (COLS * W, rows * (H + 18)), "#222")
d = ImageDraw.Draw(sheet)
for n, (im, label) in enumerate(tiles):
    im = im.convert("RGB"); im.thumbnail((W - 4, H - 4))
    x, y = n % COLS * W, n // COLS * (H + 18)
    sheet.paste(im, (x + (W - im.width) // 2, y + (H - im.height) // 2))
    d.text((x + 4, y + H + 2), label[:50], fill="white")
sheet.save(sys.argv[1], quality=88)
