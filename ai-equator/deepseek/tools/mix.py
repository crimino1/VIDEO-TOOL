"""Final sound: cleaned voice (tools/clean_voice.py) at 100%, no music, a few quiet effects only where something visible happens.
A true-peak limiter at -1 dBTP stops the voice's few clipping peaks; it does not change its level.
Usage: mix.py <rendered.mp4> <out.mp4>"""
import os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SK = r"C:\Users\daggu222105\.claude\skills\media-use\audio\assets\sfx"
END = 626.70

SFX = [  # (seconds, file, volume) - each has a visible cause on screen
    (9.66, "click-soft", 0.1),  # names light up
    (63.50, "impact-bass-1", 0.06),  # -589B
    (128.90, "whoosh-short", 0.08),  # leak 1
    (177.12, "ping", 0.08),  # REAL
    (199.86, "click", 0.08),  # 99.0.0
    (218.22, "pop", 0.09),  # 9 tokens
    (246.92, "whoosh-short", 0.08),  # leak 2
    (285.06, "click", 0.08),  # no chart
    (339.56, "whoosh-short", 0.08),  # real news
    (378.56, "pop", 0.08),  # 2027
    (422.74, "click-soft", 0.1),  # 410 TFLOPS
    (541.86, "whoosh-short", 0.07),  # scorecard
    (603.84, "impact-bass-1", 0.06),  # chip war
    (624.36, "whoosh-short", 0.1),  # logo
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
