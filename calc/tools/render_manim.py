"""Render Manim shots in parallel. Usage: render_manim.py [--low] [--jobs N] [Name ...]
Output: assets/manim/<Name>.mp4 (full) or assets/manim_low/<Name>.mp4 (854x480, 15 fps, for checking)."""
import os, re, shutil, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MDIR = os.path.join(ROOT, "manim")
sys.path.insert(0, ROOT)
from shots import SHOTS

FFBIN = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
MANIM = os.path.abspath(os.path.join(ROOT, "..", ".venv", "Scripts", "manim.exe"))

sys.stdout.reconfigure(encoding="utf-8", errors="replace")
args = sys.argv[1:]
low = "--low" in args
if low: args.remove("--low")
jobs = 8
if "--jobs" in args:
    i = args.index("--jobs"); jobs = int(args[i + 1]); del args[i:i + 2]

where = {}
for f in sorted(os.listdir(MDIR)):
    if f.startswith("s") and f[1:2].isdigit() and f.endswith(".py"):
        for c in re.findall(r"^class (\w+)\(Shot\)", open(os.path.join(MDIR, f), encoding="utf-8").read(), re.M):
            where[c] = f
names = args or [s["name"] for s in SHOTS if s["kind"] == "m"]
missing = [n for n in names if n not in where]
if missing:
    print("NOT WRITTEN:", missing)
names = [n for n in names if n in where]
out_dir = os.path.join(ROOT, "assets", "manim_low" if low else "manim")
os.makedirs(out_dir, exist_ok=True)
env = dict(os.environ, PATH=FFBIN + os.pathsep + os.environ["PATH"], PYTHONUTF8="1", PYTHONIOENCODING="utf-8")


def run(n):
    t0 = time.time()
    res = ["-r", "854,480", "--fps", "15"] if low else ["-r", "1920,1080", "--fps", "30"]
    media = os.path.join(MDIR, "media_low" if low else "media", n)
    cp = subprocess.run([MANIM, "render", *res, "--disable_caching", "--progress_bar", "none", "--media_dir", media, where[n], n],
                        cwd=MDIR, env=env, capture_output=True, text=True, encoding="utf-8", errors="replace")
    log = cp.stdout + cp.stderr
    late = [l.strip() for l in log.splitlines() if l.startswith("!!") or " !! " in l]
    found = None
    for dp, _, fs in os.walk(media):
        if n + ".mp4" in fs and "partial" not in dp:
            found = os.path.join(dp, n + ".mp4")
    if cp.returncode or not found:
        open(os.path.join(MDIR, n + ".err.log"), "w", encoding="utf-8").write(log)
        tail = [l for l in log.splitlines() if l.strip()][-4:]
        return f"FAIL {n} ({cp.returncode}): " + " | ".join(x.strip()[:150] for x in tail)
    shutil.copyfile(found, os.path.join(out_dir, n + ".mp4"))
    shutil.rmtree(media, ignore_errors=True)
    return f"ok {n} {time.time() - t0:.0f}s " + " ".join(late)


with ThreadPoolExecutor(jobs) as ex:
    for r in ex.map(run, names):
        print(r, flush=True)
