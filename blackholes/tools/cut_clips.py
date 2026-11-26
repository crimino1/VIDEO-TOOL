"""Cuts every "v" shot's stock clip to its slot: 1920x1080, 30 fps, no audio, bt709 (HDR tone-mapped), assets/clips/<name>.mp4.
A clip shorter than its slot is slowed down (up to 2x); anything needing more fails loudly."""
import json, os, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)
from shots import SHOTS, CLIPS
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
FP = FF.replace("ffmpeg.exe", "ffprobe.exe")
OUT = os.path.join(ROOT, "assets", "clips")
os.makedirs(OUT, exist_ok=True)


def probe(f):
    r = json.loads(subprocess.run([FP, "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer:format=duration", "-of", "json", f], capture_output=True, text=True).stdout)
    return float(r["format"]["duration"]), (r["streams"][0].get("color_transfer") or "").split(",")[0]


done = {}
for s in SHOTS:
    if s["kind"] != "v":
        continue
    src_name, ss = CLIPS[s["clip"]]
    if s.get("ss") is not None:
        ss = s["ss"]
    src = os.path.join(ROOT, "assets", "raw", f"px_{src_name}.mp4")
    slot = s["end"] - s["start"] + 0.25
    dur, trc = probe(src)
    avail = dur - ss
    speed = 1.0 if avail >= slot else slot / avail
    assert speed <= 2.0, f"{s['clip']}: needs {slot:.1f}s, clip has {avail:.1f}s"
    name = f"{s['clip']}_{int(s['start'])}"
    out = os.path.join(OUT, name + ".mp4")
    s["file"] = f"assets/clips/{name}.mp4"
    if os.path.exists(out):
        continue
    vf = []
    if trc in ("arib-std-b67", "smpte2084"):
        vf.append("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
    if speed > 1.0:
        vf.append(f"setpts={speed:.4f}*PTS")
    vf += ["scale=1920:1080:force_original_aspect_ratio=increase", "crop=1920:1080", "fps=30", "format=yuv420p"]
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{ss}", "-i", src, "-t", f"{slot:.3f}", "-an", "-vf", ",".join(vf),
                    "-c:v", "libx264", "-crf", "17", "-preset", "medium", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", out], check=True)
    print(f"{name:20s} {slot:5.1f}s  speed {speed:.2f}  {trc}", flush=True)
print("clips ok")
