"""Final sound: the assembled voice (tools/assemble_vo.py) at 100%, no music, a few quiet effects only where something visible happens.
A true-peak limiter at -1 dBTP stops the voice's few clipping peaks; it does not change its level.
Usage: mix.py <rendered.mp4> <out.mp4>"""
import os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
SK = r"C:\Users\daggu222105\.claude\skills\media-use\audio\assets\sfx"
END = 617.07  # scenes.END: voice end + 1.6 s closing card

SFX = [  # (seconds, file, volume) - each has a visible cause on screen
    (4.64, "whoosh-short", 0.07),  # prompt clip
    (14.78, "click-soft", 0.09),  # split screen of both results
    (53.18, "pop", 0.07),  # 65
    (93.08, "click", 0.07),  # 1318 bars
    (112.86, "impact-bass-1", 0.05),  # what do they actually build?
    (139.34, "click-soft", 0.09),  # Kepler's equation
    (166.22, "click-soft", 0.09),  # honest-note timeline
    (240.83, "pop", 0.07),  # time cards
    (258.70, "click", 0.07),  # Speed: Codex
    (262.64, "whoosh-short", 0.07),  # Astra's result
    (314.38, "click-soft", 0.09),  # ...and no Pluto
    (329.13, "whoosh-short", 0.07),  # Fable's result
    (426.24, "key-press", 0.05),  # scorecard rows
    (427.82, "key-press", 0.05),
    (433.14, "key-press", 0.05),
    (435.88, "key-press", 0.05),
    (441.08, "key-press", 0.05),
    (445.20, "key-press", 0.05),
    (449.73, "impact-bass-1", 0.05),  # verdict
    (534.02, "pop", 0.07),  # 54%
    (552.30, "whoosh-short", 0.06),  # builds montage
    (614.03, "whoosh-short", 0.09),  # logo
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
