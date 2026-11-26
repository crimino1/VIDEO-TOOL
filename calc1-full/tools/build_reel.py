"""Writes index.html: every non-Manim shot (images, memes, chapter cards, practice cards) back to back as one HyperFrames reel.
assemble.py later cuts the rendered reel and the Manim clips into film order. Reel offsets are frame-aligned.

Kinds (see shots.py):
  p  images pinned on the board: imgs=[(name, "m:ss.ss"), ...], title=, caps=[(text, "m:ss.ss")]
  g  meme clip: clip=<assets/memes/name.mp4>, cap=, title=
  c  chapter card: num=, title=, doodle=triangle|circle|wave|star
  q  practice card: sub= (default "Pause the video and try it")
"""
import html, json, math, os, subprocess, sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))
from shots import SHOTS, sec, FPS

PROBE = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Links/ffprobe.exe"
YEL, PINK, BLUE, GRN, ORG, PURP, CHALK = "#ffe27a", "#ff9fb8", "#8fd0ff", "#a6e3a1", "#ffb46b", "#c58cff", "#f3f1ea"
COLORS = [YEL, GRN, BLUE, PINK, ORG, PURP]


def img_src(name):
    for ext in (".jpg", ".jpeg", ".png", ".webp"):
        p = HERE / "assets" / "img" / (name + ext)
        if p.exists():
            return f"assets/img/{name}{ext}", Image.open(p).size
    raise SystemExit("missing image " + name)


def clip_len(name):
    p = HERE / "assets" / "memes" / (name + ".mp4")
    if not p.exists():
        raise SystemExit("missing meme " + name)
    out = subprocess.run([PROBE, "-v", "error", "-show_entries", "format=duration:stream=width,height", "-of", "json", str(p)], capture_output=True, text=True).stdout
    j = json.loads(out)
    st = [s for s in j["streams"] if s.get("width")][0]
    return float(j["format"]["duration"]), (st["width"], st["height"])


def brush_svg(w, seed=1, color=YEL, cls="brush"):
    """Wobbly chalk brush strokes as SVG paths (deterministic)."""
    import random
    r = random.Random(seed)
    paths = []
    for k in range(4):
        x0, x1 = r.uniform(0, w * 0.04), w - r.uniform(0, w * 0.04)
        pts = []
        for i in range(25):
            x = x0 + (x1 - x0) * i / 24
            y = 14 + 4 * math.sin(x / 60 + k) + r.gauss(0, 1.2) + (k - 1.5) * 4
            pts.append(f"{x:.1f},{y:.1f}")
        paths.append(f'<polyline points="{" ".join(pts)}" fill="none" stroke="{color}" stroke-width="{r.uniform(6, 11):.1f}" stroke-linecap="round" opacity="{r.uniform(.7, 1):.2f}" pathLength="1" />')
    return f'<svg class="{cls}" width="{w}" height="28" viewBox="0 0 {w} 28">{"".join(paths)}</svg>'


DOODLES = {
    "triangle": '<polyline points="20,200 260,200 260,40 20,200" pathLength="1"/><polyline points="236,200 236,176 260,176" pathLength="1"/><path d="M70,200 A50,50 0 0,0 64,172" pathLength="1"/>',
    "circle": '<circle cx="140" cy="120" r="95" pathLength="1"/><line x1="20" y1="120" x2="260" y2="120" pathLength="1"/><line x1="140" y1="0" x2="140" y2="240" pathLength="1"/><line x1="140" y1="120" x2="207" y2="53" pathLength="1"/>',
    "wave": '<path d="M10,120 C50,10 90,10 130,120 S210,230 250,120" pathLength="1"/><line x1="0" y1="120" x2="270" y2="120" pathLength="1"/>',
    "star": '<polyline points="140,20 165,95 245,95 180,140 205,215 140,170 75,215 100,140 35,95 115,95 140,20" pathLength="1"/>',
}


def cut(t, a):
    return a + (sec(t) - SH["start"])


