"""Fetch stills into assets/img/<name>.jpg + credits.json ({name: {title, license, artist, page, size}}).
Sources: "nasa:<id>" (images-api.nasa.gov), "eso:/hubble:/webb:/noirlab:<id>" (djangoplicity archives, CC BY 4.0),
"url:<direct url>|<title>|<license>|<artist>|<page>", or a Commons file title (ONE try only: this IP gets 429s).
  fetch_img.py [names...]   download WANT entries not yet in credits.json (or only the named ones, re-fetching them)"""
import html, io, json, os, re, sys, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from net import get
from PIL import Image
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
Image.MAX_IMAGE_PIXELS = None
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "img"))
CRED = os.path.join(OUT, "credits.json")
MAXPX = 4000
FULL = {"hudf"}  # keep native resolution (deep zoom)

WANT = {
    "voyager_photo": "nasa:PIA17049",
    "voyager_photo_b": "nasa:PIA21839",
    "voyager_real": "nasa:PIA21733",
    "voyager_photo_c": "nasa:PIA26353",
    "voyager_photo_d": "nasa:PIA04495",
    "voyager_launch": "nasa:PIA21747",
    "voyager_launch_b": "nasa:PIA21746",
    "golden_record": "The Sounds of Earth - GPN-2000-001976.jpg",
    "golden_record_b": "The Sounds of Earth Record Cover - GPN-2000-001978.jpg",
    "dsn_dish": "nasa:PIA26716",
    "dsn_dish_b": "nasa:PIA26150",
    "earth_blue_marble": "nasa:as17-148-22727",
    "earth_moon": "nasa:GSFC_20171208_Archive_e000670",
    "sun_sdo": "url:https://sdo.gsfc.nasa.gov/assets/img/latest/latest_4096_0171.jpg|SDO AIA 171 full disk (latest, 2026-11)|Public domain (NASA)|NASA/SDO and the AIA science team|https://sdo.gsfc.nasa.gov/data/",
    "betelgeuse": "eso:potw1726a",
    "betelgeuse_b": "eso:eso2003a",
    "orion": "eso:paranal_orion_cc_8bit",
    "orion_b": "eso:potw1922a",
    "proxima": "hubble:potw1343a",
    "alpha_cen": "eso:eso1241e",
    "milkyway_art": "nasa:PIA10748",
    "milkyway_sky": "eso:potw1222a",
    "milkyway_sky_b": "eso:eso0932a",
    "andromeda": "noirlab:noao-m31fsqblock",
    "andromeda_b": "Andromeda galaxy 2023.jpg",
    "hudf": "hubble:heic0406a",
    "hudf_xdf": "hubble:heic1214a",
    "cmb_planck": "nasa:PIA16873",
    "pale_blue_dot": "nasa:PIA23645",
    "edwin_hubble": "Studio portrait photograph of Edwin Powell Hubble.JPG",
    "hubble_telescope": "nasa:S109E5707",
    "hubble_telescope_b": "nasa:s125e011780",
    "lascaux": "Lascaux, horse.JPG",
    "lascaux_b": "Lascaux 026.jpg",
    "jwst_deep": "webb:weic2209a",
}
SITE = {"eso": ("https://www.eso.org/public/images/", "https://cdn.eso.org/images/"),
        "hubble": ("https://esahubble.org/images/", "https://cdn.esahubble.org/archives/images/"),
        "webb": ("https://esawebb.org/images/", "https://cdn.esawebb.org/archives/images/"),
        "noirlab": ("https://noirlab.edu/public/images/", "https://noirlab.edu/public/media/archives/images/")}


def clean(s):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", s or ""))).strip()[:200]


def nasa(nid):
    d = json.loads(get("https://images-api.nasa.gov/search?nasa_id=" + nid))["collection"]["items"][0]["data"][0]
    files = [i["href"] for i in json.loads(get(f"https://images-api.nasa.gov/asset/{urllib.parse.quote(nid)}"))["collection"]["items"]]
    pick = [f for f in files if re.search(r"~orig\.(jpg|png)$", f)] or [f for f in files if re.search(r"~large\.jpg$", f)] or [f for f in files if f.endswith(".jpg")]
    return pick[0].replace(" ", "%20"), {"title": d.get("title"), "license": "Public domain (NASA)",
                                         "artist": d.get("photographer") or d.get("secondary_creator") or "NASA/" + d.get("center", ""),
                                         "page": f"https://images.nasa.gov/details/{nid}"}


def agency(site, iid):
    page, cdn = SITE[site][0] + iid + "/", SITE[site][1]
    h = (get(page, tries=2) or b"").decode("utf-8", "replace")
    title = clean((re.search(r"<h1[^>]*>(.*?)</h1>", h, re.S) or [None, iid])[1])
    credit = clean((re.search(r'class="credit"[^>]*>(.*?)</div>', h, re.S) or [None, site.upper()])[1])
    w = int((re.search(r"Size:</td>\s*<td>\s*([\d,]+) x", h) or [0, "0"])[1].replace(",", "") or 0)
    links = {m[1]: m[0] for m in re.finditer(r"(https://[^\"' ]+/(publicationjpg|large)/" + re.escape(iid) + r"\.jpg)", h)}
    url = (links.get("publicationjpg") if 0 < w <= 7000 else None) or links.get("large") or cdn + "large/" + iid + ".jpg"
    return url, {"title": title, "license": "CC BY 4.0", "artist": credit, "page": page}


def commons_ii(title, width=None):
    q = {"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|size|extmetadata", "titles": "File:" + title}
    if width:
        q["iiurlwidth"] = width
    p = next(iter(json.loads(get("https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode(q), tries=1))["query"]["pages"].values()))
    return p, p["imageinfo"][0]


def commons(title):
    # originals on upload.wikimedia.org get 429 here; standard thumb buckets are served
    p, ii = commons_ii(title)
    bucket = next((b for b in (3840, 1920, 1280) if b < ii["width"]), None)
    if bucket:
        p, ii = commons_ii(title, bucket)
    m = ii.get("extmetadata", {})
    url = ii["thumburl"] if ii.get("thumburl") and ii["thumbwidth"] < ii["width"] else ii["url"]
    return url, {"title": p["title"], "license": clean(m.get("LicenseShortName", {}).get("value")),
                 "artist": clean(m.get("Artist", {}).get("value")), "page": ii["descriptionurl"]}


def resolve(src):
    kind, _, rest = src.partition(":")
    if kind == "nasa":
        return nasa(rest)
    if kind in SITE:
        return agency(kind, rest)
    if kind == "url":
        u, t, l, a, p = rest.split("|")
        return u, {"title": t, "license": l, "artist": a, "page": p}
    return commons(src)


credits = json.load(open(CRED, encoding="utf-8")) if os.path.exists(CRED) else {}
names = sys.argv[1:] or [n for n in WANT if n not in credits]
for name in names:
    src = WANT[name]
    try:
        url, meta = resolve(src)
        data = get(url, tries=1 if ":" not in src[:8] else 3)
        im = Image.open(io.BytesIO(data)).convert("RGB")
    except Exception as e:
        print("FAIL", name, type(e).__name__, e, flush=True)
        continue
    if name not in FULL and max(im.size) > MAXPX:
        im.thumbnail((MAXPX, MAXPX), Image.LANCZOS)
    im.save(os.path.join(OUT, name + ".jpg"), quality=92)
    credits[name] = {**meta, "size": f"{im.width}x{im.height}", "source_url": url}
    print(f"{name:20s} {credits[name]['size']:>10s} {meta['license'][:22]:22s} {meta['title'][:50]}", flush=True)
    json.dump(credits, open(CRED, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
