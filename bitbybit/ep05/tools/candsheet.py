"""Contact sheets of Pixabay candidate thumbnails: python -I tools/candsheet.py stock/cands.json stock/prev"""
import json, sys, socket, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw
_g = socket.getaddrinfo
socket.getaddrinfo = lambda h, p, f=0, *a, **k: _g(h, p, socket.AF_INET, *a, **k)
cands, out = json.load(open(sys.argv[1])), Path(sys.argv[2])
for cat, ids in cands.items():
    tiles = []
    for i, v in enumerate(ids):
        f = out / f"{v.split('/')[-1]}.jpg"
        if not f.exists():
            try:
                f.write_bytes(urllib.request.urlopen(urllib.request.Request(f"https://cdn.pixabay.com/video/{v}_tiny.jpg", headers={"User-Agent": "Mozilla/5.0"}), timeout=30).read())
            except Exception as e:
                print(cat, v, e); continue
        im = Image.open(f).convert("RGB"); im.thumbnail((400, 225))
        t = Image.new("RGB", (400, 225)); t.paste(im, ((400 - im.width) // 2, (225 - im.height) // 2))
        ImageDraw.Draw(t).text((6, 4), f"{i} {v.split('/')[-1].split('-')[0]} {v[:4]}", fill="yellow")
        tiles.append(t)
    s = Image.new("RGB", (1600, 225 * ((len(tiles) + 3) // 4)))
    for i, t in enumerate(tiles): s.paste(t, ((i % 4) * 400, (i // 4) * 225))
    s.save(out / f"sheet_{cat}.jpg", quality=85); print(cat, len(tiles))
