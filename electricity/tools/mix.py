"""Final sound: voice + a few quiet documentary sound effects (no music), at -14 LUFS, muxed onto the picture.
Usage: mix.py <picture.mp4> <out.mp4>"""
import os, re, subprocess, sys
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
import sys as _s; _s.path.insert(0, H)
from shots import FILM_END as END
# (film time, effect, volume)
CUES = [(1.60, "click", 0.50), (11.6, "shimmer", 0.12), (217.32, "click", 0.35), (282.78, "shimmer", 0.15), (297.0, "whoosh-short", 0.20),
        (369.94, "snap", 0.40), (395.5, "spark", 0.40), (405.0, "spark", 0.28), (437.12, "shimmer", 0.12), (525.8, "tick", 0.40),
        (617.1, "spark", 0.28), (640.6, "impact-bass-1", 0.30), (657.12, "impact-bass-2", 0.25), (665.56, "impact-bass-1", 0.25),
        (666.9, "impact-bass-2", 0.22), (668.0, "impact-bass-1", 0.20), (739.0, "shimmer", 0.15), (772.0, "click", 0.50)]
TMP = os.path.join(H, ".mix"); os.makedirs(TMP, exist_ok=True)


def run(a): subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y"] + a, check=True)


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


pic, out = sys.argv[1:3]
sfx = os.path.join(H, "assets", "sfx")
args, fc, lab = ["-i", os.path.join(H, "assets", "vo.mp3")], ["[0:a]aresample=48000,apad,acompressor=threshold=-20dB:ratio=2:attack=10:release=150:makeup=1[v]"], ["[v]"]
for i, (t, f, v) in enumerate(CUES):
    p = next(os.path.join(sfx, f + x) for x in (".wav", ".mp3") if os.path.exists(os.path.join(sfx, f + x)))
    args += ["-i", p]
    fc.append(f"[{i + 1}:a]aresample=48000,volume={v},adelay={int(t * 1000)}:all=1[f{i}]")
    lab.append(f"[f{i}]")
fc.append("".join(lab) + f"amix=inputs={len(lab)}:normalize=0:duration=first,atrim=0:{END}[m]")
raw = os.path.join(TMP, "mix_raw.flac")
run(args + ["-filter_complex", ";".join(fc), "-map", "[m]", "-ac", "2", "-c:a", "flac", raw])
i0, p0 = lufs(raw)
g = -14.0 - i0
run(["-i", raw, "-af", f"volume={g:.2f}dB,alimiter=limit=0.8:attack=2:release=60:level=disabled", "-c:a", "flac", os.path.join(TMP, "mix.flac")])
print("mix", lufs(os.path.join(TMP, "mix.flac")))
run((["-f", "concat", "-safe", "0", "-i", pic] if pic.endswith(".txt") else ["-i", pic]) + ["-i", os.path.join(TMP, "mix.flac"), "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "-shortest", out])
print("final", lufs(out))
for f in ("mix_raw.flac", "mix.flac"):
    os.remove(os.path.join(TMP, f))
