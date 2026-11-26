"""Final sound: the assembled voice (tools/assemble_vo.py) at 100%, no music, a few quiet effects only where something visible happens.
A true-peak limiter at -1 dBTP stops the voice's few clipping peaks; it does not change its level.
Usage: mix.py <rendered.mp4> <out.mp4>"""
import os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SK = r"C:\Users\daggu222105\.claude\skills\media-use\audio\assets\sfx"
END = 505.78  # scenes.END

SFX = [  # (seconds, file, volume) - each has a visible cause on screen
    (7.28, "whoosh-short", 0.07),  # first clip
    (12.42, "click-soft", 0.08),  # agenda
    (32.02, "click-soft", 0.09),  # legal letters dot
    (39.58, "whoosh-short", 0.06),  # 4K clip
    (53.82, "whoosh-short", 0.06),  # Flash clip
    (76.56, "pop", 0.07),  # 50 references
    (96.88, "click-soft", 0.08),  # 4K caption
    (126.62, "pop", 0.06),  # Sound card
    (128.10, "whoosh-short", 0.07),  # film
    (168.22, "whoosh-short", 0.06),  # creators
    (204.76, "pop", 0.07),  # 4/5
    (209.72, "click", 0.07),  # 2/5
    (219.34, "pop", 0.07),  # 5-1
    (253.32, "click-soft", 0.08),  # Green Lantern
    (271.44, "click-soft", 0.07),  # dogfight
    (276.94, "click", 0.07),  # failed twice
    (291.99, "whoosh-short", 0.07),  # benchmarks
    (299.32, "click-soft", 0.08),  # #5 box
    (314.86, "click-soft", 0.08),  # #2 box
    (323.60, "click", 0.07),  # 2.5 below 2.0
    (350.08, "pop", 0.07),  # $3.50
    (358.66, "whoosh-short", 0.07),  # cost
    (372.38, "pop", 0.07),  # 4K price
    (400.96, "click", 0.07),  # Sora badge
    (413.46, "pop", 0.07),  # 37 credits
    (432.11, "whoosh-short", 0.06),  # safety
    (458.16, "click-soft", 0.08),  # verdict cards
    (499.76, "whoosh-short", 0.09),  # logo
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
