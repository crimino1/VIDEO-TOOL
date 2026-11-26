"""Write hf/index.html: WebGL world canvas + overlays (stakes title, one-word captions, callout tags, bursts).
Timing comes from hf/assets/js/cues.js (made by cues.py from the voice). Audio is muxed after render."""
import json, re, html
from pathlib import Path

HF = Path(__file__).resolve().parents[1] / "hf"
src = (HF / "assets/js/cues.js").read_text()
C = json.loads(re.search(r"window.CUE=(\{.*?\});", src).group(1))
WORDS = json.loads(re.search(r"window.WORDS=(\[.*\]);", src, re.S).group(1))
DUR = round(C["end"] + 1.3, 2)
YELLOW = {"footprints", "freeze", "snowdrift", "drift", "30", "freezing", "stale", "stick", "glow", "soldiers", "poles", "logs", "wood", "storm", "path", "ice", "fox", "bunker"}

caps = []
for i, (w, t, e) in enumerate(WORDS):
    nxt = WORDS[i + 1][1] if i + 1 < len(WORDS) else e + 0.4
    d = max(0.08, round(nxt - t, 3))
    word = re.sub(r"[^\w'’-]", "", w)
    word = word[:1].upper() + word[1:]
    cls = "w y" if word.lower() in YELLOW else "w"
    caps.append(f'<div id="c{i}" class="clip cap" data-start="{t:.3f}" data-duration="{d:.3f}"><span class="{cls}">{html.escape(word)}</span></div>')

# callouts: (id, label, anchor var, start, dur, tag offset px)
CALL = [("cs", "SNOW CAVE", "cave", C["cave"], 2.3, (60, -190)),
        ("cv", "AIR VENT", "vent", C["vent"], 2.2, (60, -150))]
# bursts: (id, text, anchor var, start, offset px, tilt)
BURST = [("b1", "BRRR!", "hero", C["freeze"] + 0.15, (70, -120), -8),
         ("b2", "CLUNK!", "pole", C["wood"] - 0.2, (-60, -40), 7),
         ("b3", "CLUNK!", "pole", C["wood"] + 0.45, (80, 30), -6),
         ("b4", "WHOOSH!", "lip", C["storm"] + 0.3, (0, -260), -5)]

calls = "\n".join(
    f'<div id="{i}" class="clip anch" data-start="{s:.3f}" data-duration="{d}" style="left:clamp(170px,var(--{a}-x),910px);top:clamp(260px,var(--{a}-y),1700px)">'
    f'<svg class="lead" width="600" height="400" style="left:-300px;top:-200px"><line id="{i}l" x1="300" y1="200" x2="{300 + ox + (0 if ox > 0 else 230)}" y2="{200 + oy + 46}" /></svg>'
    f'<div id="{i}d" class="dot"></div><div id="{i}t" class="tag" style="left:{ox}px;top:{oy}px">{lab}</div></div>'
    for i, lab, a, s, d, (ox, oy) in CALL)
star = ("<svg viewBox='-100 -100 200 200' class='star'><polygon points='" +
        " ".join(f"{(92 if k % 2 == 0 else 58) * __import__('math').cos(k * 3.14159 / 11):.1f},{(70 if k % 2 == 0 else 44) * __import__('math').sin(k * 3.14159 / 11):.1f}" for k in range(22)) +
        "' /></svg>")
bursts = "\n".join(
    f'<div id="{i}" class="clip anch" data-start="{s:.3f}" data-duration="0.95" style="left:clamp(170px,var(--{a}-x),910px);top:clamp(260px,var(--{a}-y),1700px)">'
    f'<div id="{i}i" class="burst" style="left:{ox}px;top:{oy}px;rotate:{r}deg">{star}<b>{txt}</b></div></div>'
    for i, txt, a, s, (ox, oy), r in BURST)

tw = []
for i, *_ in CALL:
    s = [c for c in CALL if c[0] == i][0][3]
    tw.append(f'tl.fromTo("#{i}t",{{opacity:0,x:-30}},{{opacity:1,x:0,duration:0.25,ease:"power2.out"}},{s:.3f});')
    tw.append(f'tl.fromTo("#{i}l",{{opacity:0}},{{opacity:1,duration:0.2}},{s:.3f});')
    tw.append(f'tl.fromTo("#{i}d",{{scale:0}},{{scale:1,duration:0.18,ease:"power2.out"}},{s:.3f});')
for i, txt, a, s, o, r in BURST:
    tw.append(f'tl.fromTo("#{i}i",{{scale:0.3,opacity:1}},{{scale:1,duration:0.1,ease:"power2.out"}},{s:.3f});')
    tw.append(f'tl.to("#{i}i",{{opacity:0,duration:0.2}},{s + 0.72:.3f});')
for i, (w, t, e) in enumerate(WORDS):
    tw.append(f'tl.fromTo("#c{i} span",{{scale:0.86}},{{scale:1,duration:0.07,ease:"power2.out"}},{t:.3f});')
