"""AI Equator, white editorial style (2026-11-18): white page, ink type, one blue accent, real sources in light frames.
Layout is flex rows/columns inside fixed regions, so nothing is hand-placed and items cannot overlap.
Scenes never overlap in time: each one is fully gone at its end time, the next starts there."""
import hashlib, subprocess
from pathlib import Path
from PIL import Image

H = Path(__file__).parent
Image.MAX_IMAGE_PIXELS = None
FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffmpeg.exe"
RAW, CLIPS, IMG = H / "assets/raw", H / "assets/clips", H / "assets/img"
CLIPS.mkdir(exist_ok=True)

html, tl = [], []
Z = {"i": 0, "z": 10}
PENDING = []
B, E = '<b class="acc">', "</b>"
OUT = .25  # fade-out length, finished by the scene's end time


def nid(p="e"):
    Z["i"] += 1
    return f"{p}{Z['i']}"


def T(t):
    return float(t)


# ---------- motion (one vocabulary: fade + small rise, bars grow, numbers count)
def enter(sel, t, y=10, d=.4):
    if t <= 0:  # on screen from the very first frame (thumbnail)
        tl.append(f'tl.set("{sel}",{{opacity:1,y:0}},0);')
        return
    tl.append(f'tl.fromTo("{sel}",{{opacity:0,y:{y}}},{{opacity:1,y:0,duration:{d},ease:"power2.out"}},{T(t):.3f});')


def count(sel, t, a, b, dec=0, pre="", suf="", d=1.0):
    tl.append(f'count("{sel}",{T(t):.3f},{a},{b},{dec},"{pre}","{suf}",{d});')


def item(t, inner, cls="", style="", eid=None):
    eid = eid or nid("i")
    enter(f"#{eid}", t)
    return f'<div id="{eid}" class="a {cls}" style="{style}">{inner}</div>'


# ---------- scene
def scene(a, b, body, title=None, kicker=None, source=None, push=True, last=False):
    """kicker + title header, body region (flex), source line. Fully faded out by b."""
    a, b = T(a), T(b)
    Z["z"] += 1
    host, w, bid = nid("s"), nid("w"), nid("b")
    head = ""
    if kicker:
        head += f'<div class="kick">{kicker}</div>'
    if title:
        head += f'<div class="ttl">{title}</div>'
    head = f'<div class="head">{head}</div>' if head else ""
    srcl = f'<div class="srcl">{source}</div>' if source else ""
    full = " clipb" if "class=\"vframe\"" in body else (" full" if not head else "")
    html.append(f'<div id="{host}" class="clip scene" data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="2" style="z-index:{Z["z"]}">'
                f'<div id="{w}" class="sc">{head}<div id="{bid}" class="body{full}">{body}</div>{srcl}</div></div>')
    if a <= 0:
        tl.append(f'tl.set("#{w}",{{opacity:1}},0);')
    else:
        tl.append(f'tl.fromTo("#{w}",{{opacity:0}},{{opacity:1,duration:.3,ease:"power1.out"}},{a:.3f});')
    if not last:
        tl.append(f'tl.to("#{w}",{{opacity:0,duration:{OUT},ease:"power1.in"}},{b - OUT:.3f});')
    if push and not PENDING and b - a > 5:
        tl.append(f'tl.fromTo("#{bid}",{{scale:1}},{{scale:1.015,duration:{b - a:.3f},ease:"none"}},{a:.3f});')
    for wid, markup in PENDING:
        Z["z"] += 1
        html.append(markup.replace("@Z@", str(Z["z"])))
        if not last:
            tl.append(f'tl.to("#{wid}",{{opacity:0,duration:{OUT},ease:"power1.in"}},{b - OUT:.3f});')
    PENDING.clear()


# ---------- layout
def row(*cols, gap=64, align="center", flex=None):
    flex = flex or [1] * len(cols)
    # flex 0 = keep the column at its content width (media); flex n = share the rest
    inner = "".join(f'<div class="col" style="flex:{"none" if f == 0 else f"{f} 1 0"};min-width:0">{c}</div>' for c, f in zip(cols, flex))
    return f'<div class="row" style="gap:{gap}px;align-items:{align}">{inner}</div>'


def col(*items, gap=24, justify="center", align="stretch"):
    return f'<div class="col" style="gap:{gap}px;justify-content:{justify};align-items:{align}">{"".join(items)}</div>'


def hrow(*items, gap=24, justify="flex-start"):
    """Horizontal run of small items (stat cards, pills) that share the width."""
    return f'<div class="hrow" style="gap:{gap}px;justify-content:{justify}">{"".join(items)}</div>'


# ---------- text items
def head(t, s, size=64, align="left"):
    return item(t, s, "hd", f"font-size:{size}px;text-align:{align}")


