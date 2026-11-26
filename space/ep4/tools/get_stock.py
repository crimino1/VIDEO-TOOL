"""Pexels stock video, 1920x1080 16:9, >=6 s. Up to 3 options per subject -> assets/raw/px_<name>_<i>.mp4, credits in pexels.json. Key read from .env, never printed."""
import json, os, sys, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from net import get
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "assets", "raw")
env = dict(l.strip().split("=", 1) for l in open(os.path.join(ROOT, "..", "..", ".env"), encoding="utf-8") if "=" in l and not l.startswith("#"))
KEY = env["PEXELS_API_KEYS"].split(",")[0].strip()
Q = {
    "launchpad": "rocket on launch pad", "friends_hug": "two men hugging friends", "friends_laugh": "young men laughing together",
    "ignite": "rocket launch fire", "wallclock": "wall clock ticking", "city_future": "futuristic city skyline night aerial",
    "phone_holo": "hologram phone futuristic", "crowd": "crowd walking street slow motion", "oldman": "old man portrait",
    "whitehair": "elderly man white hair close up", "oldhands": "elderly hands trembling close up", "grandkids": "grandfather with grandchildren",
    "hourglass": "hourglass sand time", "oldman_window": "old man looking out window", "screenwatch": "man watching screen dark room face lit",
    "homevideo": "vintage family home movie", "graduation": "graduation caps thrown", "wedding": "wedding couple", "baby": "newborn baby hand",
    "sundial": "sundial", "gears": "clock gears mechanism", "skydive": "skydiving freefall", "pocketwatch": "pocket watch close up",
    "silhouette": "man standing silhouette sunset", "laserlab": "laser optics laboratory", "books": "stack of books",
    "digitalclock": "digital clock numbers", "standing": "man standing full body", "skyscraper": "skyscraper looking up",
    "everest": "himalaya mountain peak aerial", "climbers": "mountain climbers snow ridge", "jet_takeoff": "airplane takeoff",
    "cabin": "airplane cabin passengers", "clouds_wing": "airplane wing above clouds", "contrail": "airplane contrail sky",
    "lighttrails": "highway night timelapse light trails", "phonemap": "phone map navigation", "control": "control room screens",
    "cityaerial": "city aerial drone", "carnav": "car navigation screen night", "spoon": "teaspoon close up",
    "friends_group": "group of friends laughing", "waves_big": "huge ocean waves", "pendulum": "pendulum clock",
    "wave_slow": "ocean wave slow motion", "prism": "prism light rainbow", "university": "old university building", "clocks_many": "antique clocks",
}
cred_path = os.path.join(OUT, "pexels.json")
cred = json.load(open(cred_path, encoding="utf-8")) if os.path.exists(cred_path) else {}
SKIP, KEEP = {}, {}  # redo: get_stock.py name="new query[|keep,idx]" ... replaces that subject, keeping listed clips, skipping all seen before
if sys.argv[1:]:
    Q = dict(a.split("=", 1) for a in sys.argv[1:])
    for n, q in list(Q.items()):
        q, _, k = q.partition("|")
        Q[n], keep, old = q, {int(i) for i in k.split(",") if i}, cred.pop(n, [])
        SKIP[n] = {c["id"] for c in old} | {c["id"] for v in cred.values() for c in v}  # also no clip used by another subject
        KEEP[n] = []
        for c in old:
            f = os.path.join(OUT, f"px_{n}_{c['i']}.mp4")
            if c["i"] in keep:
                os.replace(f, f + ".keep"); KEEP[n].append(c)
            elif os.path.exists(f):
                os.remove(f)
        for j, c in enumerate(KEEP[n]):
            os.replace(os.path.join(OUT, f"px_{n}_{c['i']}.mp4.keep"), os.path.join(OUT, f"px_{n}_{j}.mp4")); c["i"] = j

for name, q in Q.items():
    if name in cred:
        continue
    raw = get("https://api.pexels.com/videos/search?" + urllib.parse.urlencode({"query": q, "orientation": "landscape", "size": "large", "per_page": 30}), {"Authorization": KEY})
    if not raw:
        print("search failed", name)
        continue
    got = KEEP.get(name, [])
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
        if len(got) == int(os.environ.get('PER', 3)):
            break
    cred[name] = got
    print(name, len(got), flush=True)
    json.dump(cred, open(cred_path, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
print("done")
