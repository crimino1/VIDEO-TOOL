"""Download a free (name-your-price, CC0) itch.io asset pack without an account.
Usage: tools_itch.py <game url> <outdir> [--list] [name-substring ...]   (downloads uploads whose name contains any substring)"""
import http.cookiejar, json, re, socket, sys, urllib.parse, urllib.request
from pathlib import Path
_gai = socket.getaddrinfo
socket.getaddrinfo = lambda *a, **k: [r for r in _gai(*a, **k) if r[0] == socket.AF_INET]
url, out = sys.argv[1].rstrip("/"), Path(sys.argv[2]); args = sys.argv[3:]
only_list = "--list" in args; subs = [a.lower() for a in args if a != "--list"]
op = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
op.addheaders = [("User-Agent", "Mozilla/5.0 video-tool/1.0")]
page = op.open(url, timeout=60).read().decode("utf8", "replace")
csrf = re.search(r'name="csrf_token" value="([^"]+)"', page).group(1)
post = lambda u: json.loads(op.open(u, urllib.parse.urlencode({"csrf_token": csrf}).encode(), timeout=60).read())
dl = post(url + "/download_url")["url"]; key = dl.rsplit("/", 1)[1]
dpage = op.open(dl, timeout=60).read().decode("utf8", "replace")
ups = re.findall(r'data-upload_id="(\d+)".*?class="name" title="([^"]+)".*?class="file_size"><span>([^<]+)<', dpage, re.S)
if not ups: ups = [(i, n, "?") for i, n in re.findall(r'data-upload_id="(\d+)".*?title="([^"]+)"', dpage, re.S)]
for i, n, sz in ups: print(i, n, sz)
if only_list: sys.exit()
out.mkdir(parents=True, exist_ok=True)
for i, n, sz in ups:
    if subs and not any(s in n.lower() for s in subs): continue
    f = post(f"{url}/file/{i}?source=game_download&key={key}")["url"]
    with op.open(f, timeout=120) as r, open(out / n, "wb") as w:
        while True:
            b = r.read(1 << 20)
            if not b: break
            w.write(b)
    print("saved", out / n)
