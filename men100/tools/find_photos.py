"""Find candidate animal photos on Wikimedia Commons: top results per query, thumbnails + a numbered contact sheet to choose from.
Usage: python tools/find_photos.py  -> assets/photo/cand/<key>_<n>.jpg, cand.json (title, size, license, artist, url)"""
import json, os, sys, time, urllib.parse, urllib.request, socket
_gai = socket.getaddrinfo
socket.getaddrinfo = lambda *a, **k: [r for r in _gai(*a, **k) if r[0] == socket.AF_INET]   # ipv4 only: ipv6 here stalls ~20 s per request
from PIL import Image, ImageDraw
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
OUT = os.path.join(ROOT, "assets", "photo", "cand"); os.makedirs(OUT, exist_ok=True)
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
API = "https://commons.wikimedia.org/w/api.php?"
Q = {
 "vraptor": "Velociraptor mongoliensis feathered restoration", "vraptor2": "Velociraptor life restoration", "vskel": "Velociraptor skeleton museum",
 "direwolf": "Aenocyon dirus restoration", "direwolf2": "dire wolf skeleton", "labrea": "La Brea Tar Pits", "dwskulls": "dire wolf skulls Page Museum",
 "kelenken": "Kelenken guillermoi", "terrorbird": "Phorusrhacidae restoration", "smilodon": "Smilodon populator restoration", "smskull": "Smilodon skull",
 "piano": "grand piano", "utah": "Utahraptor ostrommaysi", "grizzly": "grizzly bear standing", "arctodus": "Arctodus simus",
 "titanoboa": "Titanoboa", "cerrejon": "Cerrejon coal mine", "trex": "Tyrannosaurus rex restoration", "trexskel": "Tyrannosaurus skeleton museum",
 "saltie": "saltwater crocodile Crocodylus porosus", "coprolite": "Tyrannosaurus coprolite", "giga": "Giganotosaurus carolinii", "spino": "Spinosaurus aegyptiacus restoration",
 "deino": "Deinosuchus", "mosa": "Mosasaurus hoffmannii restoration", "meg": "Otodus megalodon restoration", "megtooth": "megalodon tooth",
 "cavelion": "Panthera spelaea restoration", "siegsdorf": "Siegsdorf Höhlenlöwe", "neander": "Neanderthal reconstruction museum", "schoningen": "Schöningen spears",
 "maasai": "Maasai warriors spears", "mammoth": "Mammuthus columbi", "clovis": "Clovis point", "gorilla": "silverback gorilla", "patagonia": "Patagonia steppe",
 "mongolia": "Gobi desert Flaming Cliffs", "savanna": "savanna tall grass", "crowd": "crowd of men field",
}
N = 6


def get(url):
    for i in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=90) as r:
                return r.read()
        except Exception as e:
            print("  retry", type(e).__name__, getattr(e, "code", ""), flush=True); time.sleep(10 * (i + 1))
    return None


found = {}
JOBS = []
for key, q in Q.items():
    qs = urllib.parse.urlencode({"action": "query", "format": "json", "generator": "search", "gsrsearch": f"filetype:bitmap {q}", "gsrnamespace": 6,
                                 "gsrlimit": N, "prop": "imageinfo", "iiprop": "url|size|extmetadata", "iiurlwidth": 330})
    raw = get(API + qs)
    pages = sorted(json.loads(raw).get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99)) if raw else []
    found[key] = []
    for n, p in enumerate(pages):
        ii = p["imageinfo"][0]; m = ii.get("extmetadata", {})
        JOBS.append((ii["thumburl"], os.path.join(OUT, f"{key}_{n}.jpg")))
        found[key].append({"n": n, "title": p["title"], "w": ii["width"], "h": ii["height"], "url": ii["url"], "page": ii["descriptionurl"],
                           "license": m.get("LicenseShortName", {}).get("value"), "artist": m.get("Artist", {}).get("value", "")[:200]})
    print(key, len(found[key]), flush=True)
from concurrent.futures import ThreadPoolExecutor
def fetch(j):
    if os.path.exists(j[1]): return
    th = get(j[0])
    if th: open(j[1], "wb").write(th)
with ThreadPoolExecutor(8) as ex: list(ex.map(fetch, JOBS))
print("thumbs", len(JOBS), flush=True)
json.dump(found, open(os.path.join(OUT, "cand.json"), "w", encoding="utf-8"), indent=1)

# one contact sheet per 7 keys: rows = keys, columns = candidates, label with key_n and pixel size
keys = list(found)
for s in range(0, len(keys), 7):
    sheet = Image.new("RGB", (N * 240, 7 * 170), "black"); d = ImageDraw.Draw(sheet)
    for r, key in enumerate(keys[s:s + 7]):
        for c in found[key]:
            fn = os.path.join(OUT, f"{key}_{c['n']}.jpg")
            try: im = Image.open(fn).convert("RGB"); im.thumbnail((236, 140))
            except Exception: continue
            sheet.paste(im, (c["n"] * 240 + 2, r * 170 + 2))
            d.rectangle([c["n"] * 240, r * 170 + 144, c["n"] * 240 + 239, r * 170 + 168], fill="black")
            d.text((c["n"] * 240 + 4, r * 170 + 148), f"{key}_{c['n']} {c['w']}x{c['h']}", fill="yellow")
    sheet.save(os.path.join(OUT, f"sheet_{s // 7}.jpg"), quality=88)
print("sheets done")
