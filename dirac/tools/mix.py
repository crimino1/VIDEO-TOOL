"""Final sound: voice + a few quiet documentary sound effects (no music), at -14 LUFS, muxed onto the picture.
Usage: mix.py <picture.mp4> <out.mp4>"""
import os, re, subprocess, sys
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
import sys as _s; _s.path.insert(0, H)
from shots import FILM_END as END
# (film time, effect, volume)
CUES = [   # beds made with earshot (t, file, gain, dur); the real-sfx track is added as ("rsfx_track") once made
    (0.0, "es_lab", 0.09, 47.5), (29.62, "es_hum", 0.07, 13.0), (670.56, "es_lab", 0.09, 56.2), (1001.44, "es_lab", 0.08, 5.5),
    (52.10, "es_room", 0.09, 13.1), (111.46, "es_room", 0.09, 18.0), (206.42, "es_room", 0.09, 23.5), (419.0, "es_room", 0.08, 5.5),
    (515.86, "es_room", 0.08, 7.0), (604.94, "es_room", 0.08, 4.2), (659.64, "es_room", 0.08, 5.7), (760.72, "es_room", 0.08, 5.4), (976.24, "es_room", 0.09, 10.1),
    (111.76, "es_tick", 0.11, 8.4), (144.40, "es_tick", 0.09, 5.6),
    (949.62, "es_hall", 0.10, 26.6),
]
if os.path.exists(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "assets", "sfx", "rsfx_track.wav")):
    CUES.append((0.0, "rsfx_track", 1.0))
TMP = os.path.join(H, ".mix"); os.makedirs(TMP, exist_ok=True)


def run(a): subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y"] + a, check=True)


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


pic, out = sys.argv[1:3]
sfx = os.path.join(H, "assets", "sfx")
args, fc, lab = ["-i", os.path.join(H, "assets", "vo.mp3")], ["[0:a]aresample=48000,apad,acompressor=threshold=-20dB:ratio=2:attack=10:release=150:makeup=1[v]"], ["[v]"]
for i, c in enumerate(CUES):   # (t, file, gain) or (t, file, gain, dur) for a bed: looped/trimmed to dur with 1 s fades
    t, f, v = c[:3]
    p = next(os.path.join(sfx, f + x) for x in (".wav", ".mp3", ".flac") if os.path.exists(os.path.join(sfx, f + x)))
    args += (["-stream_loop", "-1"] if len(c) > 3 else []) + ["-i", p]
    bed = f",atrim=0:{c[3]},afade=t=in:d=1,afade=t=out:st={max(0, c[3] - 1.2)}:d=1.2" if len(c) > 3 else ""
    fc.append(f"[{i + 1}:a]aresample=48000{bed},volume={v},adelay={int(t * 1000)}:all=1[f{i}]")
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