body, tl, clicks, reel = [], [], [], []
off_f = 0
for s in SHOTS:
    if s["kind"] == "m":
        continue
    SH = s
    nf = round(s["end"] * FPS) - round(s["start"] * FPS)
    a, d = off_f / FPS, nf / FPS
    off_f += nf
    sid = s["name"]
    k = s["kind"]
    reel.append(dict(name=sid, film_start=s["start"], film_end=s["end"], reel_start_f=round(a * FPS), frames=nf))
    inner = []
    if s.get("title") and k in ("p", "g"):
        tw = min(1500, 40 + 30 * len(s["title"]))
        inner.append(f'<div class="ttl"><div class="tt">{html.escape(s["title"])}</div>{brush_svg(tw, len(sid))}</div>')
    if k == "p":
        imgs = s["imgs"]
        n = len(imgs)
        top = 210 if s.get("title") else 120
        bottom = 210 if s.get("caps") else 110
        gap = 60
        cols = 1 if n == 1 else (2 if n <= 4 else 3)
        rows = math.ceil(n / cols)
        cellh = (1080 - top - bottom - gap * (rows - 1)) / rows
        cellw = (1680 - gap * (cols - 1)) / cols
        for j, (name, t0) in enumerate(imgs):
            src, (w, h) = img_src(name)
            r, c = divmod(j, cols)
            inrow = min(cols, n - r * cols)  # a short last row is centred
            x0 = 120 + (1680 - inrow * cellw - (inrow - 1) * gap) / 2 + c * (cellw + gap)
            sc = min(cellw / w, cellh / h)
            pw, ph = int(w * sc), int(h * sc)
            px = int(x0 + (cellw - pw) / 2)
            py = int(top + r * (cellh + gap) + (cellh - ph) / 2)
            pid = f"i_{sid}_{j}"
            rot = [-2.2, 1.8, -1.2, 2.4][(j + len(sid)) % 4]
            inner.append(f'<div class="ph" id="{pid}" style="left:{px}px;top:{py}px;width:{pw}px;height:{ph}px"><img id="{pid}_im" src="{src}" alt="{html.escape(name)}"><div class="tape"></div></div>')
            ts = cut(t0, a)
            tl.append(f'tl.fromTo("#{pid}",{{opacity:0,scale:.94,rotation:{rot - 1}}},{{opacity:1,scale:1,rotation:{rot},duration:.4,ease:"power2.out"}},{ts:.3f});')
            tl.append(f'tl.fromTo("#{pid}_im",{{scale:1}},{{scale:1.06,duration:{max(0.5, a + d - ts):.3f},ease:"none"}},{ts:.3f});')
            clicks.append(sec(t0))
        for j, (txt, t0) in enumerate(s.get("caps", [])):
            cid = f"c_{sid}_{j}"
            inner.append(f'<div class="cap" id="{cid}">{html.escape(txt)}</div>')
            tl.append(f'tl.fromTo("#{cid}",{{opacity:0,y:14}},{{opacity:1,y:0,duration:.35,ease:"power2.out"}},{cut(t0, a):.3f});')
            if j:
                tl.append(f'tl.to("#c_{sid}_{j - 1}",{{opacity:0,duration:.2}},{cut(t0, a) - 0.05:.3f});')
    elif k == "g":
        L, (w, h) = clip_len(s["clip"])
        top = 210 if s.get("title") else 110
        bottom = 210 if s.get("cap") else 100
        boxh, boxw = 1080 - top - bottom, 1500
        sc = min(boxw / w, boxh / h)
        pw, ph = int(w * sc), int(h * sc)
        px, py = (1920 - pw) // 2, int(top + (boxh - ph) / 2)
        vid = f"v_{sid}"
        vd = min(d, L - 0.05)
        t_in = s.get("t_in", 0.0)
        # the last frame sits underneath, so a clip shorter than the shot freezes instead of vanishing
        last = HERE / "assets" / "memes" / f"{s['clip']}_last.jpg"
        if not last.exists():
            subprocess.run([PROBE.replace("ffprobe", "ffmpeg"), "-v", "error", "-y", "-sseof", "-0.2", "-i", str(HERE / "assets" / "memes" / (s["clip"] + ".mp4")), "-frames:v", "1", "-q:v", "3", str(last)], check=True)
        inner.append(f'<div class="ph meme" id="m_{sid}" style="left:{px}px;top:{py}px;width:{pw}px;height:{ph}px"><img src="assets/memes/{s["clip"]}_last.jpg" alt="meme"></div>')
        body.append(f'<video id="{vid}" class="clip mv" src="assets/memes/{s["clip"]}.mp4" muted playsinline data-start="{a:.3f}" data-duration="{vd:.3f}" data-media-start="{t_in:.2f}" data-track-index="3" style="left:{px}px;top:{py}px;width:{pw}px;height:{ph}px"></video>')
        tl.append(f'tl.fromTo(["#m_{sid}","#{vid}"],{{opacity:0,scale:.94,rotation:-2}},{{opacity:1,scale:1,rotation:-1.5,duration:.4,ease:"power2.out"}},{a + 0.02:.3f});')
        clicks.append(s["start"] + 0.02)
        if s.get("cap"):
            cid = f"c_{sid}"
            inner.append(f'<div class="cap" id="{cid}">{html.escape(s["cap"])}</div>')
            tl.append(f'tl.fromTo("#{cid}",{{opacity:0,y:14}},{{opacity:1,y:0,duration:.35,ease:"power2.out"}},{a + 0.25:.3f});')
    elif k == "c":
        col = COLORS[int(s.get("num", 0)) % len(COLORS)] if str(s.get("num", "")).isdigit() else YEL
        doodle = DOODLES[s.get("doodle", "star")]
        label = f"Chapter {s['num']}" if s.get("num") is not None else s.get("label", "")
        tw = min(1600, 60 + 52 * len(s["title"]))
        inner.append(f'<div class="cnum" id="n_{sid}" style="border-color:{col}">{html.escape(label)}</div>')
        inner.append(f'<div class="ctitle" id="t_{sid}" style="font-size:{min(136, int(3300 / max(1, len(s["title"]))))}px">{html.escape(s["title"])}</div>')
        inner.append(f'<div class="cbrush" id="b_{sid}">{brush_svg(tw, len(sid) + 3, col, "brush big")}</div>')
        inner.append(f'<svg class="doodle" id="d_{sid}" viewBox="0 0 280 240" fill="none" stroke="{col}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round">{doodle}</svg>')
        tl.append(f'tl.fromTo("#n_{sid}",{{opacity:0,y:10}},{{opacity:1,y:0,duration:.45,ease:"power2.out"}},{a + 0.1:.3f});')
        tl.append(f'tl.fromTo("#t_{sid}",{{clipPath:"inset(-20% 100% -20% 0)"}},{{clipPath:"inset(-20% 0% -20% 0)",duration:{min(1.1, d * 0.35):.2f},ease:"power1.inOut"}},{a + 0.35:.3f});')
        tl.append(f'tl.fromTo("#b_{sid} polyline",{{strokeDashoffset:1,strokeDasharray:1}},{{strokeDashoffset:0,duration:.6,stagger:.08,ease:"power2.out"}},{a + min(1.3, d * 0.45):.3f});')
        tl.append(f'tl.fromTo("#d_{sid} > *",{{strokeDashoffset:1,strokeDasharray:1}},{{strokeDashoffset:0,duration:.7,stagger:.15,ease:"power1.inOut"}},{a + 0.2:.3f});')
        tl.append(f'tl.fromTo("#d_{sid}",{{rotation:-6}},{{rotation:4,duration:{d:.3f},ease:"sine.inOut"}},{a:.3f});')
    elif k == "q":
        sub = s.get("sub", "Pause the video and try it")
        qtitle = s.get("title", "Practice Time!")
        inner.append(f'<div class="qt" id="q_{sid}" style="font-size:{min(150, int(2400 / max(1, len(qtitle))))}px">{html.escape(qtitle)}</div>')
        inner.append(f'<div class="cbrush q" id="b_{sid}">{brush_svg(900, len(sid), GRN, "brush big")}</div>')
        inner.append(f'<div class="qs" id="s_{sid}">{html.escape(sub)}</div>')
        deco = "title" not in s  # pencil + tick only on the plain practice card
        if deco: inner.append(f'<svg class="pencil" id="p_{sid}" viewBox="0 0 200 200" fill="none" stroke="{YEL}" stroke-width="6" stroke-linejoin="round" stroke-linecap="round">'
                     f'<polygon points="40,160 60,180 170,70 150,50"/><polyline points="40,160 30,190 60,180"/><line x1="140" y1="60" x2="160" y2="80"/></svg>')
        if deco: inner.append(f'<svg class="tickq" id="k_{sid}" viewBox="0 0 120 100" fill="none" stroke="{GRN}" stroke-width="10" stroke-linecap="round"><polyline points="10,55 45,88 110,12" pathLength="1"/></svg>')
        tl.append(f'tl.fromTo("#q_{sid}",{{opacity:0,y:16}},{{opacity:1,y:0,duration:.5,ease:"power2.out"}},{a + 0.05:.3f});')
        tl.append(f'tl.fromTo("#b_{sid} polyline",{{strokeDashoffset:1,strokeDasharray:1}},{{strokeDashoffset:0,duration:.5,stagger:.06}},{a + 0.35:.3f});')
        tl.append(f'tl.fromTo("#s_{sid}",{{opacity:0}},{{opacity:1,duration:.4}},{a + 0.6:.3f});')
        reps = max(1, int(d / 0.8))
        if deco: tl.append(f'tl.fromTo("#p_{sid}",{{rotation:-3,x:0}},{{rotation:3,x:6,duration:.4,repeat:{reps},yoyo:true,ease:"sine.inOut"}},{a:.3f});')
        if deco: tl.append(f'tl.fromTo("#k_{sid} polyline",{{strokeDashoffset:1,strokeDasharray:1}},{{strokeDashoffset:0,duration:.45,ease:"power2.out"}},{a + min(0.9, d * 0.5):.3f});')
    elif k == "s":
        line = s.get("line", "Full calculus course coming soon")
        inner.append(f'<svg class="subbtn" id="sb_{sid}" viewBox="0 0 760 200" fill="none" stroke="{PINK}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"><path d="M60,22 Q24,24 22,70 L22,130 Q24,176 64,178 L696,180 Q738,176 738,132 L738,68 Q736,22 694,20 Z" pathLength="1"/></svg>')
        inner.append(f'<div class="subtxt" id="st_{sid}">Subscribe</div>')
        inner.append(f'<svg class="bell" id="bl_{sid}" viewBox="0 0 200 220" fill="none" stroke="{YEL}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"><path d="M100,30 C60,30 46,62 46,100 L46,140 L28,168 L172,168 L154,140 L154,100 C154,62 140,30 100,30 Z" pathLength="1"/><path d="M82,184 Q100,206 118,184" pathLength="1"/><line x1="100" y1="12" x2="100" y2="30" pathLength="1"/></svg>')
        inner.append(f'<div class="subline" id="sl_{sid}">{html.escape(line)}</div>')
        tl.append(f'tl.fromTo("#sb_{sid} path",{{strokeDashoffset:1,strokeDasharray:1}},{{strokeDashoffset:0,duration:.8,ease:"power1.inOut"}},{a + 0.15:.3f});')
        tl.append(f'tl.fromTo("#st_{sid}",{{opacity:0}},{{opacity:1,duration:.4}},{a + 0.55:.3f});')
        tl.append(f'tl.fromTo("#bl_{sid} > *",{{strokeDashoffset:1,strokeDasharray:1}},{{strokeDashoffset:0,duration:.7,stagger:.12,ease:"power1.inOut"}},{a + 0.6:.3f});')
        tl.append(f'tl.fromTo("#bl_{sid}",{{rotation:0}},{{keyframes:[{{rotation:12,duration:.12}},{{rotation:-10,duration:.12}},{{rotation:6,duration:.12}},{{rotation:0,duration:.14}}]}},{a + 1.5:.3f});')
        tl.append(f'tl.fromTo("#sl_{sid}",{{opacity:0,y:10}},{{opacity:1,y:0,duration:.45,ease:"power2.out"}},{a + 1.0:.3f});')
    else:
        raise SystemExit(f"unknown kind {k} in {sid}")
    fid = f"f_{sid}"
    inner.append(f'<div class="fader" id="{fid}"></div>')
    fi = min(0.18, d / 5)
    tl.append(f'tl.fromTo("#{fid}",{{opacity:1}},{{opacity:0,duration:{fi:.3f},ease:"none"}},{a:.3f});')
    tl.append(f'tl.to("#{fid}",{{opacity:1,duration:{fi:.3f},ease:"none"}},{a + d - fi - 0.034:.3f});')
    body.append(f'<div id="s_{sid}" class="clip shot" data-start="{a:.3f}" data-duration="{d:.3f}" data-track-index="2" data-layout-allow-overflow data-layout-allow-overlap>{"".join(inner)}</div>')

