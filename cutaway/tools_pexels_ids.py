"""Fetch Pexels photos by id range (same shoot = neighbouring ids) and save thumbs + a sheet.
Usage: tools_pexels_ids.py <outdir> <first_id> <last_id>"""
import json, sys, socket, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw
_gai = socket.getaddrinfo
socket.getaddrinfo = lambda *a, **k: [r for r in _gai(*a, **k) if r[0] == socket.AF_INET]
env = Path(__file__).resolve().parents[1] / ".env"
key = [l.split("=", 1)[1].strip() for l in env.read_text(encoding="utf-8").splitlines() if l.startswith("PEXELS_API_KEYS=")][0].split(",")[0].strip()
out, a, b = Path(sys.argv[1]), int(sys.argv[2]), int(sys.argv[3]); out.mkdir(parents=True, exist_ok=True)
def get(u, binary=False):
    d = urllib.request.urlopen(urllib.request.Request(u, headers={"Authorization": key, "User-Agent": "video-tool/1.0"}), timeout=60).read()
    return d if binary else json.loads(d)
rows = []
for i in range(a, b + 1):
    try: j = get(f"https://api.pexels.com/v1/photos/{i}")
    except Exception: continue
    p = out / f"id{i}.jpg"
    if not p.exists(): p.write_bytes(get(j["src"]["medium"], True))
    rows.append({"id": i, "photographer": j.get("photographer"), "alt": j.get("alt"), "w": j["width"], "h": j["height"], "orig": j["src"]["original"]})
(out / f"ids_{a}_{b}.json").write_text(json.dumps(rows, indent=1))
cols = 6; S = Image.new("RGB", (cols * 200, ((len(rows) + cols - 1) // cols) * 320), (20, 20, 20)); d = ImageDraw.Draw(S)
for k, r in enumerate(rows):
    im = Image.open(out / f"id{r['id']}.jpg").convert("RGB"); im.thumbnail((200, 300)); x, y = (k % cols) * 200, (k // cols) * 320
    S.paste(im, (x, y)); d.rectangle([x, y, x + 120, y + 14], fill=(0, 0, 0)); d.text((x + 2, y + 1), f"{r['id']}", fill=(255, 230, 0))
S.save(out / f"sheet_ids_{a}_{b}.jpg", quality=85)
print(len(rows), "photos;", sorted(set(r["photographer"] for r in rows)))
