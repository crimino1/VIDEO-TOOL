"""Download the chosen Commons photos (standard sizes, slow and polite, ipv4) and record credits."""
import json, os, socket, urllib.request, urllib.parse, time
_g = socket.getaddrinfo; socket.getaddrinfo = lambda *a, **k: [r for r in _g(*a, **k) if r[0] == socket.AF_INET]
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
cand = json.load(open("assets/photo/cand/cand.json", encoding="utf-8"))
PICK = {"levick_0": "p_levick_0", "levick_1": "p_levick_1", "levick_2": "p_levick_2", "levick_4": "p_levick_4", "levick_5": "p_levick_5", "adare_0": "p_adare_0", "adare_1": "p_adare_1", "adare_5": "p_adare_5", "terranova_2": "p_terranova_2", "terranova_6": "p_terranova_6", "scott_2": "p_scott_2", "scott_6": "p_scott_6", "scott_0": "p_scott_0", "cpz_0": "p_cpz_0", "cpz_5": "p_cpz_5", "cpz_7": "p_cpz_7", "chinstrap_0": "p_chinstrap_0", "humboldt_0": "p_humboldt_0", "humboldt_1": "p_humboldt_1", "humboldt_2": "p_humboldt_2", "kerguelen_0": "p_kerguelen_0", "nhm_2": "p_nhm_2", "nhm_3": "p_nhm_3", "nhm_5": "p_nhm_5", "albatross_2": "p_albatross_2", "albatross_4": "p_albatross_4", "albatross_5": "p_albatross_5", "albatross_6": "p_albatross_6", "albatross_7": "p_albatross_7", "kaena_4": "p_kaena_4", "gentoo_0": "p_gentoo_0", "bremer_4": "p_bremer_4", "bremer_6": "p_bremer_6", "emperorchick_1": "p_emperorchick_1", "emperorchick_2": "p_emperorchick_2", "kingchick_0": "p_kingchick_0"}
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
