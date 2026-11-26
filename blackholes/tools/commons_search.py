"""List Commons search results with size and licence: commons_search.py "words" ..."""
import json, re, sys, urllib.parse, urllib.request
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
API = "https://commons.wikimedia.org/w/api.php?"


def get(u):
    with urllib.request.urlopen(urllib.request.Request(u, headers=UA), timeout=60) as r:
        return json.loads(r.read())


for words in sys.argv[1:]:
    q = urllib.parse.urlencode({"action": "query", "format": "json", "generator": "search", "gsrsearch": words, "gsrnamespace": 6, "gsrlimit": 14,
                                "prop": "imageinfo", "iiprop": "size|extmetadata|mime"})
    d = get(API + q).get("query", {}).get("pages", {})
    print("==", words, len(d))
    for p in sorted(d.values(), key=lambda p: p.get("index", 0)):
        ii = p["imageinfo"][0]
        if not ii["mime"].startswith("image/") or "svg" in ii["mime"]:
            continue
        lic = re.sub("<[^>]+>", "", ii.get("extmetadata", {}).get("LicenseShortName", {}).get("value", ""))
        date = re.sub("<[^>]+>", "", ii.get("extmetadata", {}).get("DateTimeOriginal", {}).get("value", ""))[:20]
        print(f"  {ii['width']}x{ii['height']:<6} {lic[:16]:16s} {date:20s} {p['title'][5:90]}")
