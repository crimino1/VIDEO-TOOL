"""Download the chosen Commons photos (standard sizes, slow and polite, ipv4) and record credits."""
import json, os, socket, urllib.request, urllib.parse, time
_g = socket.getaddrinfo; socket.getaddrinfo = lambda *a, **k: [r for r in _g(*a, **k) if r[0] == socket.AF_INET]
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
cand = json.load(open("assets/photo/cand/cand.json", encoding="utf-8"))
PICK = {"swordfish": "swordfish_1", "humboldt": "humboldt_4", "viper": "viper_1", "viper_lure": "viper_7", "loosejaw": "loosejaw_1", "dragon": "dragon_0", "dragon_head": "dragon_2",
        "angler": "angler_4", "fangtooth": "fangtooth_0", "swallower": "swallower_1", "swallower_full": "swallower_4", "gulper": "gulper_3", "goblin": "goblin_5", "goblin_paint": "goblin_0",
        "frilled_head": "frilled_0", "frilled": "frilled_2", "greenland": "greenland_0", "greenland_head": "greenland_5", "giantsquid": "giantsquid_5", "sperm_photo": "sperm_0",
        "tunicate": "tunicate_0", "tripod_photo": "tripod_3", "dumbo": "dumbo_6", "lantern": "lantern_6", "viper_draw": "viper_5", "humboldt2": "humboldt_2", "dumbo2": "dumbo_3", "loosejaw2": "loosejaw_2"}
API = "https://commons.wikimedia.org/w/api.php?"
cp = "assets/photo/credits.json"
cred = json.load(open(cp, encoding="utf-8")) if os.path.exists(cp) else {}
def get(u):
    for i in range(5):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=120).read()
        except Exception as e: print("  retry", getattr(e, "code", e)); time.sleep(15 * (i + 1))
for name, ref in PICK.items():
    if any(f.startswith(name + ".") for f in os.listdir("assets/photo")): continue
    k, n = ref.rsplit("_", 1); c = cand[k][int(n)]
    url = c["url"].split("?")[0]
    std = [w for w in (1920, 1280, 960) if w <= c["w"]]
    if std:   # originals get rate-limited; standard-size renditions come from the cache
        q = urllib.parse.urlencode({"action": "query", "format": "json", "titles": c["title"], "prop": "imageinfo", "iiprop": "url", "iiurlwidth": std[0]})
        p = list(json.loads(get(API + q))["query"]["pages"].values())[0]
        url = p["imageinfo"][0]["thumburl"].split("?")[0]
    ext = os.path.splitext(url)[1].lower()
    d = get(url)
    if d: open(f"assets/photo/{name}{ext}", "wb").write(d)
    cred[name] = {"file": c["title"], "artist": c["artist"], "license": c["license"], "page": c["page"]}
    print(name, ext, len(d) if d else "FAIL", flush=True)
    json.dump(cred, open(cp, "w", encoding="utf-8"), indent=1)
    time.sleep(6)
