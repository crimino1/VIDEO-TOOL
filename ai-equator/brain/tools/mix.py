"""Final sound: voice at 100%, no music, a few quiet effects only where something visible happens.
A true-peak limiter at -1 dBTP stops the voice's few clipping peaks; it does not change its level.
Usage: mix.py <rendered.mp4> <out.mp4>"""
import os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SK = r"C:\Users\daggu222105\.claude\skills\media-use\audio\assets\sfx"
END = 691.30

SFX = [  # (seconds, file, volume) - each has a visible cause on screen
    (11.60, "ping", .07),           # the faulty wire lights up
    (13.90, "click-soft", .12),     # wrench fixes it
    (17.77, "pop", .10),            # 6x
    (39.59, "whoosh", .07),         # the twist
    (42.30, "pop", .12),            # megamind
    (107.35, "click", .10),         # blindfold on
    (204.87, "ping", .08),          # layers 15 and 19
    (222.40, "whoosh-short", .08),  # direction subtracted
    (249.65, "pop", .10),           # 6x headline
    (308.40, "click", .10),         # no magic knob
    (338.80, "ping", .07),          # 4 games named
    (406.85, "whoosh-short", .09),  # car jumps
    (447.01, "whoosh", .07),        # the twist
    (546.60, "whoosh-short", .08),  # pipe unclogs
    (609.39, "impact-bass-1", .08), # recursive self-improvement
    (674.13, "click-soft", .12),    # hood opens
    (686.93, "whoosh-short", .10),  # logo
]


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


pic, out = sys.argv[1:3]
vo = os.path.join(ROOT, "assets", "vo.mp3")
args = [FF, "-hide_banner", "-loglevel", "error", "-y", "-i", vo]
fc, labels = ["[0:a]aresample=48000[v]"], ["[v]"]
for i, (t, f, v) in enumerate(SFX):
    args += ["-i", os.path.join(SK, f + ".mp3")]
    fc.append(f"[{i + 1}:a]aresample=48000,volume={v},adelay={int(t * 1000)}:all=1[f{i}]")
    labels.append(f"[f{i}]")
fc.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=first,atrim=0:{END},alimiter=limit=0.89:attack=1:release=50:level=disabled[mix]")
wav = os.path.join(ROOT, "renders", "mix.wav")
subprocess.run(args + ["-filter_complex", ";".join(fc), "-map", "[mix]", "-c:a", "pcm_s24le", wav], check=True)
print("voice", lufs(vo), "mix", lufs(wav))
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", pic, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", out], check=True)
print("final", lufs(out))
