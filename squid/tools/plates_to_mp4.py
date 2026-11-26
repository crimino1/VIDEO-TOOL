"""Turns rendered 3D frames into 1920x1080 30 fps clips in assets/plates/.
Plates rendered every other frame (15 fps) get motion-compensated in-between frames.
Usage: plates_to_mp4.py [name ...]   (default: every finished plate that has no mp4 yet)"""
import os, subprocess, sys, glob
H = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(H, "blender"))
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"
SECS = {"eye_reveal": (16, 2), "hover": (20, 2), "swim": (16, 2), "hooks": (12, 2), "beak": (10, 2), "sub_dark": (18, 2), "sub_lights": (12, 2),
        "glow_wake": (16, 2), "whale_dive": (16, 2), "battle": (14, 1), "strike": (6, 1), "descent": (20, 2)}
out_dir = os.path.join(H, "assets", "plates"); os.makedirs(out_dir, exist_ok=True)
names = sys.argv[1:] or list(SECS)
for n in names:
    secs, step = SECS[n]
    fr = sorted(glob.glob(os.path.join(H, "blender", "frames", n, "f*.png")))
    need = len(range(1, secs * 30 + 1, step))
    out = os.path.join(out_dir, n + ".mp4")
    if len(fr) < need or (os.path.exists(out) and not sys.argv[1:]):
        print(n, f"{len(fr)}/{need} frames", "skip"); continue
    lst = os.path.join(out_dir, n + ".txt")
    with open(lst, "w") as f:
        for p in fr: f.write(f"file '{p}'\nduration {step / 30:.6f}\n")
    vf = "scale=1920:1080:flags=lanczos"
    if step == 2: vf = "minterpolate=fps=30:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1," + vf
    else: vf = "fps=30," + vf
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-f", "concat", "-safe", "0", "-i", lst, "-vf", vf + ",format=yuv420p",
                    "-r", "30", "-c:v", "libx264", "-preset", "slow", "-crf", "14", out], check=True)
    os.remove(lst)
    print(n, "->", out)
