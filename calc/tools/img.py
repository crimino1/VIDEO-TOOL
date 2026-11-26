"""Image search + fetch, safe to run from several sessions at once (no shared state files).
  python -I tools/img.py search pexels "mountain peak" [more queries...]   -> numbered list + work/sheets/<query>.jpg contact sheet
  python -I tools/img.py search commons "Hipparchus" ...
  python -I tools/img.py get <name> pexels:<photo id>
  python -I tools/img.py get <name> commons:"File title.jpg"
  python -I tools/img.py get <name> url:<direct image url> "<credit text>"
Writes assets/img/<name>.jpg (longest side <= 1920) and assets/img/credits/<name>.json."""
import io, json, re, sys, urllib.parse
from pathlib import Path
import requests
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
KEYS = [k.strip() for line in (ROOT.parent / ".env").read_text().splitlines() if line.startswith("PEXELS_API_KEYS=") for k in line.split("=", 1)[1].split(",") if k.strip()]
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal education video editing)"}
OUT = ROOT / "assets" / "img"
CRED = OUT / "credits"
SHEETS = ROOT / "work" / "sheets"
for d in (CRED, SHEETS):
    d.mkdir(parents=True, exist_ok=True)
sys.stdout.reconfigure(encoding="utf-8", errors="replace")


def pexels(q, n=12):
    r = requests.get("https://api.pexels.com/v1/search", headers={"Authorization": KEYS[hash(q) % len(KEYS)], **UA}, params={"query": q, "per_page": n, "orientation": "landscape"}, timeout=30).json()
    return [dict(id=f"pexels:{p['id']}", thumb=p["src"]["medium"], info=f"{p['width']}x{p['height']} {p['alt'][:60]}") for p in r.get("photos", [])]


def commons(q, n=14):
    u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "format": "json", "generator": "search", "gsrsearch": q, "gsrnamespace": 6, "gsrlimit": n,
                                                                            "prop": "imageinfo", "iiprop": "size|extmetadata|mime|url", "iiurlwidth": 300})
    d = requests.get(u, headers=UA, timeout=30).json().get("query", {}).get("pages", {})
    out = []
    for p in sorted(d.values(), key=lambda p: p.get("index", 0)):
        ii = p["imageinfo"][0]
        if not ii["mime"].startswith("image/") or "svg" in ii["mime"] or "tif" in ii["mime"]:
            continue
        lic = re.sub("<[^>]+>", "", ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", ""))
        out.append(dict(id=f'commons:{p["title"][5:]}', thumb=ii.get("thumburl", ii["url"]), info=f"{ii['width']}x{ii['height']} {lic[:14]}"))
    return out


def sheet(q, items):
    tw, th, per = 300, 200, 6
    rows = (len(items) + per - 1) // per
    img = Image.new("RGB", (tw * per, th * max(rows, 1)), "black")
    d = ImageDraw.Draw(img)
    f = ImageFont.truetype("arial.ttf", 20)
    for i, it in enumerate(items):
        x, y = (i % per) * tw, (i // per) * th
        try:
            t = Image.open(io.BytesIO(requests.get(it["thumb"], headers=UA, timeout=30).content)).convert("RGB")
            t.thumbnail((tw - 4, th - 4))
            img.paste(t, (x, y))
        except Exception:
            pass
        d.rectangle([x, y, x + 40, y + 26], fill="black")
        d.text((x + 4, y + 2), str(i), fill="yellow", font=f)
    p = SHEETS / (re.sub(r"\W+", "_", q)[:50] + ".jpg")
    img.save(p, quality=80)
    return p


def get(name, ref, credit=None):
    if ref.startswith("pexels:"):
        pid = ref.split(":", 1)[1]
        p = requests.get(f"https://api.pexels.com/v1/photos/{pid}", headers={"Authorization": KEYS[0], **UA}, timeout=30).json()
        url = p["src"]["large2x"]
        cred = dict(source="Pexels", page=p["url"], author=p["photographer"], license="Pexels License")
    elif ref.startswith("commons:"):
        title = ref.split(":", 1)[1]
        u = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "format": "json", "titles": "File:" + title, "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": 1920})
        pg = list(requests.get(u, headers=UA, timeout=30).json()["query"]["pages"].values())[0]
        ii = pg["imageinfo"][0]
        url = ii.get("thumburl", ii["url"])
        md = ii.get("extmetadata", {})
        clean = lambda k: re.sub("<[^>]+>", "", md.get(k, {}).get("value", "")).strip()
        cred = dict(source="Wikimedia Commons", page=ii.get("descriptionurl"), author=clean("Artist")[:120], license=clean("LicenseShortName"))
    elif ref.startswith("url:"):
        url = ref[4:]
        cred = dict(source=url, credit=credit or "")
    else:
        sys.exit("ref must start with pexels:, commons: or url:")
    im = Image.open(io.BytesIO(requests.get(url, headers=UA, timeout=90).content))
    im = im.convert("RGB")
    im.thumbnail((1920, 1920))
    im.save(OUT / f"{name}.jpg", quality=92)
    (CRED / f"{name}.json").write_text(json.dumps(cred, indent=1), encoding="utf-8")
    print("ok", name, im.size, cred.get("license", ""))


if __name__ == "__main__":
    a = sys.argv[1:]
    if a[0] == "search":
        fn = pexels if a[1] == "pexels" else commons
        for q in a[2:]:
            items = fn(q)
            print("==", q, sheet(q, items))
            for i, it in enumerate(items):
                print(f"  {i:2d} {it['id'][:80]:80s} {it['info']}")
    elif a[0] == "get":
        get(a[1], a[2], a[3] if len(a) > 3 else None)
