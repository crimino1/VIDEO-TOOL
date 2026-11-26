"""Pexels stock video, 1080p or better, 16:9 only. Saves a few options per subject in assets/raw/px_<name>_<i>.mp4 and credits. Keys stay in .env."""
import json, os, sys, time, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "assets", "raw")
env = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, "..", ".env"), encoding="utf-8") if "=" in l and not l.startswith("#"))
KEY = env["PEXELS_API_KEYS"].split(",")[0].strip()
Q = {
 "grass": "tall grass field wind", "grassaerial": "grassland aerial", "menwalk": "group of men walking field", "crowd": "crowd of people walking", "dust": "dust rising ground",
 "gorilla": "gorilla", "wolf": "gray wolf", "wolfpack": "wolf pack snow", "lion": "male lion", "lionhunt": "lioness running", "croc": "crocodile water",
 "bigcat": "jaguar", "bear": "grizzly bear", "snake": "python snake", "ostrich": "ostrich running", "turkey": "wild turkey",
 "ocean": "ocean waves storm", "underwater": "deep blue underwater", "shark": "shark swimming", "river": "muddy river",
 "fire": "campfire night", "torch": "burning torch fire", "skeleton": "dinosaur skeleton museum", "fossil": "fossil excavation", "bus": "city bus street",
 "elephant": "elephant herd", "maasai": "maasai", "storm": "storm clouds timelapse", "forest": "foggy forest", "coal": "coal mine", "sunset": "savanna sunset",
}
cred_path = os.path.join(ROOT, "assets", "raw", "pexels.json")
cred = json.load(open(cred_path, encoding="utf-8")) if os.path.exists(cred_path) else {}


def get(u, auth=False):
    h = {"User-Agent": "VideoToolImageFetcher/1.0"}
    if auth: h["Authorization"] = KEY
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(u, headers=h), timeout=180) as r:
                return r.read()
        except Exception as e:
            print("  retry", name, type(e).__name__, flush=True)
            time.sleep(8 * (i + 1))
    return None


for name, q in Q.items():
    if name in cred:
        continue
    raw = get("https://api.pexels.com/videos/search?" + urllib.parse.urlencode({"query": q, "orientation": "landscape", "size": "large", "per_page": 20}), True)
    if not raw:
        continue
    got = []
    for v in json.loads(raw).get("videos", []):
        if v["duration"] < 6 or abs(v["width"] / v["height"] - 16 / 9) > 0.01:
            continue
        files = [f for f in v["video_files"] if f.get("width") == 1920 and f.get("height") == 1080 and f["file_type"] == "video/mp4"]
        if not files:
            continue
        data = get(files[0]["link"])
        if not data:
            continue
        i = len(got)
        open(os.path.join(OUT, f"px_{name}_{i}.mp4"), "wb").write(data)
        got.append({"i": i, "by": v["user"]["name"], "url": v["url"], "dur": v["duration"]})
        if len(got) == 3:
            break
    cred[name] = got
    print(name, len(got), flush=True)
    json.dump(cred, open(cred_path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("done")
