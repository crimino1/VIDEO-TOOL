"""Cuts the film together: every shot in time order from its Manim clip or from the rendered HyperFrames reel,
each forced to its exact frame count, then voice + Enter-key clicks (one per image/meme) at -14 LUFS.
Usage: assemble.py [--out path] [--only-video]   (needs work/reel.mp4 from `npx hyperframes render -o work/reel.mp4`)"""
import json, os, re, subprocess, sys
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)
from shots import SHOTS, FPS, FILM_END

FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
args = sys.argv[1:]
OUT = args[args.index("--out") + 1] if "--out" in args else os.path.join(ROOT, "..", "done", "trigonometry-full-course.mp4")
PIECES = os.path.join(ROOT, "work", "pieces")
os.makedirs(PIECES, exist_ok=True)
reel = json.load(open(os.path.join(ROOT, "work", "reel.json")))
roff = {r["name"]: r for r in reel["shots"]}
REEL = os.path.join(ROOT, "work", "reel.mp4")
ENC = ["-c:v", "libx264", "-preset", "medium", "-crf", "18", "-pix_fmt", "yuv420p", "-r", str(FPS), "-an"]


def piece(i_s):
    i, s = i_s
    n = round(s["end"] * FPS) - round(s["start"] * FPS)
    out = os.path.join(PIECES, f"{i:04d}_{s['name']}.mp4")
    vf = f"scale=1920:1080:flags=lanczos,fps={FPS},tpad=stop_mode=clone:stop_duration=3"
    if s["kind"] == "m":
        src = os.path.join(ROOT, "assets", "manim", s["name"] + ".mp4")
        if not os.path.exists(src):
            return f"MISSING {s['name']}"
        cmd = [FF, "-v", "error", "-y", "-i", src, "-vf", vf, "-frames:v", str(n), *ENC, out]
    else:
        r = roff[s["name"]]
        assert r["frames"] == n, (s["name"], r["frames"], n)
        cmd = [FF, "-v", "error", "-y", "-ss", f"{r['reel_start_f'] / FPS:.4f}", "-i", REEL, "-vf", vf, "-frames:v", str(n), *ENC, out]
    if os.path.exists(out) and os.path.getmtime(out) > os.path.getmtime(cmd[cmd.index("-i") + 1]):
        return None  # up to date
    subprocess.run(cmd, check=True)
    return None


errs = [e for e in ThreadPoolExecutor(8).map(piece, enumerate(SHOTS)) if e]
if errs:
    sys.exit("\n".join(errs))
lst = os.path.join(PIECES, "list.txt")
with open(lst, "w") as f:
    for i, s in enumerate(SHOTS):
        f.write(f"file '{i:04d}_{s['name']}.mp4'\n")
VID = os.path.join(ROOT, "work", "video_only.mp4")
subprocess.run([FF, "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", VID], check=True)
if "--only-video" in args:
    sys.exit(0)

# sound: voice + one Enter-key click for each image / meme appearance
clicks = reel["clicks"]
WAV = os.path.join(ROOT, "work", "voice_clicks.wav")
fc, ins = [], ["-i", os.path.join(ROOT, "assets", "vo.mp3")]
for k, t in enumerate(clicks):
    ins += ["-i", os.path.join(ROOT, "assets", "sfx", "enter.mp3")]
    fc.append(f"[{k + 1}:a]aresample=48000,volume=0.9,adelay={int(t * 1000)}:all=1[c{k}]")
labels = "[0:a]" + "".join(f"[c{k}]" for k in range(len(clicks)))
fc.append(f"{labels}amix=inputs={len(clicks) + 1}:normalize=0:duration=first,atrim=0:{FILM_END},alimiter=limit=0.89:level=disabled[mix]")
# ponytail: one amix with every click as an input; if clicks pass ~500, mix in chunks
subprocess.run([FF, "-v", "error", "-y", *ins, "-filter_complex", ";".join(fc), "-map", "[mix]", "-c:a", "pcm_s24le", "-ar", "48000", WAV], check=True)


def loud(p):
    e = subprocess.run([FF, "-hide_banner", "-i", p, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


i0, p0 = loud(WAV)
gain = -14.0 - i0
print(f"mix {i0} LUFS peak {p0}; gain {gain:+.2f} dB then limiter at -1.5 dBFS; {len(clicks)} clicks")
os.makedirs(os.path.dirname(OUT), exist_ok=True)
subprocess.run([FF, "-v", "error", "-y", "-i", VID, "-i", WAV, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", f"volume={gain:.2f}dB,alimiter=limit=0.84:attack=3:release=50:level=disabled",
                "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "-shortest", OUT], check=True)
print("final", OUT, loud(OUT))
