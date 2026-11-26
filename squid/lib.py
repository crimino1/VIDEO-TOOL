"""Helpers for the colossal squid film: clip trimming, layers, text and the 2D animated scenes.
All times passed in are film seconds; T() shifts them into the part being written."""
import glob, hashlib, json, math, os, random, subprocess
from pathlib import Path
from PIL import Image, ImageFilter, ImageEnhance

H = Path(__file__).parent
Image.MAX_IMAGE_PIXELS = None
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffmpeg.exe"
CLIPS = H / "assets" / "clips"; CLIPS.mkdir(parents=True, exist_ok=True)
IMG = H / "assets" / "img"
GEN = H / "assets" / "gen"; GEN.mkdir(parents=True, exist_ok=True)
MAP = json.load(open(H / "assets" / "map_south.json"))

ST = {"off": 0.0, "p0": 0.0, "p1": 1e9, "skip": False, "n": 10, "i": 0, "dur": {}}
html, tl, sfx_cues, usage = [], [], [], []


def s(t):
    if isinstance(t, (int, float)): return float(t)
    m, x = t.split(":")
    return int(m) * 60 + float(x)


def T(x): return f"{s(x) - ST['off']:.3f}"


def nid(p="e"):
    ST["i"] += 1
    return f"{p}{ST['i']}"


def add_tl(line):
    if not ST["skip"]: tl.append(line)


def tw(sel, to, t, d=0.6, frm=None, ease="power2.out"):
    to = dict(to); to.setdefault("duration", round(d, 3)); to.setdefault("ease", ease)
    j = lambda o: "{" + ",".join(f"{k}:{json.dumps(v) if isinstance(v, str) else v}" for k, v in o.items()) + "}"
    if frm is not None: add_tl(f'tl.fromTo("{sel}",{j(frm)},{j(to)},{T(t)});')
    else: add_tl(f'tl.to("{sel}",{j(to)},{T(t)});')


def sfx(name, t, vol=1.0):
    if not ST["skip"]: sfx_cues.append((s(t), name, vol))


