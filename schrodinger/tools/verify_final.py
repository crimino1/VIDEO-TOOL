"""Checks the finished film: format, loudness, music under the voice, dark flashes, and a contact sheet with one frame per shot."""
import json, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)
from shots import SHOTS
sys.stdout.reconfigure(encoding="utf-8", errors="replace")
B = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
FF, FP = B + r"\ffmpeg.exe", B + r"\ffprobe.exe"
F = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, "..", "done", "schrodinger-final.mp4")
print(subprocess.run([FP, "-v", "error", "-count_packets", "-show_entries", "format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_read_packets", "-of", "compact", F], capture_output=True, text=True).stdout)
r = subprocess.run([FF, "-hide_banner", "-i", F, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
print([l.strip() for l in r.splitlines() if re.search(r"\bI:|LRA:|Peak:", l)])
# speech vs gaps
w = json.load(open(os.path.join(ROOT, "words.json"), encoding="utf-8"))["words"]
gaps = sorted(((b["start"] - a["end"], a["end"]) for a, b in zip(w, w[1:])), reverse=True)[:6]


def mean(ss, t):
    e = subprocess.run([FF, "-hide_banner", "-ss", str(ss), "-t", str(t), "-i", F, "-af", "volumedetect", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    m = re.search(r"mean_volume: ([-\d.]+)", e)
    return float(m.group(1)) if m else None


print("gaps dB:", [mean(g[1] + 0.12, max(g[0] - 0.24, 0.2)) for g in gaps], "speech dB:", mean(300, 5), mean(600, 5))
# dark flashes and frozen stretches
r = subprocess.run([FF, "-hide_banner", "-i", F, "-an", "-vf", "scale=160:-2,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stdout
vals = [float(y) for y in re.findall(r"YAVG=([\d.]+)", r)]
print("frames", len(vals), "min Y", min(vals))
# one frame per shot, 65% through
W, H, C = 240, 135, 8
tmp = os.path.join(ROOT, ".review", "final")
os.makedirs(tmp, exist_ok=True)


def grab(i):
    s = SHOTS[i]
    t = s["start"] + (s["end"] - s["start"]) * 0.65
    p = os.path.join(tmp, f"{i:03d}.jpg")
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{t:.2f}", "-i", F, "-frames:v", "1", "-vf", f"scale={W}:{H}", "-q:v", "3", p])
    return p, s, t


with ThreadPoolExecutor(8) as ex:
    res = list(ex.map(grab, range(len(SHOTS))))
R = (len(res) + C - 1) // C
sheet = Image.new("RGB", (W * C, H * R))
d = ImageDraw.Draw(sheet)
for i, (p, s, t) in enumerate(res):
    x, y = (i % C) * W, (i // C) * H
    sheet.paste(Image.open(p), (x, y))
    d.text((x + 3, y + 2), f"{s['name']} {int(t // 60)}:{t % 60:04.1f}", fill=(255, 230, 0))
sheet.save(os.path.join(ROOT, ".review", "final_sheet.jpg"), quality=86)
print("sheet", sheet.size)
