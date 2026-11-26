"""AI Equator: AI Can Now Edit Another AI's Brain. Builds index.html from lib.py + scenes1.py + scenes2.py. Voice only, no music."""
from lib import H, html, tl
import scenes1, scenes2  # noqa: F401  (each file appends its scenes)
from toon import TOON_CSS
from props import PROPS_CSS

END = 691.30
CSS = """
@font-face{font-family:"Caveat";src:url("assets/fonts/caveat-600.woff2") format("woff2");font-weight:600}
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1920px;height:1080px;overflow:hidden;background:#000}
#root{position:relative;width:1920px;height:1080px;overflow:hidden;background:#000;font-family:Inter,sans-serif;color:#fff}
.bg{position:absolute;inset:0;background:radial-gradient(900px 600px at 18% 22%,rgba(30,52,110,.45),transparent 70%),radial-gradient(800px 560px at 84% 78%,rgba(22,40,96,.40),transparent 70%),#000}
.grid{position:absolute;inset:-60px;background-image:linear-gradient(rgba(70,100,180,.07) 1.5px,transparent 1.5px),linear-gradient(90deg,rgba(70,100,180,.07) 1.5px,transparent 1.5px);background-size:120px 120px;-webkit-mask-image:radial-gradient(ellipse at 50% 50%,#000 30%,transparent 80%)}
.scene{position:absolute;left:0;top:0;width:1920px;height:1080px;overflow:hidden}
.sc{position:absolute;inset:0;opacity:0}
.a{position:absolute;opacity:0}
.h{font-weight:700;letter-spacing:-.025em;line-height:1.08}
.big{font-weight:900;letter-spacing:-.03em;line-height:1;font-variant-numeric:tabular-nums}
.lab{color:#8A8F98;font-weight:400;line-height:1.2}
.g{color:#8A8F98}
.blue{color:#5B8FF0}
.mono{font-family:"JetBrains Mono",monospace}
.note{font-family:"Caveat",cursive;font-weight:600;color:#F0A818;line-height:1.05;white-space:nowrap}
.arw{position:absolute;display:block}
.src{font-size:22px;color:#6B7079}
.card{background:#0D0F14;border:1.5px solid #2A2E37;border-radius:12px;padding:26px 30px;box-shadow:0 20px 50px rgba(0,0,0,.45)}
.card.sel{border-color:#5B8FF0;background:#0B1430}
.card.red{border-color:rgba(248,81,73,.7);background:#1A0C0E}
.card.ok{border-color:rgba(63,185,80,.7);background:#0B1A10}
.card.dash{border-style:dashed;background:rgba(13,15,20,.6)}
.card.lvl.hi{border-color:#F0A818}
.card.lvl.crit{border-color:#F85149;background:#1A0C0E}
.card.lvl.crit .ct{color:#F85149}
.ct{font-size:40px;font-weight:700;letter-spacing:-.02em;line-height:1.15}
.cs{font-size:26px;color:#8A8F98;margin-top:10px}
.li{font-size:36px;font-weight:700;letter-spacing:-.015em}
.cb{font-size:30px;line-height:1.3;padding:16px 22px;border-radius:16px;margin-top:14px;max-width:560px}
.cb.u{background:#1E2A44;margin-left:auto;width:max-content}
.cb.bot{background:#1A1C22;color:#D5D8DE}
.mac{border-radius:12px;overflow:hidden;background:#111;box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 0 1.5px #2A2E37}
.mbar{height:44px;background:#1C1D21;position:relative}
.mbar i{position:absolute;top:15px;width:14px;height:14px;border-radius:50%;background:#3A3C42}
.mbar i:nth-child(1){left:18px;background:#ff5f57}.mbar i:nth-child(2){left:42px;background:#febc2e}.mbar i:nth-child(3){left:66px;background:#28c840}
.murl{position:absolute;left:50%;top:8px;transform:translateX(-50%);height:28px;padding:0 70px;background:#121316;border-radius:7px;font-size:16px;line-height:28px;color:#A9ADB5;white-space:nowrap}
.mbody{overflow:hidden;position:relative}
.mbody img{display:block}
.im img,.logo img{display:block;object-fit:contain}
.meme{border-radius:14px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 0 3px #fff}
.meme img{display:block;object-fit:cover}
.vwrap{position:absolute;border-radius:14px;overflow:hidden;opacity:0}
.vcard{border-radius:14px;overflow:hidden;box-shadow:0 30px 80px rgba(0,0,0,.7),0 0 0 1.5px #2A2E37;background:#000}
.person img{display:block;border-radius:16px;object-fit:cover;border:1.5px solid #2A2E37}
.pn{font-size:38px;font-weight:700;margin-top:18px}
.pr{font-size:26px;color:#8A8F98;margin-top:4px}
.track{position:absolute;height:44px;border-radius:6px;background:#15181F}
.fill{position:absolute;height:44px;border-radius:6px;background:#4A505C}
.fill.hero{background:#5B8FF0}
.bl{font-weight:700;white-space:nowrap}
.bvl{font-weight:900;font-variant-numeric:tabular-nums}
.bugrow{display:flex;gap:12px;justify-content:center;margin-top:18px}
.bugrow i{display:block;width:16px;height:16px;border-radius:50%;background:#3A3E47}
.codewall{font-size:27px;line-height:1.75;color:#6B7079}
.cl{padding:0 10px;border-radius:4px;white-space:nowrap}
.strike{text-decoration:line-through;text-decoration-color:#F0A818;text-decoration-thickness:5px}
.strike2{color:#8A8F98;text-decoration:line-through;text-decoration-color:#F0A818;text-decoration-thickness:4px}
.tline{position:absolute;height:2px;background:#2A2E37}
.tp i.dot{display:block;width:30px;height:30px;border-radius:50%;background:#0D0F14;border:3px solid #5A606B}
.prow{display:flex;align-items:baseline;gap:40px;margin-top:26px;font-size:84px;font-weight:900;letter-spacing:-.03em}
.prow .pl{font-size:34px;font-weight:400;color:#8A8F98;width:150px}
.prow .new{color:#5B8FF0}
.tw img{filter:drop-shadow(0 24px 50px rgba(0,0,0,.6))}
.dimbg{position:absolute;inset:0;background:rgba(0,0,0,.55)}
.person0 img{border-radius:16px;object-fit:cover;border:1.5px solid #2A2E37}
.ovp{background:rgba(5,7,12,.78);padding:8px 20px;border-radius:12px;box-shadow:0 10px 30px rgba(0,0,0,.5)}
.ovc{background:rgba(11,20,48,.92);border:1.5px solid #5B8FF0;border-radius:10px;padding:12px 22px;font-size:32px;font-weight:700;color:#fff;white-space:nowrap}
.rowbox{border:3px solid #F0A818;border-radius:8px;box-shadow:0 0 24px rgba(240,168,24,.45)}
.ovc.red{border-color:#F85149;background:rgba(40,10,12,.92)}
.layer{background:#1A2236;border:3px solid #3A4A72;border-radius:8px}
.lnum{font-family:"JetBrains Mono",monospace;font-size:18px;color:#8A8F98;text-align:center;margin-top:-30px}
.tp i.dot.hero{border-color:#5B8FF0;background:#5B8FF0;box-shadow:0 0 24px #5B8FF0}
"""

