"""Download historical images from Wikimedia Commons and record license and author.
Writes assets/img/<name>.jpg plus assets/img/credits-commons.json. Skips names already downloaded."""
import json, os, re, time, urllib.parse, urllib.request

ROOT = os.path.join(os.path.dirname(__file__), "..")
OUT = os.path.join(ROOT, "assets", "img")
os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
API = "https://commons.wikimedia.org/w/api.php?"
CRED = os.path.join(OUT, "credits-commons.json")

# name -> exact Commons file title, or "?search words" to take the largest result
WANT = {
    "newton": "Portrait of Sir Isaac Newton, 1689.jpg",
    "maxwell": "James Clerk Maxwell gravure.jpg",
    "einstein": "Albert Einstein Head.jpg",
    "oersted": "Ørsted, Hans Christian (av Christian Albrecht Jensen 1842).jpg",
    "faraday": "Michael Faraday sitting crop.jpg",
    "hertz": "HEINRICH HERTZ.JPG",
}


def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return r.read()
        except Exception as e:
            print("  retry", type(e).__name__, getattr(e, "code", ""))
            time.sleep(12 * (i + 1))
    raise SystemExit("gave up: " + url[:90])


def info(titles):
    q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|size|extmetadata|mime", "iiurlwidth": 2600,
                                "titles": "|".join(t if t.startswith("File:") else "File:" + t for t in titles)})
    return json.loads(get(API + q)).get("query", {}).get("pages", {})


def search(words):
    q = urllib.parse.urlencode({"action": "query", "format": "json", "list": "search", "srsearch": words, "srnamespace": 6, "srlimit": 10})
    return [x["title"] for x in json.loads(get(API + q)).get("query", {}).get("search", [])]


def clean(s):
    return re.sub(r"<[^>]+>", "", s or "").strip()[:120]


credits = json.load(open(CRED, encoding="utf-8")) if os.path.exists(CRED) else {}
for name, want in WANT.items():
    if name in credits:
        continue
    titles = search(want[1:]) if want.startswith("?") else [want]
    time.sleep(1)
    pages = list(info(titles).values()) if titles else []
    cands = []
    for p in pages:
        ii = (p.get("imageinfo") or [None])[0]
        if ii and ii["mime"].startswith("image/") and "svg" not in ii["mime"]:
            cands.append((ii["width"] * ii["height"], p["title"], ii))
    if not cands:
        print("MISSING", name, want)
        continue
    cands.sort(key=lambda c: -c[0])
    for c in cands[:4]:
        print(f"   option {name}: {c[2]['width']}x{c[2]['height']} {c[1][:80]}")
    _, title, ii = cands[0]
    m = ii.get("extmetadata", {})
    url = ii.get("thumburl") or ii["url"]
    dest = os.path.join(OUT, name + os.path.splitext(url.split("?")[0])[1].lower())
    open(dest, "wb").write(get(url))
    credits[name] = {"file": title, "license": clean(m.get("LicenseShortName", {}).get("value")), "artist": clean(m.get("Artist", {}).get("value")),
                     "page": ii.get("descriptionurl"), "size": f"{ii['width']}x{ii['height']}"}
    print(f"{name:12s} {credits[name]['size']:>11s}  {credits[name]['license']:18s} {title[:70]}", flush=True)
    json.dump(credits, open(CRED, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    time.sleep(2)
