"""Alien Anatoly code-only test: Blender toon figure loops on photo backgrounds, slow push, dip to black.
python make_test2.py  ->  look_test2.mp4"""
import subprocess, math
from pathlib import Path
from PIL import Image, ImageFilter, ImageDraw
FF = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Links\ffmpeg.exe"
W, H, FPS = 1920, 1080, 24
FADE = 0.7

def cover(path, s=1.08):
    im = Image.open(path).convert("RGB"); w, h = int(W * s), int(H * s)
    r = max(w / im.width, h / im.height); im = im.resize((math.ceil(im.width * r), math.ceil(im.height * r)), Image.LANCZOS)
    return im.crop(((im.width - w) // 2, (im.height - h) // 2, (im.width - w) // 2 + w, (im.height - h) // 2 + h))

def ink(fig, px=5):
    a = fig.getchannel("A").point(lambda v: 255 if v > 100 else 0)
    g = a.filter(ImageFilter.MaxFilter(2 * px + 1)).filter(ImageFilter.GaussianBlur(0.9))
    out = Image.new("RGBA", fig.size, (8, 14, 8, 0)); out.putalpha(g); out.alpha_composite(fig); return out

def char_shot(bg_path, frames_dir, secs, height=0.80, x=0.5, blur=2.5):
    bg = cover(bg_path).filter(ImageFilter.GaussianBlur(blur)).convert("RGBA")
    loop = sorted(Path(frames_dir).glob("*.png"))
    figs = [ink(Image.open(f).convert("RGBA")) for f in loop]
    bb = figs[0].getbbox()
    for f in figs[1:]:
        b = f.getbbox(); bb = (min(bb[0], b[0]), min(bb[1], b[1]), max(bb[2], b[2]), max(bb[3], b[3]))
    figs = [f.crop(bb) for f in figs]
    fh = int(bg.height * height); sc = fh / figs[0].height
    figs = [f.resize((int(f.width * sc), fh), Image.LANCZOS) for f in figs]
    fx = int(bg.width * x - figs[0].width / 2); fy = int(bg.height * 0.955) - fh
    sh = Image.new("RGBA", bg.size, (0, 0, 0, 0)); d = ImageDraw.Draw(sh)
    cxm = bg.width * x; d.ellipse((cxm - fh * 0.16, fy + fh - 18, cxm + fh * 0.16, fy + fh + 18), fill=(0, 0, 0, 120))
    sh = sh.filter(ImageFilter.GaussianBlur(14)); bg.alpha_composite(sh)
    n = round(secs * FPS)
    for i in range(n):
        fr = bg.copy(); fr.alpha_composite(figs[i % len(figs)], (fx, fy)); yield fr.convert("RGB"), i, n

def still_shot(path, secs):
    im = cover(path, 1.08); n = round(secs * FPS)
    for i in range(n): yield im, i, n

def frame_out(im, i, n):
    z = 1.0 + 0.045 * i / n                                  # slow push-in
    cw, ch = im.width / (1.08 * z) * 1.0, im.height / (1.08 * z)
    l, t = (im.width - cw) / 2, (im.height - ch) / 2
    f = im.resize((W, H), Image.BICUBIC, box=(l, t, l + cw, t + ch))
    k = min(1.0, (i + 1) / (FADE * FPS), (n - i) / (FADE * FPS))
    return Image.eval(f, lambda v: int(v * k)) if k < 1 else f

shots = [
    char_shot("corridor.jpg", "anim/breathe", 6.0, height=0.78, x=0.42, blur=2.0),
    char_shot("gym.jpg", "anim/raise_rep", 6.0, height=0.80, x=0.5, blur=3.0),
    still_shot("look_board.png", 5.0),
]
p = subprocess.Popen([FF, "-y", "-v", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                      "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", "look_test2.mp4"], stdin=subprocess.PIPE)
for s in shots:
    for im, i, n in s:
        p.stdin.write(frame_out(im, i, n).tobytes())
p.stdin.close(); p.wait(); print("ok look_test2.mp4")
