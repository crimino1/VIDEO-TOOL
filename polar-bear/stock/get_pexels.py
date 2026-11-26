"""Downloads the chosen Pexels clips at 1080p (strict 16:9) to stock/raw, and writes the source list."""
import json, urllib.request
from pathlib import Path
HERE = Path(__file__).resolve().parent
RAW = HERE / "raw"; RAW.mkdir(exist_ok=True)
key = next(l for l in open(HERE.parent.parent / ".env") if l.startswith("PEXELS_API_KEYS=")).strip().split("=", 1)[1].split(",")[0]
IDS = [8016826, 8016859, 8016835, 8016862, 36005634, 36265495, 8318701, 6887987, 6953063, 29513325, 13094796, 6884656, 8318618, 7441256, 36005606, 6886135, 35990540,
       36426733, 36005738, 28988998, 40302723, 40302721, 8016832, 8318414, 34492719, 40414688, 8318417, 34492363, 29189058, 855577, 39188575, 37116279, 38079507, 37187236,
       39113256, 37179792, 5607741, 854762, 36600571, 30827406, 36692365, 11403242]
UA = {"Authorization": key, "User-Agent": "video-tool/1.0"}
lines = []
for i in IDS:
    out = RAW / f"px{i}.mp4"
    v = json.load(urllib.request.urlopen(urllib.request.Request(f"https://api.pexels.com/videos/videos/{i}", headers=UA), timeout=30))
    fs = [f for f in v["video_files"] if f.get("height") and f.get("width") and 1.76 <= f["width"] / f["height"] <= 1.79 and f["file_type"] == "video/mp4"]
    fs.sort(key=lambda f: (abs(f["height"] - 1080), -(f.get("fps") or 0)))
    lines.append(f"px{i}.mp4 | {v['user']['name']} | {v['url']}")
    if out.exists(): continue
    if not fs: print("no 16:9 file", i); continue
    data = urllib.request.urlopen(urllib.request.Request(fs[0]["link"], headers={"User-Agent": "video-tool/1.0"}), timeout=300).read()
    out.write_bytes(data)
    print("got", i, fs[0]["width"], fs[0]["height"], round(len(data) / 1e6, 1), "MB", flush=True)
(HERE / "pexels-sources.txt").write_text("Stock video from Pexels (pexels.com/license)\n" + "\n".join(lines) + "\n", encoding="utf-8")
print("DONE")
