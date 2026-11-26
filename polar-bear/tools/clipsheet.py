"""Contact sheet: two frames from every clip in stock/raw, with name, size and length."""
import json, subprocess
from pathlib import Path
HERE = Path(__file__).resolve().parent.parent
BIN = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
raw = sorted((HERE / "stock" / "raw").glob("*.mp4"))
T = HERE / "stock" / "s"; T.mkdir(exist_ok=True)
info = {}; files = []
for f in raw:
    j = json.loads(subprocess.run([BIN + r"\ffprobe.exe", "-v", "error", "-select_streams", "v", "-show_entries", "stream=width,height:format=duration", "-of", "json", str(f)], capture_output=True, text=True).stdout)
    w, h = j["streams"][0]["width"], j["streams"][0]["height"]; d = float(j["format"]["duration"]); info[f.stem] = {"w": w, "h": h, "d": round(d, 2)}
    for k, u in enumerate((0.25, 0.7)):
        out = T / f"{f.stem}_{k}.png"
        txt = f"{f.stem} {w}x{h} {d:.0f}s".replace(":", "")
        subprocess.run([BIN + r"\ffmpeg.exe", "-hide_banner", "-loglevel", "error", "-y", "-ss", str(d * u), "-i", str(f), "-frames:v", "1", "-vf", f"scale=320:180,drawtext=text='{txt}':x=3:y=3:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.7", str(out)], stderr=subprocess.DEVNULL)
        files.append(out)
(HERE / "stock" / "info.json").write_text(json.dumps(info, indent=0), encoding="utf-8")
cols = 6; n = len(files); chunk = 48
for s in range(0, n, chunk):
    part = files[s:s + chunk]; a = []
    for p in part: a += ["-i", str(p)]
    lay = "|".join(f"{(i % cols) * 320}_{(i // cols) * 180}" for i in range(len(part)))
    subprocess.run([BIN + r"\ffmpeg.exe", "-hide_banner", "-loglevel", "error", "-y", *a, "-filter_complex", "".join(f"[{i}:v]" for i in range(len(part))) + f"xstack=inputs={len(part)}:layout={lay}:fill=black", "-frames:v", "1", "-q:v", "3", str(HERE / "stock" / f"clips{s // chunk}.jpg")], stderr=subprocess.DEVNULL)
bad = {k: v for k, v in info.items() if not 1.76 <= v["w"] / v["h"] <= 1.79}
print(len(info), "clips; not 16:9:", bad)
