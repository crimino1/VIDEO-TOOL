"""Pexels photos of whole people (plain backgrounds) for the crowd cut-outs. Writes assets/people/cand/<q>_<i>.jpg (thumb) + cand.json, and a contact sheet."""
import json, os, sys, time, urllib.parse, urllib.request
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
env = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, "..", ".env"), encoding="utf-8") if "=" in l and not l.startswith("#"))
KEY = env["PEXELS_API_KEYS"].split(",")[0].strip()
Q = {"stand": "man standing full body white background", "walk": "man walking full body white background", "run": "man running full body white background",
     "arms": "man arms raised full body white background", "casual": "full body man isolated studio", "side": "man side view full body studio"}
OUT = os.path.join(ROOT, "assets", "people", "cand")
def get(u, auth=False):
    h = {"User-Agent": "VideoToolImageFetcher/1.0"}
    if auth: h["Authorization"] = KEY
    return urllib.request.urlopen(urllib.request.Request(u, headers=h), timeout=120).read()
cand = {}
for k, q in Q.items():
    r = json.loads(get("https://api.pexels.com/v1/search?" + urllib.parse.urlencode({"query": q, "orientation": "portrait", "per_page": 12}), True))
    cand[k] = []
    for i, p in enumerate(r.get("photos", [])):
        open(os.path.join(OUT, f"{k}_{i}.jpg"), "wb").write(get(p["src"]["medium"]))
        cand[k].append({"id": p["id"], "by": p["photographer"], "url": p["url"], "large": p["src"]["large2x"]})
    print(k, len(cand[k]), flush=True)
json.dump(cand, open(os.path.join(OUT, "cand.json"), "w"), indent=1)
ks = list(cand)
sh = Image.new("RGB", (12 * 160, len(ks) * 250), "black"); d = ImageDraw.Draw(sh)
for r_, k in enumerate(ks):
    for i in range(len(cand[k])):
        im = Image.open(os.path.join(OUT, f"{k}_{i}.jpg")); im.thumbnail((156, 230)); sh.paste(im, (i * 160, r_ * 250)); d.text((i * 160 + 3, r_ * 250 + 233), f"{k}_{i}", fill="yellow")
sh.save(os.path.join(OUT, "sheet.jpg"), quality=85)