TOTAL = off_f / FPS
doc = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
@font-face{{font-family:"Kalam";src:url("assets/fonts/Kalam-Regular.ttf");font-weight:400}}
@font-face{{font-family:"Kalam";src:url("assets/fonts/Kalam-Bold.ttf");font-weight:700}}
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1920px;height:1080px;overflow:hidden;background:#1b1b1c}}
#root{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#1b1b1c url("assets/img/chalkboard.jpg") center/cover;font-family:"Kalam",cursive;color:{CHALK}}}
.shot{{position:absolute;inset:0;overflow:hidden;background:url("assets/img/chalkboard.jpg") center/cover;z-index:2}}
.ttl{{position:absolute;left:0;right:0;top:26px;text-align:center}}
.tt{{font-weight:700;font-size:76px;line-height:1.1}}
.brush{{display:block;margin:-6px auto 0}}
.ph{{position:absolute;overflow:hidden;border:10px solid #f4f2ec;border-radius:6px;box-shadow:0 18px 40px rgba(0,0,0,.6);background:#222}}
.ph img{{width:100%;height:100%;object-fit:cover;display:block}}
.tape{{position:absolute;left:50%;top:-14px;width:150px;height:38px;margin-left:-75px;background:rgba(255,236,170,.55);transform:rotate(-3deg)}}
.mv{{position:absolute;z-index:4;border:10px solid #f4f2ec;border-radius:6px;object-fit:cover;box-shadow:0 18px 40px rgba(0,0,0,.6)}}
.cap{{position:absolute;left:0;right:0;bottom:60px;text-align:center;font-size:62px;color:{YEL};opacity:0;text-shadow:0 3px 14px rgba(0,0,0,.6)}}
.cnum{{position:absolute;left:50%;top:250px;width:420px;margin-left:-210px;text-align:center;font-weight:700;font-size:56px;border:5px solid;border-radius:60px;padding:4px 0}}
.ctitle{{position:absolute;left:0;right:0;top:400px;text-align:center;font-weight:700;font-size:136px;line-height:1.1;white-space:nowrap}}
.cbrush{{position:absolute;left:0;right:0;top:575px;text-align:center}}
.big{{transform:scaleY(1.5)}}
.doodle{{position:absolute;right:120px;bottom:70px;width:300px;height:257px;opacity:.85}}
.qt{{position:absolute;left:0;right:0;top:330px;text-align:center;font-weight:700;font-size:150px}}
.cbrush.q{{top:520px}}
.qs{{position:absolute;left:0;right:0;top:600px;text-align:center;font-size:64px;color:{YEL};opacity:0}}
.pencil{{position:absolute;left:250px;top:300px;width:220px;height:220px}}
.tickq{{position:absolute;right:150px;top:300px;width:200px;height:170px}}
.subbtn{{position:absolute;left:390px;top:330px;width:760px;height:200px}}
.subtxt{{position:absolute;left:390px;top:368px;width:760px;text-align:center;font-weight:700;font-size:100px;opacity:0}}
.bell{{position:absolute;left:1240px;top:318px;width:200px;height:220px;transform-origin:50% 8%}}
.subline{{position:absolute;left:0;right:0;top:640px;text-align:center;font-size:62px;color:{YEL};opacity:0}}
.fader{{position:absolute;inset:0;background:url("assets/img/chalkboard.jpg") center/cover;opacity:0}}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{TOTAL:.3f}" data-width="1920" data-height="1080">
{chr(10).join(body)}
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
tl.set({{}}, {{}}, {TOTAL:.3f});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
(HERE / "index.html").write_text(doc, encoding="utf-8")
(HERE / "work").mkdir(exist_ok=True)
(HERE / "work" / "reel.json").write_text(json.dumps(dict(fps=FPS, total_frames=off_f, shots=reel, clicks=sorted(clicks)), indent=1))
print(f"reel: {len(reel)} shots, {TOTAL:.1f}s; clicks {len(clicks)}")
