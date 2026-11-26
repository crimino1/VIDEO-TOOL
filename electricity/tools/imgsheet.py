"""Thumbnail sheet of a folder of images, labelled: imgsheet.py <dir> <out.jpg> [prefix]"""
import os, sys
from PIL import Image, ImageDraw
Image.MAX_IMAGE_PIXELS = None
d, out = sys.argv[1:3]
pre = sys.argv[3] if len(sys.argv) > 3 else ""
fs = sorted(f for f in os.listdir(d) if f.lower().endswith((".jpg", ".png", ".jpeg")) and f.startswith(pre))
W, H, C = 320, 200, 6
R = (len(fs) + C - 1) // C
sheet = Image.new("RGB", (W * C, H * R), (20, 20, 28))
dr = ImageDraw.Draw(sheet)
for i, f in enumerate(fs):
    try:
        im = Image.open(os.path.join(d, f)).convert("RGB")
    except Exception as e:
        print("BAD", f, e)
        continue
    w0, h0 = im.size
    im.thumbnail((W - 4, H - 18))
    x, y = (i % C) * W, (i // C) * H
    sheet.paste(im, (x + 2, y + 16))
    dr.text((x + 3, y + 2), f"{f[:-4]} {w0}x{h0}", fill=(255, 230, 0))
sheet.save(out, quality=85)
print(len(fs), "images")
