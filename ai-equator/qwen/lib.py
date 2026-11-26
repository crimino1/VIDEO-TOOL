"""Helpers for AI Equator style v2: dark stage, built cards, blue key words, orange hand notes, blur dissolves."""
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
PENDING = []  # root-level video wrappers for the scene being built
B, E = '<span class="blue">', "</span>"


def nid(p="e"):
    Z["i"] += 1
    return f"{p}{Z['i']}"


def T(t):
    if isinstance(t, (int, float)):
        return float(t)
    m, x = t.split(":")
    return int(m) * 60 + float(x)


# ---------- motion
def enter(sel, t, y=18, d=.35):
    tl.append(f'tl.fromTo("{sel}",{{opacity:0,y:{y},filter:"blur(6px)"}},{{opacity:1,y:0,filter:"blur(0px)",duration:{d},ease:"power3.out"}},{T(t):.3f});')


def pop(sel, t, rot=0):
    tl.append(f'tl.fromTo("{sel}",{{opacity:0,scale:.86,rotation:{rot - 4}}},{{opacity:1,scale:1,rotation:{rot},duration:.22,ease:"back.out(2)"}},{T(t):.3f});')


def dim(sel, t, to=.28):
    tl.append(f'tl.to("{sel}",{{opacity:{to},duration:.3,ease:"power2.out"}},{T(t):.3f});')


def count(sel, t, a, b, dec=0, pre="", suf="", d=1.3):
    tl.append(f'count("{sel}",{T(t):.3f},{a},{b},{dec},"{pre}","{suf}",{d});')


def grow(sel, t, w, d=.9):
    tl.append(f'tl.fromTo("{sel}",{{width:0}},{{width:{w},duration:{d},ease:"power3.out"}},{T(t):.3f});')


# ---------- scene host with blur dissolve
def scene(a, b, inner, out=True, fade_in=True):
    a, b = T(a), T(b)
    Z["z"] += 1
    host, w = nid("s"), nid("w")
    dur = b - a + (.4 if out else 0)
    html.append(f'<div id="{host}" class="clip scene" data-start="{a:.3f}" data-duration="{dur:.3f}" data-track-index="2" style="z-index:{Z["z"]}" data-layout-allow-overflow data-layout-allow-overlap><div id="{w}" class="sc">{inner}</div></div>')
    if fade_in:
        tl.append(f'tl.fromTo("#{w}",{{opacity:0,filter:"blur(10px)"}},{{opacity:1,filter:"blur(0px)",duration:.4,ease:"power2.out"}},{a:.3f});')
    else:
        tl.append(f'tl.set("#{w}",{{opacity:1}},0);')
    if out:
        tl.append(f'tl.to("#{w}",{{opacity:0,filter:"blur(10px)",duration:.4,ease:"power2.in"}},{b:.3f});')
    if not PENDING and b - a > 6:  # slow push so long text/chart scenes never sit dead still
        tl.append(f'tl.fromTo("#{w}",{{scale:1}},{{scale:1.03,duration:{b - a:.3f},ease:"none",transformOrigin:"50% 50%"}},{a:.3f});')
    for wid, markup in PENDING:  # clips sit on their own root layer just above the scene, fading with it
        Z["z"] += 1
        html.append(markup.replace("@Z@", str(Z["z"])))
        if out:
            tl.append(f'tl.to("#{wid}",{{opacity:0,duration:.4,ease:"power2.in"}},{b:.3f});')
    PENDING.clear()


# ---------- elements
def el(t, inner, style, cls="", anim="enter", rot=0, eid=None):
    eid = eid or nid("c")
    if anim == "enter":
        enter(f"#{eid}", t)
    elif anim == "pop":
        pop(f"#{eid}", t, rot)
    return f'<div id="{eid}" class="a {cls}" style="{style}">{inner}</div>'


def txt(t, s, x, y, size=72, w=None, cls="h", align="left", anim="enter", eid=None):
    if align == "center":
        return el(t, s, f"left:0;right:0;top:{y}px;text-align:center;font-size:{size}px", cls, anim, eid=eid)
    ws = f"width:{w}px;" if w else ""
    return el(t, s, f"left:{x}px;top:{y}px;{ws}font-size:{size}px", cls, anim, eid=eid)


