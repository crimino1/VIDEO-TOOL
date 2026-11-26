"""Pexels stock video, 1080p or better, 16:9 only. Saves a few options per subject in assets/raw/px_<name>_<i>.mp4 and credits. Keys stay in .env."""
import json, os, sys, time, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "assets", "raw")
env = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, "..", ".env"), encoding="utf-8") if "=" in l and not l.startswith("#"))
KEY = env["PEXELS_API_KEYS"].split(",")[0].strip()
Q = {
 "bro": "blue ringed octopus", "octo": "octopus underwater", "octo2": "octopus crawling reef", "tidepool": "tide pool", "rockpool": "rock pool beach", "reef": "coral reef shallow",
 "seagrass": "seagrass underwater", "kids": "children exploring rock pool", "beach": "australian beach rocks", "coast": "australia coastline aerial", "crab": "crab rocks",
 "shrimp": "shrimp underwater", "puffer": "pufferfish", "sushi": "sushi chef knife", "ambulance": "ambulance night", "hospital": "hospital ventilator", "diver": "scuba diver reef",
 "bottle": "bottle underwater", "dawn": "sunrise ocean", "dusk": "sunset rocky shore", "island": "tropical island aerial", "shell": "sea shell sand underwater", "hand": "hand touching water tide pool",
 "starfish": "starfish tide pool", "waves": "waves crashing rocks", "fish": "small fish reef", "eggs": "octopus eggs", "lab": "scientist microscope", "nerve": "neuron animation", "lungs": "breathing man"
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
