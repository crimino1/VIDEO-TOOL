"""Pexels search + contact sheets + download.
search: python -I tools/pexels.py search stock/queries.txt            (videos; key|query per line)
        python -I tools/pexels.py photos stock/photo_queries.txt      (photos)
get:    python -I tools/pexels.py get key#i key#i ...                 (videos -> assets/stock, photos -> assets/img)
"""
import io, json, os, sys
from pathlib import Path
import requests
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ENV = ROOT.parent / ".env"
ORIENT = os.environ.get("ORIENT", "landscape")
KEYS = [k.strip() for line in ENV.read_text().splitlines() if line.startswith("PEXELS_API_KEYS=") for k in line.split("=", 1)[1].split(",") if k.strip()]
H = lambda i=0: {"Authorization": KEYS[i % len(KEYS)], "User-Agent": "video-tool/1.0"}
CANDS = ROOT / "stock" / "cands.json"
FONT = ImageFont.truetype("arial.ttf", 22)

def load():
    return json.loads(CANDS.read_text()) if CANDS.exists() else {}

def search(qfile, kind):
    cands = load()
    rows = []
    for n, line in enumerate(l for l in Path(qfile).read_text().splitlines() if "|" in l):
        key, q = line.split("|", 1)
        if kind == "video":
            r = requests.get("https://api.pexels.com/videos/search", headers=H(n), params={"query": q, "per_page": 15, "orientation": ORIENT}, timeout=30).json()
            items = []
            for v in r.get("videos", []):
                files = sorted([f for f in v["video_files"] if f.get("width") and f["width"] <= (2160 if ORIENT == "portrait" else 3840) and f.get("file_type") == "video/mp4"], key=lambda f: -f["width"])
                if not files or v["duration"] < 4:
                    continue
                items.append({"id": v["id"], "dur": v["duration"], "thumb": v["image"], "url": files[0]["link"], "w": files[0]["width"], "kind": "video", "page": v["url"], "by": v["user"]["name"]})
        else:
            r = requests.get("https://api.pexels.com/v1/search", headers=H(n), params={"query": q, "per_page": 10, "orientation": ORIENT}, timeout=30).json()
            items = [{"id": p["id"], "thumb": p["src"]["medium"], "url": p["src"]["large2x"], "kind": "photo", "page": p["url"], "by": p["photographer"]} for p in r.get("photos", [])]
        cands[key] = items[:8]
        rows.append(key)
        print(f"{key:12} {len(items)}")
    CANDS.write_text(json.dumps(cands, indent=1))
    sheet(rows, cands, kind)

def sheet(rows, cands, kind):
    tw, th, per = 300, 169, 8
    for s in range(0, len(rows), 8):
        chunk = rows[s:s + 8]
        img = Image.new("RGB", (tw * per, th * len(chunk)), "black")
        d = ImageDraw.Draw(img)
        for r, key in enumerate(chunk):
            for c, it in enumerate(cands[key][:per]):
                try:
                    t = Image.open(io.BytesIO(requests.get(it["thumb"], timeout=30).content)).convert("RGB")
                    t.thumbnail((tw, th)); img.paste(t, (c * tw, r * th))
                except Exception:
                    pass
                d.rectangle([c * tw, r * th, c * tw + 150, r * th + 28], fill="black")
                d.text((c * tw + 4, r * th + 2), f"{key}#{c}", fill="yellow", font=FONT)
        out = ROOT / "stock" / f"{kind}_sheet{s // 8}.jpg"
        img.save(out, quality=82)
        print(out)

def get(picks):
    cands = load()
    credits = ROOT / "stock" / "sources.json"
    src = json.loads(credits.read_text()) if credits.exists() else {}
    for p in picks:
        key, i = p.split("#")
        it = cands[key][int(i)]
        ext = "mp4" if it["kind"] == "video" else "jpg"
        out = ROOT / "assets" / ("stock" if ext == "mp4" else "img") / f"{key}_{i}.{ext}"
        if not out.exists():
            out.write_bytes(requests.get(it["url"], headers={"User-Agent": "video-tool/1.0"}, timeout=120).content)
        src[out.name] = {"source": "Pexels", "page": it["page"], "by": it["by"]}
        print(out.name, out.stat().st_size // 1024, "KB")
    credits.write_text(json.dumps(src, indent=1))

if __name__ == "__main__":
    cmd = sys.argv[1]
    if cmd == "search": search(sys.argv[2], "video")
    elif cmd == "photos": search(sys.argv[2], "photo")
    else: get(sys.argv[2:])
