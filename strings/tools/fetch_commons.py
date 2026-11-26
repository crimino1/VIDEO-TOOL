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
    "veneziano": "GabrieleVeneziano.jpg",
    "euler": "Leonhard Euler - Jakob Emanuel Handmann (Kunstmuseum Basel).jpg",
    "einstein1915": "Einstein 1921 by F Schmutzer - restoration.jpg",
    "einstein_old": "Albert Einstein Head.jpg",
    "nambu": "YoichiroNambu (cropped).jpg",
    "nielsen": "Holger bech.jpg",
    "susskind": "LeonardSusskindStanfordNov2013.jpg",
    "kaluza": "Theodor Franz Eduard Kaluza.jpg",
    "witten": "Edward Witten.jpg",
    "bekenstein": "Bekenstein100 (cropped).JPG",
    "hawking": "Stephen hawking 2008 nasa cropped.jpg",
    "strominger": "Andrew Strominger at Harvard.jpg",
    "vafa": "Cumrun Vafa, Harvard.jpg",
    "maldacena": "Charla del fisico teorico Juan Martin Maldacena.jpg",
    "princeton": "Fuld Hall, Institute for Advanced Study, Princeton, NJ.jpg",
    "usc": "University of Southern California 1 2019-05-05.jpg",
    "lhc": "Views of the LHC tunnel sector 3-4, tirage 2.jpg",
    "lhc_tunnel": "Worker walking in a new HL-LHC tunnel at CERN.jpg",
    "lhc2": "CERN Large Hadron Collider.jpg",
    "heavyion": "CERN LHC ATLAS Detector.jpg",
}


def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return r.read()
        except Exception as e:
            print("  retry", type(e).__name__, getattr(e, "code", ""))
            time.sleep(30 * (i + 1))
    print("gave up: " + url[:90]); return None


def info(titles):
    q = urllib.parse.urlencode({"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|size|extmetadata|mime", "iiurlwidth": 1920,
                                "titles": "|".join(t if t.startswith("File:") else "File:" + t for t in titles)})
    r = get(API + q)
    return json.loads(r).get("query", {}).get("pages", {}) if r else {}


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
    data = get(url)
    if not data:
        continue
    open(dest, "wb").write(data)
    credits[name] = {"file": title, "license": clean(m.get("LicenseShortName", {}).get("value")), "artist": clean(m.get("Artist", {}).get("value")),
                     "page": ii.get("descriptionurl"), "size": f"{ii['width']}x{ii['height']}"}
    print(f"{name:12s} {credits[name]['size']:>11s}  {credits[name]['license']:18s} {title[:70]}", flush=True)
    json.dump(credits, open(CRED, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    time.sleep(6)
