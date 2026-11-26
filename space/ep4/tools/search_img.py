"""Print image candidates for a query from Commons (default) or NASA images API (--nasa). Usage: search_img.py [--nasa] words..."""
import json, re, sys, urllib.parse
sys.path.insert(0, __import__("os").path.dirname(__file__))
from net import get
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
args = sys.argv[1:]
if args[0] == "--nasa":
    q = urllib.parse.urlencode({"q": " ".join(args[1:]), "media_type": "image"})
    for it in json.loads(get("https://images-api.nasa.gov/search?" + q))["collection"]["items"][:15]:
        d = it["data"][0]
        print(d["nasa_id"], "|", d.get("title", "")[:70], "|", d.get("center", ""), d.get("date_created", "")[:10])
    raise SystemExit
q = urllib.parse.urlencode({"action": "query", "format": "json", "generator": "search", "gsrsearch": " ".join(args), "gsrnamespace": 6, "gsrlimit": 15,
                            "prop": "imageinfo", "iiprop": "size|extmetadata|mime"})
pages = json.loads(get("https://commons.wikimedia.org/w/api.php?" + q)).get("query", {}).get("pages", {})
for p in sorted(pages.values(), key=lambda p: p.get("index", 0)):
    ii = (p.get("imageinfo") or [{}])[0]
    lic = re.sub(r"<[^>]+>", "", ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", ""))
    print(f"{ii.get('width')}x{ii.get('height')} | {lic[:16]} | {p['title'][5:]}")