# ---------------- media ----------------
def dur_of(p):
    if p not in ST["dur"]:
        out = subprocess.run([FF.replace("ffmpeg.exe", "ffprobe.exe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout
        ST["dur"][p] = float(out or 0)
    return ST["dur"][p]


def src_path(src):
    if src.startswith("p:"): return str(H / "assets" / "plates" / (src[2:] + ".mp4"))
    if src.startswith("yt:"): return str(H / "assets" / "raw" / "yt" / (src[3:] + ".mp4"))
    return str(H / "assets" / "raw" / (src + ".mp4"))


def trim(src, ss, d, speed=1.0, crop=None, flip=False, grade="", dark=0.0):
    """Cut one silent section at 1080p30. speed<1 slows down. crop=(x0,y0,x1,y1) fractions to drop logos or reframe."""
    p = src_path(src)
    if not os.path.exists(p):  # plate not rendered yet: stand-in so the rest can be checked
        p = src_path("px_snow_0")
    total = dur_of(p)
    need = d * speed
    if ss + need > total - 0.05:  # stretch or move in-point so the shot never runs out of source
        if need <= total - 0.1: ss = max(0, total - 0.1 - need)
        else: speed = (total - 0.2) / d; ss = 0.05; need = d * speed
    key = hashlib.md5(f"{p}{ss:.2f}{d:.2f}{speed:.3f}{crop}{flip}{grade}{dark}".encode()).hexdigest()[:8]
    out = CLIPS / f"{Path(p).stem}_{key}.mp4"
    usage.append((src, ss, need))
    if not out.exists():
        vf = []
        if crop: vf.append(f"crop=iw*{crop[2] - crop[0]:.4f}:ih*{crop[3] - crop[1]:.4f}:iw*{crop[0]:.4f}:ih*{crop[1]:.4f}")
        vf.append("scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080")
        if flip: vf.append("hflip")
        if speed != 1: vf.append(f"setpts=PTS/{speed:.4f}")
        vf.append("fps=30")
        if grade: vf.append(grade)
        if dark: vf.append(f"eq=brightness=-{dark:.2f}:contrast={1 + dark:.2f}")
        subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{need + 0.4:.3f}", "-i", p, "-an", "-vf", ",".join(vf),
                        "-t", f"{d + 0.2:.3f}", "-c:v", "libx264", "-preset", "fast", "-crf", "16", "-pix_fmt", "yuv420p", str(out)], check=True)
    return f"assets/clips/{out.name}"


def img(name):
    f = sorted(glob.glob(str(IMG / (name + ".*"))))
    f = [x for x in f if not x.endswith(".json") and not x.endswith(".log")]
    assert f, name
    return Path(f[0])


def gen_img(key, make):
    out = GEN / key
    if not out.exists(): make(out)
    return f"assets/gen/{key}"


def fitted(name, w, h, crop=None):
    """Photo resized for display, JPEG, optional crop fractions."""
    def mk(out):
        im = Image.open(img(name)).convert("RGB")
        if crop:
            W, Hh = im.size; im = im.crop((int(crop[0] * W), int(crop[1] * Hh), int(crop[2] * W), int(crop[3] * Hh)))
        im.thumbnail((w, h), Image.LANCZOS); im.save(out, quality=92)
    tag = hashlib.md5(f"{name}{w}{h}{crop}".encode()).hexdigest()[:6]
    return gen_img(f"{name}_{tag}.jpg", mk)


def blurbg(name, crop=None):
    def mk(out):
        im = Image.open(img(name)).convert("RGB")
        if crop:
            W, Hh = im.size; im = im.crop((int(crop[0] * W), int(crop[1] * Hh), int(crop[2] * W), int(crop[3] * Hh)))
        r = max(1920 / im.size[0], 1080 / im.size[1])
        im = im.resize((int(im.size[0] * r) + 1, int(im.size[1] * r) + 1), Image.LANCZOS)
        l, t = (im.size[0] - 1920) // 2, (im.size[1] - 1080) // 2
        im = im.crop((l, t, l + 1920, t + 1080)).filter(ImageFilter.GaussianBlur(40))
        ImageEnhance.Brightness(im).enhance(0.32).save(out, quality=88)
    tag = hashlib.md5(f"{name}{crop}".encode()).hexdigest()[:6]
    return gen_img(f"bg_{name}_{tag}.jpg", mk)


def cutout(name):
    """Blender cutout cropped to its bounding box. Returns (path, w, h)."""
    src = H / "blender" / "stills" / f"{name}.png"
    def mk(out):
        im = Image.open(src); im.crop(im.getbbox()).save(out)
    p = gen_img(f"cut_{name}.png", mk)
    w, h = Image.open(GEN / f"cut_{name}.png").size
    return p, w, h


def snow_layer(seed, n, rmax):
    def mk(out):
        rnd = random.Random(seed)
        im = Image.new("RGBA", (2200, 1400), (0, 0, 0, 0))
        from PIL import ImageDraw
        d = ImageDraw.Draw(im)
        for _ in range(n):
            x, y, r = rnd.uniform(0, 2200), rnd.uniform(0, 1400), rnd.uniform(0.6, rmax) ** 1.0
            a = int(rnd.uniform(40, 170))
            d.ellipse((x - r, y - r, x + r, y + r), fill=(200, 225, 255, a))
        im.filter(ImageFilter.GaussianBlur(0.6)).save(out)
    return gen_img(f"snow_{seed}.png", mk)


# ---------------- layers ----------------
def video(a, b, src, ss=0, speed=1.0, zoom=(1.0, 1.06), origin="50% 50%", crop=None, flip=False, grade="", dark=0.0, x=0, y=0, w=1920, h=1080, radius=0):
    ST["n"] += 1
    a, b = s(a), s(b)
    if ST["skip"]: return
    v, wr = nid("v"), nid("w")
    clip = trim(src, ss, b - a, speed, crop, flip, grade, dark)
    rad = f"border-radius:{radius}px;" if radius else ""
    html.append(f'<div id="{wr}" class="vw" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;z-index:{ST["n"]};{rad}"><video id="{v}" class="clip fit" src="{clip}" muted playsinline data-start="{T(a)}" data-duration="{b - a:.3f}" data-track-index="1" style="transform-origin:{origin}"></video></div>')
    if zoom and zoom[0] != zoom[1]:
        tw(f"#{v}", {"scale": zoom[1]}, a, b - a, {"scale": zoom[0]}, "none")


def layer(a, b, inner, cls=""):
    ST["n"] += 1
    if ST["skip"]: return
    a, b = s(a), s(b)
    html.append(f'<div id="{nid("s")}" class="clip scene {cls}" data-start="{T(a)}" data-duration="{b - a:.3f}" data-track-index="2" style="z-index:{ST["n"]}" data-layout-allow-overflow data-layout-allow-overlap>{inner}</div>')


def fade_in_black(a, d=1.5):
    eid = nid("k")
    tw(f"#{eid}", {"opacity": 0}, a, d, {"opacity": 1}, "power1.inOut")
    return f'<div id="{eid}" class="black"></div>'


def fade_out_black(t, d=0.6):
    eid = nid("k")
    tw(f"#{eid}", {"opacity": 1}, t, d, {"opacity": 0}, "power1.inOut")
    return f'<div id="{eid}" class="black" style="opacity:0"></div>'


def dim(o=0.45):
    return f'<div class="dim" style="opacity:{o}"></div>'


# ---------------- text ----------------
def stamp(text, t, end=None, y=900, size=76, x=None):
    eid = nid("t")
    pos = f"left:0;right:0;top:{y}px;text-align:center" if x is None else f"left:{x}px;top:{y}px"
    tw(f"#{eid}", {"opacity": 1, "y": 0}, t, 0.5, {"opacity": 0, "y": 18}, "power2.out")
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.35, 0.3)
    return f'<div class="row" style="{pos}"><span id="{eid}" class="stamp" style="font-size:{size}px">{text}</span></div>'


