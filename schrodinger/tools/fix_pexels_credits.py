"""Rebuilds lost Pexels credit entries: searches again, matches each saved option to a result by image likeness."""
import io, json, os, re, sys, urllib.parse, urllib.request
import numpy as np
from PIL import Image
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
IMG = os.path.join(ROOT, "assets", "img")
OPT = os.path.join(IMG, "_opts")
env = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, "..", ".env"), encoding="utf-8") if "=" in l and not l.startswith("#"))
KEY = env["PEXELS_API_KEYS"].split(",")[0].strip()
src = open(os.path.join(ROOT, "tools", "fetch_pexels.py"), encoding="utf-8").read()
Q = dict(re.findall(r'^\s+"(\w+)": "([^"]+)",$', src, re.M))
path = os.path.join(IMG, "credits-pexels.json")
cr = json.load(open(path, encoding="utf-8"))


def get(u, auth=False):
    h = {"User-Agent": "VideoToolImageFetcher/1.0"}
    if auth: h["Authorization"] = KEY
    with urllib.request.urlopen(urllib.request.Request(u, headers=h), timeout=90) as r:
        return r.read()


def sig(im):
    return np.asarray(im.convert("L").resize((16, 16)), dtype=float)


for name, q in Q.items():
    files = sorted(f for f in os.listdir(OPT) if re.fullmatch(name + r"_\d+\.jpg", f))
    have = {o["i"] for o in cr.get(name, {}).get("options", [])}
    if all(int(f[:-4].rsplit("_", 1)[1]) in have for f in files):
        continue
    res = json.loads(get("https://api.pexels.com/v1/search?" + urllib.parse.urlencode({"query": q, "orientation": "landscape", "size": "large", "per_page": 8}), True))["photos"]
    sigs = [(p, sig(Image.open(io.BytesIO(get(p["src"]["tiny"]))))) for p in res]
    opts = cr.setdefault(name, {"options": []})["options"]
    for f in files:
        i = int(f[:-4].rsplit("_", 1)[1])
        if i in have:
            continue
        s = sig(Image.open(os.path.join(OPT, f)))
        p, score = min(((p, np.abs(s - t).mean()) for p, t in sigs), key=lambda x: x[1])
        opts.append({"i": i, "id": p["id"], "by": p["photographer"], "page": p["url"], "size": f"{p['width']}x{p['height']}", "match": round(float(score), 1)})
        print(name, i, p["photographer"], round(float(score), 1))
    json.dump(cr, open(path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("done")
