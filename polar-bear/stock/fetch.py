"""thumbs: labelled sheet of candidate thumbnails. get <key...>: download the chosen clips at full size to stock/raw."""
import sys, subprocess, urllib.request
from pathlib import Path
HERE = Path(__file__).resolve().parent
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
rows = [l.strip().split("|") for l in (HERE / "cands.txt").read_text(encoding="utf-8").splitlines() if l.strip()]
UA = {"User-Agent": "Mozilla/5.0"}

def run(*a): subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", *map(str, a)], check=True)

if sys.argv[1] == "thumbs":
    d = HERE / "t"; d.mkdir(exist_ok=True)
    for i, (key, _, thumb, _) in enumerate(rows):
        raw = d / f"{i:02d}.img"
        raw.write_bytes(urllib.request.urlopen(urllib.request.Request(thumb, headers=UA), timeout=40).read())
        run("-i", raw, "-frames:v", 1, "-vf", f"scale=384:216:force_original_aspect_ratio=increase,crop=384:216,drawtext=text='{key}':x=4:y=4:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.7", d / f"{i:02d}.png")
    run("-start_number", 0, "-i", d / "%02d.png", "-vf", "tile=6x4", "-frames:v", 1, HERE / "cands.jpg")
    print("sheet written", len(rows))
else:
    (HERE / "raw").mkdir(exist_ok=True)
    keys = sys.argv[2:] or [r[0] for r in rows]
    for key, url, _, _ in rows:
        if key not in keys: continue
        out = HERE / "raw" / f"{key}.mp4"
        if out.exists(): continue
        if url.endswith(".mp4"):
            out.write_bytes(urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=300).read())
        else:
            run("-i", url, "-c", "copy", out)
        print("got", key, round(out.stat().st_size / 1e6, 1), "MB", flush=True)
