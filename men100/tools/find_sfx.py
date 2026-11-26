"""Search Wikimedia Commons for free-licence sound files; list title, licence, duration, url."""
import json, sys, time, urllib.parse, urllib.request, socket
_g = socket.getaddrinfo; socket.getaddrinfo = lambda *a, **k: [r for r in _g(*a, **k) if r[0] == socket.AF_INET]
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
UA = {"User-Agent": "VideoToolImageFetcher/1.0 (personal documentary editing)"}
Q = sys.argv[1:]
out = {}
for q in Q:
    qs = urllib.parse.urlencode({"action": "query", "format": "json", "generator": "search", "gsrsearch": f"filetype:audio {q}", "gsrnamespace": 6, "gsrlimit": 8,
                                 "prop": "imageinfo", "iiprop": "url|size|extmetadata|mediatype"})
    r = json.loads(urllib.request.urlopen(urllib.request.Request("https://commons.wikimedia.org/w/api.php?" + qs, headers=UA), timeout=60).read())
    pages = sorted(r.get("query", {}).get("pages", {}).values(), key=lambda p: p.get("index", 99))
    out[q] = []
    for p in pages:
        ii = p["imageinfo"][0]; md = ii.get("extmetadata", {})
        lic = md.get("LicenseShortName", {}).get("value", "?"); dur = md.get("Duration", {}).get("value") if "Duration" in md else None
        out[q].append({"title": p["title"], "lic": lic, "url": ii["url"], "size": ii["size"], "page": ii.get("descriptionurl")})
        print(f"{q:18s} | {lic:14s} | {ii['size']//1024:6d}KB | {p['title'][5:80]}")
    time.sleep(1)
json.dump(out, open("assets/sfx_raw/commons_found.json", "w", encoding="utf-8"), indent=1)
