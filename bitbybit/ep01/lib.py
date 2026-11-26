"""Bit by Bit build helpers: pixel shots (assets/js/px.js), white keyword text, yellow section cards, the "Bit" mascot,
framed photos and source screenshots. Times are film seconds, "m:ss.ss" strings, or W("word", after) lookups."""
import hashlib, json, re
from pathlib import Path
from PIL import Image

H = Path(__file__).parent
WORDS = json.load(open(H / "words.json", encoding="utf-8"))["words"]
GEN = H / "assets" / "gen"; GEN.mkdir(parents=True, exist_ok=True)
ST = {"off": 0.0, "skip": False, "n": 10, "i": 0}
html, tl, sps, sfx_cues = [], [], [], []
YEL, CYAN = "#f5c842", "#5fe3e8"


class A(float):
    """An absolute film time inside pixel-shot options; converted to shot-relative seconds."""


def s(t):
    if isinstance(t, (int, float)): return float(t)
    if isinstance(t, tuple): return W(*t)
    m, x = t.split(":")
    return int(m) * 60 + float(x)


def _norm(x): return re.sub(r"[^a-z0-9%]", "", x.lower())


def W(word, after=0.0, end=False):
    """Start (or end) of the first spoken word matching `word` at or after `after` (absolute film seconds)."""
    after = s(after); key = _norm(word)
    for x in WORDS:
        if x["start"] >= after - 0.05 and _norm(x["word"]).startswith(key):
            return A(x["end"] if end else x["start"])
    raise KeyError(f"word {word!r} after {after}")


def T(x): return f"{s(x) - ST['off']:.3f}"


def nid(p="e"):
    ST["i"] += 1
    return f"{p}{ST['i']}"


def add_tl(line):
    if ST["skip"]: return
    pos = float(line.rsplit(",", 1)[1].rstrip(");"))
    assert pos >= -0.001, f"negative timeline position {pos} (part offset {ST['off']}): {line[:120]}"
    tl.append(line)


def js(o):
    return "{" + ",".join(f"{k}:{json.dumps(v)}" for k, v in o.items()) + "}"


def tw(sel, to, t, d=0.4, frm=None, ease="power2.out"):
    to = dict(to); to.setdefault("duration", round(d, 3)); to.setdefault("ease", ease)
    if frm is not None: add_tl(f'tl.fromTo("{sel}",{js(frm)},{js(to)},{T(t)});')
    else: add_tl(f'tl.to("{sel}",{js(to)},{T(t)});')


def tset(sel, props, t): add_tl(f'tl.set("{sel}",{js(props)},{T(t)});')


def sfx(name, t, vol=1.0):
    if not ST["skip"]: sfx_cues.append((round(s(t), 3), name, vol))


# ---------------- layers ----------------
def layer(a, b, inner, fin=0.0, z=None):
    ST["n"] += 1
    if ST["skip"]: return
    a, b = s(a), s(b)
    cid = nid("c")
    html.append(f'<div id="{nid("s")}" class="clip scene" data-start="{T(a)}" data-duration="{b - a:.3f}" data-track-index="2" style="z-index:{z or ST["n"]}" '
                f'data-layout-allow-overflow data-layout-allow-overlap><div id="{cid}" class="scene">{inner}</div></div>')
    if fin: tw(f"#{cid}", {"opacity": 1}, a, fin, {"opacity": 0}, "power1.inOut")


def pxshot(a, b, kind, o):
    a, b = s(a), s(b)
    if ST["skip"]: return

    def conv(v):
        if isinstance(v, A): return round(float(v) - a, 3)
        if isinstance(v, list): return [conv(x) for x in v]
        if isinstance(v, dict): return {k: conv(x) for k, x in v.items()}
        return v
    sps.append([round(a - ST["off"], 3), round(b - ST["off"], 3), kind, conv(o)])


# ---------------- text ----------------
def kw(words, x=None, y=420, size=96, col="#fff", align="center", end=None, maxw=1500, lh=1.08):
    """Keyword line(s). words = [(text, t), ...]; each word appears hard-on at its time (reference style).
    A "\\n" text starts a new line. x=None centres the block."""
    eid = nid("k")
    spans = []
    for text, t in words:
        if text == "\n": spans.append("<br>"); continue
        wid = nid("w")
        spans.append(f'<span id="{wid}" style="opacity:0">{text}</span>')
        tset(f"#{wid}", {"opacity": 1}, t)
    if end is not None: tset(f"#{eid}", {"opacity": 0}, end)
    if x is None: pos = f"left:{(1920 - maxw) // 2}px;width:{maxw}px;text-align:center"
    elif align == "right": pos = f"right:{1920 - x}px;width:{maxw}px;text-align:right"
    else: pos = f"left:{x}px;width:{maxw}px;text-align:{align}"
    return f'<div id="{eid}" class="kw" style="{pos};top:{y}px;font-size:{size}px;line-height:{lh};color:{col}">{" ".join(spans)}</div>'