def text(t, s, size=34, align="left", tone="ink2"):
    return item(t, s, f"tx {tone}", f"font-size:{size}px;text-align:{align}")


def big(t, s, size=140, tone="", align="left", eid=None):
    return item(t, s, f"bg {tone}", f"font-size:{size}px;text-align:{align}", eid)


def pill(t, s, tone=""):
    return item(t, s, f"pill {tone}")


def stat(t, label, value, sub=None, tone="", logo=None, to=None, dec=0, pre="", suf="", grow=1, vs=None):
    """A number card. to= makes the value count up from 0."""
    vid = nid("v")
    lg = f'<img src="{logo}" alt="" class="slogo">' if logo else ""
    sb = f'<div class="ssub">{sub}</div>' if sub else ""
    if to is not None:
        count(f"#{vid}", t + .1, 0, to, dec, pre, suf)
    return item(t, f'<div class="slab">{lg}{label}</div><div id="{vid}" class="sval {tone}"{f' style="font-size:{vs}px"' if vs else ""}>{value}</div>{sb}', f"stat {tone}", f"flex:{grow}")


def quote(t, s, who, where, avatar=None, tone=""):
    av = f'<img src="{avatar}" alt="" class="qav">' if avatar else ""
    return item(t, f'<div class="qt">“{s}”</div><div class="qwho">{av}<div><b>{who}</b><span>{where}</span></div></div>', f"quote {tone}")


def fix(t, s):
    """Source check: where the voiceover and the source disagree, the source wins on screen."""
    return item(t, f'<div class="fk">Source check</div><div class="ft">{s}</div>', "fix")


# ---------- media items
def _wh(path, w):
    iw, ih = Image.open(H / path).size
    return w, int(w * ih / iw)


def page_img(name, crop):
    tag = hashlib.md5(str(crop).encode()).hexdigest()[:5]
    out = IMG / f"{name}_{tag}.jpg"
    if not out.exists():
        im = Image.open(RAW / "web" / f"{name}.png").convert("RGB")
        w, h = im.size
        im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h))).save(out, quality=92)
    return f"assets/img/{out.name}"


def media_push(eid, a, b, to=1.04):
    tl.append(f'tl.fromTo("#{eid}",{{scale:1}},{{scale:{to},duration:{T(b) - T(a):.3f},ease:"none"}},{T(a):.3f});')


def shot(t, name, url, crop, w, b=None):
    """A real captured page in a light browser frame. b= adds a slow push until b."""
    s = page_img(name, crop)
    w, h = _wh(s, w)
    kb = nid("k")
    if b:
        media_push(kb, t, b, 1.035)
    return item(t, f'<div class="wbar"><i></i><i></i><i></i><span>{url}</span></div><div class="wbody" style="height:{h}px"><img id="{kb}" src="{s}" alt="" style="width:{w}px;height:{h}px"></div>',
                "win", f"width:{w}px")


def tw(t, name, w, ycrop=1.0):
    out = IMG / f"tw_{name}_{int(ycrop * 100)}.png"
    if not out.exists():
        im = Image.open(RAW / "web" / f"tw_{name}.png")
        im.crop((0, 0, im.width, int(im.height * ycrop))).save(out)
    w, h = _wh(f"assets/img/{out.name}", w)
    return item(t, f'<img src="assets/img/{out.name}" alt="" style="width:{w}px;height:{h}px">', "twc", f"width:{w}px")


def chart(t, path, w, crop=None, b=None, cap=None):
    """A real chart image (OpenAI's are black) in a clean frame with an optional caption."""
    if crop:
        tag = hashlib.md5(str(crop).encode()).hexdigest()[:5]
        out = IMG / f"{Path(path).stem}_{tag}.png"
        if not out.exists():
            im = Image.open(H / path)
            W, Hh = im.size
            im.crop((int(crop[0] * W), int(crop[1] * Hh), int(crop[2] * W), int(crop[3] * Hh))).save(out)
        path = f"assets/img/{out.name}"
    w, h = _wh(path, w)
    kb = nid("k")
    if b:
        media_push(kb, t, b, 1.03)
    c = f'<div class="ccap">{cap}</div>' if cap else ""
    return item(t, f'<div class="cbody" style="height:{h}px"><img id="{kb}" src="{path}" alt="" style="width:{w}px;height:{h}px"></div>{c}', "chartc", f"width:{w}px")


def pic(t, path, w, h, name=None, role=None):
    cap = f'<div class="pn">{name}</div><div class="pr">{role}</div>' if name else ""
    return item(t, f'<img src="{path}" alt="" style="width:{w}px;height:{h}px;object-fit:cover">{cap}', "pic", f"width:{w}px")


def logo(t, path, h=64):
    return item(t, f'<img src="{path}" alt="" style="height:{h}px">', "lg")


