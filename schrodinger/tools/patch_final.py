"""Drops re-rendered Manim shots into the finished film at the exact frame, and sets the final loudness. Usage: patch_final.py Name ..."""
import math, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, ROOT)
from shots import BY_NAME
B = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
FF = B + r"\ffmpeg.exe"
SRC = os.path.join(ROOT, "..", "done", "schrodinger-final.mp4")
OUT = os.path.join(ROOT, "..", "done", "schrodinger-final-fixed.mp4")
GAIN_DB = 2.9
names = sys.argv[1:]
args = [FF, "-hide_banner", "-loglevel", "warning", "-stats", "-y", "-i", SRC]
fc, last = [], "0:v"
for i, n in enumerate(names):
    s = BY_NAME[n]
    clip = os.path.join(ROOT, "assets", "manim", n + ".mp4")
    f0 = math.ceil(s["start"] * 30)
    f1 = math.ceil(s["end"] * 30)
    # measure the alignment on the opening frames, which did not change
    best = []
    for off in (-1, 0, 1):
        e = subprocess.run([FF, "-hide_banner", "-i", clip, "-ss", f"{(f0 + off) / 30:.4f}", "-i", SRC, "-filter_complex", "[0:v]scale=480:-2[a];[1:v]scale=480:-2[b];[a][b]psnr", "-frames:v", "60", "-f", "null", "-"],
                           capture_output=True, text=True, encoding="utf-8", errors="replace").stderr
        m = re.search(r"average:([\d.inf]+)", e)
        best.append((float(m.group(1)) if m and m.group(1) != "inf" else 99, off))
    print(n, "alignment", best, flush=True)
    f0 += max(best)[1]
    args += ["-i", clip]
    fc.append(f"[{i + 1}:v]trim=end_frame={f1 - f0},setpts=PTS-STARTPTS+{f0}/30/TB[p{i}]")
    fc.append(f"[{last}][p{i}]overlay=eof_action=pass:format=yuv420[o{i}]")
    last = f"o{i}"
args += ["-filter_complex", ";".join(fc), "-map", f"[{last}]", "-map", "0:a", "-af", f"volume={GAIN_DB}dB", "-c:a", "aac", "-b:a", "256k",
         "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "30", "-movflags", "+faststart", OUT]
raise SystemExit(subprocess.run(args).returncode)
