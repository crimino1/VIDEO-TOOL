"""Final sound: the assembled voice (tools/assemble_vo.py) at 100%, no music, a few quiet effects only where something visible happens.
A true-peak limiter at -1 dBTP stops the voice's few clipping peaks; it does not change its level.
Usage: mix.py <rendered.mp4> <out.mp4>"""
import os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SK = r"C:\Users\daggu222105\.claude\skills\media-use\audio\assets\sfx"
END = 254.79  # scenes.END: voice end + 1.6 s closing card

SFX = [  # (seconds, file, volume) - each has a visible cause on screen
    (5.22, "click-soft", 0.08),  # "No launch event" pill
    (6.48, "click-soft", 0.08),  # "No benchmark chart" pill
    (7.86, "whoosh-short", 0.07),  # Zixuan Li's post
    (10.34, "pop", 0.07),  # 800K+
    (13.08, "whoosh-short", 0.07),  # blog cover
    (26.46, "click-soft", 0.09),  # entity list dot
    (46.20, "pop", 0.07),  # Intelligence Index 50
    (64.02, "click-soft", 0.09),  # it can see
    (78.44, "pop", 0.07),  # +50% quota
    (95.00, "whoosh-short", 0.05),  # token loops back
    (118.98, "pop", 0.07),  # 200 tokens/s
    (142.60, "pop", 0.07),  # +11.3
    (147.84, "click", 0.07),  # 30B TEST MODEL badge
    (153.02, "key-press", 0.05),  # what's missing rows
    (158.86, "key-press", 0.05),
    (161.12, "key-press", 0.05),
    (172.93, "whoosh-short", 0.07),  # demos
    (203.04, "pop", 0.07),  # $18
    (230.15, "whoosh-short", 0.06),  # robot arm clip
    (249.82, "whoosh-short", 0.09),  # logo
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
fc.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=first,atrim=0:{END},volume=1.5dB,alimiter=limit=0.89:attack=1:release=50:level=disabled[mix]")
wav = os.path.join(ROOT, "renders", "mix.wav")
subprocess.run(args + ["-filter_complex", ";".join(fc), "-map", "[mix]", "-c:a", "pcm_s24le", wav], check=True)
print("voice", lufs(vo), "mix", lufs(wav))
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", pic, "-i", wav, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", out], check=True)
print("final", lufs(out))