def kwl(text, t, **k):
    """Keyword line where each word appears on its own spoken word (looked up from t onward), or all at t if not spoken."""
    out, after = [], s(t)
    for wd in text.split(" "):
        if wd == "|": out.append(("\n", 0)); continue
        try: tt = W(wd, after); after = tt
        except KeyError: tt = after
        out.append((wd, tt))
    return kw(out, **k)


def sec(l1, l2, t, y=440):
    """Yellow section card: scales from 2.4x to 1x over 0.55 s, holds."""
    eid = nid("sec")
    tw(f"#{eid}", {"scale": 1, "opacity": 1}, t, 0.55, {"scale": 2.4, "opacity": 0}, "power3.out")
    sfx("whoosh", s(t) - 0.08, 0.8)
    return f'<div id="{eid}" class="sec" style="top:{y}px"><div>{l1}</div><div>{l2}</div></div>'


def sub(head, body, x, y, t, end=None):
    """Mascot sub-heading (white heavy sans): head 66px + body lines 42px; hard-on at t."""
    eid = nid("sb")
    tset(f"#{eid}", {"opacity": 1}, t)
    if end: tset(f"#{eid}", {"opacity": 0}, end)
    b = "".join(f"<div>{l}</div>" for l in body)
    return f'<div id="{eid}" class="sub" style="left:{x}px;top:{y}px;opacity:0"><div class="h">{head}</div><div class="b">{b}</div></div>'


def num(text, t, x=None, y=820, size=86, col=CYAN):
    """Pixel-font number in a cyan box (reference '1,500,000' counter look), hard-on."""
    eid = nid("n")
    tset(f"#{eid}", {"opacity": 1}, t)
    pos = f"left:{x}px" if x is not None else "left:50%;transform:translateX(-50%)"
    return f'<div class="numw" style="{pos};top:{y}px"><div id="{eid}" class="num" style="font-size:{size}px;color:{col};border-color:{col};opacity:0">{text}</div></div>'


# ---------------- mascot ----------------
ARMS = {"idle": [[120, 250, 110, 295], [180, 250, 190, 295]], "tada": [[90, 185, 52, 125], [210, 185, 255, 125]],
        "point": [[125, 250, 118, 295], [220, 200, 292, 192]], "scratch": [[120, 250, 110, 295], [240, 210, 252, 132]],
        "shrug": [[105, 222, 78, 178], [195, 222, 222, 178]], "think": [[120, 250, 110, 295], [205, 235, 172, 172]],
        "pointl": [[80, 200, 8, 192], [180, 250, 190, 295]]}


def _cube(eye_id):
    px = []
    for r in range(8):
        for c in range(8):
            px.append(f'<rect x="{90 + c * 15}" y="{40 + r * 15}" width="15" height="15" fill="{"#5FE3E8" if (r + c) % 2 else "#57D6DC"}"/>')
    eyes = "".join(f'<rect x="{90 + c * 15}" y="70" width="15" height="30" fill="#06121A"/>' for c in (2, 5))
    mouth = "".join(f'<rect x="{90 + c * 15}" y="{40 + r * 15}" width="15" height="15" fill="#06121A"/>' for c, r in ((2, 5), (3, 6), (4, 6), (5, 5)))
    return (f'<g shape-rendering="crispEdges" filter="url(#bbGlow)"><polygon points="90,40 115,20 235,20 210,40" fill="#B4F7F9"/>'
            f'<polygon points="210,40 235,20 235,140 210,160" fill="#2A9FAD"/>{"".join(px)}'
            f'<g id="{eye_id}" style="transform-origin:150px 85px;transform-box:view-box">{eyes}</g>{mouth}</g>')


def mascot_svg(pose, eye_id, flip=False):
    (lex, ley, lhx, lhy), (rex, rey, rhx, rhy) = ARMS[pose]
    ln = lambda d: f'<path d="{d}" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-linejoin="round"/>'
    body = (ln("M150 160 L150 300") + ln("M150 300 L115 405 M150 300 L185 405") +
            ln(f"M150 195 L{lex} {ley} L{lhx} {lhy}") + ln(f"M150 195 L{rex} {rey} L{rhx} {rhy}"))
    fl = ' transform="translate(300 0) scale(-1 1)"' if flip else ""
    return (f'<svg viewBox="-10 0 320 430" class="msvg"><g{fl}><g filter="url(#bbRough)">{body}</g>{_cube(eye_id)}</g></svg>')


