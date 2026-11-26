"""Fetch Commons images smaller than 1920 px through the thumbnail server (width-1), one gentle attempt each, and add them to credits-commons.json."""
import json, os, re, time, urllib.parse, urllib.request
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "assets", "img")
CRED = os.path.join(OUT, "credits-commons.json")
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
API = "https://commons.wikimedia.org/w/api.php?"
WANT = {
    "blackocc": ("Giuseppe ('Beppo') P.S. Occhialini (1907–1993) and Patrick M.S. Blackett (1897–1974)", 390),
    "nobel36": ("Nobel Laureates 1936.jpg", 1469),
    "einstein": ("Albert Einstein photo 1921.jpg", 599),
    "stonephoto": ("Dirac, Paul (1902-1984).jpg", 959),
    "weyl": ("Hermann Weyl ETH-Bib Portr 00890.jpg", 461),
}


def get(u):
    time.sleep(6)
    try:
        with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=90) as r:
            return r.read()
    except Exception as e:
        print("  failed", getattr(e, "code", type(e).__name__)); return None


clean = lambda s: re.sub(r"<[^>]+>", "", s or "").strip()[:120]
cred = json.load(open(CRED, encoding="utf-8")) if os.path.exists(CRED) else {}
for name, (title, w) in WANT.items():
    if name in cred:
        continue
    if not title.lower().endswith((".jpg", ".png", ".jpeg")):   # prefix: find the exact title
        r = get(API + urllib.parse.urlencode({"action": "query", "format": "json", "list": "search", "srsearch": title, "srnamespace": 6, "srlimit": 3}))
        hits = [x["title"][5:] for x in json.loads(r)["query"]["search"]] if r else []
        title = next((h for h in hits if h.startswith(title[:40])), None)
        if not title:
            print("MISSING", name); continue
    r = get(API + urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": w, "titles": "File:" + title}))
    if not r:
        continue
    ii = list(json.loads(r)["query"]["pages"].values())[0]["imageinfo"][0]
    data = get(ii["thumburl"])
    if not data:
        continue
    open(os.path.join(OUT, name + ".jpg"), "wb").write(data)
    m = ii.get("extmetadata", {})
    cred[name] = {"file": "File:" + title, "artist": clean(m.get("Artist", {}).get("value")), "license": clean(m.get("LicenseShortName", {}).get("value")), "size": f"{ii['width']}x{ii['height']}",
                  "page": ii.get("descriptionurl", "")}
    print("ok", name, cred[name]["license"])
json.dump(cred, open(CRED, "w", encoding="utf-8"), ensure_ascii=False, indent=1)
