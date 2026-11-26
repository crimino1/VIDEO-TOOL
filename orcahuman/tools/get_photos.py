"""Download the chosen Commons photos (standard sizes, slow and polite, ipv4) and record credits."""
import json, os, socket, urllib.request, urllib.parse, time
_g = socket.getaddrinfo; socket.getaddrinfo = lambda *a, **k: [r for r in _g(*a, **k) if r[0] == socket.AF_INET]
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
cand = json.load(open("assets/photo/cand/cand.json", encoding="utf-8"))
PICK = {"c_salmon": "p_salmon_2", "c_seal": "p_sealion_0", "c_sealion": "p_sealion_5", "c_penguin": "p_penguin_0", "c_seabird": "p_seabird_2", "c_squid": "p_squid_0",
        "c_dolphin": "p_dolphin_0", "c_porpoise": "p_porpoise_0", "c_turtle": "p_turtle_0", "c_otter": "p_otter_0", "c_deer": "p_deer_3", "c_wshark": "p_wshark_4",
        "c_white": "p_white_1", "c_graycalf": "p_graycalf_1", "c_humpcalf": "p_humpcalf_0", "c_minke": "p_minke_2", "c_sperm": "p_sperm_0", "c_blue": "p_blue_0",
        "c_surfer": "p_wetsuit_2", "c_kayak": "p_kayak_1", "c_rudder": "p_sailboat_6", "c_tank": "p_tank_0", "c_aleutian": "p_aleutian_0", "c_otters": "p_otter_3"}
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
