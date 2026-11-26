"""Test page: every canvas scene for 12 s in a row, written to index.html. gallery.py [scene ...]"""
import sys, json
from pathlib import Path
H = Path(__file__).resolve().parent.parent
ALL = {"rise": {"d": 12, "surface": [-260, 60]}, "pod": {"prey": "blue", "n": 8}, "lineup": {"pxPerM": 56, "items": [["orca", 8.5, 0.5], ["shark", 6, 1.5], ["hump", 15, 2.5], ["blue", 25, 3.5]], "gap": 190},
       "dive": {"d": 12, "tDive": 4}, "clicks": {"tEcho": 2}, "essex": {"t1": 3, "t2": 8, "tSink": 9.5}, "rams": {}, "babysit": {}, "longline": {"steal": 1},
       "marguerite": {"tForm": 3, "tOrcas": 1, "attack": 1, "tPull": 5, "tBack": 8, "helpers": 1}, "forage": {}, "race": {}, "surround": {"tClose": 5, "tBreath": 7},
       "ram": {"tHit": 2.5}, "bigbang": {"tFire": 2.5}, "avoid": {"tTurn": 3}, "pump": {"tUp": 2, "tRelease": 6}, "layers": {"squid": 1}, "descend": {"d": 12}, "wavewash": {"tDive": 4.5}}
names = sys.argv[1:] or list(ALL)
D = 12
imgs = {"img_sperm": "il_sperm", "img_orca": "il_orca", "img_blue": "il_blue", "img_hump": "il_hump", "img_gray": "il_gray", "img_squid": "squid_3d"}
html, js = [], []
for k, n in enumerate(names):
    html.append(f'<canvas id="c{k}" class="clip" width="1920" height="1080" data-start="{k * D}" data-duration="{D}" data-track-index="1"></canvas>')
    js.append(f'{{const c=document.getElementById("c{k}").getContext("2d");tl.to({{}},{{duration:{D},ease:"none",onUpdate:function(){{SC.{n}(c,this.time(),{json.dumps(ALL[n])});}}}},{k * D});}}')
doc = f'''<!doctype html><html><head><meta charset="utf-8">
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<script src="assets/js/ocean.js"></script><script src="assets/js/scenes.js"></script>
<style>*{{margin:0;padding:0}}html,body{{width:1920px;height:1080px;overflow:hidden;background:#000}}#root{{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000}}canvas{{position:absolute;left:0;top:0;width:1920px;height:1080px}}.hid{{display:none}}</style>
</head><body><div id="root" data-composition-id="main" data-start="0" data-duration="{len(names) * D}" data-width="1920" data-height="1080">
{"".join(f'<img id="{i}" class="hid" src="assets/cut/{f}.png" alt="">' for i, f in imgs.items())}
{chr(10).join(html)}
</div><script>const tl=gsap.timeline({{paused:true}});
{chr(10).join(js)}
window.__timelines=window.__timelines||{{}};window.__timelines["main"]=tl;</script></body></html>'''
(H / "index.html").write_text(doc, encoding="utf-8")
print(",".join(f"{k * D + 7}" for k in range(len(names))))