_A = '<svg width="{w}" height="{h}" viewBox="0 0 {w} {h}"><path d="{d}" fill="none" stroke="#F0A818" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/></svg>'
ARROWS = {
    "down": _A.format(w=54, h=58, d="M8 4c18 6 30 20 30 46M26 40l12 12 10-15"),
    "up": _A.format(w=54, h=58, d="M10 54c16-6 28-20 28-46M26 18l12-12 10 15"),
    "left": _A.format(w=70, h=40, d="M66 10C46 4 24 10 8 28M8 28l2-16M8 28l16 0"),
    "right": _A.format(w=70, h=40, d="M4 10c20-6 42 0 58 18M62 28l-2-16M62 28l-16 0"),
}


def note(t, s, x, y, size=46, arrow=None, ax=0, ay=0):
    a = f'<span class="arw" style="left:{ax}px;top:{ay}px">{ARROWS[arrow]}</span>' if arrow else ""
    return el(t, s + a, f"left:{x}px;top:{y}px;font-size:{size}px", "note")


def src(t, s, x=0, y=1000, center=True):
    if center:
        return el(t, s, f"left:0;right:0;top:{y}px;text-align:center", "src")
    return el(t, s, f"left:{x}px;top:{y}px", "src")


def card(t, inner, x, y, w, h=None, cls="card", anim="enter", eid=None):
    hs = f"height:{h}px;" if h else ""
    return el(t, inner, f"left:{x}px;top:{y}px;width:{w}px;{hs}", cls, anim, eid=eid)


def img(t, path, x, y, w, h=None, cls="im", anim="enter", rot=0, eid=None):
    if h is None:
        iw, ih = Image.open(H / path).size
        h = int(w * ih / iw)
    return el(t, f'<img src="{path}" alt="" style="width:{w}px;height:{h}px">', f"left:{x}px;top:{y}px;width:{w}px;height:{h}px", cls, anim, rot, eid)


def meme(t, name, x, y, w, rot=-2):
    return img(t, f"assets/img/{name}", x, y, w, cls="meme", anim="pop", rot=rot)


def logo(t, name, x, y, w, anim="enter"):
    return img(t, f"assets/img/{name}", x, y, w, cls="logo", anim=anim)


def person(t, name, who, role, x, y, w=300):
    eid = nid("c")
    enter(f"#{eid}", t)
    return (f'<div id="{eid}" class="a person" style="left:{x}px;top:{y}px;width:{w}px"><img src="assets/img/{name}" alt="{who}" style="width:{w}px;height:{w}px">'
            f'<div class="pn">{who}</div><div class="pr">{role}</div></div>')


def page_img(name, crop):
    tag = hashlib.md5(str(crop).encode()).hexdigest()[:5]
    out = IMG / f"{name}_{tag}.jpg"
    if not out.exists():
        im = Image.open(RAW / "web" / f"{name}.png").convert("RGB")
        w, h = im.size
        im.crop((int(crop[0] * w), int(crop[1] * h), int(crop[2] * w), int(crop[3] * h))).save(out, quality=92)
    return f"assets/img/{out.name}", Image.open(out).size


def mac(t, name, url, crop, x, y, w, a, b, zoom=1.035):
    """Dark browser window holding a real captured page; crop is a fraction box of the capture."""
    s, (iw, ih) = page_img(name, crop)
    h = int(w * ih / iw)
    eid, kb = nid("m"), nid("k")
    enter(f"#{eid}", t, 24)
    tl.append(f'tl.fromTo("#{kb}",{{scale:1}},{{scale:{zoom},duration:{T(b) - T(a):.3f},ease:"none"}},{T(a):.3f});')
    return (f'<div id="{eid}" class="a mac" style="left:{x}px;top:{y}px;width:{w}px"><div class="mbar"><i></i><i></i><i></i><div class="murl">{url}</div></div>'
            f'<div class="mbody" style="height:{h}px"><img id="{kb}" src="{s}" alt="{name}" style="width:{w}px;height:{h}px"></div></div>')


