"""Contact sheet of downloaded clips: clipsheet.py <out.jpg> <glob-prefix ...>. Five frames per clip, with name and duration."""
import glob, os, subprocess, sys, tempfile
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw
B = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
R = os.path.join(os.path.dirname(__file__), "..", "assets", "raw")
out, *pre = sys.argv[1:]
files = [f for p in pre for f in sorted(glob.glob(os.path.join(R, p + "*.mp4")))]
W, H, N = 256, 144, 5
tmp = tempfile.mkdtemp()


def dur(f):
    return float(subprocess.run([B + r"\ffprobe.exe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", f], capture_output=True, text=True).stdout or 0)


def grab(job):
    f, j, d = job
    p = os.path.join(tmp, f"{os.path.basename(f)}_{j}.jpg")
    subprocess.run([B + r"\ffmpeg.exe", "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{d * (j + .5) / N:.2f}", "-i", f, "-frames:v", "1", "-vf", f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2", "-q:v", "4", p])
    return p


durs = {f: dur(f) for f in files}
with ThreadPoolExecutor(10) as ex:
    res = list(ex.map(grab, [(f, j, durs[f]) for f in files for j in range(N)]))
C = 2
R_ = (len(files) + C - 1) // C
s = Image.new("RGB", (W * N * C, H * R_))
d = ImageDraw.Draw(s)
for i, f in enumerate(files):
    x0, y = (i % C) * W * N, (i // C) * H
    for j in range(N):
        p = res[i * N + j]
        if os.path.exists(p):
            s.paste(Image.open(p), (x0 + j * W, y))
    d.text((x0 + 3, y + 2), f"{os.path.basename(f)[:-4]} {durs[f]:.0f}s", fill=(255, 230, 0))
s.save(out, quality=84)
print(s.size, len(files))
