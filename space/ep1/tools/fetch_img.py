"""Fetch still images into assets/img/<name>.jpg with credits.json.
Sources: Commons file title, or "nasa:<nasa_id>" (images-api.nasa.gov, public domain).
  fetch_img.py            download every WANT entry not yet in credits.json
  fetch_img.py --preview  small thumbs of WANT + ALT into scratch dir for a quick look (arg 2 = dir)"""
import io, json, os, re, sys, time, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from net import get
from PIL import Image, ImageDraw
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
Image.MAX_IMAGE_PIXELS = None
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "img"))
CRED = os.path.join(OUT, "credits.json")
API = "https://commons.wikimedia.org/w/api.php?"

ALT_HUY = "Illustrations de Systema Saturnium, sive de causis mirandorum Saturni phaenomenon... - (Non identifié) ; Christian Huygens, aut. de texte - btv1b2600196j ({:02d} of 10).jpg"
WANT = {
    "hubble_rpx": "Edge-On View of Saturn's Rings (1996-16-415).jpg",
    "hubble_rpx2": "Edge-On View of Saturn's Rings (1996-16-415).jpg",
    "hubble_rpx3": "Saturn's rings edge-on (opo9531a).jpg",
    "saturn_thinring": "Quadruple Saturn Moon Transit Snapped By Hubble (2009-12-2508).jpg",
    "cassini_equinox": "Saturn during Equinox.jpg",
    "cassini_backlit": "Saturn eclipse.jpg",
    "rings_closeup": "Saturn Rings PIA06175.jpg",
    "rings_closeup_b": "nasa:PIA23171",
    "rings_closeup2": "PIA17212 - The Realm of Daphnis.jpg",
    "voyager_saturn": "Saturn - Nasa's Voyager 2 - 1981 (52474709150).png",
    "galileo_sketch": "Anillos de Satruno - Galileo Galilei.png",
    "galileo_portrait": "Justus Sustermans - Portrait of Galileo Galilei, 1636.jpg",
    "huygens_portrait": "Caspar Netscher - Christiaan Huygens, the astronomer, 1671.jpg",
    "huygens_systema": ALT_HUY.format(8),
    "huygens_systema_orbit": ALT_HUY.format(9),
    "saturn_devouring": "Rubens saturn.jpg",
    "keck_obs": "W M Keck Observatory (6V7A4853-CC).jpg",
    "ringrain_keck": "Saturn's Ring 'Rain'.jpeg",
    "cassini_launch": "Cassini-Huygens lifted of with a Titan 4(01)B from Launch Complex 40.jpg",
    "cassini_art": "nasa:PIA22766",
    "grand_finale_art": "nasa:PIA21439",
    "cassini_plunge_art": "Cassini's final plunge 7635 CGF STILL 00032.jpg",
    "enceladus": "Enceladusstripes cassini-edit2.jpg",
    "enceladus_plumes": "nasa:PIA07758",
    "enceladus_plumes_b": "nasa:PIA17144",
    "e_ring": "nasa:PIA08321",
    "titan": "nasa:PIA14602",
    "mimas": "nasa:PIA12570",
    "phobos": "nasa:PIA10368",
    "jupiter_rings": "Jupiter Showcases Auroras, Hazes (NIRCam Widefield View) (jupiter-auroras2).jpeg",
    "uranus_rings": "Zoomed-in image of Uranus (weic2310a).jpg",
    "neptune_rings": "Neptune Close Up (NIRCam).jpg",
    "dinosaur": "Herrerasaurus ischigualastensis Illustration.jpg",
    "earth_moon": "nasa:PIA00342",
    "enceladus_ocean_art": "nasa:PIA19656",
    "saturn_2025": "Decagon on Saturn’s south pole (colour image) (heic2612a).jpg",
}
CROP = {  # fractional (l, t, r, b) to drop burned-in captions/frames
    "hubble_rpx": (0.05, 0.015, 0.985, 0.395), "hubble_rpx2": (0.05, 0.42, 0.985, 0.80),
    "saturn_thinring": (0.035, 0.135, 0.965, 0.87), "saturn_2025": (0.006, 0.12, 0.49, 0.9),
}
ALT = {  # preview only, swap into WANT if better
    "a_rpx2": "Saturn's rings edge-on (opo9531a).jpg", "a_backlit2": "The Day the Earth Smiled - PIA17172.jpg",
    "a_rings_06175": "Saturn Rings PIA06175.jpg", "a_rings_12794": "nasa:PIA12794", "a_rings_08294": "nasa:PIA08294",
    "a_voy_cc": "Saturn - Nasa's Voyager 2 - 1981 (52474709150).png", "a_voy_7071": "ARC-1981-AC81-7071~orig.jpg",
    "a_gal_anillos": "Anillos de Satruno - Galileo Galilei.png", "a_huy_obs": "Drawings Saturn Huyguens.png",
    "a_huy_btv04": "Illustrations de Systema Saturnium, sive de causis mirandorum Saturni phaenomenon... - (Non identifié) ; Christian Huygens, aut. de texte - btv1b2600196j (04 of 10).jpg",
    "a_goya": "Francisco de Goya, Saturno devorando a su hijo (1819-1823).jpg", "a_keck_dawn": "W. M. Keck Observatory at dawn.jpg",
    "a_finale2": "nasa:PIA22767", "a_plunge2": "PIA21440 - Cassini versus Saturn (Illustration).jpg", "a_rain_art": "nasa:PIA16842",
    "a_enc2": "Enceladusstripes cassini-edit2.jpg", "a_plume2": "nasa:PIA06443", "a_titan2": "nasa:PIA06230",
    "a_coelo": "Coelophysis bauriNV.jpg", "a_sat25": "Saturn Hubble 2025-08-29.jpg", "a_mimasrings": "Mimas among rings.jpg",
    "a_daph_waves": "Daphnis makes waves - 4x vertical stretch.jpg", "a_launch_nasa": "nasa:KSC-97PC1539",
    "b_plume_07758": "nasa:PIA07758", "b_plume_21338": "nasa:PIA21338", "b_plume_17144": "nasa:PIA17144",
    "b_uranus_117": "Uranus (NIRCam Image) (2023-117-01GWQD6PSGTBK7VQBZST09YYKW).tiff", "b_uranus_wide": "Uranus widefield view (NIRCam) (weic2332b).jpg",
    "b_plateo": "Life restoration of Plateosaurus trossingensis.jpg", "b_herrera_ill": "Herrerasaurus ischigualastensis Illustration.jpg",
    **{f"b_huy_{i:02d}": f"Illustrations de Systema Saturnium, sive de causis mirandorum Saturni phaenomenon... - (Non identifié) ; Christian Huygens, aut. de texte - btv1b2600196j ({i:02d} of 10).jpg" for i in (1,2,3,5,6,7,8,9,10)},
}


