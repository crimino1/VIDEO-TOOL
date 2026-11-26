"""Outside Lay space style helpers: 3D shots (assets/js/space.js), navy 2D infographics, photos and clips.
Times passed in are film seconds (or "m:ss.ss" strings, or ("word", after) lookups); T() shifts them into the part being written."""
import glob, hashlib, json, math, os, random, re, subprocess
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

H = Path(__file__).parent
Image.MAX_IMAGE_PIXELS = None
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
FP = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffprobe.exe"
CLIPS = H / "assets" / "clips"; CLIPS.mkdir(parents=True, exist_ok=True)
IMG = H / "assets" / "img"
GEN = H / "assets" / "gen"; GEN.mkdir(parents=True, exist_ok=True)
WORDS = json.load(open(H / "words.json", encoding="utf-8"))["words"]

ST = {"off": 0.0, "skip": False, "n": 10, "i": 0, "dur": {}}
html, tl, sps, sfx_cues, usage = [], [], [], [], []

NAVY, VIOLET, NEON, PINK, ORANGE, GREY, RING = "#000e26", "#6f1cee", "#deef45", "#ff2d55", "#f7941d", "#e6e6e6", "#5c6472"


def s(t):
    if isinstance(t, (int, float)): return float(t)
    if isinstance(t, tuple): return w(*t)
    m, x = t.split(":")
    return int(m) * 60 + float(x)


def w(word, after=0.0, end=False):
    """Start (or end) time of the first spoken word matching `word` at or after `after`."""
    after = s(after); key = re.sub(r"[^a-z0-9%]", "", word.lower())
    for x in WORDS:
        if x["start"] >= after - 0.05 and re.sub(r"[^a-z0-9%]", "", x["word"].lower()).startswith(key):
            return x["end"] if end else x["start"]
    raise KeyError(f"word {word!r} after {after}")


def T(x): return f"{s(x) - ST['off']:.3f}"


def nid(p="e"):
    ST["i"] += 1
    return f"{p}{ST['i']}"


def add_tl(line):
    if not ST["skip"]: tl.append(line)


def js(o):
    return "{" + ",".join(f"{k}:{json.dumps(v) if isinstance(v, str) else (json.dumps(v) if isinstance(v, (list, dict, bool)) else v)}" for k, v in o.items()) + "}"


def tw(sel, to, t, d=0.6, frm=None, ease="power2.out"):
    to = dict(to); to.setdefault("duration", round(d, 3)); to.setdefault("ease", ease)
    if frm is not None: add_tl(f'tl.fromTo("{sel}",{js(frm)},{js(to)},{T(t)});')
    else: add_tl(f'tl.to("{sel}",{js(to)},{T(t)});')


def sfx(name, t, vol=1.0):
    if not ST["skip"]: sfx_cues.append((round(s(t), 3), name, vol))


# ---------------- 3D ----------------
def G3(a, b, kind, **o):
    a, b = s(a), s(b)
    if ST["skip"]: return
    def conv(v):
        if isinstance(v, str) and ":" in v: return round(s(v) - a, 3)
        if isinstance(v, tuple) and len(v) == 2 and isinstance(v[0], str): return round(s(v) - a, 3)
        if isinstance(v, list): return [conv(x) for x in v]
        if isinstance(v, dict): return {k: conv(x) for k, x in v.items()}
        return v
    sps.append([round(a - ST["off"], 3), round(b - ST["off"], 3), kind, conv(o)])


# ---------------- media ----------------
def dur_of(p):
    if p not in ST["dur"]:
        out = subprocess.run([FP, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", p], capture_output=True, text=True).stdout
        ST["dur"][p] = float(out or 0)
    return ST["dur"][p]


def src_path(src):
    return str(H / "assets" / "raw" / (src + ".mp4"))


def trim(src, ss, d, speed=1.0, crop=None, grade=""):
    p = src_path(src)
    if not os.path.exists(p): raise SystemExit("MISSING clip " + src)
    total = dur_of(p); need = d * speed
    if ss + need > total - 0.05:
        if need <= total - 0.1: ss = max(0, total - 0.1 - need)
        else: speed = (total - 0.2) / d; ss = 0.05; need = d * speed
    key = hashlib.md5(f"{p}{ss:.2f}{d:.2f}{speed:.3f}{crop}{grade}".encode()).hexdigest()[:8]
    out = CLIPS / f"{Path(p).stem}_{key}.mp4"
    usage.append((src, ss, need))
    if not out.exists():
        vf = []
        tr = subprocess.run([FP, "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=color_transfer", "-of", "csv=p=0", p], capture_output=True, text=True).stdout.strip()
        if tr.split(",")[0].strip() in ("arib-std-b67", "smpte2084"):
            vf.append("zscale=t=linear:npl=100,format=gbrpf32le,zscale=p=bt709,tonemap=hable:desat=0,zscale=t=bt709:m=bt709:r=tv,format=yuv420p")
        if crop: vf.append(f"crop=iw*{crop[2] - crop[0]:.4f}:ih*{crop[3] - crop[1]:.4f}:iw*{crop[0]:.4f}:ih*{crop[1]:.4f}")
        vf.append("scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080")
        if speed != 1: vf.append(f"setpts=PTS/{speed:.4f}")
        vf.append("fps=30")
        if grade: vf.append(grade)
        subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{ss:.3f}", "-t", f"{need + 0.6:.3f}", "-i", p, "-an", "-vf", ",".join(vf),
                        "-t", f"{d + 0.8:.3f}", "-c:v", "libx264", "-preset", "fast", "-crf", "17", "-pix_fmt", "yuv420p",
                        "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", str(out)], check=True)
    return f"assets/clips/{out.name}"


