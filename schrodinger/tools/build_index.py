"""Writes index.html from shots.py: Manim clips, photo shots with camera moves and captions, voice and music."""
import html, json, os, sys
from pathlib import Path
from PIL import Image

HERE = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(HERE))
from shots import SHOTS, FILM_END, sec

MDIR = os.environ.get("MDIR", "manim")
BG = "#0a0e17"
IMG = HERE / "assets" / "img"


def img_src(name):
    for ext in (".jpg", ".jpeg", ".png"):
        if (IMG / (name + ext)).exists():
            return f"assets/img/{name}{ext}", Image.open(IMG / (name + ext)).size
    raise SystemExit("missing image " + name)


CAP = {
    "low": "left:0;right:0;bottom:120px;text-align:center;font-size:60px;",
    "low2": "left:0;right:0;bottom:50px;text-align:center;font-size:60px;",
    "tag": "left:96px;top:70px;font-size:64px;",
    "tag2": "left:96px;top:152px;font-size:52px;",
    "mid": "left:0;right:0;top:330px;text-align:center;font-size:92px;",
    "mid2": "left:0;right:0;top:470px;text-align:center;font-size:92px;",
    "mid3": "left:0;right:0;top:610px;text-align:center;font-size:92px;",
}
body, tl = [], []
for i, s in enumerate(SHOTS):
    a, b = s["start"], s["end"]
    d = b - a
    sid = s["name"]
    if s["kind"] == "m":
        body.append(f'<video id="v_{sid}" class="clip full" src="assets/{MDIR}/{sid}.mp4" muted playsinline data-start="{a:.3f}" data-duration="{d:.3f}" data-track-index="1" style="z-index:1"></video>')
        continue
    src, (w, h) = img_src(s["img"])
    layout = s.get("layout", "full")
    kb = s.get("kb", "in")
    inner = []
    if layout == "full":
        inner.append(f'<div class="kb" id="k_{sid}"><img class="full" src="{src}" alt="{sid}"></div>')
        if kb == "in":
            tl.append(f'tl.fromTo("#k_{sid}",{{scale:1}},{{scale:1.07,duration:{d:.3f},ease:"none"}},{a:.3f});')
        elif kb == "out":
            tl.append(f'tl.fromTo("#k_{sid}",{{scale:1.07}},{{scale:1,duration:{d:.3f},ease:"none"}},{a:.3f});')
        else:
            tl.append(f'tl.fromTo("#k_{sid}",{{scale:1.12,x:-46}},{{scale:1.12,x:46,duration:{d:.3f},ease:"none"}},{a:.3f});')
        if any(c[2].startswith("low") for c in s.get("caps", [])):
            inner.append('<div class="scrim-b"></div>')
        if any(c[2].startswith("mid") for c in s.get("caps", [])):
            inner.append('<div class="scrim-a"></div>')
        if any(c[2].startswith("tag") for c in s.get("caps", [])):
            inner.append('<div class="scrim-t"></div>')
    else:
        side = s.get("side", "right")
        ph = 900
        pw = min(int(ph * w / h), 860)
        pos = f"right:140px" if side == "right" else "left:140px"
        inner.append(f'<div class="kb pframe" id="k_{sid}" style="{pos};width:{pw}px;height:{ph}px"><img class="full" src="{src}" alt="{sid}" style="width:{pw}px;height:{ph}px"></div>')
        tl.append(f'tl.fromTo("#k_{sid}",{{scale:1}},{{scale:1.035,duration:{d:.3f},ease:"none"}},{a:.3f});')
        tx = 1920 - pw - 140 - 150
        tpos = f"left:110px;width:{tx}px" if side == "right" else f"left:{140 + pw + 90}px;width:{tx}px"
        inner.append(f'<div class="ptext" style="{tpos}"><div class="who">{html.escape(s["who"])}</div><div class="line">{html.escape(s.get("line", ""))}</div></div>')
        y = 610
        for j, q in enumerate(s.get("quote", [])):
            qt, qa = q
            qid = f"q_{sid}_{j}"
            inner.append(f'<div class="quote" id="{qid}" style="{tpos};top:{y}px">{html.escape(qt)}</div>')
            y += 104 if len(qt) < 34 else 170
            t = sec(qa)
            tl.append(f'tl.fromTo("#{qid}",{{opacity:0,y:12}},{{opacity:1,y:0,duration:0.35,ease:"power2.out"}},{t:.3f});')
    for j, (txt, t0, style) in enumerate(s.get("caps", [])):
        cid = f"c_{sid}_{j}"
        inner.append(f'<div class="cap" id="{cid}" style="{CAP[style]}">{html.escape(txt)}</div>')
        tl.append(f'tl.fromTo("#{cid}",{{opacity:0,y:10}},{{opacity:1,y:0,duration:0.32,ease:"power2.out"}},{sec(t0):.3f});')
    fid = f"f_{sid}"
    inner.append(f'<div class="fader" id="{fid}"></div>')
    fi = min(0.22, d / 4)
    tl.append(f'tl.fromTo("#{fid}",{{opacity:1}},{{opacity:0,duration:{fi:.3f},ease:"none"}},{a:.3f});')
    tl.append(f'tl.to("#{fid}",{{opacity:1,duration:{fi:.3f},ease:"none"}},{b - fi - 0.034:.3f});')
    body.append(f'<div id="p_{sid}" class="clip shot" data-start="{a:.3f}" data-duration="{d:.3f}" data-track-index="2" data-layout-allow-overflow data-layout-allow-overlap>{"".join(inner)}</div>')

