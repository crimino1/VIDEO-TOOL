"""Download the chosen Commons photos (standard sizes, slow and polite, ipv4) and record credits."""
import json, os, socket, urllib.request, urllib.parse, time
_g = socket.getaddrinfo; socket.getaddrinfo = lambda *a, **k: [r for r in _g(*a, **k) if r[0] == socket.AF_INET]
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
cand = json.load(open("assets/photo/cand/cand.json", encoding="utf-8"))
PICK = {"vraptor2_1": "vraptor2_1", "vraptor_0": "vraptor_0", "vraptor2_2": "vraptor2_2", "vskel_1": "vskel_1", "direwolf_3": "direwolf_3", "direwolf_1": "direwolf_1", "direwolf_2": "direwolf_2", "direwolf2_4": "direwolf2_4", "labrea_4": "labrea_4", "dwskulls_0": "dwskulls_0", "kelenken_1": "kelenken_1", "kelenken_4": "kelenken_4", "kelenken_0": "kelenken_0", "terrorbird_2": "terrorbird_2", "smilodon_0": "smilodon_0", "smilodon_2": "smilodon_2", "smskull_5": "smskull_5", "piano_0": "piano_0", "utah_3": "utah_3", "utah_5": "utah_5", "utah_0": "utah_0", "grizzly_1": "grizzly_1", "arctodus_5": "arctodus_5", "arctodus_4": "arctodus_4", "arctodus_0": "arctodus_0", "titanoboa_0": "titanoboa_0", "titanoboa_2": "titanoboa_2", "cerrejon_1": "cerrejon_1", "trex_1": "trex_1", "trex_4": "trex_4", "trexskel_4": "trexskel_4", "saltie_2": "saltie_2", "saltie_0": "saltie_0", "coprolite_1": "coprolite_1", "giga_0": "giga_0", "giga_3": "giga_3", "spino_5": "spino_5", "spino_0": "spino_0", "deino_1": "deino_1", "deino_3": "deino_3", "mosa_3": "mosa_3", "mosa_1": "mosa_1", "meg_1": "meg_1", "meg_0": "meg_0", "meg_5": "meg_5", "cavelion_3": "cavelion_3", "cavelion_5": "cavelion_5", "cavelion_1": "cavelion_1", "neander_1": "neander_1", "neander_4": "neander_4", "schoningen_2": "schoningen_2", "maasai_1": "maasai_1", "mammoth_0": "mammoth_0", "mammoth_1": "mammoth_1", "clovis_1": "clovis_1", "clovis_5": "clovis_5", "gorilla_0": "gorilla_0", "gorilla_5": "gorilla_5", "mongolia_0": "mongolia_0", "patagonia_3": "patagonia_3", "patagonia_2": "patagonia_2", "savanna_3": "savanna_3"}
API = "https://commons.wikimedia.org/w/api.php?"
cp = "assets/photo/credits.json"
cred = json.load(open(cp, encoding="utf-8")) if os.path.exists(cp) else {}
def get(u):
    for i in range(5):
        try: return urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=120).read()
        except Exception as e: print("  retry", getattr(e, "code", e)); time.sleep(15 * (i + 1))
for name, ref in PICK.items():
    if any(f.startswith(name + ".") for f in os.listdir("assets/photo")): continue
    k, n = ref.rsplit("_", 1); c = cand["p_"+k if "p_"+k in cand else k][int(n)]
    url = c["url"].split("?")[0]
    std = [w for w in (1280, 960) if w <= c["w"]]
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
    time.sleep(4)
