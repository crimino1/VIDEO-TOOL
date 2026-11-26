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
FULL = set()  # keep native resolution (deep zoom)

WANT = {
    "gaia_spacecraft": "eso:eso1908d",
    "gaia_bh1_art": "noirlab:noirlab2227a",
    "gaia_bh3_art": "eso:eso2408a",
    "microlens_hubble": "url:https://assets.science.nasa.gov/content/dam/science/missions/hubble/releases/2022/06/STScI-01FQHBG47R5CDE0ZZW1FBTGVAZ.tif/jcr:content/renditions/Clean.png|Microlensing Black Hole (OGLE-2011-BLG-0462 field, Hubble, clean version)|Public domain (NASA) / CC BY 4.0 (ESA)|NASA, ESA, Kailash Sahu (STScI); Image Processing: Joseph DePasquale (STScI)|https://science.nasa.gov/asset/hubble/microlensing-black-hole/",
    "rogue_bh_art": "hubble:heic2210a",
    "astronaut_eva": "nasa:s84-27017",
    "astronaut_eva_b": "nasa:S84-27018",
    "tde_art": "nasa:PIA22355",
    "tde_art_b": "hubble:heic1622a",
    "crab_nebula": "hubble:heic0515a",
    "hawking_c": "nasa:200804210001HQ",
    "blazar_art": "url:https://svs.gsfc.nasa.gov/vis/a010000/a012900/a012994/Blazar.00590.jpg|Blazar jet illustration (NASA's Fermi Links Cosmic Neutrino to Monster Black Hole, SVS 12994) - artist's concept|Public domain (NASA)|NASA Goddard Space Flight Center Conceptual Image Lab|https://svs.gsfc.nasa.gov/12994/",
    "icecube_event": "url:https://svs.gsfc.nasa.gov/vis/a010000/a012900/a012994/FermiIceCube_AS.jpg|Fermi and IceCube illustration (SVS 12994) - artist's concept|Public domain (NASA)|NASA/Fermi and Aurore Simonnet, Sonoma State University|https://svs.gsfc.nasa.gov/12994/",
    "icecube_lab": "The ICL at Night.jpg",
    "runaway_streak": "url:https://assets.science.nasa.gov/content/dam/science/missions/hubble/releases/2023/04/STScI-01GWQ2HPVTHQM7T6PT2RHWCCSS.tif/jcr:content/renditions/Unannotated%20Full%20Res%20(For%20Display).png|Runaway Black Hole near RCP28 (Hubble, unannotated)|Public domain (NASA) / CC BY 4.0 (ESA)|NASA, ESA, Pieter van Dokkum (Yale); Image Processing: Joseph DePasquale (STScI)|https://science.nasa.gov/asset/hubble/runaway-black-hole-near-rcp28",
    "runaway_streak_b": "hubble:opo23010a",
    "runaway_art": "url:https://assets.science.nasa.gov/content/dam/science/missions/hubble/releases/2023/04/STScI-01GX6584JDCNAKDR7HSST2F5XX.tif/jcr:content/renditions/Full%20Res%20(For%20Display).png|Runaway Supermassive Black Hole Illustration - artist's concept|Public domain (NASA) / CC BY 4.0 (ESA)|NASA, ESA, Leah Hustak (STScI)|https://science.nasa.gov/asset/hubble/runaway-supermassive-black-hole-illustration/",
    "quasar_j0529_art": "eso:eso2402a",
    "quasar_art_b": "eso:eso1122a",
    "jades_field": "webb:JADES2",
    "milkyway_center": "nasa:PIA12348",
    "milkyway_center_b": "eso:lv_Brunier_hb-1",
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
