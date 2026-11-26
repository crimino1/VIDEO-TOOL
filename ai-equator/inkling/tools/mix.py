"""Final sound: the assembled voice (tools/assemble_vo.py) at 100%, no music, a few quiet effects only where something visible happens.
A true-peak limiter at -1 dBTP stops the voice's few clipping peaks; it does not change its level.
Usage: mix.py <rendered.mp4> <out.mp4>"""
import os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SK = r"C:\Users\daggu222105\.claude\skills\media-use\audio\assets\sfx"
END = 871.32  # scenes.END

SFX = [  # (seconds, file, volume) - each has a visible cause on screen
    (4.34, "whoosh-short", 0.07),  # first clip
    (13.18, "click-soft", 0.09),  # claim box
    (16.96, "click-soft", 0.08),  # agenda
    (34.89, "whoosh-short", 0.06),  # background
    (64.07, "whoosh-short", 0.06),  # model card
    (116.36, "click-soft", 0.08),  # token climbs
    (120.86, "pop", 0.07),  # 48 passes
    (144.78, "pop", 0.07),  # 27/28
    (150.70, "pop", 0.07),  # +140%
    (196.56, "pop", 0.06),  # 4-bit
    (220.71, "click", 0.07),  # 16 GB
    (244.65, "whoosh-short", 0.07),  # demos start
    (299.89, "whoosh-short", 0.06),  # YouTube tests
    (349.44, "pop", 0.07),  # reveal
    (426.88, "key-press", 0.05),  # loop rows
    (437.12, "key-press", 0.05),  # 
    (441.08, "key-press", 0.05),  # 
    (446.12, "key-press", 0.05),  # 
    (459.08, "whoosh-short", 0.07),  # speed section
    (475.64, "click", 0.06),  # Mac mini bars
    (499.62, "click", 0.06),  # GPU bars
    (531.98, "pop", 0.07),  # 210 claim
    (545.38, "pop", 0.07),  # 197
    (565.40, "pop", 0.07),  # 26.5 min
    (612.93, "whoosh-short", 0.07),  # benchmarks
    (631.68, "click", 0.06),  # index bars
    (646.26, "click-soft", 0.08),  # coding cards
    (708.94, "pop", 0.07),  # $0.59
    (729.56, "click-soft", 0.08),  # Vals box
    (784.32, "whoosh-short", 0.06),  # verdict
    (807.76, "click-soft", 0.08),  # who shouldn't
    (865.14, "whoosh-short", 0.09),  # logo
]


def lufs(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


pic, out = sys.argv[1:3]
vo = os.path.join(ROOT, "assets", "vo.mp3")
args = [FF, "-hide_banner", "-loglevel", "error", "-y", "-i", vo]
fc, labels = [f"[0:a]aresample=48000,apad=whole_dur={END}[v]"], ["[v]"]
for i, (t, f, v) in enumerate(SFX):
    args += ["-i", os.path.join(SK, f + ".mp3")]
    fc.append(f"[{i + 1}:a]aresample=48000,volume={v},adelay={int(t * 1000)}:all=1[f{i}]")
    labels.append(f"[f{i}]")
fc.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=first,atrim=0:{END},volume=0.9dB,alimiter=limit=0.84:attack=0.5:release=50:level=disabled[mix]")
wav = os.path.join(ROOT, "renders", "mix.wav")
subprocess.run(args + ["-filter_complex", ";".join(fc), "-map", "[mix]", "-c:a", "pcm_s24le", wav], check=True)
print("voice", lufs(vo), "mix", lufs(wav))
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", pic, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", out], check=True)
print("final", lufs(out))
