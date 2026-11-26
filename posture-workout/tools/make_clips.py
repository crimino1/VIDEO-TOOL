"""Composite each rendered exercise loop over the background photo (with a soft chair/feet shadow), then make
a 42 s work clip and a 15 s preview clip per exercise, plus intro/outro stills.
python tools/make_clips.py"""
import json, subprocess, sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "blender"))
ROOT = Path(__file__).resolve().parents[1]
CW = ROOT.parent / "chair-workout"
FR = ROOT / "frames"; OUT = ROOT / "edit" / "assets" / "clips"; OUT.mkdir(parents=True, exist_ok=True)
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
W, H = 1920, 1080
WORK, REST = 55, 15
# read the exercise table without importing Blender modules
standing = {'standing_w_hold': True}
BG = "office_0.jpg"
ORDER = ['shoulder_rolls_p', 'chin_tucks_p', 'neck_tilt_p', 'cat_cow_p', 'blade_squeeze_p', 'wall_slides', 'chest_opener_p', 'back_extension', 'reverse_fly_p', 'clasp_back', 'overhead_reach_p', 'standing_w_hold']

def background(frame_png, out_png):
    bg = Image.open(ROOT / "assets" / "img" / BG).convert("RGB")
    s = max(W / bg.width, H / bg.height) * 1.12
    bg = bg.resize((round(bg.width * s), round(bg.height * s)), Image.LANCZOS)
    ox = (bg.width - W) // 2; oy = bg.height - H
    bg = bg.crop((ox, oy, ox + W, oy + H)).filter(ImageFilter.GaussianBlur(2.5))
    bg = ImageEnhance.Brightness(bg).enhance(0.88)
    a = Image.open(frame_png).getchannel("A"); x0, y0, x1, y1 = a.getbbox()
    sh = Image.new("L", (W, H), 0); d = ImageDraw.Draw(sh)
    cx, cy, rw = (x0 + x1) / 2 - 10, y1 - 30, (x1 - x0) * 0.26
    d.ellipse([cx - rw, cy - 30, cx + rw, cy + 28], fill=165)
    sh = sh.filter(ImageFilter.GaussianBlur(24))
    bg = Image.composite(Image.new("RGB", (W, H), (28, 14, 6)), bg, sh)
    bg.save(out_png, quality=95)

def run(*a):
    r = subprocess.run([FF, "-nostdin", "-v", "error", "-y", *map(str, a)], capture_output=True, text=True)
    if r.returncode: print(r.stderr[-500:]); raise SystemExit(1)

# backgrounds per camera (shadow placed from a seated / standing frame)
bg_seated = OUT / "bg_seated.jpg"; bg_standing = OUT / "bg_standing.jpg"
background(FR / "idle" / "0000.png", bg_seated)
background(FR / next(k for k in ORDER if standing.get(k)) / "0000.png", bg_standing) if standing else None
# plain blurred backdrop for rest screens
ImageEnhance.Brightness(Image.open(bg_seated).filter(ImageFilter.GaussianBlur(14))).enhance(0.6).save(OUT / "bg_rest.jpg", quality=92)

meta = {}
for name in ORDER + ["idle"]:
    frames = sorted((FR / name).glob("*.png"))
    if not frames: print("MISSING", name); continue
    bg = bg_standing if standing.get(name) else bg_seated
    loop = OUT / f"{name}_loop.mp4"
    if name == "idle":
        im = Image.open(bg).convert("RGBA"); im.alpha_composite(Image.open(frames[0]).convert("RGBA")); im.convert("RGB").save(OUT / "idle.jpg", quality=95)
        continue
    run("-loop", 1, "-framerate", 30, "-i", bg, "-framerate", 30, "-i", FR / name / "%04d.png",
        "-filter_complex", "[0][1]overlay=0:0:shortest=1,format=yuv420p", "-c:v", "libx264", "-crf", 17, "-preset", "medium", "-r", 30, loop)
    run("-stream_loop", -1, "-i", loop, "-t", WORK, "-c:v", "libx264", "-crf", 18, "-preset", "medium", "-r", 30, "-an", OUT / f"{name}_work.mp4")
    run("-stream_loop", -1, "-i", loop, "-t", REST, "-vf", "scale=1152:648", "-c:v", "libx264", "-crf", 20, "-preset", "medium", "-r", 30, "-an", OUT / f"{name}_next.mp4")
    meta[name] = len(frames)
    print("clip", name, len(frames), "frames")
(OUT / "clips.json").write_text(json.dumps(meta, indent=1))
print("CLIPS DONE")
# live intro background: the march loop, 40 s
run("-stream_loop", -1, "-i", OUT / f"{ORDER[0]}_loop.mp4", "-t", 40, "-c:v", "libx264", "-crf", 18, "-preset", "medium", "-r", 30, "-an", OUT / "intro_live.mp4")
print("INTRO DONE")
