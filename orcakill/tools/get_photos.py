"""Download the chosen Commons photos (standard sizes, slow and polite, ipv4) and record credits."""
import json, os, socket, urllib.request, urllib.parse, time
_g = socket.getaddrinfo; socket.getaddrinfo = lambda *a, **k: [r for r in _g(*a, **k) if r[0] == socket.AF_INET]
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
cand = json.load(open("assets/photo/cand/cand.json", encoding="utf-8"))
PICK = {"srkw_0": "p_srkw_0", "srkw_1": "p_srkw_1", "srkw_3": "p_srkw_3", "srkw_5": "p_srkw_5", "srkw_6": "p_srkw_6", "srkw_7": "p_srkw_7", "hporp_0": "p_hporp_0", "hporp_1": "p_hporp_1", "hporp_3": "p_hporp_3", "hporp_5": "p_hporp_5", "dall_0": "p_dall_0", "dall_6": "p_dall_6", "dall_4": "p_dall_4", "chinook_4": "p_chinook_4", "chinook_7": "p_chinook_7", "chinook_5": "p_chinook_5", "salish_2": "p_salish_2", "salish_4": "p_salish_4", "sanjuan_1": "p_sanjuan_1", "sanjuan_3": "p_sanjuan_3", "sanjuan_7": "p_sanjuan_7", "transient_2": "p_transient_2", "transient_3": "p_transient_3", "dam_2": "p_dam_2", "dam_3": "p_dam_3", "seine_6": "p_seine_6", "seine_4": "p_seine_4", "bottlenose_1": "p_bottlenose_1", "bottlenose_3": "p_bottlenose_3", "lion_1": "p_lion_1", "lion_2": "p_lion_2", "cheetah_0": "p_cheetah_0", "cheetah_1": "p_cheetah_1", "whalewatch_3": "p_whalewatch_3", "whalewatch_7": "p_whalewatch_7", "punta_0": "p_punta_0", "spawn_1": "p_spawn_1", "spawn_3": "p_spawn_3"}
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