doc = f'''<!doctype html>
<html lang="en" data-resolution="landscape">
<head>
<meta charset="UTF-8" /><meta name="viewport" content="width=1920, height=1080" />
<script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
<style>{CSS}{TOON_CSS}{PROPS_CSS}</style>
</head>
<body>
<div id="root" data-composition-id="main" data-start="0" data-duration="{END}" data-width="1920" data-height="1080">
<div class="bg"><div class="grid" id="grid"></div></div>
{chr(10).join(html)}
<audio id="vo" class="clip" src="assets/vo.mp3" data-start="0" data-duration="{END}" data-volume="1" data-track-index="10"></audio>
</div>
<script>
const tl = gsap.timeline({{ paused: true }});
function count(sel, t, a, b, dec, pre, suf, d) {{
  const el = document.querySelector(sel), o = {{ v: a }};
  const f = (v) => pre + Number(v).toLocaleString("en-US", {{ minimumFractionDigits: dec, maximumFractionDigits: dec }}) + suf;
  el.textContent = f(a);
  tl.fromTo(o, {{ v: a }}, {{ v: b, duration: d, ease: "power2.out", onUpdate: () => {{ el.textContent = f(o.v); }} }}, t);
}}
tl.fromTo("#grid", {{ x: 0, y: 0 }}, {{ x: -120, y: -60, duration: {END}, ease: "none" }}, 0);
{chr(10).join(tl)}
tl.set({{}}, {{}}, {END});
window.__timelines = window.__timelines || {{}};
window.__timelines["main"] = tl;
</script>
</body>
</html>
'''
(H / "index.html").write_text(doc, encoding="utf-8")
print("built", len(html), "scenes,", len(tl), "tweens")
