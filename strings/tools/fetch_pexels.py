"""Download landscape photos from Pexels (free licence). Keys stay in ../.env and are never printed.
Saves up to three options per subject in assets/img/_opts/ with credits in assets/img/credits-pexels.json. Skips subjects already done; retries timeouts."""
import json, os, time, urllib.parse, urllib.request

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "assets", "img")
OPT = os.path.join(OUT, "_opts")
os.makedirs(OPT, exist_ok=True)
env = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, "..", ".env"), encoding="utf-8") if "=" in l and not l.startswith("#"))
KEY = env["PEXELS_API_KEYS"].split(",")[0].strip()
UA = "VideoToolImageFetcher/1.0"

Q = {
    "chip": "computer chip macro processor",
    "galaxy": "spiral galaxy space",
    "empty_hall": "empty lecture hall auditorium",
    "drawer": "old wooden filing cabinet drawer",
    "full_hall": "chalkboard equations physics lecture",
    "papers": "stack of old scientific papers",
    "metal": "metal surface macro liquid metal",
    "chalkboard": "chalkboard math equations",
}
path = os.path.join(OUT, "credits-pexels.json")
credits = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else {}


def get(url, auth=False):
    h = {"User-Agent": UA}
    if auth:
        h["Authorization"] = KEY
    for i in range(5):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=h), timeout=120) as r:
                return r.read()
        except Exception as e:
            print("  retry", type(e).__name__, getattr(e, "code", ""), flush=True)
            time.sleep(10 * (i + 1))
    return None


for name, q in Q.items():
    have = [f for f in os.listdir(OPT) if f.startswith(name + "_")]
    if len(have) >= 3:
        continue
    raw = get("https://api.pexels.com/v1/search?" + urllib.parse.urlencode({"query": q, "orientation": "landscape", "size": "large", "per_page": 3}), True)
    if not raw:
        print("FAILED search", name, flush=True)
        continue
    opts = []
    for i, p in enumerate(json.loads(raw).get("photos", [])):
        data = get(p["src"]["original"] + "?auto=compress&cs=tinysrgb&w=2200")
        if data:
            open(os.path.join(OPT, f"{name}_{i}.jpg"), "wb").write(data)
            opts.append({"i": i, "id": p["id"], "by": p["photographer"], "page": p["url"], "size": f"{p['width']}x{p['height']}"})
    credits[name] = {"options": opts}
    print(name, len(opts), flush=True)
    json.dump(credits, open(path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("done")
