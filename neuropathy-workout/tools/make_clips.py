"""Composite each rendered exercise loop (real shadows from the render) over the background photo, then make
a 42 s work clip and a 15 s preview clip per exercise, plus intro/outro stills.
python tools/make_clips.py"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance, ImageOps
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "blender"))
ROOT = Path(__file__).resolve().parents[1]
CW = ROOT.parent / "chair-workout"
FR = ROOT / "frames"; OUT = ROOT / "edit" / "assets" / "clips"; OUT.mkdir(parents=True, exist_ok=True)
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
W, H = 1920, 1080
WORK, REST = 40, 12
# read the exercise table without importing Blender modules
MODE = {'seated_heel_toe': 'c', 'ankle_circles_n': 'c', 'calf_raise_n': 's', 'toe_raise': 's', 'standing_march_n': 's', 'ankle_pumps': 'f', 'heel_slides': 'f', 'leg_raise_flex': 'f'}
standing = {k: v == 's' for k, v in MODE.items()}
FLOOR_DX = -150   # floor moves sit left so the feet clear the meter panel
BG = "nf_b_2.jpg"
ORDER = ['seated_heel_toe', 'ankle_circles_n', 'calf_raise_n', 'toe_raise', 'standing_march_n', 'ankle_pumps', 'heel_slides', 'leg_raise_flex']

MIRROR = False
BGCFG = {"c": (1.12, 0.5), "s": (1.12, 0.5), "f": (1.6, 0.0)}   # zoom, horizontal crop position per pose type
def background(frame_png, out_png, mode="c"):
    zoom, fx = BGCFG[mode]
    bg = Image.open(ROOT / "assets" / "img" / BG).convert("RGB")
    if MIRROR: bg = ImageOps.mirror(bg)
    s = max(W / bg.width, H / bg.height) * zoom
    bg = bg.resize((round(bg.width * s), round(bg.height * s)), Image.LANCZOS)
    ox = int((bg.width - W) * fx); oy = bg.height - H
    bg = bg.crop((ox, oy, ox + W, oy + H)).filter(ImageFilter.GaussianBlur(2.5))
    bg = ImageEnhance.Brightness(bg).enhance(0.9)
    bg.save(out_png, quality=95)

def run(*a):
    r = subprocess.run([FF, "-nostdin", "-v", "error", "-y", *map(str, a)], capture_output=True, text=True)
    if r.returncode: print(r.stderr[-500:]); raise SystemExit(1)

# backgrounds per camera (shadow placed from a seated / standing frame)
bg_seated = OUT / "bg_seated.jpg"; bg_standing = OUT / "bg_standing.jpg"; bg_floor = OUT / "bg_floor.jpg"
background(None, bg_seated, "c"); background(None, bg_standing, "s"); background(None, bg_floor, "f")
# plain blurred backdrop for rest screens
ImageEnhance.Brightness(Image.open(bg_seated).filter(ImageFilter.GaussianBlur(14))).enhance(0.6).save(OUT / "bg_rest.jpg", quality=92)

meta = {}
# outro still: the idle pose if rendered (seated), else the first frame of the first move
idle_src = FR / "idle" / "0000.png" if (FR / "idle" / "0000.png").exists() else sorted((FR / ORDER[0]).glob("*.png"))[0]
im = Image.open(bg_seated if idle_src.parent.name == "idle" else bg_standing).convert("RGBA"); im.alpha_composite(Image.open(idle_src).convert("RGBA")); im.convert("RGB").save(OUT / "idle.jpg", quality=95)
for name in ORDER:
    frames = sorted((FR / name).glob("*.png"))
    if not frames: print("MISSING", name); continue
    md = MODE.get(name, "c")
    bg = {"s": bg_standing, "f": bg_floor}.get(md, bg_seated)
    dx = FLOOR_DX if md == "f" else 0
    loop = OUT / f"{name}_loop.mp4"
    if name == "idle":
        continue
    run("-loop", 1, "-framerate", 30, "-i", bg, "-framerate", 30, "-i", FR / name / "%04d.png",
        "-filter_complex", f"[0][1]overlay={dx}:0:shortest=1,format=yuv420p", "-c:v", "libx264", "-crf", 17, "-preset", "medium", "-r", 30, loop)
    run("-stream_loop", -1, "-i", loop, "-t", WORK, "-c:v", "libx264", "-crf", 18, "-preset", "medium", "-r", 30, "-an", OUT / f"{name}_work.mp4")
    run("-stream_loop", -1, "-i", loop, "-t", REST, "-vf", "scale=1152:648", "-c:v", "libx264", "-crf", 20, "-preset", "medium", "-r", 30, "-an", OUT / f"{name}_next.mp4")
    meta[name] = len(frames)
    print("clip", name, len(frames), "frames")
(OUT / "clips.json").write_text(json.dumps(meta, indent=1))
print("CLIPS DONE")
# live intro background: the march loop, 40 s
run("-stream_loop", -1, "-i", OUT / f"{ORDER[0]}_loop.mp4", "-t", 40, "-c:v", "libx264", "-crf", 18, "-preset", "medium", "-r", 30, "-an", OUT / "intro_live.mp4")
print("INTRO DONE")
