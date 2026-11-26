"""Download Openverse tracks by Jamendo id from saved q_*.json. python -I tools/ovget.py id:name ..."""
import json, socket, sys, urllib.request
from pathlib import Path
_g = socket.getaddrinfo; socket.getaddrinfo = lambda h, p, f=0, *a, **k: _g(h, p, socket.AF_INET, *a, **k)
M = Path(__file__).resolve().parents[1] / "music"
allr = {r["foreign_landing_url"].rstrip("/").split("/")[-1]: r for f in M.glob("q_*.json") for r in json.loads(f.read_text())["results"]}
cred = []
for arg in sys.argv[1:]:
    tid, name = arg.split(":"); r = allr[tid]
    out = M / f"{name}.mp3"
    if not out.exists():
        out.write_bytes(urllib.request.urlopen(urllib.request.Request(r["url"], headers={"User-Agent": "video-tool/1.0"}), timeout=120).read())
    print(out.name, out.stat().st_size // 1024, "KB")
    cred.append(f'"{r["title"]}" by {r["creator"]} (CC {r["license"].upper()} {r["license_version"]}, {r["foreign_landing_url"]})')
(M / "CREDITS.txt").write_text("\n".join(cred) + "\n")
print(open(M / "CREDITS.txt").read())