def trim(raw, ss, d, w=1280, h=720, crop=None):
    key = hashlib.md5(f"{raw}{ss:.2f}{d:.2f}{w}{h}{crop}".encode()).hexdigest()[:8]
    out = CLIPS / f"{Path(raw).stem}_{key}.mp4"
    if not out.exists():
        subprocess.run([FF, "-hide_banner", "-loglevel", "error", "-y", "-ss", f"{ss:.2f}", "-t", f"{d + .3:.2f}", "-i", str(RAW / raw), "-an",
                        "-vf", (f"crop={crop[0]}:{crop[1]}:{crop[2]}:{crop[3]}," if crop else "") + f"scale={w}:{h}:force_original_aspect_ratio=increase,crop={w}:{h},fps=30", "-c:v", "libx264", "-preset", "fast", "-crf", "18", "-pix_fmt", "yuv420p", str(out)], check=True)
    return f"assets/clips/{out.name}"


def vcard(a, b, raw, ss, x, y, w, h, credit=None, anim="enter", crop=None, instant=False):
    """A real clip in a rounded frame. The frame lives in the scene; the video sits on a root layer above it."""
    a, b = T(a), T(b)
    s = trim(raw, ss, b - a + .5, 1280, int(1280 * h / w) // 2 * 2, crop)
    eid, v, wr = nid("vc"), nid("v"), nid("vw")
    if instant:  # visible on its first frame (thumbnail)
        tl.append(f'tl.set("#{eid}, #{wr}",{{opacity:1}},{a:.3f});')
    else:
        (pop if anim == "pop" else enter)(f"#{eid}", a)
        (pop if anim == "pop" else enter)(f"#{wr}", a)
    PENDING.append((wr, f'<div id="{wr}" class="vwrap" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px;z-index:@Z@"><video id="{v}" class="clip" src="{s}" muted playsinline '
                        f'data-start="{a:.3f}" data-duration="{b - a + .4:.3f}" data-track-index="1" style="width:{w}px;height:{h}px;object-fit:cover"></video></div>'))
    out = f'<div id="{eid}" class="a vcard" style="left:{x}px;top:{y}px;width:{w}px;height:{h}px"></div>'
    if credit:
        out += src(a, credit, x, y + h + 14, center=False)
    return out


def cross(t, x, y, s=60):
    return el(t, f'<svg width="{s}" height="{s}" viewBox="0 0 64 64"><path d="M14 14l36 36M50 14L14 50" stroke="#F85149" stroke-width="7" stroke-linecap="round"/></svg>', f"left:{x}px;top:{y}px", "", "pop")


def check(t, x, y, s=60):
    return el(t, f'<svg width="{s}" height="{s}" viewBox="0 0 64 64"><path d="M12 34l14 14 26-30" fill="none" stroke="#3FB950" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"/></svg>', f"left:{x}px;top:{y}px", "", "pop")


def draw(eid, t, d=.35, stagger=0):
    tl.append(f'tl.set("#{eid}",{{opacity:1}},{T(t):.3f});')
    tl.append(f'tl.fromTo("#{eid} .dr",{{strokeDashoffset:1}},{{strokeDashoffset:0,duration:{d},stagger:{stagger},ease:"power2.out"}},{T(t):.3f});')


def bigx(t, x, y, w, h):
    eid = nid("bx")
    draw(eid, t, .25, .12)
    p = 'class="dr" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" stroke="#F0A818" stroke-width="6" stroke-linecap="round"'
    return (f'<svg id="{eid}" class="a" style="left:{x}px;top:{y}px;opacity:0" width="{w}" height="{h}" viewBox="0 0 {w} {h}">'
            f'<path {p} d="M8 8L{w - 8} {h - 8}"/><path {p} d="M{w - 8} 8L8 {h - 8}"/></svg>')


def underline(t, x, y, w, color="#F0A818"):
    eid = nid("ul")
    draw(eid, t, .4)
    return (f'<svg id="{eid}" class="a" style="left:{x}px;top:{y}px;opacity:0" width="{w}" height="18" viewBox="0 0 {w} 18">'
            f'<path class="dr" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M4 12C{w * .3:.0f} 4 {w * .7:.0f} 4 {w - 4} 10" fill="none" stroke="{color}" stroke-width="4" stroke-linecap="round"/></svg>')


def link(t, x, y, w, label=""):
    """Thin grey arrow between two cards, with an optional mono label above it."""
    eid = nid("al")
    draw(eid, t, .35)
    lab = f'<div class="mono" style="position:absolute;left:-60px;width:{w + 120}px;top:-42px;text-align:center;font-size:24px;color:#8A8F98">{label}</div>' if label else ""
    return (f'<div id="{eid}" class="a" style="left:{x}px;top:{y}px;width:{w}px;height:20px;opacity:0">{lab}<svg width="{w}" height="20" viewBox="0 0 {w} 20">'
            f'<path class="dr" pathLength="1" stroke-dasharray="1" stroke-dashoffset="1" d="M2 10H{w - 4}M{w - 14} 2L{w - 4} 10L{w - 14} 18" fill="none" stroke="#5A606B" stroke-width="2.5"/></svg></div>')


def bars(t0, rows, x=300, y=360, wmax=1000, gap=120, dec=1, suf="%", vmax=100):
    """rows: (t, label, value%, hero?, logo or None). Width is true to scale: wmax = 100%."""
    out = ""
    for i, (t, lab, v, hero, lg) in enumerate(rows):
        yy = y + i * gap
        fid, vid = nid("bf"), nid("bv")
        icon = f'<img src="assets/img/{lg}" alt="" style="width:40px;height:40px;object-fit:contain;margin-right:16px;vertical-align:-10px">' if lg else ""
        out += el(t, f'{icon}{lab}', f"left:{x}px;top:{yy}px;font-size:34px;width:440px", "bl")
        out += f'<div class="track" style="left:{x + 460}px;top:{yy + 6}px;width:{wmax}px"></div>'
        out += f'<div id="{fid}" class="fill{" hero" if hero else ""}" style="left:{x + 460}px;top:{yy + 6}px;width:0"></div>'
        out += el(t, f'<span id="{vid}">0.0%</span>', f"left:{x + 460 + int(wmax * v / vmax) + 22}px;top:{yy - 4}px;font-size:44px", "bvl" + (" blue" if hero else ""))
        grow(f"#{fid}", t, int(wmax * v / vmax))
        count(f"#{vid}", t, 0, v, dec, "", suf, .9)
    return out


def tweet(t, name, x, y, w, ycrop=1.0, anim="enter"):
    """Real X post card captured with capture.mjs tweet; ycrop keeps the top part of a long post."""
    out = IMG / f"tw_{name}_{int(ycrop * 100)}.png"
    if not out.exists():
        im = Image.open(RAW / "web" / f"tw_{name}.png")
        im.crop((0, 0, im.width, int(im.height * ycrop))).save(out)
    return img(t, f"assets/img/{out.name}", x, y, w, cls="im tw", anim=anim)


# ---------- user rule 2026-11-12: every video clip at ~80% of the screen
VX, VY, VW, VH = 192, 88, 1536, 864


def clip80(a, b, raw, ss, credit=None, crop=None, instant=False):
    """A real clip at 80% of the frame, centred, credit underneath."""
    out = vcard(a, b, raw, ss, VX, VY, VW, VH, None, crop=crop, instant=instant)
    if credit:
        out += src(a, credit, VX, VY + VH + 16, center=False)
    return out


def ov(t, s, x, y, size=46):
    """A hand note on a dark pill, for use in an overlay scene above a clip."""
    return el(t, s, f"left:{x}px;top:{y}px;font-size:{size}px", "note ovp")


def chip(t, s, x, y, cls="ovc"):
    return el(t, s, f"left:{x}px;top:{y}px", cls)