def img(name):
    f = [x for x in sorted(glob.glob(str(IMG / (name + ".*")))) if not x.endswith((".json", ".log"))]
    assert f, "missing image " + name
    return Path(f[0])


def gen_img(key, make):
    out = GEN / key
    if not out.exists(): make(out)
    return f"assets/gen/{key}"


def fitted(name, w_, h_, crop=None, grey=False):
    def mk(out):
        im = Image.open(img(name)).convert("RGB")
        if crop:
            W, Hh = im.size; im = im.crop((int(crop[0] * W), int(crop[1] * Hh), int(crop[2] * W), int(crop[3] * Hh)))
        if grey: im = im.convert("L").convert("RGB")
        r = max(w_ / im.size[0], h_ / im.size[1], 0)
        if r > 1 or im.size[0] > w_ * 1.3: im = im.resize((max(1, int(im.size[0] * r)), max(1, int(im.size[1] * r))), Image.LANCZOS)
        im.save(out, quality=92)
    tag = hashlib.md5(f"{name}{w_}{h_}{crop}{grey}".encode()).hexdigest()[:6]
    return gen_img(f"{name}_{tag}.jpg", mk)


def dust(seed=1, n=420):
    """Sparse faint star dust for the navy 2D background."""
    def mk(out):
        rnd = random.Random(seed); im = Image.new("RGBA", (2040, 1200), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        for _ in range(n):
            x, y, r = rnd.uniform(0, 2040), rnd.uniform(0, 1200), rnd.uniform(0.5, 1.5)
            d.ellipse((x - r, y - r, x + r, y + r), fill=(200, 215, 255, int(rnd.uniform(25, 120))))
        im.save(out)
    return gen_img(f"dust_{seed}_{n}.png", mk)


# ---------------- layers ----------------
def layer(a, b, inner, fin=0.45, fout=0.0, z=None, cls=""):
    """A timed full-frame layer. Its child fades in over `fin` and (if fout) out over its last `fout` seconds."""
    ST["n"] += 1
    if ST["skip"]: return
    a, b = s(a), s(b)
    cid = nid("c")
    html.append(f'<div id="{nid("s")}" class="clip scene {cls}" data-start="{T(a)}" data-duration="{b - a:.3f}" data-track-index="2" style="z-index:{z or ST["n"]}" '
                f'data-layout-allow-overflow data-layout-allow-overlap><div id="{cid}" class="scene">{inner}</div></div>')
    if fin: tw(f"#{cid}", {"opacity": 1}, a, fin, {"opacity": 0}, "power1.inOut")
    if fout: tw(f"#{cid}", {"opacity": 0}, b - fout, fout, None, "power1.inOut")


def navy(a, b, seed=1, drift=True):
    i = nid("du")
    if drift: tw(f"#{i}", {"x": -40, "y": -14}, a, s(b) - s(a), {"x": 0, "y": 0}, "none")
    return f'<div class="navy"></div><img id="{i}" class="dust" src="{dust(seed)}" alt="">'


def video_html(a, b, src, ss=0, speed=1.0, zoom=(1.0, 1.06), crop=None, grade="", origin="50% 50%"):
    a, b = s(a), s(b)
    v = nid("v")
    clip = trim(src, ss, b - a, speed, crop, grade)
    html.append(f'<video id="{v}" class="clip fill" src="{clip}" muted playsinline data-start="{T(a)}" data-duration="{b - a:.3f}" data-track-index="1" '
                f'style="z-index:{ST["n"]};transform-origin:{origin}"></video>')
    if zoom and zoom[0] != zoom[1]: tw(f"#{v}", {"scale": zoom[1]}, a, b - a, {"scale": zoom[0]}, "none")
    return v


def photo_html(a, b, name, zoom=(1.0, 1.08), origin="50% 50%", crop=None, mode="fill", bg="black", grey=False, maxw=1500, maxh=860):
    """fill: covers the frame with a slow push. card: white-bordered card centred on black or navy."""
    a, b = s(a), s(b)
    eid = nid("ph")
    tw(f"#{eid}", {"scale": zoom[1]}, a, b - a, {"scale": zoom[0]}, "none")
    if mode == "fill":
        p = fitted(name, 2200, 1240, crop, grey)
        return f'<img id="{eid}" class="fill" src="{p}" alt="{name}" style="transform-origin:{origin}">'
    p = fitted(name, maxw, maxh, crop, grey)
    W_, H_ = Image.open(H / p).size
    k = min(maxw / W_, maxh / H_); W_, H_ = int(W_ * k), int(H_ * k)
    back = navy(a, b) if bg == "navy" else '<div class="black"></div>'
    return (back + f'<div id="{eid}" class="card" style="left:{(1920 - W_) // 2}px;top:{(1080 - H_) // 2}px;width:{W_}px;height:{H_}px;opacity:1">'
            f'<img src="{p}" alt="{name}"></div>')


def credit(text):
    return f'<div class="credit">{text}</div>'


# ---------------- text ----------------
def hdr(text, t, end=None, center=False, y=None, right=False):
    eid = nid("h")
    tw(f"#{eid}", {"opacity": 1, "x": 0}, t, 0.45, {"opacity": 0, "x": -24})
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.35, 0.3)
    st = f' style="top:{y}px"' if y else ""
    return f'<div id="{eid}" class="hdr{" c" if center else ""}{" r" if right else ""}"{st}>{text}</div>'