def label(text, t, x, y, side="left", end=None, size=50):
    """Red pointer triangle at (x, y) with one or two words beside it."""
    eid = nid("l")
    tri = '<i class="tri"></i>'
    inner = f'{tri}<span>{text}</span>' if side == "left" else f'<span>{text}</span>{tri}'
    style = f"left:{x}px;top:{y}px" if side == "left" else f"right:{1920 - x}px;top:{y}px"
    tw(f"#{eid}", {"opacity": 1, "x": 0}, t, 0.4, {"opacity": 0, "x": -20 if side == "left" else 20})
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.3, 0.25)
    return f'<div id="{eid}" class="label {side}" style="{style};font-size:{size}px">{inner}</div>'


def title(text, t, end=None, y=380, size=190, sub=None, sub_t=None):
    """Chapter-card style: very large white condensed type with a soft dark glow."""
    eid = nid("h")
    tw(f"#{eid}", {"opacity": 1, "scale": 1}, t, 0.9, {"opacity": 0, "scale": 1.06}, "power2.out")
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.75, 0.7, None, "power1.in")
    out = f'<div id="{eid}" class="chap" style="top:{y}px;font-size:{size}px">{text}</div>'
    if sub:
        sid = nid("h")
        tw(f"#{sid}", {"opacity": 1}, s(sub_t or s(t) + 1.2), 0.7, {"opacity": 0})
        if end: tw(f"#{sid}", {"opacity": 0}, s(end) - 0.75, 0.7)
        out += f'<div id="{sid}" class="chapsub" style="top:{y + size * 0.98:.0f}px">{sub}</div>'
    return out


def credit(text):
    return f'<div class="credit">{text}</div>'


# ---------------- backgrounds ----------------
def bg2d(a, b, tint="ocean"):
    """Deep-water backdrop for the 2D scenes: gradient plus two layers of drifting marine snow."""
    s1, s2 = snow_layer(1, 900, 1.6), snow_layer(2, 260, 3.0)
    i1, i2 = nid("sn"), nid("sn")
    tw(f"#{i1}", {"y": -90, "x": -20}, a, s(b) - s(a), {"y": 0, "x": 0}, "none")
    tw(f"#{i2}", {"y": -170, "x": 30}, a, s(b) - s(a), {"y": 0, "x": 0}, "none")
    g = {"ocean": "radial-gradient(ellipse 90% 80% at 50% 25%,#0d2a3b 0%,#061520 45%,#02070c 100%)",
         "dark": "radial-gradient(ellipse 80% 70% at 50% 40%,#08161f 0%,#03080d 60%,#010203 100%)",
         "warm": "radial-gradient(ellipse 80% 70% at 50% 40%,#2a1810 0%,#120a07 60%,#050302 100%)"}[tint]
    return (f'<div class="bg2" style="background:{g}"></div><img id="{i1}" class="snow" src="{s1}" alt="">'
            f'<img id="{i2}" class="snow" src="{s2}" alt="" style="opacity:.55">')


