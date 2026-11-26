"""Writes index.html from shots.py: Manim clips, keyword cards (black), photos (Ken Burns + caption), portrait cards (navy), voice + SFX.
Glow & Doodle style: channels/physics.md."""
import html, json, math, os, subprocess, sys, urllib.request
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))
from shots import SHOTS, FILM_END, sec

FF = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffprobe.exe"
IMG, SMALL, EMO = HERE / "assets" / "img", HERE / "assets" / "img_s", HERE / "assets" / "emoji"
SMALL.mkdir(exist_ok=True)
COL = {"gold": "#ffc23d", "cyan": "#3fd8ff", "coral": "#ff5a6e", None: "#f2f2f2"}
POS = {"c": (960, 540), "up": (960, 250), "low": (960, 820), "top": (960, 170)}
SIZE = {"c": 104, "up": 64, "low": 72, "top": 56}


def img(name, maxw=2000):
    """Downscaled copy for a fast render; returns (path, w, h)."""
    for ext in (".jpg", ".jpeg", ".png"):
        src = IMG / (name + ext)
        if src.exists():
            out = SMALL / (name + ".jpg")
            if not out.exists() or out.stat().st_mtime < src.stat().st_mtime:
                im = Image.open(src).convert("RGB")
                im.thumbnail((maxw, maxw))
                im.save(out, quality=90)
            w, h = Image.open(out).size
            return f"assets/img_s/{name}.jpg", w, h
    raise SystemExit("missing image " + name)


def emoji_file(code):
    p = EMO / (code + ".png")
    if not p.exists():
        urllib.request.urlretrieve(f"https://fonts.gstatic.com/s/e/notoemoji/latest/{code}/512.png", p)
    return f"assets/emoji/{code}.png"


def is_emoji(ch):
    o = ord(ch)
    return o >= 0x1F000 or 0x2600 <= o <= 0x27BF or o in (0x23F1, 0x2B50)


def rich(s):
    """Escape text and swap emoji characters for Noto images."""
    out = []
    for ch in s:
        if ord(ch) == 0xFE0F:
            continue
        out.append(f'<img class="ei" src="{emoji_file(format(ord(ch), "x"))}" alt="">' if is_emoji(ch) else html.escape(ch))
    return "".join(out)


def fit(s, size, maxw=1640):
    n = sum(1 if not is_emoji(c) else 1.6 for c in s)
    return min(size, int(maxw / max(1, n * 0.56)))


body, tl, fx = [], [], []


def pop(sel, t, kind="text"):
    if kind == "emoji":
        tl.append(f'tl.fromTo("{sel}",{{opacity:0,scale:0.4}},{{opacity:1,scale:1,duration:0.28,ease:"back.out(2.2)"}},{t:.3f});')
    else:
        tl.append(f'tl.fromTo("{sel}",{{opacity:0,scale:0.92}},{{opacity:1,scale:1,duration:0.12,ease:"power2.out"}},{t:.3f});')


def out(sel, t):
    tl.append(f'tl.to("{sel}",{{opacity:0,duration:0.08,ease:"none"}},{t - 0.08:.3f});')


def anchor(x, y, inner, cls=""):
    return f'<div class="anc {cls}" style="left:{x}px;top:{y}px">{inner}</div>'


def doodle_svg(iid, label, x1, y1, x2, y2, color):
    lw = len(label) * 26
    dx, dy = x2 - x1, y2 - y1
    d = math.hypot(dx, dy) or 1
    ux, uy = dx / d, dy / d
    r = 46 + abs(ux) * lw / 2
    sx, sy = x1 + ux * r, y1 + uy * r
    mx, my = (sx + x2) / 2 - uy * d * 0.18, (sy + y2) / 2 + ux * d * 0.18
    ex, ey = x2 - mx, y2 - my
    e = math.hypot(ex, ey) or 1
    ex, ey = ex / e, ey / e
    h1 = (x2 - 26 * (ex * 0.8 - ey * 0.6), y2 - 26 * (ey * 0.8 + ex * 0.6))
    h2 = (x2 - 26 * (ex * 0.8 + ey * 0.6), y2 - 26 * (ey * 0.8 - ex * 0.6))
    svg = (f'<svg class="dsvg" width="1920" height="1080" viewBox="0 0 1920 1080"><path id="{iid}p" pathLength="1" d="M{sx:.0f},{sy:.0f} Q{mx:.0f},{my:.0f} {x2:.0f},{y2:.0f} '
           f'M{h1[0]:.0f},{h1[1]:.0f} L{x2:.0f},{y2:.0f} L{h2[0]:.0f},{h2[1]:.0f}" stroke="{color}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round" '
           f'stroke-dasharray="1" stroke-dashoffset="1" opacity="0"/></svg>')
    lab = anchor(x1, y1, f'<div id="{iid}" class="pop hand" style="color:{color}">{rich(label)}</div>')
    return svg + lab