def stmt(text, t, end=None, y=900, white=False, size=76, left=None, width=None, align="center"):
    eid = nid("t")
    xs = "" if left is None else f"left:{left}px;right:auto;width:{width}px;text-align:{align};"
    tw(f"#{eid}", {"opacity": 1, "y": 0}, t, 0.45, {"opacity": 0, "y": 20})
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.35, 0.3)
    return f'<div id="{eid}" class="stmt{" w" if white else ""}" style="{xs}top:{y}px;font-size:{size}px">{text}</div>'


def num(n0, n1, unit, t, x=None, y=880, count=1.2, end=None, dec=0, prefix="", suffix="", size=96):
    """Big neon number that counts n0 -> n1 with a small caps unit after it. x=None centres it."""
    eid, nid_ = nid("n"), nid("nv")
    pos = f"left:{x}px;top:{y}px" if x is not None else f"left:0;right:0;top:{y}px;justify-content:center"
    tw(f"#{eid}", {"opacity": 1, "y": 0}, t, 0.4, {"opacity": 0, "y": 16})
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.35, 0.3)
    fmt = f'(Math.round(v*{10 ** dec})/{10 ** dec}).toLocaleString("en-US",{{minimumFractionDigits:{dec},maximumFractionDigits:{dec}}})'
    if n0 != n1:
        add_tl(f'tl.fromTo({{v:{n0}}},{{v:{n0}}},{{v:{n1},duration:{count},ease:"power2.out",onUpdate:function(){{var v=this.targets()[0].v;document.getElementById("{nid_}").textContent="{prefix}"+{fmt}+"{suffix}";}}}},{T(t)});')
    shown = f"{prefix}{n1:,.{dec}f}{suffix}" if n0 == n1 else f"{prefix}{n0:,.{dec}f}{suffix}"
    return f'<div id="{eid}" class="num" style="{pos}"><b id="{nid_}" style="font-size:{size}px">{shown}</b><span>{unit}</span></div>'


def lab(text, t, x, y, end=None, white=False, size=22, anchor="left"):
    eid = nid("l")
    tw(f"#{eid}", {"opacity": 1}, t, 0.35, {"opacity": 0})
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.3, 0.25)
    tf = {"left": "", "center": "transform:translateX(-50%);", "right": "transform:translateX(-100%);"}[anchor]
    return f'<div class="lab{" w" if white else ""}" style="left:{x}px;top:{y}px;font-size:{size}px;{tf}"><span id="{eid}" style="display:inline-block;opacity:0">{text}</span></div>'


def box(text, t, x, y, end=None, kind="", anchor="left"):
    eid = nid("b")
    tw(f"#{eid}", {"opacity": 1, "scale": 1}, t, 0.3, {"opacity": 0, "scale": 0.9})
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.3, 0.25)
    tf = {"left": "", "center": "transform:translateX(-50%);", "right": "transform:translateX(-100%);"}[anchor]
    return f'<div style="position:absolute;left:{x}px;top:{y}px;{tf}"><div id="{eid}" class="box {kind}" style="position:relative">{text}</div></div>'


# ---------------- SVG pieces (all animate in at t) ----------------
def svg(inner):
    return f'<svg class="full" viewBox="0 0 1920 1080">{inner}</svg>'


