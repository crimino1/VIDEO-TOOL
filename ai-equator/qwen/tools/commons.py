"""Fetch the top Wikimedia Commons file for a search, as a PNG/JPG render. Usage: commons.py <out> "<search>" [width]"""
import json, sys, urllib.parse, urllib.request
out, q = sys.argv[1], sys.argv[2]
w = sys.argv[3] if len(sys.argv) > 3 else "1200"
UA = {"User-Agent": "AIEquatorVideoTool/1.0 (video editing research)"}
api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "format": "json", "generator": "search", "gsrsearch": q, "gsrnamespace": 6, "gsrlimit": 5, "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": w})
pages = json.load(urllib.request.urlopen(urllib.request.Request(api, headers=UA)))["query"]["pages"]
best = sorted(pages.values(), key=lambda p: p["index"])
for p in best:
    ii = p["imageinfo"][0]
    md = ii.get("extmetadata", {})
    print(p["title"], "|", md.get("LicenseShortName", {}).get("value"), "|", md.get("Artist", {}).get("value", "")[:80].replace("\n", " "))
p = best[0]
data = urllib.request.urlopen(urllib.request.Request(p["imageinfo"][0]["thumburl"], headers=UA)).read()
open(out, "wb").write(data)
print("saved", out, len(data), "from", p["title"])