# ---------- charts built from source numbers
def bars(t0, rows, vmax, dec=0, suf="", label_w=380, val_w=190, gap=30, h=56, note=None):
    """rows: (t, label, value, hero, logo-or-None, sub-or-None). True to scale against vmax."""
    out = ""
    for t, lab, v, hero, lg, sub in rows:
        fid, vid = nid("bf"), nid("bv")
        ic = f'<img src="{lg}" alt="" class="blogo">' if lg else ""
        sb = f'<span class="bsub">{sub}</span>' if sub else ""
        tl.append(f'tl.fromTo("#{fid}",{{scaleX:0}},{{scaleX:1,duration:.9,ease:"power3.out"}},{T(t):.3f});')
        count(f"#{vid}", t, 0, v, dec, "", suf, .9)
        out += item(t, f'<div class="blab" style="width:{label_w}px">{ic}<span>{lab}</span></div>'
                       f'<div class="btrack" style="height:{h}px"><div id="{fid}" class="bfill{" hero" if hero else ""}" style="width:{100 * v / vmax:.2f}%"></div></div>'
                       f'<div class="bval{" acc" if hero else ""}" style="width:{val_w}px"><span id="{vid}">0</span>{sb}</div>', "brow")
    n = f'<div class="bnote">{note}</div>' if note else ""
    return f'<div class="bars" style="gap:{gap}px">{out}</div>{n}'


# ---------- video
def trim(raw, ss, d, w=1536, h=864, crop=None):
    key = hashlib.md5(f"{raw}{ss:.2f}{d:.2f}{w}{h}{crop}".encode()).hexdigest()[:8]
    out = CLIPS / f"{Path(raw).stem}_{key}.mp4"
    if not out.exists():
        subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{ss:.2f}", "-t", f"{d + .3:.2f}", "-i", str(RAW / raw), "-an",
                        "-vf", (f"crop={crop[0]}:{crop[1]}:{crop[2]}:{crop[3]}," if crop else "") + f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},fps=30",
                        "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", str(out)], check=True)
    return f"assets/clips/{out.name}"


VX, VY, VW, VH = 192, 88, 1536, 864  # user rule 2026-11-12: clips at ~80% of the frame


def clip80(a, b, raw, ss, credit=None, caps=(), crop=None, instant=False):
    """A real clip at 80%, centred, credit underneath, captions stacked bottom-left inside the frame. Returns the scene body."""
    a, b = T(a), T(b)
    s = trim(raw, ss, b - a + .3, VW, VH, crop)
    v, wr = nid("v"), nid("vw")
    if instant:
        tl.append(f'tl.set("#{wr}",{{opacity:1}},{a:.3f});')
    else:
        tl.append(f'tl.fromTo("#{wr}",{{opacity:0,scale:.985}},{{opacity:1,scale:1,duration:.4,ease:"power2.out"}},{a:.3f});')
    cap_html = ""
    if caps:
        cap_html = '<div class="caps">' + "".join(item(t, s2, f"cap {tone}") for t, s2, tone in caps) + "</div>"
    PENDING.append((wr, f'<div id="{wr}" class="vwrap" style="left:{VX}px;top:{VY}px;width:{VW}px;height:{VH}px;z-index:@Z@">'
                        f'<video id="{v}" class="clip" src="{s}" muted playsinline data-start="{a:.3f}" data-duration="{b - a:.3f}" data-track-index="1" '
                        f'style="width:{VW}px;height:{VH}px;object-fit:cover"></video>{cap_html}</div>'))
    cr = f'<div class="vcred">{credit}</div>' if credit else ""
    return f'<div class="vframe"></div>{cr}'


# ---------- story motifs for the Google comeback video
EL = {"Ar": (18, "Argon"), "C": (6, "Carbon"), "H": (1, "Hydrogen"), "Ne": (10, "Neon")}


def tile(t, sym, sub=None, tone="", w=230):
    """A periodic-table style tile for a Gemini 4 model: real atomic number, symbol, name, a line under it."""
    num, name = EL[sym]
    s = f'<div class="esub">{sub}</div>' if sub else ""
    return item(t, f'<div class="enum">{num}</div><div class="esym">{sym}</div><div class="ename">Gemini 4 {name}</div>{s}', f"etile {tone}", f"width:{w}px")


def timeline(events, gap_label=None):
    """events: (t, date, label, tone). Equal columns on one rule; each dot and label enters on its time."""
    cols = ""
    for t, d, lab, tone in events:
        cols += item(t, f'<i class="tdot {tone}"></i><div class="tdate">{d}</div><div class="tlab">{lab}</div>', f"tev {tone}")
    g = f'<div class="tgap">{gap_label}</div>' if gap_label else ""
    return f'<div class="tline"><div class="trule"></div><div class="tevs">{cols}</div>{g}</div>'