SFX = []


def sfx(t, name, vol):
    SFX.append((round(t, 3), name, vol))


for s in SHOTS:
    a, b, sid, kind = s["start"], s["end"], s["name"], s["kind"]
    d = b - a
    if kind == "m":
        body.append(f'<video id="v_{sid}" class="clip full" src="assets/manim/{sid}.mp4" muted playsinline data-start="{a:.3f}" data-duration="{d:.3f}" data-track-index="1" style="z-index:1"></video>')
        continue
    inner = []
    if kind == "p":
        src, w, h = img(s["img"])
        inner.append(f'<div class="kb" id="k_{sid}"><img class="full" src="{src}" alt="{sid}"></div><div class="scrim-b"></div>')
        z0, z1 = (1, 1.08) if s.get("kb", "in") == "in" else (1.08, 1)
        tl.append(f'tl.fromTo("#k_{sid}",{{scale:{z0}}},{{scale:{z1},duration:{d:.3f},ease:"none"}},{a:.3f});')
        caps = s.get("caps", [])
        for j, (txt, t0) in enumerate(caps):
            cid = f"c_{sid}_{j}"
            t0 = max(sec(t0), a)
            inner.append(anchor(960, 930, f'<div id="{cid}" class="pop cap" style="font-size:{fit(txt, 66)}px">{rich(txt)}</div>'))
            pop(f"#{cid}", t0)
            if j + 1 < len(caps):
                out(f"#{cid}", sec(caps[j + 1][1]))
        sfx(a, "whoosh-short", 0.18)
    elif kind == "q":
        src, w, h = img(s["img"], 1400)
        ph = 780
        pw = min(int(ph * w / h), 640)
        side = s.get("side", "r")
        px = 1920 - 200 - pw if side == "r" else 200
        tx = 200 if side == "r" else 200 + pw + 110
        tw = 1920 - pw - 200 - 110 - 200
        op = 0.8 if s.get("dim") else 1
        inner.append(f'<div class="navy"></div><div class="pframe" style="left:{px}px;top:150px;width:{pw}px;height:{ph}px;opacity:{op}"><div class="kb" id="k_{sid}" style="width:{pw}px;height:{ph}px">'
                     f'<img src="{src}" alt="{sid}" style="width:{pw}px;height:{ph}px;object-fit:cover;object-position:50% 20%"></div></div>')
        tl.append(f'tl.fromTo("#k_{sid}",{{scale:1}},{{scale:1.05,duration:{d:.3f},ease:"none"}},{a:.3f});')
        inner.append(f'<div class="ptext" style="left:{tx}px;width:{tw}px"><div class="who" id="w_{sid}">{html.escape(s["who"])}</div><div class="yrs" id="y_{sid}">{html.escape(s["yrs"])}</div>')
        for j, (txt, t0) in enumerate(s.get("lines", [])):
            inner.append(f'<div class="pline" id="l_{sid}_{j}">{rich(txt)}</div>')
            tl.append(f'tl.fromTo("#l_{sid}_{j}",{{opacity:0,y:14}},{{opacity:1,y:0,duration:0.3,ease:"power2.out"}},{max(sec(t0), a + 0.25):.3f});')
        inner.append("</div>")
        tl.append(f'tl.fromTo("#w_{sid}",{{opacity:0,x:-20}},{{opacity:1,x:0,duration:0.35,ease:"power2.out"}},{a + 0.05:.3f});')
        tl.append(f'tl.fromTo("#y_{sid}",{{opacity:0}},{{opacity:1,duration:0.35}},{a + 0.2:.3f});')
        sfx(a, "whoosh-short", 0.18)
    else:  # keyword card
        items = s["items"]
        last = {}
        for j, it in enumerate(items):
            typ, content, t0, pos = it[:4]
            o = it[4] if len(it) > 4 else {}
            t0 = max(sec(t0), a)
            iid = f"i_{sid}_{j}"
            key = (typ, pos if isinstance(pos, str) else tuple(pos[:2]))
            if typ in ("t", "e") and key in last:
                out(f"#{last[key]}", t0)
                del last[key]
            if typ in ("t", "e") and content == "":
                continue
            if typ in ("t", "e"):
                last[key] = iid
            x, y = POS[pos] if isinstance(pos, str) else pos[:2]
            if typ == "t":
                fs = fit(content, o.get("size", SIZE.get(pos if isinstance(pos, str) else "c", 96)))
                fam = "font-family:'EB Garamond',serif;font-style:italic;" if o.get("font") == "math" else ""
                inner.append(anchor(x, y, f'<div id="{iid}" class="pop kw" style="font-size:{fs}px;color:{COL[o.get("color")]};{fam}">{rich(content)}</div>'))
                pop(f"#{iid}", t0)
                if pos == "c" and not any(i[0] == "e" and abs(sec(i[2]) - sec(it[2])) < 0.05 for i in items):
                    sfx(t0, "pop", 0.22)
                if o.get("wait"):
                    tl.append(f'tl.fromTo("#fl_{sid}",{{opacity:0.9}},{{opacity:0,duration:0.18,ease:"power1.out"}},{t0:.3f});')
                    tl.append(f'tl.fromTo("#st_{sid}",{{x:-14}},{{x:0,duration:0.25,ease:"elastic.out(1,0.3)"}},{t0:.3f});')
                    sfx(t0 - 0.05, "scratch", 0.45)
            elif typ == "e":
                sz = o.get("size", 300)
                if pos == "c":
                    x, y = 960, 520
                inner.append(anchor(x, y, f'<img id="{iid}" class="pop" src="{emoji_file(content)}" style="width:{sz}px;height:{sz}px" alt="">'))
                pop(f"#{iid}", t0, "emoji")
                sfx(t0, "pop", 0.3)
            elif typ == "i":
                src, w, h = img(content, 1200)
                ww = pos[2]
                hh = int(ww * h / w)
                inner.append(anchor(x, y, f'<img id="{iid}" class="pop framed" src="{src}" style="width:{ww}px;height:{hh}px" alt="">'))
                pop(f"#{iid}", t0, "emoji")
                sfx(t0, "pop", 0.22)
            elif typ == "a":
                inner.append(doodle_svg(iid, content, *pos, COL[o.get("color")]))
                tl.append(f'tl.fromTo("#{iid}",{{opacity:0}},{{opacity:1,duration:0.2}},{t0:.3f});')
                tl.append(f'tl.fromTo("#{iid}p",{{strokeDashoffset:1,opacity:1}},{{strokeDashoffset:0,opacity:1,duration:0.35,ease:"power2.out"}},{t0 + 0.1:.3f});')
                sfx(t0, "tick", 0.5)
            elif typ == "x":
                w = pos[2]
                hh = w * 0.5
                inner.append(f'<svg class="dsvg" width="1920" height="1080" viewBox="0 0 1920 1080"><path id="{iid}" pathLength="1" d="M{x - w / 2:.0f},{y - hh / 2:.0f} L{x + w / 2:.0f},{y + hh / 2:.0f} M{x + w / 2:.0f},{y - hh / 2:.0f} L{x - w / 2:.0f},{y + hh / 2:.0f}" '
                             f'stroke="#ff5a6e" stroke-width="12" fill="none" stroke-linecap="round" stroke-dasharray="1" stroke-dashoffset="1" opacity="0"/></svg>')
                tl.append(f'tl.fromTo("#{iid}",{{strokeDashoffset:1,opacity:1}},{{strokeDashoffset:0,opacity:1,duration:0.3,ease:"power2.out"}},{t0:.3f});')
                sfx(t0, "snap", 0.35)
            elif typ == "lab":
                inner.append(anchor(960, 70, f'<div id="{iid}" class="pop lab" style="color:{COL[o.get("color")]}">{html.escape(content)}</div>'))
                pop(f"#{iid}", t0)
                sfx(t0, "whoosh", 0.25)
            if o.get("out"):
                out(f"#{iid}", sec(o["out"]))
        inner = [f'<div class="stage" id="st_{sid}">' + "".join(inner) + f'</div><div class="flash" id="fl_{sid}"></div>']
    body.append(f'<div id="s_{sid}" class="clip shot {"black" if kind == "k" else ""}" data-start="{a:.3f}" data-duration="{d:.3f}" data-track-index="2" data-layout-allow-overflow data-layout-allow-overlap>{"".join(inner)}</div>')

