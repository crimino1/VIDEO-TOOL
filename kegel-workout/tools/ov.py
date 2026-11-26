"""Openverse CC music search (commercial use). python -I tools/ov.py "query" ..."""
import json, socket, sys, urllib.parse, urllib.request
from pathlib import Path
_g = socket.getaddrinfo; socket.getaddrinfo = lambda h, p, f=0, *a, **k: _g(h, p, socket.AF_INET, *a, **k)
OUT = Path(__file__).resolve().parents[1] / "music"
for q in sys.argv[1:]:
    u = "https://api.openverse.org/v1/audio/?" + urllib.parse.urlencode({"q": q, "license_type": "commercial", "category": "music", "page_size": 20})
    d = json.load(urllib.request.urlopen(urllib.request.Request(u, headers={"User-Agent": "video-tool/1.0"}), timeout=60))
    (OUT / f"q_{q.replace(' ', '')[:12]}.json").write_text(json.dumps(d, indent=1))
    for r in d["results"]:
        dur = (r.get("duration") or 0) // 1000
        if dur < 120: continue
        tags = ",".join(t["name"] for t in r.get("tags", [])[:6])
        print(f'{q[:10]:10} | {r["title"][:30]:30} | {r["creator"][:18]:18} | {dur:4}s | {r["license"]} {r["license_version"]} | {r["source"]} | {r["foreign_landing_url"]} | {tags}')