tw.append(f'tl.fromTo("#toutb",{{scale:0.4,opacity:0}},{{scale:1,opacity:1,duration:0.18,ease:"power2.out"}},{C["outside"]:.3f});')
tw.append(f'tl.fromTo("#tinb",{{scale:0.4,opacity:0}},{{scale:1,opacity:1,duration:0.18,ease:"power2.out"}},{C["inhere"]:.3f});')
tw.append('tl.fromTo("#t1",{opacity:0,y:-14},{opacity:1,y:0,duration:0.18,ease:"power2.out"},0.05);')
tw.append('tl.to("#t1",{opacity:0,duration:0.2},2.75);')

page = f"""<!doctype html>
<html lang="en"><head><meta charset="UTF-8" />
<meta name="viewport" content="width=1080, height=1920" />
<script src="assets/js/gsap.min.js"></script>
<script type="importmap">{{"imports":{{"three":"./assets/lib/three/build/three.module.js","three/addons/":"./assets/lib/three/jsm/"}}}}</script>
<style>
@font-face {{ font-family: "Fredoka"; src: url("assets/fonts/Fredoka.ttf"); font-weight: 300 700; }}
* {{ margin:0; padding:0; box-sizing:border-box; }}
html, body {{ width:1080px; height:1920px; overflow:hidden; background:#000; }}
#root {{ position:relative; width:1080px; height:1920px; font-family:"Fredoka", sans-serif; }}
#g3 {{ position:absolute; left:0; top:0; width:1080px; height:1920px; }}
.cap {{ position:absolute; left:0; width:1080px; top:1110px; text-align:center; z-index:20; }}
.cap .w {{ display:inline-block; font-weight:700; font-size:84px; color:#fff; letter-spacing:0.5px;
  text-shadow:0 4px 0 rgba(0,0,0,.45), 0 0 18px rgba(0,0,0,.55); -webkit-text-stroke:2px rgba(0,0,0,.35); }}
.cap .y {{ color:#F5C531; }}
#t1 {{ position:absolute; left:0; width:1080px; top:118px; text-align:center; z-index:21; font-weight:700; font-size:74px; line-height:1.08;
  color:#fff; text-shadow:0 4px 0 rgba(0,0,0,.5), 0 0 16px rgba(0,0,0,.6); -webkit-text-stroke:2.5px rgba(0,0,0,.55); }}
#t1 .y {{ color:#F5C531; }}
.anch {{ position:absolute; width:0; height:0; z-index:22; }}
.lead {{ position:absolute; overflow:visible; }}
.lead line {{ stroke:#F5C531; stroke-width:4; }}
.dot {{ position:absolute; left:-9px; top:-9px; width:18px; height:18px; border-radius:50%; background:#F5C531; box-shadow:0 0 0 3px rgba(0,0,0,.35); }}
.tag {{ position:absolute; white-space:nowrap; background:#F5C531; color:#111; font-weight:700; font-size:44px; padding:6px 20px 4px; border-radius:6px;
  box-shadow:0 5px 0 rgba(0,0,0,.35); }}
.temp {{ position:absolute; transform:translate(-50%,-50%); font-weight:700; font-size:62px; padding:4px 18px 2px; border-radius:10px; color:#fff;
  -webkit-text-stroke:2px rgba(0,0,0,.35); box-shadow:0 5px 0 rgba(0,0,0,.3); white-space:nowrap; }}
.temp.cold {{ background:#3f8fd8; }} .temp.warm {{ background:#e8902f; }}
.burst {{ position:absolute; width:300px; height:220px; margin:-110px 0 0 -150px; }}
.burst .star {{ position:absolute; inset:0; width:300px; height:220px; overflow:visible; }}
.burst polygon {{ fill:#F5C531; stroke:#111; stroke-width:6; stroke-linejoin:round; }}
.burst b {{ position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:60px; color:#fff;
  -webkit-text-stroke:3px #111; paint-order:stroke fill; }}
</style></head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{DUR}" data-width="1080" data-height="1920">
<canvas id="g3" width="1080" height="1920"></canvas>
<div id="t1" class="clip" data-start="0" data-duration="3.0">THEY'RE FOLLOWING<br><span class=\"y\">YOUR TRACKS</span></div>
{chr(10).join(caps)}
{calls}
{bursts}
<div id="tout" class="clip anch" data-start="{C['outside']:.3f}" data-duration="{C['cave'] - C['outside'] + 0.6:.3f}" style="left:clamp(150px,var(--out-x),930px);top:clamp(300px,var(--out-y),1650px)"><div id="toutb" class="temp cold">-30°C</div></div>
<div id="tin" class="clip anch" data-start="{C['inhere']:.3f}" data-duration="{C['cave'] - C['inhere'] + 0.6:.3f}" style="left:clamp(150px,var(--in-x),930px);top:clamp(300px,var(--in-y),1650px)"><div id="tinb" class="temp warm">0°C</div></div>
</div>
<script src="assets/js/cues.js"></script>
<script type="module" src="assets/js/world.js"></script>
<script>
const tl = gsap.timeline({{ paused: true }});
{chr(10).join(tw)}
tl.set({{}}, {{}}, {DUR});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body></html>
"""
(HF / "index.html").write_text(page, encoding="utf-8")
print(f"index.html: {len(WORDS)} captions, {len(CALL)} callouts, {len(BURST)} bursts, {DUR}s")
