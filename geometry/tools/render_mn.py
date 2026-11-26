"""Render Manim shots in parallel: render_mn.py [--low] [Name ...] -> stock/raw/mn_<Name>.mp4 (1920x1080 30fps)."""
import os, subprocess, sys, shutil, re
from concurrent.futures import ThreadPoolExecutor
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MDIR = os.path.join(ROOT, "manim")
FFBIN = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
MANIM = os.path.abspath(os.path.join(ROOT, "..", ".venv", "Scripts", "manim.exe"))
args = sys.argv[1:]; low = "--low" in args
args = [a for a in args if a != "--low"]
names = args or re.findall(r"^class (\w+)\(Shot\)", open(os.path.join(MDIR, "scenes.py"), encoding="utf-8").read(), re.M)
env = dict(os.environ, PATH=FFBIN + os.pathsep + os.environ["PATH"], PYTHONUTF8="1", PYTHONIOENCODING="utf-8", PYTHONPATH=ROOT + os.pathsep + MDIR)
out = os.path.join(ROOT, "stock", "raw" if not low else "mn_low"); os.makedirs(out, exist_ok=True)


def run(n):
    media = os.path.join(MDIR, "media_low" if low else "media", n)
    res = ["-r", "854,480", "--fps", "15"] if low else ["-r", "1920,1080", "--fps", "30"]
    r = subprocess.run([MANIM, "render", "--disable_caching", "--media_dir", media, *res, "-o", n, os.path.join(MDIR, "scenes.py"), n],
                       cwd=MDIR, env=env, capture_output=True, text=True, encoding="utf-8", errors="replace")
    vids = [os.path.join(dp, f) for dp, _, fs in os.walk(media) for f in fs if f == n + ".mp4"]
    if r.returncode or not vids:
        return f"FAIL {n}\n" + (r.stderr or r.stdout)[-1500:]
    shutil.copy(vids[0], os.path.join(out, f"mn_{n}.mp4"))
    return f"ok {n}"


with ThreadPoolExecutor(6) as ex:
    for line in ex.map(run, names): print(line, flush=True)
