"""Download the chosen Commons photos (standard sizes, slow and polite, ipv4) and record credits."""
import json, os, socket, urllib.request, urllib.parse, time
_g = socket.getaddrinfo; socket.getaddrinfo = lambda *a, **k: [r for r in _g(*a, **k) if r[0] == socket.AF_INET]
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
cand = json.load(open("assets/photo/cand/cand.json", encoding="utf-8"))
PICK = {"orca_a": "orca_under_6", "orca_b": "orca_under_7", "orca_c": "orca_under_2", "orca_d": "orca_under_5", "orca_breach": "orca_breach_0", "orca_double": "orca_breach_3",
        "orca_male": "orca_male_0", "orca_calf": "orca_calf_3", "seal_floe": "crabeater_1", "orcas_seals": "crabeater_0", "orcas_floe": "crabeater_2", "orca_spy": "crabeater_3",
        "salmon": "salmon_3", "herring": "herring_0", "gray_calf": "gray_4", "blue_air": "blue_6", "harbor_seal": "harbor_seal_3", "seal_head": "harbor_seal_0",
        "oldtom": "oldtom_0", "whaleboat": "whaleboat_2", "porpoise": "porpoise_5", "pack_ice": "antarctic_ice_0", "ice_bergs": "antarctic_ice_3", "salmon_school": "salmon_2", "salmon_ill": "salmon_4"}
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
