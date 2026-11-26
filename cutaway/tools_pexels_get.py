"""Download Pexels photos (large2x) by id -> <outdir>/<name>.jpg and write credits.json.
Usage: tools_pexels_get.py <outdir> name=id [name=id ...]"""
import json, sys, socket, urllib.request
from pathlib import Path
_gai = socket.getaddrinfo
socket.getaddrinfo = lambda *a, **k: [r for r in _gai(*a, **k) if r[0] == socket.AF_INET]
env = Path(__file__).resolve().parents[1] / ".env"
key = [l.split("=", 1)[1].strip() for l in env.read_text(encoding="utf-8").splitlines() if l.startswith("PEXELS_API_KEYS=")][0].split(",")[0].strip()
H = {"Authorization": key, "User-Agent": "video-tool/1.0"}
out = Path(sys.argv[1]); out.mkdir(parents=True, exist_ok=True)
cred_p = out / "credits.json"; cred = json.loads(cred_p.read_text()) if cred_p.exists() else {}
for arg in sys.argv[2:]:
    name, pid = arg.split("=")
    j = json.loads(urllib.request.urlopen(urllib.request.Request(f"https://api.pexels.com/v1/photos/{pid}", headers=H), timeout=60).read())
    (out / f"{name}.jpg").write_bytes(urllib.request.urlopen(urllib.request.Request(j["src"]["large2x"], headers=H), timeout=180).read())
    cred[name] = {"id": int(pid), "photographer": j["photographer"], "url": j["url"]}
    print(name, j["photographer"])
cred_p.write_text(json.dumps(cred, indent=1))