mus = []

SFX = [("0:17.97", "impact-bass-1", 0.5), ("1:12.62", "impact-bass-2", 0.55), ("1:35.40", "glitch-1", 0.3), ("1:50.75", "glitch-2", 0.3),
       ("7:26.69", "impact-bass-1", 0.55), ("9:24.14", "click", 0.7), ("9:26.74", "click", 0.7), ("9:28.10", "click", 0.7),
       ("0:51.11", "whoosh-short", 0.3), ("2:20.74", "whoosh", 0.3), ("4:16.56", "whoosh-cinematic", 0.28), ("5:01.73", "whoosh-short", 0.3),
       ("8:24.23", "whoosh", 0.3), ("10:19.36", "whoosh-cinematic", 0.28), ("12:15.60", "whoosh-short", 0.3), ("13:02.01", "whoosh", 0.3),
       ("11:07.60", "pop", 0.4), ("11:08.25", "pop", 0.4), ("11:09.02", "pop", 0.4), ("11:09.82", "pop", 0.4)]
def fx_len(f):
    import subprocess
    probe = r"C:/Users/daggu222105/AppData/Local/Microsoft/WinGet/Packages/Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe/ffmpeg-8.1-full_build/bin/ffprobe.exe"
    return float(subprocess.run([probe, "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(HERE / "assets" / "sfx" / (f + ".mp3"))], capture_output=True, text=True).stdout)


for i, (t, f, v) in enumerate(SFX):
    mus.append(f'<audio id="fx{i}" class="clip" src="assets/sfx/{f}.mp3" data-start="{sec(t):.3f}" data-duration="{fx_len(f):.2f}" data-volume="{v}" data-track-index="12"></audio>')

doc = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1920px;height:1080px;overflow:hidden;background:{BG}}}
#root{{position:relative;width:1920px;height:1080px;overflow:hidden;background:{BG};font-family:"EB Garamond",serif;color:#f4f1e8}}
.full{{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}}
.shot{{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;background:{BG};z-index:5}}
.kb{{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}}
.pframe{{top:90px;left:auto;outline:1px solid #2a3345}}
.pframe img{{object-fit:cover}}
.ptext{{position:absolute;top:320px}}
.who{{font-size:92px;line-height:1.05;font-weight:500}}
.line{{font-size:50px;color:#8b93a7;margin-top:18px}}
.quote{{position:absolute;font-size:62px;line-height:1.15;font-style:italic;color:#ffc857;opacity:0}}
.cap{{position:absolute;color:#fff;opacity:0;text-shadow:0 2px 16px rgba(0,0,0,.85)}}
.scrim-b{{position:absolute;left:0;right:0;bottom:0;height:380px;background:linear-gradient(to top,rgba(5,8,14,.78),rgba(5,8,14,0))}}
.scrim-t{{position:absolute;left:0;top:0;width:1100px;height:300px;background:linear-gradient(to bottom right,rgba(5,8,14,.72),rgba(5,8,14,0) 70%)}}
.scrim-a{{position:absolute;inset:0;background:rgba(5,8,14,.5)}}
.fader{{position:absolute;inset:0;background:{BG};opacity:0}}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{FILM_END}" data-width="1920" data-height="1080">
{chr(10).join(body)}
<audio id="vo" class="clip" src="assets/vo.mp3" data-start="0" data-duration="{FILM_END}" data-volume="1" data-track-index="10"></audio>
{chr(10).join(mus)}
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
print(len(SHOTS), "shots;", f"Manim {m:.0f}s = {m / FILM_END:.0%}, photos {FILM_END - m:.0f}s")
