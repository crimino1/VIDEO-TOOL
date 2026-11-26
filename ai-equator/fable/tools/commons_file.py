"""Fetch one named Commons file as a render. Usage: commons_file.py <out> "File:Name.ext" [width]"""
import json, sys, urllib.parse, urllib.request
out, t = sys.argv[1], sys.argv[2]
w = sys.argv[3] if len(sys.argv) > 3 else "900"
UA = {"User-Agent": "AIEquatorVideoTool/1.0 (video editing research)"}
api = "https://commons.wikimedia.org/w/api.php?" + urllib.parse.urlencode({"action": "query", "format": "json", "titles": t, "prop": "imageinfo", "iiprop": "url|extmetadata", "iiurlwidth": w})
p = next(iter(json.load(urllib.request.urlopen(urllib.request.Request(api, headers=UA)))["query"]["pages"].values()))
if "imageinfo" not in p:
    sys.exit(f"missing {t}")
ii = p["imageinfo"][0]; md = ii["extmetadata"]
open(out, "wb").write(urllib.request.urlopen(urllib.request.Request(ii["thumburl"], headers=UA)).read())
print("saved", out, "|", t, "|", md.get("LicenseShortName", {}).get("value"), "|", md.get("Artist", {}).get("value", "")[:90])