# moments inside the Manim scenes (voiceover times)
for t, n, v in [("0:05.00", "whoosh", 0.25), ("0:12.78", "shimmer", 0.3), ("0:37.09", "impact-bass-1", 0.4), ("0:45.17", "spark", 0.35), ("0:53.49", "impact-bass-2", 0.45),
                ("1:03.63", "hum", 0.35), ("1:07.35", "ding", 0.3), ("1:38.95", "shimmer", 0.3), ("2:02.16", "whoosh-short", 0.25), ("2:28.11", "snap", 0.6),
                ("2:39.78", "snap", 0.35), ("2:42.92", "glitch-1", 0.25), ("2:47.38", "whoosh", 0.22), ("3:13.86", "whoosh-short", 0.2), ("3:20.32", "hum", 0.35), ("3:27.84", "hum", 0.3),
                ("3:36.79", "ding", 0.25), ("3:51.16", "spark", 0.45), ("4:09.92", "whoosh-short", 0.22), ("4:18.10", "click", 0.6), ("4:19.04", "click", 0.6), ("4:31.58", "shimmer", 0.4),
                ("4:58.10", "whoosh", 0.25), ("5:13.52", "whoosh-cinematic", 0.25), ("5:37.41", "whoosh-short", 0.25), ("5:43.24", "ding", 0.45), ("5:43.24", "impact-bass-1", 0.35),
                ("6:11.95", "whoosh", 0.2), ("6:23.90", "whoosh-short", 0.2), ("6:36.09", "shimmer", 0.3), ("6:55.26", "whoosh-cinematic", 0.25),
                ("7:21.14", "spark", 0.5), ("7:26.62", "spark", 0.4), ("7:29.96", "whoosh", 0.22), ("7:54.47", "pop", 0.3), ("7:58.25", "pop", 0.3), ("8:03.85", "pop", 0.3), ("8:07.69", "pop", 0.3),
                ("8:28.97", "shimmer", 0.3)]:
    sfx(sec(t), n, v)

