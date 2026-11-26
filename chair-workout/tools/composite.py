"""Preview composite: figure render (transparent PNG) over a background photo with a soft contact shadow.
python composite.py <figure.png> <bg.jpg> <out.jpg> [bg_blur]"""
import sys
from PIL import Image, ImageFilter, ImageDraw, ImageEnhance

fig_p, bg_p, out_p = sys.argv[1:4]
blur = float(sys.argv[4]) if len(sys.argv) > 4 else 2.5
shift = float(sys.argv[5]) if len(sys.argv) > 5 else 0.5   # 0 = left edge of the photo, 1 = right edge
W, H = 1920, 1080
bg = Image.open(bg_p).convert("RGB")
s = max(W / bg.width, H / bg.height)
bg = bg.resize((round(bg.width * s), round(bg.height * s)), Image.LANCZOS)
s2 = max(W / bg.width, H / bg.height) * 1.25
bg = bg.resize((round(bg.width * 1.25), round(bg.height * 1.25)), Image.LANCZOS)
ox = round((bg.width - W) * shift); oy = bg.height - H
bg = bg.crop((ox, oy, ox + W, oy + H))
bg = bg.filter(ImageFilter.GaussianBlur(blur))           # soft focus so the figure stands out
bg = ImageEnhance.Brightness(bg).enhance(0.92)
fig = Image.open(fig_p).convert("RGBA")
a = fig.getchannel("A"); x0, y0, x1, y1 = a.getbbox()
# contact shadow: a soft dark ellipse under the chair legs and feet
sh = Image.new("L", (W, H), 0); d = ImageDraw.Draw(sh)
cx, cy, rw = (x0 + x1) / 2 - 20, y1 - 40, (x1 - x0) * 0.24
d.ellipse([cx - rw, cy - 34, cx + rw, cy + 30], fill=175)
sh = sh.filter(ImageFilter.GaussianBlur(22))
bg = Image.composite(Image.new("RGB", (W, H), (20, 20, 20)), bg, sh)
bg.paste(fig, (0, 0), fig)
bg.save(out_p, quality=92)
print(out_p, "figure box", (x0, y0, x1, y1))
