"""NASA images-api videos, preview then cut only the needed section (public domain).
  nasavid.py sheet <out.jpg> <nasa_id> [n=12]     contact sheet of n frames (timestamps printed on tiles)
  nasavid.py cut <name> <nasa_id> <ss> <dur>      -> assets/raw/nasa_<name>.mp4 (1080p), credit in assets/raw/nasa.json"""
import io, json, os, subprocess, sys, urllib.parse
sys.path.insert(0, os.path.dirname(__file__))
from net import get
from PIL import Image, ImageDraw
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
FP = FF.replace("ffmpeg.exe", "ffprobe.exe")
OUT = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "assets", "raw"))


def url_of(nid):
    files = json.loads(get("https://images-api.nasa.gov/asset/" + urllib.parse.quote(nid)))["collection"]["items"]
    mp4 = [f["href"] for f in files if f["href"].lower().endswith(".mp4")]
    for tag in ("~orig", "~large", "~medium", ""):
        for h in mp4:
            if tag in h: return h.replace("http://", "https://").replace(" ", "%20")


def meta(nid):
    d = json.loads(get("https://images-api.nasa.gov/search?" + urllib.parse.urlencode({"nasa_id": nid})))["collection"]["items"][0]["data"][0]
    return d


def dur(u):
    return float(subprocess.run([FP, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", u], capture_output=True, text=True, timeout=120).stdout.strip() or 0)


cmd = sys.argv[1]
if cmd == "sheet":
    out, nid = sys.argv[2], sys.argv[3]
    n = int(sys.argv[4]) if len(sys.argv) > 4 else 12
    u = url_of(nid); D = dur(u); print(nid, f"{D:.1f}s", u)
    t0, t1 = (float(sys.argv[5]), float(sys.argv[6])) if len(sys.argv) > 6 else (0, D)
    tiles = []
    for k in range(n):
        t = t0 + (t1 - t0) * (k + 0.5) / n
        png = subprocess.run([FF, "-v", "error", "-ss", f"{t:.2f}", "-i", u, "-frames:v", "1", "-vf", "scale=400:-2", "-f", "image2pipe", "-vcodec", "png", "-"], capture_output=True, timeout=120).stdout
        if png: tiles.append((Image.open(io.BytesIO(png)).convert("RGB"), f"{t:.1f}s"))
    W, Hh, C = 400, 225, 4
    sh = Image.new("RGB", (C * W, ((len(tiles) + C - 1) // C) * (Hh + 16)), "#222"); d = ImageDraw.Draw(sh)
    for i, (im, lab) in enumerate(tiles):
        im.thumbnail((W - 4, Hh - 4)); x, y = i % C * W, i // C * (Hh + 16)
        sh.paste(im, (x + 2, y + 2)); d.text((x + 4, y + Hh + 1), lab, fill="white")
    sh.save(out, quality=85)
elif cmd == "cut":
    name, nid, ss, du = sys.argv[2], sys.argv[3], float(sys.argv[4]), float(sys.argv[5])
    u = url_of(nid); dst = os.path.join(OUT, f"nasa_{name}.mp4")
    for attempt in range(4):  # connection resets happen here: reconnect flags + verify length, retry
        subprocess.run([FF, "-v", "error", "-y", "-reconnect", "1", "-reconnect_on_network_error", "1", "-reconnect_delay_max", "10", "-ss", f"{ss:.2f}", "-t", f"{du:.2f}", "-i", u, "-an", "-vf", "scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,fps=30",
                    "-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", dst], timeout=900)
        if os.path.exists(dst) and dur(dst) >= du * 0.95: break
        print("  short/broken cut, retry", attempt + 1, flush=True)
    else: raise SystemExit("FAILED " + name)
    m = meta(nid); cp = os.path.join(OUT, "nasa.json")
    cred = json.load(open(cp, encoding="utf-8")) if os.path.exists(cp) else {}
    cred[name] = {"file": u.rsplit("/", 1)[1], "title": m.get("title", nid), "license": "Public domain (NASA)", "artist": m.get("center", "NASA") or "NASA",
                  "page": "https://images.nasa.gov/details/" + urllib.parse.quote(nid), "source_url": u}
    json.dump(cred, open(cp, "w", encoding="utf-8"), indent=1)
    print(name, "ok", os.path.getsize(dst) // 1_000_000, "MB")