def photo(a, b, name, zoom=(1.0, 1.08), origin="50% 50%", crop=None, mode="fill", caption=None):
    """A still photo as a shot. fill: covers the frame. card: framed card over its own blurred, darkened copy."""
    a, b = s(a), s(b)
    eid = nid("ph")
    tw(f"#{eid}", {"scale": zoom[1]}, a, b - a, {"scale": zoom[0]}, "none")
    if mode == "fill":
        p = fitted(name, 2400, 1600, crop)
        return f'<img id="{eid}" class="fill" src="{p}" alt="{name}" style="transform-origin:{origin}">'
    p = fitted(name, 1700, 900, crop)
    w, hh = Image.open(H / p).size
    sc = min(1500 / w, 860 / hh, 1.5 * 1700 / max(w, 1) if w < 1000 else 9)
    sc = min(sc, 1500 / w, 860 / hh)
    w, hh = int(w * sc), int(hh * sc)
    return (f'<img class="fill" src="{blurbg(name, crop)}" alt="">'
            f'<div id="{eid}" class="card" style="left:{(1920 - w) // 2}px;top:{(1080 - hh) // 2 - 10}px;width:{w}px;height:{hh}px"><img src="{p}" alt="{name}" style="width:{w}px;height:{hh}px"></div>')


# ---------------- SVG drawings ----------------
HUMAN = ("M0,-100 a11,11 0 1,1 0.1,0 Z M-9,-86 L9,-86 Q19,-84 20,-72 L23,-44 Q23,-40 19,-40 L16,-40 L14,-66 L12,-40 L13,0 L5,0 L2,-36 L-2,-36 L-5,0 L-13,0 L-12,-40 L-14,-66 L-16,-40 L-19,-40 Q-23,-40 -23,-44 L-20,-72 Q-19,-84 -9,-86 Z")


def human(x, y, height_px, color="#d9e6ee", op=0.9):
    k = height_px / 111.0
    return f'<path d="{HUMAN}" transform="translate({x},{y}) scale({k:.4f})" fill="{color}" opacity="{op}"/>'


SPERM = ("M0,0 C10,-34 40,-58 120,-62 L330,-64 C420,-66 520,-60 600,-44 C680,-30 760,-14 830,-6 L870,-34 C878,-40 892,-38 888,-28 L872,4 L890,30 "
         "C894,40 880,42 872,36 L832,8 C760,14 680,28 600,38 C520,48 420,58 330,60 L150,60 C120,60 100,54 92,44 L40,44 C20,44 6,30 0,0 Z")


def sperm_svg(x, y, length_px, color="#20282e", op=1.0, flip=False, extra=""):
    k = length_px / 890.0
    sx = -k if flip else k
    return f'<path d="{SPERM}" transform="translate({x},{y}) scale({sx:.4f},{k:.4f})" fill="{color}" opacity="{op}" {extra}/>'


def eye_svg(cx, cy, r, iris="#7f97a6", glow=False):
    """A realistic-ish eye disk: dark sclera, silver iris ring with streaks, black pupil, wet highlight."""
    g = nid("eg")
    streaks = "".join(f'<line x1="{cx + r * .5 * math.cos(a):.1f}" y1="{cy + r * .5 * math.sin(a):.1f}" x2="{cx + r * .78 * math.cos(a):.1f}" y2="{cy + r * .78 * math.sin(a):.1f}" stroke="#1d2a33" stroke-width="{max(1, r / 60):.1f}" opacity=".5"/>'
                      for a in [i * math.tau / 48 for i in range(48)])
    return (f'<defs><radialGradient id="{g}" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#000"/><stop offset=".48" stop-color="#05080a"/>'
            f'<stop offset=".52" stop-color="{iris}"/><stop offset=".78" stop-color="#3b4b55"/><stop offset=".86" stop-color="#1a1210"/><stop offset="1" stop-color="#2a0c0a"/></radialGradient></defs>'
            f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#{g})"/>{streaks}'
            f'<ellipse cx="{cx - r * .32:.1f}" cy="{cy - r * .36:.1f}" rx="{r * .16:.1f}" ry="{r * .10:.1f}" fill="#fff" opacity=".55" transform="rotate(-30 {cx - r * .32:.1f} {cy - r * .36:.1f})"/>')
