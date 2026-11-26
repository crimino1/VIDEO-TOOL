"""Writes index.html from assets/js/shots.js: trims stock to strict 16:9, adds video clips, sound and the stage."""
import json, re, subprocess
from pathlib import Path
HERE = Path(__file__).resolve().parent.parent
BIN = r"C:\Users\daggu222105\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1-full_build\bin"
src = (HERE / "assets" / "js" / "shots.js").read_text(encoding="utf-8")
body = src[src.index("const SHOTS = [") + len("const SHOTS = ") :]
body = body[: body.rindex("]") + 1]
END = float(re.search(r"FILM_END = ([\d.]+)", src).group(1))
items = re.findall(r"\[([\d.]+),\s*\"(@?[\w]+)\"(?:,\s*([\d.]+))?(?:,\s*([\d.]+))?", body)
info = json.loads((HERE / "stock" / "info.json").read_text(encoding="utf-8"))
shots = [(float(a), n, float(o) if o else 0, float(z) if z else 1) for a, n, o, z in items]
clips, tl, stock_total = [], [], 0
for i, (a, name, off, zoom) in enumerate(shots):
    b = shots[i + 1][0] if i + 1 < len(shots) else END
    assert b > a, (a, name)
    if not name.startswith("@"): continue
    f = name[1:]; d = b - a; stock_total += d
    meta = info[f]
    assert 1.76 <= meta["w"] / meta["h"] <= 1.79, f
    assert off + d <= meta["d"] + 0.01, (f, off, d, meta["d"])
    clips.append(f'<div class="frame" id="w{i}"><video id="s{i}" class="clip full" src="stock/raw/{f}.mp4" muted playsinline data-start="{a:.2f}" data-duration="{d:.2f}" data-media-start="{off}" data-track-index="1"></video></div>')
    z0 = zoom; z1 = zoom * 1.04
    tl.append(f'tl.fromTo("#w{i}",{{scale:{z0}}},{{scale:{z1:.3f},duration:{d:.2f},ease:"none"}},{a:.2f});')
print("stock", round(stock_total, 1), "s =", round(stock_total / END * 100, 1), "%  code", round(100 - stock_total / END * 100, 1), "%")
mus = []
for i, s in enumerate(range(0, int(END), 600)):
    d = min(599.9, END - s)
    mus.append(f'<audio id="m{i}" class="clip" src="assets/music/LongNoteFour.mp3" data-start="{s}" data-duration="{d:.2f}" data-volume="0.62" data-fade-in="2" data-fade-out="3" data-track-index="11"></audio>')
html = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>
*{{margin:0;padding:0;box-sizing:border-box}}
html,body{{width:1920px;height:1080px;overflow:hidden;background:#000}}
#root{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000;font-family:"League Gothic",sans-serif}}
#stage{{position:absolute;left:0;top:0;width:1920px;height:1080px}}
.frame{{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden;z-index:5}}
.full{{position:absolute;left:0;top:0;width:1920px;height:1080px;object-fit:cover}}
#grain{{position:absolute;left:0;top:0;width:1920px;height:1080px;z-index:9;background:radial-gradient(ellipse at center,rgba(4,10,14,0) 62%,rgba(4,10,14,.28) 100%)}}
#fontprobe{{position:absolute;left:-3000px;font-family:"League Gothic"}}
</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1920" data-height="1080">
<svg id="stage" viewBox="0 0 1920 1080" data-layout-allow-overflow data-layout-allow-overlap data-layout-ignore></svg>
{chr(10).join(clips)}
<div id="grain"></div>
<audio id="vo" class="clip" src="assets/vo.mp3" data-start="0" data-duration="{END}" data-volume="2.2" data-track-index="10"></audio>
{chr(10).join(mus)}
<div id="fontprobe">polar</div>
</div>
<script src="assets/js/core.js"></script>
<script src="assets/js/bear.js"></script>
<script src="assets/js/world.js"></script>
<script src="assets/js/actors.js"></script>
<script src="assets/js/maps.js"></script>
<script src="assets/js/scenes1.js"></script>
<script src="assets/js/scenes2.js"></script>
<script src="assets/js/shots.js"></script>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tl)}
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
<script src="assets/js/main.js"></script>
</body>
</html>
'''
(HERE / "index.html").write_text(html, encoding="utf-8")
print("written", len(clips), "stock shots of", len(shots))
