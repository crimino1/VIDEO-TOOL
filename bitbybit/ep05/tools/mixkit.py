"""Mixkit stock video (free Mixkit license).
  mixkit.py search slug [slug ...]   -> stock/prev/<id>.mp4 previews (360p) + stock/sheet_<slug>.jpg (labelled ids), stock/mixkit.json
  mixkit.py get id [id ...]          -> stock/raw/mk_<id>.mp4 at 1080p (falls back to 720)"""
import json, os, re, subprocess, sys, urllib.request
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
UA = {"User-Agent": "Mozilla/5.0"}
DB = os.path.join(H, "stock", "mixkit.json")
db = json.load(open(DB)) if os.path.exists(DB) else {}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=120) as r:
        return r.read()


def ids_for(slug, pages=2):
    out = []
    for p in range(1, pages + 1):
        try: h = get(f"https://mixkit.co/free-stock-video/{slug}/" + (f"?page={p}" if p > 1 else "")).decode("utf-8", "replace")
        except Exception: break
        for i in re.findall(r"&quot;item_id&quot;:(\d+)", h):
            if i not in out: out.append(i)
    return out


def prev(i):
    f = os.path.join(H, "stock", "prev", f"{i}.mp4")
    if not os.path.exists(f):
        try: open(f, "wb").write(get(f"https://assets.mixkit.co/videos/{i}/{i}-360.mp4"))
        except Exception: return None
    return f


def frame(f, at=0.4):
    d = float(subprocess.run([FF.replace("ffmpeg.exe", "ffprobe.exe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout or 0)
    out = f + ".jpg"
    subprocess.run([FF, "-loglevel", "error", "-y", "-ss", f"{d * at:.2f}", "-i", f, "-frames:v", "1", "-vf", "scale=320:180:force_original_aspect_ratio=decrease,pad=320:180:(ow-iw)/2:(oh-ih)/2", out])
    return out, d


if sys.argv[1] == "search":
    for slug in sys.argv[2:]:
        ids = ids_for(slug)
        with ThreadPoolExecutor(8) as ex: files = list(ex.map(prev, ids))
        tiles = []
        for i, f in zip(ids, files):
            if not f: continue
            j, d = frame(f)
            db[i] = {"slug": slug, "dur": round(d, 1), "url": f"https://mixkit.co/free-stock-video/{slug}/"}
            tiles.append((i, j, d))
        cols = 6; rows = (len(tiles) + cols - 1) // cols
        sh = Image.new("RGB", (cols * 320, max(1, rows) * 180)); dr = ImageDraw.Draw(sh)
        for k, (i, j, d) in enumerate(tiles):
            x, y = (k % cols) * 320, (k // cols) * 180
            try: sh.paste(Image.open(j), (x, y))
            except Exception: pass
            dr.rectangle((x, y, x + 120, y + 18), fill="black"); dr.text((x + 4, y + 3), f"{i} {d:.0f}s", fill="yellow")
        sh.save(os.path.join(H, "stock", f"sheet_{slug}.jpg"), quality=85)
        print(slug, len(tiles))
    json.dump(db, open(DB, "w"), indent=1)
elif sys.argv[1] == "get":
    def dl(i):
        f = os.path.join(H, "stock", "raw", f"mk_{i}.mp4")
        if os.path.exists(f) and os.path.getsize(f) > 1000: return i, "have"
        for q in (1080, 720):
            try: data = get(f"https://assets.mixkit.co/videos/{i}/{i}-{q}.mp4"); open(f, "wb").write(data); return i, q
            except Exception: pass
        return i, "FAIL"
    with ThreadPoolExecutor(6) as ex:
        for r in ex.map(dl, sys.argv[2:]): print(*r)