def ring(cx, cy, r, t, d=1.0, col=RING, sw=2, op=1.0, dash=None, end=None, ry=None):
    """Circle (or ellipse) outline that draws itself in."""
    eid = nid("r"); ry = ry or r
    L = 2 * math.pi * math.sqrt((r * r + ry * ry) / 2)
    tw(f"#{eid}", {"strokeDashoffset": 0}, t, d, {"strokeDashoffset": L}, "power2.inOut")
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.3, 0.3)
    da = f'stroke-dasharray="{L:.1f}"' if not dash else f'stroke-dasharray="{dash}"'
    if dash: tw(f"#{eid}", {"opacity": op}, t, d, {"opacity": 0})
    return f'<ellipse id="{eid}" cx="{cx}" cy="{cy}" rx="{r}" ry="{ry}" fill="none" stroke="{col}" stroke-width="{sw}" opacity="{op if not dash else 0}" {da} stroke-dashoffset="{0 if dash else L:.1f}"/>'


def disk(cx, cy, r, t, col=VIOLET, d=0.6, end=None, text=None, tcol="#fff", tsize=None, op=1.0, stroke=None):
    """Filled circle that scales up from its centre, with optional mono text in it."""
    gid = nid("d")
    tw(f"#{gid}", {"scale": 1, "opacity": op}, t, d, {"scale": 0, "opacity": 0}, "back.out(1.4)")
    if end: tw(f"#{gid}", {"opacity": 0, "scale": 0.8}, s(end) - 0.35, 0.3, None, "power2.in")
    st = f' stroke="{stroke}" stroke-width="4"' if stroke else ""
    tx = (f'<text x="{cx}" y="{cy}" text-anchor="middle" dominant-baseline="central" font-family="Space Mono" font-size="{tsize or max(14, r * 0.28):.0f}" '
          f'letter-spacing="2" fill="{tcol}">{text}</text>') if text else ""
    return f'<g id="{gid}" style="transform-origin:{cx}px {cy}px;transform-box:view-box" opacity="0"><circle cx="{cx}" cy="{cy}" r="{r}" fill="{col}"{st}/>{tx}</g>'


def line(x1, y1, x2, y2, t, d=0.8, col=NEON, sw=3, end=None, op=1.0, dash=None):
    eid = nid("ln"); L = math.hypot(x2 - x1, y2 - y1)
    if dash:
        tw(f"#{eid}", {"opacity": op}, t, 0.4, {"opacity": 0})
        da = f'stroke-dasharray="{dash}" opacity="0"'
    else:
        tw(f"#{eid}", {"strokeDashoffset": 0}, t, d, {"strokeDashoffset": L}, "power2.inOut")
        da = f'stroke-dasharray="{L:.1f}" stroke-dashoffset="{L:.1f}" opacity="{op}"'
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.3, 0.3)
    return f'<line id="{eid}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="{col}" stroke-width="{sw}" stroke-linecap="round" {da}/>'


def bar(x, y, w_, h_, t, col=VIOLET, d=0.9, end=None, grow="x"):
    eid = nid("br")
    if grow == "x": tw(f"#{eid}", {"scaleX": 1}, t, d, {"scaleX": 0}, "power3.out"); org = f"{x}px {y}px"
    else: tw(f"#{eid}", {"scaleY": 1}, t, d, {"scaleY": 0}, "power3.out"); org = f"{x}px {y + h_}px"
    if end: tw(f"#{eid}", {"opacity": 0}, s(end) - 0.3, 0.3)
    return f'<rect id="{eid}" x="{x}" y="{y}" width="{w_}" height="{h_}" fill="{col}" style="transform-origin:{org};transform-box:view-box"/>'


def fadein(t, inner, d=0.4, end=None, dy=0):
    gid = nid("g")
    tw(f"#{gid}", {"opacity": 1, "y": 0}, t, d, {"opacity": 0, "y": dy})
    if end: tw(f"#{gid}", {"opacity": 0}, s(end) - 0.3, 0.3)
    return f'<g id="{gid}" opacity="0">{inner}</g>'


def lens(t, x, y, r, inner_img, end=None, from_x=None):
    """White-ringed circular inset holding a photo (assets path)."""
    eid = nid("ls")
    tw(f"#{eid}", {"opacity": 1, "scale": 1, "x": 0}, t, 0.55, {"opacity": 0, "scale": 0.6, "x": (from_x or 0)}, "back.out(1.3)")
    if end: tw(f"#{eid}", {"opacity": 0, "scale": 0.8}, s(end) - 0.35, 0.3, None, "power2.in")
    return f'<div id="{eid}" class="lens" style="left:{x - r}px;top:{y - r}px;width:{2 * r}px;height:{2 * r}px"><img src="{inner_img}" alt=""></div>'
