"""Final sound: the assembled voice (tools/assemble_vo.py) at 100%, no music, a few quiet effects only where something visible happens.
A true-peak limiter at -1 dBTP stops the voice's few clipping peaks; it does not change its level.
Usage: mix.py <rendered.mp4> <out.mp4>"""
import os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SK = r"C:\Users\daggu222105\.claude\skills\media-use\audio\assets\sfx"
END = 365.73  # scenes.END

SFX = [  # (seconds, file, volume) - each has a visible cause on screen
    (3.02, "whoosh-short", 0.07),  # first clip
    (11.28, "pop", 0.07),  # 82%
    (14.28, "click", 0.07),  # no-announcement badge
    (22.89, "whoosh-short", 0.06),  # timeline
    (43.12, "pop", 0.07),  # 64 days
    (48.34, "click-soft", 0.08),  # overdue badge
    (49.85, "whoosh-short", 0.06),  # October clips
    (61.50, "pop", 0.06),  # 27M tokens
    (91.90, "click-soft", 0.08),  # only-hint badge
    (98.94, "key-press", 0.05),  # spec rows
    (101.80, "key-press", 0.05),  # 
    (103.30, "key-press", 0.05),  # 
    (107.54, "key-press", 0.05),  # 
    (111.54, "click", 0.07),  # no original post
    (136.32, "click", 0.07),  # no proof
    (140.21, "whoosh-short", 0.06),  # demos
    (160.24, "click", 0.07),  # contradicts badge
    (175.66, "click", 0.07),  # no 5.6 badge
    (177.78, "key-press", 0.05),  # watch rows
    (197.26, "pop", 0.07),  # 82% bar
    (222.04, "pop", 0.06),  # 81.5%
    (252.98, "pop", 0.07),  # #1 to #10
    (287.04, "pop", 0.06),  # $3.20
    (298.30, "click-soft", 0.08),  # doubt rows
    (355.58, "pop", 0.07),  # guess card
    (362.88, "whoosh-short", 0.09),  # logo
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