def clean(s):
    return re.sub(r"\s+", " ", re.sub(r"<[^>]+>", "", s or "")).strip()[:160]


def commons_ii(title, width=None):
    q = {"action": "query", "format": "json", "prop": "imageinfo", "iiprop": "url|size|extmetadata", "titles": "File:" + title}
    if width:
        q["iiurlwidth"] = width
    p = next(iter(json.loads(get(API + urllib.parse.urlencode(q)))["query"]["pages"].values()))
    return p, p["imageinfo"][0]


def commons(title, width):
    # upload.wikimedia.org 429s original-file pulls; standard thumb buckets (w.wiki/GHai) are served fine
    p, ii = commons_ii(title)
    bucket = next((b for b in (width, 1920, 1280, 960, 500) if b < ii["width"]), None)
    if bucket:
        p, ii = commons_ii(title, bucket)
    m = ii.get("extmetadata", {})
    url = ii["thumburl"] if ii.get("thumburl") and ii["thumbwidth"] < ii["width"] else ii["url"]
    return url, {"file": p["title"], "license": clean(m.get("LicenseShortName", {}).get("value")), "artist": clean(m.get("Artist", {}).get("value")),
                 "page": ii["descriptionurl"], "credit_line": clean(m.get("Credit", {}).get("value"))}


def nasa(nid, small):
    d = json.loads(get("https://images-api.nasa.gov/search?nasa_id=" + nid))["collection"]["items"][0]["data"][0]
    files = [i["href"] for i in json.loads(get(f"https://images-api.nasa.gov/asset/{nid}"))["collection"]["items"]]
    pick = [f for f in files if (re.search(r"~(small|medium)\.jpg$", f) if small else re.search(r"~orig\.(jpg|png|tif)$", f))] or [f for f in files if f.endswith(".jpg")]
    return pick[0].replace(" ", "%20"), {"file": d.get("title"), "license": "Public domain (NASA)", "artist": d.get("photographer") or d.get("secondary_creator") or "NASA/" + d.get("center", ""),
                                         "page": f"https://images.nasa.gov/details/{nid}"}


def fetch(src, small):
    url, meta = nasa(src[5:], small) if src.startswith("nasa:") else commons(src, 500 if small else 1920)  # 2560 renders get 429
    data = get(url)
    return Image.open(io.BytesIO(data)), meta


if sys.argv[1:2] == ["--preview"]:
    d = sys.argv[2]
    os.makedirs(d, exist_ok=True)
    for name, src in {**WANT, **ALT}.items():
        if os.path.exists(os.path.join(d, name + ".jpg")):
            continue
        try:
            im, meta = fetch(src, True)
            im.convert("RGB").save(os.path.join(d, name + ".jpg"))
            print(name, im.size, meta["license"], flush=True)
        except Exception as e:
            print("FAIL", name, e)
        time.sleep(3)
    raise SystemExit

credits = json.load(open(CRED, encoding="utf-8")) if os.path.exists(CRED) else {}
for name, src in WANT.items():
    if name in credits:
        continue
    try:
        im, meta = fetch(src, False)
    except Exception as e:
        print("FAIL", name, e)
        continue
    im = im.convert("RGB")
    if name in CROP:
        l, t, r, b = CROP[name]
        im = im.crop((round(l * im.width), round(t * im.height), round(r * im.width), round(b * im.height)))
        meta["note"] = "cropped to remove caption/frame"
    if max(im.size) > 4000:
        im.thumbnail((4000, 4000), Image.LANCZOS)
    im.save(os.path.join(OUT, name + ".jpg"), quality=92)
    credits[name] = {**meta, "size": f"{im.width}x{im.height}"}
    print(f"{name:20s} {credits[name]['size']:>10s} {meta['license'][:20]:20s} {meta['file'][:60]}", flush=True)
    json.dump(credits, open(CRED, "w", encoding="utf-8"), indent=1, ensure_ascii=False)
    time.sleep(0 if src.startswith("nasa:") else 12)
