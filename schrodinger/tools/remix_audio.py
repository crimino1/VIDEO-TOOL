"""Rebuilds the film's sound from voice and effects only, at -14 LUFS, and swaps it in without touching the picture."""
import os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)
from shots import FILM_END, sec
B = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
FF = B + r"\ffmpeg.exe"
FILM = os.path.join(ROOT, "..", "done", "schrodinger-final.mp4")
TMP = os.path.join(ROOT, ".review", "voice_fx.wav")
OUT = os.path.join(ROOT, "..", "done", "schrodinger-final-nomusic.mp4")
src = open(os.path.join(ROOT, "tools", "build_index.py"), encoding="utf-8").read()
SFX = re.findall(r'\("(\d+:[\d.]+)", "([\w-]+)", ([\d.]+)\)', src[src.index("SFX = ["):src.index("def fx_len")])
assert len(SFX) == 20, len(SFX)
args = [FF, "-hide_banner", "-loglevel", "error", "-y", "-i", os.path.join(ROOT, "assets", "vo.mp3")]
fc, labels = [], ["[0:a]"]
for i, (t, f, v) in enumerate(SFX):
    args += ["-i", os.path.join(ROOT, "assets", "sfx", f + ".mp3")]
    ms = int(sec(t) * 1000)
    fc.append(f"[{i + 1}:a]aresample=48000,volume={v},adelay={ms}:all=1[f{i}]")
    labels.append(f"[f{i}]")
fc.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=longest,atrim=0:{FILM_END},alimiter=limit=0.84:attack=5:release=60:level=disabled[mix]")
subprocess.run(args + ["-filter_complex", ";".join(fc), "-map", "[mix]", "-c:a", "pcm_s24le", "-ar", "48000", TMP], check=True)


def loud(path):
    e = subprocess.run([FF, "-hide_banner", "-i", path, "-af", "ebur128=peak=true:framelog=quiet", "-vn", "-f", "null", "-"], capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
    return float(re.findall(r"I:\s+([-\d.]+) LUFS", e)[-1]), float(re.findall(r"Peak:\s+([-\d.]+) dBFS", e)[-1])


i0, p0 = loud(TMP)
gain = -14.0 - i0
print(f"mix {i0} LUFS, peak {p0}; gain {gain:+.2f} dB, peak after {p0 + gain:.1f}")
assert p0 + gain < -1.0, "would clip: use a limiter"
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", FILM, "-i", TMP, "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-af", f"volume={gain:.2f}dB", "-c:a", "aac", "-b:a", "256k", "-movflags", "+faststart", "-shortest", OUT], check=True)
print("final", loud(OUT))
