"""Pexels photos: 4 candidates per subject -> assets/img/cand/<name>_<i>.jpg, credits in assets/img/cand/pexels.json. Key from .env, never printed."""
import json, os, sys, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from net import get
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "assets", "img", "cand")
env = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, "..", "..", ".env"), encoding="utf-8") if "=" in l and not l.startswith("#"))
KEY = env["PEXELS_API_KEYS"].split(",")[0].strip()
Q = dict(a.split("=", 1) for a in sys.argv[1:])
cp = os.path.join(OUT, "pexels.json")
cred = json.load(open(cp, encoding="utf-8")) if os.path.exists(cp) else {}
for name, q in Q.items():
    raw = get("https://api.pexels.com/v1/search?" + urllib.parse.urlencode({"query": q, "orientation": "landscape", "per_page": 4}), {"Authorization": KEY})
    got = []
    for i, p in enumerate(json.loads(raw).get("photos", [])[:4]):
        data = get(p["src"]["large2x"])
        if data:
            open(os.path.join(OUT, f"{name}_{i}.jpg"), "wb").write(data)
            got.append({"i": i, "id": p["id"], "by": p["photographer"], "url": p["url"]})
    cred[name] = got; print(name, len(got), flush=True)
    json.dump(cred, open(cp, "w", encoding="utf-8"), indent=1)
