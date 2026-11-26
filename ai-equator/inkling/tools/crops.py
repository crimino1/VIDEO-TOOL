"""Preview page crops: crops.py name:x0,y0,x1,y1 ...  -> one contact image in the scratchpad (crops.png)."""
import sys
from PIL import Image
Image.MAX_IMAGE_PIXELS = None
out = sys.argv[1]
ims = []
for a in sys.argv[2:]:
    n, c = a.split(":")
    c = [float(x) for x in c.split(",")]
    i = Image.open(f"assets/raw/web/{n}.png").convert("RGB")
    W, H = i.size
    j = i.crop((int(c[0] * W), int(c[1] * H), int(c[2] * W), int(c[3] * H)))
    j.thumbnail((900, 700))
    ims.append(j)
o = Image.new("RGB", (900 * min(3, len(ims)), 700 * ((len(ims) + 2) // 3)), "gray")
for k, j in enumerate(ims):
    o.paste(j, ((k % 3) * 900, (k // 3) * 700))
o.save(out)
