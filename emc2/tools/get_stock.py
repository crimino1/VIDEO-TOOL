"""Pexels stock video, 1920x1080 16:9, >=6 s. Up to 3 options per subject -> assets/raw/px_<name>_<i>.mp4, credits in pexels.json. Key read from .env, never printed."""
import json, os, sys, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from net import get
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "assets", "raw"); os.makedirs(OUT, exist_ok=True)
env = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, "..", ".env"), encoding="utf-8") if "=" in l and not l.startswith("#"))
KEY = env["PEXELS_API_KEYS"].split(",")[0].strip()
Q = {
    "telescope": "telescope night sky", "stars": "night sky stars timelapse", "bathtub": "bathtub filling water", "pool": "olympic swimming pool",
    "football": "football stadium field aerial", "hair": "hair close up macro", "building": "small apartment building exterior", "paper": "sheet of paper",
    "snow": "fresh snow field untouched", "shark": "shark swimming", "maunakea": "mauna kea observatory", "rain": "rain drops slow motion",
    "downpour": "heavy rain storm", "meteor": "meteor shooting star", "butterfly": "butterfly emerging from chrysalis", "lab": "scientist looking at computer data",
    "observatory": "observatory dome night", "dust": "dust particles light beam",
}
cred_path = os.path.join(OUT, "pexels.json")
cred = json.load(open(cred_path, encoding="utf-8")) if os.path.exists(cred_path) else {}
SKIP = {}  # redo: get_stock.py name="new query" ... replaces that subject, skipping the clips rejected before
if sys.argv[1:]:
    Q = dict(a.split("=", 1) for a in sys.argv[1:])
    for n in Q:
        SKIP[n] = {c["id"] for c in cred.pop(n, [])}

for name, q in Q.items():
    if name in cred:
        continue
    raw = get("https://api.pexels.com/videos/search?" + urllib.parse.urlencode({"query": q, "orientation": "landscape", "size": "large", "per_page": 30}), {"Authorization": KEY})
    if not raw:
        print("search failed", name)
        continue
    got = []
    for v in json.loads(raw).get("videos", []):
        if v["duration"] < 6 or abs(v["width"] / v["height"] - 16 / 9) > 0.01 or v["id"] in SKIP.get(name, ()):
            continue
        files = [f for f in v["video_files"] if f.get("width") == 1920 and f.get("height") == 1080 and f["file_type"] == "video/mp4"]
        data = files and get(files[0]["link"])
        if not data:
            continue
        i = len(got)
        open(os.path.join(OUT, f"px_{name}_{i}.mp4"), "wb").write(data)
        got.append({"i": i, "id": v["id"], "by": v["user"]["name"], "url": v["url"], "dur": v["duration"]})
        if len(got) == 3:
            break
    cred[name] = got
    print(name, len(got), flush=True)
    json.dump(cred, open(cred_path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("done")
