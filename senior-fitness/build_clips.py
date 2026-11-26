"""Builds the ebook demo and the exercise clips, timed to the voiceover. Run with the project .venv python.
Usage: build_clips.py demo | anim <name...> | anim all"""
import subprocess, sys, tempfile
from pathlib import Path

FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin\ffmpeg.exe"
HERE = Path(__file__).resolve().parent
RAW = HERE.parent / "raw" / "ebook-demo.mp4"
FRAMES = HERE / "blender" / "frames"
ANIM = HERE / "assets" / "anim"; ANIM.mkdir(parents=True, exist_ok=True)
FPS = 30
CRF = ["-c:v", "libx264", "-crf", "16", "-preset", "medium", "-pix_fmt", "yuv420p", "-an"]

def run(*a):
    subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", *map(str, a)], check=True)

# (source start, source end, length on screen, stretch the motion or play then hold the last frame)
DEMO = [(0, 3.6, 11.94, "hold"), (1.0, 1.04, 15.28, "hold"), (4.1, 5.5, 2.02, "fit"), (5.6, 8.3, 9.10, "fit"),
        (8.3, 9.5, 3.86, "fit"), (9.6, 11.0, 3.98, "fit"), (11.0, 12.7, 3.34, "fit"), (13.0, 15.3, 8.06, "hold"),
        (15.4, 23.4, 6.38, "fit"), (25.0, 25.9, 8.28, "hold"), (24.0, 24.7, 3.38, "hold"), (26.0, 28.0, 4.72, "hold")]

def demo():
    tmp = Path(tempfile.mkdtemp()); names = []
    # Crop away the wallpaper, bookmarks bar and taskbar
    crop = "crop=1764:799:78:183"
    for i, (a, b, out, mode) in enumerate(DEMO):
        d = b - a
        vf = f"{crop},setpts=PTS*{out / d:.5f}" if mode == "fit" else f"{crop},tpad=stop_mode=clone:stop_duration={max(out - d, 0):.3f}"
        p = tmp / f"{i:02d}.mp4"
        run("-ss", a, "-t", d, "-i", RAW, "-vf", f"{vf},fps={FPS},scale=1764:800", "-t", out, *CRF, p); names.append(p)
    lst = tmp / "l.txt"; lst.write_text("".join(f"file '{p.as_posix()}'\n" for p in names), encoding="utf-8")
    run("-f", "concat", "-safe", "0", "-i", lst, "-c", "copy", HERE / "assets" / "demo.mp4")
    run("-ss", 1, "-i", RAW, "-frames:v", 1, HERE / "assets" / "shop-frame.png")

# name: (voiceover start, voiceover end, frames folder, when the movement starts, flip after this time or None)
ANIMS = {
    "ex1": (177.14, 200.64, "seated_march", 186.68, None),
    "ex2a": (200.64, 210.92, "shoulder_rolls", 205.6, None),
    "ex2b": (210.92, 225.28, "arm_circles", 210.92, None),
    "ex3": (225.28, 262.04, "sit_to_stand", 235.8, None),
    "ex4": (262.04, 288.24, "wall_pushup", 272.1, None),
    "ex5": (288.24, 311.38, "heel_raises", 296.1, None),
    "ex6": (311.38, 337.84, "side_leg_raise", 317.2, 331.44),
    "ex7": (337.84, 363.54, "knee_extension", 344.2, None),
    "ex8a": (363.54, 374.04, "heel_to_toe", 368.0, None),
    "ex8b": (374.04, 383.46, "heel_toe_feet", 374.04, None),
    "ex8c": (383.46, 392.02, "heel_to_toe", 383.46, None),
    "chair": (173.22, 177.14, "chair_still", 177.14, None),
}

def anim(name):
    start, end, folder, cue, flip = ANIMS[name]
    src = FRAMES / folder
    total = end - start; hold = max(cue - start, 0)
    flt = [f"hqdn3d=1.5:1.5:3:3,fps={FPS}"]
    # Hold the first frame until the voice cues the move, then loop the movement to the end
    run("-framerate", 24, "-stream_loop", -1, "-i", src / "%04d.png", "-vf",
        f"tpad=start_mode=clone:start_duration={hold:.3f},{flt[0]}", "-t", total, *CRF, ANIM / f"{name}.mp4")
    if flip is not None:
        tmp = ANIM / f"{name}_tmp.mp4"; ANIM.joinpath(f"{name}.mp4").replace(tmp); k = flip - start
        run("-i", tmp, "-filter_complex", f"[0:v]split[a][b];[b]trim=start={k:.3f},setpts=PTS-STARTPTS,hflip[r];[a]trim=end={k:.3f},setpts=PTS-STARTPTS[l];[l][r]concat=n=2:v=1[v]",
            "-map", "[v]", *CRF, ANIM / f"{name}.mp4"); tmp.unlink()
    print("built", name, round(total, 2))

if __name__ == "__main__":
    if sys.argv[1] == "demo": demo(); print("demo built")
    else:
        for n in (ANIMS if sys.argv[2] == "all" else sys.argv[2:]): anim(n)