def mascot(a, b, poses, side="left", h=640, x=None, y=None):
    """Mascot standing in a lower corner, cropped at the shins by the frame. poses = [(t, pose), ...]; hard cuts between poses.
    Blinks every ~2.7 s. side right flips him so he faces left (towards the content)."""
    a, b = s(a), s(b)
    w = h * 320 / 430
    x = x if x is not None else (60 if side == "left" else 1920 - w - 60)
    y = y if y is not None else 1080 - h * 0.93
    flip = side == "right"
    out = []
    ids = []
    for k, (t, pose) in enumerate(poses):
        gid, eye = nid("mp"), nid("me")
        ids.append((gid, s(t)))
        out.append(f'<div id="{gid}" class="mpose" style="opacity:{1 if k == 0 else 0}">{mascot_svg(pose, eye, flip)}</div>')
        t0 = s(t); t1 = s(poses[k + 1][0]) if k + 1 < len(poses) else b
        bt = t0 + 1.1
        while bt < t1 - 0.3:
            tset(f"#{eye}", {"scaleY": 0.12}, bt); tset(f"#{eye}", {"scaleY": 1}, bt + 0.12); bt += 2.7
    for k, (gid, t) in enumerate(ids):
        if k: tset(f"#{gid}", {"opacity": 1}, t); tset(f"#{ids[k - 1][0]}", {"opacity": 0}, t)
    return f'<div class="mascot" style="left:{x:.0f}px;top:{y:.0f}px;width:{w:.0f}px;height:{h}px">{"".join(out)}</div>'


# ---------------- images ----------------
def gen_img(key, make):
    out = GEN / key
    if not out.exists(): make(out)
    return f"assets/gen/{key}"


def fitted(name, maxw, maxh, crop=None):
    src = next(p for p in (H / "assets" / "img").glob(name + ".*"))

    def mk(out):
        im = Image.open(src).convert("RGB")
        if crop:
            W_, H_ = im.size
            im = im.crop((int(crop[0] * W_), int(crop[1] * H_), int(crop[2] * W_), int(crop[3] * H_))) if max(crop) <= 1 else im.crop(crop)
        k = min(maxw * 1.25 / im.size[0], maxh * 1.25 / im.size[1])
        if k < 1: im = im.resize((int(im.size[0] * k), int(im.size[1] * k)), Image.LANCZOS)
        im.save(out, quality=92)
    tag = hashlib.md5(f"{name}{maxw}{maxh}{crop}".encode()).hexdigest()[:6]
    p = gen_img(f"{name}_{tag}.jpg", mk)
    W_, H_ = Image.open(H / p).size
    return p, W_, H_


def photo(a, b, name, w=960, h=620, cx=960, cy=540, crop=None, zoom=(1.0, 1.05), shade=0.0):
    """Framed photo inset over the starfield (reference: plain edge, ~50% frame width), slow push-in."""
    a, b = s(a), s(b)
    p, W_, H_ = fitted(name, w, h, crop)
    k = min(w / W_, h / H_); W_, H_ = int(W_ * k), int(H_ * k)
    eid = nid("ph")
    tw(f"#{eid}", {"scale": zoom[1]}, a, b - a, {"scale": zoom[0]}, "none")
    sh = f'<div class="pshade" style="opacity:{shade}"></div>' if shade else ""
    return (f'<div class="frame" style="left:{cx - W_ // 2}px;top:{cy - H_ // 2}px;width:{W_}px;height:{H_}px">'
            f'<img id="{eid}" src="{p}" alt="{name}">{sh}</div>')


def shot_ss(a, b, name, crop, w=1240, h=760, cx=960, cy=560, hl=None, zoom=(1.0, 1.04)):
    """Source screenshot ('receipt'), framed, slow push; hl = (t, x0, y0, x1, y1) yellow box in screenshot-relative 0..1 coords."""
    a, b = s(a), s(b)
    p, W_, H_ = fitted(name, w, h, crop)
    k = min(w / W_, h / H_); W_, H_ = int(W_ * k), int(H_ * k)
    eid = nid("ss")
    tw(f"#{eid}", {"scale": zoom[1]}, a, b - a, {"scale": zoom[0]}, "none")
    box = ""
    if hl:
        bid = nid("hl"); t, x0, y0, x1, y1 = hl
        tset(f"#{bid}", {"opacity": 1}, t)
        box = f'<div id="{bid}" class="hl" style="left:{x0 * 100:.1f}%;top:{y0 * 100:.1f}%;width:{(x1 - x0) * 100:.1f}%;height:{(y1 - y0) * 100:.1f}%;opacity:0"></div>'
    return (f'<div class="frame ss" style="left:{cx - W_ // 2}px;top:{cy - H_ // 2}px;width:{W_}px;height:{H_}px">'
            f'<div id="{eid}" class="ssin"><img src="{p}" alt="{name}">{box}</div></div>')
