"""Numbered thumbnail sheets from tools_pexels.py results.  Usage: tools_sheet.py <pex dir> <videos|photos>"""
import json, os, sys
from PIL import Image, ImageDraw
d0, kind = sys.argv[1], sys.argv[2]
R = json.load(open(os.path.join(d0, f"results_{kind}.json")))
for q, rows in R.items():
    slug = "".join(c if c.isalnum() else "_" for c in q)[:30]
    tw, th = (320, 180) if kind == "videos" else (200, 300)
    S = Image.new("RGB", (5 * tw, 3 * (th + 20)), (20, 20, 20)); d = ImageDraw.Draw(S)
    for k, r in enumerate(rows[:15]):
        p = os.path.join(d0, os.path.basename(r["thumb"].replace(chr(92), "/")))
        if not os.path.exists(p): continue
        im = Image.open(p).convert("RGB"); im.thumbnail((tw, th)); x, y = (k % 5) * tw, (k // 5) * (th + 20)
        S.paste(im, (x, y)); d.rectangle([x, y, x + 150, y + 16], fill=(0, 0, 0)); d.text((x + 3, y + 2), f"{k} id{r['id']} {r.get('dur')}s", fill=(255, 230, 0))
    S.save(os.path.join(d0, f"sheet_{kind}_{slug}.jpg"), quality=85)
print("ok")
