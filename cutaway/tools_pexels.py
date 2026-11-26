"""Search Pexels videos/photos and save a thumbnail contact sheet per query.
Usage: tools_pexels.py <outdir> <videos|photos> "query" ["query" ...]"""
import json, sys, os, socket, urllib.request, urllib.parse
_gai = socket.getaddrinfo
socket.getaddrinfo = lambda *a, **k: [r for r in _gai(*a, **k) if r[0] == socket.AF_INET]   # IPv6 stalls on this network
from pathlib import Path
env = Path(__file__).resolve().parents[1] / ".env"
keys = [l.split("=",1)[1].strip() for l in env.read_text(encoding="utf-8").splitlines() if l.startswith("PEXELS_API_KEYS=")][0].split(",")
out, kind, qs = Path(sys.argv[1]), sys.argv[2], sys.argv[3:]
out.mkdir(parents=True, exist_ok=True)
def get(u, binary=False):
    r = urllib.request.Request(u, headers={"Authorization": keys[0].strip(), "User-Agent": "video-tool/1.0"})
    d = urllib.request.urlopen(r, timeout=60).read()
    return d if binary else json.loads(d)
allres = {}
for q in qs:
    base = "https://api.pexels.com/videos/search" if kind == "videos" else "https://api.pexels.com/v1/search"
    res = get(base + "?" + urllib.parse.urlencode({"query": q, "per_page": 15, "orientation": "landscape" if kind=="videos" else "portrait"}))
    items = res.get("videos") or res.get("photos") or []
    slug = "".join(c if c.isalnum() else "_" for c in q)[:30]
    rows = []
    for i, it in enumerate(items):
        thumb = it.get("image") or it["src"]["medium"]
        p = out / f"{slug}_{i:02d}_{it['id']}.jpg"
        if not p.exists():
            try: p.write_bytes(get(thumb, True))
            except Exception as e: continue
        rows.append({"id": it["id"], "dur": it.get("duration"), "w": it.get("width"), "h": it.get("height"),
                     "user": (it.get("user") or {}).get("name") or it.get("photographer"), "thumb": str(p)})
    allres[q] = rows
    print(q, len(rows))
(out / f"results_{kind}.json").write_text(json.dumps(allres, indent=1))