SFX.sort()
kept = []
for e in SFX:
    if kept and e[0] - kept[-1][0] < 0.15 and e[1] == kept[-1][1]:
        continue
    kept.append(e)
SFX = kept


def fx_len(f):
    p = next((HERE / "assets" / "sfx" / (f + x)) for x in (".wav", ".mp3") if (HERE / "assets" / "sfx" / (f + x)).exists())
    r = subprocess.run([FF, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True).stdout
    return p.name, float(r)


lens = {}
aud = []
for i, (t, f, v) in enumerate(SFX):
    if f not in lens:
        lens[f] = fx_len(f)
    fn, ln = lens[f]
    aud.append(f'<audio id="fx{i}" class="clip" src="assets/sfx/{fn}" data-start="{max(0, t):.3f}" data-duration="{min(ln, FILM_END - t):.3f}" data-volume="{v}" data-track-index="12"></audio>')
json.dump([list(x) for x in SFX], open(HERE / "sfx.json", "w"), indent=0)

doc = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
@font-face{{font-family:"Kalam";src:url("assets/fonts/Kalam-Bold.ttf");font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1920px;height:1080px;overflow:hidden;background:#000}}
#root{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000;font-family:"Inter",sans-serif;color:#f2f2f2}}
.full{{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}}
.shot{{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;background:#05080f;z-index:5}}
.shot.black{{background:#000}}
.stage{{position:absolute;inset:0}}
.navy{{position:absolute;inset:0;background:radial-gradient(ellipse at center,#0e1a2b 0%,#05080f 80%)}}
.kb{{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}}
.anc{{position:absolute;transform:translate(-50%,-50%);white-space:nowrap;text-align:center}}
.pop{{opacity:0;display:block}}
.kw{{font-weight:600;line-height:1.1;letter-spacing:-0.01em}}
.cap{{font-weight:600;color:#fff;text-shadow:0 3px 18px rgba(0,0,0,.9)}}
.hand{{font-family:"Kalam",cursive;font-weight:700;font-size:54px;line-height:1}}
.lab{{font-weight:700;font-size:30px;letter-spacing:.16em}}
.ei{{height:1em;width:1em;vertical-align:-0.12em;margin:0 .06em}}
.framed{{border:4px solid #ffc23d;box-shadow:0 0 40px rgba(255,194,61,.25)}}
.dsvg{{position:absolute;left:0;top:0}}
.pframe{{position:absolute;overflow:hidden;border:4px solid #ffc23d;box-shadow:0 0 60px rgba(255,194,61,.18)}}
.ptext{{position:absolute;top:300px}}
.who{{font-size:84px;line-height:1.05;font-weight:700}}
.yrs{{font-size:40px;color:#8a93a6;margin-top:16px}}
.pline{{font-size:56px;font-weight:600;margin-top:34px;line-height:1.15}}
.pline .ei{{height:1em}}
.scrim-b{{position:absolute;left:0;right:0;bottom:0;height:420px;background:linear-gradient(to top,rgba(0,0,0,.8),rgba(0,0,0,0))}}
.flash{{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{FILM_END}" data-width="1920" data-height="1080">
{chr(10).join(body)}
<audio id="vo" class="clip" src="assets/vo.mp3" data-start="0" data-duration="{FILM_END}" data-volume="1" data-track-index="10"></audio>
{chr(10).join(aud)}
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
tl.set({{}}, {{}}, {FILM_END});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
(HERE / "index.html").write_text(doc, encoding="utf-8")
m = sum(s["end"] - s["start"] for s in SHOTS if s["kind"] == "m")
missing = [s["name"] for s in SHOTS if s["kind"] == "m" and not (HERE / "assets" / "manim" / (s["name"] + ".mp4")).exists()]
print(len(SHOTS), "shots;", f"Manim {m:.0f}s = {m / FILM_END:.0%};", len(SFX), "sfx; missing manim:", missing)
