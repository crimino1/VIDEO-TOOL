"""Download the chosen Commons photos (standard sizes, slow and polite, ipv4) and record credits."""
import json, os, socket, urllib.request, urllib.parse, time
_g = socket.getaddrinfo; socket.getaddrinfo = lambda *a, **k: [r for r in _g(*a, **k) if r[0] == socket.AF_INET]
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
cand = json.load(open("assets/photo/cand/cand.json", encoding="utf-8"))
PICK = {"farallon_1": "p_farallon_1", "farallon_2": "p_farallon_2", "farallon_0": "p_farallon_0", "farallon_6": "p_farallon_6", "white_0": "p_white_0", "white_1": "p_white_1", "white_6": "p_white_6", "white_7": "p_white_7", "whiteu_0": "p_whiteu_0", "whiteu_1": "p_whiteu_1", "white_3": "p_white_3", "orca_0": "p_orca_0", "orca_1": "p_orca_1", "orca_5": "p_orca_5", "orcapod_0": "p_orcapod_0", "sevengill_0": "p_sevengill_0", "sevengill_7": "p_sevengill_7", "sealisland_4": "p_sealisland_4", "sealisland_5": "p_sealisland_5", "sealisland_7": "p_sealisland_7", "sealisland_0": "p_sealisland_0", "gansbaai_3": "p_gansbaai_3", "gansbaai_5": "p_gansbaai_5", "gansbaai_6": "p_gansbaai_6", "gansbaai_7": "p_gansbaai_7", "mossel_0": "p_mossel_0", "mossel_2": "p_mossel_2", "furseal_0": "p_furseal_0", "furseal_3": "p_furseal_3", "furseal_5": "p_furseal_5", "elephantseal_2": "p_elephantseal_2", "elephantseal_5": "p_elephantseal_5", "falsebay_6": "p_falsebay_6", "falsebay_7": "p_falsebay_7", "cagedive_0": "p_cagedive_0", "cagedive_1": "p_cagedive_1", "cagedive_4": "p_cagedive_4", "cagedive_7": "p_cagedive_7", "satellite_0": "p_satellite_0", "bronze_6": "p_bronze_6", "bronze_7": "p_bronze_7", "bronze_0": "p_bronze_0", "seals_5": "p_seals_5", "seals_3": "p_seals_3", "dead_6": "p_dead_6", "monterey_3": "p_monterey_3"}
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
