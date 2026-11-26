"""Renders one video-free shot again and drops it into the rendered picture at the exact frame. patch_shot.py <start> <end>"""
import math, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
os.chdir(ROOT)
B = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
FF = B + r"\ffmpeg.exe"
st, en = float(sys.argv[1]), float(sys.argv[2])
s = open("index.html", encoding="utf-8").read()
s, a = re.subn(r"<video\b[^>]*>.*?</video>\s*", "", s, flags=re.S)
s, b = re.subn(r"<audio\b[^>]*>.*?</audio>\s*", "", s, flags=re.S)
open("patch.html", "w", encoding="utf-8").write(s)
print("removed", a, "video", b, "audio")
hf = os.path.abspath(os.path.join(ROOT, "..", "..", "node_modules", ".bin", "hyperframes.cmd"))
subprocess.run(f'"{hf}" render -c patch.html --quality delivery --start {st} --end {en} -o .patch.mp4', shell=True, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
f0, f1 = math.ceil(st * 30), math.ceil(en * 30)
# first patch frame can come out empty, so start one frame in; the shot's fade-in frame stays from the old picture
sk = 1
subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-i", ".render_picture.mp4", "-i", ".patch.mp4", "-filter_complex",
                f"[1:v]trim=start_frame={sk}:end_frame={f1 - f0},setpts=PTS-STARTPTS+{f0 + sk}/30/TB[p];[0:v][p]overlay=eof_action=pass:format=yuv420[o]", "-map", "[o]", "-an",
                "-c:v", "libx264", "-preset", "medium", "-crf", "16", "-pix_fmt", "yuv420p", "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-r", "30", ".render_picture_fixed.mp4"], check=True)
os.remove("patch.html")
print("patched frames", f0 + sk, "to", f1)
