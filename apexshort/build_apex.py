"""You vs 5 Apex Predators: How Long Do You Last? — 9:16 short (1080x1920). Real 4K/1080p footage cut to 9:16 windows,
one overlay canvas (assets/js/hud.js) for the survival clock and the explainer graphics. Writes index.html and usage.json."""
import json, os, subprocess
import lib as L
from lib import *

L.OUT_W, L.OUT_H = 1080, 1920
L.SHARPEN = ",unsharp=5:5:0.35:5:5:0.0"
GRADE = "eq=saturation=0.94:contrast=1.03"          # one gentle grade over every source so the cut feels like one film
END = round(float(subprocess.run([FF.replace("ffmpeg.exe", "ffprobe.exe"), "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(H / "assets" / "vo.wav")], capture_output=True, text=True).stdout) + 0.7, 2)

_dims = {}
def dims(src):
    if src not in _dims:
        o = subprocess.run([FF.replace("ffmpeg.exe", "ffprobe.exe"), "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0", src_path(src)], capture_output=True, text=True).stdout.strip().split(",")
        _dims[src] = (int(o[0]), int(o[1]))
    return _dims[src]


def win(src, cx=0.5, cy=0.5, s=1.0, R=9 / 16):
    """Window of aspect R from the source, s = share of the largest such window, centred at (cx, cy) in source fractions."""
    w, h = dims(src); A = w / h
    wf, hf = (R / A * s, s) if A > R else (s, A / R * s)
    x0, y0 = min(max(cx - wf / 2, 0), 1 - wf), min(max(cy - hf / 2, 0), 1 - hf)
    return (round(x0, 4), round(y0, 4), round(x0 + wf, 4), round(y0 + hf, 4))


OFF = {"yt:" + l.split()[0]: float(l.split()[2]) for l in open(H / "tools" / "sec.txt") if l.strip()}   # section files start at their section start


def V(src, ss, cx=0.5, cy=0.5, s=1.0, zoom=(1.0, 1.06), speed=1.0, dark=0.0):
    ss = round(ss - OFF.get(src, 0.0), 3)
    def f(a, b):
        if not os.path.exists(src_path(src)): print("MISSING", src); return
        crop = win(src, cx, cy, s)
        video(a, b, src, ss, speed, crop=None if crop == (0, 0, 1, 1) else crop, zoom=zoom, w=1080, h=1920, grade=GRADE, dark=dark)
    return f


def strip(i, src, ss, cx=0.5, cy=0.5):
    """One of the five 1080x384 bands on the end card."""
    ss = round(ss - OFF.get(src, 0.0), 3)
    def f(a, b):
        if not os.path.exists(src_path(src)): print("MISSING", src); return
        L.OUT_W, L.OUT_H = 1080, 384
        video(a, b, src, ss, 1.0, crop=win(src, cx, cy, 1.0, R=1080 / 384), zoom=(1.0, 1.05), x=0, y=i * 384, w=1080, h=384, grade=GRADE)
        L.OUT_W, L.OUT_H = 1080, 1920
    return f


def montage(*shots):
    """Several quick cuts inside one beat."""
    def f(a, b):
        n = len(shots)
        for k, fn in enumerate(shots): fn(a + (b - a) * k / n, a + (b - a) * (k + 1) / n)
    return f


CSS = """*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1080px;height:1920px;overflow:hidden;background:#000}
#root{position:relative;width:1080px;height:1920px;overflow:hidden;background:#000}
.vw{position:absolute;overflow:hidden}
.fit{position:absolute;left:0;top:0;width:100%;height:100%;object-fit:cover}
#hud{position:absolute;left:0;top:0;width:1080px;height:1920px;z-index:900}
.pre{position:absolute;width:1px;height:1px;opacity:0}"""

if __name__ == "__main__":
    from shots import SHOTS
    ST.update(off=0.0, n=10)
    for i, (a, fn) in enumerate(SHOTS):
        b = SHOTS[i + 1][0] if i + 1 < len(SHOTS) else END
        fn(a, b)
    doc = f'''<!doctype html>
<html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800&family=JetBrains+Mono:wght@700&display=block">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/js/hud.js"></script>
<style>{CSS}</style>
</head><body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{END:.3f}" data-width="1080" data-height="1920">
{chr(10).join(html)}
<canvas id="hud" class="clip" width="1080" height="1920" data-start="0" data-duration="{END:.3f}" data-track-index="3"></canvas>
<img class="pre" src="assets/gen/hud_orca.png" alt=""><img class="pre" src="assets/gen/hud_diver.png" alt="">
<div class="pre" style="font-family:Inter;font-weight:800">.</div><div class="pre" style="font-family:'JetBrains Mono';font-weight:700">.</div>
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
{{const c=document.getElementById("hud").getContext("2d");tl.to({{}},{{duration:{END:.3f},ease:"none",onUpdate:function(){{HUD.draw(c,this.time());}}}},0);}}
tl.set({{}}, {{}}, {END:.3f});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body></html>
'''
    (H / "index.html").write_text(doc, encoding="utf-8")
    json.dump(sorted(set(u[0] for u in usage)), open(H / "usage.json", "w"), indent=0)
    print(len(html), "layers", len(SHOTS), "shots, END", END)
